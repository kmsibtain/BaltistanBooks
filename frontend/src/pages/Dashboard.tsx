import { AppLayout } from '@/components/layout/AppLayout';
import { MetricCard } from '@/components/ui/MetricCard';
import { LowStockAlert } from '@/components/LowStockAlert';
import { getDashboardMetrics, formatCurrency, mockSales, formatDate } from '@/lib/mockData';
import { DollarSign, CreditCard, TrendingDown, Clock } from 'lucide-react';

const Dashboard = () => {
  const metrics = getDashboardMetrics();

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back to Baltistan Book Depot</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Today's Sales"
          value={formatCurrency(metrics.todaySales)}
          icon={DollarSign}
          variant="default"
        />
        <MetricCard
          title="This Month's Sales"
          value={formatCurrency(metrics.monthSales)}
          icon={TrendingDown}
          variant="success"
        />
        <MetricCard
          title="Outstanding Credits"
          value={formatCurrency(metrics.totalOutstandingCredits)}
          icon={CreditCard}
          variant="warning"
        />
        <MetricCard
          title="Pending to Suppliers"
          value={formatCurrency(metrics.totalPendingDebits)}
          icon={Clock}
          variant="accent"
        />
      </div>

      {/* Low Stock Alerts & Recent Activity Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <LowStockAlert threshold={10} />

        {/* Recent Activity */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-display font-semibold text-xl mb-4">Recent Transactions</h2>
          <div className="space-y-4">
            {mockSales.slice(0, 5).map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium">
                    {sale.items.map((i) => i.productName).join(', ')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(sale.date)} • {sale.paymentType === 'cash' ? 'Cash' : 'Credit'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold font-display">{formatCurrency(sale.total)}</p>
                  <span
                    className={`status-badge ${
                      sale.paymentType === 'cash' ? 'status-success' : 'status-warning'
                    }`}
                  >
                    {sale.paymentType === 'cash' ? 'Paid' : 'Credit'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
