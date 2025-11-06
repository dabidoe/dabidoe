# Character Foundry - Full Integration Plan

## 1. Existing OAuth Integration

### Current Setup
You mentioned you have existing Google/Discord OAuth. The HTML demo needs to connect to your auth endpoints.

**Required from your backend:**
- OAuth callback URL that returns JWT token
- Token validation endpoint
- User profile endpoint

**Frontend Changes:**
```javascript
// In character-demo.html, update these:
const API_BASE_URL = 'https://api.characterfoundry.io';
const GOOGLE_CLIENT_ID = 'your-actual-google-client-id';
const DISCORD_CLIENT_ID = 'your-actual-discord-client-id';
const REDIRECT_URI = 'https://m.characterfoundry.io/auth/callback';
```

**Expected API Flow:**
1. User clicks "Login with Google"
2. Redirects to Google OAuth
3. Google redirects back to your app with `code`
4. Frontend sends code to `POST /auth/callback`
5. Backend exchanges code for user info and returns JWT
6. Frontend stores JWT in localStorage
7. All subsequent requests include `Authorization: Bearer {token}`

---

## 2. Character Creation Page

### User Flow:
1. After login → Character Select screen
2. Click "➕ Create New Character"
3. Opens chat-style character creation wizard
4. User describes character: "I want a elven ranger who protects the forest"
5. AI generates character sheet based on description
6. User can refine: "Make him stronger", "Add archery skills"
7. Confirm and save

### API Endpoints Needed:
```
POST /characters/create
Body: {
    prompt: "I want an elven ranger...",
    userId: "user-id",
    refinements: [] // optional, for iterative creation
}
Response: {
    preview: { name, race, class, stats, abilities },
    tokensUsed: 5,
    remainingTokens: 95
}

POST /characters/save
Body: { characterData, userId }
Response: { characterId, success: true }
```

### Cost:
- Initial character creation: 5 tokens
- Each refinement: 2 tokens
- Save character: Free

---

## 3. Voice Chat Feature

### Two Modes:

#### **Mode A: Text-to-Speech (Character Speaks)**
- User types message
- Character responds in text (1 token)
- User clicks 🔊 button next to response
- ElevenLabs reads it aloud (5 tokens)

#### **Mode B: Full Voice Chat (Both Ways)**
- User holds 🎤 button and speaks
- Speech-to-text transcription (2 tokens)
- AI processes and responds (1 token)
- Response is auto-spoken via ElevenLabs (5 tokens)
- Total: 8 tokens per exchange

### ElevenLabs Integration:
```javascript
// Voice generation
async function speakMessage(text, characterVoiceId) {
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + characterVoiceId, {
        method: 'POST',
        headers: {
            'Accept': 'audio/mpeg',
            'xi-api-key': 'YOUR_ELEVENLABS_KEY',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            text: text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.5
            }
        })
    });

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
}
```

### Character Voice Mapping:
Each character has a `voiceId` field in their database record:
```javascript
{
    _id: "...",
    name: "Achilles",
    voiceId: "21m00Tcm4TlvDq8ikWAM", // ElevenLabs voice ID
    // ... other fields
}
```

### Cost per Voice Message:
- ElevenLabs charges ~$0.30 per 1000 characters
- Average message: 100 characters = $0.03
- In your token system: 1 voice message = 5 tokens
- So if 100 tokens = $1, voice is properly priced

---

## 4. Token/Billing System

### Token Costs:
| Action | Token Cost |
|--------|-----------|
| Text chat message | 1 token |
| Character creation | 5 tokens |
| Character refinement | 2 tokens |
| Voice message (TTS) | 5 tokens |
| Voice input (STT) | 2 tokens |
| Full voice exchange | 8 tokens |

### Token Packages:
- **Starter**: 100 tokens - $0.99
- **Standard**: 500 tokens - $3.99 (20% bonus)
- **Premium**: 1500 tokens - $9.99 (50% bonus)
- **Ultimate**: 5000 tokens - $24.99 (100% bonus)

### Database Schema for Tokens:
```javascript
// User document
{
    _id: "user-id",
    email: "user@example.com",
    tokens: {
        balance: 100,
        lifetime: 500,
        lastPurchase: Date,
        transactions: [
            {
                type: "purchase",
                amount: 100,
                cost: 0.99,
                timestamp: Date
            },
            {
                type: "usage",
                amount: -1,
                action: "chat_message",
                characterId: "...",
                timestamp: Date
            }
        ]
    }
}
```

