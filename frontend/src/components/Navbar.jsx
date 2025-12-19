import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { useNavigate, NavLink } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import { Home, User, LogOut, Sun, Moon, Menu } from 'lucide-react';

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const handleLogout = () => {
        dispatch(logout());
        toast.success("Logged out successfully!");
        navigate("/login");
    };

    // Fix: Path logic to match your App.jsx routes exactly
    const navItems = [
        { 
            name: 'Dashboard', 
            path: user?.role === 'admin' ? '/admin-dashboard' : user?.role === 'warden' ? '/warden-dashboard' : '/dashboard', 
            icon: Home 
        },
        { name: 'Profile', path: '/profile', icon: User },
    ];

    return (
        <nav className="bg-base-200 text-base-content shadow-lg border-b border-base-300 sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    
                    {/* Logo Section */}
                    <div className="flex items-center space-x-2">
                        <div className="animate-spin-slow cursor-pointer text-primary">
                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <span className="text-2xl font-black tracking-tighter">Hostel<span className="text-primary">360</span></span>
                    </div>

                    <div className="flex items-center space-x-3">
                        {/* Desktop Links */}
                        <div className="hidden md:flex space-x-1">
                            {user && navItems.map((item) => (
                                <NavLink 
                                    key={item.name} 
                                    to={item.path} 
                                    className={({ isActive }) => 
                                        `btn btn-sm btn-ghost gap-2 ${isActive ? 'btn-active bg-base-300' : ''}`
                                    }
                                >
                                    <item.icon size={16} /> {item.name}
                                </NavLink>
                            ))}
                        </div>
                        
                        {/* Theme Toggle */}
                        <button onClick={toggleTheme} className="btn btn-ghost btn-circle btn-sm">
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>

                        {/* User Role Badge */}
                        <div className="hidden sm:flex badge badge-primary font-bold gap-2 p-3">
                            {user?.role?.toUpperCase()}
                        </div>

                        {/* Logout */}
                        {/* Logout Button */}
                        <button 
                            onClick={handleLogout} 
                            className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#ef4444] hover:bg-[#dc2626] text-white text-sm font-bold rounded-lg shadow-md transition-all duration-200 active:scale-95 border-none"
                        >
                            <LogOut size={16} /> 
                            Logout
                        </button>

                        {/* Mobile Toggle */}
                        <button className="md:hidden btn btn-ghost btn-sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;