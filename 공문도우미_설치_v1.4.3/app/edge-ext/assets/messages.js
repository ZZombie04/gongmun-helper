/* =============================================================================
 * 공문 도우미 — 장바구니 품의: 공용 모듈
 *   메시지 형식 · 쇼핑몰 주소 판별 · 장바구니 상품 정리 · 금액 계산.
 *   옆 패널(assets/popup.js)과 백그라운드(pumui-background.js)가 함께 쓴다.
 *   형식 검사는 Zod(MIT, THIRD-PARTY-NOTICES.txt)로 한다.
 * ========================================================================== */
function Pt(e7) {
  const t = Object.values(e7).filter((r) => typeof r == "number");
  return Object.entries(e7).filter(([r, o]) => t.indexOf(+r) === -1).map(([r, o]) => o);
}
function Xe(e7, t = "|") {
  return e7.map((n) => Nt(n)).join(t);
}
function Ze(e7, t) {
  return typeof t == "bigint" ? t.toString() : t;
}
function he(e7) {
  return { get value() {
    {
      const t = e7();
      return Object.defineProperty(this, "value", { value: t }), t;
    }
  } };
}
function On(e7) {
  return e7 == null;
}
function De(e7) {
  const t = e7.startsWith("^") ? 1 : 0, n = e7.endsWith("$") ? e7.length - 1 : e7.length;
  return e7.slice(t, n);
}
function Sn(e7, t) {
  const n = e7 / t, r = Math.round(n), o = 4 * Number.EPSILON * Math.max(Math.abs(n), 1);
  return Math.abs(n - r) < o ? 0 : n - r;
}
function T(e7, t, n) {
  Object.defineProperty(e7, t, { value: n, writable: true, enumerable: true, configurable: true });
}
function M(...e7) {
  const t = {};
  for (const n of e7) {
    const r = Object.getOwnPropertyDescriptors(n);
    Object.assign(t, r);
  }
  return Object.defineProperties({}, t);
}
function Zn(e7) {
  return JSON.stringify(e7);
}
function In(e7) {
  return e7.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
const Tt = "captureStackTrace" in Error ? Error.captureStackTrace : (...e7) => {
};
function te(e7) {
  return typeof e7 == "object" && e7 !== null && !Array.isArray(e7);
}
const En = he(() => {
  if (C.jitless || typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare")) return false;
  try {
    const e7 = Function;
    return new e7(""), true;
  } catch {
    return false;
  }
});
function ne(e7) {
  if (te(e7) === false) return false;
  const t = e7.constructor;
  if (t === void 0 || typeof t != "function") return true;
  const n = t.prototype;
  return !(te(n) === false || Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") === false);
}
function At(e7) {
  return ne(e7) ? { ...e7 } : Array.isArray(e7) ? [...e7] : e7 instanceof Map ? new Map(e7) : e7 instanceof Set ? new Set(e7) : e7;
}
const Pn = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function W(e7) {
  return e7.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function L(e7, t, n) {
  const r = new e7._zod.constr(t ?? e7._zod.def);
  return (!t || n?.parent) && (r._zod.parent = e7), r;
}
function m(e7) {
  const t = e7;
  if (!t) return {};
  if (typeof t == "string") return { error: () => t };
  if (t?.message !== void 0) {
    if (t?.error !== void 0) throw new Error("Cannot specify both `message` and `error` params");
    t.error = t.message;
  }
  return delete t.message, typeof t.error == "string" ? { ...t, error: () => t.error } : t;
}
function Nt(e7) {
  return typeof e7 == "bigint" ? e7.toString() + "n" : typeof e7 == "string" ? `"${e7}"` : `${e7}`;
}
function Tn(e7) {
  return Object.keys(e7).filter((t) => e7[t]._zod.optin !== void 0 && e7[t]._zod.optout === "optional");
}
const An = { safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER], int32: [-2147483648, 2147483647], uint32: [0, 4294967295], float32: [-34028234663852886e22, 34028234663852886e22], float64: [-Number.MAX_VALUE, Number.MAX_VALUE] };
function Nn(e7, t) {
  const n = e7._zod.def, r = n.checks;
  if (r && r.length > 0) throw new Error(".pick() cannot be used on object schemas containing refinements");
  const i = M(e7._zod.def, { get shape() {
    const s = {};
    for (const c of Reflect.ownKeys(t)) {
      if (!Object.prototype.hasOwnProperty.call(n.shape, c)) throw new Error(`Unrecognized key: "${String(c)}"`);
      t[c] && T(s, c, n.shape[c]);
    }
    return T(this, "shape", s), s;
  }, checks: [] });
  return L(e7, i);
}
function jn(e7, t) {
  const n = e7._zod.def, r = n.checks;
  if (r && r.length > 0) throw new Error(".omit() cannot be used on object schemas containing refinements");
  const i = M(e7._zod.def, { get shape() {
    const s = { ...e7._zod.def.shape };
    for (const c of Reflect.ownKeys(t)) {
      if (!Object.prototype.hasOwnProperty.call(n.shape, c)) throw new Error(`Unrecognized key: "${String(c)}"`);
      t[c] && delete s[c];
    }
    return T(this, "shape", s), s;
  }, checks: [] });
  return L(e7, i);
}
function Dn(e7, t) {
  if (!ne(t)) throw new Error("Invalid input to extend: expected a plain object");
  const n = e7._zod.def.checks;
  if (n && n.length > 0) {
    const i = e7._zod.def.shape;
    for (const s of Reflect.ownKeys(t)) if (Object.getOwnPropertyDescriptor(i, s) !== void 0) throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
  }
  const o = M(e7._zod.def, { get shape() {
    const i = { ...e7._zod.def.shape, ...t };
    return T(this, "shape", i), i;
  } });
  return L(e7, o);
}
function Rn(e7, t) {
  if (!ne(t)) throw new Error("Invalid input to safeExtend: expected a plain object");
  const n = M(e7._zod.def, { get shape() {
    const r = { ...e7._zod.def.shape, ...t };
    return T(this, "shape", r), r;
  } });
  return L(e7, n);
}
function Cn(e7, t) {
  if (!t?._zod?.def) throw new Error("Invalid input to merge: expected an object schema. To merge a plain shape, use `.extend()`.");
  if (e7._zod.def.checks?.length) throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
  const n = M(e7._zod.def, { get shape() {
    const r = { ...e7._zod.def.shape, ...t._zod.def.shape };
    return T(this, "shape", r), r;
  }, get catchall() {
    return t._zod.def.catchall;
  }, checks: t._zod.def.checks ?? [] });
  return L(e7, n);
}
function He(e7, t, n, r = "partial") {
  const i = t._zod.def.checks;
  if (i && i.length > 0) throw new Error(`.${r}() cannot be used on object schemas containing refinements`);
  const c = M(t._zod.def, { get shape() {
    const u = t._zod.def.shape, a = { ...u };
    if (n) for (const l of Reflect.ownKeys(n)) {
      if (!Object.prototype.hasOwnProperty.call(u, l)) throw new Error(`Unrecognized key: "${String(l)}"`);
      n[l] && (a[l] = e7 ? new e7({ type: "optional", innerType: u[l] }) : u[l]);
    }
    else for (const l of Reflect.ownKeys(u)) a[l] = e7 ? new e7({ type: "optional", innerType: u[l] }) : u[l];
    return T(this, "shape", a), a;
  }, checks: [] });
  return L(t, c);
}
function xn(e7, t, n) {
  const r = M(t._zod.def, { get shape() {
    const o = t._zod.def.shape, i = { ...o };
    if (n) for (const s of Reflect.ownKeys(n)) {
      if (!Object.prototype.hasOwnProperty.call(i, s)) throw new Error(`Unrecognized key: "${String(s)}"`);
      n[s] && (i[s] = new e7({ type: "nonoptional", innerType: o[s] }));
    }
    else for (const s of Reflect.ownKeys(o)) i[s] = new e7({ type: "nonoptional", innerType: o[s] });
    return T(this, "shape", i), i;
  } });
  return L(t, r);
}
function K(e7, t = 0) {
  if (e7.aborted === true) return true;
  for (let n = t; n < e7.issues.length; n++) if (e7.issues[n]?.continue !== true) return true;
  return false;
}
function Un(e7, t = 0) {
  if (e7.aborted === true) return true;
  for (let n = t; n < e7.issues.length; n++) if (e7.issues[n]?.continue === false) return true;
  return false;
}
function jt(e7, t) {
  return t.map((n) => {
    var r;
    return (r = n).path ?? (r.path = []), n.path.unshift(e7), n;
  });
}
function X(e7) {
  return typeof e7 == "string" ? e7 : e7?.message;
}
function Qe(e7, t, n) {
  var r;
  for (let o = t; o < e7.length; o++) (r = e7[o]).schema ?? (r.schema = n);
}
function q(e7, t, n) {
  var r;
  const o = e7.inst?._zod?.traits;
  o?.has("$ZodType") && (o.has("$ZodCheck") ? (r = e7).schema ?? (r.schema = e7.inst) : e7.schema = e7.inst);
  const i = e7.schema !== e7.inst ? e7.schema?._zod.def?.error : void 0, s = e7.message ? e7.message : X(e7.inst?._zod.def?.error?.(e7)) ?? X(i?.(e7)) ?? X(t?.error?.(e7)) ?? X(n.customError?.(e7)) ?? X(n.localeError?.(e7)) ?? "Invalid input", { inst: c, schema: u, continue: a, input: l, ...d } = e7;
  return d.path ?? (d.path = []), d.message = s, t?.reportInput && (d.input = l), d;
}
const Fn = /[\uD800-\uDBFF]/;
function Re(e7) {
  const t = e7.length;
  if (!Fn.test(e7)) return t;
  let n = t;
  for (let r = 0; r < t - 1; r++) (e7.charCodeAt(r) & 64512) === 55296 && (e7.charCodeAt(r + 1) & 64512) === 56320 && (n--, r++);
  return n;
}
function Ce(e7) {
  return Array.isArray(e7) ? "array" : typeof e7 == "string" ? "string" : "unknown";
}
function Mn(e7) {
  const t = typeof e7;
  switch (t) {
    case "number":
      return Number.isNaN(e7) ? "nan" : "number";
    case "object": {
      if (e7 === null) return "null";
      if (Array.isArray(e7)) return "array";
      const n = e7;
      if (n && Object.getPrototypeOf(n) !== Object.prototype && "constructor" in n && n.constructor) return n.constructor.name;
    }
  }
  return t;
}
function re(...e7) {
  const [t, n, r] = e7;
  return typeof t == "string" ? { message: t, code: "custom", input: n, inst: r } : { ...t };
}
function Ln(e7, t) {
  for (const n in t) {
    const r = Object.getOwnPropertyDescriptor(t, n);
    r.get ? Object.defineProperty(e7, n, { ...r, enumerable: false }) : Jn(e7, n, r.value);
  }
}
function G(e7, t, n, r = true) {
  return Object.defineProperty(e7, t, { configurable: true, writable: true, enumerable: r, value: n }), n;
}
function Dt(e7, t, n) {
  return G(e7, t, n, false);
}
function Jn(e7, t, n) {
  Object.defineProperty(e7, t, { configurable: true, get() {
    return this == null ? n : G(this, t, n.bind(this));
  }, set(r) {
    G(this, t, r);
  } });
}
function Vn(e7, t) {
  const n = Object.getPrototypeOf(e7);
  return t in n ? void 0 : n;
}
let ye, U = false;
const Kn = { configurable: true, get() {
  U = true;
} };
function y(e7, t, n) {
  const r = Object.getPrototypeOf(e7._zod);
  if (t in r && ye !== e7._zod) {
    ye = void 0;
    return;
  }
  ye = e7._zod, Object.defineProperty(r, t, { configurable: true, get() {
    Object.defineProperty(this, t, Kn);
    const o = U;
    U = false;
    try {
      const i = n(this);
      return U ? delete this[t] : Object.defineProperty(this, t, { configurable: true, writable: true, value: i }), U = U || o, i;
    } catch (i) {
      throw delete this[t], U = U || o, i;
    }
  }, set(o) {
    Object.defineProperty(this, t, { configurable: true, writable: true, value: o });
  } });
}
function Bn(e7, t, n, r) {
  const o = Vn(e7, t);
  o && Object.defineProperty(o, t, { configurable: true, get() {
    const i = { configurable: true, writable: true, enumerable: r, value: void 0 };
    return Object.defineProperty(this, t, i), i.value = n(this), Object.defineProperty(this, t, i), i.value;
  }, set(i) {
    Object.defineProperty(this, t, { configurable: true, writable: true, enumerable: r, value: i });
  } });
}
const Wn = "~constantCatch";
function Gn(e7) {
  const t = () => e7;
  return t[Wn] = true, t;
}
var et;
const we = { value: void 0, enumerable: false };
let tt = "captureStackTrace" in Error ? Error : null;
function qn(e7) {
  const t = tt;
  if (t) {
    const n = t.stackTraceLimit;
    if (typeof n == "number") {
      try {
        t.stackTraceLimit = 0;
      } catch {
        return tt = null, new e7();
      }
      try {
        return new e7();
      } finally {
        t.stackTraceLimit = n;
      }
    }
  }
  return new e7();
}
function f(e7, t, n, r) {
  const o = {};
  function i(p) {
    this.def = p, this.constr = d, this.traits = /* @__PURE__ */ new Set();
  }
  i.prototype = o;
  const s = n, c = s && /* @__PURE__ */ new WeakSet();
  function u(p, h) {
    if (!p._zod) {
      we.value = new i(h);
      try {
        Object.defineProperty(p, "_zod", we);
      } finally {
        we.value = void 0;
      }
    }
    if (p._zod.traits.has(e7)) return;
    if (p._zod.traits.add(e7), t(p, h), c) {
      const b = Object.getPrototypeOf(p), v = p._zod.constr.prototype;
      let j = b;
      for (; j && j !== v; ) j = Object.getPrototypeOf(j);
      const x = j ?? b;
      c.has(x) || (c.add(x), Ln(x, s));
    }
    const g = d.prototype;
    for (const b in g) Object.prototype.hasOwnProperty.call(g, b) && (b in p || (p[b] = g[b].bind(p)));
  }
  const a = r?.Parent ?? Object;
  class l extends a {
  }
  Object.defineProperty(l, "name", { value: e7 });
  function d(p) {
    const h = r?.Parent ? qn(l) : this;
    u(h, p);
    const g = h._zod.deferred;
    if (g) {
      for (const v of g) v();
      h._zod.deferred = void 0;
    }
    const b = globalThis.__zod_globalConfig?.postProcessor;
    return b && b(h), h;
  }
  return Object.defineProperty(d, "init", { value: u }), Object.defineProperty(d, Symbol.hasInstance, { value: (p) => r?.Parent && p instanceof r.Parent ? true : p?._zod?.traits?.has(e7) }), Object.defineProperty(d, "name", { value: e7 }), d;
}
class B extends Error {
  constructor() {
    super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
  }
}
class Rt extends Error {
  constructor(t) {
    super(`Encountered unidirectional transform during encode: ${t}`), this.name = "ZodEncodeError";
  }
}
(et = globalThis).__zod_globalConfig ?? (et.__zod_globalConfig = {});
const C = globalThis.__zod_globalConfig;
function J(e7) {
  return e7 && Object.assign(C, e7), C;
}
function Yn() {
  const e7 = this._zod;
  return e7.message ?? (e7.message = JSON.stringify(e7.def, Ze, 2)), e7.message;
}
function Xn(e7) {
  this._zod.message = e7;
}
const Hn = { get: Yn, set: Xn, enumerable: true, configurable: true }, ze = { value: void 0, enumerable: false }, ke = { value: void 0, enumerable: false }, nt = new WeakSet([Object.prototype, Error.prototype]), Ct = (e7, t) => {
  e7.name = "$ZodError", ze.value = e7._zod, Object.defineProperty(e7, "_zod", ze), ke.value = t, Object.defineProperty(e7, "issues", ke), ze.value = void 0, ke.value = void 0, Object.defineProperty(e7, "message", Hn);
  const n = Object.getPrototypeOf(e7);
  nt.has(n) || (nt.add(n), Object.defineProperty(n, "toString", { configurable: true, enumerable: false, get() {
    const r = () => this.message;
    return Object.defineProperty(this, "toString", { value: r, configurable: true, writable: true }), r;
  }, set(r) {
    Object.defineProperty(this, "toString", { value: r, configurable: true, writable: true });
  } }));
}, xt = f("$ZodError", Ct), Ut = f("$ZodError", Ct, void 0, { Parent: Error });
function Qn(e7, t, n) {
  return Object.prototype.hasOwnProperty.call(e7, t) || (t === "__proto__" ? Object.defineProperty(e7, t, { value: n(), writable: true, enumerable: true, configurable: true }) : e7[t] = n()), e7[t];
}
function er(e7, t = (n) => n.message) {
  const n = {}, r = [];
  for (const o of e7.issues) o.path.length > 0 ? Qn(n, o.path[0], () => []).push(t(o)) : r.push(t(o));
  return { formErrors: r, fieldErrors: n };
}
function tr(e7, t = (n) => n.message) {
  const n = { _errors: [] }, r = (o, i = []) => {
    for (const s of o.issues) if (s.code === "invalid_union" && s.errors.length) s.errors.map((c) => r({ issues: c }, [...i, ...s.path]));
    else if (s.code === "invalid_key") r({ issues: s.issues }, [...i, ...s.path]);
    else if (s.code === "invalid_element") r({ issues: s.issues }, [...i, ...s.path]);
    else {
      const c = [...i, ...s.path];
      if (c.length === 0) n._errors.push(t(s));
      else {
        let u = n, a = 0;
        for (; a < c.length; ) {
          const l = c[a], d = a === c.length - 1;
          if (l === "_errors") {
            d && u._errors.push(t(s)), a++;
            continue;
          }
          Object.prototype.hasOwnProperty.call(u, l) || Object.defineProperty(u, l, { value: { _errors: [] }, enumerable: true, writable: true, configurable: true });
          const p = u[l];
          d && p._errors.push(t(s)), u = p, a++;
        }
      }
    }
  };
  return r(e7), n;
}
function me(e7, t) {
  return { callee: t?.callee ?? e7, Err: t?.Err };
}
const xe = (e7) => {
  const t = (n, r, o, i) => {
    const s = o ? { ...o, async: false } : { async: false }, c = n._zod.run({ value: r, issues: [] }, s);
    if (c instanceof Promise) throw new B();
    if (c.issues.length) {
      const u = new (i?.Err ?? e7)(c.issues.map((a) => q(a, s, J())));
      throw Tt(u, i?.callee ?? t), u;
    }
    return c.value;
  };
  return t;
}, Ue = (e7) => {
  const t = async (n, r, o, i) => {
    const s = o ? { ...o, async: true } : { async: true };
    let c = n._zod.run({ value: r, issues: [] }, s);
    if (c instanceof Promise && (c = await c), c.issues.length) {
      const u = new (i?.Err ?? e7)(c.issues.map((a) => q(a, s, J())));
      throw Tt(u, i?.callee ?? t), u;
    }
    return c.value;
  };
  return t;
}, ge = (e7) => (t, n, r) => {
  const o = r ? { ...r, async: false } : { async: false }, i = t._zod.run({ value: n, issues: [] }, o);
  if (i instanceof Promise) throw new B();
  return i.issues.length ? { success: false, error: new (e7 ?? xt)(i.issues.map((s) => q(s, o, J()))) } : { success: true, data: i.value };
}, nr = ge(Ut), _e = (e7) => async (t, n, r) => {
  const o = r ? { ...r, async: true } : { async: true };
  let i = t._zod.run({ value: n, issues: [] }, o);
  return i instanceof Promise && (i = await i), i.issues.length ? { success: false, error: new e7(i.issues.map((s) => q(s, o, J()))) } : { success: true, data: i.value };
}, rr = _e(Ut), or = (e7) => {
  const t = xe(e7), n = (r, o, i, s) => {
    const c = i ? { ...i, direction: "backward" } : { direction: "backward" };
    return t(r, o, c, me(n, s));
  };
  return n;
}, ir = (e7) => {
  const t = xe(e7), n = (r, o, i, s) => t(r, o, i, me(n, s));
  return n;
}, sr = (e7) => {
  const t = Ue(e7), n = async (r, o, i, s) => {
    const c = i ? { ...i, direction: "backward" } : { direction: "backward" };
    return await t(r, o, c, me(n, s));
  };
  return n;
}, cr = (e7) => {
  const t = Ue(e7), n = async (r, o, i, s) => await t(r, o, i, me(n, s));
  return n;
}, ur = (e7) => (t, n, r) => {
  const o = r ? { ...r, direction: "backward" } : { direction: "backward" };
  return ge(e7)(t, n, o);
}, ar = (e7) => (t, n, r) => ge(e7)(t, n, r), fr = (e7) => async (t, n, r) => {
  const o = r ? { ...r, direction: "backward" } : { direction: "backward" };
  return _e(e7)(t, n, o);
}, lr = (e7) => async (t, n, r) => _e(e7)(t, n, r), dr = /^[cC][0-9a-z]{6,}$/, pr = /^[0-9a-z]+$/, hr = /^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$/, mr = /^[0-9a-vA-V]{20}$/, gr = /^[A-Za-z0-9]{27}$/, _r = /^[a-zA-Z0-9_-]{21}$/;
function vr(e7) {
  return new RegExp(`^[a-zA-Z0-9_-]{${e7}}$`);
}
const br = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, yr = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, rt = (e7) => e7 ? new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e7}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, wr = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, zr = "^[\\p{Extended_Pictographic}\\p{Emoji_Component}]+$";
function kr() {
  return new RegExp(zr, "u");
}
const $r = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Or = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, Sr = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, Zr = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Ir = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, Ft = /^[A-Za-z0-9_-]*$/, Er = /^https?$/, Pr = /^\+[1-9]\d{6,14}$/, Mt = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))";
function Tr(e7) {
  return new RegExp(`^${e7}$`);
}
const Ar = Tr(Mt);
function Ie(e7) {
  const t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof e7.precision == "number" ? e7.precision === -1 ? `${t}` : e7.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e7.precision}}` : e7.seconds ? `${t}:[0-5]\\d(?:\\.\\d+)?` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function Nr(e7) {
  return new RegExp(`^${Ie(e7)}$`);
}
function jr(e7) {
  const t = ["Z"];
  e7.offset && t.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
  const n = `${Ie({ precision: e7.precision, seconds: true })}(?:${t.join("|")})`, r = e7.local ? `${n}|${Ie({ precision: e7.precision })}` : n;
  return new RegExp(`^${Mt}T(?:${r})$`);
}
const Dr = (e7) => {
  const t = e7 ? `[\\s\\S]{${e7?.minimum ?? 0},${e7?.maximum ?? ""}}` : "[\\s\\S]*";
  return new RegExp(`^${t}$`);
}, Rr = /^-?\d+$/, Cr = /^-?\d+(?:\.\d+)?$/, xr = /^(?:true|false)$/i, Ur = /^[^A-Z]*$/, Fr = /^[^a-z]*$/, A = f("$ZodCheck", (e7, t) => {
  var n;
  e7._zod ?? (e7._zod = {}), e7._zod.def = t, (n = e7._zod).onattach ?? (n.onattach = []);
}), Fe = (e7) => {
  const t = e7.value;
  return !On(t) && t.length !== void 0;
}, ae = { number: "number", bigint: "bigint", object: "date" }, Lt = f("$ZodCheckLessThan", (e7, t) => {
  A.init(e7, t);
  const n = ae[typeof t.value];
  e7._zod.onattach.push((r) => {
    const o = r._zod.bag, i = (t.inclusive ? o.maximum : o.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
    t.value < i && (t.inclusive ? o.maximum = t.value : o.exclusiveMaximum = t.value);
  }), e7._zod.check = (r) => {
    (t.inclusive ? r.value <= t.value : r.value < t.value) || r.issues.push({ origin: ae[typeof r.value] ?? n, code: "too_big", maximum: typeof t.value == "object" ? t.value.getTime() : t.value, input: r.value, inclusive: t.inclusive, inst: e7, continue: !t.abort });
  };
}), Jt = f("$ZodCheckGreaterThan", (e7, t) => {
  A.init(e7, t);
  const n = ae[typeof t.value];
  e7._zod.onattach.push((r) => {
    const o = r._zod.bag, i = (t.inclusive ? o.minimum : o.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
    t.value > i && (t.inclusive ? o.minimum = t.value : o.exclusiveMinimum = t.value);
  }), e7._zod.check = (r) => {
    (t.inclusive ? r.value >= t.value : r.value > t.value) || r.issues.push({ origin: ae[typeof r.value] ?? n, code: "too_small", minimum: typeof t.value == "object" ? t.value.getTime() : t.value, input: r.value, inclusive: t.inclusive, inst: e7, continue: !t.abort });
  };
}), Mr = f("$ZodCheckMultipleOf", (e7, t) => {
  A.init(e7, t), e7._zod.onattach.push((n) => {
    var r;
    (r = n._zod.bag).multipleOf ?? (r.multipleOf = t.value);
  }), e7._zod.check = (n) => {
    if (typeof n.value != typeof t.value) throw new Error("Cannot mix number and bigint in multiple_of check.");
    (typeof n.value == "bigint" ? t.value !== BigInt(0) && n.value % t.value === BigInt(0) : Sn(n.value, t.value) === 0) || n.issues.push({ origin: typeof n.value, code: "not_multiple_of", divisor: t.value, input: n.value, inst: e7, continue: !t.abort });
  };
}), Lr = f("$ZodCheckNumberFormat", (e7, t) => {
  A.init(e7, t), t.format = t.format || "float64";
  const n = t.format?.includes("int"), r = n ? "int" : "number", [o, i] = An[t.format];
  e7._zod.onattach.push((s) => {
    const c = s._zod.bag;
    c.format = t.format, c.minimum = o, c.maximum = i, n && (c.pattern = Rr);
  }), e7._zod.check = (s) => {
    const c = s.value;
    if (n) {
      if (!Number.isInteger(c)) {
        s.issues.push({ expected: r, format: t.format, code: "invalid_type", continue: false, input: c, inst: e7 });
        return;
      }
      if (!Number.isSafeInteger(c)) {
        c > 0 ? s.issues.push({ input: c, code: "too_big", maximum: Number.MAX_SAFE_INTEGER, note: "Integers must be within the safe integer range.", inst: e7, origin: r, inclusive: true, continue: !t.abort }) : s.issues.push({ input: c, code: "too_small", minimum: Number.MIN_SAFE_INTEGER, note: "Integers must be within the safe integer range.", inst: e7, origin: r, inclusive: true, continue: !t.abort });
        return;
      }
    }
    c < o && s.issues.push({ origin: "number", input: c, code: "too_small", minimum: o, inclusive: true, inst: e7, continue: !t.abort }), c > i && s.issues.push({ origin: "number", input: c, code: "too_big", maximum: i, inclusive: true, inst: e7, continue: !t.abort });
  };
}), Jr = f("$ZodCheckMaxLength", (e7, t) => {
  var n;
  A.init(e7, t), (n = e7._zod.def).when ?? (n.when = Fe), e7._zod.onattach.push((r) => {
    const o = r._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    t.maximum < o && (r._zod.bag.maximum = t.maximum);
  }), e7._zod.check = (r) => {
    const o = r.value, i = o.length;
    if ((typeof o == "string" && i > t.maximum ? Re(o) : i) <= t.maximum) return;
    const c = Ce(o);
    r.issues.push({ origin: c, code: "too_big", maximum: t.maximum, inclusive: true, input: o, inst: e7, continue: !t.abort });
  };
}), Vr = f("$ZodCheckMinLength", (e7, t) => {
  var n;
  A.init(e7, t), (n = e7._zod.def).when ?? (n.when = Fe), e7._zod.onattach.push((r) => {
    const o = r._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    t.minimum > o && (r._zod.bag.minimum = t.minimum);
  }), e7._zod.check = (r) => {
    const o = r.value, i = o.length;
    if ((typeof o == "string" && i >= t.minimum && i < t.minimum * 2 ? Re(o) : i) >= t.minimum) return;
    const c = Ce(o);
    r.issues.push({ origin: c, code: "too_small", minimum: t.minimum, inclusive: true, input: o, inst: e7, continue: !t.abort });
  };
}), Kr = f("$ZodCheckLengthEquals", (e7, t) => {
  var n;
  A.init(e7, t), (n = e7._zod.def).when ?? (n.when = Fe), e7._zod.onattach.push((r) => {
    const o = r._zod.bag;
    o.minimum = t.length, o.maximum = t.length, o.length = t.length;
  }), e7._zod.check = (r) => {
    const o = r.value, i = o.length, s = typeof o == "string" && i >= t.length && i <= t.length * 2 ? Re(o) : i;
    if (s === t.length) return;
    const c = Ce(o), u = s > t.length;
    r.issues.push({ origin: c, ...u ? { code: "too_big", maximum: t.length } : { code: "too_small", minimum: t.length }, inclusive: true, exact: true, input: r.value, inst: e7, continue: !t.abort });
  };
}), ve = f("$ZodCheckStringFormat", (e7, t) => {
  var n, r;
  A.init(e7, t), e7._zod.onattach.push((o) => {
    const i = o._zod.bag;
    i.format = t.format, t.pattern && (i.patterns ?? (i.patterns = /* @__PURE__ */ new Set()), i.patterns.add(t.pattern));
  }), t.pattern ? (n = e7._zod).check ?? (n.check = (o) => {
    t.pattern.lastIndex = 0, !t.pattern.test(o.value) && o.issues.push({ origin: "string", code: "invalid_format", format: t.format, input: o.value, ...t.pattern ? { pattern: t.pattern.toString() } : {}, inst: e7, continue: !t.abort });
  }) : (r = e7._zod).check ?? (r.check = () => {
  });
}), Br = f("$ZodCheckRegex", (e7, t) => {
  ve.init(e7, t), e7._zod.check = (n) => {
    t.pattern.lastIndex = 0, !t.pattern.test(n.value) && n.issues.push({ origin: "string", code: "invalid_format", format: "regex", input: n.value, pattern: t.pattern.toString(), inst: e7, continue: !t.abort });
  };
}), Wr = f("$ZodCheckLowerCase", (e7, t) => {
  t.pattern ?? (t.pattern = Ur), ve.init(e7, t);
}), Gr = f("$ZodCheckUpperCase", (e7, t) => {
  t.pattern ?? (t.pattern = Fr), ve.init(e7, t);
}), qr = f("$ZodCheckIncludes", (e7, t) => {
  A.init(e7, t);
  const n = W(t.includes), r = new RegExp(typeof t.position == "number" ? `^.{${t.position},}${n}` : n);
  t.pattern = r, e7._zod.onattach.push((o) => {
    const i = o._zod.bag;
    i.patterns ?? (i.patterns = /* @__PURE__ */ new Set()), i.patterns.add(r);
  }), e7._zod.check = (o) => {
    o.value.includes(t.includes, t.position) || o.issues.push({ origin: "string", code: "invalid_format", format: "includes", includes: t.includes, input: o.value, inst: e7, continue: !t.abort });
  };
}), Yr = f("$ZodCheckStartsWith", (e7, t) => {
  A.init(e7, t);
  const n = new RegExp(`^${W(t.prefix)}.*`);
  t.pattern ?? (t.pattern = n), e7._zod.onattach.push((r) => {
    const o = r._zod.bag;
    o.patterns ?? (o.patterns = /* @__PURE__ */ new Set()), o.patterns.add(n);
  }), e7._zod.check = (r) => {
    r.value.startsWith(t.prefix) || r.issues.push({ origin: "string", code: "invalid_format", format: "starts_with", prefix: t.prefix, input: r.value, inst: e7, continue: !t.abort });
  };
}), Xr = f("$ZodCheckEndsWith", (e7, t) => {
  A.init(e7, t);
  const n = new RegExp(`.*${W(t.suffix)}$`);
  t.pattern ?? (t.pattern = n), e7._zod.onattach.push((r) => {
    const o = r._zod.bag;
    o.patterns ?? (o.patterns = /* @__PURE__ */ new Set()), o.patterns.add(n);
  }), e7._zod.check = (r) => {
    r.value.endsWith(t.suffix) || r.issues.push({ origin: "string", code: "invalid_format", format: "ends_with", suffix: t.suffix, input: r.value, inst: e7, continue: !t.abort });
  };
}), Hr = f("$ZodCheckOverwrite", (e7, t) => {
  A.init(e7, t), e7._zod.check = (n) => {
    n.value = t.tx(n.value);
  };
});
class Qr {
  constructor(t = [], n = {}) {
    this.content = [], this.indent = 0, this.args = t, this.closed = n;
  }
  indented(t) {
    this.indent += 1, t(this), this.indent -= 1;
  }
  write(t) {
    if (typeof t == "function") {
      t(this, { execution: "sync" }), t(this, { execution: "async" });
      return;
    }
    const r = t.split(`
