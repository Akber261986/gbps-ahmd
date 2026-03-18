const express = require('express');
const puppeteer = require('puppeteer');
const router = express.Router();

// POST /pdf/generic
router.post('/', async (req, res) => {
  let browser;

  try {
    console.log('=== Generic PDF Generation Started ===');

    const { url, html } = req.body;

    if (!url && !html) {
      return res.status(400).json({
        error: 'Either url or html is required',
        usage: 'Send { "url": "https://example.com" } or { "html": "<html>...</html>" }'
      });
    }

    console.log('Launching Puppeteer...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    if (html) {
      // Generate PDF from HTML string
      console.log('Setting HTML content...');
      await page.setContent(html, { waitUntil: 'networkidle0' });
    } else {
      // Generate PDF from URL
      console.log('Navigating to URL:', url);
      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });
    }

    console.log('Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '15mm',
        right: '15mm'
      }
    });

    console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=document.pdf');
    res.send(pdfBuffer);

  } catch (error) {
    console.error('=== Generic PDF Generation Error ===');
    console.error('Error:', error);
    res.status(500).json({
      error: 'PDF generation failed',
      message: error.message
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

module.exports = router;
