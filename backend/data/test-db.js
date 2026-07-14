require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('Testing MySQL Connection...');
  console.log('Credentials:');
  console.log(`- Host: ${process.env.DB_HOST}`);
  console.log(`- User: ${process.env.DB_USER}`);
  console.log(`- Port: ${process.env.DB_PORT}`);
  console.log(`- Database Name: ${process.env.DB_NAME}`);
  console.log(`- Password length: ${process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0}`);

  try {
    // 1. Try connecting without specifying database first
    console.log('\nStep 1: Connecting to MySQL server (without specifying database)...');
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: parseInt(process.env.DB_PORT || '3306', 10)
    });
    console.log('✅ Connection to MySQL server succeeded!');

    // 2. Try creating the database if it doesn't exist
    console.log(`\nStep 2: Checking/Creating database "${process.env.DB_NAME}"...`);
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    console.log(`✅ Database "${process.env.DB_NAME}" checked/created successfully!`);
    await conn.end();

    // 3. Try connecting with database specified
    console.log(`\nStep 3: Connecting with database "${process.env.DB_NAME}" specified...`);
    const connWithDb = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kalptaj_db',
      port: parseInt(process.env.DB_PORT || '3306', 10)
    });
    console.log('✅ Connection with database specified succeeded!');
    await connWithDb.end();
    
    console.log('\n🎉 ALL TESTS PASSED! Database connection is fully operational.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST FAILED with error:', error);
    process.exit(1);
  }
}

testConnection();
