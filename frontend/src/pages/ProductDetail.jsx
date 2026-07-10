import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { Star, ShoppingCart, Zap, ShieldCheck, RefreshCw, Truck } from 'lucide-react';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { API_URL, addToCart } = useContext(ShopContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const res = await fetch(`${API_URL}/products/${id}`);
        const data = await res.json();
        if (res.ok) {
          setProduct(data);
        } else {
          setError(data.message || 'Product not found');
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Server communication failure');
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [id, API_URL]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, 1);
      navigate('/cart');
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, 1);
      navigate('/checkout');
    }
  };

  if (loading) {
    return (
      <div className="product-detail-loading container flex align-center justify-between">
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-error container flex flex-column align-center">
        <h2>Oops! Product not found.</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')} className="back-home-btn">Back to Home</button>
      </div>
    );
  }

  const { title, description, price, image, rating, specifications } = product;

  return (
    <div className="product-detail-page container animate-fade-in">
      <div className="product-detail-grid">
        
        {/* Left Column: Image and Actions */}
        <div className="detail-image-section flex flex-column">
          <div className="detail-img-container">
            <img src={image} alt={title} className="detail-img" />
          </div>
          
          <div className="detail-action-buttons">
            <button onClick={handleAddToCart} className="btn-add-cart">
              <ShoppingCart size={18} /> ADD TO CART
            </button>
            <button onClick={handleBuyNow} className="btn-buy-now">
              <Zap size={18} /> BUY NOW
            </button>
          </div>
        </div>

        {/* Right Column: Information */}
        <div className="detail-info-section">
          <h1 className="detail-title">{title}</h1>
          
          {/* Rating */}
          <div className="detail-rating">
            <span className="rating-badge-large">
              {rating.rate.toFixed(1)} <Star size={14} fill="currentColor" />
            </span>
            <span className="detail-rating-text">
              {rating.count.toLocaleString()} Ratings & Reviews
            </span>
          </div>

          {/* Pricing */}
          <div className="detail-pricing">
            <span className="detail-price">₹{price.cost.toLocaleString()}</span>
            {price.mrp > price.cost && (
              <>
                <span className="detail-mrp">₹{price.mrp.toLocaleString()}</span>
                <span className="detail-discount-percent">{price.discount}% off</span>
              </>
            )}
          </div>

          {/* Offers */}
          <div className="detail-offers">
            <h3>Available Offers</h3>
            <ul>
              <li><strong>Bank Offer:</strong> Get 10% off on SBI Credit Cards, up to ₹1,500.</li>
              <li><strong>Partner Offer:</strong> Sign up for Kalptaj Pay Later and get ₹100 worth Kalptaj Gift Card.</li>
              <li><strong>No Cost EMI:</strong> Interest-free installments starting from ₹2,500/month.</li>
            </ul>
          </div>

          {/* Description */}
          <div className="detail-description">
            <h3>Product Description</h3>
            <p>{description}</p>
          </div>

          {/* Security details badges */}
          <div className="detail-services">
            <div className="service-card flex align-center">
              <Truck size={24} className="service-icon" />
              <span>Free delivery on orders above ₹500</span>
            </div>
            <div className="service-card flex align-center">
              <RefreshCw size={24} className="service-icon" />
              <span>7 Days Replacement Policy</span>
            </div>
            <div className="service-card flex align-center">
              <ShieldCheck size={24} className="service-icon" />
              <span>1 Year Warranty</span>
            </div>
          </div>

          {/* Specifications */}
          {specifications && Object.keys(specifications).length > 0 && (
            <div className="detail-specifications">
              <h3>Specifications</h3>
              <table className="specs-table">
                <tbody>
                  {Object.entries(specifications).map(([key, val]) => (
                    <tr key={key}>
                      <td className="spec-key">{key}</td>
                      <td className="spec-value">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
