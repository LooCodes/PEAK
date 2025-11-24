import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({isLoggedIn, isOpen, onClose, setIsLoggedIn}: {isLoggedIn: boolean, isOpen: boolean, onClose: () => void, setIsLoggedIn: (value: boolean) => void}) => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const baseLinks = [
        {label: 'Home', href:'/'},
        {label: 'Exercise', href:'/exercise'},
        {label: 'Nutrition', href: '/nutrition'}
    ];

    const authLinks = [
        {label: 'Dashboard', href:'/dashboard'},
        {label: 'Leaderboard', href:'/leaderboard'},
        {label: 'Profile', href:'/profile'}
    ];

    const links = isAuthenticated ? [...baseLinks, ...authLinks] : baseLinks;

    const handleLogout = () => {
        logout();
        setIsLoggedIn(false);
        onClose();
        navigate('/');
    };

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose}
                />
            )}

            <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#212121] text-white transform transition-transform duration-200 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-700">
                    <span className="text-lg font-semibold tracking-wide">
                        Menu
                    </span>
                    <button onClick={onClose} className="text-2xl leading-none px-2 py-1 rounded-lg hover:bg-[#1a1a1a]" aria-label="Close navigation menu">
                        ✕
                    </button>
                </div>

                <nav className="flex flex-col gap-2 px-4 py-4">
                    {links.map((link) => (
                    <Link key={link.label} to={link.href} onClick={onClose} className="px-2 py-2 rounded-lg hover:bg-[#2a2a2a] transition-colors">
                        {link.label}
                    </Link>
                    ))}

                {isAuthenticated && (
                    <button className="px-2 py-2 rounded-lg hover:bg-[#2a2a2a] text-red-400 hover:text-red-300 text-left" onClick={handleLogout}>
                        Log out
                    </button>
                )}
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
