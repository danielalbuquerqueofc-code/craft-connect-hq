import { useState } from "react";
import { Plus, FolderOpen, File, Edit, Trash2, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseQuery, useSupabaseInsert, useSupabaseUpdate, useSupabaseDelete } from "@/hooks/useSupabaseQuery";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const typeMap: Record<string, { label: string; className: string }> = {
  contrato: { label: "Contrato", className: "bg-primary/10 text-primary" },
  proposta: { label: "Proposta", className: "bg-info/10 text-info" },
  relatorio: { label: "Relatório", className: "bg-success/10 text-success" },
  material: { label: "Material", className: "bg-warning/10 text-warning" },
  outro: { label: "Outro", className: "bg-muted text-muted-foreground" },
};

const emptyForm = { client_id: "", doc_type: "outro", title: "", description: "", project_name: "" };

const Documents = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [search, setSearch] = useState("");

  const { data: documents = [], isLoading } = useSupabaseQuery("documents", {
    select: "*, clients(company)",
    orderBy: { column: "created_at", ascending: false },
  });
  const { data: clients = [] } = useSupabaseQuery("clients");
  const insertDoc = useSupabaseInsert("documents");
  const updateDoc = useSupabaseUpdate("documents");
  const deleteDoc = useSupabaseDelete("documents");

  const handleSave = async () => {
    if (!form.title || !form.doc_type) return;
    let file_url = "";
    let file_name = "";

    if (file) {
      const ext = file.name.split(".").pop();
      const path = `${user!.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("documents").upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from("documents").getPublicUrl(path);
        file_url = data.publicUrl;
        file_name = file.name;
      }
    }

    const values = {
      ...form,
      client_id: form.client_id || null,
      uploaded_by: user!.id,
      ...(file_url ? { file_url, file_name } : {}),
    };

    if (editingId) {
      updateDoc.mutate({ id: editingId, values }, { onSuccess: () => { setOpen(false); resetForm(); } });
    } else {
      insertDoc.mutate(values as any, { onSuccess: () => { setOpen(false); resetForm(); } });
    }
  };

  const handleEdit = (d: any) => {
    setEditingId(d.id);
    setForm({ client_id: d.client_id || "", doc_type: d.doc_type, title: d.title, description: d.description || "", project_name: d.project_name || "" });
    setOpen(true);
  };

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setFile(null); };

  const filtered = documents.filter((d: any) =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    (d.clients?.company || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Documentos</h1><p className="text-muted-foreground text-sm mt-1">{documents.length} documentos</p></div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button className="gradient-primary text-primary-foreground gap-2"><Plus size={16} /> Novo Documento</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? "Editar Documento" : "Novo Documento"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Título *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select value={form.doc_type} onValueChange={v => setForm(f => ({ ...f, doc_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contrato">Contrato</SelectItem>
                      <SelectItem value="proposta">Proposta</SelectItem>
                      <SelectItem value="relatorio">Relatório</SelectItem>
                      <SelectItem value="material">Material</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
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
              <div className="space-y-2"><Label>Projeto</Label><Input value={form.project_name} onChange={e => setForm(f => ({ ...f, project_name: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Descrição</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Arquivo</Label><Input type="file" onChange={e => setFile(e.target.files?.[0] || null)} /></div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => { setOpen(false); resetForm(); }}>Cancelar</Button>
              <Button onClick={handleSave} className="gradient-primary text-primary-foreground">{editingId ? "Salvar" : "Criar"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Input placeholder="Buscar documentos..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        <FolderOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="stat-card text-center py-12"><p className="text-muted-foreground">Nenhum documento.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc: any) => (
            <div key={doc.id} className="stat-card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <File size={18} className="text-primary" />
                  <Badge variant="outline" className={typeMap[doc.doc_type]?.className}>{typeMap[doc.doc_type]?.label}</Badge>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(doc)} className="p-1 rounded hover:bg-secondary"><Edit size={14} className="text-muted-foreground" /></button>
                  <button onClick={() => deleteDoc.mutate(doc.id)} className="p-1 rounded hover:bg-destructive/10"><Trash2 size={14} className="text-destructive" /></button>
                </div>
              </div>
              <h3 className="font-medium text-sm mb-1">{doc.title}</h3>
              <p className="text-xs text-muted-foreground mb-2">{doc.clients?.company || "Sem cliente"}</p>
              {doc.description && <p className="text-xs text-muted-foreground mb-2">{doc.description}</p>}
              {doc.file_url && (
                <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 hover:underline">
                  <Download size={12} /> {doc.file_name || "Download"}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Documents;
