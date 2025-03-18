"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Logo from '../assets/Logo.jpg'

const LoadingFlashScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0)
  const [loadingComplete, setLoadingComplete] = useState(false)

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 10
        return newProgress >= 100 ? 100 : newProgress
      })
    }, 200)

    // Complete loading after set time
    const timer = setTimeout(() => {
      clearInterval(interval)
      setProgress(100)
      setLoadingComplete(true)

      // Trigger onComplete callback after exit animation
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
          className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center justify-center w-full max-w-md px-4">
            {/* Logo with pulsing animation */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.9, 1, 0.9],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 2,
                ease: "easeInOut",
              }}
              className="w-48 h-48 mb-8"
            >
              <img
                src={Logo}
                alt="Dressify Logo"
                className="w-full h-full object-contain"
              />
            </motion.div>

            {/* Brand name with shimmer effect */}
            <motion.h1
              className="text-4xl font-bold text-pink-500 mb-2 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Dressify
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "linear" }}
                style={{ opacity: 0.3 }}
              />
            </motion.h1>

            {/* Slogan */}
            <motion.p
              className="text-gray-600 text-lg mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              The future of fitting
            </motion.p>

            {/* Loading text */}
            <motion.div
              className="flex items-center justify-center mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <p className="text-gray-500 mr-2">Loading</p>
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                className="text-pink-500"
              >
                ...
              </motion.span>
            </motion.div>

            {/* Progress bar container */}
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              {/* Animated progress bar */}
              <motion.div
                className="h-full bg-pink-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", damping: 15 }}
              />
            </div>

            {/* Progress percentage */}
            <motion.p
              className="text-sm text-gray-500 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              {Math.round(progress)}%
            </motion.p>

            {/* Decorative elements - floating clothing icons */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-pink-500 opacity-20"
                  initial={{
                    x: Math.random() * 100 - 50 + "%",
                    y: "120%",
                    rotate: Math.random() * 180 - 90,
                  }}
                  animate={{
                    y: "-120%",
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
                  {["👗", "👚", "👔", "👖", "👕"][Math.floor(Math.random() * 5)]}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LoadingFlashScreen

