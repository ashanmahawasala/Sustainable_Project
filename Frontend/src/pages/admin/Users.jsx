import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Loader, Search, Filter, Edit, Trash2, Eye, Shield, AlertCircle, 
  ChevronDown, CheckCircle, Lock, UserCheck, Mail, Phone, MapPin 
} from 'lucide-react';
import API from '../../services/api';

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState('');
  const [newRole, setNewRole] = useState('USER');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(null);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Check authorization
        const userRes = await API.get('/admin/me');
        if (userRes.data.admin.role !== 'ADMIN') {
          setIsAuthorized(false);
          setMessage('❌ Access denied. Only admins can access this page.');
          setTimeout(() => navigate('/admin/login'), 2000);
          return;
        }
        setIsAuthorized(true);

        // Fetch all users
        const response = await API.get('/admin/users');
        setUsers(response.data.users || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        if (err.response?.status === 403 || err.response?.status === 401) {
          setIsAuthorized(false);
          setMessage('❌ Unauthorized access');
          setTimeout(() => navigate('/admin/login'), 2000);
        } else {
          setMessage('❌ Failed to load users');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  // Filter and search users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    
    const matchesStatus = 
      (statusFilter === 'ACTIVE' && !user.isBlocked && !user.deletedAt) ||
      (statusFilter === 'BLOCKED' && user.isBlocked) ||
      (statusFilter === 'DELETED' && user.deletedAt);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Update user role
  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;
    
    // Prevent changing own role
    if (selectedUser._id === JSON.parse(localStorage.getItem('user') || '{}')._id) {
      setMessage('❌ Cannot change your own role');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await API.patch(`/admin/users/${selectedUser._id}/role`, {
        role: newRole
      });

      setUsers(users.map(u => u._id === selectedUser._id ? response.data.user : u));
      setMessage(`✅ User role updated to ${newRole}`);
      setShowRoleModal(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update role';
      setMessage(`❌ ${errorMsg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Block/Unblock user
  const handleBlockUser = async () => {
    if (!selectedUser) return;

    setIsProcessing(true);
    try {
      const response = await API.patch(`/admin/users/${selectedUser._id}/block`, {
        isBlocked: !selectedUser.isBlocked
      });

      setUsers(users.map(u => u._id === selectedUser._id ? response.data.user : u));
      const action = selectedUser.isBlocked ? 'unblocked' : 'blocked';
      setMessage(`✅ User ${action} successfully`);
      setShowBlockModal(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to block user';
      setMessage(`❌ ${errorMsg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsProcessing(true);
    try {
      await API.delete(`/admin/users/${selectedUser._id}`);

      setUsers(users.map(u => u._id === selectedUser._id ? { ...u, deletedAt: new Date() } : u));
      setMessage('✅ User deleted successfully');
      setShowDeleteModal(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete user';
      setMessage(`❌ ${errorMsg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'RECYCLER':
        return 'bg-green-100 text-green-800';
      case 'USER':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Status badge
  const getStatusBadge = (user) => {
    if (user.deletedAt) {
      return <span className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full">Deleted</span>;
    }
    if (user.isBlocked) {
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Blocked</span>;
    }
    return <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 text-[#0f55a7] animate-spin" strokeWidth={1.5} />
          <p className="text-gray-600 font-medium">Loading users...</p>
        </div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-red-100 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-600" strokeWidth={2.0} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only admins can manage users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-[#0f55a7]" strokeWidth={2.0} />
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          </div>
          <p className="text-gray-600">Manage all users, their roles, and permissions</p>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-4 p-4 rounded-lg bg-opacity-10 backdrop-blur-sm">
            <p className="text-sm font-medium">{message}</p>
          </div>
        )}

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" strokeWidth={2.0} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f55a7]"
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" strokeWidth={2.0} />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f55a7]"
              >
                <option value="ALL">All Roles</option>
                <option value="USER">Users</option>
                <option value="RECYCLER">Recyclers</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <CheckCircle className="absolute left-3 top-3 w-5 h-5 text-gray-400" strokeWidth={2.0} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f55a7]"
              >
                <option value="ACTIVE">Active</option>
                <option value="BLOCKED">Blocked</option>
                <option value="DELETED">Deleted</option>
              </select>
            </div>

            {/* Count */}
            <div className="bg-gradient-to-r from-[#0f55a7] to-[#4db848] rounded-lg p-4 text-white">
              <p className="text-sm font-medium opacity-90">Total Users</p>
              <p className="text-2xl font-bold">{filteredUsers.length}</p>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#0f55a7] to-[#4db848] text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Last Login</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" strokeWidth={1.5} />
                      <p>No users found</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, idx) => (
                    <tr key={user._id} className={`border-t hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#0f55a7] to-[#4db848] flex items-center justify-center text-white font-bold">
                            {user.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.fullName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(user)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {/* View */}
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" strokeWidth={2.0} />
                          </button>

                          {/* Change Role */}
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setNewRole(user.role);
                              setShowRoleModal(true);
                            }}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Change Role"
                          >
                            <Shield className="w-4 h-4" strokeWidth={2.0} />
                          </button>

                          {/* Block/Unblock */}
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowBlockModal(true);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              user.isBlocked
                                ? 'text-green-600 hover:bg-green-50'
                                : 'text-yellow-600 hover:bg-yellow-50'
                            }`}
                            title={user.isBlocked ? 'Unblock User' : 'Block User'}
                          >
                            <Lock className="w-4 h-4" strokeWidth={2.0} />
                          </button>

                          {/* Delete */}
                          {!user.deletedAt && (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" strokeWidth={2.0} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* View Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-96 overflow-y-auto">
            <div className="bg-gradient-to-r from-[#0f55a7] to-[#4db848] p-6 text-white">
              <h2 className="text-xl font-bold">User Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Name</p>
                <p className="font-semibold text-gray-900">{selectedUser.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Email</p>
                <p className="text-gray-700">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Phone</p>
                <p className="text-gray-700">{selectedUser.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Role</p>
                <p className="font-semibold text-gray-900">{selectedUser.role}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Status</p>
                {getStatusBadge(selectedUser)}
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Email Verified</p>
                <p className="text-gray-700">{selectedUser.isEmailVerified ? '✅ Yes' : '❌ No'}</p>
              </div>
              <button
                onClick={() => setShowUserModal(false)}
                className="w-full mt-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-[#0f55a7] to-[#4db848] p-6 text-white">
              <h2 className="text-xl font-bold">Change User Role</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                Change role for <strong>{selectedUser.fullName}</strong>
              </p>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f55a7]"
              >
                <option value="USER">User</option>
                <option value="RECYCLER">Recycler</option>
                <option value="ADMIN">Admin</option>
              </select>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateRole}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#0f55a7] to-[#4db848] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isProcessing ? '...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Block Modal */}
      {showBlockModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className={`p-6 text-white ${selectedUser.isBlocked ? 'bg-green-600' : 'bg-yellow-600'}`}>
              <h2 className="text-xl font-bold">
                {selectedUser.isBlocked ? 'Unblock User' : 'Block User'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                Are you sure you want to <strong>{selectedUser.isBlocked ? 'unblock' : 'block'}</strong> {selectedUser.fullName}?
              </p>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlockUser}
                  disabled={isProcessing}
                  className={`flex-1 px-4 py-2 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 ${
                    selectedUser.isBlocked ? 'bg-green-600' : 'bg-yellow-600'
                  }`}
                >
                  {isProcessing ? '...' : (selectedUser.isBlocked ? 'Unblock' : 'Block')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-red-600 p-6 text-white">
              <h2 className="text-xl font-bold">Delete User</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-red-600 font-semibold">⚠️ This action cannot be undone</p>
              <p className="text-gray-700">
                Are you sure you want to delete <strong>{selectedUser.fullName}</strong>?
              </p>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isProcessing ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;
