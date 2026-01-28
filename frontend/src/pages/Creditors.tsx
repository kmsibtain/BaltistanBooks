// src/pages/Creditors.tsx
import { useState, useEffect } from 'react';
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
import { ExportButton } from '@/components/ExportButton';
import { Search, Users, Plus } from 'lucide-react';
import { toast } from 'sonner';

// Types
interface CreditorTransaction {
  id: string;
  date: string;
  type: 'credit_sale' | 'payment';
  amount: number;
  description: string;
}
interface Creditor {
  id: string;
  name: string;
  phone: string;
  cnic?: string;
  address?: string;
  email?: string;
  notes?: string;
  totalOutstanding: number;
  lastPaymentDate?: string | null;
  lastPaymentAmount?: number | null;
  transactions: CreditorTransaction[];
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const Creditors = () => {
  const navigate = useNavigate();

  const [creditors, setCreditors] = useState<Creditor[]>([]);
  const [filteredCreditors, setFilteredCreditors] = useState<Creditor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCreditor, setNewCreditor] = useState({
    name: '',
    phone: '',
    cnic: '',
    address: '',
    email: '',
    notes: '',
  });

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

  // Fetch all creditors
  useEffect(() => {
    const fetchCreditors = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/creditors`);
        if (!res.ok) throw new Error('Failed to load creditors');
        const data: Creditor[] = await res.json();
        setCreditors(data);
        setFilteredCreditors(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Network error';
        setError(msg);
        toast.error('Could not load creditors');
      } finally {
        setLoading(false);
      }
    };

    fetchCreditors();
  }, []);

  // Client-side search
  useEffect(() => {
    const filtered = creditors.filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
    );
    setFilteredCreditors(filtered);
  }, [searchTerm, creditors]);

  // Add new creditor
  const handleAddCreditor = async () => {
    if (!newCreditor.name.trim() || !newCreditor.phone.trim()) {
      toast.error('Name and phone number are required');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/creditors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCreditor.name.trim(),
          phone: newCreditor.phone.trim(),
          cnic: newCreditor.cnic.trim() || undefined,
          address: newCreditor.address.trim() || undefined,
          email: newCreditor.email.trim() || undefined,
          notes: newCreditor.notes.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error('Failed to add creditor');

      const addedCreditor: Creditor = await res.json();

      setCreditors(prev => [...prev, addedCreditor]);
      toast.success(`${addedCreditor.name} added successfully`);
      
      setIsAddDialogOpen(false);
      setNewCreditor({ name: '', phone: '', cnic: '', address: '', email: '', notes: '' });
    } catch (err) {
      toast.error('Failed to add creditor');
    }
  };

  // Calculate stats
  const maxOutstanding = Math.max(...creditors.map(c => c.totalOutstanding), 0);
  const totalOutstanding = creditors.reduce((sum, c) => sum + c.totalOutstanding, 0);

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
          <span className={`font-semibold ${item.totalOutstanding === maxOutstanding ? 'text-destructive' : 'text-foreground'}`}>
            {formatCurrency(item.totalOutstanding)}
          </span>
          {item.totalOutstanding === maxOutstanding && item.totalOutstanding > 0 && (
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

  // Loading state
  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-xl text-muted-foreground">Loading creditors...</p>
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
                    id="email" type="email" value={newCreditor.email} onChange={(e) => setNewCreditor({ ...newCreditor, email: e.target.value })} />
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
            data={filteredCreditors.map(c => ({
              Name: c.name,
              Phone: c.phone,
              'Outstanding Balance': c.totalOutstanding,
              'Last Payment': c.lastPaymentDate || '—',
            }))}
            filename="creditors-ledger"
          />
        </div>
      </div>

      {/* Summary Card */}
      <div className="metric-card mb-6 max-w-md before:bg-warning">
        <p className="text-sm text-muted-foreground">Total Outstanding Credits</p>
        <p className="text-3xl font-bold font-display mt-2 text-warning">
          {formatCurrency(totalOutstanding)}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          across {creditors.length} creditor{creditors.length !== 1 ? 's' : ''}
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

      {/* Table */}
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