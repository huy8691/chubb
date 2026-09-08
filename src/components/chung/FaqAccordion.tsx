"use client";
/** Danh sách câu hỏi thường gặp mở/đóng từng hàng (dùng trên S03 và B01). */
import Link from "next/link";
import { useState } from "react";
import type { FAQ } from "@/lib/types";
import { EmptyState, cx } from "@/components/ui";

export function FaqAccordion({ items, emptyTitle = "Không có câu hỏi phù hợp", emptyDesc, openFirst = false }: { items: FAQ[]; emptyTitle?: string; emptyDesc?: string; openFirst?: boolean }) {
  const [open, setOpen] = useState<string | null>(openFirst && items[0] ? items[0].id : null);
  if (items.length === 0) return <EmptyState title={emptyTitle} desc={emptyDesc} />;
  return (
    <ul className="border-t border-vien2">
      {items.map((f) => {
        const isOpen = open === f.id;
        return (
          <li key={f.id} className="border-b border-vien2">
            <button type="button" onClick={() => setOpen(isOpen ? null : f.id)} aria-expanded={isOpen} className="w-full flex items-start justify-between gap-6 py-4 text-left">
              <span className={cx("text-[15px] font-bold", isOpen ? "text-blue" : "text-den")}>{f.cauHoi}</span>
              <span aria-hidden className="text-[20px] leading-none text-mut shrink-0">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && (
              <div className="pb-5 pr-10 text-[13.5px] text-ink2 leading-relaxed">
                <p>{f.traLoi}</p>
                {f.lienKet && <Link href={f.lienKet} className="link-more mt-2">Mở liên kết</Link>}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
