# Backend Auth Integration Guide

## What Was Built (Frontend)

The React mobile app now has a complete authentication system:

### Features
- **Google OAuth** - Sign in with Google using Google Identity Services
- **Discord OAuth** - Sign in with Discord (redirect flow)
- **Guest Mode** - Auto-login as guest (default behavior)
- **Account Linking** - Guest accounts can upgrade to full Google/Discord accounts
- **User Context** - Global state management for auth across the app
- **Beautiful UI** - Login modal, user menu, responsive design

### User Flow
1. User lands on the app → **Auto-logged in as guest**
2. Can click "Sign In" to upgrade to Google/Discord account
3. User menu shows account status (Guest vs. Full account)
4. Guest users can link Google/Discord at any time
5. Full account users can sign out

---

## What You Need to Build (Backend)

Your Node.js server needs these **4 auth endpoints**:

### 1. POST `/api/auth/google`

**Purpose:** Verify Google OAuth credential and create/login user

**Request Body:**
```json
{
  "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6..." // Google JWT token
}
```

**What to do:**
1. Verify the Google JWT token using Google's library
2. Extract user info (sub, email, name, picture)
3. Check if user exists in MongoDB (by `googleId` or `email`)
4. If new user → create account with `accountType: 'google'`
5. If existing → login
6. Generate your JWT token for the session
7. Return user + token

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://...",
    "accountType": "google",
    "googleId": "123456789"
  },
  "token": "your_jwt_token_here"
}
```

**Libraries:**
```bash
npm install google-auth-library
```

**Example Code:**
```javascript
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
}
```

---

### 2. POST `/api/auth/discord`

**Purpose:** Handle Discord OAuth callback and create/login user

**Request Body:**
```json
{
  "code": "abc123xyz...",
  "redirectUri": "http://localhost:5173/auth/discord/callback"
}
```

**What to do:**
1. Exchange the `code` for an access token with Discord
2. Use access token to fetch user info from Discord API
3. Extract user info (id, username, email, avatar)
4. Check if user exists in MongoDB (by `discordId` or `email`)
5. If new user → create account with `accountType: 'discord'`
6. If existing → login
7. Generate your JWT token for the session
8. Return user + token

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "name": "JohnDoe#1234",
    "email": "john@example.com",
    "avatar": "https://cdn.discordapp.com/avatars/...",
    "accountType": "discord",
    "discordId": "987654321"
  },
  "token": "your_jwt_token_here"
}
```

**Discord API Endpoints:**
- Token exchange: `https://discord.com/api/oauth2/token`
- User info: `https://discord.com/api/users/@me`

**Example Code:**
```javascript
const axios = require('axios');

async function exchangeDiscordCode(code, redirectUri) {
  const response = await axios.post('https://discord.com/api/oauth2/token',
    new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
    }),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }
  );

  return response.data.access_token;
}

async function getDiscordUser(accessToken) {
  const response = await axios.get('https://discord.com/api/users/@me', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  return response.data;
}
```

---

### 3. POST `/api/auth/guest`

**Purpose:** Create a temporary guest account

**Request Body:** (none)

**What to do:**
1. Generate a unique guest ID (e.g., `guest_${randomId()}`)
2. Create a guest user in MongoDB with `accountType: 'guest'`
3. Generate a JWT token for the session
4. Return user + token

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "name": "Guest",
    "accountType": "guest",
    "createdAt": "2024-11-06T..."
  },
  "token": "your_jwt_token_here"
}
```

**Notes:**
- Guest accounts should be temporary
- Consider auto-deletion after 30 days of inactivity
- When guest upgrades to Google/Discord, migrate their characters to the full account

---

### 4. POST `/api/auth/logout`

**Purpose:** Invalidate user session

**Request Headers:**
```
Authorization: Bearer your_jwt_token_here
```

**What to do:**
1. Extract JWT token from header
2. Add token to blacklist (optional, depends on your JWT strategy)
3. Return success

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Environment Variables Needed

Add these to your Node.js `.env`:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=237330056930-ovunrbr1ecmoqq2nkrrjknl37tt38k0l.apps.googleusercontent.com
# (No client secret needed for frontend OAuth, but you can use it for server-side verification)

# Discord OAuth
DISCORD_CLIENT_ID=1352190743732813887
DISCORD_CLIENT_SECRET=your_discord_client_secret_here
DISCORD_BOT_TOKEN=your_new_discord_bot_token_here

# MongoDB
MONGODB_URI=mongodb+srv://node-server-new:NEW_PASSWORD_HERE@atlascluster.kzgny5x.mongodb.net/StatSheetRebuild
MONGODB_DBNAME=StatSheetRebuild

# JWT
JWT_SECRET=your_random_secret_key_here
JWT_EXPIRES_IN=7d
```

