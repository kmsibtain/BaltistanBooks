// src/pages/NewSale.tsx
import { useState, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { generateReceipt, generateInvoice } from '@/lib/receiptGenerator';
import {
  Search,
  Plus,
  Trash2,
  ShoppingCart,
  Printer,
  FileText,
  CheckCircle,
  ScanBarcode,
} from 'lucide-react';
import { toast } from 'sonner';

// Types
interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  category: string;
}

interface Creditor {
  id: string;
  name: string;
  phone: string;
  totalOutstanding: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface SaleItemForReceipt {
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface CompletedSale {
  id: string;
  date: string;
  items: SaleItemForReceipt[];
  total: number;
  paymentType: 'cash' | 'credit';
  creditorId?: string | null;
  creditorName?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const NewSale = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentType, setPaymentType] = useState<'cash' | 'credit'>('cash');
  const [selectedCreditor, setSelectedCreditor] = useState<string>('');
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [completedSale, setCompletedSale] = useState<CompletedSale | null>(null);
  const [barcodeMode, setBarcodeMode] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [creditors, setCreditors] = useState<Creditor[]>([]);
  const [loading, setLoading] = useState(true);

  // Focus ref for barcode input
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Load products & creditors
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [prodRes, credRes] = await Promise.all([
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/creditors`),
        ]);

        if (!prodRes.ok) throw new Error('Failed to load products');
        if (!credRes.ok) throw new Error('Failed to load creditors');

        const prods: Product[] = await prodRes.json();
        const creds: Creditor[] = await credRes.json();

        setProducts(prods);
        setCreditors(creds);
      } catch (err) {
        toast.error('Failed to load data. Please refresh.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter products for search
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cart functions
  const addToCart = (product: Product) => {
    if (product.quantity <= 0) {
      toast.error(`Out of stock: ${product.name}`);
      // Clear search if in barcode mode to ready for next scan
      if (barcodeMode) setSearchTerm('');
      return;
    }

    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.quantity) {
        toast.error(`Only ${product.quantity} units available`);
        if (barcodeMode) setSearchTerm('');
        return;
      }
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    setSearchTerm('');
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (barcodeMode && e.key === 'Enter') {
      // In barcode mode, Enter means verify exact SKU (or fallback to first match)
      const exactMatch = products.find(p => p.sku === searchTerm || p.name === searchTerm); // simple check

      if (exactMatch) {
        addToCart(exactMatch);
      } else {
        // Try finding by inclusion if exact match fails, but usually barcode is exact
        const firstMatch = filteredProducts[0];
        if (firstMatch) {
          addToCart(firstMatch);
        } else {
          toast.error('Product not found');
          setSearchTerm('');
        }
      }
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const item = cart.find((i) => i.product.id === productId);
    if (item && quantity > item.product.quantity) {
      toast.error(`Only ${item.product.quantity} units in stock`);
      return;
    }
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(
      cart.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((i) => i.product.id !== productId));
  };

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Submit sale to backend
  const handleSubmit = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    if (paymentType === 'credit' && !selectedCreditor) {
      toast.error('Please select a creditor');
      return;
    }

    const saleData = {
      items: cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      total,
      paymentType,
      creditorId: paymentType === 'credit' ? selectedCreditor : null,
    };

    try {
      const res = await fetch(`${API_URL}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Sale failed');
      }

      const saleResult = await res.json();

      setCompletedSale({
        id: saleResult.id,
        date: saleResult.date,
        items: cart.map(item => ({
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.product.price,
          total: item.product.price * item.quantity,
        })),
        total,
        paymentType,
        creditorId: paymentType === 'credit' ? selectedCreditor : null,
        creditorName: paymentType === 'credit'
          ? creditors.find(c => c.id === selectedCreditor)?.name
          : undefined,
      });


      setShowReceiptDialog(true);
      toast.success('Sale completed & saved!');

      // Reset form
      setCart([]);
      setPaymentType('cash');
      setSelectedCreditor('');
    } catch (err) {
      console.error('Failed to complete sale:', err);
      toast.error(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      );
    }
  };

