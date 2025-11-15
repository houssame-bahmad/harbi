const db = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🔄 Running cart tables migration...');
    
    const sql = fs.readFileSync(
      path.join(__dirname, 'add_cart_tables.sql'),
      'utf8'
    );

    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 50) + '...');
      await db.query(statement);
    }

    console.log('✅ Cart tables migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
