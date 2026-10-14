/* =============================================================================
 * 공문 도우미 — 장바구니 품의 (백그라운드)
 *   sw.js 가 데이터취합 백그라운드(gmh-background.js)와 함께 불러온다.
 *   도구 모음 아이콘 → 옆 패널 열기, 장바구니 읽기 · K-에듀파인 품목내역 입력 · 되돌리기 · 비우기.
 *   옆 패널이 보내는 {kind} 메시지만 처리한다.
 * ========================================================================== */
import { d as z, o as D, a as ne, s as M, n as re, l as G, b as ie, D as ce, c as le, i as ue, E as de, e as X, r as me, f as ae, G as fe } from "./assets/messages.js";
function pe(e) {
  chrome.sidePanel.open({ windowId: e.windowId }).then(() => chrome.runtime.sendMessage({ kind: "panel_context_changed", windowId: e.windowId })).catch((t) => {
    console.error("사이드패널 연결 실패", t instanceof Error ? t.message : t);
  });
}
chrome.action.onClicked.addListener(pe);
let F = false;
function te() {
  return F;
}
async function ge(e, t) {
  if (e.kind === "read_context") return t();
  if (F) return { kind: "failure", message: "이전 작업이 진행 중입니다. 잠시 후 새로고침해 주세요." };
  F = true;
  try {
    return await t();
  } finally {
    F = false;
  }
}
function he() {
  const e = (g) => ({ kind: "failed", message: g }), t = (g) => (g?.textContent ?? "").replace(/\s+/g, " ").trim(), r = (g) => g.getClientRects().length > 0 && !g.closest('[hidden], [aria-hidden="true"]') && getComputedStyle(g).visibility !== "hidden", s = (g) => {
    const v = g.match(/^(\d+|\d{1,3}(?:,\d{3})+)\s*원?$/), S = v?.[1] === void 0 ? NaN : Number(v[1].replace(/,/g, ""));
    return Number.isSafeInteger(S) && S >= 0 ? S : null;
  }, p = document.querySelector("#mainContent");
  if (!p) return e("쿠팡 장바구니를 연 뒤 다시 가져와 주세요.");
  if (Array.from(document.querySelectorAll('[role="dialog"], [aria-busy="true"]')).some(r)) return e("옵션·수량 변경을 완료하고 변경창을 닫은 뒤 다시 가져와 주세요.");
  const c = Array.from(p.querySelectorAll('[id^="item_"][data-selected]')).filter(r);
  if (c.length === 0) return /장바구니에 담은 상품이 없습니다/.test(t(p)) ? { kind: "empty" } : e("쿠팡의 상품 행 구조를 확인하지 못했습니다.");
  const i = [];
  let u = 0;
  for (const g of c) {
    const v = Array.from(g.querySelectorAll('input[type="checkbox"]')).filter(r);
    if (v.length !== 1 || !v[0]) return e("상품 선택 상태를 확인하지 못했습니다. 쿠팡 장바구니를 확인해 주세요.");
    const S = v[0];
    if (String(S.checked) !== g.getAttribute("data-selected")) return e("상품 선택 변경이 반영되는 중입니다. 잠시 후 다시 가져와 주세요.");
    if (!S.checked) continue;
    if (S.disabled || S.closest('[data-disabled="true"]')) return e("선택 상품에 품절·구매 불가 상품이 있습니다. 선택을 해제해 주세요.");
    const x = Array.from(g.querySelectorAll('[id="name"] a[href*="/vp/products/"]')).filter(r), w = x.length === 1 ? x[0] : void 0, l = w ? Array.from(w.children).map(t) : [], b = l[0] ?? "", m = l[1] ?? "", k = Array.from(g.querySelectorAll("input.cart-quantity-input")).filter(r), E = k.length === 1 ? k[0] : void 0, $ = E?.value.trim() ?? "", f = /^\d+$/.test($) ? Number($) : NaN;
    if (E && document.activeElement === E) return e("수량 입력을 확정한 뒤 다시 가져와 주세요.");
    const o = Array.from(g.querySelectorAll('[data-component-id="price-area"]')).filter(r), n = o.length === 1 ? o[0] : void 0, d = n ? Array.from(n.querySelectorAll("span")).filter((C) => r(C) && t(C) === "원") : [], y = d.length === 1 ? s(t(d[0]?.parentElement ?? null)) : null;
    if (!b || l.length > 2 || m !== "" && !m.startsWith("옵션:") || !Number.isSafeInteger(f) || f <= 0 || y === null || y <= 0) return e("선택 상품의 이름·옵션·구매 수량·금액을 정확히 확인하지 못했습니다.");
    const q = y / f;
    if (!Number.isSafeInteger(q) || q <= 0) return e("할인·수량 때문에 상품 단가를 정확히 계산하지 못했습니다.");
    const _ = `coupang-${g.id}`;
    if (i.some((C) => C.id === _)) return e("상품 행이 중복되어 있습니다. 새로고침 후 다시 가져와 주세요.");
    i.push({ id: _, name: b, specification: m.replace(/^옵션:\s*/, ""), quantityText: String(f), priceText: String(q) }), u += y;
  }
  if (i.length === 0) return { kind: "empty" };
  const a = Array.from(document.querySelectorAll('[data-component-id="total-price"]')).filter(r), h = a.map((g) => {
    const v = (S, x = false) => {
      const w = Array.from(g.querySelectorAll("div")).filter((m) => t(m) === S), l = w.length === 1 ? w[0] : void 0;
      if (x && w.length === 0) return 0;
      const b = Array.from(l?.parentElement?.querySelectorAll(x ? "em" : "em.final-product-price") ?? []).filter((m) => !x || t(m) !== "-");
      return b.length === 1 ? s(t(b[0] ?? null)) : null;
    };
    return { subtotal: v("총 상품 가격"), discount: v("총 즉시할인", true), shipping: v("총 배송비") };
  }), A = h[0]?.shipping ?? null, N = Array.from(document.querySelectorAll('[id="finalOrderPrice"]')).filter(r).map(t).map(s);
  return A === null || a.length === 0 || N.length === 0 ? e("쿠팡의 주문 예상 금액과 총 배송비가 표시된 뒤 다시 가져와 주세요.") : !Number.isSafeInteger(u + A) || h.some((g) => g.subtotal === null || g.discount === null || g.subtotal - g.discount !== u || g.subtotal !== h[0]?.subtotal || g.discount !== h[0]?.discount || g.shipping !== A) || N.some((g) => g !== u + A) ? e("선택 상품 합계와 주문 예상 금액이 맞지 않습니다. 선택·수량·할인 변경이 완료된 뒤 다시 가져와 주세요.") : { kind: "extracted", rows: i, shippingAmount: A };
}
function ye() {
  const e = (a) => a?.textContent?.replace(/\s+/g, " ").trim() ?? "", t = (a, h) => typeof a == "object" && a !== null ? Reflect.get(a, h) : void 0, r = (a) => typeof a == "number" && Number.isSafeInteger(a) && a > 0 ? a : null, p = Array.from(document.querySelectorAll("[id^='bcktSeqBunch_']:checked")).flatMap((a) => {
    const h = a.closest("[id^='bunchPrdWrap_']");
    if (h === null || h.getClientRects().length === 0) return [];
    let A;
    const N = a.getAttribute("data-prd");
    if (N !== null) try {
      A = JSON.parse(N);
    } catch (m) {
      if (!(m instanceof SyntaxError)) throw m;
    }
    const g = t(A, "prdOptInfo"), v = t(A, "amount"), S = r(t(g, "qty")) ?? Number(e(h.querySelector("[id^='btnModifyQtyInit_']")).match(/\d+/)?.[0] ?? ""), w = (r(t(v, "checkSumAmount")) ?? Number(e(h.querySelector("[id$='_sale_price']")).replace(/[^0-9]/g, ""))) / S, l = t(g, "prdNm"), b = t(g, "dtlOptNm");
    return [{ id: h.id || a.id, name: typeof l == "string" && l.trim() ? l.trim() : a.getAttribute("aria-label")?.trim() ?? "", specification: typeof b == "string" ? b.trim() : "", quantityText: Number.isSafeInteger(S) && S > 0 ? String(S) : "", priceText: Number.isSafeInteger(w) && w > 0 ? String(w) : "" }];
  });
  if (p.length === 0) return { kind: "empty" };
  const c = document.querySelector("#spanSumDlvAmt"), i = e(c), u = c === null ? null : /^\d{1,3}(?:,\d{3})*원$/.test(i.replace(/\s/g, "")) ? Number(i.replace(/[,원\s]/g, "")) : null;
  return { kind: "extracted", rows: p, shippingAmount: u };
}
function be() {
  const e = (n) => ({ kind: "failed", message: n }), t = (n) => (n.textContent ?? "").replace(/\s+/g, " ").trim(), r = (n) => n.getClientRects().length > 0 && !n.closest('[hidden], [aria-hidden="true"]') && getComputedStyle(n).visibility !== "hidden", s = (n) => [n.id, n.className, n.getAttribute("name"), n.getAttribute("aria-label")].filter((d) => typeof d == "string").join(" "), p = (n) => {
    const d = n.trim().match(/^(?:₩\s*)?(\d+|\d{1,3}(?:,\d{3})+)(?:\s*원)?$/), y = d?.[1] === void 0 ? NaN : Number(d[1].replace(/,/g, ""));
    return Number.isSafeInteger(y) && y >= 0 ? y : null;
  }, c = (n) => [...new Set(n.filter(Boolean))], i = (n, d) => Array.from(n.querySelectorAll(d)).filter(r);
  if (!(Array.from(document.querySelectorAll("h1,h2,[role=heading]")).some((n) => r(n) && /^(?:쇼핑\s*)?장바구니(?:\s*\(\d+\))?$|^(?:shopping\s+)?(?:cart|basket)$/i.test(t(n))) || /(?:^|\/)(?:cart|basket)(?:[/.;]|$)/i.test(location.pathname))) return e("장바구니 화면을 확인하지 못했습니다. 장바구니를 연 뒤 다시 시도해 주세요.");
  const a = i(document.documentElement, 'input[type="checkbox"], [role="checkbox"]'), h = (n) => n instanceof HTMLInputElement ? Array.from(n.labels ?? []).map(t).join(" ") : n.getAttribute("aria-label") ?? t(n), A = (n) => /전체|모두|select.?all|check.?all|all.?check/i.test(`${s(n)} ${h(n)}`), N = (n) => n instanceof HTMLInputElement ? n.checked : n.getAttribute("aria-checked") === "true", g = a.filter((n) => !A(n) && N(n));
  if (g.length === 0) return { kind: "empty" };
  const v = '[data-product-name], [itemprop="name"], .product-name, .product_name, .prd_name, .goods_name, .item-name, .item_name, a[href*="/products/"], a[href*="/product/"], a[href*="/goods/"], a[href*="/item/"]', S = 'input, select, [role="spinbutton"], [data-quantity], .quantity, .qty', x = (n) => i(n, S).filter((d) => d.hasAttribute("data-quantity") || /quantity|qty|수량/i.test(`${s(d)} ${h(d)}`)), w = [];
  for (const [n, d] of g.entries()) {
    let y = d.parentElement;
    for (; y !== null && y !== document.body && !(i(y, v).length > 0 && x(y).length > 0); ) y = y.parentElement;
    if (y === null || y === document.body) return e("선택 상품의 이름·수량을 확인하지 못했습니다. 이 쇼핑몰은 전용 인식 보완이 필요합니다.");
    const q = y;
    if (a.filter((T) => q.contains(T) && !A(T)).length !== 1) return e("상품별 선택 범위를 구분하지 못했습니다. 이 쇼핑몰은 전용 인식 보완이 필요합니다.");
    const _ = c(i(y, v).map((T) => t(T) || T.getAttribute("data-product-name") || "")), C = x(y);
    if (_.length !== 1 || C.length !== 1) return e("상품명 또는 수량이 여러 값으로 표시되어 가져오기를 중단했습니다.");
    const I = C[0], U = I instanceof HTMLInputElement || I instanceof HTMLSelectElement ? I.value : I?.getAttribute("aria-valuenow") ?? I?.getAttribute("data-quantity") ?? (I ? t(I) : ""), H = /^\d+$/.test(U.trim()) ? Number(U) : NaN;
    if (!Number.isSafeInteger(H) || H <= 0) return e("상품 수량을 정확히 확인하지 못했습니다. 수량 표시를 확인해 주세요.");
    const P = [], R = [], V = i(y, '[data-unit-price], [data-line-total], [itemprop="price"], .unit-price, .unit_price, .sale-price, .sale_price, .line-total, .line_total, .product-total, .product_total, dt, th, label, span, p, div');
    for (const T of V) {
      if (T.closest('del,s,[aria-hidden="true"]') || getComputedStyle(T).textDecorationLine.includes("line-through")) continue;
      const L = t(T);
      let K = null, O = L;
      if (T.matches('[data-unit-price], [itemprop="price"], .unit-price, .unit_price, .sale-price, .sale_price')) K = "unit", O = L || T.getAttribute("data-unit-price") || T.getAttribute("content") || "";
      else if (T.matches("[data-line-total], .line-total, .line_total, .product-total, .product_total")) K = "total", O = L || T.getAttribute("data-line-total") || "";
      else {
        const Q = L.match(/^(단가|판매가|상품금액|상품합계|unit price|line total)\s*[:：]?\s*(.*)$/i);
        if (!Q) continue;
        K = /단가|판매가|unit price/i.test(Q[1] ?? "") ? "unit" : "total", O = Q[2] || (T.tagName === "DT" ? T.nextElementSibling ? t(T.nextElementSibling) : "" : T.parentElement ? t(T.parentElement).replace(L, "").trim() : "");
      }
      const j = p(O);
      if (j === null || j <= 0) return e("상품 가격의 단가·합계 또는 할인 적용 여부를 확인하지 못했습니다.");
      K === "unit" ? P.push(j) : R.push(j);
    }
    const Z = [...new Set(P)], B = [...new Set(R)];
    if (Z.length > 1 || B.length > 1 || P.length === 0 && R.length === 0) return e("상품 단가와 합계를 구분하지 못했습니다. 이 쇼핑몰은 전용 인식 보완이 필요합니다.");
    const W = Z[0] ?? (B[0] === void 0 ? NaN : B[0] / H), ee = W * H;
    if (!Number.isSafeInteger(W) || W <= 0 || !Number.isSafeInteger(ee) || B[0] !== void 0 && ee !== B[0]) return e("상품 수량·단가·합계가 맞지 않습니다. 할인과 수량을 확인해 주세요.");
    const se = c(i(y, "[data-option], .option, .options, .product-option, .product_option, .specification").map(t)).join(" / ");
    w.push({ id: `generic-${n + 1}`, name: _[0] ?? "", specification: se, quantityText: String(H), priceText: String(W) });
  }
  const l = i(document.documentElement, '[data-cart-summary], .cart-summary, .cart_summary, .order-summary, .order_summary, .payment-summary, .payment_summary, .total-summary, .total_summary, #cart-summary, #order-summary, [aria-label="결제정보"], [aria-label="결제금액"]'), b = l.filter((n) => !l.some((d) => d !== n && n.contains(d))), m = b.length === 1 ? b[0] : void 0;
  if (!m) return e("최종 결제정보를 구분하지 못했습니다. 배송비와 선택 상품 합계가 표시된 장바구니에서 다시 시도해 주세요.");
  const k = (n) => {
    const d = [];
    for (const q of i(m, "dt,th,label,span,p,div")) {
      const _ = t(q), C = _.match(n);
      if (!C) continue;
      const I = C[1] || (q.tagName === "DT" ? q.nextElementSibling ? t(q.nextElementSibling) : "" : q.parentElement ? t(q.parentElement).replace(_, "").trim() : ""), U = /^(?:무료|무료배송|free)$/i.test(I) ? 0 : p(I);
      if (U === null) return null;
      d.push(U);
    }
    const y = [...new Set(d)];
    return y.length === 1 ? y[0] ?? null : null;
  }, E = k(/^(?:배송비\s*합계|총\s*배송비|배송비|배송료|shipping(?:\s+(?:fee|cost))?)\s*[:：]?\s*(.*)$/i);
  if (E === null) return e("최종 배송비를 확인하지 못했습니다. 조건부 무료배송은 무료로 처리하지 않습니다.");
  const $ = k(/^(?:선택\s*상품금액|상품금액\s*합계|총\s*상품금액|상품금액|상품합계|subtotal)\s*[:：]?\s*(.*)$/i), f = w.reduce((n, d) => n + Number(d.quantityText) * Number(d.priceText), 0);
  return $ === null || $ !== f || !Number.isSafeInteger(f + E) ? e("선택 상품의 합계와 결제정보가 맞는지 확인하지 못했습니다. 선택 범위·수량·할인을 확인해 주세요.") : i(m, "dt,th,label,span,p,div").filter((n) => /^(?:할인금액|할인합계|쿠폰할인|총\s*할인|discount)\s*[:：]?\s*(.*)$/i.test(t(n))).length > 0 && k(/^(?:할인금액|할인합계|쿠폰할인|총\s*할인|discount)\s*[:：]?\s*(.*)$/i) !== 0 ? e("별도 할인이 표시되어 상품별 적용 금액을 확인해야 합니다. 이 쇼핑몰은 전용 인식 보완이 필요합니다.") : { kind: "extracted", shippingAmount: E, rows: w };
}
function Se() {
  const e = (u) => u?.textContent?.replace(/\s+/g, " ").trim() ?? "", t = (u) => u.getClientRects().length > 0, s = Array.from(document.querySelectorAll(".item > .item_check input[type='checkbox']:checked")).flatMap((u) => {
    const a = u.closest(".item");
    return a === null || !t(a) ? [] : Array.from(a.querySelectorAll(".unit--item_desc")).map((h) => {
      const A = e(h.querySelector(".item_name")), N = h.querySelector("input.item_qty_count")?.value ?? "", g = e(h.querySelector(".item_price .text__value")), v = Number(g.replace(/,/g, "")), S = Number(N), x = v / S, w = Number.isSafeInteger(x) && x > 0 ? String(x) : "", l = Array.from(h.querySelectorAll("ul")).map(e).filter((b) => b.length > 0).join(" / ");
      return { id: h.id, name: A, specification: l, quantityText: N, priceText: w };
    });
  });
  if (s.length === 0) return { kind: "empty" };
  const p = Array.from(document.querySelectorAll("#cart_order .benefit_item, .cart_order .benefit_item")).filter((u) => e(u.querySelector(".label")) === "배송비"), c = p.length === 1 ? e(p[0]?.querySelector(".amount") ?? null).replace(/\s/g, "") : "", i = c === "무료배송" ? 0 : /^(?:\d+|\d{1,3}(?:,\d{3})+)원$/.test(c) ? Number(c.replace(/[,원]/g, "")) : null;
  return { kind: "extracted", rows: s, shippingAmount: i };
}
function we() {
  const e = (l) => ({ kind: "failed", message: l }), t = (l) => (l?.textContent ?? "").replace(/\s+/g, " ").trim(), r = (l) => l.getClientRects().length > 0 && !l.closest('[hidden], [aria-hidden="true"]') && getComputedStyle(l).visibility !== "hidden", s = (l) => {
    if (/^(?:무료|무료배송)$/.test(l)) return 0;
    const b = l.match(/^(\d+|\d{1,3}(?:,\d{3})+)\s*원?$/), m = b?.[1] === void 0 ? NaN : Number(b[1].replace(/,/g, ""));
    return Number.isSafeInteger(m) && m >= 0 ? m : null;
  }, p = document.querySelector("#container .contents-wrap");
  if (!p) return e("아이스크림몰 장바구니를 연 뒤 다시 가져와 주세요.");
  if (Array.from(document.querySelectorAll('[role="dialog"]')).some(r)) return e("옵션·수량 변경창을 닫고 변경된 장바구니에서 다시 가져와 주세요.");
  const c = 'input[id="option-one"], input[id="option-two"]', i = Array.from(p.querySelectorAll(c));
  if (i.length === 0 && p.querySelector(".unit-info")) return e("아이스크림몰의 상품 선택 구조를 확인하지 못했습니다.");
  const u = i.filter((l) => l.checked && r(l));
  if (u.length === 0) return { kind: "empty" };
  const a = [];
  let h = 0;
  for (const [l, b] of u.entries()) {
    let m = b.parentElement;
    for (; m !== null && m !== p && !(m.querySelector(".unit-info") && m.querySelector(".btn-area")); ) m = m.parentElement;
    if (!m || m === p || m.querySelectorAll(c).length !== 1) return e("선택 상품의 행을 구분하지 못했습니다. 아이스크림몰 장바구니를 확인해 주세요.");
    const k = Array.from(m.querySelectorAll(".unit-info")).filter(r), E = k.length === 1 ? k[0] : void 0, $ = E ? Array.from(E.querySelectorAll("p.body3")).filter(r) : [], f = $.length === 1 ? t($[0] ?? null) : "", o = E?.closest('a[href*="/goods/detail/"]')?.nextElementSibling, n = o ? Array.from(o.querySelectorAll("span")).filter(r).map(t).filter(Boolean) : [], d = n.length === 1 ? n[0]?.match(/^(.*?)\s*\/\s*(\d+)\s*개$/) : null, y = d?.[2] === void 0 ? NaN : Number(d[2]), q = Array.from(m.querySelectorAll("p.body2.font-bold")).filter(r), _ = q.length === 1 ? s(t(q[0] ?? null)) : null;
    if (!f || !Number.isSafeInteger(y) || y <= 0 || _ === null || _ <= 0) return e("선택 상품의 이름·옵션·수량·금액을 정확히 확인하지 못했습니다.");
    const C = _ / y;
    if (!Number.isSafeInteger(C) || C <= 0) return e("상품 합계에서 단가를 정확히 계산하지 못했습니다. 할인·수량을 확인해 주세요.");
    h += _, a.push({ id: `iscreammall-${l + 1}`, name: f, specification: d?.[1]?.trim() === "단일상품" ? "" : d?.[1]?.trim() ?? "", quantityText: String(y), priceText: String(C) });
  }
  const A = Array.from(p.querySelectorAll(".bottom-fixed")).filter(r), N = A.length === 1 ? A[0] : void 0;
  if (!N) return e("최종 결제 예상금액과 배송비를 확인하지 못했습니다.");
  const g = (l) => {
    const b = Array.from(N.querySelectorAll("p")).filter((k) => t(k) === l), m = b.length === 1 ? b[0] : void 0;
    return m?.parentElement ? s(t(m.parentElement).replace(l, "").trim()) : null;
  }, v = g("상품금액"), S = g("배송비"), x = Array.from(N.querySelectorAll(".title3.text-primary")), w = x.length === 1 ? s(t(x[0] ?? null)) : null;
  return S === null ? e("최종 배송비를 확인하지 못했습니다. 학교예산 무료배송 안내는 현재 배송비로 사용하지 않습니다.") : !Number.isSafeInteger(h) || v !== h || w !== h + S || !Number.isSafeInteger(w) ? e("선택 상품의 합계와 결제 예상금액이 맞지 않습니다. 선택 범위·할인·배송비를 확인해 주세요.") : { kind: "extracted", rows: a, shippingAmount: S };
}
function ke() {
  const e = (u) => u?.textContent?.replace(/\s+/g, " ").trim() ?? "", r = Array.from(document.querySelectorAll("input[name='cbCartId']:checked")).flatMap((u) => {
    const a = u.closest("[id^='mnodr_unit_']");
    if (a === null || a.getClientRects().length === 0) return [];
    const h = a.querySelector("input[name='inputOrdQty']")?.value ?? "", A = Array.from(a.querySelectorAll(".mnodr_unit_option, .mnodr_unit_option_txt")).map(e).filter(Boolean).join(" / ");
    return [{ id: a.id || u.id, name: e(a.querySelector(".mnodr_unit_tit .mnodr_unit_name")), specification: A, quantityText: h, priceText: e(a.querySelector(".mnodr_unit_newprice .itemOrdAmt")) }];
  });
  if (r.length === 0) return { kind: "empty" };
  const s = Array.from(document.querySelectorAll(".mnodr_form_sec")).find((u) => e(u.querySelector(".mnodr_form_tit")).includes("결제 예정금액")), p = s?.querySelector(".viewAmt_shppcstAmt") ?? null, c = e(p), i = s === void 0 || p === null ? null : /^\d{1,3}(?:,\d{3})*$/.test(c.replace(/\s/g, "")) ? Number(c.replace(/[,\s]/g, "")) : null;
  return { kind: "extracted", rows: r, shippingAmount: i };
}
const Ae = z("kind", [D({ kind: G("extracted"), shippingAmount: re().int().nonnegative().nullable(), rows: ne(D({ id: M(), name: M(), specification: M(), quantityText: M(), priceText: M() })) }), D({ kind: G("empty") }), D({ kind: G("failed"), message: M().min(1) })]);
class ve extends Error {
  name = "UnsupportedCartError";
}
async function xe(e, t) {
  switch (t) {
    case "gmarket":
      return (await chrome.scripting.executeScript({ target: { tabId: e }, func: Se }))[0]?.result;
    case "11st":
      return (await chrome.scripting.executeScript({ target: { tabId: e }, func: ye }))[0]?.result;
    case "ssg":
      return (await chrome.scripting.executeScript({ target: { tabId: e }, func: ke }))[0]?.result;
    case "iscreammall":
      return (await chrome.scripting.executeScript({ target: { tabId: e }, func: we }))[0]?.result;
    case "coupang":
      return (await chrome.scripting.executeScript({ target: { tabId: e }, func: he }))[0]?.result;
    case "generic":
      return (await chrome.scripting.executeScript({ target: { tabId: e }, func: be }))[0]?.result;
    default:
      throw new ve();
  }
}
const qe = { gmarket: "G마켓", "11st": "11번가", ssg: "SSG닷컴", iscreammall: "아이스크림몰", coupang: "쿠팡", generic: "공통 인식" };
async function _e(e) {
  const t = ie(e?.url);
  if (e?.id === void 0 || t === "kedufine" || !(e.url?.startsWith("https://") || e.url?.startsWith("http://"))) return { kind: "failure", message: "쇼핑몰 장바구니 웹페이지를 연 뒤 다시 시도해 주세요." };
  const r = t === "other" ? "generic" : t, s = Ae.safeParse(await xe(e.id, r));
  if (!s.success) return { kind: "failure", message: `${qe[r]} 장바구니의 선택상품을 읽지 못했습니다.` };
  if (s.data.kind === "failed") return { kind: "failure", message: s.data.message };
  if (s.data.kind === "empty") return { kind: "failure", message: "선택된 상품이 없습니다. 장바구니에서 상품을 선택해 주세요." };
  const p = ne(ce).min(1).safeParse(s.data.rows.map((a) => ({ id: a.id, name: a.name, specification: a.specification, quantity: Number(a.quantityText), unit: "개", unitPrice: Number(a.priceText), expectedAmount: Number(a.quantityText) * Number(a.priceText) }))), c = r === "generic" || r === "iscreammall" || r === "coupang" ? p.success ? { kind: "ready", items: p.data } : { kind: "invalid", message: "상품 정보를 확인하지 못했습니다. 다시 가져와 주세요." } : le(s.data.rows);
  if (c.kind === "invalid") return { kind: "failure", message: c.message };
  if (s.data.shippingAmount === null) return { kind: "failure", message: "배송비 합계를 확인하지 못했습니다. 장바구니의 최종 결제정보가 표시된 뒤 다시 가져와 주세요." };
  const i = ue(c.items, s.data.shippingAmount), u = { createdAt: Date.now(), items: i, sourceItems: i, shippingAmount: s.data.shippingAmount, roundingStep: 0, source: r };
  return await chrome.storage.session.set({ draft: u }), { kind: "draft_saved", draft: u };
}
async function Ne(e) {
  const t = (o) => {
    if (!o.isConnected || o.getClientRects().length === 0) return false;
    for (let n = o; n; n = n.parentElement) {
      const d = getComputedStyle(n);
      if (d.display === "none" || d.visibility === "hidden") return false;
    }
    return true;
  }, r = () => Array.from(document.querySelectorAll("[id$='.grdPrdlstDtl']")).filter(t), s = () => {
    const o = r();
    return o.length < 2 ? o : o.filter((n) => {
      const d = n.getBoundingClientRect(), y = Math.max(0, d.left), q = Math.max(0, d.top), _ = Math.min(window.innerWidth, d.right), C = Math.min(window.innerHeight, d.bottom);
      return y >= _ || q >= C ? false : [0.1, 0.5, 0.9].some((I) => [0.1, 0.5, 0.9].some((U) => {
        const H = document.elementFromPoint(y + (_ - y) * I, q + (C - q) * U);
        return H !== null && n.contains(H);
      }));
    });
  }, p = s(), c = p.length === 1 ? p[0] : void 0, i = () => {
    const o = s();
    return o.length === 1 && o[0] === c;
  }, u = c?.id.slice(0, -13), a = u ? document.getElementById(u) : null, h = a?.querySelector("[id$='.divAuth2.form.btnRowAdit']");
  if (!c) return { kind: "failed", message: r().length > 1 ? "여러 품의 화면의 품목 표가 감지되어 입력 대상을 확정하지 못했습니다. 사용할 품의 화면 하나만 열어 주세요." : "품의등록 화면의 품목 표를 찾지 못했습니다. 품의등록 화면을 연 뒤 다시 실행해 주세요." };
  if (!a) return { kind: "failed", message: "품목 표의 입력 영역을 확인하지 못했습니다. 화면을 다시 열어 주세요." };
  if (!h) return { kind: "failed", message: "품목내역의 행추가 버튼을 찾지 못했습니다. 화면 구성을 확인해 주세요." };
  if (!t(h)) return { kind: "failed", message: "품목내역의 행추가 버튼이 숨겨져 있습니다. 편집 가능한 화면에서 실행해 주세요." };
  const A = (o) => new Promise((n) => window.setTimeout(n, o)), N = () => Array.from(c.querySelectorAll(".GridRowControl")).filter((o) => o.id.startsWith(`${c.id}.body.gridrow_`));
  if (N().length > 0) return { kind: "failed", message: "품목내역에 기존 행이 있습니다. 중복 입력 방지를 위해 중단했습니다. 빈 품목내역에서 실행해 주세요." };
  const g = a.querySelector("[id$='.grdBgtDtl']");
  if (!g || !Array.from(g.querySelectorAll(".GridRowControl")).some((o) => o.id.startsWith(`${g.id}.body.gridrow_`))) return { kind: "failed", message: "교사가 예산을 먼저 선택한 뒤 실행해 주세요." };
  if (![[3, "내용"], [5, "규격"], [6, "수량"], [7, "단위"], [8, "예상단가"], [9, "예상금액"]].every(([o, n]) => document.getElementById(`${c.id}.head.gridrow_-1.cell_-1_${o}`)?.textContent?.replace(/[\s*]/g, "") === n)) return { kind: "failed", message: "품목 열 구조가 달라 입력을 중단했습니다." };
  const S = () => ["running", "undo-running", "clear-running"].includes(c.dataset.draftHelperState ?? "");
  if (S()) return { kind: "failed", message: "품목 입력 또는 삭제가 진행 중입니다. 완료 후 다시 실행해 주세요." };
  const x = a.querySelector("[id$='.divAmt.form.mskDmndAmt:input']"), w = () => i() && t(c) && N().length === 0 && x?.value.trim().replace(/,/g, "") === "0";
  if (!w()) return { kind: "failed", message: "빈 품목내역과 요구금액 0원을 확인하지 못했습니다. 행을 모두 삭제한 뒤 다시 실행해 주세요." };
  if (await A(80), S() || !w()) return { kind: "failed", message: "품목내역 상태가 바뀌었습니다. 처리 완료 후 다시 확인해 주세요." };
  window.draftHelperUndoReceipt?.stop(), delete window.draftHelperUndoReceipt, delete window.draftHelperClearTarget;
  for (const o of ["draftHelperState", "draftHelperUndoCount", "draftHelperUndoTotal", "draftHelperUndoToken", "draftHelperUndoValid"]) delete c.dataset[o];
  const l = (o) => {
    o.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0, buttons: 1 })), o.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, button: 0 })), o.click();
  }, b = async (o) => {
    for (let n = 0; n < 25; n += 1) {
      if (o()) return true;
      await A(80);
    }
    return false;
  };
  let m = 0;
  const k = (o) => ({ kind: "failed", message: `${m}개 행 검증 후 중단: ${o} 추가된 행은 남아 있습니다. 저장하지 말고 확인해 주세요.` });
  c.dataset.draftHelperState = "running";
  let E = true;
  const $ = new AbortController(), f = () => {
    E = false, c.dataset.draftHelperUndoValid = "false", $.abort();
  };
  for (const o of ["pointerdown", "keydown", "input", "change", "wheel"]) document.addEventListener(o, (n) => {
    n.isTrusted && f();
  }, { capture: true, signal: $.signal });
  try {
    for (const [n, d] of e.entries()) {
      if (!i() || !t(c) || !t(h)) return k("입력 화면이 바뀌었습니다.");
      l(h);
      const y = (H, P) => {
        const R = H.id.slice(`${c.id}.body.gridrow_`.length);
        return document.getElementById(`${H.id}.cell_${R}_${P}`);
      }, q = () => {
        const H = N().filter((P) => y(P, 2)?.textContent?.trim() === String(n + 1));
        return H.length === 1 ? H[0] : void 0;
      };
      if (!await b(() => q() !== void 0)) return k("행추가를 확인하지 못했습니다.");
      const _ = (H) => {
        const P = q();
        return P ? y(P, H) : null;
      }, C = [[3, d.name], [5, d.specification], [6, String(d.quantity)], [8, String(d.unitPrice)]];
      for (const [H, P] of C) {
        if (H === 5 && P === "") continue;
        const R = _(H);
        if (!i() || !R || !t(R)) return k("입력할 셀을 확인하지 못했습니다.");
        if (l(R), !await b(() => document.activeElement instanceof HTMLInputElement && R.contains(document.activeElement))) return k("해당 셀의 활성 입력칸을 찾지 못했습니다.");
        const V = document.activeElement;
        if (!i() || !(V instanceof HTMLInputElement) || !R.contains(V)) return k("입력 포커스가 바뀌었습니다.");
        V.value = P, V.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: P })), V.dispatchEvent(new Event("change", { bubbles: true }));
      }
      const I = _(3);
      if (!I) return k("편집 확정 셀을 찾지 못했습니다.");
      l(I);
      const U = (H) => Number(_(H)?.textContent?.replace(/,/g, "").trim());
      if (!await b(() => U(6) === d.quantity && U(8) === d.unitPrice && U(9) === d.expectedAmount && _(3)?.textContent?.trim() === d.name && _(5)?.textContent?.trim() === d.specification)) return k("입력값 또는 자동계산 금액이 일치하지 않습니다.");
      m += 1;
    }
    c.dataset.draftHelperState = "completed", c.dataset.draftHelperUndoCount = String(m);
    const o = crypto.randomUUID();
    return c.dataset.draftHelperUndoToken = o, c.dataset.draftHelperUndoTotal = String(e.reduce((n, d) => n + d.expectedAmount, 0)), c.dataset.draftHelperUndoValid = String(E), window.draftHelperUndoReceipt = { grid: c, token: o, count: m, total: e.reduce((n, d) => n + d.expectedAmount, 0), isValid: () => E && c.isConnected, stop: f }, { kind: "filled", count: m, undoToken: o };
  } catch (o) {
    if (o instanceof Error) return k("입력 처리 중 오류가 발생했습니다.");
    throw o;
  } finally {
    c.dataset.draftHelperState === "running" && (c.dataset.draftHelperState = "stopped", f());
  }
}
async function oe(e = "") {
  const t = (f) => {
    if (!f.isConnected || f.getClientRects().length === 0) return false;
    for (let o = f; o; o = o.parentElement) {
      const n = getComputedStyle(o);
      if (n.display === "none" || n.visibility === "hidden") return false;
    }
    return true;
  }, r = (f, o = "") => ({ kind: "grid_status", gridState: f, clearToken: o }), s = (f) => ({ kind: "failed", message: f }), p = () => Array.from(document.querySelectorAll("[id$='.grdPrdlstDtl']")).filter(t), c = () => {
    const f = p();
    return f.length < 2 ? f : f.filter((o) => {
      const n = o.getBoundingClientRect(), d = Math.max(0, n.left), y = Math.max(0, n.top), q = Math.min(window.innerWidth, n.right), _ = Math.min(window.innerHeight, n.bottom);
      return d >= q || y >= _ ? false : [0.1, 0.5, 0.9].some((C) => [0.1, 0.5, 0.9].some((I) => {
        const U = document.elementFromPoint(d + (q - d) * C, y + (_ - y) * I);
        return U !== null && o.contains(U);
      }));
    });
  }, i = c(), u = i.length === 1 ? i[0] : void 0, a = () => {
    const f = c();
    return f.length === 1 && f[0] === u;
  }, h = u ? document.getElementById(u.id.slice(0, -13)) : null, A = h?.querySelector("[id$='.divAmt.form.mskDmndAmt:input']");
  if (!u || !h || !A || ![[3, "내용"], [5, "규격"], [6, "수량"], [7, "단위"], [8, "예상단가"], [9, "예상금액"]].every(([f, o]) => document.getElementById(`${u.id}.head.gridrow_-1.cell_-1_${f}`)?.textContent?.replace(/[\s*]/g, "") === o)) return e ? s("품목내역과 요구금액을 확인하지 못했습니다. 품의등록 화면을 확인해 주세요.") : r("unavailable");
  const g = () => Array.from(u.querySelectorAll(".GridRowControl")).filter((f) => f.id.startsWith(`${u.id}.body.gridrow_`)), v = () => {
    const f = A.value.trim();
    if (!/^\d+(?:,\d{3})*$/.test(f)) return null;
    const o = Number(f.replace(/,/g, ""));
    return Number.isSafeInteger(o) ? o : null;
  }, S = () => ["running", "undo-running", "clear-running"].includes(u.dataset.draftHelperState ?? ""), x = () => {
    window.draftHelperUndoReceipt?.stop(), delete window.draftHelperUndoReceipt, delete window.draftHelperClearTarget;
    for (const f of ["draftHelperState", "draftHelperUndoCount", "draftHelperUndoTotal", "draftHelperUndoToken", "draftHelperUndoValid"]) delete u.dataset[f];
  }, w = window.draftHelperClearTarget;
  if (e && (w?.grid !== u || w.token !== e)) return s("확인했던 품목내역이 바뀌었습니다. 팝업을 다시 열어 삭제 대상을 확인해 주세요.");
  const l = () => a() && t(u) && g().length === 0 && v() === 0, b = () => new Promise((f) => window.setTimeout(f, 80));
  if (S()) return e ? s("품목 입력 또는 삭제가 진행 중입니다. 완료 후 다시 확인해 주세요.") : r("busy");
  if (l()) {
    if (await b(), S()) return e ? s("품목 처리 중입니다. 완료 후 다시 확인해 주세요.") : r("busy");
    if (l()) return x(), e ? { kind: "items_cleared" } : r("empty");
  }
  if (g().length === 0 || v() === null) return e ? s("품목과 요구금액의 갱신이 끝나지 않았습니다. 다시 확인해 주세요.") : r("unavailable");
  const m = h.querySelector("[id$='.divAuth2.form.btnAuthRDelRow']"), k = u.querySelector("[id$='.head.gridrow_-1.cell_-1_0.cellcheckbox']"), E = `${A.value}
${u.textContent ?? ""}`;
  if (!e) {
    if (!m || !k || !t(m) || !t(k)) return r("occupied");
    const f = window.draftHelperClearTarget, o = f?.grid === u && f.snapshot === E ? f.token : crypto.randomUUID();
    return window.draftHelperClearTarget = { grid: u, token: o, snapshot: E }, r("occupied", o);
  }
  if (!w || w.grid !== u || w.token !== e || w.snapshot !== E || !m || !k || !t(m) || !t(k)) return s("확인했던 품목내역이 바뀌었습니다. 팝업을 다시 열어 삭제 대상을 확인해 주세요.");
  const $ = (f) => {
    f.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0, buttons: 1 })), f.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, button: 0 })), f.click();
  };
  u.dataset.draftHelperState = "clear-running", window.draftHelperUndoReceipt?.stop(), delete window.draftHelperClearTarget;
  try {
    if (k.getAttribute("aria-checked") === "true" && $(k), $(k), k.getAttribute("aria-checked") !== "true") return s("품목 전체 선택을 확인하지 못했습니다. 삭제는 실행하지 않았습니다.");
    if (!a()) return s("품의 화면이 바뀌어 삭제를 중단했습니다. 삭제 대상을 다시 확인해 주세요.");
    $(m);
    for (let f = 0; f < 25; f += 1) {
      if (l() && (await b(), l())) return x(), { kind: "items_cleared" };
      await b();
    }
    return s("삭제 완료를 확인하지 못했습니다. 품목내역과 요구금액을 직접 확인해 주세요.");
  } finally {
    u.dataset.draftHelperState === "clear-running" && (u.dataset.draftHelperState = "stopped");
  }
}
async function Ee(e, t = "") {
  const r = (l) => {
    if (!l.isConnected || l.getClientRects().length === 0) return false;
    for (let b = l; b; b = b.parentElement) {
      const m = getComputedStyle(b);
      if (m.display === "none" || m.visibility === "hidden") return false;
    }
    return true;
  }, s = () => Array.from(document.querySelectorAll("[id$='.grdPrdlstDtl']")).filter(r), p = () => {
    const l = s();
    return l.length < 2 ? l : l.filter((b) => {
      const m = b.getBoundingClientRect(), k = Math.max(0, m.left), E = Math.max(0, m.top), $ = Math.min(window.innerWidth, m.right), f = Math.min(window.innerHeight, m.bottom);
      return k >= $ || E >= f ? false : [0.1, 0.5, 0.9].some((o) => [0.1, 0.5, 0.9].some((n) => {
        const d = document.elementFromPoint(k + ($ - k) * o, E + (f - E) * n);
        return d !== null && b.contains(d);
      }));
    });
  }, c = p(), i = c.length === 1 ? c[0] : void 0, u = () => {
    const l = p();
    return l.length === 1 && l[0] === i;
  }, a = window.draftHelperUndoReceipt, h = Number(i?.dataset.draftHelperUndoCount), A = a !== void 0 && a.grid === i && a.count === h && i?.dataset.draftHelperState === "completed" && Number.isSafeInteger(h) && h > 0;
  if (!e) return { kind: "undo_status", count: A && a?.isValid() && i?.dataset.draftHelperUndoValid === "true" && a.token === i.dataset.draftHelperUndoToken ? h : 0, undoToken: A && a?.isValid() && i?.dataset.draftHelperUndoValid === "true" && a.token === i.dataset.draftHelperUndoToken ? a.token : "" };
  if (!i || !a?.isValid() || a.token !== t || !A || !t || i.dataset.draftHelperUndoToken !== t || i.dataset.draftHelperUndoValid !== "true") return { kind: "failed", message: "자동 입력 직후의 변경되지 않은 화면에서만 되돌릴 수 있습니다. 품목을 직접 확인해 주세요." };
  const N = document.getElementById(i.id.slice(0, -13)), g = N?.querySelector("[id$='.divAuth2.form.btnAuthRDelRow']"), v = i.querySelector("[id$='.head.gridrow_-1.cell_-1_0.cellcheckbox']"), S = N?.querySelector("[id$='.divAmt.form.mskDmndAmt:input']"), x = a.total;
  if (!N || !g || !v || !S || !r(g) || !r(v) || !Number.isSafeInteger(x) || x <= 0 || Number(S.value.replace(/,/g, "")) !== x) return { kind: "failed", message: "품목 삭제 영역 또는 요구금액을 확인하지 못해 되돌리기를 중단했습니다." };
  const w = (l) => {
    l.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0, buttons: 1 })), l.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, button: 0 })), l.click();
  };
  i.dataset.draftHelperState = "undo-running", a.stop(), i.dataset.draftHelperUndoValid = "false";
  try {
    if (v.getAttribute("aria-checked") === "true" && w(v), w(v), v.getAttribute("aria-checked") !== "true") return { kind: "failed", message: "품목 전체 선택을 확인하지 못했습니다. 삭제는 실행하지 않았습니다." };
    if (!u()) return { kind: "failed", message: "품의 화면이 바뀌어 되돌리기를 중단했습니다. 품목을 직접 확인해 주세요." };
    w(g);
    for (let l = 0; l < 25; l += 1) {
      const b = Array.from(i.querySelectorAll(".GridRowControl")).filter((m) => m.id.startsWith(`${i.id}.body.gridrow_`));
      if (u() && i.isConnected && r(i) && b.length === 0 && Number(S.value.replace(/,/g, "")) === 0) return delete i.dataset.draftHelperState, delete i.dataset.draftHelperUndoCount, delete i.dataset.draftHelperUndoTotal, delete i.dataset.draftHelperUndoToken, delete window.draftHelperUndoReceipt, { kind: "undone" };
      await new Promise((m) => window.setTimeout(m, 80));
    }
    return { kind: "failed", message: "행 삭제 완료를 확인하지 못했습니다. 재실행하지 말고 품목과 요구금액을 확인해 주세요." };
  } finally {
    i.dataset.draftHelperState === "undo-running" && (i.dataset.draftHelperState = "stopped");
  }
}
const Ce = z("kind", [D({ kind: G("filled"), count: re().int().positive(), undoToken: M().optional() }), D({ kind: G("failed"), message: M().min(1) })]);
class J extends Error {
  constructor(t) {
    super(`Unexpected message kind: ${t}`), this.messageKind = t;
  }
  messageKind;
  name = "UnexpectedMessageError";
}
async function He(e) {
  return (await chrome.tabs.query({ active: true, ...e === void 0 ? { currentWindow: true } : { windowId: e } }))[0] ?? null;
}
async function Y() {
  const e = await chrome.storage.session.get("draft"), t = ae.safeParse(e.draft);
  return t.success ? t.data : null;
}
async function Te(e) {
  const t = te(), r = await Y(), s = ie(e?.url);
  let p = "unavailable", c = "";
  if (s === "kedufine" && e?.id !== void 0) {
    const i = await chrome.scripting.executeScript({ target: { tabId: e.id }, func: oe, args: [] }), u = D({ kind: G("grid_status"), gridState: fe, clearToken: M() }).safeParse(i[0]?.result);
    u.success && (p = u.data.gridState, c = u.data.clearToken);
  }
  return { kind: "context", operationPending: t || te(), draft: r, surface: s, gridState: p, clearToken: c, ...e?.id === void 0 ? {} : { tabId: e.id }, tabAccess: e?.url === void 0 ? "required" : /^https?:\/\//.test(e.url) ? "granted" : "restricted" };
}
async function $e(e) {
  const t = await Y();
  if (t === null) return { kind: "failure", message: "먼저 쇼핑몰 장바구니에서 선택상품을 가져와 주세요." };
  if (e?.id === void 0 || !X(e.url)) return { kind: "failure", message: "K-에듀파인 품의등록 탭을 연 뒤 다시 시도해 주세요." };
  const r = await chrome.scripting.executeScript({ target: { tabId: e.id }, func: Ne, args: [t.items] }), s = Ce.safeParse(r[0]?.result);
  return s.success ? s.data.kind === "failed" ? { kind: "failure", message: s.data.message } : { kind: "filled", count: s.data.count, undoToken: s.data.undoToken ?? "", message: `${s.data.count}개 품목 행을 추가하고 입력했습니다. 저장과 결재요청은 실행하지 않았습니다.` } : { kind: "failure", message: "K-에듀파인 품목내역 입력 결과를 확인하지 못했습니다." };
}
async function Ie() {
  return await chrome.storage.session.remove("draft"), { kind: "cleared" };
}
async function Ue(e, t) {
  const r = await Y();
  if (r === null) return { kind: "failure", message: "먼저 상품을 다시 가져와 주세요." };
  if (t !== void 0 && !r.sourceItems.some((c) => c.id === t)) return { kind: "failure", message: "조정할 품목을 찾지 못했습니다. 상품을 다시 가져와 주세요." };
  const s = me(r.sourceItems, e), p = ae.safeParse({ ...r, items: t === void 0 ? s : r.items.map((c) => c.id === t ? s.find((i) => i.id === t) : c), roundingStep: e });
  return !p.success || !Number.isSafeInteger(p.data.items.reduce((c, i) => c + i.expectedAmount, 0)) ? { kind: "failure", message: "올림 금액이 너무 큽니다. 수량과 단가를 확인해 주세요." } : (await chrome.storage.session.set({ draft: p.data }), { kind: "draft_updated", draft: p.data });
}
async function Pe(e) {
  const t = de.safeParse(e);
  return t.success ? ge(t.data, async () => {
    const r = await He(t.data.windowId);
    if (t.data.tabId !== void 0 && t.data.tabId !== r?.id) return { kind: "failure", message: "현재 탭이 바뀌었습니다. 새 탭을 확인한 뒤 다시 실행해 주세요." };
    switch (t.data.kind) {
      case "read_context":
        return Te(r);
      case "capture_cart_selection":
        return _e(r);
      case "fill_kedufine_items":
        return $e(r);
      case "undo_kedufine_items": {
        if (r?.id === void 0 || !X(r.url)) return { kind: "failure", message: "입력했던 K-에듀파인 탭에서 실행해 주세요." };
        const s = await chrome.scripting.executeScript({ target: { tabId: r.id }, func: Ee, args: [true, t.data.undoToken] }), p = z("kind", [D({ kind: G("undone") }), D({ kind: G("failed"), message: M() })]).safeParse(s[0]?.result);
        if (!p.success) return { kind: "failure", message: "되돌리기 결과를 확인하지 못했습니다. 품의서를 확인해 주세요." };
        switch (p.data.kind) {
          case "undone":
            return { kind: "undone", message: "입력한 품목을 되돌렸습니다. 예산과 가져온 목록은 유지했습니다. 저장·결재는 실행하지 않았습니다." };
          case "failed":
            return { kind: "failure", message: p.data.message };
          default:
            throw new J(p.data);
        }
      }
      case "clear_kedufine_items": {
        if (r?.id === void 0 || !X(r.url)) return { kind: "failure", message: "K-에듀파인 품의등록 탭에서 실행해 주세요." };
        const s = await chrome.scripting.executeScript({ target: { tabId: r.id }, func: oe, args: [t.data.clearToken] }), p = z("kind", [D({ kind: G("items_cleared") }), D({ kind: G("failed"), message: M().min(1) })]).safeParse(s[0]?.result);
        if (!p.success) return { kind: "failure", message: "품목내역 삭제 결과를 확인하지 못했습니다. 품의서를 확인해 주세요." };
        switch (p.data.kind) {
          case "items_cleared":
            return { kind: "items_cleared", message: "품목내역을 비웠습니다. 제목·개요·예산과 불러온 상품은 유지했습니다." };
          case "failed":
            return { kind: "failure", message: p.data.message };
          default:
            throw new J(p.data);
        }
      }
      case "clear_draft":
        return Ie();
      case "round_prices":
        return Ue(t.data.step, t.data.itemId);
      default:
        throw new J(t.data);
    }
  }) : { kind: "failure", message: "확장 프로그램 요청 형식을 확인하지 못했습니다." };
}
// 데이터취합 화면의 {cmd} 메시지는 gmh-background.js 몫이라 여기서는 답하지 않는다.
chrome.runtime.onMessage.addListener((e, t, r) => {
  if (e !== null && typeof e === "object" && typeof e.cmd === "string") return false;
  Pe(e).then(r).catch((s) => {
  const p = s instanceof Error ? s.message : "확장 프로그램 처리 중 오류가 발생했습니다.";
  r({ kind: "failure", message: p });
  });
  return true;
});
