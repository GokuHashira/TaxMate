const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function createForm8843(taxData) {
  // Try to load official form, fallback to generated form
  const formPath = path.join(__dirname, '../forms/f8843.pdf');

  let pdfDoc;

  if (fs.existsSync(formPath)) {
    const pdfBytes = fs.readFileSync(formPath);
    pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    const fieldMappings = {
      'topmostSubform[0].Page1[0].f1_1[0]': taxData.studentProfile?.fullName || '',
      'topmostSubform[0].Page1[0].f1_2[0]': taxData.studentProfile?.ssn || taxData.studentProfile?.itin || '',
      'topmostSubform[0].Page1[0].f1_3[0]': taxData.studentProfile?.usAddress || '',
      'topmostSubform[0].Page1[0].f1_4[0]': taxData.studentProfile?.visaType || '',
      'topmostSubform[0].Page1[0].f1_5[0]': taxData.studentProfile?.university || '',
    };

    for (const [fieldName, value] of Object.entries(fieldMappings)) {
      try {
        form.getTextField(fieldName).setText(String(value));
      } catch (e) {
        // Field not found, continue
      }
    }
  } else {
    // Generate a simple PDF with the form data
    pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { height } = page.getSize();
    let y = height - 50;

    const drawText = (text, x, yPos, size = 10, bold = false) => {
      page.drawText(text, {
        x,
        y: yPos,
        size,
        font: bold ? boldFont : font,
        color: rgb(0, 0, 0)
      });
    };

    const drawLine = (x1, y1, x2, y2) => {
      page.drawLine({
        start: { x: x1, y: y1 },
        end: { x: x2, y: y2 },
        thickness: 0.5,
        color: rgb(0.5, 0.5, 0.5)
      });
    };

    drawText('Form 8843', 30, y, 18, true);
    drawText('Statement for Exempt Individuals and Individuals with a', 200, y, 10);
    y -= 18;
    drawText('Department of the Treasury — Internal Revenue Service', 30, y, 8);
    drawText('Medical Condition', 200, y, 10);
    y -= 8;
    drawText('(For Tax Year 2024)', 200, y, 9);
    y -= 25;
    drawLine(30, y, 580, y);
    y -= 15;

    const profile = taxData.studentProfile || {};
    const fields = [
      ['Full Name:', profile.fullName || ''],
      ['SSN / ITIN:', profile.ssn || profile.itin || 'Applied for'],
      ['US Address:', profile.usAddress || ''],
      ['Home Country:', profile.homeCountry || ''],
      ['Visa Type:', profile.visaType || ''],
      ['Tax Year:', String(profile.taxYear || '2024')],
      ['University:', profile.university || ''],
      ['Years in US:', String(profile.yearsInUS || '')],
    ];

    for (const [label, value] of fields) {
      drawText(label, 30, y, 9, true);
      drawText(value, 180, y, 9);
      y -= 20;
      drawLine(30, y + 3, 580, y + 3);
    }

    y -= 20;
    drawText('Part I — Teachers and Trainees (J-1 / J-2)', 30, y, 11, true);
    y -= 20;

    if (profile.visaType === 'J-1') {
      drawText('1a. Type of visa: J-1', 50, y, 9);
      y -= 20;
      drawText('1b. Number of days present in the US during 2024:', 50, y, 9);
      y -= 20;
      drawText('2. Employer/institution in home country:', 50, y, 9);
      y -= 25;
    }

    drawText('Part II — Students (F-1 / J-1 / M-1 / Q-1 / Q-2)', 30, y, 11, true);
    y -= 20;

    if (profile.visaType === 'F-1' || profile.visaType === 'J-1') {
      drawText('6. Type of visa: ' + (profile.visaType || 'F-1'), 50, y, 9);
      y -= 20;
      drawText('7. Name of academic institution: ' + (profile.university || ''), 50, y, 9);
      y -= 20;
      drawText('8. Current academic program and intended length of stay:', 50, y, 9);
      y -= 20;
      drawText('   International Student — See attached enrollment verification', 70, y, 9);
      y -= 25;
    }

    drawLine(30, y, 580, y);
    y -= 15;
    drawText('Under penalties of perjury, I declare that I have examined this form and, to the best of my knowledge and belief, it is true,', 30, y, 8);
    y -= 12;
    drawText('correct, and complete.', 30, y, 8);
    y -= 25;
    drawText('Signature: _________________________________', 30, y, 9);
    drawText('Date: ______________', 380, y, 9);
    y -= 20;
    drawText(profile.fullName || '', 155, y, 9);

    y -= 30;
    page.drawRectangle({
      x: 30,
      y: y - 30,
      width: 550,
      height: 40,
      color: rgb(0.95, 0.95, 0.95)
    });
    drawText('PREPARED BY TAXMATE — REVIEW CAREFULLY BEFORE SIGNING AND SUBMITTING', 50, y - 10, 8, true);
    drawText('TaxMate is not a licensed tax professional. Consult a CPA for complex situations.', 50, y - 25, 7);
  }

  return await pdfDoc.save();
}

