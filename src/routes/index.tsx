import { createFileRoute, Link } from "@tanstack/react-router";
import { PawPrint, Heart, Stethoscope, Scissors, Home, Shield, Star, MessageCircle } from "lucide-react";
import heroImg from "@/assets/hero-pets.jpg";
import { ChatWidget } from "@/components/ChatWidget";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pawfect Care — Hệ thống chăm sóc thú cưng tận tâm" },
      {
        name: "description",
        content:
          "Pawfect Care: dịch vụ thú y, spa, khách sạn và tư vấn 24/7 cho thú cưng của bạn. Chat trực tiếp với bác sĩ ngay hôm nay.",
      },
      { property: "og:title", content: "Pawfect Care — Chăm sóc thú cưng tận tâm" },
      { property: "og:description", content: "Thú y, spa, khách sạn & tư vấn realtime cho cún và mèo." },
    ],
  }),
  component: Index,
});

const services = [
  { icon: Stethoscope, title: "Khám & Tiêm phòng", desc: "Bác sĩ thú y giàu kinh nghiệm, trang thiết bị hiện đại." },
  { icon: Scissors, title: "Spa & Grooming", desc: "Tắm, cắt tỉa, vệ sinh tai móng bằng sản phẩm dịu nhẹ." },
  { icon: Home, title: "Khách sạn thú cưng", desc: "Phòng riêng, camera 24/7, chăm sóc cá nhân hóa." },
  { icon: Heart, title: "Tư vấn dinh dưỡng", desc: "Khẩu phần riêng theo độ tuổi, giống và tình trạng sức khỏe." },
];

const stats = [
  { n: "12K+", l: "Bé được chăm sóc" },
  { n: "98%", l: "Khách hài lòng" },
  { n: "24/7", l: "Tư vấn trực tuyến" },
  { n: "15+", l: "Bác sĩ chuyên môn" },
];

const testimonials = [
  { name: "Minh Anh", pet: "Sen vàng Mochi", text: "Đội ngũ rất tâm lý với bé nhà mình. Tư vấn qua chat phản hồi cực nhanh." },
  { name: "Hoàng Phúc", pet: "Mèo Anh Lông Ngắn", text: "Spa làm sạch tới từng kẽ móng, bé về thơm tho và vui vẻ hẳn." },
  { name: "Thuỳ Linh", pet: "Poodle Bơ", text: "Khách sạn xịn, có camera xem bé 24/7. Đi du lịch yên tâm hẳn." },
];

