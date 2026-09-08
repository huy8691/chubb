"use client";
/**
 * Khung CMS: thanh trên xanh đậm #000066 (C H U B B · KHU VỰC QUẢN TRỊ · email · Đăng xuất · Cổng công khai)
 * + sidebar 14 mục (Biên tập chỉ thấy 6 mục nội dung) + vùng nội dung.
 * Dùng trong app/cms/layout.tsx. H00 (đăng nhập CMS) không dùng khung này.
 */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { CMS_MENU, R } from "@/lib/routes";
import { useCurrentCmsUser, useStore } from "@/lib/store";
import { cx } from "@/components/ui";

export function CmsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, session, actions } = useStore();
  const user = useCurrentCmsUser();
  const isLogin = pathname === R.H00;

  useEffect(() => {
    if (!ready || isLogin) return;
    if (session.role !== "admin" && session.role !== "editor") router.replace(`${R.H00}?next=${encodeURIComponent(pathname)}`);
  }, [ready, session.role, isLogin, router, pathname]);

  if (isLogin) return <>{children}</>;
  if (!ready || !user) return <div className="p-10 text-mut">Đang kiểm tra phiên đăng nhập…</div>;

  const menu = CMS_MENU.filter((m) => user.vai === "admin" || m.editor);
  const active = [...menu].sort((a, b) => b.href.length - a.href.length).find((m) => pathname === m.href || (m.href !== R.H01 && pathname.startsWith(m.href)))?.code ?? "H01";
  const blocked = user.vai === "editor" && !menu.some((m) => pathname === m.href || (m.href !== R.H01 && pathname.startsWith(m.href)));

  return (
    <div className="min-h-screen bg-xam">
      <div className="h-14 bg-navy text-white flex items-center px-6 gap-4 text-[13px]">
        <span className="font-bold tracking-[0.3em] text-[15px]">CHUBB</span>
        <span className="bg-blue px-2.5 py-1 rounded-sm text-[11px] font-bold tracking-wider">KHU VỰC QUẢN TRỊ</span>
        <span className="ml-auto text-white/80">{user.email} · {user.vai === "admin" ? "Quản trị" : "Biên tập"}</span>
        <button type="button" onClick={() => { actions.logout(); router.push(R.H00); }} className="font-bold hover:underline">Đăng xuất</button>
        <Link href={R.A01} target="_blank" className="h-8 px-3 inline-flex items-center rounded-sm border border-white/60 hover:bg-white/10 font-bold">Cổng công khai</Link>
      </div>
      <div className="flex">
        <aside className="w-[240px] shrink-0 bg-white border-r border-vien2 min-h-[calc(100vh-56px)] py-4">
          <nav className="flex flex-col" aria-label="Điều hướng CMS">
            {menu.map((m) => (
              <Link key={m.code} href={m.href} className={cx("mx-3 px-3 py-2 rounded-sm text-[13px]", active === m.code ? "bg-blue-soft text-blue font-bold" : "text-ink2 hover:bg-xam hover:text-blue")}>{m.label}</Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 min-w-0 p-8">
          {blocked ? (
            <div className="bg-white border border-vien rounded-sm p-8">
              <h1 className="font-bold text-[20px] text-den">Bạn không có quyền vào module này</h1>
              <p className="text-ink2 mt-2 text-[14px]">Vai Biên tập chỉ vào Bài viết · Mẫu Studio · Tài liệu · FAQ · Trắc nghiệm. Liên hệ Quản trị nếu cần thêm quyền.</p>
              <Link href={R.H01} className="inline-block mt-4 text-blue font-bold">Về Bảng điều khiển</Link>
            </div>
          ) : children}
        </main>
      </div>
    </div>
  );
}

/** Đầu trang CMS: breadcrumb · tiêu đề · dòng mô tả · nút phải */
export function CmsHeader({ crumbs, title, desc, right }: { crumbs?: { label: string; href?: string }[]; title: React.ReactNode; desc?: string; right?: React.ReactNode }) {
  return (
    <div className="mb-6">
      {crumbs && (
        <div className="text-[13px] text-mut mb-2 flex gap-1.5">
          {crumbs.map((c, i) => <span key={i} className="flex gap-1.5">{i > 0 && <span>›</span>}{c.href ? <Link href={c.href} className="hover:text-blue">{c.label}</Link> : <span className="text-ink2">{c.label}</span>}</span>)}
        </div>
      )}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="font-bold text-[22px] text-den">{title}</h1>
          {desc && <p className="text-[13.5px] text-ink2 mt-1 max-w-[720px]">{desc}</p>}
        </div>
        {right && <div className="flex flex-col items-end gap-2 shrink-0">{right}</div>}
      </div>
    </div>
  );
}

/** Thẻ khối trong CMS */
export function CmsCard({ title, desc, right, children, className }: { title?: React.ReactNode; desc?: string; right?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cx("bg-white border border-vien rounded-sm p-5", className)}>
      {(title || right) && (
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>{title && <h2 className="font-bold text-[16px] text-den">{title}</h2>}{desc && <p className="text-[13px] text-ink2 mt-0.5">{desc}</p>}</div>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

/** Hàng nút chuẩn của form CMS admin tự soạn: Lưu nháp · Xem trước · Xuất bản · Gỡ · Huỷ */
export function CmsFormActions({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3 pt-5 mt-5 border-t border-vien2">{children}</div>;
}
