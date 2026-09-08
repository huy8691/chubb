"use client";
/**
 * G10 · Trang cá nhân › Tài liệu — MỘT bảng tệp dành cho Tư vấn viên (Phần "Dành cho Tư vấn viên", Đã xuất bản, chưa hết hạn).
 * Chip lọc Loại kèm số · tìm · sắp xếp · đếm · Tải cả bộ (.zip) · Xem/Tải · Lưu (→ Đã lưu) · trạng thái rỗng · phân trang.
 * Tài liệu công khai vẫn ở G04 (tab Công cụ); trang này chỉ có tệp nội bộ.
 */
import { useMemo, useState } from "react";
import { useCurrentAdvisor, useStore } from "@/lib/store";
import { fmtDate } from "@/lib/seed";
import { Button, Card, Chip, EmptyState, Eyebrow, FilterChips, H2, Muted, Pagination, SearchBox, Select, Table, useFlash } from "@/components/ui";

const MOI_TRANG = 8;
type Sap = "moi" | "ten";
const HOM_NAY = new Date().toISOString().slice(0, 10);

export default function Page() {
  const { data, actions } = useStore();
  const tvv = useCurrentAdvisor();
  const { flash, node } = useFlash();
  const [loai, setLoai] = useState("tat-ca");
  const [q, setQ] = useState("");
  const [sap, setSap] = useState<Sap>("moi");
  const [trang, setTrang] = useState(1);

  const tenLoai = (id: string) => data.docTypes.find((t) => t.id === id)?.ten ?? "";
  const noiBo = useMemo(
    () => data.documents.filter((d) => d.phan === "tvv" && d.trangThai === "da-xuat-ban" && (!d.hetHan || d.hetHan >= HOM_NAY)),
    [data.documents],
  );
  const chips = [
    { value: "tat-ca", label: "Tất cả", count: noiBo.length },
    ...[...data.docTypes].sort((a, b) => a.thuTu - b.thuTu).map((t) => ({ value: t.id, label: t.ten, count: noiBo.filter((d) => d.loaiId === t.id).length })).filter((c) => c.count > 0),
  ];
  const loc = useMemo(() => {
    const k = q.trim().toLowerCase();
    return noiBo
      .filter((d) => (loai === "tat-ca" || d.loaiId === loai) && (!k || d.ten.toLowerCase().includes(k)))
      .sort((a, b) => (sap === "ten" ? a.ten.localeCompare(b.ten, "vi") : b.capNhat.localeCompare(a.capNhat)));
  }, [noiBo, loai, q, sap]);
  const pages = Math.max(1, Math.ceil(loc.length / MOI_TRANG));
  const p = Math.min(trang, pages);
  const hien = loc.slice((p - 1) * MOI_TRANG, p * MOI_TRANG);
  const capNhatGanNhat = noiBo.reduce((m, d) => (d.capNhat > m ? d.capNhat : m), "");

  if (!tvv) return null;
  const daLuu = (id: string) => data.savedItems.some((s) => s.advisorMa === tvv.ma && s.loai === "tai-lieu" && s.refId === id);
  const toggleLuu = (id: string, ten: string) => {
    if (daLuu(id)) {
      actions.update("savedItems", (l) => l.filter((s) => !(s.advisorMa === tvv.ma && s.loai === "tai-lieu" && s.refId === id)));
      flash(`Đã bỏ lưu “${ten}”`);
    } else {
      actions.update("savedItems", (l) => [{ id: `s${Date.now()}`, advisorMa: tvv.ma, loai: "tai-lieu", refId: id, ngay: new Date().toISOString().slice(0, 10) }, ...l]);
      flash(`Đã lưu “${ten}” vào Đã lưu`);
    }
  };

  return (
    <div>
      {node}
      <Eyebrow className="mb-2">Tài liệu dành cho Tư vấn viên · {noiBo.length} tệp</Eyebrow>
      <H2>Tài liệu nội bộ — không chia sẻ ra ngoài Chubb Life</H2>

      <div className="mt-6">
        <FilterChips options={chips} value={loai} onChange={(v) => { setLoai(v); setTrang(1); }} />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <SearchBox value={q} onChange={(v) => { setQ(v); setTrang(1); }} placeholder="Tìm tài liệu…" className="w-[360px]" />
        <Select value={sap} onChange={(e) => setSap(e.target.value as Sap)} className="w-[200px]">
          <option value="moi">Sắp xếp: Mới nhất</option>
          <option value="ten">Sắp xếp: Tên A–Z</option>
        </Select>
        <span className="text-[13px] font-bold text-den">{loc.length} tệp</span>
        <Button kind="secondary" className="ml-auto" disabled={loc.length === 0} onClick={() => flash(`Đã tải cả bộ ${loc.length} tệp (.zip)`)}>Tải cả bộ (.zip)</Button>
      </div>

      {hien.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={`Không có tệp khớp “${q || tenLoai(loai)}”`}
            desc="Thử từ khoá khác hoặc bỏ bộ lọc Loại."
            action={<Button kind="secondary" onClick={() => { setQ(""); setLoai("tat-ca"); setTrang(1); }}>Bỏ bộ lọc</Button>}
          />
        </div>
      ) : (
        <Card className="mt-6 p-2">
          <Table head={["Tên tệp", "Loại", "Định dạng", "Kích cỡ", "Phiên bản", "Cập nhật", "", "", ""]}>
            {hien.map((d) => (
              <tr key={d.id}>
                <td className="font-bold text-den">
                  <div className="flex items-center gap-3">
                    <span className="size-9 shrink-0 rounded-sm bg-xam flex items-center justify-center text-[10px] font-bold text-ink2">{d.dinhDang}</span>
                    <div>
                      <div>{d.ten}</div>
                      <Chip tone="amber" className="mt-1 h-[22px] text-[11px]">Dành cho Tư vấn viên</Chip>
                    </div>
                  </div>
                </td>
                <td className="text-ink2">{tenLoai(d.loaiId)}</td>
                <td className="text-ink2">{d.dinhDang}</td>
                <td className="text-ink2">{d.kichCo}</td>
                <td className="text-ink2">{d.phienBan}</td>
                <td className="text-ink2 whitespace-nowrap">{fmtDate(d.capNhat)}</td>
                <td><Button size="sm" kind="secondary" onClick={() => flash(`Đã mở “${d.ten}”`)}>Xem</Button></td>
                <td><Button size="sm" onClick={() => flash(`Đã tải “${d.ten}” (${d.dinhDang} · ${d.kichCo})`)}>Tải</Button></td>
                <td>
                  <button type="button" onClick={() => toggleLuu(d.id, d.ten)} className={daLuu(d.id) ? "text-[13px] font-bold text-ink2 hover:text-red-fg whitespace-nowrap" : "text-[13px] font-bold text-blue hover:underline whitespace-nowrap"}>
                    {daLuu(d.id) ? "Đã lưu" : "Lưu"}
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      )}
      <Pagination page={p} pages={pages} onChange={setTrang} />
      <Muted className="mt-8">Tài liệu cập nhật gần nhất: {fmtDate(capNhatGanNhat)}</Muted>
    </div>
  );
}
