import React from 'react';
import { Link } from 'react-router-dom';
import './navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <img src="/IMAGES/logo.png" alt="Logo" className="logo" />
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/shop">Shop</Link>
        <Link to="/try-on">Try On</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/login">Login</Link>
        <Link to="/signup">Sign Up</Link>
      </div>
    </nav>
  );
};

export default Navbar;