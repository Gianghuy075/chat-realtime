
-- Chat sessions
CREATE TABLE public.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_name text NOT NULL DEFAULT 'Khách',
  visitor_token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  sender text NOT NULL CHECK (sender IN ('guest','admin')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_messages_session ON public.chat_messages(session_id, created_at);
CREATE INDEX idx_chat_sessions_last ON public.chat_sessions(last_message_at DESC);

-- Admin users table (separate, not on profiles to avoid privilege escalation)
CREATE TABLE public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Helper: is_admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = _user_id)
$$;

-- chat_sessions policies
CREATE POLICY "Anyone can create session" ON public.chat_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can view sessions" ON public.chat_sessions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can update last_message_at" ON public.chat_sessions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can delete" ON public.chat_sessions FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- chat_messages policies
CREATE POLICY "Guests can insert guest messages" ON public.chat_messages FOR INSERT TO anon, authenticated WITH CHECK (sender = 'guest');
CREATE POLICY "Admins can insert admin messages" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (sender = 'admin' AND public.is_admin(auth.uid()));
CREATE POLICY "Anyone can read messages" ON public.chat_messages FOR SELECT TO anon, authenticated USING (true);

-- admin_users policies
CREATE POLICY "Admins can view admin list" ON public.admin_users FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER TABLE public.chat_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
