import { UsersRound, Shield, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";

const Team = () => {
  const { data: profiles = [], isLoading } = useSupabaseQuery("profiles", {
    orderBy: { column: "created_at", ascending: false },
  });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Equipe</h1><p className="text-muted-foreground text-sm mt-1">{profiles.length} membros</p></div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : profiles.length === 0 ? (
        <div className="stat-card text-center py-12"><p className="text-muted-foreground">Nenhum membro cadastrado.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((p: any) => (
            <div key={p.id} className="stat-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">{(p.full_name || "U").charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-medium">{p.full_name || "Usuário"}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail size={10} /> {p.user_id?.substring(0, 8)}...</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-muted-foreground" />
                <Badge variant="outline">Membro</Badge>
                {p.phone && <span className="text-xs text-muted-foreground">{p.phone}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Team;
