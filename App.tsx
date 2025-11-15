

import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { api } from './services/api';
import { User, Product, CartItem, UserRole, Order, OrderStatus, Category, PaymentStatus, SaleBanner } from './types';
import { Button, Card, Icons, Input, Modal } from './components/ui';

// --- CURRENCY FORMATTER ---
const formatPrice = (price: number): string => {
  return `${price.toFixed(2)} DH`;
};

// --- CONTEXTS ---
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: { email: string; fullName: string; phoneNumber: string; password: string }) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const response = await api.login(email, password);
    if (response && response.user) {
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const register = async (userData: { email: string; fullName: string; phoneNumber: string; password: string }) => {
    setIsLoading(true);
    try {
      const response = await api.register(userData.email, userData.password, userData.fullName, userData.phoneNumber);
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | null>(null);
const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};

const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prevCart => prevCart.map(item =>
        item.id === productId ? { ...item, quantity: quantity } : item
      ));
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};


// --- LAYOUT & NAVIGATION ---

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-center py-4 gap-4">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 w-full lg:w-auto justify-between lg:justify-start">
            <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-2 hover:opacity-80 transition-opacity">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
                <path d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2Z" fill="currentColor" opacity="0.2"/>
                <path d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="flex flex-col">
                <span className="gradient-text text-xl leading-tight">Parapharmacie</span>
                <span className="hidden sm:block text-[10px] text-gray-500 font-normal -mt-1">Professional Healthcare</span>
              </div>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-3 w-full lg:w-2/5 xl:w-1/3">
            <form onSubmit={(e) => { e.preventDefault(); navigate(`/?q=${encodeURIComponent(query)}`); }} className="flex flex-1">
              <div className="relative flex-1">
                <input 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)} 
                  placeholder="Search products, vitamins..." 
                  className="w-full px-4 py-2.5 rounded-l-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" 
                />
              </div>
              <Button type="submit" size="md" className="rounded-l-none rounded-r-lg bg-primary hover:bg-primary-focus px-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Button>
            </form>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2 lg:space-x-4 w-full lg:w-auto justify-center lg:justify-end">
            {user ? (
              <>
                {/* User Greeting */}
                <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/10">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    {user.fullName && user.fullName.trim() ? user.fullName.split(' ')[0] : (user.email ? user.email.split('@')[0] : 'User')}
                  </span>
                </div>
                
                {/* Role-based Navigation */}
                {user.role === UserRole.ADMIN && (
                  <>
                    <Link to="/admin" className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="hidden lg:inline">Admin</span>
                    </Link>
                    <Link to="/products" className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span className="hidden lg:inline">Products</span>
                    </Link>
                    <Link to="/admin/banners" className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      <span className="hidden lg:inline">Banners</span>
                    </Link>
                  </>
                )}
                
                {user.role === UserRole.DELIVERY && (
                  <Link to="/delivery" className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                    <span className="hidden lg:inline">Deliveries</span>
                  </Link>
                )}
                
                {user.role === UserRole.USER && (
                  <Link to="/orders" className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="hidden lg:inline">Orders</span>
                  </Link>
                )}
                
                {/* Cart Button */}
                <button 
                  onClick={() => navigate('/cart')} 
                  className="relative flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </button>
                
                {/* Logout Button */}
                <button 
                  onClick={logout} 
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                  title="Logout"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </>
            ) : (
              <Button onClick={() => navigate('/login')} className="px-6">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <Navbar />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <Outlet />
      </main>
      <footer className="bg-gradient-to-r from-neutral to-neutral-focus text-white py-12 border-t-4 border-primary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2Z" fill="currentColor" opacity="0.3"/>
                  <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-xl font-bold">Parapharmacie</span>
              </div>
              <p className="text-sm text-gray-400">Your trusted source for healthcare and wellness products.</p>
            </div>
            
            {/* Quick Links */}
            <div className="footer-links">
              <h3 className="font-semibold mb-3 text-accent">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-accent transition-colors">Home</Link></li>
                <li><Link to="/cart" className="hover:text-accent transition-colors">Shopping Cart</Link></li>
                <li><Link to="/orders" className="hover:text-accent transition-colors">My Orders</Link></li>
              </ul>
            </div>
            
            {/* Categories */}
            <div className="footer-links">
              <h3 className="font-semibold mb-3 text-accent">Categories</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/?category=Skincare" className="hover:text-accent transition-colors">Skincare</a></li>
                <li><a href="/?category=Vitamins" className="hover:text-accent transition-colors">Vitamins & Supplements</a></li>
                <li><a href="/?category=First Aid" className="hover:text-accent transition-colors">First Aid</a></li>
                <li><a href="/?category=Personal Care" className="hover:text-accent transition-colors">Personal Care</a></li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h3 className="font-semibold mb-3 text-accent">Contact Us</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 8L10.89 13.26C11.21 13.47 11.63 13.47 11.95 13.26L20 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  info@parapharmacie.com
                </li>
                <li className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 5C3 3.89543 3.89543 3 5 3H8.27924C8.70967 3 9.09181 3.27543 9.22792 3.68377L10.7257 8.17721C10.8831 8.64932 10.6694 9.16531 10.2243 9.38787L7.96701 10.5165C9.06925 12.9612 11.0388 14.9308 13.4835 16.033L14.6121 13.7757C14.8347 13.3306 15.3507 13.1169 15.8228 13.2743L20.3162 14.7721C20.7246 14.9082 21 15.2903 21 15.7208V19C21 20.1046 20.1046 21 19 21H18C9.71573 21 3 14.2843 3 6V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  +1 (555) 123-4567
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-6 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Parapharmacie Store. All rights reserved. | Professional Healthcare Solutions</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- PROTECTED ROUTE ---
interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && !user) {
        navigate('/login', { state: { from: location }, replace: true });
    } else if (!isLoading && user && !allowedRoles.includes(user.role)) {
        navigate('/', { replace: true }); // Redirect to home if role not allowed
    }
  }, [user, isLoading, allowedRoles, location, navigate]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div></div>;
  }

  return user && allowedRoles.includes(user.role) ? <Outlet /> : null;
};

