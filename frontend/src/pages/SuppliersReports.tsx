import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/ui/DataTable';
import { mockSuppliers, mockSales, formatCurrency, formatDate, Supplier } from '@/lib/mockData';
import { formatSuppliersForExport, formatSalesForExport } from '@/lib/exportUtils';
import { ExportButton } from '@/components/ExportButton';
import { DollarSign, Truck, TrendingUp, TrendingDown, Calendar, Plus, Search, Pencil } from 'lucide-react';
import { toast } from 'sonner';

const SuppliersReports = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [reportPeriod, setReportPeriod] = useState('monthly');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const [newSupplier, setNewSupplier] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    notes: '',
    amountOwed: '',
  });

  const [editSupplier, setEditSupplier] = useState({
    id: '',
    name: '',
    phone: '',
    address: '',
    email: '',
    notes: '',
    amountOwed: '',
  });

  const filteredSuppliers = useMemo(() => {
    if (!searchQuery.trim()) return suppliers;
    return suppliers.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [suppliers, searchQuery]);

  const totalOwed = suppliers.reduce((sum, s) => sum + s.amountOwed, 0);

  const supplierColumns = [
    {
      header: 'Supplier',
      accessor: (item: Supplier) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded-lg">
            <Truck className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-muted-foreground">{item.phone || item.contact}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact Info',
      accessor: (item: Supplier) => (
        <div className="text-sm">
          {item.email && <p className="text-muted-foreground">{item.email}</p>}
          {item.address && <p className="text-muted-foreground truncate max-w-[200px]">{item.address}</p>}
        </div>
      ),
    },
    {
      header: 'Amount Owed',
      accessor: (item: Supplier) => (
        <span className="font-semibold text-accent">
          {formatCurrency(item.amountOwed)}
        </span>
      ),
    },
    {
      header: 'Last Payment',
      accessor: (item: Supplier) =>
        item.lastPaymentDate ? (
          formatDate(item.lastPaymentDate)
        ) : (
          <span className="text-muted-foreground">No payments yet</span>
        ),
    },
    {
      header: 'Actions',
      accessor: (item: Supplier) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(item);
            }}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSupplier(item);
              setIsPaymentDialogOpen(true);
            }}
          >
            <DollarSign className="w-4 h-4 mr-1" />
            Pay
          </Button>
        </div>
      ),
    },
  ];

  const handleEditClick = (supplier: Supplier) => {
    setEditSupplier({
      id: supplier.id,
      name: supplier.name,
      phone: supplier.phone || supplier.contact || '',
      address: supplier.address || '',
      email: supplier.email || '',
      notes: supplier.notes || '',
      amountOwed: supplier.amountOwed.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const handleAddSupplier = () => {
    if (!newSupplier.name.trim()) {
      toast.error('Supplier name is required');
      return;
    }
    if (!newSupplier.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    const supplier: Supplier = {
      id: `sup-${Date.now()}`,
      name: newSupplier.name.trim(),
      contact: newSupplier.phone.trim(),
      phone: newSupplier.phone.trim(),
      address: newSupplier.address.trim() || undefined,
      email: newSupplier.email.trim() || undefined,
      notes: newSupplier.notes.trim() || undefined,
      amountOwed: parseFloat(newSupplier.amountOwed) || 0,
      lastPaymentDate: null,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setSuppliers([supplier, ...suppliers]);
    mockSuppliers.unshift(supplier);
    toast.success(`Supplier "${supplier.name}" added successfully`);
    setIsAddDialogOpen(false);
    setNewSupplier({ name: '', phone: '', address: '', email: '', notes: '', amountOwed: '' });
  };

  const handleEditSupplier = () => {
    if (!editSupplier.name.trim()) {
      toast.error('Supplier name is required');
      return;
    }
    if (!editSupplier.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    const updatedSuppliers = suppliers.map(s => {
      if (s.id === editSupplier.id) {
        return {
          ...s,
          name: editSupplier.name.trim(),
          contact: editSupplier.phone.trim(),
          phone: editSupplier.phone.trim(),
          address: editSupplier.address.trim() || undefined,
          email: editSupplier.email.trim() || undefined,
          notes: editSupplier.notes.trim() || undefined,
          amountOwed: parseFloat(editSupplier.amountOwed) || 0,
        };
      }
      return s;
    });

    setSuppliers(updatedSuppliers);
    
    // Update mockSuppliers as well
    const index = mockSuppliers.findIndex(s => s.id === editSupplier.id);
    if (index !== -1) {
      mockSuppliers[index] = updatedSuppliers.find(s => s.id === editSupplier.id)!;
    }

    toast.success(`Supplier "${editSupplier.name}" updated successfully`);
    setIsEditDialogOpen(false);
  };

  const handleRecordPayment = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    const updatedSuppliers = suppliers.map(s => {
      if (s.id === selectedSupplier?.id) {
        return {
          ...s,
          amountOwed: Math.max(0, s.amountOwed - parseFloat(paymentAmount)),
          lastPaymentDate: new Date().toISOString().split('T')[0],
        };
      }
      return s;
    });

    setSuppliers(updatedSuppliers);
    toast.success(`Payment of ${formatCurrency(parseFloat(paymentAmount))} recorded to ${selectedSupplier?.name}`);
    setIsPaymentDialogOpen(false);
    setPaymentAmount('');
    setSelectedSupplier(null);
  };

  // Mock financial report data
  const generateReport = () => {
    const revenue = 485000;
    const cogs = 312000;
    const profit = revenue - cogs;
    return { revenue, cogs, profit };
  };

  const report = generateReport();

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">Suppliers & Reports</h1>
        <p className="page-subtitle">Manage supplier debts and view financial reports</p>
      </div>

      {/* Supplier Debts Section */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h2 className="font-display font-semibold text-xl">Supplier Debts</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Supplier
            </Button>
            <ExportButton 
              data={formatSuppliersForExport(filteredSuppliers)} 
              filename="supplier-debts" 
            />
          </div>
        </div>
        
        {/* Total Summary */}
        <div className="metric-card mb-6 max-w-md before:bg-accent">
          <p className="text-sm text-muted-foreground">Total Owed to Suppliers</p>
          <p className="text-3xl font-bold font-display mt-2 text-accent">
            {formatCurrency(totalOwed)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            across {suppliers.length} suppliers
          </p>
        </div>

        <DataTable
          columns={supplierColumns}
          data={filteredSuppliers}
          emptyMessage={searchQuery ? "No suppliers found matching your search" : "No suppliers found"}
        />
      </div>

      {/* Financial Reports Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-xl flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Financial Reports
          </h2>
          <ExportButton 
            data={formatSalesForExport(mockSales)} 
            filename="sales-report" 
          />
        </div>

        {/* Date Range Selector */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <Label className="input-label">Report Period</Label>
          <div className="flex flex-wrap gap-4 items-end">
            <Select value={reportPeriod} onValueChange={setReportPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">This Month</SelectItem>
                <SelectItem value="yearly">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            {reportPeriod === 'custom' && (
              <div className="flex gap-4 animate-fade-in">
                <div>
                  <Label className="text-xs text-muted-foreground">Start Date</Label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">End Date</Label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Report Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="metric-card before:bg-success">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-success" />
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
            <p className="text-3xl font-bold font-display text-success">
              {formatCurrency(report.revenue)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {reportPeriod === 'monthly' ? 'this month' : reportPeriod === 'yearly' ? 'this year' : 'selected period'}
            </p>
          </div>

          <div className="metric-card before:bg-destructive">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-destructive" />
              <p className="text-sm text-muted-foreground">Cost of Goods Sold</p>
            </div>
            <p className="text-3xl font-bold font-display">
              {formatCurrency(report.cogs)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {((report.cogs / report.revenue) * 100).toFixed(1)}% of revenue
            </p>
          </div>

          <div className={`metric-card ${report.profit >= 0 ? 'before:bg-primary' : 'before:bg-destructive'}`}>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className={`w-5 h-5 ${report.profit >= 0 ? 'text-primary' : 'text-destructive'}`} />
              <p className="text-sm text-muted-foreground">Net Profit</p>
            </div>
            <p className={`text-3xl font-bold font-display ${report.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {formatCurrency(report.profit)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {((report.profit / report.revenue) * 100).toFixed(1)}% margin
            </p>
          </div>
        </div>
      </div>

      {/* Add Supplier Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Add New Supplier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label className="input-label">Supplier Name *</Label>
              <Input
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                placeholder="Enter supplier name"
              />
            </div>
            <div>
              <Label className="input-label">Phone Number *</Label>
              <Input
                value={newSupplier.phone}
                onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                placeholder="+92 XXX XXXXXXX"
              />
            </div>
            <div>
              <Label className="input-label">Email</Label>
              <Input
                type="email"
                value={newSupplier.email}
                onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                placeholder="supplier@email.com"
              />
            </div>
            <div>
              <Label className="input-label">Address</Label>
              <Input
                value={newSupplier.address}
                onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                placeholder="Enter address"
              />
            </div>
            <div>
              <Label className="input-label">Initial Amount Owed (PKR)</Label>
              <Input
                type="number"
                value={newSupplier.amountOwed}
                onChange={(e) => setNewSupplier({ ...newSupplier, amountOwed: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <Label className="input-label">Notes</Label>
              <Textarea
                value={newSupplier.notes}
                onChange={(e) => setNewSupplier({ ...newSupplier, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
            <Button className="w-full" onClick={handleAddSupplier}>
              Add Supplier
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Supplier Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Supplier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label className="input-label">Supplier Name *</Label>
              <Input
                value={editSupplier.name}
                onChange={(e) => setEditSupplier({ ...editSupplier, name: e.target.value })}
                placeholder="Enter supplier name"
              />
            </div>
            <div>
              <Label className="input-label">Phone Number *</Label>
              <Input
                value={editSupplier.phone}
                onChange={(e) => setEditSupplier({ ...editSupplier, phone: e.target.value })}
                placeholder="+92 XXX XXXXXXX"
              />
            </div>
            <div>
              <Label className="input-label">Email</Label>
              <Input
                type="email"
                value={editSupplier.email}
                onChange={(e) => setEditSupplier({ ...editSupplier, email: e.target.value })}
                placeholder="supplier@email.com"
              />
            </div>
            <div>
              <Label className="input-label">Address</Label>
              <Input
                value={editSupplier.address}
                onChange={(e) => setEditSupplier({ ...editSupplier, address: e.target.value })}
                placeholder="Enter address"
              />
            </div>
            <div>
              <Label className="input-label">Amount Owed (PKR)</Label>
              <Input
                type="number"
                value={editSupplier.amountOwed}
                onChange={(e) => setEditSupplier({ ...editSupplier, amountOwed: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <Label className="input-label">Notes</Label>
              <Textarea
                value={editSupplier.notes}
                onChange={(e) => setEditSupplier({ ...editSupplier, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
            <Button className="w-full" onClick={handleEditSupplier}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Record Payment to Supplier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label className="input-label">Supplier</Label>
              <p className="font-semibold">{selectedSupplier?.name}</p>
            </div>
            <div>
              <Label className="input-label">Current Balance Owed</Label>
              <p className="text-2xl font-bold font-display text-accent">
                {formatCurrency(selectedSupplier?.amountOwed || 0)}
              </p>
            </div>
            <div>
              <Label className="input-label">Payment Amount (PKR)</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter payment amount"
              />
            </div>
            <Button className="w-full" onClick={handleRecordPayment}>
              Record Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default SuppliersReports;
