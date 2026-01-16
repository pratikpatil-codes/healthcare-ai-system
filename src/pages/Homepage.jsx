import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Stethoscope, Heart, Users } from 'lucide-react';

const Homepage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-medical-bg overflow-hidden">
      {/* ECG Background Animation */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg width="100%" height="200" className="ecg-pattern">
          <path
            d="M0,100 L50,100 L60,80 L65,120 L70,100 L150,100 L160,80 L165,120 L170,100 L250,100 L260,80 L265,120 L270,100 L350,100 L360,80 L365,120 L370,100 L450,100 L460,80 L465,120 L470,100 L550,100"
            stroke="#0A6CF1"
            strokeWidth="2"
            fill="none"
            className="ecg-line"
          />
        </svg>
      </div>

      {/* Hero Section */}
      <div className={`relative z-10 ${isVisible ? 'fade-in' : 'opacity-0'}`}>
        {/* Header */}
        <header className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-medical-blue to-medical-blue-dark rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-medical-navy">Healthcare AI</h1>
                <p className="text-sm text-gray-500">Smart Medical Triage</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin-login')}
              className="px-6 py-2.5 text-sm font-semibold text-medical-blue hover:bg-blue-50 rounded-lg transition-all"
            >
              Admin Portal
            </button>
          </div>
        </header>

        {/* Main Hero Content */}
        <div className="container mx-auto px-6 py-16 md:py-24">
          <div className="max-w-5xl mx-auto text-center">
            {/* Medical Cross Icon */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-medical-blue to-medical-teal rounded-2xl flex items-center justify-center shadow-2xl pulse-animation">
                  <Heart className="w-10 h-10 text-white heartbeat-animation" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-medical-green rounded-full border-4 border-white"></div>
              </div>
            </div>

            {/* Project Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-medical-navy mb-6 leading-tight">
              Agentic AI-Enabled Multimodal
              <br />
              <span className="bg-gradient-to-r from-medical-blue to-medical-teal bg-clip-text text-transparent">
                Healthcare Assistant
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-4 font-medium">
              for Symptom Analysis and Smart Triage
            </p>

            <p className="text-lg text-gray-500 mb-12 max-w-3xl mx-auto">
              Advanced AI-powered system that intelligently analyzes your symptoms, determines severity,
              and connects you with the right medical specialist instantly.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <div className="flex items-center space-x-2 bg-white px-5 py-3 rounded-full shadow-md">
                <div className="w-2 h-2 bg-medical-green rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-700">AI-Powered Analysis</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-5 py-3 rounded-full shadow-md">
                <div className="w-2 h-2 bg-medical-blue rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-700">Smart Doctor Matching</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-5 py-3 rounded-full shadow-md">
                <div className="w-2 h-2 bg-medical-teal rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-700">Instant Appointments</span>
              </div>
            </div>

            {/* Login Cards */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Patient Card */}
              <div
                onClick={() => navigate('/patient-login')}
                className="medical-card bg-white rounded-3xl p-10 cursor-pointer shadow-lg hover:shadow-2xl border-2 border-transparent hover:border-medical-blue transition-all group"
              >
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Heart className="w-8 h-8 text-red-500" strokeWidth={2.5} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-medical-navy mb-3">Patient Portal</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Get instant medical consultation. Our AI analyzes your symptoms and connects you with the right specialist.
                </p>
                <div className="flex items-center justify-center space-x-2 text-medical-blue font-semibold group-hover:translate-x-2 transition-transform">
                  <span>Continue as Patient</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Doctor Card */}
              <div
                onClick={() => navigate('/doctor-login')}
                className="medical-card bg-white rounded-3xl p-10 cursor-pointer shadow-lg hover:shadow-2xl border-2 border-transparent hover:border-medical-teal transition-all group"
              >
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Stethoscope className="w-8 h-8 text-medical-blue" strokeWidth={2.5} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-medical-navy mb-3">Doctor Portal</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Access your dashboard, review patient requests, and manage appointments efficiently with our AI-assisted platform.
                </p>
                <div className="flex items-center justify-center space-x-2 text-medical-teal font-semibold group-hover:translate-x-2 transition-transform">
                  <span>Continue as Doctor</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="container mx-auto px-6 py-16 border-t border-gray-200">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-medical-blue mb-2">24/7</div>
              <div className="text-sm text-gray-600 font-medium">Available</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-medical-teal mb-2">AI</div>
              <div className="text-sm text-gray-600 font-medium">Powered</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-medical-green mb-2">Fast</div>
              <div className="text-sm text-gray-600 font-medium">Response</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-medical-blue-dark mb-2">Secure</div>
              <div className="text-sm text-gray-600 font-medium">Platform</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-8 text-center text-gray-500 text-sm border-t border-gray-200">
          <p>© 2025 Healthcare AI System. Advanced Medical Triage Platform.</p>
          <p className="mt-2">Powered by Artificial Intelligence • HIPAA Compliant • Secure & Private</p>
        </footer>
      </div>
    </div>
  );
};

export default Homepage;
