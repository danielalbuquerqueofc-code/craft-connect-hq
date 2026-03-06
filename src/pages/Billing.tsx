import { useState } from "react";
import { Plus, CreditCard, Edit, Trash2, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useSupabaseQuery, useSupabaseInsert, useSupabaseUpdate, useSupabaseDelete } from "@/hooks/useSupabaseQuery";

const statusStyle: Record<string, { label: string; className: string }> = {
  pendente: { label: "Pendente", className: "bg-warning/10 text-warning border-warning/20" },
  pago: { label: "Pago", className: "bg-success/10 text-success border-success/20" },
  atrasado: { label: "Atrasado", className: "bg-destructive/10 text-destructive border-destructive/20" },
  cancelado: { label: "Cancelado", className: "bg-muted text-muted-foreground border-border" },
};

const emptyForm = {
  client_id: "", contract_id: "", amount: 0, due_date: "",
  payment_method: "", recurring: false, status: "pendente",
};

const Billing = () => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: invoices = [], isLoading } = useSupabaseQuery("invoices", {
    select: "*, clients(company), contracts(service_type)",
    orderBy: { column: "due_date", ascending: false },
  });
  const { data: clients = [] } = useSupabaseQuery("clients");
  const { data: contracts = [] } = useSupabaseQuery("contracts");
  const insertInvoice = useSupabaseInsert("invoices");
  const updateInvoice = useSupabaseUpdate("invoices");
  const deleteInvoice = useSupabaseDelete("invoices");

  const handleSave = () => {
    if (!form.client_id || !form.due_date) return;
    const values = { ...form, amount: Number(form.amount), contract_id: form.contract_id || null };
    if (editingId) {
      updateInvoice.mutate({ id: editingId, values }, { onSuccess: () => { setOpen(false); resetForm(); } });
    } else {
      insertInvoice.mutate(values as any, { onSuccess: () => { setOpen(false); resetForm(); } });
    }
  };

  const handleEdit = (inv: any) => {
    setEditingId(inv.id);
    setForm({ client_id: inv.client_id, contract_id: inv.contract_id || "", amount: inv.amount, due_date: inv.due_date, payment_method: inv.payment_method || "", recurring: inv.recurring || false, status: inv.status });
    setOpen(true);
  };

  const markPaid = (id: string) => {
    updateInvoice.mutate({ id, values: { status: "pago", paid_at: new Date().toISOString() } });
  };

  const resetForm = () => { setForm(emptyForm); setEditingId(null); };

  const totalPending = invoices.filter((i: any) => i.status === "pendente").reduce((s: number, i: any) => s + i.amount, 0);
  const totalPaid = invoices.filter((i: any) => i.status === "pago").reduce((s: number, i: any) => s + i.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Cobranças</h1><p className="text-muted-foreground text-sm mt-1">{invoices.length} cobranças</p></div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button className="gradient-primary text-primary-foreground gap-2"><Plus size={16} /> Nova Cobrança</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? "Editar Cobrança" : "Nova Cobrança"}</DialogTitle></DialogHeader>
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
                  <Label>Contrato</Label>
                  <Select value={form.contract_id} onValueChange={v => setForm(f => ({ ...f, contract_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                    <SelectContent>{contracts.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.service_type}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Valor *</Label><Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} /></div>
                <div className="space-y-2"><Label>Vencimento *</Label><Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} /></div>
              </div>
              <div className="space-y-2"><Label>Método de Pagamento</Label><Input value={form.payment_method} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))} placeholder="Pix, Boleto, Cartão..." /></div>
              <div className="flex items-center gap-2">
                <Switch checked={form.recurring} onCheckedChange={v => setForm(f => ({ ...f, recurring: v }))} />
                <Label>Cobrança Recorrente</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => { setOpen(false); resetForm(); }}>Cancelar</Button>
              <Button onClick={handleSave} className="gradient-primary text-primary-foreground">{editingId ? "Salvar" : "Criar"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card"><p className="text-xs font-medium text-muted-foreground uppercase">Pendente</p><p className="text-xl font-bold mt-1 text-warning">R$ {totalPending.toLocaleString("pt-BR")}</p></div>
        <div className="stat-card"><p className="text-xs font-medium text-muted-foreground uppercase">Recebido</p><p className="text-xl font-bold mt-1 text-success">R$ {totalPaid.toLocaleString("pt-BR")}</p></div>
        <div className="stat-card"><p className="text-xs font-medium text-muted-foreground uppercase">Total</p><p className="text-xl font-bold mt-1">R$ {(totalPending + totalPaid).toLocaleString("pt-BR")}</p></div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : invoices.length === 0 ? (
        <div className="stat-card text-center py-12"><p className="text-muted-foreground">Nenhuma cobrança.</p></div>
      ) : (
        <div className="border rounded-xl overflow-hidden bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-secondary/50">
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Cliente</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Contrato</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Valor</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Vencimento</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Recorrente</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv: any) => (
                <tr key={inv.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="p-3 text-sm font-medium">{inv.clients?.company}</td>
                  <td className="p-3 text-sm text-muted-foreground">{inv.contracts?.service_type || "—"}</td>
                  <td className="p-3 text-sm font-semibold">R$ {inv.amount.toLocaleString("pt-BR")}</td>
                  <td className="p-3 text-sm text-muted-foreground">{inv.due_date}</td>
                  <td className="p-3 text-sm">{inv.recurring ? "Sim" : "Não"}</td>
                  <td className="p-3"><Badge variant="outline" className={statusStyle[inv.status]?.className}>{statusStyle[inv.status]?.label}</Badge></td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {inv.status === "pendente" && <button onClick={() => markPaid(inv.id)} className="p-1.5 rounded hover:bg-success/10" title="Marcar pago"><CreditCard size={14} className="text-success" /></button>}
                      <button onClick={() => handleEdit(inv)} className="p-1.5 rounded hover:bg-secondary"><Edit size={14} className="text-muted-foreground" /></button>
                      <button onClick={() => deleteInvoice.mutate(inv.id)} className="p-1.5 rounded hover:bg-destructive/10"><Trash2 size={14} className="text-destructive" /></button>
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

export default Billing;
