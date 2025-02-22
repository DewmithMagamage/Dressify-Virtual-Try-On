import React, { useState } from 'react';
import { useLocation, Link } from "react-router-dom";
import './cart.css';

const Cart = () => {
  const location = useLocation();
  const { cart } = location.state || { cart: [] };

  const [cartItems, setCartItems] = useState(cart);

  const increaseQuantity = (productName) => {
    setCartItems(cartItems.map(item => 
      item.name === productName ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  const decreaseQuantity = (productName) => {
    setCartItems(cartItems.map(item => 
      item.name === productName && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
    ));
  };

  const removeFromCart = (productName) => {
    setCartItems(cartItems.filter(item => item.name !== productName));
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);

  return (
    <div className="cart-container">
      <button className="close-btn" onClick={() => window.history.back()}>X</button>
      <h2>Your Cart</h2>
      <div className="cart-items">
        {cartItems.length > 0 ? (
          cartItems.map((item, index) => (
            <div key={index} className="cart-item">
              <p className="product-name">{item.name}</p>
              <p className="product-price">${item.price.toFixed(2)}</p>
              <div className="quantity-controls">
                <button onClick={() => increaseQuantity(item.name)}>+</button>
                <span>{item.quantity}</span>
                <button onClick={() => decreaseQuantity(item.name)}>-</button>
              </div>
              <button className="remove-btn" onClick={() => removeFromCart(item.name)}>Remove</button>
            </div>
          ))
        ) : (
          <p>Your cart is empty.</p>
        )}
      </div>
      <div className="cart-summary">
        <p>Total: ${total}</p>
        <button className="checkout-btn">Checkout</button>
      </div>
    </div>
  );
};

export default Cart;
