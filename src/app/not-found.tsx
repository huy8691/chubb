/** S02 · 404 — trang không tìm thấy (dùng chung toàn site). */
import Link from "next/link";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { R } from "@/lib/routes";
import { Button, H1, Muted } from "@/components/ui";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <div className="wrap py-24 max-w-[640px] text-center mx-auto">
          <div className="eyebrow mb-3">Lỗi 404</div>
          <H1>Không tìm thấy trang</H1>
          <Muted className="mt-4 text-[16px]">Đường dẫn có thể đã đổi hoặc không tồn tại. Nếu bạn quét QR trên danh thiếp giấy, hãy kiểm tra lại mã 7 số.</Muted>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Button href={R.A01}>Về trang chủ</Button>
            <Button href={R.E01} kind="secondary">Tìm Tư vấn viên</Button>
            <Link href={R.S03} className="link-more self-center">Liên hệ & trợ giúp</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
