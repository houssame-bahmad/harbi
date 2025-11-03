// Check database data
const mysql = require('mysql2/promise');

async function checkData() {
  const connection = await mysql.createConnection({
    host: '212.1.211.51',
    port: 3306,
    user: 'u894306996_harbi',
    password: '9Amer.3lih',
    database: 'u894306996_harbi'
  });

  console.log('📊 Checking database data...\n');

  // Check users
  const [users] = await connection.execute('SELECT id, email, name, role FROM users');
  console.log('👥 Users:', users.length);
  users.forEach(user => {
    console.log(`   - ${user.email} (${user.role})`);
  });
  console.log('');

  // Check products
  const [products] = await connection.execute('SELECT id, name, price, stock_quantity FROM products LIMIT 5');
  console.log('📦 Products:', products.length);
  products.forEach(product => {
    console.log(`   - ${product.name} ($${product.price})`);
  });
  console.log('');

  // Check orders
  const [orders] = await connection.execute('SELECT id, status, total_amount FROM orders LIMIT 5');
  console.log('📋 Orders:', orders.length);
  orders.forEach(order => {
    console.log(`   - Order #${order.id} (${order.status}) - $${order.total_amount}`);
  });
  console.log('');

  await connection.end();
}

checkData().catch(console.error);
