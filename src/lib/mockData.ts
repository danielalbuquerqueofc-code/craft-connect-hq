export const stats = {
  totalClients: 47,
  activeContracts: 38,
  renewingSoon: 5,
  tasksInProgress: 23,
  overdueTasks: 4,
  monthlyRevenue: 89500,
  receivables: 34200,
  paidInvoices: 55300,
  weeklyDeliveries: 12,
};

export const clients = [
  { id: "1", company: "Tech Solutions Ltda", contact: "Carlos Silva", email: "carlos@techsolutions.com", phone: "(11) 99999-1234", segment: "Tecnologia", status: "ativo" as const, entryDate: "2024-01-15", revenue: 4500 },
  { id: "2", company: "Marketing Digital Pro", contact: "Ana Souza", email: "ana@mdpro.com", phone: "(21) 98888-5678", segment: "Marketing", status: "ativo" as const, entryDate: "2024-03-20", revenue: 3200 },
  { id: "3", company: "Construtora ABC", contact: "Roberto Lima", email: "roberto@abc.com", phone: "(31) 97777-9012", segment: "Construção", status: "ativo" as const, entryDate: "2023-11-05", revenue: 7800 },
  { id: "4", company: "Clínica Saúde+", contact: "Dra. Fernanda", email: "fernanda@saude.com", phone: "(41) 96666-3456", segment: "Saúde", status: "ativo" as const, entryDate: "2024-06-10", revenue: 2800 },
  { id: "5", company: "E-commerce Fast", contact: "Lucas Mendes", email: "lucas@efast.com", phone: "(51) 95555-7890", segment: "E-commerce", status: "lead" as const, entryDate: "2025-01-08", revenue: 0 },
  { id: "6", company: "Advocacia Torres", contact: "Dr. Pedro Torres", email: "pedro@torres.adv", phone: "(61) 94444-2345", segment: "Jurídico", status: "pausado" as const, entryDate: "2023-08-22", revenue: 5100 },
];

export const tasks = [
  { id: "1", client: "Tech Solutions Ltda", title: "Redesign do site institucional", assignee: "Maria", priority: "alta" as const, status: "em_andamento" as const, dueDate: "2025-03-15", description: "Criar novo layout responsivo" },
  { id: "2", client: "Marketing Digital Pro", title: "Campanha Google Ads", assignee: "João", priority: "alta" as const, status: "a_fazer" as const, dueDate: "2025-03-20", description: "Configurar campanhas de busca" },
  { id: "3", client: "Construtora ABC", title: "Relatório mensal de métricas", assignee: "Ana", priority: "media" as const, status: "revisao" as const, dueDate: "2025-03-10", description: "Compilar dados de performance" },
  { id: "4", client: "Clínica Saúde+", title: "Landing page para captação", assignee: "Maria", priority: "media" as const, status: "em_andamento" as const, dueDate: "2025-03-18", description: "Criar LP de agendamento" },
  { id: "5", client: "Tech Solutions Ltda", title: "SEO On-page", assignee: "João", priority: "baixa" as const, status: "aguardando" as const, dueDate: "2025-03-25", description: "Otimização de conteúdo" },
  { id: "6", client: "Marketing Digital Pro", title: "Identidade visual", assignee: "Ana", priority: "alta" as const, status: "concluido" as const, dueDate: "2025-02-28", description: "Manual de marca completo" },
  { id: "7", client: "Construtora ABC", title: "Automação de email marketing", assignee: "Maria", priority: "media" as const, status: "a_fazer" as const, dueDate: "2025-03-22", description: "Fluxos de nutrição" },
  { id: "8", client: "Clínica Saúde+", title: "Gestão de redes sociais", assignee: "João", priority: "baixa" as const, status: "em_andamento" as const, dueDate: "2025-03-30", description: "Conteúdo para Instagram e Facebook" },
];

export const revenueData = [
  { month: "Set", revenue: 62000 },
  { month: "Out", revenue: 71000 },
  { month: "Nov", revenue: 68000 },
  { month: "Dez", revenue: 82000 },
  { month: "Jan", revenue: 75000 },
  { month: "Fev", revenue: 89500 },
];

export const revenueByClient = [
  { name: "Construtora ABC", value: 7800 },
  { name: "Advocacia Torres", value: 5100 },
  { name: "Tech Solutions", value: 4500 },
  { name: "Marketing Pro", value: 3200 },
  { name: "Clínica Saúde+", value: 2800 },
];

export const financialTransactions = [
  { id: "1", client: "Tech Solutions Ltda", service: "Consultoria Web", amount: 4500, dueDate: "2025-03-05", status: "pago" as const, method: "Pix" },
  { id: "2", client: "Marketing Digital Pro", service: "Gestão de Ads", amount: 3200, dueDate: "2025-03-10", status: "pendente" as const, method: "Boleto" },
  { id: "3", client: "Construtora ABC", service: "Marketing 360", amount: 7800, dueDate: "2025-03-01", status: "pago" as const, method: "Transferência" },
  { id: "4", client: "Clínica Saúde+", service: "Social Media", amount: 2800, dueDate: "2025-03-15", status: "pendente" as const, method: "Pix" },
  { id: "5", client: "Advocacia Torres", service: "Consultoria SEO", amount: 5100, dueDate: "2025-02-28", status: "atrasado" as const, method: "Boleto" },
  { id: "6", client: "E-commerce Fast", service: "Setup Loja", amount: 12000, dueDate: "2025-03-20", status: "pendente" as const, method: "Cartão" },
];
