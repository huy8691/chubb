"use client";
/**
 * Store demo trong bộ nhớ (React context + useReducer-ish setState).
 * Mọi thay đổi từ CMS/TVV ghi vào state này, sống trong phiên trình duyệt
 * (giữ qua reload bằng sessionStorage). Không có backend.
 *
 * Cách dùng trong component client:
 *   const { data, session, actions } = useStore();
 *   actions.update("articles", a => a.map(x => x.id === id ? {...x, trangThai: "da-xuat-ban"} : x));
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as seed from "./seed";
import type { Notification, Role, Session } from "./types";

export interface DemoData {
  advisors: typeof seed.advisors;
  offices: typeof seed.offices;
  hangMuc: typeof seed.hangMuc;
  honorMonths: typeof seed.honorMonths;
  chuyenDe: typeof seed.chuyenDe;
  articles: typeof seed.articles;
  studioTemplates: typeof seed.studioTemplates;
  studioImages: typeof seed.studioImages;
  docTypes: typeof seed.docTypes;
  documents: typeof seed.documents;
  faqs: typeof seed.faqs;
  candidates: typeof seed.candidates;
  contactMessages: typeof seed.contactMessages;
  cmsUsers: typeof seed.cmsUsers;
  ranking: typeof seed.ranking;
  flaggedRows: typeof seed.flaggedRows;
  quizQuestions: typeof seed.quizQuestions;
  quizResultTypes: typeof seed.quizResultTypes;
  financeParams: typeof seed.financeParams;
  notifications: typeof seed.notifications;
  savedItems: typeof seed.savedItems;
  loiChuc: typeof seed.loiChuc;
}

const initialData = (): DemoData => ({
  advisors: seed.advisors,
  offices: seed.offices,
  hangMuc: seed.hangMuc,
  honorMonths: seed.honorMonths,
  chuyenDe: seed.chuyenDe,
  articles: seed.articles,
  studioTemplates: seed.studioTemplates,
  studioImages: seed.studioImages,
  docTypes: seed.docTypes,
  documents: seed.documents,
  faqs: seed.faqs,
  candidates: seed.candidates,
  contactMessages: seed.contactMessages,
  cmsUsers: seed.cmsUsers,
  ranking: seed.ranking,
  flaggedRows: seed.flaggedRows,
  quizQuestions: seed.quizQuestions,
  quizResultTypes: seed.quizResultTypes,
  financeParams: seed.financeParams,
  notifications: seed.notifications,
  savedItems: seed.savedItems,
  loiChuc: seed.loiChuc,
});

type Updater<K extends keyof DemoData> = (cur: DemoData[K]) => DemoData[K];

export interface StoreActions {
  /** Cập nhật một tập dữ liệu bằng hàm thuần */
  update: <K extends keyof DemoData>(key: K, fn: Updater<K>) => void;
  /** Đăng nhập mock — mã luôn là 123456 (kiểm ở màn đăng nhập) */
  loginTVV: (advisorMa: string) => void;
  loginCMS: (email: string) => boolean;
  logout: () => void;
  /** Thêm thông báo cho một TVV (dùng khi admin duyệt/từ chối, loại lượt…) */
  notify: (advisorMa: string, noiDung: string, href?: string) => void;
  /** Đưa toàn bộ dữ liệu về seed */
  reset: () => void;
}

interface StoreValue {
  data: DemoData;
  session: Session;
  ready: boolean;
  actions: StoreActions;
}

const Ctx = createContext<StoreValue | null>(null);
/** Đổi số này mỗi lần sửa seed để phiên cũ trong sessionStorage không che dữ liệu mới */
const SEED_VERSION = "2026-09-10a";
const KEY_DATA = `ecard2-demo-data-${SEED_VERSION}`;
const KEY_SESSION = "ecard2-demo-session";
const GUEST: Session = { role: "guest" };

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DemoData>(initialData);
  const [session, setSession] = useState<Session>(GUEST);
  const [ready, setReady] = useState(false);

  // Khôi phục từ sessionStorage/localStorage sau khi mount
  useEffect(() => {
    // Khôi phục một lần sau mount — setState trong effect là chủ ý (đọc storage phía client, tránh lệch hydration)
    try {
      const d = sessionStorage.getItem(KEY_DATA);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (d) setData({ ...initialData(), ...JSON.parse(d) });
      const s = localStorage.getItem(KEY_SESSION);
      if (s) setSession(JSON.parse(s));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { sessionStorage.setItem(KEY_DATA, JSON.stringify(data)); } catch {}
  }, [data, ready]);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY_SESSION, JSON.stringify(session)); } catch {}
    // cookie cho middleware (chỉ để chuyển hướng thô, không phải bảo mật)
    document.cookie = `ecard2-role=${session.role}; path=/; max-age=86400`;
  }, [session, ready]);

  const update = useCallback(<K extends keyof DemoData>(key: K, fn: Updater<K>) => {
    setData((cur) => ({ ...cur, [key]: fn(cur[key]) }));
  }, []);

  const actions = useMemo<StoreActions>(() => ({
    update,
    loginTVV: (advisorMa) => setSession({ role: "tvv", advisorMa }),
    loginCMS: (email) => {
      const u = seed.cmsUsers.find((x) => x.email.toLowerCase() === email.toLowerCase());
      const role: Role = u ? u.vai : "admin"; // email lạ vẫn vào được làm Quản trị để demo
      setSession({ role, email });
      return true;
    },
    logout: () => setSession(GUEST),
    notify: (advisorMa, noiDung, href) =>
      setData((cur) => {
        const n: Notification = { id: `n${Date.now()}`, advisorMa, noiDung, ngay: new Date().toISOString(), daDoc: false, href };
        return { ...cur, notifications: [n, ...cur.notifications] };
      }),
    reset: () => { setData(initialData()); try { sessionStorage.removeItem(KEY_DATA); } catch {} },
  }), [update]);

  const value = useMemo(() => ({ data, session, ready, actions }), [data, session, ready, actions]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore phải nằm trong StoreProvider");
  return v;
}

/** TVV đang đăng nhập (undefined nếu chưa) */
export function useCurrentAdvisor() {
  const { data, session } = useStore();
  return session.role === "tvv" ? data.advisors.find((a) => a.ma === session.advisorMa) : undefined;
}

/** Người dùng CMS đang đăng nhập */
export function useCurrentCmsUser() {
  const { data, session } = useStore();
  if (session.role !== "admin" && session.role !== "editor") return undefined;
  return data.cmsUsers.find((u) => u.email === session.email) ?? { id: "guest", hoTen: session.email ?? "", email: session.email ?? "", vai: session.role, trangThai: "hoat-dong" as const };
}
