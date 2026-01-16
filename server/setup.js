import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const db = new Database(process.env.DB_PATH || './server/database.db');

console.log('🏥 Setting up Healthcare System Database...\n');

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Drop existing tables
console.log('Dropping existing tables...');
db.exec(`
  DROP TABLE IF EXISTS email_logs;
  DROP TABLE IF EXISTS appointments;
  DROP TABLE IF EXISTS patient_requests;
  DROP TABLE IF EXISTS doctors;
  DROP TABLE IF EXISTS patients;
  DROP TABLE IF EXISTS otps;
  DROP TABLE IF EXISTS admins;
`);

// Create Admin table
console.log('Creating Admin table...');
db.exec(`
  CREATE TABLE admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT 'System Admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create Patients table
console.log('Creating Patients table...');
db.exec(`
  CREATE TABLE patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
  )
`);

// Create Doctors table
console.log('Creating Doctors table...');
db.exec(`
  CREATE TABLE doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    specialty TEXT NOT NULL,
    location TEXT DEFAULT 'Nagpur, Maharashtra',
    hospital TEXT DEFAULT 'General Hospital',
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'blocked')),
    availability TEXT DEFAULT 'available',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME,
    approved_by INTEGER,
    FOREIGN KEY (approved_by) REFERENCES admins(id)
  )
`);

// Create Patient_Requests table
console.log('Creating Patient_Requests table...');
db.exec(`
  CREATE TABLE patient_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    symptoms TEXT NOT NULL,
    duration TEXT NOT NULL,
    severity INTEGER NOT NULL CHECK(severity BETWEEN 1 AND 10),
    red_flags BOOLEAN NOT NULL,
    medications TEXT,
    consent BOOLEAN NOT NULL,
    ai_analysis TEXT,
    suggested_specialty TEXT,
    severity_level TEXT CHECK(severity_level IN ('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY')),
    status TEXT DEFAULT 'PENDING_ANALYSIS' CHECK(status IN ('PENDING_ANALYSIS', 'ANALYZED', 'DOCTOR_ASSIGNED', 'CONFIRMED', 'EMERGENCY', 'CANCELLED')),
    assigned_doctor_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    analyzed_at DATETIME,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (assigned_doctor_id) REFERENCES doctors(id)
  )
`);

// Create Appointments table
console.log('Creating Appointments table...');
db.exec(`
  CREATE TABLE appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
    doctor_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    confirmed_at DATETIME,
    FOREIGN KEY (request_id) REFERENCES patient_requests(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
  )
`);

// Create OTPs table
console.log('Creating OTPs table...');
db.exec(`
  CREATE TABLE otps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    otp TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('patient', 'doctor', 'admin')),
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create Email_Logs table
console.log('Creating Email_Logs table...');
db.exec(`
  CREATE TABLE email_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'sent' CHECK(status IN ('sent', 'failed', 'pending')),
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert default admin
console.log('\nInserting default admin...');
const adminPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'Admin@123456', 10);
const adminEmail = process.env.ADMIN_EMAIL || 'admin@healthcare.com';

db.prepare(`
  INSERT INTO admins (email, password, name) 
  VALUES (?, ?, ?)
`).run(adminEmail, adminPassword, 'System Administrator');

// Insert sample doctors for testing
console.log('Inserting sample doctors...');
const sampleDoctors = [
  { name: 'Dr. Rajesh Kumar', email: 'rajesh.kumar@hospital.com', phone: '+91-9876543210', specialty: 'Cardiologist', location: 'Nagpur, Maharashtra', hospital: 'City Heart Hospital' },
  { name: 'Dr. Priya Sharma', email: 'priya.sharma@hospital.com', phone: '+91-9876543211', specialty: 'Dermatologist', location: 'Nagpur, Maharashtra', hospital: 'Skin Care Clinic' },
  { name: 'Dr. Amit Patel', email: 'amit.patel@hospital.com', phone: '+91-9876543212', specialty: 'Gastroenterologist', location: 'Nagpur, Maharashtra', hospital: 'Digestive Health Center' },
  { name: 'Dr. Sneha Deshmukh', email: 'sneha.deshmukh@hospital.com', phone: '+91-9876543213', specialty: 'Neurologist', location: 'Nagpur, Maharashtra', hospital: 'Neuro Care Hospital' },
  { name: 'Dr. Vikram Singh', email: 'vikram.singh@hospital.com', phone: '+91-9876543214', specialty: 'Orthopedic', location: 'Nagpur, Maharashtra', hospital: 'Bone & Joint Clinic' },
];

const insertDoctor = db.prepare(`
  INSERT INTO doctors (name, email, phone, specialty, location, hospital, status, approved_at, approved_by)
  VALUES (?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP, 1)
`);

sampleDoctors.forEach(doc => {
  insertDoctor.run(doc.name, doc.email, doc.phone, doc.specialty, doc.location, doc.hospital);
});

console.log('\n✅ Database setup complete!\n');
console.log('📊 Summary:');
console.log('- Admin account created');
console.log(`  Email: ${adminEmail}`);
console.log(`  Password: ${process.env.ADMIN_PASSWORD || 'Admin@123456'}`);
console.log(`- ${sampleDoctors.length} sample doctors added (all active)`);
console.log('\n🚀 You can now start the server with: npm run dev\n');

db.close();
