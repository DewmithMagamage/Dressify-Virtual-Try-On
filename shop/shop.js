document.addEventListener('DOMContentLoaded', function() {
  // Wishlist functionality
  const wishlistButtons = document.querySelectorAll('.wishlist-button');
  
  wishlistButtons.forEach(button => {
      button.addEventListener('click', function() {
          this.classList.toggle('active');
          const icon = this.querySelector('i');
          
          if (icon.classList.contains('far')) {
              icon.classList.remove('far');
              icon.classList.add('fas');
              showNotification('Added to wishlist!');
          } else {
              icon.classList.remove('fas');
              icon.classList.add('far');
              showNotification('Removed from wishlist!');
          }
      });
  });
  
  // Add to cart functionality
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  let cartCount = 0;
  const cartCountElement = document.querySelector('.cart span');
  
  addToCartButtons.forEach(button => {
      button.addEventListener('click', function() {
          const productCard = this.closest('.product-card');
          const productTitle = productCard.querySelector('.product-title').textContent;
          const productPrice = productCard.querySelector('.product-price').textContent;
          
          cartCount++;
          cartCountElement.textContent = cartCount;
          
          showNotification(`${productTitle} added to cart!`);
          
          // Here you would typically add the product to a cart object
          console.log('Added to cart:', {
              title: productTitle,
              price: productPrice
          });
      });
  });
  
  // Try now functionality
  const tryNowButtons = document.querySelectorAll('.try-now');
  
  tryNowButtons.forEach(button => {
      button.addEventListener('click', function() {
          const productCard = this.closest('.product-card');
          const productTitle = productCard.querySelector('.product-title').textContent;
          
          showNotification(`Virtual try-on for ${productTitle} initiated!`);
          
          // Here you would typically launch a try-on feature
          console.log('Try now initiated for:', productTitle);
      });
  });
  
  // Notification system
  function showNotification(message) {
      // Create notification element if it doesn't exist
      let notification = document.querySelector('.notification');
      
      if (!notification) {
          notification = document.createElement('div');
          notification.className = 'notification';
          document.body.appendChild(notification);
          
          // Add CSS for the notification
          const style = document.createElement('style');
          style.textContent = `
              .notification {
                  position: fixed;
                  top: 20px;
                  right: 20px;
                  background-color: #333;
                  color: white;
                  padding: 15px 25px;
                  border-radius: 5px;
                  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
                  transform: translateX(150%);
                  transition: transform 0.3s ease-out;
                  z-index: 1000;
              }
              
              .notification.show {
                  transform: translateX(0);
              }
          `;
          document.head.appendChild(style);
      }
      
      // Set message and show notification
      notification.textContent = message;
      notification.classList.add('show');
      
      // Hide notification after 3 seconds
      setTimeout(() => {
          notification.classList.remove('show');
      }, 3000);
  }
  
  // Product image hover effect (additional functionality)
  const productCards = document.querySelectorAll('.product-card');
  
  productCards.forEach(card => {
      card.addEventListener('mouseover', function() {
          const productActions = this.querySelector('.product-actions');
          if (productActions) {
              productActions.style.transform = 'translateY(0)';
          }
      });
      
      card.addEventListener('mouseout', function() {
          const productActions = this.querySelector('.product-actions');
          if (productActions) {
              productActions.style.transform = 'translateY(100%)';
          }
      });
  });
  
  // Mobile menu toggle
  const createMobileMenu = () => {
      const nav = document.querySelector('nav');
      const menuToggle = document.createElement('div');
      menuToggle.className = 'menu-toggle';
      menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
      
      nav.querySelector('.container').prepend(menuToggle);
      
      // Add CSS for mobile menu
      const style = document.createElement('style');
      style.textContent = `
          .menu-toggle {
              display: none;
              font-size: 24px;
              cursor: pointer;
          }
          
          @media (max-width: 768px) {
              .menu-toggle {
                  display: block;
              }
              
              .main-menu {
                  display: none;
                  flex-direction: column;
                  width: 100%;
                  position: absolute;
                  top: 100%;
                  left: 0;
                  background-color: #f8f9fa;
                  padding: 20px 0;
                  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
                  z-index: 100;
              }
              
              .main-menu.active {
                  display: flex;
              }
              
              nav {
                  position: relative;
              }
              
              nav .container {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
              }
          }
      `;
      document.head.appendChild(style);
      
      menuToggle.addEventListener('click', function() {
          const mainMenu = document.querySelector('.main-menu');
          mainMenu.classList.toggle('active');
      });
  };
  
  // Call the function to create mobile menu
  createMobileMenu();
});
