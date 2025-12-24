const express = require('express');
const { body, param } = require('express-validator');
const {
  getAllApprovals,
  getPendingCount,
  getApprovalById,
  updateApprovalDecision,
  getApprovalStats,
} = require('../controllers/approval.controller');
const { authenticate, isSafetyOfficer } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = express.Router();

// All routes require authentication and Safety Officer or Admin role
router.use(authenticate);
router.use(isSafetyOfficer);

// Get all approvals
router.get('/', getAllApprovals);

// Get pending count
router.get('/pending-count', getPendingCount);

// Get approval statistics
router.get('/stats', getApprovalStats);

// Get approval by ID
router.get(
  '/:id',
  [param('id').isUUID().withMessage('Invalid approval ID')],
  validate,
  getApprovalById
);

// Update approval decision (Approve/Reject)
router.put(
  '/:id/decision',
  [
    param('id').isUUID().withMessage('Invalid approval ID'),
    body('decision')
      .isIn(['APPROVED', 'REJECTED'])
      .withMessage('Decision must be APPROVED or REJECTED'),
    body('comment').optional().trim(),
  ],
  validate,
  updateApprovalDecision
);

module.exports = router;
