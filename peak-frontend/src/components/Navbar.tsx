import { useState } from "react"
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";

const Navbar = ({isLoggedIn, setIsLoggedIn}: {isLoggedIn: boolean, setIsLoggedIn: (value: boolean) => void}) => {
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated } = useAuth();

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-4 text-white backdrop-blur-md">
                <button className="text-2xl font-semibold bg-[#212121] hover:bg-[#1a1a1a] rounded-lg p-1" onClick={() => setIsOpen(true)}>☰</button>
                <div className="flex items-center gap-6">
                    {!isAuthenticated && (
                        <div className="flex gap-4 text-sm">
                            <Link to="/register">Sign Up!</Link>
                            <Link to="/login">Log In!</Link>
                        </div>
                    )}
                    <span className="text-xl font-semibold">PEAK.</span>
                </div>
            </nav>

            <Sidebar isOpen={isOpen} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} onClose={() => setIsOpen(false)}/>
        </>
    );
};

export default Navbar;
