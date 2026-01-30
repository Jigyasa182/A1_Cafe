import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { userData, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* Left: Logo */}
        <div className="navbar-left" onClick={() => { navigate('/'); closeMenu(); }}>
          <div className="logo-container">
            <span className="logo-icon">☕</span>
            <span className="logo-text">A1 Cafe</span>
          </div>
        </div>

        {/* Desktop: Navigation Links */}
        <div className="navbar-center">
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Home
          </NavLink>
          <NavLink to="/menu" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Menu
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Cart
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Orders
          </NavLink>
        </div>

        {/* Desktop: User Action */}
        <div className="navbar-right">
          <span className="user-welcome">Hi, {userData?.name}</span>
          <button className="sign-in-btn" onClick={logout}>
            Sign Out
          </button>
        </div>

        {/* Mobile: Hamburger Toggle */}
        <div className={`navbar-toggle ${isOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        <div className="mobile-nav-links">
          <NavLink to="/" onClick={closeMenu} className={({ isActive }) => isActive ? "mobile-nav-link active" : "mobile-nav-link"}>
            Home
          </NavLink>
          <NavLink to="/menu" onClick={closeMenu} className={({ isActive }) => isActive ? "mobile-nav-link active" : "mobile-nav-link"}>
            Menu
          </NavLink>
          <NavLink to="/cart" onClick={closeMenu} className={({ isActive }) => isActive ? "mobile-nav-link active" : "mobile-nav-link"}>
            Cart
          </NavLink>
          <NavLink to="/orders" onClick={closeMenu} className={({ isActive }) => isActive ? "mobile-nav-link active" : "mobile-nav-link"}>
            Orders
          </NavLink>
        </div>

        <div className="mobile-user-actions">
          <span className="mobile-user-welcome">Hi, {userData?.name}</span>
          <button className="sign-in-btn mobile-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;