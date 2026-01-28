// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MetricCard } from '@/components/ui/MetricCard';
import { LowStockAlert } from '@/components/LowStockAlert';
import { DollarSign, CreditCard, TrendingDown, Clock } from 'lucide-react';

// Types – keep them in one place
interface DashboardMetrics {
  todaySales: number;
  monthSales: number;
  totalOutstandingCredits: number;
  totalPendingDebits: number;
}

interface SaleItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Sale {
  id: string;
  date: string;
  items: SaleItem[];
  total: number;
  paymentType: 'cash' | 'credit';
  creditorId?: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Reusable helpers (same as before, but typed)
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // 1. Dashboard metrics
        const metricsRes = await fetch(`${API_URL}/dashboard`);
        if (!metricsRes.ok) throw new Error('Failed to load dashboard metrics');
        const metricsData: DashboardMetrics = await metricsRes.json();
        setMetrics(metricsData);

        // 2. Recent sales
        const salesRes = await fetch(`${API_URL}/sales`);
        if (!salesRes.ok) throw new Error('Failed to load sales');
        const allSales: Sale[] = await salesRes.json();

        const latestFive = allSales
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);

        setRecentSales(latestFive);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong';
        console.error('Dashboard fetch error:', err);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-xl text-muted-foreground">Loading dashboard...</p>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error || !metrics) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-destructive text-lg mb-4">
            {error || 'Unable to load dashboard data'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
          >
            Try Again
          </button>
        </div>
      </AppLayout>
    );
  }

  // Main render
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

      {/* Low Stock + Recent Transactions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <LowStockAlert threshold={10} />

        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-display font-semibold text-xl mb-4">Recent Transactions</h2>

          {recentSales.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No transactions yet
            </p>
          ) : (
            <div className="space-y-4">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition"
                >
                  <div className="flex-1">
                    <p className="font-medium">
                      {sale.items.map((i) => i.productName).join(', ')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(sale.date)} •{' '}
                      {sale.paymentType === 'cash' ? 'Cash' : 'Credit'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold font-display">
                      {formatCurrency(sale.total)}
                    </p>
                    <span
                      className={`status-badge ${
                        sale.paymentType === 'cash'
                          ? 'status-success'
                          : 'status-warning'
                      }`}
                    >
                      {sale.paymentType === 'cash' ? 'Paid' : 'Credit'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;