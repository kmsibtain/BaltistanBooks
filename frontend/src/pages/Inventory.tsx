import { useState } from 'react';
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
import { mockProducts, formatCurrency, Product } from '@/lib/mockData';
import { formatInventoryForExport } from '@/lib/exportUtils';
import { ExportButton } from '@/components/ExportButton';
import { Plus, Search, Package } from 'lucide-react';
import { toast } from 'sonner';

const Inventory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    quantity: '',
    price: '',
    category: '',
  });

  const filteredProducts = mockProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          className={`status-badge ${
            item.quantity > 20
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
        <span className="font-semibold">{formatCurrency(item.price)}</span>
      ),
    },
  ];

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.sku || !newProduct.price) {
      toast.error('Please fill in all required fields');
      return;
    }
    toast.success('Product added successfully!');
    setIsAddDialogOpen(false);
    setNewProduct({ name: '', sku: '', quantity: '', price: '', category: '' });
  };

  return (
    <AppLayout>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">Manage your product catalog</p>
        </div>
        <div className="flex gap-3">
          <ExportButton 
            data={formatInventoryForExport(filteredProducts)} 
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
                <Label className="input-label">Product Name *</Label>
                <Input
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  placeholder="Enter product name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="input-label">SKU *</Label>
                  <Input
                    value={newProduct.sku}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, sku: e.target.value })
                    }
                    placeholder="PRD-001"
                  />
                </div>
                <div>
                  <Label className="input-label">Category</Label>
                  <Input
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                    placeholder="Books"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="input-label">Initial Quantity</Label>
                  <Input
                    type="number"
                    value={newProduct.quantity}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, quantity: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label className="input-label">Price (PKR) *</Label>
                  <Input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
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
            placeholder="Search products..."
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
