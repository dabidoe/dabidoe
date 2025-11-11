/**
 * Character API Routes
 * Integrated with Gemini AI, MongoDB, and Bunny CDN
 */

import express from 'express';

const router = express.Router();

/**
 * GET /api/characters
 * Get all characters (paginated)
 */
router.get('/', async (req, res) => {
  try {
    const { limit = 20, skip = 0 } = req.query;
    const mongodb = req.app.locals.services.mongodb;

    if (!mongodb) {
      return res.status(503).json({
        success: false,
        error: { message: 'Database not available' }
      });
    }

    const characters = await mongodb.getCharacters({
      limit: parseInt(limit),
      skip: parseInt(skip)
    });

    res.json({
      success: true,
      data: characters
    });
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch characters' }
    });
  }
});

export default router;
