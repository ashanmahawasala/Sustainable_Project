import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Shield, Clock, Edit2, Save, X, 
  AlertCircle, CheckCircle, Loader, Key, Trash2
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

const AdminProfile = () => {
  const navigate = useNavigate();
  const { logout, updateUser } = useAuth();
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editSection, setEditSection] = useState(null);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Fetch admin data
  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const response = await API.get('/admin/me');
        setAdminData(response.data.admin);
        setFormData(response.data.admin);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setMessage('❌ Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
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

      const response = await API.patch('/admin/update-profile', updateData);
      const updatedAdmin = response.data.user || response.data.admin;
      setAdminData(updatedAdmin);
      updateUser(updatedAdmin);
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
      await API.post('/admin/change-password', {
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
      await API.delete('/admin/profile');
      
      logout();
      
      setMessage('✅ Account deleted successfully');
      setTimeout(() => navigate('/admin/login'), 2000);
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
          <div className="p-3 bg-purple-100/60 rounded-full">
            <Loader className="w-8 h-8 text-purple-700 animate-spin" strokeWidth={1.5} />
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
                <div className="p-2.5 bg-purple-100/80 rounded-xl">
                  <Shield className="w-7 h-7 text-purple-700" strokeWidth={2.0} />
                </div>
                Admin Profile
              </h1>
              <p className="text-slate-600 mt-2 text-base">Manage administrative access and settings</p>
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
          <div className="bg-linear-to-r from-purple-600 via-purple-700 to-indigo-600 p-8 text-white">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-white/15 flex items-center justify-center text-3xl font-bold border border-white/20 backdrop-blur-sm">
                {adminData?.fullName?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold">{adminData?.fullName}</h2>
                <p className="text-white/85 text-base mt-1">{adminData?.email}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold border border-white/20">
                    👑 {adminData?.role === 'admin' ? 'Administrator' : adminData?.role}
                  </span>
                  {adminData?.isEmailVerified && (
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
                <div className="p-2 bg-purple-100/60 rounded-lg">
                  <User className="w-5 h-5 text-purple-700" strokeWidth={2.0} />
                </div>
                Personal Information
              </h3>
              {!isEditing && (
                <button
                  onClick={() => {
                    setEditSection('personal');
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-purple-700 hover:bg-purple-50 rounded-lg transition-all font-medium text-sm"
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
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                  />
                ) : (
                  <p className="text-slate-900 font-medium">{adminData?.fullName}</p>
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
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                  />
                ) : (
                  <p className="text-slate-900 font-medium">{adminData?.phone || '—'}</p>
                )}
              </div>

              {/* Email */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Email Address</label>
                <div className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-slate-900 font-medium truncate">{adminData?.email}</p>
                  {adminData?.isEmailVerified && (
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
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" strokeWidth={2.0} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditSection(null);
                    setFormData(adminData);
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
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#0f55a7]" strokeWidth={2.0} />
                Address
              </h3>
              {!isEditing && (
                <button
                  onClick={() => {
                    setEditSection('address');
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-2 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" strokeWidth={2.0} />
                  <span className="text-sm">Edit</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Street */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Street</label>
                {isEditing && editSection === 'address' ? (
                  <input
                    type="text"
                    name="street"
                    value={formData.address?.street || ''}
                    onChange={handleAddressChange}
                    placeholder="Enter street address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f55a7]"
                  />
                ) : (
                  <p className="text-gray-700">{adminData?.address?.street || 'Not provided'}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                {isEditing && editSection === 'address' ? (
                  <input
                    type="text"
                    name="city"
                    value={formData.address?.city || ''}
                    onChange={handleAddressChange}
                    placeholder="Enter city"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f55a7]"
                  />
                ) : (
                  <p className="text-gray-700">{adminData?.address?.city || 'Not provided'}</p>
                )}
              </div>

              {/* Province & Postal */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                  {isEditing && editSection === 'address' ? (
                    <input
                      type="text"
                      name="province"
                      value={formData.address?.province || ''}
                      onChange={handleAddressChange}
                      placeholder="Province"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f55a7]"
                    />
                  ) : (
                    <p className="text-gray-700">{adminData?.address?.province || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                  {isEditing && editSection === 'address' ? (
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.address?.postalCode || ''}
                      onChange={handleAddressChange}
                      placeholder="Postal code"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f55a7]"
                    />
                  ) : (
                    <p className="text-gray-700">{adminData?.address?.postalCode || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {isEditing && editSection === 'address' && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" strokeWidth={2.0} />
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditSection(null);
                    setFormData(adminData);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <X className="w-4 h-4" strokeWidth={2.0} />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Admin Details Section */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-[#0f55a7]" strokeWidth={2.0} />
              Admin Permissions
            </h3>

            <div className="bg-blue-50 rounded-lg p-4">
              {adminData?.permissions && adminData.permissions.length > 0 ? (
                <ul className="space-y-2">
                  {adminData.permissions.map((permission, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600" strokeWidth={2.0} />
                      <span className="capitalize">{permission.replace(/_/g, ' ')}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No specific permissions assigned</p>
              )}
            </div>
          </div>

          {/* Activity Section */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-[#0f55a7]" strokeWidth={2.0} />
              Account Activity
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Last Login:</span>
                <span className="font-medium">{adminData?.lastLogin ? new Date(adminData.lastLogin).toLocaleDateString() : 'Never'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Account Created:</span>
                <span className="font-medium">{adminData?.createdAt ? new Date(adminData.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Account Settings Section */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>

            <div className="space-y-3">
              {/* Change Password */}
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              >
                <span className="flex items-center gap-3 text-gray-700">
                  <Key className="w-5 h-5 text-[#0f55a7]" strokeWidth={2.0} />
                  Change Password
                </span>
                <span className="text-gray-400">→</span>
              </button>

              {/* Delete Account */}
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center justify-between px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
              >
                <span className="flex items-center gap-3 text-red-700">
                  <Trash2 className="w-5 h-5 text-red-600" strokeWidth={2.0} />
                  Delete Account
                </span>
                <span className="text-red-400">→</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-[#0f55a7] to-[#4db848] p-6 text-white">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Key className="w-5 h-5" strokeWidth={2.0} />
                Change Password
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f55a7]"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f55a7]"
                  placeholder="Enter new password (min 6 chars)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f55a7]"
                  placeholder="Confirm new password"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordChange}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#0f55a7] to-[#4db848] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-red-600 p-6 text-white">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <AlertCircle className="w-5 h-5" strokeWidth={2.0} />
                Delete Account
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-red-600 font-semibold">⚠️ This action cannot be undone!</p>
              <p className="text-gray-700">
                Are you sure you want to permanently delete your account? All your data will be removed.
              </p>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
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

export default AdminProfile;
