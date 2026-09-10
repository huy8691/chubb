"use client";
/** G01 · Đăng nhập Tư vấn viên — HAI phương thức (đề xuất, thêm song song 10/09):
 *  1) Email + mật khẩu (mặc định) · 2) Gửi mã 6 số qua email (cách cũ). Kèm luồng Quên/đặt mật khẩu.
 *  Mock: mật khẩu demo = "chubb@2026", mã luôn 123456. Đích sau đăng nhập: G02a. Chỉ áp cho TVV (CMS H00 giữ nguyên). */
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { TVV_DEMO } from "@/lib/seed";
import { Button, Card, Field, H1, Input, Muted } from "@/components/ui";

const MA_DEMO = "123456";
const MK_DEMO = "chubb@2026";
type Mode = "mat-khau" | "ma" | "quen";

function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const { data, actions } = useStore();
  const dest = () => sp.get("next") || R.G02a;

  const [mode, setMode] = useState<Mode>("mat-khau");
  const [email, setEmail] = useState(TVV_DEMO.email);
  const [mk, setMk] = useState("");
  const [hienMk, setHienMk] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [ma, setMa] = useState("");
  const [err, setErr] = useState("");
  const [tries, setTries] = useState(5);
  const [daGuiLink, setDaGuiLink] = useState(false);

  const advisor = data.advisors.find((a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.trangThaiTaiKhoan === "hoat-dong");
  const reset = (m: Mode) => { setMode(m); setErr(""); setStep(1); setMa(""); setMk(""); setTries(5); setDaGuiLink(false); };

  // 1 · Email + mật khẩu
  const dangNhapMk = () => {
    if (!advisor) { setErr("Email này chưa đăng ký với Chubb Life. Liên hệ quản lý nhóm của bạn."); return; }
    if (mk !== MK_DEMO) {
      const t = tries - 1; setTries(t);
      setErr(t > 0 ? `Email hoặc mật khẩu không đúng — còn ${t} lần thử. Bấm "Quên mật khẩu?" để đặt lại.` : "Sai 5 lần liên tiếp. Tài khoản tạm khoá — hãy đặt lại mật khẩu hoặc đăng nhập bằng mã qua email.");
      return;
    }
    actions.loginTVV(advisor.ma); router.push(dest());
  };

  // 2 · Mã 6 số qua email
  const guiMa = () => { if (!advisor) { setErr("Email này chưa đăng ký với Chubb Life. Liên hệ quản lý nhóm của bạn."); return; } setErr(""); setStep(2); };
  const xacNhanMa = () => {
    if (ma !== MA_DEMO) { const t = tries - 1; setTries(t); setErr(t > 0 ? `Mã không đúng — còn ${t} lần thử.` : "Đã sai nhiều lần. Vui lòng bấm Gửi lại mã."); return; }
    actions.loginTVV(advisor!.ma); router.push(dest());
  };

  return (
    <div className="wrap py-16 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">
      <div className="max-w-[560px]">
        <div className="eyebrow mb-3">Dành cho Tư vấn viên</div>
        <H1>Đăng nhập Trang cá nhân</H1>
        <Muted className="mt-3 text-[16px]">Dùng email đã đăng ký với Chubb Life. Đăng nhập bằng <b>mật khẩu</b>, hoặc nhận <b>mã 6 số</b> qua email — không dùng tin nhắn SMS.</Muted>

        {/* 1 · Email + mật khẩu (mặc định) */}
        {mode === "mat-khau" && (
          <Card className="mt-8 p-6">
            <Field label="Email đã đăng ký"><Input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErr(""); }} placeholder="ten.ho@chubblife.vn" /></Field>
            <Field label="Mật khẩu" error={err} className="mt-4">
              <div className="relative">
                <Input type={hienMk ? "text" : "password"} value={mk} onChange={(e) => { setMk(e.target.value); setErr(""); }} placeholder="Mật khẩu của bạn" className="pr-16" />
                <button type="button" onClick={() => setHienMk((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-blue">{hienMk ? "Ẩn" : "Hiện"}</button>
              </div>
            </Field>
            <div className="mt-2 text-right"><button type="button" className="text-[13px] font-bold text-blue" onClick={() => reset("quen")}>Quên mật khẩu?</button></div>
            <div className="mt-4"><Button onClick={dangNhapMk} disabled={!mk}>Đăng nhập</Button></div>
            <div className="mt-5 pt-5 border-t border-vien text-[13.5px]">
              <button type="button" className="font-bold text-blue" onClick={() => reset("ma")}>Gửi mã đăng nhập qua email</button>
              <span className="text-mut"> — nếu bạn chưa đặt mật khẩu.</span>
            </div>
          </Card>
        )}

        {/* 2 · Mã 6 số qua email (cách cũ) */}
        {mode === "ma" && (
          <Card className="mt-8 p-6">
            {step === 1 ? (
              <>
                <Field label="Email đã đăng ký" error={err}><Input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErr(""); }} placeholder="ten.ho@chubblife.vn" /></Field>
                <div className="mt-5 flex flex-wrap gap-3 items-center"><Button onClick={guiMa}>Gửi mã đăng nhập</Button><span className="text-[13px] text-mut">Chưa có email đăng ký? Liên hệ quản lý nhóm của bạn.</span></div>
              </>
            ) : (
              <>
                <div className="text-[14px] text-ink2 mb-4">Mã đã gửi tới <b className="text-den">{email}</b>. <button type="button" className="text-blue font-bold" onClick={() => { setStep(1); setMa(""); setErr(""); setTries(5); }}>Đổi email</button></div>
                <Field label="Mã đăng nhập 6 số" error={err} hint="Mã có hiệu lực 10 phút."><Input inputMode="numeric" maxLength={6} value={ma} onChange={(e) => setMa(e.target.value.replace(/\D/g, ""))} placeholder="••••••" className="tracking-[0.4em] text-[18px] h-11" /></Field>
                <div className="mt-5 flex flex-wrap gap-3 items-center"><Button onClick={xacNhanMa} disabled={ma.length !== 6 || tries === 0}>Xác nhận đăng nhập</Button><Button kind="secondary" onClick={() => { setTries(5); setErr(""); setMa(""); }}>Gửi lại mã</Button></div>
              </>
            )}
            <div className="mt-5 pt-5 border-t border-vien text-[13.5px]"><button type="button" className="font-bold text-blue" onClick={() => reset("mat-khau")}>← Đăng nhập bằng mật khẩu</button></div>
          </Card>
        )}

        {/* Quên / đặt mật khẩu lần đầu */}
        {mode === "quen" && (
          <Card className="mt-8 p-6">
            {daGuiLink ? (
              <>
                <div className="text-[15px] font-bold text-den">Đã gửi liên kết đặt mật khẩu</div>
                <Muted className="mt-2">Kiểm tra hộp thư <b className="text-den">{email}</b> và bấm liên kết để đặt mật khẩu mới. Liên kết có hiệu lực 30 phút.</Muted>
                <div className="mt-5"><Button kind="secondary" onClick={() => reset("mat-khau")}>Quay lại đăng nhập</Button></div>
              </>
            ) : (
              <>
                <div className="text-[15px] font-bold text-den">Quên hoặc chưa có mật khẩu?</div>
                <Muted className="mt-1 text-[14px]">Nhập email đã đăng ký — chúng tôi gửi liên kết đặt lại mật khẩu tới email của bạn. Lần đầu đăng nhập cũng dùng cách này.</Muted>
                <Field label="Email đã đăng ký" className="mt-4"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ten.ho@chubblife.vn" /></Field>
                <div className="mt-5 flex flex-wrap gap-3 items-center"><Button onClick={() => setDaGuiLink(true)} disabled={!email.trim()}>Gửi liên kết đặt mật khẩu</Button><button type="button" className="text-[13px] font-bold text-blue" onClick={() => reset("mat-khau")}>Quay lại</button></div>
              </>
            )}
          </Card>
        )}

        <p className="mt-4 text-[13px] text-mut">Không vào được? <Link href={R.S03} className="text-blue font-bold">Xem Liên hệ & trợ giúp</Link></p>
      </div>

      <aside className="bg-blue-soft border border-blue/20 rounded-sm p-5 text-[13.5px] text-den">
        <div className="font-bold mb-2">Bản demo — dữ liệu mẫu</div>
        <p>Email mẫu: <b>{TVV_DEMO.email}</b> ({TVV_DEMO.hoTen}).</p>
        <p className="mt-1">Mật khẩu demo: <b>{MK_DEMO}</b>.</p>
        <p className="mt-1">Mã 6 số (thay email thật): <b className="tracking-widest">{MA_DEMO}</b>.</p>
        <p className="mt-3 text-ink2">Vào CMS quản trị tại <Link href={R.H00} className="text-blue font-bold">/cms/dang-nhap</Link>.</p>
      </aside>
    </div>
  );
}

export default function Page() {
  return <Suspense fallback={null}><LoginForm /></Suspense>;
}
