"use client";
/** H03 · CMS — Bảng vinh danh (danh sách): tên bảng · thời gian · hạng mục có người đạt · số người · công bố ngày · trạng thái · Mở. "+ Bảng mới" tạo bảng nháp (tên tạm) rồi vào H03b đặt tên, thời gian. 09/09: bảng có tên do Chubb đặt, không cắm cứng tháng. */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { R } from "@/lib/routes";
import { fmtDate, thangLabel, thoiGianLabel } from "@/lib/seed";
import type { HonorMonth } from "@/lib/types";
import { Button, FilterChips, Pagination, StatusChip, Table } from "@/components/ui";
import { CmsCard, CmsHeader } from "@/components/cms/CmsShell";
import { useHonor } from "@/components/vinh-danh/honor";

const MOI_TRANG = 5;
type Loc = "tat-ca" | "nhap" | "da-cong-bo";

export default function Page() {
  const router = useRouter();
  const { data, actions, hangMucSorted, hangMucById } = useHonor();
  const [loc, setLoc] = useState<Loc>("tat-ca");
  const [page, setPage] = useState(1);

  const all = [...data.honorMonths].sort((a, b) => (b.congBo ?? b.capNhat).localeCompare(a.congBo ?? a.capNhat));
  const rows = all.filter((m) => loc === "tat-ca" || m.trangThai === loc);
  const pages = Math.max(1, Math.ceil(rows.length / MOI_TRANG));
  const cur = Math.min(page, pages);
  const slice = rows.slice((cur - 1) * MOI_TRANG, cur * MOI_TRANG);

  const soNguoi = (m: HonorMonth) => m.hangMuc.reduce((s, h) => s + h.nguoiDat.length, 0);
  const hangMucCo = (m: HonorMonth) => hangMucSorted.filter((h) => (m.hangMuc.find((x) => x.hangMucId === h.id)?.nguoiDat.length ?? 0) > 0).map((h) => hangMucById(h.id)?.ten).join(" · ");

  const taoBangMoi = () => {
    const id = `bang-${Date.now()}`;
    actions.update("honorMonths", (ms) => [{ id, ten: "Bảng vinh danh mới", nam: new Date().getFullYear(), trangThai: "nhap", hangMuc: hangMucSorted.map((h) => ({ hangMucId: h.id, nguoiDat: [] })), capNhat: new Date().toISOString() }, ...ms]);
    router.push(R.H03b(id));
  };

  return (
    <>
      <CmsHeader title="Bảng vinh danh" desc="Mỗi bảng có tên do Chubb đặt (tháng, quý hay đợt riêng). Bảng đã công bố hiện trên trang Vinh danh; bảng cũ nằm trong mục lưu trữ." right={<Button onClick={taoBangMoi}>+ Bảng mới</Button>} />
      <CmsCard>
        <FilterChips<Loc> value={loc} onChange={(v) => { setLoc(v); setPage(1); }} options={[
          { value: "tat-ca", label: "Tất cả", count: all.length },
          { value: "nhap", label: "Nháp", count: all.filter((m) => m.trangThai === "nhap").length },
          { value: "da-cong-bo", label: "Đã công bố", count: all.filter((m) => m.trangThai === "da-cong-bo").length },
        ]} />
        <Table className="mt-4" head={["Tên bảng · thời gian", "Hạng mục có người đạt", "Số người", "Công bố ngày", "Trạng thái", ""]}>
          {slice.map((m) => (
            <tr key={m.id} className="hover:bg-xam/60">
              <td><Link href={R.H03b(m.id)} className="font-bold text-den hover:text-blue">{thangLabel(m)}</Link>{thoiGianLabel(m) && <div className="text-[11.5px] text-mut">{thoiGianLabel(m)}</div>}</td>
              <td className="text-[12.5px] text-ink2">{hangMucCo(m) || "—"}</td>
              <td>{soNguoi(m) || "—"}</td>
              <td>{m.congBo ? fmtDate(m.congBo) : "—"}</td>
              <td><StatusChip s={m.trangThai} /></td>
              <td className="text-right"><Link href={R.H03b(m.id)} className="font-bold text-blue hover:underline">Mở</Link></td>
            </tr>
          ))}
        </Table>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[12.5px] text-ink2">
          <span>Hiện {rows.length === 0 ? 0 : (cur - 1) * MOI_TRANG + 1}–{Math.min(cur * MOI_TRANG, rows.length)} / {rows.length} bảng</span>
          <Pagination page={cur} pages={pages} onChange={setPage} />
        </div>
      </CmsCard>
    </>
  );
}
