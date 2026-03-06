import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, FileText, ListChecks, Package,
  DollarSign, CreditCard, FolderOpen, MessageSquare, Settings,
  BarChart3, UsersRound, Zap, ChevronLeft, ChevronRight, LogOut
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Clientes", icon: Users, path: "/clientes" },
  { label: "Contratos", icon: FileText, path: "/contratos" },
  { label: "Demandas", icon: ListChecks, path: "/demandas" },
  { label: "Entregas", icon: Package, path: "/entregas" },
  { label: "Financeiro", icon: DollarSign, path: "/financeiro" },
  { label: "Cobranças", icon: CreditCard, path: "/cobrancas" },
  { label: "Documentos", icon: FolderOpen, path: "/documentos" },
  { label: "Comunicação", icon: MessageSquare, path: "/comunicacao" },
  { label: "Equipe", icon: UsersRound, path: "/equipe" },
  { label: "Relatórios", icon: BarChart3, path: "/relatorios" },
  { label: "Automações", icon: Zap, path: "/automacoes" },
  { label: "Configurações", icon: Settings, path: "/configuracoes" },
];

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <aside
      className={`sidebar-gradient flex flex-col h-screen sticky top-0 transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">G</span>
            </div>
            <span className="text-sidebar-accent-foreground font-semibold text-sm">GestãoPro</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 mx-2 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
                <span className="text-sidebar-accent-foreground text-xs font-medium">
                  {(user?.email || "U").charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-sidebar-accent-foreground truncate max-w-[120px]">
                  {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuário"}
                </p>
                <p className="text-[10px] text-sidebar-foreground truncate max-w-[120px]">{user?.email}</p>
              </div>
            </div>
            <button onClick={signOut} className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground" title="Sair">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default AppSidebar;
