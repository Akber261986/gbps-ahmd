const express = require('express');
const puppeteer = require('puppeteer');
const { getSindhiFontCSS, mbLeekaShabir } = require('../utils/fontLoader');
const studentAgeModule = require('../utils/student_age');
const student_age =
  typeof studentAgeModule === 'function'
    ? studentAgeModule
    : studentAgeModule.default;

const router = express.Router();

router.post('/', async (req, res) => {
  let browser;

  try {
    const { student, school, classes } = req.body;
    if (!student || typeof student !== 'object') {
      return res.status(400).json({ error: 'Student data is required' });
    }

    const admissionClass = classes?.find(c => c.id === student.admission_class_id);
    const className = admissionClass?.name || '';

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '';
    const age = student_age(student.date_of_birth, student.admission_date);

    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<style>
${getSindhiFontCSS()}
${mbLeekaShabir('MB-Leeka-Shabir-Kumbhar-2.0', 'MB-Leeka-Shabir-Kumbhar-2.0.ttf')}

body {
    font-family: 'MB Sindhi Web SK 2.0';
    direction: rtl;
    padding: 0;
    margin: 0;
    line-height: 1.6;
    background: #e0e0e0;
    display: flex;
    justify-content: center;
    padding: 20px;
}

.paper {
    background: #f5f0c9;
    border: 6px solid #2c7a4b;
    padding: 30px;
    width: 200mm;
    min-height: 240mm;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    page-break-inside: avoid;
    page-break-after: avoid;
}

.title {
  text-align: center;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 15px;
}

.row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin: 4px 8px;
  font-size: 16px;
  min-height: 18px;
  gap: 8px;
}

.number {
  width: 30px;
  font-family: 'Times New Roman', Times, serif;
}

.label {
  white-space: nowrap;
}

.line {
  flex: 1;
  border-bottom: 1px solid #000;
  margin: 0;
  text-align: center;
  font-size: 18px;
  line-height: 1.6;
  min-height: 18px;
}

.pair-row {
  display: flex;
  gap: 12px;
  margin: 8px 8px;
}

.field-row {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
}

.field {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  white-space: nowrap;
}

.numeric-value,
.date-value {
  font-family: 'Times New Roman', Times, serif;
}

.line.age-row {
  flex: 0 0 30%;
}

.signatures {
  margin-top: 80px;
  display: flex;
  justify-content: space-between;
}

.sign {
  text-align: center;
  width: 40%;
  font-size: 14px;
}

.sign-line {
  border-top: 1px solid #000;
  margin-bottom: 5px;
}

</style>
</head>

<body>

<div class="paper">

<div class="title" style="font-family: 'MB-Leeka-Shabir-Kumbhar-2.0'">داخلا فارم</div>

<div style="display:flex; flex-direction:column; align-items:center; margin-bottom:15px; font-size:18px;">
  <div style="margin-bottom:8px;">
    <strong>${school?.school_name || "—"}</strong>
  </div>
  <div>
    <span>سيمس ڪوڊ: </span>
    <strong class="numeric-value">${school?.semis_code || "—"}</strong>
  </div>
</div>

<div class="row">
  <span class="number">1.</span>
  <span class="label">جنرل رجسٽر نمبر</span>
  <span class="line"><span class="numeric-value">${student.gr_number || ""}</span></span>
</div>

<div class="row">
  <span class="number">2.</span>
  <span class="label">داخلہ جي تاريخ</span>
  <span class="line"><span class="date-value">${formatDate(student.admission_date)}</span></span>
</div>

<div class="pair-row">
  <div class="field-row">
    <span class="field">
      <span class="number">3.</span>
      <span class="label">شاگرد جو نالو</span>
    </span>
    <span class="line">${student.name || ""}</span>
  </div>
  <div class="field-row">
    <span class="field">
      <span class="number">4.</span>
      <span class="label">والد جو نالو</span>
    </span>
    <span class="line">${student.father_name || ""}</span>
  </div>
</div>

<div class="pair-row">
  <div class="field-row">
    <span class="field">
      <span class="number">5.</span>
      <span class="label">قوم</span>
    </span>
    <span class="line">${student.qom || ""}</span>
  </div>
  <div class="field-row">
    <span class="field">
      <span class="number">6.</span>
      <span class="label">ذات</span>
    </span>
    <span class="line">${student.caste || ""}</span>
  </div>
</div>

<div class="pair-row">
  <div class="field-row">
    <span class="field">
      <span class="number">7.</span>
      <span class="label">سرپرست جو نالو</span>
    </span>
    <span class="line">${student.guardian_name || ""}</span>
  </div>
  <div class="field-row">
    <span class="field">
      <span class="number">8.</span>
      <span class="label">بمعہ مائيٽي</span>
    </span>
    <span class="line">${student.relation_with_guardian || ""}</span>
  </div>
</div>

<div class="row">
<span class="number">9.</span>
<span class="label">سرپرست جو ڌنڌو</span>
<span class="line">${student.guardian_occupation || ""}</span>
</div>

<div class="row">
<span class="number">10.</span>
<span class="label">پيدائش جي جاءِ</span>
<span class="line">${student.place_of_birth || ""}</span>
</div>

<div class="row">
<span class="number">11.</span>
<span class="label">پيدائش جي تاريخ</span>
<span class="line"><span class="date-value">${formatDate(student.date_of_birth)}</span></span>
</div>

<div class="row">
<span class="number">12.</span>
<span class="label">پيدائش جي تاريخ لفظن ۾</span>
<span class="line">${student.date_of_birth_in_letter || ""}</span>
</div>

<div class="row">
<span class="number">13.</span>
<span class="label">ڪھڙي اسڪول مان آيو</span>
<span class="line">${student.previous_school || ""}</span>
</div>

<div class="row">
<span class="number">14.</span>
<span class="label"> ڪهڙي ڪلاس ۾ داخل ٿيو / ٿي</span>
<span class="line">${className}</span>
</div>

<div class="row">
<span class="number">15.</span>
<span class="label">سرپرست جي صحيح</span>
<span class="line"></span>
</div>

<div class="row">
<span class="number">16.</span>
<span class="label">داخلہ وقت عمر</span>
<span class="line age-row"><span class="numeric-value">${age ? age.y : ""}</span> سال</span>
<span class="line age-row"><span class="numeric-value">${age ? age.m : ""}</span> مھينا</span>
<span class="line age-row"><span class="numeric-value">${age ? age.d : ""}</span> ڏينھن</span>
</div>

<div class="signatures">

<div class="sign">
<div class="sign-line"></div>
<p>صحيح ڪلاس ماسٽر / ماسترياڻي</p>
</div>

<div class="sign">
<div class="sign-line"></div>
<p>صحيح هيڊ ماسٽر / هيڊ مسٽريس</p>
</div>

</div>

</div>

</body>
</html>

`;

    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

    const page = await browser.newPage();
    await page.setContent(html);

    const pdf = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.end(pdf);

  } catch (error) {
    console.error('=== Admission Form PDF Generation Error ===');
    console.error(error);
    res.status(500).json({
      error: 'PDF generation failed',
      message: error.message
    });
  } finally {
    if (browser) await browser.close();
  }
});

module.exports = router;