async function createForm1040NR(taxData) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { height } = page.getSize();
  let y = height - 50;

  const drawText = (text, x, yPos, size = 10, bold = false) => {
    page.drawText(String(text || ''), {
      x,
      y: yPos,
      size,
      font: bold ? boldFont : font,
      color: rgb(0, 0, 0)
    });
  };

  const drawLine = (x1, y1, x2, y2) => {
    page.drawLine({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      thickness: 0.5,
      color: rgb(0.5, 0.5, 0.5)
    });
  };

  const drawBox = (x, yPos, w, h, fillColor = null) => {
    if (fillColor) {
      page.drawRectangle({ x, y: yPos, width: w, height: h, color: fillColor });
    }
    page.drawRectangle({ x, y: yPos, width: w, height: h, borderColor: rgb(0.7, 0.7, 0.7), borderWidth: 0.5 });
  };

  // Header
  drawText('Form 1040-NR', 30, y, 18, true);
  drawText('U.S. Nonresident Alien Income Tax Return', 200, y, 11, true);
  y -= 18;
  drawText('Department of the Treasury — Internal Revenue Service', 30, y, 8);
  drawText('Tax Year 2024', 200, y, 10);
  y -= 25;
  drawLine(30, y, 580, y);
  y -= 15;

  const profile = taxData.studentProfile || {};
  const income = taxData.income || {};
  const withholding = taxData.withholding || {};
  const treatyInfo = taxData.treatyInfo || {};

  // Personal info section
  drawText('FILING INFORMATION', 30, y, 11, true);
  y -= 18;
  drawText('Name:', 30, y, 9, true);
  drawText(profile.fullName || '', 100, y, 9);
  y -= 18;
  drawText('SSN/ITIN:', 30, y, 9, true);
  drawText(profile.ssn || profile.itin || 'Applied for / See attached', 100, y, 9);
  y -= 18;
  drawText('US Address:', 30, y, 9, true);
  drawText(profile.usAddress || '', 100, y, 9);
  y -= 18;
  drawText('Country:', 30, y, 9, true);
  drawText(profile.homeCountry || '', 100, y, 9);
  drawText('Visa:', 300, y, 9, true);
  drawText(profile.visaType || '', 340, y, 9);
  y -= 20;
  drawLine(30, y, 580, y);
  y -= 15;

  // Income section
  drawText('INCOME', 30, y, 11, true);
  y -= 18;
  const totalWages = (parseFloat(income.wagesOnCampus || 0) + parseFloat(income.wagesCPT || 0) + parseFloat(income.wagesOPT || 0));
  const totalScholarship = parseFloat(income.scholarshipTaxable || 0) + parseFloat(income.fellowshipIncome || 0);
  const totalIncome = totalWages + totalScholarship;

  drawText('Line 1a — Wages, salaries, tips, etc.:', 30, y, 9);
  drawText(`$${totalWages.toFixed(2)}`, 420, y, 9);
  y -= 18;
  drawText('Line 2b — Taxable interest:', 30, y, 9);
  drawText('$0.00', 420, y, 9);
  y -= 18;
  drawText('Line 5 — Scholarship/fellowship income:', 30, y, 9);
  drawText(`$${totalScholarship.toFixed(2)}`, 420, y, 9);
  y -= 18;
  drawLine(30, y, 580, y);
  y -= 15;
  drawText('Total Income:', 30, y, 10, true);
  drawText(`$${totalIncome.toFixed(2)}`, 420, y, 10, true);
  y -= 20;
  drawLine(30, y, 580, y);
  y -= 15;

  // Treaty exemption
  if (treatyInfo.treatyApplies) {
    drawText('TREATY EXEMPTION (Form 8833 attached)', 30, y, 11, true);
    y -= 18;
    drawText(`Country: ${treatyInfo.treatyCountry}`, 50, y, 9);
    drawText(`Article: ${treatyInfo.treatyArticle}`, 200, y, 9);
    y -= 18;
    drawText('Exempt Amount:', 50, y, 9);
    drawText(treatyInfo.maxAmount ? `Up to $${treatyInfo.maxAmount}` : 'See Form 8833', 200, y, 9);
    y -= 20;
    drawLine(30, y, 580, y);
    y -= 15;
  }

  // Withholding
  drawText('TAX WITHHOLDING', 30, y, 11, true);
  y -= 18;
  drawText('Federal income tax withheld (from W-2/1042-S):', 30, y, 9);
  drawText(`$${parseFloat(withholding.federalIncomeTax || 0).toFixed(2)}`, 420, y, 9);
  y -= 18;
  drawText('State income tax withheld:', 30, y, 9);
  drawText(`$${parseFloat(withholding.stateIncomeTax || 0).toFixed(2)}`, 420, y, 9);
  y -= 20;
  drawLine(30, y, 580, y);
  y -= 15;

  // FICA note
  if (withholding.ficaError) {
    y -= 5;
    page.drawRectangle({ x: 30, y: y - 35, width: 550, height: 45, color: rgb(1, 0.95, 0.8) });
    drawText('FICA TAX ALERT — ACTION REQUIRED', 40, y - 10, 10, true);
    drawText(`Social Security withheld: $${parseFloat(withholding.socialSecurityWithheld || 0).toFixed(2)}  |  Medicare withheld: $${parseFloat(withholding.medicareWithheld || 0).toFixed(2)}`, 40, y - 25, 9);
    y -= 50;
    drawText('File Form 843 to reclaim incorrectly withheld FICA taxes. See instructions.', 40, y, 9);
    y -= 20;
  }

  // Signature
  y -= 10;
  drawLine(30, y, 580, y);
  y -= 15;
  drawText('Under penalties of perjury, I declare that I have examined this return and accompanying schedules and statements,', 30, y, 8);
  y -= 12;
  drawText('and to the best of my knowledge and belief, they are true, correct, and complete.', 30, y, 8);
  y -= 20;
  drawText('Signature: _________________________________', 30, y, 9);
  drawText('Date: ______________', 380, y, 9);

  y -= 25;
  page.drawRectangle({ x: 30, y: y - 30, width: 550, height: 40, color: rgb(0.95, 0.95, 0.95) });
  drawText('PREPARED BY TAXMATE — REVIEW CAREFULLY BEFORE SIGNING AND SUBMITTING', 50, y - 10, 8, true);
  drawText('TaxMate is not a licensed tax professional. Consult a CPA or your university international office for complex situations.', 50, y - 25, 7);

  return await pdfDoc.save();
}

