const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { getSindhiFontCSS, mbLeekaShabir, getSindhiShabirBold } = require('../utils/fontLoader');
const studentAgeModule = require('../utils/student_age');
const student_age =
  typeof studentAgeModule === 'function'
    ? studentAgeModule
    : studentAgeModule.default;

const router = express.Router();

// Load and convert image to Base64 once at module initialization
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

const admissionFrameImageBase64 = loadImageAsBase64('public/images/admission_form_frame.png');
const defaultLogoBase64 = loadImageAsBase64('public/images/logo_sindh_gov.png');

// Function to fetch image from URL and convert to base64
const fetchImageAsBase64 = (imageUrl) => {
  return new Promise((resolve, reject) => {
    const protocol = imageUrl.startsWith('https') ? https : http;

    const request = protocol.get(imageUrl, { timeout: 5000 }, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        return fetchImageAsBase64(response.headers.location)
          .then(resolve)
          .catch(reject);
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to fetch image: ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        try {
          const buffer = Buffer.concat(chunks);
          const base64Image = buffer.toString('base64');
          const contentType = response.headers['content-type'] || 'image/png';
          resolve(`data:${contentType};base64,${base64Image}`);
        } catch (error) {
          reject(error);
        }
      });
    });

    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
};

// Function to get logo - school logo if available, otherwise default logo
const getLogoBase64 = async (schoolLogo) => {
  if (schoolLogo && schoolLogo.trim() !== '') {
    // Check if it's a URL (Cloudinary or other)
    if (schoolLogo.startsWith('http://') || schoolLogo.startsWith('https://')) {
      try {
        const fetchedLogo = await fetchImageAsBase64(schoolLogo);
        return fetchedLogo;
      } catch (error) {
        console.error('Failed to fetch school logo:', error.message);
      }
    } else if (schoolLogo.startsWith('data:image')) {
      // Already base64
      return schoolLogo;
    }
  }
  return defaultLogoBase64;
};

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

    const valueOrEmpty = (value) => (value === null || value === undefined ? '' : value);
    const taluka = valueOrEmpty(school?.taluka || '');
    const logoBase64 = await getLogoBase64(school?.logo_url);

    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<style>
${getSindhiFontCSS()}
${mbLeekaShabir('MB-Leeka-Shabir-Kumbhar-2.0', 'MB-Leeka-Shabir-Kumbhar-2.0.ttf')}
${getSindhiShabirBold('MB-Supreen-Shabir-Kumbhar-Bold-2.0', 'MB-Supreen-Shabir-Kumbhar-Bold-2.0.ttf')}

@page { size: A4; margin: 10mm; }

