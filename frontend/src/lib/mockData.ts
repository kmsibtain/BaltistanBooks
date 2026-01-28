// Mock data for Baltistan Book Depot

export interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  category: string;
  priceHistory: PriceHistoryEntry[];
  quantityHistory: QuantityHistoryEntry[];
}

export interface PriceHistoryEntry {
  date: string;
  oldPrice: number;
  newPrice: number;
}

export interface QuantityHistoryEntry {
  date: string;
  change: number;
  reason: string;
  newQuantity: number;
}

export interface Creditor {
  id: string;
  name: string;
  phone: string;
  cnic?: string;
  address?: string;
  email?: string;
  notes?: string;
  totalOutstanding: number;
  lastPaymentDate: string | null;
  lastPaymentAmount: number | null;
  transactions: CreditorTransaction[];
  createdAt: string;
}

export interface CreditorTransaction {
  id: string;
  date: string;
  type: 'credit_sale' | 'payment';
  amount: number;
  description: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone?: string;
  address?: string;
  email?: string;
  notes?: string;
  amountOwed: number;
  lastPaymentDate: string | null;
  createdAt: string;
}

export interface Sale {
  id: string;
  date: string;
  items: SaleItem[];
  total: number;
  paymentType: 'cash' | 'credit';
  creditorId?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Mock Products
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Oxford English Dictionary',
    sku: 'OED-001',
    quantity: 25,
    price: 2500,
    category: 'Reference',
    priceHistory: [
      { date: '2024-01-15', oldPrice: 2200, newPrice: 2500 },
      { date: '2023-09-01', oldPrice: 2000, newPrice: 2200 },
    ],
    quantityHistory: [
      { date: '2024-11-20', change: 10, reason: 'Stock replenishment', newQuantity: 25 },
    ],
  },
  {
    id: '2',
    name: 'Mathematics Grade 10 Textbook',
    sku: 'MTH-G10',
    quantity: 50,
    price: 850,
    category: 'Textbooks',
    priceHistory: [{ date: '2024-03-01', oldPrice: 800, newPrice: 850 }],
    quantityHistory: [],
  },
  {
    id: '3',
    name: 'Premium Notebook A4 (Pack of 5)',
    sku: 'NB-A4-5',
    quantity: 120,
    price: 450,
    category: 'Stationery',
    priceHistory: [],
    quantityHistory: [],
  },
  {
    id: '4',
    name: 'English Literature Anthology',
    sku: 'ELA-001',
    quantity: 35,
    price: 1200,
    category: 'Literature',
    priceHistory: [],
    quantityHistory: [],
  },
  {
    id: '5',
    name: 'Scientific Calculator FX-991',
    sku: 'CALC-FX991',
    quantity: 8,
    price: 3500,
    category: 'Electronics',
    priceHistory: [
      { date: '2024-10-01', oldPrice: 3200, newPrice: 3500 },
    ],
    quantityHistory: [],
  },
  {
    id: '6',
    name: 'Urdu Poetry Collection',
    sku: 'URD-POE-01',
    quantity: 40,
    price: 650,
    category: 'Literature',
    priceHistory: [],
    quantityHistory: [],
  },
  {
    id: '7',
    name: 'Geography Atlas World Edition',
    sku: 'GEO-ATL-W',
    quantity: 15,
    price: 1800,
    category: 'Reference',
    priceHistory: [],
    quantityHistory: [],
  },
  {
    id: '8',
    name: 'Ballpoint Pens Blue (Box of 50)',
    sku: 'PEN-BL-50',
    quantity: 200,
    price: 350,
    category: 'Stationery',
    priceHistory: [],
    quantityHistory: [],
  },
];

