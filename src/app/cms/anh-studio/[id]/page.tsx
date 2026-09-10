"use client";
/**
 * H07a · CMS — Ảnh Studio — xem & duyệt.
 * Ảnh lớn (ImageBox theo tỉ lệ mẫu) · thông tin (Tư vấn viên · Mẫu dùng · Trường TVV điền · Đồng ý công khai · Trạng thái)
 * Nút: Duyệt · Từ chối (lý do) → khối TỪ CHỐI ẢNH cùng trang · Gỡ khỏi bộ sưu tập (ảnh đã duyệt) · Về danh sách → H07.
 * Khối "Đã duyệt (N)" liệt kê ảnh khác đang công khai trong Ảnh thực tế từ Tư vấn viên với nút Ngừng hiển thị công khai.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { fmtDate, fmtDateTime } from "@/lib/seed";
import { Button, Chip, ImageBox, StatusChip, useFlash } from "@/components/ui";
import { CmsCard, CmsHeader } from "@/components/cms/CmsShell";
import { TuChoiForm, useDuyetAnh } from "@/components/cms/anh-studio";
import { tiLeToRatio } from "@/components/cong-cu/StudioPreview";
import { khuVuc } from "@/components/danh-thiep/lib";

const Row = ({ l, v }: { l: string; v: React.ReactNode }) => (
  <div className="py-2.5 border-b border-vien2 last:border-0"><div className="text-[12.5px] text-ink2">{l}</div><div className="text-[14px] text-den mt-0.5">{v}</div></div>
);

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, ready } = useStore();
  const { flash, node } = useFlash();
  const { duyet, tuChoi, go } = useDuyetAnh();
  const [moTuChoi, setMoTuChoi] = useState(false);

  if (!ready) return null;
  const a = data.studioImages.find((x) => x.id === id);
  if (!a) {
    return (
      <>
        <CmsHeader crumbs={[{ label: "Ảnh Studio", href: R.H07 }, { label: id }]} title="Không tìm thấy ảnh" desc="Ảnh có thể đã bị Tư vấn viên xoá." />
        <Button href={R.H07} kind="secondary">Về danh sách</Button>
      </>
    );
  }
  const ad = data.advisors.find((x) => x.ma === a.advisorMa);
  const m = data.studioTemplates.find((t) => t.id === a.templateId);
  const tenMau = m?.ten ?? "Mẫu Studio";
  const pb = a.phienBanMau ?? m?.phienBan ?? 1;
  const truong = m?.truong ? [m.truong.hoTen && "Họ tên", m.truong.chucDanh && "Chức danh", m.truong.soDienThoai && "SĐT", m.truong.gioiThieu && "Câu giới thiệu"].filter(Boolean).join(" · ") : "Họ tên · Chức danh · SĐT";
  const daDuyetKhac = data.studioImages.filter((x) => x.trangThai === "da-duyet" && x.id !== a.id).sort((x, y) => (y.ngayDuyet ?? "").localeCompare(x.ngayDuyet ?? "")).slice(0, 5);
  const tongDaDuyet = data.studioImages.filter((x) => x.trangThai === "da-duyet").length;

  const trangThaiChuoi = a.trangThai === "cho-duyet" ? `Chờ duyệt · gửi ${fmtDateTime(a.tao)}`
    : a.trangThai === "da-duyet" ? `Đang công khai · duyệt ${fmtDateTime(a.ngayDuyet)} · hiển thị trong Ảnh thực tế từ Tư vấn viên`
    : a.trangThai === "bi-tu-choi" ? `Từ chối · Tư vấn viên đã thấy lý do · kết thúc, không duyệt lại và không gửi lại`
    : a.trangThai === "da-ngung" ? `Đã ngừng công khai · ảnh vẫn trong Ảnh Studio của Tư vấn viên · không gửi lại được`
    : "Riêng tư · chỉ Tư vấn viên thấy trong Ảnh Studio của mình";

  return (
    <>
      <CmsHeader
        crumbs={[{ label: "Ảnh Studio", href: R.H07 }, { label: `${ad?.hoTen ?? "Tư vấn viên"} · ${a.advisorMa}` }]}
        title={<span className="flex items-center gap-3">{tenMau} v{pb} — gửi {fmtDate(a.tao)}<StatusChip s={a.trangThai} /></span>}
      />
      <CmsCard>
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">
          <div>
            <ImageBox ratio={tiLeToRatio(m?.tiLe ?? "3:4")} alt={`Ảnh Studio ${tenMau}`} />
            <div className="mt-2 text-[12px] text-mut">Ảnh {m?.tiLe ?? "3:4"}</div>
          </div>
          <div>
            <Row l="Tư vấn viên" v={ad ? <Link href={R.H11a(ad.ma)} className="hover:text-blue">{ad.hoTen} · {ad.ma} · {khuVuc(ad.vanPhong)}</Link> : a.advisorMa} />
            <Row l="Mẫu dùng" v={m ? <Link href={R.H02a(m.id)} className="hover:text-blue">{tenMau} · v{pb}</Link> : tenMau} />
            <Row l="Trường TVV điền" v={truong} />
            <Row l="Đồng ý công khai" v={a.dongYCongKhai ? "✓ đã tick khi gửi" : <span className="text-amber-fg">Chưa tick — không hiển thị công khai khi chưa có đồng ý</span>} />
            <Row l="Trạng thái" v={trangThaiChuoi} />
            {a.trangThai === "bi-tu-choi" && a.lyDoTuChoi && (
              <div className="mt-4 bg-red-bg border border-red-fg/30 rounded-sm p-4 text-[14px]">
                <div className="text-[12px] font-bold text-red-fg">LÝ DO TỪ CHỐI (Tư vấn viên đã thấy)</div>
                <div className="mt-1 text-den">{a.lyDoTuChoi}</div>
              </div>
            )}
            <div className="flex flex-wrap gap-3 mt-6">
              {a.trangThai === "cho-duyet" && <Button onClick={() => { duyet(a); setMoTuChoi(false); flash(`Đã duyệt — ảnh hiển thị công khai, ${ad?.hoTen ?? "Tư vấn viên"} nhận thông báo`); }} disabled={!a.dongYCongKhai}>Duyệt</Button>}
              {a.trangThai === "cho-duyet" && <Button kind="secondary" onClick={() => setMoTuChoi(true)}>Từ chối (lý do)</Button>}
              {a.trangThai === "da-duyet" && <Button kind="danger" onClick={() => { go(a); flash("Đã ngừng hiển thị công khai — ảnh vẫn trong Ảnh Studio của Tư vấn viên, Tư vấn viên nhận thông báo"); }}>Ngừng hiển thị công khai</Button>}
              <Button kind="ghost" onClick={() => router.push(R.H07)}>Về danh sách</Button>
            </div>
            {!a.dongYCongKhai && a.trangThai === "cho-duyet" && <div className="mt-2 text-[12.5px] text-mut">Chỉ duyệt được khi Tư vấn viên đã tick đồng ý công khai.</div>}
          </div>
        </div>
      </CmsCard>

      {moTuChoi && a.trangThai === "cho-duyet" && (
        <CmsCard className="mt-6">
          <TuChoiForm onHuy={() => setMoTuChoi(false)} onGui={(lyDo) => { tuChoi(a, lyDo); setMoTuChoi(false); flash("Đã gửi từ chối — Tư vấn viên thấy lý do trong Thông báo"); }} />
        </CmsCard>
      )}

      <CmsCard className="mt-6" title={`Đang công khai (${tongDaDuyet})`} desc="Ảnh đang hiển thị trong Ảnh thực tế từ Tư vấn viên — ngừng hiển thị khi cần." right={<Link href={`${R.H07}?tt=da-duyet`} className="text-[13px] font-bold text-blue hover:underline">Xem tất cả</Link>}>
        {daDuyetKhac.length === 0 ? <div className="text-[14px] text-ink2">Chưa có ảnh nào khác đang công khai.</div> : (
          <ul className="divide-y divide-vien2 text-[13.5px]">
            {daDuyetKhac.map((x) => {
              const xa = data.advisors.find((v) => v.ma === x.advisorMa); const xm = data.studioTemplates.find((t) => t.id === x.templateId);
              return (
                <li key={x.id} className="py-3 flex items-center justify-between gap-4">
                  <Link href={R.H07a(x.id)} className="hover:text-blue">{xa?.hoTen ?? "Tư vấn viên"} · {x.advisorMa} — {xm?.ten ?? "Mẫu Studio"} v{x.phienBanMau ?? xm?.phienBan ?? 1} · duyệt {fmtDate(x.ngayDuyet)}</Link>
                  <Button size="sm" kind="secondary" onClick={() => { go(x); flash(`Đã ngừng hiển thị công khai ảnh của ${xa?.hoTen ?? x.advisorMa}`); }}>Ngừng hiển thị công khai</Button>
                </li>
              );
            })}
          </ul>
        )}
        {a.trangThai === "da-duyet" && <div className="mt-3"><Chip tone="green">Ảnh đang xem cũng đang hiển thị công khai</Chip></div>}
      </CmsCard>
      {node}
    </>
  );
}
