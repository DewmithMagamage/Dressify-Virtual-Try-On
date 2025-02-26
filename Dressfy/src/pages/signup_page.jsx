import "./signup_page.css"
import Google from '../assets/Google.jpg';

export default function CreateAccount() {
  return (
    <main className="min-h-screen relative flex items-center justify-center">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-01-25%20at%2009.03.02_148449eb.jpg-gYa32vlesWaAsTjd1WcszmxGzZ2wB6.jpeg"
          alt="Luxury Bedroom"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Signup Form */}
      <div className="w-full max-w-md mx-4 p-6 bg-black/70 backdrop-blur-sm border border-gray-800 rounded-lg z-10 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="w-12 h-12">
            <img src="/logo-placeholder.png" alt="Logo" className="w-12 h-12 rounded-lg" />
          </div>
          <div className="relative inline-block">
            <select className="appearance-none bg-transparent text-white text-sm cursor-pointer pr-8 border border-gray-600 rounded px-2 py-1">
              <option value="en-US">English (US)</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>

        <div className="grid gap-4 mb-6">
          <button className="flex items-center justify-center w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
            {/* <img src="/google-icon.png" alt="Google" className="w-5 h-5 mr-2" /> */}
            Sign up with Google
          </button>
          <button className="flex items-center justify-center w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
            <img src="/facebook-icon.png" alt="Facebook" className="w-5 h-5 mr-2" />
            Sign up with Facebook
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
          <div>
            <input
              type="text"
              placeholder="Full Name"
              className="w-full px-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:border-white/40"
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Email Address"
              className="w-full px-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:border-white/40"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:border-white/40"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full px-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:border-white/40"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-white hover:bg-gray-100 text-black rounded-lg transition-colors"
          >
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <a href="/login" className="text-blue-400 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </main>
  )
}

