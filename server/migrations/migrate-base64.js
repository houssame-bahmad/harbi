// Run this migration to add base64 storage columns to existing media_files table
const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  let connection;
  
  try {
    console.log('🔄 Starting base64 storage migration...\n');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('✅ Connected to MySQL');

    // Check if columns exist
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'media_files'
    `, [process.env.DB_NAME]);

    const columnNames = columns.map((c) => c.COLUMN_NAME);
    const hasBase64 = columnNames.includes('base64_data');
    const hasStorageType = columnNames.includes('storage_type');

    if (hasBase64 && hasStorageType) {
      console.log('ℹ️  Columns already exist - migration not needed');
      return;
    }

    console.log('📝 Adding base64 storage columns...');

    // Add base64_data column if missing
    if (!hasBase64) {
      await connection.query(`
        ALTER TABLE media_files 
        ADD COLUMN base64_data LONGTEXT DEFAULT NULL
      `);
      console.log('✅ Added base64_data column');
    }

    // Add storage_type column if missing
    if (!hasStorageType) {
      await connection.query(`
        ALTER TABLE media_files 
        ADD COLUMN storage_type ENUM('file','url','base64') DEFAULT 'file'
      `);
      console.log('✅ Added storage_type column');
    }

    // Make path and url nullable
    await connection.query(`
      ALTER TABLE media_files 
      MODIFY COLUMN path VARCHAR(500) DEFAULT NULL,
      MODIFY COLUMN url VARCHAR(500) DEFAULT NULL
    `);
    console.log('✅ Made path and url columns nullable');

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📦 Base64 storage is now available:');
    console.log('   - Upload images/videos via admin panel');
    console.log('   - Files stored as base64 in MySQL database');
    console.log('   - Served via /api/media/:id endpoint\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
