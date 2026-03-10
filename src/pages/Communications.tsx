import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSupabaseQuery, useSupabaseInsert } from "@/hooks/useSupabaseQuery";
import { useAuth } from "@/contexts/AuthContext";

const Communications = () => {
  const { user } = useAuth();
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [message, setMessage] = useState("");

  const { data: clients = [] } = useSupabaseQuery("clients");
  const { data: messages = [], isLoading } = useSupabaseQuery("communications", {
    select: "*, clients(company)",
    orderBy: { column: "created_at", ascending: false },
    filter: selectedClient ? { column: "client_id", value: selectedClient } : undefined,
    enabled: !!selectedClient,
  });
  const sendMessage = useSupabaseInsert("communications");

  const handleSend = () => {
    if (!message.trim() || !selectedClient) return;
    if (message.trim().length > 2000) return;
    sendMessage.mutate({
      client_id: selectedClient,
      sender_id: user!.id,
      message: message.trim(),
      message_type: "mensagem",
    } as any, { onSuccess: () => setMessage("") });
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Comunicação</h1><p className="text-muted-foreground text-sm mt-1">Mensagens e comunicação com clientes</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="stat-card">
          <h3 className="font-semibold mb-3">Clientes</h3>
          <div className="space-y-2">
            {clients.map((c: any) => (
              <button
                key={c.id}
                onClick={() => setSelectedClient(c.id)}
                className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${selectedClient === c.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-secondary"}`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">{c.company.charAt(0)}</span>
                  </div>
                  <span>{c.company}</span>
                </div>
              </button>
            ))}
            {clients.length === 0 && <p className="text-sm text-muted-foreground">Nenhum cliente cadastrado</p>}
          </div>
        </div>

        <div className="lg:col-span-2 stat-card flex flex-col" style={{ minHeight: 400 }}>
          {!selectedClient ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Selecione um cliente para ver as mensagens</p>
              </div>
            </div>
          ) : (
            <>
              <h3 className="font-semibold mb-3">{(clients as any[]).find(c => c.id === selectedClient)?.company}</h3>
              <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-[400px]">
                {isLoading ? (
                  <p className="text-muted-foreground text-sm">Carregando...</p>
                ) : messages.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">Nenhuma mensagem ainda</p>
                ) : (
                  [...messages].reverse().map((msg: any) => (
                    <div key={msg.id} className="p-3 rounded-lg bg-secondary/50">
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{new Date(msg.created_at).toLocaleString("pt-BR")}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <Textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 min-h-[60px]"
                  maxLength={2000}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                />
                <Button onClick={handleSend} className="gradient-primary text-primary-foreground self-end" disabled={sendMessage.isPending || !message.trim()}>
                  <Send size={16} />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Communications;
