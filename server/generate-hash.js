// Generate bcrypt hash for admin password
const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);
  console.log('\n========================================');
  console.log('ADMIN USER CREDENTIALS');
  console.log('========================================');
  console.log('Email: admin@exemple.com');
  console.log('Password: admin123');
  console.log('Bcrypt Hash:', hash);
  console.log('========================================\n');
  
  // Also generate for customer
  const customerPassword = 'customer123';
  const customerHash = await bcrypt.hash(customerPassword, 10);
  console.log('CUSTOMER USER CREDENTIALS');
  console.log('========================================');
  console.log('Email: customer@exemple.com');
  console.log('Password: customer123');
  console.log('Bcrypt Hash:', customerHash);
  console.log('========================================\n');
  
  // Generate SQL
  console.log('SQL TO RUN IN RAILWAY:');
  console.log('========================================\n');
  console.log(`-- Create admin user`);
  console.log(`INSERT INTO users (id, email, password, role, full_name, created_at)`);
  console.log(`VALUES (`);
  console.log(`  UUID(),`);
  console.log(`  'admin@exemple.com',`);
  console.log(`  '${hash}',`);
  console.log(`  'admin',`);
  console.log(`  'Administrator',`);
  console.log(`  NOW()`);
  console.log(`) ON DUPLICATE KEY UPDATE email=email;`);
  console.log('');
  console.log(`-- Create customer user`);
  console.log(`INSERT INTO users (id, email, password, role, full_name, created_at)`);
  console.log(`VALUES (`);
  console.log(`  UUID(),`);
  console.log(`  'customer@exemple.com',`);
  console.log(`  '${customerHash}',`);
  console.log(`  'customer',`);
  console.log(`  'Test Customer',`);
  console.log(`  NOW()`);
  console.log(`) ON DUPLICATE KEY UPDATE email=email;`);
  console.log('\n========================================\n');
}

generateHash();