// Mock Creditors
export const mockCreditors: Creditor[] = [
  {
    id: '1',
    name: 'Muhammad Ali School',
    phone: '+92 345 1234567',
    cnic: '12345-1234567-1',
    address: 'Main Bazaar, Skardu, Gilgit-Baltistan',
    totalOutstanding: 45000,
    lastPaymentDate: '2024-11-15',
    lastPaymentAmount: 15000,
    transactions: [
      { id: 't1', date: '2024-11-25', type: 'credit_sale', amount: 12000, description: 'Textbooks order' },
      { id: 't2', date: '2024-11-15', type: 'payment', amount: 15000, description: 'Partial payment' },
      { id: 't3', date: '2024-10-20', type: 'credit_sale', amount: 48000, description: 'Bulk stationery order' },
    ],
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Hussain Ahmed',
    phone: '+92 312 9876543',
    cnic: '15201-4567890-3',
    address: 'College Road, Skardu',
    totalOutstanding: 8500,
    lastPaymentDate: '2024-10-28',
    lastPaymentAmount: 5000,
    transactions: [
      { id: 't4', date: '2024-11-10', type: 'credit_sale', amount: 3500, description: 'School supplies' },
      { id: 't5', date: '2024-10-28', type: 'payment', amount: 5000, description: 'Cash payment' },
      { id: 't6', date: '2024-10-15', type: 'credit_sale', amount: 10000, description: 'Reference books' },
    ],
    createdAt: '2024-02-20',
  },
  {
    id: '3',
    name: 'Fatima Academy',
    phone: '+92 333 4567890',
    cnic: '15201-7890123-5',
    address: 'Airport Road, Skardu, Gilgit-Baltistan',
    email: 'fatima.academy@email.com',
    totalOutstanding: 125000,
    lastPaymentDate: '2024-09-30',
    lastPaymentAmount: 50000,
    transactions: [
      { id: 't7', date: '2024-11-20', type: 'credit_sale', amount: 75000, description: 'Annual book order' },
      { id: 't8', date: '2024-09-30', type: 'payment', amount: 50000, description: 'Quarterly settlement' },
      { id: 't9', date: '2024-08-15', type: 'credit_sale', amount: 100000, description: 'New session supplies' },
    ],
    createdAt: '2023-08-01',
  },
  {
    id: '4',
    name: 'Karim Khan',
    phone: '+92 300 1112233',
    address: 'Hussainabad, Skardu',
    totalOutstanding: 2500,
    lastPaymentDate: '2024-11-20',
    lastPaymentAmount: 1500,
    transactions: [
      { id: 't10', date: '2024-11-22', type: 'credit_sale', amount: 2500, description: 'Notebooks' },
      { id: 't11', date: '2024-11-20', type: 'payment', amount: 1500, description: 'Payment received' },
    ],
    createdAt: '2024-06-10',
  },
];

// Mock Suppliers
export const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'National Book Foundation',
    contact: '+92 51 9201346',
    phone: '+92 51 9201346',
    address: 'F-5/1, Islamabad',
    email: 'info@nbf.org.pk',
    amountOwed: 85000,
    lastPaymentDate: '2024-11-01',
    createdAt: '2023-01-15',
  },
  {
    id: '2',
    name: 'Oxford University Press Pakistan',
    contact: '+92 42 35761264',
    phone: '+92 42 35761264',
    address: 'No. 38, Sector 15, Korangi Industrial Area, Karachi',
    email: 'pk.oup@oup.com',
    amountOwed: 150000,
    lastPaymentDate: '2024-10-15',
    createdAt: '2022-06-20',
  },
  {
    id: '3',
    name: 'Paramount Stationery',
    contact: '+92 300 8765432',
    phone: '+92 300 8765432',
    address: 'Urdu Bazaar, Lahore',
    amountOwed: 25000,
    lastPaymentDate: '2024-11-18',
    createdAt: '2024-02-10',
  },
  {
    id: '4',
    name: 'Cambridge Press Distributors',
    contact: '+92 42 35424702',
    phone: '+92 42 35424702',
    address: 'Liberty Market, Lahore',
    email: 'cambridge.pk@distributor.com',
    amountOwed: 200000,
    lastPaymentDate: '2024-09-25',
    createdAt: '2023-08-05',
  },
];

// Mock Sales (recent)
export const mockSales: Sale[] = [
  {
    id: 's1',
    date: '2024-12-04',
    items: [
      { productId: '1', productName: 'Oxford English Dictionary', quantity: 2, unitPrice: 2500, total: 5000 },
      { productId: '3', productName: 'Premium Notebook A4 (Pack of 5)', quantity: 5, unitPrice: 450, total: 2250 },
    ],
    total: 7250,
    paymentType: 'cash',
  },
  {
    id: 's2',
    date: '2024-12-04',
    items: [
      { productId: '2', productName: 'Mathematics Grade 10 Textbook', quantity: 30, unitPrice: 850, total: 25500 },
    ],
    total: 25500,
    paymentType: 'credit',
    creditorId: '1',
  },
  {
    id: 's3',
    date: '2024-12-03',
    items: [
      { productId: '5', productName: 'Scientific Calculator FX-991', quantity: 3, unitPrice: 3500, total: 10500 },
    ],
    total: 10500,
    paymentType: 'cash',
  },
];

// Summary calculations
export const getDashboardMetrics = () => {
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().toISOString().slice(0, 7);

  const todaySales = mockSales
    .filter(s => s.date === today)
    .reduce((sum, s) => sum + s.total, 0);

  const monthSales = mockSales
    .filter(s => s.date.startsWith(currentMonth))
    .reduce((sum, s) => sum + s.total, 0);

  const totalOutstandingCredits = mockCreditors.reduce((sum, c) => sum + c.totalOutstanding, 0);
  const totalPendingDebits = mockSuppliers.reduce((sum, s) => sum + s.amountOwed, 0);

  return {
    todaySales,
    monthSales,
    totalOutstandingCredits,
    totalPendingDebits,
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
