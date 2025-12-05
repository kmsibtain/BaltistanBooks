// scripts/mockData.js  ← ONLY FOR BACKEND SEEDING

const mockProducts = [
  {
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
    name: 'Mathematics Grade 10 Textbook',
    sku: 'MTH-G10',
    quantity: 50,
    price: 850,
    category: 'Textbooks',
    priceHistory: [{ date: '2024-03-01', oldPrice: 800, newPrice: 850 }],
    quantityHistory: [],
  },
  {
    name: 'Premium Notebook A4 (Pack of 5)',
    sku: 'NB-A4-5',
    quantity: 120,
    price: 450,
    category: 'Stationery',
    priceHistory: [],
    quantityHistory: [],
  },
  {
    name: 'English Literature Anthology',
    sku: 'ELA-001',
    quantity: 35,
    price: 1200,
    category: 'Literature',
    priceHistory: [],
    quantityHistory: [],
  },
  {
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
];

const mockCreditors = [
  {
    name: 'Muhammad Ali School',
    phone: '+92 345 1234567',
    cnic: '12345-1234567-1',
    address: 'Main Bazaar, Skardu',
    totalOutstanding: 45000,
    lastPaymentDate: '2024-11-15',
    lastPaymentAmount: 15000,
    transactions: [],
    createdAt: '2024-01-15',
  },
  {
    name: 'Hussain Ahmed',
    phone: '+92 312 9876543',
    totalOutstanding: 8500,
    lastPaymentDate: '2024-10-28',
    lastPaymentAmount: 5000,
    transactions: [],
    createdAt: '2024-02-20',
  },
  {
    name: 'Fatima Academy',
    phone: '+92 333 4567890',
    totalOutstanding: 125000,
    lastPaymentDate: '2024-09-30',
    lastPaymentAmount: 50000,
    transactions: [],
    createdAt: '2023-08-01',
  },
];

const mockSuppliers = [
  {
    name: 'National Book Foundation',
    phone: '+92 51 9201346',
    email: 'info@nbf.org.pk',
    address: 'F-5/1, Islamabad',
    amountOwed: 85000,
    lastPaymentDate: '2024-11-01',
    createdAt: '2023-01-15',
  },
  {
    name: 'Oxford University Press Pakistan',
    phone: '+92 42 35761264',
    email: 'pk.oup@oup.com',
    address: 'Korangi, Karachi',
    amountOwed: 150000,
    lastPaymentDate: '2024-10-15',
    createdAt: '2022-06-20',
  },
];

const mockSales = [
  {
    date: '2024-12-04',
    items: [
      { productId: '', productName: 'Oxford English Dictionary', quantity: 2, unitPrice: 2500, total: 5000 },
      { productId: '', productName: 'Premium Notebook A4 (Pack of 5)', quantity: 5, unitPrice: 450, total: 2250 },
    ],
    total: 7250,
    paymentType: 'cash',
  },
  {
    date: '2024-12-04',
    items: [
      { productId: '', productName: 'Mathematics Grade 10 Textbook', quantity: 30, unitPrice: 850, total: 25500 },
    ],
    total: 25500,
    paymentType: 'credit',
    creditorId: '',
  },
];

module.exports = {
  mockProducts,
  mockCreditors,
  mockSuppliers,
  mockSales,
};