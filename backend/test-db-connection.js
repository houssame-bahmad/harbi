// Test database connection
// Run this with: node test-db-connection.js

const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🔍 Testing MySQL connection...\n');
  
  const config = {
    host: '212.1.211.51',
    port: 3306,
    user: 'u894306996_harbi',
    password: '9Amer.3lih',
    database: 'u894306996_harbi'
  };

  console.log('📋 Connection details:');
  console.log('   Host:', config.host);
  console.log('   Port:', config.port);
  console.log('   User:', config.user);
  console.log('   Database:', config.database);
  console.log('   Password:', '***' + config.password.slice(-4));
  console.log('');

  try {
    console.log('⏳ Connecting to database...');
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected successfully!\n');

    // Test query
    console.log('⏳ Running test query...');
    const [rows] = await connection.execute('SELECT DATABASE() as db, NOW() as time');
    console.log('✅ Query successful!');
    console.log('   Database:', rows[0].db);
    console.log('   Server time:', rows[0].time);
    console.log('');

    // Check tables
    console.log('⏳ Checking tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('✅ Tables found:', tables.length);
    tables.forEach(table => {
      console.log('   -', Object.values(table)[0]);
    });
    console.log('');

    await connection.end();
    console.log('✅ Connection test completed successfully!');
    console.log('');
    console.log('🎉 Your database is ready to use!');
    
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('   Error:', error.message);
    console.error('');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Possible issues:');
      console.log('   - Host or port is incorrect');
      console.log('   - Firewall blocking connection');
      console.log('   - MySQL server not running');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Possible issues:');
      console.log('   - Username or password is incorrect');
      console.log('   - User doesn\'t have permission to access database');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 Possible issues:');
      console.log('   - Database name is incorrect');
      console.log('   - Database doesn\'t exist');
    }
    
    process.exit(1);
  }
}

testConnection();
