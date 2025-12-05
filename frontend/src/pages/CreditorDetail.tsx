import { useParams, useNavigate } from 'react-router-dom';
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
import {
  mockCreditors,
  formatCurrency,
  formatDate,
  CreditorTransaction,
} from '@/lib/mockData';
import { ArrowLeft, Users, DollarSign, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const CreditorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const creditor = mockCreditors.find((c) => c.id === id);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  if (!creditor) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Creditor not found</p>
          <Button variant="link" onClick={() => navigate('/creditors')}>
            Return to Creditors
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

  const handleRecordPayment = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }
    toast.success('Payment recorded successfully!');
    setIsPaymentDialogOpen(false);
    setPaymentAmount('');
  };

  const totalCredits = creditor.transactions
    .filter((t) => t.type === 'credit_sale')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPayments = creditor.transactions
    .filter((t) => t.type === 'payment')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/creditors')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Creditors
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
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
              <Button>
                <DollarSign className="w-4 h-4 mr-2" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Record Payment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label className="input-label">Current Balance</Label>
                  <p className="text-2xl font-bold font-display text-warning">
                    {formatCurrency(creditor.totalOutstanding)}
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
        </div>
      </div>

      {/* Creditor Details Card */}
      {(creditor.address || creditor.email || creditor.notes) && (
        <div className="card mb-8 p-6">
          <h2 className="font-display font-semibold text-lg mb-4">Contact Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {creditor.address && (
              <div>
                <p className="text-muted-foreground">Address</p>
                <p className="font-medium">{creditor.address}</p>
              </div>
            )}
            {creditor.email && (
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{creditor.email}</p>
              </div>
            )}
            {creditor.notes && (
              <div className="md:col-span-2">
                <p className="text-muted-foreground">Notes</p>
                <p className="font-medium">{creditor.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Account Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="metric-card before:bg-warning">
          <p className="text-sm text-muted-foreground">Outstanding Balance</p>
          <p className="text-3xl font-bold font-display mt-2 text-warning">
            {formatCurrency(creditor.totalOutstanding)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">currently owed</p>
        </div>
        <div className="metric-card before:bg-destructive">
          <p className="text-sm text-muted-foreground">Total Credit Sales</p>
          <p className="text-3xl font-bold font-display mt-2">
            {formatCurrency(totalCredits)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">all time</p>
        </div>
        <div className="metric-card before:bg-success">
          <p className="text-sm text-muted-foreground">Total Payments</p>
          <p className="text-3xl font-bold font-display mt-2 text-success">
            {formatCurrency(totalPayments)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">received</p>
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <h2 className="font-display font-semibold text-xl mb-4">Transaction History</h2>
        <DataTable
          columns={transactionColumns}
          data={creditor.transactions}
          emptyMessage="No transactions recorded"
        />
      </div>
    </AppLayout>
  );
};

export default CreditorDetail;
