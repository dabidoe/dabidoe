/**
 * WebSocket Client Service
 * Connects to backend server for real-time AI generation updates
 */

class WebSocketClient {
  constructor(url = 'ws://localhost:3001/ws') {
    this.url = url;
    this.ws = null;
    this.connected = false;
    this.messageHandlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000;
  }

  /**
   * Connect to the WebSocket server
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('✓ WebSocket connected');
          this.connected = true;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('✗ WebSocket disconnected');
          this.connected = false;
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch((error) => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  /**
   * Handle incoming messages
   */
  handleMessage(data) {
    const { type } = data;

    if (this.messageHandlers.has(type)) {
      const handlers = this.messageHandlers.get(type);
      handlers.forEach(handler => handler(data));
    }

    // Also call wildcard handlers
    if (this.messageHandlers.has('*')) {
      const handlers = this.messageHandlers.get('*');
      handlers.forEach(handler => handler(data));
    }
  }

  /**
   * Register a message handler
   * @param {string} type - Message type to listen for (use '*' for all messages)
   * @param {Function} handler - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(type, handler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }

    this.messageHandlers.get(type).push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(type);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    };
  }

  /**
   * Send a message to the server
   */
  send(type, data = {}) {
    if (!this.connected || !this.ws) {
      throw new Error('WebSocket is not connected');
    }

    this.ws.send(JSON.stringify({
      type,
      data
    }));
  }

  /**
   * Generate an image with real-time progress updates
   * @param {Object} options - Generation options
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Generated image result
   */
  generateImage(options, onProgress) {
    return new Promise((resolve, reject) => {
      let progressUnsubscribe;
      let completeUnsubscribe;
      let errorUnsubscribe;

      // Listen for progress updates
      progressUnsubscribe = this.on('generation_progress', (data) => {
        if (onProgress) onProgress(data);
      });

      // Listen for completion
      completeUnsubscribe = this.on('generation_complete', (data) => {
        progressUnsubscribe();
        completeUnsubscribe();
        errorUnsubscribe();
        resolve(data.result);
      });

      // Listen for errors
      errorUnsubscribe = this.on('generation_error', (data) => {
        progressUnsubscribe();
        completeUnsubscribe();
        errorUnsubscribe();
        reject(new Error(data.message));
      });

      // Send generation request
      try {
        this.send('generate_image', options);
      } catch (error) {
        progressUnsubscribe();
        completeUnsubscribe();
        errorUnsubscribe();
        reject(error);
      }
    });
  }

  /**
   * Generate a video with real-time progress updates
   * @param {Object} options - Generation options
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Generated video result
   */
  generateVideo(options, onProgress) {
    return new Promise((resolve, reject) => {
      let progressUnsubscribe;
      let completeUnsubscribe;
      let errorUnsubscribe;

      progressUnsubscribe = this.on('generation_progress', (data) => {
        if (onProgress) onProgress(data);
      });

      completeUnsubscribe = this.on('generation_complete', (data) => {
        progressUnsubscribe();
        completeUnsubscribe();
        errorUnsubscribe();
        resolve(data.result);
      });

      errorUnsubscribe = this.on('generation_error', (data) => {
        progressUnsubscribe();
        completeUnsubscribe();
        errorUnsubscribe();
        reject(new Error(data.message));
      });

      try {
        this.send('generate_video', options);
      } catch (error) {
        progressUnsubscribe();
        completeUnsubscribe();
        errorUnsubscribe();
        reject(error);
      }
    });
  }

  /**
   * Generate a character portrait with real-time progress
   * @param {Object} options - Character details
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Generated portrait result
   */
  generatePortrait(options, onProgress) {
    return new Promise((resolve, reject) => {
      let progressUnsubscribe;
      let completeUnsubscribe;
      let errorUnsubscribe;

      progressUnsubscribe = this.on('generation_progress', (data) => {
        if (onProgress) onProgress(data);
      });

      completeUnsubscribe = this.on('generation_complete', (data) => {
        progressUnsubscribe();
        completeUnsubscribe();
        errorUnsubscribe();
        resolve(data.result);
      });

      errorUnsubscribe = this.on('generation_error', (data) => {
        progressUnsubscribe();
        completeUnsubscribe();
        errorUnsubscribe();
        reject(new Error(data.message));
      });

      try {
        this.send('generate_portrait', options);
      } catch (error) {
        progressUnsubscribe();
        completeUnsubscribe();
        errorUnsubscribe();
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.connected = false;
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected() {
    return this.connected && this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

// Create singleton instance
const wsClient = new WebSocketClient(
  import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws'
);

export default wsClient;
