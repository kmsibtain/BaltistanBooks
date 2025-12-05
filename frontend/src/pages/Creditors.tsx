import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DataTable } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { mockCreditors, formatCurrency, formatDate, Creditor } from '@/lib/mockData';
import { formatCreditorsForExport } from '@/lib/exportUtils';
import { ExportButton } from '@/components/ExportButton';
import { Search, Users, Plus } from 'lucide-react';
import { toast } from 'sonner';

const Creditors = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCreditor, setNewCreditor] = useState({
    name: '',
    phone: '',
    cnic: '',
    address: '',
    email: '',
    notes: '',
  });

  const handleAddCreditor = () => {
    if (!newCreditor.name.trim() || !newCreditor.phone.trim()) {
      toast.error('Name and phone number are required');
      return;
    }

    // In a real app, this would be an API call
    const creditor: Creditor = {
      id: String(mockCreditors.length + 1),
      name: newCreditor.name.trim(),
      phone: newCreditor.phone.trim(),
      cnic: newCreditor.cnic.trim() || undefined,
      address: newCreditor.address.trim() || undefined,
      email: newCreditor.email.trim() || undefined,
      notes: newCreditor.notes.trim() || undefined,
      totalOutstanding: 0,
      lastPaymentDate: null,
      lastPaymentAmount: null,
      transactions: [],
      createdAt: new Date().toISOString().split('T')[0],
    };

    mockCreditors.push(creditor);
    toast.success(`${creditor.name} added successfully`);
    setIsAddDialogOpen(false);
    setNewCreditor({ name: '', phone: '', cnic: '', address: '', email: '', notes: '' });
  };

  const maxOutstanding = Math.max(...mockCreditors.map((c) => c.totalOutstanding));

  const filteredCreditors = mockCreditors.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Creditor',
      accessor: (item: Creditor) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded-lg">
            <Users className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-muted-foreground">{item.phone}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Outstanding Balance',
      accessor: (item: Creditor) => (
        <div>
          <span
            className={`font-semibold ${
              item.totalOutstanding === maxOutstanding
                ? 'text-destructive'
                : 'text-foreground'
            }`}
          >
            {formatCurrency(item.totalOutstanding)}
          </span>
          {item.totalOutstanding === maxOutstanding && (
            <span className="ml-2 status-badge status-danger">Highest</span>
          )}
        </div>
      ),
    },
    {
      header: 'Last Payment',
      accessor: (item: Creditor) =>
        item.lastPaymentDate ? (
          <div>
            <p>{formatDate(item.lastPaymentDate)}</p>
            <p className="text-sm text-success">
              {formatCurrency(item.lastPaymentAmount || 0)}
            </p>
          </div>
        ) : (
          <span className="text-muted-foreground">No payments yet</span>
        ),
    },
    {
      header: 'Transactions',
      accessor: (item: Creditor) => (
        <span className="status-badge bg-muted text-muted-foreground">
          {item.transactions.length} records
        </span>
      ),
    },
  ];

  const totalOutstanding = mockCreditors.reduce(
    (sum, c) => sum + c.totalOutstanding,
    0
  );

  return (
    <AppLayout>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Creditors Ledger</h1>
          <p className="page-subtitle">Track customer credit accounts</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Creditor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Creditor</DialogTitle>
                <DialogDescription>
                  Enter the creditor's details below. Name and phone are required.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Full name or business name"
                    value={newCreditor.name}
                    onChange={(e) => setNewCreditor({ ...newCreditor, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      placeholder="+92 XXX XXXXXXX"
                      value={newCreditor.phone}
                      onChange={(e) => setNewCreditor({ ...newCreditor, phone: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cnic">CNIC</Label>
                    <Input
                      id="cnic"
                      placeholder="XXXXX-XXXXXXX-X"
                      value={newCreditor.cnic}
                      onChange={(e) => setNewCreditor({ ...newCreditor, cnic: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={newCreditor.email}
                    onChange={(e) => setNewCreditor({ ...newCreditor, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Full address"
                    value={newCreditor.address}
                    onChange={(e) => setNewCreditor({ ...newCreditor, address: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes (optional)"
                    value={newCreditor.notes}
                    onChange={(e) => setNewCreditor({ ...newCreditor, notes: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCreditor}>Add Creditor</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <ExportButton 
            data={formatCreditorsForExport(filteredCreditors)} 
            filename="creditors-ledger" 
          />
        </div>
      </div>

      {/* Summary */}
      <div className="metric-card mb-6 max-w-md before:bg-warning">
        <p className="text-sm text-muted-foreground">Total Outstanding Credits</p>
        <p className="text-3xl font-bold font-display mt-2 text-warning">
          {formatCurrency(totalOutstanding)}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          across {mockCreditors.length} creditors
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search creditors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Creditors Table */}
      <DataTable
        columns={columns}
        data={filteredCreditors}
        onRowClick={(creditor) => navigate(`/creditors/${creditor.id}`)}
        emptyMessage="No creditors found"
      />
    </AppLayout>
  );
};

export default Creditors;
