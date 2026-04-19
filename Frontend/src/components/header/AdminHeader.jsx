import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Menu,
  X,
  LogOut,
  User,
  Settings,
  Home,
} from 'lucide-react';
import myLogo from '../../assets/logo03.png';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const { logout, user, updateUser } = useAuth();
  const location = useLocation();
  const profileMenuRef = useRef(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [pendingRecyclerCount, setPendingRecyclerCount] = useState(0);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'E-waste List', path: '/admin/ewaste' },
    { name: 'Records', path: '/admin/logs' },
    { name: 'Users', path: '/users' },
    { name: 'Recycler Requests', path: '/admin/recycler-requests' },
    { name: 'Configuration', path: '/admin/settings' },
  ];

  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (!isProfileMenuOpen) return;
      const node = profileMenuRef.current;
      if (node && !node.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [isProfileMenuOpen]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await API.get('/admin/me');
        updateUser(response.data.admin);
      } catch (err) {
        console.error('Error fetching admin data:', err);
      }
    };

    fetchAdminData();
  }, [updateUser]);

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const response = await API.get('/admin/recycler-requests');
        const pendingRequests =
          response.data.requests?.filter((req) => req.status === 'PENDING') || [];
        setPendingRecyclerCount(pendingRequests.length);
      } catch (err) {
        console.error('Error fetching recycler requests:', err);
        setPendingRecyclerCount(0);
      }
    };

    fetchPendingCount();

    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    try {
      await API.post('/admin/logout');
    } catch {
      // ignore signout request failure
    } finally {
      setIsProfileMenuOpen(false);
      logout();
      navigate('/admin/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#0f55a7] from-50% to-[#4db848] shadow-md">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          <div className="flex-1 flex justify-start">
            <Link to="/admin/dashboard" className="flex items-center space-x-2 group">
              <img
                src={myLogo}
                alt="EcoCycle Brand Logo"
                className="h-6 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
          </div>

          <div className="hidden lg:flex flex-1 justify-center">
            <nav className="flex items-center space-x-6 xl:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative text-[15px] font-[300] tracking-wide py-1 border-b-2 transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                    isActive(link.path)
                      ? 'text-white border-white'
                      : 'text-white/90 border-transparent hover:border-white hover:text-white'
                  }`}
                >
                  <span className="whitespace-nowrap">{link.name}</span>

                  {link.name === 'Recycler Requests' && pendingRecyclerCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
                      {pendingRecyclerCount}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex-1 flex justify-end items-center gap-4">
            <div className="hidden lg:flex items-center space-x-4">
              <div className="flex items-center">
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out flex items-center bg-white/10 rounded-full ${
                    isSearchOpen
                      ? 'w-48 px-4 py-1.5 opacity-100 mr-2 border border-white/20'
                      : 'w-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <input
                    type="text"
                    placeholder="Search admin..."
                    autoFocus={isSearchOpen}
                    className="w-full bg-transparent text-white text-[15px] font-[300] tracking-wide focus:outline-none placeholder:text-white/60"
                  />
                </div>

                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-1.5 text-white hover:scale-110 transition-transform duration-200"
                >
                  {isSearchOpen ? (
                    <X className="w-5 h-5" strokeWidth={2.0} />
                  ) : (
                    <Search className="w-5 h-5" strokeWidth={2.0} />
                  )}
                </button>
              </div>

              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen((v) => !v)}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center text-white font-semibold text-sm"
                  title="Profile Menu"
                >
                  {user?.fullName?.charAt(0) || 'A'}
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl z-50 overflow-hidden">
                    <div className="px-4 py-4 bg-gradient-to-r from-[#0f55a7] to-[#4db848] text-white">
                      <p className="font-semibold text-sm">{user?.fullName || 'Admin'}</p>
                      <p className="text-xs text-white/80">
                        {user?.email || 'admin@email.com'}
                      </p>
                    </div>

                    <div className="border-b border-gray-200" />

                    <div className="py-2">
                      <button
                        onClick={() => {
                          navigate('/admin/profile');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-3 text-sm transition-colors"
                      >
                        <User className="w-4 h-4 text-gray-600" strokeWidth={2.0} />
                        <span>Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          navigate('/admin/settings');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-3 text-sm transition-colors"
                      >
                        <Settings className="w-4 h-4 text-gray-600" strokeWidth={2.0} />
                        <span>Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          navigate('/admin/dashboard');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-3 text-sm transition-colors"
                      >
                        <Home className="w-4 h-4 text-gray-600" strokeWidth={2.0} />
                        <span>Dashboard</span>
                      </button>
                    </div>

                    <div className="border-b border-gray-200" />

                    <button
                      type="button"
                      onClick={() => {
                        handleSignOut();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-3 text-sm font-medium transition-colors"
                    >
                      <LogOut className="w-4 h-4" strokeWidth={2.0} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-7 h-7" strokeWidth={2.0} />
                ) : (
                  <Menu className="w-7 h-7" strokeWidth={2.0} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#004d99] border-t border-white/10 shadow-xl absolute w-full left-0">
          <div className="px-6 py-6 space-y-2">
            <div className="mb-4">
              <div className="flex items-center bg-white/10 rounded-lg px-3 py-2 border border-white/20">
                <Search className="w-4 h-4 text-white/70 mr-2" strokeWidth={2.0} />
                <input
                  type="text"
                  placeholder="Search admin..."
                  className="w-full bg-transparent text-white text-[15px] font-[300] focus:outline-none placeholder:text-white/50"
                />
              </div>
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-[15px] font-[300] tracking-wide transition-colors ${
                  isActive(link.path)
                    ? 'bg-white/20 text-white'
                    : 'text-white/90 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="whitespace-nowrap">{link.name}</span>

                {link.name === 'Recycler Requests' && pendingRecyclerCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white bg-red-500 rounded-full ml-auto animate-pulse">
                    {pendingRecyclerCount}
                  </span>
                )}
              </Link>
            ))}

            <div className="mt-4 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="w-full flex items-center justify-center gap-2 text-red-400 bg-white/10 px-4 py-2.5 rounded-lg hover:bg-white/20 transition-all"
              >
                <LogOut className="w-4 h-4" strokeWidth={2.0} />
                <span className="font-[300] tracking-wide">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;