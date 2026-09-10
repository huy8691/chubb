"use client";
/**
 * Khu Trang cá nhân TVV: dải 5 tab (G02a · G02 · E04 · G10 · G06) + chặn chưa đăng nhập.
 * Dùng trong app/(site)/tai-khoan/layout.tsx.
 */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ACCOUNT_TABS, R } from "@/lib/routes";
import { useCurrentAdvisor, useStore } from "@/lib/store";
import { Avatar, cx } from "@/components/ui";

export function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, session } = useStore();
  const tvv = useCurrentAdvisor();

  useEffect(() => {
    if (ready && session.role !== "tvv") router.replace(`${R.G01}?next=${encodeURIComponent(pathname)}`);
  }, [ready, session.role, router, pathname]);

  if (!ready || !tvv) return <div className="wrap py-12 sm:py-20 text-mut">Đang kiểm tra phiên đăng nhập…</div>;

  const active = [...ACCOUNT_TABS].sort((a, b) => b.href.length - a.href.length).find((t) => pathname === t.href || (t.href !== R.G02a && pathname.startsWith(t.href)))?.code ?? "G02a";

  return (
    <>
      <div className="bg-xam border-b border-vien2">
        <div className="wrap pt-8">
          <div className="flex items-center gap-4 mb-6">
            <Avatar name={tvv.hoTen} size={56} />
            <div>
              <div className="eyebrow">Trang cá nhân</div>
              <h1 className="font-serif font-semibold text-[26px] text-den leading-tight">{tvv.hoTen}</h1>
              <div className="text-[13px] text-ink2">Mã {tvv.ma} · {tvv.chucDanh} · {tvv.vanPhong}</div>
            </div>
          </div>
          <nav className="flex gap-6 overflow-x-auto text-[14px] font-bold" aria-label="Khu tài khoản">
            {ACCOUNT_TABS.map((t) => (
              <Link key={t.code} href={t.href} className={cx("pb-3 border-b-2 whitespace-nowrap", active === t.code ? "border-blue text-blue" : "border-transparent text-ink2 hover:text-blue")}>{t.label}</Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="wrap py-10">{children}</div>
    </>
  );
}

/** Chặn trang cần đăng nhập TVV ngoài khu tài khoản (D02 Studio) */
export function RequireTVV({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, session } = useStore();
  useEffect(() => { if (ready && session.role !== "tvv") router.replace(`${R.G01}?next=${encodeURIComponent(pathname)}`); }, [ready, session.role, router, pathname]);
  if (!ready || session.role !== "tvv") return <div className="wrap py-12 sm:py-20 text-mut">Đang kiểm tra phiên đăng nhập…</div>;
  return <>{children}</>;
}
