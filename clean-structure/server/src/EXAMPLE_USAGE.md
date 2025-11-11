# Runware.ai Integration - Example Usage

This guide shows how to use the Runware integration for character portrait and asset generation.

## Quick Start

### 1. Start the Server

```bash
cd server
npm install
cp .env.example .env
# Edit .env and add your RUNWARE_API_KEY
npm run dev
```

### 2. Connect from Frontend

```javascript
import wsClient from './services/websocket.js';

// Connect to WebSocket server
await wsClient.connect();
```

## React Component Examples

### Example 1: Character Portrait Generator

```jsx
import { useState } from 'react';
import wsClient from '../services/websocket';

function CharacterPortraitGenerator({ characterName, characterDescription }) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [portraitUrl, setPortraitUrl] = useState(null);
  const [error, setError] = useState(null);

  const generatePortrait = async () => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Connect if not already connected
      if (!wsClient.isConnected()) {
        await wsClient.connect();
      }

      // Generate portrait with real-time progress updates
      const result = await wsClient.generatePortrait(
        {
          characterName,
          characterDescription,
          style: 'fantasy art'
        },
        (progressData) => {
          // Real-time progress callback
          setProgress(progressData.progress || 0);
          console.log(progressData.message);
        }
      );

      setPortraitUrl(result.url);
      setProgress(100);
    } catch (err) {
      setError(err.message);
      console.error('Generation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portrait-generator">
      <h3>Generate Character Portrait</h3>

      <button
        onClick={generatePortrait}
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate Portrait'}
      </button>

      {loading && (
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
          <span>{progress}%</span>
        </div>
      )}

      {error && (
        <div className="error">Error: {error}</div>
      )}

      {portraitUrl && (
        <div className="portrait-result">
          <img src={portraitUrl} alt={characterName} />
          <a href={portraitUrl} target="_blank" rel="noopener noreferrer">
            Open Full Size
          </a>
        </div>
      )}
    </div>
  );
}

export default CharacterPortraitGenerator;
```

### Example 2: Image Generator with Custom Options

```jsx
import { useState } from 'react';
import wsClient from '../services/websocket';

function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  const generate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setProgress(0);
    setImageUrl(null);

    try {
      if (!wsClient.isConnected()) {
        await wsClient.connect();
      }

      const result = await wsClient.generateImage(
        {
          prompt: prompt,
          negativePrompt: 'blurry, low quality, distorted',
          model: 'runware:100@1', // Flux.1 Dev
          height: 1024,
          width: 1024,
          steps: 20
        },
        (progressData) => {
          setProgress(progressData.progress || 0);
          setStatusMessage(progressData.message || '');

          // Show preview if available
          if (progressData.previewUrl) {
            setImageUrl(progressData.previewUrl);
          }
        }
      );

      setImageUrl(result.url);
      setStatusMessage('Generation complete!');
    } catch (err) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="image-generator">
      <h2>AI Image Generator</h2>

      <div className="input-group">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image..."
          disabled={loading}
        />
        <button onClick={generate} disabled={loading || !prompt.trim()}>
          Generate
        </button>
      </div>

      {loading && (
        <div className="status">
          <div className="progress-bar">
            <div style={{ width: `${progress}%` }} />
          </div>
          <p>{statusMessage}</p>
        </div>
      )}

      {imageUrl && (
        <img src={imageUrl} alt={prompt} className="generated-image" />
      )}
    </div>
  );
}

export default ImageGenerator;
```

### Example 3: Video Generator

```jsx
import { useState } from 'react';
import wsClient from '../services/websocket';

function VideoGenerator() {
  const [prompt, setPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const generateVideo = async () => {
    setLoading(true);
    setProgress(0);

    try {
      if (!wsClient.isConnected()) {
        await wsClient.connect();
      }

      const result = await wsClient.generateVideo(
        {
          prompt: prompt,
          model: 'runware:101@1', // Kling AI v1.5
          duration: 5,
          ratio: '16:9'
        },
        (progressData) => {
          setProgress(progressData.progress || 0);
        }
      );

      setVideoUrl(result.url);
      setThumbnailUrl(result.thumbnailUrl);
    } catch (err) {
      console.error('Video generation failed:', err);
      alert(`Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="video-generator">
      <h2>AI Video Generator</h2>

      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the video..."
      />

      <button onClick={generateVideo} disabled={loading}>
        {loading ? `Generating... ${progress}%` : 'Generate Video'}
      </button>

      {videoUrl && (
        <div className="video-result">
          <video controls poster={thumbnailUrl}>
            <source src={videoUrl} type="video/mp4" />
          </video>
        </div>
      )}
    </div>
  );
}

export default VideoGenerator;
```

### Example 4: Character Creation with Portrait

```jsx
import { useState } from 'react';
import { createCharacter } from '../services/api';
import wsClient from '../services/websocket';

