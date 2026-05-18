import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PawPrint } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Đăng nhập quản trị — Pawfect Care" }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        setErr("Đã tạo tài khoản. Liên hệ quản trị viên để được cấp quyền admin, sau đó đăng nhập.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        nav({ to: "/admin" });
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-warm px-4">
      <div className="w-full max-w-md bg-card border rounded-3xl p-8 shadow-warm">
        <Link to="/" className="flex items-center gap-2 justify-center mb-6">
          <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
            <PawPrint className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-semibold">Pawfect Care</span>
        </Link>
        <h1 className="font-display text-2xl font-semibold text-center">
          {mode === "signin" ? "Đăng nhập quản trị" : "Tạo tài khoản"}
        </h1>
        <p className="text-sm text-muted-foreground text-center mt-1">
          Khu vực dành cho nhân viên hỗ trợ
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          {err && <p className="text-xs text-destructive">{err}</p>}
          <button
            disabled={loading}
            className="w-full rounded-lg bg-primary text-primary-foreground py-2.5 font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Đang xử lý..." : mode === "signin" ? "Đăng nhập" : "Đăng ký"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 w-full text-sm text-muted-foreground hover:text-primary"
        >
          {mode === "signin" ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập"}
        </button>

        <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-primary mt-6">
          ← Về trang chủ
        </Link>
      </div>
    </div>
  );
}
