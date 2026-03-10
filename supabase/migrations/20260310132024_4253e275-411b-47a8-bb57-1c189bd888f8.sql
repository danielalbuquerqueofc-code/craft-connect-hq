
-- 1. Security definer function for client ownership check
CREATE OR REPLACE FUNCTION public.owns_client(_client_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clients
    WHERE id = _client_id AND user_id = auth.uid()
  )
$$;

-- 2. Add user_id to automations and transactions
ALTER TABLE public.automations ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS user_id uuid;

-- 3. Fix RLS: clients - filter by own user_id
DROP POLICY IF EXISTS "Authenticated users can manage clients" ON public.clients;
CREATE POLICY "Users manage own clients" ON public.clients FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 4. Fix RLS: contracts - via client ownership
DROP POLICY IF EXISTS "Authenticated users can manage contracts" ON public.contracts;
CREATE POLICY "Users manage own contracts" ON public.contracts FOR ALL TO authenticated
  USING (public.owns_client(client_id)) WITH CHECK (public.owns_client(client_id));

-- 5. Fix RLS: tasks - via client ownership
DROP POLICY IF EXISTS "Authenticated users can manage tasks" ON public.tasks;
CREATE POLICY "Users manage own tasks" ON public.tasks FOR ALL TO authenticated
  USING (public.owns_client(client_id)) WITH CHECK (public.owns_client(client_id));

-- 6. Fix RLS: deliveries - via client ownership
DROP POLICY IF EXISTS "Authenticated users can manage deliveries" ON public.deliveries;
CREATE POLICY "Users manage own deliveries" ON public.deliveries FOR ALL TO authenticated
  USING (public.owns_client(client_id)) WITH CHECK (public.owns_client(client_id));

-- 7. Fix RLS: transactions - by user_id
DROP POLICY IF EXISTS "Authenticated users can manage transactions" ON public.transactions;
CREATE POLICY "Users manage own transactions" ON public.transactions FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 8. Fix RLS: invoices - via client ownership
DROP POLICY IF EXISTS "Authenticated users can manage invoices" ON public.invoices;
CREATE POLICY "Users manage own invoices" ON public.invoices FOR ALL TO authenticated
  USING (public.owns_client(client_id)) WITH CHECK (public.owns_client(client_id));

-- 9. Fix RLS: documents - by uploaded_by or client ownership
DROP POLICY IF EXISTS "Authenticated users can manage documents" ON public.documents;
CREATE POLICY "Users manage own documents" ON public.documents FOR ALL TO authenticated
  USING (uploaded_by = auth.uid() OR (client_id IS NOT NULL AND public.owns_client(client_id)))
  WITH CHECK (uploaded_by = auth.uid() OR (client_id IS NOT NULL AND public.owns_client(client_id)));

-- 10. Fix RLS: communications - by sender or client ownership
DROP POLICY IF EXISTS "Authenticated users can manage communications" ON public.communications;
CREATE POLICY "Users manage own communications" ON public.communications FOR ALL TO authenticated
  USING (sender_id = auth.uid() OR public.owns_client(client_id))
  WITH CHECK (sender_id = auth.uid());

-- 11. Fix RLS: automations - by user_id
DROP POLICY IF EXISTS "Authenticated users can manage automations" ON public.automations;
CREATE POLICY "Users manage own automations" ON public.automations FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 12. Attach handle_new_user trigger to auth.users (standard Supabase pattern)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
