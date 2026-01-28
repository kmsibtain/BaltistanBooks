// src/pages/ProductDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
import { ArrowLeft, Edit, Package, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

// Types
interface PriceHistoryEntry {
  date: string;
  oldPrice: number;
  newPrice: number;
}

interface QuantityHistoryEntry {
  date: string;
  change: number;
  reason: string;
  newQuantity: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  category: string;
  priceHistory: PriceHistoryEntry[];
  quantityHistory: QuantityHistoryEntry[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isQuantityDialogOpen, setIsQuantityDialogOpen] = useState(false);
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  const [quantityChange, setQuantityChange] = useState({ amount: '', reason: '' });
  const [newPrice, setNewPrice] = useState('');

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

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        const data: Product = await res.json();
        setProduct(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load product';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Update quantity
  const handleQuantityUpdate = async () => {
    const amount = parseInt(quantityChange.amount);
    if (isNaN(amount) || amount === 0) {
      toast.error('Please enter a valid number');
      return;
    }
    if (!quantityChange.reason.trim()) {
      toast.error('Reason is required');
      return;
      return;
    }

    try {
      const res = await fetch(`${API_URL}/products/${id}/quantity`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          reason: quantityChange.reason.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to update quantity');

      // Refresh product
      const updatedRes = await fetch(`${API_URL}/products/${id}`);
      const updatedProduct: Product = await updatedRes.json();
      setProduct(updatedProduct);

      toast.success('Stock updated successfully!');
      setIsQuantityDialogOpen(false);
      setQuantityChange({ amount: '', reason: '' });
    } catch (err) {
      toast.error('Failed to update stock');
    }
  };

  // Update price
  const handlePriceUpdate = async () => {
    const price = parseFloat(newPrice);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/products/${id}/price`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPrice: price }),
      });

      if (!res.ok) throw new Error('Failed to update price');

      // Refresh product
      const updatedRes = await fetch(`${API_URL}/products/${id}`);
      const updatedProduct: Product = await updatedRes.json();
      setProduct(updatedProduct);

      toast.success('Price updated successfully!');
      setIsPriceDialogOpen(false);
      setNewPrice('');
    } catch (err) {
      toast.error('Failed to update price');
    }
  };

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
          <span className={`status-badge ${change > 0 ? 'status-success' : 'status-danger'}`}>
            {change > 0 ? '+' : ''}{change.toFixed(1)}%
          </span>
        );
      },
    },
  ];

  // Loading
  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-xl text-muted-foreground">Loading product...</p>
        </div>
      </AppLayout>
    );
  }

  // Error / Not found
  if (error || !product) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-destructive text-lg mb-4">
            {error || 'Product not found'}
          </p>
          <Button variant="outline" onClick={() => navigate('/inventory')}>
            ← Back to Inventory
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate('/inventory')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Inventory
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
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
                  Update Stock
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Stock Quantity</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Current Stock</Label>
                    <p className="text-2xl font-bold">{product.quantity} units</p>
                  </div>
                  <div>
                    <Label>Change Amount (+/-)</Label>
                    <Input
                      type="number"
                      value={quantityChange.amount}
                      onChange={(e) => setQuantityChange({ ...quantityChange, amount: e.target.value })}
                      placeholder="e.g. +10 or -5"
                    />
                  </div>
                  <div>
                    <Label>Reason</Label>
                    <Textarea
                      value={quantityChange.reason}
                      onChange={(e) => setQuantityChange({ ...quantityChange, reason: e.target.value })}
                      placeholder="Stock received, damaged, etc."
                    />
                  </div>
                  <Button className="w-full" onClick={handleQuantityUpdate}>
                    Update Stock
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
                  <DialogTitle>Update Product Price</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Current Price</Label>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                  <div>
                    <Label>New Price (PKR)</Label>
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
          <p className="text-3xl font-bold mt-2">{product.quantity}</p>
          <p className="text-sm text-muted-foreground mt-1">units available</p>
        </div>
        <div className="metric-card before:bg-success">
          <p className="text-sm text-muted-foreground">Current Price</p>
          <p className="text-3xl font-bold mt-2 text-primary">
            {formatCurrency(product.price)}
          </p>
        </div>
        <div className="metric-card before:bg-accent">
          <p className="text-sm text-muted-foreground">Total Value</p>
          <p className="text-3xl font-bold mt-2">
            {formatCurrency(product.price * product.quantity)}
          </p>
        </div>
      </div>

      {/* Price History */}
      <div>
        <h2 className="font-display font-semibold text-xl mb-4">Price History</h2>
        <DataTable
          columns={priceHistoryColumns}
          data={product.priceHistory || []}
          emptyMessage="No price changes recorded"
          keyAccessor={(_, i) => i.toString()}
        />
      </div>
    </AppLayout>
  );
};

export default ProductDetail;