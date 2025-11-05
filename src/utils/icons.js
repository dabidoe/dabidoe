/**
 * Icon System for D&D Spells and Items
 *
 * Provides multiple fallback options:
 * 1. Emoji icons (instant, no API needed)
 * 2. Game-icons.net API (free, 4000+ icons)
 * 3. Colored badge system (CSS-based)
 * 4. Upload system for custom images later
 */

// Emoji icon mapping
export const SPELL_SCHOOL_EMOJI = {
  'Abjuration': '🛡️',
  'Conjuration': '🌀',
  'Divination': '🔮',
  'Enchantment': '✨',
  'Evocation': '🔥',
  'Illusion': '👁️',
  'Necromancy': '💀',
  'Transmutation': '⚗️'
}

export const ITEM_TYPE_EMOJI = {
  'Weapon': '⚔️',
  'Armor': '🛡️',
  'Potion': '🧪',
  'Scroll': '📜',
  'Ring': '💍',
  'Wand': '🪄',
  'Staff': '🪶',
  'Rod': '📏',
  'Wondrous Item': '✨',
  'Adventuring Gear': '🎒',
  'Tool': '🔧',
  'Treasure': '💎'
}

// Game-icons.net mapping (free icon API)
export const SPELL_SCHOOL_ICONS = {
  'Abjuration': 'shield-reflect',
  'Conjuration': 'swirl-ring',
  'Divination': 'crystal-ball',
  'Enchantment': 'sparkles',
  'Evocation': 'fire-bolt',
  'Illusion': 'eye-target',
  'Necromancy': 'death-skull',
  'Transmutation': 'potion-ball'
}

export const ITEM_TYPE_ICONS = {
  'Weapon': 'crossed-swords',
  'Armor': 'chest-armor',
  'Potion': 'potion',
  'Scroll': 'scroll-unfurled',
  'Ring': 'ring',
  'Wand': 'wand',
  'Staff': 'wooden-staff',
  'Rod': 'rod-of-asclepius',
  'Wondrous Item': 'magic-swirl',
  'Adventuring Gear': 'knapsack',
  'Tool': 'hammer',
  'Treasure': 'gems'
}

// Color scheme for badge system
export const SPELL_SCHOOL_COLORS = {
  'Abjuration': '#4CAF50',     // Green (protection)
  'Conjuration': '#9C27B0',    // Purple (summoning)
  'Divination': '#2196F3',     // Blue (knowledge)
  'Enchantment': '#E91E63',    // Pink (charm)
  'Evocation': '#FF5722',      // Red (destruction)
  'Illusion': '#00BCD4',       // Cyan (trickery)
  'Necromancy': '#424242',     // Dark gray (death)
  'Transmutation': '#FF9800'   // Orange (change)
}

export const RARITY_COLORS = {
  'Common': '#9E9E9E',         // Gray
  'Uncommon': '#4CAF50',       // Green
  'Rare': '#2196F3',           // Blue
  'Very Rare': '#9C27B0',      // Purple
  'Legendary': '#FF9800',      // Orange
  'Artifact': '#D4AF37'        // Gold
}

/**
 * Get icon for a spell
 * @param {Object} spell - Spell data
 * @param {string} format - 'emoji', 'url', 'badge', 'game-icons'
 * @returns {string|Object} Icon representation
 */
export function getSpellIcon(spell, format = 'emoji') {
  const school = spell.school || 'Evocation'

  switch (format) {
    case 'emoji':
      return SPELL_SCHOOL_EMOJI[school] || '✨'

    case 'game-icons':
      const iconName = SPELL_SCHOOL_ICONS[school] || 'sparkles'
      return `https://game-icons.net/icons/ffffff/000000/1x1/lorc/${iconName}.svg`

    case 'game-icons-colored':
      const icon = SPELL_SCHOOL_ICONS[school] || 'sparkles'
      const color = SPELL_SCHOOL_COLORS[school]?.substring(1) || 'ffffff'
      return `https://game-icons.net/icons/${color}/000000/1x1/lorc/${icon}.svg`

    case 'badge':
      return {
        text: school.substring(0, 3).toUpperCase(),
        color: SPELL_SCHOOL_COLORS[school] || '#9E9E9E',
        emoji: SPELL_SCHOOL_EMOJI[school]
      }

    case 'placeholder':
      // Generate a data URL for colored circle
      return generateColoredCircle(SPELL_SCHOOL_COLORS[school], SPELL_SCHOOL_EMOJI[school])

    default:
      return SPELL_SCHOOL_EMOJI[school] || '✨'
  }
}

