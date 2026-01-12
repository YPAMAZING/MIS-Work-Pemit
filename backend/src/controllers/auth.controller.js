const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { createAuditLog } = require('../services/audit.service');

const prisma = new PrismaClient();

// Roles that require admin approval
const ROLES_REQUIRING_APPROVAL = ['SAFETY_OFFICER', 'SITE_ENGINEER', 'ADMIN'];

// Register new user
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, department, phone, requestedRole } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine if approval is needed
    const role = requestedRole || 'REQUESTOR';
    const needsApproval = ROLES_REQUIRING_APPROVAL.includes(role);

    // Find the role ID
    let roleRecord = await prisma.role.findUnique({
      where: { name: needsApproval ? 'REQUESTOR' : role }, // Temporarily assign REQUESTOR if needs approval
    });

    // If role doesn't exist, find REQUESTOR
    if (!roleRecord) {
      roleRecord = await prisma.role.findUnique({
        where: { name: 'REQUESTOR' },
      });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        department,
        phone,
        roleId: roleRecord?.id,
        isApproved: !needsApproval, // Auto-approve requestors
        requestedRole: needsApproval ? role : null,
      },
      include: {
        role: true,
      },
    });

    // Create audit log
    await createAuditLog({
      userId: user.id,
      action: needsApproval ? 'USER_REGISTRATION_PENDING' : 'USER_REGISTERED',
      entity: 'User',
      entityId: user.id,
      newValue: { email: user.email, requestedRole: role, needsApproval },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // If needs approval, don't generate token
    if (needsApproval) {
      return res.status(201).json({
        message: 'Registration submitted for approval',
        requiresApproval: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          requestedRole: role,
        },
      });
    }

    // Generate token for auto-approved users (Requestors)
    const token = jwt.sign(
      { userId: user.id, role: user.role?.name || 'REQUESTOR' },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role?.name || 'REQUESTOR',
        department: user.department,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with role
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Check if user is approved
    if (!user.isApproved) {
      return res.status(403).json({ 
        message: 'Your account is pending approval. Please wait for admin approval.',
        pendingApproval: true,
        requestedRole: user.requestedRole,
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const userRole = user.role?.name || 'REQUESTOR';

    // Generate token
    const token = jwt.sign(
      { userId: user.id, role: userRole },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    // Create audit log
    await createAuditLog({
      userId: user.id,
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: userRole,
        department: user.department,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

// Get current user
const me = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Error getting user info' });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    await createAuditLog({
      userId,
      action: 'PASSWORD_CHANGED',
      entity: 'User',
      entityId: userId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
};

module.exports = {
  register,
  login,
  me,
  changePassword,
};
