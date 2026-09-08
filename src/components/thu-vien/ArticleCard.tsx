"use client";
/**
 * Thẻ bài viết (§7): ô ảnh · nhãn chuyên đề · tiêu đề (2 dòng) · sapo — cả thẻ bấm được → F02.
 * ArticleRow: dạng hàng ngang cho trang archive F03.
 */
import Link from "next/link";
import { R } from "@/lib/routes";
import { fmtDate } from "@/lib/seed";
import type { Article, ChuyenDe } from "@/lib/types";
import { cx } from "@/components/ui";
import { phutDoc } from "./helpers";

export function ArticleCard({ a, cd, size = "md" }: { a: Article; cd?: ChuyenDe; size?: "md" | "lg" }) {
  return (
    <Link href={R.F02(a.slug)} className="group block">
      <div className={cx("bg-xam rounded-sm overflow-hidden", size === "lg" ? "aspect-[16/10]" : "aspect-video")}>
        <span className="flex items-center justify-center w-full h-full bg-vien2 border border-[#D6D6D6] text-mut text-[13px]">Ảnh</span>
      </div>
      <div className="pt-4">
        {cd && <div className="eyebrow mb-2">{cd.ten}</div>}
        <h3 className={cx("font-bold text-den group-hover:text-blue line-clamp-2", size === "lg" ? "font-serif font-semibold text-[30px] leading-tight" : "text-[17px] leading-snug")}>{a.tieuDe}</h3>
        <p className={cx("mt-2 text-ink2 line-clamp-2", size === "lg" ? "text-[15px]" : "text-[13.5px]")}>{a.sapo}</p>
        <div className="mt-3 text-[13px] text-mut">{phutDoc(a)} phút đọc · {fmtDate(a.ngayXuatBan)}</div>
      </div>
    </Link>
  );
}

export function ArticleRow({ a, cd }: { a: Article; cd?: ChuyenDe }) {
  return (
    <Link href={R.F02(a.slug)} className="group grid grid-cols-[220px_1fr] gap-6 py-6 border-b border-vien2 last:border-0">
      <div className="aspect-video bg-xam rounded-sm overflow-hidden"><span className="flex items-center justify-center w-full h-full bg-vien2 border border-[#D6D6D6] text-mut text-[13px]">Ảnh</span></div>
      <div>
        {cd && <div className="eyebrow mb-1.5">{cd.ten}</div>}
        <h3 className="font-bold text-[17px] leading-snug text-den group-hover:text-blue line-clamp-2">{a.tieuDe}</h3>
        <p className="mt-2 text-[14px] text-ink2 line-clamp-2">{a.sapo}</p>
        <div className="mt-3 text-[13px] text-mut">{fmtDate(a.ngayXuatBan)} · {phutDoc(a)} phút đọc</div>
      </div>
    </Link>
  );
}

/** Danh sách "Bài xem nhiều nhất" 01 · 02 · 03 (sidebar F02 · F03) */
export function TopList({ list }: { list: Article[] }) {
  return (
    <ol className="space-y-4">
      {list.map((a, i) => (
        <li key={a.id} className="flex gap-3 text-[14px]">
          <span className="font-bold text-blue shrink-0">{String(i + 1).padStart(2, "0")}</span>
          <Link href={R.F02(a.slug)} className="text-den hover:text-blue leading-snug">{a.tieuDe}</Link>
        </li>
      ))}
    </ol>
  );
}
