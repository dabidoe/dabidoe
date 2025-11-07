/**
 * Character Foundry Backend Server
 * Integrates with Runware.ai for AI-powered character asset generation
 */

import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { createServer } from 'http';
import dotenv from 'dotenv';
import RunwareService from './services/runware.js';
import characterRoutes from './routes/characters.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Initialize Runware service
const runwareService = new RunwareService(process.env.RUNWARE_API_KEY);

// Make runware service available to routes
app.locals.runware = runwareService;

// API Routes
app.use('/api/characters', characterRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      runware: runwareService ? 'connected' : 'disconnected'
    }
  });
});

// Create HTTP server
const server = createServer(app);

// WebSocket Server for real-time updates
const wss = new WebSocketServer({
  server,
  path: '/ws'
});

// Track connected clients
const clients = new Map();

wss.on('connection', (ws, req) => {
  const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  clients.set(clientId, ws);

  console.log(`✓ WebSocket client connected: ${clientId}`);

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connection',
    status: 'connected',
    clientId,
    message: 'Connected to Character Foundry server'
  }));

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case 'generate_image':
          await handleImageGeneration(ws, message);
          break;

        case 'generate_video':
          await handleVideoGeneration(ws, message);
          break;

        case 'generate_portrait':
          await handlePortraitGeneration(ws, message);
          break;

        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          break;

        default:
          ws.send(JSON.stringify({
            type: 'error',
            message: `Unknown message type: ${message.type}`
          }));
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: error.message || 'Failed to process message'
      }));
    }
  });

  ws.on('close', () => {
    clients.delete(clientId);
    console.log(`✗ WebSocket client disconnected: ${clientId}`);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for ${clientId}:`, error);
    clients.delete(clientId);
  });
});

/**
 * Handle image generation request via WebSocket
 */
async function handleImageGeneration(ws, message) {
  const { prompt, negativePrompt, model, height, width, steps, seed } = message.data || {};

  if (!prompt) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Prompt is required for image generation'
    }));
    return;
  }

  // Progress callback that sends updates to client
  const progressCallback = (update) => {
    ws.send(JSON.stringify({
      type: 'generation_progress',
      ...update
    }));
  };

  try {
    const result = await runwareService.generateImage({
      prompt,
      negativePrompt,
      model,
      height,
      width,
      steps,
      seed
    }, progressCallback);

    ws.send(JSON.stringify({
      type: 'generation_complete',
      result
    }));
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'generation_error',
      message: error.message
    }));
  }
}

/**
 * Handle video generation request via WebSocket
 */
async function handleVideoGeneration(ws, message) {
  const { prompt, model, duration, ratio } = message.data || {};

  if (!prompt) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Prompt is required for video generation'
    }));
    return;
  }

  const progressCallback = (update) => {
    ws.send(JSON.stringify({
      type: 'generation_progress',
      ...update
    }));
  };

  try {
    const result = await runwareService.generateVideo({
      prompt,
      model,
      duration,
      ratio
    }, progressCallback);

    ws.send(JSON.stringify({
      type: 'generation_complete',
      result
    }));
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'generation_error',
      message: error.message
    }));
  }
}

/**
 * Handle character portrait generation via WebSocket
 */
async function handlePortraitGeneration(ws, message) {
  const { characterName, characterDescription, style, format } = message.data || {};

  if (!characterName || !characterDescription) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Character name and description are required'
    }));
    return;
  }

  const progressCallback = (update) => {
    ws.send(JSON.stringify({
      type: 'generation_progress',
      ...update
    }));
  };

  try {
    const result = await runwareService.generateCharacterPortrait({
      characterName,
      characterDescription,
      style,
      format
    }, progressCallback);

    ws.send(JSON.stringify({
      type: 'generation_complete',
      result
    }));
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'generation_error',
      message: error.message
    }));
  }
}

// Initialize server
async function startServer() {
  try {
    // Initialize Runware connection
    await runwareService.initialize();

    // Start HTTP/WebSocket server
    server.listen(PORT, () => {
      console.log('═══════════════════════════════════════════════════');
      console.log('🚀 Character Foundry Server');
      console.log('═══════════════════════════════════════════════════');
      console.log(`📡 HTTP Server: http://localhost:${PORT}`);
      console.log(`🔌 WebSocket: ws://localhost:${PORT}/ws`);
      console.log(`🎨 Runware.ai: Connected`);
      console.log('═══════════════════════════════════════════════════');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await runwareService.disconnect();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  await runwareService.disconnect();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start the server
startServer();
