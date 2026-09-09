"use client";
/** S01 · Kết quả tìm toàn site — đích của ô tìm trên header (?q=). Tìm trong bài viết · Tư vấn viên · vinh danh · công cụ · tài liệu công khai · câu hỏi thường gặp. */
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { thangLabel } from "@/lib/seed";
import { Button, Eyebrow, FilterChips, Input, Pagination, Select, cx } from "@/components/ui";

type Loai = "tat-ca" | "bai-viet" | "tu-van-vien" | "vinh-danh" | "cong-cu" | "tai-lieu" | "cau-hoi";
interface KetQua { loai: Exclude<Loai, "tat-ca">; nhan: string; tieuDe: string; phu: string; href: string; ngay: string; diem: number }

const NHAN: Record<Exclude<Loai, "tat-ca">, string> = { "bai-viet": "Bài viết", "tu-van-vien": "Tư vấn viên", "vinh-danh": "Vinh danh", "cong-cu": "Công cụ", "tai-lieu": "Tài liệu", "cau-hoi": "Câu hỏi thường gặp" };
const bo = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");
const diem = (q: string, chinh: string, phu = "") => { const c = bo(chinh), p = bo(phu); if (c.startsWith(q)) return 3; if (c.includes(q)) return 2; if (p.includes(q)) return 1; return 0; };
const PER = 10;

