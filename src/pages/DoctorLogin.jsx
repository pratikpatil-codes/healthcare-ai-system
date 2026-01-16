import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Mail, Phone, User, ArrowLeft, Loader } from 'lucide-react';
import { authAPI } from '../utils/api';

const specialties = [
  'Cardiologist',
  'Dermatologist',
  'Gastroenterologist',
  'Neurologist',
  'Orthopedic',
  'General Physician',
  'Pediatrician',
  'ENT Specialist',
  'Ophthalmologist',
  'Psychiatrist',
];

const DoctorLogin = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    specialty: '',
    otp: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authAPI.sendOTP({
        email: formData.email,
        type: 'doctor',
        name: formData.name,
        phone: formData.phone,
        specialty: formData.specialty,
      });

      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.verifyOTP({
        email: formData.email,
        otp: formData.otp,
        type: 'doctor',
        name: formData.name,
        phone: formData.phone,
        specialty: formData.specialty,
      });

      if (response.data.pending) {
        // Account pending approval
        alert(response.data.message);
        navigate('/');
        return;
      }

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/doctor-dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <button
          onClick={() => step === 1 ? navigate('/') : setStep(1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-medical-blue mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 fade-in">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4 pulse-animation">
              <Stethoscope className="w-8 h-8 text-medical-blue" strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-bold text-medical-navy mb-2">Doctor Portal</h2>
            <p className="text-gray-600">
              {step === 1 ? 'Enter your professional details' : 'Enter the OTP sent to your email'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Doctor Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="medical-input"
                  placeholder="Dr. Your Name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="medical-input"
                  placeholder="+91 XXXXX XXXXX"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="medical-input"
                  placeholder="doctor@hospital.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🔬 Medical Specialty
                </label>
                <select
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  className="medical-input"
                  required
                >
                  <option value="">Select your specialty</option>
                  {specialties.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center space-x-2 mt-6"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <span>Send OTP</span>
                )}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-blue-800">
                  📧 OTP sent to <strong>{formData.email}</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  className="medical-input text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                  maxLength="6"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center space-x-2 mt-6"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify & Login</span>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              ℹ️ New doctors require admin approval before accessing the system
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;
