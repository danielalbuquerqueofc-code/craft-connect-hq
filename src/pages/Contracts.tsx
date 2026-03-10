import { useState } from "react";
import { Plus, FileText, AlertCircle, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseQuery, useSupabaseInsert, useSupabaseUpdate, useSupabaseDelete } from "@/hooks/useSupabaseQuery";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";

const statusStyle: Record<string, { label: string; className: string }> = {
  ativo: { label: "Ativo", className: "bg-success/10 text-success border-success/20" },
  renovacao: { label: "Renovação", className: "bg-warning/10 text-warning border-warning/20" },
  pausado: { label: "Pausado", className: "bg-muted text-muted-foreground border-border" },
  cancelado: { label: "Cancelado", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const emptyForm = {
  client_id: "", service_type: "", description: "", monthly_value: 0, total_value: 0,
  start_date: "", renewal_date: "", periodicity: "mensal", status: "ativo",
};

const Contracts = () => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: contracts = [], isLoading } = useSupabaseQuery("contracts", {
    select: "*, clients(company)",
    orderBy: { column: "created_at", ascending: false },
  });
  const { data: clients = [] } = useSupabaseQuery("clients");
  const insertContract = useSupabaseInsert("contracts");
  const updateContract = useSupabaseUpdate("contracts");
  const deleteContract = useSupabaseDelete("contracts");

  const handleSave = () => {
    if (!form.client_id || !form.service_type || !form.start_date) return;
    const mv = Number(form.monthly_value);
    const tv = Number(form.total_value);
    if (mv < 0 || tv < 0) return;
    const values = { ...form, monthly_value: mv, total_value: tv };
    if (editingId) {
      updateContract.mutate({ id: editingId, values }, { onSuccess: () => { setOpen(false); resetForm(); } });
    } else {
      insertContract.mutate(values as any, { onSuccess: () => { setOpen(false); resetForm(); } });
    }
  };

  const handleEdit = (c: any) => {
    setEditingId(c.id);
    setForm({
      client_id: c.client_id, service_type: c.service_type, description: c.description || "",
      monthly_value: c.monthly_value || 0, total_value: c.total_value || 0,
      start_date: c.start_date, renewal_date: c.renewal_date || "", periodicity: c.periodicity || "mensal", status: c.status,
    });
    setOpen(true);
  };

  const resetForm = () => { setForm(emptyForm); setEditingId(null); };

  const activeCount = contracts.filter((c: any) => c.status === "ativo").length;
  const renewalCount = contracts.filter((c: any) => c.status === "renovacao").length;
  const totalRevenue = contracts.reduce((s: number, c: any) => s + (c.monthly_value || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contratos</h1>
          <p className="text-muted-foreground text-sm mt-1">{contracts.length} contratos registrados</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground gap-2"><Plus size={16} /> Novo Contrato</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingId ? "Editar Contrato" : "Novo Contrato"}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cliente *</Label>
                <Select value={form.client_id} onValueChange={v => setForm(f => ({ ...f, client_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecionar cliente" /></SelectTrigger>
                  <SelectContent>{clients.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.company}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Serviço *</Label>
                <Input value={form.service_type} onChange={e => setForm(f => ({ ...f, service_type: e.target.value }))} placeholder="Ex: Consultoria Web" maxLength={200} />
              </div>
              <div className="space-y-2">
                <Label>Valor Mensal</Label>
                <Input type="number" min={0} value={form.monthly_value} onChange={e => setForm(f => ({ ...f, monthly_value: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Valor Total</Label>
                <Input type="number" min={0} value={form.total_value} onChange={e => setForm(f => ({ ...f, total_value: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Data Início *</Label>
                <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Data Renovação</Label>
                <Input type="date" value={form.renewal_date} onChange={e => setForm(f => ({ ...f, renewal_date: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Periodicidade</Label>
                <Select value={form.periodicity} onValueChange={v => setForm(f => ({ ...f, periodicity: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="trimestral">Trimestral</SelectItem>
                    <SelectItem value="semestral">Semestral</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="renovacao">Renovação</SelectItem>
                    <SelectItem value="pausado">Pausado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} maxLength={1000} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => { setOpen(false); resetForm(); }}>Cancelar</Button>
              <Button onClick={handleSave} className="gradient-primary text-primary-foreground" disabled={insertContract.isPending || updateContract.isPending}>
                {editingId ? "Salvar" : "Criar Contrato"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card"><div className="flex items-center justify-between"><div><p className="text-xs font-medium text-muted-foreground uppercase">Contratos Ativos</p><p className="text-xl font-bold mt-1">{activeCount}</p></div><div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center"><FileText size={20} className="text-primary-foreground" /></div></div></div>
        <div className="stat-card"><div className="flex items-center justify-between"><div><p className="text-xs font-medium text-muted-foreground uppercase">Renovação</p><p className="text-xl font-bold mt-1">{renewalCount}</p></div><div className="w-10 h-10 rounded-lg gradient-warning flex items-center justify-center"><AlertCircle size={20} className="text-primary-foreground" /></div></div></div>
        <div className="stat-card"><div className="flex items-center justify-between"><div><p className="text-xs font-medium text-muted-foreground uppercase">Receita Mensal</p><p className="text-xl font-bold mt-1">R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p></div><div className="w-10 h-10 rounded-lg gradient-success flex items-center justify-center"><FileText size={20} className="text-primary-foreground" /></div></div></div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : contracts.length === 0 ? (
        <div className="stat-card text-center py-12"><p className="text-muted-foreground">Nenhum contrato. Crie o primeiro!</p></div>
      ) : (
        <div className="border rounded-xl overflow-hidden bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-secondary/50">
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Cliente</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Serviço</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Valor Mensal</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Período</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c: any) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="p-3 text-sm font-medium">{c.clients?.company || "—"}</td>
                  <td className="p-3 text-sm text-muted-foreground">{c.service_type}</td>
                  <td className="p-3 text-sm font-semibold">R$ {(c.monthly_value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                  <td className="p-3 text-sm text-muted-foreground">{c.periodicity}</td>
                  <td className="p-3"><Badge variant="outline" className={statusStyle[c.status]?.className}>{statusStyle[c.status]?.label || c.status}</Badge></td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(c)} className="p-1.5 rounded hover:bg-secondary"><Edit size={14} className="text-muted-foreground" /></button>
                      <DeleteConfirmDialog onConfirm={() => deleteContract.mutate(c.id)} />
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

export default Contracts;
