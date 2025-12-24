const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { createAuditLog } = require('../services/audit.service');

const prisma = new PrismaClient();

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          department: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: { permitRequests: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { permitRequests: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

// Create user (Admin only)
const createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, department } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'REQUESTOR',
        department,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        createdAt: true,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'USER_CREATED',
      entity: 'User',
      entityId: user.id,
      newValue: { email: user.email, role: user.role },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, role, department, isActive } = req.body;

    const oldUser = await prisma.user.findUnique({ where: { id } });
    
    if (!oldUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only admin can change roles
    if (role && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admin can change roles' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        ...(req.user.role === 'ADMIN' && { role, isActive }),
        department,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        isActive: true,
        updatedAt: true,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'USER_UPDATED',
      entity: 'User',
      entityId: id,
      oldValue: { firstName: oldUser.firstName, lastName: oldUser.lastName, role: oldUser.role },
      newValue: { firstName: user.firstName, lastName: user.lastName, role: user.role },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Soft delete - deactivate instead of hard delete
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'USER_DELETED',
      entity: 'User',
      entityId: id,
      oldValue: { email: user.email, isActive: true },
      newValue: { isActive: false },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
