import React from 'react';
import './wishlist.css';

const Wishlist = ({ isOpen, onClose, wishlistItems, removeFromWishlist, addToCart }) => {
  if (!isOpen) return null;

  return (
    <div className="wishlist-overlay">
      <div className="wishlist-container">
        <div className="wishlist-header">
          <h2>My Wishlist ({wishlistItems.length} items)</h2>
          <button className="wishlist-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="wishlist-content">
          {wishlistItems.length === 0 ? (
            <div className="empty-message">Your wishlist is empty</div>
          ) : (
            <>
              {wishlistItems.map(item => (
                <div key={item.id} className="wishlist-item">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="wishlist-item-image" 
                  />
                  <div className="wishlist-item-details">
                    <h3 className="wishlist-item-title">{item.title}</h3>
                    <p className="wishlist-item-price">{item.price}</p>
                    <div className="wishlist-item-actions">
                      <button 
                        className="wishlist-item-add-to-cart"
                        onClick={() => {
                          addToCart(item);
                          removeFromWishlist(item.id);
                        }}
                      >
                        Add to Cart
                      </button>
                      <button 
                        className="wishlist-item-remove"
                        onClick={() => removeFromWishlist(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="wishlist-actions">
                <button 
                  className="btn-add-all-to-cart"
                  onClick={() => {
                    wishlistItems.forEach(item => addToCart(item));
                    // Clear wishlist after adding all to cart
                    wishlistItems.forEach(item => removeFromWishlist(item.id));
                  }}
                >
                  Add All to Cart
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;