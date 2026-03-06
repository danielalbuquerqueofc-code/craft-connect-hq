import { useState } from "react";
import { Plus, DollarSign, TrendingUp, Clock, CheckCircle, Edit, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseQuery, useSupabaseInsert, useSupabaseUpdate, useSupabaseDelete } from "@/hooks/useSupabaseQuery";

const statusStyle: Record<string, { label: string; className: string }> = {
  pago: { label: "Pago", className: "bg-success/10 text-success border-success/20" },
  pendente: { label: "Pendente", className: "bg-warning/10 text-warning border-warning/20" },
  atrasado: { label: "Atrasado", className: "bg-destructive/10 text-destructive border-destructive/20" },
  cancelado: { label: "Cancelado", className: "bg-muted text-muted-foreground border-border" },
};

const emptyForm = {
  client_id: "", type: "receita" as string, category: "", description: "", amount: 0,
  due_date: "", payment_method: "", status: "pendente", supplier: "",
};

const Financial = () => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: transactions = [], isLoading } = useSupabaseQuery("transactions", {
    select: "*, clients(company)",
    orderBy: { column: "due_date", ascending: false },
  });
  const { data: clients = [] } = useSupabaseQuery("clients");
  const insertTx = useSupabaseInsert("transactions");
  const updateTx = useSupabaseUpdate("transactions");
  const deleteTx = useSupabaseDelete("transactions");

  const handleSave = () => {
    if (!form.description || !form.due_date) return;
    const values = { ...form, amount: Number(form.amount), client_id: form.client_id || null };
    if (editingId) {
      updateTx.mutate({ id: editingId, values }, { onSuccess: () => { setOpen(false); resetForm(); } });
    } else {
      insertTx.mutate(values as any, { onSuccess: () => { setOpen(false); resetForm(); } });
    }
  };

  const handleEdit = (t: any) => {
    setEditingId(t.id);
    setForm({ client_id: t.client_id || "", type: t.type, category: t.category || "", description: t.description, amount: t.amount, due_date: t.due_date, payment_method: t.payment_method || "", status: t.status, supplier: t.supplier || "" });
    setOpen(true);
  };

  const resetForm = () => { setForm(emptyForm); setEditingId(null); };

  const revenues = transactions.filter((t: any) => t.type === "receita");
  const totalRevenue = revenues.reduce((s: number, t: any) => s + t.amount, 0);
  const paid = revenues.filter((t: any) => t.status === "pago").reduce((s: number, t: any) => s + t.amount, 0);
  const pending = revenues.filter((t: any) => t.status === "pendente").reduce((s: number, t: any) => s + t.amount, 0);
  const expenses = transactions.filter((t: any) => t.type === "despesa").reduce((s: number, t: any) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Financeiro</h1><p className="text-muted-foreground text-sm mt-1">Controle de receitas e despesas</p></div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button className="gradient-primary text-primary-foreground gap-2"><Plus size={16} /> Nova Transação</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editingId ? "Editar Transação" : "Nova Transação"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receita">Receita</SelectItem>
                      <SelectItem value="despesa">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Select value={form.client_id} onValueChange={v => setForm(f => ({ ...f, client_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                    <SelectContent>{clients.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.company}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label>Descrição *</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Valor *</Label><Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} /></div>
                <div className="space-y-2"><Label>Vencimento *</Label><Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Método</Label><Input value={form.payment_method} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))} placeholder="Pix, Boleto..." /></div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="atrasado">Atrasado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {form.type === "despesa" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Categoria</Label><Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Fornecedor</Label><Input value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} /></div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => { setOpen(false); resetForm(); }}>Cancelar</Button>
              <Button onClick={handleSave} className="gradient-primary text-primary-foreground">{editingId ? "Salvar" : "Criar"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Faturamento", value: `R$ ${totalRevenue.toLocaleString("pt-BR")}`, icon: DollarSign, gradient: "gradient-primary" },
          { label: "Lucro Estimado", value: `R$ ${(totalRevenue - expenses).toLocaleString("pt-BR")}`, icon: TrendingUp, gradient: "gradient-success" },
          { label: "A Receber", value: `R$ ${pending.toLocaleString("pt-BR")}`, icon: Clock, gradient: "gradient-warning" },
          { label: "Pagas", value: `R$ ${paid.toLocaleString("pt-BR")}`, icon: CheckCircle, gradient: "gradient-primary" },
        ].map((s) => (
          <div key={s.label} className="stat-card"><div className="flex items-center justify-between"><div><p className="text-xs font-medium text-muted-foreground uppercase">{s.label}</p><p className="text-xl font-bold mt-1">{s.value}</p></div><div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.gradient}`}><s.icon size={20} className="text-primary-foreground" /></div></div></div>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : transactions.length === 0 ? (
        <div className="stat-card text-center py-12"><p className="text-muted-foreground">Nenhuma transação. Crie a primeira!</p></div>
      ) : (
        <div className="stat-card">
          <h3 className="font-semibold mb-4">Transações</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Tipo</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Descrição</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Cliente</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Valor</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Vencimento</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t: any) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="p-3"><Badge variant="outline" className={t.type === "receita" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}>{t.type === "receita" ? "Receita" : "Despesa"}</Badge></td>
                  <td className="p-3 text-sm font-medium">{t.description}</td>
                  <td className="p-3 text-sm text-muted-foreground">{t.clients?.company || "—"}</td>
                  <td className="p-3 text-sm font-semibold">R$ {t.amount.toLocaleString("pt-BR")}</td>
                  <td className="p-3 text-sm text-muted-foreground">{t.due_date}</td>
                  <td className="p-3"><Badge variant="outline" className={statusStyle[t.status]?.className}>{statusStyle[t.status]?.label}</Badge></td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(t)} className="p-1.5 rounded hover:bg-secondary"><Edit size={14} className="text-muted-foreground" /></button>
                      <button onClick={() => deleteTx.mutate(t.id)} className="p-1.5 rounded hover:bg-destructive/10"><Trash2 size={14} className="text-destructive" /></button>
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

export default Financial;