  const handlePrintReceipt = () => {
    if (completedSale) generateReceipt({ sale: completedSale });
  };

  const handlePrintInvoice = () => {
    if (completedSale) generateInvoice({ sale: completedSale });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-xl text-muted-foreground">Loading sale page...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">New Sale</h1>
          <p className="page-subtitle">Create a new sales transaction</p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="barcode-mode"
            checked={barcodeMode}
            onCheckedChange={(checked) => {
              setBarcodeMode(checked);
              if (checked) {
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }
            }}
          />
          <Label htmlFor="barcode-mode" className="flex items-center gap-2 cursor-pointer">
            <ScanBarcode className="w-4 h-4" />
            Barcode Mode
          </Label>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Search + Cart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search */}
          <div className="bg-card rounded-xl border border-border p-6">
            <Label>
              {barcodeMode ? 'Scan Barcode (SKU)' : 'Search Products'}
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder={barcodeMode ? "Scan barcode here..." : "Search by name or SKU..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="pl-10"
                autoFocus={barcodeMode}
              />
            </div>

            {/* In Barcode Mode, we probably don't want to show the huge list unless we are typing? 
                Actually showing it is fine, but the interaction model changes. 
            */}
            {searchTerm && !barcodeMode && (
              <div className="mt-4 border rounded-lg max-h-64 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <p className="p-4 text-center text-muted-foreground">No products found</p>
                ) : (
                  filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="w-full flex items-center justify-between p-4 hover:bg-muted/50 border-b last:border-b-0"
                    >
                      <div className="text-left">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          SKU: {product.sku} • Stock: {product.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{formatCurrency(product.price)}</span>
                        <Plus className="w-5 h-5 text-primary" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Cart ({cart.length} items)
            </h2>

            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                No items in cart
              </p>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.product.price)} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          −
                        </Button>
                        <span className="w-10 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <span className="w-24 text-right font-semibold">
                        {formatCurrency(item.product.price * item.quantity)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Payment */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 sticky top-6">
            <h2 className="font-display font-semibold text-lg mb-6">Payment Details</h2>

            {/* Payment Type */}
            <div className="mb-6">
              <Label>Payment Type</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <Button
                  variant={paymentType === 'cash' ? 'default' : 'outline'}
                  onClick={() => setPaymentType('cash')}
                  className="w-full"
                >
                  Cash
                </Button>
                <Button
                  variant={paymentType === 'credit' ? 'default' : 'outline'}
                  onClick={() => setPaymentType('credit')}
                  className="w-full"
                >
                  Credit
                </Button>
              </div>
            </div>

            {/* Creditor Select */}
            {paymentType === 'credit' && (
              <div className="mb-6">
                <Label>Select Customer *</Label>
                <Select value={selectedCreditor} onValueChange={setSelectedCreditor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {creditors.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Total */}
            <div className="border-t border-border pt-6">
              <div className="flex justify-between text-lg">
                <span>Total Amount</span>
                <span className="font-bold text-2xl text-primary">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full mt-6"
              onClick={handleSubmit}
              disabled={cart.length === 0}
            >
              Complete Sale
            </Button>
          </div>
        </div>
      </div>

      {/* Receipt Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-success" />
              Sale Completed!
            </DialogTitle>
            <DialogDescription>
              Transaction saved successfully.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-2xl font-bold text-primary text-center">
              {formatCurrency(total)}
            </p>
            <p className="text-center text-muted-foreground mt-2">
              {cart.length} item{cart.length !== 1 ? 's' : ''} • {paymentType === 'cash' ? 'Cash' : 'Credit'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={handlePrintReceipt}>
              <Printer className="w-4 h-4 mr-2" />
              Thermal Receipt
            </Button>
            <Button variant="outline" onClick={handlePrintInvoice}>
              <FileText className="w-4 h-4 mr-2" />
              A4 Invoice
            </Button>
          </div>
          <Button className="w-full mt-4" onClick={() => setShowReceiptDialog(false)}>
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default NewSale;