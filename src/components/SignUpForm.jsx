import { useState } from "react"
import { EyeIcon, EyeOffIcon, GoogleIcon, FacebookIcon } from "./Icons"
import "./SignUpForm.css"

export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className="signup-form">
      <h1>Create Account</h1>

      <div className="social-buttons">
        <button className="google-button">
          <GoogleIcon />
          Sign up with Google
        </button>
        <button className="facebook-button">
          <FacebookIcon />
          Sign up with Facebook
        </button>
      </div>

      <div className="divider">
        <span>- OR -</span>
      </div>

      <form>
        <input type="text" placeholder="Full Name" />
        <input type="email" placeholder="Email Address" />

        <div className="password-input">
          <input type={showPassword ? "text" : "password"} placeholder="Password" />
          <button type="button" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>

        <div className="password-input">
          <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" />
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>

        <button type="submit" className="submit-button">
          Create Account
        </button>
      </form>

      <p className="login-link">
        Already have an account? <a href="/login">Log In</a>
      </p>
    </div>
  )
}

