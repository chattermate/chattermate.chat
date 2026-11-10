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
}, sh = Object.prototype.hasOwnProperty, Ke = (e, t) => sh.call(e, t), Se = Array.isArray, Qs = (e) => Zi(e) === "[object Map]", zc = (e) => Zi(e) === "[object Set]", xe = (e) => typeof e == "function", gt = (e) => typeof e == "string", hs = (e) => typeof e == "symbol", ct = (e) => e !== null && typeof e == "object", Hc = (e) => (ct(e) || xe(e)) && xe(e.then) && xe(e.catch), jc = Object.prototype.toString, Zi = (e) => jc.call(e), rh = (e) => Zi(e).slice(8, -1), Wc = (e) => Zi(e) === "[object Object]", Aa = (e) => gt(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, Or = /* @__PURE__ */ wa(
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
function Ee(e) {
  if (Se(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
      const s = e[n], r = gt(s) ? uh(s) : Ee(s);
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
function Le(e) {
  let t = "";
  if (gt(e))
    t = e;
  else if (Se(e))
    for (let n = 0; n < e.length; n++) {
      const s = Le(e[n]);
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
const Kc = (e) => !!(e && e.__v_isRef === !0), Z = (e) => gt(e) ? e : e == null ? "" : Se(e) || ct(e) && (e.toString === jc || !xe(e.toString)) ? Kc(e) ? Z(e.value) : JSON.stringify(e, Gc, 2) : String(e), Gc = (e, t) => Kc(t) ? Gc(e, t.value) : Qs(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (n, [s, r], i) => (n[xo(s, i) + " =>"] = r, n),
    {}
  )
} : zc(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((n) => xo(n))
} : hs(t) ? xo(t) : ct(t) && !Se(t) && !Wc(t) ? String(t) : t, xo = (e, t = "") => {
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
let zt;
class dh {
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
function ph() {
  return zt;
}
let it;
const Co = /* @__PURE__ */ new WeakSet();
class Yc {
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
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Zc(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, xl(this), Jc(this);
    const t = it, n = _n;
    it = this, _n = !0;
    try {
      return this.fn();
    } finally {
      Qc(this), it = t, _n = n, this.flags &= -3;
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
  const t = e.dep, n = it, s = _n;
  it = e, _n = !0;
  try {
    Jc(e);
    const r = e.fn(e._value);
    (t.version === 0 || os(r, e._value)) && (e.flags |= 128, e._value = r, t.version++);
  } catch (r) {
    throw t.version++, r;
  } finally {
    it = n, _n = s, Qc(e), e.flags &= -3;
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
let _n = !0;
const tu = [];
function Bn() {
  tu.push(_n), _n = !1;
}
function Un() {
  const e = tu.pop();
  _n = e === void 0 ? !0 : e;
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
    if (!it || !_n || it === this.computed)
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
  if (_n && it) {
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
    const l = Se(e), f = l && Aa(n);
    if (l && n === "length") {
      const u = Number(s);
      o.forEach((b, T) => {
        (T === "length" || T === zr || !hs(T) && T >= u) && a(b);
      });
    } else
      switch ((n !== void 0 || o.has(void 0)) && a(o.get(n)), f && a(o.get(zr)), t) {
        case "add":
          l ? f && a(o.get("length")) : (a(o.get(Ps)), Qs(e) && a(o.get(na)));
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
  const t = Ue(e);
  return t === e ? t : (Rt(t, "iterate", zr), fn(e) ? t : t.map(St));
}
function eo(e) {
  return Rt(e = Ue(e), "iterate", zr), e;
}
const _h = {
  __proto__: null,
  [Symbol.iterator]() {
    return Ro(this, Symbol.iterator, St);
  },
  concat(...e) {
    return Gs(this).concat(
      ...e.map((t) => Se(t) ? Gs(t) : t)
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
  return s !== e && !fn(e) && (r._next = r.next, r.next = () => {
    const i = r._next();
    return i.value && (i.value = n(i.value)), i;
  }), r;
}
const yh = Array.prototype;
function Ln(e, t, n, s, r, i) {
  const o = eo(e), a = o !== e && !fn(e), l = o[t];
  if (l !== yh[t]) {
    const b = l.apply(e, i);
    return a ? St(b) : b;
  }
  let f = n;
  o !== e && (a ? f = function(b, T) {
    return n.call(this, St(b), T, e);
  } : n.length > 2 && (f = function(b, T) {
    return n.call(this, b, T, e);
  }));
  const u = l.call(o, f, s);
  return a && r ? r(u) : u;
}
function Cl(e, t, n, s) {
  const r = eo(e);
  let i = n;
  return r !== e && (fn(e) ? n.length > 3 && (i = function(o, a, l) {
    return n.call(this, o, a, l, e);
  }) : i = function(o, a, l) {
    return n.call(this, o, St(a), l, e);
  }), r[t](i, ...s);
}
function Io(e, t, n) {
  const s = Ue(e);
  Rt(s, "iterate", zr);
  const r = s[t](...n);
  return (r === -1 || r === !1) && Oa(n[0]) ? (n[0] = Ue(n[0]), s[t](...n)) : r;
}
function gr(e, t, n = []) {
  Bn(), Sa();
  const s = Ue(e)[t].apply(e, n);
  return Ea(), Un(), s;
}
const vh = /* @__PURE__ */ wa("__proto__,__v_isRef,__isVue"), su = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(hs)
);
function bh(e) {
  hs(e) || (e = String(e));
  const t = Ue(this);
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
    const o = Se(t);
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
      if (!fn(s) && !us(s) && (i = Ue(i), s = Ue(s)), !Se(t) && It(i) && !It(s))
        return l ? !1 : (i.value = s, !0);
    }
    const o = Se(t) && Aa(n) ? Number(n) < t.length : Ke(t, n), a = Reflect.set(
      t,
      n,
      s,
      It(t) ? t : r
    );
    return t === Ue(r) && (o ? os(s, i) && Mn(t, "set", n, s) : Mn(t, "add", n, s)), a;
  }
  deleteProperty(t, n) {
    const s = Ke(t, n);
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
      Se(t) ? "length" : Ps
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
    const r = this.__v_raw, i = Ue(r), o = Qs(i), a = e === "entries" || e === Symbol.iterator && o, l = e === "keys" && o, f = r[e](...s), u = n ? sa : t ? Mi : St;
    return !t && Rt(
      i,
      "iterate",
      l ? na : Ps
    ), {
      // iterator protocol
      next() {
        const { value: b, done: T } = f.next();
        return T ? { value: b, done: T } : {
          value: a ? [u(b[0]), u(b[1])] : u(b),
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
      const i = this.__v_raw, o = Ue(i), a = Ue(r);
      e || (os(r, a) && Rt(o, "get", r), Rt(o, "get", a));
      const { has: l } = hi(o), f = t ? sa : e ? Mi : St;
      if (l.call(o, r))
        return f(i.get(r));
      if (l.call(o, a))
        return f(i.get(a));
      i !== o && i.get(r);
    },
    get size() {
      const r = this.__v_raw;
      return !e && Rt(Ue(r), "iterate", Ps), Reflect.get(r, "size", r);
    },
    has(r) {
      const i = this.__v_raw, o = Ue(i), a = Ue(r);
      return e || (os(r, a) && Rt(o, "has", r), Rt(o, "has", a)), r === a ? i.has(r) : i.has(r) || i.has(a);
    },
    forEach(r, i) {
      const o = this, a = o.__v_raw, l = Ue(a), f = t ? sa : e ? Mi : St;
      return !e && Rt(l, "iterate", Ps), a.forEach((u, b) => r.call(i, f(u), f(b), o));
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
        !t && !fn(r) && !us(r) && (r = Ue(r));
        const i = Ue(this);
        return hi(i).has.call(i, r) || (i.add(r), Mn(i, "add", r, r)), this;
      },
      set(r, i) {
        !t && !fn(i) && !us(i) && (i = Ue(i));
        const o = Ue(this), { has: a, get: l } = hi(o);
        let f = a.call(o, r);
        f || (r = Ue(r), f = a.call(o, r));
        const u = l.call(o, r);
        return o.set(r, i), f ? os(i, u) && Mn(o, "set", r, i) : Mn(o, "add", r, i), this;
      },
      delete(r) {
        const i = Ue(this), { has: o, get: a } = hi(i);
        let l = o.call(i, r);
        l || (r = Ue(r), l = o.call(i, r)), a && a.call(i, r);
        const f = i.delete(r);
        return l && Mn(i, "delete", r, void 0), f;
      },
      clear() {
        const r = Ue(this), i = r.size !== 0, o = r.clear();
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
    Ke(n, r) && r in s ? n : s,
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
function fn(e) {
  return !!(e && e.__v_isShallow);
}
function Oa(e) {
  return e ? !!e.__v_raw : !1;
}
function Ue(e) {
  const t = e && e.__v_raw;
  return t ? Ue(t) : e;
}
function Ph(e) {
  return !Ke(e, "__v_skip") && Object.isExtensible(e) && Jo(e, "__v_skip", !0), e;
}
const St = (e) => ct(e) ? to(e) : e, Mi = (e) => ct(e) ? cu(e) : e;
function It(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function ie(e) {
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
    this.dep = new Ca(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? t : Ue(t), this._value = n ? t : St(t), this.__v_isShallow = n;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const n = this._rawValue, s = this.__v_isShallow || fn(t) || us(t);
    t = s ? t : Ue(t), os(t, n) && (this._rawValue = t, this._value = s ? t : St(t), this.dep.trigger());
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
  return xe(e) ? s = e : (s = e.get, r = e.set), new $h(s, r, n);
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
  const { immediate: s, deep: r, once: i, scheduler: o, augmentJob: a, call: l } = n, f = (x) => r ? x : fn(x) || r === !1 || r === 0 ? Dn(x, 1) : Dn(x);
  let u, b, T, O, L = !1, z = !1;
  if (It(e) ? (b = () => e.value, L = fn(e)) : er(e) ? (b = () => f(e), L = !0) : Se(e) ? (z = !0, L = e.some((x) => er(x) || fn(x)), b = () => e.map((x) => {
    if (It(x))
      return x.value;
    if (er(x))
      return f(x);
    if (xe(x))
      return l ? l(x, 2) : x();
  })) : xe(e) ? t ? b = l ? () => l(e, 2) : e : b = () => {
    if (T) {
      Bn();
      try {
        T();
      } finally {
        Un();
      }
    }
    const x = Rs;
    Rs = u;
    try {
      return l ? l(e, 3, [O]) : e(O);
    } finally {
      Rs = x;
    }
  } : b = Sn, t && r) {
    const x = b, M = r === !0 ? 1 / 0 : r;
    b = () => Dn(x(), M);
  }
  const ue = ph(), C = () => {
    u.stop(), ue && ue.active && Ta(ue.effects, u);
  };
  if (i && t) {
    const x = t;
    t = (...M) => {
      x(...M), C();
    };
  }
  let fe = z ? new Array(e.length).fill(pi) : pi;
  const me = (x) => {
    if (!(!(u.flags & 1) || !u.dirty && !x))
      if (t) {
        const M = u.run();
        if (r || L || (z ? M.some((S, j) => os(S, fe[j])) : os(M, fe))) {
          T && T();
          const S = Rs;
          Rs = u;
          try {
            const j = [
              M,
              // pass undefined as the old value when it's changed for the first time
              fe === pi ? void 0 : z && fe[0] === pi ? [] : fe,
              O
            ];
            fe = M, l ? l(t, 3, j) : (
              // @ts-expect-error
              t(...j)
            );
          } finally {
            Rs = S;
          }
        }
      } else
        u.run();
  };
  return a && a(me), u = new Yc(b), u.scheduler = o ? () => o(me, !1) : me, O = (x) => Uh(x, !1, u), T = u.onStop = () => {
    const x = Di.get(u);
    if (x) {
      if (l)
        l(x, 4);
      else
        for (const M of x) M();
      Di.delete(u);
    }
  }, t ? s ? me(!0) : fe = u.run() : o ? o(me.bind(null, !0), !0) : u.run(), C.pause = u.pause.bind(u), C.resume = u.resume.bind(u), C.stop = C, C;
}
function Dn(e, t = 1 / 0, n) {
  if (t <= 0 || !ct(e) || e.__v_skip || (n = n || /* @__PURE__ */ new Set(), n.has(e)))
    return e;
  if (n.add(e), t--, It(e))
    Dn(e.value, t, n);
  else if (Se(e))
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
  if (xe(e)) {
    const r = qr(e, t, n, s);
    return r && Hc(r) && r.catch((i) => {
      no(i, t, n);
    }), r;
  }
  if (Se(e)) {
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
    const l = t.proxy, f = `https://vuejs.org/error-reference/#runtime-${n}`;
    for (; a; ) {
      const u = a.ec;
      if (u) {
        for (let b = 0; b < u.length; b++)
          if (u[b](e, l, f) === !1)
            return;
      }
      a = a.parent;
    }
    if (i) {
      Bn(), qr(i, null, 10, [
        e,
        l,
        f
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
const Mt = [];
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
  let t = Tn + 1, n = Mt.length;
  for (; t < n; ) {
    const s = t + n >>> 1, r = Mt[s], i = Hr(r);
    i < e || i === e && r.flags & 2 ? t = s + 1 : n = s;
  }
  return t;
}
function La(e) {
  if (!(e.flags & 1)) {
    const t = Hr(e), n = Mt[Mt.length - 1];
    !n || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= Hr(n) ? Mt.push(e) : Mt.splice(jh(t), 0, e), e.flags |= 1, du();
  }
}
function du() {
  Fi || (Fi = hu.then(mu));
}
function Wh(e) {
  Se(e) ? tr.push(...e) : ns && e.id === -1 ? ns.splice(Ys + 1, 0, e) : e.flags & 1 || (tr.push(e), e.flags |= 1), du();
}
function Rl(e, t, n = Tn + 1) {
  for (; n < Mt.length; n++) {
    const s = Mt[n];
    if (s && s.flags & 2) {
      if (e && s.id !== e.uid)
        continue;
      Mt.splice(n, 1), n--, s.flags & 4 && (s.flags &= -2), s(), s.flags & 4 || (s.flags &= -2);
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
    for (Tn = 0; Tn < Mt.length; Tn++) {
      const t = Mt[Tn];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), qr(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; Tn < Mt.length; Tn++) {
      const t = Mt[Tn];
      t && (t.flags &= -2);
    }
    Tn = -1, Mt.length = 0, pu(), Fi = null, (Mt.length || tr.length) && mu();
  }
}
let un = null, gu = null;
function $i(e) {
  const t = un;
  return un = e, gu = e && e.type.__scopeId || null, t;
}
function qh(e, t = un, n) {
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
  if (un === null)
    return e;
  const n = lo(un), s = e.dirs || (e.dirs = []);
  for (let r = 0; r < t.length; r++) {
    let [i, o, a, l = nt] = t[r];
    i && (xe(i) && (i = {
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
  return xe(e) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    Ot({ name: e.name }, t, { setup: e })
  ) : e;
}
function _u(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
function Pr(e, t, n, s, r = !1) {
  if (Se(e)) {
    e.forEach(
      (L, z) => Pr(
        L,
        t && (Se(t) ? t[z] : t),
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
  const i = s.shapeFlag & 4 ? lo(s.component) : s.el, o = r ? null : i, { i: a, r: l } = e, f = t && t.r, u = a.refs === nt ? a.refs = {} : a.refs, b = a.setupState, T = Ue(b), O = b === nt ? () => !1 : (L) => Ke(T, L);
  if (f != null && f !== l && (gt(f) ? (u[f] = null, O(f) && (b[f] = null)) : It(f) && (f.value = null)), xe(l))
    qr(l, a, 12, [o, u]);
  else {
    const L = gt(l), z = It(l);
    if (L || z) {
      const ue = () => {
        if (e.f) {
          const C = L ? O(l) ? b[l] : u[l] : l.value;
          r ? Se(C) && Ta(C, i) : Se(C) ? C.includes(i) || C.push(i) : L ? (u[l] = [i], O(l) && (b[l] = u[l])) : (l.value = [i], e.k && (u[e.k] = l.value));
        } else L ? (u[l] = o, O(l) && (b[l] = o)) : z && (l.value = o, e.k && (u[e.k] = o));
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
function vu(e, t, n = Ft) {
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
function so(e, t, n = Ft, s = !1) {
  if (n) {
    const r = n[e] || (n[e] = []), i = t.__weh || (t.__weh = (...o) => {
      Bn();
      const a = Kr(n), l = xn(t, n, e, o);
      return a(), Un(), l;
    });
    return s ? r.unshift(i) : r.push(i), i;
  }
}
const zn = (e) => (t, n = Ft) => {
  (!Wr || e === "sp") && so(e, (...s) => t(...s), n);
}, Zh = zn("bm"), ro = zn("m"), Jh = zn(
  "bu"
), Qh = zn("u"), io = zn(
  "bum"
), Vr = zn("um"), ed = zn(
  "sp"
), td = zn("rtg"), nd = zn("rtc");
function sd(e, t = Ft) {
  so("ec", e, t);
}
const rd = Symbol.for("v-ndc");
function dt(e, t, n, s) {
  let r;
  const i = n, o = Se(e);
  if (o || gt(e)) {
    const a = o && er(e);
    let l = !1, f = !1;
    a && (l = !fn(e), f = us(e), e = eo(e)), r = new Array(e.length);
    for (let u = 0, b = e.length; u < b; u++)
      r[u] = t(
        l ? f ? Mi(St(e[u])) : St(e[u]) : e[u],
        u,
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
      for (let l = 0, f = a.length; l < f; l++) {
        const u = a[l];
        r[l] = t(e[u], u, l, i);
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
), Oo = (e, t) => e !== nt && !e.__isScriptSetup && Ke(e, t), id = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: n, setupState: s, data: r, props: i, accessCache: o, type: a, appContext: l } = e;
    let f;
    if (t[0] !== "$") {
      const O = o[t];
      if (O !== void 0)
        switch (O) {
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
        if (r !== nt && Ke(r, t))
          return o[t] = 2, r[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (f = e.propsOptions[0]) && Ke(f, t)
        )
          return o[t] = 3, i[t];
        if (n !== nt && Ke(n, t))
          return o[t] = 4, n[t];
        ia && (o[t] = 0);
      }
    }
    const u = Dr[t];
    let b, T;
    if (u)
      return t === "$attrs" && Rt(e.attrs, "get", ""), u(e);
    if (
      // css module (injected by vue-loader)
      (b = a.__cssModules) && (b = b[t])
    )
      return b;
    if (n !== nt && Ke(n, t))
      return o[t] = 4, n[t];
    if (
      // global properties
      T = l.config.globalProperties, Ke(T, t)
    )
      return T[t];
  },
  set({ _: e }, t, n) {
    const { data: s, setupState: r, ctx: i } = e;
    return Oo(r, t) ? (r[t] = n, !0) : s !== nt && Ke(s, t) ? (s[t] = n, !0) : Ke(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (i[t] = n, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: n, ctx: s, appContext: r, propsOptions: i }
  }, o) {
    let a;
    return !!n[o] || e !== nt && Ke(e, o) || Oo(t, o) || (a = i[0]) && Ke(a, o) || Ke(s, o) || Ke(Dr, o) || Ke(r.config.globalProperties, o);
  },
  defineProperty(e, t, n) {
    return n.get != null ? e._.accessCache[t] = 0 : Ke(n, "value") && this.set(e, t, n.value, null), Reflect.defineProperty(e, t, n);
  }
};
function Il(e) {
  return Se(e) ? e.reduce(
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
    inject: f,
    // lifecycle
    created: u,
    beforeMount: b,
    mounted: T,
    beforeUpdate: O,
    updated: L,
    activated: z,
    deactivated: ue,
    beforeDestroy: C,
    beforeUnmount: fe,
    destroyed: me,
    unmounted: x,
    render: M,
    renderTracked: S,
    renderTriggered: j,
    errorCaptured: ne,
    serverPrefetch: ce,
    // public API
    expose: ge,
    inheritAttrs: Oe,
    // assets
    components: ke,
    directives: Ye,
    filters: ze
  } = t;
  if (f && ad(f, s, null), o)
    for (const ve in o) {
      const ye = o[ve];
      xe(ye) && (s[ve] = ye.bind(n));
    }
  if (r) {
    const ve = r.call(n, n);
    ct(ve) && (e.data = to(ve));
  }
  if (ia = !0, i)
    for (const ve in i) {
      const ye = i[ve], Qe = xe(ye) ? ye.bind(n, n) : xe(ye.get) ? ye.get.bind(n, n) : Sn, Xe = !xe(ye) && xe(ye.set) ? ye.set.bind(n) : Sn, ot = oe({
        get: Qe,
        set: Xe
      });
      Object.defineProperty(s, ve, {
        enumerable: !0,
        configurable: !0,
        get: () => ot.value,
        set: (We) => ot.value = We
      });
    }
  if (a)
    for (const ve in a)
      bu(a[ve], s, n, ve);
  if (l) {
    const ve = xe(l) ? l.call(n) : l;
    Reflect.ownKeys(ve).forEach((ye) => {
      dd(ye, ve[ye]);
    });
  }
  u && Ol(u, e, "c");
  function he(ve, ye) {
    Se(ye) ? ye.forEach((Qe) => ve(Qe.bind(n))) : ye && ve(ye.bind(n));
  }
  if (he(Zh, b), he(ro, T), he(Jh, O), he(Qh, L), he(Gh, z), he(Yh, ue), he(sd, ne), he(nd, S), he(td, j), he(io, fe), he(Vr, x), he(ed, ce), Se(ge))
    if (ge.length) {
      const ve = e.exposed || (e.exposed = {});
      ge.forEach((ye) => {
        Object.defineProperty(ve, ye, {
          get: () => n[ye],
          set: (Qe) => n[ye] = Qe,
          enumerable: !0
        });
      });
    } else e.exposed || (e.exposed = {});
  M && e.render === Sn && (e.render = M), Oe != null && (e.inheritAttrs = Oe), ke && (e.components = ke), Ye && (e.directives = Ye), ce && _u(e);
}
function ad(e, t, n = Sn) {
  Se(e) && (e = oa(e));
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
    Se(e) ? e.map((s) => s.bind(t.proxy)) : e.bind(t.proxy),
    t,
    n
  );
}
function bu(e, t, n, s) {
  let r = s.includes(".") ? Pu(n, s) : () => n[s];
  if (gt(e)) {
    const i = t[e];
    xe(i) && pt(r, i);
  } else if (xe(e))
    pt(r, e.bind(n));
  else if (ct(e))
    if (Se(e))
      e.forEach((i) => bu(i, t, n, s));
    else {
      const i = xe(e.handler) ? e.handler.bind(n) : t[e.handler];
      xe(i) && pt(r, i, e);
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
    (f) => Bi(l, f, o, !0)
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
  beforeCreate: Pt,
  created: Pt,
  beforeMount: Pt,
  mounted: Pt,
  beforeUpdate: Pt,
  updated: Pt,
  beforeDestroy: Pt,
  beforeUnmount: Pt,
  destroyed: Pt,
  unmounted: Pt,
  activated: Pt,
  deactivated: Pt,
  errorCaptured: Pt,
  serverPrefetch: Pt,
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
      xe(e) ? e.call(this, this) : e,
      xe(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function cd(e, t) {
  return xr(oa(e), oa(t));
}
function oa(e) {
  if (Se(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++)
      t[e[n]] = e[n];
    return t;
  }
  return e;
}
function Pt(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function xr(e, t) {
  return e ? Ot(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function Nl(e, t) {
  return e ? Se(e) && Se(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : Ot(
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
    n[s] = Pt(e[s], t[s]);
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
    xe(s) || (s = Ot({}, s)), r != null && !ct(r) && (r = null);
    const i = ku(), o = /* @__PURE__ */ new WeakSet(), a = [];
    let l = !1;
    const f = i.app = {
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
      set config(u) {
      },
      use(u, ...b) {
        return o.has(u) || (u && xe(u.install) ? (o.add(u), u.install(f, ...b)) : xe(u) && (o.add(u), u(f, ...b))), f;
      },
      mixin(u) {
        return i.mixins.includes(u) || i.mixins.push(u), f;
      },
      component(u, b) {
        return b ? (i.components[u] = b, f) : i.components[u];
      },
      directive(u, b) {
        return b ? (i.directives[u] = b, f) : i.directives[u];
      },
      mount(u, b, T) {
        if (!l) {
          const O = f._ceVNode || Dt(s, r);
          return O.appContext = i, T === !0 ? T = "svg" : T === !1 && (T = void 0), e(O, u, T), l = !0, f._container = u, u.__vue_app__ = f, lo(O.component);
        }
      },
      onUnmount(u) {
        a.push(u);
      },
      unmount() {
        l && (xn(
          a,
          f._instance,
          16
        ), e(null, f._container), delete f._container.__vue_app__);
      },
      provide(u, b) {
        return i.provides[u] = b, f;
      },
      runWithContext(u) {
        const b = nr;
        nr = f;
        try {
          return u();
        } finally {
          nr = b;
        }
      }
    };
    return f;
  };
}
let nr = null;
function dd(e, t) {
  if (Ft) {
    let n = Ft.provides;
    const s = Ft.parent && Ft.parent.provides;
    s === n && (n = Ft.provides = Object.create(s)), n[e] = t;
  }
}
function wi(e, t, n = !1) {
  const s = zd();
  if (s || nr) {
    let r = nr ? nr._context.provides : s ? s.parent == null || s.ce ? s.vnode.appContext && s.vnode.appContext.provides : s.parent.provides : void 0;
    if (r && e in r)
      return r[e];
    if (arguments.length > 1)
      return n && xe(t) ? t.call(s && s.proxy) : t;
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
  } = e, a = Ue(r), [l] = e.propsOptions;
  let f = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (s || o > 0) && !(o & 16)
  ) {
    if (o & 8) {
      const u = e.vnode.dynamicProps;
      for (let b = 0; b < u.length; b++) {
        let T = u[b];
        if (oo(e.emitsOptions, T))
          continue;
        const O = t[T];
        if (l)
          if (Ke(i, T))
            O !== i[T] && (i[T] = O, f = !0);
          else {
            const L = cs(T);
            r[L] = aa(
              l,
              a,
              L,
              O,
              e,
              !1
            );
          }
        else
          O !== i[T] && (i[T] = O, f = !0);
      }
    }
  } else {
    Eu(e, t, r, i) && (f = !0);
    let u;
    for (const b in a)
      (!t || // for camelCase
      !Ke(t, b) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((u = ds(b)) === b || !Ke(t, u))) && (l ? n && // for camelCase
      (n[b] !== void 0 || // for kebab-case
      n[u] !== void 0) && (r[b] = aa(
        l,
        a,
        b,
        void 0,
        e,
        !0
      )) : delete r[b]);
    if (i !== a)
      for (const b in i)
        (!t || !Ke(t, b)) && (delete i[b], f = !0);
  }
  f && Mn(e.attrs, "set", "");
}
function Eu(e, t, n, s) {
  const [r, i] = e.propsOptions;
  let o = !1, a;
  if (t)
    for (let l in t) {
      if (Or(l))
        continue;
      const f = t[l];
      let u;
      r && Ke(r, u = cs(l)) ? !i || !i.includes(u) ? n[u] = f : (a || (a = {}))[u] = f : oo(e.emitsOptions, l) || (!(l in s) || f !== s[l]) && (s[l] = f, o = !0);
    }
  if (i) {
    const l = Ue(n), f = a || nt;
    for (let u = 0; u < i.length; u++) {
      const b = i[u];
      n[b] = aa(
        r,
        l,
        b,
        f[b],
        e,
        !Ke(f, b)
      );
    }
  }
  return o;
}
function aa(e, t, n, s, r, i) {
  const o = e[n];
  if (o != null) {
    const a = Ke(o, "default");
    if (a && s === void 0) {
      const l = o.default;
      if (o.type !== Function && !o.skipFactory && xe(l)) {
        const { propsDefaults: f } = r;
        if (n in f)
          s = f[n];
        else {
          const u = Kr(r);
          s = f[n] = l.call(
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
  if (!xe(e)) {
    const u = (b) => {
      l = !0;
      const [T, O] = xu(b, t, !0);
      Ot(o, T), O && a.push(...O);
    };
    !n && t.mixins.length && t.mixins.forEach(u), e.extends && u(e.extends), e.mixins && e.mixins.forEach(u);
  }
  if (!i && !l)
    return ct(e) && s.set(e, Js), Js;
  if (Se(i))
    for (let u = 0; u < i.length; u++) {
      const b = cs(i[u]);
      Pl(b) && (o[b] = nt);
    }
  else if (i)
    for (const u in i) {
      const b = cs(u);
      if (Pl(b)) {
        const T = i[u], O = o[b] = Se(T) || xe(T) ? { type: T } : Ot({}, T), L = O.type;
        let z = !1, ue = !0;
        if (Se(L))
          for (let C = 0; C < L.length; ++C) {
            const fe = L[C], me = xe(fe) && fe.name;
            if (me === "Boolean") {
              z = !0;
              break;
            } else me === "String" && (ue = !1);
          }
        else
          z = xe(L) && L.name === "Boolean";
        O[
          0
          /* shouldCast */
        ] = z, O[
          1
          /* shouldCastTrue */
        ] = ue, (z || Ke(O, "default")) && a.push(b);
      }
    }
  const f = [o, a];
  return ct(e) && s.set(e, f), f;
}
function Pl(e) {
  return e[0] !== "$" && !Or(e);
}
const Pa = (e) => e === "_" || e === "__" || e === "_ctx" || e === "$stable", Ma = (e) => Se(e) ? e.map(An) : [An(e)], _d = (e, t, n) => {
  if (t._n)
    return t;
  const s = qh((...r) => Ma(t(...r)), n);
  return s._c = !1, s;
}, Cu = (e, t, n) => {
  const s = e._ctx;
  for (const r in e) {
    if (Pa(r)) continue;
    const i = e[r];
    if (xe(i))
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
    setText: f,
    setElementText: u,
    parentNode: b,
    nextSibling: T,
    setScopeId: O = Sn,
    insertStaticContent: L
  } = e, z = (y, v, N, D = null, U = null, P = null, Y = void 0, q = null, V = !!v.dynamicChildren) => {
    if (y === v)
      return;
    y && !_r(y, v) && (D = Bt(y), We(y, U, P, !0), y = null), v.patchFlag === -2 && (V = !1, v.dynamicChildren = null);
    const { type: H, ref: se, shapeFlag: X } = v;
    switch (H) {
      case ao:
        ue(y, v, N, D);
        break;
      case fs:
        C(y, v, N, D);
        break;
      case ki:
        y == null && fe(v, N, D, Y);
        break;
      case Re:
        ke(
          y,
          v,
          N,
          D,
          U,
          P,
          Y,
          q,
          V
        );
        break;
      default:
        X & 1 ? M(
          y,
          v,
          N,
          D,
          U,
          P,
          Y,
          q,
          V
        ) : X & 6 ? Ye(
          y,
          v,
          N,
          D,
          U,
          P,
          Y,
          q,
          V
        ) : (X & 64 || X & 128) && H.process(
          y,
          v,
          N,
          D,
          U,
          P,
          Y,
          q,
          V,
          Lt
        );
    }
    se != null && U ? Pr(se, y && y.ref, P, v || y, !v) : se == null && y && y.ref != null && Pr(y.ref, null, P, y, !0);
  }, ue = (y, v, N, D) => {
    if (y == null)
      s(
        v.el = a(v.children),
        N,
        D
      );
    else {
      const U = v.el = y.el;
      v.children !== y.children && f(U, v.children);
    }
  }, C = (y, v, N, D) => {
    y == null ? s(
      v.el = l(v.children || ""),
      N,
      D
    ) : v.el = y.el;
  }, fe = (y, v, N, D) => {
    [y.el, y.anchor] = L(
      y.children,
      v,
      N,
      D,
      y.el,
      y.anchor
    );
  }, me = ({ el: y, anchor: v }, N, D) => {
    let U;
    for (; y && y !== v; )
      U = T(y), s(y, N, D), y = U;
    s(v, N, D);
  }, x = ({ el: y, anchor: v }) => {
    let N;
    for (; y && y !== v; )
      N = T(y), r(y), y = N;
    r(v);
  }, M = (y, v, N, D, U, P, Y, q, V) => {
    v.type === "svg" ? Y = "svg" : v.type === "math" && (Y = "mathml"), y == null ? S(
      v,
      N,
      D,
      U,
      P,
      Y,
      q,
      V
    ) : ce(
      y,
      v,
      U,
      P,
      Y,
      q,
      V
    );
  }, S = (y, v, N, D, U, P, Y, q) => {
    let V, H;
    const { props: se, shapeFlag: X, transition: J, dirs: de } = y;
    if (V = y.el = o(
      y.type,
      P,
      se && se.is,
      se
    ), X & 8 ? u(V, y.children) : X & 16 && ne(
      y.children,
      V,
      null,
      D,
      U,
      Lo(y, P),
      Y,
      q
    ), de && Ss(y, null, D, "created"), j(V, y, y.scopeId, Y, D), se) {
      for (const be in se)
        be !== "value" && !Or(be) && i(V, be, null, se[be], P, D);
      "value" in se && i(V, "value", null, se.value, P), (H = se.onVnodeBeforeMount) && wn(H, D, y);
    }
    de && Ss(y, null, D, "beforeMount");
    const pe = kd(U, J);
    pe && J.beforeEnter(V), s(V, v, N), ((H = se && se.onVnodeMounted) || pe || de) && Zt(() => {
      H && wn(H, D, y), pe && J.enter(V), de && Ss(y, null, D, "mounted");
    }, U);
  }, j = (y, v, N, D, U) => {
    if (N && O(y, N), D)
      for (let P = 0; P < D.length; P++)
        O(y, D[P]);
    if (U) {
      let P = U.subTree;
      if (v === P || Du(P.type) && (P.ssContent === v || P.ssFallback === v)) {
        const Y = U.vnode;
        j(
          y,
          Y,
          Y.scopeId,
          Y.slotScopeIds,
          U.parent
        );
      }
    }
  }, ne = (y, v, N, D, U, P, Y, q, V = 0) => {
    for (let H = V; H < y.length; H++) {
      const se = y[H] = q ? rs(y[H]) : An(y[H]);
      z(
        null,
        se,
        v,
        N,
        D,
        U,
        P,
        Y,
        q
      );
    }
  }, ce = (y, v, N, D, U, P, Y) => {
    const q = v.el = y.el;
    let { patchFlag: V, dynamicChildren: H, dirs: se } = v;
    V |= y.patchFlag & 16;
    const X = y.props || nt, J = v.props || nt;
    let de;
    if (N && Es(N, !1), (de = J.onVnodeBeforeUpdate) && wn(de, N, v, y), se && Ss(v, y, N, "beforeUpdate"), N && Es(N, !0), (X.innerHTML && J.innerHTML == null || X.textContent && J.textContent == null) && u(q, ""), H ? ge(
      y.dynamicChildren,
      H,
      q,
      N,
      D,
      Lo(v, U),
      P
    ) : Y || ye(
      y,
      v,
      q,
      null,
      N,
      D,
      Lo(v, U),
      P,
      !1
    ), V > 0) {
      if (V & 16)
        Oe(q, X, J, N, U);
      else if (V & 2 && X.class !== J.class && i(q, "class", null, J.class, U), V & 4 && i(q, "style", X.style, J.style, U), V & 8) {
        const pe = v.dynamicProps;
        for (let be = 0; be < pe.length; be++) {
          const Te = pe[be], Pe = X[Te], Ie = J[Te];
          (Ie !== Pe || Te === "value") && i(q, Te, Pe, Ie, U, N);
        }
      }
      V & 1 && y.children !== v.children && u(q, v.children);
    } else !Y && H == null && Oe(q, X, J, N, U);
    ((de = J.onVnodeUpdated) || se) && Zt(() => {
      de && wn(de, N, v, y), se && Ss(v, y, N, "updated");
    }, D);
  }, ge = (y, v, N, D, U, P, Y) => {
    for (let q = 0; q < v.length; q++) {
      const V = y[q], H = v[q], se = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        V.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (V.type === Re || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !_r(V, H) || // - In the case of a component, it could contain anything.
        V.shapeFlag & 198) ? b(V.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          N
        )
      );
      z(
        V,
        H,
        se,
        null,
        D,
        U,
        P,
        Y,
        !0
      );
    }
  }, Oe = (y, v, N, D, U) => {
    if (v !== N) {
      if (v !== nt)
        for (const P in v)
          !Or(P) && !(P in N) && i(
            y,
            P,
            v[P],
            null,
            U,
            D
          );
      for (const P in N) {
        if (Or(P)) continue;
        const Y = N[P], q = v[P];
        Y !== q && P !== "value" && i(y, P, q, Y, U, D);
      }
      "value" in N && i(y, "value", v.value, N.value, U);
    }
  }, ke = (y, v, N, D, U, P, Y, q, V) => {
    const H = v.el = y ? y.el : a(""), se = v.anchor = y ? y.anchor : a("");
    let { patchFlag: X, dynamicChildren: J, slotScopeIds: de } = v;
    de && (q = q ? q.concat(de) : de), y == null ? (s(H, N, D), s(se, N, D), ne(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      v.children || [],
      N,
      se,
      U,
      P,
      Y,
      q,
      V
    )) : X > 0 && X & 64 && J && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    y.dynamicChildren ? (ge(
      y.dynamicChildren,
      J,
      N,
      U,
      P,
      Y,
      q
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (v.key != null || U && v === U.subTree) && Ou(
      y,
      v,
      !0
      /* shallow */
    )) : ye(
      y,
      v,
      N,
      se,
      U,
      P,
      Y,
      q,
      V
    );
  }, Ye = (y, v, N, D, U, P, Y, q, V) => {
    v.slotScopeIds = q, y == null ? v.shapeFlag & 512 ? U.ctx.activate(
      v,
      N,
      D,
      Y,
      V
    ) : ze(
      v,
      N,
      D,
      U,
      P,
      Y,
      V
    ) : st(y, v, V);
  }, ze = (y, v, N, D, U, P, Y) => {
    const q = y.component = Ud(
      y,
      D,
      U
    );
    if (yu(y) && (q.ctx.renderer = Lt), Hd(q, !1, Y), q.asyncDep) {
      if (U && U.registerDep(q, he, Y), !y.el) {
        const V = q.subTree = Dt(fs);
        C(null, V, v, N), y.placeholder = V.el;
      }
    } else
      he(
        q,
        y,
        v,
        N,
        U,
        P,
        Y
      );
  }, st = (y, v, N) => {
    const D = v.component = y.component;
    if (Od(y, v, N))
      if (D.asyncDep && !D.asyncResolved) {
        ve(D, v, N);
        return;
      } else
        D.next = v, D.update();
    else
      v.el = y.el, D.vnode = v;
  }, he = (y, v, N, D, U, P, Y) => {
    const q = () => {
      if (y.isMounted) {
        let { next: X, bu: J, u: de, parent: pe, vnode: be } = y;
        {
          const c = Lu(y);
          if (c) {
            X && (X.el = be.el, ve(y, X, Y)), c.asyncDep.then(() => {
              y.isUnmounted || q();
            });
            return;
          }
        }
        let Te = X, Pe;
        Es(y, !1), X ? (X.el = be.el, ve(y, X, Y)) : X = be, J && bi(J), (Pe = X.props && X.props.onVnodeBeforeUpdate) && wn(Pe, pe, X, be), Es(y, !0);
        const Ie = Dl(y), W = y.subTree;
        y.subTree = Ie, z(
          W,
          Ie,
          // parent may have changed if it's in a teleport
          b(W.el),
          // anchor may have changed if it's in a fragment
          Bt(W),
          y,
          U,
          P
        ), X.el = Ie.el, Te === null && Ld(y, Ie.el), de && Zt(de, U), (Pe = X.props && X.props.onVnodeUpdated) && Zt(
          () => wn(Pe, pe, X, be),
          U
        );
      } else {
        let X;
        const { el: J, props: de } = v, { bm: pe, m: be, parent: Te, root: Pe, type: Ie } = y, W = Mr(v);
        Es(y, !1), pe && bi(pe), !W && (X = de && de.onVnodeBeforeMount) && wn(X, Te, v), Es(y, !0);
        {
          Pe.ce && // @ts-expect-error _def is private
          Pe.ce._def.shadowRoot !== !1 && Pe.ce._injectChildStyle(Ie);
          const c = y.subTree = Dl(y);
          z(
            null,
            c,
            N,
            D,
            y,
            U,
            P
          ), v.el = c.el;
        }
        if (be && Zt(be, U), !W && (X = de && de.onVnodeMounted)) {
          const c = v;
          Zt(
            () => wn(X, Te, c),
            U
          );
        }
        (v.shapeFlag & 256 || Te && Mr(Te.vnode) && Te.vnode.shapeFlag & 256) && y.a && Zt(y.a, U), y.isMounted = !0, v = N = D = null;
      }
    };
    y.scope.on();
    const V = y.effect = new Yc(q);
    y.scope.off();
    const H = y.update = V.run.bind(V), se = y.job = V.runIfDirty.bind(V);
    se.i = y, se.id = y.uid, V.scheduler = () => La(se), Es(y, !0), H();
  }, ve = (y, v, N) => {
    v.component = y;
    const D = y.vnode.props;
    y.vnode = v, y.next = null, md(y, v.props, D, N), vd(y, v.children, N), Bn(), Rl(y), Un();
  }, ye = (y, v, N, D, U, P, Y, q, V = !1) => {
    const H = y && y.children, se = y ? y.shapeFlag : 0, X = v.children, { patchFlag: J, shapeFlag: de } = v;
    if (J > 0) {
      if (J & 128) {
        Xe(
          H,
          X,
          N,
          D,
          U,
          P,
          Y,
          q,
          V
        );
        return;
      } else if (J & 256) {
        Qe(
          H,
          X,
          N,
          D,
          U,
          P,
          Y,
          q,
          V
        );
        return;
      }
    }
    de & 8 ? (se & 16 && yt(H, U, P), X !== H && u(N, X)) : se & 16 ? de & 16 ? Xe(
      H,
      X,
      N,
      D,
      U,
      P,
      Y,
      q,
      V
    ) : yt(H, U, P, !0) : (se & 8 && u(N, ""), de & 16 && ne(
      X,
      N,
      D,
      U,
      P,
      Y,
      q,
      V
    ));
  }, Qe = (y, v, N, D, U, P, Y, q, V) => {
    y = y || Js, v = v || Js;
    const H = y.length, se = v.length, X = Math.min(H, se);
    let J;
    for (J = 0; J < X; J++) {
      const de = v[J] = V ? rs(v[J]) : An(v[J]);
      z(
        y[J],
        de,
        N,
        null,
        U,
        P,
        Y,
        q,
        V
      );
    }
    H > se ? yt(
      y,
      U,
      P,
      !0,
      !1,
      X
    ) : ne(
      v,
      N,
      D,
      U,
      P,
      Y,
      q,
      V,
      X
    );
  }, Xe = (y, v, N, D, U, P, Y, q, V) => {
    let H = 0;
    const se = v.length;
    let X = y.length - 1, J = se - 1;
    for (; H <= X && H <= J; ) {
      const de = y[H], pe = v[H] = V ? rs(v[H]) : An(v[H]);
      if (_r(de, pe))
        z(
          de,
          pe,
          N,
          null,
          U,
          P,
          Y,
          q,
          V
        );
      else
        break;
      H++;
    }
    for (; H <= X && H <= J; ) {
      const de = y[X], pe = v[J] = V ? rs(v[J]) : An(v[J]);
      if (_r(de, pe))
        z(
          de,
          pe,
          N,
          null,
          U,
          P,
          Y,
          q,
          V
        );
      else
        break;
      X--, J--;
    }
    if (H > X) {
      if (H <= J) {
        const de = J + 1, pe = de < se ? v[de].el : D;
        for (; H <= J; )
          z(
            null,
            v[H] = V ? rs(v[H]) : An(v[H]),
            N,
            pe,
            U,
            P,
            Y,
            q,
            V
          ), H++;
      }
    } else if (H > J)
      for (; H <= X; )
        We(y[H], U, P, !0), H++;
    else {
      const de = H, pe = H, be = /* @__PURE__ */ new Map();
      for (H = pe; H <= J; H++) {
        const R = v[H] = V ? rs(v[H]) : An(v[H]);
        R.key != null && be.set(R.key, H);
      }
      let Te, Pe = 0;
      const Ie = J - pe + 1;
      let W = !1, c = 0;
      const _ = new Array(Ie);
      for (H = 0; H < Ie; H++) _[H] = 0;
      for (H = de; H <= X; H++) {
        const R = y[H];
        if (Pe >= Ie) {
          We(R, U, P, !0);
          continue;
        }
        let $;
        if (R.key != null)
          $ = be.get(R.key);
        else
          for (Te = pe; Te <= J; Te++)
            if (_[Te - pe] === 0 && _r(R, v[Te])) {
              $ = Te;
              break;
            }
        $ === void 0 ? We(R, U, P, !0) : (_[$ - pe] = H + 1, $ >= c ? c = $ : W = !0, z(
          R,
          v[$],
          N,
          null,
          U,
          P,
          Y,
          q,
          V
        ), Pe++);
      }
      const I = W ? Td(_) : Js;
      for (Te = I.length - 1, H = Ie - 1; H >= 0; H--) {
        const R = pe + H, $ = v[R], re = v[R + 1], te = R + 1 < se ? (
          // #13559, fallback to el placeholder for unresolved async component
          re.el || re.placeholder
        ) : D;
        _[H] === 0 ? z(
          null,
          $,
          N,
          te,
          U,
          P,
          Y,
          q,
          V
        ) : W && (Te < 0 || H !== I[Te] ? ot($, N, te, 2) : Te--);
      }
    }
  }, ot = (y, v, N, D, U = null) => {
    const { el: P, type: Y, transition: q, children: V, shapeFlag: H } = y;
    if (H & 6) {
      ot(y.component.subTree, v, N, D);
      return;
    }
    if (H & 128) {
      y.suspense.move(v, N, D);
      return;
    }
    if (H & 64) {
      Y.move(y, v, N, Lt);
      return;
    }
    if (Y === Re) {
      s(P, v, N);
      for (let X = 0; X < V.length; X++)
        ot(V[X], v, N, D);
      s(y.anchor, v, N);
      return;
    }
    if (Y === ki) {
      me(y, v, N);
      return;
    }
    if (D !== 2 && H & 1 && q)
      if (D === 0)
        q.beforeEnter(P), s(P, v, N), Zt(() => q.enter(P), U);
      else {
        const { leave: X, delayLeave: J, afterLeave: de } = q, pe = () => {
          y.ctx.isUnmounted ? r(P) : s(P, v, N);
        }, be = () => {
          X(P, () => {
            pe(), de && de();
          });
        };
        J ? J(P, pe, be) : be();
      }
    else
      s(P, v, N);
  }, We = (y, v, N, D = !1, U = !1) => {
    const {
      type: P,
      props: Y,
      ref: q,
      children: V,
      dynamicChildren: H,
      shapeFlag: se,
      patchFlag: X,
      dirs: J,
      cacheIndex: de
    } = y;
    if (X === -2 && (U = !1), q != null && (Bn(), Pr(q, null, N, y, !0), Un()), de != null && (v.renderCache[de] = void 0), se & 256) {
      v.ctx.deactivate(y);
      return;
    }
    const pe = se & 1 && J, be = !Mr(y);
    let Te;
    if (be && (Te = Y && Y.onVnodeBeforeUnmount) && wn(Te, v, y), se & 6)
      De(y.component, N, D);
    else {
      if (se & 128) {
        y.suspense.unmount(N, D);
        return;
      }
      pe && Ss(y, null, v, "beforeUnmount"), se & 64 ? y.type.remove(
        y,
        v,
        N,
        Lt,
        D
      ) : H && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !H.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (P !== Re || X > 0 && X & 64) ? yt(
        H,
        v,
        N,
        !1,
        !0
      ) : (P === Re && X & 384 || !U && se & 16) && yt(V, v, N), D && jt(y);
    }
    (be && (Te = Y && Y.onVnodeUnmounted) || pe) && Zt(() => {
      Te && wn(Te, v, y), pe && Ss(y, null, v, "unmounted");
    }, N);
  }, jt = (y) => {
    const { type: v, el: N, anchor: D, transition: U } = y;
    if (v === Re) {
      en(N, D);
      return;
    }
    if (v === ki) {
      x(y);
      return;
    }
    const P = () => {
      r(N), U && !U.persisted && U.afterLeave && U.afterLeave();
    };
    if (y.shapeFlag & 1 && U && !U.persisted) {
      const { leave: Y, delayLeave: q } = U, V = () => Y(N, P);
      q ? q(y.el, P, V) : V();
    } else
      P();
  }, en = (y, v) => {
    let N;
    for (; y !== v; )
      N = T(y), r(y), y = N;
    r(v);
  }, De = (y, v, N) => {
    const {
      bum: D,
      scope: U,
      job: P,
      subTree: Y,
      um: q,
      m: V,
      a: H,
      parent: se,
      slots: { __: X }
    } = y;
    Ml(V), Ml(H), D && bi(D), se && Se(X) && X.forEach((J) => {
      se.renderCache[J] = void 0;
    }), U.stop(), P && (P.flags |= 8, We(Y, y, v, N)), q && Zt(q, v), Zt(() => {
      y.isUnmounted = !0;
    }, v), v && v.pendingBranch && !v.isUnmounted && y.asyncDep && !y.asyncResolved && y.suspenseId === v.pendingId && (v.deps--, v.deps === 0 && v.resolve());
  }, yt = (y, v, N, D = !1, U = !1, P = 0) => {
    for (let Y = P; Y < y.length; Y++)
      We(y[Y], v, N, D, U);
  }, Bt = (y) => {
    if (y.shapeFlag & 6)
      return Bt(y.component.subTree);
    if (y.shapeFlag & 128)
      return y.suspense.next();
    const v = T(y.anchor || y.el), N = v && v[Vh];
    return N ? T(N) : v;
  };
  let Wt = !1;
  const qt = (y, v, N) => {
    y == null ? v._vnode && We(v._vnode, null, null, !0) : z(
      v._vnode || null,
      y,
      v,
      null,
      null,
      null,
      N
    ), v._vnode = y, Wt || (Wt = !0, Rl(), pu(), Wt = !1);
  }, Lt = {
    p: z,
    um: We,
    m: ot,
    r: jt,
    mt: ze,
    mc: ne,
    pc: ye,
    pbc: ge,
    n: Bt,
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
  if (Se(s) && Se(r))
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
    const f = e[s];
    if (f !== 0) {
      if (r = n[n.length - 1], e[r] < f) {
        t[s] = r, n.push(s);
        continue;
      }
      for (i = 0, o = n.length - 1; i < o; )
        a = i + o >> 1, e[n[a]] < f ? i = a + 1 : o = a;
      f < e[n[i]] && (i > 0 && (t[s] = n[i - 1]), n[i] = s);
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
  let f;
  if (Wr) {
    if (i === "sync") {
      const O = Sd();
      f = O.__watcherHandles || (O.__watcherHandles = []);
    } else if (!l) {
      const O = () => {
      };
      return O.stop = Sn, O.resume = Sn, O.pause = Sn, O;
    }
  }
  const u = Ft;
  a.call = (O, L, z) => xn(O, u, L, z);
  let b = !1;
  i === "post" ? a.scheduler = (O) => {
    Zt(O, u && u.suspense);
  } : i !== "sync" && (b = !0, a.scheduler = (O, L) => {
    L ? O() : La(O);
  }), a.augmentJob = (O) => {
    t && (O.flags |= 4), b && (O.flags |= 2, u && (O.id = u.uid, O.i = u));
  };
  const T = zh(e, t, a);
  return Wr && (f ? f.push(T) : l && T()), T;
}
function Ed(e, t, n) {
  const s = this.proxy, r = gt(e) ? e.includes(".") ? Pu(s, e) : () => s[e] : e.bind(s, s);
  let i;
  xe(t) ? i = t : (i = t.handler, n = t);
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
  o && (o.trim && (r = n.map((u) => gt(u) ? u.trim() : u)), o.number && (r = n.map(Qo)));
  let a, l = s[a = Eo(t)] || // also try camelCase event handler (#2249)
  s[a = Eo(cs(t))];
  !l && i && (l = s[a = Eo(ds(t))]), l && xn(
    l,
    e,
    6,
    r
  );
  const f = s[a + "Once"];
  if (f) {
    if (!e.emitted)
      e.emitted = {};
    else if (e.emitted[a])
      return;
    e.emitted[a] = !0, xn(
      f,
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
  if (!xe(e)) {
    const l = (f) => {
      const u = Mu(f, t, !0);
      u && (a = !0, Ot(o, u));
    };
    !n && t.mixins.length && t.mixins.forEach(l), e.extends && l(e.extends), e.mixins && e.mixins.forEach(l);
  }
  return !i && !a ? (ct(e) && s.set(e, null), null) : (Se(i) ? i.forEach((l) => o[l] = null) : Ot(o, i), ct(e) && s.set(e, o), o);
}
function oo(e, t) {
  return !e || !Xi(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), Ke(e, t[0].toLowerCase() + t.slice(1)) || Ke(e, ds(t)) || Ke(e, t));
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
    render: f,
    renderCache: u,
    props: b,
    data: T,
    setupState: O,
    ctx: L,
    inheritAttrs: z
  } = e, ue = $i(e);
  let C, fe;
  try {
    if (n.shapeFlag & 4) {
      const x = r || s, M = x;
      C = An(
        f.call(
          M,
          x,
          u,
          b,
          O,
          T,
          L
        )
      ), fe = a;
    } else {
      const x = t;
      C = An(
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
    Fr.length = 0, no(x, e, 1), C = Dt(fs);
  }
  let me = C;
  if (fe && z !== !1) {
    const x = Object.keys(fe), { shapeFlag: M } = me;
    x.length && M & 7 && (i && x.some(ka) && (fe = Id(
      fe,
      i
    )), me = or(me, fe, !1, !0));
  }
  return n.dirs && (me = or(me, null, !1, !0), me.dirs = me.dirs ? me.dirs.concat(n.dirs) : n.dirs), n.transition && Na(me, n.transition), C = me, $i(ue), C;
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
  const { props: s, children: r, component: i } = e, { props: o, children: a, patchFlag: l } = t, f = i.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (n && l >= 0) {
    if (l & 1024)
      return !0;
    if (l & 16)
      return s ? Fl(s, o, f) : !!o;
    if (l & 8) {
      const u = t.dynamicProps;
      for (let b = 0; b < u.length; b++) {
        const T = u[b];
        if (o[T] !== s[T] && !oo(f, T))
          return !0;
      }
    }
  } else
    return (r || a) && (!a || !a.$stable) ? !0 : s === o ? !1 : s ? o ? Fl(s, o, f) : !0 : !!o;
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
  t && t.pendingBranch ? Se(e) ? t.effects.push(...e) : t.effects.push(e) : Wh(e);
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
    Dt(
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
}) => (typeof e == "number" && (e = "" + e), e != null ? gt(e) || It(e) || xe(e) ? { i: un, r: e, k: t, f: !!n } : e : null);
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
    ctx: un
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
const Dt = Md;
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
    a && !gt(a) && (t.class = Le(a)), ct(l) && (Oa(l) && !Se(l) && (l = Ot({}, l)), t.style = Ee(l));
  }
  const o = gt(e) ? 1 : Du(e) ? 128 : Kh(e) ? 64 : ct(e) ? 4 : xe(e) ? 2 : 0;
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
  const { props: r, ref: i, patchFlag: o, children: a, transition: l } = e, f = t ? Fd(r || {}, t) : r, u = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: f,
    key: f && Bu(f),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && i ? Se(i) ? i.concat(Ti(t)) : [i, Ti(t)] : Ti(t)
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
    u,
    l.clone(u)
  ), u;
}
function Nn(e = " ", t = 0) {
  return Dt(ao, null, e, t);
}
function No(e, t) {
  const n = Dt(ki, null, e);
  return n.staticCount = t, n;
}
function ee(e = "", t = !1) {
  return t ? (w(), ss(fs, null, e)) : Dt(fs, null, e);
}
function An(e) {
  return e == null || typeof e == "boolean" ? Dt(fs) : Se(e) ? Dt(
    Re,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : $u(e) ? rs(e) : Dt(ao, null, String(e));
}
function rs(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : or(e);
}
function Da(e, t) {
  let n = 0;
  const { shapeFlag: s } = e;
  if (t == null)
    t = null;
  else if (Se(t))
    n = 16;
  else if (typeof t == "object")
    if (s & 65) {
      const r = t.default;
      r && (r._c && (r._d = !1), Da(e, r()), r._c && (r._d = !0));
      return;
    } else {
      n = 32;
      const r = t._;
      !r && !Su(t) ? t._ctx = un : r === 3 && un && (un.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else xe(t) ? (t = { default: t, _ctx: un }, n = 32) : (t = String(t), s & 64 ? (n = 16, t = [Nn(t)]) : n = 8);
  e.children = t, e.shapeFlag |= n;
}
function Fd(...e) {
  const t = {};
  for (let n = 0; n < e.length; n++) {
    const s = e[n];
    for (const r in s)
      if (r === "class")
        t.class !== s.class && (t.class = Le([t.class, s.class]));
      else if (r === "style")
        t.style = Ee([t.style, s.style]);
      else if (Xi(r)) {
        const i = t[r], o = s[r];
        o && i !== o && !(Se(i) && i.includes(o)) && (t[r] = i ? [].concat(i, o) : o);
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
let Ft = null;
const zd = () => Ft || un;
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
    (n) => Ft = n
  ), la = t(
    "__VUE_SSR_SETTERS__",
    (n) => Wr = n
  );
}
const Kr = (e) => {
  const t = Ft;
  return Ui(e), e.scope.on(), () => {
    e.scope.off(), Ui(t);
  };
}, Bl = () => {
  Ft && Ft.scope.off(), Ui(null);
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
  xe(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : ct(t) && (e.setupState = fu(t)), zu(e);
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
  return xe(e) && "__vccOpts" in e;
}
const oe = (e, t) => Bh(e, t, Wr), Kd = "3.5.18";
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
  if (Se(n))
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
      const f = i[t] = cp(
        s,
        r
      );
      Xs(e, a, f, l);
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
  if (Se(t)) {
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
    return !!(t === "innerHTML" || t === "textContent" || t in e && Xl(t) && xe(n));
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
  return Se(t) ? (n) => bi(t, n) : t;
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
    !xe(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
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
  const n = e.replace("#", ""), s = parseInt(n.substr(0, 2), 16), r = parseInt(n.substr(2, 2), 16), i = parseInt(n.substr(4, 2), 16), o = sr(e), a = o ? Math.min(255, s + t) : Math.max(0, s - t), l = o ? Math.min(255, r + t) : Math.max(0, r - t), f = o ? Math.min(255, i + t) : Math.max(0, i - t);
  return `#${a.toString(16).padStart(2, "0")}${l.toString(16).padStart(2, "0")}${f.toString(16).padStart(2, "0")}`;
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
function Ge(e, t = "") {
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
}, Ap = /^(?:[ \t]*(?:\n|$))+/, Sp = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/, Ep = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, Gr = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, xp = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, $a = /(?:[*+-]|\d{1,9}[.)])/, Vu = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/, Ku = Ge(Vu).replace(/bull/g, $a).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(), Cp = Ge(Vu).replace(/bull/g, $a).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(), Ba = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/, Rp = /^[^\n]+/, Ua = /(?!\s*\])(?:\\.|[^\[\]\\])+/, Ip = Ge(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", Ua).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), Op = Ge(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, $a).getRegex(), co = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", za = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, Lp = Ge(
  "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))",
  "i"
).replace("comment", za).replace("tag", co).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), Gu = Ge(Ba).replace("hr", Gr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", co).getRegex(), Np = Ge(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", Gu).getRegex(), Ha = {
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
}, ec = Ge(
  "^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"
).replace("hr", Gr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", co).getRegex(), Pp = {
  ...Ha,
  lheading: Cp,
  table: ec,
  paragraph: Ge(Ba).replace("hr", Gr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", ec).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", co).getRegex()
}, Mp = {
  ...Ha,
  html: Ge(
    `^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`
  ).replace("comment", za).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
  heading: /^(#{1,6})(.*)(?:\n+|$)/,
  fences: $r,
  // fences not supported
  lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  paragraph: Ge(Ba).replace("hr", Gr).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", Ku).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
}, Dp = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, Fp = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, Yu = /^( {2,}|\\)\n(?!\s*$)/, $p = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, uo = /[\p{P}\p{S}]/u, ja = /[\s\p{P}\p{S}]/u, Xu = /[^\s\p{P}\p{S}]/u, Bp = Ge(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, ja).getRegex(), Zu = /(?!~)[\p{P}\p{S}]/u, Up = /(?!~)[\s\p{P}\p{S}]/u, zp = /(?:[^\s\p{P}\p{S}]|~)/u, Hp = /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g, Ju = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/, jp = Ge(Ju, "u").replace(/punct/g, uo).getRegex(), Wp = Ge(Ju, "u").replace(/punct/g, Zu).getRegex(), Qu = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", qp = Ge(Qu, "gu").replace(/notPunctSpace/g, Xu).replace(/punctSpace/g, ja).replace(/punct/g, uo).getRegex(), Vp = Ge(Qu, "gu").replace(/notPunctSpace/g, zp).replace(/punctSpace/g, Up).replace(/punct/g, Zu).getRegex(), Kp = Ge(
  "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)",
  "gu"
).replace(/notPunctSpace/g, Xu).replace(/punctSpace/g, ja).replace(/punct/g, uo).getRegex(), Gp = Ge(/\\(punct)/, "gu").replace(/punct/g, uo).getRegex(), Yp = Ge(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), Xp = Ge(za).replace("(?:-->|$)", "-->").getRegex(), Zp = Ge(
  "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>"
).replace("comment", Xp).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), Hi = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/, Jp = Ge(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", Hi).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), ef = Ge(/^!?\[(label)\]\[(ref)\]/).replace("label", Hi).replace("ref", Ua).getRegex(), tf = Ge(/^!?\[(ref)\](?:\[\])?/).replace("ref", Ua).getRegex(), Qp = Ge("reflink|nolink(?!\\()", "g").replace("reflink", ef).replace("nolink", tf).getRegex(), Wa = {
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
  link: Ge(/^!?\[(label)\]\((.*?)\)/).replace("label", Hi).getRegex(),
  reflink: Ge(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", Hi).getRegex()
}, fa = {
  ...Wa,
  emStrongRDelimAst: Vp,
  emStrongLDelim: Wp,
  url: Ge(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, "i").replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
  _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
}, tm = {
  ...fa,
  br: Ge(Yu).replace("{2,}", "*").getRegex(),
  text: Ge(fa.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
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
    if ($t.escapeTest.test(e))
      return e.replace($t.escapeReplace, tc);
  } else if ($t.escapeTestNoEncode.test(e))
    return e.replace($t.escapeReplaceNoEncode, tc);
  return e;
}
function nc(e) {
  try {
    e = encodeURI(e).replace($t.percentDecode, "%");
  } catch {
    return null;
  }
  return e;
}
function sc(e, t) {
  var i;
  const n = e.replace($t.findPipe, (o, a, l) => {
    let f = !1, u = a;
    for (; --u >= 0 && l[u] === "\\"; ) f = !f;
    return f ? "|" : " |";
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
        const f = a.join(`
`), u = f.replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
        s = s ? `${s}
${f}` : f, r = r ? `${r}
${u}` : u;
        const b = this.lexer.state.top;
        if (this.lexer.state.top = !0, this.lexer.blockTokens(u, i, !0), this.lexer.state.top = b, n.length === 0)
          break;
        const T = i.at(-1);
        if ((T == null ? void 0 : T.type) === "code")
          break;
        if ((T == null ? void 0 : T.type) === "blockquote") {
          const O = T, L = O.raw + `
` + n.join(`
`), z = this.blockquote(L);
          i[i.length - 1] = z, s = s.substring(0, s.length - O.raw.length) + z.raw, r = r.substring(0, r.length - O.text.length) + z.text;
          break;
        } else if ((T == null ? void 0 : T.type) === "list") {
          const O = T, L = O.raw + `
` + n.join(`
`), z = this.list(L);
          i[i.length - 1] = z, s = s.substring(0, s.length - T.raw.length) + z.raw, r = r.substring(0, r.length - O.raw.length) + z.raw, n = L.substring(i.at(-1).raw.length).split(`
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
        let l = !1, f = "", u = "";
        if (!(t = i.exec(e)) || this.rules.block.hr.test(e))
          break;
        f = t[0], e = e.substring(f.length);
        let b = t[2].split(`
`, 1)[0].replace(this.rules.other.listReplaceTabs, (C) => " ".repeat(3 * C.length)), T = e.split(`
`, 1)[0], O = !b.trim(), L = 0;
        if (this.options.pedantic ? (L = 2, u = b.trimStart()) : O ? L = t[1].length + 1 : (L = t[2].search(this.rules.other.nonSpaceChar), L = L > 4 ? 1 : L, u = b.slice(L), L += t[1].length), O && this.rules.other.blankLine.test(T) && (f += T + `
`, e = e.substring(T.length + 1), l = !0), !l) {
          const C = this.rules.other.nextBulletRegex(L), fe = this.rules.other.hrRegex(L), me = this.rules.other.fencesBeginRegex(L), x = this.rules.other.headingBeginRegex(L), M = this.rules.other.htmlBeginRegex(L);
          for (; e; ) {
            const S = e.split(`
`, 1)[0];
            let j;
            if (T = S, this.options.pedantic ? (T = T.replace(this.rules.other.listReplaceNesting, "  "), j = T) : j = T.replace(this.rules.other.tabCharGlobal, "    "), me.test(T) || x.test(T) || M.test(T) || C.test(T) || fe.test(T))
              break;
            if (j.search(this.rules.other.nonSpaceChar) >= L || !T.trim())
              u += `
` + j.slice(L);
            else {
              if (O || b.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || me.test(b) || x.test(b) || fe.test(b))
                break;
              u += `
` + T;
            }
            !O && !T.trim() && (O = !0), f += S + `
`, e = e.substring(S.length + 1), b = j.slice(L);
          }
        }
        r.loose || (o ? r.loose = !0 : this.rules.other.doubleBlankLine.test(f) && (o = !0));
        let z = null, ue;
        this.options.gfm && (z = this.rules.other.listIsTask.exec(u), z && (ue = z[0] !== "[ ] ", u = u.replace(this.rules.other.listReplaceTask, ""))), r.items.push({
          type: "list_item",
          raw: f,
          task: !!z,
          checked: ue,
          loose: !1,
          text: u,
          tokens: []
        }), r.raw += f;
      }
      const a = r.items.at(-1);
      if (a)
        a.raw = a.raw.trimEnd(), a.text = a.text.trimEnd();
      else
        return;
      r.raw = r.raw.trimEnd();
      for (let l = 0; l < r.items.length; l++)
        if (this.lexer.state.top = !1, r.items[l].tokens = this.lexer.blockTokens(r.items[l].text, []), !r.loose) {
          const f = r.items[l].tokens.filter((b) => b.type === "space"), u = f.length > 0 && f.some((b) => this.rules.other.anyLine.test(b.raw));
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
        i.rows.push(sc(a, i.header.length).map((l, f) => ({
          text: l,
          tokens: this.lexer.inline(l),
          header: !1,
          align: i.align[f]
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
      let o, a, l = i, f = 0;
      const u = s[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      for (u.lastIndex = 0, t = t.slice(-1 * e.length + i); (s = u.exec(t)) != null; ) {
        if (o = s[1] || s[2] || s[3] || s[4] || s[5] || s[6], !o) continue;
        if (a = [...o].length, s[3] || s[4]) {
          l += a;
          continue;
        } else if ((s[5] || s[6]) && i % 3 && !((i + a) % 3)) {
          f += a;
          continue;
        }
        if (l -= a, l > 0) continue;
        a = Math.min(a, a + l + f);
        const b = [...s[0]][0].length, T = e.slice(0, i + s.index + b + a);
        if (Math.min(i, a) % 2) {
          const L = T.slice(1, -1);
          return {
            type: "em",
            raw: T,
            text: L,
            tokens: this.lexer.inlineTokens(L)
          };
        }
        const O = T.slice(2, -2);
        return {
          type: "strong",
          raw: T,
          text: O,
          tokens: this.lexer.inlineTokens(O)
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
      other: $t,
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
      if ((i = (r = this.options.extensions) == null ? void 0 : r.block) != null && i.some((f) => (a = f.call({ lexer: this }, t, n)) ? (t = t.substring(a.raw.length), n.push(a), !0) : !1))
        continue;
      if (a = this.tokenizer.space(t)) {
        t = t.substring(a.raw.length);
        const f = n.at(-1);
        a.raw.length === 1 && f !== void 0 ? f.raw += `
` : n.push(a);
        continue;
      }
      if (a = this.tokenizer.code(t)) {
        t = t.substring(a.raw.length);
        const f = n.at(-1);
        (f == null ? void 0 : f.type) === "paragraph" || (f == null ? void 0 : f.type) === "text" ? (f.raw += `
` + a.raw, f.text += `
` + a.text, this.inlineQueue.at(-1).src = f.text) : n.push(a);
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
        const f = n.at(-1);
        (f == null ? void 0 : f.type) === "paragraph" || (f == null ? void 0 : f.type) === "text" ? (f.raw += `
` + a.raw, f.text += `
` + a.raw, this.inlineQueue.at(-1).src = f.text) : this.tokens.links[a.tag] || (this.tokens.links[a.tag] = {
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
        let f = 1 / 0;
        const u = t.slice(1);
        let b;
        this.options.extensions.startBlock.forEach((T) => {
          b = T.call({ lexer: this }, u), typeof b == "number" && b >= 0 && (f = Math.min(f, b));
        }), f < 1 / 0 && f >= 0 && (l = t.substring(0, f + 1));
      }
      if (this.state.top && (a = this.tokenizer.paragraph(l))) {
        const f = n.at(-1);
        s && (f == null ? void 0 : f.type) === "paragraph" ? (f.raw += `
` + a.raw, f.text += `
` + a.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = f.text) : n.push(a), s = l.length !== t.length, t = t.substring(a.raw.length);
        continue;
      }
      if (a = this.tokenizer.text(t)) {
        t = t.substring(a.raw.length);
        const f = n.at(-1);
        (f == null ? void 0 : f.type) === "text" ? (f.raw += `
` + a.raw, f.text += `
` + a.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = f.text) : n.push(a);
        continue;
      }
      if (t) {
        const f = "Infinite loop on byte: " + t.charCodeAt(0);
        if (this.options.silent) {
          console.error(f);
          break;
        } else
          throw new Error(f);
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
    var a, l, f;
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
      if ((l = (a = this.options.extensions) == null ? void 0 : a.inline) != null && l.some((T) => (u = T.call({ lexer: this }, t, n)) ? (t = t.substring(u.raw.length), n.push(u), !0) : !1))
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
        const T = n.at(-1);
        u.type === "text" && (T == null ? void 0 : T.type) === "text" ? (T.raw += u.raw, T.text += u.text) : n.push(u);
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
      let b = t;
      if ((f = this.options.extensions) != null && f.startInline) {
        let T = 1 / 0;
        const O = t.slice(1);
        let L;
        this.options.extensions.startInline.forEach((z) => {
          L = z.call({ lexer: this }, O), typeof L == "number" && L >= 0 && (T = Math.min(T, L));
        }), T < 1 / 0 && T >= 0 && (b = t.substring(0, T + 1));
      }
      if (u = this.tokenizer.inlineText(b)) {
        t = t.substring(u.raw.length), u.raw.slice(-1) !== "_" && (o = u.raw.slice(-1)), i = !0;
        const T = n.at(-1);
        (T == null ? void 0 : T.type) === "text" ? (T.raw += u.raw, T.text += u.text) : n.push(u);
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
    const s = (i = (t || "").match($t.notSpaceStart)) == null ? void 0 : i[0], r = e.replace($t.endingNewline, "") + `
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
        const f = a, u = this.options.extensions.renderers[f.type].call({ parser: this }, f);
        if (u !== !1 || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "paragraph", "text"].includes(f.type)) {
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
          let f = l, u = this.renderer.text(f);
          for (; o + 1 < t.length && t[o + 1].type === "text"; )
            f = t[++o], u += `
` + this.renderer.text(f);
          n ? s += this.renderer.paragraph({
            type: "paragraph",
            raw: u,
            text: u,
            tokens: [{ type: "text", raw: u, text: u, escaped: !0 }]
          }) : s += u;
          continue;
        }
        default: {
          const f = 'Token with "' + l.type + '" type was not found.';
          if (this.options.silent)
            return console.error(f), "";
          throw new Error(f);
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
        const f = this.options.extensions.renderers[a.type].call({ parser: this }, a);
        if (f !== !1 || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(a.type)) {
          s += f || "";
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
          const f = 'Token with "' + l.type + '" type was not found.';
          if (this.options.silent)
            return console.error(f), "";
          throw new Error(f);
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
          r[o] = (...f) => {
            let u = a.apply(r, f);
            return u === !1 && (u = l.apply(r, f)), u || "";
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
          r[o] = (...f) => {
            let u = a.apply(r, f);
            return u === !1 && (u = l.apply(r, f)), u;
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
          Ei.passThroughHooks.has(i) ? r[o] = (f) => {
            if (this.defaults.async)
              return Promise.resolve(a.call(r, f)).then((b) => l.call(r, b));
            const u = a.call(r, f);
            return l.call(r, u);
          } : r[o] = (...f) => {
            let u = a.apply(r, f);
            return u === !1 && (u = l.apply(r, f)), u;
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
        return Promise.resolve(i.hooks ? i.hooks.preprocess(n) : n).then((f) => a(f, i)).then((f) => i.hooks ? i.hooks.processAllTokens(f) : f).then((f) => i.walkTokens ? Promise.all(this.walkTokens(f, i.walkTokens)).then(() => f) : f).then((f) => l(f, i)).then((f) => i.hooks ? i.hooks.postprocess(f) : f).catch(o);
      try {
        i.hooks && (n = i.hooks.preprocess(n));
        let f = a(n, i);
        i.hooks && (f = i.hooks.processAllTokens(f)), i.walkTokens && this.walkTokens(f, i.walkTokens);
        let u = l(f, i);
        return i.hooks && (u = i.hooks.postprocess(u)), u;
      } catch (f) {
        return o(f);
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
function je(e, t) {
  return Ms.parse(e, t);
}
je.options = je.setOptions = function(e) {
  return Ms.setOptions(e), je.defaults = Ms.defaults, qu(je.defaults), je;
};
je.getDefaults = Fa;
je.defaults = Fs;
je.use = function(...e) {
  return Ms.use(...e), je.defaults = Ms.defaults, qu(je.defaults), je;
};
je.walkTokens = function(e, t) {
  return Ms.walkTokens(e, t);
};
je.parseInline = Ms.parseInline;
je.Parser = $n;
je.parser = $n.parse;
je.Renderer = Wi;
je.TextRenderer = qa;
je.Lexer = Fn;
je.lexer = Fn.lex;
je.Tokenizer = ji;
je.Hooks = Ei;
je.parse = je;
je.options;
je.setOptions;
je.use;
je.walkTokens;
je.parseInline;
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
    var s, r, i, o, a = [], l = !0, f = !1;
    try {
      if (i = (n = n.call(e)).next, t !== 0) for (; !(l = (s = i.call(n)).done) && (a.push(s.value), a.length !== t); l = !0) ;
    } catch (u) {
      f = !0, r = u;
    } finally {
      try {
        if (!l && n.return != null && (o = n.return(), Object(o) !== o)) return;
      } finally {
        if (f) throw r;
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
let bt = Object.freeze, kt = Object.seal, Zs = Object.create, sf = typeof Reflect < "u" && Reflect, pa = sf.apply, ma = sf.construct;
bt || (bt = function(t) {
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
const Os = _t(Array.prototype.forEach), pm = _t(Array.prototype.lastIndexOf), ac = _t(Array.prototype.pop), kr = _t(Array.prototype.push), mm = _t(Array.prototype.splice), rr = Array.isArray, Cr = _t(String.prototype.toLowerCase), Fo = _t(String.prototype.toString), lc = _t(String.prototype.match), Tr = _t(String.prototype.replace), cc = _t(String.prototype.indexOf), gm = _t(String.prototype.trim), _m = _t(Number.prototype.toString), ym = _t(Boolean.prototype.toString), uc = typeof BigInt > "u" ? null : _t(BigInt.prototype.toString), fc = typeof Symbol > "u" ? null : _t(Symbol.prototype.toString), Ht = _t(Object.prototype.hasOwnProperty), Ar = _t(Object.prototype.toString), Ct = _t(RegExp.prototype.test), Cs = vm(TypeError);
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
    Ht(e, t) || (e[t] = null);
  return e;
}
function Jt(e) {
  const t = Zs(null);
  for (const s of nf(e)) {
    var n = cm(s, 2);
    const r = n[0], i = n[1];
    Ht(e, r) && (rr(i) ? t[r] = bm(i) : i && typeof i == "object" && i.constructor === Object ? t[r] = Jt(i) : t[r] = i);
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
      const t = e, n = an(t, "toString");
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
function an(e, t) {
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
const hc = bt(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]), $o = bt(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "enterkeyhint", "exportparts", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "inputmode", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "part", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]), Bo = bt(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]), Tm = bt(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]), Uo = bt(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]), Am = bt(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]), dc = bt(["#text"]), pc = bt(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "command", "commandfor", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "exportparts", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inert", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "part", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "slot", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns"]), zo = bt(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dominant-baseline", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "mask-type", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "pointer-events", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-orientation", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "vector-effect", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]), mc = bt(["accent", "accentunder", "align", "bevelled", "close", "columnalign", "columnlines", "columnspacing", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lquote", "lspace", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]), gi = bt(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]), Sm = kt(/{{[\w\W]*|^[\w\W]*}}/g), Em = kt(/<%[\w\W]*|^[\w\W]*%>/g), xm = kt(/\${[\w\W]*/g), Cm = kt(/^data-[\-\w.\u00B7-\uFFFF]+$/), Rm = kt(/^aria-[\-\w]+$/), gc = kt(
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
}, rf = ["style", "script", "xmp", "iframe", "noembed", "noframes", "plaintext", "noscript"], Dm = bt(Fe({}, rf)), Fm = function() {
  const e = {};
  return Os(rf, (t) => {
    e[t] = kt(new RegExp("</" + t + "(?=[\\t\\n\\f\\r />])", "i"));
  }), bt(e);
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
  return Ht(t, n) && rr(t[n]) ? Fe(r.base ? Jt(r.base) : {}, t[n], r.transform) : s;
}, Ho = function(t, n, s) {
  const r = Ht(t, n) ? t[n] : void 0;
  return r && typeof r == "object" ? Jt(r) : s();
};
function of() {
  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : $m();
  const t = (K) => of(K);
  if (t.version = "3.4.15", t.removed = [], !e || !e.document || e.document.nodeType !== Xt.document || !e.Element)
    return t.isSupported = !1, t;
  let n = e.document;
  const s = n, r = s.currentScript;
  e.DocumentFragment;
  const i = e.HTMLTemplateElement, o = e.Node, a = e.Element, l = e.NodeFilter, f = e.NamedNodeMap;
  f === void 0 && (e.NamedNodeMap || e.MozNamedAttrMap), e.HTMLFormElement;
  const u = e.DOMParser, b = e.trustedTypes, T = a.prototype, O = an(T, "cloneNode"), L = an(T, "remove"), z = an(T, "removeAttributeNode"), ue = an(T, "nextSibling"), C = an(T, "childNodes"), fe = an(T, "parentNode"), me = an(T, "shadowRoot"), x = an(T, "attributes"), M = o && o.prototype ? an(o.prototype, "nodeType") : null, S = o && o.prototype ? an(o.prototype, "nodeName") : null, j = o && o.prototype ? an(o.prototype, "ownerDocument") : null, ne = function(d) {
    return M ? M(d) : d.nodeType;
  }, ce = function(d) {
    return S ? S(d) : d.nodeName;
  };
  if (typeof i == "function") {
    const K = n.createElement("template");
    K.content && K.content.ownerDocument && (n = K.content.ownerDocument);
  }
  let ge, Oe = "", ke, Ye = !1, ze = 0;
  const st = function() {
    if (ze > 0)
      throw Cs('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.');
  }, he = function(d) {
    st(), ze++;
    try {
      return ge.createHTML(d);
    } finally {
      ze--;
    }
  }, ve = function(d) {
    st(), ze++;
    try {
      return ge.createScriptURL(d);
    } finally {
      ze--;
    }
  }, ye = function() {
    return Ye || (ke = Bm(b, r), Ye = !0), ke;
  }, Qe = n, Xe = Qe.implementation, ot = Qe.createNodeIterator, We = Qe.createDocumentFragment, jt = Qe.getElementsByTagName, en = s.importNode;
  let De = vc();
  t.isSupported = typeof nf == "function" && typeof fe == "function" && Xe && Xe.createHTMLDocument !== void 0;
  const yt = Sm, Bt = Em, Wt = xm, qt = Cm, Lt = Rm, yn = Im, y = Om, v = Nm;
  let N = gc, D = null;
  const U = Fe({}, [...hc, ...$o, ...Bo, ...Uo, ...dc]);
  let P = null;
  const Y = Fe({}, [...pc, ...zo, ...mc, ...gi]);
  let q = Object.seal(Zs(null, {
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
  })), V = null, H = null;
  const se = Object.seal(Zs(null, {
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
  let X = !0, J = !0, de = !1, pe = !0, be = !1, Te = !0, Pe = !1, Ie = !1, W = null, c = null, _ = !1, I = !1, R = !1, $ = !1, re = !0, te = !1;
  const Ae = "user-content-";
  let Ce = !0, He = !1, Me = {}, $e = null;
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
  let hn = null;
  const $s = Fe({}, ["audio", "video", "img", "source", "image", "track"]);
  let Hn = null;
  const Yr = Fe({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), Ut = "http://www.w3.org/1998/Math/MathML", Nt = "http://www.w3.org/2000/svg", Vt = "http://www.w3.org/1999/xhtml";
  let Tt = Vt, jn = !1, Wn = null;
  const gs = Fe({}, [Ut, Nt, Vt], Fo), Xr = bt(["mi", "mo", "mn", "ms", "mtext"]);
  let Rn = Fe({}, Xr);
  const dn = bt(["annotation-xml"]);
  let Kt = Fe({}, dn);
  const Zr = Fe({}, ["title", "style", "font", "a", "script"]);
  let ft = null;
  const po = ["application/xhtml+xml", "text/html"], Jr = "text/html";
  let Be = null, qn = null;
  const _s = n.createElement("form"), Bs = function(d) {
    return d instanceof RegExp || d instanceof Function;
  }, lr = function() {
    let d = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (qn && qn === d)
      return;
    (!d || typeof d != "object") && (d = {}), d = Jt(d), ft = // eslint-disable-next-line unicorn/prefer-includes
    po.indexOf(d.PARSER_MEDIA_TYPE) === -1 ? Jr : d.PARSER_MEDIA_TYPE, Be = ft === "application/xhtml+xml" ? Fo : Cr, D = ts(d, "ALLOWED_TAGS", U, {
      transform: Be
    }), P = ts(d, "ALLOWED_ATTR", Y, {
      transform: Be
    }), Wn = ts(d, "ALLOWED_NAMESPACES", gs, {
      transform: Fo
    }), Hn = ts(d, "ADD_URI_SAFE_ATTR", Yr, {
      transform: Be,
      base: Yr
    }), hn = ts(d, "ADD_DATA_URI_TAGS", $s, {
      transform: Be,
      base: $s
    }), $e = ts(d, "FORBID_CONTENTS", rt, {
      transform: Be
    }), V = ts(d, "FORBID_TAGS", Jt({}), {
      transform: Be
    }), H = ts(d, "FORBID_ATTR", Jt({}), {
      transform: Be
    }), Me = Ht(d, "USE_PROFILES") ? d.USE_PROFILES && typeof d.USE_PROFILES == "object" ? Jt(d.USE_PROFILES) : d.USE_PROFILES : !1, X = d.ALLOW_ARIA_ATTR !== !1, J = d.ALLOW_DATA_ATTR !== !1, de = d.ALLOW_UNKNOWN_PROTOCOLS || !1, pe = d.ALLOW_SELF_CLOSE_IN_ATTR !== !1, be = d.SAFE_FOR_TEMPLATES || !1, Te = d.SAFE_FOR_XML !== !1, Pe = d.WHOLE_DOCUMENT || !1, I = d.RETURN_DOM || !1, R = d.RETURN_DOM_FRAGMENT || !1, $ = d.RETURN_TRUSTED_TYPE || !1, _ = d.FORCE_BODY || !1, re = d.SANITIZE_DOM !== !1, te = d.SANITIZE_NAMED_PROPS || !1, Ce = d.KEEP_CONTENT !== !1, He = d.IN_PLACE || !1, N = km(d.ALLOWED_URI_REGEXP) ? d.ALLOWED_URI_REGEXP : gc, Tt = typeof d.NAMESPACE == "string" ? d.NAMESPACE : Vt, Rn = Ho(
      d,
      "MATHML_TEXT_INTEGRATION_POINTS",
      () => Fe({}, Xr)
      // Default built-in map
    ), Kt = Ho(
      d,
      "HTML_INTEGRATION_POINTS",
      () => Fe({}, dn)
      // Default built-in map
    );
    const k = Ho(d, "CUSTOM_ELEMENT_HANDLING", () => Zs(null));
    if (q = Zs(null), Ht(k, "tagNameCheck") && Bs(k.tagNameCheck) && (q.tagNameCheck = k.tagNameCheck), Ht(k, "attributeNameCheck") && Bs(k.attributeNameCheck) && (q.attributeNameCheck = k.attributeNameCheck), Ht(k, "allowCustomizedBuiltInElements") && typeof k.allowCustomizedBuiltInElements == "boolean" && (q.allowCustomizedBuiltInElements = k.allowCustomizedBuiltInElements), kt(q), be && (J = !1), R && (I = !0), Me && (D = Fe({}, dc), P = Zs(null), Me.html === !0 && (Fe(D, hc), Fe(P, pc)), Me.svg === !0 && (Fe(D, $o), Fe(P, zo), Fe(P, gi)), Me.svgFilters === !0 && (Fe(D, Bo), Fe(P, zo), Fe(P, gi)), Me.mathMl === !0 && (Fe(D, Uo), Fe(P, mc), Fe(P, gi))), se.tagCheck = null, se.attributeCheck = null, Ht(d, "ADD_TAGS") && (typeof d.ADD_TAGS == "function" ? se.tagCheck = d.ADD_TAGS : rr(d.ADD_TAGS) && (D === U && (D = Jt(D)), Fe(D, d.ADD_TAGS, Be))), Ht(d, "ADD_ATTR") && (typeof d.ADD_ATTR == "function" ? se.attributeCheck = d.ADD_ATTR : rr(d.ADD_ATTR) && (P === Y && (P = Jt(P)), Fe(P, d.ADD_ATTR, Be))), Ht(d, "ADD_FORBID_CONTENTS") && rr(d.ADD_FORBID_CONTENTS) && ($e === rt && ($e = Jt($e)), Fe($e, d.ADD_FORBID_CONTENTS, Be)), Ce && (D["#text"] = !0), Pe && Fe(D, ["html", "head", "body"]), D.table && (Fe(D, ["tbody"]), delete V.tbody), d.TRUSTED_TYPES_POLICY) {
      if (typeof d.TRUSTED_TYPES_POLICY.createHTML != "function")
        throw Cs('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
      if (typeof d.TRUSTED_TYPES_POLICY.createScriptURL != "function")
        throw Cs('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
      const B = ge;
      ge = d.TRUSTED_TYPES_POLICY;
      try {
        Oe = he("");
      } catch (Q) {
        throw ge = B, Q;
      }
    } else d.TRUSTED_TYPES_POLICY === null ? (ge = void 0, Oe = "") : (ge === void 0 && (ge = ye()), ge && typeof Oe == "string" && (Oe = he("")));
    bt && bt(d), qn = d;
  }, ys = Fe({}, [...$o, ...Bo, ...Tm]), cr = Fe({}, [...Uo, ...Am]), Qr = function(d, k, B) {
    return k.namespaceURI === Vt ? d === "svg" : k.namespaceURI === Ut ? d === "svg" && (B === "annotation-xml" || Rn[B]) : !!ys[d];
  }, ei = function(d, k, B) {
    return k.namespaceURI === Vt ? d === "math" : k.namespaceURI === Nt ? d === "math" && Kt[B] : !!cr[d];
  }, ti = function(d, k, B) {
    return k.namespaceURI === Nt && !Kt[B] || k.namespaceURI === Ut && !Rn[B] ? !1 : !cr[d] && (Zr[d] || !ys[d]);
  }, ni = function(d) {
    let k = fe(d);
    (!k || !k.tagName) && (k = {
      namespaceURI: Tt,
      tagName: "template"
    });
    const B = Cr(d.tagName), Q = Cr(k.tagName);
    return Wn[d.namespaceURI] ? d.namespaceURI === Nt ? Qr(B, k, Q) : d.namespaceURI === Ut ? ei(B, k, Q) : d.namespaceURI === Vt ? ti(B, k, Q) : !!(ft === "application/xhtml+xml" && Wn[d.namespaceURI]) : !1;
  }, pn = function(d) {
    kr(t.removed, {
      element: d
    });
    try {
      fe(d).removeChild(d);
    } catch {
      if (L(d), !fe(d))
        throw Cs("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place");
    }
  }, si = function(d, k, B) {
    try {
      z(d, k);
    } catch {
      try {
        d.removeAttribute(B);
      } catch {
      }
    }
  }, Vn = function(d) {
    vs(d);
    const k = C(d);
    if (k) {
      const Q = [];
      Os(k, (ae) => {
        kr(Q, ae);
      }), Os(Q, (ae) => {
        try {
          L(ae);
        } catch {
        }
      });
    }
    const B = x(d);
    if (B)
      for (let Q = B.length - 1; Q >= 0; --Q) {
        const ae = B[Q], _e = ae && ae.name;
        typeof _e == "string" && si(d, ae, _e);
      }
  }, tn = function(d, k, B) {
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
      B ? z(k, B) : k.removeAttribute(d);
    } catch {
      try {
        k.removeAttribute(d);
      } catch {
      }
    }
    if (d === "is")
      if (I || R)
        try {
          pn(k);
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
        const Q = k[B], ae = Q && Q.name;
        typeof ae != "string" || P[Be(ae)] || si(d, Q, ae);
      }
  }, vs = function(d) {
    const k = [d];
    for (; k.length > 0; ) {
      const B = k.pop();
      ne(B) === Xt.element && ri(B);
      const ae = C(B);
      if (ae)
        for (let _e = ae.length - 1; _e >= 0; --_e)
          k.push(ae[_e]);
    }
  }, vn = function(d, k) {
    return Te ? d === "patchsrc" ? !0 : d === "for" && k !== "label" && k !== "output" : !1;
  }, bs = function(d) {
    if (!Te)
      return;
    const k = [d];
    for (; k.length > 0; ) {
      const B = k.pop(), Q = ne(B);
      if (Q === Xt.processingInstruction || Q === Xt.comment && Ct(yc, B.data)) {
        try {
          L(B);
        } catch {
        }
        continue;
      }
      if (Q === Xt.element) {
        const _e = B, Ze = Be(ce(B));
        try {
          _e.hasAttribute && _e.hasAttribute("patchsrc") && _e.removeAttribute("patchsrc"), _e.hasAttribute && _e.hasAttribute("for") && vn("for", Ze) && _e.removeAttribute("for");
        } catch {
        }
      }
      const ae = C(B);
      if (ae)
        for (let _e = ae.length - 1; _e >= 0; --_e)
          k.push(ae[_e]);
    }
  }, Us = function(d) {
    let k = null, B = null;
    if (_)
      d = "<remove></remove>" + d;
    else {
      const _e = lc(d, /^[\r\n\t ]+/);
      B = _e && _e[0];
    }
    ft === "application/xhtml+xml" && Tt === Vt && (d = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + d + "</body></html>");
    const Q = ge ? he(d) : d;
    if (Tt === Vt)
      try {
        k = new u().parseFromString(Q, ft);
      } catch {
      }
    if (!k || !k.documentElement) {
      k = Xe.createDocument(Tt, "template", null);
      try {
        k.documentElement.innerHTML = jn ? Oe : Q;
      } catch {
      }
    }
    const ae = k.body || k.documentElement;
    return d && B && ae.insertBefore(n.createTextNode(B), ae.childNodes[0] || null), Tt === Vt ? jt.call(k, Pe ? "html" : "body")[0] : Pe ? k.documentElement : ae;
  }, zs = function(d) {
    const k = j ? j(d) : d.ownerDocument;
    return ot.call(
      k || d,
      d,
      // eslint-disable-next-line no-bitwise
      l.SHOW_ELEMENT | l.SHOW_COMMENT | l.SHOW_TEXT | l.SHOW_PROCESSING_INSTRUCTION | l.SHOW_CDATA_SECTION,
      null
    );
  }, In = function(d) {
    return d = Tr(d, yt, " "), d = Tr(d, Bt, " "), d = Tr(d, Wt, " "), d;
  }, nn = function(d) {
    var k;
    d.normalize();
    const B = j ? j(d) : d.ownerDocument, Q = ot.call(
      B || d,
      d,
      // eslint-disable-next-line no-bitwise
      l.SHOW_TEXT | l.SHOW_COMMENT | l.SHOW_CDATA_SECTION | l.SHOW_PROCESSING_INSTRUCTION,
      null
    );
    let ae = Q.nextNode();
    for (; ae; )
      ae.data = In(ae.data), ae = Q.nextNode();
    const _e = (k = d.querySelectorAll) === null || k === void 0 ? void 0 : k.call(d, "template");
    _e && Os(_e, (Ze) => {
      mn(Ze.content) && nn(Ze.content);
    });
  }, Kn = function(d) {
    const k = S ? S(d) : null;
    return typeof k != "string" || Be(k) !== "form" ? !1 : typeof d.nodeName != "string" || typeof d.textContent != "string" || typeof d.removeChild != "function" || // Realm-safe NamedNodeMap detection: equality against the cached
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
    d.childNodes !== C(d);
  }, mn = function(d) {
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
  function wt(K, d, k) {
    K.length !== 0 && Os(K, (B) => {
      B.call(t, d, k, qn);
    });
  }
  const mo = function(d, k) {
    return !!(Te && d.hasChildNodes() && !Gn(d.firstElementChild) && Ct(_c, d.textContent) && Ct(_c, d.innerHTML) || Te && d.namespaceURI === Vt && Dm[k] && (Gn(d.firstElementChild) || typeof d.textContent == "string" && Ct(Fm[k], d.textContent)) || d.nodeType === Xt.processingInstruction || Te && d.nodeType === Xt.comment && Ct(yc, d.data));
  }, bn = function(d, k) {
    if (d instanceof RegExp)
      return Ct(d, k);
    if (d instanceof Function) {
      for (var B = arguments.length, Q = new Array(B > 2 ? B - 2 : 0), ae = 2; ae < B; ae++)
        Q[ae - 2] = arguments[ae];
      return !!d(k, ...Q);
    }
    return !1;
  }, ii = function(d, k, B) {
    if (!V[k] && Gt(k) && bn(q.tagNameCheck, k))
      return !1;
    if (Ce && !$e[k]) {
      const Q = fe(d), ae = C(d);
      if (ae && Q) {
        const _e = ae.length;
        for (let Ze = _e - 1; Ze >= 0; --Ze) {
          const at = d === B ? O(ae[Ze], !0) : ae[Ze];
          Q.insertBefore(at, ue(d));
        }
      }
    }
    return pn(d), !0;
  }, oi = function(d, k, B, Q) {
    return d.length === 0 ? k : k === B || k === Q ? Jt(k) : k;
  }, ur = function(d, k) {
    return d === k || fe(d) !== null ? !1 : (He && vs(d), !0);
  }, ws = function(d, k) {
    if (wt(De.beforeSanitizeElements, d, null), ur(d, k))
      return !0;
    if (Kn(d))
      return pn(d), !0;
    const B = Be(ce(d));
    if (D = oi(De.uponSanitizeElement, D, U, W), wt(De.uponSanitizeElement, d, {
      tagName: B,
      allowedTags: D
    }), ur(d, k))
      return !0;
    if (mo(d, B))
      return pn(d), !0;
    if (V[B] || !(se.tagCheck instanceof Function && se.tagCheck(B)) && !D[B]) {
      const ae = ii(d, B, k);
      return ae === !1 && wt(De.afterSanitizeElements, d, null), ae;
    }
    if (ne(d) === Xt.element && !ni(d) || (B === "noscript" || B === "noembed" || B === "noframes") && Ct(Pm, d.innerHTML))
      return pn(d), !0;
    if (be && d.nodeType === Xt.text) {
      const ae = In(d.textContent);
      d.textContent !== ae && (kr(t.removed, {
        element: d.cloneNode()
      }), d.textContent = ae);
    }
    return wt(De.afterSanitizeElements, d, null), !1;
  }, Hs = function(d, k, B) {
    if (H[k] || vn(k, d) || re && (k === "id" || k === "name") && (B in n || B in _s))
      return !1;
    const Q = P[k] || se.attributeCheck instanceof Function && se.attributeCheck(k, d);
    return J && Ct(qt, k) || X && Ct(Lt, k) ? !0 : Q ? Hn[k] || Ct(N, Tr(B, y, "")) || (k === "src" || k === "xlink:href" || k === "href") && d !== "script" && cc(B, "data:") === 0 && hn[d] || de && !Ct(yn, Tr(B, y, "")) ? !0 : !B : (
      // Condition a) covers a basically valid custom element tag name whose
      // tag passes the configured tagNameCheck and whose attribute name
      // passes the configured attributeNameCheck ...
      Gt(d) && bn(q.tagNameCheck, d) && bn(q.attributeNameCheck, k, d) || // Condition b) covers an `is` attribute whose value passes the
      // configured tagNameCheck while customized built-in elements are
      // allowed.
      k === "is" && q.allowCustomizedBuiltInElements && bn(q.tagNameCheck, B)
    );
  }, sn = Fe({}, ["annotation-xml", "color-profile", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "missing-glyph"]), Gt = function(d) {
    return !sn[Cr(d)] && Ct(v, d);
  }, ht = function(d, k, B, Q) {
    if (ge && typeof b == "object" && typeof b.getAttributeType == "function" && !B)
      switch (b.getAttributeType(d, k)) {
        case "TrustedHTML":
          return he(Q);
        case "TrustedScriptURL":
          return ve(Q);
      }
    return Q;
  }, vt = function(d, k, B, Q) {
    try {
      return B ? d.setAttributeNS(B, k, Q) : d.setAttribute(k, Q), Kn(d) ? (pn(d), !1) : !0;
    } catch {
      return tn(k, d), !1;
    }
  }, ut = function(d) {
    wt(De.beforeSanitizeAttributes, d, null);
    const k = d.attributes;
    if (!k || Kn(d))
      return;
    P = oi(De.uponSanitizeAttribute, P, Y, c);
    const B = {
      attrName: "",
      attrValue: "",
      keepAttr: !0,
      allowedAttributes: P,
      forceKeepAttr: void 0
    };
    let Q = k.length;
    const ae = Be(d.nodeName);
    for (; Q--; ) {
      const _e = k[Q], Ze = _e.name, at = _e.namespaceURI, Et = _e.value, xt = Be(Ze), fr = Et;
      let qe = Ze === "value" ? fr : gm(fr), ai = !1;
      if (B.attrName = xt, B.attrValue = qe, B.keepAttr = !0, B.forceKeepAttr = void 0, wt(De.uponSanitizeAttribute, d, B), qe = B.attrValue, te && (xt === "id" || xt === "name") && cc(qe, Ae) !== 0 && (tn(Ze, d, _e), qe = Ae + qe, ai = !0), Te && Ct(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, qe)) {
        tn(Ze, d, _e);
        continue;
      }
      if (xt === "attributename" && lc(qe, "href")) {
        tn(Ze, d, _e);
        continue;
      }
      if (!B.forceKeepAttr) {
        if (!B.keepAttr) {
          tn(Ze, d, _e);
          continue;
        }
        if (!pe && Ct(Mm, qe)) {
          tn(Ze, d, _e);
          continue;
        }
        if (be && (qe = In(qe)), !Hs(ae, xt, qe)) {
          tn(Ze, d, _e);
          continue;
        }
        qe = ht(ae, xt, at, qe), qe !== fr && vt(d, Ze, at, qe) && ai && ac(t.removed);
      }
    }
    wt(De.afterSanitizeAttributes, d, null);
  }, rn = function(d) {
    let k = null;
    const B = zs(d);
    for (wt(De.beforeSanitizeShadowDOM, d, null); k = B.nextNode(); )
      if (wt(De.uponSanitizeShadowNode, k, null), ws(k, d), ut(k), mn(k.content) && rn(k.content), ne(k) === Xt.element) {
        const Q = me(k);
        mn(Q) && (On(Q), rn(Q));
      }
    wt(De.afterSanitizeShadowDOM, d, null);
  }, On = function(d) {
    const k = [{
      node: d,
      shadow: null
    }];
    for (; k.length > 0; ) {
      const B = k.pop();
      if (B.shadow) {
        rn(B.shadow);
        continue;
      }
      const Q = B.node, _e = ne(Q) === Xt.element, Ze = C(Q);
      if (Ze)
        for (let at = Ze.length - 1; at >= 0; --at)
          k.push({
            node: Ze[at],
            shadow: null
          });
      if (_e) {
        const at = S ? S(Q) : null;
        if (typeof at == "string" && Be(at) === "template") {
          const Et = Q.content;
          mn(Et) && k.push({
            node: Et,
            shadow: null
          });
        }
      }
      if (_e) {
        const at = me(Q);
        mn(at) && k.push({
          node: null,
          shadow: at
        }, {
          node: at,
          shadow: null
        });
      }
    }
  };
  return t.sanitize = function(K) {
    let d = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, k = null, B = null, Q = null, ae = null;
    if (jn = !K, jn && (K = "<!-->"), typeof K != "string" && !Gn(K) && (K = wm(K), typeof K != "string"))
      throw Cs("dirty is not a string, aborting");
    if (!t.isSupported)
      return K;
    Ie ? (D = W, P = c) : lr(d), (De.uponSanitizeElement.length > 0 || De.uponSanitizeAttribute.length > 0) && (D = Jt(D)), De.uponSanitizeAttribute.length > 0 && (P = Jt(P)), t.removed = [];
    const _e = He && typeof K != "string" && Gn(K);
    if (_e) {
      bs(K);
      const Et = ce(K);
      if (typeof Et == "string") {
        const xt = Be(Et);
        if (!D[xt] || V[xt])
          throw Vn(K), Cs("root node is forbidden and cannot be sanitized in-place");
      }
      if (Kn(K))
        throw Vn(K), Cs("root node is clobbered and cannot be sanitized in-place");
      try {
        On(K);
      } catch (xt) {
        throw Vn(K), xt;
      }
    } else if (Gn(K))
      k = Us("<!---->"), B = k.ownerDocument.importNode(K, !0), B.nodeType === Xt.element && B.nodeName === "BODY" || B.nodeName === "HTML" ? k = B : k.appendChild(B), On(k);
    else {
      if (!I && !be && !Pe && // eslint-disable-next-line unicorn/prefer-includes
      K.indexOf("<") === -1)
        return ge && $ ? he(K) : K;
      if (k = Us(K), !k)
        return I ? null : $ ? Oe : "";
    }
    k && _ && pn(k.firstChild);
    const Ze = _e ? K : k;
    try {
      const Et = zs(Ze);
      for (; Q = Et.nextNode(); )
        ws(Q, Ze), ut(Q), mn(Q.content) && rn(Q.content);
    } catch (Et) {
      throw _e && (Vn(K), Os(t.removed, (xt) => {
        xt.element && vs(xt.element);
      })), Et;
    }
    if (_e)
      return Os(t.removed, (Et) => {
        Et.element && vs(Et.element);
      }), be && nn(K), K;
    if (I) {
      if (be && nn(k), R)
        for (ae = We.call(k.ownerDocument); k.firstChild; )
          ae.appendChild(k.firstChild);
      else
        ae = k;
      return (P.shadowroot || P.shadowrootmode) && (ae = en.call(s, ae, !0)), ae;
    }
    let at = Pe ? k.outerHTML : k.innerHTML;
    return Pe && D["!doctype"] && k.ownerDocument && k.ownerDocument.doctype && k.ownerDocument.doctype.name && Ct(Lm, k.ownerDocument.doctype.name) && (at = "<!DOCTYPE " + k.ownerDocument.doctype.name + `>
` + at), be && (at = In(at)), ge && $ ? he(at) : at;
  }, t.setConfig = function() {
    let K = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    lr(K), Ie = !0, W = D, c = P;
  }, t.clearConfig = function() {
    qn = null, Ie = !1, W = null, c = null, ge = ke, Oe = "";
  }, t.isValidAttribute = function(K, d, k) {
    qn || lr({});
    const B = Be(K), Q = Be(d);
    return Hs(B, Q, k);
  }, t.addHook = function(K, d) {
    typeof d == "function" && Ht(De, K) && kr(De[K], d);
  }, t.removeHook = function(K, d) {
    if (Ht(De, K)) {
      if (d !== void 0) {
        const k = pm(De[K], d);
        return k === -1 ? void 0 : mm(De[K], k, 1)[0];
      }
      return ac(De[K]);
    }
  }, t.removeHooks = function(K) {
    Ht(De, K) && (De[K] = []);
  }, t.removeAllHooks = function() {
    De = vc();
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
je.setOptions({
  renderer: new je.Renderer(),
  gfm: !0,
  breaks: !0
});
const xi = (e) => Um(je(e || "")), bc = "*", zm = /* @__PURE__ */ new Set(["null", "about:blank", ""]);
let ln = null;
const Br = (e) => e && !zm.has(e) ? e : null, Hm = (e) => {
  if (!e) return null;
  try {
    return Br(new URL(e).origin);
  } catch {
    return null;
  }
};
function af() {
  if (ln) return ln;
  if (window.parent === window)
    return ln = Br(window.location.origin) || bc, ln;
  try {
    const e = Br(window.parent.location.origin);
    if (e)
      return ln = e, ln;
  } catch {
  }
  try {
    const e = window.location.ancestorOrigins, t = e && e.length ? Br(e[0]) : null;
    if (t)
      return ln = t, ln;
  } catch {
  }
  return ln = Hm(document.referrer) || bc, ln;
}
function wc(e) {
  ln = Br(e) || ln;
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
      g("p", Km, Z(s.error || E(kc)), 1),
      g("div", Gm, [
        g("button", {
          type: "button",
          class: "new-chat-confirm__button",
          disabled: s.busy,
          onClick: r[0] || (r[0] = (i) => n("cancel"))
        }, Z(E(Wm)), 9, Ym),
        g("button", {
          type: "button",
          class: "new-chat-confirm__button new-chat-confirm__button--primary",
          disabled: s.busy,
          onClick: r[1] || (r[1] = (i) => n("confirm"))
        }, Z(E(jm)), 9, Xm)
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
    const n = e, s = t, r = ie(null), i = ie(null), o = ie(null), a = ["user", "bot", "agent", "system"], l = oe(
      () => n.messages.map((x, M) => ({ message: x, index: M })).filter(({ message: x }) => a.includes(x.message_type))
    ), f = oe(() => l.value.length > 0), u = (x) => {
      s("update:draft", x.target.value);
    }, b = () => {
      !(n.typingEnabled ?? n.inputEnabled) || !n.draft.trim() || s("send");
    }, T = (x) => {
      n.inputEnabled && s("ask", x);
    }, O = typeof navigator < "u" && /Mac|iPod|iPhone|iPad/.test(navigator.platform || ""), L = (x) => {
      if (x.key === "Escape") {
        x.preventDefault(), s("close");
        return;
      }
      const M = O ? x.metaKey && !x.ctrlKey : x.ctrlKey && !x.metaKey;
      n.hotkey && M && !x.altKey && (x.key === "k" || x.key === "K") && (x.preventDefault(), s("close"));
    }, z = () => {
      is(() => {
        var x;
        return (x = r.value) == null ? void 0 : x.focus();
      });
    };
    let ue = 0;
    const C = () => {
      if (!o.value) return;
      const x = o.value.closest(".askai"), M = i.value;
      if (!x || !M) return;
      const S = x.offsetHeight - M.offsetHeight, j = getComputedStyle(M), ne = parseFloat(j.paddingTop) + parseFloat(j.paddingBottom), ce = Math.ceil(S + ne + o.value.getBoundingClientRect().height);
      Math.abs(ce - ue) < 3 || (ue = ce, At({ type: "WIDGET_RESIZE", height: ce }));
    };
    let fe = null;
    const me = oe(
      () => l.value.reduce((x, { message: M, index: S }) => x + n.displayText(S, M.message || "").length, 0)
    );
    return pt(
      () => [l.value.length, me.value, n.loading],
      () => is(() => {
        i.value && (i.value.scrollTop = i.value.scrollHeight);
      })
    ), pt(() => n.newChatArmed, () => is(() => C())), pt(() => n.active, (x) => {
      x && z();
    }), ro(() => {
      n.active && z(), window.addEventListener("keydown", L), o.value && typeof ResizeObserver < "u" && (fe = new ResizeObserver(() => C()), fe.observe(o.value)), C();
    }), io(() => {
      window.removeEventListener("keydown", L), fe == null || fe.disconnect(), fe = null;
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
          onInput: u,
          onKeydown: Si(Is(b, ["prevent"]), ["enter"])
        }, null, 40, eg),
        x.canStartNewChat ? (w(), A("button", {
          key: 0,
          type: "button",
          class: Le(["askai__new", { "askai__new--armed": x.newChatArmed }]),
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
        ]), 10, tg)) : ee("", !0),
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
      }, null, 8, ["busy", "error"])) : ee("", !0),
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
          f.value ? (w(), A(Re, { key: 1 }, [
            (w(!0), A(Re, null, dt(l.value, ({ message: S, index: j }) => (w(), A("div", {
              key: j,
              class: "askai__turn",
              "aria-live": x.isStreaming(j) ? "off" : "polite"
            }, [
              S.message_type === "user" ? (w(), A("p", lg, Z(S.message), 1)) : S.message_type === "system" ? (w(), A("p", cg, Z(S.message), 1)) : (w(), A(Re, { key: 2 }, [
                g("div", {
                  class: Le(["askai__answer", { "askai__answer--streaming": x.isStreaming(j) }]),
                  innerHTML: E(xi)(x.isStreaming(j) ? x.displayText(j, S.message || "") : S.message || "")
                }, null, 10, ug),
                x.showCitations && !x.isStreaming(j) && S.sources && S.sources.length ? (w(), A("div", fg, [
                  M[9] || (M[9] = g("span", { class: "askai__label" }, "Sources", -1)),
                  (w(!0), A(Re, null, dt(S.sources, (ne, ce) => (w(), A("span", {
                    key: ce,
                    class: "askai__source",
                    title: x.citationTooltip(ne)
                  }, Z(x.citationLabel(ne)), 9, hg))), 128))
                ])) : ee("", !0)
              ], 64))
            ], 8, ag))), 128)),
            x.loading ? (w(), A("div", dg, [
              M[10] || (M[10] = g("span", { class: "askai__dot" }, null, -1)),
              M[11] || (M[11] = g("span", { class: "askai__dot" }, null, -1)),
              M[12] || (M[12] = g("span", { class: "askai__dot" }, null, -1)),
              g("span", pg, Z(x.showCitations ? "Searching the knowledge base" : "Thinking"), 1)
            ])) : ee("", !0)
          ], 64)) : (w(), A(Re, { key: 0 }, [
            g("div", ng, [
              g("h2", sg, Z(x.welcomeTitle || `Ask ${x.agentName}`), 1),
              x.welcomeSubtitle ? (w(), A("p", rg, Z(x.welcomeSubtitle), 1)) : ee("", !0)
            ]),
            x.suggestions.length && !x.draft.trim() ? (w(), A("div", ig, [
              M[8] || (M[8] = g("p", { class: "askai__label" }, "Suggested", -1)),
              (w(!0), A(Re, null, dt(x.suggestions, (S) => (w(), A("button", {
                key: S,
                type: "button",
                class: "askai__suggestion",
                disabled: !x.inputEnabled,
                onClick: (j) => T(S)
              }, [
                g("span", null, Z(S), 1),
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
            ])) : ee("", !0)
          ], 64))
        ], 512)
      ], 512),
      x.disclaimer || x.showBranding ? (w(), A("div", mg, [
        x.disclaimer ? (w(), A("span", gg, Z(x.disclaimer), 1)) : ee("", !0),
        x.showBranding ? (w(), A("a", _g, "Powered by ChatterMate")) : ee("", !0)
      ])) : ee("", !0)
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
    const t = e, n = oe(
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
    const n = e, s = t, r = oe(() => !!n.pending.preview);
    function i(f) {
      return f == null || f === "" ? "—" : typeof f == "string" ? f : JSON.stringify(f, null, 2);
    }
    function o(f) {
      const u = f.replace(/[_-]+/g, " ").trim();
      return u.charAt(0).toUpperCase() + u.slice(1);
    }
    const a = oe(
      () => n.pending.details ?? Object.entries(n.pending.request.args || {}).map(([f, u]) => ({ key: o(f), value: i(u) }))
    ), l = oe(
      () => {
        var f, u;
        return Ng(n.pending.request.label, (f = n.pending.preview) == null ? void 0 : f.before, (u = n.pending.preview) == null ? void 0 : u.after, r.value);
      }
    );
    return (f, u) => {
      var b, T;
      return w(), A("div", {
        class: "cm-action-confirm",
        role: "group",
        "aria-label": f.pending.request.label
      }, [
        g("div", Mg, Z(f.pending.request.label) + "?", 1),
        r.value ? (w(), A(Re, { key: 0 }, [
          g("div", Dg, [
            u[2] || (u[2] = g("span", { class: "cm-action-tag" }, "Current", -1)),
            g("span", Fg, Z(i((b = f.pending.preview) == null ? void 0 : b.before)), 1)
          ]),
          g("div", $g, [
            u[3] || (u[3] = g("span", { class: "cm-action-tag" }, "New", -1)),
            g("span", Bg, Z(i((T = f.pending.preview) == null ? void 0 : T.after)), 1)
          ])
        ], 64)) : a.value.length ? (w(), A("dl", Ug, [
          (w(!0), A(Re, null, dt(a.value, (O) => (w(), A(Re, {
            key: O.key
          }, [
            g("dt", null, Z(O.key), 1),
            g("dd", null, Z(O.value), 1)
          ], 64))), 128))
        ])) : ee("", !0),
        g("div", zg, [
          g("button", {
            type: "button",
            class: "cm-action-apply",
            onClick: u[0] || (u[0] = (O) => s("approve"))
          }, Z(l.value.approve), 1),
          g("button", {
            type: "button",
            class: "cm-action-cancel",
            onClick: u[1] || (u[1] = (O) => s("decline"))
          }, Z(l.value.decline), 1)
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
      class: Le(["cm-receipt", t.receipt.tone]),
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
      g("span", Kg, Z(t.receipt.tone === "done" ? "Done:" : t.receipt.tone === "failed" ? "Failed:" : "Skipped:"), 1),
      g("span", Gg, Z(t.receipt.text), 1)
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
    const n = e, s = t, r = ie(!1);
    pt(() => n.progress.finished, (l) => {
      l && (r.value = !1);
    });
    const i = oe(() => Math.min(n.progress.index, n.progress.count)), o = oe(() => n.progress.count ? Math.round(i.value / n.progress.count * 100) : 0), a = oe(
      () => n.progress.titles.map((l, f) => ({
        title: l,
        state: f < i.value ? "done" : f === n.progress.index ? "now" : "todo"
      }))
    );
    return (l, f) => (w(), A("div", Zg, [
      g("section", {
        class: Le(["cm-plan", { finished: l.progress.finished }]),
        "aria-label": `Guide: ${l.progress.name}`
      }, [
        g("button", {
          type: "button",
          class: "cm-plan-head",
          "aria-expanded": r.value,
          onClick: f[0] || (f[0] = (u) => r.value = !r.value)
        }, [
          g("span", e_, [
            g("span", t_, Z(l.progress.name), 1),
            !l.progress.finished && l.progress.title ? (w(), A("span", n_, Z(l.progress.title), 1)) : ee("", !0)
          ]),
          g("span", s_, Z(l.progress.finished ? "Done" : `${i.value} of ${l.progress.count}`), 1),
          (w(), A("svg", {
            class: Le(["cm-plan-chevron", { open: r.value }]),
            "aria-hidden": "true",
            width: "14",
            height: "14",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2.2",
            "stroke-linecap": "round",
            "stroke-linejoin": "round"
          }, f[3] || (f[3] = [
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
            style: Ee({ width: `${o.value}%` })
          }, null, 4)
        ], 8, r_),
        r.value ? (w(), A(Re, { key: 0 }, [
          a.value.length ? (w(), A("ol", i_, [
            (w(!0), A(Re, null, dt(a.value, (u, b) => (w(), A("li", {
              key: b,
              class: Le(u.state),
              "aria-current": u.state === "now" ? "step" : void 0
            }, [
              u.state === "done" ? (w(), A("svg", a_, f[4] || (f[4] = [
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
              ]))) : u.state === "now" ? (w(), A("svg", l_, f[5] || (f[5] = [
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
              ]))) : (w(), A("svg", c_, f[6] || (f[6] = [
                g("circle", {
                  cx: "12",
                  cy: "12",
                  r: "9",
                  class: "ring todo"
                }, null, -1)
              ]))),
              g("span", u_, Z(u.title), 1),
              u.state === "done" ? (w(), A("span", f_, "(done)")) : ee("", !0)
            ], 10, o_))), 128))
          ])) : ee("", !0),
          g("div", h_, [
            l.progress.skippable ? (w(), A("button", {
              key: 0,
              type: "button",
              onClick: f[1] || (f[1] = (u) => s("skip"))
            }, "Skip this step")) : ee("", !0),
            g("button", {
              type: "button",
              onClick: f[2] || (f[2] = (u) => s("hide"))
            }, "Hide guide")
          ])
        ], 64)) : ee("", !0)
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
      }, Z(i.label), 9, g_))), 128))
    ]));
  }
}), y_ = /* @__PURE__ */ ms(__, [["__scopeId", "data-v-7b650713"]]);
function v_(e) {
  const t = ie([]);
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
    return Ec().API_URL || "https://api.chattermate.chat/api/v1";
  },
  get WS_URL() {
    return Ec().WS_URL || "wss://api.chattermate.chat";
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
  const t = e.store ?? Gi(), n = ie(null);
  let s = null, r = null;
  const i = () => {
    s && (clearTimeout(s), s = null);
  }, o = () => {
    const z = Ci(n.value);
    return z != null && z.exp ? Number(z.exp) - Math.floor(Date.now() / Vo) : null;
  }, a = () => {
    const z = Ci(n.value);
    if (!(z != null && z.exp)) return !1;
    const ue = z.iat ? Number(z.exp) - Number(z.iat) : 0, C = o() ?? 0;
    return ue <= 0 ? C <= 0 : C <= ue * (1 - xc);
  }, l = (z, { persist: ue = !0 } = {}) => {
    var me, x;
    const C = as(z), fe = !!n.value;
    if (i(), n.value = C, !C) {
      t.clear(), fe && ((me = e.onTokenCleared) == null || me.call(e));
      return;
    }
    ue && (t.write(C), (x = e.onTokenChanged) == null || x.call(e, C)), b();
  }, f = async (z) => {
    if (!n.value || !z) return !1;
    if (r) return r;
    const ue = n.value;
    return r = (async () => {
      var C, fe;
      try {
        const me = await fetch(`${Ds.API_URL}/refresh-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ue}`
          },
          body: JSON.stringify({ widget_id: z })
        });
        if (me.status === 401)
          return await M_(me) !== N_ && ((C = e.onIdentityExpired) == null || C.call(e)), !1;
        if (!me.ok)
          return b(qo), !1;
        const x = await me.json(), M = as((fe = x == null ? void 0 : x.data) == null ? void 0 : fe.token);
        return M ? (l(M), !0) : !1;
      } catch {
        return b(qo), !1;
      } finally {
        r = null;
      }
    })(), r;
  }, u = async (z) => n.value ? a() ? f(z) : !0 : !1, b = (z) => {
    i();
    const ue = Ci(n.value);
    if (!(ue != null && ue.exp) || !(ue != null && ue.iat)) return;
    const C = (Number(ue.exp) - Number(ue.iat)) * Vo, fe = (o() ?? 0) * Vo, me = z ?? Math.min(
      P_,
      Math.max(0, fe - C * (1 - xc))
    );
    s = setTimeout(() => {
      s = null, u(T).then((x) => {
        b(x ? void 0 : qo);
      });
    }, me);
  };
  let T = "";
  return {
    token: n,
    start: (z, ue) => {
      T = z;
      const C = as(ue) || t.read();
      l(C, { persist: !1 }), C && t.write(C);
    },
    stop: () => {
      i(), r = null;
    },
    setToken: l,
    ensureFresh: u
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
  const t = oe(() => ({
    backgroundColor: "var(--cm-card)",
    color: "var(--cm-text)"
  })), n = oe(() => ({
    backgroundColor: e.value.chat_bubble_color || "#C9F24E",
    color: sr(e.value.chat_bubble_color || "#C9F24E") ? "#FFFFFF" : "#000000"
  })), s = oe(() => ({
    backgroundColor: "var(--cm-agent-bg)",
    color: "var(--cm-text)"
  })), r = oe(() => ({
    backgroundColor: "var(--cm-accent)",
    color: "var(--cm-on-accent)"
  })), i = oe(() => ({
    color: "var(--cm-text)"
  })), o = oe(() => ({
    borderBottom: "1px solid var(--cm-hairline)"
  })), a = oe(() => Ki(e.value.photo_url)), l = oe(() => {
    const f = e.value.chat_background_color || "#ffffff";
    return {
      boxShadow: `0 8px 5px ${sr(f) ? "rgba(0, 0, 0, 0.24)" : "rgba(0, 0, 0, 0.12)"}`
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
  const n = ie([]), s = ie(!1), r = ie(null), i = (M) => {
    if (M === 0) return "0 Bytes";
    const S = 1024, j = ["Bytes", "KB", "MB", "GB"], ne = Math.floor(Math.log(M) / Math.log(S));
    return parseFloat((M / Math.pow(S, ne)).toFixed(2)) + " " + j[ne];
  }, o = (M) => M.startsWith("image/"), a = (M) => M ? Ki(M) : "", l = (M) => {
    const S = M.file_url || M.url;
    return S ? Ki(S) : "";
  }, f = async (M) => {
    const S = M.target;
    S.files && S.files.length > 0 && (await z(Array.from(S.files)), S.value = "");
  }, u = async (M) => {
    var j;
    M.preventDefault();
    const S = (j = M.dataTransfer) == null ? void 0 : j.files;
    S && S.length > 0 && await z(Array.from(S));
  }, b = (M) => {
    M.preventDefault();
  }, T = (M) => {
    M.preventDefault();
  }, O = async (M) => {
    var ne;
    const S = (ne = M.clipboardData) == null ? void 0 : ne.items;
    if (!S) return;
    const j = [];
    for (const ce of Array.from(S))
      if (ce.kind === "file") {
        const ge = ce.getAsFile();
        ge && j.push(ge);
      }
    j.length > 0 && await z(j);
  }, L = async (M, S = 500) => new Promise((j, ne) => {
    const ce = new FileReader();
    ce.onload = (ge) => {
      var ke;
      const Oe = new Image();
      Oe.onload = () => {
        const Ye = document.createElement("canvas");
        let ze = Oe.width, st = Oe.height;
        const he = 1920;
        (ze > he || st > he) && (ze > st ? (st = st / ze * he, ze = he) : (ze = ze / st * he, st = he)), Ye.width = ze, Ye.height = st;
        const ve = Ye.getContext("2d");
        if (!ve) {
          ne(new Error("Failed to get canvas context"));
          return;
        }
        ve.drawImage(Oe, 0, 0, ze, st);
        let ye = 0.9;
        const Qe = () => {
          Ye.toBlob((Xe) => {
            if (!Xe) {
              ne(new Error("Failed to compress image"));
              return;
            }
            if (Xe.size / 1024 > S && ye > 0.3)
              ye -= 0.1, Qe();
            else {
              const We = new FileReader();
              We.onload = () => {
                const jt = We.result.split(",")[1];
                j({ blob: Xe, base64: jt });
              }, We.readAsDataURL(Xe);
            }
          }, M.type === "image/png" ? "image/png" : "image/jpeg", ye);
        };
        Qe();
      }, Oe.onerror = () => ne(new Error("Failed to load image")), Oe.src = (ke = ge.target) == null ? void 0 : ke.result;
    }, ce.onerror = () => ne(new Error("Failed to read file")), ce.readAsDataURL(M);
  }), z = async (M) => {
    if (n.value.length >= 3) {
      alert("Maximum 3 files allowed per message");
      return;
    }
    const ge = 3 - n.value.length, Oe = M.slice(0, ge);
    M.length > ge && alert(`Only ${ge} more file(s) can be uploaded. Maximum 3 files per message.`);
    for (const ke of Oe)
      try {
        if (n.value.some((he) => he.filename === ke.name)) {
          console.warn(`File ${ke.name} is already selected`), alert(`File "${ke.name}" is already selected`);
          continue;
        }
        const ze = ke.type.startsWith("image/"), st = ze ? 5242880 : 10485760;
        if (ke.size > st) {
          const he = st / 1048576;
          console.error(`File ${ke.name} is too large. Maximum size is ${he}MB`), alert(`File "${ke.name}" is too large. Maximum size for ${ze ? "images" : "documents"} is ${he}MB`);
          continue;
        }
        if (ze)
          try {
            const { blob: he, base64: ve } = await L(ke, 500), ye = he.size;
            console.log(`Compressed ${ke.name}: ${(ke.size / 1024).toFixed(2)}KB → ${(ye / 1024).toFixed(2)}KB`), n.value.push({
              content: ve,
              filename: ke.name,
              type: ke.type,
              size: ye,
              url: URL.createObjectURL(he),
              file_url: URL.createObjectURL(he)
            });
          } catch (he) {
            console.error("Image compression failed, uploading original:", he);
            const ve = new FileReader();
            ve.onload = (ye) => {
              var ot;
              const Xe = ((ot = ye.target) == null ? void 0 : ot.result).split(",")[1];
              n.value.push({
                content: Xe,
                filename: ke.name,
                type: ke.type,
                size: ke.size,
                url: URL.createObjectURL(ke),
                file_url: URL.createObjectURL(ke)
              });
            }, ve.readAsDataURL(ke);
          }
        else {
          const he = new FileReader();
          he.onload = (ve) => {
            var Xe;
            const Qe = ((Xe = ve.target) == null ? void 0 : Xe.result).split(",")[1];
            n.value.push({
              content: Qe,
              filename: ke.name,
              type: ke.type || "application/octet-stream",
              size: ke.size,
              url: "",
              file_url: ""
            });
          }, he.readAsDataURL(ke);
        }
      } catch (Ye) {
        console.error("File upload error:", Ye);
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
    handleFileSelect: f,
    handleDrop: u,
    handleDragOver: b,
    handleDragLeave: T,
    handlePaste: O,
    uploadFiles: z,
    removeAttachment: async (M) => {
      const S = n.value[M];
      if (S) {
        try {
          let j = S.url;
          if (j.startsWith("/uploads/") ? j = j.substring(9) : j.startsWith("/") && (j = j.substring(1)), cf(j))
            try {
              j = new URL(j).pathname.replace(/^\/+/, "");
            } catch {
            }
          const ne = {};
          e.value && (ne.Authorization = `Bearer ${e.value}`);
          const ce = await fetch(`${Ds.API_URL}/files/upload/${j}`, {
            method: "DELETE",
            headers: ne
          });
          if (ce.ok)
            console.log("File deleted successfully from backend.");
          else {
            const ge = await ce.json();
            console.error("Failed to delete file:", ge.detail);
          }
        } catch (j) {
          console.error("Error calling delete API:", j);
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
  const f = new ArrayBuffer(t), u = new Uint8Array(f);
  for (s = 0; s < n; s += 4)
    i = Ir[e.charCodeAt(s)], o = Ir[e.charCodeAt(s + 1)], a = Ir[e.charCodeAt(s + 2)], l = Ir[e.charCodeAt(s + 3)], u[r++] = i << 2 | o >> 4, u[r++] = (o & 15) << 4 | a >> 2, u[r++] = (a & 3) << 6 | l & 63;
  return f;
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
          const l = yi(n, 8), f = new DataView(l.buffer, l.byteOffset, l.length), u = f.getUint32(0);
          if (u > Math.pow(2, 21) - 1) {
            a.enqueue(ga);
            break;
          }
          r = u * Math.pow(2, 32) + f.getUint32(4), s = 3;
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
const fo = typeof Promise == "function" && typeof Promise.resolve == "function" ? (t) => Promise.resolve().then(t) : (t, n) => n(t, 0), cn = typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")(), ty = "arraybuffer";
function Tf(e, ...t) {
  return t.reduce((n, s) => (e.hasOwnProperty(s) && (n[s] = e[s]), n), {});
}
const ny = cn.setTimeout, sy = cn.clearTimeout;
function ho(e, t) {
  t.useNativeTimers ? (e.setTimeoutFn = ny.bind(cn), e.clearTimeoutFn = sy.bind(cn)) : (e.setTimeoutFn = cn.setTimeout.bind(cn), e.clearTimeoutFn = cn.clearTimeout.bind(cn));
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
    const e = "onpagehide" in cn ? "pagehide" : "unload";
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
      return new cn[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
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
const Yo = cn.WebSocket || cn.MozWebSocket;
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
              s || this.readyState !== "closed" && (u(), this.setTransport(n), n.send([{ type: "upgrade" }]), this.emitReserved("upgrade", n), n = null, this.upgrading = !1, this.flush());
            });
          } else {
            const T = new Error("probe error");
            T.transport = n.name, this.emitReserved("upgradeError", T);
          }
      }));
    };
    function i() {
      s || (s = !0, u(), n.close(), n = null);
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
    function f(b) {
      n && b.name !== n.name && i();
    }
    const u = () => {
      n.removeListener("open", r), n.removeListener("error", o), n.removeListener("close", a), this.off("close", l), this.off("upgrading", f);
    };
    n.once("open", r), n.once("error", o), n.once("close", a), this.once("close", l), this.once("upgrading", f), this._upgrades.indexOf("webtransport") !== -1 && t !== "webtransport" ? this.setTimeoutFn(() => {
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
var Ne;
(function(e) {
  e[e.CONNECT = 0] = "CONNECT", e[e.DISCONNECT = 1] = "DISCONNECT", e[e.EVENT = 2] = "EVENT", e[e.ACK = 3] = "ACK", e[e.CONNECT_ERROR = 4] = "CONNECT_ERROR", e[e.BINARY_EVENT = 5] = "BINARY_EVENT", e[e.BINARY_ACK = 6] = "BINARY_ACK";
})(Ne || (Ne = {}));
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
    return (t.type === Ne.EVENT || t.type === Ne.ACK) && Oi(t) ? this.encodeAsBinary({
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
      const s = n.type === Ne.BINARY_EVENT;
      s || n.type === Ne.BINARY_ACK ? (n.type = s ? Ne.EVENT : Ne.ACK, this.reconstructor = new My(n)) : super.emitReserved("decoded", n);
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
      case Ne.CONNECT:
        return Nc(n);
      case Ne.DISCONNECT:
        return n === void 0;
      case Ne.CONNECT_ERROR:
        return typeof n == "string" || Nc(n);
      case Ne.EVENT:
      case Ne.BINARY_EVENT:
        return Array.isArray(n) && (typeof n[0] == "number" || typeof n[0] == "string" && Ny.indexOf(n[0]) === -1);
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
    return Ne;
  }
}, Symbol.toStringTag, { value: "Module" }));
function gn(e, t, n) {
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
      gn(t, "open", this.onopen.bind(this)),
      gn(t, "packet", this.onpacket.bind(this)),
      gn(t, "error", this.onerror.bind(this)),
      gn(t, "close", this.onclose.bind(this))
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
      type: Ne.EVENT,
      data: n
    };
    if (o.options = {}, o.options.compress = this.flags.compress !== !1, typeof n[n.length - 1] == "function") {
      const u = this.ids++, b = n.pop();
      this._registerAckCallback(u, b), o.id = u;
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
    const r = gn(n, "open", function() {
      s.onopen(), t && t();
    }), i = (a) => {
      this.cleanup(), this._readyState = "closed", this.emitReserved("error", a), t ? t(a) : this.maybeReconnectOnOpen();
    }, o = gn(n, "error", i);
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
      gn(t, "ping", this.onping.bind(this)),
      gn(t, "data", this.ondata.bind(this)),
      gn(t, "error", this.onerror.bind(this)),
      gn(t, "close", this.onclose.bind(this)),
      // @ts-ignore
      gn(this.decoder, "decoded", this.ondecoded.bind(this))
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
  const e = ie([]), t = ie(!1), n = ie(""), s = ie(!1), r = ie(!1), i = ie(!1), o = ie("connecting"), a = ie(0), l = 5, f = ie({}), u = ie(null), b = ie(""), T = [];
  let O = null;
  const L = 6e4, z = () => {
    t.value = !1, O && (clearTimeout(O), O = null);
  }, ue = () => {
    t.value = !0, O && clearTimeout(O), O = setTimeout(z, L);
  };
  let C = null;
  const fe = 1e3, me = 15e3;
  let x = null;
  const M = /* @__PURE__ */ new Set(["ai_config_missing", ...Wu]);
  let S = !1, j = !1;
  const ne = ie(null), ce = () => {
    x && (clearTimeout(x), x = null);
  }, ge = () => {
    if (x || S) return;
    const W = Math.min(
      fe * 2 ** Math.max(0, a.value - 1),
      me
    );
    x = setTimeout(() => {
      x = null, C == null || C.connect();
    }, W);
  };
  let Oe = null, ke = null, Ye = null, ze = null, st = null, he = !1, ve = null, ye, Qe, Xe;
  const ot = (W) => {
    var c;
    return (c = Ci(W ?? null)) == null ? void 0 : c.sub;
  }, We = (W) => {
    ye = W, W && C != null && C.connected && C.emit("refresh_token", { conversation_token: W });
  }, jt = (W) => {
    Qe = W;
  }, en = () => {
    var _;
    const W = ye || (Yi() ? null : Gi().read()), c = {};
    W && (c.conversation_token = W), Qe && (c.widget_id = Qe);
    try {
      c.page_url = pf() || (window.parent !== window && ((_ = window.parent.location) != null && _.href) ? window.parent.location.href : document.referrer || window.location.href);
    } catch {
      c.page_url = document.referrer || "";
    }
    return c;
  }, De = (W) => {
    C = Ni(`${Ds.WS_URL}/widget`, {
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
      auth: (c) => c(en())
    }), C.on("connect", () => {
      Xe = ot(en().conversation_token), o.value = "connected", ce(), a.value = 0;
    }), C.on("bot_typing", () => {
      ue();
    }), C.on("disconnect", (c) => {
      z(), o.value === "connected" && (console.log("Socket disconnected, setting connection status to connecting"), o.value = "connecting");
      const _ = j;
      j = !1, c === "io server disconnect" && _ && (C == null || C.connect());
    }), C.on("error", (c) => {
      (c == null ? void 0 : c.type) === "conversation_gone" && (j = !0);
    }), C.on("connect_error", (c) => {
      var I;
      const _ = (I = c == null ? void 0 : c.data) == null ? void 0 : I.type;
      if (_ && M.has(_)) {
        S = !0, ne.value = _, ce(), o.value = "failed", ua(_) ? he || st == null || st() : v(c.data);
        return;
      }
      a.value++, console.error("Socket connection failed, attempt:", a.value), a.value >= l && (o.value = "failed"), C && !C.active && ge();
    }), C.on("chat_response", (c) => {
      if (z(), c.session_id ? (console.log("Captured session_id from chat_response:", c.session_id), b.value = c.session_id) : console.warn("No session_id in chat_response data:", c), c.type === "agent_message") {
        const _ = {
          message: c.message,
          message_type: "agent",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          session_id: "",
          agent_name: c.agent_name,
          stream: !0,
          // live reply → client-side typewriter reveal
          attributes: {
            end_chat: c.end_chat,
            end_chat_reason: c.end_chat_reason,
            end_chat_description: c.end_chat_description,
            request_rating: c.request_rating
          }
        };
        c.attachments && Array.isArray(c.attachments) && (_.id = c.message_id, _.attachments = c.attachments.map((I, R) => ({
          id: c.message_id * 1e3 + R,
          filename: I.filename,
          file_url: I.file_url,
          content_type: I.content_type,
          file_size: I.file_size
        }))), e.value.push(_);
      } else c.shopify_output && typeof c.shopify_output == "object" && c.shopify_output.products ? e.value.push({
        message: c.message,
        // Keep the accompanying text message
        message_type: "product",
        // Use 'product' type for rendering
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: "",
        agent_name: c.agent_name,
        // Assign the whole structured object
        shopify_output: c.shopify_output,
        // Remove the old flattened fields (product_id, product_title, etc.)
        attributes: {
          // Keep other attributes if needed
          end_chat: c.end_chat,
          request_rating: c.request_rating
        }
      }) : e.value.push({
        message: c.message,
        message_type: "bot",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: "",
        agent_name: c.agent_name,
        stream: !0,
        // live reply → client-side typewriter reveal
        // Knowledge-base citations (display gated by show_citations in the widget)
        sources: Array.isArray(c.sources) && c.sources.length ? c.sources : void 0,
        attributes: {
          end_chat: c.end_chat,
          end_chat_reason: c.end_chat_reason,
          end_chat_description: c.end_chat_description,
          request_rating: c.request_rating
        }
      });
    }), C.on("handle_taken_over", (c) => {
      e.value.push({
        message: `${c.user_name} joined the conversation`,
        message_type: "system",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: c.session_id
      }), f.value = {
        ...f.value,
        human_agent_name: c.user_name,
        human_agent_profile_pic: c.profile_picture
      }, z(), Oe && Oe(c);
    }), C.on("session_initialized", (c) => {
      c.session_id && (b.value = c.session_id, ve = {
        session_id: c.session_id,
        authenticated: !!c.authenticated,
        created: !!c.created
      }, ze == null || ze(ve));
    }), C.on("error", v);
    for (const [c, _] of T) C.on(c, _);
    return C.on("chat_history", N), C.on("rating_submitted", D), C.on("display_form", U), C.on("form_submitted", P), C.on("workflow_state", Y), C.on("workflow_proceeded", q), C;
  }, yt = async () => {
    try {
      return C != null && C.connected && Xe && Xe === ot(en().conversation_token) ? (o.value = "connected", !0) : (o.value = "connecting", a.value = 0, z(), ce(), S = !1, ne.value = null, C && (C.removeAllListeners(), C.disconnect(), C = null), he = !0, C = De(""), new Promise((W) => {
        const c = (_) => {
          he = !1, W(_);
        };
        C == null || C.on("connect", () => {
          c(!0);
        }), C == null || C.on("connect_error", () => {
          (S || a.value >= l) && c(!1);
        });
      }));
    } catch (W) {
      return console.error("Socket initialization failed:", W), he = !1, o.value = "failed", !1;
    }
  }, Bt = () => (C && C.disconnect(), yt()), Wt = (W) => {
    Oe = W;
  }, qt = (W) => {
    st = W;
  }, Lt = (W) => {
    ze = W, ve && W(ve);
  }, yn = (W) => {
    ke = W;
  }, y = (W) => {
    Ye = W;
  }, v = (W) => {
    z(), n.value = Tp(W), s.value = !0, setTimeout(() => {
      s.value = !1, n.value = "";
    }, 5e3);
  }, N = (W) => {
    if (W.type === "chat_history" && Array.isArray(W.messages)) {
      const c = W.messages.map((_) => {
        var R, $;
        const I = {
          message: _.message,
          message_type: _.message_type,
          created_at: _.created_at,
          session_id: "",
          agent_name: _.agent_name || "",
          user_name: _.user_name || "",
          attributes: _.attributes || {},
          attachments: _.attachments || []
          // Include attachments
        };
        return Array.isArray((R = _.attributes) == null ? void 0 : R.sources) && _.attributes.sources.length && (I.sources = _.attributes.sources), ($ = _.attributes) != null && $.shopify_output && typeof _.attributes.shopify_output == "object" ? {
          ...I,
          message_type: "product",
          shopify_output: _.attributes.shopify_output
        } : I;
      });
      e.value = [
        ...c.filter(
          (_) => !e.value.some(
            (I) => I.message === _.message && I.created_at === _.created_at
          )
        ),
        ...e.value
      ];
    }
  }, D = (W) => {
    W.success && e.value.push({
      message: "Thank you for your feedback!",
      message_type: "system",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: ""
    });
  }, U = (W) => {
    var c;
    console.log("Form display handler in composable:", W), z(), u.value = W.form_data, console.log("Set currentForm in handleDisplayForm:", u.value), ((c = W.form_data) == null ? void 0 : c.form_full_screen) === !0 ? (console.log("Full screen form detected, triggering workflow state callback"), ke && ke({
      type: "form",
      form_data: W.form_data,
      session_id: W.session_id
    })) : e.value.push({
      message: "",
      message_type: "form",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: W.session_id,
      attributes: {
        form_data: W.form_data
      }
    });
  }, P = (W) => {
    console.log("Form submitted confirmation received, clearing currentForm"), u.value = null, W.success && console.log("Form submitted successfully");
  }, Y = (W) => {
    console.log("Workflow state received in composable:", W), (W.type === "form" || W.type === "display_form") && (console.log("Setting currentForm from workflow state:", W.form_data), u.value = W.form_data), ke && ke(W);
  }, q = (W) => {
    console.log("Workflow proceeded in composable:", W), Ye && Ye(W);
  }, V = async (W, c) => {
    !C || !W || C.emit("submit_rating", {
      rating: W,
      feedback: c
    });
  }, H = async (W) => {
    var I;
    if (console.log("Submitting form in socket:", W), console.log("Current form in socket:", u.value), console.log("Socket in socket:", C), !C) {
      console.error("No socket available for form submission");
      return;
    }
    if (!W || Object.keys(W).length === 0) {
      console.error("No form data to submit");
      return;
    }
    const _ = ((I = u.value) == null ? void 0 : I.form_type) === "contact" ? "submit_contact_info" : "submit_form";
    console.log(`Emitting ${_} event with data:`, W), C.emit(_, {
      form_data: W
    }), u.value = null;
  }, se = async () => {
    C && (console.log("Getting workflow state 12"), C.emit("get_workflow_state"));
  }, X = async () => {
    C && C.emit("proceed_workflow", {});
  }, J = async (W, c, _ = [], I = {}) => {
    if (!C || !W.trim() && _.length === 0) return;
    const R = {
      message: W,
      message_type: "user",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: ""
    };
    _.length > 0 && (R.attachments = _.map(($, re) => {
      let te = "";
      if ($.content_type.startsWith("image/")) {
        const Ae = atob($.content), Ce = new Array(Ae.length);
        for (let $e = 0; $e < Ae.length; $e++)
          Ce[$e] = Ae.charCodeAt($e);
        const He = new Uint8Array(Ce), Me = new Blob([He], { type: $.content_type });
        te = URL.createObjectURL(Me);
      }
      return {
        id: Date.now() * 1e3 + re,
        // Temporary ID
        filename: $.filename,
        file_url: te,
        // Temporary blob URL, will be replaced
        content_type: $.content_type,
        file_size: $.size,
        _isTemporary: !0
        // Flag to identify temporary attachments
      };
    })), e.value.push(R), C.emit("chat", {
      ...I,
      message: W,
      email: c,
      files: _
      // Send files with base64 content
    }), i.value = !0;
  }, de = () => {
    e.value = [], i.value = !1, b.value = "", z(), u.value = null;
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
    endChat: (W = "CUSTOMER_REQUEST") => new Promise((c) => {
      if (!C || !C.connected) {
        c(!1);
        return;
      }
      let _ = !1;
      const I = (te) => {
        _ || (_ = !0, clearTimeout(re), C == null || C.off("chat_ended", R), C == null || C.off("error", $), te && de(), c(te));
      }, R = () => I(!0), $ = (te) => {
        (te == null ? void 0 : te.type) === "end_chat_error" && I(!1);
      }, re = setTimeout(() => I(!1), By);
      C.on("chat_ended", R), C.on("error", $), C.emit("end_chat", { reason: W });
    }),
    loadChatHistory: async () => {
      if (C)
        try {
          r.value = !0, C.emit("get_chat_history");
        } catch (W) {
          console.error("Failed to load chat history:", W);
        } finally {
          r.value = !1;
        }
    },
    connect: yt,
    reconnect: Bt,
    cleanup: () => {
      z(), ce(), C && (C.removeAllListeners(), C.disconnect(), C = null), Oe = null, ke = null, Ye = null;
    },
    humanAgent: f,
    onTakeover: Wt,
    onSessionState: Lt,
    onReauthorize: qt,
    refusal: ne,
    submitRating: V,
    currentForm: u,
    submitForm: H,
    getWorkflowState: se,
    proceedWorkflow: X,
    onWorkflowState: yn,
    onWorkflowProceeded: y,
    currentSessionId: b,
    setToken: We,
    setWidgetId: jt,
    on: (W, c) => {
      T.push([W, c]), C == null || C.on(W, c);
    },
    emit: (W, c) => {
      C == null || C.emit(W, c);
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
  const t = e.setTimer ?? ((S, j) => setTimeout(S, j)), n = e.clearTimer ?? ((S) => clearTimeout(S));
  let s = [], r = null, i = null;
  const o = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map();
  function f() {
    const S = e.trustedHostOrigin();
    S && s.length && e.emit("actions_available", { names: s, host_origin: S }), r && e.emit("set_context", { context: r });
  }
  function u(S) {
    s = Array.isArray(S) ? S.filter((j) => typeof j == "string") : [], f();
  }
  function b(S) {
    r = S && typeof S == "object" && !Array.isArray(S) ? S : null, r && e.emit("set_context", { context: r });
  }
  function T(S, j, ne, ce = {}) {
    var ge;
    (ge = e.onOutcome) == null || ge.call(e, {
      label: S,
      status: j,
      preview: ne,
      summary: j === "ok" ? qy(ce.result) : null,
      error: typeof ce.error == "string" && ce.error ? ce.error : null
    });
  }
  function O(S, j, ne = {}) {
    const ce = o.get(S);
    ce && (n(ce.timer), T(ce.label, j, ce.preview, ne)), o.delete(S);
    const ge = a.get(S);
    if (ge) {
      a.delete(S), ge(j);
      return;
    }
    const Oe = (ce == null ? void 0 : ce.confirmed) ?? void 0;
    e.emit("action_result", { call_id: S, status: j, confirmed: Oe, ...ne });
  }
  function L(S) {
    const j = i && S ? a.get(i.request.call_id) : void 0;
    j && i && (a.delete(i.request.call_id), j("declined")), i = S, e.onConfirmChange(S);
  }
  function z(S, j, ne = null) {
    const ce = Math.max(1, S.timeout_s) * 1e3 + Yy;
    o.set(S.call_id, {
      timer: t(() => O(S.call_id, "timeout"), ce),
      confirmed: j,
      label: S.label,
      preview: ne
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
        L({ request: S, preview: null, details: null }), l.set(S.call_id, S), e.postToHost({ type: "ACTION_PREVIEW", callId: S.call_id, name: S.name, args: S.args });
        return;
      }
      if (S.confirm === "when_overwriting") {
        l.set(S.call_id, S), e.postToHost({ type: "ACTION_PREVIEW", callId: S.call_id, name: S.name, args: S.args });
        return;
      }
      z(S, null);
    }
  }
  function C(S) {
    var j;
    switch (S.type) {
      case "HOST_ACTIONS":
        return u(S.names), !0;
      case "HOST_CONTEXT":
        return b(S.context), !0;
      case "HOST_PROMPT": {
        const ne = Gy(S);
        return ne && ((j = e.onPrompt) == null || j.call(e, ne)), !0;
      }
      case "ACTION_PREVIEW_DONE": {
        const ne = l.get(String(S.callId));
        if (!ne) return !0;
        if (l.delete(ne.call_id), ne.confirm === "always") {
          const ge = jy(S.preview);
          return ge && (i == null ? void 0 : i.request.call_id) === ne.call_id && (i = { ...i, details: ge }, e.onConfirmChange(i)), !0;
        }
        const ce = S.preview;
        return ce && typeof ce == "object" ? L({ request: ne, preview: ce, details: null }) : z(ne, null), !0;
      }
      case "ACTION_DONE": {
        const ne = String(S.callId);
        if (!o.has(ne)) return !0;
        const ce = ["ok", "error", "timeout"].includes(S.status) ? S.status : "error";
        return O(ne, ce, {
          result: ce === "ok" ? S.result : void 0,
          error: typeof S.error == "string" ? S.error : void 0
        }), !0;
      }
      default:
        return !1;
    }
  }
  function fe() {
    if (!i) return;
    const { request: S, preview: j } = i;
    L(null), l.delete(S.call_id), z(S, !0, j);
  }
  function me() {
    if (!i) return;
    const { request: S, preview: j } = i;
    L(null), l.delete(S.call_id), T(S.label, "declined", j);
    const ne = a.get(S.call_id);
    if (ne) {
      a.delete(S.call_id), ne("declined");
      return;
    }
    e.emit("action_result", { call_id: S.call_id, status: "declined", confirmed: !1 });
  }
  function x(S, j) {
    if (S.kind !== "action" || !S.action || i || a.size > 0 || o.size > 0 || l.size > 0) return !1;
    const ne = `chip-${S.value}-${Date.now()}`;
    return a.set(ne, j), ue({
      call_id: ne,
      name: S.value,
      label: S.action.label,
      args: {},
      confirm: S.action.confirm,
      timeout_s: S.action.timeout_s
    }), !0;
  }
  function M() {
    for (const S of o.values()) n(S.timer);
    o.clear(), l.clear(), a.clear(), L(null);
  }
  return { announce: f, handleRequest: ue, handleHostMessage: C, approve: fe, decline: me, runLocal: x, dispose: M };
}
function Zy(e, t, n) {
  const s = ie(null), r = Xy({
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
  const t = e.setTimer ?? ((O, L) => setTimeout(O, L)), n = e.clearTimer ?? ((O) => clearTimeout(O));
  let s = null, r = null;
  function i() {
    s !== null && n(s), s = null;
  }
  let o = null, a = null;
  function l() {
    i();
    const O = a;
    !O || r === O.stepId || (o = O.stepId, s = t(() => {
      s = null, r = O.stepId, e.addNotice(O.nudge.message, "message");
    }, O.nudge.after_min * Jy));
  }
  function f(O) {
    if (a = O.nudge && O.step_id ? { stepId: O.step_id, nudge: O.nudge } : null, !a) {
      i(), o = null;
      return;
    }
    o === a.stepId && s !== null || l();
  }
  let u = !1;
  function b(O) {
    var ue;
    const L = (O == null ? void 0 : O.view) ?? null;
    if ((ue = L == null ? void 0 : L.notice) != null && ue.text && e.addNotice(L.notice.text, L.notice.kind), !L && u) return;
    if (u = !!(L != null && L.finished) && !!L.journey_name, !L || L.finished || L.waiting) {
      i(), a = null, o = null;
      const C = L != null && L.journey_name ? Pc(L, !!L.finished) : null;
      e.showStep(null, C), L != null && L.finished && L.message && e.addNotice(L.message, "message");
      return;
    }
    const z = L.message ? { message: L.message, chips: L.chips ?? [], open: !1, source: "journey" } : null;
    e.showStep(z, Pc(L, !1)), L.fresh && L.auto_open && e.openChat(), f(L);
  }
  function T() {
    s !== null && l();
  }
  return {
    handleState: b,
    activity: T,
    sync: (O = {}) => e.emit("journey_sync", O),
    skip: () => e.emit("journey_skip", {}),
    dismiss: () => {
      u = !1, e.showStep(null, null), e.emit("journey_dismiss", {});
    },
    start: (O) => e.emit("journey_start", { key: O }),
    dispose: i
  };
}
function ev(e) {
  const t = ie(null), n = ie(!1);
  let s = !1;
  const r = [], o = Qy({
    emit: (f, u) => {
      s ? e.emit(f, u) : r.push([f, u]);
    },
    showStep: (f, u) => {
      t.value = u;
      const b = e.currentPrompt();
      b && b.source !== "journey" || e.showPrompt(f);
    },
    addNotice: e.addNotice,
    openChat: () => At({ type: "WIDGET_OPEN_REQUEST" })
  });
  e.on("journey_state", o.handleState), e.on("session_initialized", () => {
    s = !0, o.sync({ url: pf() });
    for (const [f, u] of r.splice(0)) e.emit(f, u);
  });
  const a = (f) => {
    if (f.source !== window.parent) return;
    const u = f.data;
    !u || typeof u.type != "string" || (u.type === "HOST_PAGE" && typeof u.url == "string" && o.sync({ url: u.url }), u.type === "HOST_CONTEXT" && o.sync({}), u.type === "HOST_EVENT" && typeof u.event == "string" && o.sync({ event: u.event }), u.type === "HOST_JOURNEY_START" && typeof u.key == "string" && o.start(u.key));
  };
  window.addEventListener("message", a);
  function l(f, u) {
    if (o.activity(), f.kind === "text") {
      u(f.value);
      return;
    }
    if (n.value) return;
    e.runLocalAction(f, (T) => {
      n.value = !1, T === "ok" && o.sync({ action: f.value });
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
const vi = (e, t) => Ue(e) === Ue(t);
function tv(e, t) {
  let n;
  const s = Mh(null), r = () => {
    n = e.value[e.value.length - 1], s.value = null;
  };
  return pt(() => {
    var l;
    return (l = t.value) == null ? void 0 : l.message;
  }, r), pt(e, (l) => {
    (!s.value || !l.some((f) => vi(f, s.value))) && r();
  }, { flush: "sync" }), pt(() => e.value.length, () => {
    if (!t.value || s.value) return;
    const l = e.value, f = l[l.findIndex((u) => vi(u, n)) + 1];
    f && (s.value = f);
  }), { isBefore: (l) => !!t.value && vi(l, s.value), isLast: () => !!t.value && !s.value, index: () => {
    const l = e.value.findIndex((f) => vi(f, s.value));
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
      function t(c, _, I) {
        return c.call.apply(c.bind, arguments);
      }
      function n(c, _, I) {
        if (!c) throw Error();
        if (2 < arguments.length) {
          var R = Array.prototype.slice.call(arguments, 2);
          return function() {
            var $ = Array.prototype.slice.call(arguments);
            return Array.prototype.unshift.apply($, R), c.apply(_, $);
          };
        }
        return function() {
          return c.apply(_, arguments);
        };
      }
      function s(c, _, I) {
        return s = Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1 ? t : n, s.apply(null, arguments);
      }
      var r = Date.now || function() {
        return +/* @__PURE__ */ new Date();
      };
      function i(c, _) {
        this.a = c, this.o = _ || c, this.c = this.o.document;
      }
      var o = !!window.FontFace;
      function a(c, _, I, R) {
        if (_ = c.c.createElement(_), I) for (var $ in I) I.hasOwnProperty($) && ($ == "style" ? _.style.cssText = I[$] : _.setAttribute($, I[$]));
        return R && _.appendChild(c.c.createTextNode(R)), _;
      }
      function l(c, _, I) {
        c = c.c.getElementsByTagName(_)[0], c || (c = document.documentElement), c.insertBefore(I, c.lastChild);
      }
      function f(c) {
        c.parentNode && c.parentNode.removeChild(c);
      }
      function u(c, _, I) {
        _ = _ || [], I = I || [];
        for (var R = c.className.split(/\s+/), $ = 0; $ < _.length; $ += 1) {
          for (var re = !1, te = 0; te < R.length; te += 1) if (_[$] === R[te]) {
            re = !0;
            break;
          }
          re || R.push(_[$]);
        }
        for (_ = [], $ = 0; $ < R.length; $ += 1) {
          for (re = !1, te = 0; te < I.length; te += 1) if (R[$] === I[te]) {
            re = !0;
            break;
          }
          re || _.push(R[$]);
        }
        c.className = _.join(" ").replace(/\s+/g, " ").replace(/^\s+|\s+$/, "");
      }
      function b(c, _) {
        for (var I = c.className.split(/\s+/), R = 0, $ = I.length; R < $; R++) if (I[R] == _) return !0;
        return !1;
      }
      function T(c) {
        return c.o.location.hostname || c.a.location.hostname;
      }
      function O(c, _, I) {
        function R() {
          Ae && $ && re && (Ae(te), Ae = null);
        }
        _ = a(c, "link", { rel: "stylesheet", href: _, media: "all" });
        var $ = !1, re = !0, te = null, Ae = I || null;
        o ? (_.onload = function() {
          $ = !0, R();
        }, _.onerror = function() {
          $ = !0, te = Error("Stylesheet failed to load"), R();
        }) : setTimeout(function() {
          $ = !0, R();
        }, 0), l(c, "head", _);
      }
      function L(c, _, I, R) {
        var $ = c.c.getElementsByTagName("head")[0];
        if ($) {
          var re = a(c, "script", { src: _ }), te = !1;
          return re.onload = re.onreadystatechange = function() {
            te || this.readyState && this.readyState != "loaded" && this.readyState != "complete" || (te = !0, I && I(null), re.onload = re.onreadystatechange = null, re.parentNode.tagName == "HEAD" && $.removeChild(re));
          }, $.appendChild(re), setTimeout(function() {
            te || (te = !0, I && I(Error("Script load timeout")));
          }, R || 5e3), re;
        }
        return null;
      }
      function z() {
        this.a = 0, this.c = null;
      }
      function ue(c) {
        return c.a++, function() {
          c.a--, fe(c);
        };
      }
      function C(c, _) {
        c.c = _, fe(c);
      }
      function fe(c) {
        c.a == 0 && c.c && (c.c(), c.c = null);
      }
      function me(c) {
        this.a = c || "-";
      }
      me.prototype.c = function(c) {
        for (var _ = [], I = 0; I < arguments.length; I++) _.push(arguments[I].replace(/[\W_]+/g, "").toLowerCase());
        return _.join(this.a);
      };
      function x(c, _) {
        this.c = c, this.f = 4, this.a = "n";
        var I = (_ || "n4").match(/^([nio])([1-9])$/i);
        I && (this.a = I[1], this.f = parseInt(I[2], 10));
      }
      function M(c) {
        return ne(c) + " " + (c.f + "00") + " 300px " + S(c.c);
      }
      function S(c) {
        var _ = [];
        c = c.split(/,\s*/);
        for (var I = 0; I < c.length; I++) {
          var R = c[I].replace(/['"]/g, "");
          R.indexOf(" ") != -1 || /^\d/.test(R) ? _.push("'" + R + "'") : _.push(R);
        }
        return _.join(",");
      }
      function j(c) {
        return c.a + c.f;
      }
      function ne(c) {
        var _ = "normal";
        return c.a === "o" ? _ = "oblique" : c.a === "i" && (_ = "italic"), _;
      }
      function ce(c) {
        var _ = 4, I = "n", R = null;
        return c && ((R = c.match(/(normal|oblique|italic)/i)) && R[1] && (I = R[1].substr(0, 1).toLowerCase()), (R = c.match(/([1-9]00|normal|bold)/i)) && R[1] && (/bold/i.test(R[1]) ? _ = 7 : /[1-9]00/.test(R[1]) && (_ = parseInt(R[1].substr(0, 1), 10)))), I + _;
      }
      function ge(c, _) {
        this.c = c, this.f = c.o.document.documentElement, this.h = _, this.a = new me("-"), this.j = _.events !== !1, this.g = _.classes !== !1;
      }
      function Oe(c) {
        c.g && u(c.f, [c.a.c("wf", "loading")]), Ye(c, "loading");
      }
      function ke(c) {
        if (c.g) {
          var _ = b(c.f, c.a.c("wf", "active")), I = [], R = [c.a.c("wf", "loading")];
          _ || I.push(c.a.c("wf", "inactive")), u(c.f, I, R);
        }
        Ye(c, "inactive");
      }
      function Ye(c, _, I) {
        c.j && c.h[_] && (I ? c.h[_](I.c, j(I)) : c.h[_]());
      }
      function ze() {
        this.c = {};
      }
      function st(c, _, I) {
        var R = [], $;
        for ($ in _) if (_.hasOwnProperty($)) {
          var re = c.c[$];
          re && R.push(re(_[$], I));
        }
        return R;
      }
      function he(c, _) {
        this.c = c, this.f = _, this.a = a(this.c, "span", { "aria-hidden": "true" }, this.f);
      }
      function ve(c) {
        l(c.c, "body", c.a);
      }
      function ye(c) {
        return "display:block;position:absolute;top:-9999px;left:-9999px;font-size:300px;width:auto;height:auto;line-height:normal;margin:0;padding:0;font-variant:normal;white-space:nowrap;font-family:" + S(c.c) + ";" + ("font-style:" + ne(c) + ";font-weight:" + (c.f + "00") + ";");
      }
      function Qe(c, _, I, R, $, re) {
        this.g = c, this.j = _, this.a = R, this.c = I, this.f = $ || 3e3, this.h = re || void 0;
      }
      Qe.prototype.start = function() {
        var c = this.c.o.document, _ = this, I = r(), R = new Promise(function(te, Ae) {
          function Ce() {
            r() - I >= _.f ? Ae() : c.fonts.load(M(_.a), _.h).then(function(He) {
              1 <= He.length ? te() : setTimeout(Ce, 25);
            }, function() {
              Ae();
            });
          }
          Ce();
        }), $ = null, re = new Promise(function(te, Ae) {
          $ = setTimeout(Ae, _.f);
        });
        Promise.race([re, R]).then(function() {
          $ && (clearTimeout($), $ = null), _.g(_.a);
        }, function() {
          _.j(_.a);
        });
      };
      function Xe(c, _, I, R, $, re, te) {
        this.v = c, this.B = _, this.c = I, this.a = R, this.s = te || "BESbswy", this.f = {}, this.w = $ || 3e3, this.u = re || null, this.m = this.j = this.h = this.g = null, this.g = new he(this.c, this.s), this.h = new he(this.c, this.s), this.j = new he(this.c, this.s), this.m = new he(this.c, this.s), c = new x(this.a.c + ",serif", j(this.a)), c = ye(c), this.g.a.style.cssText = c, c = new x(this.a.c + ",sans-serif", j(this.a)), c = ye(c), this.h.a.style.cssText = c, c = new x("serif", j(this.a)), c = ye(c), this.j.a.style.cssText = c, c = new x("sans-serif", j(this.a)), c = ye(c), this.m.a.style.cssText = c, ve(this.g), ve(this.h), ve(this.j), ve(this.m);
      }
      var ot = { D: "serif", C: "sans-serif" }, We = null;
      function jt() {
        if (We === null) {
          var c = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent);
          We = !!c && (536 > parseInt(c[1], 10) || parseInt(c[1], 10) === 536 && 11 >= parseInt(c[2], 10));
        }
        return We;
      }
      Xe.prototype.start = function() {
        this.f.serif = this.j.a.offsetWidth, this.f["sans-serif"] = this.m.a.offsetWidth, this.A = r(), De(this);
      };
      function en(c, _, I) {
        for (var R in ot) if (ot.hasOwnProperty(R) && _ === c.f[ot[R]] && I === c.f[ot[R]]) return !0;
        return !1;
      }
      function De(c) {
        var _ = c.g.a.offsetWidth, I = c.h.a.offsetWidth, R;
        (R = _ === c.f.serif && I === c.f["sans-serif"]) || (R = jt() && en(c, _, I)), R ? r() - c.A >= c.w ? jt() && en(c, _, I) && (c.u === null || c.u.hasOwnProperty(c.a.c)) ? Bt(c, c.v) : Bt(c, c.B) : yt(c) : Bt(c, c.v);
      }
      function yt(c) {
        setTimeout(s(function() {
          De(this);
        }, c), 50);
      }
      function Bt(c, _) {
        setTimeout(s(function() {
          f(this.g.a), f(this.h.a), f(this.j.a), f(this.m.a), _(this.a);
        }, c), 0);
      }
      function Wt(c, _, I) {
        this.c = c, this.a = _, this.f = 0, this.m = this.j = !1, this.s = I;
      }
      var qt = null;
      Wt.prototype.g = function(c) {
        var _ = this.a;
        _.g && u(_.f, [_.a.c("wf", c.c, j(c).toString(), "active")], [_.a.c("wf", c.c, j(c).toString(), "loading"), _.a.c("wf", c.c, j(c).toString(), "inactive")]), Ye(_, "fontactive", c), this.m = !0, Lt(this);
      }, Wt.prototype.h = function(c) {
        var _ = this.a;
        if (_.g) {
          var I = b(_.f, _.a.c("wf", c.c, j(c).toString(), "active")), R = [], $ = [_.a.c("wf", c.c, j(c).toString(), "loading")];
          I || R.push(_.a.c("wf", c.c, j(c).toString(), "inactive")), u(_.f, R, $);
        }
        Ye(_, "fontinactive", c), Lt(this);
      };
      function Lt(c) {
        --c.f == 0 && c.j && (c.m ? (c = c.a, c.g && u(c.f, [c.a.c("wf", "active")], [c.a.c("wf", "loading"), c.a.c("wf", "inactive")]), Ye(c, "active")) : ke(c.a));
      }
      function yn(c) {
        this.j = c, this.a = new ze(), this.h = 0, this.f = this.g = !0;
      }
      yn.prototype.load = function(c) {
        this.c = new i(this.j, c.context || this.j), this.g = c.events !== !1, this.f = c.classes !== !1, v(this, new ge(this.c, c), c);
      };
      function y(c, _, I, R, $) {
        var re = --c.h == 0;
        (c.f || c.g) && setTimeout(function() {
          var te = $ || null, Ae = R || null || {};
          if (I.length === 0 && re) ke(_.a);
          else {
            _.f += I.length, re && (_.j = re);
            var Ce, He = [];
            for (Ce = 0; Ce < I.length; Ce++) {
              var Me = I[Ce], $e = Ae[Me.c], rt = _.a, hn = Me;
              if (rt.g && u(rt.f, [rt.a.c("wf", hn.c, j(hn).toString(), "loading")]), Ye(rt, "fontloading", hn), rt = null, qt === null) if (window.FontFace) {
                var hn = /Gecko.*Firefox\/(\d+)/.exec(window.navigator.userAgent), $s = /OS X.*Version\/10\..*Safari/.exec(window.navigator.userAgent) && /Apple/.exec(window.navigator.vendor);
                qt = hn ? 42 < parseInt(hn[1], 10) : !$s;
              } else qt = !1;
              qt ? rt = new Qe(s(_.g, _), s(_.h, _), _.c, Me, _.s, $e) : rt = new Xe(s(_.g, _), s(_.h, _), _.c, Me, _.s, te, $e), He.push(rt);
            }
            for (Ce = 0; Ce < He.length; Ce++) He[Ce].start();
          }
        }, 0);
      }
      function v(c, _, I) {
        var $ = [], R = I.timeout;
        Oe(_);
        var $ = st(c.a, I, c.c), re = new Wt(c.c, _, R);
        for (c.h = $.length, _ = 0, I = $.length; _ < I; _++) $[_].load(function(te, Ae, Ce) {
          y(c, re, te, Ae, Ce);
        });
      }
      function N(c, _) {
        this.c = c, this.a = _;
      }
      N.prototype.load = function(c) {
        function _() {
          if (re["__mti_fntLst" + R]) {
            var te = re["__mti_fntLst" + R](), Ae = [], Ce;
            if (te) for (var He = 0; He < te.length; He++) {
              var Me = te[He].fontfamily;
              te[He].fontStyle != null && te[He].fontWeight != null ? (Ce = te[He].fontStyle + te[He].fontWeight, Ae.push(new x(Me, Ce))) : Ae.push(new x(Me));
            }
            c(Ae);
          } else setTimeout(function() {
            _();
          }, 50);
        }
        var I = this, R = I.a.projectId, $ = I.a.version;
        if (R) {
          var re = I.c.o;
          L(this.c, (I.a.api || "https://fast.fonts.net/jsapi") + "/" + R + ".js" + ($ ? "?v=" + $ : ""), function(te) {
            te ? c([]) : (re["__MonotypeConfiguration__" + R] = function() {
              return I.a;
            }, _());
          }).id = "__MonotypeAPIScript__" + R;
        } else c([]);
      };
      function D(c, _) {
        this.c = c, this.a = _;
      }
      D.prototype.load = function(c) {
        var _, I, R = this.a.urls || [], $ = this.a.families || [], re = this.a.testStrings || {}, te = new z();
        for (_ = 0, I = R.length; _ < I; _++) O(this.c, R[_], ue(te));
        var Ae = [];
        for (_ = 0, I = $.length; _ < I; _++) if (R = $[_].split(":"), R[1]) for (var Ce = R[1].split(","), He = 0; He < Ce.length; He += 1) Ae.push(new x(R[0], Ce[He]));
        else Ae.push(new x(R[0]));
        C(te, function() {
          c(Ae, re);
        });
      };
      function U(c, _) {
        c ? this.c = c : this.c = P, this.a = [], this.f = [], this.g = _ || "";
      }
      var P = "https://fonts.googleapis.com/css";
      function Y(c, _) {
        for (var I = _.length, R = 0; R < I; R++) {
          var $ = _[R].split(":");
          $.length == 3 && c.f.push($.pop());
          var re = "";
          $.length == 2 && $[1] != "" && (re = ":"), c.a.push($.join(re));
        }
      }
      function q(c) {
        if (c.a.length == 0) throw Error("No fonts to load!");
        if (c.c.indexOf("kit=") != -1) return c.c;
        for (var _ = c.a.length, I = [], R = 0; R < _; R++) I.push(c.a[R].replace(/ /g, "+"));
        return _ = c.c + "?family=" + I.join("%7C"), 0 < c.f.length && (_ += "&subset=" + c.f.join(",")), 0 < c.g.length && (_ += "&text=" + encodeURIComponent(c.g)), _;
      }
      function V(c) {
        this.f = c, this.a = [], this.c = {};
      }
      var H = { latin: "BESbswy", "latin-ext": "çöüğş", cyrillic: "йяЖ", greek: "αβΣ", khmer: "កខគ", Hanuman: "កខគ" }, se = { thin: "1", extralight: "2", "extra-light": "2", ultralight: "2", "ultra-light": "2", light: "3", regular: "4", book: "4", medium: "5", "semi-bold": "6", semibold: "6", "demi-bold": "6", demibold: "6", bold: "7", "extra-bold": "8", extrabold: "8", "ultra-bold": "8", ultrabold: "8", black: "9", heavy: "9", l: "3", r: "4", b: "7" }, X = { i: "i", italic: "i", n: "n", normal: "n" }, J = /^(thin|(?:(?:extra|ultra)-?)?light|regular|book|medium|(?:(?:semi|demi|extra|ultra)-?)?bold|black|heavy|l|r|b|[1-9]00)?(n|i|normal|italic)?$/;
      function de(c) {
        for (var _ = c.f.length, I = 0; I < _; I++) {
          var R = c.f[I].split(":"), $ = R[0].replace(/\+/g, " "), re = ["n4"];
          if (2 <= R.length) {
            var te, Ae = R[1];
            if (te = [], Ae) for (var Ae = Ae.split(","), Ce = Ae.length, He = 0; He < Ce; He++) {
              var Me;
              if (Me = Ae[He], Me.match(/^[\w-]+$/)) {
                var $e = J.exec(Me.toLowerCase());
                if ($e == null) Me = "";
                else {
                  if (Me = $e[2], Me = Me == null || Me == "" ? "n" : X[Me], $e = $e[1], $e == null || $e == "") $e = "4";
                  else var rt = se[$e], $e = rt || (isNaN($e) ? "4" : $e.substr(0, 1));
                  Me = [Me, $e].join("");
                }
              } else Me = "";
              Me && te.push(Me);
            }
            0 < te.length && (re = te), R.length == 3 && (R = R[2], te = [], R = R ? R.split(",") : te, 0 < R.length && (R = H[R[0]]) && (c.c[$] = R));
          }
          for (c.c[$] || (R = H[$]) && (c.c[$] = R), R = 0; R < re.length; R += 1) c.a.push(new x($, re[R]));
        }
      }
      function pe(c, _) {
        this.c = c, this.a = _;
      }
      var be = { Arimo: !0, Cousine: !0, Tinos: !0 };
      pe.prototype.load = function(c) {
        var _ = new z(), I = this.c, R = new U(this.a.api, this.a.text), $ = this.a.families;
        Y(R, $);
        var re = new V($);
        de(re), O(I, q(R), ue(_)), C(_, function() {
          c(re.a, re.c, be);
        });
      };
      function Te(c, _) {
        this.c = c, this.a = _;
      }
      Te.prototype.load = function(c) {
        var _ = this.a.id, I = this.c.o;
        _ ? L(this.c, (this.a.api || "https://use.typekit.net") + "/" + _ + ".js", function(R) {
          if (R) c([]);
          else if (I.Typekit && I.Typekit.config && I.Typekit.config.fn) {
            R = I.Typekit.config.fn;
            for (var $ = [], re = 0; re < R.length; re += 2) for (var te = R[re], Ae = R[re + 1], Ce = 0; Ce < Ae.length; Ce++) $.push(new x(te, Ae[Ce]));
            try {
              I.Typekit.load({ events: !1, classes: !1, async: !0 });
            } catch {
            }
            c($);
          }
        }, 2e3) : c([]);
      };
      function Pe(c, _) {
        this.c = c, this.f = _, this.a = [];
      }
      Pe.prototype.load = function(c) {
        var _ = this.f.id, I = this.c.o, R = this;
        _ ? (I.__webfontfontdeckmodule__ || (I.__webfontfontdeckmodule__ = {}), I.__webfontfontdeckmodule__[_] = function($, re) {
          for (var te = 0, Ae = re.fonts.length; te < Ae; ++te) {
            var Ce = re.fonts[te];
            R.a.push(new x(Ce.name, ce("font-weight:" + Ce.weight + ";font-style:" + Ce.style)));
          }
          c(R.a);
        }, L(this.c, (this.f.api || "https://f.fontdeck.com/s/css/js/") + T(this.c) + "/" + _ + ".js", function($) {
          $ && c([]);
        })) : c([]);
      };
      var Ie = new yn(window);
      Ie.a.c.custom = function(c, _) {
        return new D(_, c);
      }, Ie.a.c.fontdeck = function(c, _) {
        return new Pe(_, c);
      }, Ie.a.c.monotype = function(c, _) {
        return new N(_, c);
      }, Ie.a.c.typekit = function(c, _) {
        return new Te(_, c);
      }, Ie.a.c.google = function(c, _) {
        return new pe(_, c);
      };
      var W = { load: s(Ie.load, Ie) };
      e.exports ? e.exports = W : (window.WebFont = W, window.WebFontConfig && Ie.load(window.WebFontConfig));
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
  const e = ie({}), t = ie(""), n = (r) => {
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
  const i = typeof window < "u" && typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, o = (u) => {
    r || s.length === 0 || (r = setTimeout(a, u));
  }, a = () => {
    r = null;
    const u = s[0];
    if (u === void 0) return;
    const b = e.value[u], T = n[u], O = (b == null ? void 0 : b.message) ?? "";
    if (!T || !b) {
      s.shift(), o(0);
      return;
    }
    if (T.shown >= O.length) {
      T.done = !0, s.shift(), o(0);
      return;
    }
    T.shown += 1;
    const L = O[T.shown - 1];
    t == null || t(), o(L === " " ? cv : lv);
  };
  pt(() => e.value.length, (u, b) => {
    b !== void 0 && u < b && (Object.keys(n).forEach((T) => {
      delete n[Number(T)];
    }), s.length = 0);
    for (let T = b ?? 0; T < u; T++) {
      const O = e.value[T];
      if (!O || !O.stream || T in n) continue;
      const L = O.message ?? "";
      i || !L ? n[T] = { shown: L.length, done: !0 } : (n[T] = { shown: 0, done: !1 }, s.push(T));
    }
    o(0);
  });
  const l = (u, b) => {
    const T = n[u];
    return T ? b.slice(0, T.shown) : b;
  }, f = (u) => {
    const b = n[u];
    return !!b && !b.done;
  };
  return Vr(() => {
    r && clearTimeout(r);
  }), { displayText: l, isStreaming: f };
}
function fv(e) {
  const t = ie(!0);
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
  const n = bv(e), s = (t == null ? void 0 : t.chat_background_color) || "", r = /^#[0-9a-fA-F]{6}$/.test(s), i = s || n.card, o = (t == null ? void 0 : t.chat_text_color) || "", l = /^#[0-9a-fA-F]{6}$/.test(o) && o.toLowerCase() !== wv ? o : r ? sr(s) ? "#FFFFFF" : "#111111" : n.text, f = r ? sr(s) ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.62)" : n.muted, u = r ? kp(s, 20) : n.agentBg, b = (t == null ? void 0 : t.accent_color) || n.accent, T = r ? !sr(s) : n.light, O = $c(b) === "#0B0C10", L = T === O ? f : b, z = n.mono ? yv : t != null && t.font_family ? `${t.font_family}, ${Fc}` : Fc;
  return {
    "--cm-card": i,
    "--cm-text": l,
    "--cm-muted": f,
    "--cm-agent-bg": u,
    "--cm-accent": b,
    "--cm-on-accent": $c(b),
    "--cm-presence": L,
    "--cm-border": n.border,
    "--cm-glow": n.glow,
    "--cm-radius": `${n.radius}px`,
    "--cm-bubble": `${n.bubble}px`,
    "--cm-bubble-tail": `${vv(n.bubble)}px`,
    "--cm-field-radius": n.mono ? "7px" : "12px",
    "--cm-avatar-radius": n.mono ? "28%" : "50%",
    "--cm-hairline": n.light ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.08)",
    "--cm-body-font": z
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
    const t = e, n = oe(() => {
      var h;
      return t.widgetId || ((h = window.__INITIAL_DATA__) == null ? void 0 : h.widgetId);
    }), {
      customization: s,
      agentName: r,
      applyCustomization: i,
      initializeFromData: o
    } = av(), { formatCurrency: a } = Tv(), {
      messages: l,
      loading: f,
      errorMessage: u,
      showError: b,
      loadingHistory: T,
      hasStartedChat: O,
      connectionStatus: L,
      sendMessage: z,
      endChat: ue,
      loadChatHistory: C,
      connect: fe,
      reconnect: me,
      cleanup: x,
      humanAgent: M,
      onTakeover: S,
      refusal: j,
      submitRating: ne,
      submitForm: ce,
      currentForm: ge,
      getWorkflowState: Oe,
      proceedWorkflow: ke,
      onWorkflowState: Ye,
      onWorkflowProceeded: ze,
      currentSessionId: st,
      setToken: he,
      setWidgetId: ve,
      onSessionState: ye,
      onReauthorize: Qe,
      on: Xe,
      emit: ot
    } = Uy(), We = ie(null), { receipts: jt, addReceipt: en, receiptsAfter: De } = v_(l), { pendingConfirm: yt, approveAction: Bt, declineAction: Wt, runLocalAction: qt } = Zy(
      { on: Xe, emit: ot },
      (h) => {
        We.value = h;
      },
      en
    ), { journeyProgress: Lt, chipBusy: yn, runChip: y, skipStep: v, dismissJourney: N, noteActivity: D } = ev({
      on: Xe,
      emit: ot,
      currentPrompt: () => We.value,
      showPrompt: (h) => {
        We.value = h;
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
      h.kind === "action" && !yn.value && !yt.value && (Y.value && H(Y.value), l.value.push({ message: h.label, message_type: "user", created_at: (/* @__PURE__ */ new Date()).toISOString(), session_id: "", attributes: { source: "journey" } })), y(h, Kn);
    }, P = oe(() => {
      const h = We.value;
      return !(h != null && h.chips.length) || yt.value || f.value ? [] : h.chips;
    }), Y = oe(() => {
      const h = We.value;
      return !h || h.source !== "journey" ? h : l.value.some((G) => G.message_type === "bot" && G.message === h.message) ? null : h;
    }), q = oe(() => f.value ? null : Y.value), V = tv(l, q), H = (h) => {
      l.value.splice(V.index(), 0, {
        message: h.message,
        message_type: "bot",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: "",
        attributes: { source: h.source }
      });
    }, { displayText: se, isStreaming: X } = uv(l, () => is(() => bn()));
    fv(l);
    const J = ie(""), de = ie(!0), pe = ie(""), be = ie(!1), Te = (h) => {
      const m = h.target;
      J.value = m.value;
    };
    let Pe = null;
    const Ie = () => {
      Pe && Pe.disconnect(), Pe = new MutationObserver((m) => {
        let G = !1, p = !1;
        m.forEach((le) => {
          if (le.type === "childList") {
            const Je = Array.from(le.addedNodes).some(
              (lt) => {
                var et;
                return lt.nodeType === Node.ELEMENT_NODE && (lt.matches("input, textarea") || ((et = lt.querySelector) == null ? void 0 : et.call(lt, "input, textarea")));
              }
            ), we = Array.from(le.removedNodes).some(
              (lt) => {
                var et;
                return lt.nodeType === Node.ELEMENT_NODE && (lt.matches("input, textarea") || ((et = lt.querySelector) == null ? void 0 : et.call(lt, "input, textarea")));
              }
            );
            Je && (p = !0, G = !0), we && (G = !0);
          }
        }), G && (clearTimeout(Ie.timeoutId), Ie.timeoutId = setTimeout(() => {
          $();
        }, p ? 50 : 100));
      });
      const h = document.querySelector(".widget-container") || document.body;
      Pe.observe(h, {
        childList: !0,
        subtree: !0
      });
    };
    Ie.timeoutId = null;
    let W = [];
    const c = /* @__PURE__ */ new Set();
    let _ = !1;
    const I = (h) => {
      if (_) return;
      const m = setTimeout(() => {
        c.delete(m), $();
      }, h);
      c.add(m);
    }, R = () => {
      c.forEach(clearTimeout), c.clear();
    }, $ = () => {
      re();
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
      for (const G of h) {
        const p = document.querySelectorAll(G);
        if (p.length > 0) {
          m = Array.from(p);
          break;
        }
      }
      m.length !== 0 && (W = m, m.forEach((G) => {
        G.addEventListener("input", Ae, !0), G.addEventListener("keyup", Ae, !0), G.addEventListener("change", Ae, !0), G.addEventListener("keypress", Ce, !0), G.addEventListener("keydown", He, !0);
      }));
    }, re = () => {
      W.forEach((h) => {
        h.removeEventListener("input", Ae), h.removeEventListener("keyup", Ae), h.removeEventListener("change", Ae), h.removeEventListener("keypress", Ce), h.removeEventListener("keydown", He);
      }), W = [];
    }, te = (h) => !!(h && h.closest && h.closest(".form-message, .form-fullscreen, .cm-email-gate")), Ae = (h) => {
      if (te(h.target)) return;
      const m = h.target;
      J.value = m.value;
    }, Ce = (h) => {
      te(h.target) || h.key === "Enter" && !h.shiftKey && (h.preventDefault(), h.stopPropagation(), nn());
    }, He = (h) => {
      te(h.target) || h.key === "Enter" && !h.shiftKey && (h.preventDefault(), h.stopPropagation(), nn());
    }, Me = (h) => {
      const m = h.target, G = document.querySelector(".header-menu-container");
      document.querySelector(".header-menu-btn");
      const p = document.querySelector(".header-dropdown-menu");
      p && !(G != null && G.contains(m)) && (p.style.display = "none");
    }, $e = ie(!0), {
      token: rt,
      start: hn,
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
    oe(() => !!rt.value);
    const Ut = ie(null), Nt = ie(!1), Vt = ie(!1);
    t.initialAuthError && (Ut.value = t.initialAuthError, Nt.value = !0, $e.value = !1), o();
    const Tt = window.__INITIAL_DATA__;
    hn((Tt == null ? void 0 : Tt.widgetId) || "", Tt == null ? void 0 : Tt.initialToken), rt.value && (be.value = !0);
    const jn = ie(!1);
    (Tt == null ? void 0 : Tt.allowAttachments) !== void 0 && (jn.value = Tt.allowAttachments);
    const Wn = ie(null), {
      chatStyles: gs,
      chatIconStyles: Xr,
      agentBubbleStyles: Rn,
      userBubbleStyles: dn,
      messageNameStyles: Kt,
      headerBorderStyles: Zr,
      photoUrl: ft,
      shadowStyle: po
    } = H_(s), Jr = ie(null), {
      uploadedAttachments: Be,
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
      handlePaste: pn,
      removeAttachment: si,
      openPreview: Vn,
      closePreview: tn,
      openFilePicker: ri,
      isImage: vs
    } = q_(rt, Jr);
    oe(() => l.value.some(
      (h) => h.message_type === "form" && (!h.isSubmitted || h.isSubmitted === !1)
    ));
    const vn = oe(() => {
      var h;
      return O.value && be.value || !wo.value ? L.value === "connected" && !f.value : vr(pe.value.trim()) && L.value === "connected" && !f.value || ((h = window.__INITIAL_DATA__) == null ? void 0 : h.workflow);
    }), bs = oe(() => vn.value || f.value && L.value === "connected" && O.value), Us = oe(() => L.value === "connected" ? on.value ? "Ask me anything..." : "Type a message..." : "Connecting..."), zs = ie(!1), In = oe(() => S_(J.value)), nn = async () => {
      var p;
      if (!J.value.trim() && Be.value.length === 0 || In.value) return;
      if (f.value && O.value) {
        zs.value = !0;
        return;
      }
      !O.value && pe.value && await wt();
      const h = Be.value.map((le) => ({
        content: le.content,
        // base64 content
        filename: le.filename,
        content_type: le.type,
        size: le.size
      }));
      D();
      const m = Y.value;
      m && H(m), ((p = We.value) == null ? void 0 : p.source) !== "journey" && (We.value = null), await z(
        J.value,
        pe.value,
        h,
        m ? { host_prompt: m.message, host_prompt_source: m.source } : {}
      ), Be.value.forEach((le) => {
        le.url && le.url.startsWith("blob:") && URL.revokeObjectURL(le.url), le.file_url && le.file_url.startsWith("blob:") && URL.revokeObjectURL(le.file_url);
      }), J.value = "", Be.value = [];
      const G = document.querySelector('input[placeholder*="Type a message"]');
      G && (G.value = ""), I(500);
    };
    pt(f, (h) => {
      h || !zs.value || (zs.value = !1, L.value === "connected" && O.value && nn());
    });
    const Kn = (h) => {
      vn.value && (J.value = h, nn());
    }, mn = () => {
      At({ type: "WIDGET_MINIMIZE" });
    }, Gn = (h) => {
      h.key === "Enter" && !h.shiftKey && (h.preventDefault(), h.stopPropagation(), nn());
    }, wt = async ({ afterRefusal: h = !1 } = {}) => {
      var m, G, p, le;
      try {
        if (!n.value)
          return console.error("Widget ID is not available"), Ut.value = "Widget ID is not available. Please refresh and try again.", Nt.value = !0, !1;
        await Yr(n.value);
        const Je = new URL(`${Ds.API_URL}/widgets/${n.value}`);
        pe.value.trim() && vr(pe.value.trim()) && Je.searchParams.append("email", pe.value.trim());
        const we = {
          Accept: "application/json",
          "Content-Type": "application/json"
        };
        rt.value && (we.Authorization = `Bearer ${rt.value}`);
        const lt = await fetch(Je, {
          headers: we,
          cache: "no-store"
        });
        if (lt.status === 401) {
          be.value = !1;
          try {
            const Qn = (await lt.json()).detail;
            if ((Qn == null ? void 0 : Qn.code) === L_)
              return tl(), !1;
            const Ks = typeof Qn == "string" ? Qn : "";
            (Ks.includes("generate-token") || Ks.includes("API key") || Ks.includes("Token required")) && (Vt.value = !0, Ut.value = "Widget authentication not configured. Please contact the website administrator.", Nt.value = !0, Hn(null));
          } catch {
            Ut.value = "Authentication required. Your token has expired or is invalid. Please refresh the page.", Nt.value = !0, Hn(null);
          }
          return !1;
        }
        if (!lt.ok) {
          try {
            const mr = await lt.json();
            Ut.value = mr.detail || `Error: ${lt.statusText}`;
          } catch {
            Ut.value = `Error: ${lt.statusText}. Please try again.`;
          }
          return Nt.value = !0, !1;
        }
        const et = await lt.json();
        et.token && Hn(et.token), be.value = !0, Ut.value = null, Nt.value = !1, he(rt.value || void 0);
        const pr = await fe();
        return !pr && ua(j.value) && !h ? await wt({ afterRefusal: !0 }) : (pr || console.error("Chat service not reachable yet; retrying in the background"), await mo(), (m = et.agent) != null && m.customization && i(et.agent.customization), et.agent && !(et != null && et.human_agent) && (r.value = et.agent.name), et != null && et.human_agent && (M.value = et.human_agent), ((G = et.agent) == null ? void 0 : G.allow_attachments) !== void 0 && (jn.value = et.agent.allow_attachments), ((p = et.agent) == null ? void 0 : p.workflow) !== void 0 && (window.__INITIAL_DATA__ = window.__INITIAL_DATA__ || {}, window.__INITIAL_DATA__.workflow = et.agent.workflow), (le = et.agent) != null && le.workflow && await Oe(), !0);
      } catch (Je) {
        return console.error("Error checking authorization:", Je), Ut.value = "An unexpected error occurred. Please try again.", Nt.value = !0, be.value = !1, !1;
      } finally {
        $e.value = !1;
      }
    }, mo = async () => {
      !O.value && be.value && (O.value = !0, await C());
    }, bn = () => {
      Wn.value && (Wn.value.scrollTop = Wn.value.scrollHeight);
    };
    pt(() => l.value, (h) => {
      is(() => {
        bn();
      });
    }, { deep: !0 }), pt([yt, q, () => jt.value.length, f], ([h, m, G, p]) => {
      (h || m || G || p) && is(() => bn());
    }), pt(L, (h, m) => {
      h === "connected" && m !== "connected" && I(100);
    }), pt(() => l.value.length, (h, m) => {
      h > 0 && m === 0 && I(100);
    });
    let ii = null;
    pt(() => l.value, (h) => {
      const m = h[h.length - 1];
      !Ac(m) || m === ii || (ii = m, ae(m));
    }, { deep: !0 });
    const oi = async () => {
      (await me() || ua(j.value)) && await wt();
    }, ur = ie(!1), ws = ie(0), Hs = ie(""), sn = ie(0), Gt = ie(!1), ht = ie({}), vt = ie(!1), ut = ie({}), rn = ie(!1), On = ie(null), K = ie("Start Chat"), d = ie(!1), k = ie(null);
    oe(() => {
      var m;
      const h = l.value[l.value.length - 1];
      return ((m = h == null ? void 0 : h.attributes) == null ? void 0 : m.request_rating) || !1;
    });
    const B = oe(() => {
      var m;
      if (!((m = window.__INITIAL_DATA__) != null && m.workflow))
        return !1;
      const h = l.value.find((G) => G.message_type === "rating");
      return (h == null ? void 0 : h.isSubmitted) === !0;
    }), Q = oe(
      () => Ki(M.value.human_agent_profile_pic)
    ), ae = async (h) => {
      var m, G, p, le, Je;
      if (Ac(h)) {
        try {
          if (h.session_id && rt.value && n.value) {
            const we = await el(h.session_id, {
              reason: (m = h.attributes) == null ? void 0 : m.end_chat_reason,
              description: (G = h.attributes) == null ? void 0 : G.end_chat_description
            });
            if (we.ok) {
              const lt = await we.json();
              console.info(`✓ Chat session closed on backend: ${lt.session_id}`);
            } else
              console.warn(`Failed to close session on backend: ${we.status}`);
          }
        } catch (we) {
          console.error("Error calling end-chat API:", we);
        }
        if ((p = h.attributes) != null && p.end_chat && ((le = h.attributes) != null && le.request_rating)) {
          const we = h.agent_name || ((Je = M.value) == null ? void 0 : Je.human_agent_name) || r.value || "our agent";
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
    }, _e = (h) => {
      Gt.value || (sn.value = h);
    }, Ze = () => {
      if (!Gt.value) {
        const h = l.value[l.value.length - 1];
        sn.value = (h == null ? void 0 : h.selectedRating) || 0;
      }
    }, at = async (h) => {
      if (!Gt.value) {
        sn.value = h;
        const m = l.value[l.value.length - 1];
        m && m.message_type === "rating" && (m.showFeedback = !0, m.selectedRating = h);
      }
    }, Et = async (h, m, G = null) => {
      try {
        Gt.value = !0, await ne(m, G);
        const p = l.value.find((le) => le.message_type === "rating");
        p && (p.isSubmitted = !0, p.finalRating = m, p.finalFeedback = G);
      } catch (p) {
        console.error("Failed to submit rating:", p);
      } finally {
        Gt.value = !1;
      }
    }, xt = (h) => {
      const m = {};
      for (const G of h.fields) {
        const p = ht.value[G.name], le = li(G, p);
        le && (m[G.name] = le);
      }
      return ut.value = m, Object.keys(m).length === 0;
    }, fr = async (h) => {
      if (!(vt.value || !xt(h)))
        try {
          vt.value = !0, await ce(ht.value);
          const G = l.value.findIndex(
            (p) => p.message_type === "form" && (!p.isSubmitted || p.isSubmitted === !1)
          );
          G !== -1 && l.value.splice(G, 1), ht.value = {}, ut.value = {};
        } catch (G) {
          console.error("Failed to submit form:", G);
        } finally {
          vt.value = !1;
        }
    }, qe = (h, m) => {
      var G, p;
      if (ht.value[h] = m, m && m.toString().trim() !== "") {
        let le = null;
        if ((G = k.value) != null && G.fields && (le = k.value.fields.find((Je) => Je.name === h)), !le && ((p = ge.value) != null && p.fields) && (le = ge.value.fields.find((Je) => Je.name === h)), le) {
          const Je = li(le, m);
          Je ? (ut.value[h] = Je, console.log(`Validation error for ${h}:`, Je)) : delete ut.value[h];
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
        const G = parseFloat(m);
        if (isNaN(G))
          return `${h.label} must be a valid number`;
        if (h.minLength && G < h.minLength)
          return `${h.label} must be at least ${h.minLength}`;
        if (h.maxLength && G > h.maxLength)
          return `${h.label} must not exceed ${h.maxLength}`;
      }
      return null;
    }, If = async () => {
      if (!(vt.value || !k.value))
        try {
          vt.value = !0, ut.value = {};
          let h = !1;
          for (const m of k.value.fields || []) {
            const G = ht.value[m.name], p = li(m, G);
            p && (ut.value[m.name] = p, h = !0, console.log(`Validation error for field ${m.name}:`, p));
          }
          if (h) {
            vt.value = !1, console.log("Validation failed, not submitting");
            return;
          }
          await ce(ht.value), d.value = !1, k.value = null, ht.value = {};
        } catch (h) {
          console.error("Failed to submit full screen form:", h);
        } finally {
          vt.value = !1, console.log("Full screen form submission completed");
        }
    }, Of = (h, m) => {
      if (console.log("handleViewDetails called with:", { product: h, shopDomain: m }), !h) {
        console.error("No product provided to handleViewDetails");
        return;
      }
      let G = null;
      if (h.handle && m)
        G = `https://${m}/products/${h.handle}`;
      else if (h.id && m)
        G = `https://${m}/products/${h.id}`;
      else if (m) {
        if (!h.handle && !h.id) {
          console.error("Product handle and ID are both missing! Product:", h), alert("Unable to open product: Product information incomplete.");
          return;
        }
      } else {
        console.error("Shop domain is missing! Product:", h), alert("Unable to open product: Shop domain not available. Please contact support.");
        return;
      }
      G && (console.log("Opening product URL:", G), window.open(G, "_blank", "noopener"));
    }, Lf = (h) => {
      if (!h) return "";
      let m = h.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "");
      const G = [];
      return m = m.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (p, le, Je) => {
        const we = `__MARKDOWN_LINK_${G.length}__`;
        return console.log("Found markdown link:", p, "-> placeholder:", we), G.push(p), we;
      }), console.log("After replacing markdown links with placeholders:", m), console.log("Markdown links array:", G), m = m.replace(/https?:\/\/[^\s\)]+/g, "[link removed]"), console.log("After removing standalone URLs:", m), G.forEach((p, le) => {
        m = m.replace(`__MARKDOWN_LINK_${le}__`, p), console.log(`Restored markdown link ${le}:`, p);
      }), m = m.replace(/\n\s*\n\s*\n/g, `

`).trim(), m;
    }, Ja = ie(!1);
    ie(!1);
    const go = oe(() => {
      var h;
      return !!((h = M.value) != null && h.human_agent_name);
    }), Qa = oe(() => {
      var h;
      return I_((h = window.__INITIAL_DATA__) == null ? void 0 : h.presence, go.value);
    }), js = oe(() => {
      var h;
      return !((h = window.__INITIAL_DATA__) != null && h.hideBranding);
    }), Nf = oe(() => jn.value && go.value && Be.value.length < Uc), Pf = async () => {
      try {
        rn.value = !1, On.value = null, await ke();
      } catch (h) {
        console.error("Failed to proceed workflow:", h);
      }
    }, _o = async (h) => {
      try {
        if (!h.userInputValue || !h.userInputValue.trim())
          return;
        const m = h.userInputValue.trim();
        h.isSubmitted = !0, h.submittedValue = m, await z(m, pe.value);
      } catch (m) {
        console.error("Failed to submit user input:", m), h.isSubmitted = !1, h.submittedValue = null;
      }
    }, el = (h, { reason: m, description: G, keepalive: p = !1 } = {}) => {
      const le = new URL(`${Ds.API_URL}/widgets/${n.value}/end-chat`);
      return le.searchParams.append("session_id", h), m && le.searchParams.append("reason", m), G && le.searchParams.append("description", G), fetch(le, {
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
      var h, m, G;
      try {
        let p = 0;
        const le = 50;
        for (; !((h = window.__INITIAL_DATA__) != null && h.widgetId) && p < le; )
          await new Promise((we) => setTimeout(we, 100)), p++;
        return (m = window.__INITIAL_DATA__) != null && m.widgetId ? (ve(window.__INITIAL_DATA__.widgetId), await wt() ? ((G = window.__INITIAL_DATA__) != null && G.workflow && be.value && await Oe(), !0) : (L.value = "connected", !1)) : (console.error("Widget data not available after waiting"), !1);
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
      }), h.data.type === "PREFILL_MESSAGE" && typeof h.data.text == "string" && (J.value = h.data.text.slice(0, 2e3), is(() => {
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
      }), Qe(async () => {
        await wt();
      }), ye(({ session_id: h, authenticated: m, created: G }) => {
        At({
          type: "CHAT_SESSION",
          sessionId: h,
          authenticated: m,
          created: G
        });
      }), Ye((h) => {
        var m;
        if (K.value = h.button_text || "Start Chat", h.type === "landing_page")
          On.value = h.landing_page_data, rn.value = !0, d.value = !1;
        else if (h.type === "form" || h.type === "display_form")
          if (((m = h.form_data) == null ? void 0 : m.form_full_screen) === !0)
            k.value = h.form_data, d.value = !0, rn.value = !1;
          else {
            const G = {
              message: "",
              message_type: "form",
              attributes: {
                form_data: h.form_data
              },
              created_at: (/* @__PURE__ */ new Date()).toISOString(),
              isSubmitted: !1
            };
            l.value.findIndex(
              (le) => le.message_type === "form" && !le.isSubmitted
            ) === -1 && l.value.push(G), rn.value = !1, d.value = !1;
          }
        else
          rn.value = !1, d.value = !1;
      }), ze((h) => {
        console.log("Workflow proceeded:", h);
      });
    }, $f = async () => {
      try {
        await hr(), await Oe();
      } catch (h) {
        throw console.error("Failed to start new conversation:", h), h;
      }
    }, ci = oe(
      () => {
        var h;
        return s.value.allow_new_chat === !0 && l.value.length > 0 && !((h = M.value) != null && h.human_agent_name) && !As.value;
      }
    ), Yn = ie(!1), Xn = ie(""), Zn = ie(!1);
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
          M.value = {}, J.value = "", Be.value = [], await hr();
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
      await hr(), Ff(), Ie(), document.addEventListener("click", Me), (() => {
        const m = l.value.length > 0, G = L.value === "connected", p = document.querySelector('input[type="text"], textarea') !== null;
        return m || G || p;
      })() && I(100);
    }), Vr(() => {
      window.removeEventListener("message", (h) => {
        h.data.type === "SCROLL_TO_BOTTOM" && bn();
      }), document.removeEventListener("click", Me), Pe && (Pe.disconnect(), Pe = null), Ie.timeoutId && (clearTimeout(Ie.timeoutId), Ie.timeoutId = null), _ = !0, R(), re(), $s(), Ws(), x();
    });
    const qs = oe(() => s.value.chat_style === "AURORA"), on = oe(() => s.value.chat_style === "ASK_ANYTHING" || qs.value), il = oe(() => s.value.customization_metadata), Vs = oe(() => {
      var m;
      const h = (m = il.value) == null ? void 0 : m.avatar_style;
      return h === "orb" ? !0 : h === "photo" ? !1 : qs.value && !s.value.photo_url;
    }), Ts = oe(() => {
      var h;
      return C_(r.value || "", (h = il.value) == null ? void 0 : h.orb_variant);
    }), zf = {
      GLASS: "theme-glass",
      TERMINAL: "theme-terminal",
      PLAYFUL: "theme-playful",
      CALM_MINT: "theme-calm",
      SUNRISE: "theme-sunrise"
    }, Hf = oe(() => zf[s.value.chat_style] || ""), jf = oe(() => kv(s.value.chat_style, {
      chat_background_color: s.value.chat_background_color,
      chat_text_color: s.value.chat_text_color,
      accent_color: s.value.accent_color,
      font_family: s.value.font_family
    })), yo = oe(
      () => Array.isArray(s.value.quick_actions) ? s.value.quick_actions.filter((h) => !!h && h.trim().length > 0) : []
    ), ol = oe(() => (s.value.welcome_message || "").trim()), al = oe(
      () => !on.value && l.value.length === 0 && !T.value && !As.value
    ), Wf = oe(
      () => al.value && ol.value.length > 0
    ), qf = oe(
      () => al.value && !B.value && yo.value.length > 0
    ), ui = oe(() => s.value.show_citations === !0), ll = oe(() => R_(s.value.show_ai_disclaimer, go.value)), Vf = (h) => /^[0-9a-f]{16,}$/i.test(h) || /^[0-9a-f-]{32,}$/i.test(h), vo = (h) => {
      const m = (h || "").trim().toLowerCase();
      return !m || m === "unknown" ? "Knowledge base" : m.charAt(0).toUpperCase() + m.slice(1);
    }, bo = (h) => {
      let m = ((h == null ? void 0 : h.name) || "").trim();
      return !m || (m = m.replace(/^[0-9a-f]{16,}[_-]/i, "").replace(/\.(pdf|txt|md|html?|docx?|csv|json)$/i, ""), !m || Vf(m)) ? vo(h == null ? void 0 : h.type) : m;
    }, cl = (h) => {
      const m = bo(h), G = vo(h == null ? void 0 : h.type);
      return m === G ? G : `${m} · ${G}`;
    }, wo = oe(() => s.value.collect_email === !0 && !on.value), ul = ie(!1), Jn = ie(""), dr = ie(!1), As = oe(() => !O.value && wo.value && !ul.value), fl = async () => {
      const h = pe.value.trim();
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
    }, ko = ie(null), hl = ie(!0), To = { mode: "floating", width: 400, height: 560 }, fi = oe(
      () => {
        var h;
        return ko.value || ((h = s.value.customization_metadata) == null ? void 0 : h.widget_display) || null;
      }
    ), Kf = oe(() => {
      const h = fi.value;
      return h ? typeof h.mode == "string" && h.mode !== To.mode || typeof h.width == "number" && h.width !== To.width || typeof h.height == "number" && h.height !== To.height : !1;
    }), Gf = oe(() => {
      var m;
      const h = {
        width: "100%",
        height: "100%",
        borderRadius: "var(--radius-lg)"
      };
      if (Kf.value) {
        const G = (m = fi.value) == null ? void 0 : m.mode;
        return G === "sidebar-left" || G === "sidebar-right" ? { ...h, borderRadius: "0" } : h;
      }
      return on.value ? window.innerWidth <= 768 ? {
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
    }), dl = oe(() => on.value && l.value.length === 0), Yf = ["form", "user_input", "rating", "product", "shopify_output"], Xf = oe(
      () => l.value.some(
        (h) => Yf.includes(h.message_type) || Array.isArray(h.attachments) && h.attachments.length > 0
      )
    ), Zf = oe(() => {
      var m, G;
      return on.value ? !0 : (((m = fi.value) == null ? void 0 : m.mode) === "ask-ai" || ((G = fi.value) == null ? void 0 : G.mode) === "search-bar") && !jn.value;
    }), Ao = oe(
      () => Zf.value && de.value && !rn.value && !d.value && !As.value && !B.value && !Xf.value
    );
    pt(Ao, (h) => {
      At({ type: "WIDGET_SURFACE", palette: h });
    }, { immediate: !0 });
    const Jf = oe(
      () => s.value.welcome_subtitle || `Ask a question — ${r.value || "the assistant"} answers from what it knows.`
    ), Qf = oe(() => {
      var h;
      return ((h = ko.value) == null ? void 0 : h.hotkey) !== !1;
    });
    return (h, m) => {
      var G;
      return Nt.value && Vt.value ? (w(), A("div", Av, [
        g("button", {
          type: "button",
          class: "cm-error-close",
          "aria-label": "Close chat",
          title: "Close",
          onClick: mn
        }, "×"),
        g("div", Sv, [
          m[21] || (m[21] = No('<div class="widget-unavailable-icon-wrapper" data-v-62641333><svg class="widget-unavailable-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-v-62641333><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" data-v-62641333></path><path d="M9 12l2 2 4-4" data-v-62641333></path></svg></div><h2 class="widget-unavailable-title" data-v-62641333>Chat Unavailable</h2><p class="widget-unavailable-message" data-v-62641333> This chat widget is not currently configured. Please contact the website administrator to enable chat support. </p>', 3)),
          js.value ? (w(), A("div", Ev, [
            Dt(Sr, {
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
          ])) : ee("", !0)
        ])
      ])) : Nt.value ? (w(), A("div", xv, [
        g("button", {
          type: "button",
          class: "cm-error-close",
          "aria-label": "Close chat",
          title: "Close",
          onClick: mn
        }, "×"),
        g("div", Cv, [
          m[22] || (m[22] = No('<div class="auth-error-header" data-v-62641333><svg class="auth-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-62641333><circle cx="12" cy="12" r="10" data-v-62641333></circle><line x1="12" y1="8" x2="12" y2="12" data-v-62641333></line><line x1="12" y1="16" x2="12.01" y2="16" data-v-62641333></line></svg><h2 data-v-62641333>Authentication Error</h2></div>', 1)),
          g("p", Rv, Z(Ut.value), 1),
          g("button", {
            class: "auth-error-refresh-btn",
            onClick: m[0] || (m[0] = () => h.window.location.reload())
          }, " Refresh Page ")
        ])
      ])) : n.value && !Nt.value ? (w(), A("div", {
        key: 2,
        class: Le(["chat-container cm-surface", [{ collapsed: !de.value, "ask-anything-style": on.value, aurora: qs.value }, Hf.value]]),
        style: Ee({ ...E(po), ...Gf.value, ...jf.value })
      }, [
        $e.value ? (w(), A("div", Iv, m[23] || (m[23] = [
          No('<div class="loading-spinner" data-v-62641333><div class="dot" data-v-62641333></div><div class="dot" data-v-62641333></div><div class="dot" data-v-62641333></div></div><div class="loading-text" data-v-62641333>Initializing chat...</div>', 2)
        ]))) : ee("", !0),
        !$e.value && E(L) !== "connected" ? (w(), A("div", {
          key: 1,
          class: Le(["connection-status", E(L)])
        }, [
          E(L) === "connecting" ? (w(), A("div", Ov, m[24] || (m[24] = [
            Nn(" Connecting to chat service... ", -1),
            g("div", { class: "loading-dots" }, [
              g("div", { class: "dot" }),
              g("div", { class: "dot" }),
              g("div", { class: "dot" })
            ], -1)
          ]))) : E(L) === "failed" ? (w(), A("div", Lv, [
            m[25] || (m[25] = Nn(" Connection failed. ", -1)),
            g("button", {
              onClick: oi,
              class: "reconnect-button"
            }, " Click here to reconnect ")
          ])) : ee("", !0)
        ], 2)) : ee("", !0),
        E(b) ? (w(), A("div", {
          key: 2,
          class: "error-alert",
          style: Ee(E(Xr))
        }, Z(E(u)), 5)) : ee("", !0),
        Ao.value ? (w(), ss(vg, {
          key: 3,
          messages: E(l),
          draft: J.value,
          "agent-name": E(r),
          suggestions: yo.value,
          "welcome-title": E(s).welcome_title,
          "welcome-subtitle": Jf.value,
          placeholder: Us.value,
          "input-enabled": vn.value,
          "typing-enabled": bs.value,
          loading: E(f),
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
          "display-text": E(se),
          "is-streaming": E(X),
          "onUpdate:draft": m[1] || (m[1] = (p) => J.value = p),
          onSend: nn,
          onAsk: Kn,
          onClose: mn
        }, null, 8, ["messages", "draft", "agent-name", "suggestions", "welcome-title", "welcome-subtitle", "placeholder", "input-enabled", "typing-enabled", "loading", "show-citations", "disclaimer", "show-branding", "active", "hotkey", "can-start-new-chat", "starting-new-chat", "new-chat-armed", "new-chat-error", "display-text", "is-streaming"])) : dl.value ? (w(), A("div", {
          key: 4,
          class: Le(["welcome-message-section", { aurora: qs.value }]),
          style: Ee(E(gs))
        }, [
          g("div", Nv, [
            g("div", Pv, [
              Vs.value ? (w(), A("div", {
                key: 0,
                class: "welcome-orb",
                style: Ee(Ts.value)
              }, null, 4)) : E(ft) ? (w(), A("img", {
                key: 1,
                src: E(ft),
                alt: E(r),
                class: "welcome-avatar"
              }, null, 8, Mv)) : ee("", !0),
              g("h1", Dv, Z(E(s).welcome_title || `Welcome to ${E(r)}`), 1),
              g("p", Fv, Z(E(s).welcome_subtitle || "I'm here to help you with anything you need. What can I assist you with today?"), 1)
            ])
          ]),
          g("div", $v, [
            !E(O) && !be.value && wo.value ? (w(), A("div", Bv, [
              es(g("input", {
                "onUpdate:modelValue": m[2] || (m[2] = (p) => pe.value = p),
                type: "email",
                placeholder: "Enter your email address",
                disabled: E(f) || E(L) !== "connected",
                class: Le([{
                  invalid: pe.value.trim() && !E(vr)(pe.value.trim()),
                  disabled: E(L) !== "connected"
                }, "welcome-email-input"])
              }, null, 10, Uv), [
                [xs, pe.value]
              ])
            ])) : ee("", !0),
            g("div", zv, [
              es(g("input", {
                "onUpdate:modelValue": m[3] || (m[3] = (p) => J.value = p),
                type: "text",
                placeholder: Us.value,
                onKeypress: Gn,
                onInput: Te,
                onChange: Te,
                disabled: !bs.value,
                class: Le([{ disabled: !bs.value }, "welcome-message-field"])
              }, null, 42, Hv), [
                [xs, J.value]
              ]),
              g("button", {
                class: Le(["welcome-send-button", { "aurora-send": qs.value }]),
                style: Ee(E(dn)),
                onClick: nn,
                disabled: !J.value.trim() || !vn.value || In.value
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
            style: Ee(E(Kt))
          }, [
            Dt(Sr, {
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
          ], 4)) : ee("", !0)
        ], 6)) : ee("", !0),
        rn.value && On.value ? (w(), A("div", {
          key: 5,
          class: "landing-page-fullscreen",
          style: Ee(E(gs))
        }, [
          g("div", Vv, [
            g("div", Kv, [
              g("h2", Gv, Z(On.value.heading), 1),
              g("div", Yv, Z(On.value.content), 1)
            ]),
            g("div", Xv, [
              g("button", {
                class: "landing-page-button",
                onClick: Pf
              }, Z(K.value), 1)
            ])
          ]),
          js.value ? (w(), A("div", {
            key: 0,
            class: "powered-by-landing",
            style: Ee(E(Kt))
          }, [
            Dt(Sr, {
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
          ], 4)) : ee("", !0)
        ], 4)) : d.value && k.value ? (w(), A("div", {
          key: 6,
          class: "form-fullscreen",
          style: Ee(E(gs))
        }, [
          g("div", Zv, [
            k.value.title || k.value.description ? (w(), A("div", Jv, [
              k.value.title ? (w(), A("h2", Qv, Z(k.value.title), 1)) : ee("", !0),
              k.value.description ? (w(), A("p", eb, Z(k.value.description), 1)) : ee("", !0)
            ])) : ee("", !0),
            g("div", tb, [
              (w(!0), A(Re, null, dt(k.value.fields, (p) => {
                var le, Je;
                return w(), A("div", {
                  key: p.name,
                  class: "form-field"
                }, [
                  g("label", {
                    for: `fullscreen-form-${p.name}`,
                    class: "field-label"
                  }, [
                    Nn(Z(p.label) + " ", 1),
                    p.required ? (w(), A("span", sb, "*")) : ee("", !0)
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
                    onInput: (we) => qe(p.name, we.target.value),
                    onBlur: (we) => qe(p.name, we.target.value),
                    class: Le(["form-input", { error: ut.value[p.name] }]),
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
                    onInput: (we) => qe(p.name, we.target.value),
                    class: Le(["form-input", { error: ut.value[p.name] }])
                  }, null, 42, ib)) : p.type === "textarea" ? (w(), A("textarea", {
                    key: 2,
                    id: `fullscreen-form-${p.name}`,
                    placeholder: p.placeholder || "",
                    required: p.required,
                    minlength: p.minLength,
                    maxlength: p.maxLength,
                    value: ht.value[p.name] || "",
                    onInput: (we) => qe(p.name, we.target.value),
                    class: Le(["form-textarea", { error: ut.value[p.name] }]),
                    rows: "4"
                  }, null, 42, ob)) : p.type === "select" ? (w(), A("select", {
                    key: 3,
                    id: `fullscreen-form-${p.name}`,
                    required: p.required,
                    value: ht.value[p.name] || "",
                    onChange: (we) => qe(p.name, we.target.value),
                    class: Le(["form-select", { error: ut.value[p.name] }])
                  }, [
                    g("option", lb, Z(p.placeholder || "Please select..."), 1),
                    (w(!0), A(Re, null, dt((Array.isArray(p.options) ? p.options : ((le = p.options) == null ? void 0 : le.split(`
`)) || []).filter((we) => we.trim()), (we) => (w(), A("option", {
                      key: we,
                      value: we.trim()
                    }, Z(we.trim()), 9, cb))), 128))
                  ], 42, ab)) : p.type === "checkbox" ? (w(), A("label", ub, [
                    g("input", {
                      id: `fullscreen-form-${p.name}`,
                      type: "checkbox",
                      required: p.required,
                      checked: ht.value[p.name] || !1,
                      onChange: (we) => qe(p.name, we.target.checked),
                      class: "form-checkbox"
                    }, null, 40, fb),
                    g("span", hb, Z(p.label), 1)
                  ])) : p.type === "radio" ? (w(), A("div", db, [
                    (w(!0), A(Re, null, dt((Array.isArray(p.options) ? p.options : ((Je = p.options) == null ? void 0 : Je.split(`
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
                        onChange: (lt) => qe(p.name, we.trim()),
                        class: "form-radio"
                      }, null, 40, pb),
                      g("span", mb, Z(we.trim()), 1)
                    ]))), 128))
                  ])) : ee("", !0),
                  ut.value[p.name] ? (w(), A("div", gb, Z(ut.value[p.name]), 1)) : ee("", !0)
                ]);
              }), 128))
            ]),
            g("div", _b, [
              g("button", {
                onClick: m[4] || (m[4] = () => {
                  console.log("Submit button clicked!"), If();
                }),
                disabled: vt.value,
                class: "submit-form-button",
                style: Ee(E(dn))
              }, [
                vt.value ? (w(), A("span", vb, m[30] || (m[30] = [
                  g("div", { class: "dot" }, null, -1),
                  g("div", { class: "dot" }, null, -1),
                  g("div", { class: "dot" }, null, -1)
                ]))) : (w(), A("span", bb, Z(k.value.submit_button_text || "Submit"), 1))
              ], 12, yb)
            ])
          ]),
          js.value ? (w(), A("div", {
            key: 0,
            class: "powered-by-landing",
            style: Ee(E(Kt))
          }, [
            Dt(Sr, {
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
          ], 4)) : ee("", !0)
        ], 4)) : !dl.value && de.value && !Ao.value ? (w(), A("div", {
          key: 7,
          class: Le(["chat-panel", { "ask-anything-chat": on.value }]),
          style: Ee(E(gs))
        }, [
          on.value ? (w(), A("div", {
            key: 1,
            class: "ask-anything-top",
            style: Ee(E(Zr))
          }, [
            g("div", Cb, [
              Q.value || E(ft) ? (w(), A("img", {
                key: 0,
                src: Q.value || E(ft),
                alt: E(M).human_agent_name || E(r),
                class: "header-avatar"
              }, null, 8, Rb)) : ee("", !0),
              g("div", Ib, [
                g("h3", {
                  style: Ee(E(Kt))
                }, Z(E(r)), 5),
                g("p", {
                  class: "ask-anything-subtitle",
                  style: Ee(E(Kt))
                }, Z(E(s).welcome_subtitle || "Ask me anything. I'm here to help."), 5)
              ])
            ])
          ], 4)) : (w(), A("div", {
            key: 0,
            class: "chat-header",
            style: Ee(E(Zr))
          }, [
            g("div", {
              class: "cm-header-sheen",
              style: Ee({ background: "linear-gradient(90deg, transparent, " + (E(s).accent_color || "#C9F24E") + ", transparent)" })
            }, null, 4),
            g("div", wb, [
              !Q.value && (Vs.value || !E(ft)) ? (w(), A("div", {
                key: 0,
                class: "header-orb",
                style: Ee(Ts.value)
              }, null, 4)) : Q.value || E(ft) ? (w(), A("img", {
                key: 1,
                src: Q.value || E(ft),
                alt: E(M).human_agent_name || E(r),
                class: "header-avatar"
              }, null, 8, kb)) : ee("", !0),
              g("div", Tb, [
                g("h3", {
                  style: Ee(E(Kt))
                }, Z(E(M).human_agent_name || E(r)), 5),
                g("div", Ab, [
                  g("span", {
                    class: Le(["status-indicator", Qa.value.online ? "online" : "away"])
                  }, null, 2),
                  g("span", Sb, Z(Qa.value.text), 1)
                ])
              ])
            ]),
            g("div", Eb, [
              ci.value ? (w(), A("button", {
                key: 0,
                type: "button",
                class: Le(["header-new-chat", { armed: Zn.value }]),
                style: Ee(E(Kt)),
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
              ]), 14, xb)) : ee("", !0),
              g("button", {
                type: "button",
                class: "header-minimize",
                style: Ee(E(Kt)),
                title: "Minimize",
                "aria-label": "Minimize chat",
                onClick: mn
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
          ]))) : ee("", !0),
          As.value ? (w(), A("div", {
            key: 3,
            class: "cm-email-gate",
            style: Ee(E(gs))
          }, [
            g("div", {
              class: "cm-email-gate-orb",
              style: Ee(Ts.value)
            }, null, 4),
            g("h3", Lb, Z(E(s).welcome_title || "Before we start"), 1),
            m[35] || (m[35] = g("p", { class: "cm-email-gate-text" }, "Enter your email and we'll continue the chat.", -1)),
            es(g("input", {
              "onUpdate:modelValue": m[5] || (m[5] = (p) => pe.value = p),
              type: "email",
              inputmode: "email",
              autocomplete: "email",
              placeholder: "you@example.com",
              class: Le(["cm-email-gate-input", { invalid: !!Jn.value }]),
              disabled: dr.value,
              onKeyup: Si(fl, ["enter"]),
              onInput: m[6] || (m[6] = (p) => Jn.value = "")
            }, null, 42, Nb), [
              [xs, pe.value]
            ]),
            Jn.value ? (w(), A("p", Pb, Z(Jn.value), 1)) : ee("", !0),
            g("button", {
              type: "button",
              class: "cm-email-gate-btn",
              style: Ee(E(dn)),
              disabled: dr.value,
              onClick: fl
            }, Z(dr.value ? "Please wait…" : "Continue to chat"), 13, Mb)
          ], 4)) : ee("", !0),
          Zn.value && ci.value ? (w(), ss(lf, {
            key: 4,
            busy: Yn.value,
            error: Xn.value,
            onConfirm: rl,
            onCancel: Ws
          }, null, 8, ["busy", "error"])) : ee("", !0),
          es(g("div", {
            class: "chat-messages",
            ref_key: "messagesContainer",
            ref: Wn,
            role: "log",
            "aria-label": "Messages"
          }, [
            E(Lt) ? (w(), ss(p_, {
              key: 0,
              progress: E(Lt),
              onSkip: E(v),
              onHide: E(N)
            }, null, 8, ["progress", "onSkip", "onHide"])) : ee("", !0),
            Wf.value ? (w(), A("div", Db, [
              g("div", Fb, [
                Vs.value || !E(ft) ? (w(), A("div", {
                  key: 0,
                  class: "cm-welcome-orb",
                  style: Ee(Ts.value)
                }, null, 4)) : (w(), A("img", {
                  key: 1,
                  src: E(ft),
                  alt: E(r),
                  class: "cm-welcome-avatar"
                }, null, 8, $b)),
                g("div", {
                  class: "message-bubble cm-welcome-bubble",
                  style: Ee(E(Rn))
                }, Z(ol.value), 5)
              ])
            ])) : ee("", !0),
            (w(!0), A(Re, null, dt(E(l), (p, le) => {
              var Je, we, lt, et, pr, mr, Qn, Ks, pl, ml, gl, _l, yl, vl, bl, wl, kl, Tl, Al, Sl;
              return w(), A(Re, { key: le }, [
                E(V).isBefore(p) ? (w(), A("div", Bb, [
                  Vs.value || !E(ft) ? (w(), A("div", {
                    key: 0,
                    class: "cm-welcome-orb",
                    style: Ee(Ts.value)
                  }, null, 4)) : (w(), A("img", {
                    key: 1,
                    src: E(ft),
                    alt: E(r),
                    class: "cm-welcome-avatar"
                  }, null, 8, Ub)),
                  g("div", {
                    class: "message-bubble cm-welcome-bubble",
                    style: Ee(E(Rn))
                  }, Z((Je = q.value) == null ? void 0 : Je.message), 5)
                ])) : ee("", !0),
                g("div", {
                  class: Le([
                    "message",
                    p.message_type === "bot" || p.message_type === "agent" ? "agent-message" : p.message_type === "system" ? "system-message" : p.message_type === "rating" ? "rating-message" : p.message_type === "form" ? "form-message" : p.message_type === "product" || p.shopify_output ? "product-message" : "user-message"
                  ])
                }, [
                  p.message_type === "bot" || p.message_type === "agent" ? (w(), A("div", zb, [
                    Q.value ? (w(), A("img", {
                      key: 0,
                      src: Q.value,
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
                      style: Ee(Ts.value)
                    }, null, 4))
                  ])) : ee("", !0),
                  g("div", Wb, [
                    g("div", {
                      class: "message-bubble",
                      style: Ee(p.message_type === "system" || p.message_type === "rating" || p.message_type === "form" || p.message_type === "product" || p.shopify_output ? {} : p.message_type === "user" ? E(dn) : E(Rn))
                    }, [
                      p.message_type === "rating" ? (w(), A("div", qb, [
                        g("p", Vb, "Rate the chat session that you had with " + Z(p.agent_name || E(M).human_agent_name || E(r) || "our agent"), 1),
                        g("div", {
                          class: Le(["star-rating", { submitted: Gt.value || p.isSubmitted }])
                        }, [
                          (w(), A(Re, null, dt(5, (F) => g("button", {
                            key: F,
                            class: Le(["star-button", {
                              warning: F <= (p.isSubmitted ? p.finalRating : sn.value || p.selectedRating) && (p.isSubmitted ? p.finalRating : sn.value || p.selectedRating) <= 3,
                              success: F <= (p.isSubmitted ? p.finalRating : sn.value || p.selectedRating) && (p.isSubmitted ? p.finalRating : sn.value || p.selectedRating) > 3,
                              selected: F <= (p.isSubmitted ? p.finalRating : sn.value || p.selectedRating)
                            }]),
                            onMouseover: (Yt) => !p.isSubmitted && _e(F),
                            onMouseleave: (Yt) => !p.isSubmitted && Ze,
                            onClick: (Yt) => !p.isSubmitted && at(F),
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
                            g("div", Zb, Z(((we = p.feedback) == null ? void 0 : we.length) || 0) + "/500", 1)
                          ]),
                          g("button", {
                            onClick: (F) => Et(p.session_id, sn.value, p.feedback),
                            disabled: Gt.value || !sn.value,
                            class: "submit-rating-button",
                            style: Ee({ backgroundColor: E(s).accent_color || "var(--accent-solid)" })
                          }, Z(Gt.value ? "Submitting..." : "Submit Rating"), 13, Jb)
                        ])) : ee("", !0),
                        p.isSubmitted && p.finalFeedback ? (w(), A("div", Qb, [
                          g("div", ew, [
                            g("p", tw, Z(p.finalFeedback), 1)
                          ])
                        ])) : p.isSubmitted ? (w(), A("div", nw, " Thank you for your rating! ")) : ee("", !0)
                      ])) : p.message_type === "form" ? (w(), A("div", sw, [
                        (et = (lt = p.attributes) == null ? void 0 : lt.form_data) != null && et.title || (mr = (pr = p.attributes) == null ? void 0 : pr.form_data) != null && mr.description ? (w(), A("div", rw, [
                          (Ks = (Qn = p.attributes) == null ? void 0 : Qn.form_data) != null && Ks.title ? (w(), A("h3", iw, Z(p.attributes.form_data.title), 1)) : ee("", !0),
                          (ml = (pl = p.attributes) == null ? void 0 : pl.form_data) != null && ml.description ? (w(), A("p", ow, Z(p.attributes.form_data.description), 1)) : ee("", !0)
                        ])) : ee("", !0),
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
                                Nn(Z(F.label) + " ", 1),
                                F.required ? (w(), A("span", cw, "*")) : ee("", !0)
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
                                onInput: (Ve) => qe(F.name, Ve.target.value),
                                onBlur: (Ve) => qe(F.name, Ve.target.value),
                                class: Le(["form-input", { error: ut.value[F.name] }]),
                                disabled: vt.value,
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
                                onInput: (Ve) => qe(F.name, Ve.target.value),
                                class: Le(["form-input", { error: ut.value[F.name] }]),
                                disabled: vt.value
                              }, null, 42, fw)) : F.type === "textarea" ? (w(), A("textarea", {
                                key: 2,
                                id: `form-${F.name}`,
                                placeholder: F.placeholder || "",
                                required: F.required,
                                minlength: F.minLength,
                                maxlength: F.maxLength,
                                value: ht.value[F.name] || "",
                                onInput: (Ve) => qe(F.name, Ve.target.value),
                                class: Le(["form-textarea", { error: ut.value[F.name] }]),
                                disabled: vt.value,
                                rows: "3"
                              }, null, 42, hw)) : F.type === "select" ? (w(), A("select", {
                                key: 3,
                                id: `form-${F.name}`,
                                required: F.required,
                                value: ht.value[F.name] || "",
                                onChange: (Ve) => qe(F.name, Ve.target.value),
                                class: Le(["form-select", { error: ut.value[F.name] }]),
                                disabled: vt.value
                              }, [
                                g("option", pw, Z(F.placeholder || "Select an option"), 1),
                                (w(!0), A(Re, null, dt((Array.isArray(F.options) ? F.options : ((Yt = F.options) == null ? void 0 : Yt.split(`
`)) || []).filter((Ve) => Ve.trim()), (Ve) => (w(), A("option", {
                                  key: Ve.trim(),
                                  value: Ve.trim()
                                }, Z(Ve.trim()), 9, mw))), 128))
                              ], 42, dw)) : F.type === "checkbox" ? (w(), A("div", gw, [
                                g("input", {
                                  id: `form-${F.name}`,
                                  type: "checkbox",
                                  checked: ht.value[F.name] || !1,
                                  onChange: (Ve) => qe(F.name, Ve.target.checked),
                                  class: "form-checkbox",
                                  disabled: vt.value
                                }, null, 40, _w),
                                g("label", {
                                  for: `form-${F.name}`,
                                  class: "checkbox-label"
                                }, Z(F.placeholder || F.label), 9, yw)
                              ])) : F.type === "radio" ? (w(), A("div", vw, [
                                (w(!0), A(Re, null, dt((Array.isArray(F.options) ? F.options : ((So = F.options) == null ? void 0 : So.split(`
`)) || []).filter((Ve) => Ve.trim()), (Ve) => (w(), A("div", {
                                  key: Ve.trim(),
                                  class: "radio-option"
                                }, [
                                  g("input", {
                                    id: `form-${F.name}-${Ve.trim()}`,
                                    name: `form-${F.name}`,
                                    type: "radio",
                                    value: Ve.trim(),
                                    checked: ht.value[F.name] === Ve.trim(),
                                    onChange: (H0) => qe(F.name, Ve.trim()),
                                    class: "form-radio",
                                    disabled: vt.value
                                  }, null, 40, bw),
                                  g("label", {
                                    for: `form-${F.name}-${Ve.trim()}`,
                                    class: "radio-label"
                                  }, Z(Ve.trim()), 9, ww)
                                ]))), 128))
                              ])) : ee("", !0),
                              ut.value[F.name] ? (w(), A("div", kw, Z(ut.value[F.name]), 1)) : ee("", !0)
                            ]);
                          }), 128))
                        ]),
                        g("div", Tw, [
                          g("button", {
                            onClick: () => {
                              var F;
                              console.log("Regular form submit button clicked!"), fr((F = p.attributes) == null ? void 0 : F.form_data);
                            },
                            disabled: vt.value,
                            class: "form-submit-button",
                            style: Ee(E(dn))
                          }, Z(vt.value ? "Submitting..." : ((vl = (yl = p.attributes) == null ? void 0 : yl.form_data) == null ? void 0 : vl.submit_button_text) || "Submit"), 13, Aw)
                        ])
                      ])) : p.message_type === "user_input" ? (w(), A("div", Sw, [
                        (bl = p.attributes) != null && bl.prompt_message && p.attributes.prompt_message.trim() ? (w(), A("div", Ew, Z(p.attributes.prompt_message), 1)) : ee("", !0),
                        p.isSubmitted ? (w(), A("div", Iw, [
                          m[36] || (m[36] = g("strong", null, "Your input:", -1)),
                          Nn(" " + Z(p.submittedValue) + " ", 1),
                          (wl = p.attributes) != null && wl.confirmation_message && p.attributes.confirmation_message.trim() ? (w(), A("div", Ow, Z(p.attributes.confirmation_message), 1)) : ee("", !0)
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
                        }, null, 8, Nw)) : ee("", !0),
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
                                ])) : ee("", !0),
                                g("div", $w, [
                                  g("div", Bw, [
                                    g("div", Uw, Z(F.title), 1),
                                    F.variant_title && F.variant_title !== "Default Title" ? (w(), A("div", zw, Z(F.variant_title), 1)) : ee("", !0),
                                    g("div", Hw, Z(F.price_formatted || E(a)(F.price, F.currency)), 1)
                                  ]),
                                  g("div", jw, [
                                    g("button", {
                                      class: "view-details-button-compact",
                                      onClick: (So) => {
                                        var Ve;
                                        return Of(F, (Ve = p.shopify_output) == null ? void 0 : Ve.shop_domain);
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
                        ]))) : ee("", !0)
                      ])) : (w(), A(Re, { key: 4 }, [
                        E(X)(le) ? (w(), A("div", {
                          key: 0,
                          class: "message-streaming",
                          innerHTML: E(xi)(E(se)(le, p.message))
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
                                  Nn(" " + Z(F.filename) + " ", 1),
                                  g("span", e0, "(" + Z(E(Bs)(F.file_size)) + ")", 1)
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
                              Nn(" " + Z(F.filename) + " ", 1),
                              g("span", n0, "(" + Z(E(Bs)(F.file_size)) + ")", 1)
                            ], 8, t0))
                          ]))), 128))
                        ])) : ee("", !0)
                      ], 64))
                    ], 4),
                    ui.value && (p.message_type === "bot" || p.message_type === "agent") && p.sources && p.sources.length ? (w(), A("div", s0, [
                      m[43] || (m[43] = g("span", { class: "citation-label" }, "Sources", -1)),
                      (w(!0), A(Re, null, dt(p.sources, (F, Yt) => (w(), A("span", {
                        key: Yt,
                        class: "citation-chip",
                        title: cl(F)
                      }, Z(bo(F)), 9, r0))), 128))
                    ])) : ee("", !0),
                    g("div", i0, [
                      p.message_type === "user" ? (w(), A("span", o0, " You ")) : ee("", !0)
                    ])
                  ])
                ], 2),
                (w(!0), A(Re, null, dt(E(De)(le + 1), (F, Yt) => (w(), ss(Xg, {
                  key: `receipt-${le}-${Yt}`,
                  receipt: F
                }, null, 8, ["receipt"]))), 128))
              ], 64);
            }), 128)),
            E(V).isLast() ? (w(), A("div", a0, [
              Vs.value || !E(ft) ? (w(), A("div", {
                key: 0,
                class: "cm-welcome-orb",
                style: Ee(Ts.value)
              }, null, 4)) : (w(), A("img", {
                key: 1,
                src: E(ft),
                alt: E(r),
                class: "cm-welcome-avatar"
              }, null, 8, l0)),
              g("div", {
                class: "message-bubble cm-welcome-bubble",
                style: Ee(E(Rn))
              }, Z((G = q.value) == null ? void 0 : G.message), 5)
            ])) : ee("", !0),
            P.value.length ? (w(), ss(y_, {
              key: 3,
              chips: P.value,
              disabled: !vn.value || E(yn),
              onPick: U
            }, null, 8, ["chips", "disabled"])) : ee("", !0),
            E(yt) ? (w(), ss(jg, {
              key: 4,
              pending: E(yt),
              onApprove: E(Bt),
              onDecline: E(Wt)
            }, null, 8, ["pending", "onApprove", "onDecline"])) : ee("", !0),
            E(f) && !E(yt) ? (w(), A("div", {
              key: 5,
              class: Le(["typing-indicator", { "reading-indicator": ui.value }])
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
                style: Ee(E(Rn))
              }, m[46] || (m[46] = [
                g("span", { class: "cm-typing-dot" }, null, -1),
                g("span", { class: "cm-typing-dot" }, null, -1),
                g("span", { class: "cm-typing-dot" }, null, -1)
              ]), 4))
            ], 2)) : ee("", !0)
          ], 512), [
            [Qd, !As.value]
          ]),
          qf.value ? (w(), A("div", c0, [
            (w(!0), A(Re, null, dt(yo.value, (p) => (w(), A("button", {
              key: p,
              type: "button",
              class: "cm-quick-action",
              disabled: !vn.value,
              onClick: (le) => Kn(p)
            }, Z(p), 9, u0))), 128))
          ])) : ee("", !0),
          !B.value && !As.value ? (w(), A("div", {
            key: 6,
            class: Le(["chat-input", { "ask-anything-input": on.value }])
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
            E(Be).length > 0 ? (w(), A("div", f0, [
              (w(!0), A(Re, null, dt(E(Be), (p, le) => (w(), A("div", {
                key: le,
                class: "file-preview-widget"
              }, [
                g("div", h0, [
                  E(vs)(p.type) ? (w(), A("img", {
                    key: 0,
                    src: E(cr)(p),
                    alt: p.filename,
                    class: "file-preview-image-widget",
                    onClick: Is((Je) => E(Vn)(p), ["stop"]),
                    style: { cursor: "pointer" }
                  }, null, 8, d0)) : (w(), A("div", {
                    key: 1,
                    class: "file-preview-icon-widget",
                    onClick: Is((Je) => E(Vn)(p), ["stop"]),
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
                  g("div", g0, Z(p.filename), 1),
                  g("div", _0, Z(E(Bs)(p.size)), 1)
                ]),
                g("button", {
                  type: "button",
                  class: "file-preview-remove-widget",
                  onClick: (Je) => E(si)(le),
                  title: "Remove file"
                }, " × ", 8, y0)
              ]))), 128))
            ])) : ee("", !0),
            Ja.value ? (w(), A("div", v0, m[48] || (m[48] = [
              g("div", { class: "upload-spinner-widget" }, null, -1),
              g("span", { class: "upload-text-widget" }, "Uploading files...", -1)
            ]))) : ee("", !0),
            g("div", b0, [
              es(g("input", {
                "onUpdate:modelValue": m[8] || (m[8] = (p) => J.value = p),
                type: "text",
                placeholder: Us.value,
                onKeypress: Gn,
                onInput: Te,
                onChange: Te,
                onPaste: m[9] || (m[9] = //@ts-ignore
                (...p) => E(pn) && E(pn)(...p)),
                onDrop: m[10] || (m[10] = //@ts-ignore
                (...p) => E(ei) && E(ei)(...p)),
                onDragover: m[11] || (m[11] = //@ts-ignore
                (...p) => E(ti) && E(ti)(...p)),
                onDragleave: m[12] || (m[12] = //@ts-ignore
                (...p) => E(ni) && E(ni)(...p)),
                disabled: !bs.value,
                class: Le({ disabled: !bs.value, "ask-anything-field": on.value })
              }, null, 42, w0), [
                [xs, J.value]
              ]),
              Nf.value ? (w(), A("button", {
                key: 0,
                type: "button",
                class: "attach-button",
                disabled: Ja.value,
                onClick: m[13] || (m[13] = //@ts-ignore
                (...p) => E(ri) && E(ri)(...p)),
                title: `Attach files (${E(Be).length}/${Uc} used) or paste screenshots`
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
              ]), 8, k0)) : ee("", !0),
              g("button", {
                class: Le(["send-button", { "ask-anything-send": on.value }]),
                "aria-label": "Send message",
                style: Ee(E(dn)),
                onClick: nn,
                disabled: !J.value.trim() && E(Be).length === 0 || !vn.value || In.value
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
            In.value ? (w(), A("p", A0, Z(E(b_)), 1)) : ee("", !0)
          ], 2)) : B.value && !As.value ? (w(), A("div", S0, [
            g("div", E0, [
              m[51] || (m[51] = g("p", { class: "ended-text" }, "This chat has ended.", -1)),
              g("button", {
                class: "start-new-conversation-button",
                style: Ee(E(dn)),
                onClick: Uf
              }, " Click here to start a new conversation ", 4)
            ])
          ])) : ee("", !0),
          ll.value ? (w(), A("div", x0, Z(E(Sc)), 1)) : ee("", !0),
          js.value ? (w(), A("div", {
            key: 9,
            class: "powered-by",
            style: Ee(E(Kt))
          }, [
            Dt(Sr, {
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
          ], 4)) : ee("", !0)
        ], 6)) : ee("", !0),
        ur.value ? (w(), A("div", C0, [
          g("div", R0, [
            m[53] || (m[53] = g("h3", null, "Rate your conversation", -1)),
            g("div", I0, [
              (w(), A(Re, null, dt(5, (p) => g("button", {
                key: p,
                onClick: (le) => ws.value = p,
                class: Le([{ active: p <= ws.value }, "star-button"])
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
                style: Ee(E(dn))
              }, " Submit ", 12, N0),
              g("button", {
                onClick: m[16] || (m[16] = (p) => ur.value = !1),
                class: "skip-rating"
              }, " Skip ")
            ])
          ])
        ])) : ee("", !0),
        E(qn) ? (w(), A("div", {
          key: 9,
          class: "preview-modal-overlay",
          onClick: m[19] || (m[19] = //@ts-ignore
          (...p) => E(tn) && E(tn)(...p))
        }, [
          g("div", {
            class: "preview-modal-content",
            onClick: m[18] || (m[18] = Is(() => {
            }, ["stop"]))
          }, [
            g("button", {
              class: "preview-modal-close",
              onClick: m[17] || (m[17] = //@ts-ignore
              (...p) => E(tn) && E(tn)(...p))
            }, "×"),
            E(_s) && E(vs)(E(_s).type) ? (w(), A("div", P0, [
              g("img", {
                src: E(cr)(E(_s)),
                alt: E(_s).filename,
                class: "preview-modal-image"
              }, null, 8, M0),
              g("div", D0, Z(E(_s).filename), 1)
            ])) : ee("", !0)
          ])
        ])) : ee("", !0)
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
