import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { Truck, CreditCard, ShieldCheck, Loader2 } from 'lucide-react';
import './Checkout.css';

const Checkout = () => {
  const { cart, getCartTotals, placeOrder, token } = useContext(ShopContext);
  const navigate = useNavigate();

  // Redirect if not logged in or cart is empty
  useEffect(() => {
    if (!token) {
      navigate('/login?redirect=checkout');
    } else if (cart.length === 0) {
      navigate('/cart');
    }
  }, [token, cart, navigate]);

  const { finalAmount, count } = getCartTotals();

  const [address, setAddress] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError('');

    // Basic Validation
    if (!address.name || !address.phone || !address.street || !address.city || !address.state || !address.pincode) {
      setError('Please fill in all address fields.');
      return;
    }

    setProcessing(true);

    // Simulate network delay for payment processing
    setTimeout(async () => {
      const res = await placeOrder(address, paymentMethod);
      setProcessing(false);
      
      if (res.success) {
        navigate('/orders?success=true');
      } else {
        setError(res.message || 'Failed to place order.');
      }
    }, 2000);
  };

  return (
    <div className="checkout-page container animate-fade-in">
      <h2 className="checkout-main-title">Secure Checkout</h2>

      {processing ? (
        <div className="payment-processing flex flex-column align-center justify-center">
          <Loader2 size={60} className="spinner" />
          <h3>Processing Secure Payment...</h3>
          <p>Please do not refresh the page or click back.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmitOrder} className="checkout-grid">
          
          {/* Left Column: Address and Payment */}
          <div className="checkout-details-section">
            
            {/* Address Form Card */}
            <div className="checkout-card">
              <h3 className="card-title flex align-center">
                <Truck size={20} className="card-icon" />
                1. Delivery Address
              </h3>
              <hr />
              
              <div className="address-form-grid">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={address.name}
                    onChange={handleInputChange}
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={address.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number"
                    pattern="[0-9]{10}"
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="street">Street Address / House No.</label>
                  <textarea
                    id="street"
                    name="street"
                    value={address.street}
                    onChange={handleInputChange}
                    placeholder="Address (Area and Street)"
                    rows="3"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={address.city}
                    onChange={handleInputChange}
                    placeholder="City/Town"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="state">State</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={address.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="pincode">Pin Code</label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={address.pincode}
                    onChange={handleInputChange}
                    placeholder="6-digit PIN code"
                    pattern="[0-9]{6}"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="checkout-card mt-24">
              <h3 className="card-title flex align-center">
                <CreditCard size={20} className="card-icon" />
                2. Select Payment Method
              </h3>
              <hr />
              
              <div className="payment-options">
                <label className={`payment-option-label ${paymentMethod === 'UPI' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                  />
                  <div className="payment-details-text">
                    <strong>UPI (Google Pay, PhonePe, Paytm)</strong>
                    <p>Pay instantly using your UPI ID</p>
                  </div>
                </label>

                <label className={`payment-option-label ${paymentMethod === 'CARD' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CARD"
                    checked={paymentMethod === 'CARD'}
                    onChange={() => setPaymentMethod('CARD')}
                  />
                  <div className="payment-details-text">
                    <strong>Credit / Debit / ATM Card</strong>
                    <p>Visa, MasterCard, RuPay supported</p>
                  </div>
                </label>

                <label className={`payment-option-label ${paymentMethod === 'COD' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                  />
                  <div className="payment-details-text">
                    <strong>Cash on Delivery (COD)</strong>
                    <p>Pay in cash when order is delivered</p>
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary & Action */}
          <div className="checkout-summary-section">
            <div className="checkout-summary-card">
              <h3>ORDER SUMMARY</h3>
              <hr />
              
              <div className="checkout-items-preview">
                {cart.map(item => (
                  <div key={item.product.id} className="preview-item flex align-center justify-between">
                    <span className="preview-title" title={item.product.title}>
                      {item.product.shortTitle} <strong>x {item.qty}</strong>
                    </span>
                    <span className="preview-cost">₹{(item.product.price.cost * item.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <hr className="dashed-hr" />
              
              <div className="total-amount-row flex justify-between">
                <span>Total Amount ({count} items)</span>
                <span>₹{finalAmount.toLocaleString()}</span>
              </div>
              
              {error && <div className="checkout-error-msg">{error}</div>}

              <button type="submit" className="btn-confirm-order">
                CONFIRM ORDER
              </button>

              <div className="security-assurance flex align-center justify-center">
                <ShieldCheck size={16} />
                <span>Safe and Secure Payments. 100% Authentic products.</span>
              </div>
            </div>
          </div>

        </form>
      )}
    </div>
  );
};

export default Checkout;
