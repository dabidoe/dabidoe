/**
 * Import D&D 5e Spells and Items from 5etools
 *
 * This script fetches data from 5etools and converts it to your schema format.
 *
 * Usage:
 *   node scripts/import-dnd-data.js --type spells
 *   node scripts/import-dnd-data.js --type items
 *   node scripts/import-dnd-data.js --all
 */

const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

// 5etools data sources
const DATA_SOURCES = {
  spells: 'https://raw.githubusercontent.com/5etools-mirror-1/5etools-mirror-1.github.io/master/data/spells/spells-phb.json',
  items: 'https://raw.githubusercontent.com/5etools-mirror-1/5etools-mirror-1.github.io/master/data/items.json'
}

/**
 * Convert 5etools spell to your schema
 */
function convertSpell(spell, userId = 'system') {
  // Parse spell level
  const level = spell.level === 0 ? 'Cantrip' :
                spell.level === 1 ? '1st' :
                spell.level === 2 ? '2nd' :
                spell.level === 3 ? '3rd' :
                `${spell.level}th`

  // Parse components
  const components = []
  if (spell.components?.v) components.push('V')
  if (spell.components?.s) components.push('S')
  if (spell.components?.m) components.push(`M (${spell.components.m.text || spell.components.m})`)
  const componentsStr = components.join(', ')

  // Parse casting time
  const castingTime = spell.time?.[0] ?
    `${spell.time[0].number} ${spell.time[0].unit}` :
    '1 action'

  // Parse range
  const range = spell.range?.distance ?
    spell.range.distance.type === 'self' ? 'Self' :
    spell.range.distance.type === 'touch' ? 'Touch' :
    spell.range.distance.type === 'sight' ? 'Sight' :
    `${spell.range.distance.amount} ${spell.range.distance.type}` :
    'Unknown'

  // Parse duration
  const duration = spell.duration?.[0] ?
    spell.duration[0].type === 'instant' ? 'Instantaneous' :
    spell.duration[0].type === 'permanent' ? 'Permanent' :
    spell.duration[0].concentration ? `Concentration, up to ${spell.duration[0].duration?.amount} ${spell.duration[0].duration?.type}` :
    `${spell.duration[0].duration?.amount || ''} ${spell.duration[0].duration?.type || 'Unknown'}` :
    'Unknown'

  // Build long description
  const entries = spell.entries || []
  const longDescription = entries.map(entry => {
    if (typeof entry === 'string') return entry
    if (entry.type === 'entries') {
      return `${entry.name || ''}\n${(entry.entries || []).join('\n')}`
    }
    return JSON.stringify(entry)
  }).join('\n\n')

  // Parse attack/damage if available
  let attackBonus = null
  let damageFormula = null
  let savingThrow = null

  if (spell.spellAttack) {
    attackBonus = 0 // Will be calculated based on character stats
  }

  if (spell.damageInflict) {
    // Damage info available
    damageFormula = spell.entries.find(e =>
      typeof e === 'string' && e.match(/\d+d\d+/)
    )?.match(/(\d+d\d+(?:\s*\+\s*\d+)?)/)?.[1] || null
  }

  if (spell.savingThrow) {
    savingThrow = {
      ability: spell.savingThrow[0].toUpperCase(),
      dc: null // Calculated based on caster
    }
  }

  return {
    name: spell.name,
    shortDescription: spell.entries?.[0]?.substring(0, 100) || '',
    longDescription: `Casting Time: ${castingTime}\nRange: ${range}\nComponents: ${componentsStr}\nDuration: ${duration}\n\n${longDescription}`,

    // Spell-specific fields
    school: spell.school ? capitalizeFirst(spell.school) : 'Unknown',
    level: level,
    castingTime: castingTime,
    range: range,
    components: componentsStr,
    duration: duration,

    // Combat mechanics
    attackBonus: attackBonus,
    damageFormula: damageFormula,
    savingThrow: savingThrow,

    // Metadata
    userId: userId,
    guid: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    iconLayers: [generateDefaultIcon(spell.school)],
    tokens: 1,

    // Source
    source: spell.source || 'PHB',
    page: spell.page || null
  }
}

/**
 * Convert 5etools item to your schema
 */
