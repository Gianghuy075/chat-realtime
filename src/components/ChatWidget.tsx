import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, PawPrint } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type Msg = { id: string; sender: "guest" | "admin"; content: string; created_at: string };

function getOrCreateToken() {
  if (typeof window === "undefined") return "";
  let t = localStorage.getItem("pet_chat_token");
  if (!t) {
    t = crypto.randomUUID();
    localStorage.setItem("pet_chat_token", t);
  }
  return t;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [started, setStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // restore session on mount
  useEffect(() => {
    const savedName = localStorage.getItem("pet_chat_name");
    const savedSession = localStorage.getItem("pet_chat_session_id");
    if (savedName) setName(savedName);
    if (savedSession) {
      setSessionId(savedSession);
      setStarted(true);
    }
  }, []);

  // load + subscribe messages
  useEffect(() => {
    if (!sessionId) return;
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });
      if (mounted && data) setMessages(data as Msg[]);
    })();

    const channel = supabase
      .channel(`chat:${sessionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `session_id=eq.${sessionId}` },
        (payload) => {
          setMessages((prev) =>
            prev.some((m) => m.id === (payload.new as Msg).id) ? prev : [...prev, payload.new as Msg],
          );
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const startChat = async () => {
    const token = getOrCreateToken();
    const visitor = name.trim() || "Khách";
    localStorage.setItem("pet_chat_name", visitor);

    // upsert session by visitor_token
    const { data: existing } = await supabase
      .from("chat_sessions")
      .select("id")
      .eq("visitor_token", token)
      .maybeSingle();

    let sid = existing?.id;
    if (!sid) {
      const { data, error } = await supabase
        .from("chat_sessions")
        .insert({ visitor_token: token, visitor_name: visitor })
        .select("id")
        .single();
      if (error) return console.error(error);
      sid = data.id;
    }
    localStorage.setItem("pet_chat_session_id", sid!);
    setSessionId(sid!);
    setStarted(true);

    // greeting from "admin"
    await supabase.from("chat_messages").insert({
      session_id: sid,
      sender: "guest",
      content: `Xin chào, mình là ${visitor}. Mình cần tư vấn về chăm sóc thú cưng.`,
    });
  };

  const send = async () => {
    if (!input.trim() || !sessionId) return;
    const content = input.trim();
    setInput("");
    await supabase.from("chat_messages").insert({ session_id: sessionId, sender: "guest", content });
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Đóng chat" : "Mở chat tư vấn"}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-warm",
          "flex items-center justify-center transition-transform hover:scale-110 relative",
          !open && "pulse-ring",
        )}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Panel */}
      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] origin-bottom-right",
          "rounded-2xl bg-card shadow-warm border overflow-hidden transition-all duration-200",
          open ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none",
        )}
        style={{ height: "520px" }}
      >
        <div className="bg-primary text-primary-foreground p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary-foreground/15 flex items-center justify-center">
            <PawPrint className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-display text-lg leading-tight">Pawfect Care</p>
            <p className="text-xs opacity-90 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-sage inline-block" />
              Đang trực tuyến
            </p>
          </div>
        </div>

        {!started ? (
          <div className="p-6 flex flex-col h-[calc(100%-72px)]">
            <p className="text-sm text-muted-foreground mb-4">
              Để lại tên để bắt đầu trò chuyện với chuyên viên chăm sóc thú cưng của chúng tôi.
            </p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên của bạn"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={startChat}
              className="mt-3 w-full rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-semibold hover:opacity-90"
            >
              Bắt đầu chat
            </button>
            <p className="text-xs text-muted-foreground mt-auto pt-4">
              Thường phản hồi trong vòng vài phút 🐾
            </p>
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="overflow-y-auto p-4 space-y-3" style={{ height: "calc(100% - 72px - 64px)" }}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn("flex", m.sender === "guest" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-soft",
                      m.sender === "guest"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-secondary text-secondary-foreground rounded-bl-sm",
                    )}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <p className="text-xs text-muted-foreground text-center">Đang kết nối...</p>
              )}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="border-t p-3 flex gap-2 bg-background"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </>
  );
}
