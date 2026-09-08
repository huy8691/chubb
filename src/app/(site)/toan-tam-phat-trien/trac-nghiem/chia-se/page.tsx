"use client";
/* eslint-disable react-hooks/set-state-in-effect -- đọc sessionStorage / tham số URL sau mount là chủ ý (tránh lệch hydration) */
/** D06 · Trắc nghiệm — chia sẻ (trang người nhận mở từ link ?kieu=): thẻ ảnh 1200×630 · Làm trắc nghiệm của bạn · Tìm hiểu nghề · hàng chia sẻ. */
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import type { QuizResultType } from "@/lib/types";
import { Button, EmptyState, Muted, useFlash } from "@/components/ui";
import { docDapAn, kieuKetQua } from "@/components/cong-cu/tinh-toan";

function ChiaSe() {
  const sp = useSearchParams();
  const { data } = useStore();
  const { flash, node } = useFlash();
  const [kq, setKq] = useState<QuizResultType | undefined | null>(null);
  useEffect(() => {
    const id = sp.get("kieu");
    setKq(id ? data.quizResultTypes.find((t) => t.id === id) : kieuKetQua(docDapAn(), data.quizResultTypes));
  }, [sp, data.quizResultTypes]);

  if (kq === null) return <div className="wrap py-16 text-mut">Đang mở kết quả…</div>;
  if (!kq) return <div className="wrap py-16"><EmptyState title="Liên kết kết quả không còn hiệu lực" desc="Bạn có thể tự làm trắc nghiệm để nhận kết quả của mình." action={<Button href={R.D04}>Làm trắc nghiệm của bạn</Button>} /></div>;

  const saoChep = async () => { try { await navigator.clipboard.writeText(window.location.href); } catch {} flash("Đã sao chép liên kết"); };

  return (
    <>
      <section className="bg-xam">
        <div className="wrap py-12 flex flex-col items-center text-center">
          <div className="w-full max-w-[720px] rounded-sm overflow-hidden bg-blue text-white flex items-center gap-8 px-10" style={{ aspectRatio: "1200/630" }} aria-label="Ảnh chia sẻ 1200×630">
            {kq.anhChiaSe ? <span className="flex items-center justify-center w-full h-full bg-vien2 border border-[#D6D6D6] text-mut text-[13px]">Ảnh</span> : (
              <>
                <div className="size-28 shrink-0 rounded-full bg-white/15 flex items-center justify-center text-[56px]" aria-label="Huy hiệu">{kq.huyHieu}</div>
                <div className="text-left">
                  <div className="text-[11px] font-bold tracking-[0.2em] opacity-80">TRẮC NGHIỆM TÍNH CÁCH NGHỀ TƯ VẤN</div>
                  <div className="font-serif font-semibold text-[34px] uppercase leading-tight mt-2">{kq.ten}</div>
                  <div className="text-[13px] mt-3 opacity-90">Chubb Life Việt Nam · Toàn Tâm Phát Triển</div>
                </div>
              </>
            )}
          </div>
          <Muted className="mt-6 text-[15px] max-w-[720px]">Kết quả trắc nghiệm nghề Tư vấn Tài chính của một người bạn — nội dung tham khảo để định hướng nghề, không phải đánh giá tuyển dụng.</Muted>
        </div>
      </section>

      <section className="wrap py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[["Điểm mạnh", kq.diemManh], ["Phong cách tư vấn", kq.phongCach], ["Phù hợp với", kq.phuHopVoi]].map(([t, v]) => (
            <div key={t} className="bg-xam rounded-sm p-5"><div className="font-bold text-[15px] text-den">{t}</div><p className="mt-2 text-[14px] text-ink2 leading-relaxed">{v}</p></div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button href={R.D04}>Làm trắc nghiệm của bạn</Button>
          <Button href={R.B01} kind="recruit">Tìm hiểu nghề tư vấn</Button>
        </div>
        <div className="mt-10 pt-6 border-t border-vien2 flex flex-wrap items-center gap-3">
          <span className="font-bold text-[13px] text-den mr-1">Chia sẻ kết quả này:</span>
          <Button size="sm" kind="secondary" onClick={() => flash("Đã mở Zalo với liên kết này")}>Zalo</Button>
          <Button size="sm" kind="secondary" onClick={() => flash("Đã mở Facebook với liên kết này")}>Facebook</Button>
          <Button size="sm" kind="secondary" onClick={saoChep}>Sao chép liên kết</Button>
          <Button size="sm" kind="secondary" onClick={() => flash("Đã tải ảnh kết quả (PNG 1200×630)")}>Tải ảnh PNG</Button>
        </div>
      </section>
      {node}
    </>
  );
}

export default function Page() { return <Suspense fallback={null}><ChiaSe /></Suspense>; }
