import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Contracts from "./pages/Contracts";
import Tasks from "./pages/Tasks";
import Financial from "./pages/Financial";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<Clients />} />
            <Route path="/contratos" element={<Contracts />} />
            <Route path="/demandas" element={<Tasks />} />
            <Route path="/entregas" element={<PlaceholderPage title="Entregas" description="Gestão de entregas para clientes" />} />
            <Route path="/financeiro" element={<Financial />} />
            <Route path="/cobrancas" element={<PlaceholderPage title="Cobranças" description="Sistema de cobrança integrado" />} />
            <Route path="/documentos" element={<PlaceholderPage title="Documentos" description="Central de documentos e arquivos" />} />
            <Route path="/comunicacao" element={<PlaceholderPage title="Comunicação" description="Central de comunicação com clientes" />} />
            <Route path="/equipe" element={<PlaceholderPage title="Equipe" description="Gestão de usuários e permissões" />} />
            <Route path="/relatorios" element={<PlaceholderPage title="Relatórios" description="Análises e relatórios de performance" />} />
            <Route path="/automacoes" element={<PlaceholderPage title="Automações" description="Regras e automações do sistema" />} />
            <Route path="/configuracoes" element={<PlaceholderPage title="Configurações" description="Configurações gerais do sistema" />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
