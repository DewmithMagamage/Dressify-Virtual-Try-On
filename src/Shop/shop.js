import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './shop.css';

const Shop = () => {
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const addToCart = (productName, productPrice) => {
    setCart((prevCart) => [...prevCart, { name: productName, price: productPrice }]);
    setTotalPrice((prevPrice) => prevPrice + productPrice);
    alert(`${productName} added to cart!`);
  };

  const showCart = () => {
    document.getElementById('cart-popup').classList.remove('hidden');
  };

  const hideCart = () => {
    document.getElementById('cart-popup').classList.add('hidden');
  };

  return (
    <div className="container">
      <h2>Shop</h2>
      <div id="cart-container">
        <button id="view-cart" onClick={showCart}>
          🛒 View Cart (<span id="cart-count">{cart.length}</span>)
        </button>
      </div>
      <div className="product-grid">
        {[
          { name: 'Product 1', price: 10, imgSrc: '../IMAGES/product1.jpg' },
          { name: 'Product 2', price: 15, imgSrc: '../IMAGES/product2.jpg' },
          { name: 'Product 3', price: 20, imgSrc: '../IMAGES/product3.jpg' },
          { name: 'Product 4', price: 12, imgSrc: '../IMAGES/product4.jpg' },
          { name: 'Product 5', price: 18, imgSrc: '../IMAGES/product5.jpg' },
          { name: 'Product 6', price: 25, imgSrc: '../IMAGES/product6.jpg' },
        ].map((product) => (
          <div key={product.name} className="product">
            <img src={product.imgSrc} alt={product.name} />
            <h3>{product.name}</h3>
            <p>${product.price.toFixed(2)}</p>
            <button className="action-btn add-to-cart" onClick={() => addToCart(product.name, product.price)}>
              Add to Cart
            </button>
            <button className="action-btn try-on">Try On</button>
          </div>
        ))}
      </div>
      <div id="cart-popup" className="hidden">
        <h3>Shopping Cart</h3>
        <div id="cart-items">
          {cart.map((item, index) => (
            <div key={index}>
              {item.name} - ${item.price.toFixed(2)}
            </div>
          ))}
        </div>
        <p id="total-price">Total: ${totalPrice.toFixed(2)}</p>
        <button id="close-cart" onClick={hideCart}>
          Close
        </button>
      </div>
    </div>
  );
};

export default Shop;
