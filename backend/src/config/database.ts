import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Build database configuration from environment variables
const getDatabaseConfig = () => {
  // If DATABASE_URL is provided, use it
  if (process.env.DATABASE_URL) {
    return {
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    };
  }
  
  // Otherwise, use individual environment variables
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'parapharmacie_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  };
};

// Create MySQL connection pool
const pool = mysql.createPool(getDatabaseConfig());

// Test connection
pool.getConnection()
  .then((connection) => {
    console.log('✅ Connected to MySQL database');
    connection.release();
  })
  .catch((err) => {
    console.error('❌ MySQL connection error:', err.message);
  });

// Helper function to execute queries (compatible with pg interface)
export const query = async (text: string, params?: any[]) => {
  const [rows] = await pool.execute(text, params);
  return { rows };
};

export default pool;
