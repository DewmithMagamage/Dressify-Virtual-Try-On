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
          <Route path="/home" element={<PrivateRoute component={Home} />} />
          <Route path="/profile" element={<PrivateRoute component={Profile} />} />
          <Route path="/shop" element={<PrivateRoute component={Shop} />} />
          <Route path="/cart" element={<PrivateRoute component={Cart} />} />
          <Route path="/body" element={<PrivateRoute component={Body} />} />
          <Route path="/clothes" element={<PrivateRoute component={Clothes} />} />
          <Route path="/try-on" element={<PrivateRoute component={TryOn} />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;