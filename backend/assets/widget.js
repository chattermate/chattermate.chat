var Ta = Object.defineProperty;
var Aa = (e, t, n) => t in e ? Ta(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var Pe = (e, t, n) => Aa(e, typeof t != "symbol" ? t + "" : t, n);
/**
* @vue/shared v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function zr(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const n of e.split(",")) t[n] = 1;
  return (n) => n in t;
}
const $e = {}, In = [], Dt = () => {
}, Ea = () => !1, qs = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), Hr = (e) => e.startsWith("onUpdate:"), ht = Object.assign, Wr = (e, t) => {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}, Ra = Object.prototype.hasOwnProperty, Ae = (e, t) => Ra.call(e, t), ne = Array.isArray, Ln = (e) => Us(e) === "[object Map]", Lo = (e) => Us(e) === "[object Set]", le = (e) => typeof e == "function", Qe = (e) => typeof e == "string", hn = (e) => typeof e == "symbol", He = (e) => e !== null && typeof e == "object", Oo = (e) => (He(e) || le(e)) && le(e.then) && le(e.catch), Po = Object.prototype.toString, Us = (e) => Po.call(e), Ia = (e) => Us(e).slice(8, -1), $o = (e) => Us(e) === "[object Object]", jr = (e) => Qe(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, Gn = /* @__PURE__ */ zr(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), zs = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (n) => t[n] || (t[n] = e(n));
}, La = /-(\w)/g, an = zs(
  (e) => e.replace(La, (t, n) => n ? n.toUpperCase() : "")
), Oa = /\B([A-Z])/g, fn = zs(
  (e) => e.replace(Oa, "-$1").toLowerCase()
), Fo = zs((e) => e.charAt(0).toUpperCase() + e.slice(1)), ir = zs(
  (e) => e ? `on${Fo(e)}` : ""
), rn = (e, t) => !Object.is(e, t), ws = (e, ...t) => {
  for (let n = 0; n < e.length; n++)
    e[n](...t);
}, wr = (e, t, n, s = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: s,
    value: n
  });
}, kr = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let Ui;
const Hs = () => Ui || (Ui = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function Re(e) {
  if (ne(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
      const s = e[n], r = Qe(s) ? Ba(s) : Re(s);
      if (r)
        for (const i in r)
          t[i] = r[i];
    }
    return t;
  } else if (Qe(e) || He(e))
    return e;
}
const Pa = /;(?![^(]*\))/g, $a = /:([^]+)/, Fa = /\/\*[^]*?\*\//g;
function Ba(e) {
  const t = {};
  return e.replace(Fa, "").split(Pa).forEach((n) => {
    if (n) {
      const s = n.split($a);
      s.length > 1 && (t[s[0].trim()] = s[1].trim());
    }
  }), t;
}
function qe(e) {
  let t = "";
  if (Qe(e))
    t = e;
  else if (ne(e))
    for (let n = 0; n < e.length; n++) {
      const s = qe(e[n]);
      s && (t += s + " ");
    }
  else if (He(e))
    for (const n in e)
      e[n] && (t += n + " ");
  return t.trim();
}
const Na = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", Ma = /* @__PURE__ */ zr(Na);
function Bo(e) {
  return !!e || e === "";
}
const No = (e) => !!(e && e.__v_isRef === !0), ee = (e) => Qe(e) ? e : e == null ? "" : ne(e) || He(e) && (e.toString === Po || !le(e.toString)) ? No(e) ? ee(e.value) : JSON.stringify(e, Mo, 2) : String(e), Mo = (e, t) => No(t) ? Mo(e, t.value) : Ln(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (n, [s, r], i) => (n[or(s, i) + " =>"] = r, n),
    {}
  )
} : Lo(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((n) => or(n))
} : hn(t) ? or(t) : He(t) && !ne(t) && !$o(t) ? String(t) : t, or = (e, t = "") => {
  var n;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    hn(e) ? `Symbol(${(n = e.description) != null ? n : t})` : e
  );
};
/**
* @vue/reactivity v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let yt;
class Da {
  constructor(t = !1) {
    this.detached = t, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this.parent = yt, !t && yt && (this.index = (yt.scopes || (yt.scopes = [])).push(
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
      const n = yt;
      try {
        return yt = this, t();
      } finally {
        yt = n;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = yt, yt = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    this._on > 0 && --this._on === 0 && (yt = this.prevScope, this.prevScope = void 0);
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
function qa() {
  return yt;
}
let Fe;
const lr = /* @__PURE__ */ new WeakSet();
class Do {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, yt && yt.active && yt.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, lr.has(this) && (lr.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Uo(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, zi(this), zo(this);
    const t = Fe, n = Lt;
    Fe = this, Lt = !0;
    try {
      return this.fn();
    } finally {
      Ho(this), Fe = t, Lt = n, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        Zr(t);
      this.deps = this.depsTail = void 0, zi(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? lr.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    xr(this) && this.run();
  }
  get dirty() {
    return xr(this);
  }
}
let qo = 0, Yn, Xn;
function Uo(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = Xn, Xn = e;
    return;
  }
  e.next = Yn, Yn = e;
}
function Vr() {
  qo++;
}
function Kr() {
  if (--qo > 0)
    return;
  if (Xn) {
    let t = Xn;
    for (Xn = void 0; t; ) {
      const n = t.next;
      t.next = void 0, t.flags &= -9, t = n;
    }
  }
  let e;
  for (; Yn; ) {
    let t = Yn;
    for (Yn = void 0; t; ) {
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
function zo(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Ho(e) {
  let t, n = e.depsTail, s = n;
  for (; s; ) {
    const r = s.prevDep;
    s.version === -1 ? (s === n && (n = r), Zr(s), Ua(s)) : t = s, s.dep.activeLink = s.prevActiveLink, s.prevActiveLink = void 0, s = r;
  }
  e.deps = t, e.depsTail = n;
}
function xr(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (Wo(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function Wo(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === ss) || (e.globalVersion = ss, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !xr(e))))
    return;
  e.flags |= 2;
  const t = e.dep, n = Fe, s = Lt;
  Fe = e, Lt = !0;
  try {
    zo(e);
    const r = e.fn(e._value);
    (t.version === 0 || rn(r, e._value)) && (e.flags |= 128, e._value = r, t.version++);
  } catch (r) {
    throw t.version++, r;
  } finally {
    Fe = n, Lt = s, Ho(e), e.flags &= -3;
  }
}
function Zr(e, t = !1) {
  const { dep: n, prevSub: s, nextSub: r } = e;
  if (s && (s.nextSub = r, e.prevSub = void 0), r && (r.prevSub = s, e.nextSub = void 0), n.subs === e && (n.subs = s, !s && n.computed)) {
    n.computed.flags &= -5;
    for (let i = n.computed.deps; i; i = i.nextDep)
      Zr(i, !0);
  }
  !t && !--n.sc && n.map && n.map.delete(n.key);
}
function Ua(e) {
  const { prevDep: t, nextDep: n } = e;
  t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
let Lt = !0;
const jo = [];
function Jt() {
  jo.push(Lt), Lt = !1;
}
function Qt() {
  const e = jo.pop();
  Lt = e === void 0 ? !0 : e;
}
function zi(e) {
  const { cleanup: t } = e;
  if (e.cleanup = void 0, t) {
    const n = Fe;
    Fe = void 0;
    try {
      t();
    } finally {
      Fe = n;
    }
  }
}
let ss = 0;
class za {
  constructor(t, n) {
    this.sub = t, this.dep = n, this.version = n.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Gr {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(t) {
    if (!Fe || !Lt || Fe === this.computed)
      return;
    let n = this.activeLink;
    if (n === void 0 || n.sub !== Fe)
      n = this.activeLink = new za(Fe, this), Fe.deps ? (n.prevDep = Fe.depsTail, Fe.depsTail.nextDep = n, Fe.depsTail = n) : Fe.deps = Fe.depsTail = n, Vo(n);
    else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
      const s = n.nextDep;
      s.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = s), n.prevDep = Fe.depsTail, n.nextDep = void 0, Fe.depsTail.nextDep = n, Fe.depsTail = n, Fe.deps === n && (Fe.deps = s);
    }
    return n;
  }
  trigger(t) {
    this.version++, ss++, this.notify(t);
  }
  notify(t) {
    Vr();
    try {
      for (let n = this.subs; n; n = n.prevSub)
        n.sub.notify() && n.sub.dep.notify();
    } finally {
      Kr();
    }
  }
}
function Vo(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let s = t.deps; s; s = s.nextDep)
        Vo(s);
    }
    const n = e.dep.subs;
    n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
  }
}
const Sr = /* @__PURE__ */ new WeakMap(), yn = Symbol(
  ""
), Cr = Symbol(
  ""
), rs = Symbol(
  ""
);
function ct(e, t, n) {
  if (Lt && Fe) {
    let s = Sr.get(e);
    s || Sr.set(e, s = /* @__PURE__ */ new Map());
    let r = s.get(n);
    r || (s.set(n, r = new Gr()), r.map = s, r.key = n), r.track();
  }
}
function Zt(e, t, n, s, r, i) {
  const o = Sr.get(e);
  if (!o) {
    ss++;
    return;
  }
  const l = (a) => {
    a && a.trigger();
  };
  if (Vr(), t === "clear")
    o.forEach(l);
  else {
    const a = ne(e), f = a && jr(n);
    if (a && n === "length") {
      const c = Number(s);
      o.forEach((b, v) => {
        (v === "length" || v === rs || !hn(v) && v >= c) && l(b);
      });
    } else
      switch ((n !== void 0 || o.has(void 0)) && l(o.get(n)), f && l(o.get(rs)), t) {
        case "add":
          a ? f && l(o.get("length")) : (l(o.get(yn)), Ln(e) && l(o.get(Cr)));
          break;
        case "delete":
          a || (l(o.get(yn)), Ln(e) && l(o.get(Cr)));
          break;
        case "set":
          Ln(e) && l(o.get(yn));
          break;
      }
  }
  Kr();
}
function Tn(e) {
  const t = Te(e);
  return t === e ? t : (ct(t, "iterate", rs), Et(e) ? t : t.map(it));
}
function Ws(e) {
  return ct(e = Te(e), "iterate", rs), e;
}
const Ha = {
  __proto__: null,
  [Symbol.iterator]() {
    return ar(this, Symbol.iterator, it);
  },
  concat(...e) {
    return Tn(this).concat(
      ...e.map((t) => ne(t) ? Tn(t) : t)
    );
  },
  entries() {
    return ar(this, "entries", (e) => (e[1] = it(e[1]), e));
  },
  every(e, t) {
    return Vt(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return Vt(this, "filter", e, t, (n) => n.map(it), arguments);
  },
  find(e, t) {
    return Vt(this, "find", e, t, it, arguments);
  },
  findIndex(e, t) {
    return Vt(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return Vt(this, "findLast", e, t, it, arguments);
  },
  findLastIndex(e, t) {
    return Vt(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return Vt(this, "forEach", e, t, void 0, arguments);
  },
  includes(...e) {
    return cr(this, "includes", e);
  },
  indexOf(...e) {
    return cr(this, "indexOf", e);
  },
  join(e) {
    return Tn(this).join(e);
  },
  // keys() iterator only reads `length`, no optimisation required
  lastIndexOf(...e) {
    return cr(this, "lastIndexOf", e);
  },
  map(e, t) {
    return Vt(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return qn(this, "pop");
  },
  push(...e) {
    return qn(this, "push", e);
  },
  reduce(e, ...t) {
    return Hi(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return Hi(this, "reduceRight", e, t);
  },
  shift() {
    return qn(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return Vt(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return qn(this, "splice", e);
  },
  toReversed() {
    return Tn(this).toReversed();
  },
  toSorted(e) {
    return Tn(this).toSorted(e);
  },
  toSpliced(...e) {
    return Tn(this).toSpliced(...e);
  },
  unshift(...e) {
    return qn(this, "unshift", e);
  },
  values() {
    return ar(this, "values", it);
  }
};
function ar(e, t, n) {
  const s = Ws(e), r = s[t]();
  return s !== e && !Et(e) && (r._next = r.next, r.next = () => {
    const i = r._next();
    return i.value && (i.value = n(i.value)), i;
  }), r;
}
const Wa = Array.prototype;
function Vt(e, t, n, s, r, i) {
  const o = Ws(e), l = o !== e && !Et(e), a = o[t];
  if (a !== Wa[t]) {
    const b = a.apply(e, i);
    return l ? it(b) : b;
  }
  let f = n;
  o !== e && (l ? f = function(b, v) {
    return n.call(this, it(b), v, e);
  } : n.length > 2 && (f = function(b, v) {
    return n.call(this, b, v, e);
  }));
  const c = a.call(o, f, s);
  return l && r ? r(c) : c;
}
function Hi(e, t, n, s) {
  const r = Ws(e);
  let i = n;
  return r !== e && (Et(e) ? n.length > 3 && (i = function(o, l, a) {
    return n.call(this, o, l, a, e);
  }) : i = function(o, l, a) {
    return n.call(this, o, it(l), a, e);
  }), r[t](i, ...s);
}
function cr(e, t, n) {
  const s = Te(e);
  ct(s, "iterate", rs);
  const r = s[t](...n);
  return (r === -1 || r === !1) && Qr(n[0]) ? (n[0] = Te(n[0]), s[t](...n)) : r;
}
function qn(e, t, n = []) {
  Jt(), Vr();
  const s = Te(e)[t].apply(e, n);
  return Kr(), Qt(), s;
}
const ja = /* @__PURE__ */ zr("__proto__,__v_isRef,__isVue"), Ko = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(hn)
);
function Va(e) {
  hn(e) || (e = String(e));
  const t = Te(this);
  return ct(t, "has", e), t.hasOwnProperty(e);
}
class Zo {
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
      return s === (r ? i ? nc : Jo : i ? Xo : Yo).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(s) ? t : void 0;
    const o = ne(t);
    if (!r) {
      let a;
      if (o && (a = Ha[n]))
        return a;
      if (n === "hasOwnProperty")
        return Va;
    }
    const l = Reflect.get(
      t,
      n,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      ut(t) ? t : s
    );
    return (hn(n) ? Ko.has(n) : ja(n)) || (r || ct(t, "get", n), i) ? l : ut(l) ? o && jr(n) ? l : l.value : He(l) ? r ? Qo(l) : Xr(l) : l;
  }
}
class Go extends Zo {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, n, s, r) {
    let i = t[n];
    if (!this._isShallow) {
      const a = cn(i);
      if (!Et(s) && !cn(s) && (i = Te(i), s = Te(s)), !ne(t) && ut(i) && !ut(s))
        return a ? !1 : (i.value = s, !0);
    }
    const o = ne(t) && jr(n) ? Number(n) < t.length : Ae(t, n), l = Reflect.set(
      t,
      n,
      s,
      ut(t) ? t : r
    );
    return t === Te(r) && (o ? rn(s, i) && Zt(t, "set", n, s) : Zt(t, "add", n, s)), l;
  }
  deleteProperty(t, n) {
    const s = Ae(t, n);
    t[n];
    const r = Reflect.deleteProperty(t, n);
    return r && s && Zt(t, "delete", n, void 0), r;
  }
  has(t, n) {
    const s = Reflect.has(t, n);
    return (!hn(n) || !Ko.has(n)) && ct(t, "has", n), s;
  }
  ownKeys(t) {
    return ct(
      t,
      "iterate",
      ne(t) ? "length" : yn
    ), Reflect.ownKeys(t);
  }
}
class Ka extends Zo {
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
const Za = /* @__PURE__ */ new Go(), Ga = /* @__PURE__ */ new Ka(), Ya = /* @__PURE__ */ new Go(!0);
const Tr = (e) => e, gs = (e) => Reflect.getPrototypeOf(e);
function Xa(e, t, n) {
  return function(...s) {
    const r = this.__v_raw, i = Te(r), o = Ln(i), l = e === "entries" || e === Symbol.iterator && o, a = e === "keys" && o, f = r[e](...s), c = n ? Tr : t ? Ls : it;
    return !t && ct(
      i,
      "iterate",
      a ? Cr : yn
    ), {
      // iterator protocol
      next() {
        const { value: b, done: v } = f.next();
        return v ? { value: b, done: v } : {
          value: l ? [c(b[0]), c(b[1])] : c(b),
          done: v
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function ms(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function Ja(e, t) {
  const n = {
    get(r) {
      const i = this.__v_raw, o = Te(i), l = Te(r);
      e || (rn(r, l) && ct(o, "get", r), ct(o, "get", l));
      const { has: a } = gs(o), f = t ? Tr : e ? Ls : it;
      if (a.call(o, r))
        return f(i.get(r));
      if (a.call(o, l))
        return f(i.get(l));
      i !== o && i.get(r);
    },
    get size() {
      const r = this.__v_raw;
      return !e && ct(Te(r), "iterate", yn), Reflect.get(r, "size", r);
    },
    has(r) {
      const i = this.__v_raw, o = Te(i), l = Te(r);
      return e || (rn(r, l) && ct(o, "has", r), ct(o, "has", l)), r === l ? i.has(r) : i.has(r) || i.has(l);
    },
    forEach(r, i) {
      const o = this, l = o.__v_raw, a = Te(l), f = t ? Tr : e ? Ls : it;
      return !e && ct(a, "iterate", yn), l.forEach((c, b) => r.call(i, f(c), f(b), o));
    }
  };
  return ht(
    n,
    e ? {
      add: ms("add"),
      set: ms("set"),
      delete: ms("delete"),
      clear: ms("clear")
    } : {
      add(r) {
        !t && !Et(r) && !cn(r) && (r = Te(r));
        const i = Te(this);
        return gs(i).has.call(i, r) || (i.add(r), Zt(i, "add", r, r)), this;
      },
      set(r, i) {
        !t && !Et(i) && !cn(i) && (i = Te(i));
        const o = Te(this), { has: l, get: a } = gs(o);
        let f = l.call(o, r);
        f || (r = Te(r), f = l.call(o, r));
        const c = a.call(o, r);
        return o.set(r, i), f ? rn(i, c) && Zt(o, "set", r, i) : Zt(o, "add", r, i), this;
      },
      delete(r) {
        const i = Te(this), { has: o, get: l } = gs(i);
        let a = o.call(i, r);
        a || (r = Te(r), a = o.call(i, r)), l && l.call(i, r);
        const f = i.delete(r);
        return a && Zt(i, "delete", r, void 0), f;
      },
      clear() {
        const r = Te(this), i = r.size !== 0, o = r.clear();
        return i && Zt(
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
    n[r] = Xa(r, e, t);
  }), n;
}
function Yr(e, t) {
  const n = Ja(e, t);
  return (s, r, i) => r === "__v_isReactive" ? !e : r === "__v_isReadonly" ? e : r === "__v_raw" ? s : Reflect.get(
    Ae(n, r) && r in s ? n : s,
    r,
    i
  );
}
const Qa = {
  get: /* @__PURE__ */ Yr(!1, !1)
}, ec = {
  get: /* @__PURE__ */ Yr(!1, !0)
}, tc = {
  get: /* @__PURE__ */ Yr(!0, !1)
};
const Yo = /* @__PURE__ */ new WeakMap(), Xo = /* @__PURE__ */ new WeakMap(), Jo = /* @__PURE__ */ new WeakMap(), nc = /* @__PURE__ */ new WeakMap();
function sc(e) {
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
function rc(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : sc(Ia(e));
}
function Xr(e) {
  return cn(e) ? e : Jr(
    e,
    !1,
    Za,
    Qa,
    Yo
  );
}
function ic(e) {
  return Jr(
    e,
    !1,
    Ya,
    ec,
    Xo
  );
}
function Qo(e) {
  return Jr(
    e,
    !0,
    Ga,
    tc,
    Jo
  );
}
function Jr(e, t, n, s, r) {
  if (!He(e) || e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const i = rc(e);
  if (i === 0)
    return e;
  const o = r.get(e);
  if (o)
    return o;
  const l = new Proxy(
    e,
    i === 2 ? s : n
  );
  return r.set(e, l), l;
}
function On(e) {
  return cn(e) ? On(e.__v_raw) : !!(e && e.__v_isReactive);
}
function cn(e) {
  return !!(e && e.__v_isReadonly);
}
function Et(e) {
  return !!(e && e.__v_isShallow);
}
function Qr(e) {
  return e ? !!e.__v_raw : !1;
}
function Te(e) {
  const t = e && e.__v_raw;
  return t ? Te(t) : e;
}
function oc(e) {
  return !Ae(e, "__v_skip") && Object.isExtensible(e) && wr(e, "__v_skip", !0), e;
}
const it = (e) => He(e) ? Xr(e) : e, Ls = (e) => He(e) ? Qo(e) : e;
function ut(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function se(e) {
  return lc(e, !1);
}
function lc(e, t) {
  return ut(e) ? e : new ac(e, t);
}
class ac {
  constructor(t, n) {
    this.dep = new Gr(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? t : Te(t), this._value = n ? t : it(t), this.__v_isShallow = n;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const n = this._rawValue, s = this.__v_isShallow || Et(t) || cn(t);
    t = s ? t : Te(t), rn(t, n) && (this._rawValue = t, this._value = s ? t : it(t), this.dep.trigger());
  }
}
function x(e) {
  return ut(e) ? e.value : e;
}
const cc = {
  get: (e, t, n) => t === "__v_raw" ? e : x(Reflect.get(e, t, n)),
  set: (e, t, n, s) => {
    const r = e[t];
    return ut(r) && !ut(n) ? (r.value = n, !0) : Reflect.set(e, t, n, s);
  }
};
function el(e) {
  return On(e) ? e : new Proxy(e, cc);
}
class uc {
  constructor(t, n, s) {
    this.fn = t, this.setter = n, this._value = void 0, this.dep = new Gr(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = ss - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = s;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    Fe !== this)
      return Uo(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return Wo(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
function hc(e, t, n = !1) {
  let s, r;
  return le(e) ? s = e : (s = e.get, r = e.set), new uc(s, r, n);
}
const _s = {}, Os = /* @__PURE__ */ new WeakMap();
let _n;
function fc(e, t = !1, n = _n) {
  if (n) {
    let s = Os.get(n);
    s || Os.set(n, s = []), s.push(e);
  }
}
function dc(e, t, n = $e) {
  const { immediate: s, deep: r, once: i, scheduler: o, augmentJob: l, call: a } = n, f = (z) => r ? z : Et(z) || r === !1 || r === 0 ? Gt(z, 1) : Gt(z);
  let c, b, v, $, M = !1, U = !1;
  if (ut(e) ? (b = () => e.value, M = Et(e)) : On(e) ? (b = () => f(e), M = !0) : ne(e) ? (U = !0, M = e.some((z) => On(z) || Et(z)), b = () => e.map((z) => {
    if (ut(z))
      return z.value;
    if (On(z))
      return f(z);
    if (le(z))
      return a ? a(z, 2) : z();
  })) : le(e) ? t ? b = a ? () => a(e, 2) : e : b = () => {
    if (v) {
      Jt();
      try {
        v();
      } finally {
        Qt();
      }
    }
    const z = _n;
    _n = c;
    try {
      return a ? a(e, 3, [$]) : e($);
    } finally {
      _n = z;
    }
  } : b = Dt, t && r) {
    const z = b, q = r === !0 ? 1 / 0 : r;
    b = () => Gt(z(), q);
  }
  const re = qa(), ie = () => {
    c.stop(), re && re.active && Wr(re.effects, c);
  };
  if (i && t) {
    const z = t;
    t = (...q) => {
      z(...q), ie();
    };
  }
  let be = U ? new Array(e.length).fill(_s) : _s;
  const we = (z) => {
    if (!(!(c.flags & 1) || !c.dirty && !z))
      if (t) {
        const q = c.run();
        if (r || M || (U ? q.some((H, K) => rn(H, be[K])) : rn(q, be))) {
          v && v();
          const H = _n;
          _n = c;
          try {
            const K = [
              q,
              // pass undefined as the old value when it's changed for the first time
              be === _s ? void 0 : U && be[0] === _s ? [] : be,
              $
            ];
            be = q, a ? a(t, 3, K) : (
              // @ts-expect-error
              t(...K)
            );
          } finally {
            _n = H;
          }
        }
      } else
        c.run();
  };
  return l && l(we), c = new Do(b), c.scheduler = o ? () => o(we, !1) : we, $ = (z) => fc(z, !1, c), v = c.onStop = () => {
    const z = Os.get(c);
    if (z) {
      if (a)
        a(z, 4);
      else
        for (const q of z) q();
      Os.delete(c);
    }
  }, t ? s ? we(!0) : be = c.run() : o ? o(we.bind(null, !0), !0) : c.run(), ie.pause = c.pause.bind(c), ie.resume = c.resume.bind(c), ie.stop = ie, ie;
}
function Gt(e, t = 1 / 0, n) {
  if (t <= 0 || !He(e) || e.__v_skip || (n = n || /* @__PURE__ */ new Set(), n.has(e)))
    return e;
  if (n.add(e), t--, ut(e))
    Gt(e.value, t, n);
  else if (ne(e))
    for (let s = 0; s < e.length; s++)
      Gt(e[s], t, n);
  else if (Lo(e) || Ln(e))
    e.forEach((s) => {
      Gt(s, t, n);
    });
  else if ($o(e)) {
    for (const s in e)
      Gt(e[s], t, n);
    for (const s of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, s) && Gt(e[s], t, n);
  }
  return e;
}
/**
* @vue/runtime-core v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function as(e, t, n, s) {
  try {
    return s ? e(...s) : e();
  } catch (r) {
    js(r, t, n);
  }
}
function zt(e, t, n, s) {
  if (le(e)) {
    const r = as(e, t, n, s);
    return r && Oo(r) && r.catch((i) => {
      js(i, t, n);
    }), r;
  }
  if (ne(e)) {
    const r = [];
    for (let i = 0; i < e.length; i++)
      r.push(zt(e[i], t, n, s));
    return r;
  }
}
function js(e, t, n, s = !0) {
  const r = t ? t.vnode : null, { errorHandler: i, throwUnhandledErrorInProduction: o } = t && t.appContext.config || $e;
  if (t) {
    let l = t.parent;
    const a = t.proxy, f = `https://vuejs.org/error-reference/#runtime-${n}`;
    for (; l; ) {
      const c = l.ec;
      if (c) {
        for (let b = 0; b < c.length; b++)
          if (c[b](e, a, f) === !1)
            return;
      }
      l = l.parent;
    }
    if (i) {
      Jt(), as(i, null, 10, [
        e,
        a,
        f
      ]), Qt();
      return;
    }
  }
  pc(e, n, r, s, o);
}
function pc(e, t, n, s = !0, r = !1) {
  if (r)
    throw e;
  console.error(e);
}
const gt = [];
let Nt = -1;
const Pn = [];
let nn = null, En = 0;
const tl = /* @__PURE__ */ Promise.resolve();
let Ps = null;
function nl(e) {
  const t = Ps || tl;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function gc(e) {
  let t = Nt + 1, n = gt.length;
  for (; t < n; ) {
    const s = t + n >>> 1, r = gt[s], i = is(r);
    i < e || i === e && r.flags & 2 ? t = s + 1 : n = s;
  }
  return t;
}
function ei(e) {
  if (!(e.flags & 1)) {
    const t = is(e), n = gt[gt.length - 1];
    !n || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= is(n) ? gt.push(e) : gt.splice(gc(t), 0, e), e.flags |= 1, sl();
  }
}
function sl() {
  Ps || (Ps = tl.then(il));
}
function mc(e) {
  ne(e) ? Pn.push(...e) : nn && e.id === -1 ? nn.splice(En + 1, 0, e) : e.flags & 1 || (Pn.push(e), e.flags |= 1), sl();
}
function Wi(e, t, n = Nt + 1) {
  for (; n < gt.length; n++) {
    const s = gt[n];
    if (s && s.flags & 2) {
      if (e && s.id !== e.uid)
        continue;
      gt.splice(n, 1), n--, s.flags & 4 && (s.flags &= -2), s(), s.flags & 4 || (s.flags &= -2);
    }
  }
}
function rl(e) {
  if (Pn.length) {
    const t = [...new Set(Pn)].sort(
      (n, s) => is(n) - is(s)
    );
    if (Pn.length = 0, nn) {
      nn.push(...t);
      return;
    }
    for (nn = t, En = 0; En < nn.length; En++) {
      const n = nn[En];
      n.flags & 4 && (n.flags &= -2), n.flags & 8 || n(), n.flags &= -2;
    }
    nn = null, En = 0;
  }
}
const is = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function il(e) {
  try {
    for (Nt = 0; Nt < gt.length; Nt++) {
      const t = gt[Nt];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), as(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; Nt < gt.length; Nt++) {
      const t = gt[Nt];
      t && (t.flags &= -2);
    }
    Nt = -1, gt.length = 0, rl(), Ps = null, (gt.length || Pn.length) && il();
  }
}
let At = null, ol = null;
function $s(e) {
  const t = At;
  return At = e, ol = e && e.type.__scopeId || null, t;
}
function _c(e, t = At, n) {
  if (!t || e._n)
    return e;
  const s = (...r) => {
    s._d && Qi(-1);
    const i = $s(t);
    let o;
    try {
      o = e(...r);
    } finally {
      $s(i), s._d && Qi(1);
    }
    return o;
  };
  return s._n = !0, s._c = !0, s._d = !0, s;
}
function dn(e, t) {
  if (At === null)
    return e;
  const n = Gs(At), s = e.dirs || (e.dirs = []);
  for (let r = 0; r < t.length; r++) {
    let [i, o, l, a = $e] = t[r];
    i && (le(i) && (i = {
      mounted: i,
      updated: i
    }), i.deep && Gt(o), s.push({
      dir: i,
      instance: n,
      value: o,
      oldValue: void 0,
      arg: l,
      modifiers: a
    }));
  }
  return e;
}
function pn(e, t, n, s) {
  const r = e.dirs, i = t && t.dirs;
  for (let o = 0; o < r.length; o++) {
    const l = r[o];
    i && (l.oldValue = i[o].value);
    let a = l.dir[s];
    a && (Jt(), zt(a, n, 8, [
      e.el,
      l,
      e,
      t
    ]), Qt());
  }
}
const vc = Symbol("_vte"), yc = (e) => e.__isTeleport;
function ti(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, ti(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function bc(e, t) {
  return le(e) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    ht({ name: e.name }, t, { setup: e })
  ) : e;
}
function ll(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
function Jn(e, t, n, s, r = !1) {
  if (ne(e)) {
    e.forEach(
      (M, U) => Jn(
        M,
        t && (ne(t) ? t[U] : t),
        n,
        s,
        r
      )
    );
    return;
  }
  if (Qn(s) && !r) {
    s.shapeFlag & 512 && s.type.__asyncResolved && s.component.subTree.component && Jn(e, t, n, s.component.subTree);
    return;
  }
  const i = s.shapeFlag & 4 ? Gs(s.component) : s.el, o = r ? null : i, { i: l, r: a } = e, f = t && t.r, c = l.refs === $e ? l.refs = {} : l.refs, b = l.setupState, v = Te(b), $ = b === $e ? () => !1 : (M) => Ae(v, M);
  if (f != null && f !== a && (Qe(f) ? (c[f] = null, $(f) && (b[f] = null)) : ut(f) && (f.value = null)), le(a))
    as(a, l, 12, [o, c]);
  else {
    const M = Qe(a), U = ut(a);
    if (M || U) {
      const re = () => {
        if (e.f) {
          const ie = M ? $(a) ? b[a] : c[a] : a.value;
          r ? ne(ie) && Wr(ie, i) : ne(ie) ? ie.includes(i) || ie.push(i) : M ? (c[a] = [i], $(a) && (b[a] = c[a])) : (a.value = [i], e.k && (c[e.k] = a.value));
        } else M ? (c[a] = o, $(a) && (b[a] = o)) : U && (a.value = o, e.k && (c[e.k] = o));
      };
      o ? (re.id = -1, wt(re, n)) : re();
    }
  }
}
Hs().requestIdleCallback;
Hs().cancelIdleCallback;
const Qn = (e) => !!e.type.__asyncLoader, al = (e) => e.type.__isKeepAlive;
function wc(e, t) {
  cl(e, "a", t);
}
function kc(e, t) {
  cl(e, "da", t);
}
function cl(e, t, n = mt) {
  const s = e.__wdc || (e.__wdc = () => {
    let r = n;
    for (; r; ) {
      if (r.isDeactivated)
        return;
      r = r.parent;
    }
    return e();
  });
  if (Vs(t, s, n), n) {
    let r = n.parent;
    for (; r && r.parent; )
      al(r.parent.vnode) && xc(s, t, n, r), r = r.parent;
  }
}
function xc(e, t, n, s) {
  const r = Vs(
    t,
    e,
    s,
    !0
    /* prepend */
  );
  ni(() => {
    Wr(s[t], r);
  }, n);
}
function Vs(e, t, n = mt, s = !1) {
  if (n) {
    const r = n[e] || (n[e] = []), i = t.__weh || (t.__weh = (...o) => {
      Jt();
      const l = cs(n), a = zt(t, n, e, o);
      return l(), Qt(), a;
    });
    return s ? r.unshift(i) : r.push(i), i;
  }
}
const en = (e) => (t, n = mt) => {
  (!ls || e === "sp") && Vs(e, (...s) => t(...s), n);
}, Sc = en("bm"), ul = en("m"), Cc = en(
  "bu"
), Tc = en("u"), Ac = en(
  "bum"
), ni = en("um"), Ec = en(
  "sp"
), Rc = en("rtg"), Ic = en("rtc");
function Lc(e, t = mt) {
  Vs("ec", e, t);
}
const Oc = Symbol.for("v-ndc");
function St(e, t, n, s) {
  let r;
  const i = n, o = ne(e);
  if (o || Qe(e)) {
    const l = o && On(e);
    let a = !1, f = !1;
    l && (a = !Et(e), f = cn(e), e = Ws(e)), r = new Array(e.length);
    for (let c = 0, b = e.length; c < b; c++)
      r[c] = t(
        a ? f ? Ls(it(e[c])) : it(e[c]) : e[c],
        c,
        void 0,
        i
      );
  } else if (typeof e == "number") {
    r = new Array(e);
    for (let l = 0; l < e; l++)
      r[l] = t(l + 1, l, void 0, i);
  } else if (He(e))
    if (e[Symbol.iterator])
      r = Array.from(
        e,
        (l, a) => t(l, a, void 0, i)
      );
    else {
      const l = Object.keys(e);
      r = new Array(l.length);
      for (let a = 0, f = l.length; a < f; a++) {
        const c = l[a];
        r[a] = t(e[c], c, a, i);
      }
    }
  else
    r = [];
  return r;
}
const Ar = (e) => e ? Ll(e) ? Gs(e) : Ar(e.parent) : null, es = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ ht(/* @__PURE__ */ Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => e.props,
    $attrs: (e) => e.attrs,
    $slots: (e) => e.slots,
    $refs: (e) => e.refs,
    $parent: (e) => Ar(e.parent),
    $root: (e) => Ar(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => fl(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      ei(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = nl.bind(e.proxy)),
    $watch: (e) => eu.bind(e)
  })
), ur = (e, t) => e !== $e && !e.__isScriptSetup && Ae(e, t), Pc = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: n, setupState: s, data: r, props: i, accessCache: o, type: l, appContext: a } = e;
    let f;
    if (t[0] !== "$") {
      const $ = o[t];
      if ($ !== void 0)
        switch ($) {
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
        if (ur(s, t))
          return o[t] = 1, s[t];
        if (r !== $e && Ae(r, t))
          return o[t] = 2, r[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (f = e.propsOptions[0]) && Ae(f, t)
        )
          return o[t] = 3, i[t];
        if (n !== $e && Ae(n, t))
          return o[t] = 4, n[t];
        Er && (o[t] = 0);
      }
    }
    const c = es[t];
    let b, v;
    if (c)
      return t === "$attrs" && ct(e.attrs, "get", ""), c(e);
    if (
      // css module (injected by vue-loader)
      (b = l.__cssModules) && (b = b[t])
    )
      return b;
    if (n !== $e && Ae(n, t))
      return o[t] = 4, n[t];
    if (
      // global properties
      v = a.config.globalProperties, Ae(v, t)
    )
      return v[t];
  },
  set({ _: e }, t, n) {
    const { data: s, setupState: r, ctx: i } = e;
    return ur(r, t) ? (r[t] = n, !0) : s !== $e && Ae(s, t) ? (s[t] = n, !0) : Ae(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (i[t] = n, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: n, ctx: s, appContext: r, propsOptions: i }
  }, o) {
    let l;
    return !!n[o] || e !== $e && Ae(e, o) || ur(t, o) || (l = i[0]) && Ae(l, o) || Ae(s, o) || Ae(es, o) || Ae(r.config.globalProperties, o);
  },
  defineProperty(e, t, n) {
    return n.get != null ? e._.accessCache[t] = 0 : Ae(n, "value") && this.set(e, t, n.value, null), Reflect.defineProperty(e, t, n);
  }
};
function ji(e) {
  return ne(e) ? e.reduce(
    (t, n) => (t[n] = null, t),
    {}
  ) : e;
}
let Er = !0;
function $c(e) {
  const t = fl(e), n = e.proxy, s = e.ctx;
  Er = !1, t.beforeCreate && Vi(t.beforeCreate, e, "bc");
  const {
    // state
    data: r,
    computed: i,
    methods: o,
    watch: l,
    provide: a,
    inject: f,
    // lifecycle
    created: c,
    beforeMount: b,
    mounted: v,
    beforeUpdate: $,
    updated: M,
    activated: U,
    deactivated: re,
    beforeDestroy: ie,
    beforeUnmount: be,
    destroyed: we,
    unmounted: z,
    render: q,
    renderTracked: H,
    renderTriggered: K,
    errorCaptured: Se,
    serverPrefetch: We,
    // public API
    expose: Be,
    inheritAttrs: je,
    // assets
    components: fe,
    directives: Ue,
    filters: Ve
  } = t;
  if (f && Fc(f, s, null), o)
    for (const ae in o) {
      const J = o[ae];
      le(J) && (s[ae] = J.bind(n));
    }
  if (r) {
    const ae = r.call(n, n);
    He(ae) && (e.data = Xr(ae));
  }
  if (Er = !0, i)
    for (const ae in i) {
      const J = i[ae], Ge = le(J) ? J.bind(n, n) : le(J.get) ? J.get.bind(n, n) : Dt, me = !le(J) && le(J.set) ? J.set.bind(n) : Dt, Oe = Ke({
        get: Ge,
        set: me
      });
      Object.defineProperty(s, ae, {
        enumerable: !0,
        configurable: !0,
        get: () => Oe.value,
        set: (Me) => Oe.value = Me
      });
    }
  if (l)
    for (const ae in l)
      hl(l[ae], s, n, ae);
  if (a) {
    const ae = le(a) ? a.call(n) : a;
    Reflect.ownKeys(ae).forEach((J) => {
      Uc(J, ae[J]);
    });
  }
  c && Vi(c, e, "c");
  function te(ae, J) {
    ne(J) ? J.forEach((Ge) => ae(Ge.bind(n))) : J && ae(J.bind(n));
  }
  if (te(Sc, b), te(ul, v), te(Cc, $), te(Tc, M), te(wc, U), te(kc, re), te(Lc, Se), te(Ic, H), te(Rc, K), te(Ac, be), te(ni, z), te(Ec, We), ne(Be))
    if (Be.length) {
      const ae = e.exposed || (e.exposed = {});
      Be.forEach((J) => {
        Object.defineProperty(ae, J, {
          get: () => n[J],
          set: (Ge) => n[J] = Ge,
          enumerable: !0
        });
      });
    } else e.exposed || (e.exposed = {});
  q && e.render === Dt && (e.render = q), je != null && (e.inheritAttrs = je), fe && (e.components = fe), Ue && (e.directives = Ue), We && ll(e);
}
function Fc(e, t, n = Dt) {
  ne(e) && (e = Rr(e));
  for (const s in e) {
    const r = e[s];
    let i;
    He(r) ? "default" in r ? i = ks(
      r.from || s,
      r.default,
      !0
    ) : i = ks(r.from || s) : i = ks(r), ut(i) ? Object.defineProperty(t, s, {
      enumerable: !0,
      configurable: !0,
      get: () => i.value,
      set: (o) => i.value = o
    }) : t[s] = i;
  }
}
function Vi(e, t, n) {
  zt(
    ne(e) ? e.map((s) => s.bind(t.proxy)) : e.bind(t.proxy),
    t,
    n
  );
}
function hl(e, t, n, s) {
  let r = s.includes(".") ? Cl(n, s) : () => n[s];
  if (Qe(e)) {
    const i = t[e];
    le(i) && vn(r, i);
  } else if (le(e))
    vn(r, e.bind(n));
  else if (He(e))
    if (ne(e))
      e.forEach((i) => hl(i, t, n, s));
    else {
      const i = le(e.handler) ? e.handler.bind(n) : t[e.handler];
      le(i) && vn(r, i, e);
    }
}
function fl(e) {
  const t = e.type, { mixins: n, extends: s } = t, {
    mixins: r,
    optionsCache: i,
    config: { optionMergeStrategies: o }
  } = e.appContext, l = i.get(t);
  let a;
  return l ? a = l : !r.length && !n && !s ? a = t : (a = {}, r.length && r.forEach(
    (f) => Fs(a, f, o, !0)
  ), Fs(a, t, o)), He(t) && i.set(t, a), a;
}
function Fs(e, t, n, s = !1) {
  const { mixins: r, extends: i } = t;
  i && Fs(e, i, n, !0), r && r.forEach(
    (o) => Fs(e, o, n, !0)
  );
  for (const o in t)
    if (!(s && o === "expose")) {
      const l = Bc[o] || n && n[o];
      e[o] = l ? l(e[o], t[o]) : t[o];
    }
  return e;
}
const Bc = {
  data: Ki,
  props: Zi,
  emits: Zi,
  // objects
  methods: Kn,
  computed: Kn,
  // lifecycle
  beforeCreate: pt,
  created: pt,
  beforeMount: pt,
  mounted: pt,
  beforeUpdate: pt,
  updated: pt,
  beforeDestroy: pt,
  beforeUnmount: pt,
  destroyed: pt,
  unmounted: pt,
  activated: pt,
  deactivated: pt,
  errorCaptured: pt,
  serverPrefetch: pt,
  // assets
  components: Kn,
  directives: Kn,
  // watch
  watch: Mc,
  // provide / inject
  provide: Ki,
  inject: Nc
};
function Ki(e, t) {
  return t ? e ? function() {
    return ht(
      le(e) ? e.call(this, this) : e,
      le(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function Nc(e, t) {
  return Kn(Rr(e), Rr(t));
}
function Rr(e) {
  if (ne(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++)
      t[e[n]] = e[n];
    return t;
  }
  return e;
}
function pt(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function Kn(e, t) {
  return e ? ht(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function Zi(e, t) {
  return e ? ne(e) && ne(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : ht(
    /* @__PURE__ */ Object.create(null),
    ji(e),
    ji(t ?? {})
  ) : t;
}
function Mc(e, t) {
  if (!e) return t;
  if (!t) return e;
  const n = ht(/* @__PURE__ */ Object.create(null), e);
  for (const s in t)
    n[s] = pt(e[s], t[s]);
  return n;
}
function dl() {
  return {
    app: null,
    config: {
      isNativeTag: Ea,
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
let Dc = 0;
function qc(e, t) {
  return function(s, r = null) {
    le(s) || (s = ht({}, s)), r != null && !He(r) && (r = null);
    const i = dl(), o = /* @__PURE__ */ new WeakSet(), l = [];
    let a = !1;
    const f = i.app = {
      _uid: Dc++,
      _component: s,
      _props: r,
      _container: null,
      _context: i,
      _instance: null,
      version: ku,
      get config() {
        return i.config;
      },
      set config(c) {
      },
      use(c, ...b) {
        return o.has(c) || (c && le(c.install) ? (o.add(c), c.install(f, ...b)) : le(c) && (o.add(c), c(f, ...b))), f;
      },
      mixin(c) {
        return i.mixins.includes(c) || i.mixins.push(c), f;
      },
      component(c, b) {
        return b ? (i.components[c] = b, f) : i.components[c];
      },
      directive(c, b) {
        return b ? (i.directives[c] = b, f) : i.directives[c];
      },
      mount(c, b, v) {
        if (!a) {
          const $ = f._ceVNode || qt(s, r);
          return $.appContext = i, v === !0 ? v = "svg" : v === !1 && (v = void 0), e($, c, v), a = !0, f._container = c, c.__vue_app__ = f, Gs($.component);
        }
      },
      onUnmount(c) {
        l.push(c);
      },
      unmount() {
        a && (zt(
          l,
          f._instance,
          16
        ), e(null, f._container), delete f._container.__vue_app__);
      },
      provide(c, b) {
        return i.provides[c] = b, f;
      },
      runWithContext(c) {
        const b = $n;
        $n = f;
        try {
          return c();
        } finally {
          $n = b;
        }
      }
    };
    return f;
  };
}
let $n = null;
function Uc(e, t) {
  if (mt) {
    let n = mt.provides;
    const s = mt.parent && mt.parent.provides;
    s === n && (n = mt.provides = Object.create(s)), n[e] = t;
  }
}
function ks(e, t, n = !1) {
  const s = mu();
  if (s || $n) {
    let r = $n ? $n._context.provides : s ? s.parent == null || s.ce ? s.vnode.appContext && s.vnode.appContext.provides : s.parent.provides : void 0;
    if (r && e in r)
      return r[e];
    if (arguments.length > 1)
      return n && le(t) ? t.call(s && s.proxy) : t;
  }
}
const pl = {}, gl = () => Object.create(pl), ml = (e) => Object.getPrototypeOf(e) === pl;
function zc(e, t, n, s = !1) {
  const r = {}, i = gl();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), _l(e, t, r, i);
  for (const o in e.propsOptions[0])
    o in r || (r[o] = void 0);
  n ? e.props = s ? r : ic(r) : e.type.props ? e.props = r : e.props = i, e.attrs = i;
}
function Hc(e, t, n, s) {
  const {
    props: r,
    attrs: i,
    vnode: { patchFlag: o }
  } = e, l = Te(r), [a] = e.propsOptions;
  let f = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (s || o > 0) && !(o & 16)
  ) {
    if (o & 8) {
      const c = e.vnode.dynamicProps;
      for (let b = 0; b < c.length; b++) {
        let v = c[b];
        if (Ks(e.emitsOptions, v))
          continue;
        const $ = t[v];
        if (a)
          if (Ae(i, v))
            $ !== i[v] && (i[v] = $, f = !0);
          else {
            const M = an(v);
            r[M] = Ir(
              a,
              l,
              M,
              $,
              e,
              !1
            );
          }
        else
          $ !== i[v] && (i[v] = $, f = !0);
      }
    }
  } else {
    _l(e, t, r, i) && (f = !0);
    let c;
    for (const b in l)
      (!t || // for camelCase
      !Ae(t, b) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((c = fn(b)) === b || !Ae(t, c))) && (a ? n && // for camelCase
      (n[b] !== void 0 || // for kebab-case
      n[c] !== void 0) && (r[b] = Ir(
        a,
        l,
        b,
        void 0,
        e,
        !0
      )) : delete r[b]);
    if (i !== l)
      for (const b in i)
        (!t || !Ae(t, b)) && (delete i[b], f = !0);
  }
  f && Zt(e.attrs, "set", "");
}
function _l(e, t, n, s) {
  const [r, i] = e.propsOptions;
  let o = !1, l;
  if (t)
    for (let a in t) {
      if (Gn(a))
        continue;
      const f = t[a];
      let c;
      r && Ae(r, c = an(a)) ? !i || !i.includes(c) ? n[c] = f : (l || (l = {}))[c] = f : Ks(e.emitsOptions, a) || (!(a in s) || f !== s[a]) && (s[a] = f, o = !0);
    }
  if (i) {
    const a = Te(n), f = l || $e;
    for (let c = 0; c < i.length; c++) {
      const b = i[c];
      n[b] = Ir(
        r,
        a,
        b,
        f[b],
        e,
        !Ae(f, b)
      );
    }
  }
  return o;
}
function Ir(e, t, n, s, r, i) {
  const o = e[n];
  if (o != null) {
    const l = Ae(o, "default");
    if (l && s === void 0) {
      const a = o.default;
      if (o.type !== Function && !o.skipFactory && le(a)) {
        const { propsDefaults: f } = r;
        if (n in f)
          s = f[n];
        else {
          const c = cs(r);
          s = f[n] = a.call(
            null,
            t
          ), c();
        }
      } else
        s = a;
      r.ce && r.ce._setProp(n, s);
    }
    o[
      0
      /* shouldCast */
    ] && (i && !l ? s = !1 : o[
      1
      /* shouldCastTrue */
    ] && (s === "" || s === fn(n)) && (s = !0));
  }
  return s;
}
const Wc = /* @__PURE__ */ new WeakMap();
function vl(e, t, n = !1) {
  const s = n ? Wc : t.propsCache, r = s.get(e);
  if (r)
    return r;
  const i = e.props, o = {}, l = [];
  let a = !1;
  if (!le(e)) {
    const c = (b) => {
      a = !0;
      const [v, $] = vl(b, t, !0);
      ht(o, v), $ && l.push(...$);
    };
    !n && t.mixins.length && t.mixins.forEach(c), e.extends && c(e.extends), e.mixins && e.mixins.forEach(c);
  }
  if (!i && !a)
    return He(e) && s.set(e, In), In;
  if (ne(i))
    for (let c = 0; c < i.length; c++) {
      const b = an(i[c]);
      Gi(b) && (o[b] = $e);
    }
  else if (i)
    for (const c in i) {
      const b = an(c);
      if (Gi(b)) {
        const v = i[c], $ = o[b] = ne(v) || le(v) ? { type: v } : ht({}, v), M = $.type;
        let U = !1, re = !0;
        if (ne(M))
          for (let ie = 0; ie < M.length; ++ie) {
            const be = M[ie], we = le(be) && be.name;
            if (we === "Boolean") {
              U = !0;
              break;
            } else we === "String" && (re = !1);
          }
        else
          U = le(M) && M.name === "Boolean";
        $[
          0
          /* shouldCast */
        ] = U, $[
          1
          /* shouldCastTrue */
        ] = re, (U || Ae($, "default")) && l.push(b);
      }
    }
  const f = [o, l];
  return He(e) && s.set(e, f), f;
}
function Gi(e) {
  return e[0] !== "$" && !Gn(e);
}
const si = (e) => e === "_" || e === "__" || e === "_ctx" || e === "$stable", ri = (e) => ne(e) ? e.map(Mt) : [Mt(e)], jc = (e, t, n) => {
  if (t._n)
    return t;
  const s = _c((...r) => ri(t(...r)), n);
  return s._c = !1, s;
}, yl = (e, t, n) => {
  const s = e._ctx;
  for (const r in e) {
    if (si(r)) continue;
    const i = e[r];
    if (le(i))
      t[r] = jc(r, i, s);
    else if (i != null) {
      const o = ri(i);
      t[r] = () => o;
    }
  }
}, bl = (e, t) => {
  const n = ri(t);
  e.slots.default = () => n;
}, wl = (e, t, n) => {
  for (const s in t)
    (n || !si(s)) && (e[s] = t[s]);
}, Vc = (e, t, n) => {
  const s = e.slots = gl();
  if (e.vnode.shapeFlag & 32) {
    const r = t.__;
    r && wr(s, "__", r, !0);
    const i = t._;
    i ? (wl(s, t, n), n && wr(s, "_", i, !0)) : yl(t, s);
  } else t && bl(e, t);
}, Kc = (e, t, n) => {
  const { vnode: s, slots: r } = e;
  let i = !0, o = $e;
  if (s.shapeFlag & 32) {
    const l = t._;
    l ? n && l === 1 ? i = !1 : wl(r, t, n) : (i = !t.$stable, yl(t, r)), o = t;
  } else t && (bl(e, t), o = { default: 1 });
  if (i)
    for (const l in r)
      !si(l) && o[l] == null && delete r[l];
}, wt = lu;
function Zc(e) {
  return Gc(e);
}
function Gc(e, t) {
  const n = Hs();
  n.__VUE__ = !0;
  const {
    insert: s,
    remove: r,
    patchProp: i,
    createElement: o,
    createText: l,
    createComment: a,
    setText: f,
    setElementText: c,
    parentNode: b,
    nextSibling: v,
    setScopeId: $ = Dt,
    insertStaticContent: M
  } = e, U = (d, m, w, A = null, S = null, R = null, F = void 0, B = null, P = !!m.dynamicChildren) => {
    if (d === m)
      return;
    d && !Un(d, m) && (A = V(d), Me(d, S, R, !0), d = null), m.patchFlag === -2 && (P = !1, m.dynamicChildren = null);
    const { type: L, ref: G, shapeFlag: N } = m;
    switch (L) {
      case Zs:
        re(d, m, w, A);
        break;
      case un:
        ie(d, m, w, A);
        break;
      case xs:
        d == null && be(m, w, A, F);
        break;
      case ze:
        fe(
          d,
          m,
          w,
          A,
          S,
          R,
          F,
          B,
          P
        );
        break;
      default:
        N & 1 ? q(
          d,
          m,
          w,
          A,
          S,
          R,
          F,
          B,
          P
        ) : N & 6 ? Ue(
          d,
          m,
          w,
          A,
          S,
          R,
          F,
          B,
          P
        ) : (N & 64 || N & 128) && L.process(
          d,
          m,
          w,
          A,
          S,
          R,
          F,
          B,
          P,
          lt
        );
    }
    G != null && S ? Jn(G, d && d.ref, R, m || d, !m) : G == null && d && d.ref != null && Jn(d.ref, null, R, d, !0);
  }, re = (d, m, w, A) => {
    if (d == null)
      s(
        m.el = l(m.children),
        w,
        A
      );
    else {
      const S = m.el = d.el;
      m.children !== d.children && f(S, m.children);
    }
  }, ie = (d, m, w, A) => {
    d == null ? s(
      m.el = a(m.children || ""),
      w,
      A
    ) : m.el = d.el;
  }, be = (d, m, w, A) => {
    [d.el, d.anchor] = M(
      d.children,
      m,
      w,
      A,
      d.el,
      d.anchor
    );
  }, we = ({ el: d, anchor: m }, w, A) => {
    let S;
    for (; d && d !== m; )
      S = v(d), s(d, w, A), d = S;
    s(m, w, A);
  }, z = ({ el: d, anchor: m }) => {
    let w;
    for (; d && d !== m; )
      w = v(d), r(d), d = w;
    r(m);
  }, q = (d, m, w, A, S, R, F, B, P) => {
    m.type === "svg" ? F = "svg" : m.type === "math" && (F = "mathml"), d == null ? H(
      m,
      w,
      A,
      S,
      R,
      F,
      B,
      P
    ) : We(
      d,
      m,
      S,
      R,
      F,
      B,
      P
    );
  }, H = (d, m, w, A, S, R, F, B) => {
    let P, L;
    const { props: G, shapeFlag: N, transition: W, dirs: Y } = d;
    if (P = d.el = o(
      d.type,
      R,
      G && G.is,
      G
    ), N & 8 ? c(P, d.children) : N & 16 && Se(
      d.children,
      P,
      null,
      A,
      S,
      hr(d, R),
      F,
      B
    ), Y && pn(d, null, A, "created"), K(P, d, d.scopeId, F, A), G) {
      for (const pe in G)
        pe !== "value" && !Gn(pe) && i(P, pe, null, G[pe], R, A);
      "value" in G && i(P, "value", null, G.value, R), (L = G.onVnodeBeforeMount) && Ft(L, A, d);
    }
    Y && pn(d, null, A, "beforeMount");
    const ce = Yc(S, W);
    ce && W.beforeEnter(P), s(P, m, w), ((L = G && G.onVnodeMounted) || ce || Y) && wt(() => {
      L && Ft(L, A, d), ce && W.enter(P), Y && pn(d, null, A, "mounted");
    }, S);
  }, K = (d, m, w, A, S) => {
    if (w && $(d, w), A)
      for (let R = 0; R < A.length; R++)
        $(d, A[R]);
    if (S) {
      let R = S.subTree;
      if (m === R || Al(R.type) && (R.ssContent === m || R.ssFallback === m)) {
        const F = S.vnode;
        K(
          d,
          F,
          F.scopeId,
          F.slotScopeIds,
          S.parent
        );
      }
    }
  }, Se = (d, m, w, A, S, R, F, B, P = 0) => {
    for (let L = P; L < d.length; L++) {
      const G = d[L] = B ? sn(d[L]) : Mt(d[L]);
      U(
        null,
        G,
        m,
        w,
        A,
        S,
        R,
        F,
        B
      );
    }
  }, We = (d, m, w, A, S, R, F) => {
    const B = m.el = d.el;
    let { patchFlag: P, dynamicChildren: L, dirs: G } = m;
    P |= d.patchFlag & 16;
    const N = d.props || $e, W = m.props || $e;
    let Y;
    if (w && gn(w, !1), (Y = W.onVnodeBeforeUpdate) && Ft(Y, w, m, d), G && pn(m, d, w, "beforeUpdate"), w && gn(w, !0), (N.innerHTML && W.innerHTML == null || N.textContent && W.textContent == null) && c(B, ""), L ? Be(
      d.dynamicChildren,
      L,
      B,
      w,
      A,
      hr(m, S),
      R
    ) : F || J(
      d,
      m,
      B,
      null,
      w,
      A,
      hr(m, S),
      R,
      !1
    ), P > 0) {
      if (P & 16)
        je(B, N, W, w, S);
      else if (P & 2 && N.class !== W.class && i(B, "class", null, W.class, S), P & 4 && i(B, "style", N.style, W.style, S), P & 8) {
        const ce = m.dynamicProps;
        for (let pe = 0; pe < ce.length; pe++) {
          const _e = ce[pe], Xe = N[_e], ke = W[_e];
          (ke !== Xe || _e === "value") && i(B, _e, Xe, ke, S, w);
        }
      }
      P & 1 && d.children !== m.children && c(B, m.children);
    } else !F && L == null && je(B, N, W, w, S);
    ((Y = W.onVnodeUpdated) || G) && wt(() => {
      Y && Ft(Y, w, m, d), G && pn(m, d, w, "updated");
    }, A);
  }, Be = (d, m, w, A, S, R, F) => {
    for (let B = 0; B < m.length; B++) {
      const P = d[B], L = m[B], G = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        P.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (P.type === ze || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !Un(P, L) || // - In the case of a component, it could contain anything.
        P.shapeFlag & 198) ? b(P.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          w
        )
      );
      U(
        P,
        L,
        G,
        null,
        A,
        S,
        R,
        F,
        !0
      );
    }
  }, je = (d, m, w, A, S) => {
    if (m !== w) {
      if (m !== $e)
        for (const R in m)
          !Gn(R) && !(R in w) && i(
            d,
            R,
            m[R],
            null,
            S,
            A
          );
      for (const R in w) {
        if (Gn(R)) continue;
        const F = w[R], B = m[R];
        F !== B && R !== "value" && i(d, R, B, F, S, A);
      }
      "value" in w && i(d, "value", m.value, w.value, S);
    }
  }, fe = (d, m, w, A, S, R, F, B, P) => {
    const L = m.el = d ? d.el : l(""), G = m.anchor = d ? d.anchor : l("");
    let { patchFlag: N, dynamicChildren: W, slotScopeIds: Y } = m;
    Y && (B = B ? B.concat(Y) : Y), d == null ? (s(L, w, A), s(G, w, A), Se(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      m.children || [],
      w,
      G,
      S,
      R,
      F,
      B,
      P
    )) : N > 0 && N & 64 && W && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    d.dynamicChildren ? (Be(
      d.dynamicChildren,
      W,
      w,
      S,
      R,
      F,
      B
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (m.key != null || S && m === S.subTree) && kl(
      d,
      m,
      !0
      /* shallow */
    )) : J(
      d,
      m,
      w,
      G,
      S,
      R,
      F,
      B,
      P
    );
  }, Ue = (d, m, w, A, S, R, F, B, P) => {
    m.slotScopeIds = B, d == null ? m.shapeFlag & 512 ? S.ctx.activate(
      m,
      w,
      A,
      F,
      P
    ) : Ve(
      m,
      w,
      A,
      S,
      R,
      F,
      P
    ) : Ze(d, m, P);
  }, Ve = (d, m, w, A, S, R, F) => {
    const B = d.component = gu(
      d,
      A,
      S
    );
    if (al(d) && (B.ctx.renderer = lt), _u(B, !1, F), B.asyncDep) {
      if (S && S.registerDep(B, te, F), !d.el) {
        const P = B.subTree = qt(un);
        ie(null, P, m, w), d.placeholder = P.el;
      }
    } else
      te(
        B,
        d,
        m,
        w,
        S,
        R,
        F
      );
  }, Ze = (d, m, w) => {
    const A = m.component = d.component;
    if (iu(d, m, w))
      if (A.asyncDep && !A.asyncResolved) {
        ae(A, m, w);
        return;
      } else
        A.next = m, A.update();
    else
      m.el = d.el, A.vnode = m;
  }, te = (d, m, w, A, S, R, F) => {
    const B = () => {
      if (d.isMounted) {
        let { next: N, bu: W, u: Y, parent: ce, vnode: pe } = d;
        {
          const u = xl(d);
          if (u) {
            N && (N.el = pe.el, ae(d, N, F)), u.asyncDep.then(() => {
              d.isUnmounted || B();
            });
            return;
          }
        }
        let _e = N, Xe;
        gn(d, !1), N ? (N.el = pe.el, ae(d, N, F)) : N = pe, W && ws(W), (Xe = N.props && N.props.onVnodeBeforeUpdate) && Ft(Xe, ce, N, pe), gn(d, !0);
        const ke = Xi(d), ft = d.subTree;
        d.subTree = ke, U(
          ft,
          ke,
          // parent may have changed if it's in a teleport
          b(ft.el),
          // anchor may have changed if it's in a fragment
          V(ft),
          d,
          S,
          R
        ), N.el = ke.el, _e === null && ou(d, ke.el), Y && wt(Y, S), (Xe = N.props && N.props.onVnodeUpdated) && wt(
          () => Ft(Xe, ce, N, pe),
          S
        );
      } else {
        let N;
        const { el: W, props: Y } = m, { bm: ce, m: pe, parent: _e, root: Xe, type: ke } = d, ft = Qn(m);
        gn(d, !1), ce && ws(ce), !ft && (N = Y && Y.onVnodeBeforeMount) && Ft(N, _e, m), gn(d, !0);
        {
          Xe.ce && // @ts-expect-error _def is private
          Xe.ce._def.shadowRoot !== !1 && Xe.ce._injectChildStyle(ke);
          const u = d.subTree = Xi(d);
          U(
            null,
            u,
            w,
            A,
            d,
            S,
            R
          ), m.el = u.el;
        }
        if (pe && wt(pe, S), !ft && (N = Y && Y.onVnodeMounted)) {
          const u = m;
          wt(
            () => Ft(N, _e, u),
            S
          );
        }
        (m.shapeFlag & 256 || _e && Qn(_e.vnode) && _e.vnode.shapeFlag & 256) && d.a && wt(d.a, S), d.isMounted = !0, m = w = A = null;
      }
    };
    d.scope.on();
    const P = d.effect = new Do(B);
    d.scope.off();
    const L = d.update = P.run.bind(P), G = d.job = P.runIfDirty.bind(P);
    G.i = d, G.id = d.uid, P.scheduler = () => ei(G), gn(d, !0), L();
  }, ae = (d, m, w) => {
    m.component = d;
    const A = d.vnode.props;
    d.vnode = m, d.next = null, Hc(d, m.props, A, w), Kc(d, m.children, w), Jt(), Wi(d), Qt();
  }, J = (d, m, w, A, S, R, F, B, P = !1) => {
    const L = d && d.children, G = d ? d.shapeFlag : 0, N = m.children, { patchFlag: W, shapeFlag: Y } = m;
    if (W > 0) {
      if (W & 128) {
        me(
          L,
          N,
          w,
          A,
          S,
          R,
          F,
          B,
          P
        );
        return;
      } else if (W & 256) {
        Ge(
          L,
          N,
          w,
          A,
          S,
          R,
          F,
          B,
          P
        );
        return;
      }
    }
    Y & 8 ? (G & 16 && de(L, S, R), N !== L && c(w, N)) : G & 16 ? Y & 16 ? me(
      L,
      N,
      w,
      A,
      S,
      R,
      F,
      B,
      P
    ) : de(L, S, R, !0) : (G & 8 && c(w, ""), Y & 16 && Se(
      N,
      w,
      A,
      S,
      R,
      F,
      B,
      P
    ));
  }, Ge = (d, m, w, A, S, R, F, B, P) => {
    d = d || In, m = m || In;
    const L = d.length, G = m.length, N = Math.min(L, G);
    let W;
    for (W = 0; W < N; W++) {
      const Y = m[W] = P ? sn(m[W]) : Mt(m[W]);
      U(
        d[W],
        Y,
        w,
        null,
        S,
        R,
        F,
        B,
        P
      );
    }
    L > G ? de(
      d,
      S,
      R,
      !0,
      !1,
      N
    ) : Se(
      m,
      w,
      A,
      S,
      R,
      F,
      B,
      P,
      N
    );
  }, me = (d, m, w, A, S, R, F, B, P) => {
    let L = 0;
    const G = m.length;
    let N = d.length - 1, W = G - 1;
    for (; L <= N && L <= W; ) {
      const Y = d[L], ce = m[L] = P ? sn(m[L]) : Mt(m[L]);
      if (Un(Y, ce))
        U(
          Y,
          ce,
          w,
          null,
          S,
          R,
          F,
          B,
          P
        );
      else
        break;
      L++;
    }
    for (; L <= N && L <= W; ) {
      const Y = d[N], ce = m[W] = P ? sn(m[W]) : Mt(m[W]);
      if (Un(Y, ce))
        U(
          Y,
          ce,
          w,
          null,
          S,
          R,
          F,
          B,
          P
        );
      else
        break;
      N--, W--;
    }
    if (L > N) {
      if (L <= W) {
        const Y = W + 1, ce = Y < G ? m[Y].el : A;
        for (; L <= W; )
          U(
            null,
            m[L] = P ? sn(m[L]) : Mt(m[L]),
            w,
            ce,
            S,
            R,
            F,
            B,
            P
          ), L++;
      }
    } else if (L > W)
      for (; L <= N; )
        Me(d[L], S, R, !0), L++;
    else {
      const Y = L, ce = L, pe = /* @__PURE__ */ new Map();
      for (L = ce; L <= W; L++) {
        const k = m[L] = P ? sn(m[L]) : Mt(m[L]);
        k.key != null && pe.set(k.key, L);
      }
      let _e, Xe = 0;
      const ke = W - ce + 1;
      let ft = !1, u = 0;
      const _ = new Array(ke);
      for (L = 0; L < ke; L++) _[L] = 0;
      for (L = Y; L <= N; L++) {
        const k = d[L];
        if (Xe >= ke) {
          Me(k, S, R, !0);
          continue;
        }
        let O;
        if (k.key != null)
          O = pe.get(k.key);
        else
          for (_e = ce; _e <= W; _e++)
            if (_[_e - ce] === 0 && Un(k, m[_e])) {
              O = _e;
              break;
            }
        O === void 0 ? Me(k, S, R, !0) : (_[O - ce] = L + 1, O >= u ? u = O : ft = !0, U(
          k,
          m[O],
          w,
          null,
          S,
          R,
          F,
          B,
          P
        ), Xe++);
      }
      const T = ft ? Xc(_) : In;
      for (_e = T.length - 1, L = ke - 1; L >= 0; L--) {
        const k = ce + L, O = m[k], j = m[k + 1], X = k + 1 < G ? (
          // #13559, fallback to el placeholder for unresolved async component
          j.el || j.placeholder
        ) : A;
        _[L] === 0 ? U(
          null,
          O,
          w,
          X,
          S,
          R,
          F,
          B,
          P
        ) : ft && (_e < 0 || L !== T[_e] ? Oe(O, w, X, 2) : _e--);
      }
    }
  }, Oe = (d, m, w, A, S = null) => {
    const { el: R, type: F, transition: B, children: P, shapeFlag: L } = d;
    if (L & 6) {
      Oe(d.component.subTree, m, w, A);
      return;
    }
    if (L & 128) {
      d.suspense.move(m, w, A);
      return;
    }
    if (L & 64) {
      F.move(d, m, w, lt);
      return;
    }
    if (F === ze) {
      s(R, m, w);
      for (let N = 0; N < P.length; N++)
        Oe(P[N], m, w, A);
      s(d.anchor, m, w);
      return;
    }
    if (F === xs) {
      we(d, m, w);
      return;
    }
    if (A !== 2 && L & 1 && B)
      if (A === 0)
        B.beforeEnter(R), s(R, m, w), wt(() => B.enter(R), S);
      else {
        const { leave: N, delayLeave: W, afterLeave: Y } = B, ce = () => {
          d.ctx.isUnmounted ? r(R) : s(R, m, w);
        }, pe = () => {
          N(R, () => {
            ce(), Y && Y();
          });
        };
        W ? W(R, ce, pe) : pe();
      }
    else
      s(R, m, w);
  }, Me = (d, m, w, A = !1, S = !1) => {
    const {
      type: R,
      props: F,
      ref: B,
      children: P,
      dynamicChildren: L,
      shapeFlag: G,
      patchFlag: N,
      dirs: W,
      cacheIndex: Y
    } = d;
    if (N === -2 && (S = !1), B != null && (Jt(), Jn(B, null, w, d, !0), Qt()), Y != null && (m.renderCache[Y] = void 0), G & 256) {
      m.ctx.deactivate(d);
      return;
    }
    const ce = G & 1 && W, pe = !Qn(d);
    let _e;
    if (pe && (_e = F && F.onVnodeBeforeUnmount) && Ft(_e, m, d), G & 6)
      Ye(d.component, w, A);
    else {
      if (G & 128) {
        d.suspense.unmount(w, A);
        return;
      }
      ce && pn(d, null, m, "beforeUnmount"), G & 64 ? d.type.remove(
        d,
        m,
        w,
        lt,
        A
      ) : L && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !L.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (R !== ze || N > 0 && N & 64) ? de(
        L,
        m,
        w,
        !1,
        !0
      ) : (R === ze && N & 384 || !S && G & 16) && de(P, m, w), A && ot(d);
    }
    (pe && (_e = F && F.onVnodeUnmounted) || ce) && wt(() => {
      _e && Ft(_e, m, d), ce && pn(d, null, m, "unmounted");
    }, w);
  }, ot = (d) => {
    const { type: m, el: w, anchor: A, transition: S } = d;
    if (m === ze) {
      D(w, A);
      return;
    }
    if (m === xs) {
      z(d);
      return;
    }
    const R = () => {
      r(w), S && !S.persisted && S.afterLeave && S.afterLeave();
    };
    if (d.shapeFlag & 1 && S && !S.persisted) {
      const { leave: F, delayLeave: B } = S, P = () => F(w, R);
      B ? B(d.el, R, P) : P();
    } else
      R();
  }, D = (d, m) => {
    let w;
    for (; d !== m; )
      w = v(d), r(d), d = w;
    r(m);
  }, Ye = (d, m, w) => {
    const {
      bum: A,
      scope: S,
      job: R,
      subTree: F,
      um: B,
      m: P,
      a: L,
      parent: G,
      slots: { __: N }
    } = d;
    Yi(P), Yi(L), A && ws(A), G && ne(N) && N.forEach((W) => {
      G.renderCache[W] = void 0;
    }), S.stop(), R && (R.flags |= 8, Me(F, d, m, w)), B && wt(B, m), wt(() => {
      d.isUnmounted = !0;
    }, m), m && m.pendingBranch && !m.isUnmounted && d.asyncDep && !d.asyncResolved && d.suspenseId === m.pendingId && (m.deps--, m.deps === 0 && m.resolve());
  }, de = (d, m, w, A = !1, S = !1, R = 0) => {
    for (let F = R; F < d.length; F++)
      Me(d[F], m, w, A, S);
  }, V = (d) => {
    if (d.shapeFlag & 6)
      return V(d.component.subTree);
    if (d.shapeFlag & 128)
      return d.suspense.next();
    const m = v(d.anchor || d.el), w = m && m[vc];
    return w ? v(w) : m;
  };
  let Ie = !1;
  const st = (d, m, w) => {
    d == null ? m._vnode && Me(m._vnode, null, null, !0) : U(
      m._vnode || null,
      d,
      m,
      null,
      null,
      null,
      w
    ), m._vnode = d, Ie || (Ie = !0, Wi(), rl(), Ie = !1);
  }, lt = {
    p: U,
    um: Me,
    m: Oe,
    r: ot,
    mt: Ve,
    mc: Se,
    pc: J,
    pbc: Be,
    n: V,
    o: e
  };
  return {
    render: st,
    hydrate: void 0,
    createApp: qc(st)
  };
}
function hr({ type: e, props: t }, n) {
  return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function gn({ effect: e, job: t }, n) {
  n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function Yc(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function kl(e, t, n = !1) {
  const s = e.children, r = t.children;
  if (ne(s) && ne(r))
    for (let i = 0; i < s.length; i++) {
      const o = s[i];
      let l = r[i];
      l.shapeFlag & 1 && !l.dynamicChildren && ((l.patchFlag <= 0 || l.patchFlag === 32) && (l = r[i] = sn(r[i]), l.el = o.el), !n && l.patchFlag !== -2 && kl(o, l)), l.type === Zs && (l.el = o.el), l.type === un && !l.el && (l.el = o.el);
    }
}
function Xc(e) {
  const t = e.slice(), n = [0];
  let s, r, i, o, l;
  const a = e.length;
  for (s = 0; s < a; s++) {
    const f = e[s];
    if (f !== 0) {
      if (r = n[n.length - 1], e[r] < f) {
        t[s] = r, n.push(s);
        continue;
      }
      for (i = 0, o = n.length - 1; i < o; )
        l = i + o >> 1, e[n[l]] < f ? i = l + 1 : o = l;
      f < e[n[i]] && (i > 0 && (t[s] = n[i - 1]), n[i] = s);
    }
  }
  for (i = n.length, o = n[i - 1]; i-- > 0; )
    n[i] = o, o = t[o];
  return n;
}
function xl(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : xl(t);
}
function Yi(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
const Jc = Symbol.for("v-scx"), Qc = () => ks(Jc);
function vn(e, t, n) {
  return Sl(e, t, n);
}
function Sl(e, t, n = $e) {
  const { immediate: s, deep: r, flush: i, once: o } = n, l = ht({}, n), a = t && s || !t && i !== "post";
  let f;
  if (ls) {
    if (i === "sync") {
      const $ = Qc();
      f = $.__watcherHandles || ($.__watcherHandles = []);
    } else if (!a) {
      const $ = () => {
      };
      return $.stop = Dt, $.resume = Dt, $.pause = Dt, $;
    }
  }
  const c = mt;
  l.call = ($, M, U) => zt($, c, M, U);
  let b = !1;
  i === "post" ? l.scheduler = ($) => {
    wt($, c && c.suspense);
  } : i !== "sync" && (b = !0, l.scheduler = ($, M) => {
    M ? $() : ei($);
  }), l.augmentJob = ($) => {
    t && ($.flags |= 4), b && ($.flags |= 2, c && ($.id = c.uid, $.i = c));
  };
  const v = dc(e, t, l);
  return ls && (f ? f.push(v) : a && v()), v;
}
function eu(e, t, n) {
  const s = this.proxy, r = Qe(e) ? e.includes(".") ? Cl(s, e) : () => s[e] : e.bind(s, s);
  let i;
  le(t) ? i = t : (i = t.handler, n = t);
  const o = cs(this), l = Sl(r, i.bind(s), n);
  return o(), l;
}
function Cl(e, t) {
  const n = t.split(".");
  return () => {
    let s = e;
    for (let r = 0; r < n.length && s; r++)
      s = s[n[r]];
    return s;
  };
}
const tu = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${an(t)}Modifiers`] || e[`${fn(t)}Modifiers`];
function nu(e, t, ...n) {
  if (e.isUnmounted) return;
  const s = e.vnode.props || $e;
  let r = n;
  const i = t.startsWith("update:"), o = i && tu(s, t.slice(7));
  o && (o.trim && (r = n.map((c) => Qe(c) ? c.trim() : c)), o.number && (r = n.map(kr)));
  let l, a = s[l = ir(t)] || // also try camelCase event handler (#2249)
  s[l = ir(an(t))];
  !a && i && (a = s[l = ir(fn(t))]), a && zt(
    a,
    e,
    6,
    r
  );
  const f = s[l + "Once"];
  if (f) {
    if (!e.emitted)
      e.emitted = {};
    else if (e.emitted[l])
      return;
    e.emitted[l] = !0, zt(
      f,
      e,
      6,
      r
    );
  }
}
function Tl(e, t, n = !1) {
  const s = t.emitsCache, r = s.get(e);
  if (r !== void 0)
    return r;
  const i = e.emits;
  let o = {}, l = !1;
  if (!le(e)) {
    const a = (f) => {
      const c = Tl(f, t, !0);
      c && (l = !0, ht(o, c));
    };
    !n && t.mixins.length && t.mixins.forEach(a), e.extends && a(e.extends), e.mixins && e.mixins.forEach(a);
  }
  return !i && !l ? (He(e) && s.set(e, null), null) : (ne(i) ? i.forEach((a) => o[a] = null) : ht(o, i), He(e) && s.set(e, o), o);
}
function Ks(e, t) {
  return !e || !qs(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), Ae(e, t[0].toLowerCase() + t.slice(1)) || Ae(e, fn(t)) || Ae(e, t));
}
function Xi(e) {
  const {
    type: t,
    vnode: n,
    proxy: s,
    withProxy: r,
    propsOptions: [i],
    slots: o,
    attrs: l,
    emit: a,
    render: f,
    renderCache: c,
    props: b,
    data: v,
    setupState: $,
    ctx: M,
    inheritAttrs: U
  } = e, re = $s(e);
  let ie, be;
  try {
    if (n.shapeFlag & 4) {
      const z = r || s, q = z;
      ie = Mt(
        f.call(
          q,
          z,
          c,
          b,
          $,
          v,
          M
        )
      ), be = l;
    } else {
      const z = t;
      ie = Mt(
        z.length > 1 ? z(
          b,
          { attrs: l, slots: o, emit: a }
        ) : z(
          b,
          null
        )
      ), be = t.props ? l : su(l);
    }
  } catch (z) {
    ts.length = 0, js(z, e, 1), ie = qt(un);
  }
  let we = ie;
  if (be && U !== !1) {
    const z = Object.keys(be), { shapeFlag: q } = we;
    z.length && q & 7 && (i && z.some(Hr) && (be = ru(
      be,
      i
    )), we = Fn(we, be, !1, !0));
  }
  return n.dirs && (we = Fn(we, null, !1, !0), we.dirs = we.dirs ? we.dirs.concat(n.dirs) : n.dirs), n.transition && ti(we, n.transition), ie = we, $s(re), ie;
}
const su = (e) => {
  let t;
  for (const n in e)
    (n === "class" || n === "style" || qs(n)) && ((t || (t = {}))[n] = e[n]);
  return t;
}, ru = (e, t) => {
  const n = {};
  for (const s in e)
    (!Hr(s) || !(s.slice(9) in t)) && (n[s] = e[s]);
  return n;
};
function iu(e, t, n) {
  const { props: s, children: r, component: i } = e, { props: o, children: l, patchFlag: a } = t, f = i.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (n && a >= 0) {
    if (a & 1024)
      return !0;
    if (a & 16)
      return s ? Ji(s, o, f) : !!o;
    if (a & 8) {
      const c = t.dynamicProps;
      for (let b = 0; b < c.length; b++) {
        const v = c[b];
        if (o[v] !== s[v] && !Ks(f, v))
          return !0;
      }
    }
  } else
    return (r || l) && (!l || !l.$stable) ? !0 : s === o ? !1 : s ? o ? Ji(s, o, f) : !0 : !!o;
  return !1;
}
function Ji(e, t, n) {
  const s = Object.keys(t);
  if (s.length !== Object.keys(e).length)
    return !0;
  for (let r = 0; r < s.length; r++) {
    const i = s[r];
    if (t[i] !== e[i] && !Ks(n, i))
      return !0;
  }
  return !1;
}
function ou({ vnode: e, parent: t }, n) {
  for (; t; ) {
    const s = t.subTree;
    if (s.suspense && s.suspense.activeBranch === e && (s.el = e.el), s === e)
      (e = t.vnode).el = n, t = t.parent;
    else
      break;
  }
}
const Al = (e) => e.__isSuspense;
function lu(e, t) {
  t && t.pendingBranch ? ne(e) ? t.effects.push(...e) : t.effects.push(e) : mc(e);
}
const ze = Symbol.for("v-fgt"), Zs = Symbol.for("v-txt"), un = Symbol.for("v-cmt"), xs = Symbol.for("v-stc"), ts = [];
let kt = null;
function E(e = !1) {
  ts.push(kt = e ? null : []);
}
function au() {
  ts.pop(), kt = ts[ts.length - 1] || null;
}
let os = 1;
function Qi(e, t = !1) {
  os += e, e < 0 && kt && t && (kt.hasOnce = !0);
}
function El(e) {
  return e.dynamicChildren = os > 0 ? kt || In : null, au(), os > 0 && kt && kt.push(e), e;
}
function I(e, t, n, s, r, i) {
  return El(
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
function cu(e, t, n, s, r) {
  return El(
    qt(
      e,
      t,
      n,
      s,
      r,
      !0
    )
  );
}
function Rl(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function Un(e, t) {
  return e.type === t.type && e.key === t.key;
}
const Il = ({ key: e }) => e ?? null, Ss = ({
  ref: e,
  ref_key: t,
  ref_for: n
}) => (typeof e == "number" && (e = "" + e), e != null ? Qe(e) || ut(e) || le(e) ? { i: At, r: e, k: t, f: !!n } : e : null);
function y(e, t = null, n = null, s = 0, r = null, i = e === ze ? 0 : 1, o = !1, l = !1) {
  const a = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && Il(t),
    ref: t && Ss(t),
    scopeId: ol,
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
    ctx: At
  };
  return l ? (ii(a, n), i & 128 && e.normalize(a)) : n && (a.shapeFlag |= Qe(n) ? 8 : 16), os > 0 && // avoid a block node from tracking itself
  !o && // has current parent block
  kt && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (a.patchFlag > 0 || i & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  a.patchFlag !== 32 && kt.push(a), a;
}
const qt = uu;
function uu(e, t = null, n = null, s = 0, r = null, i = !1) {
  if ((!e || e === Oc) && (e = un), Rl(e)) {
    const l = Fn(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return n && ii(l, n), os > 0 && !i && kt && (l.shapeFlag & 6 ? kt[kt.indexOf(e)] = l : kt.push(l)), l.patchFlag = -2, l;
  }
  if (wu(e) && (e = e.__vccOpts), t) {
    t = hu(t);
    let { class: l, style: a } = t;
    l && !Qe(l) && (t.class = qe(l)), He(a) && (Qr(a) && !ne(a) && (a = ht({}, a)), t.style = Re(a));
  }
  const o = Qe(e) ? 1 : Al(e) ? 128 : yc(e) ? 64 : He(e) ? 4 : le(e) ? 2 : 0;
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
function hu(e) {
  return e ? Qr(e) || ml(e) ? ht({}, e) : e : null;
}
function Fn(e, t, n = !1, s = !1) {
  const { props: r, ref: i, patchFlag: o, children: l, transition: a } = e, f = t ? fu(r || {}, t) : r, c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: f,
    key: f && Il(f),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && i ? ne(i) ? i.concat(Ss(t)) : [i, Ss(t)] : Ss(t)
    ) : i,
    scopeId: e.scopeId,
    slotScopeIds: e.slotScopeIds,
    children: l,
    target: e.target,
    targetStart: e.targetStart,
    targetAnchor: e.targetAnchor,
    staticCount: e.staticCount,
    shapeFlag: e.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: t && e.type !== ze ? o === -1 ? 16 : o | 16 : o,
    dynamicProps: e.dynamicProps,
    dynamicChildren: e.dynamicChildren,
    appContext: e.appContext,
    dirs: e.dirs,
    transition: a,
    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: e.component,
    suspense: e.suspense,
    ssContent: e.ssContent && Fn(e.ssContent),
    ssFallback: e.ssFallback && Fn(e.ssFallback),
    placeholder: e.placeholder,
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce
  };
  return a && s && ti(
    c,
    a.clone(c)
  ), c;
}
function bt(e = " ", t = 0) {
  return qt(Zs, null, e, t);
}
function fr(e, t) {
  const n = qt(xs, null, e);
  return n.staticCount = t, n;
}
function oe(e = "", t = !1) {
  return t ? (E(), cu(un, null, e)) : qt(un, null, e);
}
function Mt(e) {
  return e == null || typeof e == "boolean" ? qt(un) : ne(e) ? qt(
    ze,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : Rl(e) ? sn(e) : qt(Zs, null, String(e));
}
function sn(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : Fn(e);
}
function ii(e, t) {
  let n = 0;
  const { shapeFlag: s } = e;
  if (t == null)
    t = null;
  else if (ne(t))
    n = 16;
  else if (typeof t == "object")
    if (s & 65) {
      const r = t.default;
      r && (r._c && (r._d = !1), ii(e, r()), r._c && (r._d = !0));
      return;
    } else {
      n = 32;
      const r = t._;
      !r && !ml(t) ? t._ctx = At : r === 3 && At && (At.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else le(t) ? (t = { default: t, _ctx: At }, n = 32) : (t = String(t), s & 64 ? (n = 16, t = [bt(t)]) : n = 8);
  e.children = t, e.shapeFlag |= n;
}
function fu(...e) {
  const t = {};
  for (let n = 0; n < e.length; n++) {
    const s = e[n];
    for (const r in s)
      if (r === "class")
        t.class !== s.class && (t.class = qe([t.class, s.class]));
      else if (r === "style")
        t.style = Re([t.style, s.style]);
      else if (qs(r)) {
        const i = t[r], o = s[r];
        o && i !== o && !(ne(i) && i.includes(o)) && (t[r] = i ? [].concat(i, o) : o);
      } else r !== "" && (t[r] = s[r]);
  }
  return t;
}
function Ft(e, t, n, s = null) {
  zt(e, t, 7, [
    n,
    s
  ]);
}
const du = dl();
let pu = 0;
function gu(e, t, n) {
  const s = e.type, r = (t ? t.appContext : e.appContext) || du, i = {
    uid: pu++,
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
    scope: new Da(
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
    propsOptions: vl(s, r),
    emitsOptions: Tl(s, r),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: $e,
    // inheritAttrs
    inheritAttrs: s.inheritAttrs,
    // state
    ctx: $e,
    data: $e,
    props: $e,
    attrs: $e,
    slots: $e,
    refs: $e,
    setupState: $e,
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
  return i.ctx = { _: i }, i.root = t ? t.root : i, i.emit = nu.bind(null, i), e.ce && e.ce(i), i;
}
let mt = null;
const mu = () => mt || At;
let Bs, Lr;
{
  const e = Hs(), t = (n, s) => {
    let r;
    return (r = e[n]) || (r = e[n] = []), r.push(s), (i) => {
      r.length > 1 ? r.forEach((o) => o(i)) : r[0](i);
    };
  };
  Bs = t(
    "__VUE_INSTANCE_SETTERS__",
    (n) => mt = n
  ), Lr = t(
    "__VUE_SSR_SETTERS__",
    (n) => ls = n
  );
}
const cs = (e) => {
  const t = mt;
  return Bs(e), e.scope.on(), () => {
    e.scope.off(), Bs(t);
  };
}, eo = () => {
  mt && mt.scope.off(), Bs(null);
};
function Ll(e) {
  return e.vnode.shapeFlag & 4;
}
let ls = !1;
function _u(e, t = !1, n = !1) {
  t && Lr(t);
  const { props: s, children: r } = e.vnode, i = Ll(e);
  zc(e, s, i, t), Vc(e, r, n || t);
  const o = i ? vu(e, t) : void 0;
  return t && Lr(!1), o;
}
function vu(e, t) {
  const n = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Pc);
  const { setup: s } = n;
  if (s) {
    Jt();
    const r = e.setupContext = s.length > 1 ? bu(e) : null, i = cs(e), o = as(
      s,
      e,
      0,
      [
        e.props,
        r
      ]
    ), l = Oo(o);
    if (Qt(), i(), (l || e.sp) && !Qn(e) && ll(e), l) {
      if (o.then(eo, eo), t)
        return o.then((a) => {
          to(e, a);
        }).catch((a) => {
          js(a, e, 0);
        });
      e.asyncDep = o;
    } else
      to(e, o);
  } else
    Ol(e);
}
function to(e, t, n) {
  le(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : He(t) && (e.setupState = el(t)), Ol(e);
}
function Ol(e, t, n) {
  const s = e.type;
  e.render || (e.render = s.render || Dt);
  {
    const r = cs(e);
    Jt();
    try {
      $c(e);
    } finally {
      Qt(), r();
    }
  }
}
const yu = {
  get(e, t) {
    return ct(e, "get", ""), e[t];
  }
};
function bu(e) {
  const t = (n) => {
    e.exposed = n || {};
  };
  return {
    attrs: new Proxy(e.attrs, yu),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function Gs(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(el(oc(e.exposed)), {
    get(t, n) {
      if (n in t)
        return t[n];
      if (n in es)
        return es[n](e);
    },
    has(t, n) {
      return n in t || n in es;
    }
  })) : e.proxy;
}
function wu(e) {
  return le(e) && "__vccOpts" in e;
}
const Ke = (e, t) => hc(e, t, ls), ku = "3.5.18";
/**
* @vue/runtime-dom v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let Or;
const no = typeof window < "u" && window.trustedTypes;
if (no)
  try {
    Or = /* @__PURE__ */ no.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const Pl = Or ? (e) => Or.createHTML(e) : (e) => e, xu = "http://www.w3.org/2000/svg", Su = "http://www.w3.org/1998/Math/MathML", Kt = typeof document < "u" ? document : null, so = Kt && /* @__PURE__ */ Kt.createElement("template"), Cu = {
  insert: (e, t, n) => {
    t.insertBefore(e, n || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, n, s) => {
    const r = t === "svg" ? Kt.createElementNS(xu, e) : t === "mathml" ? Kt.createElementNS(Su, e) : n ? Kt.createElement(e, { is: n }) : Kt.createElement(e);
    return e === "select" && s && s.multiple != null && r.setAttribute("multiple", s.multiple), r;
  },
  createText: (e) => Kt.createTextNode(e),
  createComment: (e) => Kt.createComment(e),
  setText: (e, t) => {
    e.nodeValue = t;
  },
  setElementText: (e, t) => {
    e.textContent = t;
  },
  parentNode: (e) => e.parentNode,
  nextSibling: (e) => e.nextSibling,
  querySelector: (e) => Kt.querySelector(e),
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
      so.innerHTML = Pl(
        s === "svg" ? `<svg>${e}</svg>` : s === "mathml" ? `<math>${e}</math>` : e
      );
      const l = so.content;
      if (s === "svg" || s === "mathml") {
        const a = l.firstChild;
        for (; a.firstChild; )
          l.appendChild(a.firstChild);
        l.removeChild(a);
      }
      t.insertBefore(l, n);
    }
    return [
      // first
      o ? o.nextSibling : t.firstChild,
      // last
      n ? n.previousSibling : t.lastChild
    ];
  }
}, Tu = Symbol("_vtc");
function Au(e, t, n) {
  const s = e[Tu];
  s && (t = (t ? [t, ...s] : [...s]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
const ro = Symbol("_vod"), Eu = Symbol("_vsh"), Ru = Symbol(""), Iu = /(^|;)\s*display\s*:/;
function Lu(e, t, n) {
  const s = e.style, r = Qe(n);
  let i = !1;
  if (n && !r) {
    if (t)
      if (Qe(t))
        for (const o of t.split(";")) {
          const l = o.slice(0, o.indexOf(":")).trim();
          n[l] == null && Cs(s, l, "");
        }
      else
        for (const o in t)
          n[o] == null && Cs(s, o, "");
    for (const o in n)
      o === "display" && (i = !0), Cs(s, o, n[o]);
  } else if (r) {
    if (t !== n) {
      const o = s[Ru];
      o && (n += ";" + o), s.cssText = n, i = Iu.test(n);
    }
  } else t && e.removeAttribute("style");
  ro in e && (e[ro] = i ? s.display : "", e[Eu] && (s.display = "none"));
}
const io = /\s*!important$/;
function Cs(e, t, n) {
  if (ne(n))
    n.forEach((s) => Cs(e, t, s));
  else if (n == null && (n = ""), t.startsWith("--"))
    e.setProperty(t, n);
  else {
    const s = Ou(e, t);
    io.test(n) ? e.setProperty(
      fn(s),
      n.replace(io, ""),
      "important"
    ) : e[s] = n;
  }
}
const oo = ["Webkit", "Moz", "ms"], dr = {};
function Ou(e, t) {
  const n = dr[t];
  if (n)
    return n;
  let s = an(t);
  if (s !== "filter" && s in e)
    return dr[t] = s;
  s = Fo(s);
  for (let r = 0; r < oo.length; r++) {
    const i = oo[r] + s;
    if (i in e)
      return dr[t] = i;
  }
  return t;
}
const lo = "http://www.w3.org/1999/xlink";
function ao(e, t, n, s, r, i = Ma(t)) {
  s && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(lo, t.slice(6, t.length)) : e.setAttributeNS(lo, t, n) : n == null || i && !Bo(n) ? e.removeAttribute(t) : e.setAttribute(
    t,
    i ? "" : hn(n) ? String(n) : n
  );
}
function co(e, t, n, s, r) {
  if (t === "innerHTML" || t === "textContent") {
    n != null && (e[t] = t === "innerHTML" ? Pl(n) : n);
    return;
  }
  const i = e.tagName;
  if (t === "value" && i !== "PROGRESS" && // custom elements may use _value internally
  !i.includes("-")) {
    const l = i === "OPTION" ? e.getAttribute("value") || "" : e.value, a = n == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      e.type === "checkbox" ? "on" : ""
    ) : String(n);
    (l !== a || !("_value" in e)) && (e.value = a), n == null && e.removeAttribute(t), e._value = n;
    return;
  }
  let o = !1;
  if (n === "" || n == null) {
    const l = typeof e[t];
    l === "boolean" ? n = Bo(n) : n == null && l === "string" ? (n = "", o = !0) : l === "number" && (n = 0, o = !0);
  }
  try {
    e[t] = n;
  } catch {
  }
  o && e.removeAttribute(r || t);
}
function Rn(e, t, n, s) {
  e.addEventListener(t, n, s);
}
function Pu(e, t, n, s) {
  e.removeEventListener(t, n, s);
}
const uo = Symbol("_vei");
function $u(e, t, n, s, r = null) {
  const i = e[uo] || (e[uo] = {}), o = i[t];
  if (s && o)
    o.value = s;
  else {
    const [l, a] = Fu(t);
    if (s) {
      const f = i[t] = Mu(
        s,
        r
      );
      Rn(e, l, f, a);
    } else o && (Pu(e, l, o, a), i[t] = void 0);
  }
}
const ho = /(?:Once|Passive|Capture)$/;
function Fu(e) {
  let t;
  if (ho.test(e)) {
    t = {};
    let s;
    for (; s = e.match(ho); )
      e = e.slice(0, e.length - s[0].length), t[s[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : fn(e.slice(2)), t];
}
let pr = 0;
const Bu = /* @__PURE__ */ Promise.resolve(), Nu = () => pr || (Bu.then(() => pr = 0), pr = Date.now());
function Mu(e, t) {
  const n = (s) => {
    if (!s._vts)
      s._vts = Date.now();
    else if (s._vts <= n.attached)
      return;
    zt(
      Du(s, n.value),
      t,
      5,
      [s]
    );
  };
  return n.value = e, n.attached = Nu(), n;
}
function Du(e, t) {
  if (ne(t)) {
    const n = e.stopImmediatePropagation;
    return e.stopImmediatePropagation = () => {
      n.call(e), e._stopped = !0;
    }, t.map(
      (s) => (r) => !r._stopped && s && s(r)
    );
  } else
    return t;
}
const fo = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, qu = (e, t, n, s, r, i) => {
  const o = r === "svg";
  t === "class" ? Au(e, s, o) : t === "style" ? Lu(e, n, s) : qs(t) ? Hr(t) || $u(e, t, n, s, i) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : Uu(e, t, s, o)) ? (co(e, t, s), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && ao(e, t, s, o, i, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !Qe(s)) ? co(e, an(t), s, i, t) : (t === "true-value" ? e._trueValue = s : t === "false-value" && (e._falseValue = s), ao(e, t, s, o));
};
function Uu(e, t, n, s) {
  if (s)
    return !!(t === "innerHTML" || t === "textContent" || t in e && fo(t) && le(n));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const r = e.tagName;
    if (r === "IMG" || r === "VIDEO" || r === "CANVAS" || r === "SOURCE")
      return !1;
  }
  return fo(t) && Qe(n) ? !1 : t in e;
}
const po = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return ne(t) ? (n) => ws(t, n) : t;
};
function zu(e) {
  e.target.composing = !0;
}
function go(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const gr = Symbol("_assign"), mn = {
  created(e, { modifiers: { lazy: t, trim: n, number: s } }, r) {
    e[gr] = po(r);
    const i = s || r.props && r.props.type === "number";
    Rn(e, t ? "change" : "input", (o) => {
      if (o.target.composing) return;
      let l = e.value;
      n && (l = l.trim()), i && (l = kr(l)), e[gr](l);
    }), n && Rn(e, "change", () => {
      e.value = e.value.trim();
    }), t || (Rn(e, "compositionstart", zu), Rn(e, "compositionend", go), Rn(e, "change", go));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t }) {
    e.value = t ?? "";
  },
  beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: s, trim: r, number: i } }, o) {
    if (e[gr] = po(o), e.composing) return;
    const l = (i || e.type === "number") && !/^0\d/.test(e.value) ? kr(e.value) : e.value, a = t ?? "";
    l !== a && (document.activeElement === e && e.type !== "range" && (s && t === n || r && e.value.trim() === a) || (e.value = a));
  }
}, Hu = ["ctrl", "shift", "alt", "meta"], Wu = {
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
  exact: (e, t) => Hu.some((n) => e[`${n}Key`] && !t.includes(n))
}, An = (e, t) => {
  const n = e._withMods || (e._withMods = {}), s = t.join(".");
  return n[s] || (n[s] = (r, ...i) => {
    for (let o = 0; o < t.length; o++) {
      const l = Wu[t[o]];
      if (l && l(r, t)) return;
    }
    return e(r, ...i);
  });
}, ju = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, mo = (e, t) => {
  const n = e._withKeys || (e._withKeys = {}), s = t.join(".");
  return n[s] || (n[s] = (r) => {
    if (!("key" in r))
      return;
    const i = fn(r.key);
    if (t.some(
      (o) => o === i || ju[o] === i
    ))
      return e(r);
  });
}, Vu = /* @__PURE__ */ ht({ patchProp: qu }, Cu);
let _o;
function Ku() {
  return _o || (_o = Zc(Vu));
}
const Zu = (...e) => {
  const t = Ku().createApp(...e), { mount: n } = t;
  return t.mount = (s) => {
    const r = Yu(s);
    if (!r) return;
    const i = t._component;
    !le(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
    const o = n(r, !1, Gu(r));
    return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), o;
  }, t;
};
function Gu(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function Yu(e) {
  return Qe(e) ? document.querySelector(e) : e;
}
const tn = (e) => {
  const t = e.replace("#", ""), n = parseInt(t.substr(0, 2), 16), s = parseInt(t.substr(2, 2), 16), r = parseInt(t.substr(4, 2), 16);
  return (n * 299 + s * 587 + r * 114) / 1e3 < 128;
}, Xu = (e, t) => {
  const n = e.replace("#", ""), s = parseInt(n.substr(0, 2), 16), r = parseInt(n.substr(2, 2), 16), i = parseInt(n.substr(4, 2), 16), o = tn(e), l = o ? Math.min(255, s + t) : Math.max(0, s - t), a = o ? Math.min(255, r + t) : Math.max(0, r - t), f = o ? Math.min(255, i + t) : Math.max(0, i - t);
  return `#${l.toString(16).padStart(2, "0")}${a.toString(16).padStart(2, "0")}${f.toString(16).padStart(2, "0")}`;
}, zn = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e), Ju = (e) => {
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
function oi() {
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
var wn = oi();
function $l(e) {
  wn = e;
}
var ns = { exec: () => null };
function Ee(e, t = "") {
  let n = typeof e == "string" ? e : e.source;
  const s = {
    replace: (r, i) => {
      let o = typeof i == "string" ? i : i.source;
      return o = o.replace(_t.caret, "$1"), n = n.replace(r, o), s;
    },
    getRegex: () => new RegExp(n, t)
  };
  return s;
}
var _t = {
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
}, Qu = /^(?:[ \t]*(?:\n|$))+/, eh = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/, th = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, us = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, nh = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, li = /(?:[*+-]|\d{1,9}[.)])/, Fl = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/, Bl = Ee(Fl).replace(/bull/g, li).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(), sh = Ee(Fl).replace(/bull/g, li).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(), ai = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/, rh = /^[^\n]+/, ci = /(?!\s*\])(?:\\.|[^\[\]\\])+/, ih = Ee(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", ci).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), oh = Ee(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, li).getRegex(), Ys = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", ui = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, lh = Ee(
  "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))",
  "i"
).replace("comment", ui).replace("tag", Ys).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), Nl = Ee(ai).replace("hr", us).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Ys).getRegex(), ah = Ee(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", Nl).getRegex(), hi = {
  blockquote: ah,
  code: eh,
  def: ih,
  fences: th,
  heading: nh,
  hr: us,
  html: lh,
  lheading: Bl,
  list: oh,
  newline: Qu,
  paragraph: Nl,
  table: ns,
  text: rh
}, vo = Ee(
  "^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"
).replace("hr", us).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Ys).getRegex(), ch = {
  ...hi,
  lheading: sh,
  table: vo,
  paragraph: Ee(ai).replace("hr", us).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", vo).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Ys).getRegex()
}, uh = {
  ...hi,
  html: Ee(
    `^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`
  ).replace("comment", ui).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
  heading: /^(#{1,6})(.*)(?:\n+|$)/,
  fences: ns,
  // fences not supported
  lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  paragraph: Ee(ai).replace("hr", us).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", Bl).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
}, hh = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, fh = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, Ml = /^( {2,}|\\)\n(?!\s*$)/, dh = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, Xs = /[\p{P}\p{S}]/u, fi = /[\s\p{P}\p{S}]/u, Dl = /[^\s\p{P}\p{S}]/u, ph = Ee(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, fi).getRegex(), ql = /(?!~)[\p{P}\p{S}]/u, gh = /(?!~)[\s\p{P}\p{S}]/u, mh = /(?:[^\s\p{P}\p{S}]|~)/u, _h = /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g, Ul = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/, vh = Ee(Ul, "u").replace(/punct/g, Xs).getRegex(), yh = Ee(Ul, "u").replace(/punct/g, ql).getRegex(), zl = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", bh = Ee(zl, "gu").replace(/notPunctSpace/g, Dl).replace(/punctSpace/g, fi).replace(/punct/g, Xs).getRegex(), wh = Ee(zl, "gu").replace(/notPunctSpace/g, mh).replace(/punctSpace/g, gh).replace(/punct/g, ql).getRegex(), kh = Ee(
  "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)",
  "gu"
).replace(/notPunctSpace/g, Dl).replace(/punctSpace/g, fi).replace(/punct/g, Xs).getRegex(), xh = Ee(/\\(punct)/, "gu").replace(/punct/g, Xs).getRegex(), Sh = Ee(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), Ch = Ee(ui).replace("(?:-->|$)", "-->").getRegex(), Th = Ee(
  "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>"
).replace("comment", Ch).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), Ns = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/, Ah = Ee(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", Ns).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), Hl = Ee(/^!?\[(label)\]\[(ref)\]/).replace("label", Ns).replace("ref", ci).getRegex(), Wl = Ee(/^!?\[(ref)\](?:\[\])?/).replace("ref", ci).getRegex(), Eh = Ee("reflink|nolink(?!\\()", "g").replace("reflink", Hl).replace("nolink", Wl).getRegex(), di = {
  _backpedal: ns,
  // only used for GFM url
  anyPunctuation: xh,
  autolink: Sh,
  blockSkip: _h,
  br: Ml,
  code: fh,
  del: ns,
  emStrongLDelim: vh,
  emStrongRDelimAst: bh,
  emStrongRDelimUnd: kh,
  escape: hh,
  link: Ah,
  nolink: Wl,
  punctuation: ph,
  reflink: Hl,
  reflinkSearch: Eh,
  tag: Th,
  text: dh,
  url: ns
}, Rh = {
  ...di,
  link: Ee(/^!?\[(label)\]\((.*?)\)/).replace("label", Ns).getRegex(),
  reflink: Ee(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", Ns).getRegex()
}, Pr = {
  ...di,
  emStrongRDelimAst: wh,
  emStrongLDelim: yh,
  url: Ee(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, "i").replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
  _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
}, Ih = {
  ...Pr,
  br: Ee(Ml).replace("{2,}", "*").getRegex(),
  text: Ee(Pr.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
}, vs = {
  normal: hi,
  gfm: ch,
  pedantic: uh
}, Hn = {
  normal: di,
  gfm: Pr,
  breaks: Ih,
  pedantic: Rh
}, Lh = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}, yo = (e) => Lh[e];
function Bt(e, t) {
  if (t) {
    if (_t.escapeTest.test(e))
      return e.replace(_t.escapeReplace, yo);
  } else if (_t.escapeTestNoEncode.test(e))
    return e.replace(_t.escapeReplaceNoEncode, yo);
  return e;
}
function bo(e) {
  try {
    e = encodeURI(e).replace(_t.percentDecode, "%");
  } catch {
    return null;
  }
  return e;
}
function wo(e, t) {
  var i;
  const n = e.replace(_t.findPipe, (o, l, a) => {
    let f = !1, c = l;
    for (; --c >= 0 && a[c] === "\\"; ) f = !f;
    return f ? "|" : " |";
  }), s = n.split(_t.splitPipe);
  let r = 0;
  if (s[0].trim() || s.shift(), s.length > 0 && !((i = s.at(-1)) != null && i.trim()) && s.pop(), t)
    if (s.length > t)
      s.splice(t);
    else
      for (; s.length < t; ) s.push("");
  for (; r < s.length; r++)
    s[r] = s[r].trim().replace(_t.slashPipe, "|");
  return s;
}
function Wn(e, t, n) {
  const s = e.length;
  if (s === 0)
    return "";
  let r = 0;
  for (; r < s && e.charAt(s - r - 1) === t; )
    r++;
  return e.slice(0, s - r);
}
function Oh(e, t) {
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
function ko(e, t, n, s, r) {
  const i = t.href, o = t.title || null, l = e[1].replace(r.other.outputLinkReplace, "$1");
  s.state.inLink = !0;
  const a = {
    type: e[0].charAt(0) === "!" ? "image" : "link",
    raw: n,
    href: i,
    title: o,
    text: l,
    tokens: s.inlineTokens(l)
  };
  return s.state.inLink = !1, a;
}
function Ph(e, t, n) {
  const s = e.match(n.other.indentCodeCompensation);
  if (s === null)
    return t;
  const r = s[1];
  return t.split(`
`).map((i) => {
    const o = i.match(n.other.beginningSpace);
    if (o === null)
      return i;
    const [l] = o;
    return l.length >= r.length ? i.slice(r.length) : i;
  }).join(`
`);
}
var Ms = class {
  // set by the lexer
  constructor(e) {
    Pe(this, "options");
    Pe(this, "rules");
    // set by the lexer
    Pe(this, "lexer");
    this.options = e || wn;
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
        text: this.options.pedantic ? n : Wn(n, `
`)
      };
    }
  }
  fences(e) {
    const t = this.rules.block.fences.exec(e);
    if (t) {
      const n = t[0], s = Ph(n, t[3] || "", this.rules);
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
        const s = Wn(n, "#");
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
        raw: Wn(t[0], `
`)
      };
  }
  blockquote(e) {
    const t = this.rules.block.blockquote.exec(e);
    if (t) {
      let n = Wn(t[0], `
`).split(`
`), s = "", r = "";
      const i = [];
      for (; n.length > 0; ) {
        let o = !1;
        const l = [];
        let a;
        for (a = 0; a < n.length; a++)
          if (this.rules.other.blockquoteStart.test(n[a]))
            l.push(n[a]), o = !0;
          else if (!o)
            l.push(n[a]);
          else
            break;
        n = n.slice(a);
        const f = l.join(`
`), c = f.replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
        s = s ? `${s}
${f}` : f, r = r ? `${r}
${c}` : c;
        const b = this.lexer.state.top;
        if (this.lexer.state.top = !0, this.lexer.blockTokens(c, i, !0), this.lexer.state.top = b, n.length === 0)
          break;
        const v = i.at(-1);
        if ((v == null ? void 0 : v.type) === "code")
          break;
        if ((v == null ? void 0 : v.type) === "blockquote") {
          const $ = v, M = $.raw + `
` + n.join(`
`), U = this.blockquote(M);
          i[i.length - 1] = U, s = s.substring(0, s.length - $.raw.length) + U.raw, r = r.substring(0, r.length - $.text.length) + U.text;
          break;
        } else if ((v == null ? void 0 : v.type) === "list") {
          const $ = v, M = $.raw + `
` + n.join(`
`), U = this.list(M);
          i[i.length - 1] = U, s = s.substring(0, s.length - v.raw.length) + U.raw, r = r.substring(0, r.length - $.raw.length) + U.raw, n = M.substring(i.at(-1).raw.length).split(`
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
        let a = !1, f = "", c = "";
        if (!(t = i.exec(e)) || this.rules.block.hr.test(e))
          break;
        f = t[0], e = e.substring(f.length);
        let b = t[2].split(`
`, 1)[0].replace(this.rules.other.listReplaceTabs, (ie) => " ".repeat(3 * ie.length)), v = e.split(`
`, 1)[0], $ = !b.trim(), M = 0;
        if (this.options.pedantic ? (M = 2, c = b.trimStart()) : $ ? M = t[1].length + 1 : (M = t[2].search(this.rules.other.nonSpaceChar), M = M > 4 ? 1 : M, c = b.slice(M), M += t[1].length), $ && this.rules.other.blankLine.test(v) && (f += v + `
`, e = e.substring(v.length + 1), a = !0), !a) {
          const ie = this.rules.other.nextBulletRegex(M), be = this.rules.other.hrRegex(M), we = this.rules.other.fencesBeginRegex(M), z = this.rules.other.headingBeginRegex(M), q = this.rules.other.htmlBeginRegex(M);
          for (; e; ) {
            const H = e.split(`
`, 1)[0];
            let K;
            if (v = H, this.options.pedantic ? (v = v.replace(this.rules.other.listReplaceNesting, "  "), K = v) : K = v.replace(this.rules.other.tabCharGlobal, "    "), we.test(v) || z.test(v) || q.test(v) || ie.test(v) || be.test(v))
              break;
            if (K.search(this.rules.other.nonSpaceChar) >= M || !v.trim())
              c += `
` + K.slice(M);
            else {
              if ($ || b.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || we.test(b) || z.test(b) || be.test(b))
                break;
              c += `
` + v;
            }
            !$ && !v.trim() && ($ = !0), f += H + `
`, e = e.substring(H.length + 1), b = K.slice(M);
          }
        }
        r.loose || (o ? r.loose = !0 : this.rules.other.doubleBlankLine.test(f) && (o = !0));
        let U = null, re;
        this.options.gfm && (U = this.rules.other.listIsTask.exec(c), U && (re = U[0] !== "[ ] ", c = c.replace(this.rules.other.listReplaceTask, ""))), r.items.push({
          type: "list_item",
          raw: f,
          task: !!U,
          checked: re,
          loose: !1,
          text: c,
          tokens: []
        }), r.raw += f;
      }
      const l = r.items.at(-1);
      if (l)
        l.raw = l.raw.trimEnd(), l.text = l.text.trimEnd();
      else
        return;
      r.raw = r.raw.trimEnd();
      for (let a = 0; a < r.items.length; a++)
        if (this.lexer.state.top = !1, r.items[a].tokens = this.lexer.blockTokens(r.items[a].text, []), !r.loose) {
          const f = r.items[a].tokens.filter((b) => b.type === "space"), c = f.length > 0 && f.some((b) => this.rules.other.anyLine.test(b.raw));
          r.loose = c;
        }
      if (r.loose)
        for (let a = 0; a < r.items.length; a++)
          r.items[a].loose = !0;
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
    const n = wo(t[1]), s = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), r = (o = t[3]) != null && o.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
`) : [], i = {
      type: "table",
      raw: t[0],
      header: [],
      align: [],
      rows: []
    };
    if (n.length === s.length) {
      for (const l of s)
        this.rules.other.tableAlignRight.test(l) ? i.align.push("right") : this.rules.other.tableAlignCenter.test(l) ? i.align.push("center") : this.rules.other.tableAlignLeft.test(l) ? i.align.push("left") : i.align.push(null);
      for (let l = 0; l < n.length; l++)
        i.header.push({
          text: n[l],
          tokens: this.lexer.inline(n[l]),
          header: !0,
          align: i.align[l]
        });
      for (const l of r)
        i.rows.push(wo(l, i.header.length).map((a, f) => ({
          text: a,
          tokens: this.lexer.inline(a),
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
        const i = Wn(n.slice(0, -1), "\\");
        if ((n.length - i.length) % 2 === 0)
          return;
      } else {
        const i = Oh(t[2], "()");
        if (i === -2)
          return;
        if (i > -1) {
          const l = (t[0].indexOf("!") === 0 ? 5 : 4) + t[1].length + i;
          t[2] = t[2].substring(0, i), t[0] = t[0].substring(0, l).trim(), t[3] = "";
        }
      }
      let s = t[2], r = "";
      if (this.options.pedantic) {
        const i = this.rules.other.pedanticHrefTitle.exec(s);
        i && (s = i[1], r = i[3]);
      } else
        r = t[3] ? t[3].slice(1, -1) : "";
      return s = s.trim(), this.rules.other.startAngleBracket.test(s) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n) ? s = s.slice(1) : s = s.slice(1, -1)), ko(t, {
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
      return ko(n, r, n[0], this.lexer, this.rules);
    }
  }
  emStrong(e, t, n = "") {
    let s = this.rules.inline.emStrongLDelim.exec(e);
    if (!s || s[3] && n.match(this.rules.other.unicodeAlphaNumeric)) return;
    if (!(s[1] || s[2] || "") || !n || this.rules.inline.punctuation.exec(n)) {
      const i = [...s[0]].length - 1;
      let o, l, a = i, f = 0;
      const c = s[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      for (c.lastIndex = 0, t = t.slice(-1 * e.length + i); (s = c.exec(t)) != null; ) {
        if (o = s[1] || s[2] || s[3] || s[4] || s[5] || s[6], !o) continue;
        if (l = [...o].length, s[3] || s[4]) {
          a += l;
          continue;
        } else if ((s[5] || s[6]) && i % 3 && !((i + l) % 3)) {
          f += l;
          continue;
        }
        if (a -= l, a > 0) continue;
        l = Math.min(l, l + a + f);
        const b = [...s[0]][0].length, v = e.slice(0, i + s.index + b + l);
        if (Math.min(i, l) % 2) {
          const M = v.slice(1, -1);
          return {
            type: "em",
            raw: v,
            text: M,
            tokens: this.lexer.inlineTokens(M)
          };
        }
        const $ = v.slice(2, -2);
        return {
          type: "strong",
          raw: v,
          text: $,
          tokens: this.lexer.inlineTokens($)
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
}, Yt = class $r {
  constructor(t) {
    Pe(this, "tokens");
    Pe(this, "options");
    Pe(this, "state");
    Pe(this, "tokenizer");
    Pe(this, "inlineQueue");
    this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = t || wn, this.options.tokenizer = this.options.tokenizer || new Ms(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = {
      inLink: !1,
      inRawBlock: !1,
      top: !0
    };
    const n = {
      other: _t,
      block: vs.normal,
      inline: Hn.normal
    };
    this.options.pedantic ? (n.block = vs.pedantic, n.inline = Hn.pedantic) : this.options.gfm && (n.block = vs.gfm, this.options.breaks ? n.inline = Hn.breaks : n.inline = Hn.gfm), this.tokenizer.rules = n;
  }
  /**
   * Expose Rules
   */
  static get rules() {
    return {
      block: vs,
      inline: Hn
    };
  }
  /**
   * Static Lex Method
   */
  static lex(t, n) {
    return new $r(n).lex(t);
  }
  /**
   * Static Lex Inline Method
   */
  static lexInline(t, n) {
    return new $r(n).inlineTokens(t);
  }
  /**
   * Preprocessing
   */
  lex(t) {
    t = t.replace(_t.carriageReturn, `
`), this.blockTokens(t, this.tokens);
    for (let n = 0; n < this.inlineQueue.length; n++) {
      const s = this.inlineQueue[n];
      this.inlineTokens(s.src, s.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(t, n = [], s = !1) {
    var r, i, o;
    for (this.options.pedantic && (t = t.replace(_t.tabCharGlobal, "    ").replace(_t.spaceLine, "")); t; ) {
      let l;
      if ((i = (r = this.options.extensions) == null ? void 0 : r.block) != null && i.some((f) => (l = f.call({ lexer: this }, t, n)) ? (t = t.substring(l.raw.length), n.push(l), !0) : !1))
        continue;
      if (l = this.tokenizer.space(t)) {
        t = t.substring(l.raw.length);
        const f = n.at(-1);
        l.raw.length === 1 && f !== void 0 ? f.raw += `
` : n.push(l);
        continue;
      }
      if (l = this.tokenizer.code(t)) {
        t = t.substring(l.raw.length);
        const f = n.at(-1);
        (f == null ? void 0 : f.type) === "paragraph" || (f == null ? void 0 : f.type) === "text" ? (f.raw += `
` + l.raw, f.text += `
` + l.text, this.inlineQueue.at(-1).src = f.text) : n.push(l);
        continue;
      }
      if (l = this.tokenizer.fences(t)) {
        t = t.substring(l.raw.length), n.push(l);
        continue;
      }
      if (l = this.tokenizer.heading(t)) {
        t = t.substring(l.raw.length), n.push(l);
        continue;
      }
      if (l = this.tokenizer.hr(t)) {
        t = t.substring(l.raw.length), n.push(l);
        continue;
      }
      if (l = this.tokenizer.blockquote(t)) {
        t = t.substring(l.raw.length), n.push(l);
        continue;
      }
      if (l = this.tokenizer.list(t)) {
        t = t.substring(l.raw.length), n.push(l);
        continue;
      }
      if (l = this.tokenizer.html(t)) {
        t = t.substring(l.raw.length), n.push(l);
        continue;
      }
      if (l = this.tokenizer.def(t)) {
        t = t.substring(l.raw.length);
        const f = n.at(-1);
        (f == null ? void 0 : f.type) === "paragraph" || (f == null ? void 0 : f.type) === "text" ? (f.raw += `
` + l.raw, f.text += `
` + l.raw, this.inlineQueue.at(-1).src = f.text) : this.tokens.links[l.tag] || (this.tokens.links[l.tag] = {
          href: l.href,
          title: l.title
        });
        continue;
      }
      if (l = this.tokenizer.table(t)) {
        t = t.substring(l.raw.length), n.push(l);
        continue;
      }
      if (l = this.tokenizer.lheading(t)) {
        t = t.substring(l.raw.length), n.push(l);
        continue;
      }
      let a = t;
      if ((o = this.options.extensions) != null && o.startBlock) {
        let f = 1 / 0;
        const c = t.slice(1);
        let b;
        this.options.extensions.startBlock.forEach((v) => {
          b = v.call({ lexer: this }, c), typeof b == "number" && b >= 0 && (f = Math.min(f, b));
        }), f < 1 / 0 && f >= 0 && (a = t.substring(0, f + 1));
      }
      if (this.state.top && (l = this.tokenizer.paragraph(a))) {
        const f = n.at(-1);
        s && (f == null ? void 0 : f.type) === "paragraph" ? (f.raw += `
` + l.raw, f.text += `
` + l.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = f.text) : n.push(l), s = a.length !== t.length, t = t.substring(l.raw.length);
        continue;
      }
      if (l = this.tokenizer.text(t)) {
        t = t.substring(l.raw.length);
        const f = n.at(-1);
        (f == null ? void 0 : f.type) === "text" ? (f.raw += `
` + l.raw, f.text += `
` + l.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = f.text) : n.push(l);
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
    var l, a, f;
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
      if ((a = (l = this.options.extensions) == null ? void 0 : l.inline) != null && a.some((v) => (c = v.call({ lexer: this }, t, n)) ? (t = t.substring(c.raw.length), n.push(c), !0) : !1))
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
        const v = n.at(-1);
        c.type === "text" && (v == null ? void 0 : v.type) === "text" ? (v.raw += c.raw, v.text += c.text) : n.push(c);
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
      if ((f = this.options.extensions) != null && f.startInline) {
        let v = 1 / 0;
        const $ = t.slice(1);
        let M;
        this.options.extensions.startInline.forEach((U) => {
          M = U.call({ lexer: this }, $), typeof M == "number" && M >= 0 && (v = Math.min(v, M));
        }), v < 1 / 0 && v >= 0 && (b = t.substring(0, v + 1));
      }
      if (c = this.tokenizer.inlineText(b)) {
        t = t.substring(c.raw.length), c.raw.slice(-1) !== "_" && (o = c.raw.slice(-1)), i = !0;
        const v = n.at(-1);
        (v == null ? void 0 : v.type) === "text" ? (v.raw += c.raw, v.text += c.text) : n.push(c);
        continue;
      }
      if (t) {
        const v = "Infinite loop on byte: " + t.charCodeAt(0);
        if (this.options.silent) {
          console.error(v);
          break;
        } else
          throw new Error(v);
      }
    }
    return n;
  }
}, Ds = class {
  // set by the parser
  constructor(e) {
    Pe(this, "options");
    Pe(this, "parser");
    this.options = e || wn;
  }
  space(e) {
    return "";
  }
  code({ text: e, lang: t, escaped: n }) {
    var i;
    const s = (i = (t || "").match(_t.notSpaceStart)) == null ? void 0 : i[0], r = e.replace(_t.endingNewline, "") + `
`;
    return s ? '<pre><code class="language-' + Bt(s) + '">' + (n ? r : Bt(r, !0)) + `</code></pre>
` : "<pre><code>" + (n ? r : Bt(r, !0)) + `</code></pre>
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
      const l = e.items[o];
      s += this.listitem(l);
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
      e.loose ? ((n = e.tokens[0]) == null ? void 0 : n.type) === "paragraph" ? (e.tokens[0].text = s + " " + e.tokens[0].text, e.tokens[0].tokens && e.tokens[0].tokens.length > 0 && e.tokens[0].tokens[0].type === "text" && (e.tokens[0].tokens[0].text = s + " " + Bt(e.tokens[0].tokens[0].text), e.tokens[0].tokens[0].escaped = !0)) : e.tokens.unshift({
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
    return `<code>${Bt(e, !0)}</code>`;
  }
  br(e) {
    return "<br>";
  }
  del({ tokens: e }) {
    return `<del>${this.parser.parseInline(e)}</del>`;
  }
  link({ href: e, title: t, tokens: n }) {
    const s = this.parser.parseInline(n), r = bo(e);
    if (r === null)
      return s;
    e = r;
    let i = '<a href="' + e + '"';
    return t && (i += ' title="' + Bt(t) + '"'), i += ">" + s + "</a>", i;
  }
  image({ href: e, title: t, text: n, tokens: s }) {
    s && (n = this.parser.parseInline(s, this.parser.textRenderer));
    const r = bo(e);
    if (r === null)
      return Bt(n);
    e = r;
    let i = `<img src="${e}" alt="${n}"`;
    return t && (i += ` title="${Bt(t)}"`), i += ">", i;
  }
  text(e) {
    return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : Bt(e.text);
  }
}, pi = class {
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
}, Xt = class Fr {
  constructor(t) {
    Pe(this, "options");
    Pe(this, "renderer");
    Pe(this, "textRenderer");
    this.options = t || wn, this.options.renderer = this.options.renderer || new Ds(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new pi();
  }
  /**
   * Static Parse Method
   */
  static parse(t, n) {
    return new Fr(n).parse(t);
  }
  /**
   * Static Parse Inline Method
   */
  static parseInline(t, n) {
    return new Fr(n).parseInline(t);
  }
  /**
   * Parse Loop
   */
  parse(t, n = !0) {
    var r, i;
    let s = "";
    for (let o = 0; o < t.length; o++) {
      const l = t[o];
      if ((i = (r = this.options.extensions) == null ? void 0 : r.renderers) != null && i[l.type]) {
        const f = l, c = this.options.extensions.renderers[f.type].call({ parser: this }, f);
        if (c !== !1 || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "paragraph", "text"].includes(f.type)) {
          s += c || "";
          continue;
        }
      }
      const a = l;
      switch (a.type) {
        case "space": {
          s += this.renderer.space(a);
          continue;
        }
        case "hr": {
          s += this.renderer.hr(a);
          continue;
        }
        case "heading": {
          s += this.renderer.heading(a);
          continue;
        }
        case "code": {
          s += this.renderer.code(a);
          continue;
        }
        case "table": {
          s += this.renderer.table(a);
          continue;
        }
        case "blockquote": {
          s += this.renderer.blockquote(a);
          continue;
        }
        case "list": {
          s += this.renderer.list(a);
          continue;
        }
        case "html": {
          s += this.renderer.html(a);
          continue;
        }
        case "paragraph": {
          s += this.renderer.paragraph(a);
          continue;
        }
        case "text": {
          let f = a, c = this.renderer.text(f);
          for (; o + 1 < t.length && t[o + 1].type === "text"; )
            f = t[++o], c += `
` + this.renderer.text(f);
          n ? s += this.renderer.paragraph({
            type: "paragraph",
            raw: c,
            text: c,
            tokens: [{ type: "text", raw: c, text: c, escaped: !0 }]
          }) : s += c;
          continue;
        }
        default: {
          const f = 'Token with "' + a.type + '" type was not found.';
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
      const l = t[o];
      if ((i = (r = this.options.extensions) == null ? void 0 : r.renderers) != null && i[l.type]) {
        const f = this.options.extensions.renderers[l.type].call({ parser: this }, l);
        if (f !== !1 || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(l.type)) {
          s += f || "";
          continue;
        }
      }
      const a = l;
      switch (a.type) {
        case "escape": {
          s += n.text(a);
          break;
        }
        case "html": {
          s += n.html(a);
          break;
        }
        case "link": {
          s += n.link(a);
          break;
        }
        case "image": {
          s += n.image(a);
          break;
        }
        case "strong": {
          s += n.strong(a);
          break;
        }
        case "em": {
          s += n.em(a);
          break;
        }
        case "codespan": {
          s += n.codespan(a);
          break;
        }
        case "br": {
          s += n.br(a);
          break;
        }
        case "del": {
          s += n.del(a);
          break;
        }
        case "text": {
          s += n.text(a);
          break;
        }
        default: {
          const f = 'Token with "' + a.type + '" type was not found.';
          if (this.options.silent)
            return console.error(f), "";
          throw new Error(f);
        }
      }
    }
    return s;
  }
}, br, Ts = (br = class {
  constructor(e) {
    Pe(this, "options");
    Pe(this, "block");
    this.options = e || wn;
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
    return this.block ? Yt.lex : Yt.lexInline;
  }
  /**
   * Provide function to parse tokens
   */
  provideParser() {
    return this.block ? Xt.parse : Xt.parseInline;
  }
}, Pe(br, "passThroughHooks", /* @__PURE__ */ new Set([
  "preprocess",
  "postprocess",
  "processAllTokens"
])), br), $h = class {
  constructor(...e) {
    Pe(this, "defaults", oi());
    Pe(this, "options", this.setOptions);
    Pe(this, "parse", this.parseMarkdown(!0));
    Pe(this, "parseInline", this.parseMarkdown(!1));
    Pe(this, "Parser", Xt);
    Pe(this, "Renderer", Ds);
    Pe(this, "TextRenderer", pi);
    Pe(this, "Lexer", Yt);
    Pe(this, "Tokenizer", Ms);
    Pe(this, "Hooks", Ts);
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
          for (const l of o.header)
            n = n.concat(this.walkTokens(l.tokens, t));
          for (const l of o.rows)
            for (const a of l)
              n = n.concat(this.walkTokens(a.tokens, t));
          break;
        }
        case "list": {
          const o = i;
          n = n.concat(this.walkTokens(o.items, t));
          break;
        }
        default: {
          const o = i;
          (r = (s = this.defaults.extensions) == null ? void 0 : s.childTokens) != null && r[o.type] ? this.defaults.extensions.childTokens[o.type].forEach((l) => {
            const a = o[l].flat(1 / 0);
            n = n.concat(this.walkTokens(a, t));
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
            let l = r.renderer.apply(this, o);
            return l === !1 && (l = i.apply(this, o)), l;
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
        const r = this.defaults.renderer || new Ds(this.defaults);
        for (const i in n.renderer) {
          if (!(i in r))
            throw new Error(`renderer '${i}' does not exist`);
          if (["options", "parser"].includes(i))
            continue;
          const o = i, l = n.renderer[o], a = r[o];
          r[o] = (...f) => {
            let c = l.apply(r, f);
            return c === !1 && (c = a.apply(r, f)), c || "";
          };
        }
        s.renderer = r;
      }
      if (n.tokenizer) {
        const r = this.defaults.tokenizer || new Ms(this.defaults);
        for (const i in n.tokenizer) {
          if (!(i in r))
            throw new Error(`tokenizer '${i}' does not exist`);
          if (["options", "rules", "lexer"].includes(i))
            continue;
          const o = i, l = n.tokenizer[o], a = r[o];
          r[o] = (...f) => {
            let c = l.apply(r, f);
            return c === !1 && (c = a.apply(r, f)), c;
          };
        }
        s.tokenizer = r;
      }
      if (n.hooks) {
        const r = this.defaults.hooks || new Ts();
        for (const i in n.hooks) {
          if (!(i in r))
            throw new Error(`hook '${i}' does not exist`);
          if (["options", "block"].includes(i))
            continue;
          const o = i, l = n.hooks[o], a = r[o];
          Ts.passThroughHooks.has(i) ? r[o] = (f) => {
            if (this.defaults.async)
              return Promise.resolve(l.call(r, f)).then((b) => a.call(r, b));
            const c = l.call(r, f);
            return a.call(r, c);
          } : r[o] = (...f) => {
            let c = l.apply(r, f);
            return c === !1 && (c = a.apply(r, f)), c;
          };
        }
        s.hooks = r;
      }
      if (n.walkTokens) {
        const r = this.defaults.walkTokens, i = n.walkTokens;
        s.walkTokens = function(o) {
          let l = [];
          return l.push(i.call(this, o)), r && (l = l.concat(r.call(this, o))), l;
        };
      }
      this.defaults = { ...this.defaults, ...s };
    }), this;
  }
  setOptions(e) {
    return this.defaults = { ...this.defaults, ...e }, this;
  }
  lexer(e, t) {
    return Yt.lex(e, t ?? this.defaults);
  }
  parser(e, t) {
    return Xt.parse(e, t ?? this.defaults);
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
      const l = i.hooks ? i.hooks.provideLexer() : e ? Yt.lex : Yt.lexInline, a = i.hooks ? i.hooks.provideParser() : e ? Xt.parse : Xt.parseInline;
      if (i.async)
        return Promise.resolve(i.hooks ? i.hooks.preprocess(n) : n).then((f) => l(f, i)).then((f) => i.hooks ? i.hooks.processAllTokens(f) : f).then((f) => i.walkTokens ? Promise.all(this.walkTokens(f, i.walkTokens)).then(() => f) : f).then((f) => a(f, i)).then((f) => i.hooks ? i.hooks.postprocess(f) : f).catch(o);
      try {
        i.hooks && (n = i.hooks.preprocess(n));
        let f = l(n, i);
        i.hooks && (f = i.hooks.processAllTokens(f)), i.walkTokens && this.walkTokens(f, i.walkTokens);
        let c = a(f, i);
        return i.hooks && (c = i.hooks.postprocess(c)), c;
      } catch (f) {
        return o(f);
      }
    };
  }
  onError(e, t) {
    return (n) => {
      if (n.message += `
Please report this to https://github.com/markedjs/marked.`, e) {
        const s = "<p>An error occurred:</p><pre>" + Bt(n.message + "", !0) + "</pre>";
        return t ? Promise.resolve(s) : s;
      }
      if (t)
        return Promise.reject(n);
      throw n;
    };
  }
}, bn = new $h();
function ye(e, t) {
  return bn.parse(e, t);
}
ye.options = ye.setOptions = function(e) {
  return bn.setOptions(e), ye.defaults = bn.defaults, $l(ye.defaults), ye;
};
ye.getDefaults = oi;
ye.defaults = wn;
ye.use = function(...e) {
  return bn.use(...e), ye.defaults = bn.defaults, $l(ye.defaults), ye;
};
ye.walkTokens = function(e, t) {
  return bn.walkTokens(e, t);
};
ye.parseInline = bn.parseInline;
ye.Parser = Xt;
ye.parser = Xt.parse;
ye.Renderer = Ds;
ye.TextRenderer = pi;
ye.Lexer = Yt;
ye.lexer = Yt.lex;
ye.Tokenizer = Ms;
ye.Hooks = Ts;
ye.parse = ye;
ye.options;
ye.setOptions;
ye.use;
ye.walkTokens;
ye.parseInline;
Xt.parse;
Yt.lex;
function xo() {
  return typeof window < "u" && window.APP_CONFIG ? window.APP_CONFIG : {};
}
const on = {
  get API_URL() {
    return xo().API_URL || "https://api.chattermate.chat/api/v1";
  },
  get WS_URL() {
    return xo().WS_URL || "wss://api.chattermate.chat";
  }
};
function Fh(e) {
  const t = Ke(() => ({
    backgroundColor: e.value.chat_background_color || "#ffffff",
    color: tn(e.value.chat_background_color || "#ffffff") ? "#ffffff" : "#000000"
  })), n = Ke(() => ({
    backgroundColor: e.value.chat_bubble_color || "#f34611",
    color: tn(e.value.chat_bubble_color || "#f34611") ? "#FFFFFF" : "#000000"
  })), s = Ke(() => {
    const f = e.value.chat_background_color || "#F8F9FA", c = Xu(f, 20);
    return {
      backgroundColor: c,
      color: tn(c) ? "#FFFFFF" : "#000000"
    };
  }), r = Ke(() => ({
    backgroundColor: e.value.accent_color || "#f34611",
    color: tn(e.value.accent_color || "#f34611") ? "#FFFFFF" : "#000000"
  })), i = Ke(() => ({
    color: tn(e.value.chat_background_color || "#F8F9FA") ? "#FFFFFF" : "#000000"
  })), o = Ke(() => ({
    borderBottom: `1px solid ${tn(e.value.chat_background_color || "#F8F9FA") ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`
  })), l = Ke(() => e.value.photo_url ? e.value.photo_url.includes("amazonaws.com") ? e.value.photo_url : `${on.API_URL}${e.value.photo_url}` : ""), a = Ke(() => {
    const f = e.value.chat_background_color || "#ffffff";
    return {
      boxShadow: `0 8px 5px ${tn(f) ? "rgba(0, 0, 0, 0.24)" : "rgba(0, 0, 0, 0.12)"}`
    };
  });
  return {
    chatStyles: t,
    chatIconStyles: n,
    agentBubbleStyles: s,
    userBubbleStyles: r,
    messageNameStyles: i,
    headerBorderStyles: o,
    photoUrl: l,
    shadowStyle: a
  };
}
const Bh = /* @__PURE__ */ new Set(["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]), Nh = /* @__PURE__ */ new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);
[...Bh, ...Nh];
function Mh(e, t) {
  const n = se([]), s = se(!1), r = se(null), i = (q) => {
    if (q === 0) return "0 Bytes";
    const H = 1024, K = ["Bytes", "KB", "MB", "GB"], Se = Math.floor(Math.log(q) / Math.log(H));
    return parseFloat((q / Math.pow(H, Se)).toFixed(2)) + " " + K[Se];
  }, o = (q) => q.startsWith("image/"), l = (q) => q ? q.startsWith("blob:") || q.startsWith("http://") || q.startsWith("https://") ? q : `${on.API_URL}${q}` : "", a = (q) => {
    const H = q.file_url || q.url;
    return H ? H.startsWith("blob:") || H.startsWith("http://") || H.startsWith("https://") ? H : `${on.API_URL}${H}` : "";
  }, f = async (q) => {
    const H = q.target;
    H.files && H.files.length > 0 && (await U(Array.from(H.files)), H.value = "");
  }, c = async (q) => {
    var K;
    q.preventDefault();
    const H = (K = q.dataTransfer) == null ? void 0 : K.files;
    H && H.length > 0 && await U(Array.from(H));
  }, b = (q) => {
    q.preventDefault();
  }, v = (q) => {
    q.preventDefault();
  }, $ = async (q) => {
    var Se;
    const H = (Se = q.clipboardData) == null ? void 0 : Se.items;
    if (!H) return;
    const K = [];
    for (const We of Array.from(H))
      if (We.kind === "file") {
        const Be = We.getAsFile();
        Be && K.push(Be);
      }
    K.length > 0 && await U(K);
  }, M = async (q, H = 500) => new Promise((K, Se) => {
    const We = new FileReader();
    We.onload = (Be) => {
      var fe;
      const je = new Image();
      je.onload = () => {
        const Ue = document.createElement("canvas");
        let Ve = je.width, Ze = je.height;
        const te = 1920;
        (Ve > te || Ze > te) && (Ve > Ze ? (Ze = Ze / Ve * te, Ve = te) : (Ve = Ve / Ze * te, Ze = te)), Ue.width = Ve, Ue.height = Ze;
        const ae = Ue.getContext("2d");
        if (!ae) {
          Se(new Error("Failed to get canvas context"));
          return;
        }
        ae.drawImage(je, 0, 0, Ve, Ze);
        let J = 0.9;
        const Ge = () => {
          Ue.toBlob((me) => {
            if (!me) {
              Se(new Error("Failed to compress image"));
              return;
            }
            if (me.size / 1024 > H && J > 0.3)
              J -= 0.1, Ge();
            else {
              const Me = new FileReader();
              Me.onload = () => {
                const ot = Me.result.split(",")[1];
                K({ blob: me, base64: ot });
              }, Me.readAsDataURL(me);
            }
          }, q.type === "image/png" ? "image/png" : "image/jpeg", J);
        };
        Ge();
      }, je.onerror = () => Se(new Error("Failed to load image")), je.src = (fe = Be.target) == null ? void 0 : fe.result;
    }, We.onerror = () => Se(new Error("Failed to read file")), We.readAsDataURL(q);
  }), U = async (q) => {
    if (n.value.length >= 3) {
      alert("Maximum 3 files allowed per message");
      return;
    }
    const Be = 3 - n.value.length, je = q.slice(0, Be);
    q.length > Be && alert(`Only ${Be} more file(s) can be uploaded. Maximum 3 files per message.`);
    for (const fe of je)
      try {
        if (n.value.some((te) => te.filename === fe.name)) {
          console.warn(`File ${fe.name} is already selected`), alert(`File "${fe.name}" is already selected`);
          continue;
        }
        const Ve = fe.type.startsWith("image/"), Ze = Ve ? 5242880 : 10485760;
        if (fe.size > Ze) {
          const te = Ze / 1048576;
          console.error(`File ${fe.name} is too large. Maximum size is ${te}MB`), alert(`File "${fe.name}" is too large. Maximum size for ${Ve ? "images" : "documents"} is ${te}MB`);
          continue;
        }
        if (Ve)
          try {
            const { blob: te, base64: ae } = await M(fe, 500), J = te.size;
            console.log(`Compressed ${fe.name}: ${(fe.size / 1024).toFixed(2)}KB → ${(J / 1024).toFixed(2)}KB`), n.value.push({
              content: ae,
              filename: fe.name,
              type: fe.type,
              size: J,
              url: URL.createObjectURL(te),
              file_url: URL.createObjectURL(te)
            });
          } catch (te) {
            console.error("Image compression failed, uploading original:", te);
            const ae = new FileReader();
            ae.onload = (J) => {
              var Oe;
              const me = ((Oe = J.target) == null ? void 0 : Oe.result).split(",")[1];
              n.value.push({
                content: me,
                filename: fe.name,
                type: fe.type,
                size: fe.size,
                url: URL.createObjectURL(fe),
                file_url: URL.createObjectURL(fe)
              });
            }, ae.readAsDataURL(fe);
          }
        else {
          const te = new FileReader();
          te.onload = (ae) => {
            var me;
            const Ge = ((me = ae.target) == null ? void 0 : me.result).split(",")[1];
            n.value.push({
              content: Ge,
              filename: fe.name,
              type: fe.type || "application/octet-stream",
              size: fe.size,
              url: "",
              file_url: ""
            });
          }, te.readAsDataURL(fe);
        }
      } catch (Ue) {
        console.error("File upload error:", Ue);
      }
  };
  return {
    uploadedAttachments: n,
    previewModal: s,
    previewFile: r,
    formatFileSize: i,
    isImageAttachment: o,
    getDownloadUrl: l,
    getPreviewUrl: a,
    handleFileSelect: f,
    handleDrop: c,
    handleDragOver: b,
    handleDragLeave: v,
    handlePaste: $,
    uploadFiles: U,
    removeAttachment: async (q) => {
      const H = n.value[q];
      if (H) {
        try {
          let K = H.url;
          K.startsWith("/uploads/") ? K = K.substring(9) : K.startsWith("/") && (K = K.substring(1)), K.includes("amazonaws.com/") && (K = K.split("amazonaws.com/")[1]);
          const Se = {};
          e.value && (Se.Authorization = `Bearer ${e.value}`);
          const We = await fetch(`${on.API_URL}/api/v1/files/upload/${K}`, {
            method: "DELETE",
            headers: Se
          });
          if (We.ok)
            console.log("File deleted successfully from backend.");
          else {
            const Be = await We.json();
            console.error("Failed to delete file:", Be.detail);
          }
        } catch (K) {
          console.error("Error calling delete API:", K);
        }
        H.url && H.url.startsWith("blob:") && URL.revokeObjectURL(H.url), H.file_url && H.file_url.startsWith("blob:") && URL.revokeObjectURL(H.file_url), n.value.splice(q, 1);
      }
    },
    openPreview: (q) => {
      r.value = q, s.value = !0;
    },
    closePreview: () => {
      s.value = !1, setTimeout(() => {
        r.value = null;
      }, 300);
    },
    openFilePicker: () => {
      var q;
      (q = t.value) == null || q.click();
    },
    isImage: (q) => q.startsWith("image/")
  };
}
const Ht = /* @__PURE__ */ Object.create(null);
Ht.open = "0";
Ht.close = "1";
Ht.ping = "2";
Ht.pong = "3";
Ht.message = "4";
Ht.upgrade = "5";
Ht.noop = "6";
const As = /* @__PURE__ */ Object.create(null);
Object.keys(Ht).forEach((e) => {
  As[Ht[e]] = e;
});
const Br = { type: "error", data: "parser error" }, jl = typeof Blob == "function" || typeof Blob < "u" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]", Vl = typeof ArrayBuffer == "function", Kl = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e && e.buffer instanceof ArrayBuffer, gi = ({ type: e, data: t }, n, s) => jl && t instanceof Blob ? n ? s(t) : So(t, s) : Vl && (t instanceof ArrayBuffer || Kl(t)) ? n ? s(t) : So(new Blob([t]), s) : s(Ht[e] + (t || "")), So = (e, t) => {
  const n = new FileReader();
  return n.onload = function() {
    const s = n.result.split(",")[1];
    t("b" + (s || ""));
  }, n.readAsDataURL(e);
};
function Co(e) {
  return e instanceof Uint8Array ? e : e instanceof ArrayBuffer ? new Uint8Array(e) : new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
}
let mr;
function Dh(e, t) {
  if (jl && e.data instanceof Blob)
    return e.data.arrayBuffer().then(Co).then(t);
  if (Vl && (e.data instanceof ArrayBuffer || Kl(e.data)))
    return t(Co(e.data));
  gi(e, !1, (n) => {
    mr || (mr = new TextEncoder()), t(mr.encode(n));
  });
}
const To = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", Zn = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (let e = 0; e < To.length; e++)
  Zn[To.charCodeAt(e)] = e;
const qh = (e) => {
  let t = e.length * 0.75, n = e.length, s, r = 0, i, o, l, a;
  e[e.length - 1] === "=" && (t--, e[e.length - 2] === "=" && t--);
  const f = new ArrayBuffer(t), c = new Uint8Array(f);
  for (s = 0; s < n; s += 4)
    i = Zn[e.charCodeAt(s)], o = Zn[e.charCodeAt(s + 1)], l = Zn[e.charCodeAt(s + 2)], a = Zn[e.charCodeAt(s + 3)], c[r++] = i << 2 | o >> 4, c[r++] = (o & 15) << 4 | l >> 2, c[r++] = (l & 3) << 6 | a & 63;
  return f;
}, Uh = typeof ArrayBuffer == "function", mi = (e, t) => {
  if (typeof e != "string")
    return {
      type: "message",
      data: Zl(e, t)
    };
  const n = e.charAt(0);
  return n === "b" ? {
    type: "message",
    data: zh(e.substring(1), t)
  } : As[n] ? e.length > 1 ? {
    type: As[n],
    data: e.substring(1)
  } : {
    type: As[n]
  } : Br;
}, zh = (e, t) => {
  if (Uh) {
    const n = qh(e);
    return Zl(n, t);
  } else
    return { base64: !0, data: e };
}, Zl = (e, t) => {
  switch (t) {
    case "blob":
      return e instanceof Blob ? e : new Blob([e]);
    case "arraybuffer":
    default:
      return e instanceof ArrayBuffer ? e : e.buffer;
  }
}, Gl = "", Hh = (e, t) => {
  const n = e.length, s = new Array(n);
  let r = 0;
  e.forEach((i, o) => {
    gi(i, !1, (l) => {
      s[o] = l, ++r === n && t(s.join(Gl));
    });
  });
}, Wh = (e, t) => {
  const n = e.split(Gl), s = [];
  for (let r = 0; r < n.length; r++) {
    const i = mi(n[r], t);
    if (s.push(i), i.type === "error")
      break;
  }
  return s;
};
function jh() {
  return new TransformStream({
    transform(e, t) {
      Dh(e, (n) => {
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
let _r;
function ys(e) {
  return e.reduce((t, n) => t + n.length, 0);
}
function bs(e, t) {
  if (e[0].length === t)
    return e.shift();
  const n = new Uint8Array(t);
  let s = 0;
  for (let r = 0; r < t; r++)
    n[r] = e[0][s++], s === e[0].length && (e.shift(), s = 0);
  return e.length && s < e[0].length && (e[0] = e[0].slice(s)), n;
}
function Vh(e, t) {
  _r || (_r = new TextDecoder());
  const n = [];
  let s = 0, r = -1, i = !1;
  return new TransformStream({
    transform(o, l) {
      for (n.push(o); ; ) {
        if (s === 0) {
          if (ys(n) < 1)
            break;
          const a = bs(n, 1);
          i = (a[0] & 128) === 128, r = a[0] & 127, r < 126 ? s = 3 : r === 126 ? s = 1 : s = 2;
        } else if (s === 1) {
          if (ys(n) < 2)
            break;
          const a = bs(n, 2);
          r = new DataView(a.buffer, a.byteOffset, a.length).getUint16(0), s = 3;
        } else if (s === 2) {
          if (ys(n) < 8)
            break;
          const a = bs(n, 8), f = new DataView(a.buffer, a.byteOffset, a.length), c = f.getUint32(0);
          if (c > Math.pow(2, 21) - 1) {
            l.enqueue(Br);
            break;
          }
          r = c * Math.pow(2, 32) + f.getUint32(4), s = 3;
        } else {
          if (ys(n) < r)
            break;
          const a = bs(n, r);
          l.enqueue(mi(i ? a : _r.decode(a), t)), s = 0;
        }
        if (r === 0 || r > e) {
          l.enqueue(Br);
          break;
        }
      }
    }
  });
}
const Yl = 4;
function Je(e) {
  if (e) return Kh(e);
}
function Kh(e) {
  for (var t in Je.prototype)
    e[t] = Je.prototype[t];
  return e;
}
Je.prototype.on = Je.prototype.addEventListener = function(e, t) {
  return this._callbacks = this._callbacks || {}, (this._callbacks["$" + e] = this._callbacks["$" + e] || []).push(t), this;
};
Je.prototype.once = function(e, t) {
  function n() {
    this.off(e, n), t.apply(this, arguments);
  }
  return n.fn = t, this.on(e, n), this;
};
Je.prototype.off = Je.prototype.removeListener = Je.prototype.removeAllListeners = Je.prototype.removeEventListener = function(e, t) {
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
Je.prototype.emit = function(e) {
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
Je.prototype.emitReserved = Je.prototype.emit;
Je.prototype.listeners = function(e) {
  return this._callbacks = this._callbacks || {}, this._callbacks["$" + e] || [];
};
Je.prototype.hasListeners = function(e) {
  return !!this.listeners(e).length;
};
const Js = typeof Promise == "function" && typeof Promise.resolve == "function" ? (t) => Promise.resolve().then(t) : (t, n) => n(t, 0), Ct = typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")(), Zh = "arraybuffer";
function Xl(e, ...t) {
  return t.reduce((n, s) => (e.hasOwnProperty(s) && (n[s] = e[s]), n), {});
}
const Gh = Ct.setTimeout, Yh = Ct.clearTimeout;
function Qs(e, t) {
  t.useNativeTimers ? (e.setTimeoutFn = Gh.bind(Ct), e.clearTimeoutFn = Yh.bind(Ct)) : (e.setTimeoutFn = Ct.setTimeout.bind(Ct), e.clearTimeoutFn = Ct.clearTimeout.bind(Ct));
}
const Xh = 1.33;
function Jh(e) {
  return typeof e == "string" ? Qh(e) : Math.ceil((e.byteLength || e.size) * Xh);
}
function Qh(e) {
  let t = 0, n = 0;
  for (let s = 0, r = e.length; s < r; s++)
    t = e.charCodeAt(s), t < 128 ? n += 1 : t < 2048 ? n += 2 : t < 55296 || t >= 57344 ? n += 3 : (s++, n += 4);
  return n;
}
function Jl() {
  return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
}
function ef(e) {
  let t = "";
  for (let n in e)
    e.hasOwnProperty(n) && (t.length && (t += "&"), t += encodeURIComponent(n) + "=" + encodeURIComponent(e[n]));
  return t;
}
function tf(e) {
  let t = {}, n = e.split("&");
  for (let s = 0, r = n.length; s < r; s++) {
    let i = n[s].split("=");
    t[decodeURIComponent(i[0])] = decodeURIComponent(i[1]);
  }
  return t;
}
class nf extends Error {
  constructor(t, n, s) {
    super(t), this.description = n, this.context = s, this.type = "TransportError";
  }
}
class _i extends Je {
  /**
   * Transport abstract constructor.
   *
   * @param {Object} opts - options
   * @protected
   */
  constructor(t) {
    super(), this.writable = !1, Qs(this, t), this.opts = t, this.query = t.query, this.socket = t.socket, this.supportsBinary = !t.forceBase64;
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
    return super.emitReserved("error", new nf(t, n, s)), this;
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
    const n = mi(t, this.socket.binaryType);
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
    return this.opts.port && (this.opts.secure && +(this.opts.port !== 443) || !this.opts.secure && Number(this.opts.port) !== 80) ? ":" + this.opts.port : "";
  }
  _query(t) {
    const n = ef(t);
    return n.length ? "?" + n : "";
  }
}
class sf extends _i {
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
    Wh(t, this.socket.binaryType).forEach(n), this.readyState !== "closed" && (this._polling = !1, this.emitReserved("pollComplete"), this.readyState === "open" && this._poll());
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
    this.writable = !1, Hh(t, (n) => {
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
    return this.opts.timestampRequests !== !1 && (n[this.opts.timestampParam] = Jl()), !this.supportsBinary && !n.sid && (n.b64 = 1), this.createUri(t, n);
  }
}
let Ql = !1;
try {
  Ql = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest();
} catch {
}
const rf = Ql;
function of() {
}
class lf extends sf {
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
   * @param {String} data to send.
   * @param {Function} called upon flush.
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
class Ut extends Je {
  /**
   * Request constructor
   *
   * @param {Object} options
   * @package
   */
  constructor(t, n, s) {
    super(), this.createRequest = t, Qs(this, s), this._opts = s, this._method = s.method || "GET", this._uri = n, this._data = s.data !== void 0 ? s.data : null, this._create();
  }
  /**
   * Creates the XHR object and sends the request.
   *
   * @private
   */
  _create() {
    var t;
    const n = Xl(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
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
    typeof document < "u" && (this._index = Ut.requestsCount++, Ut.requests[this._index] = this);
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
      if (this._xhr.onreadystatechange = of, t)
        try {
          this._xhr.abort();
        } catch {
        }
      typeof document < "u" && delete Ut.requests[this._index], this._xhr = null;
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
Ut.requestsCount = 0;
Ut.requests = {};
if (typeof document < "u") {
  if (typeof attachEvent == "function")
    attachEvent("onunload", Ao);
  else if (typeof addEventListener == "function") {
    const e = "onpagehide" in Ct ? "pagehide" : "unload";
    addEventListener(e, Ao, !1);
  }
}
function Ao() {
  for (let e in Ut.requests)
    Ut.requests.hasOwnProperty(e) && Ut.requests[e].abort();
}
const af = function() {
  const e = ea({
    xdomain: !1
  });
  return e && e.responseType !== null;
}();
class cf extends lf {
  constructor(t) {
    super(t);
    const n = t && t.forceBase64;
    this.supportsBinary = af && !n;
  }
  request(t = {}) {
    return Object.assign(t, { xd: this.xd }, this.opts), new Ut(ea, this.uri(), t);
  }
}
function ea(e) {
  const t = e.xdomain;
  try {
    if (typeof XMLHttpRequest < "u" && (!t || rf))
      return new XMLHttpRequest();
  } catch {
  }
  if (!t)
    try {
      return new Ct[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
    } catch {
    }
}
const ta = typeof navigator < "u" && typeof navigator.product == "string" && navigator.product.toLowerCase() === "reactnative";
class uf extends _i {
  get name() {
    return "websocket";
  }
  doOpen() {
    const t = this.uri(), n = this.opts.protocols, s = ta ? {} : Xl(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
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
      gi(s, this.supportsBinary, (i) => {
        try {
          this.doWrite(s, i);
        } catch {
        }
        r && Js(() => {
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
    return this.opts.timestampRequests && (n[this.opts.timestampParam] = Jl()), this.supportsBinary || (n.b64 = 1), this.createUri(t, n);
  }
}
const vr = Ct.WebSocket || Ct.MozWebSocket;
class hf extends uf {
  createSocket(t, n, s) {
    return ta ? new vr(t, n, s) : n ? new vr(t, n) : new vr(t);
  }
  doWrite(t, n) {
    this.ws.send(n);
  }
}
class ff extends _i {
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
        const n = Vh(Number.MAX_SAFE_INTEGER, this.socket.binaryType), s = t.readable.pipeThrough(n).getReader(), r = jh();
        r.readable.pipeTo(t.writable), this._writer = r.writable.getWriter();
        const i = () => {
          s.read().then(({ done: l, value: a }) => {
            l || (this.onPacket(a), i());
          }).catch((l) => {
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
        r && Js(() => {
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
const df = {
  websocket: hf,
  webtransport: ff,
  polling: cf
}, pf = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/, gf = [
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
function Nr(e) {
  if (e.length > 8e3)
    throw "URI too long";
  const t = e, n = e.indexOf("["), s = e.indexOf("]");
  n != -1 && s != -1 && (e = e.substring(0, n) + e.substring(n, s).replace(/:/g, ";") + e.substring(s, e.length));
  let r = pf.exec(e || ""), i = {}, o = 14;
  for (; o--; )
    i[gf[o]] = r[o] || "";
  return n != -1 && s != -1 && (i.source = t, i.host = i.host.substring(1, i.host.length - 1).replace(/;/g, ":"), i.authority = i.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), i.ipv6uri = !0), i.pathNames = mf(i, i.path), i.queryKey = _f(i, i.query), i;
}
function mf(e, t) {
  const n = /\/{2,9}/g, s = t.replace(n, "/").split("/");
  return (t.slice(0, 1) == "/" || t.length === 0) && s.splice(0, 1), t.slice(-1) == "/" && s.splice(s.length - 1, 1), s;
}
function _f(e, t) {
  const n = {};
  return t.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function(s, r, i) {
    r && (n[r] = i);
  }), n;
}
const Mr = typeof addEventListener == "function" && typeof removeEventListener == "function", Es = [];
Mr && addEventListener("offline", () => {
  Es.forEach((e) => e());
}, !1);
class ln extends Je {
  /**
   * Socket constructor.
   *
   * @param {String|Object} uri - uri or options
   * @param {Object} opts - options
   */
  constructor(t, n) {
    if (super(), this.binaryType = Zh, this.writeBuffer = [], this._prevBufferLen = 0, this._pingInterval = -1, this._pingTimeout = -1, this._maxPayload = -1, this._pingTimeoutTime = 1 / 0, t && typeof t == "object" && (n = t, t = null), t) {
      const s = Nr(t);
      n.hostname = s.host, n.secure = s.protocol === "https" || s.protocol === "wss", n.port = s.port, s.query && (n.query = s.query);
    } else n.host && (n.hostname = Nr(n.host).host);
    Qs(this, n), this.secure = n.secure != null ? n.secure : typeof location < "u" && location.protocol === "https:", n.hostname && !n.port && (n.port = this.secure ? "443" : "80"), this.hostname = n.hostname || (typeof location < "u" ? location.hostname : "localhost"), this.port = n.port || (typeof location < "u" && location.port ? location.port : this.secure ? "443" : "80"), this.transports = [], this._transportsByName = {}, n.transports.forEach((s) => {
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
    }, n), this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : ""), typeof this.opts.query == "string" && (this.opts.query = tf(this.opts.query)), Mr && (this.opts.closeOnBeforeunload && (this._beforeunloadEventListener = () => {
      this.transport && (this.transport.removeAllListeners(), this.transport.close());
    }, addEventListener("beforeunload", this._beforeunloadEventListener, !1)), this.hostname !== "localhost" && (this._offlineEventListener = () => {
      this._onClose("transport close", {
        description: "network connection lost"
      });
    }, Es.push(this._offlineEventListener))), this.opts.withCredentials && (this._cookieJar = void 0), this._open();
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
    n.EIO = Yl, n.transport = t, this.id && (n.sid = this.id);
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
    const t = this.opts.rememberUpgrade && ln.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1 ? "websocket" : this.transports[0];
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
    this.readyState = "open", ln.priorWebsocketSuccess = this.transport.name === "websocket", this.emitReserved("open"), this.flush();
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
      if (r && (n += Jh(r)), s > 0 && n > this._maxPayload)
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
    return t && (this._pingTimeoutTime = 0, Js(() => {
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
   * @param {String} type: packet type.
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
    if (ln.priorWebsocketSuccess = !1, this.opts.tryAllTransports && this.transports.length > 1 && this.readyState === "opening")
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
      if (this.clearTimeoutFn(this._pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), Mr && (this._beforeunloadEventListener && removeEventListener("beforeunload", this._beforeunloadEventListener, !1), this._offlineEventListener)) {
        const s = Es.indexOf(this._offlineEventListener);
        s !== -1 && Es.splice(s, 1);
      }
      this.readyState = "closed", this.id = null, this.emitReserved("close", t, n), this.writeBuffer = [], this._prevBufferLen = 0;
    }
  }
}
ln.protocol = Yl;
class vf extends ln {
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
    ln.priorWebsocketSuccess = !1;
    const r = () => {
      s || (n.send([{ type: "ping", data: "probe" }]), n.once("packet", (b) => {
        if (!s)
          if (b.type === "pong" && b.data === "probe") {
            if (this.upgrading = !0, this.emitReserved("upgrading", n), !n)
              return;
            ln.priorWebsocketSuccess = n.name === "websocket", this.transport.pause(() => {
              s || this.readyState !== "closed" && (c(), this.setTransport(n), n.send([{ type: "upgrade" }]), this.emitReserved("upgrade", n), n = null, this.upgrading = !1, this.flush());
            });
          } else {
            const v = new Error("probe error");
            v.transport = n.name, this.emitReserved("upgradeError", v);
          }
      }));
    };
    function i() {
      s || (s = !0, c(), n.close(), n = null);
    }
    const o = (b) => {
      const v = new Error("probe error: " + b);
      v.transport = n.name, i(), this.emitReserved("upgradeError", v);
    };
    function l() {
      o("transport closed");
    }
    function a() {
      o("socket closed");
    }
    function f(b) {
      n && b.name !== n.name && i();
    }
    const c = () => {
      n.removeListener("open", r), n.removeListener("error", o), n.removeListener("close", l), this.off("close", a), this.off("upgrading", f);
    };
    n.once("open", r), n.once("error", o), n.once("close", l), this.once("close", a), this.once("upgrading", f), this._upgrades.indexOf("webtransport") !== -1 && t !== "webtransport" ? this.setTimeoutFn(() => {
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
let yf = class extends vf {
  constructor(t, n = {}) {
    const s = typeof t == "object" ? t : n;
    (!s.transports || s.transports && typeof s.transports[0] == "string") && (s.transports = (s.transports || ["polling", "websocket", "webtransport"]).map((r) => df[r]).filter((r) => !!r)), super(t, s);
  }
};
function bf(e, t = "", n) {
  let s = e;
  n = n || typeof location < "u" && location, e == null && (e = n.protocol + "//" + n.host), typeof e == "string" && (e.charAt(0) === "/" && (e.charAt(1) === "/" ? e = n.protocol + e : e = n.host + e), /^(https?|wss?):\/\//.test(e) || (typeof n < "u" ? e = n.protocol + "//" + e : e = "https://" + e), s = Nr(e)), s.port || (/^(http|ws)$/.test(s.protocol) ? s.port = "80" : /^(http|ws)s$/.test(s.protocol) && (s.port = "443")), s.path = s.path || "/";
  const i = s.host.indexOf(":") !== -1 ? "[" + s.host + "]" : s.host;
  return s.id = s.protocol + "://" + i + ":" + s.port + t, s.href = s.protocol + "://" + i + (n && n.port === s.port ? "" : ":" + s.port), s;
}
const wf = typeof ArrayBuffer == "function", kf = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e.buffer instanceof ArrayBuffer, na = Object.prototype.toString, xf = typeof Blob == "function" || typeof Blob < "u" && na.call(Blob) === "[object BlobConstructor]", Sf = typeof File == "function" || typeof File < "u" && na.call(File) === "[object FileConstructor]";
function vi(e) {
  return wf && (e instanceof ArrayBuffer || kf(e)) || xf && e instanceof Blob || Sf && e instanceof File;
}
function Rs(e, t) {
  if (!e || typeof e != "object")
    return !1;
  if (Array.isArray(e)) {
    for (let n = 0, s = e.length; n < s; n++)
      if (Rs(e[n]))
        return !0;
    return !1;
  }
  if (vi(e))
    return !0;
  if (e.toJSON && typeof e.toJSON == "function" && arguments.length === 1)
    return Rs(e.toJSON(), !0);
  for (const n in e)
    if (Object.prototype.hasOwnProperty.call(e, n) && Rs(e[n]))
      return !0;
  return !1;
}
function Cf(e) {
  const t = [], n = e.data, s = e;
  return s.data = Dr(n, t), s.attachments = t.length, { packet: s, buffers: t };
}
function Dr(e, t) {
  if (!e)
    return e;
  if (vi(e)) {
    const n = { _placeholder: !0, num: t.length };
    return t.push(e), n;
  } else if (Array.isArray(e)) {
    const n = new Array(e.length);
    for (let s = 0; s < e.length; s++)
      n[s] = Dr(e[s], t);
    return n;
  } else if (typeof e == "object" && !(e instanceof Date)) {
    const n = {};
    for (const s in e)
      Object.prototype.hasOwnProperty.call(e, s) && (n[s] = Dr(e[s], t));
    return n;
  }
  return e;
}
function Tf(e, t) {
  return e.data = qr(e.data, t), delete e.attachments, e;
}
function qr(e, t) {
  if (!e)
    return e;
  if (e && e._placeholder === !0) {
    if (typeof e.num == "number" && e.num >= 0 && e.num < t.length)
      return t[e.num];
    throw new Error("illegal attachments");
  } else if (Array.isArray(e))
    for (let n = 0; n < e.length; n++)
      e[n] = qr(e[n], t);
  else if (typeof e == "object")
    for (const n in e)
      Object.prototype.hasOwnProperty.call(e, n) && (e[n] = qr(e[n], t));
  return e;
}
const Af = [
  "connect",
  "connect_error",
  "disconnect",
  "disconnecting",
  "newListener",
  "removeListener"
  // used by the Node.js EventEmitter
], Ef = 5;
var ge;
(function(e) {
  e[e.CONNECT = 0] = "CONNECT", e[e.DISCONNECT = 1] = "DISCONNECT", e[e.EVENT = 2] = "EVENT", e[e.ACK = 3] = "ACK", e[e.CONNECT_ERROR = 4] = "CONNECT_ERROR", e[e.BINARY_EVENT = 5] = "BINARY_EVENT", e[e.BINARY_ACK = 6] = "BINARY_ACK";
})(ge || (ge = {}));
class Rf {
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
    return (t.type === ge.EVENT || t.type === ge.ACK) && Rs(t) ? this.encodeAsBinary({
      type: t.type === ge.EVENT ? ge.BINARY_EVENT : ge.BINARY_ACK,
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
    return (t.type === ge.BINARY_EVENT || t.type === ge.BINARY_ACK) && (n += t.attachments + "-"), t.nsp && t.nsp !== "/" && (n += t.nsp + ","), t.id != null && (n += t.id), t.data != null && (n += JSON.stringify(t.data, this.replacer)), n;
  }
  /**
   * Encode packet as 'buffer sequence' by removing blobs, and
   * deconstructing packet into object with placeholders and
   * a list of buffers.
   */
  encodeAsBinary(t) {
    const n = Cf(t), s = this.encodeAsString(n.packet), r = n.buffers;
    return r.unshift(s), r;
  }
}
function Eo(e) {
  return Object.prototype.toString.call(e) === "[object Object]";
}
class yi extends Je {
  /**
   * Decoder constructor
   *
   * @param {function} reviver - custom reviver to pass down to JSON.stringify
   */
  constructor(t) {
    super(), this.reviver = t;
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
      const s = n.type === ge.BINARY_EVENT;
      s || n.type === ge.BINARY_ACK ? (n.type = s ? ge.EVENT : ge.ACK, this.reconstructor = new If(n), n.attachments === 0 && super.emitReserved("decoded", n)) : super.emitReserved("decoded", n);
    } else if (vi(t) || t.base64)
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
    if (ge[s.type] === void 0)
      throw new Error("unknown packet type " + s.type);
    if (s.type === ge.BINARY_EVENT || s.type === ge.BINARY_ACK) {
      const i = n + 1;
      for (; t.charAt(++n) !== "-" && n != t.length; )
        ;
      const o = t.substring(i, n);
      if (o != Number(o) || t.charAt(n) !== "-")
        throw new Error("Illegal attachments");
      s.attachments = Number(o);
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
      if (yi.isPayloadValid(s.type, i))
        s.data = i;
      else
        throw new Error("invalid payload");
    }
    return s;
  }
  tryParse(t) {
    try {
      return JSON.parse(t, this.reviver);
    } catch {
      return !1;
    }
  }
  static isPayloadValid(t, n) {
    switch (t) {
      case ge.CONNECT:
        return Eo(n);
      case ge.DISCONNECT:
        return n === void 0;
      case ge.CONNECT_ERROR:
        return typeof n == "string" || Eo(n);
      case ge.EVENT:
      case ge.BINARY_EVENT:
        return Array.isArray(n) && (typeof n[0] == "number" || typeof n[0] == "string" && Af.indexOf(n[0]) === -1);
      case ge.ACK:
      case ge.BINARY_ACK:
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
class If {
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
      const n = Tf(this.reconPack, this.buffers);
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
const Lf = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Decoder: yi,
  Encoder: Rf,
  get PacketType() {
    return ge;
  },
  protocol: Ef
}, Symbol.toStringTag, { value: "Module" }));
function It(e, t, n) {
  return e.on(t, n), function() {
    e.off(t, n);
  };
}
const Of = Object.freeze({
  connect: 1,
  connect_error: 1,
  disconnect: 1,
  disconnecting: 1,
  // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
  newListener: 1,
  removeListener: 1
});
class sa extends Je {
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
      It(t, "open", this.onopen.bind(this)),
      It(t, "packet", this.onpacket.bind(this)),
      It(t, "error", this.onerror.bind(this)),
      It(t, "close", this.onclose.bind(this))
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
    if (Of.hasOwnProperty(t))
      throw new Error('"' + t.toString() + '" is a reserved event name');
    if (n.unshift(t), this._opts.retries && !this.flags.fromQueue && !this.flags.volatile)
      return this._addToQueue(n), this;
    const o = {
      type: ge.EVENT,
      data: n
    };
    if (o.options = {}, o.options.compress = this.flags.compress !== !1, typeof n[n.length - 1] == "function") {
      const c = this.ids++, b = n.pop();
      this._registerAckCallback(c, b), o.id = c;
    }
    const l = (r = (s = this.io.engine) === null || s === void 0 ? void 0 : s.transport) === null || r === void 0 ? void 0 : r.writable, a = this.connected && !(!((i = this.io.engine) === null || i === void 0) && i._hasPingExpired());
    return this.flags.volatile && !l || (a ? (this.notifyOutgoingListeners(o), this.packet(o)) : this.sendBuffer.push(o)), this.flags = {}, this;
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
      for (let l = 0; l < this.sendBuffer.length; l++)
        this.sendBuffer[l].id === t && this.sendBuffer.splice(l, 1);
      n.call(this, new Error("operation has timed out"));
    }, r), o = (...l) => {
      this.io.clearTimeoutFn(i), n.apply(this, l);
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
      const i = (o, l) => o ? r(o) : s(l);
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
    t.push((r, ...i) => s !== this._queue[0] ? void 0 : (r !== null ? s.tryCount > this._opts.retries && (this._queue.shift(), n && n(r)) : (this._queue.shift(), n && n(null, ...i)), s.pending = !1, this._drainQueue())), this._queue.push(s), this._drainQueue();
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
      type: ge.CONNECT,
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
        case ge.CONNECT:
          t.data && t.data.sid ? this.onconnect(t.data.sid, t.data.pid) : this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
          break;
        case ge.EVENT:
        case ge.BINARY_EVENT:
          this.onevent(t);
          break;
        case ge.ACK:
        case ge.BINARY_ACK:
          this.onack(t);
          break;
        case ge.DISCONNECT:
          this.ondisconnect();
          break;
        case ge.CONNECT_ERROR:
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
        type: ge.ACK,
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
    this.id = t, this.recovered = n && this._pid === n, this._pid = n, this.connected = !0, this.emitBuffered(), this.emitReserved("connect"), this._drainQueue(!0);
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
    return this.connected && this.packet({ type: ge.DISCONNECT }), this.destroy(), this.connected && this.onclose("io client disconnect"), this;
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
function Bn(e) {
  e = e || {}, this.ms = e.min || 100, this.max = e.max || 1e4, this.factor = e.factor || 2, this.jitter = e.jitter > 0 && e.jitter <= 1 ? e.jitter : 0, this.attempts = 0;
}
Bn.prototype.duration = function() {
  var e = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var t = Math.random(), n = Math.floor(t * this.jitter * e);
    e = (Math.floor(t * 10) & 1) == 0 ? e - n : e + n;
  }
  return Math.min(e, this.max) | 0;
};
Bn.prototype.reset = function() {
  this.attempts = 0;
};
Bn.prototype.setMin = function(e) {
  this.ms = e;
};
Bn.prototype.setMax = function(e) {
  this.max = e;
};
Bn.prototype.setJitter = function(e) {
  this.jitter = e;
};
class Ur extends Je {
  constructor(t, n) {
    var s;
    super(), this.nsps = {}, this.subs = [], t && typeof t == "object" && (n = t, t = void 0), n = n || {}, n.path = n.path || "/socket.io", this.opts = n, Qs(this, n), this.reconnection(n.reconnection !== !1), this.reconnectionAttempts(n.reconnectionAttempts || 1 / 0), this.reconnectionDelay(n.reconnectionDelay || 1e3), this.reconnectionDelayMax(n.reconnectionDelayMax || 5e3), this.randomizationFactor((s = n.randomizationFactor) !== null && s !== void 0 ? s : 0.5), this.backoff = new Bn({
      min: this.reconnectionDelay(),
      max: this.reconnectionDelayMax(),
      jitter: this.randomizationFactor()
    }), this.timeout(n.timeout == null ? 2e4 : n.timeout), this._readyState = "closed", this.uri = t;
    const r = n.parser || Lf;
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
    this.engine = new yf(this.uri, this.opts);
    const n = this.engine, s = this;
    this._readyState = "opening", this.skipReconnect = !1;
    const r = It(n, "open", function() {
      s.onopen(), t && t();
    }), i = (l) => {
      this.cleanup(), this._readyState = "closed", this.emitReserved("error", l), t ? t(l) : this.maybeReconnectOnOpen();
    }, o = It(n, "error", i);
    if (this._timeout !== !1) {
      const l = this._timeout, a = this.setTimeoutFn(() => {
        r(), i(new Error("timeout")), n.close();
      }, l);
      this.opts.autoUnref && a.unref(), this.subs.push(() => {
        this.clearTimeoutFn(a);
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
      It(t, "ping", this.onping.bind(this)),
      It(t, "data", this.ondata.bind(this)),
      It(t, "error", this.onerror.bind(this)),
      It(t, "close", this.onclose.bind(this)),
      // @ts-ignore
      It(this.decoder, "decoded", this.ondecoded.bind(this))
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
    Js(() => {
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
    return s ? this._autoConnect && !s.active && s.connect() : (s = new sa(this, t, n), this.nsps[t] = s), s;
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
const jn = {};
function Is(e, t) {
  typeof e == "object" && (t = e, e = void 0), t = t || {};
  const n = bf(e, t.path || "/socket.io"), s = n.source, r = n.id, i = n.path, o = jn[r] && i in jn[r].nsps, l = t.forceNew || t["force new connection"] || t.multiplex === !1 || o;
  let a;
  return l ? a = new Ur(s, t) : (jn[r] || (jn[r] = new Ur(s, t)), a = jn[r]), n.query && !t.query && (t.query = n.queryKey), a.socket(n.path, t);
}
Object.assign(Is, {
  Manager: Ur,
  Socket: sa,
  io: Is,
  connect: Is
});
function Pf() {
  const e = se([]), t = se(!1), n = se(""), s = se(!1), r = se(!1), i = se(!1), o = se("connecting"), l = se(0), a = 5, f = se({}), c = se(null), b = se("");
  let v = null, $ = null, M = null, U = null, re, ie;
  const be = (D) => {
    re = D, D && localStorage.setItem("ctid", D);
  }, we = (D) => {
    ie = D;
  }, z = (D) => {
    const Ye = re || localStorage.getItem("ctid"), de = {};
    return Ye && (de.conversation_token = Ye), ie && (de.widget_id = ie), v = Is(`${on.WS_URL}/widget`, {
      transports: ["websocket"],
      reconnection: !0,
      reconnectionAttempts: a,
      reconnectionDelay: 1e3,
      auth: Object.keys(de).length > 0 ? de : void 0
    }), v.on("connect", () => {
      o.value = "connected", l.value = 0;
    }), v.on("disconnect", () => {
      o.value === "connected" && (console.log("Socket disconnected, setting connection status to connecting"), o.value = "connecting");
    }), v.on("connect_error", () => {
      l.value++, console.error("Socket connection failed, attempt:", l.value, "connection status:", o.value), l.value >= a && (o.value = "failed");
    }), v.on("chat_response", (V) => {
      if (t.value = !1, V.session_id ? (console.log("Captured session_id from chat_response:", V.session_id), b.value = V.session_id) : console.warn("No session_id in chat_response data:", V), V.type === "agent_message") {
        const Ie = {
          message: V.message,
          message_type: "agent",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          session_id: "",
          agent_name: V.agent_name,
          attributes: {
            end_chat: V.end_chat,
            end_chat_reason: V.end_chat_reason,
            end_chat_description: V.end_chat_description,
            request_rating: V.request_rating
          }
        };
        V.attachments && Array.isArray(V.attachments) && (Ie.id = V.message_id, Ie.attachments = V.attachments.map((st, lt) => ({
          id: V.message_id * 1e3 + lt,
          filename: st.filename,
          file_url: st.file_url,
          content_type: st.content_type,
          file_size: st.file_size
        }))), e.value.push(Ie);
      } else V.shopify_output && typeof V.shopify_output == "object" && V.shopify_output.products ? e.value.push({
        message: V.message,
        // Keep the accompanying text message
        message_type: "product",
        // Use 'product' type for rendering
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: "",
        agent_name: V.agent_name,
        // Assign the whole structured object
        shopify_output: V.shopify_output,
        // Remove the old flattened fields (product_id, product_title, etc.)
        attributes: {
          // Keep other attributes if needed
          end_chat: V.end_chat,
          request_rating: V.request_rating
        }
      }) : e.value.push({
        message: V.message,
        message_type: "bot",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: "",
        agent_name: V.agent_name,
        attributes: {
          end_chat: V.end_chat,
          end_chat_reason: V.end_chat_reason,
          end_chat_description: V.end_chat_description,
          request_rating: V.request_rating
        }
      });
    }), v.on("handle_taken_over", (V) => {
      e.value.push({
        message: `${V.user_name} joined the conversation`,
        message_type: "system",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: V.session_id
      }), f.value = {
        ...f.value,
        human_agent_name: V.user_name,
        human_agent_profile_pic: V.profile_picture
      }, $ && $(V);
    }), v.on("session_initialized", (V) => {
      V.session_id && (console.log("Initialized session_id from session_initialized:", V.session_id), b.value = V.session_id);
    }), v.on("error", Be), v.on("chat_history", je), v.on("rating_submitted", fe), v.on("display_form", Ue), v.on("form_submitted", Ve), v.on("workflow_state", Ze), v.on("workflow_proceeded", te), v;
  }, q = async () => {
    try {
      return o.value = "connecting", l.value = 0, v && (v.removeAllListeners(), v.disconnect(), v = null), v = z(""), new Promise((D) => {
        v == null || v.on("connect", () => {
          D(!0);
        }), v == null || v.on("connect_error", () => {
          l.value >= a && D(!1);
        });
      });
    } catch (D) {
      return console.error("Socket initialization failed:", D), o.value = "failed", !1;
    }
  }, H = () => (v && v.disconnect(), q()), K = (D) => {
    $ = D;
  }, Se = (D) => {
    M = D;
  }, We = (D) => {
    U = D;
  }, Be = (D) => {
    t.value = !1, n.value = Ju(D), s.value = !0, setTimeout(() => {
      s.value = !1, n.value = "";
    }, 5e3);
  }, je = (D) => {
    if (D.type === "chat_history" && Array.isArray(D.messages)) {
      const Ye = D.messages.map((de) => {
        var Ie;
        const V = {
          message: de.message,
          message_type: de.message_type,
          created_at: de.created_at,
          session_id: "",
          agent_name: de.agent_name || "",
          user_name: de.user_name || "",
          attributes: de.attributes || {},
          attachments: de.attachments || []
          // Include attachments
        };
        return (Ie = de.attributes) != null && Ie.shopify_output && typeof de.attributes.shopify_output == "object" ? {
          ...V,
          message_type: "product",
          shopify_output: de.attributes.shopify_output
        } : V;
      });
      e.value = [
        ...Ye.filter(
          (de) => !e.value.some(
            (V) => V.message === de.message && V.created_at === de.created_at
          )
        ),
        ...e.value
      ];
    }
  }, fe = (D) => {
    D.success && e.value.push({
      message: "Thank you for your feedback!",
      message_type: "system",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: ""
    });
  }, Ue = (D) => {
    var Ye;
    console.log("Form display handler in composable:", D), t.value = !1, c.value = D.form_data, console.log("Set currentForm in handleDisplayForm:", c.value), ((Ye = D.form_data) == null ? void 0 : Ye.form_full_screen) === !0 ? (console.log("Full screen form detected, triggering workflow state callback"), M && M({
      type: "form",
      form_data: D.form_data,
      session_id: D.session_id
    })) : e.value.push({
      message: "",
      message_type: "form",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: D.session_id,
      attributes: {
        form_data: D.form_data
      }
    });
  }, Ve = (D) => {
    console.log("Form submitted confirmation received, clearing currentForm"), c.value = null, D.success && console.log("Form submitted successfully");
  }, Ze = (D) => {
    console.log("Workflow state received in composable:", D), (D.type === "form" || D.type === "display_form") && (console.log("Setting currentForm from workflow state:", D.form_data), c.value = D.form_data), M && M(D);
  }, te = (D) => {
    console.log("Workflow proceeded in composable:", D), U && U(D);
  };
  return {
    messages: e,
    loading: t,
    errorMessage: n,
    showError: s,
    loadingHistory: r,
    hasStartedChat: i,
    connectionStatus: o,
    sendMessage: async (D, Ye, de = []) => {
      if (!v || !D.trim() && de.length === 0) return;
      f.value.human_agent_name || (t.value = !0);
      const V = {
        message: D,
        message_type: "user",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: ""
      };
      de.length > 0 && (V.attachments = de.map((Ie, st) => {
        let lt = "";
        if (Ie.content_type.startsWith("image/")) {
          const Ot = atob(Ie.content), d = new Array(Ot.length);
          for (let A = 0; A < Ot.length; A++)
            d[A] = Ot.charCodeAt(A);
          const m = new Uint8Array(d), w = new Blob([m], { type: Ie.content_type });
          lt = URL.createObjectURL(w);
        }
        return {
          id: Date.now() * 1e3 + st,
          // Temporary ID
          filename: Ie.filename,
          file_url: lt,
          // Temporary blob URL, will be replaced
          content_type: Ie.content_type,
          file_size: Ie.size,
          _isTemporary: !0
          // Flag to identify temporary attachments
        };
      })), e.value.push(V), v.emit("chat", {
        message: D,
        email: Ye,
        files: de
        // Send files with base64 content
      }), i.value = !0;
    },
    loadChatHistory: async () => {
      if (v)
        try {
          r.value = !0, v.emit("get_chat_history");
        } catch (D) {
          console.error("Failed to load chat history:", D);
        } finally {
          r.value = !1;
        }
    },
    connect: q,
    reconnect: H,
    cleanup: () => {
      v && (v.removeAllListeners(), v.disconnect(), v = null), $ = null, M = null, U = null;
    },
    humanAgent: f,
    onTakeover: K,
    submitRating: async (D, Ye) => {
      !v || !D || v.emit("submit_rating", {
        rating: D,
        feedback: Ye
      });
    },
    currentForm: c,
    submitForm: async (D) => {
      if (console.log("Submitting form in socket:", D), console.log("Current form in socket:", c.value), console.log("Socket in socket:", v), !v) {
        console.error("No socket available for form submission");
        return;
      }
      if (!D || Object.keys(D).length === 0) {
        console.error("No form data to submit");
        return;
      }
      console.log("Emitting submit_form event with data:", D), v.emit("submit_form", {
        form_data: D
      }), c.value = null;
    },
    getWorkflowState: async () => {
      v && (console.log("Getting workflow state 12"), v.emit("get_workflow_state"));
    },
    proceedWorkflow: async () => {
      v && v.emit("proceed_workflow", {});
    },
    onWorkflowState: Se,
    onWorkflowProceeded: We,
    currentSessionId: b,
    setToken: be,
    setWidgetId: we
  };
}
function $f(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var yr = { exports: {} }, Ro;
function Ff() {
  return Ro || (Ro = 1, function(e) {
    (function() {
      function t(u, _, T) {
        return u.call.apply(u.bind, arguments);
      }
      function n(u, _, T) {
        if (!u) throw Error();
        if (2 < arguments.length) {
          var k = Array.prototype.slice.call(arguments, 2);
          return function() {
            var O = Array.prototype.slice.call(arguments);
            return Array.prototype.unshift.apply(O, k), u.apply(_, O);
          };
        }
        return function() {
          return u.apply(_, arguments);
        };
      }
      function s(u, _, T) {
        return s = Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1 ? t : n, s.apply(null, arguments);
      }
      var r = Date.now || function() {
        return +/* @__PURE__ */ new Date();
      };
      function i(u, _) {
        this.a = u, this.o = _ || u, this.c = this.o.document;
      }
      var o = !!window.FontFace;
      function l(u, _, T, k) {
        if (_ = u.c.createElement(_), T) for (var O in T) T.hasOwnProperty(O) && (O == "style" ? _.style.cssText = T[O] : _.setAttribute(O, T[O]));
        return k && _.appendChild(u.c.createTextNode(k)), _;
      }
      function a(u, _, T) {
        u = u.c.getElementsByTagName(_)[0], u || (u = document.documentElement), u.insertBefore(T, u.lastChild);
      }
      function f(u) {
        u.parentNode && u.parentNode.removeChild(u);
      }
      function c(u, _, T) {
        _ = _ || [], T = T || [];
        for (var k = u.className.split(/\s+/), O = 0; O < _.length; O += 1) {
          for (var j = !1, X = 0; X < k.length; X += 1) if (_[O] === k[X]) {
            j = !0;
            break;
          }
          j || k.push(_[O]);
        }
        for (_ = [], O = 0; O < k.length; O += 1) {
          for (j = !1, X = 0; X < T.length; X += 1) if (k[O] === T[X]) {
            j = !0;
            break;
          }
          j || _.push(k[O]);
        }
        u.className = _.join(" ").replace(/\s+/g, " ").replace(/^\s+|\s+$/, "");
      }
      function b(u, _) {
        for (var T = u.className.split(/\s+/), k = 0, O = T.length; k < O; k++) if (T[k] == _) return !0;
        return !1;
      }
      function v(u) {
        return u.o.location.hostname || u.a.location.hostname;
      }
      function $(u, _, T) {
        function k() {
          ve && O && j && (ve(X), ve = null);
        }
        _ = l(u, "link", { rel: "stylesheet", href: _, media: "all" });
        var O = !1, j = !0, X = null, ve = T || null;
        o ? (_.onload = function() {
          O = !0, k();
        }, _.onerror = function() {
          O = !0, X = Error("Stylesheet failed to load"), k();
        }) : setTimeout(function() {
          O = !0, k();
        }, 0), a(u, "head", _);
      }
      function M(u, _, T, k) {
        var O = u.c.getElementsByTagName("head")[0];
        if (O) {
          var j = l(u, "script", { src: _ }), X = !1;
          return j.onload = j.onreadystatechange = function() {
            X || this.readyState && this.readyState != "loaded" && this.readyState != "complete" || (X = !0, T && T(null), j.onload = j.onreadystatechange = null, j.parentNode.tagName == "HEAD" && O.removeChild(j));
          }, O.appendChild(j), setTimeout(function() {
            X || (X = !0, T && T(Error("Script load timeout")));
          }, k || 5e3), j;
        }
        return null;
      }
      function U() {
        this.a = 0, this.c = null;
      }
      function re(u) {
        return u.a++, function() {
          u.a--, be(u);
        };
      }
      function ie(u, _) {
        u.c = _, be(u);
      }
      function be(u) {
        u.a == 0 && u.c && (u.c(), u.c = null);
      }
      function we(u) {
        this.a = u || "-";
      }
      we.prototype.c = function(u) {
        for (var _ = [], T = 0; T < arguments.length; T++) _.push(arguments[T].replace(/[\W_]+/g, "").toLowerCase());
        return _.join(this.a);
      };
      function z(u, _) {
        this.c = u, this.f = 4, this.a = "n";
        var T = (_ || "n4").match(/^([nio])([1-9])$/i);
        T && (this.a = T[1], this.f = parseInt(T[2], 10));
      }
      function q(u) {
        return Se(u) + " " + (u.f + "00") + " 300px " + H(u.c);
      }
      function H(u) {
        var _ = [];
        u = u.split(/,\s*/);
        for (var T = 0; T < u.length; T++) {
          var k = u[T].replace(/['"]/g, "");
          k.indexOf(" ") != -1 || /^\d/.test(k) ? _.push("'" + k + "'") : _.push(k);
        }
        return _.join(",");
      }
      function K(u) {
        return u.a + u.f;
      }
      function Se(u) {
        var _ = "normal";
        return u.a === "o" ? _ = "oblique" : u.a === "i" && (_ = "italic"), _;
      }
      function We(u) {
        var _ = 4, T = "n", k = null;
        return u && ((k = u.match(/(normal|oblique|italic)/i)) && k[1] && (T = k[1].substr(0, 1).toLowerCase()), (k = u.match(/([1-9]00|normal|bold)/i)) && k[1] && (/bold/i.test(k[1]) ? _ = 7 : /[1-9]00/.test(k[1]) && (_ = parseInt(k[1].substr(0, 1), 10)))), T + _;
      }
      function Be(u, _) {
        this.c = u, this.f = u.o.document.documentElement, this.h = _, this.a = new we("-"), this.j = _.events !== !1, this.g = _.classes !== !1;
      }
      function je(u) {
        u.g && c(u.f, [u.a.c("wf", "loading")]), Ue(u, "loading");
      }
      function fe(u) {
        if (u.g) {
          var _ = b(u.f, u.a.c("wf", "active")), T = [], k = [u.a.c("wf", "loading")];
          _ || T.push(u.a.c("wf", "inactive")), c(u.f, T, k);
        }
        Ue(u, "inactive");
      }
      function Ue(u, _, T) {
        u.j && u.h[_] && (T ? u.h[_](T.c, K(T)) : u.h[_]());
      }
      function Ve() {
        this.c = {};
      }
      function Ze(u, _, T) {
        var k = [], O;
        for (O in _) if (_.hasOwnProperty(O)) {
          var j = u.c[O];
          j && k.push(j(_[O], T));
        }
        return k;
      }
      function te(u, _) {
        this.c = u, this.f = _, this.a = l(this.c, "span", { "aria-hidden": "true" }, this.f);
      }
      function ae(u) {
        a(u.c, "body", u.a);
      }
      function J(u) {
        return "display:block;position:absolute;top:-9999px;left:-9999px;font-size:300px;width:auto;height:auto;line-height:normal;margin:0;padding:0;font-variant:normal;white-space:nowrap;font-family:" + H(u.c) + ";" + ("font-style:" + Se(u) + ";font-weight:" + (u.f + "00") + ";");
      }
      function Ge(u, _, T, k, O, j) {
        this.g = u, this.j = _, this.a = k, this.c = T, this.f = O || 3e3, this.h = j || void 0;
      }
      Ge.prototype.start = function() {
        var u = this.c.o.document, _ = this, T = r(), k = new Promise(function(X, ve) {
          function xe() {
            r() - T >= _.f ? ve() : u.fonts.load(q(_.a), _.h).then(function(Ne) {
              1 <= Ne.length ? X() : setTimeout(xe, 25);
            }, function() {
              ve();
            });
          }
          xe();
        }), O = null, j = new Promise(function(X, ve) {
          O = setTimeout(ve, _.f);
        });
        Promise.race([j, k]).then(function() {
          O && (clearTimeout(O), O = null), _.g(_.a);
        }, function() {
          _.j(_.a);
        });
      };
      function me(u, _, T, k, O, j, X) {
        this.v = u, this.B = _, this.c = T, this.a = k, this.s = X || "BESbswy", this.f = {}, this.w = O || 3e3, this.u = j || null, this.m = this.j = this.h = this.g = null, this.g = new te(this.c, this.s), this.h = new te(this.c, this.s), this.j = new te(this.c, this.s), this.m = new te(this.c, this.s), u = new z(this.a.c + ",serif", K(this.a)), u = J(u), this.g.a.style.cssText = u, u = new z(this.a.c + ",sans-serif", K(this.a)), u = J(u), this.h.a.style.cssText = u, u = new z("serif", K(this.a)), u = J(u), this.j.a.style.cssText = u, u = new z("sans-serif", K(this.a)), u = J(u), this.m.a.style.cssText = u, ae(this.g), ae(this.h), ae(this.j), ae(this.m);
      }
      var Oe = { D: "serif", C: "sans-serif" }, Me = null;
      function ot() {
        if (Me === null) {
          var u = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent);
          Me = !!u && (536 > parseInt(u[1], 10) || parseInt(u[1], 10) === 536 && 11 >= parseInt(u[2], 10));
        }
        return Me;
      }
      me.prototype.start = function() {
        this.f.serif = this.j.a.offsetWidth, this.f["sans-serif"] = this.m.a.offsetWidth, this.A = r(), Ye(this);
      };
      function D(u, _, T) {
        for (var k in Oe) if (Oe.hasOwnProperty(k) && _ === u.f[Oe[k]] && T === u.f[Oe[k]]) return !0;
        return !1;
      }
      function Ye(u) {
        var _ = u.g.a.offsetWidth, T = u.h.a.offsetWidth, k;
        (k = _ === u.f.serif && T === u.f["sans-serif"]) || (k = ot() && D(u, _, T)), k ? r() - u.A >= u.w ? ot() && D(u, _, T) && (u.u === null || u.u.hasOwnProperty(u.a.c)) ? V(u, u.v) : V(u, u.B) : de(u) : V(u, u.v);
      }
      function de(u) {
        setTimeout(s(function() {
          Ye(this);
        }, u), 50);
      }
      function V(u, _) {
        setTimeout(s(function() {
          f(this.g.a), f(this.h.a), f(this.j.a), f(this.m.a), _(this.a);
        }, u), 0);
      }
      function Ie(u, _, T) {
        this.c = u, this.a = _, this.f = 0, this.m = this.j = !1, this.s = T;
      }
      var st = null;
      Ie.prototype.g = function(u) {
        var _ = this.a;
        _.g && c(_.f, [_.a.c("wf", u.c, K(u).toString(), "active")], [_.a.c("wf", u.c, K(u).toString(), "loading"), _.a.c("wf", u.c, K(u).toString(), "inactive")]), Ue(_, "fontactive", u), this.m = !0, lt(this);
      }, Ie.prototype.h = function(u) {
        var _ = this.a;
        if (_.g) {
          var T = b(_.f, _.a.c("wf", u.c, K(u).toString(), "active")), k = [], O = [_.a.c("wf", u.c, K(u).toString(), "loading")];
          T || k.push(_.a.c("wf", u.c, K(u).toString(), "inactive")), c(_.f, k, O);
        }
        Ue(_, "fontinactive", u), lt(this);
      };
      function lt(u) {
        --u.f == 0 && u.j && (u.m ? (u = u.a, u.g && c(u.f, [u.a.c("wf", "active")], [u.a.c("wf", "loading"), u.a.c("wf", "inactive")]), Ue(u, "active")) : fe(u.a));
      }
      function Ot(u) {
        this.j = u, this.a = new Ve(), this.h = 0, this.f = this.g = !0;
      }
      Ot.prototype.load = function(u) {
        this.c = new i(this.j, u.context || this.j), this.g = u.events !== !1, this.f = u.classes !== !1, m(this, new Be(this.c, u), u);
      };
      function d(u, _, T, k, O) {
        var j = --u.h == 0;
        (u.f || u.g) && setTimeout(function() {
          var X = O || null, ve = k || null || {};
          if (T.length === 0 && j) fe(_.a);
          else {
            _.f += T.length, j && (_.j = j);
            var xe, Ne = [];
            for (xe = 0; xe < T.length; xe++) {
              var De = T[xe], et = ve[De.c], at = _.a, Wt = De;
              if (at.g && c(at.f, [at.a.c("wf", Wt.c, K(Wt).toString(), "loading")]), Ue(at, "fontloading", Wt), at = null, st === null) if (window.FontFace) {
                var Wt = /Gecko.*Firefox\/(\d+)/.exec(window.navigator.userAgent), hs = /OS X.*Version\/10\..*Safari/.exec(window.navigator.userAgent) && /Apple/.exec(window.navigator.vendor);
                st = Wt ? 42 < parseInt(Wt[1], 10) : !hs;
              } else st = !1;
              st ? at = new Ge(s(_.g, _), s(_.h, _), _.c, De, _.s, et) : at = new me(s(_.g, _), s(_.h, _), _.c, De, _.s, X, et), Ne.push(at);
            }
            for (xe = 0; xe < Ne.length; xe++) Ne[xe].start();
          }
        }, 0);
      }
      function m(u, _, T) {
        var O = [], k = T.timeout;
        je(_);
        var O = Ze(u.a, T, u.c), j = new Ie(u.c, _, k);
        for (u.h = O.length, _ = 0, T = O.length; _ < T; _++) O[_].load(function(X, ve, xe) {
          d(u, j, X, ve, xe);
        });
      }
      function w(u, _) {
        this.c = u, this.a = _;
      }
      w.prototype.load = function(u) {
        function _() {
          if (j["__mti_fntLst" + k]) {
            var X = j["__mti_fntLst" + k](), ve = [], xe;
            if (X) for (var Ne = 0; Ne < X.length; Ne++) {
              var De = X[Ne].fontfamily;
              X[Ne].fontStyle != null && X[Ne].fontWeight != null ? (xe = X[Ne].fontStyle + X[Ne].fontWeight, ve.push(new z(De, xe))) : ve.push(new z(De));
            }
            u(ve);
          } else setTimeout(function() {
            _();
          }, 50);
        }
        var T = this, k = T.a.projectId, O = T.a.version;
        if (k) {
          var j = T.c.o;
          M(this.c, (T.a.api || "https://fast.fonts.net/jsapi") + "/" + k + ".js" + (O ? "?v=" + O : ""), function(X) {
            X ? u([]) : (j["__MonotypeConfiguration__" + k] = function() {
              return T.a;
            }, _());
          }).id = "__MonotypeAPIScript__" + k;
        } else u([]);
      };
      function A(u, _) {
        this.c = u, this.a = _;
      }
      A.prototype.load = function(u) {
        var _, T, k = this.a.urls || [], O = this.a.families || [], j = this.a.testStrings || {}, X = new U();
        for (_ = 0, T = k.length; _ < T; _++) $(this.c, k[_], re(X));
        var ve = [];
        for (_ = 0, T = O.length; _ < T; _++) if (k = O[_].split(":"), k[1]) for (var xe = k[1].split(","), Ne = 0; Ne < xe.length; Ne += 1) ve.push(new z(k[0], xe[Ne]));
        else ve.push(new z(k[0]));
        ie(X, function() {
          u(ve, j);
        });
      };
      function S(u, _) {
        u ? this.c = u : this.c = R, this.a = [], this.f = [], this.g = _ || "";
      }
      var R = "https://fonts.googleapis.com/css";
      function F(u, _) {
        for (var T = _.length, k = 0; k < T; k++) {
          var O = _[k].split(":");
          O.length == 3 && u.f.push(O.pop());
          var j = "";
          O.length == 2 && O[1] != "" && (j = ":"), u.a.push(O.join(j));
        }
      }
      function B(u) {
        if (u.a.length == 0) throw Error("No fonts to load!");
        if (u.c.indexOf("kit=") != -1) return u.c;
        for (var _ = u.a.length, T = [], k = 0; k < _; k++) T.push(u.a[k].replace(/ /g, "+"));
        return _ = u.c + "?family=" + T.join("%7C"), 0 < u.f.length && (_ += "&subset=" + u.f.join(",")), 0 < u.g.length && (_ += "&text=" + encodeURIComponent(u.g)), _;
      }
      function P(u) {
        this.f = u, this.a = [], this.c = {};
      }
      var L = { latin: "BESbswy", "latin-ext": "çöüğş", cyrillic: "йяЖ", greek: "αβΣ", khmer: "កខគ", Hanuman: "កខគ" }, G = { thin: "1", extralight: "2", "extra-light": "2", ultralight: "2", "ultra-light": "2", light: "3", regular: "4", book: "4", medium: "5", "semi-bold": "6", semibold: "6", "demi-bold": "6", demibold: "6", bold: "7", "extra-bold": "8", extrabold: "8", "ultra-bold": "8", ultrabold: "8", black: "9", heavy: "9", l: "3", r: "4", b: "7" }, N = { i: "i", italic: "i", n: "n", normal: "n" }, W = /^(thin|(?:(?:extra|ultra)-?)?light|regular|book|medium|(?:(?:semi|demi|extra|ultra)-?)?bold|black|heavy|l|r|b|[1-9]00)?(n|i|normal|italic)?$/;
      function Y(u) {
        for (var _ = u.f.length, T = 0; T < _; T++) {
          var k = u.f[T].split(":"), O = k[0].replace(/\+/g, " "), j = ["n4"];
          if (2 <= k.length) {
            var X, ve = k[1];
            if (X = [], ve) for (var ve = ve.split(","), xe = ve.length, Ne = 0; Ne < xe; Ne++) {
              var De;
              if (De = ve[Ne], De.match(/^[\w-]+$/)) {
                var et = W.exec(De.toLowerCase());
                if (et == null) De = "";
                else {
                  if (De = et[2], De = De == null || De == "" ? "n" : N[De], et = et[1], et == null || et == "") et = "4";
                  else var at = G[et], et = at || (isNaN(et) ? "4" : et.substr(0, 1));
                  De = [De, et].join("");
                }
              } else De = "";
              De && X.push(De);
            }
            0 < X.length && (j = X), k.length == 3 && (k = k[2], X = [], k = k ? k.split(",") : X, 0 < k.length && (k = L[k[0]]) && (u.c[O] = k));
          }
          for (u.c[O] || (k = L[O]) && (u.c[O] = k), k = 0; k < j.length; k += 1) u.a.push(new z(O, j[k]));
        }
      }
      function ce(u, _) {
        this.c = u, this.a = _;
      }
      var pe = { Arimo: !0, Cousine: !0, Tinos: !0 };
      ce.prototype.load = function(u) {
        var _ = new U(), T = this.c, k = new S(this.a.api, this.a.text), O = this.a.families;
        F(k, O);
        var j = new P(O);
        Y(j), $(T, B(k), re(_)), ie(_, function() {
          u(j.a, j.c, pe);
        });
      };
      function _e(u, _) {
        this.c = u, this.a = _;
      }
      _e.prototype.load = function(u) {
        var _ = this.a.id, T = this.c.o;
        _ ? M(this.c, (this.a.api || "https://use.typekit.net") + "/" + _ + ".js", function(k) {
          if (k) u([]);
          else if (T.Typekit && T.Typekit.config && T.Typekit.config.fn) {
            k = T.Typekit.config.fn;
            for (var O = [], j = 0; j < k.length; j += 2) for (var X = k[j], ve = k[j + 1], xe = 0; xe < ve.length; xe++) O.push(new z(X, ve[xe]));
            try {
              T.Typekit.load({ events: !1, classes: !1, async: !0 });
            } catch {
            }
            u(O);
          }
        }, 2e3) : u([]);
      };
      function Xe(u, _) {
        this.c = u, this.f = _, this.a = [];
      }
      Xe.prototype.load = function(u) {
        var _ = this.f.id, T = this.c.o, k = this;
        _ ? (T.__webfontfontdeckmodule__ || (T.__webfontfontdeckmodule__ = {}), T.__webfontfontdeckmodule__[_] = function(O, j) {
          for (var X = 0, ve = j.fonts.length; X < ve; ++X) {
            var xe = j.fonts[X];
            k.a.push(new z(xe.name, We("font-weight:" + xe.weight + ";font-style:" + xe.style)));
          }
          u(k.a);
        }, M(this.c, (this.f.api || "https://f.fontdeck.com/s/css/js/") + v(this.c) + "/" + _ + ".js", function(O) {
          O && u([]);
        })) : u([]);
      };
      var ke = new Ot(window);
      ke.a.c.custom = function(u, _) {
        return new A(_, u);
      }, ke.a.c.fontdeck = function(u, _) {
        return new Xe(_, u);
      }, ke.a.c.monotype = function(u, _) {
        return new w(_, u);
      }, ke.a.c.typekit = function(u, _) {
        return new _e(_, u);
      }, ke.a.c.google = function(u, _) {
        return new ce(_, u);
      };
      var ft = { load: s(ke.load, ke) };
      e.exports ? e.exports = ft : (window.WebFont = ft, window.WebFontConfig && ke.load(window.WebFontConfig));
    })();
  }(yr)), yr.exports;
}
var Bf = Ff();
const Nf = /* @__PURE__ */ $f(Bf);
function Mf() {
  const e = se({}), t = se(""), n = (r) => {
    e.value = r, r.photo_url && (e.value.photo_url = r.photo_url), r.font_family && Nf.load({
      google: {
        families: [r.font_family]
      },
      active: () => {
        const i = document.querySelector(".chat-container");
        i && (i.style.fontFamily = `"${r.font_family}", system-ui, sans-serif`);
      }
    }), window.parent.postMessage({
      type: "CUSTOMIZATION_UPDATE",
      data: {
        chat_bubble_color: r.chat_bubble_color || "#f34611",
        chat_style: r.chat_style,
        chat_initiation_messages: r.chat_initiation_messages || []
      }
    }, "*");
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
function Df() {
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
      const i = r ? e[r] || r : "", o = typeof s == "string" ? s : s.toString();
      return i ? `${i}${o}` : o;
    },
    getCurrencySymbol: (s) => e[s] || s,
    currencySymbols: e
  };
}
const qf = {
  key: 0,
  class: "widget-unavailable-overlay"
}, Uf = {
  key: 1,
  class: "auth-error-overlay"
}, zf = { class: "auth-error-card" }, Hf = { class: "auth-error-message" }, Wf = {
  key: 0,
  class: "initializing-overlay"
}, jf = {
  key: 0,
  class: "connecting-message"
}, Vf = {
  key: 1,
  class: "failed-message"
}, Kf = { class: "welcome-content" }, Zf = { class: "welcome-header" }, Gf = ["src", "alt"], Yf = { class: "welcome-title" }, Xf = { class: "welcome-subtitle" }, Jf = { class: "welcome-input-container" }, Qf = {
  key: 0,
  class: "email-input"
}, ed = ["disabled"], td = { class: "welcome-message-input" }, nd = ["placeholder", "disabled"], sd = ["disabled"], rd = { class: "landing-page-content" }, id = { class: "landing-page-header" }, od = { class: "landing-page-heading" }, ld = { class: "landing-page-text" }, ad = { class: "landing-page-actions" }, cd = { class: "form-fullscreen-content" }, ud = {
  key: 0,
  class: "form-header"
}, hd = {
  key: 0,
  class: "form-title"
}, fd = {
  key: 1,
  class: "form-description"
}, dd = { class: "form-fields" }, pd = ["for"], gd = {
  key: 0,
  class: "required-indicator"
}, md = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "autocomplete", "inputmode"], _d = ["id", "placeholder", "required", "min", "max", "value", "onInput"], vd = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput"], yd = ["id", "required", "value", "onChange"], bd = { value: "" }, wd = ["value"], kd = {
  key: 4,
  class: "checkbox-field"
}, xd = ["id", "required", "checked", "onChange"], Sd = { class: "checkbox-label" }, Cd = {
  key: 5,
  class: "radio-group"
}, Td = ["name", "value", "required", "checked", "onChange"], Ad = { class: "radio-label" }, Ed = {
  key: 6,
  class: "field-error"
}, Rd = { class: "form-actions" }, Id = ["disabled"], Ld = {
  key: 0,
  class: "loading-spinner-inline"
}, Od = { key: 1 }, Pd = { class: "header-content" }, $d = ["src", "alt"], Fd = { class: "header-info" }, Bd = { class: "status" }, Nd = { class: "ask-anything-header" }, Md = ["src", "alt"], Dd = { class: "header-info" }, qd = {
  key: 2,
  class: "loading-history"
}, Ud = {
  key: 0,
  class: "rating-content"
}, zd = { class: "rating-prompt" }, Hd = ["onMouseover", "onMouseleave", "onClick", "disabled"], Wd = {
  key: 0,
  class: "feedback-wrapper"
}, jd = { class: "feedback-section" }, Vd = ["onUpdate:modelValue", "disabled"], Kd = { class: "feedback-counter" }, Zd = ["onClick", "disabled"], Gd = {
  key: 1,
  class: "submitted-feedback-wrapper"
}, Yd = { class: "submitted-feedback" }, Xd = { class: "submitted-feedback-text" }, Jd = {
  key: 2,
  class: "submitted-message"
}, Qd = {
  key: 1,
  class: "form-content"
}, ep = {
  key: 0,
  class: "form-header"
}, tp = {
  key: 0,
  class: "form-title"
}, np = {
  key: 1,
  class: "form-description"
}, sp = { class: "form-fields" }, rp = ["for"], ip = {
  key: 0,
  class: "required-indicator"
}, op = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "disabled", "autocomplete", "inputmode"], lp = ["id", "placeholder", "required", "min", "max", "value", "onInput", "disabled"], ap = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "disabled"], cp = ["id", "required", "value", "onChange", "disabled"], up = { value: "" }, hp = ["value"], fp = {
  key: 4,
  class: "checkbox-field"
}, dp = ["id", "checked", "onChange", "disabled"], pp = ["for"], gp = {
  key: 5,
  class: "radio-field"
}, mp = ["id", "name", "value", "checked", "onChange", "disabled"], _p = ["for"], vp = {
  key: 6,
  class: "field-error"
}, yp = { class: "form-actions" }, bp = ["onClick", "disabled"], wp = {
  key: 2,
  class: "user-input-content"
}, kp = {
  key: 0,
  class: "user-input-prompt"
}, xp = {
  key: 1,
  class: "user-input-form"
}, Sp = ["onUpdate:modelValue", "onKeydown"], Cp = ["onClick", "disabled"], Tp = {
  key: 2,
  class: "user-input-submitted"
}, Ap = {
  key: 0,
  class: "user-input-confirmation"
}, Ep = {
  key: 3,
  class: "product-message-container"
}, Rp = ["innerHTML"], Ip = {
  key: 1,
  class: "products-carousel"
}, Lp = { class: "carousel-items" }, Op = {
  key: 0,
  class: "product-image-compact"
}, Pp = ["src", "alt"], $p = { class: "product-info-compact" }, Fp = { class: "product-text-area" }, Bp = { class: "product-title-compact" }, Np = {
  key: 0,
  class: "product-variant-compact"
}, Mp = { class: "product-price-compact" }, Dp = { class: "product-actions-compact" }, qp = ["onClick"], Up = {
  key: 2,
  class: "no-products-message"
}, zp = {
  key: 3,
  class: "no-products-message"
}, Hp = ["innerHTML"], Wp = {
  key: 0,
  class: "message-attachments"
}, jp = {
  key: 0,
  class: "attachment-image-container"
}, Vp = ["src", "alt", "onClick"], Kp = { class: "attachment-image-info" }, Zp = ["href"], Gp = { class: "attachment-size" }, Yp = ["href"], Xp = { class: "attachment-size" }, Jp = { class: "message-info" }, Qp = {
  key: 0,
  class: "agent-name"
}, eg = {
  key: 0,
  class: "typing-indicator"
}, tg = {
  key: 0,
  class: "email-input"
}, ng = ["disabled"], sg = {
  key: 1,
  class: "file-previews-widget"
}, rg = {
  class: "file-preview-content-widget",
  style: { cursor: "pointer" }
}, ig = ["src", "alt", "onClick"], og = ["onClick"], lg = { class: "file-preview-info-widget" }, ag = { class: "file-preview-name-widget" }, cg = { class: "file-preview-size-widget" }, ug = ["onClick"], hg = {
  key: 2,
  class: "upload-progress-widget"
}, fg = { class: "message-input" }, dg = ["placeholder", "disabled"], pg = ["disabled", "title"], gg = ["disabled"], mg = { class: "conversation-ended-message" }, _g = {
  key: 7,
  class: "rating-dialog"
}, vg = { class: "rating-content" }, yg = { class: "star-rating" }, bg = ["onClick"], wg = { class: "rating-actions" }, kg = ["disabled"], xg = {
  key: 0,
  class: "preview-modal-image-container"
}, Sg = ["src", "alt"], Cg = { class: "preview-modal-filename" }, Tg = {
  key: 3,
  class: "widget-loading"
}, Vn = "ctid", Io = 3, Ag = "image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls", Eg = /* @__PURE__ */ bc({
  __name: "WidgetBuilder",
  props: {
    widgetId: {},
    token: {},
    initialAuthError: {}
  },
  setup(e) {
    var Ei;
    ye.setOptions({
      renderer: new ye.Renderer(),
      gfm: !0,
      breaks: !0
    });
    const t = new ye.Renderer(), n = t.link;
    t.link = (p, g, h) => n.call(t, p, g, h).replace(/^<a /, '<a target="_blank" rel="nofollow" '), ye.use({ renderer: t });
    const s = e, r = Ke(() => {
      var p;
      return s.widgetId || ((p = window.__INITIAL_DATA__) == null ? void 0 : p.widgetId);
    }), {
      customization: i,
      agentName: o,
      applyCustomization: l,
      initializeFromData: a
    } = Mf(), { formatCurrency: f } = Df(), {
      messages: c,
      loading: b,
      errorMessage: v,
      showError: $,
      loadingHistory: M,
      hasStartedChat: U,
      connectionStatus: re,
      sendMessage: ie,
      loadChatHistory: be,
      connect: we,
      reconnect: z,
      cleanup: q,
      humanAgent: H,
      onTakeover: K,
      submitRating: Se,
      submitForm: We,
      currentForm: Be,
      getWorkflowState: je,
      proceedWorkflow: fe,
      onWorkflowState: Ue,
      onWorkflowProceeded: Ve,
      currentSessionId: Ze,
      setToken: te,
      setWidgetId: ae
    } = Pf(), J = se(""), Ge = se(!0), me = se(""), Oe = se(!1), Me = (p) => {
      const g = p.target;
      J.value = g.value;
    };
    let ot = null;
    const D = () => {
      ot && ot.disconnect(), ot = new MutationObserver((g) => {
        let h = !1, Z = !1;
        g.forEach((ue) => {
          if (ue.type === "childList") {
            const Q = Array.from(ue.addedNodes).some(
              (he) => {
                var Rt;
                return he.nodeType === Node.ELEMENT_NODE && (he.matches("input, textarea") || ((Rt = he.querySelector) == null ? void 0 : Rt.call(he, "input, textarea")));
              }
            ), Le = Array.from(ue.removedNodes).some(
              (he) => {
                var Rt;
                return he.nodeType === Node.ELEMENT_NODE && (he.matches("input, textarea") || ((Rt = he.querySelector) == null ? void 0 : Rt.call(he, "input, textarea")));
              }
            );
            Q && (Z = !0, h = !0), Le && (h = !0);
          }
        }), h && (clearTimeout(D.timeoutId), D.timeoutId = setTimeout(() => {
          de();
        }, Z ? 50 : 100));
      });
      const p = document.querySelector(".widget-container") || document.body;
      ot.observe(p, {
        childList: !0,
        subtree: !0
      });
    };
    D.timeoutId = null;
    let Ye = [];
    const de = () => {
      V();
      const p = [
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
      let g = [];
      for (const h of p) {
        const Z = document.querySelectorAll(h);
        if (Z.length > 0) {
          g = Array.from(Z);
          break;
        }
      }
      g.length !== 0 && (Ye = g, g.forEach((h) => {
        h.addEventListener("input", Ie, !0), h.addEventListener("keyup", Ie, !0), h.addEventListener("change", Ie, !0), h.addEventListener("keypress", st, !0), h.addEventListener("keydown", lt, !0);
      }));
    }, V = () => {
      Ye.forEach((p) => {
        p.removeEventListener("input", Ie), p.removeEventListener("keyup", Ie), p.removeEventListener("change", Ie), p.removeEventListener("keypress", st), p.removeEventListener("keydown", lt);
      }), Ye = [];
    }, Ie = (p) => {
      const g = p.target;
      J.value = g.value;
    }, st = (p) => {
      p.key === "Enter" && !p.shiftKey && (p.preventDefault(), p.stopPropagation(), Nn());
    }, lt = (p) => {
      p.key === "Enter" && !p.shiftKey && (p.preventDefault(), p.stopPropagation(), Nn());
    }, Ot = (p) => {
      const g = p.target, h = document.querySelector(".header-menu-container");
      document.querySelector(".header-menu-btn");
      const Z = document.querySelector(".header-dropdown-menu");
      Z && !(h != null && h.contains(g)) && (Z.style.display = "none");
    }, d = se(!0), m = (p) => !p || p === "undefined" || p === "null" || typeof p == "string" && p.trim() === "" ? null : p, w = se(m(((Ei = window.__INITIAL_DATA__) == null ? void 0 : Ei.initialToken) || localStorage.getItem(Vn)));
    Ke(() => !!w.value);
    const A = se(null), S = se(!1), R = se(!1);
    s.initialAuthError && (A.value = s.initialAuthError, S.value = !0, d.value = !1), a();
    const F = window.__INITIAL_DATA__;
    if (F != null && F.initialToken) {
      const p = m(F.initialToken);
      p && (w.value = p, window.parent.postMessage({
        type: "TOKEN_UPDATE",
        token: p
      }, "*"), Oe.value = !0);
    }
    const B = se(!1);
    (F == null ? void 0 : F.allowAttachments) !== void 0 && (B.value = F.allowAttachments);
    const P = se(null), {
      chatStyles: L,
      chatIconStyles: G,
      agentBubbleStyles: N,
      userBubbleStyles: W,
      messageNameStyles: Y,
      headerBorderStyles: ce,
      photoUrl: pe,
      shadowStyle: _e
    } = Fh(i), Xe = se(null), {
      uploadedAttachments: ke,
      previewModal: ft,
      previewFile: u,
      formatFileSize: _,
      isImageAttachment: T,
      getDownloadUrl: k,
      getPreviewUrl: O,
      handleFileSelect: j,
      handleDrop: X,
      handleDragOver: ve,
      handleDragLeave: xe,
      handlePaste: Ne,
      removeAttachment: De,
      openPreview: et,
      closePreview: at,
      openFilePicker: Wt,
      isImage: hs
    } = Mh(w, Xe);
    Ke(() => c.value.some(
      (p) => p.message_type === "form" && (!p.isSubmitted || p.isSubmitted === !1)
    ));
    const kn = Ke(() => {
      var p;
      return U.value && Oe.value || xt.value ? re.value === "connected" && !b.value : zn(me.value.trim()) && re.value === "connected" && !b.value || ((p = window.__INITIAL_DATA__) == null ? void 0 : p.workflow);
    }), bi = Ke(() => re.value === "connected" ? xt.value ? "Ask me anything..." : "Type a message..." : "Connecting..."), Nn = async () => {
      if (!J.value.trim() && ke.value.length === 0) return;
      !U.value && me.value && await fs();
      const p = ke.value.map((h) => ({
        content: h.content,
        // base64 content
        filename: h.filename,
        content_type: h.type,
        size: h.size
      }));
      await ie(J.value, me.value, p), ke.value.forEach((h) => {
        h.url && h.url.startsWith("blob:") && URL.revokeObjectURL(h.url), h.file_url && h.file_url.startsWith("blob:") && URL.revokeObjectURL(h.file_url);
      }), J.value = "", ke.value = [];
      const g = document.querySelector('input[placeholder*="Type a message"]');
      g && (g.value = ""), setTimeout(() => {
        de();
      }, 500);
    }, wi = (p) => {
      p.key === "Enter" && !p.shiftKey && (p.preventDefault(), p.stopPropagation(), Nn());
    }, fs = async () => {
      var p, g, h, Z;
      try {
        if (!r.value)
          return console.error("Widget ID is not available"), A.value = "Widget ID is not available. Please refresh and try again.", S.value = !0, !1;
        const ue = new URL(`${on.API_URL}/widgets/${r.value}`);
        me.value.trim() && zn(me.value.trim()) && ue.searchParams.append("email", me.value.trim());
        const Q = {
          Accept: "application/json",
          "Content-Type": "application/json"
        };
        w.value && (Q.Authorization = `Bearer ${w.value}`);
        const Le = await fetch(ue, {
          headers: Q
        });
        if (Le.status === 401) {
          Oe.value = !1;
          try {
            const Cn = (await Le.json()).detail || "";
            (Cn.includes("generate-token") || Cn.includes("API key") || Cn.includes("Token required")) && (R.value = !0, A.value = "Widget authentication not configured. Please contact the website administrator.", S.value = !0, localStorage.removeItem(Vn), w.value = null);
          } catch {
            A.value = "Authentication required. Your token has expired or is invalid. Please refresh the page.", S.value = !0, localStorage.removeItem(Vn), w.value = null;
          }
          return !1;
        }
        if (!Le.ok) {
          try {
            const Dn = await Le.json();
            A.value = Dn.detail || `Error: ${Le.statusText}`;
          } catch {
            A.value = `Error: ${Le.statusText}. Please try again.`;
          }
          return S.value = !0, !1;
        }
        const he = await Le.json();
        return he.token && (w.value = he.token, localStorage.setItem(Vn, he.token), window.parent.postMessage({ type: "TOKEN_UPDATE", token: he.token }, "*")), Oe.value = !0, A.value = null, S.value = !1, te(w.value || void 0), await we() ? (await la(), (p = he.agent) != null && p.customization && l(he.agent.customization), he.agent && !(he != null && he.human_agent) && (o.value = he.agent.name), he != null && he.human_agent && (H.value = he.human_agent), ((g = he.agent) == null ? void 0 : g.allow_attachments) !== void 0 && (B.value = he.agent.allow_attachments), ((h = he.agent) == null ? void 0 : h.workflow) !== void 0 && (window.__INITIAL_DATA__ = window.__INITIAL_DATA__ || {}, window.__INITIAL_DATA__.workflow = he.agent.workflow), (Z = he.agent) != null && Z.workflow && await je(), !0) : (console.error("Failed to connect to chat service"), A.value = "Failed to connect to chat service. Please try again.", S.value = !0, !1);
      } catch (ue) {
        return console.error("Error checking authorization:", ue), A.value = "An unexpected error occurred. Please try again.", S.value = !0, Oe.value = !1, !1;
      } finally {
        d.value = !1;
      }
    }, la = async () => {
      !U.value && Oe.value && (U.value = !0, await be());
    }, er = () => {
      P.value && (P.value.scrollTop = P.value.scrollHeight);
    };
    vn(() => c.value, (p) => {
      nl(() => {
        er();
      });
    }, { deep: !0 }), vn(re, (p, g) => {
      p === "connected" && g !== "connected" && setTimeout(de, 100);
    }), vn(() => c.value.length, (p, g) => {
      p > 0 && g === 0 && setTimeout(de, 100);
    }), vn(() => c.value, (p) => {
      if (p.length > 0) {
        const g = p[p.length - 1];
        ca(g);
      }
    }, { deep: !0 });
    const aa = async () => {
      await z() && await fs();
    }, ki = se(!1), ds = se(0), tr = se(""), Pt = se(0), $t = se(!1), tt = se({}), rt = se(!1), nt = se({}), xn = se(!1), Mn = se(null), xi = se("Start Chat"), Sn = se(!1), dt = se(null);
    Ke(() => {
      var g;
      const p = c.value[c.value.length - 1];
      return ((g = p == null ? void 0 : p.attributes) == null ? void 0 : g.request_rating) || !1;
    });
    const Si = Ke(() => {
      var g;
      if (!((g = window.__INITIAL_DATA__) != null && g.workflow))
        return !1;
      const p = c.value.find((h) => h.message_type === "rating");
      return (p == null ? void 0 : p.isSubmitted) === !0;
    }), ps = Ke(() => H.value.human_agent_profile_pic ? H.value.human_agent_profile_pic.includes("amazonaws.com") ? H.value.human_agent_profile_pic : `${on.API_URL}${H.value.human_agent_profile_pic}` : ""), ca = async (p) => {
      var g, h, Z, ue, Q;
      try {
        if (p.session_id && w.value && r.value) {
          const Le = new URL(`${on.API_URL}/widgets/${r.value}/end-chat`);
          Le.searchParams.append("session_id", p.session_id), (g = p.attributes) != null && g.end_chat_reason && Le.searchParams.append("reason", p.attributes.end_chat_reason), (h = p.attributes) != null && h.end_chat_description && Le.searchParams.append("description", p.attributes.end_chat_description);
          const he = await fetch(Le, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${w.value}`,
              "Content-Type": "application/json"
            }
          });
          if (he.ok) {
            const Rt = await he.json();
            console.info(`✓ Chat session closed on backend: ${Rt.session_id}`);
          } else
            console.warn(`Failed to close session on backend: ${he.status}`);
        }
      } catch (Le) {
        console.error("Error calling end-chat API:", Le);
      }
      if ((Z = p.attributes) != null && Z.end_chat && ((ue = p.attributes) != null && ue.request_rating)) {
        const Le = p.agent_name || ((Q = H.value) == null ? void 0 : Q.human_agent_name) || o.value || "our agent";
        c.value.push({
          message: `Rate the chat session that you had with ${Le}`,
          message_type: "rating",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          session_id: p.session_id,
          agent_name: Le,
          showFeedback: !1
        }), Ze.value = p.session_id;
      }
    }, ua = (p) => {
      $t.value || (Pt.value = p);
    }, ha = () => {
      if (!$t.value) {
        const p = c.value[c.value.length - 1];
        Pt.value = (p == null ? void 0 : p.selectedRating) || 0;
      }
    }, fa = async (p) => {
      if (!$t.value) {
        Pt.value = p;
        const g = c.value[c.value.length - 1];
        g && g.message_type === "rating" && (g.showFeedback = !0, g.selectedRating = p);
      }
    }, da = async (p, g, h = null) => {
      try {
        $t.value = !0, await Se(g, h);
        const Z = c.value.find((ue) => ue.message_type === "rating");
        Z && (Z.isSubmitted = !0, Z.finalRating = g, Z.finalFeedback = h);
      } catch (Z) {
        console.error("Failed to submit rating:", Z);
      } finally {
        $t.value = !1;
      }
    }, pa = (p) => {
      const g = {};
      for (const h of p.fields) {
        const Z = tt.value[h.name], ue = nr(h, Z);
        ue && (g[h.name] = ue);
      }
      return nt.value = g, Object.keys(g).length === 0;
    }, ga = async (p) => {
      if (!(rt.value || !pa(p)))
        try {
          rt.value = !0, await We(tt.value);
          const h = c.value.findIndex(
            (Z) => Z.message_type === "form" && (!Z.isSubmitted || Z.isSubmitted === !1)
          );
          h !== -1 && c.value.splice(h, 1), tt.value = {}, nt.value = {};
        } catch (h) {
          console.error("Failed to submit form:", h);
        } finally {
          rt.value = !1;
        }
    }, vt = (p, g) => {
      var h, Z;
      if (tt.value[p] = g, g && g.toString().trim() !== "") {
        let ue = null;
        if ((h = dt.value) != null && h.fields && (ue = dt.value.fields.find((Q) => Q.name === p)), !ue && ((Z = Be.value) != null && Z.fields) && (ue = Be.value.fields.find((Q) => Q.name === p)), ue) {
          const Q = nr(ue, g);
          Q ? (nt.value[p] = Q, console.log(`Validation error for ${p}:`, Q)) : delete nt.value[p];
        }
      } else
        delete nt.value[p], console.log(`Cleared error for ${p}`);
    }, ma = (p) => {
      const g = p.replace(/\D/g, "");
      return g.length >= 7 && g.length <= 15;
    }, nr = (p, g) => {
      if (p.required && (!g || g.toString().trim() === ""))
        return `${p.label} is required`;
      if (!g || g.toString().trim() === "")
        return null;
      if (p.type === "email" && !zn(g))
        return "Please enter a valid email address";
      if (p.type === "tel" && !ma(g))
        return "Please enter a valid phone number";
      if ((p.type === "text" || p.type === "textarea") && p.minLength && g.length < p.minLength)
        return `${p.label} must be at least ${p.minLength} characters`;
      if ((p.type === "text" || p.type === "textarea") && p.maxLength && g.length > p.maxLength)
        return `${p.label} must not exceed ${p.maxLength} characters`;
      if (p.type === "number") {
        const h = parseFloat(g);
        if (isNaN(h))
          return `${p.label} must be a valid number`;
        if (p.minLength && h < p.minLength)
          return `${p.label} must be at least ${p.minLength}`;
        if (p.maxLength && h > p.maxLength)
          return `${p.label} must not exceed ${p.maxLength}`;
      }
      return null;
    }, _a = async () => {
      if (!(rt.value || !dt.value))
        try {
          rt.value = !0, nt.value = {};
          let p = !1;
          for (const g of dt.value.fields || []) {
            const h = tt.value[g.name], Z = nr(g, h);
            Z && (nt.value[g.name] = Z, p = !0, console.log(`Validation error for field ${g.name}:`, Z));
          }
          if (p) {
            rt.value = !1, console.log("Validation failed, not submitting");
            return;
          }
          await We(tt.value), Sn.value = !1, dt.value = null, tt.value = {};
        } catch (p) {
          console.error("Failed to submit full screen form:", p);
        } finally {
          rt.value = !1, console.log("Full screen form submission completed");
        }
    }, va = (p, g) => {
      if (console.log("handleViewDetails called with:", { product: p, shopDomain: g }), !p) {
        console.error("No product provided to handleViewDetails");
        return;
      }
      let h = null;
      if (p.handle && g)
        h = `https://${g}/products/${p.handle}`;
      else if (p.id && g)
        h = `https://${g}/products/${p.id}`;
      else if (g) {
        if (!p.handle && !p.id) {
          console.error("Product handle and ID are both missing! Product:", p), alert("Unable to open product: Product information incomplete.");
          return;
        }
      } else {
        console.error("Shop domain is missing! Product:", p), alert("Unable to open product: Shop domain not available. Please contact support.");
        return;
      }
      h && (console.log("Opening product URL:", h), window.open(h, "_blank"));
    }, ya = (p) => {
      if (!p) return "";
      let g = p.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "");
      const h = [];
      return g = g.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (Z, ue, Q) => {
        const Le = `__MARKDOWN_LINK_${h.length}__`;
        return console.log("Found markdown link:", Z, "-> placeholder:", Le), h.push(Z), Le;
      }), console.log("After replacing markdown links with placeholders:", g), console.log("Markdown links array:", h), g = g.replace(/https?:\/\/[^\s\)]+/g, "[link removed]"), console.log("After removing standalone URLs:", g), h.forEach((Z, ue) => {
        g = g.replace(`__MARKDOWN_LINK_${ue}__`, Z), console.log(`Restored markdown link ${ue}:`, Z);
      }), g = g.replace(/\n\s*\n\s*\n/g, `

`).trim(), g;
    }, Ci = se(!1);
    se(!1);
    const ba = Ke(() => {
      var g;
      const p = !!((g = H.value) != null && g.human_agent_name);
      return B.value && p && ke.value.length < Io;
    }), wa = async () => {
      try {
        xn.value = !1, Mn.value = null, await fe();
      } catch (p) {
        console.error("Failed to proceed workflow:", p);
      }
    }, sr = async (p) => {
      try {
        if (!p.userInputValue || !p.userInputValue.trim())
          return;
        const g = p.userInputValue.trim();
        p.isSubmitted = !0, p.submittedValue = g, await ie(g, me.value);
      } catch (g) {
        console.error("Failed to submit user input:", g), p.isSubmitted = !1, p.submittedValue = null;
      }
    }, Ti = async () => {
      var p, g, h;
      try {
        let Z = 0;
        const ue = 50;
        for (; !((p = window.__INITIAL_DATA__) != null && p.widgetId) && Z < ue; )
          await new Promise((Le) => setTimeout(Le, 100)), Z++;
        return (g = window.__INITIAL_DATA__) != null && g.widgetId ? (ae(window.__INITIAL_DATA__.widgetId), await fs() ? ((h = window.__INITIAL_DATA__) != null && h.workflow && Oe.value && await je(), !0) : (re.value = "connected", !1)) : (console.error("Widget data not available after waiting"), !1);
      } catch (Z) {
        return console.error("Failed to initialize widget:", Z), !1;
      }
    }, ka = () => {
      K(async () => {
        await fs();
      }), window.addEventListener("message", (p) => {
        p.data.type === "SCROLL_TO_BOTTOM" && er(), p.data.type === "TOKEN_RECEIVED" && localStorage.setItem(Vn, p.data.token);
      }), Ue((p) => {
        var g;
        if (xi.value = p.button_text || "Start Chat", p.type === "landing_page")
          Mn.value = p.landing_page_data, xn.value = !0, Sn.value = !1;
        else if (p.type === "form" || p.type === "display_form")
          if (((g = p.form_data) == null ? void 0 : g.form_full_screen) === !0)
            dt.value = p.form_data, Sn.value = !0, xn.value = !1;
          else {
            const h = {
              message: "",
              message_type: "form",
              attributes: {
                form_data: p.form_data
              },
              created_at: (/* @__PURE__ */ new Date()).toISOString(),
              isSubmitted: !1
            };
            c.value.findIndex(
              (ue) => ue.message_type === "form" && !ue.isSubmitted
            ) === -1 && c.value.push(h), xn.value = !1, Sn.value = !1;
          }
        else
          xn.value = !1, Sn.value = !1;
      }), Ve((p) => {
        console.log("Workflow proceeded:", p);
      });
    }, xa = async () => {
      try {
        await Ti(), await je();
      } catch (p) {
        throw console.error("Failed to start new conversation:", p), p;
      }
    }, Sa = async () => {
      Si.value = !1, c.value = [], await xa();
    };
    ul(async () => {
      await Ti(), ka(), D(), document.addEventListener("click", Ot), (() => {
        const g = c.value.length > 0, h = re.value === "connected", Z = document.querySelector('input[type="text"], textarea') !== null;
        return g || h || Z;
      })() && setTimeout(de, 100);
    }), ni(() => {
      window.removeEventListener("message", (p) => {
        p.data.type === "SCROLL_TO_BOTTOM" && er();
      }), document.removeEventListener("click", Ot), ot && (ot.disconnect(), ot = null), D.timeoutId && (clearTimeout(D.timeoutId), D.timeoutId = null), V(), q();
    });
    const xt = Ke(() => i.value.chat_style === "ASK_ANYTHING"), Ca = Ke(() => {
      const p = {
        width: "100%",
        height: "580px",
        borderRadius: "var(--radius-lg)"
      };
      return window.innerWidth <= 768 && (p.width = "100vw", p.height = "100vh", p.borderRadius = "0", p.position = "fixed", p.top = "0", p.left = "0", p.bottom = "0", p.right = "0", p.maxWidth = "100vw", p.maxHeight = "100vh"), xt.value ? window.innerWidth <= 768 ? {
        ...p,
        width: "100vw",
        height: "100vh",
        maxWidth: "100vw",
        maxHeight: "100vh",
        minWidth: "unset",
        borderRadius: "0"
      } : window.innerWidth <= 1024 ? {
        ...p,
        width: "95%",
        maxWidth: "700px",
        minWidth: "500px",
        height: "650px"
      } : {
        ...p,
        width: "100%",
        maxWidth: "400px",
        minWidth: "400px",
        height: "580px"
      } : p;
    }), Ai = Ke(() => xt.value && c.value.length === 0);
    return (p, g) => S.value && R.value ? (E(), I("div", qf, g[18] || (g[18] = [
      fr('<div class="widget-unavailable-card" data-v-d567e87b><div class="widget-unavailable-icon-wrapper" data-v-d567e87b><svg class="widget-unavailable-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-v-d567e87b><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" data-v-d567e87b></path><path d="M9 12l2 2 4-4" data-v-d567e87b></path></svg></div><h2 class="widget-unavailable-title" data-v-d567e87b>Chat Unavailable</h2><p class="widget-unavailable-message" data-v-d567e87b> This chat widget is not currently configured. Please contact the website administrator to enable chat support. </p><div class="widget-unavailable-footer" data-v-d567e87b><svg class="chattermate-logo-small" width="14" height="14" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-d567e87b><path d="M45 15H15C13.3431 15 12 16.3431 12 18V42C12 43.6569 13.3431 45 15 45H25L30 52L35 45H45C46.6569 45 48 43.6569 48 42V18C48 16.3431 46.6569 15 45 15Z" fill="currentColor" opacity="0.6" data-v-d567e87b></path></svg><span data-v-d567e87b>Powered by ChatterMate</span></div></div>', 1)
    ]))) : S.value ? (E(), I("div", Uf, [
      y("div", zf, [
        g[19] || (g[19] = fr('<div class="auth-error-header" data-v-d567e87b><svg class="auth-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-d567e87b><circle cx="12" cy="12" r="10" data-v-d567e87b></circle><line x1="12" y1="8" x2="12" y2="12" data-v-d567e87b></line><line x1="12" y1="16" x2="12.01" y2="16" data-v-d567e87b></line></svg><h2 data-v-d567e87b>Authentication Error</h2></div>', 1)),
        y("p", Hf, ee(A.value), 1),
        y("button", {
          class: "auth-error-refresh-btn",
          onClick: g[0] || (g[0] = () => p.window.location.reload())
        }, " Refresh Page ")
      ])
    ])) : r.value && !S.value ? (E(), I("div", {
      key: 2,
      class: qe(["chat-container", { collapsed: !Ge.value, "ask-anything-style": xt.value }]),
      style: Re({ ...x(_e), ...Ca.value })
    }, [
      d.value ? (E(), I("div", Wf, g[20] || (g[20] = [
        fr('<div class="loading-spinner" data-v-d567e87b><div class="dot" data-v-d567e87b></div><div class="dot" data-v-d567e87b></div><div class="dot" data-v-d567e87b></div></div><div class="loading-text" data-v-d567e87b>Initializing chat...</div>', 2)
      ]))) : oe("", !0),
      !d.value && x(re) !== "connected" ? (E(), I("div", {
        key: 1,
        class: qe(["connection-status", x(re)])
      }, [
        x(re) === "connecting" ? (E(), I("div", jf, g[21] || (g[21] = [
          bt(" Connecting to chat service... ", -1),
          y("div", { class: "loading-dots" }, [
            y("div", { class: "dot" }),
            y("div", { class: "dot" }),
            y("div", { class: "dot" })
          ], -1)
        ]))) : x(re) === "failed" ? (E(), I("div", Vf, [
          g[22] || (g[22] = bt(" Connection failed. ", -1)),
          y("button", {
            onClick: aa,
            class: "reconnect-button"
          }, " Click here to reconnect ")
        ])) : oe("", !0)
      ], 2)) : oe("", !0),
      x($) ? (E(), I("div", {
        key: 2,
        class: "error-alert",
        style: Re(x(G))
      }, ee(x(v)), 5)) : oe("", !0),
      Ai.value ? (E(), I("div", {
        key: 3,
        class: "welcome-message-section",
        style: Re(x(L))
      }, [
        y("div", Kf, [
          y("div", Zf, [
            x(pe) ? (E(), I("img", {
              key: 0,
              src: x(pe),
              alt: x(o),
              class: "welcome-avatar"
            }, null, 8, Gf)) : oe("", !0),
            y("h1", Yf, ee(x(i).welcome_title || `Welcome to ${x(o)}`), 1),
            y("p", Xf, ee(x(i).welcome_subtitle || "I'm here to help you with anything you need. What can I assist you with today?"), 1)
          ])
        ]),
        y("div", Jf, [
          !x(U) && !Oe.value && !xt.value ? (E(), I("div", Qf, [
            dn(y("input", {
              "onUpdate:modelValue": g[1] || (g[1] = (h) => me.value = h),
              type: "email",
              placeholder: "Enter your email address",
              disabled: x(b) || x(re) !== "connected",
              class: qe([{
                invalid: me.value.trim() && !x(zn)(me.value.trim()),
                disabled: x(re) !== "connected"
              }, "welcome-email-input"])
            }, null, 10, ed), [
              [mn, me.value]
            ])
          ])) : oe("", !0),
          y("div", td, [
            dn(y("input", {
              "onUpdate:modelValue": g[2] || (g[2] = (h) => J.value = h),
              type: "text",
              placeholder: bi.value,
              onKeypress: wi,
              onInput: Me,
              onChange: Me,
              disabled: !kn.value,
              class: qe([{ disabled: !kn.value }, "welcome-message-field"])
            }, null, 42, nd), [
              [mn, J.value]
            ]),
            y("button", {
              class: "welcome-send-button",
              style: Re(x(W)),
              onClick: Nn,
              disabled: !J.value.trim() || !kn.value
            }, g[23] || (g[23] = [
              y("svg", {
                width: "20",
                height: "20",
                viewBox: "0 0 24 24",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg"
              }, [
                y("path", {
                  d: "M5 12L3 21L21 12L3 3L5 12ZM5 12L13 12",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                })
              ], -1)
            ]), 12, sd)
          ])
        ]),
        y("div", {
          class: "powered-by-welcome",
          style: Re(x(Y))
        }, g[24] || (g[24] = [
          y("svg", {
            class: "chattermate-logo",
            width: "16",
            height: "16",
            viewBox: "0 0 60 60",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg"
          }, [
            y("path", {
              d: "M45 15H15C13.3431 15 12 16.3431 12 18V42C12 43.6569 13.3431 45 15 45H25L30 52L35 45H45C46.6569 45 48 43.6569 48 42V18C48 16.3431 46.6569 15 45 15Z",
              fill: "currentColor",
              opacity: "0.8"
            }),
            y("path", {
              d: "M36 27C36 27 32.5 26 30 26C27.5 26 24 27 24 31C24 35 27.5 36 30 36C32.5 36 36 35 36 35V33C36 33 33 34 31.5 34C30 34 27 33 27 31C27 29 30 28 31.5 28C33 28 36 29 36 29V27Z",
              fill: "currentColor"
            })
          ], -1),
          bt(" Powered by ChatterMate ", -1)
        ]), 4)
      ], 4)) : oe("", !0),
      xn.value && Mn.value ? (E(), I("div", {
        key: 4,
        class: "landing-page-fullscreen",
        style: Re(x(L))
      }, [
        y("div", rd, [
          y("div", id, [
            y("h2", od, ee(Mn.value.heading), 1),
            y("div", ld, ee(Mn.value.content), 1)
          ]),
          y("div", ad, [
            y("button", {
              class: "landing-page-button",
              onClick: wa
            }, ee(xi.value), 1)
          ])
        ]),
        y("div", {
          class: "powered-by-landing",
          style: Re(x(Y))
        }, g[25] || (g[25] = [
          y("svg", {
            class: "chattermate-logo",
            width: "16",
            height: "16",
            viewBox: "0 0 60 60",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg"
          }, [
            y("path", {
              d: "M45 15H15C13.3431 15 12 16.3431 12 18V42C12 43.6569 13.3431 45 15 45H25L30 52L35 45H45C46.6569 45 48 43.6569 48 42V18C48 16.3431 46.6569 15 45 15Z",
              fill: "currentColor",
              opacity: "0.8"
            }),
            y("path", {
              d: "M36 27C36 27 32.5 26 30 26C27.5 26 24 27 24 31C24 35 27.5 36 30 36C32.5 36 36 35 36 35V33C36 33 33 34 31.5 34C30 34 27 33 27 31C27 29 30 28 31.5 28C33 28 36 29 36 29V27Z",
              fill: "currentColor"
            })
          ], -1),
          bt(" Powered by ChatterMate ", -1)
        ]), 4)
      ], 4)) : Sn.value && dt.value ? (E(), I("div", {
        key: 5,
        class: "form-fullscreen",
        style: Re(x(L))
      }, [
        y("div", cd, [
          dt.value.title || dt.value.description ? (E(), I("div", ud, [
            dt.value.title ? (E(), I("h2", hd, ee(dt.value.title), 1)) : oe("", !0),
            dt.value.description ? (E(), I("p", fd, ee(dt.value.description), 1)) : oe("", !0)
          ])) : oe("", !0),
          y("div", dd, [
            (E(!0), I(ze, null, St(dt.value.fields, (h) => {
              var Z, ue;
              return E(), I("div", {
                key: h.name,
                class: "form-field"
              }, [
                y("label", {
                  for: `fullscreen-form-${h.name}`,
                  class: "field-label"
                }, [
                  bt(ee(h.label) + " ", 1),
                  h.required ? (E(), I("span", gd, "*")) : oe("", !0)
                ], 8, pd),
                h.type === "text" || h.type === "email" || h.type === "tel" ? (E(), I("input", {
                  key: 0,
                  id: `fullscreen-form-${h.name}`,
                  type: h.type,
                  placeholder: h.placeholder || "",
                  required: h.required,
                  minlength: h.minLength,
                  maxlength: h.maxLength,
                  value: tt.value[h.name] || "",
                  onInput: (Q) => vt(h.name, Q.target.value),
                  onBlur: (Q) => vt(h.name, Q.target.value),
                  class: qe(["form-input", { error: nt.value[h.name] }]),
                  autocomplete: h.type === "email" ? "email" : h.type === "tel" ? "tel" : "off",
                  inputmode: h.type === "tel" ? "tel" : h.type === "email" ? "email" : "text"
                }, null, 42, md)) : h.type === "number" ? (E(), I("input", {
                  key: 1,
                  id: `fullscreen-form-${h.name}`,
                  type: "number",
                  placeholder: h.placeholder || "",
                  required: h.required,
                  min: h.minLength,
                  max: h.maxLength,
                  value: tt.value[h.name] || "",
                  onInput: (Q) => vt(h.name, Q.target.value),
                  class: qe(["form-input", { error: nt.value[h.name] }])
                }, null, 42, _d)) : h.type === "textarea" ? (E(), I("textarea", {
                  key: 2,
                  id: `fullscreen-form-${h.name}`,
                  placeholder: h.placeholder || "",
                  required: h.required,
                  minlength: h.minLength,
                  maxlength: h.maxLength,
                  value: tt.value[h.name] || "",
                  onInput: (Q) => vt(h.name, Q.target.value),
                  class: qe(["form-textarea", { error: nt.value[h.name] }]),
                  rows: "4"
                }, null, 42, vd)) : h.type === "select" ? (E(), I("select", {
                  key: 3,
                  id: `fullscreen-form-${h.name}`,
                  required: h.required,
                  value: tt.value[h.name] || "",
                  onChange: (Q) => vt(h.name, Q.target.value),
                  class: qe(["form-select", { error: nt.value[h.name] }])
                }, [
                  y("option", bd, ee(h.placeholder || "Please select..."), 1),
                  (E(!0), I(ze, null, St((Array.isArray(h.options) ? h.options : ((Z = h.options) == null ? void 0 : Z.split(`
`)) || []).filter((Q) => Q.trim()), (Q) => (E(), I("option", {
                    key: Q,
                    value: Q.trim()
                  }, ee(Q.trim()), 9, wd))), 128))
                ], 42, yd)) : h.type === "checkbox" ? (E(), I("label", kd, [
                  y("input", {
                    id: `fullscreen-form-${h.name}`,
                    type: "checkbox",
                    required: h.required,
                    checked: tt.value[h.name] || !1,
                    onChange: (Q) => vt(h.name, Q.target.checked),
                    class: "form-checkbox"
                  }, null, 40, xd),
                  y("span", Sd, ee(h.label), 1)
                ])) : h.type === "radio" ? (E(), I("div", Cd, [
                  (E(!0), I(ze, null, St((Array.isArray(h.options) ? h.options : ((ue = h.options) == null ? void 0 : ue.split(`
`)) || []).filter((Q) => Q.trim()), (Q) => (E(), I("label", {
                    key: Q,
                    class: "radio-field"
                  }, [
                    y("input", {
                      type: "radio",
                      name: `fullscreen-form-${h.name}`,
                      value: Q.trim(),
                      required: h.required,
                      checked: tt.value[h.name] === Q.trim(),
                      onChange: (Le) => vt(h.name, Q.trim()),
                      class: "form-radio"
                    }, null, 40, Td),
                    y("span", Ad, ee(Q.trim()), 1)
                  ]))), 128))
                ])) : oe("", !0),
                nt.value[h.name] ? (E(), I("div", Ed, ee(nt.value[h.name]), 1)) : oe("", !0)
              ]);
            }), 128))
          ]),
          y("div", Rd, [
            y("button", {
              onClick: g[3] || (g[3] = () => {
                console.log("Submit button clicked!"), _a();
              }),
              disabled: rt.value,
              class: "submit-form-button",
              style: Re(x(W))
            }, [
              rt.value ? (E(), I("span", Ld, g[26] || (g[26] = [
                y("div", { class: "dot" }, null, -1),
                y("div", { class: "dot" }, null, -1),
                y("div", { class: "dot" }, null, -1)
              ]))) : (E(), I("span", Od, ee(dt.value.submit_button_text || "Submit"), 1))
            ], 12, Id)
          ])
        ]),
        y("div", {
          class: "powered-by-landing",
          style: Re(x(Y))
        }, g[27] || (g[27] = [
          y("svg", {
            class: "chattermate-logo",
            width: "16",
            height: "16",
            viewBox: "0 0 60 60",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg"
          }, [
            y("path", {
              d: "M45 15H15C13.3431 15 12 16.3431 12 18V42C12 43.6569 13.3431 45 15 45H25L30 52L35 45H45C46.6569 45 48 43.6569 48 42V18C48 16.3431 46.6569 15 45 15Z",
              fill: "currentColor",
              opacity: "0.8"
            }),
            y("path", {
              d: "M36 27C36 27 32.5 26 30 26C27.5 26 24 27 24 31C24 35 27.5 36 30 36C32.5 36 36 35 36 35V33C36 33 33 34 31.5 34C30 34 27 33 27 31C27 29 30 28 31.5 28C33 28 36 29 36 29V27Z",
              fill: "currentColor"
            })
          ], -1),
          bt(" Powered by ChatterMate ", -1)
        ]), 4)
      ], 4)) : Ai.value ? oe("", !0) : (E(), I(ze, { key: 6 }, [
        Ge.value ? (E(), I("div", {
          key: 0,
          class: qe(["chat-panel", { "ask-anything-chat": xt.value }]),
          style: Re(x(L))
        }, [
          xt.value ? (E(), I("div", {
            key: 1,
            class: "ask-anything-top",
            style: Re(x(ce))
          }, [
            y("div", Nd, [
              ps.value || x(pe) ? (E(), I("img", {
                key: 0,
                src: ps.value || x(pe),
                alt: x(H).human_agent_name || x(o),
                class: "header-avatar"
              }, null, 8, Md)) : oe("", !0),
              y("div", Dd, [
                y("h3", {
                  style: Re(x(Y))
                }, ee(x(o)), 5),
                y("p", {
                  class: "ask-anything-subtitle",
                  style: Re(x(Y))
                }, ee(x(i).welcome_subtitle || "Ask me anything. I'm here to help."), 5)
              ])
            ])
          ], 4)) : (E(), I("div", {
            key: 0,
            class: "chat-header",
            style: Re(x(ce))
          }, [
            y("div", Pd, [
              ps.value || x(pe) ? (E(), I("img", {
                key: 0,
                src: ps.value || x(pe),
                alt: x(H).human_agent_name || x(o),
                class: "header-avatar"
              }, null, 8, $d)) : oe("", !0),
              y("div", Fd, [
                y("h3", {
                  style: Re(x(Y))
                }, ee(x(H).human_agent_name || x(o)), 5),
                y("div", Bd, [
                  g[28] || (g[28] = y("span", { class: "status-indicator online" }, null, -1)),
                  y("span", {
                    class: "status-text",
                    style: Re(x(Y))
                  }, "Online", 4)
                ])
              ])
            ])
          ], 4)),
          x(M) ? (E(), I("div", qd, g[29] || (g[29] = [
            y("div", { class: "loading-spinner" }, [
              y("div", { class: "dot" }),
              y("div", { class: "dot" }),
              y("div", { class: "dot" })
            ], -1)
          ]))) : oe("", !0),
          y("div", {
            class: "chat-messages",
            ref_key: "messagesContainer",
            ref: P
          }, [
            (E(!0), I(ze, null, St(x(c), (h, Z) => {
              var ue, Q, Le, he, Rt, Dn, Cn, Ri, Ii, Li, Oi, Pi, $i, Fi, Bi, Ni, Mi, Di, qi;
              return E(), I("div", {
                key: Z,
                class: qe([
                  "message",
                  h.message_type === "bot" || h.message_type === "agent" ? "agent-message" : h.message_type === "system" ? "system-message" : h.message_type === "rating" ? "rating-message" : h.message_type === "form" ? "form-message" : h.message_type === "product" || h.shopify_output ? "product-message" : "user-message"
                ])
              }, [
                y("div", {
                  class: "message-bubble",
                  style: Re(h.message_type === "system" || h.message_type === "rating" || h.message_type === "product" || h.shopify_output ? {} : h.message_type === "user" ? x(W) : x(N))
                }, [
                  h.message_type === "rating" ? (E(), I("div", Ud, [
                    y("p", zd, "Rate the chat session that you had with " + ee(h.agent_name || x(H).human_agent_name || x(o) || "our agent"), 1),
                    y("div", {
                      class: qe(["star-rating", { submitted: $t.value || h.isSubmitted }])
                    }, [
                      (E(), I(ze, null, St(5, (C) => y("button", {
                        key: C,
                        class: qe(["star-button", {
                          warning: C <= (h.isSubmitted ? h.finalRating : Pt.value || h.selectedRating) && (h.isSubmitted ? h.finalRating : Pt.value || h.selectedRating) <= 3,
                          success: C <= (h.isSubmitted ? h.finalRating : Pt.value || h.selectedRating) && (h.isSubmitted ? h.finalRating : Pt.value || h.selectedRating) > 3,
                          selected: C <= (h.isSubmitted ? h.finalRating : Pt.value || h.selectedRating)
                        }]),
                        onMouseover: (jt) => !h.isSubmitted && ua(C),
                        onMouseleave: (jt) => !h.isSubmitted && ha,
                        onClick: (jt) => !h.isSubmitted && fa(C),
                        disabled: $t.value || h.isSubmitted
                      }, " ★ ", 42, Hd)), 64))
                    ], 2),
                    h.showFeedback && !h.isSubmitted ? (E(), I("div", Wd, [
                      y("div", jd, [
                        dn(y("input", {
                          "onUpdate:modelValue": (C) => h.feedback = C,
                          placeholder: "Please share your feedback (optional)",
                          disabled: $t.value,
                          maxlength: "500",
                          class: "feedback-input"
                        }, null, 8, Vd), [
                          [mn, h.feedback]
                        ]),
                        y("div", Kd, ee(((ue = h.feedback) == null ? void 0 : ue.length) || 0) + "/500", 1)
                      ]),
                      y("button", {
                        onClick: (C) => da(h.session_id, Pt.value, h.feedback),
                        disabled: $t.value || !Pt.value,
                        class: "submit-rating-button",
                        style: Re({ backgroundColor: x(i).accent_color || "var(--primary-color)" })
                      }, ee($t.value ? "Submitting..." : "Submit Rating"), 13, Zd)
                    ])) : oe("", !0),
                    h.isSubmitted && h.finalFeedback ? (E(), I("div", Gd, [
                      y("div", Yd, [
                        y("p", Xd, ee(h.finalFeedback), 1)
                      ])
                    ])) : h.isSubmitted ? (E(), I("div", Jd, " Thank you for your rating! ")) : oe("", !0)
                  ])) : h.message_type === "form" ? (E(), I("div", Qd, [
                    (Le = (Q = h.attributes) == null ? void 0 : Q.form_data) != null && Le.title || (Rt = (he = h.attributes) == null ? void 0 : he.form_data) != null && Rt.description ? (E(), I("div", ep, [
                      (Cn = (Dn = h.attributes) == null ? void 0 : Dn.form_data) != null && Cn.title ? (E(), I("h3", tp, ee(h.attributes.form_data.title), 1)) : oe("", !0),
                      (Ii = (Ri = h.attributes) == null ? void 0 : Ri.form_data) != null && Ii.description ? (E(), I("p", np, ee(h.attributes.form_data.description), 1)) : oe("", !0)
                    ])) : oe("", !0),
                    y("div", sp, [
                      (E(!0), I(ze, null, St((Oi = (Li = h.attributes) == null ? void 0 : Li.form_data) == null ? void 0 : Oi.fields, (C) => {
                        var jt, rr;
                        return E(), I("div", {
                          key: C.name,
                          class: "form-field"
                        }, [
                          y("label", {
                            for: `form-${C.name}`,
                            class: "field-label"
                          }, [
                            bt(ee(C.label) + " ", 1),
                            C.required ? (E(), I("span", ip, "*")) : oe("", !0)
                          ], 8, rp),
                          C.type === "text" || C.type === "email" || C.type === "tel" ? (E(), I("input", {
                            key: 0,
                            id: `form-${C.name}`,
                            type: C.type,
                            placeholder: C.placeholder || "",
                            required: C.required,
                            minlength: C.minLength,
                            maxlength: C.maxLength,
                            value: tt.value[C.name] || "",
                            onInput: (Ce) => vt(C.name, Ce.target.value),
                            onBlur: (Ce) => vt(C.name, Ce.target.value),
                            class: qe(["form-input", { error: nt.value[C.name] }]),
                            disabled: rt.value,
                            autocomplete: C.type === "email" ? "email" : C.type === "tel" ? "tel" : "off",
                            inputmode: C.type === "tel" ? "tel" : C.type === "email" ? "email" : "text"
                          }, null, 42, op)) : C.type === "number" ? (E(), I("input", {
                            key: 1,
                            id: `form-${C.name}`,
                            type: "number",
                            placeholder: C.placeholder || "",
                            required: C.required,
                            min: C.min,
                            max: C.max,
                            value: tt.value[C.name] || "",
                            onInput: (Ce) => vt(C.name, Ce.target.value),
                            class: qe(["form-input", { error: nt.value[C.name] }]),
                            disabled: rt.value
                          }, null, 42, lp)) : C.type === "textarea" ? (E(), I("textarea", {
                            key: 2,
                            id: `form-${C.name}`,
                            placeholder: C.placeholder || "",
                            required: C.required,
                            minlength: C.minLength,
                            maxlength: C.maxLength,
                            value: tt.value[C.name] || "",
                            onInput: (Ce) => vt(C.name, Ce.target.value),
                            class: qe(["form-textarea", { error: nt.value[C.name] }]),
                            disabled: rt.value,
                            rows: "3"
                          }, null, 42, ap)) : C.type === "select" ? (E(), I("select", {
                            key: 3,
                            id: `form-${C.name}`,
                            required: C.required,
                            value: tt.value[C.name] || "",
                            onChange: (Ce) => vt(C.name, Ce.target.value),
                            class: qe(["form-select", { error: nt.value[C.name] }]),
                            disabled: rt.value
                          }, [
                            y("option", up, ee(C.placeholder || "Select an option"), 1),
                            (E(!0), I(ze, null, St((Array.isArray(C.options) ? C.options : ((jt = C.options) == null ? void 0 : jt.split(`
`)) || []).filter((Ce) => Ce.trim()), (Ce) => (E(), I("option", {
                              key: Ce.trim(),
                              value: Ce.trim()
                            }, ee(Ce.trim()), 9, hp))), 128))
                          ], 42, cp)) : C.type === "checkbox" ? (E(), I("div", fp, [
                            y("input", {
                              id: `form-${C.name}`,
                              type: "checkbox",
                              checked: tt.value[C.name] || !1,
                              onChange: (Ce) => vt(C.name, Ce.target.checked),
                              class: "form-checkbox",
                              disabled: rt.value
                            }, null, 40, dp),
                            y("label", {
                              for: `form-${C.name}`,
                              class: "checkbox-label"
                            }, ee(C.placeholder || C.label), 9, pp)
                          ])) : C.type === "radio" ? (E(), I("div", gp, [
                            (E(!0), I(ze, null, St((Array.isArray(C.options) ? C.options : ((rr = C.options) == null ? void 0 : rr.split(`
`)) || []).filter((Ce) => Ce.trim()), (Ce) => (E(), I("div", {
                              key: Ce.trim(),
                              class: "radio-option"
                            }, [
                              y("input", {
                                id: `form-${C.name}-${Ce.trim()}`,
                                name: `form-${C.name}`,
                                type: "radio",
                                value: Ce.trim(),
                                checked: tt.value[C.name] === Ce.trim(),
                                onChange: ($g) => vt(C.name, Ce.trim()),
                                class: "form-radio",
                                disabled: rt.value
                              }, null, 40, mp),
                              y("label", {
                                for: `form-${C.name}-${Ce.trim()}`,
                                class: "radio-label"
                              }, ee(Ce.trim()), 9, _p)
                            ]))), 128))
                          ])) : oe("", !0),
                          nt.value[C.name] ? (E(), I("div", vp, ee(nt.value[C.name]), 1)) : oe("", !0)
                        ]);
                      }), 128))
                    ]),
                    y("div", yp, [
                      y("button", {
                        onClick: () => {
                          var C;
                          console.log("Regular form submit button clicked!"), ga((C = h.attributes) == null ? void 0 : C.form_data);
                        },
                        disabled: rt.value,
                        class: "form-submit-button",
                        style: Re(x(W))
                      }, ee(rt.value ? "Submitting..." : (($i = (Pi = h.attributes) == null ? void 0 : Pi.form_data) == null ? void 0 : $i.submit_button_text) || "Submit"), 13, bp)
                    ])
                  ])) : h.message_type === "user_input" ? (E(), I("div", wp, [
                    (Fi = h.attributes) != null && Fi.prompt_message && h.attributes.prompt_message.trim() ? (E(), I("div", kp, ee(h.attributes.prompt_message), 1)) : oe("", !0),
                    h.isSubmitted ? (E(), I("div", Tp, [
                      g[30] || (g[30] = y("strong", null, "Your input:", -1)),
                      bt(" " + ee(h.submittedValue) + " ", 1),
                      (Bi = h.attributes) != null && Bi.confirmation_message && h.attributes.confirmation_message.trim() ? (E(), I("div", Ap, ee(h.attributes.confirmation_message), 1)) : oe("", !0)
                    ])) : (E(), I("div", xp, [
                      dn(y("textarea", {
                        "onUpdate:modelValue": (C) => h.userInputValue = C,
                        class: "user-input-textarea",
                        placeholder: "Type your message here...",
                        rows: "3",
                        onKeydown: [
                          mo(An((C) => sr(h), ["ctrl"]), ["enter"]),
                          mo(An((C) => sr(h), ["meta"]), ["enter"])
                        ]
                      }, null, 40, Sp), [
                        [mn, h.userInputValue]
                      ]),
                      y("button", {
                        class: "user-input-submit-button",
                        onClick: (C) => sr(h),
                        disabled: !h.userInputValue || !h.userInputValue.trim()
                      }, " Submit ", 8, Cp)
                    ]))
                  ])) : h.shopify_output || h.message_type === "product" ? (E(), I("div", Ep, [
                    h.message ? (E(), I("div", {
                      key: 0,
                      innerHTML: x(ye)(((Mi = (Ni = h.shopify_output) == null ? void 0 : Ni.products) == null ? void 0 : Mi.length) > 0 ? ya(h.message) : h.message, { renderer: x(t) }),
                      class: "product-message-text"
                    }, null, 8, Rp)) : oe("", !0),
                    (Di = h.shopify_output) != null && Di.products && h.shopify_output.products.length > 0 ? (E(), I("div", Ip, [
                      g[32] || (g[32] = y("h3", { class: "carousel-title" }, "Products", -1)),
                      y("div", Lp, [
                        (E(!0), I(ze, null, St(h.shopify_output.products, (C) => {
                          var jt;
                          return E(), I("div", {
                            key: C.id,
                            class: "product-card-compact carousel-item"
                          }, [
                            (jt = C.image) != null && jt.src ? (E(), I("div", Op, [
                              y("img", {
                                src: C.image.src,
                                alt: C.title,
                                class: "product-thumbnail"
                              }, null, 8, Pp)
                            ])) : oe("", !0),
                            y("div", $p, [
                              y("div", Fp, [
                                y("div", Bp, ee(C.title), 1),
                                C.variant_title && C.variant_title !== "Default Title" ? (E(), I("div", Np, ee(C.variant_title), 1)) : oe("", !0),
                                y("div", Mp, ee(C.price_formatted || x(f)(C.price, C.currency)), 1)
                              ]),
                              y("div", Dp, [
                                y("button", {
                                  class: "view-details-button-compact",
                                  onClick: (rr) => {
                                    var Ce;
                                    return va(C, (Ce = h.shopify_output) == null ? void 0 : Ce.shop_domain);
                                  }
                                }, g[31] || (g[31] = [
                                  bt(" View product ", -1),
                                  y("span", { class: "external-link-icon" }, "↗", -1)
                                ]), 8, qp)
                              ])
                            ])
                          ]);
                        }), 128))
                      ])
                    ])) : !h.message && ((qi = h.shopify_output) != null && qi.products) && h.shopify_output.products.length === 0 ? (E(), I("div", Up, g[33] || (g[33] = [
                      y("p", null, "No products found.", -1)
                    ]))) : !h.message && h.shopify_output && !h.shopify_output.products ? (E(), I("div", zp, g[34] || (g[34] = [
                      y("p", null, "No products to display.", -1)
                    ]))) : oe("", !0)
                  ])) : (E(), I(ze, { key: 4 }, [
                    y("div", {
                      innerHTML: x(ye)(h.message, { renderer: x(t) })
                    }, null, 8, Hp),
                    h.attachments && h.attachments.length > 0 ? (E(), I("div", Wp, [
                      (E(!0), I(ze, null, St(h.attachments, (C) => (E(), I("div", {
                        key: C.id,
                        class: "attachment-item"
                      }, [
                        x(T)(C.content_type) ? (E(), I("div", jp, [
                          y("img", {
                            src: x(k)(C.file_url),
                            alt: C.filename,
                            class: "attachment-image",
                            onClick: An((jt) => x(et)({ url: C.file_url, filename: C.filename, type: C.content_type, file_url: x(k)(C.file_url), size: void 0 }), ["stop"]),
                            style: { cursor: "pointer" }
                          }, null, 8, Vp),
                          y("div", Kp, [
                            y("a", {
                              href: x(k)(C.file_url),
                              target: "_blank",
                              class: "attachment-link"
                            }, [
                              g[35] || (g[35] = y("svg", {
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
                              bt(" " + ee(C.filename) + " ", 1),
                              y("span", Gp, "(" + ee(x(_)(C.file_size)) + ")", 1)
                            ], 8, Zp)
                          ])
                        ])) : (E(), I("a", {
                          key: 1,
                          href: x(k)(C.file_url),
                          target: "_blank",
                          class: "attachment-link"
                        }, [
                          g[36] || (g[36] = y("svg", {
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
                          bt(" " + ee(C.filename) + " ", 1),
                          y("span", Xp, "(" + ee(x(_)(C.file_size)) + ")", 1)
                        ], 8, Yp))
                      ]))), 128))
                    ])) : oe("", !0)
                  ], 64))
                ], 4),
                y("div", Jp, [
                  h.message_type === "user" ? (E(), I("span", Qp, " You ")) : oe("", !0)
                ])
              ], 2);
            }), 128)),
            x(b) ? (E(), I("div", eg, g[37] || (g[37] = [
              y("div", { class: "dot" }, null, -1),
              y("div", { class: "dot" }, null, -1),
              y("div", { class: "dot" }, null, -1)
            ]))) : oe("", !0)
          ], 512),
          Si.value ? (E(), I("div", {
            key: 4,
            class: "new-conversation-section",
            style: Re(x(N))
          }, [
            y("div", mg, [
              g[42] || (g[42] = y("p", { class: "ended-text" }, "This chat has ended.", -1)),
              y("button", {
                class: "start-new-conversation-button",
                style: Re(x(W)),
                onClick: Sa
              }, " Click here to start a new conversation ", 4)
            ])
          ], 4)) : (E(), I("div", {
            key: 3,
            class: qe(["chat-input", { "ask-anything-input": xt.value }]),
            style: Re(x(N))
          }, [
            !x(U) && !Oe.value && !xt.value ? (E(), I("div", tg, [
              dn(y("input", {
                "onUpdate:modelValue": g[4] || (g[4] = (h) => me.value = h),
                type: "email",
                placeholder: "Enter your email address to begin",
                disabled: x(b) || x(re) !== "connected",
                class: qe({
                  invalid: me.value.trim() && !x(zn)(me.value.trim()),
                  disabled: x(re) !== "connected"
                })
              }, null, 10, ng), [
                [mn, me.value]
              ])
            ])) : oe("", !0),
            y("input", {
              ref_key: "fileInputRef",
              ref: Xe,
              type: "file",
              accept: Ag,
              multiple: "",
              style: { display: "none" },
              onChange: g[5] || (g[5] = //@ts-ignore
              (...h) => x(j) && x(j)(...h))
            }, null, 544),
            x(ke).length > 0 ? (E(), I("div", sg, [
              (E(!0), I(ze, null, St(x(ke), (h, Z) => (E(), I("div", {
                key: Z,
                class: "file-preview-widget"
              }, [
                y("div", rg, [
                  x(hs)(h.type) ? (E(), I("img", {
                    key: 0,
                    src: x(O)(h),
                    alt: h.filename,
                    class: "file-preview-image-widget",
                    onClick: An((ue) => x(et)(h), ["stop"]),
                    style: { cursor: "pointer" }
                  }, null, 8, ig)) : (E(), I("div", {
                    key: 1,
                    class: "file-preview-icon-widget",
                    onClick: An((ue) => x(et)(h), ["stop"]),
                    style: { cursor: "pointer" }
                  }, g[38] || (g[38] = [
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
                  ]), 8, og))
                ]),
                y("div", lg, [
                  y("div", ag, ee(h.filename), 1),
                  y("div", cg, ee(x(_)(h.size)), 1)
                ]),
                y("button", {
                  type: "button",
                  class: "file-preview-remove-widget",
                  onClick: (ue) => x(De)(Z),
                  title: "Remove file"
                }, " × ", 8, ug)
              ]))), 128))
            ])) : oe("", !0),
            Ci.value ? (E(), I("div", hg, g[39] || (g[39] = [
              y("div", { class: "upload-spinner-widget" }, null, -1),
              y("span", { class: "upload-text-widget" }, "Uploading files...", -1)
            ]))) : oe("", !0),
            y("div", fg, [
              dn(y("input", {
                "onUpdate:modelValue": g[6] || (g[6] = (h) => J.value = h),
                type: "text",
                placeholder: bi.value,
                onKeypress: wi,
                onInput: Me,
                onChange: Me,
                onPaste: g[7] || (g[7] = //@ts-ignore
                (...h) => x(Ne) && x(Ne)(...h)),
                onDrop: g[8] || (g[8] = //@ts-ignore
                (...h) => x(X) && x(X)(...h)),
                onDragover: g[9] || (g[9] = //@ts-ignore
                (...h) => x(ve) && x(ve)(...h)),
                onDragleave: g[10] || (g[10] = //@ts-ignore
                (...h) => x(xe) && x(xe)(...h)),
                disabled: !kn.value,
                class: qe({ disabled: !kn.value, "ask-anything-field": xt.value })
              }, null, 42, dg), [
                [mn, J.value]
              ]),
              ba.value ? (E(), I("button", {
                key: 0,
                type: "button",
                class: "attach-button",
                disabled: Ci.value,
                onClick: g[11] || (g[11] = //@ts-ignore
                (...h) => x(Wt) && x(Wt)(...h)),
                title: `Attach files (${x(ke).length}/${Io} used) or paste screenshots`
              }, g[40] || (g[40] = [
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
              ]), 8, pg)) : oe("", !0),
              y("button", {
                class: qe(["send-button", { "ask-anything-send": xt.value }]),
                style: Re(x(W)),
                onClick: Nn,
                disabled: !J.value.trim() && x(ke).length === 0 || !kn.value
              }, g[41] || (g[41] = [
                y("svg", {
                  width: "20",
                  height: "20",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  xmlns: "http://www.w3.org/2000/svg"
                }, [
                  y("path", {
                    d: "M5 12L3 21L21 12L3 3L5 12ZM5 12L13 12",
                    stroke: "currentColor",
                    "stroke-width": "2",
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round"
                  })
                ], -1)
              ]), 14, gg)
            ])
          ], 6)),
          y("div", {
            class: "powered-by",
            style: Re(x(Y))
          }, g[43] || (g[43] = [
            y("svg", {
              class: "chattermate-logo",
              width: "16",
              height: "16",
              viewBox: "0 0 60 60",
              fill: "none",
              xmlns: "http://www.w3.org/2000/svg"
            }, [
              y("path", {
                d: "M45 15H15C13.3431 15 12 16.3431 12 18V42C12 43.6569 13.3431 45 15 45H25L30 52L35 45H45C46.6569 45 48 43.6569 48 42V18C48 16.3431 46.6569 15 45 15Z",
                fill: "currentColor",
                opacity: "0.8"
              }),
              y("path", {
                d: "M36 27C36 27 32.5 26 30 26C27.5 26 24 27 24 31C24 35 27.5 36 30 36C32.5 36 36 35 36 35V33C36 33 33 34 31.5 34C30 34 27 33 27 31C27 29 30 28 31.5 28C33 28 36 29 36 29V27Z",
                fill: "currentColor"
              })
            ], -1),
            bt(" Powered by ChatterMate ", -1)
          ]), 4)
        ], 6)) : oe("", !0)
      ], 64)),
      ki.value ? (E(), I("div", _g, [
        y("div", vg, [
          g[44] || (g[44] = y("h3", null, "Rate your conversation", -1)),
          y("div", yg, [
            (E(), I(ze, null, St(5, (h) => y("button", {
              key: h,
              onClick: (Z) => ds.value = h,
              class: qe([{ active: h <= ds.value }, "star-button"])
            }, " ★ ", 10, bg)), 64))
          ]),
          dn(y("textarea", {
            "onUpdate:modelValue": g[12] || (g[12] = (h) => tr.value = h),
            placeholder: "Additional feedback (optional)",
            class: "rating-feedback"
          }, null, 512), [
            [mn, tr.value]
          ]),
          y("div", wg, [
            y("button", {
              onClick: g[13] || (g[13] = (h) => p.submitRating(ds.value, tr.value)),
              disabled: !ds.value,
              class: "submit-button",
              style: Re(x(W))
            }, " Submit ", 12, kg),
            y("button", {
              onClick: g[14] || (g[14] = (h) => ki.value = !1),
              class: "skip-rating"
            }, " Skip ")
          ])
        ])
      ])) : oe("", !0),
      x(ft) ? (E(), I("div", {
        key: 8,
        class: "preview-modal-overlay",
        onClick: g[17] || (g[17] = //@ts-ignore
        (...h) => x(at) && x(at)(...h))
      }, [
        y("div", {
          class: "preview-modal-content",
          onClick: g[16] || (g[16] = An(() => {
          }, ["stop"]))
        }, [
          y("button", {
            class: "preview-modal-close",
            onClick: g[15] || (g[15] = //@ts-ignore
            (...h) => x(at) && x(at)(...h))
          }, "×"),
          x(u) && x(hs)(x(u).type) ? (E(), I("div", xg, [
            y("img", {
              src: x(O)(x(u)),
              alt: x(u).filename,
              class: "preview-modal-image"
            }, null, 8, Sg),
            y("div", Cg, ee(x(u).filename), 1)
          ])) : oe("", !0)
        ])
      ])) : oe("", !0)
    ], 6)) : (E(), I("div", Tg));
  }
}), Rg = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [s, r] of t)
    n[s] = r;
  return n;
}, Ig = /* @__PURE__ */ Rg(Eg, [["__scopeId", "data-v-d567e87b"]]);
window.process || (window.process = { env: { NODE_ENV: "production" } });
const Tt = window.__INITIAL_DATA__, ra = new URL(window.location.href), ia = ra.searchParams.get("preview") === "true", oa = (e) => {
  const t = ra.searchParams.get(e);
  if (!(!t || t === "undefined" || t.trim() === ""))
    return t;
}, Lg = ia ? oa("widget_id") || (Tt == null ? void 0 : Tt.widgetId) || void 0 : (Tt == null ? void 0 : Tt.widgetId) || void 0, Og = ia ? (Tt == null ? void 0 : Tt.initialToken) || oa("token") || void 0 : (Tt == null ? void 0 : Tt.initialToken) || void 0, Pg = Zu(Ig, {
  widgetId: Lg,
  token: Og || void 0,
  initialAuthError: null
  // Let backend determine if auth is required
});
Pg.mount("#app");
