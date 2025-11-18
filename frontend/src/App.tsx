import { useState } from "react";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // This is only used for testing purposes

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>
      <LandingPage/>
    </>
  );
};

export default App;
