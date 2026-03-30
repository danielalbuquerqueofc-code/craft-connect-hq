
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS pipeline_stage text NOT NULL DEFAULT 'lead';

COMMENT ON COLUMN public.clients.pipeline_stage IS 'Pipeline de vendas: lead, contato_feito, proposta_enviada, fechado';
