import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './ImageSlider.css';

const ImageSlider = () => {
  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&auto=format&fit=crop&q=80',
      title: 'Mega Electronics Bonanza',
      subtitle: 'Up to 40% Off on Laptops & Accessories',
      buttonText: 'Shop Now',
    },
    {
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
      title: 'Fashion Grand Fest',
      subtitle: 'Min 50% Off on Top Clothing Brands',
      buttonText: 'Explore Styles',
    },
    {
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&auto=format&fit=crop&q=80',
      title: 'Smart Home Upgrades',
      subtitle: 'Best Offers on Smart TVs & Kitchen Appliances',
      buttonText: 'Upgrade Today',
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex(prev => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex(prev => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 5000);
    return () => clearInterval(slideInterval);
  }, []);

  return (
    <div className="slider-wrapper">
      <div 
        className="slides-container"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="slide" style={{ backgroundImage: `url(${slide.image})` }}>
            <div className="slide-overlay">
              <div className="slide-content">
                <h2>{slide.title}</h2>
                <p>{slide.subtitle}</p>
                <button className="slide-cta-btn">{slide.buttonText}</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button className="slider-arrow arrow-left" onClick={prevSlide}>
        <ChevronLeft size={24} />
      </button>
      <button className="slider-arrow arrow-right" onClick={nextSlide}>
        <ChevronRight size={24} />
      </button>

      {/* Dots Indicator */}
      <div className="slider-dots">
        {slides.map((_, index) => (
          <button 
            key={index} 
            className={`slider-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
