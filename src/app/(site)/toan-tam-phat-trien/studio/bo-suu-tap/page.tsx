"use client";
/** D07 · Bộ sưu tập Studio (archive, công khai): lọc theo Mẫu Studio · sắp xếp · đếm · lưới 4×2 · phân trang · sidebar tìm / xem nhiều / cách tham gia. */
import { useMemo, useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { fmtDate } from "@/lib/seed";
import { Breadcrumb, Button, Card, EmptyState, FilterChips, H1, H3, ImageBox, Muted, Pagination, SearchBox, Select } from "@/components/ui";

const MOI_TRANG = 8;
type Sap = "moi" | "cu" | "ten";

export default function Page() {
  const { data, session } = useStore();
  const [mau, setMau] = useState("tat-ca");
  const [sap, setSap] = useState<Sap>("moi");
  const [q, setQ] = useState("");
  const [trang, setTrang] = useState(1);
  const tvv = (ma: string) => data.advisors.find((a) => a.ma === ma);
  const tenMau = (id: string) => data.studioTemplates.find((t) => t.id === id)?.ten ?? "Mẫu Studio";

  const tatCa = useMemo(() => data.studioImages.filter((a) => a.trangThai === "da-duyet"), [data.studioImages]);
  const theoMau = data.studioTemplates.map((t) => ({ value: t.id, label: t.ten, count: tatCa.filter((a) => a.templateId === t.id).length })).filter((x) => x.count > 0);
  const loc = useMemo(() => {
    const k = q.trim().toLowerCase();
    const l = tatCa.filter((a) => (mau === "tat-ca" || a.templateId === mau) && (!k || `${tvv(a.advisorMa)?.hoTen ?? ""} ${a.advisorMa} ${tenMau(a.templateId)}`.toLowerCase().includes(k)));
    return l.sort((a, b) => sap === "ten" ? (tvv(a.advisorMa)?.hoTen ?? "").localeCompare(tvv(b.advisorMa)?.hoTen ?? "", "vi") : sap === "cu" ? (a.ngayDuyet ?? a.tao).localeCompare(b.ngayDuyet ?? b.tao) : (b.ngayDuyet ?? b.tao).localeCompare(a.ngayDuyet ?? a.tao));
  }, [tatCa, mau, q, sap]); // eslint-disable-line react-hooks/exhaustive-deps
  const pages = Math.max(1, Math.ceil(loc.length / MOI_TRANG));
  const p = Math.min(trang, pages);
  const hien = loc.slice((p - 1) * MOI_TRANG, p * MOI_TRANG);
  const xemNhieu = tatCa.slice(0, 3);
  const hrefStudio = (id?: string) => `${R.D02}${id ? `?mau=${id}` : ""}`;

  return (
    <>
      <section className="bg-xam">
        <div className="wrap py-10">
          <Breadcrumb items={[{ label: "Trang chủ", href: R.A01 }, { label: "Toàn Tâm Phát Triển", href: R.D01 }, { label: "Studio", href: R.D02 }, { label: "Bộ sưu tập Studio" }]} />
          <H1 className="mt-3">Bộ sưu tập Studio</H1>
          <Muted className="mt-3 text-[16px]">{tatCa.length} ảnh do Tư vấn viên tạo trong Studio, Chubb đã duyệt và Tư vấn viên đồng ý công khai.</Muted>
        </div>
      </section>

      <section className="wrap py-10 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <FilterChips options={[{ value: "tat-ca", label: "Tất cả", count: tatCa.length }, ...theoMau]} value={mau} onChange={(v) => { setMau(v); setTrang(1); }} />
            <Select value={sap} onChange={(e) => setSap(e.target.value as Sap)} className="w-[180px]"><option value="moi">Mới duyệt nhất</option><option value="cu">Cũ nhất</option><option value="ten">Theo tên Tư vấn viên</option></Select>
          </div>
          <Muted className="mt-4 text-[13px]">Hiện {loc.length === 0 ? 0 : (p - 1) * MOI_TRANG + 1}–{Math.min(p * MOI_TRANG, loc.length)} / {loc.length} ảnh</Muted>
          {hien.length === 0 ? <div className="mt-4"><EmptyState title="Không có ảnh khớp" desc="Thử từ khoá khác hoặc bỏ bộ lọc Mẫu." action={<Button kind="secondary" onClick={() => { setQ(""); setMau("tat-ca"); }}>Bỏ bộ lọc</Button>} /></div> : (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-5">
              {hien.map((a) => { const t = tvv(a.advisorMa); return (
                <Card key={a.id} className="p-3">
                  <ImageBox src={a.anh} ratio="3/4" />
                  <div className="mt-3 text-[13px] font-bold text-den truncate">{t?.hoTen ?? "Tư vấn viên"} · {a.advisorMa}</div>
                  <div className="text-[12px] text-ink2 mt-0.5 truncate">{tenMau(a.templateId)} · v{a.phienBanMau ?? 1}</div>
                  <div className="text-[12px] text-mut">Duyệt {fmtDate(a.ngayDuyet ?? a.tao)}</div>
                  <Button size="sm" kind="secondary" className="mt-3 w-full" href={hrefStudio(a.templateId)}>Dùng mẫu này</Button>
                </Card>); })}
            </div>
          )}
          <Pagination page={p} pages={pages} onChange={setTrang} />
          {pages > 1 && <Muted className="mt-2 text-[13px] text-center">Hiện {(p - 1) * MOI_TRANG + 1}–{Math.min(p * MOI_TRANG, loc.length)} / {loc.length}</Muted>}
        </div>

        <aside className="space-y-6">
          <Card className="p-5">
            <H3>Tìm trong bộ sưu tập</H3>
            <SearchBox className="mt-3" value={q} onChange={(v) => { setQ(v); setTrang(1); }} placeholder="Tên Tư vấn viên, mã, tên mẫu…" />
          </Card>
          <Card className="p-5">
            <H3>Xem nhiều tuần này</H3>
            <ol className="mt-3 space-y-2 text-[13px] text-ink2">{xemNhieu.map((a, i) => <li key={a.id}>{i + 1}. {tenMau(a.templateId)} — {tvv(a.advisorMa)?.hoTen}</li>)}</ol>
          </Card>
          <Card className="p-5">
            <H3>Cách tham gia bộ sưu tập</H3>
            <div className="mt-3 font-bold text-[15px] text-den">Bạn là Tư vấn viên Chubb Life?</div>
            <Muted className="mt-1 text-[13px]">Tạo ảnh của bạn trong Studio, gửi vào bộ sưu tập để đồng nghiệp tham khảo.</Muted>
            <Button className="mt-4" href={session.role === "tvv" ? hrefStudio() : `${R.G01}?next=${encodeURIComponent(R.D02)}`}>Mở Studio</Button>
          </Card>
        </aside>
      </section>
    </>
  );
}
