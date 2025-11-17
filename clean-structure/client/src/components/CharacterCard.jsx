import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { rollAttack, rollD20, getNarration } from '../utils/dice'
import { getDemoCharacter } from '../data/demo-characters'
import { populateCharacterData } from '../../../shared/data-loader'
import CharacterModes from './CharacterModes'
import SpellBrowser from './SpellBrowser'
import AbilityBrowser from './AbilityBrowser'
import EquipmentBrowser from './EquipmentBrowser'
import InventoryManager from './inventory/InventoryManager'
import EquipmentSlots from './inventory/EquipmentSlots'
import DiceRoller from './DiceRoller'
import AbilityCard from './AbilityCard'
import startingEquipment from '../../../data/starting-equipment.json'
import './CharacterCard.css'

function CharacterCard() {
  const { characterId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('stats') // stats, skills, abilities, spells, equipment
  const [equipmentView, setEquipmentView] = useState('inventory') // 'inventory' or 'slots'
  const [mood, setMood] = useState('Contemplative')
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [character, setCharacter] = useState(null)
  const [currentHP, setCurrentHP] = useState(104)
  const [loading, setLoading] = useState(true)
  const [showSpellBrowser, setShowSpellBrowser] = useState(false)
  const [showAbilityBrowser, setShowAbilityBrowser] = useState(false)
  const [showEquipmentBrowser, setShowEquipmentBrowser] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [selectedSpellId, setSelectedSpellId] = useState(null)
  const [selectedAbilityId, setSelectedAbilityId] = useState(null)
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(null)
  const [concentration, setConcentration] = useState(null) // {spell: {name, effect}, target: string}
  const [logCollapsed, setLogCollapsed] = useState(false)
  const [tabsCollapsed, setTabsCollapsed] = useState(false)
  const [showDiceRoller, setShowDiceRoller] = useState(false)
  const [expandedMessages, setExpandedMessages] = useState({}) // Track which messages are expanded
  const [editingStats, setEditingStats] = useState(false)
  const [tempStats, setTempStats] = useState({})
  const [viewingAbility, setViewingAbility] = useState(null) // Ability/spell card to display as modal
  const [showAddItem, setShowAddItem] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [goldAmount, setGoldAmount] = useState(0)
  const [editingProfile, setEditingProfile] = useState(false)
  const [tempBackstory, setTempBackstory] = useState('')
  const [tempBehavior, setTempBehavior] = useState('')
  const [tempAIBehavior, setTempAIBehavior] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [autoSpeak, setAutoSpeak] = useState(false) // Toggle for auto-speaking character responses
  const messagesEndRef = useRef(null)
  const audioRef = useRef(null) // For playing ElevenLabs audio

  // Load character data
  useEffect(() => {
    const loadCharacter = async () => {
      const loadedCharacter = getDemoCharacter(characterId)
      if (loadedCharacter) {
        // Populate with actual D&D data (spells, abilities, equipment)
        const populatedCharacter = populateCharacterData({ ...loadedCharacter })
        setCharacter(populatedCharacter)
        setCurrentHP(populatedCharacter.hp.current)
        setMessages([populatedCharacter.initialMessage])
      }
      setLoading(false)
    }

    loadCharacter()
  }, [characterId])

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Stop audio playback when auto-speak is disabled
  useEffect(() => {
    if (!autoSpeak && audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
      // Also stop browser speech synthesis if active
      window.speechSynthesis.cancel()
    }
  }, [autoSpeak])

  if (loading || !character) {
    return <div className="character-loading">Loading character...</div>
  }

  // Helper to get item icon by category
  const getItemIcon = (category) => {
    const icons = {
      weapon: '⚔️',
      armor: '🛡️',
      shield: '🛡️',
      potion: '🧪',
      gear: '🎒',
      ring: '💍',
      scroll: '📜'
    }
    return icons[category] || '📦'
  }

  // Get HP display class based on current HP
  const getHPClass = () => {
    const percentage = currentHP / character.hp.max
    if (percentage <= 0.25) return 'critical'
    if (percentage <= 0.6) return 'damaged'
    return ''
  }

  // Handle combat abilities
  const handleAbilityClick = (ability) => {
    const details = ability.details || ability

    // Get icon for ability
    const getIcon = () => {
      const categoryIcons = {
        'combat': '⚔️',
        'utility': '🔧',
        'defensive': '🛡️',
        'spell': '✨',
        'social': '💬'
      }
      return categoryIcons[ability.category] || '⭐'
    }

    const icon = getIcon()
    const abilityName = details.name || ability.name
    const actionType = details.actionType

    // Handle spells
    if (ability.category === 'spell') {
      const spellcastingAbility = character.spellcasting?.ability || 'int'
      const spellMod = Math.floor(((character.stats?.[spellcastingAbility] || 10) - 10) / 2)
      const spellAttackBonus = character.proficiencyBonus + spellMod

      // Use special format for clickable spell name: [SPELL:spell-id:Spell Name]
      let message = `${icon} **Cast [SPELL:${ability.abilityId}:${abilityName}]**`

      // Check if spell requires attack roll (look for "spell attack" in description)
      const requiresAttack = details.description?.toLowerCase().includes('spell attack') ||
                            details.description?.toLowerCase().includes('ranged spell attack') ||
                            details.description?.toLowerCase().includes('melee spell attack')

      if (requiresAttack) {
        // Roll spell attack
        const attackRoll = Math.floor(Math.random() * 20) + 1
        const attackTotal = attackRoll + spellAttackBonus

        message += `\n\n🎯 Spell Attack: d20(${attackRoll}) + ${spellAttackBonus} = **${attackTotal}**`

        if (attackRoll === 20) {
          message += ' 🎉 **CRITICAL HIT!**'
        } else if (attackRoll === 1) {
          message += ' 💀 *Critical miss...*'
        }

        // Try to extract damage from description
        const damageMatch = details.description?.match(/(\d+d\d+(?:\s*\+\s*\d+)?)\s+(\w+)\s+damage/i)
        if (damageMatch) {
          const damageFormula = damageMatch[1]
          const damageType = damageMatch[2]
          const diceMatch = damageFormula.match(/(\d+)d(\d+)/)

          if (diceMatch) {
            const [_, numDice, diceSize] = diceMatch
            let totalDamage = 0
            const rolls = []

            for (let i = 0; i < parseInt(numDice); i++) {
              const roll = Math.floor(Math.random() * parseInt(diceSize)) + 1
              rolls.push(roll)
              totalDamage += roll
            }

            // Check for modifier in formula
            const modMatch = damageFormula.match(/\+\s*(\d+)/)
            if (modMatch) {
              totalDamage += parseInt(modMatch[1])
            }

            message += `\n💥 Damage: ${damageFormula} = **${totalDamage}** ${damageType} [${rolls.join(', ')}]`
          }
        }
      } else if (details.description?.toLowerCase().includes('saving throw')) {
        // Spell with saving throw
        const saveDC = character.spellcasting?.spellSaveDC || (8 + character.proficiencyBonus + spellMod)
        message += `\n\n🛡️ Save DC: **${saveDC}**`

        // Try to extract damage
        const damageMatch = details.description?.match(/(\d+d\d+(?:\s*\+\s*\d+)?)\s+(\w+)\s+damage/i)
        if (damageMatch) {
          const damageFormula = damageMatch[1]
          const damageType = damageMatch[2]
          const diceMatch = damageFormula.match(/(\d+)d(\d+)/)

          if (diceMatch) {
            const [_, numDice, diceSize] = diceMatch
            let totalDamage = 0
            const rolls = []

            for (let i = 0; i < parseInt(numDice); i++) {
              const roll = Math.floor(Math.random() * parseInt(diceSize)) + 1
              rolls.push(roll)
              totalDamage += roll
            }

            const modMatch = damageFormula.match(/\+\s*(\d+)/)
            if (modMatch) {
              totalDamage += parseInt(modMatch[1])
            }

            message += `\n💥 Damage (on failed save): ${damageFormula} = **${totalDamage}** ${damageType} [${rolls.join(', ')}]`
          }
        }
      } else {
        // Check for healing spells (like Cure Wounds)
        const healingMatch = details.description?.match(/(\d+)d(\d+)\s*\+\s*your\s+spellcasting\s+ability\s+modifier/i)
        if (healingMatch && (details.description?.toLowerCase().includes('regain') || details.description?.toLowerCase().includes('healing'))) {
          const [_, numDice, diceSize] = healingMatch
          let totalHealing = 0
          const rolls = []

          for (let i = 0; i < parseInt(numDice); i++) {
            const roll = Math.floor(Math.random() * parseInt(diceSize)) + 1
            rolls.push(roll)
            totalHealing += roll
          }

          // Add spellcasting ability modifier
          totalHealing += spellMod
          const modText = spellMod >= 0 ? `+${spellMod}` : `${spellMod}`

          message += `\n\n🎲 **Healing Roll**: ${numDice}d${diceSize}${modText} = [${rolls.join(', ')}] ${modText} = **${totalHealing}**`
          message += `\n💚 **Healing**: ${totalHealing} HP restored!`

          // Actually heal the character
          const oldHP = currentHP
          const newHP = Math.min(currentHP + totalHealing, character.hp.max)
          setCurrentHP(newHP)

          if (newHP > oldHP) {
            message += `\n💗 HP: ${oldHP} → **${newHP}** / ${character.hp.max}`
          }
        } else {
          // Utility spell - just show what it does
          if (details.shortDescription) {
            message += `\n\n${details.shortDescription}`
          }
        }
      }

      addMessage(message, 'character', 'Focused')
      return
    }

    // Handle active combat abilities with damage (like Colossus Slayer)
    // Only roll if it has damage AND is meant to be used actively
    if ((details.damage || ability.damage) && ability.category === 'combat') {
      // Get equipped weapon for base attack - prefer mainHand
      const meleeWeapons = character.inventory?.filter(i =>
        i.category === 'weapon' &&
        i.equipped &&
        !i.weapon?.properties?.includes('ammunition') // Exclude bows/crossbows for melee attacks
      )
      const weapon = meleeWeapons?.find(w => w.slot === 'mainHand') || meleeWeapons?.[0] || { name: 'Unarmed Strike', weapon: { damage: '1d4', damageType: 'bludgeoning' } }

      // Calculate attack bonus
      const attackBonus = Math.floor((character.stats.str - 10) / 2) + character.proficiencyBonus
      const attackRoll = Math.floor(Math.random() * 20) + 1
      const attackTotal = attackRoll + attackBonus

      let message = `${icon} **${abilityName}**\n\n`
      message += `🎯 Attack Roll: d20(${attackRoll}) + ${attackBonus} = **${attackTotal}**`

      if (attackRoll === 20) {
        message += ' 🎉 **CRITICAL HIT!**'
      } else if (attackRoll === 1) {
        message += ' 💀 *Critical miss...*'
      }

      // Roll weapon damage
      const weaponDamage = weapon.weapon.damage
      const weaponDiceMatch = weaponDamage.match(/(\d+)d(\d+)/)
      if (weaponDiceMatch) {
        const [_, numDice, diceSize] = weaponDiceMatch
        let totalDamage = 0
        const rolls = []
        for (let i = 0; i < parseInt(numDice); i++) {
          const roll = Math.floor(Math.random() * parseInt(diceSize)) + 1
          rolls.push(roll)
          totalDamage += roll
        }
        const damageBonus = Math.floor((character.stats.str - 10) / 2)
        totalDamage += damageBonus

        message += `\n💥 ${weapon.name} Damage: ${weaponDamage}+${damageBonus} = **${totalDamage}** ${weapon.weapon.damageType} [${rolls.join(', ')}]`
      }

      // Roll ability extra damage (like Colossus Slayer's 1d8)
      const abilityDamage = details.damage || ability.damage
      if (abilityDamage && abilityDamage.formula) {
        const damageMatch = abilityDamage.formula.match(/(\d+)d(\d+)/)
        if (damageMatch) {
          const [_, numDice, diceSize] = damageMatch
          let totalExtraDamage = 0
          const extraRolls = []
          for (let i = 0; i < parseInt(numDice); i++) {
            const roll = Math.floor(Math.random() * parseInt(diceSize)) + 1
            extraRolls.push(roll)
            totalExtraDamage += roll
          }
          message += `\n✨ ${abilityName} Damage: ${abilityDamage.formula} = **${totalExtraDamage}** ${abilityDamage.type} [${extraRolls.join(', ')}]`
        }
      }

      addMessage(message, 'character', 'Battle Ready')
      return
    }

    // Handle passive traits - just show description, no "Activated" messaging
    if (actionType === 'passive') {
      let message = `${icon} **${abilityName}**`
      if (details.shortDescription) {
        message += `\n\n${details.shortDescription}`
      }
      addMessage(message, 'character', 'Contemplative')
      return
    }

    // Handle active abilities (action, bonus, reaction) with potential dice rolls
    let message = `${icon} **${abilityName}**`

    if (actionType === 'action') {
      message += ' (Action)'
    } else if (actionType === 'bonus') {
      message += ' (Bonus Action)'
    } else if (actionType === 'reaction') {
      message += ' (Reaction)'
    }

    if (details.shortDescription) {
      message += `\n\n${details.shortDescription}`
    }

    // Check for healing (like Second Wind) - stored in damage.type = "healing"
    const damageData = details.damage || ability.damage
    if (damageData && damageData.type === 'healing') {
      const healingMatch = damageData.formula.match(/(\d+)d(\d+)/)
      if (healingMatch) {
        const [_, numDice, diceSize] = healingMatch
        let totalHealing = 0
        const rolls = []
        for (let i = 0; i < parseInt(numDice); i++) {
          const roll = Math.floor(Math.random() * parseInt(diceSize)) + 1
          rolls.push(roll)
          totalHealing += roll
        }

        // Add character level if description mentions it
        const levelBonus = details.description?.includes('your fighter level') ||
                          details.description?.includes('your character level') ||
                          details.description?.includes('your level')
                          ? (character.level || 0) : 0
        totalHealing += levelBonus

        const bonusText = levelBonus > 0 ? ` + ${levelBonus}` : ''
        message += `\n\n🎲 **Roll**: ${damageData.formula}${bonusText} = [${rolls.join(', ')}]${bonusText} = **${totalHealing}**`
        message += `\n💚 **Healing**: ${totalHealing} HP restored!`

        // Actually heal the character
        const oldHP = currentHP
        const newHP = Math.min(currentHP + totalHealing, character.hp.max)
        setCurrentHP(newHP)

        if (newHP > oldHP) {
          message += `\n💗 HP: ${oldHP} → **${newHP}** / ${character.hp.max}`
        }
      }
    }
    // Check for damage rolls (like special attacks)
    else if (damageData && damageData.type !== 'healing') {
      const damageMatch = damageData.formula.match(/(\d+)d(\d+)([+\-]\d+)?/)
      if (damageMatch) {
        const [_, numDice, diceSize, bonus] = damageMatch
        let totalDamage = 0
        const rolls = []
        for (let i = 0; i < parseInt(numDice); i++) {
          const roll = Math.floor(Math.random() * parseInt(diceSize)) + 1
          rolls.push(roll)
          totalDamage += roll
        }

        // Add any static bonus
        const bonusValue = bonus ? parseInt(bonus) : 0
        totalDamage += bonusValue

        const bonusText = bonusValue !== 0 ? ` ${bonus}` : ''
        message += `\n\n🎲 **Roll**: ${damageData.formula} = [${rolls.join(', ')}]${bonusText} = **${totalDamage}**`
        message += `\n💥 **Damage**: ${totalDamage} ${damageData.type || ''} damage`
      }
    }

    // Check for saving throw DC
    if (details.savingThrow || details.saveDC) {
      const saveDC = details.saveDC || (8 + character.proficiencyBonus + Math.floor((character.stats?.str || 10 - 10) / 2))
      const saveType = details.savingThrow || 'STR'
      message += `\n🛡️ **Save DC**: ${saveDC} ${saveType}`
    }

    // Add flavor based on category
    if (ability.category === 'defensive') {
      addMessage(message, 'character', 'Defensive')
    } else if (ability.category === 'utility') {
      addMessage(message, 'character', 'Focused')
    } else {
      addMessage(message, 'character', 'Ready')
    }
  }

  // Add message to chat
  const addMessage = (text, type = 'character', messageMood = mood) => {
    const newMessage = {
      type,
      mood: messageMood,
      text,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])

    if (type === 'character' && messageMood) {
      setMood(messageMood)
    }

    // Auto-speak character responses if enabled
    if (type === 'character' && autoSpeak) {
      speakText(text)
    }
  }

  // Convert text to speech using ElevenLabs API
  const speakText = async (text) => {
    try {
      setIsPlaying(true)

      // Clean text: remove markdown formatting and emojis for better speech
      const cleanText = text
        .replace(/\*\*/g, '') // Remove bold
        .replace(/\*/g, '') // Remove italics
        .replace(/#{1,6}\s/g, '') // Remove headers
        .replace(/\[.*?\]\(.*?\)/g, '') // Remove links
        .replace(/[⚔️🛡️💚🎲✨🎒💰✅❌🧪🗑️🔄📖📜🎭🤖🎤⏺🔊💪👁️🏥🌿👀🖐️🥷🏕️🎭🗣️⛪🔍📚😠💬🤸🐴]/g, '') // Remove common emojis
        .trim()

      // TODO: Call your server's ElevenLabs endpoint
      // For now, using browser's built-in speech synthesis as fallback
      // Replace this with actual ElevenLabs API call
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/tts/speak`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: cleanText,
          characterId: character.id,
          voice: character.voiceId || 'default' // Can be set in character profile
        })
      })

      if (response.ok) {
        // Get audio blob from response
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)

        // Play audio
        if (audioRef.current) {
          audioRef.current.src = audioUrl
          audioRef.current.play()

          audioRef.current.onended = () => {
            setIsPlaying(false)
            URL.revokeObjectURL(audioUrl) // Clean up
          }
        }
      } else {
        // Fallback to browser speech synthesis
        console.warn('ElevenLabs API not available, using browser TTS')
        const utterance = new SpeechSynthesisUtterance(cleanText)
        utterance.onend = () => setIsPlaying(false)
        window.speechSynthesis.speak(utterance)
      }
    } catch (error) {
      console.error('Error speaking text:', error)
      setIsPlaying(false)

      // Fallback to browser speech synthesis
      try {
        const utterance = new SpeechSynthesisUtterance(text.replace(/\*\*/g, '').replace(/\*/g, ''))
        utterance.onend = () => setIsPlaying(false)
        window.speechSynthesis.speak(utterance)
      } catch (fallbackError) {
        console.error('Fallback speech synthesis also failed:', fallbackError)
      }
    }
  }

  // Show spell details in chat without casting
  const handleViewSpell = (spell) => {
    if (!spell || !spell.details) return

    const details = spell.details
    let message = `📖 **${details.name}**\n\n`

    // Show level and school
    if (spell.type === 'cantrip') {
      message += `**Cantrip** • ${details.school || ''}\n`
    } else if (details.level) {
      const levelNum = parseInt(details.level)
      const suffixes = ['', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th']
      message += `**${levelNum}${suffixes[levelNum] || 'th'}-level ${details.school || ''}**\n`
    }

    // Show casting info
    if (details.castingTime) message += `⏱️ **Casting Time:** ${details.castingTime}\n`
    if (details.range) message += `📏 **Range:** ${details.range}\n`
    if (details.duration) message += `⏳ **Duration:** ${details.duration}\n`
    if (details.components) message += `🔮 **Components:** ${details.components}\n`

    // Show description
    if (details.description) {
      message += `\n${details.description.substring(0, 300)}${details.description.length > 300 ? '...' : ''}`
    } else if (details.shortDescription) {
      message += `\n${details.shortDescription}`
    }

    addMessage(message, 'system')
  }

  // Render message content with clickable spell/ability/equipment links
  const renderMessageContent = (text) => {
    // Match patterns: [SPELL:id:Name], [ABILITY:id:Name], [EQUIPMENT:id:Name]
    const linkRegex = /\[(SPELL|ABILITY|EQUIPMENT):([^:]+):([^\]]+)\]/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = linkRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index))
      }

      const linkType = match[1]
      const itemId = match[2]
      const itemName = match[3]

      // Add clickable link based on type
      parts.push(
        <button
          key={`${linkType}-${match.index}`}
          className={`${linkType.toLowerCase()}-link item-link`}
          onClick={() => {
            // Find the ability/spell/equipment by ID and show its card
            const item = character.abilities?.find(a => a.abilityId === itemId) ||
                        character.inventory?.find(i => i.id === itemId)
            if (item) {
              setViewingAbility(item)
            }
          }}
          title={`Click to view ${linkType.toLowerCase()}`}
        >
          {itemName}
        </button>
      )

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }

    return parts.length > 0 ? parts : text
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (inputMessage.trim()) {
      addMessage(inputMessage, 'player')
      setInputMessage('')

      // Simulate character response
      setTimeout(() => {
        addMessage("Your words reach me across the ages...", 'character', 'Thoughtful')
      }, 1000)
    }
  }

  // Toggle message expansion
  const toggleMessageExpansion = (index) => {
    setExpandedMessages(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  // Handle adding spell from spell browser
  const handleAddSpell = (spell) => {
    setCharacter(prev => ({
      ...prev,
      abilities: [...(prev.abilities || []), spell]
    }))
    addMessage(`✨ Learned new spell: **${spell.name}**`, 'system')
  }

  // Handle adding ability from ability browser
  const handleAddAbility = (ability) => {
    setCharacter(prev => ({
      ...prev,
      abilities: [...(prev.abilities || []), ability]
    }))
    addMessage(`⚔️ Gained new ability: **${ability.name}**`, 'system')
  }

  // Handle adding equipment from equipment browser
  const handleAddEquipment = (item) => {
    setCharacter(prev => ({
      ...prev,
      inventory: [...(prev.inventory || []), item]
    }))
    addMessage(`🎒 Added to inventory: **${item.name}**`, 'system')
  }

  // Handle adding custom item
  const handleAddCustomItem = () => {
    if (!newItemName.trim()) return

    const customItem = {
      id: `custom-${Date.now()}`,
      name: newItemName.trim(),
      category: 'item',
      equipped: false,
      details: {
        name: newItemName.trim(),
        shortDescription: 'Custom item',
        rarity: 'common'
      }
    }

    setCharacter(prev => ({
      ...prev,
      inventory: [...(prev.inventory || []), customItem]
    }))
    addMessage(`🎒 Added custom item: **${newItemName}**`, 'system')
    setNewItemName('')
    setShowAddItem(false)
  }

  // Handle adding/removing gold
  const handleUpdateGold = (amount) => {
    const numAmount = parseInt(amount) || 0
    setCharacter(prev => ({
      ...prev,
      gold: (prev.gold || 0) + numAmount
    }))
    if (numAmount > 0) {
      addMessage(`💰 Added **${numAmount} gold**`, 'system')
    } else if (numAmount < 0) {
      addMessage(`💰 Spent **${Math.abs(numAmount)} gold**`, 'system')
    }
    setGoldAmount(0)
  }

  // Handle equipping item
  const handleEquipItem = (item) => {
    setCharacter(prev => {
      const updatedInventory = prev.inventory.map(i => {
        if (i.id === item.id) {
          // If item has a slot specified, use it; otherwise use item's default slot
          return { ...i, equipped: true, slot: item.slot || i.slot }
        }
        // Unequip items in the same slot
        if (item.slot && i.slot === item.slot && i.equipped) {
          return { ...i, equipped: false }
        }
        return i
      })
      return { ...prev, inventory: updatedInventory }
    })
    addMessage(`✅ Equipped: **${item.name}**`, 'system')
  }

  // Handle unequipping item
  const handleUnequipItem = (item) => {
    setCharacter(prev => ({
      ...prev,
      inventory: prev.inventory.map(i =>
        i.id === item.id ? { ...i, equipped: false } : i
      )
    }))
    addMessage(`❌ Unequipped: **${item.name}**`, 'system')
  }

  // Handle using consumable item
  const handleUseItem = (item) => {
    addMessage(`🧪 Used: **${item.name}**`, 'system')
    // TODO: Apply item effects and remove from inventory if quantity reaches 0
    setCharacter(prev => ({
      ...prev,
      inventory: prev.inventory.map(i => {
        if (i.id === item.id && i.quantity > 1) {
          return { ...i, quantity: i.quantity - 1 }
        }
        return i
      }).filter(i => !(i.id === item.id && i.quantity <= 1))
    }))
  }

  // Handle dropping item
  const handleDropItem = (item) => {
    setCharacter(prev => ({
      ...prev,
      inventory: prev.inventory.filter(i => i.id !== item.id)
    }))
    addMessage(`🗑️ Dropped: **${item.name}**`, 'system')
  }

  // Update character data with class-appropriate equipment
  const handleRefreshCharacter = () => {
    const loadedCharacter = getDemoCharacter(characterId)
    if (loadedCharacter) {
      const populatedCharacter = populateCharacterData({ ...loadedCharacter })

      // Load class-appropriate starting equipment
      if (populatedCharacter.class) {
        const className = populatedCharacter.class.toLowerCase()
        const classEquipment = startingEquipment[className]

        if (classEquipment) {
          // Initialize inventory if needed
          if (!populatedCharacter.inventory) {
            populatedCharacter.inventory = []
          }

          // Add weapons
          if (classEquipment.weapons) {
            classEquipment.weapons.forEach(item => {
              populatedCharacter.inventory.push({
                ...item,
                equipped: true // Auto-equip starting weapons
              })
            })
          }

          // Add armor
          if (classEquipment.armor) {
            classEquipment.armor.forEach(item => {
              populatedCharacter.inventory.push({
                ...item,
                equipped: true // Auto-equip starting armor
              })
            })
          }

          // Add gear (not equipped by default)
          if (classEquipment.gear) {
            classEquipment.gear.forEach(item => {
              populatedCharacter.inventory.push({
                ...item,
                equipped: false
              })
            })
          }

          addMessage(`🔄 Character updated with ${className} equipment`, 'system')
        } else {
          addMessage(`🔄 Character data refreshed (no equipment table for ${className})`, 'system')
        }
      }

      setCharacter(populatedCharacter)
      setCurrentHP(populatedCharacter.hp.current)
    }
  }

  return (
    <div className="character-card">
      {/* Compact Header with Portrait + Stats */}
      <div className="character-header-compact" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '12px 16px',
        background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)',
        borderBottom: '2px solid rgba(212, 175, 55, 0.3)',
        position: 'relative'
      }}>
        {/* Portrait */}
        <div
          className="character-portrait-compact"
          onClick={() => setShowProfileModal(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '2px solid #d4af37',
            flexShrink: 0,
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.boxShadow = '0 0 15px rgba(212, 175, 55, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {character.portraitUrl ? (
            <img src={character.portraitUrl} alt={character.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', background: 'rgba(0,0,0,0.3)' }}>
              {character.portrait || '🎭'}
            </div>
          )}
        </div>

        {/* Name & Class Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#d4af37', fontSize: '18px', fontWeight: 'bold', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {character.name}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
            <span>{character.class || 'Fighter'}</span>
            <span style={{ margin: '0 6px', color: 'rgba(255,255,255,0.4)' }}>•</span>
            <span>Level {character.level || 10}</span>
            <span style={{ margin: '0 6px', color: 'rgba(255,255,255,0.4)' }}>•</span>
            <span>{character.race || 'Human'}</span>
            <span style={{ margin: '0 6px', color: 'rgba(255,255,255,0.4)' }}>•</span>
            <span style={{ fontSize: '11px', color: 'rgba(212,175,55,0.8)' }}>{mood}</span>
          </div>
        </div>

        {/* Compact Stats */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* HP */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: '600', marginBottom: '2px' }}>HP</div>
            <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>
              {currentHP}<span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>/{character.hp.max}</span>
            </div>
            <div style={{ width: '50px', height: '4px', background: 'rgba(0,0,0,0.4)', borderRadius: '2px', marginTop: '2px', overflow: 'hidden' }}>
              <div className={`stat-bar-fill hp ${getHPClass()}`} style={{ height: '100%', width: `${(currentHP / character.hp.max) * 100}%`, transition: 'width 0.3s ease' }} />
            </div>
          </div>

          {/* AC */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px' }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: '600', marginBottom: '2px' }}>AC</div>
            <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>{character.ac || 18}</div>
          </div>

          {/* Initiative */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px' }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: '600', marginBottom: '2px' }}>INIT</div>
            <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>+{character.initiative || 3}</div>
          </div>

          {/* Speed */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px' }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: '600', marginBottom: '2px' }}>SPD</div>
            <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>{character.speed || 30}<span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>ft</span></div>
          </div>
        </div>

        <button
          onClick={handleRefreshCharacter}
          title="Update character with class equipment"
          style={{
            position: 'absolute',
            top: '8px',
            right: '40px',
            background: 'transparent',
            border: 'none',
            color: '#888',
            fontSize: '14px',
            cursor: 'pointer',
            padding: '4px',
            lineHeight: 1,
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.color = '#d4af37'}
          onMouseLeave={(e) => e.target.style.color = '#888'}
        >🔄 Update</button>

        <button
          onClick={() => navigate('/')}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'transparent',
            border: 'none',
            color: '#888',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px',
            lineHeight: 1
          }}
        >✕</button>
      </div>

      {/* Conversation/Log Area */}
      <div className={`conversation-log ${logCollapsed ? 'collapsed' : ''}`}>
        <button
          className="section-collapse-btn"
          onClick={() => setLogCollapsed(!logCollapsed)}
          title={logCollapsed ? 'Expand log' : 'Collapse log'}
        >
          {logCollapsed ? '▼' : '▲'}
        </button>

        {!logCollapsed && (
          <>
            <div className="log-messages">
              {messages.map((message, index) => {
                const messageLength = message.text.length
                const isLong = messageLength > 200
                const isExpanded = expandedMessages[index]
                const shouldTruncate = isLong && !isExpanded

                return (
                  <div key={index} className={`log-message ${message.type}`}>
                    {message.type === 'character' && (
                      <div className="message-author">{character.name}</div>
                    )}
                    {message.type === 'player' && (
                      <div className="message-author">You</div>
                    )}
                    {message.type === 'system' && (
                      <div className="message-author">📖 Spell Info</div>
                    )}
                    <div className="message-content">
                      {shouldTruncate
                        ? renderMessageContent(message.text.substring(0, 200) + '...')
                        : renderMessageContent(message.text)
                      }
                    </div>
                    {isLong && (
                      <button
                        className="message-toggle-btn"
                        onClick={() => toggleMessageExpansion(index)}
                      >
                        {isExpanded ? '▲ Show less' : '▼ Show more'}
                      </button>
                    )}
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            <form className="message-input" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button type="submit">Send</button>
            </form>
          </>
        )}
      </div>

      {/* Tabs Section */}
      <div className={`tabs-section ${tabsCollapsed ? 'collapsed' : ''}`}>
        <div className="tab-headers">
          <button
            className="section-collapse-btn tab-collapse"
            onClick={() => setTabsCollapsed(!tabsCollapsed)}
            title={tabsCollapsed ? 'Expand tabs' : 'Collapse tabs'}
          >
            {tabsCollapsed ? '▼' : '▲'}
          </button>
          <button
            className={`tab-header ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            Stats
          </button>
          <button
            className={`tab-header ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            Skills
          </button>
          <button
            className={`tab-header ${activeTab === 'abilities' ? 'active' : ''}`}
            onClick={() => setActiveTab('abilities')}
          >
            Abilities
          </button>
          <button
            className={`tab-header ${activeTab === 'spells' ? 'active' : ''}`}
            onClick={() => setActiveTab('spells')}
          >
            Spells
          </button>
          <button
            className={`tab-header ${activeTab === 'equipment' ? 'active' : ''}`}
            onClick={() => setActiveTab('equipment')}
          >
            Equipment
          </button>
        </div>

        {!tabsCollapsed && (
          <div className="tab-content">
            {activeTab === 'skills' && (
            <CharacterModes
              character={character}
              mode="skills"
              onMessage={addMessage}
              abilities={character.abilities}
              onAbilityUse={handleAbilityClick}
              onShowAbilityDetails={(ability) => setViewingAbility(ability)}
            />
          )}

          {activeTab === 'abilities' && (
            <div className="abilities-tab-wrapper">
              <button
                className="browse-abilities-btn"
                onClick={() => setShowAbilityBrowser(true)}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '16px',
                  background: 'linear-gradient(135deg, #d4af37 0%, #ffd700 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#1a1a2e',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                ⚔️ Browse Class Features
              </button>
              <CharacterModes
                character={character}
                mode="battle"
                onMessage={addMessage}
                abilities={character.abilities}
                onAbilityUse={handleAbilityClick}
                onShowAbilityDetails={(ability) => setViewingAbility(ability)}
              />
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="stats-tab">
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px'}}>
                <h3 style={{color: '#d4af37', fontSize: '16px', margin: 0}}>Ability Scores</h3>
                <button
                  className="edit-stats-btn"
                  onClick={() => {
                    if (editingStats) {
                      // Save changes
                      setCharacter(prev => ({
                        ...prev,
                        stats: { ...prev.stats, ...tempStats }
                      }))
                      setEditingStats(false)
                      setTempStats({})
                    } else {
                      // Enter edit mode
                      setTempStats(character.stats)
                      setEditingStats(true)
                    }
                  }}
                  style={{
                    padding: '6px 12px',
                    background: editingStats ? 'linear-gradient(135deg, #d4af37 0%, #ffd700 100%)' : 'rgba(212, 175, 55, 0.2)',
                    border: editingStats ? 'none' : '1px solid #d4af37',
                    borderRadius: '6px',
                    color: editingStats ? '#1a1a2e' : '#d4af37',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {editingStats ? '💾 Save' : '✏️ Edit'}
                </button>
              </div>
              <div className="stats-grid">
                {['str', 'dex', 'con', 'int', 'wis', 'cha'].map(stat => {
                  const statValue = editingStats ? (tempStats[stat] || character.stats?.[stat] || 10) : (character.stats?.[stat] || 10)
                  const modifier = Math.floor((statValue - 10) / 2)

                  if (editingStats) {
                    return (
                      <div key={stat} className="stat-block editing">
                        <div className="stat-name">{stat.toUpperCase()}</div>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={tempStats[stat] || character.stats?.[stat] || 10}
                          onChange={(e) => setTempStats(prev => ({
                            ...prev,
                            [stat]: parseInt(e.target.value) || 10
                          }))}
                          className="stat-input"
                          style={{
                            width: '60px',
                            padding: '8px',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            background: 'rgba(0, 0, 0, 0.4)',
                            border: '2px solid #d4af37',
                            borderRadius: '6px',
                            color: '#fff'
                          }}
                        />
                        <div className="stat-mod">{modifier >= 0 ? '+' : ''}{modifier}</div>
                      </div>
                    )
                  }

                  return (
                    <div
                      key={stat}
                      className="stat-block clickable"
                      onClick={() => {
                        const roll = Math.floor(Math.random() * 20) + 1
                        const total = roll + modifier
                        addMessage(
                          `🎲 **${stat.toUpperCase()} Check**: d20(${roll}) ${modifier >= 0 ? '+' : ''}${modifier} = **${total}**`,
                          'player'
                        )
                      }}
                      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <div className="stat-name">{stat.toUpperCase()}</div>
                      <div className="stat-score">{statValue}</div>
                      <div className="stat-mod">{modifier >= 0 ? '+' : ''}{modifier}</div>
                    </div>
                  )
                })}
              </div>

              {/* Passive Traits Section - 4 Column Cards */}
              <div className="traits-section" style={{ marginTop: '24px' }}>
                <h3 style={{ color: '#d4af37', marginBottom: '12px', fontSize: '16px' }}>Passive Traits</h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '12px'
                }}>
                  {character.abilities
                    ?.filter(a =>
                      a.details?.actionType === 'passive' &&
                      a.category !== 'spell' &&
                      !a.usable && !a.details?.usable // Exclude usable abilities like Colossus Slayer
                    )
                    .map((trait, index) => (
                      <div
                        key={index}
                        className="trait-card"
                        style={{
                          background: 'rgba(45, 45, 68, 0.4)',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          borderRadius: '8px',
                          padding: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.7)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)'}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '18px', flexShrink: 0 }}>
                            {trait.category === 'combat' ? '⚔️' : trait.category === 'defensive' ? '🛡️' : '🔧'}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: '#fff', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>
                              {trait.name}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', lineHeight: '1.4' }}>
                              {trait.details?.shortDescription}
                            </div>
                          </div>
                          <button
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'rgba(255,255,255,0.4)',
                              fontSize: '14px',
                              cursor: 'pointer',
                              padding: '2px'
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              setViewingAbility(trait)
                            }}
                            title="View details"
                          >
                            ⓘ
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
                {(!character.abilities || character.abilities.filter(a => a.details?.actionType === 'passive' && a.category !== 'spell' && !a.usable && !a.details?.usable).length === 0) && (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
                    No passive traits
                  </div>
                )}
              </div>

              {/* Feats Section - 4 Column Cards */}
              <div className="feats-section" style={{ marginTop: '24px' }}>
                <h3 style={{ color: '#d4af37', marginBottom: '12px', fontSize: '16px' }}>Feats</h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '12px'
                }}>
                  {character.abilities
                    ?.filter(a => a.type === 'feat' || a.category === 'feat')
                    .map((feat, index) => (
                      <div
                        key={index}
                        className="feat-card"
                        style={{
                          background: 'rgba(45, 45, 68, 0.4)',
                          border: '1px solid rgba(139, 69, 19, 0.5)',
                          borderRadius: '8px',
                          padding: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(205, 133, 63, 0.8)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(139, 69, 19, 0.5)'}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '18px', flexShrink: 0 }}>🏆</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: '#fff', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>
                              {feat.name}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', lineHeight: '1.4' }}>
                              {feat.details?.shortDescription}
                            </div>
                          </div>
                          <button
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'rgba(255,255,255,0.4)',
                              fontSize: '14px',
                              cursor: 'pointer',
                              padding: '2px'
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              setViewingAbility(feat)
                            }}
                            title="View details"
                          >
                            ⓘ
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
                {(!character.abilities || character.abilities.filter(a => a.type === 'feat' || a.category === 'feat').length === 0) && (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
                    No feats
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'spells' && (
            <div className="spells-tab">
              {/* Compact Spell Slots Header */}
              {character.spellSlots && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px',
                  padding: '10px 12px',
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '8px',
                  border: '1px solid rgba(212, 175, 55, 0.2)'
                }}>
                  <span style={{color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap'}}>
                    Spell Slots:
                  </span>
                  <div style={{flex: 1, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap'}}>
                    {Object.entries(character.spellSlots).map(([level, slots]) => {
                      const percentage = slots.max > 0 ? (slots.current / slots.max) * 100 : 0
                      return (
                        <div key={level} style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                          <span style={{color: 'rgba(255,255,255,0.5)', fontSize: '11px'}}>L{level}</span>
                          <div style={{
                            width: '40px',
                            height: '6px',
                            background: 'rgba(0,0,0,0.5)',
                            borderRadius: '3px',
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.15)'
                          }}>
                            <div style={{
                              width: `${percentage}%`,
                              height: '100%',
                              background: percentage > 50 ? '#4caf50' : percentage > 0 ? '#ff9800' : '#f44336',
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                          <span style={{color: '#fff', fontSize: '11px', fontWeight: '600'}}>
                            {slots.current}/{slots.max}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  <button
                    onClick={() => setShowSpellBrowser(true)}
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(212, 175, 55, 0.8)',
                      border: '1px solid #d4af37',
                      borderRadius: '6px',
                      color: '#1a1a2e',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#d4af37'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(212, 175, 55, 0.8)'}
                  >
                    📚 Browse
                  </button>
                </div>
              )}
              <div className="spells-grid">
                {character.abilities
                  ?.filter(ability => ability.category === 'spell')
                  .map((spell, index) => {
                    const SPELL_SCHOOL_EMOJIS = {
                      'abjuration': '🛡️',
                      'conjuration': '✨',
                      'divination': '🔮',
                      'enchantment': '💫',
                      'evocation': '🔥',
                      'illusion': '🎭',
                      'necromancy': '💀',
                      'transmutation': '⚗️'
                    }

                    const school = (spell.details?.school || '').toLowerCase()
                    const emoji = SPELL_SCHOOL_EMOJIS[school] || '✨'
                    const spellLevel = spell.type === 'cantrip' ? 'Cantrip' :
                                      `Level ${spell.level || spell.details?.level || '?'}`

                    // Build spell summary with key combat info
                    const summaryParts = []

                    // Add save DC if applicable
                    if (spell.details?.savingThrow) {
                      const saveAbility = spell.details.savingThrow.toUpperCase()
                      summaryParts.push(`DC ${character.spellSaveDC || 15} ${saveAbility} save`)
                    }

                    // Add attack bonus if applicable
                    if (spell.details?.attack || spell.details?.attackRoll) {
                      summaryParts.push(`+${character.spellAttackBonus || character.proficiencyBonus + Math.floor(((character.stats?.int || 10) - 10) / 2) || 5} to hit`)
                    }

                    // Add damage if applicable
                    if (spell.details?.damage) {
                      const damageFormula = typeof spell.details.damage === 'object'
                        ? spell.details.damage.formula
                        : spell.details.damage
                      const damageType = typeof spell.details.damage === 'object'
                        ? spell.details.damage.type
                        : (spell.details?.damageType || '')
                      summaryParts.push(`${damageFormula} ${damageType}`.trim())
                    }

                    // Add healing if applicable
                    if (spell.details?.healing) {
                      summaryParts.push(`Heal ${spell.details.healing}`)
                    }

                    const spellSummary = summaryParts.length > 0 ? summaryParts.join(' • ') : null

                    return (
                      <button
                        key={index}
                        className="spell-btn"
                        onClick={() => handleAbilityClick(spell)}
                      >
                        <span className="spell-emoji">{emoji}</span>
                        <div className="spell-info">
                          <div className="spell-name">{spell.details?.name || spell.name}</div>
                          <div className="spell-meta">{spellLevel} • {spell.details?.school || 'Unknown'}</div>
                          {spellSummary && <div className="spell-summary" style={{fontSize: '11px', color: '#4a90e2', marginTop: '4px'}}>{spellSummary}</div>}
                        </div>
                      </button>
                    )
                  })}
                {(!character.abilities || character.abilities.filter(a => a.category === 'spell').length === 0) && (
                  <div style={{padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', gridColumn: '1 / -1'}}>
                    No spells available
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'equipment' && (
            <div className="equipment-tab">
              {/* Consolidated Top UI - View Toggle + Browse on Right */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px',
                padding: '8px 12px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
                border: '1px solid rgba(212, 175, 55, 0.2)'
              }}>
                {/* View Toggle */}
                <div style={{display: 'flex', gap: '6px', flexShrink: 0}}>
                  <button
                    onClick={() => setEquipmentView('inventory')}
                    style={{
                      padding: '6px 12px',
                      background: equipmentView === 'inventory' ? 'rgba(212, 175, 55, 0.3)' : 'transparent',
                      border: equipmentView === 'inventory' ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: equipmentView === 'inventory' ? '#d4af37' : 'rgba(255,255,255,0.7)',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    🎒 Inventory
                  </button>
                  <button
                    onClick={() => setEquipmentView('slots')}
                    style={{
                      padding: '6px 12px',
                      background: equipmentView === 'slots' ? 'rgba(212, 175, 55, 0.3)' : 'transparent',
                      border: equipmentView === 'slots' ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: equipmentView === 'slots' ? '#d4af37' : 'rgba(255,255,255,0.7)',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    ⚔️ Slots
                  </button>
                </div>

                {/* Gold Display */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.7)'
                }}>
                  <span>💰</span>
                  <span style={{color: '#ffd700', fontWeight: '600'}}>{character.gold || 0}</span>
                  <span style={{color: 'rgba(255,255,255,0.5)'}}>gp</span>
                </div>

                {/* Spacer */}
                <div style={{flex: 1}} />

                {/* Browse Button - Right Aligned */}
                <button
                  onClick={() => setShowEquipmentBrowser(true)}
                  style={{
                    padding: '6px 12px',
                    background: 'rgba(212, 175, 55, 0.8)',
                    border: '1px solid #d4af37',
                    borderRadius: '6px',
                    color: '#1a1a2e',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#d4af37'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(212, 175, 55, 0.8)'}
                >
                  🎒 Browse
                </button>
              </div>

              {/* Quick Actions - Collapsible */}
              <details style={{marginBottom: '12px'}}>
                <summary style={{
                  padding: '8px 12px',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '12px',
                  fontWeight: '600',
                  listStyle: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span>⚙️</span>
                  <span>Quick Actions</span>
                </summary>
                <div style={{
                  padding: '12px',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '6px',
                  marginTop: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {/* Gold Management */}
                  <div>
                    <div style={{fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '6px'}}>
                      💰 Manage Gold
                    </div>
                    <div style={{display: 'flex', gap: '6px', alignItems: 'center'}}>
                      <input
                        type="number"
                        value={goldAmount}
                        onChange={(e) => setGoldAmount(e.target.value)}
                        placeholder="Amount"
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          background: 'rgba(0,0,0,0.4)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '4px',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                      />
                      <button
                        onClick={() => handleUpdateGold(parseInt(goldAmount) || 0)}
                        disabled={!goldAmount || goldAmount === 0}
                        style={{
                          padding: '6px 10px',
                          background: 'rgba(76, 175, 80, 0.8)',
                          border: '1px solid rgba(76, 175, 80, 0.4)',
                          borderRadius: '4px',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: goldAmount && goldAmount !== 0 ? 'pointer' : 'not-allowed',
                          opacity: goldAmount && goldAmount !== 0 ? 1 : 0.5
                        }}
                      >
                        ➕
                      </button>
                      <button
                        onClick={() => handleUpdateGold(-(parseInt(goldAmount) || 0))}
                        disabled={!goldAmount || goldAmount === 0}
                        style={{
                          padding: '6px 10px',
                          background: 'rgba(244, 67, 54, 0.8)',
                          border: '1px solid rgba(244, 67, 54, 0.4)',
                          borderRadius: '4px',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: goldAmount && goldAmount !== 0 ? 'pointer' : 'not-allowed',
                          opacity: goldAmount && goldAmount !== 0 ? 1 : 0.5
                        }}
                      >
                        ➖
                      </button>
                    </div>
                  </div>

                  {/* Add Custom Item */}
                  <div>
                    <div style={{fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '6px'}}>
                      ✨ Add Custom Item
                    </div>
                    <div style={{display: 'flex', gap: '6px'}}>
                      <input
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="Item name"
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          background: 'rgba(0,0,0,0.4)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '4px',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && newItemName.trim()) {
                            handleAddCustomItem()
                          }
                        }}
                      />
                      <button
                        onClick={handleAddCustomItem}
                        disabled={!newItemName.trim()}
                        style={{
                          padding: '6px 10px',
                          background: 'rgba(212, 175, 55, 0.8)',
                          border: '1px solid rgba(212, 175, 55, 0.4)',
                          borderRadius: '4px',
                          color: '#1a1a2e',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: newItemName.trim() ? 'pointer' : 'not-allowed',
                          opacity: newItemName.trim() ? 1 : 0.5
                        }}
                      >
                        ➕
                      </button>
                    </div>
                  </div>
                </div>
              </details>

              {/* Render view based on selection */}
              {equipmentView === 'inventory' ? (
                <InventoryManager
                  character={character}
                  onEquipItem={handleEquipItem}
                  onUnequipItem={handleUnequipItem}
                  onUseItem={handleUseItem}
                  onDropItem={handleDropItem}
                  onUpdateCharacter={setCharacter}
                />
              ) : (
                <EquipmentSlots
                  character={character}
                  onUnequipItem={handleUnequipItem}
                />
              )}

              {/* Attuned Items Section */}
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ color: '#d4af37', marginBottom: '12px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>⚡</span>
                  <span>Attuned Items</span>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 'normal' }}>
                    ({character.inventory?.filter(i => i.attuned).length || 0}/3)
                  </span>
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '12px'
                }}>
                  {character.inventory
                    ?.filter(item => item.attuned)
                    .map((item, index) => (
                      <div
                        key={index}
                        style={{
                          background: 'rgba(45, 45, 68, 0.4)',
                          border: '2px solid rgba(138, 43, 226, 0.5)',
                          borderRadius: '8px',
                          padding: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(138, 43, 226, 0.8)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(138, 43, 226, 0.5)'}
                      >
                        {/* Attunement Indicator */}
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          width: '8px',
                          height: '8px',
                          background: 'rgba(138, 43, 226, 0.8)',
                          borderRadius: '50%',
                          boxShadow: '0 0 8px rgba(138, 43, 226, 0.6)'
                        }} />

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <span style={{ fontSize: '20px', flexShrink: 0 }}>
                            {getItemIcon(item.category)}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: '#fff', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>
                              {item.name}
                            </div>
                            {item.details?.shortDescription && (
                              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', lineHeight: '1.4', marginBottom: '6px' }}>
                                {item.details.shortDescription}
                              </div>
                            )}
                            {/* Item Properties */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px' }}>
                              {item.rarity && (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Rarity:</span>
                                  <span style={{ color: '#fff', fontWeight: '600' }}>{item.rarity}</span>
                                </div>
                              )}
                              {item.equipped && (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Status:</span>
                                  <span style={{ color: '#4caf50', fontWeight: '600' }}>Equipped</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Unattune Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setCharacter(prev => ({
                              ...prev,
                              inventory: prev.inventory.map(i =>
                                i.id === item.id ? { ...i, attuned: false } : i
                              )
                            }))
                            addMessage(`⚡ Unattuned from **${item.name}**`, 'system')
                          }}
                          style={{
                            marginTop: '8px',
                            width: '100%',
                            padding: '4px 8px',
                            background: 'rgba(138, 43, 226, 0.2)',
                            border: '1px solid rgba(138, 43, 226, 0.4)',
                            borderRadius: '4px',
                            color: '#ba55d3',
                            fontSize: '10px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(138, 43, 226, 0.3)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(138, 43, 226, 0.2)'}
                        >
                          ⚡ Unattune
                        </button>
                      </div>
                    ))}
                </div>
                {(!character.inventory || character.inventory.filter(i => i.attuned).length === 0) && (
                  <div style={{
                    padding: '30px',
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '14px',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '8px',
                    border: '1px dashed rgba(138, 43, 226, 0.3)'
                  }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚡</div>
                    <div>No attuned items</div>
                    <div style={{ fontSize: '11px', marginTop: '4px', color: 'rgba(255,255,255,0.4)' }}>
                      You can attune to up to 3 magical items
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          </div>
        )}
      </div>

      {/* Spell Browser Modal */}
      {showSpellBrowser && (
        <SpellBrowser
          character={character}
          selectedSpellId={selectedSpellId}
          onAddSpell={handleAddSpell}
          onClose={() => {
            setShowSpellBrowser(false)
            setSelectedSpellId(null)
          }}
        />
      )}

      {/* Ability Browser Modal */}
      {showAbilityBrowser && (
        <AbilityBrowser
          character={character}
          selectedAbilityId={selectedAbilityId}
          onAddAbility={handleAddAbility}
          onClose={() => {
            setShowAbilityBrowser(false)
            setSelectedAbilityId(null)
          }}
        />
      )}

      {/* Equipment Browser Modal */}
      {showEquipmentBrowser && (
        <EquipmentBrowser
          character={character}
          selectedEquipmentId={selectedEquipmentId}
          onAddEquipment={handleAddEquipment}
          onClose={() => {
            setShowEquipmentBrowser(false)
            setSelectedEquipmentId(null)
          }}
        />
      )}

      {/* Dice Roller */}
      {showDiceRoller && (
        <DiceRoller
          character={character}
          onMessage={addMessage}
          onClose={() => setShowDiceRoller(false)}
        />
      )}

      {/* Ability/Spell Card Modal */}
      {viewingAbility && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px'
          }}
          onClick={() => setViewingAbility(null)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <AbilityCard
              ability={viewingAbility}
              character={character}
              initialExpanded={true}
              onUse={(ability) => {
                handleAbilityClick(ability)
                setViewingAbility(null)
              }}
              onClose={() => setViewingAbility(null)}
            />
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px'
          }}
          onClick={() => {
            setShowProfileModal(false)
            setEditingProfile(false)
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(22, 33, 62, 0.98) 100%)',
              borderRadius: '16px',
              border: '2px solid rgba(212, 175, 55, 0.5)',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative'
            }}
          >
            {/* Close button */}
            <button
              onClick={() => {
                setShowProfileModal(false)
                setEditingProfile(false)
              }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                zIndex: 1
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(212, 175, 55, 0.3)'
                e.target.style.transform = 'scale(1.1)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                e.target.style.transform = 'scale(1)'
              }}
            >
              ✕
            </button>

            {/* Large portrait */}
            <div style={{ padding: '40px 40px 20px' }}>
              <div style={{
                width: '100%',
                maxWidth: '400px',
                margin: '0 auto',
                aspectRatio: '1',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '3px solid #d4af37',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
              }}>
                {character.portraitUrl ? (
                  <img
                    src={character.portraitUrl}
                    alt={character.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '120px',
                    background: 'rgba(0,0,0,0.3)'
                  }}>
                    {character.portrait || '🎭'}
                  </div>
                )}
              </div>

              {/* Character name and title */}
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <h2 style={{ color: '#d4af37', fontSize: '28px', margin: '0 0 8px 0' }}>
                  {character.name}
                </h2>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px' }}>
                  {character.race} {character.class} • Level {character.level}
                </div>
              </div>
            </div>

            {/* Backstory section */}
            <div style={{ padding: '0 40px 20px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <h3 style={{ color: '#d4af37', fontSize: '18px', margin: 0 }}>
                  📜 Backstory
                </h3>
                {!editingProfile && (
                  <button
                    onClick={() => {
                      setEditingProfile(true)
                      setTempBackstory(character.background || '')
                      setTempBehavior(character.personality?.traits?.join('\n') || '')
                      setTempAIBehavior(character.aiBehavior || '')
                    }}
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(212, 175, 55, 0.2)',
                      border: '1px solid #d4af37',
                      borderRadius: '6px',
                      color: '#d4af37',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    ✏️ Edit
                  </button>
                )}
              </div>
              {editingProfile ? (
                <textarea
                  value={tempBackstory}
                  onChange={(e) => setTempBackstory(e.target.value)}
                  placeholder="Enter character backstory..."
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              ) : (
                <p style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  margin: 0,
                  whiteSpace: 'pre-wrap'
                }}>
                  {character.background || 'No backstory yet. Click Edit to add one!'}
                </p>
              )}
            </div>

            {/* Behavior/Personality section */}
            <div style={{ padding: '0 40px 40px' }}>
              <h3 style={{ color: '#d4af37', fontSize: '18px', marginBottom: '12px' }}>
                🎭 Behavior & Personality
              </h3>
              {editingProfile ? (
                <textarea
                  value={tempBehavior}
                  onChange={(e) => setTempBehavior(e.target.value)}
                  placeholder="Describe personality traits, mannerisms, quirks..."
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              ) : (
                <div style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}>
                  {character.personality?.traits ? (
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {character.personality.traits.map((trait, i) => (
                        <li key={i} style={{ marginBottom: '8px' }}>{trait}</li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ margin: 0 }}>No personality traits yet. Click Edit to add some!</p>
                  )}
                </div>
              )}
            </div>

            {/* AI Behavior Instructions section */}
            <div style={{ padding: '0 40px 20px' }}>
              <h3 style={{ color: '#d4af37', fontSize: '18px', marginBottom: '12px' }}>
                🤖 AI Behavior Instructions
              </h3>
              {editingProfile ? (
                <textarea
                  value={tempAIBehavior}
                  onChange={(e) => setTempAIBehavior(e.target.value)}
                  placeholder="Instructions for AI conversation (e.g., 'Speak in old English', 'Always rhyme', 'Be mysterious')..."
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              ) : (
                <p style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  fontStyle: character.aiBehavior ? 'normal' : 'italic'
                }}>
                  {character.aiBehavior || 'No AI behavior instructions set. Click Edit to add instructions for how this character should respond in conversations.'}
                </p>
              )}
            </div>

            {/* Voice Chat section */}
            {!editingProfile && (
              <div style={{ padding: '0 40px 20px', borderTop: '1px solid rgba(212, 175, 55, 0.2)', paddingTop: '20px' }}>
                <h3 style={{ color: '#d4af37', fontSize: '18px', marginBottom: '12px' }}>
                  🎤 Voice Response
                </h3>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setAutoSpeak(!autoSpeak)}
                    style={{
                      flex: 1,
                      minWidth: '200px',
                      padding: '12px 20px',
                      background: autoSpeak
                        ? 'linear-gradient(135deg, #27ae60 0%, #229954 100%)'
                        : 'linear-gradient(135deg, rgba(212, 175, 55, 0.3) 0%, rgba(212, 175, 55, 0.2) 100%)',
                      border: autoSpeak ? 'none' : '1px solid rgba(212, 175, 55, 0.5)',
                      borderRadius: '8px',
                      color: autoSpeak ? '#fff' : '#d4af37',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {autoSpeak ? (
                      <>
                        <span>🔊</span>
                        Auto-Speak: ON
                      </>
                    ) : (
                      <>
                        <span>🔇</span>
                        Auto-Speak: OFF
                      </>
                    )}
                  </button>
                  {isPlaying && (
                    <div style={{
                      padding: '12px 20px',
                      background: 'rgba(39, 174, 96, 0.2)',
                      borderRadius: '8px',
                      color: '#27ae60',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      border: '1px solid rgba(39, 174, 96, 0.4)'
                    }}>
                      <span style={{ animation: 'pulse 1s ease infinite' }}>🔊</span>
                      Speaking...
                    </div>
                  )}
                </div>
                <p style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '12px',
                  marginTop: '8px',
                  marginBottom: 0
                }}>
                  {autoSpeak
                    ? '🟢 Character will speak all responses using ElevenLabs voice synthesis'
                    : '⚪ Character responses will be text-only. Click to enable voice.'
                  }
                </p>
              </div>
            )}

            {/* Save/Cancel buttons when editing */}
            <div style={{ padding: '0 40px 40px' }}>
              {editingProfile && (
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '16px',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={() => {
                      setEditingProfile(false)
                      setTempBackstory('')
                      setTempBehavior('')
                      setTempAIBehavior('')
                    }}
                    style={{
                      padding: '10px 20px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setCharacter(prev => ({
                        ...prev,
                        background: tempBackstory,
                        personality: {
                          ...prev.personality,
                          traits: tempBehavior.split('\n').filter(t => t.trim())
                        },
                        aiBehavior: tempAIBehavior
                      }))
                      setEditingProfile(false)
                      setTempBackstory('')
                      setTempBehavior('')
                      setTempAIBehavior('')
                    }}
                    style={{
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #d4af37 0%, #ffd700 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#1a1a2e',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    💾 Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Dice Roller Button */}
      <button
        className="dice-fab"
        onClick={() => setShowDiceRoller(!showDiceRoller)}
        title="Dice Roller & Quick Actions"
      >
        🎲
      </button>

      {/* Hidden audio element for ElevenLabs playback */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  )
}

export default CharacterCard
