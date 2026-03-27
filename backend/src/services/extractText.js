const fs      = require('fs');
const path    = require('path');
const mammoth = require('mammoth');

const extractTextFromPDF = (buffer) => {
  return new Promise((resolve, reject) => {
    const PDFParser = require('pdf2json');
    const parser    = new PDFParser(null, 1);

    parser.on('pdfParser_dataReady', (data) => {
      try {
        const text = data.Pages
          .map(page =>
            page.Texts
              .map(t => decodeURIComponent(t.R.map(r => r.T).join('')))
              .join(' ')
          )
          .join('\n');
        resolve(text);
      } catch (e) {
        reject(e);
      }
    });

    parser.on('pdfParser_dataError', (err) => {
      reject(new Error(err.parserError));
    });

    parser.parseBuffer(buffer);
  });
};

const extractText = async (filename, fileType) => {
  const filePath = path.join(__dirname, '../../uploads', filename);
  const buffer   = fs.readFileSync(filePath);

  if (fileType === 'pdf') {
    return await extractTextFromPDF(buffer);
  }

  if (fileType === 'txt') {
    return buffer.toString('utf-8');
  }

  if (fileType === 'docx') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error(`Unsupported file type: ${fileType}`);
};

module.exports = extractText;
