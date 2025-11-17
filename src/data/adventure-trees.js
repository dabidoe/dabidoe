/**
 * Adventure Trees - Solo Play Adventures
 *
 * Structure:
 * - Each adventure is a tree/graph of nodes
 * - Node types: narrative, choice, combat, skillCheck
 * - Choices branch to other nodes
 * - Can integrate with dice rolls and combat
 */

export const ADVENTURE_TYPES = {
  NARRATIVE: 'narrative',    // Story moment, no choices yet
  CHOICE: 'choice',           // Player makes a decision
  COMBAT: 'combat',           // Triggers combat encounter
  SKILL_CHECK: 'skillCheck',  // Requires dice roll
  END: 'end'                  // Adventure conclusion
}

/**
 * Example Adventure: The Mysterious Grove
 */
export const mysteriousGroveAdventure = {
  id: 'mysterious-grove',
  title: 'The Mysterious Grove',
  startNode: 'grove-entrance',
  nodes: {
    'grove-entrance': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "You stand at the edge of an ancient grove. The trees here are impossibly tall, their branches forming a canopy that blocks out most sunlight. As you step forward, you hear rustling in the bushes ahead and sense movement in the shadows.",
      characterResponse: "I've seen many battlefields, but this place... there's something unnatural here. Stay alert.",
      nextNode: 'first-choice'
    },

    'first-choice': {
      type: ADVENTURE_TYPES.CHOICE,
      text: "What do you do?",
      choices: [
        {
          id: 'sneak',
          text: "🤫 Sneak closer to investigate quietly",
          icon: '👣',
          nextNode: 'sneak-check'
        },
        {
          id: 'combat-ready',
          text: "⚔️ Draw your weapon and prepare for combat",
          icon: '🛡️',
          nextNode: 'combat-ready-stance'
        },
        {
          id: 'call-out',
          text: "📢 Call out to whoever is there",
          icon: '🗣️',
          nextNode: 'call-out-result'
        },
        {
          id: 'retreat',
          text: "🏃 Carefully retreat and observe from a distance",
          icon: '👁️',
          nextNode: 'retreat-observation'
        }
      ]
    },

    'sneak-check': {
      type: ADVENTURE_TYPES.SKILL_CHECK,
      skill: 'stealth',
      dc: 12,
      text: "You crouch low and begin moving through the underbrush. Roll a Stealth check!",
      characterResponse: "Remember your training - move with the shadows, not against them.",
      successNode: 'sneak-success',
      failureNode: 'sneak-failure'
    },

    'sneak-success': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "Your movements are silent as a whisper. As you approach, you see three goblin scouts arguing over a map. They haven't noticed you yet. You have the advantage!",
      characterResponse: "Well done. The element of surprise is ours. Strike now, or gather more information?",
      nextNode: 'ambush-choice'
    },

    'sneak-failure': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "A twig snaps under your foot with a loud CRACK! The bushes explode with activity as three goblin scouts whirl around to face you, weapons drawn.",
      characterResponse: "So much for stealth. Ready yourself - they're coming!",
      nextNode: 'goblin-combat'
    },

    'combat-ready-stance': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "You draw your weapon, the steel singing as it leaves its sheath. The sound echoes through the grove. Whatever was hiding immediately goes silent... then you hear the sound of multiple creatures rushing toward you!",
      characterResponse: "Here they come! Stand your ground!",
      nextNode: 'goblin-combat'
    },

    'call-out-result': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: '"Show yourself!" you call into the shadows. For a moment, there's only silence. Then a gravelly voice responds: "You dare enter our territory? You will regret this, outlander!" Three goblin scouts emerge, weapons raised.',
      characterResponse: "Diplomacy was worth a try, but these creatures want blood. Prepare yourself!",
      nextNode: 'combat-or-persuade'
    },

    'retreat-observation': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "You back away carefully, finding a concealed position behind a large oak. From here, you can observe without being seen. After a few moments, three goblin scouts emerge, looking around nervously before heading deeper into the grove.",
      characterResponse: "Patience is often the warrior's greatest weapon. We've learned their numbers and direction. What now?",
      nextNode: 'tracking-choice'
    },

    'ambush-choice': {
      type: ADVENTURE_TYPES.CHOICE,
      text: "You have the advantage. How do you proceed?",
      choices: [
        {
          id: 'ambush',
          text: "⚔️ Launch a surprise attack",
          icon: '💥',
          nextNode: 'ambush-combat'
        },
        {
          id: 'listen',
          text: "👂 Stay hidden and listen to their conversation",
          icon: '🤫',
          nextNode: 'eavesdrop-success'
        }
      ]
    },

    'eavesdrop-success': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: 'You stay perfectly still and listen. "The boss said the treasure\'s in the old ruins," one goblin hisses. "But there\'s traps everywhere. We need to find another way in." They mark a location on their map, then head off deeper into the grove.',
      characterResponse: "Interesting... treasure and ruins. This adventure just became more worthwhile. Shall we follow them or head to these ruins ourselves?",
      nextNode: 'treasure-choice'
    },

    'treasure-choice': {
      type: ADVENTURE_TYPES.CHOICE,
      text: "You've learned about treasure in nearby ruins. What's your next move?",
      choices: [
        {
          id: 'follow-goblins',
          text: "👣 Follow the goblins quietly",
          icon: '🔍',
          nextNode: 'follow-goblins'
        },
        {
          id: 'head-to-ruins',
          text: "🏛️ Go directly to the ruins",
          icon: '⚡',
          nextNode: 'ruins-approach'
        },
        {
          id: 'take-map',
          text: "⚔️ Attack now and take their map",
          icon: '🗺️',
          nextNode: 'ambush-combat'
        }
      ]
    },

    'combat-or-persuade': {
      type: ADVENTURE_TYPES.CHOICE,
      text: "The goblins are hostile but haven't attacked yet. There might be a moment to defuse this.",
      choices: [
        {
          id: 'fight',
          text: "⚔️ Attack first!",
          icon: '💥',
          nextNode: 'goblin-combat'
        },
        {
          id: 'persuade',
          text: "💬 Attempt to reason with them (Persuasion check)",
          icon: '🗣️',
          nextNode: 'persuasion-check'
        }
      ]
    },

    'persuasion-check': {
      type: ADVENTURE_TYPES.SKILL_CHECK,
      skill: 'persuasion',
      dc: 15,
      text: "You lower your weapon slightly and begin to speak. Roll a Persuasion check!",
      characterResponse: "Words can be as powerful as blades... sometimes.",
      successNode: 'persuasion-success',
      failureNode: 'persuasion-failure'
    },

    'persuasion-success': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: 'Your words seem to reach them. The lead goblin lowers his spear slightly. "You... you\'re not with the bandits?" He seems confused but less hostile. "If you\'re here for the ruins, be warned - there are worse things than us in this grove."',
      characterResponse: "Well spoken. We may have just gained unexpected allies... or at least avoided unnecessary bloodshed.",
      nextNode: 'goblin-info'
    },

    'persuasion-failure': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: 'The lead goblin spits on the ground. "Lies! All humans lie! Attack!" Your attempt at diplomacy has failed.',
      characterResponse: "Sometimes words fail. Now we fight!",
      nextNode: 'goblin-combat'
    },

    'tracking-choice': {
      type: ADVENTURE_TYPES.CHOICE,
      text: "The goblins have moved deeper into the grove. What do you do?",
      choices: [
        {
          id: 'follow',
          text: "👣 Follow them from a distance",
          icon: '🔍',
          nextNode: 'follow-goblins'
        },
        {
          id: 'explore',
          text: "🗺️ Explore the grove in a different direction",
          icon: '🧭',
          nextNode: 'grove-exploration'
        },
        {
          id: 'leave',
          text: "🏃 Leave the grove - this seems too dangerous",
          icon: '🚪',
          nextNode: 'leave-grove'
        }
      ]
    },

    'goblin-combat': {
      type: ADVENTURE_TYPES.COMBAT,
      text: "Combat begins! You face three goblin scouts.",
      characterResponse: "Remember - goblins are cowardly. Take down their leader and the others may flee!",
      enemies: [
        { name: 'Goblin Scout 1', hp: 12, ac: 13 },
        { name: 'Goblin Scout 2', hp: 12, ac: 13 },
        { name: 'Goblin Leader', hp: 18, ac: 14 }
      ],
      victoryNode: 'combat-victory',
      defeatNode: 'combat-defeat'
    },

    'ambush-combat': {
      type: ADVENTURE_TYPES.COMBAT,
      text: "You strike from the shadows! You have advantage on your first attack.",
      characterResponse: "Swift and decisive - exactly as it should be!",
      enemies: [
        { name: 'Goblin Scout 1', hp: 12, ac: 13 },
        { name: 'Goblin Scout 2', hp: 12, ac: 13 },
        { name: 'Goblin Leader', hp: 18, ac: 14 }
      ],
      hasAdvantage: true,
      victoryNode: 'combat-victory',
      defeatNode: 'combat-defeat'
    },

    'combat-victory': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "The last goblin falls with a cry. As the dust settles, you notice one of them was carrying a crude map showing a location deeper in the grove marked with an 'X' and the word 'treasure' scratched in Common.",
      characterResponse: "Victory! And it seems our foes were after something valuable. Perhaps we should investigate these ruins ourselves?",
      nextNode: 'after-combat-choice'
    },

    'combat-defeat': {
      type: ADVENTURE_TYPES.END,
      text: "The goblins overwhelm you. As darkness closes in, you hear their chattering laughter echoing through the grove...",
      characterResponse: "Even the greatest warriors fall sometimes. We will return stronger.",
      endType: 'defeat'
    },

    'after-combat-choice': {
      type: ADVENTURE_TYPES.CHOICE,
      text: "You've defeated the goblins and found their map. What now?",
      choices: [
        {
          id: 'follow-map',
          text: "🗺️ Follow the map to the treasure",
          icon: '💎',
          nextNode: 'ruins-approach'
        },
        {
          id: 'rest',
          text: "🏕️ Rest and recover before continuing",
          icon: '❤️',
          nextNode: 'short-rest'
        },
        {
          id: 'leave-with-loot',
          text: "💰 Take the goblins' belongings and leave",
          icon: '🚪',
          nextNode: 'leave-with-loot'
        }
      ]
    },

    'ruins-approach': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "Following the map, you arrive at a set of ancient stone ruins half-buried in the forest floor. Moss covers the weathered stones, and you can see a dark entrance leading underground. Strange symbols are carved around the doorway.",
      characterResponse: "These ruins are old... older than any kingdom I've known. Tread carefully - ancient places hold ancient dangers.",
      nextNode: 'ruins-entrance-choice'
    },

    'ruins-entrance-choice': {
      type: ADVENTURE_TYPES.CHOICE,
      text: "You stand before the ancient ruins. How do you proceed?",
      choices: [
        {
          id: 'examine-symbols',
          text: "🔍 Examine the symbols (Investigation check)",
          icon: '📜',
          nextNode: 'examine-symbols'
        },
        {
          id: 'enter-ruins',
          text: "🚪 Enter the ruins cautiously",
          icon: '🏛️',
          nextNode: 'enter-ruins'
        },
        {
          id: 'mark-location',
          text: "🗺️ Mark the location and return later prepared",
          icon: '📍',
          nextNode: 'mark-and-return'
        }
      ]
    },

    'examine-symbols': {
      type: ADVENTURE_TYPES.SKILL_CHECK,
      skill: 'investigation',
      dc: 14,
      text: "You study the ancient symbols carefully. Roll an Investigation check!",
      characterResponse: "Knowledge is a warrior's shield. Let's see what these markings tell us.",
      successNode: 'symbols-decoded',
      failureNode: 'symbols-mystery'
    },

    'symbols-decoded': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "The symbols speak of a trial - a test for those seeking the 'Blade of Dawn', a legendary weapon said to shine with the light of the first sunrise. The inscription warns: 'Only the worthy may claim what lies within. The cowardly and the cruel shall find only doom.'",
      characterResponse: "A legendary blade? Now this is a quest worthy of a warrior! But the warning is clear - we must prove ourselves worthy.",
      nextNode: 'ruins-entrance-choice-informed'
    },

    'symbols-mystery': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "The symbols are too worn and ancient for you to fully decipher. You can make out words like 'trial' and 'worthy' but the full meaning escapes you.",
      characterResponse: "The past keeps its secrets. We'll have to learn the hard way. Shall we enter?",
      nextNode: 'enter-ruins'
    },

    'ruins-entrance-choice-informed': {
      type: ADVENTURE_TYPES.CHOICE,
      text: "You now know this is a trial for a legendary weapon. Do you dare enter?",
      choices: [
        {
          id: 'accept-trial',
          text: "⚔️ Accept the trial and enter",
          icon: '🏆',
          nextNode: 'enter-ruins'
        },
        {
          id: 'prepare-first',
          text: "📦 Return to prepare better for this trial",
          icon: '🎒',
          nextNode: 'mark-and-return'
        }
      ]
    },

    'enter-ruins': {
      type: ADVENTURE_TYPES.END,
      text: "You step into the darkness of the ancient ruins. The air grows cold, and you hear the sound of stone grinding against stone as mechanisms older than memory begin to stir. Your adventure continues...",
      characterResponse: "Whatever trials await us in these depths, we face them together. Glory awaits!",
      endType: 'success',
      message: 'To be continued... (This is where the next adventure branch would begin!)'
    },

    'mark-and-return': {
      type: ADVENTURE_TYPES.END,
      text: "You carefully mark the location on your own map. This place isn't going anywhere, and preparation is the key to success. You'll return when you're better equipped for whatever challenges lie within.",
      characterResponse: "A wise choice. Even the greatest warriors know when to retreat and regroup. We shall return triumphant!",
      endType: 'success',
      message: 'You can return to this adventure at any time!'
    },

    'follow-goblins': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "You shadow the goblins through the grove. They lead you to a larger encampment with at least a dozen goblins. This is more than you can handle alone right now.",
      characterResponse: "Their numbers are too great. We should fall back and find another approach - or report this to the proper authorities.",
      nextNode: 'encampment-choice'
    },

    'encampment-choice': {
      type: ADVENTURE_TYPES.CHOICE,
      text: "You've discovered a goblin encampment. What do you do?",
      choices: [
        {
          id: 'sneak-through',
          text: "🤫 Try to sneak past the encampment",
          icon: '👣',
          nextNode: 'sneak-past-camp'
        },
        {
          id: 'retreat-report',
          text: "🏃 Retreat and plan to return with help",
          icon: '📋',
          nextNode: 'retreat-for-help'
        }
      ]
    },

    'goblin-info': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: 'The goblin leader explains that bandits have been raiding the grove, and both goblins and travelers have suffered. "The ruins ahead hold something valuable," he says. "But there are traps and worse things. If you clear them out, we\'ll leave you in peace."',
      characterResponse: "An alliance with goblins? Unexpected, but pragmatic. Sometimes warriors must put aside old grudges for the greater good.",
      nextNode: 'alliance-choice'
    },

    'alliance-choice': {
      type: ADVENTURE_TYPES.CHOICE,
      text: "The goblins offer an uneasy alliance. How do you respond?",
      choices: [
        {
          id: 'accept',
          text: "🤝 Accept their offer and work together",
          icon: '🛡️',
          nextNode: 'goblin-alliance'
        },
        {
          id: 'decline',
          text: "❌ Decline and go your own way",
          icon: '🚶',
          nextNode: 'ruins-approach'
        }
      ]
    },

    'goblin-alliance': {
      type: ADVENTURE_TYPES.END,
      text: "The goblins agree to guide you to the ruins and even offer to stand watch while you explore. With unexpected allies at your side, you head deeper into the grove.",
      characterResponse: "Strange times make for strange allies. But today, we fight together!",
      endType: 'success',
      message: 'Your alliance with the goblins opens new possibilities...'
    },

    'grove-exploration': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "You explore deeper into the grove, discovering a peaceful glade with a crystal-clear spring. The water seems to shimmer with magical energy.",
      characterResponse: "A place of power. The waters here could restore our strength... or hide deeper mysteries.",
      nextNode: 'spring-choice'
    },

    'spring-choice': {
      type: ADVENTURE_TYPES.CHOICE,
      text: "You've found a magical spring. What do you do?",
      choices: [
        {
          id: 'drink',
          text: "💧 Drink from the spring",
          icon: '✨',
          nextNode: 'drink-spring'
        },
        {
          id: 'fill-waterskin',
          text: "🍶 Fill your waterskin for later",
          icon: '💼',
          nextNode: 'take-water'
        },
        {
          id: 'investigate',
          text: "🔍 Investigate the spring's magic (Arcana check)",
          icon: '🔮',
          nextNode: 'investigate-spring'
        }
      ]
    },

    'short-rest': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "You take a short rest, binding your wounds and catching your breath. You feel restored and ready to continue.",
      characterResponse: "Rest well earned. A warrior who doesn't know when to rest is a fool who won't live long.",
      nextNode: 'ruins-approach'
    },

    'leave-grove': {
      type: ADVENTURE_TYPES.END,
      text: "You decide discretion is the better part of valor and leave the grove behind. Sometimes survival is its own victory.",
      characterResponse: "Living to fight another day is not cowardice - it's wisdom. We shall return when better prepared.",
      endType: 'retreat'
    },

    'leave-with-loot': {
      type: ADVENTURE_TYPES.END,
      text: "You collect what the goblins were carrying - some copper coins, a few crude weapons, and their map. Perhaps you'll return to explore those ruins another day.",
      characterResponse: "A small victory, but victory nonetheless. The ruins can wait for a better day.",
      endType: 'success',
      rewards: ['15 copper pieces', 'Crude map', '2 rusty daggers']
    }
  }
}

