"use client";
/**
 * H05a · CMS — Người dùng CMS — thêm / sửa (id "moi" = tạo mới).
 * Họ tên · Email Chubb (lỗi trùng / sai định dạng) · Vai trò (◉ Quản trị / ○ Biên tập) ·
 * Lưu (mới → thêm cmsUsers, hệ thống gửi mã đăng nhập) · Gửi lại mã đăng nhập · Khoá tài khoản / Mở khoá (chỉ khi sửa) · Huỷ.
 * Không có tick module, không có Văn phòng/đội — quyền theo vai.
 */
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { CmsCard, CmsFormActions, CmsHeader } from "@/components/cms/CmsShell";
import { Button, Field, Input, Radio, StatusChip, useFlash } from "@/components/ui";
import { R } from "@/lib/routes";
import { fmtDateTime } from "@/lib/seed";
import { useCurrentCmsUser, useStore } from "@/lib/store";
import type { CmsUser } from "@/lib/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, actions } = useStore();
  const me = useCurrentCmsUser();
  const { flash, node } = useFlash();

  const moi = id === "moi";
  const goc = moi ? undefined : data.cmsUsers.find((u) => u.id === id);
  const [hoTen, setHoTen] = useState(goc?.hoTen ?? "");
  const [email, setEmail] = useState(goc?.email ?? "");
  const [vai, setVai] = useState<CmsUser["vai"]>(goc?.vai ?? "admin");
  const [loi, setLoi] = useState<{ hoTen?: string; email?: string }>({});
  const [daBamLuu, setDaBamLuu] = useState(false);

  if (!moi && !goc) {
    return (
      <>
        <CmsHeader crumbs={[{ label: "Phân quyền", href: R.H05 }, { label: "Không tìm thấy" }]} title="Không tìm thấy người dùng" />
        <Button kind="secondary" href={R.H05}>Về Phân quyền</Button>
      </>
    );
  }

  const kiemTra = () => {
    const e: typeof loi = {};
    if (!hoTen.trim()) e.hoTen = "Nhập họ tên";
    const em = email.trim().toLowerCase();
    if (!em) e.email = "Nhập email Chubb";
    else if (!EMAIL_RE.test(em)) e.email = "Email không đúng định dạng";
    else if (data.cmsUsers.some((u) => u.email.toLowerCase() === em && u.id !== id)) e.email = "Email này đã có người dùng CMS";
    setLoi(e);
    return Object.keys(e).length === 0;
  };

  const luu = () => {
    setDaBamLuu(true);
    if (!kiemTra()) return;
    const em = email.trim().toLowerCase();
    if (moi) {
      actions.update("cmsUsers", (l) => [...l, { id: `u${Date.now()}`, hoTen: hoTen.trim(), email: em, vai, trangThai: "hoat-dong" }]);
      flash(`Đã gửi mã đăng nhập tới ${em}`);
    } else {
      actions.update("cmsUsers", (l) => l.map((u) => (u.id === id ? { ...u, hoTen: hoTen.trim(), email: em, vai } : u)));
      flash(goc && goc.email.toLowerCase() !== em ? `Đã lưu — mã đăng nhập gửi tới email mới ${em}` : `Đã lưu ${hoTen.trim()}`);
    }
    setTimeout(() => router.push(R.H05), 900);
  };

  const doiKhoa = () => {
    if (!goc) return;
    const khoa = goc.trangThai === "hoat-dong";
    actions.update("cmsUsers", (l) => l.map((u) => (u.id === id ? { ...u, trangThai: khoa ? "da-khoa" : "hoat-dong" } : u)));
    flash(khoa ? `Đã khoá tài khoản ${goc.hoTen} — không đăng nhập CMS được nữa` : `Đã mở khoá tài khoản ${goc.hoTen}`);
  };

  const laToi = !!goc && me?.email === goc.email;
  const tieuDe = moi ? "Thêm người dùng" : goc!.hoTen;

  return (
    <>
      {node}
      <CmsHeader
        crumbs={[{ label: "Phân quyền", href: R.H05 }, { label: tieuDe }]}
        title={tieuDe}
        right={goc && (
          <div className="flex items-center gap-3 text-[12.5px] text-ink2">
            <StatusChip s={goc.trangThai} />
            {goc.dangNhapGanNhat && <span>Đăng nhập gần nhất {fmtDateTime(goc.dangNhapGanNhat)}</span>}
          </div>
        )}
      />

      <CmsCard>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 max-w-[760px]">
          <Field label="Họ tên" error={loi.hoTen}>
            <Input value={hoTen} onChange={(e) => { setHoTen(e.target.value); if (daBamLuu) setLoi((x) => ({ ...x, hoTen: undefined })); }} placeholder="Trần Thu Hà" />
          </Field>
          <Field label="Email Chubb" error={loi.email} hint={!moi && goc ? "Đổi email thì mã đăng nhập gửi tới email mới" : undefined}>
            <Input value={email} onChange={(e) => { setEmail(e.target.value); if (daBamLuu) setLoi((x) => ({ ...x, email: undefined })); }} placeholder="thuha@chubblife.vn" inputMode="email" />
          </Field>
        </div>
        <div className="mt-6">
          <div className="text-[12.5px] text-ink2 mb-2">Vai trò</div>
          <div className="space-y-2">
            <Radio name="vai" checked={vai === "admin"} onChange={() => setVai("admin")} label="Quản trị — mọi module" />
            <Radio name="vai" checked={vai === "editor"} onChange={() => setVai("editor")} label="Biên tập — Bài viết · Mẫu Studio · Tài liệu · FAQ · Trắc nghiệm" disabled={laToi} />
          </div>
          {laToi && <div className="mt-2 text-[12px] text-mut">Bạn không thể tự hạ vai trò của chính mình.</div>}
        </div>

        <CmsFormActions>
          <Button onClick={luu}>Lưu</Button>
          {goc && <Button kind="secondary" onClick={() => flash(`Đã gửi lại mã đăng nhập tới ${goc.email}`)}>Gửi lại mã đăng nhập</Button>}
          {goc && !laToi && (
            <Button kind={goc.trangThai === "hoat-dong" ? "danger" : "secondary"} onClick={doiKhoa}>
              {goc.trangThai === "hoat-dong" ? "Khoá tài khoản" : "Mở khoá tài khoản"}
            </Button>
          )}
          <Button kind="secondary" href={R.H05}>Huỷ</Button>
        </CmsFormActions>
      </CmsCard>
    </>
  );
}
