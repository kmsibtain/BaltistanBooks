// src/pages/SuppliersReports.tsx
import { useState, useEffect, useMemo } from 'react';
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
import { DataTable } from '@/components/ui/DataTable';
import { ExportButton } from '@/components/ExportButton';
import {
  DollarSign,
  Truck,
  Calendar,
  Plus,
  Search,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';

// Types
interface Supplier {
  id: string;
  name: string;
  phone: string;
  address?: string;
  email?: string;
  notes?: string;
  amountOwed: number;
  lastPaymentDate?: string | null;
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SuppliersReports = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const [newSupplier, setNewSupplier] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    notes: '',
    amountOwed: '',
  });

  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);

  // Format helpers
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/suppliers`);
        if (!res.ok) throw new Error('Failed to load suppliers');
        const data: Supplier[] = await res.json();
        setSuppliers(data);
        setFilteredSuppliers(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Network error';
        setError(msg);
        toast.error('Could not load suppliers');
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  // Search
  useEffect(() => {
    const filtered = suppliers.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery)
    );
    setFilteredSuppliers(filtered);
  }, [searchQuery, suppliers]);

  const totalOwed = suppliers.reduce((sum, s) => sum + s.amountOwed, 0);

  // Add supplier
  const handleAddSupplier = async () => {
    if (!newSupplier.name.trim() || !newSupplier.phone.trim()) {
      toast.error('Name and phone are required');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/suppliers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSupplier.name.trim(),
          phone: newSupplier.phone.trim(),
          address: newSupplier.address.trim() || null,
          email: newSupplier.email.trim() || null,
          notes: newSupplier.notes.trim() || null,
          amountOwed: Number(newSupplier.amountOwed) || 0,
        }),
      });

      if (!res.ok) throw new Error('Failed to add supplier');

      const added: Supplier = await res.json();
      setSuppliers([added, ...suppliers]);
      toast.success(`"${added.name}" added successfully`);
      setIsAddDialogOpen(false);
      setNewSupplier({ name: '', phone: '', address: '', email: '', notes: '', amountOwed: '' });
    } catch {
      toast.error('Failed to add supplier');
    }
  };

  // Edit supplier
  const handleEditClick = (supplier: Supplier) => {
    setEditSupplier(supplier);
    setIsEditDialogOpen(true);
  };

  const handleUpdateSupplier = async () => {
    if (!editSupplier || !editSupplier.name.trim() || !editSupplier.phone.trim()) {
      toast.error('Name and phone required');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/suppliers/${editSupplier.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editSupplier.name,
          phone: editSupplier.phone,
          address: editSupplier.address || null,
          email: editSupplier.email || null,
          notes: editSupplier.notes || null,
          amountOwed: Number(editSupplier.amountOwed),
        }),
      });

      if (!res.ok) throw new Error('Update failed');

      const updated = await res.json();
      setSuppliers(suppliers.map(s => s.id === updated.id ? updated : s));
      toast.success('Supplier updated');
      setIsEditDialogOpen(false);
    } catch {
      toast.error('Failed to update supplier');
    }
  };

  // Record payment
  const handleRecordPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      toast.error('Enter valid amount');
      return;
    }
    if (!selectedSupplier) return;

    try {
      const res = await fetch(`${API_URL}/suppliers/${selectedSupplier.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      if (!res.ok) throw new Error('Payment failed');

      const updated = await res.json();
      setSuppliers(suppliers.map(s => s.id === updated.id ? updated : s));
      toast.success(`Payment recorded: ${formatCurrency(amount)}`);
      setIsPaymentDialogOpen(false);
      setPaymentAmount('');
      setSelectedSupplier(null);
    } catch {
      toast.error('Payment failed');
    }
  };

  const columns = [
    {
      header: 'Supplier',
      accessor: (item: Supplier) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded-lg">
            <Truck className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-muted-foreground">{item.phone}</p>
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
Pay
          </Button>
        </div>
      ),
    },
  ];

  // Loading
  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-xl text-muted-foreground">Loading suppliers...</p>
        </div>
      </AppLayout>
    );
  }

  // Error
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
        <h1 className="page-title">Suppliers & Reports</h1>
        <p className="page-subtitle">Manage supplier debts and track payments</p>
      </div>

      {/* Supplier List */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <h2 className="font-display font-semibold text-xl">Supplier Debts</h2>
          <div className="flex gap-3">
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
              data={filteredSuppliers.map(s => ({
                Name: s.name,
                Phone: s.phone,
                Email: s.email || '',
                'Amount Owed': s.amountOwed,
                'Last Payment': s.lastPaymentDate || '—',
              }))}
              filename="suppliers-report"
            />
          </div>
        </div>

        {/* Total Owed */}
        <div className="metric-card mb-6 max-w-md before:bg-accent">
          <p className="text-sm text-muted-foreground">Total Owed to Suppliers</p>
          <p className="text-3xl font-bold font-display mt-2 text-accent">
            {formatCurrency(totalOwed)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            across {suppliers.length} supplier{suppliers.length !== 1 ? 's' : ''}
          </p>
        </div>

        <DataTable
          columns={columns}
          data={filteredSuppliers}
          emptyMessage="No suppliers found"
        />
      </div>

      {/* Add Supplier Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Name *</Label><Input value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} /></div>
            <div><Label>Phone *</Label><Input value={newSupplier.phone} onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})} /></div>
            <div><Label>Email</Label><Input value={newSupplier.email} onChange={e => setNewSupplier({...newSupplier, email: e.target.value})} /></div>
            <div><Label>Address</Label><Input value={newSupplier.address} onChange={e => setNewSupplier({...newSupplier, address: e.target.value})} /></div>
            <div><Label>Initial Amount Owed</Label><Input type="number" value={newSupplier.amountOwed} onChange={e => setNewSupplier({...newSupplier, amountOwed: e.target.value})} placeholder="0" /></div>
            <div><Label>Notes</Label><Textarea value={newSupplier.notes} onChange={e => setNewSupplier({...newSupplier, notes: e.target.value})} /></div>
            <Button className="w-full" onClick={handleAddSupplier}>Add Supplier</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editSupplier && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Supplier</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Name *</Label><Input value={editSupplier.name} onChange={e => setEditSupplier({...editSupplier, name: e.target.value})} /></div>
              <div><Label>Phone *</Label><Input value={editSupplier.phone} onChange={e => setEditSupplier({...editSupplier, phone: e.target.value})} /></div>
              <div><Label>Email</Label><Input value={editSupplier.email} onChange={e => setEditSupplier({...editSupplier, email: e.target.value})} /></div>
              <div><Label>Address</Label><Input value={editSupplier.address} onChange={e => setEditSupplier({...editSupplier, address: e.target.value})} /></div>
              <div><Label>Amount Owed</Label><Input type="number" value={editSupplier.amountOwed} onChange={e => setEditSupplier({...editSupplier, amountOwed: Number(e.target.value)})} /></div>
              <div><Label>Notes</Label><Textarea value={editSupplier.notes} onChange={e => setEditSupplier({...editSupplier, notes: e.target.value})} /></div>
              <Button className="w-full" onClick={handleUpdateSupplier}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Supplier</Label>
              <p className="font-semibold">{selectedSupplier?.name}</p>
            </div>
            <div>
              <Label>Current Balance</Label>
              <p className="text-2xl font-bold text-accent">
                {formatCurrency(selectedSupplier?.amountOwed || 0)}
              </p>
            </div>
            <div>
              <Label>Payment Amount</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0"
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