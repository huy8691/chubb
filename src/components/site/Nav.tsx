"use client";
/**
 * nav/guest và nav/logged — một component, đổi trạng thái theo phiên.
 * Sau đăng nhập: thay "Đăng nhập TVV" bằng chuông (G07) + tên TVV (mở menu G05).
 * Ô tìm toàn site là ICON mở popup (giữ header 1 dòng); popup → S01. A01 dùng chung (08/09, bỏ A02).
 */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { R, TABS } from "@/lib/routes";
import { useCurrentAdvisor, useStore } from "@/lib/store";
import { Avatar, cx } from "@/components/ui";
import { fmtDateTime } from "@/lib/seed";

export function Nav({ active }: { active?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data, actions } = useStore();
  const tvv = useCurrentAdvisor();
  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menu, setMenu] = useState<"none" | "account" | "notif">("none");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setMenu("none"); };
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") { setMenu("none"); setSearchOpen(false); } };
    document.addEventListener("mousedown", h);
    document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); };
  }, []);

  const activeCode = active ?? TABS.find((t) => pathname.startsWith(t.href))?.code ?? (pathname === "/" ? "A01" : "");
  const notifs = tvv ? data.notifications.filter((n) => n.advisorMa === tvv.ma) : [];
  const unread = notifs.filter((n) => !n.daDoc).length;
  const submitSearch = (e: React.FormEvent) => { e.preventDefault(); if (q.trim()) { setSearchOpen(false); router.push(R.S01(q.trim())); } };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-vien2">
      <div className="wrap h-16 flex items-center gap-6">
        <Link href={R.A01} className="flex items-center gap-1 shrink-0 lg:mr-6" aria-label="Chubb Life — Trang chủ">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/chubb.svg" alt="Chubb" className="h-5" />
        </Link>
        <nav className="hidden lg:flex items-center gap-5 text-[13.5px] font-bold whitespace-nowrap" aria-label="Chính">
          <Link href={R.A01} className={cx("shrink-0 hover:text-blue", activeCode === "A01" ? "text-blue" : "text-ink2")}>Trang chủ</Link>
          {TABS.map((t) => (
            <Link key={t.code} href={t.href} className={cx("shrink-0 hover:text-blue", activeCode === t.code ? "text-blue" : "text-ink2")}>{t.label}</Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 shrink-0">
          <button type="button" aria-label="Tìm kiếm toàn site" onClick={() => setSearchOpen(true)} className="size-9 rounded-sm border border-vien flex items-center justify-center text-ink2 hover:border-blue hover:text-blue">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden><circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" /><path d="m12.5 12.5 3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
          {!tvv ? (
            <Link href={R.G01} className="h-9 px-4 inline-flex items-center rounded-sm border border-blue text-blue text-[13px] font-bold hover:bg-blue-soft whitespace-nowrap">Đăng nhập TVV</Link>
          ) : (
            <div className="relative flex items-center gap-3" ref={ref}>
              {/* G07 · Thông báo */}
              <button type="button" aria-label="Thông báo" onClick={() => setMenu(menu === "notif" ? "none" : "notif")} className="relative size-9 rounded-sm border border-vien flex items-center justify-center hover:border-blue">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden><path d="M4 12V8a5 5 0 0 1 10 0v4l1.5 2h-13L4 12Z" stroke="currentColor" strokeWidth="1.5" /><path d="M7.5 15.5a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.5" /></svg>
                {unread > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-hong text-white text-[11px] font-bold flex items-center justify-center">{unread}</span>}
              </button>
              {/* G05 · Menu tài khoản */}
              <button type="button" onClick={() => setMenu(menu === "account" ? "none" : "account")} className="flex items-center gap-2 h-9 pl-1 pr-3 rounded-sm border border-vien hover:border-blue text-[13px] font-bold text-den">
                <Avatar name={tvv.hoTen} size={28} /> <span className="hidden xl:inline max-w-[140px] truncate">{tvv.hoTen}</span> <span aria-hidden className="text-mut">▾</span>
              </button>
              {menu === "account" && (
                <div className="absolute right-0 top-11 w-[300px] bg-white border border-vien rounded-sm shadow-lg p-2 text-[14px]" role="menu">
                  <div className="px-3 py-2 font-bold text-den border-b border-vien2 mb-1">{tvv.hoTen} · Mã {tvv.ma}</div>
                  {[["Trang cá nhân", R.G02a], ["Danh thiếp của tôi", R.E04], ["Đã lưu", R.G02], ["Studio của tôi", R.D08], ["Tài khoản & cài đặt", R.G06]].map(([l, h]) => (
                    <Link key={h} href={h} onClick={() => setMenu("none")} className="block px-3 py-2 rounded-sm text-ink2 hover:bg-xam hover:text-blue">{l}</Link>
                  ))}
                  <button type="button" onClick={() => { actions.logout(); setMenu("none"); router.push(R.A01); }} className="w-full text-left px-3 py-2 rounded-sm text-red-fg hover:bg-xam font-bold">Đăng xuất</button>
                </div>
              )}
              {menu === "notif" && (
                <div className="absolute right-0 top-11 w-[380px] bg-white border border-vien rounded-sm shadow-lg text-[14px]" role="menu">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-vien2"><span className="font-bold">Thông báo</span>
                    <button type="button" className="text-[12.5px] text-blue font-bold" onClick={() => actions.update("notifications", (ns) => ns.map((n) => n.advisorMa === tvv.ma ? { ...n, daDoc: true } : n))}>Đánh dấu đã đọc</button></div>
                  <ul className="max-h-[360px] overflow-auto">
                    {notifs.length === 0 && <li className="px-4 py-6 text-mut text-center">Chưa có thông báo</li>}
                    {notifs.map((n) => (
                      <li key={n.id} className={cx("px-4 py-3 border-b border-vien2 last:border-0", !n.daDoc && "bg-blue-soft/40")}>
                        <Link href={n.href ?? R.G02a} onClick={() => { actions.update("notifications", (ns) => ns.map((x) => x.id === n.id ? { ...x, daDoc: true } : x)); setMenu("none"); }} className="block hover:text-blue">
                          <div className="text-den">{n.noiDung}</div>
                          <div className="text-[12px] text-mut mt-0.5">{fmtDateTime(n.ngay)}</div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Popup tìm kiếm toàn site (mở từ icon tìm trên nav) → S01 */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-den/40 flex items-start justify-center pt-[12vh] px-4" onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-[640px] bg-white rounded-sm shadow-xl p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-den text-[15px]">Tìm kiếm toàn site</span>
              <button type="button" aria-label="Đóng" onClick={() => setSearchOpen(false)} className="size-8 rounded-sm text-mut hover:bg-xam hover:text-den flex items-center justify-center">✕</button>
            </div>
            <form onSubmit={submitSearch} className="flex gap-3">
              {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm bài viết, Tư vấn viên, tài liệu…" aria-label="Từ khoá" className="h-11 flex-1 rounded-sm border border-vien px-3 text-[15px] focus:outline-none focus:border-blue" />
              <button type="submit" className="h-11 px-5 rounded-sm bg-blue text-white font-bold shrink-0">Tìm</button>
            </form>
            <p className="mt-3 text-[12.5px] text-mut">Tìm trong bài viết · Tư vấn viên · vinh danh · công cụ · tài liệu · câu hỏi thường gặp.</p>
          </div>
        </div>
      )}
    </header>
  );
}
