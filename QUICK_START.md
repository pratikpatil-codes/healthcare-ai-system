# 🚀 QUICK START GUIDE - Healthcare AI System

## ⚡ 5-Minute Setup

### Step 1: Install Node.js
- Download from: https://nodejs.org/
- Choose LTS version (v18 or higher)
- Install and verify: `node --version`

### Step 2: Install Dependencies
```bash
cd healthcare-system
npm install
```
**Wait time:** 2-3 minutes

### Step 3: Setup Database
```bash
npm run setup
```
**This creates:**
- Admin account (admin@healthcare.com / Admin@123456)
- 5 sample doctors (all active)
- All database tables

### Step 4: Configure Email

#### A. Enable 2-Step Verification on Gmail
1. Go to: https://myaccount.google.com/security
2. Enable "2-Step Verification"

#### B. Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" → "Other (Custom name)" → Name it "Healthcare"
3. Copy the 16-character password (looks like: `abcd efgh ijkl mnop`)

#### C. Update .env file
Open `.env` file and replace:
```env
EMAIL_USER=your-actual-email@gmail.com
EMAIL_APP_PASSWORD=abcdefghijklmnop
```
**⚠️ Remove ALL spaces from the password!**

### Step 5: Start the System
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
```

---

## ✅ Testing (1 minute)

### Test 1: Admin Login
1. Open: http://localhost:3000/admin-login
2. Email: `admin@healthcare.com`
3. Password: `Admin@123456`
4. Click "Login to Admin Panel"
5. ✅ You should see the admin dashboard!

### Test 2: Patient Registration
1. Open: http://localhost:3000
2. Click "Patient Portal"
3. Enter:
   - Name: Test Patient
   - Phone: +91 9876543210
   - Email: YOUR-EMAIL@gmail.com
4. Click "Send OTP"
5. **Check your email inbox** (or spam)
6. Enter the 6-digit OTP
7. ✅ You're logged in!

### Test 3: Submit a Request
1. In patient dashboard, fill the form:
   - Symptoms: "chest pain and shortness of breath"
   - Duration: "2 days"
   - Severity: 7
   - Warning signs: Yes
   - Medications: "none"
   - ✅ Check consent
2. Click "Submit Request"
3. ✅ System analyzes and assigns a doctor!
4. **Check the doctor's email** (if you used real doctor email)

---

## 🎯 What You Get

### Working Features:
✅ Beautiful medical-themed UI
✅ OTP-based login
✅ AI symptom analysis (rule-based)
✅ Automatic doctor matching
✅ Email notifications
✅ Doctor confirmation system
✅ Admin dashboard
✅ Complete appointment workflow

### Default Sample Doctors:
1. Dr. Rajesh Kumar - Cardiologist
2. Dr. Priya Sharma - Dermatologist
3. Dr. Amit Patel - Gastroenterologist
4. Dr. Sneha Deshmukh - Neurologist
5. Dr. Vikram Singh - Orthopedic

---

## 🔧 Common Issues

### Issue: "Cannot send email"
**Solution:**
1. Check `.env` file has correct Gmail address
2. App password has NO spaces
3. 2-Step Verification is enabled
4. Restart server: `Ctrl+C` then `npm run dev`

### Issue: "Port already in use"
**Solution:**
```bash
# Kill the process using port 3001
# On Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -ti:3001 | xargs kill -9
```

### Issue: "Module not found"
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📧 Email Configuration Help

### Where to get App Password?
1. **Visit**: https://myaccount.google.com/apppasswords
2. **Important**: You MUST have 2-Step Verification enabled first
3. **Generate**: Select "Mail" and give it a name
4. **Copy**: The 16-character code (like: `abcd efgh ijkl mnop`)
5. **Paste**: Into `.env` file WITHOUT spaces

### Example .env:
```env
# ✅ CORRECT
EMAIL_USER=myemail@gmail.com
EMAIL_APP_PASSWORD=abcdefghijklmnop

# ❌ WRONG (has spaces)
EMAIL_APP_PASSWORD=abcd efgh ijkl mnop

# ❌ WRONG (using regular password)
EMAIL_APP_PASSWORD=MyRegularPassword123
```

---

## 🎉 You're Done!

**System URLs:**
- Homepage: http://localhost:3000
- Admin: http://localhost:3000/admin-login
- Patient: http://localhost:3000/patient-login
- Doctor: http://localhost:3000/doctor-login

**Admin Credentials:**
- Email: admin@healthcare.com
- Password: Admin@123456

**Enjoy your Healthcare AI System! 🏥✨**

---

## 💡 Pro Tips

1. **Check spam folder** if you don't see OTP emails
2. **Use real email addresses** when testing
3. **Admin must approve new doctors** before they can work
4. **Emergency cases** alert admin immediately
5. **All emails are logged** in admin dashboard

**Need to reset?**
```bash
rm server/database.db
npm run setup
npm run dev
```

---

**Questions?** Read the full README.md for detailed documentation!
