"use client";
/** H00 · Đăng nhập CMS — email Chubb + mã 6 số (mock: 123456). Vai lấy theo danh sách người dùng CMS; email lạ vào làm Quản trị để demo. */
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { ADMIN_DEMO, EDITOR_DEMO } from "@/lib/seed";
import { Button, Field, Input } from "@/components/ui";

const MA_DEMO = "123456";

function Form() {
  const router = useRouter();
  const sp = useSearchParams();
  const { data, actions } = useStore();
  const [email, setEmail] = useState(ADMIN_DEMO.email);
  const [ma, setMa] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [err, setErr] = useState("");

  const user = data.cmsUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  const guiMa = () => { if (user?.trangThai === "da-khoa") { setErr("Tài khoản đã bị khoá. Liên hệ Quản trị."); return; } setErr(""); setStep(2); };
  const vao = () => { if (ma !== MA_DEMO) { setErr("Mã không đúng."); return; } actions.loginCMS(email.trim()); router.push(sp.get("next") || R.H01); };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-6">
      <div className="w-full max-w-[420px]">
        <div className="text-white text-center mb-6"><div className="font-bold tracking-[0.3em] text-[18px]">CHUBB</div><div className="text-[12px] tracking-widest text-white/70 mt-1">CMS — KHU VỰC QUẢN TRỊ</div></div>
        <div className="bg-white rounded-sm p-6">
          <h1 className="font-bold text-[20px] text-den mb-4">Đăng nhập CMS</h1>
          {step === 1 ? (
            <>
              <Field label="Email Chubb" error={err}><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ten.ho@chubblife.vn" /></Field>
              <Button className="mt-4 w-full" onClick={guiMa}>Gửi mã đăng nhập</Button>
            </>
          ) : (
            <>
              <div className="text-[13.5px] text-ink2 mb-3">Mã đã gửi tới <b className="text-den">{email}</b>.</div>
              <Field label="Mã đăng nhập 6 số" error={err}><Input inputMode="numeric" maxLength={6} value={ma} onChange={(e) => setMa(e.target.value.replace(/\D/g, ""))} placeholder="••••••" className="tracking-[0.4em] text-[18px] h-11" /></Field>
              <Button className="mt-4 w-full" onClick={vao} disabled={ma.length !== 6}>Vào CMS</Button>
              <button type="button" className="mt-3 text-[13px] text-blue font-bold" onClick={() => { setStep(1); setMa(""); setErr(""); }}>Đổi email</button>
            </>
          )}
          <div className="mt-5 pt-4 border-t border-vien2 text-[12.5px] text-ink2 space-y-1">
            <div className="font-bold text-den">Bản demo — tài khoản mẫu (mã {MA_DEMO})</div>
            <div>Quản trị: <button type="button" className="text-blue font-bold" onClick={() => setEmail(ADMIN_DEMO.email)}>{ADMIN_DEMO.email}</button></div>
            <div>Biên tập: <button type="button" className="text-blue font-bold" onClick={() => setEmail(EDITOR_DEMO.email)}>{EDITOR_DEMO.email}</button></div>
          </div>
        </div>
        <div className="text-center mt-4"><Link href={R.A01} className="text-white/70 text-[13px] hover:text-white">← Về cổng công khai</Link></div>
      </div>
    </div>
  );
}

export default function Page() {
  return <Suspense fallback={null}><Form /></Suspense>;
}