async function createForm8833(taxData) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { height } = page.getSize();
  let y = height - 50;

  const drawText = (text, x, yPos, size = 10, bold = false) => {
    page.drawText(String(text || ''), {
      x,
      y: yPos,
      size,
      font: bold ? boldFont : font,
      color: rgb(0, 0, 0)
    });
  };

  const drawLine = (x1, y1, x2, y2) => {
    page.drawLine({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      thickness: 0.5,
      color: rgb(0.5, 0.5, 0.5)
    });
  };

  drawText('Form 8833', 30, y, 18, true);
  drawText('Treaty-Based Return Position Disclosure', 200, y, 11, true);
  y -= 18;
  drawText('Department of the Treasury — Internal Revenue Service', 30, y, 8);
  drawText('Under Section 6114 or 7701(b)', 200, y, 9);
  y -= 25;
  drawLine(30, y, 580, y);
  y -= 15;

  const profile = taxData.studentProfile || {};
  const treatyInfo = taxData.treatyInfo || {};
  const income = taxData.income || {};
  const totalIncome = Object.values(income).reduce((sum, v) => sum + parseFloat(v || 0), 0);

  drawText('TAXPAYER INFORMATION', 30, y, 11, true);
  y -= 18;
  drawText('Name:', 30, y, 9, true);
  drawText(profile.fullName || '', 100, y, 9);
  y -= 18;
  drawText('SSN/ITIN:', 30, y, 9, true);
  drawText(profile.ssn || profile.itin || 'Applied for', 100, y, 9);
  y -= 18;
  drawText('Address:', 30, y, 9, true);
  drawText(profile.usAddress || '', 100, y, 9);
  y -= 20;
  drawLine(30, y, 580, y);
  y -= 15;

  drawText('TREATY INFORMATION', 30, y, 11, true);
  y -= 18;
  drawText('1. The taxpayer is a resident of:', 30, y, 9);
  drawText(treatyInfo.treatyCountry || profile.homeCountry || '', 280, y, 9, true);
  y -= 18;
  drawText('2. The treaty (convention) entered into force on:', 30, y, 9);
  y -= 18;
  drawText('3. The treaty article the taxpayer relies on:', 30, y, 9);
  drawText(`Article ${treatyInfo.treatyArticle || ''}`, 280, y, 9, true);
  y -= 18;
  drawText('4. The item of income or the tax item the treaty covers:', 30, y, 9);
  y -= 18;
  drawText('   Student wages, scholarships, and fellowship income', 50, y, 9);
  y -= 18;
  drawText('5. The total amount of income for which the treaty position is taken:', 30, y, 9);
  drawText(`$${totalIncome.toFixed(2)}`, 450, y, 9, true);
  y -= 18;
  drawText('6. The applicable rate of withholding under the treaty:', 30, y, 9);
  drawText('0% (full exemption)', 380, y, 9);
  y -= 20;
  drawLine(30, y, 580, y);
  y -= 15;

  drawText('TREATY BENEFIT EXPLANATION', 30, y, 11, true);
  y -= 18;
  const description = treatyInfo.details || `Under Article ${treatyInfo.treatyArticle} of the US-${treatyInfo.treatyCountry} tax treaty, the taxpayer is exempt from US income tax on the above income as a student/trainee on an F-1/J-1 visa.`;
  const words = description.split(' ');
  let line = '';
  for (const word of words) {
    if ((line + ' ' + word).length > 80) {
      drawText(line, 50, y, 9);
      y -= 14;
      line = word;
    } else {
      line = line ? line + ' ' + word : word;
    }
  }
  if (line) {
    drawText(line, 50, y, 9);
    y -= 14;
  }

  y -= 15;
  drawLine(30, y, 580, y);
  y -= 15;
  drawText('Under penalties of perjury, I declare that the information provided is true, correct, and complete.', 30, y, 8);
  y -= 20;
  drawText('Signature: _________________________________', 30, y, 9);
  drawText('Date: ______________', 380, y, 9);

  y -= 25;
  page.drawRectangle({ x: 30, y: y - 30, width: 550, height: 40, color: rgb(0.95, 0.95, 0.95) });
  drawText('PREPARED BY TAXMATE — REVIEW CAREFULLY BEFORE SIGNING AND SUBMITTING', 50, y - 10, 8, true);
  drawText('TaxMate is not a licensed tax professional. Consult a CPA for complex situations.', 50, y - 25, 7);

  return await pdfDoc.save();
}

