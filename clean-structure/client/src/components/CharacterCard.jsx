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
import './CharacterCard.css'

function CharacterCard() {
  const { characterId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('skills') // skills, abilities, stats, spells, equipment
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
  const [concentration, setConcentration] = useState(null) // {spell: {name, effect}, target: string}
  const [logCollapsed, setLogCollapsed] = useState(false)
  const [tabsCollapsed, setTabsCollapsed] = useState(false)
  const [showDiceRoller, setShowDiceRoller] = useState(false)
  const [expandedMessages, setExpandedMessages] = useState({}) // Track which messages are expanded
  const messagesEndRef = useRef(null)

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
        // Utility spell - just show what it does
        if (details.shortDescription) {
          message += `\n\n${details.shortDescription}`
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

    // Handle active abilities (action, bonus, reaction)
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

  // Render message content with clickable spell links
  const renderMessageContent = (text) => {
    // Match pattern: [SPELL:ability-id:Spell Name]
    const spellLinkRegex = /\[SPELL:([^:]+):([^\]]+)\]/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = spellLinkRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index))
      }

      // Add clickable spell link
      const abilityId = match[1]
      const spellName = match[2]
      parts.push(
        <button
          key={`spell-${match.index}`}
          className="spell-link"
          onClick={() => {
            // Open spell browser to view spell details
            setShowSpellBrowser(true)
          }}
          title="Click to open spell library"
        >
          {spellName}
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

  // Refresh character data (reload from demo + populate)
  const handleRefreshCharacter = () => {
    const loadedCharacter = getDemoCharacter(characterId)
    if (loadedCharacter) {
      const populatedCharacter = populateCharacterData({ ...loadedCharacter })
      setCharacter(populatedCharacter)
      setCurrentHP(populatedCharacter.hp.current)
      addMessage(`🔄 Character data refreshed`, 'system')
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
        <div className="character-portrait-compact" style={{
          width: '60px',
          height: '60px',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '2px solid #d4af37',
          flexShrink: 0
        }}>
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
          title="Refresh character data"
          style={{
            position: 'absolute',
            top: '8px',
            right: '40px',
            background: 'transparent',
            border: 'none',
            color: '#888',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '4px',
            lineHeight: 1,
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.color = '#d4af37'}
          onMouseLeave={(e) => e.target.style.color = '#888'}
        >🔄</button>

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
            className={`tab-header ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            Stats
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
          <button
            className="section-collapse-btn tab-collapse"
            onClick={() => setTabsCollapsed(!tabsCollapsed)}
            title={tabsCollapsed ? 'Expand tabs' : 'Collapse tabs'}
          >
            {tabsCollapsed ? '▼' : '▲'}
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
              />
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="stats-tab">
              <div className="stats-grid">
                {['str', 'dex', 'con', 'int', 'wis', 'cha'].map(stat => {
                  const statValue = character.stats?.[stat] || 10
                  const modifier = Math.floor((statValue - 10) / 2)
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

              {/* Passive Traits Section */}
              <div className="traits-section" style={{ marginTop: '24px' }}>
                <h3 style={{ color: '#d4af37', marginBottom: '12px', fontSize: '16px' }}>Passive Traits</h3>
                <div className="traits-list">
                  {character.abilities
                    ?.filter(a =>
                      a.details?.actionType === 'passive' &&
                      a.category !== 'spell' &&
                      !a.usable && !a.details?.usable // Exclude usable abilities like Colossus Slayer
                    )
                    .map((trait, index) => (
                      <div
                        key={index}
                        className="trait-item"
                        style={{
                          background: 'rgba(45, 45, 68, 0.4)',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          borderRadius: '6px',
                          padding: '10px 12px',
                          marginBottom: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '16px' }}>
                            {trait.category === 'combat' ? '⚔️' : trait.category === 'defensive' ? '🛡️' : '🔧'}
                          </span>
                          <span style={{ color: '#fff', fontWeight: '600', fontSize: '14px' }}>
                            {trait.name}
                          </span>
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', paddingLeft: '24px' }}>
                          {trait.details?.shortDescription}
                        </div>
                      </div>
                    ))}
                  {(!character.abilities || character.abilities.filter(a => a.details?.actionType === 'passive' && a.category !== 'spell').length === 0) && (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
                      No passive traits
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'spells' && (
            <div className="spells-tab">
              {character.spellSlots && (
                <div className="spell-slots-display" style={{marginBottom: '20px'}}>
                  <h4 style={{marginBottom: '10px', color: 'rgba(255,255,255,0.9)'}}>Spell Slots:</h4>
                  <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                    {Object.entries(character.spellSlots).map(([level, slots]) => (
                      <div key={level} style={{
                        padding: '8px 12px',
                        background: 'rgba(30,30,30,0.8)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px'
                      }}>
                        <span style={{color: 'rgba(255,255,255,0.7)', fontSize: '12px'}}>Level {level}:</span>
                        <span style={{color: '#fff', marginLeft: '6px', fontWeight: 'bold'}}>
                          {slots.current}/{slots.max}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button
                className="browse-spells-btn"
                onClick={() => setShowSpellBrowser(true)}
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
                📚 Browse Spell Library
              </button>
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

                    // Build brief description
                    const descParts = []
                    if (spell.details?.castingTime) descParts.push(spell.details.castingTime)
                    if (spell.details?.range) descParts.push(spell.details.range)
                    const briefDesc = descParts.join(' • ')

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
                          {briefDesc && <div className="spell-description">{briefDesc}</div>}
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
              {/* View Toggle */}
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '12px',
                background: 'rgba(0,0,0,0.3)',
                padding: '4px',
                borderRadius: '8px'
              }}>
                <button
                  onClick={() => setEquipmentView('inventory')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: equipmentView === 'inventory' ? 'rgba(212, 175, 55, 0.3)' : 'transparent',
                    border: equipmentView === 'inventory' ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: equipmentView === 'inventory' ? '#d4af37' : 'rgba(255,255,255,0.7)',
                    fontSize: '13px',
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
                    flex: 1,
                    padding: '8px',
                    background: equipmentView === 'slots' ? 'rgba(212, 175, 55, 0.3)' : 'transparent',
                    border: equipmentView === 'slots' ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: equipmentView === 'slots' ? '#d4af37' : 'rgba(255,255,255,0.7)',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  ⚔️ Equipment Slots
                </button>
              </div>

              {/* Add Equipment Button */}
              <button
                className="browse-equipment-btn"
                onClick={() => setShowEquipmentBrowser(true)}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '12px',
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
                🎒 Browse Equipment & Gear
              </button>

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
            </div>
          )}
          </div>
        )}
      </div>

      {/* Spell Browser Modal */}
      {showSpellBrowser && (
        <SpellBrowser
          character={character}
          onAddSpell={handleAddSpell}
          onClose={() => setShowSpellBrowser(false)}
        />
      )}

      {/* Ability Browser Modal */}
      {showAbilityBrowser && (
        <AbilityBrowser
          character={character}
          onAddAbility={handleAddAbility}
          onClose={() => setShowAbilityBrowser(false)}
        />
      )}

      {/* Equipment Browser Modal */}
      {showEquipmentBrowser && (
        <EquipmentBrowser
          character={character}
          onAddEquipment={handleAddEquipment}
          onClose={() => setShowEquipmentBrowser(false)}
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

      {/* Floating Dice Roller Button */}
      <button
        className="dice-fab"
        onClick={() => setShowDiceRoller(!showDiceRoller)}
        title="Dice Roller & Quick Actions"
      >
        🎲
      </button>
    </div>
  )
}

export default CharacterCard
