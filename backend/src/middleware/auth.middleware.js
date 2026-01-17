const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const config = require('../config');

const prisma = new PrismaClient();

// Verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          role: true,
        },
      });

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: 'Account is deactivated' });
      }

      // Parse role permissions and UI config
      const permissions = user.role ? JSON.parse(user.role.permissions || '[]') : [];
      const uiConfig = user.role ? JSON.parse(user.role.uiConfig || '{}') : {};

      req.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role?.name || 'REQUESTOR',
        roleId: user.roleId,
        roleName: user.role?.displayName || 'Requestor',
        department: user.department,
        isActive: user.isActive,
        permissions,
        uiConfig,
      };
      
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Check if user has specific permission
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Admin has all permissions
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // Check if user has the required permission
    if (req.user.permissions && req.user.permissions.includes(requiredPermission)) {
      return next();
    }

    return res.status(403).json({ 
      message: 'Access denied. Insufficient permissions.',
      required: requiredPermission,
    });
  };
};

// Check if user has any of the specified permissions
const checkAnyPermission = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Admin has all permissions
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // Check if user has any of the required permissions
    const hasPermission = permissions.some(perm => 
      req.user.permissions && req.user.permissions.includes(perm)
    );

    if (hasPermission) {
      return next();
    }

    return res.status(403).json({ 
      message: 'Access denied. Insufficient permissions.',
      required: permissions,
    });
  };
};

// Role-based authorization (legacy support)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Flatten roles array (handles both authorize('ADMIN') and authorize(['ADMIN', 'SAFETY']))
    const flatRoles = roles.flat();

    if (!flatRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.',
        required: flatRoles,
        current: req.user.role,
      });
    }

    next();
  };
};

// Check if user is Admin (now also supports custom roles with admin-level permissions)
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Admin role has all permissions
  if (req.user.role === 'ADMIN') {
    return next();
  }

  // Check if custom role has user management permissions
  if (req.user.permissions && (
    req.user.permissions.includes('users.manage') ||
    req.user.permissions.includes('users.edit') ||
    req.user.permissions.includes('users.assign_role')
  )) {
    return next();
  }

  return res.status(403).json({ 
    message: 'Access denied. Admin privileges required.',
    current: req.user.role,
  });
};

// Check if user is Safety Officer (now also supports custom roles with approval permission)
const isSafetyOfficer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Admin has all permissions
  if (req.user.role === 'ADMIN') {
    return next();
  }

  // Safety Officer has approval access
  if (req.user.role === 'SAFETY_OFFICER') {
    return next();
  }

  // Check if custom role has approval permission
  if (req.user.permissions && (
    req.user.permissions.includes('approvals.view') ||
    req.user.permissions.includes('approvals.approve')
  )) {
    return next();
  }

  return res.status(403).json({ 
    message: 'Access denied. Insufficient permissions.',
    required: ['SAFETY_OFFICER', 'ADMIN', 'or approvals.view permission'],
    current: req.user.role,
  });
};

// Check if user can approve permits
const canApprove = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Admin and Safety Officer can approve
  if (req.user.role === 'ADMIN' || req.user.role === 'SAFETY_OFFICER') {
    return next();
  }

  // Check if custom role has approve permission
  if (req.user.permissions && req.user.permissions.includes('approvals.approve')) {
    return next();
  }

  return res.status(403).json({ 
    message: 'Access denied. You do not have permission to approve permits.',
    required: 'approvals.approve',
  });
};

// Check if user is Requestor
const isRequestor = authorize('REQUESTOR', 'SAFETY_OFFICER', 'ADMIN');

module.exports = {
  authenticate,
  authorize,
  checkPermission,
  checkAnyPermission,
  isAdmin,
  isSafetyOfficer,
  canApprove,
  isRequestor,
};
