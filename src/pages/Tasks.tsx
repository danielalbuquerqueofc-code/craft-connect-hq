import { useState } from "react";
import { Plus, List, Columns, Calendar } from "lucide-react";
import { tasks } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const columns = [
  { id: "a_fazer", label: "A Fazer", color: "bg-muted-foreground" },
  { id: "em_andamento", label: "Em Andamento", color: "bg-info" },
  { id: "aguardando", label: "Aguardando Cliente", color: "bg-warning" },
  { id: "revisao", label: "Revisão", color: "bg-primary" },
  { id: "concluido", label: "Concluído", color: "bg-success" },
];

const priorityStyle = {
  alta: "bg-destructive/10 text-destructive",
  media: "bg-warning/10 text-warning",
  baixa: "bg-info/10 text-info",
};

const Tasks = () => {
  const [view, setView] = useState<"kanban" | "list" | "calendar">("kanban");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Demandas</h1>
          <p className="text-muted-foreground text-sm mt-1">{tasks.length} demandas ativas</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border rounded-lg overflow-hidden">
            {[
              { id: "kanban" as const, icon: Columns },
              { id: "list" as const, icon: List },
              { id: "calendar" as const, icon: Calendar },
            ].map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`p-2 transition-colors ${view === id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
          <Button className="gradient-primary text-primary-foreground gap-2">
            <Plus size={16} /> Nova Demanda
          </Button>
        </div>
      </div>

      {view === "kanban" && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((col) => {
            const colTasks = tasks.filter(t => t.status === col.id);
            return (
              <div key={col.id} className="kanban-column min-w-[280px] flex-1">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                  <h3 className="text-sm font-semibold">{col.label}</h3>
                  <span className="text-xs text-muted-foreground ml-auto">{colTasks.length}</span>
                </div>
                {colTasks.map((task) => (
                  <div key={task.id} className="kanban-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">{task.client}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${priorityStyle[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-2">{task.title}</p>
                    <div className="flex items-center justify-between">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-[10px] font-medium text-primary">{task.assignee.charAt(0)}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{task.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {view === "list" && (
        <div className="border rounded-xl overflow-hidden bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-secondary/50">
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Tarefa</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Cliente</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Responsável</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Prioridade</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Prazo</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer">
                  <td className="p-3 text-sm font-medium">{task.title}</td>
                  <td className="p-3 text-sm text-muted-foreground">{task.client}</td>
                  <td className="p-3 text-sm">{task.assignee}</td>
                  <td className="p-3">
                    <Badge variant="outline" className={priorityStyle[task.priority]}>{task.priority}</Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline" className={
                      task.status === "concluido" ? "bg-success/10 text-success" :
                      task.status === "em_andamento" ? "bg-info/10 text-info" :
                      "bg-muted text-muted-foreground"
                    }>
                      {columns.find(c => c.id === task.status)?.label}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">{task.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === "calendar" && (
        <div className="stat-card text-center py-16">
          <Calendar size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Visualização de calendário em breve</p>
        </div>
      )}
    </div>
  );
};

export default Tasks;
