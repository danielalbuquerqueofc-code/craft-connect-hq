import { BarChart3, Users, DollarSign, ListChecks } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";

const COLORS = ["hsl(234, 89%, 64%)", "hsl(262, 83%, 58%)", "hsl(199, 89%, 48%)", "hsl(142, 76%, 36%)", "hsl(38, 92%, 50%)"];

const Reports = () => {
  const { data: clients = [] } = useSupabaseQuery("clients");
  const { data: tasks = [] } = useSupabaseQuery("tasks");
  const { data: transactions = [] } = useSupabaseQuery("transactions");

  const activeClients = clients.filter((c: any) => c.status === "ativo").length;
  const completedTasks = tasks.filter((t: any) => t.status === "concluido").length;
  const totalRevenue = transactions.filter((t: any) => t.type === "receita").reduce((s: number, t: any) => s + t.amount, 0);

  const tasksByStatus = [
    { name: "A Fazer", value: tasks.filter((t: any) => t.status === "a_fazer").length },
    { name: "Em Andamento", value: tasks.filter((t: any) => t.status === "em_andamento").length },
    { name: "Aguardando", value: tasks.filter((t: any) => t.status === "aguardando").length },
    { name: "Revisão", value: tasks.filter((t: any) => t.status === "revisao").length },
    { name: "Concluído", value: tasks.filter((t: any) => t.status === "concluido").length },
  ].filter(t => t.value > 0);

  const clientsByStatus = [
    { name: "Ativos", value: clients.filter((c: any) => c.status === "ativo").length },
    { name: "Leads", value: clients.filter((c: any) => c.status === "lead").length },
    { name: "Pausados", value: clients.filter((c: any) => c.status === "pausado").length },
  ].filter(c => c.value > 0);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Relatórios</h1><p className="text-muted-foreground text-sm mt-1">Análises e métricas</p></div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card"><div className="flex items-center justify-between"><div><p className="text-xs font-medium text-muted-foreground uppercase">Total Clientes</p><p className="text-xl font-bold mt-1">{clients.length}</p></div><div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center"><Users size={20} className="text-primary-foreground" /></div></div></div>
        <div className="stat-card"><div className="flex items-center justify-between"><div><p className="text-xs font-medium text-muted-foreground uppercase">Clientes Ativos</p><p className="text-xl font-bold mt-1">{activeClients}</p></div><div className="w-10 h-10 rounded-lg gradient-success flex items-center justify-center"><Users size={20} className="text-primary-foreground" /></div></div></div>
        <div className="stat-card"><div className="flex items-center justify-between"><div><p className="text-xs font-medium text-muted-foreground uppercase">Tarefas Concluídas</p><p className="text-xl font-bold mt-1">{completedTasks}</p></div><div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center"><ListChecks size={20} className="text-primary-foreground" /></div></div></div>
        <div className="stat-card"><div className="flex items-center justify-between"><div><p className="text-xs font-medium text-muted-foreground uppercase">Receita Total</p><p className="text-xl font-bold mt-1">R$ {totalRevenue.toLocaleString("pt-BR")}</p></div><div className="w-10 h-10 rounded-lg gradient-success flex items-center justify-center"><DollarSign size={20} className="text-primary-foreground" /></div></div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="stat-card">
          <h3 className="font-semibold mb-4">Demandas por Status</h3>
          {tasksByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={tasksByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(220, 9%, 46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 9%, 46%)" />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(234, 89%, 64%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">Sem dados</p>
          )}
        </div>

        <div className="stat-card">
          <h3 className="font-semibold mb-4">Clientes por Status</h3>
          {clientsByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={clientsByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" paddingAngle={3}>
                  {clientsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">Sem dados</p>
          )}
          <div className="space-y-1.5 mt-2">
            {clientsByStatus.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
