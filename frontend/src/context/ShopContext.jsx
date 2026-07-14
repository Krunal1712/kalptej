import React, { createContext, useState, useEffect } from 'react';

export const ShopContext = createContext(null);

export const ShopProvider = ({ children }) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  // Auth state
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  // Cart state
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || []);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Sync cart
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch Products
  const fetchProducts = async (search = '', category = '') => {
    setLoading(true);
    try {
      let url = `${API_URL}/products`;
      const params = [];
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (category) params.push(`category=${encodeURIComponent(category)}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Run on mount or query change
  useEffect(() => {
    fetchProducts(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Auth Actions
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Server communication error' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Server communication error' };
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    setCart([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
  };

  // Cart Actions
  const addToCart = (product, qty = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, qty: Math.min(item.qty + qty, 10) }
            : item
        );
      }
      return [...prevCart, { product, qty: Math.min(qty, 10) }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const updateCartQty = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    const finalQty = Math.min(qty, 10);
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId ? { ...item, qty: finalQty } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Price Breakup Calculations
  const getCartTotals = () => {
    let mrp = 0;
    let cost = 0;
    let count = 0;

    cart.forEach(item => {
      mrp += item.product.price.mrp * item.qty;
      cost += item.product.price.cost * item.qty;
      count += item.qty;
    });

    const discount = mrp - cost;
    const deliveryCharges = cost > 500 || count === 0 ? 0 : 40;
    const finalAmount = cost + deliveryCharges;

    return { mrp, discount, deliveryCharges, finalAmount, count };
  };

  // Place Order Action
  const placeOrder = async (shippingAddress, paymentMethod) => {
    if (!token) return { success: false, message: 'Please login to checkout' };

    try {
      const items = cart.map(item => ({
        id: item.product.id,
        title: item.product.title,
        shortTitle: item.product.shortTitle,
        image: item.product.image,
        price: item.product.price,
        qty: item.qty
      }));

      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items,
          shippingAddress,
          paymentMethod
        })
      });

      const data = await res.json();
      if (res.ok) {
        clearCart();
        return { success: true, order: data };
      } else {
        return { success: false, message: data.message || 'Order placement failed' };
      }
    } catch (error) {
      console.error('Checkout error:', error);
      return { success: false, message: 'Server communication error' };
    }
  };

  // Get Order History
  const fetchUserOrders = async () => {
    if (!token) return [];
    try {
      const res = await fetch(`${API_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        return await res.json();
      }
      return [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  };

  return (
    <ShopContext.Provider value={{
      API_URL,
      products,
      loading,
      searchQuery,
      setSearchQuery,
      selectedCategory,
      setSelectedCategory,
      theme,
      toggleTheme,
      user,
      token,
      login,
      register,
      logout,
      cart,
      addToCart,
      removeFromCart,
      updateCartQty,
      clearCart,
      getCartTotals,
      placeOrder,
      fetchUserOrders,
      fetchProducts
    }}>
      {children}
    </ShopContext.Provider>
  );
};
