require('dotenv').config();
const mysql = require('mysql2/promise');

async function runCartMigration() {
  console.log('🚀 Starting cart migration...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  });

  try {
    console.log('✅ Connected to database');

    // Create cart_items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_product (user_id, product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ cart_items table created');

    // Create indexes
    await connection.query(`
      CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id)
    `).catch(() => console.log('⚠️  Index idx_cart_user already exists'));

    await connection.query(`
      CREATE INDEX IF NOT EXISTS idx_cart_product ON cart_items(product_id)
    `).catch(() => console.log('⚠️  Index idx_cart_product already exists'));

    console.log('✅ Indexes created');

    console.log('🎉 Cart migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

runCartMigration().catch(console.error);
