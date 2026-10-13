/* 공문 도우미 — 장바구니 품의: 옆 패널 시작점(현재 창의 탭 · 저장소가 바뀌면 화면을 다시 그린다) */
import { m as u } from "./assets/popup.js";
import { o as h, n as w, l as f } from "./assets/messages.js";
async function p(d) {
  const o = (await chrome.windows.getCurrent()).id;
  if (o === void 0) return;
  const t = u(d, { send: (e) => chrome.runtime.sendMessage({ ...e, windowId: o }) }), s = (e) => {
    e.windowId === o && t();
  }, i = (e, n, m) => {
    m.windowId === o && m.active && (n.status !== void 0 || n.url !== void 0) && t();
  }, a = (e, n) => {
    n === "session" && e.draft !== void 0 && t("storage");
  }, c = (e) => {
    const n = h({ kind: f("panel_context_changed"), windowId: w() }).safeParse(e);
    n.success && n.data.windowId === o && t();
  };
  chrome.tabs.onActivated.addListener(s), chrome.tabs.onUpdated.addListener(i), chrome.storage.onChanged.addListener(a), chrome.runtime.onMessage.addListener(c), window.addEventListener("pagehide", () => {
    chrome.tabs.onActivated.removeListener(s), chrome.tabs.onUpdated.removeListener(i), chrome.storage.onChanged.removeListener(a), chrome.runtime.onMessage.removeListener(c);
  }, { once: true });
}
const r = document.querySelector("#app");
r !== null && typeof chrome < "u" && chrome.runtime?.id && p(r).catch((d) => {
  r.textContent = d instanceof Error ? "사이드패널을 다시 열어 주세요." : "확장 프로그램을 다시 로드해 주세요.";
});
