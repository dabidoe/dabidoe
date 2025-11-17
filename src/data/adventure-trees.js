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
