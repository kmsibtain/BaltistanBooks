import { useState, useMemo } from 'react';
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
import { mockSales, mockCreditors, formatCurrency, formatDate, Sale } from '@/lib/mockData';
import { formatSalesForExport } from '@/lib/exportUtils';
import { Search, Calendar, Filter, X } from 'lucide-react';

const SalesHistory = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<string>('all');
  const [creditorFilter, setCreditorFilter] = useState<string>('all');

  const filteredSales = useMemo(() => {
    return mockSales.filter((sale) => {
      // Date filter
      if (startDate && sale.date < startDate) return false;
      if (endDate && sale.date > endDate) return false;
      
      // Payment type filter
      if (paymentTypeFilter !== 'all' && sale.paymentType !== paymentTypeFilter) return false;
      
      // Creditor filter
      if (creditorFilter !== 'all') {
        if (creditorFilter === 'cash' && sale.paymentType !== 'cash') return false;
        if (creditorFilter !== 'cash' && sale.creditorId !== creditorFilter) return false;
      }
      
      return true;
    });
  }, [startDate, endDate, paymentTypeFilter, creditorFilter]);

  const totalFiltered = filteredSales.reduce((sum, sale) => sum + sale.total, 0);

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setPaymentTypeFilter('all');
    setCreditorFilter('all');
  };

  const hasActiveFilters = startDate || endDate || paymentTypeFilter !== 'all' || creditorFilter !== 'all';

  const getCreditorName = (creditorId?: string) => {
    if (!creditorId) return 'N/A';
    const creditor = mockCreditors.find(c => c.id === creditorId);
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
            {item.items.map(i => i.productName).join(', ')}
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
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.paymentType === 'cash' 
            ? 'bg-success/10 text-success' 
            : 'bg-accent/10 text-accent'
        }`}>
          {item.paymentType === 'cash' ? 'Cash' : 'Credit'}
        </span>
      ),
    },
    {
      header: 'Creditor',
      accessor: (item: Sale) => (
        <span className={item.creditorId ? 'font-medium' : 'text-muted-foreground'}>
          {item.paymentType === 'credit' ? getCreditorName(item.creditorId) : '-'}
        </span>
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Sales History</h1>
            <p className="page-subtitle">View and filter all past transactions</p>
          </div>
          <ExportButton 
            data={formatSalesForExport(filteredSales)} 
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
            <Label className="input-label">Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <Label className="input-label">End Date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div>
            <Label className="input-label">Payment Type</Label>
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
            <Label className="input-label">Creditor</Label>
            <Select value={creditorFilter} onValueChange={setCreditorFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="cash">Cash Sales Only</SelectItem>
                {mockCreditors.map((creditor) => (
                  <SelectItem key={creditor.id} value={creditor.id}>
                    {creditor.name}
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
          {filteredSales.length} transaction(s)
        </p>
      </div>

      {/* Sales Table */}
      <DataTable
        columns={saleColumns}
        data={filteredSales}
        emptyMessage="No sales found matching your filters"
      />
    </AppLayout>
  );
};

export default SalesHistory;
