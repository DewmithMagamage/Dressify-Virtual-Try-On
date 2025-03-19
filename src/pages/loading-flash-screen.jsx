"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import logoonly from "../assets/logoonly.jpg"
import backgroundImage from "../assets/BackgroundFlashScreen.jpg"

const LoadingFlashScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0)
  const [loadingComplete, setLoadingComplete] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 10
        return newProgress >= 100 ? 100 : newProgress
      })
    }, 200)

    const timer = setTimeout(() => {
      clearInterval(interval)
      setProgress(100)
      setLoadingComplete(true)
      setTimeout(() => {
        if (onComplete) onComplete()
      }, 1000)
    }, 3000)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [onComplete])

  return (
    <AnimatePresence>
      {!loadingComplete && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 bg-gradient-to-br from-gray-50 to-pink-50 overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          {/* Background Image with Reduced Opacity */}
          <div className="absolute inset-0 w-full h-full z-0">
            <img
              src={backgroundImage || "/placeholder.svg"}
              alt="Background"
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-100/50 via-transparent to-gray-100/50" />
          </div>

          {/* Main Content */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-lg px-6">
            {/* Floating Clothing Icons Above Logo */}
            <div className="absolute top-0 left-0 right-0 h-32 overflow-hidden pointer-events-none" style={{ transform: 'translateY(-100%)' }}>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-pink-500 opacity-40"
                  initial={{
                    x: Math.random() * 100 - 50 + "%",
                    y: "100%", // Start at bottom of container
                  }}
                  animate={{
                    y: "-100%", // Move to top of container
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
            </div>

            {/* Logo with Refined Pulse */}
            <motion.div
              animate={{ scale: [1, 1.03, 1], opacity: [0.95, 1, 0.95] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              className="w-48 h-48 mb-8"
            >
              <img
                src={logoonly || "/placeholder.svg"}
                alt="Dressify Logo"
                className="w-full h-full object-contain"
              />
            </motion.div>

            {/* Brand Name with Subtle Glow */}
            <motion.h1
              className="text-5xl font-extrabold text-pink-600 mb-3 tracking-tight relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            >
              Dressify
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-pink-400 via-white to-pink-400 blur-md"
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                style={{ zIndex: -1 }}
              />
            </motion.h1>

            {/* Slogan with Smooth Fade */}
            <motion.p
              className="text-gray-700 text-xl mb-10 font-light italic"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
            >
              The Future of Fitting
            </motion.p>

            {/* Loading Text with Elegant Dots */}
            <motion.div
              className="flex items-center justify-center mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <p className="text-gray-600 font-medium mr-2">Loading</p>
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                className="text-pink-600 font-bold"
              >
                ...
              </motion.span>
            </motion.div>

            {/* Progress Bar with Gradient */}
            <div className="w-3/4 h-2 bg-gray-200/50 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-pink-400 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              />
            </div>

            {/* Progress Percentage */}
            <motion.p
              className="text-sm text-gray-600 mt-3 font-medium"
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
  )
}

export default LoadingFlashScreen