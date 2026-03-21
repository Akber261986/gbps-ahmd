const express = require('express');
const puppeteer = require('puppeteer');
const { getSindhiFontCSS, mbLeekaShabir } = require('../utils/fontLoader');

const router = express.Router();

router.post('/', async (req, res) => {
  let browser;

  try {
    const { data, school } = req.body;

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '';
    const valueOrEmpty = (value) => (value === null || value === undefined ? '' : value);

    // Support alternate payload keys so template always receives the correct value
    const grNumber = valueOrEmpty(data.gr_number || data.grNumber);
    const studentName = valueOrEmpty(data.student_name || data.name);
    const fatherName = valueOrEmpty(data.father_name);
    const qom = valueOrEmpty(data.qom || data.religion);
    const caste = valueOrEmpty(data.caste);
    const placeOfBirth = valueOrEmpty(data.place_of_birth);
    const dobInWords = valueOrEmpty(data.date_of_birth_in_letter || data.date_of_birth_words);
    const previousSchool = valueOrEmpty(data.previos_school || data.previous_school);
    const educationalAbility = valueOrEmpty(data.educational_ability || data.educational_qualification);
    const character = valueOrEmpty(data.character || data.conduct);
    const classOnLeaving = valueOrEmpty(data.class_on_leaving);
    const leavingReason = valueOrEmpty(data.reason_for_leaving || data.leaving_reason);
    const remarks = valueOrEmpty(data.remarks);
    const semisCode = valueOrEmpty(school?.semis_code);

    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">

<style>
${getSindhiFontCSS()}
${mbLeekaShabir('MB-Leeka-Shabir-Kumbhar-2.0', 'MB-Leeka-Shabir-Kumbhar-2.0.ttf')}

@page { size: A4; margin: 10mm; }

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

.header-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
}

.form-number {
    text-align: right;
    font-size: 16px;
    margin-bottom: 8px;
}

.title {
    font-family: 'MB-Leeka-Shabir-Kumbhar-2.0';
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 16px;
    line-height: 1.4;
}
.center {
    display: flex; 
    justify-content: center;
}

.school-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 16px;
    font-size: 16px;
    line-height: 1.5;
}

.school-info div {
    margin-bottom: 8px;
}


.row {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin: 8px 8px;
    font-size: 18px;
    min-height: 30px;
    line-height: 1.5;
    position: relative;
    gap: 8px;
}

.number {
    display: inline-block;
    width: 28px;
    vertical-align: bottom;
    font-family: 'Times New Roman', Times, serif;
}

.label {
    display: inline-block;
    white-space: nowrap;
    line-height: 1.5;
    vertical-align: bottom;
}

.line {
    display: inline-block;
    width: auto;
    flex: 1;
    border-bottom: 1px solid #000;
    margin: 0 0 2px 0;
    text-align: center;
    font-size: 20px;
    line-height: 1.8;
    vertical-align: bottom;
}

.numeric-value,
.date-value {
    font-family: 'Times New Roman', Times, serif;
}

.pair-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin: 8px 8px;
}

.field-row {
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 30px;
    flex: 1;
}

.field-row .line {
    width: auto;
    flex: 1;
    margin: 0 0 2px 0;
}

.field {
    display: inline-flex;
    align-items: baseline;
    gap: 4px;
    white-space: nowrap;
}

.declaration {
    margin-top: 20px;
    margin-right: 8px;
    font-size: 11px;
}

.signatures {
    margin-top: 80px;
    display: flex;
    justify-content: space-evenly;
}

.sign {
    text-align: center;
    width: 40%;
    font-size: 18px;
}

.sign-line {
    border-top: 1px solid #000;
    margin-bottom: 5px;
}
</style>
</head>


