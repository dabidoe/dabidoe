/**
 * Seed MongoDB with D&D spells and items
 *
 * Usage:
 *   node scripts/seed-database.js --collection spells
 *   node scripts/seed-database.js --collection items
 *   node scripts/seed-database.js --all
 */

const fs = require('fs')
const path = require('path')
const { MongoClient, ObjectId } = require('mongodb')

// MongoDB connection string
// Set via environment variable: MONGODB_URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/characterfoundry'

/**
 * Connect to MongoDB
 */
async function connectDB() {
  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  console.log('✓ Connected to MongoDB')
  return client
}

/**
 * Seed spells
 */
async function seedSpells(db, data) {
  const collection = db.collection('abilities') // or 'spells' if you prefer

  console.log(`Seeding ${data.length} spells...`)

  // Add _id field
  const spellsWithIds = data.map(spell => ({
    ...spell,
    _id: new ObjectId(),
    createdAt: new Date(spell.createdAt),
    updatedAt: new Date(spell.updatedAt)
  }))

  // Check if any already exist
  const existing = await collection.countDocuments({
    name: { $in: spellsWithIds.map(s => s.name) }
  })

  if (existing > 0) {
    console.log(`⚠ ${existing} spells already exist. Skipping duplicates...`)

    // Insert only new spells
    const existingNames = new Set(
      (await collection.find({}, { name: 1 }).toArray()).map(s => s.name)
    )

    const newSpells = spellsWithIds.filter(s => !existingNames.has(s.name))

    if (newSpells.length > 0) {
      const result = await collection.insertMany(newSpells, { ordered: false })
      console.log(`✓ Inserted ${result.insertedCount} new spells`)
    } else {
      console.log('✓ No new spells to insert')
    }
  } else {
    const result = await collection.insertMany(spellsWithIds)
    console.log(`✓ Inserted ${result.insertedCount} spells`)
  }

  return spellsWithIds.length
}

/**
 * Seed items
 */
async function seedItems(db, data) {
  const collection = db.collection('items') // or merge into 'abilities'

  console.log(`Seeding ${data.length} items...`)

  // Add _id field
  const itemsWithIds = data.map(item => ({
    ...item,
    _id: new ObjectId(),
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt)
  }))

  // Check if any already exist
  const existing = await collection.countDocuments({
    name: { $in: itemsWithIds.map(i => i.name) }
  })

  if (existing > 0) {
    console.log(`⚠ ${existing} items already exist. Skipping duplicates...`)

    // Insert only new items
    const existingNames = new Set(
      (await collection.find({}, { name: 1 }).toArray()).map(i => i.name)
    )

    const newItems = itemsWithIds.filter(i => !existingNames.has(i.name))

    if (newItems.length > 0) {
      const result = await collection.insertMany(newItems, { ordered: false })
      console.log(`✓ Inserted ${result.insertedCount} new items`)
    } else {
      console.log('✓ No new items to insert')
    }
  } else {
    const result = await collection.insertMany(itemsWithIds)
    console.log(`✓ Inserted ${result.insertedCount} items`)
  }

  return itemsWithIds.length
}

/**
 * Main seed function
 */
async function seedDatabase(collection = 'all') {
  let client

  try {
    client = await connectDB()
    const db = client.db()

    let totalSpells = 0
    let totalItems = 0

    // Seed spells
    if (collection === 'spells' || collection === 'all') {
      const spellsPath = path.join(__dirname, '..', 'data', 'spells-seed.json')

      if (fs.existsSync(spellsPath)) {
        const spellsData = JSON.parse(fs.readFileSync(spellsPath, 'utf8'))
        totalSpells = await seedSpells(db, spellsData)
      } else {
        console.log('⚠ Spells seed file not found. Run import-dnd-data.js first.')
      }
    }

    // Seed items
    if (collection === 'items' || collection === 'all') {
      const itemsPath = path.join(__dirname, '..', 'data', 'items-seed.json')

      if (fs.existsSync(itemsPath)) {
        const itemsData = JSON.parse(fs.readFileSync(itemsPath, 'utf8'))
        totalItems = await seedItems(db, itemsData)
      } else {
        console.log('⚠ Items seed file not found. Run import-dnd-data.js first.')
      }
    }

    console.log('\n=== Seeding Complete ===')
    console.log(`Total Spells: ${totalSpells}`)
    console.log(`Total Items: ${totalItems}`)

  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  } finally {
    if (client) {
      await client.close()
      console.log('✓ Database connection closed')
    }
  }
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2)
  const collectionArg = args.find(arg => arg.startsWith('--collection='))
  const collection = collectionArg ? collectionArg.split('=')[1] : 'all'

  const allFlag = args.includes('--all')

  seedDatabase(allFlag ? 'all' : collection)
    .then(() => {
      console.log('\n✓ Seed completed successfully')
      process.exit(0)
    })
    .catch(err => {
      console.error('\n✗ Seed failed:', err)
      process.exit(1)
    })
}

module.exports = { seedDatabase, seedSpells, seedItems }
