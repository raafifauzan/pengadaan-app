import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Pengajuan from "./pages/Pengajuan";
import FormEvaluasi from "./pages/FormEvaluasi";
import FormApproval from "./pages/FormApproval";
import Tracking from "./pages/Tracking";
import Pengadaan from "./pages/Pengadaan";
import KonfirmasiPembayaran from "./pages/KonfirmasiPembayaran";
import ProcurementMapping from "./pages/ProcurementMapping";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex">
          <Sidebar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tracking" element={<Tracking />} />
              <Route path="/mapping" element={<ProcurementMapping />} />
              <Route path="/pengajuan" element={<Pengajuan />} />
              <Route path="/evaluasi" element={<FormEvaluasi />} />
              <Route path="/evaluasi/progres" element={<FormApproval />} />
              <Route path="/pengadaan" element={<Pengadaan />} />
              <Route path="/konfirmasi-pembayaran" element={<KonfirmasiPembayaran />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
