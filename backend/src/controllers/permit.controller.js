const { PrismaClient } = require('@prisma/client');
const { createAuditLog } = require('../services/audit.service');
const { transformPermitResponse, transformPermitForStorage } = require('../utils/arrayHelpers');

const prisma = new PrismaClient();

// Helper to transform multiple permits
const transformPermits = (permits) => permits.map(transformPermitResponse);

// Get all permits
const getAllPermits = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      workType, 
      search,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const user = req.user;

    // Build where clause based on role
    const where = {};
    
    // Requestors can only see their own permits
    if (user.role === 'REQUESTOR') {
      where.createdBy = user.id;
    }

    if (status) {
      where.status = status;
    }

    if (workType) {
      where.workType = workType;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
      ];
    }

    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate.gte = new Date(startDate);
      if (endDate) where.startDate.lte = new Date(endDate);
    }

    const [permits, total] = await Promise.all([
      prisma.permitRequest.findMany({
        where,
        skip,
        take: parseInt(limit),
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
          approvals: {
            select: {
              id: true,
              decision: true,
              approverName: true,
              comment: true,
              approvedAt: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.permitRequest.count({ where }),
    ]);

    res.json({
      permits: transformPermits(permits),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get permits error:', error);
    res.status(500).json({ message: 'Error fetching permits' });
  }
};

// Get permit by ID
const getPermitById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const permit = await prisma.permitRequest.findUnique({
      where: { id },
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
        approvals: {
          include: {
            permit: false,
          },
        },
      },
    });

    if (!permit) {
      return res.status(404).json({ message: 'Permit not found' });
    }

    // Requestors can only view their own permits
    if (user.role === 'REQUESTOR' && permit.createdBy !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ permit: transformPermitResponse(permit) });
  } catch (error) {
    console.error('Get permit error:', error);
    res.status(500).json({ message: 'Error fetching permit' });
  }
};

// Create permit
const createPermit = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      workType,
      startDate,
      endDate,
      priority,
      hazards,
      precautions,
      equipment,
    } = req.body;

    const user = req.user;

    // Transform arrays to JSON strings for storage
    const permitData = transformPermitForStorage({
      title,
      description,
      location,
      workType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      priority: priority || 'MEDIUM',
      hazards: hazards || [],
      precautions: precautions || [],
      equipment: equipment || [],
      status: 'PENDING',
      createdBy: user.id,
    });

    // Create permit with automatic approval record
    const permit = await prisma.$transaction(async (tx) => {
      // Create permit request
      const newPermit = await tx.permitRequest.create({
        data: permitData,
      });

      // Automatically create approval record
      await tx.permitApproval.create({
        data: {
          permitId: newPermit.id,
          approverRole: 'SAFETY_OFFICER',
          decision: 'PENDING',
        },
      });

      return newPermit;
    });

    // Fetch complete permit with relations
    const completePermit = await prisma.permitRequest.findUnique({
      where: { id: permit.id },
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
        approvals: true,
      },
    });

    await createAuditLog({
      userId: user.id,
      action: 'PERMIT_CREATED',
      entity: 'PermitRequest',
      entityId: permit.id,
      newValue: { title, workType, status: 'PENDING' },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({
      message: 'Permit request created successfully',
      permit: transformPermitResponse(completePermit),
    });
  } catch (error) {
    console.error('Create permit error:', error);
    res.status(500).json({ message: 'Error creating permit' });
  }
};

// Update permit
const updatePermit = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const {
      title,
      description,
      location,
      workType,
      startDate,
      endDate,
      priority,
      hazards,
      precautions,
      equipment,
    } = req.body;

    const existingPermit = await prisma.permitRequest.findUnique({
      where: { id },
    });

    if (!existingPermit) {
      return res.status(404).json({ message: 'Permit not found' });
    }

    // Only creator can update, and only if still pending
    if (user.role === 'REQUESTOR' && existingPermit.createdBy !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (existingPermit.status !== 'PENDING' && user.role !== 'ADMIN') {
      return res.status(400).json({ 
        message: 'Cannot update permit that is already processed' 
      });
    }

    // Build update data
    const updateData = transformPermitForStorage({
      title,
      description,
      location,
      workType,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      priority,
      hazards,
      precautions,
      equipment,
    });

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const permit = await prisma.permitRequest.update({
      where: { id },
      data: updateData,
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
        approvals: true,
      },
    });

    await createAuditLog({
      userId: user.id,
      action: 'PERMIT_UPDATED',
      entity: 'PermitRequest',
      entityId: id,
      oldValue: { title: existingPermit.title, workType: existingPermit.workType },
      newValue: { title: permit.title, workType: permit.workType },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ message: 'Permit updated successfully', permit: transformPermitResponse(permit) });
  } catch (error) {
    console.error('Update permit error:', error);
    res.status(500).json({ message: 'Error updating permit' });
  }
};

// Delete permit
const deletePermit = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const existingPermit = await prisma.permitRequest.findUnique({
      where: { id },
    });

    if (!existingPermit) {
      return res.status(404).json({ message: 'Permit not found' });
    }

    // Only creator or admin can delete
    if (user.role === 'REQUESTOR' && existingPermit.createdBy !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only pending permits can be deleted by requestor
    if (existingPermit.status !== 'PENDING' && user.role !== 'ADMIN') {
      return res.status(400).json({ 
        message: 'Cannot delete permit that is already processed' 
      });
    }

    await prisma.permitRequest.delete({
      where: { id },
    });

    await createAuditLog({
      userId: user.id,
      action: 'PERMIT_DELETED',
      entity: 'PermitRequest',
      entityId: id,
      oldValue: { title: existingPermit.title, status: existingPermit.status },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ message: 'Permit deleted successfully' });
  } catch (error) {
    console.error('Delete permit error:', error);
    res.status(500).json({ message: 'Error deleting permit' });
  }
};

// Get work types
const getWorkTypes = async (req, res) => {
  const workTypes = [
    { value: 'HOT_WORK', label: 'Hot Work', icon: 'fire', color: '#ef4444' },
    { value: 'CONFINED_SPACE', label: 'Confined Space Entry', icon: 'box', color: '#f97316' },
    { value: 'ELECTRICAL', label: 'Electrical Work', icon: 'bolt', color: '#eab308' },
    { value: 'WORKING_AT_HEIGHT', label: 'Working at Height', icon: 'arrow-up', color: '#3b82f6' },
    { value: 'EXCAVATION', label: 'Excavation', icon: 'hard-hat', color: '#8b5cf6' },
    { value: 'LIFTING', label: 'Lifting Operations', icon: 'crane', color: '#06b6d4' },
    { value: 'CHEMICAL', label: 'Chemical Handling', icon: 'flask', color: '#10b981' },
    { value: 'RADIATION', label: 'Radiation Work', icon: 'radiation', color: '#f59e0b' },
    { value: 'GENERAL', label: 'General Work', icon: 'wrench', color: '#6b7280' },
  ];

  res.json({ workTypes });
};

module.exports = {
  getAllPermits,
  getPermitById,
  createPermit,
  updatePermit,
  deletePermit,
  getWorkTypes,
};
