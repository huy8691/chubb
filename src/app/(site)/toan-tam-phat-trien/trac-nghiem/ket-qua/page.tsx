"use client";
/* eslint-disable react-hooks/set-state-in-effect -- đọc sessionStorage / tham số URL sau mount là chủ ý (tránh lệch hydration) */
/** D05 · Trắc nghiệm — kết quả của bạn (kiểu được chọn nhiều nhất; ?kieu= dùng cho Xem trước từ CMS H18b). */
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { R, SITE_ORIGIN } from "@/lib/routes";
import { useStore } from "@/lib/store";
import type { QuizResultType } from "@/lib/types";
import { Button, Card, EmptyState, H2, Muted, useFlash } from "@/components/ui";
import { docDapAn, kieuKetQua, xoaDapAn } from "@/components/cong-cu/tinh-toan";

function KetQua() {
  const router = useRouter();
  const sp = useSearchParams();
  const { data } = useStore();
  const { flash, node } = useFlash();
  const [kq, setKq] = useState<QuizResultType | undefined | null>(null);
  useEffect(() => {
    const xemTruoc = sp.get("kieu");
    if (xemTruoc) { setKq(data.quizResultTypes.find((t) => t.id === xemTruoc)); return; }
    setKq(kieuKetQua(docDapAn(), data.quizResultTypes));
  }, [sp, data.quizResultTypes]);

  if (kq === null) return <div className="wrap py-10 sm:py-16 text-mut">Đang tính kết quả…</div>;
  if (!kq) return <div className="wrap py-10 sm:py-16"><EmptyState title="Bạn chưa làm trắc nghiệm" desc="Trả lời 12 câu hỏi ngắn để nhận kết quả định hướng nghề." action={<Button href={R.D04}>Bắt đầu trắc nghiệm</Button>} /></div>;

  const linkChiaSe = `${SITE_ORIGIN}${R.D06}?kieu=${kq.id}`;
  const chiaSe = (kenh: string) => { flash(`Đã mở ${kenh} với liên kết kết quả`); setTimeout(() => router.push(`${R.D06}?kieu=${kq.id}`), 900); };
  const saoChep = async () => { try { await navigator.clipboard.writeText(linkChiaSe); } catch {} flash("Đã sao chép liên kết kết quả"); };
  const lamLai = () => { xoaDapAn(); router.push(R.D04); };

  return (
    <section className="wrap py-12 max-w-[1000px]">
      <H2>Kết quả của bạn</H2>
      <Card className="mt-6 p-5 sm:p-8">
        <div className="flex items-center gap-6">
          <div className="size-24 shrink-0 rounded-full bg-blue-soft flex items-center justify-center text-[44px]" aria-label="Huy hiệu">{kq.huyHieu.startsWith("/") ? <img src={kq.huyHieu} alt="" className="size-24 rounded-full object-cover" /> : kq.huyHieu}</div>
          <div>
            <div className="font-serif font-semibold text-[28px] uppercase text-blue leading-tight">{kq.ten}</div>
            <Muted className="mt-2">Nội dung tham khảo để định hướng nghề — không phải đánh giá tuyển dụng.</Muted>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[["Điểm mạnh", kq.diemManh], ["Phong cách tư vấn", kq.phongCach], ["Phù hợp với", kq.phuHopVoi]].map(([t, v]) => (
            <div key={t} className="bg-xam rounded-sm p-4 sm:p-5"><div className="font-bold text-[14px] text-den">{t}</div><p className="mt-2 text-[13px] text-ink2 leading-relaxed">{v}</p></div>
          ))}
        </div>
        <p className="mt-6 text-[15px] text-den leading-relaxed">{kq.dinhHuong}</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button href={R.B01} kind="recruit">Tìm hiểu nghề tư vấn</Button>
          <Button kind="secondary" onClick={lamLai}>Làm lại</Button>
        </div>
        <div className="mt-6 pt-5 border-t border-vien2 flex flex-wrap items-center gap-3">
          <span className="font-bold text-[14px] text-den mr-1">Chia sẻ kết quả:</span>
          <Button size="sm" kind="secondary" onClick={() => chiaSe("Zalo")}>Zalo</Button>
          <Button size="sm" kind="secondary" onClick={() => chiaSe("Facebook")}>Facebook</Button>
          <Button size="sm" kind="secondary" onClick={saoChep}>Sao chép liên kết</Button>
          <Button size="sm" kind="secondary" onClick={() => flash("Đã tải ảnh kết quả (PNG 1200×630)")}>Tải ảnh PNG</Button>
        </div>
      </Card>
      {node}
    </section>
  );
}

export default function Page() { return <Suspense fallback={null}><KetQua /></Suspense>; }
