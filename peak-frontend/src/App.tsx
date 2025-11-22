import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // This is only used for testing purposes
  
  return (
    <BrowserRouter>
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>
      <Routes>
          <Route path="/" element={<LandingPage/>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
