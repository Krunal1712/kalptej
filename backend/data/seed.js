require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const db = require('./db');
const productsJson = require('./products.json');

async function seed() {
  try {
    console.log('Starting Database Initialization & Seeding...');

    // 1. Read and execute schema.sql to create tables
    console.log('Reading schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    
    // Strip comments first
    const cleanSql = schemaSql.replace(/--.*$/gm, '');
    
    // Split queries by semicolon, filter out empty lines
    const queries = cleanSql
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0);

    console.log('Running SQL Schema queries to create tables...');
    for (const q of queries) {
      console.log(`- Executing query: ${q.split('\n')[0].slice(0, 60)}...`);
      await db.query(q);
    }
    console.log('✅ Database schema and tables created/verified successfully!');

    // 2. Check if products table is empty
    const existingProducts = await db.getProducts();
    if (existingProducts.length === 0) {
      console.log(`Products table is empty. Seeding ${productsJson.length} products...`);
      for (const product of productsJson) {
        await db.createProduct({
          ...product,
          createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
        });
      }
      console.log('✅ Products seeded successfully!');
    } else {
      console.log(`Products table already has ${existingProducts.length} items. Skipping product seed.`);
    }

    console.log('🎉 Database migration and seeding fully complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
