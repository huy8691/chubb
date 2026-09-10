"use client";
/**
 * Bộ component dùng chung — bám thiet-ke/wireframe-thanh-phan.md + ban-co-mau.md.
 * Bo góc 4px mọi thứ; xanh #000ECC là primary (~90%), hồng chỉ cho eyebrow và nút tuyển dụng.
 */
import Link from "next/link";
import React from "react";

const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(" ");

/* ---------- Nút ---------- */
type BtnKind = "primary" | "secondary" | "ghost" | "danger" | "recruit";
type BtnSize = "md" | "sm";
const KIND: Record<BtnKind, string> = {
  primary: "bg-blue text-white hover:bg-blue2 border border-blue",
  secondary: "bg-white text-blue border border-blue hover:bg-blue-soft",
  ghost: "bg-transparent text-blue hover:bg-blue-soft border border-transparent",
  danger: "bg-white text-red-fg border border-red-fg hover:bg-red-bg",
  recruit: "bg-hong text-white border border-hong hover:opacity-90",
};
const SIZE: Record<BtnSize, string> = { md: "h-11 px-5 text-[14px]", sm: "h-8 px-3 text-[13px]" };

export function Button({ kind = "primary", size = "md", href, className, disabled, children, ...rest }:
  { kind?: BtnKind; size?: BtnSize; href?: string; className?: string; disabled?: boolean; children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = cx("inline-flex items-center justify-center gap-2 rounded-sm font-bold whitespace-nowrap transition-colors", KIND[kind], SIZE[size], disabled && "opacity-40 pointer-events-none", className);
  if (href && !disabled) return <Link href={href} className={cls}>{children}</Link>;
  return <button type="button" className={cls} disabled={disabled} {...rest}>{children}</button>;
}

/* ---------- Chip trạng thái / quyền ---------- */
type ChipTone = "blue" | "grey" | "amber" | "green" | "red" | "pink";
const TONE: Record<ChipTone, string> = {
  blue: "bg-blue-soft text-blue", grey: "bg-xam text-ink2", amber: "bg-amber-bg text-amber-fg",
  green: "bg-green-bg text-green-fg", red: "bg-red-bg text-red-fg", pink: "bg-hong-soft text-hong",
};
export function Chip({ tone = "grey", className, children }: { tone?: ChipTone; className?: string; children: React.ReactNode }) {
  return <span className={cx("inline-flex items-center h-[26px] px-2.5 rounded-sm text-[12px] font-bold whitespace-nowrap", TONE[tone], className)}>{children}</span>;
}

/** Chip theo trạng thái xuất bản chuẩn */
export function StatusChip({ s }: { s: string }) {
  const map: Record<string, [string, ChipTone]> = {
    "nhap": ["Nháp", "grey"], "da-len-lich": ["Đã lên lịch", "blue"], "da-xuat-ban": ["Đã xuất bản", "green"], "da-go": ["Đã gỡ", "grey"], "luu-tru": ["Lưu trữ", "grey"],
    "cho-duyet": ["Chờ duyệt", "amber"], "da-duyet": ["Đang công khai", "green"], "bi-tu-choi": ["Từ chối", "red"], "rieng-tu": ["Riêng tư", "grey"], "da-ngung": ["Đã ngừng công khai", "grey"],
    "moi": ["Mới", "amber"], "da-xem": ["Đã xem", "grey"], "chua-xem": ["Chưa xem", "amber"], "da-tra-loi": ["Đã trả lời", "green"],
    "hoat-dong": ["Đang hoạt động", "blue"], "da-khoa": ["Đã khoá", "red"], "da-go-tk": ["Đã gỡ", "grey"],
    "da-cong-bo": ["Đã công bố", "green"], "cong-khai": ["Công khai", "blue"], "tvv": ["Dành cho Tư vấn viên", "amber"],
    "da-cong-khai": ["Đã công khai", "green"], "cho-dong-y": ["Chờ bạn đồng ý", "amber"], "khong-cong-khai": ["Không công khai", "grey"],
    "cho": ["Chờ TVV đồng ý", "amber"], "dong-y": ["Đã đồng ý", "green"], "khong": ["Không công khai", "grey"],
  };
  const [label, tone] = map[s] ?? [s, "grey"];
  return <Chip tone={tone}>{label}</Chip>;
}

/* ---------- Chữ ---------- */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cx("eyebrow", className)}>{children}</div>;
}
export function H1({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h1 className={cx("font-serif font-semibold text-[40px] leading-[1.15] text-den text-balance", className)}>{children}</h1>;
}
export function H2({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cx("font-serif font-semibold text-[28px] leading-[1.2] text-den text-balance", className)}>{children}</h2>;
}
export function H3({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cx("font-sans font-bold text-[18px] leading-[1.3] text-den", className)}>{children}</h3>;
}
export function Muted({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cx("text-[14px] text-ink2 leading-relaxed", className)}>{children}</p>;
}

/** Link "Xem tất cả" — mũi tên là nét vẽ riêng, không dùng ký tự → */
export function MoreLink({ href, children = "Xem tất cả" }: { href: string; children?: React.ReactNode }) {
  return (
    <Link href={href} className="link-more">
      {children}
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M2 7h9M7.5 3.5 11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </Link>
  );
}

/* ---------- Hộp ---------- */
export function Card({ className, children, as: Tag = "div" }: { className?: string; children: React.ReactNode; as?: "div" | "section" | "article" }) {
  return <Tag className={cx("bg-white border border-vien rounded-sm", className)}>{children}</Tag>;
}

/** Khối tiêu đề + mô tả + link ở góc phải (dùng cho index/dashboard) */
export function SectionHead({ eyebrow, title, desc, right, className }: { eyebrow?: string; title: React.ReactNode; desc?: string; right?: React.ReactNode; className?: string }) {
  return (
    <div className={cx("flex items-end justify-between gap-6 mb-6", className)}>
      <div>
        {eyebrow && <Eyebrow className="mb-2">{eyebrow}</Eyebrow>}
        <H2>{title}</H2>
        {desc && <Muted className="mt-2 max-w-[640px]">{desc}</Muted>}
      </div>
      {right}
    </div>
  );
}

/** Hero trang công khai — nền xám #F2F2F2 phẳng, chữ tối, eyebrow hồng */
export function Hero({ eyebrow, title, desc, actions, image, children }: { eyebrow?: string; title: React.ReactNode; desc?: string; actions?: React.ReactNode; image?: string; children?: React.ReactNode }) {
  return (
    <section className="bg-xam">
      <div className="wrap py-16 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
        <div>
          {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
          <H1>{title}</H1>
          {desc && <Muted className="mt-4 text-[16px] max-w-[560px]">{desc}</Muted>}
          {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
          {children}
        </div>
        {/* Figma: hero các trang đích tab chỉ có chữ, không ô ảnh (08/09) — prop image giữ để tương thích */}
        {image && null}
      </div>
    </section>
  );
}

/** Ô ảnh giữ chỗ — demo bám wireframe, KHÔNG dùng ảnh thật (chủ dự án 08/09: "bỏ hình ảnh, dùng placeholder thôi"). `src` được nhận để giữ tương thích nhưng bỏ qua. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ImageBox({ src: _src, alt = "Ảnh", ratio = "16/9", className }: { src?: string; alt?: string; ratio?: string; className?: string }) {
  return (
    <div role="img" aria-label={alt} className={cx("bg-vien2 border border-[#D6D6D6] rounded-sm overflow-hidden flex items-center justify-center text-mut text-[13px]", className)} style={{ aspectRatio: ratio }}>
      <span>Ảnh</span>
    </div>
  );
}

/** Breadcrumb 3 cấp */
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[13px] text-mut flex flex-wrap gap-1.5 items-center">
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span aria-hidden>›</span>}
          {it.href ? <Link href={it.href} className="hover:text-blue">{it.label}</Link> : <span className="text-ink2">{it.label}</span>}
        </React.Fragment>
      ))}
    </nav>
  );
}

