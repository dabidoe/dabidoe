# API Contract Specification

This document defines the expected API endpoints and data formats for integrating with your Node server.

---

## Base URL

Configure in `.env`:
```
REACT_APP_API_URL=https://api.characterfoundry.io/api
```

All endpoints below are relative to this base URL.

---

## Authentication

If your system requires authentication, add to API service:

```javascript
// Example: JWT Bearer token
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
}
```

---

## Endpoints

### 1. Get All Characters

**Endpoint:** `GET /characters`

**Query Parameters (Optional):**
```
?limit=20          // Number of characters to return
?offset=0          // Pagination offset
?sort=created      // Sort field
?filter=favorites  // Filter by category
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "achilles",
      "name": "Achilles",
      "type": "Legendary Warrior",
      "description": "The greatest warrior of ancient Greece",
      "portrait": "🛡️",
      "hp": {
        "current": 104,
        "max": 104
      },
      "ac": 18,
      "level": 20,
      "class": "Fighter",
      "background": "Hero",
      "abilities": [
        {
          "id": "sword_strike",
          "name": "Sword Strike",
          "icon": "⚔️",
          "description": "A powerful melee attack",
          "cooldown": 0,
          "damage": "2d6+5"
        }
      ],
      "stats": {
        "str": 20,
        "dex": 16,
        "con": 18,
        "int": 12,
        "wis": 14,
        "cha": 16
      },
      "thumbnail": "https://cdn.characterfoundry.io/achilles.jpg",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-20T14:22:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### 2. Get Character by ID

**Endpoint:** `GET /characters/:id`

**URL Parameters:**
- `id` - Character identifier (string or UUID)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "achilles",
    "name": "Achilles",
    "portrait": "🛡️",
    "hp": {
      "current": 104,
      "max": 104
    },
    "ac": 18,
    "abilities": [
      {
        "id": "sword_strike",
        "name": "Sword Strike",
        "icon": "⚔️",
        "description": "A powerful melee attack"
      }
    ],
    "personality": {
      "traits": ["Proud", "Honorable", "Fierce"],
      "background": "The legendary Greek hero...",
      "motivations": ["Glory", "Honor", "Revenge"]
    },
    "initialMessage": {
      "type": "character",
      "mood": "Contemplative",
      "text": "You find me in a moment of reflection..."
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "CHARACTER_NOT_FOUND",
    "message": "Character with ID 'invalid-id' not found"
  }
}
```

---

### 3. Create Character from Prompt

**Endpoint:** `POST /characters/create`

**Request Body:**
```json
{
  "prompt": "A brave elven ranger from the northern forests, skilled with bow and blade",
  "options": {
    "level": 5,
    "includeBackstory": true,
    "generatePortrait": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "elf-ranger-abc123",
    "name": "Aelindra Moonwhisper",
    "type": "Elven Ranger",
    "description": "A skilled ranger from the Silverwood...",
    "portrait": "🏹",
    "hp": {
      "current": 42,
      "max": 42
    },
    "ac": 16,
    "abilities": [
      {
        "id": "hunters_mark",
        "name": "Hunter's Mark",
        "icon": "🎯"
      }
    ],
    "generationTime": 3.2,
    "created_at": "2024-01-21T09:15:00Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "GENERATION_FAILED",
    "message": "Failed to generate character from prompt",
    "details": "AI service timeout"
  }
}
```

---

### 4. Send Chat Message

**Endpoint:** `POST /chat`

**Request Body:**
```json
{
  "characterId": "achilles",
  "message": "Tell me about your greatest battle",
  "conversationHistory": [
    {
      "type": "character",
      "mood": "Contemplative",
      "text": "You find me in a moment of reflection..."
    },
    {
      "type": "player",
      "text": "Greetings, great warrior"
    }
  ],
  "context": {
    "location": "Training Grounds",
    "timeOfDay": "Morning"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "type": "character",
    "mood": "Proud",
    "text": "Ah, Troy... The greatest siege of all time. For ten long years we fought beneath those walls...",
    "emotion": "nostalgic",
    "actions": [
      {
        "type": "gesture",
        "description": "Achilles gazes into the distance"
      }
    ],
    "timestamp": "2024-01-21T10:30:15Z"
  }
}
```

---

### 5. Use Character Ability

**Endpoint:** `POST /abilities/use`

**Request Body:**
```json
{
  "characterId": "achilles",
  "abilityId": "divine_fury",
  "target": {
    "type": "enemy",
    "id": "goblin-123"
  },
  "context": {
    "inCombat": true,
    "roundNumber": 3
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "abilityName": "Divine Fury",
    "result": {
      "hit": true,
      "damage": 24,
      "criticalHit": false,
      "effects": [
        {
          "type": "damage",
          "amount": 24,
          "damageType": "radiant"
        }
      ]
    },
    "narration": "With divine fury, Achilles strikes with unstoppable force!",
    "character": {
      "hp": {
        "current": 104,
        "max": 104
      }
    }
  }
}
```

---

### 6. Update Character Stats

**Endpoint:** `PATCH /characters/:id/stats`

**Request Body:**
```json
{
  "hp": {
    "current": 85
  },
  "conditions": ["blessed", "hasted"],
  "inventory": {
    "add": ["health_potion"],
    "remove": ["rope"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "achilles",
    "hp": {
      "current": 85,
      "max": 104
    },
    "conditions": ["blessed", "hasted"],
    "updated_at": "2024-01-21T11:00:00Z"
  }
}
```

---

## WebSocket Events (Optional)

If your system uses WebSockets for real-time updates:

### Connect
```javascript
const socket = io('wss://api.characterfoundry.io')
socket.emit('join_character', { characterId: 'achilles' })
```

### Events

**Incoming:**
- `character_update` - Character stats changed
- `new_message` - New chat message from character
- `ability_cooldown` - Ability ready to use

**Outgoing:**
- `send_message` - Send chat message
- `use_ability` - Trigger ability

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `CHARACTER_NOT_FOUND` | 404 | Character doesn't exist |
| `GENERATION_FAILED` | 500 | AI generation error |
| `INVALID_REQUEST` | 400 | Malformed request |
| `UNAUTHORIZED` | 401 | Authentication required |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |

---

## Rate Limiting

Expected rate limits (adjust based on your system):
- Character creation: 10 per hour per user
- Chat messages: 60 per minute per user
- Browse/read operations: 1000 per minute

---

## Data Validation

### Character ID Format
- Type: `string`
- Pattern: `^[a-z0-9-]+$`
- Length: 3-50 characters

### Message Length
- Min: 1 character
- Max: 2000 characters

### Prompt Length
- Min: 10 characters
- Max: 1000 characters

---

## Notes for Your Dev

1. **Adjust field names** to match your existing database schema
2. **Add authentication** headers if needed
3. **Modify error handling** to match your error format
4. **Add any custom fields** your system uses (Discord ID, user preferences, etc.)
5. **Configure rate limiting** based on your infrastructure

---

## Example Integration

```javascript
// src/services/api.js (already exists)
export const getCharacter = async (characterId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/${characterId}`)
    if (!response.ok) throw new Error('Failed to fetch')

    const result = await response.json()

    // Transform your API format to React app format
    return {
      name: result.data.name,
      hp: result.data.hp,
      ac: result.data.ac,
      portrait: result.data.portrait,
      abilities: result.data.abilities,
      initialMessage: result.data.initialMessage
    }
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}
```
