require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const conversationRoutes = require('./routes/conversation');
const documentsRoutes = require('./routes/documents');
const formsRoutes = require('./routes/forms');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/conversation', conversationRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/forms', formsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(PORT, () => {
  console.log(`TaxMate backend running on port ${PORT}`);
  console.log(`ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? 'configured' : 'MISSING'}`);
});
