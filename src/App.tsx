import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Pengajuan from "./pages/Pengajuan";
import Approvals from "./pages/Approvals";
import FormEvaluasi from "./pages/FormEvaluasi";
import Pengadaan from "./pages/Pengadaan";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider defaultOpen={true}>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <SidebarInset className="flex-1">
              <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4">
                <SidebarTrigger />
              </header>
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/pengajuan" element={<Pengajuan />} />
                  <Route path="/approval" element={<Approvals />} />
                  <Route path="/evaluasi" element={<FormEvaluasi />} />
                  <Route path="/pengadaan" element={<Pengadaan />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
