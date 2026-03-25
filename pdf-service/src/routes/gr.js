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

    // Helper to escape HTML special characters
    const escapeHtml = (text) => {
      if (!text) return '';
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    // Helper to get class name
    const getClassName = (id) => {
      if (!id) return '';
      const className = classes?.find(c => c.id === id)?.name;
      return className || '';
    };

    // Helper to validate and format date to DD-MM-YYYY
    const formatDate = (dateStr) => {
      if (!dateStr) return '';

      // If already in DD-MM-YYYY or DD/MM/YYYY format, normalize to DD-MM-YYYY
      const ddmmyyyySlash = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      const ddmmyyyyDash = /^(\d{2})-(\d{2})-(\d{4})$/;

      if (ddmmyyyySlash.test(dateStr)) {
        return dateStr.replace(/\//g, '-');
      }
      if (ddmmyyyyDash.test(dateStr)) {
        return dateStr;
      }

      // Try parsing ISO format (YYYY-MM-DD) or other formats
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        // Invalid date, return original
        console.warn(`Invalid date format: ${dateStr}`);
        return dateStr;
      }

      // Convert to DD-MM-YYYY
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      return `${day}-${month}-${year}`;
    };

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
  margin: 4mm;
}

html, body {
  margin: 0;
  padding: 0;
}

body {
  direction: rtl;
  font-size: 11px;
}

/* ✅ Container */
.container {
  width: 100%;
  padding: 1px;
  box-sizing: border-box;
}

/* ✅ Header */
.header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 25px;
  text-align: center;
}

.header h1 {
  font-size: 28px;
}

.header p {
  font-size: 18px;
  text-decoration: underline;
  text-underline-offset: 4px;
}

.school-info {
  font-size: 18px;
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
  padding: 2mm 1mm;
  text-align: center;
  vertical-align: middle;
  word-wrap: break-word;
}

/* header */
th {
  background: #e5e7eb;
  font-size: 15px;
  font-weight: bold;
}

/* data */
td {
  font-size: 15px;
}

/* prevent row break */
tr {
  page-break-inside: avoid;
}
.scode {
    text-decoration: underline;
    text-underline-offset: 4px;
    color: red;
}
</style>
</head>

<body>

<div class="container">
  <table>
    <!-- Adjusted widths for LEGAL page -->
    <colgroup>
      <col style="width:15mm"> 
      <col style="width:25mm">
      <col style="width:25mm">
      <col style="width:20mm">
      <col style="width:23mm">
      <col style="width:20mm">
      <col style="width:15mm">
      <col style="width:13mm">
      <col style="width:20mm">
      <col style="width:18mm">
      <col style="width:23mm">
      <col style="width:20mm">
      <col style="width:23mm">
      <col style="width:16mm">
      <col style="width:18mm">
      <col style="width:14mm">
      <col style="width:12mm">
      <col style="width:20mm">
    </colgroup>
    <thead>
      <tr>
        <th colspan="18">
          <div class="header">
            <h1>شاگردن جو جنرل رجسٽر</h1>
            <p>${escapeHtml(school?.school_name)}</p>
            <div class="school-info">
              سيمس ڪوڊ: <b class="scode">${escapeHtml(school?.semis_code)}</b>
            </div>
          </div>
        </th>
      </tr>
      <tr>
        <th>جنرل رجسٽر نمبر</th>
        <th>شاگرد جو نالو</th>
        <th>پيءُ جو نالو</th>
        <th>پيدائش جي جاءِ</th>
        <th> پيدائش جي تاريخ (انگن ۾)</th>
        <th>تاريخ (لفظن ۾)</th>
        <th>مذهب</th>
        <th>ذات</th>
        <th>ڪھڙي اسڪول مان آيو</th>
        <th>ڪھڙي ڪلاس ۾ داخل ٿيو</th>
        <th>داخلا تاريخ</th>
        <th>پويين اسڪول جو جنرل رجسٽر نمبر</th>
        <th>اسڪول ڇڏڻ جي تاريخ</th>
        <th>اسڪول ڇڏڻ وقت ڪلاس</th>
        <th>اسڪول ڇڏڻ جو سبب</th>
        <th>تعليمي قابليت</th>
        <th>چال چلت</th>
        <th>ريمارڪس</th>
      </tr>
    </thead>

    <tbody>
      ${students.map(s => `
        <tr>
          <td>${escapeHtml(s.gr_number)}</td>
          <td>${escapeHtml(s.name)}</td>
          <td>${escapeHtml(s.father_name)}</td>
          <td>${escapeHtml(s.place_of_birth)}</td>
          <td>${escapeHtml(formatDate(s.date_of_birth))}</td>
          <td>${escapeHtml(s.date_of_birth_in_letter)}</td>
          <td>${escapeHtml(s.qom == "مسلمان" ? "اسلام" : s.qom)}</td>
          <td>${escapeHtml(s.caste)}</td>
          <td>${escapeHtml(s.previous_school)}</td>
          <td>${escapeHtml(getClassName(s.admission_class_id))}</td>
          <td>${escapeHtml(formatDate(s.admission_date))}</td>
          <td>${escapeHtml(s.gr_of_previos_school) || "-"}</td>
          <td>${escapeHtml(formatDate(s.leaving_date))}</td>
          <td>${escapeHtml(getClassName(s.leaving_class_id))}</td>
          <td>${escapeHtml(s.leaving_reason)}</td>
          <td>${escapeHtml(s.educational_ability)}</td>
          <td>${escapeHtml(s.character)}</td>
          <td>${escapeHtml(s.remarks)}</td>
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