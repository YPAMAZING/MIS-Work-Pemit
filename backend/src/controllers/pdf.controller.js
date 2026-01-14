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
  'PENDING_REMARKS': '#f97316',
};

// ID Proof type labels
const idProofLabels = {
  'aadhaar': 'Aadhaar Card',
  'pan': 'PAN Card',
  'driving_license': 'Driving License',
  'voter_id': 'Voter ID',
  'passport': 'Passport',
  'other': 'Other ID',
};

// Declaration text
const declarationText = `I/We have read & understood all the above requirements and the same are also explained to us by Reliable Group's site team and officials. I/We agree to abide all the above listed requirements. I/We understand agree that, the vendor/contractor/person requesting this work permit will be held solely responsible for any untoward incident, any damage to property and human life, due to any unsafe act during this work/job/activity. Also, checking the workers necessary licenses, utility vehicle's compliance documents is solely our (clients'/tenants') responsibility.`;

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
    const vendorDetails = permit.vendorDetails ? JSON.parse(permit.vendorDetails) : null;

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
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${permit.permitNumber}.pdf"`);

    // Pipe PDF to response
    doc.pipe(res);

    // Helper function to check and add new page
    const checkPageBreak = (requiredSpace = 100) => {
      if (yPos > 750 - requiredSpace) {
        doc.addPage();
        yPos = 40;
        return true;
      }
      return false;
    };

    // Helper to draw section header
    const drawSectionHeader = (title, color = '#334155') => {
      checkPageBreak(80);
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#ffffff');
      doc.rect(40, yPos, 515, 20).fill(color);
      doc.text(title, 45, yPos + 5);
      yPos += 28;
    };

    let yPos = 40;

    // === HEADER ===
    // Company name and permit type
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#1e293b')
       .text(permit.companyName || 'RELIABLE GROUP MEP', 40, yPos);
    
    yPos += 22;
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#334155')
       .text(workTypeLabels[permit.workType] || 'WORK PERMIT', 40, yPos);

    // QR Code (right side)
    doc.image(qrCodeBuffer, 475, 40, { width: 70, height: 70 });

    yPos += 20;
    doc.fontSize(9).font('Helvetica').fillColor('#64748b')
       .text(`Requested by ${permit.user.firstName} ${permit.user.lastName} on ${new Date(permit.createdAt).toLocaleDateString()}`, 40, yPos);

    yPos += 18;
    // Permit number
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#1e293b')
       .text(`Permit No: ${permit.permitNumber}`, 40, yPos);

    // Status badge
    const statusColor = statusColors[permit.status] || '#6b7280';
    doc.roundedRect(475, 115, 70, 18, 3).fill(statusColor);
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#ffffff')
       .text(permit.status, 475, 119, { width: 70, align: 'center' });

    // Horizontal line
    yPos += 20;
    doc.moveTo(40, yPos).lineTo(555, yPos).stroke('#e2e8f0');
    yPos += 15;

    // === VENDOR DETAILS SECTION ===
    if (vendorDetails) {
      drawSectionHeader('VENDOR / CONTRACTOR DETAILS', '#7c3aed');
      
      doc.fontSize(9).font('Helvetica').fillColor('#1e293b');
      
      // Row 1: Name and Phone
      doc.font('Helvetica-Bold').text('Vendor Name:', 45, yPos);
      doc.font('Helvetica').text(vendorDetails.vendorName || '-', 130, yPos);
      
      doc.font('Helvetica-Bold').text('Phone:', 300, yPos);
      doc.font('Helvetica').text(vendorDetails.vendorPhone || '-', 350, yPos);
      yPos += 18;
      
      // Row 2: Company and Email
      doc.font('Helvetica-Bold').text('Company:', 45, yPos);
      doc.font('Helvetica').text(vendorDetails.vendorCompany || '-', 130, yPos);
      
      doc.font('Helvetica-Bold').text('Email:', 300, yPos);
      doc.font('Helvetica').text(vendorDetails.vendorEmail || '-', 350, yPos);
      yPos += 25;
    }

    // === WORKERS SECTION ===
    drawSectionHeader('WORKERS DETAILS', '#334155');

    if (workers.length > 0) {
      // Table header
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#64748b');
      doc.text('S.No', 45, yPos);
      doc.text('Worker Name', 75, yPos);
      doc.text('Phone', 200, yPos);
      doc.text('ID Type', 290, yPos);
      doc.text('ID Number', 380, yPos);
      yPos += 12;
      doc.moveTo(40, yPos).lineTo(555, yPos).stroke('#e2e8f0');
      yPos += 8;

      // Table rows
      workers.forEach((worker, index) => {
        checkPageBreak(20);
        doc.fontSize(8).font('Helvetica').fillColor('#1e293b');
        doc.text((index + 1).toString(), 45, yPos);
        doc.text(worker.name || '-', 75, yPos, { width: 120 });
        doc.text(worker.phone || '-', 200, yPos, { width: 85 });
        doc.text(idProofLabels[worker.idProofType] || worker.idProofType || '-', 290, yPos, { width: 85 });
        doc.text(worker.idProofNumber || '-', 380, yPos, { width: 120 });
        yPos += 16;
      });
    } else {
      doc.fontSize(9).font('Helvetica').fillColor('#64748b')
         .text('No workers assigned', 45, yPos);
      yPos += 18;
    }

    yPos += 10;

    // === LOCATION & DURATION ===
    checkPageBreak(90);
    
    // Location box
    doc.rect(40, yPos, 250, 70).stroke('#e2e8f0');
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff');
    doc.rect(40, yPos, 250, 18).fill('#334155');
    doc.text('LOCATION OF WORK', 45, yPos + 4);
    doc.fontSize(9).font('Helvetica').fillColor('#1e293b')
       .text(permit.location, 45, yPos + 25, { width: 240 });
    doc.fontSize(8).fillColor('#64748b')
       .text(`Timezone: ${permit.timezone || 'UTC'}`, 45, yPos + 55);

    // Duration box
    doc.rect(305, yPos, 250, 70).stroke('#e2e8f0');
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff');
    doc.rect(305, yPos, 250, 18).fill('#334155');
    doc.text('DURATION OF WORK', 310, yPos + 4);
    
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#64748b');
    doc.text('Start Date & Time', 310, yPos + 25);
    doc.text('End Date & Time', 430, yPos + 25);
    
    doc.fontSize(8).font('Helvetica').fillColor('#1e293b');
    doc.text(new Date(permit.startDate).toLocaleString(), 310, yPos + 38, { width: 115 });
    doc.text(new Date(permit.endDate).toLocaleString(), 430, yPos + 38, { width: 115 });
    
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#64748b').text('Extended:', 310, yPos + 55);
    doc.font('Helvetica').fillColor(permit.isExtended ? '#3b82f6' : '#1e293b')
       .text(permit.isExtended ? 'YES' : 'NO', 360, yPos + 55);

    yPos += 85;

    // === HAZARDS SECTION ===
    if (hazards.length > 0) {
      drawSectionHeader('HAZARDS IDENTIFIED', '#dc2626');
      doc.fontSize(9).font('Helvetica').fillColor('#1e293b');
      hazards.forEach((hazard) => {
        checkPageBreak(15);
        doc.text(`• ${hazard}`, 45, yPos, { width: 500 });
        yPos += 14;
      });
      yPos += 5;
    }

    // === SAFETY PRECAUTIONS / PPE SECTION ===
    if (equipment.length > 0) {
      drawSectionHeader('SAFETY PRECAUTIONS - LIST OF MANDATORY PPE & TOOLS', '#16a34a');
      
      // Grid layout for equipment
      let col = 0;
      let rowY = yPos;
      equipment.forEach((item, index) => {
        checkPageBreak(15);
        const xPos = 45 + (col * 170);
        doc.fontSize(8).font('Helvetica').fillColor('#1e293b');
        doc.text(`✓ ${item}`, xPos, rowY, { width: 165 });
        col++;
        if (col >= 3) {
          col = 0;
          rowY += 14;
          yPos = rowY;
        }
      });
      if (col !== 0) yPos += 14;
      yPos += 10;
    }

    // === MEASURES SECTION ===
    const defaultMeasures = [
      { question: 'Instruction to Personnel regarding hazards involved and working procedure.', answer: null },
      { question: 'Are Other Contractors working nearby notified?', answer: null },
      { question: 'Is there any other work permit obtained?', answer: null },
      { question: 'Are escape routes to be provided and kept clear?', answer: null },
      { question: 'Is combustible material to be removed / covered from and nearby site (up to 5mtr min.)', answer: null },
      { question: 'Is the area immediately below the work spot been cleared?', answer: null },
      { question: 'Has gas connection been tested in case there is gas valve / gas line nearby?', answer: null },
      { question: 'Is fire extinguisher been kept handy at site?', answer: null },
      { question: 'Has tin sheet / fire retardant cloth been placed to contain hot spatters?', answer: null },
      { question: 'Have all drain inlets been closed?', answer: null },
    ];

    const displayMeasures = measures.length > 0 ? measures : defaultMeasures;

    drawSectionHeader('SAFETY MEASURES CHECKLIST', '#334155');

    displayMeasures.forEach((measure, index) => {
      checkPageBreak(22);

      doc.fontSize(8).font('Helvetica').fillColor('#1e293b')
         .text(`${index + 1}. ${measure.question}`, 45, yPos, { width: 380 });

      // Answer badges
      const answers = ['YES', 'NO', 'N/A'];
      let badgeX = 440;
      
      answers.forEach((ans) => {
        const isSelected = measure.answer === ans;
        const bgColor = isSelected ? 
          (ans === 'YES' ? '#10b981' : ans === 'NO' ? '#ef4444' : '#6b7280') : 
          '#e2e8f0';
        const textColor = isSelected ? '#ffffff' : '#64748b';
        
        doc.roundedRect(badgeX, yPos - 2, 28, 14, 2).fill(bgColor);
        doc.fontSize(7).font('Helvetica-Bold').fillColor(textColor)
           .text(ans, badgeX, yPos + 1, { width: 28, align: 'center' });
        badgeX += 32;
      });

      yPos += 20;
    });

    // === DECLARATION & UNDERTAKING ===
    checkPageBreak(120);
    yPos += 5;
    
    drawSectionHeader('DECLARATION & UNDERTAKING', '#1d4ed8');
    
    doc.fontSize(8).font('Helvetica').fillColor('#1e293b')
       .text(declarationText, 45, yPos, { width: 500, align: 'justify' });
    
    yPos += 75;
    
    // Agreement checkbox representation
    doc.rect(45, yPos, 12, 12).stroke('#1d4ed8');
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#1d4ed8').text('✓', 47, yPos);
    doc.fontSize(9).font('Helvetica').fillColor('#1e293b').text('I Agree', 65, yPos + 1);
    
    yPos += 25;

    // === SAFETY OFFICER REMARKS ===
    if (permit.safetyRemarks) {
      checkPageBreak(80);
      drawSectionHeader('SAFETY OFFICER REMARKS', '#7c3aed');
      
      doc.fontSize(9).font('Helvetica').fillColor('#1e293b')
         .text(permit.safetyRemarks, 45, yPos, { width: 500 });
      
      yPos += 30;
      
      if (permit.remarksAddedBy) {
        doc.fontSize(8).fillColor('#64748b')
           .text(`Added by: ${permit.remarksAddedBy}`, 45, yPos);
        if (permit.remarksAddedAt) {
          doc.text(` on ${new Date(permit.remarksAddedAt).toLocaleString()}`, 180, yPos);
        }
        yPos += 20;
      }
    }

    // === APPROVAL SIGNATURES ===
    checkPageBreak(120);
    yPos += 5;
    
    drawSectionHeader('APPROVALS & SIGNATURES', '#334155');

    const approvalBoxWidth = 160;
    permit.approvals.forEach((approval, index) => {
      const boxX = 40 + (index * (approvalBoxWidth + 10));
      if (boxX + approvalBoxWidth > 555) return; // Max 3 boxes per row
      
      doc.rect(boxX, yPos, approvalBoxWidth, 75).stroke('#e2e8f0');
      
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#64748b')
         .text(approval.approverRole.replace('_', ' '), boxX + 5, yPos + 5);
      
      doc.fontSize(9).font('Helvetica').fillColor('#1e293b')
         .text(approval.approverName || 'Pending', boxX + 5, yPos + 20);
      
      // Decision badge
      const decisionColor = approval.decision === 'APPROVED' ? '#10b981' : 
                           approval.decision === 'REJECTED' ? '#ef4444' : '#f59e0b';
      doc.roundedRect(boxX + 5, yPos + 35, 55, 14, 2).fill(decisionColor);
      doc.fontSize(7).font('Helvetica-Bold').fillColor('#ffffff')
         .text(approval.decision, boxX + 5, yPos + 38, { width: 55, align: 'center' });
      
      if (approval.approvedAt) {
        doc.fontSize(7).fillColor('#64748b')
           .text(new Date(approval.approvedAt).toLocaleString(), boxX + 5, yPos + 55, { width: 150 });
      }
    });

    yPos += 90;

    // === AUTO-CLOSE INFO ===
    if (permit.autoClosedAt) {
      checkPageBreak(30);
      doc.fontSize(8).fillColor('#64748b')
         .text(`Auto-closed on: ${new Date(permit.autoClosedAt).toLocaleString()}`, 45, yPos);
      yPos += 20;
    }

    // === FOOTER - COMPUTER GENERATED NOTICE ===
    // Add new page if near bottom
    if (yPos > 700) {
      doc.addPage();
      yPos = 40;
    }

    // Footer box
    yPos = 755;
    doc.rect(40, yPos, 515, 35).fill('#f1f5f9');
    
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#64748b')
       .text('This is a computer generated document. No signature is required.', 40, yPos + 5, { width: 515, align: 'center' });
    
    doc.fontSize(7).font('Helvetica').fillColor('#94a3b8')
       .text(`Generated on ${new Date().toLocaleString()} | Permit ID: ${permit.id}`, 40, yPos + 20, { width: 515, align: 'center' });

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
