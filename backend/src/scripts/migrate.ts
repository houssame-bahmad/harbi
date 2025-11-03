import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function runMigrations() {
  let connection;
  
  try {
    console.log('🔄 Starting database migrations...');
    
    // Create MySQL connection
    connection = await mysql.createConnection(process.env.DATABASE_URL!);
    console.log('✅ Connected to MySQL database');
    
    // Read schema file
    const schemaPath = path.join(__dirname, '../../db/schema.mysql.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split and run schema statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      await connection.query(statement);
    }
    console.log('✅ Schema created successfully');
    
    // Read seed file
    const seedPath = path.join(__dirname, '../../db/seed.mysql.sql');
    const seed = fs.readFileSync(seedPath, 'utf8');
    
    // Split and run seed statements
    const seedStatements = seed
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of seedStatements) {
      if (statement.length > 0) {
        await connection.query(statement);
      }
    }
    console.log('✅ Seed data inserted successfully');
    
    console.log('🎉 Database migrations completed!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigrations();
