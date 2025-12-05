import { useParams, useNavigate } from 'react-router-dom';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { DataTable } from '@/components/ui/DataTable';
import { mockProducts, formatCurrency, formatDate, PriceHistoryEntry } from '@/lib/mockData';
import { ArrowLeft, Edit, Package, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = mockProducts.find((p) => p.id === id);
  const [isQuantityDialogOpen, setIsQuantityDialogOpen] = useState(false);
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  const [quantityChange, setQuantityChange] = useState({ amount: '', reason: '' });
  const [newPrice, setNewPrice] = useState('');

  if (!product) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Product not found</p>
          <Button variant="link" onClick={() => navigate('/inventory')}>
            Return to Inventory
          </Button>
        </div>
      </AppLayout>
    );
  }

  const priceHistoryColumns = [
    {
      header: 'Date',
      accessor: (item: PriceHistoryEntry) => formatDate(item.date),
    },
    {
      header: 'Old Price',
      accessor: (item: PriceHistoryEntry) => formatCurrency(item.oldPrice),
    },
    {
      header: 'New Price',
      accessor: (item: PriceHistoryEntry) => (
        <span className="font-semibold text-primary">
          {formatCurrency(item.newPrice)}
        </span>
      ),
    },
    {
      header: 'Change',
      accessor: (item: PriceHistoryEntry) => {
        const change = ((item.newPrice - item.oldPrice) / item.oldPrice) * 100;
        return (
          <span
            className={`status-badge ${
              change > 0 ? 'status-success' : 'status-danger'
            }`}
          >
            {change > 0 ? '+' : ''}
            {change.toFixed(1)}%
          </span>
        );
      },
    },
  ];

  const handleQuantityUpdate = () => {
    if (!quantityChange.amount || !quantityChange.reason) {
      toast.error('Please fill in all fields');
      return;
    }
    toast.success('Quantity updated successfully!');
    setIsQuantityDialogOpen(false);
    setQuantityChange({ amount: '', reason: '' });
  };

  const handlePriceUpdate = () => {
    if (!newPrice) {
      toast.error('Please enter a new price');
      return;
    }
    toast.success('Price updated successfully!');
    setIsPriceDialogOpen(false);
    setNewPrice('');
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/inventory')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Inventory
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-muted rounded-xl">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h1 className="page-title">{product.name}</h1>
              <p className="text-muted-foreground">
                SKU: {product.sku} • {product.category}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Dialog open={isQuantityDialogOpen} onOpenChange={setIsQuantityDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Update Quantity
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display">Update Stock Quantity</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label className="input-label">Current Quantity</Label>
                    <p className="text-2xl font-bold font-display">{product.quantity} units</p>
                  </div>
                  <div>
                    <Label className="input-label">Quantity Change (+/-)</Label>
                    <Input
                      type="number"
                      value={quantityChange.amount}
                      onChange={(e) =>
                        setQuantityChange({ ...quantityChange, amount: e.target.value })
                      }
                      placeholder="Enter positive or negative number"
                    />
                  </div>
                  <div>
                    <Label className="input-label">Reason for Change</Label>
                    <Textarea
                      value={quantityChange.reason}
                      onChange={(e) =>
                        setQuantityChange({ ...quantityChange, reason: e.target.value })
                      }
                      placeholder="e.g., Stock replenishment, damaged goods, etc."
                    />
                  </div>
                  <Button className="w-full" onClick={handleQuantityUpdate}>
                    Update Quantity
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isPriceDialogOpen} onOpenChange={setIsPriceDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Change Price
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display">Update Product Price</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label className="input-label">Current Price</Label>
                    <p className="text-2xl font-bold font-display text-primary">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                  <div>
                    <Label className="input-label">New Price (PKR)</Label>
                    <Input
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder="Enter new price"
                    />
                  </div>
                  <Button className="w-full" onClick={handlePriceUpdate}>
                    Update Price
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="metric-card">
          <p className="text-sm text-muted-foreground">Current Stock</p>
          <p className="text-3xl font-bold font-display mt-2">{product.quantity}</p>
          <p className="text-sm text-muted-foreground mt-1">units available</p>
        </div>
        <div className="metric-card before:bg-success">
          <p className="text-sm text-muted-foreground">Current Price</p>
          <p className="text-3xl font-bold font-display mt-2 text-primary">
            {formatCurrency(product.price)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">per unit</p>
        </div>
        <div className="metric-card before:bg-accent">
          <p className="text-sm text-muted-foreground">Total Value</p>
          <p className="text-3xl font-bold font-display mt-2">
            {formatCurrency(product.price * product.quantity)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">inventory value</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="font-display font-semibold text-xl mb-4">Price History</h2>
        <DataTable
          columns={priceHistoryColumns}
          data={product.priceHistory}
          emptyMessage="No price changes recorded"
          keyAccessor={(_, idx) => String(idx)}
        />
      </div>
    </AppLayout>
  );
};

export default ProductDetail;
