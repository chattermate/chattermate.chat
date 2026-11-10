var eh = Object.defineProperty;
var th = (e, t, n) => t in e ? eh(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var tt = (e, t, n) => th(e, typeof t != "symbol" ? t + "" : t, n);
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
const nt = {}, Js = [], Sn = () => {
}, nh = () => !1, Xi = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), ka = (e) => e.startsWith("onUpdate:"), Ot = Object.assign, Ta = (e, t) => {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}, sh = Object.prototype.hasOwnProperty, Ve = (e, t) => sh.call(e, t), Ae = Array.isArray, Qs = (e) => Zi(e) === "[object Map]", zc = (e) => Zi(e) === "[object Set]", Ce = (e) => typeof e == "function", gt = (e) => typeof e == "string", hs = (e) => typeof e == "symbol", ct = (e) => e !== null && typeof e == "object", Hc = (e) => (ct(e) || Ce(e)) && Ce(e.then) && Ce(e.catch), jc = Object.prototype.toString, Zi = (e) => jc.call(e), rh = (e) => Zi(e).slice(8, -1), Wc = (e) => Zi(e) === "[object Object]", Aa = (e) => gt(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, Or = /* @__PURE__ */ wa(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), Ji = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (n) => t[n] || (t[n] = e(n));
}, ih = /-(\w)/g, cs = Ji(
  (e) => e.replace(ih, (t, n) => n ? n.toUpperCase() : "")
), oh = /\B([A-Z])/g, ds = Ji(
  (e) => e.replace(oh, "-$1").toLowerCase()
), qc = Ji((e) => e.charAt(0).toUpperCase() + e.slice(1)), Eo = Ji(
  (e) => e ? `on${qc(e)}` : ""
), os = (e, t) => !Object.is(e, t), bi = (e, ...t) => {
  for (let n = 0; n < e.length; n++)
    e[n](...t);
}, Jo = (e, t, n, s = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: s,
    value: n
  });
}, Qo = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let El;
const Qi = () => El || (El = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function xe(e) {
  if (Ae(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
      const s = e[n], r = gt(s) ? uh(s) : xe(s);
      if (r)
        for (const i in r)
          t[i] = r[i];
    }
    return t;
  } else if (gt(e) || ct(e))
    return e;
}
const ah = /;(?![^(]*\))/g, lh = /:([^]+)/, ch = /\/\*[^]*?\*\//g;
function uh(e) {
  const t = {};
  return e.replace(ch, "").split(ah).forEach((n) => {
    if (n) {
      const s = n.split(lh);
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
const fh = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", hh = /* @__PURE__ */ wa(fh);
function Vc(e) {
  return !!e || e === "";
}
const Kc = (e) => !!(e && e.__v_isRef === !0), J = (e) => gt(e) ? e : e == null ? "" : Ae(e) || ct(e) && (e.toString === jc || !Ce(e.toString)) ? Kc(e) ? J(e.value) : JSON.stringify(e, Gc, 2) : String(e), Gc = (e, t) => Kc(t) ? Gc(e, t.value) : Qs(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (n, [s, r], i) => (n[xo(s, i) + " =>"] = r, n),
    {}
  )
} : zc(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((n) => xo(n))
} : hs(t) ? xo(t) : ct(t) && !Ae(t) && !Wc(t) ? String(t) : t, xo = (e, t = "") => {
  var n;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    hs(e) ? `Symbol(${(n = e.description) != null ? n : t})` : e
  );
};
/**
* @vue/reactivity v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let Ht;
class dh {
  constructor(t = !1) {
    this.detached = t, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this.parent = Ht, !t && Ht && (this.index = (Ht.scopes || (Ht.scopes = [])).push(
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
      const n = Ht;
      try {
        return Ht = this, t();
      } finally {
        Ht = n;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = Ht, Ht = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    this._on > 0 && --this._on === 0 && (Ht = this.prevScope, this.prevScope = void 0);
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
function ph() {
  return Ht;
}
let it;
const Co = /* @__PURE__ */ new WeakSet();
class Yc {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, Ht && Ht.active && Ht.effects.push(this);
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
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Zc(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, xl(this), Jc(this);
    const t = it, n = gn;
    it = this, gn = !0;
    try {
      return this.fn();
    } finally {
      Qc(this), it = t, gn = n, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        xa(t);
      this.deps = this.depsTail = void 0, xl(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? Co.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    ea(this) && this.run();
  }
  get dirty() {
    return ea(this);
  }
}
let Xc = 0, Lr, Nr;
function Zc(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = Nr, Nr = e;
    return;
  }
  e.next = Lr, Lr = e;
}
function Sa() {
  Xc++;
}
function Ea() {
  if (--Xc > 0)
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
function Jc(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Qc(e) {
  let t, n = e.depsTail, s = n;
  for (; s; ) {
    const r = s.prevDep;
    s.version === -1 ? (s === n && (n = r), xa(s), mh(s)) : t = s, s.dep.activeLink = s.prevActiveLink, s.prevActiveLink = void 0, s = r;
  }
  e.deps = t, e.depsTail = n;
}
function ea(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (eu(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function eu(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === Ur) || (e.globalVersion = Ur, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !ea(e))))
    return;
  e.flags |= 2;
  const t = e.dep, n = it, s = gn;
  it = e, gn = !0;
  try {
    Jc(e);
    const r = e.fn(e._value);
    (t.version === 0 || os(r, e._value)) && (e.flags |= 128, e._value = r, t.version++);
  } catch (r) {
    throw t.version++, r;
  } finally {
    it = n, gn = s, Qc(e), e.flags &= -3;
  }
}
function xa(e, t = !1) {
  const { dep: n, prevSub: s, nextSub: r } = e;
  if (s && (s.nextSub = r, e.prevSub = void 0), r && (r.prevSub = s, e.nextSub = void 0), n.subs === e && (n.subs = s, !s && n.computed)) {
    n.computed.flags &= -5;
    for (let i = n.computed.deps; i; i = i.nextDep)
      xa(i, !0);
  }
  !t && !--n.sc && n.map && n.map.delete(n.key);
}
function mh(e) {
  const { prevDep: t, nextDep: n } = e;
  t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
let gn = !0;
const tu = [];
function Bn() {
  tu.push(gn), gn = !1;
}
function Un() {
  const e = tu.pop();
  gn = e === void 0 ? !0 : e;
}
function xl(e) {
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
class gh {
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
    if (!it || !gn || it === this.computed)
      return;
    let n = this.activeLink;
    if (n === void 0 || n.sub !== it)
      n = this.activeLink = new gh(it, this), it.deps ? (n.prevDep = it.depsTail, it.depsTail.nextDep = n, it.depsTail = n) : it.deps = it.depsTail = n, nu(n);
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
      Ea();
    }
  }
}
function nu(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let s = t.deps; s; s = s.nextDep)
        nu(s);
    }
    const n = e.dep.subs;
    n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
  }
}
const ta = /* @__PURE__ */ new WeakMap(), Ps = Symbol(
  ""
), na = Symbol(
  ""
), zr = Symbol(
  ""
);
function Rt(e, t, n) {
  if (gn && it) {
    let s = ta.get(e);
    s || ta.set(e, s = /* @__PURE__ */ new Map());
    let r = s.get(n);
    r || (s.set(n, r = new Ca()), r.map = s, r.key = n), r.track();
  }
}
function Mn(e, t, n, s, r, i) {
  const o = ta.get(e);
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
        (T === "length" || T === zr || !hs(T) && T >= c) && a(b);
      });
    } else
      switch ((n !== void 0 || o.has(void 0)) && a(o.get(n)), u && a(o.get(zr)), t) {
        case "add":
          l ? u && a(o.get("length")) : (a(o.get(Ps)), Qs(e) && a(o.get(na)));
          break;
        case "delete":
          l || (a(o.get(Ps)), Qs(e) && a(o.get(na)));
          break;
        case "set":
          Qs(e) && a(o.get(Ps));
          break;
      }
  }
  Ea();
}
function Gs(e) {
  const t = Be(e);
  return t === e ? t : (Rt(t, "iterate", zr), un(e) ? t : t.map(St));
}
function eo(e) {
  return Rt(e = Be(e), "iterate", zr), e;
}
const _h = {
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
    return gr(this, "pop");
  },
  push(...e) {
    return gr(this, "push", e);
  },
  reduce(e, ...t) {
    return Cl(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return Cl(this, "reduceRight", e, t);
  },
  shift() {
    return gr(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return Ln(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return gr(this, "splice", e);
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
    return gr(this, "unshift", e);
  },
  values() {
    return Ro(this, "values", St);
  }
};
function Ro(e, t, n) {
  const s = eo(e), r = s[t]();
  return s !== e && !un(e) && (r._next = r.next, r.next = () => {
    const i = r._next();
    return i.value && (i.value = n(i.value)), i;
  }), r;
}
const yh = Array.prototype;
function Ln(e, t, n, s, r, i) {
  const o = eo(e), a = o !== e && !un(e), l = o[t];
  if (l !== yh[t]) {
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
function Cl(e, t, n, s) {
  const r = eo(e);
  let i = n;
  return r !== e && (un(e) ? n.length > 3 && (i = function(o, a, l) {
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
function gr(e, t, n = []) {
  Bn(), Sa();
  const s = Be(e)[t].apply(e, n);
  return Ea(), Un(), s;
}
const vh = /* @__PURE__ */ wa("__proto__,__v_isRef,__isVue"), su = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(hs)
);
function bh(e) {
  hs(e) || (e = String(e));
  const t = Be(this);
  return Rt(t, "has", e), t.hasOwnProperty(e);
}
class ru {
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
      return s === (r ? i ? Ih : lu : i ? au : ou).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(s) ? t : void 0;
    const o = Ae(t);
    if (!r) {
      let l;
      if (o && (l = _h[n]))
        return l;
      if (n === "hasOwnProperty")
        return bh;
    }
    const a = Reflect.get(
      t,
      n,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      It(t) ? t : s
    );
    return (hs(n) ? su.has(n) : vh(n)) || (r || Rt(t, "get", n), i) ? a : It(a) ? o && Aa(n) ? a : a.value : ct(a) ? r ? cu(a) : to(a) : a;
  }
}
class iu extends ru {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, n, s, r) {
    let i = t[n];
    if (!this._isShallow) {
      const l = us(i);
      if (!un(s) && !us(s) && (i = Be(i), s = Be(s)), !Ae(t) && It(i) && !It(s))
        return l ? !1 : (i.value = s, !0);
    }
    const o = Ae(t) && Aa(n) ? Number(n) < t.length : Ve(t, n), a = Reflect.set(
      t,
      n,
      s,
      It(t) ? t : r
    );
    return t === Be(r) && (o ? os(s, i) && Mn(t, "set", n, s) : Mn(t, "add", n, s)), a;
  }
  deleteProperty(t, n) {
    const s = Ve(t, n);
    t[n];
    const r = Reflect.deleteProperty(t, n);
    return r && s && Mn(t, "delete", n, void 0), r;
  }
  has(t, n) {
    const s = Reflect.has(t, n);
    return (!hs(n) || !su.has(n)) && Rt(t, "has", n), s;
  }
  ownKeys(t) {
    return Rt(
      t,
      "iterate",
      Ae(t) ? "length" : Ps
    ), Reflect.ownKeys(t);
  }
}
class wh extends ru {
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
const kh = /* @__PURE__ */ new iu(), Th = /* @__PURE__ */ new wh(), Ah = /* @__PURE__ */ new iu(!0);
const sa = (e) => e, hi = (e) => Reflect.getPrototypeOf(e);
function Sh(e, t, n) {
  return function(...s) {
    const r = this.__v_raw, i = Be(r), o = Qs(i), a = e === "entries" || e === Symbol.iterator && o, l = e === "keys" && o, u = r[e](...s), c = n ? sa : t ? Mi : St;
    return !t && Rt(
      i,
      "iterate",
      l ? na : Ps
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
function di(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function Eh(e, t) {
  const n = {
    get(r) {
      const i = this.__v_raw, o = Be(i), a = Be(r);
      e || (os(r, a) && Rt(o, "get", r), Rt(o, "get", a));
      const { has: l } = hi(o), u = t ? sa : e ? Mi : St;
      if (l.call(o, r))
        return u(i.get(r));
      if (l.call(o, a))
        return u(i.get(a));
      i !== o && i.get(r);
    },
    get size() {
      const r = this.__v_raw;
      return !e && Rt(Be(r), "iterate", Ps), Reflect.get(r, "size", r);
    },
    has(r) {
      const i = this.__v_raw, o = Be(i), a = Be(r);
      return e || (os(r, a) && Rt(o, "has", r), Rt(o, "has", a)), r === a ? i.has(r) : i.has(r) || i.has(a);
    },
    forEach(r, i) {
      const o = this, a = o.__v_raw, l = Be(a), u = t ? sa : e ? Mi : St;
      return !e && Rt(l, "iterate", Ps), a.forEach((c, b) => r.call(i, u(c), u(b), o));
    }
  };
  return Ot(
    n,
    e ? {
      add: di("add"),
      set: di("set"),
      delete: di("delete"),
      clear: di("clear")
    } : {
      add(r) {
        !t && !un(r) && !us(r) && (r = Be(r));
        const i = Be(this);
        return hi(i).has.call(i, r) || (i.add(r), Mn(i, "add", r, r)), this;
      },
      set(r, i) {
        !t && !un(i) && !us(i) && (i = Be(i));
        const o = Be(this), { has: a, get: l } = hi(o);
        let u = a.call(o, r);
        u || (r = Be(r), u = a.call(o, r));
        const c = l.call(o, r);
        return o.set(r, i), u ? os(i, c) && Mn(o, "set", r, i) : Mn(o, "add", r, i), this;
      },
      delete(r) {
        const i = Be(this), { has: o, get: a } = hi(i);
        let l = o.call(i, r);
        l || (r = Be(r), l = o.call(i, r)), a && a.call(i, r);
        const u = i.delete(r);
        return l && Mn(i, "delete", r, void 0), u;
      },
      clear() {
        const r = Be(this), i = r.size !== 0, o = r.clear();
        return i && Mn(
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
    n[r] = Sh(r, e, t);
  }), n;
}
function Ra(e, t) {
  const n = Eh(e, t);
  return (s, r, i) => r === "__v_isReactive" ? !e : r === "__v_isReadonly" ? e : r === "__v_raw" ? s : Reflect.get(
    Ve(n, r) && r in s ? n : s,
    r,
    i
  );
}
const xh = {
  get: /* @__PURE__ */ Ra(!1, !1)
}, Ch = {
  get: /* @__PURE__ */ Ra(!1, !0)
}, Rh = {
  get: /* @__PURE__ */ Ra(!0, !1)
};
const ou = /* @__PURE__ */ new WeakMap(), au = /* @__PURE__ */ new WeakMap(), lu = /* @__PURE__ */ new WeakMap(), Ih = /* @__PURE__ */ new WeakMap();
function Oh(e) {
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
function Lh(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : Oh(rh(e));
}
function to(e) {
  return us(e) ? e : Ia(
    e,
    !1,
    kh,
    xh,
    ou
  );
}
function Nh(e) {
  return Ia(
    e,
    !1,
    Ah,
    Ch,
    au
  );
}
function cu(e) {
  return Ia(
    e,
    !0,
    Th,
    Rh,
    lu
  );
}
function Ia(e, t, n, s, r) {
  if (!ct(e) || e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const i = Lh(e);
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
function un(e) {
  return !!(e && e.__v_isShallow);
}
function Oa(e) {
  return e ? !!e.__v_raw : !1;
}
function Be(e) {
  const t = e && e.__v_raw;
  return t ? Be(t) : e;
}
function Ph(e) {
  return !Ve(e, "__v_skip") && Object.isExtensible(e) && Jo(e, "__v_skip", !0), e;
}
const St = (e) => ct(e) ? to(e) : e, Mi = (e) => ct(e) ? cu(e) : e;
function It(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function oe(e) {
  return uu(e, !1);
}
function Mh(e) {
  return uu(e, !0);
}
function uu(e, t) {
  return It(e) ? e : new Dh(e, t);
}
class Dh {
  constructor(t, n) {
    this.dep = new Ca(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? t : Be(t), this._value = n ? t : St(t), this.__v_isShallow = n;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const n = this._rawValue, s = this.__v_isShallow || un(t) || us(t);
    t = s ? t : Be(t), os(t, n) && (this._rawValue = t, this._value = s ? t : St(t), this.dep.trigger());
  }
}
function E(e) {
  return It(e) ? e.value : e;
}
const Fh = {
  get: (e, t, n) => t === "__v_raw" ? e : E(Reflect.get(e, t, n)),
  set: (e, t, n, s) => {
    const r = e[t];
    return It(r) && !It(n) ? (r.value = n, !0) : Reflect.set(e, t, n, s);
  }
};
function fu(e) {
  return er(e) ? e : new Proxy(e, Fh);
}
class $h {
  constructor(t, n, s) {
    this.fn = t, this.setter = n, this._value = void 0, this.dep = new Ca(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Ur - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = s;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    it !== this)
      return Zc(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return eu(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
function Bh(e, t, n = !1) {
  let s, r;
  return Ce(e) ? s = e : (s = e.get, r = e.set), new $h(s, r, n);
}
const pi = {}, Di = /* @__PURE__ */ new WeakMap();
let Rs;
function Uh(e, t = !1, n = Rs) {
  if (n) {
    let s = Di.get(n);
    s || Di.set(n, s = []), s.push(e);
  }
}
function zh(e, t, n = nt) {
  const { immediate: s, deep: r, once: i, scheduler: o, augmentJob: a, call: l } = n, u = (x) => r ? x : un(x) || r === !1 || r === 0 ? Dn(x, 1) : Dn(x);
  let c, b, T, I, O = !1, H = !1;
  if (It(e) ? (b = () => e.value, O = un(e)) : er(e) ? (b = () => u(e), O = !0) : Ae(e) ? (H = !0, O = e.some((x) => er(x) || un(x)), b = () => e.map((x) => {
    if (It(x))
      return x.value;
    if (er(x))
      return u(x);
    if (Ce(x))
      return l ? l(x, 2) : x();
  })) : Ce(e) ? t ? b = l ? () => l(e, 2) : e : b = () => {
    if (T) {
      Bn();
      try {
        T();
      } finally {
        Un();
      }
    }
    const x = Rs;
    Rs = c;
    try {
      return l ? l(e, 3, [I]) : e(I);
    } finally {
      Rs = x;
    }
  } : b = Sn, t && r) {
    const x = b, M = r === !0 ? 1 / 0 : r;
    b = () => Dn(x(), M);
  }
  const ue = ph(), R = () => {
    c.stop(), ue && ue.active && Ta(ue.effects, c);
  };
  if (i && t) {
    const x = t;
    t = (...M) => {
      x(...M), R();
    };
  }
  let fe = H ? new Array(e.length).fill(pi) : pi;
  const _e = (x) => {
    if (!(!(c.flags & 1) || !c.dirty && !x))
      if (t) {
        const M = c.run();
        if (r || O || (H ? M.some((S, W) => os(S, fe[W])) : os(M, fe))) {
          T && T();
          const S = Rs;
          Rs = c;
          try {
            const W = [
              M,
              // pass undefined as the old value when it's changed for the first time
              fe === pi ? void 0 : H && fe[0] === pi ? [] : fe,
              I
            ];
            fe = M, l ? l(t, 3, W) : (
              // @ts-expect-error
              t(...W)
            );
          } finally {
            Rs = S;
          }
        }
      } else
        c.run();
  };
  return a && a(_e), c = new Yc(b), c.scheduler = o ? () => o(_e, !1) : _e, I = (x) => Uh(x, !1, c), T = c.onStop = () => {
    const x = Di.get(c);
    if (x) {
      if (l)
        l(x, 4);
      else
        for (const M of x) M();
      Di.delete(c);
    }
  }, t ? s ? _e(!0) : fe = c.run() : o ? o(_e.bind(null, !0), !0) : c.run(), R.pause = c.pause.bind(c), R.resume = c.resume.bind(c), R.stop = R, R;
}
function Dn(e, t = 1 / 0, n) {
  if (t <= 0 || !ct(e) || e.__v_skip || (n = n || /* @__PURE__ */ new Set(), n.has(e)))
    return e;
  if (n.add(e), t--, It(e))
    Dn(e.value, t, n);
  else if (Ae(e))
    for (let s = 0; s < e.length; s++)
      Dn(e[s], t, n);
  else if (zc(e) || Qs(e))
    e.forEach((s) => {
      Dn(s, t, n);
    });
  else if (Wc(e)) {
    for (const s in e)
      Dn(e[s], t, n);
    for (const s of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, s) && Dn(e[s], t, n);
  }
  return e;
}
/**
* @vue/runtime-core v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function qr(e, t, n, s) {
  try {
    return s ? e(...s) : e();
  } catch (r) {
    no(r, t, n);
  }
}
function xn(e, t, n, s) {
  if (Ce(e)) {
    const r = qr(e, t, n, s);
    return r && Hc(r) && r.catch((i) => {
      no(i, t, n);
    }), r;
  }
  if (Ae(e)) {
    const r = [];
    for (let i = 0; i < e.length; i++)
      r.push(xn(e[i], t, n, s));
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
      Bn(), qr(i, null, 10, [
        e,
        l,
        u
      ]), Un();
      return;
    }
  }
  Hh(e, n, r, s, o);
}
function Hh(e, t, n, s = !0, r = !1) {
  if (r)
    throw e;
  console.error(e);
}
const Dt = [];
let Tn = -1;
const tr = [];
let ns = null, Ys = 0;
const hu = /* @__PURE__ */ Promise.resolve();
let Fi = null;
function is(e) {
  const t = Fi || hu;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function jh(e) {
  let t = Tn + 1, n = Dt.length;
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
    !(e.flags & 2) && t >= Hr(n) ? Dt.push(e) : Dt.splice(jh(t), 0, e), e.flags |= 1, du();
  }
}
function du() {
  Fi || (Fi = hu.then(mu));
}
function Wh(e) {
  Ae(e) ? tr.push(...e) : ns && e.id === -1 ? ns.splice(Ys + 1, 0, e) : e.flags & 1 || (tr.push(e), e.flags |= 1), du();
}
function Rl(e, t, n = Tn + 1) {
  for (; n < Dt.length; n++) {
    const s = Dt[n];
    if (s && s.flags & 2) {
      if (e && s.id !== e.uid)
        continue;
      Dt.splice(n, 1), n--, s.flags & 4 && (s.flags &= -2), s(), s.flags & 4 || (s.flags &= -2);
    }
  }
}
function pu(e) {
  if (tr.length) {
    const t = [...new Set(tr)].sort(
      (n, s) => Hr(n) - Hr(s)
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
const Hr = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function mu(e) {
  try {
    for (Tn = 0; Tn < Dt.length; Tn++) {
      const t = Dt[Tn];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), qr(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; Tn < Dt.length; Tn++) {
      const t = Dt[Tn];
      t && (t.flags &= -2);
    }
    Tn = -1, Dt.length = 0, pu(), Fi = null, (Dt.length || tr.length) && mu();
  }
}
let cn = null, gu = null;
function $i(e) {
  const t = cn;
  return cn = e, gu = e && e.type.__scopeId || null, t;
}
function qh(e, t = cn, n) {
  if (!t || e._n)
    return e;
  const s = (...r) => {
    s._d && $l(-1);
    const i = $i(t);
    let o;
    try {
      o = e(...r);
    } finally {
      $i(i), s._d && $l(1);
    }
    return o;
  };
  return s._n = !0, s._c = !0, s._d = !0, s;
}
function es(e, t) {
  if (cn === null)
    return e;
  const n = lo(cn), s = e.dirs || (e.dirs = []);
  for (let r = 0; r < t.length; r++) {
    let [i, o, a, l = nt] = t[r];
    i && (Ce(i) && (i = {
      mounted: i,
      updated: i
    }), i.deep && Dn(o), s.push({
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
    l && (Bn(), xn(l, n, 8, [
      e.el,
      a,
      e,
      t
    ]), Un());
  }
}
const Vh = Symbol("_vte"), Kh = (e) => e.__isTeleport;
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
function _u(e) {
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
  const i = s.shapeFlag & 4 ? lo(s.component) : s.el, o = r ? null : i, { i: a, r: l } = e, u = t && t.r, c = a.refs === nt ? a.refs = {} : a.refs, b = a.setupState, T = Be(b), I = b === nt ? () => !1 : (O) => Ve(T, O);
  if (u != null && u !== l && (gt(u) ? (c[u] = null, I(u) && (b[u] = null)) : It(u) && (u.value = null)), Ce(l))
    qr(l, a, 12, [o, c]);
  else {
    const O = gt(l), H = It(l);
    if (O || H) {
      const ue = () => {
        if (e.f) {
          const R = O ? I(l) ? b[l] : c[l] : l.value;
          r ? Ae(R) && Ta(R, i) : Ae(R) ? R.includes(i) || R.push(i) : O ? (c[l] = [i], I(l) && (b[l] = c[l])) : (l.value = [i], e.k && (c[e.k] = l.value));
        } else O ? (c[l] = o, I(l) && (b[l] = o)) : H && (l.value = o, e.k && (c[e.k] = o));
      };
      o ? (ue.id = -1, Zt(ue, n)) : ue();
    }
  }
}
Qi().requestIdleCallback;
Qi().cancelIdleCallback;
const Mr = (e) => !!e.type.__asyncLoader, yu = (e) => e.type.__isKeepAlive;
function Gh(e, t) {
  vu(e, "a", t);
}
function Yh(e, t) {
  vu(e, "da", t);
}
function vu(e, t, n = $t) {
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
      yu(r.parent.vnode) && Xh(s, t, n, r), r = r.parent;
  }
}
function Xh(e, t, n, s) {
  const r = so(
    t,
    e,
    s,
    !0
    /* prepend */
  );
  Vr(() => {
    Ta(s[t], r);
  }, n);
}
function so(e, t, n = $t, s = !1) {
  if (n) {
    const r = n[e] || (n[e] = []), i = t.__weh || (t.__weh = (...o) => {
      Bn();
      const a = Kr(n), l = xn(t, n, e, o);
      return a(), Un(), l;
    });
    return s ? r.unshift(i) : r.push(i), i;
  }
}
const zn = (e) => (t, n = $t) => {
  (!Wr || e === "sp") && so(e, (...s) => t(...s), n);
}, Zh = zn("bm"), ro = zn("m"), Jh = zn(
  "bu"
), Qh = zn("u"), io = zn(
  "bum"
), Vr = zn("um"), ed = zn(
  "sp"
), td = zn("rtg"), nd = zn("rtc");
function sd(e, t = $t) {
  so("ec", e, t);
}
const rd = Symbol.for("v-ndc");
function dt(e, t, n, s) {
  let r;
  const i = n, o = Ae(e);
  if (o || gt(e)) {
    const a = o && er(e);
    let l = !1, u = !1;
    a && (l = !un(e), u = us(e), e = eo(e)), r = new Array(e.length);
    for (let c = 0, b = e.length; c < b; c++)
      r[c] = t(
        l ? u ? Mi(St(e[c])) : St(e[c]) : e[c],
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
const ra = (e) => e ? Uu(e) ? lo(e) : ra(e.parent) : null, Dr = (
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
    $parent: (e) => ra(e.parent),
    $root: (e) => ra(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => wu(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      La(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = is.bind(e.proxy)),
    $watch: (e) => Ed.bind(e)
  })
), Oo = (e, t) => e !== nt && !e.__isScriptSetup && Ve(e, t), id = {
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
        if (r !== nt && Ve(r, t))
          return o[t] = 2, r[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (u = e.propsOptions[0]) && Ve(u, t)
        )
          return o[t] = 3, i[t];
        if (n !== nt && Ve(n, t))
          return o[t] = 4, n[t];
        ia && (o[t] = 0);
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
    if (n !== nt && Ve(n, t))
      return o[t] = 4, n[t];
    if (
      // global properties
      T = l.config.globalProperties, Ve(T, t)
    )
      return T[t];
  },
  set({ _: e }, t, n) {
    const { data: s, setupState: r, ctx: i } = e;
    return Oo(r, t) ? (r[t] = n, !0) : s !== nt && Ve(s, t) ? (s[t] = n, !0) : Ve(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (i[t] = n, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: n, ctx: s, appContext: r, propsOptions: i }
  }, o) {
    let a;
    return !!n[o] || e !== nt && Ve(e, o) || Oo(t, o) || (a = i[0]) && Ve(a, o) || Ve(s, o) || Ve(Dr, o) || Ve(r.config.globalProperties, o);
  },
  defineProperty(e, t, n) {
    return n.get != null ? e._.accessCache[t] = 0 : Ve(n, "value") && this.set(e, t, n.value, null), Reflect.defineProperty(e, t, n);
  }
};
function Il(e) {
  return Ae(e) ? e.reduce(
    (t, n) => (t[n] = null, t),
    {}
  ) : e;
}
let ia = !0;
function od(e) {
  const t = wu(e), n = e.proxy, s = e.ctx;
  ia = !1, t.beforeCreate && Ol(t.beforeCreate, e, "bc");
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
    unmounted: x,
    render: M,
    renderTracked: S,
    renderTriggered: W,
    errorCaptured: se,
    serverPrefetch: me,
    // public API
    expose: ge,
    inheritAttrs: Oe,
    // assets
    components: Se,
    directives: Ge,
    filters: Ue
  } = t;
  if (u && ad(u, s, null), o)
    for (const Te in o) {
      const ye = o[Te];
      Ce(ye) && (s[Te] = ye.bind(n));
    }
  if (r) {
    const Te = r.call(n, n);
    ct(Te) && (e.data = to(Te));
  }
  if (ia = !0, i)
    for (const Te in i) {
      const ye = i[Te], Ze = Ce(ye) ? ye.bind(n, n) : Ce(ye.get) ? ye.get.bind(n, n) : Sn, Je = !Ce(ye) && Ce(ye.set) ? ye.set.bind(n) : Sn, lt = ae({
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
      bu(a[Te], s, n, Te);
  if (l) {
    const Te = Ce(l) ? l.call(n) : l;
    Reflect.ownKeys(Te).forEach((ye) => {
      dd(ye, Te[ye]);
    });
  }
  c && Ol(c, e, "c");
  function he(Te, ye) {
    Ae(ye) ? ye.forEach((Ze) => Te(Ze.bind(n))) : ye && Te(ye.bind(n));
  }
  if (he(Zh, b), he(ro, T), he(Jh, I), he(Qh, O), he(Gh, H), he(Yh, ue), he(sd, se), he(nd, S), he(td, W), he(io, fe), he(Vr, x), he(ed, me), Ae(ge))
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
  M && e.render === Sn && (e.render = M), Oe != null && (e.inheritAttrs = Oe), Se && (e.components = Se), Ge && (e.directives = Ge), me && _u(e);
}
function ad(e, t, n = Sn) {
  Ae(e) && (e = oa(e));
  for (const s in e) {
    const r = e[s];
    let i;
    ct(r) ? "default" in r ? i = wi(
      r.from || s,
      r.default,
      !0
    ) : i = wi(r.from || s) : i = wi(r), It(i) ? Object.defineProperty(t, s, {
      enumerable: !0,
      configurable: !0,
      get: () => i.value,
      set: (o) => i.value = o
    }) : t[s] = i;
  }
}
function Ol(e, t, n) {
  xn(
    Ae(e) ? e.map((s) => s.bind(t.proxy)) : e.bind(t.proxy),
    t,
    n
  );
}
function bu(e, t, n, s) {
  let r = s.includes(".") ? Pu(n, s) : () => n[s];
  if (gt(e)) {
    const i = t[e];
    Ce(i) && pt(r, i);
  } else if (Ce(e))
    pt(r, e.bind(n));
  else if (ct(e))
    if (Ae(e))
      e.forEach((i) => bu(i, t, n, s));
    else {
      const i = Ce(e.handler) ? e.handler.bind(n) : t[e.handler];
      Ce(i) && pt(r, i, e);
    }
}
function wu(e) {
  const t = e.type, { mixins: n, extends: s } = t, {
    mixins: r,
    optionsCache: i,
    config: { optionMergeStrategies: o }
  } = e.appContext, a = i.get(t);
  let l;
  return a ? l = a : !r.length && !n && !s ? l = t : (l = {}, r.length && r.forEach(
    (u) => Bi(l, u, o, !0)
  ), Bi(l, t, o)), ct(t) && i.set(t, l), l;
}
function Bi(e, t, n, s = !1) {
  const { mixins: r, extends: i } = t;
  i && Bi(e, i, n, !0), r && r.forEach(
    (o) => Bi(e, o, n, !0)
  );
  for (const o in t)
    if (!(s && o === "expose")) {
      const a = ld[o] || n && n[o];
      e[o] = a ? a(e[o], t[o]) : t[o];
    }
  return e;
}
const ld = {
  data: Ll,
  props: Nl,
  emits: Nl,
  // objects
  methods: xr,
  computed: xr,
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
  components: xr,
  directives: xr,
  // watch
  watch: ud,
  // provide / inject
  provide: Ll,
  inject: cd
};
function Ll(e, t) {
  return t ? e ? function() {
    return Ot(
      Ce(e) ? e.call(this, this) : e,
      Ce(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function cd(e, t) {
  return xr(oa(e), oa(t));
}
function oa(e) {
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
function xr(e, t) {
  return e ? Ot(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function Nl(e, t) {
  return e ? Ae(e) && Ae(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : Ot(
    /* @__PURE__ */ Object.create(null),
    Il(e),
    Il(t ?? {})
  ) : t;
}
function ud(e, t) {
  if (!e) return t;
  if (!t) return e;
  const n = Ot(/* @__PURE__ */ Object.create(null), e);
  for (const s in t)
    n[s] = Mt(e[s], t[s]);
  return n;
}
function ku() {
  return {
    app: null,
    config: {
      isNativeTag: nh,
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
let fd = 0;
function hd(e, t) {
  return function(s, r = null) {
    Ce(s) || (s = Ot({}, s)), r != null && !ct(r) && (r = null);
    const i = ku(), o = /* @__PURE__ */ new WeakSet(), a = [];
    let l = !1;
    const u = i.app = {
      _uid: fd++,
      _component: s,
      _props: r,
      _container: null,
      _context: i,
      _instance: null,
      version: Kd,
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
          const I = u._ceVNode || Ft(s, r);
          return I.appContext = i, T === !0 ? T = "svg" : T === !1 && (T = void 0), e(I, c, T), l = !0, u._container = c, c.__vue_app__ = u, lo(I.component);
        }
      },
      onUnmount(c) {
        a.push(c);
      },
      unmount() {
        l && (xn(
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
function dd(e, t) {
  if ($t) {
    let n = $t.provides;
    const s = $t.parent && $t.parent.provides;
    s === n && (n = $t.provides = Object.create(s)), n[e] = t;
  }
}
function wi(e, t, n = !1) {
  const s = zd();
  if (s || nr) {
    let r = nr ? nr._context.provides : s ? s.parent == null || s.ce ? s.vnode.appContext && s.vnode.appContext.provides : s.parent.provides : void 0;
    if (r && e in r)
      return r[e];
    if (arguments.length > 1)
      return n && Ce(t) ? t.call(s && s.proxy) : t;
  }
}
const Tu = {}, Au = () => Object.create(Tu), Su = (e) => Object.getPrototypeOf(e) === Tu;
function pd(e, t, n, s = !1) {
  const r = {}, i = Au();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), Eu(e, t, r, i);
  for (const o in e.propsOptions[0])
    o in r || (r[o] = void 0);
  n ? e.props = s ? r : Nh(r) : e.type.props ? e.props = r : e.props = i, e.attrs = i;
}
function md(e, t, n, s) {
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
          if (Ve(i, T))
            I !== i[T] && (i[T] = I, u = !0);
          else {
            const O = cs(T);
            r[O] = aa(
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
    Eu(e, t, r, i) && (u = !0);
    let c;
    for (const b in a)
      (!t || // for camelCase
      !Ve(t, b) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((c = ds(b)) === b || !Ve(t, c))) && (l ? n && // for camelCase
      (n[b] !== void 0 || // for kebab-case
      n[c] !== void 0) && (r[b] = aa(
        l,
        a,
        b,
        void 0,
        e,
        !0
      )) : delete r[b]);
    if (i !== a)
      for (const b in i)
        (!t || !Ve(t, b)) && (delete i[b], u = !0);
  }
  u && Mn(e.attrs, "set", "");
}
function Eu(e, t, n, s) {
  const [r, i] = e.propsOptions;
  let o = !1, a;
  if (t)
    for (let l in t) {
      if (Or(l))
        continue;
      const u = t[l];
      let c;
      r && Ve(r, c = cs(l)) ? !i || !i.includes(c) ? n[c] = u : (a || (a = {}))[c] = u : oo(e.emitsOptions, l) || (!(l in s) || u !== s[l]) && (s[l] = u, o = !0);
    }
  if (i) {
    const l = Be(n), u = a || nt;
    for (let c = 0; c < i.length; c++) {
      const b = i[c];
      n[b] = aa(
        r,
        l,
        b,
        u[b],
        e,
        !Ve(u, b)
      );
    }
  }
  return o;
}
function aa(e, t, n, s, r, i) {
  const o = e[n];
  if (o != null) {
    const a = Ve(o, "default");
    if (a && s === void 0) {
      const l = o.default;
      if (o.type !== Function && !o.skipFactory && Ce(l)) {
        const { propsDefaults: u } = r;
        if (n in u)
          s = u[n];
        else {
          const c = Kr(r);
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
    ] && (s === "" || s === ds(n)) && (s = !0));
  }
  return s;
}
const gd = /* @__PURE__ */ new WeakMap();
function xu(e, t, n = !1) {
  const s = n ? gd : t.propsCache, r = s.get(e);
  if (r)
    return r;
  const i = e.props, o = {}, a = [];
  let l = !1;
  if (!Ce(e)) {
    const c = (b) => {
      l = !0;
      const [T, I] = xu(b, t, !0);
      Ot(o, T), I && a.push(...I);
    };
    !n && t.mixins.length && t.mixins.forEach(c), e.extends && c(e.extends), e.mixins && e.mixins.forEach(c);
  }
  if (!i && !l)
    return ct(e) && s.set(e, Js), Js;
  if (Ae(i))
    for (let c = 0; c < i.length; c++) {
      const b = cs(i[c]);
      Pl(b) && (o[b] = nt);
    }
  else if (i)
    for (const c in i) {
      const b = cs(c);
      if (Pl(b)) {
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
        ] = ue, (H || Ve(I, "default")) && a.push(b);
      }
    }
  const u = [o, a];
  return ct(e) && s.set(e, u), u;
}
function Pl(e) {
  return e[0] !== "$" && !Or(e);
}
const Pa = (e) => e === "_" || e === "__" || e === "_ctx" || e === "$stable", Ma = (e) => Ae(e) ? e.map(An) : [An(e)], _d = (e, t, n) => {
  if (t._n)
    return t;
  const s = qh((...r) => Ma(t(...r)), n);
  return s._c = !1, s;
}, Cu = (e, t, n) => {
  const s = e._ctx;
  for (const r in e) {
    if (Pa(r)) continue;
    const i = e[r];
    if (Ce(i))
      t[r] = _d(r, i, s);
    else if (i != null) {
      const o = Ma(i);
      t[r] = () => o;
    }
  }
}, Ru = (e, t) => {
  const n = Ma(t);
  e.slots.default = () => n;
}, Iu = (e, t, n) => {
  for (const s in t)
    (n || !Pa(s)) && (e[s] = t[s]);
}, yd = (e, t, n) => {
  const s = e.slots = Au();
  if (e.vnode.shapeFlag & 32) {
    const r = t.__;
    r && Jo(s, "__", r, !0);
    const i = t._;
    i ? (Iu(s, t, n), n && Jo(s, "_", i, !0)) : Cu(t, s);
  } else t && Ru(e, t);
}, vd = (e, t, n) => {
  const { vnode: s, slots: r } = e;
  let i = !0, o = nt;
  if (s.shapeFlag & 32) {
    const a = t._;
    a ? n && a === 1 ? i = !1 : Iu(r, t, n) : (i = !t.$stable, Cu(t, r)), o = t;
  } else t && (Ru(e, t), o = { default: 1 });
  if (i)
    for (const a in r)
      !Pa(a) && o[a] == null && delete r[a];
}, Zt = Nd;
function bd(e) {
  return wd(e);
}
function wd(e, t) {
  const n = Qi();
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
    setScopeId: I = Sn,
    insertStaticContent: O
  } = e, H = (_, v, L, D = null, U = null, P = null, X = void 0, V = null, K = !!v.dynamicChildren) => {
    if (_ === v)
      return;
    _ && !_r(_, v) && (D = Ut(_), je(_, U, P, !0), _ = null), v.patchFlag === -2 && (K = !1, v.dynamicChildren = null);
    const { type: j, ref: re, shapeFlag: Z } = v;
    switch (j) {
      case ao:
        ue(_, v, L, D);
        break;
      case fs:
        R(_, v, L, D);
        break;
      case ki:
        _ == null && fe(v, L, D, X);
        break;
      case Re:
        Se(
          _,
          v,
          L,
          D,
          U,
          P,
          X,
          V,
          K
        );
        break;
      default:
        Z & 1 ? M(
          _,
          v,
          L,
          D,
          U,
          P,
          X,
          V,
          K
        ) : Z & 6 ? Ge(
          _,
          v,
          L,
          D,
          U,
          P,
          X,
          V,
          K
        ) : (Z & 64 || Z & 128) && j.process(
          _,
          v,
          L,
          D,
          U,
          P,
          X,
          V,
          K,
          Nt
        );
    }
    re != null && U ? Pr(re, _ && _.ref, P, v || _, !v) : re == null && _ && _.ref != null && Pr(_.ref, null, P, _, !0);
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
  }, x = ({ el: _, anchor: v }) => {
    let L;
    for (; _ && _ !== v; )
      L = T(_), r(_), _ = L;
    r(v);
  }, M = (_, v, L, D, U, P, X, V, K) => {
    v.type === "svg" ? X = "svg" : v.type === "math" && (X = "mathml"), _ == null ? S(
      v,
      L,
      D,
      U,
      P,
      X,
      V,
      K
    ) : me(
      _,
      v,
      U,
      P,
      X,
      V,
      K
    );
  }, S = (_, v, L, D, U, P, X, V) => {
    let K, j;
    const { props: re, shapeFlag: Z, transition: Q, dirs: pe } = _;
    if (K = _.el = o(
      _.type,
      P,
      re && re.is,
      re
    ), Z & 8 ? c(K, _.children) : Z & 16 && se(
      _.children,
      K,
      null,
      D,
      U,
      Lo(_, P),
      X,
      V
    ), pe && Ss(_, null, D, "created"), W(K, _, _.scopeId, X, D), re) {
      for (const be in re)
        be !== "value" && !Or(be) && i(K, be, null, re[be], P, D);
      "value" in re && i(K, "value", null, re.value, P), (j = re.onVnodeBeforeMount) && wn(j, D, _);
    }
    pe && Ss(_, null, D, "beforeMount");
    const de = kd(U, Q);
    de && Q.beforeEnter(K), s(K, v, L), ((j = re && re.onVnodeMounted) || de || pe) && Zt(() => {
      j && wn(j, D, _), de && Q.enter(K), pe && Ss(_, null, D, "mounted");
    }, U);
  }, W = (_, v, L, D, U) => {
    if (L && I(_, L), D)
      for (let P = 0; P < D.length; P++)
        I(_, D[P]);
    if (U) {
      let P = U.subTree;
      if (v === P || Du(P.type) && (P.ssContent === v || P.ssFallback === v)) {
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
  }, se = (_, v, L, D, U, P, X, V, K = 0) => {
    for (let j = K; j < _.length; j++) {
      const re = _[j] = V ? rs(_[j]) : An(_[j]);
      H(
        null,
        re,
        v,
        L,
        D,
        U,
        P,
        X,
        V
      );
    }
  }, me = (_, v, L, D, U, P, X) => {
    const V = v.el = _.el;
    let { patchFlag: K, dynamicChildren: j, dirs: re } = v;
    K |= _.patchFlag & 16;
    const Z = _.props || nt, Q = v.props || nt;
    let pe;
    if (L && Es(L, !1), (pe = Q.onVnodeBeforeUpdate) && wn(pe, L, v, _), re && Ss(v, _, L, "beforeUpdate"), L && Es(L, !0), (Z.innerHTML && Q.innerHTML == null || Z.textContent && Q.textContent == null) && c(V, ""), j ? ge(
      _.dynamicChildren,
      j,
      V,
      L,
      D,
      Lo(v, U),
      P
    ) : X || ye(
      _,
      v,
      V,
      null,
      L,
      D,
      Lo(v, U),
      P,
      !1
    ), K > 0) {
      if (K & 16)
        Oe(V, Z, Q, L, U);
      else if (K & 2 && Z.class !== Q.class && i(V, "class", null, Q.class, U), K & 4 && i(V, "style", Z.style, Q.style, U), K & 8) {
        const de = v.dynamicProps;
        for (let be = 0; be < de.length; be++) {
          const ke = de[be], De = Z[ke], $ = Q[ke];
          ($ !== De || ke === "value") && i(V, ke, De, $, U, L);
        }
      }
      K & 1 && _.children !== v.children && c(V, v.children);
    } else !X && j == null && Oe(V, Z, Q, L, U);
    ((pe = Q.onVnodeUpdated) || re) && Zt(() => {
      pe && wn(pe, L, v, _), re && Ss(v, _, L, "updated");
    }, D);
  }, ge = (_, v, L, D, U, P, X) => {
    for (let V = 0; V < v.length; V++) {
      const K = _[V], j = v[V], re = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        K.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (K.type === Re || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !_r(K, j) || // - In the case of a component, it could contain anything.
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
        P,
        X,
        !0
      );
    }
  }, Oe = (_, v, L, D, U) => {
    if (v !== L) {
      if (v !== nt)
        for (const P in v)
          !Or(P) && !(P in L) && i(
            _,
            P,
            v[P],
            null,
            U,
            D
          );
      for (const P in L) {
        if (Or(P)) continue;
        const X = L[P], V = v[P];
        X !== V && P !== "value" && i(_, P, V, X, U, D);
      }
      "value" in L && i(_, "value", v.value, L.value, U);
    }
  }, Se = (_, v, L, D, U, P, X, V, K) => {
    const j = v.el = _ ? _.el : a(""), re = v.anchor = _ ? _.anchor : a("");
    let { patchFlag: Z, dynamicChildren: Q, slotScopeIds: pe } = v;
    pe && (V = V ? V.concat(pe) : pe), _ == null ? (s(j, L, D), s(re, L, D), se(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      v.children || [],
      L,
      re,
      U,
      P,
      X,
      V,
      K
    )) : Z > 0 && Z & 64 && Q && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    _.dynamicChildren ? (ge(
      _.dynamicChildren,
      Q,
      L,
      U,
      P,
      X,
      V
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (v.key != null || U && v === U.subTree) && Ou(
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
      P,
      X,
      V,
      K
    );
  }, Ge = (_, v, L, D, U, P, X, V, K) => {
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
      P,
      X,
      K
    ) : st(_, v, K);
  }, Ue = (_, v, L, D, U, P, X) => {
    const V = _.component = Ud(
      _,
      D,
      U
    );
    if (yu(_) && (V.ctx.renderer = Nt), Hd(V, !1, X), V.asyncDep) {
      if (U && U.registerDep(V, he, X), !_.el) {
        const K = V.subTree = Ft(fs);
        R(null, K, v, L), _.placeholder = K.el;
      }
    } else
      he(
        V,
        _,
        v,
        L,
        U,
        P,
        X
      );
  }, st = (_, v, L) => {
    const D = v.component = _.component;
    if (Od(_, v, L))
      if (D.asyncDep && !D.asyncResolved) {
        Te(D, v, L);
        return;
      } else
        D.next = v, D.update();
    else
      v.el = _.el, D.vnode = v;
  }, he = (_, v, L, D, U, P, X) => {
    const V = () => {
      if (_.isMounted) {
        let { next: Z, bu: Q, u: pe, parent: de, vnode: be } = _;
        {
          const f = Lu(_);
          if (f) {
            Z && (Z.el = be.el, Te(_, Z, X)), f.asyncDep.then(() => {
              _.isUnmounted || V();
            });
            return;
          }
        }
        let ke = Z, De;
        Es(_, !1), Z ? (Z.el = be.el, Te(_, Z, X)) : Z = be, Q && bi(Q), (De = Z.props && Z.props.onVnodeBeforeUpdate) && wn(De, de, Z, be), Es(_, !0);
        const $ = Dl(_), z = _.subTree;
        _.subTree = $, H(
          z,
          $,
          // parent may have changed if it's in a teleport
          b(z.el),
          // anchor may have changed if it's in a fragment
          Ut(z),
          _,
          U,
          P
        ), Z.el = $.el, ke === null && Ld(_, $.el), pe && Zt(pe, U), (De = Z.props && Z.props.onVnodeUpdated) && Zt(
          () => wn(De, de, Z, be),
          U
        );
      } else {
        let Z;
        const { el: Q, props: pe } = v, { bm: de, m: be, parent: ke, root: De, type: $ } = _, z = Mr(v);
        Es(_, !1), de && bi(de), !z && (Z = pe && pe.onVnodeBeforeMount) && wn(Z, ke, v), Es(_, !0);
        {
          De.ce && // @ts-expect-error _def is private
          De.ce._def.shadowRoot !== !1 && De.ce._injectChildStyle($);
          const f = _.subTree = Dl(_);
          H(
            null,
            f,
            L,
            D,
            _,
            U,
            P
          ), v.el = f.el;
        }
        if (be && Zt(be, U), !z && (Z = pe && pe.onVnodeMounted)) {
          const f = v;
          Zt(
            () => wn(Z, ke, f),
            U
          );
        }
        (v.shapeFlag & 256 || ke && Mr(ke.vnode) && ke.vnode.shapeFlag & 256) && _.a && Zt(_.a, U), _.isMounted = !0, v = L = D = null;
      }
    };
    _.scope.on();
    const K = _.effect = new Yc(V);
    _.scope.off();
    const j = _.update = K.run.bind(K), re = _.job = K.runIfDirty.bind(K);
    re.i = _, re.id = _.uid, K.scheduler = () => La(re), Es(_, !0), j();
  }, Te = (_, v, L) => {
    v.component = _;
    const D = _.vnode.props;
    _.vnode = v, _.next = null, md(_, v.props, D, L), vd(_, v.children, L), Bn(), Rl(_), Un();
  }, ye = (_, v, L, D, U, P, X, V, K = !1) => {
    const j = _ && _.children, re = _ ? _.shapeFlag : 0, Z = v.children, { patchFlag: Q, shapeFlag: pe } = v;
    if (Q > 0) {
      if (Q & 128) {
        Je(
          j,
          Z,
          L,
          D,
          U,
          P,
          X,
          V,
          K
        );
        return;
      } else if (Q & 256) {
        Ze(
          j,
          Z,
          L,
          D,
          U,
          P,
          X,
          V,
          K
        );
        return;
      }
    }
    pe & 8 ? (re & 16 && bt(j, U, P), Z !== j && c(L, Z)) : re & 16 ? pe & 16 ? Je(
      j,
      Z,
      L,
      D,
      U,
      P,
      X,
      V,
      K
    ) : bt(j, U, P, !0) : (re & 8 && c(L, ""), pe & 16 && se(
      Z,
      L,
      D,
      U,
      P,
      X,
      V,
      K
    ));
  }, Ze = (_, v, L, D, U, P, X, V, K) => {
    _ = _ || Js, v = v || Js;
    const j = _.length, re = v.length, Z = Math.min(j, re);
    let Q;
    for (Q = 0; Q < Z; Q++) {
      const pe = v[Q] = K ? rs(v[Q]) : An(v[Q]);
      H(
        _[Q],
        pe,
        L,
        null,
        U,
        P,
        X,
        V,
        K
      );
    }
    j > re ? bt(
      _,
      U,
      P,
      !0,
      !1,
      Z
    ) : se(
      v,
      L,
      D,
      U,
      P,
      X,
      V,
      K,
      Z
    );
  }, Je = (_, v, L, D, U, P, X, V, K) => {
    let j = 0;
    const re = v.length;
    let Z = _.length - 1, Q = re - 1;
    for (; j <= Z && j <= Q; ) {
      const pe = _[j], de = v[j] = K ? rs(v[j]) : An(v[j]);
      if (_r(pe, de))
        H(
          pe,
          de,
          L,
          null,
          U,
          P,
          X,
          V,
          K
        );
      else
        break;
      j++;
    }
    for (; j <= Z && j <= Q; ) {
      const pe = _[Z], de = v[Q] = K ? rs(v[Q]) : An(v[Q]);
      if (_r(pe, de))
        H(
          pe,
          de,
          L,
          null,
          U,
          P,
          X,
          V,
          K
        );
      else
        break;
      Z--, Q--;
    }
    if (j > Z) {
      if (j <= Q) {
        const pe = Q + 1, de = pe < re ? v[pe].el : D;
        for (; j <= Q; )
          H(
            null,
            v[j] = K ? rs(v[j]) : An(v[j]),
            L,
            de,
            U,
            P,
            X,
            V,
            K
          ), j++;
      }
    } else if (j > Q)
      for (; j <= Z; )
        je(_[j], U, P, !0), j++;
    else {
      const pe = j, de = j, be = /* @__PURE__ */ new Map();
      for (j = de; j <= Q; j++) {
        const C = v[j] = K ? rs(v[j]) : An(v[j]);
        C.key != null && be.set(C.key, j);
      }
      let ke, De = 0;
      const $ = Q - de + 1;
      let z = !1, f = 0;
      const y = new Array($);
      for (j = 0; j < $; j++) y[j] = 0;
      for (j = pe; j <= Z; j++) {
        const C = _[j];
        if (De >= $) {
          je(C, U, P, !0);
          continue;
        }
        let q;
        if (C.key != null)
          q = be.get(C.key);
        else
          for (ke = de; ke <= Q; ke++)
            if (y[ke - de] === 0 && _r(C, v[ke])) {
              q = ke;
              break;
            }
        q === void 0 ? je(C, U, P, !0) : (y[q - de] = j + 1, q >= f ? f = q : z = !0, H(
          C,
          v[q],
          L,
          null,
          U,
          P,
          X,
          V,
          K
        ), De++);
      }
      const N = z ? Td(y) : Js;
      for (ke = N.length - 1, j = $ - 1; j >= 0; j--) {
        const C = de + j, q = v[C], ne = v[C + 1], ie = C + 1 < re ? (
          // #13559, fallback to el placeholder for unresolved async component
          ne.el || ne.placeholder
        ) : D;
        y[j] === 0 ? H(
          null,
          q,
          L,
          ie,
          U,
          P,
          X,
          V,
          K
        ) : z && (ke < 0 || j !== N[ke] ? lt(q, L, ie, 2) : ke--);
      }
    }
  }, lt = (_, v, L, D, U = null) => {
    const { el: P, type: X, transition: V, children: K, shapeFlag: j } = _;
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
      s(P, v, L);
      for (let Z = 0; Z < K.length; Z++)
        lt(K[Z], v, L, D);
      s(_.anchor, v, L);
      return;
    }
    if (X === ki) {
      _e(_, v, L);
      return;
    }
    if (D !== 2 && j & 1 && V)
      if (D === 0)
        V.beforeEnter(P), s(P, v, L), Zt(() => V.enter(P), U);
      else {
        const { leave: Z, delayLeave: Q, afterLeave: pe } = V, de = () => {
          _.ctx.isUnmounted ? r(P) : s(P, v, L);
        }, be = () => {
          Z(P, () => {
            de(), pe && pe();
          });
        };
        Q ? Q(P, de, be) : be();
      }
    else
      s(P, v, L);
  }, je = (_, v, L, D = !1, U = !1) => {
    const {
      type: P,
      props: X,
      ref: V,
      children: K,
      dynamicChildren: j,
      shapeFlag: re,
      patchFlag: Z,
      dirs: Q,
      cacheIndex: pe
    } = _;
    if (Z === -2 && (U = !1), V != null && (Bn(), Pr(V, null, L, _, !0), Un()), pe != null && (v.renderCache[pe] = void 0), re & 256) {
      v.ctx.deactivate(_);
      return;
    }
    const de = re & 1 && Q, be = !Mr(_);
    let ke;
    if (be && (ke = X && X.onVnodeBeforeUnmount) && wn(ke, v, _), re & 6)
      Me(_.component, L, D);
    else {
      if (re & 128) {
        _.suspense.unmount(L, D);
        return;
      }
      de && Ss(_, null, v, "beforeUnmount"), re & 64 ? _.type.remove(
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
      (P !== Re || Z > 0 && Z & 64) ? bt(
        j,
        v,
        L,
        !1,
        !0
      ) : (P === Re && Z & 384 || !U && re & 16) && bt(K, v, L), D && Lt(_);
    }
    (be && (ke = X && X.onVnodeUnmounted) || de) && Zt(() => {
      ke && wn(ke, v, _), de && Ss(_, null, v, "unmounted");
    }, L);
  }, Lt = (_) => {
    const { type: v, el: L, anchor: D, transition: U } = _;
    if (v === Re) {
      _n(L, D);
      return;
    }
    if (v === ki) {
      x(_);
      return;
    }
    const P = () => {
      r(L), U && !U.persisted && U.afterLeave && U.afterLeave();
    };
    if (_.shapeFlag & 1 && U && !U.persisted) {
      const { leave: X, delayLeave: V } = U, K = () => X(L, P);
      V ? V(_.el, P, K) : K();
    } else
      P();
  }, _n = (_, v) => {
    let L;
    for (; _ !== v; )
      L = T(_), r(_), _ = L;
    r(v);
  }, Me = (_, v, L) => {
    const {
      bum: D,
      scope: U,
      job: P,
      subTree: X,
      um: V,
      m: K,
      a: j,
      parent: re,
      slots: { __: Z }
    } = _;
    Ml(K), Ml(j), D && bi(D), re && Ae(Z) && Z.forEach((Q) => {
      re.renderCache[Q] = void 0;
    }), U.stop(), P && (P.flags |= 8, je(X, _, v, L)), V && Zt(V, v), Zt(() => {
      _.isUnmounted = !0;
    }, v), v && v.pendingBranch && !v.isUnmounted && _.asyncDep && !_.asyncResolved && _.suspenseId === v.pendingId && (v.deps--, v.deps === 0 && v.resolve());
  }, bt = (_, v, L, D = !1, U = !1, P = 0) => {
    for (let X = P; X < _.length; X++)
      je(_[X], v, L, D, U);
  }, Ut = (_) => {
    if (_.shapeFlag & 6)
      return Ut(_.component.subTree);
    if (_.shapeFlag & 128)
      return _.suspense.next();
    const v = T(_.anchor || _.el), L = v && v[Vh];
    return L ? T(L) : v;
  };
  let Wt = !1;
  const qt = (_, v, L) => {
    _ == null ? v._vnode && je(v._vnode, null, null, !0) : H(
      v._vnode || null,
      _,
      v,
      null,
      null,
      null,
      L
    ), v._vnode = _, Wt || (Wt = !0, Rl(), pu(), Wt = !1);
  }, Nt = {
    p: H,
    um: je,
    m: lt,
    r: Lt,
    mt: Ue,
    mc: se,
    pc: ye,
    pbc: ge,
    n: Ut,
    o: e
  };
  return {
    render: qt,
    hydrate: void 0,
    createApp: hd(qt)
  };
}
function Lo({ type: e, props: t }, n) {
  return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function Es({ effect: e, job: t }, n) {
  n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function kd(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function Ou(e, t, n = !1) {
  const s = e.children, r = t.children;
  if (Ae(s) && Ae(r))
    for (let i = 0; i < s.length; i++) {
      const o = s[i];
      let a = r[i];
      a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = r[i] = rs(r[i]), a.el = o.el), !n && a.patchFlag !== -2 && Ou(o, a)), a.type === ao && (a.el = o.el), a.type === fs && !a.el && (a.el = o.el);
    }
}
function Td(e) {
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
function Lu(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : Lu(t);
}
function Ml(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
const Ad = Symbol.for("v-scx"), Sd = () => wi(Ad);
function pt(e, t, n) {
  return Nu(e, t, n);
}
function Nu(e, t, n = nt) {
  const { immediate: s, deep: r, flush: i, once: o } = n, a = Ot({}, n), l = t && s || !t && i !== "post";
  let u;
  if (Wr) {
    if (i === "sync") {
      const I = Sd();
      u = I.__watcherHandles || (I.__watcherHandles = []);
    } else if (!l) {
      const I = () => {
      };
      return I.stop = Sn, I.resume = Sn, I.pause = Sn, I;
    }
  }
  const c = $t;
  a.call = (I, O, H) => xn(I, c, O, H);
  let b = !1;
  i === "post" ? a.scheduler = (I) => {
    Zt(I, c && c.suspense);
  } : i !== "sync" && (b = !0, a.scheduler = (I, O) => {
    O ? I() : La(I);
  }), a.augmentJob = (I) => {
    t && (I.flags |= 4), b && (I.flags |= 2, c && (I.id = c.uid, I.i = c));
  };
  const T = zh(e, t, a);
  return Wr && (u ? u.push(T) : l && T()), T;
}
function Ed(e, t, n) {
  const s = this.proxy, r = gt(e) ? e.includes(".") ? Pu(s, e) : () => s[e] : e.bind(s, s);
  let i;
  Ce(t) ? i = t : (i = t.handler, n = t);
  const o = Kr(this), a = Nu(r, i.bind(s), n);
  return o(), a;
}
function Pu(e, t) {
  const n = t.split(".");
  return () => {
    let s = e;
    for (let r = 0; r < n.length && s; r++)
      s = s[n[r]];
    return s;
  };
}
const xd = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${cs(t)}Modifiers`] || e[`${ds(t)}Modifiers`];
function Cd(e, t, ...n) {
  if (e.isUnmounted) return;
  const s = e.vnode.props || nt;
  let r = n;
  const i = t.startsWith("update:"), o = i && xd(s, t.slice(7));
  o && (o.trim && (r = n.map((c) => gt(c) ? c.trim() : c)), o.number && (r = n.map(Qo)));
  let a, l = s[a = Eo(t)] || // also try camelCase event handler (#2249)
  s[a = Eo(cs(t))];
  !l && i && (l = s[a = Eo(ds(t))]), l && xn(
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
    e.emitted[a] = !0, xn(
      u,
      e,
      6,
      r
    );
  }
}
function Mu(e, t, n = !1) {
  const s = t.emitsCache, r = s.get(e);
  if (r !== void 0)
    return r;
  const i = e.emits;
  let o = {}, a = !1;
  if (!Ce(e)) {
    const l = (u) => {
      const c = Mu(u, t, !0);
      c && (a = !0, Ot(o, c));
    };
    !n && t.mixins.length && t.mixins.forEach(l), e.extends && l(e.extends), e.mixins && e.mixins.forEach(l);
  }
  return !i && !a ? (ct(e) && s.set(e, null), null) : (Ae(i) ? i.forEach((l) => o[l] = null) : Ot(o, i), ct(e) && s.set(e, o), o);
}
function oo(e, t) {
  return !e || !Xi(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), Ve(e, t[0].toLowerCase() + t.slice(1)) || Ve(e, ds(t)) || Ve(e, t));
}
function Dl(e) {
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
  } = e, ue = $i(e);
  let R, fe;
  try {
    if (n.shapeFlag & 4) {
      const x = r || s, M = x;
      R = An(
        u.call(
          M,
          x,
          c,
          b,
          I,
          T,
          O
        )
      ), fe = a;
    } else {
      const x = t;
      R = An(
        x.length > 1 ? x(
          b,
          { attrs: a, slots: o, emit: l }
        ) : x(
          b,
          null
        )
      ), fe = t.props ? a : Rd(a);
    }
  } catch (x) {
    Fr.length = 0, no(x, e, 1), R = Ft(fs);
  }
  let _e = R;
  if (fe && H !== !1) {
    const x = Object.keys(fe), { shapeFlag: M } = _e;
    x.length && M & 7 && (i && x.some(ka) && (fe = Id(
      fe,
      i
    )), _e = or(_e, fe, !1, !0));
  }
  return n.dirs && (_e = or(_e, null, !1, !0), _e.dirs = _e.dirs ? _e.dirs.concat(n.dirs) : n.dirs), n.transition && Na(_e, n.transition), R = _e, $i(ue), R;
}
const Rd = (e) => {
  let t;
  for (const n in e)
    (n === "class" || n === "style" || Xi(n)) && ((t || (t = {}))[n] = e[n]);
  return t;
}, Id = (e, t) => {
  const n = {};
  for (const s in e)
    (!ka(s) || !(s.slice(9) in t)) && (n[s] = e[s]);
  return n;
};
function Od(e, t, n) {
  const { props: s, children: r, component: i } = e, { props: o, children: a, patchFlag: l } = t, u = i.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (n && l >= 0) {
    if (l & 1024)
      return !0;
    if (l & 16)
      return s ? Fl(s, o, u) : !!o;
    if (l & 8) {
      const c = t.dynamicProps;
      for (let b = 0; b < c.length; b++) {
        const T = c[b];
        if (o[T] !== s[T] && !oo(u, T))
          return !0;
      }
    }
  } else
    return (r || a) && (!a || !a.$stable) ? !0 : s === o ? !1 : s ? o ? Fl(s, o, u) : !0 : !!o;
  return !1;
}
function Fl(e, t, n) {
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
function Ld({ vnode: e, parent: t }, n) {
  for (; t; ) {
    const s = t.subTree;
    if (s.suspense && s.suspense.activeBranch === e && (s.el = e.el), s === e)
      (e = t.vnode).el = n, t = t.parent;
    else
      break;
  }
}
const Du = (e) => e.__isSuspense;
function Nd(e, t) {
  t && t.pendingBranch ? Ae(e) ? t.effects.push(...e) : t.effects.push(e) : Wh(e);
}
const Re = Symbol.for("v-fgt"), ao = Symbol.for("v-txt"), fs = Symbol.for("v-cmt"), ki = Symbol.for("v-stc"), Fr = [];
let Qt = null;
function w(e = !1) {
  Fr.push(Qt = e ? null : []);
}
function Pd() {
  Fr.pop(), Qt = Fr[Fr.length - 1] || null;
}
let jr = 1;
function $l(e, t = !1) {
  jr += e, e < 0 && Qt && t && (Qt.hasOnce = !0);
}
function Fu(e) {
  return e.dynamicChildren = jr > 0 ? Qt || Js : null, Pd(), jr > 0 && Qt && Qt.push(e), e;
}
function A(e, t, n, s, r, i) {
  return Fu(
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
function ss(e, t, n, s, r) {
  return Fu(
    Ft(
      e,
      t,
      n,
      s,
      r,
      !0
    )
  );
}
function $u(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function _r(e, t) {
  return e.type === t.type && e.key === t.key;
}
const Bu = ({ key: e }) => e ?? null, Ti = ({
  ref: e,
  ref_key: t,
  ref_for: n
}) => (typeof e == "number" && (e = "" + e), e != null ? gt(e) || It(e) || Ce(e) ? { i: cn, r: e, k: t, f: !!n } : e : null);
function g(e, t = null, n = null, s = 0, r = null, i = e === Re ? 0 : 1, o = !1, a = !1) {
  const l = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && Bu(t),
    ref: t && Ti(t),
    scopeId: gu,
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
    ctx: cn
  };
  return a ? (Da(l, n), i & 128 && e.normalize(l)) : n && (l.shapeFlag |= gt(n) ? 8 : 16), jr > 0 && // avoid a block node from tracking itself
  !o && // has current parent block
  Qt && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (l.patchFlag > 0 || i & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  l.patchFlag !== 32 && Qt.push(l), l;
}
const Ft = Md;
function Md(e, t = null, n = null, s = 0, r = null, i = !1) {
  if ((!e || e === rd) && (e = fs), $u(e)) {
    const a = or(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return n && Da(a, n), jr > 0 && !i && Qt && (a.shapeFlag & 6 ? Qt[Qt.indexOf(e)] = a : Qt.push(a)), a.patchFlag = -2, a;
  }
  if (Vd(e) && (e = e.__vccOpts), t) {
    t = Dd(t);
    let { class: a, style: l } = t;
    a && !gt(a) && (t.class = Ne(a)), ct(l) && (Oa(l) && !Ae(l) && (l = Ot({}, l)), t.style = xe(l));
  }
  const o = gt(e) ? 1 : Du(e) ? 128 : Kh(e) ? 64 : ct(e) ? 4 : Ce(e) ? 2 : 0;
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
function Dd(e) {
  return e ? Oa(e) || Su(e) ? Ot({}, e) : e : null;
}
function or(e, t, n = !1, s = !1) {
  const { props: r, ref: i, patchFlag: o, children: a, transition: l } = e, u = t ? Fd(r || {}, t) : r, c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: u,
    key: u && Bu(u),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && i ? Ae(i) ? i.concat(Ti(t)) : [i, Ti(t)] : Ti(t)
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
  return Ft(ao, null, e, t);
}
function No(e, t) {
  const n = Ft(ki, null, e);
  return n.staticCount = t, n;
}
function te(e = "", t = !1) {
  return t ? (w(), ss(fs, null, e)) : Ft(fs, null, e);
}
function An(e) {
  return e == null || typeof e == "boolean" ? Ft(fs) : Ae(e) ? Ft(
    Re,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : $u(e) ? rs(e) : Ft(ao, null, String(e));
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
      !r && !Su(t) ? t._ctx = cn : r === 3 && cn && (cn.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else Ce(t) ? (t = { default: t, _ctx: cn }, n = 32) : (t = String(t), s & 64 ? (n = 16, t = [Nn(t)]) : n = 8);
  e.children = t, e.shapeFlag |= n;
}
function Fd(...e) {
  const t = {};
  for (let n = 0; n < e.length; n++) {
    const s = e[n];
    for (const r in s)
      if (r === "class")
        t.class !== s.class && (t.class = Ne([t.class, s.class]));
      else if (r === "style")
        t.style = xe([t.style, s.style]);
      else if (Xi(r)) {
        const i = t[r], o = s[r];
        o && i !== o && !(Ae(i) && i.includes(o)) && (t[r] = i ? [].concat(i, o) : o);
      } else r !== "" && (t[r] = s[r]);
  }
  return t;
}
function wn(e, t, n, s = null) {
  xn(e, t, 7, [
    n,
    s
  ]);
}
const $d = ku();
let Bd = 0;
function Ud(e, t, n) {
  const s = e.type, r = (t ? t.appContext : e.appContext) || $d, i = {
    uid: Bd++,
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
    scope: new dh(
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
    propsOptions: xu(s, r),
    emitsOptions: Mu(s, r),
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
  return i.ctx = { _: i }, i.root = t ? t.root : i, i.emit = Cd.bind(null, i), e.ce && e.ce(i), i;
}
let $t = null;
const zd = () => $t || cn;
let Ui, la;
{
  const e = Qi(), t = (n, s) => {
    let r;
    return (r = e[n]) || (r = e[n] = []), r.push(s), (i) => {
      r.length > 1 ? r.forEach((o) => o(i)) : r[0](i);
    };
  };
  Ui = t(
    "__VUE_INSTANCE_SETTERS__",
    (n) => $t = n
  ), la = t(
    "__VUE_SSR_SETTERS__",
    (n) => Wr = n
  );
}
const Kr = (e) => {
  const t = $t;
  return Ui(e), e.scope.on(), () => {
    e.scope.off(), Ui(t);
  };
}, Bl = () => {
  $t && $t.scope.off(), Ui(null);
};
function Uu(e) {
  return e.vnode.shapeFlag & 4;
}
let Wr = !1;
function Hd(e, t = !1, n = !1) {
  t && la(t);
  const { props: s, children: r } = e.vnode, i = Uu(e);
  pd(e, s, i, t), yd(e, r, n || t);
  const o = i ? jd(e, t) : void 0;
  return t && la(!1), o;
}
function jd(e, t) {
  const n = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, id);
  const { setup: s } = n;
  if (s) {
    Bn();
    const r = e.setupContext = s.length > 1 ? qd(e) : null, i = Kr(e), o = qr(
      s,
      e,
      0,
      [
        e.props,
        r
      ]
    ), a = Hc(o);
    if (Un(), i(), (a || e.sp) && !Mr(e) && _u(e), a) {
      if (o.then(Bl, Bl), t)
        return o.then((l) => {
          Ul(e, l);
        }).catch((l) => {
          no(l, e, 0);
        });
      e.asyncDep = o;
    } else
      Ul(e, o);
  } else
    zu(e);
}
function Ul(e, t, n) {
  Ce(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : ct(t) && (e.setupState = fu(t)), zu(e);
}
function zu(e, t, n) {
  const s = e.type;
  e.render || (e.render = s.render || Sn);
  {
    const r = Kr(e);
    Bn();
    try {
      od(e);
    } finally {
      Un(), r();
    }
  }
}
const Wd = {
  get(e, t) {
    return Rt(e, "get", ""), e[t];
  }
};
function qd(e) {
  const t = (n) => {
    e.exposed = n || {};
  };
  return {
    attrs: new Proxy(e.attrs, Wd),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function lo(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(fu(Ph(e.exposed)), {
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
function Vd(e) {
  return Ce(e) && "__vccOpts" in e;
}
const ae = (e, t) => Bh(e, t, Wr), Kd = "3.5.18";
/**
* @vue/runtime-dom v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let ca;
const zl = typeof window < "u" && window.trustedTypes;
if (zl)
  try {
    ca = /* @__PURE__ */ zl.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const Hu = ca ? (e) => ca.createHTML(e) : (e) => e, Gd = "http://www.w3.org/2000/svg", Yd = "http://www.w3.org/1998/Math/MathML", Pn = typeof document < "u" ? document : null, Hl = Pn && /* @__PURE__ */ Pn.createElement("template"), Xd = {
  insert: (e, t, n) => {
    t.insertBefore(e, n || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, n, s) => {
    const r = t === "svg" ? Pn.createElementNS(Gd, e) : t === "mathml" ? Pn.createElementNS(Yd, e) : n ? Pn.createElement(e, { is: n }) : Pn.createElement(e);
    return e === "select" && s && s.multiple != null && r.setAttribute("multiple", s.multiple), r;
  },
  createText: (e) => Pn.createTextNode(e),
  createComment: (e) => Pn.createComment(e),
  setText: (e, t) => {
    e.nodeValue = t;
  },
  setElementText: (e, t) => {
    e.textContent = t;
  },
  parentNode: (e) => e.parentNode,
  nextSibling: (e) => e.nextSibling,
  querySelector: (e) => Pn.querySelector(e),
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
      Hl.innerHTML = Hu(
        s === "svg" ? `<svg>${e}</svg>` : s === "mathml" ? `<math>${e}</math>` : e
      );
      const a = Hl.content;
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
}, Zd = Symbol("_vtc");
function Jd(e, t, n) {
  const s = e[Zd];
  s && (t = (t ? [t, ...s] : [...s]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
const zi = Symbol("_vod"), ju = Symbol("_vsh"), Qd = {
  beforeMount(e, { value: t }, { transition: n }) {
    e[zi] = e.style.display === "none" ? "" : e.style.display, n && t ? n.beforeEnter(e) : yr(e, t);
  },
  mounted(e, { value: t }, { transition: n }) {
    n && t && n.enter(e);
  },
  updated(e, { value: t, oldValue: n }, { transition: s }) {
    !t != !n && (s ? t ? (s.beforeEnter(e), yr(e, !0), s.enter(e)) : s.leave(e, () => {
      yr(e, !1);
    }) : yr(e, t));
  },
  beforeUnmount(e, { value: t }) {
    yr(e, t);
  }
};
function yr(e, t) {
  e.style.display = t ? e[zi] : "none", e[ju] = !t;
}
const ep = Symbol(""), tp = /(^|;)\s*display\s*:/;
function np(e, t, n) {
  const s = e.style, r = gt(n);
  let i = !1;
  if (n && !r) {
    if (t)
      if (gt(t))
        for (const o of t.split(";")) {
          const a = o.slice(0, o.indexOf(":")).trim();
          n[a] == null && Ai(s, a, "");
        }
      else
        for (const o in t)
          n[o] == null && Ai(s, o, "");
    for (const o in n)
      o === "display" && (i = !0), Ai(s, o, n[o]);
  } else if (r) {
    if (t !== n) {
      const o = s[ep];
      o && (n += ";" + o), s.cssText = n, i = tp.test(n);
    }
  } else t && e.removeAttribute("style");
  zi in e && (e[zi] = i ? s.display : "", e[ju] && (s.display = "none"));
}
const jl = /\s*!important$/;
function Ai(e, t, n) {
  if (Ae(n))
    n.forEach((s) => Ai(e, t, s));
  else if (n == null && (n = ""), t.startsWith("--"))
    e.setProperty(t, n);
  else {
    const s = sp(e, t);
    jl.test(n) ? e.setProperty(
      ds(s),
      n.replace(jl, ""),
      "important"
    ) : e[s] = n;
  }
}
const Wl = ["Webkit", "Moz", "ms"], Po = {};
function sp(e, t) {
  const n = Po[t];
  if (n)
    return n;
  let s = cs(t);
  if (s !== "filter" && s in e)
    return Po[t] = s;
  s = qc(s);
  for (let r = 0; r < Wl.length; r++) {
    const i = Wl[r] + s;
    if (i in e)
      return Po[t] = i;
  }
  return t;
}
const ql = "http://www.w3.org/1999/xlink";
function Vl(e, t, n, s, r, i = hh(t)) {
  s && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(ql, t.slice(6, t.length)) : e.setAttributeNS(ql, t, n) : n == null || i && !Vc(n) ? e.removeAttribute(t) : e.setAttribute(
    t,
    i ? "" : hs(n) ? String(n) : n
  );
}
function Kl(e, t, n, s, r) {
  if (t === "innerHTML" || t === "textContent") {
    n != null && (e[t] = t === "innerHTML" ? Hu(n) : n);
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
    a === "boolean" ? n = Vc(n) : n == null && a === "string" ? (n = "", o = !0) : a === "number" && (n = 0, o = !0);
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
function rp(e, t, n, s) {
  e.removeEventListener(t, n, s);
}
const Gl = Symbol("_vei");
function ip(e, t, n, s, r = null) {
  const i = e[Gl] || (e[Gl] = {}), o = i[t];
  if (s && o)
    o.value = s;
  else {
    const [a, l] = op(t);
    if (s) {
      const u = i[t] = cp(
        s,
        r
      );
      Xs(e, a, u, l);
    } else o && (rp(e, a, o, l), i[t] = void 0);
  }
}
const Yl = /(?:Once|Passive|Capture)$/;
function op(e) {
  let t;
  if (Yl.test(e)) {
    t = {};
    let s;
    for (; s = e.match(Yl); )
      e = e.slice(0, e.length - s[0].length), t[s[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : ds(e.slice(2)), t];
}
let Mo = 0;
const ap = /* @__PURE__ */ Promise.resolve(), lp = () => Mo || (ap.then(() => Mo = 0), Mo = Date.now());
function cp(e, t) {
  const n = (s) => {
    if (!s._vts)
      s._vts = Date.now();
    else if (s._vts <= n.attached)
      return;
    xn(
      up(s, n.value),
      t,
      5,
      [s]
    );
  };
  return n.value = e, n.attached = lp(), n;
}
function up(e, t) {
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
const Xl = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, fp = (e, t, n, s, r, i) => {
  const o = r === "svg";
  t === "class" ? Jd(e, s, o) : t === "style" ? np(e, n, s) : Xi(t) ? ka(t) || ip(e, t, n, s, i) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : hp(e, t, s, o)) ? (Kl(e, t, s), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && Vl(e, t, s, o, i, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !gt(s)) ? Kl(e, cs(t), s, i, t) : (t === "true-value" ? e._trueValue = s : t === "false-value" && (e._falseValue = s), Vl(e, t, s, o));
};
function hp(e, t, n, s) {
  if (s)
    return !!(t === "innerHTML" || t === "textContent" || t in e && Xl(t) && Ce(n));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const r = e.tagName;
    if (r === "IMG" || r === "VIDEO" || r === "CANVAS" || r === "SOURCE")
      return !1;
  }
  return Xl(t) && gt(n) ? !1 : t in e;
}
const Zl = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return Ae(t) ? (n) => bi(t, n) : t;
};
function dp(e) {
  e.target.composing = !0;
}
function Jl(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const Do = Symbol("_assign"), xs = {
  created(e, { modifiers: { lazy: t, trim: n, number: s } }, r) {
    e[Do] = Zl(r);
    const i = s || r.props && r.props.type === "number";
    Xs(e, t ? "change" : "input", (o) => {
      if (o.target.composing) return;
      let a = e.value;
      n && (a = a.trim()), i && (a = Qo(a)), e[Do](a);
    }), n && Xs(e, "change", () => {
      e.value = e.value.trim();
    }), t || (Xs(e, "compositionstart", dp), Xs(e, "compositionend", Jl), Xs(e, "change", Jl));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t }) {
    e.value = t ?? "";
  },
  beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: s, trim: r, number: i } }, o) {
    if (e[Do] = Zl(o), e.composing) return;
    const a = (i || e.type === "number") && !/^0\d/.test(e.value) ? Qo(e.value) : e.value, l = t ?? "";
    a !== l && (document.activeElement === e && e.type !== "range" && (s && t === n || r && e.value.trim() === l) || (e.value = l));
  }
}, pp = ["ctrl", "shift", "alt", "meta"], mp = {
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
  exact: (e, t) => pp.some((n) => e[`${n}Key`] && !t.includes(n))
}, Is = (e, t) => {
  const n = e._withMods || (e._withMods = {}), s = t.join(".");
  return n[s] || (n[s] = (r, ...i) => {
    for (let o = 0; o < t.length; o++) {
      const a = mp[t[o]];
      if (a && a(r, t)) return;
    }
    return e(r, ...i);
  });
}, gp = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, Si = (e, t) => {
  const n = e._withKeys || (e._withKeys = {}), s = t.join(".");
  return n[s] || (n[s] = (r) => {
    if (!("key" in r))
      return;
    const i = ds(r.key);
    if (t.some(
      (o) => o === i || gp[o] === i
    ))
      return e(r);
  });
}, _p = /* @__PURE__ */ Ot({ patchProp: fp }, Xd);
let Ql;
function yp() {
  return Ql || (Ql = bd(_p));
}
const vp = (...e) => {
  const t = yp().createApp(...e), { mount: n } = t;
  return t.mount = (s) => {
    const r = wp(s);
    if (!r) return;
    const i = t._component;
    !Ce(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
    const o = n(r, !1, bp(r));
    return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), o;
  }, t;
};
function bp(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function wp(e) {
  return gt(e) ? document.querySelector(e) : e;
}
const Wu = /* @__PURE__ */ new Set(["customer_required", "token_invalid"]), ua = (e) => !!e && Wu.has(e), sr = (e) => {
  const t = e.replace("#", ""), n = parseInt(t.substr(0, 2), 16), s = parseInt(t.substr(2, 2), 16), r = parseInt(t.substr(4, 2), 16);
  return (n * 299 + s * 587 + r * 114) / 1e3 < 128;
}, kp = (e, t) => {
  const n = e.replace("#", ""), s = parseInt(n.substr(0, 2), 16), r = parseInt(n.substr(2, 2), 16), i = parseInt(n.substr(4, 2), 16), o = sr(e), a = o ? Math.min(255, s + t) : Math.max(0, s - t), l = o ? Math.min(255, r + t) : Math.max(0, r - t), u = o ? Math.min(255, i + t) : Math.max(0, i - t);
  return `#${a.toString(16).padStart(2, "0")}${l.toString(16).padStart(2, "0")}${u.toString(16).padStart(2, "0")}`;
}, vr = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e), Tp = (e) => {
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
var Fs = Fa();
function qu(e) {
  Fs = e;
}
var $r = { exec: () => null };
function Ke(e, t = "") {
  let n = typeof e == "string" ? e : e.source;
  const s = {
    replace: (r, i) => {
      let o = typeof i == "string" ? i : i.source;
      return o = o.replace(Bt.caret, "$1"), n = n.replace(r, o), s;
    },
    getRegex: () => new RegExp(n, t)
  };
  return s;
}
var Bt = {
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
}, Ap = /^(?:[ \t]*(?:\n|$))+/, Sp = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/, Ep = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, Gr = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, xp = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, $a = /(?:[*+-]|\d{1,9}[.)])/, Vu = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/, Ku = Ke(Vu).replace(/bull/g, $a).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(), Cp = Ke(Vu).replace(/bull/g, $a).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(), Ba = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/, Rp = /^[^\n]+/, Ua = /(?!\s*\])(?:\\.|[^\[\]\\])+/, Ip = Ke(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", Ua).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), Op = Ke(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, $a).getRegex(), co = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", za = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, Lp = Ke(
  "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))",
  "i"
).replace("comment", za).replace("tag", co).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), Gu = Ke(Ba).replace("hr", Gr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", co).getRegex(), Np = Ke(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", Gu).getRegex(), Ha = {
  blockquote: Np,
  code: Sp,
  def: Ip,
  fences: Ep,
  heading: xp,
  hr: Gr,
  html: Lp,
  lheading: Ku,
  list: Op,
  newline: Ap,
  paragraph: Gu,
  table: $r,
  text: Rp
}, ec = Ke(
  "^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"
).replace("hr", Gr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", co).getRegex(), Pp = {
  ...Ha,
  lheading: Cp,
  table: ec,
  paragraph: Ke(Ba).replace("hr", Gr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", ec).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", co).getRegex()
}, Mp = {
  ...Ha,
  html: Ke(
    `^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`
  ).replace("comment", za).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
  heading: /^(#{1,6})(.*)(?:\n+|$)/,
  fences: $r,
  // fences not supported
  lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  paragraph: Ke(Ba).replace("hr", Gr).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", Ku).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
}, Dp = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, Fp = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, Yu = /^( {2,}|\\)\n(?!\s*$)/, $p = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, uo = /[\p{P}\p{S}]/u, ja = /[\s\p{P}\p{S}]/u, Xu = /[^\s\p{P}\p{S}]/u, Bp = Ke(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, ja).getRegex(), Zu = /(?!~)[\p{P}\p{S}]/u, Up = /(?!~)[\s\p{P}\p{S}]/u, zp = /(?:[^\s\p{P}\p{S}]|~)/u, Hp = /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g, Ju = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/, jp = Ke(Ju, "u").replace(/punct/g, uo).getRegex(), Wp = Ke(Ju, "u").replace(/punct/g, Zu).getRegex(), Qu = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", qp = Ke(Qu, "gu").replace(/notPunctSpace/g, Xu).replace(/punctSpace/g, ja).replace(/punct/g, uo).getRegex(), Vp = Ke(Qu, "gu").replace(/notPunctSpace/g, zp).replace(/punctSpace/g, Up).replace(/punct/g, Zu).getRegex(), Kp = Ke(
  "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)",
  "gu"
).replace(/notPunctSpace/g, Xu).replace(/punctSpace/g, ja).replace(/punct/g, uo).getRegex(), Gp = Ke(/\\(punct)/, "gu").replace(/punct/g, uo).getRegex(), Yp = Ke(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), Xp = Ke(za).replace("(?:-->|$)", "-->").getRegex(), Zp = Ke(
  "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>"
).replace("comment", Xp).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), Hi = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/, Jp = Ke(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", Hi).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), ef = Ke(/^!?\[(label)\]\[(ref)\]/).replace("label", Hi).replace("ref", Ua).getRegex(), tf = Ke(/^!?\[(ref)\](?:\[\])?/).replace("ref", Ua).getRegex(), Qp = Ke("reflink|nolink(?!\\()", "g").replace("reflink", ef).replace("nolink", tf).getRegex(), Wa = {
  _backpedal: $r,
  // only used for GFM url
  anyPunctuation: Gp,
  autolink: Yp,
  blockSkip: Hp,
  br: Yu,
  code: Fp,
  del: $r,
  emStrongLDelim: jp,
  emStrongRDelimAst: qp,
  emStrongRDelimUnd: Kp,
  escape: Dp,
  link: Jp,
  nolink: tf,
  punctuation: Bp,
  reflink: ef,
  reflinkSearch: Qp,
  tag: Zp,
  text: $p,
  url: $r
}, em = {
  ...Wa,
  link: Ke(/^!?\[(label)\]\((.*?)\)/).replace("label", Hi).getRegex(),
  reflink: Ke(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", Hi).getRegex()
}, fa = {
  ...Wa,
  emStrongRDelimAst: Vp,
  emStrongLDelim: Wp,
  url: Ke(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, "i").replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
  _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
}, tm = {
  ...fa,
  br: Ke(Yu).replace("{2,}", "*").getRegex(),
  text: Ke(fa.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
}, mi = {
  normal: Ha,
  gfm: Pp,
  pedantic: Mp
}, br = {
  normal: Wa,
  gfm: fa,
  breaks: tm,
  pedantic: em
}, nm = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}, tc = (e) => nm[e];
function kn(e, t) {
  if (t) {
    if (Bt.escapeTest.test(e))
      return e.replace(Bt.escapeReplace, tc);
  } else if (Bt.escapeTestNoEncode.test(e))
    return e.replace(Bt.escapeReplaceNoEncode, tc);
  return e;
}
function nc(e) {
  try {
    e = encodeURI(e).replace(Bt.percentDecode, "%");
  } catch {
    return null;
  }
  return e;
}
function sc(e, t) {
  var i;
  const n = e.replace(Bt.findPipe, (o, a, l) => {
    let u = !1, c = a;
    for (; --c >= 0 && l[c] === "\\"; ) u = !u;
    return u ? "|" : " |";
  }), s = n.split(Bt.splitPipe);
  let r = 0;
  if (s[0].trim() || s.shift(), s.length > 0 && !((i = s.at(-1)) != null && i.trim()) && s.pop(), t)
    if (s.length > t)
      s.splice(t);
    else
      for (; s.length < t; ) s.push("");
  for (; r < s.length; r++)
    s[r] = s[r].trim().replace(Bt.slashPipe, "|");
  return s;
}
function wr(e, t, n) {
  const s = e.length;
  if (s === 0)
    return "";
  let r = 0;
  for (; r < s && e.charAt(s - r - 1) === t; )
    r++;
  return e.slice(0, s - r);
}
function sm(e, t) {
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
function rc(e, t, n, s, r) {
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
function rm(e, t, n) {
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
var ji = class {
  // set by the lexer
  constructor(e) {
    tt(this, "options");
    tt(this, "rules");
    // set by the lexer
    tt(this, "lexer");
    this.options = e || Fs;
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
        text: this.options.pedantic ? n : wr(n, `
`)
      };
    }
  }
  fences(e) {
    const t = this.rules.block.fences.exec(e);
    if (t) {
      const n = t[0], s = rm(n, t[3] || "", this.rules);
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
        const s = wr(n, "#");
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
        raw: wr(t[0], `
`)
      };
  }
  blockquote(e) {
    const t = this.rules.block.blockquote.exec(e);
    if (t) {
      let n = wr(t[0], `
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
          const R = this.rules.other.nextBulletRegex(O), fe = this.rules.other.hrRegex(O), _e = this.rules.other.fencesBeginRegex(O), x = this.rules.other.headingBeginRegex(O), M = this.rules.other.htmlBeginRegex(O);
          for (; e; ) {
            const S = e.split(`
`, 1)[0];
            let W;
            if (T = S, this.options.pedantic ? (T = T.replace(this.rules.other.listReplaceNesting, "  "), W = T) : W = T.replace(this.rules.other.tabCharGlobal, "    "), _e.test(T) || x.test(T) || M.test(T) || R.test(T) || fe.test(T))
              break;
            if (W.search(this.rules.other.nonSpaceChar) >= O || !T.trim())
              c += `
` + W.slice(O);
            else {
              if (I || b.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || _e.test(b) || x.test(b) || fe.test(b))
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
    const n = sc(t[1]), s = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), r = (o = t[3]) != null && o.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
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
        i.rows.push(sc(a, i.header.length).map((l, u) => ({
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
        const i = wr(n.slice(0, -1), "\\");
        if ((n.length - i.length) % 2 === 0)
          return;
      } else {
        const i = sm(t[2], "()");
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
      return s = s.trim(), this.rules.other.startAngleBracket.test(s) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n) ? s = s.slice(1) : s = s.slice(1, -1)), rc(t, {
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
      return rc(n, r, n[0], this.lexer, this.rules);
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
}, Fn = class ha {
  constructor(t) {
    tt(this, "tokens");
    tt(this, "options");
    tt(this, "state");
    tt(this, "tokenizer");
    tt(this, "inlineQueue");
    this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = t || Fs, this.options.tokenizer = this.options.tokenizer || new ji(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = {
      inLink: !1,
      inRawBlock: !1,
      top: !0
    };
    const n = {
      other: Bt,
      block: mi.normal,
      inline: br.normal
    };
    this.options.pedantic ? (n.block = mi.pedantic, n.inline = br.pedantic) : this.options.gfm && (n.block = mi.gfm, this.options.breaks ? n.inline = br.breaks : n.inline = br.gfm), this.tokenizer.rules = n;
  }
  /**
   * Expose Rules
   */
  static get rules() {
    return {
      block: mi,
      inline: br
    };
  }
  /**
   * Static Lex Method
   */
  static lex(t, n) {
    return new ha(n).lex(t);
  }
  /**
   * Static Lex Inline Method
   */
  static lexInline(t, n) {
    return new ha(n).inlineTokens(t);
  }
  /**
   * Preprocessing
   */
  lex(t) {
    t = t.replace(Bt.carriageReturn, `
`), this.blockTokens(t, this.tokens);
    for (let n = 0; n < this.inlineQueue.length; n++) {
      const s = this.inlineQueue[n];
      this.inlineTokens(s.src, s.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(t, n = [], s = !1) {
    var r, i, o;
    for (this.options.pedantic && (t = t.replace(Bt.tabCharGlobal, "    ").replace(Bt.spaceLine, "")); t; ) {
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
}, Wi = class {
  // set by the parser
  constructor(e) {
    tt(this, "options");
    tt(this, "parser");
    this.options = e || Fs;
  }
  space(e) {
    return "";
  }
  code({ text: e, lang: t, escaped: n }) {
    var i;
    const s = (i = (t || "").match(Bt.notSpaceStart)) == null ? void 0 : i[0], r = e.replace(Bt.endingNewline, "") + `
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
    const s = this.parser.parseInline(n), r = nc(e);
    if (r === null)
      return s;
    e = r;
    let i = '<a href="' + e + '"';
    return t && (i += ' title="' + kn(t) + '"'), i += ">" + s + "</a>", i;
  }
  image({ href: e, title: t, text: n, tokens: s }) {
    s && (n = this.parser.parseInline(s, this.parser.textRenderer));
    const r = nc(e);
    if (r === null)
      return kn(n);
    e = r;
    let i = `<img src="${e}" alt="${n}"`;
    return t && (i += ` title="${kn(t)}"`), i += ">", i;
  }
  text(e) {
    return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : kn(e.text);
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
}, $n = class da {
  constructor(t) {
    tt(this, "options");
    tt(this, "renderer");
    tt(this, "textRenderer");
    this.options = t || Fs, this.options.renderer = this.options.renderer || new Wi(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new qa();
  }
  /**
   * Static Parse Method
   */
  static parse(t, n) {
    return new da(n).parse(t);
  }
  /**
   * Static Parse Inline Method
   */
  static parseInline(t, n) {
    return new da(n).parseInline(t);
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
}, Zo, Ei = (Zo = class {
  constructor(e) {
    tt(this, "options");
    tt(this, "block");
    this.options = e || Fs;
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
    return this.block ? Fn.lex : Fn.lexInline;
  }
  /**
   * Provide function to parse tokens
   */
  provideParser() {
    return this.block ? $n.parse : $n.parseInline;
  }
}, tt(Zo, "passThroughHooks", /* @__PURE__ */ new Set([
  "preprocess",
  "postprocess",
  "processAllTokens"
])), Zo), im = class {
  constructor(...e) {
    tt(this, "defaults", Fa());
    tt(this, "options", this.setOptions);
    tt(this, "parse", this.parseMarkdown(!0));
    tt(this, "parseInline", this.parseMarkdown(!1));
    tt(this, "Parser", $n);
    tt(this, "Renderer", Wi);
    tt(this, "TextRenderer", qa);
    tt(this, "Lexer", Fn);
    tt(this, "Tokenizer", ji);
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
        const r = this.defaults.renderer || new Wi(this.defaults);
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
        const r = this.defaults.tokenizer || new ji(this.defaults);
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
    return Fn.lex(e, t ?? this.defaults);
  }
  parser(e, t) {
    return $n.parse(e, t ?? this.defaults);
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
      const a = i.hooks ? i.hooks.provideLexer() : e ? Fn.lex : Fn.lexInline, l = i.hooks ? i.hooks.provideParser() : e ? $n.parse : $n.parseInline;
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
        const s = "<p>An error occurred:</p><pre>" + kn(n.message + "", !0) + "</pre>";
        return t ? Promise.resolve(s) : s;
      }
      if (t)
        return Promise.reject(n);
      throw n;
    };
  }
}, Ms = new im();
function He(e, t) {
  return Ms.parse(e, t);
}
He.options = He.setOptions = function(e) {
  return Ms.setOptions(e), He.defaults = Ms.defaults, qu(He.defaults), He;
};
He.getDefaults = Fa;
He.defaults = Fs;
He.use = function(...e) {
  return Ms.use(...e), He.defaults = Ms.defaults, qu(He.defaults), He;
};
He.walkTokens = function(e, t) {
  return Ms.walkTokens(e, t);
};
He.parseInline = Ms.parseInline;
He.Parser = $n;
He.parser = $n.parse;
He.Renderer = Wi;
He.TextRenderer = qa;
He.Lexer = Fn;
He.lexer = Fn.lex;
He.Tokenizer = ji;
He.Hooks = Ei;
He.parse = He;
He.options;
He.setOptions;
He.use;
He.walkTokens;
He.parseInline;
$n.parse;
Fn.lex;
/*! @license DOMPurify 3.4.15 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.15/LICENSE */
function ic(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function om(e) {
  if (Array.isArray(e)) return e;
}
function am(e, t) {
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
function lm() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function cm(e, t) {
  return om(e) || am(e, t) || um(e, t) || lm();
}
function um(e, t) {
  if (e) {
    if (typeof e == "string") return ic(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ic(e, t) : void 0;
  }
}
const nf = Object.entries, oc = Object.setPrototypeOf, fm = Object.isFrozen, hm = Object.getPrototypeOf, dm = Object.getOwnPropertyDescriptor;
let vt = Object.freeze, kt = Object.seal, Zs = Object.create, sf = typeof Reflect < "u" && Reflect, pa = sf.apply, ma = sf.construct;
vt || (vt = function(t) {
  return t;
});
kt || (kt = function(t) {
  return t;
});
pa || (pa = function(t, n) {
  for (var s = arguments.length, r = new Array(s > 2 ? s - 2 : 0), i = 2; i < s; i++)
    r[i - 2] = arguments[i];
  return t.apply(n, r);
});
ma || (ma = function(t) {
  for (var n = arguments.length, s = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
    s[r - 1] = arguments[r];
  return new t(...s);
});
const Os = _t(Array.prototype.forEach), pm = _t(Array.prototype.lastIndexOf), ac = _t(Array.prototype.pop), kr = _t(Array.prototype.push), mm = _t(Array.prototype.splice), rr = Array.isArray, Cr = _t(String.prototype.toLowerCase), Fo = _t(String.prototype.toString), lc = _t(String.prototype.match), Tr = _t(String.prototype.replace), cc = _t(String.prototype.indexOf), gm = _t(String.prototype.trim), _m = _t(Number.prototype.toString), ym = _t(Boolean.prototype.toString), uc = typeof BigInt > "u" ? null : _t(BigInt.prototype.toString), fc = typeof Symbol > "u" ? null : _t(Symbol.prototype.toString), jt = _t(Object.prototype.hasOwnProperty), Ar = _t(Object.prototype.toString), Ct = _t(RegExp.prototype.test), Cs = vm(TypeError);
function _t(e) {
  return function(t) {
    t instanceof RegExp && (t.lastIndex = 0);
    for (var n = arguments.length, s = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
      s[r - 1] = arguments[r];
    return pa(e, t, s);
  };
}
function vm(e) {
  return function() {
    for (var t = arguments.length, n = new Array(t), s = 0; s < t; s++)
      n[s] = arguments[s];
    return ma(e, n);
  };
}
function Fe(e, t) {
  let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : Cr;
  if (oc && oc(e, null), !rr(t))
    return e;
  let s = t.length;
  for (; s--; ) {
    let r = t[s];
    if (typeof r == "string") {
      const i = n(r);
      i !== r && (fm(t) || (t[s] = i), r = i);
    }
    e[r] = !0;
  }
  return e;
}
function bm(e) {
  for (let t = 0; t < e.length; t++)
    jt(e, t) || (e[t] = null);
  return e;
}
function Jt(e) {
  const t = Zs(null);
  for (const s of nf(e)) {
    var n = cm(s, 2);
    const r = n[0], i = n[1];
    jt(e, r) && (rr(i) ? t[r] = bm(i) : i && typeof i == "object" && i.constructor === Object ? t[r] = Jt(i) : t[r] = i);
  }
  return t;
}
function wm(e) {
  switch (typeof e) {
    case "string":
      return e;
    case "number":
      return _m(e);
    case "boolean":
      return ym(e);
    case "bigint":
      return uc ? uc(e) : "0";
    case "symbol":
      return fc ? fc(e) : "Symbol()";
    case "undefined":
      return Ar(e);
    case "function":
    case "object": {
      if (e === null)
        return Ar(e);
      const t = e, n = on(t, "toString");
      if (typeof n == "function") {
        const s = n(t);
        return typeof s == "string" ? s : Ar(s);
      }
      return Ar(e);
    }
    default:
      return Ar(e);
  }
}
function on(e, t) {
  for (; e !== null; ) {
    const s = dm(e, t);
    if (s) {
      if (s.get)
        return _t(s.get);
      if (typeof s.value == "function")
        return _t(s.value);
    }
    e = hm(e);
  }
  function n() {
    return null;
  }
  return n;
}
function km(e) {
  try {
    return Ct(e, ""), !0;
  } catch {
    return !1;
  }
}
const hc = vt(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]), $o = vt(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "enterkeyhint", "exportparts", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "inputmode", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "part", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]), Bo = vt(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]), Tm = vt(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]), Uo = vt(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]), Am = vt(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]), dc = vt(["#text"]), pc = vt(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "command", "commandfor", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "exportparts", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inert", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "part", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "slot", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns"]), zo = vt(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dominant-baseline", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "mask-type", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "pointer-events", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-orientation", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "vector-effect", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]), mc = vt(["accent", "accentunder", "align", "bevelled", "close", "columnalign", "columnlines", "columnspacing", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lquote", "lspace", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]), gi = vt(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]), Sm = kt(/{{[\w\W]*|^[\w\W]*}}/g), Em = kt(/<%[\w\W]*|^[\w\W]*%>/g), xm = kt(/\${[\w\W]*/g), Cm = kt(/^data-[\-\w.\u00B7-\uFFFF]+$/), Rm = kt(/^aria-[\-\w]+$/), gc = kt(
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  // eslint-disable-line no-useless-escape
), Im = kt(/^(?:\w+script|data):/i), Om = kt(
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g
  // eslint-disable-line no-control-regex
), Lm = kt(/^html$/i), Nm = kt(/^[a-z][.\w]*(-[.\w]+)+$/i), _c = kt(/<[/\w!]/g), yc = kt(/<[/\w]/g), Pm = kt(/<\/no(script|embed|frames)/i), Mm = kt(/\/>/i), Xt = {
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
}, rf = ["style", "script", "xmp", "iframe", "noembed", "noframes", "plaintext", "noscript"], Dm = vt(Fe({}, rf)), Fm = function() {
  const e = {};
  return Os(rf, (t) => {
    e[t] = kt(new RegExp("</" + t + "(?=[\\t\\n\\f\\r />])", "i"));
  }), vt(e);
}(), $m = function() {
  return typeof window > "u" ? null : window;
}, Bm = function(t, n) {
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
}, vc = function() {
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
  return jt(t, n) && rr(t[n]) ? Fe(r.base ? Jt(r.base) : {}, t[n], r.transform) : s;
}, Ho = function(t, n, s) {
  const r = jt(t, n) ? t[n] : void 0;
  return r && typeof r == "object" ? Jt(r) : s();
};
function of() {
  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : $m();
  const t = (G) => of(G);
  if (t.version = "3.4.15", t.removed = [], !e || !e.document || e.document.nodeType !== Xt.document || !e.Element)
    return t.isSupported = !1, t;
  let n = e.document;
  const s = n, r = s.currentScript;
  e.DocumentFragment;
  const i = e.HTMLTemplateElement, o = e.Node, a = e.Element, l = e.NodeFilter, u = e.NamedNodeMap;
  u === void 0 && (e.NamedNodeMap || e.MozNamedAttrMap), e.HTMLFormElement;
  const c = e.DOMParser, b = e.trustedTypes, T = a.prototype, I = on(T, "cloneNode"), O = on(T, "remove"), H = on(T, "removeAttributeNode"), ue = on(T, "nextSibling"), R = on(T, "childNodes"), fe = on(T, "parentNode"), _e = on(T, "shadowRoot"), x = on(T, "attributes"), M = o && o.prototype ? on(o.prototype, "nodeType") : null, S = o && o.prototype ? on(o.prototype, "nodeName") : null, W = o && o.prototype ? on(o.prototype, "ownerDocument") : null, se = function(d) {
    return M ? M(d) : d.nodeType;
  }, me = function(d) {
    return S ? S(d) : d.nodeName;
  };
  if (typeof i == "function") {
    const G = n.createElement("template");
    G.content && G.content.ownerDocument && (n = G.content.ownerDocument);
  }
  let ge, Oe = "", Se, Ge = !1, Ue = 0;
  const st = function() {
    if (Ue > 0)
      throw Cs('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.');
  }, he = function(d) {
    st(), Ue++;
    try {
      return ge.createHTML(d);
    } finally {
      Ue--;
    }
  }, Te = function(d) {
    st(), Ue++;
    try {
      return ge.createScriptURL(d);
    } finally {
      Ue--;
    }
  }, ye = function() {
    return Ge || (Se = Bm(b, r), Ge = !0), Se;
  }, Ze = n, Je = Ze.implementation, lt = Ze.createNodeIterator, je = Ze.createDocumentFragment, Lt = Ze.getElementsByTagName, _n = s.importNode;
  let Me = vc();
  t.isSupported = typeof nf == "function" && typeof fe == "function" && Je && Je.createHTMLDocument !== void 0;
  const bt = Sm, Ut = Em, Wt = xm, qt = Cm, Nt = Rm, yn = Im, _ = Om, v = Nm;
  let L = gc, D = null;
  const U = Fe({}, [...hc, ...$o, ...Bo, ...Uo, ...dc]);
  let P = null;
  const X = Fe({}, [...pc, ...zo, ...mc, ...gi]);
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
  let Z = !0, Q = !0, pe = !1, de = !0, be = !1, ke = !0, De = !1, $ = !1, z = null, f = null, y = !1, N = !1, C = !1, q = !1, ne = !0, ie = !1;
  const Ee = "user-content-";
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
  let fn = null;
  const $s = Fe({}, ["audio", "video", "img", "source", "image", "track"]);
  let Hn = null;
  const Yr = Fe({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), zt = "http://www.w3.org/1998/Math/MathML", Pt = "http://www.w3.org/2000/svg", Vt = "http://www.w3.org/1999/xhtml";
  let Tt = Vt, jn = !1, Wn = null;
  const gs = Fe({}, [zt, Pt, Vt], Fo), Xr = vt(["mi", "mo", "mn", "ms", "mtext"]);
  let Rn = Fe({}, Xr);
  const hn = vt(["annotation-xml"]);
  let Kt = Fe({}, hn);
  const Zr = Fe({}, ["title", "style", "font", "a", "script"]);
  let ft = null;
  const po = ["application/xhtml+xml", "text/html"], Jr = "text/html";
  let $e = null, qn = null;
  const _s = n.createElement("form"), Bs = function(d) {
    return d instanceof RegExp || d instanceof Function;
  }, lr = function() {
    let d = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (qn && qn === d)
      return;
    (!d || typeof d != "object") && (d = {}), d = Jt(d), ft = // eslint-disable-next-line unicorn/prefer-includes
    po.indexOf(d.PARSER_MEDIA_TYPE) === -1 ? Jr : d.PARSER_MEDIA_TYPE, $e = ft === "application/xhtml+xml" ? Fo : Cr, D = ts(d, "ALLOWED_TAGS", U, {
      transform: $e
    }), P = ts(d, "ALLOWED_ATTR", X, {
      transform: $e
    }), Wn = ts(d, "ALLOWED_NAMESPACES", gs, {
      transform: Fo
    }), Hn = ts(d, "ADD_URI_SAFE_ATTR", Yr, {
      transform: $e,
      base: Yr
    }), fn = ts(d, "ADD_DATA_URI_TAGS", $s, {
      transform: $e,
      base: $s
    }), Qe = ts(d, "FORBID_CONTENTS", rt, {
      transform: $e
    }), K = ts(d, "FORBID_TAGS", Jt({}), {
      transform: $e
    }), j = ts(d, "FORBID_ATTR", Jt({}), {
      transform: $e
    }), Le = jt(d, "USE_PROFILES") ? d.USE_PROFILES && typeof d.USE_PROFILES == "object" ? Jt(d.USE_PROFILES) : d.USE_PROFILES : !1, Z = d.ALLOW_ARIA_ATTR !== !1, Q = d.ALLOW_DATA_ATTR !== !1, pe = d.ALLOW_UNKNOWN_PROTOCOLS || !1, de = d.ALLOW_SELF_CLOSE_IN_ATTR !== !1, be = d.SAFE_FOR_TEMPLATES || !1, ke = d.SAFE_FOR_XML !== !1, De = d.WHOLE_DOCUMENT || !1, N = d.RETURN_DOM || !1, C = d.RETURN_DOM_FRAGMENT || !1, q = d.RETURN_TRUSTED_TYPE || !1, y = d.FORCE_BODY || !1, ne = d.SANITIZE_DOM !== !1, ie = d.SANITIZE_NAMED_PROPS || !1, Ie = d.KEEP_CONTENT !== !1, ze = d.IN_PLACE || !1, L = km(d.ALLOWED_URI_REGEXP) ? d.ALLOWED_URI_REGEXP : gc, Tt = typeof d.NAMESPACE == "string" ? d.NAMESPACE : Vt, Rn = Ho(
      d,
      "MATHML_TEXT_INTEGRATION_POINTS",
      () => Fe({}, Xr)
      // Default built-in map
    ), Kt = Ho(
      d,
      "HTML_INTEGRATION_POINTS",
      () => Fe({}, hn)
      // Default built-in map
    );
    const k = Ho(d, "CUSTOM_ELEMENT_HANDLING", () => Zs(null));
    if (V = Zs(null), jt(k, "tagNameCheck") && Bs(k.tagNameCheck) && (V.tagNameCheck = k.tagNameCheck), jt(k, "attributeNameCheck") && Bs(k.attributeNameCheck) && (V.attributeNameCheck = k.attributeNameCheck), jt(k, "allowCustomizedBuiltInElements") && typeof k.allowCustomizedBuiltInElements == "boolean" && (V.allowCustomizedBuiltInElements = k.allowCustomizedBuiltInElements), kt(V), be && (Q = !1), C && (N = !0), Le && (D = Fe({}, dc), P = Zs(null), Le.html === !0 && (Fe(D, hc), Fe(P, pc)), Le.svg === !0 && (Fe(D, $o), Fe(P, zo), Fe(P, gi)), Le.svgFilters === !0 && (Fe(D, Bo), Fe(P, zo), Fe(P, gi)), Le.mathMl === !0 && (Fe(D, Uo), Fe(P, mc), Fe(P, gi))), re.tagCheck = null, re.attributeCheck = null, jt(d, "ADD_TAGS") && (typeof d.ADD_TAGS == "function" ? re.tagCheck = d.ADD_TAGS : rr(d.ADD_TAGS) && (D === U && (D = Jt(D)), Fe(D, d.ADD_TAGS, $e))), jt(d, "ADD_ATTR") && (typeof d.ADD_ATTR == "function" ? re.attributeCheck = d.ADD_ATTR : rr(d.ADD_ATTR) && (P === X && (P = Jt(P)), Fe(P, d.ADD_ATTR, $e))), jt(d, "ADD_FORBID_CONTENTS") && rr(d.ADD_FORBID_CONTENTS) && (Qe === rt && (Qe = Jt(Qe)), Fe(Qe, d.ADD_FORBID_CONTENTS, $e)), Ie && (D["#text"] = !0), De && Fe(D, ["html", "head", "body"]), D.table && (Fe(D, ["tbody"]), delete K.tbody), d.TRUSTED_TYPES_POLICY) {
      if (typeof d.TRUSTED_TYPES_POLICY.createHTML != "function")
        throw Cs('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
      if (typeof d.TRUSTED_TYPES_POLICY.createScriptURL != "function")
        throw Cs('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
      const B = ge;
      ge = d.TRUSTED_TYPES_POLICY;
      try {
        Oe = he("");
      } catch (ee) {
        throw ge = B, ee;
      }
    } else d.TRUSTED_TYPES_POLICY === null ? (ge = void 0, Oe = "") : (ge === void 0 && (ge = ye()), ge && typeof Oe == "string" && (Oe = he("")));
    vt && vt(d), qn = d;
  }, ys = Fe({}, [...$o, ...Bo, ...Tm]), cr = Fe({}, [...Uo, ...Am]), Qr = function(d, k, B) {
    return k.namespaceURI === Vt ? d === "svg" : k.namespaceURI === zt ? d === "svg" && (B === "annotation-xml" || Rn[B]) : !!ys[d];
  }, ei = function(d, k, B) {
    return k.namespaceURI === Vt ? d === "math" : k.namespaceURI === Pt ? d === "math" && Kt[B] : !!cr[d];
  }, ti = function(d, k, B) {
    return k.namespaceURI === Pt && !Kt[B] || k.namespaceURI === zt && !Rn[B] ? !1 : !cr[d] && (Zr[d] || !ys[d]);
  }, ni = function(d) {
    let k = fe(d);
    (!k || !k.tagName) && (k = {
      namespaceURI: Tt,
      tagName: "template"
    });
    const B = Cr(d.tagName), ee = Cr(k.tagName);
    return Wn[d.namespaceURI] ? d.namespaceURI === Pt ? Qr(B, k, ee) : d.namespaceURI === zt ? ei(B, k, ee) : d.namespaceURI === Vt ? ti(B, k, ee) : !!(ft === "application/xhtml+xml" && Wn[d.namespaceURI]) : !1;
  }, dn = function(d) {
    kr(t.removed, {
      element: d
    });
    try {
      fe(d).removeChild(d);
    } catch {
      if (O(d), !fe(d))
        throw Cs("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place");
    }
  }, si = function(d, k, B) {
    try {
      H(d, k);
    } catch {
      try {
        d.removeAttribute(B);
      } catch {
      }
    }
  }, Vn = function(d) {
    vs(d);
    const k = R(d);
    if (k) {
      const ee = [];
      Os(k, (le) => {
        kr(ee, le);
      }), Os(ee, (le) => {
        try {
          O(le);
        } catch {
        }
      });
    }
    const B = x(d);
    if (B)
      for (let ee = B.length - 1; ee >= 0; --ee) {
        const le = B[ee], ve = le && le.name;
        typeof ve == "string" && si(d, le, ve);
      }
  }, en = function(d, k, B) {
    if (!B)
      try {
        B = k.getAttributeNode(d);
      } catch {
        B = null;
      }
    kr(t.removed, {
      attribute: B || null,
      from: k
    });
    try {
      B ? H(k, B) : k.removeAttribute(d);
    } catch {
      try {
        k.removeAttribute(d);
      } catch {
      }
    }
    if (d === "is")
      if (N || C)
        try {
          dn(k);
        } catch {
        }
      else
        try {
          k.setAttribute(d, "");
        } catch {
        }
  }, ri = function(d) {
    const k = x(d);
    if (k)
      for (let B = k.length - 1; B >= 0; --B) {
        const ee = k[B], le = ee && ee.name;
        typeof le != "string" || P[$e(le)] || si(d, ee, le);
      }
  }, vs = function(d) {
    const k = [d];
    for (; k.length > 0; ) {
      const B = k.pop();
      se(B) === Xt.element && ri(B);
      const le = R(B);
      if (le)
        for (let ve = le.length - 1; ve >= 0; --ve)
          k.push(le[ve]);
    }
  }, vn = function(d, k) {
    return ke ? d === "patchsrc" ? !0 : d === "for" && k !== "label" && k !== "output" : !1;
  }, bs = function(d) {
    if (!ke)
      return;
    const k = [d];
    for (; k.length > 0; ) {
      const B = k.pop(), ee = se(B);
      if (ee === Xt.processingInstruction || ee === Xt.comment && Ct(yc, B.data)) {
        try {
          O(B);
        } catch {
        }
        continue;
      }
      if (ee === Xt.element) {
        const ve = B, Ye = $e(me(B));
        try {
          ve.hasAttribute && ve.hasAttribute("patchsrc") && ve.removeAttribute("patchsrc"), ve.hasAttribute && ve.hasAttribute("for") && vn("for", Ye) && ve.removeAttribute("for");
        } catch {
        }
      }
      const le = R(B);
      if (le)
        for (let ve = le.length - 1; ve >= 0; --ve)
          k.push(le[ve]);
    }
  }, Us = function(d) {
    let k = null, B = null;
    if (y)
      d = "<remove></remove>" + d;
    else {
      const ve = lc(d, /^[\r\n\t ]+/);
      B = ve && ve[0];
    }
    ft === "application/xhtml+xml" && Tt === Vt && (d = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + d + "</body></html>");
    const ee = ge ? he(d) : d;
    if (Tt === Vt)
      try {
        k = new c().parseFromString(ee, ft);
      } catch {
      }
    if (!k || !k.documentElement) {
      k = Je.createDocument(Tt, "template", null);
      try {
        k.documentElement.innerHTML = jn ? Oe : ee;
      } catch {
      }
    }
    const le = k.body || k.documentElement;
    return d && B && le.insertBefore(n.createTextNode(B), le.childNodes[0] || null), Tt === Vt ? Lt.call(k, De ? "html" : "body")[0] : De ? k.documentElement : le;
  }, zs = function(d) {
    const k = W ? W(d) : d.ownerDocument;
    return lt.call(
      k || d,
      d,
      // eslint-disable-next-line no-bitwise
      l.SHOW_ELEMENT | l.SHOW_COMMENT | l.SHOW_TEXT | l.SHOW_PROCESSING_INSTRUCTION | l.SHOW_CDATA_SECTION,
      null
    );
  }, In = function(d) {
    return d = Tr(d, bt, " "), d = Tr(d, Ut, " "), d = Tr(d, Wt, " "), d;
  }, tn = function(d) {
    var k;
    d.normalize();
    const B = W ? W(d) : d.ownerDocument, ee = lt.call(
      B || d,
      d,
      // eslint-disable-next-line no-bitwise
      l.SHOW_TEXT | l.SHOW_COMMENT | l.SHOW_CDATA_SECTION | l.SHOW_PROCESSING_INSTRUCTION,
      null
    );
    let le = ee.nextNode();
    for (; le; )
      le.data = In(le.data), le = ee.nextNode();
    const ve = (k = d.querySelectorAll) === null || k === void 0 ? void 0 : k.call(d, "template");
    ve && Os(ve, (Ye) => {
      pn(Ye.content) && tn(Ye.content);
    });
  }, Kn = function(d) {
    const k = S ? S(d) : null;
    return typeof k != "string" || $e(k) !== "form" ? !1 : typeof d.nodeName != "string" || typeof d.textContent != "string" || typeof d.removeChild != "function" || // Realm-safe NamedNodeMap detection: equality against the cached
    // prototype getter. Clobbered .attributes (e.g. <input name="attributes">)
    // makes the direct read diverge from the cached read; a clean form
    // (same-realm OR foreign-realm) has both reads pointing at the same
    // canonical NamedNodeMap.
    d.attributes !== x(d) || typeof d.removeAttribute != "function" || // A form descendant named "removeAttributeNode" or "getAttributeNode"
    // shadows these Attr-node methods via [LegacyOverrideBuiltIns].
    // _removeAttribute() / _stripAttributeNode() reach for
    // element.removeAttributeNode(attr) first; when it is shadowed the call
    // throws and the name-based fallback element.removeAttribute(name)
    // ASCII-lowercases its lookup key in an HTML document, silently missing
    // a case-preserved event-handler attribute (e.g. an ONANIMATIONSTART
    // that reached the sanitizer through an XML/XHTML parse). Flag the form
    // so it is removed wholesale, exactly as for the other shadowed methods.
    typeof d.removeAttributeNode != "function" || typeof d.getAttributeNode != "function" || typeof d.setAttribute != "function" || typeof d.namespaceURI != "string" || typeof d.insertBefore != "function" || typeof d.hasChildNodes != "function" || // NodeType clobbering probe. Cached Node.prototype.nodeType getter
    // returns the integer 1 for any Element regardless of realm; direct
    // read on a clobbered form (e.g. <input name="nodeType">) returns
    // the named child element. Cheap addition — nodeType is read from
    // an internal slot, no serialization cost — and removes a residual
    // clobbering surface used by several mXSS / PI / comment branches
    // in _sanitizeElements that compare currentNode.nodeType directly.
    d.nodeType !== M(d) || // HTMLFormElement has [LegacyOverrideBuiltIns]: a descendant named
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
    d.childNodes !== R(d);
  }, pn = function(d) {
    if (!M || typeof d != "object" || d === null)
      return !1;
    try {
      return M(d) === Xt.documentFragment;
    } catch {
      return !1;
    }
  }, Gn = function(d) {
    if (!M || typeof d != "object" || d === null)
      return !1;
    try {
      return typeof M(d) == "number";
    } catch {
      return !1;
    }
  };
  function wt(G, d, k) {
    G.length !== 0 && Os(G, (B) => {
      B.call(t, d, k, qn);
    });
  }
  const mo = function(d, k) {
    return !!(ke && d.hasChildNodes() && !Gn(d.firstElementChild) && Ct(_c, d.textContent) && Ct(_c, d.innerHTML) || ke && d.namespaceURI === Vt && Dm[k] && (Gn(d.firstElementChild) || typeof d.textContent == "string" && Ct(Fm[k], d.textContent)) || d.nodeType === Xt.processingInstruction || ke && d.nodeType === Xt.comment && Ct(yc, d.data));
  }, bn = function(d, k) {
    if (d instanceof RegExp)
      return Ct(d, k);
    if (d instanceof Function) {
      for (var B = arguments.length, ee = new Array(B > 2 ? B - 2 : 0), le = 2; le < B; le++)
        ee[le - 2] = arguments[le];
      return !!d(k, ...ee);
    }
    return !1;
  }, ii = function(d, k, B) {
    if (!K[k] && Gt(k) && bn(V.tagNameCheck, k))
      return !1;
    if (Ie && !Qe[k]) {
      const ee = fe(d), le = R(d);
      if (le && ee) {
        const ve = le.length;
        for (let Ye = ve - 1; Ye >= 0; --Ye) {
          const ot = d === B ? I(le[Ye], !0) : le[Ye];
          ee.insertBefore(ot, ue(d));
        }
      }
    }
    return dn(d), !0;
  }, oi = function(d, k, B, ee) {
    return d.length === 0 ? k : k === B || k === ee ? Jt(k) : k;
  }, ur = function(d, k) {
    return d === k || fe(d) !== null ? !1 : (ze && vs(d), !0);
  }, ws = function(d, k) {
    if (wt(Me.beforeSanitizeElements, d, null), ur(d, k))
      return !0;
    if (Kn(d))
      return dn(d), !0;
    const B = $e(me(d));
    if (D = oi(Me.uponSanitizeElement, D, U, z), wt(Me.uponSanitizeElement, d, {
      tagName: B,
      allowedTags: D
    }), ur(d, k))
      return !0;
    if (mo(d, B))
      return dn(d), !0;
    if (K[B] || !(re.tagCheck instanceof Function && re.tagCheck(B)) && !D[B]) {
      const le = ii(d, B, k);
      return le === !1 && wt(Me.afterSanitizeElements, d, null), le;
    }
    if (se(d) === Xt.element && !ni(d) || (B === "noscript" || B === "noembed" || B === "noframes") && Ct(Pm, d.innerHTML))
      return dn(d), !0;
    if (be && d.nodeType === Xt.text) {
      const le = In(d.textContent);
      d.textContent !== le && (kr(t.removed, {
        element: d.cloneNode()
      }), d.textContent = le);
    }
    return wt(Me.afterSanitizeElements, d, null), !1;
  }, Hs = function(d, k, B) {
    if (j[k] || vn(k, d) || ne && (k === "id" || k === "name") && (B in n || B in _s))
      return !1;
    const ee = P[k] || re.attributeCheck instanceof Function && re.attributeCheck(k, d);
    return Q && Ct(qt, k) || Z && Ct(Nt, k) ? !0 : ee ? Hn[k] || Ct(L, Tr(B, _, "")) || (k === "src" || k === "xlink:href" || k === "href") && d !== "script" && cc(B, "data:") === 0 && fn[d] || pe && !Ct(yn, Tr(B, _, "")) ? !0 : !B : (
      // Condition a) covers a basically valid custom element tag name whose
      // tag passes the configured tagNameCheck and whose attribute name
      // passes the configured attributeNameCheck ...
      Gt(d) && bn(V.tagNameCheck, d) && bn(V.attributeNameCheck, k, d) || // Condition b) covers an `is` attribute whose value passes the
      // configured tagNameCheck while customized built-in elements are
      // allowed.
      k === "is" && V.allowCustomizedBuiltInElements && bn(V.tagNameCheck, B)
    );
  }, nn = Fe({}, ["annotation-xml", "color-profile", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "missing-glyph"]), Gt = function(d) {
    return !nn[Cr(d)] && Ct(v, d);
  }, ht = function(d, k, B, ee) {
    if (ge && typeof b == "object" && typeof b.getAttributeType == "function" && !B)
      switch (b.getAttributeType(d, k)) {
        case "TrustedHTML":
          return he(ee);
        case "TrustedScriptURL":
          return Te(ee);
      }
    return ee;
  }, yt = function(d, k, B, ee) {
    try {
      return B ? d.setAttributeNS(B, k, ee) : d.setAttribute(k, ee), Kn(d) ? (dn(d), !1) : !0;
    } catch {
      return en(k, d), !1;
    }
  }, ut = function(d) {
    wt(Me.beforeSanitizeAttributes, d, null);
    const k = d.attributes;
    if (!k || Kn(d))
      return;
    P = oi(Me.uponSanitizeAttribute, P, X, f);
    const B = {
      attrName: "",
      attrValue: "",
      keepAttr: !0,
      allowedAttributes: P,
      forceKeepAttr: void 0
    };
    let ee = k.length;
    const le = $e(d.nodeName);
    for (; ee--; ) {
      const ve = k[ee], Ye = ve.name, ot = ve.namespaceURI, Et = ve.value, xt = $e(Ye), fr = Et;
      let We = Ye === "value" ? fr : gm(fr), ai = !1;
      if (B.attrName = xt, B.attrValue = We, B.keepAttr = !0, B.forceKeepAttr = void 0, wt(Me.uponSanitizeAttribute, d, B), We = B.attrValue, ie && (xt === "id" || xt === "name") && cc(We, Ee) !== 0 && (en(Ye, d, ve), We = Ee + We, ai = !0), ke && Ct(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, We)) {
        en(Ye, d, ve);
        continue;
      }
      if (xt === "attributename" && lc(We, "href")) {
        en(Ye, d, ve);
        continue;
      }
      if (!B.forceKeepAttr) {
        if (!B.keepAttr) {
          en(Ye, d, ve);
          continue;
        }
        if (!de && Ct(Mm, We)) {
          en(Ye, d, ve);
          continue;
        }
        if (be && (We = In(We)), !Hs(le, xt, We)) {
          en(Ye, d, ve);
          continue;
        }
        We = ht(le, xt, ot, We), We !== fr && yt(d, Ye, ot, We) && ai && ac(t.removed);
      }
    }
    wt(Me.afterSanitizeAttributes, d, null);
  }, sn = function(d) {
    let k = null;
    const B = zs(d);
    for (wt(Me.beforeSanitizeShadowDOM, d, null); k = B.nextNode(); )
      if (wt(Me.uponSanitizeShadowNode, k, null), ws(k, d), ut(k), pn(k.content) && sn(k.content), se(k) === Xt.element) {
        const ee = _e(k);
        pn(ee) && (On(ee), sn(ee));
      }
    wt(Me.afterSanitizeShadowDOM, d, null);
  }, On = function(d) {
    const k = [{
      node: d,
      shadow: null
    }];
    for (; k.length > 0; ) {
      const B = k.pop();
      if (B.shadow) {
        sn(B.shadow);
        continue;
      }
      const ee = B.node, ve = se(ee) === Xt.element, Ye = R(ee);
      if (Ye)
        for (let ot = Ye.length - 1; ot >= 0; --ot)
          k.push({
            node: Ye[ot],
            shadow: null
          });
      if (ve) {
        const ot = S ? S(ee) : null;
        if (typeof ot == "string" && $e(ot) === "template") {
          const Et = ee.content;
          pn(Et) && k.push({
            node: Et,
            shadow: null
          });
        }
      }
      if (ve) {
        const ot = _e(ee);
        pn(ot) && k.push({
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
    let d = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, k = null, B = null, ee = null, le = null;
    if (jn = !G, jn && (G = "<!-->"), typeof G != "string" && !Gn(G) && (G = wm(G), typeof G != "string"))
      throw Cs("dirty is not a string, aborting");
    if (!t.isSupported)
      return G;
    $ ? (D = z, P = f) : lr(d), (Me.uponSanitizeElement.length > 0 || Me.uponSanitizeAttribute.length > 0) && (D = Jt(D)), Me.uponSanitizeAttribute.length > 0 && (P = Jt(P)), t.removed = [];
    const ve = ze && typeof G != "string" && Gn(G);
    if (ve) {
      bs(G);
      const Et = me(G);
      if (typeof Et == "string") {
        const xt = $e(Et);
        if (!D[xt] || K[xt])
          throw Vn(G), Cs("root node is forbidden and cannot be sanitized in-place");
      }
      if (Kn(G))
        throw Vn(G), Cs("root node is clobbered and cannot be sanitized in-place");
      try {
        On(G);
      } catch (xt) {
        throw Vn(G), xt;
      }
    } else if (Gn(G))
      k = Us("<!---->"), B = k.ownerDocument.importNode(G, !0), B.nodeType === Xt.element && B.nodeName === "BODY" || B.nodeName === "HTML" ? k = B : k.appendChild(B), On(k);
    else {
      if (!N && !be && !De && // eslint-disable-next-line unicorn/prefer-includes
      G.indexOf("<") === -1)
        return ge && q ? he(G) : G;
      if (k = Us(G), !k)
        return N ? null : q ? Oe : "";
    }
    k && y && dn(k.firstChild);
    const Ye = ve ? G : k;
    try {
      const Et = zs(Ye);
      for (; ee = Et.nextNode(); )
        ws(ee, Ye), ut(ee), pn(ee.content) && sn(ee.content);
    } catch (Et) {
      throw ve && (Vn(G), Os(t.removed, (xt) => {
        xt.element && vs(xt.element);
      })), Et;
    }
    if (ve)
      return Os(t.removed, (Et) => {
        Et.element && vs(Et.element);
      }), be && tn(G), G;
    if (N) {
      if (be && tn(k), C)
        for (le = je.call(k.ownerDocument); k.firstChild; )
          le.appendChild(k.firstChild);
      else
        le = k;
      return (P.shadowroot || P.shadowrootmode) && (le = _n.call(s, le, !0)), le;
    }
    let ot = De ? k.outerHTML : k.innerHTML;
    return De && D["!doctype"] && k.ownerDocument && k.ownerDocument.doctype && k.ownerDocument.doctype.name && Ct(Lm, k.ownerDocument.doctype.name) && (ot = "<!DOCTYPE " + k.ownerDocument.doctype.name + `>
` + ot), be && (ot = In(ot)), ge && q ? he(ot) : ot;
  }, t.setConfig = function() {
    let G = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    lr(G), $ = !0, z = D, f = P;
  }, t.clearConfig = function() {
    qn = null, $ = !1, z = null, f = null, ge = Se, Oe = "";
  }, t.isValidAttribute = function(G, d, k) {
    qn || lr({});
    const B = $e(G), ee = $e(d);
    return Hs(B, ee, k);
  }, t.addHook = function(G, d) {
    typeof d == "function" && jt(Me, G) && kr(Me[G], d);
  }, t.removeHook = function(G, d) {
    if (jt(Me, G)) {
      if (d !== void 0) {
        const k = pm(Me[G], d);
        return k === -1 ? void 0 : mm(Me[G], k, 1)[0];
      }
      return ac(Me[G]);
    }
  }, t.removeHooks = function(G) {
    jt(Me, G) && (Me[G] = []);
  }, t.removeAllHooks = function() {
    Me = vc();
  }, t;
}
var Va = of();
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
function Um(e) {
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
const xi = (e) => Um(He(e || "")), bc = "*", zm = /* @__PURE__ */ new Set(["null", "about:blank", ""]);
let an = null;
const Br = (e) => e && !zm.has(e) ? e : null, Hm = (e) => {
  if (!e) return null;
  try {
    return Br(new URL(e).origin);
  } catch {
    return null;
  }
};
function af() {
  if (an) return an;
  if (window.parent === window)
    return an = Br(window.location.origin) || bc, an;
  try {
    const e = Br(window.parent.location.origin);
    if (e)
      return an = e, an;
  } catch {
  }
  try {
    const e = window.location.ancestorOrigins, t = e && e.length ? Br(e[0]) : null;
    if (t)
      return an = t, an;
  } catch {
  }
  return an = Hm(document.referrer) || bc, an;
}
function wc(e) {
  an = Br(e) || an;
}
function At(e) {
  window.parent.postMessage(e, af());
}
const qi = "Start a new chat", kc = "Start a new chat? This ends the current one.", jm = "Start new chat", Wm = "Cancel", Tc = "Couldn't start a new chat. Please try again.", qm = 15e3, Vm = ["aria-label"], Km = { class: "new-chat-confirm__question" }, Gm = { class: "new-chat-confirm__actions" }, Ym = ["disabled"], Xm = ["disabled"], Zm = /* @__PURE__ */ ps({
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
      "aria-label": E(kc)
    }, [
      g("p", Km, J(s.error || E(kc)), 1),
      g("div", Gm, [
        g("button", {
          type: "button",
          class: "new-chat-confirm__button",
          disabled: s.busy,
          onClick: r[0] || (r[0] = (i) => n("cancel"))
        }, J(E(Wm)), 9, Ym),
        g("button", {
          type: "button",
          class: "new-chat-confirm__button new-chat-confirm__button--primary",
          disabled: s.busy,
          onClick: r[1] || (r[1] = (i) => n("confirm"))
        }, J(E(jm)), 9, Xm)
      ])
    ], 8, Vm));
  }
}), ms = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [s, r] of t)
    n[s] = r;
  return n;
}, lf = /* @__PURE__ */ ms(Zm, [["__scopeId", "data-v-6c78f353"]]), Jm = { class: "askai" }, Qm = { class: "askai__bar" }, eg = ["value", "placeholder", "disabled", "aria-label", "onKeydown"], tg = ["disabled", "title", "aria-label", "aria-expanded"], ng = { class: "askai__intro" }, sg = { class: "askai__title" }, rg = {
  key: 0,
  class: "askai__subtitle"
}, ig = {
  key: 0,
  class: "askai__suggestions"
}, og = ["disabled", "onClick"], ag = ["aria-live"], lg = {
  key: 0,
  class: "askai__question"
}, cg = {
  key: 1,
  class: "askai__system"
}, ug = ["innerHTML"], fg = {
  key: 0,
  class: "askai__sources"
}, hg = ["title"], dg = {
  key: 0,
  class: "askai__thinking",
  role: "status",
  "aria-live": "polite"
}, pg = { class: "askai__thinking-text" }, mg = {
  key: 1,
  class: "askai__foot"
}, gg = { key: 0 }, _g = {
  key: 1,
  class: "askai__brand",
  href: "https://chattermate.chat",
  target: "_blank",
  rel: "noopener noreferrer"
}, yg = /* @__PURE__ */ ps({
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
    showBranding: { type: Boolean },
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
      () => n.messages.map((x, M) => ({ message: x, index: M })).filter(({ message: x }) => a.includes(x.message_type))
    ), u = ae(() => l.value.length > 0), c = (x) => {
      s("update:draft", x.target.value);
    }, b = () => {
      !(n.typingEnabled ?? n.inputEnabled) || !n.draft.trim() || s("send");
    }, T = (x) => {
      n.inputEnabled && s("ask", x);
    }, I = typeof navigator < "u" && /Mac|iPod|iPhone|iPad/.test(navigator.platform || ""), O = (x) => {
      if (x.key === "Escape") {
        x.preventDefault(), s("close");
        return;
      }
      const M = I ? x.metaKey && !x.ctrlKey : x.ctrlKey && !x.metaKey;
      n.hotkey && M && !x.altKey && (x.key === "k" || x.key === "K") && (x.preventDefault(), s("close"));
    }, H = () => {
      is(() => {
        var x;
        return (x = r.value) == null ? void 0 : x.focus();
      });
    };
    let ue = 0;
    const R = () => {
      if (!o.value) return;
      const x = o.value.closest(".askai"), M = i.value;
      if (!x || !M) return;
      const S = x.offsetHeight - M.offsetHeight, W = getComputedStyle(M), se = parseFloat(W.paddingTop) + parseFloat(W.paddingBottom), me = Math.ceil(S + se + o.value.getBoundingClientRect().height);
      Math.abs(me - ue) < 3 || (ue = me, At({ type: "WIDGET_RESIZE", height: me }));
    };
    let fe = null;
    const _e = ae(
      () => l.value.reduce((x, { message: M, index: S }) => x + n.displayText(S, M.message || "").length, 0)
    );
    return pt(
      () => [l.value.length, _e.value, n.loading],
      () => is(() => {
        i.value && (i.value.scrollTop = i.value.scrollHeight);
      })
    ), pt(() => n.newChatArmed, () => is(() => R())), pt(() => n.active, (x) => {
      x && H();
    }), ro(() => {
      n.active && H(), window.addEventListener("keydown", O), o.value && typeof ResizeObserver < "u" && (fe = new ResizeObserver(() => R()), fe.observe(o.value)), R();
    }), io(() => {
      window.removeEventListener("keydown", O), fe == null || fe.disconnect(), fe = null;
    }), (x, M) => (w(), A("div", Jm, [
      g("div", Qm, [
        M[6] || (M[6] = g("svg", {
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
          value: x.draft,
          placeholder: x.placeholder,
          disabled: !(x.typingEnabled ?? x.inputEnabled),
          "aria-label": x.placeholder,
          autocomplete: "off",
          spellcheck: "false",
          onInput: c,
          onKeydown: Si(Is(b, ["prevent"]), ["enter"])
        }, null, 40, eg),
        x.canStartNewChat ? (w(), A("button", {
          key: 0,
          type: "button",
          class: Ne(["askai__new", { "askai__new--armed": x.newChatArmed }]),
          disabled: x.startingNewChat,
          title: E(qi),
          "aria-label": E(qi),
          "aria-expanded": x.newChatArmed,
          onClick: M[0] || (M[0] = (S) => s("newChat"))
        }, M[4] || (M[4] = [
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
        ]), 10, tg)) : te("", !0),
        g("button", {
          type: "button",
          class: "askai__close",
          "aria-label": "Close",
          title: "Close (Esc)",
          onClick: M[1] || (M[1] = (S) => s("close"))
        }, M[5] || (M[5] = [
          g("span", { class: "askai__kbd" }, "Esc", -1)
        ]))
      ]),
      x.newChatArmed && x.canStartNewChat ? (w(), ss(lf, {
        key: 0,
        busy: x.startingNewChat,
        error: x.newChatError,
        onConfirm: M[2] || (M[2] = (S) => s("confirmNewChat")),
        onCancel: M[3] || (M[3] = (S) => s("cancelNewChat"))
      }, null, 8, ["busy", "error"])) : te("", !0),
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
            (w(!0), A(Re, null, dt(l.value, ({ message: S, index: W }) => (w(), A("div", {
              key: W,
              class: "askai__turn",
              "aria-live": x.isStreaming(W) ? "off" : "polite"
            }, [
              S.message_type === "user" ? (w(), A("p", lg, J(S.message), 1)) : S.message_type === "system" ? (w(), A("p", cg, J(S.message), 1)) : (w(), A(Re, { key: 2 }, [
                g("div", {
                  class: Ne(["askai__answer", { "askai__answer--streaming": x.isStreaming(W) }]),
                  innerHTML: E(xi)(x.isStreaming(W) ? x.displayText(W, S.message || "") : S.message || "")
                }, null, 10, ug),
                x.showCitations && !x.isStreaming(W) && S.sources && S.sources.length ? (w(), A("div", fg, [
                  M[9] || (M[9] = g("span", { class: "askai__label" }, "Sources", -1)),
                  (w(!0), A(Re, null, dt(S.sources, (se, me) => (w(), A("span", {
                    key: me,
                    class: "askai__source",
                    title: x.citationTooltip(se)
                  }, J(x.citationLabel(se)), 9, hg))), 128))
                ])) : te("", !0)
              ], 64))
            ], 8, ag))), 128)),
            x.loading ? (w(), A("div", dg, [
              M[10] || (M[10] = g("span", { class: "askai__dot" }, null, -1)),
              M[11] || (M[11] = g("span", { class: "askai__dot" }, null, -1)),
              M[12] || (M[12] = g("span", { class: "askai__dot" }, null, -1)),
              g("span", pg, J(x.showCitations ? "Searching the knowledge base" : "Thinking"), 1)
            ])) : te("", !0)
          ], 64)) : (w(), A(Re, { key: 0 }, [
            g("div", ng, [
              g("h2", sg, J(x.welcomeTitle || `Ask ${x.agentName}`), 1),
              x.welcomeSubtitle ? (w(), A("p", rg, J(x.welcomeSubtitle), 1)) : te("", !0)
            ]),
            x.suggestions.length && !x.draft.trim() ? (w(), A("div", ig, [
              M[8] || (M[8] = g("p", { class: "askai__label" }, "Suggested", -1)),
              (w(!0), A(Re, null, dt(x.suggestions, (S) => (w(), A("button", {
                key: S,
                type: "button",
                class: "askai__suggestion",
                disabled: !x.inputEnabled,
                onClick: (W) => T(S)
              }, [
                g("span", null, J(S), 1),
                M[7] || (M[7] = g("svg", {
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
              ], 8, og))), 128))
            ])) : te("", !0)
          ], 64))
        ], 512)
      ], 512),
      x.disclaimer || x.showBranding ? (w(), A("div", mg, [
        x.disclaimer ? (w(), A("span", gg, J(x.disclaimer), 1)) : te("", !0),
        x.showBranding ? (w(), A("a", _g, "Powered by ChatterMate")) : te("", !0)
      ])) : te("", !0)
    ]));
  }
}), vg = /* @__PURE__ */ ms(yg, [["__scopeId", "data-v-68aaa0d9"]]), bg = "#12150E", wg = "#C9F24E", kg = "#FF9D87", Tg = "#F5F6F0", Ag = {
  ink: bg,
  lime: wg,
  coral: kg,
  paper: Tg
}, jo = Object.freeze(Ag), Sg = ["width", "height"], Eg = ["fill"], xg = ["cx", "r", "fill"], Cg = ["cx", "r", "fill"], Rg = 24, Ig = /* @__PURE__ */ ps({
  __name: "BrandMark",
  props: {
    size: { default: 32 }
  },
  setup(e) {
    const t = e, n = ae(
      () => t.size <= Rg ? { left: 22, right: 42, r: 10 } : { left: 23, right: 41, r: 8 }
    );
    return (s, r) => (w(), A("svg", {
      class: "brand-mark",
      width: s.size,
      height: s.size,
      viewBox: "0 0 64 64",
      xmlns: "http://www.w3.org/2000/svg",
      "aria-hidden": "true",
      focusable: "false"
    }, [
      g("rect", {
        class: "brand-mark__tile",
        x: "0.75",
        y: "0.75",
        width: "62.5",
        height: "62.5",
        rx: "15.25",
        fill: E(jo).ink
      }, null, 8, Eg),
      g("circle", {
        cx: n.value.left,
        cy: "32",
        r: n.value.r,
        fill: E(jo).lime
      }, null, 8, xg),
      g("circle", {
        cx: n.value.right,
        cy: "32",
        r: n.value.r,
        fill: E(jo).coral
      }, null, 8, Cg)
    ], 8, Sg));
  }
}), Sr = /* @__PURE__ */ ms(Ig, [["__scopeId", "data-v-982a6f45"]]), Og = 40;
function Vi(e) {
  if (typeof e == "number" || typeof e == "boolean") return String(e);
  if (typeof e != "string") return null;
  const t = e.trim();
  return t && t.length <= Og && !t.includes(`
`) ? t : null;
}
function Lg(e) {
  var s, r;
  const t = Vi((s = e.preview) == null ? void 0 : s.before), n = Vi((r = e.preview) == null ? void 0 : r.after);
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
function Ng(e, t, n, s) {
  if (!s) return { approve: e, decline: "Not now" };
  const r = Vi(t), i = Vi(n);
  return {
    approve: i ? `Change to ${i}` : "Change it",
    decline: r ? `Keep ${r}` : "Keep current"
  };
}
const Pg = ["aria-label"], Mg = { class: "cm-action-head" }, Dg = { class: "cm-action-row before" }, Fg = { class: "cm-action-text" }, $g = { class: "cm-action-row after" }, Bg = { class: "cm-action-text" }, Ug = {
  key: 1,
  class: "cm-action-args"
}, zg = { class: "cm-action-buttons" }, Hg = /* @__PURE__ */ ps({
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
        return Ng(n.pending.request.label, (u = n.pending.preview) == null ? void 0 : u.before, (c = n.pending.preview) == null ? void 0 : c.after, r.value);
      }
    );
    return (u, c) => {
      var b, T;
      return w(), A("div", {
        class: "cm-action-confirm",
        role: "group",
        "aria-label": u.pending.request.label
      }, [
        g("div", Mg, J(u.pending.request.label) + "?", 1),
        r.value ? (w(), A(Re, { key: 0 }, [
          g("div", Dg, [
            c[2] || (c[2] = g("span", { class: "cm-action-tag" }, "Current", -1)),
            g("span", Fg, J(i((b = u.pending.preview) == null ? void 0 : b.before)), 1)
          ]),
          g("div", $g, [
            c[3] || (c[3] = g("span", { class: "cm-action-tag" }, "New", -1)),
            g("span", Bg, J(i((T = u.pending.preview) == null ? void 0 : T.after)), 1)
          ])
        ], 64)) : a.value.length ? (w(), A("dl", Ug, [
          (w(!0), A(Re, null, dt(a.value, (I) => (w(), A(Re, {
            key: I.key
          }, [
            g("dt", null, J(I.key), 1),
            g("dd", null, J(I.value), 1)
          ], 64))), 128))
        ])) : te("", !0),
        g("div", zg, [
          g("button", {
            type: "button",
            class: "cm-action-apply",
            onClick: c[0] || (c[0] = (I) => s("approve"))
          }, J(l.value.approve), 1),
          g("button", {
            type: "button",
            class: "cm-action-cancel",
            onClick: c[1] || (c[1] = (I) => s("decline"))
          }, J(l.value.decline), 1)
        ])
      ], 8, Pg);
    };
  }
}), jg = /* @__PURE__ */ ms(Hg, [["__scopeId", "data-v-bdc9ad66"]]), Wg = {
  key: 0,
  class: "cm-receipt-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, qg = {
  key: 1,
  class: "cm-receipt-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, Vg = {
  key: 2,
  class: "cm-receipt-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, Kg = { class: "cm-visually-hidden" }, Gg = { class: "cm-receipt-text" }, Yg = /* @__PURE__ */ ps({
  __name: "ActionReceiptLine",
  props: {
    receipt: {}
  },
  setup(e) {
    return (t, n) => (w(), A("div", {
      class: Ne(["cm-receipt", t.receipt.tone]),
      role: "status"
    }, [
      t.receipt.tone === "done" ? (w(), A("svg", Wg, n[0] || (n[0] = [
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
      ]))) : t.receipt.tone === "failed" ? (w(), A("svg", qg, n[1] || (n[1] = [
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
      ]))) : (w(), A("svg", Vg, n[2] || (n[2] = [
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
      g("span", Kg, J(t.receipt.tone === "done" ? "Done:" : t.receipt.tone === "failed" ? "Failed:" : "Skipped:"), 1),
      g("span", Gg, J(t.receipt.text), 1)
    ], 2));
  }
}), Xg = /* @__PURE__ */ ms(Yg, [["__scopeId", "data-v-be379090"]]), Zg = { class: "cm-plan-pin" }, Jg = ["aria-label"], Qg = ["aria-expanded"], e_ = { class: "cm-plan-label" }, t_ = { class: "cm-plan-name" }, n_ = {
  key: 0,
  class: "cm-plan-now"
}, s_ = { class: "cm-plan-count" }, r_ = ["aria-valuenow", "aria-valuemax", "aria-label"], i_ = {
  key: 0,
  class: "cm-plan-steps"
}, o_ = ["aria-current"], a_ = {
  key: 0,
  class: "cm-plan-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, l_ = {
  key: 1,
  class: "cm-plan-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, c_ = {
  key: 2,
  class: "cm-plan-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, u_ = { class: "cm-plan-title" }, f_ = {
  key: 3,
  class: "cm-visually-hidden"
}, h_ = { class: "cm-plan-actions" }, d_ = /* @__PURE__ */ ps({
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
    return (l, u) => (w(), A("div", Zg, [
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
          g("span", e_, [
            g("span", t_, J(l.progress.name), 1),
            !l.progress.finished && l.progress.title ? (w(), A("span", n_, J(l.progress.title), 1)) : te("", !0)
          ]),
          g("span", s_, J(l.progress.finished ? "Done" : `${i.value} of ${l.progress.count}`), 1),
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
        ], 8, Qg),
        g("div", {
          class: "cm-plan-bar",
          role: "progressbar",
          "aria-valuenow": i.value,
          "aria-valuemin": "0",
          "aria-valuemax": l.progress.count,
          "aria-label": `${i.value} of ${l.progress.count} done`
        }, [
          g("span", {
            style: xe({ width: `${o.value}%` })
          }, null, 4)
        ], 8, r_),
        r.value ? (w(), A(Re, { key: 0 }, [
          a.value.length ? (w(), A("ol", i_, [
            (w(!0), A(Re, null, dt(a.value, (c, b) => (w(), A("li", {
              key: b,
              class: Ne(c.state),
              "aria-current": c.state === "now" ? "step" : void 0
            }, [
              c.state === "done" ? (w(), A("svg", a_, u[4] || (u[4] = [
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
              ]))) : c.state === "now" ? (w(), A("svg", l_, u[5] || (u[5] = [
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
              ]))) : (w(), A("svg", c_, u[6] || (u[6] = [
                g("circle", {
                  cx: "12",
                  cy: "12",
                  r: "9",
                  class: "ring todo"
                }, null, -1)
              ]))),
              g("span", u_, J(c.title), 1),
              c.state === "done" ? (w(), A("span", f_, "(done)")) : te("", !0)
            ], 10, o_))), 128))
          ])) : te("", !0),
          g("div", h_, [
            l.progress.skippable ? (w(), A("button", {
              key: 0,
              type: "button",
              onClick: u[1] || (u[1] = (c) => s("skip"))
            }, "Skip this step")) : te("", !0),
            g("button", {
              type: "button",
              onClick: u[2] || (u[2] = (c) => s("hide"))
            }, "Hide guide")
          ])
        ], 64)) : te("", !0)
      ], 10, Jg)
    ]));
  }
}), p_ = /* @__PURE__ */ ms(d_, [["__scopeId", "data-v-016d08e3"]]), m_ = {
  class: "cm-replies",
  role: "group",
  "aria-label": "Suggested replies"
}, g_ = ["disabled", "onClick"], __ = /* @__PURE__ */ ps({
  __name: "SuggestedReplies",
  props: {
    chips: {},
    disabled: { type: Boolean }
  },
  emits: ["pick"],
  setup(e, { emit: t }) {
    const n = t;
    return (s, r) => (w(), A("div", m_, [
      (w(!0), A(Re, null, dt(s.chips, (i) => (w(), A("button", {
        key: i.label,
        type: "button",
        class: "cm-reply",
        disabled: s.disabled,
        onClick: (o) => n("pick", i)
      }, J(i.label), 9, g_))), 128))
    ]));
  }
}), y_ = /* @__PURE__ */ ms(__, [["__scopeId", "data-v-7b650713"]]);
function v_(e) {
  const t = oe([]);
  function n(r) {
    t.value.push({ after: e.value.length, receipt: Lg(r) });
  }
  function s(r) {
    return t.value.filter((i) => i.after === r).map((i) => i.receipt);
  }
  return pt(() => e.value.length, (r) => {
    r === 0 ? t.value = [] : t.value.some((i) => i.after > r) && (t.value = t.value.filter((i) => i.after <= r));
  }), { receipts: t, addReceipt: n, receiptsAfter: s };
}
const b_ = "Please don't paste passwords or keys here.", w_ = [
  /\bsk-(?:proj-|ant-)?[A-Za-z0-9_-]{20,}/,
  /\bcmat_[A-Za-z0-9_-]{16,}/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{30,}/,
  /\bxox[abposr]-[A-Za-z0-9-]{10,}/
], k_ = /\b(password|passwd|pwd|passcode|api[ _-]?key|secret)\s*(?:is|:|=)\s*\S+/i, T_ = /\b(?:\d[ -]?){12,18}\d\b/g;
function A_(e) {
  let t = 0;
  for (let n = 0; n < e.length; n++) {
    let s = Number(e[e.length - 1 - n]);
    n % 2 === 1 && (s *= 2, s > 9 && (s -= 9)), t += s;
  }
  return t % 10 === 0;
}
function S_(e) {
  return e ? w_.some((t) => t.test(e)) || k_.test(e) ? !0 : (e.match(T_) || []).some((t) => {
    const n = t.replace(/\D/g, "");
    return n.length >= 13 && n.length <= 19 && A_(n);
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
], E_ = (e) => (e || "").split("").reduce((t, n) => t + n.charCodeAt(0), 0) % Rr.length, x_ = (e) => {
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
}, C_ = (e, t) => {
  const n = typeof t == "number" && Number.isFinite(t) ? t : E_(e);
  return x_(n);
}, Ac = (e) => {
  var t;
  return !!((t = e == null ? void 0 : e.attributes) != null && t.end_chat);
}, Sc = "AI can make mistakes. Check important info.";
function R_(e, t = !1) {
  return e !== !1 && !t;
}
const Wo = {
  ai: "Online · replies instantly",
  human: "Online · usually replies in a few minutes",
  away: "Away · we'll reply when we're back"
};
function I_(e, t = !1) {
  return (t ? "human" : (e == null ? void 0 : e.mode) ?? "ai") === "ai" ? { text: Wo.ai, online: !0 } : (e == null ? void 0 : e.available) !== !1 ? { text: Wo.human, online: !0 } : { text: Wo.away, online: !1 };
}
const cf = (e) => !!e && (/^https?:\/\//i.test(e) || e.startsWith("data:")), O_ = (e, t) => e ? cf(e) || e.startsWith("blob:") ? e : `${t.replace(/\/api\/v1\/?$/, "")}${e.startsWith("/") ? "" : "/"}${e}` : "";
function Ec() {
  return typeof window < "u" && window.APP_CONFIG ? window.APP_CONFIG : {};
}
const Ds = {
  get API_URL() {
    return Ec().API_URL || void 0 || "https://api.chattermate.chat/api/v1";
  },
  get WS_URL() {
    return Ec().WS_URL || void 0 || "wss://api.chattermate.chat";
  }
};
function Ki(e) {
  return O_(e, Ds.API_URL);
}
const uf = "ctid", L_ = "identity_expired", N_ = "invalid_token", xc = 0.8, P_ = 720 * 60 * 1e3, qo = 30 * 1e3, Vo = 1e3, as = (e) => {
  if (typeof e != "string") return e ? String(e) : null;
  const t = e.trim();
  return !t || t === "undefined" || t === "null" ? null : t;
}, Ci = (e) => {
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
}, M_ = async (e) => {
  var t, n;
  try {
    return (n = (t = await e.json()) == null ? void 0 : t.detail) == null ? void 0 : n.code;
  } catch {
    return;
  }
}, Gi = (e = uf) => ({
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
}), D_ = () => ({
  read: () => null,
  write: () => {
  },
  clear: () => {
  }
});
function F_(e = {}) {
  const t = e.store ?? Gi(), n = oe(null);
  let s = null, r = null;
  const i = () => {
    s && (clearTimeout(s), s = null);
  }, o = () => {
    const H = Ci(n.value);
    return H != null && H.exp ? Number(H.exp) - Math.floor(Date.now() / Vo) : null;
  }, a = () => {
    const H = Ci(n.value);
    if (!(H != null && H.exp)) return !1;
    const ue = H.iat ? Number(H.exp) - Number(H.iat) : 0, R = o() ?? 0;
    return ue <= 0 ? R <= 0 : R <= ue * (1 - xc);
  }, l = (H, { persist: ue = !0 } = {}) => {
    var _e, x;
    const R = as(H), fe = !!n.value;
    if (i(), n.value = R, !R) {
      t.clear(), fe && ((_e = e.onTokenCleared) == null || _e.call(e));
      return;
    }
    ue && (t.write(R), (x = e.onTokenChanged) == null || x.call(e, R)), b();
  }, u = async (H) => {
    if (!n.value || !H) return !1;
    if (r) return r;
    const ue = n.value;
    return r = (async () => {
      var R, fe;
      try {
        const _e = await fetch(`${Ds.API_URL}/refresh-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ue}`
          },
          body: JSON.stringify({ widget_id: H })
        });
        if (_e.status === 401)
          return await M_(_e) !== N_ && ((R = e.onIdentityExpired) == null || R.call(e)), !1;
        if (!_e.ok)
          return b(qo), !1;
        const x = await _e.json(), M = as((fe = x == null ? void 0 : x.data) == null ? void 0 : fe.token);
        return M ? (l(M), !0) : !1;
      } catch {
        return b(qo), !1;
      } finally {
        r = null;
      }
    })(), r;
  }, c = async (H) => n.value ? a() ? u(H) : !0 : !1, b = (H) => {
    i();
    const ue = Ci(n.value);
    if (!(ue != null && ue.exp) || !(ue != null && ue.iat)) return;
    const R = (Number(ue.exp) - Number(ue.iat)) * Vo, fe = (o() ?? 0) * Vo, _e = H ?? Math.min(
      P_,
      Math.max(0, fe - R * (1 - xc))
    );
    s = setTimeout(() => {
      s = null, c(T).then((x) => {
        b(x ? void 0 : qo);
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
const ir = window.__CM_FRAME__, ff = "null";
let Ns = !1, hf = !1, df = null;
const Yi = () => !!ir, Ls = () => !ir || Ns && !hf, pf = () => df, mf = (e) => {
  typeof e == "string" && e && (df = e);
}, gf = (e) => ir ? Ns ? D_() : Gi(`${uf}:${e}`) : Gi(), $_ = () => new Promise((e) => {
  const t = (n) => {
    var r;
    if (n.source !== window.parent || ((r = n.data) == null ? void 0 : r.type) !== "HOST_INIT") return;
    window.removeEventListener("message", t);
    const s = n.origin === ff;
    e({
      origin: n.origin,
      // An opaque host can't be addressed, so nothing it hands over can be
      // answered safely: such a frame runs as an anonymous visitor.
      token: s ? null : as(n.data.token),
      pageUrl: typeof n.data.pageUrl == "string" ? n.data.pageUrl : null
    });
  };
  window.addEventListener("message", t), window.parent.postMessage({ type: "FRAME_READY" }, "*");
}), B_ = async (e) => {
  var t;
  try {
    const n = await e.json();
    return ((t = n == null ? void 0 : n.detail) == null ? void 0 : t.code) || "unavailable";
  } catch {
    return "unavailable";
  }
}, Cc = () => {
  const e = document.getElementById("app");
  e && (e.textContent = "Chat is unavailable right now.");
};
async function U_() {
  if (!ir) return !0;
  const e = new URL(window.location.href).searchParams;
  Ns = e.get("host") === "1" && window.parent !== window;
  let t, n = null;
  if (Ns) {
    const o = await $_();
    o.origin !== ff ? (wc(o.origin), n = o.origin) : (hf = !0, wc("*")), mf(o.pageUrl), t = o.token;
  } else
    t = gf(ir.widgetId).read();
  let s;
  try {
    s = await fetch(`${Ds.API_URL}/widgets/${encodeURIComponent(ir.widgetId)}/bootstrap`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...t ? { Authorization: `Bearer ${t}` } : {}
      },
      body: JSON.stringify({ host_origin: n, source: e.get("source") })
    });
  } catch {
    return Ns ? At({ type: "WIDGET_ERROR", code: "unavailable" }) : Cc(), !1;
  }
  if (!s.ok) {
    const o = await B_(s);
    return Ns ? At({ type: "WIDGET_ERROR", code: o }) : Cc(), !1;
  }
  const r = await s.json();
  window.__INITIAL_DATA__ = r;
  const i = as(r.initialToken);
  return Ls() && i && i !== t && At({ type: "TOKEN_UPDATE", token: i }), !0;
}
const z_ = () => {
  Ns && At({ type: "WIDGET_READY" });
};
function H_(e) {
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
  })), a = ae(() => Ki(e.value.photo_url)), l = ae(() => {
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
const j_ = /* @__PURE__ */ new Set(["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]), W_ = /* @__PURE__ */ new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);
[...j_, ...W_];
function q_(e, t) {
  const n = oe([]), s = oe(!1), r = oe(null), i = (M) => {
    if (M === 0) return "0 Bytes";
    const S = 1024, W = ["Bytes", "KB", "MB", "GB"], se = Math.floor(Math.log(M) / Math.log(S));
    return parseFloat((M / Math.pow(S, se)).toFixed(2)) + " " + W[se];
  }, o = (M) => M.startsWith("image/"), a = (M) => M ? Ki(M) : "", l = (M) => {
    const S = M.file_url || M.url;
    return S ? Ki(S) : "";
  }, u = async (M) => {
    const S = M.target;
    S.files && S.files.length > 0 && (await H(Array.from(S.files)), S.value = "");
  }, c = async (M) => {
    var W;
    M.preventDefault();
    const S = (W = M.dataTransfer) == null ? void 0 : W.files;
    S && S.length > 0 && await H(Array.from(S));
  }, b = (M) => {
    M.preventDefault();
  }, T = (M) => {
    M.preventDefault();
  }, I = async (M) => {
    var se;
    const S = (se = M.clipboardData) == null ? void 0 : se.items;
    if (!S) return;
    const W = [];
    for (const me of Array.from(S))
      if (me.kind === "file") {
        const ge = me.getAsFile();
        ge && W.push(ge);
      }
    W.length > 0 && await H(W);
  }, O = async (M, S = 500) => new Promise((W, se) => {
    const me = new FileReader();
    me.onload = (ge) => {
      var Se;
      const Oe = new Image();
      Oe.onload = () => {
        const Ge = document.createElement("canvas");
        let Ue = Oe.width, st = Oe.height;
        const he = 1920;
        (Ue > he || st > he) && (Ue > st ? (st = st / Ue * he, Ue = he) : (Ue = Ue / st * he, st = he)), Ge.width = Ue, Ge.height = st;
        const Te = Ge.getContext("2d");
        if (!Te) {
          se(new Error("Failed to get canvas context"));
          return;
        }
        Te.drawImage(Oe, 0, 0, Ue, st);
        let ye = 0.9;
        const Ze = () => {
          Ge.toBlob((Je) => {
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
          }, M.type === "image/png" ? "image/png" : "image/jpeg", ye);
        };
        Ze();
      }, Oe.onerror = () => se(new Error("Failed to load image")), Oe.src = (Se = ge.target) == null ? void 0 : Se.result;
    }, me.onerror = () => se(new Error("Failed to read file")), me.readAsDataURL(M);
  }), H = async (M) => {
    if (n.value.length >= 3) {
      alert("Maximum 3 files allowed per message");
      return;
    }
    const ge = 3 - n.value.length, Oe = M.slice(0, ge);
    M.length > ge && alert(`Only ${ge} more file(s) can be uploaded. Maximum 3 files per message.`);
    for (const Se of Oe)
      try {
        if (n.value.some((he) => he.filename === Se.name)) {
          console.warn(`File ${Se.name} is already selected`), alert(`File "${Se.name}" is already selected`);
          continue;
        }
        const Ue = Se.type.startsWith("image/"), st = Ue ? 5242880 : 10485760;
        if (Se.size > st) {
          const he = st / 1048576;
          console.error(`File ${Se.name} is too large. Maximum size is ${he}MB`), alert(`File "${Se.name}" is too large. Maximum size for ${Ue ? "images" : "documents"} is ${he}MB`);
          continue;
        }
        if (Ue)
          try {
            const { blob: he, base64: Te } = await O(Se, 500), ye = he.size;
            console.log(`Compressed ${Se.name}: ${(Se.size / 1024).toFixed(2)}KB → ${(ye / 1024).toFixed(2)}KB`), n.value.push({
              content: Te,
              filename: Se.name,
              type: Se.type,
              size: ye,
              url: URL.createObjectURL(he),
              file_url: URL.createObjectURL(he)
            });
          } catch (he) {
            console.error("Image compression failed, uploading original:", he);
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
          const he = new FileReader();
          he.onload = (Te) => {
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
          }, he.readAsDataURL(Se);
        }
      } catch (Ge) {
        console.error("File upload error:", Ge);
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
    removeAttachment: async (M) => {
      const S = n.value[M];
      if (S) {
        try {
          let W = S.url;
          if (W.startsWith("/uploads/") ? W = W.substring(9) : W.startsWith("/") && (W = W.substring(1)), cf(W))
            try {
              W = new URL(W).pathname.replace(/^\/+/, "");
            } catch {
            }
          const se = {};
          e.value && (se.Authorization = `Bearer ${e.value}`);
          const me = await fetch(`${Ds.API_URL}/files/upload/${W}`, {
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
        S.url && S.url.startsWith("blob:") && URL.revokeObjectURL(S.url), S.file_url && S.file_url.startsWith("blob:") && URL.revokeObjectURL(S.file_url), n.value.splice(M, 1);
      }
    },
    openPreview: (M) => {
      r.value = M, s.value = !0;
    },
    closePreview: () => {
      s.value = !1, setTimeout(() => {
        r.value = null;
      }, 300);
    },
    openFilePicker: () => {
      var M;
      (M = t.value) == null || M.click();
    },
    isImage: (M) => M.startsWith("image/")
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
const Ri = /* @__PURE__ */ Object.create(null);
Object.keys(Cn).forEach((e) => {
  Ri[Cn[e]] = e;
});
const ga = { type: "error", data: "parser error" }, _f = typeof Blob == "function" || typeof Blob < "u" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]", yf = typeof ArrayBuffer == "function", vf = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e && e.buffer instanceof ArrayBuffer, Ka = ({ type: e, data: t }, n, s) => _f && t instanceof Blob ? n ? s(t) : Rc(t, s) : yf && (t instanceof ArrayBuffer || vf(t)) ? n ? s(t) : Rc(new Blob([t]), s) : s(Cn[e] + (t || "")), Rc = (e, t) => {
  const n = new FileReader();
  return n.onload = function() {
    const s = n.result.split(",")[1];
    t("b" + (s || ""));
  }, n.readAsDataURL(e);
};
function Ic(e) {
  return e instanceof Uint8Array ? e : e instanceof ArrayBuffer ? new Uint8Array(e) : new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
}
let Ko;
function V_(e, t) {
  if (_f && e.data instanceof Blob)
    return e.data.arrayBuffer().then(Ic).then(t);
  if (yf && (e.data instanceof ArrayBuffer || vf(e.data)))
    return t(Ic(e.data));
  Ka(e, !1, (n) => {
    Ko || (Ko = new TextEncoder()), t(Ko.encode(n));
  });
}
const Oc = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", Ir = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (let e = 0; e < Oc.length; e++)
  Ir[Oc.charCodeAt(e)] = e;
const K_ = (e) => {
  let t = e.length * 0.75, n = e.length, s, r = 0, i, o, a, l;
  e[e.length - 1] === "=" && (t--, e[e.length - 2] === "=" && t--);
  const u = new ArrayBuffer(t), c = new Uint8Array(u);
  for (s = 0; s < n; s += 4)
    i = Ir[e.charCodeAt(s)], o = Ir[e.charCodeAt(s + 1)], a = Ir[e.charCodeAt(s + 2)], l = Ir[e.charCodeAt(s + 3)], c[r++] = i << 2 | o >> 4, c[r++] = (o & 15) << 4 | a >> 2, c[r++] = (a & 3) << 6 | l & 63;
  return u;
}, G_ = typeof ArrayBuffer == "function", Ga = (e, t) => {
  if (typeof e != "string")
    return {
      type: "message",
      data: bf(e, t)
    };
  const n = e.charAt(0);
  return n === "b" ? {
    type: "message",
    data: Y_(e.substring(1), t)
  } : Ri[n] ? e.length > 1 ? {
    type: Ri[n],
    data: e.substring(1)
  } : {
    type: Ri[n]
  } : ga;
}, Y_ = (e, t) => {
  if (G_) {
    const n = K_(e);
    return bf(n, t);
  } else
    return { base64: !0, data: e };
}, bf = (e, t) => {
  switch (t) {
    case "blob":
      return e instanceof Blob ? e : new Blob([e]);
    case "arraybuffer":
    default:
      return e instanceof ArrayBuffer ? e : e.buffer;
  }
}, wf = "", X_ = (e, t) => {
  const n = e.length, s = new Array(n);
  let r = 0;
  e.forEach((i, o) => {
    Ka(i, !1, (a) => {
      s[o] = a, ++r === n && t(s.join(wf));
    });
  });
}, Z_ = (e, t) => {
  const n = e.split(wf), s = [];
  for (let r = 0; r < n.length; r++) {
    const i = Ga(n[r], t);
    if (s.push(i), i.type === "error")
      break;
  }
  return s;
};
function J_() {
  return new TransformStream({
    transform(e, t) {
      V_(e, (n) => {
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
let Go;
function _i(e) {
  return e.reduce((t, n) => t + n.length, 0);
}
function yi(e, t) {
  if (e[0].length === t)
    return e.shift();
  const n = new Uint8Array(t);
  let s = 0;
  for (let r = 0; r < t; r++)
    n[r] = e[0][s++], s === e[0].length && (e.shift(), s = 0);
  return e.length && s < e[0].length && (e[0] = e[0].slice(s)), n;
}
function Q_(e, t) {
  Go || (Go = new TextDecoder());
  const n = [];
  let s = 0, r = -1, i = !1;
  return new TransformStream({
    transform(o, a) {
      for (n.push(o); ; ) {
        if (s === 0) {
          if (_i(n) < 1)
            break;
          const l = yi(n, 1);
          i = (l[0] & 128) === 128, r = l[0] & 127, r < 126 ? s = 3 : r === 126 ? s = 1 : s = 2;
        } else if (s === 1) {
          if (_i(n) < 2)
            break;
          const l = yi(n, 2);
          r = new DataView(l.buffer, l.byteOffset, l.length).getUint16(0), s = 3;
        } else if (s === 2) {
          if (_i(n) < 8)
            break;
          const l = yi(n, 8), u = new DataView(l.buffer, l.byteOffset, l.length), c = u.getUint32(0);
          if (c > Math.pow(2, 21) - 1) {
            a.enqueue(ga);
            break;
          }
          r = c * Math.pow(2, 32) + u.getUint32(4), s = 3;
        } else {
          if (_i(n) < r)
            break;
          const l = yi(n, r);
          a.enqueue(Ga(i ? l : Go.decode(l), t)), s = 0;
        }
        if (r === 0 || r > e) {
          a.enqueue(ga);
          break;
        }
      }
    }
  });
}
const kf = 4;
function mt(e) {
  if (e) return ey(e);
}
function ey(e) {
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
const fo = typeof Promise == "function" && typeof Promise.resolve == "function" ? (t) => Promise.resolve().then(t) : (t, n) => n(t, 0), ln = typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")(), ty = "arraybuffer";
function Tf(e, ...t) {
  return t.reduce((n, s) => (e.hasOwnProperty(s) && (n[s] = e[s]), n), {});
}
const ny = ln.setTimeout, sy = ln.clearTimeout;
function ho(e, t) {
  t.useNativeTimers ? (e.setTimeoutFn = ny.bind(ln), e.clearTimeoutFn = sy.bind(ln)) : (e.setTimeoutFn = ln.setTimeout.bind(ln), e.clearTimeoutFn = ln.clearTimeout.bind(ln));
}
const ry = 1.33;
function iy(e) {
  return typeof e == "string" ? oy(e) : Math.ceil((e.byteLength || e.size) * ry);
}
function oy(e) {
  let t = 0, n = 0;
  for (let s = 0, r = e.length; s < r; s++)
    t = e.charCodeAt(s), t < 128 ? n += 1 : t < 2048 ? n += 2 : t < 55296 || t >= 57344 ? n += 3 : (s++, n += 4);
  return n;
}
function Af() {
  return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
}
function ay(e) {
  let t = "";
  for (let n in e)
    e.hasOwnProperty(n) && (t.length && (t += "&"), t += encodeURIComponent(n) + "=" + encodeURIComponent(e[n]));
  return t;
}
function ly(e) {
  let t = {}, n = e.split("&");
  for (let s = 0, r = n.length; s < r; s++) {
    let i = n[s].split("=");
    t[decodeURIComponent(i[0])] = decodeURIComponent(i[1]);
  }
  return t;
}
class cy extends Error {
  constructor(t, n, s) {
    super(t), this.description = n, this.context = s, this.type = "TransportError";
  }
}
class Ya extends mt {
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
    return super.emitReserved("error", new cy(t, n, s)), this;
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
    const n = Ga(t, this.socket.binaryType);
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
    const n = ay(t);
    return n.length ? "?" + n : "";
  }
}
class uy extends Ya {
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
    Z_(t, this.socket.binaryType).forEach(n), this.readyState !== "closed" && (this._polling = !1, this.emitReserved("pollComplete"), this.readyState === "open" && this._poll());
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
    this.writable = !1, X_(t, (n) => {
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
    return this.opts.timestampRequests !== !1 && (n[this.opts.timestampParam] = Af()), !this.supportsBinary && !n.sid && (n.b64 = 1), this.createUri(t, n);
  }
}
let Sf = !1;
try {
  Sf = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest();
} catch {
}
const fy = Sf;
function hy() {
}
class dy extends uy {
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
class En extends mt {
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
    const n = Tf(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
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
      if (this._xhr.onreadystatechange = hy, t)
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
    attachEvent("onunload", Lc);
  else if (typeof addEventListener == "function") {
    const e = "onpagehide" in ln ? "pagehide" : "unload";
    addEventListener(e, Lc, !1);
  }
}
function Lc() {
  for (let e in En.requests)
    En.requests.hasOwnProperty(e) && En.requests[e].abort();
}
const py = function() {
  const e = Ef({
    xdomain: !1
  });
  return e && e.responseType !== null;
}();
class my extends dy {
  constructor(t) {
    super(t);
    const n = t && t.forceBase64;
    this.supportsBinary = py && !n;
  }
  request(t = {}) {
    return Object.assign(t, { xd: this.xd }, this.opts), new En(Ef, this.uri(), t);
  }
}
function Ef(e) {
  const t = e.xdomain;
  try {
    if (typeof XMLHttpRequest < "u" && (!t || fy))
      return new XMLHttpRequest();
  } catch {
  }
  if (!t)
    try {
      return new ln[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
    } catch {
    }
}
const xf = typeof navigator < "u" && typeof navigator.product == "string" && navigator.product.toLowerCase() === "reactnative";
class gy extends Ya {
  get name() {
    return "websocket";
  }
  doOpen() {
    const t = this.uri(), n = this.opts.protocols, s = xf ? {} : Tf(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
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
      Ka(s, this.supportsBinary, (i) => {
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
    return this.opts.timestampRequests && (n[this.opts.timestampParam] = Af()), this.supportsBinary || (n.b64 = 1), this.createUri(t, n);
  }
}
const Yo = ln.WebSocket || ln.MozWebSocket;
class _y extends gy {
  createSocket(t, n, s) {
    return xf ? new Yo(t, n, s) : n ? new Yo(t, n) : new Yo(t);
  }
  doWrite(t, n) {
    this.ws.send(n);
  }
}
class yy extends Ya {
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
        const n = Q_(Number.MAX_SAFE_INTEGER, this.socket.binaryType), s = t.readable.pipeThrough(n).getReader(), r = J_();
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
const vy = {
  websocket: _y,
  webtransport: yy,
  polling: my
}, by = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/, wy = [
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
  let r = by.exec(e || ""), i = {}, o = 14;
  for (; o--; )
    i[wy[o]] = r[o] || "";
  return n != -1 && s != -1 && (i.source = t, i.host = i.host.substring(1, i.host.length - 1).replace(/;/g, ":"), i.authority = i.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), i.ipv6uri = !0), i.pathNames = ky(i, i.path), i.queryKey = Ty(i, i.query), i;
}
function ky(e, t) {
  const n = /\/{2,9}/g, s = t.replace(n, "/").split("/");
  return (t.slice(0, 1) == "/" || t.length === 0) && s.splice(0, 1), t.slice(-1) == "/" && s.splice(s.length - 1, 1), s;
}
function Ty(e, t) {
  const n = {};
  return t.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function(s, r, i) {
    r && (n[r] = i);
  }), n;
}
const ya = typeof addEventListener == "function" && typeof removeEventListener == "function", Ii = [];
ya && addEventListener("offline", () => {
  Ii.forEach((e) => e());
}, !1);
class ls extends mt {
  /**
   * Socket constructor.
   *
   * @param {String|Object} uri - uri or options
   * @param {Object} opts - options
   */
  constructor(t, n) {
    if (super(), this.binaryType = ty, this.writeBuffer = [], this._prevBufferLen = 0, this._pingInterval = -1, this._pingTimeout = -1, this._maxPayload = -1, this._pingTimeoutTime = 1 / 0, t && typeof t == "object" && (n = t, t = null), t) {
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
    }, n), this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : ""), typeof this.opts.query == "string" && (this.opts.query = ly(this.opts.query)), ya && (this.opts.closeOnBeforeunload && (this._beforeunloadEventListener = () => {
      this.transport && (this.transport.removeAllListeners(), this.transport.close());
    }, addEventListener("beforeunload", this._beforeunloadEventListener, !1)), this.hostname !== "localhost" && (this._offlineEventListener = () => {
      this._onClose("transport close", {
        description: "network connection lost"
      });
    }, Ii.push(this._offlineEventListener))), this.opts.withCredentials && (this._cookieJar = void 0), this._open();
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
    n.EIO = kf, n.transport = t, this.id && (n.sid = this.id);
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
      if (r && (n += iy(r)), s > 0 && n > this._maxPayload)
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
        const s = Ii.indexOf(this._offlineEventListener);
        s !== -1 && Ii.splice(s, 1);
      }
      this.readyState = "closed", this.id = null, this.emitReserved("close", t, n), this.writeBuffer = [], this._prevBufferLen = 0;
    }
  }
}
ls.protocol = kf;
class Ay extends ls {
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
let Sy = class extends Ay {
  constructor(t, n = {}) {
    const s = typeof t == "object", r = s ? { ...t } : { ...n };
    (!r.transports || r.transports && typeof r.transports[0] == "string") && (r.transports = (r.transports || ["polling", "websocket", "webtransport"]).map((i) => vy[i]).filter((i) => !!i)), super(s ? r : t, r);
  }
};
function Ey(e, t = "", n) {
  let s = e;
  n = n || typeof location < "u" && location, e == null && (e = n.protocol + "//" + n.host), typeof e == "string" && (e.charAt(0) === "/" && (e.charAt(1) === "/" ? e = n.protocol + e : e = n.host + e), /^(https?|wss?):\/\//.test(e) || (typeof n < "u" ? e = n.protocol + "//" + e : e = "https://" + e), s = _a(e)), s.port || (/^(http|ws)$/.test(s.protocol) ? s.port = "80" : /^(http|ws)s$/.test(s.protocol) && (s.port = "443")), s.path = s.path || "/";
  const i = s.host.indexOf(":") !== -1 ? "[" + s.host + "]" : s.host;
  return s.id = s.protocol + "://" + i + ":" + s.port + t, s.href = s.protocol + "://" + i + (n && n.port === s.port ? "" : ":" + s.port), s;
}
const xy = typeof ArrayBuffer == "function", Cy = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e.buffer instanceof ArrayBuffer, Cf = Object.prototype.toString, Ry = typeof Blob == "function" || typeof Blob < "u" && Cf.call(Blob) === "[object BlobConstructor]", Iy = typeof File == "function" || typeof File < "u" && Cf.call(File) === "[object FileConstructor]";
function Xa(e) {
  return xy && (e instanceof ArrayBuffer || Cy(e)) || Ry && e instanceof Blob || Iy && e instanceof File;
}
function Oi(e, t) {
  if (!e || typeof e != "object")
    return !1;
  if (Array.isArray(e)) {
    for (let n = 0, s = e.length; n < s; n++)
      if (Oi(e[n]))
        return !0;
    return !1;
  }
  if (Xa(e))
    return !0;
  if (e.toJSON && typeof e.toJSON == "function" && arguments.length === 1)
    return Oi(e.toJSON(), !0);
  for (const n in e)
    if (Object.prototype.hasOwnProperty.call(e, n) && Oi(e[n]))
      return !0;
  return !1;
}
function Oy(e) {
  const t = [], n = e.data, s = e;
  return s.data = Li(n, t), s.attachments = t.length, { packet: s, buffers: t };
}
function Li(e, t, n) {
  if (!e)
    return e;
  if (Xa(e)) {
    const s = { _placeholder: !0, num: t.length };
    return t.push(e), s;
  } else if (Array.isArray(e)) {
    const s = new Array(e.length);
    for (let r = 0; r < e.length; r++)
      s[r] = Li(e[r], t);
    return s;
  } else if (typeof e == "object" && !(e instanceof Date)) {
    if (e.toJSON && typeof e.toJSON == "function" && !n)
      return Li(e.toJSON(), t, !0);
    const s = {};
    for (const r in e)
      Object.prototype.hasOwnProperty.call(e, r) && (s[r] = Li(e[r], t));
    return s;
  }
  return e;
}
function Ly(e, t) {
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
const Ny = [
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
class Py {
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
    return (t.type === Pe.EVENT || t.type === Pe.ACK) && Oi(t) ? this.encodeAsBinary({
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
    const n = Oy(t), s = this.encodeAsString(n.packet), r = n.buffers;
    return r.unshift(s), r;
  }
}
class Za extends mt {
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
      s || n.type === Pe.BINARY_ACK ? (n.type = s ? Pe.EVENT : Pe.ACK, this.reconstructor = new My(n)) : super.emitReserved("decoded", n);
    } else if (Xa(t) || t.base64)
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
      if (!Dy(a) || a < 1)
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
      if (Za.isPayloadValid(s.type, i))
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
        return Nc(n);
      case Pe.DISCONNECT:
        return n === void 0;
      case Pe.CONNECT_ERROR:
        return typeof n == "string" || Nc(n);
      case Pe.EVENT:
      case Pe.BINARY_EVENT:
        return Array.isArray(n) && (typeof n[0] == "number" || typeof n[0] == "string" && Ny.indexOf(n[0]) === -1);
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
class My {
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
      const n = Ly(this.reconPack, this.buffers);
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
const Dy = Number.isInteger || function(e) {
  return typeof e == "number" && isFinite(e) && Math.floor(e) === e;
};
function Nc(e) {
  return Object.prototype.toString.call(e) === "[object Object]";
}
const Fy = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Decoder: Za,
  Encoder: Py,
  get PacketType() {
    return Pe;
  }
}, Symbol.toStringTag, { value: "Module" }));
function mn(e, t, n) {
  return e.on(t, n), function() {
    e.off(t, n);
  };
}
const $y = Object.freeze({
  connect: 1,
  connect_error: 1,
  disconnect: 1,
  disconnecting: 1,
  // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
  newListener: 1,
  removeListener: 1
});
class Rf extends mt {
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
      mn(t, "open", this.onopen.bind(this)),
      mn(t, "packet", this.onpacket.bind(this)),
      mn(t, "error", this.onerror.bind(this)),
      mn(t, "close", this.onclose.bind(this))
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
    if ($y.hasOwnProperty(t))
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
    const r = n.parser || Fy;
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
    this.engine = new Sy(this.uri, this.opts);
    const n = this.engine, s = this;
    this._readyState = "opening", this.skipReconnect = !1;
    const r = mn(n, "open", function() {
      s.onopen(), t && t();
    }), i = (a) => {
      this.cleanup(), this._readyState = "closed", this.emitReserved("error", a), t ? t(a) : this.maybeReconnectOnOpen();
    }, o = mn(n, "error", i);
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
      mn(t, "ping", this.onping.bind(this)),
      mn(t, "data", this.ondata.bind(this)),
      mn(t, "error", this.onerror.bind(this)),
      mn(t, "close", this.onclose.bind(this)),
      // @ts-ignore
      mn(this.decoder, "decoded", this.ondecoded.bind(this))
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
    return s ? this._autoConnect && !s.active && s.connect() : (s = new Rf(this, t, n), this.nsps[t] = s), s;
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
function Ni(e, t) {
  typeof e == "object" && (t = e, e = void 0), t = t || {};
  const n = Ey(e, t.path || "/socket.io"), s = n.source, r = n.id, i = n.path, o = Er[r] && i in Er[r].nsps, a = t.forceNew || t["force new connection"] || t.multiplex === !1 || o;
  let l;
  return a ? l = new ba(s, t) : (Er[r] || (Er[r] = new ba(s, t)), l = Er[r]), n.query && !t.query && (t.query = n.queryKey), l.socket(n.path, t);
}
Object.assign(Ni, {
  Manager: ba,
  Socket: Rf,
  io: Ni,
  connect: Ni
});
const By = 5e3;
function Uy() {
  const e = oe([]), t = oe(!1), n = oe(""), s = oe(!1), r = oe(!1), i = oe(!1), o = oe("connecting"), a = oe(0), l = 5, u = oe({}), c = oe(null), b = oe(""), T = [];
  let I = null;
  const O = 6e4, H = () => {
    t.value = !1, I && (clearTimeout(I), I = null);
  }, ue = () => {
    t.value = !0, I && clearTimeout(I), I = setTimeout(H, O);
  };
  let R = null;
  const fe = 1e3, _e = 15e3;
  let x = null;
  const M = /* @__PURE__ */ new Set(["ai_config_missing", ...Wu]);
  let S = !1;
  const W = oe(null), se = () => {
    x && (clearTimeout(x), x = null);
  }, me = () => {
    if (x || S) return;
    const $ = Math.min(
      fe * 2 ** Math.max(0, a.value - 1),
      _e
    );
    x = setTimeout(() => {
      x = null, R == null || R.connect();
    }, $);
  };
  let ge = null, Oe = null, Se = null, Ge = null, Ue = null, st = !1, he = null, Te, ye, Ze;
  const Je = ($) => {
    var z;
    return (z = Ci($ ?? null)) == null ? void 0 : z.sub;
  }, lt = ($) => {
    Te = $, $ && R != null && R.connected && R.emit("refresh_token", { conversation_token: $ });
  }, je = ($) => {
    ye = $;
  }, Lt = () => {
    var f;
    const $ = Te || (Yi() ? null : Gi().read()), z = {};
    $ && (z.conversation_token = $), ye && (z.widget_id = ye);
    try {
      z.page_url = pf() || (window.parent !== window && ((f = window.parent.location) != null && f.href) ? window.parent.location.href : document.referrer || window.location.href);
    } catch {
      z.page_url = document.referrer || "";
    }
    return z;
  }, _n = ($) => {
    R = Ni(`${Ds.WS_URL}/widget`, {
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
      if (f && M.has(f)) {
        S = !0, W.value = f, se(), o.value = "failed", ua(f) ? st || Ue == null || Ue() : _(z.data);
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
      z.session_id && (b.value = z.session_id, he = {
        session_id: z.session_id,
        authenticated: !!z.authenticated,
        created: !!z.created
      }, Ge == null || Ge(he));
    }), R.on("error", _);
    for (const [z, f] of T) R.on(z, f);
    return R.on("chat_history", v), R.on("rating_submitted", L), R.on("display_form", D), R.on("form_submitted", U), R.on("workflow_state", P), R.on("workflow_proceeded", X), R;
  }, Me = async () => {
    try {
      return R != null && R.connected && Ze && Ze === Je(Lt().conversation_token) ? (o.value = "connected", !0) : (o.value = "connecting", a.value = 0, H(), se(), S = !1, W.value = null, R && (R.removeAllListeners(), R.disconnect(), R = null), st = !0, R = _n(""), new Promise(($) => {
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
  }, bt = () => (R && R.disconnect(), Me()), Ut = ($) => {
    ge = $;
  }, Wt = ($) => {
    Ue = $;
  }, qt = ($) => {
    Ge = $, he && $(he);
  }, Nt = ($) => {
    Oe = $;
  }, yn = ($) => {
    Se = $;
  }, _ = ($) => {
    H(), n.value = Tp($), s.value = !0, setTimeout(() => {
      s.value = !1, n.value = "";
    }, 5e3);
  }, v = ($) => {
    if ($.type === "chat_history" && Array.isArray($.messages)) {
      const z = $.messages.map((f) => {
        var N, C;
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
        return Array.isArray((N = f.attributes) == null ? void 0 : N.sources) && f.attributes.sources.length && (y.sources = f.attributes.sources), (C = f.attributes) != null && C.shopify_output && typeof f.attributes.shopify_output == "object" ? {
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
  }, P = ($) => {
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
  }, Z = async ($, z, f = [], y = {}) => {
    if (!R || !$.trim() && f.length === 0) return;
    const N = {
      message: $,
      message_type: "user",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: ""
    };
    f.length > 0 && (N.attachments = f.map((C, q) => {
      let ne = "";
      if (C.content_type.startsWith("image/")) {
        const ie = atob(C.content), Ee = new Array(ie.length);
        for (let Le = 0; Le < ie.length; Le++)
          Ee[Le] = ie.charCodeAt(Le);
        const Ie = new Uint8Array(Ee), ze = new Blob([Ie], { type: C.content_type });
        ne = URL.createObjectURL(ze);
      }
      return {
        id: Date.now() * 1e3 + q,
        // Temporary ID
        filename: C.filename,
        file_url: ne,
        // Temporary blob URL, will be replaced
        content_type: C.content_type,
        file_size: C.size,
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
    sendMessage: Z,
    endChat: ($ = "CUSTOMER_REQUEST") => new Promise((z) => {
      if (!R || !R.connected) {
        z(!1);
        return;
      }
      let f = !1;
      const y = (ne) => {
        f || (f = !0, clearTimeout(q), R == null || R.off("chat_ended", N), R == null || R.off("error", C), ne && Q(), z(ne));
      }, N = () => y(!0), C = (ne) => {
        (ne == null ? void 0 : ne.type) === "end_chat_error" && y(!1);
      }, q = setTimeout(() => y(!1), By);
      R.on("chat_ended", N), R.on("error", C), R.emit("end_chat", { reason: $ });
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
    reconnect: bt,
    cleanup: () => {
      H(), se(), R && (R.removeAllListeners(), R.disconnect(), R = null), ge = null, Oe = null, Se = null;
    },
    humanAgent: u,
    onTakeover: Ut,
    onSessionState: qt,
    onReauthorize: Wt,
    refusal: W,
    submitRating: V,
    currentForm: c,
    submitForm: K,
    getWorkflowState: j,
    proceedWorkflow: re,
    onWorkflowState: Nt,
    onWorkflowProceeded: yn,
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
const zy = 8, Hy = 200;
function jy(e) {
  const t = e && typeof e == "object" ? e.details : null;
  if (!t || typeof t != "object" || Array.isArray(t)) return null;
  const n = Object.entries(t).filter(([s, r]) => s.trim() && ["string", "number", "boolean"].includes(typeof r) && String(r).trim()).slice(0, zy).map(([s, r]) => ({ key: s.trim().slice(0, 60), value: String(r).trim().slice(0, Hy) }));
  return n.length ? n : null;
}
const Wy = 140;
function qy(e) {
  const t = e && typeof e == "object" ? e.summary : null;
  return typeof t == "string" && t.trim() ? t.trim().slice(0, Wy) : null;
}
const Vy = 2e3, Ky = 4;
function Gy(e) {
  if (typeof e.message != "string" || !e.message.trim()) return null;
  const t = Array.isArray(e.suggestions) ? e.suggestions.filter((n) => typeof n == "string" && !!n.trim()).map((n) => ({ label: n.slice(0, 80), kind: "text", value: n.slice(0, 500) })).slice(0, Ky) : [];
  return { message: e.message.slice(0, Vy), chips: t, open: e.open === !0, source: "host" };
}
const Yy = 2e3;
function Xy(e) {
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
      summary: W === "ok" ? qy(me.result) : null,
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
    const me = Math.max(1, S.timeout_s) * 1e3 + Yy;
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
        const se = Gy(S);
        return se && ((W = e.onPrompt) == null || W.call(e, se)), !0;
      }
      case "ACTION_PREVIEW_DONE": {
        const se = l.get(String(S.callId));
        if (!se) return !0;
        if (l.delete(se.call_id), se.confirm === "always") {
          const ge = jy(S.preview);
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
  function x(S, W) {
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
  function M() {
    for (const S of o.values()) n(S.timer);
    o.clear(), l.clear(), a.clear(), O(null);
  }
  return { announce: u, handleRequest: ue, handleHostMessage: R, approve: fe, decline: _e, runLocal: x, dispose: M };
}
function Zy(e, t, n) {
  const s = oe(null), r = Xy({
    postToHost: At,
    emit: e.emit,
    // Actions need a page whose origin we know: the framed widget with a real host.
    trustedHostOrigin: () => {
      if (!Yi()) return null;
      const o = af();
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
function Pc(e, t) {
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
const Jy = 6e4;
function Qy(e) {
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
    }, I.nudge.after_min * Jy));
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
      const R = O != null && O.journey_name ? Pc(O, !!O.finished) : null;
      e.showStep(null, R), O != null && O.finished && O.message && e.addNotice(O.message, "message");
      return;
    }
    const H = O.message ? { message: O.message, chips: O.chips ?? [], open: !1, source: "journey" } : null;
    e.showStep(H, Pc(O, !1)), O.fresh && O.auto_open && e.openChat(), u(O);
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
function ev(e) {
  const t = oe(null), n = oe(!1);
  let s = !1;
  const r = [], o = Qy({
    emit: (u, c) => {
      s ? e.emit(u, c) : r.push([u, c]);
    },
    showStep: (u, c) => {
      t.value = c;
      const b = e.currentPrompt();
      b && b.source !== "journey" || e.showPrompt(u);
    },
    addNotice: e.addNotice,
    openChat: () => At({ type: "WIDGET_OPEN_REQUEST" })
  });
  e.on("journey_state", o.handleState), e.on("session_initialized", () => {
    s = !0, o.sync({ url: pf() });
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
const vi = (e, t) => Be(e) === Be(t);
function tv(e, t) {
  let n;
  const s = Mh(null), r = () => {
    n = e.value[e.value.length - 1], s.value = null;
  };
  return pt(() => {
    var l;
    return (l = t.value) == null ? void 0 : l.message;
  }, r), pt(e, (l) => {
    (!s.value || !l.some((u) => vi(u, s.value))) && r();
  }, { flush: "sync" }), pt(() => e.value.length, () => {
    if (!t.value || s.value) return;
    const l = e.value, u = l[l.findIndex((c) => vi(c, n)) + 1];
    u && (s.value = u);
  }), { isBefore: (l) => !!t.value && vi(l, s.value), isLast: () => !!t.value && !s.value, index: () => {
    const l = e.value.findIndex((u) => vi(u, s.value));
    return l === -1 ? e.value.length : l;
  } };
}
function nv(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Xo = { exports: {} }, Mc;
function sv() {
  return Mc || (Mc = 1, function(e) {
    (function() {
      function t(f, y, N) {
        return f.call.apply(f.bind, arguments);
      }
      function n(f, y, N) {
        if (!f) throw Error();
        if (2 < arguments.length) {
          var C = Array.prototype.slice.call(arguments, 2);
          return function() {
            var q = Array.prototype.slice.call(arguments);
            return Array.prototype.unshift.apply(q, C), f.apply(y, q);
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
      function a(f, y, N, C) {
        if (y = f.c.createElement(y), N) for (var q in N) N.hasOwnProperty(q) && (q == "style" ? y.style.cssText = N[q] : y.setAttribute(q, N[q]));
        return C && y.appendChild(f.c.createTextNode(C)), y;
      }
      function l(f, y, N) {
        f = f.c.getElementsByTagName(y)[0], f || (f = document.documentElement), f.insertBefore(N, f.lastChild);
      }
      function u(f) {
        f.parentNode && f.parentNode.removeChild(f);
      }
      function c(f, y, N) {
        y = y || [], N = N || [];
        for (var C = f.className.split(/\s+/), q = 0; q < y.length; q += 1) {
          for (var ne = !1, ie = 0; ie < C.length; ie += 1) if (y[q] === C[ie]) {
            ne = !0;
            break;
          }
          ne || C.push(y[q]);
        }
        for (y = [], q = 0; q < C.length; q += 1) {
          for (ne = !1, ie = 0; ie < N.length; ie += 1) if (C[q] === N[ie]) {
            ne = !0;
            break;
          }
          ne || y.push(C[q]);
        }
        f.className = y.join(" ").replace(/\s+/g, " ").replace(/^\s+|\s+$/, "");
      }
      function b(f, y) {
        for (var N = f.className.split(/\s+/), C = 0, q = N.length; C < q; C++) if (N[C] == y) return !0;
        return !1;
      }
      function T(f) {
        return f.o.location.hostname || f.a.location.hostname;
      }
      function I(f, y, N) {
        function C() {
          Ee && q && ne && (Ee(ie), Ee = null);
        }
        y = a(f, "link", { rel: "stylesheet", href: y, media: "all" });
        var q = !1, ne = !0, ie = null, Ee = N || null;
        o ? (y.onload = function() {
          q = !0, C();
        }, y.onerror = function() {
          q = !0, ie = Error("Stylesheet failed to load"), C();
        }) : setTimeout(function() {
          q = !0, C();
        }, 0), l(f, "head", y);
      }
      function O(f, y, N, C) {
        var q = f.c.getElementsByTagName("head")[0];
        if (q) {
          var ne = a(f, "script", { src: y }), ie = !1;
          return ne.onload = ne.onreadystatechange = function() {
            ie || this.readyState && this.readyState != "loaded" && this.readyState != "complete" || (ie = !0, N && N(null), ne.onload = ne.onreadystatechange = null, ne.parentNode.tagName == "HEAD" && q.removeChild(ne));
          }, q.appendChild(ne), setTimeout(function() {
            ie || (ie = !0, N && N(Error("Script load timeout")));
          }, C || 5e3), ne;
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
      function x(f, y) {
        this.c = f, this.f = 4, this.a = "n";
        var N = (y || "n4").match(/^([nio])([1-9])$/i);
        N && (this.a = N[1], this.f = parseInt(N[2], 10));
      }
      function M(f) {
        return se(f) + " " + (f.f + "00") + " 300px " + S(f.c);
      }
      function S(f) {
        var y = [];
        f = f.split(/,\s*/);
        for (var N = 0; N < f.length; N++) {
          var C = f[N].replace(/['"]/g, "");
          C.indexOf(" ") != -1 || /^\d/.test(C) ? y.push("'" + C + "'") : y.push(C);
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
        var y = 4, N = "n", C = null;
        return f && ((C = f.match(/(normal|oblique|italic)/i)) && C[1] && (N = C[1].substr(0, 1).toLowerCase()), (C = f.match(/([1-9]00|normal|bold)/i)) && C[1] && (/bold/i.test(C[1]) ? y = 7 : /[1-9]00/.test(C[1]) && (y = parseInt(C[1].substr(0, 1), 10)))), N + y;
      }
      function ge(f, y) {
        this.c = f, this.f = f.o.document.documentElement, this.h = y, this.a = new _e("-"), this.j = y.events !== !1, this.g = y.classes !== !1;
      }
      function Oe(f) {
        f.g && c(f.f, [f.a.c("wf", "loading")]), Ge(f, "loading");
      }
      function Se(f) {
        if (f.g) {
          var y = b(f.f, f.a.c("wf", "active")), N = [], C = [f.a.c("wf", "loading")];
          y || N.push(f.a.c("wf", "inactive")), c(f.f, N, C);
        }
        Ge(f, "inactive");
      }
      function Ge(f, y, N) {
        f.j && f.h[y] && (N ? f.h[y](N.c, W(N)) : f.h[y]());
      }
      function Ue() {
        this.c = {};
      }
      function st(f, y, N) {
        var C = [], q;
        for (q in y) if (y.hasOwnProperty(q)) {
          var ne = f.c[q];
          ne && C.push(ne(y[q], N));
        }
        return C;
      }
      function he(f, y) {
        this.c = f, this.f = y, this.a = a(this.c, "span", { "aria-hidden": "true" }, this.f);
      }
      function Te(f) {
        l(f.c, "body", f.a);
      }
      function ye(f) {
        return "display:block;position:absolute;top:-9999px;left:-9999px;font-size:300px;width:auto;height:auto;line-height:normal;margin:0;padding:0;font-variant:normal;white-space:nowrap;font-family:" + S(f.c) + ";" + ("font-style:" + se(f) + ";font-weight:" + (f.f + "00") + ";");
      }
      function Ze(f, y, N, C, q, ne) {
        this.g = f, this.j = y, this.a = C, this.c = N, this.f = q || 3e3, this.h = ne || void 0;
      }
      Ze.prototype.start = function() {
        var f = this.c.o.document, y = this, N = r(), C = new Promise(function(ie, Ee) {
          function Ie() {
            r() - N >= y.f ? Ee() : f.fonts.load(M(y.a), y.h).then(function(ze) {
              1 <= ze.length ? ie() : setTimeout(Ie, 25);
            }, function() {
              Ee();
            });
          }
          Ie();
        }), q = null, ne = new Promise(function(ie, Ee) {
          q = setTimeout(Ee, y.f);
        });
        Promise.race([ne, C]).then(function() {
          q && (clearTimeout(q), q = null), y.g(y.a);
        }, function() {
          y.j(y.a);
        });
      };
      function Je(f, y, N, C, q, ne, ie) {
        this.v = f, this.B = y, this.c = N, this.a = C, this.s = ie || "BESbswy", this.f = {}, this.w = q || 3e3, this.u = ne || null, this.m = this.j = this.h = this.g = null, this.g = new he(this.c, this.s), this.h = new he(this.c, this.s), this.j = new he(this.c, this.s), this.m = new he(this.c, this.s), f = new x(this.a.c + ",serif", W(this.a)), f = ye(f), this.g.a.style.cssText = f, f = new x(this.a.c + ",sans-serif", W(this.a)), f = ye(f), this.h.a.style.cssText = f, f = new x("serif", W(this.a)), f = ye(f), this.j.a.style.cssText = f, f = new x("sans-serif", W(this.a)), f = ye(f), this.m.a.style.cssText = f, Te(this.g), Te(this.h), Te(this.j), Te(this.m);
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
      function _n(f, y, N) {
        for (var C in lt) if (lt.hasOwnProperty(C) && y === f.f[lt[C]] && N === f.f[lt[C]]) return !0;
        return !1;
      }
      function Me(f) {
        var y = f.g.a.offsetWidth, N = f.h.a.offsetWidth, C;
        (C = y === f.f.serif && N === f.f["sans-serif"]) || (C = Lt() && _n(f, y, N)), C ? r() - f.A >= f.w ? Lt() && _n(f, y, N) && (f.u === null || f.u.hasOwnProperty(f.a.c)) ? Ut(f, f.v) : Ut(f, f.B) : bt(f) : Ut(f, f.v);
      }
      function bt(f) {
        setTimeout(s(function() {
          Me(this);
        }, f), 50);
      }
      function Ut(f, y) {
        setTimeout(s(function() {
          u(this.g.a), u(this.h.a), u(this.j.a), u(this.m.a), y(this.a);
        }, f), 0);
      }
      function Wt(f, y, N) {
        this.c = f, this.a = y, this.f = 0, this.m = this.j = !1, this.s = N;
      }
      var qt = null;
      Wt.prototype.g = function(f) {
        var y = this.a;
        y.g && c(y.f, [y.a.c("wf", f.c, W(f).toString(), "active")], [y.a.c("wf", f.c, W(f).toString(), "loading"), y.a.c("wf", f.c, W(f).toString(), "inactive")]), Ge(y, "fontactive", f), this.m = !0, Nt(this);
      }, Wt.prototype.h = function(f) {
        var y = this.a;
        if (y.g) {
          var N = b(y.f, y.a.c("wf", f.c, W(f).toString(), "active")), C = [], q = [y.a.c("wf", f.c, W(f).toString(), "loading")];
          N || C.push(y.a.c("wf", f.c, W(f).toString(), "inactive")), c(y.f, C, q);
        }
        Ge(y, "fontinactive", f), Nt(this);
      };
      function Nt(f) {
        --f.f == 0 && f.j && (f.m ? (f = f.a, f.g && c(f.f, [f.a.c("wf", "active")], [f.a.c("wf", "loading"), f.a.c("wf", "inactive")]), Ge(f, "active")) : Se(f.a));
      }
      function yn(f) {
        this.j = f, this.a = new Ue(), this.h = 0, this.f = this.g = !0;
      }
      yn.prototype.load = function(f) {
        this.c = new i(this.j, f.context || this.j), this.g = f.events !== !1, this.f = f.classes !== !1, v(this, new ge(this.c, f), f);
      };
      function _(f, y, N, C, q) {
        var ne = --f.h == 0;
        (f.f || f.g) && setTimeout(function() {
          var ie = q || null, Ee = C || null || {};
          if (N.length === 0 && ne) Se(y.a);
          else {
            y.f += N.length, ne && (y.j = ne);
            var Ie, ze = [];
            for (Ie = 0; Ie < N.length; Ie++) {
              var Le = N[Ie], Qe = Ee[Le.c], rt = y.a, fn = Le;
              if (rt.g && c(rt.f, [rt.a.c("wf", fn.c, W(fn).toString(), "loading")]), Ge(rt, "fontloading", fn), rt = null, qt === null) if (window.FontFace) {
                var fn = /Gecko.*Firefox\/(\d+)/.exec(window.navigator.userAgent), $s = /OS X.*Version\/10\..*Safari/.exec(window.navigator.userAgent) && /Apple/.exec(window.navigator.vendor);
                qt = fn ? 42 < parseInt(fn[1], 10) : !$s;
              } else qt = !1;
              qt ? rt = new Ze(s(y.g, y), s(y.h, y), y.c, Le, y.s, Qe) : rt = new Je(s(y.g, y), s(y.h, y), y.c, Le, y.s, ie, Qe), ze.push(rt);
            }
            for (Ie = 0; Ie < ze.length; Ie++) ze[Ie].start();
          }
        }, 0);
      }
      function v(f, y, N) {
        var q = [], C = N.timeout;
        Oe(y);
        var q = st(f.a, N, f.c), ne = new Wt(f.c, y, C);
        for (f.h = q.length, y = 0, N = q.length; y < N; y++) q[y].load(function(ie, Ee, Ie) {
          _(f, ne, ie, Ee, Ie);
        });
      }
      function L(f, y) {
        this.c = f, this.a = y;
      }
      L.prototype.load = function(f) {
        function y() {
          if (ne["__mti_fntLst" + C]) {
            var ie = ne["__mti_fntLst" + C](), Ee = [], Ie;
            if (ie) for (var ze = 0; ze < ie.length; ze++) {
              var Le = ie[ze].fontfamily;
              ie[ze].fontStyle != null && ie[ze].fontWeight != null ? (Ie = ie[ze].fontStyle + ie[ze].fontWeight, Ee.push(new x(Le, Ie))) : Ee.push(new x(Le));
            }
            f(Ee);
          } else setTimeout(function() {
            y();
          }, 50);
        }
        var N = this, C = N.a.projectId, q = N.a.version;
        if (C) {
          var ne = N.c.o;
          O(this.c, (N.a.api || "https://fast.fonts.net/jsapi") + "/" + C + ".js" + (q ? "?v=" + q : ""), function(ie) {
            ie ? f([]) : (ne["__MonotypeConfiguration__" + C] = function() {
              return N.a;
            }, y());
          }).id = "__MonotypeAPIScript__" + C;
        } else f([]);
      };
      function D(f, y) {
        this.c = f, this.a = y;
      }
      D.prototype.load = function(f) {
        var y, N, C = this.a.urls || [], q = this.a.families || [], ne = this.a.testStrings || {}, ie = new H();
        for (y = 0, N = C.length; y < N; y++) I(this.c, C[y], ue(ie));
        var Ee = [];
        for (y = 0, N = q.length; y < N; y++) if (C = q[y].split(":"), C[1]) for (var Ie = C[1].split(","), ze = 0; ze < Ie.length; ze += 1) Ee.push(new x(C[0], Ie[ze]));
        else Ee.push(new x(C[0]));
        R(ie, function() {
          f(Ee, ne);
        });
      };
      function U(f, y) {
        f ? this.c = f : this.c = P, this.a = [], this.f = [], this.g = y || "";
      }
      var P = "https://fonts.googleapis.com/css";
      function X(f, y) {
        for (var N = y.length, C = 0; C < N; C++) {
          var q = y[C].split(":");
          q.length == 3 && f.f.push(q.pop());
          var ne = "";
          q.length == 2 && q[1] != "" && (ne = ":"), f.a.push(q.join(ne));
        }
      }
      function V(f) {
        if (f.a.length == 0) throw Error("No fonts to load!");
        if (f.c.indexOf("kit=") != -1) return f.c;
        for (var y = f.a.length, N = [], C = 0; C < y; C++) N.push(f.a[C].replace(/ /g, "+"));
        return y = f.c + "?family=" + N.join("%7C"), 0 < f.f.length && (y += "&subset=" + f.f.join(",")), 0 < f.g.length && (y += "&text=" + encodeURIComponent(f.g)), y;
      }
      function K(f) {
        this.f = f, this.a = [], this.c = {};
      }
      var j = { latin: "BESbswy", "latin-ext": "çöüğş", cyrillic: "йяЖ", greek: "αβΣ", khmer: "កខគ", Hanuman: "កខគ" }, re = { thin: "1", extralight: "2", "extra-light": "2", ultralight: "2", "ultra-light": "2", light: "3", regular: "4", book: "4", medium: "5", "semi-bold": "6", semibold: "6", "demi-bold": "6", demibold: "6", bold: "7", "extra-bold": "8", extrabold: "8", "ultra-bold": "8", ultrabold: "8", black: "9", heavy: "9", l: "3", r: "4", b: "7" }, Z = { i: "i", italic: "i", n: "n", normal: "n" }, Q = /^(thin|(?:(?:extra|ultra)-?)?light|regular|book|medium|(?:(?:semi|demi|extra|ultra)-?)?bold|black|heavy|l|r|b|[1-9]00)?(n|i|normal|italic)?$/;
      function pe(f) {
        for (var y = f.f.length, N = 0; N < y; N++) {
          var C = f.f[N].split(":"), q = C[0].replace(/\+/g, " "), ne = ["n4"];
          if (2 <= C.length) {
            var ie, Ee = C[1];
            if (ie = [], Ee) for (var Ee = Ee.split(","), Ie = Ee.length, ze = 0; ze < Ie; ze++) {
              var Le;
              if (Le = Ee[ze], Le.match(/^[\w-]+$/)) {
                var Qe = Q.exec(Le.toLowerCase());
                if (Qe == null) Le = "";
                else {
                  if (Le = Qe[2], Le = Le == null || Le == "" ? "n" : Z[Le], Qe = Qe[1], Qe == null || Qe == "") Qe = "4";
                  else var rt = re[Qe], Qe = rt || (isNaN(Qe) ? "4" : Qe.substr(0, 1));
                  Le = [Le, Qe].join("");
                }
              } else Le = "";
              Le && ie.push(Le);
            }
            0 < ie.length && (ne = ie), C.length == 3 && (C = C[2], ie = [], C = C ? C.split(",") : ie, 0 < C.length && (C = j[C[0]]) && (f.c[q] = C));
          }
          for (f.c[q] || (C = j[q]) && (f.c[q] = C), C = 0; C < ne.length; C += 1) f.a.push(new x(q, ne[C]));
        }
      }
      function de(f, y) {
        this.c = f, this.a = y;
      }
      var be = { Arimo: !0, Cousine: !0, Tinos: !0 };
      de.prototype.load = function(f) {
        var y = new H(), N = this.c, C = new U(this.a.api, this.a.text), q = this.a.families;
        X(C, q);
        var ne = new K(q);
        pe(ne), I(N, V(C), ue(y)), R(y, function() {
          f(ne.a, ne.c, be);
        });
      };
      function ke(f, y) {
        this.c = f, this.a = y;
      }
      ke.prototype.load = function(f) {
        var y = this.a.id, N = this.c.o;
        y ? O(this.c, (this.a.api || "https://use.typekit.net") + "/" + y + ".js", function(C) {
          if (C) f([]);
          else if (N.Typekit && N.Typekit.config && N.Typekit.config.fn) {
            C = N.Typekit.config.fn;
            for (var q = [], ne = 0; ne < C.length; ne += 2) for (var ie = C[ne], Ee = C[ne + 1], Ie = 0; Ie < Ee.length; Ie++) q.push(new x(ie, Ee[Ie]));
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
        var y = this.f.id, N = this.c.o, C = this;
        y ? (N.__webfontfontdeckmodule__ || (N.__webfontfontdeckmodule__ = {}), N.__webfontfontdeckmodule__[y] = function(q, ne) {
          for (var ie = 0, Ee = ne.fonts.length; ie < Ee; ++ie) {
            var Ie = ne.fonts[ie];
            C.a.push(new x(Ie.name, me("font-weight:" + Ie.weight + ";font-style:" + Ie.style)));
          }
          f(C.a);
        }, O(this.c, (this.f.api || "https://f.fontdeck.com/s/css/js/") + T(this.c) + "/" + y + ".js", function(q) {
          q && f([]);
        })) : f([]);
      };
      var $ = new yn(window);
      $.a.c.custom = function(f, y) {
        return new D(y, f);
      }, $.a.c.fontdeck = function(f, y) {
        return new De(y, f);
      }, $.a.c.monotype = function(f, y) {
        return new L(y, f);
      }, $.a.c.typekit = function(f, y) {
        return new ke(y, f);
      }, $.a.c.google = function(f, y) {
        return new de(y, f);
      };
      var z = { load: s($.load, $) };
      e.exports ? e.exports = z : (window.WebFont = z, window.WebFontConfig && $.load(window.WebFontConfig));
    })();
  }(Xo)), Xo.exports;
}
var rv = sv();
const iv = /* @__PURE__ */ nv(rv), Dc = [
  "Space Grotesk:400,500,600,700",
  "Instrument Sans:400,500,600",
  "JetBrains Mono:400,500,600"
], ov = (e) => {
  const t = [...Dc], n = (e == null ? void 0 : e.split(",")[0].trim().replace(/['"]/g, "")) || "", s = Dc.some(
    (r) => r.toLowerCase().startsWith(n.toLowerCase())
  );
  n && !s && t.push(n), iv.load({
    google: { families: t },
    active: () => {
      if (!e) return;
      const r = document.querySelector(".chat-container");
      r && (r.style.fontFamily = e.includes(",") ? e : `"${e}", system-ui, sans-serif`);
    }
  });
};
function av() {
  const e = oe({}), t = oe(""), n = (r) => {
    var i;
    e.value = r, r.photo_url && (e.value.photo_url = r.photo_url), ov(r.font_family), At({
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
const lv = 13, cv = 24;
function uv(e, t) {
  const n = to({}), s = [];
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
    t == null || t(), o(O === " " ? cv : lv);
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
  return Vr(() => {
    r && clearTimeout(r);
  }), { displayText: l, isStreaming: u };
}
function fv(e) {
  const t = oe(!0);
  let n = 0;
  const s = () => {
    At({ type: "UNREAD_COUNT", count: n });
  }, r = (i) => {
    var o;
    ((o = i == null ? void 0 : i.data) == null ? void 0 : o.type) === "WIDGET_VISIBILITY" && (t.value = !!i.data.open, t.value && n !== 0 && (n = 0, s()));
  };
  pt(() => e.value.length, (i, o) => {
    if (i <= (o ?? 0) || t.value) return;
    const a = e.value[i - 1];
    a && (a.message_type === "bot" || a.message_type === "agent") && (n += 1, s());
  }), ro(() => window.addEventListener("message", r)), Vr(() => window.removeEventListener("message", r));
}
const hv = {
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
}, dv = {
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
}, pv = {
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
}, mv = {
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
}, gv = {
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
}, Pi = {
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
}, _v = {
  GLASS: hv,
  AURORA: dv,
  TERMINAL: pv,
  CALM_MINT: mv,
  PLAYFUL: gv,
  SUNRISE: Pi,
  CHATBOT: Pi,
  ASK_ANYTHING: Pi
}, yv = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", Fc = "'Instrument Sans', system-ui, -apple-system, 'Segoe UI', sans-serif";
function vv(e) {
  return Math.max(4, Math.round(e * 0.3));
}
function $c(e) {
  const t = (e || "").replace("#", "");
  if (t.length < 6) return "#0B0C10";
  const n = parseInt(t.slice(0, 2), 16), s = parseInt(t.slice(2, 4), 16), r = parseInt(t.slice(4, 6), 16);
  return (0.299 * n + 0.587 * s + 0.114 * r) / 255 > 0.62 ? "#0B0C10" : "#FFFFFF";
}
function bv(e) {
  return _v[e || ""] || Pi;
}
const wv = "#212529";
function kv(e, t) {
  const n = bv(e), s = (t == null ? void 0 : t.chat_background_color) || "", r = /^#[0-9a-fA-F]{6}$/.test(s), i = s || n.card, o = (t == null ? void 0 : t.chat_text_color) || "", l = /^#[0-9a-fA-F]{6}$/.test(o) && o.toLowerCase() !== wv ? o : r ? sr(s) ? "#FFFFFF" : "#111111" : n.text, u = r ? sr(s) ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.62)" : n.muted, c = r ? kp(s, 20) : n.agentBg, b = (t == null ? void 0 : t.accent_color) || n.accent, T = r ? !sr(s) : n.light, I = $c(b) === "#0B0C10", O = T === I ? u : b, H = n.mono ? yv : t != null && t.font_family ? `${t.font_family}, ${Fc}` : Fc;
  return {
    "--cm-card": i,
    "--cm-text": l,
    "--cm-muted": u,
    "--cm-agent-bg": c,
    "--cm-accent": b,
    "--cm-on-accent": $c(b),
    "--cm-presence": O,
    "--cm-border": n.border,
    "--cm-glow": n.glow,
    "--cm-radius": `${n.radius}px`,
    "--cm-bubble": `${n.bubble}px`,
    "--cm-bubble-tail": `${vv(n.bubble)}px`,
    "--cm-field-radius": n.mono ? "7px" : "12px",
    "--cm-avatar-radius": n.mono ? "28%" : "50%",
    "--cm-hairline": n.light ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.08)",
    "--cm-body-font": H
  };
}
const Bc = (e) => {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: e || "USD" }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
};
function Tv() {
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
        minimumFractionDigits: Bc(r),
        maximumFractionDigits: Bc(r)
      }) : String(s);
      return i ? `${i}${a}` : a;
    },
    getCurrencySymbol: (s) => e[s] || s,
    currencySymbols: e
  };
}
const Av = {
  key: 0,
  class: "widget-unavailable-overlay"
}, Sv = { class: "widget-unavailable-card" }, Ev = {
  key: 0,
  class: "widget-unavailable-footer"
}, xv = {
  key: 1,
  class: "auth-error-overlay"
}, Cv = { class: "auth-error-card" }, Rv = { class: "auth-error-message" }, Iv = {
  key: 0,
  class: "initializing-overlay"
}, Ov = {
  key: 0,
  class: "connecting-message"
}, Lv = {
  key: 1,
  class: "failed-message"
}, Nv = { class: "welcome-content" }, Pv = { class: "welcome-header" }, Mv = ["src", "alt"], Dv = { class: "welcome-title" }, Fv = { class: "welcome-subtitle" }, $v = { class: "welcome-input-container" }, Bv = {
  key: 0,
  class: "email-input"
}, Uv = ["disabled"], zv = { class: "welcome-message-input" }, Hv = ["placeholder", "disabled"], jv = ["disabled"], Wv = {
  key: 0,
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, qv = {
  key: 1,
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, Vv = { class: "landing-page-content" }, Kv = { class: "landing-page-header" }, Gv = { class: "landing-page-heading" }, Yv = { class: "landing-page-text" }, Xv = { class: "landing-page-actions" }, Zv = { class: "form-fullscreen-content" }, Jv = {
  key: 0,
  class: "form-header"
}, Qv = {
  key: 0,
  class: "form-title"
}, eb = {
  key: 1,
  class: "form-description"
}, tb = { class: "form-fields" }, nb = ["for"], sb = {
  key: 0,
  class: "required-indicator"
}, rb = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "autocomplete", "inputmode"], ib = ["id", "placeholder", "required", "min", "max", "value", "onInput"], ob = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput"], ab = ["id", "required", "value", "onChange"], lb = { value: "" }, cb = ["value"], ub = {
  key: 4,
  class: "checkbox-field"
}, fb = ["id", "required", "checked", "onChange"], hb = { class: "checkbox-label" }, db = {
  key: 5,
  class: "radio-group"
}, pb = ["name", "value", "required", "checked", "onChange"], mb = { class: "radio-label" }, gb = {
  key: 6,
  class: "field-error"
}, _b = { class: "form-actions" }, yb = ["disabled"], vb = {
  key: 0,
  class: "loading-spinner-inline"
}, bb = { key: 1 }, wb = { class: "header-content" }, kb = ["src", "alt"], Tb = { class: "header-info" }, Ab = { class: "status" }, Sb = { class: "status-text cm-presence" }, Eb = { class: "header-actions" }, xb = ["disabled", "title", "aria-label", "aria-expanded"], Cb = { class: "ask-anything-header" }, Rb = ["src", "alt"], Ib = { class: "header-info" }, Ob = {
  key: 2,
  class: "loading-history"
}, Lb = { class: "cm-email-gate-title" }, Nb = ["disabled"], Pb = {
  key: 0,
  class: "cm-email-gate-error"
}, Mb = ["disabled"], Db = {
  key: 1,
  class: "cm-welcome-block"
}, Fb = { class: "message agent-message cm-welcome-row" }, $b = ["src", "alt"], Bb = {
  key: 0,
  class: "message agent-message cm-welcome-row cm-host-prompt"
}, Ub = ["src", "alt"], zb = {
  key: 0,
  class: "cm-msg-avatar",
  "aria-hidden": "true"
}, Hb = ["src"], jb = ["src"], Wb = { class: "message-col" }, qb = {
  key: 0,
  class: "rating-content"
}, Vb = { class: "rating-prompt" }, Kb = ["onMouseover", "onMouseleave", "onClick", "disabled"], Gb = {
  key: 0,
  class: "feedback-wrapper"
}, Yb = { class: "feedback-section" }, Xb = ["onUpdate:modelValue", "disabled"], Zb = { class: "feedback-counter" }, Jb = ["onClick", "disabled"], Qb = {
  key: 1,
  class: "submitted-feedback-wrapper"
}, ew = { class: "submitted-feedback" }, tw = { class: "submitted-feedback-text" }, nw = {
  key: 2,
  class: "submitted-message"
}, sw = {
  key: 1,
  class: "form-content"
}, rw = {
  key: 0,
  class: "form-header"
}, iw = {
  key: 0,
  class: "form-title"
}, ow = {
  key: 1,
  class: "form-description"
}, aw = { class: "form-fields" }, lw = ["for"], cw = {
  key: 0,
  class: "required-indicator"
}, uw = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "disabled", "autocomplete", "inputmode"], fw = ["id", "placeholder", "required", "min", "max", "value", "onInput", "disabled"], hw = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "disabled"], dw = ["id", "required", "value", "onChange", "disabled"], pw = { value: "" }, mw = ["value"], gw = {
  key: 4,
  class: "checkbox-field"
}, _w = ["id", "checked", "onChange", "disabled"], yw = ["for"], vw = {
  key: 5,
  class: "radio-field"
}, bw = ["id", "name", "value", "checked", "onChange", "disabled"], ww = ["for"], kw = {
  key: 6,
  class: "field-error"
}, Tw = { class: "form-actions" }, Aw = ["onClick", "disabled"], Sw = {
  key: 2,
  class: "user-input-content"
}, Ew = {
  key: 0,
  class: "user-input-prompt"
}, xw = {
  key: 1,
  class: "user-input-form"
}, Cw = ["onUpdate:modelValue", "onKeydown"], Rw = ["onClick", "disabled"], Iw = {
  key: 2,
  class: "user-input-submitted"
}, Ow = {
  key: 0,
  class: "user-input-confirmation"
}, Lw = {
  key: 3,
  class: "product-message-container"
}, Nw = ["innerHTML"], Pw = {
  key: 1,
  class: "products-carousel"
}, Mw = { class: "carousel-items" }, Dw = {
  key: 0,
  class: "product-image-compact"
}, Fw = ["src", "alt"], $w = { class: "product-info-compact" }, Bw = { class: "product-text-area" }, Uw = { class: "product-title-compact" }, zw = {
  key: 0,
  class: "product-variant-compact"
}, Hw = { class: "product-price-compact" }, jw = { class: "product-actions-compact" }, Ww = ["onClick"], qw = {
  key: 2,
  class: "no-products-message"
}, Vw = {
  key: 3,
  class: "no-products-message"
}, Kw = ["innerHTML"], Gw = ["innerHTML"], Yw = {
  key: 2,
  class: "message-attachments"
}, Xw = {
  key: 0,
  class: "attachment-image-container"
}, Zw = ["src", "alt", "onClick"], Jw = { class: "attachment-image-info" }, Qw = ["href"], e0 = { class: "attachment-size" }, t0 = ["href"], n0 = { class: "attachment-size" }, s0 = {
  key: 0,
  class: "citation-chips"
}, r0 = ["title"], i0 = { class: "message-info" }, o0 = {
  key: 0,
  class: "agent-name"
}, a0 = {
  key: 2,
  class: "message agent-message cm-welcome-row cm-host-prompt"
}, l0 = ["src", "alt"], c0 = {
  key: 5,
  class: "cm-quick-actions-bar"
}, u0 = ["disabled", "onClick"], f0 = {
  key: 0,
  class: "file-previews-widget"
}, h0 = {
  class: "file-preview-content-widget",
  style: { cursor: "pointer" }
}, d0 = ["src", "alt", "onClick"], p0 = ["onClick"], m0 = { class: "file-preview-info-widget" }, g0 = { class: "file-preview-name-widget" }, _0 = { class: "file-preview-size-widget" }, y0 = ["onClick"], v0 = {
  key: 1,
  class: "upload-progress-widget"
}, b0 = { class: "message-input" }, w0 = ["placeholder", "disabled"], k0 = ["disabled", "title"], T0 = ["disabled"], A0 = {
  key: 2,
  class: "cm-secret-hint",
  role: "alert"
}, S0 = {
  key: 7,
  class: "new-conversation-section"
}, E0 = { class: "conversation-ended-message" }, x0 = {
  key: 8,
  class: "ai-disclaimer"
}, C0 = {
  key: 8,
  class: "rating-dialog"
}, R0 = { class: "rating-content" }, I0 = { class: "star-rating" }, O0 = ["onClick"], L0 = { class: "rating-actions" }, N0 = ["disabled"], P0 = {
  key: 0,
  class: "preview-modal-image-container"
}, M0 = ["src", "alt"], D0 = { class: "preview-modal-filename" }, F0 = {
  key: 3,
  class: "widget-loading"
}, Uc = 3, $0 = "image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls", B0 = /* @__PURE__ */ ps({
  __name: "WidgetBuilder",
  props: {
    widgetId: {},
    token: {},
    initialAuthError: {}
  },
  setup(e) {
    const t = e, n = ae(() => {
      var h;
      return t.widgetId || ((h = window.__INITIAL_DATA__) == null ? void 0 : h.widgetId);
    }), {
      customization: s,
      agentName: r,
      applyCustomization: i,
      initializeFromData: o
    } = av(), { formatCurrency: a } = Tv(), {
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
      cleanup: x,
      humanAgent: M,
      onTakeover: S,
      refusal: W,
      submitRating: se,
      submitForm: me,
      currentForm: ge,
      getWorkflowState: Oe,
      proceedWorkflow: Se,
      onWorkflowState: Ge,
      onWorkflowProceeded: Ue,
      currentSessionId: st,
      setToken: he,
      setWidgetId: Te,
      onSessionState: ye,
      onReauthorize: Ze,
      on: Je,
      emit: lt
    } = Uy(), je = oe(null), { receipts: Lt, addReceipt: _n, receiptsAfter: Me } = v_(l), { pendingConfirm: bt, approveAction: Ut, declineAction: Wt, runLocalAction: qt } = Zy(
      { on: Je, emit: lt },
      (h) => {
        je.value = h;
      },
      _n
    ), { journeyProgress: Nt, chipBusy: yn, runChip: _, skipStep: v, dismissJourney: L, noteActivity: D } = ev({
      on: Je,
      emit: lt,
      currentPrompt: () => je.value,
      showPrompt: (h) => {
        je.value = h;
      },
      addNotice: (h) => {
        l.value.push({
          message: h,
          message_type: "bot",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          session_id: "",
          attributes: { source: "journey" }
        });
      },
      runLocalAction: qt
    }), U = (h) => {
      h.kind === "action" && !yn.value && !bt.value && (X.value && j(X.value), l.value.push({ message: h.label, message_type: "user", created_at: (/* @__PURE__ */ new Date()).toISOString(), session_id: "", attributes: { source: "journey" } })), _(h, Kn);
    }, P = ae(() => {
      const h = je.value;
      return !(h != null && h.chips.length) || bt.value || u.value ? [] : h.chips;
    }), X = ae(() => {
      const h = je.value;
      return !h || h.source !== "journey" ? h : l.value.some((Y) => Y.message_type === "bot" && Y.message === h.message) ? null : h;
    }), V = ae(() => u.value ? null : X.value), K = tv(l, V), j = (h) => {
      l.value.splice(K.index(), 0, {
        message: h.message,
        message_type: "bot",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: "",
        attributes: { source: h.source }
      });
    }, { displayText: re, isStreaming: Z } = uv(l, () => is(() => bn()));
    fv(l);
    const Q = oe(""), pe = oe(!0), de = oe(""), be = oe(!1), ke = (h) => {
      const m = h.target;
      Q.value = m.value;
    };
    let De = null;
    const $ = () => {
      De && De.disconnect(), De = new MutationObserver((m) => {
        let Y = !1, p = !1;
        m.forEach((ce) => {
          if (ce.type === "childList") {
            const Xe = Array.from(ce.addedNodes).some(
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
            Xe && (p = !0, Y = !0), we && (Y = !0);
          }
        }), Y && (clearTimeout($.timeoutId), $.timeoutId = setTimeout(() => {
          q();
        }, p ? 50 : 100));
      });
      const h = document.querySelector(".widget-container") || document.body;
      De.observe(h, {
        childList: !0,
        subtree: !0
      });
    };
    $.timeoutId = null;
    let z = [];
    const f = /* @__PURE__ */ new Set();
    let y = !1;
    const N = (h) => {
      if (y) return;
      const m = setTimeout(() => {
        f.delete(m), q();
      }, h);
      f.add(m);
    }, C = () => {
      f.forEach(clearTimeout), f.clear();
    }, q = () => {
      ne();
      const h = [
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
      for (const Y of h) {
        const p = document.querySelectorAll(Y);
        if (p.length > 0) {
          m = Array.from(p);
          break;
        }
      }
      m.length !== 0 && (z = m, m.forEach((Y) => {
        Y.addEventListener("input", Ee, !0), Y.addEventListener("keyup", Ee, !0), Y.addEventListener("change", Ee, !0), Y.addEventListener("keypress", Ie, !0), Y.addEventListener("keydown", ze, !0);
      }));
    }, ne = () => {
      z.forEach((h) => {
        h.removeEventListener("input", Ee), h.removeEventListener("keyup", Ee), h.removeEventListener("change", Ee), h.removeEventListener("keypress", Ie), h.removeEventListener("keydown", ze);
      }), z = [];
    }, ie = (h) => !!(h && h.closest && h.closest(".form-message, .form-fullscreen, .cm-email-gate")), Ee = (h) => {
      if (ie(h.target)) return;
      const m = h.target;
      Q.value = m.value;
    }, Ie = (h) => {
      ie(h.target) || h.key === "Enter" && !h.shiftKey && (h.preventDefault(), h.stopPropagation(), tn());
    }, ze = (h) => {
      ie(h.target) || h.key === "Enter" && !h.shiftKey && (h.preventDefault(), h.stopPropagation(), tn());
    }, Le = (h) => {
      const m = h.target, Y = document.querySelector(".header-menu-container");
      document.querySelector(".header-menu-btn");
      const p = document.querySelector(".header-dropdown-menu");
      p && !(Y != null && Y.contains(m)) && (p.style.display = "none");
    }, Qe = oe(!0), {
      token: rt,
      start: fn,
      stop: $s,
      setToken: Hn,
      ensureFresh: Yr
    } = F_({
      onTokenChanged: (h) => {
        Ls() && At({ type: "TOKEN_UPDATE", token: h }), he(h);
      },
      onIdentityExpired: () => {
        tl();
      },
      // A framed widget holds the token only in memory: the host page keeps it, so
      // it must hear when the widget lets it go.
      onTokenCleared: () => {
        Yi() && Ls() && At({ type: "TOKEN_CLEAR" });
      },
      store: gf(n.value || "")
    });
    ae(() => !!rt.value);
    const zt = oe(null), Pt = oe(!1), Vt = oe(!1);
    t.initialAuthError && (zt.value = t.initialAuthError, Pt.value = !0, Qe.value = !1), o();
    const Tt = window.__INITIAL_DATA__;
    fn((Tt == null ? void 0 : Tt.widgetId) || "", Tt == null ? void 0 : Tt.initialToken), rt.value && (be.value = !0);
    const jn = oe(!1);
    (Tt == null ? void 0 : Tt.allowAttachments) !== void 0 && (jn.value = Tt.allowAttachments);
    const Wn = oe(null), {
      chatStyles: gs,
      chatIconStyles: Xr,
      agentBubbleStyles: Rn,
      userBubbleStyles: hn,
      messageNameStyles: Kt,
      headerBorderStyles: Zr,
      photoUrl: ft,
      shadowStyle: po
    } = H_(s), Jr = oe(null), {
      uploadedAttachments: $e,
      previewModal: qn,
      previewFile: _s,
      formatFileSize: Bs,
      isImageAttachment: lr,
      getDownloadUrl: ys,
      getPreviewUrl: cr,
      handleFileSelect: Qr,
      handleDrop: ei,
      handleDragOver: ti,
      handleDragLeave: ni,
      handlePaste: dn,
      removeAttachment: si,
      openPreview: Vn,
      closePreview: en,
      openFilePicker: ri,
      isImage: vs
    } = q_(rt, Jr);
    ae(() => l.value.some(
      (h) => h.message_type === "form" && (!h.isSubmitted || h.isSubmitted === !1)
    ));
    const vn = ae(() => {
      var h;
      return I.value && be.value || !wo.value ? O.value === "connected" && !u.value : vr(de.value.trim()) && O.value === "connected" && !u.value || ((h = window.__INITIAL_DATA__) == null ? void 0 : h.workflow);
    }), bs = ae(() => vn.value || u.value && O.value === "connected" && I.value), Us = ae(() => O.value === "connected" ? rn.value ? "Ask me anything..." : "Type a message..." : "Connecting..."), zs = oe(!1), In = ae(() => S_(Q.value)), tn = async () => {
      var p;
      if (!Q.value.trim() && $e.value.length === 0 || In.value) return;
      if (u.value && I.value) {
        zs.value = !0;
        return;
      }
      !I.value && de.value && await wt();
      const h = $e.value.map((ce) => ({
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
        de.value,
        h,
        m ? { host_prompt: m.message, host_prompt_source: m.source } : {}
      ), $e.value.forEach((ce) => {
        ce.url && ce.url.startsWith("blob:") && URL.revokeObjectURL(ce.url), ce.file_url && ce.file_url.startsWith("blob:") && URL.revokeObjectURL(ce.file_url);
      }), Q.value = "", $e.value = [];
      const Y = document.querySelector('input[placeholder*="Type a message"]');
      Y && (Y.value = ""), N(500);
    };
    pt(u, (h) => {
      h || !zs.value || (zs.value = !1, O.value === "connected" && I.value && tn());
    });
    const Kn = (h) => {
      vn.value && (Q.value = h, tn());
    }, pn = () => {
      At({ type: "WIDGET_MINIMIZE" });
    }, Gn = (h) => {
      h.key === "Enter" && !h.shiftKey && (h.preventDefault(), h.stopPropagation(), tn());
    }, wt = async ({ afterRefusal: h = !1 } = {}) => {
      var m, Y, p, ce;
      try {
        if (!n.value)
          return console.error("Widget ID is not available"), zt.value = "Widget ID is not available. Please refresh and try again.", Pt.value = !0, !1;
        await Yr(n.value);
        const Xe = new URL(`${Ds.API_URL}/widgets/${n.value}`);
        de.value.trim() && vr(de.value.trim()) && Xe.searchParams.append("email", de.value.trim());
        const we = {
          Accept: "application/json",
          "Content-Type": "application/json"
        };
        rt.value && (we.Authorization = `Bearer ${rt.value}`);
        const at = await fetch(Xe, {
          headers: we,
          cache: "no-store"
        });
        if (at.status === 401) {
          be.value = !1;
          try {
            const Qn = (await at.json()).detail;
            if ((Qn == null ? void 0 : Qn.code) === L_)
              return tl(), !1;
            const Ks = typeof Qn == "string" ? Qn : "";
            (Ks.includes("generate-token") || Ks.includes("API key") || Ks.includes("Token required")) && (Vt.value = !0, zt.value = "Widget authentication not configured. Please contact the website administrator.", Pt.value = !0, Hn(null));
          } catch {
            zt.value = "Authentication required. Your token has expired or is invalid. Please refresh the page.", Pt.value = !0, Hn(null);
          }
          return !1;
        }
        if (!at.ok) {
          try {
            const mr = await at.json();
            zt.value = mr.detail || `Error: ${at.statusText}`;
          } catch {
            zt.value = `Error: ${at.statusText}. Please try again.`;
          }
          return Pt.value = !0, !1;
        }
        const et = await at.json();
        et.token && Hn(et.token), be.value = !0, zt.value = null, Pt.value = !1, he(rt.value || void 0);
        const pr = await fe();
        return !pr && ua(W.value) && !h ? await wt({ afterRefusal: !0 }) : (pr || console.error("Chat service not reachable yet; retrying in the background"), await mo(), (m = et.agent) != null && m.customization && i(et.agent.customization), et.agent && !(et != null && et.human_agent) && (r.value = et.agent.name), et != null && et.human_agent && (M.value = et.human_agent), ((Y = et.agent) == null ? void 0 : Y.allow_attachments) !== void 0 && (jn.value = et.agent.allow_attachments), ((p = et.agent) == null ? void 0 : p.workflow) !== void 0 && (window.__INITIAL_DATA__ = window.__INITIAL_DATA__ || {}, window.__INITIAL_DATA__.workflow = et.agent.workflow), (ce = et.agent) != null && ce.workflow && await Oe(), !0);
      } catch (Xe) {
        return console.error("Error checking authorization:", Xe), zt.value = "An unexpected error occurred. Please try again.", Pt.value = !0, be.value = !1, !1;
      } finally {
        Qe.value = !1;
      }
    }, mo = async () => {
      !I.value && be.value && (I.value = !0, await R());
    }, bn = () => {
      Wn.value && (Wn.value.scrollTop = Wn.value.scrollHeight);
    };
    pt(() => l.value, (h) => {
      is(() => {
        bn();
      });
    }, { deep: !0 }), pt([bt, V, () => Lt.value.length, u], ([h, m, Y, p]) => {
      (h || m || Y || p) && is(() => bn());
    }), pt(O, (h, m) => {
      h === "connected" && m !== "connected" && N(100);
    }), pt(() => l.value.length, (h, m) => {
      h > 0 && m === 0 && N(100);
    });
    let ii = null;
    pt(() => l.value, (h) => {
      const m = h[h.length - 1];
      !Ac(m) || m === ii || (ii = m, le(m));
    }, { deep: !0 });
    const oi = async () => {
      (await _e() || ua(W.value)) && await wt();
    }, ur = oe(!1), ws = oe(0), Hs = oe(""), nn = oe(0), Gt = oe(!1), ht = oe({}), yt = oe(!1), ut = oe({}), sn = oe(!1), On = oe(null), G = oe("Start Chat"), d = oe(!1), k = oe(null);
    ae(() => {
      var m;
      const h = l.value[l.value.length - 1];
      return ((m = h == null ? void 0 : h.attributes) == null ? void 0 : m.request_rating) || !1;
    });
    const B = ae(() => {
      var m;
      if (!((m = window.__INITIAL_DATA__) != null && m.workflow))
        return !1;
      const h = l.value.find((Y) => Y.message_type === "rating");
      return (h == null ? void 0 : h.isSubmitted) === !0;
    }), ee = ae(
      () => Ki(M.value.human_agent_profile_pic)
    ), le = async (h) => {
      var m, Y, p, ce, Xe;
      if (Ac(h)) {
        try {
          if (h.session_id && rt.value && n.value) {
            const we = await el(h.session_id, {
              reason: (m = h.attributes) == null ? void 0 : m.end_chat_reason,
              description: (Y = h.attributes) == null ? void 0 : Y.end_chat_description
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
        if ((p = h.attributes) != null && p.end_chat && ((ce = h.attributes) != null && ce.request_rating)) {
          const we = h.agent_name || ((Xe = M.value) == null ? void 0 : Xe.human_agent_name) || r.value || "our agent";
          l.value.push({
            message: `Rate the chat session that you had with ${we}`,
            message_type: "rating",
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            session_id: h.session_id,
            agent_name: we,
            showFeedback: !1
          }), st.value = h.session_id;
        }
      }
    }, ve = (h) => {
      Gt.value || (nn.value = h);
    }, Ye = () => {
      if (!Gt.value) {
        const h = l.value[l.value.length - 1];
        nn.value = (h == null ? void 0 : h.selectedRating) || 0;
      }
    }, ot = async (h) => {
      if (!Gt.value) {
        nn.value = h;
        const m = l.value[l.value.length - 1];
        m && m.message_type === "rating" && (m.showFeedback = !0, m.selectedRating = h);
      }
    }, Et = async (h, m, Y = null) => {
      try {
        Gt.value = !0, await se(m, Y);
        const p = l.value.find((ce) => ce.message_type === "rating");
        p && (p.isSubmitted = !0, p.finalRating = m, p.finalFeedback = Y);
      } catch (p) {
        console.error("Failed to submit rating:", p);
      } finally {
        Gt.value = !1;
      }
    }, xt = (h) => {
      const m = {};
      for (const Y of h.fields) {
        const p = ht.value[Y.name], ce = li(Y, p);
        ce && (m[Y.name] = ce);
      }
      return ut.value = m, Object.keys(m).length === 0;
    }, fr = async (h) => {
      if (!(yt.value || !xt(h)))
        try {
          yt.value = !0, await me(ht.value);
          const Y = l.value.findIndex(
            (p) => p.message_type === "form" && (!p.isSubmitted || p.isSubmitted === !1)
          );
          Y !== -1 && l.value.splice(Y, 1), ht.value = {}, ut.value = {};
        } catch (Y) {
          console.error("Failed to submit form:", Y);
        } finally {
          yt.value = !1;
        }
    }, We = (h, m) => {
      var Y, p;
      if (ht.value[h] = m, m && m.toString().trim() !== "") {
        let ce = null;
        if ((Y = k.value) != null && Y.fields && (ce = k.value.fields.find((Xe) => Xe.name === h)), !ce && ((p = ge.value) != null && p.fields) && (ce = ge.value.fields.find((Xe) => Xe.name === h)), ce) {
          const Xe = li(ce, m);
          Xe ? (ut.value[h] = Xe, console.log(`Validation error for ${h}:`, Xe)) : delete ut.value[h];
        }
      } else
        delete ut.value[h], console.log(`Cleared error for ${h}`);
    }, ai = (h) => {
      const m = h.replace(/\D/g, "");
      return m.length >= 7 && m.length <= 15;
    }, li = (h, m) => {
      if (h.required && (!m || m.toString().trim() === ""))
        return `${h.label} is required`;
      if (!m || m.toString().trim() === "")
        return null;
      if (h.type === "email" && !vr(m))
        return "Please enter a valid email address";
      if (h.type === "tel" && !ai(m))
        return "Please enter a valid phone number";
      if ((h.type === "text" || h.type === "textarea") && h.minLength && m.length < h.minLength)
        return `${h.label} must be at least ${h.minLength} characters`;
      if ((h.type === "text" || h.type === "textarea") && h.maxLength && m.length > h.maxLength)
        return `${h.label} must not exceed ${h.maxLength} characters`;
      if (h.type === "number") {
        const Y = parseFloat(m);
        if (isNaN(Y))
          return `${h.label} must be a valid number`;
        if (h.minLength && Y < h.minLength)
          return `${h.label} must be at least ${h.minLength}`;
        if (h.maxLength && Y > h.maxLength)
          return `${h.label} must not exceed ${h.maxLength}`;
      }
      return null;
    }, If = async () => {
      if (!(yt.value || !k.value))
        try {
          yt.value = !0, ut.value = {};
          let h = !1;
          for (const m of k.value.fields || []) {
            const Y = ht.value[m.name], p = li(m, Y);
            p && (ut.value[m.name] = p, h = !0, console.log(`Validation error for field ${m.name}:`, p));
          }
          if (h) {
            yt.value = !1, console.log("Validation failed, not submitting");
            return;
          }
          await me(ht.value), d.value = !1, k.value = null, ht.value = {};
        } catch (h) {
          console.error("Failed to submit full screen form:", h);
        } finally {
          yt.value = !1, console.log("Full screen form submission completed");
        }
    }, Of = (h, m) => {
      if (console.log("handleViewDetails called with:", { product: h, shopDomain: m }), !h) {
        console.error("No product provided to handleViewDetails");
        return;
      }
      let Y = null;
      if (h.handle && m)
        Y = `https://${m}/products/${h.handle}`;
      else if (h.id && m)
        Y = `https://${m}/products/${h.id}`;
      else if (m) {
        if (!h.handle && !h.id) {
          console.error("Product handle and ID are both missing! Product:", h), alert("Unable to open product: Product information incomplete.");
          return;
        }
      } else {
        console.error("Shop domain is missing! Product:", h), alert("Unable to open product: Shop domain not available. Please contact support.");
        return;
      }
      Y && (console.log("Opening product URL:", Y), window.open(Y, "_blank", "noopener"));
    }, Lf = (h) => {
      if (!h) return "";
      let m = h.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "");
      const Y = [];
      return m = m.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (p, ce, Xe) => {
        const we = `__MARKDOWN_LINK_${Y.length}__`;
        return console.log("Found markdown link:", p, "-> placeholder:", we), Y.push(p), we;
      }), console.log("After replacing markdown links with placeholders:", m), console.log("Markdown links array:", Y), m = m.replace(/https?:\/\/[^\s\)]+/g, "[link removed]"), console.log("After removing standalone URLs:", m), Y.forEach((p, ce) => {
        m = m.replace(`__MARKDOWN_LINK_${ce}__`, p), console.log(`Restored markdown link ${ce}:`, p);
      }), m = m.replace(/\n\s*\n\s*\n/g, `

`).trim(), m;
    }, Ja = oe(!1);
    oe(!1);
    const go = ae(() => {
      var h;
      return !!((h = M.value) != null && h.human_agent_name);
    }), Qa = ae(() => {
      var h;
      return I_((h = window.__INITIAL_DATA__) == null ? void 0 : h.presence, go.value);
    }), js = ae(() => {
      var h;
      return !((h = window.__INITIAL_DATA__) != null && h.hideBranding);
    }), Nf = ae(() => jn.value && go.value && $e.value.length < Uc), Pf = async () => {
      try {
        sn.value = !1, On.value = null, await Se();
      } catch (h) {
        console.error("Failed to proceed workflow:", h);
      }
    }, _o = async (h) => {
      try {
        if (!h.userInputValue || !h.userInputValue.trim())
          return;
        const m = h.userInputValue.trim();
        h.isSubmitted = !0, h.submittedValue = m, await H(m, de.value);
      } catch (m) {
        console.error("Failed to submit user input:", m), h.isSubmitted = !1, h.submittedValue = null;
      }
    }, el = (h, { reason: m, description: Y, keepalive: p = !1 } = {}) => {
      const ce = new URL(`${Ds.API_URL}/widgets/${n.value}/end-chat`);
      return ce.searchParams.append("session_id", h), m && ce.searchParams.append("reason", m), Y && ce.searchParams.append("description", Y), fetch(ce, {
        method: "POST",
        keepalive: p,
        headers: {
          Authorization: `Bearer ${rt.value}`,
          "Content-Type": "application/json"
        }
      });
    }, Mf = async (h) => {
      try {
        typeof h == "string" && h && rt.value && n.value && await el(h, { reason: "CUSTOMER_REQUEST", keepalive: !0 });
      } catch {
      } finally {
        At({ type: "END_CHAT_DONE" });
      }
    }, tl = () => {
      if (!Ls()) {
        nl();
        return;
      }
      At({ type: "IDENTITY_EXPIRED" });
    }, nl = async () => {
      rt.value && (Hn(null), await hr());
    }, Df = async (h) => {
      const m = as(h);
      !m || m === rt.value || (Hn(m), await hr());
    }, hr = async () => {
      var h, m, Y;
      try {
        let p = 0;
        const ce = 50;
        for (; !((h = window.__INITIAL_DATA__) != null && h.widgetId) && p < ce; )
          await new Promise((we) => setTimeout(we, 100)), p++;
        return (m = window.__INITIAL_DATA__) != null && m.widgetId ? (Te(window.__INITIAL_DATA__.widgetId), await wt() ? ((Y = window.__INITIAL_DATA__) != null && Y.workflow && be.value && await Oe(), !0) : (O.value = "connected", !1)) : (console.error("Widget data not available after waiting"), !1);
      } catch (p) {
        return console.error("Failed to initialize widget:", p), !1;
      }
    };
    window.addEventListener("message", (h) => {
      h.source === window.parent && (!h.data || typeof h.data.type != "string" || (h.data.type === "SCROLL_TO_BOTTOM" && bn(), h.data.type === "HOST_PAGE" && mf(h.data.url), h.data.type === "END_CHAT" && Ls() && Mf(h.data.sessionId), h.data.type === "IDENTITY_UNAVAILABLE" && Ls() && nl(), h.data.type === "TOKEN_REFRESH" && Ls() && Df(h.data.token), h.data.type === "WIDGET_VISIBILITY" && (hl.value = !!h.data.open), h.data.type === "WIDGET_DISPLAY" && (ko.value = {
        mode: h.data.mode,
        width: h.data.width,
        height: h.data.height,
        hotkey: h.data.hotkey
      }), h.data.type === "PREFILL_MESSAGE" && typeof h.data.text == "string" && (Q.value = h.data.text.slice(0, 2e3), is(() => {
        const m = document.querySelector(
          ".message-input input, .welcome-message-field"
        );
        m == null || m.focus();
      }))));
    }), window.addEventListener("keydown", (h) => {
      h.key !== "Escape" || h.defaultPrevented || !Yi() || At({ type: "WIDGET_ESCAPE" });
    });
    const Ff = () => {
      S(async () => {
        await wt();
      }), Ze(async () => {
        await wt();
      }), ye(({ session_id: h, authenticated: m, created: Y }) => {
        At({
          type: "CHAT_SESSION",
          sessionId: h,
          authenticated: m,
          created: Y
        });
      }), Ge((h) => {
        var m;
        if (G.value = h.button_text || "Start Chat", h.type === "landing_page")
          On.value = h.landing_page_data, sn.value = !0, d.value = !1;
        else if (h.type === "form" || h.type === "display_form")
          if (((m = h.form_data) == null ? void 0 : m.form_full_screen) === !0)
            k.value = h.form_data, d.value = !0, sn.value = !1;
          else {
            const Y = {
              message: "",
              message_type: "form",
              attributes: {
                form_data: h.form_data
              },
              created_at: (/* @__PURE__ */ new Date()).toISOString(),
              isSubmitted: !1
            };
            l.value.findIndex(
              (ce) => ce.message_type === "form" && !ce.isSubmitted
            ) === -1 && l.value.push(Y), sn.value = !1, d.value = !1;
          }
        else
          sn.value = !1, d.value = !1;
      }), Ue((h) => {
        console.log("Workflow proceeded:", h);
      });
    }, $f = async () => {
      try {
        await hr(), await Oe();
      } catch (h) {
        throw console.error("Failed to start new conversation:", h), h;
      }
    }, ci = ae(
      () => {
        var h;
        return s.value.allow_new_chat === !0 && l.value.length > 0 && !((h = M.value) != null && h.human_agent_name) && !As.value;
      }
    ), Yn = oe(!1), Xn = oe(""), Zn = oe(!1);
    let ks = null;
    const Ws = () => {
      Zn.value = !1, Xn.value = "", ks && (clearTimeout(ks), ks = null);
    }, sl = () => {
      if (!Yn.value) {
        if (Zn.value) {
          Ws();
          return;
        }
        Zn.value = !0, Xn.value = "", ks = setTimeout(Ws, qm);
      }
    };
    pt(ci, (h) => {
      h || Ws();
    });
    const rl = async () => {
      Yn.value || (ks && (clearTimeout(ks), ks = null), await Bf(), Xn.value || (Zn.value = !1));
    }, Bf = async () => {
      if (!Yn.value) {
        Yn.value = !0, Xn.value = "";
        try {
          if (!await ue()) {
            Xn.value = Tc;
            return;
          }
          M.value = {}, Q.value = "", $e.value = [], await hr();
        } catch (h) {
          console.error("Failed to start a new chat:", h), Xn.value = Tc;
        } finally {
          Yn.value = !1;
        }
      }
    }, Uf = async () => {
      B.value = !1, l.value = [], M.value = {}, await $f();
    };
    ro(async () => {
      await hr(), Ff(), $(), document.addEventListener("click", Le), (() => {
        const m = l.value.length > 0, Y = O.value === "connected", p = document.querySelector('input[type="text"], textarea') !== null;
        return m || Y || p;
      })() && N(100);
    }), Vr(() => {
      window.removeEventListener("message", (h) => {
        h.data.type === "SCROLL_TO_BOTTOM" && bn();
      }), document.removeEventListener("click", Le), De && (De.disconnect(), De = null), $.timeoutId && (clearTimeout($.timeoutId), $.timeoutId = null), y = !0, C(), ne(), $s(), Ws(), x();
    });
    const qs = ae(() => s.value.chat_style === "AURORA"), rn = ae(() => s.value.chat_style === "ASK_ANYTHING" || qs.value), il = ae(() => s.value.customization_metadata), Vs = ae(() => {
      var m;
      const h = (m = il.value) == null ? void 0 : m.avatar_style;
      return h === "orb" ? !0 : h === "photo" ? !1 : qs.value && !s.value.photo_url;
    }), Ts = ae(() => {
      var h;
      return C_(r.value || "", (h = il.value) == null ? void 0 : h.orb_variant);
    }), zf = {
      GLASS: "theme-glass",
      TERMINAL: "theme-terminal",
      PLAYFUL: "theme-playful",
      CALM_MINT: "theme-calm",
      SUNRISE: "theme-sunrise"
    }, Hf = ae(() => zf[s.value.chat_style] || ""), jf = ae(() => kv(s.value.chat_style, {
      chat_background_color: s.value.chat_background_color,
      chat_text_color: s.value.chat_text_color,
      accent_color: s.value.accent_color,
      font_family: s.value.font_family
    })), yo = ae(
      () => Array.isArray(s.value.quick_actions) ? s.value.quick_actions.filter((h) => !!h && h.trim().length > 0) : []
    ), ol = ae(() => (s.value.welcome_message || "").trim()), al = ae(
      () => !rn.value && l.value.length === 0 && !T.value && !As.value
    ), Wf = ae(
      () => al.value && ol.value.length > 0
    ), qf = ae(
      () => al.value && !B.value && yo.value.length > 0
    ), ui = ae(() => s.value.show_citations === !0), ll = ae(() => R_(s.value.show_ai_disclaimer, go.value)), Vf = (h) => /^[0-9a-f]{16,}$/i.test(h) || /^[0-9a-f-]{32,}$/i.test(h), vo = (h) => {
      const m = (h || "").trim().toLowerCase();
      return !m || m === "unknown" ? "Knowledge base" : m.charAt(0).toUpperCase() + m.slice(1);
    }, bo = (h) => {
      let m = ((h == null ? void 0 : h.name) || "").trim();
      return !m || (m = m.replace(/^[0-9a-f]{16,}[_-]/i, "").replace(/\.(pdf|txt|md|html?|docx?|csv|json)$/i, ""), !m || Vf(m)) ? vo(h == null ? void 0 : h.type) : m;
    }, cl = (h) => {
      const m = bo(h), Y = vo(h == null ? void 0 : h.type);
      return m === Y ? Y : `${m} · ${Y}`;
    }, wo = ae(() => s.value.collect_email === !0 && !rn.value), ul = oe(!1), Jn = oe(""), dr = oe(!1), As = ae(() => !I.value && wo.value && !ul.value), fl = async () => {
      const h = de.value.trim();
      if (!h) {
        Jn.value = "Please enter your email address.";
        return;
      }
      if (!vr(h)) {
        Jn.value = "Please enter a valid email address.";
        return;
      }
      Jn.value = "", dr.value = !0;
      try {
        await wt(), ul.value = !0;
      } catch {
        Jn.value = "Something went wrong. Please try again.";
      } finally {
        dr.value = !1;
      }
    }, ko = oe(null), hl = oe(!0), To = { mode: "floating", width: 400, height: 560 }, fi = ae(
      () => {
        var h;
        return ko.value || ((h = s.value.customization_metadata) == null ? void 0 : h.widget_display) || null;
      }
    ), Kf = ae(() => {
      const h = fi.value;
      return h ? typeof h.mode == "string" && h.mode !== To.mode || typeof h.width == "number" && h.width !== To.width || typeof h.height == "number" && h.height !== To.height : !1;
    }), Gf = ae(() => {
      var m;
      const h = {
        width: "100%",
        height: "100%",
        borderRadius: "var(--radius-lg)"
      };
      if (Kf.value) {
        const Y = (m = fi.value) == null ? void 0 : m.mode;
        return Y === "sidebar-left" || Y === "sidebar-right" ? { ...h, borderRadius: "0" } : h;
      }
      return rn.value ? window.innerWidth <= 768 ? {
        ...h,
        width: "100vw",
        height: "100vh",
        maxWidth: "100vw",
        maxHeight: "100vh",
        minWidth: "unset",
        borderRadius: "0"
      } : window.innerWidth <= 1024 ? {
        ...h,
        width: "95%",
        maxWidth: "700px",
        minWidth: "500px",
        height: "650px"
      } : {
        ...h,
        width: "100%",
        maxWidth: "400px",
        minWidth: "400px",
        height: "580px"
      } : h;
    }), dl = ae(() => rn.value && l.value.length === 0), Yf = ["form", "user_input", "rating", "product", "shopify_output"], Xf = ae(
      () => l.value.some(
        (h) => Yf.includes(h.message_type) || Array.isArray(h.attachments) && h.attachments.length > 0
      )
    ), Zf = ae(() => {
      var m, Y;
      return rn.value ? !0 : (((m = fi.value) == null ? void 0 : m.mode) === "ask-ai" || ((Y = fi.value) == null ? void 0 : Y.mode) === "search-bar") && !jn.value;
    }), Ao = ae(
      () => Zf.value && pe.value && !sn.value && !d.value && !As.value && !B.value && !Xf.value
    );
    pt(Ao, (h) => {
      At({ type: "WIDGET_SURFACE", palette: h });
    }, { immediate: !0 });
    const Jf = ae(
      () => s.value.welcome_subtitle || `Ask a question — ${r.value || "the assistant"} answers from what it knows.`
    ), Qf = ae(() => {
      var h;
      return ((h = ko.value) == null ? void 0 : h.hotkey) !== !1;
    });
    return (h, m) => {
      var Y;
      return Pt.value && Vt.value ? (w(), A("div", Av, [
        g("button", {
          type: "button",
          class: "cm-error-close",
          "aria-label": "Close chat",
          title: "Close",
          onClick: pn
        }, "×"),
        g("div", Sv, [
          m[21] || (m[21] = No('<div class="widget-unavailable-icon-wrapper" data-v-62641333><svg class="widget-unavailable-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-v-62641333><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" data-v-62641333></path><path d="M9 12l2 2 4-4" data-v-62641333></path></svg></div><h2 class="widget-unavailable-title" data-v-62641333>Chat Unavailable</h2><p class="widget-unavailable-message" data-v-62641333> This chat widget is not currently configured. Please contact the website administrator to enable chat support. </p>', 3)),
          js.value ? (w(), A("div", Ev, [
            Ft(Sr, {
              class: "chattermate-logo-small",
              size: 14
            }),
            m[20] || (m[20] = g("a", {
              class: "cm-powered-link",
              href: "https://chattermate.chat",
              target: "_blank",
              rel: "noopener"
            }, [
              g("span", { class: "cm-powered-prefix" }, "Powered by "),
              g("strong", { class: "cm-brand" }, "ChatterMate")
            ], -1))
          ])) : te("", !0)
        ])
      ])) : Pt.value ? (w(), A("div", xv, [
        g("button", {
          type: "button",
          class: "cm-error-close",
          "aria-label": "Close chat",
          title: "Close",
          onClick: pn
        }, "×"),
        g("div", Cv, [
          m[22] || (m[22] = No('<div class="auth-error-header" data-v-62641333><svg class="auth-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-62641333><circle cx="12" cy="12" r="10" data-v-62641333></circle><line x1="12" y1="8" x2="12" y2="12" data-v-62641333></line><line x1="12" y1="16" x2="12.01" y2="16" data-v-62641333></line></svg><h2 data-v-62641333>Authentication Error</h2></div>', 1)),
          g("p", Rv, J(zt.value), 1),
          g("button", {
            class: "auth-error-refresh-btn",
            onClick: m[0] || (m[0] = () => h.window.location.reload())
          }, " Refresh Page ")
        ])
      ])) : n.value && !Pt.value ? (w(), A("div", {
        key: 2,
        class: Ne(["chat-container cm-surface", [{ collapsed: !pe.value, "ask-anything-style": rn.value, aurora: qs.value }, Hf.value]]),
        style: xe({ ...E(po), ...Gf.value, ...jf.value })
      }, [
        Qe.value ? (w(), A("div", Iv, m[23] || (m[23] = [
          No('<div class="loading-spinner" data-v-62641333><div class="dot" data-v-62641333></div><div class="dot" data-v-62641333></div><div class="dot" data-v-62641333></div></div><div class="loading-text" data-v-62641333>Initializing chat...</div>', 2)
        ]))) : te("", !0),
        !Qe.value && E(O) !== "connected" ? (w(), A("div", {
          key: 1,
          class: Ne(["connection-status", E(O)])
        }, [
          E(O) === "connecting" ? (w(), A("div", Ov, m[24] || (m[24] = [
            Nn(" Connecting to chat service... ", -1),
            g("div", { class: "loading-dots" }, [
              g("div", { class: "dot" }),
              g("div", { class: "dot" }),
              g("div", { class: "dot" })
            ], -1)
          ]))) : E(O) === "failed" ? (w(), A("div", Lv, [
            m[25] || (m[25] = Nn(" Connection failed. ", -1)),
            g("button", {
              onClick: oi,
              class: "reconnect-button"
            }, " Click here to reconnect ")
          ])) : te("", !0)
        ], 2)) : te("", !0),
        E(b) ? (w(), A("div", {
          key: 2,
          class: "error-alert",
          style: xe(E(Xr))
        }, J(E(c)), 5)) : te("", !0),
        Ao.value ? (w(), ss(vg, {
          key: 3,
          messages: E(l),
          draft: Q.value,
          "agent-name": E(r),
          suggestions: yo.value,
          "welcome-title": E(s).welcome_title,
          "welcome-subtitle": Jf.value,
          placeholder: Us.value,
          "input-enabled": vn.value,
          "typing-enabled": bs.value,
          loading: E(u),
          "show-citations": ui.value,
          disclaimer: ll.value ? E(Sc) : "",
          "show-branding": js.value,
          active: hl.value,
          hotkey: Qf.value,
          "can-start-new-chat": ci.value,
          "starting-new-chat": Yn.value,
          "new-chat-armed": Zn.value,
          "new-chat-error": Xn.value,
          onNewChat: sl,
          onConfirmNewChat: rl,
          onCancelNewChat: Ws,
          "citation-label": bo,
          "citation-tooltip": cl,
          "display-text": E(re),
          "is-streaming": E(Z),
          "onUpdate:draft": m[1] || (m[1] = (p) => Q.value = p),
          onSend: tn,
          onAsk: Kn,
          onClose: pn
        }, null, 8, ["messages", "draft", "agent-name", "suggestions", "welcome-title", "welcome-subtitle", "placeholder", "input-enabled", "typing-enabled", "loading", "show-citations", "disclaimer", "show-branding", "active", "hotkey", "can-start-new-chat", "starting-new-chat", "new-chat-armed", "new-chat-error", "display-text", "is-streaming"])) : dl.value ? (w(), A("div", {
          key: 4,
          class: Ne(["welcome-message-section", { aurora: qs.value }]),
          style: xe(E(gs))
        }, [
          g("div", Nv, [
            g("div", Pv, [
              Vs.value ? (w(), A("div", {
                key: 0,
                class: "welcome-orb",
                style: xe(Ts.value)
              }, null, 4)) : E(ft) ? (w(), A("img", {
                key: 1,
                src: E(ft),
                alt: E(r),
                class: "welcome-avatar"
              }, null, 8, Mv)) : te("", !0),
              g("h1", Dv, J(E(s).welcome_title || `Welcome to ${E(r)}`), 1),
              g("p", Fv, J(E(s).welcome_subtitle || "I'm here to help you with anything you need. What can I assist you with today?"), 1)
            ])
          ]),
          g("div", $v, [
            !E(I) && !be.value && wo.value ? (w(), A("div", Bv, [
              es(g("input", {
                "onUpdate:modelValue": m[2] || (m[2] = (p) => de.value = p),
                type: "email",
                placeholder: "Enter your email address",
                disabled: E(u) || E(O) !== "connected",
                class: Ne([{
                  invalid: de.value.trim() && !E(vr)(de.value.trim()),
                  disabled: E(O) !== "connected"
                }, "welcome-email-input"])
              }, null, 10, Uv), [
                [xs, de.value]
              ])
            ])) : te("", !0),
            g("div", zv, [
              es(g("input", {
                "onUpdate:modelValue": m[3] || (m[3] = (p) => Q.value = p),
                type: "text",
                placeholder: Us.value,
                onKeypress: Gn,
                onInput: ke,
                onChange: ke,
                disabled: !bs.value,
                class: Ne([{ disabled: !bs.value }, "welcome-message-field"])
              }, null, 42, Hv), [
                [xs, Q.value]
              ]),
              g("button", {
                class: Ne(["welcome-send-button", { "aurora-send": qs.value }]),
                style: xe(E(hn)),
                onClick: tn,
                disabled: !Q.value.trim() || !vn.value || In.value
              }, [
                qs.value ? (w(), A("svg", Wv, m[26] || (m[26] = [
                  g("path", {
                    d: "M12 19V5M12 5L5 12M12 5L19 12",
                    stroke: "currentColor",
                    "stroke-width": "2",
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round"
                  }, null, -1)
                ]))) : (w(), A("svg", qv, m[27] || (m[27] = [
                  g("path", {
                    d: "M5 12L3 21L21 12L3 3L5 12ZM5 12L13 12",
                    stroke: "currentColor",
                    "stroke-width": "2",
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round"
                  }, null, -1)
                ])))
              ], 14, jv)
            ])
          ]),
          js.value ? (w(), A("div", {
            key: 0,
            class: "powered-by-welcome",
            style: xe(E(Kt))
          }, [
            Ft(Sr, {
              class: "chattermate-logo",
              size: 16
            }),
            m[28] || (m[28] = g("a", {
              class: "cm-powered-link",
              href: "https://chattermate.chat",
              target: "_blank",
              rel: "noopener"
            }, [
              g("span", { class: "cm-powered-prefix" }, "Powered by "),
              g("strong", { class: "cm-brand" }, "ChatterMate")
            ], -1))
          ], 4)) : te("", !0)
        ], 6)) : te("", !0),
        sn.value && On.value ? (w(), A("div", {
          key: 5,
          class: "landing-page-fullscreen",
          style: xe(E(gs))
        }, [
          g("div", Vv, [
            g("div", Kv, [
              g("h2", Gv, J(On.value.heading), 1),
              g("div", Yv, J(On.value.content), 1)
            ]),
            g("div", Xv, [
              g("button", {
                class: "landing-page-button",
                onClick: Pf
              }, J(G.value), 1)
            ])
          ]),
          js.value ? (w(), A("div", {
            key: 0,
            class: "powered-by-landing",
            style: xe(E(Kt))
          }, [
            Ft(Sr, {
              class: "chattermate-logo",
              size: 16
            }),
            m[29] || (m[29] = g("a", {
              class: "cm-powered-link",
              href: "https://chattermate.chat",
              target: "_blank",
              rel: "noopener"
            }, [
              g("span", { class: "cm-powered-prefix" }, "Powered by "),
              g("strong", { class: "cm-brand" }, "ChatterMate")
            ], -1))
          ], 4)) : te("", !0)
        ], 4)) : d.value && k.value ? (w(), A("div", {
          key: 6,
          class: "form-fullscreen",
          style: xe(E(gs))
        }, [
          g("div", Zv, [
            k.value.title || k.value.description ? (w(), A("div", Jv, [
              k.value.title ? (w(), A("h2", Qv, J(k.value.title), 1)) : te("", !0),
              k.value.description ? (w(), A("p", eb, J(k.value.description), 1)) : te("", !0)
            ])) : te("", !0),
            g("div", tb, [
              (w(!0), A(Re, null, dt(k.value.fields, (p) => {
                var ce, Xe;
                return w(), A("div", {
                  key: p.name,
                  class: "form-field"
                }, [
                  g("label", {
                    for: `fullscreen-form-${p.name}`,
                    class: "field-label"
                  }, [
                    Nn(J(p.label) + " ", 1),
                    p.required ? (w(), A("span", sb, "*")) : te("", !0)
                  ], 8, nb),
                  p.type === "text" || p.type === "email" || p.type === "tel" ? (w(), A("input", {
                    key: 0,
                    id: `fullscreen-form-${p.name}`,
                    type: p.type,
                    placeholder: p.placeholder || "",
                    required: p.required,
                    minlength: p.minLength,
                    maxlength: p.maxLength,
                    value: ht.value[p.name] || "",
                    onInput: (we) => We(p.name, we.target.value),
                    onBlur: (we) => We(p.name, we.target.value),
                    class: Ne(["form-input", { error: ut.value[p.name] }]),
                    autocomplete: p.type === "email" ? "email" : p.type === "tel" ? "tel" : "off",
                    inputmode: p.type === "tel" ? "tel" : p.type === "email" ? "email" : "text"
                  }, null, 42, rb)) : p.type === "number" ? (w(), A("input", {
                    key: 1,
                    id: `fullscreen-form-${p.name}`,
                    type: "number",
                    placeholder: p.placeholder || "",
                    required: p.required,
                    min: p.minLength,
                    max: p.maxLength,
                    value: ht.value[p.name] || "",
                    onInput: (we) => We(p.name, we.target.value),
                    class: Ne(["form-input", { error: ut.value[p.name] }])
                  }, null, 42, ib)) : p.type === "textarea" ? (w(), A("textarea", {
                    key: 2,
                    id: `fullscreen-form-${p.name}`,
                    placeholder: p.placeholder || "",
                    required: p.required,
                    minlength: p.minLength,
                    maxlength: p.maxLength,
                    value: ht.value[p.name] || "",
                    onInput: (we) => We(p.name, we.target.value),
                    class: Ne(["form-textarea", { error: ut.value[p.name] }]),
                    rows: "4"
                  }, null, 42, ob)) : p.type === "select" ? (w(), A("select", {
                    key: 3,
                    id: `fullscreen-form-${p.name}`,
                    required: p.required,
                    value: ht.value[p.name] || "",
                    onChange: (we) => We(p.name, we.target.value),
                    class: Ne(["form-select", { error: ut.value[p.name] }])
                  }, [
                    g("option", lb, J(p.placeholder || "Please select..."), 1),
                    (w(!0), A(Re, null, dt((Array.isArray(p.options) ? p.options : ((ce = p.options) == null ? void 0 : ce.split(`
`)) || []).filter((we) => we.trim()), (we) => (w(), A("option", {
                      key: we,
                      value: we.trim()
                    }, J(we.trim()), 9, cb))), 128))
                  ], 42, ab)) : p.type === "checkbox" ? (w(), A("label", ub, [
                    g("input", {
                      id: `fullscreen-form-${p.name}`,
                      type: "checkbox",
                      required: p.required,
                      checked: ht.value[p.name] || !1,
                      onChange: (we) => We(p.name, we.target.checked),
                      class: "form-checkbox"
                    }, null, 40, fb),
                    g("span", hb, J(p.label), 1)
                  ])) : p.type === "radio" ? (w(), A("div", db, [
                    (w(!0), A(Re, null, dt((Array.isArray(p.options) ? p.options : ((Xe = p.options) == null ? void 0 : Xe.split(`
`)) || []).filter((we) => we.trim()), (we) => (w(), A("label", {
                      key: we,
                      class: "radio-field"
                    }, [
                      g("input", {
                        type: "radio",
                        name: `fullscreen-form-${p.name}`,
                        value: we.trim(),
                        required: p.required,
                        checked: ht.value[p.name] === we.trim(),
                        onChange: (at) => We(p.name, we.trim()),
                        class: "form-radio"
                      }, null, 40, pb),
                      g("span", mb, J(we.trim()), 1)
                    ]))), 128))
                  ])) : te("", !0),
                  ut.value[p.name] ? (w(), A("div", gb, J(ut.value[p.name]), 1)) : te("", !0)
                ]);
              }), 128))
            ]),
            g("div", _b, [
              g("button", {
                onClick: m[4] || (m[4] = () => {
                  console.log("Submit button clicked!"), If();
                }),
                disabled: yt.value,
                class: "submit-form-button",
                style: xe(E(hn))
              }, [
                yt.value ? (w(), A("span", vb, m[30] || (m[30] = [
                  g("div", { class: "dot" }, null, -1),
                  g("div", { class: "dot" }, null, -1),
                  g("div", { class: "dot" }, null, -1)
                ]))) : (w(), A("span", bb, J(k.value.submit_button_text || "Submit"), 1))
              ], 12, yb)
            ])
          ]),
          js.value ? (w(), A("div", {
            key: 0,
            class: "powered-by-landing",
            style: xe(E(Kt))
          }, [
            Ft(Sr, {
              class: "chattermate-logo",
              size: 16
            }),
            m[31] || (m[31] = g("a", {
              class: "cm-powered-link",
              href: "https://chattermate.chat",
              target: "_blank",
              rel: "noopener"
            }, [
              g("span", { class: "cm-powered-prefix" }, "Powered by "),
              g("strong", { class: "cm-brand" }, "ChatterMate")
            ], -1))
          ], 4)) : te("", !0)
        ], 4)) : !dl.value && pe.value && !Ao.value ? (w(), A("div", {
          key: 7,
          class: Ne(["chat-panel", { "ask-anything-chat": rn.value }]),
          style: xe(E(gs))
        }, [
          rn.value ? (w(), A("div", {
            key: 1,
            class: "ask-anything-top",
            style: xe(E(Zr))
          }, [
            g("div", Cb, [
              ee.value || E(ft) ? (w(), A("img", {
                key: 0,
                src: ee.value || E(ft),
                alt: E(M).human_agent_name || E(r),
                class: "header-avatar"
              }, null, 8, Rb)) : te("", !0),
              g("div", Ib, [
                g("h3", {
                  style: xe(E(Kt))
                }, J(E(r)), 5),
                g("p", {
                  class: "ask-anything-subtitle",
                  style: xe(E(Kt))
                }, J(E(s).welcome_subtitle || "Ask me anything. I'm here to help."), 5)
              ])
            ])
          ], 4)) : (w(), A("div", {
            key: 0,
            class: "chat-header",
            style: xe(E(Zr))
          }, [
            g("div", {
              class: "cm-header-sheen",
              style: xe({ background: "linear-gradient(90deg, transparent, " + (E(s).accent_color || "#C9F24E") + ", transparent)" })
            }, null, 4),
            g("div", wb, [
              !ee.value && (Vs.value || !E(ft)) ? (w(), A("div", {
                key: 0,
                class: "header-orb",
                style: xe(Ts.value)
              }, null, 4)) : ee.value || E(ft) ? (w(), A("img", {
                key: 1,
                src: ee.value || E(ft),
                alt: E(M).human_agent_name || E(r),
                class: "header-avatar"
              }, null, 8, kb)) : te("", !0),
              g("div", Tb, [
                g("h3", {
                  style: xe(E(Kt))
                }, J(E(M).human_agent_name || E(r)), 5),
                g("div", Ab, [
                  g("span", {
                    class: Ne(["status-indicator", Qa.value.online ? "online" : "away"])
                  }, null, 2),
                  g("span", Sb, J(Qa.value.text), 1)
                ])
              ])
            ]),
            g("div", Eb, [
              ci.value ? (w(), A("button", {
                key: 0,
                type: "button",
                class: Ne(["header-new-chat", { armed: Zn.value }]),
                style: xe(E(Kt)),
                disabled: Yn.value,
                title: E(qi),
                "aria-label": E(qi),
                "aria-expanded": Zn.value,
                onClick: sl
              }, m[32] || (m[32] = [
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
              ]), 14, xb)) : te("", !0),
              g("button", {
                type: "button",
                class: "header-minimize",
                style: xe(E(Kt)),
                title: "Minimize",
                "aria-label": "Minimize chat",
                onClick: pn
              }, m[33] || (m[33] = [
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
          E(T) ? (w(), A("div", Ob, m[34] || (m[34] = [
            g("div", { class: "loading-spinner" }, [
              g("div", { class: "dot" }),
              g("div", { class: "dot" }),
              g("div", { class: "dot" })
            ], -1)
          ]))) : te("", !0),
          As.value ? (w(), A("div", {
            key: 3,
            class: "cm-email-gate",
            style: xe(E(gs))
          }, [
            g("div", {
              class: "cm-email-gate-orb",
              style: xe(Ts.value)
            }, null, 4),
            g("h3", Lb, J(E(s).welcome_title || "Before we start"), 1),
            m[35] || (m[35] = g("p", { class: "cm-email-gate-text" }, "Enter your email and we'll continue the chat.", -1)),
            es(g("input", {
              "onUpdate:modelValue": m[5] || (m[5] = (p) => de.value = p),
              type: "email",
              inputmode: "email",
              autocomplete: "email",
              placeholder: "you@example.com",
              class: Ne(["cm-email-gate-input", { invalid: !!Jn.value }]),
              disabled: dr.value,
              onKeyup: Si(fl, ["enter"]),
              onInput: m[6] || (m[6] = (p) => Jn.value = "")
            }, null, 42, Nb), [
              [xs, de.value]
            ]),
            Jn.value ? (w(), A("p", Pb, J(Jn.value), 1)) : te("", !0),
            g("button", {
              type: "button",
              class: "cm-email-gate-btn",
              style: xe(E(hn)),
              disabled: dr.value,
              onClick: fl
            }, J(dr.value ? "Please wait…" : "Continue to chat"), 13, Mb)
          ], 4)) : te("", !0),
          Zn.value && ci.value ? (w(), ss(lf, {
            key: 4,
            busy: Yn.value,
            error: Xn.value,
            onConfirm: rl,
            onCancel: Ws
          }, null, 8, ["busy", "error"])) : te("", !0),
          es(g("div", {
            class: "chat-messages",
            ref_key: "messagesContainer",
            ref: Wn,
            role: "log",
            "aria-label": "Messages"
          }, [
            E(Nt) ? (w(), ss(p_, {
              key: 0,
              progress: E(Nt),
              onSkip: E(v),
              onHide: E(L)
            }, null, 8, ["progress", "onSkip", "onHide"])) : te("", !0),
            Wf.value ? (w(), A("div", Db, [
              g("div", Fb, [
                Vs.value || !E(ft) ? (w(), A("div", {
                  key: 0,
                  class: "cm-welcome-orb",
                  style: xe(Ts.value)
                }, null, 4)) : (w(), A("img", {
                  key: 1,
                  src: E(ft),
                  alt: E(r),
                  class: "cm-welcome-avatar"
                }, null, 8, $b)),
                g("div", {
                  class: "message-bubble cm-welcome-bubble",
                  style: xe(E(Rn))
                }, J(ol.value), 5)
              ])
            ])) : te("", !0),
            (w(!0), A(Re, null, dt(E(l), (p, ce) => {
              var Xe, we, at, et, pr, mr, Qn, Ks, pl, ml, gl, _l, yl, vl, bl, wl, kl, Tl, Al, Sl;
              return w(), A(Re, { key: ce }, [
                E(K).isBefore(p) ? (w(), A("div", Bb, [
                  Vs.value || !E(ft) ? (w(), A("div", {
                    key: 0,
                    class: "cm-welcome-orb",
                    style: xe(Ts.value)
                  }, null, 4)) : (w(), A("img", {
                    key: 1,
                    src: E(ft),
                    alt: E(r),
                    class: "cm-welcome-avatar"
                  }, null, 8, Ub)),
                  g("div", {
                    class: "message-bubble cm-welcome-bubble",
                    style: xe(E(Rn))
                  }, J((Xe = V.value) == null ? void 0 : Xe.message), 5)
                ])) : te("", !0),
                g("div", {
                  class: Ne([
                    "message",
                    p.message_type === "bot" || p.message_type === "agent" ? "agent-message" : p.message_type === "system" ? "system-message" : p.message_type === "rating" ? "rating-message" : p.message_type === "form" ? "form-message" : p.message_type === "product" || p.shopify_output ? "product-message" : "user-message"
                  ])
                }, [
                  p.message_type === "bot" || p.message_type === "agent" ? (w(), A("div", zb, [
                    ee.value ? (w(), A("img", {
                      key: 0,
                      src: ee.value,
                      class: "cm-msg-avatar-img",
                      alt: ""
                    }, null, 8, Hb)) : !Vs.value && E(ft) ? (w(), A("img", {
                      key: 1,
                      src: E(ft),
                      class: "cm-msg-avatar-img",
                      alt: ""
                    }, null, 8, jb)) : (w(), A("div", {
                      key: 2,
                      class: "cm-msg-avatar-orb",
                      style: xe(Ts.value)
                    }, null, 4))
                  ])) : te("", !0),
                  g("div", Wb, [
                    g("div", {
                      class: "message-bubble",
                      style: xe(p.message_type === "system" || p.message_type === "rating" || p.message_type === "form" || p.message_type === "product" || p.shopify_output ? {} : p.message_type === "user" ? E(hn) : E(Rn))
                    }, [
                      p.message_type === "rating" ? (w(), A("div", qb, [
                        g("p", Vb, "Rate the chat session that you had with " + J(p.agent_name || E(M).human_agent_name || E(r) || "our agent"), 1),
                        g("div", {
                          class: Ne(["star-rating", { submitted: Gt.value || p.isSubmitted }])
                        }, [
                          (w(), A(Re, null, dt(5, (F) => g("button", {
                            key: F,
                            class: Ne(["star-button", {
                              warning: F <= (p.isSubmitted ? p.finalRating : nn.value || p.selectedRating) && (p.isSubmitted ? p.finalRating : nn.value || p.selectedRating) <= 3,
                              success: F <= (p.isSubmitted ? p.finalRating : nn.value || p.selectedRating) && (p.isSubmitted ? p.finalRating : nn.value || p.selectedRating) > 3,
                              selected: F <= (p.isSubmitted ? p.finalRating : nn.value || p.selectedRating)
                            }]),
                            onMouseover: (Yt) => !p.isSubmitted && ve(F),
                            onMouseleave: (Yt) => !p.isSubmitted && Ye,
                            onClick: (Yt) => !p.isSubmitted && ot(F),
                            disabled: Gt.value || p.isSubmitted
                          }, " ★ ", 42, Kb)), 64))
                        ], 2),
                        p.showFeedback && !p.isSubmitted ? (w(), A("div", Gb, [
                          g("div", Yb, [
                            es(g("input", {
                              "onUpdate:modelValue": (F) => p.feedback = F,
                              placeholder: "Please share your feedback (optional)",
                              disabled: Gt.value,
                              maxlength: "500",
                              class: "feedback-input"
                            }, null, 8, Xb), [
                              [xs, p.feedback]
                            ]),
                            g("div", Zb, J(((we = p.feedback) == null ? void 0 : we.length) || 0) + "/500", 1)
                          ]),
                          g("button", {
                            onClick: (F) => Et(p.session_id, nn.value, p.feedback),
                            disabled: Gt.value || !nn.value,
                            class: "submit-rating-button",
                            style: xe({ backgroundColor: E(s).accent_color || "var(--accent-solid)" })
                          }, J(Gt.value ? "Submitting..." : "Submit Rating"), 13, Jb)
                        ])) : te("", !0),
                        p.isSubmitted && p.finalFeedback ? (w(), A("div", Qb, [
                          g("div", ew, [
                            g("p", tw, J(p.finalFeedback), 1)
                          ])
                        ])) : p.isSubmitted ? (w(), A("div", nw, " Thank you for your rating! ")) : te("", !0)
                      ])) : p.message_type === "form" ? (w(), A("div", sw, [
                        (et = (at = p.attributes) == null ? void 0 : at.form_data) != null && et.title || (mr = (pr = p.attributes) == null ? void 0 : pr.form_data) != null && mr.description ? (w(), A("div", rw, [
                          (Ks = (Qn = p.attributes) == null ? void 0 : Qn.form_data) != null && Ks.title ? (w(), A("h3", iw, J(p.attributes.form_data.title), 1)) : te("", !0),
                          (ml = (pl = p.attributes) == null ? void 0 : pl.form_data) != null && ml.description ? (w(), A("p", ow, J(p.attributes.form_data.description), 1)) : te("", !0)
                        ])) : te("", !0),
                        g("div", aw, [
                          (w(!0), A(Re, null, dt((_l = (gl = p.attributes) == null ? void 0 : gl.form_data) == null ? void 0 : _l.fields, (F) => {
                            var Yt, So;
                            return w(), A("div", {
                              key: F.name,
                              class: "form-field"
                            }, [
                              g("label", {
                                for: `form-${F.name}`,
                                class: "field-label"
                              }, [
                                Nn(J(F.label) + " ", 1),
                                F.required ? (w(), A("span", cw, "*")) : te("", !0)
                              ], 8, lw),
                              F.type === "text" || F.type === "email" || F.type === "tel" ? (w(), A("input", {
                                key: 0,
                                id: `form-${F.name}`,
                                type: F.type,
                                placeholder: F.placeholder || "",
                                required: F.required,
                                minlength: F.minLength,
                                maxlength: F.maxLength,
                                value: ht.value[F.name] || "",
                                onInput: (qe) => We(F.name, qe.target.value),
                                onBlur: (qe) => We(F.name, qe.target.value),
                                class: Ne(["form-input", { error: ut.value[F.name] }]),
                                disabled: yt.value,
                                autocomplete: F.type === "email" ? "email" : F.type === "tel" ? "tel" : "off",
                                inputmode: F.type === "tel" ? "tel" : F.type === "email" ? "email" : "text"
                              }, null, 42, uw)) : F.type === "number" ? (w(), A("input", {
                                key: 1,
                                id: `form-${F.name}`,
                                type: "number",
                                placeholder: F.placeholder || "",
                                required: F.required,
                                min: F.min,
                                max: F.max,
                                value: ht.value[F.name] || "",
                                onInput: (qe) => We(F.name, qe.target.value),
                                class: Ne(["form-input", { error: ut.value[F.name] }]),
                                disabled: yt.value
                              }, null, 42, fw)) : F.type === "textarea" ? (w(), A("textarea", {
                                key: 2,
                                id: `form-${F.name}`,
                                placeholder: F.placeholder || "",
                                required: F.required,
                                minlength: F.minLength,
                                maxlength: F.maxLength,
                                value: ht.value[F.name] || "",
                                onInput: (qe) => We(F.name, qe.target.value),
                                class: Ne(["form-textarea", { error: ut.value[F.name] }]),
                                disabled: yt.value,
                                rows: "3"
                              }, null, 42, hw)) : F.type === "select" ? (w(), A("select", {
                                key: 3,
                                id: `form-${F.name}`,
                                required: F.required,
                                value: ht.value[F.name] || "",
                                onChange: (qe) => We(F.name, qe.target.value),
                                class: Ne(["form-select", { error: ut.value[F.name] }]),
                                disabled: yt.value
                              }, [
                                g("option", pw, J(F.placeholder || "Select an option"), 1),
                                (w(!0), A(Re, null, dt((Array.isArray(F.options) ? F.options : ((Yt = F.options) == null ? void 0 : Yt.split(`
`)) || []).filter((qe) => qe.trim()), (qe) => (w(), A("option", {
                                  key: qe.trim(),
                                  value: qe.trim()
                                }, J(qe.trim()), 9, mw))), 128))
                              ], 42, dw)) : F.type === "checkbox" ? (w(), A("div", gw, [
                                g("input", {
                                  id: `form-${F.name}`,
                                  type: "checkbox",
                                  checked: ht.value[F.name] || !1,
                                  onChange: (qe) => We(F.name, qe.target.checked),
                                  class: "form-checkbox",
                                  disabled: yt.value
                                }, null, 40, _w),
                                g("label", {
                                  for: `form-${F.name}`,
                                  class: "checkbox-label"
                                }, J(F.placeholder || F.label), 9, yw)
                              ])) : F.type === "radio" ? (w(), A("div", vw, [
                                (w(!0), A(Re, null, dt((Array.isArray(F.options) ? F.options : ((So = F.options) == null ? void 0 : So.split(`
`)) || []).filter((qe) => qe.trim()), (qe) => (w(), A("div", {
                                  key: qe.trim(),
                                  class: "radio-option"
                                }, [
                                  g("input", {
                                    id: `form-${F.name}-${qe.trim()}`,
                                    name: `form-${F.name}`,
                                    type: "radio",
                                    value: qe.trim(),
                                    checked: ht.value[F.name] === qe.trim(),
                                    onChange: (H0) => We(F.name, qe.trim()),
                                    class: "form-radio",
                                    disabled: yt.value
                                  }, null, 40, bw),
                                  g("label", {
                                    for: `form-${F.name}-${qe.trim()}`,
                                    class: "radio-label"
                                  }, J(qe.trim()), 9, ww)
                                ]))), 128))
                              ])) : te("", !0),
                              ut.value[F.name] ? (w(), A("div", kw, J(ut.value[F.name]), 1)) : te("", !0)
                            ]);
                          }), 128))
                        ]),
                        g("div", Tw, [
                          g("button", {
                            onClick: () => {
                              var F;
                              console.log("Regular form submit button clicked!"), fr((F = p.attributes) == null ? void 0 : F.form_data);
                            },
                            disabled: yt.value,
                            class: "form-submit-button",
                            style: xe(E(hn))
                          }, J(yt.value ? "Submitting..." : ((vl = (yl = p.attributes) == null ? void 0 : yl.form_data) == null ? void 0 : vl.submit_button_text) || "Submit"), 13, Aw)
                        ])
                      ])) : p.message_type === "user_input" ? (w(), A("div", Sw, [
                        (bl = p.attributes) != null && bl.prompt_message && p.attributes.prompt_message.trim() ? (w(), A("div", Ew, J(p.attributes.prompt_message), 1)) : te("", !0),
                        p.isSubmitted ? (w(), A("div", Iw, [
                          m[36] || (m[36] = g("strong", null, "Your input:", -1)),
                          Nn(" " + J(p.submittedValue) + " ", 1),
                          (wl = p.attributes) != null && wl.confirmation_message && p.attributes.confirmation_message.trim() ? (w(), A("div", Ow, J(p.attributes.confirmation_message), 1)) : te("", !0)
                        ])) : (w(), A("div", xw, [
                          es(g("textarea", {
                            "onUpdate:modelValue": (F) => p.userInputValue = F,
                            class: "user-input-textarea",
                            placeholder: "Type your message here...",
                            rows: "3",
                            onKeydown: [
                              Si(Is((F) => _o(p), ["ctrl"]), ["enter"]),
                              Si(Is((F) => _o(p), ["meta"]), ["enter"])
                            ]
                          }, null, 40, Cw), [
                            [xs, p.userInputValue]
                          ]),
                          g("button", {
                            class: "user-input-submit-button",
                            onClick: (F) => _o(p),
                            disabled: !p.userInputValue || !p.userInputValue.trim()
                          }, " Submit ", 8, Rw)
                        ]))
                      ])) : p.shopify_output || p.message_type === "product" ? (w(), A("div", Lw, [
                        p.message ? (w(), A("div", {
                          key: 0,
                          innerHTML: E(xi)(((Tl = (kl = p.shopify_output) == null ? void 0 : kl.products) == null ? void 0 : Tl.length) > 0 ? Lf(p.message) : p.message),
                          class: "product-message-text"
                        }, null, 8, Nw)) : te("", !0),
                        (Al = p.shopify_output) != null && Al.products && p.shopify_output.products.length > 0 ? (w(), A("div", Pw, [
                          m[38] || (m[38] = g("h3", { class: "carousel-title" }, "Products", -1)),
                          g("div", Mw, [
                            (w(!0), A(Re, null, dt(p.shopify_output.products, (F) => {
                              var Yt;
                              return w(), A("div", {
                                key: F.id,
                                class: "product-card-compact carousel-item"
                              }, [
                                (Yt = F.image) != null && Yt.src ? (w(), A("div", Dw, [
                                  g("img", {
                                    src: F.image.src,
                                    alt: F.title,
                                    class: "product-thumbnail"
                                  }, null, 8, Fw)
                                ])) : te("", !0),
                                g("div", $w, [
                                  g("div", Bw, [
                                    g("div", Uw, J(F.title), 1),
                                    F.variant_title && F.variant_title !== "Default Title" ? (w(), A("div", zw, J(F.variant_title), 1)) : te("", !0),
                                    g("div", Hw, J(F.price_formatted || E(a)(F.price, F.currency)), 1)
                                  ]),
                                  g("div", jw, [
                                    g("button", {
                                      class: "view-details-button-compact",
                                      onClick: (So) => {
                                        var qe;
                                        return Of(F, (qe = p.shopify_output) == null ? void 0 : qe.shop_domain);
                                      }
                                    }, m[37] || (m[37] = [
                                      Nn(" View product ", -1),
                                      g("span", { class: "external-link-icon" }, "↗", -1)
                                    ]), 8, Ww)
                                  ])
                                ])
                              ]);
                            }), 128))
                          ])
                        ])) : !p.message && ((Sl = p.shopify_output) != null && Sl.products) && p.shopify_output.products.length === 0 ? (w(), A("div", qw, m[39] || (m[39] = [
                          g("p", null, "No products found.", -1)
                        ]))) : !p.message && p.shopify_output && !p.shopify_output.products ? (w(), A("div", Vw, m[40] || (m[40] = [
                          g("p", null, "No products to display.", -1)
                        ]))) : te("", !0)
                      ])) : (w(), A(Re, { key: 4 }, [
                        E(Z)(ce) ? (w(), A("div", {
                          key: 0,
                          class: "message-streaming",
                          innerHTML: E(xi)(E(re)(ce, p.message))
                        }, null, 8, Kw)) : (w(), A("div", {
                          key: 1,
                          innerHTML: E(xi)(p.message)
                        }, null, 8, Gw)),
                        p.attachments && p.attachments.length > 0 ? (w(), A("div", Yw, [
                          (w(!0), A(Re, null, dt(p.attachments, (F) => (w(), A("div", {
                            key: F.id,
                            class: "attachment-item"
                          }, [
                            E(lr)(F.content_type) ? (w(), A("div", Xw, [
                              g("img", {
                                src: E(ys)(F.file_url),
                                alt: F.filename,
                                class: "attachment-image",
                                onClick: Is((Yt) => E(Vn)({ url: F.file_url, filename: F.filename, type: F.content_type, file_url: E(ys)(F.file_url), size: void 0 }), ["stop"]),
                                style: { cursor: "pointer" }
                              }, null, 8, Zw),
                              g("div", Jw, [
                                g("a", {
                                  href: E(ys)(F.file_url),
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
                                    g("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
                                    g("polyline", { points: "7 10 12 15 17 10" }),
                                    g("line", {
                                      x1: "12",
                                      y1: "15",
                                      x2: "12",
                                      y2: "3"
                                    })
                                  ], -1)),
                                  Nn(" " + J(F.filename) + " ", 1),
                                  g("span", e0, "(" + J(E(Bs)(F.file_size)) + ")", 1)
                                ], 8, Qw)
                              ])
                            ])) : (w(), A("a", {
                              key: 1,
                              href: E(ys)(F.file_url),
                              target: "_blank",
                              class: "attachment-link"
                            }, [
                              m[42] || (m[42] = g("svg", {
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
                              Nn(" " + J(F.filename) + " ", 1),
                              g("span", n0, "(" + J(E(Bs)(F.file_size)) + ")", 1)
                            ], 8, t0))
                          ]))), 128))
                        ])) : te("", !0)
                      ], 64))
                    ], 4),
                    ui.value && (p.message_type === "bot" || p.message_type === "agent") && p.sources && p.sources.length ? (w(), A("div", s0, [
                      m[43] || (m[43] = g("span", { class: "citation-label" }, "Sources", -1)),
                      (w(!0), A(Re, null, dt(p.sources, (F, Yt) => (w(), A("span", {
                        key: Yt,
                        class: "citation-chip",
                        title: cl(F)
                      }, J(bo(F)), 9, r0))), 128))
                    ])) : te("", !0),
                    g("div", i0, [
                      p.message_type === "user" ? (w(), A("span", o0, " You ")) : te("", !0)
                    ])
                  ])
                ], 2),
                (w(!0), A(Re, null, dt(E(Me)(ce + 1), (F, Yt) => (w(), ss(Xg, {
                  key: `receipt-${ce}-${Yt}`,
                  receipt: F
                }, null, 8, ["receipt"]))), 128))
              ], 64);
            }), 128)),
            E(K).isLast() ? (w(), A("div", a0, [
              Vs.value || !E(ft) ? (w(), A("div", {
                key: 0,
                class: "cm-welcome-orb",
                style: xe(Ts.value)
              }, null, 4)) : (w(), A("img", {
                key: 1,
                src: E(ft),
                alt: E(r),
                class: "cm-welcome-avatar"
              }, null, 8, l0)),
              g("div", {
                class: "message-bubble cm-welcome-bubble",
                style: xe(E(Rn))
              }, J((Y = V.value) == null ? void 0 : Y.message), 5)
            ])) : te("", !0),
            P.value.length ? (w(), ss(y_, {
              key: 3,
              chips: P.value,
              disabled: !vn.value || E(yn),
              onPick: U
            }, null, 8, ["chips", "disabled"])) : te("", !0),
            E(bt) ? (w(), ss(jg, {
              key: 4,
              pending: E(bt),
              onApprove: E(Ut),
              onDecline: E(Wt)
            }, null, 8, ["pending", "onApprove", "onDecline"])) : te("", !0),
            E(u) && !E(bt) ? (w(), A("div", {
              key: 5,
              class: Ne(["typing-indicator", { "reading-indicator": ui.value }])
            }, [
              ui.value ? (w(), A(Re, { key: 0 }, [
                m[44] || (m[44] = g("div", {
                  class: "reading-bars",
                  "aria-hidden": "true"
                }, [
                  g("span"),
                  g("span"),
                  g("span")
                ], -1)),
                m[45] || (m[45] = g("span", { class: "reading-label" }, "reading knowledge base", -1))
              ], 64)) : (w(), A("div", {
                key: 1,
                class: "cm-typing-bubble",
                style: xe(E(Rn))
              }, m[46] || (m[46] = [
                g("span", { class: "cm-typing-dot" }, null, -1),
                g("span", { class: "cm-typing-dot" }, null, -1),
                g("span", { class: "cm-typing-dot" }, null, -1)
              ]), 4))
            ], 2)) : te("", !0)
          ], 512), [
            [Qd, !As.value]
          ]),
          qf.value ? (w(), A("div", c0, [
            (w(!0), A(Re, null, dt(yo.value, (p) => (w(), A("button", {
              key: p,
              type: "button",
              class: "cm-quick-action",
              disabled: !vn.value,
              onClick: (ce) => Kn(p)
            }, J(p), 9, u0))), 128))
          ])) : te("", !0),
          !B.value && !As.value ? (w(), A("div", {
            key: 6,
            class: Ne(["chat-input", { "ask-anything-input": rn.value }])
          }, [
            g("input", {
              ref_key: "fileInputRef",
              ref: Jr,
              type: "file",
              accept: $0,
              multiple: "",
              style: { display: "none" },
              onChange: m[7] || (m[7] = //@ts-ignore
              (...p) => E(Qr) && E(Qr)(...p))
            }, null, 544),
            E($e).length > 0 ? (w(), A("div", f0, [
              (w(!0), A(Re, null, dt(E($e), (p, ce) => (w(), A("div", {
                key: ce,
                class: "file-preview-widget"
              }, [
                g("div", h0, [
                  E(vs)(p.type) ? (w(), A("img", {
                    key: 0,
                    src: E(cr)(p),
                    alt: p.filename,
                    class: "file-preview-image-widget",
                    onClick: Is((Xe) => E(Vn)(p), ["stop"]),
                    style: { cursor: "pointer" }
                  }, null, 8, d0)) : (w(), A("div", {
                    key: 1,
                    class: "file-preview-icon-widget",
                    onClick: Is((Xe) => E(Vn)(p), ["stop"]),
                    style: { cursor: "pointer" }
                  }, m[47] || (m[47] = [
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
                  ]), 8, p0))
                ]),
                g("div", m0, [
                  g("div", g0, J(p.filename), 1),
                  g("div", _0, J(E(Bs)(p.size)), 1)
                ]),
                g("button", {
                  type: "button",
                  class: "file-preview-remove-widget",
                  onClick: (Xe) => E(si)(ce),
                  title: "Remove file"
                }, " × ", 8, y0)
              ]))), 128))
            ])) : te("", !0),
            Ja.value ? (w(), A("div", v0, m[48] || (m[48] = [
              g("div", { class: "upload-spinner-widget" }, null, -1),
              g("span", { class: "upload-text-widget" }, "Uploading files...", -1)
            ]))) : te("", !0),
            g("div", b0, [
              es(g("input", {
                "onUpdate:modelValue": m[8] || (m[8] = (p) => Q.value = p),
                type: "text",
                placeholder: Us.value,
                onKeypress: Gn,
                onInput: ke,
                onChange: ke,
                onPaste: m[9] || (m[9] = //@ts-ignore
                (...p) => E(dn) && E(dn)(...p)),
                onDrop: m[10] || (m[10] = //@ts-ignore
                (...p) => E(ei) && E(ei)(...p)),
                onDragover: m[11] || (m[11] = //@ts-ignore
                (...p) => E(ti) && E(ti)(...p)),
                onDragleave: m[12] || (m[12] = //@ts-ignore
                (...p) => E(ni) && E(ni)(...p)),
                disabled: !bs.value,
                class: Ne({ disabled: !bs.value, "ask-anything-field": rn.value })
              }, null, 42, w0), [
                [xs, Q.value]
              ]),
              Nf.value ? (w(), A("button", {
                key: 0,
                type: "button",
                class: "attach-button",
                disabled: Ja.value,
                onClick: m[13] || (m[13] = //@ts-ignore
                (...p) => E(ri) && E(ri)(...p)),
                title: `Attach files (${E($e).length}/${Uc} used) or paste screenshots`
              }, m[49] || (m[49] = [
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
              ]), 8, k0)) : te("", !0),
              g("button", {
                class: Ne(["send-button", { "ask-anything-send": rn.value }]),
                "aria-label": "Send message",
                style: xe(E(hn)),
                onClick: tn,
                disabled: !Q.value.trim() && E($e).length === 0 || !vn.value || In.value
              }, m[50] || (m[50] = [
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
              ]), 14, T0)
            ]),
            In.value ? (w(), A("p", A0, J(E(b_)), 1)) : te("", !0)
          ], 2)) : B.value && !As.value ? (w(), A("div", S0, [
            g("div", E0, [
              m[51] || (m[51] = g("p", { class: "ended-text" }, "This chat has ended.", -1)),
              g("button", {
                class: "start-new-conversation-button",
                style: xe(E(hn)),
                onClick: Uf
              }, " Click here to start a new conversation ", 4)
            ])
          ])) : te("", !0),
          ll.value ? (w(), A("div", x0, J(E(Sc)), 1)) : te("", !0),
          js.value ? (w(), A("div", {
            key: 9,
            class: "powered-by",
            style: xe(E(Kt))
          }, [
            Ft(Sr, {
              class: "chattermate-logo",
              size: 16
            }),
            m[52] || (m[52] = g("a", {
              class: "cm-powered-link",
              href: "https://chattermate.chat",
              target: "_blank",
              rel: "noopener"
            }, [
              g("span", { class: "cm-powered-prefix" }, "Powered by "),
              g("strong", { class: "cm-brand" }, "ChatterMate")
            ], -1))
          ], 4)) : te("", !0)
        ], 6)) : te("", !0),
        ur.value ? (w(), A("div", C0, [
          g("div", R0, [
            m[53] || (m[53] = g("h3", null, "Rate your conversation", -1)),
            g("div", I0, [
              (w(), A(Re, null, dt(5, (p) => g("button", {
                key: p,
                onClick: (ce) => ws.value = p,
                class: Ne([{ active: p <= ws.value }, "star-button"])
              }, " ★ ", 10, O0)), 64))
            ]),
            es(g("textarea", {
              "onUpdate:modelValue": m[14] || (m[14] = (p) => Hs.value = p),
              placeholder: "Additional feedback (optional)",
              class: "rating-feedback"
            }, null, 512), [
              [xs, Hs.value]
            ]),
            g("div", L0, [
              g("button", {
                onClick: m[15] || (m[15] = (p) => h.submitRating(ws.value, Hs.value)),
                disabled: !ws.value,
                class: "submit-button",
                style: xe(E(hn))
              }, " Submit ", 12, N0),
              g("button", {
                onClick: m[16] || (m[16] = (p) => ur.value = !1),
                class: "skip-rating"
              }, " Skip ")
            ])
          ])
        ])) : te("", !0),
        E(qn) ? (w(), A("div", {
          key: 9,
          class: "preview-modal-overlay",
          onClick: m[19] || (m[19] = //@ts-ignore
          (...p) => E(en) && E(en)(...p))
        }, [
          g("div", {
            class: "preview-modal-content",
            onClick: m[18] || (m[18] = Is(() => {
            }, ["stop"]))
          }, [
            g("button", {
              class: "preview-modal-close",
              onClick: m[17] || (m[17] = //@ts-ignore
              (...p) => E(en) && E(en)(...p))
            }, "×"),
            E(_s) && E(vs)(E(_s).type) ? (w(), A("div", P0, [
              g("img", {
                src: E(cr)(E(_s)),
                alt: E(_s).filename,
                class: "preview-modal-image"
              }, null, 8, M0),
              g("div", D0, J(E(_s).filename), 1)
            ])) : te("", !0)
          ])
        ])) : te("", !0)
      ], 6)) : (w(), A("div", F0));
    };
  }
}), U0 = /* @__PURE__ */ ms(B0, [["__scopeId", "data-v-62641333"]]);
window.process || (window.process = { env: { NODE_ENV: "production" } });
async function z0() {
  if (!await U_()) return;
  const e = window.__INITIAL_DATA__, t = new URL(window.location.href), n = t.searchParams.get("preview") === "true", s = (a) => {
    const l = t.searchParams.get(a);
    if (!(!l || l === "undefined" || l.trim() === ""))
      return l;
  }, r = n ? s("widget_id") || (e == null ? void 0 : e.widgetId) || void 0 : (e == null ? void 0 : e.widgetId) || void 0, i = n ? (e == null ? void 0 : e.initialToken) || s("token") || void 0 : (e == null ? void 0 : e.initialToken) || void 0;
  vp(U0, {
    widgetId: r,
    token: i || void 0,
    initialAuthError: null
    // Let backend determine if auth is required
  }).mount("#app"), z_();
}
z0();