/* ---------- Form ---------- */
const inputCls = "h-9 w-full rounded-sm border border-vien bg-white px-3 text-[14px] text-den placeholder:text-mut2 focus:outline-none focus:border-blue disabled:bg-xam";
export function Field({ label, hint, error, children, className, count }: { label: string; hint?: string; error?: string; children: React.ReactNode; className?: string; count?: string }) {
  return (
    <label className={cx("block", className)}>
      <span className="flex justify-between text-[12.5px] text-ink2 mb-1.5"><span>{label}</span>{count && <span className="text-mut">{count}</span>}</span>
      {children}
      {hint && !error && <span className="block mt-1 text-[12px] text-mut">{hint}</span>}
      {error && <span className="block mt-1 text-[12px] text-red-fg">{error}</span>}
    </label>
  );
}
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(inputCls, props.className)} />;
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cx(inputCls, "h-auto min-h-[96px] py-2", props.className)} />;
}
export function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  // Nếu caller truyền width (w-… / max-w-…) thì bỏ "w-full" mặc định để width truyền vào không bị đè
  // (cx chỉ nối chuỗi, không tailwind-merge). Không truyền width → giữ w-full như cũ.
  const base = props.className && /(^|\s)(w-|max-w-)/.test(props.className) ? inputCls.replace("w-full", "") : inputCls;
  return <select {...props} className={cx(base, "pr-8", props.className)}>{children}</select>;
}
export function Checkbox({ label, ...props }: { label: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <label className="inline-flex items-center gap-2 text-[14px] text-den"><input type="checkbox" className="size-4 accent-blue" {...props} />{label}</label>;
}
export function Radio({ label, desc, ...props }: { label: React.ReactNode; desc?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex items-start gap-2 text-[14px] text-den">
      <input type="radio" className="mt-0.5 size-4 accent-blue" {...props} />
      <span>{label}{desc && <span className="block text-[12.5px] text-mut">{desc}</span>}</span>
    </label>
  );
}
export function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
  return (
    <div className="flex items-start justify-between gap-6 py-4 border-b border-vien2 last:border-0">
      <div><div className="text-[15px] font-bold text-den">{label}</div>{desc && <div className="text-[13px] text-ink2 mt-0.5">{desc}</div>}</div>
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={cx("relative h-6 w-11 shrink-0 rounded-full transition-colors", checked ? "bg-blue" : "bg-vien")}>
        <span className={cx("absolute top-0.5 size-5 rounded-full bg-white transition-all", checked ? "left-[22px]" : "left-0.5")} />
      </button>
    </div>
  );
}
export function SearchBox({ value, onChange, placeholder = "Tìm…", className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={cx("relative", className)}>
      <svg className="absolute left-3 top-2.5 text-mut" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" /><path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cx(inputCls, "pl-9")} />
    </div>
  );
}
/** Dải chip lọc (Tất cả · từng loại kèm số) */
export function FilterChips<T extends string>({ options, value, onChange }: { options: { value: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)} className={cx("h-8 px-3 rounded-sm text-[13px] font-bold border", value === o.value ? "bg-blue text-white border-blue" : "bg-white text-ink2 border-vien hover:border-blue hover:text-blue")}>
          {o.label}{o.count !== undefined && <span className="ml-1 opacity-70">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ---------- Bảng ---------- */
export function Table({ head, children, className }: { head: React.ReactNode[]; children: React.ReactNode; className?: string }) {
  return (
    <div className={cx("overflow-x-auto", className)}>
      <table className="w-full text-[14px]">
        <thead><tr className="bg-xam text-left text-[12px] font-bold text-ink2">{head.map((h, i) => <th key={i} className="px-4 py-3 whitespace-nowrap first:rounded-l-sm last:rounded-r-sm">{h}</th>)}</tr></thead>
        <tbody className="[&>tr]:border-b [&>tr]:border-vien2 [&>tr:last-child]:border-0 [&>tr>td]:px-4 [&>tr>td]:py-3 [&>tr>td]:align-middle">{children}</tbody>
      </table>
    </div>
  );
}
export function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-1 mt-6">
      <Button kind="secondary" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>Trước</Button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <button key={p} type="button" onClick={() => onChange(p)} className={cx("h-8 min-w-8 px-2 rounded-sm text-[13px] font-bold border", p === page ? "bg-blue text-white border-blue" : "bg-white text-blue border-blue hover:bg-blue-soft")}>{p}</button>
      ))}
      <Button kind="secondary" size="sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>Sau</Button>
    </div>
  );
}
export function EmptyState({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="border border-dashed border-vien rounded-sm py-12 px-6 text-center">
      <div className="font-bold text-den">{title}</div>
      {desc && <Muted className="mt-1">{desc}</Muted>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

/* ---------- Lớp phủ ---------- */
export function Modal({ open, onClose, title, children, footer, width = 640 }: { open: boolean; onClose: () => void; title: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode; width?: number }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-den/50 p-6 overflow-y-auto" onClick={onClose} role="dialog" aria-modal>
      <div className="bg-white rounded-sm shadow-xl w-full my-10" style={{ maxWidth: width }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-vien2">
          <h3 className="font-bold text-[18px] text-den">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Đóng" className="text-mut hover:text-den text-[20px] leading-none">✕</button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-vien2 flex flex-wrap gap-3">{footer}</div>}
      </div>
    </div>
  );
}

/** Thông báo ngắn góc dưới (thay toast) */
export function useFlash() {
  const [msg, setMsg] = React.useState<string | null>(null);
  const flash = React.useCallback((m: string) => { setMsg(m); setTimeout(() => setMsg(null), 2600); }, []);
  const node = msg ? <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-den text-white text-[14px] px-4 py-2.5 rounded-sm shadow-lg">{msg}</div> : null;
  return { flash, node };
}

/** Thẻ số liệu (dashboard, tổng quan) */
export function Stat({ value, label, href }: { value: React.ReactNode; label: string; href?: string }) {
  const inner = (<><div className="font-serif font-semibold text-[34px] text-blue leading-none">{value}</div><div className="mt-2 text-[14px] text-ink2">{label}</div></>);
  return href ? <Link href={href} className="block bg-white border border-vien rounded-sm p-5 hover:border-blue">{inner}</Link> : <div className="bg-white border border-vien rounded-sm p-5">{inner}</div>;
}

/** Avatar chữ cái — luôn là hình tròn giữ chỗ (không ảnh thật), `src` bỏ qua */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Avatar({ name, size = 40, src: _src }: { name: string; size?: number; src?: string }) {
  const initials = name.split(" ").slice(-2).map((s) => s[0]).join("");
  return (
    <div aria-label={name} className="rounded-full bg-blue-soft text-blue font-bold flex items-center justify-center shrink-0" style={{ width: size, height: size, fontSize: size * 0.36 }}>{initials}</div>
  );
}

export { cx };
