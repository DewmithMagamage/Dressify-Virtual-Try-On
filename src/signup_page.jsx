import React, { useState } from 'react';
import "./signup_page.css"; 
//import { Facebook } from 'lucide-react';

function CreateAccount() {
  const [language, setLanguage] = useState('en-US');

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202024-11-18%20at%2011.03.33_2b7f7a60.jpg-7Iu7timAs0g9UCerdVxqaI7zDuH43O.jpeg')`,
      }}
    >
      <div className="absolute inset-0 bg-black/60">
        <div className="container mx-auto px-4 h-screen flex flex-col">
          <header className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-pink-500 rounded-full" />
              <span className="text-white text-xl font-semibold">Dressly</span>
            </div>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="w-[140px] bg-transparent text-white border border-gray-600 rounded-md px-3 py-2"
            >
              <option value="en-US">English (US)</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </header>

          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-md bg-black/40 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
              <h1 className="text-2xl font-semibold text-white text-center mb-6">
                Create Account
              </h1>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    className="flex items-center justify-center px-4 py-2 bg-white/10 border border-gray-600 text-white hover:bg-white/20 rounded-md"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign up with Google
                  </button>
                  <button 
                    className="flex items-center justify-center px-4 py-2 bg-white/10 border border-gray-600 text-white hover:bg-white/20 rounded-md"
                  >
                    
                    Sign up with Facebook
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-black/40 px-2 text-gray-400">OR</span>
                  </div>
                </div>

                {/*  <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full px-3 py-2 bg-white/10 border border-gray-600 text-white placeholder:text-gray-400 rounded-md"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full px-3 py-2 bg-white/10 border border-gray-600 text-white placeholder:text-gray-400 rounded-md"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full px-3 py-2 bg-white/10 border border-gray-600 text-white placeholder:text-gray-400 rounded-md"
                  />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    className="w-full px-3 py-2 bg-white/10 border border-gray-600 text-white placeholder:text-gray-400 rounded-md"
                  />
                </div>*/}

                {/*<button 
                  className="w-full py-2 bg-gray-200 text-gray-900 hover:bg-gray-300 rounded-md font-medium"
                >
                  Create Account
                </button>*/}

                <p className="text-center text-gray-400">
                  Already have an account?{" "}
                  <a href="/login" className="text-blue-400 hover:underline">
                    Log in
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateAccount;