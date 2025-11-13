/**
 * Character Foundry Backend Server
 * Integrates with Runware.ai for AI-powered character asset generation
 */

import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { createServer } from 'http';
import dotenv from 'dotenv';
// Services are optional - character creation works without them
// import RunwareService from './src/services/runware.js';
// import MongoDBService from './src/services/mongodb.js';
import characterRoutes from './src/routes/characters.js';
import libraryRoutes from './src/routes/library.js';

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

// Initialize services (all optional)
const runwareService = null; // Requires runware npm package
const mongodbService = null; // Requires MongoDB URI

// Make services available to routes
app.locals.runware = runwareService;
app.locals.services = {
  mongodb: mongodbService
};

// API Routes
app.use('/api/characters', characterRoutes);
app.use('/api/library', libraryRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      runware: runwareService ? 'connected' : 'disconnected',
      mongodb: mongodbService?.db ? 'connected' : 'disconnected'
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
  if (!runwareService) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Image generation service not configured'
    }));
    return;
  }

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
  if (!runwareService) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Video generation service not configured'
    }));
    return;
  }

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
  if (!runwareService) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Portrait generation service not configured'
    }));
    return;
  }

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
    // Services are optional - quick character creation works without them
    if (mongodbService) {
      await mongodbService.connect();
      await mongodbService.createIndexes();
    }

    if (runwareService) {
      await runwareService.initialize();
    }

    // Start HTTP/WebSocket server
    server.listen(PORT, () => {
      console.log('═══════════════════════════════════════════════════');
      console.log('🚀 Character Foundry Server');
      console.log('═══════════════════════════════════════════════════');
      console.log(`📡 HTTP Server: http://localhost:${PORT}`);
      console.log(`🔌 WebSocket: ws://localhost:${PORT}/ws`);
      console.log(`💾 MongoDB: ${mongodbService ? 'Connected' : 'Not configured (optional)'}`);
      console.log(`🎨 Runware.ai: ${runwareService ? 'Connected' : 'Not configured (optional)'}`);
      console.log(`✓ Quick character creation: Available`);
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
  if (mongodbService) await mongodbService.disconnect();
  if (runwareService) await runwareService.disconnect();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  if (mongodbService) await mongodbService.disconnect();
  if (runwareService) await runwareService.disconnect();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start the server
startServer();
