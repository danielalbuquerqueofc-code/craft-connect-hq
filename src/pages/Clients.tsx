import { useState } from "react";
import { Search, Plus, Edit, Kanban, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSupabaseQuery, useSupabaseInsert, useSupabaseUpdate, useSupabaseDelete } from "@/hooks/useSupabaseQuery";
import { useAuth } from "@/contexts/AuthContext";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import ClientPipeline from "@/components/clients/ClientPipeline";
import ClientScoreBadge from "@/components/clients/ClientScoreBadge";

const statusMap: Record<string, { label: string; className: string }> = {
  ativo: { label: "Ativo", className: "bg-success/10 text-success border-success/20" },
  lead: { label: "Lead", className: "bg-info/10 text-info border-info/20" },
  pausado: { label: "Pausado", className: "bg-muted text-muted-foreground border-border" },
  cancelado: { label: "Cancelado", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const emptyForm = {
  company: "", contact_name: "", cpf_cnpj: "", phone: "", whatsapp: "", email: "",
  address: "", segment: "", status: "lead" as string, notes: "", pipeline_stage: "lead" as string,
};

const Clients = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<"list" | "pipeline">("list");

  const { data: clients = [], isLoading } = useSupabaseQuery("clients", { orderBy: { column: "created_at", ascending: false } });
  const { data: transactions = [] } = useSupabaseQuery("transactions", { select: "*, clients(company)" });
  const insertClient = useSupabaseInsert("clients");
  const updateClient = useSupabaseUpdate("clients");
  const deleteClient = useSupabaseDelete("clients");

  const filtered = (clients as any[]).filter((c) =>
    c.company.toLowerCase().includes(search.toLowerCase()) ||
    c.contact_name.toLowerCase().includes(search.toLowerCase())
  );

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.company.trim()) errs.company = "Empresa é obrigatória";
    if (form.company.length > 200) errs.company = "Máximo 200 caracteres";
    if (!form.contact_name.trim()) errs.contact_name = "Contato é obrigatório";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Email inválido";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const values = {
      company: form.company.trim(),
      contact_name: form.contact_name.trim(),
      cpf_cnpj: form.cpf_cnpj.trim() || null,
      phone: form.phone.trim() || null,
      whatsapp: form.whatsapp.trim() || null,
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      segment: form.segment.trim() || null,
      status: form.status,
      notes: form.notes.trim() || null,
      pipeline_stage: form.pipeline_stage,
    };
    if (editingId) {
      updateClient.mutate({ id: editingId, values }, { onSuccess: () => { setOpen(false); resetForm(); } });
    } else {
      insertClient.mutate({ ...values, user_id: user!.id } as any, { onSuccess: () => { setOpen(false); resetForm(); } });
    }
  };

  const handleEdit = (client: any) => {
    setEditingId(client.id);
    setForm({
      company: client.company, contact_name: client.contact_name, cpf_cnpj: client.cpf_cnpj || "",
      phone: client.phone || "", whatsapp: client.whatsapp || "", email: client.email || "",
      address: client.address || "", segment: client.segment || "", status: client.status,
      notes: client.notes || "", pipeline_stage: client.pipeline_stage || "lead",
    });
    setErrors({});
    setOpen(true);
  };

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setErrors({}); };

  const handlePipelineMove = (clientId: string, newStage: string) => {
    const statusByStage: Record<string, string> = {
      lead: "lead", contato_feito: "lead", proposta_enviada: "lead", fechado: "ativo",
    };
    updateClient.mutate({
      id: clientId,
      values: { pipeline_stage: newStage, status: statusByStage[newStage] || "lead" },
    });
  };

  const clientFormDialog = (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className="gradient-primary text-primary-foreground gap-2">
          <Plus size={16} /> Novo Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingId ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Empresa *</Label>
            <Input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Nome da empresa" maxLength={200} />
            {errors.company && <p className="text-xs text-destructive">{errors.company}</p>}
          </div>
          <div className="space-y-2">
            <Label>Contato *</Label>
            <Input value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} placeholder="Nome do responsável" maxLength={100} />
            {errors.contact_name && <p className="text-xs text-destructive">{errors.contact_name}</p>}
          </div>
          <div className="space-y-2">
            <Label>CPF/CNPJ</Label>
            <Input value={form.cpf_cnpj} onChange={e => setForm(f => ({ ...f, cpf_cnpj: e.target.value }))} placeholder="CPF ou CNPJ" maxLength={18} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@empresa.com" maxLength={255} />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(00) 0000-0000" maxLength={20} />
          </div>
          <div className="space-y-2">
            <Label>WhatsApp</Label>
            <Input value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="(00) 00000-0000" maxLength={20} />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Endereço</Label>
            <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Endereço completo" maxLength={300} />
          </div>
          <div className="space-y-2">
            <Label>Segmento</Label>
            <Input value={form.segment} onChange={e => setForm(f => ({ ...f, segment: e.target.value }))} placeholder="Ex: Tecnologia" maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="pausado">Pausado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Etapa do Pipeline</Label>
            <Select value={form.pipeline_stage} onValueChange={v => setForm(f => ({ ...f, pipeline_stage: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="contato_feito">Contato Feito</SelectItem>
                <SelectItem value="proposta_enviada">Proposta Enviada</SelectItem>
                <SelectItem value="fechado">Fechado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Observações</Label>
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Anotações sobre o cliente" maxLength={1000} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => { setOpen(false); resetForm(); }}>Cancelar</Button>
          <Button onClick={handleSave} className="gradient-primary text-primary-foreground" disabled={insertClient.isPending || updateClient.isPending}>
            {editingId ? "Salvar" : "Criar Cliente"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-muted-foreground text-sm mt-1">{clients.length} clientes cadastrados</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-secondary"}`}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode("pipeline")}
              className={`p-2 ${viewMode === "pipeline" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-secondary"}`}
            >
              <Kanban size={16} />
            </button>
          </div>
          {clientFormDialog}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar clientes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : viewMode === "pipeline" ? (
        <ClientPipeline
          clients={filtered}
          transactions={transactions as any[]}
          onMoveStage={handlePipelineMove}
          onEdit={handleEdit}
          onDelete={(id) => deleteClient.mutate(id)}
        />
      ) : filtered.length === 0 ? (
        <div className="stat-card text-center py-12">
          <p className="text-muted-foreground">Nenhum cliente encontrado. Crie o primeiro!</p>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-secondary/50">
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Empresa</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Contato</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Pipeline</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Score</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client: any) => (
                <tr key={client.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold text-sm">{client.company.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{client.company}</p>
                        <p className="text-xs text-muted-foreground">{client.email || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <p className="text-sm">{client.contact_name}</p>
                    <p className="text-xs text-muted-foreground">{client.phone || "—"}</p>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline" className="text-xs">
                      {pipelineStageLabel(client.pipeline_stage)}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <ClientScoreBadge clientId={client.id} transactions={transactions as any[]} />
                  </td>
                  <td className="p-3">
                    <Badge variant="outline" className={statusMap[client.status]?.className}>
                      {statusMap[client.status]?.label || client.status}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(client)} className="p-1.5 rounded hover:bg-secondary"><Edit size={14} className="text-muted-foreground" /></button>
                      <DeleteConfirmDialog onConfirm={() => deleteClient.mutate(client.id)} />
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

function pipelineStageLabel(stage: string): string {
  const labels: Record<string, string> = {
    lead: "Lead",
    contato_feito: "Contato Feito",
    proposta_enviada: "Proposta Enviada",
    fechado: "Fechado",
  };
  return labels[stage] || stage;
}

export default Clients;
