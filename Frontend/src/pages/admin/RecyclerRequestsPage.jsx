import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, CheckCircle, XCircle, Clock, Loader, Eye, MessageSquare, AlertCircle } from 'lucide-react';
import API from '../../services/api';

const RecyclerRequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    status: '',
    adminNote: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(null);

  // Check if user is admin and fetch recycler requests
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        // First check if user is logged in and is admin
        const userRes = await API.get('/admin/me');
        const userData = userRes.data.admin;

        if (userData.role !== 'ADMIN') {
          setIsAuthorized(false);
          setMessage('❌ Access denied. Only admins can access this page.');
          setTimeout(() => navigate('/admin/login'), 2000);
          return;
        }

        setIsAuthorized(true);

        // Now fetch recycler requests
        const response = await API.get('/admin/recycler-requests');
        setRequests(response.data.requests || []);
      } catch (err) {
        console.error('Error fetching recycler requests:', err);
        if (err.response?.status === 403 || err.response?.status === 401) {
          setIsAuthorized(false);
          setMessage('❌ You are not authorized to access this page. Please login as admin.');
          setTimeout(() => navigate('/admin/login'), 2000);
        } else {
          setMessage('❌ Failed to load recycler requests');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [navigate]);

  // Filter requests
  const filteredRequests = filter === 'ALL' 
    ? requests 
    : requests.filter(req => req.status === filter);

  // Handle review button click
  const handleReviewClick = (request) => {
    setSelectedRequest(request);
    setReviewData({
      status: request.status,
      adminNote: request.adminNote || '',
    });
    setShowReviewModal(true);
  };

  // Submit review
  const handleSubmitReview = async () => {
    if (!reviewData.status) {
      setMessage('Please select Approve or Reject');
      return;
    }

    setSubmitting(true);
    try {
      const response = await API.patch(`/admin/recycler-requests/${selectedRequest._id}`, {
        status: reviewData.status,
        adminNote: reviewData.adminNote,
      });

      // Update the request in the list
      setRequests(requests.map(req =>
        req._id === selectedRequest._id ? response.data.request : req
      ));

      setMessage(`✅ Request ${reviewData.status.toLowerCase()} successfully!`);
      setShowReviewModal(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to submit review';
      setMessage(`❌ ${errorMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 text-[#0f55a7] animate-spin" strokeWidth={1.5} />
          <p className="text-gray-600 font-medium">Loading recycler requests...</p>
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
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Only admins can view recycler requests.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Redirecting to admin login in a moment...
          </p>
          <button
            onClick={() => navigate('/admin/login')}
            className="px-6 py-3 bg-gradient-to-r from-[#0f55a7] to-[#4db848] text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
          >
            Go to Admin Login
          </button>
        </div>
      </div>
    );
  }

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;
  const approvedCount = requests.filter(r => r.status === 'APPROVED').length;
  const rejectedCount = requests.filter(r => r.status === 'REJECTED').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-[#0f55a7] to-[#4db848] rounded-lg">
              <Briefcase className="w-8 h-8 text-white" strokeWidth={2.0} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Recycler Requests</h1>
              <p className="text-gray-600 mt-1">Review and manage recycler partnership requests</p>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg font-medium ${
            message.includes('✅')
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow flex items-center gap-4 border-l-4 border-yellow-500">
            <Clock className="w-8 h-8 text-yellow-500" strokeWidth={1.5} />
            <div>
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow flex items-center gap-4 border-l-4 border-green-500">
            <CheckCircle className="w-8 h-8 text-green-500" strokeWidth={1.5} />
            <div>
              <p className="text-gray-600 text-sm">Approved</p>
              <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow flex items-center gap-4 border-l-4 border-red-500">
            <XCircle className="w-8 h-8 text-red-500" strokeWidth={1.5} />
            <div>
              <p className="text-gray-600 text-sm">Rejected</p>
              <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow flex items-center gap-4 border-l-4 border-blue-500">
            <Briefcase className="w-8 h-8 text-blue-500" strokeWidth={1.5} />
            <div>
              <p className="text-gray-600 text-sm">Total</p>
              <p className="text-3xl font-bold text-blue-600">{requests.length}</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6 p-4 flex gap-2 flex-wrap">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === status
                  ? 'bg-gradient-to-r from-[#0f55a7] to-[#4db848] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" strokeWidth={1} />
            <p className="text-gray-500 text-lg">No recycler requests found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Business Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Service Areas</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Submitted</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredRequests.map((request) => (
                    <tr key={request._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{request.userId?.fullName}</p>
                          <p className="text-sm text-gray-500">{request.userId?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{request.businessName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {request.serviceArea?.slice(0, 3).map((area) => (
                            <span key={area} className="inline-flex px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                              {area}
                            </span>
                          ))}
                          {request.serviceArea?.length > 3 && (
                            <span className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              +{request.serviceArea.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                          request.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : request.status === 'APPROVED'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {request.status === 'PENDING' ? (
                            <Clock className="w-4 h-4" strokeWidth={2.0} />
                          ) : request.status === 'APPROVED' ? (
                            <CheckCircle className="w-4 h-4" strokeWidth={2.0} />
                          ) : (
                            <XCircle className="w-4 h-4" strokeWidth={2.0} />
                          )}
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleReviewClick(request)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0f55a7] text-white rounded-lg hover:bg-[#0d4a94] transition font-medium"
                        >
                          <Eye className="w-4 h-4" strokeWidth={2.0} />
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y">
              {filteredRequests.map((request) => (
                <div key={request._id} className="p-4 hover:bg-gray-50 transition">
                  <div className="mb-3">
                    <p className="font-semibold text-gray-900">{request.userId?.fullName}</p>
                    <p className="text-sm text-gray-600">{request.userId?.email}</p>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Business: {request.businessName}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {request.serviceArea?.map((area) => (
                        <span key={area} className="inline-flex px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      request.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-700'
                        : request.status === 'APPROVED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {request.status === 'PENDING' ? (
                        <Clock className="w-4 h-4" strokeWidth={2.0} />
                      ) : request.status === 'APPROVED' ? (
                        <CheckCircle className="w-4 h-4" strokeWidth={2.0} />
                      ) : (
                        <XCircle className="w-4 h-4" strokeWidth={2.0} />
                      )}
                      {request.status}
                    </span>

                    <button
                      onClick={() => handleReviewClick(request)}
                      className="inline-flex items-center gap-1 px-3 py-2 bg-[#0f55a7] text-white rounded-lg hover:bg-[#0d4a94] transition text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" strokeWidth={2.0} />
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0f55a7] to-[#4db848] p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Briefcase className="w-6 h-6" strokeWidth={2.0} />
                Review Recycler Request
              </h2>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-medium text-gray-900">{selectedRequest.userId?.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{selectedRequest.userId?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{selectedRequest.userId?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Submitted Date</p>
                    <p className="font-medium text-gray-900">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Business Info */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Business Name</p>
                    <p className="font-medium text-gray-900 text-lg">{selectedRequest.businessName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                      <MapPin className="w-4 h-4" strokeWidth={2.0} />
                      Service Areas ({selectedRequest.serviceArea?.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedRequest.serviceArea?.map((area) => (
                        <span key={area} className="inline-flex px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Action */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Decision</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Choose Action</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setReviewData(prev => ({ ...prev, status: 'APPROVED' }))}
                        className={`p-4 rounded-lg border-2 transition font-medium flex items-center justify-center gap-2 ${
                          reviewData.status === 'APPROVED'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-green-300'
                        }`}
                      >
                        <CheckCircle className="w-5 h-5" strokeWidth={2.0} />
                        Approve
                      </button>
                      <button
                        onClick={() => setReviewData(prev => ({ ...prev, status: 'REJECTED' }))}
                        className={`p-4 rounded-lg border-2 transition font-medium flex items-center justify-center gap-2 ${
                          reviewData.status === 'REJECTED'
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-red-300'
                        }`}
                      >
                        <XCircle className="w-5 h-5" strokeWidth={2.0} />
                        Reject
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" strokeWidth={2.0} />
                      Admin Notes
                    </label>
                    <textarea
                      value={reviewData.adminNote}
                      onChange={(e) => setReviewData(prev => ({ ...prev, adminNote: e.target.value }))}
                      placeholder="Add notes for the user (e.g., reason for rejection, approval conditions, etc.)"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#0f55a7] focus:outline-none resize-none"
                      rows="4"
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={submitting || !reviewData.status}
                  className={`flex-1 px-6 py-3 rounded-lg text-white font-medium transition flex items-center justify-center gap-2 ${
                    submitting || !reviewData.status
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#0f55a7] to-[#4db848] hover:shadow-lg'
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" strokeWidth={2.0} />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" strokeWidth={2.0} />
                      Submit Review
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecyclerRequestsPage;
