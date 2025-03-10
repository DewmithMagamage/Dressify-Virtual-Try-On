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
import PrivateRoute from './Components/PrivateRoute';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar /> 
        <Routes>
          <Route path="/" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<PrivateRoute element={Home} />} />
          <Route path="/profile" element={<PrivateRoute element={Profile} />} />
          <Route path="/shop" element={<PrivateRoute element={Shop} />} />
          <Route path="/cart" element={<PrivateRoute element={Cart} />} />
          <Route path="/body" element={<PrivateRoute element={Body} />} />
          <Route path="/clothes" element={<PrivateRoute element={Clothes} />} />
          <Route path="/try-on" element={<PrivateRoute element={TryOn} />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;