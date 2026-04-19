import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, Home } from 'lucide-react';
import myLogo from '../../assets/logo03.png';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const RecyclerHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!profileMenuRef.current?.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Active nav highlight
  const isActive = (path) => {
    if (path === "/pickups") {
      return location.pathname === "/pickups";
    }
    return location.pathname.startsWith(path);
  };

  // Navigation links
  const navLinks = [
    { name: 'Home', path: '/recycler/dashboard' },
    { name: 'Pending', path: '/pickups' },
    { name: 'Accepted', path: '/pickups/accepted' },
    { name: 'Collected', path: '/pickups/collected' },
    { name: 'Completed', path: '/pickups/completed' },
  ];

  // Sign out logic
  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#0f55a7] from-50% to-[#4db848] shadow-md">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">

        <div className="flex items-center justify-between h-14 md:h-16">

          {/* LEFT: LOGO */}
          <div className="flex-1 flex justify-start">
            <Link to="/recycler/dashboard" className="flex items-center space-x-2 group">
              <img
                src={myLogo}
                className="h-6 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                alt="logo"
              />
            </Link>
          </div>

          {/* CENTER: NAV LINKS */}
          <div className="hidden lg:flex flex-1 justify-center">
            <nav className="flex space-x-8 xl:space-x-10">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-[15px] font-[300] tracking-wide py-1 border-b-2 transition-all duration-200 ${
                    isActive(link.path)
                      ? 'text-white border-white'
                      : 'text-white/90 border-transparent hover:border-white hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* RIGHT: PROFILE DROPDOWN */}
          <div className="flex-1 flex justify-end items-center">

            <div className="relative" ref={profileMenuRef}>
              {/* Profile Circle */}
              <button
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-semibold"
              >
                {user?.fullName?.charAt(0) || 'R'}
              </button>

              {/* DROPDOWN MENU */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl overflow-hidden">

                  {/* USER INFO */}
                  <div className="px-4 py-4 bg-gradient-to-r from-[#0f55a7] to-[#4db848] text-white">
                    <p className="font-semibold text-sm">
                      {user?.fullName || 'Recycler'}
                    </p>
                    <p className="text-xs text-white/80">
                      {user?.email || 'recycler@email.com'}
                    </p>
                  </div>

                  <div className="border-b" />

                  {/* MENU ITEMS */}
                  <div className="py-2">

                    <button
                      onClick={() => {
                        navigate('/recycler/profile');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-3 text-sm"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </button>

                    <button
                      onClick={() => {
                        navigate('/recycler/settings');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-3 text-sm"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>

                    <button
                      onClick={() => {
                        navigate('/recycler/dashboard');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-3 text-sm"
                    >
                      <Home className="w-4 h-4" />
                      Dashboard
                    </button>

                  </div>

                  <div className="border-b" />

                  {/* SIGN OUT */}
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-3 text-sm font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>

                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};

export default RecyclerHeader;