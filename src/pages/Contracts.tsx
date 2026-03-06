import { Plus, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const contracts = [
  { id: "1", client: "Tech Solutions Ltda", service: "Consultoria Web", monthlyValue: 4500, startDate: "2024-01-15", renewalDate: "2025-01-15", period: "Anual", status: "ativo" as const },
  { id: "2", client: "Marketing Digital Pro", service: "Gestão de Ads", monthlyValue: 3200, startDate: "2024-03-20", renewalDate: "2025-03-20", period: "Anual", status: "renovação" as const },
  { id: "3", client: "Construtora ABC", service: "Marketing 360", monthlyValue: 7800, startDate: "2023-11-05", renewalDate: "2024-11-05", period: "Anual", status: "ativo" as const },
  { id: "4", client: "Clínica Saúde+", service: "Social Media", monthlyValue: 2800, startDate: "2024-06-10", renewalDate: "2024-12-10", period: "Semestral", status: "ativo" as const },
  { id: "5", client: "Advocacia Torres", service: "Consultoria SEO", monthlyValue: 5100, startDate: "2023-08-22", renewalDate: "2024-08-22", period: "Anual", status: "expirado" as const },
];

const statusStyle = {
  ativo: { label: "Ativo", className: "bg-success/10 text-success border-success/20" },
  "renovação": { label: "Renovação", className: "bg-warning/10 text-warning border-warning/20" },
  expirado: { label: "Expirado", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const Contracts = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Contratos</h1>
        <p className="text-muted-foreground text-sm mt-1">{contracts.length} contratos registrados</p>
      </div>
      <Button className="gradient-primary text-primary-foreground gap-2">
        <Plus size={16} /> Novo Contrato
      </Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        { label: "Contratos Ativos", value: contracts.filter(c => c.status === "ativo").length, icon: FileText, gradient: "gradient-primary" },
        { label: "Próximos de Renovação", value: contracts.filter(c => c.status === "renovação").length, icon: AlertCircle, gradient: "gradient-warning" },
        { label: "Receita Contratual", value: `R$ ${contracts.reduce((s, c) => s + c.monthlyValue, 0).toLocaleString("pt-BR")}/mês`, icon: FileText, gradient: "gradient-success" },
      ].map((s) => (
        <div key={s.label} className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
              <p className="text-xl font-bold mt-1">{s.value}</p>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.gradient}`}>
              <s.icon size={20} className="text-primary-foreground" />
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="border rounded-xl overflow-hidden bg-card">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-secondary/50">
            <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Cliente</th>
            <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Serviço</th>
            <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Valor Mensal</th>
            <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Período</th>
            <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Renovação</th>
            <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((c) => (
            <tr key={c.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer">
              <td className="p-3 text-sm font-medium">{c.client}</td>
              <td className="p-3 text-sm text-muted-foreground">{c.service}</td>
              <td className="p-3 text-sm font-semibold">R$ {c.monthlyValue.toLocaleString("pt-BR")}</td>
              <td className="p-3 text-sm text-muted-foreground">{c.period}</td>
              <td className="p-3 text-sm text-muted-foreground">{c.renewalDate}</td>
              <td className="p-3">
                <Badge variant="outline" className={statusStyle[c.status].className}>
                  {statusStyle[c.status].label}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default Contracts;
