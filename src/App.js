import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './Home/home';
import Profile from './Profile/profile';
import Shop from './Shop/shop';
import Cart from './Shop/cart';
import TryOn from './Tryon/try-on';
import Body from './Upload/body';
import Clothes from './Upload/clothes';
import Navbar from './Components/navbar';
import Signup from './Signup&login/signup';
import Login from './Signup&login/login';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar /> 
        <Routes>
          <Route path="/" element={<Signup />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/body" element={<Body />} />
          <Route path="/clothes" element={<Clothes />} />
          <Route path="/try-on" element={<TryOn />} /> 
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;