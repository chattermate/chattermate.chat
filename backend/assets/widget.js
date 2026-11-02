var $f = Object.defineProperty;
var Bf = (e, t, n) => t in e ? $f(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var Je = (e, t, n) => Bf(e, typeof t != "symbol" ? t + "" : t, n);
/**
* @vue/shared v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function pa(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const n of e.split(",")) t[n] = 1;
  return (n) => n in t;
}
const Qe = {}, Js = [], Sn = () => {
}, Uf = () => !1, qi = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), ma = (e) => e.startsWith("onUpdate:"), Pt = Object.assign, ga = (e, t) => {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}, zf = Object.prototype.hasOwnProperty, je = (e, t) => zf.call(e, t), be = Array.isArray, Qs = (e) => Vi(e) === "[object Map]", Ic = (e) => Vi(e) === "[object Set]", xe = (e) => typeof e == "function", pt = (e) => typeof e == "string", fs = (e) => typeof e == "symbol", ot = (e) => e !== null && typeof e == "object", Oc = (e) => (ot(e) || xe(e)) && xe(e.then) && xe(e.catch), Lc = Object.prototype.toString, Vi = (e) => Lc.call(e), Hf = (e) => Vi(e).slice(8, -1), Nc = (e) => Vi(e) === "[object Object]", _a = (e) => pt(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, Lr = /* @__PURE__ */ pa(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), Ki = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (n) => t[n] || (t[n] = e(n));
}, Wf = /-(\w)/g, ls = Ki(
  (e) => e.replace(Wf, (t, n) => n ? n.toUpperCase() : "")
), jf = /\B([A-Z])/g, hs = Ki(
  (e) => e.replace(jf, "-$1").toLowerCase()
), Pc = Ki((e) => e.charAt(0).toUpperCase() + e.slice(1)), wo = Ki(
  (e) => e ? `on${Pc(e)}` : ""
), is = (e, t) => !Object.is(e, t), gi = (e, ...t) => {
  for (let n = 0; n < e.length; n++)
    e[n](...t);
}, qo = (e, t, n, s = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: s,
    value: n
  });
}, Vo = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let gl;
const Gi = () => gl || (gl = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function Ce(e) {
  if (be(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
      const s = e[n], r = pt(s) ? Gf(s) : Ce(s);
      if (r)
        for (const i in r)
          t[i] = r[i];
    }
    return t;
  } else if (pt(e) || ot(e))
    return e;
}
const qf = /;(?![^(]*\))/g, Vf = /:([^]+)/, Kf = /\/\*[^]*?\*\//g;
function Gf(e) {
  const t = {};
  return e.replace(Kf, "").split(qf).forEach((n) => {
    if (n) {
      const s = n.split(Vf);
      s.length > 1 && (t[s[0].trim()] = s[1].trim());
    }
  }), t;
}
function $e(e) {
  let t = "";
  if (pt(e))
    t = e;
  else if (be(e))
    for (let n = 0; n < e.length; n++) {
      const s = $e(e[n]);
      s && (t += s + " ");
    }
  else if (ot(e))
    for (const n in e)
      e[n] && (t += n + " ");
  return t.trim();
}
const Yf = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", Xf = /* @__PURE__ */ pa(Yf);
function Mc(e) {
  return !!e || e === "";
}
const Dc = (e) => !!(e && e.__v_isRef === !0), J = (e) => pt(e) ? e : e == null ? "" : be(e) || ot(e) && (e.toString === Lc || !xe(e.toString)) ? Dc(e) ? J(e.value) : JSON.stringify(e, Fc, 2) : String(e), Fc = (e, t) => Dc(t) ? Fc(e, t.value) : Qs(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (n, [s, r], i) => (n[ko(s, i) + " =>"] = r, n),
    {}
  )
} : Ic(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((n) => ko(n))
} : fs(t) ? ko(t) : ot(t) && !be(t) && !Nc(t) ? String(t) : t, ko = (e, t = "") => {
  var n;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    fs(e) ? `Symbol(${(n = e.description) != null ? n : t})` : e
  );
};
/**
* @vue/reactivity v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let jt;
class Zf {
  constructor(t = !1) {
    this.detached = t, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this.parent = jt, !t && jt && (this.index = (jt.scopes || (jt.scopes = [])).push(
      this
    ) - 1);
  }
  get active() {
    return this._active;
  }
  pause() {
    if (this._active) {
      this._isPaused = !0;
      let t, n;
      if (this.scopes)
        for (t = 0, n = this.scopes.length; t < n; t++)
          this.scopes[t].pause();
      for (t = 0, n = this.effects.length; t < n; t++)
        this.effects[t].pause();
    }
  }
  /**
   * Resumes the effect scope, including all child scopes and effects.
   */
  resume() {
    if (this._active && this._isPaused) {
      this._isPaused = !1;
      let t, n;
      if (this.scopes)
        for (t = 0, n = this.scopes.length; t < n; t++)
          this.scopes[t].resume();
      for (t = 0, n = this.effects.length; t < n; t++)
        this.effects[t].resume();
    }
  }
  run(t) {
    if (this._active) {
      const n = jt;
      try {
        return jt = this, t();
      } finally {
        jt = n;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = jt, jt = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    this._on > 0 && --this._on === 0 && (jt = this.prevScope, this.prevScope = void 0);
  }
  stop(t) {
    if (this._active) {
      this._active = !1;
      let n, s;
      for (n = 0, s = this.effects.length; n < s; n++)
        this.effects[n].stop();
      for (this.effects.length = 0, n = 0, s = this.cleanups.length; n < s; n++)
        this.cleanups[n]();
      if (this.cleanups.length = 0, this.scopes) {
        for (n = 0, s = this.scopes.length; n < s; n++)
          this.scopes[n].stop(!0);
        this.scopes.length = 0;
      }
      if (!this.detached && this.parent && !t) {
        const r = this.parent.scopes.pop();
        r && r !== this && (this.parent.scopes[this.index] = r, r.index = this.index);
      }
      this.parent = void 0;
    }
  }
}
function Jf() {
  return jt;
}
let tt;
const To = /* @__PURE__ */ new WeakSet();
class $c {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, jt && jt.active && jt.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, To.has(this) && (To.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Uc(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, _l(this), zc(this);
    const t = tt, n = fn;
    tt = this, fn = !0;
    try {
      return this.fn();
    } finally {
      Hc(this), tt = t, fn = n, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        va(t);
      this.deps = this.depsTail = void 0, _l(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? To.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    Ko(this) && this.run();
  }
  get dirty() {
    return Ko(this);
  }
}
let Bc = 0, Nr, Pr;
function Uc(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = Pr, Pr = e;
    return;
  }
  e.next = Nr, Nr = e;
}
function ya() {
  Bc++;
}
function ba() {
  if (--Bc > 0)
    return;
  if (Pr) {
    let t = Pr;
    for (Pr = void 0; t; ) {
      const n = t.next;
      t.next = void 0, t.flags &= -9, t = n;
    }
  }
  let e;
  for (; Nr; ) {
    let t = Nr;
    for (Nr = void 0; t; ) {
      const n = t.next;
      if (t.next = void 0, t.flags &= -9, t.flags & 1)
        try {
          t.trigger();
        } catch (s) {
          e || (e = s);
        }
      t = n;
    }
  }
  if (e) throw e;
}
function zc(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Hc(e) {
  let t, n = e.depsTail, s = n;
  for (; s; ) {
    const r = s.prevDep;
    s.version === -1 ? (s === n && (n = r), va(s), Qf(s)) : t = s, s.dep.activeLink = s.prevActiveLink, s.prevActiveLink = void 0, s = r;
  }
  e.deps = t, e.depsTail = n;
}
function Ko(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (Wc(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function Wc(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === Hr) || (e.globalVersion = Hr, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !Ko(e))))
    return;
  e.flags |= 2;
  const t = e.dep, n = tt, s = fn;
  tt = e, fn = !0;
  try {
    zc(e);
    const r = e.fn(e._value);
    (t.version === 0 || is(r, e._value)) && (e.flags |= 128, e._value = r, t.version++);
  } catch (r) {
    throw t.version++, r;
  } finally {
    tt = n, fn = s, Hc(e), e.flags &= -3;
  }
}
function va(e, t = !1) {
  const { dep: n, prevSub: s, nextSub: r } = e;
  if (s && (s.nextSub = r, e.prevSub = void 0), r && (r.prevSub = s, e.nextSub = void 0), n.subs === e && (n.subs = s, !s && n.computed)) {
    n.computed.flags &= -5;
    for (let i = n.computed.deps; i; i = i.nextDep)
      va(i, !0);
  }
  !t && !--n.sc && n.map && n.map.delete(n.key);
}
function Qf(e) {
  const { prevDep: t, nextDep: n } = e;
  t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
let fn = !0;
const jc = [];
function Hn() {
  jc.push(fn), fn = !1;
}
function Wn() {
  const e = jc.pop();
  fn = e === void 0 ? !0 : e;
}
function _l(e) {
  const { cleanup: t } = e;
  if (e.cleanup = void 0, t) {
    const n = tt;
    tt = void 0;
    try {
      t();
    } finally {
      tt = n;
    }
  }
}
let Hr = 0;
class eh {
  constructor(t, n) {
    this.sub = t, this.dep = n, this.version = n.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class wa {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(t) {
    if (!tt || !fn || tt === this.computed)
      return;
    let n = this.activeLink;
    if (n === void 0 || n.sub !== tt)
      n = this.activeLink = new eh(tt, this), tt.deps ? (n.prevDep = tt.depsTail, tt.depsTail.nextDep = n, tt.depsTail = n) : tt.deps = tt.depsTail = n, qc(n);
    else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
      const s = n.nextDep;
      s.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = s), n.prevDep = tt.depsTail, n.nextDep = void 0, tt.depsTail.nextDep = n, tt.depsTail = n, tt.deps === n && (tt.deps = s);
    }
    return n;
  }
  trigger(t) {
    this.version++, Hr++, this.notify(t);
  }
  notify(t) {
    ya();
    try {
      for (let n = this.subs; n; n = n.prevSub)
        n.sub.notify() && n.sub.dep.notify();
    } finally {
      ba();
    }
  }
}
function qc(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let s = t.deps; s; s = s.nextDep)
        qc(s);
    }
    const n = e.dep.subs;
    n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
  }
}
const Go = /* @__PURE__ */ new WeakMap(), Rs = Symbol(
  ""
), Yo = Symbol(
  ""
), Wr = Symbol(
  ""
);
function Lt(e, t, n) {
  if (fn && tt) {
    let s = Go.get(e);
    s || Go.set(e, s = /* @__PURE__ */ new Map());
    let r = s.get(n);
    r || (s.set(n, r = new wa()), r.map = s, r.key = n), r.track();
  }
}
function $n(e, t, n, s, r, i) {
  const o = Go.get(e);
  if (!o) {
    Hr++;
    return;
  }
  const a = (l) => {
    l && l.trigger();
  };
  if (ya(), t === "clear")
    o.forEach(a);
  else {
    const l = be(e), h = l && _a(n);
    if (l && n === "length") {
      const u = Number(s);
      o.forEach((k, b) => {
        (b === "length" || b === Wr || !fs(b) && b >= u) && a(k);
      });
    } else
      switch ((n !== void 0 || o.has(void 0)) && a(o.get(n)), h && a(o.get(Wr)), t) {
        case "add":
          l ? h && a(o.get("length")) : (a(o.get(Rs)), Qs(e) && a(o.get(Yo)));
          break;
        case "delete":
          l || (a(o.get(Rs)), Qs(e) && a(o.get(Yo)));
          break;
        case "set":
          Qs(e) && a(o.get(Rs));
          break;
      }
  }
  ba();
}
function Gs(e) {
  const t = We(e);
  return t === e ? t : (Lt(t, "iterate", Wr), an(e) ? t : t.map(xt));
}
function Yi(e) {
  return Lt(e = We(e), "iterate", Wr), e;
}
const th = {
  __proto__: null,
  [Symbol.iterator]() {
    return Ao(this, Symbol.iterator, xt);
  },
  concat(...e) {
    return Gs(this).concat(
      ...e.map((t) => be(t) ? Gs(t) : t)
    );
  },
  entries() {
    return Ao(this, "entries", (e) => (e[1] = xt(e[1]), e));
  },
  every(e, t) {
    return Dn(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return Dn(this, "filter", e, t, (n) => n.map(xt), arguments);
  },
  find(e, t) {
    return Dn(this, "find", e, t, xt, arguments);
  },
  findIndex(e, t) {
    return Dn(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return Dn(this, "findLast", e, t, xt, arguments);
  },
  findLastIndex(e, t) {
    return Dn(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return Dn(this, "forEach", e, t, void 0, arguments);
  },
  includes(...e) {
    return So(this, "includes", e);
  },
  indexOf(...e) {
    return So(this, "indexOf", e);
  },
  join(e) {
    return Gs(this).join(e);
  },
  // keys() iterator only reads `length`, no optimisation required
  lastIndexOf(...e) {
    return So(this, "lastIndexOf", e);
  },
  map(e, t) {
    return Dn(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return yr(this, "pop");
  },
  push(...e) {
    return yr(this, "push", e);
  },
  reduce(e, ...t) {
    return yl(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return yl(this, "reduceRight", e, t);
  },
  shift() {
    return yr(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return Dn(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return yr(this, "splice", e);
  },
  toReversed() {
    return Gs(this).toReversed();
  },
  toSorted(e) {
    return Gs(this).toSorted(e);
  },
  toSpliced(...e) {
    return Gs(this).toSpliced(...e);
  },
  unshift(...e) {
    return yr(this, "unshift", e);
  },
  values() {
    return Ao(this, "values", xt);
  }
};
function Ao(e, t, n) {
  const s = Yi(e), r = s[t]();
  return s !== e && !an(e) && (r._next = r.next, r.next = () => {
    const i = r._next();
    return i.value && (i.value = n(i.value)), i;
  }), r;
}
const nh = Array.prototype;
function Dn(e, t, n, s, r, i) {
  const o = Yi(e), a = o !== e && !an(e), l = o[t];
  if (l !== nh[t]) {
    const k = l.apply(e, i);
    return a ? xt(k) : k;
  }
  let h = n;
  o !== e && (a ? h = function(k, b) {
    return n.call(this, xt(k), b, e);
  } : n.length > 2 && (h = function(k, b) {
    return n.call(this, k, b, e);
  }));
  const u = l.call(o, h, s);
  return a && r ? r(u) : u;
}
function yl(e, t, n, s) {
  const r = Yi(e);
  let i = n;
  return r !== e && (an(e) ? n.length > 3 && (i = function(o, a, l) {
    return n.call(this, o, a, l, e);
  }) : i = function(o, a, l) {
    return n.call(this, o, xt(a), l, e);
  }), r[t](i, ...s);
}
function So(e, t, n) {
  const s = We(e);
  Lt(s, "iterate", Wr);
  const r = s[t](...n);
  return (r === -1 || r === !1) && Aa(n[0]) ? (n[0] = We(n[0]), s[t](...n)) : r;
}
function yr(e, t, n = []) {
  Hn(), ya();
  const s = We(e)[t].apply(e, n);
  return ba(), Wn(), s;
}
const sh = /* @__PURE__ */ pa("__proto__,__v_isRef,__isVue"), Vc = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(fs)
);
function rh(e) {
  fs(e) || (e = String(e));
  const t = We(this);
  return Lt(t, "has", e), t.hasOwnProperty(e);
}
class Kc {
  constructor(t = !1, n = !1) {
    this._isReadonly = t, this._isShallow = n;
  }
  get(t, n, s) {
    if (n === "__v_skip") return t.__v_skip;
    const r = this._isReadonly, i = this._isShallow;
    if (n === "__v_isReactive")
      return !r;
    if (n === "__v_isReadonly")
      return r;
    if (n === "__v_isShallow")
      return i;
    if (n === "__v_raw")
      return s === (r ? i ? ph : Zc : i ? Xc : Yc).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(s) ? t : void 0;
    const o = be(t);
    if (!r) {
      let l;
      if (o && (l = th[n]))
        return l;
      if (n === "hasOwnProperty")
        return rh;
    }
    const a = Reflect.get(
      t,
      n,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      Nt(t) ? t : s
    );
    return (fs(n) ? Vc.has(n) : sh(n)) || (r || Lt(t, "get", n), i) ? a : Nt(a) ? o && _a(n) ? a : a.value : ot(a) ? r ? Jc(a) : Xi(a) : a;
  }
}
class Gc extends Kc {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, n, s, r) {
    let i = t[n];
    if (!this._isShallow) {
      const l = cs(i);
      if (!an(s) && !cs(s) && (i = We(i), s = We(s)), !be(t) && Nt(i) && !Nt(s))
        return l ? !1 : (i.value = s, !0);
    }
    const o = be(t) && _a(n) ? Number(n) < t.length : je(t, n), a = Reflect.set(
      t,
      n,
      s,
      Nt(t) ? t : r
    );
    return t === We(r) && (o ? is(s, i) && $n(t, "set", n, s) : $n(t, "add", n, s)), a;
  }
  deleteProperty(t, n) {
    const s = je(t, n);
    t[n];
    const r = Reflect.deleteProperty(t, n);
    return r && s && $n(t, "delete", n, void 0), r;
  }
  has(t, n) {
    const s = Reflect.has(t, n);
    return (!fs(n) || !Vc.has(n)) && Lt(t, "has", n), s;
  }
  ownKeys(t) {
    return Lt(
      t,
      "iterate",
      be(t) ? "length" : Rs
    ), Reflect.ownKeys(t);
  }
}
class ih extends Kc {
  constructor(t = !1) {
    super(!0, t);
  }
  set(t, n) {
    return !0;
  }
  deleteProperty(t, n) {
    return !0;
  }
}
const oh = /* @__PURE__ */ new Gc(), ah = /* @__PURE__ */ new ih(), lh = /* @__PURE__ */ new Gc(!0);
const Xo = (e) => e, ci = (e) => Reflect.getPrototypeOf(e);
function ch(e, t, n) {
  return function(...s) {
    const r = this.__v_raw, i = We(r), o = Qs(i), a = e === "entries" || e === Symbol.iterator && o, l = e === "keys" && o, h = r[e](...s), u = n ? Xo : t ? Oi : xt;
    return !t && Lt(
      i,
      "iterate",
      l ? Yo : Rs
    ), {
      // iterator protocol
      next() {
        const { value: k, done: b } = h.next();
        return b ? { value: k, done: b } : {
          value: a ? [u(k[0]), u(k[1])] : u(k),
          done: b
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function ui(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function uh(e, t) {
  const n = {
    get(r) {
      const i = this.__v_raw, o = We(i), a = We(r);
      e || (is(r, a) && Lt(o, "get", r), Lt(o, "get", a));
      const { has: l } = ci(o), h = t ? Xo : e ? Oi : xt;
      if (l.call(o, r))
        return h(i.get(r));
      if (l.call(o, a))
        return h(i.get(a));
      i !== o && i.get(r);
    },
    get size() {
      const r = this.__v_raw;
      return !e && Lt(We(r), "iterate", Rs), Reflect.get(r, "size", r);
    },
    has(r) {
      const i = this.__v_raw, o = We(i), a = We(r);
      return e || (is(r, a) && Lt(o, "has", r), Lt(o, "has", a)), r === a ? i.has(r) : i.has(r) || i.has(a);
    },
    forEach(r, i) {
      const o = this, a = o.__v_raw, l = We(a), h = t ? Xo : e ? Oi : xt;
      return !e && Lt(l, "iterate", Rs), a.forEach((u, k) => r.call(i, h(u), h(k), o));
    }
  };
  return Pt(
    n,
    e ? {
      add: ui("add"),
      set: ui("set"),
      delete: ui("delete"),
      clear: ui("clear")
    } : {
      add(r) {
        !t && !an(r) && !cs(r) && (r = We(r));
        const i = We(this);
        return ci(i).has.call(i, r) || (i.add(r), $n(i, "add", r, r)), this;
      },
      set(r, i) {
        !t && !an(i) && !cs(i) && (i = We(i));
        const o = We(this), { has: a, get: l } = ci(o);
        let h = a.call(o, r);
        h || (r = We(r), h = a.call(o, r));
        const u = l.call(o, r);
        return o.set(r, i), h ? is(i, u) && $n(o, "set", r, i) : $n(o, "add", r, i), this;
      },
      delete(r) {
        const i = We(this), { has: o, get: a } = ci(i);
        let l = o.call(i, r);
        l || (r = We(r), l = o.call(i, r)), a && a.call(i, r);
        const h = i.delete(r);
        return l && $n(i, "delete", r, void 0), h;
      },
      clear() {
        const r = We(this), i = r.size !== 0, o = r.clear();
        return i && $n(
          r,
          "clear",
          void 0,
          void 0
        ), o;
      }
    }
  ), [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ].forEach((r) => {
    n[r] = ch(r, e, t);
  }), n;
}
function ka(e, t) {
  const n = uh(e, t);
  return (s, r, i) => r === "__v_isReactive" ? !e : r === "__v_isReadonly" ? e : r === "__v_raw" ? s : Reflect.get(
    je(n, r) && r in s ? n : s,
    r,
    i
  );
}
const fh = {
  get: /* @__PURE__ */ ka(!1, !1)
}, hh = {
  get: /* @__PURE__ */ ka(!1, !0)
}, dh = {
  get: /* @__PURE__ */ ka(!0, !1)
};
const Yc = /* @__PURE__ */ new WeakMap(), Xc = /* @__PURE__ */ new WeakMap(), Zc = /* @__PURE__ */ new WeakMap(), ph = /* @__PURE__ */ new WeakMap();
function mh(e) {
  switch (e) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
function gh(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : mh(Hf(e));
}
function Xi(e) {
  return cs(e) ? e : Ta(
    e,
    !1,
    oh,
    fh,
    Yc
  );
}
function _h(e) {
  return Ta(
    e,
    !1,
    lh,
    hh,
    Xc
  );
}
function Jc(e) {
  return Ta(
    e,
    !0,
    ah,
    dh,
    Zc
  );
}
function Ta(e, t, n, s, r) {
  if (!ot(e) || e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const i = gh(e);
  if (i === 0)
    return e;
  const o = r.get(e);
  if (o)
    return o;
  const a = new Proxy(
    e,
    i === 2 ? s : n
  );
  return r.set(e, a), a;
}
function er(e) {
  return cs(e) ? er(e.__v_raw) : !!(e && e.__v_isReactive);
}
function cs(e) {
  return !!(e && e.__v_isReadonly);
}
function an(e) {
  return !!(e && e.__v_isShallow);
}
function Aa(e) {
  return e ? !!e.__v_raw : !1;
}
function We(e) {
  const t = e && e.__v_raw;
  return t ? We(t) : e;
}
function yh(e) {
  return !je(e, "__v_skip") && Object.isExtensible(e) && qo(e, "__v_skip", !0), e;
}
const xt = (e) => ot(e) ? Xi(e) : e, Oi = (e) => ot(e) ? Jc(e) : e;
function Nt(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function oe(e) {
  return bh(e, !1);
}
function bh(e, t) {
  return Nt(e) ? e : new vh(e, t);
}
class vh {
  constructor(t, n) {
    this.dep = new wa(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? t : We(t), this._value = n ? t : xt(t), this.__v_isShallow = n;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const n = this._rawValue, s = this.__v_isShallow || an(t) || cs(t);
    t = s ? t : We(t), is(t, n) && (this._rawValue = t, this._value = s ? t : xt(t), this.dep.trigger());
  }
}
function S(e) {
  return Nt(e) ? e.value : e;
}
const wh = {
  get: (e, t, n) => t === "__v_raw" ? e : S(Reflect.get(e, t, n)),
  set: (e, t, n, s) => {
    const r = e[t];
    return Nt(r) && !Nt(n) ? (r.value = n, !0) : Reflect.set(e, t, n, s);
  }
};
function Qc(e) {
  return er(e) ? e : new Proxy(e, wh);
}
class kh {
  constructor(t, n, s) {
    this.fn = t, this.setter = n, this._value = void 0, this.dep = new wa(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Hr - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = s;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    tt !== this)
      return Uc(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return Wc(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
function Th(e, t, n = !1) {
  let s, r;
  return xe(e) ? s = e : (s = e.get, r = e.set), new kh(s, r, n);
}
const fi = {}, Li = /* @__PURE__ */ new WeakMap();
let As;
function Ah(e, t = !1, n = As) {
  if (n) {
    let s = Li.get(n);
    s || Li.set(n, s = []), s.push(e);
  }
}
function Sh(e, t, n = Qe) {
  const { immediate: s, deep: r, once: i, scheduler: o, augmentJob: a, call: l } = n, h = (C) => r ? C : an(C) || r === !1 || r === 0 ? Bn(C, 1) : Bn(C);
  let u, k, b, I, B = !1, H = !1;
  if (Nt(e) ? (k = () => e.value, B = an(e)) : er(e) ? (k = () => h(e), B = !0) : be(e) ? (H = !0, B = e.some((C) => er(C) || an(C)), k = () => e.map((C) => {
    if (Nt(C))
      return C.value;
    if (er(C))
      return h(C);
    if (xe(C))
      return l ? l(C, 2) : C();
  })) : xe(e) ? t ? k = l ? () => l(e, 2) : e : k = () => {
    if (b) {
      Hn();
      try {
        b();
      } finally {
        Wn();
      }
    }
    const C = As;
    As = u;
    try {
      return l ? l(e, 3, [I]) : e(I);
    } finally {
      As = C;
    }
  } : k = Sn, t && r) {
    const C = k, v = r === !0 ? 1 / 0 : r;
    k = () => Bn(C(), v);
  }
  const he = Jf(), R = () => {
    u.stop(), he && he.active && ga(he.effects, u);
  };
  if (i && t) {
    const C = t;
    t = (...v) => {
      C(...v), R();
    };
  }
  let le = H ? new Array(e.length).fill(fi) : fi;
  const de = (C) => {
    if (!(!(u.flags & 1) || !u.dirty && !C))
      if (t) {
        const v = u.run();
        if (r || B || (H ? v.some((q, K) => is(q, le[K])) : is(v, le))) {
          b && b();
          const q = As;
          As = u;
          try {
            const K = [
              v,
              // pass undefined as the old value when it's changed for the first time
              le === fi ? void 0 : H && le[0] === fi ? [] : le,
              I
            ];
            le = v, l ? l(t, 3, K) : (
              // @ts-expect-error
              t(...K)
            );
          } finally {
            As = q;
          }
        }
      } else
        u.run();
  };
  return a && a(de), u = new $c(k), u.scheduler = o ? () => o(de, !1) : de, I = (C) => Ah(C, !1, u), b = u.onStop = () => {
    const C = Li.get(u);
    if (C) {
      if (l)
        l(C, 4);
      else
        for (const v of C) v();
      Li.delete(u);
    }
  }, t ? s ? de(!0) : le = u.run() : o ? o(de.bind(null, !0), !0) : u.run(), R.pause = u.pause.bind(u), R.resume = u.resume.bind(u), R.stop = R, R;
}
function Bn(e, t = 1 / 0, n) {
  if (t <= 0 || !ot(e) || e.__v_skip || (n = n || /* @__PURE__ */ new Set(), n.has(e)))
    return e;
  if (n.add(e), t--, Nt(e))
    Bn(e.value, t, n);
  else if (be(e))
    for (let s = 0; s < e.length; s++)
      Bn(e[s], t, n);
  else if (Ic(e) || Qs(e))
    e.forEach((s) => {
      Bn(s, t, n);
    });
  else if (Nc(e)) {
    for (const s in e)
      Bn(e[s], t, n);
    for (const s of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, s) && Bn(e[s], t, n);
  }
  return e;
}
/**
* @vue/runtime-core v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function Kr(e, t, n, s) {
  try {
    return s ? e(...s) : e();
  } catch (r) {
    Zi(r, t, n);
  }
}
function Cn(e, t, n, s) {
  if (xe(e)) {
    const r = Kr(e, t, n, s);
    return r && Oc(r) && r.catch((i) => {
      Zi(i, t, n);
    }), r;
  }
  if (be(e)) {
    const r = [];
    for (let i = 0; i < e.length; i++)
      r.push(Cn(e[i], t, n, s));
    return r;
  }
}
function Zi(e, t, n, s = !0) {
  const r = t ? t.vnode : null, { errorHandler: i, throwUnhandledErrorInProduction: o } = t && t.appContext.config || Qe;
  if (t) {
    let a = t.parent;
    const l = t.proxy, h = `https://vuejs.org/error-reference/#runtime-${n}`;
    for (; a; ) {
      const u = a.ec;
      if (u) {
        for (let k = 0; k < u.length; k++)
          if (u[k](e, l, h) === !1)
            return;
      }
      a = a.parent;
    }
    if (i) {
      Hn(), Kr(i, null, 10, [
        e,
        l,
        h
      ]), Wn();
      return;
    }
  }
  xh(e, n, r, s, o);
}
function xh(e, t, n, s = !0, r = !1) {
  if (r)
    throw e;
  console.error(e);
}
const $t = [];
let Tn = -1;
const tr = [];
let ns = null, Ys = 0;
const eu = /* @__PURE__ */ Promise.resolve();
let Ni = null;
function rs(e) {
  const t = Ni || eu;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function Eh(e) {
  let t = Tn + 1, n = $t.length;
  for (; t < n; ) {
    const s = t + n >>> 1, r = $t[s], i = jr(r);
    i < e || i === e && r.flags & 2 ? t = s + 1 : n = s;
  }
  return t;
}
function Sa(e) {
  if (!(e.flags & 1)) {
    const t = jr(e), n = $t[$t.length - 1];
    !n || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= jr(n) ? $t.push(e) : $t.splice(Eh(t), 0, e), e.flags |= 1, tu();
  }
}
function tu() {
  Ni || (Ni = eu.then(su));
}
function Ch(e) {
  be(e) ? tr.push(...e) : ns && e.id === -1 ? ns.splice(Ys + 1, 0, e) : e.flags & 1 || (tr.push(e), e.flags |= 1), tu();
}
function bl(e, t, n = Tn + 1) {
  for (; n < $t.length; n++) {
    const s = $t[n];
    if (s && s.flags & 2) {
      if (e && s.id !== e.uid)
        continue;
      $t.splice(n, 1), n--, s.flags & 4 && (s.flags &= -2), s(), s.flags & 4 || (s.flags &= -2);
    }
  }
}
function nu(e) {
  if (tr.length) {
    const t = [...new Set(tr)].sort(
      (n, s) => jr(n) - jr(s)
    );
    if (tr.length = 0, ns) {
      ns.push(...t);
      return;
    }
    for (ns = t, Ys = 0; Ys < ns.length; Ys++) {
      const n = ns[Ys];
      n.flags & 4 && (n.flags &= -2), n.flags & 8 || n(), n.flags &= -2;
    }
    ns = null, Ys = 0;
  }
}
const jr = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function su(e) {
  try {
    for (Tn = 0; Tn < $t.length; Tn++) {
      const t = $t[Tn];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), Kr(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; Tn < $t.length; Tn++) {
      const t = $t[Tn];
      t && (t.flags &= -2);
    }
    Tn = -1, $t.length = 0, nu(), Ni = null, ($t.length || tr.length) && su();
  }
}
let on = null, ru = null;
function Pi(e) {
  const t = on;
  return on = e, ru = e && e.type.__scopeId || null, t;
}
function Rh(e, t = on, n) {
  if (!t || e._n)
    return e;
  const s = (...r) => {
    s._d && Cl(-1);
    const i = Pi(t);
    let o;
    try {
      o = e(...r);
    } finally {
      Pi(i), s._d && Cl(1);
    }
    return o;
  };
  return s._n = !0, s._c = !0, s._d = !0, s;
}
function es(e, t) {
  if (on === null)
    return e;
  const n = ro(on), s = e.dirs || (e.dirs = []);
  for (let r = 0; r < t.length; r++) {
    let [i, o, a, l = Qe] = t[r];
    i && (xe(i) && (i = {
      mounted: i,
      updated: i
    }), i.deep && Bn(o), s.push({
      dir: i,
      instance: n,
      value: o,
      oldValue: void 0,
      arg: a,
      modifiers: l
    }));
  }
  return e;
}
function bs(e, t, n, s) {
  const r = e.dirs, i = t && t.dirs;
  for (let o = 0; o < r.length; o++) {
    const a = r[o];
    i && (a.oldValue = i[o].value);
    let l = a.dir[s];
    l && (Hn(), Cn(l, n, 8, [
      e.el,
      a,
      e,
      t
    ]), Wn());
  }
}
const Ih = Symbol("_vte"), Oh = (e) => e.__isTeleport;
function xa(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, xa(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function Ji(e, t) {
  return xe(e) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    Pt({ name: e.name }, t, { setup: e })
  ) : e;
}
function iu(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
function Mr(e, t, n, s, r = !1) {
  if (be(e)) {
    e.forEach(
      (B, H) => Mr(
        B,
        t && (be(t) ? t[H] : t),
        n,
        s,
        r
      )
    );
    return;
  }
  if (Dr(s) && !r) {
    s.shapeFlag & 512 && s.type.__asyncResolved && s.component.subTree.component && Mr(e, t, n, s.component.subTree);
    return;
  }
  const i = s.shapeFlag & 4 ? ro(s.component) : s.el, o = r ? null : i, { i: a, r: l } = e, h = t && t.r, u = a.refs === Qe ? a.refs = {} : a.refs, k = a.setupState, b = We(k), I = k === Qe ? () => !1 : (B) => je(b, B);
  if (h != null && h !== l && (pt(h) ? (u[h] = null, I(h) && (k[h] = null)) : Nt(h) && (h.value = null)), xe(l))
    Kr(l, a, 12, [o, u]);
  else {
    const B = pt(l), H = Nt(l);
    if (B || H) {
      const he = () => {
        if (e.f) {
          const R = B ? I(l) ? k[l] : u[l] : l.value;
          r ? be(R) && ga(R, i) : be(R) ? R.includes(i) || R.push(i) : B ? (u[l] = [i], I(l) && (k[l] = u[l])) : (l.value = [i], e.k && (u[e.k] = l.value));
        } else B ? (u[l] = o, I(l) && (k[l] = o)) : H && (l.value = o, e.k && (u[e.k] = o));
      };
      o ? (he.id = -1, Xt(he, n)) : he();
    }
  }
}
Gi().requestIdleCallback;
Gi().cancelIdleCallback;
const Dr = (e) => !!e.type.__asyncLoader, ou = (e) => e.type.__isKeepAlive;
function Lh(e, t) {
  au(e, "a", t);
}
function Nh(e, t) {
  au(e, "da", t);
}
function au(e, t, n = Bt) {
  const s = e.__wdc || (e.__wdc = () => {
    let r = n;
    for (; r; ) {
      if (r.isDeactivated)
        return;
      r = r.parent;
    }
    return e();
  });
  if (Qi(t, s, n), n) {
    let r = n.parent;
    for (; r && r.parent; )
      ou(r.parent.vnode) && Ph(s, t, n, r), r = r.parent;
  }
}
function Ph(e, t, n, s) {
  const r = Qi(
    t,
    e,
    s,
    !0
    /* prepend */
  );
  Gr(() => {
    ga(s[t], r);
  }, n);
}
function Qi(e, t, n = Bt, s = !1) {
  if (n) {
    const r = n[e] || (n[e] = []), i = t.__weh || (t.__weh = (...o) => {
      Hn();
      const a = Yr(n), l = Cn(t, n, e, o);
      return a(), Wn(), l;
    });
    return s ? r.unshift(i) : r.push(i), i;
  }
}
const jn = (e) => (t, n = Bt) => {
  (!Vr || e === "sp") && Qi(e, (...s) => t(...s), n);
}, Mh = jn("bm"), eo = jn("m"), Dh = jn(
  "bu"
), Fh = jn("u"), to = jn(
  "bum"
), Gr = jn("um"), $h = jn(
  "sp"
), Bh = jn("rtg"), Uh = jn("rtc");
function zh(e, t = Bt) {
  Qi("ec", e, t);
}
const Hh = Symbol.for("v-ndc");
function bt(e, t, n, s) {
  let r;
  const i = n, o = be(e);
  if (o || pt(e)) {
    const a = o && er(e);
    let l = !1, h = !1;
    a && (l = !an(e), h = cs(e), e = Yi(e)), r = new Array(e.length);
    for (let u = 0, k = e.length; u < k; u++)
      r[u] = t(
        l ? h ? Oi(xt(e[u])) : xt(e[u]) : e[u],
        u,
        void 0,
        i
      );
  } else if (typeof e == "number") {
    r = new Array(e);
    for (let a = 0; a < e; a++)
      r[a] = t(a + 1, a, void 0, i);
  } else if (ot(e))
    if (e[Symbol.iterator])
      r = Array.from(
        e,
        (a, l) => t(a, l, void 0, i)
      );
    else {
      const a = Object.keys(e);
      r = new Array(a.length);
      for (let l = 0, h = a.length; l < h; l++) {
        const u = a[l];
        r[l] = t(e[u], u, l, i);
      }
    }
  else
    r = [];
  return r;
}
const Zo = (e) => e ? Cu(e) ? ro(e) : Zo(e.parent) : null, Fr = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ Pt(/* @__PURE__ */ Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => e.props,
    $attrs: (e) => e.attrs,
    $slots: (e) => e.slots,
    $refs: (e) => e.refs,
    $parent: (e) => Zo(e.parent),
    $root: (e) => Zo(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => cu(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      Sa(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = rs.bind(e.proxy)),
    $watch: (e) => ud.bind(e)
  })
), xo = (e, t) => e !== Qe && !e.__isScriptSetup && je(e, t), Wh = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: n, setupState: s, data: r, props: i, accessCache: o, type: a, appContext: l } = e;
    let h;
    if (t[0] !== "$") {
      const I = o[t];
      if (I !== void 0)
        switch (I) {
          case 1:
            return s[t];
          case 2:
            return r[t];
          case 4:
            return n[t];
          case 3:
            return i[t];
        }
      else {
        if (xo(s, t))
          return o[t] = 1, s[t];
        if (r !== Qe && je(r, t))
          return o[t] = 2, r[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (h = e.propsOptions[0]) && je(h, t)
        )
          return o[t] = 3, i[t];
        if (n !== Qe && je(n, t))
          return o[t] = 4, n[t];
        Jo && (o[t] = 0);
      }
    }
    const u = Fr[t];
    let k, b;
    if (u)
      return t === "$attrs" && Lt(e.attrs, "get", ""), u(e);
    if (
      // css module (injected by vue-loader)
      (k = a.__cssModules) && (k = k[t])
    )
      return k;
    if (n !== Qe && je(n, t))
      return o[t] = 4, n[t];
    if (
      // global properties
      b = l.config.globalProperties, je(b, t)
    )
      return b[t];
  },
  set({ _: e }, t, n) {
    const { data: s, setupState: r, ctx: i } = e;
    return xo(r, t) ? (r[t] = n, !0) : s !== Qe && je(s, t) ? (s[t] = n, !0) : je(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (i[t] = n, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: n, ctx: s, appContext: r, propsOptions: i }
  }, o) {
    let a;
    return !!n[o] || e !== Qe && je(e, o) || xo(t, o) || (a = i[0]) && je(a, o) || je(s, o) || je(Fr, o) || je(r.config.globalProperties, o);
  },
  defineProperty(e, t, n) {
    return n.get != null ? e._.accessCache[t] = 0 : je(n, "value") && this.set(e, t, n.value, null), Reflect.defineProperty(e, t, n);
  }
};
function vl(e) {
  return be(e) ? e.reduce(
    (t, n) => (t[n] = null, t),
    {}
  ) : e;
}
let Jo = !0;
function jh(e) {
  const t = cu(e), n = e.proxy, s = e.ctx;
  Jo = !1, t.beforeCreate && wl(t.beforeCreate, e, "bc");
  const {
    // state
    data: r,
    computed: i,
    methods: o,
    watch: a,
    provide: l,
    inject: h,
    // lifecycle
    created: u,
    beforeMount: k,
    mounted: b,
    beforeUpdate: I,
    updated: B,
    activated: H,
    deactivated: he,
    beforeDestroy: R,
    beforeUnmount: le,
    destroyed: de,
    unmounted: C,
    render: v,
    renderTracked: q,
    renderTriggered: K,
    errorCaptured: ae,
    serverPrefetch: Oe,
    // public API
    expose: _e,
    inheritAttrs: Le,
    // assets
    components: ve,
    directives: Ve,
    filters: Fe
  } = t;
  if (h && qh(h, s, null), o)
    for (const ye in o) {
      const pe = o[ye];
      xe(pe) && (s[ye] = pe.bind(n));
    }
  if (r) {
    const ye = r.call(n, n);
    ot(ye) && (e.data = Xi(ye));
  }
  if (Jo = !0, i)
    for (const ye in i) {
      const pe = i[ye], Ye = xe(pe) ? pe.bind(n, n) : xe(pe.get) ? pe.get.bind(n, n) : Sn, Xe = !xe(pe) && xe(pe.set) ? pe.set.bind(n) : Sn, st = fe({
        get: Ye,
        set: Xe
      });
      Object.defineProperty(s, ye, {
        enumerable: !0,
        configurable: !0,
        get: () => st.value,
        set: (Ke) => st.value = Ke
      });
    }
  if (a)
    for (const ye in a)
      lu(a[ye], s, n, ye);
  if (l) {
    const ye = xe(l) ? l.call(n) : l;
    Reflect.ownKeys(ye).forEach((pe) => {
      Zh(pe, ye[pe]);
    });
  }
  u && wl(u, e, "c");
  function ce(ye, pe) {
    be(pe) ? pe.forEach((Ye) => ye(Ye.bind(n))) : pe && ye(pe.bind(n));
  }
  if (ce(Mh, k), ce(eo, b), ce(Dh, I), ce(Fh, B), ce(Lh, H), ce(Nh, he), ce(zh, ae), ce(Uh, q), ce(Bh, K), ce(to, le), ce(Gr, C), ce($h, Oe), be(_e))
    if (_e.length) {
      const ye = e.exposed || (e.exposed = {});
      _e.forEach((pe) => {
        Object.defineProperty(ye, pe, {
          get: () => n[pe],
          set: (Ye) => n[pe] = Ye,
          enumerable: !0
        });
      });
    } else e.exposed || (e.exposed = {});
  v && e.render === Sn && (e.render = v), Le != null && (e.inheritAttrs = Le), ve && (e.components = ve), Ve && (e.directives = Ve), Oe && iu(e);
}
function qh(e, t, n = Sn) {
  be(e) && (e = Qo(e));
  for (const s in e) {
    const r = e[s];
    let i;
    ot(r) ? "default" in r ? i = _i(
      r.from || s,
      r.default,
      !0
    ) : i = _i(r.from || s) : i = _i(r), Nt(i) ? Object.defineProperty(t, s, {
      enumerable: !0,
      configurable: !0,
      get: () => i.value,
      set: (o) => i.value = o
    }) : t[s] = i;
  }
}
function wl(e, t, n) {
  Cn(
    be(e) ? e.map((s) => s.bind(t.proxy)) : e.bind(t.proxy),
    t,
    n
  );
}
function lu(e, t, n, s) {
  let r = s.includes(".") ? ku(n, s) : () => n[s];
  if (pt(e)) {
    const i = t[e];
    xe(i) && Ot(r, i);
  } else if (xe(e))
    Ot(r, e.bind(n));
  else if (ot(e))
    if (be(e))
      e.forEach((i) => lu(i, t, n, s));
    else {
      const i = xe(e.handler) ? e.handler.bind(n) : t[e.handler];
      xe(i) && Ot(r, i, e);
    }
}
function cu(e) {
  const t = e.type, { mixins: n, extends: s } = t, {
    mixins: r,
    optionsCache: i,
    config: { optionMergeStrategies: o }
  } = e.appContext, a = i.get(t);
  let l;
  return a ? l = a : !r.length && !n && !s ? l = t : (l = {}, r.length && r.forEach(
    (h) => Mi(l, h, o, !0)
  ), Mi(l, t, o)), ot(t) && i.set(t, l), l;
}
function Mi(e, t, n, s = !1) {
  const { mixins: r, extends: i } = t;
  i && Mi(e, i, n, !0), r && r.forEach(
    (o) => Mi(e, o, n, !0)
  );
  for (const o in t)
    if (!(s && o === "expose")) {
      const a = Vh[o] || n && n[o];
      e[o] = a ? a(e[o], t[o]) : t[o];
    }
  return e;
}
const Vh = {
  data: kl,
  props: Tl,
  emits: Tl,
  // objects
  methods: Cr,
  computed: Cr,
  // lifecycle
  beforeCreate: Ft,
  created: Ft,
  beforeMount: Ft,
  mounted: Ft,
  beforeUpdate: Ft,
  updated: Ft,
  beforeDestroy: Ft,
  beforeUnmount: Ft,
  destroyed: Ft,
  unmounted: Ft,
  activated: Ft,
  deactivated: Ft,
  errorCaptured: Ft,
  serverPrefetch: Ft,
  // assets
  components: Cr,
  directives: Cr,
  // watch
  watch: Gh,
  // provide / inject
  provide: kl,
  inject: Kh
};
function kl(e, t) {
  return t ? e ? function() {
    return Pt(
      xe(e) ? e.call(this, this) : e,
      xe(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function Kh(e, t) {
  return Cr(Qo(e), Qo(t));
}
function Qo(e) {
  if (be(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++)
      t[e[n]] = e[n];
    return t;
  }
  return e;
}
function Ft(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function Cr(e, t) {
  return e ? Pt(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function Tl(e, t) {
  return e ? be(e) && be(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : Pt(
    /* @__PURE__ */ Object.create(null),
    vl(e),
    vl(t ?? {})
  ) : t;
}
function Gh(e, t) {
  if (!e) return t;
  if (!t) return e;
  const n = Pt(/* @__PURE__ */ Object.create(null), e);
  for (const s in t)
    n[s] = Ft(e[s], t[s]);
  return n;
}
function uu() {
  return {
    app: null,
    config: {
      isNativeTag: Uf,
      performance: !1,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: /* @__PURE__ */ Object.create(null),
    optionsCache: /* @__PURE__ */ new WeakMap(),
    propsCache: /* @__PURE__ */ new WeakMap(),
    emitsCache: /* @__PURE__ */ new WeakMap()
  };
}
let Yh = 0;
function Xh(e, t) {
  return function(s, r = null) {
    xe(s) || (s = Pt({}, s)), r != null && !ot(r) && (r = null);
    const i = uu(), o = /* @__PURE__ */ new WeakSet(), a = [];
    let l = !1;
    const h = i.app = {
      _uid: Yh++,
      _component: s,
      _props: r,
      _container: null,
      _context: i,
      _instance: null,
      version: Od,
      get config() {
        return i.config;
      },
      set config(u) {
      },
      use(u, ...k) {
        return o.has(u) || (u && xe(u.install) ? (o.add(u), u.install(h, ...k)) : xe(u) && (o.add(u), u(h, ...k))), h;
      },
      mixin(u) {
        return i.mixins.includes(u) || i.mixins.push(u), h;
      },
      component(u, k) {
        return k ? (i.components[u] = k, h) : i.components[u];
      },
      directive(u, k) {
        return k ? (i.directives[u] = k, h) : i.directives[u];
      },
      mount(u, k, b) {
        if (!l) {
          const I = h._ceVNode || xn(s, r);
          return I.appContext = i, b === !0 ? b = "svg" : b === !1 && (b = void 0), e(I, u, b), l = !0, h._container = u, u.__vue_app__ = h, ro(I.component);
        }
      },
      onUnmount(u) {
        a.push(u);
      },
      unmount() {
        l && (Cn(
          a,
          h._instance,
          16
        ), e(null, h._container), delete h._container.__vue_app__);
      },
      provide(u, k) {
        return i.provides[u] = k, h;
      },
      runWithContext(u) {
        const k = nr;
        nr = h;
        try {
          return u();
        } finally {
          nr = k;
        }
      }
    };
    return h;
  };
}
let nr = null;
function Zh(e, t) {
  if (Bt) {
    let n = Bt.provides;
    const s = Bt.parent && Bt.parent.provides;
    s === n && (n = Bt.provides = Object.create(s)), n[e] = t;
  }
}
function _i(e, t, n = !1) {
  const s = Sd();
  if (s || nr) {
    let r = nr ? nr._context.provides : s ? s.parent == null || s.ce ? s.vnode.appContext && s.vnode.appContext.provides : s.parent.provides : void 0;
    if (r && e in r)
      return r[e];
    if (arguments.length > 1)
      return n && xe(t) ? t.call(s && s.proxy) : t;
  }
}
const fu = {}, hu = () => Object.create(fu), du = (e) => Object.getPrototypeOf(e) === fu;
function Jh(e, t, n, s = !1) {
  const r = {}, i = hu();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), pu(e, t, r, i);
  for (const o in e.propsOptions[0])
    o in r || (r[o] = void 0);
  n ? e.props = s ? r : _h(r) : e.type.props ? e.props = r : e.props = i, e.attrs = i;
}
function Qh(e, t, n, s) {
  const {
    props: r,
    attrs: i,
    vnode: { patchFlag: o }
  } = e, a = We(r), [l] = e.propsOptions;
  let h = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (s || o > 0) && !(o & 16)
  ) {
    if (o & 8) {
      const u = e.vnode.dynamicProps;
      for (let k = 0; k < u.length; k++) {
        let b = u[k];
        if (no(e.emitsOptions, b))
          continue;
        const I = t[b];
        if (l)
          if (je(i, b))
            I !== i[b] && (i[b] = I, h = !0);
          else {
            const B = ls(b);
            r[B] = ea(
              l,
              a,
              B,
              I,
              e,
              !1
            );
          }
        else
          I !== i[b] && (i[b] = I, h = !0);
      }
    }
  } else {
    pu(e, t, r, i) && (h = !0);
    let u;
    for (const k in a)
      (!t || // for camelCase
      !je(t, k) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((u = hs(k)) === k || !je(t, u))) && (l ? n && // for camelCase
      (n[k] !== void 0 || // for kebab-case
      n[u] !== void 0) && (r[k] = ea(
        l,
        a,
        k,
        void 0,
        e,
        !0
      )) : delete r[k]);
    if (i !== a)
      for (const k in i)
        (!t || !je(t, k)) && (delete i[k], h = !0);
  }
  h && $n(e.attrs, "set", "");
}
function pu(e, t, n, s) {
  const [r, i] = e.propsOptions;
  let o = !1, a;
  if (t)
    for (let l in t) {
      if (Lr(l))
        continue;
      const h = t[l];
      let u;
      r && je(r, u = ls(l)) ? !i || !i.includes(u) ? n[u] = h : (a || (a = {}))[u] = h : no(e.emitsOptions, l) || (!(l in s) || h !== s[l]) && (s[l] = h, o = !0);
    }
  if (i) {
    const l = We(n), h = a || Qe;
    for (let u = 0; u < i.length; u++) {
      const k = i[u];
      n[k] = ea(
        r,
        l,
        k,
        h[k],
        e,
        !je(h, k)
      );
    }
  }
  return o;
}
function ea(e, t, n, s, r, i) {
  const o = e[n];
  if (o != null) {
    const a = je(o, "default");
    if (a && s === void 0) {
      const l = o.default;
      if (o.type !== Function && !o.skipFactory && xe(l)) {
        const { propsDefaults: h } = r;
        if (n in h)
          s = h[n];
        else {
          const u = Yr(r);
          s = h[n] = l.call(
            null,
            t
          ), u();
        }
      } else
        s = l;
      r.ce && r.ce._setProp(n, s);
    }
    o[
      0
      /* shouldCast */
    ] && (i && !a ? s = !1 : o[
      1
      /* shouldCastTrue */
    ] && (s === "" || s === hs(n)) && (s = !0));
  }
  return s;
}
const ed = /* @__PURE__ */ new WeakMap();
function mu(e, t, n = !1) {
  const s = n ? ed : t.propsCache, r = s.get(e);
  if (r)
    return r;
  const i = e.props, o = {}, a = [];
  let l = !1;
  if (!xe(e)) {
    const u = (k) => {
      l = !0;
      const [b, I] = mu(k, t, !0);
      Pt(o, b), I && a.push(...I);
    };
    !n && t.mixins.length && t.mixins.forEach(u), e.extends && u(e.extends), e.mixins && e.mixins.forEach(u);
  }
  if (!i && !l)
    return ot(e) && s.set(e, Js), Js;
  if (be(i))
    for (let u = 0; u < i.length; u++) {
      const k = ls(i[u]);
      Al(k) && (o[k] = Qe);
    }
  else if (i)
    for (const u in i) {
      const k = ls(u);
      if (Al(k)) {
        const b = i[u], I = o[k] = be(b) || xe(b) ? { type: b } : Pt({}, b), B = I.type;
        let H = !1, he = !0;
        if (be(B))
          for (let R = 0; R < B.length; ++R) {
            const le = B[R], de = xe(le) && le.name;
            if (de === "Boolean") {
              H = !0;
              break;
            } else de === "String" && (he = !1);
          }
        else
          H = xe(B) && B.name === "Boolean";
        I[
          0
          /* shouldCast */
        ] = H, I[
          1
          /* shouldCastTrue */
        ] = he, (H || je(I, "default")) && a.push(k);
      }
    }
  const h = [o, a];
  return ot(e) && s.set(e, h), h;
}
function Al(e) {
  return e[0] !== "$" && !Lr(e);
}
const Ea = (e) => e === "_" || e === "__" || e === "_ctx" || e === "$stable", Ca = (e) => be(e) ? e.map(An) : [An(e)], td = (e, t, n) => {
  if (t._n)
    return t;
  const s = Rh((...r) => Ca(t(...r)), n);
  return s._c = !1, s;
}, gu = (e, t, n) => {
  const s = e._ctx;
  for (const r in e) {
    if (Ea(r)) continue;
    const i = e[r];
    if (xe(i))
      t[r] = td(r, i, s);
    else if (i != null) {
      const o = Ca(i);
      t[r] = () => o;
    }
  }
}, _u = (e, t) => {
  const n = Ca(t);
  e.slots.default = () => n;
}, yu = (e, t, n) => {
  for (const s in t)
    (n || !Ea(s)) && (e[s] = t[s]);
}, nd = (e, t, n) => {
  const s = e.slots = hu();
  if (e.vnode.shapeFlag & 32) {
    const r = t.__;
    r && qo(s, "__", r, !0);
    const i = t._;
    i ? (yu(s, t, n), n && qo(s, "_", i, !0)) : gu(t, s);
  } else t && _u(e, t);
}, sd = (e, t, n) => {
  const { vnode: s, slots: r } = e;
  let i = !0, o = Qe;
  if (s.shapeFlag & 32) {
    const a = t._;
    a ? n && a === 1 ? i = !1 : yu(r, t, n) : (i = !t.$stable, gu(t, r)), o = t;
  } else t && (_u(e, t), o = { default: 1 });
  if (i)
    for (const a in r)
      !Ea(a) && o[a] == null && delete r[a];
}, Xt = _d;
function rd(e) {
  return id(e);
}
function id(e, t) {
  const n = Gi();
  n.__VUE__ = !0;
  const {
    insert: s,
    remove: r,
    patchProp: i,
    createElement: o,
    createText: a,
    createComment: l,
    setText: h,
    setElementText: u,
    parentNode: k,
    nextSibling: b,
    setScopeId: I = Sn,
    insertStaticContent: B
  } = e, H = (g, w, L, P = null, D = null, O = null, X = void 0, $ = null, V = !!w.dynamicChildren) => {
    if (g === w)
      return;
    g && !br(g, w) && (P = ct(g), Ke(g, D, O, !0), g = null), w.patchFlag === -2 && (V = !1, w.dynamicChildren = null);
    const { type: W, ref: ee, shapeFlag: Y } = w;
    switch (W) {
      case so:
        he(g, w, L, P);
        break;
      case us:
        R(g, w, L, P);
        break;
      case yi:
        g == null && le(w, L, P, X);
        break;
      case Ie:
        ve(
          g,
          w,
          L,
          P,
          D,
          O,
          X,
          $,
          V
        );
        break;
      default:
        Y & 1 ? v(
          g,
          w,
          L,
          P,
          D,
          O,
          X,
          $,
          V
        ) : Y & 6 ? Ve(
          g,
          w,
          L,
          P,
          D,
          O,
          X,
          $,
          V
        ) : (Y & 64 || Y & 128) && W.process(
          g,
          w,
          L,
          P,
          D,
          O,
          X,
          $,
          V,
          Mt
        );
    }
    ee != null && D ? Mr(ee, g && g.ref, O, w || g, !w) : ee == null && g && g.ref != null && Mr(g.ref, null, O, g, !0);
  }, he = (g, w, L, P) => {
    if (g == null)
      s(
        w.el = a(w.children),
        L,
        P
      );
    else {
      const D = w.el = g.el;
      w.children !== g.children && h(D, w.children);
    }
  }, R = (g, w, L, P) => {
    g == null ? s(
      w.el = l(w.children || ""),
      L,
      P
    ) : w.el = g.el;
  }, le = (g, w, L, P) => {
    [g.el, g.anchor] = B(
      g.children,
      w,
      L,
      P,
      g.el,
      g.anchor
    );
  }, de = ({ el: g, anchor: w }, L, P) => {
    let D;
    for (; g && g !== w; )
      D = b(g), s(g, L, P), g = D;
    s(w, L, P);
  }, C = ({ el: g, anchor: w }) => {
    let L;
    for (; g && g !== w; )
      L = b(g), r(g), g = L;
    r(w);
  }, v = (g, w, L, P, D, O, X, $, V) => {
    w.type === "svg" ? X = "svg" : w.type === "math" && (X = "mathml"), g == null ? q(
      w,
      L,
      P,
      D,
      O,
      X,
      $,
      V
    ) : Oe(
      g,
      w,
      D,
      O,
      X,
      $,
      V
    );
  }, q = (g, w, L, P, D, O, X, $) => {
    let V, W;
    const { props: ee, shapeFlag: Y, transition: se, dirs: ue } = g;
    if (V = g.el = o(
      g.type,
      O,
      ee && ee.is,
      ee
    ), Y & 8 ? u(V, g.children) : Y & 16 && ae(
      g.children,
      V,
      null,
      P,
      D,
      Eo(g, O),
      X,
      $
    ), ue && bs(g, null, P, "created"), K(V, g, g.scopeId, X, P), ee) {
      for (const Te in ee)
        Te !== "value" && !Lr(Te) && i(V, Te, null, ee[Te], O, P);
      "value" in ee && i(V, "value", null, ee.value, O), (W = ee.onVnodeBeforeMount) && wn(W, P, g);
    }
    ue && bs(g, null, P, "beforeMount");
    const we = od(D, se);
    we && se.beforeEnter(V), s(V, w, L), ((W = ee && ee.onVnodeMounted) || we || ue) && Xt(() => {
      W && wn(W, P, g), we && se.enter(V), ue && bs(g, null, P, "mounted");
    }, D);
  }, K = (g, w, L, P, D) => {
    if (L && I(g, L), P)
      for (let O = 0; O < P.length; O++)
        I(g, P[O]);
    if (D) {
      let O = D.subTree;
      if (w === O || Au(O.type) && (O.ssContent === w || O.ssFallback === w)) {
        const X = D.vnode;
        K(
          g,
          X,
          X.scopeId,
          X.slotScopeIds,
          D.parent
        );
      }
    }
  }, ae = (g, w, L, P, D, O, X, $, V = 0) => {
    for (let W = V; W < g.length; W++) {
      const ee = g[W] = $ ? ss(g[W]) : An(g[W]);
      H(
        null,
        ee,
        w,
        L,
        P,
        D,
        O,
        X,
        $
      );
    }
  }, Oe = (g, w, L, P, D, O, X) => {
    const $ = w.el = g.el;
    let { patchFlag: V, dynamicChildren: W, dirs: ee } = w;
    V |= g.patchFlag & 16;
    const Y = g.props || Qe, se = w.props || Qe;
    let ue;
    if (L && vs(L, !1), (ue = se.onVnodeBeforeUpdate) && wn(ue, L, w, g), ee && bs(w, g, L, "beforeUpdate"), L && vs(L, !0), (Y.innerHTML && se.innerHTML == null || Y.textContent && se.textContent == null) && u($, ""), W ? _e(
      g.dynamicChildren,
      W,
      $,
      L,
      P,
      Eo(w, D),
      O
    ) : X || pe(
      g,
      w,
      $,
      null,
      L,
      P,
      Eo(w, D),
      O,
      !1
    ), V > 0) {
      if (V & 16)
        Le($, Y, se, L, D);
      else if (V & 2 && Y.class !== se.class && i($, "class", null, se.class, D), V & 4 && i($, "style", Y.style, se.style, D), V & 8) {
        const we = w.dynamicProps;
        for (let Te = 0; Te < we.length; Te++) {
          const Ae = we[Te], Ge = Y[Ae], F = se[Ae];
          (F !== Ge || Ae === "value") && i($, Ae, Ge, F, D, L);
        }
      }
      V & 1 && g.children !== w.children && u($, w.children);
    } else !X && W == null && Le($, Y, se, L, D);
    ((ue = se.onVnodeUpdated) || ee) && Xt(() => {
      ue && wn(ue, L, w, g), ee && bs(w, g, L, "updated");
    }, P);
  }, _e = (g, w, L, P, D, O, X) => {
    for (let $ = 0; $ < w.length; $++) {
      const V = g[$], W = w[$], ee = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        V.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (V.type === Ie || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !br(V, W) || // - In the case of a component, it could contain anything.
        V.shapeFlag & 198) ? k(V.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          L
        )
      );
      H(
        V,
        W,
        ee,
        null,
        P,
        D,
        O,
        X,
        !0
      );
    }
  }, Le = (g, w, L, P, D) => {
    if (w !== L) {
      if (w !== Qe)
        for (const O in w)
          !Lr(O) && !(O in L) && i(
            g,
            O,
            w[O],
            null,
            D,
            P
          );
      for (const O in L) {
        if (Lr(O)) continue;
        const X = L[O], $ = w[O];
        X !== $ && O !== "value" && i(g, O, $, X, D, P);
      }
      "value" in L && i(g, "value", w.value, L.value, D);
    }
  }, ve = (g, w, L, P, D, O, X, $, V) => {
    const W = w.el = g ? g.el : a(""), ee = w.anchor = g ? g.anchor : a("");
    let { patchFlag: Y, dynamicChildren: se, slotScopeIds: ue } = w;
    ue && ($ = $ ? $.concat(ue) : ue), g == null ? (s(W, L, P), s(ee, L, P), ae(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      w.children || [],
      L,
      ee,
      D,
      O,
      X,
      $,
      V
    )) : Y > 0 && Y & 64 && se && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    g.dynamicChildren ? (_e(
      g.dynamicChildren,
      se,
      L,
      D,
      O,
      X,
      $
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (w.key != null || D && w === D.subTree) && bu(
      g,
      w,
      !0
      /* shallow */
    )) : pe(
      g,
      w,
      L,
      ee,
      D,
      O,
      X,
      $,
      V
    );
  }, Ve = (g, w, L, P, D, O, X, $, V) => {
    w.slotScopeIds = $, g == null ? w.shapeFlag & 512 ? D.ctx.activate(
      w,
      L,
      P,
      X,
      V
    ) : Fe(
      w,
      L,
      P,
      D,
      O,
      X,
      V
    ) : et(g, w, V);
  }, Fe = (g, w, L, P, D, O, X) => {
    const $ = g.component = Ad(
      g,
      P,
      D
    );
    if (ou(g) && ($.ctx.renderer = Mt), xd($, !1, X), $.asyncDep) {
      if (D && D.registerDep($, ce, X), !g.el) {
        const V = $.subTree = xn(us);
        R(null, V, w, L), g.placeholder = V.el;
      }
    } else
      ce(
        $,
        g,
        w,
        L,
        D,
        O,
        X
      );
  }, et = (g, w, L) => {
    const P = w.component = g.component;
    if (md(g, w, L))
      if (P.asyncDep && !P.asyncResolved) {
        ye(P, w, L);
        return;
      } else
        P.next = w, P.update();
    else
      w.el = g.el, P.vnode = w;
  }, ce = (g, w, L, P, D, O, X) => {
    const $ = () => {
      if (g.isMounted) {
        let { next: Y, bu: se, u: ue, parent: we, vnode: Te } = g;
        {
          const c = vu(g);
          if (c) {
            Y && (Y.el = Te.el, ye(g, Y, X)), c.asyncDep.then(() => {
              g.isUnmounted || $();
            });
            return;
          }
        }
        let Ae = Y, Ge;
        vs(g, !1), Y ? (Y.el = Te.el, ye(g, Y, X)) : Y = Te, se && gi(se), (Ge = Y.props && Y.props.onVnodeBeforeUpdate) && wn(Ge, we, Y, Te), vs(g, !0);
        const F = xl(g), U = g.subTree;
        g.subTree = F, H(
          U,
          F,
          // parent may have changed if it's in a teleport
          k(U.el),
          // anchor may have changed if it's in a fragment
          ct(U),
          g,
          D,
          O
        ), Y.el = F.el, Ae === null && gd(g, F.el), ue && Xt(ue, D), (Ge = Y.props && Y.props.onVnodeUpdated) && Xt(
          () => wn(Ge, we, Y, Te),
          D
        );
      } else {
        let Y;
        const { el: se, props: ue } = w, { bm: we, m: Te, parent: Ae, root: Ge, type: F } = g, U = Dr(w);
        vs(g, !1), we && gi(we), !U && (Y = ue && ue.onVnodeBeforeMount) && wn(Y, Ae, w), vs(g, !0);
        {
          Ge.ce && // @ts-expect-error _def is private
          Ge.ce._def.shadowRoot !== !1 && Ge.ce._injectChildStyle(F);
          const c = g.subTree = xl(g);
          H(
            null,
            c,
            L,
            P,
            g,
            D,
            O
          ), w.el = c.el;
        }
        if (Te && Xt(Te, D), !U && (Y = ue && ue.onVnodeMounted)) {
          const c = w;
          Xt(
            () => wn(Y, Ae, c),
            D
          );
        }
        (w.shapeFlag & 256 || Ae && Dr(Ae.vnode) && Ae.vnode.shapeFlag & 256) && g.a && Xt(g.a, D), g.isMounted = !0, w = L = P = null;
      }
    };
    g.scope.on();
    const V = g.effect = new $c($);
    g.scope.off();
    const W = g.update = V.run.bind(V), ee = g.job = V.runIfDirty.bind(V);
    ee.i = g, ee.id = g.uid, V.scheduler = () => Sa(ee), vs(g, !0), W();
  }, ye = (g, w, L) => {
    w.component = g;
    const P = g.vnode.props;
    g.vnode = w, g.next = null, Qh(g, w.props, P, L), sd(g, w.children, L), Hn(), bl(g), Wn();
  }, pe = (g, w, L, P, D, O, X, $, V = !1) => {
    const W = g && g.children, ee = g ? g.shapeFlag : 0, Y = w.children, { patchFlag: se, shapeFlag: ue } = w;
    if (se > 0) {
      if (se & 128) {
        Xe(
          W,
          Y,
          L,
          P,
          D,
          O,
          X,
          $,
          V
        );
        return;
      } else if (se & 256) {
        Ye(
          W,
          Y,
          L,
          P,
          D,
          O,
          X,
          $,
          V
        );
        return;
      }
    }
    ue & 8 ? (ee & 16 && Vt(W, D, O), Y !== W && u(L, Y)) : ee & 16 ? ue & 16 ? Xe(
      W,
      Y,
      L,
      P,
      D,
      O,
      X,
      $,
      V
    ) : Vt(W, D, O, !0) : (ee & 8 && u(L, ""), ue & 16 && ae(
      Y,
      L,
      P,
      D,
      O,
      X,
      $,
      V
    ));
  }, Ye = (g, w, L, P, D, O, X, $, V) => {
    g = g || Js, w = w || Js;
    const W = g.length, ee = w.length, Y = Math.min(W, ee);
    let se;
    for (se = 0; se < Y; se++) {
      const ue = w[se] = V ? ss(w[se]) : An(w[se]);
      H(
        g[se],
        ue,
        L,
        null,
        D,
        O,
        X,
        $,
        V
      );
    }
    W > ee ? Vt(
      g,
      D,
      O,
      !0,
      !1,
      Y
    ) : ae(
      w,
      L,
      P,
      D,
      O,
      X,
      $,
      V,
      Y
    );
  }, Xe = (g, w, L, P, D, O, X, $, V) => {
    let W = 0;
    const ee = w.length;
    let Y = g.length - 1, se = ee - 1;
    for (; W <= Y && W <= se; ) {
      const ue = g[W], we = w[W] = V ? ss(w[W]) : An(w[W]);
      if (br(ue, we))
        H(
          ue,
          we,
          L,
          null,
          D,
          O,
          X,
          $,
          V
        );
      else
        break;
      W++;
    }
    for (; W <= Y && W <= se; ) {
      const ue = g[Y], we = w[se] = V ? ss(w[se]) : An(w[se]);
      if (br(ue, we))
        H(
          ue,
          we,
          L,
          null,
          D,
          O,
          X,
          $,
          V
        );
      else
        break;
      Y--, se--;
    }
    if (W > Y) {
      if (W <= se) {
        const ue = se + 1, we = ue < ee ? w[ue].el : P;
        for (; W <= se; )
          H(
            null,
            w[W] = V ? ss(w[W]) : An(w[W]),
            L,
            we,
            D,
            O,
            X,
            $,
            V
          ), W++;
      }
    } else if (W > se)
      for (; W <= Y; )
        Ke(g[W], D, O, !0), W++;
    else {
      const ue = W, we = W, Te = /* @__PURE__ */ new Map();
      for (W = we; W <= se; W++) {
        const E = w[W] = V ? ss(w[W]) : An(w[W]);
        E.key != null && Te.set(E.key, W);
      }
      let Ae, Ge = 0;
      const F = se - we + 1;
      let U = !1, c = 0;
      const _ = new Array(F);
      for (W = 0; W < F; W++) _[W] = 0;
      for (W = ue; W <= Y; W++) {
        const E = g[W];
        if (Ge >= F) {
          Ke(E, D, O, !0);
          continue;
        }
        let j;
        if (E.key != null)
          j = Te.get(E.key);
        else
          for (Ae = we; Ae <= se; Ae++)
            if (_[Ae - we] === 0 && br(E, w[Ae])) {
              j = Ae;
              break;
            }
        j === void 0 ? Ke(E, D, O, !0) : (_[j - we] = W + 1, j >= c ? c = j : U = !0, H(
          E,
          w[j],
          L,
          null,
          D,
          O,
          X,
          $,
          V
        ), Ge++);
      }
      const N = U ? ad(_) : Js;
      for (Ae = N.length - 1, W = F - 1; W >= 0; W--) {
        const E = we + W, j = w[E], Z = w[E + 1], ie = E + 1 < ee ? (
          // #13559, fallback to el placeholder for unresolved async component
          Z.el || Z.placeholder
        ) : P;
        _[W] === 0 ? H(
          null,
          j,
          L,
          ie,
          D,
          O,
          X,
          $,
          V
        ) : U && (Ae < 0 || W !== N[Ae] ? st(j, L, ie, 2) : Ae--);
      }
    }
  }, st = (g, w, L, P, D = null) => {
    const { el: O, type: X, transition: $, children: V, shapeFlag: W } = g;
    if (W & 6) {
      st(g.component.subTree, w, L, P);
      return;
    }
    if (W & 128) {
      g.suspense.move(w, L, P);
      return;
    }
    if (W & 64) {
      X.move(g, w, L, Mt);
      return;
    }
    if (X === Ie) {
      s(O, w, L);
      for (let Y = 0; Y < V.length; Y++)
        st(V[Y], w, L, P);
      s(g.anchor, w, L);
      return;
    }
    if (X === yi) {
      de(g, w, L);
      return;
    }
    if (P !== 2 && W & 1 && $)
      if (P === 0)
        $.beforeEnter(O), s(O, w, L), Xt(() => $.enter(O), D);
      else {
        const { leave: Y, delayLeave: se, afterLeave: ue } = $, we = () => {
          g.ctx.isUnmounted ? r(O) : s(O, w, L);
        }, Te = () => {
          Y(O, () => {
            we(), ue && ue();
          });
        };
        se ? se(O, we, Te) : Te();
      }
    else
      s(O, w, L);
  }, Ke = (g, w, L, P = !1, D = !1) => {
    const {
      type: O,
      props: X,
      ref: $,
      children: V,
      dynamicChildren: W,
      shapeFlag: ee,
      patchFlag: Y,
      dirs: se,
      cacheIndex: ue
    } = g;
    if (Y === -2 && (D = !1), $ != null && (Hn(), Mr($, null, L, g, !0), Wn()), ue != null && (w.renderCache[ue] = void 0), ee & 256) {
      w.ctx.deactivate(g);
      return;
    }
    const we = ee & 1 && se, Te = !Dr(g);
    let Ae;
    if (Te && (Ae = X && X.onVnodeBeforeUnmount) && wn(Ae, w, g), ee & 6)
      Pe(g.component, L, P);
    else {
      if (ee & 128) {
        g.suspense.unmount(L, P);
        return;
      }
      we && bs(g, null, w, "beforeUnmount"), ee & 64 ? g.type.remove(
        g,
        w,
        L,
        Mt,
        P
      ) : W && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !W.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (O !== Ie || Y > 0 && Y & 64) ? Vt(
        W,
        w,
        L,
        !1,
        !0
      ) : (O === Ie && Y & 384 || !D && ee & 16) && Vt(V, w, L), P && gt(g);
    }
    (Te && (Ae = X && X.onVnodeUnmounted) || we) && Xt(() => {
      Ae && wn(Ae, w, g), we && bs(g, null, w, "unmounted");
    }, L);
  }, gt = (g) => {
    const { type: w, el: L, anchor: P, transition: D } = g;
    if (w === Ie) {
      hn(L, P);
      return;
    }
    if (w === yi) {
      C(g);
      return;
    }
    const O = () => {
      r(L), D && !D.persisted && D.afterLeave && D.afterLeave();
    };
    if (g.shapeFlag & 1 && D && !D.persisted) {
      const { leave: X, delayLeave: $ } = D, V = () => X(L, O);
      $ ? $(g.el, O, V) : V();
    } else
      O();
  }, hn = (g, w) => {
    let L;
    for (; g !== w; )
      L = b(g), r(g), g = L;
    r(w);
  }, Pe = (g, w, L) => {
    const {
      bum: P,
      scope: D,
      job: O,
      subTree: X,
      um: $,
      m: V,
      a: W,
      parent: ee,
      slots: { __: Y }
    } = g;
    Sl(V), Sl(W), P && gi(P), ee && be(Y) && Y.forEach((se) => {
      ee.renderCache[se] = void 0;
    }), D.stop(), O && (O.flags |= 8, Ke(X, g, w, L)), $ && Xt($, w), Xt(() => {
      g.isUnmounted = !0;
    }, w), w && w.pendingBranch && !w.isUnmounted && g.asyncDep && !g.asyncResolved && g.suspenseId === w.pendingId && (w.deps--, w.deps === 0 && w.resolve());
  }, Vt = (g, w, L, P = !1, D = !1, O = 0) => {
    for (let X = O; X < g.length; X++)
      Ke(g[X], w, L, P, D);
  }, ct = (g) => {
    if (g.shapeFlag & 6)
      return ct(g.component.subTree);
    if (g.shapeFlag & 128)
      return g.suspense.next();
    const w = b(g.anchor || g.el), L = w && w[Ih];
    return L ? b(L) : w;
  };
  let Kt = !1;
  const Gt = (g, w, L) => {
    g == null ? w._vnode && Ke(w._vnode, null, null, !0) : H(
      w._vnode || null,
      g,
      w,
      null,
      null,
      null,
      L
    ), w._vnode = g, Kt || (Kt = !0, bl(), nu(), Kt = !1);
  }, Mt = {
    p: H,
    um: Ke,
    m: st,
    r: gt,
    mt: Fe,
    mc: ae,
    pc: pe,
    pbc: _e,
    n: ct,
    o: e
  };
  return {
    render: Gt,
    hydrate: void 0,
    createApp: Xh(Gt)
  };
}
function Eo({ type: e, props: t }, n) {
  return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function vs({ effect: e, job: t }, n) {
  n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function od(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function bu(e, t, n = !1) {
  const s = e.children, r = t.children;
  if (be(s) && be(r))
    for (let i = 0; i < s.length; i++) {
      const o = s[i];
      let a = r[i];
      a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = r[i] = ss(r[i]), a.el = o.el), !n && a.patchFlag !== -2 && bu(o, a)), a.type === so && (a.el = o.el), a.type === us && !a.el && (a.el = o.el);
    }
}
function ad(e) {
  const t = e.slice(), n = [0];
  let s, r, i, o, a;
  const l = e.length;
  for (s = 0; s < l; s++) {
    const h = e[s];
    if (h !== 0) {
      if (r = n[n.length - 1], e[r] < h) {
        t[s] = r, n.push(s);
        continue;
      }
      for (i = 0, o = n.length - 1; i < o; )
        a = i + o >> 1, e[n[a]] < h ? i = a + 1 : o = a;
      h < e[n[i]] && (i > 0 && (t[s] = n[i - 1]), n[i] = s);
    }
  }
  for (i = n.length, o = n[i - 1]; i-- > 0; )
    n[i] = o, o = t[o];
  return n;
}
function vu(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : vu(t);
}
function Sl(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
const ld = Symbol.for("v-scx"), cd = () => _i(ld);
function Ot(e, t, n) {
  return wu(e, t, n);
}
function wu(e, t, n = Qe) {
  const { immediate: s, deep: r, flush: i, once: o } = n, a = Pt({}, n), l = t && s || !t && i !== "post";
  let h;
  if (Vr) {
    if (i === "sync") {
      const I = cd();
      h = I.__watcherHandles || (I.__watcherHandles = []);
    } else if (!l) {
      const I = () => {
      };
      return I.stop = Sn, I.resume = Sn, I.pause = Sn, I;
    }
  }
  const u = Bt;
  a.call = (I, B, H) => Cn(I, u, B, H);
  let k = !1;
  i === "post" ? a.scheduler = (I) => {
    Xt(I, u && u.suspense);
  } : i !== "sync" && (k = !0, a.scheduler = (I, B) => {
    B ? I() : Sa(I);
  }), a.augmentJob = (I) => {
    t && (I.flags |= 4), k && (I.flags |= 2, u && (I.id = u.uid, I.i = u));
  };
  const b = Sh(e, t, a);
  return Vr && (h ? h.push(b) : l && b()), b;
}
function ud(e, t, n) {
  const s = this.proxy, r = pt(e) ? e.includes(".") ? ku(s, e) : () => s[e] : e.bind(s, s);
  let i;
  xe(t) ? i = t : (i = t.handler, n = t);
  const o = Yr(this), a = wu(r, i.bind(s), n);
  return o(), a;
}
function ku(e, t) {
  const n = t.split(".");
  return () => {
    let s = e;
    for (let r = 0; r < n.length && s; r++)
      s = s[n[r]];
    return s;
  };
}
const fd = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${ls(t)}Modifiers`] || e[`${hs(t)}Modifiers`];
function hd(e, t, ...n) {
  if (e.isUnmounted) return;
  const s = e.vnode.props || Qe;
  let r = n;
  const i = t.startsWith("update:"), o = i && fd(s, t.slice(7));
  o && (o.trim && (r = n.map((u) => pt(u) ? u.trim() : u)), o.number && (r = n.map(Vo)));
  let a, l = s[a = wo(t)] || // also try camelCase event handler (#2249)
  s[a = wo(ls(t))];
  !l && i && (l = s[a = wo(hs(t))]), l && Cn(
    l,
    e,
    6,
    r
  );
  const h = s[a + "Once"];
  if (h) {
    if (!e.emitted)
      e.emitted = {};
    else if (e.emitted[a])
      return;
    e.emitted[a] = !0, Cn(
      h,
      e,
      6,
      r
    );
  }
}
function Tu(e, t, n = !1) {
  const s = t.emitsCache, r = s.get(e);
  if (r !== void 0)
    return r;
  const i = e.emits;
  let o = {}, a = !1;
  if (!xe(e)) {
    const l = (h) => {
      const u = Tu(h, t, !0);
      u && (a = !0, Pt(o, u));
    };
    !n && t.mixins.length && t.mixins.forEach(l), e.extends && l(e.extends), e.mixins && e.mixins.forEach(l);
  }
  return !i && !a ? (ot(e) && s.set(e, null), null) : (be(i) ? i.forEach((l) => o[l] = null) : Pt(o, i), ot(e) && s.set(e, o), o);
}
function no(e, t) {
  return !e || !qi(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), je(e, t[0].toLowerCase() + t.slice(1)) || je(e, hs(t)) || je(e, t));
}
function xl(e) {
  const {
    type: t,
    vnode: n,
    proxy: s,
    withProxy: r,
    propsOptions: [i],
    slots: o,
    attrs: a,
    emit: l,
    render: h,
    renderCache: u,
    props: k,
    data: b,
    setupState: I,
    ctx: B,
    inheritAttrs: H
  } = e, he = Pi(e);
  let R, le;
  try {
    if (n.shapeFlag & 4) {
      const C = r || s, v = C;
      R = An(
        h.call(
          v,
          C,
          u,
          k,
          I,
          b,
          B
        )
      ), le = a;
    } else {
      const C = t;
      R = An(
        C.length > 1 ? C(
          k,
          { attrs: a, slots: o, emit: l }
        ) : C(
          k,
          null
        )
      ), le = t.props ? a : dd(a);
    }
  } catch (C) {
    $r.length = 0, Zi(C, e, 1), R = xn(us);
  }
  let de = R;
  if (le && H !== !1) {
    const C = Object.keys(le), { shapeFlag: v } = de;
    C.length && v & 7 && (i && C.some(ma) && (le = pd(
      le,
      i
    )), de = or(de, le, !1, !0));
  }
  return n.dirs && (de = or(de, null, !1, !0), de.dirs = de.dirs ? de.dirs.concat(n.dirs) : n.dirs), n.transition && xa(de, n.transition), R = de, Pi(he), R;
}
const dd = (e) => {
  let t;
  for (const n in e)
    (n === "class" || n === "style" || qi(n)) && ((t || (t = {}))[n] = e[n]);
  return t;
}, pd = (e, t) => {
  const n = {};
  for (const s in e)
    (!ma(s) || !(s.slice(9) in t)) && (n[s] = e[s]);
  return n;
};
function md(e, t, n) {
  const { props: s, children: r, component: i } = e, { props: o, children: a, patchFlag: l } = t, h = i.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (n && l >= 0) {
    if (l & 1024)
      return !0;
    if (l & 16)
      return s ? El(s, o, h) : !!o;
    if (l & 8) {
      const u = t.dynamicProps;
      for (let k = 0; k < u.length; k++) {
        const b = u[k];
        if (o[b] !== s[b] && !no(h, b))
          return !0;
      }
    }
  } else
    return (r || a) && (!a || !a.$stable) ? !0 : s === o ? !1 : s ? o ? El(s, o, h) : !0 : !!o;
  return !1;
}
function El(e, t, n) {
  const s = Object.keys(t);
  if (s.length !== Object.keys(e).length)
    return !0;
  for (let r = 0; r < s.length; r++) {
    const i = s[r];
    if (t[i] !== e[i] && !no(n, i))
      return !0;
  }
  return !1;
}
function gd({ vnode: e, parent: t }, n) {
  for (; t; ) {
    const s = t.subTree;
    if (s.suspense && s.suspense.activeBranch === e && (s.el = e.el), s === e)
      (e = t.vnode).el = n, t = t.parent;
    else
      break;
  }
}
const Au = (e) => e.__isSuspense;
function _d(e, t) {
  t && t.pendingBranch ? be(e) ? t.effects.push(...e) : t.effects.push(e) : Ch(e);
}
const Ie = Symbol.for("v-fgt"), so = Symbol.for("v-txt"), us = Symbol.for("v-cmt"), yi = Symbol.for("v-stc"), $r = [];
let Jt = null;
function A(e = !1) {
  $r.push(Jt = e ? null : []);
}
function yd() {
  $r.pop(), Jt = $r[$r.length - 1] || null;
}
let qr = 1;
function Cl(e, t = !1) {
  qr += e, e < 0 && Jt && t && (Jt.hasOnce = !0);
}
function Su(e) {
  return e.dynamicChildren = qr > 0 ? Jt || Js : null, yd(), qr > 0 && Jt && Jt.push(e), e;
}
function x(e, t, n, s, r, i) {
  return Su(
    y(
      e,
      t,
      n,
      s,
      r,
      i,
      !0
    )
  );
}
function Br(e, t, n, s, r) {
  return Su(
    xn(
      e,
      t,
      n,
      s,
      r,
      !0
    )
  );
}
function xu(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function br(e, t) {
  return e.type === t.type && e.key === t.key;
}
const Eu = ({ key: e }) => e ?? null, bi = ({
  ref: e,
  ref_key: t,
  ref_for: n
}) => (typeof e == "number" && (e = "" + e), e != null ? pt(e) || Nt(e) || xe(e) ? { i: on, r: e, k: t, f: !!n } : e : null);
function y(e, t = null, n = null, s = 0, r = null, i = e === Ie ? 0 : 1, o = !1, a = !1) {
  const l = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && Eu(t),
    ref: t && bi(t),
    scopeId: ru,
    slotScopeIds: null,
    children: n,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetStart: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag: i,
    patchFlag: s,
    dynamicProps: r,
    dynamicChildren: null,
    appContext: null,
    ctx: on
  };
  return a ? (Ra(l, n), i & 128 && e.normalize(l)) : n && (l.shapeFlag |= pt(n) ? 8 : 16), qr > 0 && // avoid a block node from tracking itself
  !o && // has current parent block
  Jt && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (l.patchFlag > 0 || i & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  l.patchFlag !== 32 && Jt.push(l), l;
}
const xn = bd;
function bd(e, t = null, n = null, s = 0, r = null, i = !1) {
  if ((!e || e === Hh) && (e = us), xu(e)) {
    const a = or(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return n && Ra(a, n), qr > 0 && !i && Jt && (a.shapeFlag & 6 ? Jt[Jt.indexOf(e)] = a : Jt.push(a)), a.patchFlag = -2, a;
  }
  if (Id(e) && (e = e.__vccOpts), t) {
    t = vd(t);
    let { class: a, style: l } = t;
    a && !pt(a) && (t.class = $e(a)), ot(l) && (Aa(l) && !be(l) && (l = Pt({}, l)), t.style = Ce(l));
  }
  const o = pt(e) ? 1 : Au(e) ? 128 : Oh(e) ? 64 : ot(e) ? 4 : xe(e) ? 2 : 0;
  return y(
    e,
    t,
    n,
    s,
    r,
    o,
    i,
    !0
  );
}
function vd(e) {
  return e ? Aa(e) || du(e) ? Pt({}, e) : e : null;
}
function or(e, t, n = !1, s = !1) {
  const { props: r, ref: i, patchFlag: o, children: a, transition: l } = e, h = t ? wd(r || {}, t) : r, u = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: h,
    key: h && Eu(h),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && i ? be(i) ? i.concat(bi(t)) : [i, bi(t)] : bi(t)
    ) : i,
    scopeId: e.scopeId,
    slotScopeIds: e.slotScopeIds,
    children: a,
    target: e.target,
    targetStart: e.targetStart,
    targetAnchor: e.targetAnchor,
    staticCount: e.staticCount,
    shapeFlag: e.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: t && e.type !== Ie ? o === -1 ? 16 : o | 16 : o,
    dynamicProps: e.dynamicProps,
    dynamicChildren: e.dynamicChildren,
    appContext: e.appContext,
    dirs: e.dirs,
    transition: l,
    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: e.component,
    suspense: e.suspense,
    ssContent: e.ssContent && or(e.ssContent),
    ssFallback: e.ssFallback && or(e.ssFallback),
    placeholder: e.placeholder,
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce
  };
  return l && s && xa(
    u,
    l.clone(u)
  ), u;
}
function cn(e = " ", t = 0) {
  return xn(so, null, e, t);
}
function ws(e, t) {
  const n = xn(yi, null, e);
  return n.staticCount = t, n;
}
function re(e = "", t = !1) {
  return t ? (A(), Br(us, null, e)) : xn(us, null, e);
}
function An(e) {
  return e == null || typeof e == "boolean" ? xn(us) : be(e) ? xn(
    Ie,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : xu(e) ? ss(e) : xn(so, null, String(e));
}
function ss(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : or(e);
}
function Ra(e, t) {
  let n = 0;
  const { shapeFlag: s } = e;
  if (t == null)
    t = null;
  else if (be(t))
    n = 16;
  else if (typeof t == "object")
    if (s & 65) {
      const r = t.default;
      r && (r._c && (r._d = !1), Ra(e, r()), r._c && (r._d = !0));
      return;
    } else {
      n = 32;
      const r = t._;
      !r && !du(t) ? t._ctx = on : r === 3 && on && (on.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else xe(t) ? (t = { default: t, _ctx: on }, n = 32) : (t = String(t), s & 64 ? (n = 16, t = [cn(t)]) : n = 8);
  e.children = t, e.shapeFlag |= n;
}
function wd(...e) {
  const t = {};
  for (let n = 0; n < e.length; n++) {
    const s = e[n];
    for (const r in s)
      if (r === "class")
        t.class !== s.class && (t.class = $e([t.class, s.class]));
      else if (r === "style")
        t.style = Ce([t.style, s.style]);
      else if (qi(r)) {
        const i = t[r], o = s[r];
        o && i !== o && !(be(i) && i.includes(o)) && (t[r] = i ? [].concat(i, o) : o);
      } else r !== "" && (t[r] = s[r]);
  }
  return t;
}
function wn(e, t, n, s = null) {
  Cn(e, t, 7, [
    n,
    s
  ]);
}
const kd = uu();
let Td = 0;
function Ad(e, t, n) {
  const s = e.type, r = (t ? t.appContext : e.appContext) || kd, i = {
    uid: Td++,
    vnode: e,
    type: s,
    parent: t,
    appContext: r,
    root: null,
    // to be immediately set
    next: null,
    subTree: null,
    // will be set synchronously right after creation
    effect: null,
    update: null,
    // will be set synchronously right after creation
    job: null,
    scope: new Zf(
      !0
      /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: t ? t.provides : Object.create(r.provides),
    ids: t ? t.ids : ["", 0, 0],
    accessCache: null,
    renderCache: [],
    // local resolved assets
    components: null,
    directives: null,
    // resolved props and emits options
    propsOptions: mu(s, r),
    emitsOptions: Tu(s, r),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: Qe,
    // inheritAttrs
    inheritAttrs: s.inheritAttrs,
    // state
    ctx: Qe,
    data: Qe,
    props: Qe,
    attrs: Qe,
    slots: Qe,
    refs: Qe,
    setupState: Qe,
    setupContext: null,
    // suspense related
    suspense: n,
    suspenseId: n ? n.pendingId : 0,
    asyncDep: null,
    asyncResolved: !1,
    // lifecycle hooks
    // not using enums here because it results in computed properties
    isMounted: !1,
    isUnmounted: !1,
    isDeactivated: !1,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null
  };
  return i.ctx = { _: i }, i.root = t ? t.root : i, i.emit = hd.bind(null, i), e.ce && e.ce(i), i;
}
let Bt = null;
const Sd = () => Bt || on;
let Di, ta;
{
  const e = Gi(), t = (n, s) => {
    let r;
    return (r = e[n]) || (r = e[n] = []), r.push(s), (i) => {
      r.length > 1 ? r.forEach((o) => o(i)) : r[0](i);
    };
  };
  Di = t(
    "__VUE_INSTANCE_SETTERS__",
    (n) => Bt = n
  ), ta = t(
    "__VUE_SSR_SETTERS__",
    (n) => Vr = n
  );
}
const Yr = (e) => {
  const t = Bt;
  return Di(e), e.scope.on(), () => {
    e.scope.off(), Di(t);
  };
}, Rl = () => {
  Bt && Bt.scope.off(), Di(null);
};
function Cu(e) {
  return e.vnode.shapeFlag & 4;
}
let Vr = !1;
function xd(e, t = !1, n = !1) {
  t && ta(t);
  const { props: s, children: r } = e.vnode, i = Cu(e);
  Jh(e, s, i, t), nd(e, r, n || t);
  const o = i ? Ed(e, t) : void 0;
  return t && ta(!1), o;
}
function Ed(e, t) {
  const n = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Wh);
  const { setup: s } = n;
  if (s) {
    Hn();
    const r = e.setupContext = s.length > 1 ? Rd(e) : null, i = Yr(e), o = Kr(
      s,
      e,
      0,
      [
        e.props,
        r
      ]
    ), a = Oc(o);
    if (Wn(), i(), (a || e.sp) && !Dr(e) && iu(e), a) {
      if (o.then(Rl, Rl), t)
        return o.then((l) => {
          Il(e, l);
        }).catch((l) => {
          Zi(l, e, 0);
        });
      e.asyncDep = o;
    } else
      Il(e, o);
  } else
    Ru(e);
}
function Il(e, t, n) {
  xe(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : ot(t) && (e.setupState = Qc(t)), Ru(e);
}
function Ru(e, t, n) {
  const s = e.type;
  e.render || (e.render = s.render || Sn);
  {
    const r = Yr(e);
    Hn();
    try {
      jh(e);
    } finally {
      Wn(), r();
    }
  }
}
const Cd = {
  get(e, t) {
    return Lt(e, "get", ""), e[t];
  }
};
function Rd(e) {
  const t = (n) => {
    e.exposed = n || {};
  };
  return {
    attrs: new Proxy(e.attrs, Cd),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function ro(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(Qc(yh(e.exposed)), {
    get(t, n) {
      if (n in t)
        return t[n];
      if (n in Fr)
        return Fr[n](e);
    },
    has(t, n) {
      return n in t || n in Fr;
    }
  })) : e.proxy;
}
function Id(e) {
  return xe(e) && "__vccOpts" in e;
}
const fe = (e, t) => Th(e, t, Vr), Od = "3.5.18";
/**
* @vue/runtime-dom v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let na;
const Ol = typeof window < "u" && window.trustedTypes;
if (Ol)
  try {
    na = /* @__PURE__ */ Ol.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const Iu = na ? (e) => na.createHTML(e) : (e) => e, Ld = "http://www.w3.org/2000/svg", Nd = "http://www.w3.org/1998/Math/MathML", Fn = typeof document < "u" ? document : null, Ll = Fn && /* @__PURE__ */ Fn.createElement("template"), Pd = {
  insert: (e, t, n) => {
    t.insertBefore(e, n || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, n, s) => {
    const r = t === "svg" ? Fn.createElementNS(Ld, e) : t === "mathml" ? Fn.createElementNS(Nd, e) : n ? Fn.createElement(e, { is: n }) : Fn.createElement(e);
    return e === "select" && s && s.multiple != null && r.setAttribute("multiple", s.multiple), r;
  },
  createText: (e) => Fn.createTextNode(e),
  createComment: (e) => Fn.createComment(e),
  setText: (e, t) => {
    e.nodeValue = t;
  },
  setElementText: (e, t) => {
    e.textContent = t;
  },
  parentNode: (e) => e.parentNode,
  nextSibling: (e) => e.nextSibling,
  querySelector: (e) => Fn.querySelector(e),
  setScopeId(e, t) {
    e.setAttribute(t, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(e, t, n, s, r, i) {
    const o = n ? n.previousSibling : t.lastChild;
    if (r && (r === i || r.nextSibling))
      for (; t.insertBefore(r.cloneNode(!0), n), !(r === i || !(r = r.nextSibling)); )
        ;
    else {
      Ll.innerHTML = Iu(
        s === "svg" ? `<svg>${e}</svg>` : s === "mathml" ? `<math>${e}</math>` : e
      );
      const a = Ll.content;
      if (s === "svg" || s === "mathml") {
        const l = a.firstChild;
        for (; l.firstChild; )
          a.appendChild(l.firstChild);
        a.removeChild(l);
      }
      t.insertBefore(a, n);
    }
    return [
      // first
      o ? o.nextSibling : t.firstChild,
      // last
      n ? n.previousSibling : t.lastChild
    ];
  }
}, Md = Symbol("_vtc");
function Dd(e, t, n) {
  const s = e[Md];
  s && (t = (t ? [t, ...s] : [...s]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
const Fi = Symbol("_vod"), Ou = Symbol("_vsh"), Fd = {
  beforeMount(e, { value: t }, { transition: n }) {
    e[Fi] = e.style.display === "none" ? "" : e.style.display, n && t ? n.beforeEnter(e) : vr(e, t);
  },
  mounted(e, { value: t }, { transition: n }) {
    n && t && n.enter(e);
  },
  updated(e, { value: t, oldValue: n }, { transition: s }) {
    !t != !n && (s ? t ? (s.beforeEnter(e), vr(e, !0), s.enter(e)) : s.leave(e, () => {
      vr(e, !1);
    }) : vr(e, t));
  },
  beforeUnmount(e, { value: t }) {
    vr(e, t);
  }
};
function vr(e, t) {
  e.style.display = t ? e[Fi] : "none", e[Ou] = !t;
}
const $d = Symbol(""), Bd = /(^|;)\s*display\s*:/;
function Ud(e, t, n) {
  const s = e.style, r = pt(n);
  let i = !1;
  if (n && !r) {
    if (t)
      if (pt(t))
        for (const o of t.split(";")) {
          const a = o.slice(0, o.indexOf(":")).trim();
          n[a] == null && vi(s, a, "");
        }
      else
        for (const o in t)
          n[o] == null && vi(s, o, "");
    for (const o in n)
      o === "display" && (i = !0), vi(s, o, n[o]);
  } else if (r) {
    if (t !== n) {
      const o = s[$d];
      o && (n += ";" + o), s.cssText = n, i = Bd.test(n);
    }
  } else t && e.removeAttribute("style");
  Fi in e && (e[Fi] = i ? s.display : "", e[Ou] && (s.display = "none"));
}
const Nl = /\s*!important$/;
function vi(e, t, n) {
  if (be(n))
    n.forEach((s) => vi(e, t, s));
  else if (n == null && (n = ""), t.startsWith("--"))
    e.setProperty(t, n);
  else {
    const s = zd(e, t);
    Nl.test(n) ? e.setProperty(
      hs(s),
      n.replace(Nl, ""),
      "important"
    ) : e[s] = n;
  }
}
const Pl = ["Webkit", "Moz", "ms"], Co = {};
function zd(e, t) {
  const n = Co[t];
  if (n)
    return n;
  let s = ls(t);
  if (s !== "filter" && s in e)
    return Co[t] = s;
  s = Pc(s);
  for (let r = 0; r < Pl.length; r++) {
    const i = Pl[r] + s;
    if (i in e)
      return Co[t] = i;
  }
  return t;
}
const Ml = "http://www.w3.org/1999/xlink";
function Dl(e, t, n, s, r, i = Xf(t)) {
  s && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(Ml, t.slice(6, t.length)) : e.setAttributeNS(Ml, t, n) : n == null || i && !Mc(n) ? e.removeAttribute(t) : e.setAttribute(
    t,
    i ? "" : fs(n) ? String(n) : n
  );
}
function Fl(e, t, n, s, r) {
  if (t === "innerHTML" || t === "textContent") {
    n != null && (e[t] = t === "innerHTML" ? Iu(n) : n);
    return;
  }
  const i = e.tagName;
  if (t === "value" && i !== "PROGRESS" && // custom elements may use _value internally
  !i.includes("-")) {
    const a = i === "OPTION" ? e.getAttribute("value") || "" : e.value, l = n == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      e.type === "checkbox" ? "on" : ""
    ) : String(n);
    (a !== l || !("_value" in e)) && (e.value = l), n == null && e.removeAttribute(t), e._value = n;
    return;
  }
  let o = !1;
  if (n === "" || n == null) {
    const a = typeof e[t];
    a === "boolean" ? n = Mc(n) : n == null && a === "string" ? (n = "", o = !0) : a === "number" && (n = 0, o = !0);
  }
  try {
    e[t] = n;
  } catch {
  }
  o && e.removeAttribute(r || t);
}
function Xs(e, t, n, s) {
  e.addEventListener(t, n, s);
}
function Hd(e, t, n, s) {
  e.removeEventListener(t, n, s);
}
const $l = Symbol("_vei");
function Wd(e, t, n, s, r = null) {
  const i = e[$l] || (e[$l] = {}), o = i[t];
  if (s && o)
    o.value = s;
  else {
    const [a, l] = jd(t);
    if (s) {
      const h = i[t] = Kd(
        s,
        r
      );
      Xs(e, a, h, l);
    } else o && (Hd(e, a, o, l), i[t] = void 0);
  }
}
const Bl = /(?:Once|Passive|Capture)$/;
function jd(e) {
  let t;
  if (Bl.test(e)) {
    t = {};
    let s;
    for (; s = e.match(Bl); )
      e = e.slice(0, e.length - s[0].length), t[s[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : hs(e.slice(2)), t];
}
let Ro = 0;
const qd = /* @__PURE__ */ Promise.resolve(), Vd = () => Ro || (qd.then(() => Ro = 0), Ro = Date.now());
function Kd(e, t) {
  const n = (s) => {
    if (!s._vts)
      s._vts = Date.now();
    else if (s._vts <= n.attached)
      return;
    Cn(
      Gd(s, n.value),
      t,
      5,
      [s]
    );
  };
  return n.value = e, n.attached = Vd(), n;
}
function Gd(e, t) {
  if (be(t)) {
    const n = e.stopImmediatePropagation;
    return e.stopImmediatePropagation = () => {
      n.call(e), e._stopped = !0;
    }, t.map(
      (s) => (r) => !r._stopped && s && s(r)
    );
  } else
    return t;
}
const Ul = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, Yd = (e, t, n, s, r, i) => {
  const o = r === "svg";
  t === "class" ? Dd(e, s, o) : t === "style" ? Ud(e, n, s) : qi(t) ? ma(t) || Wd(e, t, n, s, i) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : Xd(e, t, s, o)) ? (Fl(e, t, s), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && Dl(e, t, s, o, i, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !pt(s)) ? Fl(e, ls(t), s, i, t) : (t === "true-value" ? e._trueValue = s : t === "false-value" && (e._falseValue = s), Dl(e, t, s, o));
};
function Xd(e, t, n, s) {
  if (s)
    return !!(t === "innerHTML" || t === "textContent" || t in e && Ul(t) && xe(n));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const r = e.tagName;
    if (r === "IMG" || r === "VIDEO" || r === "CANVAS" || r === "SOURCE")
      return !1;
  }
  return Ul(t) && pt(n) ? !1 : t in e;
}
const zl = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return be(t) ? (n) => gi(t, n) : t;
};
function Zd(e) {
  e.target.composing = !0;
}
function Hl(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const Io = Symbol("_assign"), ks = {
  created(e, { modifiers: { lazy: t, trim: n, number: s } }, r) {
    e[Io] = zl(r);
    const i = s || r.props && r.props.type === "number";
    Xs(e, t ? "change" : "input", (o) => {
      if (o.target.composing) return;
      let a = e.value;
      n && (a = a.trim()), i && (a = Vo(a)), e[Io](a);
    }), n && Xs(e, "change", () => {
      e.value = e.value.trim();
    }), t || (Xs(e, "compositionstart", Zd), Xs(e, "compositionend", Hl), Xs(e, "change", Hl));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t }) {
    e.value = t ?? "";
  },
  beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: s, trim: r, number: i } }, o) {
    if (e[Io] = zl(o), e.composing) return;
    const a = (i || e.type === "number") && !/^0\d/.test(e.value) ? Vo(e.value) : e.value, l = t ?? "";
    a !== l && (document.activeElement === e && e.type !== "range" && (s && t === n || r && e.value.trim() === l) || (e.value = l));
  }
}, Jd = ["ctrl", "shift", "alt", "meta"], Qd = {
  stop: (e) => e.stopPropagation(),
  prevent: (e) => e.preventDefault(),
  self: (e) => e.target !== e.currentTarget,
  ctrl: (e) => !e.ctrlKey,
  shift: (e) => !e.shiftKey,
  alt: (e) => !e.altKey,
  meta: (e) => !e.metaKey,
  left: (e) => "button" in e && e.button !== 0,
  middle: (e) => "button" in e && e.button !== 1,
  right: (e) => "button" in e && e.button !== 2,
  exact: (e, t) => Jd.some((n) => e[`${n}Key`] && !t.includes(n))
}, Ss = (e, t) => {
  const n = e._withMods || (e._withMods = {}), s = t.join(".");
  return n[s] || (n[s] = (r, ...i) => {
    for (let o = 0; o < t.length; o++) {
      const a = Qd[t[o]];
      if (a && a(r, t)) return;
    }
    return e(r, ...i);
  });
}, ep = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, wi = (e, t) => {
  const n = e._withKeys || (e._withKeys = {}), s = t.join(".");
  return n[s] || (n[s] = (r) => {
    if (!("key" in r))
      return;
    const i = hs(r.key);
    if (t.some(
      (o) => o === i || ep[o] === i
    ))
      return e(r);
  });
}, tp = /* @__PURE__ */ Pt({ patchProp: Yd }, Pd);
let Wl;
function np() {
  return Wl || (Wl = rd(tp));
}
const sp = (...e) => {
  const t = np().createApp(...e), { mount: n } = t;
  return t.mount = (s) => {
    const r = ip(s);
    if (!r) return;
    const i = t._component;
    !xe(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
    const o = n(r, !1, rp(r));
    return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), o;
  }, t;
};
function rp(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function ip(e) {
  return pt(e) ? document.querySelector(e) : e;
}
const Lu = /* @__PURE__ */ new Set(["customer_required", "token_invalid"]), sa = (e) => !!e && Lu.has(e), sr = (e) => {
  const t = e.replace("#", ""), n = parseInt(t.substr(0, 2), 16), s = parseInt(t.substr(2, 2), 16), r = parseInt(t.substr(4, 2), 16);
  return (n * 299 + s * 587 + r * 114) / 1e3 < 128;
}, op = (e, t) => {
  const n = e.replace("#", ""), s = parseInt(n.substr(0, 2), 16), r = parseInt(n.substr(2, 2), 16), i = parseInt(n.substr(4, 2), 16), o = sr(e), a = o ? Math.min(255, s + t) : Math.max(0, s - t), l = o ? Math.min(255, r + t) : Math.max(0, r - t), h = o ? Math.min(255, i + t) : Math.max(0, i - t);
  return `#${a.toString(16).padStart(2, "0")}${l.toString(16).padStart(2, "0")}${h.toString(16).padStart(2, "0")}`;
}, wr = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e), ap = (e) => {
  switch (e.type) {
    case "connection_error":
      return "Unable to connect. Please try again later.";
    case "auth_error":
      return "Authentication failed. Please refresh the page.";
    case "chat_error":
      return "Unable to send message. Please try again.";
    case "ai_config_missing":
      return "Chat service is currently unavailable.";
    default:
      return e.error || "Something went wrong. Please try again.";
  }
};
function Ia() {
  return {
    async: !1,
    breaks: !1,
    extensions: null,
    gfm: !0,
    hooks: null,
    pedantic: !1,
    renderer: null,
    silent: !1,
    tokenizer: null,
    walkTokens: null
  };
}
var Ls = Ia();
function Nu(e) {
  Ls = e;
}
var Ur = { exec: () => null };
function qe(e, t = "") {
  let n = typeof e == "string" ? e : e.source;
  const s = {
    replace: (r, i) => {
      let o = typeof i == "string" ? i : i.source;
      return o = o.replace(Ut.caret, "$1"), n = n.replace(r, o), s;
    },
    getRegex: () => new RegExp(n, t)
  };
  return s;
}
var Ut = {
  codeRemoveIndent: /^(?: {1,4}| {0,3}\t)/gm,
  outputLinkReplace: /\\([\[\]])/g,
  indentCodeCompensation: /^(\s+)(?:```)/,
  beginningSpace: /^\s+/,
  endingHash: /#$/,
  startingSpaceChar: /^ /,
  endingSpaceChar: / $/,
  nonSpaceChar: /[^ ]/,
  newLineCharGlobal: /\n/g,
  tabCharGlobal: /\t/g,
  multipleSpaceGlobal: /\s+/g,
  blankLine: /^[ \t]*$/,
  doubleBlankLine: /\n[ \t]*\n[ \t]*$/,
  blockquoteStart: /^ {0,3}>/,
  blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g,
  blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm,
  listReplaceTabs: /^\t+/,
  listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g,
  listIsTask: /^\[[ xX]\] /,
  listReplaceTask: /^\[[ xX]\] +/,
  anyLine: /\n.*\n/,
  hrefBrackets: /^<(.*)>$/,
  tableDelimiter: /[:|]/,
  tableAlignChars: /^\||\| *$/g,
  tableRowBlankLine: /\n[ \t]*$/,
  tableAlignRight: /^ *-+: *$/,
  tableAlignCenter: /^ *:-+: *$/,
  tableAlignLeft: /^ *:-+ *$/,
  startATag: /^<a /i,
  endATag: /^<\/a>/i,
  startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i,
  endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i,
  startAngleBracket: /^</,
  endAngleBracket: />$/,
  pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/,
  unicodeAlphaNumeric: /[\p{L}\p{N}]/u,
  escapeTest: /[&<>"']/,
  escapeReplace: /[&<>"']/g,
  escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,
  escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,
  unescapeTest: /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig,
  caret: /(^|[^\[])\^/g,
  percentDecode: /%25/g,
  findPipe: /\|/g,
  splitPipe: / \|/,
  slashPipe: /\\\|/g,
  carriageReturn: /\r\n|\r/g,
  spaceLine: /^ +$/gm,
  notSpaceStart: /^\S*/,
  endingNewline: /\n$/,
  listItemRegex: (e) => new RegExp(`^( {0,3}${e})((?:[	 ][^\\n]*)?(?:\\n|$))`),
  nextBulletRegex: (e) => new RegExp(`^ {0,${Math.min(3, e - 1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),
  hrRegex: (e) => new RegExp(`^ {0,${Math.min(3, e - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),
  fencesBeginRegex: (e) => new RegExp(`^ {0,${Math.min(3, e - 1)}}(?:\`\`\`|~~~)`),
  headingBeginRegex: (e) => new RegExp(`^ {0,${Math.min(3, e - 1)}}#`),
  htmlBeginRegex: (e) => new RegExp(`^ {0,${Math.min(3, e - 1)}}<(?:[a-z].*>|!--)`, "i")
}, lp = /^(?:[ \t]*(?:\n|$))+/, cp = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/, up = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, Xr = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, fp = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, Oa = /(?:[*+-]|\d{1,9}[.)])/, Pu = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/, Mu = qe(Pu).replace(/bull/g, Oa).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(), hp = qe(Pu).replace(/bull/g, Oa).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(), La = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/, dp = /^[^\n]+/, Na = /(?!\s*\])(?:\\.|[^\[\]\\])+/, pp = qe(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", Na).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), mp = qe(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, Oa).getRegex(), io = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", Pa = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, gp = qe(
  "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))",
  "i"
).replace("comment", Pa).replace("tag", io).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), Du = qe(La).replace("hr", Xr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", io).getRegex(), _p = qe(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", Du).getRegex(), Ma = {
  blockquote: _p,
  code: cp,
  def: pp,
  fences: up,
  heading: fp,
  hr: Xr,
  html: gp,
  lheading: Mu,
  list: mp,
  newline: lp,
  paragraph: Du,
  table: Ur,
  text: dp
}, jl = qe(
  "^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"
).replace("hr", Xr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", io).getRegex(), yp = {
  ...Ma,
  lheading: hp,
  table: jl,
  paragraph: qe(La).replace("hr", Xr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", jl).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", io).getRegex()
}, bp = {
  ...Ma,
  html: qe(
    `^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`
  ).replace("comment", Pa).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
  heading: /^(#{1,6})(.*)(?:\n+|$)/,
  fences: Ur,
  // fences not supported
  lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  paragraph: qe(La).replace("hr", Xr).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", Mu).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
}, vp = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, wp = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, Fu = /^( {2,}|\\)\n(?!\s*$)/, kp = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, oo = /[\p{P}\p{S}]/u, Da = /[\s\p{P}\p{S}]/u, $u = /[^\s\p{P}\p{S}]/u, Tp = qe(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, Da).getRegex(), Bu = /(?!~)[\p{P}\p{S}]/u, Ap = /(?!~)[\s\p{P}\p{S}]/u, Sp = /(?:[^\s\p{P}\p{S}]|~)/u, xp = /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g, Uu = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/, Ep = qe(Uu, "u").replace(/punct/g, oo).getRegex(), Cp = qe(Uu, "u").replace(/punct/g, Bu).getRegex(), zu = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", Rp = qe(zu, "gu").replace(/notPunctSpace/g, $u).replace(/punctSpace/g, Da).replace(/punct/g, oo).getRegex(), Ip = qe(zu, "gu").replace(/notPunctSpace/g, Sp).replace(/punctSpace/g, Ap).replace(/punct/g, Bu).getRegex(), Op = qe(
  "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)",
  "gu"
).replace(/notPunctSpace/g, $u).replace(/punctSpace/g, Da).replace(/punct/g, oo).getRegex(), Lp = qe(/\\(punct)/, "gu").replace(/punct/g, oo).getRegex(), Np = qe(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), Pp = qe(Pa).replace("(?:-->|$)", "-->").getRegex(), Mp = qe(
  "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>"
).replace("comment", Pp).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), $i = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/, Dp = qe(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", $i).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), Hu = qe(/^!?\[(label)\]\[(ref)\]/).replace("label", $i).replace("ref", Na).getRegex(), Wu = qe(/^!?\[(ref)\](?:\[\])?/).replace("ref", Na).getRegex(), Fp = qe("reflink|nolink(?!\\()", "g").replace("reflink", Hu).replace("nolink", Wu).getRegex(), Fa = {
  _backpedal: Ur,
  // only used for GFM url
  anyPunctuation: Lp,
  autolink: Np,
  blockSkip: xp,
  br: Fu,
  code: wp,
  del: Ur,
  emStrongLDelim: Ep,
  emStrongRDelimAst: Rp,
  emStrongRDelimUnd: Op,
  escape: vp,
  link: Dp,
  nolink: Wu,
  punctuation: Tp,
  reflink: Hu,
  reflinkSearch: Fp,
  tag: Mp,
  text: kp,
  url: Ur
}, $p = {
  ...Fa,
  link: qe(/^!?\[(label)\]\((.*?)\)/).replace("label", $i).getRegex(),
  reflink: qe(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", $i).getRegex()
}, ra = {
  ...Fa,
  emStrongRDelimAst: Ip,
  emStrongLDelim: Cp,
  url: qe(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, "i").replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
  _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
}, Bp = {
  ...ra,
  br: qe(Fu).replace("{2,}", "*").getRegex(),
  text: qe(ra.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
}, hi = {
  normal: Ma,
  gfm: yp,
  pedantic: bp
}, kr = {
  normal: Fa,
  gfm: ra,
  breaks: Bp,
  pedantic: $p
}, Up = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}, ql = (e) => Up[e];
function kn(e, t) {
  if (t) {
    if (Ut.escapeTest.test(e))
      return e.replace(Ut.escapeReplace, ql);
  } else if (Ut.escapeTestNoEncode.test(e))
    return e.replace(Ut.escapeReplaceNoEncode, ql);
  return e;
}
function Vl(e) {
  try {
    e = encodeURI(e).replace(Ut.percentDecode, "%");
  } catch {
    return null;
  }
  return e;
}
function Kl(e, t) {
  var i;
  const n = e.replace(Ut.findPipe, (o, a, l) => {
    let h = !1, u = a;
    for (; --u >= 0 && l[u] === "\\"; ) h = !h;
    return h ? "|" : " |";
  }), s = n.split(Ut.splitPipe);
  let r = 0;
  if (s[0].trim() || s.shift(), s.length > 0 && !((i = s.at(-1)) != null && i.trim()) && s.pop(), t)
    if (s.length > t)
      s.splice(t);
    else
      for (; s.length < t; ) s.push("");
  for (; r < s.length; r++)
    s[r] = s[r].trim().replace(Ut.slashPipe, "|");
  return s;
}
function Tr(e, t, n) {
  const s = e.length;
  if (s === 0)
    return "";
  let r = 0;
  for (; r < s && e.charAt(s - r - 1) === t; )
    r++;
  return e.slice(0, s - r);
}
function zp(e, t) {
  if (e.indexOf(t[1]) === -1)
    return -1;
  let n = 0;
  for (let s = 0; s < e.length; s++)
    if (e[s] === "\\")
      s++;
    else if (e[s] === t[0])
      n++;
    else if (e[s] === t[1] && (n--, n < 0))
      return s;
  return n > 0 ? -2 : -1;
}
function Gl(e, t, n, s, r) {
  const i = t.href, o = t.title || null, a = e[1].replace(r.other.outputLinkReplace, "$1");
  s.state.inLink = !0;
  const l = {
    type: e[0].charAt(0) === "!" ? "image" : "link",
    raw: n,
    href: i,
    title: o,
    text: a,
    tokens: s.inlineTokens(a)
  };
  return s.state.inLink = !1, l;
}
function Hp(e, t, n) {
  const s = e.match(n.other.indentCodeCompensation);
  if (s === null)
    return t;
  const r = s[1];
  return t.split(`
`).map((i) => {
    const o = i.match(n.other.beginningSpace);
    if (o === null)
      return i;
    const [a] = o;
    return a.length >= r.length ? i.slice(r.length) : i;
  }).join(`
`);
}
var Bi = class {
  // set by the lexer
  constructor(e) {
    Je(this, "options");
    Je(this, "rules");
    // set by the lexer
    Je(this, "lexer");
    this.options = e || Ls;
  }
  space(e) {
    const t = this.rules.block.newline.exec(e);
    if (t && t[0].length > 0)
      return {
        type: "space",
        raw: t[0]
      };
  }
  code(e) {
    const t = this.rules.block.code.exec(e);
    if (t) {
      const n = t[0].replace(this.rules.other.codeRemoveIndent, "");
      return {
        type: "code",
        raw: t[0],
        codeBlockStyle: "indented",
        text: this.options.pedantic ? n : Tr(n, `
`)
      };
    }
  }
  fences(e) {
    const t = this.rules.block.fences.exec(e);
    if (t) {
      const n = t[0], s = Hp(n, t[3] || "", this.rules);
      return {
        type: "code",
        raw: n,
        lang: t[2] ? t[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : t[2],
        text: s
      };
    }
  }
  heading(e) {
    const t = this.rules.block.heading.exec(e);
    if (t) {
      let n = t[2].trim();
      if (this.rules.other.endingHash.test(n)) {
        const s = Tr(n, "#");
        (this.options.pedantic || !s || this.rules.other.endingSpaceChar.test(s)) && (n = s.trim());
      }
      return {
        type: "heading",
        raw: t[0],
        depth: t[1].length,
        text: n,
        tokens: this.lexer.inline(n)
      };
    }
  }
  hr(e) {
    const t = this.rules.block.hr.exec(e);
    if (t)
      return {
        type: "hr",
        raw: Tr(t[0], `
`)
      };
  }
  blockquote(e) {
    const t = this.rules.block.blockquote.exec(e);
    if (t) {
      let n = Tr(t[0], `
`).split(`
`), s = "", r = "";
      const i = [];
      for (; n.length > 0; ) {
        let o = !1;
        const a = [];
        let l;
        for (l = 0; l < n.length; l++)
          if (this.rules.other.blockquoteStart.test(n[l]))
            a.push(n[l]), o = !0;
          else if (!o)
            a.push(n[l]);
          else
            break;
        n = n.slice(l);
        const h = a.join(`
`), u = h.replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
        s = s ? `${s}
${h}` : h, r = r ? `${r}
${u}` : u;
        const k = this.lexer.state.top;
        if (this.lexer.state.top = !0, this.lexer.blockTokens(u, i, !0), this.lexer.state.top = k, n.length === 0)
          break;
        const b = i.at(-1);
        if ((b == null ? void 0 : b.type) === "code")
          break;
        if ((b == null ? void 0 : b.type) === "blockquote") {
          const I = b, B = I.raw + `
` + n.join(`
`), H = this.blockquote(B);
          i[i.length - 1] = H, s = s.substring(0, s.length - I.raw.length) + H.raw, r = r.substring(0, r.length - I.text.length) + H.text;
          break;
        } else if ((b == null ? void 0 : b.type) === "list") {
          const I = b, B = I.raw + `
` + n.join(`
`), H = this.list(B);
          i[i.length - 1] = H, s = s.substring(0, s.length - b.raw.length) + H.raw, r = r.substring(0, r.length - I.raw.length) + H.raw, n = B.substring(i.at(-1).raw.length).split(`
`);
          continue;
        }
      }
      return {
        type: "blockquote",
        raw: s,
        tokens: i,
        text: r
      };
    }
  }
  list(e) {
    let t = this.rules.block.list.exec(e);
    if (t) {
      let n = t[1].trim();
      const s = n.length > 1, r = {
        type: "list",
        raw: "",
        ordered: s,
        start: s ? +n.slice(0, -1) : "",
        loose: !1,
        items: []
      };
      n = s ? `\\d{1,9}\\${n.slice(-1)}` : `\\${n}`, this.options.pedantic && (n = s ? n : "[*+-]");
      const i = this.rules.other.listItemRegex(n);
      let o = !1;
      for (; e; ) {
        let l = !1, h = "", u = "";
        if (!(t = i.exec(e)) || this.rules.block.hr.test(e))
          break;
        h = t[0], e = e.substring(h.length);
        let k = t[2].split(`
`, 1)[0].replace(this.rules.other.listReplaceTabs, (R) => " ".repeat(3 * R.length)), b = e.split(`
`, 1)[0], I = !k.trim(), B = 0;
        if (this.options.pedantic ? (B = 2, u = k.trimStart()) : I ? B = t[1].length + 1 : (B = t[2].search(this.rules.other.nonSpaceChar), B = B > 4 ? 1 : B, u = k.slice(B), B += t[1].length), I && this.rules.other.blankLine.test(b) && (h += b + `
`, e = e.substring(b.length + 1), l = !0), !l) {
          const R = this.rules.other.nextBulletRegex(B), le = this.rules.other.hrRegex(B), de = this.rules.other.fencesBeginRegex(B), C = this.rules.other.headingBeginRegex(B), v = this.rules.other.htmlBeginRegex(B);
          for (; e; ) {
            const q = e.split(`
`, 1)[0];
            let K;
            if (b = q, this.options.pedantic ? (b = b.replace(this.rules.other.listReplaceNesting, "  "), K = b) : K = b.replace(this.rules.other.tabCharGlobal, "    "), de.test(b) || C.test(b) || v.test(b) || R.test(b) || le.test(b))
              break;
            if (K.search(this.rules.other.nonSpaceChar) >= B || !b.trim())
              u += `
` + K.slice(B);
            else {
              if (I || k.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || de.test(k) || C.test(k) || le.test(k))
                break;
              u += `
` + b;
            }
            !I && !b.trim() && (I = !0), h += q + `
`, e = e.substring(q.length + 1), k = K.slice(B);
          }
        }
        r.loose || (o ? r.loose = !0 : this.rules.other.doubleBlankLine.test(h) && (o = !0));
        let H = null, he;
        this.options.gfm && (H = this.rules.other.listIsTask.exec(u), H && (he = H[0] !== "[ ] ", u = u.replace(this.rules.other.listReplaceTask, ""))), r.items.push({
          type: "list_item",
          raw: h,
          task: !!H,
          checked: he,
          loose: !1,
          text: u,
          tokens: []
        }), r.raw += h;
      }
      const a = r.items.at(-1);
      if (a)
        a.raw = a.raw.trimEnd(), a.text = a.text.trimEnd();
      else
        return;
      r.raw = r.raw.trimEnd();
      for (let l = 0; l < r.items.length; l++)
        if (this.lexer.state.top = !1, r.items[l].tokens = this.lexer.blockTokens(r.items[l].text, []), !r.loose) {
          const h = r.items[l].tokens.filter((k) => k.type === "space"), u = h.length > 0 && h.some((k) => this.rules.other.anyLine.test(k.raw));
          r.loose = u;
        }
      if (r.loose)
        for (let l = 0; l < r.items.length; l++)
          r.items[l].loose = !0;
      return r;
    }
  }
  html(e) {
    const t = this.rules.block.html.exec(e);
    if (t)
      return {
        type: "html",
        block: !0,
        raw: t[0],
        pre: t[1] === "pre" || t[1] === "script" || t[1] === "style",
        text: t[0]
      };
  }
  def(e) {
    const t = this.rules.block.def.exec(e);
    if (t) {
      const n = t[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal, " "), s = t[2] ? t[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "", r = t[3] ? t[3].substring(1, t[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : t[3];
      return {
        type: "def",
        tag: n,
        raw: t[0],
        href: s,
        title: r
      };
    }
  }
  table(e) {
    var o;
    const t = this.rules.block.table.exec(e);
    if (!t || !this.rules.other.tableDelimiter.test(t[2]))
      return;
    const n = Kl(t[1]), s = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), r = (o = t[3]) != null && o.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
`) : [], i = {
      type: "table",
      raw: t[0],
      header: [],
      align: [],
      rows: []
    };
    if (n.length === s.length) {
      for (const a of s)
        this.rules.other.tableAlignRight.test(a) ? i.align.push("right") : this.rules.other.tableAlignCenter.test(a) ? i.align.push("center") : this.rules.other.tableAlignLeft.test(a) ? i.align.push("left") : i.align.push(null);
      for (let a = 0; a < n.length; a++)
        i.header.push({
          text: n[a],
          tokens: this.lexer.inline(n[a]),
          header: !0,
          align: i.align[a]
        });
      for (const a of r)
        i.rows.push(Kl(a, i.header.length).map((l, h) => ({
          text: l,
          tokens: this.lexer.inline(l),
          header: !1,
          align: i.align[h]
        })));
      return i;
    }
  }
  lheading(e) {
    const t = this.rules.block.lheading.exec(e);
    if (t)
      return {
        type: "heading",
        raw: t[0],
        depth: t[2].charAt(0) === "=" ? 1 : 2,
        text: t[1],
        tokens: this.lexer.inline(t[1])
      };
  }
  paragraph(e) {
    const t = this.rules.block.paragraph.exec(e);
    if (t) {
      const n = t[1].charAt(t[1].length - 1) === `
` ? t[1].slice(0, -1) : t[1];
      return {
        type: "paragraph",
        raw: t[0],
        text: n,
        tokens: this.lexer.inline(n)
      };
    }
  }
  text(e) {
    const t = this.rules.block.text.exec(e);
    if (t)
      return {
        type: "text",
        raw: t[0],
        text: t[0],
        tokens: this.lexer.inline(t[0])
      };
  }
  escape(e) {
    const t = this.rules.inline.escape.exec(e);
    if (t)
      return {
        type: "escape",
        raw: t[0],
        text: t[1]
      };
  }
  tag(e) {
    const t = this.rules.inline.tag.exec(e);
    if (t)
      return !this.lexer.state.inLink && this.rules.other.startATag.test(t[0]) ? this.lexer.state.inLink = !0 : this.lexer.state.inLink && this.rules.other.endATag.test(t[0]) && (this.lexer.state.inLink = !1), !this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(t[0]) ? this.lexer.state.inRawBlock = !0 : this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(t[0]) && (this.lexer.state.inRawBlock = !1), {
        type: "html",
        raw: t[0],
        inLink: this.lexer.state.inLink,
        inRawBlock: this.lexer.state.inRawBlock,
        block: !1,
        text: t[0]
      };
  }
  link(e) {
    const t = this.rules.inline.link.exec(e);
    if (t) {
      const n = t[2].trim();
      if (!this.options.pedantic && this.rules.other.startAngleBracket.test(n)) {
        if (!this.rules.other.endAngleBracket.test(n))
          return;
        const i = Tr(n.slice(0, -1), "\\");
        if ((n.length - i.length) % 2 === 0)
          return;
      } else {
        const i = zp(t[2], "()");
        if (i === -2)
          return;
        if (i > -1) {
          const a = (t[0].indexOf("!") === 0 ? 5 : 4) + t[1].length + i;
          t[2] = t[2].substring(0, i), t[0] = t[0].substring(0, a).trim(), t[3] = "";
        }
      }
      let s = t[2], r = "";
      if (this.options.pedantic) {
        const i = this.rules.other.pedanticHrefTitle.exec(s);
        i && (s = i[1], r = i[3]);
      } else
        r = t[3] ? t[3].slice(1, -1) : "";
      return s = s.trim(), this.rules.other.startAngleBracket.test(s) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n) ? s = s.slice(1) : s = s.slice(1, -1)), Gl(t, {
        href: s && s.replace(this.rules.inline.anyPunctuation, "$1"),
        title: r && r.replace(this.rules.inline.anyPunctuation, "$1")
      }, t[0], this.lexer, this.rules);
    }
  }
  reflink(e, t) {
    let n;
    if ((n = this.rules.inline.reflink.exec(e)) || (n = this.rules.inline.nolink.exec(e))) {
      const s = (n[2] || n[1]).replace(this.rules.other.multipleSpaceGlobal, " "), r = t[s.toLowerCase()];
      if (!r) {
        const i = n[0].charAt(0);
        return {
          type: "text",
          raw: i,
          text: i
        };
      }
      return Gl(n, r, n[0], this.lexer, this.rules);
    }
  }
  emStrong(e, t, n = "") {
    let s = this.rules.inline.emStrongLDelim.exec(e);
    if (!s || s[3] && n.match(this.rules.other.unicodeAlphaNumeric)) return;
    if (!(s[1] || s[2] || "") || !n || this.rules.inline.punctuation.exec(n)) {
      const i = [...s[0]].length - 1;
      let o, a, l = i, h = 0;
      const u = s[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      for (u.lastIndex = 0, t = t.slice(-1 * e.length + i); (s = u.exec(t)) != null; ) {
        if (o = s[1] || s[2] || s[3] || s[4] || s[5] || s[6], !o) continue;
        if (a = [...o].length, s[3] || s[4]) {
          l += a;
          continue;
        } else if ((s[5] || s[6]) && i % 3 && !((i + a) % 3)) {
          h += a;
          continue;
        }
        if (l -= a, l > 0) continue;
        a = Math.min(a, a + l + h);
        const k = [...s[0]][0].length, b = e.slice(0, i + s.index + k + a);
        if (Math.min(i, a) % 2) {
          const B = b.slice(1, -1);
          return {
            type: "em",
            raw: b,
            text: B,
            tokens: this.lexer.inlineTokens(B)
          };
        }
        const I = b.slice(2, -2);
        return {
          type: "strong",
          raw: b,
          text: I,
          tokens: this.lexer.inlineTokens(I)
        };
      }
    }
  }
  codespan(e) {
    const t = this.rules.inline.code.exec(e);
    if (t) {
      let n = t[2].replace(this.rules.other.newLineCharGlobal, " ");
      const s = this.rules.other.nonSpaceChar.test(n), r = this.rules.other.startingSpaceChar.test(n) && this.rules.other.endingSpaceChar.test(n);
      return s && r && (n = n.substring(1, n.length - 1)), {
        type: "codespan",
        raw: t[0],
        text: n
      };
    }
  }
  br(e) {
    const t = this.rules.inline.br.exec(e);
    if (t)
      return {
        type: "br",
        raw: t[0]
      };
  }
  del(e) {
    const t = this.rules.inline.del.exec(e);
    if (t)
      return {
        type: "del",
        raw: t[0],
        text: t[2],
        tokens: this.lexer.inlineTokens(t[2])
      };
  }
  autolink(e) {
    const t = this.rules.inline.autolink.exec(e);
    if (t) {
      let n, s;
      return t[2] === "@" ? (n = t[1], s = "mailto:" + n) : (n = t[1], s = n), {
        type: "link",
        raw: t[0],
        text: n,
        href: s,
        tokens: [
          {
            type: "text",
            raw: n,
            text: n
          }
        ]
      };
    }
  }
  url(e) {
    var n;
    let t;
    if (t = this.rules.inline.url.exec(e)) {
      let s, r;
      if (t[2] === "@")
        s = t[0], r = "mailto:" + s;
      else {
        let i;
        do
          i = t[0], t[0] = ((n = this.rules.inline._backpedal.exec(t[0])) == null ? void 0 : n[0]) ?? "";
        while (i !== t[0]);
        s = t[0], t[1] === "www." ? r = "http://" + t[0] : r = t[0];
      }
      return {
        type: "link",
        raw: t[0],
        text: s,
        href: r,
        tokens: [
          {
            type: "text",
            raw: s,
            text: s
          }
        ]
      };
    }
  }
  inlineText(e) {
    const t = this.rules.inline.text.exec(e);
    if (t) {
      const n = this.lexer.state.inRawBlock;
      return {
        type: "text",
        raw: t[0],
        text: t[0],
        escaped: n
      };
    }
  }
}, Un = class ia {
  constructor(t) {
    Je(this, "tokens");
    Je(this, "options");
    Je(this, "state");
    Je(this, "tokenizer");
    Je(this, "inlineQueue");
    this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = t || Ls, this.options.tokenizer = this.options.tokenizer || new Bi(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = {
      inLink: !1,
      inRawBlock: !1,
      top: !0
    };
    const n = {
      other: Ut,
      block: hi.normal,
      inline: kr.normal
    };
    this.options.pedantic ? (n.block = hi.pedantic, n.inline = kr.pedantic) : this.options.gfm && (n.block = hi.gfm, this.options.breaks ? n.inline = kr.breaks : n.inline = kr.gfm), this.tokenizer.rules = n;
  }
  /**
   * Expose Rules
   */
  static get rules() {
    return {
      block: hi,
      inline: kr
    };
  }
  /**
   * Static Lex Method
   */
  static lex(t, n) {
    return new ia(n).lex(t);
  }
  /**
   * Static Lex Inline Method
   */
  static lexInline(t, n) {
    return new ia(n).inlineTokens(t);
  }
  /**
   * Preprocessing
   */
  lex(t) {
    t = t.replace(Ut.carriageReturn, `
`), this.blockTokens(t, this.tokens);
    for (let n = 0; n < this.inlineQueue.length; n++) {
      const s = this.inlineQueue[n];
      this.inlineTokens(s.src, s.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(t, n = [], s = !1) {
    var r, i, o;
    for (this.options.pedantic && (t = t.replace(Ut.tabCharGlobal, "    ").replace(Ut.spaceLine, "")); t; ) {
      let a;
      if ((i = (r = this.options.extensions) == null ? void 0 : r.block) != null && i.some((h) => (a = h.call({ lexer: this }, t, n)) ? (t = t.substring(a.raw.length), n.push(a), !0) : !1))
        continue;
      if (a = this.tokenizer.space(t)) {
        t = t.substring(a.raw.length);
        const h = n.at(-1);
        a.raw.length === 1 && h !== void 0 ? h.raw += `
` : n.push(a);
        continue;
      }
      if (a = this.tokenizer.code(t)) {
        t = t.substring(a.raw.length);
        const h = n.at(-1);
        (h == null ? void 0 : h.type) === "paragraph" || (h == null ? void 0 : h.type) === "text" ? (h.raw += `
` + a.raw, h.text += `
` + a.text, this.inlineQueue.at(-1).src = h.text) : n.push(a);
        continue;
      }
      if (a = this.tokenizer.fences(t)) {
        t = t.substring(a.raw.length), n.push(a);
        continue;
      }
      if (a = this.tokenizer.heading(t)) {
        t = t.substring(a.raw.length), n.push(a);
        continue;
      }
      if (a = this.tokenizer.hr(t)) {
        t = t.substring(a.raw.length), n.push(a);
        continue;
      }
      if (a = this.tokenizer.blockquote(t)) {
        t = t.substring(a.raw.length), n.push(a);
        continue;
      }
      if (a = this.tokenizer.list(t)) {
        t = t.substring(a.raw.length), n.push(a);
        continue;
      }
      if (a = this.tokenizer.html(t)) {
        t = t.substring(a.raw.length), n.push(a);
        continue;
      }
      if (a = this.tokenizer.def(t)) {
        t = t.substring(a.raw.length);
        const h = n.at(-1);
        (h == null ? void 0 : h.type) === "paragraph" || (h == null ? void 0 : h.type) === "text" ? (h.raw += `
` + a.raw, h.text += `
` + a.raw, this.inlineQueue.at(-1).src = h.text) : this.tokens.links[a.tag] || (this.tokens.links[a.tag] = {
          href: a.href,
          title: a.title
        });
        continue;
      }
      if (a = this.tokenizer.table(t)) {
        t = t.substring(a.raw.length), n.push(a);
        continue;
      }
      if (a = this.tokenizer.lheading(t)) {
        t = t.substring(a.raw.length), n.push(a);
        continue;
      }
      let l = t;
      if ((o = this.options.extensions) != null && o.startBlock) {
        let h = 1 / 0;
        const u = t.slice(1);
        let k;
        this.options.extensions.startBlock.forEach((b) => {
          k = b.call({ lexer: this }, u), typeof k == "number" && k >= 0 && (h = Math.min(h, k));
        }), h < 1 / 0 && h >= 0 && (l = t.substring(0, h + 1));
      }
      if (this.state.top && (a = this.tokenizer.paragraph(l))) {
        const h = n.at(-1);
        s && (h == null ? void 0 : h.type) === "paragraph" ? (h.raw += `
` + a.raw, h.text += `
` + a.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = h.text) : n.push(a), s = l.length !== t.length, t = t.substring(a.raw.length);
        continue;
      }
      if (a = this.tokenizer.text(t)) {
        t = t.substring(a.raw.length);
        const h = n.at(-1);
        (h == null ? void 0 : h.type) === "text" ? (h.raw += `
` + a.raw, h.text += `
` + a.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = h.text) : n.push(a);
        continue;
      }
      if (t) {
        const h = "Infinite loop on byte: " + t.charCodeAt(0);
        if (this.options.silent) {
          console.error(h);
          break;
        } else
          throw new Error(h);
      }
    }
    return this.state.top = !0, n;
  }
  inline(t, n = []) {
    return this.inlineQueue.push({ src: t, tokens: n }), n;
  }
  /**
   * Lexing/Compiling
   */
  inlineTokens(t, n = []) {
    var a, l, h;
    let s = t, r = null;
    if (this.tokens.links) {
      const u = Object.keys(this.tokens.links);
      if (u.length > 0)
        for (; (r = this.tokenizer.rules.inline.reflinkSearch.exec(s)) != null; )
          u.includes(r[0].slice(r[0].lastIndexOf("[") + 1, -1)) && (s = s.slice(0, r.index) + "[" + "a".repeat(r[0].length - 2) + "]" + s.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex));
    }
    for (; (r = this.tokenizer.rules.inline.anyPunctuation.exec(s)) != null; )
      s = s.slice(0, r.index) + "++" + s.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);
    for (; (r = this.tokenizer.rules.inline.blockSkip.exec(s)) != null; )
      s = s.slice(0, r.index) + "[" + "a".repeat(r[0].length - 2) + "]" + s.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
    let i = !1, o = "";
    for (; t; ) {
      i || (o = ""), i = !1;
      let u;
      if ((l = (a = this.options.extensions) == null ? void 0 : a.inline) != null && l.some((b) => (u = b.call({ lexer: this }, t, n)) ? (t = t.substring(u.raw.length), n.push(u), !0) : !1))
        continue;
      if (u = this.tokenizer.escape(t)) {
        t = t.substring(u.raw.length), n.push(u);
        continue;
      }
      if (u = this.tokenizer.tag(t)) {
        t = t.substring(u.raw.length), n.push(u);
        continue;
      }
      if (u = this.tokenizer.link(t)) {
        t = t.substring(u.raw.length), n.push(u);
        continue;
      }
      if (u = this.tokenizer.reflink(t, this.tokens.links)) {
        t = t.substring(u.raw.length);
        const b = n.at(-1);
        u.type === "text" && (b == null ? void 0 : b.type) === "text" ? (b.raw += u.raw, b.text += u.text) : n.push(u);
        continue;
      }
      if (u = this.tokenizer.emStrong(t, s, o)) {
        t = t.substring(u.raw.length), n.push(u);
        continue;
      }
      if (u = this.tokenizer.codespan(t)) {
        t = t.substring(u.raw.length), n.push(u);
        continue;
      }
      if (u = this.tokenizer.br(t)) {
        t = t.substring(u.raw.length), n.push(u);
        continue;
      }
      if (u = this.tokenizer.del(t)) {
        t = t.substring(u.raw.length), n.push(u);
        continue;
      }
      if (u = this.tokenizer.autolink(t)) {
        t = t.substring(u.raw.length), n.push(u);
        continue;
      }
      if (!this.state.inLink && (u = this.tokenizer.url(t))) {
        t = t.substring(u.raw.length), n.push(u);
        continue;
      }
      let k = t;
      if ((h = this.options.extensions) != null && h.startInline) {
        let b = 1 / 0;
        const I = t.slice(1);
        let B;
        this.options.extensions.startInline.forEach((H) => {
          B = H.call({ lexer: this }, I), typeof B == "number" && B >= 0 && (b = Math.min(b, B));
        }), b < 1 / 0 && b >= 0 && (k = t.substring(0, b + 1));
      }
      if (u = this.tokenizer.inlineText(k)) {
        t = t.substring(u.raw.length), u.raw.slice(-1) !== "_" && (o = u.raw.slice(-1)), i = !0;
        const b = n.at(-1);
        (b == null ? void 0 : b.type) === "text" ? (b.raw += u.raw, b.text += u.text) : n.push(u);
        continue;
      }
      if (t) {
        const b = "Infinite loop on byte: " + t.charCodeAt(0);
        if (this.options.silent) {
          console.error(b);
          break;
        } else
          throw new Error(b);
      }
    }
    return n;
  }
}, Ui = class {
  // set by the parser
  constructor(e) {
    Je(this, "options");
    Je(this, "parser");
    this.options = e || Ls;
  }
  space(e) {
    return "";
  }
  code({ text: e, lang: t, escaped: n }) {
    var i;
    const s = (i = (t || "").match(Ut.notSpaceStart)) == null ? void 0 : i[0], r = e.replace(Ut.endingNewline, "") + `
`;
    return s ? '<pre><code class="language-' + kn(s) + '">' + (n ? r : kn(r, !0)) + `</code></pre>
` : "<pre><code>" + (n ? r : kn(r, !0)) + `</code></pre>
`;
  }
  blockquote({ tokens: e }) {
    return `<blockquote>
${this.parser.parse(e)}</blockquote>
`;
  }
  html({ text: e }) {
    return e;
  }
  heading({ tokens: e, depth: t }) {
    return `<h${t}>${this.parser.parseInline(e)}</h${t}>
`;
  }
  hr(e) {
    return `<hr>
`;
  }
  list(e) {
    const t = e.ordered, n = e.start;
    let s = "";
    for (let o = 0; o < e.items.length; o++) {
      const a = e.items[o];
      s += this.listitem(a);
    }
    const r = t ? "ol" : "ul", i = t && n !== 1 ? ' start="' + n + '"' : "";
    return "<" + r + i + `>
` + s + "</" + r + `>
`;
  }
  listitem(e) {
    var n;
    let t = "";
    if (e.task) {
      const s = this.checkbox({ checked: !!e.checked });
      e.loose ? ((n = e.tokens[0]) == null ? void 0 : n.type) === "paragraph" ? (e.tokens[0].text = s + " " + e.tokens[0].text, e.tokens[0].tokens && e.tokens[0].tokens.length > 0 && e.tokens[0].tokens[0].type === "text" && (e.tokens[0].tokens[0].text = s + " " + kn(e.tokens[0].tokens[0].text), e.tokens[0].tokens[0].escaped = !0)) : e.tokens.unshift({
        type: "text",
        raw: s + " ",
        text: s + " ",
        escaped: !0
      }) : t += s + " ";
    }
    return t += this.parser.parse(e.tokens, !!e.loose), `<li>${t}</li>
`;
  }
  checkbox({ checked: e }) {
    return "<input " + (e ? 'checked="" ' : "") + 'disabled="" type="checkbox">';
  }
  paragraph({ tokens: e }) {
    return `<p>${this.parser.parseInline(e)}</p>
`;
  }
  table(e) {
    let t = "", n = "";
    for (let r = 0; r < e.header.length; r++)
      n += this.tablecell(e.header[r]);
    t += this.tablerow({ text: n });
    let s = "";
    for (let r = 0; r < e.rows.length; r++) {
      const i = e.rows[r];
      n = "";
      for (let o = 0; o < i.length; o++)
        n += this.tablecell(i[o]);
      s += this.tablerow({ text: n });
    }
    return s && (s = `<tbody>${s}</tbody>`), `<table>
<thead>
` + t + `</thead>
` + s + `</table>
`;
  }
  tablerow({ text: e }) {
    return `<tr>
${e}</tr>
`;
  }
  tablecell(e) {
    const t = this.parser.parseInline(e.tokens), n = e.header ? "th" : "td";
    return (e.align ? `<${n} align="${e.align}">` : `<${n}>`) + t + `</${n}>
`;
  }
  /**
   * span level renderer
   */
  strong({ tokens: e }) {
    return `<strong>${this.parser.parseInline(e)}</strong>`;
  }
  em({ tokens: e }) {
    return `<em>${this.parser.parseInline(e)}</em>`;
  }
  codespan({ text: e }) {
    return `<code>${kn(e, !0)}</code>`;
  }
  br(e) {
    return "<br>";
  }
  del({ tokens: e }) {
    return `<del>${this.parser.parseInline(e)}</del>`;
  }
  link({ href: e, title: t, tokens: n }) {
    const s = this.parser.parseInline(n), r = Vl(e);
    if (r === null)
      return s;
    e = r;
    let i = '<a href="' + e + '"';
    return t && (i += ' title="' + kn(t) + '"'), i += ">" + s + "</a>", i;
  }
  image({ href: e, title: t, text: n, tokens: s }) {
    s && (n = this.parser.parseInline(s, this.parser.textRenderer));
    const r = Vl(e);
    if (r === null)
      return kn(n);
    e = r;
    let i = `<img src="${e}" alt="${n}"`;
    return t && (i += ` title="${kn(t)}"`), i += ">", i;
  }
  text(e) {
    return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : kn(e.text);
  }
}, $a = class {
  // no need for block level renderers
  strong({ text: e }) {
    return e;
  }
  em({ text: e }) {
    return e;
  }
  codespan({ text: e }) {
    return e;
  }
  del({ text: e }) {
    return e;
  }
  html({ text: e }) {
    return e;
  }
  text({ text: e }) {
    return e;
  }
  link({ text: e }) {
    return "" + e;
  }
  image({ text: e }) {
    return "" + e;
  }
  br() {
    return "";
  }
}, zn = class oa {
  constructor(t) {
    Je(this, "options");
    Je(this, "renderer");
    Je(this, "textRenderer");
    this.options = t || Ls, this.options.renderer = this.options.renderer || new Ui(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new $a();
  }
  /**
   * Static Parse Method
   */
  static parse(t, n) {
    return new oa(n).parse(t);
  }
  /**
   * Static Parse Inline Method
   */
  static parseInline(t, n) {
    return new oa(n).parseInline(t);
  }
  /**
   * Parse Loop
   */
  parse(t, n = !0) {
    var r, i;
    let s = "";
    for (let o = 0; o < t.length; o++) {
      const a = t[o];
      if ((i = (r = this.options.extensions) == null ? void 0 : r.renderers) != null && i[a.type]) {
        const h = a, u = this.options.extensions.renderers[h.type].call({ parser: this }, h);
        if (u !== !1 || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "paragraph", "text"].includes(h.type)) {
          s += u || "";
          continue;
        }
      }
      const l = a;
      switch (l.type) {
        case "space": {
          s += this.renderer.space(l);
          continue;
        }
        case "hr": {
          s += this.renderer.hr(l);
          continue;
        }
        case "heading": {
          s += this.renderer.heading(l);
          continue;
        }
        case "code": {
          s += this.renderer.code(l);
          continue;
        }
        case "table": {
          s += this.renderer.table(l);
          continue;
        }
        case "blockquote": {
          s += this.renderer.blockquote(l);
          continue;
        }
        case "list": {
          s += this.renderer.list(l);
          continue;
        }
        case "html": {
          s += this.renderer.html(l);
          continue;
        }
        case "paragraph": {
          s += this.renderer.paragraph(l);
          continue;
        }
        case "text": {
          let h = l, u = this.renderer.text(h);
          for (; o + 1 < t.length && t[o + 1].type === "text"; )
            h = t[++o], u += `
` + this.renderer.text(h);
          n ? s += this.renderer.paragraph({
            type: "paragraph",
            raw: u,
            text: u,
            tokens: [{ type: "text", raw: u, text: u, escaped: !0 }]
          }) : s += u;
          continue;
        }
        default: {
          const h = 'Token with "' + l.type + '" type was not found.';
          if (this.options.silent)
            return console.error(h), "";
          throw new Error(h);
        }
      }
    }
    return s;
  }
  /**
   * Parse Inline Tokens
   */
  parseInline(t, n = this.renderer) {
    var r, i;
    let s = "";
    for (let o = 0; o < t.length; o++) {
      const a = t[o];
      if ((i = (r = this.options.extensions) == null ? void 0 : r.renderers) != null && i[a.type]) {
        const h = this.options.extensions.renderers[a.type].call({ parser: this }, a);
        if (h !== !1 || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(a.type)) {
          s += h || "";
          continue;
        }
      }
      const l = a;
      switch (l.type) {
        case "escape": {
          s += n.text(l);
          break;
        }
        case "html": {
          s += n.html(l);
          break;
        }
        case "link": {
          s += n.link(l);
          break;
        }
        case "image": {
          s += n.image(l);
          break;
        }
        case "strong": {
          s += n.strong(l);
          break;
        }
        case "em": {
          s += n.em(l);
          break;
        }
        case "codespan": {
          s += n.codespan(l);
          break;
        }
        case "br": {
          s += n.br(l);
          break;
        }
        case "del": {
          s += n.del(l);
          break;
        }
        case "text": {
          s += n.text(l);
          break;
        }
        default: {
          const h = 'Token with "' + l.type + '" type was not found.';
          if (this.options.silent)
            return console.error(h), "";
          throw new Error(h);
        }
      }
    }
    return s;
  }
}, jo, ki = (jo = class {
  constructor(e) {
    Je(this, "options");
    Je(this, "block");
    this.options = e || Ls;
  }
  /**
   * Process markdown before marked
   */
  preprocess(e) {
    return e;
  }
  /**
   * Process HTML after marked is finished
   */
  postprocess(e) {
    return e;
  }
  /**
   * Process all tokens before walk tokens
   */
  processAllTokens(e) {
    return e;
  }
  /**
   * Provide function to tokenize markdown
   */
  provideLexer() {
    return this.block ? Un.lex : Un.lexInline;
  }
  /**
   * Provide function to parse tokens
   */
  provideParser() {
    return this.block ? zn.parse : zn.parseInline;
  }
}, Je(jo, "passThroughHooks", /* @__PURE__ */ new Set([
  "preprocess",
  "postprocess",
  "processAllTokens"
])), jo), Wp = class {
  constructor(...e) {
    Je(this, "defaults", Ia());
    Je(this, "options", this.setOptions);
    Je(this, "parse", this.parseMarkdown(!0));
    Je(this, "parseInline", this.parseMarkdown(!1));
    Je(this, "Parser", zn);
    Je(this, "Renderer", Ui);
    Je(this, "TextRenderer", $a);
    Je(this, "Lexer", Un);
    Je(this, "Tokenizer", Bi);
    Je(this, "Hooks", ki);
    this.use(...e);
  }
  /**
   * Run callback for every token
   */
  walkTokens(e, t) {
    var s, r;
    let n = [];
    for (const i of e)
      switch (n = n.concat(t.call(this, i)), i.type) {
        case "table": {
          const o = i;
          for (const a of o.header)
            n = n.concat(this.walkTokens(a.tokens, t));
          for (const a of o.rows)
            for (const l of a)
              n = n.concat(this.walkTokens(l.tokens, t));
          break;
        }
        case "list": {
          const o = i;
          n = n.concat(this.walkTokens(o.items, t));
          break;
        }
        default: {
          const o = i;
          (r = (s = this.defaults.extensions) == null ? void 0 : s.childTokens) != null && r[o.type] ? this.defaults.extensions.childTokens[o.type].forEach((a) => {
            const l = o[a].flat(1 / 0);
            n = n.concat(this.walkTokens(l, t));
          }) : o.tokens && (n = n.concat(this.walkTokens(o.tokens, t)));
        }
      }
    return n;
  }
  use(...e) {
    const t = this.defaults.extensions || { renderers: {}, childTokens: {} };
    return e.forEach((n) => {
      const s = { ...n };
      if (s.async = this.defaults.async || s.async || !1, n.extensions && (n.extensions.forEach((r) => {
        if (!r.name)
          throw new Error("extension name required");
        if ("renderer" in r) {
          const i = t.renderers[r.name];
          i ? t.renderers[r.name] = function(...o) {
            let a = r.renderer.apply(this, o);
            return a === !1 && (a = i.apply(this, o)), a;
          } : t.renderers[r.name] = r.renderer;
        }
        if ("tokenizer" in r) {
          if (!r.level || r.level !== "block" && r.level !== "inline")
            throw new Error("extension level must be 'block' or 'inline'");
          const i = t[r.level];
          i ? i.unshift(r.tokenizer) : t[r.level] = [r.tokenizer], r.start && (r.level === "block" ? t.startBlock ? t.startBlock.push(r.start) : t.startBlock = [r.start] : r.level === "inline" && (t.startInline ? t.startInline.push(r.start) : t.startInline = [r.start]));
        }
        "childTokens" in r && r.childTokens && (t.childTokens[r.name] = r.childTokens);
      }), s.extensions = t), n.renderer) {
        const r = this.defaults.renderer || new Ui(this.defaults);
        for (const i in n.renderer) {
          if (!(i in r))
            throw new Error(`renderer '${i}' does not exist`);
          if (["options", "parser"].includes(i))
            continue;
          const o = i, a = n.renderer[o], l = r[o];
          r[o] = (...h) => {
            let u = a.apply(r, h);
            return u === !1 && (u = l.apply(r, h)), u || "";
          };
        }
        s.renderer = r;
      }
      if (n.tokenizer) {
        const r = this.defaults.tokenizer || new Bi(this.defaults);
        for (const i in n.tokenizer) {
          if (!(i in r))
            throw new Error(`tokenizer '${i}' does not exist`);
          if (["options", "rules", "lexer"].includes(i))
            continue;
          const o = i, a = n.tokenizer[o], l = r[o];
          r[o] = (...h) => {
            let u = a.apply(r, h);
            return u === !1 && (u = l.apply(r, h)), u;
          };
        }
        s.tokenizer = r;
      }
      if (n.hooks) {
        const r = this.defaults.hooks || new ki();
        for (const i in n.hooks) {
          if (!(i in r))
            throw new Error(`hook '${i}' does not exist`);
          if (["options", "block"].includes(i))
            continue;
          const o = i, a = n.hooks[o], l = r[o];
          ki.passThroughHooks.has(i) ? r[o] = (h) => {
            if (this.defaults.async)
              return Promise.resolve(a.call(r, h)).then((k) => l.call(r, k));
            const u = a.call(r, h);
            return l.call(r, u);
          } : r[o] = (...h) => {
            let u = a.apply(r, h);
            return u === !1 && (u = l.apply(r, h)), u;
          };
        }
        s.hooks = r;
      }
      if (n.walkTokens) {
        const r = this.defaults.walkTokens, i = n.walkTokens;
        s.walkTokens = function(o) {
          let a = [];
          return a.push(i.call(this, o)), r && (a = a.concat(r.call(this, o))), a;
        };
      }
      this.defaults = { ...this.defaults, ...s };
    }), this;
  }
  setOptions(e) {
    return this.defaults = { ...this.defaults, ...e }, this;
  }
  lexer(e, t) {
    return Un.lex(e, t ?? this.defaults);
  }
  parser(e, t) {
    return zn.parse(e, t ?? this.defaults);
  }
  parseMarkdown(e) {
    return (n, s) => {
      const r = { ...s }, i = { ...this.defaults, ...r }, o = this.onError(!!i.silent, !!i.async);
      if (this.defaults.async === !0 && r.async === !1)
        return o(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
      if (typeof n > "u" || n === null)
        return o(new Error("marked(): input parameter is undefined or null"));
      if (typeof n != "string")
        return o(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(n) + ", string expected"));
      i.hooks && (i.hooks.options = i, i.hooks.block = e);
      const a = i.hooks ? i.hooks.provideLexer() : e ? Un.lex : Un.lexInline, l = i.hooks ? i.hooks.provideParser() : e ? zn.parse : zn.parseInline;
      if (i.async)
        return Promise.resolve(i.hooks ? i.hooks.preprocess(n) : n).then((h) => a(h, i)).then((h) => i.hooks ? i.hooks.processAllTokens(h) : h).then((h) => i.walkTokens ? Promise.all(this.walkTokens(h, i.walkTokens)).then(() => h) : h).then((h) => l(h, i)).then((h) => i.hooks ? i.hooks.postprocess(h) : h).catch(o);
      try {
        i.hooks && (n = i.hooks.preprocess(n));
        let h = a(n, i);
        i.hooks && (h = i.hooks.processAllTokens(h)), i.walkTokens && this.walkTokens(h, i.walkTokens);
        let u = l(h, i);
        return i.hooks && (u = i.hooks.postprocess(u)), u;
      } catch (h) {
        return o(h);
      }
    };
  }
  onError(e, t) {
    return (n) => {
      if (n.message += `
Please report this to https://github.com/markedjs/marked.`, e) {
        const s = "<p>An error occurred:</p><pre>" + kn(n.message + "", !0) + "</pre>";
        return t ? Promise.resolve(s) : s;
      }
      if (t)
        return Promise.reject(n);
      throw n;
    };
  }
}, Is = new Wp();
function Be(e, t) {
  return Is.parse(e, t);
}
Be.options = Be.setOptions = function(e) {
  return Is.setOptions(e), Be.defaults = Is.defaults, Nu(Be.defaults), Be;
};
Be.getDefaults = Ia;
Be.defaults = Ls;
Be.use = function(...e) {
  return Is.use(...e), Be.defaults = Is.defaults, Nu(Be.defaults), Be;
};
Be.walkTokens = function(e, t) {
  return Is.walkTokens(e, t);
};
Be.parseInline = Is.parseInline;
Be.Parser = zn;
Be.parser = zn.parse;
Be.Renderer = Ui;
Be.TextRenderer = $a;
Be.Lexer = Un;
Be.lexer = Un.lex;
Be.Tokenizer = Bi;
Be.Hooks = ki;
Be.parse = Be;
Be.options;
Be.setOptions;
Be.use;
Be.walkTokens;
Be.parseInline;
zn.parse;
Un.lex;
/*! @license DOMPurify 3.4.15 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.15/LICENSE */
function Yl(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function jp(e) {
  if (Array.isArray(e)) return e;
}
function qp(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var s, r, i, o, a = [], l = !0, h = !1;
    try {
      if (i = (n = n.call(e)).next, t !== 0) for (; !(l = (s = i.call(n)).done) && (a.push(s.value), a.length !== t); l = !0) ;
    } catch (u) {
      h = !0, r = u;
    } finally {
      try {
        if (!l && n.return != null && (o = n.return(), Object(o) !== o)) return;
      } finally {
        if (h) throw r;
      }
    }
    return a;
  }
}
function Vp() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Kp(e, t) {
  return jp(e) || qp(e, t) || Gp(e, t) || Vp();
}
function Gp(e, t) {
  if (e) {
    if (typeof e == "string") return Yl(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Yl(e, t) : void 0;
  }
}
const ju = Object.entries, Xl = Object.setPrototypeOf, Yp = Object.isFrozen, Xp = Object.getPrototypeOf, Zp = Object.getOwnPropertyDescriptor;
let vt = Object.freeze, wt = Object.seal, Zs = Object.create, qu = typeof Reflect < "u" && Reflect, aa = qu.apply, la = qu.construct;
vt || (vt = function(t) {
  return t;
});
wt || (wt = function(t) {
  return t;
});
aa || (aa = function(t, n) {
  for (var s = arguments.length, r = new Array(s > 2 ? s - 2 : 0), i = 2; i < s; i++)
    r[i - 2] = arguments[i];
  return t.apply(n, r);
});
la || (la = function(t) {
  for (var n = arguments.length, s = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
    s[r - 1] = arguments[r];
  return new t(...s);
});
const xs = mt(Array.prototype.forEach), Jp = mt(Array.prototype.lastIndexOf), Zl = mt(Array.prototype.pop), Ar = mt(Array.prototype.push), Qp = mt(Array.prototype.splice), rr = Array.isArray, Rr = mt(String.prototype.toLowerCase), Oo = mt(String.prototype.toString), Jl = mt(String.prototype.match), Sr = mt(String.prototype.replace), Ql = mt(String.prototype.indexOf), em = mt(String.prototype.trim), tm = mt(Number.prototype.toString), nm = mt(Boolean.prototype.toString), ec = typeof BigInt > "u" ? null : mt(BigInt.prototype.toString), tc = typeof Symbol > "u" ? null : mt(Symbol.prototype.toString), qt = mt(Object.prototype.hasOwnProperty), xr = mt(Object.prototype.toString), It = mt(RegExp.prototype.test), Ts = sm(TypeError);
function mt(e) {
  return function(t) {
    t instanceof RegExp && (t.lastIndex = 0);
    for (var n = arguments.length, s = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
      s[r - 1] = arguments[r];
    return aa(e, t, s);
  };
}
function sm(e) {
  return function() {
    for (var t = arguments.length, n = new Array(t), s = 0; s < t; s++)
      n[s] = arguments[s];
    return la(e, n);
  };
}
function De(e, t) {
  let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : Rr;
  if (Xl && Xl(e, null), !rr(t))
    return e;
  let s = t.length;
  for (; s--; ) {
    let r = t[s];
    if (typeof r == "string") {
      const i = n(r);
      i !== r && (Yp(t) || (t[s] = i), r = i);
    }
    e[r] = !0;
  }
  return e;
}
function rm(e) {
  for (let t = 0; t < e.length; t++)
    qt(e, t) || (e[t] = null);
  return e;
}
function Zt(e) {
  const t = Zs(null);
  for (const s of ju(e)) {
    var n = Kp(s, 2);
    const r = n[0], i = n[1];
    qt(e, r) && (rr(i) ? t[r] = rm(i) : i && typeof i == "object" && i.constructor === Object ? t[r] = Zt(i) : t[r] = i);
  }
  return t;
}
function im(e) {
  switch (typeof e) {
    case "string":
      return e;
    case "number":
      return tm(e);
    case "boolean":
      return nm(e);
    case "bigint":
      return ec ? ec(e) : "0";
    case "symbol":
      return tc ? tc(e) : "Symbol()";
    case "undefined":
      return xr(e);
    case "function":
    case "object": {
      if (e === null)
        return xr(e);
      const t = e, n = nn(t, "toString");
      if (typeof n == "function") {
        const s = n(t);
        return typeof s == "string" ? s : xr(s);
      }
      return xr(e);
    }
    default:
      return xr(e);
  }
}
function nn(e, t) {
  for (; e !== null; ) {
    const s = Zp(e, t);
    if (s) {
      if (s.get)
        return mt(s.get);
      if (typeof s.value == "function")
        return mt(s.value);
    }
    e = Xp(e);
  }
  function n() {
    return null;
  }
  return n;
}
function om(e) {
  try {
    return It(e, ""), !0;
  } catch {
    return !1;
  }
}
const nc = vt(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]), Lo = vt(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "enterkeyhint", "exportparts", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "inputmode", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "part", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]), No = vt(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]), am = vt(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]), Po = vt(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]), lm = vt(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]), sc = vt(["#text"]), rc = vt(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "command", "commandfor", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "exportparts", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inert", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "part", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "slot", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns"]), Mo = vt(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dominant-baseline", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "mask-type", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "pointer-events", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-orientation", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "vector-effect", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]), ic = vt(["accent", "accentunder", "align", "bevelled", "close", "columnalign", "columnlines", "columnspacing", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lquote", "lspace", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]), di = vt(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]), cm = wt(/{{[\w\W]*|^[\w\W]*}}/g), um = wt(/<%[\w\W]*|^[\w\W]*%>/g), fm = wt(/\${[\w\W]*/g), hm = wt(/^data-[\-\w.\u00B7-\uFFFF]+$/), dm = wt(/^aria-[\-\w]+$/), oc = wt(
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  // eslint-disable-line no-useless-escape
), pm = wt(/^(?:\w+script|data):/i), mm = wt(
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g
  // eslint-disable-line no-control-regex
), gm = wt(/^html$/i), _m = wt(/^[a-z][.\w]*(-[.\w]+)+$/i), ac = wt(/<[/\w!]/g), lc = wt(/<[/\w]/g), ym = wt(/<\/no(script|embed|frames)/i), bm = wt(/\/>/i), Yt = {
  element: 1,
  attribute: 2,
  text: 3,
  cdataSection: 4,
  entityReference: 5,
  // Deprecated
  entityNode: 6,
  // Deprecated
  processingInstruction: 7,
  comment: 8,
  document: 9,
  documentType: 10,
  documentFragment: 11,
  notation: 12
  // Deprecated
}, Vu = ["style", "script", "xmp", "iframe", "noembed", "noframes", "plaintext", "noscript"], vm = vt(De({}, Vu)), wm = function() {
  const e = {};
  return xs(Vu, (t) => {
    e[t] = wt(new RegExp("</" + t + "(?=[\\t\\n\\f\\r />])", "i"));
  }), vt(e);
}(), km = function() {
  return typeof window > "u" ? null : window;
}, Tm = function(t, n) {
  if (typeof t != "object" || typeof t.createPolicy != "function")
    return null;
  let s = null;
  const r = "data-tt-policy-suffix";
  n && n.hasAttribute(r) && (s = n.getAttribute(r));
  const i = "dompurify" + (s ? "#" + s : "");
  try {
    return t.createPolicy(i, {
      createHTML(o) {
        return o;
      },
      createScriptURL(o) {
        return o;
      }
    });
  } catch {
    return console.warn("TrustedTypes policy " + i + " could not be created."), null;
  }
}, cc = function() {
  return {
    afterSanitizeAttributes: [],
    afterSanitizeElements: [],
    afterSanitizeShadowDOM: [],
    beforeSanitizeAttributes: [],
    beforeSanitizeElements: [],
    beforeSanitizeShadowDOM: [],
    uponSanitizeAttribute: [],
    uponSanitizeElement: [],
    uponSanitizeShadowNode: []
  };
}, ts = function(t, n, s, r) {
  return qt(t, n) && rr(t[n]) ? De(r.base ? Zt(r.base) : {}, t[n], r.transform) : s;
}, Do = function(t, n, s) {
  const r = qt(t, n) ? t[n] : void 0;
  return r && typeof r == "object" ? Zt(r) : s();
};
function Ku() {
  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : km();
  const t = (G) => Ku(G);
  if (t.version = "3.4.15", t.removed = [], !e || !e.document || e.document.nodeType !== Yt.document || !e.Element)
    return t.isSupported = !1, t;
  let n = e.document;
  const s = n, r = s.currentScript;
  e.DocumentFragment;
  const i = e.HTMLTemplateElement, o = e.Node, a = e.Element, l = e.NodeFilter, h = e.NamedNodeMap;
  h === void 0 && (e.NamedNodeMap || e.MozNamedAttrMap), e.HTMLFormElement;
  const u = e.DOMParser, k = e.trustedTypes, b = a.prototype, I = nn(b, "cloneNode"), B = nn(b, "remove"), H = nn(b, "removeAttributeNode"), he = nn(b, "nextSibling"), R = nn(b, "childNodes"), le = nn(b, "parentNode"), de = nn(b, "shadowRoot"), C = nn(b, "attributes"), v = o && o.prototype ? nn(o.prototype, "nodeType") : null, q = o && o.prototype ? nn(o.prototype, "nodeName") : null, K = o && o.prototype ? nn(o.prototype, "ownerDocument") : null, ae = function(p) {
    return v ? v(p) : p.nodeType;
  }, Oe = function(p) {
    return q ? q(p) : p.nodeName;
  };
  if (typeof i == "function") {
    const G = n.createElement("template");
    G.content && G.content.ownerDocument && (n = G.content.ownerDocument);
  }
  let _e, Le = "", ve, Ve = !1, Fe = 0;
  const et = function() {
    if (Fe > 0)
      throw Ts('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.');
  }, ce = function(p) {
    et(), Fe++;
    try {
      return _e.createHTML(p);
    } finally {
      Fe--;
    }
  }, ye = function(p) {
    et(), Fe++;
    try {
      return _e.createScriptURL(p);
    } finally {
      Fe--;
    }
  }, pe = function() {
    return Ve || (ve = Tm(k, r), Ve = !0), ve;
  }, Ye = n, Xe = Ye.implementation, st = Ye.createNodeIterator, Ke = Ye.createDocumentFragment, gt = Ye.getElementsByTagName, hn = s.importNode;
  let Pe = cc();
  t.isSupported = typeof ju == "function" && typeof le == "function" && Xe && Xe.createHTMLDocument !== void 0;
  const Vt = cm, ct = um, Kt = fm, Gt = hm, Mt = dm, dn = pm, g = mm, w = _m;
  let L = oc, P = null;
  const D = De({}, [...nc, ...Lo, ...No, ...Po, ...sc]);
  let O = null;
  const X = De({}, [...rc, ...Mo, ...ic, ...di]);
  let $ = Object.seal(Zs(null, {
    tagNameCheck: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: null
    },
    attributeNameCheck: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: null
    },
    allowCustomizedBuiltInElements: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: !1
    }
  })), V = null, W = null;
  const ee = Object.seal(Zs(null, {
    tagCheck: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: null
    },
    attributeCheck: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: null
    }
  }));
  let Y = !0, se = !0, ue = !1, we = !0, Te = !1, Ae = !0, Ge = !1, F = !1, U = null, c = null, _ = !1, N = !1, E = !1, j = !1, Z = !0, ie = !1;
  const Re = "user-content-";
  let Ee = !0, Ue = !1, ke = {}, Me = null;
  const kt = De({}, [
    "annotation-xml",
    "audio",
    "colgroup",
    "desc",
    "foreignobject",
    "head",
    "iframe",
    "math",
    "mi",
    "mn",
    "mo",
    "ms",
    "mtext",
    "noembed",
    "noframes",
    "noscript",
    "plaintext",
    "script",
    // <selectedcontent> mirrors the selected <option>'s subtree, cloned by
    // the UA (customizable <select>) — including any on* handlers — and the
    // engine re-mirrors synchronously whenever a removal changes which
    // option/selectedcontent is current, even inside DOMPurify's inert
    // DOMParser document. Hoisting its children on removal re-inserts a fresh
    // mirror target ahead of the walk, which the engine refills, looping
    // forever (DoS) and amplifying output. Dropping its content on removal
    // (rather than hoisting) breaks that cascade; the content is a duplicate
    // of the option, which is sanitized on its own. See campaign-3 F1/F6.
    "selectedcontent",
    "style",
    "svg",
    "template",
    "thead",
    "title",
    "video",
    "xmp"
  ]);
  let ft = null;
  const In = De({}, ["audio", "video", "img", "source", "image", "track"]);
  let ds = null;
  const qn = De({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), Ns = "http://www.w3.org/1998/Math/MathML", On = "http://www.w3.org/2000/svg", _t = "http://www.w3.org/1999/xhtml";
  let Et = _t, Ps = !1, Tt = null;
  const uo = De({}, [Ns, On, _t], Oo), lr = vt(["mi", "mo", "mn", "ms", "mtext"]);
  let zt = De({}, lr);
  const Zr = vt(["annotation-xml"]);
  let Ln = De({}, Zr);
  const cr = De({}, ["title", "style", "font", "a", "script"]);
  let ps = null;
  const Ms = ["application/xhtml+xml", "text/html"], Jr = "text/html";
  let rt = null, Nn = null;
  const Qr = n.createElement("form"), ur = function(p) {
    return p instanceof RegExp || p instanceof Function;
  }, Ds = function() {
    let p = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (Nn && Nn === p)
      return;
    (!p || typeof p != "object") && (p = {}), p = Zt(p), ps = // eslint-disable-next-line unicorn/prefer-includes
    Ms.indexOf(p.PARSER_MEDIA_TYPE) === -1 ? Jr : p.PARSER_MEDIA_TYPE, rt = ps === "application/xhtml+xml" ? Oo : Rr, P = ts(p, "ALLOWED_TAGS", D, {
      transform: rt
    }), O = ts(p, "ALLOWED_ATTR", X, {
      transform: rt
    }), Tt = ts(p, "ALLOWED_NAMESPACES", uo, {
      transform: Oo
    }), ds = ts(p, "ADD_URI_SAFE_ATTR", qn, {
      transform: rt,
      base: qn
    }), ft = ts(p, "ADD_DATA_URI_TAGS", In, {
      transform: rt,
      base: In
    }), Me = ts(p, "FORBID_CONTENTS", kt, {
      transform: rt
    }), V = ts(p, "FORBID_TAGS", Zt({}), {
      transform: rt
    }), W = ts(p, "FORBID_ATTR", Zt({}), {
      transform: rt
    }), ke = qt(p, "USE_PROFILES") ? p.USE_PROFILES && typeof p.USE_PROFILES == "object" ? Zt(p.USE_PROFILES) : p.USE_PROFILES : !1, Y = p.ALLOW_ARIA_ATTR !== !1, se = p.ALLOW_DATA_ATTR !== !1, ue = p.ALLOW_UNKNOWN_PROTOCOLS || !1, we = p.ALLOW_SELF_CLOSE_IN_ATTR !== !1, Te = p.SAFE_FOR_TEMPLATES || !1, Ae = p.SAFE_FOR_XML !== !1, Ge = p.WHOLE_DOCUMENT || !1, N = p.RETURN_DOM || !1, E = p.RETURN_DOM_FRAGMENT || !1, j = p.RETURN_TRUSTED_TYPE || !1, _ = p.FORCE_BODY || !1, Z = p.SANITIZE_DOM !== !1, ie = p.SANITIZE_NAMED_PROPS || !1, Ee = p.KEEP_CONTENT !== !1, Ue = p.IN_PLACE || !1, L = om(p.ALLOWED_URI_REGEXP) ? p.ALLOWED_URI_REGEXP : oc, Et = typeof p.NAMESPACE == "string" ? p.NAMESPACE : _t, zt = Do(
      p,
      "MATHML_TEXT_INTEGRATION_POINTS",
      () => De({}, lr)
      // Default built-in map
    ), Ln = Do(
      p,
      "HTML_INTEGRATION_POINTS",
      () => De({}, Zr)
      // Default built-in map
    );
    const T = Do(p, "CUSTOM_ELEMENT_HANDLING", () => Zs(null));
    if ($ = Zs(null), qt(T, "tagNameCheck") && ur(T.tagNameCheck) && ($.tagNameCheck = T.tagNameCheck), qt(T, "attributeNameCheck") && ur(T.attributeNameCheck) && ($.attributeNameCheck = T.attributeNameCheck), qt(T, "allowCustomizedBuiltInElements") && typeof T.allowCustomizedBuiltInElements == "boolean" && ($.allowCustomizedBuiltInElements = T.allowCustomizedBuiltInElements), wt($), Te && (se = !1), E && (N = !0), ke && (P = De({}, sc), O = Zs(null), ke.html === !0 && (De(P, nc), De(O, rc)), ke.svg === !0 && (De(P, Lo), De(O, Mo), De(O, di)), ke.svgFilters === !0 && (De(P, No), De(O, Mo), De(O, di)), ke.mathMl === !0 && (De(P, Po), De(O, ic), De(O, di))), ee.tagCheck = null, ee.attributeCheck = null, qt(p, "ADD_TAGS") && (typeof p.ADD_TAGS == "function" ? ee.tagCheck = p.ADD_TAGS : rr(p.ADD_TAGS) && (P === D && (P = Zt(P)), De(P, p.ADD_TAGS, rt))), qt(p, "ADD_ATTR") && (typeof p.ADD_ATTR == "function" ? ee.attributeCheck = p.ADD_ATTR : rr(p.ADD_ATTR) && (O === X && (O = Zt(O)), De(O, p.ADD_ATTR, rt))), qt(p, "ADD_FORBID_CONTENTS") && rr(p.ADD_FORBID_CONTENTS) && (Me === kt && (Me = Zt(Me)), De(Me, p.ADD_FORBID_CONTENTS, rt)), Ee && (P["#text"] = !0), Ge && De(P, ["html", "head", "body"]), P.table && (De(P, ["tbody"]), delete V.tbody), p.TRUSTED_TYPES_POLICY) {
      if (typeof p.TRUSTED_TYPES_POLICY.createHTML != "function")
        throw Ts('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
      if (typeof p.TRUSTED_TYPES_POLICY.createScriptURL != "function")
        throw Ts('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
      const z = _e;
      _e = p.TRUSTED_TYPES_POLICY;
      try {
        Le = ce("");
      } catch (te) {
        throw _e = z, te;
      }
    } else p.TRUSTED_TYPES_POLICY === null ? (_e = void 0, Le = "") : (_e === void 0 && (_e = pe()), _e && typeof Le == "string" && (Le = ce("")));
    vt && vt(p), Nn = p;
  }, ei = De({}, [...Lo, ...No, ...am]), Fs = De({}, [...Po, ...lm]), $s = function(p, T, z) {
    return T.namespaceURI === _t ? p === "svg" : T.namespaceURI === Ns ? p === "svg" && (z === "annotation-xml" || zt[z]) : !!ei[p];
  }, ti = function(p, T, z) {
    return T.namespaceURI === _t ? p === "math" : T.namespaceURI === On ? p === "math" && Ln[z] : !!Fs[p];
  }, ni = function(p, T, z) {
    return T.namespaceURI === On && !Ln[z] || T.namespaceURI === Ns && !zt[z] ? !1 : !Fs[p] && (cr[p] || !ei[p]);
  }, Pn = function(p) {
    let T = le(p);
    (!T || !T.tagName) && (T = {
      namespaceURI: Et,
      tagName: "template"
    });
    const z = Rr(p.tagName), te = Rr(T.tagName);
    return Tt[p.namespaceURI] ? p.namespaceURI === On ? $s(z, T, te) : p.namespaceURI === Ns ? ti(z, T, te) : p.namespaceURI === _t ? ni(z, T, te) : !!(ps === "application/xhtml+xml" && Tt[p.namespaceURI]) : !1;
  }, Ht = function(p) {
    Ar(t.removed, {
      element: p
    });
    try {
      le(p).removeChild(p);
    } catch {
      if (B(p), !le(p))
        throw Ts("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place");
    }
  }, Bs = function(p, T, z) {
    try {
      H(p, T);
    } catch {
      try {
        p.removeAttribute(z);
      } catch {
      }
    }
  }, Vn = function(p) {
    Kn(p);
    const T = R(p);
    if (T) {
      const te = [];
      xs(T, (ne) => {
        Ar(te, ne);
      }), xs(te, (ne) => {
        try {
          B(ne);
        } catch {
        }
      });
    }
    const z = C(p);
    if (z)
      for (let te = z.length - 1; te >= 0; --te) {
        const ne = z[te], me = ne && ne.name;
        typeof me == "string" && Bs(p, ne, me);
      }
  }, Qt = function(p, T, z) {
    if (!z)
      try {
        z = T.getAttributeNode(p);
      } catch {
        z = null;
      }
    Ar(t.removed, {
      attribute: z || null,
      from: T
    });
    try {
      z ? H(T, z) : T.removeAttribute(p);
    } catch {
      try {
        T.removeAttribute(p);
      } catch {
      }
    }
    if (p === "is")
      if (N || E)
        try {
          Ht(T);
        } catch {
        }
      else
        try {
          T.setAttribute(p, "");
        } catch {
        }
  }, pn = function(p) {
    const T = C(p);
    if (T)
      for (let z = T.length - 1; z >= 0; --z) {
        const te = T[z], ne = te && te.name;
        typeof ne != "string" || O[rt(ne)] || Bs(p, te, ne);
      }
  }, Kn = function(p) {
    const T = [p];
    for (; T.length > 0; ) {
      const z = T.pop();
      ae(z) === Yt.element && pn(z);
      const ne = R(z);
      if (ne)
        for (let me = ne.length - 1; me >= 0; --me)
          T.push(ne[me]);
    }
  }, ms = function(p, T) {
    return Ae ? p === "patchsrc" ? !0 : p === "for" && T !== "label" && T !== "output" : !1;
  }, si = function(p) {
    if (!Ae)
      return;
    const T = [p];
    for (; T.length > 0; ) {
      const z = T.pop(), te = ae(z);
      if (te === Yt.processingInstruction || te === Yt.comment && It(lc, z.data)) {
        try {
          B(z);
        } catch {
        }
        continue;
      }
      if (te === Yt.element) {
        const me = z, ze = rt(Oe(z));
        try {
          me.hasAttribute && me.hasAttribute("patchsrc") && me.removeAttribute("patchsrc"), me.hasAttribute && me.hasAttribute("for") && ms("for", ze) && me.removeAttribute("for");
        } catch {
        }
      }
      const ne = R(z);
      if (ne)
        for (let me = ne.length - 1; me >= 0; --me)
          T.push(ne[me]);
    }
  }, mn = function(p) {
    let T = null, z = null;
    if (_)
      p = "<remove></remove>" + p;
    else {
      const me = Jl(p, /^[\r\n\t ]+/);
      z = me && me[0];
    }
    ps === "application/xhtml+xml" && Et === _t && (p = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + p + "</body></html>");
    const te = _e ? ce(p) : p;
    if (Et === _t)
      try {
        T = new u().parseFromString(te, ps);
      } catch {
      }
    if (!T || !T.documentElement) {
      T = Xe.createDocument(Et, "template", null);
      try {
        T.documentElement.innerHTML = Ps ? Le : te;
      } catch {
      }
    }
    const ne = T.body || T.documentElement;
    return p && z && ne.insertBefore(n.createTextNode(z), ne.childNodes[0] || null), Et === _t ? gt.call(T, Ge ? "html" : "body")[0] : Ge ? T.documentElement : ne;
  }, ri = function(p) {
    const T = K ? K(p) : p.ownerDocument;
    return st.call(
      T || p,
      p,
      // eslint-disable-next-line no-bitwise
      l.SHOW_ELEMENT | l.SHOW_COMMENT | l.SHOW_TEXT | l.SHOW_PROCESSING_INSTRUCTION | l.SHOW_CDATA_SECTION,
      null
    );
  }, gn = function(p) {
    return p = Sr(p, Vt, " "), p = Sr(p, ct, " "), p = Sr(p, Kt, " "), p;
  }, Us = function(p) {
    var T;
    p.normalize();
    const z = K ? K(p) : p.ownerDocument, te = st.call(
      z || p,
      p,
      // eslint-disable-next-line no-bitwise
      l.SHOW_TEXT | l.SHOW_COMMENT | l.SHOW_CDATA_SECTION | l.SHOW_PROCESSING_INSTRUCTION,
      null
    );
    let ne = te.nextNode();
    for (; ne; )
      ne.data = gn(ne.data), ne = te.nextNode();
    const me = (T = p.querySelectorAll) === null || T === void 0 ? void 0 : T.call(p, "template");
    me && xs(me, (ze) => {
      Mn(ze.content) && Us(ze.content);
    });
  }, zs = function(p) {
    const T = q ? q(p) : null;
    return typeof T != "string" || rt(T) !== "form" ? !1 : typeof p.nodeName != "string" || typeof p.textContent != "string" || typeof p.removeChild != "function" || // Realm-safe NamedNodeMap detection: equality against the cached
    // prototype getter. Clobbered .attributes (e.g. <input name="attributes">)
    // makes the direct read diverge from the cached read; a clean form
    // (same-realm OR foreign-realm) has both reads pointing at the same
    // canonical NamedNodeMap.
    p.attributes !== C(p) || typeof p.removeAttribute != "function" || // A form descendant named "removeAttributeNode" or "getAttributeNode"
    // shadows these Attr-node methods via [LegacyOverrideBuiltIns].
    // _removeAttribute() / _stripAttributeNode() reach for
    // element.removeAttributeNode(attr) first; when it is shadowed the call
    // throws and the name-based fallback element.removeAttribute(name)
    // ASCII-lowercases its lookup key in an HTML document, silently missing
    // a case-preserved event-handler attribute (e.g. an ONANIMATIONSTART
    // that reached the sanitizer through an XML/XHTML parse). Flag the form
    // so it is removed wholesale, exactly as for the other shadowed methods.
    typeof p.removeAttributeNode != "function" || typeof p.getAttributeNode != "function" || typeof p.setAttribute != "function" || typeof p.namespaceURI != "string" || typeof p.insertBefore != "function" || typeof p.hasChildNodes != "function" || // NodeType clobbering probe. Cached Node.prototype.nodeType getter
    // returns the integer 1 for any Element regardless of realm; direct
    // read on a clobbered form (e.g. <input name="nodeType">) returns
    // the named child element. Cheap addition — nodeType is read from
    // an internal slot, no serialization cost — and removes a residual
    // clobbering surface used by several mXSS / PI / comment branches
    // in _sanitizeElements that compare currentNode.nodeType directly.
    p.nodeType !== v(p) || // HTMLFormElement has [LegacyOverrideBuiltIns]: a descendant named
    // "childNodes" shadows the prototype getter. Direct reads of
    // form.childNodes from a clobbered form return the named child
    // instead of the real NodeList, so any walk that reads it directly
    // skips the form's real children. Compare the direct read to the
    // cached Node.prototype getter — when the form's named-property
    // getter intercepts the read, the two values differ and we flag
    // the form. This catches every clobbering child type (input,
    // select, etc.) regardless of whether the named child happens to
    // carry a numeric .length, which a typeof-based probe would miss
    // (e.g. HTMLSelectElement.length is a defined unsigned-long).
    p.childNodes !== R(p);
  }, Mn = function(p) {
    if (!v || typeof p != "object" || p === null)
      return !1;
    try {
      return v(p) === Yt.documentFragment;
    } catch {
      return !1;
    }
  }, _n = function(p) {
    if (!v || typeof p != "object" || p === null)
      return !1;
    try {
      return typeof v(p) == "number";
    } catch {
      return !1;
    }
  };
  function Wt(G, p, T) {
    G.length !== 0 && xs(G, (z) => {
      z.call(t, p, T, Nn);
    });
  }
  const en = function(p, T) {
    return !!(Ae && p.hasChildNodes() && !_n(p.firstElementChild) && It(ac, p.textContent) && It(ac, p.innerHTML) || Ae && p.namespaceURI === _t && vm[T] && (_n(p.firstElementChild) || typeof p.textContent == "string" && It(wm[T], p.textContent)) || p.nodeType === Yt.processingInstruction || Ae && p.nodeType === Yt.comment && It(lc, p.data));
  }, Dt = function(p, T) {
    if (p instanceof RegExp)
      return It(p, T);
    if (p instanceof Function) {
      for (var z = arguments.length, te = new Array(z > 2 ? z - 2 : 0), ne = 2; ne < z; ne++)
        te[ne - 2] = arguments[ne];
      return !!p(T, ...te);
    }
    return !1;
  }, ut = function(p, T, z) {
    if (!V[T] && bn(T) && Dt($.tagNameCheck, T))
      return !1;
    if (Ee && !Me[T]) {
      const te = le(p), ne = R(p);
      if (ne && te) {
        const me = ne.length;
        for (let ze = me - 1; ze >= 0; --ze) {
          const nt = p === z ? I(ne[ze], !0) : ne[ze];
          te.insertBefore(nt, he(p));
        }
      }
    }
    return Ht(p), !0;
  }, ht = function(p, T, z, te) {
    return p.length === 0 ? T : T === z || T === te ? Zt(T) : T;
  }, at = function(p, T) {
    return p === T || le(p) !== null ? !1 : (Ue && Kn(p), !0);
  }, yn = function(p, T) {
    if (Wt(Pe.beforeSanitizeElements, p, null), at(p, T))
      return !0;
    if (zs(p))
      return Ht(p), !0;
    const z = rt(Oe(p));
    if (P = ht(Pe.uponSanitizeElement, P, D, U), Wt(Pe.uponSanitizeElement, p, {
      tagName: z,
      allowedTags: P
    }), at(p, T))
      return !0;
    if (en(p, z))
      return Ht(p), !0;
    if (V[z] || !(ee.tagCheck instanceof Function && ee.tagCheck(z)) && !P[z]) {
      const ne = ut(p, z, T);
      return ne === !1 && Wt(Pe.afterSanitizeElements, p, null), ne;
    }
    if (ae(p) === Yt.element && !Pn(p) || (z === "noscript" || z === "noembed" || z === "noframes") && It(ym, p.innerHTML))
      return Ht(p), !0;
    if (Te && p.nodeType === Yt.text) {
      const ne = gn(p.textContent);
      p.textContent !== ne && (Ar(t.removed, {
        element: p.cloneNode()
      }), p.textContent = ne);
    }
    return Wt(Pe.afterSanitizeElements, p, null), !1;
  }, Gn = function(p, T, z) {
    if (W[T] || ms(T, p) || Z && (T === "id" || T === "name") && (z in n || z in Qr))
      return !1;
    const te = O[T] || ee.attributeCheck instanceof Function && ee.attributeCheck(T, p);
    return se && It(Gt, T) || Y && It(Mt, T) ? !0 : te ? ds[T] || It(L, Sr(z, g, "")) || (T === "src" || T === "xlink:href" || T === "href") && p !== "script" && Ql(z, "data:") === 0 && ft[p] || ue && !It(dn, Sr(z, g, "")) ? !0 : !z : (
      // Condition a) covers a basically valid custom element tag name whose
      // tag passes the configured tagNameCheck and whose attribute name
      // passes the configured attributeNameCheck ...
      bn(p) && Dt($.tagNameCheck, p) && Dt($.attributeNameCheck, T, p) || // Condition b) covers an `is` attribute whose value passes the
      // configured tagNameCheck while customized built-in elements are
      // allowed.
      T === "is" && $.allowCustomizedBuiltInElements && Dt($.tagNameCheck, z)
    );
  }, ii = De({}, ["annotation-xml", "color-profile", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "missing-glyph"]), bn = function(p) {
    return !ii[Rr(p)] && It(w, p);
  }, At = function(p, T, z, te) {
    if (_e && typeof k == "object" && typeof k.getAttributeType == "function" && !z)
      switch (k.getAttributeType(p, T)) {
        case "TrustedHTML":
          return ce(te);
        case "TrustedScriptURL":
          return ye(te);
      }
    return te;
  }, gs = function(p, T, z, te) {
    try {
      return z ? p.setAttributeNS(z, T, te) : p.setAttribute(T, te), zs(p) ? (Ht(p), !1) : !0;
    } catch {
      return Qt(T, p), !1;
    }
  }, vn = function(p) {
    Wt(Pe.beforeSanitizeAttributes, p, null);
    const T = p.attributes;
    if (!T || zs(p))
      return;
    O = ht(Pe.uponSanitizeAttribute, O, X, c);
    const z = {
      attrName: "",
      attrValue: "",
      keepAttr: !0,
      allowedAttributes: O,
      forceKeepAttr: void 0
    };
    let te = T.length;
    const ne = rt(p.nodeName);
    for (; te--; ) {
      const me = T[te], ze = me.name, nt = me.namespaceURI, Ct = me.value, Rt = rt(ze), Ws = Ct;
      let yt = ze === "value" ? Ws : em(Ws), hr = !1;
      if (z.attrName = Rt, z.attrValue = yt, z.keepAttr = !0, z.forceKeepAttr = void 0, Wt(Pe.uponSanitizeAttribute, p, z), yt = z.attrValue, ie && (Rt === "id" || Rt === "name") && Ql(yt, Re) !== 0 && (Qt(ze, p, me), yt = Re + yt, hr = !0), Ae && It(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, yt)) {
        Qt(ze, p, me);
        continue;
      }
      if (Rt === "attributename" && Jl(yt, "href")) {
        Qt(ze, p, me);
        continue;
      }
      if (!z.forceKeepAttr) {
        if (!z.keepAttr) {
          Qt(ze, p, me);
          continue;
        }
        if (!we && It(bm, yt)) {
          Qt(ze, p, me);
          continue;
        }
        if (Te && (yt = gn(yt)), !Gn(ne, Rt, yt)) {
          Qt(ze, p, me);
          continue;
        }
        yt = At(ne, Rt, nt, yt), yt !== Ws && gs(p, ze, nt, yt) && hr && Zl(t.removed);
      }
    }
    Wt(Pe.afterSanitizeAttributes, p, null);
  }, Hs = function(p) {
    let T = null;
    const z = ri(p);
    for (Wt(Pe.beforeSanitizeShadowDOM, p, null); T = z.nextNode(); )
      if (Wt(Pe.uponSanitizeShadowNode, T, null), yn(T, p), vn(T), Mn(T.content) && Hs(T.content), ae(T) === Yt.element) {
        const te = de(T);
        Mn(te) && (fr(te), Hs(te));
      }
    Wt(Pe.afterSanitizeShadowDOM, p, null);
  }, fr = function(p) {
    const T = [{
      node: p,
      shadow: null
    }];
    for (; T.length > 0; ) {
      const z = T.pop();
      if (z.shadow) {
        Hs(z.shadow);
        continue;
      }
      const te = z.node, me = ae(te) === Yt.element, ze = R(te);
      if (ze)
        for (let nt = ze.length - 1; nt >= 0; --nt)
          T.push({
            node: ze[nt],
            shadow: null
          });
      if (me) {
        const nt = q ? q(te) : null;
        if (typeof nt == "string" && rt(nt) === "template") {
          const Ct = te.content;
          Mn(Ct) && T.push({
            node: Ct,
            shadow: null
          });
        }
      }
      if (me) {
        const nt = de(te);
        Mn(nt) && T.push({
          node: null,
          shadow: nt
        }, {
          node: nt,
          shadow: null
        });
      }
    }
  };
  return t.sanitize = function(G) {
    let p = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, T = null, z = null, te = null, ne = null;
    if (Ps = !G, Ps && (G = "<!-->"), typeof G != "string" && !_n(G) && (G = im(G), typeof G != "string"))
      throw Ts("dirty is not a string, aborting");
    if (!t.isSupported)
      return G;
    F ? (P = U, O = c) : Ds(p), (Pe.uponSanitizeElement.length > 0 || Pe.uponSanitizeAttribute.length > 0) && (P = Zt(P)), Pe.uponSanitizeAttribute.length > 0 && (O = Zt(O)), t.removed = [];
    const me = Ue && typeof G != "string" && _n(G);
    if (me) {
      si(G);
      const Ct = Oe(G);
      if (typeof Ct == "string") {
        const Rt = rt(Ct);
        if (!P[Rt] || V[Rt])
          throw Vn(G), Ts("root node is forbidden and cannot be sanitized in-place");
      }
      if (zs(G))
        throw Vn(G), Ts("root node is clobbered and cannot be sanitized in-place");
      try {
        fr(G);
      } catch (Rt) {
        throw Vn(G), Rt;
      }
    } else if (_n(G))
      T = mn("<!---->"), z = T.ownerDocument.importNode(G, !0), z.nodeType === Yt.element && z.nodeName === "BODY" || z.nodeName === "HTML" ? T = z : T.appendChild(z), fr(T);
    else {
      if (!N && !Te && !Ge && // eslint-disable-next-line unicorn/prefer-includes
      G.indexOf("<") === -1)
        return _e && j ? ce(G) : G;
      if (T = mn(G), !T)
        return N ? null : j ? Le : "";
    }
    T && _ && Ht(T.firstChild);
    const ze = me ? G : T;
    try {
      const Ct = ri(ze);
      for (; te = Ct.nextNode(); )
        yn(te, ze), vn(te), Mn(te.content) && Hs(te.content);
    } catch (Ct) {
      throw me && (Vn(G), xs(t.removed, (Rt) => {
        Rt.element && Kn(Rt.element);
      })), Ct;
    }
    if (me)
      return xs(t.removed, (Ct) => {
        Ct.element && Kn(Ct.element);
      }), Te && Us(G), G;
    if (N) {
      if (Te && Us(T), E)
        for (ne = Ke.call(T.ownerDocument); T.firstChild; )
          ne.appendChild(T.firstChild);
      else
        ne = T;
      return (O.shadowroot || O.shadowrootmode) && (ne = hn.call(s, ne, !0)), ne;
    }
    let nt = Ge ? T.outerHTML : T.innerHTML;
    return Ge && P["!doctype"] && T.ownerDocument && T.ownerDocument.doctype && T.ownerDocument.doctype.name && It(gm, T.ownerDocument.doctype.name) && (nt = "<!DOCTYPE " + T.ownerDocument.doctype.name + `>
` + nt), Te && (nt = gn(nt)), _e && j ? ce(nt) : nt;
  }, t.setConfig = function() {
    let G = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    Ds(G), F = !0, U = P, c = O;
  }, t.clearConfig = function() {
    Nn = null, F = !1, U = null, c = null, _e = ve, Le = "";
  }, t.isValidAttribute = function(G, p, T) {
    Nn || Ds({});
    const z = rt(G), te = rt(p);
    return Gn(z, te, T);
  }, t.addHook = function(G, p) {
    typeof p == "function" && qt(Pe, G) && Ar(Pe[G], p);
  }, t.removeHook = function(G, p) {
    if (qt(Pe, G)) {
      if (p !== void 0) {
        const T = Jp(Pe[G], p);
        return T === -1 ? void 0 : Qp(Pe[G], T, 1)[0];
      }
      return Zl(Pe[G]);
    }
  }, t.removeHooks = function(G) {
    qt(Pe, G) && (Pe[G] = []);
  }, t.removeAllHooks = function() {
    Pe = cc();
  }, t;
}
var Ba = Ku();
Ba.addHook("uponSanitizeElement", (e, t) => {
  var r, i, o, a, l;
  if (t.tagName === "svg") {
    (r = e.parentNode) == null || r.removeChild(e);
    return;
  }
  if (t.tagName === "math") {
    (i = e.parentNode) == null || i.removeChild(e);
    return;
  }
  if (t.tagName === "foreignobject") {
    (o = e.parentNode) == null || o.removeChild(e);
    return;
  }
  const n = e, s = (a = t.tagName) == null ? void 0 : a.toUpperCase();
  (s === "IMG" || s === "AREA" || s === "MAP") && ((l = n.parentNode) == null || l.removeChild(n));
});
Ba.addHook("afterSanitizeAttributes", (e) => {
  if (e.hasAttribute("href")) {
    const t = e.getAttribute("href") || "";
    try {
      const n = decodeURIComponent(t.toLowerCase());
      (n.includes("javascript:") || n.includes("data:text/html") || n.includes("vbscript:") || n.includes("about:") || n.includes("file:")) && e.removeAttribute("href");
    } catch {
      (t.toLowerCase().includes("javascript:") || t.toLowerCase().includes("data:text/html") || t.toLowerCase().includes("vbscript:") || t.toLowerCase().includes("about:") || t.toLowerCase().includes("file:")) && e.removeAttribute("href");
    }
  }
  if (e.nodeName === "A") {
    const t = (e.getAttribute("href") || "").trim();
    /^(https?:|mailto:)/i.test(t) ? (e.setAttribute("target", "_blank"), e.setAttribute("rel", "noopener noreferrer nofollow")) : e.removeAttribute("href");
  }
  if (e.hasAttribute("src")) {
    const t = e.getAttribute("src") || "";
    try {
      const n = decodeURIComponent(t.toLowerCase());
      (n.includes("javascript:") || n.includes("data:text/html") || n.includes("vbscript:") || n.includes("about:") || n.includes("file:")) && e.removeAttribute("src");
    } catch {
      (t.toLowerCase().includes("javascript:") || t.toLowerCase().includes("data:text/html") || t.toLowerCase().includes("vbscript:") || t.toLowerCase().includes("about:") || t.toLowerCase().includes("file:")) && e.removeAttribute("src");
    }
  }
  if (e.hasAttribute("style")) {
    const t = e.getAttribute("style") || "";
    try {
      const n = decodeURIComponent(t.toLowerCase());
      (n.includes("expression(") || n.includes("behavior:") || n.includes("-moz-binding") || n.includes("import") || n.includes("javascript:") || n.includes("vbscript:")) && e.removeAttribute("style");
    } catch {
      (t.toLowerCase().includes("expression(") || t.toLowerCase().includes("behavior:") || t.toLowerCase().includes("-moz-binding") || t.toLowerCase().includes("import") || t.toLowerCase().includes("javascript:") || t.toLowerCase().includes("vbscript:")) && e.removeAttribute("style");
    }
  }
  Array.from(e.attributes).forEach((t) => {
    t.name.toLowerCase().startsWith("on") && e.removeAttribute(t.name);
  });
});
function Am(e) {
  const t = {
    // Block all dangerous tags including SVG, form elements and images.
    // NOTE: 'a' must NOT be in this list — FORBID_TAGS beats ALLOWED_TAGS, and
    // anchors are intentionally kept (markdown links) then hardened by the
    // afterSanitizeAttributes hook (http(s)/mailto only, forced target+rel).
    FORBID_TAGS: [
      "iframe",
      "frame",
      "frameset",
      "object",
      "embed",
      "applet",
      "script",
      "base",
      "link",
      "meta",
      "style",
      "svg",
      "math",
      "form",
      "input",
      "button",
      "textarea",
      "select",
      "option",
      "xml",
      "xss",
      "import",
      "video",
      "audio",
      "track",
      "source",
      "canvas",
      "details",
      "template",
      "slot",
      "noscript",
      "marquee",
      "bgsound",
      "keygen",
      "command",
      "img",
      "area",
      "map"
      // SECURITY: Remove image/map tags completely
    ],
    // Block dangerous attributes
    FORBID_ATTR: [
      // Event handlers
      "onerror",
      "onload",
      "onclick",
      "onmouseover",
      "onmouseout",
      "onmousemove",
      "onkeydown",
      "onkeyup",
      "onkeypress",
      "onfocus",
      "onblur",
      "onchange",
      "onsubmit",
      "ondblclick",
      "oncontextmenu",
      "oninput",
      "oninvalid",
      "onreset",
      "onsearch",
      "onselect",
      "onabort",
      "oncanplay",
      "oncanplaythrough",
      "oncuechange",
      "ondurationchange",
      "onemptied",
      "onended",
      "onloadeddata",
      "onloadedmetadata",
      "onloadstart",
      "onpause",
      "onplay",
      "onplaying",
      "onprogress",
      "onratechange",
      "onseeked",
      "onseeking",
      "onstalled",
      "onsuspend",
      "ontimeupdate",
      "onvolumechange",
      "onwaiting",
      "ontoggle",
      "onauxclick",
      "ongotpointercapture",
      "onlostpointercapture",
      "onpointercancel",
      "onpointerdown",
      "onpointerenter",
      "onpointerleave",
      "onpointermove",
      "onpointerout",
      "onpointerover",
      "onpointerup",
      "onwheel",
      "onanimationcancel",
      "onanimationend",
      "onanimationiteration",
      "onanimationstart",
      "ontransitioncancel",
      "ontransitionend",
      "ontransitionrun",
      "ontransitionstart",
      "ondrag",
      "ondragend",
      "ondragenter",
      "ondragleave",
      "ondragover",
      "ondragstart",
      "ondrop",
      "oncopy",
      "oncut",
      "onpaste",
      "onscroll",
      "onmessage",
      "onmouseenter",
      "onmouseleave",
      "onmousewheel",
      "onbeforeunload",
      "onerrorupdate",
      "onhelp",
      "onmove",
      "onreadystatechange",
      "onresize",
      "onstart",
      "onstop",
      "onunload",
      "onactivate",
      "onafterprint",
      "onafterupdate",
      "onbeforeactivate",
      "onbeforecopy",
      "onbeforecut",
      "onbeforedeactivate",
      "onbeforeeditfocus",
      "onbeforepaste",
      "onbeforeprint",
      "onbeforeupdate",
      "onbounce",
      "oncellchange",
      "oncontrolselect",
      "ondataavailable",
      "ondatasetchanged",
      "ondatasetcomplete",
      "ondeactivate",
      "onfilterchange",
      "onfinish",
      "onfocusin",
      "onfocusout",
      "onlayoutcomplete",
      "onlosecapture",
      "onmoveend",
      "onmovestart",
      "onpropertychange",
      "onresizeend",
      "onresizestart",
      "onrowenter",
      "onrowexit",
      "onrowsdelete",
      "onrowsinserted",
      "onselectionchange",
      "onselectstart",
      "onshow",
      "onsort",
      "onpointerrawupdate",
      // Dangerous attributes
      "formaction",
      "action",
      "form",
      "srcdoc",
      "srcset",
      "dynsrc",
      "lowsrc",
      "ping",
      "poster",
      "background",
      "code",
      "codebase",
      "archive",
      "profile",
      "xmlns",
      "xlink:href",
      "attributename",
      "from",
      "to",
      "values",
      "begin",
      "autofocus",
      "autoplay",
      "controls",
      "manifest",
      "sandbox",
      // SECURITY: block resource-loading attributes. 'href' is intentionally NOT
      // here (FORBID_ATTR beats ALLOWED_ATTR): markdown links need it, and the
      // afterSanitizeAttributes hook strips any href that isn't http(s)/mailto.
      "src",
      "data"
    ],
    // Only allow safe protocols
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    // SECURITY: Strip ALL HTML tags to prevent rendering exploits
    // Only allow basic text formatting for markdown (no links, images, or any potentially dangerous tags)
    ALLOWED_TAGS: [
      "a",
      "b",
      "i",
      "u",
      "strong",
      "em",
      "p",
      "br",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "code",
      "pre",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "span",
      "div",
      "del",
      "hr",
      "sup",
      "sub",
      "abbr",
      "cite",
      "dfn",
      "kbd",
      "mark",
      "q",
      "samp",
      "small",
      "time",
      "var"
    ],
    // Allow safe link attributes only (href is protocol-restricted + target/rel are
    // forced by the afterSanitizeAttributes hook above). No src or resource-loading attrs.
    ALLOWED_ATTR: [
      "href",
      "target",
      "rel",
      "title",
      "class",
      "id",
      "align",
      "colspan",
      "rowspan"
    ],
    // Return a string instead of a document
    RETURN_DOM: !1,
    RETURN_DOM_FRAGMENT: !1,
    // Keep HTML comments removed
    ALLOW_DATA_ATTR: !1
    // NOTE: do NOT set USE_PROFILES here — it overrides ALLOWED_TAGS/ALLOWED_ATTR,
    // which would drop the <a> tags we explicitly allow above. The explicit
    // ALLOWED_TAGS/ALLOWED_ATTR allowlist is authoritative; protocols are still
    // restricted by the afterSanitizeAttributes hook (href → http/https/mailto only).
  };
  return Ba.sanitize(e, t);
}
Be.setOptions({
  renderer: new Be.Renderer(),
  gfm: !0,
  breaks: !0
});
const Ti = (e) => Am(Be(e || "")), uc = "*", Sm = /* @__PURE__ */ new Set(["null", "about:blank", ""]);
let sn = null;
const zr = (e) => e && !Sm.has(e) ? e : null, xm = (e) => {
  if (!e) return null;
  try {
    return zr(new URL(e).origin);
  } catch {
    return null;
  }
};
function Gu() {
  if (sn) return sn;
  if (window.parent === window)
    return sn = zr(window.location.origin) || uc, sn;
  try {
    const e = zr(window.parent.location.origin);
    if (e)
      return sn = e, sn;
  } catch {
  }
  try {
    const e = window.location.ancestorOrigins, t = e && e.length ? zr(e[0]) : null;
    if (t)
      return sn = t, sn;
  } catch {
  }
  return sn = xm(document.referrer) || uc, sn;
}
function fc(e) {
  sn = zr(e) || sn;
}
function St(e) {
  window.parent.postMessage(e, Gu());
}
const zi = "Start a new chat", hc = "Start a new chat? This ends the current one.", Em = "Start new chat", Cm = "Cancel", dc = "Couldn't start a new chat. Please try again.", Rm = 15e3, Im = ["aria-label"], Om = { class: "new-chat-confirm__question" }, Lm = { class: "new-chat-confirm__actions" }, Nm = ["disabled"], Pm = ["disabled"], Mm = /* @__PURE__ */ Ji({
  __name: "NewChatConfirm",
  props: {
    error: {},
    busy: { type: Boolean }
  },
  emits: ["confirm", "cancel"],
  setup(e, { emit: t }) {
    const n = t;
    return (s, r) => (A(), x("div", {
      class: "new-chat-confirm",
      role: "alertdialog",
      "aria-live": "polite",
      "aria-label": S(hc)
    }, [
      y("p", Om, J(s.error || S(hc)), 1),
      y("div", Lm, [
        y("button", {
          type: "button",
          class: "new-chat-confirm__button",
          disabled: s.busy,
          onClick: r[0] || (r[0] = (i) => n("cancel"))
        }, J(S(Cm)), 9, Nm),
        y("button", {
          type: "button",
          class: "new-chat-confirm__button new-chat-confirm__button--primary",
          disabled: s.busy,
          onClick: r[1] || (r[1] = (i) => n("confirm"))
        }, J(S(Em)), 9, Pm)
      ])
    ], 8, Im));
  }
}), ao = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [s, r] of t)
    n[s] = r;
  return n;
}, Yu = /* @__PURE__ */ ao(Mm, [["__scopeId", "data-v-6c78f353"]]), Dm = { class: "askai" }, Fm = { class: "askai__bar" }, $m = ["value", "placeholder", "disabled", "aria-label", "onKeydown"], Bm = ["disabled", "title", "aria-label", "aria-expanded"], Um = { class: "askai__intro" }, zm = { class: "askai__title" }, Hm = {
  key: 0,
  class: "askai__subtitle"
}, Wm = {
  key: 0,
  class: "askai__suggestions"
}, jm = ["disabled", "onClick"], qm = ["aria-live"], Vm = {
  key: 0,
  class: "askai__question"
}, Km = {
  key: 1,
  class: "askai__system"
}, Gm = ["innerHTML"], Ym = {
  key: 0,
  class: "askai__sources"
}, Xm = ["title"], Zm = {
  key: 0,
  class: "askai__thinking",
  role: "status",
  "aria-live": "polite"
}, Jm = { class: "askai__thinking-text" }, Qm = { class: "askai__foot" }, eg = { key: 0 }, tg = /* @__PURE__ */ Ji({
  __name: "AskAiPanel",
  props: {
    messages: {},
    draft: {},
    agentName: {},
    suggestions: {},
    welcomeTitle: {},
    welcomeSubtitle: {},
    placeholder: {},
    inputEnabled: { type: Boolean },
    typingEnabled: { type: Boolean },
    loading: { type: Boolean },
    showCitations: { type: Boolean },
    disclaimer: {},
    active: { type: Boolean },
    hotkey: { type: Boolean },
    citationLabel: { type: Function },
    citationTooltip: { type: Function },
    displayText: { type: Function },
    isStreaming: { type: Function },
    canStartNewChat: { type: Boolean },
    startingNewChat: { type: Boolean },
    newChatArmed: { type: Boolean },
    newChatError: {}
  },
  emits: ["update:draft", "send", "ask", "close", "newChat", "confirmNewChat", "cancelNewChat"],
  setup(e, { emit: t }) {
    const n = e, s = t, r = oe(null), i = oe(null), o = oe(null), a = ["user", "bot", "agent", "system"], l = fe(
      () => n.messages.map((C, v) => ({ message: C, index: v })).filter(({ message: C }) => a.includes(C.message_type))
    ), h = fe(() => l.value.length > 0), u = (C) => {
      s("update:draft", C.target.value);
    }, k = () => {
      !(n.typingEnabled ?? n.inputEnabled) || !n.draft.trim() || s("send");
    }, b = (C) => {
      n.inputEnabled && s("ask", C);
    }, I = typeof navigator < "u" && /Mac|iPod|iPhone|iPad/.test(navigator.platform || ""), B = (C) => {
      if (C.key === "Escape") {
        C.preventDefault(), s("close");
        return;
      }
      const v = I ? C.metaKey && !C.ctrlKey : C.ctrlKey && !C.metaKey;
      n.hotkey && v && !C.altKey && (C.key === "k" || C.key === "K") && (C.preventDefault(), s("close"));
    }, H = () => {
      rs(() => {
        var C;
        return (C = r.value) == null ? void 0 : C.focus();
      });
    };
    let he = 0;
    const R = () => {
      if (!o.value) return;
      const C = o.value.closest(".askai"), v = i.value;
      if (!C || !v) return;
      const q = C.offsetHeight - v.offsetHeight, K = getComputedStyle(v), ae = parseFloat(K.paddingTop) + parseFloat(K.paddingBottom), Oe = Math.ceil(q + ae + o.value.getBoundingClientRect().height);
      Math.abs(Oe - he) < 3 || (he = Oe, St({ type: "WIDGET_RESIZE", height: Oe }));
    };
    let le = null;
    const de = fe(
      () => l.value.reduce((C, { message: v, index: q }) => C + n.displayText(q, v.message || "").length, 0)
    );
    return Ot(
      () => [l.value.length, de.value, n.loading],
      () => rs(() => {
        i.value && (i.value.scrollTop = i.value.scrollHeight);
      })
    ), Ot(() => n.newChatArmed, () => rs(() => R())), Ot(() => n.active, (C) => {
      C && H();
    }), eo(() => {
      n.active && H(), window.addEventListener("keydown", B), o.value && typeof ResizeObserver < "u" && (le = new ResizeObserver(() => R()), le.observe(o.value)), R();
    }), to(() => {
      window.removeEventListener("keydown", B), le == null || le.disconnect(), le = null;
    }), (C, v) => (A(), x("div", Dm, [
      y("div", Fm, [
        v[6] || (v[6] = y("svg", {
          class: "askai__bar-icon",
          width: "18",
          height: "18",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          "stroke-width": "1.8",
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "aria-hidden": "true"
        }, [
          y("path", { d: "M12 3l1.9 4.9L19 9.8l-4.9 1.9L12 17l-1.9-5.3L5 9.8l5.1-1.9L12 3z" })
        ], -1)),
        y("input", {
          ref_key: "inputEl",
          ref: r,
          type: "text",
          class: "askai__input",
          value: C.draft,
          placeholder: C.placeholder,
          disabled: !(C.typingEnabled ?? C.inputEnabled),
          "aria-label": C.placeholder,
          autocomplete: "off",
          spellcheck: "false",
          onInput: u,
          onKeydown: wi(Ss(k, ["prevent"]), ["enter"])
        }, null, 40, $m),
        C.canStartNewChat ? (A(), x("button", {
          key: 0,
          type: "button",
          class: $e(["askai__new", { "askai__new--armed": C.newChatArmed }]),
          disabled: C.startingNewChat,
          title: S(zi),
          "aria-label": S(zi),
          "aria-expanded": C.newChatArmed,
          onClick: v[0] || (v[0] = (q) => s("newChat"))
        }, v[4] || (v[4] = [
          y("svg", {
            width: "15",
            height: "15",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2",
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            "aria-hidden": "true"
          }, [
            y("path", { d: "M12 20h9" }),
            y("path", { d: "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" })
          ], -1)
        ]), 10, Bm)) : re("", !0),
        y("button", {
          type: "button",
          class: "askai__close",
          "aria-label": "Close",
          title: "Close (Esc)",
          onClick: v[1] || (v[1] = (q) => s("close"))
        }, v[5] || (v[5] = [
          y("span", { class: "askai__kbd" }, "Esc", -1)
        ]))
      ]),
      C.newChatArmed && C.canStartNewChat ? (A(), Br(Yu, {
        key: 0,
        busy: C.startingNewChat,
        error: C.newChatError,
        onConfirm: v[2] || (v[2] = (q) => s("confirmNewChat")),
        onCancel: v[3] || (v[3] = (q) => s("cancelNewChat"))
      }, null, 8, ["busy", "error"])) : re("", !0),
      y("div", {
        ref_key: "bodyEl",
        ref: i,
        class: "askai__body"
      }, [
        y("div", {
          ref_key: "contentEl",
          ref: o,
          class: "askai__content"
        }, [
          h.value ? (A(), x(Ie, { key: 1 }, [
            (A(!0), x(Ie, null, bt(l.value, ({ message: q, index: K }) => (A(), x("div", {
              key: K,
              class: "askai__turn",
              "aria-live": C.isStreaming(K) ? "off" : "polite"
            }, [
              q.message_type === "user" ? (A(), x("p", Vm, J(q.message), 1)) : q.message_type === "system" ? (A(), x("p", Km, J(q.message), 1)) : (A(), x(Ie, { key: 2 }, [
                y("div", {
                  class: $e(["askai__answer", { "askai__answer--streaming": C.isStreaming(K) }]),
                  innerHTML: S(Ti)(C.isStreaming(K) ? C.displayText(K, q.message || "") : q.message || "")
                }, null, 10, Gm),
                C.showCitations && !C.isStreaming(K) && q.sources && q.sources.length ? (A(), x("div", Ym, [
                  v[9] || (v[9] = y("span", { class: "askai__label" }, "Sources", -1)),
                  (A(!0), x(Ie, null, bt(q.sources, (ae, Oe) => (A(), x("span", {
                    key: Oe,
                    class: "askai__source",
                    title: C.citationTooltip(ae)
                  }, J(C.citationLabel(ae)), 9, Xm))), 128))
                ])) : re("", !0)
              ], 64))
            ], 8, qm))), 128)),
            C.loading ? (A(), x("div", Zm, [
              v[10] || (v[10] = y("span", { class: "askai__dot" }, null, -1)),
              v[11] || (v[11] = y("span", { class: "askai__dot" }, null, -1)),
              v[12] || (v[12] = y("span", { class: "askai__dot" }, null, -1)),
              y("span", Jm, J(C.showCitations ? "Searching the knowledge base" : "Thinking"), 1)
            ])) : re("", !0)
          ], 64)) : (A(), x(Ie, { key: 0 }, [
            y("div", Um, [
              y("h2", zm, J(C.welcomeTitle || `Ask ${C.agentName}`), 1),
              C.welcomeSubtitle ? (A(), x("p", Hm, J(C.welcomeSubtitle), 1)) : re("", !0)
            ]),
            C.suggestions.length && !C.draft.trim() ? (A(), x("div", Wm, [
              v[8] || (v[8] = y("p", { class: "askai__label" }, "Suggested", -1)),
              (A(!0), x(Ie, null, bt(C.suggestions, (q) => (A(), x("button", {
                key: q,
                type: "button",
                class: "askai__suggestion",
                disabled: !C.inputEnabled,
                onClick: (K) => b(q)
              }, [
                y("span", null, J(q), 1),
                v[7] || (v[7] = y("svg", {
                  width: "15",
                  height: "15",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                  "aria-hidden": "true"
                }, [
                  y("path", { d: "M5 12h14M13 6l6 6-6 6" })
                ], -1))
              ], 8, jm))), 128))
            ])) : re("", !0)
          ], 64))
        ], 512)
      ], 512),
      y("div", Qm, [
        C.disclaimer ? (A(), x("span", eg, J(C.disclaimer), 1)) : re("", !0),
        v[13] || (v[13] = y("a", {
          class: "askai__brand",
          href: "https://chattermate.chat",
          target: "_blank",
          rel: "noopener noreferrer"
        }, "Powered by ChatterMate", -1))
      ])
    ]));
  }
}), ng = /* @__PURE__ */ ao(tg, [["__scopeId", "data-v-edea9534"]]), sg = ["aria-label"], rg = { class: "cm-action-head" }, ig = { class: "cm-action-row before" }, og = { class: "cm-action-text" }, ag = { class: "cm-action-row after" }, lg = { class: "cm-action-text" }, cg = {
  key: 1,
  class: "cm-action-args"
}, ug = { class: "cm-action-buttons" }, fg = /* @__PURE__ */ Ji({
  __name: "ActionConfirmCard",
  props: {
    pending: {}
  },
  emits: ["approve", "decline"],
  setup(e, { emit: t }) {
    const n = e, s = t, r = fe(() => !!n.pending.preview);
    function i(a) {
      return a == null || a === "" ? "—" : typeof a == "string" ? a : JSON.stringify(a, null, 2);
    }
    const o = fe(
      () => Object.entries(n.pending.request.args || {}).map(([a, l]) => ({ key: a, value: i(l) }))
    );
    return (a, l) => {
      var h, u;
      return A(), x("div", {
        class: "cm-action-confirm",
        role: "group",
        "aria-label": a.pending.request.label
      }, [
        y("div", rg, J(a.pending.request.label), 1),
        r.value ? (A(), x(Ie, { key: 0 }, [
          y("div", ig, [
            l[2] || (l[2] = y("span", { class: "cm-action-tag" }, "Current", -1)),
            y("span", og, J(i((h = a.pending.preview) == null ? void 0 : h.before)), 1)
          ]),
          y("div", ag, [
            l[3] || (l[3] = y("span", { class: "cm-action-tag" }, "New", -1)),
            y("span", lg, J(i((u = a.pending.preview) == null ? void 0 : u.after)), 1)
          ])
        ], 64)) : o.value.length ? (A(), x("dl", cg, [
          (A(!0), x(Ie, null, bt(o.value, (k) => (A(), x(Ie, {
            key: k.key
          }, [
            y("dt", null, J(k.key), 1),
            y("dd", null, J(k.value), 1)
          ], 64))), 128))
        ])) : re("", !0),
        y("div", ug, [
          y("button", {
            type: "button",
            class: "cm-action-apply",
            onClick: l[0] || (l[0] = (k) => s("approve"))
          }, "Apply"),
          y("button", {
            type: "button",
            class: "cm-action-cancel",
            onClick: l[1] || (l[1] = (k) => s("decline"))
          }, J(r.value ? "Keep current" : "Cancel"), 1)
        ])
      ], 8, sg);
    };
  }
}), hg = /* @__PURE__ */ ao(fg, [["__scopeId", "data-v-d314bd02"]]), dg = "Please don't paste passwords or keys here.", pg = [
  /\bsk-(?:proj-|ant-)?[A-Za-z0-9_-]{20,}/,
  /\bcmat_[A-Za-z0-9_-]{16,}/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{30,}/,
  /\bxox[abposr]-[A-Za-z0-9-]{10,}/
], mg = /\b(password|passwd|pwd|passcode|api[ _-]?key|secret)\s*(?:is|:|=)\s*\S+/i, gg = /\b(?:\d[ -]?){12,18}\d\b/g;
function _g(e) {
  let t = 0;
  for (let n = 0; n < e.length; n++) {
    let s = Number(e[e.length - 1 - n]);
    n % 2 === 1 && (s *= 2, s > 9 && (s -= 9)), t += s;
  }
  return t % 10 === 0;
}
function yg(e) {
  return e ? pg.some((t) => t.test(e)) || mg.test(e) ? !0 : (e.match(gg) || []).some((t) => {
    const n = t.replace(/\D/g, "");
    return n.length >= 13 && n.length <= 19 && _g(n);
  }) : !1;
}
const Ir = [
  { stops: "#9D8CFF, #5FE3D6, #C9F24E", glow: "rgba(157,140,255,0.45)" },
  // aurora (default)
  { stops: "#FF8A73, #9D8CFF, #5FE3D6", glow: "rgba(255,138,115,0.40)" },
  // coral
  { stops: "#5FE3D6, #C9F24E, #9D8CFF", glow: "rgba(95,227,214,0.40)" },
  // teal
  { stops: "#C9F24E, #5FE3D6, #FF8A73", glow: "rgba(201,242,78,0.35)" },
  // lime
  { stops: "#6EA8FF, #9D8CFF, #5FE3D6", glow: "rgba(110,168,255,0.42)" },
  // blue
  { stops: "#FF7AC6, #9D8CFF, #6EA8FF", glow: "rgba(255,122,198,0.42)" },
  // pink
  { stops: "#FF8A73, #FFC857, #FF7AC6", glow: "rgba(255,200,87,0.40)" },
  // sunset
  { stops: "#7C5CFF, #B388FF, #5FE3D6", glow: "rgba(124,92,255,0.45)" },
  // violet
  { stops: "#0EA5A5, #5FE3D6, #C9F24E", glow: "rgba(14,165,165,0.40)" },
  // emerald
  { stops: "#F34611, #FF8A73, #FFC857", glow: "rgba(243,70,17,0.38)" }
  // ember
], bg = (e) => (e || "").split("").reduce((t, n) => t + n.charCodeAt(0), 0) % Ir.length, vg = (e) => {
  const t = Ir[(e % Ir.length + Ir.length) % Ir.length];
  return {
    background: `
            radial-gradient(circle at 32% 28%, rgba(255,255,255,0.22) 0%, transparent 42%),
            radial-gradient(circle at 68% 72%, rgba(0,0,0,0.25) 0%, transparent 38%),
            radial-gradient(ellipse at 50% 50%, ${t.stops})
        `.trim(),
    boxShadow: `0 4px 28px ${t.glow}, inset 0 1px 0 rgba(255,255,255,0.15)`,
    borderRadius: "50%"
  };
}, wg = (e, t) => {
  const n = typeof t == "number" && Number.isFinite(t) ? t : bg(e);
  return vg(n);
}, pc = (e) => {
  var t;
  return !!((t = e == null ? void 0 : e.attributes) != null && t.end_chat);
}, mc = "AI can make mistakes. Check important info.";
function kg(e, t = !1) {
  return e !== !1 && !t;
}
const Fo = {
  ai: "Online · replies instantly",
  human: "Online · usually replies in a few minutes",
  away: "Away · we'll reply when we're back"
};
function Tg(e, t = !1) {
  return (t ? "human" : (e == null ? void 0 : e.mode) ?? "ai") === "ai" ? { text: Fo.ai, online: !0 } : (e == null ? void 0 : e.available) !== !1 ? { text: Fo.human, online: !0 } : { text: Fo.away, online: !1 };
}
const Xu = (e) => !!e && (/^https?:\/\//i.test(e) || e.startsWith("data:")), Ag = (e, t) => e ? Xu(e) || e.startsWith("blob:") ? e : `${t.replace(/\/api\/v1\/?$/, "")}${e.startsWith("/") ? "" : "/"}${e}` : "";
function gc() {
  return typeof window < "u" && window.APP_CONFIG ? window.APP_CONFIG : {};
}
const Os = {
  get API_URL() {
    return gc().API_URL || void 0 || "https://api.chattermate.chat/api/v1";
  },
  get WS_URL() {
    return gc().WS_URL || void 0 || "wss://api.chattermate.chat";
  }
};
function Hi(e) {
  return Ag(e, Os.API_URL);
}
const Zu = "ctid", Sg = "identity_expired", xg = "invalid_token", _c = 0.8, Eg = 720 * 60 * 1e3, $o = 30 * 1e3, Bo = 1e3, os = (e) => {
  if (typeof e != "string") return e ? String(e) : null;
  const t = e.trim();
  return !t || t === "undefined" || t === "null" ? null : t;
}, Ai = (e) => {
  const t = os(e);
  if (!t) return null;
  const [, n] = t.split(".");
  if (!n) return null;
  try {
    const s = atob(n.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(s);
  } catch {
    return null;
  }
}, Cg = async (e) => {
  var t, n;
  try {
    return (n = (t = await e.json()) == null ? void 0 : t.detail) == null ? void 0 : n.code;
  } catch {
    return;
  }
}, Wi = (e = Zu) => ({
  read: () => {
    try {
      return os(localStorage.getItem(e));
    } catch {
      return null;
    }
  },
  write: (t) => {
    try {
      localStorage.setItem(e, t);
    } catch {
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(e);
    } catch {
    }
  }
}), Rg = () => ({
  read: () => null,
  write: () => {
  },
  clear: () => {
  }
});
function Ig(e = {}) {
  const t = e.store ?? Wi(), n = oe(null);
  let s = null, r = null;
  const i = () => {
    s && (clearTimeout(s), s = null);
  }, o = () => {
    const H = Ai(n.value);
    return H != null && H.exp ? Number(H.exp) - Math.floor(Date.now() / Bo) : null;
  }, a = () => {
    const H = Ai(n.value);
    if (!(H != null && H.exp)) return !1;
    const he = H.iat ? Number(H.exp) - Number(H.iat) : 0, R = o() ?? 0;
    return he <= 0 ? R <= 0 : R <= he * (1 - _c);
  }, l = (H, { persist: he = !0 } = {}) => {
    var de, C;
    const R = os(H), le = !!n.value;
    if (i(), n.value = R, !R) {
      t.clear(), le && ((de = e.onTokenCleared) == null || de.call(e));
      return;
    }
    he && (t.write(R), (C = e.onTokenChanged) == null || C.call(e, R)), k();
  }, h = async (H) => {
    if (!n.value || !H) return !1;
    if (r) return r;
    const he = n.value;
    return r = (async () => {
      var R, le;
      try {
        const de = await fetch(`${Os.API_URL}/refresh-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${he}`
          },
          body: JSON.stringify({ widget_id: H })
        });
        if (de.status === 401)
          return await Cg(de) !== xg && ((R = e.onIdentityExpired) == null || R.call(e)), !1;
        if (!de.ok)
          return k($o), !1;
        const C = await de.json(), v = os((le = C == null ? void 0 : C.data) == null ? void 0 : le.token);
        return v ? (l(v), !0) : !1;
      } catch {
        return k($o), !1;
      } finally {
        r = null;
      }
    })(), r;
  }, u = async (H) => n.value ? a() ? h(H) : !0 : !1, k = (H) => {
    i();
    const he = Ai(n.value);
    if (!(he != null && he.exp) || !(he != null && he.iat)) return;
    const R = (Number(he.exp) - Number(he.iat)) * Bo, le = (o() ?? 0) * Bo, de = H ?? Math.min(
      Eg,
      Math.max(0, le - R * (1 - _c))
    );
    s = setTimeout(() => {
      s = null, u(b).then((C) => {
        k(C ? void 0 : $o);
      });
    }, de);
  };
  let b = "";
  return {
    token: n,
    start: (H, he) => {
      b = H;
      const R = os(he) || t.read();
      l(R, { persist: !1 }), R && t.write(R);
    },
    stop: () => {
      i(), r = null;
    },
    setToken: l,
    ensureFresh: u
  };
}
const ir = window.__CM_FRAME__, Ju = "null";
let Cs = !1, Qu = !1, ef = null;
const ji = () => !!ir, Es = () => !ir || Cs && !Qu, tf = () => ef, nf = (e) => {
  typeof e == "string" && e && (ef = e);
}, sf = (e) => ir ? Cs ? Rg() : Wi(`${Zu}:${e}`) : Wi(), Og = () => new Promise((e) => {
  const t = (n) => {
    var r;
    if (n.source !== window.parent || ((r = n.data) == null ? void 0 : r.type) !== "HOST_INIT") return;
    window.removeEventListener("message", t);
    const s = n.origin === Ju;
    e({
      origin: n.origin,
      // An opaque host can't be addressed, so nothing it hands over can be
      // answered safely: such a frame runs as an anonymous visitor.
      token: s ? null : os(n.data.token),
      pageUrl: typeof n.data.pageUrl == "string" ? n.data.pageUrl : null
    });
  };
  window.addEventListener("message", t), window.parent.postMessage({ type: "FRAME_READY" }, "*");
}), Lg = async (e) => {
  var t;
  try {
    const n = await e.json();
    return ((t = n == null ? void 0 : n.detail) == null ? void 0 : t.code) || "unavailable";
  } catch {
    return "unavailable";
  }
}, yc = () => {
  const e = document.getElementById("app");
  e && (e.textContent = "Chat is unavailable right now.");
};
async function Ng() {
  if (!ir) return !0;
  const e = new URL(window.location.href).searchParams;
  Cs = e.get("host") === "1" && window.parent !== window;
  let t, n = null;
  if (Cs) {
    const o = await Og();
    o.origin !== Ju ? (fc(o.origin), n = o.origin) : (Qu = !0, fc("*")), nf(o.pageUrl), t = o.token;
  } else
    t = sf(ir.widgetId).read();
  let s;
  try {
    s = await fetch(`${Os.API_URL}/widgets/${encodeURIComponent(ir.widgetId)}/bootstrap`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...t ? { Authorization: `Bearer ${t}` } : {}
      },
      body: JSON.stringify({ host_origin: n, source: e.get("source") })
    });
  } catch {
    return Cs ? St({ type: "WIDGET_ERROR", code: "unavailable" }) : yc(), !1;
  }
  if (!s.ok) {
    const o = await Lg(s);
    return Cs ? St({ type: "WIDGET_ERROR", code: o }) : yc(), !1;
  }
  const r = await s.json();
  window.__INITIAL_DATA__ = r;
  const i = os(r.initialToken);
  return Es() && i && i !== t && St({ type: "TOKEN_UPDATE", token: i }), !0;
}
const Pg = () => {
  Cs && St({ type: "WIDGET_READY" });
};
function Mg(e) {
  const t = fe(() => ({
    backgroundColor: "var(--cm-card)",
    color: "var(--cm-text)"
  })), n = fe(() => ({
    backgroundColor: e.value.chat_bubble_color || "#C9F24E",
    color: sr(e.value.chat_bubble_color || "#C9F24E") ? "#FFFFFF" : "#000000"
  })), s = fe(() => ({
    backgroundColor: "var(--cm-agent-bg)",
    color: "var(--cm-text)"
  })), r = fe(() => ({
    backgroundColor: "var(--cm-accent)",
    color: "var(--cm-on-accent)"
  })), i = fe(() => ({
    color: "var(--cm-text)"
  })), o = fe(() => ({
    borderBottom: "1px solid var(--cm-hairline)"
  })), a = fe(() => Hi(e.value.photo_url)), l = fe(() => {
    const h = e.value.chat_background_color || "#ffffff";
    return {
      boxShadow: `0 8px 5px ${sr(h) ? "rgba(0, 0, 0, 0.24)" : "rgba(0, 0, 0, 0.12)"}`
    };
  });
  return {
    chatStyles: t,
    chatIconStyles: n,
    agentBubbleStyles: s,
    userBubbleStyles: r,
    messageNameStyles: i,
    headerBorderStyles: o,
    photoUrl: a,
    shadowStyle: l
  };
}
const Dg = /* @__PURE__ */ new Set(["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]), Fg = /* @__PURE__ */ new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);
[...Dg, ...Fg];
function $g(e, t) {
  const n = oe([]), s = oe(!1), r = oe(null), i = (v) => {
    if (v === 0) return "0 Bytes";
    const q = 1024, K = ["Bytes", "KB", "MB", "GB"], ae = Math.floor(Math.log(v) / Math.log(q));
    return parseFloat((v / Math.pow(q, ae)).toFixed(2)) + " " + K[ae];
  }, o = (v) => v.startsWith("image/"), a = (v) => v ? Hi(v) : "", l = (v) => {
    const q = v.file_url || v.url;
    return q ? Hi(q) : "";
  }, h = async (v) => {
    const q = v.target;
    q.files && q.files.length > 0 && (await H(Array.from(q.files)), q.value = "");
  }, u = async (v) => {
    var K;
    v.preventDefault();
    const q = (K = v.dataTransfer) == null ? void 0 : K.files;
    q && q.length > 0 && await H(Array.from(q));
  }, k = (v) => {
    v.preventDefault();
  }, b = (v) => {
    v.preventDefault();
  }, I = async (v) => {
    var ae;
    const q = (ae = v.clipboardData) == null ? void 0 : ae.items;
    if (!q) return;
    const K = [];
    for (const Oe of Array.from(q))
      if (Oe.kind === "file") {
        const _e = Oe.getAsFile();
        _e && K.push(_e);
      }
    K.length > 0 && await H(K);
  }, B = async (v, q = 500) => new Promise((K, ae) => {
    const Oe = new FileReader();
    Oe.onload = (_e) => {
      var ve;
      const Le = new Image();
      Le.onload = () => {
        const Ve = document.createElement("canvas");
        let Fe = Le.width, et = Le.height;
        const ce = 1920;
        (Fe > ce || et > ce) && (Fe > et ? (et = et / Fe * ce, Fe = ce) : (Fe = Fe / et * ce, et = ce)), Ve.width = Fe, Ve.height = et;
        const ye = Ve.getContext("2d");
        if (!ye) {
          ae(new Error("Failed to get canvas context"));
          return;
        }
        ye.drawImage(Le, 0, 0, Fe, et);
        let pe = 0.9;
        const Ye = () => {
          Ve.toBlob((Xe) => {
            if (!Xe) {
              ae(new Error("Failed to compress image"));
              return;
            }
            if (Xe.size / 1024 > q && pe > 0.3)
              pe -= 0.1, Ye();
            else {
              const Ke = new FileReader();
              Ke.onload = () => {
                const gt = Ke.result.split(",")[1];
                K({ blob: Xe, base64: gt });
              }, Ke.readAsDataURL(Xe);
            }
          }, v.type === "image/png" ? "image/png" : "image/jpeg", pe);
        };
        Ye();
      }, Le.onerror = () => ae(new Error("Failed to load image")), Le.src = (ve = _e.target) == null ? void 0 : ve.result;
    }, Oe.onerror = () => ae(new Error("Failed to read file")), Oe.readAsDataURL(v);
  }), H = async (v) => {
    if (n.value.length >= 3) {
      alert("Maximum 3 files allowed per message");
      return;
    }
    const _e = 3 - n.value.length, Le = v.slice(0, _e);
    v.length > _e && alert(`Only ${_e} more file(s) can be uploaded. Maximum 3 files per message.`);
    for (const ve of Le)
      try {
        if (n.value.some((ce) => ce.filename === ve.name)) {
          console.warn(`File ${ve.name} is already selected`), alert(`File "${ve.name}" is already selected`);
          continue;
        }
        const Fe = ve.type.startsWith("image/"), et = Fe ? 5242880 : 10485760;
        if (ve.size > et) {
          const ce = et / 1048576;
          console.error(`File ${ve.name} is too large. Maximum size is ${ce}MB`), alert(`File "${ve.name}" is too large. Maximum size for ${Fe ? "images" : "documents"} is ${ce}MB`);
          continue;
        }
        if (Fe)
          try {
            const { blob: ce, base64: ye } = await B(ve, 500), pe = ce.size;
            console.log(`Compressed ${ve.name}: ${(ve.size / 1024).toFixed(2)}KB → ${(pe / 1024).toFixed(2)}KB`), n.value.push({
              content: ye,
              filename: ve.name,
              type: ve.type,
              size: pe,
              url: URL.createObjectURL(ce),
              file_url: URL.createObjectURL(ce)
            });
          } catch (ce) {
            console.error("Image compression failed, uploading original:", ce);
            const ye = new FileReader();
            ye.onload = (pe) => {
              var st;
              const Xe = ((st = pe.target) == null ? void 0 : st.result).split(",")[1];
              n.value.push({
                content: Xe,
                filename: ve.name,
                type: ve.type,
                size: ve.size,
                url: URL.createObjectURL(ve),
                file_url: URL.createObjectURL(ve)
              });
            }, ye.readAsDataURL(ve);
          }
        else {
          const ce = new FileReader();
          ce.onload = (ye) => {
            var Xe;
            const Ye = ((Xe = ye.target) == null ? void 0 : Xe.result).split(",")[1];
            n.value.push({
              content: Ye,
              filename: ve.name,
              type: ve.type || "application/octet-stream",
              size: ve.size,
              url: "",
              file_url: ""
            });
          }, ce.readAsDataURL(ve);
        }
      } catch (Ve) {
        console.error("File upload error:", Ve);
      }
  };
  return {
    uploadedAttachments: n,
    previewModal: s,
    previewFile: r,
    formatFileSize: i,
    isImageAttachment: o,
    getDownloadUrl: a,
    getPreviewUrl: l,
    handleFileSelect: h,
    handleDrop: u,
    handleDragOver: k,
    handleDragLeave: b,
    handlePaste: I,
    uploadFiles: H,
    removeAttachment: async (v) => {
      const q = n.value[v];
      if (q) {
        try {
          let K = q.url;
          if (K.startsWith("/uploads/") ? K = K.substring(9) : K.startsWith("/") && (K = K.substring(1)), Xu(K))
            try {
              K = new URL(K).pathname.replace(/^\/+/, "");
            } catch {
            }
          const ae = {};
          e.value && (ae.Authorization = `Bearer ${e.value}`);
          const Oe = await fetch(`${Os.API_URL}/files/upload/${K}`, {
            method: "DELETE",
            headers: ae
          });
          if (Oe.ok)
            console.log("File deleted successfully from backend.");
          else {
            const _e = await Oe.json();
            console.error("Failed to delete file:", _e.detail);
          }
        } catch (K) {
          console.error("Error calling delete API:", K);
        }
        q.url && q.url.startsWith("blob:") && URL.revokeObjectURL(q.url), q.file_url && q.file_url.startsWith("blob:") && URL.revokeObjectURL(q.file_url), n.value.splice(v, 1);
      }
    },
    openPreview: (v) => {
      r.value = v, s.value = !0;
    },
    closePreview: () => {
      s.value = !1, setTimeout(() => {
        r.value = null;
      }, 300);
    },
    openFilePicker: () => {
      var v;
      (v = t.value) == null || v.click();
    },
    isImage: (v) => v.startsWith("image/")
  };
}
const Rn = /* @__PURE__ */ Object.create(null);
Rn.open = "0";
Rn.close = "1";
Rn.ping = "2";
Rn.pong = "3";
Rn.message = "4";
Rn.upgrade = "5";
Rn.noop = "6";
const Si = /* @__PURE__ */ Object.create(null);
Object.keys(Rn).forEach((e) => {
  Si[Rn[e]] = e;
});
const ca = { type: "error", data: "parser error" }, rf = typeof Blob == "function" || typeof Blob < "u" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]", of = typeof ArrayBuffer == "function", af = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e && e.buffer instanceof ArrayBuffer, Ua = ({ type: e, data: t }, n, s) => rf && t instanceof Blob ? n ? s(t) : bc(t, s) : of && (t instanceof ArrayBuffer || af(t)) ? n ? s(t) : bc(new Blob([t]), s) : s(Rn[e] + (t || "")), bc = (e, t) => {
  const n = new FileReader();
  return n.onload = function() {
    const s = n.result.split(",")[1];
    t("b" + (s || ""));
  }, n.readAsDataURL(e);
};
function vc(e) {
  return e instanceof Uint8Array ? e : e instanceof ArrayBuffer ? new Uint8Array(e) : new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
}
let Uo;
function Bg(e, t) {
  if (rf && e.data instanceof Blob)
    return e.data.arrayBuffer().then(vc).then(t);
  if (of && (e.data instanceof ArrayBuffer || af(e.data)))
    return t(vc(e.data));
  Ua(e, !1, (n) => {
    Uo || (Uo = new TextEncoder()), t(Uo.encode(n));
  });
}
const wc = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", Or = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (let e = 0; e < wc.length; e++)
  Or[wc.charCodeAt(e)] = e;
const Ug = (e) => {
  let t = e.length * 0.75, n = e.length, s, r = 0, i, o, a, l;
  e[e.length - 1] === "=" && (t--, e[e.length - 2] === "=" && t--);
  const h = new ArrayBuffer(t), u = new Uint8Array(h);
  for (s = 0; s < n; s += 4)
    i = Or[e.charCodeAt(s)], o = Or[e.charCodeAt(s + 1)], a = Or[e.charCodeAt(s + 2)], l = Or[e.charCodeAt(s + 3)], u[r++] = i << 2 | o >> 4, u[r++] = (o & 15) << 4 | a >> 2, u[r++] = (a & 3) << 6 | l & 63;
  return h;
}, zg = typeof ArrayBuffer == "function", za = (e, t) => {
  if (typeof e != "string")
    return {
      type: "message",
      data: lf(e, t)
    };
  const n = e.charAt(0);
  return n === "b" ? {
    type: "message",
    data: Hg(e.substring(1), t)
  } : Si[n] ? e.length > 1 ? {
    type: Si[n],
    data: e.substring(1)
  } : {
    type: Si[n]
  } : ca;
}, Hg = (e, t) => {
  if (zg) {
    const n = Ug(e);
    return lf(n, t);
  } else
    return { base64: !0, data: e };
}, lf = (e, t) => {
  switch (t) {
    case "blob":
      return e instanceof Blob ? e : new Blob([e]);
    case "arraybuffer":
    default:
      return e instanceof ArrayBuffer ? e : e.buffer;
  }
}, cf = "", Wg = (e, t) => {
  const n = e.length, s = new Array(n);
  let r = 0;
  e.forEach((i, o) => {
    Ua(i, !1, (a) => {
      s[o] = a, ++r === n && t(s.join(cf));
    });
  });
}, jg = (e, t) => {
  const n = e.split(cf), s = [];
  for (let r = 0; r < n.length; r++) {
    const i = za(n[r], t);
    if (s.push(i), i.type === "error")
      break;
  }
  return s;
};
function qg() {
  return new TransformStream({
    transform(e, t) {
      Bg(e, (n) => {
        const s = n.length;
        let r;
        if (s < 126)
          r = new Uint8Array(1), new DataView(r.buffer).setUint8(0, s);
        else if (s < 65536) {
          r = new Uint8Array(3);
          const i = new DataView(r.buffer);
          i.setUint8(0, 126), i.setUint16(1, s);
        } else {
          r = new Uint8Array(9);
          const i = new DataView(r.buffer);
          i.setUint8(0, 127), i.setBigUint64(1, BigInt(s));
        }
        e.data && typeof e.data != "string" && (r[0] |= 128), t.enqueue(r), t.enqueue(n);
      });
    }
  });
}
let zo;
function pi(e) {
  return e.reduce((t, n) => t + n.length, 0);
}
function mi(e, t) {
  if (e[0].length === t)
    return e.shift();
  const n = new Uint8Array(t);
  let s = 0;
  for (let r = 0; r < t; r++)
    n[r] = e[0][s++], s === e[0].length && (e.shift(), s = 0);
  return e.length && s < e[0].length && (e[0] = e[0].slice(s)), n;
}
function Vg(e, t) {
  zo || (zo = new TextDecoder());
  const n = [];
  let s = 0, r = -1, i = !1;
  return new TransformStream({
    transform(o, a) {
      for (n.push(o); ; ) {
        if (s === 0) {
          if (pi(n) < 1)
            break;
          const l = mi(n, 1);
          i = (l[0] & 128) === 128, r = l[0] & 127, r < 126 ? s = 3 : r === 126 ? s = 1 : s = 2;
        } else if (s === 1) {
          if (pi(n) < 2)
            break;
          const l = mi(n, 2);
          r = new DataView(l.buffer, l.byteOffset, l.length).getUint16(0), s = 3;
        } else if (s === 2) {
          if (pi(n) < 8)
            break;
          const l = mi(n, 8), h = new DataView(l.buffer, l.byteOffset, l.length), u = h.getUint32(0);
          if (u > Math.pow(2, 21) - 1) {
            a.enqueue(ca);
            break;
          }
          r = u * Math.pow(2, 32) + h.getUint32(4), s = 3;
        } else {
          if (pi(n) < r)
            break;
          const l = mi(n, r);
          a.enqueue(za(i ? l : zo.decode(l), t)), s = 0;
        }
        if (r === 0 || r > e) {
          a.enqueue(ca);
          break;
        }
      }
    }
  });
}
const uf = 4;
function dt(e) {
  if (e) return Kg(e);
}
function Kg(e) {
  for (var t in dt.prototype)
    e[t] = dt.prototype[t];
  return e;
}
dt.prototype.on = dt.prototype.addEventListener = function(e, t) {
  return this._callbacks = this._callbacks || {}, (this._callbacks["$" + e] = this._callbacks["$" + e] || []).push(t), this;
};
dt.prototype.once = function(e, t) {
  function n() {
    this.off(e, n), t.apply(this, arguments);
  }
  return n.fn = t, this.on(e, n), this;
};
dt.prototype.off = dt.prototype.removeListener = dt.prototype.removeAllListeners = dt.prototype.removeEventListener = function(e, t) {
  if (this._callbacks = this._callbacks || {}, arguments.length == 0)
    return this._callbacks = {}, this;
  var n = this._callbacks["$" + e];
  if (!n) return this;
  if (arguments.length == 1)
    return delete this._callbacks["$" + e], this;
  for (var s, r = 0; r < n.length; r++)
    if (s = n[r], s === t || s.fn === t) {
      n.splice(r, 1);
      break;
    }
  return n.length === 0 && delete this._callbacks["$" + e], this;
};
dt.prototype.emit = function(e) {
  this._callbacks = this._callbacks || {};
  for (var t = new Array(arguments.length - 1), n = this._callbacks["$" + e], s = 1; s < arguments.length; s++)
    t[s - 1] = arguments[s];
  if (n) {
    n = n.slice(0);
    for (var s = 0, r = n.length; s < r; ++s)
      n[s].apply(this, t);
  }
  return this;
};
dt.prototype.emitReserved = dt.prototype.emit;
dt.prototype.listeners = function(e) {
  return this._callbacks = this._callbacks || {}, this._callbacks["$" + e] || [];
};
dt.prototype.hasListeners = function(e) {
  return !!this.listeners(e).length;
};
const lo = typeof Promise == "function" && typeof Promise.resolve == "function" ? (t) => Promise.resolve().then(t) : (t, n) => n(t, 0), rn = typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")(), Gg = "arraybuffer";
function ff(e, ...t) {
  return t.reduce((n, s) => (e.hasOwnProperty(s) && (n[s] = e[s]), n), {});
}
const Yg = rn.setTimeout, Xg = rn.clearTimeout;
function co(e, t) {
  t.useNativeTimers ? (e.setTimeoutFn = Yg.bind(rn), e.clearTimeoutFn = Xg.bind(rn)) : (e.setTimeoutFn = rn.setTimeout.bind(rn), e.clearTimeoutFn = rn.clearTimeout.bind(rn));
}
const Zg = 1.33;
function Jg(e) {
  return typeof e == "string" ? Qg(e) : Math.ceil((e.byteLength || e.size) * Zg);
}
function Qg(e) {
  let t = 0, n = 0;
  for (let s = 0, r = e.length; s < r; s++)
    t = e.charCodeAt(s), t < 128 ? n += 1 : t < 2048 ? n += 2 : t < 55296 || t >= 57344 ? n += 3 : (s++, n += 4);
  return n;
}
function hf() {
  return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
}
function e_(e) {
  let t = "";
  for (let n in e)
    e.hasOwnProperty(n) && (t.length && (t += "&"), t += encodeURIComponent(n) + "=" + encodeURIComponent(e[n]));
  return t;
}
function t_(e) {
  let t = {}, n = e.split("&");
  for (let s = 0, r = n.length; s < r; s++) {
    let i = n[s].split("=");
    t[decodeURIComponent(i[0])] = decodeURIComponent(i[1]);
  }
  return t;
}
class n_ extends Error {
  constructor(t, n, s) {
    super(t), this.description = n, this.context = s, this.type = "TransportError";
  }
}
class Ha extends dt {
  /**
   * Transport abstract constructor.
   *
   * @param {Object} opts - options
   * @protected
   */
  constructor(t) {
    super(), this.writable = !1, co(this, t), this.opts = t, this.query = t.query, this.socket = t.socket, this.supportsBinary = !t.forceBase64;
  }
  /**
   * Emits an error.
   *
   * @param {String} reason
   * @param description
   * @param context - the error context
   * @return {Transport} for chaining
   * @protected
   */
  onError(t, n, s) {
    return super.emitReserved("error", new n_(t, n, s)), this;
  }
  /**
   * Opens the transport.
   */
  open() {
    return this.readyState = "opening", this.doOpen(), this;
  }
  /**
   * Closes the transport.
   */
  close() {
    return (this.readyState === "opening" || this.readyState === "open") && (this.doClose(), this.onClose()), this;
  }
  /**
   * Sends multiple packets.
   *
   * @param {Array} packets
   */
  send(t) {
    this.readyState === "open" && this.write(t);
  }
  /**
   * Called upon open
   *
   * @protected
   */
  onOpen() {
    this.readyState = "open", this.writable = !0, super.emitReserved("open");
  }
  /**
   * Called with data.
   *
   * @param {String} data
   * @protected
   */
  onData(t) {
    const n = za(t, this.socket.binaryType);
    this.onPacket(n);
  }
  /**
   * Called with a decoded packet.
   *
   * @protected
   */
  onPacket(t) {
    super.emitReserved("packet", t);
  }
  /**
   * Called upon close.
   *
   * @protected
   */
  onClose(t) {
    this.readyState = "closed", super.emitReserved("close", t);
  }
  /**
   * Pauses the transport, in order not to lose packets during an upgrade.
   *
   * @param onPause
   */
  pause(t) {
  }
  createUri(t, n = {}) {
    return t + "://" + this._hostname() + this._port() + this.opts.path + this._query(n);
  }
  _hostname() {
    const t = this.opts.hostname;
    return t.indexOf(":") === -1 ? t : "[" + t + "]";
  }
  _port() {
    return this.opts.port && (this.opts.secure && Number(this.opts.port) !== 443 || !this.opts.secure && Number(this.opts.port) !== 80) ? ":" + this.opts.port : "";
  }
  _query(t) {
    const n = e_(t);
    return n.length ? "?" + n : "";
  }
}
class s_ extends Ha {
  constructor() {
    super(...arguments), this._polling = !1;
  }
  get name() {
    return "polling";
  }
  /**
   * Opens the socket (triggers polling). We write a PING message to determine
   * when the transport is open.
   *
   * @protected
   */
  doOpen() {
    this._poll();
  }
  /**
   * Pauses polling.
   *
   * @param {Function} onPause - callback upon buffers are flushed and transport is paused
   * @package
   */
  pause(t) {
    this.readyState = "pausing";
    const n = () => {
      this.readyState = "paused", t();
    };
    if (this._polling || !this.writable) {
      let s = 0;
      this._polling && (s++, this.once("pollComplete", function() {
        --s || n();
      })), this.writable || (s++, this.once("drain", function() {
        --s || n();
      }));
    } else
      n();
  }
  /**
   * Starts polling cycle.
   *
   * @private
   */
  _poll() {
    this._polling = !0, this.doPoll(), this.emitReserved("poll");
  }
  /**
   * Overloads onData to detect payloads.
   *
   * @protected
   */
  onData(t) {
    const n = (s) => {
      if (this.readyState === "opening" && s.type === "open" && this.onOpen(), s.type === "close")
        return this.onClose({ description: "transport closed by the server" }), !1;
      this.onPacket(s);
    };
    jg(t, this.socket.binaryType).forEach(n), this.readyState !== "closed" && (this._polling = !1, this.emitReserved("pollComplete"), this.readyState === "open" && this._poll());
  }
  /**
   * For polling, send a close packet.
   *
   * @protected
   */
  doClose() {
    const t = () => {
      this.write([{ type: "close" }]);
    };
    this.readyState === "open" ? t() : this.once("open", t);
  }
  /**
   * Writes a packets payload.
   *
   * @param {Array} packets - data packets
   * @protected
   */
  write(t) {
    this.writable = !1, Wg(t, (n) => {
      this.doWrite(n, () => {
        this.writable = !0, this.emitReserved("drain");
      });
    });
  }
  /**
   * Generates uri for connection.
   *
   * @private
   */
  uri() {
    const t = this.opts.secure ? "https" : "http", n = this.query || {};
    return this.opts.timestampRequests !== !1 && (n[this.opts.timestampParam] = hf()), !this.supportsBinary && !n.sid && (n.b64 = 1), this.createUri(t, n);
  }
}
let df = !1;
try {
  df = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest();
} catch {
}
const r_ = df;
function i_() {
}
class o_ extends s_ {
  /**
   * XHR Polling constructor.
   *
   * @param {Object} opts
   * @package
   */
  constructor(t) {
    if (super(t), typeof location < "u") {
      const n = location.protocol === "https:";
      let s = location.port;
      s || (s = n ? "443" : "80"), this.xd = typeof location < "u" && t.hostname !== location.hostname || s !== t.port;
    }
  }
  /**
   * Sends data.
   *
   * @param {String} data - data to send.
   * @param {Function} fn - called upon flush.
   * @private
   */
  doWrite(t, n) {
    const s = this.request({
      method: "POST",
      data: t
    });
    s.on("success", n), s.on("error", (r, i) => {
      this.onError("xhr post error", r, i);
    });
  }
  /**
   * Starts a poll cycle.
   *
   * @private
   */
  doPoll() {
    const t = this.request();
    t.on("data", this.onData.bind(this)), t.on("error", (n, s) => {
      this.onError("xhr poll error", n, s);
    }), this.pollXhr = t;
  }
}
class En extends dt {
  /**
   * Request constructor
   *
   * @param {Object} options
   * @package
   */
  constructor(t, n, s) {
    super(), this.createRequest = t, co(this, s), this._opts = s, this._method = s.method || "GET", this._uri = n, this._data = s.data !== void 0 ? s.data : null, this._create();
  }
  /**
   * Creates the XHR object and sends the request.
   *
   * @private
   */
  _create() {
    var t;
    const n = ff(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
    n.xdomain = !!this._opts.xd;
    const s = this._xhr = this.createRequest(n);
    try {
      s.open(this._method, this._uri, !0);
      try {
        if (this._opts.extraHeaders) {
          s.setDisableHeaderCheck && s.setDisableHeaderCheck(!0);
          for (let r in this._opts.extraHeaders)
            this._opts.extraHeaders.hasOwnProperty(r) && s.setRequestHeader(r, this._opts.extraHeaders[r]);
        }
      } catch {
      }
      if (this._method === "POST")
        try {
          s.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
        } catch {
        }
      try {
        s.setRequestHeader("Accept", "*/*");
      } catch {
      }
      (t = this._opts.cookieJar) === null || t === void 0 || t.addCookies(s), "withCredentials" in s && (s.withCredentials = this._opts.withCredentials), this._opts.requestTimeout && (s.timeout = this._opts.requestTimeout), s.onreadystatechange = () => {
        var r;
        s.readyState === 3 && ((r = this._opts.cookieJar) === null || r === void 0 || r.parseCookies(
          // @ts-ignore
          s.getResponseHeader("set-cookie")
        )), s.readyState === 4 && (s.status === 200 || s.status === 1223 ? this._onLoad() : this.setTimeoutFn(() => {
          this._onError(typeof s.status == "number" ? s.status : 0);
        }, 0));
      }, s.send(this._data);
    } catch (r) {
      this.setTimeoutFn(() => {
        this._onError(r);
      }, 0);
      return;
    }
    typeof document < "u" && (this._index = En.requestsCount++, En.requests[this._index] = this);
  }
  /**
   * Called upon error.
   *
   * @private
   */
  _onError(t) {
    this.emitReserved("error", t, this._xhr), this._cleanup(!0);
  }
  /**
   * Cleans up house.
   *
   * @private
   */
  _cleanup(t) {
    if (!(typeof this._xhr > "u" || this._xhr === null)) {
      if (this._xhr.onreadystatechange = i_, t)
        try {
          this._xhr.abort();
        } catch {
        }
      typeof document < "u" && delete En.requests[this._index], this._xhr = null;
    }
  }
  /**
   * Called upon load.
   *
   * @private
   */
  _onLoad() {
    const t = this._xhr.responseText;
    t !== null && (this.emitReserved("data", t), this.emitReserved("success"), this._cleanup());
  }
  /**
   * Aborts the request.
   *
   * @package
   */
  abort() {
    this._cleanup();
  }
}
En.requestsCount = 0;
En.requests = {};
if (typeof document < "u") {
  if (typeof attachEvent == "function")
    attachEvent("onunload", kc);
  else if (typeof addEventListener == "function") {
    const e = "onpagehide" in rn ? "pagehide" : "unload";
    addEventListener(e, kc, !1);
  }
}
function kc() {
  for (let e in En.requests)
    En.requests.hasOwnProperty(e) && En.requests[e].abort();
}
const a_ = function() {
  const e = pf({
    xdomain: !1
  });
  return e && e.responseType !== null;
}();
class l_ extends o_ {
  constructor(t) {
    super(t);
    const n = t && t.forceBase64;
    this.supportsBinary = a_ && !n;
  }
  request(t = {}) {
    return Object.assign(t, { xd: this.xd }, this.opts), new En(pf, this.uri(), t);
  }
}
function pf(e) {
  const t = e.xdomain;
  try {
    if (typeof XMLHttpRequest < "u" && (!t || r_))
      return new XMLHttpRequest();
  } catch {
  }
  if (!t)
    try {
      return new rn[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
    } catch {
    }
}
const mf = typeof navigator < "u" && typeof navigator.product == "string" && navigator.product.toLowerCase() === "reactnative";
class c_ extends Ha {
  get name() {
    return "websocket";
  }
  doOpen() {
    const t = this.uri(), n = this.opts.protocols, s = mf ? {} : ff(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
    this.opts.extraHeaders && (s.headers = this.opts.extraHeaders);
    try {
      this.ws = this.createSocket(t, n, s);
    } catch (r) {
      return this.emitReserved("error", r);
    }
    this.ws.binaryType = this.socket.binaryType, this.addEventListeners();
  }
  /**
   * Adds event listeners to the socket
   *
   * @private
   */
  addEventListeners() {
    this.ws.onopen = () => {
      this.opts.autoUnref && this.ws._socket.unref(), this.onOpen();
    }, this.ws.onclose = (t) => this.onClose({
      description: "websocket connection closed",
      context: t
    }), this.ws.onmessage = (t) => this.onData(t.data), this.ws.onerror = (t) => this.onError("websocket error", t);
  }
  write(t) {
    this.writable = !1;
    for (let n = 0; n < t.length; n++) {
      const s = t[n], r = n === t.length - 1;
      Ua(s, this.supportsBinary, (i) => {
        try {
          this.doWrite(s, i);
        } catch {
        }
        r && lo(() => {
          this.writable = !0, this.emitReserved("drain");
        }, this.setTimeoutFn);
      });
    }
  }
  doClose() {
    typeof this.ws < "u" && (this.ws.onerror = () => {
    }, this.ws.close(), this.ws = null);
  }
  /**
   * Generates uri for connection.
   *
   * @private
   */
  uri() {
    const t = this.opts.secure ? "wss" : "ws", n = this.query || {};
    return this.opts.timestampRequests && (n[this.opts.timestampParam] = hf()), this.supportsBinary || (n.b64 = 1), this.createUri(t, n);
  }
}
const Ho = rn.WebSocket || rn.MozWebSocket;
class u_ extends c_ {
  createSocket(t, n, s) {
    return mf ? new Ho(t, n, s) : n ? new Ho(t, n) : new Ho(t);
  }
  doWrite(t, n) {
    this.ws.send(n);
  }
}
class f_ extends Ha {
  get name() {
    return "webtransport";
  }
  doOpen() {
    try {
      this._transport = new WebTransport(this.createUri("https"), this.opts.transportOptions[this.name]);
    } catch (t) {
      return this.emitReserved("error", t);
    }
    this._transport.closed.then(() => {
      this.onClose();
    }).catch((t) => {
      this.onError("webtransport error", t);
    }), this._transport.ready.then(() => {
      this._transport.createBidirectionalStream().then((t) => {
        const n = Vg(Number.MAX_SAFE_INTEGER, this.socket.binaryType), s = t.readable.pipeThrough(n).getReader(), r = qg();
        r.readable.pipeTo(t.writable), this._writer = r.writable.getWriter();
        const i = () => {
          s.read().then(({ done: a, value: l }) => {
            a || (this.onPacket(l), i());
          }).catch((a) => {
          });
        };
        i();
        const o = { type: "open" };
        this.query.sid && (o.data = `{"sid":"${this.query.sid}"}`), this._writer.write(o).then(() => this.onOpen());
      });
    });
  }
  write(t) {
    this.writable = !1;
    for (let n = 0; n < t.length; n++) {
      const s = t[n], r = n === t.length - 1;
      this._writer.write(s).then(() => {
        r && lo(() => {
          this.writable = !0, this.emitReserved("drain");
        }, this.setTimeoutFn);
      });
    }
  }
  doClose() {
    var t;
    (t = this._transport) === null || t === void 0 || t.close();
  }
}
const h_ = {
  websocket: u_,
  webtransport: f_,
  polling: l_
}, d_ = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/, p_ = [
  "source",
  "protocol",
  "authority",
  "userInfo",
  "user",
  "password",
  "host",
  "port",
  "relative",
  "path",
  "directory",
  "file",
  "query",
  "anchor"
];
function ua(e) {
  if (e.length > 8e3)
    throw "URI too long";
  const t = e, n = e.indexOf("["), s = e.indexOf("]");
  n != -1 && s != -1 && (e = e.substring(0, n) + e.substring(n, s).replace(/:/g, ";") + e.substring(s, e.length));
  let r = d_.exec(e || ""), i = {}, o = 14;
  for (; o--; )
    i[p_[o]] = r[o] || "";
  return n != -1 && s != -1 && (i.source = t, i.host = i.host.substring(1, i.host.length - 1).replace(/;/g, ":"), i.authority = i.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), i.ipv6uri = !0), i.pathNames = m_(i, i.path), i.queryKey = g_(i, i.query), i;
}
function m_(e, t) {
  const n = /\/{2,9}/g, s = t.replace(n, "/").split("/");
  return (t.slice(0, 1) == "/" || t.length === 0) && s.splice(0, 1), t.slice(-1) == "/" && s.splice(s.length - 1, 1), s;
}
function g_(e, t) {
  const n = {};
  return t.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function(s, r, i) {
    r && (n[r] = i);
  }), n;
}
const fa = typeof addEventListener == "function" && typeof removeEventListener == "function", xi = [];
fa && addEventListener("offline", () => {
  xi.forEach((e) => e());
}, !1);
class as extends dt {
  /**
   * Socket constructor.
   *
   * @param {String|Object} uri - uri or options
   * @param {Object} opts - options
   */
  constructor(t, n) {
    if (super(), this.binaryType = Gg, this.writeBuffer = [], this._prevBufferLen = 0, this._pingInterval = -1, this._pingTimeout = -1, this._maxPayload = -1, this._pingTimeoutTime = 1 / 0, t && typeof t == "object" && (n = t, t = null), t) {
      const s = ua(t);
      n.hostname = s.host, n.secure = s.protocol === "https" || s.protocol === "wss", n.port = s.port, s.query && (n.query = s.query);
    } else n.host && (n.hostname = ua(n.host).host);
    co(this, n), this.secure = n.secure != null ? n.secure : typeof location < "u" && location.protocol === "https:", n.hostname && !n.port && (n.port = this.secure ? "443" : "80"), this.hostname = n.hostname || (typeof location < "u" ? location.hostname : "localhost"), this.port = n.port || (typeof location < "u" && location.port ? location.port : this.secure ? "443" : "80"), this.transports = [], this._transportsByName = {}, n.transports.forEach((s) => {
      const r = s.prototype.name;
      this.transports.push(r), this._transportsByName[r] = s;
    }), this.opts = Object.assign({
      path: "/engine.io",
      agent: !1,
      withCredentials: !1,
      upgrade: !0,
      timestampParam: "t",
      rememberUpgrade: !1,
      addTrailingSlash: !0,
      rejectUnauthorized: !0,
      perMessageDeflate: {
        threshold: 1024
      },
      transportOptions: {},
      closeOnBeforeunload: !1
    }, n), this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : ""), typeof this.opts.query == "string" && (this.opts.query = t_(this.opts.query)), fa && (this.opts.closeOnBeforeunload && (this._beforeunloadEventListener = () => {
      this.transport && (this.transport.removeAllListeners(), this.transport.close());
    }, addEventListener("beforeunload", this._beforeunloadEventListener, !1)), this.hostname !== "localhost" && (this._offlineEventListener = () => {
      this._onClose("transport close", {
        description: "network connection lost"
      });
    }, xi.push(this._offlineEventListener))), this.opts.withCredentials && (this._cookieJar = void 0), this._open();
  }
  /**
   * Creates transport of the given type.
   *
   * @param {String} name - transport name
   * @return {Transport}
   * @private
   */
  createTransport(t) {
    const n = Object.assign({}, this.opts.query);
    n.EIO = uf, n.transport = t, this.id && (n.sid = this.id);
    const s = Object.assign({}, this.opts, {
      query: n,
      socket: this,
      hostname: this.hostname,
      secure: this.secure,
      port: this.port
    }, this.opts.transportOptions[t]);
    return new this._transportsByName[t](s);
  }
  /**
   * Initializes transport to use and starts probe.
   *
   * @private
   */
  _open() {
    if (this.transports.length === 0) {
      this.setTimeoutFn(() => {
        this.emitReserved("error", "No transports available");
      }, 0);
      return;
    }
    const t = this.opts.rememberUpgrade && as.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1 ? "websocket" : this.transports[0];
    this.readyState = "opening";
    const n = this.createTransport(t);
    n.open(), this.setTransport(n);
  }
  /**
   * Sets the current transport. Disables the existing one (if any).
   *
   * @private
   */
  setTransport(t) {
    this.transport && this.transport.removeAllListeners(), this.transport = t, t.on("drain", this._onDrain.bind(this)).on("packet", this._onPacket.bind(this)).on("error", this._onError.bind(this)).on("close", (n) => this._onClose("transport close", n));
  }
  /**
   * Called when connection is deemed open.
   *
   * @private
   */
  onOpen() {
    this.readyState = "open", as.priorWebsocketSuccess = this.transport.name === "websocket", this.emitReserved("open"), this.flush();
  }
  /**
   * Handles a packet.
   *
   * @private
   */
  _onPacket(t) {
    if (this.readyState === "opening" || this.readyState === "open" || this.readyState === "closing")
      switch (this.emitReserved("packet", t), this.emitReserved("heartbeat"), t.type) {
        case "open":
          this.onHandshake(JSON.parse(t.data));
          break;
        case "ping":
          this._sendPacket("pong"), this.emitReserved("ping"), this.emitReserved("pong"), this._resetPingTimeout();
          break;
        case "error":
          const n = new Error("server error");
          n.code = t.data, this._onError(n);
          break;
        case "message":
          this.emitReserved("data", t.data), this.emitReserved("message", t.data);
          break;
      }
  }
  /**
   * Called upon handshake completion.
   *
   * @param {Object} data - handshake obj
   * @private
   */
  onHandshake(t) {
    this.emitReserved("handshake", t), this.id = t.sid, this.transport.query.sid = t.sid, this._pingInterval = t.pingInterval, this._pingTimeout = t.pingTimeout, this._maxPayload = t.maxPayload, this.onOpen(), this.readyState !== "closed" && this._resetPingTimeout();
  }
  /**
   * Sets and resets ping timeout timer based on server pings.
   *
   * @private
   */
  _resetPingTimeout() {
    this.clearTimeoutFn(this._pingTimeoutTimer);
    const t = this._pingInterval + this._pingTimeout;
    this._pingTimeoutTime = Date.now() + t, this._pingTimeoutTimer = this.setTimeoutFn(() => {
      this._onClose("ping timeout");
    }, t), this.opts.autoUnref && this._pingTimeoutTimer.unref();
  }
  /**
   * Called on `drain` event
   *
   * @private
   */
  _onDrain() {
    this.writeBuffer.splice(0, this._prevBufferLen), this._prevBufferLen = 0, this.writeBuffer.length === 0 ? this.emitReserved("drain") : this.flush();
  }
  /**
   * Flush write buffers.
   *
   * @private
   */
  flush() {
    if (this.readyState !== "closed" && this.transport.writable && !this.upgrading && this.writeBuffer.length) {
      const t = this._getWritablePackets();
      this.transport.send(t), this._prevBufferLen = t.length, this.emitReserved("flush");
    }
  }
  /**
   * Ensure the encoded size of the writeBuffer is below the maxPayload value sent by the server (only for HTTP
   * long-polling)
   *
   * @private
   */
  _getWritablePackets() {
    if (!(this._maxPayload && this.transport.name === "polling" && this.writeBuffer.length > 1))
      return this.writeBuffer;
    let n = 1;
    for (let s = 0; s < this.writeBuffer.length; s++) {
      const r = this.writeBuffer[s].data;
      if (r && (n += Jg(r)), s > 0 && n > this._maxPayload)
        return this.writeBuffer.slice(0, s);
      n += 2;
    }
    return this.writeBuffer;
  }
  /**
   * Checks whether the heartbeat timer has expired but the socket has not yet been notified.
   *
   * Note: this method is private for now because it does not really fit the WebSocket API, but if we put it in the
   * `write()` method then the message would not be buffered by the Socket.IO client.
   *
   * @return {boolean}
   * @private
   */
  /* private */
  _hasPingExpired() {
    if (!this._pingTimeoutTime)
      return !0;
    const t = Date.now() > this._pingTimeoutTime;
    return t && (this._pingTimeoutTime = 0, lo(() => {
      this._onClose("ping timeout");
    }, this.setTimeoutFn)), t;
  }
  /**
   * Sends a message.
   *
   * @param {String} msg - message.
   * @param {Object} options.
   * @param {Function} fn - callback function.
   * @return {Socket} for chaining.
   */
  write(t, n, s) {
    return this._sendPacket("message", t, n, s), this;
  }
  /**
   * Sends a message. Alias of {@link Socket#write}.
   *
   * @param {String} msg - message.
   * @param {Object} options.
   * @param {Function} fn - callback function.
   * @return {Socket} for chaining.
   */
  send(t, n, s) {
    return this._sendPacket("message", t, n, s), this;
  }
  /**
   * Sends a packet.
   *
   * @param {String} type - packet type.
   * @param {String} data.
   * @param {Object} options.
   * @param {Function} fn - callback function.
   * @private
   */
  _sendPacket(t, n, s, r) {
    if (typeof n == "function" && (r = n, n = void 0), typeof s == "function" && (r = s, s = null), this.readyState === "closing" || this.readyState === "closed")
      return;
    s = s || {}, s.compress = s.compress !== !1;
    const i = {
      type: t,
      data: n,
      options: s
    };
    this.emitReserved("packetCreate", i), this.writeBuffer.push(i), r && this.once("flush", r), this.flush();
  }
  /**
   * Closes the connection.
   */
  close() {
    const t = () => {
      this._onClose("forced close"), this.transport.close();
    }, n = () => {
      this.off("upgrade", n), this.off("upgradeError", n), t();
    }, s = () => {
      this.once("upgrade", n), this.once("upgradeError", n);
    };
    return (this.readyState === "opening" || this.readyState === "open") && (this.readyState = "closing", this.writeBuffer.length ? this.once("drain", () => {
      this.upgrading ? s() : t();
    }) : this.upgrading ? s() : t()), this;
  }
  /**
   * Called upon transport error
   *
   * @private
   */
  _onError(t) {
    if (as.priorWebsocketSuccess = !1, this.opts.tryAllTransports && this.transports.length > 1 && this.readyState === "opening")
      return this.transports.shift(), this._open();
    this.emitReserved("error", t), this._onClose("transport error", t);
  }
  /**
   * Called upon transport close.
   *
   * @private
   */
  _onClose(t, n) {
    if (this.readyState === "opening" || this.readyState === "open" || this.readyState === "closing") {
      if (this.clearTimeoutFn(this._pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), fa && (this._beforeunloadEventListener && removeEventListener("beforeunload", this._beforeunloadEventListener, !1), this._offlineEventListener)) {
        const s = xi.indexOf(this._offlineEventListener);
        s !== -1 && xi.splice(s, 1);
      }
      this.readyState = "closed", this.id = null, this.emitReserved("close", t, n), this.writeBuffer = [], this._prevBufferLen = 0;
    }
  }
}
as.protocol = uf;
class __ extends as {
  constructor() {
    super(...arguments), this._upgrades = [];
  }
  onOpen() {
    if (super.onOpen(), this.readyState === "open" && this.opts.upgrade)
      for (let t = 0; t < this._upgrades.length; t++)
        this._probe(this._upgrades[t]);
  }
  /**
   * Probes a transport.
   *
   * @param {String} name - transport name
   * @private
   */
  _probe(t) {
    let n = this.createTransport(t), s = !1;
    as.priorWebsocketSuccess = !1;
    const r = () => {
      s || (n.send([{ type: "ping", data: "probe" }]), n.once("packet", (k) => {
        if (!s)
          if (k.type === "pong" && k.data === "probe") {
            if (this.upgrading = !0, this.emitReserved("upgrading", n), !n)
              return;
            as.priorWebsocketSuccess = n.name === "websocket", this.transport.pause(() => {
              s || this.readyState !== "closed" && (u(), this.setTransport(n), n.send([{ type: "upgrade" }]), this.emitReserved("upgrade", n), n = null, this.upgrading = !1, this.flush());
            });
          } else {
            const b = new Error("probe error");
            b.transport = n.name, this.emitReserved("upgradeError", b);
          }
      }));
    };
    function i() {
      s || (s = !0, u(), n.close(), n = null);
    }
    const o = (k) => {
      const b = new Error("probe error: " + k);
      b.transport = n.name, i(), this.emitReserved("upgradeError", b);
    };
    function a() {
      o("transport closed");
    }
    function l() {
      o("socket closed");
    }
    function h(k) {
      n && k.name !== n.name && i();
    }
    const u = () => {
      n.removeListener("open", r), n.removeListener("error", o), n.removeListener("close", a), this.off("close", l), this.off("upgrading", h);
    };
    n.once("open", r), n.once("error", o), n.once("close", a), this.once("close", l), this.once("upgrading", h), this._upgrades.indexOf("webtransport") !== -1 && t !== "webtransport" ? this.setTimeoutFn(() => {
      s || n.open();
    }, 200) : n.open();
  }
  onHandshake(t) {
    this._upgrades = this._filterUpgrades(t.upgrades), super.onHandshake(t);
  }
  /**
   * Filters upgrades, returning only those matching client transports.
   *
   * @param {Array} upgrades - server upgrades
   * @private
   */
  _filterUpgrades(t) {
    const n = [];
    for (let s = 0; s < t.length; s++)
      ~this.transports.indexOf(t[s]) && n.push(t[s]);
    return n;
  }
}
let y_ = class extends __ {
  constructor(t, n = {}) {
    const s = typeof t == "object", r = s ? { ...t } : { ...n };
    (!r.transports || r.transports && typeof r.transports[0] == "string") && (r.transports = (r.transports || ["polling", "websocket", "webtransport"]).map((i) => h_[i]).filter((i) => !!i)), super(s ? r : t, r);
  }
};
function b_(e, t = "", n) {
  let s = e;
  n = n || typeof location < "u" && location, e == null && (e = n.protocol + "//" + n.host), typeof e == "string" && (e.charAt(0) === "/" && (e.charAt(1) === "/" ? e = n.protocol + e : e = n.host + e), /^(https?|wss?):\/\//.test(e) || (typeof n < "u" ? e = n.protocol + "//" + e : e = "https://" + e), s = ua(e)), s.port || (/^(http|ws)$/.test(s.protocol) ? s.port = "80" : /^(http|ws)s$/.test(s.protocol) && (s.port = "443")), s.path = s.path || "/";
  const i = s.host.indexOf(":") !== -1 ? "[" + s.host + "]" : s.host;
  return s.id = s.protocol + "://" + i + ":" + s.port + t, s.href = s.protocol + "://" + i + (n && n.port === s.port ? "" : ":" + s.port), s;
}
const v_ = typeof ArrayBuffer == "function", w_ = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e.buffer instanceof ArrayBuffer, gf = Object.prototype.toString, k_ = typeof Blob == "function" || typeof Blob < "u" && gf.call(Blob) === "[object BlobConstructor]", T_ = typeof File == "function" || typeof File < "u" && gf.call(File) === "[object FileConstructor]";
function Wa(e) {
  return v_ && (e instanceof ArrayBuffer || w_(e)) || k_ && e instanceof Blob || T_ && e instanceof File;
}
function Ei(e, t) {
  if (!e || typeof e != "object")
    return !1;
  if (Array.isArray(e)) {
    for (let n = 0, s = e.length; n < s; n++)
      if (Ei(e[n]))
        return !0;
    return !1;
  }
  if (Wa(e))
    return !0;
  if (e.toJSON && typeof e.toJSON == "function" && arguments.length === 1)
    return Ei(e.toJSON(), !0);
  for (const n in e)
    if (Object.prototype.hasOwnProperty.call(e, n) && Ei(e[n]))
      return !0;
  return !1;
}
function A_(e) {
  const t = [], n = e.data, s = e;
  return s.data = Ci(n, t), s.attachments = t.length, { packet: s, buffers: t };
}
function Ci(e, t, n) {
  if (!e)
    return e;
  if (Wa(e)) {
    const s = { _placeholder: !0, num: t.length };
    return t.push(e), s;
  } else if (Array.isArray(e)) {
    const s = new Array(e.length);
    for (let r = 0; r < e.length; r++)
      s[r] = Ci(e[r], t);
    return s;
  } else if (typeof e == "object" && !(e instanceof Date)) {
    if (e.toJSON && typeof e.toJSON == "function" && !n)
      return Ci(e.toJSON(), t, !0);
    const s = {};
    for (const r in e)
      Object.prototype.hasOwnProperty.call(e, r) && (s[r] = Ci(e[r], t));
    return s;
  }
  return e;
}
function S_(e, t) {
  return e.data = ha(e.data, t), delete e.attachments, e;
}
function ha(e, t) {
  if (!e)
    return e;
  if (e && e._placeholder === !0) {
    if (typeof e.num == "number" && e.num >= 0 && e.num < t.length)
      return t[e.num];
    throw new Error("illegal attachments");
  } else if (Array.isArray(e))
    for (let n = 0; n < e.length; n++)
      e[n] = ha(e[n], t);
  else if (typeof e == "object")
    for (const n in e)
      Object.prototype.hasOwnProperty.call(e, n) && (e[n] = ha(e[n], t));
  return e;
}
const x_ = [
  "connect",
  // used on the client side
  "connect_error",
  // used on the client side
  "disconnect",
  // used on both sides
  "disconnecting",
  // used on the server side
  "newListener",
  // used by the Node.js EventEmitter
  "removeListener"
  // used by the Node.js EventEmitter
];
var Ne;
(function(e) {
  e[e.CONNECT = 0] = "CONNECT", e[e.DISCONNECT = 1] = "DISCONNECT", e[e.EVENT = 2] = "EVENT", e[e.ACK = 3] = "ACK", e[e.CONNECT_ERROR = 4] = "CONNECT_ERROR", e[e.BINARY_EVENT = 5] = "BINARY_EVENT", e[e.BINARY_ACK = 6] = "BINARY_ACK";
})(Ne || (Ne = {}));
class E_ {
  /**
   * Encoder constructor
   *
   * @param {function} replacer - custom replacer to pass down to JSON.parse
   */
  constructor(t) {
    this.replacer = t;
  }
  /**
   * Encode a packet as a single string if non-binary, or as a
   * buffer sequence, depending on packet type.
   *
   * @param {Object} obj - packet object
   */
  encode(t) {
    return (t.type === Ne.EVENT || t.type === Ne.ACK) && Ei(t) ? this.encodeAsBinary({
      type: t.type === Ne.EVENT ? Ne.BINARY_EVENT : Ne.BINARY_ACK,
      nsp: t.nsp,
      data: t.data,
      id: t.id
    }) : [this.encodeAsString(t)];
  }
  /**
   * Encode packet as string.
   */
  encodeAsString(t) {
    let n = "" + t.type;
    return (t.type === Ne.BINARY_EVENT || t.type === Ne.BINARY_ACK) && (n += t.attachments + "-"), t.nsp && t.nsp !== "/" && (n += t.nsp + ","), t.id != null && (n += t.id), t.data != null && (n += JSON.stringify(t.data, this.replacer)), n;
  }
  /**
   * Encode packet as 'buffer sequence' by removing blobs, and
   * deconstructing packet into object with placeholders and
   * a list of buffers.
   */
  encodeAsBinary(t) {
    const n = A_(t), s = this.encodeAsString(n.packet), r = n.buffers;
    return r.unshift(s), r;
  }
}
class ja extends dt {
  /**
   * Decoder constructor
   */
  constructor(t) {
    super(), this.opts = Object.assign({
      reviver: void 0,
      maxAttachments: 10
    }, typeof t == "function" ? { reviver: t } : t);
  }
  /**
   * Decodes an encoded packet string into packet JSON.
   *
   * @param {String} obj - encoded packet
   */
  add(t) {
    let n;
    if (typeof t == "string") {
      if (this.reconstructor)
        throw new Error("got plaintext data when reconstructing a packet");
      n = this.decodeString(t);
      const s = n.type === Ne.BINARY_EVENT;
      s || n.type === Ne.BINARY_ACK ? (n.type = s ? Ne.EVENT : Ne.ACK, this.reconstructor = new C_(n)) : super.emitReserved("decoded", n);
    } else if (Wa(t) || t.base64)
      if (this.reconstructor)
        n = this.reconstructor.takeBinaryData(t), n && (this.reconstructor = null, super.emitReserved("decoded", n));
      else
        throw new Error("got binary data when not reconstructing a packet");
    else
      throw new Error("Unknown type: " + t);
  }
  /**
   * Decode a packet String (JSON data)
   *
   * @param {String} str
   * @return {Object} packet
   */
  decodeString(t) {
    let n = 0;
    const s = {
      type: Number(t.charAt(0))
    };
    if (Ne[s.type] === void 0)
      throw new Error("unknown packet type " + s.type);
    if (s.type === Ne.BINARY_EVENT || s.type === Ne.BINARY_ACK) {
      const i = n + 1;
      for (; t.charAt(++n) !== "-" && n != t.length; )
        ;
      const o = t.substring(i, n);
      if (o != Number(o) || t.charAt(n) !== "-")
        throw new Error("Illegal attachments");
      const a = Number(o);
      if (!R_(a) || a < 1)
        throw new Error("Illegal attachments");
      if (a > this.opts.maxAttachments)
        throw new Error("too many attachments");
      s.attachments = a;
    }
    if (t.charAt(n + 1) === "/") {
      const i = n + 1;
      for (; ++n && !(t.charAt(n) === "," || n === t.length); )
        ;
      s.nsp = t.substring(i, n);
    } else
      s.nsp = "/";
    const r = t.charAt(n + 1);
    if (r !== "" && Number(r) == r) {
      const i = n + 1;
      for (; ++n; ) {
        const o = t.charAt(n);
        if (o == null || Number(o) != o) {
          --n;
          break;
        }
        if (n === t.length)
          break;
      }
      s.id = Number(t.substring(i, n + 1));
    }
    if (t.charAt(++n)) {
      const i = this.tryParse(t.substr(n));
      if (ja.isPayloadValid(s.type, i))
        s.data = i;
      else
        throw new Error("invalid payload");
    }
    return s;
  }
  tryParse(t) {
    try {
      return JSON.parse(t, this.opts.reviver);
    } catch {
      return !1;
    }
  }
  static isPayloadValid(t, n) {
    switch (t) {
      case Ne.CONNECT:
        return Tc(n);
      case Ne.DISCONNECT:
        return n === void 0;
      case Ne.CONNECT_ERROR:
        return typeof n == "string" || Tc(n);
      case Ne.EVENT:
      case Ne.BINARY_EVENT:
        return Array.isArray(n) && (typeof n[0] == "number" || typeof n[0] == "string" && x_.indexOf(n[0]) === -1);
      case Ne.ACK:
      case Ne.BINARY_ACK:
        return Array.isArray(n);
    }
  }
  /**
   * Deallocates a parser's resources
   */
  destroy() {
    this.reconstructor && (this.reconstructor.finishedReconstruction(), this.reconstructor = null);
  }
}
class C_ {
  constructor(t) {
    this.packet = t, this.buffers = [], this.reconPack = t;
  }
  /**
   * Method to be called when binary data received from connection
   * after a BINARY_EVENT packet.
   *
   * @param {Buffer | ArrayBuffer} binData - the raw binary data received
   * @return {null | Object} returns null if more binary data is expected or
   *   a reconstructed packet object if all buffers have been received.
   */
  takeBinaryData(t) {
    if (this.buffers.push(t), this.buffers.length === this.reconPack.attachments) {
      const n = S_(this.reconPack, this.buffers);
      return this.finishedReconstruction(), n;
    }
    return null;
  }
  /**
   * Cleans up binary packet reconstruction variables.
   */
  finishedReconstruction() {
    this.reconPack = null, this.buffers = [];
  }
}
const R_ = Number.isInteger || function(e) {
  return typeof e == "number" && isFinite(e) && Math.floor(e) === e;
};
function Tc(e) {
  return Object.prototype.toString.call(e) === "[object Object]";
}
const I_ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Decoder: ja,
  Encoder: E_,
  get PacketType() {
    return Ne;
  }
}, Symbol.toStringTag, { value: "Module" }));
function un(e, t, n) {
  return e.on(t, n), function() {
    e.off(t, n);
  };
}
const O_ = Object.freeze({
  connect: 1,
  connect_error: 1,
  disconnect: 1,
  disconnecting: 1,
  // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
  newListener: 1,
  removeListener: 1
});
class _f extends dt {
  /**
   * `Socket` constructor.
   */
  constructor(t, n, s) {
    super(), this.connected = !1, this.recovered = !1, this.receiveBuffer = [], this.sendBuffer = [], this._queue = [], this._queueSeq = 0, this.ids = 0, this.acks = {}, this.flags = {}, this.io = t, this.nsp = n, s && s.auth && (this.auth = s.auth), this._opts = Object.assign({}, s), this.io._autoConnect && this.open();
  }
  /**
   * Whether the socket is currently disconnected
   *
   * @example
   * const socket = io();
   *
   * socket.on("connect", () => {
   *   console.log(socket.disconnected); // false
   * });
   *
   * socket.on("disconnect", () => {
   *   console.log(socket.disconnected); // true
   * });
   */
  get disconnected() {
    return !this.connected;
  }
  /**
   * Subscribe to open, close and packet events
   *
   * @private
   */
  subEvents() {
    if (this.subs)
      return;
    const t = this.io;
    this.subs = [
      un(t, "open", this.onopen.bind(this)),
      un(t, "packet", this.onpacket.bind(this)),
      un(t, "error", this.onerror.bind(this)),
      un(t, "close", this.onclose.bind(this))
    ];
  }
  /**
   * Whether the Socket will try to reconnect when its Manager connects or reconnects.
   *
   * @example
   * const socket = io();
   *
   * console.log(socket.active); // true
   *
   * socket.on("disconnect", (reason) => {
   *   if (reason === "io server disconnect") {
   *     // the disconnection was initiated by the server, you need to manually reconnect
   *     console.log(socket.active); // false
   *   }
   *   // else the socket will automatically try to reconnect
   *   console.log(socket.active); // true
   * });
   */
  get active() {
    return !!this.subs;
  }
  /**
   * "Opens" the socket.
   *
   * @example
   * const socket = io({
   *   autoConnect: false
   * });
   *
   * socket.connect();
   */
  connect() {
    return this.connected ? this : (this.subEvents(), this.io._reconnecting || this.io.open(), this.io._readyState === "open" && this.onopen(), this);
  }
  /**
   * Alias for {@link connect()}.
   */
  open() {
    return this.connect();
  }
  /**
   * Sends a `message` event.
   *
   * This method mimics the WebSocket.send() method.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send
   *
   * @example
   * socket.send("hello");
   *
   * // this is equivalent to
   * socket.emit("message", "hello");
   *
   * @return self
   */
  send(...t) {
    return t.unshift("message"), this.emit.apply(this, t), this;
  }
  /**
   * Override `emit`.
   * If the event is in `events`, it's emitted normally.
   *
   * @example
   * socket.emit("hello", "world");
   *
   * // all serializable datastructures are supported (no need to call JSON.stringify)
   * socket.emit("hello", 1, "2", { 3: ["4"], 5: Uint8Array.from([6]) });
   *
   * // with an acknowledgement from the server
   * socket.emit("hello", "world", (val) => {
   *   // ...
   * });
   *
   * @return self
   */
  emit(t, ...n) {
    var s, r, i;
    if (O_.hasOwnProperty(t))
      throw new Error('"' + t.toString() + '" is a reserved event name');
    if (n.unshift(t), this._opts.retries && !this.flags.fromQueue && !this.flags.volatile)
      return this._addToQueue(n), this;
    const o = {
      type: Ne.EVENT,
      data: n
    };
    if (o.options = {}, o.options.compress = this.flags.compress !== !1, typeof n[n.length - 1] == "function") {
      const u = this.ids++, k = n.pop();
      this._registerAckCallback(u, k), o.id = u;
    }
    const a = (r = (s = this.io.engine) === null || s === void 0 ? void 0 : s.transport) === null || r === void 0 ? void 0 : r.writable, l = this.connected && !(!((i = this.io.engine) === null || i === void 0) && i._hasPingExpired());
    return this.flags.volatile && !a || (l ? (this.notifyOutgoingListeners(o), this.packet(o)) : this.sendBuffer.push(o)), this.flags = {}, this;
  }
  /**
   * @private
   */
  _registerAckCallback(t, n) {
    var s;
    const r = (s = this.flags.timeout) !== null && s !== void 0 ? s : this._opts.ackTimeout;
    if (r === void 0) {
      this.acks[t] = n;
      return;
    }
    const i = this.io.setTimeoutFn(() => {
      delete this.acks[t];
      for (let a = 0; a < this.sendBuffer.length; a++)
        this.sendBuffer[a].id === t && this.sendBuffer.splice(a, 1);
      n.call(this, new Error("operation has timed out"));
    }, r), o = (...a) => {
      this.io.clearTimeoutFn(i), n.apply(this, a);
    };
    o.withError = !0, this.acks[t] = o;
  }
  /**
   * Emits an event and waits for an acknowledgement
   *
   * @example
   * // without timeout
   * const response = await socket.emitWithAck("hello", "world");
   *
   * // with a specific timeout
   * try {
   *   const response = await socket.timeout(1000).emitWithAck("hello", "world");
   * } catch (err) {
   *   // the server did not acknowledge the event in the given delay
   * }
   *
   * @return a Promise that will be fulfilled when the server acknowledges the event
   */
  emitWithAck(t, ...n) {
    return new Promise((s, r) => {
      const i = (o, a) => o ? r(o) : s(a);
      i.withError = !0, n.push(i), this.emit(t, ...n);
    });
  }
  /**
   * Add the packet to the queue.
   * @param args
   * @private
   */
  _addToQueue(t) {
    let n;
    typeof t[t.length - 1] == "function" && (n = t.pop());
    const s = {
      id: this._queueSeq++,
      tryCount: 0,
      pending: !1,
      args: t,
      flags: Object.assign({ fromQueue: !0 }, this.flags)
    };
    t.push((r, ...i) => (this._queue[0], r !== null ? s.tryCount > this._opts.retries && (this._queue.shift(), n && n(r)) : (this._queue.shift(), n && n(null, ...i)), s.pending = !1, this._drainQueue())), this._queue.push(s), this._drainQueue();
  }
  /**
   * Send the first packet of the queue, and wait for an acknowledgement from the server.
   * @param force - whether to resend a packet that has not been acknowledged yet
   *
   * @private
   */
  _drainQueue(t = !1) {
    if (!this.connected || this._queue.length === 0)
      return;
    const n = this._queue[0];
    n.pending && !t || (n.pending = !0, n.tryCount++, this.flags = n.flags, this.emit.apply(this, n.args));
  }
  /**
   * Sends a packet.
   *
   * @param packet
   * @private
   */
  packet(t) {
    t.nsp = this.nsp, this.io._packet(t);
  }
  /**
   * Called upon engine `open`.
   *
   * @private
   */
  onopen() {
    typeof this.auth == "function" ? this.auth((t) => {
      this._sendConnectPacket(t);
    }) : this._sendConnectPacket(this.auth);
  }
  /**
   * Sends a CONNECT packet to initiate the Socket.IO session.
   *
   * @param data
   * @private
   */
  _sendConnectPacket(t) {
    this.packet({
      type: Ne.CONNECT,
      data: this._pid ? Object.assign({ pid: this._pid, offset: this._lastOffset }, t) : t
    });
  }
  /**
   * Called upon engine or manager `error`.
   *
   * @param err
   * @private
   */
  onerror(t) {
    this.connected || this.emitReserved("connect_error", t);
  }
  /**
   * Called upon engine `close`.
   *
   * @param reason
   * @param description
   * @private
   */
  onclose(t, n) {
    this.connected = !1, delete this.id, this.emitReserved("disconnect", t, n), this._clearAcks();
  }
  /**
   * Clears the acknowledgement handlers upon disconnection, since the client will never receive an acknowledgement from
   * the server.
   *
   * @private
   */
  _clearAcks() {
    Object.keys(this.acks).forEach((t) => {
      if (!this.sendBuffer.some((s) => String(s.id) === t)) {
        const s = this.acks[t];
        delete this.acks[t], s.withError && s.call(this, new Error("socket has been disconnected"));
      }
    });
  }
  /**
   * Called with socket packet.
   *
   * @param packet
   * @private
   */
  onpacket(t) {
    if (t.nsp === this.nsp)
      switch (t.type) {
        case Ne.CONNECT:
          t.data && t.data.sid ? this.onconnect(t.data.sid, t.data.pid) : this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
          break;
        case Ne.EVENT:
        case Ne.BINARY_EVENT:
          this.onevent(t);
          break;
        case Ne.ACK:
        case Ne.BINARY_ACK:
          this.onack(t);
          break;
        case Ne.DISCONNECT:
          this.ondisconnect();
          break;
        case Ne.CONNECT_ERROR:
          this.destroy();
          const s = new Error(t.data.message);
          s.data = t.data.data, this.emitReserved("connect_error", s);
          break;
      }
  }
  /**
   * Called upon a server event.
   *
   * @param packet
   * @private
   */
  onevent(t) {
    const n = t.data || [];
    t.id != null && n.push(this.ack(t.id)), this.connected ? this.emitEvent(n) : this.receiveBuffer.push(Object.freeze(n));
  }
  emitEvent(t) {
    if (this._anyListeners && this._anyListeners.length) {
      const n = this._anyListeners.slice();
      for (const s of n)
        s.apply(this, t);
    }
    super.emit.apply(this, t), this._pid && t.length && typeof t[t.length - 1] == "string" && (this._lastOffset = t[t.length - 1]);
  }
  /**
   * Produces an ack callback to emit with an event.
   *
   * @private
   */
  ack(t) {
    const n = this;
    let s = !1;
    return function(...r) {
      s || (s = !0, n.packet({
        type: Ne.ACK,
        id: t,
        data: r
      }));
    };
  }
  /**
   * Called upon a server acknowledgement.
   *
   * @param packet
   * @private
   */
  onack(t) {
    const n = this.acks[t.id];
    typeof n == "function" && (delete this.acks[t.id], n.withError && t.data.unshift(null), n.apply(this, t.data));
  }
  /**
   * Called upon server connect.
   *
   * @private
   */
  onconnect(t, n) {
    this.id = t, this.recovered = n && this._pid === n, this._pid = n, this.connected = !0, this.emitBuffered(), this._drainQueue(!0), this.emitReserved("connect");
  }
  /**
   * Emit buffered events (received and emitted).
   *
   * @private
   */
  emitBuffered() {
    this.receiveBuffer.forEach((t) => this.emitEvent(t)), this.receiveBuffer = [], this.sendBuffer.forEach((t) => {
      this.notifyOutgoingListeners(t), this.packet(t);
    }), this.sendBuffer = [];
  }
  /**
   * Called upon server disconnect.
   *
   * @private
   */
  ondisconnect() {
    this.destroy(), this.onclose("io server disconnect");
  }
  /**
   * Called upon forced client/server side disconnections,
   * this method ensures the manager stops tracking us and
   * that reconnections don't get triggered for this.
   *
   * @private
   */
  destroy() {
    this.subs && (this.subs.forEach((t) => t()), this.subs = void 0), this.io._destroy(this);
  }
  /**
   * Disconnects the socket manually. In that case, the socket will not try to reconnect.
   *
   * If this is the last active Socket instance of the {@link Manager}, the low-level connection will be closed.
   *
   * @example
   * const socket = io();
   *
   * socket.on("disconnect", (reason) => {
   *   // console.log(reason); prints "io client disconnect"
   * });
   *
   * socket.disconnect();
   *
   * @return self
   */
  disconnect() {
    return this.connected && this.packet({ type: Ne.DISCONNECT }), this.destroy(), this.connected && this.onclose("io client disconnect"), this;
  }
  /**
   * Alias for {@link disconnect()}.
   *
   * @return self
   */
  close() {
    return this.disconnect();
  }
  /**
   * Sets the compress flag.
   *
   * @example
   * socket.compress(false).emit("hello");
   *
   * @param compress - if `true`, compresses the sending data
   * @return self
   */
  compress(t) {
    return this.flags.compress = t, this;
  }
  /**
   * Sets a modifier for a subsequent event emission that the event message will be dropped when this socket is not
   * ready to send messages.
   *
   * @example
   * socket.volatile.emit("hello"); // the server may or may not receive it
   *
   * @returns self
   */
  get volatile() {
    return this.flags.volatile = !0, this;
  }
  /**
   * Sets a modifier for a subsequent event emission that the callback will be called with an error when the
   * given number of milliseconds have elapsed without an acknowledgement from the server:
   *
   * @example
   * socket.timeout(5000).emit("my-event", (err) => {
   *   if (err) {
   *     // the server did not acknowledge the event in the given delay
   *   }
   * });
   *
   * @returns self
   */
  timeout(t) {
    return this.flags.timeout = t, this;
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback.
   *
   * @example
   * socket.onAny((event, ...args) => {
   *   console.log(`got ${event}`);
   * });
   *
   * @param listener
   */
  onAny(t) {
    return this._anyListeners = this._anyListeners || [], this._anyListeners.push(t), this;
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback. The listener is added to the beginning of the listeners array.
   *
   * @example
   * socket.prependAny((event, ...args) => {
   *   console.log(`got event ${event}`);
   * });
   *
   * @param listener
   */
  prependAny(t) {
    return this._anyListeners = this._anyListeners || [], this._anyListeners.unshift(t), this;
  }
  /**
   * Removes the listener that will be fired when any event is emitted.
   *
   * @example
   * const catchAllListener = (event, ...args) => {
   *   console.log(`got event ${event}`);
   * }
   *
   * socket.onAny(catchAllListener);
   *
   * // remove a specific listener
   * socket.offAny(catchAllListener);
   *
   * // or remove all listeners
   * socket.offAny();
   *
   * @param listener
   */
  offAny(t) {
    if (!this._anyListeners)
      return this;
    if (t) {
      const n = this._anyListeners;
      for (let s = 0; s < n.length; s++)
        if (t === n[s])
          return n.splice(s, 1), this;
    } else
      this._anyListeners = [];
    return this;
  }
  /**
   * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
   * e.g. to remove listeners.
   */
  listenersAny() {
    return this._anyListeners || [];
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback.
   *
   * Note: acknowledgements sent to the server are not included.
   *
   * @example
   * socket.onAnyOutgoing((event, ...args) => {
   *   console.log(`sent event ${event}`);
   * });
   *
   * @param listener
   */
  onAnyOutgoing(t) {
    return this._anyOutgoingListeners = this._anyOutgoingListeners || [], this._anyOutgoingListeners.push(t), this;
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback. The listener is added to the beginning of the listeners array.
   *
   * Note: acknowledgements sent to the server are not included.
   *
   * @example
   * socket.prependAnyOutgoing((event, ...args) => {
   *   console.log(`sent event ${event}`);
   * });
   *
   * @param listener
   */
  prependAnyOutgoing(t) {
    return this._anyOutgoingListeners = this._anyOutgoingListeners || [], this._anyOutgoingListeners.unshift(t), this;
  }
  /**
   * Removes the listener that will be fired when any event is emitted.
   *
   * @example
   * const catchAllListener = (event, ...args) => {
   *   console.log(`sent event ${event}`);
   * }
   *
   * socket.onAnyOutgoing(catchAllListener);
   *
   * // remove a specific listener
   * socket.offAnyOutgoing(catchAllListener);
   *
   * // or remove all listeners
   * socket.offAnyOutgoing();
   *
   * @param [listener] - the catch-all listener (optional)
   */
  offAnyOutgoing(t) {
    if (!this._anyOutgoingListeners)
      return this;
    if (t) {
      const n = this._anyOutgoingListeners;
      for (let s = 0; s < n.length; s++)
        if (t === n[s])
          return n.splice(s, 1), this;
    } else
      this._anyOutgoingListeners = [];
    return this;
  }
  /**
   * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
   * e.g. to remove listeners.
   */
  listenersAnyOutgoing() {
    return this._anyOutgoingListeners || [];
  }
  /**
   * Notify the listeners for each packet sent
   *
   * @param packet
   *
   * @private
   */
  notifyOutgoingListeners(t) {
    if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
      const n = this._anyOutgoingListeners.slice();
      for (const s of n)
        s.apply(this, t.data);
    }
  }
}
function ar(e) {
  e = e || {}, this.ms = e.min || 100, this.max = e.max || 1e4, this.factor = e.factor || 2, this.jitter = e.jitter > 0 && e.jitter <= 1 ? e.jitter : 0, this.attempts = 0;
}
ar.prototype.duration = function() {
  var e = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var t = Math.random(), n = Math.floor(t * this.jitter * e);
    e = (Math.floor(t * 10) & 1) == 0 ? e - n : e + n;
  }
  return Math.min(e, this.max) | 0;
};
ar.prototype.reset = function() {
  this.attempts = 0;
};
ar.prototype.setMin = function(e) {
  this.ms = e;
};
ar.prototype.setMax = function(e) {
  this.max = e;
};
ar.prototype.setJitter = function(e) {
  this.jitter = e;
};
class da extends dt {
  constructor(t, n) {
    var s;
    super(), this.nsps = {}, this.subs = [], t && typeof t == "object" && (n = t, t = void 0), n = n || {}, n.path = n.path || "/socket.io", this.opts = n, co(this, n), this.reconnection(n.reconnection !== !1), this.reconnectionAttempts(n.reconnectionAttempts || 1 / 0), this.reconnectionDelay(n.reconnectionDelay || 1e3), this.reconnectionDelayMax(n.reconnectionDelayMax || 5e3), this.randomizationFactor((s = n.randomizationFactor) !== null && s !== void 0 ? s : 0.5), this.backoff = new ar({
      min: this.reconnectionDelay(),
      max: this.reconnectionDelayMax(),
      jitter: this.randomizationFactor()
    }), this.timeout(n.timeout == null ? 2e4 : n.timeout), this._readyState = "closed", this.uri = t;
    const r = n.parser || I_;
    this.encoder = new r.Encoder(), this.decoder = new r.Decoder(), this._autoConnect = n.autoConnect !== !1, this._autoConnect && this.open();
  }
  reconnection(t) {
    return arguments.length ? (this._reconnection = !!t, t || (this.skipReconnect = !0), this) : this._reconnection;
  }
  reconnectionAttempts(t) {
    return t === void 0 ? this._reconnectionAttempts : (this._reconnectionAttempts = t, this);
  }
  reconnectionDelay(t) {
    var n;
    return t === void 0 ? this._reconnectionDelay : (this._reconnectionDelay = t, (n = this.backoff) === null || n === void 0 || n.setMin(t), this);
  }
  randomizationFactor(t) {
    var n;
    return t === void 0 ? this._randomizationFactor : (this._randomizationFactor = t, (n = this.backoff) === null || n === void 0 || n.setJitter(t), this);
  }
  reconnectionDelayMax(t) {
    var n;
    return t === void 0 ? this._reconnectionDelayMax : (this._reconnectionDelayMax = t, (n = this.backoff) === null || n === void 0 || n.setMax(t), this);
  }
  timeout(t) {
    return arguments.length ? (this._timeout = t, this) : this._timeout;
  }
  /**
   * Starts trying to reconnect if reconnection is enabled and we have not
   * started reconnecting yet
   *
   * @private
   */
  maybeReconnectOnOpen() {
    !this._reconnecting && this._reconnection && this.backoff.attempts === 0 && this.reconnect();
  }
  /**
   * Sets the current transport `socket`.
   *
   * @param {Function} fn - optional, callback
   * @return self
   * @public
   */
  open(t) {
    if (~this._readyState.indexOf("open"))
      return this;
    this.engine = new y_(this.uri, this.opts);
    const n = this.engine, s = this;
    this._readyState = "opening", this.skipReconnect = !1;
    const r = un(n, "open", function() {
      s.onopen(), t && t();
    }), i = (a) => {
      this.cleanup(), this._readyState = "closed", this.emitReserved("error", a), t ? t(a) : this.maybeReconnectOnOpen();
    }, o = un(n, "error", i);
    if (this._timeout !== !1) {
      const a = this._timeout, l = this.setTimeoutFn(() => {
        r(), i(new Error("timeout")), n.close();
      }, a);
      this.opts.autoUnref && l.unref(), this.subs.push(() => {
        this.clearTimeoutFn(l);
      });
    }
    return this.subs.push(r), this.subs.push(o), this;
  }
  /**
   * Alias for open()
   *
   * @return self
   * @public
   */
  connect(t) {
    return this.open(t);
  }
  /**
   * Called upon transport open.
   *
   * @private
   */
  onopen() {
    this.cleanup(), this._readyState = "open", this.emitReserved("open");
    const t = this.engine;
    this.subs.push(
      un(t, "ping", this.onping.bind(this)),
      un(t, "data", this.ondata.bind(this)),
      un(t, "error", this.onerror.bind(this)),
      un(t, "close", this.onclose.bind(this)),
      // @ts-ignore
      un(this.decoder, "decoded", this.ondecoded.bind(this))
    );
  }
  /**
   * Called upon a ping.
   *
   * @private
   */
  onping() {
    this.emitReserved("ping");
  }
  /**
   * Called with data.
   *
   * @private
   */
  ondata(t) {
    try {
      this.decoder.add(t);
    } catch (n) {
      this.onclose("parse error", n);
    }
  }
  /**
   * Called when parser fully decodes a packet.
   *
   * @private
   */
  ondecoded(t) {
    lo(() => {
      this.emitReserved("packet", t);
    }, this.setTimeoutFn);
  }
  /**
   * Called upon socket error.
   *
   * @private
   */
  onerror(t) {
    this.emitReserved("error", t);
  }
  /**
   * Creates a new socket for the given `nsp`.
   *
   * @return {Socket}
   * @public
   */
  socket(t, n) {
    let s = this.nsps[t];
    return s ? this._autoConnect && !s.active && s.connect() : (s = new _f(this, t, n), this.nsps[t] = s), s;
  }
  /**
   * Called upon a socket close.
   *
   * @param socket
   * @private
   */
  _destroy(t) {
    const n = Object.keys(this.nsps);
    for (const s of n)
      if (this.nsps[s].active)
        return;
    this._close();
  }
  /**
   * Writes a packet.
   *
   * @param packet
   * @private
   */
  _packet(t) {
    const n = this.encoder.encode(t);
    for (let s = 0; s < n.length; s++)
      this.engine.write(n[s], t.options);
  }
  /**
   * Clean up transport subscriptions and packet buffer.
   *
   * @private
   */
  cleanup() {
    this.subs.forEach((t) => t()), this.subs.length = 0, this.decoder.destroy();
  }
  /**
   * Close the current socket.
   *
   * @private
   */
  _close() {
    this.skipReconnect = !0, this._reconnecting = !1, this.onclose("forced close");
  }
  /**
   * Alias for close()
   *
   * @private
   */
  disconnect() {
    return this._close();
  }
  /**
   * Called when:
   *
   * - the low-level engine is closed
   * - the parser encountered a badly formatted packet
   * - all sockets are disconnected
   *
   * @private
   */
  onclose(t, n) {
    var s;
    this.cleanup(), (s = this.engine) === null || s === void 0 || s.close(), this.backoff.reset(), this._readyState = "closed", this.emitReserved("close", t, n), this._reconnection && !this.skipReconnect && this.reconnect();
  }
  /**
   * Attempt a reconnection.
   *
   * @private
   */
  reconnect() {
    if (this._reconnecting || this.skipReconnect)
      return this;
    const t = this;
    if (this.backoff.attempts >= this._reconnectionAttempts)
      this.backoff.reset(), this.emitReserved("reconnect_failed"), this._reconnecting = !1;
    else {
      const n = this.backoff.duration();
      this._reconnecting = !0;
      const s = this.setTimeoutFn(() => {
        t.skipReconnect || (this.emitReserved("reconnect_attempt", t.backoff.attempts), !t.skipReconnect && t.open((r) => {
          r ? (t._reconnecting = !1, t.reconnect(), this.emitReserved("reconnect_error", r)) : t.onreconnect();
        }));
      }, n);
      this.opts.autoUnref && s.unref(), this.subs.push(() => {
        this.clearTimeoutFn(s);
      });
    }
  }
  /**
   * Called upon successful reconnect.
   *
   * @private
   */
  onreconnect() {
    const t = this.backoff.attempts;
    this._reconnecting = !1, this.backoff.reset(), this.emitReserved("reconnect", t);
  }
}
const Er = {};
function Ri(e, t) {
  typeof e == "object" && (t = e, e = void 0), t = t || {};
  const n = b_(e, t.path || "/socket.io"), s = n.source, r = n.id, i = n.path, o = Er[r] && i in Er[r].nsps, a = t.forceNew || t["force new connection"] || t.multiplex === !1 || o;
  let l;
  return a ? l = new da(s, t) : (Er[r] || (Er[r] = new da(s, t)), l = Er[r]), n.query && !t.query && (t.query = n.queryKey), l.socket(n.path, t);
}
Object.assign(Ri, {
  Manager: da,
  Socket: _f,
  io: Ri,
  connect: Ri
});
const L_ = 5e3;
function N_() {
  const e = oe([]), t = oe(!1), n = oe(""), s = oe(!1), r = oe(!1), i = oe(!1), o = oe("connecting"), a = oe(0), l = 5, h = oe({}), u = oe(null), k = oe(""), b = [];
  let I = null;
  const B = 6e4, H = () => {
    t.value = !1, I && (clearTimeout(I), I = null);
  }, he = () => {
    t.value = !0, I && clearTimeout(I), I = setTimeout(H, B);
  };
  let R = null;
  const le = 1e3, de = 15e3;
  let C = null;
  const v = /* @__PURE__ */ new Set(["ai_config_missing", ...Lu]);
  let q = !1;
  const K = oe(null), ae = () => {
    C && (clearTimeout(C), C = null);
  }, Oe = () => {
    if (C || q) return;
    const F = Math.min(
      le * 2 ** Math.max(0, a.value - 1),
      de
    );
    C = setTimeout(() => {
      C = null, R == null || R.connect();
    }, F);
  };
  let _e = null, Le = null, ve = null, Ve = null, Fe = null, et = !1, ce = null, ye, pe, Ye;
  const Xe = (F) => {
    var U;
    return (U = Ai(F ?? null)) == null ? void 0 : U.sub;
  }, st = (F) => {
    ye = F, F && R != null && R.connected && R.emit("refresh_token", { conversation_token: F });
  }, Ke = (F) => {
    pe = F;
  }, gt = () => {
    var c;
    const F = ye || (ji() ? null : Wi().read()), U = {};
    F && (U.conversation_token = F), pe && (U.widget_id = pe);
    try {
      U.page_url = tf() || (window.parent !== window && ((c = window.parent.location) != null && c.href) ? window.parent.location.href : document.referrer || window.location.href);
    } catch {
      U.page_url = document.referrer || "";
    }
    return U;
  }, hn = (F) => {
    R = Ri(`${Os.WS_URL}/widget`, {
      transports: ["websocket"],
      reconnection: !0,
      // Keep trying. The old cap of 5 attempts was ~15s of backoff, so a
      // backend restart or a laptop waking from sleep left the widget dead
      // until the visitor reloaded the page.
      reconnectionAttempts: 1 / 0,
      reconnectionDelay: 1e3,
      reconnectionDelayMax: 15e3,
      // Called before every attempt, so a token refreshed since the socket
      // was created is the one that gets sent.
      auth: (U) => U(gt())
    }), R.on("connect", () => {
      Ye = Xe(gt().conversation_token), o.value = "connected", ae(), a.value = 0;
    }), R.on("bot_typing", () => {
      he();
    }), R.on("disconnect", () => {
      H(), o.value === "connected" && (console.log("Socket disconnected, setting connection status to connecting"), o.value = "connecting");
    }), R.on("connect_error", (U) => {
      var _;
      const c = (_ = U == null ? void 0 : U.data) == null ? void 0 : _.type;
      if (c && v.has(c)) {
        q = !0, K.value = c, ae(), o.value = "failed", sa(c) ? et || Fe == null || Fe() : g(U.data);
        return;
      }
      a.value++, console.error("Socket connection failed, attempt:", a.value), a.value >= l && (o.value = "failed"), R && !R.active && Oe();
    }), R.on("chat_response", (U) => {
      if (H(), U.session_id ? (console.log("Captured session_id from chat_response:", U.session_id), k.value = U.session_id) : console.warn("No session_id in chat_response data:", U), U.type === "agent_message") {
        const c = {
          message: U.message,
          message_type: "agent",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          session_id: "",
          agent_name: U.agent_name,
          stream: !0,
          // live reply → client-side typewriter reveal
          attributes: {
            end_chat: U.end_chat,
            end_chat_reason: U.end_chat_reason,
            end_chat_description: U.end_chat_description,
            request_rating: U.request_rating
          }
        };
        U.attachments && Array.isArray(U.attachments) && (c.id = U.message_id, c.attachments = U.attachments.map((_, N) => ({
          id: U.message_id * 1e3 + N,
          filename: _.filename,
          file_url: _.file_url,
          content_type: _.content_type,
          file_size: _.file_size
        }))), e.value.push(c);
      } else U.shopify_output && typeof U.shopify_output == "object" && U.shopify_output.products ? e.value.push({
        message: U.message,
        // Keep the accompanying text message
        message_type: "product",
        // Use 'product' type for rendering
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: "",
        agent_name: U.agent_name,
        // Assign the whole structured object
        shopify_output: U.shopify_output,
        // Remove the old flattened fields (product_id, product_title, etc.)
        attributes: {
          // Keep other attributes if needed
          end_chat: U.end_chat,
          request_rating: U.request_rating
        }
      }) : e.value.push({
        message: U.message,
        message_type: "bot",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: "",
        agent_name: U.agent_name,
        stream: !0,
        // live reply → client-side typewriter reveal
        // Knowledge-base citations (display gated by show_citations in the widget)
        sources: Array.isArray(U.sources) && U.sources.length ? U.sources : void 0,
        attributes: {
          end_chat: U.end_chat,
          end_chat_reason: U.end_chat_reason,
          end_chat_description: U.end_chat_description,
          request_rating: U.request_rating
        }
      });
    }), R.on("handle_taken_over", (U) => {
      e.value.push({
        message: `${U.user_name} joined the conversation`,
        message_type: "system",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: U.session_id
      }), h.value = {
        ...h.value,
        human_agent_name: U.user_name,
        human_agent_profile_pic: U.profile_picture
      }, H(), _e && _e(U);
    }), R.on("session_initialized", (U) => {
      U.session_id && (k.value = U.session_id, ce = {
        session_id: U.session_id,
        authenticated: !!U.authenticated,
        created: !!U.created
      }, Ve == null || Ve(ce));
    }), R.on("error", g);
    for (const [U, c] of b) R.on(U, c);
    return R.on("chat_history", w), R.on("rating_submitted", L), R.on("display_form", P), R.on("form_submitted", D), R.on("workflow_state", O), R.on("workflow_proceeded", X), R;
  }, Pe = async () => {
    try {
      return R != null && R.connected && Ye && Ye === Xe(gt().conversation_token) ? (o.value = "connected", !0) : (o.value = "connecting", a.value = 0, H(), ae(), q = !1, K.value = null, R && (R.removeAllListeners(), R.disconnect(), R = null), et = !0, R = hn(""), new Promise((F) => {
        const U = (c) => {
          et = !1, F(c);
        };
        R == null || R.on("connect", () => {
          U(!0);
        }), R == null || R.on("connect_error", () => {
          (q || a.value >= l) && U(!1);
        });
      }));
    } catch (F) {
      return console.error("Socket initialization failed:", F), et = !1, o.value = "failed", !1;
    }
  }, Vt = () => (R && R.disconnect(), Pe()), ct = (F) => {
    _e = F;
  }, Kt = (F) => {
    Fe = F;
  }, Gt = (F) => {
    Ve = F, ce && F(ce);
  }, Mt = (F) => {
    Le = F;
  }, dn = (F) => {
    ve = F;
  }, g = (F) => {
    H(), n.value = ap(F), s.value = !0, setTimeout(() => {
      s.value = !1, n.value = "";
    }, 5e3);
  }, w = (F) => {
    if (F.type === "chat_history" && Array.isArray(F.messages)) {
      const U = F.messages.map((c) => {
        var N, E;
        const _ = {
          message: c.message,
          message_type: c.message_type,
          created_at: c.created_at,
          session_id: "",
          agent_name: c.agent_name || "",
          user_name: c.user_name || "",
          attributes: c.attributes || {},
          attachments: c.attachments || []
          // Include attachments
        };
        return Array.isArray((N = c.attributes) == null ? void 0 : N.sources) && c.attributes.sources.length && (_.sources = c.attributes.sources), (E = c.attributes) != null && E.shopify_output && typeof c.attributes.shopify_output == "object" ? {
          ..._,
          message_type: "product",
          shopify_output: c.attributes.shopify_output
        } : _;
      });
      e.value = [
        ...U.filter(
          (c) => !e.value.some(
            (_) => _.message === c.message && _.created_at === c.created_at
          )
        ),
        ...e.value
      ];
    }
  }, L = (F) => {
    F.success && e.value.push({
      message: "Thank you for your feedback!",
      message_type: "system",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: ""
    });
  }, P = (F) => {
    var U;
    console.log("Form display handler in composable:", F), H(), u.value = F.form_data, console.log("Set currentForm in handleDisplayForm:", u.value), ((U = F.form_data) == null ? void 0 : U.form_full_screen) === !0 ? (console.log("Full screen form detected, triggering workflow state callback"), Le && Le({
      type: "form",
      form_data: F.form_data,
      session_id: F.session_id
    })) : e.value.push({
      message: "",
      message_type: "form",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: F.session_id,
      attributes: {
        form_data: F.form_data
      }
    });
  }, D = (F) => {
    console.log("Form submitted confirmation received, clearing currentForm"), u.value = null, F.success && console.log("Form submitted successfully");
  }, O = (F) => {
    console.log("Workflow state received in composable:", F), (F.type === "form" || F.type === "display_form") && (console.log("Setting currentForm from workflow state:", F.form_data), u.value = F.form_data), Le && Le(F);
  }, X = (F) => {
    console.log("Workflow proceeded in composable:", F), ve && ve(F);
  }, $ = async (F, U) => {
    !R || !F || R.emit("submit_rating", {
      rating: F,
      feedback: U
    });
  }, V = async (F) => {
    var _;
    if (console.log("Submitting form in socket:", F), console.log("Current form in socket:", u.value), console.log("Socket in socket:", R), !R) {
      console.error("No socket available for form submission");
      return;
    }
    if (!F || Object.keys(F).length === 0) {
      console.error("No form data to submit");
      return;
    }
    const c = ((_ = u.value) == null ? void 0 : _.form_type) === "contact" ? "submit_contact_info" : "submit_form";
    console.log(`Emitting ${c} event with data:`, F), R.emit(c, {
      form_data: F
    }), u.value = null;
  }, W = async () => {
    R && (console.log("Getting workflow state 12"), R.emit("get_workflow_state"));
  }, ee = async () => {
    R && R.emit("proceed_workflow", {});
  }, Y = async (F, U, c = [], _ = {}) => {
    if (!R || !F.trim() && c.length === 0) return;
    const N = {
      message: F,
      message_type: "user",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: ""
    };
    c.length > 0 && (N.attachments = c.map((E, j) => {
      let Z = "";
      if (E.content_type.startsWith("image/")) {
        const ie = atob(E.content), Re = new Array(ie.length);
        for (let ke = 0; ke < ie.length; ke++)
          Re[ke] = ie.charCodeAt(ke);
        const Ee = new Uint8Array(Re), Ue = new Blob([Ee], { type: E.content_type });
        Z = URL.createObjectURL(Ue);
      }
      return {
        id: Date.now() * 1e3 + j,
        // Temporary ID
        filename: E.filename,
        file_url: Z,
        // Temporary blob URL, will be replaced
        content_type: E.content_type,
        file_size: E.size,
        _isTemporary: !0
        // Flag to identify temporary attachments
      };
    })), e.value.push(N), R.emit("chat", {
      ..._,
      message: F,
      email: U,
      files: c
      // Send files with base64 content
    }), i.value = !0;
  }, se = () => {
    e.value = [], i.value = !1, k.value = "", H(), u.value = null;
  };
  return {
    messages: e,
    loading: t,
    errorMessage: n,
    showError: s,
    loadingHistory: r,
    hasStartedChat: i,
    connectionStatus: o,
    sendMessage: Y,
    endChat: (F = "CUSTOMER_REQUEST") => new Promise((U) => {
      if (!R || !R.connected) {
        U(!1);
        return;
      }
      let c = !1;
      const _ = (Z) => {
        c || (c = !0, clearTimeout(j), R == null || R.off("chat_ended", N), R == null || R.off("error", E), Z && se(), U(Z));
      }, N = () => _(!0), E = (Z) => {
        (Z == null ? void 0 : Z.type) === "end_chat_error" && _(!1);
      }, j = setTimeout(() => _(!1), L_);
      R.on("chat_ended", N), R.on("error", E), R.emit("end_chat", { reason: F });
    }),
    loadChatHistory: async () => {
      if (R)
        try {
          r.value = !0, R.emit("get_chat_history");
        } catch (F) {
          console.error("Failed to load chat history:", F);
        } finally {
          r.value = !1;
        }
    },
    connect: Pe,
    reconnect: Vt,
    cleanup: () => {
      H(), ae(), R && (R.removeAllListeners(), R.disconnect(), R = null), _e = null, Le = null, ve = null;
    },
    humanAgent: h,
    onTakeover: ct,
    onSessionState: Gt,
    onReauthorize: Kt,
    refusal: K,
    submitRating: $,
    currentForm: u,
    submitForm: V,
    getWorkflowState: W,
    proceedWorkflow: ee,
    onWorkflowState: Mt,
    onWorkflowProceeded: dn,
    currentSessionId: k,
    setToken: st,
    setWidgetId: Ke,
    on: (F, U) => {
      b.push([F, U]), R == null || R.on(F, U);
    },
    emit: (F, U) => {
      R == null || R.emit(F, U);
    }
  };
}
const P_ = 2e3, M_ = 4;
function D_(e) {
  if (typeof e.message != "string" || !e.message.trim()) return null;
  const t = Array.isArray(e.suggestions) ? e.suggestions.filter((n) => typeof n == "string" && !!n.trim()).map((n) => ({ label: n.slice(0, 80), kind: "text", value: n.slice(0, 500) })).slice(0, M_) : [];
  return { message: e.message.slice(0, P_), chips: t, open: e.open === !0, source: "host" };
}
const F_ = 2e3;
function $_(e) {
  const t = e.setTimer ?? ((v, q) => setTimeout(v, q)), n = e.clearTimer ?? ((v) => clearTimeout(v));
  let s = [], r = null, i = null;
  const o = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map();
  function h() {
    const v = e.trustedHostOrigin();
    v && s.length && e.emit("actions_available", { names: s, host_origin: v }), r && e.emit("set_context", { context: r });
  }
  function u(v) {
    s = Array.isArray(v) ? v.filter((q) => typeof q == "string") : [], h();
  }
  function k(v) {
    r = v && typeof v == "object" && !Array.isArray(v) ? v : null, r && e.emit("set_context", { context: r });
  }
  function b(v, q, K = {}) {
    const ae = o.get(v);
    ae && n(ae.timer), o.delete(v);
    const Oe = a.get(v);
    if (Oe) {
      a.delete(v), Oe(q);
      return;
    }
    const _e = (ae == null ? void 0 : ae.confirmed) ?? void 0;
    e.emit("action_result", { call_id: v, status: q, confirmed: _e, ...K });
  }
  function I(v) {
    const q = i && v ? a.get(i.request.call_id) : void 0;
    q && i && (a.delete(i.request.call_id), q("declined")), i = v, e.onConfirmChange(v);
  }
  function B(v, q) {
    const K = Math.max(1, v.timeout_s) * 1e3 + F_;
    o.set(v.call_id, { timer: t(() => b(v.call_id, "timeout"), K), confirmed: q }), e.postToHost({
      type: "ACTION_RUN",
      callId: v.call_id,
      name: v.name,
      args: v.args,
      timeoutS: v.timeout_s
    });
  }
  function H(v) {
    if (!(!v || typeof v.call_id != "string") && !(o.has(v.call_id) || l.has(v.call_id) || (i == null ? void 0 : i.request.call_id) === v.call_id)) {
      if (v.confirm === "always") {
        I({ request: v, preview: null });
        return;
      }
      if (v.confirm === "when_overwriting") {
        l.set(v.call_id, v), e.postToHost({ type: "ACTION_PREVIEW", callId: v.call_id, name: v.name, args: v.args });
        return;
      }
      B(v, null);
    }
  }
  function he(v) {
    var q;
    switch (v.type) {
      case "HOST_ACTIONS":
        return u(v.names), !0;
      case "HOST_CONTEXT":
        return k(v.context), !0;
      case "HOST_PROMPT": {
        const K = D_(v);
        return K && ((q = e.onPrompt) == null || q.call(e, K)), !0;
      }
      case "ACTION_PREVIEW_DONE": {
        const K = l.get(String(v.callId));
        if (!K) return !0;
        l.delete(K.call_id);
        const ae = v.preview;
        return ae && typeof ae == "object" ? I({ request: K, preview: ae }) : B(K, null), !0;
      }
      case "ACTION_DONE": {
        const K = String(v.callId);
        if (!o.has(K)) return !0;
        const ae = ["ok", "error", "timeout"].includes(v.status) ? v.status : "error";
        return b(K, ae, {
          result: ae === "ok" ? v.result : void 0,
          error: typeof v.error == "string" ? v.error : void 0
        }), !0;
      }
      default:
        return !1;
    }
  }
  function R() {
    if (!i) return;
    const { request: v } = i;
    I(null), B(v, !0);
  }
  function le() {
    if (!i) return;
    const { request: v } = i;
    I(null);
    const q = a.get(v.call_id);
    if (q) {
      a.delete(v.call_id), q("declined");
      return;
    }
    e.emit("action_result", { call_id: v.call_id, status: "declined", confirmed: !1 });
  }
  function de(v, q) {
    if (v.kind !== "action" || !v.action || i || a.size > 0 || o.size > 0 || l.size > 0) return !1;
    const K = `chip-${v.value}-${Date.now()}`;
    return a.set(K, q), H({
      call_id: K,
      name: v.value,
      label: v.action.label,
      args: {},
      confirm: v.action.confirm,
      timeout_s: v.action.timeout_s
    }), !0;
  }
  function C() {
    for (const v of o.values()) n(v.timer);
    o.clear(), l.clear(), a.clear(), I(null);
  }
  return { announce: h, handleRequest: H, handleHostMessage: he, approve: R, decline: le, runLocal: de, dispose: C };
}
function B_(e, t) {
  const n = oe(null), s = $_({
    postToHost: St,
    emit: e.emit,
    // Actions need a page whose origin we know: the framed widget with a real host.
    trustedHostOrigin: () => {
      if (!ji()) return null;
      const i = Gu();
      return i === "*" ? null : i;
    },
    onConfirmChange: (i) => {
      n.value = i;
    },
    onPrompt: t
  });
  e.on("action_request", (i) => s.handleRequest(i)), e.on("session_initialized", () => s.announce());
  const r = (i) => {
    i.source === window.parent && (!i.data || typeof i.data.type != "string" || s.handleHostMessage(i.data));
  };
  return window.addEventListener("message", r), to(() => {
    window.removeEventListener("message", r), s.dispose();
  }), { pendingConfirm: n, approveAction: s.approve, declineAction: s.decline, runLocalAction: s.runLocal };
}
const U_ = 6e4;
function z_(e) {
  const t = e.setTimer ?? ((b, I) => setTimeout(b, I)), n = e.clearTimer ?? ((b) => clearTimeout(b));
  let s = null, r = null;
  function i() {
    s !== null && n(s), s = null;
  }
  let o = null, a = null;
  function l() {
    i();
    const b = a;
    !b || r === b.stepId || (o = b.stepId, s = t(() => {
      s = null, r = b.stepId, e.addNotice(b.nudge.message, "message");
    }, b.nudge.after_min * U_));
  }
  function h(b) {
    if (a = b.nudge && b.step_id ? { stepId: b.step_id, nudge: b.nudge } : null, !a) {
      i(), o = null;
      return;
    }
    o === a.stepId && s !== null || l();
  }
  function u(b) {
    var H;
    const I = (b == null ? void 0 : b.view) ?? null;
    if ((H = I == null ? void 0 : I.notice) != null && H.text && e.addNotice(I.notice.text, I.notice.kind), !I || I.finished || I.waiting) {
      i(), a = null, o = null, e.showStep(null, null), I != null && I.finished && I.message && e.addNotice(I.message, "message");
      return;
    }
    const B = I.message ? { message: I.message, chips: I.chips ?? [], open: !1, source: "journey" } : null;
    e.showStep(B, {
      index: I.step_index ?? 0,
      count: I.step_count,
      title: I.title ?? "",
      skippable: !!I.skippable
    }), I.fresh && I.auto_open && e.openChat(), h(I);
  }
  function k() {
    s !== null && l();
  }
  return {
    handleState: u,
    activity: k,
    sync: (b = {}) => e.emit("journey_sync", b),
    skip: () => e.emit("journey_skip", {}),
    dismiss: () => e.emit("journey_dismiss", {}),
    start: (b) => e.emit("journey_start", { key: b }),
    dispose: i
  };
}
function H_(e) {
  const t = oe(null), n = oe(!1);
  let s = !1;
  const r = [], o = z_({
    emit: (h, u) => {
      s ? e.emit(h, u) : r.push([h, u]);
    },
    showStep: (h, u) => {
      t.value = u;
      const k = e.currentPrompt();
      k && k.source !== "journey" || e.showPrompt(h);
    },
    addNotice: e.addNotice,
    openChat: () => St({ type: "WIDGET_OPEN_REQUEST" })
  });
  e.on("journey_state", o.handleState), e.on("session_initialized", () => {
    s = !0, o.sync({ url: tf() });
    for (const [h, u] of r.splice(0)) e.emit(h, u);
  });
  const a = (h) => {
    if (h.source !== window.parent) return;
    const u = h.data;
    !u || typeof u.type != "string" || (u.type === "HOST_PAGE" && typeof u.url == "string" && o.sync({ url: u.url }), u.type === "HOST_CONTEXT" && o.sync({}), u.type === "HOST_EVENT" && typeof u.event == "string" && o.sync({ event: u.event }), u.type === "HOST_JOURNEY_START" && typeof u.key == "string" && o.start(u.key));
  };
  window.addEventListener("message", a);
  function l(h, u) {
    if (o.activity(), h.kind === "text") {
      u(h.value);
      return;
    }
    if (n.value) return;
    e.runLocalAction(h, (b) => {
      n.value = !1, b === "ok" && o.sync({ action: h.value });
    }) && (n.value = !0);
  }
  return to(() => {
    window.removeEventListener("message", a), o.dispose();
  }), {
    journeyProgress: t,
    chipBusy: n,
    runChip: l,
    skipStep: o.skip,
    dismissJourney: o.dismiss,
    noteActivity: o.activity
  };
}
function W_(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Wo = { exports: {} }, Ac;
function j_() {
  return Ac || (Ac = 1, function(e) {
    (function() {
      function t(c, _, N) {
        return c.call.apply(c.bind, arguments);
      }
      function n(c, _, N) {
        if (!c) throw Error();
        if (2 < arguments.length) {
          var E = Array.prototype.slice.call(arguments, 2);
          return function() {
            var j = Array.prototype.slice.call(arguments);
            return Array.prototype.unshift.apply(j, E), c.apply(_, j);
          };
        }
        return function() {
          return c.apply(_, arguments);
        };
      }
      function s(c, _, N) {
        return s = Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1 ? t : n, s.apply(null, arguments);
      }
      var r = Date.now || function() {
        return +/* @__PURE__ */ new Date();
      };
      function i(c, _) {
        this.a = c, this.o = _ || c, this.c = this.o.document;
      }
      var o = !!window.FontFace;
      function a(c, _, N, E) {
        if (_ = c.c.createElement(_), N) for (var j in N) N.hasOwnProperty(j) && (j == "style" ? _.style.cssText = N[j] : _.setAttribute(j, N[j]));
        return E && _.appendChild(c.c.createTextNode(E)), _;
      }
      function l(c, _, N) {
        c = c.c.getElementsByTagName(_)[0], c || (c = document.documentElement), c.insertBefore(N, c.lastChild);
      }
      function h(c) {
        c.parentNode && c.parentNode.removeChild(c);
      }
      function u(c, _, N) {
        _ = _ || [], N = N || [];
        for (var E = c.className.split(/\s+/), j = 0; j < _.length; j += 1) {
          for (var Z = !1, ie = 0; ie < E.length; ie += 1) if (_[j] === E[ie]) {
            Z = !0;
            break;
          }
          Z || E.push(_[j]);
        }
        for (_ = [], j = 0; j < E.length; j += 1) {
          for (Z = !1, ie = 0; ie < N.length; ie += 1) if (E[j] === N[ie]) {
            Z = !0;
            break;
          }
          Z || _.push(E[j]);
        }
        c.className = _.join(" ").replace(/\s+/g, " ").replace(/^\s+|\s+$/, "");
      }
      function k(c, _) {
        for (var N = c.className.split(/\s+/), E = 0, j = N.length; E < j; E++) if (N[E] == _) return !0;
        return !1;
      }
      function b(c) {
        return c.o.location.hostname || c.a.location.hostname;
      }
      function I(c, _, N) {
        function E() {
          Re && j && Z && (Re(ie), Re = null);
        }
        _ = a(c, "link", { rel: "stylesheet", href: _, media: "all" });
        var j = !1, Z = !0, ie = null, Re = N || null;
        o ? (_.onload = function() {
          j = !0, E();
        }, _.onerror = function() {
          j = !0, ie = Error("Stylesheet failed to load"), E();
        }) : setTimeout(function() {
          j = !0, E();
        }, 0), l(c, "head", _);
      }
      function B(c, _, N, E) {
        var j = c.c.getElementsByTagName("head")[0];
        if (j) {
          var Z = a(c, "script", { src: _ }), ie = !1;
          return Z.onload = Z.onreadystatechange = function() {
            ie || this.readyState && this.readyState != "loaded" && this.readyState != "complete" || (ie = !0, N && N(null), Z.onload = Z.onreadystatechange = null, Z.parentNode.tagName == "HEAD" && j.removeChild(Z));
          }, j.appendChild(Z), setTimeout(function() {
            ie || (ie = !0, N && N(Error("Script load timeout")));
          }, E || 5e3), Z;
        }
        return null;
      }
      function H() {
        this.a = 0, this.c = null;
      }
      function he(c) {
        return c.a++, function() {
          c.a--, le(c);
        };
      }
      function R(c, _) {
        c.c = _, le(c);
      }
      function le(c) {
        c.a == 0 && c.c && (c.c(), c.c = null);
      }
      function de(c) {
        this.a = c || "-";
      }
      de.prototype.c = function(c) {
        for (var _ = [], N = 0; N < arguments.length; N++) _.push(arguments[N].replace(/[\W_]+/g, "").toLowerCase());
        return _.join(this.a);
      };
      function C(c, _) {
        this.c = c, this.f = 4, this.a = "n";
        var N = (_ || "n4").match(/^([nio])([1-9])$/i);
        N && (this.a = N[1], this.f = parseInt(N[2], 10));
      }
      function v(c) {
        return ae(c) + " " + (c.f + "00") + " 300px " + q(c.c);
      }
      function q(c) {
        var _ = [];
        c = c.split(/,\s*/);
        for (var N = 0; N < c.length; N++) {
          var E = c[N].replace(/['"]/g, "");
          E.indexOf(" ") != -1 || /^\d/.test(E) ? _.push("'" + E + "'") : _.push(E);
        }
        return _.join(",");
      }
      function K(c) {
        return c.a + c.f;
      }
      function ae(c) {
        var _ = "normal";
        return c.a === "o" ? _ = "oblique" : c.a === "i" && (_ = "italic"), _;
      }
      function Oe(c) {
        var _ = 4, N = "n", E = null;
        return c && ((E = c.match(/(normal|oblique|italic)/i)) && E[1] && (N = E[1].substr(0, 1).toLowerCase()), (E = c.match(/([1-9]00|normal|bold)/i)) && E[1] && (/bold/i.test(E[1]) ? _ = 7 : /[1-9]00/.test(E[1]) && (_ = parseInt(E[1].substr(0, 1), 10)))), N + _;
      }
      function _e(c, _) {
        this.c = c, this.f = c.o.document.documentElement, this.h = _, this.a = new de("-"), this.j = _.events !== !1, this.g = _.classes !== !1;
      }
      function Le(c) {
        c.g && u(c.f, [c.a.c("wf", "loading")]), Ve(c, "loading");
      }
      function ve(c) {
        if (c.g) {
          var _ = k(c.f, c.a.c("wf", "active")), N = [], E = [c.a.c("wf", "loading")];
          _ || N.push(c.a.c("wf", "inactive")), u(c.f, N, E);
        }
        Ve(c, "inactive");
      }
      function Ve(c, _, N) {
        c.j && c.h[_] && (N ? c.h[_](N.c, K(N)) : c.h[_]());
      }
      function Fe() {
        this.c = {};
      }
      function et(c, _, N) {
        var E = [], j;
        for (j in _) if (_.hasOwnProperty(j)) {
          var Z = c.c[j];
          Z && E.push(Z(_[j], N));
        }
        return E;
      }
      function ce(c, _) {
        this.c = c, this.f = _, this.a = a(this.c, "span", { "aria-hidden": "true" }, this.f);
      }
      function ye(c) {
        l(c.c, "body", c.a);
      }
      function pe(c) {
        return "display:block;position:absolute;top:-9999px;left:-9999px;font-size:300px;width:auto;height:auto;line-height:normal;margin:0;padding:0;font-variant:normal;white-space:nowrap;font-family:" + q(c.c) + ";" + ("font-style:" + ae(c) + ";font-weight:" + (c.f + "00") + ";");
      }
      function Ye(c, _, N, E, j, Z) {
        this.g = c, this.j = _, this.a = E, this.c = N, this.f = j || 3e3, this.h = Z || void 0;
      }
      Ye.prototype.start = function() {
        var c = this.c.o.document, _ = this, N = r(), E = new Promise(function(ie, Re) {
          function Ee() {
            r() - N >= _.f ? Re() : c.fonts.load(v(_.a), _.h).then(function(Ue) {
              1 <= Ue.length ? ie() : setTimeout(Ee, 25);
            }, function() {
              Re();
            });
          }
          Ee();
        }), j = null, Z = new Promise(function(ie, Re) {
          j = setTimeout(Re, _.f);
        });
        Promise.race([Z, E]).then(function() {
          j && (clearTimeout(j), j = null), _.g(_.a);
        }, function() {
          _.j(_.a);
        });
      };
      function Xe(c, _, N, E, j, Z, ie) {
        this.v = c, this.B = _, this.c = N, this.a = E, this.s = ie || "BESbswy", this.f = {}, this.w = j || 3e3, this.u = Z || null, this.m = this.j = this.h = this.g = null, this.g = new ce(this.c, this.s), this.h = new ce(this.c, this.s), this.j = new ce(this.c, this.s), this.m = new ce(this.c, this.s), c = new C(this.a.c + ",serif", K(this.a)), c = pe(c), this.g.a.style.cssText = c, c = new C(this.a.c + ",sans-serif", K(this.a)), c = pe(c), this.h.a.style.cssText = c, c = new C("serif", K(this.a)), c = pe(c), this.j.a.style.cssText = c, c = new C("sans-serif", K(this.a)), c = pe(c), this.m.a.style.cssText = c, ye(this.g), ye(this.h), ye(this.j), ye(this.m);
      }
      var st = { D: "serif", C: "sans-serif" }, Ke = null;
      function gt() {
        if (Ke === null) {
          var c = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent);
          Ke = !!c && (536 > parseInt(c[1], 10) || parseInt(c[1], 10) === 536 && 11 >= parseInt(c[2], 10));
        }
        return Ke;
      }
      Xe.prototype.start = function() {
        this.f.serif = this.j.a.offsetWidth, this.f["sans-serif"] = this.m.a.offsetWidth, this.A = r(), Pe(this);
      };
      function hn(c, _, N) {
        for (var E in st) if (st.hasOwnProperty(E) && _ === c.f[st[E]] && N === c.f[st[E]]) return !0;
        return !1;
      }
      function Pe(c) {
        var _ = c.g.a.offsetWidth, N = c.h.a.offsetWidth, E;
        (E = _ === c.f.serif && N === c.f["sans-serif"]) || (E = gt() && hn(c, _, N)), E ? r() - c.A >= c.w ? gt() && hn(c, _, N) && (c.u === null || c.u.hasOwnProperty(c.a.c)) ? ct(c, c.v) : ct(c, c.B) : Vt(c) : ct(c, c.v);
      }
      function Vt(c) {
        setTimeout(s(function() {
          Pe(this);
        }, c), 50);
      }
      function ct(c, _) {
        setTimeout(s(function() {
          h(this.g.a), h(this.h.a), h(this.j.a), h(this.m.a), _(this.a);
        }, c), 0);
      }
      function Kt(c, _, N) {
        this.c = c, this.a = _, this.f = 0, this.m = this.j = !1, this.s = N;
      }
      var Gt = null;
      Kt.prototype.g = function(c) {
        var _ = this.a;
        _.g && u(_.f, [_.a.c("wf", c.c, K(c).toString(), "active")], [_.a.c("wf", c.c, K(c).toString(), "loading"), _.a.c("wf", c.c, K(c).toString(), "inactive")]), Ve(_, "fontactive", c), this.m = !0, Mt(this);
      }, Kt.prototype.h = function(c) {
        var _ = this.a;
        if (_.g) {
          var N = k(_.f, _.a.c("wf", c.c, K(c).toString(), "active")), E = [], j = [_.a.c("wf", c.c, K(c).toString(), "loading")];
          N || E.push(_.a.c("wf", c.c, K(c).toString(), "inactive")), u(_.f, E, j);
        }
        Ve(_, "fontinactive", c), Mt(this);
      };
      function Mt(c) {
        --c.f == 0 && c.j && (c.m ? (c = c.a, c.g && u(c.f, [c.a.c("wf", "active")], [c.a.c("wf", "loading"), c.a.c("wf", "inactive")]), Ve(c, "active")) : ve(c.a));
      }
      function dn(c) {
        this.j = c, this.a = new Fe(), this.h = 0, this.f = this.g = !0;
      }
      dn.prototype.load = function(c) {
        this.c = new i(this.j, c.context || this.j), this.g = c.events !== !1, this.f = c.classes !== !1, w(this, new _e(this.c, c), c);
      };
      function g(c, _, N, E, j) {
        var Z = --c.h == 0;
        (c.f || c.g) && setTimeout(function() {
          var ie = j || null, Re = E || null || {};
          if (N.length === 0 && Z) ve(_.a);
          else {
            _.f += N.length, Z && (_.j = Z);
            var Ee, Ue = [];
            for (Ee = 0; Ee < N.length; Ee++) {
              var ke = N[Ee], Me = Re[ke.c], kt = _.a, ft = ke;
              if (kt.g && u(kt.f, [kt.a.c("wf", ft.c, K(ft).toString(), "loading")]), Ve(kt, "fontloading", ft), kt = null, Gt === null) if (window.FontFace) {
                var ft = /Gecko.*Firefox\/(\d+)/.exec(window.navigator.userAgent), In = /OS X.*Version\/10\..*Safari/.exec(window.navigator.userAgent) && /Apple/.exec(window.navigator.vendor);
                Gt = ft ? 42 < parseInt(ft[1], 10) : !In;
              } else Gt = !1;
              Gt ? kt = new Ye(s(_.g, _), s(_.h, _), _.c, ke, _.s, Me) : kt = new Xe(s(_.g, _), s(_.h, _), _.c, ke, _.s, ie, Me), Ue.push(kt);
            }
            for (Ee = 0; Ee < Ue.length; Ee++) Ue[Ee].start();
          }
        }, 0);
      }
      function w(c, _, N) {
        var j = [], E = N.timeout;
        Le(_);
        var j = et(c.a, N, c.c), Z = new Kt(c.c, _, E);
        for (c.h = j.length, _ = 0, N = j.length; _ < N; _++) j[_].load(function(ie, Re, Ee) {
          g(c, Z, ie, Re, Ee);
        });
      }
      function L(c, _) {
        this.c = c, this.a = _;
      }
      L.prototype.load = function(c) {
        function _() {
          if (Z["__mti_fntLst" + E]) {
            var ie = Z["__mti_fntLst" + E](), Re = [], Ee;
            if (ie) for (var Ue = 0; Ue < ie.length; Ue++) {
              var ke = ie[Ue].fontfamily;
              ie[Ue].fontStyle != null && ie[Ue].fontWeight != null ? (Ee = ie[Ue].fontStyle + ie[Ue].fontWeight, Re.push(new C(ke, Ee))) : Re.push(new C(ke));
            }
            c(Re);
          } else setTimeout(function() {
            _();
          }, 50);
        }
        var N = this, E = N.a.projectId, j = N.a.version;
        if (E) {
          var Z = N.c.o;
          B(this.c, (N.a.api || "https://fast.fonts.net/jsapi") + "/" + E + ".js" + (j ? "?v=" + j : ""), function(ie) {
            ie ? c([]) : (Z["__MonotypeConfiguration__" + E] = function() {
              return N.a;
            }, _());
          }).id = "__MonotypeAPIScript__" + E;
        } else c([]);
      };
      function P(c, _) {
        this.c = c, this.a = _;
      }
      P.prototype.load = function(c) {
        var _, N, E = this.a.urls || [], j = this.a.families || [], Z = this.a.testStrings || {}, ie = new H();
        for (_ = 0, N = E.length; _ < N; _++) I(this.c, E[_], he(ie));
        var Re = [];
        for (_ = 0, N = j.length; _ < N; _++) if (E = j[_].split(":"), E[1]) for (var Ee = E[1].split(","), Ue = 0; Ue < Ee.length; Ue += 1) Re.push(new C(E[0], Ee[Ue]));
        else Re.push(new C(E[0]));
        R(ie, function() {
          c(Re, Z);
        });
      };
      function D(c, _) {
        c ? this.c = c : this.c = O, this.a = [], this.f = [], this.g = _ || "";
      }
      var O = "https://fonts.googleapis.com/css";
      function X(c, _) {
        for (var N = _.length, E = 0; E < N; E++) {
          var j = _[E].split(":");
          j.length == 3 && c.f.push(j.pop());
          var Z = "";
          j.length == 2 && j[1] != "" && (Z = ":"), c.a.push(j.join(Z));
        }
      }
      function $(c) {
        if (c.a.length == 0) throw Error("No fonts to load!");
        if (c.c.indexOf("kit=") != -1) return c.c;
        for (var _ = c.a.length, N = [], E = 0; E < _; E++) N.push(c.a[E].replace(/ /g, "+"));
        return _ = c.c + "?family=" + N.join("%7C"), 0 < c.f.length && (_ += "&subset=" + c.f.join(",")), 0 < c.g.length && (_ += "&text=" + encodeURIComponent(c.g)), _;
      }
      function V(c) {
        this.f = c, this.a = [], this.c = {};
      }
      var W = { latin: "BESbswy", "latin-ext": "çöüğş", cyrillic: "йяЖ", greek: "αβΣ", khmer: "កខគ", Hanuman: "កខគ" }, ee = { thin: "1", extralight: "2", "extra-light": "2", ultralight: "2", "ultra-light": "2", light: "3", regular: "4", book: "4", medium: "5", "semi-bold": "6", semibold: "6", "demi-bold": "6", demibold: "6", bold: "7", "extra-bold": "8", extrabold: "8", "ultra-bold": "8", ultrabold: "8", black: "9", heavy: "9", l: "3", r: "4", b: "7" }, Y = { i: "i", italic: "i", n: "n", normal: "n" }, se = /^(thin|(?:(?:extra|ultra)-?)?light|regular|book|medium|(?:(?:semi|demi|extra|ultra)-?)?bold|black|heavy|l|r|b|[1-9]00)?(n|i|normal|italic)?$/;
      function ue(c) {
        for (var _ = c.f.length, N = 0; N < _; N++) {
          var E = c.f[N].split(":"), j = E[0].replace(/\+/g, " "), Z = ["n4"];
          if (2 <= E.length) {
            var ie, Re = E[1];
            if (ie = [], Re) for (var Re = Re.split(","), Ee = Re.length, Ue = 0; Ue < Ee; Ue++) {
              var ke;
              if (ke = Re[Ue], ke.match(/^[\w-]+$/)) {
                var Me = se.exec(ke.toLowerCase());
                if (Me == null) ke = "";
                else {
                  if (ke = Me[2], ke = ke == null || ke == "" ? "n" : Y[ke], Me = Me[1], Me == null || Me == "") Me = "4";
                  else var kt = ee[Me], Me = kt || (isNaN(Me) ? "4" : Me.substr(0, 1));
                  ke = [ke, Me].join("");
                }
              } else ke = "";
              ke && ie.push(ke);
            }
            0 < ie.length && (Z = ie), E.length == 3 && (E = E[2], ie = [], E = E ? E.split(",") : ie, 0 < E.length && (E = W[E[0]]) && (c.c[j] = E));
          }
          for (c.c[j] || (E = W[j]) && (c.c[j] = E), E = 0; E < Z.length; E += 1) c.a.push(new C(j, Z[E]));
        }
      }
      function we(c, _) {
        this.c = c, this.a = _;
      }
      var Te = { Arimo: !0, Cousine: !0, Tinos: !0 };
      we.prototype.load = function(c) {
        var _ = new H(), N = this.c, E = new D(this.a.api, this.a.text), j = this.a.families;
        X(E, j);
        var Z = new V(j);
        ue(Z), I(N, $(E), he(_)), R(_, function() {
          c(Z.a, Z.c, Te);
        });
      };
      function Ae(c, _) {
        this.c = c, this.a = _;
      }
      Ae.prototype.load = function(c) {
        var _ = this.a.id, N = this.c.o;
        _ ? B(this.c, (this.a.api || "https://use.typekit.net") + "/" + _ + ".js", function(E) {
          if (E) c([]);
          else if (N.Typekit && N.Typekit.config && N.Typekit.config.fn) {
            E = N.Typekit.config.fn;
            for (var j = [], Z = 0; Z < E.length; Z += 2) for (var ie = E[Z], Re = E[Z + 1], Ee = 0; Ee < Re.length; Ee++) j.push(new C(ie, Re[Ee]));
            try {
              N.Typekit.load({ events: !1, classes: !1, async: !0 });
            } catch {
            }
            c(j);
          }
        }, 2e3) : c([]);
      };
      function Ge(c, _) {
        this.c = c, this.f = _, this.a = [];
      }
      Ge.prototype.load = function(c) {
        var _ = this.f.id, N = this.c.o, E = this;
        _ ? (N.__webfontfontdeckmodule__ || (N.__webfontfontdeckmodule__ = {}), N.__webfontfontdeckmodule__[_] = function(j, Z) {
          for (var ie = 0, Re = Z.fonts.length; ie < Re; ++ie) {
            var Ee = Z.fonts[ie];
            E.a.push(new C(Ee.name, Oe("font-weight:" + Ee.weight + ";font-style:" + Ee.style)));
          }
          c(E.a);
        }, B(this.c, (this.f.api || "https://f.fontdeck.com/s/css/js/") + b(this.c) + "/" + _ + ".js", function(j) {
          j && c([]);
        })) : c([]);
      };
      var F = new dn(window);
      F.a.c.custom = function(c, _) {
        return new P(_, c);
      }, F.a.c.fontdeck = function(c, _) {
        return new Ge(_, c);
      }, F.a.c.monotype = function(c, _) {
        return new L(_, c);
      }, F.a.c.typekit = function(c, _) {
        return new Ae(_, c);
      }, F.a.c.google = function(c, _) {
        return new we(_, c);
      };
      var U = { load: s(F.load, F) };
      e.exports ? e.exports = U : (window.WebFont = U, window.WebFontConfig && F.load(window.WebFontConfig));
    })();
  }(Wo)), Wo.exports;
}
var q_ = j_();
const V_ = /* @__PURE__ */ W_(q_), Sc = [
  "Space Grotesk:400,500,600,700",
  "Instrument Sans:400,500,600",
  "JetBrains Mono:400,500,600"
], K_ = (e) => {
  const t = [...Sc], n = (e == null ? void 0 : e.split(",")[0].trim().replace(/['"]/g, "")) || "", s = Sc.some(
    (r) => r.toLowerCase().startsWith(n.toLowerCase())
  );
  n && !s && t.push(n), V_.load({
    google: { families: t },
    active: () => {
      if (!e) return;
      const r = document.querySelector(".chat-container");
      r && (r.style.fontFamily = e.includes(",") ? e : `"${e}", system-ui, sans-serif`);
    }
  });
};
function G_() {
  const e = oe({}), t = oe(""), n = (r) => {
    var i;
    e.value = r, r.photo_url && (e.value.photo_url = r.photo_url), K_(r.font_family), St({
      type: "CUSTOMIZATION_UPDATE",
      data: {
        chat_bubble_color: r.chat_bubble_color || "#C9F24E",
        chat_style: r.chat_style,
        chat_initiation_messages: r.chat_initiation_messages || [],
        // Dashboard "Widget placement" defaults — the embed loader merges these
        // under any options the installing developer set.
        widget_display: (i = r.customization_metadata) == null ? void 0 : i.widget_display
      }
    });
  };
  return {
    customization: e,
    agentName: t,
    applyCustomization: n,
    initializeFromData: () => {
      const r = window.__INITIAL_DATA__;
      r && (n(r.customization || {}), t.value = r.agentName || "");
    }
  };
}
const Y_ = 13, X_ = 24;
function Z_(e, t) {
  const n = Xi({}), s = [];
  let r = null;
  const i = typeof window < "u" && typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, o = (u) => {
    r || s.length === 0 || (r = setTimeout(a, u));
  }, a = () => {
    r = null;
    const u = s[0];
    if (u === void 0) return;
    const k = e.value[u], b = n[u], I = (k == null ? void 0 : k.message) ?? "";
    if (!b || !k) {
      s.shift(), o(0);
      return;
    }
    if (b.shown >= I.length) {
      b.done = !0, s.shift(), o(0);
      return;
    }
    b.shown += 1;
    const B = I[b.shown - 1];
    t == null || t(), o(B === " " ? X_ : Y_);
  };
  Ot(() => e.value.length, (u, k) => {
    k !== void 0 && u < k && (Object.keys(n).forEach((b) => {
      delete n[Number(b)];
    }), s.length = 0);
    for (let b = k ?? 0; b < u; b++) {
      const I = e.value[b];
      if (!I || !I.stream || b in n) continue;
      const B = I.message ?? "";
      i || !B ? n[b] = { shown: B.length, done: !0 } : (n[b] = { shown: 0, done: !1 }, s.push(b));
    }
    o(0);
  });
  const l = (u, k) => {
    const b = n[u];
    return b ? k.slice(0, b.shown) : k;
  }, h = (u) => {
    const k = n[u];
    return !!k && !k.done;
  };
  return Gr(() => {
    r && clearTimeout(r);
  }), { displayText: l, isStreaming: h };
}
function J_(e) {
  const t = oe(!0);
  let n = 0;
  const s = () => {
    St({ type: "UNREAD_COUNT", count: n });
  }, r = (i) => {
    var o;
    ((o = i == null ? void 0 : i.data) == null ? void 0 : o.type) === "WIDGET_VISIBILITY" && (t.value = !!i.data.open, t.value && n !== 0 && (n = 0, s()));
  };
  Ot(() => e.value.length, (i, o) => {
    if (i <= (o ?? 0) || t.value) return;
    const a = e.value[i - 1];
    a && (a.message_type === "bot" || a.message_type === "agent") && (n += 1, s());
  }), eo(() => window.addEventListener("message", r)), Gr(() => window.removeEventListener("message", r));
}
const Q_ = {
  light: !1,
  mono: !1,
  radius: 22,
  bubble: 16,
  glow: "rgba(157,140,255,.26)",
  border: "rgba(157,140,255,.32)",
  card: "linear-gradient(180deg,rgba(28,26,40,.94),rgba(15,14,22,.97))",
  text: "#ECEAFA",
  muted: "#9C97BE",
  agentBg: "rgba(255,255,255,.06)",
  accent: "#9D8CFF"
}, ey = {
  light: !1,
  mono: !1,
  radius: 26,
  bubble: 18,
  glow: "rgba(157,140,255,.32)",
  border: "rgba(157,140,255,.40)",
  card: "linear-gradient(180deg,#16131F,#0A0910)",
  text: "#F2F3F8",
  muted: "#A7A0CC",
  agentBg: "rgba(255,255,255,.05)",
  accent: "#9D8CFF"
}, ty = {
  light: !1,
  mono: !0,
  radius: 8,
  bubble: 4,
  glow: "rgba(201,242,78,.20)",
  border: "rgba(201,242,78,.30)",
  card: "#070907",
  text: "#D7F7C8",
  muted: "#7F9B57",
  agentBg: "rgba(201,242,78,.045)",
  accent: "#C9F24E"
}, ny = {
  light: !1,
  mono: !1,
  radius: 18,
  bubble: 14,
  glow: "rgba(95,227,214,.22)",
  border: "rgba(95,227,214,.30)",
  card: "linear-gradient(180deg,#0E1A1A,#0A1414)",
  text: "#DDF7F3",
  muted: "#6FAFA8",
  agentBg: "rgba(255,255,255,.05)",
  accent: "#5FE3D6"
}, sy = {
  light: !0,
  mono: !1,
  radius: 28,
  bubble: 20,
  glow: "rgba(255,138,115,.30)",
  border: "rgba(0,0,0,.07)",
  card: "#FFFFFF",
  text: "#2A2730",
  muted: "#736C7C",
  agentBg: "#F4F1F6",
  accent: "#FF8A73"
}, Ii = {
  light: !0,
  mono: !1,
  radius: 24,
  bubble: 16,
  glow: "rgba(255,138,115,.22)",
  border: "rgba(0,0,0,.08)",
  card: "#FFFFFF",
  text: "#2A2A33",
  muted: "#6E6E7B",
  agentBg: "#F3F3F6",
  accent: "#FF8A73"
}, ry = {
  GLASS: Q_,
  AURORA: ey,
  TERMINAL: ty,
  CALM_MINT: ny,
  PLAYFUL: sy,
  SUNRISE: Ii,
  CHATBOT: Ii,
  ASK_ANYTHING: Ii
}, iy = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", xc = "'Instrument Sans', system-ui, -apple-system, 'Segoe UI', sans-serif";
function oy(e) {
  return Math.max(4, Math.round(e * 0.3));
}
function Ec(e) {
  const t = (e || "").replace("#", "");
  if (t.length < 6) return "#0B0C10";
  const n = parseInt(t.slice(0, 2), 16), s = parseInt(t.slice(2, 4), 16), r = parseInt(t.slice(4, 6), 16);
  return (0.299 * n + 0.587 * s + 0.114 * r) / 255 > 0.62 ? "#0B0C10" : "#FFFFFF";
}
function ay(e) {
  return ry[e || ""] || Ii;
}
const ly = "#212529";
function cy(e, t) {
  const n = ay(e), s = (t == null ? void 0 : t.chat_background_color) || "", r = /^#[0-9a-fA-F]{6}$/.test(s), i = s || n.card, o = (t == null ? void 0 : t.chat_text_color) || "", l = /^#[0-9a-fA-F]{6}$/.test(o) && o.toLowerCase() !== ly ? o : r ? sr(s) ? "#FFFFFF" : "#111111" : n.text, h = r ? sr(s) ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.62)" : n.muted, u = r ? op(s, 20) : n.agentBg, k = (t == null ? void 0 : t.accent_color) || n.accent, b = r ? !sr(s) : n.light, I = Ec(k) === "#0B0C10", B = b === I ? h : k, H = n.mono ? iy : t != null && t.font_family ? `${t.font_family}, ${xc}` : xc;
  return {
    "--cm-card": i,
    "--cm-text": l,
    "--cm-muted": h,
    "--cm-agent-bg": u,
    "--cm-accent": k,
    "--cm-on-accent": Ec(k),
    "--cm-presence": B,
    "--cm-border": n.border,
    "--cm-glow": n.glow,
    "--cm-radius": `${n.radius}px`,
    "--cm-bubble": `${n.bubble}px`,
    "--cm-bubble-tail": `${oy(n.bubble)}px`,
    "--cm-field-radius": n.mono ? "7px" : "12px",
    "--cm-avatar-radius": n.mono ? "28%" : "50%",
    "--cm-hairline": n.light ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.08)",
    "--cm-body-font": H
  };
}
const Cc = (e) => {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: e || "USD" }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
};
function uy() {
  const e = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    INR: "₹",
    CAD: "CA$",
    AUD: "A$",
    CNY: "¥",
    CHF: "CHF",
    SEK: "kr",
    NOK: "kr",
    DKK: "kr",
    NZD: "NZ$",
    SGD: "S$",
    HKD: "HK$",
    KRW: "₩",
    MXN: "MX$",
    BRL: "R$",
    ZAR: "R",
    RUB: "₽",
    TRY: "₺",
    THB: "฿",
    PLN: "zł",
    AED: "د.إ",
    SAR: "﷼",
    ILS: "₪",
    MYR: "RM"
  };
  return {
    formatCurrency: (s, r) => {
      if (!s && s !== 0) return "";
      const i = r ? e[r] || r : "", o = typeof s == "number" ? s : Number(s), a = Number.isFinite(o) ? o.toLocaleString("en-US", {
        minimumFractionDigits: Cc(r),
        maximumFractionDigits: Cc(r)
      }) : String(s);
      return i ? `${i}${a}` : a;
    },
    getCurrencySymbol: (s) => e[s] || s,
    currencySymbols: e
  };
}
const fy = {
  key: 0,
  class: "widget-unavailable-overlay"
}, hy = {
  key: 1,
  class: "auth-error-overlay"
}, dy = { class: "auth-error-card" }, py = { class: "auth-error-message" }, my = {
  key: 0,
  class: "initializing-overlay"
}, gy = {
  key: 0,
  class: "connecting-message"
}, _y = {
  key: 1,
  class: "failed-message"
}, yy = { class: "welcome-content" }, by = { class: "welcome-header" }, vy = ["src", "alt"], wy = { class: "welcome-title" }, ky = { class: "welcome-subtitle" }, Ty = { class: "welcome-input-container" }, Ay = {
  key: 0,
  class: "email-input"
}, Sy = ["disabled"], xy = { class: "welcome-message-input" }, Ey = ["placeholder", "disabled"], Cy = ["disabled"], Ry = {
  key: 0,
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, Iy = {
  key: 1,
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, Oy = { class: "landing-page-content" }, Ly = { class: "landing-page-header" }, Ny = { class: "landing-page-heading" }, Py = { class: "landing-page-text" }, My = { class: "landing-page-actions" }, Dy = { class: "form-fullscreen-content" }, Fy = {
  key: 0,
  class: "form-header"
}, $y = {
  key: 0,
  class: "form-title"
}, By = {
  key: 1,
  class: "form-description"
}, Uy = { class: "form-fields" }, zy = ["for"], Hy = {
  key: 0,
  class: "required-indicator"
}, Wy = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "autocomplete", "inputmode"], jy = ["id", "placeholder", "required", "min", "max", "value", "onInput"], qy = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput"], Vy = ["id", "required", "value", "onChange"], Ky = { value: "" }, Gy = ["value"], Yy = {
  key: 4,
  class: "checkbox-field"
}, Xy = ["id", "required", "checked", "onChange"], Zy = { class: "checkbox-label" }, Jy = {
  key: 5,
  class: "radio-group"
}, Qy = ["name", "value", "required", "checked", "onChange"], eb = { class: "radio-label" }, tb = {
  key: 6,
  class: "field-error"
}, nb = { class: "form-actions" }, sb = ["disabled"], rb = {
  key: 0,
  class: "loading-spinner-inline"
}, ib = { key: 1 }, ob = { class: "header-content" }, ab = ["src", "alt"], lb = { class: "header-info" }, cb = { class: "status" }, ub = { class: "status-text cm-presence" }, fb = { class: "header-actions" }, hb = ["disabled", "title", "aria-label", "aria-expanded"], db = { class: "ask-anything-header" }, pb = ["src", "alt"], mb = { class: "header-info" }, gb = {
  key: 2,
  class: "loading-history"
}, _b = { class: "cm-email-gate-title" }, yb = ["disabled"], bb = {
  key: 0,
  class: "cm-email-gate-error"
}, vb = ["disabled"], wb = {
  key: 0,
  class: "cm-welcome-block"
}, kb = { class: "message agent-message cm-welcome-row" }, Tb = ["src", "alt"], Ab = {
  key: 0,
  class: "cm-msg-avatar",
  "aria-hidden": "true"
}, Sb = ["src"], xb = ["src"], Eb = { class: "message-col" }, Cb = {
  key: 0,
  class: "rating-content"
}, Rb = { class: "rating-prompt" }, Ib = ["onMouseover", "onMouseleave", "onClick", "disabled"], Ob = {
  key: 0,
  class: "feedback-wrapper"
}, Lb = { class: "feedback-section" }, Nb = ["onUpdate:modelValue", "disabled"], Pb = { class: "feedback-counter" }, Mb = ["onClick", "disabled"], Db = {
  key: 1,
  class: "submitted-feedback-wrapper"
}, Fb = { class: "submitted-feedback" }, $b = { class: "submitted-feedback-text" }, Bb = {
  key: 2,
  class: "submitted-message"
}, Ub = {
  key: 1,
  class: "form-content"
}, zb = {
  key: 0,
  class: "form-header"
}, Hb = {
  key: 0,
  class: "form-title"
}, Wb = {
  key: 1,
  class: "form-description"
}, jb = { class: "form-fields" }, qb = ["for"], Vb = {
  key: 0,
  class: "required-indicator"
}, Kb = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "disabled", "autocomplete", "inputmode"], Gb = ["id", "placeholder", "required", "min", "max", "value", "onInput", "disabled"], Yb = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "disabled"], Xb = ["id", "required", "value", "onChange", "disabled"], Zb = { value: "" }, Jb = ["value"], Qb = {
  key: 4,
  class: "checkbox-field"
}, ev = ["id", "checked", "onChange", "disabled"], tv = ["for"], nv = {
  key: 5,
  class: "radio-field"
}, sv = ["id", "name", "value", "checked", "onChange", "disabled"], rv = ["for"], iv = {
  key: 6,
  class: "field-error"
}, ov = { class: "form-actions" }, av = ["onClick", "disabled"], lv = {
  key: 2,
  class: "user-input-content"
}, cv = {
  key: 0,
  class: "user-input-prompt"
}, uv = {
  key: 1,
  class: "user-input-form"
}, fv = ["onUpdate:modelValue", "onKeydown"], hv = ["onClick", "disabled"], dv = {
  key: 2,
  class: "user-input-submitted"
}, pv = {
  key: 0,
  class: "user-input-confirmation"
}, mv = {
  key: 3,
  class: "product-message-container"
}, gv = ["innerHTML"], _v = {
  key: 1,
  class: "products-carousel"
}, yv = { class: "carousel-items" }, bv = {
  key: 0,
  class: "product-image-compact"
}, vv = ["src", "alt"], wv = { class: "product-info-compact" }, kv = { class: "product-text-area" }, Tv = { class: "product-title-compact" }, Av = {
  key: 0,
  class: "product-variant-compact"
}, Sv = { class: "product-price-compact" }, xv = { class: "product-actions-compact" }, Ev = ["onClick"], Cv = {
  key: 2,
  class: "no-products-message"
}, Rv = {
  key: 3,
  class: "no-products-message"
}, Iv = ["innerHTML"], Ov = ["innerHTML"], Lv = {
  key: 2,
  class: "message-attachments"
}, Nv = {
  key: 0,
  class: "attachment-image-container"
}, Pv = ["src", "alt", "onClick"], Mv = { class: "attachment-image-info" }, Dv = ["href"], Fv = { class: "attachment-size" }, $v = ["href"], Bv = { class: "attachment-size" }, Uv = {
  key: 0,
  class: "citation-chips"
}, zv = ["title"], Hv = { class: "message-info" }, Wv = {
  key: 0,
  class: "agent-name"
}, jv = {
  key: 1,
  class: "message agent-message cm-welcome-row cm-host-prompt"
}, qv = ["src", "alt"], Vv = ["aria-label"], Kv = {
  key: 6,
  class: "cm-quick-actions-bar"
}, Gv = ["disabled", "onClick"], Yv = {
  key: 7,
  class: "cm-quick-actions-bar"
}, Xv = ["disabled", "onClick"], Zv = {
  key: 0,
  class: "file-previews-widget"
}, Jv = {
  class: "file-preview-content-widget",
  style: { cursor: "pointer" }
}, Qv = ["src", "alt", "onClick"], ew = ["onClick"], tw = { class: "file-preview-info-widget" }, nw = { class: "file-preview-name-widget" }, sw = { class: "file-preview-size-widget" }, rw = ["onClick"], iw = {
  key: 1,
  class: "upload-progress-widget"
}, ow = { class: "message-input" }, aw = ["placeholder", "disabled"], lw = ["disabled", "title"], cw = ["disabled"], uw = {
  key: 2,
  class: "cm-secret-hint",
  role: "alert"
}, fw = {
  key: 9,
  class: "new-conversation-section"
}, hw = { class: "conversation-ended-message" }, dw = {
  key: 10,
  class: "ai-disclaimer"
}, pw = {
  key: 8,
  class: "rating-dialog"
}, mw = { class: "rating-content" }, gw = { class: "star-rating" }, _w = ["onClick"], yw = { class: "rating-actions" }, bw = ["disabled"], vw = {
  key: 0,
  class: "preview-modal-image-container"
}, ww = ["src", "alt"], kw = { class: "preview-modal-filename" }, Tw = {
  key: 3,
  class: "widget-loading"
}, Rc = 3, Aw = "image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls", Sw = /* @__PURE__ */ Ji({
  __name: "WidgetBuilder",
  props: {
    widgetId: {},
    token: {},
    initialAuthError: {}
  },
  setup(e) {
    const t = e, n = fe(() => {
      var f;
      return t.widgetId || ((f = window.__INITIAL_DATA__) == null ? void 0 : f.widgetId);
    }), {
      customization: s,
      agentName: r,
      applyCustomization: i,
      initializeFromData: o
    } = G_(), { formatCurrency: a } = uy(), {
      messages: l,
      loading: h,
      errorMessage: u,
      showError: k,
      loadingHistory: b,
      hasStartedChat: I,
      connectionStatus: B,
      sendMessage: H,
      endChat: he,
      loadChatHistory: R,
      connect: le,
      reconnect: de,
      cleanup: C,
      humanAgent: v,
      onTakeover: q,
      refusal: K,
      submitRating: ae,
      submitForm: Oe,
      currentForm: _e,
      getWorkflowState: Le,
      proceedWorkflow: ve,
      onWorkflowState: Ve,
      onWorkflowProceeded: Fe,
      currentSessionId: et,
      setToken: ce,
      setWidgetId: ye,
      onSessionState: pe,
      onReauthorize: Ye,
      on: Xe,
      emit: st
    } = N_(), Ke = oe(null), { pendingConfirm: gt, approveAction: hn, declineAction: Pe, runLocalAction: Vt } = B_(
      { on: Xe, emit: st },
      (f) => {
        Ke.value = f;
      }
    ), { journeyProgress: ct, chipBusy: Kt, runChip: Gt, skipStep: Mt, dismissJourney: dn, noteActivity: g } = H_({
      on: Xe,
      emit: st,
      currentPrompt: () => Ke.value,
      showPrompt: (f) => {
        Ke.value = f;
      },
      addNotice: (f) => {
        l.value.push({
          message: f,
          message_type: "bot",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          session_id: "",
          attributes: { source: "journey" }
        });
      },
      runLocalAction: Vt
    }), w = (f) => Gt(f, Kn), L = fe(() => {
      const f = Ke.value;
      return !f || f.source !== "journey" ? f : l.value.some((d) => d.message_type === "bot" && d.message === f.message) ? null : f;
    }), { displayText: P, isStreaming: D } = Z_(l, () => rs(() => gn()));
    J_(l);
    const O = oe(""), X = oe(!0), $ = oe(""), V = oe(!1), W = (f) => {
      const m = f.target;
      O.value = m.value;
    };
    let ee = null;
    const Y = () => {
      ee && ee.disconnect(), ee = new MutationObserver((m) => {
        let d = !1, Q = !1;
        m.forEach((Se) => {
          if (Se.type === "childList") {
            const ge = Array.from(Se.addedNodes).some(
              (it) => {
                var Ze;
                return it.nodeType === Node.ELEMENT_NODE && (it.matches("input, textarea") || ((Ze = it.querySelector) == null ? void 0 : Ze.call(it, "input, textarea")));
              }
            ), lt = Array.from(Se.removedNodes).some(
              (it) => {
                var Ze;
                return it.nodeType === Node.ELEMENT_NODE && (it.matches("input, textarea") || ((Ze = it.querySelector) == null ? void 0 : Ze.call(it, "input, textarea")));
              }
            );
            ge && (Q = !0, d = !0), lt && (d = !0);
          }
        }), d && (clearTimeout(Y.timeoutId), Y.timeoutId = setTimeout(() => {
          Ge();
        }, Q ? 50 : 100));
      });
      const f = document.querySelector(".widget-container") || document.body;
      ee.observe(f, {
        childList: !0,
        subtree: !0
      });
    };
    Y.timeoutId = null;
    let se = [];
    const ue = /* @__PURE__ */ new Set();
    let we = !1;
    const Te = (f) => {
      if (we) return;
      const m = setTimeout(() => {
        ue.delete(m), Ge();
      }, f);
      ue.add(m);
    }, Ae = () => {
      ue.forEach(clearTimeout), ue.clear();
    }, Ge = () => {
      F();
      const f = [
        '.widget-container input[type="text"]',
        '.chat-container input[type="text"]',
        ".message-input input",
        ".welcome-message-field",
        ".ask-anything-field",
        'input[placeholder*="message"]',
        'input[placeholder*="Type"]',
        'input[placeholder*="Ask"]',
        "input.message-input",
        "textarea",
        // More specific selectors for the widget context
        ".widget-container input",
        ".chat-input input",
        "input"
      ];
      let m = [];
      for (const d of f) {
        const Q = document.querySelectorAll(d);
        if (Q.length > 0) {
          m = Array.from(Q);
          break;
        }
      }
      m.length !== 0 && (se = m, m.forEach((d) => {
        d.addEventListener("input", c, !0), d.addEventListener("keyup", c, !0), d.addEventListener("change", c, !0), d.addEventListener("keypress", _, !0), d.addEventListener("keydown", N, !0);
      }));
    }, F = () => {
      se.forEach((f) => {
        f.removeEventListener("input", c), f.removeEventListener("keyup", c), f.removeEventListener("change", c), f.removeEventListener("keypress", _), f.removeEventListener("keydown", N);
      }), se = [];
    }, U = (f) => !!(f && f.closest && f.closest(".form-message, .form-fullscreen, .cm-email-gate")), c = (f) => {
      if (U(f.target)) return;
      const m = f.target;
      O.value = m.value;
    }, _ = (f) => {
      U(f.target) || f.key === "Enter" && !f.shiftKey && (f.preventDefault(), f.stopPropagation(), pn());
    }, N = (f) => {
      U(f.target) || f.key === "Enter" && !f.shiftKey && (f.preventDefault(), f.stopPropagation(), pn());
    }, E = (f) => {
      const m = f.target, d = document.querySelector(".header-menu-container");
      document.querySelector(".header-menu-btn");
      const Q = document.querySelector(".header-dropdown-menu");
      Q && !(d != null && d.contains(m)) && (Q.style.display = "none");
    }, j = oe(!0), {
      token: Z,
      start: ie,
      stop: Re,
      setToken: Ee,
      ensureFresh: Ue
    } = Ig({
      onTokenChanged: (f) => {
        Es() && St({ type: "TOKEN_UPDATE", token: f }), ce(f);
      },
      onIdentityExpired: () => {
        Ka();
      },
      // A framed widget holds the token only in memory: the host page keeps it, so
      // it must hear when the widget lets it go.
      onTokenCleared: () => {
        ji() && Es() && St({ type: "TOKEN_CLEAR" });
      },
      store: sf(n.value || "")
    });
    fe(() => !!Z.value);
    const ke = oe(null), Me = oe(!1), kt = oe(!1);
    t.initialAuthError && (ke.value = t.initialAuthError, Me.value = !0, j.value = !1), o();
    const ft = window.__INITIAL_DATA__;
    ie((ft == null ? void 0 : ft.widgetId) || "", ft == null ? void 0 : ft.initialToken), Z.value && (V.value = !0);
    const In = oe(!1);
    (ft == null ? void 0 : ft.allowAttachments) !== void 0 && (In.value = ft.allowAttachments);
    const ds = oe(null), {
      chatStyles: qn,
      chatIconStyles: Ns,
      agentBubbleStyles: On,
      userBubbleStyles: _t,
      messageNameStyles: Et,
      headerBorderStyles: Ps,
      photoUrl: Tt,
      shadowStyle: uo
    } = Mg(s), lr = oe(null), {
      uploadedAttachments: zt,
      previewModal: Zr,
      previewFile: Ln,
      formatFileSize: cr,
      isImageAttachment: ps,
      getDownloadUrl: Ms,
      getPreviewUrl: Jr,
      handleFileSelect: rt,
      handleDrop: Nn,
      handleDragOver: Qr,
      handleDragLeave: ur,
      handlePaste: Ds,
      removeAttachment: ei,
      openPreview: Fs,
      closePreview: $s,
      openFilePicker: ti,
      isImage: ni
    } = $g(Z, lr);
    fe(() => l.value.some(
      (f) => f.message_type === "form" && (!f.isSubmitted || f.isSubmitted === !1)
    ));
    const Pn = fe(() => {
      var f;
      return I.value && V.value || !go.value ? B.value === "connected" && !h.value : wr($.value.trim()) && B.value === "connected" && !h.value || ((f = window.__INITIAL_DATA__) == null ? void 0 : f.workflow);
    }), Ht = fe(() => Pn.value || h.value && B.value === "connected" && I.value), Bs = fe(() => B.value === "connected" ? tn.value ? "Ask me anything..." : "Type a message..." : "Connecting..."), Vn = oe(!1), Qt = fe(() => yg(O.value)), pn = async () => {
      if (!O.value.trim() && zt.value.length === 0 || Qt.value) return;
      if (h.value && I.value) {
        Vn.value = !0;
        return;
      }
      !I.value && $.value && await mn();
      const f = zt.value.map((Q) => ({
        content: Q.content,
        // base64 content
        filename: Q.filename,
        content_type: Q.type,
        size: Q.size
      }));
      g();
      const m = L.value;
      Ke.value = null, m && l.value.push({
        message: m.message,
        message_type: "bot",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: "",
        attributes: { source: m.source }
      }), await H(
        O.value,
        $.value,
        f,
        m ? { host_prompt: m.message, host_prompt_source: m.source } : {}
      ), zt.value.forEach((Q) => {
        Q.url && Q.url.startsWith("blob:") && URL.revokeObjectURL(Q.url), Q.file_url && Q.file_url.startsWith("blob:") && URL.revokeObjectURL(Q.file_url);
      }), O.value = "", zt.value = [];
      const d = document.querySelector('input[placeholder*="Type a message"]');
      d && (d.value = ""), Te(500);
    };
    Ot(h, (f) => {
      f || !Vn.value || (Vn.value = !1, B.value === "connected" && I.value && pn());
    });
    const Kn = (f) => {
      Pn.value && (O.value = f, pn());
    }, ms = () => {
      St({ type: "WIDGET_MINIMIZE" });
    }, si = (f) => {
      f.key === "Enter" && !f.shiftKey && (f.preventDefault(), f.stopPropagation(), pn());
    }, mn = async ({ afterRefusal: f = !1 } = {}) => {
      var m, d, Q, Se;
      try {
        if (!n.value)
          return console.error("Widget ID is not available"), ke.value = "Widget ID is not available. Please refresh and try again.", Me.value = !0, !1;
        await Ue(n.value);
        const ge = new URL(`${Os.API_URL}/widgets/${n.value}`);
        $.value.trim() && wr($.value.trim()) && ge.searchParams.append("email", $.value.trim());
        const lt = {
          Accept: "application/json",
          "Content-Type": "application/json"
        };
        Z.value && (lt.Authorization = `Bearer ${Z.value}`);
        const it = await fetch(ge, {
          headers: lt,
          cache: "no-store"
        });
        if (it.status === 401) {
          V.value = !1;
          try {
            const Qn = (await it.json()).detail;
            if ((Qn == null ? void 0 : Qn.code) === Sg)
              return Ka(), !1;
            const Ks = typeof Qn == "string" ? Qn : "";
            (Ks.includes("generate-token") || Ks.includes("API key") || Ks.includes("Token required")) && (kt.value = !0, ke.value = "Widget authentication not configured. Please contact the website administrator.", Me.value = !0, Ee(null));
          } catch {
            ke.value = "Authentication required. Your token has expired or is invalid. Please refresh the page.", Me.value = !0, Ee(null);
          }
          return !1;
        }
        if (!it.ok) {
          try {
            const _r = await it.json();
            ke.value = _r.detail || `Error: ${it.statusText}`;
          } catch {
            ke.value = `Error: ${it.statusText}. Please try again.`;
          }
          return Me.value = !0, !1;
        }
        const Ze = await it.json();
        Ze.token && Ee(Ze.token), V.value = !0, ke.value = null, Me.value = !1, ce(Z.value || void 0);
        const gr = await le();
        return !gr && sa(K.value) && !f ? await mn({ afterRefusal: !0 }) : (gr || console.error("Chat service not reachable yet; retrying in the background"), await ri(), (m = Ze.agent) != null && m.customization && i(Ze.agent.customization), Ze.agent && !(Ze != null && Ze.human_agent) && (r.value = Ze.agent.name), Ze != null && Ze.human_agent && (v.value = Ze.human_agent), ((d = Ze.agent) == null ? void 0 : d.allow_attachments) !== void 0 && (In.value = Ze.agent.allow_attachments), ((Q = Ze.agent) == null ? void 0 : Q.workflow) !== void 0 && (window.__INITIAL_DATA__ = window.__INITIAL_DATA__ || {}, window.__INITIAL_DATA__.workflow = Ze.agent.workflow), (Se = Ze.agent) != null && Se.workflow && await Le(), !0);
      } catch (ge) {
        return console.error("Error checking authorization:", ge), ke.value = "An unexpected error occurred. Please try again.", Me.value = !0, V.value = !1, !1;
      } finally {
        j.value = !1;
      }
    }, ri = async () => {
      !I.value && V.value && (I.value = !0, await R());
    }, gn = () => {
      ds.value && (ds.value.scrollTop = ds.value.scrollHeight);
    };
    Ot(() => l.value, (f) => {
      rs(() => {
        gn();
      });
    }, { deep: !0 }), Ot([gt, Ke], ([f, m]) => {
      (f || m) && rs(() => gn());
    }), Ot(B, (f, m) => {
      f === "connected" && m !== "connected" && Te(100);
    }), Ot(() => l.value.length, (f, m) => {
      f > 0 && m === 0 && Te(100);
    });
    let Us = null;
    Ot(() => l.value, (f) => {
      const m = f[f.length - 1];
      !pc(m) || m === Us || (Us = m, Hs(m));
    }, { deep: !0 });
    const zs = async () => {
      (await de() || sa(K.value)) && await mn();
    }, Mn = oe(!1), _n = oe(0), Wt = oe(""), en = oe(0), Dt = oe(!1), ut = oe({}), ht = oe(!1), at = oe({}), yn = oe(!1), Gn = oe(null), ii = oe("Start Chat"), bn = oe(!1), At = oe(null);
    fe(() => {
      var m;
      const f = l.value[l.value.length - 1];
      return ((m = f == null ? void 0 : f.attributes) == null ? void 0 : m.request_rating) || !1;
    });
    const gs = fe(() => {
      var m;
      if (!((m = window.__INITIAL_DATA__) != null && m.workflow))
        return !1;
      const f = l.value.find((d) => d.message_type === "rating");
      return (f == null ? void 0 : f.isSubmitted) === !0;
    }), vn = fe(
      () => Hi(v.value.human_agent_profile_pic)
    ), Hs = async (f) => {
      var m, d, Q, Se, ge;
      if (pc(f)) {
        try {
          if (f.session_id && Z.value && n.value) {
            const lt = await Va(f.session_id, {
              reason: (m = f.attributes) == null ? void 0 : m.end_chat_reason,
              description: (d = f.attributes) == null ? void 0 : d.end_chat_description
            });
            if (lt.ok) {
              const it = await lt.json();
              console.info(`✓ Chat session closed on backend: ${it.session_id}`);
            } else
              console.warn(`Failed to close session on backend: ${lt.status}`);
          }
        } catch (lt) {
          console.error("Error calling end-chat API:", lt);
        }
        if ((Q = f.attributes) != null && Q.end_chat && ((Se = f.attributes) != null && Se.request_rating)) {
          const lt = f.agent_name || ((ge = v.value) == null ? void 0 : ge.human_agent_name) || r.value || "our agent";
          l.value.push({
            message: `Rate the chat session that you had with ${lt}`,
            message_type: "rating",
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            session_id: f.session_id,
            agent_name: lt,
            showFeedback: !1
          }), et.value = f.session_id;
        }
      }
    }, fr = (f) => {
      Dt.value || (en.value = f);
    }, G = () => {
      if (!Dt.value) {
        const f = l.value[l.value.length - 1];
        en.value = (f == null ? void 0 : f.selectedRating) || 0;
      }
    }, p = async (f) => {
      if (!Dt.value) {
        en.value = f;
        const m = l.value[l.value.length - 1];
        m && m.message_type === "rating" && (m.showFeedback = !0, m.selectedRating = f);
      }
    }, T = async (f, m, d = null) => {
      try {
        Dt.value = !0, await ae(m, d);
        const Q = l.value.find((Se) => Se.message_type === "rating");
        Q && (Q.isSubmitted = !0, Q.finalRating = m, Q.finalFeedback = d);
      } catch (Q) {
        console.error("Failed to submit rating:", Q);
      } finally {
        Dt.value = !1;
      }
    }, z = (f) => {
      const m = {};
      for (const d of f.fields) {
        const Q = ut.value[d.name], Se = ze(d, Q);
        Se && (m[d.name] = Se);
      }
      return at.value = m, Object.keys(m).length === 0;
    }, te = async (f) => {
      if (!(ht.value || !z(f)))
        try {
          ht.value = !0, await Oe(ut.value);
          const d = l.value.findIndex(
            (Q) => Q.message_type === "form" && (!Q.isSubmitted || Q.isSubmitted === !1)
          );
          d !== -1 && l.value.splice(d, 1), ut.value = {}, at.value = {};
        } catch (d) {
          console.error("Failed to submit form:", d);
        } finally {
          ht.value = !1;
        }
    }, ne = (f, m) => {
      var d, Q;
      if (ut.value[f] = m, m && m.toString().trim() !== "") {
        let Se = null;
        if ((d = At.value) != null && d.fields && (Se = At.value.fields.find((ge) => ge.name === f)), !Se && ((Q = _e.value) != null && Q.fields) && (Se = _e.value.fields.find((ge) => ge.name === f)), Se) {
          const ge = ze(Se, m);
          ge ? (at.value[f] = ge, console.log(`Validation error for ${f}:`, ge)) : delete at.value[f];
        }
      } else
        delete at.value[f], console.log(`Cleared error for ${f}`);
    }, me = (f) => {
      const m = f.replace(/\D/g, "");
      return m.length >= 7 && m.length <= 15;
    }, ze = (f, m) => {
      if (f.required && (!m || m.toString().trim() === ""))
        return `${f.label} is required`;
      if (!m || m.toString().trim() === "")
        return null;
      if (f.type === "email" && !wr(m))
        return "Please enter a valid email address";
      if (f.type === "tel" && !me(m))
        return "Please enter a valid phone number";
      if ((f.type === "text" || f.type === "textarea") && f.minLength && m.length < f.minLength)
        return `${f.label} must be at least ${f.minLength} characters`;
      if ((f.type === "text" || f.type === "textarea") && f.maxLength && m.length > f.maxLength)
        return `${f.label} must not exceed ${f.maxLength} characters`;
      if (f.type === "number") {
        const d = parseFloat(m);
        if (isNaN(d))
          return `${f.label} must be a valid number`;
        if (f.minLength && d < f.minLength)
          return `${f.label} must be at least ${f.minLength}`;
        if (f.maxLength && d > f.maxLength)
          return `${f.label} must not exceed ${f.maxLength}`;
      }
      return null;
    }, nt = async () => {
      if (!(ht.value || !At.value))
        try {
          ht.value = !0, at.value = {};
          let f = !1;
          for (const m of At.value.fields || []) {
            const d = ut.value[m.name], Q = ze(m, d);
            Q && (at.value[m.name] = Q, f = !0, console.log(`Validation error for field ${m.name}:`, Q));
          }
          if (f) {
            ht.value = !1, console.log("Validation failed, not submitting");
            return;
          }
          await Oe(ut.value), bn.value = !1, At.value = null, ut.value = {};
        } catch (f) {
          console.error("Failed to submit full screen form:", f);
        } finally {
          ht.value = !1, console.log("Full screen form submission completed");
        }
    }, Ct = (f, m) => {
      if (console.log("handleViewDetails called with:", { product: f, shopDomain: m }), !f) {
        console.error("No product provided to handleViewDetails");
        return;
      }
      let d = null;
      if (f.handle && m)
        d = `https://${m}/products/${f.handle}`;
      else if (f.id && m)
        d = `https://${m}/products/${f.id}`;
      else if (m) {
        if (!f.handle && !f.id) {
          console.error("Product handle and ID are both missing! Product:", f), alert("Unable to open product: Product information incomplete.");
          return;
        }
      } else {
        console.error("Shop domain is missing! Product:", f), alert("Unable to open product: Shop domain not available. Please contact support.");
        return;
      }
      d && (console.log("Opening product URL:", d), window.open(d, "_blank", "noopener"));
    }, Rt = (f) => {
      if (!f) return "";
      let m = f.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "");
      const d = [];
      return m = m.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (Q, Se, ge) => {
        const lt = `__MARKDOWN_LINK_${d.length}__`;
        return console.log("Found markdown link:", Q, "-> placeholder:", lt), d.push(Q), lt;
      }), console.log("After replacing markdown links with placeholders:", m), console.log("Markdown links array:", d), m = m.replace(/https?:\/\/[^\s\)]+/g, "[link removed]"), console.log("After removing standalone URLs:", m), d.forEach((Q, Se) => {
        m = m.replace(`__MARKDOWN_LINK_${Se}__`, Q), console.log(`Restored markdown link ${Se}:`, Q);
      }), m = m.replace(/\n\s*\n\s*\n/g, `

`).trim(), m;
    }, Ws = oe(!1);
    oe(!1);
    const yt = fe(() => {
      var f;
      return !!((f = v.value) != null && f.human_agent_name);
    }), hr = fe(() => {
      var f;
      return Tg((f = window.__INITIAL_DATA__) == null ? void 0 : f.presence, yt.value);
    }), qa = fe(() => In.value && yt.value && zt.value.length < Rc), yf = async () => {
      try {
        yn.value = !1, Gn.value = null, await ve();
      } catch (f) {
        console.error("Failed to proceed workflow:", f);
      }
    }, fo = async (f) => {
      try {
        if (!f.userInputValue || !f.userInputValue.trim())
          return;
        const m = f.userInputValue.trim();
        f.isSubmitted = !0, f.submittedValue = m, await H(m, $.value);
      } catch (m) {
        console.error("Failed to submit user input:", m), f.isSubmitted = !1, f.submittedValue = null;
      }
    }, Va = (f, { reason: m, description: d, keepalive: Q = !1 } = {}) => {
      const Se = new URL(`${Os.API_URL}/widgets/${n.value}/end-chat`);
      return Se.searchParams.append("session_id", f), m && Se.searchParams.append("reason", m), d && Se.searchParams.append("description", d), fetch(Se, {
        method: "POST",
        keepalive: Q,
        headers: {
          Authorization: `Bearer ${Z.value}`,
          "Content-Type": "application/json"
        }
      });
    }, bf = async (f) => {
      try {
        typeof f == "string" && f && Z.value && n.value && await Va(f, { reason: "CUSTOMER_REQUEST", keepalive: !0 });
      } catch {
      } finally {
        St({ type: "END_CHAT_DONE" });
      }
    }, Ka = () => {
      if (!Es()) {
        Ga();
        return;
      }
      St({ type: "IDENTITY_EXPIRED" });
    }, Ga = async () => {
      Z.value && (Ee(null), await dr());
    }, vf = async (f) => {
      const m = os(f);
      !m || m === Z.value || (Ee(m), await dr());
    }, dr = async () => {
      var f, m, d;
      try {
        let Q = 0;
        const Se = 50;
        for (; !((f = window.__INITIAL_DATA__) != null && f.widgetId) && Q < Se; )
          await new Promise((lt) => setTimeout(lt, 100)), Q++;
        return (m = window.__INITIAL_DATA__) != null && m.widgetId ? (ye(window.__INITIAL_DATA__.widgetId), await mn() ? ((d = window.__INITIAL_DATA__) != null && d.workflow && V.value && await Le(), !0) : (B.value = "connected", !1)) : (console.error("Widget data not available after waiting"), !1);
      } catch (Q) {
        return console.error("Failed to initialize widget:", Q), !1;
      }
    };
    window.addEventListener("message", (f) => {
      f.source === window.parent && (!f.data || typeof f.data.type != "string" || (f.data.type === "SCROLL_TO_BOTTOM" && gn(), f.data.type === "HOST_PAGE" && nf(f.data.url), f.data.type === "END_CHAT" && Es() && bf(f.data.sessionId), f.data.type === "IDENTITY_UNAVAILABLE" && Es() && Ga(), f.data.type === "TOKEN_REFRESH" && Es() && vf(f.data.token), f.data.type === "WIDGET_VISIBILITY" && (rl.value = !!f.data.open), f.data.type === "WIDGET_DISPLAY" && (_o.value = {
        mode: f.data.mode,
        width: f.data.width,
        height: f.data.height,
        hotkey: f.data.hotkey
      }), f.data.type === "PREFILL_MESSAGE" && typeof f.data.text == "string" && (O.value = f.data.text.slice(0, 2e3), rs(() => {
        const m = document.querySelector(
          ".message-input input, .welcome-message-field"
        );
        m == null || m.focus();
      }))));
    }), window.addEventListener("keydown", (f) => {
      f.key !== "Escape" || f.defaultPrevented || !ji() || St({ type: "WIDGET_ESCAPE" });
    });
    const wf = () => {
      q(async () => {
        await mn();
      }), Ye(async () => {
        await mn();
      }), pe(({ session_id: f, authenticated: m, created: d }) => {
        St({
          type: "CHAT_SESSION",
          sessionId: f,
          authenticated: m,
          created: d
        });
      }), Ve((f) => {
        var m;
        if (ii.value = f.button_text || "Start Chat", f.type === "landing_page")
          Gn.value = f.landing_page_data, yn.value = !0, bn.value = !1;
        else if (f.type === "form" || f.type === "display_form")
          if (((m = f.form_data) == null ? void 0 : m.form_full_screen) === !0)
            At.value = f.form_data, bn.value = !0, yn.value = !1;
          else {
            const d = {
              message: "",
              message_type: "form",
              attributes: {
                form_data: f.form_data
              },
              created_at: (/* @__PURE__ */ new Date()).toISOString(),
              isSubmitted: !1
            };
            l.value.findIndex(
              (Se) => Se.message_type === "form" && !Se.isSubmitted
            ) === -1 && l.value.push(d), yn.value = !1, bn.value = !1;
          }
        else
          yn.value = !1, bn.value = !1;
      }), Fe((f) => {
        console.log("Workflow proceeded:", f);
      });
    }, kf = async () => {
      try {
        await dr(), await Le();
      } catch (f) {
        throw console.error("Failed to start new conversation:", f), f;
      }
    }, oi = fe(
      () => {
        var f;
        return s.value.allow_new_chat === !0 && l.value.length > 0 && !((f = v.value) != null && f.human_agent_name) && !ys.value;
      }
    ), Yn = oe(!1), Xn = oe(""), Zn = oe(!1);
    let _s = null;
    const js = () => {
      Zn.value = !1, Xn.value = "", _s && (clearTimeout(_s), _s = null);
    }, Ya = () => {
      if (!Yn.value) {
        if (Zn.value) {
          js();
          return;
        }
        Zn.value = !0, Xn.value = "", _s = setTimeout(js, Rm);
      }
    };
    Ot(oi, (f) => {
      f || js();
    });
    const Xa = async () => {
      Yn.value || (_s && (clearTimeout(_s), _s = null), await Tf(), Xn.value || (Zn.value = !1));
    }, Tf = async () => {
      if (!Yn.value) {
        Yn.value = !0, Xn.value = "";
        try {
          if (!await he()) {
            Xn.value = dc;
            return;
          }
          v.value = {}, O.value = "", zt.value = [], await dr();
        } catch (f) {
          console.error("Failed to start a new chat:", f), Xn.value = dc;
        } finally {
          Yn.value = !1;
        }
      }
    }, Af = async () => {
      gs.value = !1, l.value = [], v.value = {}, await kf();
    };
    eo(async () => {
      await dr(), wf(), Y(), document.addEventListener("click", E), (() => {
        const m = l.value.length > 0, d = B.value === "connected", Q = document.querySelector('input[type="text"], textarea') !== null;
        return m || d || Q;
      })() && Te(100);
    }), Gr(() => {
      window.removeEventListener("message", (f) => {
        f.data.type === "SCROLL_TO_BOTTOM" && gn();
      }), document.removeEventListener("click", E), ee && (ee.disconnect(), ee = null), Y.timeoutId && (clearTimeout(Y.timeoutId), Y.timeoutId = null), we = !0, Ae(), F(), Re(), js(), C();
    });
    const qs = fe(() => s.value.chat_style === "AURORA"), tn = fe(() => s.value.chat_style === "ASK_ANYTHING" || qs.value), Za = fe(() => s.value.customization_metadata), pr = fe(() => {
      var m;
      const f = (m = Za.value) == null ? void 0 : m.avatar_style;
      return f === "orb" ? !0 : f === "photo" ? !1 : qs.value && !s.value.photo_url;
    }), Vs = fe(() => {
      var f;
      return wg(r.value || "", (f = Za.value) == null ? void 0 : f.orb_variant);
    }), Sf = {
      GLASS: "theme-glass",
      TERMINAL: "theme-terminal",
      PLAYFUL: "theme-playful",
      CALM_MINT: "theme-calm",
      SUNRISE: "theme-sunrise"
    }, xf = fe(() => Sf[s.value.chat_style] || ""), Ef = fe(() => cy(s.value.chat_style, {
      chat_background_color: s.value.chat_background_color,
      chat_text_color: s.value.chat_text_color,
      accent_color: s.value.accent_color,
      font_family: s.value.font_family
    })), ho = fe(
      () => Array.isArray(s.value.quick_actions) ? s.value.quick_actions.filter((f) => !!f && f.trim().length > 0) : []
    ), Ja = fe(() => (s.value.welcome_message || "").trim()), Qa = fe(
      () => !tn.value && l.value.length === 0 && !b.value && !ys.value
    ), Cf = fe(
      () => Qa.value && Ja.value.length > 0
    ), Rf = fe(
      () => Qa.value && !gs.value && ho.value.length > 0
    ), ai = fe(() => s.value.show_citations === !0), el = fe(() => kg(s.value.show_ai_disclaimer, yt.value)), If = (f) => /^[0-9a-f]{16,}$/i.test(f) || /^[0-9a-f-]{32,}$/i.test(f), po = (f) => {
      const m = (f || "").trim().toLowerCase();
      return !m || m === "unknown" ? "Knowledge base" : m.charAt(0).toUpperCase() + m.slice(1);
    }, mo = (f) => {
      let m = ((f == null ? void 0 : f.name) || "").trim();
      return !m || (m = m.replace(/^[0-9a-f]{16,}[_-]/i, "").replace(/\.(pdf|txt|md|html?|docx?|csv|json)$/i, ""), !m || If(m)) ? po(f == null ? void 0 : f.type) : m;
    }, tl = (f) => {
      const m = mo(f), d = po(f == null ? void 0 : f.type);
      return m === d ? d : `${m} · ${d}`;
    }, go = fe(() => s.value.collect_email === !0 && !tn.value), nl = oe(!1), Jn = oe(""), mr = oe(!1), ys = fe(() => !I.value && go.value && !nl.value), sl = async () => {
      const f = $.value.trim();
      if (!f) {
        Jn.value = "Please enter your email address.";
        return;
      }
      if (!wr(f)) {
        Jn.value = "Please enter a valid email address.";
        return;
      }
      Jn.value = "", mr.value = !0;
      try {
        await mn(), nl.value = !0;
      } catch {
        Jn.value = "Something went wrong. Please try again.";
      } finally {
        mr.value = !1;
      }
    }, _o = oe(null), rl = oe(!0), yo = { mode: "floating", width: 400, height: 560 }, li = fe(
      () => {
        var f;
        return _o.value || ((f = s.value.customization_metadata) == null ? void 0 : f.widget_display) || null;
      }
    ), Of = fe(() => {
      const f = li.value;
      return f ? typeof f.mode == "string" && f.mode !== yo.mode || typeof f.width == "number" && f.width !== yo.width || typeof f.height == "number" && f.height !== yo.height : !1;
    }), Lf = fe(() => {
      var m;
      const f = {
        width: "100%",
        height: "100%",
        borderRadius: "var(--radius-lg)"
      };
      if (Of.value) {
        const d = (m = li.value) == null ? void 0 : m.mode;
        return d === "sidebar-left" || d === "sidebar-right" ? { ...f, borderRadius: "0" } : f;
      }
      return tn.value ? window.innerWidth <= 768 ? {
        ...f,
        width: "100vw",
        height: "100vh",
        maxWidth: "100vw",
        maxHeight: "100vh",
        minWidth: "unset",
        borderRadius: "0"
      } : window.innerWidth <= 1024 ? {
        ...f,
        width: "95%",
        maxWidth: "700px",
        minWidth: "500px",
        height: "650px"
      } : {
        ...f,
        width: "100%",
        maxWidth: "400px",
        minWidth: "400px",
        height: "580px"
      } : f;
    }), il = fe(() => tn.value && l.value.length === 0), Nf = ["form", "user_input", "rating", "product", "shopify_output"], Pf = fe(
      () => l.value.some(
        (f) => Nf.includes(f.message_type) || Array.isArray(f.attachments) && f.attachments.length > 0
      )
    ), Mf = fe(() => {
      var m, d;
      return tn.value ? !0 : (((m = li.value) == null ? void 0 : m.mode) === "ask-ai" || ((d = li.value) == null ? void 0 : d.mode) === "search-bar") && !In.value;
    }), bo = fe(
      () => Mf.value && X.value && !yn.value && !bn.value && !ys.value && !gs.value && !Pf.value
    );
    Ot(bo, (f) => {
      St({ type: "WIDGET_SURFACE", palette: f });
    }, { immediate: !0 });
    const Df = fe(
      () => s.value.welcome_subtitle || `Ask a question — ${r.value || "the assistant"} answers from what it knows.`
    ), Ff = fe(() => {
      var f;
      return ((f = _o.value) == null ? void 0 : f.hotkey) !== !1;
    });
    return (f, m) => Me.value && kt.value ? (A(), x("div", fy, [
      y("button", {
        type: "button",
        class: "cm-error-close",
        "aria-label": "Close chat",
        title: "Close",
        onClick: ms
      }, "×"),
      m[22] || (m[22] = ws('<div class="widget-unavailable-card" data-v-42cc9b20><div class="widget-unavailable-icon-wrapper" data-v-42cc9b20><svg class="widget-unavailable-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-v-42cc9b20><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" data-v-42cc9b20></path><path d="M9 12l2 2 4-4" data-v-42cc9b20></path></svg></div><h2 class="widget-unavailable-title" data-v-42cc9b20>Chat Unavailable</h2><p class="widget-unavailable-message" data-v-42cc9b20> This chat widget is not currently configured. Please contact the website administrator to enable chat support. </p><div class="widget-unavailable-footer" data-v-42cc9b20><svg class="chattermate-logo-small" width="14" height="14" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-42cc9b20><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-42cc9b20></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-42cc9b20></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-42cc9b20></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-42cc9b20></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-42cc9b20><span class="cm-powered-prefix" data-v-42cc9b20>Powered by </span><strong class="cm-brand" data-v-42cc9b20>ChatterMate</strong></a></div></div>', 1))
    ])) : Me.value ? (A(), x("div", hy, [
      y("button", {
        type: "button",
        class: "cm-error-close",
        "aria-label": "Close chat",
        title: "Close",
        onClick: ms
      }, "×"),
      y("div", dy, [
        m[23] || (m[23] = ws('<div class="auth-error-header" data-v-42cc9b20><svg class="auth-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-42cc9b20><circle cx="12" cy="12" r="10" data-v-42cc9b20></circle><line x1="12" y1="8" x2="12" y2="12" data-v-42cc9b20></line><line x1="12" y1="16" x2="12.01" y2="16" data-v-42cc9b20></line></svg><h2 data-v-42cc9b20>Authentication Error</h2></div>', 1)),
        y("p", py, J(ke.value), 1),
        y("button", {
          class: "auth-error-refresh-btn",
          onClick: m[0] || (m[0] = () => f.window.location.reload())
        }, " Refresh Page ")
      ])
    ])) : n.value && !Me.value ? (A(), x("div", {
      key: 2,
      class: $e(["chat-container cm-surface", [{ collapsed: !X.value, "ask-anything-style": tn.value, aurora: qs.value }, xf.value]]),
      style: Ce({ ...S(uo), ...Lf.value, ...Ef.value })
    }, [
      j.value ? (A(), x("div", my, m[24] || (m[24] = [
        ws('<div class="loading-spinner" data-v-42cc9b20><div class="dot" data-v-42cc9b20></div><div class="dot" data-v-42cc9b20></div><div class="dot" data-v-42cc9b20></div></div><div class="loading-text" data-v-42cc9b20>Initializing chat...</div>', 2)
      ]))) : re("", !0),
      !j.value && S(B) !== "connected" ? (A(), x("div", {
        key: 1,
        class: $e(["connection-status", S(B)])
      }, [
        S(B) === "connecting" ? (A(), x("div", gy, m[25] || (m[25] = [
          cn(" Connecting to chat service... ", -1),
          y("div", { class: "loading-dots" }, [
            y("div", { class: "dot" }),
            y("div", { class: "dot" }),
            y("div", { class: "dot" })
          ], -1)
        ]))) : S(B) === "failed" ? (A(), x("div", _y, [
          m[26] || (m[26] = cn(" Connection failed. ", -1)),
          y("button", {
            onClick: zs,
            class: "reconnect-button"
          }, " Click here to reconnect ")
        ])) : re("", !0)
      ], 2)) : re("", !0),
      S(k) ? (A(), x("div", {
        key: 2,
        class: "error-alert",
        style: Ce(S(Ns))
      }, J(S(u)), 5)) : re("", !0),
      bo.value ? (A(), Br(ng, {
        key: 3,
        messages: S(l),
        draft: O.value,
        "agent-name": S(r),
        suggestions: ho.value,
        "welcome-title": S(s).welcome_title,
        "welcome-subtitle": Df.value,
        placeholder: Bs.value,
        "input-enabled": Pn.value,
        "typing-enabled": Ht.value,
        loading: S(h),
        "show-citations": ai.value,
        disclaimer: el.value ? S(mc) : "",
        active: rl.value,
        hotkey: Ff.value,
        "can-start-new-chat": oi.value,
        "starting-new-chat": Yn.value,
        "new-chat-armed": Zn.value,
        "new-chat-error": Xn.value,
        onNewChat: Ya,
        onConfirmNewChat: Xa,
        onCancelNewChat: js,
        "citation-label": mo,
        "citation-tooltip": tl,
        "display-text": S(P),
        "is-streaming": S(D),
        "onUpdate:draft": m[1] || (m[1] = (d) => O.value = d),
        onSend: pn,
        onAsk: Kn,
        onClose: ms
      }, null, 8, ["messages", "draft", "agent-name", "suggestions", "welcome-title", "welcome-subtitle", "placeholder", "input-enabled", "typing-enabled", "loading", "show-citations", "disclaimer", "active", "hotkey", "can-start-new-chat", "starting-new-chat", "new-chat-armed", "new-chat-error", "display-text", "is-streaming"])) : il.value ? (A(), x("div", {
        key: 4,
        class: $e(["welcome-message-section", { aurora: qs.value }]),
        style: Ce(S(qn))
      }, [
        y("div", yy, [
          y("div", by, [
            pr.value ? (A(), x("div", {
              key: 0,
              class: "welcome-orb",
              style: Ce(Vs.value)
            }, null, 4)) : S(Tt) ? (A(), x("img", {
              key: 1,
              src: S(Tt),
              alt: S(r),
              class: "welcome-avatar"
            }, null, 8, vy)) : re("", !0),
            y("h1", wy, J(S(s).welcome_title || `Welcome to ${S(r)}`), 1),
            y("p", ky, J(S(s).welcome_subtitle || "I'm here to help you with anything you need. What can I assist you with today?"), 1)
          ])
        ]),
        y("div", Ty, [
          !S(I) && !V.value && go.value ? (A(), x("div", Ay, [
            es(y("input", {
              "onUpdate:modelValue": m[2] || (m[2] = (d) => $.value = d),
              type: "email",
              placeholder: "Enter your email address",
              disabled: S(h) || S(B) !== "connected",
              class: $e([{
                invalid: $.value.trim() && !S(wr)($.value.trim()),
                disabled: S(B) !== "connected"
              }, "welcome-email-input"])
            }, null, 10, Sy), [
              [ks, $.value]
            ])
          ])) : re("", !0),
          y("div", xy, [
            es(y("input", {
              "onUpdate:modelValue": m[3] || (m[3] = (d) => O.value = d),
              type: "text",
              placeholder: Bs.value,
              onKeypress: si,
              onInput: W,
              onChange: W,
              disabled: !Ht.value,
              class: $e([{ disabled: !Ht.value }, "welcome-message-field"])
            }, null, 42, Ey), [
              [ks, O.value]
            ]),
            y("button", {
              class: $e(["welcome-send-button", { "aurora-send": qs.value }]),
              style: Ce(S(_t)),
              onClick: pn,
              disabled: !O.value.trim() || !Pn.value || Qt.value
            }, [
              qs.value ? (A(), x("svg", Ry, m[27] || (m[27] = [
                y("path", {
                  d: "M12 19V5M12 5L5 12M12 5L19 12",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                }, null, -1)
              ]))) : (A(), x("svg", Iy, m[28] || (m[28] = [
                y("path", {
                  d: "M5 12L3 21L21 12L3 3L5 12ZM5 12L13 12",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                }, null, -1)
              ])))
            ], 14, Cy)
          ])
        ]),
        y("div", {
          class: "powered-by-welcome",
          style: Ce(S(Et))
        }, m[29] || (m[29] = [
          ws('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-42cc9b20><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-42cc9b20></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-42cc9b20></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-42cc9b20></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-42cc9b20></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-42cc9b20><span class="cm-powered-prefix" data-v-42cc9b20>Powered by </span><strong class="cm-brand" data-v-42cc9b20>ChatterMate</strong></a>', 2)
        ]), 4)
      ], 6)) : re("", !0),
      yn.value && Gn.value ? (A(), x("div", {
        key: 5,
        class: "landing-page-fullscreen",
        style: Ce(S(qn))
      }, [
        y("div", Oy, [
          y("div", Ly, [
            y("h2", Ny, J(Gn.value.heading), 1),
            y("div", Py, J(Gn.value.content), 1)
          ]),
          y("div", My, [
            y("button", {
              class: "landing-page-button",
              onClick: yf
            }, J(ii.value), 1)
          ])
        ]),
        y("div", {
          class: "powered-by-landing",
          style: Ce(S(Et))
        }, m[30] || (m[30] = [
          ws('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-42cc9b20><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-42cc9b20></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-42cc9b20></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-42cc9b20></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-42cc9b20></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-42cc9b20><span class="cm-powered-prefix" data-v-42cc9b20>Powered by </span><strong class="cm-brand" data-v-42cc9b20>ChatterMate</strong></a>', 2)
        ]), 4)
      ], 4)) : bn.value && At.value ? (A(), x("div", {
        key: 6,
        class: "form-fullscreen",
        style: Ce(S(qn))
      }, [
        y("div", Dy, [
          At.value.title || At.value.description ? (A(), x("div", Fy, [
            At.value.title ? (A(), x("h2", $y, J(At.value.title), 1)) : re("", !0),
            At.value.description ? (A(), x("p", By, J(At.value.description), 1)) : re("", !0)
          ])) : re("", !0),
          y("div", Uy, [
            (A(!0), x(Ie, null, bt(At.value.fields, (d) => {
              var Q, Se;
              return A(), x("div", {
                key: d.name,
                class: "form-field"
              }, [
                y("label", {
                  for: `fullscreen-form-${d.name}`,
                  class: "field-label"
                }, [
                  cn(J(d.label) + " ", 1),
                  d.required ? (A(), x("span", Hy, "*")) : re("", !0)
                ], 8, zy),
                d.type === "text" || d.type === "email" || d.type === "tel" ? (A(), x("input", {
                  key: 0,
                  id: `fullscreen-form-${d.name}`,
                  type: d.type,
                  placeholder: d.placeholder || "",
                  required: d.required,
                  minlength: d.minLength,
                  maxlength: d.maxLength,
                  value: ut.value[d.name] || "",
                  onInput: (ge) => ne(d.name, ge.target.value),
                  onBlur: (ge) => ne(d.name, ge.target.value),
                  class: $e(["form-input", { error: at.value[d.name] }]),
                  autocomplete: d.type === "email" ? "email" : d.type === "tel" ? "tel" : "off",
                  inputmode: d.type === "tel" ? "tel" : d.type === "email" ? "email" : "text"
                }, null, 42, Wy)) : d.type === "number" ? (A(), x("input", {
                  key: 1,
                  id: `fullscreen-form-${d.name}`,
                  type: "number",
                  placeholder: d.placeholder || "",
                  required: d.required,
                  min: d.minLength,
                  max: d.maxLength,
                  value: ut.value[d.name] || "",
                  onInput: (ge) => ne(d.name, ge.target.value),
                  class: $e(["form-input", { error: at.value[d.name] }])
                }, null, 42, jy)) : d.type === "textarea" ? (A(), x("textarea", {
                  key: 2,
                  id: `fullscreen-form-${d.name}`,
                  placeholder: d.placeholder || "",
                  required: d.required,
                  minlength: d.minLength,
                  maxlength: d.maxLength,
                  value: ut.value[d.name] || "",
                  onInput: (ge) => ne(d.name, ge.target.value),
                  class: $e(["form-textarea", { error: at.value[d.name] }]),
                  rows: "4"
                }, null, 42, qy)) : d.type === "select" ? (A(), x("select", {
                  key: 3,
                  id: `fullscreen-form-${d.name}`,
                  required: d.required,
                  value: ut.value[d.name] || "",
                  onChange: (ge) => ne(d.name, ge.target.value),
                  class: $e(["form-select", { error: at.value[d.name] }])
                }, [
                  y("option", Ky, J(d.placeholder || "Please select..."), 1),
                  (A(!0), x(Ie, null, bt((Array.isArray(d.options) ? d.options : ((Q = d.options) == null ? void 0 : Q.split(`
`)) || []).filter((ge) => ge.trim()), (ge) => (A(), x("option", {
                    key: ge,
                    value: ge.trim()
                  }, J(ge.trim()), 9, Gy))), 128))
                ], 42, Vy)) : d.type === "checkbox" ? (A(), x("label", Yy, [
                  y("input", {
                    id: `fullscreen-form-${d.name}`,
                    type: "checkbox",
                    required: d.required,
                    checked: ut.value[d.name] || !1,
                    onChange: (ge) => ne(d.name, ge.target.checked),
                    class: "form-checkbox"
                  }, null, 40, Xy),
                  y("span", Zy, J(d.label), 1)
                ])) : d.type === "radio" ? (A(), x("div", Jy, [
                  (A(!0), x(Ie, null, bt((Array.isArray(d.options) ? d.options : ((Se = d.options) == null ? void 0 : Se.split(`
`)) || []).filter((ge) => ge.trim()), (ge) => (A(), x("label", {
                    key: ge,
                    class: "radio-field"
                  }, [
                    y("input", {
                      type: "radio",
                      name: `fullscreen-form-${d.name}`,
                      value: ge.trim(),
                      required: d.required,
                      checked: ut.value[d.name] === ge.trim(),
                      onChange: (lt) => ne(d.name, ge.trim()),
                      class: "form-radio"
                    }, null, 40, Qy),
                    y("span", eb, J(ge.trim()), 1)
                  ]))), 128))
                ])) : re("", !0),
                at.value[d.name] ? (A(), x("div", tb, J(at.value[d.name]), 1)) : re("", !0)
              ]);
            }), 128))
          ]),
          y("div", nb, [
            y("button", {
              onClick: m[4] || (m[4] = () => {
                console.log("Submit button clicked!"), nt();
              }),
              disabled: ht.value,
              class: "submit-form-button",
              style: Ce(S(_t))
            }, [
              ht.value ? (A(), x("span", rb, m[31] || (m[31] = [
                y("div", { class: "dot" }, null, -1),
                y("div", { class: "dot" }, null, -1),
                y("div", { class: "dot" }, null, -1)
              ]))) : (A(), x("span", ib, J(At.value.submit_button_text || "Submit"), 1))
            ], 12, sb)
          ])
        ]),
        y("div", {
          class: "powered-by-landing",
          style: Ce(S(Et))
        }, m[32] || (m[32] = [
          ws('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-42cc9b20><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-42cc9b20></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-42cc9b20></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-42cc9b20></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-42cc9b20></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-42cc9b20><span class="cm-powered-prefix" data-v-42cc9b20>Powered by </span><strong class="cm-brand" data-v-42cc9b20>ChatterMate</strong></a>', 2)
        ]), 4)
      ], 4)) : !il.value && X.value && !bo.value ? (A(), x("div", {
        key: 7,
        class: $e(["chat-panel", { "ask-anything-chat": tn.value }]),
        style: Ce(S(qn))
      }, [
        tn.value ? (A(), x("div", {
          key: 1,
          class: "ask-anything-top",
          style: Ce(S(Ps))
        }, [
          y("div", db, [
            vn.value || S(Tt) ? (A(), x("img", {
              key: 0,
              src: vn.value || S(Tt),
              alt: S(v).human_agent_name || S(r),
              class: "header-avatar"
            }, null, 8, pb)) : re("", !0),
            y("div", mb, [
              y("h3", {
                style: Ce(S(Et))
              }, J(S(r)), 5),
              y("p", {
                class: "ask-anything-subtitle",
                style: Ce(S(Et))
              }, J(S(s).welcome_subtitle || "Ask me anything. I'm here to help."), 5)
            ])
          ])
        ], 4)) : (A(), x("div", {
          key: 0,
          class: "chat-header",
          style: Ce(S(Ps))
        }, [
          y("div", {
            class: "cm-header-sheen",
            style: Ce({ background: "linear-gradient(90deg, transparent, " + (S(s).accent_color || "#C9F24E") + ", transparent)" })
          }, null, 4),
          y("div", ob, [
            !vn.value && (pr.value || !S(Tt)) ? (A(), x("div", {
              key: 0,
              class: "header-orb",
              style: Ce(Vs.value)
            }, null, 4)) : vn.value || S(Tt) ? (A(), x("img", {
              key: 1,
              src: vn.value || S(Tt),
              alt: S(v).human_agent_name || S(r),
              class: "header-avatar"
            }, null, 8, ab)) : re("", !0),
            y("div", lb, [
              y("h3", {
                style: Ce(S(Et))
              }, J(S(v).human_agent_name || S(r)), 5),
              y("div", cb, [
                y("span", {
                  class: $e(["status-indicator", hr.value.online ? "online" : "away"])
                }, null, 2),
                y("span", ub, J(hr.value.text), 1)
              ])
            ])
          ]),
          y("div", fb, [
            oi.value ? (A(), x("button", {
              key: 0,
              type: "button",
              class: $e(["header-new-chat", { armed: Zn.value }]),
              style: Ce(S(Et)),
              disabled: Yn.value,
              title: S(zi),
              "aria-label": S(zi),
              "aria-expanded": Zn.value,
              onClick: Ya
            }, m[33] || (m[33] = [
              y("svg", {
                width: "16",
                height: "16",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                "stroke-width": "2",
                "stroke-linecap": "round",
                "stroke-linejoin": "round",
                "aria-hidden": "true"
              }, [
                y("path", { d: "M12 20h9" }),
                y("path", { d: "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" })
              ], -1)
            ]), 14, hb)) : re("", !0),
            y("button", {
              type: "button",
              class: "header-minimize",
              style: Ce(S(Et)),
              title: "Minimize",
              "aria-label": "Minimize chat",
              onClick: ms
            }, m[34] || (m[34] = [
              y("svg", {
                width: "16",
                height: "16",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                "stroke-width": "2.5",
                "stroke-linecap": "round",
                "stroke-linejoin": "round",
                "aria-hidden": "true"
              }, [
                y("path", { d: "M6 9l6 6 6-6" })
              ], -1)
            ]), 4)
          ])
        ], 4)),
        S(b) ? (A(), x("div", gb, m[35] || (m[35] = [
          y("div", { class: "loading-spinner" }, [
            y("div", { class: "dot" }),
            y("div", { class: "dot" }),
            y("div", { class: "dot" })
          ], -1)
        ]))) : re("", !0),
        ys.value ? (A(), x("div", {
          key: 3,
          class: "cm-email-gate",
          style: Ce(S(qn))
        }, [
          y("div", {
            class: "cm-email-gate-orb",
            style: Ce(Vs.value)
          }, null, 4),
          y("h3", _b, J(S(s).welcome_title || "Before we start"), 1),
          m[36] || (m[36] = y("p", { class: "cm-email-gate-text" }, "Enter your email and we'll continue the chat.", -1)),
          es(y("input", {
            "onUpdate:modelValue": m[5] || (m[5] = (d) => $.value = d),
            type: "email",
            inputmode: "email",
            autocomplete: "email",
            placeholder: "you@example.com",
            class: $e(["cm-email-gate-input", { invalid: !!Jn.value }]),
            disabled: mr.value,
            onKeyup: wi(sl, ["enter"]),
            onInput: m[6] || (m[6] = (d) => Jn.value = "")
          }, null, 42, yb), [
            [ks, $.value]
          ]),
          Jn.value ? (A(), x("p", bb, J(Jn.value), 1)) : re("", !0),
          y("button", {
            type: "button",
            class: "cm-email-gate-btn",
            style: Ce(S(_t)),
            disabled: mr.value,
            onClick: sl
          }, J(mr.value ? "Please wait…" : "Continue to chat"), 13, vb)
        ], 4)) : re("", !0),
        Zn.value && oi.value ? (A(), Br(Yu, {
          key: 4,
          busy: Yn.value,
          error: Xn.value,
          onConfirm: Xa,
          onCancel: js
        }, null, 8, ["busy", "error"])) : re("", !0),
        es(y("div", {
          class: "chat-messages",
          ref_key: "messagesContainer",
          ref: ds,
          role: "log",
          "aria-label": "Messages"
        }, [
          Cf.value ? (A(), x("div", wb, [
            y("div", kb, [
              pr.value || !S(Tt) ? (A(), x("div", {
                key: 0,
                class: "cm-welcome-orb",
                style: Ce(Vs.value)
              }, null, 4)) : (A(), x("img", {
                key: 1,
                src: S(Tt),
                alt: S(r),
                class: "cm-welcome-avatar"
              }, null, 8, Tb)),
              y("div", {
                class: "message-bubble cm-welcome-bubble",
                style: Ce(S(On))
              }, J(Ja.value), 5)
            ])
          ])) : re("", !0),
          (A(!0), x(Ie, null, bt(S(l), (d, Q) => {
            var Se, ge, lt, it, Ze, gr, _r, Qn, Ks, ol, al, ll, cl, ul, fl, hl, dl, pl, ml;
            return A(), x("div", {
              key: Q,
              class: $e([
                "message",
                d.message_type === "bot" || d.message_type === "agent" ? "agent-message" : d.message_type === "system" ? "system-message" : d.message_type === "rating" ? "rating-message" : d.message_type === "form" ? "form-message" : d.message_type === "product" || d.shopify_output ? "product-message" : "user-message"
              ])
            }, [
              d.message_type === "bot" || d.message_type === "agent" ? (A(), x("div", Ab, [
                vn.value ? (A(), x("img", {
                  key: 0,
                  src: vn.value,
                  class: "cm-msg-avatar-img",
                  alt: ""
                }, null, 8, Sb)) : !pr.value && S(Tt) ? (A(), x("img", {
                  key: 1,
                  src: S(Tt),
                  class: "cm-msg-avatar-img",
                  alt: ""
                }, null, 8, xb)) : (A(), x("div", {
                  key: 2,
                  class: "cm-msg-avatar-orb",
                  style: Ce(Vs.value)
                }, null, 4))
              ])) : re("", !0),
              y("div", Eb, [
                y("div", {
                  class: "message-bubble",
                  style: Ce(d.message_type === "system" || d.message_type === "rating" || d.message_type === "form" || d.message_type === "product" || d.shopify_output ? {} : d.message_type === "user" ? S(_t) : S(On))
                }, [
                  d.message_type === "rating" ? (A(), x("div", Cb, [
                    y("p", Rb, "Rate the chat session that you had with " + J(d.agent_name || S(v).human_agent_name || S(r) || "our agent"), 1),
                    y("div", {
                      class: $e(["star-rating", { submitted: Dt.value || d.isSubmitted }])
                    }, [
                      (A(), x(Ie, null, bt(5, (M) => y("button", {
                        key: M,
                        class: $e(["star-button", {
                          warning: M <= (d.isSubmitted ? d.finalRating : en.value || d.selectedRating) && (d.isSubmitted ? d.finalRating : en.value || d.selectedRating) <= 3,
                          success: M <= (d.isSubmitted ? d.finalRating : en.value || d.selectedRating) && (d.isSubmitted ? d.finalRating : en.value || d.selectedRating) > 3,
                          selected: M <= (d.isSubmitted ? d.finalRating : en.value || d.selectedRating)
                        }]),
                        onMouseover: (ln) => !d.isSubmitted && fr(M),
                        onMouseleave: (ln) => !d.isSubmitted && G,
                        onClick: (ln) => !d.isSubmitted && p(M),
                        disabled: Dt.value || d.isSubmitted
                      }, " ★ ", 42, Ib)), 64))
                    ], 2),
                    d.showFeedback && !d.isSubmitted ? (A(), x("div", Ob, [
                      y("div", Lb, [
                        es(y("input", {
                          "onUpdate:modelValue": (M) => d.feedback = M,
                          placeholder: "Please share your feedback (optional)",
                          disabled: Dt.value,
                          maxlength: "500",
                          class: "feedback-input"
                        }, null, 8, Nb), [
                          [ks, d.feedback]
                        ]),
                        y("div", Pb, J(((Se = d.feedback) == null ? void 0 : Se.length) || 0) + "/500", 1)
                      ]),
                      y("button", {
                        onClick: (M) => T(d.session_id, en.value, d.feedback),
                        disabled: Dt.value || !en.value,
                        class: "submit-rating-button",
                        style: Ce({ backgroundColor: S(s).accent_color || "var(--accent-solid)" })
                      }, J(Dt.value ? "Submitting..." : "Submit Rating"), 13, Mb)
                    ])) : re("", !0),
                    d.isSubmitted && d.finalFeedback ? (A(), x("div", Db, [
                      y("div", Fb, [
                        y("p", $b, J(d.finalFeedback), 1)
                      ])
                    ])) : d.isSubmitted ? (A(), x("div", Bb, " Thank you for your rating! ")) : re("", !0)
                  ])) : d.message_type === "form" ? (A(), x("div", Ub, [
                    (lt = (ge = d.attributes) == null ? void 0 : ge.form_data) != null && lt.title || (Ze = (it = d.attributes) == null ? void 0 : it.form_data) != null && Ze.description ? (A(), x("div", zb, [
                      (_r = (gr = d.attributes) == null ? void 0 : gr.form_data) != null && _r.title ? (A(), x("h3", Hb, J(d.attributes.form_data.title), 1)) : re("", !0),
                      (Ks = (Qn = d.attributes) == null ? void 0 : Qn.form_data) != null && Ks.description ? (A(), x("p", Wb, J(d.attributes.form_data.description), 1)) : re("", !0)
                    ])) : re("", !0),
                    y("div", jb, [
                      (A(!0), x(Ie, null, bt((al = (ol = d.attributes) == null ? void 0 : ol.form_data) == null ? void 0 : al.fields, (M) => {
                        var ln, vo;
                        return A(), x("div", {
                          key: M.name,
                          class: "form-field"
                        }, [
                          y("label", {
                            for: `form-${M.name}`,
                            class: "field-label"
                          }, [
                            cn(J(M.label) + " ", 1),
                            M.required ? (A(), x("span", Vb, "*")) : re("", !0)
                          ], 8, qb),
                          M.type === "text" || M.type === "email" || M.type === "tel" ? (A(), x("input", {
                            key: 0,
                            id: `form-${M.name}`,
                            type: M.type,
                            placeholder: M.placeholder || "",
                            required: M.required,
                            minlength: M.minLength,
                            maxlength: M.maxLength,
                            value: ut.value[M.name] || "",
                            onInput: (He) => ne(M.name, He.target.value),
                            onBlur: (He) => ne(M.name, He.target.value),
                            class: $e(["form-input", { error: at.value[M.name] }]),
                            disabled: ht.value,
                            autocomplete: M.type === "email" ? "email" : M.type === "tel" ? "tel" : "off",
                            inputmode: M.type === "tel" ? "tel" : M.type === "email" ? "email" : "text"
                          }, null, 42, Kb)) : M.type === "number" ? (A(), x("input", {
                            key: 1,
                            id: `form-${M.name}`,
                            type: "number",
                            placeholder: M.placeholder || "",
                            required: M.required,
                            min: M.min,
                            max: M.max,
                            value: ut.value[M.name] || "",
                            onInput: (He) => ne(M.name, He.target.value),
                            class: $e(["form-input", { error: at.value[M.name] }]),
                            disabled: ht.value
                          }, null, 42, Gb)) : M.type === "textarea" ? (A(), x("textarea", {
                            key: 2,
                            id: `form-${M.name}`,
                            placeholder: M.placeholder || "",
                            required: M.required,
                            minlength: M.minLength,
                            maxlength: M.maxLength,
                            value: ut.value[M.name] || "",
                            onInput: (He) => ne(M.name, He.target.value),
                            class: $e(["form-textarea", { error: at.value[M.name] }]),
                            disabled: ht.value,
                            rows: "3"
                          }, null, 42, Yb)) : M.type === "select" ? (A(), x("select", {
                            key: 3,
                            id: `form-${M.name}`,
                            required: M.required,
                            value: ut.value[M.name] || "",
                            onChange: (He) => ne(M.name, He.target.value),
                            class: $e(["form-select", { error: at.value[M.name] }]),
                            disabled: ht.value
                          }, [
                            y("option", Zb, J(M.placeholder || "Select an option"), 1),
                            (A(!0), x(Ie, null, bt((Array.isArray(M.options) ? M.options : ((ln = M.options) == null ? void 0 : ln.split(`
`)) || []).filter((He) => He.trim()), (He) => (A(), x("option", {
                              key: He.trim(),
                              value: He.trim()
                            }, J(He.trim()), 9, Jb))), 128))
                          ], 42, Xb)) : M.type === "checkbox" ? (A(), x("div", Qb, [
                            y("input", {
                              id: `form-${M.name}`,
                              type: "checkbox",
                              checked: ut.value[M.name] || !1,
                              onChange: (He) => ne(M.name, He.target.checked),
                              class: "form-checkbox",
                              disabled: ht.value
                            }, null, 40, ev),
                            y("label", {
                              for: `form-${M.name}`,
                              class: "checkbox-label"
                            }, J(M.placeholder || M.label), 9, tv)
                          ])) : M.type === "radio" ? (A(), x("div", nv, [
                            (A(!0), x(Ie, null, bt((Array.isArray(M.options) ? M.options : ((vo = M.options) == null ? void 0 : vo.split(`
`)) || []).filter((He) => He.trim()), (He) => (A(), x("div", {
                              key: He.trim(),
                              class: "radio-option"
                            }, [
                              y("input", {
                                id: `form-${M.name}-${He.trim()}`,
                                name: `form-${M.name}`,
                                type: "radio",
                                value: He.trim(),
                                checked: ut.value[M.name] === He.trim(),
                                onChange: (Cw) => ne(M.name, He.trim()),
                                class: "form-radio",
                                disabled: ht.value
                              }, null, 40, sv),
                              y("label", {
                                for: `form-${M.name}-${He.trim()}`,
                                class: "radio-label"
                              }, J(He.trim()), 9, rv)
                            ]))), 128))
                          ])) : re("", !0),
                          at.value[M.name] ? (A(), x("div", iv, J(at.value[M.name]), 1)) : re("", !0)
                        ]);
                      }), 128))
                    ]),
                    y("div", ov, [
                      y("button", {
                        onClick: () => {
                          var M;
                          console.log("Regular form submit button clicked!"), te((M = d.attributes) == null ? void 0 : M.form_data);
                        },
                        disabled: ht.value,
                        class: "form-submit-button",
                        style: Ce(S(_t))
                      }, J(ht.value ? "Submitting..." : ((cl = (ll = d.attributes) == null ? void 0 : ll.form_data) == null ? void 0 : cl.submit_button_text) || "Submit"), 13, av)
                    ])
                  ])) : d.message_type === "user_input" ? (A(), x("div", lv, [
                    (ul = d.attributes) != null && ul.prompt_message && d.attributes.prompt_message.trim() ? (A(), x("div", cv, J(d.attributes.prompt_message), 1)) : re("", !0),
                    d.isSubmitted ? (A(), x("div", dv, [
                      m[37] || (m[37] = y("strong", null, "Your input:", -1)),
                      cn(" " + J(d.submittedValue) + " ", 1),
                      (fl = d.attributes) != null && fl.confirmation_message && d.attributes.confirmation_message.trim() ? (A(), x("div", pv, J(d.attributes.confirmation_message), 1)) : re("", !0)
                    ])) : (A(), x("div", uv, [
                      es(y("textarea", {
                        "onUpdate:modelValue": (M) => d.userInputValue = M,
                        class: "user-input-textarea",
                        placeholder: "Type your message here...",
                        rows: "3",
                        onKeydown: [
                          wi(Ss((M) => fo(d), ["ctrl"]), ["enter"]),
                          wi(Ss((M) => fo(d), ["meta"]), ["enter"])
                        ]
                      }, null, 40, fv), [
                        [ks, d.userInputValue]
                      ]),
                      y("button", {
                        class: "user-input-submit-button",
                        onClick: (M) => fo(d),
                        disabled: !d.userInputValue || !d.userInputValue.trim()
                      }, " Submit ", 8, hv)
                    ]))
                  ])) : d.shopify_output || d.message_type === "product" ? (A(), x("div", mv, [
                    d.message ? (A(), x("div", {
                      key: 0,
                      innerHTML: S(Ti)(((dl = (hl = d.shopify_output) == null ? void 0 : hl.products) == null ? void 0 : dl.length) > 0 ? Rt(d.message) : d.message),
                      class: "product-message-text"
                    }, null, 8, gv)) : re("", !0),
                    (pl = d.shopify_output) != null && pl.products && d.shopify_output.products.length > 0 ? (A(), x("div", _v, [
                      m[39] || (m[39] = y("h3", { class: "carousel-title" }, "Products", -1)),
                      y("div", yv, [
                        (A(!0), x(Ie, null, bt(d.shopify_output.products, (M) => {
                          var ln;
                          return A(), x("div", {
                            key: M.id,
                            class: "product-card-compact carousel-item"
                          }, [
                            (ln = M.image) != null && ln.src ? (A(), x("div", bv, [
                              y("img", {
                                src: M.image.src,
                                alt: M.title,
                                class: "product-thumbnail"
                              }, null, 8, vv)
                            ])) : re("", !0),
                            y("div", wv, [
                              y("div", kv, [
                                y("div", Tv, J(M.title), 1),
                                M.variant_title && M.variant_title !== "Default Title" ? (A(), x("div", Av, J(M.variant_title), 1)) : re("", !0),
                                y("div", Sv, J(M.price_formatted || S(a)(M.price, M.currency)), 1)
                              ]),
                              y("div", xv, [
                                y("button", {
                                  class: "view-details-button-compact",
                                  onClick: (vo) => {
                                    var He;
                                    return Ct(M, (He = d.shopify_output) == null ? void 0 : He.shop_domain);
                                  }
                                }, m[38] || (m[38] = [
                                  cn(" View product ", -1),
                                  y("span", { class: "external-link-icon" }, "↗", -1)
                                ]), 8, Ev)
                              ])
                            ])
                          ]);
                        }), 128))
                      ])
                    ])) : !d.message && ((ml = d.shopify_output) != null && ml.products) && d.shopify_output.products.length === 0 ? (A(), x("div", Cv, m[40] || (m[40] = [
                      y("p", null, "No products found.", -1)
                    ]))) : !d.message && d.shopify_output && !d.shopify_output.products ? (A(), x("div", Rv, m[41] || (m[41] = [
                      y("p", null, "No products to display.", -1)
                    ]))) : re("", !0)
                  ])) : (A(), x(Ie, { key: 4 }, [
                    S(D)(Q) ? (A(), x("div", {
                      key: 0,
                      class: "message-streaming",
                      innerHTML: S(Ti)(S(P)(Q, d.message))
                    }, null, 8, Iv)) : (A(), x("div", {
                      key: 1,
                      innerHTML: S(Ti)(d.message)
                    }, null, 8, Ov)),
                    d.attachments && d.attachments.length > 0 ? (A(), x("div", Lv, [
                      (A(!0), x(Ie, null, bt(d.attachments, (M) => (A(), x("div", {
                        key: M.id,
                        class: "attachment-item"
                      }, [
                        S(ps)(M.content_type) ? (A(), x("div", Nv, [
                          y("img", {
                            src: S(Ms)(M.file_url),
                            alt: M.filename,
                            class: "attachment-image",
                            onClick: Ss((ln) => S(Fs)({ url: M.file_url, filename: M.filename, type: M.content_type, file_url: S(Ms)(M.file_url), size: void 0 }), ["stop"]),
                            style: { cursor: "pointer" }
                          }, null, 8, Pv),
                          y("div", Mv, [
                            y("a", {
                              href: S(Ms)(M.file_url),
                              target: "_blank",
                              class: "attachment-link"
                            }, [
                              m[42] || (m[42] = y("svg", {
                                width: "14",
                                height: "14",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                stroke: "currentColor",
                                "stroke-width": "2",
                                "stroke-linecap": "round",
                                "stroke-linejoin": "round"
                              }, [
                                y("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
                                y("polyline", { points: "7 10 12 15 17 10" }),
                                y("line", {
                                  x1: "12",
                                  y1: "15",
                                  x2: "12",
                                  y2: "3"
                                })
                              ], -1)),
                              cn(" " + J(M.filename) + " ", 1),
                              y("span", Fv, "(" + J(S(cr)(M.file_size)) + ")", 1)
                            ], 8, Dv)
                          ])
                        ])) : (A(), x("a", {
                          key: 1,
                          href: S(Ms)(M.file_url),
                          target: "_blank",
                          class: "attachment-link"
                        }, [
                          m[43] || (m[43] = y("svg", {
                            width: "14",
                            height: "14",
                            viewBox: "0 0 24 24",
                            fill: "none",
                            stroke: "currentColor",
                            "stroke-width": "2",
                            "stroke-linecap": "round",
                            "stroke-linejoin": "round"
                          }, [
                            y("path", { d: "M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" })
                          ], -1)),
                          cn(" " + J(M.filename) + " ", 1),
                          y("span", Bv, "(" + J(S(cr)(M.file_size)) + ")", 1)
                        ], 8, $v))
                      ]))), 128))
                    ])) : re("", !0)
                  ], 64))
                ], 4),
                ai.value && (d.message_type === "bot" || d.message_type === "agent") && d.sources && d.sources.length ? (A(), x("div", Uv, [
                  m[44] || (m[44] = y("span", { class: "citation-label" }, "Sources", -1)),
                  (A(!0), x(Ie, null, bt(d.sources, (M, ln) => (A(), x("span", {
                    key: ln,
                    class: "citation-chip",
                    title: tl(M)
                  }, J(mo(M)), 9, zv))), 128))
                ])) : re("", !0),
                y("div", Hv, [
                  d.message_type === "user" ? (A(), x("span", Wv, " You ")) : re("", !0)
                ])
              ])
            ], 2);
          }), 128)),
          L.value ? (A(), x("div", jv, [
            pr.value || !S(Tt) ? (A(), x("div", {
              key: 0,
              class: "cm-welcome-orb",
              style: Ce(Vs.value)
            }, null, 4)) : (A(), x("img", {
              key: 1,
              src: S(Tt),
              alt: S(r),
              class: "cm-welcome-avatar"
            }, null, 8, qv)),
            y("div", {
              class: "message-bubble cm-welcome-bubble",
              style: Ce(S(On))
            }, J(L.value.message), 5)
          ])) : re("", !0),
          S(gt) ? (A(), Br(hg, {
            key: 2,
            pending: S(gt),
            onApprove: S(hn),
            onDecline: S(Pe)
          }, null, 8, ["pending", "onApprove", "onDecline"])) : re("", !0),
          S(h) && !S(gt) ? (A(), x("div", {
            key: 3,
            class: $e(["typing-indicator", { "reading-indicator": ai.value }])
          }, [
            ai.value ? (A(), x(Ie, { key: 0 }, [
              m[45] || (m[45] = y("div", {
                class: "reading-bars",
                "aria-hidden": "true"
              }, [
                y("span"),
                y("span"),
                y("span")
              ], -1)),
              m[46] || (m[46] = y("span", { class: "reading-label" }, "reading knowledge base", -1))
            ], 64)) : (A(), x("div", {
              key: 1,
              class: "cm-typing-bubble",
              style: Ce(S(On))
            }, m[47] || (m[47] = [
              y("span", { class: "cm-typing-dot" }, null, -1),
              y("span", { class: "cm-typing-dot" }, null, -1),
              y("span", { class: "cm-typing-dot" }, null, -1)
            ]), 4))
          ], 2)) : re("", !0)
        ], 512), [
          [Fd, !ys.value]
        ]),
        S(ct) ? (A(), x("div", {
          key: 5,
          class: "cm-journey-progress",
          role: "status",
          "aria-label": `Step ${S(ct).index + 1} of ${S(ct).count}`
        }, [
          y("span", null, [
            cn("Step " + J(S(ct).index + 1) + " of " + J(S(ct).count), 1),
            S(ct).title ? (A(), x(Ie, { key: 0 }, [
              cn(" · " + J(S(ct).title), 1)
            ], 64)) : re("", !0)
          ]),
          S(ct).skippable ? (A(), x("button", {
            key: 0,
            type: "button",
            class: "cm-journey-skip",
            onClick: m[7] || (m[7] = //@ts-ignore
            (...d) => S(Mt) && S(Mt)(...d))
          }, "Skip")) : re("", !0),
          y("button", {
            type: "button",
            class: "cm-journey-skip",
            onClick: m[8] || (m[8] = //@ts-ignore
            (...d) => S(dn) && S(dn)(...d))
          }, "Hide guide")
        ], 8, Vv)) : re("", !0),
        L.value && L.value.chips.length ? (A(), x("div", Kv, [
          (A(!0), x(Ie, null, bt(L.value.chips, (d) => (A(), x("button", {
            key: d.label,
            type: "button",
            class: "cm-quick-action",
            disabled: !Pn.value || S(Kt) || !!S(gt),
            onClick: (Q) => w(d)
          }, J(d.label), 9, Gv))), 128))
        ])) : re("", !0),
        Rf.value ? (A(), x("div", Yv, [
          (A(!0), x(Ie, null, bt(ho.value, (d) => (A(), x("button", {
            key: d,
            type: "button",
            class: "cm-quick-action",
            disabled: !Pn.value,
            onClick: (Q) => Kn(d)
          }, J(d), 9, Xv))), 128))
        ])) : re("", !0),
        !gs.value && !ys.value ? (A(), x("div", {
          key: 8,
          class: $e(["chat-input", { "ask-anything-input": tn.value }])
        }, [
          y("input", {
            ref_key: "fileInputRef",
            ref: lr,
            type: "file",
            accept: Aw,
            multiple: "",
            style: { display: "none" },
            onChange: m[9] || (m[9] = //@ts-ignore
            (...d) => S(rt) && S(rt)(...d))
          }, null, 544),
          S(zt).length > 0 ? (A(), x("div", Zv, [
            (A(!0), x(Ie, null, bt(S(zt), (d, Q) => (A(), x("div", {
              key: Q,
              class: "file-preview-widget"
            }, [
              y("div", Jv, [
                S(ni)(d.type) ? (A(), x("img", {
                  key: 0,
                  src: S(Jr)(d),
                  alt: d.filename,
                  class: "file-preview-image-widget",
                  onClick: Ss((Se) => S(Fs)(d), ["stop"]),
                  style: { cursor: "pointer" }
                }, null, 8, Qv)) : (A(), x("div", {
                  key: 1,
                  class: "file-preview-icon-widget",
                  onClick: Ss((Se) => S(Fs)(d), ["stop"]),
                  style: { cursor: "pointer" }
                }, m[48] || (m[48] = [
                  y("svg", {
                    width: "20",
                    height: "20",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    "stroke-width": "2"
                  }, [
                    y("path", { d: "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" }),
                    y("polyline", { points: "13 2 13 9 20 9" })
                  ], -1)
                ]), 8, ew))
              ]),
              y("div", tw, [
                y("div", nw, J(d.filename), 1),
                y("div", sw, J(S(cr)(d.size)), 1)
              ]),
              y("button", {
                type: "button",
                class: "file-preview-remove-widget",
                onClick: (Se) => S(ei)(Q),
                title: "Remove file"
              }, " × ", 8, rw)
            ]))), 128))
          ])) : re("", !0),
          Ws.value ? (A(), x("div", iw, m[49] || (m[49] = [
            y("div", { class: "upload-spinner-widget" }, null, -1),
            y("span", { class: "upload-text-widget" }, "Uploading files...", -1)
          ]))) : re("", !0),
          y("div", ow, [
            es(y("input", {
              "onUpdate:modelValue": m[10] || (m[10] = (d) => O.value = d),
              type: "text",
              placeholder: Bs.value,
              onKeypress: si,
              onInput: W,
              onChange: W,
              onPaste: m[11] || (m[11] = //@ts-ignore
              (...d) => S(Ds) && S(Ds)(...d)),
              onDrop: m[12] || (m[12] = //@ts-ignore
              (...d) => S(Nn) && S(Nn)(...d)),
              onDragover: m[13] || (m[13] = //@ts-ignore
              (...d) => S(Qr) && S(Qr)(...d)),
              onDragleave: m[14] || (m[14] = //@ts-ignore
              (...d) => S(ur) && S(ur)(...d)),
              disabled: !Ht.value,
              class: $e({ disabled: !Ht.value, "ask-anything-field": tn.value })
            }, null, 42, aw), [
              [ks, O.value]
            ]),
            qa.value ? (A(), x("button", {
              key: 0,
              type: "button",
              class: "attach-button",
              disabled: Ws.value,
              onClick: m[15] || (m[15] = //@ts-ignore
              (...d) => S(ti) && S(ti)(...d)),
              title: `Attach files (${S(zt).length}/${Rc} used) or paste screenshots`
            }, m[50] || (m[50] = [
              y("svg", {
                width: "22",
                height: "22",
                viewBox: "0 0 24 24",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg"
              }, [
                y("path", {
                  d: "M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48",
                  stroke: "currentColor",
                  "stroke-width": "2.2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                })
              ], -1),
              y("span", { class: "attach-button-glow" }, null, -1)
            ]), 8, lw)) : re("", !0),
            y("button", {
              class: $e(["send-button", { "ask-anything-send": tn.value }]),
              "aria-label": "Send message",
              style: Ce(S(_t)),
              onClick: pn,
              disabled: !O.value.trim() && S(zt).length === 0 || !Pn.value || Qt.value
            }, m[51] || (m[51] = [
              y("svg", {
                width: "20",
                height: "20",
                viewBox: "0 0 24 24",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg"
              }, [
                y("path", {
                  d: "M12 19V5M5 12l7-7 7 7",
                  stroke: "currentColor",
                  "stroke-width": "2.2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                })
              ], -1)
            ]), 14, cw)
          ]),
          Qt.value ? (A(), x("p", uw, J(S(dg)), 1)) : re("", !0)
        ], 2)) : gs.value && !ys.value ? (A(), x("div", fw, [
          y("div", hw, [
            m[52] || (m[52] = y("p", { class: "ended-text" }, "This chat has ended.", -1)),
            y("button", {
              class: "start-new-conversation-button",
              style: Ce(S(_t)),
              onClick: Af
            }, " Click here to start a new conversation ", 4)
          ])
        ])) : re("", !0),
        el.value ? (A(), x("div", dw, J(S(mc)), 1)) : re("", !0),
        y("div", {
          class: "powered-by",
          style: Ce(S(Et))
        }, m[53] || (m[53] = [
          ws('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-42cc9b20><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-42cc9b20></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-42cc9b20></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-42cc9b20></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-42cc9b20></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-42cc9b20><span class="cm-powered-prefix" data-v-42cc9b20>Powered by </span><strong class="cm-brand" data-v-42cc9b20>ChatterMate</strong></a>', 2)
        ]), 4)
      ], 6)) : re("", !0),
      Mn.value ? (A(), x("div", pw, [
        y("div", mw, [
          m[54] || (m[54] = y("h3", null, "Rate your conversation", -1)),
          y("div", gw, [
            (A(), x(Ie, null, bt(5, (d) => y("button", {
              key: d,
              onClick: (Q) => _n.value = d,
              class: $e([{ active: d <= _n.value }, "star-button"])
            }, " ★ ", 10, _w)), 64))
          ]),
          es(y("textarea", {
            "onUpdate:modelValue": m[16] || (m[16] = (d) => Wt.value = d),
            placeholder: "Additional feedback (optional)",
            class: "rating-feedback"
          }, null, 512), [
            [ks, Wt.value]
          ]),
          y("div", yw, [
            y("button", {
              onClick: m[17] || (m[17] = (d) => f.submitRating(_n.value, Wt.value)),
              disabled: !_n.value,
              class: "submit-button",
              style: Ce(S(_t))
            }, " Submit ", 12, bw),
            y("button", {
              onClick: m[18] || (m[18] = (d) => Mn.value = !1),
              class: "skip-rating"
            }, " Skip ")
          ])
        ])
      ])) : re("", !0),
      S(Zr) ? (A(), x("div", {
        key: 9,
        class: "preview-modal-overlay",
        onClick: m[21] || (m[21] = //@ts-ignore
        (...d) => S($s) && S($s)(...d))
      }, [
        y("div", {
          class: "preview-modal-content",
          onClick: m[20] || (m[20] = Ss(() => {
          }, ["stop"]))
        }, [
          y("button", {
            class: "preview-modal-close",
            onClick: m[19] || (m[19] = //@ts-ignore
            (...d) => S($s) && S($s)(...d))
          }, "×"),
          S(Ln) && S(ni)(S(Ln).type) ? (A(), x("div", vw, [
            y("img", {
              src: S(Jr)(S(Ln)),
              alt: S(Ln).filename,
              class: "preview-modal-image"
            }, null, 8, ww),
            y("div", kw, J(S(Ln).filename), 1)
          ])) : re("", !0)
        ])
      ])) : re("", !0)
    ], 6)) : (A(), x("div", Tw));
  }
}), xw = /* @__PURE__ */ ao(Sw, [["__scopeId", "data-v-42cc9b20"]]);
window.process || (window.process = { env: { NODE_ENV: "production" } });
async function Ew() {
  if (!await Ng()) return;
  const e = window.__INITIAL_DATA__, t = new URL(window.location.href), n = t.searchParams.get("preview") === "true", s = (a) => {
    const l = t.searchParams.get(a);
    if (!(!l || l === "undefined" || l.trim() === ""))
      return l;
  }, r = n ? s("widget_id") || (e == null ? void 0 : e.widgetId) || void 0 : (e == null ? void 0 : e.widgetId) || void 0, i = n ? (e == null ? void 0 : e.initialToken) || s("token") || void 0 : (e == null ? void 0 : e.initialToken) || void 0;
  sp(xw, {
    widgetId: r,
    token: i || void 0,
    initialAuthError: null
    // Let backend determine if auth is required
  }).mount("#app"), Pg();
}
Ew();
