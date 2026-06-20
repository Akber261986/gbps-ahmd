const express = require('express');
const puppeteer = require('puppeteer');
const { getSindhiFontCSS } = require('../utils/fontLoader');

const router = express.Router();

router.post('/', async (req, res) => {
  let browser;

  try {
    const { students, classes, school, academicYear } = req.body;

    // Use provided academic year or default to current year
    const displayYear = academicYear || new Date().getFullYear();

    // Separate students by gender for each class
    const getStudentsByGender = (classStudents) => {
      const boys = classStudents.filter(s =>
        s.gender === "ڇوڪرو" || s.gender === "boy" || s.gender === "Male" || s.gender === "Boy"
      );
      const girls = classStudents.filter(s =>
        s.gender === "ڇوڪري" || s.gender === "girl" || s.gender === "Female" || s.gender === "Girl"
      );
      return { boys, girls };
    };

    const tableHead = `
<tr>
  <th colspan="15" class="sindhi">
    <div class="header-title">جديد رزلٽ شيٽ - سال - ${displayYear}</div>
    <div class="header-sub">
      <span>نقشو امتحان جي مارڪن جو</span>
      <span class="s-name">${school?.school_name || 'اسڪول'}</span>
      <span>جي درجي ــــــــــــــــ جو ساليانو امتحان تاريخ ـــــــــــ مھينو ــــــــــــــــــ سال ـــــــــــــــــ</span>
    </div>
  </th>
</tr>

<tr>
    <th style="width: 17mm;">جنرل رجسٽر نمبر</th>
    <th style="width: 12mm">ڳاڻيٽي جو نمبر</th>
    <th style="width: 35mm">شاگرد جو نالو</th>
    <th style="width: 35mm">پيءُجو نالو </th>
    <th style="width: 14mm">دينيات</th>
    <th style="width: 14mm">مادري زبان</th>
    <th style="width: 14mm">رياضي</th>
    <th style="width: 14mm">سماجي</th>
    <th style="width: 14mm">سائنس</th>
    <th style="width: 14mm">اردو</th>
    <th style="width: 14mm">انگلش</th>
    <th style="width: 14mm">ڊرائنگ</th>
    <th style="width: 25mm">ڄمڻ جي تاريخ</th>
    <th style="width: 25mm">داخلا جي تاريخ</th>
    <th style="width: 16mm">پاس يا ناپاس</th>
</tr>

<tr class="marks-row">
  <th colspan="4"></th>
  <th>100</th>
  <th>100</th>
  <th>100</th>
  <th>100</th>
  <th>100</th>
  <th>100</th>
  <th>100</th>
  <th>100</th>
  <th colspan="3"></th>
</tr>`;

    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">

<style>
${getSindhiFontCSS()}
${getSindhiShabirBold('MB-Supreen-Shabir-Kumbhar-Bold-2.0', 'MB-Supreen-Shabir-Kumbhar-Bold-2.0.ttf')}
@page {
  size: Legal landscape;
  margin: 4mm 4mm 10mm 4mm;
}

html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'MB-Supreen-Shabir-Kumbhar-Bold-2.0';
  direction: rtl;
  background: #e0e0e0;
  display: flex;
  justify-content: center;
  padding: 10px;
}

/* PAPER STYLING */
.paper {
  min-width: 215mm;
}

/* TABLE STYLING */
table.resultsheet {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

thead {
  display: table-header-group;
}

tbody {
  display: table-row-group;
}

.student-row td {
  break-inside: avoid;
  page-break-inside: avoid;
}

/* CELLS */
th, td {
  border: 1px solid #000;
  padding: 2mm;
  text-align: center;
  vertical-align: middle;
  font-size: 15pt;
}

/* HEADER CELLS */
th {
  background: #e5e7eb;
  font-size: 15pt;
}

thead tr:nth-child(2) th {
  border-bottom: none;
}

thead tr.marks-row th {
  border-top: none;
  padding-top: 0;
  font-size: 13pt;
}

/* SINDHI TEXT */
.sindhi {
  direction: rtl;
  text-align: center;
}

/* CLASS HEADER */
.class-header {
  background-color: #e5e5e5;
  font-weight: bold;
  font-size: 14pt;
  padding: 2mm;
  text-align: center;
  /* padding-right: 6mm; */
}

/* GENDER HEADER */
.gender-header {
  background-color: #ffd1dc;
  font-weight: bold;
  font-size: 13pt;
  padding: 2mm;
}

.class-name-row {
  break-after: avoid;
  page-break-after: avoid;
}

tr.class-section {
  break-before: page;
  page-break-before: always;
}

@media print {
  html, body {
    width: auto;
    height: auto;
    margin: 0;
    padding: 0;
    background: white;
  }

  body {
    display: block;
  }

  .paper {
    min-width: 0;
    width: 100%;
  }

  thead {
    display: table-header-group;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .header-sub {
    display: block;
    text-align: center;
  }
}

/* TITLE STYLING */
.header-title {
  font-size: 22pt;
  font-weight: bold;
}

.s-name {
  font-weight: bold;
  font-size: 14pt;
  text-decoration: underline;
  text-underline-offset: 6px;
}

.header-sub {
  font-size: 12pt;
  gap: 10mm;
  padding: 1mm;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
</head>

<body>

<div class="paper">
<table class="resultsheet">

<thead>
${tableHead}
</thead>

<tbody>

${classes.map((cls, classIndex) => {
  const classStudents = students.filter(s => s.current_class_id === cls.id);
  const { boys, girls } = getStudentsByGender(classStudents);

  const renderStudents = (studentList, startIndex) => {
    return studentList.map((s, idx) => `
<tr class="student-row">
  <td>${s.gr_number || '-'}</td>
  <td>${startIndex + idx + 1}</td>
  <td class="sindhi">${s.name || '-'}</td>
  <td class="sindhi">${s.father_name || '-'}</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td>${s.date_of_birth ? new Date(s.date_of_birth).toLocaleDateString('en-GB') : '—'}</td>
  <td>${s.admission_date ? new Date(s.admission_date).toLocaleDateString('en-GB') : '—'}</td>
  <td></td>
</tr>
    `).join('');
  };

  return `
<tr class="class-name-row${classIndex > 0 ? ' class-section' : ''}">
  <td colspan="15" class="class-header sindhi">${cls.name}</td>
</tr>

${boys.length > 0 ? renderStudents(boys, 0) : ''}

${girls.length > 0 ? `
<tr>
  <td colspan="15" class="gender-header sindhi">ڇوڪريون (Girls)</td>
</tr>
${renderStudents(girls, boys.length)}
` : ''}

${classStudents.length === 0 ? `
<tr>
  <td colspan="15" style="padding: 4mm; text-align: center; color: #9ca3af; font-style: italic;">هن ڪلاس ۾ ڪوبه شاگرد موجود ناهي</td>
</tr>
` : ''}
  `;
}).join('')}

</tbody>

</table>
</div>

</body>
</html>
`;

    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer'
      ]
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('print');

    const pdfBuffer = await page.pdf({
      format: 'Legal',
      landscape: true,
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '4mm',
        bottom: '10mm',
        left: '4mm',
        right: '4mm'
      }
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