import { Users, FileText, ListChecks, AlertTriangle, DollarSign, Clock, CheckCircle, Package } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { stats, revenueData, revenueByClient, tasks } from "@/lib/mockData";

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
  const todayTasks = tasks.filter(t => t.status === "em_andamento" || t.status === "a_fazer").slice(0, 4);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Visão geral da sua operação</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Clientes" value={stats.totalClients} icon={Users} gradient="gradient-primary" />
        <StatCard label="Contratos Ativos" value={stats.activeContracts} icon={FileText} gradient="gradient-primary" />
        <StatCard label="Tarefas em Andamento" value={stats.tasksInProgress} icon={ListChecks} gradient="gradient-success" />
        <StatCard label="Tarefas Atrasadas" value={stats.overdueTasks} icon={AlertTriangle} gradient="gradient-danger" />
        <StatCard label="Renovação Próxima" value={stats.renewingSoon} icon={Clock} gradient="gradient-warning" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Faturamento do Mês" value={`R$ ${stats.monthlyRevenue.toLocaleString("pt-BR")}`} icon={DollarSign} gradient="gradient-success" />
        <StatCard label="Contas a Receber" value={`R$ ${stats.receivables.toLocaleString("pt-BR")}`} icon={Clock} gradient="gradient-warning" />
        <StatCard label="Contas Pagas" value={`R$ ${stats.paidInvoices.toLocaleString("pt-BR")}`} icon={CheckCircle} gradient="gradient-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 stat-card">
          <h3 className="font-semibold mb-4">Faturamento Mensal</h3>
          <ResponsiveContainer width="100%" height={280}>
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
          <h3 className="font-semibold mb-4">Receita por Cliente</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={revenueByClient} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                {revenueByClient.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {revenueByClient.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium">R$ {item.value.toLocaleString("pt-BR")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Tarefas do Dia</h3>
            <span className="text-xs text-muted-foreground">{todayTasks.length} tarefas</span>
          </div>
          <div className="space-y-3">
            {todayTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div>
                  <p className="text-sm font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.client}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  task.priority === "alta" ? "bg-destructive/10 text-destructive" :
                  task.priority === "media" ? "bg-warning/10 text-warning" :
                  "bg-info/10 text-info"
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Entregas da Semana</h3>
            <span className="text-xs text-muted-foreground">{stats.weeklyDeliveries} entregas</span>
          </div>
          <div className="space-y-3">
            {[
              { title: "Site institucional finalizado", client: "Tech Solutions", date: "05/03", done: true },
              { title: "Manual de marca", client: "Marketing Pro", date: "06/03", done: true },
              { title: "Relatório de métricas", client: "Construtora ABC", date: "07/03", done: false },
              { title: "Landing page v2", client: "Clínica Saúde+", date: "08/03", done: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${item.done ? "bg-success" : "bg-warning"}`} />
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.client}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{item.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