`).filter((s) => s), o = Math.min(...r.map((s) => s.length - s.trimStart().length)), i = r.map((s) => s.slice(o)).map((s) => " ".repeat(this.indent * 2) + s);
    for (const s of i) this.content.push(s);
  }
  compile() {
    const t = Function, n = this?.content ?? [""];
    return new t(...Object.keys(this.closed), `return function (${this.args.join(", ")}) {
${n.join(`
`)}
};`)(...Object.values(this.closed));
  }
}
const eo = { major: 4, minor: 5, patch: 4 }, $ = f("$ZodType", (e7, t) => {
  var n;
  e7 ?? (e7 = {}), e7._zod.def = t, e7._zod.bag = e7._zod.bag || {}, e7._zod.version = eo;
  const r = e7._zod.def.checks, o = e7._zod.traits.has("$ZodCheck") ? [e7, ...r ?? []] : r?.length ? [...r] : [];
  for (const i of o) for (const s of i._zod.onattach) s(e7);
  if (o.length === 0) (n = e7._zod).deferred ?? (n.deferred = []), e7._zod.deferred?.push(() => {
    e7._zod.run = e7._zod.parse;
  });
  else {
    const i = (c, u, a) => {
      if (c.memo) return c;
      let l = K(c), d;
      for (const p of u) {
        if (p._zod.def.when) {
          if (Un(c) || !p._zod.def.when(c)) continue;
        } else if (l) continue;
        const h = c.issues.length, g = p._zod.check(c);
        if (g instanceof Promise && a?.async === false) throw new B();
        if (d || g instanceof Promise) d = (d ?? Promise.resolve()).then(async () => {
          await g, c.issues.length !== h && (Qe(c.issues, h, e7), l || (l = K(c, h)));
        });
        else {
          if (c.issues.length === h) continue;
          Qe(c.issues, h, e7), l || (l = K(c, h));
        }
      }
      return d ? d.then(() => c) : c;
    }, s = (c, u, a) => {
      if (K(c)) return c.aborted = true, c;
      const l = i(u, o, a);
      if (l instanceof Promise) {
        if (a.async === false) throw new B();
        return l.then((d) => e7._zod.parse(d, a));
      }
      return e7._zod.parse(l, a);
    };
    e7._zod.run = (c, u) => {
      if (u.skipChecks) return e7._zod.parse(c, u);
      if (u.direction === "backward") {
        const l = e7._zod.parse({ value: c.value, issues: [] }, { ...u, skipChecks: true });
        return l instanceof Promise ? l.then((d) => s(d, c, u)) : s(l, c, u);
      }
      const a = e7._zod.parse(c, u);
      if (a instanceof Promise) {
        if (u.async === false) throw new B();
        return a.then((l) => i(l, o, u));
      }
      return i(a, o, u);
    };
  }
}, { get "~standard"() {
  return Dt(this, "~standard", Vt(this));
}, set "~standard"(e7) {
  G(this, "~standard", e7);
} }), ot = (e7) => e7.success ? { value: e7.data } : { issues: e7.error?.issues };
function Vt(e7) {
  return { validate: (t) => {
    try {
      return ot(nr(e7, t));
    } catch {
      return rr(e7, t).then(ot);
    }
  }, vendor: "zod", version: 1 };
}
const Me = f("$ZodString", (e7, t) => {
  $.init(e7, t), e7._zod.pattern = [...e7?._zod.bag?.patterns ?? []].pop() ?? Dr(e7._zod.bag), e7._zod.parse = (n, r) => {
    if (t.coerce) try {
      n.value = String(n.value);
    } catch {
    }
    return typeof n.value == "string" || n.issues.push({ expected: "string", code: "invalid_type", input: n.value, inst: e7 }), n;
  };
}), z = f("$ZodStringFormat", (e7, t) => {
  ve.init(e7, t), Me.init(e7, t);
}), to = f("$ZodGUID", (e7, t) => {
  t.pattern ?? (t.pattern = yr), z.init(e7, t);
}), no = f("$ZodUUID", (e7, t) => {
  if (t.version) {
    const r = { v1: 1, v2: 2, v3: 3, v4: 4, v5: 5, v6: 6, v7: 7, v8: 8 }[t.version];
    if (r === void 0) throw new Error(`Invalid UUID version: "${t.version}"`);
    t.pattern ?? (t.pattern = rt(r));
  } else t.pattern ?? (t.pattern = rt());
  z.init(e7, t);
}), ro = f("$ZodEmail", (e7, t) => {
  t.pattern ?? (t.pattern = wr), z.init(e7, t);
}), Kt = 1, Bt = 2;
function oo(e7, t) {
  if (!t.normalize && t.protocol?.source === Er.source && !/^https?:\/\//i.test(e7)) return Kt;
  try {
    return new URL(e7);
  } catch {
    return Bt;
  }
}
const io = /[\t\n\r]/g;
function so(e7) {
  return e7.replace(io, "");
}
function co(e7, t) {
  return t.lastIndex = 0, t.test(e7.hostname);
}
function uo(e7, t) {
  return t.lastIndex = 0, t.test(e7.protocol.endsWith(":") ? e7.protocol.slice(0, -1) : e7.protocol);
}
const ao = f("$ZodURL", (e7, t) => {
  z.init(e7, t), e7._zod.check = (n) => {
    try {
      const r = n.value.trim(), o = oo(r, t);
      if (o === Kt) {
        n.issues.push({ code: "invalid_format", format: "url", note: "Invalid URL format", input: n.value, inst: e7, continue: !t.abort });
        return;
      }
      if (o === Bt) {
        n.issues.push({ code: "invalid_format", format: "url", input: n.value, inst: e7, continue: !t.abort });
        return;
      }
      t.hostname && !co(o, t.hostname) && n.issues.push({ code: "invalid_format", format: "url", note: "Invalid hostname", pattern: t.hostname.source, input: n.value, inst: e7, continue: !t.abort }), t.protocol && !uo(o, t.protocol) && n.issues.push({ code: "invalid_format", format: "url", note: "Invalid protocol", pattern: t.protocol.source, input: n.value, inst: e7, continue: !t.abort }), n.value = t.normalize ? o.href : so(r);
      return;
    } catch {
      n.issues.push({ code: "invalid_format", format: "url", input: n.value, inst: e7, continue: !t.abort });
    }
  };
}), fo = f("$ZodEmoji", (e7, t) => {
  t.pattern ?? (t.pattern = kr()), z.init(e7, t);
}), lo = f("$ZodNanoID", (e7, t) => {
  if (t.length !== void 0 && (!Number.isInteger(t.length) || t.length < 1)) throw new Error(`Invalid nanoid length: ${t.length}`);
  t.pattern ?? (t.pattern = t.length === void 0 ? _r : vr(t.length)), z.init(e7, t);
}), po = f("$ZodCUID", (e7, t) => {
  t.pattern ?? (t.pattern = dr), z.init(e7, t);
}), ho = f("$ZodCUID2", (e7, t) => {
  t.pattern ?? (t.pattern = pr), z.init(e7, t);
}), mo = f("$ZodULID", (e7, t) => {
  t.pattern ?? (t.pattern = hr), z.init(e7, t);
}), go = f("$ZodXID", (e7, t) => {
  t.pattern ?? (t.pattern = mr), z.init(e7, t);
}), _o = f("$ZodKSUID", (e7, t) => {
  t.pattern ?? (t.pattern = gr), z.init(e7, t);
}), vo = f("$ZodISODateTime", (e7, t) => {
  t.pattern ?? (t.pattern = jr(t)), z.init(e7, t), (t.local || t.precision === -1) && (e7._zod.bag.laxFormat = true, e7._zod.onattach.push((n) => {
    n._zod.bag.laxFormat = true;
  }));
}), bo = f("$ZodISODate", (e7, t) => {
  t.pattern ?? (t.pattern = Ar), z.init(e7, t);
}), yo = f("$ZodISOTime", (e7, t) => {
  t.pattern ?? (t.pattern = Nr(t)), z.init(e7, t);
}), wo = f("$ZodISODuration", (e7, t) => {
  t.pattern ?? (t.pattern = br), z.init(e7, t);
}), zo = f("$ZodIPv4", (e7, t) => {
  t.pattern ?? (t.pattern = $r), z.init(e7, t), e7._zod.bag.format = "ipv4";
}), ko = /^[0-9a-fA-F:.]+$/;
function Wt(e7) {
  if (!ko.test(e7)) return false;
  try {
    return new URL(`http://[${e7}]`), true;
  } catch {
    return false;
  }
}
const $o = f("$ZodIPv6", (e7, t) => {
  t.pattern ?? (t.pattern = Or), z.init(e7, t), e7._zod.bag.format = "ipv6", e7._zod.check = (n) => {
    Wt(n.value) || n.issues.push({ code: "invalid_format", format: "ipv6", input: n.value, inst: e7, continue: !t.abort });
  };
}), Oo = f("$ZodCIDRv4", (e7, t) => {
  t.pattern ?? (t.pattern = Sr), z.init(e7, t);
});
function So(e7) {
  const t = e7.split("/");
  if (t.length !== 2) return false;
  const [n, r] = t;
  if (!r) return false;
  const o = Number(r);
  return `${o}` !== r || o < 0 || o > 128 ? false : Wt(n);
}
const Zo = f("$ZodCIDRv6", (e7, t) => {
  t.pattern ?? (t.pattern = Zr), z.init(e7, t), e7._zod.check = (n) => {
    So(n.value) || n.issues.push({ code: "invalid_format", format: "cidrv6", input: n.value, inst: e7, continue: !t.abort });
  };
});
function Gt(e7) {
  if (e7 === "") return true;
  if (/\s/.test(e7) || e7.length % 4 !== 0) return false;
  try {
    return atob(e7), true;
  } catch {
    return false;
  }
}
const Io = f("$ZodBase64", (e7, t) => {
  t.pattern ?? (t.pattern = Ir), z.init(e7, t), e7._zod.bag.contentEncoding = "base64", e7._zod.check = (n) => {
    Gt(n.value) || n.issues.push({ code: "invalid_format", format: "base64", input: n.value, inst: e7, continue: !t.abort });
  };
});
function Eo(e7) {
  if (!Ft.test(e7)) return false;
  const t = e7.replace(/[-_]/g, (r) => r === "-" ? "+" : "/"), n = t.padEnd(Math.ceil(t.length / 4) * 4, "=");
  return Gt(n);
}
const Po = f("$ZodBase64URL", (e7, t) => {
  t.pattern ?? (t.pattern = Ft), z.init(e7, t), e7._zod.bag.contentEncoding = "base64url", e7._zod.check = (n) => {
    Eo(n.value) || n.issues.push({ code: "invalid_format", format: "base64url", input: n.value, inst: e7, continue: !t.abort });
  };
}), To = f("$ZodE164", (e7, t) => {
  t.pattern ?? (t.pattern = Pr), z.init(e7, t);
});
function Ao(e7, t = null) {
  try {
    const n = e7.split(".");
    if (n.length !== 3) return false;
    const [r] = n;
    if (!r) return false;
    const o = JSON.parse(atob(r));
    return !("typ" in o && o?.typ !== "JWT" || !o.alg || t && (!("alg" in o) || o.alg !== t));
  } catch {
    return false;
  }
}
const No = f("$ZodJWT", (e7, t) => {
  z.init(e7, t), e7._zod.check = (n) => {
    Ao(n.value, t.alg) || n.issues.push({ code: "invalid_format", format: "jwt", input: n.value, inst: e7, continue: !t.abort });
  };
}), qt = f("$ZodNumber", (e7, t) => {
  $.init(e7, t), e7._zod.pattern = e7._zod.bag.pattern ?? Cr, e7._zod.parse = (n, r) => {
    if (t.coerce) try {
      n.value = Number(n.value);
    } catch {
    }
    const o = n.value;
    if (typeof o == "number" && !Number.isNaN(o) && Number.isFinite(o)) return n;
    const i = typeof o == "number" ? Number.isNaN(o) ? "NaN" : Number.isFinite(o) ? void 0 : String(o) : void 0;
    return n.issues.push({ expected: "number", code: "invalid_type", input: o, inst: e7, ...i ? { received: i } : {} }), n;
  };
}), jo = f("$ZodNumberFormat", (e7, t) => {
  Lr.init(e7, t), qt.init(e7, t);
}), Do = f("$ZodBoolean", (e7, t) => {
  $.init(e7, t), e7._zod.pattern = xr, e7._zod.parse = (n, r) => {
    if (t.coerce) try {
      n.value = !!n.value;
    } catch {
    }
    const o = n.value;
    return typeof o == "boolean" || n.issues.push({ expected: "boolean", code: "invalid_type", input: o, inst: e7 }), n;
  };
}), Ro = f("$ZodUnknown", (e7, t) => {
  $.init(e7, t), e7._zod.parse = (n) => n;
}), Co = f("$ZodNever", (e7, t) => {
  $.init(e7, t), e7._zod.parse = (n, r) => (n.issues.push({ expected: "never", code: "invalid_type", input: n.value, inst: e7 }), n);
});
function it(e7, t, n) {
  e7.issues.length && t.issues.push(...jt(n, e7.issues)), t.value[n] = e7.value;
}
const xo = f("$ZodArray", (e7, t) => {
  $.init(e7, t);
  const n = C.memoizer;
  n?.attach(e7), e7._zod.parse = (r, o) => {
    const i = r.value;
    if (!Array.isArray(i)) return r.issues.push({ expected: "array", code: "invalid_type", input: i, inst: e7 }), r;
    r.value = n ? n.alloc(e7, r, Array(i.length), o) : Array(i.length);
    const s = [];
    for (let c = 0; c < i.length; c++) {
      const u = i[c], a = t.element._zod.run({ value: u, issues: [] }, o);
      a instanceof Promise ? s.push(a.then((l) => it(l, r, c))) : it(a, r, c);
    }
    return s.length ? Promise.all(s).then(() => r) : r;
  };
});
function fe(e7, t, n, r, o, i) {
  const s = n in r, c = i === "optional";
  if (!(!s && c && o === "optional")) {
    if (e7.issues.length) {
      if (o !== void 0 && c && !s) return;
      t.issues.push(...jt(n, e7.issues));
    }
    if (!s && o === void 0) {
      e7.issues.length || t.issues.push({ code: "invalid_type", expected: "nonoptional", input: void 0, path: [n] });
      return;
    }
    e7.value === void 0 ? s && (t.value[n] = void 0) : t.value[n] = e7.value;
  }
}
const Uo = [];
function Yt(e7) {
  const t = Object.keys(e7.shape), n = Object.getOwnPropertySymbols(e7.shape), r = n.length ? n : Uo, o = r.length ? [...t, ...r] : t;
  for (const s of o) if (!e7.shape?.[s]?._zod?.traits?.has("$ZodType")) throw new Error(`Invalid element at key "${String(s)}": expected a Zod schema`);
  const i = Tn(e7.shape);
  return { ...e7, allKeys: o, symbolKeys: r, keySet: new Set(t), numKeys: t.length, optionalKeys: new Set(i) };
}
function Xt(e7, t, n, r, o, i) {
  const s = [], c = o.keySet, u = o.catchall._zod, a = u.def.type, l = u.optin, d = u.optout;
  for (const p in t) {
    if (c.has(p)) continue;
    if (p === "__proto__") {
      a === "never" && s.push(p);
      continue;
    }
    if (a === "never") {
      s.push(p);
      continue;
    }
    const h = u.run({ value: t[p], issues: [] }, r);
    h instanceof Promise ? e7.push(h.then((g) => fe(g, n, p, t, l, d))) : fe(h, n, p, t, l, d);
  }
  return s.length && n.issues.push({ code: "unrecognized_keys", keys: s, input: t, inst: i, continue: true }), e7.length ? Promise.all(e7).then(() => n) : n;
}
const Ee = /* @__PURE__ */ new WeakMap(), Fo = f("$ZodObject", (e7, t) => {
  if ($.init(e7, t), !Object.getOwnPropertyDescriptor(t, "shape")?.get) {
    const u = t.shape;
    Ee.set(t, u), Object.defineProperty(t, "shape", { get: () => {
      const a = { ...u };
      return Object.defineProperty(t, "shape", { value: a }), Ee.set(t, a), a;
    } });
  }
  const r = he(() => Yt(t));
  y(e7, "propValues", (u) => {
    const a = u.def.shape, l = {};
    for (const d in a) {
      const p = a[d]._zod;
      if (p.values) {
        Object.prototype.hasOwnProperty.call(l, d) || T(l, d, /* @__PURE__ */ new Set());
        for (const h of p.values) l[d].add(h);
        p.optin !== void 0 && l[d].add(void 0);
      }
    }
    return l;
  });
  const o = te, i = t.catchall;
  let s;
  const c = C.memoizer;
  c?.attach(e7), e7._zod.parse = (u, a) => {
    s ?? (s = r.value);
    const l = u.value;
    if (!o(l)) return u.issues.push({ expected: "object", code: "invalid_type", input: l, inst: e7 }), u;
    u.value = c ? c.alloc(e7, u, {}, a) : {};
    const d = [], p = s.shape;
    for (const h of s.allKeys) {
      if (h === "__proto__") continue;
      const g = p[h], b = g._zod.optin, v = g._zod.optout, j = g._zod.run({ value: l[h], issues: [] }, a);
      j instanceof Promise ? d.push(j.then((x) => fe(x, u, h, l, b, v))) : fe(j, u, h, l, b, v);
    }
    return i ? Xt(d, l, u, a, r.value, e7) : d.length ? Promise.all(d).then(() => u) : u;
  };
}), Mo = f("$ZodObjectJIT", (e7, t) => {
  Fo.init(e7, t);
  const n = e7._zod.parse, r = he(() => Yt(t)), o = C.memoizer, i = (h) => {
    const g = r.value, b = g.symbolKeys, v = new Qr(["payload", "ctx"], { shape: h, inst: e7, memo: o, syms: b }), j = (P) => `shape[${P}]._zod.run({ value: input[${P}], issues: [] }, ctx)`, x = (P, w) => `
          for (let i = 0; i < ${P}.issues.length; i++) {
            const iss = ${P}.issues[i];
            iss.path = iss.path ? [${w}, ...iss.path] : [${w}];
            payload.issues.push(iss);
          }`;
    v.write("const input = payload.value;");
    const We = /* @__PURE__ */ Object.create(null);
    let zn = 0;
    for (const P of g.allKeys) We[P] = `key_${zn++}`;
    v.write(o ? "const newResult = memo.alloc(inst, payload, {}, ctx);" : "const newResult = {};");
    for (const P of g.allKeys) {
      if (P === "__proto__") continue;
      const w = We[P], D = typeof P == "symbol" ? `syms[${b.indexOf(P)}]` : Zn(P), be = `${D} in input`, Ge = h[P], qe = Ge?._zod?.optin, Ye = qe !== void 0, kn = Ge?._zod?.optout === "optional";
      if (v.write(`const ${w} = ${j(D)};`), Ye && kn) {
        const $n = qe === "optional" ? `${w}_present` : `${w}.value !== undefined || ${w}_present`;
        v.write(`
        const ${w}_present = ${be};
        if (!${w}.issues.length || ${w}_present) {
          if (${w}.issues.length) {${x(w, D)}
          }

          if (${$n}) {
            newResult[${D}] = ${w}.value;
          }
        }

      `);
      } else Ye ? v.write(`
        if (${w}.issues.length) {${x(w, D)}
        }
        
        if (${w}.value === undefined) {
          if (${be}) {
            newResult[${D}] = undefined;
          }
        } else {
          newResult[${D}] = ${w}.value;
        }

      `) : v.write(`
        const ${w}_present = ${be};
        if (${w}.issues.length) {${x(w, D)}
        }
        if (!${w}_present && !${w}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${D}]
          });
        }

        if (${w}_present) {
          newResult[${D}] = ${w}.value;
        }

      `);
    }
    return v.write("payload.value = newResult;"), v.write("return payload;"), v.compile();
  };
  let s;
  const c = te, u = !C.jitless, l = u && En.value, d = t.catchall;
  let p;
  e7._zod.parse = (h, g) => {
    p ?? (p = r.value);
    const b = h.value;
    return c(b) ? u && l && g?.async === false && g.jitless !== true ? (s || (s = i(t.shape)), h = s(h, g), d ? Xt([], b, h, g, p, e7) : h) : n(h, g) : (h.issues.push({ expected: "object", code: "invalid_type", input: b, inst: e7 }), h);
  };
});
function st(e7, t, n, r) {
  for (const i of e7) if (i.issues.length === 0) return t.value = i.value, t;
  const o = e7.filter((i) => !K(i));
  return o.length === 1 ? (t.value = o[0].value, o[0]) : (t.issues.push({ code: "invalid_union", input: t.value, inst: n, errors: e7.map((i) => i.issues.map((s) => q(s, r, J()))) }), t);
}
const Ht = f("$ZodUnion", (e7, t) => {
  $.init(e7, t), y(e7, "optin", (r) => r.def.options.some((o) => o._zod.optin === "defaulted") ? "defaulted" : r.def.options.some((o) => o._zod.optin !== void 0) ? "optional" : void 0), y(e7, "optout", (r) => r.def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0), y(e7, "values", (r) => {
    if (r.def.options.every((o) => o._zod.values)) return new Set(r.def.options.flatMap((o) => Array.from(o._zod.values)));
  }), y(e7, "pattern", (r) => {
    if (r.def.options.every((o) => o._zod.pattern)) {
      const o = r.def.options.map((i) => i._zod.pattern);
      return new RegExp(`^(${o.map((i) => De(i.source)).join("|")})$`);
    }
  });
  const n = t.options.length === 1 ? t.options[0]._zod.run : null;
  e7._zod.parse = (r, o) => {
    if (n) return n(r, o);
    let i = false;
    const s = [];
    for (const c of t.options) {
      const u = c._zod.run({ value: r.value, issues: [] }, o);
      if (u instanceof Promise) s.push(u), i = true;
      else {
        if (u.issues.length === 0) return u;
        s.push(u);
      }
    }
    return i ? Promise.all(s).then((c) => st(c, r, e7, o)) : st(s, r, e7, o);
  };
}), Lo = f("$ZodDiscriminatedUnion", (e7, t) => {
  t.inclusive = false, Ht.init(e7, t);
  const n = e7._zod.parse;
  y(e7, "propValues", (o) => {
    const i = {};
    for (const s of o.def.options) {
      const c = s._zod.propValues;
      if (!c || Object.keys(c).length === 0) throw new Error(`Invalid discriminated union option at index "${o.def.options.indexOf(s)}"`);
      for (const [u, a] of Object.entries(c)) {
        Object.prototype.hasOwnProperty.call(i, u) || T(i, u, /* @__PURE__ */ new Set());
        for (const l of a) i[u].add(l);
      }
    }
    return i;
  }), t.options.forEach((o, i) => {
    const s = Ee.get(o._zod.def);
    if (s && !Object.prototype.hasOwnProperty.call(s, t.discriminator)) throw new Error(`Invalid discriminated union option at index "${i}"`);
  });
  const r = he(() => {
    const o = t.options, i = /* @__PURE__ */ new Map();
    for (const s of o) {
      const c = s._zod.propValues?.[t.discriminator];
      if (!c || c.size === 0) throw new Error(`Invalid discriminated union option at index "${t.options.indexOf(s)}"`);
      for (const u of c) {
        if (i.has(u)) throw new Error(`Duplicate discriminator value "${String(u)}"`);
        i.set(u, s);
      }
    }
    return i;
  });
  e7._zod.parse = (o, i) => {
    const s = o.value;
    if (!te(s)) return o.issues.push({ code: "invalid_type", expected: "object", input: s, inst: e7 }), o;
    const c = r.value.get(s?.[t.discriminator]);
    return c ? c._zod.run(o, i) : t.unionFallback || i.direction === "backward" ? n(o, i) : (o.issues.push({ code: "invalid_union", errors: [], note: "No matching discriminator", discriminator: t.discriminator, options: Array.from(r.value.keys()), input: s, path: [t.discriminator], inst: e7 }), o);
  };
}), Jo = f("$ZodIntersection", (e7, t) => {
  $.init(e7, t), e7._zod.parse = (n, r) => {
    const o = n.value, i = t.left._zod.run({ value: o, issues: [] }, r), s = t.right._zod.run({ value: o, issues: [] }, r);
    return i instanceof Promise || s instanceof Promise ? Promise.all([i, s]).then(([u, a]) => ct(n, u, a)) : ct(n, i, s);
  };
});
function Pe(e7, t) {
  if (e7 === t) return { valid: true, data: e7 };
  if (e7 instanceof Date && t instanceof Date && +e7 == +t) return { valid: true, data: e7 };
  if (ne(e7) && ne(t)) {
    const n = Object.keys(t), r = Object.keys(e7).filter((i) => n.indexOf(i) !== -1), o = { ...e7, ...t };
    Object.prototype.hasOwnProperty.call(o, "__proto__") && delete o.__proto__;
    for (const i of r) {
      if (i === "__proto__") continue;
      const s = Pe(e7[i], t[i]);
      if (!s.valid) return { valid: false, mergeErrorPath: [i, ...s.mergeErrorPath] };
      o[i] = s.data;
    }
    return { valid: true, data: o };
  }
  if (Array.isArray(e7) && Array.isArray(t)) {
    if (e7.length !== t.length) return { valid: false, mergeErrorPath: [] };
    const n = [];
    for (let r = 0; r < e7.length; r++) {
      const o = e7[r], i = t[r], s = Pe(o, i);
      if (!s.valid) return { valid: false, mergeErrorPath: [r, ...s.mergeErrorPath] };
      n.push(s.data);
    }
    return { valid: true, data: n };
  }
  return { valid: false, mergeErrorPath: [] };
}
function ct(e7, t, n) {
  const r = /* @__PURE__ */ new Map();
  let o;
  const i = /* @__PURE__ */ new Map(), s = (a, l) => {
    let d;
    if (a.code === "unrecognized_keys" && !a.path?.length) o ?? (o = a), d = a.keys;
    else if (a.code === "invalid_key" && a.origin === "record" && a.path?.length === 1) {
      const p = String(a.path[0]);
      i.has(p) || i.set(p, a), d = [p];
    } else return false;
    for (const p of d) r.has(p) || r.set(p, {}), r.get(p)[l] = true;
    return true;
  };
  for (const a of t.issues) s(a, "l") || e7.issues.push(a);
  for (const a of n.issues) s(a, "r") || e7.issues.push(a);
  const c = [...r].filter(([, a]) => a.l && a.r).map(([a]) => a);
  if (c.length) {
    const a = o ? c.filter((l) => o.keys.includes(l)) : [];
    a.length && e7.issues.push({ ...o, keys: a });
    for (const l of c) !a.includes(l) && i.has(l) && e7.issues.push(i.get(l));
  }
  const u = Pe(t.value, n.value);
  if (!u.valid) {
    if (K(e7)) return e7;
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(u.mergeErrorPath)}`);
  }
  return e7.value = u.data, e7;
}
const Vo = f("$ZodEnum", (e7, t) => {
  $.init(e7, t);
  const n = Pt(t.entries), r = new Set(n);
  e7._zod.values = r;
  const o = n.filter((i) => Pn.has(typeof i));
  e7._zod.pattern = new RegExp(o.length ? `^(${o.map((i) => W(i.toString())).join("|")})$` : "^[^\\s\\S]$"), e7._zod.parse = (i, s) => {
    const c = i.value;
    return r.has(c) || i.issues.push({ code: "invalid_value", values: n, input: c, inst: e7 }), i;
  };
}), Ko = f("$ZodLiteral", (e7, t) => {
  $.init(e7, t);
  const n = new Set(t.values);
  e7._zod.values = n, e7._zod.pattern = new RegExp(t.values.length ? `^(${t.values.map((r) => typeof r == "string" ? W(r) : r ? W(r.toString()) : String(r)).join("|")})$` : "^[^\\s\\S]$"), e7._zod.parse = (r, o) => {
    const i = r.value;
    return n.has(i) || r.issues.push({ code: "invalid_value", values: t.values, input: i, inst: e7 }), r;
  };
}), Bo = f("$ZodTransform", (e7, t) => {
  $.init(e7, t), e7._zod.optin = "optional", C.memoizer?.guard(e7), e7._zod.parse = (n, r) => {
    if (r.direction === "backward") throw new Rt(e7.constructor.name);
    const o = t.transform(n.value, n);
    if (r.async) return (o instanceof Promise ? o : Promise.resolve(o)).then((s) => (n.value = s, n));
    if (o instanceof Promise) throw new B();
    return n.value = o, n;
  };
});
function ut(e7, t) {
  return e7.value = t.issues.length ? void 0 : t.value, e7;
}
const Qt = f("$ZodOptional", (e7, t) => {
  $.init(e7, t), y(e7, "optin", (n) => n.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), e7._zod.optout = "optional", y(e7, "values", (n) => {
    const r = n.def.innerType._zod.values;
    return r ? /* @__PURE__ */ new Set([...r, void 0]) : void 0;
  }), y(e7, "pattern", (n) => {
    const r = n.def.innerType._zod.pattern;
    return r ? new RegExp(`^(${De(r.source)})?$`) : void 0;
  }), e7._zod.parse = (n, r) => {
    if (n.value === void 0) {
      if (t.innerType._zod.optin !== "defaulted") return n;
      const o = t.innerType._zod.run({ value: n.value, issues: [] }, r);
      return o instanceof Promise ? o.then((i) => ut(n, i)) : ut(n, o);
    }
    return t.innerType._zod.run(n, r);
  };
}), Wo = f("$ZodExactOptional", (e7, t) => {
  Qt.init(e7, t), y(e7, "values", (n) => n.def.innerType._zod.values), y(e7, "pattern", (n) => n.def.innerType._zod.pattern), e7._zod.parse = (n, r) => t.innerType._zod.run(n, r);
}), Go = f("$ZodNullable", (e7, t) => {
  $.init(e7, t), y(e7, "optin", (n) => n.def.innerType._zod.optin), y(e7, "optout", (n) => n.def.innerType._zod.optout), y(e7, "pattern", (n) => {
    const r = n.def.innerType._zod.pattern;
    return r ? new RegExp(`^(${De(r.source)}|null)$`) : void 0;
  }), y(e7, "values", (n) => n.def.innerType._zod.values ? /* @__PURE__ */ new Set([...n.def.innerType._zod.values, null]) : void 0), e7._zod.parse = (n, r) => n.value === null ? n : t.innerType._zod.run(n, r);
}), qo = f("$ZodDefault", (e7, t) => {
  $.init(e7, t), e7._zod.optin = "defaulted", y(e7, "values", (n) => n.def.innerType._zod.values), e7._zod.parse = (n, r) => {
    if (r.direction === "backward") return t.innerType._zod.run(n, r);
    if (n.value === void 0) return n.value = t.defaultValue, n;
    const o = t.innerType._zod.run(n, r);
    return o instanceof Promise ? o.then((i) => at(i, t)) : at(o, t);
  };
});
function at(e7, t) {
  return e7.value === void 0 && (e7.value = t.defaultValue), e7;
}
const Yo = f("$ZodPrefault", (e7, t) => {
  $.init(e7, t), e7._zod.optin = "defaulted", y(e7, "values", (n) => n.def.innerType._zod.values), e7._zod.parse = (n, r) => (r.direction === "backward" || n.value === void 0 && (n.value = t.defaultValue), t.innerType._zod.run(n, r));
}), Xo = f("$ZodNonOptional", (e7, t) => {
  $.init(e7, t), y(e7, "values", (n) => {
    const r = n.def.innerType._zod.values;
    return r ? new Set([...r].filter((o) => o !== void 0)) : void 0;
  }), e7._zod.parse = (n, r) => {
    const o = t.innerType._zod.run(n, r);
    return o instanceof Promise ? o.then((i) => ft(i, e7)) : ft(o, e7);
  };
});
function ft(e7, t) {
  return !e7.issues.length && e7.value === void 0 && e7.issues.push({ code: "invalid_type", expected: "nonoptional", input: e7.value, inst: t }), e7;
}
function lt(e7, t, n, r) {
  return t.issues.length ? (e7.value = n.catchValue({ ...t, value: e7.value, error: { issues: t.issues.map((o) => q(o, r, J())) }, input: e7.value }), e7) : (e7.value = t.value, t.memo && (e7.memo = true), e7);
}
const Ho = f("$ZodCatch", (e7, t) => {
  $.init(e7, t), y(e7, "optin", (n) => n.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), y(e7, "optout", (n) => n.def.innerType._zod.optout), y(e7, "values", (n) => n.def.innerType._zod.values), e7._zod.parse = (n, r) => {
    if (r.direction === "backward") return t.innerType._zod.run(n, r);
    const o = t.innerType._zod.run({ value: n.value, issues: [] }, r);
    return o instanceof Promise ? o.then((i) => lt(n, i, t, r)) : lt(n, o, t, r);
  };
}), Qo = f("$ZodPipe", (e7, t) => {
  $.init(e7, t), y(e7, "values", (n) => n.def.in._zod.values), y(e7, "optin", (n) => n.def.in._zod.optin), y(e7, "optout", (n) => n.def.out._zod.optout), y(e7, "propValues", (n) => n.def.in._zod.propValues), e7._zod.parse = (n, r) => {
    if (r.direction === "backward") {
      const i = t.out._zod.run(n, r);
      return i instanceof Promise ? i.then((s) => ie(s, t.in, r)) : ie(i, t.in, r);
    }
    const o = t.in._zod.run(n, r);
    return o instanceof Promise ? o.then((i) => ie(i, t.out, r)) : ie(o, t.out, r);
  };
});
function ie(e7, t, n) {
  return e7.issues.some((r) => r.code !== "unrecognized_keys") ? (e7.aborted = true, e7) : t._zod.run({ value: e7.value, issues: e7.issues }, n);
}
const ei = f("$ZodReadonly", (e7, t) => {
  $.init(e7, t), y(e7, "propValues", (n) => n.def.innerType._zod.propValues), y(e7, "values", (n) => n.def.innerType._zod.values), y(e7, "optin", (n) => n.def.innerType?._zod?.optin), y(e7, "optout", (n) => n.def.innerType?._zod?.optout), e7._zod.parse = (n, r) => {
    if (r.direction === "backward") return t.innerType._zod.run(n, r);
    const o = t.innerType._zod.run(n, r);
    return o instanceof Promise ? o.then(dt) : dt(o);
  };
});
function dt(e7) {
  return e7.memo || (e7.value = Object.freeze(e7.value)), e7;
}
const ti = f("$ZodCustom", (e7, t) => {
  A.init(e7, t), $.init(e7, t), e7._zod.parse = (n, r) => n, e7._zod.check = (n) => {
    const r = n.value, o = t.fn(r);
    if (o instanceof Promise) return o.then((i) => pt(i, n, r, e7));
    pt(o, n, r, e7);
  };
});
function pt(e7, t, n, r) {
  if (!e7) {
    const o = { code: "custom", input: n, inst: r, path: [...r._zod.def.path ?? []], continue: !r._zod.def.abort };
    r._zod.def.params && (o.params = r._zod.def.params), t.issues.push(re(o));
  }
}
class ni extends Error {
  constructor() {
    super("Cannot parse a reference cycle that closes through a transform"), this.name = "ZodCyclicError";
  }
}
const Te = "~memo", ht = [];
function $e(e7) {
  return e7.map((t) => t.path ? { ...t, path: t.path.slice() } : { ...t });
}
const mt = /* @__PURE__ */ new WeakMap();
function en(e7, t) {
  const n = mt.get(e7);
  if (n !== void 0) return n;
  if (t.has(e7)) return true;
  t.add(e7);
  let r = false;
  const o = (c) => {
    !r && c?._zod && en(c, t) && (r = true);
  }, i = e7._zod.def;
  switch (i.type) {
    case "object": {
      for (const c of Reflect.ownKeys(i.shape)) o(i.shape[c]);
      o(i.catchall);
      break;
    }
    case "array":
      o(i.element);
      break;
    case "tuple":
      for (const c of i.items) o(c);
      o(i.rest);
      break;
    case "record":
    case "map":
      o(i.keyType), o(i.valueType);
      break;
    case "set":
      o(i.valueType);
      break;
    case "union":
      for (const c of i.options) o(c);
      break;
    case "intersection":
      o(i.left), o(i.right);
      break;
    case "optional":
    case "nullable":
    case "default":
    case "prefault":
    case "catch":
    case "readonly":
    case "nonoptional":
    case "promise":
    case "success":
      o(i.innerType);
      break;
    case "pipe":
      o(i.in), o(i.out);
      break;
    case "function":
      o(i.input), o(i.output);
      break;
    case "lazy":
      o(e7._zod.innerType);
      break;
    case "template_literal":
    case "string":
    case "number":
    case "int":
    case "boolean":
    case "bigint":
    case "symbol":
    case "undefined":
    case "null":
    case "void":
    case "never":
    case "any":
    case "unknown":
    case "date":
    case "nan":
    case "enum":
    case "literal":
    case "file":
    case "transform":
    case "custom":
      break;
    default:
      for (const c in i) {
        const u = Object.getOwnPropertyDescriptor(i, c);
        if (!u || u.get) continue;
        const a = u.value;
        if (!(!a || typeof a != "object")) {
          if (a._zod) o(a);
          else if (Array.isArray(a)) for (const l of a) o(l);
        }
      }
  }
  return t.delete(e7), mt.set(e7, r), r;
}
function ri(e7, t) {
  let n = e7.buckets.get(t);
  return n || (n = /* @__PURE__ */ new Map(), e7.buckets.set(t, n)), n;
}
let se;
const ce = [], oi = { alloc(e7, t, n) {
  const r = se;
  if (!r) return n;
  se = void 0;
  const o = { value: n, issues: null };
  return r.set(t.value, o), ce.push(o), n;
}, guard(e7) {
  var t;
  (t = e7._zod).deferred ?? (t.deferred = []), e7._zod.deferred.push(() => {
    const n = e7._zod.parse, r = (o, i) => {
      if (i.direction !== "backward" && si(i, o.value)) throw new ni();
      return n(o, i);
    };
    e7._zod.parse = r, e7._zod.run === n && (e7._zod.run = r);
  });
}, attach(e7) {
  var t;
  let n, r, o;
  (t = e7._zod).deferred ?? (t.deferred = []), e7._zod.deferred.push(() => {
    const i = e7._zod.parse, s = (c, u) => {
      if (n === void 0 && (n = en(e7, /* @__PURE__ */ new Set()), !n)) return e7._zod.parse = i, e7._zod.run === s && (e7._zod.run = i), i(c, u);
      const a = c.value;
      if (a === null || typeof a != "object") return i(c, u);
      let l = u[Te];
      l || (l = { buckets: /* @__PURE__ */ new Map(), backEdges: void 0 }, u[Te] = l);
      let d;
      r === u ? d = o : (d = ri(l, e7), r = u, o = d);
      const p = d.get(a);
      if (p) return c.value = p.value, p.issues ? p.issues.length && c.issues.push(...$e(p.issues)) : (c.memo = true, l.backEdges ?? (l.backEdges = /* @__PURE__ */ new Set()), l.backEdges.add(p.value)), c;
      se = d;
      const h = ce.length, g = i(c, u);
      se = void 0;
      const b = ce.length > h ? ce.pop() : void 0;
      return g instanceof Promise ? g.then((v) => (b && (b.issues = v.issues.length ? $e(v.issues) : ht), v)) : (b && (b.issues = g.issues.length ? $e(g.issues) : ht), g);
    };
    e7._zod.parse = s, e7._zod.run === i && (e7._zod.run = s);
  });
} };
function ii() {
  return oi;
}
function si(e7, t) {
  const n = e7[Te]?.backEdges;
  return n !== void 0 && t !== null && typeof t == "object" && n.has(t);
}
const ci = () => {
  const e7 = { string: { unit: "characters", verb: "to have" }, file: { unit: "bytes", verb: "to have" }, array: { unit: "items", verb: "to have" }, set: { unit: "items", verb: "to have" }, map: { unit: "entries", verb: "to have" } };
  function t(i) {
    return e7[i] ?? null;
  }
  const n = { regex: "input", email: "email address", url: "URL", emoji: "emoji", uuid: "UUID", uuidv4: "UUIDv4", uuidv6: "UUIDv6", nanoid: "nanoid", guid: "GUID", cuid: "cuid", cuid2: "cuid2", ulid: "ULID", xid: "XID", ksuid: "KSUID", datetime: "ISO datetime", date: "ISO date", time: "ISO time", duration: "ISO duration", ipv4: "IPv4 address", ipv6: "IPv6 address", mac: "MAC address", cidrv4: "IPv4 range", cidrv6: "IPv6 range", base64: "base64-encoded string", base64url: "base64url-encoded string", json_string: "JSON string", e164: "E.164 number", credit_card: "credit card number", jwt: "JWT", template_literal: "input" }, r = { nan: "NaN" };
  function o(i, s) {
    return i === "number" && typeof s == "number" && !Number.isFinite(s) ? String(s) : r[i] ?? i;
  }
  return (i) => {
    switch (i.code) {
      case "invalid_type": {
        const s = o(i.expected), c = Mn(i.input), u = o(c, i.input);
        return `Invalid input: expected ${s}, received ${u}`;
      }
      case "invalid_value":
        return i.values.length === 1 ? `Invalid input: expected ${Nt(i.values[0])}` : `Invalid option: expected one of ${Xe(i.values, "|")}`;
      case "too_big": {
        const s = i.exact ? "exactly " : i.inclusive ? "<=" : "<", c = t(i.origin);
        return c ? `Too big: expected ${i.origin ?? "value"} to have ${s}${i.maximum.toString()} ${c.unit ?? "elements"}` : `Too big: expected ${i.origin ?? "value"} to be ${s}${i.maximum.toString()}`;
      }
      case "too_small": {
        const s = i.exact ? "exactly " : i.inclusive ? ">=" : ">", c = t(i.origin);
        return c ? `Too small: expected ${i.origin} to have ${s}${i.minimum.toString()} ${c.unit}` : `Too small: expected ${i.origin} to be ${s}${i.minimum.toString()}`;
      }
      case "invalid_format": {
        const s = i;
        return s.format === "starts_with" ? `Invalid string: must start with "${s.prefix}"` : s.format === "ends_with" ? `Invalid string: must end with "${s.suffix}"` : s.format === "includes" ? `Invalid string: must include "${s.includes}"` : s.format === "regex" ? `Invalid string: must match pattern ${s.pattern}` : `Invalid ${n[s.format] ?? i.format}`;
      }
      case "not_multiple_of":
        return `Invalid number: must be a multiple of ${i.divisor}`;
      case "unrecognized_keys":
        return `Unrecognized key${i.keys.length > 1 ? "s" : ""}: ${Xe(i.keys, ", ")}`;
      case "invalid_key":
        return `Invalid key in ${i.origin}`;
      case "invalid_union":
        return i.options && Array.isArray(i.options) && i.options.length > 0 ? `Invalid discriminator value. Expected ${i.options.map((c) => `'${c}'`).join(" | ")}` : i.inclusive === false ? "Invalid input: more than one option matched" : "Invalid input";
      case "invalid_element":
        return `Invalid value in ${i.origin}`;
      default:
        return "Invalid input";
    }
  };
};
function ui() {
  return { localeError: ci() };
}
var gt;
class ai {
  constructor() {
    this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map();
  }
  add(t, ...n) {
    const r = n[0];
    return this._map.set(t, r), r && typeof r == "object" && "id" in r && this._idmap.set(r.id, t), this;
  }
  clear() {
    return this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map(), this;
  }
  remove(t) {
    const n = this._map.get(t);
    return n && typeof n == "object" && "id" in n && this._idmap.delete(n.id), this._map.delete(t), this;
  }
  get(t) {
    const n = t._zod.parent;
    if (n) {
      const r = { ...this.get(n) ?? {} };
      delete r.id;
      const o = { ...r, ...this._map.get(t) };
      return Object.keys(o).length ? o : void 0;
    }
    return this._map.get(t);
  }
  has(t) {
    return this._map.has(t);
  }
}
function fi() {
  return new ai();
}
(gt = globalThis).__zod_globalRegistry ?? (gt.__zod_globalRegistry = fi());
const H = globalThis.__zod_globalRegistry;
function li(e7, t) {
  return new e7({ type: "string", ...m(t) });
}
function tn(e7, t) {
  return new e7({ type: "string", format: "email", check: "string_format", abort: false, ...m(t) });
}
function di(e7, t) {
  return new e7({ type: "string", format: "guid", check: "string_format", abort: false, ...m(t) });
}
function pi(e7, t) {
  return new e7({ type: "string", format: "uuid", check: "string_format", abort: false, ...m(t) });
}
function nn(e7, t) {
  return new e7({ type: "string", format: "uuid", check: "string_format", abort: false, version: "v4", ...m(t) });
}
function hi(e7, t) {
  return new e7({ type: "string", format: "uuid", check: "string_format", abort: false, version: "v6", ...m(t) });
}
function mi(e7, t) {
  return new e7({ type: "string", format: "uuid", check: "string_format", abort: false, version: "v7", ...m(t) });
}
function gi(e7, t) {
  return new e7({ type: "string", format: "url", check: "string_format", abort: false, ...m(t) });
}
function _i(e7, t) {
  return new e7({ type: "string", format: "emoji", check: "string_format", abort: false, ...m(t) });
}
function vi(e7, t) {
  return new e7({ type: "string", format: "nanoid", check: "string_format", abort: false, ...m(t) });
}
function bi(e7, t) {
  return new e7({ type: "string", format: "cuid", check: "string_format", abort: false, ...m(t) });
}
function yi(e7, t) {
  return new e7({ type: "string", format: "cuid2", check: "string_format", abort: false, ...m(t) });
}
function wi(e7, t) {
  return new e7({ type: "string", format: "ulid", check: "string_format", abort: false, ...m(t) });
}
function zi(e7, t) {
  return new e7({ type: "string", format: "xid", check: "string_format", abort: false, ...m(t) });
}
function ki(e7, t) {
  return new e7({ type: "string", format: "ksuid", check: "string_format", abort: false, ...m(t) });
}
function $i(e7, t) {
  return new e7({ type: "string", format: "ipv4", check: "string_format", abort: false, ...m(t) });
}
function Oi(e7, t) {
  return new e7({ type: "string", format: "ipv6", check: "string_format", abort: false, ...m(t) });
}
function Si(e7, t) {
  return new e7({ type: "string", format: "cidrv4", check: "string_format", abort: false, ...m(t) });
}
function Zi(e7, t) {
  return new e7({ type: "string", format: "cidrv6", check: "string_format", abort: false, ...m(t) });
}
function Ii(e7, t) {
  return new e7({ type: "string", format: "base64", check: "string_format", abort: false, ...m(t) });
}
function Ei(e7, t) {
  return new e7({ type: "string", format: "base64url", check: "string_format", abort: false, ...m(t) });
}
function Pi(e7, t) {
  return new e7({ type: "string", format: "e164", check: "string_format", abort: false, ...m(t) });
}
function Ti(e7, t) {
  return new e7({ type: "string", format: "jwt", check: "string_format", abort: false, ...m(t) });
}
function Ai(e7, t) {
  return new e7({ type: "string", format: "datetime", check: "string_format", offset: false, local: false, precision: null, ...m(t) });
}
function Ni(e7, t) {
  return new e7({ type: "string", format: "date", check: "string_format", ...m(t) });
}
function ji(e7, t) {
  return new e7({ type: "string", format: "time", check: "string_format", precision: null, ...m(t) });
}
function Di(e7, t) {
  return new e7({ type: "string", format: "duration", check: "string_format", ...m(t) });
}
function Ri(e7, t) {
  return new e7({ type: "number", checks: [], ...m(t) });
}
function Ci(e7, t) {
  return new e7({ type: "number", check: "number_format", abort: false, format: "safeint", ...m(t) });
}
function xi(e7, t) {
  return new e7({ type: "boolean", ...m(t) });
}
function Ui(e7) {
  return new e7({ type: "unknown" });
}
function Fi(e7, t) {
  return new e7({ type: "never", ...m(t) });
}
function _t(e7, t) {
  return new Lt({ check: "less_than", ...m(t), value: e7, inclusive: false });
}
function Oe(e7, t) {
  return new Lt({ check: "less_than", ...m(t), value: e7, inclusive: true });
}
function vt(e7, t) {
  return new Jt({ check: "greater_than", ...m(t), value: e7, inclusive: false });
}
function Se(e7, t) {
  return new Jt({ check: "greater_than", ...m(t), value: e7, inclusive: true });
}
function bt(e7, t) {
  return new Mr({ check: "multiple_of", ...m(t), value: e7 });
}
function rn(e7, t) {
  return new Jr({ check: "max_length", ...m(t), maximum: e7 });
}
function le(e7, t) {
  return new Vr({ check: "min_length", ...m(t), minimum: e7 });
}
function on(e7, t) {
  return new Kr({ check: "length_equals", ...m(t), length: e7 });
}
function Mi(e7, t) {
  return new Br({ check: "string_format", format: "regex", ...m(t), pattern: e7 });
}
function Li(e7) {
  return new Wr({ check: "string_format", format: "lowercase", ...m(e7) });
}
function Ji(e7) {
  return new Gr({ check: "string_format", format: "uppercase", ...m(e7) });
}
function Vi(e7, t) {
  return new qr({ check: "string_format", format: "includes", ...m(t), includes: e7 });
}
function Ki(e7, t) {
  return new Yr({ check: "string_format", format: "starts_with", ...m(t), prefix: e7 });
}
function Bi(e7, t) {
  return new Xr({ check: "string_format", format: "ends_with", ...m(t), suffix: e7 });
}
function Y(e7) {
  return new Hr({ check: "overwrite", tx: e7 });
}
function Wi(e7) {
  return Y((t) => t.normalize(e7));
}
function Gi() {
  return Y((e7) => e7.trim());
}
function qi() {
  return Y((e7) => e7.toLowerCase());
}
function Yi() {
  return Y((e7) => e7.toUpperCase());
}
function Xi() {
  return Y((e7) => In(e7));
}
function Hi(e7, t, n) {
  return new e7({ type: "array", element: t, ...m(n) });
}
function Qi(e7, t, n) {
  return new e7({ type: "custom", check: "custom", fn: t, ...m(n) });
}
function es(e7, t) {
  const n = ts((r) => (r.addIssue = (o) => {
    if (typeof o == "string") r.issues.push(re(o, r.value, n._zod.def));
    else {
      const i = o;
      i.fatal && (i.continue = false), i.code ?? (i.code = "custom"), "input" in i || (i.input = r.value), i.inst ?? (i.inst = n), i.continue ?? (i.continue = !n._zod.def.abort), r.issues.push(re(i));
    }
  }, e7(r.value, r)), t);
  return n;
}
function ts(e7, t) {
  const n = new A({ check: "custom", ...m(t) });
  return n._zod.check = e7, n;
}
function ee(e7, ...t) {
  for (const n of t) for (const r of Reflect.ownKeys(n)) Object.prototype.propertyIsEnumerable.call(n, r) && T(e7, r, n[r]);
  return e7;
}
function sn(e7) {
  let t = e7?.target ?? "draft-2020-12";
  return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), { processors: e7.processors ?? {}, metadataRegistry: e7?.metadata ?? H, target: t, unrepresentable: e7?.unrepresentable ?? "throw", override: e7?.override ?? (() => {
  }), io: e7?.io ?? "output", counter: 0, seen: /* @__PURE__ */ new Map(), sharedDefsExtractedFor: void 0, sharedEmitDoneFor: void 0, cycles: e7?.cycles ?? "ref", reused: e7?.reused ?? "inline", intersections: [], deferred: [], external: e7?.external ?? void 0 };
}
function F(e7, t, n, r, o) {
  const i = typeof t.unrepresentable == "function" ? t.unrepresentable({ zodSchema: e7, path: r.path, message: o }) : t.unrepresentable;
  if (i === "any") return false;
  if (i === void 0 || i === "throw") throw new Error(o);
  return Object.assign(n, i), true;
}
function I(e7, t, n = { path: [], schemaPath: [] }) {
  var r;
  const o = e7._zod.def, i = t.seen.get(e7);
  if (i) return i.count++, n.schemaPath.includes(e7) && (i.cycle = n.path), i.schema;
  const s = { schema: {}, count: 1, cycle: void 0, path: n.path };
  t.seen.set(e7, s), t.sharedDefsExtractedFor = void 0, t.sharedEmitDoneFor = void 0;
  const c = e7._zod.toJSONSchema?.();
  if (c) s.schema = c;
  else {
    const l = { ...n, schemaPath: [...n.schemaPath, e7], path: n.path };
    if (e7._zod.processJSONSchema) e7._zod.processJSONSchema(t, s.schema, l);
    else {
      const p = s.schema, h = t.processors[o.type];
      if (!h) throw new Error(`[toJSONSchema]: Non-representable type encountered: ${o.type}`);
      h(e7, t, p, l);
    }
    const d = e7._zod.parent;
    d && (s.ref || (s.ref = d), I(d, t, l), t.seen.get(d).isParent = true);
  }
  const u = t.metadataRegistry.get(e7);
  return u && ee(s.schema, u), t.io === "input" && E(e7) && (delete s.schema.examples, delete s.schema.default), t.io === "input" && "_prefault" in s.schema && ((r = s.schema).default ?? (r.default = s.schema._prefault)), delete s.schema._prefault, t.seen.get(e7).schema;
}
function yt(e7) {
  return e7.replace(/~/g, "~0").replace(/\//g, "~1");
}
function cn(e7, t) {
  const n = e7.seen.get(t);
  if (!n) throw new Error("Unprocessed schema. This is a bug in Zod.");
  if (e7.external && e7.sharedDefsExtractedFor === e7.external) return;
  const r = /* @__PURE__ */ new Map();
  for (const s of e7.seen.entries()) {
    const c = e7.metadataRegistry.get(s[0])?.id;
    if (c) {
      const u = r.get(c);
      if (u && u !== s[0]) throw new Error(`Duplicate schema id "${c}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
      r.set(c, s[0]);
    }
  }
  const o = (s) => {
    const c = e7.target === "draft-2020-12" ? "$defs" : "definitions";
    if (e7.external) {
      const d = e7.external.registry.get(s[0])?.id, p = e7.external.uri ?? ((g) => g);
      if (d) return { ref: p(d) };
      const h = s[1].defId ?? s[1].schema.id ?? `schema${e7.counter++}`;
      return s[1].defId = h, { defId: h, ref: `${p("__shared")}#/${c}/${yt(h)}` };
    }
    const u = "#", a = `${u}/${c}/`;
    if (s[1] === n && !s[1].schema.id) return { ref: u };
    const l = s[1].schema.id ?? `__schema${e7.counter++}`;
    return { defId: l, ref: a + yt(l) };
  }, i = (s) => {
    if (s[1].schema.$ref) return;
    const c = s[1], { ref: u, defId: a } = o(s);
    c.def = { ...c.schema }, a && (c.defId = a);
    const l = c.schema;
    for (const d in l) delete l[d];
    l.$ref = u;
  };
  if (e7.cycles === "throw") for (const s of e7.seen.entries()) {
    const c = s[1];
    if (c.cycle) throw new Error(`Cycle detected: #/${c.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
  }
  for (const s of e7.seen.entries()) {
    const c = s[1];
    if (t === s[0]) {
      i(s);
      continue;
    }
    if (e7.external) {
      const a = e7.external.registry.get(s[0])?.id;
      if (t !== s[0] && a) {
        i(s);
        continue;
      }
    }
    if (e7.metadataRegistry.get(s[0])?.id) {
      i(s);
      continue;
    }
    if (c.cycle) {
      i(s);
      continue;
    }
    if (c.count > 1 && e7.reused === "ref") {
      i(s);
      continue;
    }
  }
  e7.external && (e7.sharedDefsExtractedFor = e7.external);
}
function un(e7) {
  const t = e7.anyOf;
  if (!Array.isArray(t) || t.length === 0 || e7.type !== void 0) return;
  const n = [];
  for (const r of t) {
    if (!r || typeof r != "object") return;
    un(r);
    const o = Object.keys(r);
    if (o.length !== 1 || o[0] !== "type") return;
    const i = r.type;
    for (const s of Array.isArray(i) ? i : [i]) {
      if (typeof s != "string") return;
      n.includes(s) || n.push(s);
    }
  }
  delete e7.anyOf, e7.type = n.length === 1 ? n[0] : n;
}
const an = /* @__PURE__ */ new Set(["type", "properties", "required", "additionalProperties"]), wt = ["oneOf", "anyOf"];
function zt(e7) {
  const t = e7.additionalProperties;
  return t === void 0 || t === false || typeof t != "object" || t === null ? null : Object.keys(t).length ? t : null;
}
function Ae(e7) {
  const t = [];
  for (const i of e7) {
    if (typeof i != "object" || i.type !== "object") return null;
    for (const s in i) if (!an.has(s)) return null;
    t.push(i);
  }
  const n = {}, r = /* @__PURE__ */ new Set();
  for (const i of t) {
    for (const s in i.properties) {
      if (Object.prototype.hasOwnProperty.call(n, s)) continue;
      const c = [];
      for (const a of t) {
        const l = a.properties?.[s] ?? zt(a);
        l != null && (c.some((d) => JSON.stringify(d) === JSON.stringify(l)) || c.push(l));
      }
      const u = c.length === 1 ? c[0] : Ae(c) ?? { allOf: c };
      T(n, s, u);
    }
    for (const s of i.required ?? []) r.add(s);
  }
  const o = { type: "object", properties: n };
  if (r.size && (o.required = [...r]), t.every((i) => i.additionalProperties === false)) o.additionalProperties = false;
  else {
    const i = [];
    for (const s of t) {
      const c = zt(s);
      c && !i.some((u) => JSON.stringify(u) === JSON.stringify(c)) && i.push(c);
    }
    i.length === 1 ? o.additionalProperties = i[0] : i.length > 1 && (o.additionalProperties = { allOf: i });
  }
  return o;
}
function ns(e7) {
  const t = e7.allOf;
  if (!Array.isArray(t) || t.length < 2) return;
  for (const o of an) if (o in e7) return;
  const n = t.filter((o) => wt.some((i) => Array.isArray(o[i])));
  let r = null;
  if (!n.length) r = Ae(t);
  else {
    const o = n[0], i = wt.find((u) => Array.isArray(o[u]));
    if (Object.keys(o).length !== 1) return;
    const s = t.filter((u) => u !== o), c = o[i].map((u) => Ae([...s, u]));
    if (c.some((u) => !u)) return;
    r = { [i]: c };
  }
  r && (delete e7.allOf, ee(e7, r));
}
function fn(e7, t) {
  const n = e7.seen.get(t);
  if (!n) throw new Error("Unprocessed schema. This is a bug in Zod.");
  const r = (c) => {
    const u = e7.seen.get(c);
    if (u.ref === null) return;
    const a = u.def ?? u.schema, l = { ...a }, d = u.ref;
    if (u.ref = null, d) {
      r(d);
      const h = e7.seen.get(d), g = h.schema;
      if (g.$ref && (e7.target === "draft-07" || e7.target === "draft-04" || e7.target === "openapi-3.0") ? (a.allOf = a.allOf ?? [], a.allOf.push(g)) : ee(a, g), ee(a, l), c._zod.parent === d) for (const v in a) v === "$ref" || v === "allOf" || v in l || delete a[v];
      if (g.$ref && h.def) for (const v in a) v === "$ref" || v === "allOf" || v in h.def && JSON.stringify(a[v]) === JSON.stringify(h.def[v]) && delete a[v];
    }
    const p = c._zod.parent;
    if (p && p !== d) {
      r(p);
      const h = e7.seen.get(p);
      if (h?.schema.$ref && (a.$ref = h.schema.$ref, h.def)) for (const g in a) g === "$ref" || g === "allOf" || g in h.def && JSON.stringify(a[g]) === JSON.stringify(h.def[g]) && delete a[g];
    }
    e7.override({ zodSchema: c, jsonSchema: a, path: u.path ?? [] });
  };
  if (!e7.external || e7.sharedEmitDoneFor !== e7.external) {
    for (const c of [...e7.seen.entries()].reverse()) r(c[0]);
    if (e7.target !== "openapi-3.0") for (const c of e7.seen.entries()) un(c[1].def ?? c[1].schema);
    for (const c of e7.deferred) c();
    if (e7.intersections.length) {
      const c = /* @__PURE__ */ new Map();
      for (const u of e7.seen.values()) for (const a of [u.schema, u.def]) {
        const l = a?.allOf;
        if (!Array.isArray(l)) continue;
        const d = c.get(l);
        d ? d.push(a) : c.set(l, [a]);
      }
      for (const u of e7.intersections) for (const a of c.get(u) ?? []) ns(a);
    }
  }
  const o = {};
  if (e7.target === "draft-2020-12" ? o.$schema = "https://json-schema.org/draft/2020-12/schema" : e7.target === "draft-07" ? o.$schema = "http://json-schema.org/draft-07/schema#" : e7.target === "draft-04" ? o.$schema = "http://json-schema.org/draft-04/schema#" : e7.target, e7.external?.uri) {
    const c = e7.external.registry.get(t)?.id;
    if (!c) throw new Error("Schema is missing an `id` property");
    o.$id = e7.external.uri(c);
  }
  ee(o, n.defId ? n.schema : n.def ?? n.schema);
  const i = e7.metadataRegistry.get(t)?.id;
  i !== void 0 && o.id === i && delete o.id;
  const s = e7.external?.defs ?? {};
  if (!e7.external || e7.sharedEmitDoneFor !== e7.external) for (const c of e7.seen.entries()) {
    const u = c[1];
    u.def && u.defId && (u.def.id === u.defId && delete u.def.id, T(s, u.defId, u.def));
  }
  e7.external && (e7.sharedEmitDoneFor = e7.external), e7.external || Object.keys(s).length > 0 && (e7.target === "draft-2020-12" ? o.$defs = s : o.definitions = s);
  try {
    const c = JSON.parse(JSON.stringify(o));
    return Object.defineProperty(c, "~standard", { value: { ...t["~standard"], jsonSchema: { input: de(t, "input", e7.processors), output: de(t, "output", e7.processors) } }, enumerable: false, writable: false }), c;
  } catch {
    throw new Error("Error converting schema to JSON.");
  }
}
function E(e7, t) {
  const n = t ?? { seen: /* @__PURE__ */ new Set() };
  if (n.seen.has(e7)) return false;
  n.seen.add(e7);
  const r = e7._zod.def;
  if (r.type === "transform") return true;
  if (r.type === "array") return E(r.element, n);
  if (r.type === "set") return E(r.valueType, n);
  if (r.type === "lazy") return E(r.getter(), n);
  if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault" || r.type === "catch") return E(r.innerType, n);
  if (r.type === "intersection") return E(r.left, n) || E(r.right, n);
  if (r.type === "record" || r.type === "map") return E(r.keyType, n) || E(r.valueType, n);
  if (r.type === "pipe") return e7._zod.traits.has("$ZodCodec") ? true : E(r.in, n) || E(r.out, n);
  if (r.type === "object") {
    for (const o in r.shape) if (E(r.shape[o], n)) return true;
    return false;
  }
  if (r.type === "union") {
    for (const o of r.options) if (E(o, n)) return true;
    return false;
  }
  if (r.type === "tuple") {
    for (const o of r.items) if (E(o, n)) return true;
    return !!(r.rest && E(r.rest, n));
  }
  return false;
}
const rs = (e7, t = {}) => (n) => {
  const r = sn({ ...n, processors: t });
  return I(e7, r), cn(r, e7), fn(r, e7);
}, de = (e7, t, n = {}) => (r) => {
  const { libraryOptions: o, target: i } = r ?? {}, s = sn({ ...o ?? {}, target: i, io: t, processors: n });
  return I(e7, s), cn(s, e7), fn(s, e7);
}, os = { guid: "uuid", url: "uri", datetime: "date-time", json_string: "json-string", regex: "" }, is = (e7, t, n, r) => {
  const o = n;
  o.type = "string";
  const { minimum: i, maximum: s, format: c, patterns: u, contentEncoding: a, laxFormat: l } = e7._zod.bag;
  if (typeof i == "number" && (o.minLength = i), typeof s == "number" && (o.maxLength = s), c && (o.format = os[c] ?? c, o.format === "" && delete o.format, (c === "time" || l) && delete o.format), a && (o.contentEncoding = a), u && u.size > 0) {
    const d = [...u];
    d.length === 1 ? o.pattern = d[0].source : d.length > 1 && (o.allOf = [...d.map((p) => ({ ...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {}, pattern: p.source }))]);
  }
}, ss = (e7, t, n, r) => {
  const o = n, { minimum: i, maximum: s, format: c, multipleOf: u, exclusiveMaximum: a, exclusiveMinimum: l } = e7._zod.bag;
  typeof c == "string" && c.includes("int") ? o.type = "integer" : o.type = "number";
  const d = typeof l == "number" && l >= (i ?? Number.NEGATIVE_INFINITY), p = typeof a == "number" && a <= (s ?? Number.POSITIVE_INFINITY), h = t.target === "draft-04" || t.target === "openapi-3.0";
  d ? h ? (o.minimum = l, o.exclusiveMinimum = true) : o.exclusiveMinimum = l : typeof i == "number" && (o.minimum = i), p ? h ? (o.maximum = a, o.exclusiveMaximum = true) : o.exclusiveMaximum = a : typeof s == "number" && (o.maximum = s), typeof u == "number" && (Number.isFinite(u) && u !== 0 ? o.multipleOf = Math.abs(u) : F(e7, t, o, r, `A multipleOf divisor of ${u} cannot be represented in JSON Schema`));
}, cs = (e7, t, n, r) => {
  n.type = "boolean";
}, us = (e7, t, n, r) => {
  n.not = {};
}, as = (e7, t, n, r) => {
}, fs = (e7, t, n, r) => {
  const o = e7._zod.def, i = Pt(o.entries);
  if (i.length === 0) {
    n.not = {};
    return;
  }
  i.every((s) => typeof s == "number") && (n.type = "number"), i.every((s) => typeof s == "string") && (n.type = "string"), n.enum = i;
}, ls = (e7, t, n, r) => {
  const o = e7._zod.def;
  if (o.values.length === 0) {
    n.not = {};
    return;
  }
  const i = [];
  for (const s of o.values) if (s === void 0) {
    if (F(e7, t, n, r, "Literal `undefined` cannot be represented in JSON Schema")) return;
  } else if (typeof s == "bigint") {
    if (F(e7, t, n, r, "BigInt literals cannot be represented in JSON Schema")) return;
    i.push(Number(s));
  } else i.push(s);
  if (i.length !== 0) if (i.length === 1) {
    const s = i[0];
    n.type = s === null ? "null" : typeof s, t.target === "draft-04" || t.target === "openapi-3.0" ? n.enum = [s] : n.const = s;
  } else i.every((s) => typeof s == "number") && (n.type = "number"), i.every((s) => typeof s == "string") && (n.type = "string"), i.every((s) => typeof s == "boolean") && (n.type = "boolean"), i.every((s) => s === null) && (n.type = "null"), n.enum = i;
}, ds = (e7, t, n, r) => {
  F(e7, t, n, r, "Custom types cannot be represented in JSON Schema");
}, ps = (e7, t, n, r) => {
  F(e7, t, n, r, "Transforms cannot be represented in JSON Schema");
}, hs = (e7, t, n, r) => {
  const o = n, i = e7._zod.def, { minimum: s, maximum: c } = e7._zod.bag;
  typeof s == "number" && (o.minItems = s), typeof c == "number" && (o.maxItems = c), o.type = "array", o.items = I(i.element, t, { ...r, path: [...r.path, "items"] });
};
function Ne(e7) {
  const t = e7._zod.def;
  return t.type === "pipe" && t.in._zod.traits.has("$ZodTransform") ? Ne(t.out) : t.type === "catch" ? Ne(t.innerType) : e7._zod.optin;
}
const ms = (e7, t, n, r) => {
  const o = n, i = e7._zod.def, s = i.shape;
  if (Object.getOwnPropertySymbols(s).length && F(e7, t, o, r, "Symbol keys cannot be represented in JSON Schema")) return;
  o.type = "object", o.properties = {};
  for (const l in s) T(o.properties, l, I(s[l], t, { ...r, path: [...r.path, "properties", l] }));
  const u = new Set(Object.keys(s)), a = new Set([...u].filter((l) => {
    const d = i.shape[l];
    return t.io === "input" ? Ne(d) === void 0 : d._zod.optout === void 0;
  }));
  a.size > 0 && (o.required = Array.from(a)), i.catchall?._zod.def.type === "never" ? o.additionalProperties = false : i.catchall ? i.catchall && (o.additionalProperties = I(i.catchall, t, { ...r, path: [...r.path, "additionalProperties"] })) : t.io === "output" && (o.additionalProperties = false);
}, gs = (e7, t, n, r) => {
  const o = e7._zod.def, i = o.inclusive === false, s = o.options.map((c, u) => I(c, t, { ...r, path: [...r.path, i ? "oneOf" : "anyOf", u] }));
  i ? n.oneOf = s : n.anyOf = s;
}, _s = (e7, t, n, r) => {
  const o = e7._zod.def, i = I(o.left, t, { ...r, path: [...r.path, "allOf", 0] }), s = I(o.right, t, { ...r, path: [...r.path, "allOf", 1] }), c = (a) => "allOf" in a && Object.keys(a).length === 1, u = [...c(i) ? i.allOf : [i], ...c(s) ? s.allOf : [s]];
  n.allOf = u, t.intersections.push(u);
}, vs = (e7, t, n, r) => {
  const o = e7._zod.def, i = I(o.innerType, t, r), s = t.seen.get(e7);
  t.target === "openapi-3.0" ? (s.ref = o.innerType, n.nullable = true) : n.anyOf = [i, { type: "null" }];
}, bs = (e7, t, n, r) => {
  const o = e7._zod.def;
  I(o.innerType, t, r);
  const i = t.seen.get(e7);
  i.ref = o.innerType;
}, Le = /* @__PURE__ */ Symbol();
function ln(e7, t, n, r, o) {
  let i = false;
  const s = JSON.stringify(e7, (c, u) => typeof u != "bigint" ? u : (i = true, null));
  return i ? (F(t, n, r, o, "BigInt defaults cannot be represented in JSON Schema"), Le) : JSON.parse(s);
}
const ys = (e7, t, n, r) => {
  const o = e7._zod.def;
  I(o.innerType, t, r);
  const i = t.seen.get(e7);
  i.ref = o.innerType;
  const s = ln(o.defaultValue, e7, t, n, r);
  s !== Le && (n.default = s);
}, ws = (e7, t, n, r) => {
  const o = e7._zod.def;
  I(o.innerType, t, r);
  const i = t.seen.get(e7);
  if (i.ref = o.innerType, t.io !== "input") return;
  const s = ln(o.defaultValue, e7, t, n, r);
  s !== Le && (n._prefault = s);
}, zs = (e7, t, n, r) => {
  const o = e7._zod.def;
  I(o.innerType, t, r);
  const i = t.seen.get(e7);
  i.ref = o.innerType;
  let s;
  try {
    s = o.catchValue(void 0);
  } catch {
    F(e7, t, n, r, "Dynamic catch values are not supported in JSON Schema");
    return;
  }
  n.default = s;
}, ks = (e7, t, n, r) => {
  const o = e7._zod.def, i = o.in._zod.traits.has("$ZodTransform"), s = t.io === "input" ? i ? o.out : o.in : o.out;
  I(s, t, r);
  const c = t.seen.get(e7);
  c.ref = s;
}, $s = (e7, t, n, r) => {
  const o = e7._zod.def;
  I(o.innerType, t, r);
  const i = t.seen.get(e7);
  i.ref = o.innerType, n.readOnly = true;
}, dn = (e7, t, n, r) => {
  const o = e7._zod.def;
  I(o.innerType, t, r);
  const i = t.seen.get(e7);
  i.ref = o.innerType;
}, kt = new WeakSet([Object.prototype, Error.prototype]);
function ue(e7, t, n) {
  Object.defineProperty(e7, t, { configurable: true, enumerable: false, get() {
    const r = n(this);
    return Object.defineProperty(this, t, { value: r, configurable: true, writable: true }), r;
  }, set(r) {
    Object.defineProperty(this, t, { value: r, configurable: true, writable: true });
  } });
}
const Os = (e7, t) => {
  xt.init(e7, t), e7.name = "ZodError";
  const n = Object.getPrototypeOf(e7);
  kt.has(n) || (kt.add(n), ue(n, "format", (r) => (o) => tr(r, o)), ue(n, "flatten", (r) => (o) => er(r, o)), ue(n, "addIssue", (r) => (o) => {
    r.issues.push(o), r.message = JSON.stringify(r.issues, Ze, 2);
  }), ue(n, "addIssues", (r) => (o) => {
    r.issues.push(...o), r.message = JSON.stringify(r.issues, Ze, 2);
  }), Object.defineProperty(n, "isEmpty", { configurable: true, enumerable: false, get() {
    return this.issues.length === 0;
  } }));
}, N = f("ZodError", Os, void 0, { Parent: Error }), Ss = xe(N), Zs = Ue(N), Is = ge(N), Es = _e(N), Ps = or(N), Ts = ir(N), As = sr(N), Ns = cr(N), js = ur(N), Ds = ar(N), Rs = fr(N), Cs = lr(N);
function xs() {
  C.localeError || J(ui());
}
function Je() {
  C.memoizer || J({ memoizer: ii() });
}
const O = f("ZodType", (e7, t) => (xs(), $.init(e7, t), e7.def = t, e7.type = t.type, e7), { check(...e7) {
  const t = this.def;
  return this.clone(M(t, { checks: [...t.checks ?? [], ...e7.map((n) => typeof n == "function" ? { _zod: { check: n, def: { check: "custom" }, onattach: [] } } : n)] }), { parent: true });
}, with(...e7) {
  return this.check(...e7);
}, clone(e7, t) {
  return L(this, e7, t);
}, brand() {
  return this;
}, register(e7, t) {
  return e7.add(this, t), this;
}, refine(e7, t) {
  return this.check(jc(e7, t));
}, superRefine(e7, t) {
  return this.check(Dc(e7, t));
}, overwrite(e7) {
  return this.check(Y(e7));
}, optional() {
  return St(this);
}, exactOptional() {
  return wc(this);
}, nullable() {
  return Zt(this);
}, nullish() {
  return St(Zt(this));
}, nonoptional(e7) {
  return Zc(this, e7);
}, array() {
  return pe(this);
}, or(e7) {
  return oe([this, e7]);
}, and(e7) {
  return _c(this, e7);
}, transform(e7) {
  return It(this, yc(e7));
}, default(e7) {
  return $c(this, e7);
}, prefault(e7) {
  return Sc(this, e7);
}, catch(e7) {
  return Ec(this, e7);
}, pipe(e7) {
  return It(this, e7);
}, readonly() {
  return Ac(this);
}, describe(e7) {
  const t = this.clone();
  return H.add(t, { description: e7 }), t;
}, meta(...e7) {
  if (e7.length === 0) return H.get(this);
  const t = this.clone();
  return H.add(t, e7[0]), t;
}, isOptional() {
  return this.safeParse(void 0).success;
}, isNullable() {
  return this.safeParse(null).success;
}, apply(e7, ...t) {
  return t.length === 0 ? e7(this) : e7(this, ...t);
}, get "~standard"() {
  return Dt(this, "~standard", { ...Vt(this), jsonSchema: { input: de(this, "input"), output: de(this, "output") } });
}, set "~standard"(e7) {
  G(this, "~standard", e7);
}, parse: function e(t, n) {
  return Ss(this, t, n, { callee: e });
}, parseAsync: async function e2(t, n) {
  return await Zs(this, t, n, { callee: e2 });
}, safeParse(e7, t) {
  return Is(this, e7, t);
}, async safeParseAsync(e7, t) {
  return Es(this, e7, t);
}, get spa() {
  return this?.safeParseAsync;
}, set spa(e7) {
  G(this, "spa", e7);
}, encode: function e3(t, n) {
  return Ps(this, t, n, { callee: e3 });
}, decode: function e4(t, n) {
  return Ts(this, t, n, { callee: e4 });
}, encodeAsync: async function e5(t, n) {
  return await As(this, t, n, { callee: e5 });
}, decodeAsync: async function e6(t, n) {
  return await Ns(this, t, n, { callee: e6 });
}, safeEncode(e7, t) {
  return js(this, e7, t);
}, safeDecode(e7, t) {
  return Ds(this, e7, t);
}, async safeEncodeAsync(e7, t) {
  return Rs(this, e7, t);
}, async safeDecodeAsync(e7, t) {
  return Cs(this, e7, t);
}, toJSONSchema(e7) {
  return rs(this, {})(e7);
}, get description() {
  return H.get(this)?.description;
}, get _def() {
  return this._zod.def;
} }), pn = f("_ZodString", (e7, t) => {
  Me.init(e7, t), O.init(e7, t), e7._zod.processJSONSchema = (r, o, i) => is(e7, r, o);
  const n = e7._zod.bag;
  e7.format = n.format ?? null, e7.minLength = n.minimum ?? null, e7.maxLength = n.maximum ?? null;
}, { regex(...e7) {
  return this.check(Mi(...e7));
}, includes(...e7) {
  return this.check(Vi(...e7));
}, startsWith(...e7) {
  return this.check(Ki(...e7));
}, endsWith(...e7) {
  return this.check(Bi(...e7));
}, min(...e7) {
  return this.check(le(...e7));
}, max(...e7) {
  return this.check(rn(...e7));
}, length(...e7) {
  return this.check(on(...e7));
}, nonempty(...e7) {
  return this.check(le(1, ...e7));
}, lowercase(e7) {
  return this.check(Li(e7));
}, uppercase(e7) {
  return this.check(Ji(e7));
}, trim() {
  return this.check(Gi());
}, normalize(...e7) {
  return this.check(Wi(...e7));
}, toLowerCase() {
  return this.check(qi());
}, toUpperCase() {
  return this.check(Yi());
}, slugify() {
  return this.check(Xi());
} }), Us = f("ZodString", (e7, t) => {
  Me.init(e7, t), pn.init(e7, t);
}, { email(e7) {
  return this.check(tn(hn, e7));
}, url(e7) {
  return this.check(gi(Ks, e7));
}, jwt(e7) {
  return this.check(Ti(sc, e7));
}, emoji(e7) {
  return this.check(_i(Bs, e7));
}, guid(e7) {
  return this.check(di(Vs, e7));
}, uuid(e7) {
  return this.check(pi(Q, e7));
}, uuidv4(e7) {
  return this.check(nn(Q, e7));
}, uuidv6(e7) {
  return this.check(hi(Q, e7));
}, uuidv7(e7) {
  return this.check(mi(Q, e7));
}, nanoid(e7) {
  return this.check(vi(Ws, e7));
}, cuid(e7) {
  return this.check(bi(Gs, e7));
}, cuid2(e7) {
  return this.check(yi(qs, e7));
}, ulid(e7) {
  return this.check(wi(Ys, e7));
}, base64(e7) {
  return this.check(Ii(rc, e7));
}, base64url(e7) {
  return this.check(Ei(oc, e7));
}, xid(e7) {
  return this.check(zi(Xs, e7));
}, ksuid(e7) {
  return this.check(ki(Hs, e7));
}, ipv4(e7) {
  return this.check($i(Qs, e7));
}, ipv6(e7) {
  return this.check(Oi(ec, e7));
}, cidrv4(e7) {
  return this.check(Si(tc, e7));
}, cidrv6(e7) {
  return this.check(Zi(nc, e7));
}, e164(e7) {
  return this.check(Pi(ic, e7));
}, datetime(e7) {
  return this.check(Ai(Fs, e7));
}, date(e7) {
  return this.check(Ni(Ms, e7));
}, time(e7) {
  return this.check(ji(Ls, e7));
}, duration(e7) {
  return this.check(Di(Js, e7));
} });
function Z(e7) {
  return li(Us, e7);
}
const k = f("ZodStringFormat", (e7, t) => {
  z.init(e7, t), pn.init(e7, t);
}), Fs = f("ZodISODateTime", (e7, t) => {
  vo.init(e7, t), k.init(e7, t);
}), Ms = f("ZodISODate", (e7, t) => {
  bo.init(e7, t), k.init(e7, t);
}), Ls = f("ZodISOTime", (e7, t) => {
  yo.init(e7, t), k.init(e7, t);
}), Js = f("ZodISODuration", (e7, t) => {
  wo.init(e7, t), k.init(e7, t);
}), hn = f("ZodEmail", (e7, t) => {
  ro.init(e7, t), k.init(e7, t);
});
function nu(e7) {
  return tn(hn, e7);
}
const Vs = f("ZodGUID", (e7, t) => {
  to.init(e7, t), k.init(e7, t);
}), Q = f("ZodUUID", (e7, t) => {
  no.init(e7, t), k.init(e7, t);
});
function ru(e7) {
  return nn(Q, e7);
}
const Ks = f("ZodURL", (e7, t) => {
  ao.init(e7, t), k.init(e7, t);
}), Bs = f("ZodEmoji", (e7, t) => {
  fo.init(e7, t), k.init(e7, t);
}), Ws = f("ZodNanoID", (e7, t) => {
  lo.init(e7, t), k.init(e7, t);
}), Gs = f("ZodCUID", (e7, t) => {
  po.init(e7, t), k.init(e7, t);
}), qs = f("ZodCUID2", (e7, t) => {
  ho.init(e7, t), k.init(e7, t);
}), Ys = f("ZodULID", (e7, t) => {
  mo.init(e7, t), k.init(e7, t);
}), Xs = f("ZodXID", (e7, t) => {
  go.init(e7, t), k.init(e7, t);
}), Hs = f("ZodKSUID", (e7, t) => {
  _o.init(e7, t), k.init(e7, t);
}), Qs = f("ZodIPv4", (e7, t) => {
  zo.init(e7, t), k.init(e7, t);
}), ec = f("ZodIPv6", (e7, t) => {
  $o.init(e7, t), k.init(e7, t);
}), tc = f("ZodCIDRv4", (e7, t) => {
  Oo.init(e7, t), k.init(e7, t);
}), nc = f("ZodCIDRv6", (e7, t) => {
  Zo.init(e7, t), k.init(e7, t);
}), rc = f("ZodBase64", (e7, t) => {
  Io.init(e7, t), k.init(e7, t);
}), oc = f("ZodBase64URL", (e7, t) => {
  Po.init(e7, t), k.init(e7, t);
}), ic = f("ZodE164", (e7, t) => {
  To.init(e7, t), k.init(e7, t);
}), sc = f("ZodJWT", (e7, t) => {
  No.init(e7, t), k.init(e7, t);
}), mn = f("ZodNumber", (e7, t) => {
  qt.init(e7, t), O.init(e7, t), e7._zod.processJSONSchema = (r, o, i) => ss(e7, r, o, i);
  const n = e7._zod.bag;
  e7.minValue = Math.max(n.minimum ?? Number.NEGATIVE_INFINITY, n.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null, e7.maxValue = Math.min(n.maximum ?? Number.POSITIVE_INFINITY, n.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null, e7.isInt = (n.format ?? "").includes("int") || Number.isSafeInteger(n.multipleOf ?? 0.5), e7.isFinite = true, e7.format = n.format ?? null;
}, { gt(e7, t) {
  return this.check(vt(e7, t));
}, gte(e7, t) {
  return this.check(Se(e7, t));
}, min(e7, t) {
  return this.check(Se(e7, t));
}, lt(e7, t) {
  return this.check(_t(e7, t));
}, lte(e7, t) {
  return this.check(Oe(e7, t));
}, max(e7, t) {
  return this.check(Oe(e7, t));
}, int(e7) {
  return this.check($t(e7));
}, safe(e7) {
  return this.check($t(e7));
}, positive(e7) {
  return this.check(vt(0, e7));
}, nonnegative(e7) {
  return this.check(Se(0, e7));
}, negative(e7) {
  return this.check(_t(0, e7));
}, nonpositive(e7) {
  return this.check(Oe(0, e7));
}, multipleOf(e7, t) {
  return this.check(bt(e7, t));
}, step(e7, t) {
  return this.check(bt(e7, t));
}, finite() {
  return this;
} });
function R(e7) {
  return Ri(mn, e7);
}
const cc = f("ZodNumberFormat", (e7, t) => {
  jo.init(e7, t), mn.init(e7, t);
});
function $t(e7) {
  return Ci(cc, e7);
}
const uc = f("ZodBoolean", (e7, t) => {
  Do.init(e7, t), O.init(e7, t), e7._zod.processJSONSchema = (n, r, o) => cs(e7, n, r);
});
function ac(e7) {
  return xi(uc, e7);
}
const fc = f("ZodUnknown", (e7, t) => {
  Ro.init(e7, t), O.init(e7, t), e7._zod.processJSONSchema = (n, r, o) => as();
});
function Ot() {
  return Ui(fc);
}
const lc = f("ZodNever", (e7, t) => {
  Co.init(e7, t), O.init(e7, t), e7._zod.processJSONSchema = (n, r, o) => us(e7, n, r);
});
function dc(e7) {
  return Fi(lc, e7);
}
const pc = f("ZodArray", (e7, t) => {
  Je(), xo.init(e7, t), O.init(e7, t), e7._zod.processJSONSchema = (n, r, o) => hs(e7, n, r, o), e7.element = t.element;
}, { min(e7, t) {
  return this.check(le(e7, t));
}, nonempty(e7) {
  return this.check(le(1, e7));
}, max(e7, t) {
  return this.check(rn(e7, t));
}, length(e7, t) {
  return this.check(on(e7, t));
}, unwrap() {
  return this.element;
} });
function pe(e7, t) {
  return Hi(pc, e7, t);
}
const hc = f("ZodObject", (e7, t) => {
  Je(), Mo.init(e7, t), O.init(e7, t), e7._zod.processJSONSchema = (n, r, o) => ms(e7, n, r, o), Bn(e7, "shape", (n) => n._zod.def.shape, false);
}, { keyof() {
  return Ve(Object.keys(this._zod.def.shape));
}, catchall(e7) {
  return this.clone({ ...this._zod.def, catchall: e7 });
}, passthrough() {
  return this.clone({ ...this._zod.def, catchall: Ot() });
}, loose() {
  return this.clone({ ...this._zod.def, catchall: Ot() });
}, strict() {
  return this.clone({ ...this._zod.def, catchall: dc() });
}, strip() {
  return this.clone({ ...this._zod.def, catchall: void 0 });
}, extend(e7) {
  return Dn(this, e7);
}, safeExtend(e7) {
  return Rn(this, e7);
}, merge(e7) {
  return Cn(this, e7);
}, pick(e7) {
  return Nn(this, e7);
}, omit(e7) {
  return jn(this, e7);
}, partial(...e7) {
  return He(vn, this, e7[0]);
}, exactPartial(...e7) {
  return He(bn, this, e7[0], "exactPartial");
}, required(...e7) {
  return xn(yn, this, e7[0]);
} });
function S(e7, t) {
  const n = { type: "object", shape: e7 ?? {}, ...m(t) };
  return new hc(n);
}
const gn = f("ZodUnion", (e7, t) => {
  Ht.init(e7, t), O.init(e7, t), e7._zod.processJSONSchema = (n, r, o) => gs(e7, n, r, o), e7.options = t.options;
});
function oe(e7, t) {
  return new gn({ type: "union", options: e7, ...m(t) });
}
const mc = f("ZodDiscriminatedUnion", (e7, t) => {
  gn.init(e7, t), Lo.init(e7, t);
});
function _n(e7, t, n) {
  return new mc({ type: "union", options: t, discriminator: e7, ...m(n) });
}
const gc = f("ZodIntersection", (e7, t) => {
  Jo.init(e7, t), O.init(e7, t), e7._zod.processJSONSchema = (n, r, o) => _s(e7, n, r, o);
});
function _c(e7, t) {
  return new gc({ type: "intersection", left: e7, right: t });
}
const je = f("ZodEnum", (e7, t) => {
  Vo.init(e7, t), O.init(e7, t), e7._zod.processJSONSchema = (r, o, i) => fs(e7, r, o), e7.enum = t.entries, e7.options = Object.values(t.entries);
  const n = new Set(Object.keys(t.entries));
  e7.extract = (r, o) => {
    const i = {};
    for (const s of r) if (n.has(s)) i[s] = t.entries[s];
    else throw new Error(`Key ${s} not found in enum`);
    return new je({ ...t, checks: [], ...m(o), entries: i });
  }, e7.exclude = (r, o) => {
    const i = { ...t.entries };
    for (const s of r) if (n.has(s)) delete i[s];
    else throw new Error(`Key ${s} not found in enum`);
    return new je({ ...t, checks: [], ...m(o), entries: i });
  };
});
function Ve(e7, t) {
  const n = Array.isArray(e7) ? Object.fromEntries(e7.map((r) => [r, r])) : e7;
  return new je({ type: "enum", entries: n, ...m(t) });
}
const vc = f("ZodLiteral", (e7, t) => {
  Ko.init(e7, t), O.init(e7, t), e7._zod.processJSONSchema = (n, r, o) => ls(e7, n, r, o), e7.values = new Set(t.values), Object.defineProperty(e7, "value", { get() {
    if (t.values.length > 1) throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
    return t.values[0];
  } });
});
function _(e7, t) {
  return new vc({ type: "literal", values: Array.isArray(e7) ? e7 : [e7], ...m(t) });
}
const bc = f("ZodTransform", (e7, t) => {
  Je(), Bo.init(e7, t), O.init(e7, t), e7._zod.processJSONSchema = (n, r, o) => ps(e7, n, r, o), e7._zod.parse = (n, r) => {
    if (r.direction === "backward") throw new Rt(e7.constructor.name);
    n.addIssue = (i) => {
      if (typeof i == "string") n.issues.push(re(i, n.value, t));
      else {
        const s = i;
        s.fatal && (s.continue = false), s.code ?? (s.code = "custom"), "input" in s || (s.input = n.value), s.inst ?? (s.inst = e7), n.issues.push(re(s));
      }
    };
    const o = t.transform(n.value, n);
    return o instanceof Promise ? o.then((i) => (n.value = i, n)) : (n.value = o, n);
  };
});
function yc(e7) {
  return new bc({ type: "transform", transform: e7 });
}
const vn = f("ZodOptional", (e7, t) => {
  Qt.init(e7, t), O.init(e7, t), e7._zod.processJSONSchema = (n, r, o) => dn(e7, n, r, o), e7.unwrap = () => e7._zod.def.innerType;
});
function St(e7) {
  return new vn({ type: "optional", innerType: e7 });
}
const bn = f("ZodExactOptional", (e7, t) => {
  Wo.init(e7, t), O.init(e7, t), e7._zod.processJSONSchema = (n, r, o) => dn(e7, n, r, o), e7.unwrap = () => e7._zod.def.innerType;
});
function wc(e7) {
  return new bn({ type: "optional", innerType: e7 });
}
const zc = f("ZodNullable", (e7, t) => {
  Go.init(e7, t), O.init(e7, t), e7._zod.processJSONSchema = (n, r, o) => vs(e7, n, r, o), e7.unwrap = () => e7._zod.def.innerType;
});
function Zt(e7) {
  return new zc({ type: "nullable", innerType: e7 });
}
const kc = f("ZodDefault", (e7, t) => {
  qo.init(e7, t), O.init(e7, t), e7._zod.processJSONSchema = (n, r, o) => ys(e7, n, r, o), e7.unwrap = () => e7._zod.def.innerType, e7.removeDefault = e7.unwrap;
});
function $c(e7, t) {
  return new kc({ type: "default", innerType: e7, get defaultValue() {
    return typeof t == "function" ? t() : At(t);
  } });
}
const Oc = f("ZodPrefault", (e7, t) => {
  Yo.init(e7, t), O.init(e7, t), e7._zod.processJSONSchema = (n, r, o) => ws(e7, n, r, o), e7.unwrap = () => e7._zod.def.innerType;
});
function Sc(e7, t) {
  return new Oc({ type: "prefault", innerType: e7, get defaultValue() {
    return typeof t == "function" ? t() : At(t);
  } });
}
const yn = f("ZodNonOptional", (e7, t) => {
  Xo.init(e7, t), O.init(e7, t), e7._zod.processJSONSchema = (n, r, o) => bs(e7, n, r, o), e7.unwrap = () => e7._zod.def.innerType;
});
function Zc(e7, t) {
  return new yn({ type: "nonoptional", innerType: e7, ...m(t) });
}
const Ic = f("ZodCatch", (e7, t) => {
  Ho.init(e7, t), O.init(e7, t), e7._zod.processJSONSchema = (n, r, o) => zs(e7, n, r, o), e7.unwrap = () => e7._zod.def.innerType, e7.removeCatch = e7.unwrap;
});
function Ec(e7, t) {
  return new Ic({ type: "catch", innerType: e7, catchValue: typeof t == "function" ? t : Gn(t) });
}
const Pc = f("ZodPipe", (e7, t) => {
  Qo.init(e7, t), O.init(e7, t), e7._zod.processJSONSchema = (n, r, o) => ks(e7, n, r, o), e7.in = t.in, e7.out = t.out;
});
function It(e7, t) {
  return new Pc({ type: "pipe", in: e7, out: t });
}
const Tc = f("ZodReadonly", (e7, t) => {
  ei.init(e7, t), O.init(e7, t), e7._zod.processJSONSchema = (n, r, o) => $s(e7, n, r, o), e7.unwrap = () => e7._zod.def.innerType;
});
function Ac(e7) {
  return new Tc({ type: "readonly", innerType: e7 });
}
const Nc = f("ZodCustom", (e7, t) => {
  ti.init(e7, t), O.init(e7, t), e7._zod.processJSONSchema = (n, r, o) => ds(e7, n, r, o);
});
function jc(e7, t = {}) {
  return Qi(Nc, e7, t);
}
function Dc(e7, t) {
  return es(e7, t);
}
const V = (e7) => e7.replace(/\s+/g, " ").trim();
function Rc(e7) {
  let t = 0;
  for (let n = 0; n < e7.length; n += 1) {
    const r = e7.charAt(n);
    if ("([{（【".includes(r) && (t += 1), ")]}）】".includes(r) && (t = Math.max(0, t - 1)), t > 0) continue;
    const o = e7.slice(n);
    if (r === "/" && !/\d\s*$/.test(e7.slice(0, n)) || /^\s+[-/]\s+/.test(o) || /^(?:\s+|[/|])(?:[[(（【]\s*)?(?:낱권\s*(?:선택(?:\s*구매)?|구매)|옵션\s*선택(?:\s*구매)?|선택\s*구매|사은품\s*증정|무료\s*배송|당일\s*발송|쿠폰\s*할인|빠른\s*배송)(?=\s|[/|)\]）】]|$)/.test(o)) {
      const i = e7.slice(0, n).trim();
      return /[\p{L}]/u.test(i) ? i : e7;
    }
  }
  return e7;
}
function Cc(e7, t) {
  const n = Rc(V(e7).replace(/\[(?:무료배송|특가|당일발송|공식판매처|쿠폰할인|농할\s*\d+%\s*할인쿠폰\s*다운로드)\]/g, "").replace(/(?:^|\s)(?:무료배송|당일발송|쿠폰할인|빠른배송)(?:\s|$).*$/, "").trim()), r = V(t).replace(/\(\s*[+-]\s*[\d,]+\s*원\s*\)/g, "").split(/\s*\/\s*/).map((d) => d.replace(/^(?:색상사이즈형태무늬|상품명|옵션|색상|사이즈|선택)\s*[:：]?\s*/, "").replace(/^\d{2}\.\s*(?=[가-힣A-Za-z])/, "").trim()).filter(Boolean).join(" / "), o = n.match(/^(.+?(?:타스|다스))\s*\(\s*\d+\s*(?:개입|입|개|자루)\s*\)\s+.+?\s+\d+\s*(?:색|종|종류|타입)\s+중\s+선택$/u)?.[1];
  if (o && r) return { name: V(o), specification: r };
  const i = new RegExp("(?<![\\p{L}\\d/])\\d+(?:\\.\\d+)?(?:\\s*[xX×*]\\s*\\d+(?:\\.\\d+)?)*(?:\\s*(?:[mM][lL]|[kK][gG]|[gG]|[lL]|mm|cm|매|팩|개(?:입|세트)?|입|장|롤|봉|병|박스|세트|인치|온스))(?![a-zA-Z])|(?<![\\p{L}\\d/])\\d+\\s*\\+\\s*\\d+(?!\\d)", "gu"), s = Array.from(n.matchAll(i)), c = s[0];
  let u = n, a = "";
  if (c?.index !== void 0) {
    const d = V(n.slice(0, c.index));
    /[\p{L}]/u.test(d) ? (u = d, a = n.slice(c.index).trim()) : (u = V(n.replace(i, "")), a = s.map((p) => V(p[0])).join(" "));
  }
  if (!/[\p{L}]/u.test(u)) return { name: V(e7), specification: r };
  const l = [a, r].filter(Boolean);
  return { name: u, specification: [...new Set(l)].join(" / ") };
}
const xc = S({ id: Z().trim().min(1), name: Z().trim().min(1), specification: Z().trim(), quantityText: Z(), priceText: Z() }), Uc = pe(xc).min(1), Et = S({ id: Z().min(1), name: Z().min(1), specification: Z(), quantity: R().int().positive(), unit: Z().min(1).max(20), unitPrice: R().int().positive(), expectedAmount: R().int().positive() }), Ke = "gmarket-selected-shipping";
function ou(e7) {
  return e7.filter((t) => t.id !== Ke).length;
}
function iu(e7, t) {
  return t === 0 ? [...e7] : [...e7, { id: Ke, name: "배송비", specification: "선택 상품 배송비 합계", quantity: 1, unit: "건", unitPrice: t, expectedAmount: t }];
}
function su(e7, t) {
  return e7.map((n) => {
    if (t === 0 || n.id === Ke) return { ...n };
    const r = Math.ceil(n.unitPrice / t) * t;
    return { ...n, unitPrice: r, expectedAmount: r * n.quantity };
  });
}
const Fc = "선택 상품의 단가를 확인할 수 없습니다. 장바구니의 상품별 금액을 확인해 주세요.", Mc = "선택 상품의 수량을 확인할 수 없습니다. 장바구니에서 수량을 확인해 주세요.";
function wn(e7) {
  const t = e7.replace(/[^0-9]/g, "");
  if (t.length === 0) return null;
  const n = Number(t);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}
function Lc(e7) {
  return wn(e7);
}
function cu(e7) {
  const t = Uc.safeParse(e7);
  if (!t.success) return { kind: "invalid", message: "선택한 장바구니 상품을 읽지 못했습니다. 상품 선택 상태를 다시 확인해 주세요." };
  const n = [];
  for (const r of t.data) {
    const o = wn(r.quantityText);
    if (o === null) return { kind: "invalid", message: Mc };
    const i = Lc(r.priceText);
    if (i === null) return { kind: "invalid", message: Fc };
    const s = o * i;
    if (!Number.isSafeInteger(s)) return { kind: "invalid", message: "예상금액이 너무 큽니다. 장바구니의 수량과 단가를 다시 확인해 주세요." };
    n.push({ id: r.id, ...Cc(r.name, r.specification), quantity: o, unit: "개", unitPrice: i, expectedAmount: s });
  }
  return { kind: "ready", items: n };
}
const Jc = oe([_("gmarket"), _("11st"), _("ssg"), _("iscreammall"), _("coupang"), _("kedufine"), _("other")]);
function Vc(e7) {
  return e7?.startsWith("https://cart.gmarket.co.kr/") ?? false;
}
function Kc(e7) {
  return e7 !== void 0 && /^https:\/\/buy\.11st\.co\.kr\/cart\/CartAction\.tmall\?/.test(e7) && new URL(e7).searchParams.get("method") === "getCartList";
}
function Bc(e7) {
  return /^https:\/\/(?:pay|www)\.ssg\.com\/cart\/dmsShpp\.ssg(?:[?#]|$)/.test(e7 ?? "");
}
function Wc(e7) {
  return /^https:\/\/(?:www\.)?i-screammall\.co\.kr\/order\/cart\/\d+\/?(?:[?#]|$)/.test(e7 ?? "");
}
function Gc(e7) {
  return /^https:\/\/cart\.coupang\.com\/cartView\.pang(?:[?#]|$)/.test(e7 ?? "");
}
function qc(e7) {
  return /^https:\/\/klef\.goe\.go\.kr(?:\/|$)/.test(e7 ?? "");
}
function uu(e7) {
  return Vc(e7) ? "gmarket" : Kc(e7) ? "11st" : Bc(e7) ? "ssg" : Wc(e7) ? "iscreammall" : Gc(e7) ? "coupang" : qc(e7) ? "kedufine" : "other";
}
const Be = S({ createdAt: R().int().positive(), items: pe(Et).min(1), sourceItems: pe(Et).min(1), shippingAmount: R().int().nonnegative(), roundingStep: oe([_(0), _(100), _(1e3)]), source: oe([_("gmarket"), _("11st"), _("ssg"), _("iscreammall"), _("coupang"), _("generic")]) }), Yc = Ve(["empty", "occupied", "busy", "unavailable"]), au = _n("kind", [S({ kind: _("read_context") }), S({ kind: _("capture_cart_selection") }), S({ kind: _("fill_kedufine_items") }), S({ kind: _("undo_kedufine_items"), undoToken: Z().min(1) }), S({ kind: _("clear_kedufine_items"), clearToken: Z().min(1) }), S({ kind: _("clear_draft") }), S({ kind: _("round_prices"), itemId: Z().min(1).optional(), step: oe([_(0), _(100), _(1e3)]) })]).and(S({ windowId: R().int().nonnegative().optional(), tabId: R().int().nonnegative().optional() })), Xc = S({ kind: _("context"), draft: Be.nullable(), operationPending: ac().optional(), undoCount: R().int().nonnegative().optional(), undoToken: Z().optional(), surface: Jc, gridState: Yc.optional(), clearToken: Z().optional(), tabId: R().int().nonnegative().optional(), tabAccess: Ve(["granted", "required", "restricted"]).optional() }), Hc = S({ kind: _("draft_saved"), draft: Be }), Qc = S({ kind: _("filled"), undoToken: Z().optional(), count: R().int().positive(), message: Z().min(1) }), eu = S({ kind: _("cleared") }), tu = S({ kind: _("failure"), message: Z().min(1) }), fu = _n("kind", [Xc, Hc, S({ kind: _("draft_updated"), draft: Be }), Qc, eu, S({ kind: _("items_cleared"), message: Z().min(1) }), S({ kind: _("undone"), message: Z().min(1) }), tu]);
export { Et as D, au as E, Yc as G, Ke as S, Ve as _, pe as a, uu as b, cu as c, _n as d, qc as e, Be as f, fu as g, ou as h, iu as i, nu as j, ru as k, _ as l, R as n, S as o, su as r, Z as s, oe as u };
