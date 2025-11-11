/**
 * Bunny CDN Service
 * Upload and manage character assets
 */

import https from 'https';
import { Readable } from 'stream';

export default class BunnyCDNService {
  constructor(apiKey, storageZoneName, region = 'de') {
    if (!apiKey || !storageZoneName) {
      throw new Error('Bunny CDN API key and storage zone name are required');
    }

    this.apiKey = apiKey;
    this.storageZoneName = storageZoneName;
    this.region = region;

    // Bunny storage endpoints by region
    const endpoints = {
      de: 'storage.bunnycdn.com', // EU (Falkenstein)
      ny: 'ny.storage.bunnycdn.com', // US East
      la: 'la.storage.bunnycdn.com', // US West
      sg: 'sg.storage.bunnycdn.com', // Singapore
      syd: 'syd.storage.bunnycdn.com' // Sydney
    };

    this.endpoint = endpoints[region] || endpoints.de;
    this.baseUrl = `https://${this.endpoint}/${storageZoneName}`;
  }

  /**
   * Upload file to Bunny CDN
   * @param {Buffer|string} fileData - File data or URL
   * @param {string} fileName - Target file path (e.g., 'characters/char123/portrait.png')
   * @returns {Promise<Object>} Upload result with CDN URL
   */
  async uploadFile(fileData, fileName) {
    try {
      let buffer;

      // If fileData is a URL, fetch it first
      if (typeof fileData === 'string' && fileData.startsWith('http')) {
        buffer = await this.fetchFileFromUrl(fileData);
      } else {
        buffer = Buffer.isBuffer(fileData) ? fileData : Buffer.from(fileData);
      }

      const url = `${this.baseUrl}/${fileName}`;

      const result = await this.makeRequest('PUT', url, buffer);

      // Return CDN URL
      const cdnUrl = `https://cdn.yourdomain.com/${fileName}`; // Replace with your actual pull zone URL

      return {
        success: true,
        cdnUrl,
        fileName,
        size: buffer.length
      };
    } catch (error) {
      console.error('Bunny CDN upload error:', error);
      throw new Error(`Failed to upload to Bunny CDN: ${error.message}`);
    }
  }

  /**
   * Upload character portrait
   * @param {string} characterId - Character ID
   * @param {Buffer|string} imageData - Image data or URL
   * @param {string} type - Portrait type (standard, battle, injured, etc.)
   * @returns {Promise<Object>} Upload result
   */
  async uploadCharacterPortrait(characterId, imageData, type = 'standard') {
    const fileName = `characters/${characterId}/portrait_${type}_${Date.now()}.png`;
    return await this.uploadFile(imageData, fileName);
  }

  /**
   * Upload ability image
   * @param {string} characterId - Character ID
   * @param {string} abilityId - Ability ID
   * @param {Buffer|string} imageData - Image data or URL
   * @returns {Promise<Object>} Upload result
   */
  async uploadAbilityImage(characterId, abilityId, imageData) {
    const fileName = `characters/${characterId}/abilities/${abilityId}_${Date.now()}.png`;
    return await this.uploadFile(imageData, fileName);
  }

  /**
   * Delete file from Bunny CDN
   * @param {string} fileName - File path to delete
   * @returns {Promise<boolean>} Success
   */
  async deleteFile(fileName) {
    try {
      const url = `${this.baseUrl}/${fileName}`;
      await this.makeRequest('DELETE', url);
      return true;
    } catch (error) {
      console.error('Bunny CDN delete error:', error);
      return false;
    }
  }

  /**
   * List files in directory
   * @param {string} path - Directory path
   * @returns {Promise<Array>} List of files
   */
  async listFiles(path = '') {
    try {
      const url = `${this.baseUrl}/${path}`;
      const result = await this.makeRequest('GET', url);
      return JSON.parse(result);
    } catch (error) {
      console.error('Bunny CDN list error:', error);
      return [];
    }
  }

  /**
   * Fetch file from URL
   * @param {string} url - File URL
   * @returns {Promise<Buffer>} File data
   */
  async fetchFileFromUrl(url) {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      }).on('error', reject);
    });
  }

  /**
   * Make HTTP request to Bunny CDN
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {Buffer} data - Request body (for PUT)
   * @returns {Promise<string>} Response body
   */
  makeRequest(method, url, data = null) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);

      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname,
        method,
        headers: {
          'AccessKey': this.apiKey,
          'Content-Type': 'application/octet-stream'
        }
      };

      if (data) {
        options.headers['Content-Length'] = data.length;
      }

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(responseData);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
          }
        });
      });

      req.on('error', reject);

      if (data) {
        req.write(data);
      }

      req.end();
    });
  }

  /**
   * Get file URL from Bunny CDN
   * @param {string} fileName - File path
   * @returns {string} CDN URL
   */
  getFileUrl(fileName) {
    // Replace with your actual pull zone URL
    return `https://cdn.yourdomain.com/${fileName}`;
  }

  /**
   * Purge CDN cache for a file
   * @param {string} url - File URL to purge
   * @returns {Promise<boolean>} Success
   */
  async purgeCache(url) {
    try {
      const purgeUrl = `https://api.bunny.net/purge?url=${encodeURIComponent(url)}`;

      const options = {
        method: 'POST',
        headers: {
          'AccessKey': this.apiKey
        }
      };

      await new Promise((resolve, reject) => {
        https.request(purgeUrl, options, (res) => {
          if (res.statusCode === 200) {
            resolve();
          } else {
            reject(new Error(`Failed to purge cache: ${res.statusCode}`));
          }
        }).on('error', reject).end();
      });

      return true;
    } catch (error) {
      console.error('Cache purge error:', error);
      return false;
    }
  }
}
