import { AlertTriangle, Package } from 'lucide-react';
import { mockProducts, formatCurrency, Product } from '@/lib/mockData';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface LowStockAlertProps {
  threshold?: number;
  showAll?: boolean;
}

export const LowStockAlert = ({ threshold = 10, showAll = false }: LowStockAlertProps) => {
  const navigate = useNavigate();
  
  const lowStockProducts = mockProducts.filter(p => p.quantity <= threshold);
  const criticalProducts = lowStockProducts.filter(p => p.quantity <= 5);
  const warningProducts = lowStockProducts.filter(p => p.quantity > 5);

  const displayProducts = showAll ? lowStockProducts : lowStockProducts.slice(0, 5);

  if (lowStockProducts.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-lg">Stock Status</h2>
        </div>
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <span>All products are well stocked</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h2 className="font-display font-semibold text-lg">Low Stock Alerts</h2>
          <Badge variant="secondary" className="ml-2">
            {lowStockProducts.length} items
          </Badge>
        </div>
        {!showAll && lowStockProducts.length > 5 && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/inventory?filter=low-stock')}
          >
            View All
          </Button>
        )}
      </div>

      {/* Summary badges */}
      <div className="flex gap-2 mb-4">
        {criticalProducts.length > 0 && (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="w-3 h-3" />
            {criticalProducts.length} Critical (≤5)
          </Badge>
        )}
        {warningProducts.length > 0 && (
          <Badge variant="outline" className="gap-1 border-amber-500 text-amber-600">
            {warningProducts.length} Warning (≤{threshold})
          </Badge>
        )}
      </div>

      {/* Product list */}
      <div className="space-y-3">
        {displayProducts.map((product) => (
          <LowStockItem 
            key={product.id} 
            product={product} 
            onClick={() => navigate(`/inventory/${product.id}`)}
          />
        ))}
      </div>
    </div>
  );
};

interface LowStockItemProps {
  product: Product;
  onClick: () => void;
}

const LowStockItem = ({ product, onClick }: LowStockItemProps) => {
  const isCritical = product.quantity <= 5;
  
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left"
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{product.name}</p>
        <p className="text-sm text-muted-foreground">
          SKU: {product.sku} • {formatCurrency(product.price)}
        </p>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <Badge 
          variant={isCritical ? "destructive" : "outline"}
          className={!isCritical ? "border-amber-500 text-amber-600" : ""}
        >
          {product.quantity} left
        </Badge>
      </div>
    </button>
  );
};

export default LowStockAlert;
