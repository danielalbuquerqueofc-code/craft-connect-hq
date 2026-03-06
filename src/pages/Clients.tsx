import { useState } from "react";
import { Search, Plus, Filter, MoreHorizontal } from "lucide-react";
import { clients } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const statusMap = {
  ativo: { label: "Ativo", className: "bg-success/10 text-success border-success/20" },
  lead: { label: "Lead", className: "bg-info/10 text-info border-info/20" },
  pausado: { label: "Pausado", className: "bg-muted text-muted-foreground border-border" },
};

const Clients = () => {
  const [search, setSearch] = useState("");
  const filtered = clients.filter(c =>
    c.company.toLowerCase().includes(search.toLowerCase()) ||
    c.contact.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-muted-foreground text-sm mt-1">{clients.length} clientes cadastrados</p>
        </div>
        <Button className="gradient-primary text-primary-foreground gap-2">
          <Plus size={16} /> Novo Cliente
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter size={14} /> Filtros
        </Button>
      </div>

      <div className="border rounded-xl overflow-hidden bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Empresa</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Contato</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Segmento</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Receita</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((client) => (
              <tr key={client.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">{client.company.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{client.company}</p>
                      <p className="text-xs text-muted-foreground">{client.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <p className="text-sm">{client.contact}</p>
                  <p className="text-xs text-muted-foreground">{client.phone}</p>
                </td>
                <td className="p-3">
                  <span className="text-sm text-muted-foreground">{client.segment}</span>
                </td>
                <td className="p-3">
                  <Badge variant="outline" className={statusMap[client.status].className}>
                    {statusMap[client.status].label}
                  </Badge>
                </td>
                <td className="p-3">
                  <span className="text-sm font-medium">
                    {client.revenue > 0 ? `R$ ${client.revenue.toLocaleString("pt-BR")}` : "—"}
                  </span>
                </td>
                <td className="p-3">
                  <button className="p-1 rounded hover:bg-secondary transition-colors">
                    <MoreHorizontal size={16} className="text-muted-foreground" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Clients;
