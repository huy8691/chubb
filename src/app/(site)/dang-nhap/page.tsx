"use client";
/** G01 · Đăng nhập Tư vấn viên — email + mã 6 số (mock: mã luôn 123456, hiện ngay trên màn thay cho email). Đích sau đăng nhập: G02a. */
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { TVV_DEMO } from "@/lib/seed";
import { Button, Card, Field, H1, Input, Muted } from "@/components/ui";

const MA_DEMO = "123456";

function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const { data, actions } = useStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState(TVV_DEMO.email);
  const [ma, setMa] = useState("");
  const [err, setErr] = useState("");
  const [tries, setTries] = useState(3);

  const advisor = data.advisors.find((a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.trangThaiTaiKhoan === "hoat-dong");

  const guiMa = () => {
    if (!advisor) { setErr("Email này chưa đăng ký với Chubb Life. Liên hệ quản lý nhóm của bạn."); return; }
    setErr(""); setStep(2);
  };
  const xacNhan = () => {
    if (ma !== MA_DEMO) { const t = tries - 1; setTries(t); setErr(t > 0 ? `Mã không đúng — còn ${t} lần thử.` : "Đã sai 3 lần. Vui lòng bấm Gửi lại mã."); return; }
    actions.loginTVV(advisor!.ma);
    router.push(sp.get("next") || R.G02a);
  };

  return (
    <div className="wrap py-16 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">
      <div className="max-w-[560px]">
        <div className="eyebrow mb-3">Dành cho Tư vấn viên</div>
        <H1>Đăng nhập Trang cá nhân</H1>
        <Muted className="mt-3 text-[16px]">Dùng email đã đăng ký với Chubb Life. Hệ thống gửi mã 6 số về email, không cần mật khẩu, không dùng tin nhắn SMS.</Muted>
        <Card className="mt-8 p-6">
          {step === 1 ? (
            <>
              <Field label="Email đã đăng ký" error={err}><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ten.ho@chubblife.vn" /></Field>
              <div className="mt-5 flex flex-wrap gap-3 items-center">
                <Button onClick={guiMa}>Gửi mã đăng nhập</Button>
                <span className="text-[13px] text-mut">Chưa có email đăng ký? Liên hệ quản lý nhóm của bạn.</span>
              </div>
            </>
          ) : (
            <>
              <div className="text-[14px] text-ink2 mb-4">Mã đã gửi tới <b className="text-den">{email}</b>. <button type="button" className="text-blue font-bold" onClick={() => { setStep(1); setMa(""); setErr(""); setTries(3); }}>Đổi email</button></div>
              <Field label="Mã đăng nhập 6 số" error={err} hint="Mã có hiệu lực 10 phút."><Input inputMode="numeric" maxLength={6} value={ma} onChange={(e) => setMa(e.target.value.replace(/\D/g, ""))} placeholder="••••••" className="tracking-[0.4em] text-[18px] h-11" /></Field>
              <div className="mt-5 flex flex-wrap gap-3 items-center">
                <Button onClick={xacNhan} disabled={ma.length !== 6 || tries === 0}>Xác nhận đăng nhập</Button>
                <Button kind="secondary" onClick={() => { setTries(3); setErr(""); setMa(""); }}>Gửi lại mã</Button>
              </div>
            </>
          )}
        </Card>
        <p className="mt-4 text-[13px] text-mut">Không vào được? <Link href={R.S03} className="text-blue font-bold">Xem Liên hệ & trợ giúp</Link></p>
      </div>
      <aside className="bg-blue-soft border border-blue/20 rounded-sm p-5 text-[13.5px] text-den">
        <div className="font-bold mb-2">Bản demo — dữ liệu mẫu</div>
        <p>Email mẫu: <b>{TVV_DEMO.email}</b> ({TVV_DEMO.hoTen}).</p>
        <p className="mt-1">Mã đăng nhập thay cho email thật: <b className="tracking-widest">{MA_DEMO}</b>.</p>
        <p className="mt-3 text-ink2">Vào CMS quản trị tại <Link href={R.H00} className="text-blue font-bold">/cms/dang-nhap</Link>.</p>
      </aside>
    </div>
  );
}

export default function Page() {
  return <Suspense fallback={null}><LoginForm /></Suspense>;
}
