import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { mockProducts, mockCreditors, formatCurrency, Product, Sale } from '@/lib/mockData';
import { generateReceipt, generateInvoice } from '@/lib/receiptGenerator';
import { Search, Plus, Trash2, ShoppingCart, Printer, FileText, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CartItem {
  product: Product;
  quantity: number;
}

const NewSale = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentType, setPaymentType] = useState<'cash' | 'credit'>('cash');
  const [selectedCreditor, setSelectedCreditor] = useState<string>('');
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  const filteredProducts = mockProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) {
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

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(
      cart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleSubmit = () => {
    if (cart.length === 0) {
      toast.error('Please add items to the cart');
      return;
    }
    if (paymentType === 'credit' && !selectedCreditor) {
      toast.error('Please select a creditor for credit sales');
      return;
    }
    
    // Create the sale object
    const sale: Sale = {
      id: `s${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      items: cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.price,
        total: item.product.price * item.quantity,
      })),
      total,
      paymentType,
      creditorId: paymentType === 'credit' ? selectedCreditor : undefined,
    };
    
    setCompletedSale(sale);
    setShowReceiptDialog(true);
    toast.success('Sale completed successfully!');
    setCart([]);
    setPaymentType('cash');
    setSelectedCreditor('');
  };

  const handlePrintReceipt = () => {
    if (completedSale) {
      generateReceipt({ sale: completedSale });
      toast.success('Receipt downloaded!');
    }
  };

  const handlePrintInvoice = () => {
    if (completedSale) {
      generateInvoice({ sale: completedSale });
      toast.success('Invoice downloaded!');
    }
  };

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">New Sale</h1>
        <p className="page-subtitle">Create a new sales transaction</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Product Search & Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search */}
          <div className="bg-card rounded-xl border border-border p-6">
            <Label className="input-label">Search Products</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchTerm && (
              <div className="mt-4 border border-border rounded-lg max-h-64 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <p className="p-4 text-center text-muted-foreground">
                    No products found
                  </p>
                ) : (
                  filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0"
                    >
                      <div className="text-left">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          SKU: {product.sku} • Stock: {product.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">
                          {formatCurrency(product.price)}
                        </span>
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
              Cart Items
            </h2>
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No items in cart. Search and add products above.
              </p>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.product.price)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                        >
                          -
                        </Button>
                        <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
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
                        className="text-destructive hover:text-destructive"
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

        {/* Payment Summary */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 sticky top-6">
            <h2 className="font-display font-semibold text-lg mb-6">
              Payment Details
            </h2>

            {/* Payment Type */}
            <div className="mb-6">
              <Label className="input-label">Payment Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={paymentType === 'cash' ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => setPaymentType('cash')}
                >
                  Cash
                </Button>
                <Button
                  variant={paymentType === 'credit' ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => setPaymentType('credit')}
                >
                  Credit
                </Button>
              </div>
            </div>

            {/* Creditor Selection */}
            {paymentType === 'credit' && (
              <div className="mb-6 animate-fade-in">
                <Label className="input-label">Select Creditor *</Label>
                <Select
                  value={selectedCreditor}
                  onValueChange={setSelectedCreditor}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a creditor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCreditors.map((creditor) => (
                      <SelectItem key={creditor.id} value={creditor.id}>
                        {creditor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Total */}
            <div className="border-t border-border pt-6 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold font-display text-primary">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {/* Submit */}
            <Button
              className="w-full"
              size="lg"
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
            <DialogTitle className="font-display flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              Sale Complete!
            </DialogTitle>
            <DialogDescription>
              Would you like to print a receipt or invoice for this transaction?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {completedSale && (
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Transaction Total</p>
                <p className="text-2xl font-bold font-display text-primary">
                  {formatCurrency(completedSale.total)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {completedSale.items.length} item(s) • {completedSale.paymentType === 'cash' ? 'Cash' : 'Credit'}
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={handlePrintReceipt}>
                <Printer className="w-4 h-4 mr-2" />
                Receipt (Thermal)
              </Button>
              <Button variant="outline" onClick={handlePrintInvoice}>
                <FileText className="w-4 h-4 mr-2" />
                Invoice (A4)
              </Button>
            </div>
            <Button 
              className="w-full" 
              onClick={() => setShowReceiptDialog(false)}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default NewSale;
