import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigrations() {
  try {
    console.log('🔄 Starting database migrations...');
    
    // Read schema file
    const schemaPath = path.join(__dirname, '../../../db/schema.postgres.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Run schema
    await pool.query(schema);
    console.log('✅ Schema created successfully');
    
    // Read seed file
    const seedPath = path.join(__dirname, '../../../db/seed.postgres.sql');
    const seed = fs.readFileSync(seedPath, 'utf8');
    
    // Run seed
    await pool.query(seed);
    console.log('✅ Seed data inserted successfully');
    
    console.log('🎉 Database migrations completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
