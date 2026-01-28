// src/pages/CreditorDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DataTable } from '@/components/ui/DataTable';
import { ArrowLeft, Users, DollarSign, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
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
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  transactions: CreditorTransaction[];
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const CreditorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [creditor, setCreditor] = useState<Creditor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

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

  // Fetch creditor detail
  useEffect(() => {
    const fetchCreditor = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/creditors/${id}`);
        if (!res.ok) throw new Error('Creditor not found');
        const data: Creditor = await res.json();
        setCreditor(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load creditor';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchCreditor();
  }, [id]);

  // Record payment
  const handleRecordPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!creditor) return;

    try {
      const res = await fetch(`${API_URL}/creditors/${id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      if (!res.ok) throw new Error('Failed to record payment');

      toast.success(`Payment of ${formatCurrency(amount)} recorded!`);

      // Refresh creditor data
      const updatedRes = await fetch(`${API_URL}/creditors/${id}`);
      const updatedCreditor: Creditor = await updatedRes.json();
      setCreditor(updatedCreditor);

      setPaymentAmount('');
      setIsPaymentDialogOpen(false);
    } catch (err) {
      toast.error('Payment failed. Try again.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-xl text-muted-foreground">Loading creditor details...</p>
        </div>
      </AppLayout>
    );
  }

  // Error / Not found
  if (error || !creditor) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-destructive text-lg mb-4">
            {error || 'Creditor not found'}
          </p>
          <Button variant="outline" onClick={() => navigate('/creditors')}>
            ← Back to Creditors
          </Button>
        </div>
      </AppLayout>
    );
  }

  const transactionColumns = [
    {
      header: 'Date',
      accessor: (item: CreditorTransaction) => formatDate(item.date),
    },
    {
      header: 'Type',
      accessor: (item: CreditorTransaction) => (
        <div className="flex items-center gap-2">
          {item.type === 'credit_sale' ? (
            <>
              <ArrowUpRight className="w-4 h-4 text-destructive" />
              <span className="status-badge status-warning">Credit Sale</span>
            </>
          ) : (
            <>
              <ArrowDownLeft className="w-4 h-4 text-success" />
              <span className="status-badge status-success">Payment</span>
            </>
          )}
        </div>
      ),
    },
    {
      header: 'Description',
      accessor: 'description' as keyof CreditorTransaction,
    },
    {
      header: 'Amount',
      accessor: (item: CreditorTransaction) => (
        <span
          className={`font-semibold ${
            item.type === 'payment' ? 'text-success' : 'text-foreground'
          }`}
        >
          {item.type === 'payment' ? '-' : '+'}
          {formatCurrency(item.amount)}
        </span>
      ),
    },
  ];

  const totalCredits = creditor.transactions
    .filter(t => t.type === 'credit_sale')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPayments = creditor.transactions
    .filter(t => t.type === 'payment')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate('/creditors')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Creditors
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-muted rounded-xl">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h1 className="page-title">{creditor.name}</h1>
              <p className="text-muted-foreground">{creditor.phone}</p>
              {creditor.cnic && (
                <p className="text-sm text-muted-foreground">CNIC: {creditor.cnic}</p>
              )}
            </div>
          </div>

          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <DollarSign className="w-5 h-5 mr-2" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Payment from {creditor.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Current Outstanding</Label>
                  <p className="text-2xl font-bold text-warning">
                    {formatCurrency(creditor.totalOutstanding)}
                  </p>
                </div>
                <div>
                  <Label>Payment Amount (PKR)</Label>
                  <Input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0"
                    min="1"
                  />
                </div>
                <Button className="w-full" onClick={handleRecordPayment}>
                  Confirm Payment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Contact Info */}
      {(creditor.address || creditor.email || creditor.notes) && (
        <div className="bg-card rounded-xl border p-6 mb-8">
          <h2 className="font-semibold text-lg mb-4">Contact Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {creditor.address && (
              <div>
                <p className="text-muted-foreground text-sm">Address</p>
                <p className="font-medium">{creditor.address}</p>
              </div>
            )}
            {creditor.email && (
              <div>
                <p className="text-muted-foreground text-sm">Email</p>
                <p className="font-medium">{creditor.email}</p>
              </div>
            )}
            {creditor.notes && (
              <div className="md:col-span-2">
                <p className="text-muted-foreground text-sm">Notes</p>
                <p className="font-medium">{creditor.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="metric-card before:bg-warning">
          <p className="text-sm text-muted-foreground">Outstanding Balance</p>
          <p className="text-3xl font-bold mt-2 text-warning">
            {formatCurrency(creditor.totalOutstanding)}
          </p>
        </div>
        <div className="metric-card before:bg-destructive">
          <p className="text-sm text-muted-foreground">Total Credit Sales</p>
          <p className="text-3xl font-bold mt-2">
            {formatCurrency(totalCredits)}
          </p>
        </div>
        <div className="metric-card before:bg-success">
          <p className="text-sm text-muted-foreground">Total Payments Received</p>
          <p className="text-3xl font-bold mt-2 text-success">
            {formatCurrency(totalPayments)}
          </p>
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <h2 className="font-display font-semibold text-xl mb-4">Transaction History</h2>
        <DataTable
          columns={transactionColumns}
          data={creditor.transactions}
          emptyMessage="No transactions yet"
        />
      </div>
    </AppLayout>
  );
};

export default CreditorDetail;