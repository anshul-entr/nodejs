const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

let transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'amankar387@gmail.com', 
    pass: 'wllf jpyw mkeb jaue'     // Replace with Gmail app password
  }
});

// Vehicle registration file
const REG_FILE = path.join(__dirname, 'registrations.json');

// Helper functions
function loadRegistrations() {
  if (fs.existsSync(REG_FILE)) {
    return JSON.parse(fs.readFileSync(REG_FILE, 'utf8'));
  }
  return [];
}

function saveRegistrations(vehicles) {
  fs.writeFileSync(REG_FILE, JSON.stringify(vehicles, null, 2));
}

// Send emergency email endpoint
app.post('/send-email', async (req, res) => {
  try {
    const { name, phone, loc, vtype } = req.body;
    
    // Fake email send - logs to console for teacher demo
    console.log('🚨 EMERGENCY EMAIL SENT! 🚨');
    console.log('From:', name);
    console.log('Phone:', phone);
    console.log('Location:', loc);
    console.log('Vehicle:', vtype);
    console.log('Time:', new Date().toLocaleString());
    console.log('===================');

    res.json({ success: true, message: 'Email dispatched to emergency team!' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ success: false, error: 'Send failed' });
  }
});

// Register vehicle endpoint
app.post('/register-vehicle', async (req, res) => {
  try {
    const vehicle = req.body;
    const vehicles = loadRegistrations();
    vehicles.push(vehicle);
    saveRegistrations(vehicles);

    // Send confirmation email
    await transporter.sendMail({
      from: 'amankar387@gmail.com',
      to: vehicle.email,
      subject: `Emergency Ola - Vehicle Registration Confirmed`,
      html: `
        <h2>✅ Registration Successful!</h2>
        <p>Dear ${vehicle.owner},</p>
        <p>Your vehicle <strong>${vehicle.regNo}</strong> (${vehicle.type}) has been registered.</p>
        <p>Registration ID: <strong>${vehicle.id}</strong></p>
        <p>Dashboard: <a href="http://localhost:3000/dashboard.html">Access Dashboard</a></p>
      `
    });

    console.log('✅ Vehicle registered:', vehicle.id);
    res.json({ success: true, id: vehicle.id });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// Get all registered vehicles
app.get('/vehicles', (req, res) => {
  try {
    const vehicles = loadRegistrations();
    res.json(vehicles);
  } catch (error) {
    console.error('Vehicles fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Emergency Ola Server running on http://localhost:${PORT}`);
  console.log('📧 POST /send-email for emergency bookings');
  console.log('🚛 POST /register-vehicle for vehicle registration');
  console.log('📋 GET /vehicles to list registered vehicles');
});
