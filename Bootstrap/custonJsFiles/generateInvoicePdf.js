const PDFDocument = require("pdfkit");

function generateInvoicePdf(order) {
  const doc = new PDFDocument();
  let buffers = [];

  doc.on("data", (buffer) => buffers.push(buffer));
  doc.on("end", () => {
    const pdfBuffer = Buffer.concat(buffers);
    // You can save the pdfBuffer to a file or return it as needed
  });

  // Build the invoice content using PDFKit
  doc.fontSize(18).text(`Invoice for Order #${order._id}`, { align: "center" });
  // ... rest of your code to build the PDF content

  doc.end();
}

module.exports = generateInvoicePdf;
