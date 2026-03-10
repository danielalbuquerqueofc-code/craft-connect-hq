import { useEffect, useState } from "react";
import { User, Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseQuery, useSupabaseUpdate } from "@/hooks/useSupabaseQuery";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: profiles = [] } = useSupabaseQuery("profiles", {
    filter: { column: "user_id", value: user?.id },
    enabled: !!user,
  });
  const updateProfile = useSupabaseUpdate("profiles");
  const profile = profiles[0] as any;

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  const handleSaveProfile = () => {
    if (!profile) return;
    if (!fullName.trim()) return;
    updateProfile.mutate({ id: profile.id, values: { full_name: fullName.trim(), phone: phone.trim() } });
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Configurações</h1><p className="text-muted-foreground text-sm mt-1">Gerencie seu perfil e preferências</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-4">
            <User size={18} className="text-primary" />
            <h3 className="font-semibold">Perfil</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Seu nome" maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(00) 00000-0000" maxLength={20} />
            </div>
            <Button onClick={handleSaveProfile} className="gradient-primary text-primary-foreground" disabled={updateProfile.isPending}>
              Salvar Perfil
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-4">
              <Bell size={18} className="text-primary" />
              <h3 className="font-semibold">Notificações</h3>
            </div>
            <div className="space-y-3">
              {["Tarefas atrasadas", "Cobranças vencidas", "Novas mensagens", "Renovações de contrato"].map(label => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm">{label}</span>
                  <Switch defaultChecked />
                </div>
              ))}
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-2 mb-4">
              <LogOut size={18} className="text-destructive" />
              <h3 className="font-semibold">Sessão</h3>
            </div>
            <Button variant="destructive" onClick={handleLogout} className="w-full">
              <LogOut size={16} className="mr-2" /> Sair da Conta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
