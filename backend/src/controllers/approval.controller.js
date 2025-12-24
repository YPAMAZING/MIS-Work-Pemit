const { PrismaClient } = require('@prisma/client');
const { createAuditLog } = require('../services/audit.service');
const { transformPermitResponse } = require('../utils/arrayHelpers');

const prisma = new PrismaClient();

// Helper to transform approval with permit
const transformApproval = (approval) => {
  if (!approval) return null;
  return {
    ...approval,
    permit: approval.permit ? transformPermitResponse(approval.permit) : null,
  };
};

// Get all approvals (Safety Officer & Admin only)
const getAllApprovals = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      decision,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    
    if (decision) {
      where.decision = decision;
    }

    if (search) {
      where.permit = {
        OR: [
          { title: { contains: search } },
          { location: { contains: search } },
        ],
      };
    }

    const [approvals, total] = await Promise.all([
      prisma.permitApproval.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          permit: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  department: true,
                },
              },
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.permitApproval.count({ where }),
    ]);

    res.json({
      approvals: approvals.map(transformApproval),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get approvals error:', error);
    res.status(500).json({ message: 'Error fetching approvals' });
  }
};

// Get pending approvals count
const getPendingCount = async (req, res) => {
  try {
    const count = await prisma.permitApproval.count({
      where: { decision: 'PENDING' },
    });

    res.json({ count });
  } catch (error) {
    console.error('Get pending count error:', error);
    res.status(500).json({ message: 'Error fetching pending count' });
  }
};

// Get approval by ID
const getApprovalById = async (req, res) => {
  try {
    const { id } = req.params;

    const approval = await prisma.permitApproval.findUnique({
      where: { id },
      include: {
        permit: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                department: true,
              },
            },
          },
        },
      },
    });

    if (!approval) {
      return res.status(404).json({ message: 'Approval not found' });
    }

    res.json({ approval: transformApproval(approval) });
  } catch (error) {
    console.error('Get approval error:', error);
    res.status(500).json({ message: 'Error fetching approval' });
  }
};

// Update approval decision (Approve/Reject)
const updateApprovalDecision = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, comment } = req.body;
    const user = req.user;

    // Validate decision
    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      return res.status(400).json({ 
        message: 'Invalid decision. Must be APPROVED or REJECTED' 
      });
    }

    const existingApproval = await prisma.permitApproval.findUnique({
      where: { id },
      include: { permit: true },
    });

    if (!existingApproval) {
      return res.status(404).json({ message: 'Approval not found' });
    }

    if (existingApproval.decision !== 'PENDING') {
      return res.status(400).json({ 
        message: 'This approval has already been processed' 
      });
    }

    // Update approval and permit status in transaction
    const [updatedApproval, updatedPermit] = await prisma.$transaction([
      // Update approval record
      prisma.permitApproval.update({
        where: { id },
        data: {
          decision,
          comment,
          approverName: `${user.firstName} ${user.lastName}`,
          approvedAt: new Date(),
        },
      }),
      // Update permit status
      prisma.permitRequest.update({
        where: { id: existingApproval.permitId },
        data: { status: decision },
      }),
    ]);

    // Fetch complete approval with relations
    const completeApproval = await prisma.permitApproval.findUnique({
      where: { id },
      include: {
        permit: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                department: true,
              },
            },
          },
        },
      },
    });

    await createAuditLog({
      userId: user.id,
      action: decision === 'APPROVED' ? 'PERMIT_APPROVED' : 'PERMIT_REJECTED',
      entity: 'PermitApproval',
      entityId: id,
      oldValue: { decision: 'PENDING' },
      newValue: { decision, comment, approverName: `${user.firstName} ${user.lastName}` },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      message: `Permit ${decision.toLowerCase()} successfully`,
      approval: transformApproval(completeApproval),
    });
  } catch (error) {
    console.error('Update approval error:', error);
    res.status(500).json({ message: 'Error updating approval' });
  }
};

// Get approval statistics
const getApprovalStats = async (req, res) => {
  try {
    const [pending, approved, rejected, total] = await Promise.all([
      prisma.permitApproval.count({ where: { decision: 'PENDING' } }),
      prisma.permitApproval.count({ where: { decision: 'APPROVED' } }),
      prisma.permitApproval.count({ where: { decision: 'REJECTED' } }),
      prisma.permitApproval.count(),
    ]);

    // Get recent approvals
    const recentApprovals = await prisma.permitApproval.findMany({
      where: {
        decision: { not: 'PENDING' },
      },
      take: 5,
      orderBy: { approvedAt: 'desc' },
      include: {
        permit: {
          select: {
            title: true,
            workType: true,
          },
        },
      },
    });

    res.json({
      stats: {
        pending,
        approved,
        rejected,
        total,
        approvalRate: total > 0 ? ((approved / (approved + rejected)) * 100).toFixed(1) : 0,
      },
      recentApprovals,
    });
  } catch (error) {
    console.error('Get approval stats error:', error);
    res.status(500).json({ message: 'Error fetching approval stats' });
  }
};

module.exports = {
  getAllApprovals,
  getPendingCount,
  getApprovalById,
  updateApprovalDecision,
  getApprovalStats,
};
