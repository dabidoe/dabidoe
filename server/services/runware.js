/**
 * Runware.ai Service
 * Handles image and video generation via WebSocket API
 */

import WebSocket from 'ws';
import { Runware } from 'runware';

class RunwareService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.runware = new Runware({ apiKey });
    this.activeConnections = new Map(); // Track active generation tasks
  }

  /**
   * Initialize the Runware connection
   */
  async initialize() {
    try {
      await this.runware.connect();
      console.log('✓ Runware SDK connected');
      return true;
    } catch (error) {
      console.error('✗ Failed to connect to Runware:', error);
      throw error;
    }
  }

  /**
   * Generate an image using Runware's image inference
   * @param {Object} options - Generation options
   * @param {Function} progressCallback - Called with progress updates
   * @returns {Promise<Object>} Generated image data
   */
  async generateImage(options, progressCallback) {
    const {
      prompt,
      negativePrompt = 'blurry, low quality, distorted',
      model = 'runware:100@1', // Flux.1 Dev - high quality
      height = 1024,
      width = 1024,
      steps = 20,
      seed,
    } = options;

    try {
      const taskId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      if (progressCallback) {
        progressCallback({
          status: 'initializing',
          progress: 0,
          message: 'Starting image generation...'
        });
      }

      // Use the SDK for image generation
      const images = await this.runware.imageInference({
        positivePrompt: prompt,
        negativePrompt,
        model,
        height,
        width,
        numberOfImages: 1,
        steps,
        ...(seed && { seed }),
        onPartialImages: (partialImages) => {
          // Real-time progress updates
          if (progressCallback && partialImages.length > 0) {
            progressCallback({
              status: 'generating',
              progress: 50, // Estimate
              message: 'Generating image...',
              previewUrl: partialImages[0].imageURL
            });
          }
        }
      });

      if (!images || images.length === 0) {
        throw new Error('No image generated');
      }

      const result = {
        taskId,
        type: 'image',
        url: images[0].imageURL,
        seed: images[0].seed,
        model,
        prompt,
        createdAt: new Date().toISOString()
      };

      if (progressCallback) {
        progressCallback({
          status: 'completed',
          progress: 100,
          message: 'Image generated successfully!',
          result
        });
      }

      return result;

    } catch (error) {
      console.error('Image generation error:', error);
      if (progressCallback) {
        progressCallback({
          status: 'error',
          progress: 0,
          message: error.message || 'Failed to generate image'
        });
      }
      throw error;
    }
  }

  /**
   * Generate a video using Runware's video inference
   * @param {Object} options - Generation options
   * @param {Function} progressCallback - Called with progress updates
   * @returns {Promise<Object>} Generated video data
   */
  async generateVideo(options, progressCallback) {
    const {
      prompt,
      model = 'runware:101@1', // Kling AI v1.5 - realistic
      duration = 5,
      ratio = '16:9'
    } = options;

    try {
      const taskId = `vid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      if (progressCallback) {
        progressCallback({
          status: 'initializing',
          progress: 0,
          message: 'Starting video generation...'
        });
      }

      // Video generation via SDK
      const videos = await this.runware.videoInference({
        prompt,
        model,
        duration,
        ratio,
        onProgress: (progress) => {
          if (progressCallback) {
            progressCallback({
              status: 'generating',
              progress: Math.round(progress * 100),
              message: `Generating video... ${Math.round(progress * 100)}%`
            });
          }
        }
      });

      if (!videos || videos.length === 0) {
        throw new Error('No video generated');
      }

      const result = {
        taskId,
        type: 'video',
        url: videos[0].videoURL,
        thumbnailUrl: videos[0].thumbnailURL,
        duration,
        model,
        prompt,
        createdAt: new Date().toISOString()
      };

      if (progressCallback) {
        progressCallback({
          status: 'completed',
          progress: 100,
          message: 'Video generated successfully!',
          result
        });
      }

      return result;

    } catch (error) {
      console.error('Video generation error:', error);
      if (progressCallback) {
        progressCallback({
          status: 'error',
          progress: 0,
          message: error.message || 'Failed to generate video'
        });
      }
      throw error;
    }
  }

  /**
   * Generate character portrait (wrapper with optimized settings)
   * @param {Object} options - Character details
   * @param {Function} progressCallback - Progress updates
   * @returns {Promise<Object>} Generated portrait
   */
  async generateCharacterPortrait(options, progressCallback) {
    const {
      characterName,
      characterDescription,
      style = 'fantasy art',
      format = 'portrait'
    } = options;

    const prompt = `High quality ${style} portrait of ${characterName}, ${characterDescription}, detailed features, professional lighting, ${format} composition, sharp focus, 8k, highly detailed`;

    const negativePrompt = 'blurry, low quality, distorted, ugly, deformed, disfigured, bad anatomy, watermark, text, signature';

    return this.generateImage({
      prompt,
      negativePrompt,
      model: 'runware:100@1', // Flux.1 Dev for high quality
      height: 1024,
      width: 1024,
      steps: 25
    }, progressCallback);
  }

  /**
   * Cleanup method
   */
  async disconnect() {
    try {
      await this.runware.disconnect();
      console.log('✓ Runware SDK disconnected');
    } catch (error) {
      console.error('Error disconnecting Runware:', error);
    }
  }
}

export default RunwareService;