body {
    font-family: 'MB-Supreen-Shabir-Kumbhar-Bold-2.0';
    margin: 0;
    padding: 0;
    line-height: 1.6;
    font-size: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.post-body {
    background-image: url('${admissionFrameImageBase64}');
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    width: 220mm;
    height: 270mm;
    display: flex;
    justify-content: center;
    align-items: center;
}

.paper {
    padding-top: 170px;
    width: 150mm;
    page-break-inside: avoid;
    page-break-after: avoid;
    position: absolute;
}

.title {
    text-align: center;
    font-size: 32px;
    font-weight: bold;
    margin-bottom: 15px;
}

.logo {
    width: 80px;
    height: auto;
    position: absolute;
    top: 10%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;

}

.svg-title {
    position: absolute;
    top: 15%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.semis-code {
    position: absolute;
    top: 18%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 16px;
    letter-spacing: 2px;
    color: #222;
}

.title2 {
    margin-bottom: 8px;
    font-family: 'MB-Leeka-Shabir-Kumbhar-2.0';
    text-align: center;
    font-size: 24px;
}

.row {
    display: flex;
    align-items: center;
    margin: 8px 8px;
    font-size: 16px;
    min-height: 25px;
    line-height: 1.5;
    position: relative;
    gap: 8px;
}

.number {
    display: inline-block;
    width: 28px;
    vertical-align: bottom;
}

.label {
    display: inline-block;
    white-space: nowrap;
    line-height: 1.5;
    vertical-align: bottom;
    font-size: 14px;
    font-weight: normal;
}

.line {
    display: inline-block;
    width: auto;
    flex: 1;
    border-bottom: 1px solid #000;
    margin: 0 0 2px 0;
    text-align: center;
    font-size: 16px;
    line-height: 1.0;
    vertical-align: bottom;
}

.digit {
    font-family: 'Times New Roman', Times, serif;
}

.two-col-row {
    display: flex;
    gap: 12px;
    margin: 8px 8px;
    min-height: 25px;
}

.col {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 16px;
}

.col .line {
    width: auto;
    flex: 1;
    margin: 0 0 2px 0;
}

.signatures {
    margin-top: 70px;
    display: flex;
    justify-content: space-evenly;
}

.sign {
    text-align: center;
    width: 30%;
    font-size: 14px;
}

.sign-line {
    border-top: 1px solid #000;
    margin-bottom: 5px;
}

svg {
    width: 650px;
    height: 400px;
    margin-top: auto;
    display: block;
}

text {
    fill: #000;
    text-anchor: middle;
}
</style>
</head>

<body>
<div class="post-body">

<div class="t"></div>

<div class="paper">

<img src="${logoBase64}" alt="Logo" class="logo">
<div class="title">

<svg viewBox="65 -100 450 500" class="svg-title">
<path id="curve" d="M 0,250 A 200,170 0 0,1 580,250" fill="transparent" />
<text width="500">
<textPath xlink:href="#curve" startOffset="50%">
${school?.school_name || ""} تعلقو  ${school?.taluka} ضلعو ${school?.district}
</textPath>
</text>
</svg>
<div class="semis-code">
<span>سيمس ڪوڊ: </span>
<strong class="digit">${school?.semis_code || ""}</strong>
</div>
<div class="title2">
<strong>شاگرد جو داخلا فارم</strong>
</div>
</div>

<div class="row">
<span class="number">1.</span>
<span class="label">جنرل رجسٽر نمبر</span>
<span class="line"><span class="digit">${student.gr_number || ""}</span></span>
</div>

<div class="row">
<span class="number">2.</span>
<span class="label">داخلہ جي تاريخ</span>
<span class="line"><span class="digit">${formatDate(student.admission_date)}</span></span>
</div>

<div class="row">
<span class="number">3.</span>
<span class="label">شاگرد جو نالو</span>
<span class="line">${student.name || ""}</span>
</div>

<div class="row">
<span class="number">4.</span>
<span class="label">والد جو نالو</span>
<span class="line">${student.father_name || ""}</span>
</div>

<div class="two-col-row">
<div class="col">
<span class="number">5.</span>
<span class="label">قوم</span>
<span class="line">${student.qom || ""}</span>
</div>
<div class="col">
<span class="number">6.</span>
<span class="label">ذات</span>
<span class="line">${student.caste || ""}</span>
</div>
</div>

<div class="two-col-row">
<div class="col">
<span class="number">7.</span>
<span class="label"> سرپرست جو نالو</span>
<span class="line">${student.guardian_name || ""}</span>
</div>
<div class="col">
<span class="number">8.</span>
<span class="label"> بمعہ مائيٽي</span>
<span class="line">${student.relation_with_guardian || ""}</span>
</div>
</div>

<div class="row">
<span class="number">9.</span>
<span class="label">سرپرست جو ڌنڌو</span>
<span class="line">${student.guardian_occupation || ""}</span>
</div>

<div class="two-col-row">
<div class="col">
<span class="number">10.</span>
<span class="label">پيدائش جي جاءِ</span>
<span class="line">${student.place_of_birth || ""}</span>
</div>
<div class="col">
<span class="number">11.</span>
<span class="label">تعلقو</span>
<span class="line">${taluka}</span>
</div>
</div>

<div class="row">
<span class="number">13.</span>
<span class="label">پيدائش جي تاريخ</span>
<span class="line"><span class="digit">${formatDate(student.date_of_birth)}</span></span>
</div>

<div class="row">
<span class="number">14.</span>
<span class="label">پيدائش جي تاريخ لفظن ۾</span>
<span class="line">${student.date_of_birth_in_letter || ""}</span>
</div>

<div class="row">
<span class="number">15.</span>
<span class="label">ڪھڙي اسڪول مان آيو</span>
<span class="line">${student.previous_school || ""}</span>
</div>

<div class="row">
<span class="number">16.</span>
<span class="label"> ڪهڙي ڪلاس ۾ داخل ٿيو / ٿي</span>
<span class="line">${className}</span>
</div>

<div class="row" style="margin-top: 14px;">
<span class="number">17.</span>
<span class="label">سرپرست جي صحيح</span>
<span class="line"></span>
</div>

<div class="row">
<span class="number">18.</span>
<span class="label">داخلہ وقت عمر</span>
<span class="line"><span class="digit">${age ? age.y : ""}</span> سال</span>
<span class="line"><span class="digit">${age ? age.m : ""}</span> مھينا</span>
<span class="line"><span class="digit">${age ? age.d : ""}</span> ڏينھن</span>
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