/**
 * Simple Text-Only Adventures
 * NO IMAGES - Pure text dialogue trees to avoid API errors
 */

export const simpleAdventures = [
  {
    id: 'goblin-ambush',
    title: 'Goblin Ambush',
    description: 'A quick combat encounter with cunning goblins on the road.',
    difficulty: 'Easy',
    estimatedTime: '10-15 min',
    theme: 'Combat',
    startNodeId: 'start'
  },
  {
    id: 'cursed-shrine',
    title: 'The Cursed Shrine',
    description: 'Investigate ancient ruins and uncover dark secrets.',
    difficulty: 'Medium',
    estimatedTime: '15-20 min',
    theme: 'Mystery',
    startNodeId: 'start'
  }
]

/**
 * Adventure Tree: Goblin Ambush
 * Simple combat-focused adventure
 */
export const goblinAmbushTree = {
  start: {
    text: "You're traveling down a forest road when you hear rustling in the bushes ahead. Three goblin bandits leap out, crude weapons drawn!\n\n'Yer gold or yer life!' one snarls.",
    choices: [
      {
        id: 'fight',
        text: 'Draw your weapon and fight!',
        nextNodeId: 'combat-start',
        requiresSkill: null
      },
      {
        id: 'intimidate',
        text: 'Intimidate them into backing down',
        nextNodeId: 'intimidate-check',
        requiresSkill: { skill: 'Intimidation', dc: 12 }
      },
      {
        id: 'stealth',
        text: 'Try to slip away unseen',
        nextNodeId: 'stealth-check',
        requiresSkill: { skill: 'Stealth', dc: 14 }
      }
    ]
  },
  'intimidate-check': {
    text: '', // Text generated based on skill check result
    skillCheck: {
      skill: 'Intimidation',
      dc: 12,
      successNode: 'intimidate-success',
      failureNode: 'intimidate-fail'
    }
  },
  'intimidate-success': {
    text: "Your fearsome presence makes the goblins hesitate. The leader drops his weapon and they scatter into the woods!\n\nYou continue your journey unharmed.",
    choices: [
      {
        id: 'continue',
        text: 'Continue your journey',
        nextNodeId: 'victory',
        isEnd: true
      }
    ]
  },
  'intimidate-fail': {
    text: "The goblins laugh at your attempt to scare them. 'Nice try!' they jeer, weapons still raised.\n\nLooks like you'll have to fight after all.",
    choices: [
      {
        id: 'fight',
        text: 'Fight!',
        nextNodeId: 'combat-start'
      }
    ]
  },
  'stealth-check': {
    text: '',
    skillCheck: {
      skill: 'Stealth',
      dc: 14,
      successNode: 'stealth-success',
      failureNode: 'stealth-fail'
    }
  },
  'stealth-success': {
    text: "You move silently through the underbrush, circling around the ambush. The goblins never notice you as you slip past.\n\nYou're safe, and still have your gold!",
    choices: [
      {
        id: 'continue',
        text: 'Continue your journey',
        nextNodeId: 'victory',
        isEnd: true
      }
    ]
  },
  'stealth-fail': {
    text: "A twig snaps under your foot! The goblins spot you immediately.\n\n'Trying to sneak away? Get 'em!'",
    choices: [
      {
        id: 'fight',
        text: 'Fight!',
        nextNodeId: 'combat-start'
      }
    ]
  },
  'combat-start': {
    text: "Initiative! You and the goblins clash in combat.\n\nThe battle is fierce but quick - your skills prevail over the bandits. The goblins lie defeated, and you search their belongings.",
    choices: [
      {
        id: 'search',
        text: 'Search the goblins',
        nextNodeId: 'loot'
      },
      {
        id: 'leave',
        text: 'Leave immediately',
        nextNodeId: 'victory',
        isEnd: true
      }
    ]
  },
  loot: {
    text: "You find 15 gold pieces, a rusty dagger, and a crude map showing other goblin hideouts in the area.\n\nThe road ahead is clear now.",
    choices: [
      {
        id: 'continue',
        text: 'Continue your journey',
        nextNodeId: 'victory',
        isEnd: true
      }
    ]
  },
  victory: {
    text: "Adventure complete! You've survived the goblin ambush.",
    choices: [],
    isEnd: true
  }
}

/**
 * Adventure Tree: Cursed Shrine
 * Mystery and investigation focused
 */