function KetQuaTim() {
  const sp = useSearchParams();
  const router = useRouter();
  const { data } = useStore();
  const q0 = sp.get("q")?.trim() ?? "";
  const [q, setQ] = useState(q0);
  const [loai, setLoai] = useState<Loai>("tat-ca");
  const [sapXep, setSapXep] = useState<"lien-quan" | "moi-nhat">("lien-quan");
  const [page, setPage] = useState(1);

  const tatCa = useMemo<KetQua[]>(() => {
    const k = bo(q0);
    if (!k) return [];
    const out: KetQua[] = [];
    for (const a of data.articles.filter((x) => x.trangThai === "da-xuat-ban")) {
      const d = diem(k, a.tieuDe, a.sapo); if (!d) continue;
      const cd = data.chuyenDe.find((c) => c.id === a.chuyenDeId)?.ten ?? "";
      out.push({ loai: "bai-viet", nhan: NHAN["bai-viet"], tieuDe: a.tieuDe, phu: `${cd} · 6 phút đọc`, href: R.F02(a.slug), ngay: a.ngayXuatBan ?? a.capNhat, diem: d });
    }
    for (const t of data.advisors.filter((x) => x.theCongKhai && x.trangThaiTaiKhoan === "hoat-dong")) {
      const d = Math.max(diem(k, t.hoTen), t.ma.includes(k) ? 3 : 0, diem(k, t.chucDanh)); if (!d) continue;
      const dh = t.danhHieu.map((x) => x.ten).slice(0, 1).join("");
      out.push({ loai: "tu-van-vien", nhan: NHAN["tu-van-vien"], tieuDe: `${t.hoTen} — ${t.chucDanh}${dh ? ` · ${dh}` : ""}`, phu: `Mã ${t.ma} · ${t.vanPhong.split(" — ")[0]}`, href: R.E03(t.ma), ngay: t.ngayBatDau, diem: d });
    }
    for (const m of data.honorMonths.filter((x) => x.trangThai === "da-cong-bo")) {
      for (const h of m.hangMuc) {
        const hm = data.hangMuc.find((x) => x.id === h.hangMucId); if (!hm?.hien) continue;
        const d = Math.max(diem(k, hm.ten), diem(k, "vinh danh bảng xếp hạng"), diem(k, thangLabel(m))); if (!d) continue;
        out.push({ loai: "vinh-danh", nhan: NHAN["vinh-danh"], tieuDe: `Bảng vinh danh ${hm.ten} — ${thangLabel(m)}`, phu: `${h.nguoiDat.length} Tư vấn viên`, href: R.C04(m.id), ngay: m.capNhat, diem: d });
      }
    }
    const congCu = [
      { ten: "Quản lý tài chính cá nhân", phu: "Công khai · bảng tính tiết kiệm và mục tiêu", href: R.D03, tu: "tiết kiệm tài chính mục tiêu" },
      { ten: "Trắc nghiệm nghề Tư vấn Tài chính", phu: `Công khai · ${data.quizQuestions.filter((x) => x.hien).length} câu`, href: R.D04, tu: "trắc nghiệm tính cách" },
      { ten: "Studio", phu: "Mẫu Studio · Tư vấn viên đăng nhập để tạo ảnh", href: R.D08, tu: "studio ảnh mẫu" },
      { ten: "Tài liệu", phu: `Công khai · ${data.documents.filter((x) => x.phan === "cong-khai" && x.trangThai === "da-xuat-ban").length} tệp`, href: R.G04, tu: "tài liệu brochure biểu mẫu" },
      { ten: "Tìm Tư vấn viên", phu: "Công khai · tìm theo tên hoặc mã 7 số", href: R.E01, tu: "danh thiếp tư vấn viên kết nối" },
    ];
    for (const c of congCu) { const d = diem(k, c.ten, c.tu); if (d) out.push({ loai: "cong-cu", nhan: NHAN["cong-cu"], tieuDe: c.ten, phu: c.phu, href: c.href, ngay: "2026-01-01", diem: d }); }
    for (const t of data.documents.filter((x) => x.phan === "cong-khai" && x.trangThai === "da-xuat-ban")) {
      const d = diem(k, t.ten, t.moTa); if (!d) continue;
      const loaiTen = data.docTypes.find((x) => x.id === t.loaiId)?.ten ?? "";
      out.push({ loai: "tai-lieu", nhan: NHAN["tai-lieu"], tieuDe: t.ten, phu: `${loaiTen} · ${t.dinhDang} · ${t.kichCo}`, href: R.G04, ngay: t.capNhat, diem: d });
    }
    for (const f of data.faqs.filter((x) => x.trangThai === "da-xuat-ban")) {
      const d = diem(k, f.cauHoi, f.traLoi); if (!d) continue;
      out.push({ loai: "cau-hoi", nhan: NHAN["cau-hoi"], tieuDe: f.cauHoi, phu: f.trang === "tuyen-dung" ? "Toàn Tâm Tuyển Dụng" : "Liên hệ & trợ giúp", href: f.trang === "tuyen-dung" ? `${R.B01}#cau-hoi` : R.S03, ngay: f.capNhat, diem: d });
    }
    return out;
  }, [q0, data]);

  const dem = (l: Loai) => (l === "tat-ca" ? tatCa.length : tatCa.filter((x) => x.loai === l).length);
  const loc = tatCa.filter((x) => loai === "tat-ca" || x.loai === loai).sort((a, b) => (sapXep === "lien-quan" ? b.diem - a.diem || b.ngay.localeCompare(a.ngay) : b.ngay.localeCompare(a.ngay)));
  const pages = Math.max(1, Math.ceil(loc.length / PER));
  const hien = loc.slice((page - 1) * PER, page * PER);
  const chips = (["tat-ca", "bai-viet", "tu-van-vien", "vinh-danh", "cong-cu", "tai-lieu", "cau-hoi"] as Loai[]).filter((l) => l === "tat-ca" || dem(l) > 0).map((l) => ({ value: l, label: l === "tat-ca" ? "Tất cả" : NHAN[l], count: dem(l) }));

  return (
    <div className="wrap py-10">
      <form className="flex gap-3 max-w-[1000px]" onSubmit={(e) => { e.preventDefault(); if (q.trim()) { setPage(1); setLoai("tat-ca"); router.push(R.S01(q.trim())); } }}>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm bài viết, Tư vấn viên, tài liệu…" aria-label="Từ khoá" className="h-11 text-[15px]" />
        <Button type="submit">Tìm</Button>
      </form>

      <p className="mt-8 text-[14px] text-ink2">{q0 ? <>{tatCa.length} kết quả cho “{q0}”</> : "Nhập từ khoá để tìm trong toàn site."}</p>

      {tatCa.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <FilterChips options={chips} value={loai} onChange={(v) => { setLoai(v); setPage(1); }} />
          <label className="flex items-center gap-2 text-[13px] text-ink2">Sắp xếp:
            <Select value={sapXep} onChange={(e) => setSapXep(e.target.value as typeof sapXep)} className="w-[150px]"><option value="lien-quan">Liên quan</option><option value="moi-nhat">Mới nhất</option></Select>
          </label>
        </div>
      )}

      {q0 && tatCa.length === 0 ? (
        <div className="mt-8 border border-dashed border-vien rounded-sm p-8 flex flex-wrap items-center justify-between gap-6">
          <div className="font-bold text-[15px] text-den max-w-[720px]">Không có kết quả nào cho “{q0}” — thử từ khoá khác, hoặc tìm Tư vấn viên theo mã 7 chữ số</div>
          <Button kind="secondary" href={R.E01}>Tìm Tư vấn viên</Button>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-vien2 border-y border-vien2">
          {hien.map((r, i) => (
            <li key={`${r.loai}-${r.href}-${i}`}>
              <Link href={r.href} className={cx("grid grid-cols-[140px_1fr] gap-6 py-6 hover:bg-xam -mx-4 px-4")}>
                <Eyebrow className="text-[11px] mt-1">{r.nhan}</Eyebrow>
                <div>
                  <div className="font-bold text-[16px] text-den">{r.tieuDe}</div>
                  <div className="text-[13px] text-ink2 mt-1">{r.phu}</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Pagination page={page} pages={pages} onChange={setPage} />
    </div>
  );
}

export default function Page() {
  return <Suspense fallback={<div className="wrap py-10 text-mut">Đang tìm…</div>}><KetQuaTim /></Suspense>;
}
