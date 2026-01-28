// src/pages/SalesHistory.tsx
import { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/ui/DataTable';
import { ExportButton } from '@/components/ExportButton';
import { Calendar, Filter, X } from 'lucide-react';
import { toast } from 'sonner';

// Types
interface SaleItem {
  productId: string;
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
  creditorId?: string | null;
}

interface Creditor {
  id: string;
  name: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SalesHistory = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [creditors, setCreditors] = useState<Creditor[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<string>('all');
  const [creditorFilter, setCreditorFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Format helpers
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

  // Fetch sales & creditors
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [salesRes, creditorsRes] = await Promise.all([
          fetch(`${API_URL}/sales`),
          fetch(`${API_URL}/creditors`),
        ]);

        if (!salesRes.ok) throw new Error('Failed to load sales');
        if (!creditorsRes.ok) throw new Error('Failed to load creditors');

        const salesData: Sale[] = await salesRes.json();
        const creditorsData: Creditor[] = await creditorsRes.json();

        // Sort newest first
        salesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setSales(salesData);
        setCreditors(creditorsData);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load data';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter sales
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      if (startDate && sale.date < startDate) return false;
      if (endDate && sale.date > endDate) return false;
      if (paymentTypeFilter !== 'all' && sale.paymentType !== paymentTypeFilter) return false;
      if (creditorFilter !== 'all') {
        if (creditorFilter === 'cash' && sale.paymentType !== 'cash') return false;
        if (creditorFilter !== 'cash' && sale.creditorId !== creditorFilter) return false;
      }
      return true;
    });
  }, [sales, startDate, endDate, paymentTypeFilter, creditorFilter]);

  const totalFiltered = filteredSales.reduce((sum, s) => sum + s.total, 0);

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setPaymentTypeFilter('all');
    setCreditorFilter('all');
  };

  const hasActiveFilters =
    startDate || endDate || paymentTypeFilter !== 'all' || creditorFilter !== 'all';

  const getCreditorName = (creditorId?: string | null) => {
    if (!creditorId) return '—';
    const creditor = creditors.find((c) => c.id === creditorId);
    return creditor?.name || 'Unknown';
  };

  const saleColumns = [
    {
      header: 'Date',
      accessor: (item: Sale) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>{formatDate(item.date)}</span>
        </div>
      ),
    },
    {
      header: 'Sale ID',
      accessor: (item: Sale) => (
        <span className="font-mono text-sm">{item.id.toUpperCase()}</span>
      ),
    },
    {
      header: 'Items',
      accessor: (item: Sale) => (
        <div>
          <span className="font-medium">{item.items.length} item(s)</span>
          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
            {item.items.map((i) => i.productName).join(', ')}
          </p>
        </div>
      ),
    },
    {
      header: 'Total',
      accessor: (item: Sale) => (
        <span className="font-semibold text-primary">
          {formatCurrency(item.total)}
        </span>
      ),
    },
    {
      header: 'Payment Type',
      accessor: (item: Sale) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.paymentType === 'cash'
              ? 'bg-success/10 text-success'
              : 'bg-accent/10 text-accent'
          }`}
        >
          {item.paymentType === 'cash' ? 'Cash' : 'Credit'}
        </span>
      ),
    },
    {
      header: 'Customer',
      accessor: (item: Sale) => (
        <span className={item.creditorId ? 'font-medium' : 'text-muted-foreground'}>
          {item.paymentType === 'credit' ? getCreditorName(item.creditorId) : 'Cash Sale'}
        </span>
      ),
    },
  ];

  // Loading state
  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-xl text-muted-foreground">Loading sales history...</p>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-destructive text-lg mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Sales History</h1>
            <p className="page-subtitle">View and filter all past transactions</p>
          </div>
          <ExportButton
            data={filteredSales.map((s) => ({
              Date: formatDate(s.date),
              'Sale ID': s.id,
              Items: s.items.map((i) => i.productName).join('; '),
              Total: s.total,
              'Payment Type': s.paymentType,
              Customer: s.paymentType === 'credit' ? getCreditorName(s.creditorId) : 'Cash',
            }))}
            filename="sales-history"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold">Filters</h2>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto">
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label>Start Date</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label>End Date</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div>
            <Label>Payment Type</Label>
            <Select value={paymentTypeFilter} onValueChange={setPaymentTypeFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Customer</Label>
            <Select value={creditorFilter} onValueChange={setCreditorFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="cash">Cash Sales Only</SelectItem>
                {creditors.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="metric-card mb-6 max-w-md before:bg-primary">
        <p className="text-sm text-muted-foreground">Filtered Results</p>
        <p className="text-3xl font-bold font-display mt-2 text-primary">
          {formatCurrency(totalFiltered)}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {filteredSales.length} transaction{filteredSales.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Table */}
      <DataTable
        columns={saleColumns}
        data={filteredSales}
        emptyMessage="No sales found matching your filters"
      />
    </AppLayout>
  );
};

export default SalesHistory;