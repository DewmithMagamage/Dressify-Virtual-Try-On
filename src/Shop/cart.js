import React from 'react';
import './cart.css';

const Cart = ({ isOpen, onClose, cartItems, removeFromCart, updateQuantity, clearCart }) => {
  if (!isOpen) return null;

  // Calculate cart summary
  const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price.replace(/[^\d.]/g, '')) * item.quantity), 0);
  const delivery = subtotal > 0 ? 200 : 0;
  const total = subtotal + delivery;

  return (
    <div className="cart-overlay">
      <div className="cart-container">
        <div className="cart-header">
          <h2>Shopping Cart ({cartItems.length} items)</h2>
          <button className="cart-close-btn" onClick={onClose}>X</button>
        </div>

        <div className="cart-content">
          {cartItems.length === 0 ? (
            <div className="empty-message">Your cart is empty</div>
          ) : (
            <>
              {cartItems.map(item => (
                <div key={item.id} className="cart-item">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="cart-item-image" 
                  />
                  <div className="cart-item-details">
                    <h3 className="cart-item-title">{item.title}</h3>
                    <p className="cart-item-price">{item.price}</p>
                    <div className="cart-item-actions">
                      <div className="cart-item-quantity">
                        <button 
                          className="cart-quantity-btn"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        >
                          -
                        </button>
                        <input 
                          type="text" 
                          className="cart-quantity-input" 
                          value={item.quantity}
                          readOnly
                        />
                        <button 
                          className="cart-quantity-btn"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <span 
                        className="cart-item-remove"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remove
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="cart-summary">
                <p>
                  <span>Subtotal:</span>
                  <span>Rs {subtotal.toFixed(2)}</span>
                </p>
                <p>
                  <span>Delivery:</span>
                  <span>Rs {delivery.toFixed(2)}</span>
                </p>
                <p style={{ fontWeight: 'bold' }}>
                  <span>Total:</span>
                  <span>Rs {total.toFixed(2)}</span>
                </p>
              </div>

              <div className="cart-actions">
                <button className="btn-continue" onClick={onClose}>
                  Continue Shopping
                </button>
                <button className="btn-checkout" onClick={() => alert('Proceeding to checkout...')}>
                  Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;