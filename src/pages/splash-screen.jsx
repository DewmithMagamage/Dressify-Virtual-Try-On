"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Logo from '../assets/Logo.jpg'

const SplashScreen = ({ onComplete }) => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false)
      if (onComplete) setTimeout(onComplete, 500)
    }, 2500)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-64 h-64 mb-6"
        >
          <motion.img
            src={Logo}
            alt="Dressify Logo"
            className="w-full h-full object-contain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-pink-500 mb-2">Dressify</h1>
          <p className="text-gray-600 text-lg">The future of fitting</p>
        </motion.div>

        {loading && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.8, duration: 1.5 }}
            className="h-1 bg-pink-500 mt-8 rounded-full w-48"
          />
        )}
      </div>
    </div>
  )
}

export default SplashScreen

