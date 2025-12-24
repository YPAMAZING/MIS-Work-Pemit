const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@permitmanager.com' },
    update: {},
    create: {
      email: 'admin@permitmanager.com',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'ADMIN',
      department: 'IT',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create Safety Officer
  const safetyPassword = await bcrypt.hash('safety123', 10);
  const safetyOfficer = await prisma.user.upsert({
    where: { email: 'safety@permitmanager.com' },
    update: {},
    create: {
      email: 'safety@permitmanager.com',
      password: safetyPassword,
      firstName: 'John',
      lastName: 'Safety',
      role: 'SAFETY_OFFICER',
      department: 'HSE',
    },
  });
  console.log('✅ Safety Officer created:', safetyOfficer.email);

  // Create Requestor users
  const requestorPassword = await bcrypt.hash('user123', 10);
  const requestor1 = await prisma.user.upsert({
    where: { email: 'requestor@permitmanager.com' },
    update: {},
    create: {
      email: 'requestor@permitmanager.com',
      password: requestorPassword,
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'REQUESTOR',
      department: 'Operations',
    },
  });
  console.log('✅ Requestor created:', requestor1.email);

  const requestor2 = await prisma.user.upsert({
    where: { email: 'worker@permitmanager.com' },
    update: {},
    create: {
      email: 'worker@permitmanager.com',
      password: requestorPassword,
      firstName: 'Bob',
      lastName: 'Worker',
      role: 'REQUESTOR',
      department: 'Maintenance',
    },
  });
  console.log('✅ Requestor created:', requestor2.email);

  // Create sample permit requests (JSON strings for arrays)
  const permit1 = await prisma.permitRequest.create({
    data: {
      title: 'Hot Work Permit - Welding Operation',
      description: 'Welding work required for pipe repair in boiler room. Need to use arc welding equipment for approximately 4 hours.',
      location: 'Boiler Room B2',
      workType: 'HOT_WORK',
      startDate: new Date('2024-01-15T08:00:00Z'),
      endDate: new Date('2024-01-15T17:00:00Z'),
      status: 'PENDING',
      priority: 'HIGH',
      hazards: JSON.stringify(['Fire', 'Burns', 'Toxic fumes', 'Electric shock']),
      precautions: JSON.stringify(['Fire extinguisher nearby', 'Fire watch posted', 'Ventilation system active', 'PPE required']),
      equipment: JSON.stringify(['Arc welding machine', 'Welding helmet', 'Fire blanket', 'Gloves']),
      createdBy: requestor1.id,
    },
  });

  // Create approval record for permit1
  await prisma.permitApproval.create({
    data: {
      permitId: permit1.id,
      approverRole: 'SAFETY_OFFICER',
      decision: 'PENDING',
    },
  });
  console.log('✅ Permit request created:', permit1.title);

  const permit2 = await prisma.permitRequest.create({
    data: {
      title: 'Confined Space Entry - Tank Inspection',
      description: 'Entry into storage tank T-101 for annual inspection and cleaning. Gas testing required before entry.',
      location: 'Storage Area - Tank T-101',
      workType: 'CONFINED_SPACE',
      startDate: new Date('2024-01-16T09:00:00Z'),
      endDate: new Date('2024-01-16T15:00:00Z'),
      status: 'PENDING',
      priority: 'HIGH',
      hazards: JSON.stringify(['Oxygen deficiency', 'Toxic gases', 'Engulfment', 'Falls']),
      precautions: JSON.stringify(['Gas testing required', 'Rescue team standby', 'Communication system', 'Entry permit signed']),
      equipment: JSON.stringify(['Gas detector', 'Harness', 'Rescue tripod', 'Communication radio']),
      createdBy: requestor2.id,
    },
  });

  await prisma.permitApproval.create({
    data: {
      permitId: permit2.id,
      approverRole: 'SAFETY_OFFICER',
      decision: 'PENDING',
    },
  });
  console.log('✅ Permit request created:', permit2.title);

  const permit3 = await prisma.permitRequest.create({
    data: {
      title: 'Electrical Work Permit - Panel Upgrade',
      description: 'Upgrading main electrical panel in building A. Requires power isolation and lockout/tagout procedures.',
      location: 'Building A - Electrical Room',
      workType: 'ELECTRICAL',
      startDate: new Date('2024-01-17T07:00:00Z'),
      endDate: new Date('2024-01-17T18:00:00Z'),
      status: 'APPROVED',
      priority: 'MEDIUM',
      hazards: JSON.stringify(['Electric shock', 'Arc flash', 'Burns']),
      precautions: JSON.stringify(['LOTO procedures', 'Voltage testing', 'Insulated tools', 'PPE required']),
      equipment: JSON.stringify(['Voltage tester', 'Insulated gloves', 'Face shield', 'LOTO locks']),
      createdBy: requestor1.id,
    },
  });

  await prisma.permitApproval.create({
    data: {
      permitId: permit3.id,
      approverName: 'John Safety',
      approverRole: 'SAFETY_OFFICER',
      decision: 'APPROVED',
      comment: 'All safety requirements verified. Proceed with caution.',
      approvedAt: new Date('2024-01-14T10:30:00Z'),
    },
  });
  console.log('✅ Permit request created:', permit3.title);

  const permit4 = await prisma.permitRequest.create({
    data: {
      title: 'Working at Heights - Roof Maintenance',
      description: 'Routine maintenance and inspection of rooftop HVAC units. Fall protection required.',
      location: 'Main Building - Rooftop',
      workType: 'WORKING_AT_HEIGHT',
      startDate: new Date('2024-01-18T08:00:00Z'),
      endDate: new Date('2024-01-18T14:00:00Z'),
      status: 'REJECTED',
      priority: 'LOW',
      hazards: JSON.stringify(['Falls', 'Weather conditions', 'Slippery surfaces']),
      precautions: JSON.stringify(['Fall arrest system', 'Weather check', 'Buddy system', 'Guardrails']),
      equipment: JSON.stringify(['Safety harness', 'Lanyard', 'Anchor points', 'Safety helmet']),
      createdBy: requestor2.id,
    },
  });

  await prisma.permitApproval.create({
    data: {
      permitId: permit4.id,
      approverName: 'John Safety',
      approverRole: 'SAFETY_OFFICER',
      decision: 'REJECTED',
      comment: 'Weather forecast shows high winds. Please reschedule for a safer day.',
      approvedAt: new Date('2024-01-14T14:15:00Z'),
    },
  });
  console.log('✅ Permit request created:', permit4.title);

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
