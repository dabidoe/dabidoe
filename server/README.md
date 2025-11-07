# Character Foundry Backend Server

Backend API server for Character Foundry with **Runware.ai** integration for AI-powered character asset generation.

## Features

- ✅ **Express REST API** - Character CRUD operations
- ✅ **WebSocket Server** - Real-time AI generation updates
- ✅ **Runware.ai Integration** - Image & video generation via WebSocket
- ✅ **Character Portrait Generation** - AI-generated character art
- ✅ **Real-time Progress Updates** - Live generation status to frontend
- ✅ **Automatic Reconnection** - Resilient WebSocket connections
- ✅ **CORS Support** - Configured for local and production frontends

## Tech Stack

- **Node.js** v18+
- **Express** - HTTP server
- **ws** - WebSocket server
- **Runware SDK** - AI generation API
- **dotenv** - Environment configuration

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` and add your **Runware API key**:

```env
PORT=3001
RUNWARE_API_KEY=your_actual_runware_key_here
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

Get your Runware API key at: https://runware.ai

### 3. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3001` with WebSocket endpoint at `ws://localhost:3001/ws`.

## API Endpoints

### REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/characters` | Get all characters |
| `GET` | `/api/characters/:id` | Get character by ID |
| `POST` | `/api/characters/create` | Create character from prompt |
| `POST` | `/api/characters/:id/portrait` | Generate character portrait |
| `POST` | `/api/chat` | Send chat message to character |
| `PATCH` | `/api/characters/:id/stats` | Update character stats |

### WebSocket API

Connect to `ws://localhost:3001/ws` and send JSON messages:

**Message Types:**

```javascript
// Generate an image
{
  "type": "generate_image",
  "data": {
    "prompt": "A brave elven warrior",
    "height": 1024,
    "width": 1024,
    "model": "runware:100@1"  // Flux.1 Dev
  }
}

// Generate a video
{
  "type": "generate_video",
  "data": {
    "prompt": "Dragon flying over mountains",
    "duration": 5,
    "model": "runware:101@1"  // Kling AI v1.5
  }
}

// Generate a character portrait
{
  "type": "generate_portrait",
  "data": {
    "characterName": "Aelindra",
    "characterDescription": "Elven ranger with silver hair",
    "style": "fantasy art"
  }
}

// Ping/pong for connection monitoring
{
  "type": "ping"
}
```

**Server Responses:**

```javascript
// Progress update
{
  "type": "generation_progress",
  "status": "generating",
  "progress": 45,
  "message": "Generating image... 45%"
}

// Completion
{
  "type": "generation_complete",
  "result": {
    "taskId": "img_1234567890_abc123",
    "type": "image",
    "url": "https://im.runware.ai/...",
    "seed": 123456789,
    "createdAt": "2024-01-21T10:30:00Z"
  }
}

// Error
{
  "type": "generation_error",
  "message": "Failed to generate image"
}
```

## Usage Examples

### Frontend Integration

```javascript
import wsClient from './services/websocket.js';

// Connect to server
await wsClient.connect();

// Generate character portrait with progress updates
const result = await wsClient.generatePortrait({
  characterName: 'Theron',
  characterDescription: 'A powerful wizard with a long white beard',
  style: 'fantasy art'
}, (progress) => {
  console.log(`Progress: ${progress.progress}%`);
  console.log(progress.message);
});

console.log('Portrait URL:', result.url);
```

### REST API Example

```javascript
// Create character with AI-generated portrait
const response = await fetch('http://localhost:3001/api/characters/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'A cunning rogue with dark leather armor',
    options: {
      level: 5,
      generatePortrait: true,
      style: 'dark fantasy'
    }
  })
});

const { data } = await response.json();
console.log('Character created:', data);
console.log('Portrait:', data.thumbnail);
```

## Runware Models

### Image Generation Models

| Model ID | Name | Description |
|----------|------|-------------|
| `runware:100@1` | Flux.1 Dev | High quality, versatile (recommended) |
| `runware:100@2` | Flux.1 Schnell | Fast, lower quality |
| `civitai:618692@691639` | SDXL | Community model |

### Video Generation Models

| Model ID | Name | Description |
|----------|------|-------------|
| `runware:101@1` | Kling AI v1.5 | Realistic, high quality |
| `runware:102@1` | Minimax | Fast generation |

See [Runware Models](https://docs.runware.ai/en/image-inference/models) for more options.

## Project Structure

```
server/
├── index.js                # Main server entry point
├── package.json            # Dependencies
├── .env.example           # Environment template
├── routes/
│   └── characters.js      # Character API routes
└── services/
    └── runware.js         # Runware.ai integration
```

## Development

### Testing WebSocket Connection

```bash
# Install wscat for testing
npm install -g wscat

# Connect to server
wscat -c ws://localhost:3001/ws

# Send test message
{"type":"ping"}

# Generate test image
{"type":"generate_image","data":{"prompt":"A red dragon","height":512,"width":512}}
```

### Monitoring

The server logs all WebSocket connections, generation requests, and errors to console:

```
═══════════════════════════════════════════════════
🚀 Character Foundry Server
═══════════════════════════════════════════════════
📡 HTTP Server: http://localhost:3001
🔌 WebSocket: ws://localhost:3001/ws
🎨 Runware.ai: Connected
═══════════════════════════════════════════════════
✓ WebSocket client connected: client_1234567890_abc123
✓ Runware SDK connected
```

## Production Deployment

### Environment Variables

```env
PORT=3001
NODE_ENV=production
RUNWARE_API_KEY=your_production_key
ALLOWED_ORIGINS=https://your-frontend.com,https://app.your-frontend.com
```

### Recommended Hosting

- **Railway.app** - Easy Node.js deployment with WebSocket support
- **Render.com** - Free tier with persistent WebSockets
- **Fly.io** - Edge deployment with low latency
- **AWS EC2** - Full control with pm2 for process management

### pm2 Process Management

```bash
# Install pm2
npm install -g pm2

# Start server
pm2 start index.js --name character-foundry

# Monitor
pm2 monit

# View logs
pm2 logs character-foundry

# Restart
pm2 restart character-foundry
```

## Troubleshooting

### "RUNWARE_API_KEY not found"

Make sure you created a `.env` file with your API key:
```env
RUNWARE_API_KEY=your_key_here
```

### WebSocket Connection Failed

1. Check that the server is running: `http://localhost:3001/api/health`
2. Verify the WebSocket URL in frontend: `ws://localhost:3001/ws`
3. Check CORS settings in `.env`

### Generation Timeout

Runware generation can take 10-30 seconds for images, 1-3 minutes for videos. The WebSocket will send progress updates during generation.

### Port Already in Use

Change the port in `.env`:
```env
PORT=3002
```

## Cost Optimization

Runware.ai is significantly cheaper than Replicate or OpenAI DALL-E:

| Service | Image Cost | Video Cost |
|---------|------------|------------|
| Runware | ~$0.003 | ~$0.02 |
| Replicate | ~$0.01 | ~$0.10 |
| DALL-E 3 | ~$0.04 | N/A |

Tips to reduce costs:
- Use `flux1-schnell` model for faster, cheaper images
- Cache generated assets with CDN
- Set reasonable rate limits
- Use lower resolutions for previews (512x512)

## License

MIT

## Support

- [Runware Documentation](https://docs.runware.ai)
- [WebSocket API Reference](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
