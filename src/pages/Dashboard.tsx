import { Users, FileText, ListChecks, AlertTriangle, DollarSign, Clock, CheckCircle, Package } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";

const StatCard = ({ label, value, icon: Icon, gradient }: { label: string; value: string | number; icon: React.ElementType; gradient: string }) => (
  <div className="stat-card animate-fade-in">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${gradient}`}>
        <Icon size={20} className="text-primary-foreground" />
      </div>
    </div>
  </div>
);

const COLORS = ["hsl(234, 89%, 64%)", "hsl(262, 83%, 58%)", "hsl(199, 89%, 48%)", "hsl(142, 76%, 36%)", "hsl(38, 92%, 50%)"];

const Dashboard = () => {
  const { data: clients = [] } = useSupabaseQuery("clients");
  const { data: contracts = [] } = useSupabaseQuery("contracts");
  const { data: tasks = [] } = useSupabaseQuery("tasks");
  const { data: transactions = [] } = useSupabaseQuery("transactions");
  const { data: deliveries = [] } = useSupabaseQuery("deliveries");

  const totalClients = clients.length;
  const activeContracts = (contracts as any[]).filter(c => c.status === "ativo").length;
  const renewingSoon = (contracts as any[]).filter(c => c.status === "renovacao").length;
  const tasksInProgress = (tasks as any[]).filter(t => t.status === "em_andamento").length;
  const overdueTasks = (tasks as any[]).filter(t => {
    if (!t.due_date) return false;
    return new Date(t.due_date) < new Date() && t.status !== "concluido";
  }).length;

  const revenues = (transactions as any[]).filter(t => t.type === "receita");
  const monthlyRevenue = revenues.reduce((s, t) => s + t.amount, 0);
  const receivables = revenues.filter(t => t.status === "pendente").reduce((s, t) => s + t.amount, 0);
  const paidInvoices = revenues.filter(t => t.status === "pago").reduce((s, t) => s + t.amount, 0);
  const weeklyDeliveries = deliveries.length;

  const todayTasks = (tasks as any[]).filter(t => t.status === "em_andamento" || t.status === "a_fazer").slice(0, 4);

  // Revenue by client
  const revenueByClient = Object.values(
    revenues.reduce((acc: Record<string, { name: string; value: number }>, t: any) => {
      const clientName = t.clients?.company || t.description || "Outros";
      if (!acc[clientName]) acc[clientName] = { name: clientName, value: 0 };
      acc[clientName].value += t.amount;
      return acc;
    }, {} as Record<string, { name: string; value: number }>)
  ).sort((a: any, b: any) => b.value - a.value).slice(0, 5);

  const recentDeliveries = (deliveries as any[]).slice(0, 4);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Visão geral da sua operação</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Clientes" value={totalClients} icon={Users} gradient="gradient-primary" />
        <StatCard label="Contratos Ativos" value={activeContracts} icon={FileText} gradient="gradient-primary" />
        <StatCard label="Tarefas em Andamento" value={tasksInProgress} icon={ListChecks} gradient="gradient-success" />
        <StatCard label="Tarefas Atrasadas" value={overdueTasks} icon={AlertTriangle} gradient="gradient-danger" />
        <StatCard label="Renovação Próxima" value={renewingSoon} icon={Clock} gradient="gradient-warning" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Faturamento" value={`R$ ${monthlyRevenue.toLocaleString("pt-BR")}`} icon={DollarSign} gradient="gradient-success" />
        <StatCard label="Contas a Receber" value={`R$ ${receivables.toLocaleString("pt-BR")}`} icon={Clock} gradient="gradient-warning" />
        <StatCard label="Contas Pagas" value={`R$ ${paidInvoices.toLocaleString("pt-BR")}`} icon={CheckCircle} gradient="gradient-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 stat-card">
          <h3 className="font-semibold mb-4">Receita por Cliente</h3>
          {revenueByClient.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueByClient as any[]}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(220, 9%, 46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 9%, 46%)" tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, "Receita"]} />
                <Bar dataKey="value" fill="hsl(234, 89%, 64%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-12">Adicione transações para ver o gráfico</p>
          )}
        </div>

        <div className="stat-card">
          <h3 className="font-semibold mb-4">Distribuição de Clientes</h3>
          {clients.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Ativos", value: (clients as any[]).filter(c => c.status === "ativo").length },
                      { name: "Leads", value: (clients as any[]).filter(c => c.status === "lead").length },
                      { name: "Pausados", value: (clients as any[]).filter(c => c.status === "pausado").length },
                    ].filter(d => d.value > 0)}
                    cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}
                  >
                    {[0, 1, 2].map(i => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-12">Sem dados</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Tarefas Pendentes</h3>
            <span className="text-xs text-muted-foreground">{todayTasks.length} tarefas</span>
          </div>
          <div className="space-y-3">
            {todayTasks.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">Nenhuma tarefa pendente</p>
            ) : (
              todayTasks.map((task: any) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div>
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.clients?.company}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    task.priority === "alta" || task.priority === "urgente" ? "bg-destructive/10 text-destructive" :
                    task.priority === "media" ? "bg-warning/10 text-warning" :
                    "bg-info/10 text-info"
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Entregas Recentes</h3>
            <span className="text-xs text-muted-foreground">{weeklyDeliveries} entregas</span>
          </div>
          <div className="space-y-3">
            {recentDeliveries.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">Nenhuma entrega registrada</p>
            ) : (
              recentDeliveries.map((d: any) => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${d.status === "entregue" || d.status === "confirmado" ? "bg-success" : "bg-warning"}`} />
                    <div>
                      <p className="text-sm font-medium">{d.delivery_type}</p>
                      <p className="text-xs text-muted-foreground">{d.clients?.company}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{d.expected_date || "—"}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