function Index() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-40 backdrop-blur bg-background/80 border-b">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
              <PawPrint className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-semibold">Pawfect Care</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="#services" className="hover:text-primary transition">Dịch vụ</a>
            <a href="#why" className="hover:text-primary transition">Tại sao chọn chúng tôi</a>
            <a href="#testimonials" className="hover:text-primary transition">Khách hàng</a>
            <Link to="/login" className="text-muted-foreground hover:text-primary transition">Quản trị</Link>
          </nav>
          <a
            href="#contact"
            className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90"
          >
            Đặt lịch
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-warm">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-card border px-3 py-1 text-xs font-medium text-muted-foreground">
              <PawPrint className="h-3.5 w-3.5 text-primary" /> Hệ thống chăm sóc thú cưng #1 Việt Nam
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-semibold mt-5 leading-tight">
              Yêu thương thú cưng <br />
              <span className="text-primary">như chính gia đình.</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-lg">
              Pawfect Care mang đến dịch vụ thú y, spa, khách sạn và tư vấn realtime — tất cả tại một nơi, tận tâm với từng chú cún, bé mèo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#contact"
                className="rounded-full bg-primary text-primary-foreground px-6 py-3 font-semibold hover:opacity-90 shadow-warm"
              >
                Đặt lịch ngay
              </a>
              <button
                onClick={() => document.querySelector<HTMLButtonElement>('[aria-label*="chat"]')?.click()}
                className="rounded-full border border-input bg-card px-6 py-3 font-semibold hover:bg-secondary flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" /> Chat với bác sĩ
              </button>
            </div>

            <div className="mt-10 grid grid-cols-4 gap-4">
              {stats.map((s) => (
                <div key={s.l}>
                  <p className="font-display text-2xl md:text-3xl font-semibold text-primary">{s.n}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-primary/10 rounded-[2rem] -rotate-2" />
            <img
              src={heroImg}
              alt="Một chú golden retriever và mèo tabby nằm cùng nhau trên chăn ấm"
              width={1536}
              height={1280}
              className="relative rounded-[2rem] shadow-warm w-full h-auto object-cover aspect-[5/4]"
            />
            <div className="absolute -bottom-5 -left-5 bg-card border rounded-2xl px-4 py-3 shadow-soft animate-float">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-sage/20 flex items-center justify-center">
                  <Heart className="h-4 w-4 text-sage" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Hôm nay</p>
                  <p className="text-sm font-semibold">42 bé được chăm sóc</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider">Dịch vụ</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold mt-2">
            Mọi thứ thú cưng cần, trong một nơi
          </h2>
          <p className="text-muted-foreground mt-3">
            Từ khám sức khoẻ định kỳ đến nghỉ dưỡng — đội ngũ Pawfect Care đồng hành cùng bé mỗi ngày.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
          {services.map((s) => (
            <div
              key={s.title}
              className="group bg-card border rounded-2xl p-6 hover:shadow-warm hover:-translate-y-1 transition-all"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-semibold mt-4">{s.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why */}
      <section id="why" className="bg-secondary/40">
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-8">
          {[
            { icon: Shield, title: "An toàn tuyệt đối", desc: "Cơ sở vô trùng, dụng cụ tiệt khuẩn sau mỗi lần sử dụng." },
            { icon: Heart, title: "Yêu thương thật sự", desc: "Nhân viên được đào tạo về tâm lý động vật, kiên nhẫn với bé nhút nhát." },
            { icon: MessageCircle, title: "Hỗ trợ realtime", desc: "Bác sĩ tư vấn qua chat 24/7, không để bạn lo lắng một mình." },
          ].map((w) => (
            <div key={w.title} className="flex gap-4">
              <div className="shrink-0 h-12 w-12 rounded-xl bg-card border flex items-center justify-center text-primary">
                <w.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold">{w.title}</h3>
                <p className="text-sm text-muted-foreground mt-1.5">{w.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider">Khách hàng nói gì</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold mt-2">
            Niềm tin của hàng ngàn gia đình
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5 mt-12">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-card border rounded-2xl p-6 shadow-soft">
              <div className="flex gap-0.5 text-primary">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed">"{t.text}"</p>
              <div className="mt-5 flex items-center gap-3 pt-4 border-t">
                <div className="h-10 w-10 rounded-full bg-accent/40 flex items-center justify-center font-semibold">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.pet}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="max-w-5xl mx-auto px-6 pb-20">
        <div className="bg-primary text-primary-foreground rounded-3xl p-10 md:p-14 text-center shadow-warm">
          <PawPrint className="h-10 w-10 mx-auto opacity-90" />
          <h2 className="font-display text-3xl md:text-4xl font-semibold mt-4">
            Sẵn sàng chăm sóc bé yêu của bạn?
          </h2>
          <p className="opacity-90 mt-3 max-w-lg mx-auto">
            Nhắn tin cho chúng tôi ngay — bác sĩ sẽ phản hồi trong vài phút.
          </p>
          <button
            onClick={() => document.querySelector<HTMLButtonElement>('[aria-label*="chat"]')?.click()}
            className="mt-6 inline-flex items-center gap-2 bg-card text-foreground rounded-full px-6 py-3 font-semibold hover:opacity-90"
          >
            <MessageCircle className="h-4 w-4" /> Bắt đầu trò chuyện
          </button>
        </div>
      </section>

      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 Pawfect Care. Made with 🐾 in Vietnam.</p>
          <Link to="/login" className="hover:text-primary">Đăng nhập quản trị</Link>
        </div>
      </footer>

      <ChatWidget />
    </div>
  );
}
