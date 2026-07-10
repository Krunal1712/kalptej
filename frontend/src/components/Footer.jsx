import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top container">
        <div className="footer-section">
          <h4>ABOUT</h4>
          <ul>
            <li><a href="#about">Contact Us</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#about">Careers</a></li>
            <li><a href="#about">Kalptaj Stories</a></li>
            <li><a href="#about">Press</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>HELP</h4>
          <ul>
            <li><a href="#help">Payments</a></li>
            <li><a href="#help">Shipping</a></li>
            <li><a href="#help">Cancellation & Returns</a></li>
            <li><a href="#help">FAQ</a></li>
            <li><a href="#help">Report Infringement</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>CONSUMER POLICY</h4>
          <ul>
            <li><a href="#policy">Return Policy</a></li>
            <li><a href="#policy">Terms Of Use</a></li>
            <li><a href="#policy">Security</a></li>
            <li><a href="#policy">Privacy</a></li>
            <li><a href="#policy">Sitemap</a></li>
          </ul>
        </div>
        <div className="footer-section footer-contact">
          <h4>Mail Us:</h4>
          <p>Kalptaj Internet Private Limited,</p>
          <p>Buildings Alyssa, Begonia &</p>
          <p>Clove Embassy Tech Village,</p>
          <p>Bengaluru, 560103,</p>
          <p>Karnataka, India</p>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-bottom-container container">
          <p>&copy; {new Date().getFullYear()} Kalptaj Clone. Created with React & Node.js.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
