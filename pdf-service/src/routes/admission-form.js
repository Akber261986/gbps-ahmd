const express = require('express');
const puppeteer = require('puppeteer');
const { getSindhiFontCSS, mbLeekaShabir } = require('../utils/fontLoader');

const router = express.Router();

// Helper function to calculate student age
function calculateAge(birthDate, admissionDate) {
  if (!birthDate || !admissionDate) return null;

  const birth = new Date(birthDate);
  const admission = new Date(admissionDate);

  let years = admission.getFullYear() - birth.getFullYear();
  let months = admission.getMonth() - birth.getMonth();
  let days = admission.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(admission.getFullYear(), admission.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return { y: years, m: months, d: days };
}

// POST /pdf/admission-form
router.post('/', async (req, res) => {
  let browser;

  try {
    const { student, school, classes } = req.body;

    if (!student) {
      return res.status(400).json({ error: 'Student data is required' });
    }

    const admissionClass = classes?.find(c => c.id === student.admission_class_id);
    const className = admissionClass ? admissionClass.name : '';

    const age = calculateAge(student.date_of_birth, student.admission_date);

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString('en-GB');
    };

    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">

<style>
${getSindhiFontCSS()}
${mbLeekaShabir('MB-Leeka-Shabir-Kumbhar-2.0', 'MB-Leeka-Shabir-Kumbhar-2.0.ttf')}

/* ✅ A4 Setup */
    @page {
    size: A4 portrait;
    margin: 10mm;
}

html, body {
    width: 210mm;
    height: 297mm;
    margin: 0;
    padding: 0;
}

/* ✅ Base Typography */
body {
    font-family: 'MB Sindhi Web SK 2.0';
    direction: rtl;
    font-size: 14px;
    line-height: 1.5;
}

/* ✅ Paper Container */
.paper {
    width: 190mm;
    min-height: 277mm;
    margin: auto;
    background: #f5f0c9;
    border: 4px solid #2c7a4b;
    padding: 12mm;
    box-sizing: border-box;
}

/* ✅ Header */
.title {
    text-align: center;
    font-size: 26px;
    font-weight: bold;
    margin-bottom: 6mm;
    font-family: 'MB-Leeka-Shabir-Kumbhar-2.0';
}

.center {
    text-align: center;
    margin-bottom: 3mm;
}

/* ✅ Rows */
.row {
    display: flex;
    align-items: flex-end;
    margin: 6mm 0;
    font-size: 16px;
}

.number {
    width: 8mm;
}

.label {
    margin: 0 4mm;
    white-space: nowrap;
    font-size: 18px;
}

.line {
    flex: 1;
    border-bottom: 1px solid #000;
    text-align: center;
    min-height: 6mm;
    font-size: 20px;
}

/* ✅ Two Column */
.two-col-row {
    display: flex;
    gap: 10mm;
    margin: 6mm 0;
}

.col {
    flex: 1;
    display: flex;
    align-items: flex-end;
}

/* ✅ Signatures */
.signatures {
    margin-top: 20mm;
    display: flex;
    justify-content: space-between;
    font-size: 16px;
}

.sign {
    width: 45%;
    text-align: center;
}

.sign-line {
    border-top: 1px solid #000;
    margin-bottom: 3mm;
}
</style>

</head>

<body>

<div class="paper">

    <div class="title">داخلہ فارم</div>

    <div class="center"><strong>${school?.school_name || '—'}</strong></div>
    <div class="center">سيمس ڪوڊ: <strong>${school?.semis_code || '—'}</strong></div>

    <div class="row">
        <div class="number">1.</div>
        <div class="label">جنرل رجسٽر نمبر</div>
        <div class="line">${student.gr_number || ''}</div>
    </div>

    <div class="row">
        <div class="number">2.</div>
        <div class="label">داخلہ جي تاريخ</div>
        <div class="line">${formatDate(student.admission_date)}</div>
    </div>

    <div class="row">
        <div class="number">3.</div>
        <div class="label">شاگرد جو نالو</div>
        <div class="line">${student.name || ''}</div>
    </div>

    <div class="row">
        <div class="number">4.</div>
        <div class="label">والد جو نالو</div>
        <div class="line">${student.father_name || ''}</div>
    </div>

    <div class="two-col-row">
        <div class="col">
            <div class="number">5.</div>
            <div class="label">قوم</div>
            <div class="line">${student.qom || ''}</div>
        </div>
        <div class="col">
            <div class="number">6.</div>
            <div class="label">ذات</div>
            <div class="line">${student.caste || ''}</div>
        </div>
    </div>

    <div class="two-col-row">
        <div class="col">
            <div class="number">7.</div>
            <div class="label">سرپرست جو نالو</div>
            <div class="line">${student.guardian_name || ''}</div>
        </div>
        <div class="col">
            <div class="number">8.</div>
            <div class="label">بمعہ مائيٽي</div>
            <div class="line">${student.relation_with_guardian || ''}</div>
        </div>
    </div>

    <div class="row">
        <div class="number">9.</div>
        <div class="label">سرپرست جو ڌنڌو</div>
        <div class="line">${student.guardian_occupation || ''}</div>
    </div>

    <div class="row">
        <div class="number">10.</div>
        <div class="label">پيدائش جي جاءِ</div>
        <div class="line">${student.place_of_birth || ''}</div>
    </div>

    <div class="row">
        <div class="number">11.</div>
        <div class="label">پيدائش جي تاريخ</div>
        <div class="line">${formatDate(student.date_of_birth)}</div>
    </div>

    <div class="row">
        <div class="number">12.</div>
        <div class="label">پيدائش جي تاريخ لفظن ۾</div>
        <div class="line">${student.date_of_birth_in_letter || ''}</div>
    </div>

    <div class="row">
        <div class="number">13.</div>
        <div class="label">ڪھڙي اسڪول مان آيو</div>
        <div class="line">${student.previous_school || ''}</div>
    </div>

    <div class="row">
        <div class="number">14.</div>
        <div class="label">ڪهڙي ڪلاس ۾ داخل ٿيو</div>
        <div class="line">${className}</div>
    </div>

    <div class="row">
        <div class="number">15.</div>
        <div class="label">سرپرست جي صحيح</div>
        <div class="line"></div>
    </div>

    <div class="row">
        <div class="number">16.</div>
        <div class="label">داخلہ وقت عمر</div>
        <div class="line">${age ? age.y : ''} سال</div>
        <div class="line">${age ? age.m : ''} مھينا</div>
        <div class="line">${age ? age.d : ''} ڏينھن</div>
    </div>

    <div class="signatures">
        <div class="sign">
            <div class="sign-line"></div>
            صحيح ڪلاس ماسٽر / ماسترياڻي
        </div>

        <div class="sign">
            <div class="sign-line"></div>
            صحيح هيڊ ماسٽر / هيڊ مسٽريس
        </div>
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
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true, // ⭐ KEY FIX
      margin: {
        top: '10mm',
        bottom: '10mm',
        left: '10mm',
        right: '10mm'
      }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=admission-form.pdf');
    res.end(pdfBuffer);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'PDF generation failed' });
  } finally {
    if (browser) await browser.close();
  }
});

module.exports = router;