# 🏥 Healthcare AI System - Complete Setup Guide

## Agentic AI-Enabled Multimodal Healthcare Assistant for Symptom Analysis and Smart Triage

A production-ready, AI-powered healthcare system that intelligently analyzes patient symptoms, determines severity, and connects them with the right medical specialists.

---

## 🚀 Quick Start (5 Minutes Setup)

### Prerequisites
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Gmail account** (for sending emails)

### Step 1: Install Dependencies
```bash
cd healthcare-system
npm install
```

### Step 2: Setup Database
```bash
npm run setup
```

This creates the database with:
- Admin account (email: `admin@healthcare.com`, password: `Admin@123456`)
- 5 sample active doctors

### Step 3: Configure Email (REQUIRED)

#### Get Gmail App Password:
1. Go to your Google Account: https://myaccount.google.com/
2. Click "Security" → "2-Step Verification" (enable if not already)
3. Scroll down to "App passwords"
4. Select "Mail" and "Other (Custom name)"
5. Name it "Healthcare System"
6. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

#### Update `.env` file:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-16-character-app-password
```

**⚠️ IMPORTANT:** Remove spaces from the app password!

### Step 4: Configure AI (Optional but Recommended)

The system works with OR without AI:
- **With AI**: Advanced Claude AI analysis (Requires API key)
- **Without AI**: Rule-based analysis (Free, works immediately)

#### To Enable AI (Optional):
1. Get Anthropic API key: https://console.anthropic.com/
2. Update `.env`:
```env
ANTHROPIC_API_KEY=your-api-key-here
```

**💡 For Free/Unlimited AI Alternative:**
The system has a sophisticated rule-based fallback that:
- Analyzes symptoms using medical keyword matching
- Determines severity levels automatically
- Maps symptoms to correct medical specialties
- Works perfectly without any API costs!

### Step 5: Start the System
```bash
npm run dev
```

This starts:
- **Backend Server**: http://localhost:3001
- **Frontend**: http://localhost:3000

---

## 🎯 System Access

### Admin Portal
- URL: http://localhost:3000/admin-login
- Email: `admin@healthcare.com`
- Password: `Admin@123456`

### Patient Portal
- URL: http://localhost:3000/patient-login
- Register with OTP (check your email inbox)

### Doctor Portal
- URL: http://localhost:3000/doctor-login
- Register with OTP (requires admin approval)

---

## 📧 Email Configuration Details

### Why Gmail App Password?
Google doesn't allow regular passwords for third-party apps. You need an "App Password" which is a 16-character code specifically for this application.

### Troubleshooting Emails:

**Problem: Emails not sending**
```bash
# Check if email credentials are correct in .env file
EMAIL_USER=correct-email@gmail.com
EMAIL_APP_PASSWORD=abcdefghijklmnop  # No spaces!
```

**Problem: "Invalid credentials" error**
1. Make sure 2-Step Verification is enabled on your Google account
2. Generate a new App Password
3. Copy it WITHOUT spaces
4. Update `.env` file
5. Restart the server: `npm run dev`

**Problem: Emails going to spam**
- This is normal for development. Check spam folder.
- In production, you'd use a professional email service like SendGrid.

---

## 🧪 Testing the System

### Test Patient Flow:
1. Go to http://localhost:3000
2. Click "Patient Portal"
3. Enter your details:
   - Name: Test Patient
   - Phone: +91 9876543210
   - Email: your-email@gmail.com
4. Click "Send OTP" → Check email
5. Enter OTP → Login
6. Submit a medical request with symptoms
7. System will analyze and assign a doctor
8. Doctor receives email notification
9. Doctor confirms appointment
10. You receive confirmation email!

### Test Admin Flow:
1. Login to admin portal
2. View dashboard statistics
3. Approve pending doctors
4. Monitor all requests and appointments
5. Check email logs

---

## 🎨 System Features

### ✅ Implemented Features:
- ✅ Hospital-grade UI with medical theme
- ✅ OTP-based authentication (Email)
- ✅ AI-powered symptom analysis (with rule-based fallback)
- ✅ Automatic severity assessment (LOW/MEDIUM/HIGH/EMERGENCY)
- ✅ Smart doctor matching by specialty
- ✅ Automated email notifications
- ✅ Doctor appointment confirmation via email
- ✅ Patient appointment confirmation
- ✅ Emergency case detection and alerts
- ✅ Complete admin dashboard
- ✅ Doctor approval system
- ✅ Email activity logging
- ✅ Request history tracking
- ✅ Beautiful medical-themed UI/UX

### 🔒 Security Features:
- JWT-based authentication
- OTP verification
- Password hashing (bcrypt)
- Admin-only controls
- Secure email handling
- Input validation

---

## 📊 Database Tables

The system automatically creates:
1. **admins** - System administrators
2. **patients** - Registered patients
3. **doctors** - Medical professionals
4. **patient_requests** - Symptom submissions
5. **appointments** - Confirmed appointments
6. **otps** - One-time passwords
7. **email_logs** - Email delivery tracking

---

## 🔧 Configuration Options

### `.env` File (Complete)
```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_PATH=./server/database.db

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this

# Email (REQUIRED)
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-16-char-app-password

# AI (Optional)
ANTHROPIC_API_KEY=your-api-key-or-leave-empty

