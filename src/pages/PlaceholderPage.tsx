import { Construction } from "lucide-react";

const PlaceholderPage = ({ title, description }: { title: string; description: string }) => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground text-sm mt-1">{description}</p>
    </div>
    <div className="stat-card flex flex-col items-center justify-center py-20">
      <Construction size={48} className="text-muted-foreground mb-4" />
      <h2 className="text-lg font-semibold mb-2">Em Desenvolvimento</h2>
      <p className="text-muted-foreground text-sm text-center max-w-md">
        Este módulo está sendo construído. Em breve você terá acesso completo a todas as funcionalidades.
      </p>
    </div>
  </div>
);

export default PlaceholderPage;
