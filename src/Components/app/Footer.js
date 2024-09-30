import React from 'react';
import '../../assets/css/Footer.css';

const Footer = () => {
  return (
    <footer id="footer" className="footer">
      <div className="feature">
        <i className="fa-solid fa-house"></i>
        <div>
          <p>Accommodation</p>
          <small>5 days</small>
        </div>
      </div>
      <hr />
      <div className="feature">
        <i className="fa-solid fa-headphones"></i>
        <div>
          <p>Live guide</p>
          <small>available</small>
        </div>
      </div>
      <hr />
      <div className="feature">
        <i className="fa-solid fa-clock"></i>
        <div>
          <p>Easy cancellation</p>
          <small>cancel before 48 hours</small>
        </div>
      </div>
      <hr />
    </footer>
  );
};

export default Footer;
