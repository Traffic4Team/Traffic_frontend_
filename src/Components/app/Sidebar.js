import React from 'react';
import { Link } from 'react-router-dom';
import '../../assets/css/Sidebar.css'; 
import Icon from '../../images/main.png';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link to="/" className="logo">
        <img src={Icon} alt="Icon" className="logo-icon" />
          <h1>Traffic</h1>
        </Link>
      </div>
      <nav>
        <ul>
          <li><Link to="/Login">Login</Link></li>
          <li><Link to="/gpt">GPT</Link></li>
          <li><Link to="/book">Community</Link></li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
