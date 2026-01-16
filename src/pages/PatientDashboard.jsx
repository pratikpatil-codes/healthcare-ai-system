import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, LogOut, FileText, Calendar, AlertCircle, CheckCircle, Loader, Activity } from 'lucide-react';
import { patientAPI } from '../utils/api';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'history'
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState([]);
  const [result, setResult] = useState(null);

  const [formData, setFormData] = useState({
    symptoms: '',
    duration: '',
    severity: 5,
    redFlags: false,
    medications: '',
    consent: false,
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/patient-login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    loadRequests(parsedUser.id);
  }, [navigate]);

  const loadRequests = async (patientId) => {
    try {
      setLoading(true);
      const response = await patientAPI.getRequests(patientId);
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.consent) {
      alert('Please provide consent to proceed');
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const response = await patientAPI.submitRequest({
        patientId: user.id,
        ...formData,
        severity: parseInt(formData.severity),
      });

      setResult(response.data);

      // Reset form
      setFormData({
        symptoms: '',
        duration: '',
        severity: 5,
        redFlags: false,
        medications: '',
        consent: false,
      });

      // Reload requests
      await loadRequests(user.id);
    } catch (error) {
      setResult({
        success: false,
        error: error.response?.data?.error || 'Failed to submit request',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityColor = (level) => {
    switch (level) {
      case 'EMERGENCY':
        return 'badge-danger';
      case 'HIGH':
        return 'badge-danger';
      case 'MEDIUM':
        return 'badge-warning';
      case 'LOW':
        return 'badge-success';
      default:
        return 'badge-info';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'badge-success';
      case 'EMERGENCY':
        return 'badge-danger';
      case 'DOCTOR_ASSIGNED':
        return 'badge-info';
      case 'CANCELLED':
        return 'badge-danger';
      default:
        return 'badge-warning';
    }
  };

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen"><Loader className="w-8 h-8 animate-spin text-medical-blue" /></div>;
  }

  return (
    <div className="min-h-screen bg-medical-bg">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-medical-navy">Patient Portal</h1>
                <p className="text-sm text-gray-500">Welcome, {user.name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('new')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'new'
                ? 'bg-medical-blue text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-5 h-5 inline mr-2" />
            New Request
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-medical-blue text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Calendar className="w-5 h-5 inline mr-2" />
            My Requests
          </button>
        </div>

        {/* New Request Tab */}
        {activeTab === 'new' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 fade-in">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-medical-navy mb-2">Submit Medical Request</h2>
                <p className="text-gray-600">Please provide accurate information for proper assessment</p>
              </div>

              {/* Result Message */}
              {result && (
                <div className={`mb-6 p-6 rounded-xl border-l-4 ${result.emergency ? 'bg-red-50 border-red-500' : result.success ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                  {result.emergency ? (
                    <>
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-6 h-6 text-red-600 mt-1" />
                        <div>
                          <h3 className="font-bold text-red-900 text-lg mb-2">⚠️ EMERGENCY DETECTED</h3>
                          <p className="text-red-800 mb-4">{result.message}</p>
                          <div className="bg-white p-4 rounded-lg">
                            <p className="font-semibold text-red-900 mb-2">Immediate Actions:</p>
                            <ul className="list-disc list-inside text-red-800 space-y-1">
                              <li>Call Emergency Services: <strong>108 or 112</strong></li>
                              <li>Visit the nearest Emergency Room immediately</li>
                              <li>Do not wait for an appointment</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : result.success ? (
                    <>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                        <div>
                          <h3 className="font-bold text-green-900 text-lg mb-2">✅ Request Submitted Successfully</h3>
                          <p className="text-green-800 mb-3">{result.message}</p>
                          {result.doctor && (
                            <div className="bg-white p-4 rounded-lg">
                              <p className="text-sm text-gray-600 mb-1">Assigned Doctor:</p>
                              <p className="font-semibold text-medical-navy">{result.doctor.name}</p>
                              <p className="text-sm text-gray-600">{result.doctor.specialty}</p>
                            </div>
                          )}
                          {result.analysis && (
                            <div className="mt-3 bg-white p-4 rounded-lg">
                              <p className="text-sm text-gray-600 mb-1">AI Analysis:</p>
                              <p className="text-sm text-gray-700">{result.analysis.analysis}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-red-800 font-medium">{result.error}</p>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Question 1: Symptoms */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    1. What symptoms are you experiencing? *
                  </label>
                  <textarea
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleChange}
                    className="medical-input"
                    rows="4"
                    placeholder="Describe your symptoms in detail..."
                    required
                  />
                </div>

                {/* Question 2: Duration */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    2. How long have the symptoms been present? *
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="medical-input"
                    placeholder="e.g., 2 days, 1 week, 3 hours"
                    required
                  />
                </div>

                {/* Question 3: Severity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    3. Rate severity (1-10) * <span className="text-medical-blue font-bold">{formData.severity}</span>
                  </label>
                  <input
                    type="range"
                    name="severity"
                    min="1"
                    max="10"
                    value={formData.severity}
                    onChange={handleChange}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-medical-blue"
                    required
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 - Mild</span>
                    <span>5 - Moderate</span>
                    <span>10 - Severe</span>
                  </div>
                </div>

                {/* Question 4: Emergency Warning Signs */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    4. Are there emergency warning signs? *
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="redFlags"
                        value="true"
                        checked={formData.redFlags === true}
                        onChange={() => setFormData({ ...formData, redFlags: true })}
                        className="w-5 h-5 text-medical-blue"
                        required
                      />
                      <span className="font-medium">Yes</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="redFlags"
                        value="false"
                        checked={formData.redFlags === false}
                        onChange={() => setFormData({ ...formData, redFlags: false })}
                        className="w-5 h-5 text-medical-blue"
                        required
                      />
                      <span className="font-medium">No</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Emergency signs: severe chest pain, difficulty breathing, loss of consciousness, severe bleeding, etc.
                  </p>
                </div>

                {/* Question 5: Medications/Allergies */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    5. Current medications or allergies?
                  </label>
                  <textarea
                    name="medications"
                    value={formData.medications}
                    onChange={handleChange}
                    className="medical-input"
                    rows="3"
                    placeholder="List any medications you're taking or allergies you have..."
                  />
                </div>

                {/* Question 6: Consent */}
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="consent"
                      checked={formData.consent}
                      onChange={handleChange}
                      className="w-5 h-5 text-medical-blue mt-1"
                      required
                    />
                    <span className="text-sm text-gray-700 leading-relaxed">
                      <strong>6. Consent to proceed *</strong><br />
                      I understand that this is not a medical diagnosis and I consent to share my information
                      with healthcare providers for appointment scheduling purposes.
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-primary flex items-center justify-center space-x-2 py-4"
                >
                  {submitting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Analyzing & Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Activity className="w-5 h-5" />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Request History Tab */}
        {activeTab === 'history' && (
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 fade-in">
              <h2 className="text-2xl font-bold text-medical-navy mb-6">My Medical Requests</h2>

              {loading ? (
                <div className="text-center py-12">
                  <Loader className="w-8 h-8 animate-spin text-medical-blue mx-auto" />
                  <p className="text-gray-500 mt-4">Loading your requests...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No requests found</p>
                  <button
                    onClick={() => setActiveTab('new')}
                    className="mt-4 btn-primary"
                  >
                    Submit Your First Request
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className={`badge ${getSeverityColor(request.severity_level)}`}>
                            {request.severity_level || 'PENDING'}
                          </span>
                          <span className={`badge ${getStatusColor(request.status)} ml-2`}>
                            {request.status}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 font-semibold mb-1">Symptoms</p>
                          <p className="text-gray-800">{request.symptoms}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-semibold mb-1">Duration</p>
                          <p className="text-gray-800">{request.duration}</p>
                        </div>
                      </div>

                      {request.doctor_name && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm text-gray-600 font-semibold mb-1">Assigned Doctor</p>
                          <p className="text-medical-blue font-semibold">{request.doctor_name}</p>
                          <p className="text-sm text-gray-600">{request.doctor_specialty}</p>
                        </div>
                      )}

                      {request.appointment_date && (
                        <div className="mt-4 pt-4 border-t border-gray-200 bg-green-50 -m-6 mt-4 p-6 rounded-b-xl">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600 font-semibold mb-1">Appointment Scheduled</p>
                              <p className="text-lg font-bold text-medical-navy">
                                📅 {new Date(request.appointment_date).toLocaleDateString()} at {request.appointment_time}
                              </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