<body>

    <div class="paper">

        <div class="title">اسڪول ڇڏڻ جو سرٽيفڪيٽ</div>

        <div class="center"><b>${school?.school_name || ''}</b></div>
        <div class="center" style="font-family:'Times New Roman', Times">سيمس ڪوڊ: ${semisCode}</div>

        <div class="row">
            <div class="field">
                <div class="number">1.</div>
                <div class="label">جنرل رجسٽر نمبر</div>
            </div>
            <div class="line"><span class="numeric-value">${grNumber}</span></div>
        </div>
        <div class="pair-row">
            <div class="field-row">
                <div class="field">
                    <div class="number">2.</div>
                    <div class="label">شاگرد جو نالو</div>
                </div>
                <div class="line">${studentName}</div>
            </div>
            <div class="field-row">
                <div class="field">
                    <div class="number">3.</div>
                    <div class="label">پيءُ جو نالو</div>
                </div>
                <div class="line">${fatherName}</div>
            </div>
        </div>

        <div class="pair-row">
            <div class="field-row">
                <div class="field">
                    <div class="number">4.</div>
                    <div class="label">قوم</div>
                </div>
                <div class="line">${qom}</div>
            </div>
            <div class="field-row">
                <div class="field">
                    <div class="number">5.</div>
                    <div class="label">ذات</div>
                </div>
                <div class="line">${caste}</div>
            </div>
        </div>

        <div class="row">
            <div class="field">
                <div class="number">6.</div>
                <div class="label">پيدائش جاءِ</div>
            </div>
            <div class="line">${placeOfBirth}</div>
        </div>
        <div class="row">
            <div class="field">
                <div class="number">7.</div>
                <div class="label">پيدائش تاريخ</div>
            </div>
            <div class="line"><span class="date-value">${formatDate(data.date_of_birth)}</span></div>
        </div>
        <div class="row">
            <div class="field">
                <div class="number">8.</div>
                <div class="label">پيدائش لفظن ۾</div>
            </div>
            <div class="line">${dobInWords}</div>
        </div>
        <div class="row">
            <div class="field">
                <div class="number">9.</div>
                <div class="label">داخلا تاريخ</div>
            </div>
            <div class="line"><span class="date-value">${formatDate(data.admission_date)}</span></div>
        </div>
        <div class="row">
            <div class="field">
                <div class="number">10.</div>
                <div class="label">پھرين ڪھڙي اسڪول ۾ پڙھندو ھو / ھئي</div>
            </div>
            <div class="line">${previousSchool}</div>
        </div>

        <div class="pair-row">
            <div class="field-row">
                <div class="field">
                    <div class="number">11.</div>
                    <div class="label">تعليمي لياقت</div>
                </div>
                <div class="line">${educationalAbility}</div>
            </div>
            <div class="field-row">
                <div class="field">
                    <div class="number">12.</div>
                    <div class="label">چال چلت</div>
                </div>
                <div class="line">${character}</div>
            </div>
        </div>

        <div class="row">
            <div class="field">
                <div class="number">13.</div>
                <div class="label">ڪھڙي ڪلاس ۾ پڙھندو ھو / ھئي</div>
            </div>
            <div class="line">${classOnLeaving}</div>
        </div>
        <div class="row">
            <div class="field">
                <div class="number">14.</div>
                <div class="label">اسڪول ڇڏڻ جي تاريخ</div>
            </div>
            <div class="line"><span class="date-value">${formatDate(data.leaving_date)}</span></div>
        </div>
        <div class="row">
            <div class="field">
                <div class="number">15.</div>
                <div class="label">اسڪول ڇڏڻ جو سبب</div>
            </div>
            <div class="line">${leavingReason}</div>
        </div>
        <div class="row">
            <div class="field">
                <div class="number">16.</div>
                <div class="label">ريمارڪس</div>
            </div>
            <div class="line">${remarks}</div>
        </div>

        <div class="signatures">
            <div class="sign">
                <div class="sign-line"></div>
                صحيح ڪلاس ٽيچر
            </div>
            <div class="sign">
                <div class="sign-line"></div>
                صحيح هيڊ ماسٽر
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

  } finally {
    if (browser) await browser.close();
  }
});

module.exports = router;