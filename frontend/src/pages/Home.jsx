import React, { useContext, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import CategoryBar from '../components/CategoryBar';
import ImageSlider from '../components/ImageSlider';
import ProductCard from '../components/ProductCard';
import './Home.css';

const Home = () => {
  const { products, loading, searchQuery, selectedCategory } = useContext(ShopContext);
  const [sortOrder, setSortOrder] = useState(''); // 'low-to-high' or 'high-to-low'

  // Apply sorting local to the UI
  const sortedProducts = [...products].sort((a, b) => {
    if (sortOrder === 'low-to-high') return a.price.cost - b.price.cost;
    if (sortOrder === 'high-to-low') return b.price.cost - a.price.cost;
    return 0; // default (unsorted)
  });

  return (
    <div className="home-page">
      {/* Category Bar */}
      <CategoryBar />

      <div className="home-container container">
        {/* Banner Slider */}
        {!selectedCategory && !searchQuery && <ImageSlider />}

        {/* Catalog Section */}
        <div className="catalog-section animate-fade-in">
          <div className="catalog-header flex align-center justify-between">
            <h2 className="section-title">
              {selectedCategory ? `${selectedCategory}` : searchQuery ? `Search Results for "${searchQuery}"` : 'Deals of the Day'}
              <span className="products-count">({sortedProducts.length} items)</span>
            </h2>

            {/* Sorting Dropdown */}
            {sortedProducts.length > 0 && (
              <div className="sort-wrapper flex align-center">
                <span className="sort-label">Sort by:</span>
                <select 
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="sort-select"
                >
                  <option value="">Popularity</option>
                  <option value="low-to-high">Price: Low to High</option>
                  <option value="high-to-low">Price: High to Low</option>
                </select>
              </div>
            )}
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="skeleton-grid">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="skeleton-card">
                  <div className="skeleton-img"></div>
                  <div className="skeleton-text line-1"></div>
                  <div className="skeleton-text line-2"></div>
                </div>
              ))}
            </div>
          ) : sortedProducts.length > 0 ? (
            <div className="product-grid">
              {sortedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="no-products flex flex-column align-center">
              <img 
                src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=300&auto=format&fit=crop&q=60" 
                alt="No Products Found" 
                className="no-products-img"
              />
              <h3>Sorry, no results found!</h3>
              <p>Please check the spelling or try searching for something else.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
