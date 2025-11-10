#!/usr/bin/env python3
"""
Add character creator to the hamburger menu
"""

# Read the file
with open('test-enhanced-features.html', 'r') as f:
    content = f.read()

# STEP 1: Add "+ NEW" button to character menu HTML
menu_header_pos = content.find('<div class="character-list" id="characterList">')
if menu_header_pos != -1:
    new_button_html = '''      <button onclick="openCharacterCreator()" style="width: calc(100% - 20px); margin: 10px 10px 15px 10px; padding: 12px; background: var(--accent-color); border: none; border-radius: 6px; color: white; font-weight: 600; cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center; gap: 8px;">
        <span style="font-size: 1.3rem;">+</span> NEW CHARACTER
      </button>
      '''

    if '+ NEW CHARACTER' not in content:
        content = content[:menu_header_pos] + new_button_html + content[menu_header_pos:]
        print("✅ Added + NEW button to character menu")

# STEP 2: Add character creation modal HTML before closing body tag
body_close = content.rfind('</body>')
if body_close != -1:
    modal_html = '''
  <!-- Character Creator Modal -->
  <div class="spell-modal-overlay" id="characterCreatorOverlay" onclick="closeCharacterCreator(event)" style="z-index: 11000;">
    <div class="spell-modal" onclick="event.stopPropagation()" style="max-width: 600px;">
      <div class="spell-modal-header">
        <div class="spell-modal-icon">🎭</div>
        <div class="spell-modal-title">
          <div class="spell-modal-name">Create New Character</div>
          <div class="spell-modal-level">Build your D&D adventurer</div>
        </div>
        <button class="spell-modal-close" onclick="closeCharacterCreator()">✕</button>
      </div>

      <div class="spell-modal-body" style="padding: 20px;">
        <div style="display: flex; flex-direction: column; gap: 15px;">

          <!-- Name Input -->
          <div>
            <label style="display: block; color: var(--text-primary); font-weight: 600; margin-bottom: 5px;">Character Name</label>
            <input type="text" id="newCharName" placeholder="Enter character name" style="width: 100%; padding: 10px; background: var(--background-color); color: var(--text-primary); border: 2px solid var(--border-color); border-radius: 6px; font-size: 1rem;">
          </div>

          <!-- Class Dropdown -->
          <div>
            <label style="display: block; color: var(--text-primary); font-weight: 600; margin-bottom: 5px;">Class</label>
            <select id="newCharClass" style="width: 100%; padding: 10px; background: var(--background-color); color: var(--text-primary); border: 2px solid var(--border-color); border-radius: 6px; font-size: 1rem;">
              <option value="barbarian">Barbarian</option>
              <option value="bard">Bard</option>
              <option value="cleric">Cleric</option>
              <option value="druid">Druid</option>
              <option value="fighter">Fighter</option>
              <option value="monk">Monk</option>
              <option value="paladin">Paladin</option>
              <option value="ranger">Ranger</option>
              <option value="rogue">Rogue</option>
              <option value="sorcerer">Sorcerer</option>
              <option value="warlock">Warlock</option>
              <option value="wizard">Wizard</option>
            </select>
          </div>

          <!-- Race Dropdown -->
          <div>
            <label style="display: block; color: var(--text-primary); font-weight: 600; margin-bottom: 5px;">Race</label>
            <select id="newCharRace" style="width: 100%; padding: 10px; background: var(--background-color); color: var(--text-primary); border: 2px solid var(--border-color); border-radius: 6px; font-size: 1rem;">
              <option value="human">Human</option>
              <option value="elf">Elf</option>
              <option value="dwarf">Dwarf</option>
              <option value="halfling">Halfling</option>
              <option value="dragonborn">Dragonborn</option>
              <option value="gnome">Gnome</option>
              <option value="half-elf">Half-Elf</option>
              <option value="half-orc">Half-Orc</option>
              <option value="tiefling">Tiefling</option>
            </select>
          </div>

          <!-- Level Input -->
          <div>
            <label style="display: block; color: var(--text-primary); font-weight: 600; margin-bottom: 5px;">Starting Level</label>
            <input type="number" id="newCharLevel" value="1" min="1" max="20" style="width: 100%; padding: 10px; background: var(--background-color); color: var(--text-primary); border: 2px solid var(--border-color); border-radius: 6px; font-size: 1rem;">
          </div>

          <!-- Create Button -->
          <button onclick="createNewCharacter()" style="width: 100%; padding: 12px; background: var(--accent-color); border: none; border-radius: 6px; color: white; font-weight: 600; cursor: pointer; font-size: 1.1rem; margin-top: 10px;">
            ✨ Create Character
          </button>

          <!-- Load Existing Button -->
          <button onclick="showComingSoon()" style="width: 100%; padding: 10px; background: var(--surface-color); border: 2px solid var(--border-color); border-radius: 6px; color: var(--text-secondary); font-weight: 500; cursor: pointer; font-size: 0.95rem;">
            📂 Load Existing Character
          </button>

        </div>
      </div>
    </div>
  </div>

'''

    if 'characterCreatorOverlay' not in content:
        content = content[:body_close] + modal_html + content[body_close:]
        print("✅ Added character creator modal HTML")

