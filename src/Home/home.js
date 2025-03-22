import React, { useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../Components/ThemeContext';
import './home.css';

const Home = () => {
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    const content = document.querySelector('.content');
    content.style.opacity = 0;
    content.style.transform = 'translateY(20px)';

    setTimeout(() => {
      content.style.transition = 'opacity 1s ease, transform 1s ease';
      content.style.opacity = 1;
      content.style.transform = 'translateY(0)';
    }, 100);

    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
      button.addEventListener('mouseenter', () => {
        button.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.3)';
      });

      button.addEventListener('mouseleave', () => {
        button.style.boxShadow = 'none';
      });
    });
  }, []); 

  return (
    <section className="home-section">
      <div className={`content ${darkMode ? 'dark-mode' : ''}`}>
        <h1>General Instructions</h1>
        <p>
          Simply upload a photo of yourself, along with an image of the clothing item
          you want to try on, and enter your body measurements. The application will
          generate an avatar model to show how the clothing fits, providing a realistic
          view before purchase. Screen-reading and voice-input commands are also available,
          ensuring an inclusive experience for all users.
        </p>
        <div className="btn-group">
          <Link to="/body" className="btn">Try-On</Link>  
          <Link to="/shop" className="btn">Shop Now</Link>
        </div>
      </div>
    </section>
  );
};

export default Home;
