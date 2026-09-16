"use client";
/**
 * H08 · CMS — Bảng xếp hạng chia sẻ danh thiếp (hiện Top 5 trên E01 sau khi chốt).
 * (16/09: chỉ còn Lượt chia sẻ — bỏ cột/thẻ phụ và hộp quy tắc; khử trùng lặp là việc kỹ thuật, chốt với Chubb.)
 */
import Link from "next/link";
import { useMemo, useState } from "react";
import { CmsCard, CmsHeader } from "@/components/cms/CmsShell";
import { Button, Chip, Pagination, SearchBox, Select, Stat, Table, useFlash } from "@/components/ui";
import { R } from "@/lib/routes";
import { fmtNum } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { THANG_BXH, isThangChot, khongDau, tinhThanh, xepHang } from "@/components/danh-thiep/lib";

const PAGE = 10;
const NUT_LABEL: Record<string, string> = { "Sao chép link": "Sao chép liên kết" };

export default function Page() {
  const { data, actions } = useStore();
  const { flash, node } = useFlash();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const bxh = useMemo(() => xepHang(data, false), [data]);
  const rows = useMemo(() => { const s = khongDau(q); return s ? bxh.filter(({ a }) => a.ma.includes(s) || khongDau(a.hoTen).includes(s)) : bxh; }, [bxh, q]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const p = Math.min(page, pages);
  const view = rows.slice((p - 1) * PAGE, p * PAGE);

  const tongTinh = data.ranking.reduce((s, r) => s + r.luotDuocTinh, 0);
  const soChiaSe = data.ranking.filter((r) => r.luotDuocTinh > 0).length;
  const daChot = isThangChot(data);

  const chotThang = () => {
    if (daChot) return;
    bxh.slice(0, 3).forEach(({ a, hang }) => actions.notify(a.ma, `Bảng xếp hạng tháng ${THANG_BXH} đã chốt: bạn xếp hạng ${hang}.`, R.E01));
    flash("Đã chốt tháng và công bố Top 5 lên trang Danh thiếp");
  };

  return (
    <>
      <CmsHeader
        title={`Bảng xếp hạng chia sẻ danh thiếp — Tháng ${THANG_BXH}`}
        desc="1 lượt = 1 lần bấm một nút trong popup Chia sẻ trên danh thiếp (Zalo · Facebook · Sao chép liên kết · Tải ảnh · QR), dù người bấm là Tư vấn viên hay khách."
        right={
          <>
            <div className="flex gap-2">
              <Button kind="secondary" onClick={() => flash("Đã xuất Excel bảng xếp hạng tháng " + THANG_BXH)}>Xuất Excel</Button>
              {daChot ? <Chip tone="green" className="h-11">Đã chốt · Top 5 đang hiện trên trang Danh thiếp</Chip>
                : <Button onClick={chotThang}>Chốt tháng & công bố</Button>}
            </div>
          </>
        }
      />

      <div className="flex items-center gap-4 mb-5">
        <Select value={THANG_BXH} onChange={() => flash("Bản demo chỉ có dữ liệu tháng " + THANG_BXH)} className="w-[180px] h-9">
          <option value={THANG_BXH}>Tháng {THANG_BXH}</option><option value="8/2026">Tháng 8/2026</option>
        </Select>
        <Chip tone={daChot ? "green" : "amber"}>{daChot ? "THÁNG ĐÃ CHỐT" : "THÁNG CHƯA CHỐT"}</Chip>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Stat value={fmtNum(tongTinh)} label="lượt chia sẻ trong tháng" />
        <Stat value={`${soChiaSe} / ${fmtNum(data.advisors.length)}`} label="danh thiếp được chia sẻ" />
      </div>

      <CmsCard>
        <div className="mb-4"><SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Tìm theo mã hoặc họ tên Tư vấn viên…" className="w-[360px]" /></div>
        <Table head={["Hạng", "Tư vấn viên", "Lượt chia sẻ", "Nút bấm nhiều nhất", "Danh thiếp"]}>
          {view.map(({ r, a, hang }) => (
            <tr key={a.ma}>
              <td className="font-bold">{hang}</td>
              <td>{a.hoTen} · {tinhThanh(a.vanPhong)} · <span className="font-mono text-[13px]">{a.ma}</span></td>
              <td className="font-bold">{fmtNum(r.luotDuocTinh)}</td>
              <td>{NUT_LABEL[r.nutBamNhieuNhat] ?? r.nutBamNhieuNhat}</td>
              <td><Link href={R.E03(a.ma)} target="_blank" className="font-bold text-blue hover:underline">Mở</Link></td>
            </tr>
          ))}
          {view.length === 0 && <tr><td colSpan={5} className="text-center text-mut py-10">Không có Tư vấn viên nào khớp</td></tr>}
        </Table>
        <div className="flex items-center justify-between mt-4 text-[12.5px] text-ink2">
          <span>Hiện {rows.length === 0 ? 0 : (p - 1) * PAGE + 1}–{Math.min(p * PAGE, rows.length)} / {fmtNum(rows.length)}</span>
          <Pagination page={p} pages={pages} onChange={setPage} />
        </div>
      </CmsCard>

      {node}
    </>
  );
}
