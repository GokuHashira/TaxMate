const express = require('express');
const router = express.Router();
const { chat } = require('../services/claudeService');
const { detectTreaty } = require('../services/treatyDetector');
const { checkFICA, estimateTaxRefund } = require('../services/ficaChecker');

router.post('/message', async (req, res) => {
  const { conversationHistory, userMessage, taxData } = req.body;

  if (!userMessage) {
    return res.status(400).json({ error: 'userMessage is required' });
  }

  try {
    const rawResponse = await chat(conversationHistory || [], userMessage, taxData || {});

    // Parse Claude's response for structured signals
    const dataMatch = rawResponse.match(/<data>([\s\S]*?)<\/data>/);
    const extractedData = dataMatch ? JSON.parse(dataMatch[1]) : null;

    const isStepComplete = rawResponse.includes('<STEP_COMPLETE>');
    const isAllComplete = rawResponse.includes('<ALL_COMPLETE>');
    const uploadMatch = rawResponse.match(/<REQUEST_UPLOAD type="([^"]+)">/);
    const requestUploadType = uploadMatch ? uploadMatch[1] : null;

    // Clean the response for display (remove XML tags)
    let cleanResponse = rawResponse
      .replace(/<data>[\s\S]*?<\/data>/g, '')
      .replace(/<STEP_COMPLETE>/g, '')
      .replace(/<ALL_COMPLETE>/g, '')
      .replace(/<REQUEST_UPLOAD[^>]*>/g, '')
      .trim();

    // Auto-run treaty detection when we have homeCountry
    let treatyResult = null;
    let ficaResult = null;
    let refundEstimate = null;

    const updatedTaxData = { ...taxData };

    if (extractedData) {
      // Merge extracted data
      if (extractedData.visaType) updatedTaxData.studentProfile = { ...(updatedTaxData.studentProfile || {}), visaType: extractedData.visaType };
      if (extractedData.homeCountry) {
        updatedTaxData.studentProfile = { ...(updatedTaxData.studentProfile || {}), homeCountry: extractedData.homeCountry };
        treatyResult = detectTreaty(extractedData.homeCountry);
        if (treatyResult.treatyApplies) {
          updatedTaxData.treatyInfo = {
            treatyApplies: true,
            treatyCountry: treatyResult.treatyCountry,
            treatyArticle: treatyResult.treatyArticle,
            exemptAmount: treatyResult.maxAmount || 0,
            description: treatyResult.description,
            details: treatyResult.details
          };
        }
      }
      if (extractedData.fullName) updatedTaxData.studentProfile = { ...(updatedTaxData.studentProfile || {}), fullName: extractedData.fullName };
      if (extractedData.university) updatedTaxData.studentProfile = { ...(updatedTaxData.studentProfile || {}), university: extractedData.university };
      if (extractedData.usAddress) updatedTaxData.studentProfile = { ...(updatedTaxData.studentProfile || {}), usAddress: extractedData.usAddress };
      if (extractedData.ssn) updatedTaxData.studentProfile = { ...(updatedTaxData.studentProfile || {}), ssn: extractedData.ssn };
      if (extractedData.itin) updatedTaxData.studentProfile = { ...(updatedTaxData.studentProfile || {}), itin: extractedData.itin };
      if (extractedData.yearsInUS !== undefined) updatedTaxData.studentProfile = { ...(updatedTaxData.studentProfile || {}), yearsInUS: extractedData.yearsInUS };

      // Income data
      const incomeFields = ['wagesOnCampus', 'wagesCPT', 'wagesOPT', 'scholarshipTaxable', 'fellowshipIncome'];
      for (const field of incomeFields) {
        if (extractedData[field] !== undefined) {
          updatedTaxData.income = { ...(updatedTaxData.income || {}), [field]: extractedData[field] };
        }
      }
    }

    // Determine forms needed
    const formsNeeded = ['8843'];
    const totalIncome = Object.values(updatedTaxData.income || {}).reduce((sum, v) => sum + parseFloat(v || 0), 0);
    if (totalIncome > 0) formsNeeded.push('1040-NR');
    if (updatedTaxData.treatyInfo?.treatyApplies) formsNeeded.push('8833');
    updatedTaxData.formsNeeded = formsNeeded;

    // Compute refund estimate
    if (totalIncome > 0 || updatedTaxData.withholding?.ficaRefundAmount > 0) {
      refundEstimate = estimateTaxRefund(updatedTaxData);
    }

    res.json({
      message: cleanResponse,
      extractedData,
      isStepComplete,
      isAllComplete,
      requestUploadType,
      treatyDetected: treatyResult?.treatyApplies ? treatyResult : null,
      ficaIssue: ficaResult,
      updatedTaxData,
      refundEstimate
    });
  } catch (error) {
    console.error('Conversation error:', error);
    res.status(500).json({ error: 'Failed to process message', details: error.message });
  }
});

router.post('/init', async (req, res) => {
  const greeting = "Hi! I'm Maya, your TaxMate assistant. I'm here to help you file your US taxes for free. First — are you on an F-1 or J-1 visa?";
  res.json({ message: greeting });
});

module.exports = router;
