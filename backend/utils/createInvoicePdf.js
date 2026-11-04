const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;

const pdfText = (value) => String(value ?? '')
  .replace(/[^\x20-\x7E]/g, '?')
  .replace(/[\\()]/g, (character) => `\\${character}`)
  .replace(/[\r\n\t]/g, ' ');

const wrapText = (value, maxLength = 78) => {
  const words = String(value ?? '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    if (line && `${line} ${word}`.length > maxLength) {
      lines.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines;
};

function createInvoicePdf({ sellerName, sellerGstin, issueDate, ownerName, email, businessName, businessDetails = {}, paymentId, baseAmount, gstRate = 0, taxAmount = 0, totalAmount, message }) {
  const pages = [[]];
  let commands = pages[0];
  let page = 1;
  let y = 0;
  const color = (r, g, b) => `${r} ${g} ${b}`;
  const text = (value, x, top, size = 10, font = 'F1', rgb = color(0.12, 0.16, 0.14)) => {
    commands.push(`${rgb} rg BT /${font} ${size} Tf ${x} ${PAGE_HEIGHT - top} Td (${pdfText(value)}) Tj ET`);
  };
  const rect = (x, top, width, height, rgb, stroke = false) => {
    commands.push(`${rgb} ${stroke ? 'RG' : 'rg'} ${x} ${PAGE_HEIGHT - top - height} ${width} ${height} re ${stroke ? 'S' : 'f'}`);
  };
  const line = (x1, top1, x2, top2, rgb = color(0.88, 0.90, 0.88), thickness = 1) => {
    commands.push(`${rgb} RG ${thickness} w ${x1} ${PAGE_HEIGHT - top1} m ${x2} ${PAGE_HEIGHT - top2} l S`);
  };
  const newPage = () => {
    page += 1;
    commands = [];
    pages.push(commands);
    y = 68;
    text('KUMARIHUB  |  PAYMENT RECEIPT', 42, 42, 9, 'F2', color(0.20, 0.36, 0.29));
  };
  const ensureSpace = (height) => {
    if (y + height < PAGE_HEIGHT - 55) return;
    newPage();
  };
  const sectionTitle = (label) => {
    ensureSpace(32);
    text(label.toUpperCase(), 42, y + 11, 9, 'F2', color(0.37, 0.44, 0.39));
    line(42, y + 19, 553, y + 19);
    y += 32;
  };
  const detail = (label, value) => {
    if (!value) return;
    const rows = wrapText(`${label}: ${value}`, 78);
    ensureSpace(rows.length * 15 + 4);
    rows.forEach((row) => { text(row, 48, y + 10, 9.5); y += 15; });
    y += 3;
  };

  rect(0, 0, PAGE_WIDTH, 150, color(0.10, 0.18, 0.15));
  rect(42, 34, 34, 34, color(0.82, 0.67, 0.28));
  text('K', 53, 57, 19, 'F2', color(0.10, 0.18, 0.15));
  text(sellerName || 'KumariHub', 88, 49, 19, 'F2', color(1, 1, 1));
  text(sellerGstin ? `GSTIN: ${sellerGstin}` : 'Business listing payment', 88, 68, 9, 'F1', color(0.82, 0.86, 0.83));
  text(gstRate > 0 ? 'PAYMENT TAX INVOICE' : 'PAYMENT RECEIPT', 42, 111, 18, 'F2', color(1, 1, 1));
  text(`ISSUED ${issueDate || ''}`, 42, 130, 9, 'F1', color(0.82, 0.86, 0.83));
  y = 178;

  sectionTitle('Billed to');
  detail('Customer', ownerName || businessName);
  detail('Email', email);
  detail('Business', businessName);
  if (businessDetails.category || businessDetails.location) {
    detail('Category / location', [businessDetails.category, businessDetails.location].filter(Boolean).join('  |  '));
  }
  detail('Business address', businessDetails.address);
  detail('Phone', businessDetails.phone);
  detail('WhatsApp', businessDetails.whatsapp);
  detail('Services', Array.isArray(businessDetails.services) ? businessDetails.services.join(', ') : businessDetails.services);
  detail('Description', businessDetails.aboutBusness);
  if (businessDetails.delivery !== undefined) detail('Delivery', businessDetails.delivery ? 'Available' : 'Not selected');

  sectionTitle('Payment summary');
  rect(42, y, 511, 28, color(0.94, 0.96, 0.94));
  text('DESCRIPTION', 54, y + 18, 8, 'F2', color(0.37, 0.44, 0.39));
  text('AMOUNT', 456, y + 18, 8, 'F2', color(0.37, 0.44, 0.39));
  y += 28;
  const amountRow = (label, amount, bold = false) => {
    ensureSpace(33);
    text(label, 54, y + 21, bold ? 10 : 9.5, bold ? 'F2' : 'F1');
    text(`INR ${Number(amount).toFixed(2)}`, 456, y + 21, bold ? 10 : 9.5, bold ? 'F2' : 'F1');
    line(42, y + 31, 553, y + 31);
    y += 34;
  };
  amountRow('Business listing fee', baseAmount);
  if (Number(gstRate) > 0) {
    amountRow(`CGST (${(Number(gstRate) / 2).toFixed(2)}%)`, Number(taxAmount) / 2);
    amountRow(`SGST (${(Number(gstRate) / 2).toFixed(2)}%)`, Number(taxAmount) / 2);
  }
  ensureSpace(58);
  rect(42, y + 1, 511, 46, color(0.10, 0.18, 0.15));
  text('TOTAL PAID', 56, y + 29, 11, 'F2', color(1, 1, 1));
  text(`INR ${Number(totalAmount).toFixed(2)}`, 430, y + 29, 12, 'F2', color(1, 1, 1));
  y += 68;

  sectionTitle('Payment details');
  detail('Payment reference', paymentId);
  detail('Payment status', 'Successful');
  if (message) {
    sectionTitle('Message');
    wrapText(message).forEach((row) => { ensureSpace(17); text(row, 48, y + 10, 9.5); y += 15; });
    y += 4;
  }
  const fontObjectNumber = 3 + pages.length * 2;
  const pageObjectNumbers = pages.map((_, index) => 3 + index * 2);
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    `<< /Type /Pages /Kids [${pageObjectNumbers.map((number) => `${number} 0 R`).join(' ')}] /Count ${pages.length} >>`,
  ];
  pages.forEach((pageCommands, index) => {
    const pageNumber = pageObjectNumbers[index];
    const stream = pageCommands.join('\n');
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontObjectNumber} 0 R /F2 ${fontObjectNumber + 1} 0 R >> >> /Contents ${pageNumber + 1} 0 R >>`);
    objects.push(`<< /Length ${Buffer.byteLength(stream, 'ascii')} >>\nstream\n${stream}\nendstream`);
  });
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, 'ascii'));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf, 'ascii');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, 'ascii');
}

module.exports = createInvoicePdf;
