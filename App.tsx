

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
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cart from database when user logs in
  useEffect(() => {
    const loadCart = async () => {
      if (!user) {
        setCart([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const cartData = await api.getCart();
        // Map backend response to CartItem format
        const formattedCart = cartData.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          imageUrl: item.imageUrl,
          description: item.description,
          stockQuantity: item.stockQuantity,
          quantity: item.quantity,
          cart_item_id: item.cart_item_id, // Store for updates/deletes
        }));
        setCart(formattedCart);
      } catch (error) {
        console.error('Failed to load cart:', error);
        setCart([]);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [user?.id]);

  const addToCart = async (product: Product) => {
    if (!user) {
      alert('Veuillez vous connecter pour ajouter des articles au panier');
      return;
    }

    try {
      const response = await api.addToCart(product.id, 1);
      // Update local cart with response
      const formattedCart = response.cart.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        description: item.description,
        stockQuantity: item.stockQuantity,
        quantity: item.quantity,
        cart_item_id: item.cart_item_id,
      }));
      setCart(formattedCart);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Échec de l\'ajout au panier');
    }
  };

  const removeFromCart = async (productId: number) => {
    if (!user) return;

    try {
      const cartItem = cart.find(item => item.id === productId);
      if (!cartItem || !cartItem.cart_item_id) return;

      const response = await api.removeCartItem(cartItem.cart_item_id);
      const formattedCart = response.cart.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        description: item.description,
        stockQuantity: item.stockQuantity,
        quantity: item.quantity,
        cart_item_id: item.cart_item_id,
      }));
      setCart(formattedCart);
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      alert('Échec de la suppression du panier');
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (!user) return;

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    try {
      const cartItem = cart.find(item => item.id === productId);
      if (!cartItem || !cartItem.cart_item_id) return;

      const response = await api.updateCartItem(cartItem.cart_item_id, quantity);
      const formattedCart = response.cart.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        description: item.description,
        stockQuantity: item.stockQuantity,
        quantity: item.quantity,
        cart_item_id: item.cart_item_id,
      }));
      setCart(formattedCart);
    } catch (error) {
      console.error('Failed to update cart:', error);
      alert('Échec de la mise à jour du panier');
    }
  };

  const clearCart = async () => {
    if (!user) {
      setCart([]);
      return;
    }

    try {
      await api.clearCart();
      setCart([]);
    } catch (error) {
      console.error('Failed to clear cart:', error);
      alert('Échec du vidage du panier');
    }
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = [
    { id: 1, name: 'Visage', slug: 'visage' },
    { id: 2, name: 'Maquillage', slug: 'maquillage' },
    { id: 3, name: 'Corps', slug: 'corps' },
    { id: 4, name: 'Cheveux', slug: 'cheveux' },
    { id: 5, name: 'Bébé & Maman', slug: 'bebe-maman' },
    { id: 6, name: 'Homme', slug: 'homme' },
    { id: 7, name: 'Hygiène', slug: 'hygiene' },
    { id: 8, name: 'Solaire', slug: 'solaire' },
    { id: 9, name: 'Santé', slug: 'sante' },
    { id: 10, name: 'Para-médical', slug: 'para-medical' },
    { id: 11, name: 'Bio', slug: 'bio' },
    { id: 12, name: 'PROMOTION', slug: 'promotion' }
  ];

  return (
    <nav className="bg-white sticky top-0 z-50">
      {/* Top Banner */}
      <div className="bg-[#2563eb] text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center text-sm">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
            </svg>
            <span className="font-medium">Livraison gratuite pour toute commande sur Casablanca</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-center py-4 gap-4">
            {/* Logo Section */}
            <div className="flex items-center space-x-3 w-full lg:w-auto justify-between lg:justify-start">
              <Link to="/" className="text-2xl font-bold flex items-center gap-2 hover:opacity-80 transition-opacity">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
                  <path d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2Z" fill="#2563eb" opacity="0.2"/>
                  <path d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2Z" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="flex flex-col">
                  <span className="text-xl leading-tight" style={{ color: '#2563eb' }}>Parapharmacie</span>
                  <span className="hidden sm:block text-[10px] text-gray-500 font-normal -mt-1">Santé & Bien-être</span>
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
                    placeholder="Rechercher un produit, une marque..." 
                    className="w-full px-4 py-2.5 rounded-l-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition-all" 
                  />
                </div>
                <Button type="submit" size="md" className="rounded-l-none rounded-r-lg px-4" style={{ backgroundColor: '#2563eb' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Button>
              </form>
            </div>

            {/* Right Section - Cart, User */}
            <div className="flex items-center space-x-2 lg:space-x-4 w-full lg:w-auto justify-center lg:justify-end">
              {/* WhatsApp Contact - Hidden for Admin */}
              {user?.role !== UserRole.ADMIN && (
                <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="hidden md:flex items-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 rounded-lg transition-all">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-700">+(212) 6 00 00 00 00</span>
                </a>
              )}

              {/* Social Media Icons - Hidden for Admin */}
              {user?.role !== UserRole.ADMIN && (
                <div className="hidden md:flex items-center gap-2">
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-gray-100 rounded-full transition-all" title="Instagram">
                    <svg className="w-5 h-5" style={{ color: '#E4405F' }} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                </div>
              )}

              {user ? (
                <>
                  {/* User Greeting */}
                  <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                    <svg className="w-5 h-5" style={{ color: '#2563eb' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">
                      {user.fullName && user.fullName.trim() ? user.fullName.split(' ')[0] : (user.email ? user.email.split('@')[0] : 'User')}
                    </span>
                  </div>
                  
                  {/* Role-based Navigation - Admin Menu */}
                  {user.role === UserRole.ADMIN && (
                    <>
                      <Link to="/admin" className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#2563eb] rounded-lg transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span className="hidden lg:inline">Admin</span>
                      </Link>
                      
                      <Link to="/products" className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#2563eb] rounded-lg transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span className="hidden lg:inline">Produits</span>
                      </Link>
                      
                      <Link to="/admin/banners" className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#2563eb] rounded-lg transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="hidden lg:inline">Bannières</span>
                      </Link>
                    </>
                  )}
                  
                  {user.role === UserRole.USER && (
                    <Link to="/orders" className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#2563eb] rounded-lg transition-all">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="hidden lg:inline">Commandes</span>
                    </Link>
                  )}
                  
                  {/* Cart Button */}
                  <button 
                    onClick={() => navigate('/cart')} 
                    className="relative flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#2563eb] hover:bg-gray-50 rounded-lg transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="hidden md:inline">Panier</span>
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md" style={{ backgroundColor: '#2563eb' }}>
                        {cartCount}
                      </span>
                    )}
                  </button>
                  
                  {/* Logout Button */}
                  <button 
                    onClick={logout} 
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-[#2563eb] hover:bg-gray-50 rounded-lg transition-all"
                    title="Déconnexion"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </>
              ) : (
                <Button onClick={() => navigate('/login')} className="px-6" style={{ backgroundColor: '#2563eb' }}>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Connexion
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mega Menu */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-1 overflow-x-auto">
            {categories.map((category) => (
              <div
                key={category.slug}
                className="relative group"
                onMouseEnter={() => setActiveCategory(category.slug)}
                onMouseLeave={() => setActiveCategory(null)}
              >
                <button
                  onClick={() => navigate(`/?category=${category.slug}`)}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all ${
                    category.name === 'PROMOTION' 
                      ? 'text-[#2563eb] font-bold'
                      : 'text-gray-700 hover:text-[#2563eb]'
                  }`}
                >
                  {category.name}
                </button>
                
                {/* Underline effect */}
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563eb] transform origin-center transition-transform ${
                  activeCategory === category.slug ? 'scale-x-100' : 'scale-x-0'
                }`}></div>
              </div>
            ))}
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
      <footer className="bg-white border-t border-gray-200">
        {/* Service Client Top Section */}
        <div className="bg-gray-50 py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8" style={{ color: '#2563eb' }} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
                <div>
                  <h3 className="font-bold text-gray-900">Service Client</h3>
                  <p className="text-sm text-gray-600">+(212) 632 478 888</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8" style={{ color: '#2563eb' }} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                <div>
                  <h3 className="font-bold text-gray-900">Email</h3>
                  <p className="text-sm text-gray-600">contact@parapharmacie.ma</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
            {/* Nos Produits */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Nos Produits</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="/?category=promotion" className="hover:text-[#2563eb] transition-colors">Promotions</a></li>
                <li><a href="/?new=true" className="hover:text-[#2563eb] transition-colors">Nouveaux produits</a></li>
                <li><a href="/?bestsellers=true" className="hover:text-[#2563eb] transition-colors">Meilleures ventes</a></li>
              </ul>
            </div>
            
            {/* Infos Pratiques */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Infos Pratiques</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="/livraison" className="hover:text-[#2563eb] transition-colors">Livraison</a></li>
                <li><a href="/mentions-legales" className="hover:text-[#2563eb] transition-colors">Mentions légales</a></li>
                <li><a href="/conditions" className="hover:text-[#2563eb] transition-colors">Conditions d'utilisation</a></li>
                <li><a href="/about" className="hover:text-[#2563eb] transition-colors">Qui sommes nous</a></li>
                <li><a href="/paiement" className="hover:text-[#2563eb] transition-colors">Paiement sécurisé</a></li>
              </ul>
            </div>
            
            {/* Nous Connaitre */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Nous Connaitre</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/contact" className="hover:text-[#2563eb] transition-colors">Contactez-nous</Link></li>
              </ul>
            </div>
            
            {/* Votre Compte */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Votre Compte</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/login" className="hover:text-[#2563eb] transition-colors">Informations personnelles</Link></li>
                <li><Link to="/orders" className="hover:text-[#2563eb] transition-colors">Commandes</Link></li>
                <li><Link to="/cart" className="hover:text-[#2563eb] transition-colors">Panier</Link></li>
              </ul>
            </div>
            
            {/* Social & Logo */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2Z" fill="#2563eb" opacity="0.3"/>
                  <path d="M9 12L11 14L15 10" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-xl font-bold" style={{ color: '#2563eb' }}>Parapharmacie</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Suivez-nous</h3>
              <div className="flex gap-3">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 hover:bg-[#2563eb] hover:text-white flex items-center justify-center transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 hover:bg-[#2563eb] hover:text-white flex items-center justify-center transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          {/* Bottom Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600">&copy; {new Date().getFullYear()} Parapharmacie.ma - Tous droits réservés</p>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Paiement sécurisé par:</span>
                <div className="flex gap-2">
                  <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-600">VISA</div>
                  <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-600">MC</div>
                  <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-600">CMI</div>
                </div>
              </div>
            </div>
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

  const discountPercent = product.originalPrice && product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <>
      <Card className="flex flex-col h-full product-card group">
        <Link to={`/product/${product.id}`} className="block overflow-hidden relative">
          {discountPercent > 0 && (
            <div className="absolute top-2 left-2 z-10 bg-[#2563eb] text-white text-xs font-bold px-2 py-1 rounded-md">
              -{discountPercent}%
            </div>
          )}
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
                <span className="text-2xl font-bold" style={{ color: '#2563eb' }}>{formatPrice(product.price)}</span>
              </div>
              <div className="text-xs text-gray-500">
                {product.stockQuantity > 0 ? (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    En stock
                  </span>
                ) : (
                  <span className="text-red-500">Rupture de stock</span>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => setIsModalOpen(true)} variant="ghost" size="sm" className="flex-1 text-gray-700 hover:text-[#2563eb]">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Voir
              </Button>
              <Button onClick={handleAddToCart} size='sm' className="flex-1" style={{ backgroundColor: '#2563eb' }} disabled={product.stockQuantity <= 0}>
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                J'achète !
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

  const getCategoryIcon = (categoryName: string) => {
    const iconClass = "w-8 h-8";
    switch(categoryName.toLowerCase()) {
      case 'skincare':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'vitamins':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case 'first aid':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      case 'personal care':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section - 75/25 Layout */}
      {saleBanners.length > 0 && (
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left: Main Carousel (75%) */}
          <div 
            className="w-full lg:w-3/4 relative overflow-hidden rounded-2xl"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Carousel Inner */}
            <div className="relative h-[300px] md:h-[400px] lg:h-[450px]">
              {saleBanners.map((banner, index) => (
                <div
                key={banner.id}
                className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
                  index === currentSlide 
                    ? 'opacity-100 scale-100 z-10' 
                    : 'opacity-0 scale-105 z-0'
                }`}
              >
                <a 
                  href={banner.buttonLink !== '#' ? banner.buttonLink : undefined} 
                  className="block w-full h-full group"
                >
                  {/* Background Image with Parallax Effect */}
                  <div className="relative w-full h-full overflow-hidden">
                    {banner.imageUrl ? (
                      <img 
                        src={banner.imageUrl} 
                        alt={banner.title} 
                        className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[3000ms] ease-out"
                        loading="lazy"
                      />
                    ) : (
                      <div className={`absolute inset-0 w-full h-full bg-gradient-to-br ${banner.backgroundColor}`}></div>
                    )}
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
                    
                    {/* Content Container */}
                    <div className="absolute inset-0 flex items-center">
                      <div className="container mx-auto px-6 md:px-12 lg:px-16">
                        <div className="max-w-2xl">
                          {/* Subtitle Badge */}
                          {banner.subtitle && (
                            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-gradient-to-r from-emerald-500/90 to-teal-500/90 backdrop-blur-md rounded-full shadow-lg">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                              <span className="text-white font-semibold text-sm uppercase tracking-wider">
                                {banner.subtitle}
                              </span>
                            </div>
                          )}
                          
                          {/* Main Title */}
                          {banner.title && (
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 leading-tight drop-shadow-2xl">
                              {banner.title}
                            </h1>
                          )}
                          
                          {/* Discount Text */}
                          {banner.discountText && (
                            <div className="mb-4">
                              <span className="inline-block px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 text-3xl md:text-5xl font-black rounded-2xl shadow-2xl transform -rotate-2">
                                {banner.discountText}
                              </span>
                            </div>
                          )}
                          
                          {/* Description */}
                          {banner.description && (
                            <p className="text-lg md:text-xl text-gray-200 mb-6 leading-relaxed max-w-xl">
                              {banner.description}
                            </p>
                          )}
                          
                          {/* CTA Button */}
                          {banner.buttonText && (
                            <button className="group/btn inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 font-bold text-lg rounded-xl hover:bg-gradient-to-r hover:from-emerald-400 hover:to-teal-400 hover:text-white transition-all duration-300 shadow-2xl hover:shadow-emerald-500/50 hover:scale-105">
                              <span>{banner.buttonText}</span>
                              <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>

          {/* Modern Indicator Dots */}
          {saleBanners.length > 1 && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2 z-20 bg-black/30 backdrop-blur-md px-4 py-3 rounded-full">
              {saleBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentSlide 
                      ? 'w-8 h-2 bg-gradient-to-r from-emerald-400 to-teal-400' 
                      : 'w-2 h-2 bg-white/60 hover:bg-white/90 hover:scale-125'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Sleek Navigation Buttons */}
          {saleBanners.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-all duration-300 hover:scale-110 border border-white/20"
                aria-label="Previous slide"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={goToNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-all duration-300 hover:scale-110 border border-white/20"
                aria-label="Next slide"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Slide Counter */}
          {saleBanners.length > 1 && (
            <div className="absolute top-6 right-6 z-20 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-semibold">
              {currentSlide + 1} / {saleBanners.length}
            </div>
          )}
        </div>

        {/* Right: Promotional Banners (25%) */}
        <div className="w-full lg:w-1/4 flex flex-col gap-4">
            {/* Top Promo Banner */}
            <div className="relative h-[145px] lg:h-[218px] rounded-2xl overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb] to-blue-700"></div>
              <div className="relative h-full flex flex-col items-center justify-center p-6 text-white text-center">
                <svg className="w-12 h-12 mb-2 opacity-90" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                </svg>
                <h3 className="text-lg font-bold mb-1">Nouveaux Produits</h3>
                <p className="text-sm opacity-90">Découvrez nos dernières arrivées</p>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
            </div>

            {/* Bottom Promo Banner */}
            <div className="relative h-[145px] lg:h-[218px] rounded-2xl overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-[#3cabdb] to-blue-600"></div>
              <div className="relative h-full flex flex-col items-center justify-center p-6 text-white text-center">
                <svg className="w-12 h-12 mb-2 opacity-90" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
                <h3 className="text-lg font-bold mb-1">Santé & Bien-être</h3>
                <p className="text-sm opacity-90">Des produits pour toute la famille</p>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
            </div>
          </div>
        </div>
      )}

      {/* Reassurance Block */}
      <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Paiement sécurisé */}
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-3 shadow-md" style={{ color: '#2563eb' }}>
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Paiement sécurisé</h4>
            <p className="text-sm text-gray-600">100% sécurisé</p>
          </div>

          {/* Livraison offerte */}
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-3 shadow-md" style={{ color: '#2563eb' }}>
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Livraison offerte</h4>
            <p className="text-sm text-gray-600">Dès 300 DH</p>
          </div>

          {/* Produits certifiés */}
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-3 shadow-md" style={{ color: '#2563eb' }}>
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Produits certifiés</h4>
            <p className="text-sm text-gray-600">Qualité garantie</p>
          </div>

          {/* Confidentialité */}
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-3 shadow-md" style={{ color: '#2563eb' }}>
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Confidentialité</h4>
            <p className="text-sm text-gray-600">Données protégées</p>
          </div>
        </div>
      </div>

      {/* Category Section - Circular Thumbnails */}
      {/* Category Section - Circular Thumbnails */}
      <div className="mb-10">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Explorer les catégories</h3>
        <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
          <button 
            onClick={() => setSelectedCategory(null)} 
            className="flex-shrink-0 flex flex-col items-center group"
          >
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-2 transition-all ${
              selectedCategory === null 
                ? 'bg-[#2563eb] text-white shadow-lg scale-105' 
                : 'bg-gray-100 text-gray-700 group-hover:bg-gray-200'
            }`}>
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <span className={`text-xs font-medium ${
              selectedCategory === null ? 'text-white' : 'text-gray-700 group-hover:text-[#2563eb]'
            }`}>
              Tous
            </span>
          </button>
          {categories.map(c => (
            <button 
              key={c.id} 
              onClick={() => setSelectedCategory(c.id)}
              className="flex-shrink-0 flex flex-col items-center group"
            >
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-2 transition-all ${
                selectedCategory === c.id 
                  ? 'bg-[#2563eb] text-white shadow-lg scale-105' 
                  : 'bg-gray-100 text-gray-700 group-hover:bg-gray-200'
              }`}>
                {getCategoryIcon(c.name)}
              </div>
              <span className={`text-xs font-medium text-center max-w-[100px] ${
                selectedCategory === c.id ? 'text-[#2563eb]' : 'text-gray-700 group-hover:text-[#2563eb]'
              }`}>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tabbed Product Sections */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            {selectedCategory 
              ? categories.find(c => c.id === selectedCategory)?.name || 'Produits'
              : 'Nos Produits'}
          </h2>
          <div className="text-sm text-gray-500">
            {filtered.length} {filtered.length === 1 ? 'produit' : 'produits'}
          </div>
        </div>
        
        {filtered.length === 0 ? (
          <div className="empty-state py-16">
            <svg className="mx-auto mb-4 w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xl font-semibold text-gray-400 mb-2">Aucun produit trouvé</p>
            <p className="text-gray-500">Essayez d'ajuster vos filtres de recherche</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Brand Showcase */}
      <div className="bg-gray-50 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Nos prestigieuses marques</h3>
        <div className="flex items-center justify-center gap-8 flex-wrap">
          {['AVÈNE', 'EUCERIN', 'NUXE', 'FILORGA', 'CAUDALIE', 'LA ROCHE-POSAY'].map((brand) => (
            <div key={brand} className="flex items-center justify-center w-32 h-20 bg-white rounded-lg shadow-sm hover:shadow-md transition-all group cursor-pointer">
              <span className="text-lg font-bold text-gray-400 group-hover:text-[#2563eb] transition-colors">{brand}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-gradient-to-r from-[#2563eb] to-blue-700 rounded-2xl p-8 md:p-12 text-white text-center">
        <h3 className="text-3xl font-bold mb-3">Recevez nos offres spéciales</h3>
        <p className="text-lg mb-6 opacity-90">Inscrivez-vous à notre newsletter et profitez de promotions exclusives</p>
        <form className="max-w-md mx-auto flex gap-3">
          <input 
            type="email" 
            placeholder="Votre adresse e-mail" 
            className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button 
            type="submit" 
            className="px-6 py-3 bg-white text-[#2563eb] font-bold rounded-lg hover:bg-gray-100 transition-all"
          >
            S'abonner
          </button>
        </form>
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
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        api.getCategories().then(setCategories);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        // Check if user selected "Add New Category"
        if (name === 'categoryId' && value === 'add-new') {
            setShowAddCategory(true);
            return;
        }
        
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
        try {
            // Map categoryId to category name
            const selectedCategory = categories.find(c => c.id === Number(formData.categoryId));
            const productData = {
                ...formData,
                category: selectedCategory?.name || 'Visage'
            };
            
            if (product) { // Editing
                await api.updateProduct(product.id, productData);
                onSave({ ...product, ...productData });
            } else { // Creating
                const newProduct = await api.createProduct(productData);
                onSave(newProduct);
            }
        } catch (error: any) {
            alert(error.message || 'Failed to save product. Please check all required fields.');
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            alert('Please enter a category name');
            return;
        }

        // Check if category already exists
        if (categories.some(c => c.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
            alert('This category already exists');
            return;
        }

        try {
            // Create slug from name
            const slug = newCategoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            
            // Add to local categories list
            const newId = Math.max(...categories.map(c => c.id), 0) + 1;
            const newCategory = { 
                id: newId, 
                name: newCategoryName.trim(), 
                slug 
            };
            
            setCategories([...categories, newCategory]);
            setFormData({ ...formData, categoryId: newId });
            setNewCategoryName('');
            setShowAddCategory(false);
            
            alert(`Category "${newCategoryName}" added successfully!`);
        } catch (error: any) {
            alert(error.message || 'Failed to add category');
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
                <div className="flex gap-2">
                    <select 
                        name="categoryId" 
                        value={formData.categoryId} 
                        onChange={handleChange} 
                        className="flex-1 mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    >
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        <option value="add-new" style={{ fontWeight: 'bold', color: '#2563eb' }}>+ Add New Category</option>
                    </select>
                    <button
                        type="button"
                        onClick={() => setShowAddCategory(true)}
                        className="mt-1 px-4 py-2 bg-[#2563eb] text-white rounded-md hover:bg-[#1d4ed8] transition-colors"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Add Category Modal */}
            {showAddCategory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Add New Category</h3>
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Enter category name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                        />
                        <div className="flex gap-2 mt-4">
                            <button
                                type="button"
                                onClick={handleAddCategory}
                                className="flex-1 px-4 py-2 bg-[#2563eb] text-white rounded-md hover:bg-[#1d4ed8] transition-colors"
                            >
                                Add Category
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddCategory(false);
                                    setNewCategoryName('');
                                }}
                                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
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
  const [uploadingImage, setUploadingImage] = useState(false);
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
    } catch (error: any) {
      console.error('Error loading banners:', error);
      alert('Failed to load banners. Please ensure the sale_banners table exists in your database.');
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
      alert(editingBanner ? 'Banner updated successfully!' : 'Banner created successfully!');
    } catch (error: any) {
      console.error('Error saving banner:', error);
      const errorMsg = error?.message || 'Failed to save banner';
      alert(`Error: ${errorMsg}\n\nPlease ensure:\n1. You are logged in as admin\n2. The sale_banners table exists in the database\n3. All required fields are filled`);
    }
  };

  const handleEdit = (banner: SaleBanner) => {
    console.log('🔵 Edit button clicked for banner:', banner.id);
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
    console.log('🔴 Delete button clicked for banner:', id);
    const confirmed = window.confirm('Are you sure you want to delete this banner? This action cannot be undone.');
    if (confirmed) {
      try {
        await api.deleteBanner(id);
        await loadBanners();
        alert('Banner deleted successfully!');
      } catch (error: any) {
        console.error('Error deleting banner:', error);
        const errorMsg = error?.message || 'Failed to delete banner';
        alert(`Error: ${errorMsg}\n\nPlease ensure you are logged in as admin.`);
      }
    }
  };

  const handleAddNew = () => {
    console.log('🟢 Add New Banner button clicked');
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
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      
      // Convert image to base64 data URL for direct use
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFormData({ ...formData, imageUrl: dataUrl });
        setUploadingImage(false);
        alert('Image loaded successfully! You can now save the banner.');
      };
      reader.onerror = () => {
        alert('Failed to read image file');
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
      
    } catch (error: any) {
      console.error('Image upload error:', error);
      alert(`Failed to process image: ${error?.message || 'Unknown error'}`);
      setUploadingImage(false);
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
        <button
          onClick={handleAddNew}
          className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary-focus text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Banner
        </button>
      </div>

      {/* Banner Preview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {banners.map(banner => (
          <div key={banner.id} className="relative group">
            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${banner.backgroundColor} shadow-xl transition-all duration-300 group-hover:shadow-2xl`}>
              <div className="absolute inset-0 bg-black/10"></div>
              {banner.imageUrl && (
                <img src={banner.imageUrl} alt={banner.title} className="absolute inset-0 w-full h-full object-cover opacity-30" />
              )}
              <div className="relative p-8 text-white min-h-[280px]">
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
                  <p className="text-lg mb-4 opacity-90 line-clamp-2">{banner.description}</p>
                )}
                <span className="inline-block px-6 py-3 bg-white text-gray-900 font-bold rounded-lg shadow-lg pointer-events-none">
                  {banner.buttonText}
                </span>
                {!banner.isActive && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-red-500 rounded-full text-xs font-bold">
                    INACTIVE
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons - Always visible on mobile, hover on desktop */}
            <div className="absolute top-4 left-4 flex gap-2 md:opacity-100 md:group-hover:opacity-100 transition-opacity z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Edit clicked for banner', banner.id);
                  handleEdit(banner);
                }}
                className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg text-white transition-colors cursor-pointer"
                title="Edit Banner"
              >
                <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Delete clicked for banner', banner.id);
                  handleDelete(banner.id);
                }}
                className="p-3 bg-red-600 hover:bg-red-700 rounded-lg shadow-lg text-white transition-colors cursor-pointer"
                title="Delete Banner"
              >
                <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            
            <div className="mt-3 flex items-center justify-between px-2">
              <span className="text-sm text-gray-600">
                <span className="font-semibold">Order:</span> {banner.displayOrder}
              </span>
              <span className={`text-sm font-semibold ${banner.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {banner.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={handleCloseModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-primary/10">
              <h2 className="text-2xl font-bold text-gray-900">{editingBanner ? 'Edit Banner' : 'Add New Banner'}</h2>
              <button 
                onClick={handleCloseModal} 
                className="text-gray-400 bg-transparent hover:bg-gray-100 hover:text-gray-900 rounded-lg text-sm p-2 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image</label>
                
                {/* Image Preview */}
                {formData.imageUrl && (
                  <div className="mb-3 relative group">
                    <img 
                      src={formData.imageUrl} 
                      alt="Banner preview" 
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove image"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                      {uploadingImage ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          <span>Loading...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Choose Image</span>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                  
                  <div className="flex-1">
                    <Input
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="Or paste image URL"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Upload from computer (max 5MB) or paste an external image URL
                </p>
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
                <button 
                  type="submit" 
                  className="flex-1 px-6 py-3 bg-primary hover:bg-primary-focus text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
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

