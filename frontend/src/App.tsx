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
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import AuditLogs from "./pages/AuditLogs";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/layout/PrivateRoute";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sales/new" element={<NewSale />} />
              <Route path="/sales/history" element={<SalesHistory />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/inventory/:id" element={<ProductDetail />} />
              <Route path="/creditors" element={<Creditors />} />
              <Route path="/creditors/:id" element={<CreditorDetail />} />
              <Route path="/suppliers/reports" element={<SuppliersReports />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/audit" element={<AuditLogs />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