function CharacterCreator() {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [character, setCharacter] = useState(null);

  const createWithPortrait = async () => {
    setGenerating(true);

    try {
      // Step 1: Create character via REST API
      const charResponse = await createCharacter(prompt);
      const newCharacter = charResponse.data;

      setCharacter(newCharacter);

      // Step 2: Generate portrait via WebSocket
      if (!wsClient.isConnected()) {
        await wsClient.connect();
      }

      const portraitResult = await wsClient.generatePortrait(
        {
          characterName: newCharacter.name,
          characterDescription: newCharacter.description,
          style: 'fantasy art'
        },
        (progress) => {
          console.log(`Portrait: ${progress.progress}%`);
        }
      );

      // Step 3: Update character with portrait URL
      setCharacter(prev => ({
        ...prev,
        thumbnail: portraitResult.url
      }));

      console.log('Character created with portrait!');
    } catch (err) {
      console.error('Failed to create character:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="character-creator">
      <h2>Create Character</h2>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your character..."
        rows={4}
      />

      <button onClick={createWithPortrait} disabled={generating}>
        {generating ? 'Creating...' : 'Create Character'}
      </button>

      {character && (
        <div className="character-card">
          <h3>{character.name}</h3>
          {character.thumbnail && (
            <img src={character.thumbnail} alt={character.name} />
          )}
          <p>{character.description}</p>
          <div className="stats">
            <span>HP: {character.hp.current}/{character.hp.max}</span>
            <span>AC: {character.ac}</span>
            <span>Level: {character.level}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default CharacterCreator;
```

## REST API Examples

### Create Character (without portrait)

```javascript
const response = await fetch('http://localhost:3001/api/characters/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'A brave knight with shining armor',
    options: {
      level: 5,
      generatePortrait: false
    }
  })
});

const { data } = await response.json();
console.log('Character:', data);
```

### Generate Portrait for Existing Character

```javascript
const response = await fetch('http://localhost:3001/api/characters/char123/portrait', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    style: 'dark fantasy',
    regenerate: true
  })
});

const { data } = await response.json();
console.log('Portrait URL:', data.portraitUrl);
```

## WebSocket Message Examples

### Low-level WebSocket Usage (without client library)

```javascript
const ws = new WebSocket('ws://localhost:3001/ws');

ws.onopen = () => {
  console.log('Connected');

  // Send generation request
  ws.send(JSON.stringify({
    type: 'generate_image',
    data: {
      prompt: 'A magical staff with glowing runes',
      height: 1024,
      width: 1024,
      model: 'runware:100@1'
    }
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case 'generation_progress':
      console.log(`Progress: ${data.progress}%`);
      console.log(`Status: ${data.message}`);
      break;

    case 'generation_complete':
      console.log('Image URL:', data.result.url);
      ws.close();
      break;

    case 'generation_error':
      console.error('Error:', data.message);
      ws.close();
      break;
  }
};
```

## Advanced Usage

### Batch Generation

```javascript
async function generateMultiplePortraits(characters) {
  await wsClient.connect();

  const results = await Promise.all(
    characters.map(char =>
      wsClient.generatePortrait({
        characterName: char.name,
        characterDescription: char.description,
        style: 'fantasy art'
      })
    )
  );

  return results;
}
```

### Retry Logic

```javascript
async function generateWithRetry(options, maxRetries = 3) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await wsClient.generateImage(options);
    } catch (err) {
      lastError = err;
      console.warn(`Attempt ${i + 1} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }

  throw lastError;
}
```

### Save to Database

```javascript
async function generateAndSave(characterId, prompt) {
  const result = await wsClient.generateImage({ prompt });

  // Save to database
  await fetch(`/api/characters/${characterId}/portrait`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      portraitUrl: result.url,
      portraitSeed: result.seed
    })
  });

  return result;
}
```

## Model Options

### High Quality (Slow)

```javascript
{
  model: 'runware:100@1',  // Flux.1 Dev
  steps: 30,
  height: 1024,
  width: 1024
}
```

### Fast Generation (Lower Quality)

```javascript
{
  model: 'runware:100@2',  // Flux.1 Schnell
  steps: 4,
  height: 512,
  width: 512
}
```

### Square vs Portrait vs Landscape

```javascript
// Square (profile pictures)
{ height: 1024, width: 1024 }

// Portrait (character cards)
{ height: 1536, width: 1024 }

// Landscape (banners)
{ height: 1024, width: 1536 }
```

## Error Handling

```javascript
try {
  const result = await wsClient.generateImage(options);
  console.log('Success:', result.url);
} catch (err) {
  if (err.message.includes('timeout')) {
    console.error('Generation timed out, try again');
  } else if (err.message.includes('API key')) {
    console.error('Invalid API key');
  } else {
    console.error('Unknown error:', err);
  }
}
```

## Performance Tips

1. **Use lower resolution for previews**: 512x512 generates 4x faster than 1024x1024
2. **Batch requests**: Generate multiple images in parallel
3. **Cache results**: Store generated URLs in database to avoid regeneration
4. **Use CDN**: Upload to Bunny CDN or Cloudflare for fast delivery
5. **Set rate limits**: Prevent abuse and control costs

## Troubleshooting

### "WebSocket is not connected"

```javascript
// Always check connection before generating
if (!wsClient.isConnected()) {
  await wsClient.connect();
}
```

### Generation Takes Too Long

- Use faster model: `runware:100@2` (Flux Schnell)
- Reduce steps: 4-10 steps instead of 20-30
- Lower resolution: 512x512 instead of 1024x1024

### Memory Issues

```javascript
// Disconnect when done
useEffect(() => {
  return () => {
    wsClient.disconnect();
  };
}, []);
```

## Next Steps

- Integrate with your character creation flow
- Add CDN upload for generated assets
- Implement caching to reduce API calls
- Add user gallery of generated images
- Create preset styles for consistent art direction