async function createInstructionsPDF(taxData, instructionsText) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { height } = page.getSize();
  let y = height - 50;

  const drawText = (text, x, yPos, size = 10, bold = false) => {
    const safeText = String(text || '').replace(/[^\x00-\x7F]/g, '');
    if (safeText) {
      page.drawText(safeText, {
        x,
        y: yPos,
        size,
        font: bold ? boldFont : font,
        color: rgb(0, 0, 0)
      });
    }
  };

  drawText('TaxMate Filing Instructions', 30, y, 16, true);
  y -= 18;
  drawText(`Tax Year 2024  |  Prepared for: ${taxData.studentProfile?.fullName || 'Student'}`, 30, y, 10);
  y -= 25;
  page.drawLine({ start: { x: 30, y }, end: { x: 580, y }, thickness: 1, color: rgb(0.2, 0.4, 0.8) });
  y -= 20;

  const lines = instructionsText.split('\n');
  for (const line of lines) {
    if (y < 60) break;
    const cleanLine = line.replace(/[^\x00-\x7F]/g, '').trim();
    if (!cleanLine) {
      y -= 8;
      continue;
    }
    const isHeader = cleanLine.match(/^\d+\.|^[A-Z\s]+:$/);
    drawText(cleanLine, 30, y, isHeader ? 10 : 9, !!isHeader);
    y -= isHeader ? 16 : 14;
  }

  y -= 20;
  page.drawRectangle({ x: 30, y: y - 30, width: 550, height: 40, color: rgb(0.95, 0.95, 0.95) });
  drawText('DISCLAIMER: TaxMate is not a licensed tax professional.', 50, y - 10, 8, true);
  drawText('Always consult a CPA or your university international student office for complex tax situations.', 50, y - 25, 7);

  return await pdfDoc.save();
}

module.exports = { createForm8843, createForm1040NR, createForm8833, createInstructionsPDF };
