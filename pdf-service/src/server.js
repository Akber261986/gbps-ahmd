const express = require('express');
const cors = require('cors');
const admissionFormRoute = require('./routes/admission-form');
const grRoute = require('./routes/gr');
const leavingCertificateRoute = require('./routes/leaving-certificate');
const resultsheetRoute = require('./routes/resultsheet');
const genericPdfRoute = require('./routes/generic');
const fontTestRoute = require('./routes/font-test');

const app = express();
const PORT = process.env.PORT || 7860;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PDF Generation Service',
    version: '1.0.0',
    endpoints: [
      'POST /pdf/admission-form',
      'POST /pdf/gr',
      'POST /pdf/leaving-certificate',
      'POST /pdf/resultsheet',
      'POST /pdf/generic',
      'POST /pdf/font-test'
    ]
  });
});

// PDF generation routes
app.use('/pdf/admission-form', admissionFormRoute);
app.use('/pdf/gr', grRoute);
app.use('/pdf/leaving-certificate', leavingCertificateRoute);
app.use('/pdf/resultsheet', resultsheetRoute);
app.use('/pdf/generic', genericPdfRoute);
app.use('/pdf/font-test', fontTestRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`PDF Service running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
