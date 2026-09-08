"use client";
/**
 * H04 · CMS — Bài viết (danh sách). Hai nút xếp dọc: "+ Viết bài mới" → H06 (form trống) · "Chuyên đề (N)" → H04b.
 * Lọc trạng thái (chip) · lọc chuyên đề ▾ · tìm theo tiêu đề · bảng · phân trang · Sửa → H06 điền sẵn.
 */
import Link from "next/link";
import { useMemo, useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { fmtDate, fmtDateTime, fmtNum } from "@/lib/seed";
import type { TrangThaiXuatBan } from "@/lib/types";
import { Button, Chip, EmptyState, FilterChips, Pagination, SearchBox, Select, StatusChip, Table } from "@/components/ui";
import { CmsCard, CmsHeader } from "@/components/cms/CmsShell";

const PER_PAGE = 10;
type Loc = "tat-ca" | TrangThaiXuatBan;

export default function Page() {
  const { data } = useStore();
  const [q, setQ] = useState("");
  const [tt, setTt] = useState<Loc>("tat-ca");
  const [cdId, setCdId] = useState("");
  const [page, setPage] = useState(1);

  const cds = [...data.chuyenDe].sort((a, b) => a.thuTu - b.thuTu);
  const cdOf = (id: string) => data.chuyenDe.find((c) => c.id === id);
  const count = (s: Loc) => data.articles.filter((a) => s === "tat-ca" || a.trangThai === s).length;

  const list = useMemo(() => data.articles
    .filter((a) => tt === "tat-ca" || a.trangThai === tt)
    .filter((a) => !cdId || a.chuyenDeId === cdId)
    .filter((a) => !q.trim() || a.tieuDe.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => b.capNhat.localeCompare(a.capNhat)), [data.articles, tt, cdId, q]);
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const cur = Math.min(page, pages);
  const shown = list.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);

  return (
    <>
      <CmsHeader title="Bài viết" desc="Bài đã xuất bản hiện trên Thư viện Toàn Tâm Chia Sẻ, trang chuyên đề và trang chủ." right={<>
        <Button href={R.H06new}>+ Viết bài mới</Button>
        <Button kind="secondary" href={R.H04b}>Chuyên đề ({data.chuyenDe.length})</Button>
      </>} />
      <CmsCard>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Tìm theo tiêu đề…" className="w-[280px]" />
          <Select value={cdId} onChange={(e) => { setCdId(e.target.value); setPage(1); }} className="w-[220px]" aria-label="Lọc theo chuyên đề">
            <option value="">Mọi chuyên đề</option>
            {cds.map((c) => <option key={c.id} value={c.id}>{c.ten}</option>)}
          </Select>
          <FilterChips<Loc>
            value={tt}
            onChange={(v) => { setTt(v); setPage(1); }}
            options={[{ value: "tat-ca", label: "Tất cả", count: count("tat-ca") }, { value: "nhap", label: "Nháp", count: count("nhap") }, { value: "da-len-lich", label: "Đã lên lịch", count: count("da-len-lich") }, { value: "da-xuat-ban", label: "Đã xuất bản", count: count("da-xuat-ban") }, { value: "da-go", label: "Đã gỡ", count: count("da-go") }]}
          />
        </div>
        {shown.length === 0 ? <EmptyState title="Không có bài viết phù hợp" desc="Đổi bộ lọc hoặc viết bài mới." action={<Button href={R.H06new}>+ Viết bài mới</Button>} /> : (
          <Table head={["Tiêu đề", "Chuyên đề", "Tác giả", "Trạng thái", "Cập nhật", "Lượt xem", ""]}>
            {shown.map((a) => (
              <tr key={a.id}>
                <td className="font-bold text-den max-w-[420px]"><Link href={R.H06(a.id)} className="hover:text-blue">{a.tieuDe}</Link></td>
                <td className="whitespace-nowrap">{cdOf(a.chuyenDeId)?.ten ?? "—"}</td>
                <td className="whitespace-nowrap">{a.tacGia}</td>
                <td>{a.trangThai === "da-len-lich" ? <Chip tone="blue">Lên lịch {a.ngayLenLich ? fmtDate(a.ngayLenLich).slice(0, 5) : ""}</Chip> : <StatusChip s={a.trangThai} />}</td>
                <td className="whitespace-nowrap text-ink2">{fmtDateTime(a.capNhat)}</td>
                <td className="text-right tabular-nums">{fmtNum(a.luotXem)}</td>
                <td className="text-right"><Link href={R.H06(a.id)} className="text-blue font-bold">Sửa</Link></td>
              </tr>
            ))}
          </Table>
        )}
        <div className="flex items-center justify-between mt-4 text-[13px] text-ink2">
          <span>Hiện {list.length === 0 ? 0 : (cur - 1) * PER_PAGE + 1}–{Math.min(cur * PER_PAGE, list.length)} / {list.length}</span>
          <Pagination page={cur} pages={pages} onChange={setPage} />
        </div>
      </CmsCard>
    </>
  );
}
