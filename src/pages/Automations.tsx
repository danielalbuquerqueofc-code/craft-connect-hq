import { useState } from "react";
import { Plus, Zap, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseQuery, useSupabaseInsert, useSupabaseUpdate, useSupabaseDelete } from "@/hooks/useSupabaseQuery";
import { useAuth } from "@/contexts/AuthContext";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";

const triggerLabels: Record<string, string> = {
  renovacao_contrato: "Renovação de Contrato",
  tarefa_atrasada: "Tarefa Atrasada",
  cobranca_vencida: "Cobrança Vencida",
  nova_mensagem: "Nova Mensagem",
};

const emptyForm = { name: "", description: "", trigger_type: "tarefa_atrasada", enabled: true };

const Automations = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: automations = [], isLoading } = useSupabaseQuery("automations", { orderBy: { column: "created_at", ascending: false } });
  const insertAuto = useSupabaseInsert("automations");
  const updateAuto = useSupabaseUpdate("automations");
  const deleteAuto = useSupabaseDelete("automations");

  const handleSave = () => {
    if (!form.name.trim() || !form.trigger_type) return;
    const values = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      trigger_type: form.trigger_type,
      enabled: form.enabled,
      user_id: user!.id,
    };
    if (editingId) {
      updateAuto.mutate({ id: editingId, values }, { onSuccess: () => { setOpen(false); resetForm(); } });
    } else {
      insertAuto.mutate(values as any, { onSuccess: () => { setOpen(false); resetForm(); } });
    }
  };

  const handleEdit = (a: any) => {
    setEditingId(a.id);
    setForm({ name: a.name, description: a.description || "", trigger_type: a.trigger_type, enabled: a.enabled });
    setOpen(true);
  };

  const toggleEnabled = (id: string, enabled: boolean) => {
    updateAuto.mutate({ id, values: { enabled: !enabled } });
  };

  const resetForm = () => { setForm(emptyForm); setEditingId(null); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Automações</h1><p className="text-muted-foreground text-sm mt-1">Regras e automações do sistema</p></div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button className="gradient-primary text-primary-foreground gap-2"><Plus size={16} /> Nova Automação</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? "Editar Automação" : "Nova Automação"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Nome *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Alerta de tarefa atrasada" maxLength={200} /></div>
              <div className="space-y-2"><Label>Descrição</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} maxLength={1000} /></div>
              <div className="space-y-2">
                <Label>Gatilho *</Label>
                <Select value={form.trigger_type} onValueChange={v => setForm(f => ({ ...f, trigger_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="renovacao_contrato">Renovação de Contrato</SelectItem>
                    <SelectItem value="tarefa_atrasada">Tarefa Atrasada</SelectItem>
                    <SelectItem value="cobranca_vencida">Cobrança Vencida</SelectItem>
                    <SelectItem value="nova_mensagem">Nova Mensagem</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.enabled} onCheckedChange={v => setForm(f => ({ ...f, enabled: v }))} />
                <Label>Ativa</Label>
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
      ) : automations.length === 0 ? (
        <div className="stat-card text-center py-12">
          <Zap size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhuma automação configurada.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {automations.map((a: any) => (
            <div key={a.id} className="stat-card flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${a.enabled ? "gradient-primary" : "bg-muted"}`}>
                  <Zap size={18} className={a.enabled ? "text-primary-foreground" : "text-muted-foreground"} />
                </div>
                <div>
                  <p className="font-medium">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{triggerLabels[a.trigger_type] || a.trigger_type}</p>
                  {a.description && <p className="text-xs text-muted-foreground mt-1">{a.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={a.enabled} onCheckedChange={() => toggleEnabled(a.id, a.enabled)} />
                <button onClick={() => handleEdit(a)} className="p-1.5 rounded hover:bg-secondary"><Edit size={14} className="text-muted-foreground" /></button>
                <DeleteConfirmDialog onConfirm={() => deleteAuto.mutate(a.id)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Automations;
