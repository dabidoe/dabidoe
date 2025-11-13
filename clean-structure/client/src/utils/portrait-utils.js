/**
 * Portrait Utilities
 * Helpers for generating and managing character portraits
 */

/**
 * Generate a fantasy portrait URL using DiceBear API
 * @param {string} seed - Unique identifier (usually character name)
 * @param {string} style - Avatar style ('adventurer', 'avataaars', 'bottts', 'pixel-art')
 * @returns {string} Portrait URL
 */
export function generatePortraitUrl(seed, style = 'adventurer') {
  const cleanSeed = seed.toLowerCase().replace(/\s+/g, '-');
  const baseUrl = 'https://api.dicebear.com/7.x';
  const options = [
    'backgroundColor=1a1a1a',
    'radius=10'
  ].join('&');

  return `${baseUrl}/${style}/svg?seed=${cleanSeed}&${options}`;
}

/**
 * Alternative portrait styles for variety
 */
export const PORTRAIT_STYLES = {
  ADVENTURER: 'adventurer',    // Fantasy RPG style (default)
  AVATAAARS: 'avataaars',       // Cartoon style
  BOTTTS: 'bottts',             // Robot/tech style
  PIXEL_ART: 'pixel-art',       // 8-bit retro style
  BIG_EARS: 'big-ears',         // Cute chibi style
  PERSONAS: 'personas'          // Abstract minimal style
};

/**
 * Get race-appropriate portrait style
 */
export function getStyleForRace(race) {
  const raceStyles = {
    'warforged': PORTRAIT_STYLES.BOTTTS,
    'construct': PORTRAIT_STYLES.BOTTTS,
    'human': PORTRAIT_STYLES.ADVENTURER,
    'elf': PORTRAIT_STYLES.ADVENTURER,
    'dwarf': PORTRAIT_STYLES.ADVENTURER,
    'halfling': PORTRAIT_STYLES.BIG_EARS,
    'gnome': PORTRAIT_STYLES.BIG_EARS,
    'half-orc': PORTRAIT_STYLES.ADVENTURER,
    'dragonborn': PORTRAIT_STYLES.ADVENTURER,
    'tiefling': PORTRAIT_STYLES.ADVENTURER
  };

  return raceStyles[race?.toLowerCase()] || PORTRAIT_STYLES.ADVENTURER;
}

/**
 * Get class-themed background color
 */
export function getColorForClass(className) {
  const classColors = {
    'fighter': '8b0000',    // Dark red
    'barbarian': 'b22222',  // Firebrick
    'paladin': 'ffd700',    // Gold
    'ranger': '228b22',     // Forest green
    'rogue': '2f4f4f',      // Dark slate gray
    'wizard': '4169e1',     // Royal blue
    'sorcerer': '8b008b',   // Dark magenta
    'warlock': '6a0dad',    // Purple
    'cleric': 'f0e68c',     // Khaki
    'druid': '556b2f',      // Dark olive green
    'bard': 'ff69b4',       // Hot pink
    'monk': 'd2691e'        // Chocolate
  };

  return classColors[className?.toLowerCase()] || '1a1a1a';
}

/**
 * Upload portrait from file (client-side)
 * Converts file to base64 data URL
 */
export async function uploadPortraitFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Invalid file type. Please upload an image.'));
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('File too large. Maximum size is 5MB.'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      resolve(e.target.result); // Returns data URL
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validate external portrait URL
 */
export function isValidPortraitUrl(url) {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * Get fallback emoji for character
 */
export function getFallbackEmoji(className) {
  const emojiMap = {
    'fighter': '⚔️',
    'barbarian': '🪓',
    'paladin': '🛡️',
    'ranger': '🏹',
    'rogue': '🗡️',
    'wizard': '🧙',
    'sorcerer': '✨',
    'warlock': '🔮',
    'cleric': '☀️',
    'druid': '🌿',
    'bard': '🎵',
    'monk': '👊'
  };

  return emojiMap[className?.toLowerCase()] || '🎭';
}

export default {
  generatePortraitUrl,
  getStyleForRace,
  getColorForClass,
  uploadPortraitFile,
  isValidPortraitUrl,
  getFallbackEmoji,
  PORTRAIT_STYLES
};
