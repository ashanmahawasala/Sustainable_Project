import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import myLogo from '../../assets/logo03.png';

const LandingPageHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'How It Works', path: '/#how-it-works' },
    { name: 'Services', path: '/#services' },
    { name: 'Impact', path: '/#impact' },
    { name: 'About Us', path: '/#about' },
    { name: 'Contact', path: '/#contact' },
  ];

  // ✅ Fix: proper useEffect usage (no error now)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#0f55a7] from-50% to-[#4db848] shadow-md">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">

          {/* Logo */}
          <div className="flex-1 flex justify-start">
            <Link to="/" className="flex items-center space-x-2 group">
              <img
                src={myLogo}
                alt="EcoCycle Logo"
                className="h-6 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex flex-1 justify-center">
            <nav className="flex items-center space-x-6 xl:space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.path}
                  className="relative text-[15px] font-[300] tracking-wide py-1 border-b-2 border-transparent text-white/90 hover:border-white hover:text-white transition-all duration-200 whitespace-nowrap"
                >
                  {link.name}
                </a>
              ))}
            </nav>
          </div>

          {/* Right Side */}
          <div className="flex-1 flex justify-end items-center gap-4">

            {/* Search */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="flex items-center">
                <div
                  className={`overflow-hidden transition-all duration-300 flex items-center bg-white/10 rounded-full ${
                    isSearchOpen
                      ? 'w-48 px-4 py-1.5 opacity-100 mr-2 border border-white/20'
                      : 'w-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <input
                    type="text"
                    placeholder="Search..."
                    autoFocus={isSearchOpen}
                    className="w-full bg-transparent text-white text-[15px] focus:outline-none placeholder:text-white/60"
                  />
                </div>

                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-1.5 text-white hover:scale-110 transition-transform duration-200"
                >
                  {isSearchOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Login + Signup */}
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-1.5 text-sm font-medium text-white border border-white/40 rounded-full hover:bg-white/10 transition"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="px-4 py-1.5 text-sm font-medium text-[#0f55a7] bg-white rounded-full hover:bg-gray-100 transition"
                >
                  Sign Up
                </Link>
              </div>
            </div>

            {/* Mobile Toggle */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-7 h-7" />
                ) : (
                  <Menu className="w-7 h-7" />
                )}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#004d99] border-t border-white/10 shadow-xl absolute w-full left-0">
          <div className="px-6 py-6 space-y-2">

            {/* Search */}
            <div className="mb-4">
              <div className="flex items-center bg-white/10 rounded-lg px-3 py-2 border border-white/20">
                <Search className="w-4 h-4 text-white/70 mr-2" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full bg-transparent text-white text-[15px] focus:outline-none placeholder:text-white/50"
                />
              </div>
            </div>

            {/* Nav Links */}
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg text-[15px] text-white/90 hover:bg-white/10 hover:text-white transition"
              >
                {link.name}
              </a>
            ))}

            {/* Mobile Login/Signup */}
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 text-white border border-white/40 rounded-lg hover:bg-white/10 transition"
              >
                Login
              </Link>

              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 bg-white text-[#0f55a7] rounded-lg hover:bg-gray-100 transition"
              >
                Sign Up
              </Link>
            </div>

          </div>
        </div>
      )}
    </header>
  );
};

export default LandingPageHeader;