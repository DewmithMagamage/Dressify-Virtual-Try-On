import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import './cart.css';

const Cart = ({ cart, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (Array.isArray(cart)) {
      setCartItems(cart);
    }
  }, [cart]);

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
    <div className={`cart-container ${isOpen ? 'open' : ''}`}>
      <div className="cart-items">
        <button className="close-btn" onClick={onClose}>X</button>
        <h2 className="heading1">Your Cart</h2>
      
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
              <button className="remove-btn" onClick={() => removeFromCart(item.name)}>
                <svg className="delete-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor">
                  <path d="M8 26c0 1.656 1.343 3 3 3h10c1.656 0 3-1.344 3-3l2-16h-20l2 16zM19 13h2v13h-2v-13zM15 13h2v13h-2v-13zM11 13h2v13h-2v-13zM25.5 6h-6.5c0 0-0.448-2-1-2h-4c-0.553 0-1 2-1 2h-6.5c-0.829 0-1.5 0.671-1.5 1.5s0 1.5 0 1.5h22c0 0 0-0.671 0-1.5s-0.672-1.5-1.5-1.5z" />
                </svg>
              </button>
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