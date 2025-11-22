import { useState } from "react"
import Sidebar from "./Sidebar";

const Navbar = ({isLoggedIn, setIsLoggedIn}: {isLoggedIn: boolean, setIsLoggedIn: (value: boolean) => void}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-4 text-white backdrop-blur-md">
                <button className="text-2xl font-semibold bg-[#212121] hover:bg-[#1a1a1a] rounded-lg p-1" onClick={() => setIsOpen(true)}>☰</button>
                <div className="flex items-center gap-6">
                    {!isLoggedIn && (
                        <div className="flex gap-4 text-sm">
                            <a key="Register" href="/register">Sign Up!</a>
                            <a key="Log In" href="/login">Log In!</a>
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
