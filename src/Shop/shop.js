import React, { useState } from 'react';
import { Link } from "react-router-dom";
import './shop.css';

const Shop = () => {
  const [cart, setCart] = useState([]);
  const [cartVisible, setCartVisible] = useState(false);
  const [message, setMessage] = useState("");

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 2000); 
  };

  const addToCart = (productName, productPrice) => {
    setCart((prevCart) => [...(prevCart || []), { name: productName, price: productPrice }]);
      showMessage(`${productName} added to cart!`);
  };

  const removeFromCart = (productName) => {
    setCart((prevCart) => prevCart.filter(item => item.name !== productName))
    showMessage(`${productName} removed from cart!`);
  };

  const increaseQuantity = (productName) => {
    setCart((prevCart) => 
      prevCart.map(item => 
        item.name === productName ? { ...item, quantity: (item.quantity || 1) + 1 } : item
      )
    );
  };

  const decreaseQuantity = (productName) => {
    setCart((prevCart) => 
      prevCart.map(item => 
        item.name === productName && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };
 
  return (
    <div className="container">
      <h2>Shop</h2>
      <div id="cart-container">
        <button id="view-cart" onClick={() => setCartVisible(true)}>
          🛒 View Cart ({cart.length})
        </button>
      </div>
      <div className="product-grid">
        {[
          { name: 'Product 1', price: 10, imgSrc: '../IMAGES/product1.jpeg' },
          { name: 'Product 2', price: 15, imgSrc: '../IMAGES/product2.jfif' },
          { name: 'Product 3', price: 20, imgSrc: '../IMAGES/product3.jfif' },
          { name: 'Product 4', price: 12, imgSrc: '../IMAGES/product4.jfif' },
          { name: 'Product 5', price: 18, imgSrc: '../IMAGES/product5.jfif' },
          { name: 'Product 6', price: 25, imgSrc: '../IMAGES/product6.jpg' },
        ].map((product) => (
          <div key={product.name} className="product">
            <img src={product.imgSrc} alt={product.name} />
            <h3>{product.name}</h3>
            <p>${product.price.toFixed(2)}</p>
            <button className="action-btn add-to-cart" onClick={() => addToCart(product.name, product.price)}>
              Add to Cart
            </button>

            <button className="action-btn try-on">
              <Link to="/body" style={{ textDecoration: 'none', color: 'inherit'}}>
              Try On</Link>
            </button>
          </div>
        ))}
      </div>

      {cartVisible && (
        <div id="cart-popup" className="cart-popup">
          <h3>Shopping Cart</h3>
          <div id="cart-items">
            {cart.length > 0 ? (
              cart.map((item, index) => (
                <div key={index}>
                  <p>{item.name} - ${item.price.toFixed(2)}</p>
                  <button onClick={() => increaseQuantity(item.name)}>+</button>
                  <button onClick={() => decreaseQuantity(item.name)}>-</button>
                  <button onClick={() => removeFromCart(item.name)}>Delete</button>              
                </div>
              ))
            ) : (
              <p>Your cart is empty.</p>
            )}
            </div>  
              <p id="total-price">Total: ${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</p>
              <button id="close-cart" onClick={() => setCartVisible(false)}>Close</button>
          </div>    
        )}

        {message && <div className="popup">{message} </div>}
      </div>      
    );
  };

export default Shop;
