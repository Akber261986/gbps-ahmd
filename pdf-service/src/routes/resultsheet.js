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

    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">

<style>
${getSindhiFontCSS()}
@page {
  size: Legal landscape;
}

html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'MB Sindhi Web SK 2';
  direction: rtl;
  background: #e0e0e0;
  display: flex;
  justify-content: center;
  padding: 10px;
}

/* PAPER STYLING */
.paper {
      min-width: 215mm;
      min-height: 355mm;
    }

/* TABLE STYLING */
table {
  width: 100%;
  border-collapse: collapse;
}

/* HEADER REPEAT */
thead {
  display: table-header-group;
}

tbody {
  display: table-row-group;
}

/* PREVENT ROW BREAKING */
tr {
  page-break-inside: avoid;
  height: 13mm;
}

.no-break {
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

/* PAGE BREAKS */
.class-section {
  page-break-before: always;
}

.class-section:first-child {
  page-break-before: auto;
}

.class-name-row {
  page-break-after: avoid;
}

/* TITLE STYLING */
.header-title {
  font-size: 26pt;
  font-weight: bold;
}

.s-name {
  font-weight: bold;
  font-size: 16pt;
  text-decoration: underline;
  text-underline-offset: 6px;
}

.header-sub {
  font-size: 14pt;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10mm;
  padding: 1mm;
}
</style>
</head>

<body>

<div class="paper">
<table>

<thead>

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
    <th rowspan="2" style="width: 17mm;">جنرل رجسٽر نمبر</th>
    <th rowspan="2" style="width: 12mm">ڳاڻيٽي جو نمبر</th>
    <th rowspan="2" style="width: 35mm">شاگرد جو نالو</th>
    <th rowspan="2" style="width: 35mm">پيءُجو نالو </th>
    <th style="width: 14mm">دينيات</th>
    <th style="width: 14mm">مادري زبان</th>
    <th style="width: 14mm">رياضي</th>
    <th style="width: 14mm">سماجي</th>
    <th style="width: 14mm">سائنس</th>
    <th style="width: 14mm">اردو</th>
    <th style="width: 14mm">انگلش</th>
    <th style="width: 14mm">ڊرائنگ</th>
    <th rowspan="2" style="width: 25mm">ڄمڻ جي تاريخ</th>
    <th rowspan="2" style="width: 25mm">داخلا جي تاريخ</th>
    <th rowspan="2" style="width: 16mm">پاس يا ناپاس</th>
</tr>

<tr>
  <th>100</th>
  <th>100</th>
  <th>100</th>
  <th>100</th>
  <th>100</th>
  <th>100</th>
  <th>100</th>
  <th>100</th>
</tr>

</thead>

<tbody>

${classes.map((cls, classIndex) => {
  const classStudents = students.filter(s => s.current_class_id === cls.id);
  const { boys, girls } = getStudentsByGender(classStudents);

  const renderStudents = (studentList, startIndex) => {
    return studentList.map((s, idx) => `
<tr class="no-break">
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
<!-- Class Name Row -->
<tr class="${classIndex > 0 ? 'class-section class-name-row' : 'class-name-row'}">
  <td colspan="15" class="class-header sindhi">${cls.name}</td>
</tr>

<!-- Boys Section -->
${boys.length > 0 ? renderStudents(boys, 0) : ''}

<!-- Girls Section -->
${girls.length > 0 ? `
<tr class="no-break">
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