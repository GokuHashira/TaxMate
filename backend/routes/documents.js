const express = require('express');
const router = express.Router();
const multer = require('multer');
const { extractDocumentData } = require('../services/claudeService');
const { checkFICA } = require('../services/ficaChecker');
const { detectTreaty } = require('../services/treatyDetector');

// Store files in memory only — never persist tax documents to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed'), false);
    }
  }
});

router.post('/upload', upload.single('document'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { docType } = req.body;
  if (!docType || !['W2', '1042S'].includes(docType)) {
    return res.status(400).json({ error: 'docType must be W2 or 1042S' });
  }

  try {
    const base64 = req.file.buffer.toString('base64');
    const mediaType = req.file.mimetype;

    const extractedData = await extractDocumentData(base64, docType, mediaType);

    // Run FICA check automatically if W-2 uploaded
    let ficaResult = null;
    if (docType === 'W2') {
      ficaResult = checkFICA(extractedData);
    }

    // Run treaty detection if 1042-S with treaty country
    let treatyResult = null;
    if (docType === '1042S' && extractedData.treatyCountry) {
      treatyResult = detectTreaty(extractedData.treatyCountry);
    }

    res.json({
      success: true,
      docType,
      extractedData,
      ficaIssue: ficaResult?.ficaError ? ficaResult : null,
      treatyDetected: treatyResult?.treatyApplies ? treatyResult : null,
      message: `${docType === 'W2' ? 'W-2' : 'Form 1042-S'} processed successfully`
    });
  } catch (error) {
    console.error('Document extraction error:', error);
    res.status(500).json({ error: 'Failed to extract document data', details: error.message });
  }
});

router.post('/extract-manual', async (req, res) => {
  const { base64Image, docType, mediaType } = req.body;

  if (!base64Image || !docType) {
    return res.status(400).json({ error: 'base64Image and docType are required' });
  }

  try {
    const extractedData = await extractDocumentData(base64Image, docType, mediaType || 'image/jpeg');

    let ficaResult = null;
    if (docType === 'W2') {
      ficaResult = checkFICA(extractedData);
    }

    res.json({
      success: true,
      extractedData,
      ficaIssue: ficaResult?.ficaError ? ficaResult : null
    });
  } catch (error) {
    res.status(500).json({ error: 'Extraction failed', details: error.message });
  }
});

module.exports = router;
