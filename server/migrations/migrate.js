const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function runMigrations() {
  let connection;
  
  try {
    console.log('🔄 Starting database migration...\n');
    
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL database');

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    let schema = fs.readFileSync(schemaPath, 'utf8');

    // Hash the default admin password
    const hashedPassword = await bcrypt.hash(
      process.env.DEFAULT_ADMIN_PASSWORD || 'BenminaMedia2024!',
      10
    );

    // Replace placeholder with actual hashed password
    schema = schema.replace('$2b$10$YourHashedPasswordHere', hashedPassword);
    schema = schema.replace('benmina01ahmed@gmail.com', process.env.DEFAULT_ADMIN_EMAIL || 'benmina01ahmed@gmail.com');

    console.log('📄 Running schema migration...');

    // Execute schema
    await connection.query(schema);

    console.log('✅ Database schema created successfully!');
    console.log('\n📊 Tables created:');
    console.log('   - users');
    console.log('   - projects');
    console.log('   - reviews');
    console.log('   - plans');
    console.log('   - about_content');
    console.log('   - contact_submissions');
    console.log('   - gallery_items');
    console.log('   - media_files');
    
    console.log('\n👤 Default admin user created:');
    console.log(`   Email: ${process.env.DEFAULT_ADMIN_EMAIL || 'benmina01ahmed@gmail.com'}`);
    console.log(`   Password: ${process.env.DEFAULT_ADMIN_PASSWORD || 'BenminaMedia2024!'}`);
    
    console.log('\n🎉 Migration completed successfully!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Details:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run migrations
runMigrations();
