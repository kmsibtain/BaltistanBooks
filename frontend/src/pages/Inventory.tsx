// src/pages/Inventory.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DataTable } from '@/components/ui/DataTable';
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
import { ExportButton } from '@/components/ExportButton';
import { Plus, Search, Package, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import * as XLSX from 'xlsx';

// Types
interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  costPrice?: number;
  category: string;
  createdAt?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Inventory = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    quantity: '0',
    price: '',
    costPrice: '',
    category: '',
  });

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/products`);
      if (!res.ok) throw new Error('Failed to load products');
      const data: Product[] = await res.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error';
      setError(msg);
      toast.error('Could not load inventory');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
  }, []);

  // Client-side search
  useEffect(() => {
    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // Add new product
  const handleAddProduct = async () => {
    if (!newProduct.name.trim() || !newProduct.sku.trim() || !newProduct.price) {
      toast.error('Name, SKU, and price are required');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProduct.name.trim(),
          sku: newProduct.sku.trim().toUpperCase(),
          price: Number(newProduct.price),
          costPrice: Number(newProduct.costPrice) || 0,
          quantity: Number(newProduct.quantity) || 0,
          category: newProduct.category.trim() || 'General',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to add product');
      }

      const addedProduct: Product = await res.json();

      setProducts(prev => [...prev, addedProduct]);
      toast.success(`${addedProduct.name} added to inventory!`);

      setIsAddDialogOpen(false);
      setNewProduct({ name: '', sku: '', quantity: '0', price: '', costPrice: '', category: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add product');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        // Map keys to expected format (case insensitive approximation)
        const productsToImport = data.map((row: any) => ({
          name: row['Name'] || row['name'] || row['Product Name'],
          sku: row['SKU'] || row['sku'] || row['Code'],
          quantity: row['Quantity'] || row['quantity'] || row['Stock'] || 0,
          price: row['Price'] || row['price'] || row['Selling Price'] || 0,
          costPrice: row['Cost Price'] || row['costPrice'] || row['Buying Price'] || 0,
          category: row['Category'] || row['category'] || 'General'
        })).filter((p: any) => p.name && p.sku && p.price);

        if (productsToImport.length === 0) {
          toast.error('No valid products found in file');
          return;
        }

        if (confirm(`Found ${productsToImport.length} products. Import them now?`)) {
          const res = await fetch(`${API_URL}/products/import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ products: productsToImport }),
          });

          if (!res.ok) throw new Error('Import failed');

          const result = await res.json();
          toast.success(result.message);
          fetchProducts(); // Refresh list
        }

      } catch (error) {
        console.error(error);
        toast.error('Failed to parse file');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const columns = [
    {
      header: 'Product',
      accessor: (item: Product) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded-lg">
            <Package className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-muted-foreground">{item.category}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'SKU',
      accessor: 'sku' as keyof Product,
      className: 'font-mono text-sm',
    },
    {
      header: 'Stock',
      accessor: (item: Product) => (
        <span
          className={`status-badge ${item.quantity > 20
              ? 'status-success'
              : item.quantity > 5
                ? 'status-warning'
                : 'status-danger'
            }`}
        >
          {item.quantity} units
        </span>
      ),
    },
    {
      header: 'Price',
      accessor: (item: Product) => (
        <div className="flex flex-col">
          <span className="font-semibold">{formatCurrency(item.price)}</span>
          {isAdmin && item.costPrice && item.costPrice > 0 && (
            <span className="text-xs text-muted-foreground">Cost: {formatCurrency(item.costPrice)}</span>
          )}
        </div>
      ),
    },
  ];

  // Loading state
  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-xl text-muted-foreground">Loading inventory...</p>
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
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">Manage your product catalog</p>
        </div>

        <div className="flex gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx,.xls,.csv"
            className="hidden"
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>

          <ExportButton
            data={filteredProducts.map(p => ({
              Name: p.name,
              SKU: p.sku,
              Category: p.category,
              Stock: p.quantity,
              Price: p.price,
              Cost: p.costPrice
            }))}
            filename="inventory-report"
          />

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Add New Product</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Product Name *</Label>
                  <Input
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="e.g. Oxford English Dictionary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>SKU *</Label>
                    <Input
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                      placeholder="PRD-001"
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Input
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      placeholder="Books, Stationery..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Initial Quantity</Label>
                    <Input
                      type="number"
                      value={newProduct.quantity}
                      onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Selling Price *</Label>
                    <Input
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      placeholder="2500"
                    />
                  </div>
                </div>
                <div>
                  <Label>Cost Price (Optional)</Label>
                  <Input
                    type="number"
                    value={newProduct.costPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, costPrice: e.target.value })}
                    placeholder="2000"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Needed for Profit/Loss calculations</p>
                </div>
                <Button className="w-full" onClick={handleAddProduct}>
                  Add Product
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by name, SKU, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Products Table */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        onRowClick={(product) => navigate(`/inventory/${product.id}`)}
        emptyMessage="No products found"
      />
    </AppLayout>
  );
};

export default Inventory;