/**
 * Get icon for an item
 * @param {Object} item - Item data
 * @param {string} format - 'emoji', 'url', 'badge', 'game-icons'
 * @returns {string|Object} Icon representation
 */
export function getItemIcon(item, format = 'emoji') {
  const type = item.type || 'Miscellaneous'
  const rarity = item.rarity || 'Common'

  switch (format) {
    case 'emoji':
      return ITEM_TYPE_EMOJI[type] || '📦'

    case 'game-icons':
      const iconName = ITEM_TYPE_ICONS[type] || 'knapsack'
      return `https://game-icons.net/icons/ffffff/000000/1x1/various-artists/${iconName}.svg`

    case 'game-icons-colored':
      const icon = ITEM_TYPE_ICONS[type] || 'knapsack'
      const color = RARITY_COLORS[rarity]?.substring(1) || 'ffffff'
      return `https://game-icons.net/icons/${color}/000000/1x1/various-artists/${icon}.svg`

    case 'badge':
      return {
        text: type.substring(0, 3).toUpperCase(),
        color: RARITY_COLORS[rarity] || '#9E9E9E',
        emoji: ITEM_TYPE_EMOJI[type]
      }

    case 'placeholder':
      return generateColoredCircle(RARITY_COLORS[rarity], ITEM_TYPE_EMOJI[type])

    default:
      return ITEM_TYPE_EMOJI[type] || '📦'
  }
}

/**
 * Generate a colored circle SVG as data URL
 * @param {string} color - Hex color
 * @param {string} emoji - Emoji to display
 * @returns {string} Data URL
 */
function generateColoredCircle(color, emoji) {
  const svg = `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="${color}" stroke="#fff" stroke-width="2"/>
      <text x="32" y="42" font-size="32" text-anchor="middle">${emoji}</text>
    </svg>
  `
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

/**
 * Convert iconLayers to display format
 * @param {Array} iconLayers - Your existing iconLayers format
 * @param {Object} ability - Ability data for fallback
 * @returns {string} Display-ready icon
 */
export function parseIconLayers(iconLayers, ability) {
  // If iconLayers exists and has valid data, use it
  if (iconLayers && iconLayers.length > 0 && iconLayers[0][0]) {
    const iconId = iconLayers[0][0]

    // Check if it's already a full URL
    if (iconId.startsWith('http')) {
      return iconId
    }

    // Check if it's a data URI
    if (iconId.startsWith('data:')) {
      return iconId
    }

    // If it's an ID, construct URL to your icon server
    // TODO: Replace with your actual icon server URL
    return `https://api.characterfoundry.io/icons/${iconId}`
  }

  // Fallback to emoji/game-icons
  if (ability.school) {
    return getSpellIcon(ability, 'game-icons-colored')
  } else if (ability.type) {
    return getItemIcon(ability, 'game-icons-colored')
  }

  return '✨'
}

/**
 * Update import script to use this system
 */
export function generateIconLayers(ability) {
  const category = ability.school ? 'spell' : 'item'

  // Generate multiple icon format options
  const icons = {
    emoji: category === 'spell' ?
      getSpellIcon(ability, 'emoji') :
      getItemIcon(ability, 'emoji'),

    gameIconsUrl: category === 'spell' ?
      getSpellIcon(ability, 'game-icons-colored') :
      getItemIcon(ability, 'game-icons-colored'),

    placeholder: category === 'spell' ?
      getSpellIcon(ability, 'placeholder') :
      getItemIcon(ability, 'placeholder')
  }

  // Store as iconLayers in your format
  // For now, use game-icons URL
  return [[icons.gameIconsUrl]]
}

export default {
  getSpellIcon,
  getItemIcon,
  parseIconLayers,
  generateIconLayers,
  SPELL_SCHOOL_EMOJI,
  ITEM_TYPE_EMOJI,
  SPELL_SCHOOL_COLORS,
  RARITY_COLORS
}
