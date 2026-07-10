import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { id, shortTitle, title, price, image, rating } = product;

  return (
    <Link to={`/product/${id}`} className="product-card animate-scale-in">
      <div className="product-card-img-wrapper">
        <img src={image} alt={title} className="product-card-img" loading="lazy" />
        {price.discount > 0 && (
          <span className="product-discount-badge">{price.discount}% OFF</span>
        )}
      </div>

      <div className="product-card-info">
        <h3 className="product-card-title" title={title}>{shortTitle}</h3>
        
        {/* Rating */}
        <div className="product-card-rating">
          <span className="rating-badge">
            {rating.rate.toFixed(1)} <Star size={12} fill="currentColor" />
          </span>
          <span className="rating-count">({rating.count.toLocaleString()})</span>
        </div>

        {/* Pricing */}
        <div className="product-card-pricing">
          <span className="price-cost">₹{price.cost.toLocaleString()}</span>
          {price.mrp > price.cost && (
            <>
              <span className="price-mrp">₹{price.mrp.toLocaleString()}</span>
              <span className="price-discount-percent">{price.discount}% off</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
