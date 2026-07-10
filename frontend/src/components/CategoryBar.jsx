import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Smartphone, Laptop, Headphones, Shirt, Tv, Grid } from 'lucide-react';
import './CategoryBar.css';

const CategoryBar = () => {
  const { selectedCategory, setSelectedCategory } = useContext(ShopContext);

  const categories = [
    { name: 'All', icon: <Grid size={24} />, value: '' },
    { name: 'Mobiles', icon: <Smartphone size={24} />, value: 'Mobiles' },
    { name: 'Laptops', icon: <Laptop size={24} />, value: 'Laptops' },
    { name: 'Audio', icon: <Headphones size={24} />, value: 'Audio' },
    { name: 'Fashion', icon: <Shirt size={24} />, value: 'Fashion' },
    { name: 'Home', icon: <Tv size={24} />, value: 'Home' },
  ];

  return (
    <div className="category-bar">
      <div className="category-container container">
        {categories.map((cat, index) => {
          const isActive = (selectedCategory === cat.value);
          return (
            <button
              key={index}
              className={`category-item ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.value)}
            >
              <div className="category-icon-wrapper">
                {cat.icon}
              </div>
              <span className="category-name">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBar;
