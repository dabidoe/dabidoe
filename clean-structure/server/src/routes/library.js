/**
 * Library Routes
 * Browse SRD + Community content (items, spells)
 * Public sharing via guid
 */

import express from 'express';
const router = express.Router();

/**
 * GET /api/library/items
 * Browse all items (SRD + community)
 * Query params:
 *   - type: Filter by type (Weapon, Armor, etc.)
 *   - rarity: Filter by rarity
 *   - template: true for SRD only, false for community only
 *   - public: true for shareable only
 *   - userId: Get specific user's items
 *   - search: Search by name
 */
router.get('/items', async (req, res) => {
  try {
    const { type, rarity, template, public: isPublic, userId, search, limit = 100, skip = 0 } = req.query;

    const mongodb = req.app.locals.services.mongodb;
    if (!mongodb) {
      return res.status(503).json({
        success: false,
        error: { message: 'Database not available' }
      });
    }

    // Build query
    const query = {};

    if (type) query.type = type;
    if (rarity) query.rarity = rarity;
    if (template !== undefined) query.template = template === 'true';
    if (isPublic !== undefined) query.public = isPublic === 'true';
    if (userId) query.userId = userId;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch items
    const items = await mongodb.db.collection('items')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .toArray();

    const total = await mongodb.db.collection('items').countDocuments(query);

    res.json({
      success: true,
      data: {
        items,
        total,
        limit: parseInt(limit),
        skip: parseInt(skip)
      }
    });
  } catch (error) {
    console.error('Library items error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch items' }
    });
  }
});

/**
 * GET /api/library/items/:guid
 * Get specific item by guid (for shareable links)
 */
router.get('/items/:guid', async (req, res) => {
  try {
    const mongodb = req.app.locals.services.mongodb;
    if (!mongodb) {
      return res.status(503).json({
        success: false,
        error: { message: 'Database not available' }
      });
    }

    const item = await mongodb.db.collection('items').findOne({
      guid: req.params.guid,
      public: true  // Only return if public
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: { message: 'Item not found or not public' }
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch item' }
    });
  }
});

/**
 * GET /api/library/spells
 * Browse all spells (SRD + community)
 */
router.get('/spells', async (req, res) => {
  try {
    const { school, level, category, template, public: isPublic, userId, search, class: className, limit = 100, skip = 0 } = req.query;

    const mongodb = req.app.locals.services.mongodb;
    if (!mongodb) {
      return res.status(503).json({
        success: false,
        error: { message: 'Database not available' }
      });
    }

    // Build query
    const query = {};

    if (school) query.school = school;
    if (level) query.level = level;
    if (category) query.category = category;
    if (template !== undefined) query.template = template === 'true';
    if (isPublic !== undefined) query.public = isPublic === 'true';
    if (userId) query.userId = userId;
    if (className) query.classes = className.toLowerCase();
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch spells
    const spells = await mongodb.db.collection('spells')
      .find(query)
      .sort({ level: 1, name: 1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .toArray();

    const total = await mongodb.db.collection('spells').countDocuments(query);

    res.json({
      success: true,
      data: {
        spells,
        total,
        limit: parseInt(limit),
        skip: parseInt(skip)
      }
    });
  } catch (error) {
    console.error('Library spells error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch spells' }
    });
  }
});

/**
 * GET /api/library/spells/:guid
 * Get specific spell by guid (for shareable links)
 */
router.get('/spells/:guid', async (req, res) => {
  try {
    const mongodb = req.app.locals.services.mongodb;
    if (!mongodb) {
      return res.status(503).json({
        success: false,
        error: { message: 'Database not available' }
      });
    }

    const spell = await mongodb.db.collection('spells').findOne({
      guid: req.params.guid,
      public: true
    });

    if (!spell) {
      return res.status(404).json({
        success: false,
        error: { message: 'Spell not found or not public' }
      });
    }

    res.json({
      success: true,
      data: spell
    });
  } catch (error) {
    console.error('Get spell error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch spell' }
    });
  }
});

/**
 * GET /api/library/stats
 * Get library statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const mongodb = req.app.locals.services.mongodb;
    if (!mongodb) {
      return res.status(503).json({
        success: false,
        error: { message: 'Database not available' }
      });
    }

    const [itemsTotal, itemsSRD, itemsCommunity, spellsTotal, spellsSRD, spellsCommunity] = await Promise.all([
      mongodb.db.collection('items').countDocuments(),
      mongodb.db.collection('items').countDocuments({ template: true }),
      mongodb.db.collection('items').countDocuments({ template: false, public: true }),
      mongodb.db.collection('spells').countDocuments(),
      mongodb.db.collection('spells').countDocuments({ template: true }),
      mongodb.db.collection('spells').countDocuments({ template: false, public: true })
    ]);

    res.json({
      success: true,
      data: {
        items: {
          total: itemsTotal,
          srd: itemsSRD,
          community: itemsCommunity
        },
        spells: {
          total: spellsTotal,
          srd: spellsSRD,
          community: spellsCommunity
        }
      }
    });
  } catch (error) {
    console.error('Library stats error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch stats' }
    });
  }
});

/**
 * POST /api/library/items/:guid/clone
 * Clone a public item to user's inventory
 */
router.post('/items/:guid/clone', async (req, res) => {
  try {
    const { characterId } = req.body;

    const mongodb = req.app.locals.services.mongodb;
    if (!mongodb) {
      return res.status(503).json({
        success: false,
        error: { message: 'Database not available' }
      });
    }

    // Get the template item
    const templateItem = await mongodb.db.collection('items').findOne({
      guid: req.params.guid,
      public: true
    });

    if (!templateItem) {
      return res.status(404).json({
        success: false,
        error: { message: 'Item not found or not public' }
      });
    }

    // Get character
    const character = await mongodb.getCharacter(characterId);
    if (!character) {
      return res.status(404).json({
        success: false,
        error: { message: 'Character not found' }
      });
    }

    // Clone item into character's inventory
    const clonedItem = {
      ...templateItem,
      _id: undefined,  // New ID will be generated
      sourceGuid: templateItem.guid,  // Reference to original
      characterId,
      equippedSlot: null,  // Not equipped by default
      quantity: templateItem.quantity || 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    delete clonedItem._id;  // Let MongoDB generate new ID

    // Add to character's inventory
    character.inventory = character.inventory || [];
    character.inventory.push(clonedItem);

    await mongodb.updateCharacter(characterId, { inventory: character.inventory });

    res.json({
      success: true,
      data: {
        item: clonedItem,
        message: `${templateItem.name} added to inventory`
      }
    });
  } catch (error) {
    console.error('Clone item error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to clone item' }
    });
  }
});

export default router;
