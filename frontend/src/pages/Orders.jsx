import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { Calendar, Package, MapPin, CheckCircle } from 'lucide-react';
import './Orders.css';

const Orders = () => {
  const { fetchUserOrders, token } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Check if redirecting from a successful checkout
  const isNewOrderSuccess = new URLSearchParams(location.search).get('success') === 'true';

  useEffect(() => {
    const getOrders = async () => {
      if (token) {
        const data = await fetchUserOrders();
        setOrders(data);
      }
      setLoading(false);
    };
    getOrders();
  }, [token]);

  const formatDate = (isoStr) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusStepIndex = (status) => {
    const steps = ['Ordered', 'Shipped', 'Out for Delivery', 'Delivered'];
    return steps.indexOf(status);
  };

  if (loading) {
    return (
      <div className="orders-page container flex justify-center align-center min-h-50">
        <p>Loading order details...</p>
      </div>
    );
  }

  return (
    <div className="orders-page container animate-fade-in">
      
      {/* Dynamic Order Success Banner */}
      {isNewOrderSuccess && (
        <div className="order-success-banner flex align-center justify-between">
          <div className="success-banner-left flex align-center">
            <CheckCircle size={32} className="success-banner-icon" />
            <div>
              <h3>Order Placed Successfully!</h3>
              <p>Thank you for shopping. Your transaction was completed securely.</p>
            </div>
          </div>
        </div>
      )}

      <h2 className="orders-title">My Orders</h2>

      {orders.length === 0 ? (
        <div className="no-orders-card flex flex-column align-center">
          <Package size={60} className="no-orders-icon" />
          <h3>No Orders Found</h3>
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => {
            const currentStepIdx = getStatusStepIndex(order.orderStatus);
            const statusSteps = ['Ordered', 'Shipped', 'Out for Delivery', 'Delivered'];
            
            return (
              <div key={order.id} className="order-card">
                
                {/* Order Header */}
                <div className="order-card-header flex justify-between align-center">
                  <div className="header-info flex align-center gap-2">
                    <span className="order-id">ID: {order.id}</span>
                    <span className="order-date flex align-center gap-1">
                      <Calendar size={14} /> {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <div className="order-total">
                    Total Amount: <span className="total-amount">₹{order.pricing.finalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <hr />

                {/* Order Items */}
                <div className="order-card-body">
                  <div className="order-items-list">
                    {order.items.map(item => (
                      <div key={item.id} className="order-item flex align-center">
                        <img src={item.image} alt={item.title} className="order-item-img" />
                        <div className="order-item-details">
                          <h4>{item.title}</h4>
                          <p className="order-item-meta">
                            Price: ₹{item.price.cost.toLocaleString()} | Qty: {item.qty}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Address Summary */}
                  <div className="order-address-box flex align-center gap-2">
                    <MapPin size={18} className="address-icon" />
                    <div>
                      <strong>Delivering to:</strong> {order.shippingAddress.name} ({order.shippingAddress.phone}), {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                    </div>
                  </div>
                </div>

                <hr />

                {/* Order Tracking Progress Bar */}
                <div className="order-tracking-section">
                  <h4 className="tracking-title">Delivery Status: {order.orderStatus}</h4>
                  
                  <div className="tracking-progress-wrapper flex justify-between">
                    {statusSteps.map((step, idx) => {
                      const isCompleted = idx <= currentStepIdx;
                      const isLastCompleted = idx === currentStepIdx;
                      
                      return (
                        <div 
                          key={step} 
                          className={`progress-step flex flex-column align-center ${isCompleted ? 'completed' : ''} ${isLastCompleted ? 'active' : ''}`}
                        >
                          <div className="step-circle">
                            {isCompleted ? '✓' : idx + 1}
                          </div>
                          <span className="step-label">{step}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Progress Line */}
                  <div className="progress-bar-line">
                    <div 
                      className="progress-line-fill" 
                      style={{ width: `${(currentStepIdx / 3) * 100}%` }}
                    />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
