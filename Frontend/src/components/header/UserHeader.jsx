import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Menu, X, Briefcase, CheckCircle, XCircle, Settings, Home, LogOut } from 'lucide-react';
import myLogo from '../../assets/logo03.png';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const UserHeader = () => {
  const navigate = useNavigate();
  const { logout, user, updateUser } = useAuth();
  const profileMenuRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showRecyclerModal, setShowRecyclerModal] = useState(false);
  const [recyclerRequest, setRecyclerRequest] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [prevUserRole, setPrevUserRole] = useState(null);
  const location = useLocation();

  // Toast notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await API.post('/users/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      logout();
      navigate('/');
    }
  };

  // Close profile menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!isProfileMenuOpen) return;
      const node = profileMenuRef.current;
      if (node && !node.contains(e.target)) setIsProfileMenuOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen]);

  // Fetch user data and recycler request status
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await API.get('/users/me');
        const currentRole = userRes.data.user.role;
        
        // Update context with fresh user data
        updateUser(userRes.data.user);

        // ✅ Detect role change from USER to RECYCLER (Approval happened!)
        if (prevUserRole === 'USER' && currentRole === 'RECYCLER') {
          setIsApproved(true);
          showNotification('🎉 Congratulations! Your recycler request has been approved!', 'success');
          
          // Auto-redirect to recycler dashboard after 8 seconds
          setTimeout(() => {
            navigate('/recycler/dashboard');
          }, 8000);
        }

        setPrevUserRole(currentRole);

        // Only fetch recycler request if user is not already a recycler
        if (currentRole === 'USER') {
          try {
            const recyclerRes = await API.get('/users/recycler-request/me');
            setRecyclerRequest(recyclerRes.data.request);

            // ✅ Detect rejection
            if (recyclerRes.data.request?.status === 'REJECTED') {
              showNotification('❌ Your recycler request was rejected. You can resubmit.', 'error');
            }
          } catch (err) {
            // 404 is expected if no recycler request exists yet
            if (err.response?.status !== 404) {
              console.error('Error fetching recycler request:', err);
            }
            setRecyclerRequest(null);
          }
        } else {
          setRecyclerRequest(null);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    // Fetch immediately on mount
    fetchData();

    // ✅ Set up polling - refresh every 20 seconds
    const interval = setInterval(fetchData, 20000);

    // Cleanup interval when component unmounts
    return () => clearInterval(interval);
  }, [prevUserRole, navigate]);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Home', path: '/user' },
    { name: 'My Items', path: '/user/items' },
    { name: 'Profile', path: '/profile' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#0f55a7] from-50% to-[#4db848] shadow-md">

      {/* ✅ Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[999] px-6 py-4 rounded-lg shadow-lg animate-slideIn flex items-center gap-3 ${
          notification.type === 'success'
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" strokeWidth={2.0} />
          ) : (
            <XCircle className="w-5 h-5 flex-shrink-0" strokeWidth={2.0} />
          )}
          <span className="font-[300] text-[14px]">{notification.message}</span>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">

        <div className="flex items-center justify-between h-14 md:h-16">

          <div className="flex-1 flex justify-start">
            <Link to="/user" className="flex items-center space-x-2 group">
              <img
                src={myLogo}
                alt="logo"
                className="h-6 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
          </div>

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

          <div className="flex-1 flex justify-end items-center gap-4">
            {/* Become Recycler Button - Only show if USER role */}
            {user?.role === 'USER' && !isApproved && (
              <button
                onClick={() => setShowRecyclerModal(true)}
                className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-lg font-[300] text-[14px] tracking-wide transition-all duration-200 ${
                  recyclerRequest?.status === 'PENDING'
                    ? 'bg-yellow-500/20 text-yellow-100 hover:bg-yellow-500/30'
                    : recyclerRequest?.status === 'REJECTED'
                    ? 'bg-red-500/20 text-red-100 hover:bg-red-500/30'
                    : 'bg-white/15 text-white hover:bg-white/25'
                }`}
                title={recyclerRequest?.status ? `Status: ${recyclerRequest.status}` : 'Become a Recycler Partner'}
              >
                <Briefcase className="w-4 h-4" strokeWidth={2.0} />
                <span>
                  {recyclerRequest?.status === 'PENDING'
                    ? 'Request Pending ⏳'
                    : recyclerRequest?.status === 'REJECTED'
                    ? 'Resubmit'
                    : 'Become Recycler'}
                </span>
              </button>
            )}

            {/* ✅ Approved Button - Show briefly before redirect */}
            {isApproved && user?.role === 'RECYCLER' && (
              <button
                disabled
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg font-[300] text-[14px] tracking-wide bg-green-500/20 text-green-100 animate-pulse"
              >
                <CheckCircle className="w-4 h-4" strokeWidth={2.0} />
                <span>Approved ✅</span>
              </button>
            )}

            <div className="hidden lg:flex items-center space-x-4">
              
              {/* Profile Menu Button */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center text-white font-semibold text-sm"
                  title="Profile Menu"
                >
                  {user?.fullName?.charAt(0) || 'U'}
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl z-50 overflow-hidden">
                    {/* User Info Section */}
                    <div className="px-4 py-4 bg-gradient-to-r from-[#0f55a7] to-[#4db848] text-white">
                      <p className="font-semibold text-sm">{user?.fullName || 'User'}</p>
                      <p className="text-xs text-white/80">{user?.email || 'user@email.com'}</p>
                    </div>

                    {/* Divider */}
                    <div className="border-b border-gray-200" />

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-3 text-sm transition-colors"
                      >
                        <User className="w-4 h-4 text-gray-600" strokeWidth={2.0} />
                        <span>Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          navigate('/user/settings');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-3 text-sm transition-colors"
                      >
                        <Settings className="w-4 h-4 text-gray-600" strokeWidth={2.0} />
                        <span>Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          navigate('/user');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-3 text-sm transition-colors"
                      >
                        <Home className="w-4 h-4 text-gray-600" strokeWidth={2.0} />
                        <span>Dashboard</span>
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="border-b border-gray-200" />

                    {/* Sign Out */}
                    <button
                      onClick={() => {
                        handleLogout();
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
                className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-7 h-7" strokeWidth={2.0} /> : <Menu className="w-7 h-7" strokeWidth={2.0} />}
              </button>
            </div>
          </div>

        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#004d99] border-t border-white/10 shadow-xl absolute w-full left-0">
          <div className="px-6 py-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-[15px] font-[300] tracking-wide transition-colors ${
                  isActive(link.path)
                    ? 'bg-white/20 text-white'
                    : 'text-white/90 hover:bg-white/10 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Mobile Become Recycler Button */}
            {userData?.role === 'USER' && !isApproved && (
              <button
                onClick={() => {
                  setShowRecyclerModal(true);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg text-[15px] font-[300] tracking-wide transition-colors flex items-center gap-2 ${
                  recyclerRequest?.status === 'PENDING'
                    ? 'bg-yellow-500/20 text-yellow-100 hover:bg-yellow-500/30'
                    : recyclerRequest?.status === 'REJECTED'
                    ? 'bg-red-500/20 text-red-100 hover:bg-red-500/30'
                    : 'bg-white/15 text-white hover:bg-white/25'
                }`}
              >
                <Briefcase className="w-4 h-4" strokeWidth={2.0} />
                <span>
                  {recyclerRequest?.status === 'PENDING'
                    ? 'Request Pending ⏳'
                    : recyclerRequest?.status === 'REJECTED'
                    ? 'Resubmit'
                    : 'Become Recycler'}
                </span>
              </button>
            )}

            {/* ✅ Mobile Approved Button */}
            {isApproved && userData?.role === 'RECYCLER' && (
              <button
                disabled
                className="w-full text-left px-4 py-3 rounded-lg text-[15px] font-[300] tracking-wide flex items-center gap-2 bg-green-500/20 text-green-100 animate-pulse"
              >
                <CheckCircle className="w-4 h-4" strokeWidth={2.0} />
                <span>Approved ✅</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Recycler Request Modal */}
      {showRecyclerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-fadeIn">
            <div className="bg-gradient-to-r from-[#0f55a7] to-[#4db848] p-6 rounded-t-xl">
              <div className="flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-white" strokeWidth={2.0} />
                <h2 className="text-white text-xl font-semibold">Become a Recycler</h2>
              </div>
            </div>

            <div className="p-6">
              {recyclerRequest?.status && (
                <div className={`mb-6 p-4 rounded-lg ${
                  recyclerRequest.status === 'PENDING'
                    ? 'bg-yellow-50 border border-yellow-200'
                    : recyclerRequest.status === 'REJECTED'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-green-50 border border-green-200'
                }`}>
                  <p className={`text-sm font-medium ${
                    recyclerRequest.status === 'PENDING'
                      ? 'text-yellow-700'
                      : recyclerRequest.status === 'REJECTED'
                      ? 'text-red-700'
                      : 'text-green-700'
                  }`}>
                    Status: <strong>{recyclerRequest.status}</strong>
                  </p>
                  {recyclerRequest.adminNote && (
                    <p className="text-sm mt-2">
                      Admin Note: {recyclerRequest.adminNote}
                    </p>
                  )}
                </div>
              )}

              <p className="text-gray-600 text-sm mb-6">
                Join our network of recycling partners and help us build a sustainable future. Fill in the details below to submit your request for review.
              </p>

              <button
                onClick={() => setShowRecyclerModal(false)}
                className="w-full"
              >
                <Link
                  to="/recycler-request"
                  className="block w-full bg-gradient-to-r from-[#0f55a7] to-[#4db848] text-white py-3 rounded-lg font-medium hover:shadow-lg transition-shadow duration-200 text-center"
                >
                  Continue to Form
                </Link>
              </button>

              <button
                onClick={() => setShowRecyclerModal(false)}
                className="w-full mt-3 px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </header>
  );
};

export default UserHeader;