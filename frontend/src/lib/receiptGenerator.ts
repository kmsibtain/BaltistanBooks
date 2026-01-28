// src/lib/receiptGenerator.ts
import jsPDF from 'jspdf';

// Proper types — no any, no mock data!
export interface SaleItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SaleForReceipt {
  id: string;
  date: string;
  items: SaleItem[];
  total: number;
  paymentType: 'cash' | 'credit';
  creditorId?: string | null;
  creditorName?: string; // optional: pass name directly to avoid lookup
}

interface ReceiptOptions {
  sale: SaleForReceipt;
  invoiceNumber?: string;
}

// Helper: format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Helper: format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Thermal Receipt (80mm)
export const generateReceipt = ({ sale, invoiceNumber }: ReceiptOptions) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 200 + sale.items.length * 10], // dynamic height
  });

  const pageWidth = 80;
  const margin = 5;
  let y = 10;

  const center = (text: string, fontSize = 10) => {
    doc.setFontSize(fontSize);
    const w = doc.getTextWidth(text);
    doc.text(text, (pageWidth - w) / 2, y);
    y += fontSize < 12 ? 5 : 7;
  };

  const left = (text: string) => doc.text(text, margin, y += 5);
  const right = (text: string) => {
    const w = doc.getTextWidth(text);
    doc.text(text, pageWidth - margin - w, y);
  };
  const line = () => {
    doc.setDrawColor(200);
    doc.line(margin, y += 3, pageWidth - margin, y);
    y += 4;
  };

  // Header
  doc.setFont('helvetica', 'bold');
  center('BALTISTAN BOOK DEPOT', 14);
  doc.setFont('helvetica', 'normal');
  center('Quality Books & Stationery', 9);
  center('Skardu, Gilgit-Baltistan', 9);
  center('Phone: +92 3XX XXXXXXX', 9);
  line();

  // Invoice info
  const invNum = invoiceNumber || `INV-${Date.now().toString().slice(-8)}`;
  doc.setFontSize(9);
  left(`Invoice: ${invNum}`);
  left(`Date: ${formatDate(sale.date)}`);
  left(`Time: ${new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}`);
  left(`Payment: ${sale.paymentType.toUpperCase()}`);
  
  if (sale.paymentType === 'credit' && sale.creditorName) {
    left(`Customer: ${sale.creditorName}`);}
  else if (sale.paymentType === 'credit')                          left('Customer: Credit Sale');
  
  line();

  // Items header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  left('ITEM');
  right('AMOUNT');
  y -= 5;
  line();

  // Items
  doc.setFont('helvetica', 'normal');
  sale.items.forEach(item => {
    const lines = doc.splitTextToSize(item.productName, 50);
    lines.forEach((line: string, i: number) => {
      if (i === 0) left(line);
      else         left('  ' + line);
    });
    left(`  ${item.quantity} × ${formatCurrency(item.unitPrice)}`);
    right(formatCurrency(item.total));
    y += 2;
  });

  line();

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  left('TOTAL:');
  right(formatCurrency(sale.total));
  line();

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  center('Thank you for shopping!', 9);
  center('Visit again', 9);
  y += 5;
  center(`*** ${invNum} ***`, 7);

  doc.save(`Receipt_${invNum}.pdf`);
  return invNum;
};

// A4 Invoice
export const generateInvoice = ({ sale, invoiceNumber }: ReceiptOptions) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const margin = 20;
  let y = 20;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text('BALTISTAN BOOK DEPOT', margin, y);
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('Quality Books & Stationery', margin, y);
  y += 6;
  doc.text('Main Bazaar, Skardu, Gilgit-Baltistan', margin, y);
  y += 6;
  doc.text('Phone: +92 3XX XXXXXXX', margin, y);

  // Invoice title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - margin - 50, 35);

  // Invoice details box
  const invNum = invoiceNumber || `INV-${Date.now().toString().slice(-8)}`;
  doc.setFillColor(240, 240, 240);
  doc.rect(pageWidth - margin - 80, 45, 80, 35, 'F');
  doc.setFontSize(10);
  doc.text(`Invoice #: ${invNum}`, pageWidth - margin - 75, 55);
  doc.text(`Date: ${formatDate(sale.date)}`, pageWidth - margin - 75, 63);
  doc.text(`Payment: ${sale.paymentType.toUpperCase()}`, pageWidth - margin - 75, 71);

  // Bill To
  y = 90;
  if (sale.paymentType === 'credit' && sale.creditorName) {
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', margin, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(sale.creditorName, margin, y);
  }

  // Table
  y = 110;
  const headers = ['Description', 'Qty', 'Unit Price', 'Amount'];
  const colX = [margin, 100, 140, 170];

  doc.setFillColor(55, 65, 81);
  doc.rect(margin, y, pageWidth - margin * 2, 10, 'F');
  doc.setTextColor(255);
  doc.setFont('helvetica', 'bold');
  headers.forEach((h, i) => doc.text(h, colX[i], y + 7));

  y += 15;
  doc.setTextColor(0);
  doc.setFont('helvetica', 'normal');

  sale.items.forEach((item, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, y - 1, pageWidth - margin * 2, 10, 'F');
    }
    const lines = doc.splitTextToSize(item.productName, 90);
    doc.text(lines, colX[0], y + 5);
    doc.text(String(item.quantity), colX[1], y + 5);
    doc.text(formatCurrency(item.unitPrice), colX[2], y + 5);
    doc.text(formatCurrency(item.total), colX[3], y + 5);
    y += Math.max(10, lines.length * 6);
  });

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('TOTAL:', colX[2], y + 10);
  doc.text(formatCurrency(sale.total), colX[3], y + 10);

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Thank you for your business!', pageWidth / 2, 270, { align: 'center' });

  doc.save(`Invoice_${invNum}.pdf`);
  return invNum;
};