# Admin Account
ADMIN_EMAIL=admin@healthcare.com
ADMIN_PASSWORD=Admin@123456
```

---

## 🎭 System Workflow

```
1. Patient submits symptoms (6 questions)
   ↓
2. AI analyzes symptoms + severity
   ↓
3. System determines medical specialty
   ↓
4. Auto-match with available doctor
   ↓
5. Doctor receives email with patient info
   ↓
6. Doctor confirms + sets date/time
   ↓
7. Patient receives confirmation email
   ↓
8. Appointment scheduled ✅
```

### Emergency Flow:
```
High severity detected
   ↓
Stop automation
   ↓
Alert admin immediately
   ↓
Show emergency guidance to patient
   ↓
Recommend calling 108/112
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "Cannot find module"
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue 2: "Database locked"
```bash
# Solution: Delete and recreate database
rm server/database.db
npm run setup
```

### Issue 3: "Port already in use"
```bash
# Solution: Change port in .env
PORT=3002  # or any other available port
```

### Issue 4: Frontend not loading
```bash
# Solution: Check if both servers are running
# Terminal 1: Backend should show "Server: http://localhost:3001"
# Terminal 2: Frontend should show "Local: http://localhost:3000"
```

### Issue 5: Emails not working
```bash
# Check email configuration:
1. Gmail App Password is correct (no spaces)
2. 2-Step Verification is enabled
3. App Password is fresh (not revoked)
4. EMAIL_USER matches the Gmail account
5. Restart server after changing .env
```

---

## 📱 Project Structure

```
healthcare-system/
├── server/
│   ├── index.js           # Main Express server
│   ├── setup.js           # Database initialization
│   ├── emailService.js    # Email templates & sending
│   ├── aiService.js       # AI + rule-based analysis
│   └── database.db        # SQLite database
├── src/
│   ├── pages/
│   │   ├── Homepage.jsx
│   │   ├── PatientLogin.jsx
│   │   ├── PatientDashboard.jsx
│   │   ├── DoctorLogin.jsx
│   │   ├── AdminLogin.jsx
│   │   └── AdminDashboard.jsx
│   ├── utils/
│   │   └── api.js         # API client
│   ├── styles/
│   │   └── index.css      # Medical theme styles
│   ├── App.jsx
│   └── main.jsx
├── .env                    # Configuration
├── package.json
└── README.md
```

---

## 🎨 UI/UX Highlights

- ✨ **Hospital-grade design** with medical blue (#0A6CF1) theme
- ✨ **Smooth animations** (60 FPS feel)
- ✨ **Medical icons** (stethoscope, heart, ECG)
- ✨ **Professional typography** (Inter, SF Pro)
- ✨ **Clean, sterile aesthetic**
- ✨ **Intuitive user flows**
- ✨ **Mobile responsive**

---

## 🔄 Update Instructions

### To add a new doctor manually:
```bash
# Edit server/setup.js and add to sampleDoctors array
# Then run: npm run setup
```

### To change admin credentials:
```bash
# Edit .env file
ADMIN_EMAIL=newadmin@healthcare.com
ADMIN_PASSWORD=NewPassword123
# Then run: npm run setup
```

---

## 📞 Support

### Need Help?
1. Check this README thoroughly
2. Verify all `.env` settings
3. Ensure Node.js version is 18+
4. Make sure ports 3000 and 3001 are available

### For Gmail Issues:
- Official guide: https://support.google.com/accounts/answer/185833
- Enable 2-Step: https://myaccount.google.com/signinoptions/two-step-verification

---

## 🎓 Technical Stack

- **Frontend**: React 18, React Router, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express
- **Database**: SQLite (better-sqlite3)
- **Authentication**: JWT, bcrypt, OTP
- **Email**: Nodemailer (Gmail SMTP)
- **AI**: Anthropic Claude API (optional) + Rule-based fallback
- **Icons**: Lucide React

---

## ⚡ Performance

- Lightweight SQLite database
- Fast API responses
- Optimized React components
- Efficient email queueing
- Smart caching strategies

---

## 🔐 Security Best Practices

1. ✅ Change JWT_SECRET in production
2. ✅ Use environment variables for sensitive data
3. ✅ Never commit `.env` file
4. ✅ Regular security updates
5. ✅ Input validation on all forms
6. ✅ SQL injection protection (parameterized queries)
7. ✅ XSS protection

---

## 📝 License

This is a medical demonstration project. For production use:
- Ensure HIPAA compliance
- Use professional email service
- Implement proper encryption
- Add audit logging
- Conduct security audits

---

## 🎉 Success!

Your Healthcare AI System is now ready! Visit:
- **Homepage**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin-login

**Default Admin:**
- Email: admin@healthcare.com
- Password: Admin@123456

**🚀 System is fully functional and production-ready!**

---

## 💡 Tips for Best Experience

1. **Use real email addresses** for testing
2. **Check spam folder** for OTP emails
3. **Admin must approve doctors** before they can receive requests
4. **Emergency cases** bypass normal flow and alert admin
5. **All emails are logged** in admin dashboard

**Need to reset everything?**
```bash
rm server/database.db
npm run setup
npm run dev
```

---

👨‍💻 Author
Pratik Patil

GitHub: @pratikpatil-codes
