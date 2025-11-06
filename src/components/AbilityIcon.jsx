import { parseIconLayers, getSpellIcon, getItemIcon } from '../utils/icons'
import './AbilityIcon.css'

/**
 * AbilityIcon Component
 *
 * Displays ability icons with multiple fallback options:
 * 1. Custom uploaded image (if iconLayers has URL)
 * 2. Game-icons.net API icon
 * 3. Emoji fallback
 *
 * Props:
 * - ability: Ability object with iconLayers, school, type
 * - size: 'small' | 'medium' | 'large' (default: 'medium')
 * - format: 'auto' | 'emoji' | 'image' (default: 'auto')
 */
function AbilityIcon({ ability, size = 'medium', format = 'auto' }) {
  const details = ability.details || ability

  // Get icon based on format
  const getIcon = () => {
    if (format === 'emoji') {
      if (details.school) {
        return { type: 'emoji', value: getSpellIcon(details, 'emoji') }
      } else if (details.type) {
        return { type: 'emoji', value: getItemIcon(details, 'emoji') }
      }
      return { type: 'emoji', value: '✨' }
    }

    // Auto format: try iconLayers first, then game-icons, then emoji
    if (format === 'auto' || format === 'image') {
      try {
        const iconUrl = parseIconLayers(ability.iconLayers, details)

        // If it's a URL (game-icons or custom), use image
        if (iconUrl && (iconUrl.startsWith('http') || iconUrl.startsWith('data:'))) {
          return { type: 'image', value: iconUrl }
        }
      } catch (e) {
        console.warn('Error parsing icon layers:', e)
      }
    }

    // Fallback to emoji
    if (details.school) {
      return { type: 'emoji', value: getSpellIcon(details, 'emoji') }
    } else if (details.type) {
      return { type: 'emoji', value: getItemIcon(details, 'emoji') }
    }

    return { type: 'emoji', value: '✨' }
  }

  const icon = getIcon()

  const sizeClass = `ability-icon-${size}`
  const categoryClass = details.school ? 'spell-icon' : details.type ? 'item-icon' : ''

  if (icon.type === 'emoji') {
    return (
      <span className={`ability-icon ${sizeClass} ${categoryClass} emoji-icon`}>
        {icon.value}
      </span>
    )
  }

  if (icon.type === 'image') {
    return (
      <img
        src={icon.value}
        alt={details.name || 'Ability icon'}
        className={`ability-icon ${sizeClass} ${categoryClass} image-icon`}
        onError={(e) => {
          // Fallback to emoji if image fails to load
          e.target.style.display = 'none'
          e.target.parentElement?.classList.add('image-error')
        }}
      />
    )
  }

  return <span className={`ability-icon ${sizeClass}`}>✨</span>
}

export default AbilityIcon
