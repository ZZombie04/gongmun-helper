/* =============================================================================
 * 공문 도우미 — 장바구니 품의: 옆 패널 화면
 *   가져오기 → 확인(금액 올림) → 입력 순서로 그린다. popup.js 가 불러 쓴다.
 * ========================================================================== */
import { g as Je, S as Be, h as de, r as We } from "./messages.js";
class oe extends Error {
}
class Ke extends oe {
  name = "PanelTimeoutError";
}
async function be(t, e, n) {
  const o = e.kind === "read_context" ? 12e3 : 6e4;
  let s;
  const r = new Promise((l, c) => {
    s = setTimeout(() => c(new Ke("응답 대기 시간이 지났습니다. 새로고침으로 상태를 다시 확인해 주세요.")), o);
  });
  let i;
  try {
    i = await Promise.race([t.send({ ...e, ...e.kind === "read_context" || n === void 0 ? {} : { tabId: n } }), r]);
  } finally {
    clearTimeout(s);
  }
  const a = Je.safeParse(i);
  return a.success ? a.data : { kind: "failure", message: "확장 프로그램의 응답을 확인하지 못했습니다. 다시 시도해 주세요." };
}
function u(t, e = "", n = "") {
  const o = document.createElement(t);
  return o.className = e, o.textContent = n, o;
}
const x = (t) => `${t.toLocaleString("ko-KR")}원`;
function Ye(t, e, n, o) {
  const s = t.querySelector(".content");
  s !== null && o !== void 0 && (s.scrollTop = o);
  const r = e ? document.getElementById(e) : null;
  (r instanceof HTMLButtonElement && !r.disabled ? r : document.getElementById(n))?.focus({ preventScroll: true });
}
function he(t) {
  throw new TypeError("Unexpected popup state");
}
function O(t, e) {
  const n = u("button", `button ${e}`, t.label);
  return n.type = "button", n.id = t.id, n.disabled = !t.enabled, n.addEventListener("click", t.execute), n;
}
function Qe(t, e) {
  if (e.action === "read_context" && e.focusedId !== "refresh-context") return;
  const n = e.action === "round_prices" ? e.roundingStep === 0 ? "round-prices" : "reset-prices" : "primary-action", o = (e.action === "round_prices" || e.focusedId === "refresh-context") && e.successful;
  Ye(t, e.focusedId, n, o ? e.scrollTop : void 0);
}
const Xe = { document: "M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H8 M8 8h8 M8 12h8 M8 16h5", refresh: "M20.7883 13.9407C20.929 13.3034 21 12.6527 21 12C21 7.0294 16.9706 3 12 3C9.5169 3 7.1441 4.0259 5.4432 5.8349M4.2857 3L4.7293 6.105C4.7683 6.3784 5.0216 6.5683 5.295 6.5293L8.4 6.0857M3.2117 10.0593C3.071 10.6966 3 11.3473 3 12C3 16.9706 7.0294 21 12 21C14.4831 21 16.8559 19.9741 18.5568 18.1651M19.7143 21L19.2707 17.895C19.2317 17.6216 18.9784 17.4317 18.705 17.4707L15.6 17.9143", more: "M12 5h.01 M12 12h.01 M12 19h.01", check: "m5 12 4 4L19 6", chevron: "m9 5 7 7-7 7", up: "M4 20v-6h6V8h6V3 M11 3h5v5" };
function X(t) {
  const e = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  e.setAttribute("viewBox", "0 0 24 24"), e.setAttribute("fill", "none"), e.setAttribute("stroke", "currentColor"), e.setAttribute("stroke-width", t === "refresh" ? "2" : "1.8"), e.setAttribute("stroke-linecap", "round"), e.setAttribute("stroke-linejoin", "round"), e.setAttribute("aria-hidden", "true"), e.classList.add("icon");
  const n = document.createElementNS("http://www.w3.org/2000/svg", "path");
  return n.setAttribute("d", Xe[t]), e.append(n), e;
}
function Ze(t) {
  const e = u("section", "draft-summary"), n = t.items.filter((i) => i.id !== Be), o = u("ol", "item-list");
  n.forEach((i, a) => {
    const l = u("li", "item-row"), c = u("button", "item-summary");
    c.type = "button", c.id = `item-toggle-${a}`, c.setAttribute("aria-expanded", "false"), c.setAttribute("aria-controls", `item-detail-${a}`), c.setAttribute("aria-label", `${i.name} 상세`);
    const d = u("span", "item-copy");
    d.append(u("span", "item-name", i.name)), i.specification && d.append(u("span", "item-specification", i.specification));
    const f = u("span", "item-calculation");
    f.append(u("span", "", `${i.quantity}${i.unit} ×`), u("span", "", x(i.unitPrice)));
    const p = u("span", "item-price");
    p.append(u("strong", "item-amount", x(i.expectedAmount)), f), c.append(d, p, X("chevron"));
    const h = u("dl", "item-detail");
    h.id = `item-detail-${a}`, h.hidden = true;
    const g = t.sourceItems.find((b) => b.id === i.id), S = [["규격", i.specification || "없음"], ["수량", `${i.quantity}${i.unit}`], ["상품 단가", g && g.unitPrice !== i.unitPrice ? `${x(g.unitPrice)} → ${x(i.unitPrice)}` : x(i.unitPrice)], ["금액", x(i.expectedAmount)]];
    for (const [b, C] of S) {
      const M = u("div", "detail-field");
      M.append(u("dt", "", b), u("dd", "", C)), h.append(M);
    }
    c.addEventListener("click", () => {
      h.hidden = !h.hidden, c.setAttribute("aria-expanded", String(!h.hidden));
    }), l.append(c, h), o.append(l);
  });
  const s = u("div", "shipping-row");
  s.append(u("span", "", "배송비"), u("strong", "", t.shippingAmount === 0 ? "무료" : x(t.shippingAmount)));
  const r = u("div", "item-group");
  return r.append(o, s), e.append(r), t.source === "generic" && e.append(u("p", "caution", "공통 방식으로 가져왔습니다. 상품·옵션·수량·단가·배송비를 원본과 확인해 주세요.")), e;
}
function et(t, e) {
  for (const n of Array.from(t.querySelectorAll(".item-summary"))) {
    if (!e.has(n.id)) continue;
    const o = n.getAttribute("aria-controls"), s = o ? document.getElementById(o) : null;
    s !== null && (n.setAttribute("aria-expanded", "true"), s.hidden = false);
  }
}
function tt(t) {
  return new Set(Array.from(t.querySelectorAll('.item-summary[aria-expanded="true"]'), (e) => e.id));
}
function nt(t, e) {
  const n = u("dialog", "clear-dialog");
  n.setAttribute("aria-labelledby", "clear-title"), n.setAttribute("aria-describedby", "clear-help");
  const o = t.confirmingClear === "items", s = t.draft === null ? 0 : de(t.draft.items), r = u("h2", "clear-title", o ? "입력한 품목을 삭제할까요?" : `가져온 상품 ${s}개를 비울까요?`);
  r.id = "clear-title";
  const i = u("p", "clear-description", o ? "품목·배송비 행을 삭제합니다. 제목, 개요, 예산과 가져온 상품은 유지됩니다." : "상품과 배송비 목록을 비웁니다. 에듀파인에 입력한 품목은 유지됩니다.");
  i.id = "clear-help";
  const a = O(e.cancelClear, "button-secondary");
  a.autofocus = true;
  const l = O(o ? e.clearItems : e.clear, "button-danger");
  l.id = "confirm-clear", l.textContent = o ? "삭제" : "비우기";
  const c = u("div", "clear-controls");
  return c.append(a, l), n.append(r, i, c), n.addEventListener("cancel", (d) => {
    d.preventDefault(), e.cancelClear.execute();
  }), n;
}
function rt(t, e) {
  const n = tt(t), o = t.querySelector(".content")?.scrollTop ?? 0;
  t.querySelector("dialog")?.close(), t.replaceChildren(e), et(t, n);
  const s = t.querySelector(".content");
  s !== null && (s.scrollTop = o), t.querySelector("dialog")?.showModal();
}
function st({ draft: t, surface: e, gridState: n, tabAccess: o }) {
  const s = e === "kedufine" && n !== "empty";
  let r = null, i = "쇼핑몰에서 상품을 가져와 주세요";
  switch (e) {
    case "gmarket":
    case "11st":
    case "ssg":
    case "iscreammall":
    case "coupang":
      r = { kind: "capture_cart_selection" }, i = t === null ? "선택한 품목 가져오기" : "선택한 품목 다시 가져오기";
      break;
    case "kedufine":
      if (t !== null && n === "empty" && (r = { kind: "fill_kedufine_items" }), t !== null) {
        const a = de(t.items), l = t.shippingAmount > 0 ? " + 배송비" : "";
        i = s ? n === "occupied" ? "품목내역에 행이 있습니다" : "품목내역 확인 필요" : `상품 ${a}개${l} 입력`;
      }
      break;
    case "other":
      r = { kind: "capture_cart_selection" }, i = "장바구니 가져오기 시도";
      break;
    default:
      he();
  }
  return o !== "granted" && (r = null, i = o === "required" ? "현재 탭 연결 필요" : "이 페이지에서는 사용할 수 없습니다"), { completed: s, label: i, message: r };
}
function me(t, e) {
  document.querySelector(".info-dialog")?.close();
  const n = u("dialog", "info-dialog");
  n.setAttribute("aria-labelledby", "info-title");
  const o = u("div", "info-header"), s = u("h2", "", t);
  s.id = "info-title";
  const r = u("button", "button button-secondary", "닫기");
  r.type = "button", r.autofocus = true, r.addEventListener("click", () => n.close()), o.append(s, r), e.classList.add("info-body"), n.append(o, e), n.addEventListener("close", () => {
    n.remove(), document.getElementById("more-actions")?.focus({ preventScroll: true });
  }, { once: true }), document.body.append(n), n.showModal();
}
function Pe(t) {
  const e = u("div");
  for (const [n, o] of t) {
    const s = u("section", "info-section");
    s.append(u("h3", "", n), u("p", "", o)), e.append(s);
  }
  return e;
}
function ot() {
  me("사용 도움말", Pe([["1. 장바구니에서 가져오기", "G마켓·11번가·SSG닷컴·아이스크림몰·쿠팡의 장바구니에서 상품을 체크하고 가져오세요. 홈페이지에서는 전용 장바구니 인식이 동작하지 않습니다."], ["2. 금액 확인", "상품·수량·옵션·배송비를 확인하세요. 금액 올림은 상품 단가를 1,000원 단위로 올리며 배송비는 유지합니다. 추가 할인과 최종 금액은 결제 화면에서 확인하세요."], ["3. 에듀파인에 입력", "경기도교육청 K-에듀파인 품의등록 화면의 빈 품목내역에서 입력하세요. 기존 행이 있으면 입력을 막습니다. 저장·결재는 직접 진행하세요."], ["탭 연결과 새로고침", "새 탭에서 연결이 필요하면 해당 탭의 확장프로그램 아이콘을 누르세요. 새로고침은 현재 상태를 다시 확인하며 상품을 비우거나 진행 중인 입력을 취소하지 않습니다."], ["비우기의 범위", "상품 비우기는 가져온 목록만 지웁니다. 입력한 품목 비우기는 에듀파인 품목·배송비 행을 삭제하며 직접 수정한 행도 포함합니다. 제목·개요·예산과 가져온 목록은 유지합니다."], ["오류가 생겼다면", "새로고침 후 실제 입력된 행을 먼저 확인하세요. 일부만 입력됐다면 중복 입력하지 말고 필요한 행을 정리하세요. 브라우저 종료·확장프로그램 재로드 시 가져온 목록은 사라질 수 있습니다."], ["개인 제작 보조 도구", "교육청 공식 프로그램이 아닙니다. 인식한 내용과 금액을 확인한 뒤 사용하세요."]]));
}
function vn() {
  const t = u("details", "more-menu"), e = u("summary", "button button-icon");
  e.id = "more-actions", e.setAttribute("aria-label", "더보기"), e.title = "더보기", e.append(X("more"));
  const n = u("div", "menu-content"), o = (a, l, c) => {
    const d = u("button", "button button-menu", l);
    return d.id = a, d.type = "button", d.addEventListener("click", () => {
      t.open = false, c();
    }), d;
  }, v = typeof chrome < "u" && chrome.runtime?.getManifest ? chrome.runtime.getManifest().version : "";
  return n.append(o("show-help", "사용 도움말", ot), u("p", "version", v ? `공문 도우미 · v${v}` : "공문 도우미")), t.append(e, n), t.addEventListener("keydown", (a) => {
    a.key === "Escape" && (t.open = false, e.focus());
  }), t.addEventListener("focusout", (a) => {
    a.relatedTarget instanceof Node && !t.contains(a.relatedTarget) && (t.open = false);
  }), t;
}
const Ee = { gmarket: "G마켓", "11st": "11번가", ssg: "SSG닷컴", iscreammall: "아이스크림몰", coupang: "쿠팡", kedufine: "K-에듀파인", other: "공통 인식 시도", generic: "공통 인식" };
function xn(t, e) {
  const n = u("header", "panel-header"), o = u("div", "header-top"), s = t.loading ? "확인 중" : t.tabAccess === "required" ? "연결 필요" : t.tabAccess === "restricted" ? "지원하지 않는 페이지" : Ee[t.surface], r = t.draft === null ? null : Ee[t.draft.source], i = u("div", "page-context");
  i.setAttribute("aria-label", "현재 페이지와 상품 출처"), r !== null && (r !== s || t.tabAccess !== "granted") && i.append(u("span", "source-caption", `${r} 상품 · 현재 `)), i.append(u("strong", "surface-status", s));
  const a = u("div", "header-tools"), l = O(e.refresh, "button-refresh");
  l.prepend(X("refresh"));
  const c = vn();
  a.append(l, c), o.append(i, a);
  const d = u("ol", "steps");
  d.setAttribute("aria-label", "품의 작성 순서");
  const f = t.notice?.filled ? 3 : t.draft === null ? 0 : t.surface === "kedufine" && t.gridState === "empty" && t.tabAccess === "granted" ? 2 : 1;
  return ["가져오기", "확인", "입력"].forEach((p, h) => {
    const g = u("li", "step"), S = h < f;
    h === f && g.setAttribute("aria-current", "step"), S && (g.dataset.done = "true"), g.setAttribute("aria-label", p + (S ? " 완료" : h === f ? " 진행 중" : " 대기"));
    const b = u("span", "step-number", S ? "" : String(h + 1));
    b.setAttribute("aria-hidden", "true"), S && b.append(X("check")), g.append(b, u("span", "", p)), d.append(g);
  }), n.append(o, d), n;
}
function En(t) {
  const e = u("div", "total-amount"), n = u("div");
  return n.append(u("span", "total-label", "예상금액"), u("span", "total-caption", "배송비 포함")), e.append(n, u("strong", "total-value", x(t.items.reduce((o, s) => o + s.expectedAmount, 0)))), e;
}
function Pn(t, e, n) {
  const o = u("section", "pricing-controls");
  o.setAttribute("aria-label", "품의금액 올림");
  const s = t.sourceItems.reduce((f, p) => f + p.expectedAmount, 0), r = t.items.reduce((f, p) => f + p.expectedAmount, 0), i = We(t.sourceItems, 1e3).reduce((f, p) => f + p.expectedAmount, 0), a = t.roundingStep === 1e3, l = O({ id: "round-prices", label: "", enabled: e && !a, execute: () => n(1e3) }, "rounding-button");
  l.setAttribute("aria-pressed", String(a)), l.setAttribute("aria-describedby", "rounding-help"), l.append(u("span", "rounding-title", a ? "올림 적용됨" : "품의금액 올림"), u("span", "rounding-preview", a ? `+${x(r - s)}` : `적용 후 ${x(i)}`)), l.append(u("span", "rounding-caption", "단가 1,000원 · 배송비 유지"));
  const c = u("p", "sr-only", "상품 단가 1,000원 단위 올림 · 배송비 유지");
  c.id = "rounding-help";
  const d = u("div", "rounding-detail");
  return d.append(c), t.roundingStep !== 0 && d.append(O({ id: "reset-prices", label: "원래 금액", enabled: e, execute: () => n(0) }, "button-text")), o.append(l, d), o;
}
function Cn(t) {
  if (t.loading) return null;
  if (t.tabAccess === "required") return "현재 탭에서 도구 모음의 공문 도우미 아이콘을 눌러 연결하세요.";
  if (t.tabAccess === "restricted") return "장바구니 또는 품의등록 탭으로 이동하세요.";
  if (t.surface === "kedufine") {
    if (t.gridState === "busy") return "입력 또는 삭제가 진행 중입니다. 완료 후 새로고침하세요.";
    if (t.gridState === "unavailable") return "품목내역을 확인하지 못했습니다. 품의등록 화면에서 새로고침하세요.";
  }
  return null;
}
function qn(t, e) {
  const n = u("section", "panel");
  n.setAttribute("aria-busy", String(t.busy || t.loading)), n.setAttribute("aria-label", "장바구니 품의"), n.append(xn(t, e));
  const o = u("section", "content");
  o.setAttribute("aria-label", "품목 확인"), o.tabIndex = 0;
  const s = u("div", t.notice === null ? "notice-empty" : `notice notice-${t.notice.kind}`);
  s.setAttribute("role", t.notice?.kind === "error" ? "alert" : "status"), t.notice !== null && (t.notice.kind === "error" && s.append(u("strong", "notice-label", "확인 필요")), s.append(u("p", "notice-message", t.notice.message))), o.append(s);
  const r = u("div", "list-heading"), i = t.draft === null ? 0 : de(t.draft.items), a = O(e.clear, "button-text");
  if (a.textContent = "상품 비우기", a.disabled ||= t.confirmingClear !== null, r.append(u("h2", "section-title", `상품 ${i}개`), a), o.append(r), t.draft === null) {
    const d = t.surface === "gmarket" ? "G마켓" : t.surface === "11st" ? "11번가" : t.surface === "ssg" ? "SSG닷컴" : t.surface === "iscreammall" ? "아이스크림몰" : t.surface === "coupang" ? "쿠팡" : null, f = u("section", "empty-state");
    f.append(u("h2", "empty-title", t.loading ? "현재 탭 확인 중" : d !== null ? `${d}에서 상품 가져오기` : t.surface === "kedufine" && t.gridState === "occupied" ? "입력된 품목이 있습니다" : "가져온 상품이 없습니다"), u("p", "empty-copy", t.loading ? "잠시만 기다려 주세요." : d !== null ? "체크한 상품과 배송비를 가져옵니다." : t.surface === "kedufine" && t.gridState === "occupied" ? "새 상품을 가져오거나 입력한 품목을 비울 수 있습니다." : "쇼핑몰 장바구니에서 상품을 체크한 뒤 가져오세요.")), o.append(f), !t.loading && d !== null && f.append(u("p", "empty-copy", "추가 할인과 배송비는 결제 화면에서 확인하세요."));
  } else o.append(Ze(t.draft));
  const l = u("footer", "actions");
  if (t.draft !== null && l.append(Pn(t.draft, !t.loading && !t.busy && !t.completed, e.round), En(t.draft)), l.append(O(e.primary, "button-primary")), t.surface === "kedufine" && t.gridState === "occupied") {
    const d = O(e.clearItems, "button-text");
    d.textContent = "입력한 품목 비우기", d.disabled ||= t.confirmingClear !== null, l.append(d);
  }
  const c = Cn(t);
  if (c !== null) {
    const d = u("p", "action-help", c);
    d.id = "primary-help", l.querySelector("#primary-action")?.setAttribute("aria-describedby", d.id), l.append(d);
  }
  return t.surface === "kedufine" && (t.notice?.filled || t.gridState === "occupied" || t.gridState === "empty" && t.draft !== null && t.tabAccess === "granted") && l.append(u("p", "safety-copy", "저장·결재는 에듀파인에서 직접 진행")), n.append(o, l), t.confirmingClear !== null && n.append(nt(t, e)), n;
}
function On(t, e) {
  let n = null, o = "other", s = null, r = false, i = true, a = null, l = "unavailable", c = "", d, f = "granted", p = 0, h = false, g = false;
  const S = (m) => {
    switch (m.kind) {
      case "context":
        h = m.operationPending ?? false, n = m.draft, o = m.surface, l = m.gridState ?? "unavailable", c = m.clearToken ?? "", d = m.tabId, f = m.tabAccess ?? "granted", s = h ? { kind: "error", message: "이전 작업이 진행 중입니다. 잠시 후 새로고침해 주세요." } : null;
        return;
      case "draft_updated":
        n = m.draft, s = { kind: "success", message: m.draft.roundingStep === 0 ? "원래 금액으로 되돌렸습니다." : "전체 상품 단가를 올렸습니다. 합계를 확인해 주세요." };
        return;
      case "draft_saved":
        n = m.draft, s = { kind: "success", message: "선택한 상품과 배송비를 가져왔습니다." };
        return;
      case "filled":
        l = "occupied", s = { kind: "success", message: m.message, filled: true };
        return;
      case "cleared":
        n = null, s = { kind: "success", message: "상품 목록을 비웠습니다." };
        return;
      case "items_cleared":
      case "undone":
        l = "empty", c = "", s = { kind: "success", message: m.message };
        return;
      case "failure":
        s = { kind: "error", message: m.message };
        return;
      default:
        he();
    }
  }, b = async (m) => {
    if (r || h && m.kind !== "read_context") return;
    const P = p, q = t.querySelector(".content")?.scrollTop ?? 0, I = document.activeElement?.id;
    a = null, r = true, j();
    try {
      const y = await be(e, m, d);
      if (P !== p) return;
      if (S(y), m.kind === "read_context" && I === "refresh-context" && y.kind === "context" && !h && (s = { kind: "success", message: "현재 페이지 상태를 확인했습니다." }), m.kind === "capture_cart_selection" && y.kind === "failure" && n !== null && (s = { kind: "error", message: `${y.message} 이번 가져오기는 반영되지 않았습니다. 아래 목록은 이전에 가져온 상품입니다.` }), g || m.kind === "fill_kedufine_items" || m.kind === "clear_kedufine_items") {
        g = false, i = true;
        const A = s, R = await be(e, { kind: "read_context" }, d);
        if (P !== p) return;
        if (R.kind !== "context") throw new oe(R.kind === "failure" ? R.message : "현재 상태를 확인하지 못했습니다. 새로고침해 주세요.");
        S(R), s = A;
      }
    } catch (y) {
      if (P !== p) return;
      m.kind !== "read_context" && (h = true), s = { kind: "error", message: y instanceof oe ? y.message : "확장 프로그램 연결을 확인하고 새로고침해 주세요." };
    } finally {
      P === p && (r = false, i = false, j(), Qe(t, { action: m.kind, focusedId: I, roundingStep: n?.roundingStep, successful: s?.kind !== "error", scrollTop: q }));
    }
  }, C = (m = "tab") => {
    if (m === "storage" && r && !i) {
      g = true;
      return;
    }
    g = false, p += 1, i = true, o = "other", l = "unavailable", f = "required", c = "", d = void 0, a = null, s = null, r = false, b({ kind: "read_context" });
  }, M = (m) => {
    if (a === m) {
      b(m === "items" ? { kind: "clear_kedufine_items", clearToken: c } : { kind: "clear_draft" });
      return;
    }
    a = m, j();
  }, j = () => {
    const { completed: m, label: P, message: q } = st({ draft: n, surface: o, gridState: l, tabAccess: f });
    rt(t, qn({ draft: n, surface: o, notice: s, busy: r || h, loading: i, completed: m, gridState: l, confirmingClear: a, tabAccess: f }, { refresh: { id: "refresh-context", label: "새로고침", enabled: true, execute: () => C() }, primary: { id: "primary-action", label: i ? "현재 탭 확인 중…" : r ? "처리 중…" : s?.filled ? "입력 완료" : P, enabled: !i && !r && !h && q !== null, execute: () => {
      q !== null && b(q);
    } }, clear: { id: "clear-draft", label: a === "draft" ? "상품 목록 삭제 확인" : "상품 비우기", enabled: !i && !r && !h && n !== null, execute: () => M("draft") }, clearItems: { id: "clear-items", label: a === "items" ? "품목내역 삭제 확인" : "입력한 품목 비우기", enabled: !i && !r && !h && l === "occupied" && c !== "", execute: () => M("items") }, cancelClear: { id: "cancel-clear", label: "취소", enabled: !r, execute: () => {
      const I = a === "items" ? "clear-items" : "clear-draft";
      a = null, j(), document.getElementById(I)?.focus();
    } }, round: (I) => {
      b({ kind: "round_prices", step: I });
    } }));
  };
  return C(), C;
}
export { On as m };
