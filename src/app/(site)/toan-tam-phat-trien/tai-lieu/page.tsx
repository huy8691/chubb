"use client";
/** G04 · Tài liệu (công khai) — MỘT bảng tệp: chip lọc Loại · tìm · sắp xếp · đếm · Xem/Tải · trạng thái rỗng · phân trang · hộp “Bạn là Tư vấn viên?”. Chỉ tệp Phần Công khai, Đã xuất bản, chưa hết hạn. */
import { useMemo, useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { fmtDate } from "@/lib/seed";
import { Breadcrumb, Button, Card, EmptyState, FilterChips, H1, H3, Muted, Pagination, SearchBox, Select, Table, useFlash } from "@/components/ui";

const MOI_TRANG = 8;
type Sap = "moi" | "ten" | "loai";
const HOM_NAY = new Date().toISOString().slice(0, 10);

export default function Page() {
  const { data, session } = useStore();
  const { flash, node } = useFlash();
  const [loai, setLoai] = useState("tat-ca");
  const [q, setQ] = useState("");
  const [sap, setSap] = useState<Sap>("moi");
  const [trang, setTrang] = useState(1);
  const tenLoai = (id: string) => data.docTypes.find((t) => t.id === id)?.ten ?? "";

  const congKhai = useMemo(() => data.documents.filter((d) => d.phan === "cong-khai" && d.trangThai === "da-xuat-ban" && (!d.hetHan || d.hetHan >= HOM_NAY)), [data.documents]);
  const chips = [{ value: "tat-ca", label: "Tất cả", count: congKhai.length }, ...[...data.docTypes].sort((a, b) => a.thuTu - b.thuTu).map((t) => ({ value: t.id, label: t.ten, count: congKhai.filter((d) => d.loaiId === t.id).length })).filter((c) => c.count > 0)];
  const loc = useMemo(() => {
    const k = q.trim().toLowerCase();
    return congKhai.filter((d) => (loai === "tat-ca" || d.loaiId === loai) && (!k || d.ten.toLowerCase().includes(k)))
      .sort((a, b) => sap === "ten" ? a.ten.localeCompare(b.ten, "vi") : sap === "loai" ? tenLoai(a.loaiId).localeCompare(tenLoai(b.loaiId), "vi") : b.capNhat.localeCompare(a.capNhat));
  }, [congKhai, loai, q, sap]); // eslint-disable-line react-hooks/exhaustive-deps
  const pages = Math.max(1, Math.ceil(loc.length / MOI_TRANG));
  const p = Math.min(trang, pages);
  const hien = loc.slice((p - 1) * MOI_TRANG, p * MOI_TRANG);
  const capNhatGanNhat = congKhai.reduce((m, d) => (d.capNhat > m ? d.capNhat : m), "");

  return (
    <>
      <section className="bg-xam">
        <div className="wrap py-10">
          <Breadcrumb items={[{ label: "Toàn Tâm Phát Triển", href: R.D01 }, { label: "Tài liệu" }]} />
          <H1 className="mt-3">Tài liệu</H1>
        </div>
      </section>

      <section className="wrap py-10">
        <FilterChips options={chips} value={loai} onChange={(v) => { setLoai(v); setTrang(1); }} />
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <SearchBox value={q} onChange={(v) => { setQ(v); setTrang(1); }} placeholder="Tìm tài liệu…" className="w-[320px]" />
          <Select value={sap} onChange={(e) => setSap(e.target.value as Sap)} className="w-[200px]"><option value="moi">Sắp xếp: Mới nhất</option><option value="ten">Sắp xếp: Tên A–Z</option><option value="loai">Sắp xếp: Theo loại</option></Select>
          <span className="text-[13px] font-bold text-den ml-auto">{loc.length} tệp</span>
        </div>

        {hien.length === 0 ? (
          <div className="mt-6"><EmptyState title={`Không có tệp khớp “${q || tenLoai(loai)}”`} desc="Thử từ khoá khác hoặc bỏ bộ lọc Loại." action={<Button kind="secondary" onClick={() => { setQ(""); setLoai("tat-ca"); }}>Bỏ bộ lọc</Button>} /></div>
        ) : (
          <Card className="mt-6 p-2">
            <Table head={["Tên tệp", "Loại", "Định dạng", "Kích cỡ", "Phiên bản", "Cập nhật", "", ""]}>
              {hien.map((d) => (
                <tr key={d.id}>
                  <td className="font-bold text-den"><div className="flex items-center gap-3"><span className="size-9 shrink-0 rounded-sm bg-xam flex items-center justify-center text-[10px] font-bold text-ink2">{d.dinhDang}</span>{d.ten}</div></td>
                  <td className="text-ink2">{tenLoai(d.loaiId)}</td>
                  <td className="text-ink2">{d.dinhDang}</td>
                  <td className="text-ink2">{d.kichCo}</td>
                  <td className="text-ink2">{d.phienBan}</td>
                  <td className="text-ink2 whitespace-nowrap">{fmtDate(d.capNhat)}</td>
                  <td><Button size="sm" kind="ghost" onClick={() => flash(`Đã mở “${d.ten}”`)}>Xem</Button></td>
                  <td><Button size="sm" kind="secondary" onClick={() => flash(`Đã tải “${d.ten}” (${d.dinhDang} · ${d.kichCo})`)}>Tải</Button></td>
                </tr>
              ))}
            </Table>
          </Card>
        )}
        <Pagination page={p} pages={pages} onChange={setTrang} />

        <Card className="mt-10 p-4 sm:p-6 flex flex-wrap items-center justify-between gap-6 bg-blue-soft/40">
          <div>
            <H3>Bạn là Tư vấn viên Chubb Life?</H3>
            <Muted className="mt-1">Đăng nhập để xem thêm bảng minh hoạ, biểu mẫu hồ sơ và hướng dẫn quy trình nội bộ.</Muted>
          </div>
          {session.role === "tvv" ? <Button href={R.G10}>Mở Tài liệu dành cho Tư vấn viên</Button> : <Button href={`${R.G01}?next=${encodeURIComponent(R.G10)}`}>Đăng nhập Tư vấn viên</Button>}
        </Card>
        <Muted className="mt-6">Tài liệu cập nhật gần nhất: {fmtDate(capNhatGanNhat)}</Muted>
      </section>
      {node}
    </>
  );
}
