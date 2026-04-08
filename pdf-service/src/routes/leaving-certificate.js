const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { getSindhiFontCSS, mbLeekaShabir, getSindhiShabirBold } = require('../utils/fontLoader');

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

const frame2ImageBase64 = loadImageAsBase64('public/images/slc.png');
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
    const grOfPreviousSchool = valueOrEmpty(data.gr_of_previous_school || data.gr_of_previos_school);
    const educationalAbility = valueOrEmpty(data.educational_ability || data.educational_qualification);
    const character = valueOrEmpty(data.character || data.conduct);
    const classOnLeaving = valueOrEmpty(data.class_on_leaving == "ڪلاس پنجون" ? "پنجون درجو پاس ڪيائين" : data.class_on_leaving, "پڙھندڙ" );
    const leavingReason = valueOrEmpty(data.reason_for_leaving || data.leaving_reason);
    const remarks = valueOrEmpty(data.remarks);
    const semisCode = valueOrEmpty(school?.semis_code);
    const taluka = valueOrEmpty(school?.taluka || '');
    const district = valueOrEmpty(school?.district || '');
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
    direction: rtl;
    padding: 0;
    margin: 0;
    line-height: 1.6;
    font-size: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.post_body {
    background-image: url('${frame2ImageBase64}');
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    padding: 0, 10mm, 0, 10mm;
    width: 200mm;
    height: 265mm;
    display: flex;
    justify-content: center;
    align-items: center;
}

.paper {
    padding-top: 120px;
    width: 150mm;
    page-break-inside: avoid;
    page-break-after: avoid;
}

.title {
    text-align: center;
    font-size: 30px;
    font-weight: bold;
    margin-bottom: 15px;
}

.logo {
    width: 80px;
    height: auto;
    position: absolute;
    top: 16%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
}

.svg-title {
    position: absolute;
    top: 22%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.semis-code {
    position: absolute;
    top: 22%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 16px;
    letter-spacing: 2px;
    color: #222;
}
.center {
    font-size: 24px;
    display: flex;
    justify-content: center;
    margin: 30px 0;
}

.row {
    display: flex;
    justify-content: flex-start;
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
    margin-top: 60px;
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

.note {
    font-size: 12px;
    margin-top: 20px;
    margin-right: 40px;
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
    <div class="post_body">
    <div class="paper">

        <img src="${logoBase64}" alt="Logo" class="logo">
        <div class="title" style="font-family: Arial, sans-serif;">

            <svg viewBox="65 -100 450 500" class="svg-title">
                <path id="curve" d="M 0,250 A 200,170 0 0,1 580,250" fill="transparent" />
                <text width="500">
                    <textPath xlink:href="#curve" startOffset="50%">
                        ${school?.school_name || ''} تعلقو ${taluka} ضلعو ${district}
                    </textPath>
            </svg>
            <div class="semis-code">
                <span>سيمس ڪوڊ: </span>
                <strong class="digit">${semisCode}</strong>
            </div>
            <div class="center" style="font-family: 'MB-Leeka-Shabir-Kumbhar-2.0';"><b>اسڪول ڇڏڻ جو سرٽيفڪيٽ</b></div>
        </div>
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

        <div class="row">
            <div class="field">
                <div class="number">11.</div>
                <div class="label">اسڪول ڇڏڻ جو سرٽيفڪيٽ آڻڻ جي صورت ۾ جنرل رجسٽر نمبر</div>
            </div>
            <div class="line"><span class="numeric-value">${grOfPreviousSchool}</span></div>
        </div>

        <div class="pair-row">
            <div class="field-row">
                <div class="field">
                    <div class="number">12.</div>
                    <div class="label">تعليمي لياقت</div>
                </div>
                <div class="line">${educationalAbility}</div>
            </div>
            <div class="field-row">
                <div class="field">
                    <div class="number">13.</div>
                    <div class="label">چال چلت</div>
                </div>
                <div class="line">${character}</div>
            </div>
        </div>

        <div class="row">
            <div class="field">
                <div class="number">14.</div>
                <div class="label">ڪھڙي ڪلاس ۾ پڙھندو ھو / ھئي</div>
            </div>
            <div class="line">${classOnLeaving}</div>
        </div>
        <div class="row">
            <div class="field">
                <div class="number">15.</div>
                <div class="label">اسڪول ڇڏڻ جي تاريخ</div>
            </div>
            <div class="line"><span class="date-value">${formatDate(data.leaving_date)}</span></div>
        </div>
        <div class="row">
            <div class="field">
                <div class="number">16.</div>
                <div class="label">اسڪول ڇڏڻ جو سبب</div>
            </div>
            <div class="line">${leavingReason}</div>
        </div>
        <div class="row">
            <div class="field">
                <div class="number">17.</div>
                <div class="label">ريمارڪس</div>
            </div>
            <div class="line">${remarks}</div>
        </div>
        <div class="note">
            * سرٽيفڪيٽ ٿو ڏجي تہ مٿيون تفصيل جنرل رجسٽر مطابق درست آھي.
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
    console.error('=== Leaving Certificate PDF Generation Error ===');
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