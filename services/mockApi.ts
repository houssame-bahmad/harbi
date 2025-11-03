
import { User, Product, Order, Category, UserRole, OrderStatus, PaymentStatus } from '../types';

// Simple password hashing (for demo - use bcrypt in production)
const hashPassword = (password: string): string => {
  // This is a DEMO hash - use bcrypt or argon2 in production!
  return btoa(password + 'salt');
};

const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

// Helper to get/set from localStorage
const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T,>(key: string, value: T): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key “${key}”:`, error);
  }
};


// --- MOCK DATA INITIALIZATION ---
const initialUsers: User[] = [
  { id: 1, role: UserRole.ADMIN, email: 'admin@example.com', passwordHash: hashPassword('admin123'), fullName: 'Admin User', phoneNumber: '111-111-1111', createdAt: new Date().toISOString() },
  { id: 2, role: UserRole.USER, email: 'user@example.com', passwordHash: hashPassword('user123'), fullName: 'Regular User', phoneNumber: '333-333-3333', createdAt: new Date().toISOString() },
  { id: 3, role: UserRole.DELIVERY, email: 'delivery@example.com', passwordHash: hashPassword('delivery123'), fullName: 'Delivery Person', phoneNumber: '444-444-4444', createdAt: new Date().toISOString() },
];

const initialCategories: Category[] = [
    { id: 1, name: 'Skincare' },
    { id: 2, name: 'Vitamins & Supplements' },
    { id: 3, name: 'First Aid' },
    { id: 4, name: 'Personal Care' },
];

const initialProducts: Product[] = [
  { id: 1, categoryId: 1, hostId: 1, name: 'Hydrating Face Cream', description: 'A rich, nourishing cream for all skin types.', price: 24.99, stockQuantity: 50, imageUrl: 'https://picsum.photos/id/1025/400/400', isActive: true,
    ingredients: ['Aqua', 'Glycerin', 'Shea Butter', 'Niacinamide'],
    specs: [{ key: 'Size', value: '50ml' }, { key: 'Skin Type', value: 'All' }],
    reviews: [
      { id: 1, userName: 'Sofia', rating: 5, comment: 'Very hydrating, my skin feels soft.' },
      { id: 2, userName: 'Marc', rating: 4, comment: 'Nice texture and absorbs well.' }
    ]
  },
  { id: 2, categoryId: 1, hostId: 1, name: 'Vitamin C Serum', description: 'Brightens and evens skin tone.', price: 35.50, stockQuantity: 30, imageUrl: 'https://picsum.photos/id/106/400/400', isActive: true,
    ingredients: ['Ascorbic Acid', 'Hyaluronic Acid', 'Vitamin E'],
    specs: [{ key: 'Size', value: '30ml' }, { key: 'Concentration', value: '15% Vitamin C' }],
    reviews: [
      { id: 3, userName: 'Lina', rating: 5, comment: 'Noticeable brightening after 2 weeks.' }
    ]
  },
  { id: 3, categoryId: 2, hostId: 1, name: 'Multivitamin Gummies', description: 'Daily essential vitamins for adults.', price: 19.99, stockQuantity: 100, imageUrl: 'https://picsum.photos/id/292/400/400', isActive: true,
    ingredients: ['Vitamin A', 'Vitamin C', 'Vitamin D3', 'Zinc'],
    specs: [{ key: 'Count', value: '60 gummies' }, { key: 'Dosage', value: '2 gummies/day' }],
    reviews: [
      { id: 4, userName: 'Ahmed', rating: 4, comment: 'Tastes good and helps my energy.' }
    ]
  },
  { id: 4, categoryId: 3, hostId: 1, name: 'Advanced Band-Aids', description: 'Waterproof and flexible for all minor cuts.', price: 7.25, stockQuantity: 200, imageUrl: 'https://picsum.photos/id/31/400/400', isActive: false,
    specs: [{ key: 'Count', value: '20 pcs' }, { key: 'Material', value: 'Polyurethane' }]
  },
  { id: 5, categoryId: 4, hostId: 1, name: 'Organic Toothpaste', description: 'Fluoride-free with natural mint flavor.', price: 9.99, stockQuantity: 75, imageUrl: 'https://picsum.photos/id/219/400/400', isActive: true,
    ingredients: ['Aloe Vera', 'Baking Soda', 'Peppermint Oil'],
    specs: [{ key: 'Size', value: '100ml' }],
    reviews: [
      { id: 5, userName: 'Nora', rating: 5, comment: 'Nice fresh taste and gentle.' }
    ]
  },
];

const initialOrders: Order[] = [];

// Use localStorage to persist data across reloads
let users = getFromStorage('users', initialUsers);
let products = getFromStorage('products', initialProducts);
let orders = getFromStorage('orders', initialOrders);
const categories = getFromStorage('categories', initialCategories);

// --- API FUNCTIONS ---

// Simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const mockApi = {
  // Auth
  login: async (email: string, password: string): Promise<User | null> => {
    await delay(500);
    const user = users.find(u => u.email === email);
    if (!user) return null;
    if (!verifyPassword(password, user.passwordHash)) return null;
    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = user;
    return user;
  },
  register: async (userData: Omit<User, 'id' | 'role' | 'createdAt' | 'passwordHash'> & { password: string }): Promise<User> => {
    await delay(500);
    if (users.some(u => u.email === userData.email)) {
      throw new Error('User with this email already exists.');
    }
    const newUser: User = {
      id: Math.max(0, ...users.map(u => u.id)) + 1,
      email: userData.email,
      fullName: userData.fullName,
      phoneNumber: userData.phoneNumber,
      passwordHash: hashPassword(userData.password),
      role: UserRole.USER,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveToStorage('users', users);
    return newUser;
  },
  
  // Products
  getProducts: async (): Promise<Product[]> => {
    await delay(300);
    return products.filter(p => p.isActive);
  },
  getAllProducts: async (): Promise<Product[]> => {
    await delay(300);
    return products;
  },
  getProductById: async (id: number): Promise<Product | undefined> => {
    await delay(300);
    return products.find(p => p.id === id);
  },
  updateProduct: async (productData: Product): Promise<Product> => {
    await delay(500);
    products = products.map(p => p.id === productData.id ? productData : p);
    saveToStorage('products', products);
    return productData;
  },
  createProduct: async(productData: Omit<Product, 'id'>): Promise<Product> => {
    await delay(500);
    const newProduct: Product = {
      id: Math.max(0, ...products.map(p => p.id)) + 1,
      ...productData,
    };
    products.push(newProduct);
    saveToStorage('products', products);
    return newProduct;
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    await delay(100);
    return categories;
  },

  // Orders
  placeOrder: async (orderData: Omit<Order, 'id' | 'orderDate' | 'paymentMethod' | 'status' | 'paymentStatus'>): Promise<Order> => {
    await delay(1000);
    // Prevent admins from placing orders (enforce server-side rule)
    const orderingUser = users.find(u => u.id === orderData.userId);
    if (orderingUser && orderingUser.role === UserRole.ADMIN) {
      throw new Error('Admins are not allowed to place orders.');
    }
    const newOrder: Order = {
      id: Math.max(0, ...orders.map(o => o.id)) + 1,
      ...orderData,
      orderDate: new Date().toISOString(),
      paymentMethod: 'Cash on Delivery',
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      items: orderData.items.map(item => ({...item, id: Math.random(), orderId: Math.max(0, ...orders.map(o => o.id)) + 1}))
    };
    // Decrement stock
    newOrder.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
            product.stockQuantity -= item.quantity;
        }
    });
    orders.push(newOrder);
    saveToStorage('orders', orders);
    saveToStorage('products', products);
    return newOrder;
  },
  getOrdersByUserId: async (userId: number): Promise<Order[]> => {
    await delay(500);
    return orders.filter(o => o.userId === userId).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  },
  getAllOrders: async (): Promise<Order[]> => {
    await delay(500);
    return [...orders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  },
  updateOrderStatus: async (orderId: number, status: OrderStatus): Promise<Order> => {
    await delay(500);
    const order = orders.find(o => o.id === orderId);
    if (!order) throw new Error('Order not found');
    
    // If order is being cancelled, return items to stock
    if (status === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
      order.items.forEach(orderItem => {
        const product = products.find(p => p.id === orderItem.productId);
        if (product) {
          product.stockQuantity += orderItem.quantity;
        }
      });
      saveToStorage('products', products);
    }
    
    order.status = status;
    saveToStorage('orders', orders);
    return order;
  },
  assignDeliveryPerson: async (orderId: number, deliveryPersonId: number): Promise<Order> => {
    await delay(500);
    const order = orders.find(o => o.id === orderId);
    if (!order) throw new Error('Order not found');
    order.deliveryPersonId = deliveryPersonId;
    order.status = OrderStatus.OUT_FOR_DELIVERY;
    saveToStorage('orders', orders);
    return order;
  },
  updatePaymentStatus: async (orderId: number, paymentStatus: PaymentStatus): Promise<Order> => {
    await delay(500);
    const order = orders.find(o => o.id === orderId);
    if (!order) throw new Error('Order not found');
    order.paymentStatus = paymentStatus;
    saveToStorage('orders', orders);
    return order;
  },
  getDeliveryOrders: async (deliveryPersonId: number): Promise<Order[]> => {
    await delay(500);
    return orders.filter(o => o.deliveryPersonId === deliveryPersonId).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  },
  
  // Admin
  getAllUsers: async (): Promise<User[]> => {
    await delay(500);
    return users;
  },
  getUserById: async (userId: number): Promise<User | undefined> => {
    await delay(300);
    return users.find(u => u.id === userId);
  },
  updateUserRole: async (userId: number, role: UserRole): Promise<User> => {
    await delay(500);
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    user.role = role;
    saveToStorage('users', users);
    return user;
  },
};
