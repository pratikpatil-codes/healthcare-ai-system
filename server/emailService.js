import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// Email templates
const emailTemplates = {
  // OTP Email
  otp: (otpData) => {
    const otpCode = otpData.otp;
    const type = otpData.type;
    
    return {
      subject: '🏥 Your Healthcare Portal OTP',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif; background: #f7f9fc; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(10, 108, 241, 0.1); }
            .header { background: linear-gradient(135deg, #0A6CF1 0%, #1E88E5 100%); padding: 40px 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 40px 30px; }
            .otp-box { background: #f7f9fc; border: 2px dashed #0A6CF1; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
            .otp-code { font-size: 36px; font-weight: bold; color: #0A6CF1; letter-spacing: 8px; font-family: monospace; }
            .info { color: #666; line-height: 1.6; margin: 20px 0; }
            .footer { background: #f7f9fc; padding: 20px 30px; text-align: center; color: #999; font-size: 14px; }
            .icon { font-size: 48px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="icon">🏥</div>
              <h1>Healthcare Portal Verification</h1>
            </div>
            <div class="content">
              <p class="info">Hello,</p>
              <p class="info">You are registering as a <strong>${type}</strong>. Please use the following OTP to complete your login:</p>
              <div class="otp-box">
                <div class="otp-code">${otpCode}</div>
              </div>
              <p class="info">This OTP is valid for <strong>10 minutes</strong>.</p>
              <p class="info">If you didn't request this code, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>🔒 Secure Healthcare System • AI-Powered Medical Assistance</p>
              <p>This is an automated message. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  },

  // Doctor Notification Email
  doctorNotification: (data) => ({
    subject: '🚨 New Appointment Request - Action Required',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif; background: #f7f9fc; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(10, 108, 241, 0.1); }
          .header { background: linear-gradient(135deg, #0A6CF1 0%, #1E88E5 100%); padding: 40px 30px; text-align: center; color: white; }
          .header h1 { margin: 0; font-size: 26px; font-weight: 600; }
          .content { padding: 40px 30px; }
          .patient-card { background: #f7f9fc; border-left: 4px solid #0A6CF1; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .field { margin: 15px 0; }
          .field-label { color: #666; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
          .field-value { color: #1A2332; font-size: 16px; margin-top: 5px; }
          .severity { display: inline-block; padding: 6px 12px; border-radius: 20px; font-weight: 600; font-size: 14px; }
          .severity-high { background: #ffebee; color: #c62828; }
          .severity-medium { background: #fff3e0; color: #ef6c00; }
          .severity-low { background: #e8f5e9; color: #2e7d32; }
          .severity-emergency { background: #ffebee; color: #c62828; }
          .actions { margin: 30px 0; }
          .btn { display: inline-block; padding: 16px 32px; margin: 10px 5px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; transition: transform 0.2s; }
          .btn-confirm { background: #4CAF50; color: white; }
          .btn-decline { background: #f44336; color: white; }
          .footer { background: #f7f9fc; padding: 20px 30px; text-align: center; color: #999; font-size: 14px; }
          .warning { background: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; border-radius: 8px; margin: 20px 0; color: #e65100; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div style="font-size: 48px; margin-bottom: 10px;">🩺</div>
            <h1>New Appointment Request</h1>
          </div>
          <div class="content">
            <p style="color: #666; font-size: 16px;">Dear Doctor,</p>
            <p style="color: #666; font-size: 16px;">A new patient has requested an appointment with you. Please review the details below:</p>
            
            <div class="patient-card">
              <div class="field">
                <div class="field-label">Patient Name</div>
                <div class="field-value">${data.patientInfo.name}</div>
              </div>
              <div class="field">
                <div class="field-label">Contact</div>
                <div class="field-value">📧 ${data.patientInfo.email}</div>
                <div class="field-value" style="margin-top: 5px;">📞 ${data.patientInfo.phone}</div>
              </div>
              <div class="field">
                <div class="field-label">Symptoms</div>
                <div class="field-value">${data.patientInfo.symptoms}</div>
              </div>
              <div class="field">
                <div class="field-label">Duration</div>
                <div class="field-value">${data.patientInfo.duration}</div>
              </div>
              <div class="field">
                <div class="field-label">Severity Level</div>
                <div class="field-value">
                  <span class="severity severity-${data.patientInfo.severityLevel.toLowerCase()}">${data.patientInfo.severityLevel}</span>
                  <span style="color: #666;"> (${data.patientInfo.severity}/10)</span>
                </div>
              </div>
              ${data.patientInfo.medications ? `
              <div class="field">
                <div class="field-label">Medications/Allergies</div>
                <div class="field-value">${data.patientInfo.medications}</div>
              </div>
              ` : ''}
            </div>

            ${data.patientInfo.redFlags ? `
            <div class="warning">
              <strong>⚠️ Warning Signs Reported:</strong> Patient has indicated emergency warning signs. Please prioritize this request.
            </div>
            ` : ''}

            <div class="actions">
              <p style="color: #666; font-size: 16px; text-align: center; margin-bottom: 20px;">
                <strong>Please respond to this request:</strong>
              </p>
              <div style="text-align: center;">
                <a href="${data.baseUrl}/api/appointments/confirm/${data.requestId}" class="btn btn-confirm">
                  ✅ Confirm Appointment
                </a>
                <a href="${data.baseUrl}/api/appointments/decline/${data.requestId}" class="btn btn-decline">
                  ❌ Decline Request
                </a>
              </div>
            </div>

            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              Note: Clicking "Confirm" will allow you to set the appointment date and time.
            </p>
          </div>
          <div class="footer">
            <p>🏥 Healthcare AI System • Smart Appointment Management</p>
            <p>Request ID: #${data.requestId}</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // Patient Confirmation Email
  patientConfirmation: (appointmentDetails) => ({
    subject: '✅ Appointment Confirmed - Healthcare Portal',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif; background: #f7f9fc; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(10, 108, 241, 0.1); }
          .header { background: linear-gradient(135deg, #4CAF50 0%, #00BFA5 100%); padding: 40px 30px; text-align: center; color: white; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .content { padding: 40px 30px; }
          .appointment-card { background: linear-gradient(135deg, #f7f9fc 0%, #e3f2fd 100%); border: 2px solid #0A6CF1; padding: 30px; border-radius: 12px; margin: 20px 0; }
          .field { margin: 15px 0; display: flex; align-items: flex-start; }
          .field-icon { font-size: 24px; margin-right: 15px; }
          .field-content { flex: 1; }
          .field-label { color: #666; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
          .field-value { color: #1A2332; font-size: 18px; margin-top: 5px; font-weight: 500; }
          .date-time { background: #0A6CF1; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .date-time .date { font-size: 24px; font-weight: bold; }
          .date-time .time { font-size: 20px; margin-top: 8px; }
          .info-box { background: #e8f5e9; border-left: 4px solid #4CAF50; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f7f9fc; padding: 20px 30px; text-align: center; color: #999; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div style="font-size: 64px; margin-bottom: 15px;">✅</div>
            <h1>Appointment Confirmed!</h1>
          </div>
          <div class="content">
            <p style="color: #666; font-size: 16px;">Dear ${appointmentDetails.patientName},</p>
            <p style="color: #666; font-size: 16px;">Your appointment has been successfully confirmed. Please find the details below:</p>
            
            <div class="appointment-card">
              <div class="field">
                <div class="field-icon">👨‍⚕️</div>
                <div class="field-content">
                  <div class="field-label">Doctor</div>
                  <div class="field-value">${appointmentDetails.doctorName}</div>
                </div>
              </div>
              <div class="field">
                <div class="field-icon">🔬</div>
                <div class="field-content">
                  <div class="field-label">Specialty</div>
                  <div class="field-value">${appointmentDetails.specialty}</div>
                </div>
              </div>
              <div class="field">
                <div class="field-icon">🏥</div>
                <div class="field-content">
                  <div class="field-label">Hospital/Clinic</div>
                  <div class="field-value">${appointmentDetails.hospital}</div>
                </div>
              </div>
              <div class="field">
                <div class="field-icon">📍</div>
                <div class="field-content">
                  <div class="field-label">Location</div>
                  <div class="field-value">${appointmentDetails.location}</div>
                </div>
              </div>
              <div class="field">
                <div class="field-icon">📞</div>
                <div class="field-content">
                  <div class="field-label">Contact</div>
                  <div class="field-value">${appointmentDetails.phone}</div>
                </div>
              </div>
            </div>

            <div class="date-time">
              <div style="font-size: 14px; opacity: 0.9; margin-bottom: 10px;">APPOINTMENT SCHEDULED</div>
              <div class="date">📅 ${appointmentDetails.date}</div>
              <div class="time">🕐 ${appointmentDetails.time}</div>
            </div>

            <div class="info-box">
              <strong>📝 Important Notes:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Please arrive 10 minutes before your scheduled time</li>
                <li>Bring any relevant medical records or test results</li>
                <li>Carry a valid ID proof</li>
                <li>If you need to reschedule, please contact the clinic directly</li>
              </ul>
            </div>

            <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center;">
              We wish you good health! 🌟
            </p>
          </div>
          <div class="footer">
            <p>🏥 Healthcare AI System</p>
            <p>Appointment ID: #${appointmentDetails.appointmentId}</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // Emergency Alert Email
  emergencyAlert: (patientInfo) => ({
    subject: '🚨 URGENT: Emergency Case Detected',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif; background: #f7f9fc; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(244, 67, 54, 0.2); border: 3px solid #f44336; }
          .header { background: linear-gradient(135deg, #f44336 0%, #c62828 100%); padding: 40px 30px; text-align: center; color: white; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .content { padding: 40px 30px; }
          .alert-box { background: #ffebee; border: 2px solid #f44336; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .field { margin: 15px 0; }
          .field-label { color: #666; font-size: 13px; font-weight: 600; text-transform: uppercase; }
          .field-value { color: #1A2332; font-size: 16px; margin-top: 5px; }
          .footer { background: #f7f9fc; padding: 20px 30px; text-align: center; color: #999; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div style="font-size: 64px; margin-bottom: 15px;">🚨</div>
            <h1>EMERGENCY CASE ALERT</h1>
          </div>
          <div class="content">
            <div class="alert-box">
              <p style="color: #c62828; font-size: 18px; font-weight: bold; margin: 0 0 10px 0;">⚠️ HIGH SEVERITY CASE DETECTED</p>
              <p style="color: #666;">Immediate medical attention may be required.</p>
            </div>
            
            <div class="field">
              <div class="field-label">Patient Name</div>
              <div class="field-value">${patientInfo.name}</div>
            </div>
            <div class="field">
              <div class="field-label">Contact</div>
              <div class="field-value">${patientInfo.email} | ${patientInfo.phone}</div>
            </div>
            <div class="field">
              <div class="field-label">Symptoms</div>
              <div class="field-value">${patientInfo.symptoms}</div>
            </div>
            <div class="field">
              <div class="field-label">Severity</div>
              <div class="field-value">${patientInfo.severity}/10 - ${patientInfo.severityLevel}</div>
            </div>

            <p style="color: #c62828; font-weight: bold; margin-top: 30px;">
              🚑 Automatic appointment scheduling has been paused. Admin intervention required.
            </p>
          </div>
          <div class="footer">
            <p>🏥 Healthcare AI System - Emergency Alert</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

// Send email function
export async function sendEmail(to, template, data) {
  try {
    const emailContent = emailTemplates[template](data);
    
    const info = await transporter.sendMail({
      from: `"Healthcare AI System" <${process.env.EMAIL_USER}>`,
      to,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
}

// Send OTP
export async function sendOTP(email, otp, type) {
  return sendEmail(email, 'otp', { otp, type });
}

// Send doctor notification
export async function sendDoctorNotification(email, patientInfo, requestId, baseUrl) {
  return sendEmail(email, 'doctorNotification', { patientInfo, requestId, baseUrl });
}

// Send patient confirmation
export async function sendPatientConfirmation(email, appointmentDetails) {
  return sendEmail(email, 'patientConfirmation', appointmentDetails);
}

// Send emergency alert
export async function sendEmergencyAlert(adminEmail, patientInfo) {
  return sendEmail(adminEmail, 'emergencyAlert', patientInfo);
}

export default {
  sendOTP,
  sendDoctorNotification,
  sendPatientConfirmation,
  sendEmergencyAlert,
};