/**
 * Adventure: The Pyramid Raid
 * An epic adventure through an ancient Egyptian pyramid
 */
export const pyramidRaidAdventure = {
  id: 'pyramid-raid',
  title: 'The Pyramid Raid',
  startNode: 'pyramid-entrance',
  nodes: {
    'pyramid-entrance': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "The scorching desert sun beats down as you stand before an ancient pyramid, its weathered limestone blocks rising like a monument to forgotten gods. The entrance - a dark portal flanked by towering statues of jackal-headed warriors - seems to beckon you forward. Hieroglyphic warnings cover the entrance: 'Turn back, mortals, lest you face the wrath of eternity.'",
      characterResponse: "I have stormed the gates of Troy and faced gods themselves. What are ancient curses to one who has already defied death? Let us claim what treasures lie within.",
      nextNode: 'entrance-choice'
    },

    'entrance-choice': {
      type: ADVENTURE_TYPES.CHOICE,
      text: "How do you approach the pyramid entrance?",
      choices: [
        {
          id: 'examine-entrance',
          text: "🔍 Examine the entrance for traps (Investigation check)",
          icon: '👁️',
          nextNode: 'examine-entrance'
        },
        {
          id: 'read-hieroglyphics',
          text: "📜 Study the hieroglyphic warnings carefully",
          icon: '📖',
          nextNode: 'read-hieroglyphics'
        },
        {
          id: 'bold-entry',
          text: "⚔️ Walk straight in - fortune favors the bold",
          icon: '💪',
          nextNode: 'bold-entry'
        },
        {
          id: 'search-alternate',
          text: "🗺️ Search for an alternate entrance",
          icon: '🔍',
          nextNode: 'search-alternate'
        }
      ]
    },

    'examine-entrance': {
      type: ADVENTURE_TYPES.SKILL_CHECK,
      skill: 'investigation',
      dc: 13,
      text: "You carefully examine the entrance, looking for pressure plates, tripwires, or suspicious mechanisms. Roll an Investigation check!",
      characterResponse: "A warrior's eyes must be sharp. Many battles are won before the first blow is struck.",
      successNode: 'trap-found',
      failureNode: 'trap-missed'
    },

    'trap-found': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "Your keen eyes spot it - a nearly invisible pressure plate just inside the entrance, connected to what looks like dart launchers in the walls. You carefully mark the trap and step around it, entering safely into a grand corridor lit by an eerie phosphorescent glow.",
      characterResponse: "Well spotted! Ancient builders were cunning, but we are cunninger still. These halls are ours to explore.",
      nextNode: 'grand-corridor'
    },

    'trap-missed': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "Finding nothing suspicious, you stride confidently into the entrance. Your foot lands on a hidden pressure plate with a soft *click*. Stone darts shoot from the walls! Roll to dodge! (You take 1d6 damage)",
      characterResponse: "Agh! These ancient builders were craftier than I gave them credit for. Stay alert!",
      nextNode: 'grand-corridor-wounded'
    },

    'read-hieroglyphics': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "The hieroglyphics tell a story: 'Here lies Ka-Amon-Ra, Pharaoh of the Eternal Sands. His treasures are protected by sacred guardians and divine magic. Those who seek his gold must prove worthy through trials of strength, wisdom, and courage. The unworthy shall become dust.'",
      characterResponse: "Trials? I have faced trials that would break lesser mortals. This Ka-Amon-Ra shall find that even death cannot guard against a determined warrior!",
      nextNode: 'informed-entry'
    },

    'informed-entry': {
      type: ADVENTURE_TYPES.CHOICE,
      text: "Armed with knowledge of what awaits, how do you proceed?",
      choices: [
        {
          id: 'careful-entry',
          text: "🛡️ Enter carefully, watching for traps",
          icon: '👁️',
          nextNode: 'trap-found'
        },
        {
          id: 'confident-entry',
          text: "⚔️ Enter confidently - you're ready for the trials",
          icon: '💪',
          nextNode: 'grand-corridor'
        }
      ]
    },

    'bold-entry': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "Without hesitation, you stride through the entrance. Your confidence pays off - you somehow miss triggering a pressure plate by mere inches. Sometimes boldness is its own reward. You enter a grand corridor lit by mysterious glowing stones.",
      characterResponse: "Fortune indeed favors the bold! But let us not rely solely on luck. These halls hold dangers yet.",
      nextNode: 'grand-corridor'
    },

    'search-alternate': {
      type: ADVENTURE_TYPES.SKILL_CHECK,
      skill: 'perception',
      dc: 15,
      text: "You circle the pyramid, looking for any other way in. Roll a Perception check!",
      characterResponse: "A wise general knows many paths to victory. Let us see what secrets this pyramid hides.",
      successNode: 'secret-entrance-found',
      failureNode: 'no-alternate-found'
    },

    'secret-entrance-found': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "Behind a collapsed section of wall, you discover a narrow shaft leading into darkness. It appears to be a tomb robber's entrance from ages past. The passage is tight but navigable, and it bypasses the main entrance entirely.",
      characterResponse: "Excellent! Others have sought these treasures before us. Their path may prove safer... or more dangerous.",
      nextNode: 'secret-passage-choice'
    },

    'secret-passage-choice': {
      type: ADVENTURE_TYPES.CHOICE,
      text: "You've found a secret passage. What do you do?",
      choices: [
        {
          id: 'take-secret',
          text: "🕳️ Take the secret passage",
          icon: '🔦',
          nextNode: 'secret-passage'
        },
        {
          id: 'use-main',
          text: "🚪 Use the main entrance instead",
          icon: '⚡',
          nextNode: 'entrance-choice'
        }
      ]
    },

    'no-alternate-found': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "Despite your thorough search, you find no other entrance. The pyramid's builders ensured there was only one way in... that you can find, at least.",
      characterResponse: "Then we take the front door. Sometimes the direct approach is best.",
      nextNode: 'entrance-choice'
    },

    'secret-passage': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "You squeeze through the narrow passage, crawling through darkness and cobwebs. After several tense minutes, you emerge into a side chamber filled with broken pottery and ancient bones - the remains of those who came before. A doorway leads to what appears to be the main corridor.",
      characterResponse: "These bones tell a tale of greed and failure. We shall not share their fate!",
      nextNode: 'grand-corridor'
    },

    'grand-corridor': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "You stand in a magnificent corridor stretching deep into the pyramid. The walls are covered in elaborate paintings depicting the life of Pharaoh Ka-Amon-Ra - battles won, treasures accumulated, and finally, his elaborate burial ceremony. Three passages branch off from this corridor: one leading up, one straight ahead, and one descending into darkness.",
      characterResponse: "Three paths... Each likely holds its own challenges and rewards. We must choose wisely.",
      nextNode: 'corridor-choice'
    },

    'grand-corridor-wounded': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "Nursing your wound from the trapped entrance, you proceed down a magnificent corridor. The walls depict the life of Pharaoh Ka-Amon-Ra. Three passages branch off: one ascending, one straight ahead, and one descending into darkness.",
      characterResponse: "The sting of that trap reminds us to stay vigilant. Now, which path shall we take?",
      nextNode: 'corridor-choice'
    },

    'corridor-choice': {
      type: ADVENTURE_TYPES.CHOICE,
      text: "Three passages await. Which do you choose?",
      choices: [
        {
          id: 'ascending',
          text: "⬆️ Take the ascending passage (toward the pyramid's peak)",
          icon: '🔺',
          nextNode: 'ascending-passage'
        },
        {
          id: 'straight',
          text: "➡️ Continue straight ahead",
          icon: '🚶',
          nextNode: 'straight-passage'
        },
        {
          id: 'descending',
          text: "⬇️ Take the descending passage (into the depths)",
          icon: '🔻',
          nextNode: 'descending-passage'
        }
      ]
    },

    'ascending-passage': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "The ascending passage leads you upward through increasingly narrow corridors. Eventually, you reach a small chamber with windows overlooking the desert. In the center stands a golden altar with a mysterious crystal orb that pulses with inner light.",
      characterResponse: "A place of ritual, perhaps. That orb... it holds power. I can feel it from here.",
      nextNode: 'altar-chamber-choice'
    },

    'altar-chamber-choice': {
      type: ADVENTURE_TYPES.CHOICE,
      text: "What do you do with the mysterious orb?",
      choices: [
        {
          id: 'take-orb',
          text: "💎 Take the orb",
          icon: '🤲',
          nextNode: 'take-orb'
        },
        {
          id: 'examine-orb',
          text: "🔍 Examine it first (Arcana check)",
          icon: '🔮',
          nextNode: 'examine-orb'
        },
        {
          id: 'leave-orb',
          text: "🚫 Leave it alone and return to the corridor",
          icon: '↩️',
          nextNode: 'corridor-choice'
        }
      ]
    },

    'examine-orb': {
      type: ADVENTURE_TYPES.SKILL_CHECK,
      skill: 'arcana',
      dc: 14,
      text: "You focus on the orb's magical energy. Roll an Arcana check!",
      characterResponse: "Magic is not my forte, but even a warrior can sense when power is dangerous.",
      successNode: 'orb-understood',
      failureNode: 'orb-mystery'
    },

    'orb-understood': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "You sense that the orb is a key - it will grant safe passage through certain areas of the pyramid and reveal hidden paths. However, taking it will also alert the pyramid's guardians to your presence.",
      characterResponse: "A choice then: stealth, or power? I say we take it. Let the guardians come - we shall meet them with steel!",
      nextNode: 'orb-decision'
    },

    'orb-mystery': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "The orb's purpose remains a mystery, though you sense it holds significant power. Taking it could be beneficial... or catastrophic.",
      characterResponse: "When in doubt, trust your instincts. What does your gut tell you?",
      nextNode: 'orb-decision'
    },

    'orb-decision': {
      type: ADVENTURE_TYPES.CHOICE,
      text: "Take the mysterious orb or leave it?",
      choices: [
        {
          id: 'take-it',
          text: "✊ Take the orb",
          icon: '💎',
          nextNode: 'take-orb'
        },
        {
          id: 'leave-it',
          text: "🚫 Leave it and return",
          icon: '↩️',
          nextNode: 'corridor-choice'
        }
      ]
    },

    'take-orb': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "As your fingers close around the orb, it flares with brilliant light. The pyramid shudders, and you hear the grinding of stone on stone echoing from deep within. A deep voice reverberates through the chamber: 'THE SEAL IS BROKEN. THE GUARDIANS AWAKEN.'",
      characterResponse: "Well, subtlety was never my strong suit anyway! The guardians want a fight? We shall give them one!",
      nextNode: 'orb-acquired'
    },

    'orb-acquired': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "The orb feels warm in your hand, pulsing gently. You sense that certain doors will open for you now, but danger is approaching. You hurry back to the main corridor.",
      characterResponse: "We must move quickly now. The pyramid knows we're here.",
      nextNode: 'corridor-choice-with-orb'
    },

    'corridor-choice-with-orb': {
      type: ADVENTURE_TYPES.CHOICE,
      text: "The orb glows brighter when you face the straight passage. Where do you go?",
      choices: [
        {
          id: 'follow-orb',
          text: "➡️ Follow the orb's light (straight passage)",
          icon: '✨',
          nextNode: 'straight-passage-with-orb'
        },
        {
          id: 'descend',
          text: "⬇️ Descend into the depths",
          icon: '🔻',
          nextNode: 'descending-passage'
        }
      ]
    },

    'straight-passage': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "The straight passage leads to an ornate door sealed with a complex mechanism - four rotating stone wheels, each covered in hieroglyphics. Without the key or knowledge of the combination, this door seems impossible to open.",
      characterResponse: "A puzzle lock. I could try to force it, but that might trigger more traps. Or we could try another path.",
      nextNode: 'sealed-door-choice'
    },

    'straight-passage-with-orb': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "The orb blazes brilliantly as you approach the sealed door. The stone wheels begin to turn on their own, clicking into place with ancient precision. The door swings open, revealing the pharaoh's treasure chamber beyond!",
      characterResponse: "The orb was indeed a key! Whatever guardians we've awakened, this treasure will be worth it!",
      nextNode: 'treasure-chamber'
    },

    'sealed-door-choice': {
      type: ADVENTURE_TYPES.CHOICE,
      text: "The door is sealed. What do you do?",
      choices: [
        {
          id: 'force-door',
          text: "💪 Try to force the door open (Athletics check)",
          icon: '⚡',
          nextNode: 'force-door'
        },
        {
          id: 'solve-puzzle',
          text: "🧩 Attempt to solve the puzzle (Investigation check)",
          icon: '🔍',
          nextNode: 'solve-puzzle'
        },
        {
          id: 'try-other-path',
          text: "🔙 Return and try another passage",
          icon: '↩️',
          nextNode: 'corridor-choice'
        }
      ]
    },

    'force-door': {
      type: ADVENTURE_TYPES.SKILL_CHECK,
      skill: 'athletics',
      dc: 16,
      text: "You brace yourself against the door and push with all your might. Roll an Athletics check!",
      characterResponse: "Sometimes brute force is the best solution! Let us see if this door can withstand a warrior's strength!",
      successNode: 'door-forced',
      failureNode: 'door-holds'
    },

    'door-forced': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "With a tremendous effort, you feel the mechanism crack. The wheels shatter and the door lurches open! Beyond lies the pharaoh's treasure chamber, though your forceful entry has triggered another security measure - you hear something approaching!",
      characterResponse: "Ha! No door can withstand true determination! But that sound... prepare yourself!",
      nextNode: 'guardian-ambush'
    },

    'door-holds': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "Despite your best efforts, the door refuses to budge. The mechanism is too well-made, and you simply lack the leverage needed. You'll need to find another way.",
      characterResponse: "Even the strongest warrior sometimes meets an immovable object. We need a different approach.",
      nextNode: 'sealed-door-choice'
    },

    'solve-puzzle': {
      type: ADVENTURE_TYPES.SKILL_CHECK,
      skill: 'investigation',
      dc: 15,
      text: "You study the hieroglyphics on each wheel, looking for patterns. Roll an Investigation check!",
      characterResponse: "Patience... puzzles require a different kind of strategy than battle.",
      successNode: 'puzzle-solved',
      failureNode: 'puzzle-failed'
    },

    'puzzle-solved': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "After careful study, you realize the hieroglyphics tell a story - the four stages of the pharaoh's life. You align them in chronological order: Birth, Conquest, Rule, Death. The mechanism clicks, and the door swings open smoothly and silently.",
      characterResponse: "Intelligence serves the warrior as well as strength! We've entered unseen and unheard.",
      nextNode: 'treasure-chamber'
    },

    'puzzle-failed': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "The hieroglyphics remain a mystery. You try a few combinations, but nothing works. The door stays firmly shut.",
      characterResponse: "This puzzle defeats me. Perhaps we should seek another path.",
      nextNode: 'sealed-door-choice'
    },

    'descending-passage': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "The descending passage grows darker and colder as you venture deeper into the pyramid's foundations. The air becomes thick with the scent of ancient dust and something else... something dead. You emerge into a vast burial chamber filled with sarcophagi and wrapped mummies standing in alcoves along the walls.",
      characterResponse: "The burial chamber. If anywhere holds guardian undead, it would be here. Ready your weapon and stay close.",
      nextNode: 'burial-chamber-choice'
    },

    'burial-chamber-choice': {
      type: ADVENTURE_TYPES.CHOICE,
      text: "You're in a chamber of the dead. How do you proceed?",
      choices: [
        {
          id: 'cross-quietly',
          text: "🤫 Try to cross quietly (Stealth check)",
          icon: '👣',
          nextNode: 'stealth-through-chamber'
        },
        {
          id: 'examine-sarcophagi',
          text: "🔍 Examine the central sarcophagus",
          icon: '⚰️',
          nextNode: 'examine-sarcophagus'
        },
        {
          id: 'combat-ready',
          text: "⚔️ Proceed weapon-ready, expecting combat",
          icon: '🛡️',
          nextNode: 'ready-for-mummies'
        },
        {
          id: 'retreat',
          text: "🔙 This feels wrong - retreat",
          icon: '🏃',
          nextNode: 'corridor-choice'
        }
      ]
    },

    'stealth-through-chamber': {
      type: ADVENTURE_TYPES.SKILL_CHECK,
      skill: 'stealth',
      dc: 14,
      text: "You begin moving carefully through the chamber, trying not to disturb anything. Roll a Stealth check!",
      characterResponse: "Light steps... shallow breaths... sometimes the warrior must move like a shadow.",
      successNode: 'stealth-success-chamber',
      failureNode: 'mummies-awaken'
    },

    'stealth-success-chamber': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "You move through the chamber like a ghost, your footfalls silent on the ancient stone. The mummies remain still as statues. You reach the far side where another passage leads upward toward what must be the treasure chamber.",
      characterResponse: "Well done. We've avoided an unnecessary battle. Forward, to the treasure!",
      nextNode: 'treasure-approach'
    },

    'examine-sarcophagus': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "You approach the largest sarcophagus in the chamber's center. Its lid is carved with the image of a great warrior-priest, and hieroglyphics proclaim: 'Here lies Heb-Senu, Champion of Ka-Amon-Ra, Guardian Eternal.' As you study it, the lid begins to shift...",
      characterResponse: "It seems we've disturbed the guardian! Weapons ready!",
      nextNode: 'champion-awakens'
    },

    'ready-for-mummies': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "You stride through the chamber boldly, weapon at the ready. Your presence and confidence don't go unnoticed - the mummies remain still, but you sense ancient eyes watching your every move. You're ready for whatever comes.",
      characterResponse: "A warrior who expects battle is rarely surprised by it. Let them come if they dare!",
      nextNode: 'cross-chamber'
    },

    'cross-chamber': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "You make it halfway across when one of the mummies suddenly lurches forward, ancient bandages rustling. Then another. And another. Soon six mummies are shambling toward you, their movements jerky but purposeful!",
      characterResponse: "Here they come! The dead rise to protect their pharaoh's treasure. They shall find that death is no shield against my blade!",
      nextNode: 'mummy-combat'
    },

    'mummies-awaken': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "Your foot scrapes against a loose stone with a loud grinding sound. The noise echoes through the chamber. For a moment, nothing happens. Then, one by one, the mummies begin to move, turning their eyeless faces toward you!",
      characterResponse: "So much for stealth! Ready yourself - the dead walk!",
      nextNode: 'mummy-combat'
    },

    'mummy-combat': {
      type: ADVENTURE_TYPES.COMBAT,
      text: "Six guardian mummies surround you, their ancient forms animated by dark magic!",
      characterResponse: "They are many, but we are mighty! Strike hard and strike true!",
      enemies: [
        { name: 'Guardian Mummy', hp: 20, ac: 11 },
        { name: 'Guardian Mummy', hp: 20, ac: 11 },
        { name: 'Guardian Mummy', hp: 20, ac: 11 },
        { name: 'Guardian Mummy', hp: 20, ac: 11 },
        { name: 'Guardian Mummy', hp: 20, ac: 11 },
        { name: 'Guardian Mummy', hp: 20, ac: 11 }
      ],
      victoryNode: 'mummy-victory',
      defeatNode: 'mummy-defeat'
    },

    'mummy-victory': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "The last mummy crumbles to dust, its ancient magic finally dispelled. The chamber falls silent once more. Among the remains, you find a golden amulet that pulses with protective magic. Ahead, a passage leads upward.",
      characterResponse: "The dead return to their rest. We have earned passage! Onward, to the pharaoh's treasure!",
      nextNode: 'treasure-approach'
    },

    'mummy-defeat': {
      type: ADVENTURE_TYPES.END,
      text: "The mummies overwhelm you, their ancient hands dragging you down into darkness. Your last thought is that you should have been more careful...",
      characterResponse: "Even heroes fall... but this is not the end of our story. We shall return, stronger and wiser.",
      endType: 'defeat'
    },

    'champion-awakens': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "The sarcophagus lid crashes to the floor. A towering figure rises - a mummified warrior in ornate golden armor, wielding a massive khopesh sword that gleams with magical runes. This is no ordinary guardian!",
      characterResponse: "A champion! Finally, a worthy opponent! Come, let us test which warrior is greater - the living or the dead!",
      nextNode: 'champion-combat'
    },

    'champion-combat': {
      type: ADVENTURE_TYPES.COMBAT,
      text: "You face Heb-Senu, the Champion of Ka-Amon-Ra!",
      characterResponse: "This is what warriors live for - a true test of skill! EN GARDE!",
      enemies: [
        { name: 'Heb-Senu, Eternal Champion', hp: 60, ac: 16 }
      ],
      victoryNode: 'champion-victory',
      defeatNode: 'champion-defeat'
    },

    'champion-victory': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "With a final mighty blow, the champion falls. As his form crumbles, he speaks in an ancient tongue: 'You... are worthy... Take what you have... earned...' His golden armor and magical khopesh clatter to the ground. The passage to the treasure chamber stands open.",
      characterResponse: "A formidable warrior, even in death. He has earned his rest. Let us claim our prize!",
      nextNode: 'treasure-chamber-earned'
    },

    'champion-defeat': {
      type: ADVENTURE_TYPES.END,
      text: "The Champion's blade strikes true, and darkness claims you. You fought valiantly, but this ancient warrior has defended his pharaoh for millennia, and he has defended him well.",
      characterResponse: "Defeated... by a worthy opponent. There is no shame in this. We shall meet again, champion.",
      endType: 'defeat'
    },

    'guardian-ambush': {
      type: ADVENTURE_TYPES.COMBAT,
      text: "Four skeletal warriors burst from hidden alcoves, their weapons raised!",
      characterResponse: "An ambush! But we're ready for them!",
      enemies: [
        { name: 'Skeletal Guardian', hp: 15, ac: 13 },
        { name: 'Skeletal Guardian', hp: 15, ac: 13 },
        { name: 'Skeletal Guardian', hp: 15, ac: 13 },
        { name: 'Skeletal Guardian', hp: 15, ac: 13 }
      ],
      victoryNode: 'ambush-victory',
      defeatNode: 'ambush-defeat'
    },

    'ambush-victory': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "The skeletal guardians fall, their bones clattering across the floor. You stand victorious in the entrance to the treasure chamber!",
      characterResponse: "Nothing shall keep us from our prize! The treasure awaits!",
      nextNode: 'treasure-chamber'
    },

    'ambush-defeat': {
      type: ADVENTURE_TYPES.END,
      text: "The guardians prove too much. You fall defending yourself, so close to the treasure yet so far...",
      characterResponse: "We were... so close. Next time... we shall be more careful...",
      endType: 'defeat'
    },

    'treasure-approach': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "You ascend the passage, emerging into a magnificent treasure chamber. But between you and the treasure stands one final guardian - a massive construct of stone and gold, its eyes glowing with magical fire.",
      characterResponse: "Of course the pharaoh saved his greatest guardian for last. One final test!",
      nextNode: 'final-guardian-choice'
    },

    'final-guardian-choice': {
      type: ADVENTURE_TYPES.CHOICE,
      text: "The guardian blocks your path. What do you do?",
      choices: [
        {
          id: 'fight-guardian',
          text: "⚔️ Fight the guardian",
          icon: '💥',
          nextNode: 'final-combat'
        },
        {
          id: 'speak-guardian',
          text: "🗣️ Try to speak to the guardian (Persuasion check)",
          icon: '💬',
          nextNode: 'speak-to-guardian'
        },
        {
          id: 'sneak-past',
          text: "🤫 Try to sneak past while it's dormant (Stealth check)",
          icon: '👣',
          nextNode: 'sneak-past-guardian'
        }
      ]
    },

    'speak-to-guardian': {
      type: ADVENTURE_TYPES.SKILL_CHECK,
      skill: 'persuasion',
      dc: 17,
      text: "You address the guardian, declaring your worthiness and explaining your trials. Roll a Persuasion check!",
      characterResponse: "Perhaps this guardian will recognize the honor in our quest. Sometimes words succeed where swords fail.",
      successNode: 'guardian-persuaded',
      failureNode: 'guardian-attacks'
    },

    'guardian-persuaded': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "The guardian's eyes flare brighter as it considers your words. Finally, it speaks in a voice like grinding stone: 'YOU HAVE PROVEN WORTHY. THE TRIALS HAVE TESTED YOU. TAKE WHAT YOU HAVE EARNED.' It steps aside, granting you access to the treasure!",
      characterResponse: "Sometimes the greatest victories are won without bloodshed! The treasure is ours by right!",
      nextNode: 'treasure-chamber-peaceful'
    },

    'guardian-attacks': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "The guardian does not respond to your words. Instead, it raises its massive fists and advances!",
      characterResponse: "So be it! We settle this the warrior's way!",
      nextNode: 'final-combat'
    },

    'sneak-past-guardian': {
      type: ADVENTURE_TYPES.SKILL_CHECK,
      skill: 'stealth',
      dc: 16,
      text: "You attempt to slip past the guardian while it remains motionless. Roll a Stealth check!",
      characterResponse: "If we can avoid this fight, we save our strength for whatever comes next. Move carefully...",
      successNode: 'sneak-success-final',
      failureNode: 'sneak-fail-final'
    },

    'sneak-success-final': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "Moving with incredible care, you slip past the guardian. It remains motionless, either unaware or uncaring of your passage. The treasure lies before you, unguarded!",
      characterResponse: "The sneakiest warrior is often the most successful warrior! The treasure is ours!",
      nextNode: 'treasure-chamber-peaceful'
    },

    'sneak-fail-final': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "Your shadow falls across the guardian. Its head snaps toward you, eyes blazing to life. It has detected you!",
      characterResponse: "Detected! Ready for combat!",
      nextNode: 'final-combat'
    },

    'final-combat': {
      type: ADVENTURE_TYPES.COMBAT,
      text: "You face the Pyramid's final guardian - a massive stone construct!",
      characterResponse: "This is it - the final test! Let us show this ancient magic what true warrior skill can achieve!",
      enemies: [
        { name: 'Stone Guardian Colossus', hp: 80, ac: 17 }
      ],
      victoryNode: 'final-victory',
      defeatNode: 'final-defeat'
    },

    'final-victory': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "With a thunderous crash, the guardian crumbles. Its magic dissipates like smoke, and you stand victorious. The path to the treasure is clear!",
      characterResponse: "VICTORY! Even the mightiest guardian falls before true determination! The treasure is OURS!",
      nextNode: 'treasure-chamber-earned'
    },

    'final-defeat': {
      type: ADVENTURE_TYPES.END,
      text: "The guardian's power proves too great. You fall before the final prize, so close to glory yet unable to claim it.",
      characterResponse: "We... came so far... fell so close to victory. But even in defeat, we fought with honor.",
      endType: 'defeat'
    },

    'treasure-chamber': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "You enter the magnificent treasure chamber! Gold coins, jeweled artifacts, and precious relics fill the room. But the centerpiece is a golden sarcophagus bearing the name Ka-Amon-Ra, surrounded by his greatest treasures: a jeweled crown, a golden war-mace, and an amulet that radiates power.",
      characterResponse: "Magnificent! A hoard worthy of legends! Such treasures... such glory! But which prize shall we claim?",
      nextNode: 'treasure-choice'
    },

    'treasure-chamber-earned': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "You enter the pharaoh's treasure chamber, earned through trials and combat! Gold and jewels surround you. The centerpiece: a golden sarcophagus with three legendary items - a jeweled crown, a golden war-mace, and a magical amulet.",
      characterResponse: "We have earned this through blood, sweat, and courage! The pharaoh's treasures are now ours by right of conquest!",
      nextNode: 'treasure-choice'
    },

    'treasure-chamber-peaceful': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "You stand in the pharaoh's treasure chamber, having proven your worth without unnecessary bloodshed! The legendary treasures await: a jeweled crown, a golden war-mace, and a magical amulet.",
      characterResponse: "Sometimes the greatest warrior is the one who knows when NOT to fight. These treasures are well earned!",
      nextNode: 'treasure-choice'
    },

    'treasure-choice': {
      type: ADVENTURE_TYPES.CHOICE,
      text: "You can carry one legendary item safely. Which do you take?",
      choices: [
        {
          id: 'crown',
          text: "👑 The Crown of Ka-Amon-Ra (grants charisma and leadership)",
          icon: '✨',
          nextNode: 'take-crown'
        },
        {
          id: 'mace',
          text: "🔨 The Golden War-Mace (a powerful magical weapon)",
          icon: '⚡',
          nextNode: 'take-mace'
        },
        {
          id: 'amulet',
          text: "📿 The Amulet of Protection (grants magical defense)",
          icon: '🛡️',
          nextNode: 'take-amulet'
        },
        {
          id: 'take-all',
          text: "💰 Try to take everything (risky!)",
          icon: '🎒',
          nextNode: 'take-all'
        }
      ]
    },

    'take-crown': {
      type: ADVENTURE_TYPES.END,
      text: "You place the jeweled crown in your pack. As you do, you feel a surge of confidence and authority. The pyramid begins to rumble - it's time to leave! You make your escape as the ancient structure begins to collapse behind you. You emerge into the desert sun, crown in hand, a legendary treasure claimed!",
      characterResponse: "A crown fit for a pharaoh, now worn by a warrior of legend! This treasure shall be told of in tales for generations! We have conquered the pyramid!",
      endType: 'success',
      rewards: ['Crown of Ka-Amon-Ra', '500 gold pieces in ancient coins', 'Reputation as a Tomb Raider']
    },

    'take-mace': {
      type: ADVENTURE_TYPES.END,
      text: "You grasp the golden war-mace. It feels perfectly balanced, and you sense great power within it. The pyramid shudders - time to go! You race through the corridors as they begin to collapse. Bursting into the sunlight, you hold the mace high in victory!",
      characterResponse: "A weapon worthy of the greatest warriors! With this mace, no enemy shall stand against us! The pyramid has yielded its greatest treasure!",
      endType: 'success',
      rewards: ['Golden War-Mace of Ka-Amon-Ra', '500 gold pieces in ancient coins', 'Reputation as a Legendary Warrior']
    },

    'take-amulet': {
      type: ADVENTURE_TYPES.END,
      text: "You take the amulet and place it around your neck. Immediately, you feel a protective barrier form around you. The pyramid begins to crumble, but the amulet protects you from falling debris as you make your escape! You emerge unscathed, a legendary artifact in your possession!",
      characterResponse: "The Amulet's power is extraordinary! It shielded us from harm even as the pyramid fell! A wise choice for a warrior who values survival!",
      endType: 'success',
      rewards: ['Amulet of Protection', '500 gold pieces in ancient coins', 'Safe passage from the collapsing pyramid']
    },

    'take-all': {
      type: ADVENTURE_TYPES.NARRATIVE,
      text: "Greed overtakes caution. You grab the crown, mace, and amulet, stuffing your pack with as much gold as you can carry. Immediately, the sarcophagus lid flies open and a terrible presence fills the chamber. The mummy of Ka-Amon-Ra himself rises, his eyes burning with unholy fire!",
      characterResponse: "Perhaps... we were too greedy! The pharaoh himself rises! PREPARE YOURSELF!",
      nextNode: 'pharaoh-combat'
    },

    'pharaoh-combat': {
      type: ADVENTURE_TYPES.COMBAT,
      text: "You face Ka-Amon-Ra himself, the Pharaoh of the Eternal Sands!",
      characterResponse: "A PHARAOH! Now this is a battle worthy of song! Come, ancient king - face a hero of a new age!",
      enemies: [
        { name: 'Ka-Amon-Ra, Undying Pharaoh', hp: 100, ac: 18 }
      ],
      victoryNode: 'pharaoh-victory',
      defeatNode: 'pharaoh-defeat'
    },

    'pharaoh-victory': {
      type: ADVENTURE_TYPES.END,
      text: "In an epic battle for the ages, you strike down the undead pharaoh himself! As he crumbles to dust, he speaks: 'You... have... earned... ALL.' The curse lifts. You claim all three legendary items plus the pharaoh's personal treasure! The pyramid stops shaking, acknowledging your total victory!",
      characterResponse: "WE HAVE SLAIN A PHARAOH! All the treasures are ours! This day shall be remembered in legend forever! We are INVINCIBLE!",
      endType: 'success',
      rewards: ['Crown of Ka-Amon-Ra', 'Golden War-Mace', 'Amulet of Protection', '2000 gold pieces', 'Title: Pharaoh-Slayer', 'The greatest glory']
    },

    'pharaoh-defeat': {
      type: ADVENTURE_TYPES.END,
      text: "The pharaoh's ancient power proves too great. His magic tears through your defenses. As darkness takes you, you hear his voice: 'Greedy mortals never learn...' The treasures remain, waiting for a more worthy adventurer.",
      characterResponse: "Greed... was our downfall. A lesson learned too late. Even the greatest warrior can fall to hubris...",
      endType: 'defeat'
    }
  }
}

/**
 * Get all available adventures
 */
export function getAvailableAdventures() {
  return [
    {
      id: 'mysterious-grove',
      title: 'The Mysterious Grove',
      description: 'Investigate strange sounds in an ancient forest',
      difficulty: 'Easy',
      estimatedTime: '10-15 minutes',
      adventure: mysteriousGroveAdventure
    },
    {
      id: 'pyramid-raid',
      title: 'The Pyramid Raid',
      description: 'Raid an ancient Egyptian pyramid and claim the legendary treasures of Pharaoh Ka-Amon-Ra',
      difficulty: 'Hard',
      estimatedTime: '15-20 minutes',
      adventure: pyramidRaidAdventure
    }
  ]
}

/**
 * Get a specific adventure by ID
 */
export function getAdventureById(id) {
  const adventures = getAvailableAdventures()
  const found = adventures.find(adv => adv.id === id)
  return found ? found.adventure : null
}
