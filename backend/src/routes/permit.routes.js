const express = require('express');
const { body, param } = require('express-validator');
const {
  getAllPermits,
  getPermitById,
  createPermit,
  updatePermit,
  deletePermit,
  getWorkTypes,
  getPublicPermitInfo,
  registerWorkers,
} = require('../controllers/permit.controller');
const { authenticate, isRequestor } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = express.Router();

// Public routes (no auth required)
router.get('/work-types', getWorkTypes);

// Public permit info for QR code scanning
router.get(
  '/:id/public',
  [param('id').isUUID().withMessage('Invalid permit ID')],
  validate,
  getPublicPermitInfo
);

// Register workers via QR code (public)
router.post(
  '/:id/workers',
  [
    param('id').isUUID().withMessage('Invalid permit ID'),
    body('contractor').isObject().withMessage('Contractor info required'),
    body('workers').isArray().withMessage('Workers list required'),
  ],
  validate,
  registerWorkers
);

// Protected routes
router.use(authenticate);

// Get all permits
router.get('/', getAllPermits);

// Get permit by ID
router.get(
  '/:id',
  [param('id').isUUID().withMessage('Invalid permit ID')],
  validate,
  getPermitById
);

// Create permit (Requestor, Safety Officer, Admin)
router.post(
  '/',
  isRequestor,
  [
    body('title').notEmpty().trim().withMessage('Title is required'),
    body('description').notEmpty().trim().withMessage('Description is required'),
    body('location').notEmpty().trim().withMessage('Location is required'),
    body('workType').notEmpty().withMessage('Work type is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('priority')
      .optional()
      .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
      .withMessage('Invalid priority'),
    body('hazards').optional().isArray().withMessage('Hazards must be an array'),
    body('precautions').optional().isArray().withMessage('Precautions must be an array'),
    body('equipment').optional().isArray().withMessage('Equipment must be an array'),
  ],
  validate,
  createPermit
);

// Update permit
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid permit ID'),
    body('title').optional().trim(),
    body('description').optional().trim(),
    body('location').optional().trim(),
    body('workType').optional(),
    body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
    body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
    body('priority')
      .optional()
      .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
      .withMessage('Invalid priority'),
  ],
  validate,
  updatePermit
);

// Delete permit
router.delete(
  '/:id',
  [param('id').isUUID().withMessage('Invalid permit ID')],
  validate,
  deletePermit
);

module.exports = router;
