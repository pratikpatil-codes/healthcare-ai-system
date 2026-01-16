# ⚡ WHAT TO CHANGE - Quick Reference

## 🎯 ONLY 2 THINGS YOU MUST CHANGE

### 1. EMAIL CONFIGURATION (MANDATORY) ⚠️

**File to edit:** `.env`

**What to change:**
```env
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-16-char-app-password
```

**How to get the app password:**

1. **Go to:** https://myaccount.google.com/apppasswords
2. **Enable 2-Step Verification first** (if not already enabled)
3. **Select:** Mail + Other (Custom name)
4. **Name it:** Healthcare System
5. **Click Generate**
6. **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)
7. **Paste in .env file WITHOUT SPACES**

**Example:**
```env
# ✅ CORRECT
EMAIL_USER=john.doe@gmail.com
EMAIL_APP_PASSWORD=abcdefghijklmnop

# ❌ WRONG (has spaces)
EMAIL_APP_PASSWORD=abcd efgh ijkl mnop

# ❌ WRONG (regular password)
EMAIL_APP_PASSWORD=MyPassword123
```

### 2. AI API KEY (OPTIONAL) 💡

**File to edit:** `.env`

**What to change:**
```env
ANTHROPIC_API_KEY=your-api-key-here
```

**⚠️ NOTE:** The system works perfectly WITHOUT this! It has built-in rule-based AI.

**To get a FREE API key (optional):**
1. Go to: https://console.anthropic.com/
2. Sign up for free account
3. Get your API key
4. Paste it in .env

**OR simply leave it as is - the rule-based AI works great!**

---

## 📝 OPTIONAL CHANGES

### Change Admin Credentials (Optional)

**File to edit:** `.env`

**Default:**
```env
ADMIN_EMAIL=admin@healthcare.com
ADMIN_PASSWORD=Admin@123456
```

**To customize:**
```env
ADMIN_EMAIL=youremail@example.com
ADMIN_PASSWORD=YourPassword123
```

**Then run:** `npm run setup` to apply

---

## 🚀 AFTER MAKING CHANGES

1. **Save the .env file**
2. **Run these commands:**
```bash
npm install
npm run setup
npm run dev
```

3. **Open browser:** http://localhost:3000

---

## ✅ THAT'S IT!

**Only change email settings, everything else works out of the box!**

### Quick Test:
1. Open http://localhost:3000
2. Click "Patient Portal"
3. Enter your email
4. Click "Send OTP"
5. **Check your email** - if OTP arrives, email is configured correctly! ✅

---

## 🆘 IF EMAILS DON'T WORK

### Checklist:
- [ ] Used Gmail address in EMAIL_USER?
- [ ] Generated App Password (not regular password)?
- [ ] App password has NO spaces?
- [ ] 2-Step Verification enabled on Gmail?
- [ ] Saved .env file?
- [ ] Restarted server? (Ctrl+C then npm run dev)

### Still not working?
1. Double-check the app password has no spaces
2. Try generating a new app password
3. Make sure you're using Gmail (not other email)
4. Check spam folder for OTP emails

---

## 📞 SUPPORT

**Read these files:**
- `SETUP_INSTRUCTIONS.md` - Detailed step-by-step guide
- `QUICK_START.md` - Fast setup guide  
- `README.md` - Complete documentation

**Common Commands:**
```bash
# Install
npm install

# Setup database
npm run setup

# Start system
npm run dev

# Reset everything
rm server/database.db
npm run setup
```

---

## 💡 REMEMBER

1. **Email configuration is MANDATORY** - system can't work without it
2. **AI API key is OPTIONAL** - rule-based AI works perfectly
3. **Everything else is pre-configured** - just run it!

---

**🎉 That's all you need to change! Now run: `npm run dev`**
