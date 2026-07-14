require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const passwordsToTry = [
  '1712',
  'root',
  'admin',
  '1234',
  '123456',
  '12345678',
  'password',
  '', // empty password
];

async function bruteForce() {
  console.log('Starting DB Password Test...');
  console.log('Testing host 127.0.0.1 on port 3306 for user root...\n');

  for (const pwd of passwordsToTry) {
    try {
      console.log(`Trying password: "${pwd}" (length: ${pwd.length})...`);
      const conn = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: pwd,
        port: 3306
      });
      console.log(`\n🎉 SUCCESS! Connected successfully with password: "${pwd}"`);
      await conn.end();
      process.exit(0);
    } catch (err) {
      if (err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log(`❌ Failed: Access Denied`);
      } else {
        console.log(`❌ Failed with other error: ${err.message}`);
      }
    }
  }

  console.log('\n❌ None of the common passwords worked.');
  process.exit(1);
}

bruteForce();
