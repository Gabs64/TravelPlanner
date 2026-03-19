import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaHome, FaMapMarkedAlt, FaBook, FaPlane, FaUser, FaSignInAlt } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const menuItems = [
    { name: 'Home', path: '/home', icon: <FaHome /> },
    { name: 'Explore', path: '/explore', icon: <FaMapMarkedAlt /> },
    { name: 'Bookings', path: '/bookings', icon: <FaBook /> },
    { name: 'My Trips', path: '/mytrips', icon: <FaPlane /> },
    { name: 'Profile', path: '/profile', icon: <FaUser /> },
  ];

  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);
  const menuRef = useRef(null);

  useEffect(() => {
    const index = menuItems.findIndex(item => item.path === location.pathname);
    setActiveIndex(index >= 0 ? index : 0);
  }, [location.pathname]);

  return (
    <div className="sidebar">
      <div className="sidebar-logo">TravelPlanner</div>
      <ul className="sidebar-menu" ref={menuRef}>
        {menuItems.map((item) => (
          <li key={item.name}>
            <NavLink
              to={item.path}
              className={({ isActive }) => (isActive ? 'menu-item active' : 'menu-item')}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-text">{item.name}</span>
            </NavLink>
          </li>
        ))}
        <div
          className="sidebar-indicator"
          style={{ top: `${activeIndex * 60}px` }}
        />
      </ul>
    </div>
  );
};

export default Sidebar;