### API Endpoints:
```
GET /users/{userId}/tokens
Response: {
    balance: 95,
    lifetime: 500
}

POST /tokens/use
Body: {
    userId: "user-id",
    amount: 5,
    action: "voice_message",
    metadata: { characterId: "..." }
}
Response: {
    success: true,
    newBalance: 90
}

POST /tokens/purchase
Body: {
    userId: "user-id",
    packageId: "standard_500"
}
Response: {
    success: true,
    newBalance: 590,
    receiptId: "..."
}
```

### In-App Purchase Integration:

#### **For Web (Stripe)**
```javascript
async function purchaseTokens(packageId) {
    const response = await fetch(`${API_BASE_URL}/stripe/create-checkout`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            packageId: packageId,
            successUrl: window.location.origin + '/success',
            cancelUrl: window.location.origin + '/tokens'
        })
    });

    const { checkoutUrl } = await response.json();
    window.location.href = checkoutUrl; // Redirect to Stripe
}
```

#### **For Mobile (React Native / Capacitor)**
Use Capacitor Purchases plugin for iOS/Android IAP

---

## 5. UI Components Needed

### Token Display (Header)
```html
<div class="token-display">
    <span class="token-icon">🪙</span>
    <span class="token-count">95</span>
    <button class="buy-tokens-btn">+</button>
</div>
```

### Voice Chat Controls
```html
<!-- In chat input area -->
<div class="voice-controls">
    <button class="voice-input-btn" onmousedown="startVoiceInput()" onmouseup="stopVoiceInput()">
        🎤 Hold to Speak
    </button>
    <button class="toggle-voice-btn" onclick="toggleAutoVoice()">
        🔊 Auto-Voice: OFF
    </button>
</div>

<!-- Next to each character message -->
<button class="speak-message-btn" onclick="speakMessage(messageText, character.voiceId)">
    🔊
</button>
```

### Character Creation Page
```html
<div class="creation-wizard">
    <div class="creation-chat">
        <!-- Chat messages here -->
    </div>
    <div class="creation-preview">
        <!-- Live character sheet preview -->
    </div>
    <div class="creation-input">
        <input placeholder="Describe your character..." />
        <button>Generate (5 tokens)</button>
    </div>
</div>
```

---

## 6. File Structure

```
src/
├── components/
│   ├── Auth/
│   │   ├── LoginScreen.jsx
│   │   └── OAuth.js
│   ├── Characters/
│   │   ├── CharacterSelect.jsx
│   │   ├── CharacterCard.jsx
│   │   ├── CharacterCreation.jsx
│   │   └── CharacterSheet.jsx
│   ├── Voice/
│   │   ├── VoiceInput.jsx
│   │   ├── VoiceOutput.jsx
│   │   └── ElevenLabsAPI.js
│   └── Tokens/
│       ├── TokenDisplay.jsx
│       ├── TokenPurchase.jsx
│       └── TokenHistory.jsx
├── services/
│   ├── api.js (all API calls)
│   ├── auth.js (OAuth handling)
│   ├── voice.js (ElevenLabs integration)
│   └── tokens.js (token management)
└── utils/
    ├── dice.js (existing)
    └── storage.js (localStorage wrapper)
```

---

## 7. Implementation Priority

### Phase 1: Connect Existing Auth ✅
- Update OAuth config with your real credentials
- Test Google/Discord login flow
- Verify JWT token storage and usage

### Phase 2: Character Creation 🎯
- Build creation wizard UI
- Integrate with your character creation AI
- Add token deduction for creation

### Phase 3: Voice Integration 🔊
- Add ElevenLabs API calls
- Implement TTS for character responses
- Add voice input (STT) option
- Token deduction for voice features

### Phase 4: Token Economy 💰
- Token purchase UI
- Stripe/IAP integration
- Token usage tracking
- Purchase history

---

## 8. Questions for Your Team

1. **What's your existing auth endpoint URL?**
   - Example: `https://api.characterfoundry.io/auth/google/callback`

2. **Do you have character creation AI already?**
   - If yes, what endpoint does it use?
   - If no, should we use OpenAI/Claude API?

3. **ElevenLabs account setup?**
   - Do you have an API key?
   - Have you selected default voices for character types?

4. **Payment processor?**
   - Web: Stripe? PayPal?
   - Mobile: Apple IAP? Google Play Billing?

5. **Token pricing final?**
   - Is 100 tokens = $0.99 acceptable?
   - Or do you want different pricing tiers?

---

## Next Steps

Let me know:
1. Your auth endpoint URLs
2. Whether you want me to build the character creation page first
3. Voice feature priority (TTS only, or full voice chat?)
4. Current ElevenLabs setup status

I can build any of these components as a standalone demo or integrate directly into your existing backend!
