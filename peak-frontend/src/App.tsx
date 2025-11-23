import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Questionnaire from "./pages/Questionnaire";
import Leaderboard from "./pages/Leaderboard";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // This is only used for testing purposes
  
  return (
    <BrowserRouter>
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>
      <Routes>
          <Route path="/" element={<LandingPage/>} />
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/questionnaire" element={<Questionnaire/>} />
          <Route path="/leaderboard" element={<Leaderboard/>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;