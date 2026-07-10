import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { Search, ShoppingCart, User, LogOut, Sun, Moon, ShieldAlert } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { searchQuery, setSearchQuery, cart, user, logout, theme, toggleTheme } = useContext(ShopContext);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    navigate('/');
  };

  const handleLogoClick = () => {
    setLocalSearch('');
    setSearchQuery('');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={handleLogoClick}>
          <span className="logo-brand">Kalptaj</span>
          <span className="logo-sub">Plus <span className="logo-star">✦</span></span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="navbar-search">
          <input
            type="text"
            placeholder="Search for products, brands and more"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          <button type="submit" className="search-btn">
            <Search size={18} />
          </button>
        </form>

        {/* Action Items */}
        <div className="navbar-actions">
          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* User Section */}
          {user ? (
            <div className="navbar-profile-dropdown">
              <button className="nav-btn profile-btn">
                <User size={18} />
                <span>{user.name.split(' ')[0]}</span>
              </button>
              <div className="dropdown-menu">
                {user.role === 'admin' && (
                  <Link to="/admin" className="dropdown-item">
                    <ShieldAlert size={16} />
                    <span>Admin Panel</span>
                  </Link>
                )}
                <Link to="/orders" className="dropdown-item">
                  <span>My Orders</span>
                </Link>
                <button onClick={logout} className="dropdown-item logout-btn">
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="login-btn-link">Login</Link>
          )}

          {/* Cart */}
          <Link to="/cart" className="navbar-cart-btn nav-btn">
            <div className="cart-icon-container">
              <ShoppingCart size={20} />
              {cart.length > 0 && <span className="cart-badge">{cart.reduce((total, item) => total + item.qty, 0)}</span>}
            </div>
            <span>Cart</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
