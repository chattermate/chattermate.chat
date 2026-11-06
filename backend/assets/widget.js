var qf = Object.defineProperty;
var Vf = (e, t, n) => t in e ? qf(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var Je = (e, t, n) => Vf(e, typeof t != "symbol" ? t + "" : t, n);
/**
* @vue/shared v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function _a(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const n of e.split(",")) t[n] = 1;
  return (n) => n in t;
}
const Qe = {}, tr = [], xn = () => {
}, Kf = () => !1, Ki = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), ya = (e) => e.startsWith("onUpdate:"), Ot = Object.assign, va = (e, t) => {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}, Gf = Object.prototype.hasOwnProperty, We = (e, t) => Gf.call(e, t), Te = Array.isArray, nr = (e) => Gi(e) === "[object Map]", Dc = (e) => Gi(e) === "[object Set]", xe = (e) => typeof e == "function", pt = (e) => typeof e == "string", hs = (e) => typeof e == "symbol", at = (e) => e !== null && typeof e == "object", Fc = (e) => (at(e) || xe(e)) && xe(e.then) && xe(e.catch), $c = Object.prototype.toString, Gi = (e) => $c.call(e), Yf = (e) => Gi(e).slice(8, -1), Bc = (e) => Gi(e) === "[object Object]", ba = (e) => pt(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, Br = /* @__PURE__ */ _a(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), Yi = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (n) => t[n] || (t[n] = e(n));
}, Xf = /-(\w)/g, cs = Yi(
  (e) => e.replace(Xf, (t, n) => n ? n.toUpperCase() : "")
), Zf = /\B([A-Z])/g, ds = Yi(
  (e) => e.replace(Zf, "-$1").toLowerCase()
), Uc = Yi((e) => e.charAt(0).toUpperCase() + e.slice(1)), Ao = Yi(
  (e) => e ? `on${Uc(e)}` : ""
), os = (e, t) => !Object.is(e, t), _i = (e, ...t) => {
  for (let n = 0; n < e.length; n++)
    e[n](...t);
}, Go = (e, t, n, s = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: s,
    value: n
  });
}, Yo = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let wl;
const Xi = () => wl || (wl = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function Ee(e) {
  if (Te(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
      const s = e[n], r = pt(s) ? th(s) : Ee(s);
      if (r)
        for (const i in r)
          t[i] = r[i];
    }
    return t;
  } else if (pt(e) || at(e))
    return e;
}
const Jf = /;(?![^(]*\))/g, Qf = /:([^]+)/, eh = /\/\*[^]*?\*\//g;
function th(e) {
  const t = {};
  return e.replace(eh, "").split(Jf).forEach((n) => {
    if (n) {
      const s = n.split(Qf);
      s.length > 1 && (t[s[0].trim()] = s[1].trim());
    }
  }), t;
}
function Pe(e) {
  let t = "";
  if (pt(e))
    t = e;
  else if (Te(e))
    for (let n = 0; n < e.length; n++) {
      const s = Pe(e[n]);
      s && (t += s + " ");
    }
  else if (at(e))
    for (const n in e)
      e[n] && (t += n + " ");
  return t.trim();
}
const nh = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", sh = /* @__PURE__ */ _a(nh);
function zc(e) {
  return !!e || e === "";
}
const Hc = (e) => !!(e && e.__v_isRef === !0), Z = (e) => pt(e) ? e : e == null ? "" : Te(e) || at(e) && (e.toString === $c || !xe(e.toString)) ? Hc(e) ? Z(e.value) : JSON.stringify(e, jc, 2) : String(e), jc = (e, t) => Hc(t) ? jc(e, t.value) : nr(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (n, [s, r], i) => (n[So(s, i) + " =>"] = r, n),
    {}
  )
} : Dc(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((n) => So(n))
} : hs(t) ? So(t) : at(t) && !Te(t) && !Bc(t) ? String(t) : t, So = (e, t = "") => {
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
let jt;
class rh {
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
function ih() {
  return jt;
}
let tt;
const xo = /* @__PURE__ */ new WeakSet();
class Wc {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, jt && jt.active && jt.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, xo.has(this) && (xo.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Vc(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, kl(this), Kc(this);
    const t = tt, n = yn;
    tt = this, yn = !0;
    try {
      return this.fn();
    } finally {
      Gc(this), tt = t, yn = n, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        Ta(t);
      this.deps = this.depsTail = void 0, kl(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? xo.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    Xo(this) && this.run();
  }
  get dirty() {
    return Xo(this);
  }
}
let qc = 0, Ur, zr;
function Vc(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = zr, zr = e;
    return;
  }
  e.next = Ur, Ur = e;
}
function wa() {
  qc++;
}
function ka() {
  if (--qc > 0)
    return;
  if (zr) {
    let t = zr;
    for (zr = void 0; t; ) {
      const n = t.next;
      t.next = void 0, t.flags &= -9, t = n;
    }
  }
  let e;
  for (; Ur; ) {
    let t = Ur;
    for (Ur = void 0; t; ) {
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
function Kc(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Gc(e) {
  let t, n = e.depsTail, s = n;
  for (; s; ) {
    const r = s.prevDep;
    s.version === -1 ? (s === n && (n = r), Ta(s), oh(s)) : t = s, s.dep.activeLink = s.prevActiveLink, s.prevActiveLink = void 0, s = r;
  }
  e.deps = t, e.depsTail = n;
}
function Xo(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (Yc(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function Yc(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === Gr) || (e.globalVersion = Gr, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !Xo(e))))
    return;
  e.flags |= 2;
  const t = e.dep, n = tt, s = yn;
  tt = e, yn = !0;
  try {
    Kc(e);
    const r = e.fn(e._value);
    (t.version === 0 || os(r, e._value)) && (e.flags |= 128, e._value = r, t.version++);
  } catch (r) {
    throw t.version++, r;
  } finally {
    tt = n, yn = s, Gc(e), e.flags &= -3;
  }
}
function Ta(e, t = !1) {
  const { dep: n, prevSub: s, nextSub: r } = e;
  if (s && (s.nextSub = r, e.prevSub = void 0), r && (r.prevSub = s, e.nextSub = void 0), n.subs === e && (n.subs = s, !s && n.computed)) {
    n.computed.flags &= -5;
    for (let i = n.computed.deps; i; i = i.nextDep)
      Ta(i, !0);
  }
  !t && !--n.sc && n.map && n.map.delete(n.key);
}
function oh(e) {
  const { prevDep: t, nextDep: n } = e;
  t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
let yn = !0;
const Xc = [];
function zn() {
  Xc.push(yn), yn = !1;
}
function Hn() {
  const e = Xc.pop();
  yn = e === void 0 ? !0 : e;
}
function kl(e) {
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
let Gr = 0;
class ah {
  constructor(t, n) {
    this.sub = t, this.dep = n, this.version = n.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Aa {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(t) {
    if (!tt || !yn || tt === this.computed)
      return;
    let n = this.activeLink;
    if (n === void 0 || n.sub !== tt)
      n = this.activeLink = new ah(tt, this), tt.deps ? (n.prevDep = tt.depsTail, tt.depsTail.nextDep = n, tt.depsTail = n) : tt.deps = tt.depsTail = n, Zc(n);
    else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
      const s = n.nextDep;
      s.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = s), n.prevDep = tt.depsTail, n.nextDep = void 0, tt.depsTail.nextDep = n, tt.depsTail = n, tt.deps === n && (tt.deps = s);
    }
    return n;
  }
  trigger(t) {
    this.version++, Gr++, this.notify(t);
  }
  notify(t) {
    wa();
    try {
      for (let n = this.subs; n; n = n.prevSub)
        n.sub.notify() && n.sub.dep.notify();
    } finally {
      ka();
    }
  }
}
function Zc(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let s = t.deps; s; s = s.nextDep)
        Zc(s);
    }
    const n = e.dep.subs;
    n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
  }
}
const Zo = /* @__PURE__ */ new WeakMap(), Os = Symbol(
  ""
), Jo = Symbol(
  ""
), Yr = Symbol(
  ""
);
function Rt(e, t, n) {
  if (yn && tt) {
    let s = Zo.get(e);
    s || Zo.set(e, s = /* @__PURE__ */ new Map());
    let r = s.get(n);
    r || (s.set(n, r = new Aa()), r.map = s, r.key = n), r.track();
  }
}
function Fn(e, t, n, s, r, i) {
  const o = Zo.get(e);
  if (!o) {
    Gr++;
    return;
  }
  const a = (l) => {
    l && l.trigger();
  };
  if (wa(), t === "clear")
    o.forEach(a);
  else {
    const l = Te(e), u = l && ba(n);
    if (l && n === "length") {
      const c = Number(s);
      o.forEach((b, k) => {
        (k === "length" || k === Yr || !hs(k) && k >= c) && a(b);
      });
    } else
      switch ((n !== void 0 || o.has(void 0)) && a(o.get(n)), u && a(o.get(Yr)), t) {
        case "add":
          l ? u && a(o.get("length")) : (a(o.get(Os)), nr(e) && a(o.get(Jo)));
          break;
        case "delete":
          l || (a(o.get(Os)), nr(e) && a(o.get(Jo)));
          break;
        case "set":
          nr(e) && a(o.get(Os));
          break;
      }
  }
  ka();
}
function Zs(e) {
  const t = je(e);
  return t === e ? t : (Rt(t, "iterate", Yr), dn(e) ? t : t.map(At));
}
function Zi(e) {
  return Rt(e = je(e), "iterate", Yr), e;
}
const lh = {
  __proto__: null,
  [Symbol.iterator]() {
    return Eo(this, Symbol.iterator, At);
  },
  concat(...e) {
    return Zs(this).concat(
      ...e.map((t) => Te(t) ? Zs(t) : t)
    );
  },
  entries() {
    return Eo(this, "entries", (e) => (e[1] = At(e[1]), e));
  },
  every(e, t) {
    return Pn(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return Pn(this, "filter", e, t, (n) => n.map(At), arguments);
  },
  find(e, t) {
    return Pn(this, "find", e, t, At, arguments);
  },
  findIndex(e, t) {
    return Pn(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return Pn(this, "findLast", e, t, At, arguments);
  },
  findLastIndex(e, t) {
    return Pn(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return Pn(this, "forEach", e, t, void 0, arguments);
  },
  includes(...e) {
    return Co(this, "includes", e);
  },
  indexOf(...e) {
    return Co(this, "indexOf", e);
  },
  join(e) {
    return Zs(this).join(e);
  },
  // keys() iterator only reads `length`, no optimisation required
  lastIndexOf(...e) {
    return Co(this, "lastIndexOf", e);
  },
  map(e, t) {
    return Pn(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return Sr(this, "pop");
  },
  push(...e) {
    return Sr(this, "push", e);
  },
  reduce(e, ...t) {
    return Tl(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return Tl(this, "reduceRight", e, t);
  },
  shift() {
    return Sr(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return Pn(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return Sr(this, "splice", e);
  },
  toReversed() {
    return Zs(this).toReversed();
  },
  toSorted(e) {
    return Zs(this).toSorted(e);
  },
  toSpliced(...e) {
    return Zs(this).toSpliced(...e);
  },
  unshift(...e) {
    return Sr(this, "unshift", e);
  },
  values() {
    return Eo(this, "values", At);
  }
};
function Eo(e, t, n) {
  const s = Zi(e), r = s[t]();
  return s !== e && !dn(e) && (r._next = r.next, r.next = () => {
    const i = r._next();
    return i.value && (i.value = n(i.value)), i;
  }), r;
}
const ch = Array.prototype;
function Pn(e, t, n, s, r, i) {
  const o = Zi(e), a = o !== e && !dn(e), l = o[t];
  if (l !== ch[t]) {
    const b = l.apply(e, i);
    return a ? At(b) : b;
  }
  let u = n;
  o !== e && (a ? u = function(b, k) {
    return n.call(this, At(b), k, e);
  } : n.length > 2 && (u = function(b, k) {
    return n.call(this, b, k, e);
  }));
  const c = l.call(o, u, s);
  return a && r ? r(c) : c;
}
function Tl(e, t, n, s) {
  const r = Zi(e);
  let i = n;
  return r !== e && (dn(e) ? n.length > 3 && (i = function(o, a, l) {
    return n.call(this, o, a, l, e);
  }) : i = function(o, a, l) {
    return n.call(this, o, At(a), l, e);
  }), r[t](i, ...s);
}
function Co(e, t, n) {
  const s = je(e);
  Rt(s, "iterate", Yr);
  const r = s[t](...n);
  return (r === -1 || r === !1) && Ea(n[0]) ? (n[0] = je(n[0]), s[t](...n)) : r;
}
function Sr(e, t, n = []) {
  zn(), wa();
  const s = je(e)[t].apply(e, n);
  return ka(), Hn(), s;
}
const uh = /* @__PURE__ */ _a("__proto__,__v_isRef,__isVue"), Jc = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(hs)
);
function fh(e) {
  hs(e) || (e = String(e));
  const t = je(this);
  return Rt(t, "has", e), t.hasOwnProperty(e);
}
class Qc {
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
      return s === (r ? i ? wh : su : i ? nu : tu).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(s) ? t : void 0;
    const o = Te(t);
    if (!r) {
      let l;
      if (o && (l = lh[n]))
        return l;
      if (n === "hasOwnProperty")
        return fh;
    }
    const a = Reflect.get(
      t,
      n,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      It(t) ? t : s
    );
    return (hs(n) ? Jc.has(n) : uh(n)) || (r || Rt(t, "get", n), i) ? a : It(a) ? o && ba(n) ? a : a.value : at(a) ? r ? ru(a) : Ji(a) : a;
  }
}
class eu extends Qc {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, n, s, r) {
    let i = t[n];
    if (!this._isShallow) {
      const l = us(i);
      if (!dn(s) && !us(s) && (i = je(i), s = je(s)), !Te(t) && It(i) && !It(s))
        return l ? !1 : (i.value = s, !0);
    }
    const o = Te(t) && ba(n) ? Number(n) < t.length : We(t, n), a = Reflect.set(
      t,
      n,
      s,
      It(t) ? t : r
    );
    return t === je(r) && (o ? os(s, i) && Fn(t, "set", n, s) : Fn(t, "add", n, s)), a;
  }
  deleteProperty(t, n) {
    const s = We(t, n);
    t[n];
    const r = Reflect.deleteProperty(t, n);
    return r && s && Fn(t, "delete", n, void 0), r;
  }
  has(t, n) {
    const s = Reflect.has(t, n);
    return (!hs(n) || !Jc.has(n)) && Rt(t, "has", n), s;
  }
  ownKeys(t) {
    return Rt(
      t,
      "iterate",
      Te(t) ? "length" : Os
    ), Reflect.ownKeys(t);
  }
}
class hh extends Qc {
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
const dh = /* @__PURE__ */ new eu(), ph = /* @__PURE__ */ new hh(), mh = /* @__PURE__ */ new eu(!0);
const Qo = (e) => e, ui = (e) => Reflect.getPrototypeOf(e);
function gh(e, t, n) {
  return function(...s) {
    const r = this.__v_raw, i = je(r), o = nr(i), a = e === "entries" || e === Symbol.iterator && o, l = e === "keys" && o, u = r[e](...s), c = n ? Qo : t ? Li : At;
    return !t && Rt(
      i,
      "iterate",
      l ? Jo : Os
    ), {
      // iterator protocol
      next() {
        const { value: b, done: k } = u.next();
        return k ? { value: b, done: k } : {
          value: a ? [c(b[0]), c(b[1])] : c(b),
          done: k
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function fi(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function _h(e, t) {
  const n = {
    get(r) {
      const i = this.__v_raw, o = je(i), a = je(r);
      e || (os(r, a) && Rt(o, "get", r), Rt(o, "get", a));
      const { has: l } = ui(o), u = t ? Qo : e ? Li : At;
      if (l.call(o, r))
        return u(i.get(r));
      if (l.call(o, a))
        return u(i.get(a));
      i !== o && i.get(r);
    },
    get size() {
      const r = this.__v_raw;
      return !e && Rt(je(r), "iterate", Os), Reflect.get(r, "size", r);
    },
    has(r) {
      const i = this.__v_raw, o = je(i), a = je(r);
      return e || (os(r, a) && Rt(o, "has", r), Rt(o, "has", a)), r === a ? i.has(r) : i.has(r) || i.has(a);
    },
    forEach(r, i) {
      const o = this, a = o.__v_raw, l = je(a), u = t ? Qo : e ? Li : At;
      return !e && Rt(l, "iterate", Os), a.forEach((c, b) => r.call(i, u(c), u(b), o));
    }
  };
  return Ot(
    n,
    e ? {
      add: fi("add"),
      set: fi("set"),
      delete: fi("delete"),
      clear: fi("clear")
    } : {
      add(r) {
        !t && !dn(r) && !us(r) && (r = je(r));
        const i = je(this);
        return ui(i).has.call(i, r) || (i.add(r), Fn(i, "add", r, r)), this;
      },
      set(r, i) {
        !t && !dn(i) && !us(i) && (i = je(i));
        const o = je(this), { has: a, get: l } = ui(o);
        let u = a.call(o, r);
        u || (r = je(r), u = a.call(o, r));
        const c = l.call(o, r);
        return o.set(r, i), u ? os(i, c) && Fn(o, "set", r, i) : Fn(o, "add", r, i), this;
      },
      delete(r) {
        const i = je(this), { has: o, get: a } = ui(i);
        let l = o.call(i, r);
        l || (r = je(r), l = o.call(i, r)), a && a.call(i, r);
        const u = i.delete(r);
        return l && Fn(i, "delete", r, void 0), u;
      },
      clear() {
        const r = je(this), i = r.size !== 0, o = r.clear();
        return i && Fn(
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
    n[r] = gh(r, e, t);
  }), n;
}
function Sa(e, t) {
  const n = _h(e, t);
  return (s, r, i) => r === "__v_isReactive" ? !e : r === "__v_isReadonly" ? e : r === "__v_raw" ? s : Reflect.get(
    We(n, r) && r in s ? n : s,
    r,
    i
  );
}
const yh = {
  get: /* @__PURE__ */ Sa(!1, !1)
}, vh = {
  get: /* @__PURE__ */ Sa(!1, !0)
}, bh = {
  get: /* @__PURE__ */ Sa(!0, !1)
};
const tu = /* @__PURE__ */ new WeakMap(), nu = /* @__PURE__ */ new WeakMap(), su = /* @__PURE__ */ new WeakMap(), wh = /* @__PURE__ */ new WeakMap();
function kh(e) {
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
function Th(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : kh(Yf(e));
}
function Ji(e) {
  return us(e) ? e : xa(
    e,
    !1,
    dh,
    yh,
    tu
  );
}
function Ah(e) {
  return xa(
    e,
    !1,
    mh,
    vh,
    nu
  );
}
function ru(e) {
  return xa(
    e,
    !0,
    ph,
    bh,
    su
  );
}
function xa(e, t, n, s, r) {
  if (!at(e) || e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const i = Th(e);
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
function sr(e) {
  return us(e) ? sr(e.__v_raw) : !!(e && e.__v_isReactive);
}
function us(e) {
  return !!(e && e.__v_isReadonly);
}
function dn(e) {
  return !!(e && e.__v_isShallow);
}
function Ea(e) {
  return e ? !!e.__v_raw : !1;
}
function je(e) {
  const t = e && e.__v_raw;
  return t ? je(t) : e;
}
function Sh(e) {
  return !We(e, "__v_skip") && Object.isExtensible(e) && Go(e, "__v_skip", !0), e;
}
const At = (e) => at(e) ? Ji(e) : e, Li = (e) => at(e) ? ru(e) : e;
function It(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function oe(e) {
  return xh(e, !1);
}
function xh(e, t) {
  return It(e) ? e : new Eh(e, t);
}
class Eh {
  constructor(t, n) {
    this.dep = new Aa(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? t : je(t), this._value = n ? t : At(t), this.__v_isShallow = n;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const n = this._rawValue, s = this.__v_isShallow || dn(t) || us(t);
    t = s ? t : je(t), os(t, n) && (this._rawValue = t, this._value = s ? t : At(t), this.dep.trigger());
  }
}
function x(e) {
  return It(e) ? e.value : e;
}
const Ch = {
  get: (e, t, n) => t === "__v_raw" ? e : x(Reflect.get(e, t, n)),
  set: (e, t, n, s) => {
    const r = e[t];
    return It(r) && !It(n) ? (r.value = n, !0) : Reflect.set(e, t, n, s);
  }
};
function iu(e) {
  return sr(e) ? e : new Proxy(e, Ch);
}
class Rh {
  constructor(t, n, s) {
    this.fn = t, this.setter = n, this._value = void 0, this.dep = new Aa(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Gr - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = s;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    tt !== this)
      return Vc(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return Yc(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
function Ih(e, t, n = !1) {
  let s, r;
  return xe(e) ? s = e : (s = e.get, r = e.set), new Rh(s, r, n);
}
const hi = {}, Ni = /* @__PURE__ */ new WeakMap();
let xs;
function Oh(e, t = !1, n = xs) {
  if (n) {
    let s = Ni.get(n);
    s || Ni.set(n, s = []), s.push(e);
  }
}
function Lh(e, t, n = Qe) {
  const { immediate: s, deep: r, once: i, scheduler: o, augmentJob: a, call: l } = n, u = (C) => r ? C : dn(C) || r === !1 || r === 0 ? $n(C, 1) : $n(C);
  let c, b, k, I, O = !1, j = !1;
  if (It(e) ? (b = () => e.value, O = dn(e)) : sr(e) ? (b = () => u(e), O = !0) : Te(e) ? (j = !0, O = e.some((C) => sr(C) || dn(C)), b = () => e.map((C) => {
    if (It(C))
      return C.value;
    if (sr(C))
      return u(C);
    if (xe(C))
      return l ? l(C, 2) : C();
  })) : xe(e) ? t ? b = l ? () => l(e, 2) : e : b = () => {
    if (k) {
      zn();
      try {
        k();
      } finally {
        Hn();
      }
    }
    const C = xs;
    xs = c;
    try {
      return l ? l(e, 3, [I]) : e(I);
    } finally {
      xs = C;
    }
  } : b = xn, t && r) {
    const C = b, M = r === !0 ? 1 / 0 : r;
    b = () => $n(C(), M);
  }
  const ce = ih(), R = () => {
    c.stop(), ce && ce.active && va(ce.effects, c);
  };
  if (i && t) {
    const C = t;
    t = (...M) => {
      C(...M), R();
    };
  }
  let ue = j ? new Array(e.length).fill(hi) : hi;
  const me = (C) => {
    if (!(!(c.flags & 1) || !c.dirty && !C))
      if (t) {
        const M = c.run();
        if (r || O || (j ? M.some((S, q) => os(S, ue[q])) : os(M, ue))) {
          k && k();
          const S = xs;
          xs = c;
          try {
            const q = [
              M,
              // pass undefined as the old value when it's changed for the first time
              ue === hi ? void 0 : j && ue[0] === hi ? [] : ue,
              I
            ];
            ue = M, l ? l(t, 3, q) : (
              // @ts-expect-error
              t(...q)
            );
          } finally {
            xs = S;
          }
        }
      } else
        c.run();
  };
  return a && a(me), c = new Wc(b), c.scheduler = o ? () => o(me, !1) : me, I = (C) => Oh(C, !1, c), k = c.onStop = () => {
    const C = Ni.get(c);
    if (C) {
      if (l)
        l(C, 4);
      else
        for (const M of C) M();
      Ni.delete(c);
    }
  }, t ? s ? me(!0) : ue = c.run() : o ? o(me.bind(null, !0), !0) : c.run(), R.pause = c.pause.bind(c), R.resume = c.resume.bind(c), R.stop = R, R;
}
function $n(e, t = 1 / 0, n) {
  if (t <= 0 || !at(e) || e.__v_skip || (n = n || /* @__PURE__ */ new Set(), n.has(e)))
    return e;
  if (n.add(e), t--, It(e))
    $n(e.value, t, n);
  else if (Te(e))
    for (let s = 0; s < e.length; s++)
      $n(e[s], t, n);
  else if (Dc(e) || nr(e))
    e.forEach((s) => {
      $n(s, t, n);
    });
  else if (Bc(e)) {
    for (const s in e)
      $n(e[s], t, n);
    for (const s of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, s) && $n(e[s], t, n);
  }
  return e;
}
/**
* @vue/runtime-core v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function Qr(e, t, n, s) {
  try {
    return s ? e(...s) : e();
  } catch (r) {
    Qi(r, t, n);
  }
}
function Rn(e, t, n, s) {
  if (xe(e)) {
    const r = Qr(e, t, n, s);
    return r && Fc(r) && r.catch((i) => {
      Qi(i, t, n);
    }), r;
  }
  if (Te(e)) {
    const r = [];
    for (let i = 0; i < e.length; i++)
      r.push(Rn(e[i], t, n, s));
    return r;
  }
}
function Qi(e, t, n, s = !0) {
  const r = t ? t.vnode : null, { errorHandler: i, throwUnhandledErrorInProduction: o } = t && t.appContext.config || Qe;
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
      zn(), Qr(i, null, 10, [
        e,
        l,
        u
      ]), Hn();
      return;
    }
  }
  Nh(e, n, r, s, o);
}
function Nh(e, t, n, s = !0, r = !1) {
  if (r)
    throw e;
  console.error(e);
}
const $t = [];
let An = -1;
const rr = [];
let ns = null, Js = 0;
const ou = /* @__PURE__ */ Promise.resolve();
let Pi = null;
function is(e) {
  const t = Pi || ou;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function Ph(e) {
  let t = An + 1, n = $t.length;
  for (; t < n; ) {
    const s = t + n >>> 1, r = $t[s], i = Xr(r);
    i < e || i === e && r.flags & 2 ? t = s + 1 : n = s;
  }
  return t;
}
function Ca(e) {
  if (!(e.flags & 1)) {
    const t = Xr(e), n = $t[$t.length - 1];
    !n || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= Xr(n) ? $t.push(e) : $t.splice(Ph(t), 0, e), e.flags |= 1, au();
  }
}
function au() {
  Pi || (Pi = ou.then(cu));
}
function Mh(e) {
  Te(e) ? rr.push(...e) : ns && e.id === -1 ? ns.splice(Js + 1, 0, e) : e.flags & 1 || (rr.push(e), e.flags |= 1), au();
}
function Al(e, t, n = An + 1) {
  for (; n < $t.length; n++) {
    const s = $t[n];
    if (s && s.flags & 2) {
      if (e && s.id !== e.uid)
        continue;
      $t.splice(n, 1), n--, s.flags & 4 && (s.flags &= -2), s(), s.flags & 4 || (s.flags &= -2);
    }
  }
}
function lu(e) {
  if (rr.length) {
    const t = [...new Set(rr)].sort(
      (n, s) => Xr(n) - Xr(s)
    );
    if (rr.length = 0, ns) {
      ns.push(...t);
      return;
    }
    for (ns = t, Js = 0; Js < ns.length; Js++) {
      const n = ns[Js];
      n.flags & 4 && (n.flags &= -2), n.flags & 8 || n(), n.flags &= -2;
    }
    ns = null, Js = 0;
  }
}
const Xr = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function cu(e) {
  try {
    for (An = 0; An < $t.length; An++) {
      const t = $t[An];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), Qr(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; An < $t.length; An++) {
      const t = $t[An];
      t && (t.flags &= -2);
    }
    An = -1, $t.length = 0, lu(), Pi = null, ($t.length || rr.length) && cu();
  }
}
let hn = null, uu = null;
function Mi(e) {
  const t = hn;
  return hn = e, uu = e && e.type.__scopeId || null, t;
}
function Dh(e, t = hn, n) {
  if (!t || e._n)
    return e;
  const s = (...r) => {
    s._d && Nl(-1);
    const i = Mi(t);
    let o;
    try {
      o = e(...r);
    } finally {
      Mi(i), s._d && Nl(1);
    }
    return o;
  };
  return s._n = !0, s._c = !0, s._d = !0, s;
}
function Qn(e, t) {
  if (hn === null)
    return e;
  const n = io(hn), s = e.dirs || (e.dirs = []);
  for (let r = 0; r < t.length; r++) {
    let [i, o, a, l = Qe] = t[r];
    i && (xe(i) && (i = {
      mounted: i,
      updated: i
    }), i.deep && $n(o), s.push({
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
function ks(e, t, n, s) {
  const r = e.dirs, i = t && t.dirs;
  for (let o = 0; o < r.length; o++) {
    const a = r[o];
    i && (a.oldValue = i[o].value);
    let l = a.dir[s];
    l && (zn(), Rn(l, n, 8, [
      e.el,
      a,
      e,
      t
    ]), Hn());
  }
}
const Fh = Symbol("_vte"), $h = (e) => e.__isTeleport;
function Ra(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, Ra(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function Ps(e, t) {
  return xe(e) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    Ot({ name: e.name }, t, { setup: e })
  ) : e;
}
function fu(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
function Hr(e, t, n, s, r = !1) {
  if (Te(e)) {
    e.forEach(
      (O, j) => Hr(
        O,
        t && (Te(t) ? t[j] : t),
        n,
        s,
        r
      )
    );
    return;
  }
  if (jr(s) && !r) {
    s.shapeFlag & 512 && s.type.__asyncResolved && s.component.subTree.component && Hr(e, t, n, s.component.subTree);
    return;
  }
  const i = s.shapeFlag & 4 ? io(s.component) : s.el, o = r ? null : i, { i: a, r: l } = e, u = t && t.r, c = a.refs === Qe ? a.refs = {} : a.refs, b = a.setupState, k = je(b), I = b === Qe ? () => !1 : (O) => We(k, O);
  if (u != null && u !== l && (pt(u) ? (c[u] = null, I(u) && (b[u] = null)) : It(u) && (u.value = null)), xe(l))
    Qr(l, a, 12, [o, c]);
  else {
    const O = pt(l), j = It(l);
    if (O || j) {
      const ce = () => {
        if (e.f) {
          const R = O ? I(l) ? b[l] : c[l] : l.value;
          r ? Te(R) && va(R, i) : Te(R) ? R.includes(i) || R.push(i) : O ? (c[l] = [i], I(l) && (b[l] = c[l])) : (l.value = [i], e.k && (c[e.k] = l.value));
        } else O ? (c[l] = o, I(l) && (b[l] = o)) : j && (l.value = o, e.k && (c[e.k] = o));
      };
      o ? (ce.id = -1, en(ce, n)) : ce();
    }
  }
}
Xi().requestIdleCallback;
Xi().cancelIdleCallback;
const jr = (e) => !!e.type.__asyncLoader, hu = (e) => e.type.__isKeepAlive;
function Bh(e, t) {
  du(e, "a", t);
}
function Uh(e, t) {
  du(e, "da", t);
}
function du(e, t, n = Bt) {
  const s = e.__wdc || (e.__wdc = () => {
    let r = n;
    for (; r; ) {
      if (r.isDeactivated)
        return;
      r = r.parent;
    }
    return e();
  });
  if (eo(t, s, n), n) {
    let r = n.parent;
    for (; r && r.parent; )
      hu(r.parent.vnode) && zh(s, t, n, r), r = r.parent;
  }
}
function zh(e, t, n, s) {
  const r = eo(
    t,
    e,
    s,
    !0
    /* prepend */
  );
  ei(() => {
    va(s[t], r);
  }, n);
}
function eo(e, t, n = Bt, s = !1) {
  if (n) {
    const r = n[e] || (n[e] = []), i = t.__weh || (t.__weh = (...o) => {
      zn();
      const a = ti(n), l = Rn(t, n, e, o);
      return a(), Hn(), l;
    });
    return s ? r.unshift(i) : r.push(i), i;
  }
}
const jn = (e) => (t, n = Bt) => {
  (!Jr || e === "sp") && eo(e, (...s) => t(...s), n);
}, Hh = jn("bm"), to = jn("m"), jh = jn(
  "bu"
), Wh = jn("u"), no = jn(
  "bum"
), ei = jn("um"), qh = jn(
  "sp"
), Vh = jn("rtg"), Kh = jn("rtc");
function Gh(e, t = Bt) {
  eo("ec", e, t);
}
const Yh = Symbol.for("v-ndc");
function ft(e, t, n, s) {
  let r;
  const i = n, o = Te(e);
  if (o || pt(e)) {
    const a = o && sr(e);
    let l = !1, u = !1;
    a && (l = !dn(e), u = us(e), e = Zi(e)), r = new Array(e.length);
    for (let c = 0, b = e.length; c < b; c++)
      r[c] = t(
        l ? u ? Li(At(e[c])) : At(e[c]) : e[c],
        c,
        void 0,
        i
      );
  } else if (typeof e == "number") {
    r = new Array(e);
    for (let a = 0; a < e; a++)
      r[a] = t(a + 1, a, void 0, i);
  } else if (at(e))
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
const ea = (e) => e ? Pu(e) ? io(e) : ea(e.parent) : null, Wr = (
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
    $parent: (e) => ea(e.parent),
    $root: (e) => ea(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => mu(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      Ca(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = is.bind(e.proxy)),
    $watch: (e) => _d.bind(e)
  })
), Ro = (e, t) => e !== Qe && !e.__isScriptSetup && We(e, t), Xh = {
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
        if (Ro(s, t))
          return o[t] = 1, s[t];
        if (r !== Qe && We(r, t))
          return o[t] = 2, r[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (u = e.propsOptions[0]) && We(u, t)
        )
          return o[t] = 3, i[t];
        if (n !== Qe && We(n, t))
          return o[t] = 4, n[t];
        ta && (o[t] = 0);
      }
    }
    const c = Wr[t];
    let b, k;
    if (c)
      return t === "$attrs" && Rt(e.attrs, "get", ""), c(e);
    if (
      // css module (injected by vue-loader)
      (b = a.__cssModules) && (b = b[t])
    )
      return b;
    if (n !== Qe && We(n, t))
      return o[t] = 4, n[t];
    if (
      // global properties
      k = l.config.globalProperties, We(k, t)
    )
      return k[t];
  },
  set({ _: e }, t, n) {
    const { data: s, setupState: r, ctx: i } = e;
    return Ro(r, t) ? (r[t] = n, !0) : s !== Qe && We(s, t) ? (s[t] = n, !0) : We(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (i[t] = n, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: n, ctx: s, appContext: r, propsOptions: i }
  }, o) {
    let a;
    return !!n[o] || e !== Qe && We(e, o) || Ro(t, o) || (a = i[0]) && We(a, o) || We(s, o) || We(Wr, o) || We(r.config.globalProperties, o);
  },
  defineProperty(e, t, n) {
    return n.get != null ? e._.accessCache[t] = 0 : We(n, "value") && this.set(e, t, n.value, null), Reflect.defineProperty(e, t, n);
  }
};
function Sl(e) {
  return Te(e) ? e.reduce(
    (t, n) => (t[n] = null, t),
    {}
  ) : e;
}
let ta = !0;
function Zh(e) {
  const t = mu(e), n = e.proxy, s = e.ctx;
  ta = !1, t.beforeCreate && xl(t.beforeCreate, e, "bc");
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
    mounted: k,
    beforeUpdate: I,
    updated: O,
    activated: j,
    deactivated: ce,
    beforeDestroy: R,
    beforeUnmount: ue,
    destroyed: me,
    unmounted: C,
    render: M,
    renderTracked: S,
    renderTriggered: q,
    errorCaptured: se,
    serverPrefetch: de,
    // public API
    expose: pe,
    inheritAttrs: Le,
    // assets
    components: Ae,
    directives: Ve,
    filters: $e
  } = t;
  if (u && Jh(u, s, null), o)
    for (const we in o) {
      const ge = o[we];
      xe(ge) && (s[we] = ge.bind(n));
    }
  if (r) {
    const we = r.call(n, n);
    at(we) && (e.data = Ji(we));
  }
  if (ta = !0, i)
    for (const we in i) {
      const ge = i[we], Ye = xe(ge) ? ge.bind(n, n) : xe(ge.get) ? ge.get.bind(n, n) : xn, Xe = !xe(ge) && xe(ge.set) ? ge.set.bind(n) : xn, rt = le({
        get: Ye,
        set: Xe
      });
      Object.defineProperty(s, we, {
        enumerable: !0,
        configurable: !0,
        get: () => rt.value,
        set: (ze) => rt.value = ze
      });
    }
  if (a)
    for (const we in a)
      pu(a[we], s, n, we);
  if (l) {
    const we = xe(l) ? l.call(n) : l;
    Reflect.ownKeys(we).forEach((ge) => {
      rd(ge, we[ge]);
    });
  }
  c && xl(c, e, "c");
  function fe(we, ge) {
    Te(ge) ? ge.forEach((Ye) => we(Ye.bind(n))) : ge && we(ge.bind(n));
  }
  if (fe(Hh, b), fe(to, k), fe(jh, I), fe(Wh, O), fe(Bh, j), fe(Uh, ce), fe(Gh, se), fe(Kh, S), fe(Vh, q), fe(no, ue), fe(ei, C), fe(qh, de), Te(pe))
    if (pe.length) {
      const we = e.exposed || (e.exposed = {});
      pe.forEach((ge) => {
        Object.defineProperty(we, ge, {
          get: () => n[ge],
          set: (Ye) => n[ge] = Ye,
          enumerable: !0
        });
      });
    } else e.exposed || (e.exposed = {});
  M && e.render === xn && (e.render = M), Le != null && (e.inheritAttrs = Le), Ae && (e.components = Ae), Ve && (e.directives = Ve), de && fu(e);
}
function Jh(e, t, n = xn) {
  Te(e) && (e = na(e));
  for (const s in e) {
    const r = e[s];
    let i;
    at(r) ? "default" in r ? i = yi(
      r.from || s,
      r.default,
      !0
    ) : i = yi(r.from || s) : i = yi(r), It(i) ? Object.defineProperty(t, s, {
      enumerable: !0,
      configurable: !0,
      get: () => i.value,
      set: (o) => i.value = o
    }) : t[s] = i;
  }
}
function xl(e, t, n) {
  Rn(
    Te(e) ? e.map((s) => s.bind(t.proxy)) : e.bind(t.proxy),
    t,
    n
  );
}
function pu(e, t, n, s) {
  let r = s.includes(".") ? Cu(n, s) : () => n[s];
  if (pt(e)) {
    const i = t[e];
    xe(i) && bt(r, i);
  } else if (xe(e))
    bt(r, e.bind(n));
  else if (at(e))
    if (Te(e))
      e.forEach((i) => pu(i, t, n, s));
    else {
      const i = xe(e.handler) ? e.handler.bind(n) : t[e.handler];
      xe(i) && bt(r, i, e);
    }
}
function mu(e) {
  const t = e.type, { mixins: n, extends: s } = t, {
    mixins: r,
    optionsCache: i,
    config: { optionMergeStrategies: o }
  } = e.appContext, a = i.get(t);
  let l;
  return a ? l = a : !r.length && !n && !s ? l = t : (l = {}, r.length && r.forEach(
    (u) => Di(l, u, o, !0)
  ), Di(l, t, o)), at(t) && i.set(t, l), l;
}
function Di(e, t, n, s = !1) {
  const { mixins: r, extends: i } = t;
  i && Di(e, i, n, !0), r && r.forEach(
    (o) => Di(e, o, n, !0)
  );
  for (const o in t)
    if (!(s && o === "expose")) {
      const a = Qh[o] || n && n[o];
      e[o] = a ? a(e[o], t[o]) : t[o];
    }
  return e;
}
const Qh = {
  data: El,
  props: Cl,
  emits: Cl,
  // objects
  methods: Mr,
  computed: Mr,
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
  components: Mr,
  directives: Mr,
  // watch
  watch: td,
  // provide / inject
  provide: El,
  inject: ed
};
function El(e, t) {
  return t ? e ? function() {
    return Ot(
      xe(e) ? e.call(this, this) : e,
      xe(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function ed(e, t) {
  return Mr(na(e), na(t));
}
function na(e) {
  if (Te(e)) {
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
function Mr(e, t) {
  return e ? Ot(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function Cl(e, t) {
  return e ? Te(e) && Te(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : Ot(
    /* @__PURE__ */ Object.create(null),
    Sl(e),
    Sl(t ?? {})
  ) : t;
}
function td(e, t) {
  if (!e) return t;
  if (!t) return e;
  const n = Ot(/* @__PURE__ */ Object.create(null), e);
  for (const s in t)
    n[s] = Ft(e[s], t[s]);
  return n;
}
function gu() {
  return {
    app: null,
    config: {
      isNativeTag: Kf,
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
let nd = 0;
function sd(e, t) {
  return function(s, r = null) {
    xe(s) || (s = Ot({}, s)), r != null && !at(r) && (r = null);
    const i = gu(), o = /* @__PURE__ */ new WeakSet(), a = [];
    let l = !1;
    const u = i.app = {
      _uid: nd++,
      _component: s,
      _props: r,
      _container: null,
      _context: i,
      _instance: null,
      version: $d,
      get config() {
        return i.config;
      },
      set config(c) {
      },
      use(c, ...b) {
        return o.has(c) || (c && xe(c.install) ? (o.add(c), c.install(u, ...b)) : xe(c) && (o.add(c), c(u, ...b))), u;
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
      mount(c, b, k) {
        if (!l) {
          const I = u._ceVNode || En(s, r);
          return I.appContext = i, k === !0 ? k = "svg" : k === !1 && (k = void 0), e(I, c, k), l = !0, u._container = c, c.__vue_app__ = u, io(I.component);
        }
      },
      onUnmount(c) {
        a.push(c);
      },
      unmount() {
        l && (Rn(
          a,
          u._instance,
          16
        ), e(null, u._container), delete u._container.__vue_app__);
      },
      provide(c, b) {
        return i.provides[c] = b, u;
      },
      runWithContext(c) {
        const b = ir;
        ir = u;
        try {
          return c();
        } finally {
          ir = b;
        }
      }
    };
    return u;
  };
}
let ir = null;
function rd(e, t) {
  if (Bt) {
    let n = Bt.provides;
    const s = Bt.parent && Bt.parent.provides;
    s === n && (n = Bt.provides = Object.create(s)), n[e] = t;
  }
}
function yi(e, t, n = !1) {
  const s = Ld();
  if (s || ir) {
    let r = ir ? ir._context.provides : s ? s.parent == null || s.ce ? s.vnode.appContext && s.vnode.appContext.provides : s.parent.provides : void 0;
    if (r && e in r)
      return r[e];
    if (arguments.length > 1)
      return n && xe(t) ? t.call(s && s.proxy) : t;
  }
}
const _u = {}, yu = () => Object.create(_u), vu = (e) => Object.getPrototypeOf(e) === _u;
function id(e, t, n, s = !1) {
  const r = {}, i = yu();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), bu(e, t, r, i);
  for (const o in e.propsOptions[0])
    o in r || (r[o] = void 0);
  n ? e.props = s ? r : Ah(r) : e.type.props ? e.props = r : e.props = i, e.attrs = i;
}
function od(e, t, n, s) {
  const {
    props: r,
    attrs: i,
    vnode: { patchFlag: o }
  } = e, a = je(r), [l] = e.propsOptions;
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
        let k = c[b];
        if (so(e.emitsOptions, k))
          continue;
        const I = t[k];
        if (l)
          if (We(i, k))
            I !== i[k] && (i[k] = I, u = !0);
          else {
            const O = cs(k);
            r[O] = sa(
              l,
              a,
              O,
              I,
              e,
              !1
            );
          }
        else
          I !== i[k] && (i[k] = I, u = !0);
      }
    }
  } else {
    bu(e, t, r, i) && (u = !0);
    let c;
    for (const b in a)
      (!t || // for camelCase
      !We(t, b) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((c = ds(b)) === b || !We(t, c))) && (l ? n && // for camelCase
      (n[b] !== void 0 || // for kebab-case
      n[c] !== void 0) && (r[b] = sa(
        l,
        a,
        b,
        void 0,
        e,
        !0
      )) : delete r[b]);
    if (i !== a)
      for (const b in i)
        (!t || !We(t, b)) && (delete i[b], u = !0);
  }
  u && Fn(e.attrs, "set", "");
}
function bu(e, t, n, s) {
  const [r, i] = e.propsOptions;
  let o = !1, a;
  if (t)
    for (let l in t) {
      if (Br(l))
        continue;
      const u = t[l];
      let c;
      r && We(r, c = cs(l)) ? !i || !i.includes(c) ? n[c] = u : (a || (a = {}))[c] = u : so(e.emitsOptions, l) || (!(l in s) || u !== s[l]) && (s[l] = u, o = !0);
    }
  if (i) {
    const l = je(n), u = a || Qe;
    for (let c = 0; c < i.length; c++) {
      const b = i[c];
      n[b] = sa(
        r,
        l,
        b,
        u[b],
        e,
        !We(u, b)
      );
    }
  }
  return o;
}
function sa(e, t, n, s, r, i) {
  const o = e[n];
  if (o != null) {
    const a = We(o, "default");
    if (a && s === void 0) {
      const l = o.default;
      if (o.type !== Function && !o.skipFactory && xe(l)) {
        const { propsDefaults: u } = r;
        if (n in u)
          s = u[n];
        else {
          const c = ti(r);
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
const ad = /* @__PURE__ */ new WeakMap();
function wu(e, t, n = !1) {
  const s = n ? ad : t.propsCache, r = s.get(e);
  if (r)
    return r;
  const i = e.props, o = {}, a = [];
  let l = !1;
  if (!xe(e)) {
    const c = (b) => {
      l = !0;
      const [k, I] = wu(b, t, !0);
      Ot(o, k), I && a.push(...I);
    };
    !n && t.mixins.length && t.mixins.forEach(c), e.extends && c(e.extends), e.mixins && e.mixins.forEach(c);
  }
  if (!i && !l)
    return at(e) && s.set(e, tr), tr;
  if (Te(i))
    for (let c = 0; c < i.length; c++) {
      const b = cs(i[c]);
      Rl(b) && (o[b] = Qe);
    }
  else if (i)
    for (const c in i) {
      const b = cs(c);
      if (Rl(b)) {
        const k = i[c], I = o[b] = Te(k) || xe(k) ? { type: k } : Ot({}, k), O = I.type;
        let j = !1, ce = !0;
        if (Te(O))
          for (let R = 0; R < O.length; ++R) {
            const ue = O[R], me = xe(ue) && ue.name;
            if (me === "Boolean") {
              j = !0;
              break;
            } else me === "String" && (ce = !1);
          }
        else
          j = xe(O) && O.name === "Boolean";
        I[
          0
          /* shouldCast */
        ] = j, I[
          1
          /* shouldCastTrue */
        ] = ce, (j || We(I, "default")) && a.push(b);
      }
    }
  const u = [o, a];
  return at(e) && s.set(e, u), u;
}
function Rl(e) {
  return e[0] !== "$" && !Br(e);
}
const Ia = (e) => e === "_" || e === "__" || e === "_ctx" || e === "$stable", Oa = (e) => Te(e) ? e.map(Sn) : [Sn(e)], ld = (e, t, n) => {
  if (t._n)
    return t;
  const s = Dh((...r) => Oa(t(...r)), n);
  return s._c = !1, s;
}, ku = (e, t, n) => {
  const s = e._ctx;
  for (const r in e) {
    if (Ia(r)) continue;
    const i = e[r];
    if (xe(i))
      t[r] = ld(r, i, s);
    else if (i != null) {
      const o = Oa(i);
      t[r] = () => o;
    }
  }
}, Tu = (e, t) => {
  const n = Oa(t);
  e.slots.default = () => n;
}, Au = (e, t, n) => {
  for (const s in t)
    (n || !Ia(s)) && (e[s] = t[s]);
}, cd = (e, t, n) => {
  const s = e.slots = yu();
  if (e.vnode.shapeFlag & 32) {
    const r = t.__;
    r && Go(s, "__", r, !0);
    const i = t._;
    i ? (Au(s, t, n), n && Go(s, "_", i, !0)) : ku(t, s);
  } else t && Tu(e, t);
}, ud = (e, t, n) => {
  const { vnode: s, slots: r } = e;
  let i = !0, o = Qe;
  if (s.shapeFlag & 32) {
    const a = t._;
    a ? n && a === 1 ? i = !1 : Au(r, t, n) : (i = !t.$stable, ku(t, r)), o = t;
  } else t && (Tu(e, t), o = { default: 1 });
  if (i)
    for (const a in r)
      !Ia(a) && o[a] == null && delete r[a];
}, en = Ad;
function fd(e) {
  return hd(e);
}
function hd(e, t) {
  const n = Xi();
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
    nextSibling: k,
    setScopeId: I = xn,
    insertStaticContent: O
  } = e, j = (g, v, L, D = null, B = null, P = null, X = void 0, K = null, G = !!v.dynamicChildren) => {
    if (g === v)
      return;
    g && !xr(g, v) && (D = zt(g), ze(g, B, P, !0), g = null), v.patchFlag === -2 && (G = !1, v.dynamicChildren = null);
    const { type: F, ref: re, shapeFlag: Y } = v;
    switch (F) {
      case ro:
        ce(g, v, L, D);
        break;
      case fs:
        R(g, v, L, D);
        break;
      case vi:
        g == null && ue(v, L, D, X);
        break;
      case Oe:
        Ae(
          g,
          v,
          L,
          D,
          B,
          P,
          X,
          K,
          G
        );
        break;
      default:
        Y & 1 ? M(
          g,
          v,
          L,
          D,
          B,
          P,
          X,
          K,
          G
        ) : Y & 6 ? Ve(
          g,
          v,
          L,
          D,
          B,
          P,
          X,
          K,
          G
        ) : (Y & 64 || Y & 128) && F.process(
          g,
          v,
          L,
          D,
          B,
          P,
          X,
          K,
          G,
          Nt
        );
    }
    re != null && B ? Hr(re, g && g.ref, P, v || g, !v) : re == null && g && g.ref != null && Hr(g.ref, null, P, g, !0);
  }, ce = (g, v, L, D) => {
    if (g == null)
      s(
        v.el = a(v.children),
        L,
        D
      );
    else {
      const B = v.el = g.el;
      v.children !== g.children && u(B, v.children);
    }
  }, R = (g, v, L, D) => {
    g == null ? s(
      v.el = l(v.children || ""),
      L,
      D
    ) : v.el = g.el;
  }, ue = (g, v, L, D) => {
    [g.el, g.anchor] = O(
      g.children,
      v,
      L,
      D,
      g.el,
      g.anchor
    );
  }, me = ({ el: g, anchor: v }, L, D) => {
    let B;
    for (; g && g !== v; )
      B = k(g), s(g, L, D), g = B;
    s(v, L, D);
  }, C = ({ el: g, anchor: v }) => {
    let L;
    for (; g && g !== v; )
      L = k(g), r(g), g = L;
    r(v);
  }, M = (g, v, L, D, B, P, X, K, G) => {
    v.type === "svg" ? X = "svg" : v.type === "math" && (X = "mathml"), g == null ? S(
      v,
      L,
      D,
      B,
      P,
      X,
      K,
      G
    ) : de(
      g,
      v,
      B,
      P,
      X,
      K,
      G
    );
  }, S = (g, v, L, D, B, P, X, K) => {
    let G, F;
    const { props: re, shapeFlag: Y, transition: ne, dirs: he } = g;
    if (G = g.el = o(
      g.type,
      P,
      re && re.is,
      re
    ), Y & 8 ? c(G, g.children) : Y & 16 && se(
      g.children,
      G,
      null,
      D,
      B,
      Io(g, P),
      X,
      K
    ), he && ks(g, null, D, "created"), q(G, g, g.scopeId, X, D), re) {
      for (const be in re)
        be !== "value" && !Br(be) && i(G, be, null, re[be], P, D);
      "value" in re && i(G, "value", null, re.value, P), (F = re.onVnodeBeforeMount) && kn(F, D, g);
    }
    he && ks(g, null, D, "beforeMount");
    const _e = dd(B, ne);
    _e && ne.beforeEnter(G), s(G, v, L), ((F = re && re.onVnodeMounted) || _e || he) && en(() => {
      F && kn(F, D, g), _e && ne.enter(G), he && ks(g, null, D, "mounted");
    }, B);
  }, q = (g, v, L, D, B) => {
    if (L && I(g, L), D)
      for (let P = 0; P < D.length; P++)
        I(g, D[P]);
    if (B) {
      let P = B.subTree;
      if (v === P || Iu(P.type) && (P.ssContent === v || P.ssFallback === v)) {
        const X = B.vnode;
        q(
          g,
          X,
          X.scopeId,
          X.slotScopeIds,
          B.parent
        );
      }
    }
  }, se = (g, v, L, D, B, P, X, K, G = 0) => {
    for (let F = G; F < g.length; F++) {
      const re = g[F] = K ? rs(g[F]) : Sn(g[F]);
      j(
        null,
        re,
        v,
        L,
        D,
        B,
        P,
        X,
        K
      );
    }
  }, de = (g, v, L, D, B, P, X) => {
    const K = v.el = g.el;
    let { patchFlag: G, dynamicChildren: F, dirs: re } = v;
    G |= g.patchFlag & 16;
    const Y = g.props || Qe, ne = v.props || Qe;
    let he;
    if (L && Ts(L, !1), (he = ne.onVnodeBeforeUpdate) && kn(he, L, v, g), re && ks(v, g, L, "beforeUpdate"), L && Ts(L, !0), (Y.innerHTML && ne.innerHTML == null || Y.textContent && ne.textContent == null) && c(K, ""), F ? pe(
      g.dynamicChildren,
      F,
      K,
      L,
      D,
      Io(v, B),
      P
    ) : X || ge(
      g,
      v,
      K,
      null,
      L,
      D,
      Io(v, B),
      P,
      !1
    ), G > 0) {
      if (G & 16)
        Le(K, Y, ne, L, B);
      else if (G & 2 && Y.class !== ne.class && i(K, "class", null, ne.class, B), G & 4 && i(K, "style", Y.style, ne.style, B), G & 8) {
        const _e = v.dynamicProps;
        for (let be = 0; be < _e.length; be++) {
          const ke = _e[be], Be = Y[ke], U = ne[ke];
          (U !== Be || ke === "value") && i(K, ke, Be, U, B, L);
        }
      }
      G & 1 && g.children !== v.children && c(K, v.children);
    } else !X && F == null && Le(K, Y, ne, L, B);
    ((he = ne.onVnodeUpdated) || re) && en(() => {
      he && kn(he, L, v, g), re && ks(v, g, L, "updated");
    }, D);
  }, pe = (g, v, L, D, B, P, X) => {
    for (let K = 0; K < v.length; K++) {
      const G = g[K], F = v[K], re = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        G.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (G.type === Oe || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !xr(G, F) || // - In the case of a component, it could contain anything.
        G.shapeFlag & 198) ? b(G.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          L
        )
      );
      j(
        G,
        F,
        re,
        null,
        D,
        B,
        P,
        X,
        !0
      );
    }
  }, Le = (g, v, L, D, B) => {
    if (v !== L) {
      if (v !== Qe)
        for (const P in v)
          !Br(P) && !(P in L) && i(
            g,
            P,
            v[P],
            null,
            B,
            D
          );
      for (const P in L) {
        if (Br(P)) continue;
        const X = L[P], K = v[P];
        X !== K && P !== "value" && i(g, P, K, X, B, D);
      }
      "value" in L && i(g, "value", v.value, L.value, B);
    }
  }, Ae = (g, v, L, D, B, P, X, K, G) => {
    const F = v.el = g ? g.el : a(""), re = v.anchor = g ? g.anchor : a("");
    let { patchFlag: Y, dynamicChildren: ne, slotScopeIds: he } = v;
    he && (K = K ? K.concat(he) : he), g == null ? (s(F, L, D), s(re, L, D), se(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      v.children || [],
      L,
      re,
      B,
      P,
      X,
      K,
      G
    )) : Y > 0 && Y & 64 && ne && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    g.dynamicChildren ? (pe(
      g.dynamicChildren,
      ne,
      L,
      B,
      P,
      X,
      K
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (v.key != null || B && v === B.subTree) && Su(
      g,
      v,
      !0
      /* shallow */
    )) : ge(
      g,
      v,
      L,
      re,
      B,
      P,
      X,
      K,
      G
    );
  }, Ve = (g, v, L, D, B, P, X, K, G) => {
    v.slotScopeIds = K, g == null ? v.shapeFlag & 512 ? B.ctx.activate(
      v,
      L,
      D,
      X,
      G
    ) : $e(
      v,
      L,
      D,
      B,
      P,
      X,
      G
    ) : et(g, v, G);
  }, $e = (g, v, L, D, B, P, X) => {
    const K = g.component = Od(
      g,
      D,
      B
    );
    if (hu(g) && (K.ctx.renderer = Nt), Nd(K, !1, X), K.asyncDep) {
      if (B && B.registerDep(K, fe, X), !g.el) {
        const G = K.subTree = En(fs);
        R(null, G, v, L), g.placeholder = G.el;
      }
    } else
      fe(
        K,
        g,
        v,
        L,
        B,
        P,
        X
      );
  }, et = (g, v, L) => {
    const D = v.component = g.component;
    if (kd(g, v, L))
      if (D.asyncDep && !D.asyncResolved) {
        we(D, v, L);
        return;
      } else
        D.next = v, D.update();
    else
      v.el = g.el, D.vnode = v;
  }, fe = (g, v, L, D, B, P, X) => {
    const K = () => {
      if (g.isMounted) {
        let { next: Y, bu: ne, u: he, parent: _e, vnode: be } = g;
        {
          const f = xu(g);
          if (f) {
            Y && (Y.el = be.el, we(g, Y, X)), f.asyncDep.then(() => {
              g.isUnmounted || K();
            });
            return;
          }
        }
        let ke = Y, Be;
        Ts(g, !1), Y ? (Y.el = be.el, we(g, Y, X)) : Y = be, ne && _i(ne), (Be = Y.props && Y.props.onVnodeBeforeUpdate) && kn(Be, _e, Y, be), Ts(g, !0);
        const U = Ol(g), z = g.subTree;
        g.subTree = U, j(
          z,
          U,
          // parent may have changed if it's in a teleport
          b(z.el),
          // anchor may have changed if it's in a fragment
          zt(z),
          g,
          B,
          P
        ), Y.el = U.el, ke === null && Td(g, U.el), he && en(he, B), (Be = Y.props && Y.props.onVnodeUpdated) && en(
          () => kn(Be, _e, Y, be),
          B
        );
      } else {
        let Y;
        const { el: ne, props: he } = v, { bm: _e, m: be, parent: ke, root: Be, type: U } = g, z = jr(v);
        Ts(g, !1), _e && _i(_e), !z && (Y = he && he.onVnodeBeforeMount) && kn(Y, ke, v), Ts(g, !0);
        {
          Be.ce && // @ts-expect-error _def is private
          Be.ce._def.shadowRoot !== !1 && Be.ce._injectChildStyle(U);
          const f = g.subTree = Ol(g);
          j(
            null,
            f,
            L,
            D,
            g,
            B,
            P
          ), v.el = f.el;
        }
        if (be && en(be, B), !z && (Y = he && he.onVnodeMounted)) {
          const f = v;
          en(
            () => kn(Y, ke, f),
            B
          );
        }
        (v.shapeFlag & 256 || ke && jr(ke.vnode) && ke.vnode.shapeFlag & 256) && g.a && en(g.a, B), g.isMounted = !0, v = L = D = null;
      }
    };
    g.scope.on();
    const G = g.effect = new Wc(K);
    g.scope.off();
    const F = g.update = G.run.bind(G), re = g.job = G.runIfDirty.bind(G);
    re.i = g, re.id = g.uid, G.scheduler = () => Ca(re), Ts(g, !0), F();
  }, we = (g, v, L) => {
    v.component = g;
    const D = g.vnode.props;
    g.vnode = v, g.next = null, od(g, v.props, D, L), ud(g, v.children, L), zn(), Al(g), Hn();
  }, ge = (g, v, L, D, B, P, X, K, G = !1) => {
    const F = g && g.children, re = g ? g.shapeFlag : 0, Y = v.children, { patchFlag: ne, shapeFlag: he } = v;
    if (ne > 0) {
      if (ne & 128) {
        Xe(
          F,
          Y,
          L,
          D,
          B,
          P,
          X,
          K,
          G
        );
        return;
      } else if (ne & 256) {
        Ye(
          F,
          Y,
          L,
          D,
          B,
          P,
          X,
          K,
          G
        );
        return;
      }
    }
    he & 8 ? (re & 16 && vt(F, B, P), Y !== F && c(L, Y)) : re & 16 ? he & 16 ? Xe(
      F,
      Y,
      L,
      D,
      B,
      P,
      X,
      K,
      G
    ) : vt(F, B, P, !0) : (re & 8 && c(L, ""), he & 16 && se(
      Y,
      L,
      D,
      B,
      P,
      X,
      K,
      G
    ));
  }, Ye = (g, v, L, D, B, P, X, K, G) => {
    g = g || tr, v = v || tr;
    const F = g.length, re = v.length, Y = Math.min(F, re);
    let ne;
    for (ne = 0; ne < Y; ne++) {
      const he = v[ne] = G ? rs(v[ne]) : Sn(v[ne]);
      j(
        g[ne],
        he,
        L,
        null,
        B,
        P,
        X,
        K,
        G
      );
    }
    F > re ? vt(
      g,
      B,
      P,
      !0,
      !1,
      Y
    ) : se(
      v,
      L,
      D,
      B,
      P,
      X,
      K,
      G,
      Y
    );
  }, Xe = (g, v, L, D, B, P, X, K, G) => {
    let F = 0;
    const re = v.length;
    let Y = g.length - 1, ne = re - 1;
    for (; F <= Y && F <= ne; ) {
      const he = g[F], _e = v[F] = G ? rs(v[F]) : Sn(v[F]);
      if (xr(he, _e))
        j(
          he,
          _e,
          L,
          null,
          B,
          P,
          X,
          K,
          G
        );
      else
        break;
      F++;
    }
    for (; F <= Y && F <= ne; ) {
      const he = g[Y], _e = v[ne] = G ? rs(v[ne]) : Sn(v[ne]);
      if (xr(he, _e))
        j(
          he,
          _e,
          L,
          null,
          B,
          P,
          X,
          K,
          G
        );
      else
        break;
      Y--, ne--;
    }
    if (F > Y) {
      if (F <= ne) {
        const he = ne + 1, _e = he < re ? v[he].el : D;
        for (; F <= ne; )
          j(
            null,
            v[F] = G ? rs(v[F]) : Sn(v[F]),
            L,
            _e,
            B,
            P,
            X,
            K,
            G
          ), F++;
      }
    } else if (F > ne)
      for (; F <= Y; )
        ze(g[F], B, P, !0), F++;
    else {
      const he = F, _e = F, be = /* @__PURE__ */ new Map();
      for (F = _e; F <= ne; F++) {
        const E = v[F] = G ? rs(v[F]) : Sn(v[F]);
        E.key != null && be.set(E.key, F);
      }
      let ke, Be = 0;
      const U = ne - _e + 1;
      let z = !1, f = 0;
      const y = new Array(U);
      for (F = 0; F < U; F++) y[F] = 0;
      for (F = he; F <= Y; F++) {
        const E = g[F];
        if (Be >= U) {
          ze(E, B, P, !0);
          continue;
        }
        let W;
        if (E.key != null)
          W = be.get(E.key);
        else
          for (ke = _e; ke <= ne; ke++)
            if (y[ke - _e] === 0 && xr(E, v[ke])) {
              W = ke;
              break;
            }
        W === void 0 ? ze(E, B, P, !0) : (y[W - _e] = F + 1, W >= f ? f = W : z = !0, j(
          E,
          v[W],
          L,
          null,
          B,
          P,
          X,
          K,
          G
        ), Be++);
      }
      const N = z ? pd(y) : tr;
      for (ke = N.length - 1, F = U - 1; F >= 0; F--) {
        const E = _e + F, W = v[E], Q = v[E + 1], ie = E + 1 < re ? (
          // #13559, fallback to el placeholder for unresolved async component
          Q.el || Q.placeholder
        ) : D;
        y[F] === 0 ? j(
          null,
          W,
          L,
          ie,
          B,
          P,
          X,
          K,
          G
        ) : z && (ke < 0 || F !== N[ke] ? rt(W, L, ie, 2) : ke--);
      }
    }
  }, rt = (g, v, L, D, B = null) => {
    const { el: P, type: X, transition: K, children: G, shapeFlag: F } = g;
    if (F & 6) {
      rt(g.component.subTree, v, L, D);
      return;
    }
    if (F & 128) {
      g.suspense.move(v, L, D);
      return;
    }
    if (F & 64) {
      X.move(g, v, L, Nt);
      return;
    }
    if (X === Oe) {
      s(P, v, L);
      for (let Y = 0; Y < G.length; Y++)
        rt(G[Y], v, L, D);
      s(g.anchor, v, L);
      return;
    }
    if (X === vi) {
      me(g, v, L);
      return;
    }
    if (D !== 2 && F & 1 && K)
      if (D === 0)
        K.beforeEnter(P), s(P, v, L), en(() => K.enter(P), B);
      else {
        const { leave: Y, delayLeave: ne, afterLeave: he } = K, _e = () => {
          g.ctx.isUnmounted ? r(P) : s(P, v, L);
        }, be = () => {
          Y(P, () => {
            _e(), he && he();
          });
        };
        ne ? ne(P, _e, be) : be();
      }
    else
      s(P, v, L);
  }, ze = (g, v, L, D = !1, B = !1) => {
    const {
      type: P,
      props: X,
      ref: K,
      children: G,
      dynamicChildren: F,
      shapeFlag: re,
      patchFlag: Y,
      dirs: ne,
      cacheIndex: he
    } = g;
    if (Y === -2 && (B = !1), K != null && (zn(), Hr(K, null, L, g, !0), Hn()), he != null && (v.renderCache[he] = void 0), re & 256) {
      v.ctx.deactivate(g);
      return;
    }
    const _e = re & 1 && ne, be = !jr(g);
    let ke;
    if (be && (ke = X && X.onVnodeBeforeUnmount) && kn(ke, v, g), re & 6)
      De(g.component, L, D);
    else {
      if (re & 128) {
        g.suspense.unmount(L, D);
        return;
      }
      _e && ks(g, null, v, "beforeUnmount"), re & 64 ? g.type.remove(
        g,
        v,
        L,
        Nt,
        D
      ) : F && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !F.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (P !== Oe || Y > 0 && Y & 64) ? vt(
        F,
        v,
        L,
        !1,
        !0
      ) : (P === Oe && Y & 384 || !B && re & 16) && vt(G, v, L), D && Lt(g);
    }
    (be && (ke = X && X.onVnodeUnmounted) || _e) && en(() => {
      ke && kn(ke, v, g), _e && ks(g, null, v, "unmounted");
    }, L);
  }, Lt = (g) => {
    const { type: v, el: L, anchor: D, transition: B } = g;
    if (v === Oe) {
      vn(L, D);
      return;
    }
    if (v === vi) {
      C(g);
      return;
    }
    const P = () => {
      r(L), B && !B.persisted && B.afterLeave && B.afterLeave();
    };
    if (g.shapeFlag & 1 && B && !B.persisted) {
      const { leave: X, delayLeave: K } = B, G = () => X(L, P);
      K ? K(g.el, P, G) : G();
    } else
      P();
  }, vn = (g, v) => {
    let L;
    for (; g !== v; )
      L = k(g), r(g), g = L;
    r(v);
  }, De = (g, v, L) => {
    const {
      bum: D,
      scope: B,
      job: P,
      subTree: X,
      um: K,
      m: G,
      a: F,
      parent: re,
      slots: { __: Y }
    } = g;
    Il(G), Il(F), D && _i(D), re && Te(Y) && Y.forEach((ne) => {
      re.renderCache[ne] = void 0;
    }), B.stop(), P && (P.flags |= 8, ze(X, g, v, L)), K && en(K, v), en(() => {
      g.isUnmounted = !0;
    }, v), v && v.pendingBranch && !v.isUnmounted && g.asyncDep && !g.asyncResolved && g.suspenseId === v.pendingId && (v.deps--, v.deps === 0 && v.resolve());
  }, vt = (g, v, L, D = !1, B = !1, P = 0) => {
    for (let X = P; X < g.length; X++)
      ze(g[X], v, L, D, B);
  }, zt = (g) => {
    if (g.shapeFlag & 6)
      return zt(g.component.subTree);
    if (g.shapeFlag & 128)
      return g.suspense.next();
    const v = k(g.anchor || g.el), L = v && v[Fh];
    return L ? k(L) : v;
  };
  let qt = !1;
  const Vt = (g, v, L) => {
    g == null ? v._vnode && ze(v._vnode, null, null, !0) : j(
      v._vnode || null,
      g,
      v,
      null,
      null,
      null,
      L
    ), v._vnode = g, qt || (qt = !0, Al(), lu(), qt = !1);
  }, Nt = {
    p: j,
    um: ze,
    m: rt,
    r: Lt,
    mt: $e,
    mc: se,
    pc: ge,
    pbc: pe,
    n: zt,
    o: e
  };
  return {
    render: Vt,
    hydrate: void 0,
    createApp: sd(Vt)
  };
}
function Io({ type: e, props: t }, n) {
  return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function Ts({ effect: e, job: t }, n) {
  n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function dd(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function Su(e, t, n = !1) {
  const s = e.children, r = t.children;
  if (Te(s) && Te(r))
    for (let i = 0; i < s.length; i++) {
      const o = s[i];
      let a = r[i];
      a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = r[i] = rs(r[i]), a.el = o.el), !n && a.patchFlag !== -2 && Su(o, a)), a.type === ro && (a.el = o.el), a.type === fs && !a.el && (a.el = o.el);
    }
}
function pd(e) {
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
function xu(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : xu(t);
}
function Il(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
const md = Symbol.for("v-scx"), gd = () => yi(md);
function bt(e, t, n) {
  return Eu(e, t, n);
}
function Eu(e, t, n = Qe) {
  const { immediate: s, deep: r, flush: i, once: o } = n, a = Ot({}, n), l = t && s || !t && i !== "post";
  let u;
  if (Jr) {
    if (i === "sync") {
      const I = gd();
      u = I.__watcherHandles || (I.__watcherHandles = []);
    } else if (!l) {
      const I = () => {
      };
      return I.stop = xn, I.resume = xn, I.pause = xn, I;
    }
  }
  const c = Bt;
  a.call = (I, O, j) => Rn(I, c, O, j);
  let b = !1;
  i === "post" ? a.scheduler = (I) => {
    en(I, c && c.suspense);
  } : i !== "sync" && (b = !0, a.scheduler = (I, O) => {
    O ? I() : Ca(I);
  }), a.augmentJob = (I) => {
    t && (I.flags |= 4), b && (I.flags |= 2, c && (I.id = c.uid, I.i = c));
  };
  const k = Lh(e, t, a);
  return Jr && (u ? u.push(k) : l && k()), k;
}
function _d(e, t, n) {
  const s = this.proxy, r = pt(e) ? e.includes(".") ? Cu(s, e) : () => s[e] : e.bind(s, s);
  let i;
  xe(t) ? i = t : (i = t.handler, n = t);
  const o = ti(this), a = Eu(r, i.bind(s), n);
  return o(), a;
}
function Cu(e, t) {
  const n = t.split(".");
  return () => {
    let s = e;
    for (let r = 0; r < n.length && s; r++)
      s = s[n[r]];
    return s;
  };
}
const yd = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${cs(t)}Modifiers`] || e[`${ds(t)}Modifiers`];
function vd(e, t, ...n) {
  if (e.isUnmounted) return;
  const s = e.vnode.props || Qe;
  let r = n;
  const i = t.startsWith("update:"), o = i && yd(s, t.slice(7));
  o && (o.trim && (r = n.map((c) => pt(c) ? c.trim() : c)), o.number && (r = n.map(Yo)));
  let a, l = s[a = Ao(t)] || // also try camelCase event handler (#2249)
  s[a = Ao(cs(t))];
  !l && i && (l = s[a = Ao(ds(t))]), l && Rn(
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
    e.emitted[a] = !0, Rn(
      u,
      e,
      6,
      r
    );
  }
}
function Ru(e, t, n = !1) {
  const s = t.emitsCache, r = s.get(e);
  if (r !== void 0)
    return r;
  const i = e.emits;
  let o = {}, a = !1;
  if (!xe(e)) {
    const l = (u) => {
      const c = Ru(u, t, !0);
      c && (a = !0, Ot(o, c));
    };
    !n && t.mixins.length && t.mixins.forEach(l), e.extends && l(e.extends), e.mixins && e.mixins.forEach(l);
  }
  return !i && !a ? (at(e) && s.set(e, null), null) : (Te(i) ? i.forEach((l) => o[l] = null) : Ot(o, i), at(e) && s.set(e, o), o);
}
function so(e, t) {
  return !e || !Ki(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), We(e, t[0].toLowerCase() + t.slice(1)) || We(e, ds(t)) || We(e, t));
}
function Ol(e) {
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
    data: k,
    setupState: I,
    ctx: O,
    inheritAttrs: j
  } = e, ce = Mi(e);
  let R, ue;
  try {
    if (n.shapeFlag & 4) {
      const C = r || s, M = C;
      R = Sn(
        u.call(
          M,
          C,
          c,
          b,
          I,
          k,
          O
        )
      ), ue = a;
    } else {
      const C = t;
      R = Sn(
        C.length > 1 ? C(
          b,
          { attrs: a, slots: o, emit: l }
        ) : C(
          b,
          null
        )
      ), ue = t.props ? a : bd(a);
    }
  } catch (C) {
    qr.length = 0, Qi(C, e, 1), R = En(fs);
  }
  let me = R;
  if (ue && j !== !1) {
    const C = Object.keys(ue), { shapeFlag: M } = me;
    C.length && M & 7 && (i && C.some(ya) && (ue = wd(
      ue,
      i
    )), me = cr(me, ue, !1, !0));
  }
  return n.dirs && (me = cr(me, null, !1, !0), me.dirs = me.dirs ? me.dirs.concat(n.dirs) : n.dirs), n.transition && Ra(me, n.transition), R = me, Mi(ce), R;
}
const bd = (e) => {
  let t;
  for (const n in e)
    (n === "class" || n === "style" || Ki(n)) && ((t || (t = {}))[n] = e[n]);
  return t;
}, wd = (e, t) => {
  const n = {};
  for (const s in e)
    (!ya(s) || !(s.slice(9) in t)) && (n[s] = e[s]);
  return n;
};
function kd(e, t, n) {
  const { props: s, children: r, component: i } = e, { props: o, children: a, patchFlag: l } = t, u = i.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (n && l >= 0) {
    if (l & 1024)
      return !0;
    if (l & 16)
      return s ? Ll(s, o, u) : !!o;
    if (l & 8) {
      const c = t.dynamicProps;
      for (let b = 0; b < c.length; b++) {
        const k = c[b];
        if (o[k] !== s[k] && !so(u, k))
          return !0;
      }
    }
  } else
    return (r || a) && (!a || !a.$stable) ? !0 : s === o ? !1 : s ? o ? Ll(s, o, u) : !0 : !!o;
  return !1;
}
function Ll(e, t, n) {
  const s = Object.keys(t);
  if (s.length !== Object.keys(e).length)
    return !0;
  for (let r = 0; r < s.length; r++) {
    const i = s[r];
    if (t[i] !== e[i] && !so(n, i))
      return !0;
  }
  return !1;
}
function Td({ vnode: e, parent: t }, n) {
  for (; t; ) {
    const s = t.subTree;
    if (s.suspense && s.suspense.activeBranch === e && (s.el = e.el), s === e)
      (e = t.vnode).el = n, t = t.parent;
    else
      break;
  }
}
const Iu = (e) => e.__isSuspense;
function Ad(e, t) {
  t && t.pendingBranch ? Te(e) ? t.effects.push(...e) : t.effects.push(e) : Mh(e);
}
const Oe = Symbol.for("v-fgt"), ro = Symbol.for("v-txt"), fs = Symbol.for("v-cmt"), vi = Symbol.for("v-stc"), qr = [];
let nn = null;
function w(e = !1) {
  qr.push(nn = e ? null : []);
}
function Sd() {
  qr.pop(), nn = qr[qr.length - 1] || null;
}
let Zr = 1;
function Nl(e, t = !1) {
  Zr += e, e < 0 && nn && t && (nn.hasOnce = !0);
}
function Ou(e) {
  return e.dynamicChildren = Zr > 0 ? nn || tr : null, Sd(), Zr > 0 && nn && nn.push(e), e;
}
function T(e, t, n, s, r, i) {
  return Ou(
    _(
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
  return Ou(
    En(
      e,
      t,
      n,
      s,
      r,
      !0
    )
  );
}
function Lu(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function xr(e, t) {
  return e.type === t.type && e.key === t.key;
}
const Nu = ({ key: e }) => e ?? null, bi = ({
  ref: e,
  ref_key: t,
  ref_for: n
}) => (typeof e == "number" && (e = "" + e), e != null ? pt(e) || It(e) || xe(e) ? { i: hn, r: e, k: t, f: !!n } : e : null);
function _(e, t = null, n = null, s = 0, r = null, i = e === Oe ? 0 : 1, o = !1, a = !1) {
  const l = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && Nu(t),
    ref: t && bi(t),
    scopeId: uu,
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
    ctx: hn
  };
  return a ? (La(l, n), i & 128 && e.normalize(l)) : n && (l.shapeFlag |= pt(n) ? 8 : 16), Zr > 0 && // avoid a block node from tracking itself
  !o && // has current parent block
  nn && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (l.patchFlag > 0 || i & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  l.patchFlag !== 32 && nn.push(l), l;
}
const En = xd;
function xd(e, t = null, n = null, s = 0, r = null, i = !1) {
  if ((!e || e === Yh) && (e = fs), Lu(e)) {
    const a = cr(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return n && La(a, n), Zr > 0 && !i && nn && (a.shapeFlag & 6 ? nn[nn.indexOf(e)] = a : nn.push(a)), a.patchFlag = -2, a;
  }
  if (Fd(e) && (e = e.__vccOpts), t) {
    t = Ed(t);
    let { class: a, style: l } = t;
    a && !pt(a) && (t.class = Pe(a)), at(l) && (Ea(l) && !Te(l) && (l = Ot({}, l)), t.style = Ee(l));
  }
  const o = pt(e) ? 1 : Iu(e) ? 128 : $h(e) ? 64 : at(e) ? 4 : xe(e) ? 2 : 0;
  return _(
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
function Ed(e) {
  return e ? Ea(e) || vu(e) ? Ot({}, e) : e : null;
}
function cr(e, t, n = !1, s = !1) {
  const { props: r, ref: i, patchFlag: o, children: a, transition: l } = e, u = t ? Cd(r || {}, t) : r, c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: u,
    key: u && Nu(u),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && i ? Te(i) ? i.concat(bi(t)) : [i, bi(t)] : bi(t)
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
    patchFlag: t && e.type !== Oe ? o === -1 ? 16 : o | 16 : o,
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
    ssContent: e.ssContent && cr(e.ssContent),
    ssFallback: e.ssFallback && cr(e.ssFallback),
    placeholder: e.placeholder,
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce
  };
  return l && s && Ra(
    c,
    l.clone(c)
  ), c;
}
function Mn(e = " ", t = 0) {
  return En(ro, null, e, t);
}
function es(e, t) {
  const n = En(vi, null, e);
  return n.staticCount = t, n;
}
function ee(e = "", t = !1) {
  return t ? (w(), ss(fs, null, e)) : En(fs, null, e);
}
function Sn(e) {
  return e == null || typeof e == "boolean" ? En(fs) : Te(e) ? En(
    Oe,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : Lu(e) ? rs(e) : En(ro, null, String(e));
}
function rs(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : cr(e);
}
function La(e, t) {
  let n = 0;
  const { shapeFlag: s } = e;
  if (t == null)
    t = null;
  else if (Te(t))
    n = 16;
  else if (typeof t == "object")
    if (s & 65) {
      const r = t.default;
      r && (r._c && (r._d = !1), La(e, r()), r._c && (r._d = !0));
      return;
    } else {
      n = 32;
      const r = t._;
      !r && !vu(t) ? t._ctx = hn : r === 3 && hn && (hn.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else xe(t) ? (t = { default: t, _ctx: hn }, n = 32) : (t = String(t), s & 64 ? (n = 16, t = [Mn(t)]) : n = 8);
  e.children = t, e.shapeFlag |= n;
}
function Cd(...e) {
  const t = {};
  for (let n = 0; n < e.length; n++) {
    const s = e[n];
    for (const r in s)
      if (r === "class")
        t.class !== s.class && (t.class = Pe([t.class, s.class]));
      else if (r === "style")
        t.style = Ee([t.style, s.style]);
      else if (Ki(r)) {
        const i = t[r], o = s[r];
        o && i !== o && !(Te(i) && i.includes(o)) && (t[r] = i ? [].concat(i, o) : o);
      } else r !== "" && (t[r] = s[r]);
  }
  return t;
}
function kn(e, t, n, s = null) {
  Rn(e, t, 7, [
    n,
    s
  ]);
}
const Rd = gu();
let Id = 0;
function Od(e, t, n) {
  const s = e.type, r = (t ? t.appContext : e.appContext) || Rd, i = {
    uid: Id++,
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
    scope: new rh(
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
    propsOptions: wu(s, r),
    emitsOptions: Ru(s, r),
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
  return i.ctx = { _: i }, i.root = t ? t.root : i, i.emit = vd.bind(null, i), e.ce && e.ce(i), i;
}
let Bt = null;
const Ld = () => Bt || hn;
let Fi, ra;
{
  const e = Xi(), t = (n, s) => {
    let r;
    return (r = e[n]) || (r = e[n] = []), r.push(s), (i) => {
      r.length > 1 ? r.forEach((o) => o(i)) : r[0](i);
    };
  };
  Fi = t(
    "__VUE_INSTANCE_SETTERS__",
    (n) => Bt = n
  ), ra = t(
    "__VUE_SSR_SETTERS__",
    (n) => Jr = n
  );
}
const ti = (e) => {
  const t = Bt;
  return Fi(e), e.scope.on(), () => {
    e.scope.off(), Fi(t);
  };
}, Pl = () => {
  Bt && Bt.scope.off(), Fi(null);
};
function Pu(e) {
  return e.vnode.shapeFlag & 4;
}
let Jr = !1;
function Nd(e, t = !1, n = !1) {
  t && ra(t);
  const { props: s, children: r } = e.vnode, i = Pu(e);
  id(e, s, i, t), cd(e, r, n || t);
  const o = i ? Pd(e, t) : void 0;
  return t && ra(!1), o;
}
function Pd(e, t) {
  const n = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Xh);
  const { setup: s } = n;
  if (s) {
    zn();
    const r = e.setupContext = s.length > 1 ? Dd(e) : null, i = ti(e), o = Qr(
      s,
      e,
      0,
      [
        e.props,
        r
      ]
    ), a = Fc(o);
    if (Hn(), i(), (a || e.sp) && !jr(e) && fu(e), a) {
      if (o.then(Pl, Pl), t)
        return o.then((l) => {
          Ml(e, l);
        }).catch((l) => {
          Qi(l, e, 0);
        });
      e.asyncDep = o;
    } else
      Ml(e, o);
  } else
    Mu(e);
}
function Ml(e, t, n) {
  xe(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : at(t) && (e.setupState = iu(t)), Mu(e);
}
function Mu(e, t, n) {
  const s = e.type;
  e.render || (e.render = s.render || xn);
  {
    const r = ti(e);
    zn();
    try {
      Zh(e);
    } finally {
      Hn(), r();
    }
  }
}
const Md = {
  get(e, t) {
    return Rt(e, "get", ""), e[t];
  }
};
function Dd(e) {
  const t = (n) => {
    e.exposed = n || {};
  };
  return {
    attrs: new Proxy(e.attrs, Md),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function io(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(iu(Sh(e.exposed)), {
    get(t, n) {
      if (n in t)
        return t[n];
      if (n in Wr)
        return Wr[n](e);
    },
    has(t, n) {
      return n in t || n in Wr;
    }
  })) : e.proxy;
}
function Fd(e) {
  return xe(e) && "__vccOpts" in e;
}
const le = (e, t) => Ih(e, t, Jr), $d = "3.5.18";
/**
* @vue/runtime-dom v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let ia;
const Dl = typeof window < "u" && window.trustedTypes;
if (Dl)
  try {
    ia = /* @__PURE__ */ Dl.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const Du = ia ? (e) => ia.createHTML(e) : (e) => e, Bd = "http://www.w3.org/2000/svg", Ud = "http://www.w3.org/1998/Math/MathML", Dn = typeof document < "u" ? document : null, Fl = Dn && /* @__PURE__ */ Dn.createElement("template"), zd = {
  insert: (e, t, n) => {
    t.insertBefore(e, n || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, n, s) => {
    const r = t === "svg" ? Dn.createElementNS(Bd, e) : t === "mathml" ? Dn.createElementNS(Ud, e) : n ? Dn.createElement(e, { is: n }) : Dn.createElement(e);
    return e === "select" && s && s.multiple != null && r.setAttribute("multiple", s.multiple), r;
  },
  createText: (e) => Dn.createTextNode(e),
  createComment: (e) => Dn.createComment(e),
  setText: (e, t) => {
    e.nodeValue = t;
  },
  setElementText: (e, t) => {
    e.textContent = t;
  },
  parentNode: (e) => e.parentNode,
  nextSibling: (e) => e.nextSibling,
  querySelector: (e) => Dn.querySelector(e),
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
      Fl.innerHTML = Du(
        s === "svg" ? `<svg>${e}</svg>` : s === "mathml" ? `<math>${e}</math>` : e
      );
      const a = Fl.content;
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
}, Hd = Symbol("_vtc");
function jd(e, t, n) {
  const s = e[Hd];
  s && (t = (t ? [t, ...s] : [...s]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
const $i = Symbol("_vod"), Fu = Symbol("_vsh"), Wd = {
  beforeMount(e, { value: t }, { transition: n }) {
    e[$i] = e.style.display === "none" ? "" : e.style.display, n && t ? n.beforeEnter(e) : Er(e, t);
  },
  mounted(e, { value: t }, { transition: n }) {
    n && t && n.enter(e);
  },
  updated(e, { value: t, oldValue: n }, { transition: s }) {
    !t != !n && (s ? t ? (s.beforeEnter(e), Er(e, !0), s.enter(e)) : s.leave(e, () => {
      Er(e, !1);
    }) : Er(e, t));
  },
  beforeUnmount(e, { value: t }) {
    Er(e, t);
  }
};
function Er(e, t) {
  e.style.display = t ? e[$i] : "none", e[Fu] = !t;
}
const qd = Symbol(""), Vd = /(^|;)\s*display\s*:/;
function Kd(e, t, n) {
  const s = e.style, r = pt(n);
  let i = !1;
  if (n && !r) {
    if (t)
      if (pt(t))
        for (const o of t.split(";")) {
          const a = o.slice(0, o.indexOf(":")).trim();
          n[a] == null && wi(s, a, "");
        }
      else
        for (const o in t)
          n[o] == null && wi(s, o, "");
    for (const o in n)
      o === "display" && (i = !0), wi(s, o, n[o]);
  } else if (r) {
    if (t !== n) {
      const o = s[qd];
      o && (n += ";" + o), s.cssText = n, i = Vd.test(n);
    }
  } else t && e.removeAttribute("style");
  $i in e && (e[$i] = i ? s.display : "", e[Fu] && (s.display = "none"));
}
const $l = /\s*!important$/;
function wi(e, t, n) {
  if (Te(n))
    n.forEach((s) => wi(e, t, s));
  else if (n == null && (n = ""), t.startsWith("--"))
    e.setProperty(t, n);
  else {
    const s = Gd(e, t);
    $l.test(n) ? e.setProperty(
      ds(s),
      n.replace($l, ""),
      "important"
    ) : e[s] = n;
  }
}
const Bl = ["Webkit", "Moz", "ms"], Oo = {};
function Gd(e, t) {
  const n = Oo[t];
  if (n)
    return n;
  let s = cs(t);
  if (s !== "filter" && s in e)
    return Oo[t] = s;
  s = Uc(s);
  for (let r = 0; r < Bl.length; r++) {
    const i = Bl[r] + s;
    if (i in e)
      return Oo[t] = i;
  }
  return t;
}
const Ul = "http://www.w3.org/1999/xlink";
function zl(e, t, n, s, r, i = sh(t)) {
  s && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(Ul, t.slice(6, t.length)) : e.setAttributeNS(Ul, t, n) : n == null || i && !zc(n) ? e.removeAttribute(t) : e.setAttribute(
    t,
    i ? "" : hs(n) ? String(n) : n
  );
}
function Hl(e, t, n, s, r) {
  if (t === "innerHTML" || t === "textContent") {
    n != null && (e[t] = t === "innerHTML" ? Du(n) : n);
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
    a === "boolean" ? n = zc(n) : n == null && a === "string" ? (n = "", o = !0) : a === "number" && (n = 0, o = !0);
  }
  try {
    e[t] = n;
  } catch {
  }
  o && e.removeAttribute(r || t);
}
function Qs(e, t, n, s) {
  e.addEventListener(t, n, s);
}
function Yd(e, t, n, s) {
  e.removeEventListener(t, n, s);
}
const jl = Symbol("_vei");
function Xd(e, t, n, s, r = null) {
  const i = e[jl] || (e[jl] = {}), o = i[t];
  if (s && o)
    o.value = s;
  else {
    const [a, l] = Zd(t);
    if (s) {
      const u = i[t] = ep(
        s,
        r
      );
      Qs(e, a, u, l);
    } else o && (Yd(e, a, o, l), i[t] = void 0);
  }
}
const Wl = /(?:Once|Passive|Capture)$/;
function Zd(e) {
  let t;
  if (Wl.test(e)) {
    t = {};
    let s;
    for (; s = e.match(Wl); )
      e = e.slice(0, e.length - s[0].length), t[s[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : ds(e.slice(2)), t];
}
let Lo = 0;
const Jd = /* @__PURE__ */ Promise.resolve(), Qd = () => Lo || (Jd.then(() => Lo = 0), Lo = Date.now());
function ep(e, t) {
  const n = (s) => {
    if (!s._vts)
      s._vts = Date.now();
    else if (s._vts <= n.attached)
      return;
    Rn(
      tp(s, n.value),
      t,
      5,
      [s]
    );
  };
  return n.value = e, n.attached = Qd(), n;
}
function tp(e, t) {
  if (Te(t)) {
    const n = e.stopImmediatePropagation;
    return e.stopImmediatePropagation = () => {
      n.call(e), e._stopped = !0;
    }, t.map(
      (s) => (r) => !r._stopped && s && s(r)
    );
  } else
    return t;
}
const ql = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, np = (e, t, n, s, r, i) => {
  const o = r === "svg";
  t === "class" ? jd(e, s, o) : t === "style" ? Kd(e, n, s) : Ki(t) ? ya(t) || Xd(e, t, n, s, i) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : sp(e, t, s, o)) ? (Hl(e, t, s), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && zl(e, t, s, o, i, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !pt(s)) ? Hl(e, cs(t), s, i, t) : (t === "true-value" ? e._trueValue = s : t === "false-value" && (e._falseValue = s), zl(e, t, s, o));
};
function sp(e, t, n, s) {
  if (s)
    return !!(t === "innerHTML" || t === "textContent" || t in e && ql(t) && xe(n));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const r = e.tagName;
    if (r === "IMG" || r === "VIDEO" || r === "CANVAS" || r === "SOURCE")
      return !1;
  }
  return ql(t) && pt(n) ? !1 : t in e;
}
const Vl = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return Te(t) ? (n) => _i(t, n) : t;
};
function rp(e) {
  e.target.composing = !0;
}
function Kl(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const No = Symbol("_assign"), As = {
  created(e, { modifiers: { lazy: t, trim: n, number: s } }, r) {
    e[No] = Vl(r);
    const i = s || r.props && r.props.type === "number";
    Qs(e, t ? "change" : "input", (o) => {
      if (o.target.composing) return;
      let a = e.value;
      n && (a = a.trim()), i && (a = Yo(a)), e[No](a);
    }), n && Qs(e, "change", () => {
      e.value = e.value.trim();
    }), t || (Qs(e, "compositionstart", rp), Qs(e, "compositionend", Kl), Qs(e, "change", Kl));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t }) {
    e.value = t ?? "";
  },
  beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: s, trim: r, number: i } }, o) {
    if (e[No] = Vl(o), e.composing) return;
    const a = (i || e.type === "number") && !/^0\d/.test(e.value) ? Yo(e.value) : e.value, l = t ?? "";
    a !== l && (document.activeElement === e && e.type !== "range" && (s && t === n || r && e.value.trim() === l) || (e.value = l));
  }
}, ip = ["ctrl", "shift", "alt", "meta"], op = {
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
  exact: (e, t) => ip.some((n) => e[`${n}Key`] && !t.includes(n))
}, Es = (e, t) => {
  const n = e._withMods || (e._withMods = {}), s = t.join(".");
  return n[s] || (n[s] = (r, ...i) => {
    for (let o = 0; o < t.length; o++) {
      const a = op[t[o]];
      if (a && a(r, t)) return;
    }
    return e(r, ...i);
  });
}, ap = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, ki = (e, t) => {
  const n = e._withKeys || (e._withKeys = {}), s = t.join(".");
  return n[s] || (n[s] = (r) => {
    if (!("key" in r))
      return;
    const i = ds(r.key);
    if (t.some(
      (o) => o === i || ap[o] === i
    ))
      return e(r);
  });
}, lp = /* @__PURE__ */ Ot({ patchProp: np }, zd);
let Gl;
function cp() {
  return Gl || (Gl = fd(lp));
}
const up = (...e) => {
  const t = cp().createApp(...e), { mount: n } = t;
  return t.mount = (s) => {
    const r = hp(s);
    if (!r) return;
    const i = t._component;
    !xe(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
    const o = n(r, !1, fp(r));
    return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), o;
  }, t;
};
function fp(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function hp(e) {
  return pt(e) ? document.querySelector(e) : e;
}
const $u = /* @__PURE__ */ new Set(["customer_required", "token_invalid"]), oa = (e) => !!e && $u.has(e), or = (e) => {
  const t = e.replace("#", ""), n = parseInt(t.substr(0, 2), 16), s = parseInt(t.substr(2, 2), 16), r = parseInt(t.substr(4, 2), 16);
  return (n * 299 + s * 587 + r * 114) / 1e3 < 128;
}, dp = (e, t) => {
  const n = e.replace("#", ""), s = parseInt(n.substr(0, 2), 16), r = parseInt(n.substr(2, 2), 16), i = parseInt(n.substr(4, 2), 16), o = or(e), a = o ? Math.min(255, s + t) : Math.max(0, s - t), l = o ? Math.min(255, r + t) : Math.max(0, r - t), u = o ? Math.min(255, i + t) : Math.max(0, i - t);
  return `#${a.toString(16).padStart(2, "0")}${l.toString(16).padStart(2, "0")}${u.toString(16).padStart(2, "0")}`;
}, Cr = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e), pp = (e) => {
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
function Na() {
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
var Ms = Na();
function Bu(e) {
  Ms = e;
}
var Vr = { exec: () => null };
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
}, mp = /^(?:[ \t]*(?:\n|$))+/, gp = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/, _p = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, ni = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, yp = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, Pa = /(?:[*+-]|\d{1,9}[.)])/, Uu = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/, zu = qe(Uu).replace(/bull/g, Pa).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(), vp = qe(Uu).replace(/bull/g, Pa).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(), Ma = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/, bp = /^[^\n]+/, Da = /(?!\s*\])(?:\\.|[^\[\]\\])+/, wp = qe(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", Da).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), kp = qe(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, Pa).getRegex(), oo = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", Fa = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, Tp = qe(
  "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))",
  "i"
).replace("comment", Fa).replace("tag", oo).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), Hu = qe(Ma).replace("hr", ni).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", oo).getRegex(), Ap = qe(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", Hu).getRegex(), $a = {
  blockquote: Ap,
  code: gp,
  def: wp,
  fences: _p,
  heading: yp,
  hr: ni,
  html: Tp,
  lheading: zu,
  list: kp,
  newline: mp,
  paragraph: Hu,
  table: Vr,
  text: bp
}, Yl = qe(
  "^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"
).replace("hr", ni).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", oo).getRegex(), Sp = {
  ...$a,
  lheading: vp,
  table: Yl,
  paragraph: qe(Ma).replace("hr", ni).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", Yl).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", oo).getRegex()
}, xp = {
  ...$a,
  html: qe(
    `^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`
  ).replace("comment", Fa).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
  heading: /^(#{1,6})(.*)(?:\n+|$)/,
  fences: Vr,
  // fences not supported
  lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  paragraph: qe(Ma).replace("hr", ni).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", zu).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
}, Ep = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, Cp = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, ju = /^( {2,}|\\)\n(?!\s*$)/, Rp = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, ao = /[\p{P}\p{S}]/u, Ba = /[\s\p{P}\p{S}]/u, Wu = /[^\s\p{P}\p{S}]/u, Ip = qe(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, Ba).getRegex(), qu = /(?!~)[\p{P}\p{S}]/u, Op = /(?!~)[\s\p{P}\p{S}]/u, Lp = /(?:[^\s\p{P}\p{S}]|~)/u, Np = /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g, Vu = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/, Pp = qe(Vu, "u").replace(/punct/g, ao).getRegex(), Mp = qe(Vu, "u").replace(/punct/g, qu).getRegex(), Ku = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", Dp = qe(Ku, "gu").replace(/notPunctSpace/g, Wu).replace(/punctSpace/g, Ba).replace(/punct/g, ao).getRegex(), Fp = qe(Ku, "gu").replace(/notPunctSpace/g, Lp).replace(/punctSpace/g, Op).replace(/punct/g, qu).getRegex(), $p = qe(
  "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)",
  "gu"
).replace(/notPunctSpace/g, Wu).replace(/punctSpace/g, Ba).replace(/punct/g, ao).getRegex(), Bp = qe(/\\(punct)/, "gu").replace(/punct/g, ao).getRegex(), Up = qe(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), zp = qe(Fa).replace("(?:-->|$)", "-->").getRegex(), Hp = qe(
  "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>"
).replace("comment", zp).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), Bi = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/, jp = qe(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", Bi).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), Gu = qe(/^!?\[(label)\]\[(ref)\]/).replace("label", Bi).replace("ref", Da).getRegex(), Yu = qe(/^!?\[(ref)\](?:\[\])?/).replace("ref", Da).getRegex(), Wp = qe("reflink|nolink(?!\\()", "g").replace("reflink", Gu).replace("nolink", Yu).getRegex(), Ua = {
  _backpedal: Vr,
  // only used for GFM url
  anyPunctuation: Bp,
  autolink: Up,
  blockSkip: Np,
  br: ju,
  code: Cp,
  del: Vr,
  emStrongLDelim: Pp,
  emStrongRDelimAst: Dp,
  emStrongRDelimUnd: $p,
  escape: Ep,
  link: jp,
  nolink: Yu,
  punctuation: Ip,
  reflink: Gu,
  reflinkSearch: Wp,
  tag: Hp,
  text: Rp,
  url: Vr
}, qp = {
  ...Ua,
  link: qe(/^!?\[(label)\]\((.*?)\)/).replace("label", Bi).getRegex(),
  reflink: qe(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", Bi).getRegex()
}, aa = {
  ...Ua,
  emStrongRDelimAst: Fp,
  emStrongLDelim: Mp,
  url: qe(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, "i").replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
  _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
}, Vp = {
  ...aa,
  br: qe(ju).replace("{2,}", "*").getRegex(),
  text: qe(aa.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
}, di = {
  normal: $a,
  gfm: Sp,
  pedantic: xp
}, Rr = {
  normal: Ua,
  gfm: aa,
  breaks: Vp,
  pedantic: qp
}, Kp = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}, Xl = (e) => Kp[e];
function Tn(e, t) {
  if (t) {
    if (Ut.escapeTest.test(e))
      return e.replace(Ut.escapeReplace, Xl);
  } else if (Ut.escapeTestNoEncode.test(e))
    return e.replace(Ut.escapeReplaceNoEncode, Xl);
  return e;
}
function Zl(e) {
  try {
    e = encodeURI(e).replace(Ut.percentDecode, "%");
  } catch {
    return null;
  }
  return e;
}
function Jl(e, t) {
  var i;
  const n = e.replace(Ut.findPipe, (o, a, l) => {
    let u = !1, c = a;
    for (; --c >= 0 && l[c] === "\\"; ) u = !u;
    return u ? "|" : " |";
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
function Ir(e, t, n) {
  const s = e.length;
  if (s === 0)
    return "";
  let r = 0;
  for (; r < s && e.charAt(s - r - 1) === t; )
    r++;
  return e.slice(0, s - r);
}
function Gp(e, t) {
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
function Ql(e, t, n, s, r) {
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
function Yp(e, t, n) {
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
var Ui = class {
  // set by the lexer
  constructor(e) {
    Je(this, "options");
    Je(this, "rules");
    // set by the lexer
    Je(this, "lexer");
    this.options = e || Ms;
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
        text: this.options.pedantic ? n : Ir(n, `
`)
      };
    }
  }
  fences(e) {
    const t = this.rules.block.fences.exec(e);
    if (t) {
      const n = t[0], s = Yp(n, t[3] || "", this.rules);
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
        const s = Ir(n, "#");
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
        raw: Ir(t[0], `
`)
      };
  }
  blockquote(e) {
    const t = this.rules.block.blockquote.exec(e);
    if (t) {
      let n = Ir(t[0], `
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
        const k = i.at(-1);
        if ((k == null ? void 0 : k.type) === "code")
          break;
        if ((k == null ? void 0 : k.type) === "blockquote") {
          const I = k, O = I.raw + `
` + n.join(`
`), j = this.blockquote(O);
          i[i.length - 1] = j, s = s.substring(0, s.length - I.raw.length) + j.raw, r = r.substring(0, r.length - I.text.length) + j.text;
          break;
        } else if ((k == null ? void 0 : k.type) === "list") {
          const I = k, O = I.raw + `
` + n.join(`
`), j = this.list(O);
          i[i.length - 1] = j, s = s.substring(0, s.length - k.raw.length) + j.raw, r = r.substring(0, r.length - I.raw.length) + j.raw, n = O.substring(i.at(-1).raw.length).split(`
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
`, 1)[0].replace(this.rules.other.listReplaceTabs, (R) => " ".repeat(3 * R.length)), k = e.split(`
`, 1)[0], I = !b.trim(), O = 0;
        if (this.options.pedantic ? (O = 2, c = b.trimStart()) : I ? O = t[1].length + 1 : (O = t[2].search(this.rules.other.nonSpaceChar), O = O > 4 ? 1 : O, c = b.slice(O), O += t[1].length), I && this.rules.other.blankLine.test(k) && (u += k + `
`, e = e.substring(k.length + 1), l = !0), !l) {
          const R = this.rules.other.nextBulletRegex(O), ue = this.rules.other.hrRegex(O), me = this.rules.other.fencesBeginRegex(O), C = this.rules.other.headingBeginRegex(O), M = this.rules.other.htmlBeginRegex(O);
          for (; e; ) {
            const S = e.split(`
`, 1)[0];
            let q;
            if (k = S, this.options.pedantic ? (k = k.replace(this.rules.other.listReplaceNesting, "  "), q = k) : q = k.replace(this.rules.other.tabCharGlobal, "    "), me.test(k) || C.test(k) || M.test(k) || R.test(k) || ue.test(k))
              break;
            if (q.search(this.rules.other.nonSpaceChar) >= O || !k.trim())
              c += `
` + q.slice(O);
            else {
              if (I || b.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || me.test(b) || C.test(b) || ue.test(b))
                break;
              c += `
` + k;
            }
            !I && !k.trim() && (I = !0), u += S + `
`, e = e.substring(S.length + 1), b = q.slice(O);
          }
        }
        r.loose || (o ? r.loose = !0 : this.rules.other.doubleBlankLine.test(u) && (o = !0));
        let j = null, ce;
        this.options.gfm && (j = this.rules.other.listIsTask.exec(c), j && (ce = j[0] !== "[ ] ", c = c.replace(this.rules.other.listReplaceTask, ""))), r.items.push({
          type: "list_item",
          raw: u,
          task: !!j,
          checked: ce,
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
    const n = Jl(t[1]), s = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), r = (o = t[3]) != null && o.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
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
        i.rows.push(Jl(a, i.header.length).map((l, u) => ({
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
        const i = Ir(n.slice(0, -1), "\\");
        if ((n.length - i.length) % 2 === 0)
          return;
      } else {
        const i = Gp(t[2], "()");
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
      return s = s.trim(), this.rules.other.startAngleBracket.test(s) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n) ? s = s.slice(1) : s = s.slice(1, -1)), Ql(t, {
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
      return Ql(n, r, n[0], this.lexer, this.rules);
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
        const b = [...s[0]][0].length, k = e.slice(0, i + s.index + b + a);
        if (Math.min(i, a) % 2) {
          const O = k.slice(1, -1);
          return {
            type: "em",
            raw: k,
            text: O,
            tokens: this.lexer.inlineTokens(O)
          };
        }
        const I = k.slice(2, -2);
        return {
          type: "strong",
          raw: k,
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
}, Bn = class la {
  constructor(t) {
    Je(this, "tokens");
    Je(this, "options");
    Je(this, "state");
    Je(this, "tokenizer");
    Je(this, "inlineQueue");
    this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = t || Ms, this.options.tokenizer = this.options.tokenizer || new Ui(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = {
      inLink: !1,
      inRawBlock: !1,
      top: !0
    };
    const n = {
      other: Ut,
      block: di.normal,
      inline: Rr.normal
    };
    this.options.pedantic ? (n.block = di.pedantic, n.inline = Rr.pedantic) : this.options.gfm && (n.block = di.gfm, this.options.breaks ? n.inline = Rr.breaks : n.inline = Rr.gfm), this.tokenizer.rules = n;
  }
  /**
   * Expose Rules
   */
  static get rules() {
    return {
      block: di,
      inline: Rr
    };
  }
  /**
   * Static Lex Method
   */
  static lex(t, n) {
    return new la(n).lex(t);
  }
  /**
   * Static Lex Inline Method
   */
  static lexInline(t, n) {
    return new la(n).inlineTokens(t);
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
        this.options.extensions.startBlock.forEach((k) => {
          b = k.call({ lexer: this }, c), typeof b == "number" && b >= 0 && (u = Math.min(u, b));
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
      if ((l = (a = this.options.extensions) == null ? void 0 : a.inline) != null && l.some((k) => (c = k.call({ lexer: this }, t, n)) ? (t = t.substring(c.raw.length), n.push(c), !0) : !1))
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
        const k = n.at(-1);
        c.type === "text" && (k == null ? void 0 : k.type) === "text" ? (k.raw += c.raw, k.text += c.text) : n.push(c);
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
        let k = 1 / 0;
        const I = t.slice(1);
        let O;
        this.options.extensions.startInline.forEach((j) => {
          O = j.call({ lexer: this }, I), typeof O == "number" && O >= 0 && (k = Math.min(k, O));
        }), k < 1 / 0 && k >= 0 && (b = t.substring(0, k + 1));
      }
      if (c = this.tokenizer.inlineText(b)) {
        t = t.substring(c.raw.length), c.raw.slice(-1) !== "_" && (o = c.raw.slice(-1)), i = !0;
        const k = n.at(-1);
        (k == null ? void 0 : k.type) === "text" ? (k.raw += c.raw, k.text += c.text) : n.push(c);
        continue;
      }
      if (t) {
        const k = "Infinite loop on byte: " + t.charCodeAt(0);
        if (this.options.silent) {
          console.error(k);
          break;
        } else
          throw new Error(k);
      }
    }
    return n;
  }
}, zi = class {
  // set by the parser
  constructor(e) {
    Je(this, "options");
    Je(this, "parser");
    this.options = e || Ms;
  }
  space(e) {
    return "";
  }
  code({ text: e, lang: t, escaped: n }) {
    var i;
    const s = (i = (t || "").match(Ut.notSpaceStart)) == null ? void 0 : i[0], r = e.replace(Ut.endingNewline, "") + `
`;
    return s ? '<pre><code class="language-' + Tn(s) + '">' + (n ? r : Tn(r, !0)) + `</code></pre>
` : "<pre><code>" + (n ? r : Tn(r, !0)) + `</code></pre>
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
      e.loose ? ((n = e.tokens[0]) == null ? void 0 : n.type) === "paragraph" ? (e.tokens[0].text = s + " " + e.tokens[0].text, e.tokens[0].tokens && e.tokens[0].tokens.length > 0 && e.tokens[0].tokens[0].type === "text" && (e.tokens[0].tokens[0].text = s + " " + Tn(e.tokens[0].tokens[0].text), e.tokens[0].tokens[0].escaped = !0)) : e.tokens.unshift({
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
    return `<code>${Tn(e, !0)}</code>`;
  }
  br(e) {
    return "<br>";
  }
  del({ tokens: e }) {
    return `<del>${this.parser.parseInline(e)}</del>`;
  }
  link({ href: e, title: t, tokens: n }) {
    const s = this.parser.parseInline(n), r = Zl(e);
    if (r === null)
      return s;
    e = r;
    let i = '<a href="' + e + '"';
    return t && (i += ' title="' + Tn(t) + '"'), i += ">" + s + "</a>", i;
  }
  image({ href: e, title: t, text: n, tokens: s }) {
    s && (n = this.parser.parseInline(s, this.parser.textRenderer));
    const r = Zl(e);
    if (r === null)
      return Tn(n);
    e = r;
    let i = `<img src="${e}" alt="${n}"`;
    return t && (i += ` title="${Tn(t)}"`), i += ">", i;
  }
  text(e) {
    return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : Tn(e.text);
  }
}, za = class {
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
}, Un = class ca {
  constructor(t) {
    Je(this, "options");
    Je(this, "renderer");
    Je(this, "textRenderer");
    this.options = t || Ms, this.options.renderer = this.options.renderer || new zi(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new za();
  }
  /**
   * Static Parse Method
   */
  static parse(t, n) {
    return new ca(n).parse(t);
  }
  /**
   * Static Parse Inline Method
   */
  static parseInline(t, n) {
    return new ca(n).parseInline(t);
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
}, Ko, Ti = (Ko = class {
  constructor(e) {
    Je(this, "options");
    Je(this, "block");
    this.options = e || Ms;
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
    return this.block ? Bn.lex : Bn.lexInline;
  }
  /**
   * Provide function to parse tokens
   */
  provideParser() {
    return this.block ? Un.parse : Un.parseInline;
  }
}, Je(Ko, "passThroughHooks", /* @__PURE__ */ new Set([
  "preprocess",
  "postprocess",
  "processAllTokens"
])), Ko), Xp = class {
  constructor(...e) {
    Je(this, "defaults", Na());
    Je(this, "options", this.setOptions);
    Je(this, "parse", this.parseMarkdown(!0));
    Je(this, "parseInline", this.parseMarkdown(!1));
    Je(this, "Parser", Un);
    Je(this, "Renderer", zi);
    Je(this, "TextRenderer", za);
    Je(this, "Lexer", Bn);
    Je(this, "Tokenizer", Ui);
    Je(this, "Hooks", Ti);
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
        const r = this.defaults.renderer || new zi(this.defaults);
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
        const r = this.defaults.tokenizer || new Ui(this.defaults);
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
        const r = this.defaults.hooks || new Ti();
        for (const i in n.hooks) {
          if (!(i in r))
            throw new Error(`hook '${i}' does not exist`);
          if (["options", "block"].includes(i))
            continue;
          const o = i, a = n.hooks[o], l = r[o];
          Ti.passThroughHooks.has(i) ? r[o] = (u) => {
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
    return Bn.lex(e, t ?? this.defaults);
  }
  parser(e, t) {
    return Un.parse(e, t ?? this.defaults);
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
      const a = i.hooks ? i.hooks.provideLexer() : e ? Bn.lex : Bn.lexInline, l = i.hooks ? i.hooks.provideParser() : e ? Un.parse : Un.parseInline;
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
        const s = "<p>An error occurred:</p><pre>" + Tn(n.message + "", !0) + "</pre>";
        return t ? Promise.resolve(s) : s;
      }
      if (t)
        return Promise.reject(n);
      throw n;
    };
  }
}, Ls = new Xp();
function Ue(e, t) {
  return Ls.parse(e, t);
}
Ue.options = Ue.setOptions = function(e) {
  return Ls.setOptions(e), Ue.defaults = Ls.defaults, Bu(Ue.defaults), Ue;
};
Ue.getDefaults = Na;
Ue.defaults = Ms;
Ue.use = function(...e) {
  return Ls.use(...e), Ue.defaults = Ls.defaults, Bu(Ue.defaults), Ue;
};
Ue.walkTokens = function(e, t) {
  return Ls.walkTokens(e, t);
};
Ue.parseInline = Ls.parseInline;
Ue.Parser = Un;
Ue.parser = Un.parse;
Ue.Renderer = zi;
Ue.TextRenderer = za;
Ue.Lexer = Bn;
Ue.lexer = Bn.lex;
Ue.Tokenizer = Ui;
Ue.Hooks = Ti;
Ue.parse = Ue;
Ue.options;
Ue.setOptions;
Ue.use;
Ue.walkTokens;
Ue.parseInline;
Un.parse;
Bn.lex;
/*! @license DOMPurify 3.4.15 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.15/LICENSE */
function ec(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function Zp(e) {
  if (Array.isArray(e)) return e;
}
function Jp(e, t) {
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
function Qp() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function em(e, t) {
  return Zp(e) || Jp(e, t) || tm(e, t) || Qp();
}
function tm(e, t) {
  if (e) {
    if (typeof e == "string") return ec(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ec(e, t) : void 0;
  }
}
const Xu = Object.entries, tc = Object.setPrototypeOf, nm = Object.isFrozen, sm = Object.getPrototypeOf, rm = Object.getOwnPropertyDescriptor;
let yt = Object.freeze, wt = Object.seal, er = Object.create, Zu = typeof Reflect < "u" && Reflect, ua = Zu.apply, fa = Zu.construct;
yt || (yt = function(t) {
  return t;
});
wt || (wt = function(t) {
  return t;
});
ua || (ua = function(t, n) {
  for (var s = arguments.length, r = new Array(s > 2 ? s - 2 : 0), i = 2; i < s; i++)
    r[i - 2] = arguments[i];
  return t.apply(n, r);
});
fa || (fa = function(t) {
  for (var n = arguments.length, s = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
    s[r - 1] = arguments[r];
  return new t(...s);
});
const Cs = mt(Array.prototype.forEach), im = mt(Array.prototype.lastIndexOf), nc = mt(Array.prototype.pop), Or = mt(Array.prototype.push), om = mt(Array.prototype.splice), ar = Array.isArray, Dr = mt(String.prototype.toLowerCase), Po = mt(String.prototype.toString), sc = mt(String.prototype.match), Lr = mt(String.prototype.replace), rc = mt(String.prototype.indexOf), am = mt(String.prototype.trim), lm = mt(Number.prototype.toString), cm = mt(Boolean.prototype.toString), ic = typeof BigInt > "u" ? null : mt(BigInt.prototype.toString), oc = typeof Symbol > "u" ? null : mt(Symbol.prototype.toString), Wt = mt(Object.prototype.hasOwnProperty), Nr = mt(Object.prototype.toString), Ct = mt(RegExp.prototype.test), Ss = um(TypeError);
function mt(e) {
  return function(t) {
    t instanceof RegExp && (t.lastIndex = 0);
    for (var n = arguments.length, s = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
      s[r - 1] = arguments[r];
    return ua(e, t, s);
  };
}
function um(e) {
  return function() {
    for (var t = arguments.length, n = new Array(t), s = 0; s < t; s++)
      n[s] = arguments[s];
    return fa(e, n);
  };
}
function Fe(e, t) {
  let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : Dr;
  if (tc && tc(e, null), !ar(t))
    return e;
  let s = t.length;
  for (; s--; ) {
    let r = t[s];
    if (typeof r == "string") {
      const i = n(r);
      i !== r && (nm(t) || (t[s] = i), r = i);
    }
    e[r] = !0;
  }
  return e;
}
function fm(e) {
  for (let t = 0; t < e.length; t++)
    Wt(e, t) || (e[t] = null);
  return e;
}
function tn(e) {
  const t = er(null);
  for (const s of Xu(e)) {
    var n = em(s, 2);
    const r = n[0], i = n[1];
    Wt(e, r) && (ar(i) ? t[r] = fm(i) : i && typeof i == "object" && i.constructor === Object ? t[r] = tn(i) : t[r] = i);
  }
  return t;
}
function hm(e) {
  switch (typeof e) {
    case "string":
      return e;
    case "number":
      return lm(e);
    case "boolean":
      return cm(e);
    case "bigint":
      return ic ? ic(e) : "0";
    case "symbol":
      return oc ? oc(e) : "Symbol()";
    case "undefined":
      return Nr(e);
    case "function":
    case "object": {
      if (e === null)
        return Nr(e);
      const t = e, n = cn(t, "toString");
      if (typeof n == "function") {
        const s = n(t);
        return typeof s == "string" ? s : Nr(s);
      }
      return Nr(e);
    }
    default:
      return Nr(e);
  }
}
function cn(e, t) {
  for (; e !== null; ) {
    const s = rm(e, t);
    if (s) {
      if (s.get)
        return mt(s.get);
      if (typeof s.value == "function")
        return mt(s.value);
    }
    e = sm(e);
  }
  function n() {
    return null;
  }
  return n;
}
function dm(e) {
  try {
    return Ct(e, ""), !0;
  } catch {
    return !1;
  }
}
const ac = yt(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]), Mo = yt(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "enterkeyhint", "exportparts", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "inputmode", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "part", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]), Do = yt(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]), pm = yt(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]), Fo = yt(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]), mm = yt(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]), lc = yt(["#text"]), cc = yt(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "command", "commandfor", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "exportparts", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inert", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "part", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "slot", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns"]), $o = yt(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dominant-baseline", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "mask-type", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "pointer-events", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-orientation", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "vector-effect", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]), uc = yt(["accent", "accentunder", "align", "bevelled", "close", "columnalign", "columnlines", "columnspacing", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lquote", "lspace", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]), pi = yt(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]), gm = wt(/{{[\w\W]*|^[\w\W]*}}/g), _m = wt(/<%[\w\W]*|^[\w\W]*%>/g), ym = wt(/\${[\w\W]*/g), vm = wt(/^data-[\-\w.\u00B7-\uFFFF]+$/), bm = wt(/^aria-[\-\w]+$/), fc = wt(
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  // eslint-disable-line no-useless-escape
), wm = wt(/^(?:\w+script|data):/i), km = wt(
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g
  // eslint-disable-line no-control-regex
), Tm = wt(/^html$/i), Am = wt(/^[a-z][.\w]*(-[.\w]+)+$/i), hc = wt(/<[/\w!]/g), dc = wt(/<[/\w]/g), Sm = wt(/<\/no(script|embed|frames)/i), xm = wt(/\/>/i), Qt = {
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
}, Ju = ["style", "script", "xmp", "iframe", "noembed", "noframes", "plaintext", "noscript"], Em = yt(Fe({}, Ju)), Cm = function() {
  const e = {};
  return Cs(Ju, (t) => {
    e[t] = wt(new RegExp("</" + t + "(?=[\\t\\n\\f\\r />])", "i"));
  }), yt(e);
}(), Rm = function() {
  return typeof window > "u" ? null : window;
}, Im = function(t, n) {
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
}, pc = function() {
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
  return Wt(t, n) && ar(t[n]) ? Fe(r.base ? tn(r.base) : {}, t[n], r.transform) : s;
}, Bo = function(t, n, s) {
  const r = Wt(t, n) ? t[n] : void 0;
  return r && typeof r == "object" ? tn(r) : s();
};
function Qu() {
  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : Rm();
  const t = (V) => Qu(V);
  if (t.version = "3.4.15", t.removed = [], !e || !e.document || e.document.nodeType !== Qt.document || !e.Element)
    return t.isSupported = !1, t;
  let n = e.document;
  const s = n, r = s.currentScript;
  e.DocumentFragment;
  const i = e.HTMLTemplateElement, o = e.Node, a = e.Element, l = e.NodeFilter, u = e.NamedNodeMap;
  u === void 0 && (e.NamedNodeMap || e.MozNamedAttrMap), e.HTMLFormElement;
  const c = e.DOMParser, b = e.trustedTypes, k = a.prototype, I = cn(k, "cloneNode"), O = cn(k, "remove"), j = cn(k, "removeAttributeNode"), ce = cn(k, "nextSibling"), R = cn(k, "childNodes"), ue = cn(k, "parentNode"), me = cn(k, "shadowRoot"), C = cn(k, "attributes"), M = o && o.prototype ? cn(o.prototype, "nodeType") : null, S = o && o.prototype ? cn(o.prototype, "nodeName") : null, q = o && o.prototype ? cn(o.prototype, "ownerDocument") : null, se = function(p) {
    return M ? M(p) : p.nodeType;
  }, de = function(p) {
    return S ? S(p) : p.nodeName;
  };
  if (typeof i == "function") {
    const V = n.createElement("template");
    V.content && V.content.ownerDocument && (n = V.content.ownerDocument);
  }
  let pe, Le = "", Ae, Ve = !1, $e = 0;
  const et = function() {
    if ($e > 0)
      throw Ss('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.');
  }, fe = function(p) {
    et(), $e++;
    try {
      return pe.createHTML(p);
    } finally {
      $e--;
    }
  }, we = function(p) {
    et(), $e++;
    try {
      return pe.createScriptURL(p);
    } finally {
      $e--;
    }
  }, ge = function() {
    return Ve || (Ae = Im(b, r), Ve = !0), Ae;
  }, Ye = n, Xe = Ye.implementation, rt = Ye.createNodeIterator, ze = Ye.createDocumentFragment, Lt = Ye.getElementsByTagName, vn = s.importNode;
  let De = pc();
  t.isSupported = typeof Xu == "function" && typeof ue == "function" && Xe && Xe.createHTMLDocument !== void 0;
  const vt = gm, zt = _m, qt = ym, Vt = vm, Nt = bm, bn = wm, g = km, v = Am;
  let L = fc, D = null;
  const B = Fe({}, [...ac, ...Mo, ...Do, ...Fo, ...lc]);
  let P = null;
  const X = Fe({}, [...cc, ...$o, ...uc, ...pi]);
  let K = Object.seal(er(null, {
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
  })), G = null, F = null;
  const re = Object.seal(er(null, {
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
  let Y = !0, ne = !0, he = !1, _e = !0, be = !1, ke = !0, Be = !1, U = !1, z = null, f = null, y = !1, N = !1, E = !1, W = !1, Q = !0, ie = !1;
  const Ce = "user-content-";
  let Re = !0, Ie = !1, Ne = {}, it = null;
  const ht = Fe({}, [
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
  let pn = null;
  const Ht = Fe({}, ["audio", "video", "img", "source", "image", "track"]);
  let Kt = null;
  const fr = Fe({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), Pt = "http://www.w3.org/1998/Math/MathML", On = "http://www.w3.org/2000/svg", Mt = "http://www.w3.org/1999/xhtml";
  let sn = Mt, hr = !1, Wn = null;
  const wn = Fe({}, [Pt, On, Mt], Po), rn = yt(["mi", "mo", "mn", "ms", "mtext"]);
  let Fs = Fe({}, rn);
  const St = yt(["annotation-xml"]);
  let dr = Fe({}, St);
  const si = Fe({}, ["title", "style", "font", "a", "script"]);
  let xt = null;
  const uo = ["application/xhtml+xml", "text/html"], ps = "text/html";
  let nt = null, qn = null;
  const $s = n.createElement("form"), pr = function(p) {
    return p instanceof RegExp || p instanceof Function;
  }, Bs = function() {
    let p = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (qn && qn === p)
      return;
    (!p || typeof p != "object") && (p = {}), p = tn(p), xt = // eslint-disable-next-line unicorn/prefer-includes
    uo.indexOf(p.PARSER_MEDIA_TYPE) === -1 ? ps : p.PARSER_MEDIA_TYPE, nt = xt === "application/xhtml+xml" ? Po : Dr, D = ts(p, "ALLOWED_TAGS", B, {
      transform: nt
    }), P = ts(p, "ALLOWED_ATTR", X, {
      transform: nt
    }), Wn = ts(p, "ALLOWED_NAMESPACES", wn, {
      transform: Po
    }), Kt = ts(p, "ADD_URI_SAFE_ATTR", fr, {
      transform: nt,
      base: fr
    }), pn = ts(p, "ADD_DATA_URI_TAGS", Ht, {
      transform: nt,
      base: Ht
    }), it = ts(p, "FORBID_CONTENTS", ht, {
      transform: nt
    }), G = ts(p, "FORBID_TAGS", tn({}), {
      transform: nt
    }), F = ts(p, "FORBID_ATTR", tn({}), {
      transform: nt
    }), Ne = Wt(p, "USE_PROFILES") ? p.USE_PROFILES && typeof p.USE_PROFILES == "object" ? tn(p.USE_PROFILES) : p.USE_PROFILES : !1, Y = p.ALLOW_ARIA_ATTR !== !1, ne = p.ALLOW_DATA_ATTR !== !1, he = p.ALLOW_UNKNOWN_PROTOCOLS || !1, _e = p.ALLOW_SELF_CLOSE_IN_ATTR !== !1, be = p.SAFE_FOR_TEMPLATES || !1, ke = p.SAFE_FOR_XML !== !1, Be = p.WHOLE_DOCUMENT || !1, N = p.RETURN_DOM || !1, E = p.RETURN_DOM_FRAGMENT || !1, W = p.RETURN_TRUSTED_TYPE || !1, y = p.FORCE_BODY || !1, Q = p.SANITIZE_DOM !== !1, ie = p.SANITIZE_NAMED_PROPS || !1, Re = p.KEEP_CONTENT !== !1, Ie = p.IN_PLACE || !1, L = dm(p.ALLOWED_URI_REGEXP) ? p.ALLOWED_URI_REGEXP : fc, sn = typeof p.NAMESPACE == "string" ? p.NAMESPACE : Mt, Fs = Bo(
      p,
      "MATHML_TEXT_INTEGRATION_POINTS",
      () => Fe({}, rn)
      // Default built-in map
    ), dr = Bo(
      p,
      "HTML_INTEGRATION_POINTS",
      () => Fe({}, St)
      // Default built-in map
    );
    const A = Bo(p, "CUSTOM_ELEMENT_HANDLING", () => er(null));
    if (K = er(null), Wt(A, "tagNameCheck") && pr(A.tagNameCheck) && (K.tagNameCheck = A.tagNameCheck), Wt(A, "attributeNameCheck") && pr(A.attributeNameCheck) && (K.attributeNameCheck = A.attributeNameCheck), Wt(A, "allowCustomizedBuiltInElements") && typeof A.allowCustomizedBuiltInElements == "boolean" && (K.allowCustomizedBuiltInElements = A.allowCustomizedBuiltInElements), wt(K), be && (ne = !1), E && (N = !0), Ne && (D = Fe({}, lc), P = er(null), Ne.html === !0 && (Fe(D, ac), Fe(P, cc)), Ne.svg === !0 && (Fe(D, Mo), Fe(P, $o), Fe(P, pi)), Ne.svgFilters === !0 && (Fe(D, Do), Fe(P, $o), Fe(P, pi)), Ne.mathMl === !0 && (Fe(D, Fo), Fe(P, uc), Fe(P, pi))), re.tagCheck = null, re.attributeCheck = null, Wt(p, "ADD_TAGS") && (typeof p.ADD_TAGS == "function" ? re.tagCheck = p.ADD_TAGS : ar(p.ADD_TAGS) && (D === B && (D = tn(D)), Fe(D, p.ADD_TAGS, nt))), Wt(p, "ADD_ATTR") && (typeof p.ADD_ATTR == "function" ? re.attributeCheck = p.ADD_ATTR : ar(p.ADD_ATTR) && (P === X && (P = tn(P)), Fe(P, p.ADD_ATTR, nt))), Wt(p, "ADD_FORBID_CONTENTS") && ar(p.ADD_FORBID_CONTENTS) && (it === ht && (it = tn(it)), Fe(it, p.ADD_FORBID_CONTENTS, nt)), Re && (D["#text"] = !0), Be && Fe(D, ["html", "head", "body"]), D.table && (Fe(D, ["tbody"]), delete G.tbody), p.TRUSTED_TYPES_POLICY) {
      if (typeof p.TRUSTED_TYPES_POLICY.createHTML != "function")
        throw Ss('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
      if (typeof p.TRUSTED_TYPES_POLICY.createScriptURL != "function")
        throw Ss('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
      const H = pe;
      pe = p.TRUSTED_TYPES_POLICY;
      try {
        Le = fe("");
      } catch (te) {
        throw pe = H, te;
      }
    } else p.TRUSTED_TYPES_POLICY === null ? (pe = void 0, Le = "") : (pe === void 0 && (pe = ge()), pe && typeof Le == "string" && (Le = fe("")));
    yt && yt(p), qn = p;
  }, mr = Fe({}, [...Mo, ...Do, ...pm]), gr = Fe({}, [...Fo, ...mm]), ri = function(p, A, H) {
    return A.namespaceURI === Mt ? p === "svg" : A.namespaceURI === Pt ? p === "svg" && (H === "annotation-xml" || Fs[H]) : !!mr[p];
  }, ii = function(p, A, H) {
    return A.namespaceURI === Mt ? p === "math" : A.namespaceURI === On ? p === "math" && dr[H] : !!gr[p];
  }, fo = function(p, A, H) {
    return A.namespaceURI === On && !dr[H] || A.namespaceURI === Pt && !Fs[H] ? !1 : !gr[p] && (si[p] || !mr[p]);
  }, _r = function(p) {
    let A = ue(p);
    (!A || !A.tagName) && (A = {
      namespaceURI: sn,
      tagName: "template"
    });
    const H = Dr(p.tagName), te = Dr(A.tagName);
    return Wn[p.namespaceURI] ? p.namespaceURI === On ? ri(H, A, te) : p.namespaceURI === Pt ? ii(H, A, te) : p.namespaceURI === Mt ? fo(H, A, te) : !!(xt === "application/xhtml+xml" && Wn[p.namespaceURI]) : !1;
  }, Gt = function(p) {
    Or(t.removed, {
      element: p
    });
    try {
      ue(p).removeChild(p);
    } catch {
      if (O(p), !ue(p))
        throw Ss("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place");
    }
  }, yr = function(p, A, H) {
    try {
      j(p, A);
    } catch {
      try {
        p.removeAttribute(H);
      } catch {
      }
    }
  }, ms = function(p) {
    Vn(p);
    const A = R(p);
    if (A) {
      const te = [];
      Cs(A, (ae) => {
        Or(te, ae);
      }), Cs(te, (ae) => {
        try {
          O(ae);
        } catch {
        }
      });
    }
    const H = C(p);
    if (H)
      for (let te = H.length - 1; te >= 0; --te) {
        const ae = H[te], ye = ae && ae.name;
        typeof ye == "string" && yr(p, ae, ye);
      }
  }, Dt = function(p, A, H) {
    if (!H)
      try {
        H = A.getAttributeNode(p);
      } catch {
        H = null;
      }
    Or(t.removed, {
      attribute: H || null,
      from: A
    });
    try {
      H ? j(A, H) : A.removeAttribute(p);
    } catch {
      try {
        A.removeAttribute(p);
      } catch {
      }
    }
    if (p === "is")
      if (N || E)
        try {
          Gt(A);
        } catch {
        }
      else
        try {
          A.setAttribute(p, "");
        } catch {
        }
  }, gs = function(p) {
    const A = C(p);
    if (A)
      for (let H = A.length - 1; H >= 0; --H) {
        const te = A[H], ae = te && te.name;
        typeof ae != "string" || P[nt(ae)] || yr(p, te, ae);
      }
  }, Vn = function(p) {
    const A = [p];
    for (; A.length > 0; ) {
      const H = A.pop();
      se(H) === Qt.element && gs(H);
      const ae = R(H);
      if (ae)
        for (let ye = ae.length - 1; ye >= 0; --ye)
          A.push(ae[ye]);
    }
  }, Us = function(p, A) {
    return ke ? p === "patchsrc" ? !0 : p === "for" && A !== "label" && A !== "output" : !1;
  }, zs = function(p) {
    if (!ke)
      return;
    const A = [p];
    for (; A.length > 0; ) {
      const H = A.pop(), te = se(H);
      if (te === Qt.processingInstruction || te === Qt.comment && Ct(dc, H.data)) {
        try {
          O(H);
        } catch {
        }
        continue;
      }
      if (te === Qt.element) {
        const ye = H, Ge = nt(de(H));
        try {
          ye.hasAttribute && ye.hasAttribute("patchsrc") && ye.removeAttribute("patchsrc"), ye.hasAttribute && ye.hasAttribute("for") && Us("for", Ge) && ye.removeAttribute("for");
        } catch {
        }
      }
      const ae = R(H);
      if (ae)
        for (let ye = ae.length - 1; ye >= 0; --ye)
          A.push(ae[ye]);
    }
  }, mn = function(p) {
    let A = null, H = null;
    if (y)
      p = "<remove></remove>" + p;
    else {
      const ye = sc(p, /^[\r\n\t ]+/);
      H = ye && ye[0];
    }
    xt === "application/xhtml+xml" && sn === Mt && (p = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + p + "</body></html>");
    const te = pe ? fe(p) : p;
    if (sn === Mt)
      try {
        A = new c().parseFromString(te, xt);
      } catch {
      }
    if (!A || !A.documentElement) {
      A = Xe.createDocument(sn, "template", null);
      try {
        A.documentElement.innerHTML = hr ? Le : te;
      } catch {
      }
    }
    const ae = A.body || A.documentElement;
    return p && H && ae.insertBefore(n.createTextNode(H), ae.childNodes[0] || null), sn === Mt ? Lt.call(A, Be ? "html" : "body")[0] : Be ? A.documentElement : ae;
  }, Hs = function(p) {
    const A = q ? q(p) : p.ownerDocument;
    return rt.call(
      A || p,
      p,
      // eslint-disable-next-line no-bitwise
      l.SHOW_ELEMENT | l.SHOW_COMMENT | l.SHOW_TEXT | l.SHOW_PROCESSING_INSTRUCTION | l.SHOW_CDATA_SECTION,
      null
    );
  }, Ln = function(p) {
    return p = Lr(p, vt, " "), p = Lr(p, zt, " "), p = Lr(p, qt, " "), p;
  }, js = function(p) {
    var A;
    p.normalize();
    const H = q ? q(p) : p.ownerDocument, te = rt.call(
      H || p,
      p,
      // eslint-disable-next-line no-bitwise
      l.SHOW_TEXT | l.SHOW_COMMENT | l.SHOW_CDATA_SECTION | l.SHOW_PROCESSING_INSTRUCTION,
      null
    );
    let ae = te.nextNode();
    for (; ae; )
      ae.data = Ln(ae.data), ae = te.nextNode();
    const ye = (A = p.querySelectorAll) === null || A === void 0 ? void 0 : A.call(p, "template");
    ye && Cs(ye, (Ge) => {
      Kn(Ge.content) && js(Ge.content);
    });
  }, on = function(p) {
    const A = S ? S(p) : null;
    return typeof A != "string" || nt(A) !== "form" ? !1 : typeof p.nodeName != "string" || typeof p.textContent != "string" || typeof p.removeChild != "function" || // Realm-safe NamedNodeMap detection: equality against the cached
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
    p.nodeType !== M(p) || // HTMLFormElement has [LegacyOverrideBuiltIns]: a descendant named
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
  }, Kn = function(p) {
    if (!M || typeof p != "object" || p === null)
      return !1;
    try {
      return M(p) === Qt.documentFragment;
    } catch {
      return !1;
    }
  }, gn = function(p) {
    if (!M || typeof p != "object" || p === null)
      return !1;
    try {
      return typeof M(p) == "number";
    } catch {
      return !1;
    }
  };
  function Yt(V, p, A) {
    V.length !== 0 && Cs(V, (H) => {
      H.call(t, p, A, qn);
    });
  }
  const ho = function(p, A) {
    return !!(ke && p.hasChildNodes() && !gn(p.firstElementChild) && Ct(hc, p.textContent) && Ct(hc, p.innerHTML) || ke && p.namespaceURI === Mt && Em[A] && (gn(p.firstElementChild) || typeof p.textContent == "string" && Ct(Cm[A], p.textContent)) || p.nodeType === Qt.processingInstruction || ke && p.nodeType === Qt.comment && Ct(dc, p.data));
  }, _s = function(p, A) {
    if (p instanceof RegExp)
      return Ct(p, A);
    if (p instanceof Function) {
      for (var H = arguments.length, te = new Array(H > 2 ? H - 2 : 0), ae = 2; ae < H; ae++)
        te[ae - 2] = arguments[ae];
      return !!p(A, ...te);
    }
    return !1;
  }, Ws = function(p, A, H) {
    if (!G[A] && ct(A) && _s(K.tagNameCheck, A))
      return !1;
    if (Re && !it[A]) {
      const te = ue(p), ae = R(p);
      if (ae && te) {
        const ye = ae.length;
        for (let Ge = ye - 1; Ge >= 0; --Ge) {
          const st = p === H ? I(ae[Ge], !0) : ae[Ge];
          te.insertBefore(st, ce(p));
        }
      }
    }
    return Gt(p), !0;
  }, qs = function(p, A, H, te) {
    return p.length === 0 ? A : A === H || A === te ? tn(A) : A;
  }, Xt = function(p, A) {
    return p === A || ue(p) !== null ? !1 : (Ie && Vn(p), !0);
  }, Zt = function(p, A) {
    if (Yt(De.beforeSanitizeElements, p, null), Xt(p, A))
      return !0;
    if (on(p))
      return Gt(p), !0;
    const H = nt(de(p));
    if (D = qs(De.uponSanitizeElement, D, B, z), Yt(De.uponSanitizeElement, p, {
      tagName: H,
      allowedTags: D
    }), Xt(p, A))
      return !0;
    if (ho(p, H))
      return Gt(p), !0;
    if (G[H] || !(re.tagCheck instanceof Function && re.tagCheck(H)) && !D[H]) {
      const ae = Ws(p, H, A);
      return ae === !1 && Yt(De.afterSanitizeElements, p, null), ae;
    }
    if (se(p) === Qt.element && !_r(p) || (H === "noscript" || H === "noembed" || H === "noframes") && Ct(Sm, p.innerHTML))
      return Gt(p), !0;
    if (be && p.nodeType === Qt.text) {
      const ae = Ln(p.textContent);
      p.textContent !== ae && (Or(t.removed, {
        element: p.cloneNode()
      }), p.textContent = ae);
    }
    return Yt(De.afterSanitizeElements, p, null), !1;
  }, lt = function(p, A, H) {
    if (F[A] || Us(A, p) || Q && (A === "id" || A === "name") && (H in n || H in $s))
      return !1;
    const te = P[A] || re.attributeCheck instanceof Function && re.attributeCheck(A, p);
    return ne && Ct(Vt, A) || Y && Ct(Nt, A) ? !0 : te ? Kt[A] || Ct(L, Lr(H, g, "")) || (A === "src" || A === "xlink:href" || A === "href") && p !== "script" && rc(H, "data:") === 0 && pn[p] || he && !Ct(bn, Lr(H, g, "")) ? !0 : !H : (
      // Condition a) covers a basically valid custom element tag name whose
      // tag passes the configured tagNameCheck and whose attribute name
      // passes the configured attributeNameCheck ...
      ct(p) && _s(K.tagNameCheck, p) && _s(K.attributeNameCheck, A, p) || // Condition b) covers an `is` attribute whose value passes the
      // configured tagNameCheck while customized built-in elements are
      // allowed.
      A === "is" && K.allowCustomizedBuiltInElements && _s(K.tagNameCheck, H)
    );
  }, gt = Fe({}, ["annotation-xml", "color-profile", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "missing-glyph"]), ct = function(p) {
    return !gt[Dr(p)] && Ct(v, p);
  }, Nn = function(p, A, H, te) {
    if (pe && typeof b == "object" && typeof b.getAttributeType == "function" && !H)
      switch (b.getAttributeType(p, A)) {
        case "TrustedHTML":
          return fe(te);
        case "TrustedScriptURL":
          return we(te);
      }
    return te;
  }, ys = function(p, A, H, te) {
    try {
      return H ? p.setAttributeNS(H, A, te) : p.setAttribute(A, te), on(p) ? (Gt(p), !1) : !0;
    } catch {
      return Dt(A, p), !1;
    }
  }, vr = function(p) {
    Yt(De.beforeSanitizeAttributes, p, null);
    const A = p.attributes;
    if (!A || on(p))
      return;
    P = qs(De.uponSanitizeAttribute, P, X, f);
    const H = {
      attrName: "",
      attrValue: "",
      keepAttr: !0,
      allowedAttributes: P,
      forceKeepAttr: void 0
    };
    let te = A.length;
    const ae = nt(p.nodeName);
    for (; te--; ) {
      const ye = A[te], Ge = ye.name, st = ye.namespaceURI, Ke = ye.value, Et = nt(Ge), vs = Ke;
      let kt = Ge === "value" ? vs : am(vs), oi = !1;
      if (H.attrName = Et, H.attrValue = kt, H.keepAttr = !0, H.forceKeepAttr = void 0, Yt(De.uponSanitizeAttribute, p, H), kt = H.attrValue, ie && (Et === "id" || Et === "name") && rc(kt, Ce) !== 0 && (Dt(Ge, p, ye), kt = Ce + kt, oi = !0), ke && Ct(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, kt)) {
        Dt(Ge, p, ye);
        continue;
      }
      if (Et === "attributename" && sc(kt, "href")) {
        Dt(Ge, p, ye);
        continue;
      }
      if (!H.forceKeepAttr) {
        if (!H.keepAttr) {
          Dt(Ge, p, ye);
          continue;
        }
        if (!_e && Ct(xm, kt)) {
          Dt(Ge, p, ye);
          continue;
        }
        if (be && (kt = Ln(kt)), !lt(ae, Et, kt)) {
          Dt(Ge, p, ye);
          continue;
        }
        kt = Nn(ae, Et, st, kt), kt !== vs && ys(p, Ge, st, kt) && oi && nc(t.removed);
      }
    }
    Yt(De.afterSanitizeAttributes, p, null);
  }, an = function(p) {
    let A = null;
    const H = Hs(p);
    for (Yt(De.beforeSanitizeShadowDOM, p, null); A = H.nextNode(); )
      if (Yt(De.uponSanitizeShadowNode, A, null), Zt(A, p), vr(A), Kn(A.content) && an(A.content), se(A) === Qt.element) {
        const te = me(A);
        Kn(te) && (_t(te), an(te));
      }
    Yt(De.afterSanitizeShadowDOM, p, null);
  }, _t = function(p) {
    const A = [{
      node: p,
      shadow: null
    }];
    for (; A.length > 0; ) {
      const H = A.pop();
      if (H.shadow) {
        an(H.shadow);
        continue;
      }
      const te = H.node, ye = se(te) === Qt.element, Ge = R(te);
      if (Ge)
        for (let st = Ge.length - 1; st >= 0; --st)
          A.push({
            node: Ge[st],
            shadow: null
          });
      if (ye) {
        const st = S ? S(te) : null;
        if (typeof st == "string" && nt(st) === "template") {
          const Ke = te.content;
          Kn(Ke) && A.push({
            node: Ke,
            shadow: null
          });
        }
      }
      if (ye) {
        const st = me(te);
        Kn(st) && A.push({
          node: null,
          shadow: st
        }, {
          node: st,
          shadow: null
        });
      }
    }
  };
  return t.sanitize = function(V) {
    let p = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, A = null, H = null, te = null, ae = null;
    if (hr = !V, hr && (V = "<!-->"), typeof V != "string" && !gn(V) && (V = hm(V), typeof V != "string"))
      throw Ss("dirty is not a string, aborting");
    if (!t.isSupported)
      return V;
    U ? (D = z, P = f) : Bs(p), (De.uponSanitizeElement.length > 0 || De.uponSanitizeAttribute.length > 0) && (D = tn(D)), De.uponSanitizeAttribute.length > 0 && (P = tn(P)), t.removed = [];
    const ye = Ie && typeof V != "string" && gn(V);
    if (ye) {
      zs(V);
      const Ke = de(V);
      if (typeof Ke == "string") {
        const Et = nt(Ke);
        if (!D[Et] || G[Et])
          throw ms(V), Ss("root node is forbidden and cannot be sanitized in-place");
      }
      if (on(V))
        throw ms(V), Ss("root node is clobbered and cannot be sanitized in-place");
      try {
        _t(V);
      } catch (Et) {
        throw ms(V), Et;
      }
    } else if (gn(V))
      A = mn("<!---->"), H = A.ownerDocument.importNode(V, !0), H.nodeType === Qt.element && H.nodeName === "BODY" || H.nodeName === "HTML" ? A = H : A.appendChild(H), _t(A);
    else {
      if (!N && !be && !Be && // eslint-disable-next-line unicorn/prefer-includes
      V.indexOf("<") === -1)
        return pe && W ? fe(V) : V;
      if (A = mn(V), !A)
        return N ? null : W ? Le : "";
    }
    A && y && Gt(A.firstChild);
    const Ge = ye ? V : A;
    try {
      const Ke = Hs(Ge);
      for (; te = Ke.nextNode(); )
        Zt(te, Ge), vr(te), Kn(te.content) && an(te.content);
    } catch (Ke) {
      throw ye && (ms(V), Cs(t.removed, (Et) => {
        Et.element && Vn(Et.element);
      })), Ke;
    }
    if (ye)
      return Cs(t.removed, (Ke) => {
        Ke.element && Vn(Ke.element);
      }), be && js(V), V;
    if (N) {
      if (be && js(A), E)
        for (ae = ze.call(A.ownerDocument); A.firstChild; )
          ae.appendChild(A.firstChild);
      else
        ae = A;
      return (P.shadowroot || P.shadowrootmode) && (ae = vn.call(s, ae, !0)), ae;
    }
    let st = Be ? A.outerHTML : A.innerHTML;
    return Be && D["!doctype"] && A.ownerDocument && A.ownerDocument.doctype && A.ownerDocument.doctype.name && Ct(Tm, A.ownerDocument.doctype.name) && (st = "<!DOCTYPE " + A.ownerDocument.doctype.name + `>
` + st), be && (st = Ln(st)), pe && W ? fe(st) : st;
  }, t.setConfig = function() {
    let V = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    Bs(V), U = !0, z = D, f = P;
  }, t.clearConfig = function() {
    qn = null, U = !1, z = null, f = null, pe = Ae, Le = "";
  }, t.isValidAttribute = function(V, p, A) {
    qn || Bs({});
    const H = nt(V), te = nt(p);
    return lt(H, te, A);
  }, t.addHook = function(V, p) {
    typeof p == "function" && Wt(De, V) && Or(De[V], p);
  }, t.removeHook = function(V, p) {
    if (Wt(De, V)) {
      if (p !== void 0) {
        const A = im(De[V], p);
        return A === -1 ? void 0 : om(De[V], A, 1)[0];
      }
      return nc(De[V]);
    }
  }, t.removeHooks = function(V) {
    Wt(De, V) && (De[V] = []);
  }, t.removeAllHooks = function() {
    De = pc();
  }, t;
}
var Ha = Qu();
Ha.addHook("uponSanitizeElement", (e, t) => {
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
Ha.addHook("afterSanitizeAttributes", (e) => {
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
function Om(e) {
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
  return Ha.sanitize(e, t);
}
Ue.setOptions({
  renderer: new Ue.Renderer(),
  gfm: !0,
  breaks: !0
});
const Ai = (e) => Om(Ue(e || "")), mc = "*", Lm = /* @__PURE__ */ new Set(["null", "about:blank", ""]);
let un = null;
const Kr = (e) => e && !Lm.has(e) ? e : null, Nm = (e) => {
  if (!e) return null;
  try {
    return Kr(new URL(e).origin);
  } catch {
    return null;
  }
};
function ef() {
  if (un) return un;
  if (window.parent === window)
    return un = Kr(window.location.origin) || mc, un;
  try {
    const e = Kr(window.parent.location.origin);
    if (e)
      return un = e, un;
  } catch {
  }
  try {
    const e = window.location.ancestorOrigins, t = e && e.length ? Kr(e[0]) : null;
    if (t)
      return un = t, un;
  } catch {
  }
  return un = Nm(document.referrer) || mc, un;
}
function gc(e) {
  un = Kr(e) || un;
}
function Tt(e) {
  window.parent.postMessage(e, ef());
}
const Hi = "Start a new chat", _c = "Start a new chat? This ends the current one.", Pm = "Start new chat", Mm = "Cancel", yc = "Couldn't start a new chat. Please try again.", Dm = 15e3, Fm = ["aria-label"], $m = { class: "new-chat-confirm__question" }, Bm = { class: "new-chat-confirm__actions" }, Um = ["disabled"], zm = ["disabled"], Hm = /* @__PURE__ */ Ps({
  __name: "NewChatConfirm",
  props: {
    error: {},
    busy: { type: Boolean }
  },
  emits: ["confirm", "cancel"],
  setup(e, { emit: t }) {
    const n = t;
    return (s, r) => (w(), T("div", {
      class: "new-chat-confirm",
      role: "alertdialog",
      "aria-live": "polite",
      "aria-label": x(_c)
    }, [
      _("p", $m, Z(s.error || x(_c)), 1),
      _("div", Bm, [
        _("button", {
          type: "button",
          class: "new-chat-confirm__button",
          disabled: s.busy,
          onClick: r[0] || (r[0] = (i) => n("cancel"))
        }, Z(x(Mm)), 9, Um),
        _("button", {
          type: "button",
          class: "new-chat-confirm__button new-chat-confirm__button--primary",
          disabled: s.busy,
          onClick: r[1] || (r[1] = (i) => n("confirm"))
        }, Z(x(Pm)), 9, zm)
      ])
    ], 8, Fm));
  }
}), Ds = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [s, r] of t)
    n[s] = r;
  return n;
}, tf = /* @__PURE__ */ Ds(Hm, [["__scopeId", "data-v-6c78f353"]]), jm = { class: "askai" }, Wm = { class: "askai__bar" }, qm = ["value", "placeholder", "disabled", "aria-label", "onKeydown"], Vm = ["disabled", "title", "aria-label", "aria-expanded"], Km = { class: "askai__intro" }, Gm = { class: "askai__title" }, Ym = {
  key: 0,
  class: "askai__subtitle"
}, Xm = {
  key: 0,
  class: "askai__suggestions"
}, Zm = ["disabled", "onClick"], Jm = ["aria-live"], Qm = {
  key: 0,
  class: "askai__question"
}, eg = {
  key: 1,
  class: "askai__system"
}, tg = ["innerHTML"], ng = {
  key: 0,
  class: "askai__sources"
}, sg = ["title"], rg = {
  key: 0,
  class: "askai__thinking",
  role: "status",
  "aria-live": "polite"
}, ig = { class: "askai__thinking-text" }, og = {
  key: 1,
  class: "askai__foot"
}, ag = { key: 0 }, lg = {
  key: 1,
  class: "askai__brand",
  href: "https://chattermate.chat",
  target: "_blank",
  rel: "noopener noreferrer"
}, cg = /* @__PURE__ */ Ps({
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
    const n = e, s = t, r = oe(null), i = oe(null), o = oe(null), a = ["user", "bot", "agent", "system"], l = le(
      () => n.messages.map((C, M) => ({ message: C, index: M })).filter(({ message: C }) => a.includes(C.message_type))
    ), u = le(() => l.value.length > 0), c = (C) => {
      s("update:draft", C.target.value);
    }, b = () => {
      !(n.typingEnabled ?? n.inputEnabled) || !n.draft.trim() || s("send");
    }, k = (C) => {
      n.inputEnabled && s("ask", C);
    }, I = typeof navigator < "u" && /Mac|iPod|iPhone|iPad/.test(navigator.platform || ""), O = (C) => {
      if (C.key === "Escape") {
        C.preventDefault(), s("close");
        return;
      }
      const M = I ? C.metaKey && !C.ctrlKey : C.ctrlKey && !C.metaKey;
      n.hotkey && M && !C.altKey && (C.key === "k" || C.key === "K") && (C.preventDefault(), s("close"));
    }, j = () => {
      is(() => {
        var C;
        return (C = r.value) == null ? void 0 : C.focus();
      });
    };
    let ce = 0;
    const R = () => {
      if (!o.value) return;
      const C = o.value.closest(".askai"), M = i.value;
      if (!C || !M) return;
      const S = C.offsetHeight - M.offsetHeight, q = getComputedStyle(M), se = parseFloat(q.paddingTop) + parseFloat(q.paddingBottom), de = Math.ceil(S + se + o.value.getBoundingClientRect().height);
      Math.abs(de - ce) < 3 || (ce = de, Tt({ type: "WIDGET_RESIZE", height: de }));
    };
    let ue = null;
    const me = le(
      () => l.value.reduce((C, { message: M, index: S }) => C + n.displayText(S, M.message || "").length, 0)
    );
    return bt(
      () => [l.value.length, me.value, n.loading],
      () => is(() => {
        i.value && (i.value.scrollTop = i.value.scrollHeight);
      })
    ), bt(() => n.newChatArmed, () => is(() => R())), bt(() => n.active, (C) => {
      C && j();
    }), to(() => {
      n.active && j(), window.addEventListener("keydown", O), o.value && typeof ResizeObserver < "u" && (ue = new ResizeObserver(() => R()), ue.observe(o.value)), R();
    }), no(() => {
      window.removeEventListener("keydown", O), ue == null || ue.disconnect(), ue = null;
    }), (C, M) => (w(), T("div", jm, [
      _("div", Wm, [
        M[6] || (M[6] = _("svg", {
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
          _("path", { d: "M12 3l1.9 4.9L19 9.8l-4.9 1.9L12 17l-1.9-5.3L5 9.8l5.1-1.9L12 3z" })
        ], -1)),
        _("input", {
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
          onKeydown: ki(Es(b, ["prevent"]), ["enter"])
        }, null, 40, qm),
        C.canStartNewChat ? (w(), T("button", {
          key: 0,
          type: "button",
          class: Pe(["askai__new", { "askai__new--armed": C.newChatArmed }]),
          disabled: C.startingNewChat,
          title: x(Hi),
          "aria-label": x(Hi),
          "aria-expanded": C.newChatArmed,
          onClick: M[0] || (M[0] = (S) => s("newChat"))
        }, M[4] || (M[4] = [
          _("svg", {
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
            _("path", { d: "M12 20h9" }),
            _("path", { d: "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" })
          ], -1)
        ]), 10, Vm)) : ee("", !0),
        _("button", {
          type: "button",
          class: "askai__close",
          "aria-label": "Close",
          title: "Close (Esc)",
          onClick: M[1] || (M[1] = (S) => s("close"))
        }, M[5] || (M[5] = [
          _("span", { class: "askai__kbd" }, "Esc", -1)
        ]))
      ]),
      C.newChatArmed && C.canStartNewChat ? (w(), ss(tf, {
        key: 0,
        busy: C.startingNewChat,
        error: C.newChatError,
        onConfirm: M[2] || (M[2] = (S) => s("confirmNewChat")),
        onCancel: M[3] || (M[3] = (S) => s("cancelNewChat"))
      }, null, 8, ["busy", "error"])) : ee("", !0),
      _("div", {
        ref_key: "bodyEl",
        ref: i,
        class: "askai__body"
      }, [
        _("div", {
          ref_key: "contentEl",
          ref: o,
          class: "askai__content"
        }, [
          u.value ? (w(), T(Oe, { key: 1 }, [
            (w(!0), T(Oe, null, ft(l.value, ({ message: S, index: q }) => (w(), T("div", {
              key: q,
              class: "askai__turn",
              "aria-live": C.isStreaming(q) ? "off" : "polite"
            }, [
              S.message_type === "user" ? (w(), T("p", Qm, Z(S.message), 1)) : S.message_type === "system" ? (w(), T("p", eg, Z(S.message), 1)) : (w(), T(Oe, { key: 2 }, [
                _("div", {
                  class: Pe(["askai__answer", { "askai__answer--streaming": C.isStreaming(q) }]),
                  innerHTML: x(Ai)(C.isStreaming(q) ? C.displayText(q, S.message || "") : S.message || "")
                }, null, 10, tg),
                C.showCitations && !C.isStreaming(q) && S.sources && S.sources.length ? (w(), T("div", ng, [
                  M[9] || (M[9] = _("span", { class: "askai__label" }, "Sources", -1)),
                  (w(!0), T(Oe, null, ft(S.sources, (se, de) => (w(), T("span", {
                    key: de,
                    class: "askai__source",
                    title: C.citationTooltip(se)
                  }, Z(C.citationLabel(se)), 9, sg))), 128))
                ])) : ee("", !0)
              ], 64))
            ], 8, Jm))), 128)),
            C.loading ? (w(), T("div", rg, [
              M[10] || (M[10] = _("span", { class: "askai__dot" }, null, -1)),
              M[11] || (M[11] = _("span", { class: "askai__dot" }, null, -1)),
              M[12] || (M[12] = _("span", { class: "askai__dot" }, null, -1)),
              _("span", ig, Z(C.showCitations ? "Searching the knowledge base" : "Thinking"), 1)
            ])) : ee("", !0)
          ], 64)) : (w(), T(Oe, { key: 0 }, [
            _("div", Km, [
              _("h2", Gm, Z(C.welcomeTitle || `Ask ${C.agentName}`), 1),
              C.welcomeSubtitle ? (w(), T("p", Ym, Z(C.welcomeSubtitle), 1)) : ee("", !0)
            ]),
            C.suggestions.length && !C.draft.trim() ? (w(), T("div", Xm, [
              M[8] || (M[8] = _("p", { class: "askai__label" }, "Suggested", -1)),
              (w(!0), T(Oe, null, ft(C.suggestions, (S) => (w(), T("button", {
                key: S,
                type: "button",
                class: "askai__suggestion",
                disabled: !C.inputEnabled,
                onClick: (q) => k(S)
              }, [
                _("span", null, Z(S), 1),
                M[7] || (M[7] = _("svg", {
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
                  _("path", { d: "M5 12h14M13 6l6 6-6 6" })
                ], -1))
              ], 8, Zm))), 128))
            ])) : ee("", !0)
          ], 64))
        ], 512)
      ], 512),
      C.disclaimer || C.showBranding ? (w(), T("div", og, [
        C.disclaimer ? (w(), T("span", ag, Z(C.disclaimer), 1)) : ee("", !0),
        C.showBranding ? (w(), T("a", lg, "Powered by ChatterMate")) : ee("", !0)
      ])) : ee("", !0)
    ]));
  }
}), ug = /* @__PURE__ */ Ds(cg, [["__scopeId", "data-v-68aaa0d9"]]), fg = 40;
function ji(e) {
  if (typeof e == "number" || typeof e == "boolean") return String(e);
  if (typeof e != "string") return null;
  const t = e.trim();
  return t && t.length <= fg && !t.includes(`
`) ? t : null;
}
function hg(e) {
  var s, r;
  const t = ji((s = e.preview) == null ? void 0 : s.before), n = ji((r = e.preview) == null ? void 0 : r.after);
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
function dg(e, t, n, s) {
  if (!s) return { approve: e, decline: "Not now" };
  const r = ji(t), i = ji(n);
  return {
    approve: i ? `Change to ${i}` : "Change it",
    decline: r ? `Keep ${r}` : "Keep current"
  };
}
const pg = ["aria-label"], mg = { class: "cm-action-head" }, gg = { class: "cm-action-row before" }, _g = { class: "cm-action-text" }, yg = { class: "cm-action-row after" }, vg = { class: "cm-action-text" }, bg = {
  key: 1,
  class: "cm-action-args"
}, wg = { class: "cm-action-buttons" }, kg = /* @__PURE__ */ Ps({
  __name: "ActionConfirmCard",
  props: {
    pending: {}
  },
  emits: ["approve", "decline"],
  setup(e, { emit: t }) {
    const n = e, s = t, r = le(() => !!n.pending.preview);
    function i(u) {
      return u == null || u === "" ? "—" : typeof u == "string" ? u : JSON.stringify(u, null, 2);
    }
    function o(u) {
      const c = u.replace(/[_-]+/g, " ").trim();
      return c.charAt(0).toUpperCase() + c.slice(1);
    }
    const a = le(
      () => n.pending.details ?? Object.entries(n.pending.request.args || {}).map(([u, c]) => ({ key: o(u), value: i(c) }))
    ), l = le(
      () => {
        var u, c;
        return dg(n.pending.request.label, (u = n.pending.preview) == null ? void 0 : u.before, (c = n.pending.preview) == null ? void 0 : c.after, r.value);
      }
    );
    return (u, c) => {
      var b, k;
      return w(), T("div", {
        class: "cm-action-confirm",
        role: "group",
        "aria-label": u.pending.request.label
      }, [
        _("div", mg, Z(u.pending.request.label) + "?", 1),
        r.value ? (w(), T(Oe, { key: 0 }, [
          _("div", gg, [
            c[2] || (c[2] = _("span", { class: "cm-action-tag" }, "Current", -1)),
            _("span", _g, Z(i((b = u.pending.preview) == null ? void 0 : b.before)), 1)
          ]),
          _("div", yg, [
            c[3] || (c[3] = _("span", { class: "cm-action-tag" }, "New", -1)),
            _("span", vg, Z(i((k = u.pending.preview) == null ? void 0 : k.after)), 1)
          ])
        ], 64)) : a.value.length ? (w(), T("dl", bg, [
          (w(!0), T(Oe, null, ft(a.value, (I) => (w(), T(Oe, {
            key: I.key
          }, [
            _("dt", null, Z(I.key), 1),
            _("dd", null, Z(I.value), 1)
          ], 64))), 128))
        ])) : ee("", !0),
        _("div", wg, [
          _("button", {
            type: "button",
            class: "cm-action-apply",
            onClick: c[0] || (c[0] = (I) => s("approve"))
          }, Z(l.value.approve), 1),
          _("button", {
            type: "button",
            class: "cm-action-cancel",
            onClick: c[1] || (c[1] = (I) => s("decline"))
          }, Z(l.value.decline), 1)
        ])
      ], 8, pg);
    };
  }
}), Tg = /* @__PURE__ */ Ds(kg, [["__scopeId", "data-v-bdc9ad66"]]), Ag = {
  key: 0,
  class: "cm-receipt-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, Sg = {
  key: 1,
  class: "cm-receipt-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, xg = {
  key: 2,
  class: "cm-receipt-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, Eg = { class: "cm-visually-hidden" }, Cg = { class: "cm-receipt-text" }, Rg = /* @__PURE__ */ Ps({
  __name: "ActionReceiptLine",
  props: {
    receipt: {}
  },
  setup(e) {
    return (t, n) => (w(), T("div", {
      class: Pe(["cm-receipt", t.receipt.tone]),
      role: "status"
    }, [
      t.receipt.tone === "done" ? (w(), T("svg", Ag, n[0] || (n[0] = [
        _("circle", {
          cx: "12",
          cy: "12",
          r: "10",
          class: "fill"
        }, null, -1),
        _("path", {
          d: "M7.5 12.5l3 3 6-6.5",
          class: "tick"
        }, null, -1)
      ]))) : t.receipt.tone === "failed" ? (w(), T("svg", Sg, n[1] || (n[1] = [
        _("circle", {
          cx: "12",
          cy: "12",
          r: "9",
          class: "ring"
        }, null, -1),
        _("path", {
          d: "M12 7.5v5.5M12 16.5v.01",
          class: "mark"
        }, null, -1)
      ]))) : (w(), T("svg", xg, n[2] || (n[2] = [
        _("circle", {
          cx: "12",
          cy: "12",
          r: "9",
          class: "ring"
        }, null, -1),
        _("path", {
          d: "M8 12h8",
          class: "mark"
        }, null, -1)
      ]))),
      _("span", Eg, Z(t.receipt.tone === "done" ? "Done:" : t.receipt.tone === "failed" ? "Failed:" : "Skipped:"), 1),
      _("span", Cg, Z(t.receipt.text), 1)
    ], 2));
  }
}), Ig = /* @__PURE__ */ Ds(Rg, [["__scopeId", "data-v-be379090"]]), Og = { class: "cm-plan-pin" }, Lg = ["aria-label"], Ng = ["aria-expanded"], Pg = { class: "cm-plan-label" }, Mg = { class: "cm-plan-name" }, Dg = {
  key: 0,
  class: "cm-plan-now"
}, Fg = { class: "cm-plan-count" }, $g = ["aria-valuenow", "aria-valuemax", "aria-label"], Bg = {
  key: 0,
  class: "cm-plan-steps"
}, Ug = ["aria-current"], zg = {
  key: 0,
  class: "cm-plan-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, Hg = {
  key: 1,
  class: "cm-plan-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, jg = {
  key: 2,
  class: "cm-plan-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, Wg = { class: "cm-plan-title" }, qg = {
  key: 3,
  class: "cm-visually-hidden"
}, Vg = { class: "cm-plan-actions" }, Kg = /* @__PURE__ */ Ps({
  __name: "JourneyPlan",
  props: {
    progress: {}
  },
  emits: ["skip", "hide"],
  setup(e, { emit: t }) {
    const n = e, s = t, r = oe(!1);
    bt(() => n.progress.finished, (l) => {
      l && (r.value = !1);
    });
    const i = le(() => Math.min(n.progress.index, n.progress.count)), o = le(() => n.progress.count ? Math.round(i.value / n.progress.count * 100) : 0), a = le(
      () => n.progress.titles.map((l, u) => ({
        title: l,
        state: u < i.value ? "done" : u === n.progress.index ? "now" : "todo"
      }))
    );
    return (l, u) => (w(), T("div", Og, [
      _("section", {
        class: Pe(["cm-plan", { finished: l.progress.finished }]),
        "aria-label": `Guide: ${l.progress.name}`
      }, [
        _("button", {
          type: "button",
          class: "cm-plan-head",
          "aria-expanded": r.value,
          onClick: u[0] || (u[0] = (c) => r.value = !r.value)
        }, [
          _("span", Pg, [
            _("span", Mg, Z(l.progress.name), 1),
            !l.progress.finished && l.progress.title ? (w(), T("span", Dg, Z(l.progress.title), 1)) : ee("", !0)
          ]),
          _("span", Fg, Z(l.progress.finished ? "Done" : `${i.value} of ${l.progress.count}`), 1),
          (w(), T("svg", {
            class: Pe(["cm-plan-chevron", { open: r.value }]),
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
            _("path", { d: "M6 9l6 6 6-6" }, null, -1)
          ]), 2))
        ], 8, Ng),
        _("div", {
          class: "cm-plan-bar",
          role: "progressbar",
          "aria-valuenow": i.value,
          "aria-valuemin": "0",
          "aria-valuemax": l.progress.count,
          "aria-label": `${i.value} of ${l.progress.count} done`
        }, [
          _("span", {
            style: Ee({ width: `${o.value}%` })
          }, null, 4)
        ], 8, $g),
        r.value ? (w(), T(Oe, { key: 0 }, [
          a.value.length ? (w(), T("ol", Bg, [
            (w(!0), T(Oe, null, ft(a.value, (c, b) => (w(), T("li", {
              key: b,
              class: Pe(c.state),
              "aria-current": c.state === "now" ? "step" : void 0
            }, [
              c.state === "done" ? (w(), T("svg", zg, u[4] || (u[4] = [
                _("circle", {
                  cx: "12",
                  cy: "12",
                  r: "10",
                  class: "fill"
                }, null, -1),
                _("path", {
                  d: "M7.5 12.5l3 3 6-6.5",
                  class: "tick"
                }, null, -1)
              ]))) : c.state === "now" ? (w(), T("svg", Hg, u[5] || (u[5] = [
                _("circle", {
                  cx: "12",
                  cy: "12",
                  r: "9",
                  class: "ring"
                }, null, -1),
                _("circle", {
                  cx: "12",
                  cy: "12",
                  r: "4",
                  class: "fill"
                }, null, -1)
              ]))) : (w(), T("svg", jg, u[6] || (u[6] = [
                _("circle", {
                  cx: "12",
                  cy: "12",
                  r: "9",
                  class: "ring todo"
                }, null, -1)
              ]))),
              _("span", Wg, Z(c.title), 1),
              c.state === "done" ? (w(), T("span", qg, "(done)")) : ee("", !0)
            ], 10, Ug))), 128))
          ])) : ee("", !0),
          _("div", Vg, [
            l.progress.skippable ? (w(), T("button", {
              key: 0,
              type: "button",
              onClick: u[1] || (u[1] = (c) => s("skip"))
            }, "Skip this step")) : ee("", !0),
            _("button", {
              type: "button",
              onClick: u[2] || (u[2] = (c) => s("hide"))
            }, "Hide guide")
          ])
        ], 64)) : ee("", !0)
      ], 10, Lg)
    ]));
  }
}), Gg = /* @__PURE__ */ Ds(Kg, [["__scopeId", "data-v-016d08e3"]]), Yg = {
  class: "cm-replies",
  role: "group",
  "aria-label": "Suggested replies"
}, Xg = ["disabled", "onClick"], Zg = /* @__PURE__ */ Ps({
  __name: "SuggestedReplies",
  props: {
    chips: {},
    disabled: { type: Boolean }
  },
  emits: ["pick"],
  setup(e, { emit: t }) {
    const n = t;
    return (s, r) => (w(), T("div", Yg, [
      (w(!0), T(Oe, null, ft(s.chips, (i) => (w(), T("button", {
        key: i.label,
        type: "button",
        class: "cm-reply",
        disabled: s.disabled,
        onClick: (o) => n("pick", i)
      }, Z(i.label), 9, Xg))), 128))
    ]));
  }
}), Jg = /* @__PURE__ */ Ds(Zg, [["__scopeId", "data-v-7b650713"]]);
function Qg(e) {
  const t = oe([]);
  function n(r) {
    t.value.push({ after: e.value.length, receipt: hg(r) });
  }
  function s(r) {
    return t.value.filter((i) => i.after === r).map((i) => i.receipt);
  }
  return bt(() => e.value.length, (r) => {
    r === 0 ? t.value = [] : t.value.some((i) => i.after > r) && (t.value = t.value.filter((i) => i.after <= r));
  }), { receipts: t, addReceipt: n, receiptsAfter: s };
}
const e_ = "Please don't paste passwords or keys here.", t_ = [
  /\bsk-(?:proj-|ant-)?[A-Za-z0-9_-]{20,}/,
  /\bcmat_[A-Za-z0-9_-]{16,}/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{30,}/,
  /\bxox[abposr]-[A-Za-z0-9-]{10,}/
], n_ = /\b(password|passwd|pwd|passcode|api[ _-]?key|secret)\s*(?:is|:|=)\s*\S+/i, s_ = /\b(?:\d[ -]?){12,18}\d\b/g;
function r_(e) {
  let t = 0;
  for (let n = 0; n < e.length; n++) {
    let s = Number(e[e.length - 1 - n]);
    n % 2 === 1 && (s *= 2, s > 9 && (s -= 9)), t += s;
  }
  return t % 10 === 0;
}
function i_(e) {
  return e ? t_.some((t) => t.test(e)) || n_.test(e) ? !0 : (e.match(s_) || []).some((t) => {
    const n = t.replace(/\D/g, "");
    return n.length >= 13 && n.length <= 19 && r_(n);
  }) : !1;
}
const Fr = [
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
], o_ = (e) => (e || "").split("").reduce((t, n) => t + n.charCodeAt(0), 0) % Fr.length, a_ = (e) => {
  const t = Fr[(e % Fr.length + Fr.length) % Fr.length];
  return {
    background: `
            radial-gradient(circle at 32% 28%, rgba(255,255,255,0.22) 0%, transparent 42%),
            radial-gradient(circle at 68% 72%, rgba(0,0,0,0.25) 0%, transparent 38%),
            radial-gradient(ellipse at 50% 50%, ${t.stops})
        `.trim(),
    boxShadow: `0 4px 28px ${t.glow}, inset 0 1px 0 rgba(255,255,255,0.15)`,
    borderRadius: "50%"
  };
}, l_ = (e, t) => {
  const n = typeof t == "number" && Number.isFinite(t) ? t : o_(e);
  return a_(n);
}, vc = (e) => {
  var t;
  return !!((t = e == null ? void 0 : e.attributes) != null && t.end_chat);
}, bc = "AI can make mistakes. Check important info.";
function c_(e, t = !1) {
  return e !== !1 && !t;
}
const Uo = {
  ai: "Online · replies instantly",
  human: "Online · usually replies in a few minutes",
  away: "Away · we'll reply when we're back"
};
function u_(e, t = !1) {
  return (t ? "human" : (e == null ? void 0 : e.mode) ?? "ai") === "ai" ? { text: Uo.ai, online: !0 } : (e == null ? void 0 : e.available) !== !1 ? { text: Uo.human, online: !0 } : { text: Uo.away, online: !1 };
}
const nf = (e) => !!e && (/^https?:\/\//i.test(e) || e.startsWith("data:")), f_ = (e, t) => e ? nf(e) || e.startsWith("blob:") ? e : `${t.replace(/\/api\/v1\/?$/, "")}${e.startsWith("/") ? "" : "/"}${e}` : "";
function wc() {
  return typeof window < "u" && window.APP_CONFIG ? window.APP_CONFIG : {};
}
const Ns = {
  get API_URL() {
    return wc().API_URL || "https://api.chattermate.chat/api/v1";
  },
  get WS_URL() {
    return wc().WS_URL || "wss://api.chattermate.chat";
  }
};
function Wi(e) {
  return f_(e, Ns.API_URL);
}
const sf = "ctid", h_ = "identity_expired", d_ = "invalid_token", kc = 0.8, p_ = 720 * 60 * 1e3, zo = 30 * 1e3, Ho = 1e3, as = (e) => {
  if (typeof e != "string") return e ? String(e) : null;
  const t = e.trim();
  return !t || t === "undefined" || t === "null" ? null : t;
}, Si = (e) => {
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
}, m_ = async (e) => {
  var t, n;
  try {
    return (n = (t = await e.json()) == null ? void 0 : t.detail) == null ? void 0 : n.code;
  } catch {
    return;
  }
}, qi = (e = sf) => ({
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
}), g_ = () => ({
  read: () => null,
  write: () => {
  },
  clear: () => {
  }
});
function __(e = {}) {
  const t = e.store ?? qi(), n = oe(null);
  let s = null, r = null;
  const i = () => {
    s && (clearTimeout(s), s = null);
  }, o = () => {
    const j = Si(n.value);
    return j != null && j.exp ? Number(j.exp) - Math.floor(Date.now() / Ho) : null;
  }, a = () => {
    const j = Si(n.value);
    if (!(j != null && j.exp)) return !1;
    const ce = j.iat ? Number(j.exp) - Number(j.iat) : 0, R = o() ?? 0;
    return ce <= 0 ? R <= 0 : R <= ce * (1 - kc);
  }, l = (j, { persist: ce = !0 } = {}) => {
    var me, C;
    const R = as(j), ue = !!n.value;
    if (i(), n.value = R, !R) {
      t.clear(), ue && ((me = e.onTokenCleared) == null || me.call(e));
      return;
    }
    ce && (t.write(R), (C = e.onTokenChanged) == null || C.call(e, R)), b();
  }, u = async (j) => {
    if (!n.value || !j) return !1;
    if (r) return r;
    const ce = n.value;
    return r = (async () => {
      var R, ue;
      try {
        const me = await fetch(`${Ns.API_URL}/refresh-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ce}`
          },
          body: JSON.stringify({ widget_id: j })
        });
        if (me.status === 401)
          return await m_(me) !== d_ && ((R = e.onIdentityExpired) == null || R.call(e)), !1;
        if (!me.ok)
          return b(zo), !1;
        const C = await me.json(), M = as((ue = C == null ? void 0 : C.data) == null ? void 0 : ue.token);
        return M ? (l(M), !0) : !1;
      } catch {
        return b(zo), !1;
      } finally {
        r = null;
      }
    })(), r;
  }, c = async (j) => n.value ? a() ? u(j) : !0 : !1, b = (j) => {
    i();
    const ce = Si(n.value);
    if (!(ce != null && ce.exp) || !(ce != null && ce.iat)) return;
    const R = (Number(ce.exp) - Number(ce.iat)) * Ho, ue = (o() ?? 0) * Ho, me = j ?? Math.min(
      p_,
      Math.max(0, ue - R * (1 - kc))
    );
    s = setTimeout(() => {
      s = null, c(k).then((C) => {
        b(C ? void 0 : zo);
      });
    }, me);
  };
  let k = "";
  return {
    token: n,
    start: (j, ce) => {
      k = j;
      const R = as(ce) || t.read();
      l(R, { persist: !1 }), R && t.write(R);
    },
    stop: () => {
      i(), r = null;
    },
    setToken: l,
    ensureFresh: c
  };
}
const lr = window.__CM_FRAME__, rf = "null";
let Is = !1, of = !1, af = null;
const Vi = () => !!lr, Rs = () => !lr || Is && !of, lf = () => af, cf = (e) => {
  typeof e == "string" && e && (af = e);
}, uf = (e) => lr ? Is ? g_() : qi(`${sf}:${e}`) : qi(), y_ = () => new Promise((e) => {
  const t = (n) => {
    var r;
    if (n.source !== window.parent || ((r = n.data) == null ? void 0 : r.type) !== "HOST_INIT") return;
    window.removeEventListener("message", t);
    const s = n.origin === rf;
    e({
      origin: n.origin,
      // An opaque host can't be addressed, so nothing it hands over can be
      // answered safely: such a frame runs as an anonymous visitor.
      token: s ? null : as(n.data.token),
      pageUrl: typeof n.data.pageUrl == "string" ? n.data.pageUrl : null
    });
  };
  window.addEventListener("message", t), window.parent.postMessage({ type: "FRAME_READY" }, "*");
}), v_ = async (e) => {
  var t;
  try {
    const n = await e.json();
    return ((t = n == null ? void 0 : n.detail) == null ? void 0 : t.code) || "unavailable";
  } catch {
    return "unavailable";
  }
}, Tc = () => {
  const e = document.getElementById("app");
  e && (e.textContent = "Chat is unavailable right now.");
};
async function b_() {
  if (!lr) return !0;
  const e = new URL(window.location.href).searchParams;
  Is = e.get("host") === "1" && window.parent !== window;
  let t, n = null;
  if (Is) {
    const o = await y_();
    o.origin !== rf ? (gc(o.origin), n = o.origin) : (of = !0, gc("*")), cf(o.pageUrl), t = o.token;
  } else
    t = uf(lr.widgetId).read();
  let s;
  try {
    s = await fetch(`${Ns.API_URL}/widgets/${encodeURIComponent(lr.widgetId)}/bootstrap`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...t ? { Authorization: `Bearer ${t}` } : {}
      },
      body: JSON.stringify({ host_origin: n, source: e.get("source") })
    });
  } catch {
    return Is ? Tt({ type: "WIDGET_ERROR", code: "unavailable" }) : Tc(), !1;
  }
  if (!s.ok) {
    const o = await v_(s);
    return Is ? Tt({ type: "WIDGET_ERROR", code: o }) : Tc(), !1;
  }
  const r = await s.json();
  window.__INITIAL_DATA__ = r;
  const i = as(r.initialToken);
  return Rs() && i && i !== t && Tt({ type: "TOKEN_UPDATE", token: i }), !0;
}
const w_ = () => {
  Is && Tt({ type: "WIDGET_READY" });
};
function k_(e) {
  const t = le(() => ({
    backgroundColor: "var(--cm-card)",
    color: "var(--cm-text)"
  })), n = le(() => ({
    backgroundColor: e.value.chat_bubble_color || "#C9F24E",
    color: or(e.value.chat_bubble_color || "#C9F24E") ? "#FFFFFF" : "#000000"
  })), s = le(() => ({
    backgroundColor: "var(--cm-agent-bg)",
    color: "var(--cm-text)"
  })), r = le(() => ({
    backgroundColor: "var(--cm-accent)",
    color: "var(--cm-on-accent)"
  })), i = le(() => ({
    color: "var(--cm-text)"
  })), o = le(() => ({
    borderBottom: "1px solid var(--cm-hairline)"
  })), a = le(() => Wi(e.value.photo_url)), l = le(() => {
    const u = e.value.chat_background_color || "#ffffff";
    return {
      boxShadow: `0 8px 5px ${or(u) ? "rgba(0, 0, 0, 0.24)" : "rgba(0, 0, 0, 0.12)"}`
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
const T_ = /* @__PURE__ */ new Set(["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]), A_ = /* @__PURE__ */ new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);
[...T_, ...A_];
function S_(e, t) {
  const n = oe([]), s = oe(!1), r = oe(null), i = (M) => {
    if (M === 0) return "0 Bytes";
    const S = 1024, q = ["Bytes", "KB", "MB", "GB"], se = Math.floor(Math.log(M) / Math.log(S));
    return parseFloat((M / Math.pow(S, se)).toFixed(2)) + " " + q[se];
  }, o = (M) => M.startsWith("image/"), a = (M) => M ? Wi(M) : "", l = (M) => {
    const S = M.file_url || M.url;
    return S ? Wi(S) : "";
  }, u = async (M) => {
    const S = M.target;
    S.files && S.files.length > 0 && (await j(Array.from(S.files)), S.value = "");
  }, c = async (M) => {
    var q;
    M.preventDefault();
    const S = (q = M.dataTransfer) == null ? void 0 : q.files;
    S && S.length > 0 && await j(Array.from(S));
  }, b = (M) => {
    M.preventDefault();
  }, k = (M) => {
    M.preventDefault();
  }, I = async (M) => {
    var se;
    const S = (se = M.clipboardData) == null ? void 0 : se.items;
    if (!S) return;
    const q = [];
    for (const de of Array.from(S))
      if (de.kind === "file") {
        const pe = de.getAsFile();
        pe && q.push(pe);
      }
    q.length > 0 && await j(q);
  }, O = async (M, S = 500) => new Promise((q, se) => {
    const de = new FileReader();
    de.onload = (pe) => {
      var Ae;
      const Le = new Image();
      Le.onload = () => {
        const Ve = document.createElement("canvas");
        let $e = Le.width, et = Le.height;
        const fe = 1920;
        ($e > fe || et > fe) && ($e > et ? (et = et / $e * fe, $e = fe) : ($e = $e / et * fe, et = fe)), Ve.width = $e, Ve.height = et;
        const we = Ve.getContext("2d");
        if (!we) {
          se(new Error("Failed to get canvas context"));
          return;
        }
        we.drawImage(Le, 0, 0, $e, et);
        let ge = 0.9;
        const Ye = () => {
          Ve.toBlob((Xe) => {
            if (!Xe) {
              se(new Error("Failed to compress image"));
              return;
            }
            if (Xe.size / 1024 > S && ge > 0.3)
              ge -= 0.1, Ye();
            else {
              const ze = new FileReader();
              ze.onload = () => {
                const Lt = ze.result.split(",")[1];
                q({ blob: Xe, base64: Lt });
              }, ze.readAsDataURL(Xe);
            }
          }, M.type === "image/png" ? "image/png" : "image/jpeg", ge);
        };
        Ye();
      }, Le.onerror = () => se(new Error("Failed to load image")), Le.src = (Ae = pe.target) == null ? void 0 : Ae.result;
    }, de.onerror = () => se(new Error("Failed to read file")), de.readAsDataURL(M);
  }), j = async (M) => {
    if (n.value.length >= 3) {
      alert("Maximum 3 files allowed per message");
      return;
    }
    const pe = 3 - n.value.length, Le = M.slice(0, pe);
    M.length > pe && alert(`Only ${pe} more file(s) can be uploaded. Maximum 3 files per message.`);
    for (const Ae of Le)
      try {
        if (n.value.some((fe) => fe.filename === Ae.name)) {
          console.warn(`File ${Ae.name} is already selected`), alert(`File "${Ae.name}" is already selected`);
          continue;
        }
        const $e = Ae.type.startsWith("image/"), et = $e ? 5242880 : 10485760;
        if (Ae.size > et) {
          const fe = et / 1048576;
          console.error(`File ${Ae.name} is too large. Maximum size is ${fe}MB`), alert(`File "${Ae.name}" is too large. Maximum size for ${$e ? "images" : "documents"} is ${fe}MB`);
          continue;
        }
        if ($e)
          try {
            const { blob: fe, base64: we } = await O(Ae, 500), ge = fe.size;
            console.log(`Compressed ${Ae.name}: ${(Ae.size / 1024).toFixed(2)}KB → ${(ge / 1024).toFixed(2)}KB`), n.value.push({
              content: we,
              filename: Ae.name,
              type: Ae.type,
              size: ge,
              url: URL.createObjectURL(fe),
              file_url: URL.createObjectURL(fe)
            });
          } catch (fe) {
            console.error("Image compression failed, uploading original:", fe);
            const we = new FileReader();
            we.onload = (ge) => {
              var rt;
              const Xe = ((rt = ge.target) == null ? void 0 : rt.result).split(",")[1];
              n.value.push({
                content: Xe,
                filename: Ae.name,
                type: Ae.type,
                size: Ae.size,
                url: URL.createObjectURL(Ae),
                file_url: URL.createObjectURL(Ae)
              });
            }, we.readAsDataURL(Ae);
          }
        else {
          const fe = new FileReader();
          fe.onload = (we) => {
            var Xe;
            const Ye = ((Xe = we.target) == null ? void 0 : Xe.result).split(",")[1];
            n.value.push({
              content: Ye,
              filename: Ae.name,
              type: Ae.type || "application/octet-stream",
              size: Ae.size,
              url: "",
              file_url: ""
            });
          }, fe.readAsDataURL(Ae);
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
    handleFileSelect: u,
    handleDrop: c,
    handleDragOver: b,
    handleDragLeave: k,
    handlePaste: I,
    uploadFiles: j,
    removeAttachment: async (M) => {
      const S = n.value[M];
      if (S) {
        try {
          let q = S.url;
          if (q.startsWith("/uploads/") ? q = q.substring(9) : q.startsWith("/") && (q = q.substring(1)), nf(q))
            try {
              q = new URL(q).pathname.replace(/^\/+/, "");
            } catch {
            }
          const se = {};
          e.value && (se.Authorization = `Bearer ${e.value}`);
          const de = await fetch(`${Ns.API_URL}/files/upload/${q}`, {
            method: "DELETE",
            headers: se
          });
          if (de.ok)
            console.log("File deleted successfully from backend.");
          else {
            const pe = await de.json();
            console.error("Failed to delete file:", pe.detail);
          }
        } catch (q) {
          console.error("Error calling delete API:", q);
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
const In = /* @__PURE__ */ Object.create(null);
In.open = "0";
In.close = "1";
In.ping = "2";
In.pong = "3";
In.message = "4";
In.upgrade = "5";
In.noop = "6";
const xi = /* @__PURE__ */ Object.create(null);
Object.keys(In).forEach((e) => {
  xi[In[e]] = e;
});
const ha = { type: "error", data: "parser error" }, ff = typeof Blob == "function" || typeof Blob < "u" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]", hf = typeof ArrayBuffer == "function", df = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e && e.buffer instanceof ArrayBuffer, ja = ({ type: e, data: t }, n, s) => ff && t instanceof Blob ? n ? s(t) : Ac(t, s) : hf && (t instanceof ArrayBuffer || df(t)) ? n ? s(t) : Ac(new Blob([t]), s) : s(In[e] + (t || "")), Ac = (e, t) => {
  const n = new FileReader();
  return n.onload = function() {
    const s = n.result.split(",")[1];
    t("b" + (s || ""));
  }, n.readAsDataURL(e);
};
function Sc(e) {
  return e instanceof Uint8Array ? e : e instanceof ArrayBuffer ? new Uint8Array(e) : new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
}
let jo;
function x_(e, t) {
  if (ff && e.data instanceof Blob)
    return e.data.arrayBuffer().then(Sc).then(t);
  if (hf && (e.data instanceof ArrayBuffer || df(e.data)))
    return t(Sc(e.data));
  ja(e, !1, (n) => {
    jo || (jo = new TextEncoder()), t(jo.encode(n));
  });
}
const xc = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", $r = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (let e = 0; e < xc.length; e++)
  $r[xc.charCodeAt(e)] = e;
const E_ = (e) => {
  let t = e.length * 0.75, n = e.length, s, r = 0, i, o, a, l;
  e[e.length - 1] === "=" && (t--, e[e.length - 2] === "=" && t--);
  const u = new ArrayBuffer(t), c = new Uint8Array(u);
  for (s = 0; s < n; s += 4)
    i = $r[e.charCodeAt(s)], o = $r[e.charCodeAt(s + 1)], a = $r[e.charCodeAt(s + 2)], l = $r[e.charCodeAt(s + 3)], c[r++] = i << 2 | o >> 4, c[r++] = (o & 15) << 4 | a >> 2, c[r++] = (a & 3) << 6 | l & 63;
  return u;
}, C_ = typeof ArrayBuffer == "function", Wa = (e, t) => {
  if (typeof e != "string")
    return {
      type: "message",
      data: pf(e, t)
    };
  const n = e.charAt(0);
  return n === "b" ? {
    type: "message",
    data: R_(e.substring(1), t)
  } : xi[n] ? e.length > 1 ? {
    type: xi[n],
    data: e.substring(1)
  } : {
    type: xi[n]
  } : ha;
}, R_ = (e, t) => {
  if (C_) {
    const n = E_(e);
    return pf(n, t);
  } else
    return { base64: !0, data: e };
}, pf = (e, t) => {
  switch (t) {
    case "blob":
      return e instanceof Blob ? e : new Blob([e]);
    case "arraybuffer":
    default:
      return e instanceof ArrayBuffer ? e : e.buffer;
  }
}, mf = "", I_ = (e, t) => {
  const n = e.length, s = new Array(n);
  let r = 0;
  e.forEach((i, o) => {
    ja(i, !1, (a) => {
      s[o] = a, ++r === n && t(s.join(mf));
    });
  });
}, O_ = (e, t) => {
  const n = e.split(mf), s = [];
  for (let r = 0; r < n.length; r++) {
    const i = Wa(n[r], t);
    if (s.push(i), i.type === "error")
      break;
  }
  return s;
};
function L_() {
  return new TransformStream({
    transform(e, t) {
      x_(e, (n) => {
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
let Wo;
function mi(e) {
  return e.reduce((t, n) => t + n.length, 0);
}
function gi(e, t) {
  if (e[0].length === t)
    return e.shift();
  const n = new Uint8Array(t);
  let s = 0;
  for (let r = 0; r < t; r++)
    n[r] = e[0][s++], s === e[0].length && (e.shift(), s = 0);
  return e.length && s < e[0].length && (e[0] = e[0].slice(s)), n;
}
function N_(e, t) {
  Wo || (Wo = new TextDecoder());
  const n = [];
  let s = 0, r = -1, i = !1;
  return new TransformStream({
    transform(o, a) {
      for (n.push(o); ; ) {
        if (s === 0) {
          if (mi(n) < 1)
            break;
          const l = gi(n, 1);
          i = (l[0] & 128) === 128, r = l[0] & 127, r < 126 ? s = 3 : r === 126 ? s = 1 : s = 2;
        } else if (s === 1) {
          if (mi(n) < 2)
            break;
          const l = gi(n, 2);
          r = new DataView(l.buffer, l.byteOffset, l.length).getUint16(0), s = 3;
        } else if (s === 2) {
          if (mi(n) < 8)
            break;
          const l = gi(n, 8), u = new DataView(l.buffer, l.byteOffset, l.length), c = u.getUint32(0);
          if (c > Math.pow(2, 21) - 1) {
            a.enqueue(ha);
            break;
          }
          r = c * Math.pow(2, 32) + u.getUint32(4), s = 3;
        } else {
          if (mi(n) < r)
            break;
          const l = gi(n, r);
          a.enqueue(Wa(i ? l : Wo.decode(l), t)), s = 0;
        }
        if (r === 0 || r > e) {
          a.enqueue(ha);
          break;
        }
      }
    }
  });
}
const gf = 4;
function dt(e) {
  if (e) return P_(e);
}
function P_(e) {
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
const lo = typeof Promise == "function" && typeof Promise.resolve == "function" ? (t) => Promise.resolve().then(t) : (t, n) => n(t, 0), fn = typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")(), M_ = "arraybuffer";
function _f(e, ...t) {
  return t.reduce((n, s) => (e.hasOwnProperty(s) && (n[s] = e[s]), n), {});
}
const D_ = fn.setTimeout, F_ = fn.clearTimeout;
function co(e, t) {
  t.useNativeTimers ? (e.setTimeoutFn = D_.bind(fn), e.clearTimeoutFn = F_.bind(fn)) : (e.setTimeoutFn = fn.setTimeout.bind(fn), e.clearTimeoutFn = fn.clearTimeout.bind(fn));
}
const $_ = 1.33;
function B_(e) {
  return typeof e == "string" ? U_(e) : Math.ceil((e.byteLength || e.size) * $_);
}
function U_(e) {
  let t = 0, n = 0;
  for (let s = 0, r = e.length; s < r; s++)
    t = e.charCodeAt(s), t < 128 ? n += 1 : t < 2048 ? n += 2 : t < 55296 || t >= 57344 ? n += 3 : (s++, n += 4);
  return n;
}
function yf() {
  return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
}
function z_(e) {
  let t = "";
  for (let n in e)
    e.hasOwnProperty(n) && (t.length && (t += "&"), t += encodeURIComponent(n) + "=" + encodeURIComponent(e[n]));
  return t;
}
function H_(e) {
  let t = {}, n = e.split("&");
  for (let s = 0, r = n.length; s < r; s++) {
    let i = n[s].split("=");
    t[decodeURIComponent(i[0])] = decodeURIComponent(i[1]);
  }
  return t;
}
class j_ extends Error {
  constructor(t, n, s) {
    super(t), this.description = n, this.context = s, this.type = "TransportError";
  }
}
class qa extends dt {
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
    return super.emitReserved("error", new j_(t, n, s)), this;
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
    const n = Wa(t, this.socket.binaryType);
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
    const n = z_(t);
    return n.length ? "?" + n : "";
  }
}
class W_ extends qa {
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
    O_(t, this.socket.binaryType).forEach(n), this.readyState !== "closed" && (this._polling = !1, this.emitReserved("pollComplete"), this.readyState === "open" && this._poll());
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
    this.writable = !1, I_(t, (n) => {
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
    return this.opts.timestampRequests !== !1 && (n[this.opts.timestampParam] = yf()), !this.supportsBinary && !n.sid && (n.b64 = 1), this.createUri(t, n);
  }
}
let vf = !1;
try {
  vf = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest();
} catch {
}
const q_ = vf;
function V_() {
}
class K_ extends W_ {
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
class Cn extends dt {
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
    const n = _f(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
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
    typeof document < "u" && (this._index = Cn.requestsCount++, Cn.requests[this._index] = this);
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
      if (this._xhr.onreadystatechange = V_, t)
        try {
          this._xhr.abort();
        } catch {
        }
      typeof document < "u" && delete Cn.requests[this._index], this._xhr = null;
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
Cn.requestsCount = 0;
Cn.requests = {};
if (typeof document < "u") {
  if (typeof attachEvent == "function")
    attachEvent("onunload", Ec);
  else if (typeof addEventListener == "function") {
    const e = "onpagehide" in fn ? "pagehide" : "unload";
    addEventListener(e, Ec, !1);
  }
}
function Ec() {
  for (let e in Cn.requests)
    Cn.requests.hasOwnProperty(e) && Cn.requests[e].abort();
}
const G_ = function() {
  const e = bf({
    xdomain: !1
  });
  return e && e.responseType !== null;
}();
class Y_ extends K_ {
  constructor(t) {
    super(t);
    const n = t && t.forceBase64;
    this.supportsBinary = G_ && !n;
  }
  request(t = {}) {
    return Object.assign(t, { xd: this.xd }, this.opts), new Cn(bf, this.uri(), t);
  }
}
function bf(e) {
  const t = e.xdomain;
  try {
    if (typeof XMLHttpRequest < "u" && (!t || q_))
      return new XMLHttpRequest();
  } catch {
  }
  if (!t)
    try {
      return new fn[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
    } catch {
    }
}
const wf = typeof navigator < "u" && typeof navigator.product == "string" && navigator.product.toLowerCase() === "reactnative";
class X_ extends qa {
  get name() {
    return "websocket";
  }
  doOpen() {
    const t = this.uri(), n = this.opts.protocols, s = wf ? {} : _f(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
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
      ja(s, this.supportsBinary, (i) => {
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
    return this.opts.timestampRequests && (n[this.opts.timestampParam] = yf()), this.supportsBinary || (n.b64 = 1), this.createUri(t, n);
  }
}
const qo = fn.WebSocket || fn.MozWebSocket;
class Z_ extends X_ {
  createSocket(t, n, s) {
    return wf ? new qo(t, n, s) : n ? new qo(t, n) : new qo(t);
  }
  doWrite(t, n) {
    this.ws.send(n);
  }
}
class J_ extends qa {
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
        const n = N_(Number.MAX_SAFE_INTEGER, this.socket.binaryType), s = t.readable.pipeThrough(n).getReader(), r = L_();
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
const Q_ = {
  websocket: Z_,
  webtransport: J_,
  polling: Y_
}, ey = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/, ty = [
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
function da(e) {
  if (e.length > 8e3)
    throw "URI too long";
  const t = e, n = e.indexOf("["), s = e.indexOf("]");
  n != -1 && s != -1 && (e = e.substring(0, n) + e.substring(n, s).replace(/:/g, ";") + e.substring(s, e.length));
  let r = ey.exec(e || ""), i = {}, o = 14;
  for (; o--; )
    i[ty[o]] = r[o] || "";
  return n != -1 && s != -1 && (i.source = t, i.host = i.host.substring(1, i.host.length - 1).replace(/;/g, ":"), i.authority = i.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), i.ipv6uri = !0), i.pathNames = ny(i, i.path), i.queryKey = sy(i, i.query), i;
}
function ny(e, t) {
  const n = /\/{2,9}/g, s = t.replace(n, "/").split("/");
  return (t.slice(0, 1) == "/" || t.length === 0) && s.splice(0, 1), t.slice(-1) == "/" && s.splice(s.length - 1, 1), s;
}
function sy(e, t) {
  const n = {};
  return t.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function(s, r, i) {
    r && (n[r] = i);
  }), n;
}
const pa = typeof addEventListener == "function" && typeof removeEventListener == "function", Ei = [];
pa && addEventListener("offline", () => {
  Ei.forEach((e) => e());
}, !1);
class ls extends dt {
  /**
   * Socket constructor.
   *
   * @param {String|Object} uri - uri or options
   * @param {Object} opts - options
   */
  constructor(t, n) {
    if (super(), this.binaryType = M_, this.writeBuffer = [], this._prevBufferLen = 0, this._pingInterval = -1, this._pingTimeout = -1, this._maxPayload = -1, this._pingTimeoutTime = 1 / 0, t && typeof t == "object" && (n = t, t = null), t) {
      const s = da(t);
      n.hostname = s.host, n.secure = s.protocol === "https" || s.protocol === "wss", n.port = s.port, s.query && (n.query = s.query);
    } else n.host && (n.hostname = da(n.host).host);
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
    }, n), this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : ""), typeof this.opts.query == "string" && (this.opts.query = H_(this.opts.query)), pa && (this.opts.closeOnBeforeunload && (this._beforeunloadEventListener = () => {
      this.transport && (this.transport.removeAllListeners(), this.transport.close());
    }, addEventListener("beforeunload", this._beforeunloadEventListener, !1)), this.hostname !== "localhost" && (this._offlineEventListener = () => {
      this._onClose("transport close", {
        description: "network connection lost"
      });
    }, Ei.push(this._offlineEventListener))), this.opts.withCredentials && (this._cookieJar = void 0), this._open();
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
    n.EIO = gf, n.transport = t, this.id && (n.sid = this.id);
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
      if (r && (n += B_(r)), s > 0 && n > this._maxPayload)
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
      if (this.clearTimeoutFn(this._pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), pa && (this._beforeunloadEventListener && removeEventListener("beforeunload", this._beforeunloadEventListener, !1), this._offlineEventListener)) {
        const s = Ei.indexOf(this._offlineEventListener);
        s !== -1 && Ei.splice(s, 1);
      }
      this.readyState = "closed", this.id = null, this.emitReserved("close", t, n), this.writeBuffer = [], this._prevBufferLen = 0;
    }
  }
}
ls.protocol = gf;
class ry extends ls {
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
            const k = new Error("probe error");
            k.transport = n.name, this.emitReserved("upgradeError", k);
          }
      }));
    };
    function i() {
      s || (s = !0, c(), n.close(), n = null);
    }
    const o = (b) => {
      const k = new Error("probe error: " + b);
      k.transport = n.name, i(), this.emitReserved("upgradeError", k);
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
let iy = class extends ry {
  constructor(t, n = {}) {
    const s = typeof t == "object", r = s ? { ...t } : { ...n };
    (!r.transports || r.transports && typeof r.transports[0] == "string") && (r.transports = (r.transports || ["polling", "websocket", "webtransport"]).map((i) => Q_[i]).filter((i) => !!i)), super(s ? r : t, r);
  }
};
function oy(e, t = "", n) {
  let s = e;
  n = n || typeof location < "u" && location, e == null && (e = n.protocol + "//" + n.host), typeof e == "string" && (e.charAt(0) === "/" && (e.charAt(1) === "/" ? e = n.protocol + e : e = n.host + e), /^(https?|wss?):\/\//.test(e) || (typeof n < "u" ? e = n.protocol + "//" + e : e = "https://" + e), s = da(e)), s.port || (/^(http|ws)$/.test(s.protocol) ? s.port = "80" : /^(http|ws)s$/.test(s.protocol) && (s.port = "443")), s.path = s.path || "/";
  const i = s.host.indexOf(":") !== -1 ? "[" + s.host + "]" : s.host;
  return s.id = s.protocol + "://" + i + ":" + s.port + t, s.href = s.protocol + "://" + i + (n && n.port === s.port ? "" : ":" + s.port), s;
}
const ay = typeof ArrayBuffer == "function", ly = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e.buffer instanceof ArrayBuffer, kf = Object.prototype.toString, cy = typeof Blob == "function" || typeof Blob < "u" && kf.call(Blob) === "[object BlobConstructor]", uy = typeof File == "function" || typeof File < "u" && kf.call(File) === "[object FileConstructor]";
function Va(e) {
  return ay && (e instanceof ArrayBuffer || ly(e)) || cy && e instanceof Blob || uy && e instanceof File;
}
function Ci(e, t) {
  if (!e || typeof e != "object")
    return !1;
  if (Array.isArray(e)) {
    for (let n = 0, s = e.length; n < s; n++)
      if (Ci(e[n]))
        return !0;
    return !1;
  }
  if (Va(e))
    return !0;
  if (e.toJSON && typeof e.toJSON == "function" && arguments.length === 1)
    return Ci(e.toJSON(), !0);
  for (const n in e)
    if (Object.prototype.hasOwnProperty.call(e, n) && Ci(e[n]))
      return !0;
  return !1;
}
function fy(e) {
  const t = [], n = e.data, s = e;
  return s.data = Ri(n, t), s.attachments = t.length, { packet: s, buffers: t };
}
function Ri(e, t, n) {
  if (!e)
    return e;
  if (Va(e)) {
    const s = { _placeholder: !0, num: t.length };
    return t.push(e), s;
  } else if (Array.isArray(e)) {
    const s = new Array(e.length);
    for (let r = 0; r < e.length; r++)
      s[r] = Ri(e[r], t);
    return s;
  } else if (typeof e == "object" && !(e instanceof Date)) {
    if (e.toJSON && typeof e.toJSON == "function" && !n)
      return Ri(e.toJSON(), t, !0);
    const s = {};
    for (const r in e)
      Object.prototype.hasOwnProperty.call(e, r) && (s[r] = Ri(e[r], t));
    return s;
  }
  return e;
}
function hy(e, t) {
  return e.data = ma(e.data, t), delete e.attachments, e;
}
function ma(e, t) {
  if (!e)
    return e;
  if (e && e._placeholder === !0) {
    if (typeof e.num == "number" && e.num >= 0 && e.num < t.length)
      return t[e.num];
    throw new Error("illegal attachments");
  } else if (Array.isArray(e))
    for (let n = 0; n < e.length; n++)
      e[n] = ma(e[n], t);
  else if (typeof e == "object")
    for (const n in e)
      Object.prototype.hasOwnProperty.call(e, n) && (e[n] = ma(e[n], t));
  return e;
}
const dy = [
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
var Me;
(function(e) {
  e[e.CONNECT = 0] = "CONNECT", e[e.DISCONNECT = 1] = "DISCONNECT", e[e.EVENT = 2] = "EVENT", e[e.ACK = 3] = "ACK", e[e.CONNECT_ERROR = 4] = "CONNECT_ERROR", e[e.BINARY_EVENT = 5] = "BINARY_EVENT", e[e.BINARY_ACK = 6] = "BINARY_ACK";
})(Me || (Me = {}));
class py {
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
    return (t.type === Me.EVENT || t.type === Me.ACK) && Ci(t) ? this.encodeAsBinary({
      type: t.type === Me.EVENT ? Me.BINARY_EVENT : Me.BINARY_ACK,
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
    return (t.type === Me.BINARY_EVENT || t.type === Me.BINARY_ACK) && (n += t.attachments + "-"), t.nsp && t.nsp !== "/" && (n += t.nsp + ","), t.id != null && (n += t.id), t.data != null && (n += JSON.stringify(t.data, this.replacer)), n;
  }
  /**
   * Encode packet as 'buffer sequence' by removing blobs, and
   * deconstructing packet into object with placeholders and
   * a list of buffers.
   */
  encodeAsBinary(t) {
    const n = fy(t), s = this.encodeAsString(n.packet), r = n.buffers;
    return r.unshift(s), r;
  }
}
class Ka extends dt {
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
      const s = n.type === Me.BINARY_EVENT;
      s || n.type === Me.BINARY_ACK ? (n.type = s ? Me.EVENT : Me.ACK, this.reconstructor = new my(n)) : super.emitReserved("decoded", n);
    } else if (Va(t) || t.base64)
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
    if (Me[s.type] === void 0)
      throw new Error("unknown packet type " + s.type);
    if (s.type === Me.BINARY_EVENT || s.type === Me.BINARY_ACK) {
      const i = n + 1;
      for (; t.charAt(++n) !== "-" && n != t.length; )
        ;
      const o = t.substring(i, n);
      if (o != Number(o) || t.charAt(n) !== "-")
        throw new Error("Illegal attachments");
      const a = Number(o);
      if (!gy(a) || a < 1)
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
      if (Ka.isPayloadValid(s.type, i))
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
      case Me.CONNECT:
        return Cc(n);
      case Me.DISCONNECT:
        return n === void 0;
      case Me.CONNECT_ERROR:
        return typeof n == "string" || Cc(n);
      case Me.EVENT:
      case Me.BINARY_EVENT:
        return Array.isArray(n) && (typeof n[0] == "number" || typeof n[0] == "string" && dy.indexOf(n[0]) === -1);
      case Me.ACK:
      case Me.BINARY_ACK:
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
class my {
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
      const n = hy(this.reconPack, this.buffers);
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
const gy = Number.isInteger || function(e) {
  return typeof e == "number" && isFinite(e) && Math.floor(e) === e;
};
function Cc(e) {
  return Object.prototype.toString.call(e) === "[object Object]";
}
const _y = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Decoder: Ka,
  Encoder: py,
  get PacketType() {
    return Me;
  }
}, Symbol.toStringTag, { value: "Module" }));
function _n(e, t, n) {
  return e.on(t, n), function() {
    e.off(t, n);
  };
}
const yy = Object.freeze({
  connect: 1,
  connect_error: 1,
  disconnect: 1,
  disconnecting: 1,
  // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
  newListener: 1,
  removeListener: 1
});
class Tf extends dt {
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
      _n(t, "open", this.onopen.bind(this)),
      _n(t, "packet", this.onpacket.bind(this)),
      _n(t, "error", this.onerror.bind(this)),
      _n(t, "close", this.onclose.bind(this))
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
    if (yy.hasOwnProperty(t))
      throw new Error('"' + t.toString() + '" is a reserved event name');
    if (n.unshift(t), this._opts.retries && !this.flags.fromQueue && !this.flags.volatile)
      return this._addToQueue(n), this;
    const o = {
      type: Me.EVENT,
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
      type: Me.CONNECT,
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
        case Me.CONNECT:
          t.data && t.data.sid ? this.onconnect(t.data.sid, t.data.pid) : this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
          break;
        case Me.EVENT:
        case Me.BINARY_EVENT:
          this.onevent(t);
          break;
        case Me.ACK:
        case Me.BINARY_ACK:
          this.onack(t);
          break;
        case Me.DISCONNECT:
          this.ondisconnect();
          break;
        case Me.CONNECT_ERROR:
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
        type: Me.ACK,
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
    return this.connected && this.packet({ type: Me.DISCONNECT }), this.destroy(), this.connected && this.onclose("io client disconnect"), this;
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
function ur(e) {
  e = e || {}, this.ms = e.min || 100, this.max = e.max || 1e4, this.factor = e.factor || 2, this.jitter = e.jitter > 0 && e.jitter <= 1 ? e.jitter : 0, this.attempts = 0;
}
ur.prototype.duration = function() {
  var e = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var t = Math.random(), n = Math.floor(t * this.jitter * e);
    e = (Math.floor(t * 10) & 1) == 0 ? e - n : e + n;
  }
  return Math.min(e, this.max) | 0;
};
ur.prototype.reset = function() {
  this.attempts = 0;
};
ur.prototype.setMin = function(e) {
  this.ms = e;
};
ur.prototype.setMax = function(e) {
  this.max = e;
};
ur.prototype.setJitter = function(e) {
  this.jitter = e;
};
class ga extends dt {
  constructor(t, n) {
    var s;
    super(), this.nsps = {}, this.subs = [], t && typeof t == "object" && (n = t, t = void 0), n = n || {}, n.path = n.path || "/socket.io", this.opts = n, co(this, n), this.reconnection(n.reconnection !== !1), this.reconnectionAttempts(n.reconnectionAttempts || 1 / 0), this.reconnectionDelay(n.reconnectionDelay || 1e3), this.reconnectionDelayMax(n.reconnectionDelayMax || 5e3), this.randomizationFactor((s = n.randomizationFactor) !== null && s !== void 0 ? s : 0.5), this.backoff = new ur({
      min: this.reconnectionDelay(),
      max: this.reconnectionDelayMax(),
      jitter: this.randomizationFactor()
    }), this.timeout(n.timeout == null ? 2e4 : n.timeout), this._readyState = "closed", this.uri = t;
    const r = n.parser || _y;
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
    this.engine = new iy(this.uri, this.opts);
    const n = this.engine, s = this;
    this._readyState = "opening", this.skipReconnect = !1;
    const r = _n(n, "open", function() {
      s.onopen(), t && t();
    }), i = (a) => {
      this.cleanup(), this._readyState = "closed", this.emitReserved("error", a), t ? t(a) : this.maybeReconnectOnOpen();
    }, o = _n(n, "error", i);
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
      _n(t, "ping", this.onping.bind(this)),
      _n(t, "data", this.ondata.bind(this)),
      _n(t, "error", this.onerror.bind(this)),
      _n(t, "close", this.onclose.bind(this)),
      // @ts-ignore
      _n(this.decoder, "decoded", this.ondecoded.bind(this))
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
    return s ? this._autoConnect && !s.active && s.connect() : (s = new Tf(this, t, n), this.nsps[t] = s), s;
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
const Pr = {};
function Ii(e, t) {
  typeof e == "object" && (t = e, e = void 0), t = t || {};
  const n = oy(e, t.path || "/socket.io"), s = n.source, r = n.id, i = n.path, o = Pr[r] && i in Pr[r].nsps, a = t.forceNew || t["force new connection"] || t.multiplex === !1 || o;
  let l;
  return a ? l = new ga(s, t) : (Pr[r] || (Pr[r] = new ga(s, t)), l = Pr[r]), n.query && !t.query && (t.query = n.queryKey), l.socket(n.path, t);
}
Object.assign(Ii, {
  Manager: ga,
  Socket: Tf,
  io: Ii,
  connect: Ii
});
const vy = 5e3;
function by() {
  const e = oe([]), t = oe(!1), n = oe(""), s = oe(!1), r = oe(!1), i = oe(!1), o = oe("connecting"), a = oe(0), l = 5, u = oe({}), c = oe(null), b = oe(""), k = [];
  let I = null;
  const O = 6e4, j = () => {
    t.value = !1, I && (clearTimeout(I), I = null);
  }, ce = () => {
    t.value = !0, I && clearTimeout(I), I = setTimeout(j, O);
  };
  let R = null;
  const ue = 1e3, me = 15e3;
  let C = null;
  const M = /* @__PURE__ */ new Set(["ai_config_missing", ...$u]);
  let S = !1;
  const q = oe(null), se = () => {
    C && (clearTimeout(C), C = null);
  }, de = () => {
    if (C || S) return;
    const U = Math.min(
      ue * 2 ** Math.max(0, a.value - 1),
      me
    );
    C = setTimeout(() => {
      C = null, R == null || R.connect();
    }, U);
  };
  let pe = null, Le = null, Ae = null, Ve = null, $e = null, et = !1, fe = null, we, ge, Ye;
  const Xe = (U) => {
    var z;
    return (z = Si(U ?? null)) == null ? void 0 : z.sub;
  }, rt = (U) => {
    we = U, U && R != null && R.connected && R.emit("refresh_token", { conversation_token: U });
  }, ze = (U) => {
    ge = U;
  }, Lt = () => {
    var f;
    const U = we || (Vi() ? null : qi().read()), z = {};
    U && (z.conversation_token = U), ge && (z.widget_id = ge);
    try {
      z.page_url = lf() || (window.parent !== window && ((f = window.parent.location) != null && f.href) ? window.parent.location.href : document.referrer || window.location.href);
    } catch {
      z.page_url = document.referrer || "";
    }
    return z;
  }, vn = (U) => {
    R = Ii(`${Ns.WS_URL}/widget`, {
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
      Ye = Xe(Lt().conversation_token), o.value = "connected", se(), a.value = 0;
    }), R.on("bot_typing", () => {
      ce();
    }), R.on("disconnect", () => {
      j(), o.value === "connected" && (console.log("Socket disconnected, setting connection status to connecting"), o.value = "connecting");
    }), R.on("connect_error", (z) => {
      var y;
      const f = (y = z == null ? void 0 : z.data) == null ? void 0 : y.type;
      if (f && M.has(f)) {
        S = !0, q.value = f, se(), o.value = "failed", oa(f) ? et || $e == null || $e() : g(z.data);
        return;
      }
      a.value++, console.error("Socket connection failed, attempt:", a.value), a.value >= l && (o.value = "failed"), R && !R.active && de();
    }), R.on("chat_response", (z) => {
      if (j(), z.session_id ? (console.log("Captured session_id from chat_response:", z.session_id), b.value = z.session_id) : console.warn("No session_id in chat_response data:", z), z.type === "agent_message") {
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
      }, j(), pe && pe(z);
    }), R.on("session_initialized", (z) => {
      z.session_id && (b.value = z.session_id, fe = {
        session_id: z.session_id,
        authenticated: !!z.authenticated,
        created: !!z.created
      }, Ve == null || Ve(fe));
    }), R.on("error", g);
    for (const [z, f] of k) R.on(z, f);
    return R.on("chat_history", v), R.on("rating_submitted", L), R.on("display_form", D), R.on("form_submitted", B), R.on("workflow_state", P), R.on("workflow_proceeded", X), R;
  }, De = async () => {
    try {
      return R != null && R.connected && Ye && Ye === Xe(Lt().conversation_token) ? (o.value = "connected", !0) : (o.value = "connecting", a.value = 0, j(), se(), S = !1, q.value = null, R && (R.removeAllListeners(), R.disconnect(), R = null), et = !0, R = vn(""), new Promise((U) => {
        const z = (f) => {
          et = !1, U(f);
        };
        R == null || R.on("connect", () => {
          z(!0);
        }), R == null || R.on("connect_error", () => {
          (S || a.value >= l) && z(!1);
        });
      }));
    } catch (U) {
      return console.error("Socket initialization failed:", U), et = !1, o.value = "failed", !1;
    }
  }, vt = () => (R && R.disconnect(), De()), zt = (U) => {
    pe = U;
  }, qt = (U) => {
    $e = U;
  }, Vt = (U) => {
    Ve = U, fe && U(fe);
  }, Nt = (U) => {
    Le = U;
  }, bn = (U) => {
    Ae = U;
  }, g = (U) => {
    j(), n.value = pp(U), s.value = !0, setTimeout(() => {
      s.value = !1, n.value = "";
    }, 5e3);
  }, v = (U) => {
    if (U.type === "chat_history" && Array.isArray(U.messages)) {
      const z = U.messages.map((f) => {
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
  }, L = (U) => {
    U.success && e.value.push({
      message: "Thank you for your feedback!",
      message_type: "system",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: ""
    });
  }, D = (U) => {
    var z;
    console.log("Form display handler in composable:", U), j(), c.value = U.form_data, console.log("Set currentForm in handleDisplayForm:", c.value), ((z = U.form_data) == null ? void 0 : z.form_full_screen) === !0 ? (console.log("Full screen form detected, triggering workflow state callback"), Le && Le({
      type: "form",
      form_data: U.form_data,
      session_id: U.session_id
    })) : e.value.push({
      message: "",
      message_type: "form",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: U.session_id,
      attributes: {
        form_data: U.form_data
      }
    });
  }, B = (U) => {
    console.log("Form submitted confirmation received, clearing currentForm"), c.value = null, U.success && console.log("Form submitted successfully");
  }, P = (U) => {
    console.log("Workflow state received in composable:", U), (U.type === "form" || U.type === "display_form") && (console.log("Setting currentForm from workflow state:", U.form_data), c.value = U.form_data), Le && Le(U);
  }, X = (U) => {
    console.log("Workflow proceeded in composable:", U), Ae && Ae(U);
  }, K = async (U, z) => {
    !R || !U || R.emit("submit_rating", {
      rating: U,
      feedback: z
    });
  }, G = async (U) => {
    var y;
    if (console.log("Submitting form in socket:", U), console.log("Current form in socket:", c.value), console.log("Socket in socket:", R), !R) {
      console.error("No socket available for form submission");
      return;
    }
    if (!U || Object.keys(U).length === 0) {
      console.error("No form data to submit");
      return;
    }
    const f = ((y = c.value) == null ? void 0 : y.form_type) === "contact" ? "submit_contact_info" : "submit_form";
    console.log(`Emitting ${f} event with data:`, U), R.emit(f, {
      form_data: U
    }), c.value = null;
  }, F = async () => {
    R && (console.log("Getting workflow state 12"), R.emit("get_workflow_state"));
  }, re = async () => {
    R && R.emit("proceed_workflow", {});
  }, Y = async (U, z, f = [], y = {}) => {
    if (!R || !U.trim() && f.length === 0) return;
    const N = {
      message: U,
      message_type: "user",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: ""
    };
    f.length > 0 && (N.attachments = f.map((E, W) => {
      let Q = "";
      if (E.content_type.startsWith("image/")) {
        const ie = atob(E.content), Ce = new Array(ie.length);
        for (let Ne = 0; Ne < ie.length; Ne++)
          Ce[Ne] = ie.charCodeAt(Ne);
        const Re = new Uint8Array(Ce), Ie = new Blob([Re], { type: E.content_type });
        Q = URL.createObjectURL(Ie);
      }
      return {
        id: Date.now() * 1e3 + W,
        // Temporary ID
        filename: E.filename,
        file_url: Q,
        // Temporary blob URL, will be replaced
        content_type: E.content_type,
        file_size: E.size,
        _isTemporary: !0
        // Flag to identify temporary attachments
      };
    })), e.value.push(N), R.emit("chat", {
      ...y,
      message: U,
      email: z,
      files: f
      // Send files with base64 content
    }), i.value = !0;
  }, ne = () => {
    e.value = [], i.value = !1, b.value = "", j(), c.value = null;
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
    endChat: (U = "CUSTOMER_REQUEST") => new Promise((z) => {
      if (!R || !R.connected) {
        z(!1);
        return;
      }
      let f = !1;
      const y = (Q) => {
        f || (f = !0, clearTimeout(W), R == null || R.off("chat_ended", N), R == null || R.off("error", E), Q && ne(), z(Q));
      }, N = () => y(!0), E = (Q) => {
        (Q == null ? void 0 : Q.type) === "end_chat_error" && y(!1);
      }, W = setTimeout(() => y(!1), vy);
      R.on("chat_ended", N), R.on("error", E), R.emit("end_chat", { reason: U });
    }),
    loadChatHistory: async () => {
      if (R)
        try {
          r.value = !0, R.emit("get_chat_history");
        } catch (U) {
          console.error("Failed to load chat history:", U);
        } finally {
          r.value = !1;
        }
    },
    connect: De,
    reconnect: vt,
    cleanup: () => {
      j(), se(), R && (R.removeAllListeners(), R.disconnect(), R = null), pe = null, Le = null, Ae = null;
    },
    humanAgent: u,
    onTakeover: zt,
    onSessionState: Vt,
    onReauthorize: qt,
    refusal: q,
    submitRating: K,
    currentForm: c,
    submitForm: G,
    getWorkflowState: F,
    proceedWorkflow: re,
    onWorkflowState: Nt,
    onWorkflowProceeded: bn,
    currentSessionId: b,
    setToken: rt,
    setWidgetId: ze,
    on: (U, z) => {
      k.push([U, z]), R == null || R.on(U, z);
    },
    emit: (U, z) => {
      R == null || R.emit(U, z);
    }
  };
}
const wy = 8, ky = 200;
function Ty(e) {
  const t = e && typeof e == "object" ? e.details : null;
  if (!t || typeof t != "object" || Array.isArray(t)) return null;
  const n = Object.entries(t).filter(([s, r]) => s.trim() && ["string", "number", "boolean"].includes(typeof r) && String(r).trim()).slice(0, wy).map(([s, r]) => ({ key: s.trim().slice(0, 60), value: String(r).trim().slice(0, ky) }));
  return n.length ? n : null;
}
const Ay = 140;
function Sy(e) {
  const t = e && typeof e == "object" ? e.summary : null;
  return typeof t == "string" && t.trim() ? t.trim().slice(0, Ay) : null;
}
const xy = 2e3, Ey = 4;
function Cy(e) {
  if (typeof e.message != "string" || !e.message.trim()) return null;
  const t = Array.isArray(e.suggestions) ? e.suggestions.filter((n) => typeof n == "string" && !!n.trim()).map((n) => ({ label: n.slice(0, 80), kind: "text", value: n.slice(0, 500) })).slice(0, Ey) : [];
  return { message: e.message.slice(0, xy), chips: t, open: e.open === !0, source: "host" };
}
const Ry = 2e3;
function Iy(e) {
  const t = e.setTimer ?? ((S, q) => setTimeout(S, q)), n = e.clearTimer ?? ((S) => clearTimeout(S));
  let s = [], r = null, i = null;
  const o = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map();
  function u() {
    const S = e.trustedHostOrigin();
    S && s.length && e.emit("actions_available", { names: s, host_origin: S }), r && e.emit("set_context", { context: r });
  }
  function c(S) {
    s = Array.isArray(S) ? S.filter((q) => typeof q == "string") : [], u();
  }
  function b(S) {
    r = S && typeof S == "object" && !Array.isArray(S) ? S : null, r && e.emit("set_context", { context: r });
  }
  function k(S, q, se, de = {}) {
    var pe;
    (pe = e.onOutcome) == null || pe.call(e, {
      label: S,
      status: q,
      preview: se,
      summary: q === "ok" ? Sy(de.result) : null,
      error: typeof de.error == "string" && de.error ? de.error : null
    });
  }
  function I(S, q, se = {}) {
    const de = o.get(S);
    de && (n(de.timer), k(de.label, q, de.preview, se)), o.delete(S);
    const pe = a.get(S);
    if (pe) {
      a.delete(S), pe(q);
      return;
    }
    const Le = (de == null ? void 0 : de.confirmed) ?? void 0;
    e.emit("action_result", { call_id: S, status: q, confirmed: Le, ...se });
  }
  function O(S) {
    const q = i && S ? a.get(i.request.call_id) : void 0;
    q && i && (a.delete(i.request.call_id), q("declined")), i = S, e.onConfirmChange(S);
  }
  function j(S, q, se = null) {
    const de = Math.max(1, S.timeout_s) * 1e3 + Ry;
    o.set(S.call_id, {
      timer: t(() => I(S.call_id, "timeout"), de),
      confirmed: q,
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
  function ce(S) {
    if (!(!S || typeof S.call_id != "string") && !(o.has(S.call_id) || l.has(S.call_id) || (i == null ? void 0 : i.request.call_id) === S.call_id)) {
      if (S.confirm === "always") {
        O({ request: S, preview: null, details: null }), l.set(S.call_id, S), e.postToHost({ type: "ACTION_PREVIEW", callId: S.call_id, name: S.name, args: S.args });
        return;
      }
      if (S.confirm === "when_overwriting") {
        l.set(S.call_id, S), e.postToHost({ type: "ACTION_PREVIEW", callId: S.call_id, name: S.name, args: S.args });
        return;
      }
      j(S, null);
    }
  }
  function R(S) {
    var q;
    switch (S.type) {
      case "HOST_ACTIONS":
        return c(S.names), !0;
      case "HOST_CONTEXT":
        return b(S.context), !0;
      case "HOST_PROMPT": {
        const se = Cy(S);
        return se && ((q = e.onPrompt) == null || q.call(e, se)), !0;
      }
      case "ACTION_PREVIEW_DONE": {
        const se = l.get(String(S.callId));
        if (!se) return !0;
        if (l.delete(se.call_id), se.confirm === "always") {
          const pe = Ty(S.preview);
          return pe && (i == null ? void 0 : i.request.call_id) === se.call_id && (i = { ...i, details: pe }, e.onConfirmChange(i)), !0;
        }
        const de = S.preview;
        return de && typeof de == "object" ? O({ request: se, preview: de, details: null }) : j(se, null), !0;
      }
      case "ACTION_DONE": {
        const se = String(S.callId);
        if (!o.has(se)) return !0;
        const de = ["ok", "error", "timeout"].includes(S.status) ? S.status : "error";
        return I(se, de, {
          result: de === "ok" ? S.result : void 0,
          error: typeof S.error == "string" ? S.error : void 0
        }), !0;
      }
      default:
        return !1;
    }
  }
  function ue() {
    if (!i) return;
    const { request: S, preview: q } = i;
    O(null), l.delete(S.call_id), j(S, !0, q);
  }
  function me() {
    if (!i) return;
    const { request: S, preview: q } = i;
    O(null), l.delete(S.call_id), k(S.label, "declined", q);
    const se = a.get(S.call_id);
    if (se) {
      a.delete(S.call_id), se("declined");
      return;
    }
    e.emit("action_result", { call_id: S.call_id, status: "declined", confirmed: !1 });
  }
  function C(S, q) {
    if (S.kind !== "action" || !S.action || i || a.size > 0 || o.size > 0 || l.size > 0) return !1;
    const se = `chip-${S.value}-${Date.now()}`;
    return a.set(se, q), ce({
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
  return { announce: u, handleRequest: ce, handleHostMessage: R, approve: ue, decline: me, runLocal: C, dispose: M };
}
function Oy(e, t, n) {
  const s = oe(null), r = Iy({
    postToHost: Tt,
    emit: e.emit,
    // Actions need a page whose origin we know: the framed widget with a real host.
    trustedHostOrigin: () => {
      if (!Vi()) return null;
      const o = ef();
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
  return window.addEventListener("message", i), no(() => {
    window.removeEventListener("message", i), r.dispose();
  }), { pendingConfirm: s, approveAction: r.approve, declineAction: r.decline, runLocalAction: r.runLocal };
}
function Rc(e, t) {
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
const Ly = 6e4;
function Ny(e) {
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
    }, I.nudge.after_min * Ly));
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
    var ce;
    const O = (I == null ? void 0 : I.view) ?? null;
    if ((ce = O == null ? void 0 : O.notice) != null && ce.text && e.addNotice(O.notice.text, O.notice.kind), !O && c) return;
    if (c = !!(O != null && O.finished) && !!O.journey_name, !O || O.finished || O.waiting) {
      i(), a = null, o = null;
      const R = O != null && O.journey_name ? Rc(O, !!O.finished) : null;
      e.showStep(null, R), O != null && O.finished && O.message && e.addNotice(O.message, "message");
      return;
    }
    const j = O.message ? { message: O.message, chips: O.chips ?? [], open: !1, source: "journey" } : null;
    e.showStep(j, Rc(O, !1)), O.fresh && O.auto_open && e.openChat(), u(O);
  }
  function k() {
    s !== null && l();
  }
  return {
    handleState: b,
    activity: k,
    sync: (I = {}) => e.emit("journey_sync", I),
    skip: () => e.emit("journey_skip", {}),
    dismiss: () => {
      c = !1, e.showStep(null, null), e.emit("journey_dismiss", {});
    },
    start: (I) => e.emit("journey_start", { key: I }),
    dispose: i
  };
}
function Py(e) {
  const t = oe(null), n = oe(!1);
  let s = !1;
  const r = [], o = Ny({
    emit: (u, c) => {
      s ? e.emit(u, c) : r.push([u, c]);
    },
    showStep: (u, c) => {
      t.value = c;
      const b = e.currentPrompt();
      b && b.source !== "journey" || e.showPrompt(u);
    },
    addNotice: e.addNotice,
    openChat: () => Tt({ type: "WIDGET_OPEN_REQUEST" })
  });
  e.on("journey_state", o.handleState), e.on("session_initialized", () => {
    s = !0, o.sync({ url: lf() });
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
    e.runLocalAction(u, (k) => {
      n.value = !1, k === "ok" && o.sync({ action: u.value });
    }) && (n.value = !0);
  }
  return no(() => {
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
function My(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Vo = { exports: {} }, Ic;
function Dy() {
  return Ic || (Ic = 1, function(e) {
    (function() {
      function t(f, y, N) {
        return f.call.apply(f.bind, arguments);
      }
      function n(f, y, N) {
        if (!f) throw Error();
        if (2 < arguments.length) {
          var E = Array.prototype.slice.call(arguments, 2);
          return function() {
            var W = Array.prototype.slice.call(arguments);
            return Array.prototype.unshift.apply(W, E), f.apply(y, W);
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
        if (y = f.c.createElement(y), N) for (var W in N) N.hasOwnProperty(W) && (W == "style" ? y.style.cssText = N[W] : y.setAttribute(W, N[W]));
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
        for (var E = f.className.split(/\s+/), W = 0; W < y.length; W += 1) {
          for (var Q = !1, ie = 0; ie < E.length; ie += 1) if (y[W] === E[ie]) {
            Q = !0;
            break;
          }
          Q || E.push(y[W]);
        }
        for (y = [], W = 0; W < E.length; W += 1) {
          for (Q = !1, ie = 0; ie < N.length; ie += 1) if (E[W] === N[ie]) {
            Q = !0;
            break;
          }
          Q || y.push(E[W]);
        }
        f.className = y.join(" ").replace(/\s+/g, " ").replace(/^\s+|\s+$/, "");
      }
      function b(f, y) {
        for (var N = f.className.split(/\s+/), E = 0, W = N.length; E < W; E++) if (N[E] == y) return !0;
        return !1;
      }
      function k(f) {
        return f.o.location.hostname || f.a.location.hostname;
      }
      function I(f, y, N) {
        function E() {
          Ce && W && Q && (Ce(ie), Ce = null);
        }
        y = a(f, "link", { rel: "stylesheet", href: y, media: "all" });
        var W = !1, Q = !0, ie = null, Ce = N || null;
        o ? (y.onload = function() {
          W = !0, E();
        }, y.onerror = function() {
          W = !0, ie = Error("Stylesheet failed to load"), E();
        }) : setTimeout(function() {
          W = !0, E();
        }, 0), l(f, "head", y);
      }
      function O(f, y, N, E) {
        var W = f.c.getElementsByTagName("head")[0];
        if (W) {
          var Q = a(f, "script", { src: y }), ie = !1;
          return Q.onload = Q.onreadystatechange = function() {
            ie || this.readyState && this.readyState != "loaded" && this.readyState != "complete" || (ie = !0, N && N(null), Q.onload = Q.onreadystatechange = null, Q.parentNode.tagName == "HEAD" && W.removeChild(Q));
          }, W.appendChild(Q), setTimeout(function() {
            ie || (ie = !0, N && N(Error("Script load timeout")));
          }, E || 5e3), Q;
        }
        return null;
      }
      function j() {
        this.a = 0, this.c = null;
      }
      function ce(f) {
        return f.a++, function() {
          f.a--, ue(f);
        };
      }
      function R(f, y) {
        f.c = y, ue(f);
      }
      function ue(f) {
        f.a == 0 && f.c && (f.c(), f.c = null);
      }
      function me(f) {
        this.a = f || "-";
      }
      me.prototype.c = function(f) {
        for (var y = [], N = 0; N < arguments.length; N++) y.push(arguments[N].replace(/[\W_]+/g, "").toLowerCase());
        return y.join(this.a);
      };
      function C(f, y) {
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
          var E = f[N].replace(/['"]/g, "");
          E.indexOf(" ") != -1 || /^\d/.test(E) ? y.push("'" + E + "'") : y.push(E);
        }
        return y.join(",");
      }
      function q(f) {
        return f.a + f.f;
      }
      function se(f) {
        var y = "normal";
        return f.a === "o" ? y = "oblique" : f.a === "i" && (y = "italic"), y;
      }
      function de(f) {
        var y = 4, N = "n", E = null;
        return f && ((E = f.match(/(normal|oblique|italic)/i)) && E[1] && (N = E[1].substr(0, 1).toLowerCase()), (E = f.match(/([1-9]00|normal|bold)/i)) && E[1] && (/bold/i.test(E[1]) ? y = 7 : /[1-9]00/.test(E[1]) && (y = parseInt(E[1].substr(0, 1), 10)))), N + y;
      }
      function pe(f, y) {
        this.c = f, this.f = f.o.document.documentElement, this.h = y, this.a = new me("-"), this.j = y.events !== !1, this.g = y.classes !== !1;
      }
      function Le(f) {
        f.g && c(f.f, [f.a.c("wf", "loading")]), Ve(f, "loading");
      }
      function Ae(f) {
        if (f.g) {
          var y = b(f.f, f.a.c("wf", "active")), N = [], E = [f.a.c("wf", "loading")];
          y || N.push(f.a.c("wf", "inactive")), c(f.f, N, E);
        }
        Ve(f, "inactive");
      }
      function Ve(f, y, N) {
        f.j && f.h[y] && (N ? f.h[y](N.c, q(N)) : f.h[y]());
      }
      function $e() {
        this.c = {};
      }
      function et(f, y, N) {
        var E = [], W;
        for (W in y) if (y.hasOwnProperty(W)) {
          var Q = f.c[W];
          Q && E.push(Q(y[W], N));
        }
        return E;
      }
      function fe(f, y) {
        this.c = f, this.f = y, this.a = a(this.c, "span", { "aria-hidden": "true" }, this.f);
      }
      function we(f) {
        l(f.c, "body", f.a);
      }
      function ge(f) {
        return "display:block;position:absolute;top:-9999px;left:-9999px;font-size:300px;width:auto;height:auto;line-height:normal;margin:0;padding:0;font-variant:normal;white-space:nowrap;font-family:" + S(f.c) + ";" + ("font-style:" + se(f) + ";font-weight:" + (f.f + "00") + ";");
      }
      function Ye(f, y, N, E, W, Q) {
        this.g = f, this.j = y, this.a = E, this.c = N, this.f = W || 3e3, this.h = Q || void 0;
      }
      Ye.prototype.start = function() {
        var f = this.c.o.document, y = this, N = r(), E = new Promise(function(ie, Ce) {
          function Re() {
            r() - N >= y.f ? Ce() : f.fonts.load(M(y.a), y.h).then(function(Ie) {
              1 <= Ie.length ? ie() : setTimeout(Re, 25);
            }, function() {
              Ce();
            });
          }
          Re();
        }), W = null, Q = new Promise(function(ie, Ce) {
          W = setTimeout(Ce, y.f);
        });
        Promise.race([Q, E]).then(function() {
          W && (clearTimeout(W), W = null), y.g(y.a);
        }, function() {
          y.j(y.a);
        });
      };
      function Xe(f, y, N, E, W, Q, ie) {
        this.v = f, this.B = y, this.c = N, this.a = E, this.s = ie || "BESbswy", this.f = {}, this.w = W || 3e3, this.u = Q || null, this.m = this.j = this.h = this.g = null, this.g = new fe(this.c, this.s), this.h = new fe(this.c, this.s), this.j = new fe(this.c, this.s), this.m = new fe(this.c, this.s), f = new C(this.a.c + ",serif", q(this.a)), f = ge(f), this.g.a.style.cssText = f, f = new C(this.a.c + ",sans-serif", q(this.a)), f = ge(f), this.h.a.style.cssText = f, f = new C("serif", q(this.a)), f = ge(f), this.j.a.style.cssText = f, f = new C("sans-serif", q(this.a)), f = ge(f), this.m.a.style.cssText = f, we(this.g), we(this.h), we(this.j), we(this.m);
      }
      var rt = { D: "serif", C: "sans-serif" }, ze = null;
      function Lt() {
        if (ze === null) {
          var f = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent);
          ze = !!f && (536 > parseInt(f[1], 10) || parseInt(f[1], 10) === 536 && 11 >= parseInt(f[2], 10));
        }
        return ze;
      }
      Xe.prototype.start = function() {
        this.f.serif = this.j.a.offsetWidth, this.f["sans-serif"] = this.m.a.offsetWidth, this.A = r(), De(this);
      };
      function vn(f, y, N) {
        for (var E in rt) if (rt.hasOwnProperty(E) && y === f.f[rt[E]] && N === f.f[rt[E]]) return !0;
        return !1;
      }
      function De(f) {
        var y = f.g.a.offsetWidth, N = f.h.a.offsetWidth, E;
        (E = y === f.f.serif && N === f.f["sans-serif"]) || (E = Lt() && vn(f, y, N)), E ? r() - f.A >= f.w ? Lt() && vn(f, y, N) && (f.u === null || f.u.hasOwnProperty(f.a.c)) ? zt(f, f.v) : zt(f, f.B) : vt(f) : zt(f, f.v);
      }
      function vt(f) {
        setTimeout(s(function() {
          De(this);
        }, f), 50);
      }
      function zt(f, y) {
        setTimeout(s(function() {
          u(this.g.a), u(this.h.a), u(this.j.a), u(this.m.a), y(this.a);
        }, f), 0);
      }
      function qt(f, y, N) {
        this.c = f, this.a = y, this.f = 0, this.m = this.j = !1, this.s = N;
      }
      var Vt = null;
      qt.prototype.g = function(f) {
        var y = this.a;
        y.g && c(y.f, [y.a.c("wf", f.c, q(f).toString(), "active")], [y.a.c("wf", f.c, q(f).toString(), "loading"), y.a.c("wf", f.c, q(f).toString(), "inactive")]), Ve(y, "fontactive", f), this.m = !0, Nt(this);
      }, qt.prototype.h = function(f) {
        var y = this.a;
        if (y.g) {
          var N = b(y.f, y.a.c("wf", f.c, q(f).toString(), "active")), E = [], W = [y.a.c("wf", f.c, q(f).toString(), "loading")];
          N || E.push(y.a.c("wf", f.c, q(f).toString(), "inactive")), c(y.f, E, W);
        }
        Ve(y, "fontinactive", f), Nt(this);
      };
      function Nt(f) {
        --f.f == 0 && f.j && (f.m ? (f = f.a, f.g && c(f.f, [f.a.c("wf", "active")], [f.a.c("wf", "loading"), f.a.c("wf", "inactive")]), Ve(f, "active")) : Ae(f.a));
      }
      function bn(f) {
        this.j = f, this.a = new $e(), this.h = 0, this.f = this.g = !0;
      }
      bn.prototype.load = function(f) {
        this.c = new i(this.j, f.context || this.j), this.g = f.events !== !1, this.f = f.classes !== !1, v(this, new pe(this.c, f), f);
      };
      function g(f, y, N, E, W) {
        var Q = --f.h == 0;
        (f.f || f.g) && setTimeout(function() {
          var ie = W || null, Ce = E || null || {};
          if (N.length === 0 && Q) Ae(y.a);
          else {
            y.f += N.length, Q && (y.j = Q);
            var Re, Ie = [];
            for (Re = 0; Re < N.length; Re++) {
              var Ne = N[Re], it = Ce[Ne.c], ht = y.a, pn = Ne;
              if (ht.g && c(ht.f, [ht.a.c("wf", pn.c, q(pn).toString(), "loading")]), Ve(ht, "fontloading", pn), ht = null, Vt === null) if (window.FontFace) {
                var pn = /Gecko.*Firefox\/(\d+)/.exec(window.navigator.userAgent), Ht = /OS X.*Version\/10\..*Safari/.exec(window.navigator.userAgent) && /Apple/.exec(window.navigator.vendor);
                Vt = pn ? 42 < parseInt(pn[1], 10) : !Ht;
              } else Vt = !1;
              Vt ? ht = new Ye(s(y.g, y), s(y.h, y), y.c, Ne, y.s, it) : ht = new Xe(s(y.g, y), s(y.h, y), y.c, Ne, y.s, ie, it), Ie.push(ht);
            }
            for (Re = 0; Re < Ie.length; Re++) Ie[Re].start();
          }
        }, 0);
      }
      function v(f, y, N) {
        var W = [], E = N.timeout;
        Le(y);
        var W = et(f.a, N, f.c), Q = new qt(f.c, y, E);
        for (f.h = W.length, y = 0, N = W.length; y < N; y++) W[y].load(function(ie, Ce, Re) {
          g(f, Q, ie, Ce, Re);
        });
      }
      function L(f, y) {
        this.c = f, this.a = y;
      }
      L.prototype.load = function(f) {
        function y() {
          if (Q["__mti_fntLst" + E]) {
            var ie = Q["__mti_fntLst" + E](), Ce = [], Re;
            if (ie) for (var Ie = 0; Ie < ie.length; Ie++) {
              var Ne = ie[Ie].fontfamily;
              ie[Ie].fontStyle != null && ie[Ie].fontWeight != null ? (Re = ie[Ie].fontStyle + ie[Ie].fontWeight, Ce.push(new C(Ne, Re))) : Ce.push(new C(Ne));
            }
            f(Ce);
          } else setTimeout(function() {
            y();
          }, 50);
        }
        var N = this, E = N.a.projectId, W = N.a.version;
        if (E) {
          var Q = N.c.o;
          O(this.c, (N.a.api || "https://fast.fonts.net/jsapi") + "/" + E + ".js" + (W ? "?v=" + W : ""), function(ie) {
            ie ? f([]) : (Q["__MonotypeConfiguration__" + E] = function() {
              return N.a;
            }, y());
          }).id = "__MonotypeAPIScript__" + E;
        } else f([]);
      };
      function D(f, y) {
        this.c = f, this.a = y;
      }
      D.prototype.load = function(f) {
        var y, N, E = this.a.urls || [], W = this.a.families || [], Q = this.a.testStrings || {}, ie = new j();
        for (y = 0, N = E.length; y < N; y++) I(this.c, E[y], ce(ie));
        var Ce = [];
        for (y = 0, N = W.length; y < N; y++) if (E = W[y].split(":"), E[1]) for (var Re = E[1].split(","), Ie = 0; Ie < Re.length; Ie += 1) Ce.push(new C(E[0], Re[Ie]));
        else Ce.push(new C(E[0]));
        R(ie, function() {
          f(Ce, Q);
        });
      };
      function B(f, y) {
        f ? this.c = f : this.c = P, this.a = [], this.f = [], this.g = y || "";
      }
      var P = "https://fonts.googleapis.com/css";
      function X(f, y) {
        for (var N = y.length, E = 0; E < N; E++) {
          var W = y[E].split(":");
          W.length == 3 && f.f.push(W.pop());
          var Q = "";
          W.length == 2 && W[1] != "" && (Q = ":"), f.a.push(W.join(Q));
        }
      }
      function K(f) {
        if (f.a.length == 0) throw Error("No fonts to load!");
        if (f.c.indexOf("kit=") != -1) return f.c;
        for (var y = f.a.length, N = [], E = 0; E < y; E++) N.push(f.a[E].replace(/ /g, "+"));
        return y = f.c + "?family=" + N.join("%7C"), 0 < f.f.length && (y += "&subset=" + f.f.join(",")), 0 < f.g.length && (y += "&text=" + encodeURIComponent(f.g)), y;
      }
      function G(f) {
        this.f = f, this.a = [], this.c = {};
      }
      var F = { latin: "BESbswy", "latin-ext": "çöüğş", cyrillic: "йяЖ", greek: "αβΣ", khmer: "កខគ", Hanuman: "កខគ" }, re = { thin: "1", extralight: "2", "extra-light": "2", ultralight: "2", "ultra-light": "2", light: "3", regular: "4", book: "4", medium: "5", "semi-bold": "6", semibold: "6", "demi-bold": "6", demibold: "6", bold: "7", "extra-bold": "8", extrabold: "8", "ultra-bold": "8", ultrabold: "8", black: "9", heavy: "9", l: "3", r: "4", b: "7" }, Y = { i: "i", italic: "i", n: "n", normal: "n" }, ne = /^(thin|(?:(?:extra|ultra)-?)?light|regular|book|medium|(?:(?:semi|demi|extra|ultra)-?)?bold|black|heavy|l|r|b|[1-9]00)?(n|i|normal|italic)?$/;
      function he(f) {
        for (var y = f.f.length, N = 0; N < y; N++) {
          var E = f.f[N].split(":"), W = E[0].replace(/\+/g, " "), Q = ["n4"];
          if (2 <= E.length) {
            var ie, Ce = E[1];
            if (ie = [], Ce) for (var Ce = Ce.split(","), Re = Ce.length, Ie = 0; Ie < Re; Ie++) {
              var Ne;
              if (Ne = Ce[Ie], Ne.match(/^[\w-]+$/)) {
                var it = ne.exec(Ne.toLowerCase());
                if (it == null) Ne = "";
                else {
                  if (Ne = it[2], Ne = Ne == null || Ne == "" ? "n" : Y[Ne], it = it[1], it == null || it == "") it = "4";
                  else var ht = re[it], it = ht || (isNaN(it) ? "4" : it.substr(0, 1));
                  Ne = [Ne, it].join("");
                }
              } else Ne = "";
              Ne && ie.push(Ne);
            }
            0 < ie.length && (Q = ie), E.length == 3 && (E = E[2], ie = [], E = E ? E.split(",") : ie, 0 < E.length && (E = F[E[0]]) && (f.c[W] = E));
          }
          for (f.c[W] || (E = F[W]) && (f.c[W] = E), E = 0; E < Q.length; E += 1) f.a.push(new C(W, Q[E]));
        }
      }
      function _e(f, y) {
        this.c = f, this.a = y;
      }
      var be = { Arimo: !0, Cousine: !0, Tinos: !0 };
      _e.prototype.load = function(f) {
        var y = new j(), N = this.c, E = new B(this.a.api, this.a.text), W = this.a.families;
        X(E, W);
        var Q = new G(W);
        he(Q), I(N, K(E), ce(y)), R(y, function() {
          f(Q.a, Q.c, be);
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
            for (var W = [], Q = 0; Q < E.length; Q += 2) for (var ie = E[Q], Ce = E[Q + 1], Re = 0; Re < Ce.length; Re++) W.push(new C(ie, Ce[Re]));
            try {
              N.Typekit.load({ events: !1, classes: !1, async: !0 });
            } catch {
            }
            f(W);
          }
        }, 2e3) : f([]);
      };
      function Be(f, y) {
        this.c = f, this.f = y, this.a = [];
      }
      Be.prototype.load = function(f) {
        var y = this.f.id, N = this.c.o, E = this;
        y ? (N.__webfontfontdeckmodule__ || (N.__webfontfontdeckmodule__ = {}), N.__webfontfontdeckmodule__[y] = function(W, Q) {
          for (var ie = 0, Ce = Q.fonts.length; ie < Ce; ++ie) {
            var Re = Q.fonts[ie];
            E.a.push(new C(Re.name, de("font-weight:" + Re.weight + ";font-style:" + Re.style)));
          }
          f(E.a);
        }, O(this.c, (this.f.api || "https://f.fontdeck.com/s/css/js/") + k(this.c) + "/" + y + ".js", function(W) {
          W && f([]);
        })) : f([]);
      };
      var U = new bn(window);
      U.a.c.custom = function(f, y) {
        return new D(y, f);
      }, U.a.c.fontdeck = function(f, y) {
        return new Be(y, f);
      }, U.a.c.monotype = function(f, y) {
        return new L(y, f);
      }, U.a.c.typekit = function(f, y) {
        return new ke(y, f);
      }, U.a.c.google = function(f, y) {
        return new _e(y, f);
      };
      var z = { load: s(U.load, U) };
      e.exports ? e.exports = z : (window.WebFont = z, window.WebFontConfig && U.load(window.WebFontConfig));
    })();
  }(Vo)), Vo.exports;
}
var Fy = Dy();
const $y = /* @__PURE__ */ My(Fy), Oc = [
  "Space Grotesk:400,500,600,700",
  "Instrument Sans:400,500,600",
  "JetBrains Mono:400,500,600"
], By = (e) => {
  const t = [...Oc], n = (e == null ? void 0 : e.split(",")[0].trim().replace(/['"]/g, "")) || "", s = Oc.some(
    (r) => r.toLowerCase().startsWith(n.toLowerCase())
  );
  n && !s && t.push(n), $y.load({
    google: { families: t },
    active: () => {
      if (!e) return;
      const r = document.querySelector(".chat-container");
      r && (r.style.fontFamily = e.includes(",") ? e : `"${e}", system-ui, sans-serif`);
    }
  });
};
function Uy() {
  const e = oe({}), t = oe(""), n = (r) => {
    var i;
    e.value = r, r.photo_url && (e.value.photo_url = r.photo_url), By(r.font_family), Tt({
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
const zy = 13, Hy = 24;
function jy(e, t) {
  const n = Ji({}), s = [];
  let r = null;
  const i = typeof window < "u" && typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, o = (c) => {
    r || s.length === 0 || (r = setTimeout(a, c));
  }, a = () => {
    r = null;
    const c = s[0];
    if (c === void 0) return;
    const b = e.value[c], k = n[c], I = (b == null ? void 0 : b.message) ?? "";
    if (!k || !b) {
      s.shift(), o(0);
      return;
    }
    if (k.shown >= I.length) {
      k.done = !0, s.shift(), o(0);
      return;
    }
    k.shown += 1;
    const O = I[k.shown - 1];
    t == null || t(), o(O === " " ? Hy : zy);
  };
  bt(() => e.value.length, (c, b) => {
    b !== void 0 && c < b && (Object.keys(n).forEach((k) => {
      delete n[Number(k)];
    }), s.length = 0);
    for (let k = b ?? 0; k < c; k++) {
      const I = e.value[k];
      if (!I || !I.stream || k in n) continue;
      const O = I.message ?? "";
      i || !O ? n[k] = { shown: O.length, done: !0 } : (n[k] = { shown: 0, done: !1 }, s.push(k));
    }
    o(0);
  });
  const l = (c, b) => {
    const k = n[c];
    return k ? b.slice(0, k.shown) : b;
  }, u = (c) => {
    const b = n[c];
    return !!b && !b.done;
  };
  return ei(() => {
    r && clearTimeout(r);
  }), { displayText: l, isStreaming: u };
}
function Wy(e) {
  const t = oe(!0);
  let n = 0;
  const s = () => {
    Tt({ type: "UNREAD_COUNT", count: n });
  }, r = (i) => {
    var o;
    ((o = i == null ? void 0 : i.data) == null ? void 0 : o.type) === "WIDGET_VISIBILITY" && (t.value = !!i.data.open, t.value && n !== 0 && (n = 0, s()));
  };
  bt(() => e.value.length, (i, o) => {
    if (i <= (o ?? 0) || t.value) return;
    const a = e.value[i - 1];
    a && (a.message_type === "bot" || a.message_type === "agent") && (n += 1, s());
  }), to(() => window.addEventListener("message", r)), ei(() => window.removeEventListener("message", r));
}
const qy = {
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
}, Vy = {
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
}, Ky = {
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
}, Gy = {
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
}, Yy = {
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
}, Oi = {
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
}, Xy = {
  GLASS: qy,
  AURORA: Vy,
  TERMINAL: Ky,
  CALM_MINT: Gy,
  PLAYFUL: Yy,
  SUNRISE: Oi,
  CHATBOT: Oi,
  ASK_ANYTHING: Oi
}, Zy = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", Lc = "'Instrument Sans', system-ui, -apple-system, 'Segoe UI', sans-serif";
function Jy(e) {
  return Math.max(4, Math.round(e * 0.3));
}
function Nc(e) {
  const t = (e || "").replace("#", "");
  if (t.length < 6) return "#0B0C10";
  const n = parseInt(t.slice(0, 2), 16), s = parseInt(t.slice(2, 4), 16), r = parseInt(t.slice(4, 6), 16);
  return (0.299 * n + 0.587 * s + 0.114 * r) / 255 > 0.62 ? "#0B0C10" : "#FFFFFF";
}
function Qy(e) {
  return Xy[e || ""] || Oi;
}
const ev = "#212529";
function tv(e, t) {
  const n = Qy(e), s = (t == null ? void 0 : t.chat_background_color) || "", r = /^#[0-9a-fA-F]{6}$/.test(s), i = s || n.card, o = (t == null ? void 0 : t.chat_text_color) || "", l = /^#[0-9a-fA-F]{6}$/.test(o) && o.toLowerCase() !== ev ? o : r ? or(s) ? "#FFFFFF" : "#111111" : n.text, u = r ? or(s) ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.62)" : n.muted, c = r ? dp(s, 20) : n.agentBg, b = (t == null ? void 0 : t.accent_color) || n.accent, k = r ? !or(s) : n.light, I = Nc(b) === "#0B0C10", O = k === I ? u : b, j = n.mono ? Zy : t != null && t.font_family ? `${t.font_family}, ${Lc}` : Lc;
  return {
    "--cm-card": i,
    "--cm-text": l,
    "--cm-muted": u,
    "--cm-agent-bg": c,
    "--cm-accent": b,
    "--cm-on-accent": Nc(b),
    "--cm-presence": O,
    "--cm-border": n.border,
    "--cm-glow": n.glow,
    "--cm-radius": `${n.radius}px`,
    "--cm-bubble": `${n.bubble}px`,
    "--cm-bubble-tail": `${Jy(n.bubble)}px`,
    "--cm-field-radius": n.mono ? "7px" : "12px",
    "--cm-avatar-radius": n.mono ? "28%" : "50%",
    "--cm-hairline": n.light ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.08)",
    "--cm-body-font": j
  };
}
const Pc = (e) => {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: e || "USD" }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
};
function nv() {
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
        minimumFractionDigits: Pc(r),
        maximumFractionDigits: Pc(r)
      }) : String(s);
      return i ? `${i}${a}` : a;
    },
    getCurrencySymbol: (s) => e[s] || s,
    currencySymbols: e
  };
}
const sv = {
  key: 0,
  class: "widget-unavailable-overlay"
}, rv = { class: "widget-unavailable-card" }, iv = {
  key: 0,
  class: "widget-unavailable-footer"
}, ov = {
  key: 1,
  class: "auth-error-overlay"
}, av = { class: "auth-error-card" }, lv = { class: "auth-error-message" }, cv = {
  key: 0,
  class: "initializing-overlay"
}, uv = {
  key: 0,
  class: "connecting-message"
}, fv = {
  key: 1,
  class: "failed-message"
}, hv = { class: "welcome-content" }, dv = { class: "welcome-header" }, pv = ["src", "alt"], mv = { class: "welcome-title" }, gv = { class: "welcome-subtitle" }, _v = { class: "welcome-input-container" }, yv = {
  key: 0,
  class: "email-input"
}, vv = ["disabled"], bv = { class: "welcome-message-input" }, wv = ["placeholder", "disabled"], kv = ["disabled"], Tv = {
  key: 0,
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, Av = {
  key: 1,
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, Sv = { class: "landing-page-content" }, xv = { class: "landing-page-header" }, Ev = { class: "landing-page-heading" }, Cv = { class: "landing-page-text" }, Rv = { class: "landing-page-actions" }, Iv = { class: "form-fullscreen-content" }, Ov = {
  key: 0,
  class: "form-header"
}, Lv = {
  key: 0,
  class: "form-title"
}, Nv = {
  key: 1,
  class: "form-description"
}, Pv = { class: "form-fields" }, Mv = ["for"], Dv = {
  key: 0,
  class: "required-indicator"
}, Fv = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "autocomplete", "inputmode"], $v = ["id", "placeholder", "required", "min", "max", "value", "onInput"], Bv = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput"], Uv = ["id", "required", "value", "onChange"], zv = { value: "" }, Hv = ["value"], jv = {
  key: 4,
  class: "checkbox-field"
}, Wv = ["id", "required", "checked", "onChange"], qv = { class: "checkbox-label" }, Vv = {
  key: 5,
  class: "radio-group"
}, Kv = ["name", "value", "required", "checked", "onChange"], Gv = { class: "radio-label" }, Yv = {
  key: 6,
  class: "field-error"
}, Xv = { class: "form-actions" }, Zv = ["disabled"], Jv = {
  key: 0,
  class: "loading-spinner-inline"
}, Qv = { key: 1 }, eb = { class: "header-content" }, tb = ["src", "alt"], nb = { class: "header-info" }, sb = { class: "status" }, rb = { class: "status-text cm-presence" }, ib = { class: "header-actions" }, ob = ["disabled", "title", "aria-label", "aria-expanded"], ab = { class: "ask-anything-header" }, lb = ["src", "alt"], cb = { class: "header-info" }, ub = {
  key: 2,
  class: "loading-history"
}, fb = { class: "cm-email-gate-title" }, hb = ["disabled"], db = {
  key: 0,
  class: "cm-email-gate-error"
}, pb = ["disabled"], mb = {
  key: 1,
  class: "cm-welcome-block"
}, gb = { class: "message agent-message cm-welcome-row" }, _b = ["src", "alt"], yb = {
  key: 0,
  class: "cm-msg-avatar",
  "aria-hidden": "true"
}, vb = ["src"], bb = ["src"], wb = { class: "message-col" }, kb = {
  key: 0,
  class: "rating-content"
}, Tb = { class: "rating-prompt" }, Ab = ["onMouseover", "onMouseleave", "onClick", "disabled"], Sb = {
  key: 0,
  class: "feedback-wrapper"
}, xb = { class: "feedback-section" }, Eb = ["onUpdate:modelValue", "disabled"], Cb = { class: "feedback-counter" }, Rb = ["onClick", "disabled"], Ib = {
  key: 1,
  class: "submitted-feedback-wrapper"
}, Ob = { class: "submitted-feedback" }, Lb = { class: "submitted-feedback-text" }, Nb = {
  key: 2,
  class: "submitted-message"
}, Pb = {
  key: 1,
  class: "form-content"
}, Mb = {
  key: 0,
  class: "form-header"
}, Db = {
  key: 0,
  class: "form-title"
}, Fb = {
  key: 1,
  class: "form-description"
}, $b = { class: "form-fields" }, Bb = ["for"], Ub = {
  key: 0,
  class: "required-indicator"
}, zb = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "disabled", "autocomplete", "inputmode"], Hb = ["id", "placeholder", "required", "min", "max", "value", "onInput", "disabled"], jb = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "disabled"], Wb = ["id", "required", "value", "onChange", "disabled"], qb = { value: "" }, Vb = ["value"], Kb = {
  key: 4,
  class: "checkbox-field"
}, Gb = ["id", "checked", "onChange", "disabled"], Yb = ["for"], Xb = {
  key: 5,
  class: "radio-field"
}, Zb = ["id", "name", "value", "checked", "onChange", "disabled"], Jb = ["for"], Qb = {
  key: 6,
  class: "field-error"
}, ew = { class: "form-actions" }, tw = ["onClick", "disabled"], nw = {
  key: 2,
  class: "user-input-content"
}, sw = {
  key: 0,
  class: "user-input-prompt"
}, rw = {
  key: 1,
  class: "user-input-form"
}, iw = ["onUpdate:modelValue", "onKeydown"], ow = ["onClick", "disabled"], aw = {
  key: 2,
  class: "user-input-submitted"
}, lw = {
  key: 0,
  class: "user-input-confirmation"
}, cw = {
  key: 3,
  class: "product-message-container"
}, uw = ["innerHTML"], fw = {
  key: 1,
  class: "products-carousel"
}, hw = { class: "carousel-items" }, dw = {
  key: 0,
  class: "product-image-compact"
}, pw = ["src", "alt"], mw = { class: "product-info-compact" }, gw = { class: "product-text-area" }, _w = { class: "product-title-compact" }, yw = {
  key: 0,
  class: "product-variant-compact"
}, vw = { class: "product-price-compact" }, bw = { class: "product-actions-compact" }, ww = ["onClick"], kw = {
  key: 2,
  class: "no-products-message"
}, Tw = {
  key: 3,
  class: "no-products-message"
}, Aw = ["innerHTML"], Sw = ["innerHTML"], xw = {
  key: 2,
  class: "message-attachments"
}, Ew = {
  key: 0,
  class: "attachment-image-container"
}, Cw = ["src", "alt", "onClick"], Rw = { class: "attachment-image-info" }, Iw = ["href"], Ow = { class: "attachment-size" }, Lw = ["href"], Nw = { class: "attachment-size" }, Pw = {
  key: 0,
  class: "citation-chips"
}, Mw = ["title"], Dw = { class: "message-info" }, Fw = {
  key: 0,
  class: "agent-name"
}, $w = {
  key: 2,
  class: "message agent-message cm-welcome-row cm-host-prompt"
}, Bw = ["src", "alt"], Uw = {
  key: 5,
  class: "cm-quick-actions-bar"
}, zw = ["disabled", "onClick"], Hw = {
  key: 0,
  class: "file-previews-widget"
}, jw = {
  class: "file-preview-content-widget",
  style: { cursor: "pointer" }
}, Ww = ["src", "alt", "onClick"], qw = ["onClick"], Vw = { class: "file-preview-info-widget" }, Kw = { class: "file-preview-name-widget" }, Gw = { class: "file-preview-size-widget" }, Yw = ["onClick"], Xw = {
  key: 1,
  class: "upload-progress-widget"
}, Zw = { class: "message-input" }, Jw = ["placeholder", "disabled"], Qw = ["disabled", "title"], e0 = ["disabled"], t0 = {
  key: 2,
  class: "cm-secret-hint",
  role: "alert"
}, n0 = {
  key: 7,
  class: "new-conversation-section"
}, s0 = { class: "conversation-ended-message" }, r0 = {
  key: 8,
  class: "ai-disclaimer"
}, i0 = {
  key: 8,
  class: "rating-dialog"
}, o0 = { class: "rating-content" }, a0 = { class: "star-rating" }, l0 = ["onClick"], c0 = { class: "rating-actions" }, u0 = ["disabled"], f0 = {
  key: 0,
  class: "preview-modal-image-container"
}, h0 = ["src", "alt"], d0 = { class: "preview-modal-filename" }, p0 = {
  key: 3,
  class: "widget-loading"
}, Mc = 3, m0 = "image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls", g0 = /* @__PURE__ */ Ps({
  __name: "WidgetBuilder",
  props: {
    widgetId: {},
    token: {},
    initialAuthError: {}
  },
  setup(e) {
    const t = e, n = le(() => {
      var h;
      return t.widgetId || ((h = window.__INITIAL_DATA__) == null ? void 0 : h.widgetId);
    }), {
      customization: s,
      agentName: r,
      applyCustomization: i,
      initializeFromData: o
    } = Uy(), { formatCurrency: a } = nv(), {
      messages: l,
      loading: u,
      errorMessage: c,
      showError: b,
      loadingHistory: k,
      hasStartedChat: I,
      connectionStatus: O,
      sendMessage: j,
      endChat: ce,
      loadChatHistory: R,
      connect: ue,
      reconnect: me,
      cleanup: C,
      humanAgent: M,
      onTakeover: S,
      refusal: q,
      submitRating: se,
      submitForm: de,
      currentForm: pe,
      getWorkflowState: Le,
      proceedWorkflow: Ae,
      onWorkflowState: Ve,
      onWorkflowProceeded: $e,
      currentSessionId: et,
      setToken: fe,
      setWidgetId: we,
      onSessionState: ge,
      onReauthorize: Ye,
      on: Xe,
      emit: rt
    } = by(), ze = oe(null), { receipts: Lt, addReceipt: vn, receiptsAfter: De } = Qg(l), { pendingConfirm: vt, approveAction: zt, declineAction: qt, runLocalAction: Vt } = Oy(
      { on: Xe, emit: rt },
      (h) => {
        ze.value = h;
      },
      vn
    ), { journeyProgress: Nt, chipBusy: bn, runChip: g, skipStep: v, dismissJourney: L, noteActivity: D } = Py({
      on: Xe,
      emit: rt,
      currentPrompt: () => ze.value,
      showPrompt: (h) => {
        ze.value = h;
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
      runLocalAction: Vt
    }), B = (h) => {
      if (h.kind === "action" && !bn.value && !vt.value) {
        const m = X.value, d = (/* @__PURE__ */ new Date()).toISOString();
        m && l.value.push({ message: m.message, message_type: "bot", created_at: d, session_id: "", attributes: { source: m.source } }), l.value.push({ message: h.label, message_type: "user", created_at: d, session_id: "", attributes: { source: "journey" } });
      }
      g(h, Hs);
    }, P = le(() => {
      const h = ze.value;
      return !(h != null && h.chips.length) || vt.value || u.value ? [] : h.chips;
    }), X = le(() => {
      const h = ze.value;
      return !h || h.source !== "journey" ? h : l.value.some((d) => d.message_type === "bot" && d.message === h.message) ? null : h;
    }), { displayText: K, isStreaming: G } = jy(l, () => is(() => gn()));
    Wy(l);
    const F = oe(""), re = oe(!0), Y = oe(""), ne = oe(!1), he = (h) => {
      const m = h.target;
      F.value = m.value;
    };
    let _e = null;
    const be = () => {
      _e && _e.disconnect(), _e = new MutationObserver((m) => {
        let d = !1, J = !1;
        m.forEach((Se) => {
          if (Se.type === "childList") {
            const ve = Array.from(Se.addedNodes).some(
              (ot) => {
                var Ze;
                return ot.nodeType === Node.ELEMENT_NODE && (ot.matches("input, textarea") || ((Ze = ot.querySelector) == null ? void 0 : Ze.call(ot, "input, textarea")));
              }
            ), ut = Array.from(Se.removedNodes).some(
              (ot) => {
                var Ze;
                return ot.nodeType === Node.ELEMENT_NODE && (ot.matches("input, textarea") || ((Ze = ot.querySelector) == null ? void 0 : Ze.call(ot, "input, textarea")));
              }
            );
            ve && (J = !0, d = !0), ut && (d = !0);
          }
        }), d && (clearTimeout(be.timeoutId), be.timeoutId = setTimeout(() => {
          y();
        }, J ? 50 : 100));
      });
      const h = document.querySelector(".widget-container") || document.body;
      _e.observe(h, {
        childList: !0,
        subtree: !0
      });
    };
    be.timeoutId = null;
    let ke = [];
    const Be = /* @__PURE__ */ new Set();
    let U = !1;
    const z = (h) => {
      if (U) return;
      const m = setTimeout(() => {
        Be.delete(m), y();
      }, h);
      Be.add(m);
    }, f = () => {
      Be.forEach(clearTimeout), Be.clear();
    }, y = () => {
      N();
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
      for (const d of h) {
        const J = document.querySelectorAll(d);
        if (J.length > 0) {
          m = Array.from(J);
          break;
        }
      }
      m.length !== 0 && (ke = m, m.forEach((d) => {
        d.addEventListener("input", W, !0), d.addEventListener("keyup", W, !0), d.addEventListener("change", W, !0), d.addEventListener("keypress", Q, !0), d.addEventListener("keydown", ie, !0);
      }));
    }, N = () => {
      ke.forEach((h) => {
        h.removeEventListener("input", W), h.removeEventListener("keyup", W), h.removeEventListener("change", W), h.removeEventListener("keypress", Q), h.removeEventListener("keydown", ie);
      }), ke = [];
    }, E = (h) => !!(h && h.closest && h.closest(".form-message, .form-fullscreen, .cm-email-gate")), W = (h) => {
      if (E(h.target)) return;
      const m = h.target;
      F.value = m.value;
    }, Q = (h) => {
      E(h.target) || h.key === "Enter" && !h.shiftKey && (h.preventDefault(), h.stopPropagation(), mn());
    }, ie = (h) => {
      E(h.target) || h.key === "Enter" && !h.shiftKey && (h.preventDefault(), h.stopPropagation(), mn());
    }, Ce = (h) => {
      const m = h.target, d = document.querySelector(".header-menu-container");
      document.querySelector(".header-menu-btn");
      const J = document.querySelector(".header-dropdown-menu");
      J && !(d != null && d.contains(m)) && (J.style.display = "none");
    }, Re = oe(!0), {
      token: Ie,
      start: Ne,
      stop: it,
      setToken: ht,
      ensureFresh: pn
    } = __({
      onTokenChanged: (h) => {
        Rs() && Tt({ type: "TOKEN_UPDATE", token: h }), fe(h);
      },
      onIdentityExpired: () => {
        Ja();
      },
      // A framed widget holds the token only in memory: the host page keeps it, so
      // it must hear when the widget lets it go.
      onTokenCleared: () => {
        Vi() && Rs() && Tt({ type: "TOKEN_CLEAR" });
      },
      store: uf(n.value || "")
    });
    le(() => !!Ie.value);
    const Ht = oe(null), Kt = oe(!1), fr = oe(!1);
    t.initialAuthError && (Ht.value = t.initialAuthError, Kt.value = !0, Re.value = !1), o();
    const Pt = window.__INITIAL_DATA__;
    Ne((Pt == null ? void 0 : Pt.widgetId) || "", Pt == null ? void 0 : Pt.initialToken), Ie.value && (ne.value = !0);
    const On = oe(!1);
    (Pt == null ? void 0 : Pt.allowAttachments) !== void 0 && (On.value = Pt.allowAttachments);
    const Mt = oe(null), {
      chatStyles: sn,
      chatIconStyles: hr,
      agentBubbleStyles: Wn,
      userBubbleStyles: wn,
      messageNameStyles: rn,
      headerBorderStyles: Fs,
      photoUrl: St,
      shadowStyle: dr
    } = k_(s), si = oe(null), {
      uploadedAttachments: xt,
      previewModal: uo,
      previewFile: ps,
      formatFileSize: nt,
      isImageAttachment: qn,
      getDownloadUrl: $s,
      getPreviewUrl: pr,
      handleFileSelect: Bs,
      handleDrop: mr,
      handleDragOver: gr,
      handleDragLeave: ri,
      handlePaste: ii,
      removeAttachment: fo,
      openPreview: _r,
      closePreview: Gt,
      openFilePicker: yr,
      isImage: ms
    } = S_(Ie, si);
    le(() => l.value.some(
      (h) => h.message_type === "form" && (!h.isSubmitted || h.isSubmitted === !1)
    ));
    const Dt = le(() => {
      var h;
      return I.value && ne.value || !vo.value ? O.value === "connected" && !u.value : Cr(Y.value.trim()) && O.value === "connected" && !u.value || ((h = window.__INITIAL_DATA__) == null ? void 0 : h.workflow);
    }), gs = le(() => Dt.value || u.value && O.value === "connected" && I.value), Vn = le(() => O.value === "connected" ? ln.value ? "Ask me anything..." : "Type a message..." : "Connecting..."), Us = oe(!1), zs = le(() => i_(F.value)), mn = async () => {
      if (!F.value.trim() && xt.value.length === 0 || zs.value) return;
      if (u.value && I.value) {
        Us.value = !0;
        return;
      }
      !I.value && Y.value && await on();
      const h = xt.value.map((J) => ({
        content: J.content,
        // base64 content
        filename: J.filename,
        content_type: J.type,
        size: J.size
      }));
      D();
      const m = X.value;
      ze.value = null, m && l.value.push({
        message: m.message,
        message_type: "bot",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: "",
        attributes: { source: m.source }
      }), await j(
        F.value,
        Y.value,
        h,
        m ? { host_prompt: m.message, host_prompt_source: m.source } : {}
      ), xt.value.forEach((J) => {
        J.url && J.url.startsWith("blob:") && URL.revokeObjectURL(J.url), J.file_url && J.file_url.startsWith("blob:") && URL.revokeObjectURL(J.file_url);
      }), F.value = "", xt.value = [];
      const d = document.querySelector('input[placeholder*="Type a message"]');
      d && (d.value = ""), z(500);
    };
    bt(u, (h) => {
      h || !Us.value || (Us.value = !1, O.value === "connected" && I.value && mn());
    });
    const Hs = (h) => {
      Dt.value && (F.value = h, mn());
    }, Ln = () => {
      Tt({ type: "WIDGET_MINIMIZE" });
    }, js = (h) => {
      h.key === "Enter" && !h.shiftKey && (h.preventDefault(), h.stopPropagation(), mn());
    }, on = async ({ afterRefusal: h = !1 } = {}) => {
      var m, d, J, Se;
      try {
        if (!n.value)
          return console.error("Widget ID is not available"), Ht.value = "Widget ID is not available. Please refresh and try again.", Kt.value = !0, !1;
        await pn(n.value);
        const ve = new URL(`${Ns.API_URL}/widgets/${n.value}`);
        Y.value.trim() && Cr(Y.value.trim()) && ve.searchParams.append("email", Y.value.trim());
        const ut = {
          Accept: "application/json",
          "Content-Type": "application/json"
        };
        Ie.value && (ut.Authorization = `Bearer ${Ie.value}`);
        const ot = await fetch(ve, {
          headers: ut,
          cache: "no-store"
        });
        if (ot.status === 401) {
          ne.value = !1;
          try {
            const Jn = (await ot.json()).detail;
            if ((Jn == null ? void 0 : Jn.code) === h_)
              return Ja(), !1;
            const Xs = typeof Jn == "string" ? Jn : "";
            (Xs.includes("generate-token") || Xs.includes("API key") || Xs.includes("Token required")) && (fr.value = !0, Ht.value = "Widget authentication not configured. Please contact the website administrator.", Kt.value = !0, ht(null));
          } catch {
            Ht.value = "Authentication required. Your token has expired or is invalid. Please refresh the page.", Kt.value = !0, ht(null);
          }
          return !1;
        }
        if (!ot.ok) {
          try {
            const Ar = await ot.json();
            Ht.value = Ar.detail || `Error: ${ot.statusText}`;
          } catch {
            Ht.value = `Error: ${ot.statusText}. Please try again.`;
          }
          return Kt.value = !0, !1;
        }
        const Ze = await ot.json();
        Ze.token && ht(Ze.token), ne.value = !0, Ht.value = null, Kt.value = !1, fe(Ie.value || void 0);
        const Tr = await ue();
        return !Tr && oa(q.value) && !h ? await on({ afterRefusal: !0 }) : (Tr || console.error("Chat service not reachable yet; retrying in the background"), await Kn(), (m = Ze.agent) != null && m.customization && i(Ze.agent.customization), Ze.agent && !(Ze != null && Ze.human_agent) && (r.value = Ze.agent.name), Ze != null && Ze.human_agent && (M.value = Ze.human_agent), ((d = Ze.agent) == null ? void 0 : d.allow_attachments) !== void 0 && (On.value = Ze.agent.allow_attachments), ((J = Ze.agent) == null ? void 0 : J.workflow) !== void 0 && (window.__INITIAL_DATA__ = window.__INITIAL_DATA__ || {}, window.__INITIAL_DATA__.workflow = Ze.agent.workflow), (Se = Ze.agent) != null && Se.workflow && await Le(), !0);
      } catch (ve) {
        return console.error("Error checking authorization:", ve), Ht.value = "An unexpected error occurred. Please try again.", Kt.value = !0, ne.value = !1, !1;
      } finally {
        Re.value = !1;
      }
    }, Kn = async () => {
      !I.value && ne.value && (I.value = !0, await R());
    }, gn = () => {
      Mt.value && (Mt.value.scrollTop = Mt.value.scrollHeight);
    };
    bt(() => l.value, (h) => {
      is(() => {
        gn();
      });
    }, { deep: !0 }), bt([vt, ze, () => Lt.value.length, u], ([h, m, d, J]) => {
      (h || m || d || J) && is(() => gn());
    }), bt(O, (h, m) => {
      h === "connected" && m !== "connected" && z(100);
    }), bt(() => l.value.length, (h, m) => {
      h > 0 && m === 0 && z(100);
    });
    let Yt = null;
    bt(() => l.value, (h) => {
      const m = h[h.length - 1];
      !vc(m) || m === Yt || (Yt = m, A(m));
    }, { deep: !0 });
    const ho = async () => {
      (await me() || oa(q.value)) && await on();
    }, _s = oe(!1), Ws = oe(0), qs = oe(""), Xt = oe(0), Zt = oe(!1), lt = oe({}), gt = oe(!1), ct = oe({}), Nn = oe(!1), ys = oe(null), vr = oe("Start Chat"), an = oe(!1), _t = oe(null);
    le(() => {
      var m;
      const h = l.value[l.value.length - 1];
      return ((m = h == null ? void 0 : h.attributes) == null ? void 0 : m.request_rating) || !1;
    });
    const V = le(() => {
      var m;
      if (!((m = window.__INITIAL_DATA__) != null && m.workflow))
        return !1;
      const h = l.value.find((d) => d.message_type === "rating");
      return (h == null ? void 0 : h.isSubmitted) === !0;
    }), p = le(
      () => Wi(M.value.human_agent_profile_pic)
    ), A = async (h) => {
      var m, d, J, Se, ve;
      if (vc(h)) {
        try {
          if (h.session_id && Ie.value && n.value) {
            const ut = await Za(h.session_id, {
              reason: (m = h.attributes) == null ? void 0 : m.end_chat_reason,
              description: (d = h.attributes) == null ? void 0 : d.end_chat_description
            });
            if (ut.ok) {
              const ot = await ut.json();
              console.info(`✓ Chat session closed on backend: ${ot.session_id}`);
            } else
              console.warn(`Failed to close session on backend: ${ut.status}`);
          }
        } catch (ut) {
          console.error("Error calling end-chat API:", ut);
        }
        if ((J = h.attributes) != null && J.end_chat && ((Se = h.attributes) != null && Se.request_rating)) {
          const ut = h.agent_name || ((ve = M.value) == null ? void 0 : ve.human_agent_name) || r.value || "our agent";
          l.value.push({
            message: `Rate the chat session that you had with ${ut}`,
            message_type: "rating",
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            session_id: h.session_id,
            agent_name: ut,
            showFeedback: !1
          }), et.value = h.session_id;
        }
      }
    }, H = (h) => {
      Zt.value || (Xt.value = h);
    }, te = () => {
      if (!Zt.value) {
        const h = l.value[l.value.length - 1];
        Xt.value = (h == null ? void 0 : h.selectedRating) || 0;
      }
    }, ae = async (h) => {
      if (!Zt.value) {
        Xt.value = h;
        const m = l.value[l.value.length - 1];
        m && m.message_type === "rating" && (m.showFeedback = !0, m.selectedRating = h);
      }
    }, ye = async (h, m, d = null) => {
      try {
        Zt.value = !0, await se(m, d);
        const J = l.value.find((Se) => Se.message_type === "rating");
        J && (J.isSubmitted = !0, J.finalRating = m, J.finalFeedback = d);
      } catch (J) {
        console.error("Failed to submit rating:", J);
      } finally {
        Zt.value = !1;
      }
    }, Ge = (h) => {
      const m = {};
      for (const d of h.fields) {
        const J = lt.value[d.name], Se = vs(d, J);
        Se && (m[d.name] = Se);
      }
      return ct.value = m, Object.keys(m).length === 0;
    }, st = async (h) => {
      if (!(gt.value || !Ge(h)))
        try {
          gt.value = !0, await de(lt.value);
          const d = l.value.findIndex(
            (J) => J.message_type === "form" && (!J.isSubmitted || J.isSubmitted === !1)
          );
          d !== -1 && l.value.splice(d, 1), lt.value = {}, ct.value = {};
        } catch (d) {
          console.error("Failed to submit form:", d);
        } finally {
          gt.value = !1;
        }
    }, Ke = (h, m) => {
      var d, J;
      if (lt.value[h] = m, m && m.toString().trim() !== "") {
        let Se = null;
        if ((d = _t.value) != null && d.fields && (Se = _t.value.fields.find((ve) => ve.name === h)), !Se && ((J = pe.value) != null && J.fields) && (Se = pe.value.fields.find((ve) => ve.name === h)), Se) {
          const ve = vs(Se, m);
          ve ? (ct.value[h] = ve, console.log(`Validation error for ${h}:`, ve)) : delete ct.value[h];
        }
      } else
        delete ct.value[h], console.log(`Cleared error for ${h}`);
    }, Et = (h) => {
      const m = h.replace(/\D/g, "");
      return m.length >= 7 && m.length <= 15;
    }, vs = (h, m) => {
      if (h.required && (!m || m.toString().trim() === ""))
        return `${h.label} is required`;
      if (!m || m.toString().trim() === "")
        return null;
      if (h.type === "email" && !Cr(m))
        return "Please enter a valid email address";
      if (h.type === "tel" && !Et(m))
        return "Please enter a valid phone number";
      if ((h.type === "text" || h.type === "textarea") && h.minLength && m.length < h.minLength)
        return `${h.label} must be at least ${h.minLength} characters`;
      if ((h.type === "text" || h.type === "textarea") && h.maxLength && m.length > h.maxLength)
        return `${h.label} must not exceed ${h.maxLength} characters`;
      if (h.type === "number") {
        const d = parseFloat(m);
        if (isNaN(d))
          return `${h.label} must be a valid number`;
        if (h.minLength && d < h.minLength)
          return `${h.label} must be at least ${h.minLength}`;
        if (h.maxLength && d > h.maxLength)
          return `${h.label} must not exceed ${h.maxLength}`;
      }
      return null;
    }, kt = async () => {
      if (!(gt.value || !_t.value))
        try {
          gt.value = !0, ct.value = {};
          let h = !1;
          for (const m of _t.value.fields || []) {
            const d = lt.value[m.name], J = vs(m, d);
            J && (ct.value[m.name] = J, h = !0, console.log(`Validation error for field ${m.name}:`, J));
          }
          if (h) {
            gt.value = !1, console.log("Validation failed, not submitting");
            return;
          }
          await de(lt.value), an.value = !1, _t.value = null, lt.value = {};
        } catch (h) {
          console.error("Failed to submit full screen form:", h);
        } finally {
          gt.value = !1, console.log("Full screen form submission completed");
        }
    }, oi = (h, m) => {
      if (console.log("handleViewDetails called with:", { product: h, shopDomain: m }), !h) {
        console.error("No product provided to handleViewDetails");
        return;
      }
      let d = null;
      if (h.handle && m)
        d = `https://${m}/products/${h.handle}`;
      else if (h.id && m)
        d = `https://${m}/products/${h.id}`;
      else if (m) {
        if (!h.handle && !h.id) {
          console.error("Product handle and ID are both missing! Product:", h), alert("Unable to open product: Product information incomplete.");
          return;
        }
      } else {
        console.error("Shop domain is missing! Product:", h), alert("Unable to open product: Shop domain not available. Please contact support.");
        return;
      }
      d && (console.log("Opening product URL:", d), window.open(d, "_blank", "noopener"));
    }, Ga = (h) => {
      if (!h) return "";
      let m = h.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "");
      const d = [];
      return m = m.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (J, Se, ve) => {
        const ut = `__MARKDOWN_LINK_${d.length}__`;
        return console.log("Found markdown link:", J, "-> placeholder:", ut), d.push(J), ut;
      }), console.log("After replacing markdown links with placeholders:", m), console.log("Markdown links array:", d), m = m.replace(/https?:\/\/[^\s\)]+/g, "[link removed]"), console.log("After removing standalone URLs:", m), d.forEach((J, Se) => {
        m = m.replace(`__MARKDOWN_LINK_${Se}__`, J), console.log(`Restored markdown link ${Se}:`, J);
      }), m = m.replace(/\n\s*\n\s*\n/g, `

`).trim(), m;
    }, Ya = oe(!1);
    oe(!1);
    const po = le(() => {
      var h;
      return !!((h = M.value) != null && h.human_agent_name);
    }), Xa = le(() => {
      var h;
      return u_((h = window.__INITIAL_DATA__) == null ? void 0 : h.presence, po.value);
    }), Vs = le(() => {
      var h;
      return !((h = window.__INITIAL_DATA__) != null && h.hideBranding);
    }), Af = le(() => On.value && po.value && xt.value.length < Mc), Sf = async () => {
      try {
        Nn.value = !1, ys.value = null, await Ae();
      } catch (h) {
        console.error("Failed to proceed workflow:", h);
      }
    }, mo = async (h) => {
      try {
        if (!h.userInputValue || !h.userInputValue.trim())
          return;
        const m = h.userInputValue.trim();
        h.isSubmitted = !0, h.submittedValue = m, await j(m, Y.value);
      } catch (m) {
        console.error("Failed to submit user input:", m), h.isSubmitted = !1, h.submittedValue = null;
      }
    }, Za = (h, { reason: m, description: d, keepalive: J = !1 } = {}) => {
      const Se = new URL(`${Ns.API_URL}/widgets/${n.value}/end-chat`);
      return Se.searchParams.append("session_id", h), m && Se.searchParams.append("reason", m), d && Se.searchParams.append("description", d), fetch(Se, {
        method: "POST",
        keepalive: J,
        headers: {
          Authorization: `Bearer ${Ie.value}`,
          "Content-Type": "application/json"
        }
      });
    }, xf = async (h) => {
      try {
        typeof h == "string" && h && Ie.value && n.value && await Za(h, { reason: "CUSTOMER_REQUEST", keepalive: !0 });
      } catch {
      } finally {
        Tt({ type: "END_CHAT_DONE" });
      }
    }, Ja = () => {
      if (!Rs()) {
        Qa();
        return;
      }
      Tt({ type: "IDENTITY_EXPIRED" });
    }, Qa = async () => {
      Ie.value && (ht(null), await br());
    }, Ef = async (h) => {
      const m = as(h);
      !m || m === Ie.value || (ht(m), await br());
    }, br = async () => {
      var h, m, d;
      try {
        let J = 0;
        const Se = 50;
        for (; !((h = window.__INITIAL_DATA__) != null && h.widgetId) && J < Se; )
          await new Promise((ut) => setTimeout(ut, 100)), J++;
        return (m = window.__INITIAL_DATA__) != null && m.widgetId ? (we(window.__INITIAL_DATA__.widgetId), await on() ? ((d = window.__INITIAL_DATA__) != null && d.workflow && ne.value && await Le(), !0) : (O.value = "connected", !1)) : (console.error("Widget data not available after waiting"), !1);
      } catch (J) {
        return console.error("Failed to initialize widget:", J), !1;
      }
    };
    window.addEventListener("message", (h) => {
      h.source === window.parent && (!h.data || typeof h.data.type != "string" || (h.data.type === "SCROLL_TO_BOTTOM" && gn(), h.data.type === "HOST_PAGE" && cf(h.data.url), h.data.type === "END_CHAT" && Rs() && xf(h.data.sessionId), h.data.type === "IDENTITY_UNAVAILABLE" && Rs() && Qa(), h.data.type === "TOKEN_REFRESH" && Rs() && Ef(h.data.token), h.data.type === "WIDGET_VISIBILITY" && (cl.value = !!h.data.open), h.data.type === "WIDGET_DISPLAY" && (bo.value = {
        mode: h.data.mode,
        width: h.data.width,
        height: h.data.height,
        hotkey: h.data.hotkey
      }), h.data.type === "PREFILL_MESSAGE" && typeof h.data.text == "string" && (F.value = h.data.text.slice(0, 2e3), is(() => {
        const m = document.querySelector(
          ".message-input input, .welcome-message-field"
        );
        m == null || m.focus();
      }))));
    }), window.addEventListener("keydown", (h) => {
      h.key !== "Escape" || h.defaultPrevented || !Vi() || Tt({ type: "WIDGET_ESCAPE" });
    });
    const Cf = () => {
      S(async () => {
        await on();
      }), Ye(async () => {
        await on();
      }), ge(({ session_id: h, authenticated: m, created: d }) => {
        Tt({
          type: "CHAT_SESSION",
          sessionId: h,
          authenticated: m,
          created: d
        });
      }), Ve((h) => {
        var m;
        if (vr.value = h.button_text || "Start Chat", h.type === "landing_page")
          ys.value = h.landing_page_data, Nn.value = !0, an.value = !1;
        else if (h.type === "form" || h.type === "display_form")
          if (((m = h.form_data) == null ? void 0 : m.form_full_screen) === !0)
            _t.value = h.form_data, an.value = !0, Nn.value = !1;
          else {
            const d = {
              message: "",
              message_type: "form",
              attributes: {
                form_data: h.form_data
              },
              created_at: (/* @__PURE__ */ new Date()).toISOString(),
              isSubmitted: !1
            };
            l.value.findIndex(
              (Se) => Se.message_type === "form" && !Se.isSubmitted
            ) === -1 && l.value.push(d), Nn.value = !1, an.value = !1;
          }
        else
          Nn.value = !1, an.value = !1;
      }), $e((h) => {
        console.log("Workflow proceeded:", h);
      });
    }, Rf = async () => {
      try {
        await br(), await Le();
      } catch (h) {
        throw console.error("Failed to start new conversation:", h), h;
      }
    }, ai = le(
      () => {
        var h;
        return s.value.allow_new_chat === !0 && l.value.length > 0 && !((h = M.value) != null && h.human_agent_name) && !ws.value;
      }
    ), Gn = oe(!1), Yn = oe(""), Xn = oe(!1);
    let bs = null;
    const Ks = () => {
      Xn.value = !1, Yn.value = "", bs && (clearTimeout(bs), bs = null);
    }, el = () => {
      if (!Gn.value) {
        if (Xn.value) {
          Ks();
          return;
        }
        Xn.value = !0, Yn.value = "", bs = setTimeout(Ks, Dm);
      }
    };
    bt(ai, (h) => {
      h || Ks();
    });
    const tl = async () => {
      Gn.value || (bs && (clearTimeout(bs), bs = null), await If(), Yn.value || (Xn.value = !1));
    }, If = async () => {
      if (!Gn.value) {
        Gn.value = !0, Yn.value = "";
        try {
          if (!await ce()) {
            Yn.value = yc;
            return;
          }
          M.value = {}, F.value = "", xt.value = [], await br();
        } catch (h) {
          console.error("Failed to start a new chat:", h), Yn.value = yc;
        } finally {
          Gn.value = !1;
        }
      }
    }, Of = async () => {
      V.value = !1, l.value = [], M.value = {}, await Rf();
    };
    to(async () => {
      await br(), Cf(), be(), document.addEventListener("click", Ce), (() => {
        const m = l.value.length > 0, d = O.value === "connected", J = document.querySelector('input[type="text"], textarea') !== null;
        return m || d || J;
      })() && z(100);
    }), ei(() => {
      window.removeEventListener("message", (h) => {
        h.data.type === "SCROLL_TO_BOTTOM" && gn();
      }), document.removeEventListener("click", Ce), _e && (_e.disconnect(), _e = null), be.timeoutId && (clearTimeout(be.timeoutId), be.timeoutId = null), U = !0, f(), N(), it(), Ks(), C();
    });
    const Gs = le(() => s.value.chat_style === "AURORA"), ln = le(() => s.value.chat_style === "ASK_ANYTHING" || Gs.value), nl = le(() => s.value.customization_metadata), wr = le(() => {
      var m;
      const h = (m = nl.value) == null ? void 0 : m.avatar_style;
      return h === "orb" ? !0 : h === "photo" ? !1 : Gs.value && !s.value.photo_url;
    }), Ys = le(() => {
      var h;
      return l_(r.value || "", (h = nl.value) == null ? void 0 : h.orb_variant);
    }), Lf = {
      GLASS: "theme-glass",
      TERMINAL: "theme-terminal",
      PLAYFUL: "theme-playful",
      CALM_MINT: "theme-calm",
      SUNRISE: "theme-sunrise"
    }, Nf = le(() => Lf[s.value.chat_style] || ""), Pf = le(() => tv(s.value.chat_style, {
      chat_background_color: s.value.chat_background_color,
      chat_text_color: s.value.chat_text_color,
      accent_color: s.value.accent_color,
      font_family: s.value.font_family
    })), go = le(
      () => Array.isArray(s.value.quick_actions) ? s.value.quick_actions.filter((h) => !!h && h.trim().length > 0) : []
    ), sl = le(() => (s.value.welcome_message || "").trim()), rl = le(
      () => !ln.value && l.value.length === 0 && !k.value && !ws.value
    ), Mf = le(
      () => rl.value && sl.value.length > 0
    ), Df = le(
      () => rl.value && !V.value && go.value.length > 0
    ), li = le(() => s.value.show_citations === !0), il = le(() => c_(s.value.show_ai_disclaimer, po.value)), Ff = (h) => /^[0-9a-f]{16,}$/i.test(h) || /^[0-9a-f-]{32,}$/i.test(h), _o = (h) => {
      const m = (h || "").trim().toLowerCase();
      return !m || m === "unknown" ? "Knowledge base" : m.charAt(0).toUpperCase() + m.slice(1);
    }, yo = (h) => {
      let m = ((h == null ? void 0 : h.name) || "").trim();
      return !m || (m = m.replace(/^[0-9a-f]{16,}[_-]/i, "").replace(/\.(pdf|txt|md|html?|docx?|csv|json)$/i, ""), !m || Ff(m)) ? _o(h == null ? void 0 : h.type) : m;
    }, ol = (h) => {
      const m = yo(h), d = _o(h == null ? void 0 : h.type);
      return m === d ? d : `${m} · ${d}`;
    }, vo = le(() => s.value.collect_email === !0 && !ln.value), al = oe(!1), Zn = oe(""), kr = oe(!1), ws = le(() => !I.value && vo.value && !al.value), ll = async () => {
      const h = Y.value.trim();
      if (!h) {
        Zn.value = "Please enter your email address.";
        return;
      }
      if (!Cr(h)) {
        Zn.value = "Please enter a valid email address.";
        return;
      }
      Zn.value = "", kr.value = !0;
      try {
        await on(), al.value = !0;
      } catch {
        Zn.value = "Something went wrong. Please try again.";
      } finally {
        kr.value = !1;
      }
    }, bo = oe(null), cl = oe(!0), wo = { mode: "floating", width: 400, height: 560 }, ci = le(
      () => {
        var h;
        return bo.value || ((h = s.value.customization_metadata) == null ? void 0 : h.widget_display) || null;
      }
    ), $f = le(() => {
      const h = ci.value;
      return h ? typeof h.mode == "string" && h.mode !== wo.mode || typeof h.width == "number" && h.width !== wo.width || typeof h.height == "number" && h.height !== wo.height : !1;
    }), Bf = le(() => {
      var m;
      const h = {
        width: "100%",
        height: "100%",
        borderRadius: "var(--radius-lg)"
      };
      if ($f.value) {
        const d = (m = ci.value) == null ? void 0 : m.mode;
        return d === "sidebar-left" || d === "sidebar-right" ? { ...h, borderRadius: "0" } : h;
      }
      return ln.value ? window.innerWidth <= 768 ? {
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
    }), ul = le(() => ln.value && l.value.length === 0), Uf = ["form", "user_input", "rating", "product", "shopify_output"], zf = le(
      () => l.value.some(
        (h) => Uf.includes(h.message_type) || Array.isArray(h.attachments) && h.attachments.length > 0
      )
    ), Hf = le(() => {
      var m, d;
      return ln.value ? !0 : (((m = ci.value) == null ? void 0 : m.mode) === "ask-ai" || ((d = ci.value) == null ? void 0 : d.mode) === "search-bar") && !On.value;
    }), ko = le(
      () => Hf.value && re.value && !Nn.value && !an.value && !ws.value && !V.value && !zf.value
    );
    bt(ko, (h) => {
      Tt({ type: "WIDGET_SURFACE", palette: h });
    }, { immediate: !0 });
    const jf = le(
      () => s.value.welcome_subtitle || `Ask a question — ${r.value || "the assistant"} answers from what it knows.`
    ), Wf = le(() => {
      var h;
      return ((h = bo.value) == null ? void 0 : h.hotkey) !== !1;
    });
    return (h, m) => Kt.value && fr.value ? (w(), T("div", sv, [
      _("button", {
        type: "button",
        class: "cm-error-close",
        "aria-label": "Close chat",
        title: "Close",
        onClick: Ln
      }, "×"),
      _("div", rv, [
        m[21] || (m[21] = es('<div class="widget-unavailable-icon-wrapper" data-v-b548aa90><svg class="widget-unavailable-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-v-b548aa90><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" data-v-b548aa90></path><path d="M9 12l2 2 4-4" data-v-b548aa90></path></svg></div><h2 class="widget-unavailable-title" data-v-b548aa90>Chat Unavailable</h2><p class="widget-unavailable-message" data-v-b548aa90> This chat widget is not currently configured. Please contact the website administrator to enable chat support. </p>', 3)),
        Vs.value ? (w(), T("div", iv, m[20] || (m[20] = [
          es('<svg class="chattermate-logo-small" width="14" height="14" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-b548aa90><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-b548aa90></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-b548aa90></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-b548aa90></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-b548aa90></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-b548aa90><span class="cm-powered-prefix" data-v-b548aa90>Powered by </span><strong class="cm-brand" data-v-b548aa90>ChatterMate</strong></a>', 2)
        ]))) : ee("", !0)
      ])
    ])) : Kt.value ? (w(), T("div", ov, [
      _("button", {
        type: "button",
        class: "cm-error-close",
        "aria-label": "Close chat",
        title: "Close",
        onClick: Ln
      }, "×"),
      _("div", av, [
        m[22] || (m[22] = es('<div class="auth-error-header" data-v-b548aa90><svg class="auth-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-b548aa90><circle cx="12" cy="12" r="10" data-v-b548aa90></circle><line x1="12" y1="8" x2="12" y2="12" data-v-b548aa90></line><line x1="12" y1="16" x2="12.01" y2="16" data-v-b548aa90></line></svg><h2 data-v-b548aa90>Authentication Error</h2></div>', 1)),
        _("p", lv, Z(Ht.value), 1),
        _("button", {
          class: "auth-error-refresh-btn",
          onClick: m[0] || (m[0] = () => h.window.location.reload())
        }, " Refresh Page ")
      ])
    ])) : n.value && !Kt.value ? (w(), T("div", {
      key: 2,
      class: Pe(["chat-container cm-surface", [{ collapsed: !re.value, "ask-anything-style": ln.value, aurora: Gs.value }, Nf.value]]),
      style: Ee({ ...x(dr), ...Bf.value, ...Pf.value })
    }, [
      Re.value ? (w(), T("div", cv, m[23] || (m[23] = [
        es('<div class="loading-spinner" data-v-b548aa90><div class="dot" data-v-b548aa90></div><div class="dot" data-v-b548aa90></div><div class="dot" data-v-b548aa90></div></div><div class="loading-text" data-v-b548aa90>Initializing chat...</div>', 2)
      ]))) : ee("", !0),
      !Re.value && x(O) !== "connected" ? (w(), T("div", {
        key: 1,
        class: Pe(["connection-status", x(O)])
      }, [
        x(O) === "connecting" ? (w(), T("div", uv, m[24] || (m[24] = [
          Mn(" Connecting to chat service... ", -1),
          _("div", { class: "loading-dots" }, [
            _("div", { class: "dot" }),
            _("div", { class: "dot" }),
            _("div", { class: "dot" })
          ], -1)
        ]))) : x(O) === "failed" ? (w(), T("div", fv, [
          m[25] || (m[25] = Mn(" Connection failed. ", -1)),
          _("button", {
            onClick: ho,
            class: "reconnect-button"
          }, " Click here to reconnect ")
        ])) : ee("", !0)
      ], 2)) : ee("", !0),
      x(b) ? (w(), T("div", {
        key: 2,
        class: "error-alert",
        style: Ee(x(hr))
      }, Z(x(c)), 5)) : ee("", !0),
      ko.value ? (w(), ss(ug, {
        key: 3,
        messages: x(l),
        draft: F.value,
        "agent-name": x(r),
        suggestions: go.value,
        "welcome-title": x(s).welcome_title,
        "welcome-subtitle": jf.value,
        placeholder: Vn.value,
        "input-enabled": Dt.value,
        "typing-enabled": gs.value,
        loading: x(u),
        "show-citations": li.value,
        disclaimer: il.value ? x(bc) : "",
        "show-branding": Vs.value,
        active: cl.value,
        hotkey: Wf.value,
        "can-start-new-chat": ai.value,
        "starting-new-chat": Gn.value,
        "new-chat-armed": Xn.value,
        "new-chat-error": Yn.value,
        onNewChat: el,
        onConfirmNewChat: tl,
        onCancelNewChat: Ks,
        "citation-label": yo,
        "citation-tooltip": ol,
        "display-text": x(K),
        "is-streaming": x(G),
        "onUpdate:draft": m[1] || (m[1] = (d) => F.value = d),
        onSend: mn,
        onAsk: Hs,
        onClose: Ln
      }, null, 8, ["messages", "draft", "agent-name", "suggestions", "welcome-title", "welcome-subtitle", "placeholder", "input-enabled", "typing-enabled", "loading", "show-citations", "disclaimer", "show-branding", "active", "hotkey", "can-start-new-chat", "starting-new-chat", "new-chat-armed", "new-chat-error", "display-text", "is-streaming"])) : ul.value ? (w(), T("div", {
        key: 4,
        class: Pe(["welcome-message-section", { aurora: Gs.value }]),
        style: Ee(x(sn))
      }, [
        _("div", hv, [
          _("div", dv, [
            wr.value ? (w(), T("div", {
              key: 0,
              class: "welcome-orb",
              style: Ee(Ys.value)
            }, null, 4)) : x(St) ? (w(), T("img", {
              key: 1,
              src: x(St),
              alt: x(r),
              class: "welcome-avatar"
            }, null, 8, pv)) : ee("", !0),
            _("h1", mv, Z(x(s).welcome_title || `Welcome to ${x(r)}`), 1),
            _("p", gv, Z(x(s).welcome_subtitle || "I'm here to help you with anything you need. What can I assist you with today?"), 1)
          ])
        ]),
        _("div", _v, [
          !x(I) && !ne.value && vo.value ? (w(), T("div", yv, [
            Qn(_("input", {
              "onUpdate:modelValue": m[2] || (m[2] = (d) => Y.value = d),
              type: "email",
              placeholder: "Enter your email address",
              disabled: x(u) || x(O) !== "connected",
              class: Pe([{
                invalid: Y.value.trim() && !x(Cr)(Y.value.trim()),
                disabled: x(O) !== "connected"
              }, "welcome-email-input"])
            }, null, 10, vv), [
              [As, Y.value]
            ])
          ])) : ee("", !0),
          _("div", bv, [
            Qn(_("input", {
              "onUpdate:modelValue": m[3] || (m[3] = (d) => F.value = d),
              type: "text",
              placeholder: Vn.value,
              onKeypress: js,
              onInput: he,
              onChange: he,
              disabled: !gs.value,
              class: Pe([{ disabled: !gs.value }, "welcome-message-field"])
            }, null, 42, wv), [
              [As, F.value]
            ]),
            _("button", {
              class: Pe(["welcome-send-button", { "aurora-send": Gs.value }]),
              style: Ee(x(wn)),
              onClick: mn,
              disabled: !F.value.trim() || !Dt.value || zs.value
            }, [
              Gs.value ? (w(), T("svg", Tv, m[26] || (m[26] = [
                _("path", {
                  d: "M12 19V5M12 5L5 12M12 5L19 12",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                }, null, -1)
              ]))) : (w(), T("svg", Av, m[27] || (m[27] = [
                _("path", {
                  d: "M5 12L3 21L21 12L3 3L5 12ZM5 12L13 12",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                }, null, -1)
              ])))
            ], 14, kv)
          ])
        ]),
        Vs.value ? (w(), T("div", {
          key: 0,
          class: "powered-by-welcome",
          style: Ee(x(rn))
        }, m[28] || (m[28] = [
          es('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-b548aa90><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-b548aa90></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-b548aa90></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-b548aa90></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-b548aa90></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-b548aa90><span class="cm-powered-prefix" data-v-b548aa90>Powered by </span><strong class="cm-brand" data-v-b548aa90>ChatterMate</strong></a>', 2)
        ]), 4)) : ee("", !0)
      ], 6)) : ee("", !0),
      Nn.value && ys.value ? (w(), T("div", {
        key: 5,
        class: "landing-page-fullscreen",
        style: Ee(x(sn))
      }, [
        _("div", Sv, [
          _("div", xv, [
            _("h2", Ev, Z(ys.value.heading), 1),
            _("div", Cv, Z(ys.value.content), 1)
          ]),
          _("div", Rv, [
            _("button", {
              class: "landing-page-button",
              onClick: Sf
            }, Z(vr.value), 1)
          ])
        ]),
        Vs.value ? (w(), T("div", {
          key: 0,
          class: "powered-by-landing",
          style: Ee(x(rn))
        }, m[29] || (m[29] = [
          es('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-b548aa90><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-b548aa90></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-b548aa90></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-b548aa90></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-b548aa90></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-b548aa90><span class="cm-powered-prefix" data-v-b548aa90>Powered by </span><strong class="cm-brand" data-v-b548aa90>ChatterMate</strong></a>', 2)
        ]), 4)) : ee("", !0)
      ], 4)) : an.value && _t.value ? (w(), T("div", {
        key: 6,
        class: "form-fullscreen",
        style: Ee(x(sn))
      }, [
        _("div", Iv, [
          _t.value.title || _t.value.description ? (w(), T("div", Ov, [
            _t.value.title ? (w(), T("h2", Lv, Z(_t.value.title), 1)) : ee("", !0),
            _t.value.description ? (w(), T("p", Nv, Z(_t.value.description), 1)) : ee("", !0)
          ])) : ee("", !0),
          _("div", Pv, [
            (w(!0), T(Oe, null, ft(_t.value.fields, (d) => {
              var J, Se;
              return w(), T("div", {
                key: d.name,
                class: "form-field"
              }, [
                _("label", {
                  for: `fullscreen-form-${d.name}`,
                  class: "field-label"
                }, [
                  Mn(Z(d.label) + " ", 1),
                  d.required ? (w(), T("span", Dv, "*")) : ee("", !0)
                ], 8, Mv),
                d.type === "text" || d.type === "email" || d.type === "tel" ? (w(), T("input", {
                  key: 0,
                  id: `fullscreen-form-${d.name}`,
                  type: d.type,
                  placeholder: d.placeholder || "",
                  required: d.required,
                  minlength: d.minLength,
                  maxlength: d.maxLength,
                  value: lt.value[d.name] || "",
                  onInput: (ve) => Ke(d.name, ve.target.value),
                  onBlur: (ve) => Ke(d.name, ve.target.value),
                  class: Pe(["form-input", { error: ct.value[d.name] }]),
                  autocomplete: d.type === "email" ? "email" : d.type === "tel" ? "tel" : "off",
                  inputmode: d.type === "tel" ? "tel" : d.type === "email" ? "email" : "text"
                }, null, 42, Fv)) : d.type === "number" ? (w(), T("input", {
                  key: 1,
                  id: `fullscreen-form-${d.name}`,
                  type: "number",
                  placeholder: d.placeholder || "",
                  required: d.required,
                  min: d.minLength,
                  max: d.maxLength,
                  value: lt.value[d.name] || "",
                  onInput: (ve) => Ke(d.name, ve.target.value),
                  class: Pe(["form-input", { error: ct.value[d.name] }])
                }, null, 42, $v)) : d.type === "textarea" ? (w(), T("textarea", {
                  key: 2,
                  id: `fullscreen-form-${d.name}`,
                  placeholder: d.placeholder || "",
                  required: d.required,
                  minlength: d.minLength,
                  maxlength: d.maxLength,
                  value: lt.value[d.name] || "",
                  onInput: (ve) => Ke(d.name, ve.target.value),
                  class: Pe(["form-textarea", { error: ct.value[d.name] }]),
                  rows: "4"
                }, null, 42, Bv)) : d.type === "select" ? (w(), T("select", {
                  key: 3,
                  id: `fullscreen-form-${d.name}`,
                  required: d.required,
                  value: lt.value[d.name] || "",
                  onChange: (ve) => Ke(d.name, ve.target.value),
                  class: Pe(["form-select", { error: ct.value[d.name] }])
                }, [
                  _("option", zv, Z(d.placeholder || "Please select..."), 1),
                  (w(!0), T(Oe, null, ft((Array.isArray(d.options) ? d.options : ((J = d.options) == null ? void 0 : J.split(`
`)) || []).filter((ve) => ve.trim()), (ve) => (w(), T("option", {
                    key: ve,
                    value: ve.trim()
                  }, Z(ve.trim()), 9, Hv))), 128))
                ], 42, Uv)) : d.type === "checkbox" ? (w(), T("label", jv, [
                  _("input", {
                    id: `fullscreen-form-${d.name}`,
                    type: "checkbox",
                    required: d.required,
                    checked: lt.value[d.name] || !1,
                    onChange: (ve) => Ke(d.name, ve.target.checked),
                    class: "form-checkbox"
                  }, null, 40, Wv),
                  _("span", qv, Z(d.label), 1)
                ])) : d.type === "radio" ? (w(), T("div", Vv, [
                  (w(!0), T(Oe, null, ft((Array.isArray(d.options) ? d.options : ((Se = d.options) == null ? void 0 : Se.split(`
`)) || []).filter((ve) => ve.trim()), (ve) => (w(), T("label", {
                    key: ve,
                    class: "radio-field"
                  }, [
                    _("input", {
                      type: "radio",
                      name: `fullscreen-form-${d.name}`,
                      value: ve.trim(),
                      required: d.required,
                      checked: lt.value[d.name] === ve.trim(),
                      onChange: (ut) => Ke(d.name, ve.trim()),
                      class: "form-radio"
                    }, null, 40, Kv),
                    _("span", Gv, Z(ve.trim()), 1)
                  ]))), 128))
                ])) : ee("", !0),
                ct.value[d.name] ? (w(), T("div", Yv, Z(ct.value[d.name]), 1)) : ee("", !0)
              ]);
            }), 128))
          ]),
          _("div", Xv, [
            _("button", {
              onClick: m[4] || (m[4] = () => {
                console.log("Submit button clicked!"), kt();
              }),
              disabled: gt.value,
              class: "submit-form-button",
              style: Ee(x(wn))
            }, [
              gt.value ? (w(), T("span", Jv, m[30] || (m[30] = [
                _("div", { class: "dot" }, null, -1),
                _("div", { class: "dot" }, null, -1),
                _("div", { class: "dot" }, null, -1)
              ]))) : (w(), T("span", Qv, Z(_t.value.submit_button_text || "Submit"), 1))
            ], 12, Zv)
          ])
        ]),
        Vs.value ? (w(), T("div", {
          key: 0,
          class: "powered-by-landing",
          style: Ee(x(rn))
        }, m[31] || (m[31] = [
          es('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-b548aa90><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-b548aa90></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-b548aa90></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-b548aa90></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-b548aa90></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-b548aa90><span class="cm-powered-prefix" data-v-b548aa90>Powered by </span><strong class="cm-brand" data-v-b548aa90>ChatterMate</strong></a>', 2)
        ]), 4)) : ee("", !0)
      ], 4)) : !ul.value && re.value && !ko.value ? (w(), T("div", {
        key: 7,
        class: Pe(["chat-panel", { "ask-anything-chat": ln.value }]),
        style: Ee(x(sn))
      }, [
        ln.value ? (w(), T("div", {
          key: 1,
          class: "ask-anything-top",
          style: Ee(x(Fs))
        }, [
          _("div", ab, [
            p.value || x(St) ? (w(), T("img", {
              key: 0,
              src: p.value || x(St),
              alt: x(M).human_agent_name || x(r),
              class: "header-avatar"
            }, null, 8, lb)) : ee("", !0),
            _("div", cb, [
              _("h3", {
                style: Ee(x(rn))
              }, Z(x(r)), 5),
              _("p", {
                class: "ask-anything-subtitle",
                style: Ee(x(rn))
              }, Z(x(s).welcome_subtitle || "Ask me anything. I'm here to help."), 5)
            ])
          ])
        ], 4)) : (w(), T("div", {
          key: 0,
          class: "chat-header",
          style: Ee(x(Fs))
        }, [
          _("div", {
            class: "cm-header-sheen",
            style: Ee({ background: "linear-gradient(90deg, transparent, " + (x(s).accent_color || "#C9F24E") + ", transparent)" })
          }, null, 4),
          _("div", eb, [
            !p.value && (wr.value || !x(St)) ? (w(), T("div", {
              key: 0,
              class: "header-orb",
              style: Ee(Ys.value)
            }, null, 4)) : p.value || x(St) ? (w(), T("img", {
              key: 1,
              src: p.value || x(St),
              alt: x(M).human_agent_name || x(r),
              class: "header-avatar"
            }, null, 8, tb)) : ee("", !0),
            _("div", nb, [
              _("h3", {
                style: Ee(x(rn))
              }, Z(x(M).human_agent_name || x(r)), 5),
              _("div", sb, [
                _("span", {
                  class: Pe(["status-indicator", Xa.value.online ? "online" : "away"])
                }, null, 2),
                _("span", rb, Z(Xa.value.text), 1)
              ])
            ])
          ]),
          _("div", ib, [
            ai.value ? (w(), T("button", {
              key: 0,
              type: "button",
              class: Pe(["header-new-chat", { armed: Xn.value }]),
              style: Ee(x(rn)),
              disabled: Gn.value,
              title: x(Hi),
              "aria-label": x(Hi),
              "aria-expanded": Xn.value,
              onClick: el
            }, m[32] || (m[32] = [
              _("svg", {
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
                _("path", { d: "M12 20h9" }),
                _("path", { d: "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" })
              ], -1)
            ]), 14, ob)) : ee("", !0),
            _("button", {
              type: "button",
              class: "header-minimize",
              style: Ee(x(rn)),
              title: "Minimize",
              "aria-label": "Minimize chat",
              onClick: Ln
            }, m[33] || (m[33] = [
              _("svg", {
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
                _("path", { d: "M6 9l6 6 6-6" })
              ], -1)
            ]), 4)
          ])
        ], 4)),
        x(k) ? (w(), T("div", ub, m[34] || (m[34] = [
          _("div", { class: "loading-spinner" }, [
            _("div", { class: "dot" }),
            _("div", { class: "dot" }),
            _("div", { class: "dot" })
          ], -1)
        ]))) : ee("", !0),
        ws.value ? (w(), T("div", {
          key: 3,
          class: "cm-email-gate",
          style: Ee(x(sn))
        }, [
          _("div", {
            class: "cm-email-gate-orb",
            style: Ee(Ys.value)
          }, null, 4),
          _("h3", fb, Z(x(s).welcome_title || "Before we start"), 1),
          m[35] || (m[35] = _("p", { class: "cm-email-gate-text" }, "Enter your email and we'll continue the chat.", -1)),
          Qn(_("input", {
            "onUpdate:modelValue": m[5] || (m[5] = (d) => Y.value = d),
            type: "email",
            inputmode: "email",
            autocomplete: "email",
            placeholder: "you@example.com",
            class: Pe(["cm-email-gate-input", { invalid: !!Zn.value }]),
            disabled: kr.value,
            onKeyup: ki(ll, ["enter"]),
            onInput: m[6] || (m[6] = (d) => Zn.value = "")
          }, null, 42, hb), [
            [As, Y.value]
          ]),
          Zn.value ? (w(), T("p", db, Z(Zn.value), 1)) : ee("", !0),
          _("button", {
            type: "button",
            class: "cm-email-gate-btn",
            style: Ee(x(wn)),
            disabled: kr.value,
            onClick: ll
          }, Z(kr.value ? "Please wait…" : "Continue to chat"), 13, pb)
        ], 4)) : ee("", !0),
        Xn.value && ai.value ? (w(), ss(tf, {
          key: 4,
          busy: Gn.value,
          error: Yn.value,
          onConfirm: tl,
          onCancel: Ks
        }, null, 8, ["busy", "error"])) : ee("", !0),
        Qn(_("div", {
          class: "chat-messages",
          ref_key: "messagesContainer",
          ref: Mt,
          role: "log",
          "aria-label": "Messages"
        }, [
          x(Nt) ? (w(), ss(Gg, {
            key: 0,
            progress: x(Nt),
            onSkip: x(v),
            onHide: x(L)
          }, null, 8, ["progress", "onSkip", "onHide"])) : ee("", !0),
          Mf.value ? (w(), T("div", mb, [
            _("div", gb, [
              wr.value || !x(St) ? (w(), T("div", {
                key: 0,
                class: "cm-welcome-orb",
                style: Ee(Ys.value)
              }, null, 4)) : (w(), T("img", {
                key: 1,
                src: x(St),
                alt: x(r),
                class: "cm-welcome-avatar"
              }, null, 8, _b)),
              _("div", {
                class: "message-bubble cm-welcome-bubble",
                style: Ee(x(Wn))
              }, Z(sl.value), 5)
            ])
          ])) : ee("", !0),
          (w(!0), T(Oe, null, ft(x(l), (d, J) => {
            var Se, ve, ut, ot, Ze, Tr, Ar, Jn, Xs, fl, hl, dl, pl, ml, gl, _l, yl, vl, bl;
            return w(), T(Oe, { key: J }, [
              _("div", {
                class: Pe([
                  "message",
                  d.message_type === "bot" || d.message_type === "agent" ? "agent-message" : d.message_type === "system" ? "system-message" : d.message_type === "rating" ? "rating-message" : d.message_type === "form" ? "form-message" : d.message_type === "product" || d.shopify_output ? "product-message" : "user-message"
                ])
              }, [
                d.message_type === "bot" || d.message_type === "agent" ? (w(), T("div", yb, [
                  p.value ? (w(), T("img", {
                    key: 0,
                    src: p.value,
                    class: "cm-msg-avatar-img",
                    alt: ""
                  }, null, 8, vb)) : !wr.value && x(St) ? (w(), T("img", {
                    key: 1,
                    src: x(St),
                    class: "cm-msg-avatar-img",
                    alt: ""
                  }, null, 8, bb)) : (w(), T("div", {
                    key: 2,
                    class: "cm-msg-avatar-orb",
                    style: Ee(Ys.value)
                  }, null, 4))
                ])) : ee("", !0),
                _("div", wb, [
                  _("div", {
                    class: "message-bubble",
                    style: Ee(d.message_type === "system" || d.message_type === "rating" || d.message_type === "form" || d.message_type === "product" || d.shopify_output ? {} : d.message_type === "user" ? x(wn) : x(Wn))
                  }, [
                    d.message_type === "rating" ? (w(), T("div", kb, [
                      _("p", Tb, "Rate the chat session that you had with " + Z(d.agent_name || x(M).human_agent_name || x(r) || "our agent"), 1),
                      _("div", {
                        class: Pe(["star-rating", { submitted: Zt.value || d.isSubmitted }])
                      }, [
                        (w(), T(Oe, null, ft(5, ($) => _("button", {
                          key: $,
                          class: Pe(["star-button", {
                            warning: $ <= (d.isSubmitted ? d.finalRating : Xt.value || d.selectedRating) && (d.isSubmitted ? d.finalRating : Xt.value || d.selectedRating) <= 3,
                            success: $ <= (d.isSubmitted ? d.finalRating : Xt.value || d.selectedRating) && (d.isSubmitted ? d.finalRating : Xt.value || d.selectedRating) > 3,
                            selected: $ <= (d.isSubmitted ? d.finalRating : Xt.value || d.selectedRating)
                          }]),
                          onMouseover: (Jt) => !d.isSubmitted && H($),
                          onMouseleave: (Jt) => !d.isSubmitted && te,
                          onClick: (Jt) => !d.isSubmitted && ae($),
                          disabled: Zt.value || d.isSubmitted
                        }, " ★ ", 42, Ab)), 64))
                      ], 2),
                      d.showFeedback && !d.isSubmitted ? (w(), T("div", Sb, [
                        _("div", xb, [
                          Qn(_("input", {
                            "onUpdate:modelValue": ($) => d.feedback = $,
                            placeholder: "Please share your feedback (optional)",
                            disabled: Zt.value,
                            maxlength: "500",
                            class: "feedback-input"
                          }, null, 8, Eb), [
                            [As, d.feedback]
                          ]),
                          _("div", Cb, Z(((Se = d.feedback) == null ? void 0 : Se.length) || 0) + "/500", 1)
                        ]),
                        _("button", {
                          onClick: ($) => ye(d.session_id, Xt.value, d.feedback),
                          disabled: Zt.value || !Xt.value,
                          class: "submit-rating-button",
                          style: Ee({ backgroundColor: x(s).accent_color || "var(--accent-solid)" })
                        }, Z(Zt.value ? "Submitting..." : "Submit Rating"), 13, Rb)
                      ])) : ee("", !0),
                      d.isSubmitted && d.finalFeedback ? (w(), T("div", Ib, [
                        _("div", Ob, [
                          _("p", Lb, Z(d.finalFeedback), 1)
                        ])
                      ])) : d.isSubmitted ? (w(), T("div", Nb, " Thank you for your rating! ")) : ee("", !0)
                    ])) : d.message_type === "form" ? (w(), T("div", Pb, [
                      (ut = (ve = d.attributes) == null ? void 0 : ve.form_data) != null && ut.title || (Ze = (ot = d.attributes) == null ? void 0 : ot.form_data) != null && Ze.description ? (w(), T("div", Mb, [
                        (Ar = (Tr = d.attributes) == null ? void 0 : Tr.form_data) != null && Ar.title ? (w(), T("h3", Db, Z(d.attributes.form_data.title), 1)) : ee("", !0),
                        (Xs = (Jn = d.attributes) == null ? void 0 : Jn.form_data) != null && Xs.description ? (w(), T("p", Fb, Z(d.attributes.form_data.description), 1)) : ee("", !0)
                      ])) : ee("", !0),
                      _("div", $b, [
                        (w(!0), T(Oe, null, ft((hl = (fl = d.attributes) == null ? void 0 : fl.form_data) == null ? void 0 : hl.fields, ($) => {
                          var Jt, To;
                          return w(), T("div", {
                            key: $.name,
                            class: "form-field"
                          }, [
                            _("label", {
                              for: `form-${$.name}`,
                              class: "field-label"
                            }, [
                              Mn(Z($.label) + " ", 1),
                              $.required ? (w(), T("span", Ub, "*")) : ee("", !0)
                            ], 8, Bb),
                            $.type === "text" || $.type === "email" || $.type === "tel" ? (w(), T("input", {
                              key: 0,
                              id: `form-${$.name}`,
                              type: $.type,
                              placeholder: $.placeholder || "",
                              required: $.required,
                              minlength: $.minLength,
                              maxlength: $.maxLength,
                              value: lt.value[$.name] || "",
                              onInput: (He) => Ke($.name, He.target.value),
                              onBlur: (He) => Ke($.name, He.target.value),
                              class: Pe(["form-input", { error: ct.value[$.name] }]),
                              disabled: gt.value,
                              autocomplete: $.type === "email" ? "email" : $.type === "tel" ? "tel" : "off",
                              inputmode: $.type === "tel" ? "tel" : $.type === "email" ? "email" : "text"
                            }, null, 42, zb)) : $.type === "number" ? (w(), T("input", {
                              key: 1,
                              id: `form-${$.name}`,
                              type: "number",
                              placeholder: $.placeholder || "",
                              required: $.required,
                              min: $.min,
                              max: $.max,
                              value: lt.value[$.name] || "",
                              onInput: (He) => Ke($.name, He.target.value),
                              class: Pe(["form-input", { error: ct.value[$.name] }]),
                              disabled: gt.value
                            }, null, 42, Hb)) : $.type === "textarea" ? (w(), T("textarea", {
                              key: 2,
                              id: `form-${$.name}`,
                              placeholder: $.placeholder || "",
                              required: $.required,
                              minlength: $.minLength,
                              maxlength: $.maxLength,
                              value: lt.value[$.name] || "",
                              onInput: (He) => Ke($.name, He.target.value),
                              class: Pe(["form-textarea", { error: ct.value[$.name] }]),
                              disabled: gt.value,
                              rows: "3"
                            }, null, 42, jb)) : $.type === "select" ? (w(), T("select", {
                              key: 3,
                              id: `form-${$.name}`,
                              required: $.required,
                              value: lt.value[$.name] || "",
                              onChange: (He) => Ke($.name, He.target.value),
                              class: Pe(["form-select", { error: ct.value[$.name] }]),
                              disabled: gt.value
                            }, [
                              _("option", qb, Z($.placeholder || "Select an option"), 1),
                              (w(!0), T(Oe, null, ft((Array.isArray($.options) ? $.options : ((Jt = $.options) == null ? void 0 : Jt.split(`
`)) || []).filter((He) => He.trim()), (He) => (w(), T("option", {
                                key: He.trim(),
                                value: He.trim()
                              }, Z(He.trim()), 9, Vb))), 128))
                            ], 42, Wb)) : $.type === "checkbox" ? (w(), T("div", Kb, [
                              _("input", {
                                id: `form-${$.name}`,
                                type: "checkbox",
                                checked: lt.value[$.name] || !1,
                                onChange: (He) => Ke($.name, He.target.checked),
                                class: "form-checkbox",
                                disabled: gt.value
                              }, null, 40, Gb),
                              _("label", {
                                for: `form-${$.name}`,
                                class: "checkbox-label"
                              }, Z($.placeholder || $.label), 9, Yb)
                            ])) : $.type === "radio" ? (w(), T("div", Xb, [
                              (w(!0), T(Oe, null, ft((Array.isArray($.options) ? $.options : ((To = $.options) == null ? void 0 : To.split(`
`)) || []).filter((He) => He.trim()), (He) => (w(), T("div", {
                                key: He.trim(),
                                class: "radio-option"
                              }, [
                                _("input", {
                                  id: `form-${$.name}-${He.trim()}`,
                                  name: `form-${$.name}`,
                                  type: "radio",
                                  value: He.trim(),
                                  checked: lt.value[$.name] === He.trim(),
                                  onChange: (v0) => Ke($.name, He.trim()),
                                  class: "form-radio",
                                  disabled: gt.value
                                }, null, 40, Zb),
                                _("label", {
                                  for: `form-${$.name}-${He.trim()}`,
                                  class: "radio-label"
                                }, Z(He.trim()), 9, Jb)
                              ]))), 128))
                            ])) : ee("", !0),
                            ct.value[$.name] ? (w(), T("div", Qb, Z(ct.value[$.name]), 1)) : ee("", !0)
                          ]);
                        }), 128))
                      ]),
                      _("div", ew, [
                        _("button", {
                          onClick: () => {
                            var $;
                            console.log("Regular form submit button clicked!"), st(($ = d.attributes) == null ? void 0 : $.form_data);
                          },
                          disabled: gt.value,
                          class: "form-submit-button",
                          style: Ee(x(wn))
                        }, Z(gt.value ? "Submitting..." : ((pl = (dl = d.attributes) == null ? void 0 : dl.form_data) == null ? void 0 : pl.submit_button_text) || "Submit"), 13, tw)
                      ])
                    ])) : d.message_type === "user_input" ? (w(), T("div", nw, [
                      (ml = d.attributes) != null && ml.prompt_message && d.attributes.prompt_message.trim() ? (w(), T("div", sw, Z(d.attributes.prompt_message), 1)) : ee("", !0),
                      d.isSubmitted ? (w(), T("div", aw, [
                        m[36] || (m[36] = _("strong", null, "Your input:", -1)),
                        Mn(" " + Z(d.submittedValue) + " ", 1),
                        (gl = d.attributes) != null && gl.confirmation_message && d.attributes.confirmation_message.trim() ? (w(), T("div", lw, Z(d.attributes.confirmation_message), 1)) : ee("", !0)
                      ])) : (w(), T("div", rw, [
                        Qn(_("textarea", {
                          "onUpdate:modelValue": ($) => d.userInputValue = $,
                          class: "user-input-textarea",
                          placeholder: "Type your message here...",
                          rows: "3",
                          onKeydown: [
                            ki(Es(($) => mo(d), ["ctrl"]), ["enter"]),
                            ki(Es(($) => mo(d), ["meta"]), ["enter"])
                          ]
                        }, null, 40, iw), [
                          [As, d.userInputValue]
                        ]),
                        _("button", {
                          class: "user-input-submit-button",
                          onClick: ($) => mo(d),
                          disabled: !d.userInputValue || !d.userInputValue.trim()
                        }, " Submit ", 8, ow)
                      ]))
                    ])) : d.shopify_output || d.message_type === "product" ? (w(), T("div", cw, [
                      d.message ? (w(), T("div", {
                        key: 0,
                        innerHTML: x(Ai)(((yl = (_l = d.shopify_output) == null ? void 0 : _l.products) == null ? void 0 : yl.length) > 0 ? Ga(d.message) : d.message),
                        class: "product-message-text"
                      }, null, 8, uw)) : ee("", !0),
                      (vl = d.shopify_output) != null && vl.products && d.shopify_output.products.length > 0 ? (w(), T("div", fw, [
                        m[38] || (m[38] = _("h3", { class: "carousel-title" }, "Products", -1)),
                        _("div", hw, [
                          (w(!0), T(Oe, null, ft(d.shopify_output.products, ($) => {
                            var Jt;
                            return w(), T("div", {
                              key: $.id,
                              class: "product-card-compact carousel-item"
                            }, [
                              (Jt = $.image) != null && Jt.src ? (w(), T("div", dw, [
                                _("img", {
                                  src: $.image.src,
                                  alt: $.title,
                                  class: "product-thumbnail"
                                }, null, 8, pw)
                              ])) : ee("", !0),
                              _("div", mw, [
                                _("div", gw, [
                                  _("div", _w, Z($.title), 1),
                                  $.variant_title && $.variant_title !== "Default Title" ? (w(), T("div", yw, Z($.variant_title), 1)) : ee("", !0),
                                  _("div", vw, Z($.price_formatted || x(a)($.price, $.currency)), 1)
                                ]),
                                _("div", bw, [
                                  _("button", {
                                    class: "view-details-button-compact",
                                    onClick: (To) => {
                                      var He;
                                      return oi($, (He = d.shopify_output) == null ? void 0 : He.shop_domain);
                                    }
                                  }, m[37] || (m[37] = [
                                    Mn(" View product ", -1),
                                    _("span", { class: "external-link-icon" }, "↗", -1)
                                  ]), 8, ww)
                                ])
                              ])
                            ]);
                          }), 128))
                        ])
                      ])) : !d.message && ((bl = d.shopify_output) != null && bl.products) && d.shopify_output.products.length === 0 ? (w(), T("div", kw, m[39] || (m[39] = [
                        _("p", null, "No products found.", -1)
                      ]))) : !d.message && d.shopify_output && !d.shopify_output.products ? (w(), T("div", Tw, m[40] || (m[40] = [
                        _("p", null, "No products to display.", -1)
                      ]))) : ee("", !0)
                    ])) : (w(), T(Oe, { key: 4 }, [
                      x(G)(J) ? (w(), T("div", {
                        key: 0,
                        class: "message-streaming",
                        innerHTML: x(Ai)(x(K)(J, d.message))
                      }, null, 8, Aw)) : (w(), T("div", {
                        key: 1,
                        innerHTML: x(Ai)(d.message)
                      }, null, 8, Sw)),
                      d.attachments && d.attachments.length > 0 ? (w(), T("div", xw, [
                        (w(!0), T(Oe, null, ft(d.attachments, ($) => (w(), T("div", {
                          key: $.id,
                          class: "attachment-item"
                        }, [
                          x(qn)($.content_type) ? (w(), T("div", Ew, [
                            _("img", {
                              src: x($s)($.file_url),
                              alt: $.filename,
                              class: "attachment-image",
                              onClick: Es((Jt) => x(_r)({ url: $.file_url, filename: $.filename, type: $.content_type, file_url: x($s)($.file_url), size: void 0 }), ["stop"]),
                              style: { cursor: "pointer" }
                            }, null, 8, Cw),
                            _("div", Rw, [
                              _("a", {
                                href: x($s)($.file_url),
                                target: "_blank",
                                class: "attachment-link"
                              }, [
                                m[41] || (m[41] = _("svg", {
                                  width: "14",
                                  height: "14",
                                  viewBox: "0 0 24 24",
                                  fill: "none",
                                  stroke: "currentColor",
                                  "stroke-width": "2",
                                  "stroke-linecap": "round",
                                  "stroke-linejoin": "round"
                                }, [
                                  _("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
                                  _("polyline", { points: "7 10 12 15 17 10" }),
                                  _("line", {
                                    x1: "12",
                                    y1: "15",
                                    x2: "12",
                                    y2: "3"
                                  })
                                ], -1)),
                                Mn(" " + Z($.filename) + " ", 1),
                                _("span", Ow, "(" + Z(x(nt)($.file_size)) + ")", 1)
                              ], 8, Iw)
                            ])
                          ])) : (w(), T("a", {
                            key: 1,
                            href: x($s)($.file_url),
                            target: "_blank",
                            class: "attachment-link"
                          }, [
                            m[42] || (m[42] = _("svg", {
                              width: "14",
                              height: "14",
                              viewBox: "0 0 24 24",
                              fill: "none",
                              stroke: "currentColor",
                              "stroke-width": "2",
                              "stroke-linecap": "round",
                              "stroke-linejoin": "round"
                            }, [
                              _("path", { d: "M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" })
                            ], -1)),
                            Mn(" " + Z($.filename) + " ", 1),
                            _("span", Nw, "(" + Z(x(nt)($.file_size)) + ")", 1)
                          ], 8, Lw))
                        ]))), 128))
                      ])) : ee("", !0)
                    ], 64))
                  ], 4),
                  li.value && (d.message_type === "bot" || d.message_type === "agent") && d.sources && d.sources.length ? (w(), T("div", Pw, [
                    m[43] || (m[43] = _("span", { class: "citation-label" }, "Sources", -1)),
                    (w(!0), T(Oe, null, ft(d.sources, ($, Jt) => (w(), T("span", {
                      key: Jt,
                      class: "citation-chip",
                      title: ol($)
                    }, Z(yo($)), 9, Mw))), 128))
                  ])) : ee("", !0),
                  _("div", Dw, [
                    d.message_type === "user" ? (w(), T("span", Fw, " You ")) : ee("", !0)
                  ])
                ])
              ], 2),
              (w(!0), T(Oe, null, ft(x(De)(J + 1), ($, Jt) => (w(), ss(Ig, {
                key: `receipt-${J}-${Jt}`,
                receipt: $
              }, null, 8, ["receipt"]))), 128))
            ], 64);
          }), 128)),
          X.value ? (w(), T("div", $w, [
            wr.value || !x(St) ? (w(), T("div", {
              key: 0,
              class: "cm-welcome-orb",
              style: Ee(Ys.value)
            }, null, 4)) : (w(), T("img", {
              key: 1,
              src: x(St),
              alt: x(r),
              class: "cm-welcome-avatar"
            }, null, 8, Bw)),
            _("div", {
              class: "message-bubble cm-welcome-bubble",
              style: Ee(x(Wn))
            }, Z(X.value.message), 5)
          ])) : ee("", !0),
          P.value.length ? (w(), ss(Jg, {
            key: 3,
            chips: P.value,
            disabled: !Dt.value || x(bn),
            onPick: B
          }, null, 8, ["chips", "disabled"])) : ee("", !0),
          x(vt) ? (w(), ss(Tg, {
            key: 4,
            pending: x(vt),
            onApprove: x(zt),
            onDecline: x(qt)
          }, null, 8, ["pending", "onApprove", "onDecline"])) : ee("", !0),
          x(u) && !x(vt) ? (w(), T("div", {
            key: 5,
            class: Pe(["typing-indicator", { "reading-indicator": li.value }])
          }, [
            li.value ? (w(), T(Oe, { key: 0 }, [
              m[44] || (m[44] = _("div", {
                class: "reading-bars",
                "aria-hidden": "true"
              }, [
                _("span"),
                _("span"),
                _("span")
              ], -1)),
              m[45] || (m[45] = _("span", { class: "reading-label" }, "reading knowledge base", -1))
            ], 64)) : (w(), T("div", {
              key: 1,
              class: "cm-typing-bubble",
              style: Ee(x(Wn))
            }, m[46] || (m[46] = [
              _("span", { class: "cm-typing-dot" }, null, -1),
              _("span", { class: "cm-typing-dot" }, null, -1),
              _("span", { class: "cm-typing-dot" }, null, -1)
            ]), 4))
          ], 2)) : ee("", !0)
        ], 512), [
          [Wd, !ws.value]
        ]),
        Df.value ? (w(), T("div", Uw, [
          (w(!0), T(Oe, null, ft(go.value, (d) => (w(), T("button", {
            key: d,
            type: "button",
            class: "cm-quick-action",
            disabled: !Dt.value,
            onClick: (J) => Hs(d)
          }, Z(d), 9, zw))), 128))
        ])) : ee("", !0),
        !V.value && !ws.value ? (w(), T("div", {
          key: 6,
          class: Pe(["chat-input", { "ask-anything-input": ln.value }])
        }, [
          _("input", {
            ref_key: "fileInputRef",
            ref: si,
            type: "file",
            accept: m0,
            multiple: "",
            style: { display: "none" },
            onChange: m[7] || (m[7] = //@ts-ignore
            (...d) => x(Bs) && x(Bs)(...d))
          }, null, 544),
          x(xt).length > 0 ? (w(), T("div", Hw, [
            (w(!0), T(Oe, null, ft(x(xt), (d, J) => (w(), T("div", {
              key: J,
              class: "file-preview-widget"
            }, [
              _("div", jw, [
                x(ms)(d.type) ? (w(), T("img", {
                  key: 0,
                  src: x(pr)(d),
                  alt: d.filename,
                  class: "file-preview-image-widget",
                  onClick: Es((Se) => x(_r)(d), ["stop"]),
                  style: { cursor: "pointer" }
                }, null, 8, Ww)) : (w(), T("div", {
                  key: 1,
                  class: "file-preview-icon-widget",
                  onClick: Es((Se) => x(_r)(d), ["stop"]),
                  style: { cursor: "pointer" }
                }, m[47] || (m[47] = [
                  _("svg", {
                    width: "20",
                    height: "20",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    "stroke-width": "2"
                  }, [
                    _("path", { d: "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" }),
                    _("polyline", { points: "13 2 13 9 20 9" })
                  ], -1)
                ]), 8, qw))
              ]),
              _("div", Vw, [
                _("div", Kw, Z(d.filename), 1),
                _("div", Gw, Z(x(nt)(d.size)), 1)
              ]),
              _("button", {
                type: "button",
                class: "file-preview-remove-widget",
                onClick: (Se) => x(fo)(J),
                title: "Remove file"
              }, " × ", 8, Yw)
            ]))), 128))
          ])) : ee("", !0),
          Ya.value ? (w(), T("div", Xw, m[48] || (m[48] = [
            _("div", { class: "upload-spinner-widget" }, null, -1),
            _("span", { class: "upload-text-widget" }, "Uploading files...", -1)
          ]))) : ee("", !0),
          _("div", Zw, [
            Qn(_("input", {
              "onUpdate:modelValue": m[8] || (m[8] = (d) => F.value = d),
              type: "text",
              placeholder: Vn.value,
              onKeypress: js,
              onInput: he,
              onChange: he,
              onPaste: m[9] || (m[9] = //@ts-ignore
              (...d) => x(ii) && x(ii)(...d)),
              onDrop: m[10] || (m[10] = //@ts-ignore
              (...d) => x(mr) && x(mr)(...d)),
              onDragover: m[11] || (m[11] = //@ts-ignore
              (...d) => x(gr) && x(gr)(...d)),
              onDragleave: m[12] || (m[12] = //@ts-ignore
              (...d) => x(ri) && x(ri)(...d)),
              disabled: !gs.value,
              class: Pe({ disabled: !gs.value, "ask-anything-field": ln.value })
            }, null, 42, Jw), [
              [As, F.value]
            ]),
            Af.value ? (w(), T("button", {
              key: 0,
              type: "button",
              class: "attach-button",
              disabled: Ya.value,
              onClick: m[13] || (m[13] = //@ts-ignore
              (...d) => x(yr) && x(yr)(...d)),
              title: `Attach files (${x(xt).length}/${Mc} used) or paste screenshots`
            }, m[49] || (m[49] = [
              _("svg", {
                width: "22",
                height: "22",
                viewBox: "0 0 24 24",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg"
              }, [
                _("path", {
                  d: "M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48",
                  stroke: "currentColor",
                  "stroke-width": "2.2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                })
              ], -1),
              _("span", { class: "attach-button-glow" }, null, -1)
            ]), 8, Qw)) : ee("", !0),
            _("button", {
              class: Pe(["send-button", { "ask-anything-send": ln.value }]),
              "aria-label": "Send message",
              style: Ee(x(wn)),
              onClick: mn,
              disabled: !F.value.trim() && x(xt).length === 0 || !Dt.value || zs.value
            }, m[50] || (m[50] = [
              _("svg", {
                width: "20",
                height: "20",
                viewBox: "0 0 24 24",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg"
              }, [
                _("path", {
                  d: "M12 19V5M5 12l7-7 7 7",
                  stroke: "currentColor",
                  "stroke-width": "2.2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                })
              ], -1)
            ]), 14, e0)
          ]),
          zs.value ? (w(), T("p", t0, Z(x(e_)), 1)) : ee("", !0)
        ], 2)) : V.value && !ws.value ? (w(), T("div", n0, [
          _("div", s0, [
            m[51] || (m[51] = _("p", { class: "ended-text" }, "This chat has ended.", -1)),
            _("button", {
              class: "start-new-conversation-button",
              style: Ee(x(wn)),
              onClick: Of
            }, " Click here to start a new conversation ", 4)
          ])
        ])) : ee("", !0),
        il.value ? (w(), T("div", r0, Z(x(bc)), 1)) : ee("", !0),
        Vs.value ? (w(), T("div", {
          key: 9,
          class: "powered-by",
          style: Ee(x(rn))
        }, m[52] || (m[52] = [
          es('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-b548aa90><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-b548aa90></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-b548aa90></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-b548aa90></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-b548aa90></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-b548aa90><span class="cm-powered-prefix" data-v-b548aa90>Powered by </span><strong class="cm-brand" data-v-b548aa90>ChatterMate</strong></a>', 2)
        ]), 4)) : ee("", !0)
      ], 6)) : ee("", !0),
      _s.value ? (w(), T("div", i0, [
        _("div", o0, [
          m[53] || (m[53] = _("h3", null, "Rate your conversation", -1)),
          _("div", a0, [
            (w(), T(Oe, null, ft(5, (d) => _("button", {
              key: d,
              onClick: (J) => Ws.value = d,
              class: Pe([{ active: d <= Ws.value }, "star-button"])
            }, " ★ ", 10, l0)), 64))
          ]),
          Qn(_("textarea", {
            "onUpdate:modelValue": m[14] || (m[14] = (d) => qs.value = d),
            placeholder: "Additional feedback (optional)",
            class: "rating-feedback"
          }, null, 512), [
            [As, qs.value]
          ]),
          _("div", c0, [
            _("button", {
              onClick: m[15] || (m[15] = (d) => h.submitRating(Ws.value, qs.value)),
              disabled: !Ws.value,
              class: "submit-button",
              style: Ee(x(wn))
            }, " Submit ", 12, u0),
            _("button", {
              onClick: m[16] || (m[16] = (d) => _s.value = !1),
              class: "skip-rating"
            }, " Skip ")
          ])
        ])
      ])) : ee("", !0),
      x(uo) ? (w(), T("div", {
        key: 9,
        class: "preview-modal-overlay",
        onClick: m[19] || (m[19] = //@ts-ignore
        (...d) => x(Gt) && x(Gt)(...d))
      }, [
        _("div", {
          class: "preview-modal-content",
          onClick: m[18] || (m[18] = Es(() => {
          }, ["stop"]))
        }, [
          _("button", {
            class: "preview-modal-close",
            onClick: m[17] || (m[17] = //@ts-ignore
            (...d) => x(Gt) && x(Gt)(...d))
          }, "×"),
          x(ps) && x(ms)(x(ps).type) ? (w(), T("div", f0, [
            _("img", {
              src: x(pr)(x(ps)),
              alt: x(ps).filename,
              class: "preview-modal-image"
            }, null, 8, h0),
            _("div", d0, Z(x(ps).filename), 1)
          ])) : ee("", !0)
        ])
      ])) : ee("", !0)
    ], 6)) : (w(), T("div", p0));
  }
}), _0 = /* @__PURE__ */ Ds(g0, [["__scopeId", "data-v-b548aa90"]]);
window.process || (window.process = { env: { NODE_ENV: "production" } });
async function y0() {
  if (!await b_()) return;
  const e = window.__INITIAL_DATA__, t = new URL(window.location.href), n = t.searchParams.get("preview") === "true", s = (a) => {
    const l = t.searchParams.get(a);
    if (!(!l || l === "undefined" || l.trim() === ""))
      return l;
  }, r = n ? s("widget_id") || (e == null ? void 0 : e.widgetId) || void 0 : (e == null ? void 0 : e.widgetId) || void 0, i = n ? (e == null ? void 0 : e.initialToken) || s("token") || void 0 : (e == null ? void 0 : e.initialToken) || void 0;
  up(_0, {
    widgetId: r,
    token: i || void 0,
    initialAuthError: null
    // Let backend determine if auth is required
  }).mount("#app"), w_();
}
y0();
