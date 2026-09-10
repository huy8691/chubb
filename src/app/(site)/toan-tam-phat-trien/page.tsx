"use client";
/** D01 · Toàn Tâm Phát Triển (Tab 3 · Công cụ) — trang tổng: hero · một khối cho mỗi công cụ · Mới cập nhật · CTA đăng nhập. */
import Link from "next/link";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { fmtDate } from "@/lib/seed";
import { Button, Card, Chip, Eyebrow, H2, H3, Hero, Muted } from "@/components/ui";
import { MauStudioCard } from "@/components/cong-cu/MauStudioCard";

export default function Page() {
  const { data, session } = useStore();
  const daDangNhap = session.role === "tvv";
  const mauMoi = data.studioTemplates.filter((m) => m.trangThai === "da-xuat-ban").sort((a, b) => b.capNhat.localeCompare(a.capNhat)).slice(0, 4);
  const taiLieuMoi = data.documents.filter((d) => d.phan === "cong-khai" && d.trangThai === "da-xuat-ban").sort((a, b) => b.capNhat.localeCompare(a.capNhat)).slice(0, 2);

  const congCu = [
    { ten: "Quản lý tài chính cá nhân", moTa: "Ước tính khoản tiết kiệm và thời gian để đạt mục tiêu tài chính.", href: R.D03, nut: "Mở công cụ" },
    { ten: "Studio", moTa: "Chọn mẫu Chubb đã duyệt, tải ảnh của bạn, xuất ảnh đúng nhận diện.", href: R.D08, nut: "Xem mẫu Studio", chip: "Tạo ảnh cần đăng nhập" },
    { ten: "Trắc Nghiệm Tính Cách", moTa: "Khám phá mức độ phù hợp với nghề tư vấn tài chính.", href: R.D04, nut: "Mở công cụ" },
  ];

  return (
    <>
      <Hero eyebrow="Toàn Tâm Phát Triển" title="Bộ công cụ cho người Tư vấn hiện đại" desc="Năm công cụ giúp Tư vấn viên Chubb Life làm việc chuyên nghiệp hơn mỗi ngày — từ hoạch định tài chính cá nhân, tạo ảnh cá nhân hoá đến danh thiếp điện tử và tài liệu bán hàng." image="/img/d01-kv.jpg" />

      <section className="wrap py-14">
        <H2>Bộ công cụ</H2>
        <Muted className="mt-2">Năm công cụ. Công cụ dùng dữ liệu cá nhân của bạn cần đăng nhập.</Muted>

        <Eyebrow className="mt-10 mb-4">Công cụ</Eyebrow>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {congCu.map((c) => (
            <Card key={c.ten} className="p-6 flex flex-col">
              <H3>{c.ten}</H3>
              <Muted className="mt-2 flex-1">{c.moTa}</Muted>
              {c.chip && !daDangNhap && <div className="mt-4"><Chip tone="amber">{c.chip}</Chip></div>}
              <div className="mt-5"><Button href={c.href}>{c.nut}</Button></div>
            </Card>
          ))}
        </div>

        <Eyebrow className="mt-12 mb-4">Danh thiếp & tài liệu</Eyebrow>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 flex flex-col">
            <H3>Sẵn Sàng Kết Nối (Danh thiếp)</H3>
            <Muted className="mt-2 flex-1">Danh thiếp điện tử với mã QR riêng.</Muted>
            {!daDangNhap && <div className="mt-4"><Chip tone="amber">Cần đăng nhập</Chip></div>}
            <div className="mt-5"><Button href={daDangNhap ? R.E04 : R.E01}>Mở công cụ</Button></div>
          </Card>
          <Card className="p-6 flex flex-col">
            <H3>Tài liệu</H3>
            <Muted className="mt-2 flex-1">Brochure, biểu mẫu, slide trình bày, tài liệu đào tạo.</Muted>
            {!daDangNhap && <div className="mt-4"><Chip tone="amber">Cần đăng nhập để mở tệp</Chip></div>}
            <div className="mt-5"><Button href={R.G04} kind="secondary">Xem tài liệu</Button></div>
          </Card>
          <Card className="p-6 flex flex-col">
            <H3>Ảnh thực tế từ Tư vấn viên</H3>
            <Muted className="mt-2 flex-1">Ảnh đồng nghiệp đã tạo trong Studio và công khai — xem để lấy cảm hứng.</Muted>
            <div className="mt-5"><Button href={R.D07} kind="secondary">Xem ảnh thực tế</Button></div>
          </Card>
        </div>
      </section>

      <section className="bg-xam">
        <div className="wrap py-14">
          <H2>Mẫu Studio mới</H2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            {mauMoi.map((m) => <MauStudioCard key={m.id} m={m} />)}
          </div>

          <H2 className="mt-12">Tài liệu mới</H2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {taiLieuMoi.map((d) => (
              <Link key={d.id} href={R.G04} className="flex items-center gap-4 bg-white border border-vien rounded-sm p-4 hover:border-blue">
                <span className="shrink-0 size-12 rounded-sm bg-blue-soft text-blue font-bold text-[12px] flex items-center justify-center">{d.dinhDang}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[14px] text-den truncate">{d.ten}</div>
                  <div className="text-[12px] text-mut mt-0.5">{d.phienBan} · Cập nhật {fmtDate(d.capNhat)}</div>
                </div>
                <span className="text-blue font-bold text-[13px] shrink-0">Xem</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {!daDangNhap && (
        <section className="wrap py-14">
          <Card className="p-8 flex flex-wrap items-center justify-between gap-6">
            <div>
              <H3>Đăng nhập bằng email để mở Studio và Tài liệu nghiệp vụ</H3>
              <Muted className="mt-1">Đăng nhập bằng email + mã 6 số gửi qua email. Không cần mật khẩu.</Muted>
            </div>
            <Button href={R.G01}>Đăng nhập TVV</Button>
          </Card>
        </section>
      )}
    </>
  );
}
