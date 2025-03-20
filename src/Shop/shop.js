import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import './shop.css';
import Cart from './cart';
import Wishlist from './wishlist';

const Shop = () => {
  const navigate = useNavigate();

  // State for wishlist and cart
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Cart functions
  const handleAddToCart = (product) => {
    const existingItem = cartItems.find(item => item.id === product._id);
    
    if (existingItem) {
      // If item already exists in cart, increase quantity
      setCartItems(cartItems.map(item => 
        item.id === product._id ? {...item, quantity: item.quantity + 1} : item
      ));
    } else {
      // Add new item to cart with quantity 1
      setCartItems([...cartItems, {...product, id: product._id, quantity: 1}]);
    }
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    setCartItems(cartItems.map(item => 
      item.id === productId ? {...item, quantity: newQuantity} : item
    ));
  };

  // Wishlist functions
  const handleWishlistToggle = (product) => {
    const isInWishlist = wishlistItems.some(item => item.id === product._id);
    
    if (isInWishlist) {
      // Remove from wishlist
      setWishlistItems(wishlistItems.filter(item => item.id !== product._id));
    } else {
      // Add to wishlist
      setWishlistItems([...wishlistItems, {...product, id: product._id}]);
    }
  };

  const handleRemoveFromWishlist = (productId) => {
    setWishlistItems(wishlistItems.filter(item => item.id !== productId));
  };

  // Try now fucntion
const handleTryNow = (product) => {
  navigate("/body", { 
    state: { 
      selectedProduct: product 
    }
  });
};

  return (
    <div className="shop">
      <div className="shop-header">
        <div className="shop-container">
          <div className="shop-logo">
            <h1>FASHION BUG</h1>
          </div>
          <div className="search-bar">
            <input type="text" placeholder="Search entire store here" />
            <button><img src="../IMAGES/search.png" alt="Search" className="icon"/></button>
          </div>
          <div className="user-actions">
            <button className="wishlist" onClick={() => setIsWishlistOpen(true)}>
              <img src="../IMAGES/heart-o.png" alt="Wishlist" className="icon"/> 
              {wishlistItems.length} items
            </button>
            <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
              <svg className="cart-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 1C1.44772 1 1 1.44772 1 2C1 2.55228 1.44772 3 2 3H3.21922L6.78345 17.2569C5.73276 17.7236 5 18.7762 5 20C5 21.6569 6.34315 23 8 23C9.65685 23 11 21.6569 11 20C11 19.6494 10.9398 19.3128 10.8293 19H15.1707C15.0602 19.3128 15 19.6494 15 20C15 21.6569 16.3431 23 18 23C19.6569 23 21 21.6569 21 20C21 18.3431 19.6569 17 18 17H8.78078L8.28078 15H18C20.0642 15 21.3019 13.6959 21.9887 12.2559C22.6599 10.8487 22.8935 9.16692 22.975 7.94368C23.0884 6.24014 21.6803 5 20.1211 5H5.78078L5.15951 2.51493C4.93692 1.62459 4.13696 1 3.21922 1H2ZM18 13H7.78078L6.28078 7H20.1211C20.6742 7 21.0063 7.40675 20.9794 7.81078C20.9034 8.9522 20.6906 10.3318 20.1836 11.3949C19.6922 12.4251 19.0201 13 18 13ZM18 20.9938C17.4511 20.9938 17.0062 20.5489 17.0062 20C17.0062 19.4511 17.4511 19.0062 18 19.0062C18.5489 19.0062 18.9938 19.4511 18.9938 20C18.9938 20.5489 18.5489 20.9938 18 20.9938ZM7.00617 20C7.00617 20.5489 7.45112 20.9938 8 20.9938C8.54888 20.9938 8.99383 20.5489 8.99383 20C8.99383 19.4511 8.54888 19.0062 8 19.0062C7.45112 19.0062 7.00617 19.4511 7.00617 20Z"></path>
              </svg> 
              {cartItems.reduce((total, item) => total + (item.quantity || 1), 0)} item(s)
            </button>
          </div>  
        </div>
         
        <div className="navBar">
          <div className="nav-container">
            <ul className="main-menu">
              <li><a href="#">Women</a></li>
              <li><a href="#">Men</a></li>
              <li><a href="#">Kids</a></li>
              <li><a href="#">Accessories</a></li>
              <li><a href="#">New Arrivals</a></li>
              <li><a href="#">Sale</a></li>
            </ul>
          </div>
        </div>  
      </div>  

      <main>
        <div className="product-container">
          <h2>New Arrivals</h2>
          
          {isLoading ? (
            <div className="loading">Loading products...</div>
          ) : error ? (
            <div className="error">Error: {error}</div>
          ) : (
            <div className="products">
              {products.map(product => (
                <div key={product._id} className="product-card">
                  <div className="product-image">
                    <img src={product.image} alt={product.title} />
                  </div>
                  <button 
                    className={`wishlist-btn ${wishlistItems.some(item => item.id === product._id) ? 'active' : ''}`} 
                    onClick={() => handleWishlistToggle(product)}
                  >
                    <img 
                      src={wishlistItems.some(item => item.id === product._id) ? '../IMAGES/heart-f.png' : '../IMAGES/heart-o.png'} 
                      alt="Wishlist"
                    />
                  </button>

                  <div className="product-actions">
                    <button className="shop-try-on-btn" onClick={() => handleTryNow(product)}>Try Now</button>
                    <button className="shop-cart-btn" onClick={() => handleAddToCart(product)}>Add to Cart</button>
                  </div>
                  <div className="product-info">
                    <h3>{product.title}</h3>
                    <p>{product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Cart Component */}
      <Cart 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        removeFromCart={handleRemoveFromCart}
        updateQuantity={handleUpdateQuantity}
      />

      {/* Wishlist Component */}
      <Wishlist 
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistItems={wishlistItems}
        removeFromWishlist={handleRemoveFromWishlist}
        addToCart={handleAddToCart}
      />
    </div>
  );
};

export default Shop;