export const cursedShrineTree = {
  start: {
    text: "You discover ancient ruins deep in the forest. A stone shrine stands at the center, covered in strange runes that seem to shift when you look away.\n\nThe air feels heavy with old magic.",
    choices: [
      {
        id: 'investigate',
        text: 'Investigate the runes (Arcana)',
        nextNodeId: 'arcana-check',
        requiresSkill: { skill: 'Arcana', dc: 13 }
      },
      {
        id: 'pray',
        text: 'Pray at the shrine (Religion)',
        nextNodeId: 'religion-check',
        requiresSkill: { skill: 'Religion', dc: 12 }
      },
      {
        id: 'search',
        text: 'Search for hidden mechanisms (Investigation)',
        nextNodeId: 'investigation-check',
        requiresSkill: { skill: 'Investigation', dc: 14 }
      },
      {
        id: 'leave',
        text: 'This place feels wrong - leave',
        nextNodeId: 'leave-shrine',
        isEnd: true
      }
    ]
  },
  'arcana-check': {
    text: '',
    skillCheck: {
      skill: 'Arcana',
      dc: 13,
      successNode: 'arcana-success',
      failureNode: 'arcana-fail'
    }
  },
  'arcana-success': {
    text: "You recognize the runes as a binding spell - something powerful is trapped here! The magic is weakening, and whatever is bound won't stay contained much longer.\n\nYou notice a way to reinforce the seal.",
    choices: [
      {
        id: 'reinforce',
        text: 'Reinforce the binding seal',
        nextNodeId: 'seal-reinforced'
      },
      {
        id: 'break',
        text: 'Break the seal and free what\'s inside',
        nextNodeId: 'seal-broken'
      }
    ]
  },
  'arcana-fail': {
    text: "The runes are beyond your understanding. As you study them, they begin to glow brighter!\n\nSomething is happening...",
    choices: [
      {
        id: 'continue',
        text: 'Step back!',
        nextNodeId: 'seal-weakens'
      }
    ]
  },
  'religion-check': {
    text: '',
    skillCheck: {
      skill: 'Religion',
      dc: 12,
      successNode: 'religion-success',
      failureNode: 'religion-fail'
    }
  },
  'religion-success': {
    text: "You recognize symbols of an ancient deity of protection. This shrine was built to contain something evil!\n\nYour prayer strengthens the binding magic. The runes glow with renewed power.",
    choices: [
      {
        id: 'continue',
        text: 'Leave the shrine protected',
        nextNodeId: 'good-ending',
        isEnd: true
      }
    ]
  },
  'religion-fail': {
    text: "Your prayer seems to have no effect. If anything, the air grows colder.\n\nMaybe this wasn't the right approach...",
    choices: [
      {
        id: 'try-else',
        text: 'Try something else',
        nextNodeId: 'start'
      }
    ]
  },
  'investigation-check': {
    text: '',
    skillCheck: {
      skill: 'Investigation',
      dc: 14,
      successNode: 'investigation-success',
      failureNode: 'investigation-fail'
    }
  },
  'investigation-success': {
    text: "You find hidden pressure plates around the shrine! Activating them in the right sequence could either strengthen or break the seal.\n\nYou think you've figured out the safe sequence.",
    choices: [
      {
        id: 'safe-sequence',
        text: 'Use the safe sequence',
        nextNodeId: 'seal-reinforced'
      },
      {
        id: 'wrong-sequence',
        text: 'Try a different sequence',
        nextNodeId: 'seal-weakens'
      }
    ]
  },
  'investigation-fail': {
    text: "You search but find nothing obvious. The shrine remains mysterious and foreboding.",
    choices: [
      {
        id: 'try-else',
        text: 'Try a different approach',
        nextNodeId: 'start'
      }
    ]
  },
  'seal-reinforced': {
    text: "The binding magic surges with new strength! The runes burn bright blue, then fade to a gentle glow.\n\nWhatever evil was trapped here will remain bound for centuries more. You've done a great service.",
    choices: [
      {
        id: 'end',
        text: 'Leave the shrine',
        nextNodeId: 'good-ending',
        isEnd: true
      }
    ]
  },
  'seal-broken': {
    text: "The seal shatters! Dark energy erupts from the shrine as an ancient shadow spirit breaks free!\n\nIt shrieks in triumph and vanishes into the forest. You've unleashed something terrible upon the world...",
    choices: [
      {
        id: 'end',
        text: 'Flee the ruins',
        nextNodeId: 'bad-ending',
        isEnd: true
      }
    ]
  },
  'seal-weakens': {
    text: "The seal cracks! Dark energy leaks out, and you hear something stirring within the shrine.\n\nYou should leave - NOW!",
    choices: [
      {
        id: 'run',
        text: 'Run!',
        nextNodeId: 'bad-ending',
        isEnd: true
      }
    ]
  },
  'leave-shrine': {
    text: "Sometimes discretion is the better part of valor. You leave the cursed ruins behind, unharmed but forever curious about what secrets they held.",
    choices: [],
    isEnd: true
  },
  'good-ending': {
    text: "Adventure complete! You've protected the world from an ancient evil.",
    choices: [],
    isEnd: true
  },
  'bad-ending': {
    text: "Adventure complete... but at what cost? The consequences of your actions may be felt for years to come.",
    choices: [],
    isEnd: true
  }
}

// Export adventure trees mapped by ID
export const adventureTrees = {
  'goblin-ambush': goblinAmbushTree,
  'cursed-shrine': cursedShrineTree
}
