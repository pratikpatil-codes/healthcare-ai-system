import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogOut, Users, UserCheck, FileText, Calendar, Mail, TrendingUp, Loader, CheckCircle, XCircle, Clock } from 'lucide-react';
import { adminAPI } from '../utils/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(false);
  
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/admin-login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.type !== 'admin') {
      navigate('/');
      return;
    }
    
    setUser(parsedUser);
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [statsRes, patientsRes, doctorsRes, requestsRes, appointmentsRes, emailLogsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getPatients(),
        adminAPI.getDoctors(),
        adminAPI.getRequests(),
        adminAPI.getAppointments(),
        adminAPI.getEmailLogs(),
      ]);

      setStats(statsRes.data.stats);
      setPatients(patientsRes.data.patients || []);
      setDoctors(doctorsRes.data.doctors || []);
      setRequests(requestsRes.data.requests || []);
      setAppointments(appointmentsRes.data.appointments || []);
      setEmailLogs(emailLogsRes.data.logs || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDoctor = async (doctorId) => {
    if (window.confirm('Approve this doctor?')) {
      try {
        await adminAPI.approveDoctor(doctorId);
        loadData();
        alert('Doctor approved successfully!');
      } catch (error) {
        alert('Failed to approve doctor');
      }
    }
  };

  const handleBlockDoctor = async (doctorId) => {
    if (window.confirm('Block this doctor?')) {
      try {
        await adminAPI.blockDoctor(doctorId);
        loadData();
        alert('Doctor blocked successfully!');
      } catch (error) {
        alert('Failed to block doctor');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-medical-blue" />
      </div>
    );
  }

  const tabs = [
    { id: 'stats', name: 'Dashboard', icon: TrendingUp },
    { id: 'patients', name: 'Patients', icon: Users },
    { id: 'doctors', name: 'Doctors', icon: UserCheck },
    { id: 'requests', name: 'Requests', icon: FileText },
    { id: 'appointments', name: 'Appointments', icon: Calendar },
    { id: 'emails', name: 'Email Logs', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-medical-bg">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-medical-navy">Admin Portal</h1>
                <p className="text-sm text-gray-500">System Administrator</p>
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
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-5 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-medical-blue text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Dashboard Stats */}
        {activeTab === 'stats' && (
          <div className="space-y-6 fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-1">Total Patients</p>
                    <p className="text-3xl font-bold text-medical-navy">{stats.totalPatients}</p>
                  </div>
                  <Users className="w-12 h-12 text-blue-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-teal-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-1">Active Doctors</p>
                    <p className="text-3xl font-bold text-medical-navy">{stats.totalDoctors}</p>
                    {stats.pendingDoctors > 0 && (
                      <p className="text-xs text-orange-600 font-semibold mt-1">
                        {stats.pendingDoctors} pending approval
                      </p>
                    )}
                  </div>
                  <UserCheck className="w-12 h-12 text-teal-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-1">Total Requests</p>
                    <p className="text-3xl font-bold text-medical-navy">{stats.totalRequests}</p>
                    {stats.pendingRequests > 0 && (
                      <p className="text-xs text-orange-600 font-semibold mt-1">
                        {stats.pendingRequests} pending
                      </p>
                    )}
                  </div>
                  <FileText className="w-12 h-12 text-purple-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-1">Appointments</p>
                    <p className="text-3xl font-bold text-medical-navy">{stats.confirmedAppointments}</p>
                    {stats.emergencyCases > 0 && (
                      <p className="text-xs text-red-600 font-semibold mt-1">
                        {stats.emergencyCases} emergency cases
                      </p>
                    )}
                  </div>
                  <Calendar className="w-12 h-12 text-green-500 opacity-20" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-medical-navy mb-4">System Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <span className="font-semibold text-gray-700">Total System Users</span>
                  <span className="text-2xl font-bold text-medical-blue">
                    {stats.totalPatients + stats.totalDoctors}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <span className="font-semibold text-gray-700">Success Rate</span>
                  <span className="text-2xl font-bold text-green-600">
                    {stats.totalRequests > 0
                      ? Math.round((stats.confirmedAppointments / stats.totalRequests) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 fade-in">
            <h3 className="text-2xl font-bold text-medical-navy mb-6">Registered Patients</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">#{patient.id}</td>
                      <td className="px-4 py-3 text-sm">{patient.full_name}</td>
                      <td className="px-4 py-3 text-sm">{patient.email}</td>
                      <td className="px-4 py-3 text-sm">{patient.phone}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(patient.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Doctors Tab */}
        {activeTab === 'doctors' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 fade-in">
            <h3 className="text-2xl font-bold text-medical-navy mb-6">Doctor Management</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Specialty</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {doctors.map((doctor) => (
                    <tr key={doctor.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">#{doctor.id}</td>
                      <td className="px-4 py-3 text-sm font-semibold">{doctor.name}</td>
                      <td className="px-4 py-3 text-sm">{doctor.specialty}</td>
                      <td className="px-4 py-3 text-sm">{doctor.email}</td>
                      <td className="px-4 py-3 text-sm">
                        {doctor.status === 'active' && (
                          <span className="badge badge-success">Active</span>
                        )}
                        {doctor.status === 'pending' && (
                          <span className="badge badge-warning">Pending</span>
                        )}
                        {doctor.status === 'blocked' && (
                          <span className="badge badge-danger">Blocked</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex space-x-2">
                          {doctor.status === 'pending' && (
                            <button
                              onClick={() => handleApproveDoctor(doctor.id)}
                              className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-xs font-semibold"
                            >
                              Approve
                            </button>
                          )}
                          {doctor.status === 'active' && (
                            <button
                              onClick={() => handleBlockDoctor(doctor.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs font-semibold"
                            >
                              Block
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 fade-in">
            <h3 className="text-2xl font-bold text-medical-navy mb-6">Patient Requests</h3>
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="badge badge-info">#{request.id}</span>
                      <span className={`badge ${request.severity_level === 'EMERGENCY' ? 'badge-danger' : request.severity_level === 'HIGH' ? 'badge-danger' : request.severity_level === 'MEDIUM' ? 'badge-warning' : 'badge-success'} ml-2`}>
                        {request.severity_level}
                      </span>
                      <span className="badge badge-warning ml-2">{request.status}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(request.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 font-semibold mb-1">Patient</p>
                      <p className="text-gray-800">{request.patient_name}</p>
                      <p className="text-sm text-gray-500">{request.patient_email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold mb-1">Symptoms</p>
                      <p className="text-gray-800">{request.symptoms}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold mb-1">Assigned Doctor</p>
                      <p className="text-gray-800">{request.doctor_name || 'Not assigned'}</p>
                      {request.doctor_specialty && (
                        <p className="text-sm text-gray-500">{request.doctor_specialty}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 fade-in">
            <h3 className="text-2xl font-bold text-medical-navy mb-6">Scheduled Appointments</h3>
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-green-50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="badge badge-success">Confirmed</span>
                      <span className="badge badge-info ml-2">ID: #{appointment.id}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-medical-navy">
                        📅 {new Date(appointment.appointment_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">🕐 {appointment.appointment_time}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 font-semibold mb-1">Patient</p>
                      <p className="text-gray-800 font-semibold">{appointment.patient_name}</p>
                      <p className="text-sm text-gray-500">{appointment.patient_email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold mb-1">Doctor</p>
                      <p className="text-gray-800 font-semibold">{appointment.doctor_name}</p>
                      <p className="text-sm text-gray-500">{appointment.doctor_specialty}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email Logs Tab */}
        {activeTab === 'emails' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 fade-in">
            <h3 className="text-2xl font-bold text-medical-navy mb-6">Email Activity Logs</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Time</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Recipient</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {emailLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm">{log.recipient}</td>
                      <td className="px-4 py-3 text-sm font-medium">{log.subject}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="badge badge-info">{log.type}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {log.status === 'sent' ? (
                          <span className="badge badge-success">Sent</span>
                        ) : (
                          <span className="badge badge-danger">Failed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
