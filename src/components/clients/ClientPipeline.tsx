import { Badge } from "@/components/ui/badge";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { Edit, GripVertical } from "lucide-react";
import ClientScoreBadge from "./ClientScoreBadge";

interface Client {
  id: string;
  company: string;
  contact_name: string;
  email: string | null;
  phone: string | null;
  pipeline_stage: string;
  status: string;
  segment: string | null;
}

interface Transaction {
  id: string;
  client_id: string | null;
  amount: number;
  type: string;
  status: string;
}

const PIPELINE_STAGES = [
  { key: "lead", label: "Lead", color: "bg-info/20 border-info/30" },
  { key: "contato_feito", label: "Contato Feito", color: "bg-warning/20 border-warning/30" },
  { key: "proposta_enviada", label: "Proposta Enviada", color: "bg-primary/20 border-primary/30" },
  { key: "fechado", label: "Fechado", color: "bg-success/20 border-success/30" },
];

interface ClientPipelineProps {
  clients: Client[];
  transactions: Transaction[];
  onMoveStage: (clientId: string, newStage: string) => void;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
}

const ClientPipeline = ({ clients, transactions, onMoveStage, onEdit, onDelete }: ClientPipelineProps) => {
  const handleDragStart = (e: React.DragEvent, clientId: string) => {
    e.dataTransfer.setData("clientId", clientId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    const clientId = e.dataTransfer.getData("clientId");
    if (clientId) {
      onMoveStage(clientId, stage);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {PIPELINE_STAGES.map((stage) => {
        const stageClients = clients.filter((c) => (c.pipeline_stage || "lead") === stage.key);
        return (
          <div
            key={stage.key}
            className={`rounded-xl border p-3 min-h-[300px] ${stage.color}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.key)}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">{stage.label}</h3>
              <Badge variant="secondary" className="text-xs">{stageClients.length}</Badge>
            </div>
            <div className="space-y-2">
              {stageClients.map((client) => (
                <div
                  key={client.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, client.id)}
                  className="kanban-card"
                >
                  <div className="flex items-start gap-2">
                    <GripVertical size={14} className="text-muted-foreground mt-0.5 cursor-grab shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{client.company}</p>
                      <p className="text-xs text-muted-foreground truncate">{client.contact_name}</p>
                      {client.segment && (
                        <Badge variant="outline" className="text-[10px] mt-1">{client.segment}</Badge>
                      )}
                      <div className="mt-2">
                        <ClientScoreBadge clientId={client.id} transactions={transactions} compact />
                      </div>
                    </div>
                    <div className="flex gap-0.5 shrink-0">
                      <button onClick={() => onEdit(client)} className="p-1 rounded hover:bg-secondary">
                        <Edit size={12} className="text-muted-foreground" />
                      </button>
                      <DeleteConfirmDialog onConfirm={() => onDelete(client.id)} />
                    </div>
                  </div>
                </div>
              ))}
              {stageClients.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">
                  Arraste clientes aqui
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ClientPipeline;
