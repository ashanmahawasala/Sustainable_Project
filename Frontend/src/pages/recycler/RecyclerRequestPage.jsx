import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, AlertCircle, CheckCircle, Loader, ArrowLeft } from 'lucide-react';
import API from '../../services/api';

const RecyclerRequestPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: '',
    serviceArea: [],
  });

  const [existingRequest, setExistingRequest] = useState(null);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({});

  // Available service areas in Sri Lanka
  const serviceAreas = [
    'Colombo',
    'Gampaha',
    'Kalutara',
    'Kandy',
    'Matara',
    'Galle',
    'Jaffna',
    'Trincomalee',
    'Batticaloa',
    'Ampara',
    'Polonnaruwa',
    'Matale',
    'Nuwara Eliya',
    'Ratnapura',
    'Kegalle',
    'Anuradhapura',
    'Mullaitivu',
  ];

  // Fetch existing request on mount
  useEffect(() => {
    const fetchRequest = async () => {
      setLoading(true);
      try {
        const response = await API.get('/users/recycler-request/me');
        if (response.data.request) {
          setExistingRequest(response.data.request);
          setFormData({
            businessName: response.data.request.businessName || '',
            serviceArea: response.data.request.serviceArea || [],
          });
          setSelectedAreas(response.data.request.serviceArea || []);
        }
      } catch (err) {
        // No existing request - that's fine
        console.log('No existing recycler request');
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, []);

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    } else if (formData.businessName.trim().length < 3) {
      newErrors.businessName = 'Business name must be at least 3 characters';
    }

    if (selectedAreas.length === 0) {
      newErrors.serviceArea = 'Select at least one service area';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle business name change
  const handleBusinessNameChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      businessName: value
    }));
    if (errors.businessName) {
      setErrors(prev => ({
        ...prev,
        businessName: ''
      }));
    }
  };

  // Handle service area toggle
  const toggleServiceArea = (area) => {
    setSelectedAreas(prev => {
      if (prev.includes(area)) {
        return prev.filter(a => a !== area);
      } else {
        return [...prev, area];
      }
    });
    if (errors.serviceArea) {
      setErrors(prev => ({
        ...prev,
        serviceArea: ''
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await API.post('/users/recycler-request', {
        businessName: formData.businessName.trim(),
        serviceArea: selectedAreas,
      });

      setSuccessMessage('✅ Recycler request submitted successfully! Admin will review your application soon.');
      setExistingRequest(response.data.request);

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/user/dashboard');
      }, 3000);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to submit request. Please try again.';
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 text-[#0f55a7] animate-spin" strokeWidth={1.5} />
          <p className="text-gray-600 font-medium">Loading your request...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate('/user/dashboard')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2.0} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-[#0f55a7] to-[#4db848] rounded-lg">
              <Briefcase className="w-6 h-6 text-white" strokeWidth={2.0} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Become a Recycler Partner</h1>
              <p className="text-gray-600 mt-1">Join our network and help build a sustainable future</p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Status Banner */}
          {existingRequest && existingRequest.status !== 'PENDING' && (
            <div className={`p-4 border-l-4 ${
              existingRequest.status === 'APPROVED'
                ? 'bg-green-50 border-green-500'
                : existingRequest.status === 'REJECTED'
                ? 'bg-red-50 border-red-500'
                : 'bg-yellow-50 border-yellow-500'
            }`}>
              <div className="flex items-start gap-3">
                {existingRequest.status === 'APPROVED' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" strokeWidth={2.0} />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" strokeWidth={2.0} />
                )}
                <div>
                  <p className={`font-semibold ${
                    existingRequest.status === 'APPROVED'
                      ? 'text-green-900'
                      : 'text-red-900'
                  }`}>
                    {existingRequest.status === 'APPROVED'
                      ? '🎉 Congratulations! Your request was approved!'
                      : '❌ Your request was not approved'}
                  </p>
                  {existingRequest.adminNote && (
                    <p className={`text-sm mt-2 ${
                      existingRequest.status === 'APPROVED'
                        ? 'text-green-700'
                        : 'text-red-700'
                    }`}>
                      <strong>Admin Note:</strong> {existingRequest.adminNote}
                    </p>
                  )}
                  {existingRequest.status === 'REJECTED' && (
                    <p className="text-sm text-red-700 mt-2">You can resubmit your request with updated information.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {existingRequest && existingRequest.status === 'PENDING' && (
            <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-yellow-200 rounded-full">
                  <Loader className="w-4 h-4 text-yellow-700 animate-spin" strokeWidth={2.0} />
                </div>
                <div>
                  <p className="font-semibold text-yellow-900">⏳ Your request is pending admin review</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Admin will review your application and notify you soon. You can update the information below while waiting.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="p-8">
            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 font-medium flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" strokeWidth={2.0} />
                  {successMessage}
                </p>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 font-medium flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" strokeWidth={2.0} />
                  {errorMessage}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Name Field */}
              <div>
                <label htmlFor="businessName" className="block text-sm font-semibold text-gray-900 mb-2">
                  Business Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="businessName"
                  value={formData.businessName}
                  onChange={handleBusinessNameChange}
                  placeholder="e.g., EcoRecycle Solutions, Green Tech Recyclers"
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none ${
                    errors.businessName
                      ? 'border-red-500 bg-red-50 focus:border-red-600'
                      : 'border-gray-300 focus:border-[#0f55a7]'
                  }`}
                />
                {errors.businessName && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" strokeWidth={2.0} />
                    {errors.businessName}
                  </p>
                )}
                <p className="text-gray-500 text-sm mt-2">Enter the official name of your recycling business</p>
              </div>

              {/* Service Area Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Service Areas <span className="text-red-600">*</span>
                </label>
                <p className="text-gray-600 text-sm mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4" strokeWidth={2.0} />
                  Select all districts where you can provide recycling services ({selectedAreas.length} selected)
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {serviceAreas.map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleServiceArea(area)}
                      className={`px-4 py-3 rounded-lg font-medium transition-all text-sm ${
                        selectedAreas.includes(area)
                          ? 'bg-gradient-to-r from-[#0f55a7] to-[#4db848] text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>

                {errors.serviceArea && (
                  <p className="text-red-600 text-sm mt-3 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" strokeWidth={2.0} />
                    {errors.serviceArea}
                  </p>
                )}
              </div>

              {/* Selected Areas Display */}
              {selectedAreas.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-2">Selected Service Areas:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAreas.map((area) => (
                      <span
                        key={area}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {area}
                        <button
                          type="button"
                          onClick={() => toggleServiceArea(area)}
                          className="hover:text-blue-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>ℹ️ Note:</strong> After submitting your request, our admin team will review your application within 2-3 business days. You'll receive an email notification about the decision.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                  submitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#0f55a7] to-[#4db848] hover:shadow-lg hover:scale-105'
                }`}
              >
                {submitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" strokeWidth={2.0} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Briefcase className="w-5 h-5" strokeWidth={2.0} />
                    Submit Recycler Request
                  </>
                )}
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => navigate('/user/dashboard')}
                className="w-full py-3 px-6 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-8 bg-white rounded-xl shadow overflow-hidden">
          <div className="p-6 bg-gray-50 border-b">
            <h2 className="text-lg font-bold text-gray-900">❓ Frequently Asked Questions</h2>
          </div>
          <div className="divide-y">
            <div className="p-6">
              <p className="font-semibold text-gray-900 mb-2">What happens after I submit the request?</p>
              <p className="text-gray-600 text-sm">
                Your request will be reviewed by our admin team. You'll receive an email notification with the decision within 2-3 business days.
              </p>
            </div>
            <div className="p-6">
              <p className="font-semibold text-gray-900 mb-2">Can I modify my request after submission?</p>
              <p className="text-gray-600 text-sm">
                Yes, you can update your business name and service areas anytime until your request is approved or rejected.
              </p>
            </div>
            <div className="p-6">
              <p className="font-semibold text-gray-900 mb-2">Is there a fee to become a recycler partner?</p>
              <p className="text-gray-600 text-sm">
                No, there is no registration fee. However, once approved, you may need to follow certain standards and guidelines for our platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecyclerRequestPage;
