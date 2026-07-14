import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import './Cart.css';

const Cart = () => {
  const { cart, updateCartQty, removeFromCart, getCartTotals, user } = useContext(ShopContext);
  const navigate = useNavigate();

  const { mrp, discount, deliveryCharges, finalAmount, count } = getCartTotals();

  const handlePlaceOrder = () => {
    if (user) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=checkout');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page-empty container flex flex-column align-center animate-fade-in">
        <div className="empty-cart-card flex flex-column align-center">
          <ShoppingBag size={80} className="empty-cart-icon" />
          <h2>Your cart is empty!</h2>
          <p>Explore our wide range of products and add some items to your cart.</p>
          <Link to="/" className="shop-now-btn">Shop Now</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page container animate-fade-in">
      <div className="cart-grid">
        
        {/* Left Column: Cart Items List */}
        <div className="cart-items-section">
          <div className="cart-header">
            <h2>Kalptaj Cart ({count} items)</h2>
          </div>

          <div className="cart-list">
            {cart.map(item => {
              const { product, qty } = item;
              return (
                <div key={product.id} className="cart-item">
                  <div className="cart-item-image">
                    <img src={product.image} alt={product.title} />
                  </div>
                  
                  <div className="cart-item-details">
                    <h3 className="cart-item-title">
                      <Link to={`/product/${product.id}`}>{product.title}</Link>
                    </h3>
                    <p className="cart-item-category">Category: {product.category}</p>
                    
                    {/* Pricing */}
                    <div className="cart-item-pricing">
                      <span className="cart-price-cost">₹{product.price.cost.toLocaleString()}</span>
                      {product.price.mrp > product.price.cost && (
                        <>
                          <span className="cart-price-mrp">₹{product.price.mrp.toLocaleString()}</span>
                          <span className="cart-price-discount">{product.price.discount}% Off</span>
                        </>
                      )}
                    </div>

                    {/* Quantity & Actions */}
                    <div className="cart-item-actions flex align-center">
                      <div className="qty-selector flex align-center">
                        <button 
                          onClick={() => updateCartQty(product.id, qty - 1)} 
                          className="qty-btn"
                          disabled={qty <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="qty-value">{qty}</span>
                        <button 
                          onClick={() => updateCartQty(product.id, qty + 1)} 
                          className="qty-btn"
                          disabled={qty >= 10}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeFromCart(product.id)} 
                        className="btn-remove-item flex align-center"
                      >
                        <Trash2 size={16} /> REMOVE
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Place Order Bar */}
          <div className="cart-place-order-bar flex justify-end">
            <button onClick={handlePlaceOrder} className="btn-place-order">
              Place Order
            </button>
          </div>
        </div>

        {/* Right Column: Price Details Breakup */}
        <div className="cart-summary-section">
          <div className="price-details-card">
            <h3>PRICE DETAILS</h3>
            <hr />
            
            <div className="price-row flex justify-between">
              <span>Price ({count} items)</span>
              <span>₹{mrp.toLocaleString()}</span>
            </div>
            
            <div className="price-row flex justify-between discount-row">
              <span>Discount</span>
              <span>- ₹{discount.toLocaleString()}</span>
            </div>
            
            <div className="price-row flex justify-between">
              <span>Delivery Charges</span>
              {deliveryCharges === 0 ? (
                <span className="delivery-free">FREE</span>
              ) : (
                <span>₹{deliveryCharges}</span>
              )}
            </div>

            <hr className="dashed-hr" />
            
            <div className="price-row flex justify-between total-row">
              <span>Total Amount</span>
              <span>₹{finalAmount.toLocaleString()}</span>
            </div>
            
            <hr className="dashed-hr" />
            
            <div className="savings-msg">
              You will save ₹{discount.toLocaleString()} on this order
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Cart;
