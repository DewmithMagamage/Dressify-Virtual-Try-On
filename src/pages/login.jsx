"use client";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Logo from "../assets/Logo.jpg";

export default function LoginPage() {
  return (
    <motion.main
      className="min-h-screen relative flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img
          src={Logo} // Replace with a proper background image if needed
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Login Form */}
      <motion.div
        className="w-full max-w-md mx-4 p-6 bg-black/70 backdrop-blur-sm border border-gray-800 rounded-lg z-10 text-white"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

        {/* Social Buttons */}
        <div className="grid gap-4 mb-6">
          <button className="flex items-center justify-center w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 48 48" className="w-7 h-7 mr-2">
          <path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1565c0" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
          </svg>
              {/* Google SVG paths */}
    
            Login with Google
          </button>
          <button className="flex items-center justify-center w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 48 48" className="w-7 h-7 mr-2">
          <linearGradient id="Ld6sqrtcxMyckEl6xeDdMa_uLWV5A9vXIPu_gr1" x1="9.993" x2="40.615" y1="9.993" y2="40.615" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#2aa4f4"></stop><stop offset="1" stop-color="#007ad9"></stop></linearGradient><path fill="url(#Ld6sqrtcxMyckEl6xeDdMa_uLWV5A9vXIPu_gr1)" d="M24,4C12.954,4,4,12.954,4,24s8.954,20,20,20s20-8.954,20-20S35.046,4,24,4z"></path><path fill="#fff" d="M26.707,29.301h5.176l0.813-5.258h-5.989v-2.874c0-2.184,0.714-4.121,2.757-4.121h3.283V12.46 c-0.577-0.078-1.797-0.248-4.102-0.248c-4.814,0-7.636,2.542-7.636,8.334v3.498H16.06v5.258h4.948v14.452 C21.988,43.9,22.981,44,24,44c0.921,0,1.82-0.084,2.707-0.204V29.301z"></path>
          </svg>
              {/* Facebook SVG paths */}

            Login with Facebook
          </button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-black/70 text-gray-400">OR</span>
          </div>
        </div>

        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full px-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:border-white/40"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:border-white/40"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-600 bg-white/10 text-pink-500 focus:ring-pink-500"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-400"
              >
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="text-pink-400 hover:underline">
                Forgot password?
              </a>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don’t have an account?{" "}
          <Link to="/" className="text-pink-400 hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>

      {/* Dressify Logo in corner */}
      <motion.div
        className="absolute top-4 left-4 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <img src={Logo} alt="Dressify Logo" className="w-24 h-auto" />
      </motion.div>
    </motion.main>
  );
}