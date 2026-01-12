// OTP Service - Generates and verifies OTPs
// For production, integrate with actual SMS/Email providers like Twilio, SendGrid, etc.

const otpStore = new Map(); // In production, use Redis or database

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP with expiry (5 minutes)
const storeOTP = (identifier, otp) => {
  const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes
  otpStore.set(identifier, { otp, expiry });
  
  // Clean up expired OTPs
  setTimeout(() => {
    otpStore.delete(identifier);
  }, 5 * 60 * 1000);
};

// Verify OTP
const verifyOTP = (identifier, otp) => {
  const stored = otpStore.get(identifier);
  
  if (!stored) {
    return { valid: false, message: 'OTP expired or not found' };
  }
  
  if (Date.now() > stored.expiry) {
    otpStore.delete(identifier);
    return { valid: false, message: 'OTP expired' };
  }
  
  if (stored.otp !== otp) {
    return { valid: false, message: 'Invalid OTP' };
  }
  
  // OTP is valid, remove it
  otpStore.delete(identifier);
  return { valid: true };
};

// Send OTP via Email (mock - replace with actual email service)
const sendEmailOTP = async (email, otp) => {
  // In production, use nodemailer, SendGrid, etc.
  console.log(`📧 OTP sent to email ${email}: ${otp}`);
  
  // Mock implementation - always succeeds
  // Replace with actual email sending logic
  /*
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  
  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: email,
    subject: 'Your OTP for Reliable Group MEP Registration',
    html: `
      <h2>Reliable Group MEP - Work Permit System</h2>
      <p>Your OTP for registration is:</p>
      <h1 style="color: #1e3a6e; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
      <p>This OTP is valid for 5 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });
  */
  
  return true;
};

// Send OTP via SMS (mock - replace with actual SMS service)
const sendSMSOTP = async (phone, otp) => {
  // In production, use Twilio, MSG91, etc.
  console.log(`📱 OTP sent to phone ${phone}: ${otp}`);
  
  // Mock implementation - always succeeds
  // Replace with actual SMS sending logic
  /*
  const twilio = require('twilio');
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  
  await client.messages.create({
    body: `Your OTP for Reliable Group MEP registration is: ${otp}. Valid for 5 minutes.`,
    from: process.env.TWILIO_PHONE,
    to: phone,
  });
  */
  
  return true;
};

// Send OTP to both email and phone (same OTP)
const sendOTP = async (email, phone) => {
  const otp = generateOTP();
  
  // Store OTP for both identifiers (same OTP)
  const sessionKey = `${email}_${phone}`;
  storeOTP(sessionKey, otp);
  storeOTP(email, otp);
  storeOTP(phone, otp);
  
  // Send to both channels
  const results = {
    email: false,
    phone: false,
    otp: otp, // For development only - remove in production
  };
  
  try {
    if (email) {
      await sendEmailOTP(email, otp);
      results.email = true;
    }
  } catch (error) {
    console.error('Email OTP failed:', error);
  }
  
  try {
    if (phone) {
      await sendSMSOTP(phone, otp);
      results.phone = true;
    }
  } catch (error) {
    console.error('SMS OTP failed:', error);
  }
  
  return results;
};

// Verify OTP with either email or phone
const verifyRegistrationOTP = (email, phone, otp) => {
  // Try session key first
  const sessionKey = `${email}_${phone}`;
  let result = verifyOTP(sessionKey, otp);
  
  if (result.valid) {
    // Clean up other keys
    otpStore.delete(email);
    otpStore.delete(phone);
    return result;
  }
  
  // Try email
  result = verifyOTP(email, otp);
  if (result.valid) {
    otpStore.delete(phone);
    otpStore.delete(sessionKey);
    return result;
  }
  
  // Try phone
  result = verifyOTP(phone, otp);
  if (result.valid) {
    otpStore.delete(email);
    otpStore.delete(sessionKey);
    return result;
  }
  
  return { valid: false, message: 'Invalid or expired OTP' };
};

// Send OTP for password change to both email and phone (if available)
const sendPasswordChangeOTP = async (email, phone) => {
  const otp = generateOTP();
  
  // Store OTP with password change prefix
  const passwordChangeKey = `pwd_${email}`;
  storeOTP(passwordChangeKey, otp);
  
  // Also store with phone if available
  if (phone) {
    storeOTP(`pwd_${phone}`, otp);
  }
  
  const results = {
    email: false,
    phone: false,
    otp: otp, // For development only - remove in production
  };
  
  try {
    if (email) {
      await sendEmailOTP(email, otp);
      results.email = true;
    }
  } catch (error) {
    console.error('Email OTP failed:', error);
  }
  
  try {
    if (phone) {
      await sendSMSOTP(phone, otp);
      results.phone = true;
    }
  } catch (error) {
    console.error('SMS OTP failed:', error);
  }
  
  return results;
};

// Verify OTP for password change
const verifyPasswordChangeOTP = (email, phone, otp) => {
  // Try email key first
  const emailKey = `pwd_${email}`;
  let result = verifyOTP(emailKey, otp);
  
  if (result.valid) {
    // Clean up phone key if exists
    if (phone) {
      otpStore.delete(`pwd_${phone}`);
    }
    return result;
  }
  
  // Try phone key
  if (phone) {
    const phoneKey = `pwd_${phone}`;
    result = verifyOTP(phoneKey, otp);
    if (result.valid) {
      otpStore.delete(emailKey);
      return result;
    }
  }
  
  return { valid: false, message: 'Invalid or expired OTP' };
};

module.exports = {
  generateOTP,
  sendOTP,
  verifyOTP,
  verifyRegistrationOTP,
  sendPasswordChangeOTP,
  verifyPasswordChangeOTP,
};