// --- PAGE COMPONENTS ---

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (isModalOpen) {
      api.getCategories().then(cats => {
        if (!mounted) return;
        const cat = cats.find(c => c.id === product.categoryId);
        setCategoryName(cat ? cat.name : null);
      }).catch(() => {
        if (mounted) setCategoryName(null);
      });
    }
    return () => { mounted = false; };
  }, [isModalOpen, product.categoryId]);

  const handleAddToCart = () => {
      if (!user) {
          navigate('/login');
      } else {
          addToCart(product);
      }
  };

  return (
    <>
      <Card className="flex flex-col h-full product-card group">
        <Link to={`/product/${product.id}`} className="block overflow-hidden">
          <div className="aspect-square overflow-hidden bg-gray-50">
            <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src={product.imageUrl} alt={product.name} />
          </div>
        </Link>
        <div className="p-5 flex flex-col flex-grow">
          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
          </div>
          
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-primary">{formatPrice(product.price)}</span>
              </div>
              <div className="text-xs text-gray-500">
                {product.stockQuantity > 0 ? (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    In Stock
                  </span>
                ) : (
                  <span className="text-red-500">Out of Stock</span>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => setIsModalOpen(true)} variant="ghost" size="sm" className="flex-1">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Details
              </Button>
              <Button onClick={handleAddToCart} variant='secondary' size='sm' className="flex-1" disabled={product.stockQuantity <= 0}>
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={product.name}>
        <div className="md:flex md:gap-8">
          <div className="md:w-1/2">
            <img src={product.imageUrl} alt={product.name} className="w-full rounded-xl object-cover mb-4 md:mb-0 shadow-lg border border-gray-100" />
          </div>
          <div className="flex-1">
            <div className="mb-4">
              <h3 className="text-3xl font-bold mb-3 gradient-text">{product.name}</h3>
              <p className="text-gray-700 text-base leading-relaxed">{product.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-base-100 rounded-lg p-3 border border-base-300">
                <p className="text-xs text-gray-500 mb-1">Category</p>
                <p className="font-semibold text-sm">{categoryName ?? `#${product.categoryId}`}</p>
              </div>
              <div className="bg-base-100 rounded-lg p-3 border border-base-300">
                <p className="text-xs text-gray-500 mb-1">Stock</p>
                <p className="font-semibold text-sm">{product.stockQuantity > 0 ? `${product.stockQuantity} available` : 'Out of stock'}</p>
              </div>
            </div>

            {product.ingredients && product.ingredients.length > 0 && (
              <div className="mb-4 bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Ingredients
                </h4>
                <div className="flex flex-wrap gap-2">
                  {product.ingredients.map((ing, idx) => (
                    <span key={idx} className="badge badge-primary text-xs">{ing}</span>
                  ))}
                </div>
              </div>
            )}

            {product.specs && product.specs.length > 0 && (
              <div className="mb-4">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Specifications
                </h4>
                <dl className="text-sm space-y-2">
                  {product.specs.map((s, idx) => (
                    <div key={idx} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                      <dt className="font-semibold text-gray-700">{s.key}</dt>
                      <dd className="text-gray-900">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {product.reviews && product.reviews.length > 0 && (
              <div className="mt-4">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Customer Reviews
                </h4>
                <div className="space-y-3">
                  {product.reviews.slice(0,3).map(r => (
                    <div key={r.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-gray-900">{r.userName}</div>
                        <div className="text-sm text-yellow-500 flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-current' : 'fill-gray-300'}`} viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 italic">"{r.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <div className="text-3xl font-extrabold gradient-text">{formatPrice(product.price)}</div>
              <div className="flex items-center gap-3">
                <Button onClick={() => { handleAddToCart(); setIsModalOpen(false); }} disabled={product.stockQuantity <= 0} className="px-6">
                  Add to Cart
                </Button>
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};


const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [saleBanners, setSaleBanners] = useState<SaleBanner[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    Promise.all([api.getAllProducts(), api.getCategories(), api.getAllBanners()]).then(([prods, cats, banners]) => {
      if (!mounted) return;
      setProducts(prods);
      setCategories(cats);
      setSaleBanners(banners);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get('q') || '');
    setSelectedCategory(params.get('category') ? parseInt(params.get('category') as string) : null);
  }, [location.search]);

  // Carousel auto-rotation effect
  useEffect(() => {
    if (saleBanners.length === 0 || isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % saleBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [saleBanners.length, isHovered]);

  if (loading) return <p>Loading products...</p>;

  const filtered = products.filter(p => {
    const matchesQuery = searchQuery ? (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase())) : true;
    const matchesCategory = selectedCategory ? p.categoryId === selectedCategory : true;
    return matchesQuery && matchesCategory;
  });

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + saleBanners.length) % saleBanners.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % saleBanners.length);
  };

  return (
    <div className="space-y-8">
      {/* Bootstrap-style Carousel for Sale Banners */}
      {saleBanners.length > 0 && (
        <div 
          className="relative w-full overflow-hidden rounded-lg shadow-xl"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Carousel Inner */}
          <div className="relative h-[340px] md:h-[400px] lg:h-[500px]">
            {saleBanners.map((banner, index) => (
              <div
                key={banner.id}
                className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${
                  index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <a href={banner.buttonLink !== '#' ? banner.buttonLink : undefined} className="block w-full h-full">
                  <div className={`relative w-full h-full bg-gradient-to-br ${banner.backgroundColor}`}>
                    {banner.imageUrl && (
                      <img 
                        src={banner.imageUrl} 
                        alt={banner.title} 
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
                    
                    {/* Banner Content - Optional overlay text */}
                    {(banner.title || banner.subtitle || banner.discountText) && (
                      <div className="absolute inset-0 flex items-center justify-center text-center text-white p-8">
                        <div className="max-w-2xl">
                          {banner.subtitle && (
                            <div className="inline-block mb-3 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold uppercase tracking-wider">
                              {banner.subtitle}
                            </div>
                          )}
                          {banner.title && (
                            <h2 className="text-3xl md:text-5xl font-bold mb-3 drop-shadow-lg">{banner.title}</h2>
                          )}
                          {banner.discountText && (
                            <p className="text-5xl md:text-7xl font-black mb-3 text-yellow-400 drop-shadow-lg">{banner.discountText}</p>
                          )}
                          {banner.description && (
                            <p className="text-lg md:text-xl mb-4 opacity-90 drop-shadow-md">{banner.description}</p>
                          )}
                          {banner.buttonText && (
                            <button className="mt-4 px-8 py-3 bg-white text-gray-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors shadow-lg transform hover:scale-105">
                              {banner.buttonText}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </a>
              </div>
            ))}
          </div>

          {/* Carousel Indicators */}
          {saleBanners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
              {saleBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-white w-8' 
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Previous Button */}
          {saleBanners.length > 1 && (
            <button
              onClick={goToPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
              aria-label="Previous slide"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next Button */}
          {saleBanners.length > 1 && (
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
              aria-label="Next slide"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Browse by Category</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setSelectedCategory(null)} 
            className={`category-pill ${selectedCategory === null ? 'active' : ''}`}
          >
            All Products
          </button>
          {categories.map(c => (
            <button 
              key={c.id} 
              onClick={() => setSelectedCategory(c.id)} 
              className={`category-pill whitespace-nowrap ${selectedCategory === c.id ? 'active' : ''}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            {selectedCategory 
              ? categories.find(c => c.id === selectedCategory)?.name || 'Products'
              : 'All Products'}
          </h2>
          <div className="text-sm text-gray-500">
            {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
          </div>
        </div>
        
        {filtered.length === 0 ? (
          <div className="empty-state py-16">
            <svg className="mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xl font-semibold text-gray-400 mb-2">No products found</p>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (id) {
      api.getProductById(parseInt(id)).then(data => {
        setProduct(data || null);
        setLoading(false);
      });
    }
  }, [id]);

  const handleAddToCart = () => {
      if (!user) {
          navigate('/login');
      } else {
          if (product) addToCart(product);
      }
  };

  if (loading) return <p>Loading product details...</p>;
  if (!product) return <p>Product not found.</p>;

  return (
     <Card className="md:flex">
      <img className="h-64 w-full object-cover md:h-auto md:w-1/3 lg:w-1/2" src={product.imageUrl} alt={product.name} />
      <div className="p-8 flex flex-col justify-between">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="mt-4 text-gray-600">{product.description}</p>
            <p className="mt-4 text-sm text-gray-500">Stock: {product.stockQuantity > 0 ? `${product.stockQuantity} available` : 'Out of stock'}</p>
        </div>
        <div className="mt-8 flex items-baseline">
            <span className="text-4xl font-extrabold text-primary">{formatPrice(product.price)}</span>
        </div>
        <Button onClick={handleAddToCart} disabled={product.stockQuantity <= 0} className="mt-6 w-full text-lg">
          {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </div>
    </Card>
  );
};

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);
    if (success) {
      navigate(from, { replace: true });
    } else {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-center text-neutral mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Email" id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input label="Password" id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full" isLoading={isLoading}>Login</Button>
          <p className="text-sm text-center">
            Don't have an account? <Link to="/register" className="font-medium text-primary hover:underline">Register here</Link>
          </p>
        </form>
      </Card>
    </div>
  );
};

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const success = await register(formData);
    setIsLoading(false);
    if (success) {
      navigate('/'); // Redirect to home on successful registration
    } else {
      setError('Registration failed. This email may already be in use.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-center text-neutral mb-6">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Full Name" id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleChange} required />
          <Input label="Email" id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
          <Input label="Phone Number" id="phoneNumber" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} required />
          <Input label="Password" id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />

          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full" isLoading={isLoading}>Register</Button>
          <p className="text-sm text-center">
            Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Login here</Link>
          </p>
        </form>
      </Card>
    </div>
  );
};


const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-neutral">Your Cart</h1>
      {cart.length === 0 ? (
        <div className="max-w-lg mx-auto">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Not showing any things</h2>
            <p className="text-gray-500 mb-4">Your cart is empty.</p>
            <Button onClick={() => navigate('/')} variant="primary">Continue Shopping</Button>
          </Card>
        </div>
      ) : (
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            <ul className="space-y-4">
              {cart.map(item => (
                <li key={item.id} className="flex items-center bg-white p-4 rounded-lg shadow">
                  <img src={item.imageUrl} alt={item.name} className="h-20 w-20 object-cover rounded"/>
                  <div className="ml-4 flex-grow">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-500">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="number"
                      value={item.quantity}
                      onChange={e => updateQuantity(item.id, parseInt(e.target.value))}
                      className="w-16 text-center border rounded-md"
                      min="1"
                      max={item.stockQuantity}
                    />
                  </div>
                  <p className="w-24 text-right font-semibold">{formatPrice(item.price * item.quantity)}</p>
                  <button onClick={() => removeFromCart(item.id)} className="ml-4 text-red-500 hover:text-red-700">&times;</button>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8 lg:mt-0">
              <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="flex justify-between mb-2">
                <span>Subtotal ({cartCount} items)</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-4 mt-4">
                <span>Total</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              {user?.role === UserRole.USER ? (
                <Button onClick={() => navigate('/checkout')} className="w-full mt-6">Proceed to Checkout</Button>
              ) : (
                <div className="mt-6">
                  <Button className="w-full mt-6" disabled>Proceed to Checkout</Button>
                  <p className="text-sm text-gray-500 mt-2">Admins cannot place orders. Switch to a customer account to checkout.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

const CheckoutPage: React.FC = () => {
    const { user } = useAuth();
    const { cart, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState(user?.phoneNumber || '');
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState('');

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
    setError('');
    if (!user || cart.length === 0) return;

    // Prevent admins from placing orders (UI-level guard)
    if (user.role === UserRole.ADMIN) {
      setError('Admins are not allowed to place orders.');
      return;
    }

    setIsPlacingOrder(true);
        const orderData = {
            userId: user.id,
            totalAmount: cartTotal,
            deliveryAddress: address,
            items: cart.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                priceAtPurchase: item.price,
            }))
        };
    try {
      // @ts-ignore
      await api.placeOrder(orderData);
    } catch (err: any) {
      setIsPlacingOrder(false);
      setError(err?.message || 'Failed to place order.');
      return;
    }
        setIsPlacingOrder(false);
        clearCart();
        navigate('/orders');
    };

  if (cart.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Your cart is empty.</h1>
        <Button onClick={() => navigate('/')}>Continue Shopping</Button>
      </div>
    );
  }
    
    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-neutral">Checkout</h1>
            <Card className="p-6">
        <form onSubmit={handlePlaceOrder} className="space-y-4">
                    <h2 className="text-xl font-semibold">Shipping Information</h2>
          {error && <p className="text-sm text-red-500">{error}</p>}
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Delivery Address</label>
                        <textarea id="address" value={address} onChange={e => setAddress(e.target.value)} required rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"></textarea>
                    </div>
                     <Input label="Phone Number" id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required />

                    <h2 className="text-xl font-semibold pt-4">Payment Method</h2>
                    <p className="p-4 bg-blue-50 border border-blue-200 rounded-md">Payment will be handled as <strong>Cash on Delivery</strong>.</p>
                    
                    <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between font-bold text-xl">
                            <span>Total to Pay:</span>
                            <span>{formatPrice(cartTotal)}</span>
                        </div>
                        <Button type="submit" className="w-full mt-6 text-lg" isLoading={isPlacingOrder}>Place Order</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

const OrderHistoryPage: React.FC = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            api.getOrdersByUserId(user.id).then(data => {
                setOrders(data);
                setLoading(false);
            });
        }
    }, [user]);

    if (loading) return <p>Loading order history...</p>;
    
    const getStatusColor = (status: OrderStatus) => {
        switch(status) {
            case OrderStatus.DELIVERED: return 'bg-green-100 text-green-800';
            case OrderStatus.CONFIRMED: return 'bg-blue-100 text-blue-800';
            case OrderStatus.OUT_FOR_DELIVERY: return 'bg-purple-100 text-purple-800';
            case OrderStatus.CANCELLED: return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    const getPaymentColor = (status: PaymentStatus) => {
        switch(status) {
            case PaymentStatus.PAID: return 'bg-green-100 text-green-800';
            case PaymentStatus.REFUNDED: return 'bg-orange-100 text-orange-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };
    
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-neutral">My Orders</h1>
            {orders.length === 0 ? (
                <p>You have not placed any orders yet.</p>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <Card key={order.id} className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="font-bold text-lg">Order #{order.id}</h2>
                                    <p className="text-sm text-gray-500">Placed on: {new Date(order.orderDate).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right space-y-2">
                                    <div>
                                        <span className={`text-sm font-medium mr-2 px-2.5 py-0.5 rounded ${getStatusColor(order.status)}`}>{order.status}</span>
                                    </div>
                                    <div>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${getPaymentColor(order.paymentStatus)}`}>
                                            Payment: {order.paymentStatus}
                                        </span>
                                    </div>
                                    <p className="font-bold text-lg">{formatPrice(order.totalAmount)}</p>
                                </div>
                            </div>
                            <div className="mt-4 border-t pt-4">
                                <h3 className="font-semibold">Items:</h3>
                                <p className="text-sm text-gray-600">Total {order.items.reduce((acc, item) => acc + item.quantity, 0)} items.</p>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- DELIVERY DASHBOARD ---
const DeliveryDashboard: React.FC = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);

    const loadOrders = async () => {
        if (user) {
            const deliveryOrders = await api.getDeliveryOrders(user.id);
            setOrders(deliveryOrders);
            
            // Load user details for each order
            const userIds = [...new Set(deliveryOrders.map(o => o.userId))];
            const usersData = await Promise.all(userIds.map(id => api.getUserById(id)));
            setUsers(usersData.filter(Boolean) as User[]);
            
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, [user]);

    const handleMarkDelivered = async (orderId: number) => {
        await api.updateOrderStatus(orderId, OrderStatus.DELIVERED);
        loadOrders();
    };

    const handleUpdatePayment = async (orderId: number, status: PaymentStatus) => {
        await api.updatePaymentStatus(orderId, status);
        loadOrders();
    };

    if (loading) return <p>Loading deliveries...</p>;

    const getStatusColor = (status: OrderStatus) => {
        switch(status) {
            case OrderStatus.DELIVERED: return 'bg-green-100 text-green-800';
            case OrderStatus.OUT_FOR_DELIVERY: return 'bg-blue-100 text-blue-800';
            case OrderStatus.CONFIRMED: return 'bg-yellow-100 text-yellow-800';
            case OrderStatus.CANCELLED: return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentColor = (status: PaymentStatus) => {
        switch(status) {
            case PaymentStatus.PAID: return 'bg-green-100 text-green-800';
            case PaymentStatus.REFUNDED: return 'bg-orange-100 text-orange-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-neutral">My Deliveries</h1>
            {orders.length === 0 ? (
                <Card className="p-6">
                    <p className="text-gray-600">No deliveries assigned to you yet.</p>
                </Card>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => {
                        const customer = users.find(u => u.id === order.userId);
                        return (
                            <Card key={order.id} className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="font-bold text-lg">Order #{order.id}</h2>
                                        <p className="text-sm text-gray-500">Date: {new Date(order.orderDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <div>
                                            <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div>
                                            <span className={`text-xs font-medium px-2 py-1 rounded ${getPaymentColor(order.paymentStatus)}`}>
                                                {order.paymentStatus}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-4 space-y-3">
                                    <div>
                                        <h3 className="font-semibold text-sm text-gray-700">Customer Details:</h3>
                                        {customer ? (
                                            <div className="text-sm text-gray-600 mt-1">
                                                <p><strong>Name:</strong> {customer.fullName}</p>
                                                <p><strong>Phone:</strong> {customer.phoneNumber}</p>
                                                <p><strong>Email:</strong> {customer.email}</p>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500">Loading customer info...</p>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-sm text-gray-700">Delivery Address:</h3>
                                        <p className="text-sm text-gray-600">{order.shippingAddress}</p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-sm text-gray-700">Order Items:</h3>
                                        <p className="text-sm text-gray-600">
                                            {order.items.length} items - Total: {formatPrice(order.totalAmount)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                                    {order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED && (
                                        <Button 
                                            onClick={() => handleMarkDelivered(order.id)} 
                                            variant="primary"
                                            className="text-sm"
                                        >
                                            Mark as Delivered
                                        </Button>
                                    )}
                                    
                                    {order.paymentStatus === PaymentStatus.PENDING && (
                                        <>
                                            <Button 
                                                onClick={() => handleUpdatePayment(order.id, PaymentStatus.PAID)} 
                                                variant="outline"
                                                className="text-sm"
                                            >
                                                Mark Paid
                                            </Button>
                                            <Button 
                                                onClick={() => handleUpdatePayment(order.id, PaymentStatus.REFUNDED)} 
                                                variant="outline"
                                                className="text-sm"
                                            >
                                                Mark Refunded
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};


const ProductForm: React.FC<{ product?: Product; onSave: (product: Product) => void; onCancel: () => void }> = ({ product, onSave, onCancel }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState<Omit<Product, 'id'>>({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || 0,
        stockQuantity: product?.stockQuantity || 0,
        imageUrl: product?.imageUrl || 'https://picsum.photos/400/400',
        categoryId: product?.categoryId || 1,
        hostId: product?.hostId || user?.id || 0,
        isActive: product?.isActive ?? true,
        ingredients: product?.ingredients || [],
        specs: product?.specs || [],
        reviews: product?.reviews || [],
    });
    const [categories, setCategories] = useState<Category[]>([]);
    const [imagePreview, setImagePreview] = useState<string>(product?.imageUrl || 'https://picsum.photos/400/400');
    const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');

    useEffect(() => {
        api.getCategories().then(setCategories);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        let processedValue: string | number | boolean = value;

        if (type === 'number') {
            processedValue = parseFloat(value);
        } else if (name === 'isActive') {
            processedValue = (e.target as HTMLSelectElement).value === 'true';
        }

        setFormData(prev => ({ ...prev, [name]: processedValue }));
        
        // Update image preview when URL changes
        if (name === 'imageUrl') {
            setImagePreview(value);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please upload an image file');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setFormData(prev => ({ ...prev, imageUrl: base64String }));
                setImagePreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (product) { // Editing
            await api.updateProduct({ ...product, ...formData });
            onSave({ ...product, ...formData });
        } else { // Creating
            const newProduct = await api.createProduct(formData);
            onSave(newProduct);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Product Name" name="name" value={formData.name} onChange={handleChange} required />
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" required></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Input label="Price (DH)" name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required />
                <Input label="Stock Quantity" name="stockQuantity" type="number" value={formData.stockQuantity} onChange={handleChange} required />
            </div>
            <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">Category</label>
                <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            
            {/* Image Upload Section */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                
                {/* Image Preview */}
                {imagePreview && (
                    <div className="mb-4">
                        <img 
                            src={imagePreview} 
                            alt="Product preview" 
                            className="w-40 h-40 object-cover rounded-lg border border-gray-300"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Invalid+Image';
                            }}
                        />
                    </div>
                )}
                
                {/* Upload Method Toggle */}
                <div className="flex gap-4 mb-3">
                    <label className="flex items-center">
                        <input 
                            type="radio" 
                            checked={uploadMethod === 'url'} 
                            onChange={() => setUploadMethod('url')}
                            className="mr-2"
                        />
                        <span className="text-sm">Image URL</span>
                    </label>
                    <label className="flex items-center">
                        <input 
                            type="radio" 
                            checked={uploadMethod === 'file'} 
                            onChange={() => setUploadMethod('file')}
                            className="mr-2"
                        />
                        <span className="text-sm">Upload File</span>
                    </label>
                </div>
                
                {uploadMethod === 'url' ? (
                    <Input 
                        label="Image URL" 
                        name="imageUrl" 
                        type="url"
                        value={formData.imageUrl} 
                        onChange={handleChange} 
                        placeholder="https://example.com/image.jpg"
                    />
                ) : (
                    <div>
                        <label className="block">
                            <span className="sr-only">Choose image file</span>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-blue-600 cursor-pointer"
                            />
                        </label>
                        <p className="text-xs text-gray-500 mt-2">Max size: 5MB. Formats: JPG, PNG, GIF, WebP</p>
                    </div>
                )}
            </div>
            
             <div>
                <label htmlFor="isActive" className="block text-sm font-medium text-gray-700">Status</label>
                <select name="isActive" value={String(formData.isActive)} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Product</Button>
            </div>
        </form>
    );
};

const ProductManagementPage: React.FC = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

    const loadProducts = useCallback(async () => {
        setLoading(true);
        const allProducts = await api.getAllProducts();
        if (user) {
            const userProducts = user.role === UserRole.ADMIN ? allProducts : allProducts.filter(p => p.hostId === user.id);
            setProducts(userProducts);
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);
    
    const handleSave = () => {
        setIsModalOpen(false);
        setEditingProduct(undefined);
        loadProducts();
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingProduct(undefined);
        setIsModalOpen(true);
    };

    if (loading) return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 border border-primary/20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold gradient-text mb-2">Product Management</h1>
                        <p className="text-gray-600">Manage your parapharmacie inventory and products</p>
                    </div>
                    <Button onClick={handleAddNew} size="lg" className="shadow-lg">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Product
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="stat-label">Total Products</p>
                            <p className="stat-value">{products.length}</p>
                        </div>
                        <div className="bg-primary/10 p-3 rounded-lg">
                            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="stat-label">Active Products</p>
                            <p className="stat-value text-green-600">{products.filter(p => p.isActive).length}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="stat-label">Inactive Products</p>
                            <p className="stat-value text-red-600">{products.filter(p => !p.isActive).length}</p>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg">
                            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProduct ? "Edit Product" : "Add New Product"}>
                <ProductForm product={editingProduct} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
            </Modal>

            {/* Products Table */}
            <div className="bg-white shadow-soft rounded-xl overflow-hidden border border-gray-200">
                <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">All Products</h2>
                    <p className="text-sm text-gray-600 mt-1">Click edit to modify product details</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b-2 border-gray-200">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Product</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Price</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Stock</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {products.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                                            <div>
                                                <div className="font-semibold text-gray-900">{p.name}</div>
                                                <div className="text-xs text-gray-500 line-clamp-1">{p.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-primary text-lg">{formatPrice(p.price)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-semibold ${p.stockQuantity > 10 ? 'text-green-600' : p.stockQuantity > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                {p.stockQuantity}
                                            </span>
                                            <span className="text-xs text-gray-500">units</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {p.isActive ? (
                                            <span className="badge badge-success">Active</span>
                                        ) : (
                                            <span className="badge badge-danger">Inactive</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(p)} className="hover:bg-primary hover:text-white">
                                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Edit
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const AdminUserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const loadUsers = useCallback(() => {
        api.getAllUsers().then(data => {
            setUsers(data);
            setLoading(false);
        });
    }, []);

    useEffect(loadUsers, [loadUsers]);
    
    const handleRoleChange = async (userId: number, newRole: UserRole) => {
        await api.updateUserRole(userId, newRole);
        loadUsers();
    };

    if (loading) return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-2xl p-6 border border-accent/20">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-3 rounded-xl shadow-md">
                        <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold gradient-text">User Management</h2>
                        <p className="text-gray-600 mt-1">Manage user roles and permissions</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="stat-label">Total Users</p>
                            <p className="stat-value">{users.length}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="stat-label">Admins</p>
                            <p className="stat-value text-purple-600">{users.filter(u => u.role === UserRole.ADMIN).length}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                            <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="stat-label">Delivery Staff</p>
                            <p className="stat-value text-green-600">{users.filter(u => u.role === UserRole.DELIVERY).length}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white shadow-soft rounded-xl overflow-hidden border border-gray-200">
                <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">All Users</h3>
                    <p className="text-sm text-gray-600 mt-1">Manage user roles and access levels</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b-2 border-gray-200">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">User</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contact</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Role</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-bold shadow-md">
                                                {(u.fullName && u.fullName.trim() ? u.fullName : (u.email ? u.email : 'U')).charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{u.fullName || u.email || 'Unknown User'}</div>
                                                <div className="text-xs text-gray-500">ID: #{u.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-sm">{u.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                <span className="text-sm">{u.phoneNumber || 'No phone'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select 
                                            value={u.role} 
                                            onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                                            className="bg-white border-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-primary focus:border-primary block w-full p-2.5 font-semibold hover:border-primary transition-colors cursor-pointer"
                                        >
                                            {Object.values(UserRole).map(role => (
                                                <option key={role} value={role}>
                                                    {role === UserRole.ADMIN ? 'Admin' : role === UserRole.DELIVERY ? 'Delivery' : 'User'}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-600">
                                            {new Date(u.createdAt).toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'short', 
                                                day: 'numeric' 
                                            })}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const AdminOrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [deliveryPersons, setDeliveryPersons] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserOrders, setSelectedUserOrders] = useState<Order[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    
  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([api.getAllOrders(), api.getAllUsers()]).then(([ordersData, usersData]) => {
      setOrders(ordersData);
      setUsers(usersData);
      setDeliveryPersons(usersData.filter(u => u.role === UserRole.DELIVERY));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(loadData, [loadData]);

  // Poll orders/users every 5 seconds to simulate live orders for admin
  useEffect(() => {
    const id = setInterval(() => {
      loadData();
    }, 5000);
    return () => clearInterval(id);
  }, [loadData]);

  const handleStatusChange = async (orderId: number, status: OrderStatus) => {
    await api.updateOrderStatus(orderId, status);
    loadData();
  };

  const handleAssignDelivery = async (orderId: number, deliveryPersonId: number) => {
    await api.assignDeliveryPerson(orderId, deliveryPersonId);
    loadData();
  };

  const handlePaymentStatusChange = async (orderId: number, paymentStatus: PaymentStatus) => {
    await api.updatePaymentStatus(orderId, paymentStatus);
    loadData();
  };
    
  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Loading orders...</p>
      </div>
    </div>
  );
    
  const findUser = (userId: number) => users.find(u => u.id === userId) || null;

  const getPaymentColor = (status: PaymentStatus) => {
    switch(status) {
      case PaymentStatus.PAID: return 'badge-success';
      case PaymentStatus.REFUNDED: return 'badge-warning';
      default: return 'badge badge-primary';
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch(status) {
      case OrderStatus.DELIVERED: return 'text-green-700 bg-green-50';
      case OrderStatus.CANCELLED: return 'text-red-700 bg-red-50';
      case OrderStatus.OUT_FOR_DELIVERY: return 'text-blue-700 bg-blue-50';
      default: return 'text-yellow-700 bg-yellow-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 border border-primary/20">
        <div className="flex items-center gap-3">
          <div className="bg-white p-3 rounded-xl shadow-md">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold gradient-text">Order Management</h2>
            <p className="text-gray-600 mt-1">Monitor and manage customer orders</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Total Orders</p>
              <p className="stat-value">{orders.length}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Pending</p>
              <p className="stat-value text-yellow-600">{orders.filter(o => o.status === OrderStatus.PENDING).length}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">In Delivery</p>
              <p className="stat-value text-blue-600">{orders.filter(o => o.status === OrderStatus.OUT_FOR_DELIVERY).length}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Delivered</p>
              <p className="stat-value text-green-600">{orders.filter(o => o.status === OrderStatus.DELIVERED).length}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow-soft rounded-xl overflow-hidden border border-gray-200">
        <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">All Orders</h3>
          <p className="text-sm text-gray-600 mt-1">Real-time order tracking and management</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Order</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Total</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Payment</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Delivery</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map(o => {
                const user = findUser(o.userId);
                const deliveryPerson = o.deliveryPersonId ? findUser(o.deliveryPersonId) : null;
                return (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-primary">#{o.id}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(o.orderDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">{user.fullName}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">User #{o.userId}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-primary text-lg">{formatPrice(o.totalAmount)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={o.status} 
                        onChange={e => handleStatusChange(o.id, e.target.value as OrderStatus)}
                        className={`text-xs font-semibold rounded-lg px-3 py-2 border-2 focus:ring-2 focus:ring-primary transition-all cursor-pointer ${getStatusColor(o.status)}`}
                      >
                        {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <span className={`badge ${getPaymentColor(o.paymentStatus)}`}>
                          {o.paymentStatus}
                        </span>
                        <select 
                          value={o.paymentStatus} 
                          onChange={e => handlePaymentStatusChange(o.id, e.target.value as PaymentStatus)}
                          className="w-full bg-white border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-2 focus:ring-primary focus:border-primary p-2"
                        >
                          {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {deliveryPerson ? (
                        <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-xs font-semibold text-green-700">{deliveryPerson.fullName}</span>
                        </div>
                      ) : (
                        <select 
                          value={o.deliveryPersonId || ''}
                          onChange={e => handleAssignDelivery(o.id, Number(e.target.value))}
                          className="w-full bg-yellow-50 border-2 border-yellow-300 text-gray-900 text-xs rounded-lg focus:ring-2 focus:ring-primary p-2 font-medium"
                        >
                          <option value="">Assign Driver...</option>
                          {deliveryPersons.map(dp => <option key={dp.id} value={dp.id}>{dp.fullName}</option>)}
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={async () => { 
                            setSelectedUser(user); 
                            const userOrders = await api.getOrdersByUserId(user.id);
                            setSelectedUserOrders(userOrders);
                            setIsUserModalOpen(true); 
                          }}
                          className="hover:bg-primary hover:text-white"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title="Customer Details">
        {selectedUser ? (
          <div className="space-y-6">
            {/* User Profile Card */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 border border-primary/20">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {selectedUser.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedUser.fullName}</h3>
                  <span className={`badge ${selectedUser.role === UserRole.ADMIN ? 'badge-primary' : selectedUser.role === UserRole.DELIVERY ? 'badge-success' : 'bg-gray-100 text-gray-700'} mt-2`}>
                    {selectedUser.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-semibold text-gray-500 uppercase">Email</span>
                </div>
                <p className="text-gray-900 font-medium">{selectedUser.email}</p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-xs font-semibold text-gray-500 uppercase">Phone</span>
                </div>
                <p className="text-gray-900 font-medium">{selectedUser.phoneNumber || 'No phone number'}</p>
              </div>
            </div>

            {/* Member Since */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-xs font-semibold text-blue-600 uppercase">Member Since</p>
                  <p className="text-blue-900 font-medium">
                    {new Date(selectedUser.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Delivery Addresses */}
            {selectedUserOrders.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Delivery Addresses
                  </h4>
                  <span className="badge badge-primary">{selectedUserOrders.length} orders</span>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {[...new Set(selectedUserOrders.map(o => o.shippingAddress).filter(Boolean))].map((address, idx) => (
                    <div key={idx} className="bg-white border-l-4 border-primary p-4 rounded-r-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-gray-700 font-medium text-sm">{address}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500">User details not available</p>
          </div>
        )}
      </Modal>
    </div>
  );
    
};

// --- BANNER MANAGEMENT PAGE ---
const BannerManagementPage: React.FC = () => {
  const [banners, setBanners] = useState<SaleBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<SaleBanner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    discountText: '',
    description: '',
    imageUrl: '',
    backgroundColor: 'from-red-500 via-pink-500 to-orange-500',
    buttonText: 'Shop Now',
    buttonLink: '#',
    displayOrder: 0,
    isActive: true
  });

  const colorOptions = [
    { value: 'from-red-500 via-pink-500 to-orange-500', label: 'Red/Pink/Orange', preview: 'bg-gradient-to-r from-red-500 via-pink-500 to-orange-500' },
    { value: 'from-green-500 via-emerald-500 to-teal-500', label: 'Green/Emerald/Teal', preview: 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500' },
    { value: 'from-purple-600 via-blue-600 to-indigo-600', label: 'Purple/Blue/Indigo', preview: 'bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600' },
    { value: 'from-yellow-400 via-orange-500 to-red-500', label: 'Yellow/Orange/Red', preview: 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500' },
    { value: 'from-pink-500 via-purple-500 to-indigo-500', label: 'Pink/Purple/Indigo', preview: 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500' },
    { value: 'from-cyan-500 via-blue-500 to-purple-600', label: 'Cyan/Blue/Purple', preview: 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600' }
  ];

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAllBannersAdmin();
      setBanners(data);
    } catch (error) {
      console.error('Error loading banners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        await api.updateBanner(editingBanner.id, formData);
      } else {
        await api.createBanner(formData);
      }
      await loadBanners();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving banner:', error);
    }
  };

  const handleEdit = (banner: SaleBanner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle,
      discountText: banner.discountText,
      description: banner.description,
      imageUrl: banner.imageUrl,
      backgroundColor: banner.backgroundColor,
      buttonText: banner.buttonText,
      buttonLink: banner.buttonLink,
      displayOrder: banner.displayOrder,
      isActive: banner.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      try {
        await api.deleteBanner(id);
        await loadBanners();
      } catch (error) {
        console.error('Error deleting banner:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      discountText: '',
      description: '',
      imageUrl: '',
      backgroundColor: 'from-red-500 via-pink-500 to-orange-500',
      buttonText: 'Shop Now',
      buttonLink: '#',
      displayOrder: 0,
      isActive: true
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sale Banner Management</h1>
          <p className="text-gray-600 mt-2">Manage promotional banners displayed on the homepage</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-primary hover:bg-primary-focus text-white">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Banner
        </Button>
      </div>

      {/* Banner Preview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {banners.map(banner => (
          <div key={banner.id} className="relative group">
            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${banner.backgroundColor} shadow-xl transition-all duration-300`}>
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative p-8 text-white">
                {banner.subtitle && (
                  <div className="inline-block mb-3 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider">
                    {banner.subtitle}
                  </div>
                )}
                <h2 className="text-3xl font-bold mb-2">{banner.title}</h2>
                {banner.discountText && (
                  <p className="text-5xl font-black mb-2">{banner.discountText}</p>
                )}
                {banner.description && (
                  <p className="text-lg mb-4 opacity-90">{banner.description}</p>
                )}
                <button className="px-6 py-3 bg-white text-gray-900 font-bold rounded-lg shadow-lg">
                  {banner.buttonText}
                </button>
                {!banner.isActive && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-red-500 rounded-full text-xs font-bold">
                    INACTIVE
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEdit(banner)}
                className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100"
                title="Edit"
              >
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => handleDelete(banner.id)}
                className="p-2 bg-white rounded-lg shadow-lg hover:bg-red-50"
                title="Delete"
              >
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            
            <div className="mt-2 text-sm text-gray-600">
              Order: {banner.displayOrder} | Status: {banner.isActive ? '✅ Active' : '❌ Inactive'}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal onClose={handleCloseModal}>
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">{editingBanner ? 'Edit Banner' : 'Add New Banner'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="MEGA SALE"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <Input
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Limited Time"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Text</label>
                <Input
                  value={formData.discountText}
                  onChange={(e) => setFormData({ ...formData, discountText: e.target.value })}
                  placeholder="50% OFF"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="On selected products"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Background Color</label>
                <div className="grid grid-cols-2 gap-3">
                  {colorOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, backgroundColor: option.value })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.backgroundColor === option.value ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'
                      }`}
                    >
                      <div className={`h-8 rounded ${option.preview} mb-2`}></div>
                      <p className="text-xs text-gray-700">{option.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                  <Input
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    placeholder="Shop Now"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                  <Input
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    placeholder="#"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <Input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 pt-8">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-primary rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary-focus text-white">
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </Button>
                <Button type="button" onClick={handleCloseModal} variant="ghost" className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <AdminOrderManagement/>
      <AdminUserManagement/>
    </div>
  );
};


export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
      <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="product/:id" element={<ProductDetailPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="cart" element={<CartPage />} />
              
              {/* User Routes */}
              <Route element={<ProtectedRoute allowedRoles={[UserRole.USER]} />}>
                <Route path="checkout" element={<CheckoutPage />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={[UserRole.USER, UserRole.ADMIN]} />}>
                <Route path="orders" element={<OrderHistoryPage />} />
              </Route>
              
              {/* Delivery Routes */}
              <Route path="delivery" element={<ProtectedRoute allowedRoles={[UserRole.DELIVERY]} />}>
                <Route index element={<DeliveryDashboard />} />
              </Route>
              
              {/* Product Management Routes */}
               <Route path="products" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
                <Route index element={<ProductManagementPage />} />
              </Route>
              
              {/* Admin Routes */}
              <Route path="admin" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
                 <Route index element={<AdminDashboard />} />
                 <Route path="banners" element={<BannerManagementPage />} />
              </Route>

            </Route>
          </Routes>
  </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
