import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Transaction {
  id: string;
  client_id: string | null;
  amount: number;
  type: string;
  status: string;
}

interface ClientScoreBadgeProps {
  clientId: string;
  transactions: Transaction[];
  compact?: boolean;
}

function calculateScore(clientId: string, transactions: Transaction[]): { score: number; label: string; revenue: number } {
  const clientTx = transactions.filter((t) => t.client_id === clientId && t.type === "receita");
  const totalRevenue = clientTx.reduce((sum, t) => sum + t.amount, 0);
  const paidCount = clientTx.filter((t) => t.status === "pago").length;
  const totalCount = clientTx.length;
  const paymentRate = totalCount > 0 ? paidCount / totalCount : 0;

  let score = 0;
  if (totalRevenue >= 10000) score += 40;
  else if (totalRevenue >= 5000) score += 30;
  else if (totalRevenue >= 1000) score += 20;
  else score += 10;

  score += Math.round(paymentRate * 40);
  score += Math.min(totalCount * 5, 20);

  let label = "Baixo";
  if (score >= 80) label = "Excelente";
  else if (score >= 60) label = "Bom";
  else if (score >= 40) label = "Regular";

  return { score, label, revenue: totalRevenue };
}

const ClientScoreBadge = ({ clientId, transactions, compact }: ClientScoreBadgeProps) => {
  const { score, label, revenue } = calculateScore(clientId, transactions);

  const colorClass =
    score >= 80 ? "bg-success/10 text-success border-success/20" :
    score >= 60 ? "bg-info/10 text-info border-info/20" :
    score >= 40 ? "bg-warning/10 text-warning border-warning/20" :
    "bg-muted text-muted-foreground border-border";

  const Icon = score >= 60 ? TrendingUp : score >= 40 ? Minus : TrendingDown;

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Icon size={10} />
        <span className="text-[10px] font-medium">{score}pts</span>
      </div>
    );
  }

  return (
    <Badge variant="outline" className={`${colorClass} gap-1`}>
      <Icon size={12} />
      {label} ({score})
    </Badge>
  );
};

export default ClientScoreBadge;
