import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendOTP, sendDoctorNotification, sendPatientConfirmation, sendEmergencyAlert } from './emailService.js';
import { analyzeSymptoms, isAIAvailable } from './aiService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const db = new Database(process.env.DB_PATH || './server/database.db');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Helper function to generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper function to log emails
function logEmail(recipient, subject, type, status, errorMessage = null) {
  try {
    db.prepare(`
      INSERT INTO email_logs (recipient, subject, type, status, error_message)
      VALUES (?, ?, ?, ?, ?)
    `).run(recipient, subject, type, status, errorMessage);
  } catch (error) {
    console.error('Failed to log email:', error);
  }
}

// ============================================================
// AUTHENTICATION ENDPOINTS
// ============================================================

// Send OTP for Patient/Doctor
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email, type, name, phone, specialty } = req.body;

    if (!email || !type) {
      return res.status(400).json({ error: 'Email and type are required' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    db.prepare(`
      INSERT INTO otps (email, otp, type, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(email, otp, type, expiresAt.toISOString());

    // Send OTP email
    const emailResult = await sendOTP(email, otp, type);
    
    if (emailResult.success) {
      logEmail(email, 'OTP Verification', 'otp', 'sent');
      res.json({ success: true, message: 'OTP sent successfully' });
    } else {
      logEmail(email, 'OTP Verification', 'otp', 'failed', emailResult.error);
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify OTP and Login/Register
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp, type, name, phone, specialty } = req.body;

    if (!email || !otp || !type) {
      return res.status(400).json({ error: 'Email, OTP, and type are required' });
    }

    // Verify OTP
    const otpRecord = db.prepare(`
      SELECT * FROM otps 
      WHERE email = ? AND otp = ? AND type = ? AND used = 0 AND expires_at > datetime('now')
      ORDER BY created_at DESC LIMIT 1
    `).get(email, otp, type);

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Mark OTP as used
    db.prepare('UPDATE otps SET used = 1 WHERE id = ?').run(otpRecord.id);

    let user;
    let token;

    if (type === 'patient') {
      // Check if patient exists
      user = db.prepare('SELECT * FROM patients WHERE email = ?').get(email);

      if (!user) {
        // Create new patient
        const result = db.prepare(`
          INSERT INTO patients (full_name, phone, email, last_login)
          VALUES (?, ?, ?, datetime('now'))
        `).run(name, phone, email);

        user = db.prepare('SELECT * FROM patients WHERE id = ?').get(result.lastInsertRowid);
      } else {
        // Update last login
        db.prepare('UPDATE patients SET last_login = datetime("now") WHERE id = ?').run(user.id);
      }

      // Generate JWT
      token = jwt.sign({ id: user.id, email: user.email, type: 'patient' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    } else if (type === 'doctor') {
      // Check if doctor exists
      user = db.prepare('SELECT * FROM doctors WHERE email = ?').get(email);

      if (!user) {
        // Create new doctor (pending approval)
        const result = db.prepare(`
          INSERT INTO doctors (name, phone, email, specialty, status)
          VALUES (?, ?, ?, ?, 'pending')
        `).run(name, phone, email, specialty || 'General Physician');

        user = db.prepare('SELECT * FROM doctors WHERE id = ?').get(result.lastInsertRowid);
      }

      if (user.status === 'blocked') {
        return res.status(403).json({ error: 'Your account has been blocked. Please contact admin.' });
      }

      if (user.status === 'pending') {
        return res.json({ 
          success: true, 
          pending: true, 
          message: 'Your account is pending admin approval. You will be notified once approved.' 
        });
      }

      // Generate JWT for active doctors
      token = jwt.sign({ id: user.id, email: user.email, type: 'doctor' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    }

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.full_name || user.name,
        email: user.email,
        phone: user.phone,
        type,
        ...(type === 'doctor' && { specialty: user.specialty, status: user.status })
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Login
app.post('/api/auth/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(email);

    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin.id, email: admin.email, type: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        type: 'admin'
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// PATIENT REQUEST ENDPOINTS
// ============================================================

// Submit Patient Request
app.post('/api/requests/submit', async (req, res) => {
  try {
    const { patientId, symptoms, duration, severity, redFlags, medications, consent } = req.body;

    if (!patientId || !symptoms || !duration || severity === undefined || redFlags === undefined || consent === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!consent) {
      return res.status(400).json({ error: 'Consent is required to proceed' });
    }

    // Store initial request
    const result = db.prepare(`
      INSERT INTO patient_requests (
        patient_id, symptoms, duration, severity, red_flags, medications, consent, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING_ANALYSIS')
    `).run(patientId, symptoms, duration, severity, redFlags ? 1 : 0, medications, consent ? 1 : 0);

    const requestId = result.lastInsertRowid;

    // Analyze symptoms using AI
    const analysis = await analyzeSymptoms({ symptoms, duration, severity, redFlags, medications });

    // Update request with analysis
    db.prepare(`
      UPDATE patient_requests 
      SET ai_analysis = ?, suggested_specialty = ?, severity_level = ?, status = 'ANALYZED', analyzed_at = datetime('now')
      WHERE id = ?
    `).run(analysis.analysis, analysis.suggestedSpecialty, analysis.severityLevel, requestId);

    // Handle emergency cases
    if (analysis.severityLevel === 'EMERGENCY') {
      db.prepare(`UPDATE patient_requests SET status = 'EMERGENCY' WHERE id = ?`).run(requestId);

      // Get patient info
      const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId);
      
      // Send emergency alert to admin
      const admin = db.prepare('SELECT * FROM admins LIMIT 1').get();
      if (admin) {
        await sendEmergencyAlert(admin.email, {
          name: patient.full_name,
          email: patient.email,
          phone: patient.phone,
          symptoms,
          severity,
          severityLevel: analysis.severityLevel
        });
        logEmail(admin.email, 'Emergency Alert', 'emergency', 'sent');
      }

      return res.json({
        success: true,
        emergency: true,
        message: 'Emergency case detected. Please seek immediate medical attention. Call emergency services: 108 or 112',
        requestId,
        analysis
      });
    }

    // Find matching doctor
    const doctor = db.prepare(`
      SELECT * FROM doctors 
      WHERE specialty = ? AND status = 'active' AND availability = 'available'
      ORDER BY RANDOM()
      LIMIT 1
    `).get(analysis.suggestedSpecialty);

    if (!doctor) {
      return res.json({
        success: true,
        message: 'No available doctors found for this specialty. Admin will be notified.',
        requestId,
        analysis
      });
    }

    // Assign doctor
    db.prepare(`
      UPDATE patient_requests 
      SET assigned_doctor_id = ?, status = 'DOCTOR_ASSIGNED'
      WHERE id = ?
    `).run(doctor.id, requestId);

    // Get patient info
    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId);

    // Send notification to doctor
    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    const emailResult = await sendDoctorNotification(
      doctor.email,
      {
        name: patient.full_name,
        email: patient.email,
        phone: patient.phone,
        symptoms,
        duration,
        severity,
        severityLevel: analysis.severityLevel,
        medications,
        redFlags
      },
      requestId,
      baseUrl
    );

    if (emailResult.success) {
      logEmail(doctor.email, 'New Appointment Request', 'doctor_notification', 'sent');
    } else {
      logEmail(doctor.email, 'New Appointment Request', 'doctor_notification', 'failed', emailResult.error);
    }

    res.json({
      success: true,
      message: 'Request submitted successfully. Doctor will be notified.',
      requestId,
      doctor: {
        name: doctor.name,
        specialty: doctor.specialty
      },
      analysis
    });

  } catch (error) {
    console.error('Submit request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Patient Requests
app.get('/api/requests/patient/:patientId', (req, res) => {
  try {
    const { patientId } = req.params;

    const requests = db.prepare(`
      SELECT 
        pr.*,
        d.name as doctor_name,
        d.specialty as doctor_specialty,
        a.appointment_date,
        a.appointment_time,
        a.status as appointment_status
      FROM patient_requests pr
      LEFT JOIN doctors d ON pr.assigned_doctor_id = d.id
      LEFT JOIN appointments a ON a.request_id = pr.id
      WHERE pr.patient_id = ?
      ORDER BY pr.created_at DESC
    `).all(patientId);

    res.json({ success: true, requests });

  } catch (error) {
    console.error('Get patient requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// APPOINTMENT ENDPOINTS
// ============================================================

// Confirm Appointment (Doctor clicks confirm button in email)
app.get('/api/appointments/confirm/:requestId', (req, res) => {
  try {
    const { requestId } = req.params;

    // Get request details
    const request = db.prepare(`
      SELECT pr.*, p.full_name, p.email, p.phone
      FROM patient_requests pr
      JOIN patients p ON pr.patient_id = p.id
      WHERE pr.id = ?
    `).get(requestId);

    if (!request) {
      return res.send(`
        <html>
          <head>
            <style>
              body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f7f9fc; }
              .container { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
              h1 { color: #f44336; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>❌ Request Not Found</h1>
              <p>This appointment request does not exist or has been removed.</p>
            </div>
          </body>
        </html>
      `);
    }

    // Return a form to select date and time
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirm Appointment</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #0A6CF1 0%, #1E88E5 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            max-width: 500px;
            width: 100%;
          }
          h1 { color: #0A6CF1; margin-bottom: 10px; font-size: 28px; }
          .subtitle { color: #666; margin-bottom: 30px; font-size: 16px; }
          .patient-info {
            background: #f7f9fc;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
            border-left: 4px solid #0A6CF1;
          }
          .patient-info p { margin: 8px 0; color: #333; font-size: 14px; }
          .patient-info strong { color: #0A6CF1; }
          .form-group { margin-bottom: 20px; }
          label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 600;
            font-size: 14px;
          }
          input[type="date"],
          input[type="time"] {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
          }
          input[type="date"]:focus,
          input[type="time"]:focus {
            outline: none;
            border-color: #0A6CF1;
          }
          button {
            width: 100%;
            padding: 16px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s;
          }
          button:hover { background: #45a049; }
          button:disabled {
            background: #ccc;
            cursor: not-allowed;
          }
          .success-message {
            display: none;
            text-align: center;
            padding: 20px;
          }
          .success-message h2 { color: #4CAF50; margin-bottom: 10px; }
          .success-message p { color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div id="form-container">
            <h1>✅ Confirm Appointment</h1>
            <p class="subtitle">Please select your preferred date and time</p>
            
            <div class="patient-info">
              <p><strong>Patient:</strong> ${request.full_name}</p>
              <p><strong>Symptoms:</strong> ${request.symptoms}</p>
              <p><strong>Duration:</strong> ${request.duration}</p>
              <p><strong>Severity:</strong> ${request.severity}/10 (${request.severity_level})</p>
            </div>

            <form id="confirmForm">
              <div class="form-group">
                <label for="date">📅 Appointment Date</label>
                <input type="date" id="date" name="date" required min="${new Date().toISOString().split('T')[0]}">
              </div>
              
              <div class="form-group">
                <label for="time">🕐 Appointment Time</label>
                <input type="time" id="time" name="time" required>
              </div>

              <button type="submit" id="submitBtn">Confirm Appointment</button>
            </form>
          </div>

          <div class="success-message" id="successMessage">
            <h2>🎉 Appointment Confirmed!</h2>
            <p>Patient has been notified via email.</p>
            <p style="margin-top: 20px; color: #999; font-size: 14px;">You can close this window now.</p>
          </div>
        </div>

        <script>
          document.getElementById('confirmForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';

            const formData = {
              requestId: '${requestId}',
              date: document.getElementById('date').value,
              time: document.getElementById('time').value
            };

            try {
              const response = await fetch('/api/appointments/confirm-with-datetime', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
              });

              const result = await response.json();

              if (result.success) {
                document.getElementById('form-container').style.display = 'none';
                document.getElementById('successMessage').style.display = 'block';
              } else {
                alert('Error: ' + result.error);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Confirm Appointment';
              }
            } catch (error) {
              alert('Network error. Please try again.');
              submitBtn.disabled = false;
              submitBtn.textContent = 'Confirm Appointment';
            }
          });
        </script>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('Confirm appointment error:', error);
    res.status(500).send('Internal server error');
  }
});

// Confirm appointment with date and time
app.post('/api/appointments/confirm-with-datetime', async (req, res) => {
  try {
    const { requestId, date, time } = req.body;

    // Get request details
    const request = db.prepare(`
      SELECT pr.*, p.full_name, p.email, p.phone, d.name as doctor_name, d.specialty, d.email as doctor_email, d.phone as doctor_phone, d.hospital, d.location
      FROM patient_requests pr
      JOIN patients p ON pr.patient_id = p.id
      JOIN doctors d ON pr.assigned_doctor_id = d.id
      WHERE pr.id = ?
    `).get(requestId);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Create appointment
    const appointmentResult = db.prepare(`
      INSERT INTO appointments (request_id, patient_id, doctor_id, appointment_date, appointment_time, status, confirmed_at)
      VALUES (?, ?, ?, ?, ?, 'CONFIRMED', datetime('now'))
    `).run(requestId, request.patient_id, request.assigned_doctor_id, date, time);

    // Update request status
    db.prepare(`UPDATE patient_requests SET status = 'CONFIRMED' WHERE id = ?`).run(requestId);

    // Send confirmation email to patient
    const emailResult = await sendPatientConfirmation(request.email, {
      appointmentId: appointmentResult.lastInsertRowid,
      patientName: request.full_name,
      doctorName: request.doctor_name,
      specialty: request.specialty,
      hospital: request.hospital,
      location: request.location,
      phone: request.doctor_phone,
      date: new Date(date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: new Date(`2000-01-01T${time}`).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    });

    if (emailResult.success) {
      logEmail(request.email, 'Appointment Confirmed', 'patient_confirmation', 'sent');
    } else {
      logEmail(request.email, 'Appointment Confirmed', 'patient_confirmation', 'failed', emailResult.error);
    }

    res.json({ success: true, message: 'Appointment confirmed successfully' });

  } catch (error) {
    console.error('Confirm appointment with datetime error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Decline Appointment
app.get('/api/appointments/decline/:requestId', (req, res) => {
  try {
    const { requestId } = req.params;

    db.prepare(`UPDATE patient_requests SET status = 'CANCELLED' WHERE id = ?`).run(requestId);

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'SF Pro Display', sans-serif;
            background: linear-gradient(135deg, #f44336 0%, #e91e63 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          .container {
            background: white;
            padding: 50px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          }
          h1 { color: #f44336; font-size: 32px; margin-bottom: 15px; }
          p { color: #666; font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>❌ Appointment Declined</h1>
          <p>The appointment request has been declined.</p>
          <p style="margin-top: 20px; color: #999; font-size: 14px;">You can close this window now.</p>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('Decline appointment error:', error);
    res.status(500).send('Internal server error');
  }
});

// ============================================================
// ADMIN ENDPOINTS
// ============================================================

// Get Dashboard Stats
// Get Dashboard Stats
app.get('/api/admin/stats', (req, res) => {
  try {
    const stats = {
      totalPatients: 0,
      totalDoctors: 0,
      pendingDoctors: 0,
      totalRequests: 0,
      pendingRequests: 0,
      emergencyCases: 0,
      confirmedAppointments: 0,
    };

    try {
      const result = db.prepare('SELECT COUNT(*) as count FROM patients').get();
      stats.totalPatients = result ? result.count : 0;
    } catch (e) { console.log('Patients query error:', e.message); }

    try {
      const result = db.prepare('SELECT COUNT(*) as count FROM doctors WHERE status = ?').get('active');
      stats.totalDoctors = result ? result.count : 0;
    } catch (e) { console.log('Active doctors query error:', e.message); }

    try {
      const result = db.prepare('SELECT COUNT(*) as count FROM doctors WHERE status = ?').get('pending');
      stats.pendingDoctors = result ? result.count : 0;
    } catch (e) { console.log('Pending doctors query error:', e.message); }

    try {
      const result = db.prepare('SELECT COUNT(*) as count FROM patient_requests').get();
      stats.totalRequests = result ? result.count : 0;
    } catch (e) { console.log('Requests query error:', e.message); }

    try {
      const result = db.prepare('SELECT COUNT(*) as count FROM patient_requests WHERE status IN (?, ?, ?)').get('PENDING_ANALYSIS', 'ANALYZED', 'DOCTOR_ASSIGNED');
      stats.pendingRequests = result ? result.count : 0;
    } catch (e) { console.log('Pending requests query error:', e.message); }

    try {
      const result = db.prepare('SELECT COUNT(*) as count FROM patient_requests WHERE severity_level = ?').get('EMERGENCY');
      stats.emergencyCases = result ? result.count : 0;
    } catch (e) { console.log('Emergency cases query error:', e.message); }

    try {
      const result = db.prepare('SELECT COUNT(*) as count FROM appointments WHERE status = ?').get('CONFIRMED');
      stats.confirmedAppointments = result ? result.count : 0;
    } catch (e) { console.log('Appointments query error:', e.message); }

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});
// Get All Patients
app.get('/api/admin/patients', (req, res) => {
  try {
    const patients = db.prepare('SELECT * FROM patients ORDER BY created_at DESC').all();
    res.json({ success: true, patients });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get All Doctors
app.get('/api/admin/doctors', (req, res) => {
  try {
    const doctors = db.prepare('SELECT * FROM doctors ORDER BY created_at DESC').all();
    res.json({ success: true, doctors });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve Doctor
app.post('/api/admin/doctors/approve/:doctorId', (req, res) => {
  try {
    const { doctorId } = req.params;
    
    db.prepare(`
      UPDATE doctors 
      SET status = 'active', approved_at = datetime('now'), approved_by = 1
      WHERE id = ?
    `).run(doctorId);

    res.json({ success: true, message: 'Doctor approved successfully' });
  } catch (error) {
    console.error('Approve doctor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Block Doctor
app.post('/api/admin/doctors/block/:doctorId', (req, res) => {
  try {
    const { doctorId } = req.params;
    
    db.prepare('UPDATE doctors SET status = "blocked" WHERE id = ?').run(doctorId);

    res.json({ success: true, message: 'Doctor blocked successfully' });
  } catch (error) {
    console.error('Block doctor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get All Requests
app.get('/api/admin/requests', (req, res) => {
  try {
    const requests = db.prepare(`
      SELECT 
        pr.*,
        p.full_name as patient_name,
        p.email as patient_email,
        p.phone as patient_phone,
        d.name as doctor_name,
        d.specialty as doctor_specialty
      FROM patient_requests pr
      JOIN patients p ON pr.patient_id = p.id
      LEFT JOIN doctors d ON pr.assigned_doctor_id = d.id
      ORDER BY pr.created_at DESC
    `).all();

    res.json({ success: true, requests });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get All Appointments
app.get('/api/admin/appointments', (req, res) => {
  try {
    const appointments = db.prepare(`
      SELECT 
        a.*,
        p.full_name as patient_name,
        p.email as patient_email,
        d.name as doctor_name,
        d.specialty as doctor_specialty
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `).all();

    res.json({ success: true, appointments });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Email Logs
app.get('/api/admin/email-logs', (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 100').all();
    res.json({ success: true, logs });
  } catch (error) {
    console.error('Get email logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// System Status
app.get('/api/system/status', (req, res) => {
  res.json({
    success: true,
    status: 'operational',
    aiEnabled: isAIAvailable(),
    version: '1.0.0'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🏥 Healthcare System Server Running`);
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🤖 AI Service: ${isAIAvailable() ? 'Enabled ✅' : 'Rule-based fallback 🔄'}`);
  console.log(`\n✨ Ready to accept requests!\n`);
});
