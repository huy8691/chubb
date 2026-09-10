"use client";
/**
 * H07 · CMS — Duyệt ảnh Studio Tư vấn viên gửi lên (mục công khai Ảnh thực tế từ Tư vấn viên).
 * Chip lọc Chờ duyệt (N) · Đã duyệt · Từ chối · Riêng tư · bảng Ảnh · Tư vấn viên · Mẫu · Ngày gửi · Đồng ý · Hành động (Duyệt / Từ chối nhanh trên hàng chờ duyệt · Xem → H07a) · phân trang.
 * Nhận ?tt=cho-duyet (từ H01 · H02) và ?tvv=<mã> (từ H11a) để lọc sẵn.
 */
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { fmtDate, fmtNum } from "@/lib/seed";
import type { StudioImage } from "@/lib/types";
import { Button, Chip, EmptyState, FilterChips, ImageBox, Modal, Pagination, StatusChip, Table, useFlash } from "@/components/ui";
import { CmsCard, CmsHeader } from "@/components/cms/CmsShell";
import { TuChoiForm, useDuyetAnh } from "@/components/cms/anh-studio";
import { tiLeToRatio } from "@/components/cong-cu/StudioPreview";

const PER_PAGE = 20;
type Loc = StudioImage["trangThai"];
/** Ảnh Riêng tư không vào CMS — chỉ ảnh TVV đã bấm Hiển thị công khai (09/09) */
const LOC: Loc[] = ["cho-duyet", "da-duyet", "bi-tu-choi", "da-ngung"];

export default function Page() {
  return <Suspense fallback={null}><DanhSach /></Suspense>;
}

function DanhSach() {
  const sp = useSearchParams();
  const { data } = useStore();
  const { flash, node } = useFlash();
  const { duyet, tuChoi, tenMau } = useDuyetAnh();
  const ttParam = sp.get("tt");
  const tvvParam = sp.get("tvv") ?? "";
  const [tt, setTt] = useState<Loc>(LOC.includes(ttParam as Loc) ? (ttParam as Loc) : "cho-duyet");
  const [tvv, setTvv] = useState(tvvParam);
  const [page, setPage] = useState(1);
  const [tuChoiAnh, setTuChoiAnh] = useState<StudioImage | null>(null);

  const advisor = (ma: string) => data.advisors.find((a) => a.ma === ma);
  const mau = (id: string) => data.studioTemplates.find((t) => t.id === id);
  const goc = useMemo(() => data.studioImages.filter((a) => !tvv || a.advisorMa === tvv), [data.studioImages, tvv]);
  const count = (s: Loc) => goc.filter((a) => a.trangThai === s).length;
  const list = useMemo(() => goc.filter((a) => a.trangThai === tt).sort((a, b) => b.tao.localeCompare(a.tao)), [goc, tt]);
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const cur = Math.min(page, pages);
  const shown = list.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);
  const tvvLoc = tvv ? advisor(tvv) : undefined;

  const nhanTT = (s: Loc) => (s === "cho-duyet" ? "Chờ duyệt" : s === "da-duyet" ? "Đang công khai" : s === "bi-tu-choi" ? "Từ chối" : s === "da-ngung" ? "Đã ngừng công khai" : "Riêng tư");

  return (
    <>
      <CmsHeader title="Duyệt ảnh Studio Tư vấn viên gửi lên" desc="Ảnh Tư vấn viên tạo trong Studio và xin hiển thị công khai trong mục Ảnh thực tế từ Tư vấn viên. Mỗi ảnh chỉ gửi một lần; từ chối là kết thúc." />
      <CmsCard>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <FilterChips<Loc> value={tt} onChange={(v) => { setTt(v); setPage(1); }} options={LOC.map((s) => ({ value: s, label: nhanTT(s), count: count(s) }))} />
          {tvvLoc && (
            <Chip tone="blue" className="ml-auto">Của {tvvLoc.hoTen} · {tvvLoc.ma} <button type="button" aria-label="Bỏ lọc Tư vấn viên" className="ml-2 opacity-70 hover:opacity-100" onClick={() => { setTvv(""); setPage(1); }}>✕</button></Chip>
          )}
        </div>
        {shown.length === 0 ? (
          <EmptyState title={tt === "cho-duyet" ? "Không còn ảnh chờ duyệt" : `Không có ảnh ở trạng thái ${nhanTT(tt)}`} desc={tt === "cho-duyet" ? "Ảnh Tư vấn viên bấm Hiển thị công khai sẽ hiện ở đây." : "Đổi bộ lọc để xem ảnh khác."} />
        ) : (
          <Table head={["Ảnh", "Tư vấn viên", "Mẫu", "Ngày gửi", "Đồng ý", "Trạng thái", "Hành động"]}>
            {shown.map((a) => {
              const ad = advisor(a.advisorMa); const m = mau(a.templateId);
              return (
                <tr key={a.id}>
                  <td><Link href={R.H07a(a.id)}><ImageBox ratio={tiLeToRatio(m?.tiLe ?? "3:4")} className="w-[64px]" /></Link></td>
                  <td className="font-bold text-den whitespace-nowrap"><Link href={R.H07a(a.id)} className="hover:text-blue">{ad?.hoTen ?? "Tư vấn viên"} · {a.advisorMa}</Link></td>
                  <td className="whitespace-nowrap">{m?.ten ?? "Mẫu Studio"} · v{a.phienBanMau ?? m?.phienBan ?? 1}</td>
                  <td className="whitespace-nowrap text-ink2">{fmtDate(a.tao)}</td>
                  <td className="whitespace-nowrap text-[13px]">{a.dongYCongKhai ? "✓ đã đồng ý" : <span className="text-mut">chưa tick</span>}</td>
                  <td><StatusChip s={a.trangThai} /></td>
                  <td className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {a.trangThai === "cho-duyet" && <>
                        <Button size="sm" onClick={() => { duyet(a); flash(`Đã duyệt — ảnh của ${ad?.hoTen ?? a.advisorMa} đang hiển thị công khai`); }}>Duyệt</Button>
                        <Button size="sm" kind="secondary" onClick={() => setTuChoiAnh(a)}>Từ chối</Button>
                      </>}
                      <Link href={R.H07a(a.id)} className="text-blue font-bold text-[13px] px-1">Xem</Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
        <div className="flex items-center justify-between mt-4 text-[13px] text-ink2">
          <span>{fmtNum(list.length)} {nhanTT(tt).toLowerCase()} · {PER_PAGE} mục/trang</span>
          <Pagination page={cur} pages={pages} onChange={setPage} />
        </div>
      </CmsCard>

      <Modal open={!!tuChoiAnh} onClose={() => setTuChoiAnh(null)} title={tuChoiAnh ? `Từ chối ảnh · ${advisor(tuChoiAnh.advisorMa)?.hoTen ?? tuChoiAnh.advisorMa} · ${tenMau(tuChoiAnh)}` : ""} width={720}>
        {tuChoiAnh && <TuChoiForm onHuy={() => setTuChoiAnh(null)} onGui={(lyDo) => { tuChoi(tuChoiAnh, lyDo); setTuChoiAnh(null); flash("Đã gửi từ chối — Tư vấn viên thấy lý do trong Thông báo"); }} />}
      </Modal>
      {node}
    </>
  );
}
