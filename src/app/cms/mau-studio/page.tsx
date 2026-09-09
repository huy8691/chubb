"use client";
/**
 * H02 · CMS — Mẫu Studio (danh sách). "+ Tạo mẫu mới" → H02a (form trống) · "Ảnh Studio chờ duyệt (N)" → H07 lọc Chờ duyệt.
 * Tìm mẫu · chip trạng thái (Tất cả · Đã xuất bản · Nháp · Lưu trữ) · bảng · Sửa → H02a · Xuất bản / Gỡ xuất bản tại chỗ · phân trang.
 */
import Link from "next/link";
import { useMemo, useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { fmtDate, fmtNum } from "@/lib/seed";
import type { StudioTemplate } from "@/lib/types";
import { Button, EmptyState, FilterChips, ImageBox, Pagination, SearchBox, StatusChip, Table, useFlash } from "@/components/ui";
import { CmsCard, CmsHeader } from "@/components/cms/CmsShell";
import { tiLeLabel, tiLeToRatio } from "@/components/cong-cu/StudioPreview";

const PER_PAGE = 10;
type Loc = "tat-ca" | StudioTemplate["trangThai"];

export default function Page() {
  const { data, actions } = useStore();
  const { flash, node } = useFlash();
  const [q, setQ] = useState("");
  const [tt, setTt] = useState<Loc>("tat-ca");
  const [page, setPage] = useState(1);

  const choDuyet = data.studioImages.filter((a) => a.trangThai === "cho-duyet").length;
  const count = (s: Loc) => data.studioTemplates.filter((m) => s === "tat-ca" || m.trangThai === s).length;
  const soAnh = (id: string) => data.studioImages.filter((a) => a.templateId === id).length;

  const list = useMemo(() => data.studioTemplates
    .filter((m) => tt === "tat-ca" || m.trangThai === tt)
    .filter((m) => !q.trim() || m.ten.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => b.capNhat.localeCompare(a.capNhat)), [data.studioTemplates, tt, q]);
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const cur = Math.min(page, pages);
  const shown = list.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);

  const doiTrangThai = (m: StudioTemplate, s: StudioTemplate["trangThai"]) => {
    actions.update("studioTemplates", (l) => l.map((x) => (x.id === m.id ? { ...x, trangThai: s, capNhat: new Date().toISOString() } : x)));
    flash(s === "da-xuat-ban" ? `Đã xuất bản "${m.ten}" — mẫu hiện trong Studio` : `Đã gỡ xuất bản "${m.ten}" — mẫu chuyển sang Lưu trữ`);
  };

  return (
    <>
      <CmsHeader title="Mẫu Studio" desc="Mẫu do Chubb thiết kế để Tư vấn viên tạo ảnh trong Studio. Chỉ mẫu Đã xuất bản mới hiện cho Tư vấn viên." right={<>
        <Button href={R.H02a("moi")}>+ Tạo mẫu mới</Button>
        <Button kind="secondary" href={`${R.H07}?tt=cho-duyet`}>Ảnh Studio chờ duyệt ({choDuyet})</Button>
      </>} />
      <CmsCard>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Tìm mẫu…" className="w-[300px]" />
          <FilterChips<Loc>
            value={tt}
            onChange={(v) => { setTt(v); setPage(1); }}
            options={[{ value: "tat-ca", label: "Tất cả", count: count("tat-ca") }, { value: "da-xuat-ban", label: "Đã xuất bản", count: count("da-xuat-ban") }, { value: "nhap", label: "Nháp", count: count("nhap") }, { value: "luu-tru", label: "Lưu trữ", count: count("luu-tru") }]}
          />
        </div>
        {shown.length === 0 ? <EmptyState title="Không có mẫu phù hợp" desc="Đổi bộ lọc hoặc tạo mẫu mới." action={<Button href={R.H02a("moi")}>+ Tạo mẫu mới</Button>} /> : (
          <Table head={["Mẫu", "Định dạng", "Phiên bản · cập nhật", "Ảnh đã tạo", "Trạng thái", ""]}>
            {shown.map((m) => (
              <tr key={m.id}>
                <td>
                  <Link href={R.H02a(m.id)} className="flex items-center gap-3 hover:text-blue">
                    <ImageBox ratio={tiLeToRatio(m.tiLe)} className="w-[48px] shrink-0" />
                    <span className="font-bold text-den">{m.ten}</span>
                  </Link>
                </td>
                <td className="whitespace-nowrap">{tiLeLabel(m.tiLe)}</td>
                <td className="whitespace-nowrap text-ink2">v{m.phienBan ?? 1} · {fmtDate(m.capNhat)}</td>
                <td className="text-right tabular-nums">{fmtNum(soAnh(m.id) || m.soAnhDaTao)}</td>
                <td><StatusChip s={m.trangThai} /></td>
                <td className="text-right whitespace-nowrap">
                  <Button size="sm" kind="secondary" href={R.H02a(m.id)}>Sửa</Button>
                  {m.trangThai === "da-xuat-ban"
                    ? <button type="button" className="ml-3 text-[12.5px] font-bold text-blue" onClick={() => doiTrangThai(m, "luu-tru")}>Gỡ xuất bản</button>
                    : <button type="button" className="ml-3 text-[12.5px] font-bold text-blue" onClick={() => doiTrangThai(m, "da-xuat-ban")}>Xuất bản</button>}
                </td>
              </tr>
            ))}
          </Table>
        )}
        <div className="flex items-center justify-between mt-4 text-[13px] text-ink2 gap-4">
          <span>{count("tat-ca")} mẫu · Lưu trữ {count("luu-tru")} · Mẫu bị gỡ xuất bản không còn hiện trên Mẫu Studio, ảnh Tư vấn viên đã tạo vẫn giữ.</span>
          <Pagination page={cur} pages={pages} onChange={setPage} />
        </div>
      </CmsCard>
      {node}
    </>
  );
}
