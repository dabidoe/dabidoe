#!/usr/bin/env python3
"""
Add fallback embedded spell data so spells work without a web server
"""

import json

# Read the spells file
with open('spells-srd.json', 'r') as f:
    all_spells = json.load(f)

# Create a minimal spell dataset with just essential spells for testing
essential_spells = []
spell_names = [
    # Cantrips
    'Fire Bolt', 'Ray of Frost', 'Sacred Flame', 'Eldritch Blast', 'Acid Splash',
    'Light', 'Mage Hand', 'Prestidigitation', 'Guidance', 'Thaumaturgy',
    # Level 1
    'Cure Wounds', 'Magic Missile', 'Shield', 'Healing Word', 'Thunderwave',
    'Burning Hands', 'Detect Magic', 'Mage Armor', 'Sleep', 'Charm Person',
    # Level 2
    'Scorching Ray', 'Shatter', 'Invisibility', 'Hold Person', 'Spiritual Weapon',
    'Misty Step', 'Web', 'Mirror Image', 'Lesser Restoration', 'Prayer of Healing',
    # Level 3
    'Fireball', 'Lightning Bolt', 'Counterspell', 'Dispel Magic', 'Revivify',
    'Fly', 'Haste', 'Spirit Guardians', 'Mass Healing Word', 'Conjure Animals',
    # Level 4-5
    'Ice Storm', 'Wall of Fire', 'Greater Invisibility', 'Polymorph', 'Banishment',
    'Cone of Cold', 'Mass Cure Wounds', 'Raise Dead', 'Teleportation Circle', 'Flame Strike'
]

for spell in all_spells:
    if spell['name'] in spell_names:
        essential_spells.append(spell)

print(f"Selected {len(essential_spells)} essential spells out of {len(all_spells)} total")

# Read the HTML file
with open('test-enhanced-features.html', 'r') as f:
    content = f.read()

# Find the catch block in fetchSpellsFromAPI
catch_start = content.find('      } catch (error) {')
if catch_start == -1:
    print("Error: Could not find catch block")
    exit(1)

# Find the end of the catch block (next closing brace at same indentation)
catch_end = content.find('\n    }', catch_start) + 6

old_catch_block = content[catch_start:catch_end]

# Create JavaScript array from essential spells
spells_js = json.dumps(essential_spells, separators=(',', ':'))

# Create new catch block with fallback
new_catch_block = f'''      }} catch (error) {{
        console.warn('Could not load spells-srd.json, using embedded fallback spells:', error);

        // Fallback: Use embedded essential spells (works without web server)
        const fallbackSpells = {spells_js};

        // Map to our format
        allSpellsFromAPI = fallbackSpells.map(spell => ({{
          index: spell.name.toLowerCase().replace(/\\s+/g, '-').replace(/[^\\w-]/g, ''),
          name: spell.name,
          level: spell.level === 'cantrip' ? 0 : parseInt(spell.level),
          school: {{ name: spell.school }},
          desc: [spell.description],
          casting_time: spell.casting_time,
          range: spell.range,
          components: spell.components.raw,
          duration: spell.duration,
          concentration: spell.duration.includes('Concentration'),
          ritual: spell.ritual
        }}));

        filteredSpells = allSpellsFromAPI;
        renderPickerSpells(filteredSpells);

        // Show info message
        const infoMsg = `<div style="background: #ff9800; color: white; padding: 10px; margin-bottom: 10px; border-radius: 6px; font-size: 0.9rem;">
          ℹ️ Using embedded spell database (${{allSpellsFromAPI.length}} spells).
          For full spell list, run: <code style="background: rgba(0,0,0,0.2); padding: 2px 6px; border-radius: 3px;">python3 -m http.server 8000</code>
        </div>`;
        body.insertAdjacentHTML('afterbegin', infoMsg);
        return;
      }}
    }}'''

# Replace the catch block
content = content[:catch_start] + new_catch_block + content[catch_end:]

# Write the file
with open('test-enhanced-features.html', 'w') as f:
    f.write(content)

print(f"✅ Added fallback with {len(essential_spells)} embedded spells")
print("✅ Spells will now work without a web server!")
print("\nFor full spell database, run: python3 -m http.server 8000")
