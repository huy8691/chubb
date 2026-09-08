import Link from "next/link";
import { R, TABS } from "@/lib/routes";

/** footer dùng chung mọi trang công khai và khu tài khoản */
export function Footer() {
  return (
    <footer className="bg-den text-white mt-auto">
      <div className="wrap py-12 grid grid-cols-1 md:grid-cols-4 gap-10 text-[14px]">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/chubb.svg" alt="Chubb" className="h-5 brightness-0 invert" />
          <p className="mt-4 text-white/70 leading-relaxed">Chubb Life Việt Nam — đồng hành cùng đội ngũ Tư vấn tài chính Toàn Tâm.</p>
        </div>
        <div>
          <div className="eyebrow text-white/60 mb-3">Cổng thông tin</div>
          <ul className="space-y-2">{TABS.map((t) => <li key={t.code}><Link href={t.href} className="hover:text-blue-pale">{t.label}</Link></li>)}</ul>
        </div>
        <div>
          <div className="eyebrow text-white/60 mb-3">Hệ sinh thái</div>
          <ul className="space-y-2">
            <li><a href="https://www.chubb.com/vn-vn/" className="hover:text-blue-pale">chubb.com/vn-vn</a></li>
            <li><a href="#" className="hover:text-blue-pale">Mua bảo hiểm online</a></li>
            <li><a href="#" className="hover:text-blue-pale">Fanpage Toàn Tâm</a></li>
          </ul>
        </div>
        <div>
          <div className="eyebrow text-white/60 mb-3">Liên hệ</div>
          <ul className="space-y-2 text-white/80">
            <li>Hotline: 1800 xxxx</li>
            <li>chubblife.vietnam@chubb.com</li>
            <li>Trụ sở: TP. Hồ Chí Minh</li>
            <li><Link href={R.S03} className="text-white font-bold hover:text-blue-pale">Liên hệ & trợ giúp</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10"><div className="wrap py-4 text-[12.5px] text-white/50"><span>© 2026 Chubb Life Việt Nam. Bảo lưu mọi quyền.</span></div></div>
    </footer>
  );
}
