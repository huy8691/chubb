"use client";
/**
 * H09 · CMS — Tài liệu (danh sách tệp). Hai nút xếp dọc: "+ Thêm tài liệu" → H09a (form trống) · "Loại tài liệu (N)" → H09b.
 * Chip lọc Phần (Tất cả · Công khai · Dành cho Tư vấn viên · Hết hạn) · Loại ▾ · Trạng thái ▾ · tìm · bảng · phân trang · Sửa → H09a · Gỡ.
 * Phần (công khai / TVV) đặt trên từng tệp; Loại chỉ để phân loại. Chỉ tệp Đã xuất bản, chưa hết hạn mới hiện trên G04 · G10.
 */
import Link from "next/link";
import { useMemo, useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { fmtDate } from "@/lib/seed";
import type { Document, TrangThaiXuatBan } from "@/lib/types";
import { Button, Chip, EmptyState, FilterChips, Pagination, SearchBox, Select, StatusChip, Table, useFlash } from "@/components/ui";
import { CmsCard, CmsHeader } from "@/components/cms/CmsShell";

const PER_PAGE = 10;
type Phan = "tat-ca" | "cong-khai" | "tvv" | "het-han";
const HOM_NAY = new Date().toISOString().slice(0, 10);
const hetHan = (d: Document) => !!d.hetHan && d.hetHan < HOM_NAY;

export default function Page() {
  const { data, actions } = useStore();
  const { flash, node } = useFlash();
  const [phan, setPhan] = useState<Phan>("tat-ca");
  const [loaiId, setLoaiId] = useState("");
  const [tt, setTt] = useState<"" | TrangThaiXuatBan>("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const loai = [...data.docTypes].sort((a, b) => a.thuTu - b.thuTu);
  const tenLoai = (id: string) => data.docTypes.find((t) => t.id === id)?.ten ?? "—";
  const count = (p: Phan) => data.documents.filter((d) => p === "tat-ca" || (p === "het-han" ? hetHan(d) : d.phan === p)).length;

  const list = useMemo(() => data.documents
    .filter((d) => phan === "tat-ca" || (phan === "het-han" ? hetHan(d) : d.phan === phan))
    .filter((d) => !loaiId || d.loaiId === loaiId)
    .filter((d) => !tt || d.trangThai === tt)
    .filter((d) => !q.trim() || d.ten.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => b.capNhat.localeCompare(a.capNhat)), [data.documents, phan, loaiId, tt, q]);
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const cur = Math.min(page, pages);
  const shown = list.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);

  const go = (d: Document) => {
    actions.update("documents", (ds) => ds.map((x) => x.id === d.id ? { ...x, trangThai: "da-go", capNhat: new Date().toISOString() } : x));
    flash(`Đã gỡ “${d.ten}” khỏi trang Tài liệu`);
  };

  return (
    <>
      <CmsHeader title="Tài liệu" desc="Mỗi tệp thuộc một loại và một phần (Công khai hoặc Dành cho Tư vấn viên). Chỉ tệp Đã xuất bản mới hiện trên trang." right={<>
        <Button href={R.H09new}>+ Thêm tài liệu</Button>
        <Button kind="secondary" href={R.H09b}>Loại tài liệu ({data.docTypes.length})</Button>
      </>} />
      <CmsCard>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <FilterChips<Phan>
            value={phan}
            onChange={(v) => { setPhan(v); setPage(1); }}
            options={[{ value: "tat-ca", label: "Tất cả", count: count("tat-ca") }, { value: "cong-khai", label: "Công khai", count: count("cong-khai") }, { value: "tvv", label: "Dành cho Tư vấn viên", count: count("tvv") }, { value: "het-han", label: "Hết hạn", count: count("het-han") }]}
          />
          <Select value={loaiId} onChange={(e) => { setLoaiId(e.target.value); setPage(1); }} className="w-[220px]" aria-label="Lọc theo loại">
            <option value="">Loại: Tất cả</option>
            {loai.map((t) => <option key={t.id} value={t.id}>{t.ten}</option>)}
          </Select>
          <Select value={tt} onChange={(e) => { setTt(e.target.value as "" | TrangThaiXuatBan); setPage(1); }} className="w-[190px]" aria-label="Lọc theo trạng thái">
            <option value="">Trạng thái: Tất cả</option>
            <option value="nhap">Nháp</option>
            <option value="da-xuat-ban">Đã xuất bản</option>
            <option value="da-go">Đã gỡ</option>
          </Select>
          <SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Tìm theo tên tệp…" className="w-[260px] ml-auto" />
        </div>

        {shown.length === 0 ? (
          <EmptyState title="Không có tệp phù hợp" desc="Đổi bộ lọc hoặc thêm tài liệu mới." action={<Button href={R.H09new}>+ Thêm tài liệu</Button>} />
        ) : (
          <Table head={["Tên", "Loại", "Định dạng · cỡ", "Phần", "Phiên bản", "Cập nhật", "Hết hạn", "Trạng thái", ""]}>
            {shown.map((d) => (
              <tr key={d.id} className={d.trangThai === "da-go" ? "opacity-60" : undefined}>
                <td className="font-bold text-den max-w-[360px]"><Link href={R.H09a(d.id)} className="hover:text-blue">{d.ten}</Link></td>
                <td className="whitespace-nowrap text-ink2">{tenLoai(d.loaiId)}</td>
                <td className="whitespace-nowrap text-ink2">{d.dinhDang} · {d.kichCo}</td>
                <td className="whitespace-nowrap">{d.phan === "cong-khai" ? <Chip tone="blue">Công khai</Chip> : <Chip tone="amber">Tư vấn viên</Chip>}</td>
                <td className="whitespace-nowrap tabular-nums">{d.phienBan}</td>
                <td className="whitespace-nowrap text-ink2">{fmtDate(d.capNhat)}</td>
                <td className="whitespace-nowrap text-ink2">{d.hetHan ? <span className={hetHan(d) ? "text-red-fg font-bold" : undefined}>{fmtDate(d.hetHan)}</span> : "—"}</td>
                <td>{hetHan(d) && d.trangThai === "da-xuat-ban" ? <Chip tone="red">Hết hạn</Chip> : <StatusChip s={d.trangThai} />}</td>
                <td className="text-right whitespace-nowrap">
                  <Link href={R.H09a(d.id)} className="text-blue font-bold">Sửa</Link>
                  {d.trangThai === "da-xuat-ban" && <button type="button" onClick={() => go(d)} className="ml-3 text-ink2 hover:text-red-fg">Gỡ</button>}
                </td>
              </tr>
            ))}
          </Table>
        )}
        <div className="flex items-center justify-between mt-4 text-[13px] text-ink2">
          <span>Hiện {list.length === 0 ? 0 : (cur - 1) * PER_PAGE + 1}–{Math.min(cur * PER_PAGE, list.length)} / {list.length} tệp</span>
          <Pagination page={cur} pages={pages} onChange={setPage} />
        </div>
      </CmsCard>
      {node}
    </>
  );
}
