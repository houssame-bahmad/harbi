import { User, Product, Category, Order, OrderStatus, PaymentStatus, UserRole, SaleBanner } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'https://web-production-5b48e.up.railway.app/api';

// Log API configuration on load
console.log('🔧 API CONFIGURATION:');
console.log('   API_URL:', API_URL);
console.log('   VITE_API_URL env:', import.meta.env.VITE_API_URL || 'NOT SET');
console.log('');

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Set auth token
const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

// Remove auth token
const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

// API request helper
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const fullUrl = `${API_URL}${endpoint}`;
  
  console.log(`🌐 API REQUEST: ${options.method || 'GET'} ${fullUrl}`);
  if (token) {
    console.log('   🔑 Auth token:', '***' + token.slice(-10));
  } else {
    console.log('   ⚠️  No auth token');
  }
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    console.log(`   📡 Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      console.log('   ❌ Request failed:', error.error);
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('   ✅ Request successful');
    return data;
  } catch (error: any) {
    console.error('   ❌ Network error:', error.message);
    throw error;
  }
}

// Delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    console.log('🔐 LOGIN attempt for:', email);
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    console.log('   ✅ Login successful, saving token');
    setAuthToken(data.token);
    return data;
  },

  register: async (email: string, password: string, fullName: string, phoneNumber: string): Promise<{ token: string; user: User }> => {
    console.log('📝 REGISTER attempt for:', email);
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, phoneNumber }),
    });
    console.log('   ✅ Registration successful, saving token');
    setAuthToken(data.token);
    return data;
  },

  logout: async (): Promise<void> => {
    console.log('👋 LOGOUT - removing token');
    removeAuthToken();
  },

  // Products
  getAllProducts: async (): Promise<Product[]> => {
    console.log('📦 FETCHING all products');
    return apiRequest('/products');
  },

  getProductById: async (id: number): Promise<Product> => {
    return apiRequest(`/products/${id}`);
  },

  createProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    return apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  updateProduct: async (id: number, product: Partial<Product>): Promise<Product> => {
    return apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },

  deleteProduct: async (id: number): Promise<void> => {
    return apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Orders
  createOrder: async (orderData: { items: any[]; deliveryAddress: string; paymentMethod: string; totalAmount: number }): Promise<Order> => {
    return apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  getOrdersByUserId: async (userId: number): Promise<Order[]> => {
    return apiRequest('/orders/my-orders');
  },

  getAllOrders: async (): Promise<Order[]> => {
    return apiRequest('/orders/all');
  },

  getDeliveryOrders: async (): Promise<Order[]> => {
    return apiRequest('/orders/delivery');
  },

  updateOrderStatus: async (orderId: number, status: OrderStatus): Promise<Order> => {
    return apiRequest(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  updatePaymentStatus: async (orderId: number, paymentStatus: PaymentStatus): Promise<Order> => {
    return apiRequest(`/orders/${orderId}/payment`, {
      method: 'PATCH',
      body: JSON.stringify({ paymentStatus }),
    });
  },

  assignDeliveryPerson: async (orderId: number, deliveryPersonId: number): Promise<Order> => {
    return apiRequest(`/orders/${orderId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ deliveryPersonId }),
    });
  },

  // Users
  getAllUsers: async (): Promise<User[]> => {
    return apiRequest('/users');
  },

  getDeliveryPersons: async (): Promise<User[]> => {
    return apiRequest('/users/delivery-persons');
  },

  updateUserRole: async (userId: number, role: UserRole): Promise<User> => {
    return apiRequest(`/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },

  // Categories (if needed)
  getCategories: async (): Promise<Category[]> => {
    // For now, return hardcoded categories since they're static
    await delay(300);
    return [
      { id: 1, name: 'Skincare' },
      { id: 2, name: 'Vitamins' },
      { id: 3, name: 'First Aid' },
      { id: 4, name: 'Personal Care' },
    ];
  },

  // Sale Banners
  getAllBanners: async (): Promise<SaleBanner[]> => {
    console.log('🎨 FETCHING all sale banners');
    return apiRequest('/banners');
  },

  getAllBannersAdmin: async (): Promise<SaleBanner[]> => {
    console.log('🎨 FETCHING all sale banners (admin)');
    return apiRequest('/banners/all');
  },

  createBanner: async (banner: Omit<SaleBanner, 'id' | 'createdAt' | 'updatedAt'>): Promise<SaleBanner> => {
    console.log('➕ CREATING new sale banner');
    return apiRequest('/banners', {
      method: 'POST',
      body: JSON.stringify(banner),
    });
  },

  updateBanner: async (id: number, banner: Partial<SaleBanner>): Promise<SaleBanner> => {
    console.log('✏️ UPDATING sale banner:', id);
    return apiRequest(`/banners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(banner),
    });
  },

  deleteBanner: async (id: number): Promise<void> => {
    console.log('🗑️ DELETING sale banner:', id);
    return apiRequest(`/banners/${id}`, {
      method: 'DELETE',
    });
  },

  // Media Upload
  uploadMedia: async (file: File): Promise<string> => {
    console.log('📤 UPLOADING media file:', file.name);
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const dataUrl = reader.result as string;
          
          const response = await apiRequest('/media/upload', {
            method: 'POST',
            body: JSON.stringify({
              dataUrl: dataUrl,
              filename: file.name,
              originalName: file.name
            }),
          });

          console.log('✅ Media uploaded:', response.url);
          resolve(response.url);
        } catch (error: any) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  },
};

export default api;
