import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoadingFlashScreen from "./pages/loading-flash-screen";
import CreateAccount from "./pages/signup_page";
import LoginPage from "./pages/login";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoadingFlashScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreateAccount />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;