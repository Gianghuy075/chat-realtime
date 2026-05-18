import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PawPrint, Send, LogOut, MessageSquare, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Quản lý chat realtime — Pawfect Care" }] }),
  component: AdminPage,
});

type Session = { id: string; visitor_name: string; last_message_at: string; status: string };
type Msg = { id: string; session_id: string; sender: "guest" | "admin"; content: string; created_at: string };

function AdminPage() {
  const nav = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auth gate
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        nav({ to: "/login" });
        return;
      }
      setUserEmail(session.user.email ?? "");
      const { data: adminRow } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (!mounted) return;
      setIsAdmin(!!adminRow);
      setChecking(false);
    })();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!s) nav({ to: "/login" });
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [nav]);

  // Load + subscribe sessions
  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      const { data } = await supabase
        .from("chat_sessions")
        .select("*")
        .order("last_message_at", { ascending: false })
        .limit(100);
      if (data) setSessions(data as Session[]);
    };
    load();

    const ch = supabase
      .channel("admin:sessions")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_sessions" }, () => load())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, () => load())
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [isAdmin]);

  // Load + subscribe messages of active conversation
  useEffect(() => {
    if (!activeId) return;
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", activeId)
        .order("created_at", { ascending: true });
      if (mounted && data) setMessages(data as Msg[]);
    })();

    const ch = supabase
      .channel(`admin:msg:${activeId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `session_id=eq.${activeId}` },
        (payload) => {
          setMessages((p) =>
            p.some((m) => m.id === (payload.new as Msg).id) ? p : [...p, payload.new as Msg],
          );
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(ch);
    };
  }, [activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const reply = async () => {
    if (!input.trim() || !activeId) return;
    const content = input.trim();
    setInput("");
    const { error } = await supabase.from("chat_messages").insert({
      session_id: activeId,
      sender: "admin",
      content,
    });
    if (error) console.error(error);
    await supabase
      .from("chat_sessions")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", activeId);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    nav({ to: "/login" });
  };

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Đang tải...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-card border rounded-2xl p-8 shadow-soft">
          <ShieldAlert className="h-10 w-10 text-primary mx-auto" />
          <h1 className="font-display text-2xl font-semibold mt-4">Chưa có quyền truy cập</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Tài khoản <span className="font-semibold">{userEmail}</span> chưa được cấp quyền admin.
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            Liên hệ quản trị viên để thêm user_id của bạn vào bảng <code className="bg-secondary px-1 rounded">admin_users</code>.
          </p>
          <button onClick={logout} className="mt-5 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold">
            Đăng xuất
          </button>
        </div>
      </div>
    );
  }

  const active = sessions.find((s) => s.id === activeId);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <PawPrint className="h-4 w-4" />
            </div>
            <span className="font-display font-semibold">Pawfect Care · Admin</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground hidden sm:inline">{userEmail}</span>
            <button onClick={logout} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary">
              <LogOut className="h-4 w-4" /> Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-[320px_1fr] overflow-hidden">
        {/* Sessions list */}
        <aside className="border-r overflow-y-auto bg-secondary/30">
          <div className="p-4 border-b bg-card">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Hội thoại ({sessions.length})
            </p>
          </div>
          {sessions.length === 0 && (
            <p className="p-6 text-sm text-muted-foreground text-center">Chưa có hội thoại nào.</p>
          )}
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveId(s.id)}
              className={cn(
                "w-full text-left px-4 py-3 border-b hover:bg-card transition-colors",
                activeId === s.id && "bg-card border-l-4 border-l-primary",
              )}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-accent/40 flex items-center justify-center font-semibold text-sm">
                  {s.visitor_name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{s.visitor_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(s.last_message_at).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </aside>

        {/* Chat panel */}
        <main className="flex flex-col overflow-hidden">
          {!activeId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 opacity-40" />
              <p className="mt-3 text-sm">Chọn một hội thoại để bắt đầu</p>
            </div>
          ) : (
            <>
              <div className="border-b px-6 py-3 bg-card">
                <p className="font-semibold">{active?.visitor_name}</p>
                <p className="text-xs text-muted-foreground">Realtime · {messages.length} tin nhắn</p>
              </div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-3 bg-gradient-warm">
                {messages.map((m) => (
                  <div key={m.id} className={cn("flex", m.sender === "admin" ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-soft",
                        m.sender === "admin"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-card rounded-bl-sm",
                      )}
                    >
                      <p>{m.content}</p>
                      <p className={cn("text-[10px] mt-1 opacity-70")}>
                        {new Date(m.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  reply();
                }}
                className="border-t bg-card p-4 flex gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Nhập tin nhắn trả lời..."
                  className="flex-1 rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-primary text-primary-foreground px-5 flex items-center gap-2 font-semibold hover:opacity-90"
                >
                  <Send className="h-4 w-4" /> Gửi
                </button>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
