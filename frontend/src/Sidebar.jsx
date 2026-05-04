import React from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaMapMarkedAlt, FaBook, FaPlane, FaUser } from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = () => {
  const menuItems = [
    { name: "Home", path: "/home", icon: <FaHome /> },
    { name: "Explore", path: "/explore", icon: <FaMapMarkedAlt /> },
    { name: "Bookings", path: "/bookings", icon: <FaBook /> },
    { name: "My Trips", path: "/mytrips", icon: <FaPlane /> },
    { name: "Profile", path: "/profile", icon: <FaUser /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">TravelPlanner</div>

      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.name}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                isActive ? "menu-item active" : "menu-item"
              }
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-text">{item.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
