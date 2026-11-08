var id = Object.defineProperty;
var od = (e, t, n) => t in e ? id(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var tt = (e, t, n) => od(e, typeof t != "symbol" ? t + "" : t, n);
/**
* @vue/shared v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function wa(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const n of e.split(",")) t[n] = 1;
  return (n) => n in t;
}
const nt = {}, Js = [], An = () => {
}, ad = () => !1, Zi = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), ka = (e) => e.startsWith("onUpdate:"), Ot = Object.assign, Ta = (e, t) => {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}, ld = Object.prototype.hasOwnProperty, qe = (e, t) => ld.call(e, t), Ae = Array.isArray, Qs = (e) => Ji(e) === "[object Map]", jc = (e) => Ji(e) === "[object Set]", Ce = (e) => typeof e == "function", gt = (e) => typeof e == "string", ds = (e) => typeof e == "symbol", ct = (e) => e !== null && typeof e == "object", Wc = (e) => (ct(e) || Ce(e)) && Ce(e.then) && Ce(e.catch), qc = Object.prototype.toString, Ji = (e) => qc.call(e), cd = (e) => Ji(e).slice(8, -1), Vc = (e) => Ji(e) === "[object Object]", Aa = (e) => gt(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, Or = /* @__PURE__ */ wa(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), Qi = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (n) => t[n] || (t[n] = e(n));
}, ud = /-(\w)/g, cs = Qi(
  (e) => e.replace(ud, (t, n) => n ? n.toUpperCase() : "")
), fd = /\B([A-Z])/g, hs = Qi(
  (e) => e.replace(fd, "-$1").toLowerCase()
), Kc = Qi((e) => e.charAt(0).toUpperCase() + e.slice(1)), xo = Qi(
  (e) => e ? `on${Kc(e)}` : ""
), os = (e, t) => !Object.is(e, t), wi = (e, ...t) => {
  for (let n = 0; n < e.length; n++)
    e[n](...t);
}, Xo = (e, t, n, s = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: s,
    value: n
  });
}, Zo = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let El;
const eo = () => El || (El = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function Ee(e) {
  if (Ae(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
      const s = e[n], r = gt(s) ? md(s) : Ee(s);
      if (r)
        for (const i in r)
          t[i] = r[i];
    }
    return t;
  } else if (gt(e) || ct(e))
    return e;
}
const dd = /;(?![^(]*\))/g, hd = /:([^]+)/, pd = /\/\*[^]*?\*\//g;
function md(e) {
  const t = {};
  return e.replace(pd, "").split(dd).forEach((n) => {
    if (n) {
      const s = n.split(hd);
      s.length > 1 && (t[s[0].trim()] = s[1].trim());
    }
  }), t;
}
function Ne(e) {
  let t = "";
  if (gt(e))
    t = e;
  else if (Ae(e))
    for (let n = 0; n < e.length; n++) {
      const s = Ne(e[n]);
      s && (t += s + " ");
    }
  else if (ct(e))
    for (const n in e)
      e[n] && (t += n + " ");
  return t.trim();
}
const gd = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", _d = /* @__PURE__ */ wa(gd);
function Gc(e) {
  return !!e || e === "";
}
const Yc = (e) => !!(e && e.__v_isRef === !0), Z = (e) => gt(e) ? e : e == null ? "" : Ae(e) || ct(e) && (e.toString === qc || !Ce(e.toString)) ? Yc(e) ? Z(e.value) : JSON.stringify(e, Xc, 2) : String(e), Xc = (e, t) => Yc(t) ? Xc(e, t.value) : Qs(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (n, [s, r], i) => (n[Eo(s, i) + " =>"] = r, n),
    {}
  )
} : jc(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((n) => Eo(n))
} : ds(t) ? Eo(t) : ct(t) && !Ae(t) && !Vc(t) ? String(t) : t, Eo = (e, t = "") => {
  var n;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    ds(e) ? `Symbol(${(n = e.description) != null ? n : t})` : e
  );
};
/**
* @vue/reactivity v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let zt;
class yd {
  constructor(t = !1) {
    this.detached = t, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this.parent = zt, !t && zt && (this.index = (zt.scopes || (zt.scopes = [])).push(
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
      const n = zt;
      try {
        return zt = this, t();
      } finally {
        zt = n;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = zt, zt = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    this._on > 0 && --this._on === 0 && (zt = this.prevScope, this.prevScope = void 0);
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
function vd() {
  return zt;
}
let it;
const Co = /* @__PURE__ */ new WeakSet();
class Zc {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, zt && zt.active && zt.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, Co.has(this) && (Co.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Qc(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, Cl(this), eu(this);
    const t = it, n = mn;
    it = this, mn = !0;
    try {
      return this.fn();
    } finally {
      tu(this), it = t, mn = n, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        Ea(t);
      this.deps = this.depsTail = void 0, Cl(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? Co.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    Jo(this) && this.run();
  }
  get dirty() {
    return Jo(this);
  }
}
let Jc = 0, Lr, Nr;
function Qc(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = Nr, Nr = e;
    return;
  }
  e.next = Lr, Lr = e;
}
function Sa() {
  Jc++;
}
function xa() {
  if (--Jc > 0)
    return;
  if (Nr) {
    let t = Nr;
    for (Nr = void 0; t; ) {
      const n = t.next;
      t.next = void 0, t.flags &= -9, t = n;
    }
  }
  let e;
  for (; Lr; ) {
    let t = Lr;
    for (Lr = void 0; t; ) {
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
function eu(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function tu(e) {
  let t, n = e.depsTail, s = n;
  for (; s; ) {
    const r = s.prevDep;
    s.version === -1 ? (s === n && (n = r), Ea(s), bd(s)) : t = s, s.dep.activeLink = s.prevActiveLink, s.prevActiveLink = void 0, s = r;
  }
  e.deps = t, e.depsTail = n;
}
function Jo(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (nu(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function nu(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === Ur) || (e.globalVersion = Ur, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !Jo(e))))
    return;
  e.flags |= 2;
  const t = e.dep, n = it, s = mn;
  it = e, mn = !0;
  try {
    eu(e);
    const r = e.fn(e._value);
    (t.version === 0 || os(r, e._value)) && (e.flags |= 128, e._value = r, t.version++);
  } catch (r) {
    throw t.version++, r;
  } finally {
    it = n, mn = s, tu(e), e.flags &= -3;
  }
}
function Ea(e, t = !1) {
  const { dep: n, prevSub: s, nextSub: r } = e;
  if (s && (s.nextSub = r, e.prevSub = void 0), r && (r.prevSub = s, e.nextSub = void 0), n.subs === e && (n.subs = s, !s && n.computed)) {
    n.computed.flags &= -5;
    for (let i = n.computed.deps; i; i = i.nextDep)
      Ea(i, !0);
  }
  !t && !--n.sc && n.map && n.map.delete(n.key);
}
function bd(e) {
  const { prevDep: t, nextDep: n } = e;
  t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
let mn = !0;
const su = [];
function Un() {
  su.push(mn), mn = !1;
}
function zn() {
  const e = su.pop();
  mn = e === void 0 ? !0 : e;
}
function Cl(e) {
  const { cleanup: t } = e;
  if (e.cleanup = void 0, t) {
    const n = it;
    it = void 0;
    try {
      t();
    } finally {
      it = n;
    }
  }
}
let Ur = 0;
class wd {
  constructor(t, n) {
    this.sub = t, this.dep = n, this.version = n.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Ca {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(t) {
    if (!it || !mn || it === this.computed)
      return;
    let n = this.activeLink;
    if (n === void 0 || n.sub !== it)
      n = this.activeLink = new wd(it, this), it.deps ? (n.prevDep = it.depsTail, it.depsTail.nextDep = n, it.depsTail = n) : it.deps = it.depsTail = n, ru(n);
    else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
      const s = n.nextDep;
      s.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = s), n.prevDep = it.depsTail, n.nextDep = void 0, it.depsTail.nextDep = n, it.depsTail = n, it.deps === n && (it.deps = s);
    }
    return n;
  }
  trigger(t) {
    this.version++, Ur++, this.notify(t);
  }
  notify(t) {
    Sa();
    try {
      for (let n = this.subs; n; n = n.prevSub)
        n.sub.notify() && n.sub.dep.notify();
    } finally {
      xa();
    }
  }
}
function ru(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let s = t.deps; s; s = s.nextDep)
        ru(s);
    }
    const n = e.dep.subs;
    n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
  }
}
const Qo = /* @__PURE__ */ new WeakMap(), Ms = Symbol(
  ""
), ea = Symbol(
  ""
), zr = Symbol(
  ""
);
function Rt(e, t, n) {
  if (mn && it) {
    let s = Qo.get(e);
    s || Qo.set(e, s = /* @__PURE__ */ new Map());
    let r = s.get(n);
    r || (s.set(n, r = new Ca()), r.map = s, r.key = n), r.track();
  }
}
function Dn(e, t, n, s, r, i) {
  const o = Qo.get(e);
  if (!o) {
    Ur++;
    return;
  }
  const a = (l) => {
    l && l.trigger();
  };
  if (Sa(), t === "clear")
    o.forEach(a);
  else {
    const l = Ae(e), u = l && Aa(n);
    if (l && n === "length") {
      const c = Number(s);
      o.forEach((b, T) => {
        (T === "length" || T === zr || !ds(T) && T >= c) && a(b);
      });
    } else
      switch ((n !== void 0 || o.has(void 0)) && a(o.get(n)), u && a(o.get(zr)), t) {
        case "add":
          l ? u && a(o.get("length")) : (a(o.get(Ms)), Qs(e) && a(o.get(ea)));
          break;
        case "delete":
          l || (a(o.get(Ms)), Qs(e) && a(o.get(ea)));
          break;
        case "set":
          Qs(e) && a(o.get(Ms));
          break;
      }
  }
  xa();
}
function Gs(e) {
  const t = Be(e);
  return t === e ? t : (Rt(t, "iterate", zr), cn(e) ? t : t.map(St));
}
function to(e) {
  return Rt(e = Be(e), "iterate", zr), e;
}
const kd = {
  __proto__: null,
  [Symbol.iterator]() {
    return Ro(this, Symbol.iterator, St);
  },
  concat(...e) {
    return Gs(this).concat(
      ...e.map((t) => Ae(t) ? Gs(t) : t)
    );
  },
  entries() {
    return Ro(this, "entries", (e) => (e[1] = St(e[1]), e));
  },
  every(e, t) {
    return Ln(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return Ln(this, "filter", e, t, (n) => n.map(St), arguments);
  },
  find(e, t) {
    return Ln(this, "find", e, t, St, arguments);
  },
  findIndex(e, t) {
    return Ln(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return Ln(this, "findLast", e, t, St, arguments);
  },
  findLastIndex(e, t) {
    return Ln(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return Ln(this, "forEach", e, t, void 0, arguments);
  },
  includes(...e) {
    return Io(this, "includes", e);
  },
  indexOf(...e) {
    return Io(this, "indexOf", e);
  },
  join(e) {
    return Gs(this).join(e);
  },
  // keys() iterator only reads `length`, no optimisation required
  lastIndexOf(...e) {
    return Io(this, "lastIndexOf", e);
  },
  map(e, t) {
    return Ln(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return _r(this, "pop");
  },
  push(...e) {
    return _r(this, "push", e);
  },
  reduce(e, ...t) {
    return Rl(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return Rl(this, "reduceRight", e, t);
  },
  shift() {
    return _r(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return Ln(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return _r(this, "splice", e);
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
    return _r(this, "unshift", e);
  },
  values() {
    return Ro(this, "values", St);
  }
};
function Ro(e, t, n) {
  const s = to(e), r = s[t]();
  return s !== e && !cn(e) && (r._next = r.next, r.next = () => {
    const i = r._next();
    return i.value && (i.value = n(i.value)), i;
  }), r;
}
const Td = Array.prototype;
function Ln(e, t, n, s, r, i) {
  const o = to(e), a = o !== e && !cn(e), l = o[t];
  if (l !== Td[t]) {
    const b = l.apply(e, i);
    return a ? St(b) : b;
  }
  let u = n;
  o !== e && (a ? u = function(b, T) {
    return n.call(this, St(b), T, e);
  } : n.length > 2 && (u = function(b, T) {
    return n.call(this, b, T, e);
  }));
  const c = l.call(o, u, s);
  return a && r ? r(c) : c;
}
function Rl(e, t, n, s) {
  const r = to(e);
  let i = n;
  return r !== e && (cn(e) ? n.length > 3 && (i = function(o, a, l) {
    return n.call(this, o, a, l, e);
  }) : i = function(o, a, l) {
    return n.call(this, o, St(a), l, e);
  }), r[t](i, ...s);
}
function Io(e, t, n) {
  const s = Be(e);
  Rt(s, "iterate", zr);
  const r = s[t](...n);
  return (r === -1 || r === !1) && Oa(n[0]) ? (n[0] = Be(n[0]), s[t](...n)) : r;
}
function _r(e, t, n = []) {
  Un(), Sa();
  const s = Be(e)[t].apply(e, n);
  return xa(), zn(), s;
}
const Ad = /* @__PURE__ */ wa("__proto__,__v_isRef,__isVue"), iu = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(ds)
);
function Sd(e) {
  ds(e) || (e = String(e));
  const t = Be(this);
  return Rt(t, "has", e), t.hasOwnProperty(e);
}
class ou {
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
      return s === (r ? i ? Md : uu : i ? cu : lu).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(s) ? t : void 0;
    const o = Ae(t);
    if (!r) {
      let l;
      if (o && (l = kd[n]))
        return l;
      if (n === "hasOwnProperty")
        return Sd;
    }
    const a = Reflect.get(
      t,
      n,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      It(t) ? t : s
    );
    return (ds(n) ? iu.has(n) : Ad(n)) || (r || Rt(t, "get", n), i) ? a : It(a) ? o && Aa(n) ? a : a.value : ct(a) ? r ? fu(a) : qr(a) : a;
  }
}
class au extends ou {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, n, s, r) {
    let i = t[n];
    if (!this._isShallow) {
      const l = us(i);
      if (!cn(s) && !us(s) && (i = Be(i), s = Be(s)), !Ae(t) && It(i) && !It(s))
        return l ? !1 : (i.value = s, !0);
    }
    const o = Ae(t) && Aa(n) ? Number(n) < t.length : qe(t, n), a = Reflect.set(
      t,
      n,
      s,
      It(t) ? t : r
    );
    return t === Be(r) && (o ? os(s, i) && Dn(t, "set", n, s) : Dn(t, "add", n, s)), a;
  }
  deleteProperty(t, n) {
    const s = qe(t, n);
    t[n];
    const r = Reflect.deleteProperty(t, n);
    return r && s && Dn(t, "delete", n, void 0), r;
  }
  has(t, n) {
    const s = Reflect.has(t, n);
    return (!ds(n) || !iu.has(n)) && Rt(t, "has", n), s;
  }
  ownKeys(t) {
    return Rt(
      t,
      "iterate",
      Ae(t) ? "length" : Ms
    ), Reflect.ownKeys(t);
  }
}
class xd extends ou {
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
const Ed = /* @__PURE__ */ new au(), Cd = /* @__PURE__ */ new xd(), Rd = /* @__PURE__ */ new au(!0);
const ta = (e) => e, hi = (e) => Reflect.getPrototypeOf(e);
function Id(e, t, n) {
  return function(...s) {
    const r = this.__v_raw, i = Be(r), o = Qs(i), a = e === "entries" || e === Symbol.iterator && o, l = e === "keys" && o, u = r[e](...s), c = n ? ta : t ? Di : St;
    return !t && Rt(
      i,
      "iterate",
      l ? ea : Ms
    ), {
      // iterator protocol
      next() {
        const { value: b, done: T } = u.next();
        return T ? { value: b, done: T } : {
          value: a ? [c(b[0]), c(b[1])] : c(b),
          done: T
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function pi(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function Od(e, t) {
  const n = {
    get(r) {
      const i = this.__v_raw, o = Be(i), a = Be(r);
      e || (os(r, a) && Rt(o, "get", r), Rt(o, "get", a));
      const { has: l } = hi(o), u = t ? ta : e ? Di : St;
      if (l.call(o, r))
        return u(i.get(r));
      if (l.call(o, a))
        return u(i.get(a));
      i !== o && i.get(r);
    },
    get size() {
      const r = this.__v_raw;
      return !e && Rt(Be(r), "iterate", Ms), Reflect.get(r, "size", r);
    },
    has(r) {
      const i = this.__v_raw, o = Be(i), a = Be(r);
      return e || (os(r, a) && Rt(o, "has", r), Rt(o, "has", a)), r === a ? i.has(r) : i.has(r) || i.has(a);
    },
    forEach(r, i) {
      const o = this, a = o.__v_raw, l = Be(a), u = t ? ta : e ? Di : St;
      return !e && Rt(l, "iterate", Ms), a.forEach((c, b) => r.call(i, u(c), u(b), o));
    }
  };
  return Ot(
    n,
    e ? {
      add: pi("add"),
      set: pi("set"),
      delete: pi("delete"),
      clear: pi("clear")
    } : {
      add(r) {
        !t && !cn(r) && !us(r) && (r = Be(r));
        const i = Be(this);
        return hi(i).has.call(i, r) || (i.add(r), Dn(i, "add", r, r)), this;
      },
      set(r, i) {
        !t && !cn(i) && !us(i) && (i = Be(i));
        const o = Be(this), { has: a, get: l } = hi(o);
        let u = a.call(o, r);
        u || (r = Be(r), u = a.call(o, r));
        const c = l.call(o, r);
        return o.set(r, i), u ? os(i, c) && Dn(o, "set", r, i) : Dn(o, "add", r, i), this;
      },
      delete(r) {
        const i = Be(this), { has: o, get: a } = hi(i);
        let l = o.call(i, r);
        l || (r = Be(r), l = o.call(i, r)), a && a.call(i, r);
        const u = i.delete(r);
        return l && Dn(i, "delete", r, void 0), u;
      },
      clear() {
        const r = Be(this), i = r.size !== 0, o = r.clear();
        return i && Dn(
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
    n[r] = Id(r, e, t);
  }), n;
}
function Ra(e, t) {
  const n = Od(e, t);
  return (s, r, i) => r === "__v_isReactive" ? !e : r === "__v_isReadonly" ? e : r === "__v_raw" ? s : Reflect.get(
    qe(n, r) && r in s ? n : s,
    r,
    i
  );
}
const Ld = {
  get: /* @__PURE__ */ Ra(!1, !1)
}, Nd = {
  get: /* @__PURE__ */ Ra(!1, !0)
}, Pd = {
  get: /* @__PURE__ */ Ra(!0, !1)
};
const lu = /* @__PURE__ */ new WeakMap(), cu = /* @__PURE__ */ new WeakMap(), uu = /* @__PURE__ */ new WeakMap(), Md = /* @__PURE__ */ new WeakMap();
function Dd(e) {
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
function Fd(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : Dd(cd(e));
}
function qr(e) {
  return us(e) ? e : Ia(
    e,
    !1,
    Ed,
    Ld,
    lu
  );
}
function $d(e) {
  return Ia(
    e,
    !1,
    Rd,
    Nd,
    cu
  );
}
function fu(e) {
  return Ia(
    e,
    !0,
    Cd,
    Pd,
    uu
  );
}
function Ia(e, t, n, s, r) {
  if (!ct(e) || e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const i = Fd(e);
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
  return us(e) ? er(e.__v_raw) : !!(e && e.__v_isReactive);
}
function us(e) {
  return !!(e && e.__v_isReadonly);
}
function cn(e) {
  return !!(e && e.__v_isShallow);
}
function Oa(e) {
  return e ? !!e.__v_raw : !1;
}
function Be(e) {
  const t = e && e.__v_raw;
  return t ? Be(t) : e;
}
function Bd(e) {
  return !qe(e, "__v_skip") && Object.isExtensible(e) && Xo(e, "__v_skip", !0), e;
}
const St = (e) => ct(e) ? qr(e) : e, Di = (e) => ct(e) ? fu(e) : e;
function It(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function oe(e) {
  return du(e, !1);
}
function Ud(e) {
  return du(e, !0);
}
function du(e, t) {
  return It(e) ? e : new zd(e, t);
}
class zd {
  constructor(t, n) {
    this.dep = new Ca(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? t : Be(t), this._value = n ? t : St(t), this.__v_isShallow = n;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const n = this._rawValue, s = this.__v_isShallow || cn(t) || us(t);
    t = s ? t : Be(t), os(t, n) && (this._rawValue = t, this._value = s ? t : St(t), this.dep.trigger());
  }
}
function x(e) {
  return It(e) ? e.value : e;
}
const Hd = {
  get: (e, t, n) => t === "__v_raw" ? e : x(Reflect.get(e, t, n)),
  set: (e, t, n, s) => {
    const r = e[t];
    return It(r) && !It(n) ? (r.value = n, !0) : Reflect.set(e, t, n, s);
  }
};
function hu(e) {
  return er(e) ? e : new Proxy(e, Hd);
}
class jd {
  constructor(t, n, s) {
    this.fn = t, this.setter = n, this._value = void 0, this.dep = new Ca(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Ur - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = s;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    it !== this)
      return Qc(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return nu(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
function Wd(e, t, n = !1) {
  let s, r;
  return Ce(e) ? s = e : (s = e.get, r = e.set), new jd(s, r, n);
}
const mi = {}, Fi = /* @__PURE__ */ new WeakMap();
let Is;
function qd(e, t = !1, n = Is) {
  if (n) {
    let s = Fi.get(n);
    s || Fi.set(n, s = []), s.push(e);
  }
}
function Vd(e, t, n = nt) {
  const { immediate: s, deep: r, once: i, scheduler: o, augmentJob: a, call: l } = n, u = (C) => r ? C : cn(C) || r === !1 || r === 0 ? Fn(C, 1) : Fn(C);
  let c, b, T, I, O = !1, H = !1;
  if (It(e) ? (b = () => e.value, O = cn(e)) : er(e) ? (b = () => u(e), O = !0) : Ae(e) ? (H = !0, O = e.some((C) => er(C) || cn(C)), b = () => e.map((C) => {
    if (It(C))
      return C.value;
    if (er(C))
      return u(C);
    if (Ce(C))
      return l ? l(C, 2) : C();
  })) : Ce(e) ? t ? b = l ? () => l(e, 2) : e : b = () => {
    if (T) {
      Un();
      try {
        T();
      } finally {
        zn();
      }
    }
    const C = Is;
    Is = c;
    try {
      return l ? l(e, 3, [I]) : e(I);
    } finally {
      Is = C;
    }
  } : b = An, t && r) {
    const C = b, P = r === !0 ? 1 / 0 : r;
    b = () => Fn(C(), P);
  }
  const ue = vd(), R = () => {
    c.stop(), ue && ue.active && Ta(ue.effects, c);
  };
  if (i && t) {
    const C = t;
    t = (...P) => {
      C(...P), R();
    };
  }
  let fe = H ? new Array(e.length).fill(mi) : mi;
  const _e = (C) => {
    if (!(!(c.flags & 1) || !c.dirty && !C))
      if (t) {
        const P = c.run();
        if (r || O || (H ? P.some((S, W) => os(S, fe[W])) : os(P, fe))) {
          T && T();
          const S = Is;
          Is = c;
          try {
            const W = [
              P,
              // pass undefined as the old value when it's changed for the first time
              fe === mi ? void 0 : H && fe[0] === mi ? [] : fe,
              I
            ];
            fe = P, l ? l(t, 3, W) : (
              // @ts-expect-error
              t(...W)
            );
          } finally {
            Is = S;
          }
        }
      } else
        c.run();
  };
  return a && a(_e), c = new Zc(b), c.scheduler = o ? () => o(_e, !1) : _e, I = (C) => qd(C, !1, c), T = c.onStop = () => {
    const C = Fi.get(c);
    if (C) {
      if (l)
        l(C, 4);
      else
        for (const P of C) P();
      Fi.delete(c);
    }
  }, t ? s ? _e(!0) : fe = c.run() : o ? o(_e.bind(null, !0), !0) : c.run(), R.pause = c.pause.bind(c), R.resume = c.resume.bind(c), R.stop = R, R;
}
function Fn(e, t = 1 / 0, n) {
  if (t <= 0 || !ct(e) || e.__v_skip || (n = n || /* @__PURE__ */ new Set(), n.has(e)))
    return e;
  if (n.add(e), t--, It(e))
    Fn(e.value, t, n);
  else if (Ae(e))
    for (let s = 0; s < e.length; s++)
      Fn(e[s], t, n);
  else if (jc(e) || Qs(e))
    e.forEach((s) => {
      Fn(s, t, n);
    });
  else if (Vc(e)) {
    for (const s in e)
      Fn(e[s], t, n);
    for (const s of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, s) && Fn(e[s], t, n);
  }
  return e;
}
/**
* @vue/runtime-core v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function Vr(e, t, n, s) {
  try {
    return s ? e(...s) : e();
  } catch (r) {
    no(r, t, n);
  }
}
function En(e, t, n, s) {
  if (Ce(e)) {
    const r = Vr(e, t, n, s);
    return r && Wc(r) && r.catch((i) => {
      no(i, t, n);
    }), r;
  }
  if (Ae(e)) {
    const r = [];
    for (let i = 0; i < e.length; i++)
      r.push(En(e[i], t, n, s));
    return r;
  }
}
function no(e, t, n, s = !0) {
  const r = t ? t.vnode : null, { errorHandler: i, throwUnhandledErrorInProduction: o } = t && t.appContext.config || nt;
  if (t) {
    let a = t.parent;
    const l = t.proxy, u = `https://vuejs.org/error-reference/#runtime-${n}`;
    for (; a; ) {
      const c = a.ec;
      if (c) {
        for (let b = 0; b < c.length; b++)
          if (c[b](e, l, u) === !1)
            return;
      }
      a = a.parent;
    }
    if (i) {
      Un(), Vr(i, null, 10, [
        e,
        l,
        u
      ]), zn();
      return;
    }
  }
  Kd(e, n, r, s, o);
}
function Kd(e, t, n, s = !0, r = !1) {
  if (r)
    throw e;
  console.error(e);
}
const Dt = [];
let kn = -1;
const tr = [];
let ss = null, Ys = 0;
const pu = /* @__PURE__ */ Promise.resolve();
let $i = null;
function is(e) {
  const t = $i || pu;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function Gd(e) {
  let t = kn + 1, n = Dt.length;
  for (; t < n; ) {
    const s = t + n >>> 1, r = Dt[s], i = Hr(r);
    i < e || i === e && r.flags & 2 ? t = s + 1 : n = s;
  }
  return t;
}
function La(e) {
  if (!(e.flags & 1)) {
    const t = Hr(e), n = Dt[Dt.length - 1];
    !n || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= Hr(n) ? Dt.push(e) : Dt.splice(Gd(t), 0, e), e.flags |= 1, mu();
  }
}
function mu() {
  $i || ($i = pu.then(_u));
}
function Yd(e) {
  Ae(e) ? tr.push(...e) : ss && e.id === -1 ? ss.splice(Ys + 1, 0, e) : e.flags & 1 || (tr.push(e), e.flags |= 1), mu();
}
function Il(e, t, n = kn + 1) {
  for (; n < Dt.length; n++) {
    const s = Dt[n];
    if (s && s.flags & 2) {
      if (e && s.id !== e.uid)
        continue;
      Dt.splice(n, 1), n--, s.flags & 4 && (s.flags &= -2), s(), s.flags & 4 || (s.flags &= -2);
    }
  }
}
function gu(e) {
  if (tr.length) {
    const t = [...new Set(tr)].sort(
      (n, s) => Hr(n) - Hr(s)
    );
    if (tr.length = 0, ss) {
      ss.push(...t);
      return;
    }
    for (ss = t, Ys = 0; Ys < ss.length; Ys++) {
      const n = ss[Ys];
      n.flags & 4 && (n.flags &= -2), n.flags & 8 || n(), n.flags &= -2;
    }
    ss = null, Ys = 0;
  }
}
const Hr = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function _u(e) {
  try {
    for (kn = 0; kn < Dt.length; kn++) {
      const t = Dt[kn];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), Vr(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; kn < Dt.length; kn++) {
      const t = Dt[kn];
      t && (t.flags &= -2);
    }
    kn = -1, Dt.length = 0, gu(), $i = null, (Dt.length || tr.length) && _u();
  }
}
let ln = null, yu = null;
function Bi(e) {
  const t = ln;
  return ln = e, yu = e && e.type.__scopeId || null, t;
}
function Xd(e, t = ln, n) {
  if (!t || e._n)
    return e;
  const s = (...r) => {
    s._d && Bl(-1);
    const i = Bi(t);
    let o;
    try {
      o = e(...r);
    } finally {
      Bi(i), s._d && Bl(1);
    }
    return o;
  };
  return s._n = !0, s._c = !0, s._d = !0, s;
}
function ts(e, t) {
  if (ln === null)
    return e;
  const n = lo(ln), s = e.dirs || (e.dirs = []);
  for (let r = 0; r < t.length; r++) {
    let [i, o, a, l = nt] = t[r];
    i && (Ce(i) && (i = {
      mounted: i,
      updated: i
    }), i.deep && Fn(o), s.push({
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
function Ss(e, t, n, s) {
  const r = e.dirs, i = t && t.dirs;
  for (let o = 0; o < r.length; o++) {
    const a = r[o];
    i && (a.oldValue = i[o].value);
    let l = a.dir[s];
    l && (Un(), En(l, n, 8, [
      e.el,
      a,
      e,
      t
    ]), zn());
  }
}
const Zd = Symbol("_vte"), Jd = (e) => e.__isTeleport;
function Na(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, Na(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function ps(e, t) {
  return Ce(e) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    Ot({ name: e.name }, t, { setup: e })
  ) : e;
}
function vu(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
function Pr(e, t, n, s, r = !1) {
  if (Ae(e)) {
    e.forEach(
      (O, H) => Pr(
        O,
        t && (Ae(t) ? t[H] : t),
        n,
        s,
        r
      )
    );
    return;
  }
  if (Mr(s) && !r) {
    s.shapeFlag & 512 && s.type.__asyncResolved && s.component.subTree.component && Pr(e, t, n, s.component.subTree);
    return;
  }
  const i = s.shapeFlag & 4 ? lo(s.component) : s.el, o = r ? null : i, { i: a, r: l } = e, u = t && t.r, c = a.refs === nt ? a.refs = {} : a.refs, b = a.setupState, T = Be(b), I = b === nt ? () => !1 : (O) => qe(T, O);
  if (u != null && u !== l && (gt(u) ? (c[u] = null, I(u) && (b[u] = null)) : It(u) && (u.value = null)), Ce(l))
    Vr(l, a, 12, [o, c]);
  else {
    const O = gt(l), H = It(l);
    if (O || H) {
      const ue = () => {
        if (e.f) {
          const R = O ? I(l) ? b[l] : c[l] : l.value;
          r ? Ae(R) && Ta(R, i) : Ae(R) ? R.includes(i) || R.push(i) : O ? (c[l] = [i], I(l) && (b[l] = c[l])) : (l.value = [i], e.k && (c[e.k] = l.value));
        } else O ? (c[l] = o, I(l) && (b[l] = o)) : H && (l.value = o, e.k && (c[e.k] = o));
      };
      o ? (ue.id = -1, Xt(ue, n)) : ue();
    }
  }
}
eo().requestIdleCallback;
eo().cancelIdleCallback;
const Mr = (e) => !!e.type.__asyncLoader, bu = (e) => e.type.__isKeepAlive;
function Qd(e, t) {
  wu(e, "a", t);
}
function eh(e, t) {
  wu(e, "da", t);
}
function wu(e, t, n = Ft) {
  const s = e.__wdc || (e.__wdc = () => {
    let r = n;
    for (; r; ) {
      if (r.isDeactivated)
        return;
      r = r.parent;
    }
    return e();
  });
  if (so(t, s, n), n) {
    let r = n.parent;
    for (; r && r.parent; )
      bu(r.parent.vnode) && th(s, t, n, r), r = r.parent;
  }
}
function th(e, t, n, s) {
  const r = so(
    t,
    e,
    s,
    !0
    /* prepend */
  );
  Kr(() => {
    Ta(s[t], r);
  }, n);
}
function so(e, t, n = Ft, s = !1) {
  if (n) {
    const r = n[e] || (n[e] = []), i = t.__weh || (t.__weh = (...o) => {
      Un();
      const a = Gr(n), l = En(t, n, e, o);
      return a(), zn(), l;
    });
    return s ? r.unshift(i) : r.push(i), i;
  }
}
const Hn = (e) => (t, n = Ft) => {
  (!Wr || e === "sp") && so(e, (...s) => t(...s), n);
}, nh = Hn("bm"), ro = Hn("m"), sh = Hn(
  "bu"
), rh = Hn("u"), io = Hn(
  "bum"
), Kr = Hn("um"), ih = Hn(
  "sp"
), oh = Hn("rtg"), ah = Hn("rtc");
function lh(e, t = Ft) {
  so("ec", e, t);
}
const ch = Symbol.for("v-ndc");
function ht(e, t, n, s) {
  let r;
  const i = n, o = Ae(e);
  if (o || gt(e)) {
    const a = o && er(e);
    let l = !1, u = !1;
    a && (l = !cn(e), u = us(e), e = to(e)), r = new Array(e.length);
    for (let c = 0, b = e.length; c < b; c++)
      r[c] = t(
        l ? u ? Di(St(e[c])) : St(e[c]) : e[c],
        c,
        void 0,
        i
      );
  } else if (typeof e == "number") {
    r = new Array(e);
    for (let a = 0; a < e; a++)
      r[a] = t(a + 1, a, void 0, i);
  } else if (ct(e))
    if (e[Symbol.iterator])
      r = Array.from(
        e,
        (a, l) => t(a, l, void 0, i)
      );
    else {
      const a = Object.keys(e);
      r = new Array(a.length);
      for (let l = 0, u = a.length; l < u; l++) {
        const c = a[l];
        r[l] = t(e[c], c, l, i);
      }
    }
  else
    r = [];
  return r;
}
const na = (e) => e ? Hu(e) ? lo(e) : na(e.parent) : null, Dr = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ Ot(/* @__PURE__ */ Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => e.props,
    $attrs: (e) => e.attrs,
    $slots: (e) => e.slots,
    $refs: (e) => e.refs,
    $parent: (e) => na(e.parent),
    $root: (e) => na(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => Tu(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      La(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = is.bind(e.proxy)),
    $watch: (e) => Oh.bind(e)
  })
), Oo = (e, t) => e !== nt && !e.__isScriptSetup && qe(e, t), uh = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: n, setupState: s, data: r, props: i, accessCache: o, type: a, appContext: l } = e;
    let u;
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
        if (Oo(s, t))
          return o[t] = 1, s[t];
        if (r !== nt && qe(r, t))
          return o[t] = 2, r[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (u = e.propsOptions[0]) && qe(u, t)
        )
          return o[t] = 3, i[t];
        if (n !== nt && qe(n, t))
          return o[t] = 4, n[t];
        sa && (o[t] = 0);
      }
    }
    const c = Dr[t];
    let b, T;
    if (c)
      return t === "$attrs" && Rt(e.attrs, "get", ""), c(e);
    if (
      // css module (injected by vue-loader)
      (b = a.__cssModules) && (b = b[t])
    )
      return b;
    if (n !== nt && qe(n, t))
      return o[t] = 4, n[t];
    if (
      // global properties
      T = l.config.globalProperties, qe(T, t)
    )
      return T[t];
  },
  set({ _: e }, t, n) {
    const { data: s, setupState: r, ctx: i } = e;
    return Oo(r, t) ? (r[t] = n, !0) : s !== nt && qe(s, t) ? (s[t] = n, !0) : qe(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (i[t] = n, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: n, ctx: s, appContext: r, propsOptions: i }
  }, o) {
    let a;
    return !!n[o] || e !== nt && qe(e, o) || Oo(t, o) || (a = i[0]) && qe(a, o) || qe(s, o) || qe(Dr, o) || qe(r.config.globalProperties, o);
  },
  defineProperty(e, t, n) {
    return n.get != null ? e._.accessCache[t] = 0 : qe(n, "value") && this.set(e, t, n.value, null), Reflect.defineProperty(e, t, n);
  }
};
function Ol(e) {
  return Ae(e) ? e.reduce(
    (t, n) => (t[n] = null, t),
    {}
  ) : e;
}
let sa = !0;
function fh(e) {
  const t = Tu(e), n = e.proxy, s = e.ctx;
  sa = !1, t.beforeCreate && Ll(t.beforeCreate, e, "bc");
  const {
    // state
    data: r,
    computed: i,
    methods: o,
    watch: a,
    provide: l,
    inject: u,
    // lifecycle
    created: c,
    beforeMount: b,
    mounted: T,
    beforeUpdate: I,
    updated: O,
    activated: H,
    deactivated: ue,
    beforeDestroy: R,
    beforeUnmount: fe,
    destroyed: _e,
    unmounted: C,
    render: P,
    renderTracked: S,
    renderTriggered: W,
    errorCaptured: se,
    serverPrefetch: me,
    // public API
    expose: ge,
    inheritAttrs: Oe,
    // assets
    components: Se,
    directives: Ke,
    filters: Ue
  } = t;
  if (u && dh(u, s, null), o)
    for (const Te in o) {
      const ye = o[Te];
      Ce(ye) && (s[Te] = ye.bind(n));
    }
  if (r) {
    const Te = r.call(n, n);
    ct(Te) && (e.data = qr(Te));
  }
  if (sa = !0, i)
    for (const Te in i) {
      const ye = i[Te], Ze = Ce(ye) ? ye.bind(n, n) : Ce(ye.get) ? ye.get.bind(n, n) : An, Je = !Ce(ye) && Ce(ye.set) ? ye.set.bind(n) : An, lt = ae({
        get: Ze,
        set: Je
      });
      Object.defineProperty(s, Te, {
        enumerable: !0,
        configurable: !0,
        get: () => lt.value,
        set: (je) => lt.value = je
      });
    }
  if (a)
    for (const Te in a)
      ku(a[Te], s, n, Te);
  if (l) {
    const Te = Ce(l) ? l.call(n) : l;
    Reflect.ownKeys(Te).forEach((ye) => {
      yh(ye, Te[ye]);
    });
  }
  c && Ll(c, e, "c");
  function de(Te, ye) {
    Ae(ye) ? ye.forEach((Ze) => Te(Ze.bind(n))) : ye && Te(ye.bind(n));
  }
  if (de(nh, b), de(ro, T), de(sh, I), de(rh, O), de(Qd, H), de(eh, ue), de(lh, se), de(ah, S), de(oh, W), de(io, fe), de(Kr, C), de(ih, me), Ae(ge))
    if (ge.length) {
      const Te = e.exposed || (e.exposed = {});
      ge.forEach((ye) => {
        Object.defineProperty(Te, ye, {
          get: () => n[ye],
          set: (Ze) => n[ye] = Ze,
          enumerable: !0
        });
      });
    } else e.exposed || (e.exposed = {});
  P && e.render === An && (e.render = P), Oe != null && (e.inheritAttrs = Oe), Se && (e.components = Se), Ke && (e.directives = Ke), me && vu(e);
}
function dh(e, t, n = An) {
  Ae(e) && (e = ra(e));
  for (const s in e) {
    const r = e[s];
    let i;
    ct(r) ? "default" in r ? i = ki(
      r.from || s,
      r.default,
      !0
    ) : i = ki(r.from || s) : i = ki(r), It(i) ? Object.defineProperty(t, s, {
      enumerable: !0,
      configurable: !0,
      get: () => i.value,
      set: (o) => i.value = o
    }) : t[s] = i;
  }
}
function Ll(e, t, n) {
  En(
    Ae(e) ? e.map((s) => s.bind(t.proxy)) : e.bind(t.proxy),
    t,
    n
  );
}
function ku(e, t, n, s) {
  let r = s.includes(".") ? Du(n, s) : () => n[s];
  if (gt(e)) {
    const i = t[e];
    Ce(i) && pt(r, i);
  } else if (Ce(e))
    pt(r, e.bind(n));
  else if (ct(e))
    if (Ae(e))
      e.forEach((i) => ku(i, t, n, s));
    else {
      const i = Ce(e.handler) ? e.handler.bind(n) : t[e.handler];
      Ce(i) && pt(r, i, e);
    }
}
function Tu(e) {
  const t = e.type, { mixins: n, extends: s } = t, {
    mixins: r,
    optionsCache: i,
    config: { optionMergeStrategies: o }
  } = e.appContext, a = i.get(t);
  let l;
  return a ? l = a : !r.length && !n && !s ? l = t : (l = {}, r.length && r.forEach(
    (u) => Ui(l, u, o, !0)
  ), Ui(l, t, o)), ct(t) && i.set(t, l), l;
}
function Ui(e, t, n, s = !1) {
  const { mixins: r, extends: i } = t;
  i && Ui(e, i, n, !0), r && r.forEach(
    (o) => Ui(e, o, n, !0)
  );
  for (const o in t)
    if (!(s && o === "expose")) {
      const a = hh[o] || n && n[o];
      e[o] = a ? a(e[o], t[o]) : t[o];
    }
  return e;
}
const hh = {
  data: Nl,
  props: Pl,
  emits: Pl,
  // objects
  methods: Er,
  computed: Er,
  // lifecycle
  beforeCreate: Mt,
  created: Mt,
  beforeMount: Mt,
  mounted: Mt,
  beforeUpdate: Mt,
  updated: Mt,
  beforeDestroy: Mt,
  beforeUnmount: Mt,
  destroyed: Mt,
  unmounted: Mt,
  activated: Mt,
  deactivated: Mt,
  errorCaptured: Mt,
  serverPrefetch: Mt,
  // assets
  components: Er,
  directives: Er,
  // watch
  watch: mh,
  // provide / inject
  provide: Nl,
  inject: ph
};
function Nl(e, t) {
  return t ? e ? function() {
    return Ot(
      Ce(e) ? e.call(this, this) : e,
      Ce(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function ph(e, t) {
  return Er(ra(e), ra(t));
}
function ra(e) {
  if (Ae(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++)
      t[e[n]] = e[n];
    return t;
  }
  return e;
}
function Mt(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function Er(e, t) {
  return e ? Ot(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function Pl(e, t) {
  return e ? Ae(e) && Ae(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : Ot(
    /* @__PURE__ */ Object.create(null),
    Ol(e),
    Ol(t ?? {})
  ) : t;
}
function mh(e, t) {
  if (!e) return t;
  if (!t) return e;
  const n = Ot(/* @__PURE__ */ Object.create(null), e);
  for (const s in t)
    n[s] = Mt(e[s], t[s]);
  return n;
}
function Au() {
  return {
    app: null,
    config: {
      isNativeTag: ad,
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
let gh = 0;
function _h(e, t) {
  return function(s, r = null) {
    Ce(s) || (s = Ot({}, s)), r != null && !ct(r) && (r = null);
    const i = Au(), o = /* @__PURE__ */ new WeakSet(), a = [];
    let l = !1;
    const u = i.app = {
      _uid: gh++,
      _component: s,
      _props: r,
      _container: null,
      _context: i,
      _instance: null,
      version: Jh,
      get config() {
        return i.config;
      },
      set config(c) {
      },
      use(c, ...b) {
        return o.has(c) || (c && Ce(c.install) ? (o.add(c), c.install(u, ...b)) : Ce(c) && (o.add(c), c(u, ...b))), u;
      },
      mixin(c) {
        return i.mixins.includes(c) || i.mixins.push(c), u;
      },
      component(c, b) {
        return b ? (i.components[c] = b, u) : i.components[c];
      },
      directive(c, b) {
        return b ? (i.directives[c] = b, u) : i.directives[c];
      },
      mount(c, b, T) {
        if (!l) {
          const I = u._ceVNode || Sn(s, r);
          return I.appContext = i, T === !0 ? T = "svg" : T === !1 && (T = void 0), e(I, c, T), l = !0, u._container = c, c.__vue_app__ = u, lo(I.component);
        }
      },
      onUnmount(c) {
        a.push(c);
      },
      unmount() {
        l && (En(
          a,
          u._instance,
          16
        ), e(null, u._container), delete u._container.__vue_app__);
      },
      provide(c, b) {
        return i.provides[c] = b, u;
      },
      runWithContext(c) {
        const b = nr;
        nr = u;
        try {
          return c();
        } finally {
          nr = b;
        }
      }
    };
    return u;
  };
}
let nr = null;
function yh(e, t) {
  if (Ft) {
    let n = Ft.provides;
    const s = Ft.parent && Ft.parent.provides;
    s === n && (n = Ft.provides = Object.create(s)), n[e] = t;
  }
}
function ki(e, t, n = !1) {
  const s = Vh();
  if (s || nr) {
    let r = nr ? nr._context.provides : s ? s.parent == null || s.ce ? s.vnode.appContext && s.vnode.appContext.provides : s.parent.provides : void 0;
    if (r && e in r)
      return r[e];
    if (arguments.length > 1)
      return n && Ce(t) ? t.call(s && s.proxy) : t;
  }
}
const Su = {}, xu = () => Object.create(Su), Eu = (e) => Object.getPrototypeOf(e) === Su;
function vh(e, t, n, s = !1) {
  const r = {}, i = xu();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), Cu(e, t, r, i);
  for (const o in e.propsOptions[0])
    o in r || (r[o] = void 0);
  n ? e.props = s ? r : $d(r) : e.type.props ? e.props = r : e.props = i, e.attrs = i;
}
function bh(e, t, n, s) {
  const {
    props: r,
    attrs: i,
    vnode: { patchFlag: o }
  } = e, a = Be(r), [l] = e.propsOptions;
  let u = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (s || o > 0) && !(o & 16)
  ) {
    if (o & 8) {
      const c = e.vnode.dynamicProps;
      for (let b = 0; b < c.length; b++) {
        let T = c[b];
        if (oo(e.emitsOptions, T))
          continue;
        const I = t[T];
        if (l)
          if (qe(i, T))
            I !== i[T] && (i[T] = I, u = !0);
          else {
            const O = cs(T);
            r[O] = ia(
              l,
              a,
              O,
              I,
              e,
              !1
            );
          }
        else
          I !== i[T] && (i[T] = I, u = !0);
      }
    }
  } else {
    Cu(e, t, r, i) && (u = !0);
    let c;
    for (const b in a)
      (!t || // for camelCase
      !qe(t, b) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((c = hs(b)) === b || !qe(t, c))) && (l ? n && // for camelCase
      (n[b] !== void 0 || // for kebab-case
      n[c] !== void 0) && (r[b] = ia(
        l,
        a,
        b,
        void 0,
        e,
        !0
      )) : delete r[b]);
    if (i !== a)
      for (const b in i)
        (!t || !qe(t, b)) && (delete i[b], u = !0);
  }
  u && Dn(e.attrs, "set", "");
}
function Cu(e, t, n, s) {
  const [r, i] = e.propsOptions;
  let o = !1, a;
  if (t)
    for (let l in t) {
      if (Or(l))
        continue;
      const u = t[l];
      let c;
      r && qe(r, c = cs(l)) ? !i || !i.includes(c) ? n[c] = u : (a || (a = {}))[c] = u : oo(e.emitsOptions, l) || (!(l in s) || u !== s[l]) && (s[l] = u, o = !0);
    }
  if (i) {
    const l = Be(n), u = a || nt;
    for (let c = 0; c < i.length; c++) {
      const b = i[c];
      n[b] = ia(
        r,
        l,
        b,
        u[b],
        e,
        !qe(u, b)
      );
    }
  }
  return o;
}
function ia(e, t, n, s, r, i) {
  const o = e[n];
  if (o != null) {
    const a = qe(o, "default");
    if (a && s === void 0) {
      const l = o.default;
      if (o.type !== Function && !o.skipFactory && Ce(l)) {
        const { propsDefaults: u } = r;
        if (n in u)
          s = u[n];
        else {
          const c = Gr(r);
          s = u[n] = l.call(
            null,
            t
          ), c();
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
const wh = /* @__PURE__ */ new WeakMap();
function Ru(e, t, n = !1) {
  const s = n ? wh : t.propsCache, r = s.get(e);
  if (r)
    return r;
  const i = e.props, o = {}, a = [];
  let l = !1;
  if (!Ce(e)) {
    const c = (b) => {
      l = !0;
      const [T, I] = Ru(b, t, !0);
      Ot(o, T), I && a.push(...I);
    };
    !n && t.mixins.length && t.mixins.forEach(c), e.extends && c(e.extends), e.mixins && e.mixins.forEach(c);
  }
  if (!i && !l)
    return ct(e) && s.set(e, Js), Js;
  if (Ae(i))
    for (let c = 0; c < i.length; c++) {
      const b = cs(i[c]);
      Ml(b) && (o[b] = nt);
    }
  else if (i)
    for (const c in i) {
      const b = cs(c);
      if (Ml(b)) {
        const T = i[c], I = o[b] = Ae(T) || Ce(T) ? { type: T } : Ot({}, T), O = I.type;
        let H = !1, ue = !0;
        if (Ae(O))
          for (let R = 0; R < O.length; ++R) {
            const fe = O[R], _e = Ce(fe) && fe.name;
            if (_e === "Boolean") {
              H = !0;
              break;
            } else _e === "String" && (ue = !1);
          }
        else
          H = Ce(O) && O.name === "Boolean";
        I[
          0
          /* shouldCast */
        ] = H, I[
          1
          /* shouldCastTrue */
        ] = ue, (H || qe(I, "default")) && a.push(b);
      }
    }
  const u = [o, a];
  return ct(e) && s.set(e, u), u;
}
function Ml(e) {
  return e[0] !== "$" && !Or(e);
}
const Pa = (e) => e === "_" || e === "__" || e === "_ctx" || e === "$stable", Ma = (e) => Ae(e) ? e.map(Tn) : [Tn(e)], kh = (e, t, n) => {
  if (t._n)
    return t;
  const s = Xd((...r) => Ma(t(...r)), n);
  return s._c = !1, s;
}, Iu = (e, t, n) => {
  const s = e._ctx;
  for (const r in e) {
    if (Pa(r)) continue;
    const i = e[r];
    if (Ce(i))
      t[r] = kh(r, i, s);
    else if (i != null) {
      const o = Ma(i);
      t[r] = () => o;
    }
  }
}, Ou = (e, t) => {
  const n = Ma(t);
  e.slots.default = () => n;
}, Lu = (e, t, n) => {
  for (const s in t)
    (n || !Pa(s)) && (e[s] = t[s]);
}, Th = (e, t, n) => {
  const s = e.slots = xu();
  if (e.vnode.shapeFlag & 32) {
    const r = t.__;
    r && Xo(s, "__", r, !0);
    const i = t._;
    i ? (Lu(s, t, n), n && Xo(s, "_", i, !0)) : Iu(t, s);
  } else t && Ou(e, t);
}, Ah = (e, t, n) => {
  const { vnode: s, slots: r } = e;
  let i = !0, o = nt;
  if (s.shapeFlag & 32) {
    const a = t._;
    a ? n && a === 1 ? i = !1 : Lu(r, t, n) : (i = !t.$stable, Iu(t, r)), o = t;
  } else t && (Ou(e, t), o = { default: 1 });
  if (i)
    for (const a in r)
      !Pa(a) && o[a] == null && delete r[a];
}, Xt = $h;
function Sh(e) {
  return xh(e);
}
function xh(e, t) {
  const n = eo();
  n.__VUE__ = !0;
  const {
    insert: s,
    remove: r,
    patchProp: i,
    createElement: o,
    createText: a,
    createComment: l,
    setText: u,
    setElementText: c,
    parentNode: b,
    nextSibling: T,
    setScopeId: I = An,
    insertStaticContent: O
  } = e, H = (_, v, L, D = null, U = null, M = null, X = void 0, V = null, K = !!v.dynamicChildren) => {
    if (_ === v)
      return;
    _ && !yr(_, v) && (D = Bt(_), je(_, U, M, !0), _ = null), v.patchFlag === -2 && (K = !1, v.dynamicChildren = null);
    const { type: j, ref: re, shapeFlag: J } = v;
    switch (j) {
      case ao:
        ue(_, v, L, D);
        break;
      case fs:
        R(_, v, L, D);
        break;
      case Ti:
        _ == null && fe(v, L, D, X);
        break;
      case Re:
        Se(
          _,
          v,
          L,
          D,
          U,
          M,
          X,
          V,
          K
        );
        break;
      default:
        J & 1 ? P(
          _,
          v,
          L,
          D,
          U,
          M,
          X,
          V,
          K
        ) : J & 6 ? Ke(
          _,
          v,
          L,
          D,
          U,
          M,
          X,
          V,
          K
        ) : (J & 64 || J & 128) && j.process(
          _,
          v,
          L,
          D,
          U,
          M,
          X,
          V,
          K,
          Nt
        );
    }
    re != null && U ? Pr(re, _ && _.ref, M, v || _, !v) : re == null && _ && _.ref != null && Pr(_.ref, null, M, _, !0);
  }, ue = (_, v, L, D) => {
    if (_ == null)
      s(
        v.el = a(v.children),
        L,
        D
      );
    else {
      const U = v.el = _.el;
      v.children !== _.children && u(U, v.children);
    }
  }, R = (_, v, L, D) => {
    _ == null ? s(
      v.el = l(v.children || ""),
      L,
      D
    ) : v.el = _.el;
  }, fe = (_, v, L, D) => {
    [_.el, _.anchor] = O(
      _.children,
      v,
      L,
      D,
      _.el,
      _.anchor
    );
  }, _e = ({ el: _, anchor: v }, L, D) => {
    let U;
    for (; _ && _ !== v; )
      U = T(_), s(_, L, D), _ = U;
    s(v, L, D);
  }, C = ({ el: _, anchor: v }) => {
    let L;
    for (; _ && _ !== v; )
      L = T(_), r(_), _ = L;
    r(v);
  }, P = (_, v, L, D, U, M, X, V, K) => {
    v.type === "svg" ? X = "svg" : v.type === "math" && (X = "mathml"), _ == null ? S(
      v,
      L,
      D,
      U,
      M,
      X,
      V,
      K
    ) : me(
      _,
      v,
      U,
      M,
      X,
      V,
      K
    );
  }, S = (_, v, L, D, U, M, X, V) => {
    let K, j;
    const { props: re, shapeFlag: J, transition: Q, dirs: pe } = _;
    if (K = _.el = o(
      _.type,
      M,
      re && re.is,
      re
    ), J & 8 ? c(K, _.children) : J & 16 && se(
      _.children,
      K,
      null,
      D,
      U,
      Lo(_, M),
      X,
      V
    ), pe && Ss(_, null, D, "created"), W(K, _, _.scopeId, X, D), re) {
      for (const be in re)
        be !== "value" && !Or(be) && i(K, be, null, re[be], M, D);
      "value" in re && i(K, "value", null, re.value, M), (j = re.onVnodeBeforeMount) && bn(j, D, _);
    }
    pe && Ss(_, null, D, "beforeMount");
    const he = Eh(U, Q);
    he && Q.beforeEnter(K), s(K, v, L), ((j = re && re.onVnodeMounted) || he || pe) && Xt(() => {
      j && bn(j, D, _), he && Q.enter(K), pe && Ss(_, null, D, "mounted");
    }, U);
  }, W = (_, v, L, D, U) => {
    if (L && I(_, L), D)
      for (let M = 0; M < D.length; M++)
        I(_, D[M]);
    if (U) {
      let M = U.subTree;
      if (v === M || $u(M.type) && (M.ssContent === v || M.ssFallback === v)) {
        const X = U.vnode;
        W(
          _,
          X,
          X.scopeId,
          X.slotScopeIds,
          U.parent
        );
      }
    }
  }, se = (_, v, L, D, U, M, X, V, K = 0) => {
    for (let j = K; j < _.length; j++) {
      const re = _[j] = V ? rs(_[j]) : Tn(_[j]);
      H(
        null,
        re,
        v,
        L,
        D,
        U,
        M,
        X,
        V
      );
    }
  }, me = (_, v, L, D, U, M, X) => {
    const V = v.el = _.el;
    let { patchFlag: K, dynamicChildren: j, dirs: re } = v;
    K |= _.patchFlag & 16;
    const J = _.props || nt, Q = v.props || nt;
    let pe;
    if (L && xs(L, !1), (pe = Q.onVnodeBeforeUpdate) && bn(pe, L, v, _), re && Ss(v, _, L, "beforeUpdate"), L && xs(L, !0), (J.innerHTML && Q.innerHTML == null || J.textContent && Q.textContent == null) && c(V, ""), j ? ge(
      _.dynamicChildren,
      j,
      V,
      L,
      D,
      Lo(v, U),
      M
    ) : X || ye(
      _,
      v,
      V,
      null,
      L,
      D,
      Lo(v, U),
      M,
      !1
    ), K > 0) {
      if (K & 16)
        Oe(V, J, Q, L, U);
      else if (K & 2 && J.class !== Q.class && i(V, "class", null, Q.class, U), K & 4 && i(V, "style", J.style, Q.style, U), K & 8) {
        const he = v.dynamicProps;
        for (let be = 0; be < he.length; be++) {
          const ke = he[be], De = J[ke], $ = Q[ke];
          ($ !== De || ke === "value") && i(V, ke, De, $, U, L);
        }
      }
      K & 1 && _.children !== v.children && c(V, v.children);
    } else !X && j == null && Oe(V, J, Q, L, U);
    ((pe = Q.onVnodeUpdated) || re) && Xt(() => {
      pe && bn(pe, L, v, _), re && Ss(v, _, L, "updated");
    }, D);
  }, ge = (_, v, L, D, U, M, X) => {
    for (let V = 0; V < v.length; V++) {
      const K = _[V], j = v[V], re = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        K.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (K.type === Re || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !yr(K, j) || // - In the case of a component, it could contain anything.
        K.shapeFlag & 198) ? b(K.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          L
        )
      );
      H(
        K,
        j,
        re,
        null,
        D,
        U,
        M,
        X,
        !0
      );
    }
  }, Oe = (_, v, L, D, U) => {
    if (v !== L) {
      if (v !== nt)
        for (const M in v)
          !Or(M) && !(M in L) && i(
            _,
            M,
            v[M],
            null,
            U,
            D
          );
      for (const M in L) {
        if (Or(M)) continue;
        const X = L[M], V = v[M];
        X !== V && M !== "value" && i(_, M, V, X, U, D);
      }
      "value" in L && i(_, "value", v.value, L.value, U);
    }
  }, Se = (_, v, L, D, U, M, X, V, K) => {
    const j = v.el = _ ? _.el : a(""), re = v.anchor = _ ? _.anchor : a("");
    let { patchFlag: J, dynamicChildren: Q, slotScopeIds: pe } = v;
    pe && (V = V ? V.concat(pe) : pe), _ == null ? (s(j, L, D), s(re, L, D), se(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      v.children || [],
      L,
      re,
      U,
      M,
      X,
      V,
      K
    )) : J > 0 && J & 64 && Q && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    _.dynamicChildren ? (ge(
      _.dynamicChildren,
      Q,
      L,
      U,
      M,
      X,
      V
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (v.key != null || U && v === U.subTree) && Nu(
      _,
      v,
      !0
      /* shallow */
    )) : ye(
      _,
      v,
      L,
      re,
      U,
      M,
      X,
      V,
      K
    );
  }, Ke = (_, v, L, D, U, M, X, V, K) => {
    v.slotScopeIds = V, _ == null ? v.shapeFlag & 512 ? U.ctx.activate(
      v,
      L,
      D,
      X,
      K
    ) : Ue(
      v,
      L,
      D,
      U,
      M,
      X,
      K
    ) : st(_, v, K);
  }, Ue = (_, v, L, D, U, M, X) => {
    const V = _.component = qh(
      _,
      D,
      U
    );
    if (bu(_) && (V.ctx.renderer = Nt), Kh(V, !1, X), V.asyncDep) {
      if (U && U.registerDep(V, de, X), !_.el) {
        const K = V.subTree = Sn(fs);
        R(null, K, v, L), _.placeholder = K.el;
      }
    } else
      de(
        V,
        _,
        v,
        L,
        U,
        M,
        X
      );
  }, st = (_, v, L) => {
    const D = v.component = _.component;
    if (Dh(_, v, L))
      if (D.asyncDep && !D.asyncResolved) {
        Te(D, v, L);
        return;
      } else
        D.next = v, D.update();
    else
      v.el = _.el, D.vnode = v;
  }, de = (_, v, L, D, U, M, X) => {
    const V = () => {
      if (_.isMounted) {
        let { next: J, bu: Q, u: pe, parent: he, vnode: be } = _;
        {
          const f = Pu(_);
          if (f) {
            J && (J.el = be.el, Te(_, J, X)), f.asyncDep.then(() => {
              _.isUnmounted || V();
            });
            return;
          }
        }
        let ke = J, De;
        xs(_, !1), J ? (J.el = be.el, Te(_, J, X)) : J = be, Q && wi(Q), (De = J.props && J.props.onVnodeBeforeUpdate) && bn(De, he, J, be), xs(_, !0);
        const $ = Fl(_), z = _.subTree;
        _.subTree = $, H(
          z,
          $,
          // parent may have changed if it's in a teleport
          b(z.el),
          // anchor may have changed if it's in a fragment
          Bt(z),
          _,
          U,
          M
        ), J.el = $.el, ke === null && Fh(_, $.el), pe && Xt(pe, U), (De = J.props && J.props.onVnodeUpdated) && Xt(
          () => bn(De, he, J, be),
          U
        );
      } else {
        let J;
        const { el: Q, props: pe } = v, { bm: he, m: be, parent: ke, root: De, type: $ } = _, z = Mr(v);
        xs(_, !1), he && wi(he), !z && (J = pe && pe.onVnodeBeforeMount) && bn(J, ke, v), xs(_, !0);
        {
          De.ce && // @ts-expect-error _def is private
          De.ce._def.shadowRoot !== !1 && De.ce._injectChildStyle($);
          const f = _.subTree = Fl(_);
          H(
            null,
            f,
            L,
            D,
            _,
            U,
            M
          ), v.el = f.el;
        }
        if (be && Xt(be, U), !z && (J = pe && pe.onVnodeMounted)) {
          const f = v;
          Xt(
            () => bn(J, ke, f),
            U
          );
        }
        (v.shapeFlag & 256 || ke && Mr(ke.vnode) && ke.vnode.shapeFlag & 256) && _.a && Xt(_.a, U), _.isMounted = !0, v = L = D = null;
      }
    };
    _.scope.on();
    const K = _.effect = new Zc(V);
    _.scope.off();
    const j = _.update = K.run.bind(K), re = _.job = K.runIfDirty.bind(K);
    re.i = _, re.id = _.uid, K.scheduler = () => La(re), xs(_, !0), j();
  }, Te = (_, v, L) => {
    v.component = _;
    const D = _.vnode.props;
    _.vnode = v, _.next = null, bh(_, v.props, D, L), Ah(_, v.children, L), Un(), Il(_), zn();
  }, ye = (_, v, L, D, U, M, X, V, K = !1) => {
    const j = _ && _.children, re = _ ? _.shapeFlag : 0, J = v.children, { patchFlag: Q, shapeFlag: pe } = v;
    if (Q > 0) {
      if (Q & 128) {
        Je(
          j,
          J,
          L,
          D,
          U,
          M,
          X,
          V,
          K
        );
        return;
      } else if (Q & 256) {
        Ze(
          j,
          J,
          L,
          D,
          U,
          M,
          X,
          V,
          K
        );
        return;
      }
    }
    pe & 8 ? (re & 16 && wt(j, U, M), J !== j && c(L, J)) : re & 16 ? pe & 16 ? Je(
      j,
      J,
      L,
      D,
      U,
      M,
      X,
      V,
      K
    ) : wt(j, U, M, !0) : (re & 8 && c(L, ""), pe & 16 && se(
      J,
      L,
      D,
      U,
      M,
      X,
      V,
      K
    ));
  }, Ze = (_, v, L, D, U, M, X, V, K) => {
    _ = _ || Js, v = v || Js;
    const j = _.length, re = v.length, J = Math.min(j, re);
    let Q;
    for (Q = 0; Q < J; Q++) {
      const pe = v[Q] = K ? rs(v[Q]) : Tn(v[Q]);
      H(
        _[Q],
        pe,
        L,
        null,
        U,
        M,
        X,
        V,
        K
      );
    }
    j > re ? wt(
      _,
      U,
      M,
      !0,
      !1,
      J
    ) : se(
      v,
      L,
      D,
      U,
      M,
      X,
      V,
      K,
      J
    );
  }, Je = (_, v, L, D, U, M, X, V, K) => {
    let j = 0;
    const re = v.length;
    let J = _.length - 1, Q = re - 1;
    for (; j <= J && j <= Q; ) {
      const pe = _[j], he = v[j] = K ? rs(v[j]) : Tn(v[j]);
      if (yr(pe, he))
        H(
          pe,
          he,
          L,
          null,
          U,
          M,
          X,
          V,
          K
        );
      else
        break;
      j++;
    }
    for (; j <= J && j <= Q; ) {
      const pe = _[J], he = v[Q] = K ? rs(v[Q]) : Tn(v[Q]);
      if (yr(pe, he))
        H(
          pe,
          he,
          L,
          null,
          U,
          M,
          X,
          V,
          K
        );
      else
        break;
      J--, Q--;
    }
    if (j > J) {
      if (j <= Q) {
        const pe = Q + 1, he = pe < re ? v[pe].el : D;
        for (; j <= Q; )
          H(
            null,
            v[j] = K ? rs(v[j]) : Tn(v[j]),
            L,
            he,
            U,
            M,
            X,
            V,
            K
          ), j++;
      }
    } else if (j > Q)
      for (; j <= J; )
        je(_[j], U, M, !0), j++;
    else {
      const pe = j, he = j, be = /* @__PURE__ */ new Map();
      for (j = he; j <= Q; j++) {
        const E = v[j] = K ? rs(v[j]) : Tn(v[j]);
        E.key != null && be.set(E.key, j);
      }
      let ke, De = 0;
      const $ = Q - he + 1;
      let z = !1, f = 0;
      const y = new Array($);
      for (j = 0; j < $; j++) y[j] = 0;
      for (j = pe; j <= J; j++) {
        const E = _[j];
        if (De >= $) {
          je(E, U, M, !0);
          continue;
        }
        let q;
        if (E.key != null)
          q = be.get(E.key);
        else
          for (ke = he; ke <= Q; ke++)
            if (y[ke - he] === 0 && yr(E, v[ke])) {
              q = ke;
              break;
            }
        q === void 0 ? je(E, U, M, !0) : (y[q - he] = j + 1, q >= f ? f = q : z = !0, H(
          E,
          v[q],
          L,
          null,
          U,
          M,
          X,
          V,
          K
        ), De++);
      }
      const N = z ? Ch(y) : Js;
      for (ke = N.length - 1, j = $ - 1; j >= 0; j--) {
        const E = he + j, q = v[E], te = v[E + 1], ie = E + 1 < re ? (
          // #13559, fallback to el placeholder for unresolved async component
          te.el || te.placeholder
        ) : D;
        y[j] === 0 ? H(
          null,
          q,
          L,
          ie,
          U,
          M,
          X,
          V,
          K
        ) : z && (ke < 0 || j !== N[ke] ? lt(q, L, ie, 2) : ke--);
      }
    }
  }, lt = (_, v, L, D, U = null) => {
    const { el: M, type: X, transition: V, children: K, shapeFlag: j } = _;
    if (j & 6) {
      lt(_.component.subTree, v, L, D);
      return;
    }
    if (j & 128) {
      _.suspense.move(v, L, D);
      return;
    }
    if (j & 64) {
      X.move(_, v, L, Nt);
      return;
    }
    if (X === Re) {
      s(M, v, L);
      for (let J = 0; J < K.length; J++)
        lt(K[J], v, L, D);
      s(_.anchor, v, L);
      return;
    }
    if (X === Ti) {
      _e(_, v, L);
      return;
    }
    if (D !== 2 && j & 1 && V)
      if (D === 0)
        V.beforeEnter(M), s(M, v, L), Xt(() => V.enter(M), U);
      else {
        const { leave: J, delayLeave: Q, afterLeave: pe } = V, he = () => {
          _.ctx.isUnmounted ? r(M) : s(M, v, L);
        }, be = () => {
          J(M, () => {
            he(), pe && pe();
          });
        };
        Q ? Q(M, he, be) : be();
      }
    else
      s(M, v, L);
  }, je = (_, v, L, D = !1, U = !1) => {
    const {
      type: M,
      props: X,
      ref: V,
      children: K,
      dynamicChildren: j,
      shapeFlag: re,
      patchFlag: J,
      dirs: Q,
      cacheIndex: pe
    } = _;
    if (J === -2 && (U = !1), V != null && (Un(), Pr(V, null, L, _, !0), zn()), pe != null && (v.renderCache[pe] = void 0), re & 256) {
      v.ctx.deactivate(_);
      return;
    }
    const he = re & 1 && Q, be = !Mr(_);
    let ke;
    if (be && (ke = X && X.onVnodeBeforeUnmount) && bn(ke, v, _), re & 6)
      Me(_.component, L, D);
    else {
      if (re & 128) {
        _.suspense.unmount(L, D);
        return;
      }
      he && Ss(_, null, v, "beforeUnmount"), re & 64 ? _.type.remove(
        _,
        v,
        L,
        Nt,
        D
      ) : j && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !j.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (M !== Re || J > 0 && J & 64) ? wt(
        j,
        v,
        L,
        !1,
        !0
      ) : (M === Re && J & 384 || !U && re & 16) && wt(K, v, L), D && Lt(_);
    }
    (be && (ke = X && X.onVnodeUnmounted) || he) && Xt(() => {
      ke && bn(ke, v, _), he && Ss(_, null, v, "unmounted");
    }, L);
  }, Lt = (_) => {
    const { type: v, el: L, anchor: D, transition: U } = _;
    if (v === Re) {
      gn(L, D);
      return;
    }
    if (v === Ti) {
      C(_);
      return;
    }
    const M = () => {
      r(L), U && !U.persisted && U.afterLeave && U.afterLeave();
    };
    if (_.shapeFlag & 1 && U && !U.persisted) {
      const { leave: X, delayLeave: V } = U, K = () => X(L, M);
      V ? V(_.el, M, K) : K();
    } else
      M();
  }, gn = (_, v) => {
    let L;
    for (; _ !== v; )
      L = T(_), r(_), _ = L;
    r(v);
  }, Me = (_, v, L) => {
    const {
      bum: D,
      scope: U,
      job: M,
      subTree: X,
      um: V,
      m: K,
      a: j,
      parent: re,
      slots: { __: J }
    } = _;
    Dl(K), Dl(j), D && wi(D), re && Ae(J) && J.forEach((Q) => {
      re.renderCache[Q] = void 0;
    }), U.stop(), M && (M.flags |= 8, je(X, _, v, L)), V && Xt(V, v), Xt(() => {
      _.isUnmounted = !0;
    }, v), v && v.pendingBranch && !v.isUnmounted && _.asyncDep && !_.asyncResolved && _.suspenseId === v.pendingId && (v.deps--, v.deps === 0 && v.resolve());
  }, wt = (_, v, L, D = !1, U = !1, M = 0) => {
    for (let X = M; X < _.length; X++)
      je(_[X], v, L, D, U);
  }, Bt = (_) => {
    if (_.shapeFlag & 6)
      return Bt(_.component.subTree);
    if (_.shapeFlag & 128)
      return _.suspense.next();
    const v = T(_.anchor || _.el), L = v && v[Zd];
    return L ? T(L) : v;
  };
  let jt = !1;
  const Wt = (_, v, L) => {
    _ == null ? v._vnode && je(v._vnode, null, null, !0) : H(
      v._vnode || null,
      _,
      v,
      null,
      null,
      null,
      L
    ), v._vnode = _, jt || (jt = !0, Il(), gu(), jt = !1);
  }, Nt = {
    p: H,
    um: je,
    m: lt,
    r: Lt,
    mt: Ue,
    mc: se,
    pc: ye,
    pbc: ge,
    n: Bt,
    o: e
  };
  return {
    render: Wt,
    hydrate: void 0,
    createApp: _h(Wt)
  };
}
function Lo({ type: e, props: t }, n) {
  return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function xs({ effect: e, job: t }, n) {
  n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function Eh(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function Nu(e, t, n = !1) {
  const s = e.children, r = t.children;
  if (Ae(s) && Ae(r))
    for (let i = 0; i < s.length; i++) {
      const o = s[i];
      let a = r[i];
      a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = r[i] = rs(r[i]), a.el = o.el), !n && a.patchFlag !== -2 && Nu(o, a)), a.type === ao && (a.el = o.el), a.type === fs && !a.el && (a.el = o.el);
    }
}
function Ch(e) {
  const t = e.slice(), n = [0];
  let s, r, i, o, a;
  const l = e.length;
  for (s = 0; s < l; s++) {
    const u = e[s];
    if (u !== 0) {
      if (r = n[n.length - 1], e[r] < u) {
        t[s] = r, n.push(s);
        continue;
      }
      for (i = 0, o = n.length - 1; i < o; )
        a = i + o >> 1, e[n[a]] < u ? i = a + 1 : o = a;
      u < e[n[i]] && (i > 0 && (t[s] = n[i - 1]), n[i] = s);
    }
  }
  for (i = n.length, o = n[i - 1]; i-- > 0; )
    n[i] = o, o = t[o];
  return n;
}
function Pu(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : Pu(t);
}
function Dl(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
const Rh = Symbol.for("v-scx"), Ih = () => ki(Rh);
function pt(e, t, n) {
  return Mu(e, t, n);
}
function Mu(e, t, n = nt) {
  const { immediate: s, deep: r, flush: i, once: o } = n, a = Ot({}, n), l = t && s || !t && i !== "post";
  let u;
  if (Wr) {
    if (i === "sync") {
      const I = Ih();
      u = I.__watcherHandles || (I.__watcherHandles = []);
    } else if (!l) {
      const I = () => {
      };
      return I.stop = An, I.resume = An, I.pause = An, I;
    }
  }
  const c = Ft;
  a.call = (I, O, H) => En(I, c, O, H);
  let b = !1;
  i === "post" ? a.scheduler = (I) => {
    Xt(I, c && c.suspense);
  } : i !== "sync" && (b = !0, a.scheduler = (I, O) => {
    O ? I() : La(I);
  }), a.augmentJob = (I) => {
    t && (I.flags |= 4), b && (I.flags |= 2, c && (I.id = c.uid, I.i = c));
  };
  const T = Vd(e, t, a);
  return Wr && (u ? u.push(T) : l && T()), T;
}
function Oh(e, t, n) {
  const s = this.proxy, r = gt(e) ? e.includes(".") ? Du(s, e) : () => s[e] : e.bind(s, s);
  let i;
  Ce(t) ? i = t : (i = t.handler, n = t);
  const o = Gr(this), a = Mu(r, i.bind(s), n);
  return o(), a;
}
function Du(e, t) {
  const n = t.split(".");
  return () => {
    let s = e;
    for (let r = 0; r < n.length && s; r++)
      s = s[n[r]];
    return s;
  };
}
const Lh = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${cs(t)}Modifiers`] || e[`${hs(t)}Modifiers`];
function Nh(e, t, ...n) {
  if (e.isUnmounted) return;
  const s = e.vnode.props || nt;
  let r = n;
  const i = t.startsWith("update:"), o = i && Lh(s, t.slice(7));
  o && (o.trim && (r = n.map((c) => gt(c) ? c.trim() : c)), o.number && (r = n.map(Zo)));
  let a, l = s[a = xo(t)] || // also try camelCase event handler (#2249)
  s[a = xo(cs(t))];
  !l && i && (l = s[a = xo(hs(t))]), l && En(
    l,
    e,
    6,
    r
  );
  const u = s[a + "Once"];
  if (u) {
    if (!e.emitted)
      e.emitted = {};
    else if (e.emitted[a])
      return;
    e.emitted[a] = !0, En(
      u,
      e,
      6,
      r
    );
  }
}
function Fu(e, t, n = !1) {
  const s = t.emitsCache, r = s.get(e);
  if (r !== void 0)
    return r;
  const i = e.emits;
  let o = {}, a = !1;
  if (!Ce(e)) {
    const l = (u) => {
      const c = Fu(u, t, !0);
      c && (a = !0, Ot(o, c));
    };
    !n && t.mixins.length && t.mixins.forEach(l), e.extends && l(e.extends), e.mixins && e.mixins.forEach(l);
  }
  return !i && !a ? (ct(e) && s.set(e, null), null) : (Ae(i) ? i.forEach((l) => o[l] = null) : Ot(o, i), ct(e) && s.set(e, o), o);
}
function oo(e, t) {
  return !e || !Zi(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), qe(e, t[0].toLowerCase() + t.slice(1)) || qe(e, hs(t)) || qe(e, t));
}
function Fl(e) {
  const {
    type: t,
    vnode: n,
    proxy: s,
    withProxy: r,
    propsOptions: [i],
    slots: o,
    attrs: a,
    emit: l,
    render: u,
    renderCache: c,
    props: b,
    data: T,
    setupState: I,
    ctx: O,
    inheritAttrs: H
  } = e, ue = Bi(e);
  let R, fe;
  try {
    if (n.shapeFlag & 4) {
      const C = r || s, P = C;
      R = Tn(
        u.call(
          P,
          C,
          c,
          b,
          I,
          T,
          O
        )
      ), fe = a;
    } else {
      const C = t;
      R = Tn(
        C.length > 1 ? C(
          b,
          { attrs: a, slots: o, emit: l }
        ) : C(
          b,
          null
        )
      ), fe = t.props ? a : Ph(a);
    }
  } catch (C) {
    Fr.length = 0, no(C, e, 1), R = Sn(fs);
  }
  let _e = R;
  if (fe && H !== !1) {
    const C = Object.keys(fe), { shapeFlag: P } = _e;
    C.length && P & 7 && (i && C.some(ka) && (fe = Mh(
      fe,
      i
    )), _e = or(_e, fe, !1, !0));
  }
  return n.dirs && (_e = or(_e, null, !1, !0), _e.dirs = _e.dirs ? _e.dirs.concat(n.dirs) : n.dirs), n.transition && Na(_e, n.transition), R = _e, Bi(ue), R;
}
const Ph = (e) => {
  let t;
  for (const n in e)
    (n === "class" || n === "style" || Zi(n)) && ((t || (t = {}))[n] = e[n]);
  return t;
}, Mh = (e, t) => {
  const n = {};
  for (const s in e)
    (!ka(s) || !(s.slice(9) in t)) && (n[s] = e[s]);
  return n;
};
function Dh(e, t, n) {
  const { props: s, children: r, component: i } = e, { props: o, children: a, patchFlag: l } = t, u = i.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (n && l >= 0) {
    if (l & 1024)
      return !0;
    if (l & 16)
      return s ? $l(s, o, u) : !!o;
    if (l & 8) {
      const c = t.dynamicProps;
      for (let b = 0; b < c.length; b++) {
        const T = c[b];
        if (o[T] !== s[T] && !oo(u, T))
          return !0;
      }
    }
  } else
    return (r || a) && (!a || !a.$stable) ? !0 : s === o ? !1 : s ? o ? $l(s, o, u) : !0 : !!o;
  return !1;
}
function $l(e, t, n) {
  const s = Object.keys(t);
  if (s.length !== Object.keys(e).length)
    return !0;
  for (let r = 0; r < s.length; r++) {
    const i = s[r];
    if (t[i] !== e[i] && !oo(n, i))
      return !0;
  }
  return !1;
}
function Fh({ vnode: e, parent: t }, n) {
  for (; t; ) {
    const s = t.subTree;
    if (s.suspense && s.suspense.activeBranch === e && (s.el = e.el), s === e)
      (e = t.vnode).el = n, t = t.parent;
    else
      break;
  }
}
const $u = (e) => e.__isSuspense;
function $h(e, t) {
  t && t.pendingBranch ? Ae(e) ? t.effects.push(...e) : t.effects.push(e) : Yd(e);
}
const Re = Symbol.for("v-fgt"), ao = Symbol.for("v-txt"), fs = Symbol.for("v-cmt"), Ti = Symbol.for("v-stc"), Fr = [];
let Jt = null;
function w(e = !1) {
  Fr.push(Jt = e ? null : []);
}
function Bh() {
  Fr.pop(), Jt = Fr[Fr.length - 1] || null;
}
let jr = 1;
function Bl(e, t = !1) {
  jr += e, e < 0 && Jt && t && (Jt.hasOnce = !0);
}
function Bu(e) {
  return e.dynamicChildren = jr > 0 ? Jt || Js : null, Bh(), jr > 0 && Jt && Jt.push(e), e;
}
function A(e, t, n, s, r, i) {
  return Bu(
    g(
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
function Pn(e, t, n, s, r) {
  return Bu(
    Sn(
      e,
      t,
      n,
      s,
      r,
      !0
    )
  );
}
function Uu(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function yr(e, t) {
  return e.type === t.type && e.key === t.key;
}
const zu = ({ key: e }) => e ?? null, Ai = ({
  ref: e,
  ref_key: t,
  ref_for: n
}) => (typeof e == "number" && (e = "" + e), e != null ? gt(e) || It(e) || Ce(e) ? { i: ln, r: e, k: t, f: !!n } : e : null);
function g(e, t = null, n = null, s = 0, r = null, i = e === Re ? 0 : 1, o = !1, a = !1) {
  const l = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && zu(t),
    ref: t && Ai(t),
    scopeId: yu,
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
    ctx: ln
  };
  return a ? (Da(l, n), i & 128 && e.normalize(l)) : n && (l.shapeFlag |= gt(n) ? 8 : 16), jr > 0 && // avoid a block node from tracking itself
  !o && // has current parent block
  Jt && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (l.patchFlag > 0 || i & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  l.patchFlag !== 32 && Jt.push(l), l;
}
const Sn = Uh;
function Uh(e, t = null, n = null, s = 0, r = null, i = !1) {
  if ((!e || e === ch) && (e = fs), Uu(e)) {
    const a = or(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return n && Da(a, n), jr > 0 && !i && Jt && (a.shapeFlag & 6 ? Jt[Jt.indexOf(e)] = a : Jt.push(a)), a.patchFlag = -2, a;
  }
  if (Zh(e) && (e = e.__vccOpts), t) {
    t = zh(t);
    let { class: a, style: l } = t;
    a && !gt(a) && (t.class = Ne(a)), ct(l) && (Oa(l) && !Ae(l) && (l = Ot({}, l)), t.style = Ee(l));
  }
  const o = gt(e) ? 1 : $u(e) ? 128 : Jd(e) ? 64 : ct(e) ? 4 : Ce(e) ? 2 : 0;
  return g(
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
function zh(e) {
  return e ? Oa(e) || Eu(e) ? Ot({}, e) : e : null;
}
function or(e, t, n = !1, s = !1) {
  const { props: r, ref: i, patchFlag: o, children: a, transition: l } = e, u = t ? Hh(r || {}, t) : r, c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: u,
    key: u && zu(u),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && i ? Ae(i) ? i.concat(Ai(t)) : [i, Ai(t)] : Ai(t)
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
    patchFlag: t && e.type !== Re ? o === -1 ? 16 : o | 16 : o,
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
  return l && s && Na(
    c,
    l.clone(c)
  ), c;
}
function Nn(e = " ", t = 0) {
  return Sn(ao, null, e, t);
}
function Es(e, t) {
  const n = Sn(Ti, null, e);
  return n.staticCount = t, n;
}
function ne(e = "", t = !1) {
  return t ? (w(), Pn(fs, null, e)) : Sn(fs, null, e);
}
function Tn(e) {
  return e == null || typeof e == "boolean" ? Sn(fs) : Ae(e) ? Sn(
    Re,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : Uu(e) ? rs(e) : Sn(ao, null, String(e));
}
function rs(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : or(e);
}
function Da(e, t) {
  let n = 0;
  const { shapeFlag: s } = e;
  if (t == null)
    t = null;
  else if (Ae(t))
    n = 16;
  else if (typeof t == "object")
    if (s & 65) {
      const r = t.default;
      r && (r._c && (r._d = !1), Da(e, r()), r._c && (r._d = !0));
      return;
    } else {
      n = 32;
      const r = t._;
      !r && !Eu(t) ? t._ctx = ln : r === 3 && ln && (ln.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else Ce(t) ? (t = { default: t, _ctx: ln }, n = 32) : (t = String(t), s & 64 ? (n = 16, t = [Nn(t)]) : n = 8);
  e.children = t, e.shapeFlag |= n;
}
function Hh(...e) {
  const t = {};
  for (let n = 0; n < e.length; n++) {
    const s = e[n];
    for (const r in s)
      if (r === "class")
        t.class !== s.class && (t.class = Ne([t.class, s.class]));
      else if (r === "style")
        t.style = Ee([t.style, s.style]);
      else if (Zi(r)) {
        const i = t[r], o = s[r];
        o && i !== o && !(Ae(i) && i.includes(o)) && (t[r] = i ? [].concat(i, o) : o);
      } else r !== "" && (t[r] = s[r]);
  }
  return t;
}
function bn(e, t, n, s = null) {
  En(e, t, 7, [
    n,
    s
  ]);
}
const jh = Au();
let Wh = 0;
function qh(e, t, n) {
  const s = e.type, r = (t ? t.appContext : e.appContext) || jh, i = {
    uid: Wh++,
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
    scope: new yd(
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
    propsOptions: Ru(s, r),
    emitsOptions: Fu(s, r),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: nt,
    // inheritAttrs
    inheritAttrs: s.inheritAttrs,
    // state
    ctx: nt,
    data: nt,
    props: nt,
    attrs: nt,
    slots: nt,
    refs: nt,
    setupState: nt,
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
  return i.ctx = { _: i }, i.root = t ? t.root : i, i.emit = Nh.bind(null, i), e.ce && e.ce(i), i;
}
let Ft = null;
const Vh = () => Ft || ln;
let zi, oa;
{
  const e = eo(), t = (n, s) => {
    let r;
    return (r = e[n]) || (r = e[n] = []), r.push(s), (i) => {
      r.length > 1 ? r.forEach((o) => o(i)) : r[0](i);
    };
  };
  zi = t(
    "__VUE_INSTANCE_SETTERS__",
    (n) => Ft = n
  ), oa = t(
    "__VUE_SSR_SETTERS__",
    (n) => Wr = n
  );
}
const Gr = (e) => {
  const t = Ft;
  return zi(e), e.scope.on(), () => {
    e.scope.off(), zi(t);
  };
}, Ul = () => {
  Ft && Ft.scope.off(), zi(null);
};
function Hu(e) {
  return e.vnode.shapeFlag & 4;
}
let Wr = !1;
function Kh(e, t = !1, n = !1) {
  t && oa(t);
  const { props: s, children: r } = e.vnode, i = Hu(e);
  vh(e, s, i, t), Th(e, r, n || t);
  const o = i ? Gh(e, t) : void 0;
  return t && oa(!1), o;
}
function Gh(e, t) {
  const n = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, uh);
  const { setup: s } = n;
  if (s) {
    Un();
    const r = e.setupContext = s.length > 1 ? Xh(e) : null, i = Gr(e), o = Vr(
      s,
      e,
      0,
      [
        e.props,
        r
      ]
    ), a = Wc(o);
    if (zn(), i(), (a || e.sp) && !Mr(e) && vu(e), a) {
      if (o.then(Ul, Ul), t)
        return o.then((l) => {
          zl(e, l);
        }).catch((l) => {
          no(l, e, 0);
        });
      e.asyncDep = o;
    } else
      zl(e, o);
  } else
    ju(e);
}
function zl(e, t, n) {
  Ce(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : ct(t) && (e.setupState = hu(t)), ju(e);
}
function ju(e, t, n) {
  const s = e.type;
  e.render || (e.render = s.render || An);
  {
    const r = Gr(e);
    Un();
    try {
      fh(e);
    } finally {
      zn(), r();
    }
  }
}
const Yh = {
  get(e, t) {
    return Rt(e, "get", ""), e[t];
  }
};
function Xh(e) {
  const t = (n) => {
    e.exposed = n || {};
  };
  return {
    attrs: new Proxy(e.attrs, Yh),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function lo(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(hu(Bd(e.exposed)), {
    get(t, n) {
      if (n in t)
        return t[n];
      if (n in Dr)
        return Dr[n](e);
    },
    has(t, n) {
      return n in t || n in Dr;
    }
  })) : e.proxy;
}
function Zh(e) {
  return Ce(e) && "__vccOpts" in e;
}
const ae = (e, t) => Wd(e, t, Wr), Jh = "3.5.18";
/**
* @vue/runtime-dom v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let aa;
const Hl = typeof window < "u" && window.trustedTypes;
if (Hl)
  try {
    aa = /* @__PURE__ */ Hl.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const Wu = aa ? (e) => aa.createHTML(e) : (e) => e, Qh = "http://www.w3.org/2000/svg", ep = "http://www.w3.org/1998/Math/MathML", Mn = typeof document < "u" ? document : null, jl = Mn && /* @__PURE__ */ Mn.createElement("template"), tp = {
  insert: (e, t, n) => {
    t.insertBefore(e, n || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, n, s) => {
    const r = t === "svg" ? Mn.createElementNS(Qh, e) : t === "mathml" ? Mn.createElementNS(ep, e) : n ? Mn.createElement(e, { is: n }) : Mn.createElement(e);
    return e === "select" && s && s.multiple != null && r.setAttribute("multiple", s.multiple), r;
  },
  createText: (e) => Mn.createTextNode(e),
  createComment: (e) => Mn.createComment(e),
  setText: (e, t) => {
    e.nodeValue = t;
  },
  setElementText: (e, t) => {
    e.textContent = t;
  },
  parentNode: (e) => e.parentNode,
  nextSibling: (e) => e.nextSibling,
  querySelector: (e) => Mn.querySelector(e),
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
      jl.innerHTML = Wu(
        s === "svg" ? `<svg>${e}</svg>` : s === "mathml" ? `<math>${e}</math>` : e
      );
      const a = jl.content;
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
}, np = Symbol("_vtc");
function sp(e, t, n) {
  const s = e[np];
  s && (t = (t ? [t, ...s] : [...s]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
const Hi = Symbol("_vod"), qu = Symbol("_vsh"), rp = {
  beforeMount(e, { value: t }, { transition: n }) {
    e[Hi] = e.style.display === "none" ? "" : e.style.display, n && t ? n.beforeEnter(e) : vr(e, t);
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
  e.style.display = t ? e[Hi] : "none", e[qu] = !t;
}
const ip = Symbol(""), op = /(^|;)\s*display\s*:/;
function ap(e, t, n) {
  const s = e.style, r = gt(n);
  let i = !1;
  if (n && !r) {
    if (t)
      if (gt(t))
        for (const o of t.split(";")) {
          const a = o.slice(0, o.indexOf(":")).trim();
          n[a] == null && Si(s, a, "");
        }
      else
        for (const o in t)
          n[o] == null && Si(s, o, "");
    for (const o in n)
      o === "display" && (i = !0), Si(s, o, n[o]);
  } else if (r) {
    if (t !== n) {
      const o = s[ip];
      o && (n += ";" + o), s.cssText = n, i = op.test(n);
    }
  } else t && e.removeAttribute("style");
  Hi in e && (e[Hi] = i ? s.display : "", e[qu] && (s.display = "none"));
}
const Wl = /\s*!important$/;
function Si(e, t, n) {
  if (Ae(n))
    n.forEach((s) => Si(e, t, s));
  else if (n == null && (n = ""), t.startsWith("--"))
    e.setProperty(t, n);
  else {
    const s = lp(e, t);
    Wl.test(n) ? e.setProperty(
      hs(s),
      n.replace(Wl, ""),
      "important"
    ) : e[s] = n;
  }
}
const ql = ["Webkit", "Moz", "ms"], No = {};
function lp(e, t) {
  const n = No[t];
  if (n)
    return n;
  let s = cs(t);
  if (s !== "filter" && s in e)
    return No[t] = s;
  s = Kc(s);
  for (let r = 0; r < ql.length; r++) {
    const i = ql[r] + s;
    if (i in e)
      return No[t] = i;
  }
  return t;
}
const Vl = "http://www.w3.org/1999/xlink";
function Kl(e, t, n, s, r, i = _d(t)) {
  s && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(Vl, t.slice(6, t.length)) : e.setAttributeNS(Vl, t, n) : n == null || i && !Gc(n) ? e.removeAttribute(t) : e.setAttribute(
    t,
    i ? "" : ds(n) ? String(n) : n
  );
}
function Gl(e, t, n, s, r) {
  if (t === "innerHTML" || t === "textContent") {
    n != null && (e[t] = t === "innerHTML" ? Wu(n) : n);
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
    a === "boolean" ? n = Gc(n) : n == null && a === "string" ? (n = "", o = !0) : a === "number" && (n = 0, o = !0);
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
function cp(e, t, n, s) {
  e.removeEventListener(t, n, s);
}
const Yl = Symbol("_vei");
function up(e, t, n, s, r = null) {
  const i = e[Yl] || (e[Yl] = {}), o = i[t];
  if (s && o)
    o.value = s;
  else {
    const [a, l] = fp(t);
    if (s) {
      const u = i[t] = pp(
        s,
        r
      );
      Xs(e, a, u, l);
    } else o && (cp(e, a, o, l), i[t] = void 0);
  }
}
const Xl = /(?:Once|Passive|Capture)$/;
function fp(e) {
  let t;
  if (Xl.test(e)) {
    t = {};
    let s;
    for (; s = e.match(Xl); )
      e = e.slice(0, e.length - s[0].length), t[s[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : hs(e.slice(2)), t];
}
let Po = 0;
const dp = /* @__PURE__ */ Promise.resolve(), hp = () => Po || (dp.then(() => Po = 0), Po = Date.now());
function pp(e, t) {
  const n = (s) => {
    if (!s._vts)
      s._vts = Date.now();
    else if (s._vts <= n.attached)
      return;
    En(
      mp(s, n.value),
      t,
      5,
      [s]
    );
  };
  return n.value = e, n.attached = hp(), n;
}
function mp(e, t) {
  if (Ae(t)) {
    const n = e.stopImmediatePropagation;
    return e.stopImmediatePropagation = () => {
      n.call(e), e._stopped = !0;
    }, t.map(
      (s) => (r) => !r._stopped && s && s(r)
    );
  } else
    return t;
}
const Zl = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, gp = (e, t, n, s, r, i) => {
  const o = r === "svg";
  t === "class" ? sp(e, s, o) : t === "style" ? ap(e, n, s) : Zi(t) ? ka(t) || up(e, t, n, s, i) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : _p(e, t, s, o)) ? (Gl(e, t, s), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && Kl(e, t, s, o, i, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !gt(s)) ? Gl(e, cs(t), s, i, t) : (t === "true-value" ? e._trueValue = s : t === "false-value" && (e._falseValue = s), Kl(e, t, s, o));
};
function _p(e, t, n, s) {
  if (s)
    return !!(t === "innerHTML" || t === "textContent" || t in e && Zl(t) && Ce(n));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const r = e.tagName;
    if (r === "IMG" || r === "VIDEO" || r === "CANVAS" || r === "SOURCE")
      return !1;
  }
  return Zl(t) && gt(n) ? !1 : t in e;
}
const Jl = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return Ae(t) ? (n) => wi(t, n) : t;
};
function yp(e) {
  e.target.composing = !0;
}
function Ql(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const Mo = Symbol("_assign"), Cs = {
  created(e, { modifiers: { lazy: t, trim: n, number: s } }, r) {
    e[Mo] = Jl(r);
    const i = s || r.props && r.props.type === "number";
    Xs(e, t ? "change" : "input", (o) => {
      if (o.target.composing) return;
      let a = e.value;
      n && (a = a.trim()), i && (a = Zo(a)), e[Mo](a);
    }), n && Xs(e, "change", () => {
      e.value = e.value.trim();
    }), t || (Xs(e, "compositionstart", yp), Xs(e, "compositionend", Ql), Xs(e, "change", Ql));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t }) {
    e.value = t ?? "";
  },
  beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: s, trim: r, number: i } }, o) {
    if (e[Mo] = Jl(o), e.composing) return;
    const a = (i || e.type === "number") && !/^0\d/.test(e.value) ? Zo(e.value) : e.value, l = t ?? "";
    a !== l && (document.activeElement === e && e.type !== "range" && (s && t === n || r && e.value.trim() === l) || (e.value = l));
  }
}, vp = ["ctrl", "shift", "alt", "meta"], bp = {
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
  exact: (e, t) => vp.some((n) => e[`${n}Key`] && !t.includes(n))
}, Os = (e, t) => {
  const n = e._withMods || (e._withMods = {}), s = t.join(".");
  return n[s] || (n[s] = (r, ...i) => {
    for (let o = 0; o < t.length; o++) {
      const a = bp[t[o]];
      if (a && a(r, t)) return;
    }
    return e(r, ...i);
  });
}, wp = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, xi = (e, t) => {
  const n = e._withKeys || (e._withKeys = {}), s = t.join(".");
  return n[s] || (n[s] = (r) => {
    if (!("key" in r))
      return;
    const i = hs(r.key);
    if (t.some(
      (o) => o === i || wp[o] === i
    ))
      return e(r);
  });
}, kp = /* @__PURE__ */ Ot({ patchProp: gp }, tp);
let ec;
function Tp() {
  return ec || (ec = Sh(kp));
}
const Ap = (...e) => {
  const t = Tp().createApp(...e), { mount: n } = t;
  return t.mount = (s) => {
    const r = xp(s);
    if (!r) return;
    const i = t._component;
    !Ce(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
    const o = n(r, !1, Sp(r));
    return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), o;
  }, t;
};
function Sp(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function xp(e) {
  return gt(e) ? document.querySelector(e) : e;
}
const Vu = /* @__PURE__ */ new Set(["customer_required", "token_invalid"]), la = (e) => !!e && Vu.has(e), sr = (e) => {
  const t = e.replace("#", ""), n = parseInt(t.substr(0, 2), 16), s = parseInt(t.substr(2, 2), 16), r = parseInt(t.substr(4, 2), 16);
  return (n * 299 + s * 587 + r * 114) / 1e3 < 128;
}, Ep = (e, t) => {
  const n = e.replace("#", ""), s = parseInt(n.substr(0, 2), 16), r = parseInt(n.substr(2, 2), 16), i = parseInt(n.substr(4, 2), 16), o = sr(e), a = o ? Math.min(255, s + t) : Math.max(0, s - t), l = o ? Math.min(255, r + t) : Math.max(0, r - t), u = o ? Math.min(255, i + t) : Math.max(0, i - t);
  return `#${a.toString(16).padStart(2, "0")}${l.toString(16).padStart(2, "0")}${u.toString(16).padStart(2, "0")}`;
}, br = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e), Cp = (e) => {
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
function Fa() {
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
var $s = Fa();
function Ku(e) {
  $s = e;
}
var $r = { exec: () => null };
function Ve(e, t = "") {
  let n = typeof e == "string" ? e : e.source;
  const s = {
    replace: (r, i) => {
      let o = typeof i == "string" ? i : i.source;
      return o = o.replace($t.caret, "$1"), n = n.replace(r, o), s;
    },
    getRegex: () => new RegExp(n, t)
  };
  return s;
}
var $t = {
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
}, Rp = /^(?:[ \t]*(?:\n|$))+/, Ip = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/, Op = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, Yr = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, Lp = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, $a = /(?:[*+-]|\d{1,9}[.)])/, Gu = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/, Yu = Ve(Gu).replace(/bull/g, $a).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(), Np = Ve(Gu).replace(/bull/g, $a).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(), Ba = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/, Pp = /^[^\n]+/, Ua = /(?!\s*\])(?:\\.|[^\[\]\\])+/, Mp = Ve(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", Ua).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), Dp = Ve(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, $a).getRegex(), co = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", za = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, Fp = Ve(
  "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))",
  "i"
).replace("comment", za).replace("tag", co).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), Xu = Ve(Ba).replace("hr", Yr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", co).getRegex(), $p = Ve(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", Xu).getRegex(), Ha = {
  blockquote: $p,
  code: Ip,
  def: Mp,
  fences: Op,
  heading: Lp,
  hr: Yr,
  html: Fp,
  lheading: Yu,
  list: Dp,
  newline: Rp,
  paragraph: Xu,
  table: $r,
  text: Pp
}, tc = Ve(
  "^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"
).replace("hr", Yr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", co).getRegex(), Bp = {
  ...Ha,
  lheading: Np,
  table: tc,
  paragraph: Ve(Ba).replace("hr", Yr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", tc).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", co).getRegex()
}, Up = {
  ...Ha,
  html: Ve(
    `^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`
  ).replace("comment", za).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
  heading: /^(#{1,6})(.*)(?:\n+|$)/,
  fences: $r,
  // fences not supported
  lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  paragraph: Ve(Ba).replace("hr", Yr).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", Yu).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
}, zp = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, Hp = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, Zu = /^( {2,}|\\)\n(?!\s*$)/, jp = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, uo = /[\p{P}\p{S}]/u, ja = /[\s\p{P}\p{S}]/u, Ju = /[^\s\p{P}\p{S}]/u, Wp = Ve(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, ja).getRegex(), Qu = /(?!~)[\p{P}\p{S}]/u, qp = /(?!~)[\s\p{P}\p{S}]/u, Vp = /(?:[^\s\p{P}\p{S}]|~)/u, Kp = /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g, ef = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/, Gp = Ve(ef, "u").replace(/punct/g, uo).getRegex(), Yp = Ve(ef, "u").replace(/punct/g, Qu).getRegex(), tf = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", Xp = Ve(tf, "gu").replace(/notPunctSpace/g, Ju).replace(/punctSpace/g, ja).replace(/punct/g, uo).getRegex(), Zp = Ve(tf, "gu").replace(/notPunctSpace/g, Vp).replace(/punctSpace/g, qp).replace(/punct/g, Qu).getRegex(), Jp = Ve(
  "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)",
  "gu"
).replace(/notPunctSpace/g, Ju).replace(/punctSpace/g, ja).replace(/punct/g, uo).getRegex(), Qp = Ve(/\\(punct)/, "gu").replace(/punct/g, uo).getRegex(), em = Ve(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), tm = Ve(za).replace("(?:-->|$)", "-->").getRegex(), nm = Ve(
  "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>"
).replace("comment", tm).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), ji = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/, sm = Ve(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", ji).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), nf = Ve(/^!?\[(label)\]\[(ref)\]/).replace("label", ji).replace("ref", Ua).getRegex(), sf = Ve(/^!?\[(ref)\](?:\[\])?/).replace("ref", Ua).getRegex(), rm = Ve("reflink|nolink(?!\\()", "g").replace("reflink", nf).replace("nolink", sf).getRegex(), Wa = {
  _backpedal: $r,
  // only used for GFM url
  anyPunctuation: Qp,
  autolink: em,
  blockSkip: Kp,
  br: Zu,
  code: Hp,
  del: $r,
  emStrongLDelim: Gp,
  emStrongRDelimAst: Xp,
  emStrongRDelimUnd: Jp,
  escape: zp,
  link: sm,
  nolink: sf,
  punctuation: Wp,
  reflink: nf,
  reflinkSearch: rm,
  tag: nm,
  text: jp,
  url: $r
}, im = {
  ...Wa,
  link: Ve(/^!?\[(label)\]\((.*?)\)/).replace("label", ji).getRegex(),
  reflink: Ve(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", ji).getRegex()
}, ca = {
  ...Wa,
  emStrongRDelimAst: Zp,
  emStrongLDelim: Yp,
  url: Ve(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, "i").replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
  _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
}, om = {
  ...ca,
  br: Ve(Zu).replace("{2,}", "*").getRegex(),
  text: Ve(ca.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
}, gi = {
  normal: Ha,
  gfm: Bp,
  pedantic: Up
}, wr = {
  normal: Wa,
  gfm: ca,
  breaks: om,
  pedantic: im
}, am = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}, nc = (e) => am[e];
function wn(e, t) {
  if (t) {
    if ($t.escapeTest.test(e))
      return e.replace($t.escapeReplace, nc);
  } else if ($t.escapeTestNoEncode.test(e))
    return e.replace($t.escapeReplaceNoEncode, nc);
  return e;
}
function sc(e) {
  try {
    e = encodeURI(e).replace($t.percentDecode, "%");
  } catch {
    return null;
  }
  return e;
}
function rc(e, t) {
  var i;
  const n = e.replace($t.findPipe, (o, a, l) => {
    let u = !1, c = a;
    for (; --c >= 0 && l[c] === "\\"; ) u = !u;
    return u ? "|" : " |";
  }), s = n.split($t.splitPipe);
  let r = 0;
  if (s[0].trim() || s.shift(), s.length > 0 && !((i = s.at(-1)) != null && i.trim()) && s.pop(), t)
    if (s.length > t)
      s.splice(t);
    else
      for (; s.length < t; ) s.push("");
  for (; r < s.length; r++)
    s[r] = s[r].trim().replace($t.slashPipe, "|");
  return s;
}
function kr(e, t, n) {
  const s = e.length;
  if (s === 0)
    return "";
  let r = 0;
  for (; r < s && e.charAt(s - r - 1) === t; )
    r++;
  return e.slice(0, s - r);
}
function lm(e, t) {
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
function ic(e, t, n, s, r) {
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
function cm(e, t, n) {
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
var Wi = class {
  // set by the lexer
  constructor(e) {
    tt(this, "options");
    tt(this, "rules");
    // set by the lexer
    tt(this, "lexer");
    this.options = e || $s;
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
        text: this.options.pedantic ? n : kr(n, `
`)
      };
    }
  }
  fences(e) {
    const t = this.rules.block.fences.exec(e);
    if (t) {
      const n = t[0], s = cm(n, t[3] || "", this.rules);
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
        const s = kr(n, "#");
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
        raw: kr(t[0], `
`)
      };
  }
  blockquote(e) {
    const t = this.rules.block.blockquote.exec(e);
    if (t) {
      let n = kr(t[0], `
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
        const u = a.join(`
`), c = u.replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
        s = s ? `${s}
${u}` : u, r = r ? `${r}
${c}` : c;
        const b = this.lexer.state.top;
        if (this.lexer.state.top = !0, this.lexer.blockTokens(c, i, !0), this.lexer.state.top = b, n.length === 0)
          break;
        const T = i.at(-1);
        if ((T == null ? void 0 : T.type) === "code")
          break;
        if ((T == null ? void 0 : T.type) === "blockquote") {
          const I = T, O = I.raw + `
` + n.join(`
`), H = this.blockquote(O);
          i[i.length - 1] = H, s = s.substring(0, s.length - I.raw.length) + H.raw, r = r.substring(0, r.length - I.text.length) + H.text;
          break;
        } else if ((T == null ? void 0 : T.type) === "list") {
          const I = T, O = I.raw + `
` + n.join(`
`), H = this.list(O);
          i[i.length - 1] = H, s = s.substring(0, s.length - T.raw.length) + H.raw, r = r.substring(0, r.length - I.raw.length) + H.raw, n = O.substring(i.at(-1).raw.length).split(`
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
        let l = !1, u = "", c = "";
        if (!(t = i.exec(e)) || this.rules.block.hr.test(e))
          break;
        u = t[0], e = e.substring(u.length);
        let b = t[2].split(`
`, 1)[0].replace(this.rules.other.listReplaceTabs, (R) => " ".repeat(3 * R.length)), T = e.split(`
`, 1)[0], I = !b.trim(), O = 0;
        if (this.options.pedantic ? (O = 2, c = b.trimStart()) : I ? O = t[1].length + 1 : (O = t[2].search(this.rules.other.nonSpaceChar), O = O > 4 ? 1 : O, c = b.slice(O), O += t[1].length), I && this.rules.other.blankLine.test(T) && (u += T + `
`, e = e.substring(T.length + 1), l = !0), !l) {
          const R = this.rules.other.nextBulletRegex(O), fe = this.rules.other.hrRegex(O), _e = this.rules.other.fencesBeginRegex(O), C = this.rules.other.headingBeginRegex(O), P = this.rules.other.htmlBeginRegex(O);
          for (; e; ) {
            const S = e.split(`
`, 1)[0];
            let W;
            if (T = S, this.options.pedantic ? (T = T.replace(this.rules.other.listReplaceNesting, "  "), W = T) : W = T.replace(this.rules.other.tabCharGlobal, "    "), _e.test(T) || C.test(T) || P.test(T) || R.test(T) || fe.test(T))
              break;
            if (W.search(this.rules.other.nonSpaceChar) >= O || !T.trim())
              c += `
` + W.slice(O);
            else {
              if (I || b.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || _e.test(b) || C.test(b) || fe.test(b))
                break;
              c += `
` + T;
            }
            !I && !T.trim() && (I = !0), u += S + `
`, e = e.substring(S.length + 1), b = W.slice(O);
          }
        }
        r.loose || (o ? r.loose = !0 : this.rules.other.doubleBlankLine.test(u) && (o = !0));
        let H = null, ue;
        this.options.gfm && (H = this.rules.other.listIsTask.exec(c), H && (ue = H[0] !== "[ ] ", c = c.replace(this.rules.other.listReplaceTask, ""))), r.items.push({
          type: "list_item",
          raw: u,
          task: !!H,
          checked: ue,
          loose: !1,
          text: c,
          tokens: []
        }), r.raw += u;
      }
      const a = r.items.at(-1);
      if (a)
        a.raw = a.raw.trimEnd(), a.text = a.text.trimEnd();
      else
        return;
      r.raw = r.raw.trimEnd();
      for (let l = 0; l < r.items.length; l++)
        if (this.lexer.state.top = !1, r.items[l].tokens = this.lexer.blockTokens(r.items[l].text, []), !r.loose) {
          const u = r.items[l].tokens.filter((b) => b.type === "space"), c = u.length > 0 && u.some((b) => this.rules.other.anyLine.test(b.raw));
          r.loose = c;
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
    const n = rc(t[1]), s = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), r = (o = t[3]) != null && o.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
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
        i.rows.push(rc(a, i.header.length).map((l, u) => ({
          text: l,
          tokens: this.lexer.inline(l),
          header: !1,
          align: i.align[u]
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
        const i = kr(n.slice(0, -1), "\\");
        if ((n.length - i.length) % 2 === 0)
          return;
      } else {
        const i = lm(t[2], "()");
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
      return s = s.trim(), this.rules.other.startAngleBracket.test(s) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n) ? s = s.slice(1) : s = s.slice(1, -1)), ic(t, {
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
      return ic(n, r, n[0], this.lexer, this.rules);
    }
  }
  emStrong(e, t, n = "") {
    let s = this.rules.inline.emStrongLDelim.exec(e);
    if (!s || s[3] && n.match(this.rules.other.unicodeAlphaNumeric)) return;
    if (!(s[1] || s[2] || "") || !n || this.rules.inline.punctuation.exec(n)) {
      const i = [...s[0]].length - 1;
      let o, a, l = i, u = 0;
      const c = s[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      for (c.lastIndex = 0, t = t.slice(-1 * e.length + i); (s = c.exec(t)) != null; ) {
        if (o = s[1] || s[2] || s[3] || s[4] || s[5] || s[6], !o) continue;
        if (a = [...o].length, s[3] || s[4]) {
          l += a;
          continue;
        } else if ((s[5] || s[6]) && i % 3 && !((i + a) % 3)) {
          u += a;
          continue;
        }
        if (l -= a, l > 0) continue;
        a = Math.min(a, a + l + u);
        const b = [...s[0]][0].length, T = e.slice(0, i + s.index + b + a);
        if (Math.min(i, a) % 2) {
          const O = T.slice(1, -1);
          return {
            type: "em",
            raw: T,
            text: O,
            tokens: this.lexer.inlineTokens(O)
          };
        }
        const I = T.slice(2, -2);
        return {
          type: "strong",
          raw: T,
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
}, $n = class ua {
  constructor(t) {
    tt(this, "tokens");
    tt(this, "options");
    tt(this, "state");
    tt(this, "tokenizer");
    tt(this, "inlineQueue");
    this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = t || $s, this.options.tokenizer = this.options.tokenizer || new Wi(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = {
      inLink: !1,
      inRawBlock: !1,
      top: !0
    };
    const n = {
      other: $t,
      block: gi.normal,
      inline: wr.normal
    };
    this.options.pedantic ? (n.block = gi.pedantic, n.inline = wr.pedantic) : this.options.gfm && (n.block = gi.gfm, this.options.breaks ? n.inline = wr.breaks : n.inline = wr.gfm), this.tokenizer.rules = n;
  }
  /**
   * Expose Rules
   */
  static get rules() {
    return {
      block: gi,
      inline: wr
    };
  }
  /**
   * Static Lex Method
   */
  static lex(t, n) {
    return new ua(n).lex(t);
  }
  /**
   * Static Lex Inline Method
   */
  static lexInline(t, n) {
    return new ua(n).inlineTokens(t);
  }
  /**
   * Preprocessing
   */
  lex(t) {
    t = t.replace($t.carriageReturn, `
`), this.blockTokens(t, this.tokens);
    for (let n = 0; n < this.inlineQueue.length; n++) {
      const s = this.inlineQueue[n];
      this.inlineTokens(s.src, s.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(t, n = [], s = !1) {
    var r, i, o;
    for (this.options.pedantic && (t = t.replace($t.tabCharGlobal, "    ").replace($t.spaceLine, "")); t; ) {
      let a;
      if ((i = (r = this.options.extensions) == null ? void 0 : r.block) != null && i.some((u) => (a = u.call({ lexer: this }, t, n)) ? (t = t.substring(a.raw.length), n.push(a), !0) : !1))
        continue;
      if (a = this.tokenizer.space(t)) {
        t = t.substring(a.raw.length);
        const u = n.at(-1);
        a.raw.length === 1 && u !== void 0 ? u.raw += `
` : n.push(a);
        continue;
      }
      if (a = this.tokenizer.code(t)) {
        t = t.substring(a.raw.length);
        const u = n.at(-1);
        (u == null ? void 0 : u.type) === "paragraph" || (u == null ? void 0 : u.type) === "text" ? (u.raw += `
` + a.raw, u.text += `
` + a.text, this.inlineQueue.at(-1).src = u.text) : n.push(a);
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
        const u = n.at(-1);
        (u == null ? void 0 : u.type) === "paragraph" || (u == null ? void 0 : u.type) === "text" ? (u.raw += `
` + a.raw, u.text += `
` + a.raw, this.inlineQueue.at(-1).src = u.text) : this.tokens.links[a.tag] || (this.tokens.links[a.tag] = {
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
        let u = 1 / 0;
        const c = t.slice(1);
        let b;
        this.options.extensions.startBlock.forEach((T) => {
          b = T.call({ lexer: this }, c), typeof b == "number" && b >= 0 && (u = Math.min(u, b));
        }), u < 1 / 0 && u >= 0 && (l = t.substring(0, u + 1));
      }
      if (this.state.top && (a = this.tokenizer.paragraph(l))) {
        const u = n.at(-1);
        s && (u == null ? void 0 : u.type) === "paragraph" ? (u.raw += `
` + a.raw, u.text += `
` + a.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = u.text) : n.push(a), s = l.length !== t.length, t = t.substring(a.raw.length);
        continue;
      }
      if (a = this.tokenizer.text(t)) {
        t = t.substring(a.raw.length);
        const u = n.at(-1);
        (u == null ? void 0 : u.type) === "text" ? (u.raw += `
` + a.raw, u.text += `
` + a.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = u.text) : n.push(a);
        continue;
      }
      if (t) {
        const u = "Infinite loop on byte: " + t.charCodeAt(0);
        if (this.options.silent) {
          console.error(u);
          break;
        } else
          throw new Error(u);
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
    var a, l, u;
    let s = t, r = null;
    if (this.tokens.links) {
      const c = Object.keys(this.tokens.links);
      if (c.length > 0)
        for (; (r = this.tokenizer.rules.inline.reflinkSearch.exec(s)) != null; )
          c.includes(r[0].slice(r[0].lastIndexOf("[") + 1, -1)) && (s = s.slice(0, r.index) + "[" + "a".repeat(r[0].length - 2) + "]" + s.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex));
    }
    for (; (r = this.tokenizer.rules.inline.anyPunctuation.exec(s)) != null; )
      s = s.slice(0, r.index) + "++" + s.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);
    for (; (r = this.tokenizer.rules.inline.blockSkip.exec(s)) != null; )
      s = s.slice(0, r.index) + "[" + "a".repeat(r[0].length - 2) + "]" + s.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
    let i = !1, o = "";
    for (; t; ) {
      i || (o = ""), i = !1;
      let c;
      if ((l = (a = this.options.extensions) == null ? void 0 : a.inline) != null && l.some((T) => (c = T.call({ lexer: this }, t, n)) ? (t = t.substring(c.raw.length), n.push(c), !0) : !1))
        continue;
      if (c = this.tokenizer.escape(t)) {
        t = t.substring(c.raw.length), n.push(c);
        continue;
      }
      if (c = this.tokenizer.tag(t)) {
        t = t.substring(c.raw.length), n.push(c);
        continue;
      }
      if (c = this.tokenizer.link(t)) {
        t = t.substring(c.raw.length), n.push(c);
        continue;
      }
      if (c = this.tokenizer.reflink(t, this.tokens.links)) {
        t = t.substring(c.raw.length);
        const T = n.at(-1);
        c.type === "text" && (T == null ? void 0 : T.type) === "text" ? (T.raw += c.raw, T.text += c.text) : n.push(c);
        continue;
      }
      if (c = this.tokenizer.emStrong(t, s, o)) {
        t = t.substring(c.raw.length), n.push(c);
        continue;
      }
      if (c = this.tokenizer.codespan(t)) {
        t = t.substring(c.raw.length), n.push(c);
        continue;
      }
      if (c = this.tokenizer.br(t)) {
        t = t.substring(c.raw.length), n.push(c);
        continue;
      }
      if (c = this.tokenizer.del(t)) {
        t = t.substring(c.raw.length), n.push(c);
        continue;
      }
      if (c = this.tokenizer.autolink(t)) {
        t = t.substring(c.raw.length), n.push(c);
        continue;
      }
      if (!this.state.inLink && (c = this.tokenizer.url(t))) {
        t = t.substring(c.raw.length), n.push(c);
        continue;
      }
      let b = t;
      if ((u = this.options.extensions) != null && u.startInline) {
        let T = 1 / 0;
        const I = t.slice(1);
        let O;
        this.options.extensions.startInline.forEach((H) => {
          O = H.call({ lexer: this }, I), typeof O == "number" && O >= 0 && (T = Math.min(T, O));
        }), T < 1 / 0 && T >= 0 && (b = t.substring(0, T + 1));
      }
      if (c = this.tokenizer.inlineText(b)) {
        t = t.substring(c.raw.length), c.raw.slice(-1) !== "_" && (o = c.raw.slice(-1)), i = !0;
        const T = n.at(-1);
        (T == null ? void 0 : T.type) === "text" ? (T.raw += c.raw, T.text += c.text) : n.push(c);
        continue;
      }
      if (t) {
        const T = "Infinite loop on byte: " + t.charCodeAt(0);
        if (this.options.silent) {
          console.error(T);
          break;
        } else
          throw new Error(T);
      }
    }
    return n;
  }
}, qi = class {
  // set by the parser
  constructor(e) {
    tt(this, "options");
    tt(this, "parser");
    this.options = e || $s;
  }
  space(e) {
    return "";
  }
  code({ text: e, lang: t, escaped: n }) {
    var i;
    const s = (i = (t || "").match($t.notSpaceStart)) == null ? void 0 : i[0], r = e.replace($t.endingNewline, "") + `
`;
    return s ? '<pre><code class="language-' + wn(s) + '">' + (n ? r : wn(r, !0)) + `</code></pre>
` : "<pre><code>" + (n ? r : wn(r, !0)) + `</code></pre>
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
      e.loose ? ((n = e.tokens[0]) == null ? void 0 : n.type) === "paragraph" ? (e.tokens[0].text = s + " " + e.tokens[0].text, e.tokens[0].tokens && e.tokens[0].tokens.length > 0 && e.tokens[0].tokens[0].type === "text" && (e.tokens[0].tokens[0].text = s + " " + wn(e.tokens[0].tokens[0].text), e.tokens[0].tokens[0].escaped = !0)) : e.tokens.unshift({
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
    return `<code>${wn(e, !0)}</code>`;
  }
  br(e) {
    return "<br>";
  }
  del({ tokens: e }) {
    return `<del>${this.parser.parseInline(e)}</del>`;
  }
  link({ href: e, title: t, tokens: n }) {
    const s = this.parser.parseInline(n), r = sc(e);
    if (r === null)
      return s;
    e = r;
    let i = '<a href="' + e + '"';
    return t && (i += ' title="' + wn(t) + '"'), i += ">" + s + "</a>", i;
  }
  image({ href: e, title: t, text: n, tokens: s }) {
    s && (n = this.parser.parseInline(s, this.parser.textRenderer));
    const r = sc(e);
    if (r === null)
      return wn(n);
    e = r;
    let i = `<img src="${e}" alt="${n}"`;
    return t && (i += ` title="${wn(t)}"`), i += ">", i;
  }
  text(e) {
    return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : wn(e.text);
  }
}, qa = class {
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
}, Bn = class fa {
  constructor(t) {
    tt(this, "options");
    tt(this, "renderer");
    tt(this, "textRenderer");
    this.options = t || $s, this.options.renderer = this.options.renderer || new qi(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new qa();
  }
  /**
   * Static Parse Method
   */
  static parse(t, n) {
    return new fa(n).parse(t);
  }
  /**
   * Static Parse Inline Method
   */
  static parseInline(t, n) {
    return new fa(n).parseInline(t);
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
        const u = a, c = this.options.extensions.renderers[u.type].call({ parser: this }, u);
        if (c !== !1 || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "paragraph", "text"].includes(u.type)) {
          s += c || "";
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
          let u = l, c = this.renderer.text(u);
          for (; o + 1 < t.length && t[o + 1].type === "text"; )
            u = t[++o], c += `
` + this.renderer.text(u);
          n ? s += this.renderer.paragraph({
            type: "paragraph",
            raw: c,
            text: c,
            tokens: [{ type: "text", raw: c, text: c, escaped: !0 }]
          }) : s += c;
          continue;
        }
        default: {
          const u = 'Token with "' + l.type + '" type was not found.';
          if (this.options.silent)
            return console.error(u), "";
          throw new Error(u);
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
        const u = this.options.extensions.renderers[a.type].call({ parser: this }, a);
        if (u !== !1 || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(a.type)) {
          s += u || "";
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
          const u = 'Token with "' + l.type + '" type was not found.';
          if (this.options.silent)
            return console.error(u), "";
          throw new Error(u);
        }
      }
    }
    return s;
  }
}, Yo, Ei = (Yo = class {
  constructor(e) {
    tt(this, "options");
    tt(this, "block");
    this.options = e || $s;
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
    return this.block ? $n.lex : $n.lexInline;
  }
  /**
   * Provide function to parse tokens
   */
  provideParser() {
    return this.block ? Bn.parse : Bn.parseInline;
  }
}, tt(Yo, "passThroughHooks", /* @__PURE__ */ new Set([
  "preprocess",
  "postprocess",
  "processAllTokens"
])), Yo), um = class {
  constructor(...e) {
    tt(this, "defaults", Fa());
    tt(this, "options", this.setOptions);
    tt(this, "parse", this.parseMarkdown(!0));
    tt(this, "parseInline", this.parseMarkdown(!1));
    tt(this, "Parser", Bn);
    tt(this, "Renderer", qi);
    tt(this, "TextRenderer", qa);
    tt(this, "Lexer", $n);
    tt(this, "Tokenizer", Wi);
    tt(this, "Hooks", Ei);
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
        const r = this.defaults.renderer || new qi(this.defaults);
        for (const i in n.renderer) {
          if (!(i in r))
            throw new Error(`renderer '${i}' does not exist`);
          if (["options", "parser"].includes(i))
            continue;
          const o = i, a = n.renderer[o], l = r[o];
          r[o] = (...u) => {
            let c = a.apply(r, u);
            return c === !1 && (c = l.apply(r, u)), c || "";
          };
        }
        s.renderer = r;
      }
      if (n.tokenizer) {
        const r = this.defaults.tokenizer || new Wi(this.defaults);
        for (const i in n.tokenizer) {
          if (!(i in r))
            throw new Error(`tokenizer '${i}' does not exist`);
          if (["options", "rules", "lexer"].includes(i))
            continue;
          const o = i, a = n.tokenizer[o], l = r[o];
          r[o] = (...u) => {
            let c = a.apply(r, u);
            return c === !1 && (c = l.apply(r, u)), c;
          };
        }
        s.tokenizer = r;
      }
      if (n.hooks) {
        const r = this.defaults.hooks || new Ei();
        for (const i in n.hooks) {
          if (!(i in r))
            throw new Error(`hook '${i}' does not exist`);
          if (["options", "block"].includes(i))
            continue;
          const o = i, a = n.hooks[o], l = r[o];
          Ei.passThroughHooks.has(i) ? r[o] = (u) => {
            if (this.defaults.async)
              return Promise.resolve(a.call(r, u)).then((b) => l.call(r, b));
            const c = a.call(r, u);
            return l.call(r, c);
          } : r[o] = (...u) => {
            let c = a.apply(r, u);
            return c === !1 && (c = l.apply(r, u)), c;
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
    return $n.lex(e, t ?? this.defaults);
  }
  parser(e, t) {
    return Bn.parse(e, t ?? this.defaults);
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
      const a = i.hooks ? i.hooks.provideLexer() : e ? $n.lex : $n.lexInline, l = i.hooks ? i.hooks.provideParser() : e ? Bn.parse : Bn.parseInline;
      if (i.async)
        return Promise.resolve(i.hooks ? i.hooks.preprocess(n) : n).then((u) => a(u, i)).then((u) => i.hooks ? i.hooks.processAllTokens(u) : u).then((u) => i.walkTokens ? Promise.all(this.walkTokens(u, i.walkTokens)).then(() => u) : u).then((u) => l(u, i)).then((u) => i.hooks ? i.hooks.postprocess(u) : u).catch(o);
      try {
        i.hooks && (n = i.hooks.preprocess(n));
        let u = a(n, i);
        i.hooks && (u = i.hooks.processAllTokens(u)), i.walkTokens && this.walkTokens(u, i.walkTokens);
        let c = l(u, i);
        return i.hooks && (c = i.hooks.postprocess(c)), c;
      } catch (u) {
        return o(u);
      }
    };
  }
  onError(e, t) {
    return (n) => {
      if (n.message += `
Please report this to https://github.com/markedjs/marked.`, e) {
        const s = "<p>An error occurred:</p><pre>" + wn(n.message + "", !0) + "</pre>";
        return t ? Promise.resolve(s) : s;
      }
      if (t)
        return Promise.reject(n);
      throw n;
    };
  }
}, Ds = new um();
function He(e, t) {
  return Ds.parse(e, t);
}
He.options = He.setOptions = function(e) {
  return Ds.setOptions(e), He.defaults = Ds.defaults, Ku(He.defaults), He;
};
He.getDefaults = Fa;
He.defaults = $s;
He.use = function(...e) {
  return Ds.use(...e), He.defaults = Ds.defaults, Ku(He.defaults), He;
};
He.walkTokens = function(e, t) {
  return Ds.walkTokens(e, t);
};
He.parseInline = Ds.parseInline;
He.Parser = Bn;
He.parser = Bn.parse;
He.Renderer = qi;
He.TextRenderer = qa;
He.Lexer = $n;
He.lexer = $n.lex;
He.Tokenizer = Wi;
He.Hooks = Ei;
He.parse = He;
He.options;
He.setOptions;
He.use;
He.walkTokens;
He.parseInline;
Bn.parse;
$n.lex;
/*! @license DOMPurify 3.4.15 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.15/LICENSE */
function oc(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function fm(e) {
  if (Array.isArray(e)) return e;
}
function dm(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var s, r, i, o, a = [], l = !0, u = !1;
    try {
      if (i = (n = n.call(e)).next, t !== 0) for (; !(l = (s = i.call(n)).done) && (a.push(s.value), a.length !== t); l = !0) ;
    } catch (c) {
      u = !0, r = c;
    } finally {
      try {
        if (!l && n.return != null && (o = n.return(), Object(o) !== o)) return;
      } finally {
        if (u) throw r;
      }
    }
    return a;
  }
}
function hm() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function pm(e, t) {
  return fm(e) || dm(e, t) || mm(e, t) || hm();
}
function mm(e, t) {
  if (e) {
    if (typeof e == "string") return oc(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? oc(e, t) : void 0;
  }
}
const rf = Object.entries, ac = Object.setPrototypeOf, gm = Object.isFrozen, _m = Object.getPrototypeOf, ym = Object.getOwnPropertyDescriptor;
let bt = Object.freeze, Tt = Object.seal, Zs = Object.create, of = typeof Reflect < "u" && Reflect, da = of.apply, ha = of.construct;
bt || (bt = function(t) {
  return t;
});
Tt || (Tt = function(t) {
  return t;
});
da || (da = function(t, n) {
  for (var s = arguments.length, r = new Array(s > 2 ? s - 2 : 0), i = 2; i < s; i++)
    r[i - 2] = arguments[i];
  return t.apply(n, r);
});
ha || (ha = function(t) {
  for (var n = arguments.length, s = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
    s[r - 1] = arguments[r];
  return new t(...s);
});
const Ls = _t(Array.prototype.forEach), vm = _t(Array.prototype.lastIndexOf), lc = _t(Array.prototype.pop), Tr = _t(Array.prototype.push), bm = _t(Array.prototype.splice), rr = Array.isArray, Cr = _t(String.prototype.toLowerCase), Do = _t(String.prototype.toString), cc = _t(String.prototype.match), Ar = _t(String.prototype.replace), uc = _t(String.prototype.indexOf), wm = _t(String.prototype.trim), km = _t(Number.prototype.toString), Tm = _t(Boolean.prototype.toString), fc = typeof BigInt > "u" ? null : _t(BigInt.prototype.toString), dc = typeof Symbol > "u" ? null : _t(Symbol.prototype.toString), Ht = _t(Object.prototype.hasOwnProperty), Sr = _t(Object.prototype.toString), Ct = _t(RegExp.prototype.test), Rs = Am(TypeError);
function _t(e) {
  return function(t) {
    t instanceof RegExp && (t.lastIndex = 0);
    for (var n = arguments.length, s = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
      s[r - 1] = arguments[r];
    return da(e, t, s);
  };
}
function Am(e) {
  return function() {
    for (var t = arguments.length, n = new Array(t), s = 0; s < t; s++)
      n[s] = arguments[s];
    return ha(e, n);
  };
}
function Fe(e, t) {
  let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : Cr;
  if (ac && ac(e, null), !rr(t))
    return e;
  let s = t.length;
  for (; s--; ) {
    let r = t[s];
    if (typeof r == "string") {
      const i = n(r);
      i !== r && (gm(t) || (t[s] = i), r = i);
    }
    e[r] = !0;
  }
  return e;
}
function Sm(e) {
  for (let t = 0; t < e.length; t++)
    Ht(e, t) || (e[t] = null);
  return e;
}
function Zt(e) {
  const t = Zs(null);
  for (const s of rf(e)) {
    var n = pm(s, 2);
    const r = n[0], i = n[1];
    Ht(e, r) && (rr(i) ? t[r] = Sm(i) : i && typeof i == "object" && i.constructor === Object ? t[r] = Zt(i) : t[r] = i);
  }
  return t;
}
function xm(e) {
  switch (typeof e) {
    case "string":
      return e;
    case "number":
      return km(e);
    case "boolean":
      return Tm(e);
    case "bigint":
      return fc ? fc(e) : "0";
    case "symbol":
      return dc ? dc(e) : "Symbol()";
    case "undefined":
      return Sr(e);
    case "function":
    case "object": {
      if (e === null)
        return Sr(e);
      const t = e, n = rn(t, "toString");
      if (typeof n == "function") {
        const s = n(t);
        return typeof s == "string" ? s : Sr(s);
      }
      return Sr(e);
    }
    default:
      return Sr(e);
  }
}
function rn(e, t) {
  for (; e !== null; ) {
    const s = ym(e, t);
    if (s) {
      if (s.get)
        return _t(s.get);
      if (typeof s.value == "function")
        return _t(s.value);
    }
    e = _m(e);
  }
  function n() {
    return null;
  }
  return n;
}
function Em(e) {
  try {
    return Ct(e, ""), !0;
  } catch {
    return !1;
  }
}
const hc = bt(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]), Fo = bt(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "enterkeyhint", "exportparts", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "inputmode", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "part", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]), $o = bt(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]), Cm = bt(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]), Bo = bt(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]), Rm = bt(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]), pc = bt(["#text"]), mc = bt(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "command", "commandfor", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "exportparts", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inert", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "part", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "slot", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns"]), Uo = bt(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dominant-baseline", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "mask-type", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "pointer-events", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-orientation", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "vector-effect", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]), gc = bt(["accent", "accentunder", "align", "bevelled", "close", "columnalign", "columnlines", "columnspacing", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lquote", "lspace", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]), _i = bt(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]), Im = Tt(/{{[\w\W]*|^[\w\W]*}}/g), Om = Tt(/<%[\w\W]*|^[\w\W]*%>/g), Lm = Tt(/\${[\w\W]*/g), Nm = Tt(/^data-[\-\w.\u00B7-\uFFFF]+$/), Pm = Tt(/^aria-[\-\w]+$/), _c = Tt(
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  // eslint-disable-line no-useless-escape
), Mm = Tt(/^(?:\w+script|data):/i), Dm = Tt(
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g
  // eslint-disable-line no-control-regex
), Fm = Tt(/^html$/i), $m = Tt(/^[a-z][.\w]*(-[.\w]+)+$/i), yc = Tt(/<[/\w!]/g), vc = Tt(/<[/\w]/g), Bm = Tt(/<\/no(script|embed|frames)/i), Um = Tt(/\/>/i), Yt = {
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
}, af = ["style", "script", "xmp", "iframe", "noembed", "noframes", "plaintext", "noscript"], zm = bt(Fe({}, af)), Hm = function() {
  const e = {};
  return Ls(af, (t) => {
    e[t] = Tt(new RegExp("</" + t + "(?=[\\t\\n\\f\\r />])", "i"));
  }), bt(e);
}(), jm = function() {
  return typeof window > "u" ? null : window;
}, Wm = function(t, n) {
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
}, bc = function() {
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
}, ns = function(t, n, s, r) {
  return Ht(t, n) && rr(t[n]) ? Fe(r.base ? Zt(r.base) : {}, t[n], r.transform) : s;
}, zo = function(t, n, s) {
  const r = Ht(t, n) ? t[n] : void 0;
  return r && typeof r == "object" ? Zt(r) : s();
};
function lf() {
  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : jm();
  const t = (G) => lf(G);
  if (t.version = "3.4.15", t.removed = [], !e || !e.document || e.document.nodeType !== Yt.document || !e.Element)
    return t.isSupported = !1, t;
  let n = e.document;
  const s = n, r = s.currentScript;
  e.DocumentFragment;
  const i = e.HTMLTemplateElement, o = e.Node, a = e.Element, l = e.NodeFilter, u = e.NamedNodeMap;
  u === void 0 && (e.NamedNodeMap || e.MozNamedAttrMap), e.HTMLFormElement;
  const c = e.DOMParser, b = e.trustedTypes, T = a.prototype, I = rn(T, "cloneNode"), O = rn(T, "remove"), H = rn(T, "removeAttributeNode"), ue = rn(T, "nextSibling"), R = rn(T, "childNodes"), fe = rn(T, "parentNode"), _e = rn(T, "shadowRoot"), C = rn(T, "attributes"), P = o && o.prototype ? rn(o.prototype, "nodeType") : null, S = o && o.prototype ? rn(o.prototype, "nodeName") : null, W = o && o.prototype ? rn(o.prototype, "ownerDocument") : null, se = function(h) {
    return P ? P(h) : h.nodeType;
  }, me = function(h) {
    return S ? S(h) : h.nodeName;
  };
  if (typeof i == "function") {
    const G = n.createElement("template");
    G.content && G.content.ownerDocument && (n = G.content.ownerDocument);
  }
  let ge, Oe = "", Se, Ke = !1, Ue = 0;
  const st = function() {
    if (Ue > 0)
      throw Rs('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.');
  }, de = function(h) {
    st(), Ue++;
    try {
      return ge.createHTML(h);
    } finally {
      Ue--;
    }
  }, Te = function(h) {
    st(), Ue++;
    try {
      return ge.createScriptURL(h);
    } finally {
      Ue--;
    }
  }, ye = function() {
    return Ke || (Se = Wm(b, r), Ke = !0), Se;
  }, Ze = n, Je = Ze.implementation, lt = Ze.createNodeIterator, je = Ze.createDocumentFragment, Lt = Ze.getElementsByTagName, gn = s.importNode;
  let Me = bc();
  t.isSupported = typeof rf == "function" && typeof fe == "function" && Je && Je.createHTMLDocument !== void 0;
  const wt = Im, Bt = Om, jt = Lm, Wt = Nm, Nt = Pm, _n = Mm, _ = Dm, v = $m;
  let L = _c, D = null;
  const U = Fe({}, [...hc, ...Fo, ...$o, ...Bo, ...pc]);
  let M = null;
  const X = Fe({}, [...mc, ...Uo, ...gc, ..._i]);
  let V = Object.seal(Zs(null, {
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
  })), K = null, j = null;
  const re = Object.seal(Zs(null, {
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
  let J = !0, Q = !0, pe = !1, he = !0, be = !1, ke = !0, De = !1, $ = !1, z = null, f = null, y = !1, N = !1, E = !1, q = !1, te = !0, ie = !1;
  const xe = "user-content-";
  let Ie = !0, ze = !1, Le = {}, Qe = null;
  const rt = Fe({}, [
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
  let un = null;
  const Bs = Fe({}, ["audio", "video", "img", "source", "image", "track"]);
  let jn = null;
  const Xr = Fe({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), Ut = "http://www.w3.org/1998/Math/MathML", Pt = "http://www.w3.org/2000/svg", qt = "http://www.w3.org/1999/xhtml";
  let At = qt, Wn = !1, qn = null;
  const gs = Fe({}, [Ut, Pt, qt], Do), Zr = bt(["mi", "mo", "mn", "ms", "mtext"]);
  let Rn = Fe({}, Zr);
  const fn = bt(["annotation-xml"]);
  let Vt = Fe({}, fn);
  const Jr = Fe({}, ["title", "style", "font", "a", "script"]);
  let ft = null;
  const po = ["application/xhtml+xml", "text/html"], Qr = "text/html";
  let $e = null, Vn = null;
  const _s = n.createElement("form"), Us = function(h) {
    return h instanceof RegExp || h instanceof Function;
  }, lr = function() {
    let h = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (Vn && Vn === h)
      return;
    (!h || typeof h != "object") && (h = {}), h = Zt(h), ft = // eslint-disable-next-line unicorn/prefer-includes
    po.indexOf(h.PARSER_MEDIA_TYPE) === -1 ? Qr : h.PARSER_MEDIA_TYPE, $e = ft === "application/xhtml+xml" ? Do : Cr, D = ns(h, "ALLOWED_TAGS", U, {
      transform: $e
    }), M = ns(h, "ALLOWED_ATTR", X, {
      transform: $e
    }), qn = ns(h, "ALLOWED_NAMESPACES", gs, {
      transform: Do
    }), jn = ns(h, "ADD_URI_SAFE_ATTR", Xr, {
      transform: $e,
      base: Xr
    }), un = ns(h, "ADD_DATA_URI_TAGS", Bs, {
      transform: $e,
      base: Bs
    }), Qe = ns(h, "FORBID_CONTENTS", rt, {
      transform: $e
    }), K = ns(h, "FORBID_TAGS", Zt({}), {
      transform: $e
    }), j = ns(h, "FORBID_ATTR", Zt({}), {
      transform: $e
    }), Le = Ht(h, "USE_PROFILES") ? h.USE_PROFILES && typeof h.USE_PROFILES == "object" ? Zt(h.USE_PROFILES) : h.USE_PROFILES : !1, J = h.ALLOW_ARIA_ATTR !== !1, Q = h.ALLOW_DATA_ATTR !== !1, pe = h.ALLOW_UNKNOWN_PROTOCOLS || !1, he = h.ALLOW_SELF_CLOSE_IN_ATTR !== !1, be = h.SAFE_FOR_TEMPLATES || !1, ke = h.SAFE_FOR_XML !== !1, De = h.WHOLE_DOCUMENT || !1, N = h.RETURN_DOM || !1, E = h.RETURN_DOM_FRAGMENT || !1, q = h.RETURN_TRUSTED_TYPE || !1, y = h.FORCE_BODY || !1, te = h.SANITIZE_DOM !== !1, ie = h.SANITIZE_NAMED_PROPS || !1, Ie = h.KEEP_CONTENT !== !1, ze = h.IN_PLACE || !1, L = Em(h.ALLOWED_URI_REGEXP) ? h.ALLOWED_URI_REGEXP : _c, At = typeof h.NAMESPACE == "string" ? h.NAMESPACE : qt, Rn = zo(
      h,
      "MATHML_TEXT_INTEGRATION_POINTS",
      () => Fe({}, Zr)
      // Default built-in map
    ), Vt = zo(
      h,
      "HTML_INTEGRATION_POINTS",
      () => Fe({}, fn)
      // Default built-in map
    );
    const k = zo(h, "CUSTOM_ELEMENT_HANDLING", () => Zs(null));
    if (V = Zs(null), Ht(k, "tagNameCheck") && Us(k.tagNameCheck) && (V.tagNameCheck = k.tagNameCheck), Ht(k, "attributeNameCheck") && Us(k.attributeNameCheck) && (V.attributeNameCheck = k.attributeNameCheck), Ht(k, "allowCustomizedBuiltInElements") && typeof k.allowCustomizedBuiltInElements == "boolean" && (V.allowCustomizedBuiltInElements = k.allowCustomizedBuiltInElements), Tt(V), be && (Q = !1), E && (N = !0), Le && (D = Fe({}, pc), M = Zs(null), Le.html === !0 && (Fe(D, hc), Fe(M, mc)), Le.svg === !0 && (Fe(D, Fo), Fe(M, Uo), Fe(M, _i)), Le.svgFilters === !0 && (Fe(D, $o), Fe(M, Uo), Fe(M, _i)), Le.mathMl === !0 && (Fe(D, Bo), Fe(M, gc), Fe(M, _i))), re.tagCheck = null, re.attributeCheck = null, Ht(h, "ADD_TAGS") && (typeof h.ADD_TAGS == "function" ? re.tagCheck = h.ADD_TAGS : rr(h.ADD_TAGS) && (D === U && (D = Zt(D)), Fe(D, h.ADD_TAGS, $e))), Ht(h, "ADD_ATTR") && (typeof h.ADD_ATTR == "function" ? re.attributeCheck = h.ADD_ATTR : rr(h.ADD_ATTR) && (M === X && (M = Zt(M)), Fe(M, h.ADD_ATTR, $e))), Ht(h, "ADD_FORBID_CONTENTS") && rr(h.ADD_FORBID_CONTENTS) && (Qe === rt && (Qe = Zt(Qe)), Fe(Qe, h.ADD_FORBID_CONTENTS, $e)), Ie && (D["#text"] = !0), De && Fe(D, ["html", "head", "body"]), D.table && (Fe(D, ["tbody"]), delete K.tbody), h.TRUSTED_TYPES_POLICY) {
      if (typeof h.TRUSTED_TYPES_POLICY.createHTML != "function")
        throw Rs('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
      if (typeof h.TRUSTED_TYPES_POLICY.createScriptURL != "function")
        throw Rs('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
      const B = ge;
      ge = h.TRUSTED_TYPES_POLICY;
      try {
        Oe = de("");
      } catch (ee) {
        throw ge = B, ee;
      }
    } else h.TRUSTED_TYPES_POLICY === null ? (ge = void 0, Oe = "") : (ge === void 0 && (ge = ye()), ge && typeof Oe == "string" && (Oe = de("")));
    bt && bt(h), Vn = h;
  }, ys = Fe({}, [...Fo, ...$o, ...Cm]), cr = Fe({}, [...Bo, ...Rm]), ei = function(h, k, B) {
    return k.namespaceURI === qt ? h === "svg" : k.namespaceURI === Ut ? h === "svg" && (B === "annotation-xml" || Rn[B]) : !!ys[h];
  }, ti = function(h, k, B) {
    return k.namespaceURI === qt ? h === "math" : k.namespaceURI === Pt ? h === "math" && Vt[B] : !!cr[h];
  }, ni = function(h, k, B) {
    return k.namespaceURI === Pt && !Vt[B] || k.namespaceURI === Ut && !Rn[B] ? !1 : !cr[h] && (Jr[h] || !ys[h]);
  }, si = function(h) {
    let k = fe(h);
    (!k || !k.tagName) && (k = {
      namespaceURI: At,
      tagName: "template"
    });
    const B = Cr(h.tagName), ee = Cr(k.tagName);
    return qn[h.namespaceURI] ? h.namespaceURI === Pt ? ei(B, k, ee) : h.namespaceURI === Ut ? ti(B, k, ee) : h.namespaceURI === qt ? ni(B, k, ee) : !!(ft === "application/xhtml+xml" && qn[h.namespaceURI]) : !1;
  }, dn = function(h) {
    Tr(t.removed, {
      element: h
    });
    try {
      fe(h).removeChild(h);
    } catch {
      if (O(h), !fe(h))
        throw Rs("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place");
    }
  }, ri = function(h, k, B) {
    try {
      H(h, k);
    } catch {
      try {
        h.removeAttribute(B);
      } catch {
      }
    }
  }, Kn = function(h) {
    vs(h);
    const k = R(h);
    if (k) {
      const ee = [];
      Ls(k, (le) => {
        Tr(ee, le);
      }), Ls(ee, (le) => {
        try {
          O(le);
        } catch {
        }
      });
    }
    const B = C(h);
    if (B)
      for (let ee = B.length - 1; ee >= 0; --ee) {
        const le = B[ee], ve = le && le.name;
        typeof ve == "string" && ri(h, le, ve);
      }
  }, Qt = function(h, k, B) {
    if (!B)
      try {
        B = k.getAttributeNode(h);
      } catch {
        B = null;
      }
    Tr(t.removed, {
      attribute: B || null,
      from: k
    });
    try {
      B ? H(k, B) : k.removeAttribute(h);
    } catch {
      try {
        k.removeAttribute(h);
      } catch {
      }
    }
    if (h === "is")
      if (N || E)
        try {
          dn(k);
        } catch {
        }
      else
        try {
          k.setAttribute(h, "");
        } catch {
        }
  }, ii = function(h) {
    const k = C(h);
    if (k)
      for (let B = k.length - 1; B >= 0; --B) {
        const ee = k[B], le = ee && ee.name;
        typeof le != "string" || M[$e(le)] || ri(h, ee, le);
      }
  }, vs = function(h) {
    const k = [h];
    for (; k.length > 0; ) {
      const B = k.pop();
      se(B) === Yt.element && ii(B);
      const le = R(B);
      if (le)
        for (let ve = le.length - 1; ve >= 0; --ve)
          k.push(le[ve]);
    }
  }, yn = function(h, k) {
    return ke ? h === "patchsrc" ? !0 : h === "for" && k !== "label" && k !== "output" : !1;
  }, bs = function(h) {
    if (!ke)
      return;
    const k = [h];
    for (; k.length > 0; ) {
      const B = k.pop(), ee = se(B);
      if (ee === Yt.processingInstruction || ee === Yt.comment && Ct(vc, B.data)) {
        try {
          O(B);
        } catch {
        }
        continue;
      }
      if (ee === Yt.element) {
        const ve = B, Ge = $e(me(B));
        try {
          ve.hasAttribute && ve.hasAttribute("patchsrc") && ve.removeAttribute("patchsrc"), ve.hasAttribute && ve.hasAttribute("for") && yn("for", Ge) && ve.removeAttribute("for");
        } catch {
        }
      }
      const le = R(B);
      if (le)
        for (let ve = le.length - 1; ve >= 0; --ve)
          k.push(le[ve]);
    }
  }, zs = function(h) {
    let k = null, B = null;
    if (y)
      h = "<remove></remove>" + h;
    else {
      const ve = cc(h, /^[\r\n\t ]+/);
      B = ve && ve[0];
    }
    ft === "application/xhtml+xml" && At === qt && (h = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + h + "</body></html>");
    const ee = ge ? de(h) : h;
    if (At === qt)
      try {
        k = new c().parseFromString(ee, ft);
      } catch {
      }
    if (!k || !k.documentElement) {
      k = Je.createDocument(At, "template", null);
      try {
        k.documentElement.innerHTML = Wn ? Oe : ee;
      } catch {
      }
    }
    const le = k.body || k.documentElement;
    return h && B && le.insertBefore(n.createTextNode(B), le.childNodes[0] || null), At === qt ? Lt.call(k, De ? "html" : "body")[0] : De ? k.documentElement : le;
  }, Hs = function(h) {
    const k = W ? W(h) : h.ownerDocument;
    return lt.call(
      k || h,
      h,
      // eslint-disable-next-line no-bitwise
      l.SHOW_ELEMENT | l.SHOW_COMMENT | l.SHOW_TEXT | l.SHOW_PROCESSING_INSTRUCTION | l.SHOW_CDATA_SECTION,
      null
    );
  }, In = function(h) {
    return h = Ar(h, wt, " "), h = Ar(h, Bt, " "), h = Ar(h, jt, " "), h;
  }, en = function(h) {
    var k;
    h.normalize();
    const B = W ? W(h) : h.ownerDocument, ee = lt.call(
      B || h,
      h,
      // eslint-disable-next-line no-bitwise
      l.SHOW_TEXT | l.SHOW_COMMENT | l.SHOW_CDATA_SECTION | l.SHOW_PROCESSING_INSTRUCTION,
      null
    );
    let le = ee.nextNode();
    for (; le; )
      le.data = In(le.data), le = ee.nextNode();
    const ve = (k = h.querySelectorAll) === null || k === void 0 ? void 0 : k.call(h, "template");
    ve && Ls(ve, (Ge) => {
      hn(Ge.content) && en(Ge.content);
    });
  }, Gn = function(h) {
    const k = S ? S(h) : null;
    return typeof k != "string" || $e(k) !== "form" ? !1 : typeof h.nodeName != "string" || typeof h.textContent != "string" || typeof h.removeChild != "function" || // Realm-safe NamedNodeMap detection: equality against the cached
    // prototype getter. Clobbered .attributes (e.g. <input name="attributes">)
    // makes the direct read diverge from the cached read; a clean form
    // (same-realm OR foreign-realm) has both reads pointing at the same
    // canonical NamedNodeMap.
    h.attributes !== C(h) || typeof h.removeAttribute != "function" || // A form descendant named "removeAttributeNode" or "getAttributeNode"
    // shadows these Attr-node methods via [LegacyOverrideBuiltIns].
    // _removeAttribute() / _stripAttributeNode() reach for
    // element.removeAttributeNode(attr) first; when it is shadowed the call
    // throws and the name-based fallback element.removeAttribute(name)
    // ASCII-lowercases its lookup key in an HTML document, silently missing
    // a case-preserved event-handler attribute (e.g. an ONANIMATIONSTART
    // that reached the sanitizer through an XML/XHTML parse). Flag the form
    // so it is removed wholesale, exactly as for the other shadowed methods.
    typeof h.removeAttributeNode != "function" || typeof h.getAttributeNode != "function" || typeof h.setAttribute != "function" || typeof h.namespaceURI != "string" || typeof h.insertBefore != "function" || typeof h.hasChildNodes != "function" || // NodeType clobbering probe. Cached Node.prototype.nodeType getter
    // returns the integer 1 for any Element regardless of realm; direct
    // read on a clobbered form (e.g. <input name="nodeType">) returns
    // the named child element. Cheap addition — nodeType is read from
    // an internal slot, no serialization cost — and removes a residual
    // clobbering surface used by several mXSS / PI / comment branches
    // in _sanitizeElements that compare currentNode.nodeType directly.
    h.nodeType !== P(h) || // HTMLFormElement has [LegacyOverrideBuiltIns]: a descendant named
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
    h.childNodes !== R(h);
  }, hn = function(h) {
    if (!P || typeof h != "object" || h === null)
      return !1;
    try {
      return P(h) === Yt.documentFragment;
    } catch {
      return !1;
    }
  }, Yn = function(h) {
    if (!P || typeof h != "object" || h === null)
      return !1;
    try {
      return typeof P(h) == "number";
    } catch {
      return !1;
    }
  };
  function kt(G, h, k) {
    G.length !== 0 && Ls(G, (B) => {
      B.call(t, h, k, Vn);
    });
  }
  const mo = function(h, k) {
    return !!(ke && h.hasChildNodes() && !Yn(h.firstElementChild) && Ct(yc, h.textContent) && Ct(yc, h.innerHTML) || ke && h.namespaceURI === qt && zm[k] && (Yn(h.firstElementChild) || typeof h.textContent == "string" && Ct(Hm[k], h.textContent)) || h.nodeType === Yt.processingInstruction || ke && h.nodeType === Yt.comment && Ct(vc, h.data));
  }, vn = function(h, k) {
    if (h instanceof RegExp)
      return Ct(h, k);
    if (h instanceof Function) {
      for (var B = arguments.length, ee = new Array(B > 2 ? B - 2 : 0), le = 2; le < B; le++)
        ee[le - 2] = arguments[le];
      return !!h(k, ...ee);
    }
    return !1;
  }, oi = function(h, k, B) {
    if (!K[k] && Kt(k) && vn(V.tagNameCheck, k))
      return !1;
    if (Ie && !Qe[k]) {
      const ee = fe(h), le = R(h);
      if (le && ee) {
        const ve = le.length;
        for (let Ge = ve - 1; Ge >= 0; --Ge) {
          const ot = h === B ? I(le[Ge], !0) : le[Ge];
          ee.insertBefore(ot, ue(h));
        }
      }
    }
    return dn(h), !0;
  }, ai = function(h, k, B, ee) {
    return h.length === 0 ? k : k === B || k === ee ? Zt(k) : k;
  }, ur = function(h, k) {
    return h === k || fe(h) !== null ? !1 : (ze && vs(h), !0);
  }, ws = function(h, k) {
    if (kt(Me.beforeSanitizeElements, h, null), ur(h, k))
      return !0;
    if (Gn(h))
      return dn(h), !0;
    const B = $e(me(h));
    if (D = ai(Me.uponSanitizeElement, D, U, z), kt(Me.uponSanitizeElement, h, {
      tagName: B,
      allowedTags: D
    }), ur(h, k))
      return !0;
    if (mo(h, B))
      return dn(h), !0;
    if (K[B] || !(re.tagCheck instanceof Function && re.tagCheck(B)) && !D[B]) {
      const le = oi(h, B, k);
      return le === !1 && kt(Me.afterSanitizeElements, h, null), le;
    }
    if (se(h) === Yt.element && !si(h) || (B === "noscript" || B === "noembed" || B === "noframes") && Ct(Bm, h.innerHTML))
      return dn(h), !0;
    if (be && h.nodeType === Yt.text) {
      const le = In(h.textContent);
      h.textContent !== le && (Tr(t.removed, {
        element: h.cloneNode()
      }), h.textContent = le);
    }
    return kt(Me.afterSanitizeElements, h, null), !1;
  }, js = function(h, k, B) {
    if (j[k] || yn(k, h) || te && (k === "id" || k === "name") && (B in n || B in _s))
      return !1;
    const ee = M[k] || re.attributeCheck instanceof Function && re.attributeCheck(k, h);
    return Q && Ct(Wt, k) || J && Ct(Nt, k) ? !0 : ee ? jn[k] || Ct(L, Ar(B, _, "")) || (k === "src" || k === "xlink:href" || k === "href") && h !== "script" && uc(B, "data:") === 0 && un[h] || pe && !Ct(_n, Ar(B, _, "")) ? !0 : !B : (
      // Condition a) covers a basically valid custom element tag name whose
      // tag passes the configured tagNameCheck and whose attribute name
      // passes the configured attributeNameCheck ...
      Kt(h) && vn(V.tagNameCheck, h) && vn(V.attributeNameCheck, k, h) || // Condition b) covers an `is` attribute whose value passes the
      // configured tagNameCheck while customized built-in elements are
      // allowed.
      k === "is" && V.allowCustomizedBuiltInElements && vn(V.tagNameCheck, B)
    );
  }, tn = Fe({}, ["annotation-xml", "color-profile", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "missing-glyph"]), Kt = function(h) {
    return !tn[Cr(h)] && Ct(v, h);
  }, dt = function(h, k, B, ee) {
    if (ge && typeof b == "object" && typeof b.getAttributeType == "function" && !B)
      switch (b.getAttributeType(h, k)) {
        case "TrustedHTML":
          return de(ee);
        case "TrustedScriptURL":
          return Te(ee);
      }
    return ee;
  }, yt = function(h, k, B, ee) {
    try {
      return B ? h.setAttributeNS(B, k, ee) : h.setAttribute(k, ee), Gn(h) ? (dn(h), !1) : !0;
    } catch {
      return Qt(k, h), !1;
    }
  }, ut = function(h) {
    kt(Me.beforeSanitizeAttributes, h, null);
    const k = h.attributes;
    if (!k || Gn(h))
      return;
    M = ai(Me.uponSanitizeAttribute, M, X, f);
    const B = {
      attrName: "",
      attrValue: "",
      keepAttr: !0,
      allowedAttributes: M,
      forceKeepAttr: void 0
    };
    let ee = k.length;
    const le = $e(h.nodeName);
    for (; ee--; ) {
      const ve = k[ee], Ge = ve.name, ot = ve.namespaceURI, xt = ve.value, Et = $e(Ge), fr = xt;
      let We = Ge === "value" ? fr : wm(fr), li = !1;
      if (B.attrName = Et, B.attrValue = We, B.keepAttr = !0, B.forceKeepAttr = void 0, kt(Me.uponSanitizeAttribute, h, B), We = B.attrValue, ie && (Et === "id" || Et === "name") && uc(We, xe) !== 0 && (Qt(Ge, h, ve), We = xe + We, li = !0), ke && Ct(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, We)) {
        Qt(Ge, h, ve);
        continue;
      }
      if (Et === "attributename" && cc(We, "href")) {
        Qt(Ge, h, ve);
        continue;
      }
      if (!B.forceKeepAttr) {
        if (!B.keepAttr) {
          Qt(Ge, h, ve);
          continue;
        }
        if (!he && Ct(Um, We)) {
          Qt(Ge, h, ve);
          continue;
        }
        if (be && (We = In(We)), !js(le, Et, We)) {
          Qt(Ge, h, ve);
          continue;
        }
        We = dt(le, Et, ot, We), We !== fr && yt(h, Ge, ot, We) && li && lc(t.removed);
      }
    }
    kt(Me.afterSanitizeAttributes, h, null);
  }, nn = function(h) {
    let k = null;
    const B = Hs(h);
    for (kt(Me.beforeSanitizeShadowDOM, h, null); k = B.nextNode(); )
      if (kt(Me.uponSanitizeShadowNode, k, null), ws(k, h), ut(k), hn(k.content) && nn(k.content), se(k) === Yt.element) {
        const ee = _e(k);
        hn(ee) && (On(ee), nn(ee));
      }
    kt(Me.afterSanitizeShadowDOM, h, null);
  }, On = function(h) {
    const k = [{
      node: h,
      shadow: null
    }];
    for (; k.length > 0; ) {
      const B = k.pop();
      if (B.shadow) {
        nn(B.shadow);
        continue;
      }
      const ee = B.node, ve = se(ee) === Yt.element, Ge = R(ee);
      if (Ge)
        for (let ot = Ge.length - 1; ot >= 0; --ot)
          k.push({
            node: Ge[ot],
            shadow: null
          });
      if (ve) {
        const ot = S ? S(ee) : null;
        if (typeof ot == "string" && $e(ot) === "template") {
          const xt = ee.content;
          hn(xt) && k.push({
            node: xt,
            shadow: null
          });
        }
      }
      if (ve) {
        const ot = _e(ee);
        hn(ot) && k.push({
          node: null,
          shadow: ot
        }, {
          node: ot,
          shadow: null
        });
      }
    }
  };
  return t.sanitize = function(G) {
    let h = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, k = null, B = null, ee = null, le = null;
    if (Wn = !G, Wn && (G = "<!-->"), typeof G != "string" && !Yn(G) && (G = xm(G), typeof G != "string"))
      throw Rs("dirty is not a string, aborting");
    if (!t.isSupported)
      return G;
    $ ? (D = z, M = f) : lr(h), (Me.uponSanitizeElement.length > 0 || Me.uponSanitizeAttribute.length > 0) && (D = Zt(D)), Me.uponSanitizeAttribute.length > 0 && (M = Zt(M)), t.removed = [];
    const ve = ze && typeof G != "string" && Yn(G);
    if (ve) {
      bs(G);
      const xt = me(G);
      if (typeof xt == "string") {
        const Et = $e(xt);
        if (!D[Et] || K[Et])
          throw Kn(G), Rs("root node is forbidden and cannot be sanitized in-place");
      }
      if (Gn(G))
        throw Kn(G), Rs("root node is clobbered and cannot be sanitized in-place");
      try {
        On(G);
      } catch (Et) {
        throw Kn(G), Et;
      }
    } else if (Yn(G))
      k = zs("<!---->"), B = k.ownerDocument.importNode(G, !0), B.nodeType === Yt.element && B.nodeName === "BODY" || B.nodeName === "HTML" ? k = B : k.appendChild(B), On(k);
    else {
      if (!N && !be && !De && // eslint-disable-next-line unicorn/prefer-includes
      G.indexOf("<") === -1)
        return ge && q ? de(G) : G;
      if (k = zs(G), !k)
        return N ? null : q ? Oe : "";
    }
    k && y && dn(k.firstChild);
    const Ge = ve ? G : k;
    try {
      const xt = Hs(Ge);
      for (; ee = xt.nextNode(); )
        ws(ee, Ge), ut(ee), hn(ee.content) && nn(ee.content);
    } catch (xt) {
      throw ve && (Kn(G), Ls(t.removed, (Et) => {
        Et.element && vs(Et.element);
      })), xt;
    }
    if (ve)
      return Ls(t.removed, (xt) => {
        xt.element && vs(xt.element);
      }), be && en(G), G;
    if (N) {
      if (be && en(k), E)
        for (le = je.call(k.ownerDocument); k.firstChild; )
          le.appendChild(k.firstChild);
      else
        le = k;
      return (M.shadowroot || M.shadowrootmode) && (le = gn.call(s, le, !0)), le;
    }
    let ot = De ? k.outerHTML : k.innerHTML;
    return De && D["!doctype"] && k.ownerDocument && k.ownerDocument.doctype && k.ownerDocument.doctype.name && Ct(Fm, k.ownerDocument.doctype.name) && (ot = "<!DOCTYPE " + k.ownerDocument.doctype.name + `>
` + ot), be && (ot = In(ot)), ge && q ? de(ot) : ot;
  }, t.setConfig = function() {
    let G = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    lr(G), $ = !0, z = D, f = M;
  }, t.clearConfig = function() {
    Vn = null, $ = !1, z = null, f = null, ge = Se, Oe = "";
  }, t.isValidAttribute = function(G, h, k) {
    Vn || lr({});
    const B = $e(G), ee = $e(h);
    return js(B, ee, k);
  }, t.addHook = function(G, h) {
    typeof h == "function" && Ht(Me, G) && Tr(Me[G], h);
  }, t.removeHook = function(G, h) {
    if (Ht(Me, G)) {
      if (h !== void 0) {
        const k = vm(Me[G], h);
        return k === -1 ? void 0 : bm(Me[G], k, 1)[0];
      }
      return lc(Me[G]);
    }
  }, t.removeHooks = function(G) {
    Ht(Me, G) && (Me[G] = []);
  }, t.removeAllHooks = function() {
    Me = bc();
  }, t;
}
var Va = lf();
Va.addHook("uponSanitizeElement", (e, t) => {
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
Va.addHook("afterSanitizeAttributes", (e) => {
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
function qm(e) {
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
  return Va.sanitize(e, t);
}
He.setOptions({
  renderer: new He.Renderer(),
  gfm: !0,
  breaks: !0
});
const Ci = (e) => qm(He(e || "")), wc = "*", Vm = /* @__PURE__ */ new Set(["null", "about:blank", ""]);
let on = null;
const Br = (e) => e && !Vm.has(e) ? e : null, Km = (e) => {
  if (!e) return null;
  try {
    return Br(new URL(e).origin);
  } catch {
    return null;
  }
};
function cf() {
  if (on) return on;
  if (window.parent === window)
    return on = Br(window.location.origin) || wc, on;
  try {
    const e = Br(window.parent.location.origin);
    if (e)
      return on = e, on;
  } catch {
  }
  try {
    const e = window.location.ancestorOrigins, t = e && e.length ? Br(e[0]) : null;
    if (t)
      return on = t, on;
  } catch {
  }
  return on = Km(document.referrer) || wc, on;
}
function kc(e) {
  on = Br(e) || on;
}
function vt(e) {
  window.parent.postMessage(e, cf());
}
const Vi = "Start a new chat", Tc = "Start a new chat? This ends the current one.", Gm = "Start new chat", Ym = "Cancel", Ac = "Couldn't start a new chat. Please try again.", Xm = 15e3, Zm = ["aria-label"], Jm = { class: "new-chat-confirm__question" }, Qm = { class: "new-chat-confirm__actions" }, eg = ["disabled"], tg = ["disabled"], ng = /* @__PURE__ */ ps({
  __name: "NewChatConfirm",
  props: {
    error: {},
    busy: { type: Boolean }
  },
  emits: ["confirm", "cancel"],
  setup(e, { emit: t }) {
    const n = t;
    return (s, r) => (w(), A("div", {
      class: "new-chat-confirm",
      role: "alertdialog",
      "aria-live": "polite",
      "aria-label": x(Tc)
    }, [
      g("p", Jm, Z(s.error || x(Tc)), 1),
      g("div", Qm, [
        g("button", {
          type: "button",
          class: "new-chat-confirm__button",
          disabled: s.busy,
          onClick: r[0] || (r[0] = (i) => n("cancel"))
        }, Z(x(Ym)), 9, eg),
        g("button", {
          type: "button",
          class: "new-chat-confirm__button new-chat-confirm__button--primary",
          disabled: s.busy,
          onClick: r[1] || (r[1] = (i) => n("confirm"))
        }, Z(x(Gm)), 9, tg)
      ])
    ], 8, Zm));
  }
}), ms = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [s, r] of t)
    n[s] = r;
  return n;
}, uf = /* @__PURE__ */ ms(ng, [["__scopeId", "data-v-6c78f353"]]), sg = { class: "askai" }, rg = { class: "askai__bar" }, ig = ["value", "placeholder", "disabled", "aria-label", "onKeydown"], og = ["disabled", "title", "aria-label", "aria-expanded"], ag = { class: "askai__intro" }, lg = { class: "askai__title" }, cg = {
  key: 0,
  class: "askai__subtitle"
}, ug = {
  key: 0,
  class: "askai__suggestions"
}, fg = ["disabled", "onClick"], dg = ["aria-live"], hg = {
  key: 0,
  class: "askai__question"
}, pg = {
  key: 1,
  class: "askai__system"
}, mg = ["innerHTML"], gg = {
  key: 0,
  class: "askai__sources"
}, _g = ["title"], yg = {
  key: 0,
  class: "askai__thinking",
  role: "status",
  "aria-live": "polite"
}, vg = { class: "askai__thinking-text" }, bg = { class: "askai__foot" }, wg = { key: 0 }, kg = /* @__PURE__ */ ps({
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
    const n = e, s = t, r = oe(null), i = oe(null), o = oe(null), a = ["user", "bot", "agent", "system"], l = ae(
      () => n.messages.map((C, P) => ({ message: C, index: P })).filter(({ message: C }) => a.includes(C.message_type))
    ), u = ae(() => l.value.length > 0), c = (C) => {
      s("update:draft", C.target.value);
    }, b = () => {
      !(n.typingEnabled ?? n.inputEnabled) || !n.draft.trim() || s("send");
    }, T = (C) => {
      n.inputEnabled && s("ask", C);
    }, I = typeof navigator < "u" && /Mac|iPod|iPhone|iPad/.test(navigator.platform || ""), O = (C) => {
      if (C.key === "Escape") {
        C.preventDefault(), s("close");
        return;
      }
      const P = I ? C.metaKey && !C.ctrlKey : C.ctrlKey && !C.metaKey;
      n.hotkey && P && !C.altKey && (C.key === "k" || C.key === "K") && (C.preventDefault(), s("close"));
    }, H = () => {
      is(() => {
        var C;
        return (C = r.value) == null ? void 0 : C.focus();
      });
    };
    let ue = 0;
    const R = () => {
      if (!o.value) return;
      const C = o.value.closest(".askai"), P = i.value;
      if (!C || !P) return;
      const S = C.offsetHeight - P.offsetHeight, W = getComputedStyle(P), se = parseFloat(W.paddingTop) + parseFloat(W.paddingBottom), me = Math.ceil(S + se + o.value.getBoundingClientRect().height);
      Math.abs(me - ue) < 3 || (ue = me, vt({ type: "WIDGET_RESIZE", height: me }));
    };
    let fe = null;
    const _e = ae(
      () => l.value.reduce((C, { message: P, index: S }) => C + n.displayText(S, P.message || "").length, 0)
    );
    return pt(
      () => [l.value.length, _e.value, n.loading],
      () => is(() => {
        i.value && (i.value.scrollTop = i.value.scrollHeight);
      })
    ), pt(() => n.newChatArmed, () => is(() => R())), pt(() => n.active, (C) => {
      C && H();
    }), ro(() => {
      n.active && H(), window.addEventListener("keydown", O), o.value && typeof ResizeObserver < "u" && (fe = new ResizeObserver(() => R()), fe.observe(o.value)), R();
    }), io(() => {
      window.removeEventListener("keydown", O), fe == null || fe.disconnect(), fe = null;
    }), (C, P) => (w(), A("div", sg, [
      g("div", rg, [
        P[6] || (P[6] = g("svg", {
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
          g("path", { d: "M12 3l1.9 4.9L19 9.8l-4.9 1.9L12 17l-1.9-5.3L5 9.8l5.1-1.9L12 3z" })
        ], -1)),
        g("input", {
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
          onInput: c,
          onKeydown: xi(Os(b, ["prevent"]), ["enter"])
        }, null, 40, ig),
        C.canStartNewChat ? (w(), A("button", {
          key: 0,
          type: "button",
          class: Ne(["askai__new", { "askai__new--armed": C.newChatArmed }]),
          disabled: C.startingNewChat,
          title: x(Vi),
          "aria-label": x(Vi),
          "aria-expanded": C.newChatArmed,
          onClick: P[0] || (P[0] = (S) => s("newChat"))
        }, P[4] || (P[4] = [
          g("svg", {
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
            g("path", { d: "M12 20h9" }),
            g("path", { d: "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" })
          ], -1)
        ]), 10, og)) : ne("", !0),
        g("button", {
          type: "button",
          class: "askai__close",
          "aria-label": "Close",
          title: "Close (Esc)",
          onClick: P[1] || (P[1] = (S) => s("close"))
        }, P[5] || (P[5] = [
          g("span", { class: "askai__kbd" }, "Esc", -1)
        ]))
      ]),
      C.newChatArmed && C.canStartNewChat ? (w(), Pn(uf, {
        key: 0,
        busy: C.startingNewChat,
        error: C.newChatError,
        onConfirm: P[2] || (P[2] = (S) => s("confirmNewChat")),
        onCancel: P[3] || (P[3] = (S) => s("cancelNewChat"))
      }, null, 8, ["busy", "error"])) : ne("", !0),
      g("div", {
        ref_key: "bodyEl",
        ref: i,
        class: "askai__body"
      }, [
        g("div", {
          ref_key: "contentEl",
          ref: o,
          class: "askai__content"
        }, [
          u.value ? (w(), A(Re, { key: 1 }, [
            (w(!0), A(Re, null, ht(l.value, ({ message: S, index: W }) => (w(), A("div", {
              key: W,
              class: "askai__turn",
              "aria-live": C.isStreaming(W) ? "off" : "polite"
            }, [
              S.message_type === "user" ? (w(), A("p", hg, Z(S.message), 1)) : S.message_type === "system" ? (w(), A("p", pg, Z(S.message), 1)) : (w(), A(Re, { key: 2 }, [
                g("div", {
                  class: Ne(["askai__answer", { "askai__answer--streaming": C.isStreaming(W) }]),
                  innerHTML: x(Ci)(C.isStreaming(W) ? C.displayText(W, S.message || "") : S.message || "")
                }, null, 10, mg),
                C.showCitations && !C.isStreaming(W) && S.sources && S.sources.length ? (w(), A("div", gg, [
                  P[9] || (P[9] = g("span", { class: "askai__label" }, "Sources", -1)),
                  (w(!0), A(Re, null, ht(S.sources, (se, me) => (w(), A("span", {
                    key: me,
                    class: "askai__source",
                    title: C.citationTooltip(se)
                  }, Z(C.citationLabel(se)), 9, _g))), 128))
                ])) : ne("", !0)
              ], 64))
            ], 8, dg))), 128)),
            C.loading ? (w(), A("div", yg, [
              P[10] || (P[10] = g("span", { class: "askai__dot" }, null, -1)),
              P[11] || (P[11] = g("span", { class: "askai__dot" }, null, -1)),
              P[12] || (P[12] = g("span", { class: "askai__dot" }, null, -1)),
              g("span", vg, Z(C.showCitations ? "Searching the knowledge base" : "Thinking"), 1)
            ])) : ne("", !0)
          ], 64)) : (w(), A(Re, { key: 0 }, [
            g("div", ag, [
              g("h2", lg, Z(C.welcomeTitle || `Ask ${C.agentName}`), 1),
              C.welcomeSubtitle ? (w(), A("p", cg, Z(C.welcomeSubtitle), 1)) : ne("", !0)
            ]),
            C.suggestions.length && !C.draft.trim() ? (w(), A("div", ug, [
              P[8] || (P[8] = g("p", { class: "askai__label" }, "Suggested", -1)),
              (w(!0), A(Re, null, ht(C.suggestions, (S) => (w(), A("button", {
                key: S,
                type: "button",
                class: "askai__suggestion",
                disabled: !C.inputEnabled,
                onClick: (W) => T(S)
              }, [
                g("span", null, Z(S), 1),
                P[7] || (P[7] = g("svg", {
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
                  g("path", { d: "M5 12h14M13 6l6 6-6 6" })
                ], -1))
              ], 8, fg))), 128))
            ])) : ne("", !0)
          ], 64))
        ], 512)
      ], 512),
      g("div", bg, [
        C.disclaimer ? (w(), A("span", wg, Z(C.disclaimer), 1)) : ne("", !0),
        P[13] || (P[13] = g("a", {
          class: "askai__brand",
          href: "https://chattermate.chat",
          target: "_blank",
          rel: "noopener noreferrer"
        }, "Powered by ChatterMate", -1))
      ])
    ]));
  }
}), Tg = /* @__PURE__ */ ms(kg, [["__scopeId", "data-v-edea9534"]]), Ag = 40;
function Ki(e) {
  if (typeof e == "number" || typeof e == "boolean") return String(e);
  if (typeof e != "string") return null;
  const t = e.trim();
  return t && t.length <= Ag && !t.includes(`
`) ? t : null;
}
function Sg(e) {
  var s, r;
  const t = Ki((s = e.preview) == null ? void 0 : s.before), n = Ki((r = e.preview) == null ? void 0 : r.after);
  switch (e.status) {
    case "ok":
      return e.summary ? { text: e.summary, tone: "done" } : t && n ? { text: `${e.label}: ${t} → ${n}`, tone: "done" } : { text: `${e.label}: done`, tone: "done" };
    case "declined":
      return { text: t ? `Kept ${t}` : `${e.label}: not done`, tone: "skipped" };
    case "timeout":
      return { text: `${e.label}: the page didn't respond`, tone: "failed" };
    default:
      return { text: `${e.label}: ${e.error || "it didn't work"}`, tone: "failed" };
  }
}
function xg(e, t, n, s) {
  if (!s) return { approve: e, decline: "Not now" };
  const r = Ki(t), i = Ki(n);
  return {
    approve: i ? `Change to ${i}` : "Change it",
    decline: r ? `Keep ${r}` : "Keep current"
  };
}
const Eg = ["aria-label"], Cg = { class: "cm-action-head" }, Rg = { class: "cm-action-row before" }, Ig = { class: "cm-action-text" }, Og = { class: "cm-action-row after" }, Lg = { class: "cm-action-text" }, Ng = {
  key: 1,
  class: "cm-action-args"
}, Pg = { class: "cm-action-buttons" }, Mg = /* @__PURE__ */ ps({
  __name: "ActionConfirmCard",
  props: {
    pending: {}
  },
  emits: ["approve", "decline"],
  setup(e, { emit: t }) {
    const n = e, s = t, r = ae(() => !!n.pending.preview);
    function i(u) {
      return u == null || u === "" ? "—" : typeof u == "string" ? u : JSON.stringify(u, null, 2);
    }
    function o(u) {
      const c = u.replace(/[_-]+/g, " ").trim();
      return c.charAt(0).toUpperCase() + c.slice(1);
    }
    const a = ae(
      () => n.pending.details ?? Object.entries(n.pending.request.args || {}).map(([u, c]) => ({ key: o(u), value: i(c) }))
    ), l = ae(
      () => {
        var u, c;
        return xg(n.pending.request.label, (u = n.pending.preview) == null ? void 0 : u.before, (c = n.pending.preview) == null ? void 0 : c.after, r.value);
      }
    );
    return (u, c) => {
      var b, T;
      return w(), A("div", {
        class: "cm-action-confirm",
        role: "group",
        "aria-label": u.pending.request.label
      }, [
        g("div", Cg, Z(u.pending.request.label) + "?", 1),
        r.value ? (w(), A(Re, { key: 0 }, [
          g("div", Rg, [
            c[2] || (c[2] = g("span", { class: "cm-action-tag" }, "Current", -1)),
            g("span", Ig, Z(i((b = u.pending.preview) == null ? void 0 : b.before)), 1)
          ]),
          g("div", Og, [
            c[3] || (c[3] = g("span", { class: "cm-action-tag" }, "New", -1)),
            g("span", Lg, Z(i((T = u.pending.preview) == null ? void 0 : T.after)), 1)
          ])
        ], 64)) : a.value.length ? (w(), A("dl", Ng, [
          (w(!0), A(Re, null, ht(a.value, (I) => (w(), A(Re, {
            key: I.key
          }, [
            g("dt", null, Z(I.key), 1),
            g("dd", null, Z(I.value), 1)
          ], 64))), 128))
        ])) : ne("", !0),
        g("div", Pg, [
          g("button", {
            type: "button",
            class: "cm-action-apply",
            onClick: c[0] || (c[0] = (I) => s("approve"))
          }, Z(l.value.approve), 1),
          g("button", {
            type: "button",
            class: "cm-action-cancel",
            onClick: c[1] || (c[1] = (I) => s("decline"))
          }, Z(l.value.decline), 1)
        ])
      ], 8, Eg);
    };
  }
}), Dg = /* @__PURE__ */ ms(Mg, [["__scopeId", "data-v-bdc9ad66"]]), Fg = {
  key: 0,
  class: "cm-receipt-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, $g = {
  key: 1,
  class: "cm-receipt-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, Bg = {
  key: 2,
  class: "cm-receipt-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, Ug = { class: "cm-visually-hidden" }, zg = { class: "cm-receipt-text" }, Hg = /* @__PURE__ */ ps({
  __name: "ActionReceiptLine",
  props: {
    receipt: {}
  },
  setup(e) {
    return (t, n) => (w(), A("div", {
      class: Ne(["cm-receipt", t.receipt.tone]),
      role: "status"
    }, [
      t.receipt.tone === "done" ? (w(), A("svg", Fg, n[0] || (n[0] = [
        g("circle", {
          cx: "12",
          cy: "12",
          r: "10",
          class: "fill"
        }, null, -1),
        g("path", {
          d: "M7.5 12.5l3 3 6-6.5",
          class: "tick"
        }, null, -1)
      ]))) : t.receipt.tone === "failed" ? (w(), A("svg", $g, n[1] || (n[1] = [
        g("circle", {
          cx: "12",
          cy: "12",
          r: "9",
          class: "ring"
        }, null, -1),
        g("path", {
          d: "M12 7.5v5.5M12 16.5v.01",
          class: "mark"
        }, null, -1)
      ]))) : (w(), A("svg", Bg, n[2] || (n[2] = [
        g("circle", {
          cx: "12",
          cy: "12",
          r: "9",
          class: "ring"
        }, null, -1),
        g("path", {
          d: "M8 12h8",
          class: "mark"
        }, null, -1)
      ]))),
      g("span", Ug, Z(t.receipt.tone === "done" ? "Done:" : t.receipt.tone === "failed" ? "Failed:" : "Skipped:"), 1),
      g("span", zg, Z(t.receipt.text), 1)
    ], 2));
  }
}), jg = /* @__PURE__ */ ms(Hg, [["__scopeId", "data-v-be379090"]]), Wg = { class: "cm-plan-pin" }, qg = ["aria-label"], Vg = ["aria-expanded"], Kg = { class: "cm-plan-label" }, Gg = { class: "cm-plan-name" }, Yg = {
  key: 0,
  class: "cm-plan-now"
}, Xg = { class: "cm-plan-count" }, Zg = ["aria-valuenow", "aria-valuemax", "aria-label"], Jg = {
  key: 0,
  class: "cm-plan-steps"
}, Qg = ["aria-current"], e_ = {
  key: 0,
  class: "cm-plan-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, t_ = {
  key: 1,
  class: "cm-plan-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, n_ = {
  key: 2,
  class: "cm-plan-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, s_ = { class: "cm-plan-title" }, r_ = {
  key: 3,
  class: "cm-visually-hidden"
}, i_ = { class: "cm-plan-actions" }, o_ = /* @__PURE__ */ ps({
  __name: "JourneyPlan",
  props: {
    progress: {}
  },
  emits: ["skip", "hide"],
  setup(e, { emit: t }) {
    const n = e, s = t, r = oe(!1);
    pt(() => n.progress.finished, (l) => {
      l && (r.value = !1);
    });
    const i = ae(() => Math.min(n.progress.index, n.progress.count)), o = ae(() => n.progress.count ? Math.round(i.value / n.progress.count * 100) : 0), a = ae(
      () => n.progress.titles.map((l, u) => ({
        title: l,
        state: u < i.value ? "done" : u === n.progress.index ? "now" : "todo"
      }))
    );
    return (l, u) => (w(), A("div", Wg, [
      g("section", {
        class: Ne(["cm-plan", { finished: l.progress.finished }]),
        "aria-label": `Guide: ${l.progress.name}`
      }, [
        g("button", {
          type: "button",
          class: "cm-plan-head",
          "aria-expanded": r.value,
          onClick: u[0] || (u[0] = (c) => r.value = !r.value)
        }, [
          g("span", Kg, [
            g("span", Gg, Z(l.progress.name), 1),
            !l.progress.finished && l.progress.title ? (w(), A("span", Yg, Z(l.progress.title), 1)) : ne("", !0)
          ]),
          g("span", Xg, Z(l.progress.finished ? "Done" : `${i.value} of ${l.progress.count}`), 1),
          (w(), A("svg", {
            class: Ne(["cm-plan-chevron", { open: r.value }]),
            "aria-hidden": "true",
            width: "14",
            height: "14",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2.2",
            "stroke-linecap": "round",
            "stroke-linejoin": "round"
          }, u[3] || (u[3] = [
            g("path", { d: "M6 9l6 6 6-6" }, null, -1)
          ]), 2))
        ], 8, Vg),
        g("div", {
          class: "cm-plan-bar",
          role: "progressbar",
          "aria-valuenow": i.value,
          "aria-valuemin": "0",
          "aria-valuemax": l.progress.count,
          "aria-label": `${i.value} of ${l.progress.count} done`
        }, [
          g("span", {
            style: Ee({ width: `${o.value}%` })
          }, null, 4)
        ], 8, Zg),
        r.value ? (w(), A(Re, { key: 0 }, [
          a.value.length ? (w(), A("ol", Jg, [
            (w(!0), A(Re, null, ht(a.value, (c, b) => (w(), A("li", {
              key: b,
              class: Ne(c.state),
              "aria-current": c.state === "now" ? "step" : void 0
            }, [
              c.state === "done" ? (w(), A("svg", e_, u[4] || (u[4] = [
                g("circle", {
                  cx: "12",
                  cy: "12",
                  r: "10",
                  class: "fill"
                }, null, -1),
                g("path", {
                  d: "M7.5 12.5l3 3 6-6.5",
                  class: "tick"
                }, null, -1)
              ]))) : c.state === "now" ? (w(), A("svg", t_, u[5] || (u[5] = [
                g("circle", {
                  cx: "12",
                  cy: "12",
                  r: "9",
                  class: "ring"
                }, null, -1),
                g("circle", {
                  cx: "12",
                  cy: "12",
                  r: "4",
                  class: "fill"
                }, null, -1)
              ]))) : (w(), A("svg", n_, u[6] || (u[6] = [
                g("circle", {
                  cx: "12",
                  cy: "12",
                  r: "9",
                  class: "ring todo"
                }, null, -1)
              ]))),
              g("span", s_, Z(c.title), 1),
              c.state === "done" ? (w(), A("span", r_, "(done)")) : ne("", !0)
            ], 10, Qg))), 128))
          ])) : ne("", !0),
          g("div", i_, [
            l.progress.skippable ? (w(), A("button", {
              key: 0,
              type: "button",
              onClick: u[1] || (u[1] = (c) => s("skip"))
            }, "Skip this step")) : ne("", !0),
            g("button", {
              type: "button",
              onClick: u[2] || (u[2] = (c) => s("hide"))
            }, "Hide guide")
          ])
        ], 64)) : ne("", !0)
      ], 10, qg)
    ]));
  }
}), a_ = /* @__PURE__ */ ms(o_, [["__scopeId", "data-v-016d08e3"]]), l_ = {
  class: "cm-replies",
  role: "group",
  "aria-label": "Suggested replies"
}, c_ = ["disabled", "onClick"], u_ = /* @__PURE__ */ ps({
  __name: "SuggestedReplies",
  props: {
    chips: {},
    disabled: { type: Boolean }
  },
  emits: ["pick"],
  setup(e, { emit: t }) {
    const n = t;
    return (s, r) => (w(), A("div", l_, [
      (w(!0), A(Re, null, ht(s.chips, (i) => (w(), A("button", {
        key: i.label,
        type: "button",
        class: "cm-reply",
        disabled: s.disabled,
        onClick: (o) => n("pick", i)
      }, Z(i.label), 9, c_))), 128))
    ]));
  }
}), f_ = /* @__PURE__ */ ms(u_, [["__scopeId", "data-v-7b650713"]]), d_ = 2e4, ff = "Couldn't add this to your cart. Please try again.", h_ = { status: "idle", error: null }, pa = oe(null), Ka = qr({}), ma = /* @__PURE__ */ new Map();
let p_ = 0;
const m_ = (e, t) => e.toLowerCase() === t.toLowerCase();
function g_(e, t) {
  return !!(e.cart_variant_id && t && pa.value && m_(pa.value, t));
}
function df(e) {
  return Ka[e] ?? h_;
}
function hf(e, t) {
  const n = ma.get(e);
  n && (clearTimeout(n.timer), ma.delete(e), Ka[n.variantId] = t);
}
function __(e) {
  if (df(e).status === "adding") return;
  const t = `cart-${++p_}`;
  Ka[e] = { status: "adding", error: null }, ma.set(t, {
    variantId: e,
    timer: setTimeout(() => hf(t, { status: "failed", error: ff }), d_)
  }), vt({ type: "ADD_TO_CART", requestId: t, variantId: e });
}
function Sc() {
  vt({ type: "VIEW_CART" });
}
function y_(e) {
  if (e.type === "CART_AVAILABLE")
    return pa.value = typeof e.shop == "string" && e.shop ? e.shop : null, !0;
  if (e.type === "ADD_TO_CART_DONE") {
    const t = typeof e.error == "string" && e.error ? e.error : ff;
    return hf(String(e.requestId), e.ok === !0 ? { status: "added", error: null } : { status: "failed", error: t }), !0;
  }
  return !1;
}
const v_ = { class: "cm-cart" }, b_ = ["disabled"], w_ = {
  key: 2,
  class: "cm-cart-note",
  role: "status"
}, k_ = {
  key: 3,
  class: "cm-cart-note cm-cart-error",
  role: "alert"
}, T_ = /* @__PURE__ */ ps({
  __name: "ProductCartButton",
  props: {
    variantId: {}
  },
  setup(e) {
    const t = e, n = ae(() => df(t.variantId));
    return (s, r) => (w(), A("div", v_, [
      n.value.status === "added" ? (w(), A("button", {
        key: 0,
        type: "button",
        class: "cm-cart-button",
        onClick: r[0] || (r[0] = //@ts-ignore
        (...i) => x(Sc) && x(Sc)(...i))
      }, " View cart ")) : (w(), A("button", {
        key: 1,
        type: "button",
        class: "cm-cart-button",
        disabled: n.value.status === "adding",
        onClick: r[1] || (r[1] = (i) => x(__)(s.variantId))
      }, Z(n.value.status === "adding" ? "Adding…" : "Add to cart"), 9, b_)),
      n.value.status === "added" ? (w(), A("p", w_, "Added to your cart")) : n.value.error ? (w(), A("p", k_, Z(n.value.error), 1)) : ne("", !0)
    ]));
  }
}), A_ = /* @__PURE__ */ ms(T_, [["__scopeId", "data-v-d03dc0bb"]]);
function S_(e) {
  const t = oe([]);
  function n(r) {
    t.value.push({ after: e.value.length, receipt: Sg(r) });
  }
  function s(r) {
    return t.value.filter((i) => i.after === r).map((i) => i.receipt);
  }
  return pt(() => e.value.length, (r) => {
    r === 0 ? t.value = [] : t.value.some((i) => i.after > r) && (t.value = t.value.filter((i) => i.after <= r));
  }), { receipts: t, addReceipt: n, receiptsAfter: s };
}
const x_ = "Please don't paste passwords or keys here.", E_ = [
  /\bsk-(?:proj-|ant-)?[A-Za-z0-9_-]{20,}/,
  /\bcmat_[A-Za-z0-9_-]{16,}/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{30,}/,
  /\bxox[abposr]-[A-Za-z0-9-]{10,}/
], C_ = /\b(password|passwd|pwd|passcode|api[ _-]?key|secret)\s*(?:is|:|=)\s*\S+/i, R_ = /\b(?:\d[ -]?){12,18}\d\b/g;
function I_(e) {
  let t = 0;
  for (let n = 0; n < e.length; n++) {
    let s = Number(e[e.length - 1 - n]);
    n % 2 === 1 && (s *= 2, s > 9 && (s -= 9)), t += s;
  }
  return t % 10 === 0;
}
function O_(e) {
  return e ? E_.some((t) => t.test(e)) || C_.test(e) ? !0 : (e.match(R_) || []).some((t) => {
    const n = t.replace(/\D/g, "");
    return n.length >= 13 && n.length <= 19 && I_(n);
  }) : !1;
}
const Rr = [
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
], L_ = (e) => (e || "").split("").reduce((t, n) => t + n.charCodeAt(0), 0) % Rr.length, N_ = (e) => {
  const t = Rr[(e % Rr.length + Rr.length) % Rr.length];
  return {
    background: `
            radial-gradient(circle at 32% 28%, rgba(255,255,255,0.22) 0%, transparent 42%),
            radial-gradient(circle at 68% 72%, rgba(0,0,0,0.25) 0%, transparent 38%),
            radial-gradient(ellipse at 50% 50%, ${t.stops})
        `.trim(),
    boxShadow: `0 4px 28px ${t.glow}, inset 0 1px 0 rgba(255,255,255,0.15)`,
    borderRadius: "50%"
  };
}, P_ = (e, t) => {
  const n = typeof t == "number" && Number.isFinite(t) ? t : L_(e);
  return N_(n);
}, xc = (e) => {
  var t;
  return !!((t = e == null ? void 0 : e.attributes) != null && t.end_chat);
}, Ec = "AI can make mistakes. Check important info.";
function M_(e, t = !1) {
  return e !== !1 && !t;
}
const Ho = {
  ai: "Online · replies instantly",
  human: "Online · usually replies in a few minutes",
  away: "Away · we'll reply when we're back"
};
function D_(e, t = !1) {
  return (t ? "human" : (e == null ? void 0 : e.mode) ?? "ai") === "ai" ? { text: Ho.ai, online: !0 } : (e == null ? void 0 : e.available) !== !1 ? { text: Ho.human, online: !0 } : { text: Ho.away, online: !1 };
}
const pf = (e) => !!e && (/^https?:\/\//i.test(e) || e.startsWith("data:")), F_ = (e, t) => e ? pf(e) || e.startsWith("blob:") ? e : `${t.replace(/\/api\/v1\/?$/, "")}${e.startsWith("/") ? "" : "/"}${e}` : "";
function Cc() {
  return typeof window < "u" && window.APP_CONFIG ? window.APP_CONFIG : {};
}
const Fs = {
  get API_URL() {
    return Cc().API_URL || "https://api.chattermate.chat/api/v1";
  },
  get WS_URL() {
    return Cc().WS_URL || "wss://api.chattermate.chat";
  }
};
function Gi(e) {
  return F_(e, Fs.API_URL);
}
const mf = "ctid", $_ = "identity_expired", B_ = "invalid_token", Rc = 0.8, U_ = 720 * 60 * 1e3, jo = 30 * 1e3, Wo = 1e3, as = (e) => {
  if (typeof e != "string") return e ? String(e) : null;
  const t = e.trim();
  return !t || t === "undefined" || t === "null" ? null : t;
}, Ri = (e) => {
  const t = as(e);
  if (!t) return null;
  const [, n] = t.split(".");
  if (!n) return null;
  try {
    const s = atob(n.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(s);
  } catch {
    return null;
  }
}, z_ = async (e) => {
  var t, n;
  try {
    return (n = (t = await e.json()) == null ? void 0 : t.detail) == null ? void 0 : n.code;
  } catch {
    return;
  }
}, Yi = (e = mf) => ({
  read: () => {
    try {
      return as(localStorage.getItem(e));
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
}), H_ = () => ({
  read: () => null,
  write: () => {
  },
  clear: () => {
  }
});
function j_(e = {}) {
  const t = e.store ?? Yi(), n = oe(null);
  let s = null, r = null;
  const i = () => {
    s && (clearTimeout(s), s = null);
  }, o = () => {
    const H = Ri(n.value);
    return H != null && H.exp ? Number(H.exp) - Math.floor(Date.now() / Wo) : null;
  }, a = () => {
    const H = Ri(n.value);
    if (!(H != null && H.exp)) return !1;
    const ue = H.iat ? Number(H.exp) - Number(H.iat) : 0, R = o() ?? 0;
    return ue <= 0 ? R <= 0 : R <= ue * (1 - Rc);
  }, l = (H, { persist: ue = !0 } = {}) => {
    var _e, C;
    const R = as(H), fe = !!n.value;
    if (i(), n.value = R, !R) {
      t.clear(), fe && ((_e = e.onTokenCleared) == null || _e.call(e));
      return;
    }
    ue && (t.write(R), (C = e.onTokenChanged) == null || C.call(e, R)), b();
  }, u = async (H) => {
    if (!n.value || !H) return !1;
    if (r) return r;
    const ue = n.value;
    return r = (async () => {
      var R, fe;
      try {
        const _e = await fetch(`${Fs.API_URL}/refresh-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ue}`
          },
          body: JSON.stringify({ widget_id: H })
        });
        if (_e.status === 401)
          return await z_(_e) !== B_ && ((R = e.onIdentityExpired) == null || R.call(e)), !1;
        if (!_e.ok)
          return b(jo), !1;
        const C = await _e.json(), P = as((fe = C == null ? void 0 : C.data) == null ? void 0 : fe.token);
        return P ? (l(P), !0) : !1;
      } catch {
        return b(jo), !1;
      } finally {
        r = null;
      }
    })(), r;
  }, c = async (H) => n.value ? a() ? u(H) : !0 : !1, b = (H) => {
    i();
    const ue = Ri(n.value);
    if (!(ue != null && ue.exp) || !(ue != null && ue.iat)) return;
    const R = (Number(ue.exp) - Number(ue.iat)) * Wo, fe = (o() ?? 0) * Wo, _e = H ?? Math.min(
      U_,
      Math.max(0, fe - R * (1 - Rc))
    );
    s = setTimeout(() => {
      s = null, c(T).then((C) => {
        b(C ? void 0 : jo);
      });
    }, _e);
  };
  let T = "";
  return {
    token: n,
    start: (H, ue) => {
      T = H;
      const R = as(ue) || t.read();
      l(R, { persist: !1 }), R && t.write(R);
    },
    stop: () => {
      i(), r = null;
    },
    setToken: l,
    ensureFresh: c
  };
}
const ir = window.__CM_FRAME__, gf = "null";
let Ps = !1, _f = !1, yf = null;
const Xi = () => !!ir, Ns = () => !ir || Ps && !_f, vf = () => yf, bf = (e) => {
  typeof e == "string" && e && (yf = e);
}, wf = (e) => ir ? Ps ? H_() : Yi(`${mf}:${e}`) : Yi(), W_ = () => new Promise((e) => {
  const t = (n) => {
    var r;
    if (n.source !== window.parent || ((r = n.data) == null ? void 0 : r.type) !== "HOST_INIT") return;
    window.removeEventListener("message", t);
    const s = n.origin === gf;
    e({
      origin: n.origin,
      // An opaque host can't be addressed, so nothing it hands over can be
      // answered safely: such a frame runs as an anonymous visitor.
      token: s ? null : as(n.data.token),
      pageUrl: typeof n.data.pageUrl == "string" ? n.data.pageUrl : null
    });
  };
  window.addEventListener("message", t), window.parent.postMessage({ type: "FRAME_READY" }, "*");
}), q_ = async (e) => {
  var t;
  try {
    const n = await e.json();
    return ((t = n == null ? void 0 : n.detail) == null ? void 0 : t.code) || "unavailable";
  } catch {
    return "unavailable";
  }
}, Ic = () => {
  const e = document.getElementById("app");
  e && (e.textContent = "Chat is unavailable right now.");
};
async function V_() {
  if (!ir) return !0;
  const e = new URL(window.location.href).searchParams;
  Ps = e.get("host") === "1" && window.parent !== window;
  let t, n = null;
  if (Ps) {
    const o = await W_();
    o.origin !== gf ? (kc(o.origin), n = o.origin) : (_f = !0, kc("*")), bf(o.pageUrl), t = o.token;
  } else
    t = wf(ir.widgetId).read();
  let s;
  try {
    s = await fetch(`${Fs.API_URL}/widgets/${encodeURIComponent(ir.widgetId)}/bootstrap`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...t ? { Authorization: `Bearer ${t}` } : {}
      },
      body: JSON.stringify({ host_origin: n, source: e.get("source") })
    });
  } catch {
    return Ps ? vt({ type: "WIDGET_ERROR", code: "unavailable" }) : Ic(), !1;
  }
  if (!s.ok) {
    const o = await q_(s);
    return Ps ? vt({ type: "WIDGET_ERROR", code: o }) : Ic(), !1;
  }
  const r = await s.json();
  window.__INITIAL_DATA__ = r;
  const i = as(r.initialToken);
  return Ns() && i && i !== t && vt({ type: "TOKEN_UPDATE", token: i }), !0;
}
const K_ = () => {
  Ps && vt({ type: "WIDGET_READY" });
};
function G_(e) {
  const t = ae(() => ({
    backgroundColor: "var(--cm-card)",
    color: "var(--cm-text)"
  })), n = ae(() => ({
    backgroundColor: e.value.chat_bubble_color || "#C9F24E",
    color: sr(e.value.chat_bubble_color || "#C9F24E") ? "#FFFFFF" : "#000000"
  })), s = ae(() => ({
    backgroundColor: "var(--cm-agent-bg)",
    color: "var(--cm-text)"
  })), r = ae(() => ({
    backgroundColor: "var(--cm-accent)",
    color: "var(--cm-on-accent)"
  })), i = ae(() => ({
    color: "var(--cm-text)"
  })), o = ae(() => ({
    borderBottom: "1px solid var(--cm-hairline)"
  })), a = ae(() => Gi(e.value.photo_url)), l = ae(() => {
    const u = e.value.chat_background_color || "#ffffff";
    return {
      boxShadow: `0 8px 5px ${sr(u) ? "rgba(0, 0, 0, 0.24)" : "rgba(0, 0, 0, 0.12)"}`
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
const Y_ = /* @__PURE__ */ new Set(["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]), X_ = /* @__PURE__ */ new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);
[...Y_, ...X_];
function Z_(e, t) {
  const n = oe([]), s = oe(!1), r = oe(null), i = (P) => {
    if (P === 0) return "0 Bytes";
    const S = 1024, W = ["Bytes", "KB", "MB", "GB"], se = Math.floor(Math.log(P) / Math.log(S));
    return parseFloat((P / Math.pow(S, se)).toFixed(2)) + " " + W[se];
  }, o = (P) => P.startsWith("image/"), a = (P) => P ? Gi(P) : "", l = (P) => {
    const S = P.file_url || P.url;
    return S ? Gi(S) : "";
  }, u = async (P) => {
    const S = P.target;
    S.files && S.files.length > 0 && (await H(Array.from(S.files)), S.value = "");
  }, c = async (P) => {
    var W;
    P.preventDefault();
    const S = (W = P.dataTransfer) == null ? void 0 : W.files;
    S && S.length > 0 && await H(Array.from(S));
  }, b = (P) => {
    P.preventDefault();
  }, T = (P) => {
    P.preventDefault();
  }, I = async (P) => {
    var se;
    const S = (se = P.clipboardData) == null ? void 0 : se.items;
    if (!S) return;
    const W = [];
    for (const me of Array.from(S))
      if (me.kind === "file") {
        const ge = me.getAsFile();
        ge && W.push(ge);
      }
    W.length > 0 && await H(W);
  }, O = async (P, S = 500) => new Promise((W, se) => {
    const me = new FileReader();
    me.onload = (ge) => {
      var Se;
      const Oe = new Image();
      Oe.onload = () => {
        const Ke = document.createElement("canvas");
        let Ue = Oe.width, st = Oe.height;
        const de = 1920;
        (Ue > de || st > de) && (Ue > st ? (st = st / Ue * de, Ue = de) : (Ue = Ue / st * de, st = de)), Ke.width = Ue, Ke.height = st;
        const Te = Ke.getContext("2d");
        if (!Te) {
          se(new Error("Failed to get canvas context"));
          return;
        }
        Te.drawImage(Oe, 0, 0, Ue, st);
        let ye = 0.9;
        const Ze = () => {
          Ke.toBlob((Je) => {
            if (!Je) {
              se(new Error("Failed to compress image"));
              return;
            }
            if (Je.size / 1024 > S && ye > 0.3)
              ye -= 0.1, Ze();
            else {
              const je = new FileReader();
              je.onload = () => {
                const Lt = je.result.split(",")[1];
                W({ blob: Je, base64: Lt });
              }, je.readAsDataURL(Je);
            }
          }, P.type === "image/png" ? "image/png" : "image/jpeg", ye);
        };
        Ze();
      }, Oe.onerror = () => se(new Error("Failed to load image")), Oe.src = (Se = ge.target) == null ? void 0 : Se.result;
    }, me.onerror = () => se(new Error("Failed to read file")), me.readAsDataURL(P);
  }), H = async (P) => {
    if (n.value.length >= 3) {
      alert("Maximum 3 files allowed per message");
      return;
    }
    const ge = 3 - n.value.length, Oe = P.slice(0, ge);
    P.length > ge && alert(`Only ${ge} more file(s) can be uploaded. Maximum 3 files per message.`);
    for (const Se of Oe)
      try {
        if (n.value.some((de) => de.filename === Se.name)) {
          console.warn(`File ${Se.name} is already selected`), alert(`File "${Se.name}" is already selected`);
          continue;
        }
        const Ue = Se.type.startsWith("image/"), st = Ue ? 5242880 : 10485760;
        if (Se.size > st) {
          const de = st / 1048576;
          console.error(`File ${Se.name} is too large. Maximum size is ${de}MB`), alert(`File "${Se.name}" is too large. Maximum size for ${Ue ? "images" : "documents"} is ${de}MB`);
          continue;
        }
        if (Ue)
          try {
            const { blob: de, base64: Te } = await O(Se, 500), ye = de.size;
            console.log(`Compressed ${Se.name}: ${(Se.size / 1024).toFixed(2)}KB → ${(ye / 1024).toFixed(2)}KB`), n.value.push({
              content: Te,
              filename: Se.name,
              type: Se.type,
              size: ye,
              url: URL.createObjectURL(de),
              file_url: URL.createObjectURL(de)
            });
          } catch (de) {
            console.error("Image compression failed, uploading original:", de);
            const Te = new FileReader();
            Te.onload = (ye) => {
              var lt;
              const Je = ((lt = ye.target) == null ? void 0 : lt.result).split(",")[1];
              n.value.push({
                content: Je,
                filename: Se.name,
                type: Se.type,
                size: Se.size,
                url: URL.createObjectURL(Se),
                file_url: URL.createObjectURL(Se)
              });
            }, Te.readAsDataURL(Se);
          }
        else {
          const de = new FileReader();
          de.onload = (Te) => {
            var Je;
            const Ze = ((Je = Te.target) == null ? void 0 : Je.result).split(",")[1];
            n.value.push({
              content: Ze,
              filename: Se.name,
              type: Se.type || "application/octet-stream",
              size: Se.size,
              url: "",
              file_url: ""
            });
          }, de.readAsDataURL(Se);
        }
      } catch (Ke) {
        console.error("File upload error:", Ke);
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
    handleFileSelect: u,
    handleDrop: c,
    handleDragOver: b,
    handleDragLeave: T,
    handlePaste: I,
    uploadFiles: H,
    removeAttachment: async (P) => {
      const S = n.value[P];
      if (S) {
        try {
          let W = S.url;
          if (W.startsWith("/uploads/") ? W = W.substring(9) : W.startsWith("/") && (W = W.substring(1)), pf(W))
            try {
              W = new URL(W).pathname.replace(/^\/+/, "");
            } catch {
            }
          const se = {};
          e.value && (se.Authorization = `Bearer ${e.value}`);
          const me = await fetch(`${Fs.API_URL}/files/upload/${W}`, {
            method: "DELETE",
            headers: se
          });
          if (me.ok)
            console.log("File deleted successfully from backend.");
          else {
            const ge = await me.json();
            console.error("Failed to delete file:", ge.detail);
          }
        } catch (W) {
          console.error("Error calling delete API:", W);
        }
        S.url && S.url.startsWith("blob:") && URL.revokeObjectURL(S.url), S.file_url && S.file_url.startsWith("blob:") && URL.revokeObjectURL(S.file_url), n.value.splice(P, 1);
      }
    },
    openPreview: (P) => {
      r.value = P, s.value = !0;
    },
    closePreview: () => {
      s.value = !1, setTimeout(() => {
        r.value = null;
      }, 300);
    },
    openFilePicker: () => {
      var P;
      (P = t.value) == null || P.click();
    },
    isImage: (P) => P.startsWith("image/")
  };
}
const Cn = /* @__PURE__ */ Object.create(null);
Cn.open = "0";
Cn.close = "1";
Cn.ping = "2";
Cn.pong = "3";
Cn.message = "4";
Cn.upgrade = "5";
Cn.noop = "6";
const Ii = /* @__PURE__ */ Object.create(null);
Object.keys(Cn).forEach((e) => {
  Ii[Cn[e]] = e;
});
const ga = { type: "error", data: "parser error" }, kf = typeof Blob == "function" || typeof Blob < "u" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]", Tf = typeof ArrayBuffer == "function", Af = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e && e.buffer instanceof ArrayBuffer, Ga = ({ type: e, data: t }, n, s) => kf && t instanceof Blob ? n ? s(t) : Oc(t, s) : Tf && (t instanceof ArrayBuffer || Af(t)) ? n ? s(t) : Oc(new Blob([t]), s) : s(Cn[e] + (t || "")), Oc = (e, t) => {
  const n = new FileReader();
  return n.onload = function() {
    const s = n.result.split(",")[1];
    t("b" + (s || ""));
  }, n.readAsDataURL(e);
};
function Lc(e) {
  return e instanceof Uint8Array ? e : e instanceof ArrayBuffer ? new Uint8Array(e) : new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
}
let qo;
function J_(e, t) {
  if (kf && e.data instanceof Blob)
    return e.data.arrayBuffer().then(Lc).then(t);
  if (Tf && (e.data instanceof ArrayBuffer || Af(e.data)))
    return t(Lc(e.data));
  Ga(e, !1, (n) => {
    qo || (qo = new TextEncoder()), t(qo.encode(n));
  });
}
const Nc = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", Ir = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (let e = 0; e < Nc.length; e++)
  Ir[Nc.charCodeAt(e)] = e;
const Q_ = (e) => {
  let t = e.length * 0.75, n = e.length, s, r = 0, i, o, a, l;
  e[e.length - 1] === "=" && (t--, e[e.length - 2] === "=" && t--);
  const u = new ArrayBuffer(t), c = new Uint8Array(u);
  for (s = 0; s < n; s += 4)
    i = Ir[e.charCodeAt(s)], o = Ir[e.charCodeAt(s + 1)], a = Ir[e.charCodeAt(s + 2)], l = Ir[e.charCodeAt(s + 3)], c[r++] = i << 2 | o >> 4, c[r++] = (o & 15) << 4 | a >> 2, c[r++] = (a & 3) << 6 | l & 63;
  return u;
}, ey = typeof ArrayBuffer == "function", Ya = (e, t) => {
  if (typeof e != "string")
    return {
      type: "message",
      data: Sf(e, t)
    };
  const n = e.charAt(0);
  return n === "b" ? {
    type: "message",
    data: ty(e.substring(1), t)
  } : Ii[n] ? e.length > 1 ? {
    type: Ii[n],
    data: e.substring(1)
  } : {
    type: Ii[n]
  } : ga;
}, ty = (e, t) => {
  if (ey) {
    const n = Q_(e);
    return Sf(n, t);
  } else
    return { base64: !0, data: e };
}, Sf = (e, t) => {
  switch (t) {
    case "blob":
      return e instanceof Blob ? e : new Blob([e]);
    case "arraybuffer":
    default:
      return e instanceof ArrayBuffer ? e : e.buffer;
  }
}, xf = "", ny = (e, t) => {
  const n = e.length, s = new Array(n);
  let r = 0;
  e.forEach((i, o) => {
    Ga(i, !1, (a) => {
      s[o] = a, ++r === n && t(s.join(xf));
    });
  });
}, sy = (e, t) => {
  const n = e.split(xf), s = [];
  for (let r = 0; r < n.length; r++) {
    const i = Ya(n[r], t);
    if (s.push(i), i.type === "error")
      break;
  }
  return s;
};
function ry() {
  return new TransformStream({
    transform(e, t) {
      J_(e, (n) => {
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
let Vo;
function yi(e) {
  return e.reduce((t, n) => t + n.length, 0);
}
function vi(e, t) {
  if (e[0].length === t)
    return e.shift();
  const n = new Uint8Array(t);
  let s = 0;
  for (let r = 0; r < t; r++)
    n[r] = e[0][s++], s === e[0].length && (e.shift(), s = 0);
  return e.length && s < e[0].length && (e[0] = e[0].slice(s)), n;
}
function iy(e, t) {
  Vo || (Vo = new TextDecoder());
  const n = [];
  let s = 0, r = -1, i = !1;
  return new TransformStream({
    transform(o, a) {
      for (n.push(o); ; ) {
        if (s === 0) {
          if (yi(n) < 1)
            break;
          const l = vi(n, 1);
          i = (l[0] & 128) === 128, r = l[0] & 127, r < 126 ? s = 3 : r === 126 ? s = 1 : s = 2;
        } else if (s === 1) {
          if (yi(n) < 2)
            break;
          const l = vi(n, 2);
          r = new DataView(l.buffer, l.byteOffset, l.length).getUint16(0), s = 3;
        } else if (s === 2) {
          if (yi(n) < 8)
            break;
          const l = vi(n, 8), u = new DataView(l.buffer, l.byteOffset, l.length), c = u.getUint32(0);
          if (c > Math.pow(2, 21) - 1) {
            a.enqueue(ga);
            break;
          }
          r = c * Math.pow(2, 32) + u.getUint32(4), s = 3;
        } else {
          if (yi(n) < r)
            break;
          const l = vi(n, r);
          a.enqueue(Ya(i ? l : Vo.decode(l), t)), s = 0;
        }
        if (r === 0 || r > e) {
          a.enqueue(ga);
          break;
        }
      }
    }
  });
}
const Ef = 4;
function mt(e) {
  if (e) return oy(e);
}
function oy(e) {
  for (var t in mt.prototype)
    e[t] = mt.prototype[t];
  return e;
}
mt.prototype.on = mt.prototype.addEventListener = function(e, t) {
  return this._callbacks = this._callbacks || {}, (this._callbacks["$" + e] = this._callbacks["$" + e] || []).push(t), this;
};
mt.prototype.once = function(e, t) {
  function n() {
    this.off(e, n), t.apply(this, arguments);
  }
  return n.fn = t, this.on(e, n), this;
};
mt.prototype.off = mt.prototype.removeListener = mt.prototype.removeAllListeners = mt.prototype.removeEventListener = function(e, t) {
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
mt.prototype.emit = function(e) {
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
mt.prototype.emitReserved = mt.prototype.emit;
mt.prototype.listeners = function(e) {
  return this._callbacks = this._callbacks || {}, this._callbacks["$" + e] || [];
};
mt.prototype.hasListeners = function(e) {
  return !!this.listeners(e).length;
};
const fo = typeof Promise == "function" && typeof Promise.resolve == "function" ? (t) => Promise.resolve().then(t) : (t, n) => n(t, 0), an = typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")(), ay = "arraybuffer";
function Cf(e, ...t) {
  return t.reduce((n, s) => (e.hasOwnProperty(s) && (n[s] = e[s]), n), {});
}
const ly = an.setTimeout, cy = an.clearTimeout;
function ho(e, t) {
  t.useNativeTimers ? (e.setTimeoutFn = ly.bind(an), e.clearTimeoutFn = cy.bind(an)) : (e.setTimeoutFn = an.setTimeout.bind(an), e.clearTimeoutFn = an.clearTimeout.bind(an));
}
const uy = 1.33;
function fy(e) {
  return typeof e == "string" ? dy(e) : Math.ceil((e.byteLength || e.size) * uy);
}
function dy(e) {
  let t = 0, n = 0;
  for (let s = 0, r = e.length; s < r; s++)
    t = e.charCodeAt(s), t < 128 ? n += 1 : t < 2048 ? n += 2 : t < 55296 || t >= 57344 ? n += 3 : (s++, n += 4);
  return n;
}
function Rf() {
  return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
}
function hy(e) {
  let t = "";
  for (let n in e)
    e.hasOwnProperty(n) && (t.length && (t += "&"), t += encodeURIComponent(n) + "=" + encodeURIComponent(e[n]));
  return t;
}
function py(e) {
  let t = {}, n = e.split("&");
  for (let s = 0, r = n.length; s < r; s++) {
    let i = n[s].split("=");
    t[decodeURIComponent(i[0])] = decodeURIComponent(i[1]);
  }
  return t;
}
class my extends Error {
  constructor(t, n, s) {
    super(t), this.description = n, this.context = s, this.type = "TransportError";
  }
}
class Xa extends mt {
  /**
   * Transport abstract constructor.
   *
   * @param {Object} opts - options
   * @protected
   */
  constructor(t) {
    super(), this.writable = !1, ho(this, t), this.opts = t, this.query = t.query, this.socket = t.socket, this.supportsBinary = !t.forceBase64;
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
    return super.emitReserved("error", new my(t, n, s)), this;
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
    const n = Ya(t, this.socket.binaryType);
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
    const n = hy(t);
    return n.length ? "?" + n : "";
  }
}
class gy extends Xa {
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
    sy(t, this.socket.binaryType).forEach(n), this.readyState !== "closed" && (this._polling = !1, this.emitReserved("pollComplete"), this.readyState === "open" && this._poll());
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
    this.writable = !1, ny(t, (n) => {
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
    return this.opts.timestampRequests !== !1 && (n[this.opts.timestampParam] = Rf()), !this.supportsBinary && !n.sid && (n.b64 = 1), this.createUri(t, n);
  }
}
let If = !1;
try {
  If = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest();
} catch {
}
const _y = If;
function yy() {
}
class vy extends gy {
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
class xn extends mt {
  /**
   * Request constructor
   *
   * @param {Object} options
   * @package
   */
  constructor(t, n, s) {
    super(), this.createRequest = t, ho(this, s), this._opts = s, this._method = s.method || "GET", this._uri = n, this._data = s.data !== void 0 ? s.data : null, this._create();
  }
  /**
   * Creates the XHR object and sends the request.
   *
   * @private
   */
  _create() {
    var t;
    const n = Cf(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
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
    typeof document < "u" && (this._index = xn.requestsCount++, xn.requests[this._index] = this);
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
      if (this._xhr.onreadystatechange = yy, t)
        try {
          this._xhr.abort();
        } catch {
        }
      typeof document < "u" && delete xn.requests[this._index], this._xhr = null;
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
xn.requestsCount = 0;
xn.requests = {};
if (typeof document < "u") {
  if (typeof attachEvent == "function")
    attachEvent("onunload", Pc);
  else if (typeof addEventListener == "function") {
    const e = "onpagehide" in an ? "pagehide" : "unload";
    addEventListener(e, Pc, !1);
  }
}
function Pc() {
  for (let e in xn.requests)
    xn.requests.hasOwnProperty(e) && xn.requests[e].abort();
}
const by = function() {
  const e = Of({
    xdomain: !1
  });
  return e && e.responseType !== null;
}();
class wy extends vy {
  constructor(t) {
    super(t);
    const n = t && t.forceBase64;
    this.supportsBinary = by && !n;
  }
  request(t = {}) {
    return Object.assign(t, { xd: this.xd }, this.opts), new xn(Of, this.uri(), t);
  }
}
function Of(e) {
  const t = e.xdomain;
  try {
    if (typeof XMLHttpRequest < "u" && (!t || _y))
      return new XMLHttpRequest();
  } catch {
  }
  if (!t)
    try {
      return new an[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
    } catch {
    }
}
const Lf = typeof navigator < "u" && typeof navigator.product == "string" && navigator.product.toLowerCase() === "reactnative";
class ky extends Xa {
  get name() {
    return "websocket";
  }
  doOpen() {
    const t = this.uri(), n = this.opts.protocols, s = Lf ? {} : Cf(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
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
      Ga(s, this.supportsBinary, (i) => {
        try {
          this.doWrite(s, i);
        } catch {
        }
        r && fo(() => {
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
    return this.opts.timestampRequests && (n[this.opts.timestampParam] = Rf()), this.supportsBinary || (n.b64 = 1), this.createUri(t, n);
  }
}
const Ko = an.WebSocket || an.MozWebSocket;
class Ty extends ky {
  createSocket(t, n, s) {
    return Lf ? new Ko(t, n, s) : n ? new Ko(t, n) : new Ko(t);
  }
  doWrite(t, n) {
    this.ws.send(n);
  }
}
class Ay extends Xa {
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
        const n = iy(Number.MAX_SAFE_INTEGER, this.socket.binaryType), s = t.readable.pipeThrough(n).getReader(), r = ry();
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
        r && fo(() => {
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
const Sy = {
  websocket: Ty,
  webtransport: Ay,
  polling: wy
}, xy = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/, Ey = [
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
function _a(e) {
  if (e.length > 8e3)
    throw "URI too long";
  const t = e, n = e.indexOf("["), s = e.indexOf("]");
  n != -1 && s != -1 && (e = e.substring(0, n) + e.substring(n, s).replace(/:/g, ";") + e.substring(s, e.length));
  let r = xy.exec(e || ""), i = {}, o = 14;
  for (; o--; )
    i[Ey[o]] = r[o] || "";
  return n != -1 && s != -1 && (i.source = t, i.host = i.host.substring(1, i.host.length - 1).replace(/;/g, ":"), i.authority = i.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), i.ipv6uri = !0), i.pathNames = Cy(i, i.path), i.queryKey = Ry(i, i.query), i;
}
function Cy(e, t) {
  const n = /\/{2,9}/g, s = t.replace(n, "/").split("/");
  return (t.slice(0, 1) == "/" || t.length === 0) && s.splice(0, 1), t.slice(-1) == "/" && s.splice(s.length - 1, 1), s;
}
function Ry(e, t) {
  const n = {};
  return t.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function(s, r, i) {
    r && (n[r] = i);
  }), n;
}
const ya = typeof addEventListener == "function" && typeof removeEventListener == "function", Oi = [];
ya && addEventListener("offline", () => {
  Oi.forEach((e) => e());
}, !1);
class ls extends mt {
  /**
   * Socket constructor.
   *
   * @param {String|Object} uri - uri or options
   * @param {Object} opts - options
   */
  constructor(t, n) {
    if (super(), this.binaryType = ay, this.writeBuffer = [], this._prevBufferLen = 0, this._pingInterval = -1, this._pingTimeout = -1, this._maxPayload = -1, this._pingTimeoutTime = 1 / 0, t && typeof t == "object" && (n = t, t = null), t) {
      const s = _a(t);
      n.hostname = s.host, n.secure = s.protocol === "https" || s.protocol === "wss", n.port = s.port, s.query && (n.query = s.query);
    } else n.host && (n.hostname = _a(n.host).host);
    ho(this, n), this.secure = n.secure != null ? n.secure : typeof location < "u" && location.protocol === "https:", n.hostname && !n.port && (n.port = this.secure ? "443" : "80"), this.hostname = n.hostname || (typeof location < "u" ? location.hostname : "localhost"), this.port = n.port || (typeof location < "u" && location.port ? location.port : this.secure ? "443" : "80"), this.transports = [], this._transportsByName = {}, n.transports.forEach((s) => {
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
    }, n), this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : ""), typeof this.opts.query == "string" && (this.opts.query = py(this.opts.query)), ya && (this.opts.closeOnBeforeunload && (this._beforeunloadEventListener = () => {
      this.transport && (this.transport.removeAllListeners(), this.transport.close());
    }, addEventListener("beforeunload", this._beforeunloadEventListener, !1)), this.hostname !== "localhost" && (this._offlineEventListener = () => {
      this._onClose("transport close", {
        description: "network connection lost"
      });
    }, Oi.push(this._offlineEventListener))), this.opts.withCredentials && (this._cookieJar = void 0), this._open();
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
    n.EIO = Ef, n.transport = t, this.id && (n.sid = this.id);
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
    const t = this.opts.rememberUpgrade && ls.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1 ? "websocket" : this.transports[0];
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
    this.readyState = "open", ls.priorWebsocketSuccess = this.transport.name === "websocket", this.emitReserved("open"), this.flush();
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
      if (r && (n += fy(r)), s > 0 && n > this._maxPayload)
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
    return t && (this._pingTimeoutTime = 0, fo(() => {
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
    if (ls.priorWebsocketSuccess = !1, this.opts.tryAllTransports && this.transports.length > 1 && this.readyState === "opening")
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
      if (this.clearTimeoutFn(this._pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), ya && (this._beforeunloadEventListener && removeEventListener("beforeunload", this._beforeunloadEventListener, !1), this._offlineEventListener)) {
        const s = Oi.indexOf(this._offlineEventListener);
        s !== -1 && Oi.splice(s, 1);
      }
      this.readyState = "closed", this.id = null, this.emitReserved("close", t, n), this.writeBuffer = [], this._prevBufferLen = 0;
    }
  }
}
ls.protocol = Ef;
class Iy extends ls {
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
    ls.priorWebsocketSuccess = !1;
    const r = () => {
      s || (n.send([{ type: "ping", data: "probe" }]), n.once("packet", (b) => {
        if (!s)
          if (b.type === "pong" && b.data === "probe") {
            if (this.upgrading = !0, this.emitReserved("upgrading", n), !n)
              return;
            ls.priorWebsocketSuccess = n.name === "websocket", this.transport.pause(() => {
              s || this.readyState !== "closed" && (c(), this.setTransport(n), n.send([{ type: "upgrade" }]), this.emitReserved("upgrade", n), n = null, this.upgrading = !1, this.flush());
            });
          } else {
            const T = new Error("probe error");
            T.transport = n.name, this.emitReserved("upgradeError", T);
          }
      }));
    };
    function i() {
      s || (s = !0, c(), n.close(), n = null);
    }
    const o = (b) => {
      const T = new Error("probe error: " + b);
      T.transport = n.name, i(), this.emitReserved("upgradeError", T);
    };
    function a() {
      o("transport closed");
    }
    function l() {
      o("socket closed");
    }
    function u(b) {
      n && b.name !== n.name && i();
    }
    const c = () => {
      n.removeListener("open", r), n.removeListener("error", o), n.removeListener("close", a), this.off("close", l), this.off("upgrading", u);
    };
    n.once("open", r), n.once("error", o), n.once("close", a), this.once("close", l), this.once("upgrading", u), this._upgrades.indexOf("webtransport") !== -1 && t !== "webtransport" ? this.setTimeoutFn(() => {
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
let Oy = class extends Iy {
  constructor(t, n = {}) {
    const s = typeof t == "object", r = s ? { ...t } : { ...n };
    (!r.transports || r.transports && typeof r.transports[0] == "string") && (r.transports = (r.transports || ["polling", "websocket", "webtransport"]).map((i) => Sy[i]).filter((i) => !!i)), super(s ? r : t, r);
  }
};
function Ly(e, t = "", n) {
  let s = e;
  n = n || typeof location < "u" && location, e == null && (e = n.protocol + "//" + n.host), typeof e == "string" && (e.charAt(0) === "/" && (e.charAt(1) === "/" ? e = n.protocol + e : e = n.host + e), /^(https?|wss?):\/\//.test(e) || (typeof n < "u" ? e = n.protocol + "//" + e : e = "https://" + e), s = _a(e)), s.port || (/^(http|ws)$/.test(s.protocol) ? s.port = "80" : /^(http|ws)s$/.test(s.protocol) && (s.port = "443")), s.path = s.path || "/";
  const i = s.host.indexOf(":") !== -1 ? "[" + s.host + "]" : s.host;
  return s.id = s.protocol + "://" + i + ":" + s.port + t, s.href = s.protocol + "://" + i + (n && n.port === s.port ? "" : ":" + s.port), s;
}
const Ny = typeof ArrayBuffer == "function", Py = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e.buffer instanceof ArrayBuffer, Nf = Object.prototype.toString, My = typeof Blob == "function" || typeof Blob < "u" && Nf.call(Blob) === "[object BlobConstructor]", Dy = typeof File == "function" || typeof File < "u" && Nf.call(File) === "[object FileConstructor]";
function Za(e) {
  return Ny && (e instanceof ArrayBuffer || Py(e)) || My && e instanceof Blob || Dy && e instanceof File;
}
function Li(e, t) {
  if (!e || typeof e != "object")
    return !1;
  if (Array.isArray(e)) {
    for (let n = 0, s = e.length; n < s; n++)
      if (Li(e[n]))
        return !0;
    return !1;
  }
  if (Za(e))
    return !0;
  if (e.toJSON && typeof e.toJSON == "function" && arguments.length === 1)
    return Li(e.toJSON(), !0);
  for (const n in e)
    if (Object.prototype.hasOwnProperty.call(e, n) && Li(e[n]))
      return !0;
  return !1;
}
function Fy(e) {
  const t = [], n = e.data, s = e;
  return s.data = Ni(n, t), s.attachments = t.length, { packet: s, buffers: t };
}
function Ni(e, t, n) {
  if (!e)
    return e;
  if (Za(e)) {
    const s = { _placeholder: !0, num: t.length };
    return t.push(e), s;
  } else if (Array.isArray(e)) {
    const s = new Array(e.length);
    for (let r = 0; r < e.length; r++)
      s[r] = Ni(e[r], t);
    return s;
  } else if (typeof e == "object" && !(e instanceof Date)) {
    if (e.toJSON && typeof e.toJSON == "function" && !n)
      return Ni(e.toJSON(), t, !0);
    const s = {};
    for (const r in e)
      Object.prototype.hasOwnProperty.call(e, r) && (s[r] = Ni(e[r], t));
    return s;
  }
  return e;
}
function $y(e, t) {
  return e.data = va(e.data, t), delete e.attachments, e;
}
function va(e, t) {
  if (!e)
    return e;
  if (e && e._placeholder === !0) {
    if (typeof e.num == "number" && e.num >= 0 && e.num < t.length)
      return t[e.num];
    throw new Error("illegal attachments");
  } else if (Array.isArray(e))
    for (let n = 0; n < e.length; n++)
      e[n] = va(e[n], t);
  else if (typeof e == "object")
    for (const n in e)
      Object.prototype.hasOwnProperty.call(e, n) && (e[n] = va(e[n], t));
  return e;
}
const By = [
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
var Pe;
(function(e) {
  e[e.CONNECT = 0] = "CONNECT", e[e.DISCONNECT = 1] = "DISCONNECT", e[e.EVENT = 2] = "EVENT", e[e.ACK = 3] = "ACK", e[e.CONNECT_ERROR = 4] = "CONNECT_ERROR", e[e.BINARY_EVENT = 5] = "BINARY_EVENT", e[e.BINARY_ACK = 6] = "BINARY_ACK";
})(Pe || (Pe = {}));
class Uy {
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
    return (t.type === Pe.EVENT || t.type === Pe.ACK) && Li(t) ? this.encodeAsBinary({
      type: t.type === Pe.EVENT ? Pe.BINARY_EVENT : Pe.BINARY_ACK,
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
    return (t.type === Pe.BINARY_EVENT || t.type === Pe.BINARY_ACK) && (n += t.attachments + "-"), t.nsp && t.nsp !== "/" && (n += t.nsp + ","), t.id != null && (n += t.id), t.data != null && (n += JSON.stringify(t.data, this.replacer)), n;
  }
  /**
   * Encode packet as 'buffer sequence' by removing blobs, and
   * deconstructing packet into object with placeholders and
   * a list of buffers.
   */
  encodeAsBinary(t) {
    const n = Fy(t), s = this.encodeAsString(n.packet), r = n.buffers;
    return r.unshift(s), r;
  }
}
class Ja extends mt {
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
      const s = n.type === Pe.BINARY_EVENT;
      s || n.type === Pe.BINARY_ACK ? (n.type = s ? Pe.EVENT : Pe.ACK, this.reconstructor = new zy(n)) : super.emitReserved("decoded", n);
    } else if (Za(t) || t.base64)
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
    if (Pe[s.type] === void 0)
      throw new Error("unknown packet type " + s.type);
    if (s.type === Pe.BINARY_EVENT || s.type === Pe.BINARY_ACK) {
      const i = n + 1;
      for (; t.charAt(++n) !== "-" && n != t.length; )
        ;
      const o = t.substring(i, n);
      if (o != Number(o) || t.charAt(n) !== "-")
        throw new Error("Illegal attachments");
      const a = Number(o);
      if (!Hy(a) || a < 1)
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
      if (Ja.isPayloadValid(s.type, i))
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
      case Pe.CONNECT:
        return Mc(n);
      case Pe.DISCONNECT:
        return n === void 0;
      case Pe.CONNECT_ERROR:
        return typeof n == "string" || Mc(n);
      case Pe.EVENT:
      case Pe.BINARY_EVENT:
        return Array.isArray(n) && (typeof n[0] == "number" || typeof n[0] == "string" && By.indexOf(n[0]) === -1);
      case Pe.ACK:
      case Pe.BINARY_ACK:
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
class zy {
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
      const n = $y(this.reconPack, this.buffers);
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
const Hy = Number.isInteger || function(e) {
  return typeof e == "number" && isFinite(e) && Math.floor(e) === e;
};
function Mc(e) {
  return Object.prototype.toString.call(e) === "[object Object]";
}
const jy = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Decoder: Ja,
  Encoder: Uy,
  get PacketType() {
    return Pe;
  }
}, Symbol.toStringTag, { value: "Module" }));
function pn(e, t, n) {
  return e.on(t, n), function() {
    e.off(t, n);
  };
}
const Wy = Object.freeze({
  connect: 1,
  connect_error: 1,
  disconnect: 1,
  disconnecting: 1,
  // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
  newListener: 1,
  removeListener: 1
});
class Pf extends mt {
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
      pn(t, "open", this.onopen.bind(this)),
      pn(t, "packet", this.onpacket.bind(this)),
      pn(t, "error", this.onerror.bind(this)),
      pn(t, "close", this.onclose.bind(this))
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
    if (Wy.hasOwnProperty(t))
      throw new Error('"' + t.toString() + '" is a reserved event name');
    if (n.unshift(t), this._opts.retries && !this.flags.fromQueue && !this.flags.volatile)
      return this._addToQueue(n), this;
    const o = {
      type: Pe.EVENT,
      data: n
    };
    if (o.options = {}, o.options.compress = this.flags.compress !== !1, typeof n[n.length - 1] == "function") {
      const c = this.ids++, b = n.pop();
      this._registerAckCallback(c, b), o.id = c;
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
      type: Pe.CONNECT,
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
        case Pe.CONNECT:
          t.data && t.data.sid ? this.onconnect(t.data.sid, t.data.pid) : this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
          break;
        case Pe.EVENT:
        case Pe.BINARY_EVENT:
          this.onevent(t);
          break;
        case Pe.ACK:
        case Pe.BINARY_ACK:
          this.onack(t);
          break;
        case Pe.DISCONNECT:
          this.ondisconnect();
          break;
        case Pe.CONNECT_ERROR:
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
        type: Pe.ACK,
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
    return this.connected && this.packet({ type: Pe.DISCONNECT }), this.destroy(), this.connected && this.onclose("io client disconnect"), this;
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
class ba extends mt {
  constructor(t, n) {
    var s;
    super(), this.nsps = {}, this.subs = [], t && typeof t == "object" && (n = t, t = void 0), n = n || {}, n.path = n.path || "/socket.io", this.opts = n, ho(this, n), this.reconnection(n.reconnection !== !1), this.reconnectionAttempts(n.reconnectionAttempts || 1 / 0), this.reconnectionDelay(n.reconnectionDelay || 1e3), this.reconnectionDelayMax(n.reconnectionDelayMax || 5e3), this.randomizationFactor((s = n.randomizationFactor) !== null && s !== void 0 ? s : 0.5), this.backoff = new ar({
      min: this.reconnectionDelay(),
      max: this.reconnectionDelayMax(),
      jitter: this.randomizationFactor()
    }), this.timeout(n.timeout == null ? 2e4 : n.timeout), this._readyState = "closed", this.uri = t;
    const r = n.parser || jy;
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
    this.engine = new Oy(this.uri, this.opts);
    const n = this.engine, s = this;
    this._readyState = "opening", this.skipReconnect = !1;
    const r = pn(n, "open", function() {
      s.onopen(), t && t();
    }), i = (a) => {
      this.cleanup(), this._readyState = "closed", this.emitReserved("error", a), t ? t(a) : this.maybeReconnectOnOpen();
    }, o = pn(n, "error", i);
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
      pn(t, "ping", this.onping.bind(this)),
      pn(t, "data", this.ondata.bind(this)),
      pn(t, "error", this.onerror.bind(this)),
      pn(t, "close", this.onclose.bind(this)),
      // @ts-ignore
      pn(this.decoder, "decoded", this.ondecoded.bind(this))
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
    fo(() => {
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
    return s ? this._autoConnect && !s.active && s.connect() : (s = new Pf(this, t, n), this.nsps[t] = s), s;
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
const xr = {};
function Pi(e, t) {
  typeof e == "object" && (t = e, e = void 0), t = t || {};
  const n = Ly(e, t.path || "/socket.io"), s = n.source, r = n.id, i = n.path, o = xr[r] && i in xr[r].nsps, a = t.forceNew || t["force new connection"] || t.multiplex === !1 || o;
  let l;
  return a ? l = new ba(s, t) : (xr[r] || (xr[r] = new ba(s, t)), l = xr[r]), n.query && !t.query && (t.query = n.queryKey), l.socket(n.path, t);
}
Object.assign(Pi, {
  Manager: ba,
  Socket: Pf,
  io: Pi,
  connect: Pi
});
const qy = 5e3;
function Vy() {
  const e = oe([]), t = oe(!1), n = oe(""), s = oe(!1), r = oe(!1), i = oe(!1), o = oe("connecting"), a = oe(0), l = 5, u = oe({}), c = oe(null), b = oe(""), T = [];
  let I = null;
  const O = 6e4, H = () => {
    t.value = !1, I && (clearTimeout(I), I = null);
  }, ue = () => {
    t.value = !0, I && clearTimeout(I), I = setTimeout(H, O);
  };
  let R = null;
  const fe = 1e3, _e = 15e3;
  let C = null;
  const P = /* @__PURE__ */ new Set(["ai_config_missing", ...Vu]);
  let S = !1;
  const W = oe(null), se = () => {
    C && (clearTimeout(C), C = null);
  }, me = () => {
    if (C || S) return;
    const $ = Math.min(
      fe * 2 ** Math.max(0, a.value - 1),
      _e
    );
    C = setTimeout(() => {
      C = null, R == null || R.connect();
    }, $);
  };
  let ge = null, Oe = null, Se = null, Ke = null, Ue = null, st = !1, de = null, Te, ye, Ze;
  const Je = ($) => {
    var z;
    return (z = Ri($ ?? null)) == null ? void 0 : z.sub;
  }, lt = ($) => {
    Te = $, $ && R != null && R.connected && R.emit("refresh_token", { conversation_token: $ });
  }, je = ($) => {
    ye = $;
  }, Lt = () => {
    var f;
    const $ = Te || (Xi() ? null : Yi().read()), z = {};
    $ && (z.conversation_token = $), ye && (z.widget_id = ye);
    try {
      z.page_url = vf() || (window.parent !== window && ((f = window.parent.location) != null && f.href) ? window.parent.location.href : document.referrer || window.location.href);
    } catch {
      z.page_url = document.referrer || "";
    }
    return z;
  }, gn = ($) => {
    R = Pi(`${Fs.WS_URL}/widget`, {
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
      auth: (z) => z(Lt())
    }), R.on("connect", () => {
      Ze = Je(Lt().conversation_token), o.value = "connected", se(), a.value = 0;
    }), R.on("bot_typing", () => {
      ue();
    }), R.on("disconnect", () => {
      H(), o.value === "connected" && (console.log("Socket disconnected, setting connection status to connecting"), o.value = "connecting");
    }), R.on("connect_error", (z) => {
      var y;
      const f = (y = z == null ? void 0 : z.data) == null ? void 0 : y.type;
      if (f && P.has(f)) {
        S = !0, W.value = f, se(), o.value = "failed", la(f) ? st || Ue == null || Ue() : _(z.data);
        return;
      }
      a.value++, console.error("Socket connection failed, attempt:", a.value), a.value >= l && (o.value = "failed"), R && !R.active && me();
    }), R.on("chat_response", (z) => {
      if (H(), z.session_id ? (console.log("Captured session_id from chat_response:", z.session_id), b.value = z.session_id) : console.warn("No session_id in chat_response data:", z), z.type === "agent_message") {
        const f = {
          message: z.message,
          message_type: "agent",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          session_id: "",
          agent_name: z.agent_name,
          stream: !0,
          // live reply → client-side typewriter reveal
          attributes: {
            end_chat: z.end_chat,
            end_chat_reason: z.end_chat_reason,
            end_chat_description: z.end_chat_description,
            request_rating: z.request_rating
          }
        };
        z.attachments && Array.isArray(z.attachments) && (f.id = z.message_id, f.attachments = z.attachments.map((y, N) => ({
          id: z.message_id * 1e3 + N,
          filename: y.filename,
          file_url: y.file_url,
          content_type: y.content_type,
          file_size: y.file_size
        }))), e.value.push(f);
      } else z.shopify_output && typeof z.shopify_output == "object" && z.shopify_output.products ? e.value.push({
        message: z.message,
        // Keep the accompanying text message
        message_type: "product",
        // Use 'product' type for rendering
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: "",
        agent_name: z.agent_name,
        // Assign the whole structured object
        shopify_output: z.shopify_output,
        // Remove the old flattened fields (product_id, product_title, etc.)
        attributes: {
          // Keep other attributes if needed
          end_chat: z.end_chat,
          request_rating: z.request_rating
        }
      }) : e.value.push({
        message: z.message,
        message_type: "bot",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: "",
        agent_name: z.agent_name,
        stream: !0,
        // live reply → client-side typewriter reveal
        // Knowledge-base citations (display gated by show_citations in the widget)
        sources: Array.isArray(z.sources) && z.sources.length ? z.sources : void 0,
        attributes: {
          end_chat: z.end_chat,
          end_chat_reason: z.end_chat_reason,
          end_chat_description: z.end_chat_description,
          request_rating: z.request_rating
        }
      });
    }), R.on("handle_taken_over", (z) => {
      e.value.push({
        message: `${z.user_name} joined the conversation`,
        message_type: "system",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: z.session_id
      }), u.value = {
        ...u.value,
        human_agent_name: z.user_name,
        human_agent_profile_pic: z.profile_picture
      }, H(), ge && ge(z);
    }), R.on("session_initialized", (z) => {
      z.session_id && (b.value = z.session_id, de = {
        session_id: z.session_id,
        authenticated: !!z.authenticated,
        created: !!z.created
      }, Ke == null || Ke(de));
    }), R.on("error", _);
    for (const [z, f] of T) R.on(z, f);
    return R.on("chat_history", v), R.on("rating_submitted", L), R.on("display_form", D), R.on("form_submitted", U), R.on("workflow_state", M), R.on("workflow_proceeded", X), R;
  }, Me = async () => {
    try {
      return R != null && R.connected && Ze && Ze === Je(Lt().conversation_token) ? (o.value = "connected", !0) : (o.value = "connecting", a.value = 0, H(), se(), S = !1, W.value = null, R && (R.removeAllListeners(), R.disconnect(), R = null), st = !0, R = gn(""), new Promise(($) => {
        const z = (f) => {
          st = !1, $(f);
        };
        R == null || R.on("connect", () => {
          z(!0);
        }), R == null || R.on("connect_error", () => {
          (S || a.value >= l) && z(!1);
        });
      }));
    } catch ($) {
      return console.error("Socket initialization failed:", $), st = !1, o.value = "failed", !1;
    }
  }, wt = () => (R && R.disconnect(), Me()), Bt = ($) => {
    ge = $;
  }, jt = ($) => {
    Ue = $;
  }, Wt = ($) => {
    Ke = $, de && $(de);
  }, Nt = ($) => {
    Oe = $;
  }, _n = ($) => {
    Se = $;
  }, _ = ($) => {
    H(), n.value = Cp($), s.value = !0, setTimeout(() => {
      s.value = !1, n.value = "";
    }, 5e3);
  }, v = ($) => {
    if ($.type === "chat_history" && Array.isArray($.messages)) {
      const z = $.messages.map((f) => {
        var N, E;
        const y = {
          message: f.message,
          message_type: f.message_type,
          created_at: f.created_at,
          session_id: "",
          agent_name: f.agent_name || "",
          user_name: f.user_name || "",
          attributes: f.attributes || {},
          attachments: f.attachments || []
          // Include attachments
        };
        return Array.isArray((N = f.attributes) == null ? void 0 : N.sources) && f.attributes.sources.length && (y.sources = f.attributes.sources), (E = f.attributes) != null && E.shopify_output && typeof f.attributes.shopify_output == "object" ? {
          ...y,
          message_type: "product",
          shopify_output: f.attributes.shopify_output
        } : y;
      });
      e.value = [
        ...z.filter(
          (f) => !e.value.some(
            (y) => y.message === f.message && y.created_at === f.created_at
          )
        ),
        ...e.value
      ];
    }
  }, L = ($) => {
    $.success && e.value.push({
      message: "Thank you for your feedback!",
      message_type: "system",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: ""
    });
  }, D = ($) => {
    var z;
    console.log("Form display handler in composable:", $), H(), c.value = $.form_data, console.log("Set currentForm in handleDisplayForm:", c.value), ((z = $.form_data) == null ? void 0 : z.form_full_screen) === !0 ? (console.log("Full screen form detected, triggering workflow state callback"), Oe && Oe({
      type: "form",
      form_data: $.form_data,
      session_id: $.session_id
    })) : e.value.push({
      message: "",
      message_type: "form",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: $.session_id,
      attributes: {
        form_data: $.form_data
      }
    });
  }, U = ($) => {
    console.log("Form submitted confirmation received, clearing currentForm"), c.value = null, $.success && console.log("Form submitted successfully");
  }, M = ($) => {
    console.log("Workflow state received in composable:", $), ($.type === "form" || $.type === "display_form") && (console.log("Setting currentForm from workflow state:", $.form_data), c.value = $.form_data), Oe && Oe($);
  }, X = ($) => {
    console.log("Workflow proceeded in composable:", $), Se && Se($);
  }, V = async ($, z) => {
    !R || !$ || R.emit("submit_rating", {
      rating: $,
      feedback: z
    });
  }, K = async ($) => {
    var y;
    if (console.log("Submitting form in socket:", $), console.log("Current form in socket:", c.value), console.log("Socket in socket:", R), !R) {
      console.error("No socket available for form submission");
      return;
    }
    if (!$ || Object.keys($).length === 0) {
      console.error("No form data to submit");
      return;
    }
    const f = ((y = c.value) == null ? void 0 : y.form_type) === "contact" ? "submit_contact_info" : "submit_form";
    console.log(`Emitting ${f} event with data:`, $), R.emit(f, {
      form_data: $
    }), c.value = null;
  }, j = async () => {
    R && (console.log("Getting workflow state 12"), R.emit("get_workflow_state"));
  }, re = async () => {
    R && R.emit("proceed_workflow", {});
  }, J = async ($, z, f = [], y = {}) => {
    if (!R || !$.trim() && f.length === 0) return;
    const N = {
      message: $,
      message_type: "user",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: ""
    };
    f.length > 0 && (N.attachments = f.map((E, q) => {
      let te = "";
      if (E.content_type.startsWith("image/")) {
        const ie = atob(E.content), xe = new Array(ie.length);
        for (let Le = 0; Le < ie.length; Le++)
          xe[Le] = ie.charCodeAt(Le);
        const Ie = new Uint8Array(xe), ze = new Blob([Ie], { type: E.content_type });
        te = URL.createObjectURL(ze);
      }
      return {
        id: Date.now() * 1e3 + q,
        // Temporary ID
        filename: E.filename,
        file_url: te,
        // Temporary blob URL, will be replaced
        content_type: E.content_type,
        file_size: E.size,
        _isTemporary: !0
        // Flag to identify temporary attachments
      };
    })), e.value.push(N), R.emit("chat", {
      ...y,
      message: $,
      email: z,
      files: f
      // Send files with base64 content
    }), i.value = !0;
  }, Q = () => {
    e.value = [], i.value = !1, b.value = "", H(), c.value = null;
  };
  return {
    messages: e,
    loading: t,
    errorMessage: n,
    showError: s,
    loadingHistory: r,
    hasStartedChat: i,
    connectionStatus: o,
    sendMessage: J,
    endChat: ($ = "CUSTOMER_REQUEST") => new Promise((z) => {
      if (!R || !R.connected) {
        z(!1);
        return;
      }
      let f = !1;
      const y = (te) => {
        f || (f = !0, clearTimeout(q), R == null || R.off("chat_ended", N), R == null || R.off("error", E), te && Q(), z(te));
      }, N = () => y(!0), E = (te) => {
        (te == null ? void 0 : te.type) === "end_chat_error" && y(!1);
      }, q = setTimeout(() => y(!1), qy);
      R.on("chat_ended", N), R.on("error", E), R.emit("end_chat", { reason: $ });
    }),
    loadChatHistory: async () => {
      if (R)
        try {
          r.value = !0, R.emit("get_chat_history");
        } catch ($) {
          console.error("Failed to load chat history:", $);
        } finally {
          r.value = !1;
        }
    },
    connect: Me,
    reconnect: wt,
    cleanup: () => {
      H(), se(), R && (R.removeAllListeners(), R.disconnect(), R = null), ge = null, Oe = null, Se = null;
    },
    humanAgent: u,
    onTakeover: Bt,
    onSessionState: Wt,
    onReauthorize: jt,
    refusal: W,
    submitRating: V,
    currentForm: c,
    submitForm: K,
    getWorkflowState: j,
    proceedWorkflow: re,
    onWorkflowState: Nt,
    onWorkflowProceeded: _n,
    currentSessionId: b,
    setToken: lt,
    setWidgetId: je,
    on: ($, z) => {
      T.push([$, z]), R == null || R.on($, z);
    },
    emit: ($, z) => {
      R == null || R.emit($, z);
    }
  };
}
const Ky = 8, Gy = 200;
function Yy(e) {
  const t = e && typeof e == "object" ? e.details : null;
  if (!t || typeof t != "object" || Array.isArray(t)) return null;
  const n = Object.entries(t).filter(([s, r]) => s.trim() && ["string", "number", "boolean"].includes(typeof r) && String(r).trim()).slice(0, Ky).map(([s, r]) => ({ key: s.trim().slice(0, 60), value: String(r).trim().slice(0, Gy) }));
  return n.length ? n : null;
}
const Xy = 140;
function Zy(e) {
  const t = e && typeof e == "object" ? e.summary : null;
  return typeof t == "string" && t.trim() ? t.trim().slice(0, Xy) : null;
}
const Jy = 2e3, Qy = 4;
function ev(e) {
  if (typeof e.message != "string" || !e.message.trim()) return null;
  const t = Array.isArray(e.suggestions) ? e.suggestions.filter((n) => typeof n == "string" && !!n.trim()).map((n) => ({ label: n.slice(0, 80), kind: "text", value: n.slice(0, 500) })).slice(0, Qy) : [];
  return { message: e.message.slice(0, Jy), chips: t, open: e.open === !0, source: "host" };
}
const tv = 2e3;
function nv(e) {
  const t = e.setTimer ?? ((S, W) => setTimeout(S, W)), n = e.clearTimer ?? ((S) => clearTimeout(S));
  let s = [], r = null, i = null;
  const o = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map();
  function u() {
    const S = e.trustedHostOrigin();
    S && s.length && e.emit("actions_available", { names: s, host_origin: S }), r && e.emit("set_context", { context: r });
  }
  function c(S) {
    s = Array.isArray(S) ? S.filter((W) => typeof W == "string") : [], u();
  }
  function b(S) {
    r = S && typeof S == "object" && !Array.isArray(S) ? S : null, r && e.emit("set_context", { context: r });
  }
  function T(S, W, se, me = {}) {
    var ge;
    (ge = e.onOutcome) == null || ge.call(e, {
      label: S,
      status: W,
      preview: se,
      summary: W === "ok" ? Zy(me.result) : null,
      error: typeof me.error == "string" && me.error ? me.error : null
    });
  }
  function I(S, W, se = {}) {
    const me = o.get(S);
    me && (n(me.timer), T(me.label, W, me.preview, se)), o.delete(S);
    const ge = a.get(S);
    if (ge) {
      a.delete(S), ge(W);
      return;
    }
    const Oe = (me == null ? void 0 : me.confirmed) ?? void 0;
    e.emit("action_result", { call_id: S, status: W, confirmed: Oe, ...se });
  }
  function O(S) {
    const W = i && S ? a.get(i.request.call_id) : void 0;
    W && i && (a.delete(i.request.call_id), W("declined")), i = S, e.onConfirmChange(S);
  }
  function H(S, W, se = null) {
    const me = Math.max(1, S.timeout_s) * 1e3 + tv;
    o.set(S.call_id, {
      timer: t(() => I(S.call_id, "timeout"), me),
      confirmed: W,
      label: S.label,
      preview: se
    }), e.postToHost({
      type: "ACTION_RUN",
      callId: S.call_id,
      name: S.name,
      args: S.args,
      timeoutS: S.timeout_s
    });
  }
  function ue(S) {
    if (!(!S || typeof S.call_id != "string") && !(o.has(S.call_id) || l.has(S.call_id) || (i == null ? void 0 : i.request.call_id) === S.call_id)) {
      if (S.confirm === "always") {
        O({ request: S, preview: null, details: null }), l.set(S.call_id, S), e.postToHost({ type: "ACTION_PREVIEW", callId: S.call_id, name: S.name, args: S.args });
        return;
      }
      if (S.confirm === "when_overwriting") {
        l.set(S.call_id, S), e.postToHost({ type: "ACTION_PREVIEW", callId: S.call_id, name: S.name, args: S.args });
        return;
      }
      H(S, null);
    }
  }
  function R(S) {
    var W;
    switch (S.type) {
      case "HOST_ACTIONS":
        return c(S.names), !0;
      case "HOST_CONTEXT":
        return b(S.context), !0;
      case "HOST_PROMPT": {
        const se = ev(S);
        return se && ((W = e.onPrompt) == null || W.call(e, se)), !0;
      }
      case "ACTION_PREVIEW_DONE": {
        const se = l.get(String(S.callId));
        if (!se) return !0;
        if (l.delete(se.call_id), se.confirm === "always") {
          const ge = Yy(S.preview);
          return ge && (i == null ? void 0 : i.request.call_id) === se.call_id && (i = { ...i, details: ge }, e.onConfirmChange(i)), !0;
        }
        const me = S.preview;
        return me && typeof me == "object" ? O({ request: se, preview: me, details: null }) : H(se, null), !0;
      }
      case "ACTION_DONE": {
        const se = String(S.callId);
        if (!o.has(se)) return !0;
        const me = ["ok", "error", "timeout"].includes(S.status) ? S.status : "error";
        return I(se, me, {
          result: me === "ok" ? S.result : void 0,
          error: typeof S.error == "string" ? S.error : void 0
        }), !0;
      }
      default:
        return !1;
    }
  }
  function fe() {
    if (!i) return;
    const { request: S, preview: W } = i;
    O(null), l.delete(S.call_id), H(S, !0, W);
  }
  function _e() {
    if (!i) return;
    const { request: S, preview: W } = i;
    O(null), l.delete(S.call_id), T(S.label, "declined", W);
    const se = a.get(S.call_id);
    if (se) {
      a.delete(S.call_id), se("declined");
      return;
    }
    e.emit("action_result", { call_id: S.call_id, status: "declined", confirmed: !1 });
  }
  function C(S, W) {
    if (S.kind !== "action" || !S.action || i || a.size > 0 || o.size > 0 || l.size > 0) return !1;
    const se = `chip-${S.value}-${Date.now()}`;
    return a.set(se, W), ue({
      call_id: se,
      name: S.value,
      label: S.action.label,
      args: {},
      confirm: S.action.confirm,
      timeout_s: S.action.timeout_s
    }), !0;
  }
  function P() {
    for (const S of o.values()) n(S.timer);
    o.clear(), l.clear(), a.clear(), O(null);
  }
  return { announce: u, handleRequest: ue, handleHostMessage: R, approve: fe, decline: _e, runLocal: C, dispose: P };
}
function sv(e, t, n) {
  const s = oe(null), r = nv({
    postToHost: vt,
    emit: e.emit,
    // Actions need a page whose origin we know: the framed widget with a real host.
    trustedHostOrigin: () => {
      if (!Xi()) return null;
      const o = cf();
      return o === "*" ? null : o;
    },
    onConfirmChange: (o) => {
      s.value = o;
    },
    onPrompt: t,
    onOutcome: n
  });
  e.on("action_request", (o) => r.handleRequest(o)), e.on("session_initialized", () => r.announce());
  const i = (o) => {
    o.source === window.parent && (!o.data || typeof o.data.type != "string" || r.handleHostMessage(o.data));
  };
  return window.addEventListener("message", i), io(() => {
    window.removeEventListener("message", i), r.dispose();
  }), { pendingConfirm: s, approveAction: r.approve, declineAction: r.decline, runLocalAction: r.runLocal };
}
function Dc(e, t) {
  var r;
  const n = (r = e.step_titles) != null && r.length ? e.step_titles : [], s = n.length || e.step_count;
  return {
    name: e.journey_name,
    index: t ? s : e.step_index ?? 0,
    count: s,
    titles: n,
    title: e.title ?? n[e.step_index ?? 0] ?? "",
    skippable: !t && !e.waiting && !!e.skippable,
    finished: t
  };
}
const rv = 6e4;
function iv(e) {
  const t = e.setTimer ?? ((I, O) => setTimeout(I, O)), n = e.clearTimer ?? ((I) => clearTimeout(I));
  let s = null, r = null;
  function i() {
    s !== null && n(s), s = null;
  }
  let o = null, a = null;
  function l() {
    i();
    const I = a;
    !I || r === I.stepId || (o = I.stepId, s = t(() => {
      s = null, r = I.stepId, e.addNotice(I.nudge.message, "message");
    }, I.nudge.after_min * rv));
  }
  function u(I) {
    if (a = I.nudge && I.step_id ? { stepId: I.step_id, nudge: I.nudge } : null, !a) {
      i(), o = null;
      return;
    }
    o === a.stepId && s !== null || l();
  }
  let c = !1;
  function b(I) {
    var ue;
    const O = (I == null ? void 0 : I.view) ?? null;
    if ((ue = O == null ? void 0 : O.notice) != null && ue.text && e.addNotice(O.notice.text, O.notice.kind), !O && c) return;
    if (c = !!(O != null && O.finished) && !!O.journey_name, !O || O.finished || O.waiting) {
      i(), a = null, o = null;
      const R = O != null && O.journey_name ? Dc(O, !!O.finished) : null;
      e.showStep(null, R), O != null && O.finished && O.message && e.addNotice(O.message, "message");
      return;
    }
    const H = O.message ? { message: O.message, chips: O.chips ?? [], open: !1, source: "journey" } : null;
    e.showStep(H, Dc(O, !1)), O.fresh && O.auto_open && e.openChat(), u(O);
  }
  function T() {
    s !== null && l();
  }
  return {
    handleState: b,
    activity: T,
    sync: (I = {}) => e.emit("journey_sync", I),
    skip: () => e.emit("journey_skip", {}),
    dismiss: () => {
      c = !1, e.showStep(null, null), e.emit("journey_dismiss", {});
    },
    start: (I) => e.emit("journey_start", { key: I }),
    dispose: i
  };
}
function ov(e) {
  const t = oe(null), n = oe(!1);
  let s = !1;
  const r = [], o = iv({
    emit: (u, c) => {
      s ? e.emit(u, c) : r.push([u, c]);
    },
    showStep: (u, c) => {
      t.value = c;
      const b = e.currentPrompt();
      b && b.source !== "journey" || e.showPrompt(u);
    },
    addNotice: e.addNotice,
    openChat: () => vt({ type: "WIDGET_OPEN_REQUEST" })
  });
  e.on("journey_state", o.handleState), e.on("session_initialized", () => {
    s = !0, o.sync({ url: vf() });
    for (const [u, c] of r.splice(0)) e.emit(u, c);
  });
  const a = (u) => {
    if (u.source !== window.parent) return;
    const c = u.data;
    !c || typeof c.type != "string" || (c.type === "HOST_PAGE" && typeof c.url == "string" && o.sync({ url: c.url }), c.type === "HOST_CONTEXT" && o.sync({}), c.type === "HOST_EVENT" && typeof c.event == "string" && o.sync({ event: c.event }), c.type === "HOST_JOURNEY_START" && typeof c.key == "string" && o.start(c.key));
  };
  window.addEventListener("message", a);
  function l(u, c) {
    if (o.activity(), u.kind === "text") {
      c(u.value);
      return;
    }
    if (n.value) return;
    e.runLocalAction(u, (T) => {
      n.value = !1, T === "ok" && o.sync({ action: u.value });
    }) && (n.value = !0);
  }
  return io(() => {
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
const bi = (e, t) => Be(e) === Be(t);
function av(e, t) {
  let n;
  const s = Ud(null), r = () => {
    n = e.value[e.value.length - 1], s.value = null;
  };
  return pt(() => {
    var l;
    return (l = t.value) == null ? void 0 : l.message;
  }, r), pt(e, (l) => {
    (!s.value || !l.some((u) => bi(u, s.value))) && r();
  }, { flush: "sync" }), pt(() => e.value.length, () => {
    if (!t.value || s.value) return;
    const l = e.value, u = l[l.findIndex((c) => bi(c, n)) + 1];
    u && (s.value = u);
  }), { isBefore: (l) => !!t.value && bi(l, s.value), isLast: () => !!t.value && !s.value, index: () => {
    const l = e.value.findIndex((u) => bi(u, s.value));
    return l === -1 ? e.value.length : l;
  } };
}
function lv(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Go = { exports: {} }, Fc;
function cv() {
  return Fc || (Fc = 1, function(e) {
    (function() {
      function t(f, y, N) {
        return f.call.apply(f.bind, arguments);
      }
      function n(f, y, N) {
        if (!f) throw Error();
        if (2 < arguments.length) {
          var E = Array.prototype.slice.call(arguments, 2);
          return function() {
            var q = Array.prototype.slice.call(arguments);
            return Array.prototype.unshift.apply(q, E), f.apply(y, q);
          };
        }
        return function() {
          return f.apply(y, arguments);
        };
      }
      function s(f, y, N) {
        return s = Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1 ? t : n, s.apply(null, arguments);
      }
      var r = Date.now || function() {
        return +/* @__PURE__ */ new Date();
      };
      function i(f, y) {
        this.a = f, this.o = y || f, this.c = this.o.document;
      }
      var o = !!window.FontFace;
      function a(f, y, N, E) {
        if (y = f.c.createElement(y), N) for (var q in N) N.hasOwnProperty(q) && (q == "style" ? y.style.cssText = N[q] : y.setAttribute(q, N[q]));
        return E && y.appendChild(f.c.createTextNode(E)), y;
      }
      function l(f, y, N) {
        f = f.c.getElementsByTagName(y)[0], f || (f = document.documentElement), f.insertBefore(N, f.lastChild);
      }
      function u(f) {
        f.parentNode && f.parentNode.removeChild(f);
      }
      function c(f, y, N) {
        y = y || [], N = N || [];
        for (var E = f.className.split(/\s+/), q = 0; q < y.length; q += 1) {
          for (var te = !1, ie = 0; ie < E.length; ie += 1) if (y[q] === E[ie]) {
            te = !0;
            break;
          }
          te || E.push(y[q]);
        }
        for (y = [], q = 0; q < E.length; q += 1) {
          for (te = !1, ie = 0; ie < N.length; ie += 1) if (E[q] === N[ie]) {
            te = !0;
            break;
          }
          te || y.push(E[q]);
        }
        f.className = y.join(" ").replace(/\s+/g, " ").replace(/^\s+|\s+$/, "");
      }
      function b(f, y) {
        for (var N = f.className.split(/\s+/), E = 0, q = N.length; E < q; E++) if (N[E] == y) return !0;
        return !1;
      }
      function T(f) {
        return f.o.location.hostname || f.a.location.hostname;
      }
      function I(f, y, N) {
        function E() {
          xe && q && te && (xe(ie), xe = null);
        }
        y = a(f, "link", { rel: "stylesheet", href: y, media: "all" });
        var q = !1, te = !0, ie = null, xe = N || null;
        o ? (y.onload = function() {
          q = !0, E();
        }, y.onerror = function() {
          q = !0, ie = Error("Stylesheet failed to load"), E();
        }) : setTimeout(function() {
          q = !0, E();
        }, 0), l(f, "head", y);
      }
      function O(f, y, N, E) {
        var q = f.c.getElementsByTagName("head")[0];
        if (q) {
          var te = a(f, "script", { src: y }), ie = !1;
          return te.onload = te.onreadystatechange = function() {
            ie || this.readyState && this.readyState != "loaded" && this.readyState != "complete" || (ie = !0, N && N(null), te.onload = te.onreadystatechange = null, te.parentNode.tagName == "HEAD" && q.removeChild(te));
          }, q.appendChild(te), setTimeout(function() {
            ie || (ie = !0, N && N(Error("Script load timeout")));
          }, E || 5e3), te;
        }
        return null;
      }
      function H() {
        this.a = 0, this.c = null;
      }
      function ue(f) {
        return f.a++, function() {
          f.a--, fe(f);
        };
      }
      function R(f, y) {
        f.c = y, fe(f);
      }
      function fe(f) {
        f.a == 0 && f.c && (f.c(), f.c = null);
      }
      function _e(f) {
        this.a = f || "-";
      }
      _e.prototype.c = function(f) {
        for (var y = [], N = 0; N < arguments.length; N++) y.push(arguments[N].replace(/[\W_]+/g, "").toLowerCase());
        return y.join(this.a);
      };
      function C(f, y) {
        this.c = f, this.f = 4, this.a = "n";
        var N = (y || "n4").match(/^([nio])([1-9])$/i);
        N && (this.a = N[1], this.f = parseInt(N[2], 10));
      }
      function P(f) {
        return se(f) + " " + (f.f + "00") + " 300px " + S(f.c);
      }
      function S(f) {
        var y = [];
        f = f.split(/,\s*/);
        for (var N = 0; N < f.length; N++) {
          var E = f[N].replace(/['"]/g, "");
          E.indexOf(" ") != -1 || /^\d/.test(E) ? y.push("'" + E + "'") : y.push(E);
        }
        return y.join(",");
      }
      function W(f) {
        return f.a + f.f;
      }
      function se(f) {
        var y = "normal";
        return f.a === "o" ? y = "oblique" : f.a === "i" && (y = "italic"), y;
      }
      function me(f) {
        var y = 4, N = "n", E = null;
        return f && ((E = f.match(/(normal|oblique|italic)/i)) && E[1] && (N = E[1].substr(0, 1).toLowerCase()), (E = f.match(/([1-9]00|normal|bold)/i)) && E[1] && (/bold/i.test(E[1]) ? y = 7 : /[1-9]00/.test(E[1]) && (y = parseInt(E[1].substr(0, 1), 10)))), N + y;
      }
      function ge(f, y) {
        this.c = f, this.f = f.o.document.documentElement, this.h = y, this.a = new _e("-"), this.j = y.events !== !1, this.g = y.classes !== !1;
      }
      function Oe(f) {
        f.g && c(f.f, [f.a.c("wf", "loading")]), Ke(f, "loading");
      }
      function Se(f) {
        if (f.g) {
          var y = b(f.f, f.a.c("wf", "active")), N = [], E = [f.a.c("wf", "loading")];
          y || N.push(f.a.c("wf", "inactive")), c(f.f, N, E);
        }
        Ke(f, "inactive");
      }
      function Ke(f, y, N) {
        f.j && f.h[y] && (N ? f.h[y](N.c, W(N)) : f.h[y]());
      }
      function Ue() {
        this.c = {};
      }
      function st(f, y, N) {
        var E = [], q;
        for (q in y) if (y.hasOwnProperty(q)) {
          var te = f.c[q];
          te && E.push(te(y[q], N));
        }
        return E;
      }
      function de(f, y) {
        this.c = f, this.f = y, this.a = a(this.c, "span", { "aria-hidden": "true" }, this.f);
      }
      function Te(f) {
        l(f.c, "body", f.a);
      }
      function ye(f) {
        return "display:block;position:absolute;top:-9999px;left:-9999px;font-size:300px;width:auto;height:auto;line-height:normal;margin:0;padding:0;font-variant:normal;white-space:nowrap;font-family:" + S(f.c) + ";" + ("font-style:" + se(f) + ";font-weight:" + (f.f + "00") + ";");
      }
      function Ze(f, y, N, E, q, te) {
        this.g = f, this.j = y, this.a = E, this.c = N, this.f = q || 3e3, this.h = te || void 0;
      }
      Ze.prototype.start = function() {
        var f = this.c.o.document, y = this, N = r(), E = new Promise(function(ie, xe) {
          function Ie() {
            r() - N >= y.f ? xe() : f.fonts.load(P(y.a), y.h).then(function(ze) {
              1 <= ze.length ? ie() : setTimeout(Ie, 25);
            }, function() {
              xe();
            });
          }
          Ie();
        }), q = null, te = new Promise(function(ie, xe) {
          q = setTimeout(xe, y.f);
        });
        Promise.race([te, E]).then(function() {
          q && (clearTimeout(q), q = null), y.g(y.a);
        }, function() {
          y.j(y.a);
        });
      };
      function Je(f, y, N, E, q, te, ie) {
        this.v = f, this.B = y, this.c = N, this.a = E, this.s = ie || "BESbswy", this.f = {}, this.w = q || 3e3, this.u = te || null, this.m = this.j = this.h = this.g = null, this.g = new de(this.c, this.s), this.h = new de(this.c, this.s), this.j = new de(this.c, this.s), this.m = new de(this.c, this.s), f = new C(this.a.c + ",serif", W(this.a)), f = ye(f), this.g.a.style.cssText = f, f = new C(this.a.c + ",sans-serif", W(this.a)), f = ye(f), this.h.a.style.cssText = f, f = new C("serif", W(this.a)), f = ye(f), this.j.a.style.cssText = f, f = new C("sans-serif", W(this.a)), f = ye(f), this.m.a.style.cssText = f, Te(this.g), Te(this.h), Te(this.j), Te(this.m);
      }
      var lt = { D: "serif", C: "sans-serif" }, je = null;
      function Lt() {
        if (je === null) {
          var f = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent);
          je = !!f && (536 > parseInt(f[1], 10) || parseInt(f[1], 10) === 536 && 11 >= parseInt(f[2], 10));
        }
        return je;
      }
      Je.prototype.start = function() {
        this.f.serif = this.j.a.offsetWidth, this.f["sans-serif"] = this.m.a.offsetWidth, this.A = r(), Me(this);
      };
      function gn(f, y, N) {
        for (var E in lt) if (lt.hasOwnProperty(E) && y === f.f[lt[E]] && N === f.f[lt[E]]) return !0;
        return !1;
      }
      function Me(f) {
        var y = f.g.a.offsetWidth, N = f.h.a.offsetWidth, E;
        (E = y === f.f.serif && N === f.f["sans-serif"]) || (E = Lt() && gn(f, y, N)), E ? r() - f.A >= f.w ? Lt() && gn(f, y, N) && (f.u === null || f.u.hasOwnProperty(f.a.c)) ? Bt(f, f.v) : Bt(f, f.B) : wt(f) : Bt(f, f.v);
      }
      function wt(f) {
        setTimeout(s(function() {
          Me(this);
        }, f), 50);
      }
      function Bt(f, y) {
        setTimeout(s(function() {
          u(this.g.a), u(this.h.a), u(this.j.a), u(this.m.a), y(this.a);
        }, f), 0);
      }
      function jt(f, y, N) {
        this.c = f, this.a = y, this.f = 0, this.m = this.j = !1, this.s = N;
      }
      var Wt = null;
      jt.prototype.g = function(f) {
        var y = this.a;
        y.g && c(y.f, [y.a.c("wf", f.c, W(f).toString(), "active")], [y.a.c("wf", f.c, W(f).toString(), "loading"), y.a.c("wf", f.c, W(f).toString(), "inactive")]), Ke(y, "fontactive", f), this.m = !0, Nt(this);
      }, jt.prototype.h = function(f) {
        var y = this.a;
        if (y.g) {
          var N = b(y.f, y.a.c("wf", f.c, W(f).toString(), "active")), E = [], q = [y.a.c("wf", f.c, W(f).toString(), "loading")];
          N || E.push(y.a.c("wf", f.c, W(f).toString(), "inactive")), c(y.f, E, q);
        }
        Ke(y, "fontinactive", f), Nt(this);
      };
      function Nt(f) {
        --f.f == 0 && f.j && (f.m ? (f = f.a, f.g && c(f.f, [f.a.c("wf", "active")], [f.a.c("wf", "loading"), f.a.c("wf", "inactive")]), Ke(f, "active")) : Se(f.a));
      }
      function _n(f) {
        this.j = f, this.a = new Ue(), this.h = 0, this.f = this.g = !0;
      }
      _n.prototype.load = function(f) {
        this.c = new i(this.j, f.context || this.j), this.g = f.events !== !1, this.f = f.classes !== !1, v(this, new ge(this.c, f), f);
      };
      function _(f, y, N, E, q) {
        var te = --f.h == 0;
        (f.f || f.g) && setTimeout(function() {
          var ie = q || null, xe = E || null || {};
          if (N.length === 0 && te) Se(y.a);
          else {
            y.f += N.length, te && (y.j = te);
            var Ie, ze = [];
            for (Ie = 0; Ie < N.length; Ie++) {
              var Le = N[Ie], Qe = xe[Le.c], rt = y.a, un = Le;
              if (rt.g && c(rt.f, [rt.a.c("wf", un.c, W(un).toString(), "loading")]), Ke(rt, "fontloading", un), rt = null, Wt === null) if (window.FontFace) {
                var un = /Gecko.*Firefox\/(\d+)/.exec(window.navigator.userAgent), Bs = /OS X.*Version\/10\..*Safari/.exec(window.navigator.userAgent) && /Apple/.exec(window.navigator.vendor);
                Wt = un ? 42 < parseInt(un[1], 10) : !Bs;
              } else Wt = !1;
              Wt ? rt = new Ze(s(y.g, y), s(y.h, y), y.c, Le, y.s, Qe) : rt = new Je(s(y.g, y), s(y.h, y), y.c, Le, y.s, ie, Qe), ze.push(rt);
            }
            for (Ie = 0; Ie < ze.length; Ie++) ze[Ie].start();
          }
        }, 0);
      }
      function v(f, y, N) {
        var q = [], E = N.timeout;
        Oe(y);
        var q = st(f.a, N, f.c), te = new jt(f.c, y, E);
        for (f.h = q.length, y = 0, N = q.length; y < N; y++) q[y].load(function(ie, xe, Ie) {
          _(f, te, ie, xe, Ie);
        });
      }
      function L(f, y) {
        this.c = f, this.a = y;
      }
      L.prototype.load = function(f) {
        function y() {
          if (te["__mti_fntLst" + E]) {
            var ie = te["__mti_fntLst" + E](), xe = [], Ie;
            if (ie) for (var ze = 0; ze < ie.length; ze++) {
              var Le = ie[ze].fontfamily;
              ie[ze].fontStyle != null && ie[ze].fontWeight != null ? (Ie = ie[ze].fontStyle + ie[ze].fontWeight, xe.push(new C(Le, Ie))) : xe.push(new C(Le));
            }
            f(xe);
          } else setTimeout(function() {
            y();
          }, 50);
        }
        var N = this, E = N.a.projectId, q = N.a.version;
        if (E) {
          var te = N.c.o;
          O(this.c, (N.a.api || "https://fast.fonts.net/jsapi") + "/" + E + ".js" + (q ? "?v=" + q : ""), function(ie) {
            ie ? f([]) : (te["__MonotypeConfiguration__" + E] = function() {
              return N.a;
            }, y());
          }).id = "__MonotypeAPIScript__" + E;
        } else f([]);
      };
      function D(f, y) {
        this.c = f, this.a = y;
      }
      D.prototype.load = function(f) {
        var y, N, E = this.a.urls || [], q = this.a.families || [], te = this.a.testStrings || {}, ie = new H();
        for (y = 0, N = E.length; y < N; y++) I(this.c, E[y], ue(ie));
        var xe = [];
        for (y = 0, N = q.length; y < N; y++) if (E = q[y].split(":"), E[1]) for (var Ie = E[1].split(","), ze = 0; ze < Ie.length; ze += 1) xe.push(new C(E[0], Ie[ze]));
        else xe.push(new C(E[0]));
        R(ie, function() {
          f(xe, te);
        });
      };
      function U(f, y) {
        f ? this.c = f : this.c = M, this.a = [], this.f = [], this.g = y || "";
      }
      var M = "https://fonts.googleapis.com/css";
      function X(f, y) {
        for (var N = y.length, E = 0; E < N; E++) {
          var q = y[E].split(":");
          q.length == 3 && f.f.push(q.pop());
          var te = "";
          q.length == 2 && q[1] != "" && (te = ":"), f.a.push(q.join(te));
        }
      }
      function V(f) {
        if (f.a.length == 0) throw Error("No fonts to load!");
        if (f.c.indexOf("kit=") != -1) return f.c;
        for (var y = f.a.length, N = [], E = 0; E < y; E++) N.push(f.a[E].replace(/ /g, "+"));
        return y = f.c + "?family=" + N.join("%7C"), 0 < f.f.length && (y += "&subset=" + f.f.join(",")), 0 < f.g.length && (y += "&text=" + encodeURIComponent(f.g)), y;
      }
      function K(f) {
        this.f = f, this.a = [], this.c = {};
      }
      var j = { latin: "BESbswy", "latin-ext": "çöüğş", cyrillic: "йяЖ", greek: "αβΣ", khmer: "កខគ", Hanuman: "កខគ" }, re = { thin: "1", extralight: "2", "extra-light": "2", ultralight: "2", "ultra-light": "2", light: "3", regular: "4", book: "4", medium: "5", "semi-bold": "6", semibold: "6", "demi-bold": "6", demibold: "6", bold: "7", "extra-bold": "8", extrabold: "8", "ultra-bold": "8", ultrabold: "8", black: "9", heavy: "9", l: "3", r: "4", b: "7" }, J = { i: "i", italic: "i", n: "n", normal: "n" }, Q = /^(thin|(?:(?:extra|ultra)-?)?light|regular|book|medium|(?:(?:semi|demi|extra|ultra)-?)?bold|black|heavy|l|r|b|[1-9]00)?(n|i|normal|italic)?$/;
      function pe(f) {
        for (var y = f.f.length, N = 0; N < y; N++) {
          var E = f.f[N].split(":"), q = E[0].replace(/\+/g, " "), te = ["n4"];
          if (2 <= E.length) {
            var ie, xe = E[1];
            if (ie = [], xe) for (var xe = xe.split(","), Ie = xe.length, ze = 0; ze < Ie; ze++) {
              var Le;
              if (Le = xe[ze], Le.match(/^[\w-]+$/)) {
                var Qe = Q.exec(Le.toLowerCase());
                if (Qe == null) Le = "";
                else {
                  if (Le = Qe[2], Le = Le == null || Le == "" ? "n" : J[Le], Qe = Qe[1], Qe == null || Qe == "") Qe = "4";
                  else var rt = re[Qe], Qe = rt || (isNaN(Qe) ? "4" : Qe.substr(0, 1));
                  Le = [Le, Qe].join("");
                }
              } else Le = "";
              Le && ie.push(Le);
            }
            0 < ie.length && (te = ie), E.length == 3 && (E = E[2], ie = [], E = E ? E.split(",") : ie, 0 < E.length && (E = j[E[0]]) && (f.c[q] = E));
          }
          for (f.c[q] || (E = j[q]) && (f.c[q] = E), E = 0; E < te.length; E += 1) f.a.push(new C(q, te[E]));
        }
      }
      function he(f, y) {
        this.c = f, this.a = y;
      }
      var be = { Arimo: !0, Cousine: !0, Tinos: !0 };
      he.prototype.load = function(f) {
        var y = new H(), N = this.c, E = new U(this.a.api, this.a.text), q = this.a.families;
        X(E, q);
        var te = new K(q);
        pe(te), I(N, V(E), ue(y)), R(y, function() {
          f(te.a, te.c, be);
        });
      };
      function ke(f, y) {
        this.c = f, this.a = y;
      }
      ke.prototype.load = function(f) {
        var y = this.a.id, N = this.c.o;
        y ? O(this.c, (this.a.api || "https://use.typekit.net") + "/" + y + ".js", function(E) {
          if (E) f([]);
          else if (N.Typekit && N.Typekit.config && N.Typekit.config.fn) {
            E = N.Typekit.config.fn;
            for (var q = [], te = 0; te < E.length; te += 2) for (var ie = E[te], xe = E[te + 1], Ie = 0; Ie < xe.length; Ie++) q.push(new C(ie, xe[Ie]));
            try {
              N.Typekit.load({ events: !1, classes: !1, async: !0 });
            } catch {
            }
            f(q);
          }
        }, 2e3) : f([]);
      };
      function De(f, y) {
        this.c = f, this.f = y, this.a = [];
      }
      De.prototype.load = function(f) {
        var y = this.f.id, N = this.c.o, E = this;
        y ? (N.__webfontfontdeckmodule__ || (N.__webfontfontdeckmodule__ = {}), N.__webfontfontdeckmodule__[y] = function(q, te) {
          for (var ie = 0, xe = te.fonts.length; ie < xe; ++ie) {
            var Ie = te.fonts[ie];
            E.a.push(new C(Ie.name, me("font-weight:" + Ie.weight + ";font-style:" + Ie.style)));
          }
          f(E.a);
        }, O(this.c, (this.f.api || "https://f.fontdeck.com/s/css/js/") + T(this.c) + "/" + y + ".js", function(q) {
          q && f([]);
        })) : f([]);
      };
      var $ = new _n(window);
      $.a.c.custom = function(f, y) {
        return new D(y, f);
      }, $.a.c.fontdeck = function(f, y) {
        return new De(y, f);
      }, $.a.c.monotype = function(f, y) {
        return new L(y, f);
      }, $.a.c.typekit = function(f, y) {
        return new ke(y, f);
      }, $.a.c.google = function(f, y) {
        return new he(y, f);
      };
      var z = { load: s($.load, $) };
      e.exports ? e.exports = z : (window.WebFont = z, window.WebFontConfig && $.load(window.WebFontConfig));
    })();
  }(Go)), Go.exports;
}
var uv = cv();
const fv = /* @__PURE__ */ lv(uv), $c = [
  "Space Grotesk:400,500,600,700",
  "Instrument Sans:400,500,600",
  "JetBrains Mono:400,500,600"
], dv = (e) => {
  const t = [...$c], n = (e == null ? void 0 : e.split(",")[0].trim().replace(/['"]/g, "")) || "", s = $c.some(
    (r) => r.toLowerCase().startsWith(n.toLowerCase())
  );
  n && !s && t.push(n), fv.load({
    google: { families: t },
    active: () => {
      if (!e) return;
      const r = document.querySelector(".chat-container");
      r && (r.style.fontFamily = e.includes(",") ? e : `"${e}", system-ui, sans-serif`);
    }
  });
};
function hv() {
  const e = oe({}), t = oe(""), n = (r) => {
    var i;
    e.value = r, r.photo_url && (e.value.photo_url = r.photo_url), dv(r.font_family), vt({
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
const pv = 13, mv = 24;
function gv(e, t) {
  const n = qr({}), s = [];
  let r = null;
  const i = typeof window < "u" && typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, o = (c) => {
    r || s.length === 0 || (r = setTimeout(a, c));
  }, a = () => {
    r = null;
    const c = s[0];
    if (c === void 0) return;
    const b = e.value[c], T = n[c], I = (b == null ? void 0 : b.message) ?? "";
    if (!T || !b) {
      s.shift(), o(0);
      return;
    }
    if (T.shown >= I.length) {
      T.done = !0, s.shift(), o(0);
      return;
    }
    T.shown += 1;
    const O = I[T.shown - 1];
    t == null || t(), o(O === " " ? mv : pv);
  };
  pt(() => e.value.length, (c, b) => {
    b !== void 0 && c < b && (Object.keys(n).forEach((T) => {
      delete n[Number(T)];
    }), s.length = 0);
    for (let T = b ?? 0; T < c; T++) {
      const I = e.value[T];
      if (!I || !I.stream || T in n) continue;
      const O = I.message ?? "";
      i || !O ? n[T] = { shown: O.length, done: !0 } : (n[T] = { shown: 0, done: !1 }, s.push(T));
    }
    o(0);
  });
  const l = (c, b) => {
    const T = n[c];
    return T ? b.slice(0, T.shown) : b;
  }, u = (c) => {
    const b = n[c];
    return !!b && !b.done;
  };
  return Kr(() => {
    r && clearTimeout(r);
  }), { displayText: l, isStreaming: u };
}
function _v(e) {
  const t = oe(!0);
  let n = 0;
  const s = () => {
    vt({ type: "UNREAD_COUNT", count: n });
  }, r = (i) => {
    var o;
    ((o = i == null ? void 0 : i.data) == null ? void 0 : o.type) === "WIDGET_VISIBILITY" && (t.value = !!i.data.open, t.value && n !== 0 && (n = 0, s()));
  };
  pt(() => e.value.length, (i, o) => {
    if (i <= (o ?? 0) || t.value) return;
    const a = e.value[i - 1];
    a && (a.message_type === "bot" || a.message_type === "agent") && (n += 1, s());
  }), ro(() => window.addEventListener("message", r)), Kr(() => window.removeEventListener("message", r));
}
const yv = {
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
}, vv = {
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
}, bv = {
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
}, wv = {
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
}, kv = {
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
}, Mi = {
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
}, Tv = {
  GLASS: yv,
  AURORA: vv,
  TERMINAL: bv,
  CALM_MINT: wv,
  PLAYFUL: kv,
  SUNRISE: Mi,
  CHATBOT: Mi,
  ASK_ANYTHING: Mi
}, Av = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", Bc = "'Instrument Sans', system-ui, -apple-system, 'Segoe UI', sans-serif";
function Sv(e) {
  return Math.max(4, Math.round(e * 0.3));
}
function Uc(e) {
  const t = (e || "").replace("#", "");
  if (t.length < 6) return "#0B0C10";
  const n = parseInt(t.slice(0, 2), 16), s = parseInt(t.slice(2, 4), 16), r = parseInt(t.slice(4, 6), 16);
  return (0.299 * n + 0.587 * s + 0.114 * r) / 255 > 0.62 ? "#0B0C10" : "#FFFFFF";
}
function xv(e) {
  return Tv[e || ""] || Mi;
}
const Ev = "#212529";
function Cv(e, t) {
  const n = xv(e), s = (t == null ? void 0 : t.chat_background_color) || "", r = /^#[0-9a-fA-F]{6}$/.test(s), i = s || n.card, o = (t == null ? void 0 : t.chat_text_color) || "", l = /^#[0-9a-fA-F]{6}$/.test(o) && o.toLowerCase() !== Ev ? o : r ? sr(s) ? "#FFFFFF" : "#111111" : n.text, u = r ? sr(s) ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.62)" : n.muted, c = r ? Ep(s, 20) : n.agentBg, b = (t == null ? void 0 : t.accent_color) || n.accent, T = r ? !sr(s) : n.light, I = Uc(b) === "#0B0C10", O = T === I ? u : b, H = n.mono ? Av : t != null && t.font_family ? `${t.font_family}, ${Bc}` : Bc;
  return {
    "--cm-card": i,
    "--cm-text": l,
    "--cm-muted": u,
    "--cm-agent-bg": c,
    "--cm-accent": b,
    "--cm-on-accent": Uc(b),
    "--cm-presence": O,
    "--cm-border": n.border,
    "--cm-glow": n.glow,
    "--cm-radius": `${n.radius}px`,
    "--cm-bubble": `${n.bubble}px`,
    "--cm-bubble-tail": `${Sv(n.bubble)}px`,
    "--cm-field-radius": n.mono ? "7px" : "12px",
    "--cm-avatar-radius": n.mono ? "28%" : "50%",
    "--cm-hairline": n.light ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.08)",
    "--cm-body-font": H
  };
}
const zc = (e) => {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: e || "USD" }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
};
function Rv() {
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
        minimumFractionDigits: zc(r),
        maximumFractionDigits: zc(r)
      }) : String(s);
      return i ? `${i}${a}` : a;
    },
    getCurrencySymbol: (s) => e[s] || s,
    currencySymbols: e
  };
}
const Iv = {
  key: 0,
  class: "widget-unavailable-overlay"
}, Ov = {
  key: 1,
  class: "auth-error-overlay"
}, Lv = { class: "auth-error-card" }, Nv = { class: "auth-error-message" }, Pv = {
  key: 0,
  class: "initializing-overlay"
}, Mv = {
  key: 0,
  class: "connecting-message"
}, Dv = {
  key: 1,
  class: "failed-message"
}, Fv = { class: "welcome-content" }, $v = { class: "welcome-header" }, Bv = ["src", "alt"], Uv = { class: "welcome-title" }, zv = { class: "welcome-subtitle" }, Hv = { class: "welcome-input-container" }, jv = {
  key: 0,
  class: "email-input"
}, Wv = ["disabled"], qv = { class: "welcome-message-input" }, Vv = ["placeholder", "disabled"], Kv = ["disabled"], Gv = {
  key: 0,
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, Yv = {
  key: 1,
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, Xv = { class: "landing-page-content" }, Zv = { class: "landing-page-header" }, Jv = { class: "landing-page-heading" }, Qv = { class: "landing-page-text" }, eb = { class: "landing-page-actions" }, tb = { class: "form-fullscreen-content" }, nb = {
  key: 0,
  class: "form-header"
}, sb = {
  key: 0,
  class: "form-title"
}, rb = {
  key: 1,
  class: "form-description"
}, ib = { class: "form-fields" }, ob = ["for"], ab = {
  key: 0,
  class: "required-indicator"
}, lb = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "autocomplete", "inputmode"], cb = ["id", "placeholder", "required", "min", "max", "value", "onInput"], ub = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput"], fb = ["id", "required", "value", "onChange"], db = { value: "" }, hb = ["value"], pb = {
  key: 4,
  class: "checkbox-field"
}, mb = ["id", "required", "checked", "onChange"], gb = { class: "checkbox-label" }, _b = {
  key: 5,
  class: "radio-group"
}, yb = ["name", "value", "required", "checked", "onChange"], vb = { class: "radio-label" }, bb = {
  key: 6,
  class: "field-error"
}, wb = { class: "form-actions" }, kb = ["disabled"], Tb = {
  key: 0,
  class: "loading-spinner-inline"
}, Ab = { key: 1 }, Sb = { class: "header-content" }, xb = ["src", "alt"], Eb = { class: "header-info" }, Cb = { class: "status" }, Rb = { class: "status-text cm-presence" }, Ib = { class: "header-actions" }, Ob = ["disabled", "title", "aria-label", "aria-expanded"], Lb = { class: "ask-anything-header" }, Nb = ["src", "alt"], Pb = { class: "header-info" }, Mb = {
  key: 2,
  class: "loading-history"
}, Db = { class: "cm-email-gate-title" }, Fb = ["disabled"], $b = {
  key: 0,
  class: "cm-email-gate-error"
}, Bb = ["disabled"], Ub = {
  key: 1,
  class: "cm-welcome-block"
}, zb = { class: "message agent-message cm-welcome-row" }, Hb = ["src", "alt"], jb = {
  key: 0,
  class: "message agent-message cm-welcome-row cm-host-prompt"
}, Wb = ["src", "alt"], qb = {
  key: 0,
  class: "cm-msg-avatar",
  "aria-hidden": "true"
}, Vb = ["src"], Kb = ["src"], Gb = { class: "message-col" }, Yb = {
  key: 0,
  class: "rating-content"
}, Xb = { class: "rating-prompt" }, Zb = ["onMouseover", "onMouseleave", "onClick", "disabled"], Jb = {
  key: 0,
  class: "feedback-wrapper"
}, Qb = { class: "feedback-section" }, ew = ["onUpdate:modelValue", "disabled"], tw = { class: "feedback-counter" }, nw = ["onClick", "disabled"], sw = {
  key: 1,
  class: "submitted-feedback-wrapper"
}, rw = { class: "submitted-feedback" }, iw = { class: "submitted-feedback-text" }, ow = {
  key: 2,
  class: "submitted-message"
}, aw = {
  key: 1,
  class: "form-content"
}, lw = {
  key: 0,
  class: "form-header"
}, cw = {
  key: 0,
  class: "form-title"
}, uw = {
  key: 1,
  class: "form-description"
}, fw = { class: "form-fields" }, dw = ["for"], hw = {
  key: 0,
  class: "required-indicator"
}, pw = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "disabled", "autocomplete", "inputmode"], mw = ["id", "placeholder", "required", "min", "max", "value", "onInput", "disabled"], gw = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "disabled"], _w = ["id", "required", "value", "onChange", "disabled"], yw = { value: "" }, vw = ["value"], bw = {
  key: 4,
  class: "checkbox-field"
}, ww = ["id", "checked", "onChange", "disabled"], kw = ["for"], Tw = {
  key: 5,
  class: "radio-field"
}, Aw = ["id", "name", "value", "checked", "onChange", "disabled"], Sw = ["for"], xw = {
  key: 6,
  class: "field-error"
}, Ew = { class: "form-actions" }, Cw = ["onClick", "disabled"], Rw = {
  key: 2,
  class: "user-input-content"
}, Iw = {
  key: 0,
  class: "user-input-prompt"
}, Ow = {
  key: 1,
  class: "user-input-form"
}, Lw = ["onUpdate:modelValue", "onKeydown"], Nw = ["onClick", "disabled"], Pw = {
  key: 2,
  class: "user-input-submitted"
}, Mw = {
  key: 0,
  class: "user-input-confirmation"
}, Dw = {
  key: 3,
  class: "product-message-container"
}, Fw = ["innerHTML"], $w = {
  key: 1,
  class: "products-carousel"
}, Bw = { class: "carousel-items" }, Uw = ["aria-label"], zw = {
  key: 0,
  class: "product-image-compact"
}, Hw = ["src", "alt"], jw = { class: "product-info-compact" }, Ww = { class: "product-text-area" }, qw = { class: "product-title-compact" }, Vw = {
  key: 0,
  class: "product-variant-compact"
}, Kw = { class: "product-price-compact" }, Gw = { class: "product-actions-compact" }, Yw = ["onClick"], Xw = {
  key: 2,
  class: "no-products-message"
}, Zw = {
  key: 3,
  class: "no-products-message"
}, Jw = ["innerHTML"], Qw = ["innerHTML"], e0 = {
  key: 2,
  class: "message-attachments"
}, t0 = {
  key: 0,
  class: "attachment-image-container"
}, n0 = ["src", "alt", "onClick"], s0 = { class: "attachment-image-info" }, r0 = ["href"], i0 = { class: "attachment-size" }, o0 = ["href"], a0 = { class: "attachment-size" }, l0 = {
  key: 0,
  class: "citation-chips"
}, c0 = ["title"], u0 = { class: "message-info" }, f0 = {
  key: 0,
  class: "agent-name"
}, d0 = {
  key: 2,
  class: "message agent-message cm-welcome-row cm-host-prompt"
}, h0 = ["src", "alt"], p0 = {
  key: 5,
  class: "cm-quick-actions-bar"
}, m0 = ["disabled", "onClick"], g0 = {
  key: 0,
  class: "file-previews-widget"
}, _0 = {
  class: "file-preview-content-widget",
  style: { cursor: "pointer" }
}, y0 = ["src", "alt", "onClick"], v0 = ["onClick"], b0 = { class: "file-preview-info-widget" }, w0 = { class: "file-preview-name-widget" }, k0 = { class: "file-preview-size-widget" }, T0 = ["onClick"], A0 = {
  key: 1,
  class: "upload-progress-widget"
}, S0 = { class: "message-input" }, x0 = ["placeholder", "disabled"], E0 = ["disabled", "title"], C0 = ["disabled"], R0 = {
  key: 2,
  class: "cm-secret-hint",
  role: "alert"
}, I0 = {
  key: 7,
  class: "new-conversation-section"
}, O0 = { class: "conversation-ended-message" }, L0 = {
  key: 8,
  class: "ai-disclaimer"
}, N0 = {
  key: 8,
  class: "rating-dialog"
}, P0 = { class: "rating-content" }, M0 = { class: "star-rating" }, D0 = ["onClick"], F0 = { class: "rating-actions" }, $0 = ["disabled"], B0 = {
  key: 0,
  class: "preview-modal-image-container"
}, U0 = ["src", "alt"], z0 = { class: "preview-modal-filename" }, H0 = {
  key: 3,
  class: "widget-loading"
}, Hc = 3, j0 = "image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls", W0 = /* @__PURE__ */ ps({
  __name: "WidgetBuilder",
  props: {
    widgetId: {},
    token: {},
    initialAuthError: {}
  },
  setup(e) {
    const t = e, n = ae(() => {
      var d;
      return t.widgetId || ((d = window.__INITIAL_DATA__) == null ? void 0 : d.widgetId);
    }), {
      customization: s,
      agentName: r,
      applyCustomization: i,
      initializeFromData: o
    } = hv(), { formatCurrency: a } = Rv(), {
      messages: l,
      loading: u,
      errorMessage: c,
      showError: b,
      loadingHistory: T,
      hasStartedChat: I,
      connectionStatus: O,
      sendMessage: H,
      endChat: ue,
      loadChatHistory: R,
      connect: fe,
      reconnect: _e,
      cleanup: C,
      humanAgent: P,
      onTakeover: S,
      refusal: W,
      submitRating: se,
      submitForm: me,
      currentForm: ge,
      getWorkflowState: Oe,
      proceedWorkflow: Se,
      onWorkflowState: Ke,
      onWorkflowProceeded: Ue,
      currentSessionId: st,
      setToken: de,
      setWidgetId: Te,
      onSessionState: ye,
      onReauthorize: Ze,
      on: Je,
      emit: lt
    } = Vy(), je = oe(null), { receipts: Lt, addReceipt: gn, receiptsAfter: Me } = S_(l), { pendingConfirm: wt, approveAction: Bt, declineAction: jt, runLocalAction: Wt } = sv(
      { on: Je, emit: lt },
      (d) => {
        je.value = d;
      },
      gn
    ), { journeyProgress: Nt, chipBusy: _n, runChip: _, skipStep: v, dismissJourney: L, noteActivity: D } = ov({
      on: Je,
      emit: lt,
      currentPrompt: () => je.value,
      showPrompt: (d) => {
        je.value = d;
      },
      addNotice: (d) => {
        l.value.push({
          message: d,
          message_type: "bot",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          session_id: "",
          attributes: { source: "journey" }
        });
      },
      runLocalAction: Wt
    }), U = (d) => {
      d.kind === "action" && !_n.value && !wt.value && (X.value && j(X.value), l.value.push({ message: d.label, message_type: "user", created_at: (/* @__PURE__ */ new Date()).toISOString(), session_id: "", attributes: { source: "journey" } })), _(d, Gn);
    }, M = ae(() => {
      const d = je.value;
      return !(d != null && d.chips.length) || wt.value || u.value ? [] : d.chips;
    }), X = ae(() => {
      const d = je.value;
      return !d || d.source !== "journey" ? d : l.value.some((Y) => Y.message_type === "bot" && Y.message === d.message) ? null : d;
    }), V = ae(() => u.value ? null : X.value), K = av(l, V), j = (d) => {
      l.value.splice(K.index(), 0, {
        message: d.message,
        message_type: "bot",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: "",
        attributes: { source: d.source }
      });
    }, { displayText: re, isStreaming: J } = gv(l, () => is(() => vn()));
    _v(l);
    const Q = oe(""), pe = oe(!0), he = oe(""), be = oe(!1), ke = (d) => {
      const m = d.target;
      Q.value = m.value;
    };
    let De = null;
    const $ = () => {
      De && De.disconnect(), De = new MutationObserver((m) => {
        let Y = !1, p = !1;
        m.forEach((ce) => {
          if (ce.type === "childList") {
            const Ye = Array.from(ce.addedNodes).some(
              (at) => {
                var et;
                return at.nodeType === Node.ELEMENT_NODE && (at.matches("input, textarea") || ((et = at.querySelector) == null ? void 0 : et.call(at, "input, textarea")));
              }
            ), we = Array.from(ce.removedNodes).some(
              (at) => {
                var et;
                return at.nodeType === Node.ELEMENT_NODE && (at.matches("input, textarea") || ((et = at.querySelector) == null ? void 0 : et.call(at, "input, textarea")));
              }
            );
            Ye && (p = !0, Y = !0), we && (Y = !0);
          }
        }), Y && (clearTimeout($.timeoutId), $.timeoutId = setTimeout(() => {
          q();
        }, p ? 50 : 100));
      });
      const d = document.querySelector(".widget-container") || document.body;
      De.observe(d, {
        childList: !0,
        subtree: !0
      });
    };
    $.timeoutId = null;
    let z = [];
    const f = /* @__PURE__ */ new Set();
    let y = !1;
    const N = (d) => {
      if (y) return;
      const m = setTimeout(() => {
        f.delete(m), q();
      }, d);
      f.add(m);
    }, E = () => {
      f.forEach(clearTimeout), f.clear();
    }, q = () => {
      te();
      const d = [
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
      for (const Y of d) {
        const p = document.querySelectorAll(Y);
        if (p.length > 0) {
          m = Array.from(p);
          break;
        }
      }
      m.length !== 0 && (z = m, m.forEach((Y) => {
        Y.addEventListener("input", xe, !0), Y.addEventListener("keyup", xe, !0), Y.addEventListener("change", xe, !0), Y.addEventListener("keypress", Ie, !0), Y.addEventListener("keydown", ze, !0);
      }));
    }, te = () => {
      z.forEach((d) => {
        d.removeEventListener("input", xe), d.removeEventListener("keyup", xe), d.removeEventListener("change", xe), d.removeEventListener("keypress", Ie), d.removeEventListener("keydown", ze);
      }), z = [];
    }, ie = (d) => !!(d && d.closest && d.closest(".form-message, .form-fullscreen, .cm-email-gate")), xe = (d) => {
      if (ie(d.target)) return;
      const m = d.target;
      Q.value = m.value;
    }, Ie = (d) => {
      ie(d.target) || d.key === "Enter" && !d.shiftKey && (d.preventDefault(), d.stopPropagation(), en());
    }, ze = (d) => {
      ie(d.target) || d.key === "Enter" && !d.shiftKey && (d.preventDefault(), d.stopPropagation(), en());
    }, Le = (d) => {
      const m = d.target, Y = document.querySelector(".header-menu-container");
      document.querySelector(".header-menu-btn");
      const p = document.querySelector(".header-dropdown-menu");
      p && !(Y != null && Y.contains(m)) && (p.style.display = "none");
    }, Qe = oe(!0), {
      token: rt,
      start: un,
      stop: Bs,
      setToken: jn,
      ensureFresh: Xr
    } = j_({
      onTokenChanged: (d) => {
        Ns() && vt({ type: "TOKEN_UPDATE", token: d }), de(d);
      },
      onIdentityExpired: () => {
        nl();
      },
      // A framed widget holds the token only in memory: the host page keeps it, so
      // it must hear when the widget lets it go.
      onTokenCleared: () => {
        Xi() && Ns() && vt({ type: "TOKEN_CLEAR" });
      },
      store: wf(n.value || "")
    });
    ae(() => !!rt.value);
    const Ut = oe(null), Pt = oe(!1), qt = oe(!1);
    t.initialAuthError && (Ut.value = t.initialAuthError, Pt.value = !0, Qe.value = !1), o();
    const At = window.__INITIAL_DATA__;
    un((At == null ? void 0 : At.widgetId) || "", At == null ? void 0 : At.initialToken), rt.value && (be.value = !0);
    const Wn = oe(!1);
    (At == null ? void 0 : At.allowAttachments) !== void 0 && (Wn.value = At.allowAttachments);
    const qn = oe(null), {
      chatStyles: gs,
      chatIconStyles: Zr,
      agentBubbleStyles: Rn,
      userBubbleStyles: fn,
      messageNameStyles: Vt,
      headerBorderStyles: Jr,
      photoUrl: ft,
      shadowStyle: po
    } = G_(s), Qr = oe(null), {
      uploadedAttachments: $e,
      previewModal: Vn,
      previewFile: _s,
      formatFileSize: Us,
      isImageAttachment: lr,
      getDownloadUrl: ys,
      getPreviewUrl: cr,
      handleFileSelect: ei,
      handleDrop: ti,
      handleDragOver: ni,
      handleDragLeave: si,
      handlePaste: dn,
      removeAttachment: ri,
      openPreview: Kn,
      closePreview: Qt,
      openFilePicker: ii,
      isImage: vs
    } = Z_(rt, Qr);
    ae(() => l.value.some(
      (d) => d.message_type === "form" && (!d.isSubmitted || d.isSubmitted === !1)
    ));
    const yn = ae(() => {
      var d;
      return I.value && be.value || !wo.value ? O.value === "connected" && !u.value : br(he.value.trim()) && O.value === "connected" && !u.value || ((d = window.__INITIAL_DATA__) == null ? void 0 : d.workflow);
    }), bs = ae(() => yn.value || u.value && O.value === "connected" && I.value), zs = ae(() => O.value === "connected" ? sn.value ? "Ask me anything..." : "Type a message..." : "Connecting..."), Hs = oe(!1), In = ae(() => O_(Q.value)), en = async () => {
      var p;
      if (!Q.value.trim() && $e.value.length === 0 || In.value) return;
      if (u.value && I.value) {
        Hs.value = !0;
        return;
      }
      !I.value && he.value && await kt();
      const d = $e.value.map((ce) => ({
        content: ce.content,
        // base64 content
        filename: ce.filename,
        content_type: ce.type,
        size: ce.size
      }));
      D();
      const m = X.value;
      m && j(m), ((p = je.value) == null ? void 0 : p.source) !== "journey" && (je.value = null), await H(
        Q.value,
        he.value,
        d,
        m ? { host_prompt: m.message, host_prompt_source: m.source } : {}
      ), $e.value.forEach((ce) => {
        ce.url && ce.url.startsWith("blob:") && URL.revokeObjectURL(ce.url), ce.file_url && ce.file_url.startsWith("blob:") && URL.revokeObjectURL(ce.file_url);
      }), Q.value = "", $e.value = [];
      const Y = document.querySelector('input[placeholder*="Type a message"]');
      Y && (Y.value = ""), N(500);
    };
    pt(u, (d) => {
      d || !Hs.value || (Hs.value = !1, O.value === "connected" && I.value && en());
    });
    const Gn = (d) => {
      yn.value && (Q.value = d, en());
    }, hn = () => {
      vt({ type: "WIDGET_MINIMIZE" });
    }, Yn = (d) => {
      d.key === "Enter" && !d.shiftKey && (d.preventDefault(), d.stopPropagation(), en());
    }, kt = async ({ afterRefusal: d = !1 } = {}) => {
      var m, Y, p, ce;
      try {
        if (!n.value)
          return console.error("Widget ID is not available"), Ut.value = "Widget ID is not available. Please refresh and try again.", Pt.value = !0, !1;
        await Xr(n.value);
        const Ye = new URL(`${Fs.API_URL}/widgets/${n.value}`);
        he.value.trim() && br(he.value.trim()) && Ye.searchParams.append("email", he.value.trim());
        const we = {
          Accept: "application/json",
          "Content-Type": "application/json"
        };
        rt.value && (we.Authorization = `Bearer ${rt.value}`);
        const at = await fetch(Ye, {
          headers: we,
          cache: "no-store"
        });
        if (at.status === 401) {
          be.value = !1;
          try {
            const es = (await at.json()).detail;
            if ((es == null ? void 0 : es.code) === $_)
              return nl(), !1;
            const Ks = typeof es == "string" ? es : "";
            (Ks.includes("generate-token") || Ks.includes("API key") || Ks.includes("Token required")) && (qt.value = !0, Ut.value = "Widget authentication not configured. Please contact the website administrator.", Pt.value = !0, jn(null));
          } catch {
            Ut.value = "Authentication required. Your token has expired or is invalid. Please refresh the page.", Pt.value = !0, jn(null);
          }
          return !1;
        }
        if (!at.ok) {
          try {
            const mr = await at.json();
            Ut.value = mr.detail || `Error: ${at.statusText}`;
          } catch {
            Ut.value = `Error: ${at.statusText}. Please try again.`;
          }
          return Pt.value = !0, !1;
        }
        const et = await at.json();
        et.token && jn(et.token), be.value = !0, Ut.value = null, Pt.value = !1, de(rt.value || void 0);
        const pr = await fe();
        return !pr && la(W.value) && !d ? await kt({ afterRefusal: !0 }) : (pr || console.error("Chat service not reachable yet; retrying in the background"), await mo(), (m = et.agent) != null && m.customization && i(et.agent.customization), et.agent && !(et != null && et.human_agent) && (r.value = et.agent.name), et != null && et.human_agent && (P.value = et.human_agent), ((Y = et.agent) == null ? void 0 : Y.allow_attachments) !== void 0 && (Wn.value = et.agent.allow_attachments), ((p = et.agent) == null ? void 0 : p.workflow) !== void 0 && (window.__INITIAL_DATA__ = window.__INITIAL_DATA__ || {}, window.__INITIAL_DATA__.workflow = et.agent.workflow), (ce = et.agent) != null && ce.workflow && await Oe(), !0);
      } catch (Ye) {
        return console.error("Error checking authorization:", Ye), Ut.value = "An unexpected error occurred. Please try again.", Pt.value = !0, be.value = !1, !1;
      } finally {
        Qe.value = !1;
      }
    }, mo = async () => {
      !I.value && be.value && (I.value = !0, await R());
    }, vn = () => {
      qn.value && (qn.value.scrollTop = qn.value.scrollHeight);
    };
    pt(() => l.value, (d) => {
      is(() => {
        vn();
      });
    }, { deep: !0 }), pt([wt, V, () => Lt.value.length, u], ([d, m, Y, p]) => {
      (d || m || Y || p) && is(() => vn());
    }), pt(O, (d, m) => {
      d === "connected" && m !== "connected" && N(100);
    }), pt(() => l.value.length, (d, m) => {
      d > 0 && m === 0 && N(100);
    });
    let oi = null;
    pt(() => l.value, (d) => {
      const m = d[d.length - 1];
      !xc(m) || m === oi || (oi = m, le(m));
    }, { deep: !0 });
    const ai = async () => {
      (await _e() || la(W.value)) && await kt();
    }, ur = oe(!1), ws = oe(0), js = oe(""), tn = oe(0), Kt = oe(!1), dt = oe({}), yt = oe(!1), ut = oe({}), nn = oe(!1), On = oe(null), G = oe("Start Chat"), h = oe(!1), k = oe(null);
    ae(() => {
      var m;
      const d = l.value[l.value.length - 1];
      return ((m = d == null ? void 0 : d.attributes) == null ? void 0 : m.request_rating) || !1;
    });
    const B = ae(() => {
      var m;
      if (!((m = window.__INITIAL_DATA__) != null && m.workflow))
        return !1;
      const d = l.value.find((Y) => Y.message_type === "rating");
      return (d == null ? void 0 : d.isSubmitted) === !0;
    }), ee = ae(
      () => Gi(P.value.human_agent_profile_pic)
    ), le = async (d) => {
      var m, Y, p, ce, Ye;
      if (xc(d)) {
        try {
          if (d.session_id && rt.value && n.value) {
            const we = await tl(d.session_id, {
              reason: (m = d.attributes) == null ? void 0 : m.end_chat_reason,
              description: (Y = d.attributes) == null ? void 0 : Y.end_chat_description
            });
            if (we.ok) {
              const at = await we.json();
              console.info(`✓ Chat session closed on backend: ${at.session_id}`);
            } else
              console.warn(`Failed to close session on backend: ${we.status}`);
          }
        } catch (we) {
          console.error("Error calling end-chat API:", we);
        }
        if ((p = d.attributes) != null && p.end_chat && ((ce = d.attributes) != null && ce.request_rating)) {
          const we = d.agent_name || ((Ye = P.value) == null ? void 0 : Ye.human_agent_name) || r.value || "our agent";
          l.value.push({
            message: `Rate the chat session that you had with ${we}`,
            message_type: "rating",
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            session_id: d.session_id,
            agent_name: we,
            showFeedback: !1
          }), st.value = d.session_id;
        }
      }
    }, ve = (d) => {
      Kt.value || (tn.value = d);
    }, Ge = () => {
      if (!Kt.value) {
        const d = l.value[l.value.length - 1];
        tn.value = (d == null ? void 0 : d.selectedRating) || 0;
      }
    }, ot = async (d) => {
      if (!Kt.value) {
        tn.value = d;
        const m = l.value[l.value.length - 1];
        m && m.message_type === "rating" && (m.showFeedback = !0, m.selectedRating = d);
      }
    }, xt = async (d, m, Y = null) => {
      try {
        Kt.value = !0, await se(m, Y);
        const p = l.value.find((ce) => ce.message_type === "rating");
        p && (p.isSubmitted = !0, p.finalRating = m, p.finalFeedback = Y);
      } catch (p) {
        console.error("Failed to submit rating:", p);
      } finally {
        Kt.value = !1;
      }
    }, Et = (d) => {
      const m = {};
      for (const Y of d.fields) {
        const p = dt.value[Y.name], ce = ci(Y, p);
        ce && (m[Y.name] = ce);
      }
      return ut.value = m, Object.keys(m).length === 0;
    }, fr = async (d) => {
      if (!(yt.value || !Et(d)))
        try {
          yt.value = !0, await me(dt.value);
          const Y = l.value.findIndex(
            (p) => p.message_type === "form" && (!p.isSubmitted || p.isSubmitted === !1)
          );
          Y !== -1 && l.value.splice(Y, 1), dt.value = {}, ut.value = {};
        } catch (Y) {
          console.error("Failed to submit form:", Y);
        } finally {
          yt.value = !1;
        }
    }, We = (d, m) => {
      var Y, p;
      if (dt.value[d] = m, m && m.toString().trim() !== "") {
        let ce = null;
        if ((Y = k.value) != null && Y.fields && (ce = k.value.fields.find((Ye) => Ye.name === d)), !ce && ((p = ge.value) != null && p.fields) && (ce = ge.value.fields.find((Ye) => Ye.name === d)), ce) {
          const Ye = ci(ce, m);
          Ye ? (ut.value[d] = Ye, console.log(`Validation error for ${d}:`, Ye)) : delete ut.value[d];
        }
      } else
        delete ut.value[d], console.log(`Cleared error for ${d}`);
    }, li = (d) => {
      const m = d.replace(/\D/g, "");
      return m.length >= 7 && m.length <= 15;
    }, ci = (d, m) => {
      if (d.required && (!m || m.toString().trim() === ""))
        return `${d.label} is required`;
      if (!m || m.toString().trim() === "")
        return null;
      if (d.type === "email" && !br(m))
        return "Please enter a valid email address";
      if (d.type === "tel" && !li(m))
        return "Please enter a valid phone number";
      if ((d.type === "text" || d.type === "textarea") && d.minLength && m.length < d.minLength)
        return `${d.label} must be at least ${d.minLength} characters`;
      if ((d.type === "text" || d.type === "textarea") && d.maxLength && m.length > d.maxLength)
        return `${d.label} must not exceed ${d.maxLength} characters`;
      if (d.type === "number") {
        const Y = parseFloat(m);
        if (isNaN(Y))
          return `${d.label} must be a valid number`;
        if (d.minLength && Y < d.minLength)
          return `${d.label} must be at least ${d.minLength}`;
        if (d.maxLength && Y > d.maxLength)
          return `${d.label} must not exceed ${d.maxLength}`;
      }
      return null;
    }, Mf = async () => {
      if (!(yt.value || !k.value))
        try {
          yt.value = !0, ut.value = {};
          let d = !1;
          for (const m of k.value.fields || []) {
            const Y = dt.value[m.name], p = ci(m, Y);
            p && (ut.value[m.name] = p, d = !0, console.log(`Validation error for field ${m.name}:`, p));
          }
          if (d) {
            yt.value = !1, console.log("Validation failed, not submitting");
            return;
          }
          await me(dt.value), h.value = !1, k.value = null, dt.value = {};
        } catch (d) {
          console.error("Failed to submit full screen form:", d);
        } finally {
          yt.value = !1, console.log("Full screen form submission completed");
        }
    }, Df = (d, m) => {
      if (console.log("handleViewDetails called with:", { product: d, shopDomain: m }), !d) {
        console.error("No product provided to handleViewDetails");
        return;
      }
      let Y = null;
      if (d.handle && m)
        Y = `https://${m}/products/${d.handle}`;
      else if (d.id && m)
        Y = `https://${m}/products/${d.id}`;
      else if (m) {
        if (!d.handle && !d.id) {
          console.error("Product handle and ID are both missing! Product:", d), alert("Unable to open product: Product information incomplete.");
          return;
        }
      } else {
        console.error("Shop domain is missing! Product:", d), alert("Unable to open product: Shop domain not available. Please contact support.");
        return;
      }
      Y && (console.log("Opening product URL:", Y), window.open(Y, "_blank", "noopener"));
    }, Ff = (d) => {
      if (!d) return "";
      let m = d.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "");
      const Y = [];
      return m = m.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (p, ce, Ye) => {
        const we = `__MARKDOWN_LINK_${Y.length}__`;
        return console.log("Found markdown link:", p, "-> placeholder:", we), Y.push(p), we;
      }), console.log("After replacing markdown links with placeholders:", m), console.log("Markdown links array:", Y), m = m.replace(/https?:\/\/[^\s\)]+/g, "[link removed]"), console.log("After removing standalone URLs:", m), Y.forEach((p, ce) => {
        m = m.replace(`__MARKDOWN_LINK_${ce}__`, p), console.log(`Restored markdown link ${ce}:`, p);
      }), m = m.replace(/\n\s*\n\s*\n/g, `

`).trim(), m;
    }, Qa = oe(!1);
    oe(!1);
    const go = ae(() => {
      var d;
      return !!((d = P.value) != null && d.human_agent_name);
    }), el = ae(() => {
      var d;
      return D_((d = window.__INITIAL_DATA__) == null ? void 0 : d.presence, go.value);
    }), $f = ae(() => Wn.value && go.value && $e.value.length < Hc), Bf = async () => {
      try {
        nn.value = !1, On.value = null, await Se();
      } catch (d) {
        console.error("Failed to proceed workflow:", d);
      }
    }, _o = async (d) => {
      try {
        if (!d.userInputValue || !d.userInputValue.trim())
          return;
        const m = d.userInputValue.trim();
        d.isSubmitted = !0, d.submittedValue = m, await H(m, he.value);
      } catch (m) {
        console.error("Failed to submit user input:", m), d.isSubmitted = !1, d.submittedValue = null;
      }
    }, tl = (d, { reason: m, description: Y, keepalive: p = !1 } = {}) => {
      const ce = new URL(`${Fs.API_URL}/widgets/${n.value}/end-chat`);
      return ce.searchParams.append("session_id", d), m && ce.searchParams.append("reason", m), Y && ce.searchParams.append("description", Y), fetch(ce, {
        method: "POST",
        keepalive: p,
        headers: {
          Authorization: `Bearer ${rt.value}`,
          "Content-Type": "application/json"
        }
      });
    }, Uf = async (d) => {
      try {
        typeof d == "string" && d && rt.value && n.value && await tl(d, { reason: "CUSTOMER_REQUEST", keepalive: !0 });
      } catch {
      } finally {
        vt({ type: "END_CHAT_DONE" });
      }
    }, nl = () => {
      if (!Ns()) {
        sl();
        return;
      }
      vt({ type: "IDENTITY_EXPIRED" });
    }, sl = async () => {
      rt.value && (jn(null), await dr());
    }, zf = async (d) => {
      const m = as(d);
      !m || m === rt.value || (jn(m), await dr());
    }, dr = async () => {
      var d, m, Y;
      try {
        let p = 0;
        const ce = 50;
        for (; !((d = window.__INITIAL_DATA__) != null && d.widgetId) && p < ce; )
          await new Promise((we) => setTimeout(we, 100)), p++;
        return (m = window.__INITIAL_DATA__) != null && m.widgetId ? (Te(window.__INITIAL_DATA__.widgetId), await kt() ? ((Y = window.__INITIAL_DATA__) != null && Y.workflow && be.value && await Oe(), !0) : (O.value = "connected", !1)) : (console.error("Widget data not available after waiting"), !1);
      } catch (p) {
        return console.error("Failed to initialize widget:", p), !1;
      }
    };
    window.addEventListener("message", (d) => {
      d.source === window.parent && (!d.data || typeof d.data.type != "string" || y_(d.data) || (d.data.type === "SCROLL_TO_BOTTOM" && vn(), d.data.type === "HOST_PAGE" && bf(d.data.url), d.data.type === "END_CHAT" && Ns() && Uf(d.data.sessionId), d.data.type === "IDENTITY_UNAVAILABLE" && Ns() && sl(), d.data.type === "TOKEN_REFRESH" && Ns() && zf(d.data.token), d.data.type === "WIDGET_VISIBILITY" && (hl.value = !!d.data.open), d.data.type === "WIDGET_DISPLAY" && (ko.value = {
        mode: d.data.mode,
        width: d.data.width,
        height: d.data.height,
        hotkey: d.data.hotkey
      }), d.data.type === "PREFILL_MESSAGE" && typeof d.data.text == "string" && (Q.value = d.data.text.slice(0, 2e3), is(() => {
        const m = document.querySelector(
          ".message-input input, .welcome-message-field"
        );
        m == null || m.focus();
      }))));
    }), window.addEventListener("keydown", (d) => {
      d.key !== "Escape" || d.defaultPrevented || !Xi() || vt({ type: "WIDGET_ESCAPE" });
    });
    const Hf = () => {
      S(async () => {
        await kt();
      }), Ze(async () => {
        await kt();
      }), ye(({ session_id: d, authenticated: m, created: Y }) => {
        vt({
          type: "CHAT_SESSION",
          sessionId: d,
          authenticated: m,
          created: Y
        });
      }), Ke((d) => {
        var m;
        if (G.value = d.button_text || "Start Chat", d.type === "landing_page")
          On.value = d.landing_page_data, nn.value = !0, h.value = !1;
        else if (d.type === "form" || d.type === "display_form")
          if (((m = d.form_data) == null ? void 0 : m.form_full_screen) === !0)
            k.value = d.form_data, h.value = !0, nn.value = !1;
          else {
            const Y = {
              message: "",
              message_type: "form",
              attributes: {
                form_data: d.form_data
              },
              created_at: (/* @__PURE__ */ new Date()).toISOString(),
              isSubmitted: !1
            };
            l.value.findIndex(
              (ce) => ce.message_type === "form" && !ce.isSubmitted
            ) === -1 && l.value.push(Y), nn.value = !1, h.value = !1;
          }
        else
          nn.value = !1, h.value = !1;
      }), Ue((d) => {
        console.log("Workflow proceeded:", d);
      });
    }, jf = async () => {
      try {
        await dr(), await Oe();
      } catch (d) {
        throw console.error("Failed to start new conversation:", d), d;
      }
    }, ui = ae(
      () => {
        var d;
        return s.value.allow_new_chat === !0 && l.value.length > 0 && !((d = P.value) != null && d.human_agent_name) && !As.value;
      }
    ), Xn = oe(!1), Zn = oe(""), Jn = oe(!1);
    let ks = null;
    const Ws = () => {
      Jn.value = !1, Zn.value = "", ks && (clearTimeout(ks), ks = null);
    }, rl = () => {
      if (!Xn.value) {
        if (Jn.value) {
          Ws();
          return;
        }
        Jn.value = !0, Zn.value = "", ks = setTimeout(Ws, Xm);
      }
    };
    pt(ui, (d) => {
      d || Ws();
    });
    const il = async () => {
      Xn.value || (ks && (clearTimeout(ks), ks = null), await Wf(), Zn.value || (Jn.value = !1));
    }, Wf = async () => {
      if (!Xn.value) {
        Xn.value = !0, Zn.value = "";
        try {
          if (!await ue()) {
            Zn.value = Ac;
            return;
          }
          P.value = {}, Q.value = "", $e.value = [], await dr();
        } catch (d) {
          console.error("Failed to start a new chat:", d), Zn.value = Ac;
        } finally {
          Xn.value = !1;
        }
      }
    }, qf = async () => {
      B.value = !1, l.value = [], P.value = {}, await jf();
    };
    ro(async () => {
      await dr(), Hf(), $(), document.addEventListener("click", Le), (() => {
        const m = l.value.length > 0, Y = O.value === "connected", p = document.querySelector('input[type="text"], textarea') !== null;
        return m || Y || p;
      })() && N(100);
    }), Kr(() => {
      window.removeEventListener("message", (d) => {
        d.data.type === "SCROLL_TO_BOTTOM" && vn();
      }), document.removeEventListener("click", Le), De && (De.disconnect(), De = null), $.timeoutId && (clearTimeout($.timeoutId), $.timeoutId = null), y = !0, E(), te(), Bs(), Ws(), C();
    });
    const qs = ae(() => s.value.chat_style === "AURORA"), sn = ae(() => s.value.chat_style === "ASK_ANYTHING" || qs.value), ol = ae(() => s.value.customization_metadata), Vs = ae(() => {
      var m;
      const d = (m = ol.value) == null ? void 0 : m.avatar_style;
      return d === "orb" ? !0 : d === "photo" ? !1 : qs.value && !s.value.photo_url;
    }), Ts = ae(() => {
      var d;
      return P_(r.value || "", (d = ol.value) == null ? void 0 : d.orb_variant);
    }), Vf = {
      GLASS: "theme-glass",
      TERMINAL: "theme-terminal",
      PLAYFUL: "theme-playful",
      CALM_MINT: "theme-calm",
      SUNRISE: "theme-sunrise"
    }, Kf = ae(() => Vf[s.value.chat_style] || ""), Gf = ae(() => Cv(s.value.chat_style, {
      chat_background_color: s.value.chat_background_color,
      chat_text_color: s.value.chat_text_color,
      accent_color: s.value.accent_color,
      font_family: s.value.font_family
    })), yo = ae(
      () => Array.isArray(s.value.quick_actions) ? s.value.quick_actions.filter((d) => !!d && d.trim().length > 0) : []
    ), al = ae(() => (s.value.welcome_message || "").trim()), ll = ae(
      () => !sn.value && l.value.length === 0 && !T.value && !As.value
    ), Yf = ae(
      () => ll.value && al.value.length > 0
    ), Xf = ae(
      () => ll.value && !B.value && yo.value.length > 0
    ), fi = ae(() => s.value.show_citations === !0), cl = ae(() => M_(s.value.show_ai_disclaimer, go.value)), Zf = (d) => /^[0-9a-f]{16,}$/i.test(d) || /^[0-9a-f-]{32,}$/i.test(d), vo = (d) => {
      const m = (d || "").trim().toLowerCase();
      return !m || m === "unknown" ? "Knowledge base" : m.charAt(0).toUpperCase() + m.slice(1);
    }, bo = (d) => {
      let m = ((d == null ? void 0 : d.name) || "").trim();
      return !m || (m = m.replace(/^[0-9a-f]{16,}[_-]/i, "").replace(/\.(pdf|txt|md|html?|docx?|csv|json)$/i, ""), !m || Zf(m)) ? vo(d == null ? void 0 : d.type) : m;
    }, ul = (d) => {
      const m = bo(d), Y = vo(d == null ? void 0 : d.type);
      return m === Y ? Y : `${m} · ${Y}`;
    }, wo = ae(() => s.value.collect_email === !0 && !sn.value), fl = oe(!1), Qn = oe(""), hr = oe(!1), As = ae(() => !I.value && wo.value && !fl.value), dl = async () => {
      const d = he.value.trim();
      if (!d) {
        Qn.value = "Please enter your email address.";
        return;
      }
      if (!br(d)) {
        Qn.value = "Please enter a valid email address.";
        return;
      }
      Qn.value = "", hr.value = !0;
      try {
        await kt(), fl.value = !0;
      } catch {
        Qn.value = "Something went wrong. Please try again.";
      } finally {
        hr.value = !1;
      }
    }, ko = oe(null), hl = oe(!0), To = { mode: "floating", width: 400, height: 560 }, di = ae(
      () => {
        var d;
        return ko.value || ((d = s.value.customization_metadata) == null ? void 0 : d.widget_display) || null;
      }
    ), Jf = ae(() => {
      const d = di.value;
      return d ? typeof d.mode == "string" && d.mode !== To.mode || typeof d.width == "number" && d.width !== To.width || typeof d.height == "number" && d.height !== To.height : !1;
    }), Qf = ae(() => {
      var m;
      const d = {
        width: "100%",
        height: "100%",
        borderRadius: "var(--radius-lg)"
      };
      if (Jf.value) {
        const Y = (m = di.value) == null ? void 0 : m.mode;
        return Y === "sidebar-left" || Y === "sidebar-right" ? { ...d, borderRadius: "0" } : d;
      }
      return sn.value ? window.innerWidth <= 768 ? {
        ...d,
        width: "100vw",
        height: "100vh",
        maxWidth: "100vw",
        maxHeight: "100vh",
        minWidth: "unset",
        borderRadius: "0"
      } : window.innerWidth <= 1024 ? {
        ...d,
        width: "95%",
        maxWidth: "700px",
        minWidth: "500px",
        height: "650px"
      } : {
        ...d,
        width: "100%",
        maxWidth: "400px",
        minWidth: "400px",
        height: "580px"
      } : d;
    }), pl = ae(() => sn.value && l.value.length === 0), ed = ["form", "user_input", "rating", "product", "shopify_output"], td = ae(
      () => l.value.some(
        (d) => ed.includes(d.message_type) || Array.isArray(d.attachments) && d.attachments.length > 0
      )
    ), nd = ae(() => {
      var m, Y;
      return sn.value ? !0 : (((m = di.value) == null ? void 0 : m.mode) === "ask-ai" || ((Y = di.value) == null ? void 0 : Y.mode) === "search-bar") && !Wn.value;
    }), Ao = ae(
      () => nd.value && pe.value && !nn.value && !h.value && !As.value && !B.value && !td.value
    );
    pt(Ao, (d) => {
      vt({ type: "WIDGET_SURFACE", palette: d });
    }, { immediate: !0 });
    const sd = ae(
      () => s.value.welcome_subtitle || `Ask a question — ${r.value || "the assistant"} answers from what it knows.`
    ), rd = ae(() => {
      var d;
      return ((d = ko.value) == null ? void 0 : d.hotkey) !== !1;
    });
    return (d, m) => {
      var Y;
      return Pt.value && qt.value ? (w(), A("div", Iv, [
        g("button", {
          type: "button",
          class: "cm-error-close",
          "aria-label": "Close chat",
          title: "Close",
          onClick: hn
        }, "×"),
        m[20] || (m[20] = Es('<div class="widget-unavailable-card" data-v-d1977128><div class="widget-unavailable-icon-wrapper" data-v-d1977128><svg class="widget-unavailable-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-v-d1977128><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" data-v-d1977128></path><path d="M9 12l2 2 4-4" data-v-d1977128></path></svg></div><h2 class="widget-unavailable-title" data-v-d1977128>Chat Unavailable</h2><p class="widget-unavailable-message" data-v-d1977128> This chat widget is not currently configured. Please contact the website administrator to enable chat support. </p><div class="widget-unavailable-footer" data-v-d1977128><svg class="chattermate-logo-small" width="14" height="14" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-d1977128><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-d1977128></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-d1977128></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-d1977128></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-d1977128></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-d1977128><span class="cm-powered-prefix" data-v-d1977128>Powered by </span><strong class="cm-brand" data-v-d1977128>ChatterMate</strong></a></div></div>', 1))
      ])) : Pt.value ? (w(), A("div", Ov, [
        g("button", {
          type: "button",
          class: "cm-error-close",
          "aria-label": "Close chat",
          title: "Close",
          onClick: hn
        }, "×"),
        g("div", Lv, [
          m[21] || (m[21] = Es('<div class="auth-error-header" data-v-d1977128><svg class="auth-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-d1977128><circle cx="12" cy="12" r="10" data-v-d1977128></circle><line x1="12" y1="8" x2="12" y2="12" data-v-d1977128></line><line x1="12" y1="16" x2="12.01" y2="16" data-v-d1977128></line></svg><h2 data-v-d1977128>Authentication Error</h2></div>', 1)),
          g("p", Nv, Z(Ut.value), 1),
          g("button", {
            class: "auth-error-refresh-btn",
            onClick: m[0] || (m[0] = () => d.window.location.reload())
          }, " Refresh Page ")
        ])
      ])) : n.value && !Pt.value ? (w(), A("div", {
        key: 2,
        class: Ne(["chat-container cm-surface", [{ collapsed: !pe.value, "ask-anything-style": sn.value, aurora: qs.value }, Kf.value]]),
        style: Ee({ ...x(po), ...Qf.value, ...Gf.value })
      }, [
        Qe.value ? (w(), A("div", Pv, m[22] || (m[22] = [
          Es('<div class="loading-spinner" data-v-d1977128><div class="dot" data-v-d1977128></div><div class="dot" data-v-d1977128></div><div class="dot" data-v-d1977128></div></div><div class="loading-text" data-v-d1977128>Initializing chat...</div>', 2)
        ]))) : ne("", !0),
        !Qe.value && x(O) !== "connected" ? (w(), A("div", {
          key: 1,
          class: Ne(["connection-status", x(O)])
        }, [
          x(O) === "connecting" ? (w(), A("div", Mv, m[23] || (m[23] = [
            Nn(" Connecting to chat service... ", -1),
            g("div", { class: "loading-dots" }, [
              g("div", { class: "dot" }),
              g("div", { class: "dot" }),
              g("div", { class: "dot" })
            ], -1)
          ]))) : x(O) === "failed" ? (w(), A("div", Dv, [
            m[24] || (m[24] = Nn(" Connection failed. ", -1)),
            g("button", {
              onClick: ai,
              class: "reconnect-button"
            }, " Click here to reconnect ")
          ])) : ne("", !0)
        ], 2)) : ne("", !0),
        x(b) ? (w(), A("div", {
          key: 2,
          class: "error-alert",
          style: Ee(x(Zr))
        }, Z(x(c)), 5)) : ne("", !0),
        Ao.value ? (w(), Pn(Tg, {
          key: 3,
          messages: x(l),
          draft: Q.value,
          "agent-name": x(r),
          suggestions: yo.value,
          "welcome-title": x(s).welcome_title,
          "welcome-subtitle": sd.value,
          placeholder: zs.value,
          "input-enabled": yn.value,
          "typing-enabled": bs.value,
          loading: x(u),
          "show-citations": fi.value,
          disclaimer: cl.value ? x(Ec) : "",
          active: hl.value,
          hotkey: rd.value,
          "can-start-new-chat": ui.value,
          "starting-new-chat": Xn.value,
          "new-chat-armed": Jn.value,
          "new-chat-error": Zn.value,
          onNewChat: rl,
          onConfirmNewChat: il,
          onCancelNewChat: Ws,
          "citation-label": bo,
          "citation-tooltip": ul,
          "display-text": x(re),
          "is-streaming": x(J),
          "onUpdate:draft": m[1] || (m[1] = (p) => Q.value = p),
          onSend: en,
          onAsk: Gn,
          onClose: hn
        }, null, 8, ["messages", "draft", "agent-name", "suggestions", "welcome-title", "welcome-subtitle", "placeholder", "input-enabled", "typing-enabled", "loading", "show-citations", "disclaimer", "active", "hotkey", "can-start-new-chat", "starting-new-chat", "new-chat-armed", "new-chat-error", "display-text", "is-streaming"])) : pl.value ? (w(), A("div", {
          key: 4,
          class: Ne(["welcome-message-section", { aurora: qs.value }]),
          style: Ee(x(gs))
        }, [
          g("div", Fv, [
            g("div", $v, [
              Vs.value ? (w(), A("div", {
                key: 0,
                class: "welcome-orb",
                style: Ee(Ts.value)
              }, null, 4)) : x(ft) ? (w(), A("img", {
                key: 1,
                src: x(ft),
                alt: x(r),
                class: "welcome-avatar"
              }, null, 8, Bv)) : ne("", !0),
              g("h1", Uv, Z(x(s).welcome_title || `Welcome to ${x(r)}`), 1),
              g("p", zv, Z(x(s).welcome_subtitle || "I'm here to help you with anything you need. What can I assist you with today?"), 1)
            ])
          ]),
          g("div", Hv, [
            !x(I) && !be.value && wo.value ? (w(), A("div", jv, [
              ts(g("input", {
                "onUpdate:modelValue": m[2] || (m[2] = (p) => he.value = p),
                type: "email",
                placeholder: "Enter your email address",
                disabled: x(u) || x(O) !== "connected",
                class: Ne([{
                  invalid: he.value.trim() && !x(br)(he.value.trim()),
                  disabled: x(O) !== "connected"
                }, "welcome-email-input"])
              }, null, 10, Wv), [
                [Cs, he.value]
              ])
            ])) : ne("", !0),
            g("div", qv, [
              ts(g("input", {
                "onUpdate:modelValue": m[3] || (m[3] = (p) => Q.value = p),
                type: "text",
                placeholder: zs.value,
                onKeypress: Yn,
                onInput: ke,
                onChange: ke,
                disabled: !bs.value,
                class: Ne([{ disabled: !bs.value }, "welcome-message-field"])
              }, null, 42, Vv), [
                [Cs, Q.value]
              ]),
              g("button", {
                class: Ne(["welcome-send-button", { "aurora-send": qs.value }]),
                style: Ee(x(fn)),
                onClick: en,
                disabled: !Q.value.trim() || !yn.value || In.value
              }, [
                qs.value ? (w(), A("svg", Gv, m[25] || (m[25] = [
                  g("path", {
                    d: "M12 19V5M12 5L5 12M12 5L19 12",
                    stroke: "currentColor",
                    "stroke-width": "2",
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round"
                  }, null, -1)
                ]))) : (w(), A("svg", Yv, m[26] || (m[26] = [
                  g("path", {
                    d: "M5 12L3 21L21 12L3 3L5 12ZM5 12L13 12",
                    stroke: "currentColor",
                    "stroke-width": "2",
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round"
                  }, null, -1)
                ])))
              ], 14, Kv)
            ])
          ]),
          g("div", {
            class: "powered-by-welcome",
            style: Ee(x(Vt))
          }, m[27] || (m[27] = [
            Es('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-d1977128><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-d1977128></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-d1977128></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-d1977128></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-d1977128></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-d1977128><span class="cm-powered-prefix" data-v-d1977128>Powered by </span><strong class="cm-brand" data-v-d1977128>ChatterMate</strong></a>', 2)
          ]), 4)
        ], 6)) : ne("", !0),
        nn.value && On.value ? (w(), A("div", {
          key: 5,
          class: "landing-page-fullscreen",
          style: Ee(x(gs))
        }, [
          g("div", Xv, [
            g("div", Zv, [
              g("h2", Jv, Z(On.value.heading), 1),
              g("div", Qv, Z(On.value.content), 1)
            ]),
            g("div", eb, [
              g("button", {
                class: "landing-page-button",
                onClick: Bf
              }, Z(G.value), 1)
            ])
          ]),
          g("div", {
            class: "powered-by-landing",
            style: Ee(x(Vt))
          }, m[28] || (m[28] = [
            Es('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-d1977128><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-d1977128></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-d1977128></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-d1977128></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-d1977128></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-d1977128><span class="cm-powered-prefix" data-v-d1977128>Powered by </span><strong class="cm-brand" data-v-d1977128>ChatterMate</strong></a>', 2)
          ]), 4)
        ], 4)) : h.value && k.value ? (w(), A("div", {
          key: 6,
          class: "form-fullscreen",
          style: Ee(x(gs))
        }, [
          g("div", tb, [
            k.value.title || k.value.description ? (w(), A("div", nb, [
              k.value.title ? (w(), A("h2", sb, Z(k.value.title), 1)) : ne("", !0),
              k.value.description ? (w(), A("p", rb, Z(k.value.description), 1)) : ne("", !0)
            ])) : ne("", !0),
            g("div", ib, [
              (w(!0), A(Re, null, ht(k.value.fields, (p) => {
                var ce, Ye;
                return w(), A("div", {
                  key: p.name,
                  class: "form-field"
                }, [
                  g("label", {
                    for: `fullscreen-form-${p.name}`,
                    class: "field-label"
                  }, [
                    Nn(Z(p.label) + " ", 1),
                    p.required ? (w(), A("span", ab, "*")) : ne("", !0)
                  ], 8, ob),
                  p.type === "text" || p.type === "email" || p.type === "tel" ? (w(), A("input", {
                    key: 0,
                    id: `fullscreen-form-${p.name}`,
                    type: p.type,
                    placeholder: p.placeholder || "",
                    required: p.required,
                    minlength: p.minLength,
                    maxlength: p.maxLength,
                    value: dt.value[p.name] || "",
                    onInput: (we) => We(p.name, we.target.value),
                    onBlur: (we) => We(p.name, we.target.value),
                    class: Ne(["form-input", { error: ut.value[p.name] }]),
                    autocomplete: p.type === "email" ? "email" : p.type === "tel" ? "tel" : "off",
                    inputmode: p.type === "tel" ? "tel" : p.type === "email" ? "email" : "text"
                  }, null, 42, lb)) : p.type === "number" ? (w(), A("input", {
                    key: 1,
                    id: `fullscreen-form-${p.name}`,
                    type: "number",
                    placeholder: p.placeholder || "",
                    required: p.required,
                    min: p.minLength,
                    max: p.maxLength,
                    value: dt.value[p.name] || "",
                    onInput: (we) => We(p.name, we.target.value),
                    class: Ne(["form-input", { error: ut.value[p.name] }])
                  }, null, 42, cb)) : p.type === "textarea" ? (w(), A("textarea", {
                    key: 2,
                    id: `fullscreen-form-${p.name}`,
                    placeholder: p.placeholder || "",
                    required: p.required,
                    minlength: p.minLength,
                    maxlength: p.maxLength,
                    value: dt.value[p.name] || "",
                    onInput: (we) => We(p.name, we.target.value),
                    class: Ne(["form-textarea", { error: ut.value[p.name] }]),
                    rows: "4"
                  }, null, 42, ub)) : p.type === "select" ? (w(), A("select", {
                    key: 3,
                    id: `fullscreen-form-${p.name}`,
                    required: p.required,
                    value: dt.value[p.name] || "",
                    onChange: (we) => We(p.name, we.target.value),
                    class: Ne(["form-select", { error: ut.value[p.name] }])
                  }, [
                    g("option", db, Z(p.placeholder || "Please select..."), 1),
                    (w(!0), A(Re, null, ht((Array.isArray(p.options) ? p.options : ((ce = p.options) == null ? void 0 : ce.split(`
`)) || []).filter((we) => we.trim()), (we) => (w(), A("option", {
                      key: we,
                      value: we.trim()
                    }, Z(we.trim()), 9, hb))), 128))
                  ], 42, fb)) : p.type === "checkbox" ? (w(), A("label", pb, [
                    g("input", {
                      id: `fullscreen-form-${p.name}`,
                      type: "checkbox",
                      required: p.required,
                      checked: dt.value[p.name] || !1,
                      onChange: (we) => We(p.name, we.target.checked),
                      class: "form-checkbox"
                    }, null, 40, mb),
                    g("span", gb, Z(p.label), 1)
                  ])) : p.type === "radio" ? (w(), A("div", _b, [
                    (w(!0), A(Re, null, ht((Array.isArray(p.options) ? p.options : ((Ye = p.options) == null ? void 0 : Ye.split(`
`)) || []).filter((we) => we.trim()), (we) => (w(), A("label", {
                      key: we,
                      class: "radio-field"
                    }, [
                      g("input", {
                        type: "radio",
                        name: `fullscreen-form-${p.name}`,
                        value: we.trim(),
                        required: p.required,
                        checked: dt.value[p.name] === we.trim(),
                        onChange: (at) => We(p.name, we.trim()),
                        class: "form-radio"
                      }, null, 40, yb),
                      g("span", vb, Z(we.trim()), 1)
                    ]))), 128))
                  ])) : ne("", !0),
                  ut.value[p.name] ? (w(), A("div", bb, Z(ut.value[p.name]), 1)) : ne("", !0)
                ]);
              }), 128))
            ]),
            g("div", wb, [
              g("button", {
                onClick: m[4] || (m[4] = () => {
                  console.log("Submit button clicked!"), Mf();
                }),
                disabled: yt.value,
                class: "submit-form-button",
                style: Ee(x(fn))
              }, [
                yt.value ? (w(), A("span", Tb, m[29] || (m[29] = [
                  g("div", { class: "dot" }, null, -1),
                  g("div", { class: "dot" }, null, -1),
                  g("div", { class: "dot" }, null, -1)
                ]))) : (w(), A("span", Ab, Z(k.value.submit_button_text || "Submit"), 1))
              ], 12, kb)
            ])
          ]),
          g("div", {
            class: "powered-by-landing",
            style: Ee(x(Vt))
          }, m[30] || (m[30] = [
            Es('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-d1977128><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-d1977128></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-d1977128></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-d1977128></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-d1977128></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-d1977128><span class="cm-powered-prefix" data-v-d1977128>Powered by </span><strong class="cm-brand" data-v-d1977128>ChatterMate</strong></a>', 2)
          ]), 4)
        ], 4)) : !pl.value && pe.value && !Ao.value ? (w(), A("div", {
          key: 7,
          class: Ne(["chat-panel", { "ask-anything-chat": sn.value }]),
          style: Ee(x(gs))
        }, [
          sn.value ? (w(), A("div", {
            key: 1,
            class: "ask-anything-top",
            style: Ee(x(Jr))
          }, [
            g("div", Lb, [
              ee.value || x(ft) ? (w(), A("img", {
                key: 0,
                src: ee.value || x(ft),
                alt: x(P).human_agent_name || x(r),
                class: "header-avatar"
              }, null, 8, Nb)) : ne("", !0),
              g("div", Pb, [
                g("h3", {
                  style: Ee(x(Vt))
                }, Z(x(r)), 5),
                g("p", {
                  class: "ask-anything-subtitle",
                  style: Ee(x(Vt))
                }, Z(x(s).welcome_subtitle || "Ask me anything. I'm here to help."), 5)
              ])
            ])
          ], 4)) : (w(), A("div", {
            key: 0,
            class: "chat-header",
            style: Ee(x(Jr))
          }, [
            g("div", {
              class: "cm-header-sheen",
              style: Ee({ background: "linear-gradient(90deg, transparent, " + (x(s).accent_color || "#C9F24E") + ", transparent)" })
            }, null, 4),
            g("div", Sb, [
              !ee.value && (Vs.value || !x(ft)) ? (w(), A("div", {
                key: 0,
                class: "header-orb",
                style: Ee(Ts.value)
              }, null, 4)) : ee.value || x(ft) ? (w(), A("img", {
                key: 1,
                src: ee.value || x(ft),
                alt: x(P).human_agent_name || x(r),
                class: "header-avatar"
              }, null, 8, xb)) : ne("", !0),
              g("div", Eb, [
                g("h3", {
                  style: Ee(x(Vt))
                }, Z(x(P).human_agent_name || x(r)), 5),
                g("div", Cb, [
                  g("span", {
                    class: Ne(["status-indicator", el.value.online ? "online" : "away"])
                  }, null, 2),
                  g("span", Rb, Z(el.value.text), 1)
                ])
              ])
            ]),
            g("div", Ib, [
              ui.value ? (w(), A("button", {
                key: 0,
                type: "button",
                class: Ne(["header-new-chat", { armed: Jn.value }]),
                style: Ee(x(Vt)),
                disabled: Xn.value,
                title: x(Vi),
                "aria-label": x(Vi),
                "aria-expanded": Jn.value,
                onClick: rl
              }, m[31] || (m[31] = [
                g("svg", {
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
                  g("path", { d: "M12 20h9" }),
                  g("path", { d: "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" })
                ], -1)
              ]), 14, Ob)) : ne("", !0),
              g("button", {
                type: "button",
                class: "header-minimize",
                style: Ee(x(Vt)),
                title: "Minimize",
                "aria-label": "Minimize chat",
                onClick: hn
              }, m[32] || (m[32] = [
                g("svg", {
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
                  g("path", { d: "M6 9l6 6 6-6" })
                ], -1)
              ]), 4)
            ])
          ], 4)),
          x(T) ? (w(), A("div", Mb, m[33] || (m[33] = [
            g("div", { class: "loading-spinner" }, [
              g("div", { class: "dot" }),
              g("div", { class: "dot" }),
              g("div", { class: "dot" })
            ], -1)
          ]))) : ne("", !0),
          As.value ? (w(), A("div", {
            key: 3,
            class: "cm-email-gate",
            style: Ee(x(gs))
          }, [
            g("div", {
              class: "cm-email-gate-orb",
              style: Ee(Ts.value)
            }, null, 4),
            g("h3", Db, Z(x(s).welcome_title || "Before we start"), 1),
            m[34] || (m[34] = g("p", { class: "cm-email-gate-text" }, "Enter your email and we'll continue the chat.", -1)),
            ts(g("input", {
              "onUpdate:modelValue": m[5] || (m[5] = (p) => he.value = p),
              type: "email",
              inputmode: "email",
              autocomplete: "email",
              placeholder: "you@example.com",
              class: Ne(["cm-email-gate-input", { invalid: !!Qn.value }]),
              disabled: hr.value,
              onKeyup: xi(dl, ["enter"]),
              onInput: m[6] || (m[6] = (p) => Qn.value = "")
            }, null, 42, Fb), [
              [Cs, he.value]
            ]),
            Qn.value ? (w(), A("p", $b, Z(Qn.value), 1)) : ne("", !0),
            g("button", {
              type: "button",
              class: "cm-email-gate-btn",
              style: Ee(x(fn)),
              disabled: hr.value,
              onClick: dl
            }, Z(hr.value ? "Please wait…" : "Continue to chat"), 13, Bb)
          ], 4)) : ne("", !0),
          Jn.value && ui.value ? (w(), Pn(uf, {
            key: 4,
            busy: Xn.value,
            error: Zn.value,
            onConfirm: il,
            onCancel: Ws
          }, null, 8, ["busy", "error"])) : ne("", !0),
          ts(g("div", {
            class: "chat-messages",
            ref_key: "messagesContainer",
            ref: qn,
            role: "log",
            "aria-label": "Messages"
          }, [
            x(Nt) ? (w(), Pn(a_, {
              key: 0,
              progress: x(Nt),
              onSkip: x(v),
              onHide: x(L)
            }, null, 8, ["progress", "onSkip", "onHide"])) : ne("", !0),
            Yf.value ? (w(), A("div", Ub, [
              g("div", zb, [
                Vs.value || !x(ft) ? (w(), A("div", {
                  key: 0,
                  class: "cm-welcome-orb",
                  style: Ee(Ts.value)
                }, null, 4)) : (w(), A("img", {
                  key: 1,
                  src: x(ft),
                  alt: x(r),
                  class: "cm-welcome-avatar"
                }, null, 8, Hb)),
                g("div", {
                  class: "message-bubble cm-welcome-bubble",
                  style: Ee(x(Rn))
                }, Z(al.value), 5)
              ])
            ])) : ne("", !0),
            (w(!0), A(Re, null, ht(x(l), (p, ce) => {
              var Ye, we, at, et, pr, mr, es, Ks, ml, gl, _l, yl, vl, bl, wl, kl, Tl, Al, Sl, xl;
              return w(), A(Re, { key: ce }, [
                x(K).isBefore(p) ? (w(), A("div", jb, [
                  Vs.value || !x(ft) ? (w(), A("div", {
                    key: 0,
                    class: "cm-welcome-orb",
                    style: Ee(Ts.value)
                  }, null, 4)) : (w(), A("img", {
                    key: 1,
                    src: x(ft),
                    alt: x(r),
                    class: "cm-welcome-avatar"
                  }, null, 8, Wb)),
                  g("div", {
                    class: "message-bubble cm-welcome-bubble",
                    style: Ee(x(Rn))
                  }, Z((Ye = V.value) == null ? void 0 : Ye.message), 5)
                ])) : ne("", !0),
                g("div", {
                  class: Ne([
                    "message",
                    p.message_type === "bot" || p.message_type === "agent" ? "agent-message" : p.message_type === "system" ? "system-message" : p.message_type === "rating" ? "rating-message" : p.message_type === "form" ? "form-message" : p.message_type === "product" || p.shopify_output ? "product-message" : "user-message"
                  ])
                }, [
                  p.message_type === "bot" || p.message_type === "agent" ? (w(), A("div", qb, [
                    ee.value ? (w(), A("img", {
                      key: 0,
                      src: ee.value,
                      class: "cm-msg-avatar-img",
                      alt: ""
                    }, null, 8, Vb)) : !Vs.value && x(ft) ? (w(), A("img", {
                      key: 1,
                      src: x(ft),
                      class: "cm-msg-avatar-img",
                      alt: ""
                    }, null, 8, Kb)) : (w(), A("div", {
                      key: 2,
                      class: "cm-msg-avatar-orb",
                      style: Ee(Ts.value)
                    }, null, 4))
                  ])) : ne("", !0),
                  g("div", Gb, [
                    g("div", {
                      class: "message-bubble",
                      style: Ee(p.message_type === "system" || p.message_type === "rating" || p.message_type === "form" || p.message_type === "product" || p.shopify_output ? {} : p.message_type === "user" ? x(fn) : x(Rn))
                    }, [
                      p.message_type === "rating" ? (w(), A("div", Yb, [
                        g("p", Xb, "Rate the chat session that you had with " + Z(p.agent_name || x(P).human_agent_name || x(r) || "our agent"), 1),
                        g("div", {
                          class: Ne(["star-rating", { submitted: Kt.value || p.isSubmitted }])
                        }, [
                          (w(), A(Re, null, ht(5, (F) => g("button", {
                            key: F,
                            class: Ne(["star-button", {
                              warning: F <= (p.isSubmitted ? p.finalRating : tn.value || p.selectedRating) && (p.isSubmitted ? p.finalRating : tn.value || p.selectedRating) <= 3,
                              success: F <= (p.isSubmitted ? p.finalRating : tn.value || p.selectedRating) && (p.isSubmitted ? p.finalRating : tn.value || p.selectedRating) > 3,
                              selected: F <= (p.isSubmitted ? p.finalRating : tn.value || p.selectedRating)
                            }]),
                            onMouseover: (Gt) => !p.isSubmitted && ve(F),
                            onMouseleave: (Gt) => !p.isSubmitted && Ge,
                            onClick: (Gt) => !p.isSubmitted && ot(F),
                            disabled: Kt.value || p.isSubmitted
                          }, " ★ ", 42, Zb)), 64))
                        ], 2),
                        p.showFeedback && !p.isSubmitted ? (w(), A("div", Jb, [
                          g("div", Qb, [
                            ts(g("input", {
                              "onUpdate:modelValue": (F) => p.feedback = F,
                              placeholder: "Please share your feedback (optional)",
                              disabled: Kt.value,
                              maxlength: "500",
                              class: "feedback-input"
                            }, null, 8, ew), [
                              [Cs, p.feedback]
                            ]),
                            g("div", tw, Z(((we = p.feedback) == null ? void 0 : we.length) || 0) + "/500", 1)
                          ]),
                          g("button", {
                            onClick: (F) => xt(p.session_id, tn.value, p.feedback),
                            disabled: Kt.value || !tn.value,
                            class: "submit-rating-button",
                            style: Ee({ backgroundColor: x(s).accent_color || "var(--accent-solid)" })
                          }, Z(Kt.value ? "Submitting..." : "Submit Rating"), 13, nw)
                        ])) : ne("", !0),
                        p.isSubmitted && p.finalFeedback ? (w(), A("div", sw, [
                          g("div", rw, [
                            g("p", iw, Z(p.finalFeedback), 1)
                          ])
                        ])) : p.isSubmitted ? (w(), A("div", ow, " Thank you for your rating! ")) : ne("", !0)
                      ])) : p.message_type === "form" ? (w(), A("div", aw, [
                        (et = (at = p.attributes) == null ? void 0 : at.form_data) != null && et.title || (mr = (pr = p.attributes) == null ? void 0 : pr.form_data) != null && mr.description ? (w(), A("div", lw, [
                          (Ks = (es = p.attributes) == null ? void 0 : es.form_data) != null && Ks.title ? (w(), A("h3", cw, Z(p.attributes.form_data.title), 1)) : ne("", !0),
                          (gl = (ml = p.attributes) == null ? void 0 : ml.form_data) != null && gl.description ? (w(), A("p", uw, Z(p.attributes.form_data.description), 1)) : ne("", !0)
                        ])) : ne("", !0),
                        g("div", fw, [
                          (w(!0), A(Re, null, ht((yl = (_l = p.attributes) == null ? void 0 : _l.form_data) == null ? void 0 : yl.fields, (F) => {
                            var Gt, gr;
                            return w(), A("div", {
                              key: F.name,
                              class: "form-field"
                            }, [
                              g("label", {
                                for: `form-${F.name}`,
                                class: "field-label"
                              }, [
                                Nn(Z(F.label) + " ", 1),
                                F.required ? (w(), A("span", hw, "*")) : ne("", !0)
                              ], 8, dw),
                              F.type === "text" || F.type === "email" || F.type === "tel" ? (w(), A("input", {
                                key: 0,
                                id: `form-${F.name}`,
                                type: F.type,
                                placeholder: F.placeholder || "",
                                required: F.required,
                                minlength: F.minLength,
                                maxlength: F.maxLength,
                                value: dt.value[F.name] || "",
                                onInput: (Xe) => We(F.name, Xe.target.value),
                                onBlur: (Xe) => We(F.name, Xe.target.value),
                                class: Ne(["form-input", { error: ut.value[F.name] }]),
                                disabled: yt.value,
                                autocomplete: F.type === "email" ? "email" : F.type === "tel" ? "tel" : "off",
                                inputmode: F.type === "tel" ? "tel" : F.type === "email" ? "email" : "text"
                              }, null, 42, pw)) : F.type === "number" ? (w(), A("input", {
                                key: 1,
                                id: `form-${F.name}`,
                                type: "number",
                                placeholder: F.placeholder || "",
                                required: F.required,
                                min: F.min,
                                max: F.max,
                                value: dt.value[F.name] || "",
                                onInput: (Xe) => We(F.name, Xe.target.value),
                                class: Ne(["form-input", { error: ut.value[F.name] }]),
                                disabled: yt.value
                              }, null, 42, mw)) : F.type === "textarea" ? (w(), A("textarea", {
                                key: 2,
                                id: `form-${F.name}`,
                                placeholder: F.placeholder || "",
                                required: F.required,
                                minlength: F.minLength,
                                maxlength: F.maxLength,
                                value: dt.value[F.name] || "",
                                onInput: (Xe) => We(F.name, Xe.target.value),
                                class: Ne(["form-textarea", { error: ut.value[F.name] }]),
                                disabled: yt.value,
                                rows: "3"
                              }, null, 42, gw)) : F.type === "select" ? (w(), A("select", {
                                key: 3,
                                id: `form-${F.name}`,
                                required: F.required,
                                value: dt.value[F.name] || "",
                                onChange: (Xe) => We(F.name, Xe.target.value),
                                class: Ne(["form-select", { error: ut.value[F.name] }]),
                                disabled: yt.value
                              }, [
                                g("option", yw, Z(F.placeholder || "Select an option"), 1),
                                (w(!0), A(Re, null, ht((Array.isArray(F.options) ? F.options : ((Gt = F.options) == null ? void 0 : Gt.split(`
`)) || []).filter((Xe) => Xe.trim()), (Xe) => (w(), A("option", {
                                  key: Xe.trim(),
                                  value: Xe.trim()
                                }, Z(Xe.trim()), 9, vw))), 128))
                              ], 42, _w)) : F.type === "checkbox" ? (w(), A("div", bw, [
                                g("input", {
                                  id: `form-${F.name}`,
                                  type: "checkbox",
                                  checked: dt.value[F.name] || !1,
                                  onChange: (Xe) => We(F.name, Xe.target.checked),
                                  class: "form-checkbox",
                                  disabled: yt.value
                                }, null, 40, ww),
                                g("label", {
                                  for: `form-${F.name}`,
                                  class: "checkbox-label"
                                }, Z(F.placeholder || F.label), 9, kw)
                              ])) : F.type === "radio" ? (w(), A("div", Tw, [
                                (w(!0), A(Re, null, ht((Array.isArray(F.options) ? F.options : ((gr = F.options) == null ? void 0 : gr.split(`
`)) || []).filter((Xe) => Xe.trim()), (Xe) => (w(), A("div", {
                                  key: Xe.trim(),
                                  class: "radio-option"
                                }, [
                                  g("input", {
                                    id: `form-${F.name}-${Xe.trim()}`,
                                    name: `form-${F.name}`,
                                    type: "radio",
                                    value: Xe.trim(),
                                    checked: dt.value[F.name] === Xe.trim(),
                                    onChange: (So) => We(F.name, Xe.trim()),
                                    class: "form-radio",
                                    disabled: yt.value
                                  }, null, 40, Aw),
                                  g("label", {
                                    for: `form-${F.name}-${Xe.trim()}`,
                                    class: "radio-label"
                                  }, Z(Xe.trim()), 9, Sw)
                                ]))), 128))
                              ])) : ne("", !0),
                              ut.value[F.name] ? (w(), A("div", xw, Z(ut.value[F.name]), 1)) : ne("", !0)
                            ]);
                          }), 128))
                        ]),
                        g("div", Ew, [
                          g("button", {
                            onClick: () => {
                              var F;
                              console.log("Regular form submit button clicked!"), fr((F = p.attributes) == null ? void 0 : F.form_data);
                            },
                            disabled: yt.value,
                            class: "form-submit-button",
                            style: Ee(x(fn))
                          }, Z(yt.value ? "Submitting..." : ((bl = (vl = p.attributes) == null ? void 0 : vl.form_data) == null ? void 0 : bl.submit_button_text) || "Submit"), 13, Cw)
                        ])
                      ])) : p.message_type === "user_input" ? (w(), A("div", Rw, [
                        (wl = p.attributes) != null && wl.prompt_message && p.attributes.prompt_message.trim() ? (w(), A("div", Iw, Z(p.attributes.prompt_message), 1)) : ne("", !0),
                        p.isSubmitted ? (w(), A("div", Pw, [
                          m[35] || (m[35] = g("strong", null, "Your input:", -1)),
                          Nn(" " + Z(p.submittedValue) + " ", 1),
                          (kl = p.attributes) != null && kl.confirmation_message && p.attributes.confirmation_message.trim() ? (w(), A("div", Mw, Z(p.attributes.confirmation_message), 1)) : ne("", !0)
                        ])) : (w(), A("div", Ow, [
                          ts(g("textarea", {
                            "onUpdate:modelValue": (F) => p.userInputValue = F,
                            class: "user-input-textarea",
                            placeholder: "Type your message here...",
                            rows: "3",
                            onKeydown: [
                              xi(Os((F) => _o(p), ["ctrl"]), ["enter"]),
                              xi(Os((F) => _o(p), ["meta"]), ["enter"])
                            ]
                          }, null, 40, Lw), [
                            [Cs, p.userInputValue]
                          ]),
                          g("button", {
                            class: "user-input-submit-button",
                            onClick: (F) => _o(p),
                            disabled: !p.userInputValue || !p.userInputValue.trim()
                          }, " Submit ", 8, Nw)
                        ]))
                      ])) : p.shopify_output || p.message_type === "product" ? (w(), A("div", Dw, [
                        p.message ? (w(), A("div", {
                          key: 0,
                          innerHTML: x(Ci)(((Al = (Tl = p.shopify_output) == null ? void 0 : Tl.products) == null ? void 0 : Al.length) > 0 ? Ff(p.message) : p.message),
                          class: "product-message-text"
                        }, null, 8, Fw)) : ne("", !0),
                        (Sl = p.shopify_output) != null && Sl.products && p.shopify_output.products.length > 0 ? (w(), A("div", $w, [
                          m[37] || (m[37] = g("h3", { class: "carousel-title" }, "Products", -1)),
                          g("div", Bw, [
                            (w(!0), A(Re, null, ht(p.shopify_output.products, (F) => {
                              var Gt, gr;
                              return w(), A("div", {
                                key: F.id,
                                class: "product-card-compact carousel-item",
                                role: "group",
                                "aria-label": F.title
                              }, [
                                (Gt = F.image) != null && Gt.src ? (w(), A("div", zw, [
                                  g("img", {
                                    src: F.image.src,
                                    alt: F.title,
                                    class: "product-thumbnail"
                                  }, null, 8, Hw)
                                ])) : ne("", !0),
                                g("div", jw, [
                                  g("div", Ww, [
                                    g("div", qw, Z(F.title), 1),
                                    F.variant_title && F.variant_title !== "Default Title" ? (w(), A("div", Vw, Z(F.variant_title), 1)) : ne("", !0),
                                    g("div", Kw, Z(F.price_formatted || x(a)(F.price, F.currency)), 1)
                                  ]),
                                  g("div", Gw, [
                                    x(g_)(F, (gr = p.shopify_output) == null ? void 0 : gr.shop_domain) ? (w(), Pn(A_, {
                                      key: 0,
                                      "variant-id": F.cart_variant_id
                                    }, null, 8, ["variant-id"])) : ne("", !0),
                                    g("button", {
                                      class: "view-details-button-compact",
                                      onClick: (Xe) => {
                                        var So;
                                        return Df(F, (So = p.shopify_output) == null ? void 0 : So.shop_domain);
                                      }
                                    }, m[36] || (m[36] = [
                                      Nn(" View product ", -1),
                                      g("span", { class: "external-link-icon" }, "↗", -1)
                                    ]), 8, Yw)
                                  ])
                                ])
                              ], 8, Uw);
                            }), 128))
                          ])
                        ])) : !p.message && ((xl = p.shopify_output) != null && xl.products) && p.shopify_output.products.length === 0 ? (w(), A("div", Xw, m[38] || (m[38] = [
                          g("p", null, "No products found.", -1)
                        ]))) : !p.message && p.shopify_output && !p.shopify_output.products ? (w(), A("div", Zw, m[39] || (m[39] = [
                          g("p", null, "No products to display.", -1)
                        ]))) : ne("", !0)
                      ])) : (w(), A(Re, { key: 4 }, [
                        x(J)(ce) ? (w(), A("div", {
                          key: 0,
                          class: "message-streaming",
                          innerHTML: x(Ci)(x(re)(ce, p.message))
                        }, null, 8, Jw)) : (w(), A("div", {
                          key: 1,
                          innerHTML: x(Ci)(p.message)
                        }, null, 8, Qw)),
                        p.attachments && p.attachments.length > 0 ? (w(), A("div", e0, [
                          (w(!0), A(Re, null, ht(p.attachments, (F) => (w(), A("div", {
                            key: F.id,
                            class: "attachment-item"
                          }, [
                            x(lr)(F.content_type) ? (w(), A("div", t0, [
                              g("img", {
                                src: x(ys)(F.file_url),
                                alt: F.filename,
                                class: "attachment-image",
                                onClick: Os((Gt) => x(Kn)({ url: F.file_url, filename: F.filename, type: F.content_type, file_url: x(ys)(F.file_url), size: void 0 }), ["stop"]),
                                style: { cursor: "pointer" }
                              }, null, 8, n0),
                              g("div", s0, [
                                g("a", {
                                  href: x(ys)(F.file_url),
                                  target: "_blank",
                                  class: "attachment-link"
                                }, [
                                  m[40] || (m[40] = g("svg", {
                                    width: "14",
                                    height: "14",
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    stroke: "currentColor",
                                    "stroke-width": "2",
                                    "stroke-linecap": "round",
                                    "stroke-linejoin": "round"
                                  }, [
                                    g("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
                                    g("polyline", { points: "7 10 12 15 17 10" }),
                                    g("line", {
                                      x1: "12",
                                      y1: "15",
                                      x2: "12",
                                      y2: "3"
                                    })
                                  ], -1)),
                                  Nn(" " + Z(F.filename) + " ", 1),
                                  g("span", i0, "(" + Z(x(Us)(F.file_size)) + ")", 1)
                                ], 8, r0)
                              ])
                            ])) : (w(), A("a", {
                              key: 1,
                              href: x(ys)(F.file_url),
                              target: "_blank",
                              class: "attachment-link"
                            }, [
                              m[41] || (m[41] = g("svg", {
                                width: "14",
                                height: "14",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                stroke: "currentColor",
                                "stroke-width": "2",
                                "stroke-linecap": "round",
                                "stroke-linejoin": "round"
                              }, [
                                g("path", { d: "M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" })
                              ], -1)),
                              Nn(" " + Z(F.filename) + " ", 1),
                              g("span", a0, "(" + Z(x(Us)(F.file_size)) + ")", 1)
                            ], 8, o0))
                          ]))), 128))
                        ])) : ne("", !0)
                      ], 64))
                    ], 4),
                    fi.value && (p.message_type === "bot" || p.message_type === "agent") && p.sources && p.sources.length ? (w(), A("div", l0, [
                      m[42] || (m[42] = g("span", { class: "citation-label" }, "Sources", -1)),
                      (w(!0), A(Re, null, ht(p.sources, (F, Gt) => (w(), A("span", {
                        key: Gt,
                        class: "citation-chip",
                        title: ul(F)
                      }, Z(bo(F)), 9, c0))), 128))
                    ])) : ne("", !0),
                    g("div", u0, [
                      p.message_type === "user" ? (w(), A("span", f0, " You ")) : ne("", !0)
                    ])
                  ])
                ], 2),
                (w(!0), A(Re, null, ht(x(Me)(ce + 1), (F, Gt) => (w(), Pn(jg, {
                  key: `receipt-${ce}-${Gt}`,
                  receipt: F
                }, null, 8, ["receipt"]))), 128))
              ], 64);
            }), 128)),
            x(K).isLast() ? (w(), A("div", d0, [
              Vs.value || !x(ft) ? (w(), A("div", {
                key: 0,
                class: "cm-welcome-orb",
                style: Ee(Ts.value)
              }, null, 4)) : (w(), A("img", {
                key: 1,
                src: x(ft),
                alt: x(r),
                class: "cm-welcome-avatar"
              }, null, 8, h0)),
              g("div", {
                class: "message-bubble cm-welcome-bubble",
                style: Ee(x(Rn))
              }, Z((Y = V.value) == null ? void 0 : Y.message), 5)
            ])) : ne("", !0),
            M.value.length ? (w(), Pn(f_, {
              key: 3,
              chips: M.value,
              disabled: !yn.value || x(_n),
              onPick: U
            }, null, 8, ["chips", "disabled"])) : ne("", !0),
            x(wt) ? (w(), Pn(Dg, {
              key: 4,
              pending: x(wt),
              onApprove: x(Bt),
              onDecline: x(jt)
            }, null, 8, ["pending", "onApprove", "onDecline"])) : ne("", !0),
            x(u) && !x(wt) ? (w(), A("div", {
              key: 5,
              class: Ne(["typing-indicator", { "reading-indicator": fi.value }])
            }, [
              fi.value ? (w(), A(Re, { key: 0 }, [
                m[43] || (m[43] = g("div", {
                  class: "reading-bars",
                  "aria-hidden": "true"
                }, [
                  g("span"),
                  g("span"),
                  g("span")
                ], -1)),
                m[44] || (m[44] = g("span", { class: "reading-label" }, "reading knowledge base", -1))
              ], 64)) : (w(), A("div", {
                key: 1,
                class: "cm-typing-bubble",
                style: Ee(x(Rn))
              }, m[45] || (m[45] = [
                g("span", { class: "cm-typing-dot" }, null, -1),
                g("span", { class: "cm-typing-dot" }, null, -1),
                g("span", { class: "cm-typing-dot" }, null, -1)
              ]), 4))
            ], 2)) : ne("", !0)
          ], 512), [
            [rp, !As.value]
          ]),
          Xf.value ? (w(), A("div", p0, [
            (w(!0), A(Re, null, ht(yo.value, (p) => (w(), A("button", {
              key: p,
              type: "button",
              class: "cm-quick-action",
              disabled: !yn.value,
              onClick: (ce) => Gn(p)
            }, Z(p), 9, m0))), 128))
          ])) : ne("", !0),
          !B.value && !As.value ? (w(), A("div", {
            key: 6,
            class: Ne(["chat-input", { "ask-anything-input": sn.value }])
          }, [
            g("input", {
              ref_key: "fileInputRef",
              ref: Qr,
              type: "file",
              accept: j0,
              multiple: "",
              style: { display: "none" },
              onChange: m[7] || (m[7] = //@ts-ignore
              (...p) => x(ei) && x(ei)(...p))
            }, null, 544),
            x($e).length > 0 ? (w(), A("div", g0, [
              (w(!0), A(Re, null, ht(x($e), (p, ce) => (w(), A("div", {
                key: ce,
                class: "file-preview-widget"
              }, [
                g("div", _0, [
                  x(vs)(p.type) ? (w(), A("img", {
                    key: 0,
                    src: x(cr)(p),
                    alt: p.filename,
                    class: "file-preview-image-widget",
                    onClick: Os((Ye) => x(Kn)(p), ["stop"]),
                    style: { cursor: "pointer" }
                  }, null, 8, y0)) : (w(), A("div", {
                    key: 1,
                    class: "file-preview-icon-widget",
                    onClick: Os((Ye) => x(Kn)(p), ["stop"]),
                    style: { cursor: "pointer" }
                  }, m[46] || (m[46] = [
                    g("svg", {
                      width: "20",
                      height: "20",
                      viewBox: "0 0 24 24",
                      fill: "none",
                      stroke: "currentColor",
                      "stroke-width": "2"
                    }, [
                      g("path", { d: "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" }),
                      g("polyline", { points: "13 2 13 9 20 9" })
                    ], -1)
                  ]), 8, v0))
                ]),
                g("div", b0, [
                  g("div", w0, Z(p.filename), 1),
                  g("div", k0, Z(x(Us)(p.size)), 1)
                ]),
                g("button", {
                  type: "button",
                  class: "file-preview-remove-widget",
                  onClick: (Ye) => x(ri)(ce),
                  title: "Remove file"
                }, " × ", 8, T0)
              ]))), 128))
            ])) : ne("", !0),
            Qa.value ? (w(), A("div", A0, m[47] || (m[47] = [
              g("div", { class: "upload-spinner-widget" }, null, -1),
              g("span", { class: "upload-text-widget" }, "Uploading files...", -1)
            ]))) : ne("", !0),
            g("div", S0, [
              ts(g("input", {
                "onUpdate:modelValue": m[8] || (m[8] = (p) => Q.value = p),
                type: "text",
                placeholder: zs.value,
                onKeypress: Yn,
                onInput: ke,
                onChange: ke,
                onPaste: m[9] || (m[9] = //@ts-ignore
                (...p) => x(dn) && x(dn)(...p)),
                onDrop: m[10] || (m[10] = //@ts-ignore
                (...p) => x(ti) && x(ti)(...p)),
                onDragover: m[11] || (m[11] = //@ts-ignore
                (...p) => x(ni) && x(ni)(...p)),
                onDragleave: m[12] || (m[12] = //@ts-ignore
                (...p) => x(si) && x(si)(...p)),
                disabled: !bs.value,
                class: Ne({ disabled: !bs.value, "ask-anything-field": sn.value })
              }, null, 42, x0), [
                [Cs, Q.value]
              ]),
              $f.value ? (w(), A("button", {
                key: 0,
                type: "button",
                class: "attach-button",
                disabled: Qa.value,
                onClick: m[13] || (m[13] = //@ts-ignore
                (...p) => x(ii) && x(ii)(...p)),
                title: `Attach files (${x($e).length}/${Hc} used) or paste screenshots`
              }, m[48] || (m[48] = [
                g("svg", {
                  width: "22",
                  height: "22",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  xmlns: "http://www.w3.org/2000/svg"
                }, [
                  g("path", {
                    d: "M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48",
                    stroke: "currentColor",
                    "stroke-width": "2.2",
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round"
                  })
                ], -1),
                g("span", { class: "attach-button-glow" }, null, -1)
              ]), 8, E0)) : ne("", !0),
              g("button", {
                class: Ne(["send-button", { "ask-anything-send": sn.value }]),
                "aria-label": "Send message",
                style: Ee(x(fn)),
                onClick: en,
                disabled: !Q.value.trim() && x($e).length === 0 || !yn.value || In.value
              }, m[49] || (m[49] = [
                g("svg", {
                  width: "20",
                  height: "20",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  xmlns: "http://www.w3.org/2000/svg"
                }, [
                  g("path", {
                    d: "M12 19V5M5 12l7-7 7 7",
                    stroke: "currentColor",
                    "stroke-width": "2.2",
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round"
                  })
                ], -1)
              ]), 14, C0)
            ]),
            In.value ? (w(), A("p", R0, Z(x(x_)), 1)) : ne("", !0)
          ], 2)) : B.value && !As.value ? (w(), A("div", I0, [
            g("div", O0, [
              m[50] || (m[50] = g("p", { class: "ended-text" }, "This chat has ended.", -1)),
              g("button", {
                class: "start-new-conversation-button",
                style: Ee(x(fn)),
                onClick: qf
              }, " Click here to start a new conversation ", 4)
            ])
          ])) : ne("", !0),
          cl.value ? (w(), A("div", L0, Z(x(Ec)), 1)) : ne("", !0),
          g("div", {
            class: "powered-by",
            style: Ee(x(Vt))
          }, m[51] || (m[51] = [
            Es('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-d1977128><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-d1977128></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-d1977128></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-d1977128></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-d1977128></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-d1977128><span class="cm-powered-prefix" data-v-d1977128>Powered by </span><strong class="cm-brand" data-v-d1977128>ChatterMate</strong></a>', 2)
          ]), 4)
        ], 6)) : ne("", !0),
        ur.value ? (w(), A("div", N0, [
          g("div", P0, [
            m[52] || (m[52] = g("h3", null, "Rate your conversation", -1)),
            g("div", M0, [
              (w(), A(Re, null, ht(5, (p) => g("button", {
                key: p,
                onClick: (ce) => ws.value = p,
                class: Ne([{ active: p <= ws.value }, "star-button"])
              }, " ★ ", 10, D0)), 64))
            ]),
            ts(g("textarea", {
              "onUpdate:modelValue": m[14] || (m[14] = (p) => js.value = p),
              placeholder: "Additional feedback (optional)",
              class: "rating-feedback"
            }, null, 512), [
              [Cs, js.value]
            ]),
            g("div", F0, [
              g("button", {
                onClick: m[15] || (m[15] = (p) => d.submitRating(ws.value, js.value)),
                disabled: !ws.value,
                class: "submit-button",
                style: Ee(x(fn))
              }, " Submit ", 12, $0),
              g("button", {
                onClick: m[16] || (m[16] = (p) => ur.value = !1),
                class: "skip-rating"
              }, " Skip ")
            ])
          ])
        ])) : ne("", !0),
        x(Vn) ? (w(), A("div", {
          key: 9,
          class: "preview-modal-overlay",
          onClick: m[19] || (m[19] = //@ts-ignore
          (...p) => x(Qt) && x(Qt)(...p))
        }, [
          g("div", {
            class: "preview-modal-content",
            onClick: m[18] || (m[18] = Os(() => {
            }, ["stop"]))
          }, [
            g("button", {
              class: "preview-modal-close",
              onClick: m[17] || (m[17] = //@ts-ignore
              (...p) => x(Qt) && x(Qt)(...p))
            }, "×"),
            x(_s) && x(vs)(x(_s).type) ? (w(), A("div", B0, [
              g("img", {
                src: x(cr)(x(_s)),
                alt: x(_s).filename,
                class: "preview-modal-image"
              }, null, 8, U0),
              g("div", z0, Z(x(_s).filename), 1)
            ])) : ne("", !0)
          ])
        ])) : ne("", !0)
      ], 6)) : (w(), A("div", H0));
    };
  }
}), q0 = /* @__PURE__ */ ms(W0, [["__scopeId", "data-v-d1977128"]]);
window.process || (window.process = { env: { NODE_ENV: "production" } });
async function V0() {
  if (!await V_()) return;
  const e = window.__INITIAL_DATA__, t = new URL(window.location.href), n = t.searchParams.get("preview") === "true", s = (a) => {
    const l = t.searchParams.get(a);
    if (!(!l || l === "undefined" || l.trim() === ""))
      return l;
  }, r = n ? s("widget_id") || (e == null ? void 0 : e.widgetId) || void 0 : (e == null ? void 0 : e.widgetId) || void 0, i = n ? (e == null ? void 0 : e.initialToken) || s("token") || void 0 : (e == null ? void 0 : e.initialToken) || void 0;
  Ap(q0, {
    widgetId: r,
    token: i || void 0,
    initialAuthError: null
    // Let backend determine if auth is required
  }).mount("#app"), K_();
}
V0();
