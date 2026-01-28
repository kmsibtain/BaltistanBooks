require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const productRoutes = require('./routes/products');
const creditorRoutes = require('./routes/creditors');
const supplierRoutes = require('./routes/suppliers');
const saleRoutes = require('./routes/sales');
const dashboardRoutes = require('./routes/dashboard');
const authRoutes = require('./routes/auth');
const settingsRoutes = require('./routes/settings');
const expenseRoutes = require('./routes/expenses');
const reportRoutes = require('./routes/reports');
const auditRoutes = require('./routes/audit');

const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Baltistan Book Depot API is running! ' });
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/creditors', creditorRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit', auditRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});