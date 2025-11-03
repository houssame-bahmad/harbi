// Check database schema
const mysql = require('mysql2/promise');

async function checkSchema() {
  const connection = await mysql.createConnection({
    host: '212.1.211.51',
    port: 3306,
    user: 'u894306996_harbi',
    password: '9Amer.3lih',
    database: 'u894306996_harbi'
  });

  console.log('📋 Database Schema:\n');

  const tables = ['users', 'products', 'orders', 'order_items'];
  
  for (const table of tables) {
    console.log(`\n📊 Table: ${table}`);
    console.log('─'.repeat(60));
    const [columns] = await connection.execute(`DESCRIBE ${table}`);
    columns.forEach(col => {
      console.log(`   ${col.Field.padEnd(25)} ${col.Type.padEnd(20)} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
  }

  await connection.end();
}

checkSchema().catch(console.error);
