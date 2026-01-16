# 📋 COMPLETE SETUP INSTRUCTIONS

## 🎯 What You Need to Change Before Running

### 1️⃣ EMAIL CONFIGURATION (MANDATORY)

The system REQUIRES email configuration to send OTPs and notifications.

#### Step-by-Step Email Setup:

**A. Enable Gmail 2-Step Verification:**
1. Open: https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow prompts to enable it (you'll need your phone)

**B. Generate App Password:**
1. Go to: https://myaccount.google.com/apppasswords
2. You might need to sign in again
3. Select:
   - App: **Mail**
   - Device: **Other (Custom name)**
4. Type: "Healthcare System"
5. Click "Generate"
6. **COPY the 16-character password** (example: `abcd efgh ijkl mnop`)

**C. Update .env File:**
```bash
# Open the .env file in the healthcare-system folder
# Find these lines and replace with YOUR information:

EMAIL_USER=your-email@gmail.com          # Your actual Gmail address
EMAIL_APP_PASSWORD=abcdefghijklmnop      # The 16-char password (NO SPACES!)
```

**⚠️ CRITICAL:**
- Remove ALL spaces from the app password
- Use the app password, NOT your regular Gmail password
- Keep the .env file secure (never share it)

---

### 2️⃣ AI CONFIGURATION (OPTIONAL)

The system works perfectly WITHOUT an AI API key using intelligent rule-based analysis.

#### Option A: Use Rule-Based Analysis (FREE, NO API KEY NEEDED)
- ✅ Already configured
- ✅ No changes needed
- ✅ Works immediately
- ✅ Analyzes symptoms using medical keyword matching
- ✅ Determines severity automatically
- ✅ Maps to correct medical specialties

#### Option B: Enable Advanced AI (Optional)
If you want Claude AI analysis:

1. Get FREE API key: https://console.anthropic.com/
2. Sign up for an account
3. Get your API key
4. Update `.env`:
```env
ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here
```

**💡 Recommendation:** Start with rule-based (free), add AI later if needed.

---

### 3️⃣ ADMIN CREDENTIALS (OPTIONAL)

Default credentials work fine, but you can customize:

**Default:**
```env
ADMIN_EMAIL=admin@healthcare.com
ADMIN_PASSWORD=Admin@123456
```

**To customize:**
```env
ADMIN_EMAIL=youremail@example.com
ADMIN_PASSWORD=YourSecurePassword123
```

Then run: `npm run setup` to apply changes.

---

## 🚀 Installation Steps

### Step 1: Install Node.js
1. Download: https://nodejs.org/ (LTS version)
2. Run installer
3. Verify installation:
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

### Step 2: Extract Project
1. Extract the `healthcare-system` folder
2. Open terminal/command prompt
3. Navigate to the folder:
```bash
cd path/to/healthcare-system
```

### Step 3: Install Dependencies
```bash
npm install
```
**⏱️ This takes 2-3 minutes**

### Step 4: Configure Email
- Follow instructions in section 1️⃣ above
- Edit `.env` file with your email details
- **Save the file!**

### Step 5: Setup Database
```bash
npm run setup
```

**This creates:**
- SQLite database
- Admin account
- 5 sample doctors (all active and ready)
- All required tables

**You'll see:**
```
🏥 Setting up Healthcare System Database...
Dropping existing tables...
Creating Admin table...
Creating Patients table...
Creating Doctors table...
...
✅ Database setup complete!

📊 Summary:
- Admin account created
  Email: admin@healthcare.com
  Password: Admin@123456
- 5 sample doctors added (all active)

🚀 You can now start the server with: npm run dev
```

### Step 6: Start the System
```bash
npm run dev
```

**You'll see:**
```
🏥 Healthcare System Server Running
📍 Server: http://localhost:3001
🤖 AI Service: Rule-based fallback 🔄
✨ Ready to accept requests!

VITE v5.0.11  ready in 543 ms
➜  Local:   http://localhost:3000/
➜  press h to show help
```

**✅ The system is now running!**

---

## 🧪 Testing the System

### Test 1: Access Homepage
1. Open browser
2. Go to: http://localhost:3000
3. ✅ You should see the beautiful medical-themed homepage

### Test 2: Admin Login
1. Click "Admin Portal" in header
2. Or go to: http://localhost:3000/admin-login
3. Enter:
   - Email: `admin@healthcare.com`
   - Password: `Admin@123456`
4. Click "Login to Admin Panel"
5. ✅ You should see the admin dashboard with stats

### Test 3: Patient Registration & OTP
1. Go back to homepage
2. Click "Patient Portal"
3. Enter your details:
   - Full Name: "Test Patient"
   - Phone: "+91 9876543210"
   - Email: YOUR-ACTUAL-EMAIL@gmail.com
4. Click "Send OTP"
5. **Check your email inbox** (might be in spam)
6. Copy the 6-digit OTP
7. Enter it and click "Verify & Login"
8. ✅ You're now logged in to patient dashboard!

### Test 4: Submit Medical Request
1. Fill out the form:
   - **Symptoms:** "chest pain and shortness of breath"
   - **Duration:** "2 days"
   - **Severity:** Move slider to 7
   - **Warning signs:** Click "Yes"
   - **Medications:** "none" or leave empty
   - **Consent:** ✅ Check the checkbox
2. Click "Submit Request"
3. ✅ System analyzes and assigns a doctor!
4. ✅ You'll see success message with doctor info
5. **The doctor will receive an email** (if you set up email correctly)

### Test 5: Doctor Confirmation
1. Check the doctor's email (one of the sample doctors)
2. Open the appointment request email
3. Click "Confirm Appointment"
4. Select date and time
5. Click "Confirm Appointment"
6. ✅ Patient receives confirmation email!

---

## 📱 System URLs

Once running, access these URLs:

| Page | URL | Purpose |
|------|-----|---------|
| Homepage | http://localhost:3000 | Main landing page |
| Patient Login | http://localhost:3000/patient-login | Patient authentication |
| Patient Dashboard | http://localhost:3000/patient-dashboard | Submit requests & view history |
| Doctor Login | http://localhost:3000/doctor-login | Doctor authentication |
| Admin Login | http://localhost:3000/admin-login | Admin authentication |
| Admin Dashboard | http://localhost:3000/admin-dashboard | System management |

---

## 🔧 Troubleshooting

### Problem: npm install fails
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Problem: "Port 3000 already in use"
**Solution:**
```bash
# On Windows:
netstat -ano | findstr :3000
taskkill /PID <process_id> /F

# On Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Or change port in vite.config.js
```

### Problem: Emails not sending
**Checklist:**
- ✅ Gmail account has 2-Step Verification enabled?
- ✅ App password generated (not regular password)?
- ✅ App password has NO spaces in .env?
- ✅ EMAIL_USER matches your Gmail address?
- ✅ Saved .env file after editing?
- ✅ Restarted server after changing .env?

**Test email configuration:**
```bash
# In admin dashboard, check "Email Logs" tab
# If emails show "failed" status, credentials are wrong
```

### Problem: Database errors
**Solution:**
```bash
# Delete database and recreate
rm server/database.db
npm run setup
npm run dev
```

### Problem: "Cannot find module"
**Solution:**
```bash
# Reinstall dependencies
npm install
```

---

## 📊 What's Included

### Pre-configured Sample Doctors:
1. **Dr. Rajesh Kumar**
   - Email: rajesh.kumar@hospital.com
   - Specialty: Cardiologist
   - Status: Active ✅

2. **Dr. Priya Sharma**
   - Email: priya.sharma@hospital.com
   - Specialty: Dermatologist
   - Status: Active ✅

3. **Dr. Amit Patel**
   - Email: amit.patel@hospital.com
   - Specialty: Gastroenterologist
   - Status: Active ✅

4. **Dr. Sneha Deshmukh**
   - Email: sneha.deshmukh@hospital.com
   - Specialty: Neurologist
   - Status: Active ✅

5. **Dr. Vikram Singh**
   - Email: vikram.singh@hospital.com
   - Specialty: Orthopedic
   - Status: Active ✅

### Database Tables:
- ✅ admins
- ✅ patients
- ✅ doctors
- ✅ patient_requests
- ✅ appointments
- ✅ otps
- ✅ email_logs

---

## 🎨 Features Overview

### Patient Features:
- ✅ OTP-based registration/login
- ✅ Submit symptom requests (6 questions)
- ✅ View request history
- ✅ Receive email confirmations
- ✅ Track appointment status

### Doctor Features:
- ✅ OTP-based registration
- ✅ Receive patient requests via email
- ✅ Confirm/decline appointments
- ✅ Set appointment date/time
- ✅ View patient details

### Admin Features:
- ✅ Dashboard with statistics
- ✅ View all patients
- ✅ Manage doctors (approve/block)
- ✅ Monitor all requests
- ✅ View all appointments
- ✅ Check email logs
- ✅ Emergency case alerts

### AI Features:
- ✅ Symptom analysis
- ✅ Severity determination (LOW/MEDIUM/HIGH/EMERGENCY)
- ✅ Specialty mapping (Cardiologist, Dermatologist, etc.)
- ✅ Emergency detection
- ✅ Rule-based fallback (works without API)

---

## 📂 Project Structure

```
healthcare-system/
├── server/
│   ├── index.js              # Main backend server
│   ├── setup.js              # Database initialization
│   ├── emailService.js       # Email functionality
│   ├── aiService.js          # AI analysis
│   └── database.db           # SQLite database (created on setup)
├── src/
│   ├── pages/                # React pages
│   │   ├── Homepage.jsx
│   │   ├── PatientLogin.jsx
│   │   ├── PatientDashboard.jsx
│   │   ├── DoctorLogin.jsx
│   │   ├── AdminLogin.jsx
│   │   └── AdminDashboard.jsx
│   ├── utils/
│   │   └── api.js            # API client
│   ├── styles/
│   │   └── index.css         # Medical theme
│   └── main.jsx
├── .env                       # Configuration (YOU MUST EDIT THIS)
├── .env.example              # Template
├── package.json              # Dependencies
├── vite.config.js            # Frontend config
├── tailwind.config.js        # Styling config
├── README.md                 # Full documentation
├── QUICK_START.md            # Quick guide
└── SETUP_INSTRUCTIONS.md     # This file
```

---

## ⚙️ Configuration Files Explained

### .env (MUST EDIT)
Contains all sensitive configuration:
- Email credentials (REQUIRED)
- API keys (optional)
- Admin credentials
- JWT secret

### package.json
Lists all dependencies and scripts:
- `npm run dev` - Start both servers
- `npm run setup` - Initialize database
- `npm run server` - Backend only
- `npm run client` - Frontend only

### vite.config.js
Frontend configuration:
- Port: 3000
- Proxy to backend: 3001
- React plugin

---

## 🔒 Security Notes

### Development vs Production:

**Development (Current Setup):**
- ✅ Local database (SQLite)
- ✅ HTTP (not HTTPS)
- ✅ Simple JWT secret
- ✅ Local email testing

**For Production Use:**
- 🔄 Use PostgreSQL/MySQL
- 🔄 Enable HTTPS/SSL
- 🔄 Strong JWT secret
- 🔄 Professional email service (SendGrid)
- 🔄 Environment-based configs
- 🔄 Rate limiting
- 🔄 HIPAA compliance measures

---

## 📞 Getting Help

### If something doesn't work:

1. **Check this file** - Read troubleshooting section
2. **Check README.md** - Full documentation
3. **Check QUICK_START.md** - Simple guide
4. **Verify Node.js version** - Must be 18+
5. **Check email setup** - Most common issue
6. **Restart server** - After any .env changes

### Common Command Reference:
```bash
# Install dependencies
npm install

# Setup database
npm run setup

# Start system
npm run dev

# Stop system
Ctrl + C

# Reset database
rm server/database.db
npm run setup

# Check Node version
node --version

# Clear npm cache
npm cache clean --force
```

---

## ✅ Final Checklist

Before running, make sure:

- [ ] Node.js 18+ installed
- [ ] Extracted project folder
- [ ] Ran `npm install`
- [ ] Edited `.env` with Gmail address
- [ ] Edited `.env` with App Password (no spaces!)
- [ ] Ran `npm run setup`
- [ ] Started with `npm run dev`
- [ ] Opened http://localhost:3000 in browser

---

## 🎉 Success Indicators

You'll know it's working when:

✅ Homepage loads with medical theme
✅ Admin can login
✅ OTP emails arrive in inbox
✅ Patient can register and login
✅ Requests get analyzed
✅ Doctors are auto-assigned
✅ Emails are being sent
✅ Admin dashboard shows stats

---

## 💡 Pro Tips

1. **Always check spam folder** for OTP emails
2. **Use real email addresses** for testing
3. **Keep .env file secure** - never share it
4. **Restart server** after changing .env
5. **Check email logs** in admin dashboard
6. **Emergency cases** bypass automation
7. **Sample doctors** are already active

---

## 📚 Additional Resources

- **Full Documentation**: README.md
- **Quick Start**: QUICK_START.md
- **Gmail App Passwords**: https://support.google.com/accounts/answer/185833
- **Node.js Download**: https://nodejs.org/
- **Anthropic AI** (optional): https://console.anthropic.com/

---

**🏥 Your Healthcare AI System is ready to use!**

**Any questions? Check the README.md for more details!**
