import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./LoadingFlashScreen.css";

const LoadingFlashScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [loadingComplete, setLoadingComplete] = useState(false);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 10;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 200);

    // Complete loading after set time
    const timer = setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setLoadingComplete(true);

      // Trigger onComplete callback after exit animation
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 1000);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!loadingComplete && (
        <motion.div
          className="flash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          {/* Background Image with Reduced Opacity */}
          <div className="background-container">
            <img
              src="/IMAGES/BackgroundFlashScreen.jpg"  
              alt="Background"
              className="background-image"
            />
            <div className="background-overlay"></div>
          </div>

          {/* Main Content */}
          <div className="content-container">
            {/* Floating Clothing Icons Above Logo 
            <div className="floating-icons-container">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="floating-icon"
                  initial={{
                    x: Math.random() * 100 - 50 + "%",
                    y: "100%",
                  }}
                  animate={{
                    y: "-100%",
                    rotate: Math.random() * 360 - 180,
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 15 + Math.random() * 10,
                    delay: Math.random() * 5,
                    ease: "linear",
                  }}
                  style={{ 
                    fontSize: `${30 + Math.random() * 20}px`,
                    left: `${Math.random() * 100}%`,
                  }}
                >
                  {["👗", "👚", "👔", "👖", "👕", "🧥"][i % 6]}
                </motion.div>
              ))}
            </div>*/}

            {/* Logo with Refined Pulse */}
            <motion.div
              className="logo-container"
              animate={{ scale: [1, 1.03, 1], opacity: [0.95, 1, 0.95] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            >
              <img
                src="/IMAGES/correct_logo.png" 
                alt="Dressify Logo"
                className="logo-image"
              />
            </motion.div>

            {/* Brand Name with Subtle Glow */}
            <motion.h1
              className="brand-name"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            >
              Dressify
              <motion.span
                className="brand-glow"
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              />
            </motion.h1>

            {/* Slogan with Smooth Fade */}
            <motion.p
              className="slogan"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
            >
              The Future of Fitting
            </motion.p>

            {/* Loading Text with Elegant Dots */}
            <motion.div
              className="loading-text-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <p className="loading-text">Loading</p>
              <motion.span
                className="loading-dots"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
              >
                ...
              </motion.span>
            </motion.div>

            {/* Progress Bar with Gradient */}
            <div className="progress-bar-container">
              <motion.div
                className="progress-bar"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              />
            </div>

            {/* Progress Percentage */}
            <motion.p
              className="progress-percentage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.4 }}
            >
              {Math.round(progress)}%
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingFlashScreen;