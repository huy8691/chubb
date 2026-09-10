"use client";
/* eslint-disable react-hooks/set-state-in-effect -- đọc sessionStorage / tham số URL sau mount là chủ ý (tránh lệch hydration) */
/** D04 · Trắc Nghiệm Tính Cách — câu hỏi (12 câu từ CMS H18, tiến trình, Câu trước / Câu tiếp; câu cuối → D05). */
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { Button, Card, EmptyState, H2, cx } from "@/components/ui";
import { NHAN_DAP_AN, QuizAnswers, cauHoiDangHien, docDapAn, ghiDapAn } from "@/components/cong-cu/tinh-toan";

export default function Page() {
  const router = useRouter();
  const { data } = useStore();
  // useMemo bắt buộc: cauHoiDangHien trả mảng mới mỗi lần render → effect dưới chạy lại vô hạn ("Maximum update depth exceeded", 08/09)
  const cau = useMemo(() => cauHoiDangHien(data.quizQuestions), [data.quizQuestions]);
  const [i, setI] = useState(0);
  const [ans, setAns] = useState<QuizAnswers>({});
  useEffect(() => { const a = docDapAn(); setAns(a); const k = cau.findIndex((q) => !a[q.id]); setI(k < 0 ? 0 : k); }, [cau]);

  if (cau.length === 0) return <div className="wrap py-10 sm:py-16"><EmptyState title="Bộ đề chưa có câu hỏi" desc="Chubb Life đang cập nhật nội dung trắc nghiệm." action={<Button href={R.D01} kind="secondary">Về Toàn Tâm Phát Triển</Button>} /></div>;

  const q = cau[Math.min(i, cau.length - 1)];
  const chon = (kieuId: string) => { const a = { ...ans, [q.id]: kieuId }; setAns(a); ghiDapAn(a); };
  const cuoi = i === cau.length - 1;
  const tiep = () => { if (!ans[q.id]) return; if (cuoi) router.push(R.D05); else setI(i + 1); };

  return (
    <section className="wrap py-12 max-w-[900px]">
      <H2>Câu hỏi</H2>
      <div className="mt-4 flex items-center gap-4">
        <span className="text-[13px] font-bold text-blue whitespace-nowrap">Câu {i + 1}/{cau.length}</span>
        <div className="h-1.5 flex-1 bg-vien2 rounded-sm overflow-hidden"><div className="h-full bg-blue transition-all" style={{ width: `${((i + 1) / cau.length) * 100}%` }} /></div>
      </div>
      <Card className="mt-6 p-5 sm:p-8">
        <h3 className="font-serif font-semibold text-[26px] leading-snug text-den">{q.cauHoi}</h3>
        <div className="mt-6 space-y-3" role="radiogroup" aria-label="Đáp án">
          {q.dapAn.map((d, k) => {
            const on = ans[q.id] === d.kieuId && (q.dapAn.findIndex((x) => x.kieuId === ans[q.id]) === k);
            return (
              <button key={k} type="button" role="radio" aria-checked={on} onClick={() => chon(d.kieuId)} className={cx("w-full text-left flex items-start gap-4 p-4 rounded-sm border transition-colors", on ? "border-blue bg-blue-soft" : "border-vien hover:border-blue")}>
                <span className={cx("size-7 shrink-0 rounded-sm flex items-center justify-center text-[12px] font-bold", on ? "bg-blue text-white" : "bg-xam text-ink2")}>{NHAN_DAP_AN[k]}</span>
                <span className="text-[15px] text-den pt-0.5">{d.text}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-8 flex items-center gap-3">
          <Button kind="secondary" disabled={i === 0} onClick={() => setI(i - 1)}>Câu trước</Button>
          <Button disabled={!ans[q.id]} onClick={tiep}>{cuoi ? "Xem kết quả" : "Câu tiếp"}</Button>
        </div>
      </Card>
    </section>
  );
}
