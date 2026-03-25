const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { getFontFaceCSS } = require('../utils/fontLoader');

const router = express.Router();

// Load and convert images to Base64 once at module initialization
const loadImageAsBase64 = (imagePath) => {
  try {
    const absolutePath = path.join(__dirname, '..', '..', imagePath);
    const imageBuffer = fs.readFileSync(absolutePath);
    const base64Image = imageBuffer.toString('base64');
    return `data:image/png;base64,${base64Image}`;
  } catch (error) {
    console.error(`Failed to load image: ${imagePath}`, error);
    return '';
  }
};

const frameImageBase64 = loadImageAsBase64('public/images/frame.png');
const frame2ImageBase64 = loadImageAsBase64('public/images/frame2.png');

router.post('/', async (req, res) => {
  let browser;

  try {
    const { classes, school, academicYear, statistics } = req.body;

    if (!classes || !Array.isArray(classes)) {
      return res.status(400).json({ error: 'Classes array is required' });
    }

    if (!statistics || !Array.isArray(statistics)) {
      return res.status(400).json({ error: 'Statistics array is required' });
    }

    const escapeHtml = (text) => {
      if (!text) return '';
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const displayYear = academicYear || new Date().getFullYear();

    function filterNameOnly(schoolName) {
      const indexNo = schoolName.split(' ').indexOf("اسڪول")
      const nameOnly = schoolName.split(' ').slice(indexNo+1).join(' ')
      return nameOnly
  }

    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<style>
${getFontFaceCSS('MB-Bhitai-Sattar-SK-2.0', 'MB-Bhitai-Sattar-SK-2.0.ttf')}

@page {
  size: A4 landscape;
  margin: 4mm;
}

body {
  font-family: 'MB-Bhitai-Sattar-SK-2.0';
  margin: 0;
  padding: 0;
  direction: rtl;
  font-size: 16px;
}

.container {
  width: 270mm;
  min-height: 175mm;
  margin-top: 15mm;
  margin-bottom: 0;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 20px solid transparent;
  border-image: url('${frame2ImageBase64}') 90 round;
  page-break-inside: avoid;
}

.container:not(:last-child) {
  page-break-after: always;
  margin-bottom: 8mm;
}

.head_logo {
  width: 100%;
  height: 250px;
  position: relative;
  font-size: 22px;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.head_logo h1 {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -110%);
}
.head_logo p {
  position: absolute;
  bottom: -20%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: xx-large;
}

.sub_content {
  margin-top: 30px;
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  font-size: large;
}

.sub_content p {
  width: 80%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: bold;
  margin: 5px 0;
}

.sub_content p ._data {
  border-bottom: solid 2px black;
  width: 7%;
  text-wrap: nowrap;
  text-align: center;
  height: 20px;
}

.sub_content p ._data1 {
  border-bottom: solid 2px black;
  width: 25%;
  text-wrap: nowrap;
  text-align: center;
  height: 20px;
}

.sub_content p ._data2 {
  border-bottom: solid 2px black;
  width: 14%;
  height: 20px;
  text-wrap: nowrap;
  text-align: center;
}

.certificate {
  width: 80%;
  height: 170px;
  border: 8px double black;
  margin-top: 20px;
  border-radius: 10px;
  display: flex;
}

.box1 {
  text-align: center;
  width: 50%;
  padding: 20px;
}

.box1 h1 {
  text-shadow: #ffcc00 1px 0 10px;
  font-size: 36px;
  margin: 10px 0;
}

.box1 p {
  font-size: large;
  font-weight: bold;
  margin-top: 20px;
}

.box2 {
  display: flex;
  align-items: end;
  justify-content: center;
  font-size: large;
  width: 50%;
}

.box2 p {
  border-top: solid 2px black;
  width: 50%;
  text-wrap: nowrap;
  text-align: center;
  font-weight: bold;
  padding-top: 10px;
}

.heading {
  font-size: 60px;
  font-weight: bold;
  margin: 20px 0px;
  text-shadow: #ffcc00 4px 0 10px;
}

table {
  width: 98%;
  border-collapse: collapse;
  table-layout: fixed;
}

th, td {
  border: 1px solid #000;
  padding: 4mm 2mm;
  text-align: center;
  vertical-align: middle;
  word-wrap: break-word;
}

th {
  background: #e5e7eb;
  font-size: 20px;
  font-weight: bold;
}

td {
  font-size: 14px;
  font-weight: bold;
}

tr {
  page-break-inside: avoid;
}

.footer {
  width: 100%;
  margin-top: 40px;
  font-size: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.footer b {
  border-bottom: solid 2px black;
  text-wrap: nowrap;
  text-align: center;
  height: 20px;
}
</style>
</head>

<body>

<div class="container">
  <div class="head_logo">
    <img src="${frameImageBase64}" alt="Frame" style="width: 100%; height: 100%; object-fit: contain;">
    <h1>سالياني امتحان جي رزلٽ شيٽ</h1>
    <p>براءِ سال ${escapeHtml(displayYear)}</p>
  </div>

  <div class="sub_content">
    <p>
      <strong>گورنمينٽ پرائمري اسڪول</strong>
      <strong class="_data" style="width: 200px;">${escapeHtml(filterNameOnly(school?.school_name) || '')}</strong>
      <strong>تعلقو</strong>
      <strong class="_data">${escapeHtml(school?.taluka || '')}</strong>
      <strong>ضلعو</strong>
      <strong class="_data">${escapeHtml(school?.district || '')}</strong>
    </p>
    <p>
      <strong>سيمس ڪوڊ</strong>
      <strong class="_data1">${escapeHtml(school?.semis_code || '')}</strong>
      <strong>اڪائونٽ نمبر</strong>
      <strong class="_data1">${escapeHtml(school?.account_number || '')}</strong>
    </p>
    <p class="data2">
      <strong>ڪلاس ماستر</strong>
      <strong class="_data2">${escapeHtml(school?.class_master || '')}</strong>
      <strong>ھيڊ ماسٽر</strong>
      <strong class="_data2">${escapeHtml(school?.principal_name || '')}</strong>
      <strong>ايجوڪيشن سپروائيزر بيٽ</strong>
      <strong class="_data2">${escapeHtml(school?.supervisor_beat || '')}</strong>
    </p>
  </div>

  <div class="certificate">
    <div class="box1">
      <h1>سرٽيفڪيٽ</h1>
      <p>سرٽيفڪيٽ ٿو ڏجي تہ رزلٽ شيٽ ۾ موجود داخلائون جنرل رجسٽر جي مطابق درست آھن</p>
    </div>
    <div class="box2">
      <p>صحيح ڪلاس ھيڊ ماسٽر</p>
    </div>
  </div>
</div>

<div class="container">
  <div class="heading">اختصار رزلٽ شيٽ</div>
  <table>
    <thead>
      <tr>
        <th colspan="2">ڪلاس</th>
        <th colspan="3">داخل</th>
        <th colspan="3">پاس</th>
        <th colspan="3">نا پاس</th>
        <th colspan="3">غير حاضر</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td colspan="2"></td>
        <td>ڇوڪرا</td>
        <td>ڇوڪريون</td>
        <td>ٽوٽل</td>
        <td>ڇوڪرا</td>
        <td>ڇوڪريون</td>
        <td>ٽوٽل</td>
        <td>ڇوڪرا</td>
        <td>ڇوڪريون</td>
        <td>ٽوٽل</td>
        <td>ڇوڪرا</td>
        <td>ڇوڪريون</td>
        <td>ٽوٽل</td>
      </tr>
      ${statistics.map(stat => `
        <tr>
          <td colspan="2">${escapeHtml(stat.class_name)}</td>
          <td>${stat.enrolled_boys || ""}</td>
          <td>${stat.enrolled_girls || ""}</td>
          <td>${stat.enrolled_total || ""}</td>
          <td>${stat.passed_boys || ""}</td>
          <td>${stat.passed_girls || ""}</td>
          <td>${stat.passed_total || ""}</td>
          <td>${stat.failed_boys || ""}</td>
          <td>${stat.failed_girls || ""}</td>
          <td>${stat.failed_total || ""}</td>
          <td>${stat.absent_boys || ""}</td>
          <td>${stat.absent_girls || ""}</td>
          <td>${stat.absent_total || ""}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <span>ھيڊ ماسٽر</span>
    <b style="width: 35%;">${escapeHtml(school?.school_name || '')}</b>
    <span>ايجوڪيشن سپروائيزر بيٽ</span>
    <b style="width: 13%;">${escapeHtml(school?.supervisor_beat || '')}</b>
    <span>تعلقو</span>
    <b style="width: 5%;">${escapeHtml(school?.taluka || '')}</b>
    <span>ضلعو</span>
    <b style="width: 5%;">${escapeHtml(school?.district || '')}</b>
  </div>
</div>

</body>
</html>
`;

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=summary-resultsheet.pdf');
    res.end(pdfBuffer);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'PDF generation failed' });
  } finally {
    if (browser) await browser.close();
  }
});

module.exports = router;