---

## Database Schema

### User Model

```javascript
const UserSchema = new mongoose.Schema({
  // Auth
  accountType: {
    type: String,
    enum: ['guest', 'google', 'discord'],
    required: true
  },

  // Google OAuth
  googleId: { type: String, unique: true, sparse: true },

  // Discord OAuth
  discordId: { type: String, unique: true, sparse: true },

  // Profile
  name: { type: String, required: true },
  email: { type: String, sparse: true },
  avatar: { type: String },

  // Characters (link to your existing character collection)
  characters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Character' }],

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
});
```

---

## Frontend → Backend Data Flow

### Sign In with Google
```
1. User clicks "Continue with Google"
2. Google OAuth popup appears
3. User approves
4. Frontend receives JWT credential from Google
5. Frontend sends credential to POST /api/auth/google
6. Backend verifies + creates/logs in user
7. Backend returns user + JWT token
8. Frontend stores token in localStorage
9. User is logged in
```

### Sign In with Discord
```
1. User clicks "Continue with Discord"
2. Frontend redirects to Discord OAuth page
3. User approves
4. Discord redirects back to /auth/discord/callback?code=xyz
5. Frontend extracts code from URL
6. Frontend sends code to POST /api/auth/discord
7. Backend exchanges code for Discord access token
8. Backend fetches user info from Discord API
9. Backend creates/logs in user
10. Backend returns user + JWT token
11. Frontend stores token and redirects to landing page
12. User is logged in
```

### Guest Login
```
1. User lands on app (no login button clicked)
2. Frontend auto-calls POST /api/auth/guest
3. Backend creates temporary guest account
4. Backend returns user + JWT token
5. Frontend stores token
6. User can create characters as guest
7. Later, user can click "Link Google Account" to upgrade
```

---

## Account Linking (Guest → Full Account)

When a guest user clicks "Link Google Account":

1. Frontend calls the same `POST /api/auth/google` endpoint
2. Backend should check if there's already a logged-in guest user (from JWT token)
3. If guest user exists → **migrate** their characters to the new Google account
4. Delete the guest account
5. Return the upgraded user + new JWT token

**Example Migration Logic:**
```javascript
// Check if user is currently logged in as guest
if (req.user && req.user.accountType === 'guest') {
  // Get the Google user
  const googleUser = await User.findOne({ googleId: googlePayload.sub });

  if (googleUser) {
    // Migrate guest characters to Google account
    await Character.updateMany(
      { userId: req.user._id },
      { userId: googleUser._id }
    );

    // Delete guest account
    await User.findByIdAndDelete(req.user._id);

    return res.json({ user: googleUser, token: generateToken(googleUser) });
  } else {
    // Upgrade guest account to Google account
    req.user.accountType = 'google';
    req.user.googleId = googlePayload.sub;
    req.user.email = googlePayload.email;
    req.user.avatar = googlePayload.picture;
    await req.user.save();

    return res.json({ user: req.user, token: generateToken(req.user) });
  }
}
```

---

## CORS Configuration

Make sure your Node.js server allows requests from the frontend:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',  // Vite dev server
    'https://m.characterfoundry.io',  // Production
  ],
  credentials: true
}));
```

---

## Testing the Integration

1. **Start your Node.js server** with the new endpoints
2. **Update `.env`** in the React app with rotated credentials
3. **Run the React app**: `npm run dev`
4. **Test Guest Login**: Should auto-login when you land on the page
5. **Test Google Login**: Click "Sign In" → "Continue with Google"
6. **Test Discord Login**: Click "Sign In" → "Continue with Discord"
7. **Test Account Linking**: As a guest, click user menu → "Link Google Account"

---

## Security Notes

1. **NEVER commit `.env` files** - Already added to `.gitignore`
2. **Rotate credentials immediately** - The ones in this chat are compromised
3. **Use HTTPS in production** - Required for OAuth to work properly
4. **Validate JWT tokens** - On every protected API request
5. **Rate limit auth endpoints** - Prevent brute force attacks
6. **Sanitize user input** - Always validate and sanitize

---

## Next Steps

1. ✅ Frontend auth system complete
2. 🔲 Implement 4 backend auth endpoints
3. 🔲 Test auth flow end-to-end
4. 🔲 Update character creation to link to user accounts
5. 🔲 Add character syncing between Unity desktop + React mobile
6. 🔲 Deploy to production

---

## Questions?

If you need help implementing any of these endpoints, just ask! The frontend is ready to go once your backend is set up.