# STEP 3: Add JavaScript functions before closing script tag
last_script_close = content.rfind('  </script>')
if last_script_close != -1:
    js_functions = '''
    // Character Creator Functions
    function openCharacterCreator() {
      document.getElementById('characterCreatorOverlay').classList.add('show');
      // Reset form
      document.getElementById('newCharName').value = '';
      document.getElementById('newCharClass').value = 'fighter';
      document.getElementById('newCharRace').value = 'human';
      document.getElementById('newCharLevel').value = '1';
    }

    function closeCharacterCreator(event) {
      if (event && event.target !== event.currentTarget) return;
      document.getElementById('characterCreatorOverlay').classList.remove('show');
    }

    function showComingSoon() {
      alert('📂 Coming Soon!\\n\\nLoad Existing Character will allow you to import characters from saved files. This feature requires Node.js integration and will be available in a future update.');
    }

    function createNewCharacter() {
      const name = document.getElementById('newCharName').value.trim();
      const charClass = document.getElementById('newCharClass').value;
      const race = document.getElementById('newCharRace').value;
      const level = parseInt(document.getElementById('newCharLevel').value);

      if (!name) {
        alert('Please enter a character name!');
        return;
      }

      // Generate character emoji based on class
      const classEmojis = {
        barbarian: '⚔️', bard: '🎵', cleric: '✝️', druid: '🌿',
        fighter: '🗡️', monk: '🥋', paladin: '🛡️', ranger: '🏹',
        rogue: '🗡️', sorcerer: '🔮', warlock: '👁️', wizard: '🧙'
      };

      // Determine class type for spells
      const classTypes = {
        barbarian: 'melee', fighter: 'melee', monk: 'melee', rogue: 'melee',
        bard: 'caster', cleric: 'caster', druid: 'caster', sorcerer: 'caster', warlock: 'caster', wizard: 'caster',
        paladin: 'halfcaster', ranger: 'halfcaster'
      };

      // Generate basic stats (standard array)
      const stats = { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 };

      // Create new character object
      const newChar = {
        id: name.toLowerCase().replace(/\\s+/g, '_'),
        name: name,
        emoji: classEmojis[charClass] || '🎭',
        class: charClass.charAt(0).toUpperCase() + charClass.slice(1),
        subclass: 'Choose subclass at level 3',
        race: race.charAt(0).toUpperCase() + race.slice(1),
        alignment: 'Neutral Good',
        classType: classTypes[charClass] || 'melee',
        level: level,
        hp: { current: 10 + level * 6, max: 10 + level * 6 },
        ac: 12,
        food: { current: 100, max: 100 },
        stats: stats,
        location: 'tavern',
        attacks: {
          melee: { name: 'Weapon', damage: '1d8+2', toHit: 4 },
          ranged: { name: 'Ranged Weapon', damage: '1d6+2', toHit: 4 }
        },
        inventory: [
          { id: 'weapon', name: 'Starting Weapon', type: 'weapon', equipped: true },
          { id: 'armor', name: 'Leather Armor', type: 'armor', equipped: true },
          { id: 'healing_potion', name: 'Potion of Healing', type: 'consumable', quantity: 2 }
        ],
        skills: {
          acrobatics: ['dex', 0], animalHandling: ['wis', 0], arcana: ['int', 0],
          athletics: ['str', 1], deception: ['cha', 0], history: ['int', 0],
          insight: ['wis', 0], intimidation: ['cha', 0], investigation: ['int', 0],
          medicine: ['wis', 0], nature: ['int', 0], perception: ['wis', 1],
          performance: ['cha', 0], persuasion: ['cha', 0], religion: ['int', 0],
          sleightOfHand: ['dex', 0], stealth: ['dex', 0], survival: ['wis', 0]
        },
        abilities: [
          { id: 'basic_attack', name: 'Basic Attack', icon: '⚔️', damage: '1d8+2', description: 'Standard weapon attack' }
        ],
        spells: {},
        states: {
          default: { mood: 'determined', greeting: `I am ${name}, ready for adventure!` },
          battle: { mood: 'focused', greeting: 'Let\\'s do this!' },
          injured: { mood: 'pained', greeting: 'I\\'ve taken some damage...' },
          triumphant: { mood: 'joyful', greeting: 'Victory is ours!' }
        }
      };

      // Add to characters array
      characters.push(newChar);

      // Switch to new character
      currentCharacter = newChar;
      const newIndex = characters.length - 1;

      // Update displays
      updateCharacterDisplay();
      populateCharacterMenu();
      updateSpellsTab();
      updateAbilitiesTab();

      // Close modals
      closeCharacterCreator();
      closeMenu();

      // Notify user
      addBattleLog(`🎭 ${name} has joined the party!`);
      alert(`✨ ${name} created successfully!\\n\\nClass: ${newChar.class}\\nRace: ${newChar.race}\\nLevel: ${level}`);
    }

'''

    if 'function openCharacterCreator' not in content:
        content = content[:last_script_close] + js_functions + content[last_script_close:]
        print("✅ Added character creator JavaScript functions")

# Write the file
with open('test-enhanced-features.html', 'w') as f:
    f.write(content)

print("\n🎉 Character creator added!")
print("\nFeatures:")
print("  - + NEW CHARACTER button in hamburger menu")
print("  - Character creation modal with name, class, race, level inputs")
print("  - Generates basic character with stats and abilities")
print("  - 'Load Existing' button shows 'Coming Soon' message")
print("  - New character automatically switches and updates display")
