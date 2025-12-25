const { PrismaClient } = require('@prisma/client');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

const prisma = new PrismaClient();

// Work type labels
const workTypeLabels = {
  'HOT_WORK': 'HOT WORK PERMIT',
  'CONFINED_SPACE': 'CONFINED SPACE PERMIT',
  'ELECTRICAL': 'ELECTRICAL WORK PERMIT',
  'WORKING_AT_HEIGHT': 'WORKING AT HEIGHT PERMIT',
  'EXCAVATION': 'EXCAVATION PERMIT',
  'LIFTING': 'LIFTING OPERATIONS PERMIT',
  'CHEMICAL': 'CHEMICAL HANDLING PERMIT',
  'RADIATION': 'RADIATION WORK PERMIT',
  'GENERAL': 'GENERAL WORK PERMIT',
  'COLD_WORK': 'COLD WORK PERMIT',
  'LOTO': 'LOTO PERMIT',
  'VEHICLE': 'VEHICLE WORK PERMIT',
  'PRESSURE_TESTING': 'HYDRO PRESSURE TESTING PERMIT',
  'ENERGIZE': 'ENERGIZE PERMIT',
  'SWMS': 'SAFE WORK METHOD STATEMENT',
};

// Status colors
const statusColors = {
  'PENDING': '#f59e0b',
  'APPROVED': '#10b981',
  'REJECTED': '#ef4444',
  'CLOSED': '#6b7280',
  'EXTENDED': '#3b82f6',
};

