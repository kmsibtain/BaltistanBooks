import { useState, useEffect } from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Product {
  id: string;
  name: string;
  quantity: number;
  sku: string;
}

export const LowStockAlert = ({ threshold = 5 }: { threshold?: number }) => {
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/products`);
        if (!res.ok) return;
        const data: Product[] = await res.json();

        // Filter low stock
        const low = data.filter(p => p.quantity <= threshold);
        setLowStockProducts(low);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [threshold]);

  if (loading) return <div className="animate-pulse bg-muted h-32 rounded-xl"></div>;

  if (lowStockProducts.length === 0) return (
    <div className="bg-card rounded-xl border border-border p-6 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
        <AlertTriangle className="w-6 h-6 text-success" />
      </div>
      <p className="font-medium">Everything looks good!</p>
      <p className="text-sm text-muted-foreground">No low stock items found.</p>
    </div>
  );

  return (
    <div className="bg-card rounded-xl border border-destructive/20 overflow-hidden">
      <div className="p-4 border-b border-destructive/10 bg-destructive/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-destructive font-medium">
          <AlertTriangle className="w-5 h-5" />
          <h3>Low Stock Alerts ({lowStockProducts.length})</h3>
        </div>
        <Link to="/inventory" className="text-xs text-muted-foreground hover:text-primary flex items-center">
          View All <ChevronRight className="w-3 h-3 ml-1" />
        </Link>
      </div>

      <div className="divide-y divide-border">
        {lowStockProducts.slice(0, 5).map(product => (
          <div key={product.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition">
            <div>
              <p className="font-medium text-sm">{product.name}</p>
              <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
            </div>
            <span className="bg-destructive/10 text-destructive text-xs font-semibold px-2 py-1 rounded">
              {product.quantity} left
            </span>
          </div>
        ))}
        {lowStockProducts.length > 5 && (
          <div className="p-3 text-center bg-muted/20">
            <Link to="/inventory" className="text-sm text-muted-foreground hover:text-primary">
              + {lowStockProducts.length - 5} more items
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
