import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Clock, Edit2, Save, X, 
  AlertCircle, CheckCircle, Loader, Key, Trash2, Leaf, Zap
} from 'lucide-react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// Password validation helper function
const validatePassword = (password) => {
  const requirements = {
    minLength: password.length >= 6,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const allRequirementsMet = Object.values(requirements).every(req => req);

  if (!allRequirementsMet) {
    const missingRequirements = [];
    if (!requirements.minLength) missingRequirements.push('at least 6 characters');
    if (!requirements.hasLowercase) missingRequirements.push('a lowercase letter');
    if (!requirements.hasUppercase) missingRequirements.push('an uppercase letter');
    if (!requirements.hasNumber) missingRequirements.push('a number');
    if (!requirements.hasSpecialChar) missingRequirements.push('a special character');

    return {
      isValid: false,
      message: `Password must contain: ${missingRequirements.join(', ')}`,
    };
  }

  return { isValid: true, message: '' };
};

const UserProfile = () => {
  const navigate = useNavigate();
  const { logout, updateUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editSection, setEditSection] = useState(null);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await API.get('/users/me');
        setUserData(response.data.user);
        setFormData(response.data.user);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setMessage('❌ Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle address input change
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const updateData = {
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address
      };

      const response = await API.patch('/users/me', updateData);
      setUserData(response.data.user);
      updateUser(response.data.user);
      setMessage('✅ Profile updated successfully');
      setIsEditing(false);
      setEditSection(null);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update profile';
      setMessage(`❌ ${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('❌ Passwords do not match');
      return;
    }

    const passwordValidation = validatePassword(passwordForm.newPassword);
    if (!passwordValidation.isValid) {
      setMessage(`❌ ${passwordValidation.message}`);
      return;
    }

    setIsSaving(true);
    try {
      await API.patch('/users/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      setMessage('✅ Password changed successfully');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to change password';
      setMessage(`❌ ${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    setIsSaving(true);
    try {
      await API.delete('/users/me');
      
      logout();
      
      setMessage('✅ Account deleted successfully');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete account';
      setMessage(`❌ ${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="p-3 bg-emerald-100/60 rounded-full">
            <Loader className="w-8 h-8 text-emerald-700 animate-spin" strokeWidth={1.5} />
          </div>
          <p className="text-slate-700 font-semibold">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100/80 rounded-xl">
                  <User className="w-7 h-7 text-emerald-700" strokeWidth={2.0} />
                </div>
                My Profile
              </h1>
              <p className="text-slate-600 mt-2 text-base">Manage your account information, security, and preferences</p>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.includes('✅') 
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800' 
              : 'border-red-200 bg-red-50 text-red-800'
          }`}>
            <p className="text-sm font-medium">{message}</p>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          {/* Header Section */}
          <div className="bg-linear-to-r from-emerald-600 via-emerald-700 to-cyan-600 p-8 text-white">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-white/15 flex items-center justify-center text-3xl font-bold border border-white/20 backdrop-blur-sm">
                {userData?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold">{userData?.fullName}</h2>
                <p className="text-white/85 text-base mt-1">{userData?.email}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold border border-white/20">
                    {userData?.role === 'user' ? '👤 Regular User' : userData?.role}
                  </span>
                  {userData?.isEmailVerified && (
                    <span className="inline-block px-3 py-1 bg-emerald-400/30 backdrop-blur-sm rounded-full text-xs font-semibold border border-emerald-300/50 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" strokeWidth={2.0} />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="p-8 border-b border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                <div className="p-2 bg-emerald-100/60 rounded-lg">
                  <User className="w-5 h-5 text-emerald-700" strokeWidth={2.0} />
                </div>
                Personal Information
              </h3>
              {!isEditing && (
                <button
                  onClick={() => {
                    setEditSection('personal');
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all font-medium text-sm"
                >
                  <Edit2 className="w-4 h-4" strokeWidth={2.0} />
                  Edit
                </button>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Full Name</label>
                {isEditing && editSection === 'personal' ? (
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                  />
                ) : (
                  <p className="text-slate-900 font-medium">{userData?.fullName}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Phone Number</label>
                {isEditing && editSection === 'personal' ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                  />
                ) : (
                  <p className="text-slate-900 font-medium">{userData?.phone || '—'}</p>
                )}
              </div>

              {/* Email */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Email Address</label>
                <div className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-slate-900 font-medium truncate">{userData?.email}</p>
                  {userData?.isEmailVerified && (
                    <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold whitespace-nowrap">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {isEditing && editSection === 'personal' && (
              <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" strokeWidth={2.0} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditSection(null);
                    setFormData(userData);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium text-sm"
                >
                  <X className="w-4 h-4" strokeWidth={2.0} />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Address Section */}
          <div className="p-8 border-b border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                <div className="p-2 bg-cyan-100/60 rounded-lg">
                  <MapPin className="w-5 h-5 text-cyan-700" strokeWidth={2.0} />
                </div>
                Address Information
              </h3>
              {!isEditing && (
                <button
                  onClick={() => {
                    setEditSection('address');
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all font-medium text-sm"
                >
                  <Edit2 className="w-4 h-4" strokeWidth={2.0} />
                  Edit
                </button>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Street */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Street Address</label>
                {isEditing && editSection === 'address' ? (
                  <input
                    type="text"
                    name="street"
                    value={formData.address?.street || ''}
                    onChange={handleAddressChange}
                    placeholder="Enter street address"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                  />
                ) : (
                  <p className="text-slate-900 font-medium">{userData?.address?.street || '—'}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">City</label>
                {isEditing && editSection === 'address' ? (
                  <input
                    type="text"
                    name="city"
                    value={formData.address?.city || ''}
                    onChange={handleAddressChange}
                    placeholder="Enter city"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                  />
                ) : (
                  <p className="text-slate-900 font-medium">{userData?.address?.city || '—'}</p>
                )}
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">District</label>
                {isEditing && editSection === 'address' ? (
                  <input
                    type="text"
                    name="district"
                    value={formData.address?.district || ''}
                    onChange={handleAddressChange}
                    placeholder="Enter district"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                  />
                ) : (
                  <p className="text-slate-900 font-medium">{userData?.address?.district || '—'}</p>
                )}
              </div>

              {/* Province */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Province</label>
                {isEditing && editSection === 'address' ? (
                  <input
                    type="text"
                    name="province"
                    value={formData.address?.province || ''}
                    onChange={handleAddressChange}
                    placeholder="Enter province"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                  />
                ) : (
                  <p className="text-slate-900 font-medium">{userData?.address?.province || '—'}</p>
                )}
              </div>

              {/* Postal Code */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Postal Code</label>
                {isEditing && editSection === 'address' ? (
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.address?.postalCode || ''}
                    onChange={handleAddressChange}
                    placeholder="Enter postal code"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                  />
                ) : (
                  <p className="text-slate-900 font-medium">{userData?.address?.postalCode || '—'}</p>
                )}
              </div>
            </div>

            {isEditing && editSection === 'address' && (
              <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" strokeWidth={2.0} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditSection(null);
                    setFormData(userData);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium text-sm"
                >
                  <X className="w-4 h-4" strokeWidth={2.0} />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Impact & Contributions Section */}
          <div className="p-8 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-100/60 rounded-lg">
                <Leaf className="w-5 h-5 text-emerald-700" strokeWidth={2.0} />
              </div>
              Environmental Impact
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-6 border border-emerald-200/50">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-emerald-100/70 rounded-lg">
                    <Zap className="w-6 h-6 text-emerald-700" strokeWidth={2.0} />
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-200/50 px-2.5 py-1 rounded-full">Submitted</span>
                </div>
                <p className="text-sm font-medium text-slate-600 mb-1">E-Waste Items</p>
                <p className="text-3xl font-bold text-slate-900">0</p>
                <p className="text-xs text-slate-600 mt-2">Items submitted for recycling</p>
              </div>

              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-xl p-6 border border-cyan-200/50">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-cyan-100/70 rounded-lg">
                    <MapPin className="w-6 h-6 text-cyan-700" strokeWidth={2.0} />
                  </div>
                  <span className="text-xs font-bold text-cyan-700 bg-cyan-200/50 px-2.5 py-1 rounded-full">Active</span>
                </div>
                <p className="text-sm font-medium text-slate-600 mb-1">Pickup Requests</p>
                <p className="text-3xl font-bold text-slate-900">0</p>
                <p className="text-xs text-slate-600 mt-2">Requests scheduled</p>
              </div>
            </div>
          </div>

          {/* Activity Section */}
          <div className="p-8 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100/60 rounded-lg">
                <Clock className="w-5 h-5 text-blue-700" strokeWidth={2.0} />
              </div>
              Account Activity
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-sm font-medium text-slate-600">Last Login</span>
                <span className="font-semibold text-slate-900">{userData?.lastLogin ? new Date(userData.lastLogin).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-sm font-medium text-slate-600">Member Since</span>
                <span className="font-semibold text-slate-900">{userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</span>
              </div>
            </div>
          </div>

          {/* Account Settings Section */}
          <div className="p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Account Settings & Security</h3>

            <div className="space-y-3">
              {/* Change Password */}
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all border border-slate-200 group"
              >
                <span className="flex items-center gap-4 text-slate-900">
                  <div className="p-2.5 bg-blue-100/60 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <Key className="w-5 h-5 text-blue-700" strokeWidth={2.0} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm">Change Password</p>
                    <p className="text-xs text-slate-500 mt-0.5">Update your account password</p>
                  </div>
                </span>
                <span className="text-slate-400 group-hover:text-slate-600 transition-colors">→</span>
              </button>

              {/* Delete Account */}
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center justify-between px-5 py-4 bg-red-50 hover:bg-red-100 rounded-lg transition-all border border-red-300/50 group"
              >
                <span className="flex items-center gap-4 text-red-900">
                  <div className="p-2.5 bg-red-100/70 rounded-lg group-hover:bg-red-100 transition-colors">
                    <Trash2 className="w-5 h-5 text-red-700" strokeWidth={2.0} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm">Delete Account</p>
                    <p className="text-xs text-red-700/70 mt-0.5">Permanently delete your account and all associated data</p>
                  </div>
                </span>
                <span className="text-red-400 group-hover:text-red-600 transition-colors">→</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-linear-to-r from-blue-600 to-blue-700 p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Key className="w-6 h-6" strokeWidth={2.0} />
                </div>
                Change Password
              </h2>
              <p className="text-blue-100 text-sm mt-2">Update your password to keep your account secure</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  placeholder="Enter your current password"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  placeholder="Enter a new password (min 6 characters)"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  placeholder="Confirm your new password"
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordChange}
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-br from-red-600 to-red-700 p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <AlertCircle className="w-6 h-6" strokeWidth={2.0} />
                </div>
                Delete Account
              </h2>
              <p className="text-red-100 text-sm mt-2">This action cannot be undone</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-medium">⚠️ Warning</p>
                <p className="text-sm text-red-700 mt-2">Deleting your account will permanently remove all your profile data, submitted items, and pickup requests. This action cannot be reversed.</p>
              </div>
              <p className="text-slate-700 text-sm">
                Are you absolutely sure you want to delete your account?
              </p>
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserProfile;
