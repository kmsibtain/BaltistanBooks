import * as XLSX from 'xlsx';
import { Product, Creditor, Sale, Supplier, formatCurrency, formatDate } from './mockData';

// Export to CSV
export const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        const stringValue = String(value ?? '');
        return stringValue.includes(',') || stringValue.includes('"') 
          ? `"${stringValue.replace(/"/g, '""')}"` 
          : stringValue;
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
};

// Export to Excel
export const exportToExcel = (data: Record<string, unknown>[], filename: string, sheetName = 'Sheet1') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

// Helper to download file
const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Format inventory data for export
export const formatInventoryForExport = (products: Product[]) => {
  return products.map(p => ({
    'Product Name': p.name,
    'SKU': p.sku,
    'Category': p.category,
    'Quantity': p.quantity,
    'Price': p.price,
    'Stock Status': p.quantity <= 10 ? 'Low Stock' : p.quantity <= 20 ? 'Medium' : 'In Stock',
  }));
};

// Format creditors data for export
export const formatCreditorsForExport = (creditors: Creditor[]) => {
  return creditors.map(c => ({
    'Name': c.name,
    'Phone': c.phone,
    'CNIC': c.cnic ?? 'N/A',
    'Address': c.address ?? 'N/A',
    'Email': c.email ?? 'N/A',
    'Outstanding Balance': c.totalOutstanding,
    'Last Payment Date': c.lastPaymentDate ? formatDate(c.lastPaymentDate) : 'N/A',
    'Last Payment Amount': c.lastPaymentAmount ?? 0,
    'Total Transactions': c.transactions.length,
  }));
};

// Format sales data for export
export const formatSalesForExport = (sales: Sale[]) => {
  return sales.flatMap(s => 
    s.items.map(item => ({
      'Sale ID': s.id,
      'Date': formatDate(s.date),
      'Product': item.productName,
      'Quantity': item.quantity,
      'Unit Price': item.unitPrice,
      'Item Total': item.total,
      'Sale Total': s.total,
      'Payment Type': s.paymentType === 'cash' ? 'Cash' : 'Credit',
    }))
  );
};

// Format suppliers data for export
export const formatSuppliersForExport = (suppliers: Supplier[]) => {
  return suppliers.map(s => ({
    'Supplier Name': s.name,
    'Phone': s.phone || s.contact,
    'Email': s.email || 'N/A',
    'Address': s.address || 'N/A',
    'Amount Owed': s.amountOwed,
    'Last Payment Date': s.lastPaymentDate ? formatDate(s.lastPaymentDate) : 'N/A',
  }));
};
