/**
 * MongoDB Service
 * Simple character persistence
 */

import { MongoClient, ObjectId } from 'mongodb';

export default class MongoDBService {
  constructor(connectionString) {
    if (!connectionString) {
      throw new Error('MongoDB connection string is required');
    }
    this.connectionString = connectionString;
    this.client = null;
    this.db = null;
  }

  /**
   * Connect to MongoDB
   */
  async connect() {
    try {
      this.client = new MongoClient(this.connectionString);
      await this.client.connect();
      this.db = this.client.db('character-foundry'); // Database name
      console.log('✓ MongoDB connected');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect() {
    if (this.client) {
      await this.client.close();
      console.log('✓ MongoDB disconnected');
    }
  }

  /**
   * Get characters collection
   */
  get characters() {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db.collection('characters');
  }

  // ==================== CHARACTER OPERATIONS ====================

  /**
   * Create a new character
   * @param {Object} character - Character data
   * @returns {Promise<Object>} Created character with _id
   */
  async createCharacter(character) {
    const result = await this.characters.insertOne({
      ...character,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return {
      ...character,
      _id: result.insertedId
    };
  }

  /**
   * Get character by ID
   * @param {string} id - Character ID
   * @returns {Promise<Object|null>} Character or null
   */
  async getCharacter(id) {
    return await this.characters.findOne({
      $or: [
        { _id: new ObjectId(id) },
        { id: id } // Support custom ID field
      ]
    });
  }

  /**
   * Get all characters (paginated)
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Characters
   */
  async getCharacters({ limit = 50, skip = 0, userId = null } = {}) {
    const query = userId ? { userId } : {};

    return await this.characters
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  /**
   * Update character
   * @param {string} id - Character ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated character
   */
  async updateCharacter(id, updates) {
    const result = await this.characters.findOneAndUpdate(
      {
        $or: [
          { _id: new ObjectId(id) },
          { id: id }
        ]
      },
      {
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return result.value;
  }

  /**
   * Delete character
   * @param {string} id - Character ID
   * @returns {Promise<boolean>} Success
   */
  async deleteCharacter(id) {
    const result = await this.characters.deleteOne({
      $or: [
        { _id: new ObjectId(id) },
        { id: id }
      ]
    });

    return result.deletedCount > 0;
  }

  /**
   * Update character stats (HP, conditions, etc.)
   * @param {string} id - Character ID
   * @param {Object} stats - Stats to update
   * @returns {Promise<Object>} Updated character
   */
  async updateCharacterStats(id, stats) {
    return await this.updateCharacter(id, { stats });
  }

  /**
   * Add conversation message to character history
   * @param {string} characterId - Character ID
   * @param {Object} message - Message object
   * @returns {Promise<Object>} Updated character
   */
  async addConversationMessage(characterId, message) {
    const result = await this.characters.findOneAndUpdate(
      {
        $or: [
          { _id: new ObjectId(characterId) },
          { id: characterId }
        ]
      },
      {
        $push: {
          conversationHistory: {
            ...message,
            timestamp: new Date()
          }
        },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );

    return result.value;
  }

  /**
   * Search characters by name
   * @param {string} searchTerm - Search term
   * @param {number} limit - Max results
   * @returns {Promise<Array>} Matching characters
   */
  async searchCharacters(searchTerm, limit = 20) {
    return await this.characters
      .find({
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { race: { $regex: searchTerm, $options: 'i' } },
          { class: { $regex: searchTerm, $options: 'i' } }
        ]
      })
      .limit(limit)
      .toArray();
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get database stats
   * @returns {Promise<Object>} Database statistics
   */
  async getStats() {
    const count = await this.characters.countDocuments();
    const recentCount = await this.characters.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24h
    });

    return {
      totalCharacters: count,
      charactersLast24h: recentCount
    };
  }

  /**
   * Create indexes for better performance
   */
  async createIndexes() {
    await this.characters.createIndex({ id: 1 });
    await this.characters.createIndex({ name: 1 });
    await this.characters.createIndex({ userId: 1 });
    await this.characters.createIndex({ createdAt: -1 });
    console.log('✓ MongoDB indexes created');
  }
}
