import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './Home/home';
import Profile from './Profile/profile';
import Shop from './Shop/shop';
import Body from "./Upload/body";
import Clothes from "./Upload/clothes";
import Navbar from './Components/navbar';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar /> 
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/body" element={<Body />} />
          <Route path="/clothes" element={<Clothes />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
