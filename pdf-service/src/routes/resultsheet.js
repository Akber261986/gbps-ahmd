const express = require('express');
const puppeteer = require('puppeteer');
const { getSindhiFontCSS } = require('../utils/fontLoader');

const router = express.Router();

router.post('/', async (req, res) => {
  let browser;

  try {
    const { students, classes, school } = req.body;

    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">

<style>
${getSindhiFontCSS()}

/* ✅ A4 LANDSCAPE */
@page {
  size: A4 landscape;
  margin: 10mm 8mm;
}

html, body {
  width: 297mm;
  height: 210mm;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'MB Sindhi Web SK 2.0';
  direction: rtl;
  font-size: 11px;
}

/* ✅ TABLE */
table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed; /* ⭐ IMPORTANT */
}

/* ✅ HEADER REPEAT MAGIC */
thead {
  display: table-header-group;
}

/* prevent row breaking */
tr {
  page-break-inside: avoid;
}

/* cells */
th, td {
  border: 1px solid #000;
  padding: 2mm;
  text-align: center;
  vertical-align: middle;
}

/* header cells */
th {
  font-size: 11px;
  background: #e5e7eb;
}

/* data cells */
td {
  font-size: 11px;
}

/* title block */
.header-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 2mm;
}

.header-sub {
  font-size: 12px;
}

/* class row */
.class-header {
  background: #d1d5db;
  font-weight: bold;
}

/* page break per class */
.class-section {
  page-break-before: always;
}

.class-section:first-child {
  page-break-before: auto;
}

</style>
</head>

<body>

<table>

<thead>

<tr>
  <th colspan="15">
    <div class="header-title">جديد رزلٽ شيٽ - 2026</div>
    <div class="header-sub">
      ${school?.school_name || 'اسڪول'} — نقشو امتحان جي مارڪن جو
    </div>
  </th>
</tr>

<tr>
  <th rowspan="2">GR</th>
  <th rowspan="2">نمبر</th>
  <th rowspan="2">شاگرد</th>
  <th rowspan="2">پيءُ</th>
  <th>دينيات</th>
  <th>سنڌي</th>
  <th>رياضي</th>
  <th>سماجي</th>
  <th>سائنس</th>
  <th>اردو</th>
  <th>انگلش</th>
  <th>ڊرائنگ</th>
  <th rowspan="2">پيدائش</th>
  <th rowspan="2">داخلا</th>
  <th rowspan="2">نتيجو</th>
</tr>

<tr>
  ${Array(8).fill('<th>100</th>').join('')}
</tr>

</thead>

<tbody>

${classes.map((cls, i) => {
  const classStudents = students.filter(s => s.current_class_id === cls.id);

  return `
<tr class="class-header ${i > 0 ? 'class-section' : ''}">
  <td colspan="15">${cls.name}</td>
</tr>

${classStudents.map((s, idx) => `
<tr>
  <td>${s.gr_number || ''}</td>
  <td>${idx + 1}</td>
  <td>${s.name || ''}</td>
  <td>${s.father_name || ''}</td>
  ${Array(8).fill('<td></td>').join('')}
  <td>${s.date_of_birth ? new Date(s.date_of_birth).toLocaleDateString('en-GB') : ''}</td>
  <td>${s.admission_date ? new Date(s.admission_date).toLocaleDateString('en-GB') : ''}</td>
  <td></td>
</tr>
`).join('')}

`;
}).join('')}

</tbody>

</table>

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
      preferCSSPageSize: true // ⭐ MUST for header repeat consistency
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=resultsheet.pdf');
    res.end(pdfBuffer);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'PDF generation failed' });
  } finally {
    if (browser) await browser.close();
  }
});

module.exports = router;