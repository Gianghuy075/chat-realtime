
DROP POLICY "Anyone can update last_message_at" ON public.chat_sessions;
CREATE POLICY "Admin can update sessions" ON public.chat_sessions
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
