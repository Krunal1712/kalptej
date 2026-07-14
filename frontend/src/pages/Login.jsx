import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { Lock, Mail, User, CheckCircle2, AlertCircle } from 'lucide-react';
import './Login.css';

const Login = () => {
  const { login, register, token } = useContext(ShopContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path
  const redirect = new URLSearchParams(location.search).get('redirect') || '';

  useEffect(() => {
    // If already logged in, redirect
    if (token) {
      navigate('/' + redirect);
    }
  }, [token, navigate, redirect]);

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const clearForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  const handleTabChange = (isLogin) => {
    setIsLoginTab(isLogin);
    clearForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (isLoginTab) {
      // Login flow
      const res = await login(email, password);
      if (res.success) {
        setSuccess('Logged in successfully!');
        setTimeout(() => navigate('/' + redirect), 500);
      } else {
        setError(res.message);
      }
    } else {
      // Registration flow
      if (!name) {
        setError('Name is required.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }

      const res = await register(name, email, password);
      if (res.success) {
        setSuccess('Registration completed! Logged in.');
        setTimeout(() => navigate('/' + redirect), 500);
      } else {
        setError(res.message);
      }
    }
  };

  return (
    <div className="login-page container flex justify-center align-center">
      <div className="login-card-container flex animate-scale-in">
        
        {/* Left Branding Panel (Kalptaj Style Info Banner) */}
        <div className="login-branding-panel flex flex-column justify-between">
          <div>
            <h2>{isLoginTab ? 'Login' : 'Look like you are new here!'}</h2>
            <p>
              {isLoginTab 
                ? 'Get access to your Orders, Wishlist and Recommendations' 
                : 'Sign up with your email to get started'}
            </p>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1563013544-824ae1d704d3?w=300&auto=format&fit=crop&q=60" 
            alt="Kalptaj Secure" 
            className="branding-image"
          />
        </div>

        {/* Right Form Panel */}
        <div className="login-form-panel">
          {/* Tabs */}
          <div className="login-tabs flex">
            <button 
              className={`login-tab ${isLoginTab ? 'active' : ''}`}
              onClick={() => handleTabChange(true)}
            >
              Sign In
            </button>
            <button 
              className={`login-tab ${!isLoginTab ? 'active' : ''}`}
              onClick={() => handleTabChange(false)}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="message-alert error-alert flex align-center gap-2">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="message-alert success-alert flex align-center gap-2">
                <CheckCircle2 size={18} />
                <span>{success}</span>
              </div>
            )}

            {!isLoginTab && (
              <div className="input-group">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="Enter Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="input-group">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                placeholder="Enter Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {!isLoginTab && (
              <div className="input-group">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <button type="submit" className="login-submit-btn">
              {isLoginTab ? 'Login' : 'Continue'}
            </button>


          </form>
        </div>

      </div>
    </div>
  );
};

export default Login;
