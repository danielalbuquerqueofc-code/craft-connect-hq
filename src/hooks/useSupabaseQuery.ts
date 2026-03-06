import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type TableName = keyof Database["public"]["Tables"];

export function useSupabaseQuery<T extends TableName>(
  table: T,
  options?: {
    select?: string;
    orderBy?: { column: string; ascending?: boolean };
    filter?: { column: string; value: any };
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: [table, options?.filter],
    queryFn: async () => {
      let query = supabase.from(table).select(options?.select || "*");
      if (options?.filter) {
        query = query.eq(options.filter.column as any, options.filter.value);
      }
      if (options?.orderBy) {
        query = query.order(options.orderBy.column as any, { ascending: options.orderBy.ascending ?? false });
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: options?.enabled !== false,
  });
}

export function useSupabaseInsert<T extends TableName>(table: T) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (values: Database["public"]["Tables"][T]["Insert"]) => {
      const { data, error } = await supabase.from(table).insert(values as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
      toast({ title: "Sucesso", description: "Registro criado com sucesso!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });
}

export function useSupabaseUpdate<T extends TableName>(table: T) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Database["public"]["Tables"][T]["Update"] }) => {
      const { data, error } = await supabase.from(table).update(values as any).eq("id", id as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
      toast({ title: "Sucesso", description: "Registro atualizado!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });
}

export function useSupabaseDelete<T extends TableName>(table: T) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
      toast({ title: "Sucesso", description: "Registro removido!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });
}
