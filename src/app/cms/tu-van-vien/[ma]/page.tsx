"use client";
/* eslint-disable react-hooks/static-components -- component trình bày cục bộ, không giữ state; đủ cho demo */
/** H11a · CMS — Tư vấn viên — chi tiết (tài khoản · danh thiếp · hành động). Sửa → H11b; Xem danh thiếp công khai → E03 tab mới. */
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, use, useEffect, useRef, useState } from "react";
import { CmsCard, CmsHeader } from "@/components/cms/CmsShell";
import { Button, Chip, Modal, useFlash } from "@/components/ui";
import { R, SITE_HOST } from "@/lib/routes";
import { fmtDate, fmtDateTime, fmtNum } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { THANG_BXH, khuVuc, nhanThe } from "@/components/danh-thiep/lib";

export default function Page({ params }: { params: Promise<{ ma: string }> }) {
  const { ma } = use(params);
  return <Suspense fallback={null}><ChiTiet ma={ma} /></Suspense>;
}

function ChiTiet({ ma }: { ma: string }) {
  const sp = useSearchParams();
  const router = useRouter();
  const { data, actions, ready } = useStore();
  const { flash, node } = useFlash();
  const [confirmGo, setConfirmGo] = useState(false);
  const flashed = useRef(false);

  // Thông báo sau khi lưu từ H11b (?da=moi | sua)
  useEffect(() => {
    const da = sp.get("da");
    if (!da || flashed.current) return;
    flashed.current = true;
    flash(da === "moi" ? "Đã tạo Tư vấn viên và gửi mã đăng nhập tới email" : "Đã lưu thông tin Tư vấn viên");
  }, [sp, flash]);

  const a = data.advisors.find((x) => x.ma === ma);
  if (!ready) return null;
  if (!a) {
    return (
      <>
        <CmsHeader crumbs={[{ label: "Tư vấn viên", href: R.H11 }, { label: ma }]} title="Không tìm thấy Tư vấn viên" desc={`Không có Tư vấn viên nào mang mã ${ma}.`} />
        <Button href={R.H11} kind="secondary">Về danh sách</Button>
      </>
    );
  }

  const rank = data.ranking.find((r) => r.advisorMa === a.ma);
  const anh = data.studioImages.filter((s) => s.advisorMa === a.ma);
  const anhCho = anh.filter((s) => s.trangThai === "cho-duyet").length;
  const dh = a.danhHieu.filter((d) => d.congKhai === "da-cong-khai").map((d) => d.ten);
  const daGo = a.trangThaiTaiKhoan === "da-go";
  const duongDan = `${SITE_HOST}/${a.ma}`;

  const toggleThe = () => {
    actions.update("advisors", (list) => list.map((x) => x.ma === a.ma ? { ...x, theCongKhai: !x.theCongKhai, theAnBoi: x.theCongKhai ? "quan-tri" : undefined } : x));
    flash(a.theCongKhai ? "Đã ẩn danh thiếp công khai" : "Đã hiện lại danh thiếp công khai");
  };
  const go = () => {
    actions.update("advisors", (list) => list.map((x) => x.ma === a.ma ? { ...x, trangThaiTaiKhoan: "da-go", theCongKhai: false, theAnBoi: "quan-tri" } : x));
    setConfirmGo(false);
    flash("Đã gỡ tài khoản và danh thiếp (nghỉ việc)");
  };

  const Row = ({ l, v }: { l: string; v: React.ReactNode }) => (
    <div className="grid grid-cols-[240px_1fr] gap-4 py-2.5 border-b border-vien2 last:border-0 text-[14px]"><span className="text-ink2 text-[13px]">{l}</span><span className="text-den">{v}</span></div>
  );

  return (
    <>
      <CmsHeader
        crumbs={[{ label: "Tư vấn viên", href: R.H11 }, { label: `${a.hoTen} · ${a.ma}` }]}
        title={a.hoTen}
        right={!daGo && <Button href={R.H11b(a.ma)}>Sửa thông tin</Button>}
      />
      <div className="flex flex-wrap gap-2 mb-6">
        <Chip tone={daGo ? "grey" : a.theCongKhai ? "blue" : "amber"}>THẺ: {nhanThe(a).toUpperCase()}</Chip>
        <Chip tone={daGo ? "red" : "green"}>TÀI KHOẢN: {daGo ? "ĐÃ GỠ" : "HOẠT ĐỘNG"}</Chip>
        {dh.map((t) => <Chip key={t} tone="pink">{t.toUpperCase()}</Chip>)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <CmsCard title="Tài khoản">
          <Row l="Mã Tư vấn viên" v={<span className="font-mono">{a.ma}</span>} />
          <Row l="Họ tên" v={<b>{a.hoTen}</b>} />
          <Row l="Email đăng nhập" v={a.email} />
          <Row l="Chức danh" v={a.chucDanh} />
          <Row l="Văn phòng" v={khuVuc(a.vanPhong)} />
          <Row l="Ngày bắt đầu" v={fmtDate(a.ngayBatDau)} />
          <Row l="Đăng nhập gần nhất" v={a.dangNhapGanNhat ? `${fmtDateTime(a.dangNhapGanNhat)} · Chrome trên macOS` : "Chưa đăng nhập"} />
        </CmsCard>
        <CmsCard title="Danh thiếp" right={!daGo && a.theCongKhai && <Link href={R.E03(a.ma)} target="_blank" className="text-[13px] font-bold text-blue hover:underline">Xem danh thiếp công khai</Link>}>
          <Row l="Thẻ công khai" v={daGo ? "Đã gỡ" : a.theCongKhai ? "Bật — Tư vấn viên tự tắt được" : a.theAnBoi === "quan-tri" ? "Tắt — Quản trị đã ẩn" : "Tắt — Tư vấn viên đã tắt"} />
          <Row l="Đường dẫn thẻ" v={<Link href={R.E03(a.ma)} target="_blank" className="font-bold text-blue hover:underline">{duongDan}</Link>} />
          <Row l="Hồ sơ năng lực" v={a.hoSoNangLuc ? `Đã điền${a.hoSoNangLuc.capNhat ? ` · cập nhật ${fmtDate(a.hoSoNangLuc.capNhat)}` : ""}` : "Chưa có"} />
          <Row l="Ảnh Studio" v={<Link href={`${R.H07}?tvv=${a.ma}`} className="font-bold text-blue hover:underline">{anh.length} ảnh{anhCho ? ` · ${anhCho} chờ duyệt` : ""}</Link>} />
          <Row l={`Lượt chia sẻ tháng ${THANG_BXH}`} v={rank ? `${fmtNum(rank.luotDuocTinh)} lượt được tính · ${fmtNum(rank.luotKhongHopLe)} lượt không hợp lệ · ${fmtNum(rank.moTuLink)} lượt mở từ link` : "Chưa có lượt"} />
          <Row l="Vinh danh" v={dh.length ? dh.join(" · ") : "Chưa có"} />
        </CmsCard>
      </div>

      <CmsCard title="Thẻ & tài khoản" className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          {!daGo && <Button kind="secondary" onClick={toggleThe}>{a.theCongKhai ? "Ẩn thẻ" : "Hiện thẻ"}</Button>}
          {!daGo && <Button kind="danger" onClick={() => setConfirmGo(true)}>Gỡ (nghỉ việc)</Button>}
          {!daGo && <Button kind="secondary" onClick={() => flash(`Đã gửi mã đăng nhập 6 số tới ${a.email}`)}>Gửi lại mã đăng nhập</Button>}
          <Button kind="ghost" className="ml-auto" onClick={() => router.push(R.H11)}>Về danh sách</Button>
        </div>
      </CmsCard>

      <Modal open={confirmGo} onClose={() => setConfirmGo(false)} title="Gỡ Tư vấn viên (nghỉ việc)" width={520}
        footer={<><Button kind="danger" onClick={go}>Gỡ tài khoản và danh thiếp</Button><Button kind="ghost" onClick={() => setConfirmGo(false)}>Huỷ</Button></>}>
        <p className="text-[14px] text-den">Danh thiếp <b>{a.hoTen} · {a.ma}</b> sẽ không xem được nữa và tài khoản không đăng nhập được. Lịch sử chia sẻ và vinh danh vẫn được giữ.</p>
      </Modal>
      {node}
    </>
  );
}
