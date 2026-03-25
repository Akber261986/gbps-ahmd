const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { getFontFaceCSS } = require('../utils/fontLoader');
const router = express.Router();

// Load all fonts at module initialization
const fontsDir = path.join(__dirname, '..', '..', 'fonts');
const fontFiles = fs.readdirSync(fontsDir).filter(file => file.endsWith('.ttf'));

// Generate font family names from filenames
const fonts = fontFiles.map(file => {
  const fontFamily = file.replace('.ttf', '').replace(/\s+/g, '-');
  return { fontFamily, fileName: file };
});

// POST /pdf/font-test
router.post('/', async (req, res) => {
  let browser;

  try {
    console.log('=== Font Test PDF Generation Started ===');

    // Generate @font-face CSS for all fonts
    const allFontCSS = fonts.map(font =>
      getFontFaceCSS(font.fontFamily, font.fileName)
    ).join('\n');

    // Sample text to display in each font
    const sampleText = 'شاگرد جو نالو - محمد احمد علي - سالياني امتحان جي رزلٽ شيٽ';

    // Generate HTML content with all fonts
    const htmlContent = `
      <!DOCTYPE html>
<html lang="ur" dir="rtl">

<head>
    <meta charset="UTF-8" />
    <title>Font Test - All Fonts</title>

    <style>
    ${allFontCSS}
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            direction: rtl;
            padding: 10mm;
        }

        .section {
            margin-bottom: 5mm;
            page-break-inside: avoid;
        }

        .section-title {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 2mm;
            color: #666;
            font-family: Arial, sans-serif;
        }

        .sample-text {
            font-size: 18px;
            line-height: 1.6;
            padding: 3mm;
            background: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 2mm;
        }

        @page {
            size: A4;
            margin: 10mm;
        }

        h1 {
            text-align: center;
            font-size: 24px;
            margin-bottom: 10mm;
            font-family: Arial, sans-serif;
        }
    </style>
</head>

<body>
    <h1>Sindhi Fonts Comparison - سنڌي فونٽس جو مقابلو</h1>

    ${fonts.map(font => `
    <div class="section">
        <div class="section-title">${font.fontFamily}</div>
        <div class="sample-text" style="font-family: '${font.fontFamily}';">
            ${sampleText}
        </div>
    </div>
    `).join('\n')}

</body>
</html>
    `;

    console.log('Launching Puppeteer...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    console.log('Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        bottom: '15mm',
        left: '15mm',
        right: '15mm'
      }
    });

    console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=font-test-${Date.now()}.pdf`);
    res.end(pdfBuffer, 'binary');

  } catch (error) {
    console.error('=== Font Test PDF Generation Error ===');
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
