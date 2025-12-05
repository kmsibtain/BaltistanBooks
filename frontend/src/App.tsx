import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import NewSale from "./pages/NewSale";
import SalesHistory from "./pages/SalesHistory";
import Inventory from "./pages/Inventory";
import ProductDetail from "./pages/ProductDetail";
import Creditors from "./pages/Creditors";
import CreditorDetail from "./pages/CreditorDetail";
import SuppliersReports from "./pages/SuppliersReports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sales/new" element={<NewSale />} />
          <Route path="/sales/history" element={<SalesHistory />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/:id" element={<ProductDetail />} />
          <Route path="/creditors" element={<Creditors />} />
          <Route path="/creditors/:id" element={<CreditorDetail />} />
          <Route path="/suppliers/reports" element={<SuppliersReports />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
