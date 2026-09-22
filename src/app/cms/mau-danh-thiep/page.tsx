"use client";
/**
 * H21 · CMS — Mẫu danh thiếp (danh sách). Khung ảnh chân dung TVV chọn ở E04, hiện trên danh thiếp công khai E03.
 * "+ Tạo mẫu mới" → H21a. Tìm · chip trạng thái · bảng · Sửa → H21a · Xuất bản / Gỡ xuất bản tại chỗ · phân trang.
 * Khác Mẫu Studio: KHÔNG có field chữ (tên/chức danh/SĐT) — mẫu chỉ là ảnh PNG có ô trong suốt cho ảnh chân dung.
 */
import Link from "next/link";
import { useMemo, useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { fmtDate, fmtNum } from "@/lib/seed";
import type { StudioTemplate } from "@/lib/types";
import { Button, EmptyState, FilterChips, ImageBox, Pagination, SearchBox, StatusChip, Table, useFlash } from "@/components/ui";
import { CmsCard, CmsHeader } from "@/components/cms/CmsShell";
import { tiLeToRatio } from "@/components/cong-cu/StudioPreview";

const PER_PAGE = 10;
type Loc = "tat-ca" | StudioTemplate["trangThai"];

export default function Page() {
  const { data, actions } = useStore();
  const { flash, node } = useFlash();
  const [q, setQ] = useState("");
  const [tt, setTt] = useState<Loc>("tat-ca");
  const [page, setPage] = useState(1);

  const count = (s: Loc) => data.profileTemplates.filter((m) => s === "tat-ca" || m.trangThai === s).length;

  const list = useMemo(() => data.profileTemplates
    .filter((m) => tt === "tat-ca" || m.trangThai === tt)
    .filter((m) => !q.trim() || m.ten.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => b.capNhat.localeCompare(a.capNhat)), [data.profileTemplates, tt, q]);
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const cur = Math.min(page, pages);
  const shown = list.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);

  const doiTrangThai = (m: StudioTemplate, s: StudioTemplate["trangThai"]) => {
    actions.update("profileTemplates", (l) => l.map((x) => (x.id === m.id ? { ...x, trangThai: s, capNhat: new Date().toISOString() } : x)));
    flash(s === "da-xuat-ban" ? `Đã xuất bản "${m.ten}" — mẫu hiện cho Tư vấn viên chọn` : `Đã gỡ xuất bản "${m.ten}" — mẫu chuyển sang Lưu trữ`);
  };

  return (
    <>
      <CmsHeader title="Mẫu danh thiếp" desc="Khung ảnh chân dung do Chubb thiết kế — Tư vấn viên chọn ở trang Danh thiếp của tôi, hiện trên danh thiếp công khai. Chỉ mẫu Đã xuất bản mới hiện cho Tư vấn viên." right={<Button href={R.H21a("moi")}>+ Tạo mẫu mới</Button>} />
      <CmsCard>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Tìm mẫu…" className="w-[300px]" />
          <FilterChips<Loc>
            value={tt}
            onChange={(v) => { setTt(v); setPage(1); }}
            options={[{ value: "tat-ca", label: "Tất cả", count: count("tat-ca") }, { value: "da-xuat-ban", label: "Đã xuất bản", count: count("da-xuat-ban") }, { value: "nhap", label: "Nháp", count: count("nhap") }, { value: "luu-tru", label: "Lưu trữ", count: count("luu-tru") }]}
          />
        </div>
        {shown.length === 0 ? <EmptyState title="Không có mẫu phù hợp" desc="Đổi bộ lọc hoặc tạo mẫu mới." action={<Button href={R.H21a("moi")}>+ Tạo mẫu mới</Button>} /> : (
          <Table head={["Mẫu", "Cập nhật", "Lượt dùng", "Trạng thái", ""]}>
            {shown.map((m) => (
              <tr key={m.id}>
                <td>
                  <Link href={R.H21a(m.id)} className="flex items-center gap-3 hover:text-blue">
                    <ImageBox src={m.anh} ratio={tiLeToRatio(m.tiLe)} className="w-[40px] shrink-0" />
                    <span className="font-bold text-den">{m.ten}</span>
                  </Link>
                </td>
                <td className="whitespace-nowrap text-ink2">{fmtDate(m.capNhat)}</td>
                <td className="text-right tabular-nums">{fmtNum(m.soAnhDaTao)}</td>
                <td><StatusChip s={m.trangThai} /></td>
                <td className="text-right whitespace-nowrap">
                  <Button size="sm" kind="secondary" href={R.H21a(m.id)}>Sửa</Button>
                  {m.trangThai === "da-xuat-ban"
                    ? <button type="button" className="ml-3 text-[12.5px] font-bold text-blue" onClick={() => doiTrangThai(m, "luu-tru")}>Gỡ xuất bản</button>
                    : <button type="button" className="ml-3 text-[12.5px] font-bold text-blue" onClick={() => doiTrangThai(m, "da-xuat-ban")}>Xuất bản</button>}
                </td>
              </tr>
            ))}
          </Table>
        )}
        <div className="flex items-center justify-between mt-4 text-[13px] text-ink2 gap-4">
          <span>{count("tat-ca")} mẫu · Lưu trữ {count("luu-tru")} · Mẫu bị gỡ xuất bản không còn cho chọn; Tư vấn viên đang dùng vẫn giữ.</span>
          <Pagination page={cur} pages={pages} onChange={setPage} />
        </div>
      </CmsCard>
      {node}
    </>
  );
}
