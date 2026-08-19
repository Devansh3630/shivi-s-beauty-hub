REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;

DROP POLICY "offers public read" ON public.offers;
CREATE POLICY "offers anon read" ON public.offers FOR SELECT TO anon USING (is_active);
CREATE POLICY "offers auth read" ON public.offers FOR SELECT TO authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));