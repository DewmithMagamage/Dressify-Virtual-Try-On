import { SignUpForm } from "./components/SignUpForm.jsx"
import "./App.css"

function App() {
  return (
    <main className="app">
      <img
        src="background.jpg"
        alt="Modern bedroom interior"
        className="background-image"
      />
      <div className="content">
        <div className="header">
          <img src="/placeholder.svg" alt="Dressly Logo" className="logo" />
          <select className="language-select" defaultValue="en-US">
            <option value="en-US">English (US)</option>
          </select>
        </div>
        <SignUpForm />
      </div>
    </main>
  )
}

export default App