// Generate permit PDF
const generatePermitPDF = async (req, res) => {
  try {
    const { id } = req.params;

    // Get permit with all related data
    const permit = await prisma.permitRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            department: true,
          },
        },
        approvals: true,
      },
    });

    if (!permit) {
      return res.status(404).json({ message: 'Permit not found' });
    }

    // Parse JSON fields
    const workers = JSON.parse(permit.workers || '[]');
    const measures = JSON.parse(permit.measures || '[]');
    const hazards = JSON.parse(permit.hazards || '[]');
    const precautions = JSON.parse(permit.precautions || '[]');
    const equipment = JSON.parse(permit.equipment || '[]');
    const closureChecklist = JSON.parse(permit.closureChecklist || '[]');

    // Generate QR code
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const permitUrl = `${baseUrl}/permits/${permit.id}`;
    const qrCodeBuffer = await QRCode.toBuffer(permitUrl, {
      width: 100,
      margin: 1,
    });

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${permit.permitNumber}.pdf"`);

    // Pipe PDF to response
    doc.pipe(res);

    // === HEADER ===
    // Company name (left side)
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#1e293b')
       .text(permit.companyName || 'COMPANY', 50, 50);

    // Permit type title (center)
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#1e293b')
       .text(workTypeLabels[permit.workType] || 'WORK PERMIT', 200, 55, { width: 200, align: 'center' });

    // Requested by info
    doc.fontSize(10).font('Helvetica').fillColor('#64748b')
       .text(`Requested by ${permit.user.firstName} ${permit.user.lastName} on ${new Date(permit.createdAt).toLocaleDateString()}`, 200, 78, { width: 200, align: 'center' });

    // QR Code (right side)
    doc.image(qrCodeBuffer, 470, 40, { width: 80, height: 80 });

    // Permit number and status
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e293b')
       .text(permit.permitNumber, 50, 100);

    // Status badge
    const statusX = 470;
    const statusColor = statusColors[permit.status] || '#6b7280';
    doc.roundedRect(statusX, 130, 80, 20, 3).fill(statusColor);
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff')
       .text(permit.status, statusX, 135, { width: 80, align: 'center' });

    // Horizontal line
    doc.moveTo(50, 160).lineTo(545, 160).stroke('#e2e8f0');

    let yPos = 175;

    // === WORKERS SECTION ===
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#ffffff');
    doc.rect(50, yPos, 495, 22).fill('#334155');
    doc.text('WORKERS', 55, yPos + 6);
    yPos += 30;

    if (workers.length > 0) {
      // Table header
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#64748b');
      doc.text('Name', 55, yPos);
      doc.text('Company', 200, yPos);
      doc.text('Phone', 350, yPos);
      doc.text('Badge No.', 450, yPos);
      yPos += 15;
      doc.moveTo(50, yPos).lineTo(545, yPos).stroke('#e2e8f0');
      yPos += 8;

      // Table rows
      doc.font('Helvetica').fillColor('#1e293b');
      workers.forEach((worker, index) => {
        doc.fontSize(9);
        doc.text(worker.name || '-', 55, yPos, { width: 140 });
        doc.text(worker.company || '-', 200, yPos, { width: 140 });
        doc.text(worker.phone || '-', 350, yPos, { width: 90 });
        doc.text(worker.badgeNumber || '-', 450, yPos, { width: 90 });
        yPos += 18;
      });
    } else {
      doc.fontSize(9).font('Helvetica').fillColor('#64748b')
         .text('No workers assigned', 55, yPos);
      yPos += 20;
    }

    yPos += 10;

    // === LOCATION & DURATION ===
    // Location box
    doc.rect(50, yPos, 240, 70).stroke('#e2e8f0');
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#ffffff');
    doc.rect(50, yPos, 240, 20).fill('#334155');
    doc.text('LOCATION OF WORK', 55, yPos + 5);
    doc.fontSize(9).font('Helvetica').fillColor('#1e293b')
       .text(permit.location, 55, yPos + 28, { width: 230 });
    doc.fontSize(8).fillColor('#64748b')
       .text(permit.timezone || 'UTC', 55, yPos + 55);

    // Duration box
    doc.rect(305, yPos, 240, 70).stroke('#e2e8f0');
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#ffffff');
    doc.rect(305, yPos, 240, 20).fill('#334155');
    doc.text('DURATION OF WORK', 310, yPos + 5);
    
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#64748b');
    doc.text('Start Time', 310, yPos + 28);
    doc.text('End Time', 395, yPos + 28);
    doc.text('Extended', 480, yPos + 28);
    
    doc.fontSize(9).font('Helvetica').fillColor('#1e293b');
    doc.text(new Date(permit.startDate).toLocaleString(), 310, yPos + 42, { width: 80 });
    doc.text(new Date(permit.endDate).toLocaleString(), 395, yPos + 42, { width: 80 });
    doc.text(permit.isExtended ? 'YES' : 'NO', 480, yPos + 42);

    yPos += 85;

    // === MEASURES SECTION ===
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#ffffff');
    doc.rect(50, yPos, 495, 22).fill('#334155');
    doc.text('MEASURES', 55, yPos + 6);
    yPos += 30;

    // Default measures if none exist
    const defaultMeasures = [
      { question: 'Instruction to Personnel regarding hazards involved and working procedure.', answer: null },
      { question: 'Are Other Contractors working nearby notified?', answer: null },
      { question: 'Is there any other work permit is obtained?', answer: null },
      { question: 'Are escape routes to be provided and kept clear?', answer: null },
      { question: 'Is combustible material to be removed / covered from and nearby site (up to 5mtr min.)', answer: null },
      { question: 'Is the area immediately below the work spot been cleared / removed of oil, grease & waste cotton etc...?', answer: null },
      { question: 'Has gas connection been tested in case there is gas valve / gas line nearby?', answer: null },
      { question: 'Is fire extinguisher been kept handy at site?', answer: null },
      { question: 'Has tin sheet / fire retardant cloth/ sheet been placed to contain hot spatters of welding / gas cutting?', answer: null },
      { question: 'Have all drain inlets been closed?', answer: null },
    ];

    const displayMeasures = measures.length > 0 ? measures : defaultMeasures;

    displayMeasures.forEach((measure, index) => {
      if (yPos > 720) {
        doc.addPage();
        yPos = 50;
      }

      doc.fontSize(9).font('Helvetica').fillColor('#1e293b')
         .text(`${measure.question}`, 55, yPos, { width: 380 });

      // Answer badges
      const badgeY = yPos;
      const answers = ['YES', 'NO', 'N/A'];
      let badgeX = 450;
      
      answers.forEach((ans) => {
        const isSelected = measure.answer === ans;
        const bgColor = isSelected ? 
          (ans === 'YES' ? '#10b981' : ans === 'NO' ? '#ef4444' : '#6b7280') : 
          '#e2e8f0';
        const textColor = isSelected ? '#ffffff' : '#64748b';
        
        doc.roundedRect(badgeX, badgeY, 28, 14, 2).fill(bgColor);
        doc.fontSize(7).font('Helvetica-Bold').fillColor(textColor)
           .text(ans, badgeX, badgeY + 3, { width: 28, align: 'center' });
        badgeX += 32;
      });

      yPos += 25;
    });

    // === HAZARDS SECTION ===
    if (hazards.length > 0) {
      if (yPos > 680) {
        doc.addPage();
        yPos = 50;
      }

      yPos += 10;
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#ffffff');
      doc.rect(50, yPos, 495, 22).fill('#dc2626');
      doc.text('HAZARDS IDENTIFIED', 55, yPos + 6);
      yPos += 30;

      doc.fontSize(9).font('Helvetica').fillColor('#1e293b');
      hazards.forEach((hazard) => {
        doc.text(`• ${hazard}`, 55, yPos, { width: 480 });
        yPos += 15;
      });
    }

    // === PRECAUTIONS SECTION ===
    if (precautions.length > 0) {
      if (yPos > 680) {
        doc.addPage();
        yPos = 50;
      }

      yPos += 10;
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#ffffff');
      doc.rect(50, yPos, 495, 22).fill('#16a34a');
      doc.text('SAFETY PRECAUTIONS', 55, yPos + 6);
      yPos += 30;

      doc.fontSize(9).font('Helvetica').fillColor('#1e293b');
      precautions.forEach((precaution) => {
        doc.text(`• ${precaution}`, 55, yPos, { width: 480 });
        yPos += 15;
      });
    }

    // === EQUIPMENT SECTION ===
    if (equipment.length > 0) {
      if (yPos > 680) {
        doc.addPage();
        yPos = 50;
      }

      yPos += 10;
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#ffffff');
      doc.rect(50, yPos, 495, 22).fill('#2563eb');
      doc.text('REQUIRED EQUIPMENT', 55, yPos + 6);
      yPos += 30;

      doc.fontSize(9).font('Helvetica').fillColor('#1e293b');
      equipment.forEach((item) => {
        doc.text(`• ${item}`, 55, yPos, { width: 480 });
        yPos += 15;
      });
    }

    // === APPROVAL SIGNATURES ===
    if (yPos > 600) {
      doc.addPage();
      yPos = 50;
    }

    yPos += 20;
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#ffffff');
    doc.rect(50, yPos, 495, 22).fill('#334155');
    doc.text('APPROVALS & SIGNATURES', 55, yPos + 6);
    yPos += 35;

    permit.approvals.forEach((approval, index) => {
      // Signature box
      doc.rect(50 + (index * 165), yPos, 155, 80).stroke('#e2e8f0');
      
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#64748b')
         .text(approval.approverRole.replace('_', ' '), 55 + (index * 165), yPos + 5);
      
      doc.fontSize(9).font('Helvetica').fillColor('#1e293b')
         .text(approval.approverName || 'Pending', 55 + (index * 165), yPos + 20);
      
      // Decision badge
      const decisionColor = approval.decision === 'APPROVED' ? '#10b981' : 
                           approval.decision === 'REJECTED' ? '#ef4444' : '#f59e0b';
      doc.roundedRect(55 + (index * 165), yPos + 35, 60, 14, 2).fill(decisionColor);
      doc.fontSize(7).font('Helvetica-Bold').fillColor('#ffffff')
         .text(approval.decision, 55 + (index * 165), yPos + 38, { width: 60, align: 'center' });
      
      // Signature placeholder or actual signature
      if (approval.signature) {
        doc.fontSize(12).font('Helvetica-Oblique').fillColor('#1e293b')
           .text(approval.signature, 55 + (index * 165), yPos + 55);
      } else {
        doc.fontSize(8).fillColor('#94a3b8')
           .text('Signature pending', 55 + (index * 165), yPos + 58);
      }
      
      if (approval.signedAt) {
        doc.fontSize(7).fillColor('#64748b')
           .text(new Date(approval.signedAt).toLocaleString(), 55 + (index * 165), yPos + 70);
      }
    });

    // === FOOTER ===
    doc.fontSize(8).fillColor('#94a3b8')
       .text(`Generated on ${new Date().toLocaleString()} | Permit ID: ${permit.id}`, 50, 780, { align: 'center', width: 495 });

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({ message: 'Error generating PDF' });
  }
};

module.exports = {
  generatePermitPDF,
};
