import { DollarSign, TrendingUp, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { stats, financialTransactions, revenueData } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";

const statusStyle = {
  pago: { label: "Pago", className: "bg-success/10 text-success border-success/20" },
  pendente: { label: "Pendente", className: "bg-warning/10 text-warning border-warning/20" },
  atrasado: { label: "Atrasado", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const Financial = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Financeiro</h1>
        <p className="text-muted-foreground text-sm mt-1">Controle de receitas e despesas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Faturamento", value: `R$ ${stats.monthlyRevenue.toLocaleString("pt-BR")}`, icon: DollarSign, gradient: "gradient-primary" },
          { label: "Lucro Estimado", value: `R$ ${(stats.monthlyRevenue * 0.65).toLocaleString("pt-BR")}`, icon: TrendingUp, gradient: "gradient-success" },
          { label: "A Receber", value: `R$ ${stats.receivables.toLocaleString("pt-BR")}`, icon: Clock, gradient: "gradient-warning" },
          { label: "Pagas", value: `R$ ${stats.paidInvoices.toLocaleString("pt-BR")}`, icon: CheckCircle, gradient: "gradient-primary" },
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

      <div className="stat-card">
        <h3 className="font-semibold mb-4">Fluxo de Caixa</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220, 9%, 46%)" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 9%, 46%)" tickFormatter={(v) => `${v / 1000}k`} />
            <Tooltip formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, "Receita"]} />
            <Bar dataKey="revenue" fill="hsl(234, 89%, 64%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="stat-card">
        <h3 className="font-semibold mb-4">Transações Recentes</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Cliente</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Serviço</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Valor</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Vencimento</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Método</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {financialTransactions.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="p-3 text-sm font-medium">{t.client}</td>
                  <td className="p-3 text-sm text-muted-foreground">{t.service}</td>
                  <td className="p-3 text-sm font-semibold">R$ {t.amount.toLocaleString("pt-BR")}</td>
                  <td className="p-3 text-sm text-muted-foreground">{t.dueDate}</td>
                  <td className="p-3 text-sm text-muted-foreground">{t.method}</td>
                  <td className="p-3">
                    <Badge variant="outline" className={statusStyle[t.status].className}>
                      {statusStyle[t.status].label}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Financial;
