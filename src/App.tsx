import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import C2BTransactions from "./pages/C2BTransactions";
import B2CTransactions from "./pages/B2CTransactions";
import B2BTransactions from "./pages/B2BTransactions";
import RatibaSubscriptions from "./pages/RatibaSubscriptions";
import Customers from "./pages/Customers";
import Reconciliation from "./pages/Reconciliation";
import AuditLogs from "./pages/AuditLogs";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/c2b" element={<MainLayout><C2BTransactions /></MainLayout>} />
          <Route path="/b2c" element={<MainLayout><B2CTransactions /></MainLayout>} />
          <Route path="/b2b" element={<MainLayout><B2BTransactions /></MainLayout>} />
          <Route path="/ratiba" element={<MainLayout><RatibaSubscriptions /></MainLayout>} />
          <Route path="/customers" element={<MainLayout><Customers /></MainLayout>} />
          <Route path="/reconciliation" element={<MainLayout><Reconciliation /></MainLayout>} />
          <Route path="/audit" element={<MainLayout><AuditLogs /></MainLayout>} />
          <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
