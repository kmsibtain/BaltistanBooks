import jsPDF from 'jspdf';
import { Sale, formatCurrency, formatDate, mockCreditors } from './mockData';

interface ReceiptOptions {
  sale: Sale;
  invoiceNumber?: string;
}

export const generateReceipt = ({ sale, invoiceNumber }: ReceiptOptions) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 200], // Receipt paper size
  });

  const pageWidth = 80;
  const margin = 5;
  const contentWidth = pageWidth - (margin * 2);
  let y = 10;

  // Helper functions
  const centerText = (text: string, yPos: number, fontSize = 10) => {
    doc.setFontSize(fontSize);
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, yPos);
  };

  const leftText = (text: string, yPos: number) => {
    doc.text(text, margin, yPos);
  };

  const rightText = (text: string, yPos: number) => {
    const textWidth = doc.getTextWidth(text);
    doc.text(text, pageWidth - margin - textWidth, yPos);
  };

  const drawLine = (yPos: number) => {
    doc.setDrawColor(200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
  };

  // Header - Store Name
  doc.setFont('helvetica', 'bold');
  centerText('BALTISTAN BOOK DEPOT', y, 12);
  y += 5;

  doc.setFont('helvetica', 'normal');
  centerText('Quality Books & Stationery', y, 8);
  y += 4;
  centerText('Skardu, Gilgit-Baltistan', y, 8);
  y += 4;
  centerText('Phone: +92 XXX XXXXXXX', y, 8);
  y += 6;

  drawLine(y);
  y += 4;

  // Invoice details
  doc.setFontSize(9);
  const invNum = invoiceNumber || `INV-${Date.now().toString().slice(-8)}`;
  leftText(`Invoice: ${invNum}`, y);
  y += 4;
  leftText(`Date: ${formatDate(sale.date)}`, y);
  y += 4;
  leftText(`Time: ${new Date().toLocaleTimeString('en-PK')}`, y);
  y += 4;

  // Payment type and creditor info
  leftText(`Payment: ${sale.paymentType === 'cash' ? 'CASH' : 'CREDIT'}`, y);
  y += 4;

  if (sale.paymentType === 'credit' && sale.creditorId) {
    const creditor = mockCreditors.find(c => c.id === sale.creditorId);
    if (creditor) {
      leftText(`Customer: ${creditor.name}`, y);
      y += 4;
    }
  }

  y += 2;
  drawLine(y);
  y += 4;

  // Items header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  leftText('ITEM', y);
  rightText('AMOUNT', y);
  y += 4;
  drawLine(y);
  y += 4;

  // Items
  doc.setFont('helvetica', 'normal');
  sale.items.forEach(item => {
    // Product name (may wrap)
    const nameLines = doc.splitTextToSize(item.productName, contentWidth - 20);
    nameLines.forEach((line: string) => {
      leftText(line, y);
      y += 4;
    });
    
    // Quantity x Price = Total
    leftText(`  ${item.quantity} x ${formatCurrency(item.unitPrice)}`, y);
    rightText(formatCurrency(item.total), y);
    y += 5;
  });

  y += 2;
  drawLine(y);
  y += 4;

  // Totals
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  leftText('TOTAL:', y);
  rightText(formatCurrency(sale.total), y);
  y += 6;

  drawLine(y);
  y += 6;

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  centerText('Thank you for your purchase!', y, 8);
  y += 4;
  centerText('Visit us again', y, 8);
  y += 6;

  // Barcode placeholder (simple text)
  doc.setFontSize(6);
  centerText(`||||| ${invNum} |||||`, y, 6);

  // Save the PDF
  doc.save(`Receipt_${invNum}.pdf`);
  
  return invNum;
};

// Generate a more detailed invoice PDF
export const generateInvoice = ({ sale, invoiceNumber }: ReceiptOptions) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const margin = 20;
  let y = 20;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('BALTISTAN BOOK DEPOT', margin, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Quality Books & Stationery Since 1985', margin, y);
  y += 5;
  doc.text('Main Bazaar, Skardu, Gilgit-Baltistan, Pakistan', margin, y);
  y += 5;
  doc.text('Phone: +92 XXX XXXXXXX | Email: info@baltistanbookdepot.pk', margin, y);
  y += 10;

  // Invoice title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('INVOICE', pageWidth - margin - 40, 30);

  // Invoice details box
  y = 50;
  doc.setFillColor(245, 245, 245);
  doc.rect(pageWidth - margin - 70, y, 70, 30, 'F');
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const invNum = invoiceNumber || `INV-${Date.now().toString().slice(-8)}`;
  doc.text(`Invoice #: ${invNum}`, pageWidth - margin - 65, y + 8);
  doc.text(`Date: ${formatDate(sale.date)}`, pageWidth - margin - 65, y + 16);
  doc.text(`Payment: ${sale.paymentType.toUpperCase()}`, pageWidth - margin - 65, y + 24);

  // Customer info (if credit sale)
  if (sale.paymentType === 'credit' && sale.creditorId) {
    const creditor = mockCreditors.find(c => c.id === sale.creditorId);
    if (creditor) {
      y = 55;
      doc.setFont('helvetica', 'bold');
      doc.text('Bill To:', margin, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.text(creditor.name, margin, y);
      y += 5;
      doc.text(creditor.phone, margin, y);
    }
  }

  // Items table
  y = 95;
  
  // Table header
  doc.setFillColor(55, 65, 81);
  doc.rect(margin, y, pageWidth - (margin * 2), 10, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Item', margin + 5, y + 7);
  doc.text('Qty', margin + 100, y + 7);
  doc.text('Unit Price', margin + 120, y + 7);
  doc.text('Total', margin + 150, y + 7);
  
  y += 10;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');

  // Table rows
  sale.items.forEach((item, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, y, pageWidth - (margin * 2), 10, 'F');
    }
    
    const nameLines = doc.splitTextToSize(item.productName, 90);
    doc.text(nameLines[0], margin + 5, y + 7);
    doc.text(String(item.quantity), margin + 100, y + 7);
    doc.text(formatCurrency(item.unitPrice), margin + 120, y + 7);
    doc.text(formatCurrency(item.total), margin + 150, y + 7);
    
    y += 10;
  });

  // Total section
  y += 5;
  doc.setDrawColor(200);
  doc.line(margin + 100, y, pageWidth - margin, y);
  y += 8;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', margin + 120, y);
  doc.text(formatCurrency(sale.total), margin + 150, y);

  // Footer
  y = 260;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text('Thank you for your business!', pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.text('Terms: Payment due within 30 days for credit purchases.', pageWidth / 2, y, { align: 'center' });

  // Save
  doc.save(`Invoice_${invNum}.pdf`);
  
  return invNum;
};
