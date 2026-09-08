"use client";
/** D03 · Quản lý tài chính cá nhân — form theo bảng tính e-card cũ; kết quả cột phải; tham số mặc định từ CMS H17. */
import { useMemo, useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { Button, Card, Eyebrow, Field, H1, Input, Muted, Select } from "@/components/ui";
import { fmtTien, tinhTaiChinh } from "@/components/cong-cu/tinh-toan";

const soLe = (v: string) => Number(String(v).replace(/[^\d]/g, "")) || 0;
const nhomSo = (n: number) => (n ? n.toLocaleString("vi-VN") : "");

export default function Page() {
  const { data } = useStore();
  const p = data.financeParams;
  const [thuNhap, setThuNhap] = useState(30_000_000);
  const [tyLe, setTyLe] = useState(p.tyLeTietKiemGoiY);
  const [laiSuat, setLaiSuat] = useState(p.laiSuatMacDinh);
  const [soNam, setSoNam] = useState(p.thoiGianMacDinh);
  const [mucTieu, setMucTieu] = useState<{ id: string; soTien: number }[]>(() => {
    const a = p.mucTieu.find((m) => m.id === "mua-nha"), b = p.mucTieu.find((m) => m.id === "du-hoc");
    return [a && { id: a.id, soTien: a.soTienGoiY }, b && { id: b.id, soTien: b.soTienGoiY }].filter(Boolean) as { id: string; soTien: number }[];
  });
  const [daTinh, setDaTinh] = useState(true);

  const gh = p.gioiHan;
  const loi = {
    thuNhap: thuNhap < gh.thuNhapMin || thuNhap > gh.thuNhapMax ? `Nhập từ ${nhomSo(gh.thuNhapMin)} đến ${nhomSo(gh.thuNhapMax)} ₫` : "",
    tyLe: tyLe < 1 || tyLe > (gh.tyLeMax ?? 80) ? `Nhập từ 1 đến ${gh.tyLeMax ?? 80} %` : "",
    laiSuat: laiSuat < 0 || laiSuat > (gh.laiSuatMax ?? 15) ? `Nhập từ 0 đến ${gh.laiSuatMax ?? 15} %/năm` : "",
    soNam: soNam < (gh.thoiGianMin ?? 1) || soNam > gh.thoiGianMax ? `Nhập từ ${gh.thoiGianMin ?? 1} đến ${gh.thoiGianMax} năm` : "",
  };
  const coLoi = Object.values(loi).some(Boolean);

  const kq = useMemo(() => tinhTaiChinh({ thuNhap, tyLe, laiSuat, soNam, mucTieu: mucTieu.map((m) => ({ ten: p.mucTieu.find((x) => x.id === m.id)?.ten ?? "", soTien: m.soTien })) }), [thuNhap, tyLe, laiSuat, soNam, mucTieu, p.mucTieu]);
  const maxCot = Math.max(1, ...kq.theoNam.map((n) => n.giaTri), kq.tongMucTieu);

  const themMucTieu = () => {
    const conLai = p.mucTieu.find((m) => !mucTieu.some((x) => x.id === m.id)) ?? p.mucTieu[p.mucTieu.length - 1];
    setMucTieu([...mucTieu, { id: conLai.id, soTien: conLai.soTienGoiY }]);
  };
  const tinhLai = () => { setThuNhap(30_000_000); setTyLe(p.tyLeTietKiemGoiY); setLaiSuat(p.laiSuatMacDinh); setSoNam(p.thoiGianMacDinh); setDaTinh(false); };

  return (
    <>
      <section className="bg-xam">
        <div className="wrap py-12">
          <Eyebrow className="mb-3">Toàn Tâm Phát Triển</Eyebrow>
          <H1>Quản lý tài chính cá nhân</H1>
          <Muted className="mt-3 text-[16px] max-w-[640px]">Ước tính khoản tiết kiệm mỗi tháng và thời gian để đạt các mục tiêu lớn của bạn.</Muted>
        </div>
      </section>

      <section className="wrap py-10 grid grid-cols-1 lg:grid-cols-[1fr_520px] gap-8 items-start">
        <Card className="p-6">
          <Eyebrow className="mb-4">Thông tin của bạn</Eyebrow>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Thu nhập hàng tháng (₫)" error={loi.thuNhap}><Input inputMode="numeric" value={nhomSo(thuNhap)} onChange={(e) => setThuNhap(soLe(e.target.value))} /></Field>
            <Field label="Tỷ lệ tiết kiệm mỗi tháng" error={loi.tyLe} hint={`Gợi ý ${p.tyLeTietKiemGoiY} %`}><div className="relative"><Input type="number" min={1} max={gh.tyLeMax ?? 80} value={tyLe} onChange={(e) => setTyLe(Number(e.target.value))} className="pr-10" /><span className="absolute right-3 top-2 text-[14px] text-mut">%</span></div></Field>
            <Field label="Lãi suất ước tính ngân hàng" error={loi.laiSuat}><div className="relative"><Input type="number" step={0.1} min={0} max={gh.laiSuatMax ?? 15} value={laiSuat} onChange={(e) => setLaiSuat(Number(e.target.value))} className="pr-16" /><span className="absolute right-3 top-2 text-[14px] text-mut">% / năm</span></div></Field>
            <Field label="Thời gian tiết kiệm / đầu tư" error={loi.soNam}><div className="relative"><Input type="number" min={gh.thoiGianMin ?? 1} max={gh.thoiGianMax} value={soNam} onChange={(e) => setSoNam(Number(e.target.value))} className="pr-14" /><span className="absolute right-3 top-2 text-[14px] text-mut">năm</span></div></Field>
          </div>

          <Eyebrow className="mt-8 mb-3">Mục tiêu của bạn</Eyebrow>
          <div className="space-y-3">
            {mucTieu.length === 0 && <Muted>Chưa có mục tiêu — bấm “Thêm mục tiêu” để bắt đầu.</Muted>}
            {mucTieu.map((m, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center">
                <Select value={m.id} onChange={(e) => { const mt = p.mucTieu.find((x) => x.id === e.target.value)!; setMucTieu(mucTieu.map((x, k) => k === i ? { id: mt.id, soTien: mt.soTienGoiY || x.soTien } : x)); }}>
                  {p.mucTieu.map((x) => <option key={x.id} value={x.id}>{x.ten}</option>)}
                </Select>
                <div className="relative"><Input inputMode="numeric" value={nhomSo(m.soTien)} onChange={(e) => setMucTieu(mucTieu.map((x, k) => k === i ? { ...x, soTien: soLe(e.target.value) } : x))} placeholder="Số tiền" className="pr-8" /><span className="absolute right-3 top-2 text-[14px] text-mut">₫</span></div>
                <button type="button" aria-label="Bỏ mục tiêu" onClick={() => setMucTieu(mucTieu.filter((_, k) => k !== i))} className="size-9 rounded-sm border border-vien text-mut hover:text-red-fg hover:border-red-fg">✕</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={themMucTieu} className="mt-4 text-blue font-bold text-[13px]">+ Thêm mục tiêu ({p.mucTieu.map((m) => m.ten).join(" · ")})</button>

          <div className="mt-6 pt-5 border-t border-vien2">
            <Button onClick={() => setDaTinh(true)} disabled={coLoi}>Xem kết quả</Button>
          </div>
        </Card>

        <Card className="p-6 bg-blue-soft/40">
          <Eyebrow className="mb-4">Kết quả ước tính</Eyebrow>
          {!daTinh || coLoi ? (
            <Muted>Điền thông tin bên trái rồi bấm “Xem kết quả”.</Muted>
          ) : (
            <>
              <div className="font-serif font-semibold text-[28px] text-blue">{fmtTien(kq.tietKiemThang)} / tháng</div>
              <Muted className="mt-1">Bạn tiết kiệm mỗi tháng ({tyLe}% thu nhập)</Muted>
              <dl className="mt-5 divide-y divide-vien2 text-[13px]">
                <div className="flex justify-between gap-4 py-2.5"><dt className="text-ink2">Tổng tích luỹ sau {soNam} năm, lãi {laiSuat}%/năm</dt><dd className="font-bold text-den whitespace-nowrap">≈ {fmtTien(kq.tichLuy)}</dd></div>
                <div className="flex justify-between gap-4 py-2.5"><dt className="text-ink2">Tổng {mucTieu.length} mục tiêu</dt><dd className="font-bold text-den whitespace-nowrap">{fmtTien(kq.tongMucTieu)}</dd></div>
                <div className="flex justify-between gap-4 py-2.5"><dt className="text-ink2">Còn thiếu so với mục tiêu</dt><dd className="font-bold text-den whitespace-nowrap">{kq.conThieu > 0 ? `≈ ${fmtTien(kq.conThieu)}` : "Đã đủ"}</dd></div>
                <div className="flex justify-between gap-4 py-2.5"><dt className="text-ink2">Cần tiết kiệm mỗi tháng để đủ trong {soNam} năm</dt><dd className="font-bold text-den whitespace-nowrap">≈ {fmtTien(kq.canMoiThang)} ({thuNhap ? Math.round((kq.canMoiThang / thuNhap) * 100) : 0}% thu nhập)</dd></div>
              </dl>

              <div className="mt-6">
                <div className="text-[12px] font-bold text-ink2 mb-2">Tích luỹ theo năm</div>
                <svg viewBox={`0 0 ${Math.max(10, kq.theoNam.length) * 34} 140`} className="w-full h-[150px]" role="img" aria-label="Biểu đồ tích luỹ theo năm">
                  {kq.tongMucTieu > 0 && <line x1="0" x2={kq.theoNam.length * 34} y1={120 - (kq.tongMucTieu / maxCot) * 110} y2={120 - (kq.tongMucTieu / maxCot) * 110} stroke="#fc0386" strokeDasharray="4 3" strokeWidth="1" />}
                  {kq.theoNam.map((n, i) => { const h = (n.giaTri / maxCot) * 110; return (
                    <g key={n.nam}>
                      <rect x={i * 34 + 6} y={120 - h} width="22" height={h} fill="#000ecc" rx="2" />
                      <text x={i * 34 + 17} y="134" textAnchor="middle" fontSize="9" fill="#808080">N{n.nam}</text>
                    </g>); })}
                </svg>
              </div>
              <p className="mt-4 text-[12px] text-mut">{p.luuY}</p>
            </>
          )}
        </Card>
      </section>

      <section className="wrap pb-16">
        <Eyebrow className="mb-4">Bước tiếp theo</Eyebrow>
        <div className="flex flex-wrap gap-3">
          <Button href={R.E01}>Nói chuyện với Tư vấn viên</Button>
          <Button href={R.F03("toan-tam-bao-ve")} kind="secondary">Xem giải pháp bảo vệ</Button>
          <Button kind="ghost" onClick={tinhLai}>Tính lại</Button>
        </div>
      </section>
    </>
  );
}
