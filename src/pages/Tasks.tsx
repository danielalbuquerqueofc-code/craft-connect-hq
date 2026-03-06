import { useState } from "react";
import { Plus, List, Columns, Calendar, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseQuery, useSupabaseInsert, useSupabaseUpdate, useSupabaseDelete } from "@/hooks/useSupabaseQuery";

const columns = [
  { id: "a_fazer", label: "A Fazer", color: "bg-muted-foreground" },
  { id: "em_andamento", label: "Em Andamento", color: "bg-info" },
  { id: "aguardando", label: "Aguardando", color: "bg-warning" },
  { id: "revisao", label: "Revisão", color: "bg-primary" },
  { id: "concluido", label: "Concluído", color: "bg-success" },
];

const priorityStyle: Record<string, string> = {
  alta: "bg-destructive/10 text-destructive",
  urgente: "bg-destructive/10 text-destructive",
  media: "bg-warning/10 text-warning",
  baixa: "bg-info/10 text-info",
};

const emptyForm = {
  client_id: "", title: "", description: "", assignee_name: "",
  priority: "media", status: "a_fazer", due_date: "",
};

const Tasks = () => {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: tasks = [], isLoading } = useSupabaseQuery("tasks", {
    select: "*, clients(company)",
    orderBy: { column: "created_at", ascending: false },
  });
  const { data: clients = [] } = useSupabaseQuery("clients");
  const insertTask = useSupabaseInsert("tasks");
  const updateTask = useSupabaseUpdate("tasks");
  const deleteTask = useSupabaseDelete("tasks");

  const handleSave = () => {
    if (!form.client_id || !form.title) return;
    if (editingId) {
      updateTask.mutate({ id: editingId, values: form }, { onSuccess: () => { setOpen(false); resetForm(); } });
    } else {
      insertTask.mutate(form as any, { onSuccess: () => { setOpen(false); resetForm(); } });
    }
  };

  const handleEdit = (t: any) => {
    setEditingId(t.id);
    setForm({ client_id: t.client_id, title: t.title, description: t.description || "", assignee_name: t.assignee_name || "", priority: t.priority || "media", status: t.status, due_date: t.due_date || "" });
    setOpen(true);
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    updateTask.mutate({ id: taskId, values: { status: newStatus } });
  };

  const resetForm = () => { setForm(emptyForm); setEditingId(null); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Demandas</h1>
          <p className="text-muted-foreground text-sm mt-1">{tasks.length} demandas</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border rounded-lg overflow-hidden">
            {[{ id: "kanban" as const, icon: Columns }, { id: "list" as const, icon: List }].map(({ id, icon: Icon }) => (
              <button key={id} onClick={() => setView(id)} className={`p-2 transition-colors ${view === id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>
                <Icon size={16} />
              </button>
            ))}
          </div>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground gap-2"><Plus size={16} /> Nova Demanda</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{editingId ? "Editar Demanda" : "Nova Demanda"}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Cliente *</Label>
                  <Select value={form.client_id} onValueChange={v => setForm(f => ({ ...f, client_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecionar cliente" /></SelectTrigger>
                    <SelectContent>{clients.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.company}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Título *</Label>
                  <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Título da demanda" />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Responsável</Label>
                    <Input value={form.assignee_name} onChange={e => setForm(f => ({ ...f, assignee_name: e.target.value }))} placeholder="Nome" />
                  </div>
                  <div className="space-y-2">
                    <Label>Prazo</Label>
                    <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Prioridade</Label>
                    <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{columns.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => { setOpen(false); resetForm(); }}>Cancelar</Button>
                <Button onClick={handleSave} className="gradient-primary text-primary-foreground">
                  {editingId ? "Salvar" : "Criar Demanda"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : view === "kanban" ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((col) => {
            const colTasks = tasks.filter((t: any) => t.status === col.id);
            return (
              <div key={col.id} className="kanban-column min-w-[260px] flex-1">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                  <h3 className="text-sm font-semibold">{col.label}</h3>
                  <span className="text-xs text-muted-foreground ml-auto">{colTasks.length}</span>
                </div>
                {colTasks.map((task: any) => (
                  <div key={task.id} className="kanban-card group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">{task.clients?.company}</span>
                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${priorityStyle[task.priority || "media"]}`}>{task.priority}</span>
                        <button onClick={() => handleEdit(task)} className="opacity-0 group-hover:opacity-100 p-0.5"><Edit size={12} className="text-muted-foreground" /></button>
                        <button onClick={() => deleteTask.mutate(task.id)} className="opacity-0 group-hover:opacity-100 p-0.5"><Trash2 size={12} className="text-destructive" /></button>
                      </div>
                    </div>
                    <p className="text-sm font-medium mb-2">{task.title}</p>
                    <div className="flex items-center justify-between">
                      {task.assignee_name && <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-[10px] font-medium text-primary">{task.assignee_name.charAt(0)}</span></div>}
                      {task.due_date && <span className="text-[10px] text-muted-foreground">{task.due_date}</span>}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
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
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task: any) => (
                <tr key={task.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="p-3 text-sm font-medium">{task.title}</td>
                  <td className="p-3 text-sm text-muted-foreground">{task.clients?.company}</td>
                  <td className="p-3 text-sm">{task.assignee_name || "—"}</td>
                  <td className="p-3"><Badge variant="outline" className={priorityStyle[task.priority || "media"]}>{task.priority}</Badge></td>
                  <td className="p-3">
                    <Select value={task.status} onValueChange={(v) => handleStatusChange(task.id, v)}>
                      <SelectTrigger className="h-7 text-xs w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>{columns.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">{task.due_date || "—"}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(task)} className="p-1.5 rounded hover:bg-secondary"><Edit size={14} className="text-muted-foreground" /></button>
                      <button onClick={() => deleteTask.mutate(task.id)} className="p-1.5 rounded hover:bg-destructive/10"><Trash2 size={14} className="text-destructive" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Tasks;
