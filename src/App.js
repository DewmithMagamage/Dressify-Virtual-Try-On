import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './Home/home';
import Profile from './Profile/profile';
import Shop from './Shop/shop';
import Login from "./Signup&login/login";
import Signup from "./Signup&login/signup";
import TryOn from './Image Uploading/try-on';
import Navbar from './Components/navbar';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar /> {/* Add Navbar */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/try-on" element={<TryOn />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
