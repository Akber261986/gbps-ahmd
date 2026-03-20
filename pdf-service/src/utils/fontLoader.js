const fs = require('fs');
const path = require('path');

/**
 * Load font file and convert to base64 for embedding in PDFs
 * @param {string} fontFileName - Name of the font file in the fonts directory
 * @returns {string} Base64 encoded font data
 */
function loadFontAsBase64(fontFileName) {
  const fontPath = path.join(__dirname, '..', 'fonts', fontFileName);
  const fontBuffer = fs.readFileSync(fontPath);
  return fontBuffer.toString('base64');
}

/**
 * Generate @font-face CSS for embedding fonts in PDFs
 * @param {string} fontFamily - Font family name
 * @param {string} fontFileName - Font file name
 * @returns {string} CSS @font-face declaration
 */
function getFontFaceCSS(fontFamily, fontFileName) {
  const base64Font = loadFontAsBase64(fontFileName);
  const fontFormat = fontFileName.endsWith('.ttf') ? 'truetype' :
                     fontFileName.endsWith('.woff') ? 'woff' :
                     fontFileName.endsWith('.woff2') ? 'woff2' : 'truetype';

  return `
    @font-face {
      font-family: '${fontFamily}';
      src: url(data:font/${fontFormat};base64,${base64Font}) format('${fontFormat}');
      font-weight: normal;
      font-style: normal;
    }
  `;
}

/**
 * Get the default Sindhi font CSS
 * @returns {string} CSS @font-face declaration for MB Sindhi Web SK 2.0
 */
function getSindhiFontCSS() {
  return getFontFaceCSS('MB Sindhi Web SK 2.0', 'MB-Sindhi-Web-SK-2.0.ttf');
}

module.exports = {
  loadFontAsBase64,
  getFontFaceCSS,
  getSindhiFontCSS
};
