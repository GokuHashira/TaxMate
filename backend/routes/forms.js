const express = require('express');
const router = express.Router();
const archiver = require('archiver');
const { createForm8843, createForm1040NR, createForm8833, createInstructionsPDF } = require('../services/pdfFiller');
const { generateInstructions } = require('../services/claudeService');
const { estimateTaxRefund } = require('../services/ficaChecker');

router.post('/generate', async (req, res) => {
  const { taxData } = req.body;

  if (!taxData) {
    return res.status(400).json({ error: 'taxData is required' });
  }

  try {
    const formsNeeded = taxData.formsNeeded || ['8843'];
    const generated = {};

    // Always generate Form 8843
    const form8843Bytes = await createForm8843(taxData);
    generated['8843'] = Buffer.from(form8843Bytes).toString('base64');

    // Generate 1040-NR if there's income
    const totalIncome = Object.values(taxData.income || {}).reduce((sum, v) => sum + parseFloat(v || 0), 0);
    if (totalIncome > 0 || formsNeeded.includes('1040-NR')) {
      const form1040NRBytes = await createForm1040NR(taxData);
      generated['1040NR'] = Buffer.from(form1040NRBytes).toString('base64');
    }

    // Generate 8833 if treaty applies
    if (taxData.treatyInfo?.treatyApplies || formsNeeded.includes('8833')) {
      const form8833Bytes = await createForm8833(taxData);
      generated['8833'] = Buffer.from(form8833Bytes).toString('base64');
    }

    // Generate instructions
    let instructionsText = '';
    try {
      instructionsText = await generateInstructions(taxData);
    } catch (e) {
      instructionsText = generateDefaultInstructions(taxData);
    }

    const instructionsPDFBytes = await createInstructionsPDF(taxData, instructionsText);
    generated['instructions'] = Buffer.from(instructionsPDFBytes).toString('base64');

    // Compute refund estimate
    const refundEstimate = estimateTaxRefund(taxData);

    res.json({
      success: true,
      forms: generated,
      formsGenerated: Object.keys(generated),
      refundEstimate,
      instructionsText
    });
  } catch (error) {
    console.error('Form generation error:', error);
    res.status(500).json({ error: 'Failed to generate forms', details: error.message });
  }
});

router.post('/download-zip', async (req, res) => {
  const { taxData } = req.body;

  if (!taxData) {
    return res.status(400).json({ error: 'taxData is required' });
  }

  try {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const studentName = (taxData.studentProfile?.fullName || 'student').replace(/[^a-zA-Z0-9]/g, '_');

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="TaxMate_${studentName}_2024.zip"`);

    archive.pipe(res);

    // Generate and add Form 8843
    const form8843Bytes = await createForm8843(taxData);
    archive.append(Buffer.from(form8843Bytes), { name: 'Form_8843.pdf' });

    // Generate and add 1040-NR if needed
    const totalIncome = Object.values(taxData.income || {}).reduce((sum, v) => sum + parseFloat(v || 0), 0);
    if (totalIncome > 0 || (taxData.formsNeeded || []).includes('1040-NR')) {
      const form1040NRBytes = await createForm1040NR(taxData);
      archive.append(Buffer.from(form1040NRBytes), { name: 'Form_1040NR.pdf' });
    }

    // Generate and add 8833 if treaty applies
    if (taxData.treatyInfo?.treatyApplies) {
      const form8833Bytes = await createForm8833(taxData);
      archive.append(Buffer.from(form8833Bytes), { name: 'Form_8833.pdf' });
    }

    // Add instructions
    let instructionsText = generateDefaultInstructions(taxData);
    try {
      instructionsText = await generateInstructions(taxData);
    } catch (e) { /* use default */ }

    const instructionsPDFBytes = await createInstructionsPDF(taxData, instructionsText);
    archive.append(Buffer.from(instructionsPDFBytes), { name: 'Filing_Instructions.pdf' });

    // Add a README text file
    const readmeContent = `TaxMate Tax Package
==================
Student: ${taxData.studentProfile?.fullName || 'Student'}
Tax Year: 2024
Generated: ${new Date().toLocaleDateString()}

Forms Included:
${(taxData.formsNeeded || ['8843']).map(f => `- Form ${f}`).join('\n')}
- Filing Instructions

IMPORTANT:
- Review all forms carefully before signing
- Sign where indicated
- Mail to the appropriate IRS address (see Filing Instructions)
- Keep copies for your records
- TaxMate is not a licensed tax professional

For questions, contact your university's International Student Office.
`;
    archive.append(Buffer.from(readmeContent, 'utf8'), { name: 'README.txt' });

    await archive.finalize();
  } catch (error) {
    console.error('ZIP generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate ZIP', details: error.message });
    }
  }
});

function generateDefaultInstructions(taxData) {
  const profile = taxData.studentProfile || {};
  const formsNeeded = taxData.formsNeeded || ['8843'];
  const ficaRefund = taxData.withholding?.ficaRefundAmount || 0;

  return `TaxMate Filing Instructions — Tax Year 2024

STEP 1: REVIEW YOUR FORMS
Review all generated forms carefully. Make sure your name, address, and SSN/ITIN are correct.

STEP 2: SIGN YOUR FORMS
Sign in blue or black ink where indicated on each form. Do not use pencil.

STEP 3: WHERE TO MAIL
For nonresident aliens (F-1/J-1 visa holders), mail your return to:
Department of the Treasury
Internal Revenue Service
Austin, TX 73301-0215

If you owe taxes and are enclosing a check:
Internal Revenue Service
P.O. Box 1303
Charlotte, NC 28201-1303

STEP 4: FILING DEADLINE
The deadline to file is April 15, 2025 for tax year 2024.
Nonresident aliens cannot e-file — you must mail your return.

STEP 5: WHAT TO ATTACH
- Form 8843 (required for ALL F-1/J-1 students, even with no income)
${formsNeeded.includes('1040-NR') ? '- Form 1040-NR (with all W-2 and 1042-S forms attached)' : ''}
${formsNeeded.includes('8833') ? '- Form 8833 (treaty position disclosure)' : ''}
- Copies of all W-2 and 1042-S forms
- Copy of your visa/I-20/DS-2019

STEP 6: KEEP COPIES
Always keep copies of everything you mail to the IRS.

${ficaRefund > 0 ? `STEP 7: FICA REFUND ($${ficaRefund.toFixed(2)})
Your employer incorrectly withheld FICA taxes. To claim your refund:
- Contact your employer first to request a corrected W-2c
- If employer won't correct: File Form 843 with your return
- Attach a statement: "I was an F-1/J-1 student exempt from FICA"

` : ''}IMPORTANT DISCLAIMER:
TaxMate is not a licensed tax professional. This is an AI-generated preparation tool for your convenience.
For complex situations or if you have questions, contact:
- Your university's International Student Services office
- A Certified Public Accountant (CPA) specializing in international tax`;
}

module.exports = router;
