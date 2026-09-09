"use client";
/**
 * H03c · Popup thêm / sửa TVV trong một hạng mục của bảng vinh danh (lớp phủ trên H03b).
 * Chọn từ danh sách TVV hoặc Nhập tay; thứ tự · ba số. 09/09: không còn bước TVV đồng ý — người trong bảng hiện khi bảng công bố.
 */
import { useMemo, useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { thangLabel } from "@/lib/seed";
import type { HangMuc, HonorMonth, NguoiDat } from "@/lib/types";
import { Button, Chip, Field, Input, Modal, Radio, SearchBox, Select, cx } from "@/components/ui";

interface Props {
  open: boolean;
  onClose: () => void;
  month: HonorMonth;
  hangMuc: HangMuc;
  /** đang sửa người nào (undefined = thêm mới) */
  edit?: NguoiDat;
  onDone: (msg: string) => void;
}

export function ThemTvvModal({ open, onClose, month, hangMuc, edit, onDone }: Props) {
  const { data, actions } = useStore();
  const editAdvisor = edit ? data.advisors.find((a) => a.ma === edit.advisorMa) : undefined;
  const [mode, setMode] = useState<"chon" | "tay">(edit && !editAdvisor ? "tay" : "chon");
  const [q, setQ] = useState("");
  const [chon, setChon] = useState<string>(editAdvisor?.ma ?? "");
  const [hoTen, setHoTen] = useState(edit?.hoTen ?? "");
  const [maTay, setMaTay] = useState(edit && !editAdvisor && !edit.advisorMa.startsWith("tay-") ? edit.advisorMa : "");
  const [vanPhong, setVanPhong] = useState(edit?.vanPhong ?? "");
  const [anh, setAnh] = useState("");
  const list = month.hangMuc.find((h) => h.hangMucId === hangMuc.id)?.nguoiDat ?? [];
  const [thuHang, setThuHang] = useState(edit?.thuHang ?? list.length + 1);
  const [doanhSo, setDoanhSo] = useState<string>(edit?.doanhSo !== undefined ? String(edit.doanhSo) : "");
  const [hopDong, setHopDong] = useState<string>(edit?.hopDong !== undefined ? String(edit.hopDong) : "");
  const [khachHang, setKhachHang] = useState<string>(edit?.khachHang !== undefined ? String(edit.khachHang) : "");
  const soLieu = () => ({ doanhSo: doanhSo ? Number(doanhSo.replace(/\D/g, "")) : undefined, hopDong: hopDong ? Number(hopDong) : undefined, khachHang: khachHang ? Number(khachHang) : undefined });
  const [err, setErr] = useState("");

  const vanPhongs = useMemo(() => Array.from(new Set(data.advisors.map((a) => a.vanPhong))), [data.advisors]);
  const ketQua = useMemo(() => {
    const k = q.trim().toLowerCase();
    return data.advisors.filter((a) => a.trangThaiTaiKhoan === "hoat-dong" && (!k || a.hoTen.toLowerCase().includes(k) || a.ma.includes(k))).slice(0, 6);
  }, [q, data.advisors]);

  const reset = () => { setQ(""); setChon(""); setHoTen(""); setMaTay(""); setVanPhong(""); setAnh(""); setThuHang(list.length + 2); setErr(""); };

  /** trả về thông báo lỗi hoặc "" nếu lưu được */
  const luu = (): string => {
    let nd: NguoiDat;
    if (mode === "chon") {
      if (!chon) return "Chọn một Tư vấn viên trong danh sách.";
      nd = { advisorMa: chon, thuHang, nguon: edit?.nguon ?? "tay", ...soLieu() };
    } else {
      if (!hoTen.trim()) return "Họ tên là trường bắt buộc.";
      const a = maTay.trim() ? data.advisors.find((x) => x.ma === maTay.trim()) : undefined;
      nd = a
        ? { advisorMa: a.ma, thuHang, nguon: "tay", ...soLieu() }
        : { advisorMa: edit?.advisorMa ?? (maTay.trim() || `tay-${Date.now()}`), hoTen: hoTen.trim(), vanPhong: vanPhong || undefined, thuHang, ...soLieu(), nguon: "tay" };
    }
    const trung = list.some((x) => x.advisorMa === nd.advisorMa && x.advisorMa !== edit?.advisorMa);
    if (trung) return `${nd.advisorMa} đã có trong ${hangMuc.ten} tháng này — không thêm trùng`;

    actions.update("honorMonths", (ms) => ms.map((m) => {
      if (m.id !== month.id) return m;
      const hms = m.hangMuc.some((h) => h.hangMucId === hangMuc.id) ? m.hangMuc : [...m.hangMuc, { hangMucId: hangMuc.id, nguoiDat: [] }];
      return {
        ...m, capNhat: new Date().toISOString(),
        hangMuc: hms.map((h) => {
          if (h.hangMucId !== hangMuc.id) return h;
          const rest = h.nguoiDat.filter((x) => x.advisorMa !== edit?.advisorMa).sort((a, b) => a.thuHang - b.thuHang);
          rest.splice(Math.max(0, Math.min(nd.thuHang, rest.length + 1) - 1), 0, nd);
          return { ...h, nguoiDat: rest.map((x, i) => ({ ...x, thuHang: i + 1 })) };
        }),
      };
    }));
    return "";
  };

  const xoa = () => {
    if (!edit) return;
    actions.update("honorMonths", (ms) => ms.map((m) => m.id !== month.id ? m : { ...m, capNhat: new Date().toISOString(), hangMuc: m.hangMuc.map((h) => h.hangMucId !== hangMuc.id ? h : { ...h, nguoiDat: h.nguoiDat.filter((x) => x.advisorMa !== edit.advisorMa).map((x, i) => ({ ...x, thuHang: i + 1 })) }) }));
    onDone("Đã xoá khỏi bảng"); onClose();
  };

  const submit = (tiep: boolean) => {
    const e = luu();
    if (e) { setErr(e); return; }
    onDone(edit ? "Đã lưu thay đổi" : `Đã thêm vào ${hangMuc.ten}`);
    if (tiep) reset(); else onClose();
  };

  const soVT = Math.max(list.length + (edit ? 0 : 1), 1);
  const title = edit ? `Sửa người đạt — ${hangMuc.ten} — ${thangLabel(month)}` : `Thêm TVV vào ${hangMuc.ten} — ${thangLabel(month)}`;

  return (
    <Modal open={open} onClose={onClose} title={title} width={760} footer={
      <>
        <Button onClick={() => submit(false)}>{edit ? "Lưu thay đổi" : "Thêm vào hạng mục"}</Button>
        {!edit && <Button kind="secondary" onClick={() => submit(true)}>Thêm & tiếp người khác</Button>}
        <Button kind="ghost" onClick={onClose}>Huỷ</Button>
        {edit && <Button kind="danger" size="sm" className="ml-auto" onClick={xoa}>Xoá khỏi bảng</Button>}
      </>
    }>
      <div className="text-[12.5px] text-ink2 mb-2">Cách thêm</div>
      <div className="grid grid-cols-2 gap-2 mb-5">
        {([["chon", "Chọn từ danh sách Tư vấn viên"], ["tay", "Nhập tay (admin tự điền)"]] as const).map(([v, l]) => (
          <button key={v} type="button" onClick={() => { setMode(v); setErr(""); }} className={cx("h-9 rounded-sm text-[13px] font-bold border", mode === v ? "bg-blue-soft text-blue border-blue" : "bg-white text-ink2 border-vien hover:border-blue")}>{l}</button>
        ))}
      </div>

      {mode === "chon" ? (
        <>
          <SearchBox value={q} onChange={setQ} placeholder="Tìm theo mã hoặc họ tên Tư vấn viên…" />
          <ul className="mt-3 border border-vien rounded-sm divide-y divide-vien2 max-h-[240px] overflow-auto">
            {ketQua.length === 0 && <li className="px-4 py-4 text-[13px] text-mut">Không tìm thấy Tư vấn viên nào khớp.</li>}
            {ketQua.map((a) => (
              <li key={a.ma} className={cx("px-4 py-2.5 flex items-center justify-between gap-3", chon === a.ma && "bg-blue-soft/50")}>
                <Radio name="tvv" checked={chon === a.ma} onChange={() => { setChon(a.ma); setErr(""); }} label={<span className="font-bold">{a.hoTen}</span>} desc={`${a.ma} · ${a.vanPhong} · ${a.chucDanh}`} />
                {chon === a.ma && <Chip tone="blue">Đã chọn</Chip>}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[12px] text-mut">Tên, ảnh, văn phòng lấy từ hồ sơ TVV. Không tìm thấy? Chuyển sang Nhập tay.</p>
        </>
      ) : (
        <>
          <div className="text-[11.5px] text-mut uppercase tracking-wide mb-2">Nhập tay — khi TVV chưa có trong danh sách hoặc admin muốn tự điền</div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_160px_200px] gap-3">
            <Field label="Họ tên *"><Input value={hoTen} onChange={(e) => setHoTen(e.target.value)} placeholder="Nguyễn Văn A" /></Field>
            <Field label="Mã TVV (nếu có)"><Input value={maTay} onChange={(e) => setMaTay(e.target.value.replace(/\D/g, "").slice(0, 7))} placeholder="0175xxx" /></Field>
            <Field label="Văn phòng"><Select value={vanPhong} onChange={(e) => setVanPhong(e.target.value)}><option value="">Chọn văn phòng</option>{vanPhongs.map((v) => <option key={v}>{v}</option>)}</Select></Field>
          </div>
          <Field label="Ảnh chân dung 3:4" className="mt-3">
            <label className="inline-flex items-center h-11 px-4 rounded-sm border border-vien bg-white text-[13px] cursor-pointer hover:border-blue">
              {anh || "Chọn ảnh…"}<input type="file" accept="image/*" className="hidden" onChange={(e) => setAnh(e.target.files?.[0]?.name ?? "")} />
            </label>
          </Field>
        </>
      )}

      <div className="mt-6 text-[11.5px] font-bold text-ink2 uppercase tracking-wide">Thông tin vinh danh</div>
      <div className="mt-2 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-3">
        <Field label="Thứ tự trong hạng mục" hint="1 = người dẫn đầu">
          <Select value={thuHang} onChange={(e) => setThuHang(Number(e.target.value))}>{Array.from({ length: soVT }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}</Select>
        </Field>
      </div>
      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        <Field label="Doanh số · phí năm đầu (₫)"><Input inputMode="numeric" value={doanhSo ? Number(doanhSo.replace(/\D/g, "")).toLocaleString("vi-VN") : ""} onChange={(e) => setDoanhSo(e.target.value.replace(/\D/g, ""))} placeholder="2.450.000.000" /></Field>
        <Field label="Hợp đồng mới"><Input inputMode="numeric" value={hopDong} onChange={(e) => setHopDong(e.target.value.replace(/\D/g, ""))} placeholder="18" /></Field>
        <Field label="Khách hàng mới"><Input inputMode="numeric" value={khachHang} onChange={(e) => setKhachHang(e.target.value.replace(/\D/g, ""))} placeholder="15" /></Field>
      </div>
      <p className="mt-2 text-[12px] text-mut">Ba số này hiện công khai trên trang Thành tích của Tư vấn viên; bảng đột xuất không có số liệu thì để trống.</p>
      {err && <div className="mt-4 text-[12.5px] font-bold text-red-fg bg-red-bg rounded-sm px-3 py-2">✗ {err}</div>}
    </Modal>
  );
}
