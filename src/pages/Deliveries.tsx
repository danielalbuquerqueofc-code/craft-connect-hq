import { useState } from "react";
import { Plus, Edit, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseQuery, useSupabaseInsert, useSupabaseUpdate, useSupabaseDelete } from "@/hooks/useSupabaseQuery";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";

const statusStyle: Record<string, { label: string; className: string }> = {
  pendente: { label: "Pendente", className: "bg-warning/10 text-warning border-warning/20" },
  entregue: { label: "Entregue", className: "bg-success/10 text-success border-success/20" },
  confirmado: { label: "Confirmado", className: "bg-primary/10 text-primary border-primary/20" },
  revisao: { label: "Revisão", className: "bg-info/10 text-info border-info/20" },
};

const emptyForm = {
  client_id: "", task_id: "", delivery_type: "", description: "",
  expected_date: "", responsible_name: "", status: "pendente",
};

const Deliveries = () => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: deliveries = [], isLoading } = useSupabaseQuery("deliveries", {
    select: "*, clients(company), tasks(title)",
    orderBy: { column: "created_at", ascending: false },
  });
  const { data: clients = [] } = useSupabaseQuery("clients");
  const { data: tasks = [] } = useSupabaseQuery("tasks");
  const insertDelivery = useSupabaseInsert("deliveries");
  const updateDelivery = useSupabaseUpdate("deliveries");
  const deleteDelivery = useSupabaseDelete("deliveries");

  const handleSave = () => {
    if (!form.client_id || !form.delivery_type.trim()) return;
    const values = {
      ...form,
      delivery_type: form.delivery_type.trim(),
      description: form.description.trim() || null,
      task_id: form.task_id || null,
      expected_date: form.expected_date || null,
      responsible_name: form.responsible_name.trim() || null,
    };
    if (editingId) {
      updateDelivery.mutate({ id: editingId, values }, { onSuccess: () => { setOpen(false); resetForm(); } });
    } else {
      insertDelivery.mutate(values as any, { onSuccess: () => { setOpen(false); resetForm(); } });
    }
  };

  const handleEdit = (d: any) => {
    setEditingId(d.id);
    setForm({ client_id: d.client_id, task_id: d.task_id || "", delivery_type: d.delivery_type, description: d.description || "", expected_date: d.expected_date || "", responsible_name: d.responsible_name || "", status: d.status });
    setOpen(true);
  };

  const markDelivered = (id: string) => {
    updateDelivery.mutate({ id, values: { status: "entregue", delivered_date: new Date().toISOString().split("T")[0] } });
  };

  const resetForm = () => { setForm(emptyForm); setEditingId(null); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Entregas</h1><p className="text-muted-foreground text-sm mt-1">{deliveries.length} entregas registradas</p></div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button className="gradient-primary text-primary-foreground gap-2"><Plus size={16} /> Nova Entrega</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editingId ? "Editar Entrega" : "Nova Entrega"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cliente *</Label>
                  <Select value={form.client_id} onValueChange={v => setForm(f => ({ ...f, client_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                    <SelectContent>{clients.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.company}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Demanda</Label>
                  <Select value={form.task_id} onValueChange={v => setForm(f => ({ ...f, task_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                    <SelectContent>{tasks.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label>Tipo de Entrega *</Label><Input value={form.delivery_type} onChange={e => setForm(f => ({ ...f, delivery_type: e.target.value }))} placeholder="Ex: Site, Relatório, Design" maxLength={200} /></div>
              <div className="space-y-2"><Label>Descrição</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} maxLength={1000} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Data Prevista</Label><Input type="date" value={form.expected_date} onChange={e => setForm(f => ({ ...f, expected_date: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Responsável</Label><Input value={form.responsible_name} onChange={e => setForm(f => ({ ...f, responsible_name: e.target.value }))} maxLength={100} /></div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => { setOpen(false); resetForm(); }}>Cancelar</Button>
              <Button onClick={handleSave} className="gradient-primary text-primary-foreground">{editingId ? "Salvar" : "Criar"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : deliveries.length === 0 ? (
        <div className="stat-card text-center py-12"><p className="text-muted-foreground">Nenhuma entrega registrada.</p></div>
      ) : (
        <div className="border rounded-xl overflow-hidden bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-secondary/50">
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Cliente</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Tipo</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Demanda</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Prevista</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((d: any) => (
                <tr key={d.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="p-3 text-sm font-medium">{d.clients?.company}</td>
                  <td className="p-3 text-sm">{d.delivery_type}</td>
                  <td className="p-3 text-sm text-muted-foreground">{d.tasks?.title || "—"}</td>
                  <td className="p-3 text-sm text-muted-foreground">{d.expected_date || "—"}</td>
                  <td className="p-3"><Badge variant="outline" className={statusStyle[d.status]?.className}>{statusStyle[d.status]?.label}</Badge></td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {d.status === "pendente" && <button onClick={() => markDelivered(d.id)} className="p-1.5 rounded hover:bg-success/10" title="Marcar entregue"><CheckCircle size={14} className="text-success" /></button>}
                      <button onClick={() => handleEdit(d)} className="p-1.5 rounded hover:bg-secondary"><Edit size={14} className="text-muted-foreground" /></button>
                      <DeleteConfirmDialog onConfirm={() => deleteDelivery.mutate(d.id)} />
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

export default Deliveries;
