"use client";
/**
 * nav/guest và nav/logged — một component, đổi trạng thái theo phiên.
 * Sau đăng nhập: thay "Đăng nhập TVV" bằng tên TVV (mở menu tài khoản G05).
 * Ô tìm toàn site là ICON mở popup (giữ header 1 dòng); popup → S01. A01 dùng chung (08/09, bỏ A02).
 */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { R, TABS } from "@/lib/routes";
import { useCurrentAdvisor, useStore } from "@/lib/store";
import { Avatar, cx } from "@/components/ui";

export function Nav({ active }: { active?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { actions } = useStore();
  const tvv = useCurrentAdvisor();
  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false); // menu di động (< lg)
  const [menu, setMenu] = useState<"none" | "account">("none");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setMenu("none"); };
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") { setMenu("none"); setSearchOpen(false); setNavOpen(false); } };
    document.addEventListener("mousedown", h);
    document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); };
  }, []);

  // đóng menu di động khi đổi trang
  useEffect(() => { setNavOpen(false); setMenu("none"); }, [pathname]);

  const activeCode = active ?? TABS.find((t) => pathname.startsWith(t.href))?.code ?? (pathname === "/" ? "A01" : "");
  const submitSearch = (e: React.FormEvent) => { e.preventDefault(); if (q.trim()) { setSearchOpen(false); router.push(R.S01(q.trim())); } };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-vien2">
      <div className="wrap h-16 flex items-center gap-3 lg:gap-6">
        <Link href={R.A01} className="flex items-center gap-1 shrink-0 lg:mr-6" aria-label="Chubb Life — Trang chủ">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/chubb.svg" alt="Chubb" className="h-3.5 sm:h-5" />
        </Link>
        <nav className="hidden lg:flex items-center gap-5 text-[13.5px] font-bold whitespace-nowrap" aria-label="Chính">
          <Link href={R.A01} className={cx("shrink-0 hover:text-blue", activeCode === "A01" ? "text-blue" : "text-ink2")}>Trang chủ</Link>
          {TABS.map((t) => (
            <Link key={t.code} href={t.href} className={cx("shrink-0 hover:text-blue", activeCode === t.code ? "text-blue" : "text-ink2")}>{t.label}</Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3 shrink-0">
          <button type="button" aria-label="Tìm kiếm toàn site" onClick={() => setSearchOpen(true)} className="size-8 sm:size-9 rounded-sm border border-vien flex items-center justify-center text-ink2 hover:border-blue hover:text-blue">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden><circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" /><path d="m12.5 12.5 3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
          {!tvv ? (
            <Link href={R.G01} className="hidden lg:inline-flex h-9 px-4 items-center rounded-sm border border-blue text-blue text-[13px] font-bold hover:bg-blue-soft whitespace-nowrap">Đăng nhập TVV</Link>
          ) : (
            <div className="relative flex items-center gap-2 sm:gap-3" ref={ref}>
              {/* G05 · Menu tài khoản */}
              <button type="button" aria-label="Menu tài khoản" onClick={() => setMenu(menu === "account" ? "none" : "account")} className="flex items-center gap-2 h-8 sm:h-9 pl-1 pr-1 sm:pr-3 rounded-sm border border-vien hover:border-blue text-[13px] font-bold text-den">
                <Avatar name={tvv.hoTen} size={28} /> <span className="hidden xl:inline max-w-[140px] truncate">{tvv.hoTen}</span> <span aria-hidden className="hidden sm:inline text-mut">▾</span>
              </button>
              {menu === "account" && (
                <div className="absolute right-0 top-11 w-[calc(100vw-40px)] max-w-[300px] bg-white border border-vien rounded-sm shadow-lg p-2 text-[14px]" role="menu">
                  <div className="px-3 py-2 font-bold text-den border-b border-vien2 mb-1">{tvv.hoTen} · Mã {tvv.ma}</div>
                  {[["Trang cá nhân", R.G02a], ["Danh thiếp của tôi", R.E04], ["Đã lưu", R.G02], ["Studio của tôi", R.D08], ["Tài khoản & cài đặt", R.G06]].map(([l, h]) => (
                    <Link key={h} href={h} onClick={() => setMenu("none")} className="block px-3 py-2 rounded-sm text-ink2 hover:bg-xam hover:text-blue">{l}</Link>
                  ))}
                  <button type="button" onClick={() => { actions.logout(); setMenu("none"); router.push(R.A01); }} className="w-full text-left px-3 py-2 rounded-sm text-red-fg hover:bg-xam font-bold">Đăng xuất</button>
                </div>
              )}
            </div>
          )}
          {/* Hamburger — ngoài cùng bên phải trên mobile (< lg) */}
          <button type="button" aria-label={navOpen ? "Đóng menu" : "Mở menu"} aria-expanded={navOpen} onClick={() => setNavOpen((o) => !o)} className="lg:hidden size-8 sm:size-9 rounded-sm border border-vien flex items-center justify-center text-ink2 hover:border-blue hover:text-blue">
            {navOpen
              ? <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden><path d="m4 4 10 10M14 4 4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
              : <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden><path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>}
          </button>
        </div>
      </div>

      {/* Menu di động (< lg): xổ danh sách tab khi bấm hamburger */}
      {navOpen && (
        <nav className="lg:hidden border-t border-vien2 bg-white" aria-label="Chính (di động)">
          <div className="wrap py-2 flex flex-col">
            <Link href={R.A01} onClick={() => setNavOpen(false)} className={cx("py-3 border-b border-vien2 font-bold text-[15px]", activeCode === "A01" ? "text-blue" : "text-ink2")}>Trang chủ</Link>
            {TABS.map((t) => (
              <Link key={t.code} href={t.href} onClick={() => setNavOpen(false)} className={cx("py-3 border-b border-vien2 font-bold text-[15px]", activeCode === t.code ? "text-blue" : "text-ink2")}>{t.label}</Link>
            ))}
            {!tvv && <Link href={R.G01} onClick={() => setNavOpen(false)} className="py-3 font-bold text-[15px] text-blue">Đăng nhập TVV</Link>}
          </div>
        </nav>
      )}

      {/* Popup tìm kiếm toàn site (mở từ icon tìm trên nav) → S01 */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-den/40 flex items-start justify-center pt-[12vh] px-4" onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-[640px] bg-white rounded-sm shadow-xl p-4 sm:p-5" onClick={(e) => e.stopPropagation()}>
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
