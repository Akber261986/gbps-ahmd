const express = require('express');
const puppeteer = require('puppeteer');
const { getSindhiFontCSS } = require('../utils/fontLoader');

const router = express.Router();

router.post('/', async (req, res) => {
  let browser;

  try {
    const { students, classes, school } = req.body;

    if (!students || !Array.isArray(students)) {
      return res.status(400).json({ error: 'Students array is required' });
    }

    const getClassName = (id) =>
      classes?.find(c => c.id === id)?.name || '';

    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">

<style>
${getSindhiFontCSS()}

/* ✅ LEGAL LANDSCAPE SETUP */
@page {
  size: legal landscape;
  margin: 8mm;
}

html, body {
  width: 356mm;
  height: 216mm;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'MB Sindhi Web SK 2.0';
  direction: rtl;
  font-size: 11px;
}

/* ✅ Container */
.container {
  width: 100%;
  padding: 4mm;
  box-sizing: border-box;
}

/* ✅ Header */
.header {
  text-align: center;
  margin-bottom: 4mm;
}

.header h1 {
  font-size: 18px;
  margin-bottom: 2mm;
}

.header p {
  font-size: 14px;
}

.school-info {
  margin-top: 2mm;
  font-size: 13px;
}

/* ✅ Table */
table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed; /* ⭐ important */
}

/* repeat header on new pages */
thead {
  display: table-header-group;
}

th, td {
  border: 1px solid #000;
  padding: 2mm;
  text-align: center;
  vertical-align: middle;
  word-wrap: break-word;
}

/* header */
th {
  background: #e5e7eb;
  font-size: 11px;
  font-weight: bold;
}

/* data */
td {
  font-size: 11px;
}

/* prevent row break */
tr {
  page-break-inside: avoid;
}

</style>
</head>

<body>

<div class="container">

  <div class="header">
    <h1>شاگردن جو جنرل رجسٽر</h1>
    <p>${school?.school_name || 'اسڪول'}</p>
    <div class="school-info">
      سيمس ڪوڊ: ${school?.semis_code || ''}
    </div>
  </div>

  <table>

    <!-- Adjusted widths for LEGAL page -->
    <colgroup>
      <col style="width:18mm">
      <col style="width:35mm">
      <col style="width:35mm">
      <col style="width:30mm">
      <col style="width:25mm">
      <col style="width:30mm">
      <col style="width:20mm">
      <col style="width:18mm">
      <col style="width:30mm">
      <col style="width:25mm">
      <col style="width:25mm">
      <col style="width:20mm">
      <col style="width:25mm">
      <col style="width:25mm">
      <col style="width:30mm">
      <col style="width:20mm">
      <col style="width:20mm">
      <col style="width:25mm">
    </colgroup>

    <thead>
      <tr>
        <th>GR نمبر</th>
        <th>شاگرد جو نالو</th>
        <th>پيءُ جو نالو</th>
        <th>پيدائش جي جاءِ</th>
        <th>تاريخ (انگن ۾)</th>
        <th>تاريخ (لفظن ۾)</th>
        <th>مذهب</th>
        <th>ذات</th>
        <th>پويون اسڪول</th>
        <th>داخلا ڪلاس</th>
        <th>داخلا تاريخ</th>
        <th>سرٽيفڪيٽ نمبر</th>
        <th>ڇڏڻ تاريخ</th>
        <th>ڇڏڻ ڪلاس</th>
        <th>سبب</th>
        <th>تعليم</th>
        <th>چال چلت</th>
        <th>ريمارڪس</th>
      </tr>
    </thead>

    <tbody>
      ${students.map(s => `
        <tr>
          <td>${s.gr_number || ''}</td>
          <td>${s.name || ''}</td>
          <td>${s.father_name || ''}</td>
          <td>${s.place_of_birth || ''}</td>
          <td>${s.date_of_birth || ''}</td>
          <td>${s.date_of_birth_words || ''}</td>
          <td>${s.religion || ''}</td>
          <td>${s.caste || ''}</td>
          <td>${s.previous_school || ''}</td>
          <td>${getClassName(s.admission_class_id)}</td>
          <td>${s.admission_date || ''}</td>
          <td>${s.leaving_certificate_number || ''}</td>
          <td>${s.leaving_date || ''}</td>
          <td>${getClassName(s.leaving_class_id)}</td>
          <td>${s.reason_for_leaving || ''}</td>
          <td>${s.educational_qualification || ''}</td>
          <td>${s.conduct || ''}</td>
          <td>${s.remarks || ''}</td>
        </tr>
      `).join('')}
    </tbody>

  </table>

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
      preferCSSPageSize: true // ⭐ CRITICAL FIX
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=gr-register.pdf');
    res.end(pdfBuffer);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'PDF generation failed' });
  } finally {
    if (browser) await browser.close();
  }
});

module.exports = router;