function convertItem(item, userId = 'system') {
  // Parse rarity
  const rarityMap = {
    'none': 'Common',
    'common': 'Common',
    'uncommon': 'Uncommon',
    'rare': 'Rare',
    'very rare': 'Very Rare',
    'legendary': 'Legendary',
    'artifact': 'Artifact'
  }
  const rarity = rarityMap[item.rarity?.toLowerCase()] || 'Common'

  // Parse type
  const typeMap = {
    'A': 'Armor',
    'W': 'Weapon',
    'P': 'Potion',
    'SC': 'Scroll',
    'RG': 'Ring',
    'RD': 'Rod',
    'WD': 'Wand',
    'S': 'Staff',
    'G': 'Adventuring Gear',
    'M': 'Melee Weapon',
    'R': 'Ranged Weapon',
    'LA': 'Light Armor',
    'MA': 'Medium Armor',
    'HA': 'Heavy Armor',
    'SH': 'Shield',
    '$': 'Treasure'
  }
  const type = typeMap[item.type] || 'Miscellaneous'

  // Parse item slot
  let itemSlot = 'Miscellaneous'
  if (item.type?.includes('A')) itemSlot = 'Armor'
  else if (item.type?.includes('W')) itemSlot = 'Weapon'
  else if (item.wondrous) itemSlot = 'Wondrous Item'
  else if (item.type === 'RG') itemSlot = 'Ring'
  else if (item.type === 'RD' || item.type === 'WD' || item.type === 'S') itemSlot = 'Hand'

  // Build description
  const entries = item.entries || []
  const longDescription = entries.map(entry => {
    if (typeof entry === 'string') return entry
    if (entry.type === 'entries') {
      return `${entry.name || ''}\n${(entry.entries || []).join('\n')}`
    }
    if (entry.type === 'list') {
      return (entry.items || []).map(i => `• ${i}`).join('\n')
    }
    return JSON.stringify(entry)
  }).join('\n\n')

  // Parse damage/armor
  let damage = ''
  let armor = ''

  if (item.dmg1) {
    damage = item.dmg1
  }

  if (item.ac) {
    armor = `${item.ac}`
  }

  return {
    name: item.name,
    shortDescription: entries?.[0]?.substring(0, 100) || '',
    longDescription: longDescription || item.name,

    // Item-specific fields
    type: type,
    rarity: rarity,
    itemSlot: itemSlot,
    damage: damage,
    armor: armor,

    // Metadata
    userId: userId,
    guid: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    iconLayers: [generateDefaultIcon(item.type)],
    tokens: 1,

    // Source
    source: item.source || 'DMG',
    page: item.page || null,

    // Additional properties
    value: item.value || null,
    weight: item.weight || null,
    properties: item.property || []
  }
}

/**
 * Generate default icon placeholder
 */
function generateDefaultIcon(category) {
  // Return icon layer array
  // In production, you'd want actual icon IDs from your system
  return [Math.random().toString(36).substring(7)]
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Fetch data from 5etools
 */
async function fetchData(url) {
  try {
    const https = require('https')
    const http = require('http')

    const protocol = url.startsWith('https') ? https : http

    return new Promise((resolve, reject) => {
      protocol.get(url, (res) => {
        let data = ''

        res.on('data', (chunk) => {
          data += chunk
        })

        res.on('end', () => {
          try {
            resolve(JSON.parse(data))
          } catch (e) {
            reject(e)
          }
        })
      }).on('error', reject)
    })
  } catch (error) {
    console.error('Error fetching data:', error.message)
    throw error
  }
}

/**
 * Main import function
 */
async function importData(type = 'all', userId = 'system') {
  console.log(`Starting import of ${type}...`)

  const results = {
    spells: [],
    items: []
  }

  // Import spells
  if (type === 'spells' || type === 'all') {
    try {
      console.log('Fetching spells from 5etools...')
      const spellData = await fetchData(DATA_SOURCES.spells)

      const spells = spellData.spell || []
      console.log(`Found ${spells.length} spells`)

      results.spells = spells.map(spell => convertSpell(spell, userId))

      // Save to file
      const outputPath = path.join(__dirname, '..', 'data', 'spells-seed.json')
      fs.mkdirSync(path.dirname(outputPath), { recursive: true })
      fs.writeFileSync(outputPath, JSON.stringify(results.spells, null, 2))
      console.log(`✓ Saved ${results.spells.length} spells to ${outputPath}`)
    } catch (error) {
      console.error('Error importing spells:', error.message)
    }
  }

  // Import items
  if (type === 'items' || type === 'all') {
    try {
      console.log('Fetching items from 5etools...')
      const itemData = await fetchData(DATA_SOURCES.items)

      const items = itemData.item || []
      console.log(`Found ${items.length} items`)

      results.items = items
        .filter(item => !item._copy) // Skip variant items for now
        .map(item => convertItem(item, userId))

      // Save to file
      const outputPath = path.join(__dirname, '..', 'data', 'items-seed.json')
      fs.mkdirSync(path.dirname(outputPath), { recursive: true })
      fs.writeFileSync(outputPath, JSON.stringify(results.items, null, 2))
      console.log(`✓ Saved ${results.items.length} items to ${outputPath}`)
    } catch (error) {
      console.error('Error importing items:', error.message)
    }
  }

  console.log('\n=== Import Complete ===')
  console.log(`Spells: ${results.spells.length}`)
  console.log(`Items: ${results.items.length}`)
  console.log('\nTo import into MongoDB:')
  console.log('  node scripts/seed-database.js')
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2)
  const typeArg = args.find(arg => arg.startsWith('--type='))
  const type = typeArg ? typeArg.split('=')[1] : 'all'

  const userIdArg = args.find(arg => arg.startsWith('--userId='))
  const userId = userIdArg ? userIdArg.split('=')[1] : 'system'

  importData(type, userId)
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Fatal error:', err)
      process.exit(1)
    })
}

module.exports = { convertSpell, convertItem, importData }
