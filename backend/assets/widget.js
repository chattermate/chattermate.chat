var ju = Object.defineProperty;
var Vu = (e, t, n) => t in e ? ju(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var tt = (e, t, n) => Vu(e, typeof t != "symbol" ? t + "" : t, n);
/**
* @vue/shared v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function vo(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const n of e.split(",")) t[n] = 1;
  return (n) => n in t;
}
const nt = {}, fs = [], an = () => {
}, Ku = () => !1, Jr = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), bo = (e) => e.startsWith("onUpdate:"), xt = Object.assign, wo = (e, t) => {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}, Gu = Object.prototype.hasOwnProperty, qe = (e, t) => Gu.call(e, t), de = Array.isArray, hs = (e) => Qr(e) === "[object Map]", Il = (e) => Qr(e) === "[object Set]", _e = (e) => typeof e == "function", ut = (e) => typeof e == "string", $n = (e) => typeof e == "symbol", at = (e) => e !== null && typeof e == "object", Ll = (e) => (at(e) || _e(e)) && _e(e.then) && _e(e.catch), Ol = Object.prototype.toString, Qr = (e) => Ol.call(e), Yu = (e) => Qr(e).slice(8, -1), Nl = (e) => Qr(e) === "[object Object]", ko = (e) => ut(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, qs = /* @__PURE__ */ vo(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), ei = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (n) => t[n] || (t[n] = e(n));
}, Xu = /-(\w)/g, Fn = ei(
  (e) => e.replace(Xu, (t, n) => n ? n.toUpperCase() : "")
), Zu = /\B([A-Z])/g, Un = ei(
  (e) => e.replace(Zu, "-$1").toLowerCase()
), Ml = ei((e) => e.charAt(0).toUpperCase() + e.slice(1)), Ai = ei(
  (e) => e ? `on${Ml(e)}` : ""
), Mn = (e, t) => !Object.is(e, t), Tr = (e, ...t) => {
  for (let n = 0; n < e.length; n++)
    e[n](...t);
}, Yi = (e, t, n, s = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: s,
    value: n
  });
}, Xi = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let Ta;
const ti = () => Ta || (Ta = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function Ae(e) {
  if (de(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
      const s = e[n], r = ut(s) ? tf(s) : Ae(s);
      if (r)
        for (const i in r)
          t[i] = r[i];
    }
    return t;
  } else if (ut(e) || at(e))
    return e;
}
const Ju = /;(?![^(]*\))/g, Qu = /:([^]+)/, ef = /\/\*[^]*?\*\//g;
function tf(e) {
  const t = {};
  return e.replace(ef, "").split(Ju).forEach((n) => {
    if (n) {
      const s = n.split(Qu);
      s.length > 1 && (t[s[0].trim()] = s[1].trim());
    }
  }), t;
}
function $e(e) {
  let t = "";
  if (ut(e))
    t = e;
  else if (de(e))
    for (let n = 0; n < e.length; n++) {
      const s = $e(e[n]);
      s && (t += s + " ");
    }
  else if (at(e))
    for (const n in e)
      e[n] && (t += n + " ");
  return t.trim();
}
const nf = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", sf = /* @__PURE__ */ vo(nf);
function Pl(e) {
  return !!e || e === "";
}
const Fl = (e) => !!(e && e.__v_isRef === !0), Z = (e) => ut(e) ? e : e == null ? "" : de(e) || at(e) && (e.toString === Ol || !_e(e.toString)) ? Fl(e) ? Z(e.value) : JSON.stringify(e, Dl, 2) : String(e), Dl = (e, t) => Fl(t) ? Dl(e, t.value) : hs(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (n, [s, r], i) => (n[Ei(s, i) + " =>"] = r, n),
    {}
  )
} : Il(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((n) => Ei(n))
} : $n(t) ? Ei(t) : at(t) && !de(t) && !Nl(t) ? String(t) : t, Ei = (e, t = "") => {
  var n;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    $n(e) ? `Symbol(${(n = e.description) != null ? n : t})` : e
  );
};
/**
* @vue/reactivity v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let Ft;
class rf {
  constructor(t = !1) {
    this.detached = t, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this.parent = Ft, !t && Ft && (this.index = (Ft.scopes || (Ft.scopes = [])).push(
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
      const n = Ft;
      try {
        return Ft = this, t();
      } finally {
        Ft = n;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = Ft, Ft = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    this._on > 0 && --this._on === 0 && (Ft = this.prevScope, this.prevScope = void 0);
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
function of() {
  return Ft;
}
let st;
const Si = /* @__PURE__ */ new WeakSet();
class Bl {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, Ft && Ft.active && Ft.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, Si.has(this) && (Si.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Ul(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, Aa(this), zl(this);
    const t = st, n = Qt;
    st = this, Qt = !0;
    try {
      return this.fn();
    } finally {
      Hl(this), st = t, Qt = n, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        Ao(t);
      this.deps = this.depsTail = void 0, Aa(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? Si.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    Zi(this) && this.run();
  }
  get dirty() {
    return Zi(this);
  }
}
let $l = 0, js, Vs;
function Ul(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = Vs, Vs = e;
    return;
  }
  e.next = js, js = e;
}
function xo() {
  $l++;
}
function To() {
  if (--$l > 0)
    return;
  if (Vs) {
    let t = Vs;
    for (Vs = void 0; t; ) {
      const n = t.next;
      t.next = void 0, t.flags &= -9, t = n;
    }
  }
  let e;
  for (; js; ) {
    let t = js;
    for (js = void 0; t; ) {
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
function zl(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Hl(e) {
  let t, n = e.depsTail, s = n;
  for (; s; ) {
    const r = s.prevDep;
    s.version === -1 ? (s === n && (n = r), Ao(s), af(s)) : t = s, s.dep.activeLink = s.prevActiveLink, s.prevActiveLink = void 0, s = r;
  }
  e.deps = t, e.depsTail = n;
}
function Zi(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (Wl(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function Wl(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === Js) || (e.globalVersion = Js, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !Zi(e))))
    return;
  e.flags |= 2;
  const t = e.dep, n = st, s = Qt;
  st = e, Qt = !0;
  try {
    zl(e);
    const r = e.fn(e._value);
    (t.version === 0 || Mn(r, e._value)) && (e.flags |= 128, e._value = r, t.version++);
  } catch (r) {
    throw t.version++, r;
  } finally {
    st = n, Qt = s, Hl(e), e.flags &= -3;
  }
}
function Ao(e, t = !1) {
  const { dep: n, prevSub: s, nextSub: r } = e;
  if (s && (s.nextSub = r, e.prevSub = void 0), r && (r.prevSub = s, e.nextSub = void 0), n.subs === e && (n.subs = s, !s && n.computed)) {
    n.computed.flags &= -5;
    for (let i = n.computed.deps; i; i = i.nextDep)
      Ao(i, !0);
  }
  !t && !--n.sc && n.map && n.map.delete(n.key);
}
function af(e) {
  const { prevDep: t, nextDep: n } = e;
  t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
let Qt = !0;
const ql = [];
function wn() {
  ql.push(Qt), Qt = !1;
}
function kn() {
  const e = ql.pop();
  Qt = e === void 0 ? !0 : e;
}
function Aa(e) {
  const { cleanup: t } = e;
  if (e.cleanup = void 0, t) {
    const n = st;
    st = void 0;
    try {
      t();
    } finally {
      st = n;
    }
  }
}
let Js = 0;
class lf {
  constructor(t, n) {
    this.sub = t, this.dep = n, this.version = n.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Eo {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(t) {
    if (!st || !Qt || st === this.computed)
      return;
    let n = this.activeLink;
    if (n === void 0 || n.sub !== st)
      n = this.activeLink = new lf(st, this), st.deps ? (n.prevDep = st.depsTail, st.depsTail.nextDep = n, st.depsTail = n) : st.deps = st.depsTail = n, jl(n);
    else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
      const s = n.nextDep;
      s.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = s), n.prevDep = st.depsTail, n.nextDep = void 0, st.depsTail.nextDep = n, st.depsTail = n, st.deps === n && (st.deps = s);
    }
    return n;
  }
  trigger(t) {
    this.version++, Js++, this.notify(t);
  }
  notify(t) {
    xo();
    try {
      for (let n = this.subs; n; n = n.prevSub)
        n.sub.notify() && n.sub.dep.notify();
    } finally {
      To();
    }
  }
}
function jl(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let s = t.deps; s; s = s.nextDep)
        jl(s);
    }
    const n = e.dep.subs;
    n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
  }
}
const Ji = /* @__PURE__ */ new WeakMap(), Qn = Symbol(
  ""
), Qi = Symbol(
  ""
), Qs = Symbol(
  ""
);
function wt(e, t, n) {
  if (Qt && st) {
    let s = Ji.get(e);
    s || Ji.set(e, s = /* @__PURE__ */ new Map());
    let r = s.get(n);
    r || (s.set(n, r = new Eo()), r.map = s, r.key = n), r.track();
  }
}
function _n(e, t, n, s, r, i) {
  const o = Ji.get(e);
  if (!o) {
    Js++;
    return;
  }
  const a = (l) => {
    l && l.trigger();
  };
  if (xo(), t === "clear")
    o.forEach(a);
  else {
    const l = de(e), h = l && ko(n);
    if (l && n === "length") {
      const c = Number(s);
      o.forEach((w, k) => {
        (k === "length" || k === Qs || !$n(k) && k >= c) && a(w);
      });
    } else
      switch ((n !== void 0 || o.has(void 0)) && a(o.get(n)), h && a(o.get(Qs)), t) {
        case "add":
          l ? h && a(o.get("length")) : (a(o.get(Qn)), hs(e) && a(o.get(Qi)));
          break;
        case "delete":
          l || (a(o.get(Qn)), hs(e) && a(o.get(Qi)));
          break;
        case "set":
          hs(e) && a(o.get(Qn));
          break;
      }
  }
  To();
}
function ls(e) {
  const t = We(e);
  return t === e ? t : (wt(t, "iterate", Qs), Vt(e) ? t : t.map(yt));
}
function ni(e) {
  return wt(e = We(e), "iterate", Qs), e;
}
const cf = {
  __proto__: null,
  [Symbol.iterator]() {
    return Ci(this, Symbol.iterator, yt);
  },
  concat(...e) {
    return ls(this).concat(
      ...e.map((t) => de(t) ? ls(t) : t)
    );
  },
  entries() {
    return Ci(this, "entries", (e) => (e[1] = yt(e[1]), e));
  },
  every(e, t) {
    return dn(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return dn(this, "filter", e, t, (n) => n.map(yt), arguments);
  },
  find(e, t) {
    return dn(this, "find", e, t, yt, arguments);
  },
  findIndex(e, t) {
    return dn(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return dn(this, "findLast", e, t, yt, arguments);
  },
  findLastIndex(e, t) {
    return dn(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return dn(this, "forEach", e, t, void 0, arguments);
  },
  includes(...e) {
    return Ri(this, "includes", e);
  },
  indexOf(...e) {
    return Ri(this, "indexOf", e);
  },
  join(e) {
    return ls(this).join(e);
  },
  // keys() iterator only reads `length`, no optimisation required
  lastIndexOf(...e) {
    return Ri(this, "lastIndexOf", e);
  },
  map(e, t) {
    return dn(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return Rs(this, "pop");
  },
  push(...e) {
    return Rs(this, "push", e);
  },
  reduce(e, ...t) {
    return Ea(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return Ea(this, "reduceRight", e, t);
  },
  shift() {
    return Rs(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return dn(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return Rs(this, "splice", e);
  },
  toReversed() {
    return ls(this).toReversed();
  },
  toSorted(e) {
    return ls(this).toSorted(e);
  },
  toSpliced(...e) {
    return ls(this).toSpliced(...e);
  },
  unshift(...e) {
    return Rs(this, "unshift", e);
  },
  values() {
    return Ci(this, "values", yt);
  }
};
function Ci(e, t, n) {
  const s = ni(e), r = s[t]();
  return s !== e && !Vt(e) && (r._next = r.next, r.next = () => {
    const i = r._next();
    return i.value && (i.value = n(i.value)), i;
  }), r;
}
const uf = Array.prototype;
function dn(e, t, n, s, r, i) {
  const o = ni(e), a = o !== e && !Vt(e), l = o[t];
  if (l !== uf[t]) {
    const w = l.apply(e, i);
    return a ? yt(w) : w;
  }
  let h = n;
  o !== e && (a ? h = function(w, k) {
    return n.call(this, yt(w), k, e);
  } : n.length > 2 && (h = function(w, k) {
    return n.call(this, w, k, e);
  }));
  const c = l.call(o, h, s);
  return a && r ? r(c) : c;
}
function Ea(e, t, n, s) {
  const r = ni(e);
  let i = n;
  return r !== e && (Vt(e) ? n.length > 3 && (i = function(o, a, l) {
    return n.call(this, o, a, l, e);
  }) : i = function(o, a, l) {
    return n.call(this, o, yt(a), l, e);
  }), r[t](i, ...s);
}
function Ri(e, t, n) {
  const s = We(e);
  wt(s, "iterate", Qs);
  const r = s[t](...n);
  return (r === -1 || r === !1) && Ro(n[0]) ? (n[0] = We(n[0]), s[t](...n)) : r;
}
function Rs(e, t, n = []) {
  wn(), xo();
  const s = We(e)[t].apply(e, n);
  return To(), kn(), s;
}
const ff = /* @__PURE__ */ vo("__proto__,__v_isRef,__isVue"), Vl = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter($n)
);
function hf(e) {
  $n(e) || (e = String(e));
  const t = We(this);
  return wt(t, "has", e), t.hasOwnProperty(e);
}
class Kl {
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
      return s === (r ? i ? kf : Zl : i ? Xl : Yl).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(s) ? t : void 0;
    const o = de(t);
    if (!r) {
      let l;
      if (o && (l = cf[n]))
        return l;
      if (n === "hasOwnProperty")
        return hf;
    }
    const a = Reflect.get(
      t,
      n,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      kt(t) ? t : s
    );
    return ($n(n) ? Vl.has(n) : ff(n)) || (r || wt(t, "get", n), i) ? a : kt(a) ? o && ko(n) ? a : a.value : at(a) ? r ? Jl(a) : si(a) : a;
  }
}
class Gl extends Kl {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, n, s, r) {
    let i = t[n];
    if (!this._isShallow) {
      const l = Dn(i);
      if (!Vt(s) && !Dn(s) && (i = We(i), s = We(s)), !de(t) && kt(i) && !kt(s))
        return l ? !1 : (i.value = s, !0);
    }
    const o = de(t) && ko(n) ? Number(n) < t.length : qe(t, n), a = Reflect.set(
      t,
      n,
      s,
      kt(t) ? t : r
    );
    return t === We(r) && (o ? Mn(s, i) && _n(t, "set", n, s) : _n(t, "add", n, s)), a;
  }
  deleteProperty(t, n) {
    const s = qe(t, n);
    t[n];
    const r = Reflect.deleteProperty(t, n);
    return r && s && _n(t, "delete", n, void 0), r;
  }
  has(t, n) {
    const s = Reflect.has(t, n);
    return (!$n(n) || !Vl.has(n)) && wt(t, "has", n), s;
  }
  ownKeys(t) {
    return wt(
      t,
      "iterate",
      de(t) ? "length" : Qn
    ), Reflect.ownKeys(t);
  }
}
class df extends Kl {
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
const pf = /* @__PURE__ */ new Gl(), gf = /* @__PURE__ */ new df(), mf = /* @__PURE__ */ new Gl(!0);
const eo = (e) => e, mr = (e) => Reflect.getPrototypeOf(e);
function _f(e, t, n) {
  return function(...s) {
    const r = this.__v_raw, i = We(r), o = hs(i), a = e === "entries" || e === Symbol.iterator && o, l = e === "keys" && o, h = r[e](...s), c = n ? eo : t ? $r : yt;
    return !t && wt(
      i,
      "iterate",
      l ? Qi : Qn
    ), {
      // iterator protocol
      next() {
        const { value: w, done: k } = h.next();
        return k ? { value: w, done: k } : {
          value: a ? [c(w[0]), c(w[1])] : c(w),
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
function _r(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function yf(e, t) {
  const n = {
    get(r) {
      const i = this.__v_raw, o = We(i), a = We(r);
      e || (Mn(r, a) && wt(o, "get", r), wt(o, "get", a));
      const { has: l } = mr(o), h = t ? eo : e ? $r : yt;
      if (l.call(o, r))
        return h(i.get(r));
      if (l.call(o, a))
        return h(i.get(a));
      i !== o && i.get(r);
    },
    get size() {
      const r = this.__v_raw;
      return !e && wt(We(r), "iterate", Qn), Reflect.get(r, "size", r);
    },
    has(r) {
      const i = this.__v_raw, o = We(i), a = We(r);
      return e || (Mn(r, a) && wt(o, "has", r), wt(o, "has", a)), r === a ? i.has(r) : i.has(r) || i.has(a);
    },
    forEach(r, i) {
      const o = this, a = o.__v_raw, l = We(a), h = t ? eo : e ? $r : yt;
      return !e && wt(l, "iterate", Qn), a.forEach((c, w) => r.call(i, h(c), h(w), o));
    }
  };
  return xt(
    n,
    e ? {
      add: _r("add"),
      set: _r("set"),
      delete: _r("delete"),
      clear: _r("clear")
    } : {
      add(r) {
        !t && !Vt(r) && !Dn(r) && (r = We(r));
        const i = We(this);
        return mr(i).has.call(i, r) || (i.add(r), _n(i, "add", r, r)), this;
      },
      set(r, i) {
        !t && !Vt(i) && !Dn(i) && (i = We(i));
        const o = We(this), { has: a, get: l } = mr(o);
        let h = a.call(o, r);
        h || (r = We(r), h = a.call(o, r));
        const c = l.call(o, r);
        return o.set(r, i), h ? Mn(i, c) && _n(o, "set", r, i) : _n(o, "add", r, i), this;
      },
      delete(r) {
        const i = We(this), { has: o, get: a } = mr(i);
        let l = o.call(i, r);
        l || (r = We(r), l = o.call(i, r)), a && a.call(i, r);
        const h = i.delete(r);
        return l && _n(i, "delete", r, void 0), h;
      },
      clear() {
        const r = We(this), i = r.size !== 0, o = r.clear();
        return i && _n(
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
    n[r] = _f(r, e, t);
  }), n;
}
function So(e, t) {
  const n = yf(e, t);
  return (s, r, i) => r === "__v_isReactive" ? !e : r === "__v_isReadonly" ? e : r === "__v_raw" ? s : Reflect.get(
    qe(n, r) && r in s ? n : s,
    r,
    i
  );
}
const vf = {
  get: /* @__PURE__ */ So(!1, !1)
}, bf = {
  get: /* @__PURE__ */ So(!1, !0)
}, wf = {
  get: /* @__PURE__ */ So(!0, !1)
};
const Yl = /* @__PURE__ */ new WeakMap(), Xl = /* @__PURE__ */ new WeakMap(), Zl = /* @__PURE__ */ new WeakMap(), kf = /* @__PURE__ */ new WeakMap();
function xf(e) {
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
function Tf(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : xf(Yu(e));
}
function si(e) {
  return Dn(e) ? e : Co(
    e,
    !1,
    pf,
    vf,
    Yl
  );
}
function Af(e) {
  return Co(
    e,
    !1,
    mf,
    bf,
    Xl
  );
}
function Jl(e) {
  return Co(
    e,
    !0,
    gf,
    wf,
    Zl
  );
}
function Co(e, t, n, s, r) {
  if (!at(e) || e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const i = Tf(e);
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
function ds(e) {
  return Dn(e) ? ds(e.__v_raw) : !!(e && e.__v_isReactive);
}
function Dn(e) {
  return !!(e && e.__v_isReadonly);
}
function Vt(e) {
  return !!(e && e.__v_isShallow);
}
function Ro(e) {
  return e ? !!e.__v_raw : !1;
}
function We(e) {
  const t = e && e.__v_raw;
  return t ? We(t) : e;
}
function Ef(e) {
  return !qe(e, "__v_skip") && Object.isExtensible(e) && Yi(e, "__v_skip", !0), e;
}
const yt = (e) => at(e) ? si(e) : e, $r = (e) => at(e) ? Jl(e) : e;
function kt(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function re(e) {
  return Sf(e, !1);
}
function Sf(e, t) {
  return kt(e) ? e : new Cf(e, t);
}
class Cf {
  constructor(t, n) {
    this.dep = new Eo(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? t : We(t), this._value = n ? t : yt(t), this.__v_isShallow = n;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const n = this._rawValue, s = this.__v_isShallow || Vt(t) || Dn(t);
    t = s ? t : We(t), Mn(t, n) && (this._rawValue = t, this._value = s ? t : yt(t), this.dep.trigger());
  }
}
function C(e) {
  return kt(e) ? e.value : e;
}
const Rf = {
  get: (e, t, n) => t === "__v_raw" ? e : C(Reflect.get(e, t, n)),
  set: (e, t, n, s) => {
    const r = e[t];
    return kt(r) && !kt(n) ? (r.value = n, !0) : Reflect.set(e, t, n, s);
  }
};
function Ql(e) {
  return ds(e) ? e : new Proxy(e, Rf);
}
class If {
  constructor(t, n, s) {
    this.fn = t, this.setter = n, this._value = void 0, this.dep = new Eo(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Js - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = s;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    st !== this)
      return Ul(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return Wl(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
function Lf(e, t, n = !1) {
  let s, r;
  return _e(e) ? s = e : (s = e.get, r = e.set), new If(s, r, n);
}
const yr = {}, Ur = /* @__PURE__ */ new WeakMap();
let Zn;
function Of(e, t = !1, n = Zn) {
  if (n) {
    let s = Ur.get(n);
    s || Ur.set(n, s = []), s.push(e);
  }
}
function Nf(e, t, n = nt) {
  const { immediate: s, deep: r, once: i, scheduler: o, augmentJob: a, call: l } = n, h = (x) => r ? x : Vt(x) || r === !1 || r === 0 ? yn(x, 1) : yn(x);
  let c, w, k, D, I = !1, j = !1;
  if (kt(e) ? (w = () => e.value, I = Vt(e)) : ds(e) ? (w = () => h(e), I = !0) : de(e) ? (j = !0, I = e.some((x) => ds(x) || Vt(x)), w = () => e.map((x) => {
    if (kt(x))
      return x.value;
    if (ds(x))
      return h(x);
    if (_e(x))
      return l ? l(x, 2) : x();
  })) : _e(e) ? t ? w = l ? () => l(e, 2) : e : w = () => {
    if (k) {
      wn();
      try {
        k();
      } finally {
        kn();
      }
    }
    const x = Zn;
    Zn = c;
    try {
      return l ? l(e, 3, [D]) : e(D);
    } finally {
      Zn = x;
    }
  } : w = an, t && r) {
    const x = w, L = r === !0 ? 1 / 0 : r;
    w = () => yn(x(), L);
  }
  const F = of(), ie = () => {
    c.stop(), F && F.active && wo(F.effects, c);
  };
  if (i && t) {
    const x = t;
    t = (...L) => {
      x(...L), ie();
    };
  }
  let ce = j ? new Array(e.length).fill(yr) : yr;
  const oe = (x) => {
    if (!(!(c.flags & 1) || !c.dirty && !x))
      if (t) {
        const L = c.run();
        if (r || I || (j ? L.some((K, Y) => Mn(K, ce[Y])) : Mn(L, ce))) {
          k && k();
          const K = Zn;
          Zn = c;
          try {
            const Y = [
              L,
              // pass undefined as the old value when it's changed for the first time
              ce === yr ? void 0 : j && ce[0] === yr ? [] : ce,
              D
            ];
            ce = L, l ? l(t, 3, Y) : (
              // @ts-expect-error
              t(...Y)
            );
          } finally {
            Zn = K;
          }
        }
      } else
        c.run();
  };
  return a && a(oe), c = new Bl(w), c.scheduler = o ? () => o(oe, !1) : oe, D = (x) => Of(x, !1, c), k = c.onStop = () => {
    const x = Ur.get(c);
    if (x) {
      if (l)
        l(x, 4);
      else
        for (const L of x) L();
      Ur.delete(c);
    }
  }, t ? s ? oe(!0) : ce = c.run() : o ? o(oe.bind(null, !0), !0) : c.run(), ie.pause = c.pause.bind(c), ie.resume = c.resume.bind(c), ie.stop = ie, ie;
}
function yn(e, t = 1 / 0, n) {
  if (t <= 0 || !at(e) || e.__v_skip || (n = n || /* @__PURE__ */ new Set(), n.has(e)))
    return e;
  if (n.add(e), t--, kt(e))
    yn(e.value, t, n);
  else if (de(e))
    for (let s = 0; s < e.length; s++)
      yn(e[s], t, n);
  else if (Il(e) || hs(e))
    e.forEach((s) => {
      yn(s, t, n);
    });
  else if (Nl(e)) {
    for (const s in e)
      yn(e[s], t, n);
    for (const s of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, s) && yn(e[s], t, n);
  }
  return e;
}
/**
* @vue/runtime-core v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function sr(e, t, n, s) {
  try {
    return s ? e(...s) : e();
  } catch (r) {
    ri(r, t, n);
  }
}
function un(e, t, n, s) {
  if (_e(e)) {
    const r = sr(e, t, n, s);
    return r && Ll(r) && r.catch((i) => {
      ri(i, t, n);
    }), r;
  }
  if (de(e)) {
    const r = [];
    for (let i = 0; i < e.length; i++)
      r.push(un(e[i], t, n, s));
    return r;
  }
}
function ri(e, t, n, s = !0) {
  const r = t ? t.vnode : null, { errorHandler: i, throwUnhandledErrorInProduction: o } = t && t.appContext.config || nt;
  if (t) {
    let a = t.parent;
    const l = t.proxy, h = `https://vuejs.org/error-reference/#runtime-${n}`;
    for (; a; ) {
      const c = a.ec;
      if (c) {
        for (let w = 0; w < c.length; w++)
          if (c[w](e, l, h) === !1)
            return;
      }
      a = a.parent;
    }
    if (i) {
      wn(), sr(i, null, 10, [
        e,
        l,
        h
      ]), kn();
      return;
    }
  }
  Mf(e, n, r, s, o);
}
function Mf(e, t, n, s = !0, r = !1) {
  if (r)
    throw e;
  console.error(e);
}
const Ct = [];
let rn = -1;
const ps = [];
let Ln = null, cs = 0;
const ec = /* @__PURE__ */ Promise.resolve();
let zr = null;
function es(e) {
  const t = zr || ec;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function Pf(e) {
  let t = rn + 1, n = Ct.length;
  for (; t < n; ) {
    const s = t + n >>> 1, r = Ct[s], i = er(r);
    i < e || i === e && r.flags & 2 ? t = s + 1 : n = s;
  }
  return t;
}
function Io(e) {
  if (!(e.flags & 1)) {
    const t = er(e), n = Ct[Ct.length - 1];
    !n || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= er(n) ? Ct.push(e) : Ct.splice(Pf(t), 0, e), e.flags |= 1, tc();
  }
}
function tc() {
  zr || (zr = ec.then(sc));
}
function Ff(e) {
  de(e) ? ps.push(...e) : Ln && e.id === -1 ? Ln.splice(cs + 1, 0, e) : e.flags & 1 || (ps.push(e), e.flags |= 1), tc();
}
function Sa(e, t, n = rn + 1) {
  for (; n < Ct.length; n++) {
    const s = Ct[n];
    if (s && s.flags & 2) {
      if (e && s.id !== e.uid)
        continue;
      Ct.splice(n, 1), n--, s.flags & 4 && (s.flags &= -2), s(), s.flags & 4 || (s.flags &= -2);
    }
  }
}
function nc(e) {
  if (ps.length) {
    const t = [...new Set(ps)].sort(
      (n, s) => er(n) - er(s)
    );
    if (ps.length = 0, Ln) {
      Ln.push(...t);
      return;
    }
    for (Ln = t, cs = 0; cs < Ln.length; cs++) {
      const n = Ln[cs];
      n.flags & 4 && (n.flags &= -2), n.flags & 8 || n(), n.flags &= -2;
    }
    Ln = null, cs = 0;
  }
}
const er = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function sc(e) {
  try {
    for (rn = 0; rn < Ct.length; rn++) {
      const t = Ct[rn];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), sr(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; rn < Ct.length; rn++) {
      const t = Ct[rn];
      t && (t.flags &= -2);
    }
    rn = -1, Ct.length = 0, nc(), zr = null, (Ct.length || ps.length) && sc();
  }
}
let jt = null, rc = null;
function Hr(e) {
  const t = jt;
  return jt = e, rc = e && e.type.__scopeId || null, t;
}
function Df(e, t = jt, n) {
  if (!t || e._n)
    return e;
  const s = (...r) => {
    s._d && Fa(-1);
    const i = Hr(t);
    let o;
    try {
      o = e(...r);
    } finally {
      Hr(i), s._d && Fa(1);
    }
    return o;
  };
  return s._n = !0, s._c = !0, s._d = !0, s;
}
function In(e, t) {
  if (jt === null)
    return e;
  const n = ci(jt), s = e.dirs || (e.dirs = []);
  for (let r = 0; r < t.length; r++) {
    let [i, o, a, l = nt] = t[r];
    i && (_e(i) && (i = {
      mounted: i,
      updated: i
    }), i.deep && yn(o), s.push({
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
function Kn(e, t, n, s) {
  const r = e.dirs, i = t && t.dirs;
  for (let o = 0; o < r.length; o++) {
    const a = r[o];
    i && (a.oldValue = i[o].value);
    let l = a.dir[s];
    l && (wn(), un(l, n, 8, [
      e.el,
      a,
      e,
      t
    ]), kn());
  }
}
const Bf = Symbol("_vte"), $f = (e) => e.__isTeleport;
function Lo(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, Lo(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function Oo(e, t) {
  return _e(e) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    xt({ name: e.name }, t, { setup: e })
  ) : e;
}
function ic(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
function Ks(e, t, n, s, r = !1) {
  if (de(e)) {
    e.forEach(
      (I, j) => Ks(
        I,
        t && (de(t) ? t[j] : t),
        n,
        s,
        r
      )
    );
    return;
  }
  if (Gs(s) && !r) {
    s.shapeFlag & 512 && s.type.__asyncResolved && s.component.subTree.component && Ks(e, t, n, s.component.subTree);
    return;
  }
  const i = s.shapeFlag & 4 ? ci(s.component) : s.el, o = r ? null : i, { i: a, r: l } = e, h = t && t.r, c = a.refs === nt ? a.refs = {} : a.refs, w = a.setupState, k = We(w), D = w === nt ? () => !1 : (I) => qe(k, I);
  if (h != null && h !== l && (ut(h) ? (c[h] = null, D(h) && (w[h] = null)) : kt(h) && (h.value = null)), _e(l))
    sr(l, a, 12, [o, c]);
  else {
    const I = ut(l), j = kt(l);
    if (I || j) {
      const F = () => {
        if (e.f) {
          const ie = I ? D(l) ? w[l] : c[l] : l.value;
          r ? de(ie) && wo(ie, i) : de(ie) ? ie.includes(i) || ie.push(i) : I ? (c[l] = [i], D(l) && (w[l] = c[l])) : (l.value = [i], e.k && (c[e.k] = l.value));
        } else I ? (c[l] = o, D(l) && (w[l] = o)) : j && (l.value = o, e.k && (c[e.k] = o));
      };
      o ? (F.id = -1, Bt(F, n)) : F();
    }
  }
}
ti().requestIdleCallback;
ti().cancelIdleCallback;
const Gs = (e) => !!e.type.__asyncLoader, oc = (e) => e.type.__isKeepAlive;
function Uf(e, t) {
  ac(e, "a", t);
}
function zf(e, t) {
  ac(e, "da", t);
}
function ac(e, t, n = Rt) {
  const s = e.__wdc || (e.__wdc = () => {
    let r = n;
    for (; r; ) {
      if (r.isDeactivated)
        return;
      r = r.parent;
    }
    return e();
  });
  if (ii(t, s, n), n) {
    let r = n.parent;
    for (; r && r.parent; )
      oc(r.parent.vnode) && Hf(s, t, n, r), r = r.parent;
  }
}
function Hf(e, t, n, s) {
  const r = ii(
    t,
    e,
    s,
    !0
    /* prepend */
  );
  rr(() => {
    wo(s[t], r);
  }, n);
}
function ii(e, t, n = Rt, s = !1) {
  if (n) {
    const r = n[e] || (n[e] = []), i = t.__weh || (t.__weh = (...o) => {
      wn();
      const a = ir(n), l = un(t, n, e, o);
      return a(), kn(), l;
    });
    return s ? r.unshift(i) : r.push(i), i;
  }
}
const xn = (e) => (t, n = Rt) => {
  (!nr || e === "sp") && ii(e, (...s) => t(...s), n);
}, Wf = xn("bm"), oi = xn("m"), qf = xn(
  "bu"
), jf = xn("u"), lc = xn(
  "bum"
), rr = xn("um"), Vf = xn(
  "sp"
), Kf = xn("rtg"), Gf = xn("rtc");
function Yf(e, t = Rt) {
  ii("ec", e, t);
}
const Xf = Symbol.for("v-ndc");
function _t(e, t, n, s) {
  let r;
  const i = n, o = de(e);
  if (o || ut(e)) {
    const a = o && ds(e);
    let l = !1, h = !1;
    a && (l = !Vt(e), h = Dn(e), e = ni(e)), r = new Array(e.length);
    for (let c = 0, w = e.length; c < w; c++)
      r[c] = t(
        l ? h ? $r(yt(e[c])) : yt(e[c]) : e[c],
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
      for (let l = 0, h = a.length; l < h; l++) {
        const c = a[l];
        r[l] = t(e[c], c, l, i);
      }
    }
  else
    r = [];
  return r;
}
const to = (e) => e ? Rc(e) ? ci(e) : to(e.parent) : null, Ys = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ xt(/* @__PURE__ */ Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => e.props,
    $attrs: (e) => e.attrs,
    $slots: (e) => e.slots,
    $refs: (e) => e.refs,
    $parent: (e) => to(e.parent),
    $root: (e) => to(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => uc(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      Io(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = es.bind(e.proxy)),
    $watch: (e) => yh.bind(e)
  })
), Ii = (e, t) => e !== nt && !e.__isScriptSetup && qe(e, t), Zf = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: n, setupState: s, data: r, props: i, accessCache: o, type: a, appContext: l } = e;
    let h;
    if (t[0] !== "$") {
      const D = o[t];
      if (D !== void 0)
        switch (D) {
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
        if (Ii(s, t))
          return o[t] = 1, s[t];
        if (r !== nt && qe(r, t))
          return o[t] = 2, r[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (h = e.propsOptions[0]) && qe(h, t)
        )
          return o[t] = 3, i[t];
        if (n !== nt && qe(n, t))
          return o[t] = 4, n[t];
        no && (o[t] = 0);
      }
    }
    const c = Ys[t];
    let w, k;
    if (c)
      return t === "$attrs" && wt(e.attrs, "get", ""), c(e);
    if (
      // css module (injected by vue-loader)
      (w = a.__cssModules) && (w = w[t])
    )
      return w;
    if (n !== nt && qe(n, t))
      return o[t] = 4, n[t];
    if (
      // global properties
      k = l.config.globalProperties, qe(k, t)
    )
      return k[t];
  },
  set({ _: e }, t, n) {
    const { data: s, setupState: r, ctx: i } = e;
    return Ii(r, t) ? (r[t] = n, !0) : s !== nt && qe(s, t) ? (s[t] = n, !0) : qe(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (i[t] = n, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: n, ctx: s, appContext: r, propsOptions: i }
  }, o) {
    let a;
    return !!n[o] || e !== nt && qe(e, o) || Ii(t, o) || (a = i[0]) && qe(a, o) || qe(s, o) || qe(Ys, o) || qe(r.config.globalProperties, o);
  },
  defineProperty(e, t, n) {
    return n.get != null ? e._.accessCache[t] = 0 : qe(n, "value") && this.set(e, t, n.value, null), Reflect.defineProperty(e, t, n);
  }
};
function Ca(e) {
  return de(e) ? e.reduce(
    (t, n) => (t[n] = null, t),
    {}
  ) : e;
}
let no = !0;
function Jf(e) {
  const t = uc(e), n = e.proxy, s = e.ctx;
  no = !1, t.beforeCreate && Ra(t.beforeCreate, e, "bc");
  const {
    // state
    data: r,
    computed: i,
    methods: o,
    watch: a,
    provide: l,
    inject: h,
    // lifecycle
    created: c,
    beforeMount: w,
    mounted: k,
    beforeUpdate: D,
    updated: I,
    activated: j,
    deactivated: F,
    beforeDestroy: ie,
    beforeUnmount: ce,
    destroyed: oe,
    unmounted: x,
    render: L,
    renderTracked: K,
    renderTriggered: Y,
    errorCaptured: ye,
    serverPrefetch: Ne,
    // public API
    expose: De,
    inheritAttrs: ke,
    // assets
    components: pe,
    directives: Ye,
    filters: Xe
  } = t;
  if (h && Qf(h, s, null), o)
    for (const ge in o) {
      const le = o[ge];
      _e(le) && (s[ge] = le.bind(n));
    }
  if (r) {
    const ge = r.call(n, n);
    at(ge) && (e.data = si(ge));
  }
  if (no = !0, i)
    for (const ge in i) {
      const le = i[ge], rt = _e(le) ? le.bind(n, n) : _e(le.get) ? le.get.bind(n, n) : an, xe = !_e(le) && _e(le.set) ? le.set.bind(n) : an, ve = ae({
        get: rt,
        set: xe
      });
      Object.defineProperty(s, ge, {
        enumerable: !0,
        configurable: !0,
        get: () => ve.value,
        set: (Ee) => ve.value = Ee
      });
    }
  if (a)
    for (const ge in a)
      cc(a[ge], s, n, ge);
  if (l) {
    const ge = _e(l) ? l.call(n) : l;
    Reflect.ownKeys(ge).forEach((le) => {
      ih(le, ge[le]);
    });
  }
  c && Ra(c, e, "c");
  function fe(ge, le) {
    de(le) ? le.forEach((rt) => ge(rt.bind(n))) : le && ge(le.bind(n));
  }
  if (fe(Wf, w), fe(oi, k), fe(qf, D), fe(jf, I), fe(Uf, j), fe(zf, F), fe(Yf, ye), fe(Gf, K), fe(Kf, Y), fe(lc, ce), fe(rr, x), fe(Vf, Ne), de(De))
    if (De.length) {
      const ge = e.exposed || (e.exposed = {});
      De.forEach((le) => {
        Object.defineProperty(ge, le, {
          get: () => n[le],
          set: (rt) => n[le] = rt,
          enumerable: !0
        });
      });
    } else e.exposed || (e.exposed = {});
  L && e.render === an && (e.render = L), ke != null && (e.inheritAttrs = ke), pe && (e.components = pe), Ye && (e.directives = Ye), Ne && ic(e);
}
function Qf(e, t, n = an) {
  de(e) && (e = so(e));
  for (const s in e) {
    const r = e[s];
    let i;
    at(r) ? "default" in r ? i = Ar(
      r.from || s,
      r.default,
      !0
    ) : i = Ar(r.from || s) : i = Ar(r), kt(i) ? Object.defineProperty(t, s, {
      enumerable: !0,
      configurable: !0,
      get: () => i.value,
      set: (o) => i.value = o
    }) : t[s] = i;
  }
}
function Ra(e, t, n) {
  un(
    de(e) ? e.map((s) => s.bind(t.proxy)) : e.bind(t.proxy),
    t,
    n
  );
}
function cc(e, t, n, s) {
  let r = s.includes(".") ? xc(n, s) : () => n[s];
  if (ut(e)) {
    const i = t[e];
    _e(i) && St(r, i);
  } else if (_e(e))
    St(r, e.bind(n));
  else if (at(e))
    if (de(e))
      e.forEach((i) => cc(i, t, n, s));
    else {
      const i = _e(e.handler) ? e.handler.bind(n) : t[e.handler];
      _e(i) && St(r, i, e);
    }
}
function uc(e) {
  const t = e.type, { mixins: n, extends: s } = t, {
    mixins: r,
    optionsCache: i,
    config: { optionMergeStrategies: o }
  } = e.appContext, a = i.get(t);
  let l;
  return a ? l = a : !r.length && !n && !s ? l = t : (l = {}, r.length && r.forEach(
    (h) => Wr(l, h, o, !0)
  ), Wr(l, t, o)), at(t) && i.set(t, l), l;
}
function Wr(e, t, n, s = !1) {
  const { mixins: r, extends: i } = t;
  i && Wr(e, i, n, !0), r && r.forEach(
    (o) => Wr(e, o, n, !0)
  );
  for (const o in t)
    if (!(s && o === "expose")) {
      const a = eh[o] || n && n[o];
      e[o] = a ? a(e[o], t[o]) : t[o];
    }
  return e;
}
const eh = {
  data: Ia,
  props: La,
  emits: La,
  // objects
  methods: zs,
  computed: zs,
  // lifecycle
  beforeCreate: Et,
  created: Et,
  beforeMount: Et,
  mounted: Et,
  beforeUpdate: Et,
  updated: Et,
  beforeDestroy: Et,
  beforeUnmount: Et,
  destroyed: Et,
  unmounted: Et,
  activated: Et,
  deactivated: Et,
  errorCaptured: Et,
  serverPrefetch: Et,
  // assets
  components: zs,
  directives: zs,
  // watch
  watch: nh,
  // provide / inject
  provide: Ia,
  inject: th
};
function Ia(e, t) {
  return t ? e ? function() {
    return xt(
      _e(e) ? e.call(this, this) : e,
      _e(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function th(e, t) {
  return zs(so(e), so(t));
}
function so(e) {
  if (de(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++)
      t[e[n]] = e[n];
    return t;
  }
  return e;
}
function Et(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function zs(e, t) {
  return e ? xt(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function La(e, t) {
  return e ? de(e) && de(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : xt(
    /* @__PURE__ */ Object.create(null),
    Ca(e),
    Ca(t ?? {})
  ) : t;
}
function nh(e, t) {
  if (!e) return t;
  if (!t) return e;
  const n = xt(/* @__PURE__ */ Object.create(null), e);
  for (const s in t)
    n[s] = Et(e[s], t[s]);
  return n;
}
function fc() {
  return {
    app: null,
    config: {
      isNativeTag: Ku,
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
let sh = 0;
function rh(e, t) {
  return function(s, r = null) {
    _e(s) || (s = xt({}, s)), r != null && !at(r) && (r = null);
    const i = fc(), o = /* @__PURE__ */ new WeakSet(), a = [];
    let l = !1;
    const h = i.app = {
      _uid: sh++,
      _component: s,
      _props: r,
      _container: null,
      _context: i,
      _instance: null,
      version: $h,
      get config() {
        return i.config;
      },
      set config(c) {
      },
      use(c, ...w) {
        return o.has(c) || (c && _e(c.install) ? (o.add(c), c.install(h, ...w)) : _e(c) && (o.add(c), c(h, ...w))), h;
      },
      mixin(c) {
        return i.mixins.includes(c) || i.mixins.push(c), h;
      },
      component(c, w) {
        return w ? (i.components[c] = w, h) : i.components[c];
      },
      directive(c, w) {
        return w ? (i.directives[c] = w, h) : i.directives[c];
      },
      mount(c, w, k) {
        if (!l) {
          const D = h._ceVNode || ln(s, r);
          return D.appContext = i, k === !0 ? k = "svg" : k === !1 && (k = void 0), e(D, c, k), l = !0, h._container = c, c.__vue_app__ = h, ci(D.component);
        }
      },
      onUnmount(c) {
        a.push(c);
      },
      unmount() {
        l && (un(
          a,
          h._instance,
          16
        ), e(null, h._container), delete h._container.__vue_app__);
      },
      provide(c, w) {
        return i.provides[c] = w, h;
      },
      runWithContext(c) {
        const w = gs;
        gs = h;
        try {
          return c();
        } finally {
          gs = w;
        }
      }
    };
    return h;
  };
}
let gs = null;
function ih(e, t) {
  if (Rt) {
    let n = Rt.provides;
    const s = Rt.parent && Rt.parent.provides;
    s === n && (n = Rt.provides = Object.create(s)), n[e] = t;
  }
}
function Ar(e, t, n = !1) {
  const s = Nh();
  if (s || gs) {
    let r = gs ? gs._context.provides : s ? s.parent == null || s.ce ? s.vnode.appContext && s.vnode.appContext.provides : s.parent.provides : void 0;
    if (r && e in r)
      return r[e];
    if (arguments.length > 1)
      return n && _e(t) ? t.call(s && s.proxy) : t;
  }
}
const hc = {}, dc = () => Object.create(hc), pc = (e) => Object.getPrototypeOf(e) === hc;
function oh(e, t, n, s = !1) {
  const r = {}, i = dc();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), gc(e, t, r, i);
  for (const o in e.propsOptions[0])
    o in r || (r[o] = void 0);
  n ? e.props = s ? r : Af(r) : e.type.props ? e.props = r : e.props = i, e.attrs = i;
}
function ah(e, t, n, s) {
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
      const c = e.vnode.dynamicProps;
      for (let w = 0; w < c.length; w++) {
        let k = c[w];
        if (ai(e.emitsOptions, k))
          continue;
        const D = t[k];
        if (l)
          if (qe(i, k))
            D !== i[k] && (i[k] = D, h = !0);
          else {
            const I = Fn(k);
            r[I] = ro(
              l,
              a,
              I,
              D,
              e,
              !1
            );
          }
        else
          D !== i[k] && (i[k] = D, h = !0);
      }
    }
  } else {
    gc(e, t, r, i) && (h = !0);
    let c;
    for (const w in a)
      (!t || // for camelCase
      !qe(t, w) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((c = Un(w)) === w || !qe(t, c))) && (l ? n && // for camelCase
      (n[w] !== void 0 || // for kebab-case
      n[c] !== void 0) && (r[w] = ro(
        l,
        a,
        w,
        void 0,
        e,
        !0
      )) : delete r[w]);
    if (i !== a)
      for (const w in i)
        (!t || !qe(t, w)) && (delete i[w], h = !0);
  }
  h && _n(e.attrs, "set", "");
}
function gc(e, t, n, s) {
  const [r, i] = e.propsOptions;
  let o = !1, a;
  if (t)
    for (let l in t) {
      if (qs(l))
        continue;
      const h = t[l];
      let c;
      r && qe(r, c = Fn(l)) ? !i || !i.includes(c) ? n[c] = h : (a || (a = {}))[c] = h : ai(e.emitsOptions, l) || (!(l in s) || h !== s[l]) && (s[l] = h, o = !0);
    }
  if (i) {
    const l = We(n), h = a || nt;
    for (let c = 0; c < i.length; c++) {
      const w = i[c];
      n[w] = ro(
        r,
        l,
        w,
        h[w],
        e,
        !qe(h, w)
      );
    }
  }
  return o;
}
function ro(e, t, n, s, r, i) {
  const o = e[n];
  if (o != null) {
    const a = qe(o, "default");
    if (a && s === void 0) {
      const l = o.default;
      if (o.type !== Function && !o.skipFactory && _e(l)) {
        const { propsDefaults: h } = r;
        if (n in h)
          s = h[n];
        else {
          const c = ir(r);
          s = h[n] = l.call(
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
    ] && (s === "" || s === Un(n)) && (s = !0));
  }
  return s;
}
const lh = /* @__PURE__ */ new WeakMap();
function mc(e, t, n = !1) {
  const s = n ? lh : t.propsCache, r = s.get(e);
  if (r)
    return r;
  const i = e.props, o = {}, a = [];
  let l = !1;
  if (!_e(e)) {
    const c = (w) => {
      l = !0;
      const [k, D] = mc(w, t, !0);
      xt(o, k), D && a.push(...D);
    };
    !n && t.mixins.length && t.mixins.forEach(c), e.extends && c(e.extends), e.mixins && e.mixins.forEach(c);
  }
  if (!i && !l)
    return at(e) && s.set(e, fs), fs;
  if (de(i))
    for (let c = 0; c < i.length; c++) {
      const w = Fn(i[c]);
      Oa(w) && (o[w] = nt);
    }
  else if (i)
    for (const c in i) {
      const w = Fn(c);
      if (Oa(w)) {
        const k = i[c], D = o[w] = de(k) || _e(k) ? { type: k } : xt({}, k), I = D.type;
        let j = !1, F = !0;
        if (de(I))
          for (let ie = 0; ie < I.length; ++ie) {
            const ce = I[ie], oe = _e(ce) && ce.name;
            if (oe === "Boolean") {
              j = !0;
              break;
            } else oe === "String" && (F = !1);
          }
        else
          j = _e(I) && I.name === "Boolean";
        D[
          0
          /* shouldCast */
        ] = j, D[
          1
          /* shouldCastTrue */
        ] = F, (j || qe(D, "default")) && a.push(w);
      }
    }
  const h = [o, a];
  return at(e) && s.set(e, h), h;
}
function Oa(e) {
  return e[0] !== "$" && !qs(e);
}
const No = (e) => e === "_" || e === "__" || e === "_ctx" || e === "$stable", Mo = (e) => de(e) ? e.map(on) : [on(e)], ch = (e, t, n) => {
  if (t._n)
    return t;
  const s = Df((...r) => Mo(t(...r)), n);
  return s._c = !1, s;
}, _c = (e, t, n) => {
  const s = e._ctx;
  for (const r in e) {
    if (No(r)) continue;
    const i = e[r];
    if (_e(i))
      t[r] = ch(r, i, s);
    else if (i != null) {
      const o = Mo(i);
      t[r] = () => o;
    }
  }
}, yc = (e, t) => {
  const n = Mo(t);
  e.slots.default = () => n;
}, vc = (e, t, n) => {
  for (const s in t)
    (n || !No(s)) && (e[s] = t[s]);
}, uh = (e, t, n) => {
  const s = e.slots = dc();
  if (e.vnode.shapeFlag & 32) {
    const r = t.__;
    r && Yi(s, "__", r, !0);
    const i = t._;
    i ? (vc(s, t, n), n && Yi(s, "_", i, !0)) : _c(t, s);
  } else t && yc(e, t);
}, fh = (e, t, n) => {
  const { vnode: s, slots: r } = e;
  let i = !0, o = nt;
  if (s.shapeFlag & 32) {
    const a = t._;
    a ? n && a === 1 ? i = !1 : vc(r, t, n) : (i = !t.$stable, _c(t, r)), o = t;
  } else t && (yc(e, t), o = { default: 1 });
  if (i)
    for (const a in r)
      !No(a) && o[a] == null && delete r[a];
}, Bt = Ah;
function hh(e) {
  return dh(e);
}
function dh(e, t) {
  const n = ti();
  n.__VUE__ = !0;
  const {
    insert: s,
    remove: r,
    patchProp: i,
    createElement: o,
    createText: a,
    createComment: l,
    setText: h,
    setElementText: c,
    parentNode: w,
    nextSibling: k,
    setScopeId: D = an,
    insertStaticContent: I
  } = e, j = (g, _, E, $ = null, N = null, B = null, V = void 0, W = null, q = !!_.dynamicChildren) => {
    if (g === _)
      return;
    g && !Is(g, _) && ($ = ht(g), Ee(g, N, B, !0), g = null), _.patchFlag === -2 && (q = !1, _.dynamicChildren = null);
    const { type: b, ref: R, shapeFlag: M } = _;
    switch (b) {
      case li:
        F(g, _, E, $);
        break;
      case Bn:
        ie(g, _, E, $);
        break;
      case Er:
        g == null && ce(_, E, $, V);
        break;
      case Ue:
        pe(
          g,
          _,
          E,
          $,
          N,
          B,
          V,
          W,
          q
        );
        break;
      default:
        M & 1 ? L(
          g,
          _,
          E,
          $,
          N,
          B,
          V,
          W,
          q
        ) : M & 6 ? Ye(
          g,
          _,
          E,
          $,
          N,
          B,
          V,
          W,
          q
        ) : (M & 64 || M & 128) && b.process(
          g,
          _,
          E,
          $,
          N,
          B,
          V,
          W,
          q,
          gt
        );
    }
    R != null && N ? Ks(R, g && g.ref, B, _ || g, !_) : R == null && g && g.ref != null && Ks(g.ref, null, B, g, !0);
  }, F = (g, _, E, $) => {
    if (g == null)
      s(
        _.el = a(_.children),
        E,
        $
      );
    else {
      const N = _.el = g.el;
      _.children !== g.children && h(N, _.children);
    }
  }, ie = (g, _, E, $) => {
    g == null ? s(
      _.el = l(_.children || ""),
      E,
      $
    ) : _.el = g.el;
  }, ce = (g, _, E, $) => {
    [g.el, g.anchor] = I(
      g.children,
      _,
      E,
      $,
      g.el,
      g.anchor
    );
  }, oe = ({ el: g, anchor: _ }, E, $) => {
    let N;
    for (; g && g !== _; )
      N = k(g), s(g, E, $), g = N;
    s(_, E, $);
  }, x = ({ el: g, anchor: _ }) => {
    let E;
    for (; g && g !== _; )
      E = k(g), r(g), g = E;
    r(_);
  }, L = (g, _, E, $, N, B, V, W, q) => {
    _.type === "svg" ? V = "svg" : _.type === "math" && (V = "mathml"), g == null ? K(
      _,
      E,
      $,
      N,
      B,
      V,
      W,
      q
    ) : Ne(
      g,
      _,
      N,
      B,
      V,
      W,
      q
    );
  }, K = (g, _, E, $, N, B, V, W) => {
    let q, b;
    const { props: R, shapeFlag: M, transition: z, dirs: G } = g;
    if (q = g.el = o(
      g.type,
      B,
      R && R.is,
      R
    ), M & 8 ? c(q, g.children) : M & 16 && ye(
      g.children,
      q,
      null,
      $,
      N,
      Li(g, B),
      V,
      W
    ), G && Kn(g, null, $, "created"), Y(q, g, g.scopeId, V, $), R) {
      for (const me in R)
        me !== "value" && !qs(me) && i(q, me, null, R[me], B, $);
      "value" in R && i(q, "value", null, R.value, B), (b = R.onVnodeBeforeMount) && tn(b, $, g);
    }
    G && Kn(g, null, $, "beforeMount");
    const te = ph(N, z);
    te && z.beforeEnter(q), s(q, _, E), ((b = R && R.onVnodeMounted) || te || G) && Bt(() => {
      b && tn(b, $, g), te && z.enter(q), G && Kn(g, null, $, "mounted");
    }, N);
  }, Y = (g, _, E, $, N) => {
    if (E && D(g, E), $)
      for (let B = 0; B < $.length; B++)
        D(g, $[B]);
    if (N) {
      let B = N.subTree;
      if (_ === B || Ac(B.type) && (B.ssContent === _ || B.ssFallback === _)) {
        const V = N.vnode;
        Y(
          g,
          V,
          V.scopeId,
          V.slotScopeIds,
          N.parent
        );
      }
    }
  }, ye = (g, _, E, $, N, B, V, W, q = 0) => {
    for (let b = q; b < g.length; b++) {
      const R = g[b] = W ? On(g[b]) : on(g[b]);
      j(
        null,
        R,
        _,
        E,
        $,
        N,
        B,
        V,
        W
      );
    }
  }, Ne = (g, _, E, $, N, B, V) => {
    const W = _.el = g.el;
    let { patchFlag: q, dynamicChildren: b, dirs: R } = _;
    q |= g.patchFlag & 16;
    const M = g.props || nt, z = _.props || nt;
    let G;
    if (E && Gn(E, !1), (G = z.onVnodeBeforeUpdate) && tn(G, E, _, g), R && Kn(_, g, E, "beforeUpdate"), E && Gn(E, !0), (M.innerHTML && z.innerHTML == null || M.textContent && z.textContent == null) && c(W, ""), b ? De(
      g.dynamicChildren,
      b,
      W,
      E,
      $,
      Li(_, N),
      B
    ) : V || le(
      g,
      _,
      W,
      null,
      E,
      $,
      Li(_, N),
      B,
      !1
    ), q > 0) {
      if (q & 16)
        ke(W, M, z, E, N);
      else if (q & 2 && M.class !== z.class && i(W, "class", null, z.class, N), q & 4 && i(W, "style", M.style, z.style, N), q & 8) {
        const te = _.dynamicProps;
        for (let me = 0; me < te.length; me++) {
          const ue = te[me], Qe = M[ue], Se = z[ue];
          (Se !== Qe || ue === "value") && i(W, ue, Qe, Se, N, E);
        }
      }
      q & 1 && g.children !== _.children && c(W, _.children);
    } else !V && b == null && ke(W, M, z, E, N);
    ((G = z.onVnodeUpdated) || R) && Bt(() => {
      G && tn(G, E, _, g), R && Kn(_, g, E, "updated");
    }, $);
  }, De = (g, _, E, $, N, B, V) => {
    for (let W = 0; W < _.length; W++) {
      const q = g[W], b = _[W], R = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        q.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (q.type === Ue || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !Is(q, b) || // - In the case of a component, it could contain anything.
        q.shapeFlag & 198) ? w(q.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          E
        )
      );
      j(
        q,
        b,
        R,
        null,
        $,
        N,
        B,
        V,
        !0
      );
    }
  }, ke = (g, _, E, $, N) => {
    if (_ !== E) {
      if (_ !== nt)
        for (const B in _)
          !qs(B) && !(B in E) && i(
            g,
            B,
            _[B],
            null,
            N,
            $
          );
      for (const B in E) {
        if (qs(B)) continue;
        const V = E[B], W = _[B];
        V !== W && B !== "value" && i(g, B, W, V, N, $);
      }
      "value" in E && i(g, "value", _.value, E.value, N);
    }
  }, pe = (g, _, E, $, N, B, V, W, q) => {
    const b = _.el = g ? g.el : a(""), R = _.anchor = g ? g.anchor : a("");
    let { patchFlag: M, dynamicChildren: z, slotScopeIds: G } = _;
    G && (W = W ? W.concat(G) : G), g == null ? (s(b, E, $), s(R, E, $), ye(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      _.children || [],
      E,
      R,
      N,
      B,
      V,
      W,
      q
    )) : M > 0 && M & 64 && z && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    g.dynamicChildren ? (De(
      g.dynamicChildren,
      z,
      E,
      N,
      B,
      V,
      W
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (_.key != null || N && _ === N.subTree) && bc(
      g,
      _,
      !0
      /* shallow */
    )) : le(
      g,
      _,
      E,
      R,
      N,
      B,
      V,
      W,
      q
    );
  }, Ye = (g, _, E, $, N, B, V, W, q) => {
    _.slotScopeIds = W, g == null ? _.shapeFlag & 512 ? N.ctx.activate(
      _,
      E,
      $,
      V,
      q
    ) : Xe(
      _,
      E,
      $,
      N,
      B,
      V,
      q
    ) : it(g, _, q);
  }, Xe = (g, _, E, $, N, B, V) => {
    const W = g.component = Oh(
      g,
      $,
      N
    );
    if (oc(g) && (W.ctx.renderer = gt), Mh(W, !1, V), W.asyncDep) {
      if (N && N.registerDep(W, fe, V), !g.el) {
        const q = W.subTree = ln(Bn);
        ie(null, q, _, E), g.placeholder = q.el;
      }
    } else
      fe(
        W,
        g,
        _,
        E,
        N,
        B,
        V
      );
  }, it = (g, _, E) => {
    const $ = _.component = g.component;
    if (xh(g, _, E))
      if ($.asyncDep && !$.asyncResolved) {
        ge($, _, E);
        return;
      } else
        $.next = _, $.update();
    else
      _.el = g.el, $.vnode = _;
  }, fe = (g, _, E, $, N, B, V) => {
    const W = () => {
      if (g.isMounted) {
        let { next: M, bu: z, u: G, parent: te, vnode: me } = g;
        {
          const f = wc(g);
          if (f) {
            M && (M.el = me.el, ge(g, M, V)), f.asyncDep.then(() => {
              g.isUnmounted || W();
            });
            return;
          }
        }
        let ue = M, Qe;
        Gn(g, !1), M ? (M.el = me.el, ge(g, M, V)) : M = me, z && Tr(z), (Qe = M.props && M.props.onVnodeBeforeUpdate) && tn(Qe, te, M, me), Gn(g, !0);
        const Se = Ma(g), Ve = g.subTree;
        g.subTree = Se, j(
          Ve,
          Se,
          // parent may have changed if it's in a teleport
          w(Ve.el),
          // anchor may have changed if it's in a fragment
          ht(Ve),
          g,
          N,
          B
        ), M.el = Se.el, ue === null && Th(g, Se.el), G && Bt(G, N), (Qe = M.props && M.props.onVnodeUpdated) && Bt(
          () => tn(Qe, te, M, me),
          N
        );
      } else {
        let M;
        const { el: z, props: G } = _, { bm: te, m: me, parent: ue, root: Qe, type: Se } = g, Ve = Gs(_);
        Gn(g, !1), te && Tr(te), !Ve && (M = G && G.onVnodeBeforeMount) && tn(M, ue, _), Gn(g, !0);
        {
          Qe.ce && // @ts-expect-error _def is private
          Qe.ce._def.shadowRoot !== !1 && Qe.ce._injectChildStyle(Se);
          const f = g.subTree = Ma(g);
          j(
            null,
            f,
            E,
            $,
            g,
            N,
            B
          ), _.el = f.el;
        }
        if (me && Bt(me, N), !Ve && (M = G && G.onVnodeMounted)) {
          const f = _;
          Bt(
            () => tn(M, ue, f),
            N
          );
        }
        (_.shapeFlag & 256 || ue && Gs(ue.vnode) && ue.vnode.shapeFlag & 256) && g.a && Bt(g.a, N), g.isMounted = !0, _ = E = $ = null;
      }
    };
    g.scope.on();
    const q = g.effect = new Bl(W);
    g.scope.off();
    const b = g.update = q.run.bind(q), R = g.job = q.runIfDirty.bind(q);
    R.i = g, R.id = g.uid, q.scheduler = () => Io(R), Gn(g, !0), b();
  }, ge = (g, _, E) => {
    _.component = g;
    const $ = g.vnode.props;
    g.vnode = _, g.next = null, ah(g, _.props, $, E), fh(g, _.children, E), wn(), Sa(g), kn();
  }, le = (g, _, E, $, N, B, V, W, q = !1) => {
    const b = g && g.children, R = g ? g.shapeFlag : 0, M = _.children, { patchFlag: z, shapeFlag: G } = _;
    if (z > 0) {
      if (z & 128) {
        xe(
          b,
          M,
          E,
          $,
          N,
          B,
          V,
          W,
          q
        );
        return;
      } else if (z & 256) {
        rt(
          b,
          M,
          E,
          $,
          N,
          B,
          V,
          W,
          q
        );
        return;
      }
    }
    G & 8 ? (R & 16 && ot(b, N, B), M !== b && c(E, M)) : R & 16 ? G & 16 ? xe(
      b,
      M,
      E,
      $,
      N,
      B,
      V,
      W,
      q
    ) : ot(b, N, B, !0) : (R & 8 && c(E, ""), G & 16 && ye(
      M,
      E,
      $,
      N,
      B,
      V,
      W,
      q
    ));
  }, rt = (g, _, E, $, N, B, V, W, q) => {
    g = g || fs, _ = _ || fs;
    const b = g.length, R = _.length, M = Math.min(b, R);
    let z;
    for (z = 0; z < M; z++) {
      const G = _[z] = q ? On(_[z]) : on(_[z]);
      j(
        g[z],
        G,
        E,
        null,
        N,
        B,
        V,
        W,
        q
      );
    }
    b > R ? ot(
      g,
      N,
      B,
      !0,
      !1,
      M
    ) : ye(
      _,
      E,
      $,
      N,
      B,
      V,
      W,
      q,
      M
    );
  }, xe = (g, _, E, $, N, B, V, W, q) => {
    let b = 0;
    const R = _.length;
    let M = g.length - 1, z = R - 1;
    for (; b <= M && b <= z; ) {
      const G = g[b], te = _[b] = q ? On(_[b]) : on(_[b]);
      if (Is(G, te))
        j(
          G,
          te,
          E,
          null,
          N,
          B,
          V,
          W,
          q
        );
      else
        break;
      b++;
    }
    for (; b <= M && b <= z; ) {
      const G = g[M], te = _[z] = q ? On(_[z]) : on(_[z]);
      if (Is(G, te))
        j(
          G,
          te,
          E,
          null,
          N,
          B,
          V,
          W,
          q
        );
      else
        break;
      M--, z--;
    }
    if (b > M) {
      if (b <= z) {
        const G = z + 1, te = G < R ? _[G].el : $;
        for (; b <= z; )
          j(
            null,
            _[b] = q ? On(_[b]) : on(_[b]),
            E,
            te,
            N,
            B,
            V,
            W,
            q
          ), b++;
      }
    } else if (b > z)
      for (; b <= M; )
        Ee(g[b], N, B, !0), b++;
    else {
      const G = b, te = b, me = /* @__PURE__ */ new Map();
      for (b = te; b <= z; b++) {
        const S = _[b] = q ? On(_[b]) : on(_[b]);
        S.key != null && me.set(S.key, b);
      }
      let ue, Qe = 0;
      const Se = z - te + 1;
      let Ve = !1, f = 0;
      const m = new Array(Se);
      for (b = 0; b < Se; b++) m[b] = 0;
      for (b = G; b <= M; b++) {
        const S = g[b];
        if (Qe >= Se) {
          Ee(S, N, B, !0);
          continue;
        }
        let U;
        if (S.key != null)
          U = me.get(S.key);
        else
          for (ue = te; ue <= z; ue++)
            if (m[ue - te] === 0 && Is(S, _[ue])) {
              U = ue;
              break;
            }
        U === void 0 ? Ee(S, N, B, !0) : (m[U - te] = b + 1, U >= f ? f = U : Ve = !0, j(
          S,
          _[U],
          E,
          null,
          N,
          B,
          V,
          W,
          q
        ), Qe++);
      }
      const O = Ve ? gh(m) : fs;
      for (ue = O.length - 1, b = Se - 1; b >= 0; b--) {
        const S = te + b, U = _[S], X = _[S + 1], Q = S + 1 < R ? (
          // #13559, fallback to el placeholder for unresolved async component
          X.el || X.placeholder
        ) : $;
        m[b] === 0 ? j(
          null,
          U,
          E,
          Q,
          N,
          B,
          V,
          W,
          q
        ) : Ve && (ue < 0 || b !== O[ue] ? ve(U, E, Q, 2) : ue--);
      }
    }
  }, ve = (g, _, E, $, N = null) => {
    const { el: B, type: V, transition: W, children: q, shapeFlag: b } = g;
    if (b & 6) {
      ve(g.component.subTree, _, E, $);
      return;
    }
    if (b & 128) {
      g.suspense.move(_, E, $);
      return;
    }
    if (b & 64) {
      V.move(g, _, E, gt);
      return;
    }
    if (V === Ue) {
      s(B, _, E);
      for (let M = 0; M < q.length; M++)
        ve(q[M], _, E, $);
      s(g.anchor, _, E);
      return;
    }
    if (V === Er) {
      oe(g, _, E);
      return;
    }
    if ($ !== 2 && b & 1 && W)
      if ($ === 0)
        W.beforeEnter(B), s(B, _, E), Bt(() => W.enter(B), N);
      else {
        const { leave: M, delayLeave: z, afterLeave: G } = W, te = () => {
          g.ctx.isUnmounted ? r(B) : s(B, _, E);
        }, me = () => {
          M(B, () => {
            te(), G && G();
          });
        };
        z ? z(B, te, me) : me();
      }
    else
      s(B, _, E);
  }, Ee = (g, _, E, $ = !1, N = !1) => {
    const {
      type: B,
      props: V,
      ref: W,
      children: q,
      dynamicChildren: b,
      shapeFlag: R,
      patchFlag: M,
      dirs: z,
      cacheIndex: G
    } = g;
    if (M === -2 && (N = !1), W != null && (wn(), Ks(W, null, E, g, !0), kn()), G != null && (_.renderCache[G] = void 0), R & 256) {
      _.ctx.deactivate(g);
      return;
    }
    const te = R & 1 && z, me = !Gs(g);
    let ue;
    if (me && (ue = V && V.onVnodeBeforeUnmount) && tn(ue, _, g), R & 6)
      Le(g.component, E, $);
    else {
      if (R & 128) {
        g.suspense.unmount(E, $);
        return;
      }
      te && Kn(g, null, _, "beforeUnmount"), R & 64 ? g.type.remove(
        g,
        _,
        E,
        gt,
        $
      ) : b && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !b.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (B !== Ue || M > 0 && M & 64) ? ot(
        b,
        _,
        E,
        !1,
        !0
      ) : (B === Ue && M & 384 || !N && R & 16) && ot(q, _, E), $ && Ie(g);
    }
    (me && (ue = V && V.onVnodeUnmounted) || te) && Bt(() => {
      ue && tn(ue, _, g), te && Kn(g, null, _, "unmounted");
    }, E);
  }, Ie = (g) => {
    const { type: _, el: E, anchor: $, transition: N } = g;
    if (_ === Ue) {
      Nt(E, $);
      return;
    }
    if (_ === Er) {
      x(g);
      return;
    }
    const B = () => {
      r(E), N && !N.persisted && N.afterLeave && N.afterLeave();
    };
    if (g.shapeFlag & 1 && N && !N.persisted) {
      const { leave: V, delayLeave: W } = N, q = () => V(E, B);
      W ? W(g.el, B, q) : q();
    } else
      B();
  }, Nt = (g, _) => {
    let E;
    for (; g !== _; )
      E = k(g), r(g), g = E;
    r(_);
  }, Le = (g, _, E) => {
    const {
      bum: $,
      scope: N,
      job: B,
      subTree: V,
      um: W,
      m: q,
      a: b,
      parent: R,
      slots: { __: M }
    } = g;
    Na(q), Na(b), $ && Tr($), R && de(M) && M.forEach((z) => {
      R.renderCache[z] = void 0;
    }), N.stop(), B && (B.flags |= 8, Ee(V, g, _, E)), W && Bt(W, _), Bt(() => {
      g.isUnmounted = !0;
    }, _), _ && _.pendingBranch && !_.isUnmounted && g.asyncDep && !g.asyncResolved && g.suspenseId === _.pendingId && (_.deps--, _.deps === 0 && _.resolve());
  }, ot = (g, _, E, $ = !1, N = !1, B = 0) => {
    for (let V = B; V < g.length; V++)
      Ee(g[V], _, E, $, N);
  }, ht = (g) => {
    if (g.shapeFlag & 6)
      return ht(g.component.subTree);
    if (g.shapeFlag & 128)
      return g.suspense.next();
    const _ = k(g.anchor || g.el), E = _ && _[Bf];
    return E ? k(E) : _;
  };
  let dt = !1;
  const vt = (g, _, E) => {
    g == null ? _._vnode && Ee(_._vnode, null, null, !0) : j(
      _._vnode || null,
      g,
      _,
      null,
      null,
      null,
      E
    ), _._vnode = g, dt || (dt = !0, Sa(), nc(), dt = !1);
  }, gt = {
    p: j,
    um: Ee,
    m: ve,
    r: Ie,
    mt: Xe,
    mc: ye,
    pc: le,
    pbc: De,
    n: ht,
    o: e
  };
  return {
    render: vt,
    hydrate: void 0,
    createApp: rh(vt)
  };
}
function Li({ type: e, props: t }, n) {
  return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function Gn({ effect: e, job: t }, n) {
  n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function ph(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function bc(e, t, n = !1) {
  const s = e.children, r = t.children;
  if (de(s) && de(r))
    for (let i = 0; i < s.length; i++) {
      const o = s[i];
      let a = r[i];
      a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = r[i] = On(r[i]), a.el = o.el), !n && a.patchFlag !== -2 && bc(o, a)), a.type === li && (a.el = o.el), a.type === Bn && !a.el && (a.el = o.el);
    }
}
function gh(e) {
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
function wc(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : wc(t);
}
function Na(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
const mh = Symbol.for("v-scx"), _h = () => Ar(mh);
function St(e, t, n) {
  return kc(e, t, n);
}
function kc(e, t, n = nt) {
  const { immediate: s, deep: r, flush: i, once: o } = n, a = xt({}, n), l = t && s || !t && i !== "post";
  let h;
  if (nr) {
    if (i === "sync") {
      const D = _h();
      h = D.__watcherHandles || (D.__watcherHandles = []);
    } else if (!l) {
      const D = () => {
      };
      return D.stop = an, D.resume = an, D.pause = an, D;
    }
  }
  const c = Rt;
  a.call = (D, I, j) => un(D, c, I, j);
  let w = !1;
  i === "post" ? a.scheduler = (D) => {
    Bt(D, c && c.suspense);
  } : i !== "sync" && (w = !0, a.scheduler = (D, I) => {
    I ? D() : Io(D);
  }), a.augmentJob = (D) => {
    t && (D.flags |= 4), w && (D.flags |= 2, c && (D.id = c.uid, D.i = c));
  };
  const k = Nf(e, t, a);
  return nr && (h ? h.push(k) : l && k()), k;
}
function yh(e, t, n) {
  const s = this.proxy, r = ut(e) ? e.includes(".") ? xc(s, e) : () => s[e] : e.bind(s, s);
  let i;
  _e(t) ? i = t : (i = t.handler, n = t);
  const o = ir(this), a = kc(r, i.bind(s), n);
  return o(), a;
}
function xc(e, t) {
  const n = t.split(".");
  return () => {
    let s = e;
    for (let r = 0; r < n.length && s; r++)
      s = s[n[r]];
    return s;
  };
}
const vh = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${Fn(t)}Modifiers`] || e[`${Un(t)}Modifiers`];
function bh(e, t, ...n) {
  if (e.isUnmounted) return;
  const s = e.vnode.props || nt;
  let r = n;
  const i = t.startsWith("update:"), o = i && vh(s, t.slice(7));
  o && (o.trim && (r = n.map((c) => ut(c) ? c.trim() : c)), o.number && (r = n.map(Xi)));
  let a, l = s[a = Ai(t)] || // also try camelCase event handler (#2249)
  s[a = Ai(Fn(t))];
  !l && i && (l = s[a = Ai(Un(t))]), l && un(
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
    e.emitted[a] = !0, un(
      h,
      e,
      6,
      r
    );
  }
}
function Tc(e, t, n = !1) {
  const s = t.emitsCache, r = s.get(e);
  if (r !== void 0)
    return r;
  const i = e.emits;
  let o = {}, a = !1;
  if (!_e(e)) {
    const l = (h) => {
      const c = Tc(h, t, !0);
      c && (a = !0, xt(o, c));
    };
    !n && t.mixins.length && t.mixins.forEach(l), e.extends && l(e.extends), e.mixins && e.mixins.forEach(l);
  }
  return !i && !a ? (at(e) && s.set(e, null), null) : (de(i) ? i.forEach((l) => o[l] = null) : xt(o, i), at(e) && s.set(e, o), o);
}
function ai(e, t) {
  return !e || !Jr(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), qe(e, t[0].toLowerCase() + t.slice(1)) || qe(e, Un(t)) || qe(e, t));
}
function Ma(e) {
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
    renderCache: c,
    props: w,
    data: k,
    setupState: D,
    ctx: I,
    inheritAttrs: j
  } = e, F = Hr(e);
  let ie, ce;
  try {
    if (n.shapeFlag & 4) {
      const x = r || s, L = x;
      ie = on(
        h.call(
          L,
          x,
          c,
          w,
          D,
          k,
          I
        )
      ), ce = a;
    } else {
      const x = t;
      ie = on(
        x.length > 1 ? x(
          w,
          { attrs: a, slots: o, emit: l }
        ) : x(
          w,
          null
        )
      ), ce = t.props ? a : wh(a);
    }
  } catch (x) {
    Xs.length = 0, ri(x, e, 1), ie = ln(Bn);
  }
  let oe = ie;
  if (ce && j !== !1) {
    const x = Object.keys(ce), { shapeFlag: L } = oe;
    x.length && L & 7 && (i && x.some(bo) && (ce = kh(
      ce,
      i
    )), oe = ys(oe, ce, !1, !0));
  }
  return n.dirs && (oe = ys(oe, null, !1, !0), oe.dirs = oe.dirs ? oe.dirs.concat(n.dirs) : n.dirs), n.transition && Lo(oe, n.transition), ie = oe, Hr(F), ie;
}
const wh = (e) => {
  let t;
  for (const n in e)
    (n === "class" || n === "style" || Jr(n)) && ((t || (t = {}))[n] = e[n]);
  return t;
}, kh = (e, t) => {
  const n = {};
  for (const s in e)
    (!bo(s) || !(s.slice(9) in t)) && (n[s] = e[s]);
  return n;
};
function xh(e, t, n) {
  const { props: s, children: r, component: i } = e, { props: o, children: a, patchFlag: l } = t, h = i.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (n && l >= 0) {
    if (l & 1024)
      return !0;
    if (l & 16)
      return s ? Pa(s, o, h) : !!o;
    if (l & 8) {
      const c = t.dynamicProps;
      for (let w = 0; w < c.length; w++) {
        const k = c[w];
        if (o[k] !== s[k] && !ai(h, k))
          return !0;
      }
    }
  } else
    return (r || a) && (!a || !a.$stable) ? !0 : s === o ? !1 : s ? o ? Pa(s, o, h) : !0 : !!o;
  return !1;
}
function Pa(e, t, n) {
  const s = Object.keys(t);
  if (s.length !== Object.keys(e).length)
    return !0;
  for (let r = 0; r < s.length; r++) {
    const i = s[r];
    if (t[i] !== e[i] && !ai(n, i))
      return !0;
  }
  return !1;
}
function Th({ vnode: e, parent: t }, n) {
  for (; t; ) {
    const s = t.subTree;
    if (s.suspense && s.suspense.activeBranch === e && (s.el = e.el), s === e)
      (e = t.vnode).el = n, t = t.parent;
    else
      break;
  }
}
const Ac = (e) => e.__isSuspense;
function Ah(e, t) {
  t && t.pendingBranch ? de(e) ? t.effects.push(...e) : t.effects.push(e) : Ff(e);
}
const Ue = Symbol.for("v-fgt"), li = Symbol.for("v-txt"), Bn = Symbol.for("v-cmt"), Er = Symbol.for("v-stc"), Xs = [];
let $t = null;
function T(e = !1) {
  Xs.push($t = e ? null : []);
}
function Eh() {
  Xs.pop(), $t = Xs[Xs.length - 1] || null;
}
let tr = 1;
function Fa(e, t = !1) {
  tr += e, e < 0 && $t && t && ($t.hasOnce = !0);
}
function Ec(e) {
  return e.dynamicChildren = tr > 0 ? $t || fs : null, Eh(), tr > 0 && $t && $t.push(e), e;
}
function A(e, t, n, s, r, i) {
  return Ec(
    v(
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
function qr(e, t, n, s, r) {
  return Ec(
    ln(
      e,
      t,
      n,
      s,
      r,
      !0
    )
  );
}
function Sc(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function Is(e, t) {
  return e.type === t.type && e.key === t.key;
}
const Cc = ({ key: e }) => e ?? null, Sr = ({
  ref: e,
  ref_key: t,
  ref_for: n
}) => (typeof e == "number" && (e = "" + e), e != null ? ut(e) || kt(e) || _e(e) ? { i: jt, r: e, k: t, f: !!n } : e : null);
function v(e, t = null, n = null, s = 0, r = null, i = e === Ue ? 0 : 1, o = !1, a = !1) {
  const l = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && Cc(t),
    ref: t && Sr(t),
    scopeId: rc,
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
    ctx: jt
  };
  return a ? (Po(l, n), i & 128 && e.normalize(l)) : n && (l.shapeFlag |= ut(n) ? 8 : 16), tr > 0 && // avoid a block node from tracking itself
  !o && // has current parent block
  $t && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (l.patchFlag > 0 || i & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  l.patchFlag !== 32 && $t.push(l), l;
}
const ln = Sh;
function Sh(e, t = null, n = null, s = 0, r = null, i = !1) {
  if ((!e || e === Xf) && (e = Bn), Sc(e)) {
    const a = ys(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return n && Po(a, n), tr > 0 && !i && $t && (a.shapeFlag & 6 ? $t[$t.indexOf(e)] = a : $t.push(a)), a.patchFlag = -2, a;
  }
  if (Bh(e) && (e = e.__vccOpts), t) {
    t = Ch(t);
    let { class: a, style: l } = t;
    a && !ut(a) && (t.class = $e(a)), at(l) && (Ro(l) && !de(l) && (l = xt({}, l)), t.style = Ae(l));
  }
  const o = ut(e) ? 1 : Ac(e) ? 128 : $f(e) ? 64 : at(e) ? 4 : _e(e) ? 2 : 0;
  return v(
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
function Ch(e) {
  return e ? Ro(e) || pc(e) ? xt({}, e) : e : null;
}
function ys(e, t, n = !1, s = !1) {
  const { props: r, ref: i, patchFlag: o, children: a, transition: l } = e, h = t ? Rh(r || {}, t) : r, c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: h,
    key: h && Cc(h),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && i ? de(i) ? i.concat(Sr(t)) : [i, Sr(t)] : Sr(t)
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
    patchFlag: t && e.type !== Ue ? o === -1 ? 16 : o | 16 : o,
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
    ssContent: e.ssContent && ys(e.ssContent),
    ssFallback: e.ssFallback && ys(e.ssFallback),
    placeholder: e.placeholder,
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce
  };
  return l && s && Lo(
    c,
    l.clone(c)
  ), c;
}
function pn(e = " ", t = 0) {
  return ln(li, null, e, t);
}
function Yn(e, t) {
  const n = ln(Er, null, e);
  return n.staticCount = t, n;
}
function se(e = "", t = !1) {
  return t ? (T(), qr(Bn, null, e)) : ln(Bn, null, e);
}
function on(e) {
  return e == null || typeof e == "boolean" ? ln(Bn) : de(e) ? ln(
    Ue,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : Sc(e) ? On(e) : ln(li, null, String(e));
}
function On(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : ys(e);
}
function Po(e, t) {
  let n = 0;
  const { shapeFlag: s } = e;
  if (t == null)
    t = null;
  else if (de(t))
    n = 16;
  else if (typeof t == "object")
    if (s & 65) {
      const r = t.default;
      r && (r._c && (r._d = !1), Po(e, r()), r._c && (r._d = !0));
      return;
    } else {
      n = 32;
      const r = t._;
      !r && !pc(t) ? t._ctx = jt : r === 3 && jt && (jt.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else _e(t) ? (t = { default: t, _ctx: jt }, n = 32) : (t = String(t), s & 64 ? (n = 16, t = [pn(t)]) : n = 8);
  e.children = t, e.shapeFlag |= n;
}
function Rh(...e) {
  const t = {};
  for (let n = 0; n < e.length; n++) {
    const s = e[n];
    for (const r in s)
      if (r === "class")
        t.class !== s.class && (t.class = $e([t.class, s.class]));
      else if (r === "style")
        t.style = Ae([t.style, s.style]);
      else if (Jr(r)) {
        const i = t[r], o = s[r];
        o && i !== o && !(de(i) && i.includes(o)) && (t[r] = i ? [].concat(i, o) : o);
      } else r !== "" && (t[r] = s[r]);
  }
  return t;
}
function tn(e, t, n, s = null) {
  un(e, t, 7, [
    n,
    s
  ]);
}
const Ih = fc();
let Lh = 0;
function Oh(e, t, n) {
  const s = e.type, r = (t ? t.appContext : e.appContext) || Ih, i = {
    uid: Lh++,
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
    scope: new rf(
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
    propsOptions: mc(s, r),
    emitsOptions: Tc(s, r),
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
  return i.ctx = { _: i }, i.root = t ? t.root : i, i.emit = bh.bind(null, i), e.ce && e.ce(i), i;
}
let Rt = null;
const Nh = () => Rt || jt;
let jr, io;
{
  const e = ti(), t = (n, s) => {
    let r;
    return (r = e[n]) || (r = e[n] = []), r.push(s), (i) => {
      r.length > 1 ? r.forEach((o) => o(i)) : r[0](i);
    };
  };
  jr = t(
    "__VUE_INSTANCE_SETTERS__",
    (n) => Rt = n
  ), io = t(
    "__VUE_SSR_SETTERS__",
    (n) => nr = n
  );
}
const ir = (e) => {
  const t = Rt;
  return jr(e), e.scope.on(), () => {
    e.scope.off(), jr(t);
  };
}, Da = () => {
  Rt && Rt.scope.off(), jr(null);
};
function Rc(e) {
  return e.vnode.shapeFlag & 4;
}
let nr = !1;
function Mh(e, t = !1, n = !1) {
  t && io(t);
  const { props: s, children: r } = e.vnode, i = Rc(e);
  oh(e, s, i, t), uh(e, r, n || t);
  const o = i ? Ph(e, t) : void 0;
  return t && io(!1), o;
}
function Ph(e, t) {
  const n = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Zf);
  const { setup: s } = n;
  if (s) {
    wn();
    const r = e.setupContext = s.length > 1 ? Dh(e) : null, i = ir(e), o = sr(
      s,
      e,
      0,
      [
        e.props,
        r
      ]
    ), a = Ll(o);
    if (kn(), i(), (a || e.sp) && !Gs(e) && ic(e), a) {
      if (o.then(Da, Da), t)
        return o.then((l) => {
          Ba(e, l);
        }).catch((l) => {
          ri(l, e, 0);
        });
      e.asyncDep = o;
    } else
      Ba(e, o);
  } else
    Ic(e);
}
function Ba(e, t, n) {
  _e(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : at(t) && (e.setupState = Ql(t)), Ic(e);
}
function Ic(e, t, n) {
  const s = e.type;
  e.render || (e.render = s.render || an);
  {
    const r = ir(e);
    wn();
    try {
      Jf(e);
    } finally {
      kn(), r();
    }
  }
}
const Fh = {
  get(e, t) {
    return wt(e, "get", ""), e[t];
  }
};
function Dh(e) {
  const t = (n) => {
    e.exposed = n || {};
  };
  return {
    attrs: new Proxy(e.attrs, Fh),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function ci(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(Ql(Ef(e.exposed)), {
    get(t, n) {
      if (n in t)
        return t[n];
      if (n in Ys)
        return Ys[n](e);
    },
    has(t, n) {
      return n in t || n in Ys;
    }
  })) : e.proxy;
}
function Bh(e) {
  return _e(e) && "__vccOpts" in e;
}
const ae = (e, t) => Lf(e, t, nr), $h = "3.5.18";
/**
* @vue/runtime-dom v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let oo;
const $a = typeof window < "u" && window.trustedTypes;
if ($a)
  try {
    oo = /* @__PURE__ */ $a.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const Lc = oo ? (e) => oo.createHTML(e) : (e) => e, Uh = "http://www.w3.org/2000/svg", zh = "http://www.w3.org/1998/Math/MathML", mn = typeof document < "u" ? document : null, Ua = mn && /* @__PURE__ */ mn.createElement("template"), Hh = {
  insert: (e, t, n) => {
    t.insertBefore(e, n || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, n, s) => {
    const r = t === "svg" ? mn.createElementNS(Uh, e) : t === "mathml" ? mn.createElementNS(zh, e) : n ? mn.createElement(e, { is: n }) : mn.createElement(e);
    return e === "select" && s && s.multiple != null && r.setAttribute("multiple", s.multiple), r;
  },
  createText: (e) => mn.createTextNode(e),
  createComment: (e) => mn.createComment(e),
  setText: (e, t) => {
    e.nodeValue = t;
  },
  setElementText: (e, t) => {
    e.textContent = t;
  },
  parentNode: (e) => e.parentNode,
  nextSibling: (e) => e.nextSibling,
  querySelector: (e) => mn.querySelector(e),
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
      Ua.innerHTML = Lc(
        s === "svg" ? `<svg>${e}</svg>` : s === "mathml" ? `<math>${e}</math>` : e
      );
      const a = Ua.content;
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
}, Wh = Symbol("_vtc");
function qh(e, t, n) {
  const s = e[Wh];
  s && (t = (t ? [t, ...s] : [...s]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
const Vr = Symbol("_vod"), Oc = Symbol("_vsh"), jh = {
  beforeMount(e, { value: t }, { transition: n }) {
    e[Vr] = e.style.display === "none" ? "" : e.style.display, n && t ? n.beforeEnter(e) : Ls(e, t);
  },
  mounted(e, { value: t }, { transition: n }) {
    n && t && n.enter(e);
  },
  updated(e, { value: t, oldValue: n }, { transition: s }) {
    !t != !n && (s ? t ? (s.beforeEnter(e), Ls(e, !0), s.enter(e)) : s.leave(e, () => {
      Ls(e, !1);
    }) : Ls(e, t));
  },
  beforeUnmount(e, { value: t }) {
    Ls(e, t);
  }
};
function Ls(e, t) {
  e.style.display = t ? e[Vr] : "none", e[Oc] = !t;
}
const Vh = Symbol(""), Kh = /(^|;)\s*display\s*:/;
function Gh(e, t, n) {
  const s = e.style, r = ut(n);
  let i = !1;
  if (n && !r) {
    if (t)
      if (ut(t))
        for (const o of t.split(";")) {
          const a = o.slice(0, o.indexOf(":")).trim();
          n[a] == null && Cr(s, a, "");
        }
      else
        for (const o in t)
          n[o] == null && Cr(s, o, "");
    for (const o in n)
      o === "display" && (i = !0), Cr(s, o, n[o]);
  } else if (r) {
    if (t !== n) {
      const o = s[Vh];
      o && (n += ";" + o), s.cssText = n, i = Kh.test(n);
    }
  } else t && e.removeAttribute("style");
  Vr in e && (e[Vr] = i ? s.display : "", e[Oc] && (s.display = "none"));
}
const za = /\s*!important$/;
function Cr(e, t, n) {
  if (de(n))
    n.forEach((s) => Cr(e, t, s));
  else if (n == null && (n = ""), t.startsWith("--"))
    e.setProperty(t, n);
  else {
    const s = Yh(e, t);
    za.test(n) ? e.setProperty(
      Un(s),
      n.replace(za, ""),
      "important"
    ) : e[s] = n;
  }
}
const Ha = ["Webkit", "Moz", "ms"], Oi = {};
function Yh(e, t) {
  const n = Oi[t];
  if (n)
    return n;
  let s = Fn(t);
  if (s !== "filter" && s in e)
    return Oi[t] = s;
  s = Ml(s);
  for (let r = 0; r < Ha.length; r++) {
    const i = Ha[r] + s;
    if (i in e)
      return Oi[t] = i;
  }
  return t;
}
const Wa = "http://www.w3.org/1999/xlink";
function qa(e, t, n, s, r, i = sf(t)) {
  s && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(Wa, t.slice(6, t.length)) : e.setAttributeNS(Wa, t, n) : n == null || i && !Pl(n) ? e.removeAttribute(t) : e.setAttribute(
    t,
    i ? "" : $n(n) ? String(n) : n
  );
}
function ja(e, t, n, s, r) {
  if (t === "innerHTML" || t === "textContent") {
    n != null && (e[t] = t === "innerHTML" ? Lc(n) : n);
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
    a === "boolean" ? n = Pl(n) : n == null && a === "string" ? (n = "", o = !0) : a === "number" && (n = 0, o = !0);
  }
  try {
    e[t] = n;
  } catch {
  }
  o && e.removeAttribute(r || t);
}
function us(e, t, n, s) {
  e.addEventListener(t, n, s);
}
function Xh(e, t, n, s) {
  e.removeEventListener(t, n, s);
}
const Va = Symbol("_vei");
function Zh(e, t, n, s, r = null) {
  const i = e[Va] || (e[Va] = {}), o = i[t];
  if (s && o)
    o.value = s;
  else {
    const [a, l] = Jh(t);
    if (s) {
      const h = i[t] = td(
        s,
        r
      );
      us(e, a, h, l);
    } else o && (Xh(e, a, o, l), i[t] = void 0);
  }
}
const Ka = /(?:Once|Passive|Capture)$/;
function Jh(e) {
  let t;
  if (Ka.test(e)) {
    t = {};
    let s;
    for (; s = e.match(Ka); )
      e = e.slice(0, e.length - s[0].length), t[s[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : Un(e.slice(2)), t];
}
let Ni = 0;
const Qh = /* @__PURE__ */ Promise.resolve(), ed = () => Ni || (Qh.then(() => Ni = 0), Ni = Date.now());
function td(e, t) {
  const n = (s) => {
    if (!s._vts)
      s._vts = Date.now();
    else if (s._vts <= n.attached)
      return;
    un(
      nd(s, n.value),
      t,
      5,
      [s]
    );
  };
  return n.value = e, n.attached = ed(), n;
}
function nd(e, t) {
  if (de(t)) {
    const n = e.stopImmediatePropagation;
    return e.stopImmediatePropagation = () => {
      n.call(e), e._stopped = !0;
    }, t.map(
      (s) => (r) => !r._stopped && s && s(r)
    );
  } else
    return t;
}
const Ga = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, sd = (e, t, n, s, r, i) => {
  const o = r === "svg";
  t === "class" ? qh(e, s, o) : t === "style" ? Gh(e, n, s) : Jr(t) ? bo(t) || Zh(e, t, n, s, i) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : rd(e, t, s, o)) ? (ja(e, t, s), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && qa(e, t, s, o, i, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !ut(s)) ? ja(e, Fn(t), s, i, t) : (t === "true-value" ? e._trueValue = s : t === "false-value" && (e._falseValue = s), qa(e, t, s, o));
};
function rd(e, t, n, s) {
  if (s)
    return !!(t === "innerHTML" || t === "textContent" || t in e && Ga(t) && _e(n));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const r = e.tagName;
    if (r === "IMG" || r === "VIDEO" || r === "CANVAS" || r === "SOURCE")
      return !1;
  }
  return Ga(t) && ut(n) ? !1 : t in e;
}
const Ya = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return de(t) ? (n) => Tr(t, n) : t;
};
function id(e) {
  e.target.composing = !0;
}
function Xa(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const Mi = Symbol("_assign"), Xn = {
  created(e, { modifiers: { lazy: t, trim: n, number: s } }, r) {
    e[Mi] = Ya(r);
    const i = s || r.props && r.props.type === "number";
    us(e, t ? "change" : "input", (o) => {
      if (o.target.composing) return;
      let a = e.value;
      n && (a = a.trim()), i && (a = Xi(a)), e[Mi](a);
    }), n && us(e, "change", () => {
      e.value = e.value.trim();
    }), t || (us(e, "compositionstart", id), us(e, "compositionend", Xa), us(e, "change", Xa));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t }) {
    e.value = t ?? "";
  },
  beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: s, trim: r, number: i } }, o) {
    if (e[Mi] = Ya(o), e.composing) return;
    const a = (i || e.type === "number") && !/^0\d/.test(e.value) ? Xi(e.value) : e.value, l = t ?? "";
    a !== l && (document.activeElement === e && e.type !== "range" && (s && t === n || r && e.value.trim() === l) || (e.value = l));
  }
}, od = ["ctrl", "shift", "alt", "meta"], ad = {
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
  exact: (e, t) => od.some((n) => e[`${n}Key`] && !t.includes(n))
}, Jn = (e, t) => {
  const n = e._withMods || (e._withMods = {}), s = t.join(".");
  return n[s] || (n[s] = (r, ...i) => {
    for (let o = 0; o < t.length; o++) {
      const a = ad[t[o]];
      if (a && a(r, t)) return;
    }
    return e(r, ...i);
  });
}, ld = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, Rr = (e, t) => {
  const n = e._withKeys || (e._withKeys = {}), s = t.join(".");
  return n[s] || (n[s] = (r) => {
    if (!("key" in r))
      return;
    const i = Un(r.key);
    if (t.some(
      (o) => o === i || ld[o] === i
    ))
      return e(r);
  });
}, cd = /* @__PURE__ */ xt({ patchProp: sd }, Hh);
let Za;
function ud() {
  return Za || (Za = hh(cd));
}
const fd = (...e) => {
  const t = ud().createApp(...e), { mount: n } = t;
  return t.mount = (s) => {
    const r = dd(s);
    if (!r) return;
    const i = t._component;
    !_e(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
    const o = n(r, !1, hd(r));
    return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), o;
  }, t;
};
function hd(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function dd(e) {
  return ut(e) ? document.querySelector(e) : e;
}
const ms = (e) => {
  const t = e.replace("#", ""), n = parseInt(t.substr(0, 2), 16), s = parseInt(t.substr(2, 2), 16), r = parseInt(t.substr(4, 2), 16);
  return (n * 299 + s * 587 + r * 114) / 1e3 < 128;
}, pd = (e, t) => {
  const n = e.replace("#", ""), s = parseInt(n.substr(0, 2), 16), r = parseInt(n.substr(2, 2), 16), i = parseInt(n.substr(4, 2), 16), o = ms(e), a = o ? Math.min(255, s + t) : Math.max(0, s - t), l = o ? Math.min(255, r + t) : Math.max(0, r - t), h = o ? Math.min(255, i + t) : Math.max(0, i - t);
  return `#${a.toString(16).padStart(2, "0")}${l.toString(16).padStart(2, "0")}${h.toString(16).padStart(2, "0")}`;
}, Os = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e), gd = (e) => {
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
function Fo() {
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
var ns = Fo();
function Nc(e) {
  ns = e;
}
var Zs = { exec: () => null };
function je(e, t = "") {
  let n = typeof e == "string" ? e : e.source;
  const s = {
    replace: (r, i) => {
      let o = typeof i == "string" ? i : i.source;
      return o = o.replace(It.caret, "$1"), n = n.replace(r, o), s;
    },
    getRegex: () => new RegExp(n, t)
  };
  return s;
}
var It = {
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
}, md = /^(?:[ \t]*(?:\n|$))+/, _d = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/, yd = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, or = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, vd = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, Do = /(?:[*+-]|\d{1,9}[.)])/, Mc = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/, Pc = je(Mc).replace(/bull/g, Do).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(), bd = je(Mc).replace(/bull/g, Do).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(), Bo = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/, wd = /^[^\n]+/, $o = /(?!\s*\])(?:\\.|[^\[\]\\])+/, kd = je(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", $o).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), xd = je(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, Do).getRegex(), ui = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", Uo = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, Td = je(
  "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))",
  "i"
).replace("comment", Uo).replace("tag", ui).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), Fc = je(Bo).replace("hr", or).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", ui).getRegex(), Ad = je(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", Fc).getRegex(), zo = {
  blockquote: Ad,
  code: _d,
  def: kd,
  fences: yd,
  heading: vd,
  hr: or,
  html: Td,
  lheading: Pc,
  list: xd,
  newline: md,
  paragraph: Fc,
  table: Zs,
  text: wd
}, Ja = je(
  "^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"
).replace("hr", or).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", ui).getRegex(), Ed = {
  ...zo,
  lheading: bd,
  table: Ja,
  paragraph: je(Bo).replace("hr", or).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", Ja).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", ui).getRegex()
}, Sd = {
  ...zo,
  html: je(
    `^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`
  ).replace("comment", Uo).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
  heading: /^(#{1,6})(.*)(?:\n+|$)/,
  fences: Zs,
  // fences not supported
  lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  paragraph: je(Bo).replace("hr", or).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", Pc).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
}, Cd = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, Rd = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, Dc = /^( {2,}|\\)\n(?!\s*$)/, Id = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, fi = /[\p{P}\p{S}]/u, Ho = /[\s\p{P}\p{S}]/u, Bc = /[^\s\p{P}\p{S}]/u, Ld = je(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, Ho).getRegex(), $c = /(?!~)[\p{P}\p{S}]/u, Od = /(?!~)[\s\p{P}\p{S}]/u, Nd = /(?:[^\s\p{P}\p{S}]|~)/u, Md = /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g, Uc = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/, Pd = je(Uc, "u").replace(/punct/g, fi).getRegex(), Fd = je(Uc, "u").replace(/punct/g, $c).getRegex(), zc = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", Dd = je(zc, "gu").replace(/notPunctSpace/g, Bc).replace(/punctSpace/g, Ho).replace(/punct/g, fi).getRegex(), Bd = je(zc, "gu").replace(/notPunctSpace/g, Nd).replace(/punctSpace/g, Od).replace(/punct/g, $c).getRegex(), $d = je(
  "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)",
  "gu"
).replace(/notPunctSpace/g, Bc).replace(/punctSpace/g, Ho).replace(/punct/g, fi).getRegex(), Ud = je(/\\(punct)/, "gu").replace(/punct/g, fi).getRegex(), zd = je(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), Hd = je(Uo).replace("(?:-->|$)", "-->").getRegex(), Wd = je(
  "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>"
).replace("comment", Hd).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), Kr = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/, qd = je(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", Kr).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), Hc = je(/^!?\[(label)\]\[(ref)\]/).replace("label", Kr).replace("ref", $o).getRegex(), Wc = je(/^!?\[(ref)\](?:\[\])?/).replace("ref", $o).getRegex(), jd = je("reflink|nolink(?!\\()", "g").replace("reflink", Hc).replace("nolink", Wc).getRegex(), Wo = {
  _backpedal: Zs,
  // only used for GFM url
  anyPunctuation: Ud,
  autolink: zd,
  blockSkip: Md,
  br: Dc,
  code: Rd,
  del: Zs,
  emStrongLDelim: Pd,
  emStrongRDelimAst: Dd,
  emStrongRDelimUnd: $d,
  escape: Cd,
  link: qd,
  nolink: Wc,
  punctuation: Ld,
  reflink: Hc,
  reflinkSearch: jd,
  tag: Wd,
  text: Id,
  url: Zs
}, Vd = {
  ...Wo,
  link: je(/^!?\[(label)\]\((.*?)\)/).replace("label", Kr).getRegex(),
  reflink: je(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", Kr).getRegex()
}, ao = {
  ...Wo,
  emStrongRDelimAst: Bd,
  emStrongLDelim: Fd,
  url: je(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, "i").replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
  _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
}, Kd = {
  ...ao,
  br: je(Dc).replace("{2,}", "*").getRegex(),
  text: je(ao.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
}, vr = {
  normal: zo,
  gfm: Ed,
  pedantic: Sd
}, Ns = {
  normal: Wo,
  gfm: ao,
  breaks: Kd,
  pedantic: Vd
}, Gd = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}, Qa = (e) => Gd[e];
function sn(e, t) {
  if (t) {
    if (It.escapeTest.test(e))
      return e.replace(It.escapeReplace, Qa);
  } else if (It.escapeTestNoEncode.test(e))
    return e.replace(It.escapeReplaceNoEncode, Qa);
  return e;
}
function el(e) {
  try {
    e = encodeURI(e).replace(It.percentDecode, "%");
  } catch {
    return null;
  }
  return e;
}
function tl(e, t) {
  var i;
  const n = e.replace(It.findPipe, (o, a, l) => {
    let h = !1, c = a;
    for (; --c >= 0 && l[c] === "\\"; ) h = !h;
    return h ? "|" : " |";
  }), s = n.split(It.splitPipe);
  let r = 0;
  if (s[0].trim() || s.shift(), s.length > 0 && !((i = s.at(-1)) != null && i.trim()) && s.pop(), t)
    if (s.length > t)
      s.splice(t);
    else
      for (; s.length < t; ) s.push("");
  for (; r < s.length; r++)
    s[r] = s[r].trim().replace(It.slashPipe, "|");
  return s;
}
function Ms(e, t, n) {
  const s = e.length;
  if (s === 0)
    return "";
  let r = 0;
  for (; r < s && e.charAt(s - r - 1) === t; )
    r++;
  return e.slice(0, s - r);
}
function Yd(e, t) {
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
function nl(e, t, n, s, r) {
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
function Xd(e, t, n) {
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
var Gr = class {
  // set by the lexer
  constructor(e) {
    tt(this, "options");
    tt(this, "rules");
    // set by the lexer
    tt(this, "lexer");
    this.options = e || ns;
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
        text: this.options.pedantic ? n : Ms(n, `
`)
      };
    }
  }
  fences(e) {
    const t = this.rules.block.fences.exec(e);
    if (t) {
      const n = t[0], s = Xd(n, t[3] || "", this.rules);
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
        const s = Ms(n, "#");
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
        raw: Ms(t[0], `
`)
      };
  }
  blockquote(e) {
    const t = this.rules.block.blockquote.exec(e);
    if (t) {
      let n = Ms(t[0], `
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
`), c = h.replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
        s = s ? `${s}
${h}` : h, r = r ? `${r}
${c}` : c;
        const w = this.lexer.state.top;
        if (this.lexer.state.top = !0, this.lexer.blockTokens(c, i, !0), this.lexer.state.top = w, n.length === 0)
          break;
        const k = i.at(-1);
        if ((k == null ? void 0 : k.type) === "code")
          break;
        if ((k == null ? void 0 : k.type) === "blockquote") {
          const D = k, I = D.raw + `
` + n.join(`
`), j = this.blockquote(I);
          i[i.length - 1] = j, s = s.substring(0, s.length - D.raw.length) + j.raw, r = r.substring(0, r.length - D.text.length) + j.text;
          break;
        } else if ((k == null ? void 0 : k.type) === "list") {
          const D = k, I = D.raw + `
` + n.join(`
`), j = this.list(I);
          i[i.length - 1] = j, s = s.substring(0, s.length - k.raw.length) + j.raw, r = r.substring(0, r.length - D.raw.length) + j.raw, n = I.substring(i.at(-1).raw.length).split(`
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
        let l = !1, h = "", c = "";
        if (!(t = i.exec(e)) || this.rules.block.hr.test(e))
          break;
        h = t[0], e = e.substring(h.length);
        let w = t[2].split(`
`, 1)[0].replace(this.rules.other.listReplaceTabs, (ie) => " ".repeat(3 * ie.length)), k = e.split(`
`, 1)[0], D = !w.trim(), I = 0;
        if (this.options.pedantic ? (I = 2, c = w.trimStart()) : D ? I = t[1].length + 1 : (I = t[2].search(this.rules.other.nonSpaceChar), I = I > 4 ? 1 : I, c = w.slice(I), I += t[1].length), D && this.rules.other.blankLine.test(k) && (h += k + `
`, e = e.substring(k.length + 1), l = !0), !l) {
          const ie = this.rules.other.nextBulletRegex(I), ce = this.rules.other.hrRegex(I), oe = this.rules.other.fencesBeginRegex(I), x = this.rules.other.headingBeginRegex(I), L = this.rules.other.htmlBeginRegex(I);
          for (; e; ) {
            const K = e.split(`
`, 1)[0];
            let Y;
            if (k = K, this.options.pedantic ? (k = k.replace(this.rules.other.listReplaceNesting, "  "), Y = k) : Y = k.replace(this.rules.other.tabCharGlobal, "    "), oe.test(k) || x.test(k) || L.test(k) || ie.test(k) || ce.test(k))
              break;
            if (Y.search(this.rules.other.nonSpaceChar) >= I || !k.trim())
              c += `
` + Y.slice(I);
            else {
              if (D || w.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || oe.test(w) || x.test(w) || ce.test(w))
                break;
              c += `
` + k;
            }
            !D && !k.trim() && (D = !0), h += K + `
`, e = e.substring(K.length + 1), w = Y.slice(I);
          }
        }
        r.loose || (o ? r.loose = !0 : this.rules.other.doubleBlankLine.test(h) && (o = !0));
        let j = null, F;
        this.options.gfm && (j = this.rules.other.listIsTask.exec(c), j && (F = j[0] !== "[ ] ", c = c.replace(this.rules.other.listReplaceTask, ""))), r.items.push({
          type: "list_item",
          raw: h,
          task: !!j,
          checked: F,
          loose: !1,
          text: c,
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
          const h = r.items[l].tokens.filter((w) => w.type === "space"), c = h.length > 0 && h.some((w) => this.rules.other.anyLine.test(w.raw));
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
    const n = tl(t[1]), s = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), r = (o = t[3]) != null && o.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
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
        i.rows.push(tl(a, i.header.length).map((l, h) => ({
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
        const i = Ms(n.slice(0, -1), "\\");
        if ((n.length - i.length) % 2 === 0)
          return;
      } else {
        const i = Yd(t[2], "()");
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
      return s = s.trim(), this.rules.other.startAngleBracket.test(s) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n) ? s = s.slice(1) : s = s.slice(1, -1)), nl(t, {
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
      return nl(n, r, n[0], this.lexer, this.rules);
    }
  }
  emStrong(e, t, n = "") {
    let s = this.rules.inline.emStrongLDelim.exec(e);
    if (!s || s[3] && n.match(this.rules.other.unicodeAlphaNumeric)) return;
    if (!(s[1] || s[2] || "") || !n || this.rules.inline.punctuation.exec(n)) {
      const i = [...s[0]].length - 1;
      let o, a, l = i, h = 0;
      const c = s[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      for (c.lastIndex = 0, t = t.slice(-1 * e.length + i); (s = c.exec(t)) != null; ) {
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
        const w = [...s[0]][0].length, k = e.slice(0, i + s.index + w + a);
        if (Math.min(i, a) % 2) {
          const I = k.slice(1, -1);
          return {
            type: "em",
            raw: k,
            text: I,
            tokens: this.lexer.inlineTokens(I)
          };
        }
        const D = k.slice(2, -2);
        return {
          type: "strong",
          raw: k,
          text: D,
          tokens: this.lexer.inlineTokens(D)
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
}, vn = class lo {
  constructor(t) {
    tt(this, "tokens");
    tt(this, "options");
    tt(this, "state");
    tt(this, "tokenizer");
    tt(this, "inlineQueue");
    this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = t || ns, this.options.tokenizer = this.options.tokenizer || new Gr(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = {
      inLink: !1,
      inRawBlock: !1,
      top: !0
    };
    const n = {
      other: It,
      block: vr.normal,
      inline: Ns.normal
    };
    this.options.pedantic ? (n.block = vr.pedantic, n.inline = Ns.pedantic) : this.options.gfm && (n.block = vr.gfm, this.options.breaks ? n.inline = Ns.breaks : n.inline = Ns.gfm), this.tokenizer.rules = n;
  }
  /**
   * Expose Rules
   */
  static get rules() {
    return {
      block: vr,
      inline: Ns
    };
  }
  /**
   * Static Lex Method
   */
  static lex(t, n) {
    return new lo(n).lex(t);
  }
  /**
   * Static Lex Inline Method
   */
  static lexInline(t, n) {
    return new lo(n).inlineTokens(t);
  }
  /**
   * Preprocessing
   */
  lex(t) {
    t = t.replace(It.carriageReturn, `
`), this.blockTokens(t, this.tokens);
    for (let n = 0; n < this.inlineQueue.length; n++) {
      const s = this.inlineQueue[n];
      this.inlineTokens(s.src, s.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(t, n = [], s = !1) {
    var r, i, o;
    for (this.options.pedantic && (t = t.replace(It.tabCharGlobal, "    ").replace(It.spaceLine, "")); t; ) {
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
        const c = t.slice(1);
        let w;
        this.options.extensions.startBlock.forEach((k) => {
          w = k.call({ lexer: this }, c), typeof w == "number" && w >= 0 && (h = Math.min(h, w));
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
      let w = t;
      if ((h = this.options.extensions) != null && h.startInline) {
        let k = 1 / 0;
        const D = t.slice(1);
        let I;
        this.options.extensions.startInline.forEach((j) => {
          I = j.call({ lexer: this }, D), typeof I == "number" && I >= 0 && (k = Math.min(k, I));
        }), k < 1 / 0 && k >= 0 && (w = t.substring(0, k + 1));
      }
      if (c = this.tokenizer.inlineText(w)) {
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
}, Yr = class {
  // set by the parser
  constructor(e) {
    tt(this, "options");
    tt(this, "parser");
    this.options = e || ns;
  }
  space(e) {
    return "";
  }
  code({ text: e, lang: t, escaped: n }) {
    var i;
    const s = (i = (t || "").match(It.notSpaceStart)) == null ? void 0 : i[0], r = e.replace(It.endingNewline, "") + `
`;
    return s ? '<pre><code class="language-' + sn(s) + '">' + (n ? r : sn(r, !0)) + `</code></pre>
` : "<pre><code>" + (n ? r : sn(r, !0)) + `</code></pre>
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
      e.loose ? ((n = e.tokens[0]) == null ? void 0 : n.type) === "paragraph" ? (e.tokens[0].text = s + " " + e.tokens[0].text, e.tokens[0].tokens && e.tokens[0].tokens.length > 0 && e.tokens[0].tokens[0].type === "text" && (e.tokens[0].tokens[0].text = s + " " + sn(e.tokens[0].tokens[0].text), e.tokens[0].tokens[0].escaped = !0)) : e.tokens.unshift({
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
    return `<code>${sn(e, !0)}</code>`;
  }
  br(e) {
    return "<br>";
  }
  del({ tokens: e }) {
    return `<del>${this.parser.parseInline(e)}</del>`;
  }
  link({ href: e, title: t, tokens: n }) {
    const s = this.parser.parseInline(n), r = el(e);
    if (r === null)
      return s;
    e = r;
    let i = '<a href="' + e + '"';
    return t && (i += ' title="' + sn(t) + '"'), i += ">" + s + "</a>", i;
  }
  image({ href: e, title: t, text: n, tokens: s }) {
    s && (n = this.parser.parseInline(s, this.parser.textRenderer));
    const r = el(e);
    if (r === null)
      return sn(n);
    e = r;
    let i = `<img src="${e}" alt="${n}"`;
    return t && (i += ` title="${sn(t)}"`), i += ">", i;
  }
  text(e) {
    return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : sn(e.text);
  }
}, qo = class {
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
}, bn = class co {
  constructor(t) {
    tt(this, "options");
    tt(this, "renderer");
    tt(this, "textRenderer");
    this.options = t || ns, this.options.renderer = this.options.renderer || new Yr(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new qo();
  }
  /**
   * Static Parse Method
   */
  static parse(t, n) {
    return new co(n).parse(t);
  }
  /**
   * Static Parse Inline Method
   */
  static parseInline(t, n) {
    return new co(n).parseInline(t);
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
        const h = a, c = this.options.extensions.renderers[h.type].call({ parser: this }, h);
        if (c !== !1 || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "paragraph", "text"].includes(h.type)) {
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
          let h = l, c = this.renderer.text(h);
          for (; o + 1 < t.length && t[o + 1].type === "text"; )
            h = t[++o], c += `
` + this.renderer.text(h);
          n ? s += this.renderer.paragraph({
            type: "paragraph",
            raw: c,
            text: c,
            tokens: [{ type: "text", raw: c, text: c, escaped: !0 }]
          }) : s += c;
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
}, Gi, Ir = (Gi = class {
  constructor(e) {
    tt(this, "options");
    tt(this, "block");
    this.options = e || ns;
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
    return this.block ? vn.lex : vn.lexInline;
  }
  /**
   * Provide function to parse tokens
   */
  provideParser() {
    return this.block ? bn.parse : bn.parseInline;
  }
}, tt(Gi, "passThroughHooks", /* @__PURE__ */ new Set([
  "preprocess",
  "postprocess",
  "processAllTokens"
])), Gi), Zd = class {
  constructor(...e) {
    tt(this, "defaults", Fo());
    tt(this, "options", this.setOptions);
    tt(this, "parse", this.parseMarkdown(!0));
    tt(this, "parseInline", this.parseMarkdown(!1));
    tt(this, "Parser", bn);
    tt(this, "Renderer", Yr);
    tt(this, "TextRenderer", qo);
    tt(this, "Lexer", vn);
    tt(this, "Tokenizer", Gr);
    tt(this, "Hooks", Ir);
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
        const r = this.defaults.renderer || new Yr(this.defaults);
        for (const i in n.renderer) {
          if (!(i in r))
            throw new Error(`renderer '${i}' does not exist`);
          if (["options", "parser"].includes(i))
            continue;
          const o = i, a = n.renderer[o], l = r[o];
          r[o] = (...h) => {
            let c = a.apply(r, h);
            return c === !1 && (c = l.apply(r, h)), c || "";
          };
        }
        s.renderer = r;
      }
      if (n.tokenizer) {
        const r = this.defaults.tokenizer || new Gr(this.defaults);
        for (const i in n.tokenizer) {
          if (!(i in r))
            throw new Error(`tokenizer '${i}' does not exist`);
          if (["options", "rules", "lexer"].includes(i))
            continue;
          const o = i, a = n.tokenizer[o], l = r[o];
          r[o] = (...h) => {
            let c = a.apply(r, h);
            return c === !1 && (c = l.apply(r, h)), c;
          };
        }
        s.tokenizer = r;
      }
      if (n.hooks) {
        const r = this.defaults.hooks || new Ir();
        for (const i in n.hooks) {
          if (!(i in r))
            throw new Error(`hook '${i}' does not exist`);
          if (["options", "block"].includes(i))
            continue;
          const o = i, a = n.hooks[o], l = r[o];
          Ir.passThroughHooks.has(i) ? r[o] = (h) => {
            if (this.defaults.async)
              return Promise.resolve(a.call(r, h)).then((w) => l.call(r, w));
            const c = a.call(r, h);
            return l.call(r, c);
          } : r[o] = (...h) => {
            let c = a.apply(r, h);
            return c === !1 && (c = l.apply(r, h)), c;
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
    return vn.lex(e, t ?? this.defaults);
  }
  parser(e, t) {
    return bn.parse(e, t ?? this.defaults);
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
      const a = i.hooks ? i.hooks.provideLexer() : e ? vn.lex : vn.lexInline, l = i.hooks ? i.hooks.provideParser() : e ? bn.parse : bn.parseInline;
      if (i.async)
        return Promise.resolve(i.hooks ? i.hooks.preprocess(n) : n).then((h) => a(h, i)).then((h) => i.hooks ? i.hooks.processAllTokens(h) : h).then((h) => i.walkTokens ? Promise.all(this.walkTokens(h, i.walkTokens)).then(() => h) : h).then((h) => l(h, i)).then((h) => i.hooks ? i.hooks.postprocess(h) : h).catch(o);
      try {
        i.hooks && (n = i.hooks.preprocess(n));
        let h = a(n, i);
        i.hooks && (h = i.hooks.processAllTokens(h)), i.walkTokens && this.walkTokens(h, i.walkTokens);
        let c = l(h, i);
        return i.hooks && (c = i.hooks.postprocess(c)), c;
      } catch (h) {
        return o(h);
      }
    };
  }
  onError(e, t) {
    return (n) => {
      if (n.message += `
Please report this to https://github.com/markedjs/marked.`, e) {
        const s = "<p>An error occurred:</p><pre>" + sn(n.message + "", !0) + "</pre>";
        return t ? Promise.resolve(s) : s;
      }
      if (t)
        return Promise.reject(n);
      throw n;
    };
  }
}, ts = new Zd();
function ze(e, t) {
  return ts.parse(e, t);
}
ze.options = ze.setOptions = function(e) {
  return ts.setOptions(e), ze.defaults = ts.defaults, Nc(ze.defaults), ze;
};
ze.getDefaults = Fo;
ze.defaults = ns;
ze.use = function(...e) {
  return ts.use(...e), ze.defaults = ts.defaults, Nc(ze.defaults), ze;
};
ze.walkTokens = function(e, t) {
  return ts.walkTokens(e, t);
};
ze.parseInline = ts.parseInline;
ze.Parser = bn;
ze.parser = bn.parse;
ze.Renderer = Yr;
ze.TextRenderer = qo;
ze.Lexer = vn;
ze.lexer = vn.lex;
ze.Tokenizer = Gr;
ze.Hooks = Ir;
ze.parse = ze;
ze.options;
ze.setOptions;
ze.use;
ze.walkTokens;
ze.parseInline;
bn.parse;
vn.lex;
/*! @license DOMPurify 3.2.6 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.2.6/LICENSE */
const {
  entries: qc,
  setPrototypeOf: sl,
  isFrozen: Jd,
  getPrototypeOf: Qd,
  getOwnPropertyDescriptor: ep
} = Object;
let {
  freeze: Lt,
  seal: Kt,
  create: jc
} = Object, {
  apply: uo,
  construct: fo
} = typeof Reflect < "u" && Reflect;
Lt || (Lt = function(t) {
  return t;
});
Kt || (Kt = function(t) {
  return t;
});
uo || (uo = function(t, n, s) {
  return t.apply(n, s);
});
fo || (fo = function(t, n) {
  return new t(...n);
});
const br = Ot(Array.prototype.forEach), tp = Ot(Array.prototype.lastIndexOf), rl = Ot(Array.prototype.pop), Ps = Ot(Array.prototype.push), np = Ot(Array.prototype.splice), Lr = Ot(String.prototype.toLowerCase), Pi = Ot(String.prototype.toString), il = Ot(String.prototype.match), Fs = Ot(String.prototype.replace), sp = Ot(String.prototype.indexOf), rp = Ot(String.prototype.trim), Zt = Ot(Object.prototype.hasOwnProperty), At = Ot(RegExp.prototype.test), Ds = ip(TypeError);
function Ot(e) {
  return function(t) {
    t instanceof RegExp && (t.lastIndex = 0);
    for (var n = arguments.length, s = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
      s[r - 1] = arguments[r];
    return uo(e, t, s);
  };
}
function ip(e) {
  return function() {
    for (var t = arguments.length, n = new Array(t), s = 0; s < t; s++)
      n[s] = arguments[s];
    return fo(e, n);
  };
}
function Re(e, t) {
  let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : Lr;
  sl && sl(e, null);
  let s = t.length;
  for (; s--; ) {
    let r = t[s];
    if (typeof r == "string") {
      const i = n(r);
      i !== r && (Jd(t) || (t[s] = i), r = i);
    }
    e[r] = !0;
  }
  return e;
}
function op(e) {
  for (let t = 0; t < e.length; t++)
    Zt(e, t) || (e[t] = null);
  return e;
}
function gn(e) {
  const t = jc(null);
  for (const [n, s] of qc(e))
    Zt(e, n) && (Array.isArray(s) ? t[n] = op(s) : s && typeof s == "object" && s.constructor === Object ? t[n] = gn(s) : t[n] = s);
  return t;
}
function Bs(e, t) {
  for (; e !== null; ) {
    const s = ep(e, t);
    if (s) {
      if (s.get)
        return Ot(s.get);
      if (typeof s.value == "function")
        return Ot(s.value);
    }
    e = Qd(e);
  }
  function n() {
    return null;
  }
  return n;
}
const ol = Lt(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "section", "select", "shadow", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]), Fi = Lt(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]), Di = Lt(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]), ap = Lt(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]), Bi = Lt(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]), lp = Lt(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]), al = Lt(["#text"]), ll = Lt(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns", "slot"]), $i = Lt(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]), cl = Lt(["accent", "accentunder", "align", "bevelled", "close", "columnsalign", "columnlines", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lspace", "lquote", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]), wr = Lt(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]), cp = Kt(/\{\{[\w\W]*|[\w\W]*\}\}/gm), up = Kt(/<%[\w\W]*|[\w\W]*%>/gm), fp = Kt(/\$\{[\w\W]*/gm), hp = Kt(/^data-[\-\w.\u00B7-\uFFFF]+$/), dp = Kt(/^aria-[\-\w]+$/), Vc = Kt(
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  // eslint-disable-line no-useless-escape
), pp = Kt(/^(?:\w+script|data):/i), gp = Kt(
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g
  // eslint-disable-line no-control-regex
), Kc = Kt(/^html$/i), mp = Kt(/^[a-z][.\w]*(-[.\w]+)+$/i);
var ul = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ARIA_ATTR: dp,
  ATTR_WHITESPACE: gp,
  CUSTOM_ELEMENT: mp,
  DATA_ATTR: hp,
  DOCTYPE_NAME: Kc,
  ERB_EXPR: up,
  IS_ALLOWED_URI: Vc,
  IS_SCRIPT_OR_DATA: pp,
  MUSTACHE_EXPR: cp,
  TMPLIT_EXPR: fp
});
const $s = {
  element: 1,
  text: 3,
  // Deprecated
  progressingInstruction: 7,
  comment: 8,
  document: 9
}, _p = function() {
  return typeof window > "u" ? null : window;
}, yp = function(t, n) {
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
}, fl = function() {
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
};
function Gc() {
  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : _p();
  const t = (ne) => Gc(ne);
  if (t.version = "3.2.6", t.removed = [], !e || !e.document || e.document.nodeType !== $s.document || !e.Element)
    return t.isSupported = !1, t;
  let {
    document: n
  } = e;
  const s = n, r = s.currentScript, {
    DocumentFragment: i,
    HTMLTemplateElement: o,
    Node: a,
    Element: l,
    NodeFilter: h,
    NamedNodeMap: c = e.NamedNodeMap || e.MozNamedAttrMap,
    HTMLFormElement: w,
    DOMParser: k,
    trustedTypes: D
  } = e, I = l.prototype, j = Bs(I, "cloneNode"), F = Bs(I, "remove"), ie = Bs(I, "nextSibling"), ce = Bs(I, "childNodes"), oe = Bs(I, "parentNode");
  if (typeof o == "function") {
    const ne = n.createElement("template");
    ne.content && ne.content.ownerDocument && (n = ne.content.ownerDocument);
  }
  let x, L = "";
  const {
    implementation: K,
    createNodeIterator: Y,
    createDocumentFragment: ye,
    getElementsByTagName: Ne
  } = n, {
    importNode: De
  } = s;
  let ke = fl();
  t.isSupported = typeof qc == "function" && typeof oe == "function" && K && K.createHTMLDocument !== void 0;
  const {
    MUSTACHE_EXPR: pe,
    ERB_EXPR: Ye,
    TMPLIT_EXPR: Xe,
    DATA_ATTR: it,
    ARIA_ATTR: fe,
    IS_SCRIPT_OR_DATA: ge,
    ATTR_WHITESPACE: le,
    CUSTOM_ELEMENT: rt
  } = ul;
  let {
    IS_ALLOWED_URI: xe
  } = ul, ve = null;
  const Ee = Re({}, [...ol, ...Fi, ...Di, ...Bi, ...al]);
  let Ie = null;
  const Nt = Re({}, [...ll, ...$i, ...cl, ...wr]);
  let Le = Object.seal(jc(null, {
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
  })), ot = null, ht = null, dt = !0, vt = !0, gt = !1, Tt = !0, g = !1, _ = !0, E = !1, $ = !1, N = !1, B = !1, V = !1, W = !1, q = !0, b = !1;
  const R = "user-content-";
  let M = !0, z = !1, G = {}, te = null;
  const me = Re({}, ["annotation-xml", "audio", "colgroup", "desc", "foreignobject", "head", "iframe", "math", "mi", "mn", "mo", "ms", "mtext", "noembed", "noframes", "noscript", "plaintext", "script", "style", "svg", "template", "thead", "title", "video", "xmp"]);
  let ue = null;
  const Qe = Re({}, ["audio", "video", "img", "source", "image", "track"]);
  let Se = null;
  const Ve = Re({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), f = "http://www.w3.org/1998/Math/MathML", m = "http://www.w3.org/2000/svg", O = "http://www.w3.org/1999/xhtml";
  let S = O, U = !1, X = null;
  const Q = Re({}, [f, m, O], Pi);
  let be = Re({}, ["mi", "mo", "mn", "ms", "mtext"]), Oe = Re({}, ["annotation-xml"]);
  const Ke = Re({}, ["title", "style", "font", "a", "script"]);
  let Be = null;
  const lt = ["application/xhtml+xml", "text/html"], bt = "text/html";
  let Ze = null, Gt = null;
  const ar = n.createElement("form"), lr = function(y) {
    return y instanceof RegExp || y instanceof Function;
  }, zn = function() {
    let y = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (!(Gt && Gt === y)) {
      if ((!y || typeof y != "object") && (y = {}), y = gn(y), Be = // eslint-disable-next-line unicorn/prefer-includes
      lt.indexOf(y.PARSER_MEDIA_TYPE) === -1 ? bt : y.PARSER_MEDIA_TYPE, Ze = Be === "application/xhtml+xml" ? Pi : Lr, ve = Zt(y, "ALLOWED_TAGS") ? Re({}, y.ALLOWED_TAGS, Ze) : Ee, Ie = Zt(y, "ALLOWED_ATTR") ? Re({}, y.ALLOWED_ATTR, Ze) : Nt, X = Zt(y, "ALLOWED_NAMESPACES") ? Re({}, y.ALLOWED_NAMESPACES, Pi) : Q, Se = Zt(y, "ADD_URI_SAFE_ATTR") ? Re(gn(Ve), y.ADD_URI_SAFE_ATTR, Ze) : Ve, ue = Zt(y, "ADD_DATA_URI_TAGS") ? Re(gn(Qe), y.ADD_DATA_URI_TAGS, Ze) : Qe, te = Zt(y, "FORBID_CONTENTS") ? Re({}, y.FORBID_CONTENTS, Ze) : me, ot = Zt(y, "FORBID_TAGS") ? Re({}, y.FORBID_TAGS, Ze) : gn({}), ht = Zt(y, "FORBID_ATTR") ? Re({}, y.FORBID_ATTR, Ze) : gn({}), G = Zt(y, "USE_PROFILES") ? y.USE_PROFILES : !1, dt = y.ALLOW_ARIA_ATTR !== !1, vt = y.ALLOW_DATA_ATTR !== !1, gt = y.ALLOW_UNKNOWN_PROTOCOLS || !1, Tt = y.ALLOW_SELF_CLOSE_IN_ATTR !== !1, g = y.SAFE_FOR_TEMPLATES || !1, _ = y.SAFE_FOR_XML !== !1, E = y.WHOLE_DOCUMENT || !1, B = y.RETURN_DOM || !1, V = y.RETURN_DOM_FRAGMENT || !1, W = y.RETURN_TRUSTED_TYPE || !1, N = y.FORCE_BODY || !1, q = y.SANITIZE_DOM !== !1, b = y.SANITIZE_NAMED_PROPS || !1, M = y.KEEP_CONTENT !== !1, z = y.IN_PLACE || !1, xe = y.ALLOWED_URI_REGEXP || Vc, S = y.NAMESPACE || O, be = y.MATHML_TEXT_INTEGRATION_POINTS || be, Oe = y.HTML_INTEGRATION_POINTS || Oe, Le = y.CUSTOM_ELEMENT_HANDLING || {}, y.CUSTOM_ELEMENT_HANDLING && lr(y.CUSTOM_ELEMENT_HANDLING.tagNameCheck) && (Le.tagNameCheck = y.CUSTOM_ELEMENT_HANDLING.tagNameCheck), y.CUSTOM_ELEMENT_HANDLING && lr(y.CUSTOM_ELEMENT_HANDLING.attributeNameCheck) && (Le.attributeNameCheck = y.CUSTOM_ELEMENT_HANDLING.attributeNameCheck), y.CUSTOM_ELEMENT_HANDLING && typeof y.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements == "boolean" && (Le.allowCustomizedBuiltInElements = y.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements), g && (vt = !1), V && (B = !0), G && (ve = Re({}, al), Ie = [], G.html === !0 && (Re(ve, ol), Re(Ie, ll)), G.svg === !0 && (Re(ve, Fi), Re(Ie, $i), Re(Ie, wr)), G.svgFilters === !0 && (Re(ve, Di), Re(Ie, $i), Re(Ie, wr)), G.mathMl === !0 && (Re(ve, Bi), Re(Ie, cl), Re(Ie, wr))), y.ADD_TAGS && (ve === Ee && (ve = gn(ve)), Re(ve, y.ADD_TAGS, Ze)), y.ADD_ATTR && (Ie === Nt && (Ie = gn(Ie)), Re(Ie, y.ADD_ATTR, Ze)), y.ADD_URI_SAFE_ATTR && Re(Se, y.ADD_URI_SAFE_ATTR, Ze), y.FORBID_CONTENTS && (te === me && (te = gn(te)), Re(te, y.FORBID_CONTENTS, Ze)), M && (ve["#text"] = !0), E && Re(ve, ["html", "head", "body"]), ve.table && (Re(ve, ["tbody"]), delete ot.tbody), y.TRUSTED_TYPES_POLICY) {
        if (typeof y.TRUSTED_TYPES_POLICY.createHTML != "function")
          throw Ds('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
        if (typeof y.TRUSTED_TYPES_POLICY.createScriptURL != "function")
          throw Ds('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
        x = y.TRUSTED_TYPES_POLICY, L = x.createHTML("");
      } else
        x === void 0 && (x = yp(D, r)), x !== null && typeof L == "string" && (L = x.createHTML(""));
      Lt && Lt(y), Gt = y;
    }
  }, Hn = Re({}, [...Fi, ...Di, ...ap]), ws = Re({}, [...Bi, ...lp]), cr = function(y) {
    let H = oe(y);
    (!H || !H.tagName) && (H = {
      namespaceURI: S,
      tagName: "template"
    });
    const J = Lr(y.tagName), Me = Lr(H.tagName);
    return X[y.namespaceURI] ? y.namespaceURI === m ? H.namespaceURI === O ? J === "svg" : H.namespaceURI === f ? J === "svg" && (Me === "annotation-xml" || be[Me]) : !!Hn[J] : y.namespaceURI === f ? H.namespaceURI === O ? J === "math" : H.namespaceURI === m ? J === "math" && Oe[Me] : !!ws[J] : y.namespaceURI === O ? H.namespaceURI === m && !Oe[Me] || H.namespaceURI === f && !be[Me] ? !1 : !ws[J] && (Ke[J] || !Hn[J]) : !!(Be === "application/xhtml+xml" && X[y.namespaceURI]) : !1;
  }, mt = function(y) {
    Ps(t.removed, {
      element: y
    });
    try {
      oe(y).removeChild(y);
    } catch {
      F(y);
    }
  }, Ut = function(y, H) {
    try {
      Ps(t.removed, {
        attribute: H.getAttributeNode(y),
        from: H
      });
    } catch {
      Ps(t.removed, {
        attribute: null,
        from: H
      });
    }
    if (H.removeAttribute(y), y === "is")
      if (B || V)
        try {
          mt(H);
        } catch {
        }
      else
        try {
          H.setAttribute(y, "");
        } catch {
        }
  }, ss = function(y) {
    let H = null, J = null;
    if (N)
      y = "<remove></remove>" + y;
    else {
      const Te = il(y, /^[\r\n\t ]+/);
      J = Te && Te[0];
    }
    Be === "application/xhtml+xml" && S === O && (y = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + y + "</body></html>");
    const Me = x ? x.createHTML(y) : y;
    if (S === O)
      try {
        H = new k().parseFromString(Me, Be);
      } catch {
      }
    if (!H || !H.documentElement) {
      H = K.createDocument(S, "template", null);
      try {
        H.documentElement.innerHTML = U ? L : Me;
      } catch {
      }
    }
    const et = H.body || H.documentElement;
    return y && J && et.insertBefore(n.createTextNode(J), et.childNodes[0] || null), S === O ? Ne.call(H, E ? "html" : "body")[0] : E ? H.documentElement : et;
  }, rs = function(y) {
    return Y.call(
      y.ownerDocument || y,
      y,
      // eslint-disable-next-line no-bitwise
      h.SHOW_ELEMENT | h.SHOW_COMMENT | h.SHOW_TEXT | h.SHOW_PROCESSING_INSTRUCTION | h.SHOW_CDATA_SECTION,
      null
    );
  }, zt = function(y) {
    return y instanceof w && (typeof y.nodeName != "string" || typeof y.textContent != "string" || typeof y.removeChild != "function" || !(y.attributes instanceof c) || typeof y.removeAttribute != "function" || typeof y.setAttribute != "function" || typeof y.namespaceURI != "string" || typeof y.insertBefore != "function" || typeof y.hasChildNodes != "function");
  }, ks = function(y) {
    return typeof a == "function" && y instanceof a;
  };
  function Mt(ne, y, H) {
    br(ne, (J) => {
      J.call(t, y, H, Gt);
    });
  }
  const xs = function(y) {
    let H = null;
    if (Mt(ke.beforeSanitizeElements, y, null), zt(y))
      return mt(y), !0;
    const J = Ze(y.nodeName);
    if (Mt(ke.uponSanitizeElement, y, {
      tagName: J,
      allowedTags: ve
    }), _ && y.hasChildNodes() && !ks(y.firstElementChild) && At(/<[/\w!]/g, y.innerHTML) && At(/<[/\w!]/g, y.textContent) || y.nodeType === $s.progressingInstruction || _ && y.nodeType === $s.comment && At(/<[/\w]/g, y.data))
      return mt(y), !0;
    if (!ve[J] || ot[J]) {
      if (!ot[J] && ur(J) && (Le.tagNameCheck instanceof RegExp && At(Le.tagNameCheck, J) || Le.tagNameCheck instanceof Function && Le.tagNameCheck(J)))
        return !1;
      if (M && !te[J]) {
        const Me = oe(y) || y.parentNode, et = ce(y) || y.childNodes;
        if (et && Me) {
          const Te = et.length;
          for (let Fe = Te - 1; Fe >= 0; --Fe) {
            const Ge = j(et[Fe], !0);
            Ge.__removalCount = (y.__removalCount || 0) + 1, Me.insertBefore(Ge, ie(y));
          }
        }
      }
      return mt(y), !0;
    }
    return y instanceof l && !cr(y) || (J === "noscript" || J === "noembed" || J === "noframes") && At(/<\/no(script|embed|frames)/i, y.innerHTML) ? (mt(y), !0) : (g && y.nodeType === $s.text && (H = y.textContent, br([pe, Ye, Xe], (Me) => {
      H = Fs(H, Me, " ");
    }), y.textContent !== H && (Ps(t.removed, {
      element: y.cloneNode()
    }), y.textContent = H)), Mt(ke.afterSanitizeElements, y, null), !1);
  }, Tn = function(y, H, J) {
    if (q && (H === "id" || H === "name") && (J in n || J in ar))
      return !1;
    if (!(vt && !ht[H] && At(it, H))) {
      if (!(dt && At(fe, H))) {
        if (!Ie[H] || ht[H]) {
          if (
            // First condition does a very basic check if a) it's basically a valid custom element tagname AND
            // b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
            // and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
            !(ur(y) && (Le.tagNameCheck instanceof RegExp && At(Le.tagNameCheck, y) || Le.tagNameCheck instanceof Function && Le.tagNameCheck(y)) && (Le.attributeNameCheck instanceof RegExp && At(Le.attributeNameCheck, H) || Le.attributeNameCheck instanceof Function && Le.attributeNameCheck(H)) || // Alternative, second condition checks if it's an `is`-attribute, AND
            // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
            H === "is" && Le.allowCustomizedBuiltInElements && (Le.tagNameCheck instanceof RegExp && At(Le.tagNameCheck, J) || Le.tagNameCheck instanceof Function && Le.tagNameCheck(J)))
          ) return !1;
        } else if (!Se[H]) {
          if (!At(xe, Fs(J, le, ""))) {
            if (!((H === "src" || H === "xlink:href" || H === "href") && y !== "script" && sp(J, "data:") === 0 && ue[y])) {
              if (!(gt && !At(ge, Fs(J, le, "")))) {
                if (J)
                  return !1;
              }
            }
          }
        }
      }
    }
    return !0;
  }, ur = function(y) {
    return y !== "annotation-xml" && il(y, rt);
  }, Wn = function(y) {
    Mt(ke.beforeSanitizeAttributes, y, null);
    const {
      attributes: H
    } = y;
    if (!H || zt(y))
      return;
    const J = {
      attrName: "",
      attrValue: "",
      keepAttr: !0,
      allowedAttributes: Ie,
      forceKeepAttr: void 0
    };
    let Me = H.length;
    for (; Me--; ) {
      const et = H[Me], {
        name: Te,
        namespaceURI: Fe,
        value: Ge
      } = et, Dt = Ze(Te), hn = Ge;
      let ft = Te === "value" ? hn : rp(hn);
      if (J.attrName = Dt, J.attrValue = ft, J.keepAttr = !0, J.forceKeepAttr = void 0, Mt(ke.uponSanitizeAttribute, y, J), ft = J.attrValue, b && (Dt === "id" || Dt === "name") && (Ut(Te, y), ft = R + ft), _ && At(/((--!?|])>)|<\/(style|title)/i, ft)) {
        Ut(Te, y);
        continue;
      }
      if (J.forceKeepAttr)
        continue;
      if (!J.keepAttr) {
        Ut(Te, y);
        continue;
      }
      if (!Tt && At(/\/>/i, ft)) {
        Ut(Te, y);
        continue;
      }
      g && br([pe, Ye, Xe], (pt) => {
        ft = Fs(ft, pt, " ");
      });
      const en = Ze(y.nodeName);
      if (!Tn(en, Dt, ft)) {
        Ut(Te, y);
        continue;
      }
      if (x && typeof D == "object" && typeof D.getAttributeType == "function" && !Fe)
        switch (D.getAttributeType(en, Dt)) {
          case "TrustedHTML": {
            ft = x.createHTML(ft);
            break;
          }
          case "TrustedScriptURL": {
            ft = x.createScriptURL(ft);
            break;
          }
        }
      if (ft !== hn)
        try {
          Fe ? y.setAttributeNS(Fe, Te, ft) : y.setAttribute(Te, ft), zt(y) ? mt(y) : rl(t.removed);
        } catch {
          Ut(Te, y);
        }
    }
    Mt(ke.afterSanitizeAttributes, y, null);
  }, fr = function ne(y) {
    let H = null;
    const J = rs(y);
    for (Mt(ke.beforeSanitizeShadowDOM, y, null); H = J.nextNode(); )
      Mt(ke.uponSanitizeShadowNode, H, null), xs(H), Wn(H), H.content instanceof i && ne(H.content);
    Mt(ke.afterSanitizeShadowDOM, y, null);
  };
  return t.sanitize = function(ne) {
    let y = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, H = null, J = null, Me = null, et = null;
    if (U = !ne, U && (ne = "<!-->"), typeof ne != "string" && !ks(ne))
      if (typeof ne.toString == "function") {
        if (ne = ne.toString(), typeof ne != "string")
          throw Ds("dirty is not a string, aborting");
      } else
        throw Ds("toString is not a function");
    if (!t.isSupported)
      return ne;
    if ($ || zn(y), t.removed = [], typeof ne == "string" && (z = !1), z) {
      if (ne.nodeName) {
        const Ge = Ze(ne.nodeName);
        if (!ve[Ge] || ot[Ge])
          throw Ds("root node is forbidden and cannot be sanitized in-place");
      }
    } else if (ne instanceof a)
      H = ss("<!---->"), J = H.ownerDocument.importNode(ne, !0), J.nodeType === $s.element && J.nodeName === "BODY" || J.nodeName === "HTML" ? H = J : H.appendChild(J);
    else {
      if (!B && !g && !E && // eslint-disable-next-line unicorn/prefer-includes
      ne.indexOf("<") === -1)
        return x && W ? x.createHTML(ne) : ne;
      if (H = ss(ne), !H)
        return B ? null : W ? L : "";
    }
    H && N && mt(H.firstChild);
    const Te = rs(z ? ne : H);
    for (; Me = Te.nextNode(); )
      xs(Me), Wn(Me), Me.content instanceof i && fr(Me.content);
    if (z)
      return ne;
    if (B) {
      if (V)
        for (et = ye.call(H.ownerDocument); H.firstChild; )
          et.appendChild(H.firstChild);
      else
        et = H;
      return (Ie.shadowroot || Ie.shadowrootmode) && (et = De.call(s, et, !0)), et;
    }
    let Fe = E ? H.outerHTML : H.innerHTML;
    return E && ve["!doctype"] && H.ownerDocument && H.ownerDocument.doctype && H.ownerDocument.doctype.name && At(Kc, H.ownerDocument.doctype.name) && (Fe = "<!DOCTYPE " + H.ownerDocument.doctype.name + `>
` + Fe), g && br([pe, Ye, Xe], (Ge) => {
      Fe = Fs(Fe, Ge, " ");
    }), x && W ? x.createHTML(Fe) : Fe;
  }, t.setConfig = function() {
    let ne = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    zn(ne), $ = !0;
  }, t.clearConfig = function() {
    Gt = null, $ = !1;
  }, t.isValidAttribute = function(ne, y, H) {
    Gt || zn({});
    const J = Ze(ne), Me = Ze(y);
    return Tn(J, Me, H);
  }, t.addHook = function(ne, y) {
    typeof y == "function" && Ps(ke[ne], y);
  }, t.removeHook = function(ne, y) {
    if (y !== void 0) {
      const H = tp(ke[ne], y);
      return H === -1 ? void 0 : np(ke[ne], H, 1)[0];
    }
    return rl(ke[ne]);
  }, t.removeHooks = function(ne) {
    ke[ne] = [];
  }, t.removeAllHooks = function() {
    ke = fl();
  }, t;
}
var jo = Gc();
jo.addHook("uponSanitizeElement", (e, t) => {
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
jo.addHook("afterSanitizeAttributes", (e) => {
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
function vp(e) {
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
  return jo.sanitize(e, t);
}
ze.setOptions({
  renderer: new ze.Renderer(),
  gfm: !0,
  breaks: !0
});
const Or = (e) => vp(ze(e || "")), hl = "*", bp = /* @__PURE__ */ new Set(["null", "about:blank", ""]);
let nn = null;
const Nr = (e) => e && !bp.has(e) ? e : null, wp = (e) => {
  if (!e) return null;
  try {
    return Nr(new URL(e).origin);
  } catch {
    return null;
  }
};
function kp() {
  if (nn) return nn;
  if (window.parent === window)
    return nn = Nr(window.location.origin) || hl, nn;
  try {
    const e = Nr(window.parent.location.origin);
    if (e)
      return nn = e, nn;
  } catch {
  }
  try {
    const e = window.location.ancestorOrigins, t = e && e.length ? Nr(e[0]) : null;
    if (t)
      return nn = t, nn;
  } catch {
  }
  return nn = wp(document.referrer) || hl, nn;
}
function Nn(e) {
  window.parent.postMessage(e, kp());
}
const Xr = "Start a new chat", dl = "Start a new chat? This ends the current one.", xp = "Start new chat", Tp = "Cancel", pl = "Couldn't start a new chat. Please try again.", Ap = 15e3, Ep = ["aria-label"], Sp = { class: "new-chat-confirm__question" }, Cp = { class: "new-chat-confirm__actions" }, Rp = ["disabled"], Ip = ["disabled"], Lp = /* @__PURE__ */ Oo({
  __name: "NewChatConfirm",
  props: {
    error: {},
    busy: { type: Boolean }
  },
  emits: ["confirm", "cancel"],
  setup(e, { emit: t }) {
    const n = t;
    return (s, r) => (T(), A("div", {
      class: "new-chat-confirm",
      role: "alertdialog",
      "aria-live": "polite",
      "aria-label": C(dl)
    }, [
      v("p", Sp, Z(s.error || C(dl)), 1),
      v("div", Cp, [
        v("button", {
          type: "button",
          class: "new-chat-confirm__button",
          disabled: s.busy,
          onClick: r[0] || (r[0] = (i) => n("cancel"))
        }, Z(C(Tp)), 9, Rp),
        v("button", {
          type: "button",
          class: "new-chat-confirm__button new-chat-confirm__button--primary",
          disabled: s.busy,
          onClick: r[1] || (r[1] = (i) => n("confirm"))
        }, Z(C(xp)), 9, Ip)
      ])
    ], 8, Ep));
  }
}), Vo = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [s, r] of t)
    n[s] = r;
  return n;
}, Yc = /* @__PURE__ */ Vo(Lp, [["__scopeId", "data-v-6c78f353"]]), Op = { class: "askai" }, Np = { class: "askai__bar" }, Mp = ["value", "placeholder", "disabled", "aria-label", "onKeydown"], Pp = ["disabled", "title", "aria-label", "aria-expanded"], Fp = { class: "askai__intro" }, Dp = { class: "askai__title" }, Bp = {
  key: 0,
  class: "askai__subtitle"
}, $p = {
  key: 0,
  class: "askai__suggestions"
}, Up = ["disabled", "onClick"], zp = ["aria-live"], Hp = {
  key: 0,
  class: "askai__question"
}, Wp = {
  key: 1,
  class: "askai__system"
}, qp = ["innerHTML"], jp = {
  key: 0,
  class: "askai__sources"
}, Vp = ["title"], Kp = {
  key: 0,
  class: "askai__thinking",
  role: "status",
  "aria-live": "polite"
}, Gp = { class: "askai__thinking-text" }, Yp = { class: "askai__foot" }, Xp = { key: 0 }, Zp = /* @__PURE__ */ Oo({
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
    const n = e, s = t, r = re(null), i = re(null), o = re(null), a = ["user", "bot", "agent", "system"], l = ae(
      () => n.messages.map((x, L) => ({ message: x, index: L })).filter(({ message: x }) => a.includes(x.message_type))
    ), h = ae(() => l.value.length > 0), c = (x) => {
      s("update:draft", x.target.value);
    }, w = () => {
      !(n.typingEnabled ?? n.inputEnabled) || !n.draft.trim() || s("send");
    }, k = (x) => {
      n.inputEnabled && s("ask", x);
    }, D = typeof navigator < "u" && /Mac|iPod|iPhone|iPad/.test(navigator.platform || ""), I = (x) => {
      if (x.key === "Escape") {
        x.preventDefault(), s("close");
        return;
      }
      const L = D ? x.metaKey && !x.ctrlKey : x.ctrlKey && !x.metaKey;
      n.hotkey && L && !x.altKey && (x.key === "k" || x.key === "K") && (x.preventDefault(), s("close"));
    }, j = () => {
      es(() => {
        var x;
        return (x = r.value) == null ? void 0 : x.focus();
      });
    };
    let F = 0;
    const ie = () => {
      if (!o.value) return;
      const x = o.value.closest(".askai"), L = i.value;
      if (!x || !L) return;
      const K = x.offsetHeight - L.offsetHeight, Y = getComputedStyle(L), ye = parseFloat(Y.paddingTop) + parseFloat(Y.paddingBottom), Ne = Math.ceil(K + ye + o.value.getBoundingClientRect().height);
      Math.abs(Ne - F) < 3 || (F = Ne, Nn({ type: "WIDGET_RESIZE", height: Ne }));
    };
    let ce = null;
    const oe = ae(
      () => l.value.reduce((x, { message: L, index: K }) => x + n.displayText(K, L.message || "").length, 0)
    );
    return St(
      () => [l.value.length, oe.value, n.loading],
      () => es(() => {
        i.value && (i.value.scrollTop = i.value.scrollHeight);
      })
    ), St(() => n.newChatArmed, () => es(() => ie())), St(() => n.active, (x) => {
      x && j();
    }), oi(() => {
      n.active && j(), window.addEventListener("keydown", I), o.value && typeof ResizeObserver < "u" && (ce = new ResizeObserver(() => ie()), ce.observe(o.value)), ie();
    }), lc(() => {
      window.removeEventListener("keydown", I), ce == null || ce.disconnect(), ce = null;
    }), (x, L) => (T(), A("div", Op, [
      v("div", Np, [
        L[6] || (L[6] = v("svg", {
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
          v("path", { d: "M12 3l1.9 4.9L19 9.8l-4.9 1.9L12 17l-1.9-5.3L5 9.8l5.1-1.9L12 3z" })
        ], -1)),
        v("input", {
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
          onKeydown: Rr(Jn(w, ["prevent"]), ["enter"])
        }, null, 40, Mp),
        x.canStartNewChat ? (T(), A("button", {
          key: 0,
          type: "button",
          class: $e(["askai__new", { "askai__new--armed": x.newChatArmed }]),
          disabled: x.startingNewChat,
          title: C(Xr),
          "aria-label": C(Xr),
          "aria-expanded": x.newChatArmed,
          onClick: L[0] || (L[0] = (K) => s("newChat"))
        }, L[4] || (L[4] = [
          v("svg", {
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
            v("path", { d: "M12 20h9" }),
            v("path", { d: "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" })
          ], -1)
        ]), 10, Pp)) : se("", !0),
        v("button", {
          type: "button",
          class: "askai__close",
          "aria-label": "Close",
          title: "Close (Esc)",
          onClick: L[1] || (L[1] = (K) => s("close"))
        }, L[5] || (L[5] = [
          v("span", { class: "askai__kbd" }, "Esc", -1)
        ]))
      ]),
      x.newChatArmed && x.canStartNewChat ? (T(), qr(Yc, {
        key: 0,
        busy: x.startingNewChat,
        error: x.newChatError,
        onConfirm: L[2] || (L[2] = (K) => s("confirmNewChat")),
        onCancel: L[3] || (L[3] = (K) => s("cancelNewChat"))
      }, null, 8, ["busy", "error"])) : se("", !0),
      v("div", {
        ref_key: "bodyEl",
        ref: i,
        class: "askai__body"
      }, [
        v("div", {
          ref_key: "contentEl",
          ref: o,
          class: "askai__content"
        }, [
          h.value ? (T(), A(Ue, { key: 1 }, [
            (T(!0), A(Ue, null, _t(l.value, ({ message: K, index: Y }) => (T(), A("div", {
              key: Y,
              class: "askai__turn",
              "aria-live": x.isStreaming(Y) ? "off" : "polite"
            }, [
              K.message_type === "user" ? (T(), A("p", Hp, Z(K.message), 1)) : K.message_type === "system" ? (T(), A("p", Wp, Z(K.message), 1)) : (T(), A(Ue, { key: 2 }, [
                v("div", {
                  class: $e(["askai__answer", { "askai__answer--streaming": x.isStreaming(Y) }]),
                  innerHTML: C(Or)(x.isStreaming(Y) ? x.displayText(Y, K.message || "") : K.message || "")
                }, null, 10, qp),
                x.showCitations && !x.isStreaming(Y) && K.sources && K.sources.length ? (T(), A("div", jp, [
                  L[9] || (L[9] = v("span", { class: "askai__label" }, "Sources", -1)),
                  (T(!0), A(Ue, null, _t(K.sources, (ye, Ne) => (T(), A("span", {
                    key: Ne,
                    class: "askai__source",
                    title: x.citationTooltip(ye)
                  }, Z(x.citationLabel(ye)), 9, Vp))), 128))
                ])) : se("", !0)
              ], 64))
            ], 8, zp))), 128)),
            x.loading ? (T(), A("div", Kp, [
              L[10] || (L[10] = v("span", { class: "askai__dot" }, null, -1)),
              L[11] || (L[11] = v("span", { class: "askai__dot" }, null, -1)),
              L[12] || (L[12] = v("span", { class: "askai__dot" }, null, -1)),
              v("span", Gp, Z(x.showCitations ? "Searching the knowledge base" : "Thinking"), 1)
            ])) : se("", !0)
          ], 64)) : (T(), A(Ue, { key: 0 }, [
            v("div", Fp, [
              v("h2", Dp, Z(x.welcomeTitle || `Ask ${x.agentName}`), 1),
              x.welcomeSubtitle ? (T(), A("p", Bp, Z(x.welcomeSubtitle), 1)) : se("", !0)
            ]),
            x.suggestions.length && !x.draft.trim() ? (T(), A("div", $p, [
              L[8] || (L[8] = v("p", { class: "askai__label" }, "Suggested", -1)),
              (T(!0), A(Ue, null, _t(x.suggestions, (K) => (T(), A("button", {
                key: K,
                type: "button",
                class: "askai__suggestion",
                disabled: !x.inputEnabled,
                onClick: (Y) => k(K)
              }, [
                v("span", null, Z(K), 1),
                L[7] || (L[7] = v("svg", {
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
                  v("path", { d: "M5 12h14M13 6l6 6-6 6" })
                ], -1))
              ], 8, Up))), 128))
            ])) : se("", !0)
          ], 64))
        ], 512)
      ], 512),
      v("div", Yp, [
        x.disclaimer ? (T(), A("span", Xp, Z(x.disclaimer), 1)) : se("", !0),
        L[13] || (L[13] = v("a", {
          class: "askai__brand",
          href: "https://chattermate.chat",
          target: "_blank",
          rel: "noopener noreferrer"
        }, "Powered by ChatterMate", -1))
      ])
    ]));
  }
}), Jp = /* @__PURE__ */ Vo(Zp, [["__scopeId", "data-v-edea9534"]]), Hs = [
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
], Qp = (e) => (e || "").split("").reduce((t, n) => t + n.charCodeAt(0), 0) % Hs.length, eg = (e) => {
  const t = Hs[(e % Hs.length + Hs.length) % Hs.length];
  return {
    background: `
            radial-gradient(circle at 32% 28%, rgba(255,255,255,0.22) 0%, transparent 42%),
            radial-gradient(circle at 68% 72%, rgba(0,0,0,0.25) 0%, transparent 38%),
            radial-gradient(ellipse at 50% 50%, ${t.stops})
        `.trim(),
    boxShadow: `0 4px 28px ${t.glow}, inset 0 1px 0 rgba(255,255,255,0.15)`,
    borderRadius: "50%"
  };
}, tg = (e, t) => {
  const n = typeof t == "number" && Number.isFinite(t) ? t : Qp(e);
  return eg(n);
}, gl = (e) => {
  var t;
  return !!((t = e == null ? void 0 : e.attributes) != null && t.end_chat);
}, ml = "AI can make mistakes. Check important info.";
function ng(e, t = !1) {
  return e !== !1 && !t;
}
const Ui = {
  ai: "Online · replies instantly",
  human: "Online · usually replies in a few minutes",
  away: "Away · we'll reply when we're back"
};
function sg(e, t = !1) {
  return (t ? "human" : (e == null ? void 0 : e.mode) ?? "ai") === "ai" ? { text: Ui.ai, online: !0 } : (e == null ? void 0 : e.available) !== !1 ? { text: Ui.human, online: !0 } : { text: Ui.away, online: !1 };
}
const Xc = (e) => !!e && (/^https?:\/\//i.test(e) || e.startsWith("data:")), rg = (e, t) => e ? Xc(e) || e.startsWith("blob:") ? e : `${t.replace(/\/api\/v1\/?$/, "")}${e.startsWith("/") ? "" : "/"}${e}` : "";
function _l() {
  return typeof window < "u" && window.APP_CONFIG ? window.APP_CONFIG : {};
}
const vs = {
  get API_URL() {
    return _l().API_URL || void 0 || "https://api.chattermate.chat/api/v1";
  },
  get WS_URL() {
    return _l().WS_URL || void 0 || "wss://api.chattermate.chat";
  }
};
function Zr(e) {
  return rg(e, vs.API_URL);
}
function ig(e) {
  const t = ae(() => ({
    backgroundColor: "var(--cm-card)",
    color: "var(--cm-text)"
  })), n = ae(() => ({
    backgroundColor: e.value.chat_bubble_color || "#C9F24E",
    color: ms(e.value.chat_bubble_color || "#C9F24E") ? "#FFFFFF" : "#000000"
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
  })), a = ae(() => Zr(e.value.photo_url)), l = ae(() => {
    const h = e.value.chat_background_color || "#ffffff";
    return {
      boxShadow: `0 8px 5px ${ms(h) ? "rgba(0, 0, 0, 0.24)" : "rgba(0, 0, 0, 0.12)"}`
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
const og = /* @__PURE__ */ new Set(["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]), ag = /* @__PURE__ */ new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);
[...og, ...ag];
function lg(e, t) {
  const n = re([]), s = re(!1), r = re(null), i = (L) => {
    if (L === 0) return "0 Bytes";
    const K = 1024, Y = ["Bytes", "KB", "MB", "GB"], ye = Math.floor(Math.log(L) / Math.log(K));
    return parseFloat((L / Math.pow(K, ye)).toFixed(2)) + " " + Y[ye];
  }, o = (L) => L.startsWith("image/"), a = (L) => L ? Zr(L) : "", l = (L) => {
    const K = L.file_url || L.url;
    return K ? Zr(K) : "";
  }, h = async (L) => {
    const K = L.target;
    K.files && K.files.length > 0 && (await j(Array.from(K.files)), K.value = "");
  }, c = async (L) => {
    var Y;
    L.preventDefault();
    const K = (Y = L.dataTransfer) == null ? void 0 : Y.files;
    K && K.length > 0 && await j(Array.from(K));
  }, w = (L) => {
    L.preventDefault();
  }, k = (L) => {
    L.preventDefault();
  }, D = async (L) => {
    var ye;
    const K = (ye = L.clipboardData) == null ? void 0 : ye.items;
    if (!K) return;
    const Y = [];
    for (const Ne of Array.from(K))
      if (Ne.kind === "file") {
        const De = Ne.getAsFile();
        De && Y.push(De);
      }
    Y.length > 0 && await j(Y);
  }, I = async (L, K = 500) => new Promise((Y, ye) => {
    const Ne = new FileReader();
    Ne.onload = (De) => {
      var pe;
      const ke = new Image();
      ke.onload = () => {
        const Ye = document.createElement("canvas");
        let Xe = ke.width, it = ke.height;
        const fe = 1920;
        (Xe > fe || it > fe) && (Xe > it ? (it = it / Xe * fe, Xe = fe) : (Xe = Xe / it * fe, it = fe)), Ye.width = Xe, Ye.height = it;
        const ge = Ye.getContext("2d");
        if (!ge) {
          ye(new Error("Failed to get canvas context"));
          return;
        }
        ge.drawImage(ke, 0, 0, Xe, it);
        let le = 0.9;
        const rt = () => {
          Ye.toBlob((xe) => {
            if (!xe) {
              ye(new Error("Failed to compress image"));
              return;
            }
            if (xe.size / 1024 > K && le > 0.3)
              le -= 0.1, rt();
            else {
              const Ee = new FileReader();
              Ee.onload = () => {
                const Ie = Ee.result.split(",")[1];
                Y({ blob: xe, base64: Ie });
              }, Ee.readAsDataURL(xe);
            }
          }, L.type === "image/png" ? "image/png" : "image/jpeg", le);
        };
        rt();
      }, ke.onerror = () => ye(new Error("Failed to load image")), ke.src = (pe = De.target) == null ? void 0 : pe.result;
    }, Ne.onerror = () => ye(new Error("Failed to read file")), Ne.readAsDataURL(L);
  }), j = async (L) => {
    if (n.value.length >= 3) {
      alert("Maximum 3 files allowed per message");
      return;
    }
    const De = 3 - n.value.length, ke = L.slice(0, De);
    L.length > De && alert(`Only ${De} more file(s) can be uploaded. Maximum 3 files per message.`);
    for (const pe of ke)
      try {
        if (n.value.some((fe) => fe.filename === pe.name)) {
          console.warn(`File ${pe.name} is already selected`), alert(`File "${pe.name}" is already selected`);
          continue;
        }
        const Xe = pe.type.startsWith("image/"), it = Xe ? 5242880 : 10485760;
        if (pe.size > it) {
          const fe = it / 1048576;
          console.error(`File ${pe.name} is too large. Maximum size is ${fe}MB`), alert(`File "${pe.name}" is too large. Maximum size for ${Xe ? "images" : "documents"} is ${fe}MB`);
          continue;
        }
        if (Xe)
          try {
            const { blob: fe, base64: ge } = await I(pe, 500), le = fe.size;
            console.log(`Compressed ${pe.name}: ${(pe.size / 1024).toFixed(2)}KB → ${(le / 1024).toFixed(2)}KB`), n.value.push({
              content: ge,
              filename: pe.name,
              type: pe.type,
              size: le,
              url: URL.createObjectURL(fe),
              file_url: URL.createObjectURL(fe)
            });
          } catch (fe) {
            console.error("Image compression failed, uploading original:", fe);
            const ge = new FileReader();
            ge.onload = (le) => {
              var ve;
              const xe = ((ve = le.target) == null ? void 0 : ve.result).split(",")[1];
              n.value.push({
                content: xe,
                filename: pe.name,
                type: pe.type,
                size: pe.size,
                url: URL.createObjectURL(pe),
                file_url: URL.createObjectURL(pe)
              });
            }, ge.readAsDataURL(pe);
          }
        else {
          const fe = new FileReader();
          fe.onload = (ge) => {
            var xe;
            const rt = ((xe = ge.target) == null ? void 0 : xe.result).split(",")[1];
            n.value.push({
              content: rt,
              filename: pe.name,
              type: pe.type || "application/octet-stream",
              size: pe.size,
              url: "",
              file_url: ""
            });
          }, fe.readAsDataURL(pe);
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
    handleFileSelect: h,
    handleDrop: c,
    handleDragOver: w,
    handleDragLeave: k,
    handlePaste: D,
    uploadFiles: j,
    removeAttachment: async (L) => {
      const K = n.value[L];
      if (K) {
        try {
          let Y = K.url;
          if (Y.startsWith("/uploads/") ? Y = Y.substring(9) : Y.startsWith("/") && (Y = Y.substring(1)), Xc(Y))
            try {
              Y = new URL(Y).pathname.replace(/^\/+/, "");
            } catch {
            }
          const ye = {};
          e.value && (ye.Authorization = `Bearer ${e.value}`);
          const Ne = await fetch(`${vs.API_URL}/files/upload/${Y}`, {
            method: "DELETE",
            headers: ye
          });
          if (Ne.ok)
            console.log("File deleted successfully from backend.");
          else {
            const De = await Ne.json();
            console.error("Failed to delete file:", De.detail);
          }
        } catch (Y) {
          console.error("Error calling delete API:", Y);
        }
        K.url && K.url.startsWith("blob:") && URL.revokeObjectURL(K.url), K.file_url && K.file_url.startsWith("blob:") && URL.revokeObjectURL(K.file_url), n.value.splice(L, 1);
      }
    },
    openPreview: (L) => {
      r.value = L, s.value = !0;
    },
    closePreview: () => {
      s.value = !1, setTimeout(() => {
        r.value = null;
      }, 300);
    },
    openFilePicker: () => {
      var L;
      (L = t.value) == null || L.click();
    },
    isImage: (L) => L.startsWith("image/")
  };
}
const fn = /* @__PURE__ */ Object.create(null);
fn.open = "0";
fn.close = "1";
fn.ping = "2";
fn.pong = "3";
fn.message = "4";
fn.upgrade = "5";
fn.noop = "6";
const Mr = /* @__PURE__ */ Object.create(null);
Object.keys(fn).forEach((e) => {
  Mr[fn[e]] = e;
});
const ho = { type: "error", data: "parser error" }, Zc = typeof Blob == "function" || typeof Blob < "u" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]", Jc = typeof ArrayBuffer == "function", Qc = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e && e.buffer instanceof ArrayBuffer, Ko = ({ type: e, data: t }, n, s) => Zc && t instanceof Blob ? n ? s(t) : yl(t, s) : Jc && (t instanceof ArrayBuffer || Qc(t)) ? n ? s(t) : yl(new Blob([t]), s) : s(fn[e] + (t || "")), yl = (e, t) => {
  const n = new FileReader();
  return n.onload = function() {
    const s = n.result.split(",")[1];
    t("b" + (s || ""));
  }, n.readAsDataURL(e);
};
function vl(e) {
  return e instanceof Uint8Array ? e : e instanceof ArrayBuffer ? new Uint8Array(e) : new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
}
let zi;
function cg(e, t) {
  if (Zc && e.data instanceof Blob)
    return e.data.arrayBuffer().then(vl).then(t);
  if (Jc && (e.data instanceof ArrayBuffer || Qc(e.data)))
    return t(vl(e.data));
  Ko(e, !1, (n) => {
    zi || (zi = new TextEncoder()), t(zi.encode(n));
  });
}
const bl = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", Ws = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (let e = 0; e < bl.length; e++)
  Ws[bl.charCodeAt(e)] = e;
const ug = (e) => {
  let t = e.length * 0.75, n = e.length, s, r = 0, i, o, a, l;
  e[e.length - 1] === "=" && (t--, e[e.length - 2] === "=" && t--);
  const h = new ArrayBuffer(t), c = new Uint8Array(h);
  for (s = 0; s < n; s += 4)
    i = Ws[e.charCodeAt(s)], o = Ws[e.charCodeAt(s + 1)], a = Ws[e.charCodeAt(s + 2)], l = Ws[e.charCodeAt(s + 3)], c[r++] = i << 2 | o >> 4, c[r++] = (o & 15) << 4 | a >> 2, c[r++] = (a & 3) << 6 | l & 63;
  return h;
}, fg = typeof ArrayBuffer == "function", Go = (e, t) => {
  if (typeof e != "string")
    return {
      type: "message",
      data: eu(e, t)
    };
  const n = e.charAt(0);
  return n === "b" ? {
    type: "message",
    data: hg(e.substring(1), t)
  } : Mr[n] ? e.length > 1 ? {
    type: Mr[n],
    data: e.substring(1)
  } : {
    type: Mr[n]
  } : ho;
}, hg = (e, t) => {
  if (fg) {
    const n = ug(e);
    return eu(n, t);
  } else
    return { base64: !0, data: e };
}, eu = (e, t) => {
  switch (t) {
    case "blob":
      return e instanceof Blob ? e : new Blob([e]);
    case "arraybuffer":
    default:
      return e instanceof ArrayBuffer ? e : e.buffer;
  }
}, tu = "", dg = (e, t) => {
  const n = e.length, s = new Array(n);
  let r = 0;
  e.forEach((i, o) => {
    Ko(i, !1, (a) => {
      s[o] = a, ++r === n && t(s.join(tu));
    });
  });
}, pg = (e, t) => {
  const n = e.split(tu), s = [];
  for (let r = 0; r < n.length; r++) {
    const i = Go(n[r], t);
    if (s.push(i), i.type === "error")
      break;
  }
  return s;
};
function gg() {
  return new TransformStream({
    transform(e, t) {
      cg(e, (n) => {
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
let Hi;
function kr(e) {
  return e.reduce((t, n) => t + n.length, 0);
}
function xr(e, t) {
  if (e[0].length === t)
    return e.shift();
  const n = new Uint8Array(t);
  let s = 0;
  for (let r = 0; r < t; r++)
    n[r] = e[0][s++], s === e[0].length && (e.shift(), s = 0);
  return e.length && s < e[0].length && (e[0] = e[0].slice(s)), n;
}
function mg(e, t) {
  Hi || (Hi = new TextDecoder());
  const n = [];
  let s = 0, r = -1, i = !1;
  return new TransformStream({
    transform(o, a) {
      for (n.push(o); ; ) {
        if (s === 0) {
          if (kr(n) < 1)
            break;
          const l = xr(n, 1);
          i = (l[0] & 128) === 128, r = l[0] & 127, r < 126 ? s = 3 : r === 126 ? s = 1 : s = 2;
        } else if (s === 1) {
          if (kr(n) < 2)
            break;
          const l = xr(n, 2);
          r = new DataView(l.buffer, l.byteOffset, l.length).getUint16(0), s = 3;
        } else if (s === 2) {
          if (kr(n) < 8)
            break;
          const l = xr(n, 8), h = new DataView(l.buffer, l.byteOffset, l.length), c = h.getUint32(0);
          if (c > Math.pow(2, 21) - 1) {
            a.enqueue(ho);
            break;
          }
          r = c * Math.pow(2, 32) + h.getUint32(4), s = 3;
        } else {
          if (kr(n) < r)
            break;
          const l = xr(n, r);
          a.enqueue(Go(i ? l : Hi.decode(l), t)), s = 0;
        }
        if (r === 0 || r > e) {
          a.enqueue(ho);
          break;
        }
      }
    }
  });
}
const nu = 4;
function ct(e) {
  if (e) return _g(e);
}
function _g(e) {
  for (var t in ct.prototype)
    e[t] = ct.prototype[t];
  return e;
}
ct.prototype.on = ct.prototype.addEventListener = function(e, t) {
  return this._callbacks = this._callbacks || {}, (this._callbacks["$" + e] = this._callbacks["$" + e] || []).push(t), this;
};
ct.prototype.once = function(e, t) {
  function n() {
    this.off(e, n), t.apply(this, arguments);
  }
  return n.fn = t, this.on(e, n), this;
};
ct.prototype.off = ct.prototype.removeListener = ct.prototype.removeAllListeners = ct.prototype.removeEventListener = function(e, t) {
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
ct.prototype.emit = function(e) {
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
ct.prototype.emitReserved = ct.prototype.emit;
ct.prototype.listeners = function(e) {
  return this._callbacks = this._callbacks || {}, this._callbacks["$" + e] || [];
};
ct.prototype.hasListeners = function(e) {
  return !!this.listeners(e).length;
};
const hi = typeof Promise == "function" && typeof Promise.resolve == "function" ? (t) => Promise.resolve().then(t) : (t, n) => n(t, 0), Wt = typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")(), yg = "arraybuffer";
function su(e, ...t) {
  return t.reduce((n, s) => (e.hasOwnProperty(s) && (n[s] = e[s]), n), {});
}
const vg = Wt.setTimeout, bg = Wt.clearTimeout;
function di(e, t) {
  t.useNativeTimers ? (e.setTimeoutFn = vg.bind(Wt), e.clearTimeoutFn = bg.bind(Wt)) : (e.setTimeoutFn = Wt.setTimeout.bind(Wt), e.clearTimeoutFn = Wt.clearTimeout.bind(Wt));
}
const wg = 1.33;
function kg(e) {
  return typeof e == "string" ? xg(e) : Math.ceil((e.byteLength || e.size) * wg);
}
function xg(e) {
  let t = 0, n = 0;
  for (let s = 0, r = e.length; s < r; s++)
    t = e.charCodeAt(s), t < 128 ? n += 1 : t < 2048 ? n += 2 : t < 55296 || t >= 57344 ? n += 3 : (s++, n += 4);
  return n;
}
function ru() {
  return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
}
function Tg(e) {
  let t = "";
  for (let n in e)
    e.hasOwnProperty(n) && (t.length && (t += "&"), t += encodeURIComponent(n) + "=" + encodeURIComponent(e[n]));
  return t;
}
function Ag(e) {
  let t = {}, n = e.split("&");
  for (let s = 0, r = n.length; s < r; s++) {
    let i = n[s].split("=");
    t[decodeURIComponent(i[0])] = decodeURIComponent(i[1]);
  }
  return t;
}
class Eg extends Error {
  constructor(t, n, s) {
    super(t), this.description = n, this.context = s, this.type = "TransportError";
  }
}
class Yo extends ct {
  /**
   * Transport abstract constructor.
   *
   * @param {Object} opts - options
   * @protected
   */
  constructor(t) {
    super(), this.writable = !1, di(this, t), this.opts = t, this.query = t.query, this.socket = t.socket, this.supportsBinary = !t.forceBase64;
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
    return super.emitReserved("error", new Eg(t, n, s)), this;
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
    const n = Go(t, this.socket.binaryType);
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
    const n = Tg(t);
    return n.length ? "?" + n : "";
  }
}
class Sg extends Yo {
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
    pg(t, this.socket.binaryType).forEach(n), this.readyState !== "closed" && (this._polling = !1, this.emitReserved("pollComplete"), this.readyState === "open" && this._poll());
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
    this.writable = !1, dg(t, (n) => {
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
    return this.opts.timestampRequests !== !1 && (n[this.opts.timestampParam] = ru()), !this.supportsBinary && !n.sid && (n.b64 = 1), this.createUri(t, n);
  }
}
let iu = !1;
try {
  iu = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest();
} catch {
}
const Cg = iu;
function Rg() {
}
class Ig extends Sg {
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
class cn extends ct {
  /**
   * Request constructor
   *
   * @param {Object} options
   * @package
   */
  constructor(t, n, s) {
    super(), this.createRequest = t, di(this, s), this._opts = s, this._method = s.method || "GET", this._uri = n, this._data = s.data !== void 0 ? s.data : null, this._create();
  }
  /**
   * Creates the XHR object and sends the request.
   *
   * @private
   */
  _create() {
    var t;
    const n = su(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
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
    typeof document < "u" && (this._index = cn.requestsCount++, cn.requests[this._index] = this);
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
      if (this._xhr.onreadystatechange = Rg, t)
        try {
          this._xhr.abort();
        } catch {
        }
      typeof document < "u" && delete cn.requests[this._index], this._xhr = null;
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
cn.requestsCount = 0;
cn.requests = {};
if (typeof document < "u") {
  if (typeof attachEvent == "function")
    attachEvent("onunload", wl);
  else if (typeof addEventListener == "function") {
    const e = "onpagehide" in Wt ? "pagehide" : "unload";
    addEventListener(e, wl, !1);
  }
}
function wl() {
  for (let e in cn.requests)
    cn.requests.hasOwnProperty(e) && cn.requests[e].abort();
}
const Lg = function() {
  const e = ou({
    xdomain: !1
  });
  return e && e.responseType !== null;
}();
class Og extends Ig {
  constructor(t) {
    super(t);
    const n = t && t.forceBase64;
    this.supportsBinary = Lg && !n;
  }
  request(t = {}) {
    return Object.assign(t, { xd: this.xd }, this.opts), new cn(ou, this.uri(), t);
  }
}
function ou(e) {
  const t = e.xdomain;
  try {
    if (typeof XMLHttpRequest < "u" && (!t || Cg))
      return new XMLHttpRequest();
  } catch {
  }
  if (!t)
    try {
      return new Wt[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
    } catch {
    }
}
const au = typeof navigator < "u" && typeof navigator.product == "string" && navigator.product.toLowerCase() === "reactnative";
class Ng extends Yo {
  get name() {
    return "websocket";
  }
  doOpen() {
    const t = this.uri(), n = this.opts.protocols, s = au ? {} : su(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
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
      Ko(s, this.supportsBinary, (i) => {
        try {
          this.doWrite(s, i);
        } catch {
        }
        r && hi(() => {
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
    return this.opts.timestampRequests && (n[this.opts.timestampParam] = ru()), this.supportsBinary || (n.b64 = 1), this.createUri(t, n);
  }
}
const Wi = Wt.WebSocket || Wt.MozWebSocket;
class Mg extends Ng {
  createSocket(t, n, s) {
    return au ? new Wi(t, n, s) : n ? new Wi(t, n) : new Wi(t);
  }
  doWrite(t, n) {
    this.ws.send(n);
  }
}
class Pg extends Yo {
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
        const n = mg(Number.MAX_SAFE_INTEGER, this.socket.binaryType), s = t.readable.pipeThrough(n).getReader(), r = gg();
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
        r && hi(() => {
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
const Fg = {
  websocket: Mg,
  webtransport: Pg,
  polling: Og
}, Dg = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/, Bg = [
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
function po(e) {
  if (e.length > 8e3)
    throw "URI too long";
  const t = e, n = e.indexOf("["), s = e.indexOf("]");
  n != -1 && s != -1 && (e = e.substring(0, n) + e.substring(n, s).replace(/:/g, ";") + e.substring(s, e.length));
  let r = Dg.exec(e || ""), i = {}, o = 14;
  for (; o--; )
    i[Bg[o]] = r[o] || "";
  return n != -1 && s != -1 && (i.source = t, i.host = i.host.substring(1, i.host.length - 1).replace(/;/g, ":"), i.authority = i.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), i.ipv6uri = !0), i.pathNames = $g(i, i.path), i.queryKey = Ug(i, i.query), i;
}
function $g(e, t) {
  const n = /\/{2,9}/g, s = t.replace(n, "/").split("/");
  return (t.slice(0, 1) == "/" || t.length === 0) && s.splice(0, 1), t.slice(-1) == "/" && s.splice(s.length - 1, 1), s;
}
function Ug(e, t) {
  const n = {};
  return t.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function(s, r, i) {
    r && (n[r] = i);
  }), n;
}
const go = typeof addEventListener == "function" && typeof removeEventListener == "function", Pr = [];
go && addEventListener("offline", () => {
  Pr.forEach((e) => e());
}, !1);
class Pn extends ct {
  /**
   * Socket constructor.
   *
   * @param {String|Object} uri - uri or options
   * @param {Object} opts - options
   */
  constructor(t, n) {
    if (super(), this.binaryType = yg, this.writeBuffer = [], this._prevBufferLen = 0, this._pingInterval = -1, this._pingTimeout = -1, this._maxPayload = -1, this._pingTimeoutTime = 1 / 0, t && typeof t == "object" && (n = t, t = null), t) {
      const s = po(t);
      n.hostname = s.host, n.secure = s.protocol === "https" || s.protocol === "wss", n.port = s.port, s.query && (n.query = s.query);
    } else n.host && (n.hostname = po(n.host).host);
    di(this, n), this.secure = n.secure != null ? n.secure : typeof location < "u" && location.protocol === "https:", n.hostname && !n.port && (n.port = this.secure ? "443" : "80"), this.hostname = n.hostname || (typeof location < "u" ? location.hostname : "localhost"), this.port = n.port || (typeof location < "u" && location.port ? location.port : this.secure ? "443" : "80"), this.transports = [], this._transportsByName = {}, n.transports.forEach((s) => {
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
    }, n), this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : ""), typeof this.opts.query == "string" && (this.opts.query = Ag(this.opts.query)), go && (this.opts.closeOnBeforeunload && (this._beforeunloadEventListener = () => {
      this.transport && (this.transport.removeAllListeners(), this.transport.close());
    }, addEventListener("beforeunload", this._beforeunloadEventListener, !1)), this.hostname !== "localhost" && (this._offlineEventListener = () => {
      this._onClose("transport close", {
        description: "network connection lost"
      });
    }, Pr.push(this._offlineEventListener))), this.opts.withCredentials && (this._cookieJar = void 0), this._open();
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
    n.EIO = nu, n.transport = t, this.id && (n.sid = this.id);
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
    const t = this.opts.rememberUpgrade && Pn.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1 ? "websocket" : this.transports[0];
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
    this.readyState = "open", Pn.priorWebsocketSuccess = this.transport.name === "websocket", this.emitReserved("open"), this.flush();
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
      if (r && (n += kg(r)), s > 0 && n > this._maxPayload)
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
    return t && (this._pingTimeoutTime = 0, hi(() => {
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
    if (Pn.priorWebsocketSuccess = !1, this.opts.tryAllTransports && this.transports.length > 1 && this.readyState === "opening")
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
      if (this.clearTimeoutFn(this._pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), go && (this._beforeunloadEventListener && removeEventListener("beforeunload", this._beforeunloadEventListener, !1), this._offlineEventListener)) {
        const s = Pr.indexOf(this._offlineEventListener);
        s !== -1 && Pr.splice(s, 1);
      }
      this.readyState = "closed", this.id = null, this.emitReserved("close", t, n), this.writeBuffer = [], this._prevBufferLen = 0;
    }
  }
}
Pn.protocol = nu;
class zg extends Pn {
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
    Pn.priorWebsocketSuccess = !1;
    const r = () => {
      s || (n.send([{ type: "ping", data: "probe" }]), n.once("packet", (w) => {
        if (!s)
          if (w.type === "pong" && w.data === "probe") {
            if (this.upgrading = !0, this.emitReserved("upgrading", n), !n)
              return;
            Pn.priorWebsocketSuccess = n.name === "websocket", this.transport.pause(() => {
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
    const o = (w) => {
      const k = new Error("probe error: " + w);
      k.transport = n.name, i(), this.emitReserved("upgradeError", k);
    };
    function a() {
      o("transport closed");
    }
    function l() {
      o("socket closed");
    }
    function h(w) {
      n && w.name !== n.name && i();
    }
    const c = () => {
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
let Hg = class extends zg {
  constructor(t, n = {}) {
    const s = typeof t == "object" ? t : n;
    (!s.transports || s.transports && typeof s.transports[0] == "string") && (s.transports = (s.transports || ["polling", "websocket", "webtransport"]).map((r) => Fg[r]).filter((r) => !!r)), super(t, s);
  }
};
function Wg(e, t = "", n) {
  let s = e;
  n = n || typeof location < "u" && location, e == null && (e = n.protocol + "//" + n.host), typeof e == "string" && (e.charAt(0) === "/" && (e.charAt(1) === "/" ? e = n.protocol + e : e = n.host + e), /^(https?|wss?):\/\//.test(e) || (typeof n < "u" ? e = n.protocol + "//" + e : e = "https://" + e), s = po(e)), s.port || (/^(http|ws)$/.test(s.protocol) ? s.port = "80" : /^(http|ws)s$/.test(s.protocol) && (s.port = "443")), s.path = s.path || "/";
  const i = s.host.indexOf(":") !== -1 ? "[" + s.host + "]" : s.host;
  return s.id = s.protocol + "://" + i + ":" + s.port + t, s.href = s.protocol + "://" + i + (n && n.port === s.port ? "" : ":" + s.port), s;
}
const qg = typeof ArrayBuffer == "function", jg = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e.buffer instanceof ArrayBuffer, lu = Object.prototype.toString, Vg = typeof Blob == "function" || typeof Blob < "u" && lu.call(Blob) === "[object BlobConstructor]", Kg = typeof File == "function" || typeof File < "u" && lu.call(File) === "[object FileConstructor]";
function Xo(e) {
  return qg && (e instanceof ArrayBuffer || jg(e)) || Vg && e instanceof Blob || Kg && e instanceof File;
}
function Fr(e, t) {
  if (!e || typeof e != "object")
    return !1;
  if (Array.isArray(e)) {
    for (let n = 0, s = e.length; n < s; n++)
      if (Fr(e[n]))
        return !0;
    return !1;
  }
  if (Xo(e))
    return !0;
  if (e.toJSON && typeof e.toJSON == "function" && arguments.length === 1)
    return Fr(e.toJSON(), !0);
  for (const n in e)
    if (Object.prototype.hasOwnProperty.call(e, n) && Fr(e[n]))
      return !0;
  return !1;
}
function Gg(e) {
  const t = [], n = e.data, s = e;
  return s.data = mo(n, t), s.attachments = t.length, { packet: s, buffers: t };
}
function mo(e, t) {
  if (!e)
    return e;
  if (Xo(e)) {
    const n = { _placeholder: !0, num: t.length };
    return t.push(e), n;
  } else if (Array.isArray(e)) {
    const n = new Array(e.length);
    for (let s = 0; s < e.length; s++)
      n[s] = mo(e[s], t);
    return n;
  } else if (typeof e == "object" && !(e instanceof Date)) {
    const n = {};
    for (const s in e)
      Object.prototype.hasOwnProperty.call(e, s) && (n[s] = mo(e[s], t));
    return n;
  }
  return e;
}
function Yg(e, t) {
  return e.data = _o(e.data, t), delete e.attachments, e;
}
function _o(e, t) {
  if (!e)
    return e;
  if (e && e._placeholder === !0) {
    if (typeof e.num == "number" && e.num >= 0 && e.num < t.length)
      return t[e.num];
    throw new Error("illegal attachments");
  } else if (Array.isArray(e))
    for (let n = 0; n < e.length; n++)
      e[n] = _o(e[n], t);
  else if (typeof e == "object")
    for (const n in e)
      Object.prototype.hasOwnProperty.call(e, n) && (e[n] = _o(e[n], t));
  return e;
}
const Xg = [
  "connect",
  "connect_error",
  "disconnect",
  "disconnecting",
  "newListener",
  "removeListener"
  // used by the Node.js EventEmitter
];
var Pe;
(function(e) {
  e[e.CONNECT = 0] = "CONNECT", e[e.DISCONNECT = 1] = "DISCONNECT", e[e.EVENT = 2] = "EVENT", e[e.ACK = 3] = "ACK", e[e.CONNECT_ERROR = 4] = "CONNECT_ERROR", e[e.BINARY_EVENT = 5] = "BINARY_EVENT", e[e.BINARY_ACK = 6] = "BINARY_ACK";
})(Pe || (Pe = {}));
class Zg {
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
    return (t.type === Pe.EVENT || t.type === Pe.ACK) && Fr(t) ? this.encodeAsBinary({
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
    const n = Gg(t), s = this.encodeAsString(n.packet), r = n.buffers;
    return r.unshift(s), r;
  }
}
function kl(e) {
  return Object.prototype.toString.call(e) === "[object Object]";
}
class Zo extends ct {
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
      const s = n.type === Pe.BINARY_EVENT;
      s || n.type === Pe.BINARY_ACK ? (n.type = s ? Pe.EVENT : Pe.ACK, this.reconstructor = new Jg(n), n.attachments === 0 && super.emitReserved("decoded", n)) : super.emitReserved("decoded", n);
    } else if (Xo(t) || t.base64)
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
      if (Zo.isPayloadValid(s.type, i))
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
      case Pe.CONNECT:
        return kl(n);
      case Pe.DISCONNECT:
        return n === void 0;
      case Pe.CONNECT_ERROR:
        return typeof n == "string" || kl(n);
      case Pe.EVENT:
      case Pe.BINARY_EVENT:
        return Array.isArray(n) && (typeof n[0] == "number" || typeof n[0] == "string" && Xg.indexOf(n[0]) === -1);
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
class Jg {
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
      const n = Yg(this.reconPack, this.buffers);
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
const Qg = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Decoder: Zo,
  Encoder: Zg,
  get PacketType() {
    return Pe;
  }
}, Symbol.toStringTag, { value: "Module" }));
function Jt(e, t, n) {
  return e.on(t, n), function() {
    e.off(t, n);
  };
}
const em = Object.freeze({
  connect: 1,
  connect_error: 1,
  disconnect: 1,
  disconnecting: 1,
  // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
  newListener: 1,
  removeListener: 1
});
class cu extends ct {
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
      Jt(t, "open", this.onopen.bind(this)),
      Jt(t, "packet", this.onpacket.bind(this)),
      Jt(t, "error", this.onerror.bind(this)),
      Jt(t, "close", this.onclose.bind(this))
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
    if (em.hasOwnProperty(t))
      throw new Error('"' + t.toString() + '" is a reserved event name');
    if (n.unshift(t), this._opts.retries && !this.flags.fromQueue && !this.flags.volatile)
      return this._addToQueue(n), this;
    const o = {
      type: Pe.EVENT,
      data: n
    };
    if (o.options = {}, o.options.compress = this.flags.compress !== !1, typeof n[n.length - 1] == "function") {
      const c = this.ids++, w = n.pop();
      this._registerAckCallback(c, w), o.id = c;
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
function bs(e) {
  e = e || {}, this.ms = e.min || 100, this.max = e.max || 1e4, this.factor = e.factor || 2, this.jitter = e.jitter > 0 && e.jitter <= 1 ? e.jitter : 0, this.attempts = 0;
}
bs.prototype.duration = function() {
  var e = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var t = Math.random(), n = Math.floor(t * this.jitter * e);
    e = (Math.floor(t * 10) & 1) == 0 ? e - n : e + n;
  }
  return Math.min(e, this.max) | 0;
};
bs.prototype.reset = function() {
  this.attempts = 0;
};
bs.prototype.setMin = function(e) {
  this.ms = e;
};
bs.prototype.setMax = function(e) {
  this.max = e;
};
bs.prototype.setJitter = function(e) {
  this.jitter = e;
};
class yo extends ct {
  constructor(t, n) {
    var s;
    super(), this.nsps = {}, this.subs = [], t && typeof t == "object" && (n = t, t = void 0), n = n || {}, n.path = n.path || "/socket.io", this.opts = n, di(this, n), this.reconnection(n.reconnection !== !1), this.reconnectionAttempts(n.reconnectionAttempts || 1 / 0), this.reconnectionDelay(n.reconnectionDelay || 1e3), this.reconnectionDelayMax(n.reconnectionDelayMax || 5e3), this.randomizationFactor((s = n.randomizationFactor) !== null && s !== void 0 ? s : 0.5), this.backoff = new bs({
      min: this.reconnectionDelay(),
      max: this.reconnectionDelayMax(),
      jitter: this.randomizationFactor()
    }), this.timeout(n.timeout == null ? 2e4 : n.timeout), this._readyState = "closed", this.uri = t;
    const r = n.parser || Qg;
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
    this.engine = new Hg(this.uri, this.opts);
    const n = this.engine, s = this;
    this._readyState = "opening", this.skipReconnect = !1;
    const r = Jt(n, "open", function() {
      s.onopen(), t && t();
    }), i = (a) => {
      this.cleanup(), this._readyState = "closed", this.emitReserved("error", a), t ? t(a) : this.maybeReconnectOnOpen();
    }, o = Jt(n, "error", i);
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
      Jt(t, "ping", this.onping.bind(this)),
      Jt(t, "data", this.ondata.bind(this)),
      Jt(t, "error", this.onerror.bind(this)),
      Jt(t, "close", this.onclose.bind(this)),
      // @ts-ignore
      Jt(this.decoder, "decoded", this.ondecoded.bind(this))
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
    hi(() => {
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
    return s ? this._autoConnect && !s.active && s.connect() : (s = new cu(this, t, n), this.nsps[t] = s), s;
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
const Us = {};
function Dr(e, t) {
  typeof e == "object" && (t = e, e = void 0), t = t || {};
  const n = Wg(e, t.path || "/socket.io"), s = n.source, r = n.id, i = n.path, o = Us[r] && i in Us[r].nsps, a = t.forceNew || t["force new connection"] || t.multiplex === !1 || o;
  let l;
  return a ? l = new yo(s, t) : (Us[r] || (Us[r] = new yo(s, t)), l = Us[r]), n.query && !t.query && (t.query = n.queryKey), l.socket(n.path, t);
}
Object.assign(Dr, {
  Manager: yo,
  Socket: cu,
  io: Dr,
  connect: Dr
});
const tm = 5e3;
function nm() {
  const e = re([]), t = re(!1), n = re(""), s = re(!1), r = re(!1), i = re(!1), o = re("connecting"), a = re(0), l = 5, h = re({}), c = re(null), w = re("");
  let k = null;
  const D = 6e4, I = () => {
    t.value = !1, k && (clearTimeout(k), k = null);
  }, j = () => {
    t.value = !0, k && clearTimeout(k), k = setTimeout(I, D);
  };
  let F = null;
  const ie = 1e3, ce = 15e3;
  let oe = null;
  const x = /* @__PURE__ */ new Set(["ai_config_missing"]);
  let L = !1;
  const K = () => {
    oe && (clearTimeout(oe), oe = null);
  }, Y = () => {
    if (oe || L) return;
    const b = Math.min(
      ie * 2 ** Math.max(0, a.value - 1),
      ce
    );
    oe = setTimeout(() => {
      oe = null, F == null || F.connect();
    }, b);
  };
  let ye = null, Ne = null, De = null, ke = null, pe = null, Ye, Xe;
  const it = (b) => {
    Ye = b, b && F != null && F.connected && F.emit("refresh_token", { conversation_token: b });
  }, fe = (b) => {
    Xe = b;
  }, ge = () => {
    var M;
    const b = Ye || localStorage.getItem("ctid"), R = {};
    b && (R.conversation_token = b), Xe && (R.widget_id = Xe);
    try {
      R.page_url = window.parent !== window && ((M = window.parent.location) != null && M.href) ? window.parent.location.href : document.referrer || window.location.href;
    } catch {
      R.page_url = document.referrer || "";
    }
    return R;
  }, le = (b) => (F = Dr(`${vs.WS_URL}/widget`, {
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
    auth: (R) => R(ge())
  }), F.on("connect", () => {
    o.value = "connected", K(), a.value = 0;
  }), F.on("bot_typing", () => {
    j();
  }), F.on("disconnect", () => {
    I(), o.value === "connected" && (console.log("Socket disconnected, setting connection status to connecting"), o.value = "connecting");
  }), F.on("connect_error", () => {
    a.value++, console.error("Socket connection failed, attempt:", a.value), a.value >= l && (o.value = "failed"), F && !F.active && Y();
  }), F.on("chat_response", (R) => {
    if (I(), R.session_id ? (console.log("Captured session_id from chat_response:", R.session_id), w.value = R.session_id) : console.warn("No session_id in chat_response data:", R), R.type === "agent_message") {
      const M = {
        message: R.message,
        message_type: "agent",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: "",
        agent_name: R.agent_name,
        stream: !0,
        // live reply → client-side typewriter reveal
        attributes: {
          end_chat: R.end_chat,
          end_chat_reason: R.end_chat_reason,
          end_chat_description: R.end_chat_description,
          request_rating: R.request_rating
        }
      };
      R.attachments && Array.isArray(R.attachments) && (M.id = R.message_id, M.attachments = R.attachments.map((z, G) => ({
        id: R.message_id * 1e3 + G,
        filename: z.filename,
        file_url: z.file_url,
        content_type: z.content_type,
        file_size: z.file_size
      }))), e.value.push(M);
    } else R.shopify_output && typeof R.shopify_output == "object" && R.shopify_output.products ? e.value.push({
      message: R.message,
      // Keep the accompanying text message
      message_type: "product",
      // Use 'product' type for rendering
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: "",
      agent_name: R.agent_name,
      // Assign the whole structured object
      shopify_output: R.shopify_output,
      // Remove the old flattened fields (product_id, product_title, etc.)
      attributes: {
        // Keep other attributes if needed
        end_chat: R.end_chat,
        request_rating: R.request_rating
      }
    }) : e.value.push({
      message: R.message,
      message_type: "bot",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: "",
      agent_name: R.agent_name,
      stream: !0,
      // live reply → client-side typewriter reveal
      // Knowledge-base citations (display gated by show_citations in the widget)
      sources: Array.isArray(R.sources) && R.sources.length ? R.sources : void 0,
      attributes: {
        end_chat: R.end_chat,
        end_chat_reason: R.end_chat_reason,
        end_chat_description: R.end_chat_description,
        request_rating: R.request_rating
      }
    });
  }), F.on("handle_taken_over", (R) => {
    e.value.push({
      message: `${R.user_name} joined the conversation`,
      message_type: "system",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: R.session_id
    }), h.value = {
      ...h.value,
      human_agent_name: R.user_name,
      human_agent_profile_pic: R.profile_picture
    }, I(), ye && ye(R);
  }), F.on("session_initialized", (R) => {
    R.session_id && (w.value = R.session_id, pe = {
      session_id: R.session_id,
      authenticated: !!R.authenticated,
      created: !!R.created
    }, ke == null || ke(pe));
  }), F.on("error", Le), F.on("chat_history", ot), F.on("rating_submitted", ht), F.on("display_form", dt), F.on("form_submitted", vt), F.on("workflow_state", gt), F.on("workflow_proceeded", Tt), F), rt = async () => {
    try {
      return o.value = "connecting", a.value = 0, I(), K(), L = !1, F && (F.removeAllListeners(), F.disconnect(), F = null), F = le(""), new Promise((b) => {
        F == null || F.on("connect", () => {
          b(!0);
        }), F == null || F.on("connect_error", () => {
          a.value >= l && b(!1);
        });
      });
    } catch (b) {
      return console.error("Socket initialization failed:", b), o.value = "failed", !1;
    }
  }, xe = () => (F && F.disconnect(), rt()), ve = (b) => {
    ye = b;
  }, Ee = (b) => {
    ke = b, pe && b(pe);
  }, Ie = (b) => {
    Ne = b;
  }, Nt = (b) => {
    De = b;
  }, Le = (b) => {
    I(), n.value = gd(b), s.value = !0, x.has(b == null ? void 0 : b.type) && (L = !0, K()), setTimeout(() => {
      s.value = !1, n.value = "";
    }, 5e3);
  }, ot = (b) => {
    if (b.type === "chat_history" && Array.isArray(b.messages)) {
      const R = b.messages.map((M) => {
        var G, te;
        const z = {
          message: M.message,
          message_type: M.message_type,
          created_at: M.created_at,
          session_id: "",
          agent_name: M.agent_name || "",
          user_name: M.user_name || "",
          attributes: M.attributes || {},
          attachments: M.attachments || []
          // Include attachments
        };
        return Array.isArray((G = M.attributes) == null ? void 0 : G.sources) && M.attributes.sources.length && (z.sources = M.attributes.sources), (te = M.attributes) != null && te.shopify_output && typeof M.attributes.shopify_output == "object" ? {
          ...z,
          message_type: "product",
          shopify_output: M.attributes.shopify_output
        } : z;
      });
      e.value = [
        ...R.filter(
          (M) => !e.value.some(
            (z) => z.message === M.message && z.created_at === M.created_at
          )
        ),
        ...e.value
      ];
    }
  }, ht = (b) => {
    b.success && e.value.push({
      message: "Thank you for your feedback!",
      message_type: "system",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: ""
    });
  }, dt = (b) => {
    var R;
    console.log("Form display handler in composable:", b), I(), c.value = b.form_data, console.log("Set currentForm in handleDisplayForm:", c.value), ((R = b.form_data) == null ? void 0 : R.form_full_screen) === !0 ? (console.log("Full screen form detected, triggering workflow state callback"), Ne && Ne({
      type: "form",
      form_data: b.form_data,
      session_id: b.session_id
    })) : e.value.push({
      message: "",
      message_type: "form",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: b.session_id,
      attributes: {
        form_data: b.form_data
      }
    });
  }, vt = (b) => {
    console.log("Form submitted confirmation received, clearing currentForm"), c.value = null, b.success && console.log("Form submitted successfully");
  }, gt = (b) => {
    console.log("Workflow state received in composable:", b), (b.type === "form" || b.type === "display_form") && (console.log("Setting currentForm from workflow state:", b.form_data), c.value = b.form_data), Ne && Ne(b);
  }, Tt = (b) => {
    console.log("Workflow proceeded in composable:", b), De && De(b);
  }, g = async (b, R) => {
    !F || !b || F.emit("submit_rating", {
      rating: b,
      feedback: R
    });
  }, _ = async (b) => {
    var z;
    if (console.log("Submitting form in socket:", b), console.log("Current form in socket:", c.value), console.log("Socket in socket:", F), !F) {
      console.error("No socket available for form submission");
      return;
    }
    if (!b || Object.keys(b).length === 0) {
      console.error("No form data to submit");
      return;
    }
    const M = ((z = c.value) == null ? void 0 : z.form_type) === "contact" ? "submit_contact_info" : "submit_form";
    console.log(`Emitting ${M} event with data:`, b), F.emit(M, {
      form_data: b
    }), c.value = null;
  }, E = async () => {
    F && (console.log("Getting workflow state 12"), F.emit("get_workflow_state"));
  }, $ = async () => {
    F && F.emit("proceed_workflow", {});
  }, N = async (b, R, M = []) => {
    if (!F || !b.trim() && M.length === 0) return;
    const z = {
      message: b,
      message_type: "user",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: ""
    };
    M.length > 0 && (z.attachments = M.map((G, te) => {
      let me = "";
      if (G.content_type.startsWith("image/")) {
        const ue = atob(G.content), Qe = new Array(ue.length);
        for (let f = 0; f < ue.length; f++)
          Qe[f] = ue.charCodeAt(f);
        const Se = new Uint8Array(Qe), Ve = new Blob([Se], { type: G.content_type });
        me = URL.createObjectURL(Ve);
      }
      return {
        id: Date.now() * 1e3 + te,
        // Temporary ID
        filename: G.filename,
        file_url: me,
        // Temporary blob URL, will be replaced
        content_type: G.content_type,
        file_size: G.size,
        _isTemporary: !0
        // Flag to identify temporary attachments
      };
    })), e.value.push(z), F.emit("chat", {
      message: b,
      email: R,
      files: M
      // Send files with base64 content
    }), i.value = !0;
  }, B = () => {
    e.value = [], i.value = !1, w.value = "", I(), c.value = null;
  };
  return {
    messages: e,
    loading: t,
    errorMessage: n,
    showError: s,
    loadingHistory: r,
    hasStartedChat: i,
    connectionStatus: o,
    sendMessage: N,
    endChat: (b = "CUSTOMER_REQUEST") => new Promise((R) => {
      if (!F || !F.connected) {
        R(!1);
        return;
      }
      let M = !1;
      const z = (ue) => {
        M || (M = !0, clearTimeout(me), F == null || F.off("chat_ended", G), F == null || F.off("error", te), ue && B(), R(ue));
      }, G = () => z(!0), te = (ue) => {
        (ue == null ? void 0 : ue.type) === "end_chat_error" && z(!1);
      }, me = setTimeout(() => z(!1), tm);
      F.on("chat_ended", G), F.on("error", te), F.emit("end_chat", { reason: b });
    }),
    loadChatHistory: async () => {
      if (F)
        try {
          r.value = !0, F.emit("get_chat_history");
        } catch (b) {
          console.error("Failed to load chat history:", b);
        } finally {
          r.value = !1;
        }
    },
    connect: rt,
    reconnect: xe,
    cleanup: () => {
      I(), K(), F && (F.removeAllListeners(), F.disconnect(), F = null), ye = null, Ne = null, De = null;
    },
    humanAgent: h,
    onTakeover: ve,
    onSessionState: Ee,
    submitRating: g,
    currentForm: c,
    submitForm: _,
    getWorkflowState: E,
    proceedWorkflow: $,
    onWorkflowState: Ie,
    onWorkflowProceeded: Nt,
    currentSessionId: w,
    setToken: it,
    setWidgetId: fe
  };
}
function sm(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var qi = { exports: {} }, xl;
function rm() {
  return xl || (xl = 1, function(e) {
    (function() {
      function t(f, m, O) {
        return f.call.apply(f.bind, arguments);
      }
      function n(f, m, O) {
        if (!f) throw Error();
        if (2 < arguments.length) {
          var S = Array.prototype.slice.call(arguments, 2);
          return function() {
            var U = Array.prototype.slice.call(arguments);
            return Array.prototype.unshift.apply(U, S), f.apply(m, U);
          };
        }
        return function() {
          return f.apply(m, arguments);
        };
      }
      function s(f, m, O) {
        return s = Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1 ? t : n, s.apply(null, arguments);
      }
      var r = Date.now || function() {
        return +/* @__PURE__ */ new Date();
      };
      function i(f, m) {
        this.a = f, this.o = m || f, this.c = this.o.document;
      }
      var o = !!window.FontFace;
      function a(f, m, O, S) {
        if (m = f.c.createElement(m), O) for (var U in O) O.hasOwnProperty(U) && (U == "style" ? m.style.cssText = O[U] : m.setAttribute(U, O[U]));
        return S && m.appendChild(f.c.createTextNode(S)), m;
      }
      function l(f, m, O) {
        f = f.c.getElementsByTagName(m)[0], f || (f = document.documentElement), f.insertBefore(O, f.lastChild);
      }
      function h(f) {
        f.parentNode && f.parentNode.removeChild(f);
      }
      function c(f, m, O) {
        m = m || [], O = O || [];
        for (var S = f.className.split(/\s+/), U = 0; U < m.length; U += 1) {
          for (var X = !1, Q = 0; Q < S.length; Q += 1) if (m[U] === S[Q]) {
            X = !0;
            break;
          }
          X || S.push(m[U]);
        }
        for (m = [], U = 0; U < S.length; U += 1) {
          for (X = !1, Q = 0; Q < O.length; Q += 1) if (S[U] === O[Q]) {
            X = !0;
            break;
          }
          X || m.push(S[U]);
        }
        f.className = m.join(" ").replace(/\s+/g, " ").replace(/^\s+|\s+$/, "");
      }
      function w(f, m) {
        for (var O = f.className.split(/\s+/), S = 0, U = O.length; S < U; S++) if (O[S] == m) return !0;
        return !1;
      }
      function k(f) {
        return f.o.location.hostname || f.a.location.hostname;
      }
      function D(f, m, O) {
        function S() {
          be && U && X && (be(Q), be = null);
        }
        m = a(f, "link", { rel: "stylesheet", href: m, media: "all" });
        var U = !1, X = !0, Q = null, be = O || null;
        o ? (m.onload = function() {
          U = !0, S();
        }, m.onerror = function() {
          U = !0, Q = Error("Stylesheet failed to load"), S();
        }) : setTimeout(function() {
          U = !0, S();
        }, 0), l(f, "head", m);
      }
      function I(f, m, O, S) {
        var U = f.c.getElementsByTagName("head")[0];
        if (U) {
          var X = a(f, "script", { src: m }), Q = !1;
          return X.onload = X.onreadystatechange = function() {
            Q || this.readyState && this.readyState != "loaded" && this.readyState != "complete" || (Q = !0, O && O(null), X.onload = X.onreadystatechange = null, X.parentNode.tagName == "HEAD" && U.removeChild(X));
          }, U.appendChild(X), setTimeout(function() {
            Q || (Q = !0, O && O(Error("Script load timeout")));
          }, S || 5e3), X;
        }
        return null;
      }
      function j() {
        this.a = 0, this.c = null;
      }
      function F(f) {
        return f.a++, function() {
          f.a--, ce(f);
        };
      }
      function ie(f, m) {
        f.c = m, ce(f);
      }
      function ce(f) {
        f.a == 0 && f.c && (f.c(), f.c = null);
      }
      function oe(f) {
        this.a = f || "-";
      }
      oe.prototype.c = function(f) {
        for (var m = [], O = 0; O < arguments.length; O++) m.push(arguments[O].replace(/[\W_]+/g, "").toLowerCase());
        return m.join(this.a);
      };
      function x(f, m) {
        this.c = f, this.f = 4, this.a = "n";
        var O = (m || "n4").match(/^([nio])([1-9])$/i);
        O && (this.a = O[1], this.f = parseInt(O[2], 10));
      }
      function L(f) {
        return ye(f) + " " + (f.f + "00") + " 300px " + K(f.c);
      }
      function K(f) {
        var m = [];
        f = f.split(/,\s*/);
        for (var O = 0; O < f.length; O++) {
          var S = f[O].replace(/['"]/g, "");
          S.indexOf(" ") != -1 || /^\d/.test(S) ? m.push("'" + S + "'") : m.push(S);
        }
        return m.join(",");
      }
      function Y(f) {
        return f.a + f.f;
      }
      function ye(f) {
        var m = "normal";
        return f.a === "o" ? m = "oblique" : f.a === "i" && (m = "italic"), m;
      }
      function Ne(f) {
        var m = 4, O = "n", S = null;
        return f && ((S = f.match(/(normal|oblique|italic)/i)) && S[1] && (O = S[1].substr(0, 1).toLowerCase()), (S = f.match(/([1-9]00|normal|bold)/i)) && S[1] && (/bold/i.test(S[1]) ? m = 7 : /[1-9]00/.test(S[1]) && (m = parseInt(S[1].substr(0, 1), 10)))), O + m;
      }
      function De(f, m) {
        this.c = f, this.f = f.o.document.documentElement, this.h = m, this.a = new oe("-"), this.j = m.events !== !1, this.g = m.classes !== !1;
      }
      function ke(f) {
        f.g && c(f.f, [f.a.c("wf", "loading")]), Ye(f, "loading");
      }
      function pe(f) {
        if (f.g) {
          var m = w(f.f, f.a.c("wf", "active")), O = [], S = [f.a.c("wf", "loading")];
          m || O.push(f.a.c("wf", "inactive")), c(f.f, O, S);
        }
        Ye(f, "inactive");
      }
      function Ye(f, m, O) {
        f.j && f.h[m] && (O ? f.h[m](O.c, Y(O)) : f.h[m]());
      }
      function Xe() {
        this.c = {};
      }
      function it(f, m, O) {
        var S = [], U;
        for (U in m) if (m.hasOwnProperty(U)) {
          var X = f.c[U];
          X && S.push(X(m[U], O));
        }
        return S;
      }
      function fe(f, m) {
        this.c = f, this.f = m, this.a = a(this.c, "span", { "aria-hidden": "true" }, this.f);
      }
      function ge(f) {
        l(f.c, "body", f.a);
      }
      function le(f) {
        return "display:block;position:absolute;top:-9999px;left:-9999px;font-size:300px;width:auto;height:auto;line-height:normal;margin:0;padding:0;font-variant:normal;white-space:nowrap;font-family:" + K(f.c) + ";" + ("font-style:" + ye(f) + ";font-weight:" + (f.f + "00") + ";");
      }
      function rt(f, m, O, S, U, X) {
        this.g = f, this.j = m, this.a = S, this.c = O, this.f = U || 3e3, this.h = X || void 0;
      }
      rt.prototype.start = function() {
        var f = this.c.o.document, m = this, O = r(), S = new Promise(function(Q, be) {
          function Oe() {
            r() - O >= m.f ? be() : f.fonts.load(L(m.a), m.h).then(function(Ke) {
              1 <= Ke.length ? Q() : setTimeout(Oe, 25);
            }, function() {
              be();
            });
          }
          Oe();
        }), U = null, X = new Promise(function(Q, be) {
          U = setTimeout(be, m.f);
        });
        Promise.race([X, S]).then(function() {
          U && (clearTimeout(U), U = null), m.g(m.a);
        }, function() {
          m.j(m.a);
        });
      };
      function xe(f, m, O, S, U, X, Q) {
        this.v = f, this.B = m, this.c = O, this.a = S, this.s = Q || "BESbswy", this.f = {}, this.w = U || 3e3, this.u = X || null, this.m = this.j = this.h = this.g = null, this.g = new fe(this.c, this.s), this.h = new fe(this.c, this.s), this.j = new fe(this.c, this.s), this.m = new fe(this.c, this.s), f = new x(this.a.c + ",serif", Y(this.a)), f = le(f), this.g.a.style.cssText = f, f = new x(this.a.c + ",sans-serif", Y(this.a)), f = le(f), this.h.a.style.cssText = f, f = new x("serif", Y(this.a)), f = le(f), this.j.a.style.cssText = f, f = new x("sans-serif", Y(this.a)), f = le(f), this.m.a.style.cssText = f, ge(this.g), ge(this.h), ge(this.j), ge(this.m);
      }
      var ve = { D: "serif", C: "sans-serif" }, Ee = null;
      function Ie() {
        if (Ee === null) {
          var f = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent);
          Ee = !!f && (536 > parseInt(f[1], 10) || parseInt(f[1], 10) === 536 && 11 >= parseInt(f[2], 10));
        }
        return Ee;
      }
      xe.prototype.start = function() {
        this.f.serif = this.j.a.offsetWidth, this.f["sans-serif"] = this.m.a.offsetWidth, this.A = r(), Le(this);
      };
      function Nt(f, m, O) {
        for (var S in ve) if (ve.hasOwnProperty(S) && m === f.f[ve[S]] && O === f.f[ve[S]]) return !0;
        return !1;
      }
      function Le(f) {
        var m = f.g.a.offsetWidth, O = f.h.a.offsetWidth, S;
        (S = m === f.f.serif && O === f.f["sans-serif"]) || (S = Ie() && Nt(f, m, O)), S ? r() - f.A >= f.w ? Ie() && Nt(f, m, O) && (f.u === null || f.u.hasOwnProperty(f.a.c)) ? ht(f, f.v) : ht(f, f.B) : ot(f) : ht(f, f.v);
      }
      function ot(f) {
        setTimeout(s(function() {
          Le(this);
        }, f), 50);
      }
      function ht(f, m) {
        setTimeout(s(function() {
          h(this.g.a), h(this.h.a), h(this.j.a), h(this.m.a), m(this.a);
        }, f), 0);
      }
      function dt(f, m, O) {
        this.c = f, this.a = m, this.f = 0, this.m = this.j = !1, this.s = O;
      }
      var vt = null;
      dt.prototype.g = function(f) {
        var m = this.a;
        m.g && c(m.f, [m.a.c("wf", f.c, Y(f).toString(), "active")], [m.a.c("wf", f.c, Y(f).toString(), "loading"), m.a.c("wf", f.c, Y(f).toString(), "inactive")]), Ye(m, "fontactive", f), this.m = !0, gt(this);
      }, dt.prototype.h = function(f) {
        var m = this.a;
        if (m.g) {
          var O = w(m.f, m.a.c("wf", f.c, Y(f).toString(), "active")), S = [], U = [m.a.c("wf", f.c, Y(f).toString(), "loading")];
          O || S.push(m.a.c("wf", f.c, Y(f).toString(), "inactive")), c(m.f, S, U);
        }
        Ye(m, "fontinactive", f), gt(this);
      };
      function gt(f) {
        --f.f == 0 && f.j && (f.m ? (f = f.a, f.g && c(f.f, [f.a.c("wf", "active")], [f.a.c("wf", "loading"), f.a.c("wf", "inactive")]), Ye(f, "active")) : pe(f.a));
      }
      function Tt(f) {
        this.j = f, this.a = new Xe(), this.h = 0, this.f = this.g = !0;
      }
      Tt.prototype.load = function(f) {
        this.c = new i(this.j, f.context || this.j), this.g = f.events !== !1, this.f = f.classes !== !1, _(this, new De(this.c, f), f);
      };
      function g(f, m, O, S, U) {
        var X = --f.h == 0;
        (f.f || f.g) && setTimeout(function() {
          var Q = U || null, be = S || null || {};
          if (O.length === 0 && X) pe(m.a);
          else {
            m.f += O.length, X && (m.j = X);
            var Oe, Ke = [];
            for (Oe = 0; Oe < O.length; Oe++) {
              var Be = O[Oe], lt = be[Be.c], bt = m.a, Ze = Be;
              if (bt.g && c(bt.f, [bt.a.c("wf", Ze.c, Y(Ze).toString(), "loading")]), Ye(bt, "fontloading", Ze), bt = null, vt === null) if (window.FontFace) {
                var Ze = /Gecko.*Firefox\/(\d+)/.exec(window.navigator.userAgent), Gt = /OS X.*Version\/10\..*Safari/.exec(window.navigator.userAgent) && /Apple/.exec(window.navigator.vendor);
                vt = Ze ? 42 < parseInt(Ze[1], 10) : !Gt;
              } else vt = !1;
              vt ? bt = new rt(s(m.g, m), s(m.h, m), m.c, Be, m.s, lt) : bt = new xe(s(m.g, m), s(m.h, m), m.c, Be, m.s, Q, lt), Ke.push(bt);
            }
            for (Oe = 0; Oe < Ke.length; Oe++) Ke[Oe].start();
          }
        }, 0);
      }
      function _(f, m, O) {
        var U = [], S = O.timeout;
        ke(m);
        var U = it(f.a, O, f.c), X = new dt(f.c, m, S);
        for (f.h = U.length, m = 0, O = U.length; m < O; m++) U[m].load(function(Q, be, Oe) {
          g(f, X, Q, be, Oe);
        });
      }
      function E(f, m) {
        this.c = f, this.a = m;
      }
      E.prototype.load = function(f) {
        function m() {
          if (X["__mti_fntLst" + S]) {
            var Q = X["__mti_fntLst" + S](), be = [], Oe;
            if (Q) for (var Ke = 0; Ke < Q.length; Ke++) {
              var Be = Q[Ke].fontfamily;
              Q[Ke].fontStyle != null && Q[Ke].fontWeight != null ? (Oe = Q[Ke].fontStyle + Q[Ke].fontWeight, be.push(new x(Be, Oe))) : be.push(new x(Be));
            }
            f(be);
          } else setTimeout(function() {
            m();
          }, 50);
        }
        var O = this, S = O.a.projectId, U = O.a.version;
        if (S) {
          var X = O.c.o;
          I(this.c, (O.a.api || "https://fast.fonts.net/jsapi") + "/" + S + ".js" + (U ? "?v=" + U : ""), function(Q) {
            Q ? f([]) : (X["__MonotypeConfiguration__" + S] = function() {
              return O.a;
            }, m());
          }).id = "__MonotypeAPIScript__" + S;
        } else f([]);
      };
      function $(f, m) {
        this.c = f, this.a = m;
      }
      $.prototype.load = function(f) {
        var m, O, S = this.a.urls || [], U = this.a.families || [], X = this.a.testStrings || {}, Q = new j();
        for (m = 0, O = S.length; m < O; m++) D(this.c, S[m], F(Q));
        var be = [];
        for (m = 0, O = U.length; m < O; m++) if (S = U[m].split(":"), S[1]) for (var Oe = S[1].split(","), Ke = 0; Ke < Oe.length; Ke += 1) be.push(new x(S[0], Oe[Ke]));
        else be.push(new x(S[0]));
        ie(Q, function() {
          f(be, X);
        });
      };
      function N(f, m) {
        f ? this.c = f : this.c = B, this.a = [], this.f = [], this.g = m || "";
      }
      var B = "https://fonts.googleapis.com/css";
      function V(f, m) {
        for (var O = m.length, S = 0; S < O; S++) {
          var U = m[S].split(":");
          U.length == 3 && f.f.push(U.pop());
          var X = "";
          U.length == 2 && U[1] != "" && (X = ":"), f.a.push(U.join(X));
        }
      }
      function W(f) {
        if (f.a.length == 0) throw Error("No fonts to load!");
        if (f.c.indexOf("kit=") != -1) return f.c;
        for (var m = f.a.length, O = [], S = 0; S < m; S++) O.push(f.a[S].replace(/ /g, "+"));
        return m = f.c + "?family=" + O.join("%7C"), 0 < f.f.length && (m += "&subset=" + f.f.join(",")), 0 < f.g.length && (m += "&text=" + encodeURIComponent(f.g)), m;
      }
      function q(f) {
        this.f = f, this.a = [], this.c = {};
      }
      var b = { latin: "BESbswy", "latin-ext": "çöüğş", cyrillic: "йяЖ", greek: "αβΣ", khmer: "កខគ", Hanuman: "កខគ" }, R = { thin: "1", extralight: "2", "extra-light": "2", ultralight: "2", "ultra-light": "2", light: "3", regular: "4", book: "4", medium: "5", "semi-bold": "6", semibold: "6", "demi-bold": "6", demibold: "6", bold: "7", "extra-bold": "8", extrabold: "8", "ultra-bold": "8", ultrabold: "8", black: "9", heavy: "9", l: "3", r: "4", b: "7" }, M = { i: "i", italic: "i", n: "n", normal: "n" }, z = /^(thin|(?:(?:extra|ultra)-?)?light|regular|book|medium|(?:(?:semi|demi|extra|ultra)-?)?bold|black|heavy|l|r|b|[1-9]00)?(n|i|normal|italic)?$/;
      function G(f) {
        for (var m = f.f.length, O = 0; O < m; O++) {
          var S = f.f[O].split(":"), U = S[0].replace(/\+/g, " "), X = ["n4"];
          if (2 <= S.length) {
            var Q, be = S[1];
            if (Q = [], be) for (var be = be.split(","), Oe = be.length, Ke = 0; Ke < Oe; Ke++) {
              var Be;
              if (Be = be[Ke], Be.match(/^[\w-]+$/)) {
                var lt = z.exec(Be.toLowerCase());
                if (lt == null) Be = "";
                else {
                  if (Be = lt[2], Be = Be == null || Be == "" ? "n" : M[Be], lt = lt[1], lt == null || lt == "") lt = "4";
                  else var bt = R[lt], lt = bt || (isNaN(lt) ? "4" : lt.substr(0, 1));
                  Be = [Be, lt].join("");
                }
              } else Be = "";
              Be && Q.push(Be);
            }
            0 < Q.length && (X = Q), S.length == 3 && (S = S[2], Q = [], S = S ? S.split(",") : Q, 0 < S.length && (S = b[S[0]]) && (f.c[U] = S));
          }
          for (f.c[U] || (S = b[U]) && (f.c[U] = S), S = 0; S < X.length; S += 1) f.a.push(new x(U, X[S]));
        }
      }
      function te(f, m) {
        this.c = f, this.a = m;
      }
      var me = { Arimo: !0, Cousine: !0, Tinos: !0 };
      te.prototype.load = function(f) {
        var m = new j(), O = this.c, S = new N(this.a.api, this.a.text), U = this.a.families;
        V(S, U);
        var X = new q(U);
        G(X), D(O, W(S), F(m)), ie(m, function() {
          f(X.a, X.c, me);
        });
      };
      function ue(f, m) {
        this.c = f, this.a = m;
      }
      ue.prototype.load = function(f) {
        var m = this.a.id, O = this.c.o;
        m ? I(this.c, (this.a.api || "https://use.typekit.net") + "/" + m + ".js", function(S) {
          if (S) f([]);
          else if (O.Typekit && O.Typekit.config && O.Typekit.config.fn) {
            S = O.Typekit.config.fn;
            for (var U = [], X = 0; X < S.length; X += 2) for (var Q = S[X], be = S[X + 1], Oe = 0; Oe < be.length; Oe++) U.push(new x(Q, be[Oe]));
            try {
              O.Typekit.load({ events: !1, classes: !1, async: !0 });
            } catch {
            }
            f(U);
          }
        }, 2e3) : f([]);
      };
      function Qe(f, m) {
        this.c = f, this.f = m, this.a = [];
      }
      Qe.prototype.load = function(f) {
        var m = this.f.id, O = this.c.o, S = this;
        m ? (O.__webfontfontdeckmodule__ || (O.__webfontfontdeckmodule__ = {}), O.__webfontfontdeckmodule__[m] = function(U, X) {
          for (var Q = 0, be = X.fonts.length; Q < be; ++Q) {
            var Oe = X.fonts[Q];
            S.a.push(new x(Oe.name, Ne("font-weight:" + Oe.weight + ";font-style:" + Oe.style)));
          }
          f(S.a);
        }, I(this.c, (this.f.api || "https://f.fontdeck.com/s/css/js/") + k(this.c) + "/" + m + ".js", function(U) {
          U && f([]);
        })) : f([]);
      };
      var Se = new Tt(window);
      Se.a.c.custom = function(f, m) {
        return new $(m, f);
      }, Se.a.c.fontdeck = function(f, m) {
        return new Qe(m, f);
      }, Se.a.c.monotype = function(f, m) {
        return new E(m, f);
      }, Se.a.c.typekit = function(f, m) {
        return new ue(m, f);
      }, Se.a.c.google = function(f, m) {
        return new te(m, f);
      };
      var Ve = { load: s(Se.load, Se) };
      e.exports ? e.exports = Ve : (window.WebFont = Ve, window.WebFontConfig && Se.load(window.WebFontConfig));
    })();
  }(qi)), qi.exports;
}
var im = rm();
const om = /* @__PURE__ */ sm(im), Tl = [
  "Space Grotesk:400,500,600,700",
  "Instrument Sans:400,500,600",
  "JetBrains Mono:400,500,600"
], am = (e) => {
  const t = [...Tl], n = (e == null ? void 0 : e.split(",")[0].trim().replace(/['"]/g, "")) || "", s = Tl.some(
    (r) => r.toLowerCase().startsWith(n.toLowerCase())
  );
  n && !s && t.push(n), om.load({
    google: { families: t },
    active: () => {
      if (!e) return;
      const r = document.querySelector(".chat-container");
      r && (r.style.fontFamily = e.includes(",") ? e : `"${e}", system-ui, sans-serif`);
    }
  });
};
function lm() {
  const e = re({}), t = re(""), n = (r) => {
    var i;
    e.value = r, r.photo_url && (e.value.photo_url = r.photo_url), am(r.font_family), Nn({
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
const cm = 13, um = 24;
function fm(e, t) {
  const n = si({}), s = [];
  let r = null;
  const i = typeof window < "u" && typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, o = (c) => {
    r || s.length === 0 || (r = setTimeout(a, c));
  }, a = () => {
    r = null;
    const c = s[0];
    if (c === void 0) return;
    const w = e.value[c], k = n[c], D = (w == null ? void 0 : w.message) ?? "";
    if (!k || !w) {
      s.shift(), o(0);
      return;
    }
    if (k.shown >= D.length) {
      k.done = !0, s.shift(), o(0);
      return;
    }
    k.shown += 1;
    const I = D[k.shown - 1];
    t == null || t(), o(I === " " ? um : cm);
  };
  St(() => e.value.length, (c, w) => {
    w !== void 0 && c < w && (Object.keys(n).forEach((k) => {
      delete n[Number(k)];
    }), s.length = 0);
    for (let k = w ?? 0; k < c; k++) {
      const D = e.value[k];
      if (!D || !D.stream || k in n) continue;
      const I = D.message ?? "";
      i || !I ? n[k] = { shown: I.length, done: !0 } : (n[k] = { shown: 0, done: !1 }, s.push(k));
    }
    o(0);
  });
  const l = (c, w) => {
    const k = n[c];
    return k ? w.slice(0, k.shown) : w;
  }, h = (c) => {
    const w = n[c];
    return !!w && !w.done;
  };
  return rr(() => {
    r && clearTimeout(r);
  }), { displayText: l, isStreaming: h };
}
function hm(e) {
  const t = re(!0);
  let n = 0;
  const s = () => {
    Nn({ type: "UNREAD_COUNT", count: n });
  }, r = (i) => {
    var o;
    ((o = i == null ? void 0 : i.data) == null ? void 0 : o.type) === "WIDGET_VISIBILITY" && (t.value = !!i.data.open, t.value && n !== 0 && (n = 0, s()));
  };
  St(() => e.value.length, (i, o) => {
    if (i <= (o ?? 0) || t.value) return;
    const a = e.value[i - 1];
    a && (a.message_type === "bot" || a.message_type === "agent") && (n += 1, s());
  }), oi(() => window.addEventListener("message", r)), rr(() => window.removeEventListener("message", r));
}
const Jo = "ctid", dm = "identity_expired", Al = 0.8, pm = 720 * 60 * 1e3, ji = 30 * 1e3, Vi = 1e3, _s = (e) => {
  if (typeof e != "string") return e ? String(e) : null;
  const t = e.trim();
  return !t || t === "undefined" || t === "null" ? null : t;
}, Ki = (e) => {
  const t = _s(e);
  if (!t) return null;
  const [, n] = t.split(".");
  if (!n) return null;
  try {
    const s = atob(n.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(s);
  } catch {
    return null;
  }
}, gm = () => {
  try {
    return _s(localStorage.getItem(Jo));
  } catch {
    return null;
  }
}, El = (e) => {
  try {
    localStorage.setItem(Jo, e);
  } catch {
  }
}, mm = () => {
  try {
    localStorage.removeItem(Jo);
  } catch {
  }
};
function _m(e = {}) {
  const t = re(null);
  let n = null, s = null;
  const r = () => {
    n && (clearTimeout(n), n = null);
  }, i = () => {
    const I = Ki(t.value);
    return I != null && I.exp ? Number(I.exp) - Math.floor(Date.now() / Vi) : null;
  }, o = () => {
    const I = Ki(t.value);
    if (!(I != null && I.exp)) return !1;
    const j = I.iat ? Number(I.exp) - Number(I.iat) : 0, F = i() ?? 0;
    return j <= 0 ? F <= 0 : F <= j * (1 - Al);
  }, a = (I, { persist: j = !0 } = {}) => {
    var ie;
    const F = _s(I);
    if (r(), t.value = F, !F) {
      mm();
      return;
    }
    j && (El(F), (ie = e.onTokenChanged) == null || ie.call(e, F)), c();
  }, l = async (I) => {
    if (!t.value || !I) return !1;
    if (s) return s;
    const j = t.value;
    return s = (async () => {
      var F, ie;
      try {
        const ce = await fetch(`${vs.API_URL}/refresh-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${j}`
          },
          body: JSON.stringify({ widget_id: I })
        });
        if (ce.status === 401)
          return (F = e.onIdentityExpired) == null || F.call(e), !1;
        if (!ce.ok)
          return c(ji), !1;
        const oe = await ce.json(), x = _s((ie = oe == null ? void 0 : oe.data) == null ? void 0 : ie.token);
        return x ? (a(x), !0) : !1;
      } catch {
        return c(ji), !1;
      } finally {
        s = null;
      }
    })(), s;
  }, h = async (I) => t.value ? o() ? l(I) : !0 : !1, c = (I) => {
    r();
    const j = Ki(t.value);
    if (!(j != null && j.exp) || !(j != null && j.iat)) return;
    const F = (Number(j.exp) - Number(j.iat)) * Vi, ie = (i() ?? 0) * Vi, ce = I ?? Math.min(
      pm,
      Math.max(0, ie - F * (1 - Al))
    );
    n = setTimeout(() => {
      n = null, h(w).then((oe) => {
        c(oe ? void 0 : ji);
      });
    }, ce);
  };
  let w = "";
  return {
    token: t,
    start: (I, j) => {
      w = I;
      const F = _s(j) || gm();
      a(F, { persist: !1 }), F && El(F);
    },
    stop: () => {
      r(), s = null;
    },
    setToken: a,
    ensureFresh: h
  };
}
const ym = {
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
}, vm = {
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
}, bm = {
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
}, wm = {
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
}, km = {
  light: !0,
  mono: !1,
  radius: 28,
  bubble: 20,
  glow: "rgba(255,138,115,.30)",
  border: "rgba(0,0,0,.07)",
  card: "#FFFFFF",
  text: "#2A2730",
  muted: "#9A93A3",
  agentBg: "#F4F1F6",
  accent: "#FF8A73"
}, Br = {
  light: !0,
  mono: !1,
  radius: 24,
  bubble: 16,
  glow: "rgba(255,138,115,.22)",
  border: "rgba(0,0,0,.08)",
  card: "#FFFFFF",
  text: "#2A2A33",
  muted: "#8A8A99",
  agentBg: "#F3F3F6",
  accent: "#FF8A73"
}, xm = {
  GLASS: ym,
  AURORA: vm,
  TERMINAL: bm,
  CALM_MINT: wm,
  PLAYFUL: km,
  SUNRISE: Br,
  CHATBOT: Br,
  ASK_ANYTHING: Br
}, Tm = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", Sl = "'Instrument Sans', system-ui, -apple-system, 'Segoe UI', sans-serif";
function Am(e) {
  return Math.max(4, Math.round(e * 0.3));
}
function Cl(e) {
  const t = (e || "").replace("#", "");
  if (t.length < 6) return "#0B0C10";
  const n = parseInt(t.slice(0, 2), 16), s = parseInt(t.slice(2, 4), 16), r = parseInt(t.slice(4, 6), 16);
  return (0.299 * n + 0.587 * s + 0.114 * r) / 255 > 0.62 ? "#0B0C10" : "#FFFFFF";
}
function Em(e) {
  return xm[e || ""] || Br;
}
const Sm = "#212529";
function Cm(e, t) {
  const n = Em(e), s = (t == null ? void 0 : t.chat_background_color) || "", r = /^#[0-9a-fA-F]{6}$/.test(s), i = s || n.card, o = (t == null ? void 0 : t.chat_text_color) || "", l = /^#[0-9a-fA-F]{6}$/.test(o) && o.toLowerCase() !== Sm ? o : r ? ms(s) ? "#FFFFFF" : "#111111" : n.text, h = r ? ms(s) ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)" : n.muted, c = r ? pd(s, 20) : n.agentBg, w = (t == null ? void 0 : t.accent_color) || n.accent, k = r ? !ms(s) : n.light, D = Cl(w) === "#0B0C10", I = k === D ? h : w, j = n.mono ? Tm : t != null && t.font_family ? `${t.font_family}, ${Sl}` : Sl;
  return {
    "--cm-card": i,
    "--cm-text": l,
    "--cm-muted": h,
    "--cm-agent-bg": c,
    "--cm-accent": w,
    "--cm-on-accent": Cl(w),
    "--cm-presence": I,
    "--cm-border": n.border,
    "--cm-glow": n.glow,
    "--cm-radius": `${n.radius}px`,
    "--cm-bubble": `${n.bubble}px`,
    "--cm-bubble-tail": `${Am(n.bubble)}px`,
    "--cm-field-radius": n.mono ? "7px" : "12px",
    "--cm-avatar-radius": n.mono ? "28%" : "50%",
    "--cm-hairline": n.light ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.08)",
    "--cm-body-font": j
  };
}
function Rm() {
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
const Im = {
  key: 0,
  class: "widget-unavailable-overlay"
}, Lm = {
  key: 1,
  class: "auth-error-overlay"
}, Om = { class: "auth-error-card" }, Nm = { class: "auth-error-message" }, Mm = {
  key: 0,
  class: "initializing-overlay"
}, Pm = {
  key: 0,
  class: "connecting-message"
}, Fm = {
  key: 1,
  class: "failed-message"
}, Dm = { class: "welcome-content" }, Bm = { class: "welcome-header" }, $m = ["src", "alt"], Um = { class: "welcome-title" }, zm = { class: "welcome-subtitle" }, Hm = { class: "welcome-input-container" }, Wm = {
  key: 0,
  class: "email-input"
}, qm = ["disabled"], jm = { class: "welcome-message-input" }, Vm = ["placeholder", "disabled"], Km = ["disabled"], Gm = {
  key: 0,
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, Ym = {
  key: 1,
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, Xm = { class: "landing-page-content" }, Zm = { class: "landing-page-header" }, Jm = { class: "landing-page-heading" }, Qm = { class: "landing-page-text" }, e_ = { class: "landing-page-actions" }, t_ = { class: "form-fullscreen-content" }, n_ = {
  key: 0,
  class: "form-header"
}, s_ = {
  key: 0,
  class: "form-title"
}, r_ = {
  key: 1,
  class: "form-description"
}, i_ = { class: "form-fields" }, o_ = ["for"], a_ = {
  key: 0,
  class: "required-indicator"
}, l_ = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "autocomplete", "inputmode"], c_ = ["id", "placeholder", "required", "min", "max", "value", "onInput"], u_ = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput"], f_ = ["id", "required", "value", "onChange"], h_ = { value: "" }, d_ = ["value"], p_ = {
  key: 4,
  class: "checkbox-field"
}, g_ = ["id", "required", "checked", "onChange"], m_ = { class: "checkbox-label" }, __ = {
  key: 5,
  class: "radio-group"
}, y_ = ["name", "value", "required", "checked", "onChange"], v_ = { class: "radio-label" }, b_ = {
  key: 6,
  class: "field-error"
}, w_ = { class: "form-actions" }, k_ = ["disabled"], x_ = {
  key: 0,
  class: "loading-spinner-inline"
}, T_ = { key: 1 }, A_ = { class: "header-content" }, E_ = ["src", "alt"], S_ = { class: "header-info" }, C_ = { class: "status" }, R_ = { class: "status-text cm-presence" }, I_ = { class: "header-actions" }, L_ = ["disabled", "title", "aria-label", "aria-expanded"], O_ = { class: "ask-anything-header" }, N_ = ["src", "alt"], M_ = { class: "header-info" }, P_ = {
  key: 2,
  class: "loading-history"
}, F_ = { class: "cm-email-gate-title" }, D_ = ["disabled"], B_ = {
  key: 0,
  class: "cm-email-gate-error"
}, $_ = ["disabled"], U_ = {
  key: 0,
  class: "cm-welcome-block"
}, z_ = { class: "message agent-message cm-welcome-row" }, H_ = ["src", "alt"], W_ = {
  key: 0,
  class: "cm-msg-avatar",
  "aria-hidden": "true"
}, q_ = ["src"], j_ = ["src"], V_ = { class: "message-col" }, K_ = {
  key: 0,
  class: "rating-content"
}, G_ = { class: "rating-prompt" }, Y_ = ["onMouseover", "onMouseleave", "onClick", "disabled"], X_ = {
  key: 0,
  class: "feedback-wrapper"
}, Z_ = { class: "feedback-section" }, J_ = ["onUpdate:modelValue", "disabled"], Q_ = { class: "feedback-counter" }, ey = ["onClick", "disabled"], ty = {
  key: 1,
  class: "submitted-feedback-wrapper"
}, ny = { class: "submitted-feedback" }, sy = { class: "submitted-feedback-text" }, ry = {
  key: 2,
  class: "submitted-message"
}, iy = {
  key: 1,
  class: "form-content"
}, oy = {
  key: 0,
  class: "form-header"
}, ay = {
  key: 0,
  class: "form-title"
}, ly = {
  key: 1,
  class: "form-description"
}, cy = { class: "form-fields" }, uy = ["for"], fy = {
  key: 0,
  class: "required-indicator"
}, hy = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "disabled", "autocomplete", "inputmode"], dy = ["id", "placeholder", "required", "min", "max", "value", "onInput", "disabled"], py = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "disabled"], gy = ["id", "required", "value", "onChange", "disabled"], my = { value: "" }, _y = ["value"], yy = {
  key: 4,
  class: "checkbox-field"
}, vy = ["id", "checked", "onChange", "disabled"], by = ["for"], wy = {
  key: 5,
  class: "radio-field"
}, ky = ["id", "name", "value", "checked", "onChange", "disabled"], xy = ["for"], Ty = {
  key: 6,
  class: "field-error"
}, Ay = { class: "form-actions" }, Ey = ["onClick", "disabled"], Sy = {
  key: 2,
  class: "user-input-content"
}, Cy = {
  key: 0,
  class: "user-input-prompt"
}, Ry = {
  key: 1,
  class: "user-input-form"
}, Iy = ["onUpdate:modelValue", "onKeydown"], Ly = ["onClick", "disabled"], Oy = {
  key: 2,
  class: "user-input-submitted"
}, Ny = {
  key: 0,
  class: "user-input-confirmation"
}, My = {
  key: 3,
  class: "product-message-container"
}, Py = ["innerHTML"], Fy = {
  key: 1,
  class: "products-carousel"
}, Dy = { class: "carousel-items" }, By = {
  key: 0,
  class: "product-image-compact"
}, $y = ["src", "alt"], Uy = { class: "product-info-compact" }, zy = { class: "product-text-area" }, Hy = { class: "product-title-compact" }, Wy = {
  key: 0,
  class: "product-variant-compact"
}, qy = { class: "product-price-compact" }, jy = { class: "product-actions-compact" }, Vy = ["onClick"], Ky = {
  key: 2,
  class: "no-products-message"
}, Gy = {
  key: 3,
  class: "no-products-message"
}, Yy = ["innerHTML"], Xy = ["innerHTML"], Zy = {
  key: 2,
  class: "message-attachments"
}, Jy = {
  key: 0,
  class: "attachment-image-container"
}, Qy = ["src", "alt", "onClick"], ev = { class: "attachment-image-info" }, tv = ["href"], nv = { class: "attachment-size" }, sv = ["href"], rv = { class: "attachment-size" }, iv = {
  key: 0,
  class: "citation-chips"
}, ov = ["title"], av = { class: "message-info" }, lv = {
  key: 0,
  class: "agent-name"
}, cv = {
  key: 5,
  class: "cm-quick-actions-bar"
}, uv = ["disabled", "onClick"], fv = {
  key: 0,
  class: "file-previews-widget"
}, hv = {
  class: "file-preview-content-widget",
  style: { cursor: "pointer" }
}, dv = ["src", "alt", "onClick"], pv = ["onClick"], gv = { class: "file-preview-info-widget" }, mv = { class: "file-preview-name-widget" }, _v = { class: "file-preview-size-widget" }, yv = ["onClick"], vv = {
  key: 1,
  class: "upload-progress-widget"
}, bv = { class: "message-input" }, wv = ["placeholder", "disabled"], kv = ["disabled", "title"], xv = ["disabled"], Tv = {
  key: 7,
  class: "new-conversation-section"
}, Av = { class: "conversation-ended-message" }, Ev = {
  key: 8,
  class: "rating-dialog"
}, Sv = { class: "rating-content" }, Cv = { class: "star-rating" }, Rv = ["onClick"], Iv = { class: "rating-actions" }, Lv = ["disabled"], Ov = {
  key: 0,
  class: "preview-modal-image-container"
}, Nv = ["src", "alt"], Mv = { class: "preview-modal-filename" }, Pv = {
  key: 3,
  class: "widget-loading"
}, Rl = 3, Fv = "image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls", Dv = /* @__PURE__ */ Oo({
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
    } = lm(), { formatCurrency: a } = Rm(), {
      messages: l,
      loading: h,
      errorMessage: c,
      showError: w,
      loadingHistory: k,
      hasStartedChat: D,
      connectionStatus: I,
      sendMessage: j,
      endChat: F,
      loadChatHistory: ie,
      connect: ce,
      reconnect: oe,
      cleanup: x,
      humanAgent: L,
      onTakeover: K,
      submitRating: Y,
      submitForm: ye,
      currentForm: Ne,
      getWorkflowState: De,
      proceedWorkflow: ke,
      onWorkflowState: pe,
      onWorkflowProceeded: Ye,
      currentSessionId: Xe,
      setToken: it,
      setWidgetId: fe,
      onSessionState: ge
    } = nm(), { displayText: le, isStreaming: rt } = fm(l, () => es(() => Wn()));
    hm(l);
    const xe = re(""), ve = re(!0), Ee = re(""), Ie = re(!1), Nt = (d) => {
      const p = d.target;
      xe.value = p.value;
    };
    let Le = null;
    const ot = () => {
      Le && Le.disconnect(), Le = new MutationObserver((p) => {
        let u = !1, ee = !1;
        p.forEach((we) => {
          if (we.type === "childList") {
            const he = Array.from(we.addedNodes).some(
              (Ce) => {
                var Yt;
                return Ce.nodeType === Node.ELEMENT_NODE && (Ce.matches("input, textarea") || ((Yt = Ce.querySelector) == null ? void 0 : Yt.call(Ce, "input, textarea")));
              }
            ), Je = Array.from(we.removedNodes).some(
              (Ce) => {
                var Yt;
                return Ce.nodeType === Node.ELEMENT_NODE && (Ce.matches("input, textarea") || ((Yt = Ce.querySelector) == null ? void 0 : Yt.call(Ce, "input, textarea")));
              }
            );
            he && (ee = !0, u = !0), Je && (u = !0);
          }
        }), u && (clearTimeout(ot.timeoutId), ot.timeoutId = setTimeout(() => {
          dt();
        }, ee ? 50 : 100));
      });
      const d = document.querySelector(".widget-container") || document.body;
      Le.observe(d, {
        childList: !0,
        subtree: !0
      });
    };
    ot.timeoutId = null;
    let ht = [];
    const dt = () => {
      vt();
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
      let p = [];
      for (const u of d) {
        const ee = document.querySelectorAll(u);
        if (ee.length > 0) {
          p = Array.from(ee);
          break;
        }
      }
      p.length !== 0 && (ht = p, p.forEach((u) => {
        u.addEventListener("input", Tt, !0), u.addEventListener("keyup", Tt, !0), u.addEventListener("change", Tt, !0), u.addEventListener("keypress", g, !0), u.addEventListener("keydown", _, !0);
      }));
    }, vt = () => {
      ht.forEach((d) => {
        d.removeEventListener("input", Tt), d.removeEventListener("keyup", Tt), d.removeEventListener("change", Tt), d.removeEventListener("keypress", g), d.removeEventListener("keydown", _);
      }), ht = [];
    }, gt = (d) => !!(d && d.closest && d.closest(".form-message, .form-fullscreen, .cm-email-gate")), Tt = (d) => {
      if (gt(d.target)) return;
      const p = d.target;
      xe.value = p.value;
    }, g = (d) => {
      gt(d.target) || d.key === "Enter" && !d.shiftKey && (d.preventDefault(), d.stopPropagation(), zt());
    }, _ = (d) => {
      gt(d.target) || d.key === "Enter" && !d.shiftKey && (d.preventDefault(), d.stopPropagation(), zt());
    }, E = (d) => {
      const p = d.target, u = document.querySelector(".header-menu-container");
      document.querySelector(".header-menu-btn");
      const ee = document.querySelector(".header-dropdown-menu");
      ee && !(u != null && u.contains(p)) && (ee.style.display = "none");
    }, $ = re(!0), {
      token: N,
      start: B,
      stop: V,
      setToken: W,
      ensureFresh: q
    } = _m({
      onTokenChanged: (d) => {
        Nn({ type: "TOKEN_UPDATE", token: d }), it(d);
      },
      onIdentityExpired: () => {
        ta();
      }
    });
    ae(() => !!N.value);
    const b = re(null), R = re(!1), M = re(!1);
    t.initialAuthError && (b.value = t.initialAuthError, R.value = !0, $.value = !1), o();
    const z = window.__INITIAL_DATA__;
    B((z == null ? void 0 : z.widgetId) || "", z == null ? void 0 : z.initialToken), N.value && (Ie.value = !0);
    const G = re(!1);
    (z == null ? void 0 : z.allowAttachments) !== void 0 && (G.value = z.allowAttachments);
    const te = re(null), {
      chatStyles: me,
      chatIconStyles: ue,
      agentBubbleStyles: Qe,
      userBubbleStyles: Se,
      messageNameStyles: Ve,
      headerBorderStyles: f,
      photoUrl: m,
      shadowStyle: O
    } = ig(s), S = re(null), {
      uploadedAttachments: U,
      previewModal: X,
      previewFile: Q,
      formatFileSize: be,
      isImageAttachment: Oe,
      getDownloadUrl: Ke,
      getPreviewUrl: Be,
      handleFileSelect: lt,
      handleDrop: bt,
      handleDragOver: Ze,
      handleDragLeave: Gt,
      handlePaste: ar,
      removeAttachment: lr,
      openPreview: zn,
      closePreview: Hn,
      openFilePicker: ws,
      isImage: cr
    } = lg(N, S);
    ae(() => l.value.some(
      (d) => d.message_type === "form" && (!d.isSubmitted || d.isSubmitted === !1)
    ));
    const mt = ae(() => {
      var d;
      return D.value && Ie.value || !bi.value ? I.value === "connected" && !h.value : Os(Ee.value.trim()) && I.value === "connected" && !h.value || ((d = window.__INITIAL_DATA__) == null ? void 0 : d.workflow);
    }), Ut = ae(() => mt.value || h.value && I.value === "connected" && D.value), ss = ae(() => I.value === "connected" ? Ht.value ? "Ask me anything..." : "Type a message..." : "Connecting..."), rs = re(!1), zt = async () => {
      if (!xe.value.trim() && U.value.length === 0) return;
      if (h.value && D.value) {
        rs.value = !0;
        return;
      }
      !D.value && Ee.value && await Tn();
      const d = U.value.map((u) => ({
        content: u.content,
        // base64 content
        filename: u.filename,
        content_type: u.type,
        size: u.size
      }));
      await j(xe.value, Ee.value, d), U.value.forEach((u) => {
        u.url && u.url.startsWith("blob:") && URL.revokeObjectURL(u.url), u.file_url && u.file_url.startsWith("blob:") && URL.revokeObjectURL(u.file_url);
      }), xe.value = "", U.value = [];
      const p = document.querySelector('input[placeholder*="Type a message"]');
      p && (p.value = ""), setTimeout(() => {
        dt();
      }, 500);
    };
    St(h, (d) => {
      d || !rs.value || (rs.value = !1, I.value === "connected" && D.value && zt());
    });
    const ks = (d) => {
      mt.value && (xe.value = d, zt());
    }, Mt = () => {
      Nn({ type: "WIDGET_MINIMIZE" });
    }, xs = (d) => {
      d.key === "Enter" && !d.shiftKey && (d.preventDefault(), d.stopPropagation(), zt());
    }, Tn = async () => {
      var d, p, u, ee;
      try {
        if (!n.value)
          return console.error("Widget ID is not available"), b.value = "Widget ID is not available. Please refresh and try again.", R.value = !0, !1;
        await q(n.value);
        const we = new URL(`${vs.API_URL}/widgets/${n.value}`);
        Ee.value.trim() && Os(Ee.value.trim()) && we.searchParams.append("email", Ee.value.trim());
        const he = {
          Accept: "application/json",
          "Content-Type": "application/json"
        };
        N.value && (he.Authorization = `Bearer ${N.value}`);
        const Je = await fetch(we, {
          headers: he
        });
        if (Je.status === 401) {
          Ie.value = !1;
          try {
            const Rn = (await Je.json()).detail;
            if ((Rn == null ? void 0 : Rn.code) === dm)
              return ta(), !1;
            const as = typeof Rn == "string" ? Rn : "";
            (as.includes("generate-token") || as.includes("API key") || as.includes("Token required")) && (M.value = !0, b.value = "Widget authentication not configured. Please contact the website administrator.", R.value = !0, W(null));
          } catch {
            b.value = "Authentication required. Your token has expired or is invalid. Please refresh the page.", R.value = !0, W(null);
          }
          return !1;
        }
        if (!Je.ok) {
          try {
            const Cs = await Je.json();
            b.value = Cs.detail || `Error: ${Je.statusText}`;
          } catch {
            b.value = `Error: ${Je.statusText}. Please try again.`;
          }
          return R.value = !0, !1;
        }
        const Ce = await Je.json();
        return Ce.token && W(Ce.token), Ie.value = !0, b.value = null, R.value = !1, it(N.value || void 0), await ce() || console.error("Chat service not reachable yet; retrying in the background"), await ur(), (d = Ce.agent) != null && d.customization && i(Ce.agent.customization), Ce.agent && !(Ce != null && Ce.human_agent) && (r.value = Ce.agent.name), Ce != null && Ce.human_agent && (L.value = Ce.human_agent), ((p = Ce.agent) == null ? void 0 : p.allow_attachments) !== void 0 && (G.value = Ce.agent.allow_attachments), ((u = Ce.agent) == null ? void 0 : u.workflow) !== void 0 && (window.__INITIAL_DATA__ = window.__INITIAL_DATA__ || {}, window.__INITIAL_DATA__.workflow = Ce.agent.workflow), (ee = Ce.agent) != null && ee.workflow && await De(), !0;
      } catch (we) {
        return console.error("Error checking authorization:", we), b.value = "An unexpected error occurred. Please try again.", R.value = !0, Ie.value = !1, !1;
      } finally {
        $.value = !1;
      }
    }, ur = async () => {
      !D.value && Ie.value && (D.value = !0, await ie());
    }, Wn = () => {
      te.value && (te.value.scrollTop = te.value.scrollHeight);
    };
    St(() => l.value, (d) => {
      es(() => {
        Wn();
      });
    }, { deep: !0 }), St(I, (d, p) => {
      d === "connected" && p !== "connected" && setTimeout(dt, 100);
    }), St(() => l.value.length, (d, p) => {
      d > 0 && p === 0 && setTimeout(dt, 100);
    });
    let fr = null;
    St(() => l.value, (d) => {
      const p = d[d.length - 1];
      !gl(p) || p === fr || (fr = p, du(p));
    }, { deep: !0 });
    const ne = async () => {
      await oe() && await Tn();
    }, y = re(!1), H = re(0), J = re(""), Me = re(0), et = re(!1), Te = re({}), Fe = re(!1), Ge = re({}), Dt = re(!1), hn = re(null), ft = re("Start Chat"), en = re(!1), pt = re(null);
    ae(() => {
      var p;
      const d = l.value[l.value.length - 1];
      return ((p = d == null ? void 0 : d.attributes) == null ? void 0 : p.request_rating) || !1;
    });
    const Ts = ae(() => {
      var p;
      if (!((p = window.__INITIAL_DATA__) != null && p.workflow))
        return !1;
      const d = l.value.find((u) => u.message_type === "rating");
      return (d == null ? void 0 : d.isSubmitted) === !0;
    }), qn = ae(
      () => Zr(L.value.human_agent_profile_pic)
    ), du = async (d) => {
      var p, u, ee, we, he;
      if (gl(d)) {
        try {
          if (d.session_id && N.value && n.value) {
            const Je = new URL(`${vs.API_URL}/widgets/${n.value}/end-chat`);
            Je.searchParams.append("session_id", d.session_id), (p = d.attributes) != null && p.end_chat_reason && Je.searchParams.append("reason", d.attributes.end_chat_reason), (u = d.attributes) != null && u.end_chat_description && Je.searchParams.append("description", d.attributes.end_chat_description);
            const Ce = await fetch(Je, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${N.value}`,
                "Content-Type": "application/json"
              }
            });
            if (Ce.ok) {
              const Yt = await Ce.json();
              console.info(`✓ Chat session closed on backend: ${Yt.session_id}`);
            } else
              console.warn(`Failed to close session on backend: ${Ce.status}`);
          }
        } catch (Je) {
          console.error("Error calling end-chat API:", Je);
        }
        if ((ee = d.attributes) != null && ee.end_chat && ((we = d.attributes) != null && we.request_rating)) {
          const Je = d.agent_name || ((he = L.value) == null ? void 0 : he.human_agent_name) || r.value || "our agent";
          l.value.push({
            message: `Rate the chat session that you had with ${Je}`,
            message_type: "rating",
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            session_id: d.session_id,
            agent_name: Je,
            showFeedback: !1
          }), Xe.value = d.session_id;
        }
      }
    }, pu = (d) => {
      et.value || (Me.value = d);
    }, gu = () => {
      if (!et.value) {
        const d = l.value[l.value.length - 1];
        Me.value = (d == null ? void 0 : d.selectedRating) || 0;
      }
    }, mu = async (d) => {
      if (!et.value) {
        Me.value = d;
        const p = l.value[l.value.length - 1];
        p && p.message_type === "rating" && (p.showFeedback = !0, p.selectedRating = d);
      }
    }, _u = async (d, p, u = null) => {
      try {
        et.value = !0, await Y(p, u);
        const ee = l.value.find((we) => we.message_type === "rating");
        ee && (ee.isSubmitted = !0, ee.finalRating = p, ee.finalFeedback = u);
      } catch (ee) {
        console.error("Failed to submit rating:", ee);
      } finally {
        et.value = !1;
      }
    }, yu = (d) => {
      const p = {};
      for (const u of d.fields) {
        const ee = Te.value[u.name], we = pi(u, ee);
        we && (p[u.name] = we);
      }
      return Ge.value = p, Object.keys(p).length === 0;
    }, vu = async (d) => {
      if (!(Fe.value || !yu(d)))
        try {
          Fe.value = !0, await ye(Te.value);
          const u = l.value.findIndex(
            (ee) => ee.message_type === "form" && (!ee.isSubmitted || ee.isSubmitted === !1)
          );
          u !== -1 && l.value.splice(u, 1), Te.value = {}, Ge.value = {};
        } catch (u) {
          console.error("Failed to submit form:", u);
        } finally {
          Fe.value = !1;
        }
    }, Pt = (d, p) => {
      var u, ee;
      if (Te.value[d] = p, p && p.toString().trim() !== "") {
        let we = null;
        if ((u = pt.value) != null && u.fields && (we = pt.value.fields.find((he) => he.name === d)), !we && ((ee = Ne.value) != null && ee.fields) && (we = Ne.value.fields.find((he) => he.name === d)), we) {
          const he = pi(we, p);
          he ? (Ge.value[d] = he, console.log(`Validation error for ${d}:`, he)) : delete Ge.value[d];
        }
      } else
        delete Ge.value[d], console.log(`Cleared error for ${d}`);
    }, bu = (d) => {
      const p = d.replace(/\D/g, "");
      return p.length >= 7 && p.length <= 15;
    }, pi = (d, p) => {
      if (d.required && (!p || p.toString().trim() === ""))
        return `${d.label} is required`;
      if (!p || p.toString().trim() === "")
        return null;
      if (d.type === "email" && !Os(p))
        return "Please enter a valid email address";
      if (d.type === "tel" && !bu(p))
        return "Please enter a valid phone number";
      if ((d.type === "text" || d.type === "textarea") && d.minLength && p.length < d.minLength)
        return `${d.label} must be at least ${d.minLength} characters`;
      if ((d.type === "text" || d.type === "textarea") && d.maxLength && p.length > d.maxLength)
        return `${d.label} must not exceed ${d.maxLength} characters`;
      if (d.type === "number") {
        const u = parseFloat(p);
        if (isNaN(u))
          return `${d.label} must be a valid number`;
        if (d.minLength && u < d.minLength)
          return `${d.label} must be at least ${d.minLength}`;
        if (d.maxLength && u > d.maxLength)
          return `${d.label} must not exceed ${d.maxLength}`;
      }
      return null;
    }, wu = async () => {
      if (!(Fe.value || !pt.value))
        try {
          Fe.value = !0, Ge.value = {};
          let d = !1;
          for (const p of pt.value.fields || []) {
            const u = Te.value[p.name], ee = pi(p, u);
            ee && (Ge.value[p.name] = ee, d = !0, console.log(`Validation error for field ${p.name}:`, ee));
          }
          if (d) {
            Fe.value = !1, console.log("Validation failed, not submitting");
            return;
          }
          await ye(Te.value), en.value = !1, pt.value = null, Te.value = {};
        } catch (d) {
          console.error("Failed to submit full screen form:", d);
        } finally {
          Fe.value = !1, console.log("Full screen form submission completed");
        }
    }, ku = (d, p) => {
      if (console.log("handleViewDetails called with:", { product: d, shopDomain: p }), !d) {
        console.error("No product provided to handleViewDetails");
        return;
      }
      let u = null;
      if (d.handle && p)
        u = `https://${p}/products/${d.handle}`;
      else if (d.id && p)
        u = `https://${p}/products/${d.id}`;
      else if (p) {
        if (!d.handle && !d.id) {
          console.error("Product handle and ID are both missing! Product:", d), alert("Unable to open product: Product information incomplete.");
          return;
        }
      } else {
        console.error("Shop domain is missing! Product:", d), alert("Unable to open product: Shop domain not available. Please contact support.");
        return;
      }
      u && (console.log("Opening product URL:", u), window.open(u, "_blank"));
    }, xu = (d) => {
      if (!d) return "";
      let p = d.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "");
      const u = [];
      return p = p.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (ee, we, he) => {
        const Je = `__MARKDOWN_LINK_${u.length}__`;
        return console.log("Found markdown link:", ee, "-> placeholder:", Je), u.push(ee), Je;
      }), console.log("After replacing markdown links with placeholders:", p), console.log("Markdown links array:", u), p = p.replace(/https?:\/\/[^\s\)]+/g, "[link removed]"), console.log("After removing standalone URLs:", p), u.forEach((ee, we) => {
        p = p.replace(`__MARKDOWN_LINK_${we}__`, ee), console.log(`Restored markdown link ${we}:`, ee);
      }), p = p.replace(/\n\s*\n\s*\n/g, `

`).trim(), p;
    }, Qo = re(!1);
    re(!1);
    const gi = ae(() => {
      var d;
      return !!((d = L.value) != null && d.human_agent_name);
    }), ea = ae(() => {
      var d;
      return sg((d = window.__INITIAL_DATA__) == null ? void 0 : d.presence, gi.value);
    }), Tu = ae(() => G.value && gi.value && U.value.length < Rl), Au = async () => {
      try {
        Dt.value = !1, hn.value = null, await ke();
      } catch (d) {
        console.error("Failed to proceed workflow:", d);
      }
    }, mi = async (d) => {
      try {
        if (!d.userInputValue || !d.userInputValue.trim())
          return;
        const p = d.userInputValue.trim();
        d.isSubmitted = !0, d.submittedValue = p, await j(p, Ee.value);
      } catch (p) {
        console.error("Failed to submit user input:", p), d.isSubmitted = !1, d.submittedValue = null;
      }
    }, ta = () => {
      Nn({ type: "IDENTITY_EXPIRED" });
    }, Eu = async () => {
      N.value && (W(null), await As());
    }, Su = async (d) => {
      const p = _s(d);
      !p || p === N.value || (W(p), await As());
    }, As = async () => {
      var d, p, u;
      try {
        let ee = 0;
        const we = 50;
        for (; !((d = window.__INITIAL_DATA__) != null && d.widgetId) && ee < we; )
          await new Promise((Je) => setTimeout(Je, 100)), ee++;
        return (p = window.__INITIAL_DATA__) != null && p.widgetId ? (fe(window.__INITIAL_DATA__.widgetId), await Tn() ? ((u = window.__INITIAL_DATA__) != null && u.workflow && Ie.value && await De(), !0) : (I.value = "connected", !1)) : (console.error("Widget data not available after waiting"), !1);
      } catch (ee) {
        return console.error("Failed to initialize widget:", ee), !1;
      }
    };
    window.addEventListener("message", (d) => {
      d.source === window.parent && (!d.data || typeof d.data.type != "string" || (d.data.type === "SCROLL_TO_BOTTOM" && Wn(), d.data.type === "IDENTITY_UNAVAILABLE" && Eu(), d.data.type === "TOKEN_REFRESH" && Su(d.data.token), d.data.type === "WIDGET_VISIBILITY" && (fa.value = !!d.data.open), d.data.type === "WIDGET_DISPLAY" && (wi.value = {
        mode: d.data.mode,
        width: d.data.width,
        height: d.data.height,
        hotkey: d.data.hotkey
      }), d.data.type === "PREFILL_MESSAGE" && typeof d.data.text == "string" && (xe.value = d.data.text.slice(0, 2e3), es(() => {
        const p = document.querySelector(
          ".message-input input, .welcome-message-field"
        );
        p == null || p.focus();
      }))));
    });
    const Cu = () => {
      K(async () => {
        await Tn();
      }), ge(({ session_id: d, authenticated: p, created: u }) => {
        Nn({
          type: "CHAT_SESSION",
          sessionId: d,
          authenticated: p,
          created: u
        });
      }), pe((d) => {
        var p;
        if (ft.value = d.button_text || "Start Chat", d.type === "landing_page")
          hn.value = d.landing_page_data, Dt.value = !0, en.value = !1;
        else if (d.type === "form" || d.type === "display_form")
          if (((p = d.form_data) == null ? void 0 : p.form_full_screen) === !0)
            pt.value = d.form_data, en.value = !0, Dt.value = !1;
          else {
            const u = {
              message: "",
              message_type: "form",
              attributes: {
                form_data: d.form_data
              },
              created_at: (/* @__PURE__ */ new Date()).toISOString(),
              isSubmitted: !1
            };
            l.value.findIndex(
              (we) => we.message_type === "form" && !we.isSubmitted
            ) === -1 && l.value.push(u), Dt.value = !1, en.value = !1;
          }
        else
          Dt.value = !1, en.value = !1;
      }), Ye((d) => {
        console.log("Workflow proceeded:", d);
      });
    }, Ru = async () => {
      try {
        await As(), await De();
      } catch (d) {
        throw console.error("Failed to start new conversation:", d), d;
      }
    }, hr = ae(
      () => {
        var d;
        return s.value.allow_new_chat === !0 && l.value.length > 0 && !((d = L.value) != null && d.human_agent_name) && !Vn.value;
      }
    ), An = re(!1), En = re(""), Sn = re(!1);
    let jn = null;
    const is = () => {
      Sn.value = !1, En.value = "", jn && (clearTimeout(jn), jn = null);
    }, na = () => {
      if (!An.value) {
        if (Sn.value) {
          is();
          return;
        }
        Sn.value = !0, En.value = "", jn = setTimeout(is, Ap);
      }
    };
    St(hr, (d) => {
      d || is();
    });
    const sa = async () => {
      An.value || (jn && (clearTimeout(jn), jn = null), await Iu(), En.value || (Sn.value = !1));
    }, Iu = async () => {
      if (!An.value) {
        An.value = !0, En.value = "";
        try {
          if (!await F()) {
            En.value = pl;
            return;
          }
          L.value = {}, xe.value = "", U.value = [], await As();
        } catch (d) {
          console.error("Failed to start a new chat:", d), En.value = pl;
        } finally {
          An.value = !1;
        }
      }
    }, Lu = async () => {
      Ts.value = !1, l.value = [], L.value = {}, await Ru();
    };
    oi(async () => {
      await As(), Cu(), ot(), document.addEventListener("click", E), (() => {
        const p = l.value.length > 0, u = I.value === "connected", ee = document.querySelector('input[type="text"], textarea') !== null;
        return p || u || ee;
      })() && setTimeout(dt, 100);
    }), rr(() => {
      window.removeEventListener("message", (d) => {
        d.data.type === "SCROLL_TO_BOTTOM" && Wn();
      }), document.removeEventListener("click", E), Le && (Le.disconnect(), Le = null), ot.timeoutId && (clearTimeout(ot.timeoutId), ot.timeoutId = null), vt(), V(), is(), x();
    });
    const os = ae(() => s.value.chat_style === "AURORA"), Ht = ae(() => s.value.chat_style === "ASK_ANYTHING" || os.value), ra = ae(() => s.value.customization_metadata), dr = ae(() => {
      var p;
      const d = (p = ra.value) == null ? void 0 : p.avatar_style;
      return d === "orb" ? !0 : d === "photo" ? !1 : os.value && !s.value.photo_url;
    }), Es = ae(() => {
      var d;
      return tg(r.value || "", (d = ra.value) == null ? void 0 : d.orb_variant);
    }), Ou = {
      GLASS: "theme-glass",
      TERMINAL: "theme-terminal",
      PLAYFUL: "theme-playful",
      CALM_MINT: "theme-calm",
      SUNRISE: "theme-sunrise"
    }, Nu = ae(() => Ou[s.value.chat_style] || ""), Mu = ae(() => Cm(s.value.chat_style, {
      chat_background_color: s.value.chat_background_color,
      chat_text_color: s.value.chat_text_color,
      accent_color: s.value.accent_color,
      font_family: s.value.font_family
    })), _i = ae(
      () => Array.isArray(s.value.quick_actions) ? s.value.quick_actions.filter((d) => !!d && d.trim().length > 0) : []
    ), ia = ae(() => (s.value.welcome_message || "").trim()), oa = ae(
      () => !Ht.value && l.value.length === 0 && !k.value && !Vn.value
    ), Pu = ae(
      () => oa.value && ia.value.length > 0
    ), Fu = ae(
      () => oa.value && !Ts.value && _i.value.length > 0
    ), pr = ae(() => s.value.show_citations === !0), aa = ae(() => ng(s.value.show_ai_disclaimer, gi.value)), Du = (d) => /^[0-9a-f]{16,}$/i.test(d) || /^[0-9a-f-]{32,}$/i.test(d), yi = (d) => {
      const p = (d || "").trim().toLowerCase();
      return !p || p === "unknown" ? "Knowledge base" : p.charAt(0).toUpperCase() + p.slice(1);
    }, vi = (d) => {
      let p = ((d == null ? void 0 : d.name) || "").trim();
      return !p || (p = p.replace(/^[0-9a-f]{16,}[_-]/i, "").replace(/\.(pdf|txt|md|html?|docx?|csv|json)$/i, ""), !p || Du(p)) ? yi(d == null ? void 0 : d.type) : p;
    }, la = (d) => {
      const p = vi(d), u = yi(d == null ? void 0 : d.type);
      return p === u ? u : `${p} · ${u}`;
    }, bi = ae(() => s.value.collect_email === !0 && !Ht.value), ca = re(!1), Cn = re(""), Ss = re(!1), Vn = ae(() => !D.value && bi.value && !ca.value), ua = async () => {
      const d = Ee.value.trim();
      if (!d) {
        Cn.value = "Please enter your email address.";
        return;
      }
      if (!Os(d)) {
        Cn.value = "Please enter a valid email address.";
        return;
      }
      Cn.value = "", Ss.value = !0;
      try {
        await Tn(), ca.value = !0;
      } catch {
        Cn.value = "Something went wrong. Please try again.";
      } finally {
        Ss.value = !1;
      }
    }, wi = re(null), fa = re(!0), ki = { mode: "floating", width: 400, height: 560 }, gr = ae(
      () => {
        var d;
        return wi.value || ((d = s.value.customization_metadata) == null ? void 0 : d.widget_display) || null;
      }
    ), Bu = ae(() => {
      const d = gr.value;
      return d ? typeof d.mode == "string" && d.mode !== ki.mode || typeof d.width == "number" && d.width !== ki.width || typeof d.height == "number" && d.height !== ki.height : !1;
    }), $u = ae(() => {
      var p;
      const d = {
        width: "100%",
        height: "100%",
        borderRadius: "var(--radius-lg)"
      };
      if (Bu.value) {
        const u = (p = gr.value) == null ? void 0 : p.mode;
        return u === "sidebar-left" || u === "sidebar-right" ? { ...d, borderRadius: "0" } : d;
      }
      return Ht.value ? window.innerWidth <= 768 ? {
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
    }), ha = ae(() => Ht.value && l.value.length === 0), Uu = ["form", "user_input", "rating", "product", "shopify_output"], zu = ae(
      () => l.value.some(
        (d) => Uu.includes(d.message_type) || Array.isArray(d.attachments) && d.attachments.length > 0
      )
    ), Hu = ae(() => {
      var p, u;
      return Ht.value ? !0 : (((p = gr.value) == null ? void 0 : p.mode) === "ask-ai" || ((u = gr.value) == null ? void 0 : u.mode) === "search-bar") && !G.value;
    }), xi = ae(
      () => Hu.value && ve.value && !Dt.value && !en.value && !Vn.value && !Ts.value && !zu.value
    );
    St(xi, (d) => {
      Nn({ type: "WIDGET_SURFACE", palette: d });
    }, { immediate: !0 });
    const Wu = ae(
      () => s.value.welcome_subtitle || `Ask a question — ${r.value || "the assistant"} answers from what it knows.`
    ), qu = ae(() => {
      var d;
      return ((d = wi.value) == null ? void 0 : d.hotkey) !== !1;
    });
    return (d, p) => R.value && M.value ? (T(), A("div", Im, [
      v("button", {
        type: "button",
        class: "cm-error-close",
        "aria-label": "Close chat",
        title: "Close",
        onClick: Mt
      }, "×"),
      p[20] || (p[20] = Yn('<div class="widget-unavailable-card" data-v-56b9c02d><div class="widget-unavailable-icon-wrapper" data-v-56b9c02d><svg class="widget-unavailable-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-v-56b9c02d><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" data-v-56b9c02d></path><path d="M9 12l2 2 4-4" data-v-56b9c02d></path></svg></div><h2 class="widget-unavailable-title" data-v-56b9c02d>Chat Unavailable</h2><p class="widget-unavailable-message" data-v-56b9c02d> This chat widget is not currently configured. Please contact the website administrator to enable chat support. </p><div class="widget-unavailable-footer" data-v-56b9c02d><svg class="chattermate-logo-small" width="14" height="14" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-56b9c02d><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-56b9c02d></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-56b9c02d></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-56b9c02d></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-56b9c02d></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-56b9c02d><span class="cm-powered-prefix" data-v-56b9c02d>Powered by </span><strong class="cm-brand" data-v-56b9c02d>ChatterMate</strong></a></div></div>', 1))
    ])) : R.value ? (T(), A("div", Lm, [
      v("button", {
        type: "button",
        class: "cm-error-close",
        "aria-label": "Close chat",
        title: "Close",
        onClick: Mt
      }, "×"),
      v("div", Om, [
        p[21] || (p[21] = Yn('<div class="auth-error-header" data-v-56b9c02d><svg class="auth-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-56b9c02d><circle cx="12" cy="12" r="10" data-v-56b9c02d></circle><line x1="12" y1="8" x2="12" y2="12" data-v-56b9c02d></line><line x1="12" y1="16" x2="12.01" y2="16" data-v-56b9c02d></line></svg><h2 data-v-56b9c02d>Authentication Error</h2></div>', 1)),
        v("p", Nm, Z(b.value), 1),
        v("button", {
          class: "auth-error-refresh-btn",
          onClick: p[0] || (p[0] = () => d.window.location.reload())
        }, " Refresh Page ")
      ])
    ])) : n.value && !R.value ? (T(), A("div", {
      key: 2,
      class: $e(["chat-container cm-surface", [{ collapsed: !ve.value, "ask-anything-style": Ht.value, aurora: os.value }, Nu.value]]),
      style: Ae({ ...C(O), ...$u.value, ...Mu.value })
    }, [
      $.value ? (T(), A("div", Mm, p[22] || (p[22] = [
        Yn('<div class="loading-spinner" data-v-56b9c02d><div class="dot" data-v-56b9c02d></div><div class="dot" data-v-56b9c02d></div><div class="dot" data-v-56b9c02d></div></div><div class="loading-text" data-v-56b9c02d>Initializing chat...</div>', 2)
      ]))) : se("", !0),
      !$.value && C(I) !== "connected" ? (T(), A("div", {
        key: 1,
        class: $e(["connection-status", C(I)])
      }, [
        C(I) === "connecting" ? (T(), A("div", Pm, p[23] || (p[23] = [
          pn(" Connecting to chat service... ", -1),
          v("div", { class: "loading-dots" }, [
            v("div", { class: "dot" }),
            v("div", { class: "dot" }),
            v("div", { class: "dot" })
          ], -1)
        ]))) : C(I) === "failed" ? (T(), A("div", Fm, [
          p[24] || (p[24] = pn(" Connection failed. ", -1)),
          v("button", {
            onClick: ne,
            class: "reconnect-button"
          }, " Click here to reconnect ")
        ])) : se("", !0)
      ], 2)) : se("", !0),
      C(w) ? (T(), A("div", {
        key: 2,
        class: "error-alert",
        style: Ae(C(ue))
      }, Z(C(c)), 5)) : se("", !0),
      xi.value ? (T(), qr(Jp, {
        key: 3,
        messages: C(l),
        draft: xe.value,
        "agent-name": C(r),
        suggestions: _i.value,
        "welcome-title": C(s).welcome_title,
        "welcome-subtitle": Wu.value,
        placeholder: ss.value,
        "input-enabled": mt.value,
        "typing-enabled": Ut.value,
        loading: C(h),
        "show-citations": pr.value,
        disclaimer: aa.value ? C(ml) : "",
        active: fa.value,
        hotkey: qu.value,
        "can-start-new-chat": hr.value,
        "starting-new-chat": An.value,
        "new-chat-armed": Sn.value,
        "new-chat-error": En.value,
        onNewChat: na,
        onConfirmNewChat: sa,
        onCancelNewChat: is,
        "citation-label": vi,
        "citation-tooltip": la,
        "display-text": C(le),
        "is-streaming": C(rt),
        "onUpdate:draft": p[1] || (p[1] = (u) => xe.value = u),
        onSend: zt,
        onAsk: ks,
        onClose: Mt
      }, null, 8, ["messages", "draft", "agent-name", "suggestions", "welcome-title", "welcome-subtitle", "placeholder", "input-enabled", "typing-enabled", "loading", "show-citations", "disclaimer", "active", "hotkey", "can-start-new-chat", "starting-new-chat", "new-chat-armed", "new-chat-error", "display-text", "is-streaming"])) : ha.value ? (T(), A("div", {
        key: 4,
        class: $e(["welcome-message-section", { aurora: os.value }]),
        style: Ae(C(me))
      }, [
        v("div", Dm, [
          v("div", Bm, [
            dr.value ? (T(), A("div", {
              key: 0,
              class: "welcome-orb",
              style: Ae(Es.value)
            }, null, 4)) : C(m) ? (T(), A("img", {
              key: 1,
              src: C(m),
              alt: C(r),
              class: "welcome-avatar"
            }, null, 8, $m)) : se("", !0),
            v("h1", Um, Z(C(s).welcome_title || `Welcome to ${C(r)}`), 1),
            v("p", zm, Z(C(s).welcome_subtitle || "I'm here to help you with anything you need. What can I assist you with today?"), 1)
          ])
        ]),
        v("div", Hm, [
          !C(D) && !Ie.value && bi.value ? (T(), A("div", Wm, [
            In(v("input", {
              "onUpdate:modelValue": p[2] || (p[2] = (u) => Ee.value = u),
              type: "email",
              placeholder: "Enter your email address",
              disabled: C(h) || C(I) !== "connected",
              class: $e([{
                invalid: Ee.value.trim() && !C(Os)(Ee.value.trim()),
                disabled: C(I) !== "connected"
              }, "welcome-email-input"])
            }, null, 10, qm), [
              [Xn, Ee.value]
            ])
          ])) : se("", !0),
          v("div", jm, [
            In(v("input", {
              "onUpdate:modelValue": p[3] || (p[3] = (u) => xe.value = u),
              type: "text",
              placeholder: ss.value,
              onKeypress: xs,
              onInput: Nt,
              onChange: Nt,
              disabled: !Ut.value,
              class: $e([{ disabled: !Ut.value }, "welcome-message-field"])
            }, null, 42, Vm), [
              [Xn, xe.value]
            ]),
            v("button", {
              class: $e(["welcome-send-button", { "aurora-send": os.value }]),
              style: Ae(C(Se)),
              onClick: zt,
              disabled: !xe.value.trim() || !mt.value
            }, [
              os.value ? (T(), A("svg", Gm, p[25] || (p[25] = [
                v("path", {
                  d: "M12 19V5M12 5L5 12M12 5L19 12",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                }, null, -1)
              ]))) : (T(), A("svg", Ym, p[26] || (p[26] = [
                v("path", {
                  d: "M5 12L3 21L21 12L3 3L5 12ZM5 12L13 12",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                }, null, -1)
              ])))
            ], 14, Km)
          ])
        ]),
        v("div", {
          class: "powered-by-welcome",
          style: Ae(C(Ve))
        }, p[27] || (p[27] = [
          Yn('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-56b9c02d><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-56b9c02d></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-56b9c02d></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-56b9c02d></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-56b9c02d></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-56b9c02d><span class="cm-powered-prefix" data-v-56b9c02d>Powered by </span><strong class="cm-brand" data-v-56b9c02d>ChatterMate</strong></a>', 2)
        ]), 4)
      ], 6)) : se("", !0),
      Dt.value && hn.value ? (T(), A("div", {
        key: 5,
        class: "landing-page-fullscreen",
        style: Ae(C(me))
      }, [
        v("div", Xm, [
          v("div", Zm, [
            v("h2", Jm, Z(hn.value.heading), 1),
            v("div", Qm, Z(hn.value.content), 1)
          ]),
          v("div", e_, [
            v("button", {
              class: "landing-page-button",
              onClick: Au
            }, Z(ft.value), 1)
          ])
        ]),
        v("div", {
          class: "powered-by-landing",
          style: Ae(C(Ve))
        }, p[28] || (p[28] = [
          Yn('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-56b9c02d><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-56b9c02d></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-56b9c02d></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-56b9c02d></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-56b9c02d></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-56b9c02d><span class="cm-powered-prefix" data-v-56b9c02d>Powered by </span><strong class="cm-brand" data-v-56b9c02d>ChatterMate</strong></a>', 2)
        ]), 4)
      ], 4)) : en.value && pt.value ? (T(), A("div", {
        key: 6,
        class: "form-fullscreen",
        style: Ae(C(me))
      }, [
        v("div", t_, [
          pt.value.title || pt.value.description ? (T(), A("div", n_, [
            pt.value.title ? (T(), A("h2", s_, Z(pt.value.title), 1)) : se("", !0),
            pt.value.description ? (T(), A("p", r_, Z(pt.value.description), 1)) : se("", !0)
          ])) : se("", !0),
          v("div", i_, [
            (T(!0), A(Ue, null, _t(pt.value.fields, (u) => {
              var ee, we;
              return T(), A("div", {
                key: u.name,
                class: "form-field"
              }, [
                v("label", {
                  for: `fullscreen-form-${u.name}`,
                  class: "field-label"
                }, [
                  pn(Z(u.label) + " ", 1),
                  u.required ? (T(), A("span", a_, "*")) : se("", !0)
                ], 8, o_),
                u.type === "text" || u.type === "email" || u.type === "tel" ? (T(), A("input", {
                  key: 0,
                  id: `fullscreen-form-${u.name}`,
                  type: u.type,
                  placeholder: u.placeholder || "",
                  required: u.required,
                  minlength: u.minLength,
                  maxlength: u.maxLength,
                  value: Te.value[u.name] || "",
                  onInput: (he) => Pt(u.name, he.target.value),
                  onBlur: (he) => Pt(u.name, he.target.value),
                  class: $e(["form-input", { error: Ge.value[u.name] }]),
                  autocomplete: u.type === "email" ? "email" : u.type === "tel" ? "tel" : "off",
                  inputmode: u.type === "tel" ? "tel" : u.type === "email" ? "email" : "text"
                }, null, 42, l_)) : u.type === "number" ? (T(), A("input", {
                  key: 1,
                  id: `fullscreen-form-${u.name}`,
                  type: "number",
                  placeholder: u.placeholder || "",
                  required: u.required,
                  min: u.minLength,
                  max: u.maxLength,
                  value: Te.value[u.name] || "",
                  onInput: (he) => Pt(u.name, he.target.value),
                  class: $e(["form-input", { error: Ge.value[u.name] }])
                }, null, 42, c_)) : u.type === "textarea" ? (T(), A("textarea", {
                  key: 2,
                  id: `fullscreen-form-${u.name}`,
                  placeholder: u.placeholder || "",
                  required: u.required,
                  minlength: u.minLength,
                  maxlength: u.maxLength,
                  value: Te.value[u.name] || "",
                  onInput: (he) => Pt(u.name, he.target.value),
                  class: $e(["form-textarea", { error: Ge.value[u.name] }]),
                  rows: "4"
                }, null, 42, u_)) : u.type === "select" ? (T(), A("select", {
                  key: 3,
                  id: `fullscreen-form-${u.name}`,
                  required: u.required,
                  value: Te.value[u.name] || "",
                  onChange: (he) => Pt(u.name, he.target.value),
                  class: $e(["form-select", { error: Ge.value[u.name] }])
                }, [
                  v("option", h_, Z(u.placeholder || "Please select..."), 1),
                  (T(!0), A(Ue, null, _t((Array.isArray(u.options) ? u.options : ((ee = u.options) == null ? void 0 : ee.split(`
`)) || []).filter((he) => he.trim()), (he) => (T(), A("option", {
                    key: he,
                    value: he.trim()
                  }, Z(he.trim()), 9, d_))), 128))
                ], 42, f_)) : u.type === "checkbox" ? (T(), A("label", p_, [
                  v("input", {
                    id: `fullscreen-form-${u.name}`,
                    type: "checkbox",
                    required: u.required,
                    checked: Te.value[u.name] || !1,
                    onChange: (he) => Pt(u.name, he.target.checked),
                    class: "form-checkbox"
                  }, null, 40, g_),
                  v("span", m_, Z(u.label), 1)
                ])) : u.type === "radio" ? (T(), A("div", __, [
                  (T(!0), A(Ue, null, _t((Array.isArray(u.options) ? u.options : ((we = u.options) == null ? void 0 : we.split(`
`)) || []).filter((he) => he.trim()), (he) => (T(), A("label", {
                    key: he,
                    class: "radio-field"
                  }, [
                    v("input", {
                      type: "radio",
                      name: `fullscreen-form-${u.name}`,
                      value: he.trim(),
                      required: u.required,
                      checked: Te.value[u.name] === he.trim(),
                      onChange: (Je) => Pt(u.name, he.trim()),
                      class: "form-radio"
                    }, null, 40, y_),
                    v("span", v_, Z(he.trim()), 1)
                  ]))), 128))
                ])) : se("", !0),
                Ge.value[u.name] ? (T(), A("div", b_, Z(Ge.value[u.name]), 1)) : se("", !0)
              ]);
            }), 128))
          ]),
          v("div", w_, [
            v("button", {
              onClick: p[4] || (p[4] = () => {
                console.log("Submit button clicked!"), wu();
              }),
              disabled: Fe.value,
              class: "submit-form-button",
              style: Ae(C(Se))
            }, [
              Fe.value ? (T(), A("span", x_, p[29] || (p[29] = [
                v("div", { class: "dot" }, null, -1),
                v("div", { class: "dot" }, null, -1),
                v("div", { class: "dot" }, null, -1)
              ]))) : (T(), A("span", T_, Z(pt.value.submit_button_text || "Submit"), 1))
            ], 12, k_)
          ])
        ]),
        v("div", {
          class: "powered-by-landing",
          style: Ae(C(Ve))
        }, p[30] || (p[30] = [
          Yn('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-56b9c02d><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-56b9c02d></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-56b9c02d></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-56b9c02d></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-56b9c02d></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-56b9c02d><span class="cm-powered-prefix" data-v-56b9c02d>Powered by </span><strong class="cm-brand" data-v-56b9c02d>ChatterMate</strong></a>', 2)
        ]), 4)
      ], 4)) : !ha.value && ve.value && !xi.value ? (T(), A("div", {
        key: 7,
        class: $e(["chat-panel", { "ask-anything-chat": Ht.value }]),
        style: Ae(C(me))
      }, [
        Ht.value ? (T(), A("div", {
          key: 1,
          class: "ask-anything-top",
          style: Ae(C(f))
        }, [
          v("div", O_, [
            qn.value || C(m) ? (T(), A("img", {
              key: 0,
              src: qn.value || C(m),
              alt: C(L).human_agent_name || C(r),
              class: "header-avatar"
            }, null, 8, N_)) : se("", !0),
            v("div", M_, [
              v("h3", {
                style: Ae(C(Ve))
              }, Z(C(r)), 5),
              v("p", {
                class: "ask-anything-subtitle",
                style: Ae(C(Ve))
              }, Z(C(s).welcome_subtitle || "Ask me anything. I'm here to help."), 5)
            ])
          ])
        ], 4)) : (T(), A("div", {
          key: 0,
          class: "chat-header",
          style: Ae(C(f))
        }, [
          v("div", {
            class: "cm-header-sheen",
            style: Ae({ background: "linear-gradient(90deg, transparent, " + (C(s).accent_color || "#C9F24E") + ", transparent)" })
          }, null, 4),
          v("div", A_, [
            !qn.value && (dr.value || !C(m)) ? (T(), A("div", {
              key: 0,
              class: "header-orb",
              style: Ae(Es.value)
            }, null, 4)) : qn.value || C(m) ? (T(), A("img", {
              key: 1,
              src: qn.value || C(m),
              alt: C(L).human_agent_name || C(r),
              class: "header-avatar"
            }, null, 8, E_)) : se("", !0),
            v("div", S_, [
              v("h3", {
                style: Ae(C(Ve))
              }, Z(C(L).human_agent_name || C(r)), 5),
              v("div", C_, [
                v("span", {
                  class: $e(["status-indicator", ea.value.online ? "online" : "away"])
                }, null, 2),
                v("span", R_, Z(ea.value.text), 1)
              ])
            ])
          ]),
          v("div", I_, [
            hr.value ? (T(), A("button", {
              key: 0,
              type: "button",
              class: $e(["header-new-chat", { armed: Sn.value }]),
              style: Ae(C(Ve)),
              disabled: An.value,
              title: C(Xr),
              "aria-label": C(Xr),
              "aria-expanded": Sn.value,
              onClick: na
            }, p[31] || (p[31] = [
              v("svg", {
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
                v("path", { d: "M12 20h9" }),
                v("path", { d: "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" })
              ], -1)
            ]), 14, L_)) : se("", !0),
            v("button", {
              type: "button",
              class: "header-minimize",
              style: Ae(C(Ve)),
              title: "Minimize",
              "aria-label": "Minimize chat",
              onClick: Mt
            }, p[32] || (p[32] = [
              v("svg", {
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
                v("path", { d: "M6 9l6 6 6-6" })
              ], -1)
            ]), 4)
          ])
        ], 4)),
        C(k) ? (T(), A("div", P_, p[33] || (p[33] = [
          v("div", { class: "loading-spinner" }, [
            v("div", { class: "dot" }),
            v("div", { class: "dot" }),
            v("div", { class: "dot" })
          ], -1)
        ]))) : se("", !0),
        Vn.value ? (T(), A("div", {
          key: 3,
          class: "cm-email-gate",
          style: Ae(C(me))
        }, [
          v("div", {
            class: "cm-email-gate-orb",
            style: Ae(Es.value)
          }, null, 4),
          v("h3", F_, Z(C(s).welcome_title || "Before we start"), 1),
          p[34] || (p[34] = v("p", { class: "cm-email-gate-text" }, "Enter your email and we'll continue the chat.", -1)),
          In(v("input", {
            "onUpdate:modelValue": p[5] || (p[5] = (u) => Ee.value = u),
            type: "email",
            inputmode: "email",
            autocomplete: "email",
            placeholder: "you@example.com",
            class: $e(["cm-email-gate-input", { invalid: !!Cn.value }]),
            disabled: Ss.value,
            onKeyup: Rr(ua, ["enter"]),
            onInput: p[6] || (p[6] = (u) => Cn.value = "")
          }, null, 42, D_), [
            [Xn, Ee.value]
          ]),
          Cn.value ? (T(), A("p", B_, Z(Cn.value), 1)) : se("", !0),
          v("button", {
            type: "button",
            class: "cm-email-gate-btn",
            style: Ae(C(Se)),
            disabled: Ss.value,
            onClick: ua
          }, Z(Ss.value ? "Please wait…" : "Continue to chat"), 13, $_)
        ], 4)) : se("", !0),
        Sn.value && hr.value ? (T(), qr(Yc, {
          key: 4,
          busy: An.value,
          error: En.value,
          onConfirm: sa,
          onCancel: is
        }, null, 8, ["busy", "error"])) : se("", !0),
        In(v("div", {
          class: "chat-messages",
          ref_key: "messagesContainer",
          ref: te
        }, [
          Pu.value ? (T(), A("div", U_, [
            v("div", z_, [
              dr.value || !C(m) ? (T(), A("div", {
                key: 0,
                class: "cm-welcome-orb",
                style: Ae(Es.value)
              }, null, 4)) : (T(), A("img", {
                key: 1,
                src: C(m),
                alt: C(r),
                class: "cm-welcome-avatar"
              }, null, 8, H_)),
              v("div", {
                class: "message-bubble cm-welcome-bubble",
                style: Ae(C(Qe))
              }, Z(ia.value), 5)
            ])
          ])) : se("", !0),
          (T(!0), A(Ue, null, _t(C(l), (u, ee) => {
            var we, he, Je, Ce, Yt, Cs, Rn, as, da, pa, ga, ma, _a, ya, va, ba, wa, ka, xa;
            return T(), A("div", {
              key: ee,
              class: $e([
                "message",
                u.message_type === "bot" || u.message_type === "agent" ? "agent-message" : u.message_type === "system" ? "system-message" : u.message_type === "rating" ? "rating-message" : u.message_type === "form" ? "form-message" : u.message_type === "product" || u.shopify_output ? "product-message" : "user-message"
              ])
            }, [
              u.message_type === "bot" || u.message_type === "agent" ? (T(), A("div", W_, [
                qn.value ? (T(), A("img", {
                  key: 0,
                  src: qn.value,
                  class: "cm-msg-avatar-img",
                  alt: ""
                }, null, 8, q_)) : !dr.value && C(m) ? (T(), A("img", {
                  key: 1,
                  src: C(m),
                  class: "cm-msg-avatar-img",
                  alt: ""
                }, null, 8, j_)) : (T(), A("div", {
                  key: 2,
                  class: "cm-msg-avatar-orb",
                  style: Ae(Es.value)
                }, null, 4))
              ])) : se("", !0),
              v("div", V_, [
                v("div", {
                  class: "message-bubble",
                  style: Ae(u.message_type === "system" || u.message_type === "rating" || u.message_type === "form" || u.message_type === "product" || u.shopify_output ? {} : u.message_type === "user" ? C(Se) : C(Qe))
                }, [
                  u.message_type === "rating" ? (T(), A("div", K_, [
                    v("p", G_, "Rate the chat session that you had with " + Z(u.agent_name || C(L).human_agent_name || C(r) || "our agent"), 1),
                    v("div", {
                      class: $e(["star-rating", { submitted: et.value || u.isSubmitted }])
                    }, [
                      (T(), A(Ue, null, _t(5, (P) => v("button", {
                        key: P,
                        class: $e(["star-button", {
                          warning: P <= (u.isSubmitted ? u.finalRating : Me.value || u.selectedRating) && (u.isSubmitted ? u.finalRating : Me.value || u.selectedRating) <= 3,
                          success: P <= (u.isSubmitted ? u.finalRating : Me.value || u.selectedRating) && (u.isSubmitted ? u.finalRating : Me.value || u.selectedRating) > 3,
                          selected: P <= (u.isSubmitted ? u.finalRating : Me.value || u.selectedRating)
                        }]),
                        onMouseover: (Xt) => !u.isSubmitted && pu(P),
                        onMouseleave: (Xt) => !u.isSubmitted && gu,
                        onClick: (Xt) => !u.isSubmitted && mu(P),
                        disabled: et.value || u.isSubmitted
                      }, " ★ ", 42, Y_)), 64))
                    ], 2),
                    u.showFeedback && !u.isSubmitted ? (T(), A("div", X_, [
                      v("div", Z_, [
                        In(v("input", {
                          "onUpdate:modelValue": (P) => u.feedback = P,
                          placeholder: "Please share your feedback (optional)",
                          disabled: et.value,
                          maxlength: "500",
                          class: "feedback-input"
                        }, null, 8, J_), [
                          [Xn, u.feedback]
                        ]),
                        v("div", Q_, Z(((we = u.feedback) == null ? void 0 : we.length) || 0) + "/500", 1)
                      ]),
                      v("button", {
                        onClick: (P) => _u(u.session_id, Me.value, u.feedback),
                        disabled: et.value || !Me.value,
                        class: "submit-rating-button",
                        style: Ae({ backgroundColor: C(s).accent_color || "var(--accent-solid)" })
                      }, Z(et.value ? "Submitting..." : "Submit Rating"), 13, ey)
                    ])) : se("", !0),
                    u.isSubmitted && u.finalFeedback ? (T(), A("div", ty, [
                      v("div", ny, [
                        v("p", sy, Z(u.finalFeedback), 1)
                      ])
                    ])) : u.isSubmitted ? (T(), A("div", ry, " Thank you for your rating! ")) : se("", !0)
                  ])) : u.message_type === "form" ? (T(), A("div", iy, [
                    (Je = (he = u.attributes) == null ? void 0 : he.form_data) != null && Je.title || (Yt = (Ce = u.attributes) == null ? void 0 : Ce.form_data) != null && Yt.description ? (T(), A("div", oy, [
                      (Rn = (Cs = u.attributes) == null ? void 0 : Cs.form_data) != null && Rn.title ? (T(), A("h3", ay, Z(u.attributes.form_data.title), 1)) : se("", !0),
                      (da = (as = u.attributes) == null ? void 0 : as.form_data) != null && da.description ? (T(), A("p", ly, Z(u.attributes.form_data.description), 1)) : se("", !0)
                    ])) : se("", !0),
                    v("div", cy, [
                      (T(!0), A(Ue, null, _t((ga = (pa = u.attributes) == null ? void 0 : pa.form_data) == null ? void 0 : ga.fields, (P) => {
                        var Xt, Ti;
                        return T(), A("div", {
                          key: P.name,
                          class: "form-field"
                        }, [
                          v("label", {
                            for: `form-${P.name}`,
                            class: "field-label"
                          }, [
                            pn(Z(P.label) + " ", 1),
                            P.required ? (T(), A("span", fy, "*")) : se("", !0)
                          ], 8, uy),
                          P.type === "text" || P.type === "email" || P.type === "tel" ? (T(), A("input", {
                            key: 0,
                            id: `form-${P.name}`,
                            type: P.type,
                            placeholder: P.placeholder || "",
                            required: P.required,
                            minlength: P.minLength,
                            maxlength: P.maxLength,
                            value: Te.value[P.name] || "",
                            onInput: (He) => Pt(P.name, He.target.value),
                            onBlur: (He) => Pt(P.name, He.target.value),
                            class: $e(["form-input", { error: Ge.value[P.name] }]),
                            disabled: Fe.value,
                            autocomplete: P.type === "email" ? "email" : P.type === "tel" ? "tel" : "off",
                            inputmode: P.type === "tel" ? "tel" : P.type === "email" ? "email" : "text"
                          }, null, 42, hy)) : P.type === "number" ? (T(), A("input", {
                            key: 1,
                            id: `form-${P.name}`,
                            type: "number",
                            placeholder: P.placeholder || "",
                            required: P.required,
                            min: P.min,
                            max: P.max,
                            value: Te.value[P.name] || "",
                            onInput: (He) => Pt(P.name, He.target.value),
                            class: $e(["form-input", { error: Ge.value[P.name] }]),
                            disabled: Fe.value
                          }, null, 42, dy)) : P.type === "textarea" ? (T(), A("textarea", {
                            key: 2,
                            id: `form-${P.name}`,
                            placeholder: P.placeholder || "",
                            required: P.required,
                            minlength: P.minLength,
                            maxlength: P.maxLength,
                            value: Te.value[P.name] || "",
                            onInput: (He) => Pt(P.name, He.target.value),
                            class: $e(["form-textarea", { error: Ge.value[P.name] }]),
                            disabled: Fe.value,
                            rows: "3"
                          }, null, 42, py)) : P.type === "select" ? (T(), A("select", {
                            key: 3,
                            id: `form-${P.name}`,
                            required: P.required,
                            value: Te.value[P.name] || "",
                            onChange: (He) => Pt(P.name, He.target.value),
                            class: $e(["form-select", { error: Ge.value[P.name] }]),
                            disabled: Fe.value
                          }, [
                            v("option", my, Z(P.placeholder || "Select an option"), 1),
                            (T(!0), A(Ue, null, _t((Array.isArray(P.options) ? P.options : ((Xt = P.options) == null ? void 0 : Xt.split(`
`)) || []).filter((He) => He.trim()), (He) => (T(), A("option", {
                              key: He.trim(),
                              value: He.trim()
                            }, Z(He.trim()), 9, _y))), 128))
                          ], 42, gy)) : P.type === "checkbox" ? (T(), A("div", yy, [
                            v("input", {
                              id: `form-${P.name}`,
                              type: "checkbox",
                              checked: Te.value[P.name] || !1,
                              onChange: (He) => Pt(P.name, He.target.checked),
                              class: "form-checkbox",
                              disabled: Fe.value
                            }, null, 40, vy),
                            v("label", {
                              for: `form-${P.name}`,
                              class: "checkbox-label"
                            }, Z(P.placeholder || P.label), 9, by)
                          ])) : P.type === "radio" ? (T(), A("div", wy, [
                            (T(!0), A(Ue, null, _t((Array.isArray(P.options) ? P.options : ((Ti = P.options) == null ? void 0 : Ti.split(`
`)) || []).filter((He) => He.trim()), (He) => (T(), A("div", {
                              key: He.trim(),
                              class: "radio-option"
                            }, [
                              v("input", {
                                id: `form-${P.name}-${He.trim()}`,
                                name: `form-${P.name}`,
                                type: "radio",
                                value: He.trim(),
                                checked: Te.value[P.name] === He.trim(),
                                onChange: (Hv) => Pt(P.name, He.trim()),
                                class: "form-radio",
                                disabled: Fe.value
                              }, null, 40, ky),
                              v("label", {
                                for: `form-${P.name}-${He.trim()}`,
                                class: "radio-label"
                              }, Z(He.trim()), 9, xy)
                            ]))), 128))
                          ])) : se("", !0),
                          Ge.value[P.name] ? (T(), A("div", Ty, Z(Ge.value[P.name]), 1)) : se("", !0)
                        ]);
                      }), 128))
                    ]),
                    v("div", Ay, [
                      v("button", {
                        onClick: () => {
                          var P;
                          console.log("Regular form submit button clicked!"), vu((P = u.attributes) == null ? void 0 : P.form_data);
                        },
                        disabled: Fe.value,
                        class: "form-submit-button",
                        style: Ae(C(Se))
                      }, Z(Fe.value ? "Submitting..." : ((_a = (ma = u.attributes) == null ? void 0 : ma.form_data) == null ? void 0 : _a.submit_button_text) || "Submit"), 13, Ey)
                    ])
                  ])) : u.message_type === "user_input" ? (T(), A("div", Sy, [
                    (ya = u.attributes) != null && ya.prompt_message && u.attributes.prompt_message.trim() ? (T(), A("div", Cy, Z(u.attributes.prompt_message), 1)) : se("", !0),
                    u.isSubmitted ? (T(), A("div", Oy, [
                      p[35] || (p[35] = v("strong", null, "Your input:", -1)),
                      pn(" " + Z(u.submittedValue) + " ", 1),
                      (va = u.attributes) != null && va.confirmation_message && u.attributes.confirmation_message.trim() ? (T(), A("div", Ny, Z(u.attributes.confirmation_message), 1)) : se("", !0)
                    ])) : (T(), A("div", Ry, [
                      In(v("textarea", {
                        "onUpdate:modelValue": (P) => u.userInputValue = P,
                        class: "user-input-textarea",
                        placeholder: "Type your message here...",
                        rows: "3",
                        onKeydown: [
                          Rr(Jn((P) => mi(u), ["ctrl"]), ["enter"]),
                          Rr(Jn((P) => mi(u), ["meta"]), ["enter"])
                        ]
                      }, null, 40, Iy), [
                        [Xn, u.userInputValue]
                      ]),
                      v("button", {
                        class: "user-input-submit-button",
                        onClick: (P) => mi(u),
                        disabled: !u.userInputValue || !u.userInputValue.trim()
                      }, " Submit ", 8, Ly)
                    ]))
                  ])) : u.shopify_output || u.message_type === "product" ? (T(), A("div", My, [
                    u.message ? (T(), A("div", {
                      key: 0,
                      innerHTML: C(Or)(((wa = (ba = u.shopify_output) == null ? void 0 : ba.products) == null ? void 0 : wa.length) > 0 ? xu(u.message) : u.message),
                      class: "product-message-text"
                    }, null, 8, Py)) : se("", !0),
                    (ka = u.shopify_output) != null && ka.products && u.shopify_output.products.length > 0 ? (T(), A("div", Fy, [
                      p[37] || (p[37] = v("h3", { class: "carousel-title" }, "Products", -1)),
                      v("div", Dy, [
                        (T(!0), A(Ue, null, _t(u.shopify_output.products, (P) => {
                          var Xt;
                          return T(), A("div", {
                            key: P.id,
                            class: "product-card-compact carousel-item"
                          }, [
                            (Xt = P.image) != null && Xt.src ? (T(), A("div", By, [
                              v("img", {
                                src: P.image.src,
                                alt: P.title,
                                class: "product-thumbnail"
                              }, null, 8, $y)
                            ])) : se("", !0),
                            v("div", Uy, [
                              v("div", zy, [
                                v("div", Hy, Z(P.title), 1),
                                P.variant_title && P.variant_title !== "Default Title" ? (T(), A("div", Wy, Z(P.variant_title), 1)) : se("", !0),
                                v("div", qy, Z(P.price_formatted || C(a)(P.price, P.currency)), 1)
                              ]),
                              v("div", jy, [
                                v("button", {
                                  class: "view-details-button-compact",
                                  onClick: (Ti) => {
                                    var He;
                                    return ku(P, (He = u.shopify_output) == null ? void 0 : He.shop_domain);
                                  }
                                }, p[36] || (p[36] = [
                                  pn(" View product ", -1),
                                  v("span", { class: "external-link-icon" }, "↗", -1)
                                ]), 8, Vy)
                              ])
                            ])
                          ]);
                        }), 128))
                      ])
                    ])) : !u.message && ((xa = u.shopify_output) != null && xa.products) && u.shopify_output.products.length === 0 ? (T(), A("div", Ky, p[38] || (p[38] = [
                      v("p", null, "No products found.", -1)
                    ]))) : !u.message && u.shopify_output && !u.shopify_output.products ? (T(), A("div", Gy, p[39] || (p[39] = [
                      v("p", null, "No products to display.", -1)
                    ]))) : se("", !0)
                  ])) : (T(), A(Ue, { key: 4 }, [
                    C(rt)(ee) ? (T(), A("div", {
                      key: 0,
                      class: "message-streaming",
                      innerHTML: C(Or)(C(le)(ee, u.message))
                    }, null, 8, Yy)) : (T(), A("div", {
                      key: 1,
                      innerHTML: C(Or)(u.message)
                    }, null, 8, Xy)),
                    u.attachments && u.attachments.length > 0 ? (T(), A("div", Zy, [
                      (T(!0), A(Ue, null, _t(u.attachments, (P) => (T(), A("div", {
                        key: P.id,
                        class: "attachment-item"
                      }, [
                        C(Oe)(P.content_type) ? (T(), A("div", Jy, [
                          v("img", {
                            src: C(Ke)(P.file_url),
                            alt: P.filename,
                            class: "attachment-image",
                            onClick: Jn((Xt) => C(zn)({ url: P.file_url, filename: P.filename, type: P.content_type, file_url: C(Ke)(P.file_url), size: void 0 }), ["stop"]),
                            style: { cursor: "pointer" }
                          }, null, 8, Qy),
                          v("div", ev, [
                            v("a", {
                              href: C(Ke)(P.file_url),
                              target: "_blank",
                              class: "attachment-link"
                            }, [
                              p[40] || (p[40] = v("svg", {
                                width: "14",
                                height: "14",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                stroke: "currentColor",
                                "stroke-width": "2",
                                "stroke-linecap": "round",
                                "stroke-linejoin": "round"
                              }, [
                                v("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
                                v("polyline", { points: "7 10 12 15 17 10" }),
                                v("line", {
                                  x1: "12",
                                  y1: "15",
                                  x2: "12",
                                  y2: "3"
                                })
                              ], -1)),
                              pn(" " + Z(P.filename) + " ", 1),
                              v("span", nv, "(" + Z(C(be)(P.file_size)) + ")", 1)
                            ], 8, tv)
                          ])
                        ])) : (T(), A("a", {
                          key: 1,
                          href: C(Ke)(P.file_url),
                          target: "_blank",
                          class: "attachment-link"
                        }, [
                          p[41] || (p[41] = v("svg", {
                            width: "14",
                            height: "14",
                            viewBox: "0 0 24 24",
                            fill: "none",
                            stroke: "currentColor",
                            "stroke-width": "2",
                            "stroke-linecap": "round",
                            "stroke-linejoin": "round"
                          }, [
                            v("path", { d: "M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" })
                          ], -1)),
                          pn(" " + Z(P.filename) + " ", 1),
                          v("span", rv, "(" + Z(C(be)(P.file_size)) + ")", 1)
                        ], 8, sv))
                      ]))), 128))
                    ])) : se("", !0)
                  ], 64))
                ], 4),
                pr.value && (u.message_type === "bot" || u.message_type === "agent") && u.sources && u.sources.length ? (T(), A("div", iv, [
                  p[42] || (p[42] = v("span", { class: "citation-label" }, "Sources", -1)),
                  (T(!0), A(Ue, null, _t(u.sources, (P, Xt) => (T(), A("span", {
                    key: Xt,
                    class: "citation-chip",
                    title: la(P)
                  }, Z(vi(P)), 9, ov))), 128))
                ])) : se("", !0),
                v("div", av, [
                  u.message_type === "user" ? (T(), A("span", lv, " You ")) : se("", !0)
                ])
              ])
            ], 2);
          }), 128)),
          C(h) ? (T(), A("div", {
            key: 1,
            class: $e(["typing-indicator", { "reading-indicator": pr.value }])
          }, [
            pr.value ? (T(), A(Ue, { key: 0 }, [
              p[43] || (p[43] = v("div", {
                class: "reading-bars",
                "aria-hidden": "true"
              }, [
                v("span"),
                v("span"),
                v("span")
              ], -1)),
              p[44] || (p[44] = v("span", { class: "reading-label" }, "reading knowledge base", -1))
            ], 64)) : (T(), A("div", {
              key: 1,
              class: "cm-typing-bubble",
              style: Ae(C(Qe))
            }, p[45] || (p[45] = [
              v("span", { class: "cm-typing-dot" }, null, -1),
              v("span", { class: "cm-typing-dot" }, null, -1),
              v("span", { class: "cm-typing-dot" }, null, -1)
            ]), 4))
          ], 2)) : se("", !0)
        ], 512), [
          [jh, !Vn.value]
        ]),
        Fu.value ? (T(), A("div", cv, [
          (T(!0), A(Ue, null, _t(_i.value, (u) => (T(), A("button", {
            key: u,
            type: "button",
            class: "cm-quick-action",
            disabled: !mt.value,
            onClick: (ee) => ks(u)
          }, Z(u), 9, uv))), 128))
        ])) : se("", !0),
        !Ts.value && !Vn.value ? (T(), A("div", {
          key: 6,
          class: $e(["chat-input", { "ask-anything-input": Ht.value }])
        }, [
          v("input", {
            ref_key: "fileInputRef",
            ref: S,
            type: "file",
            accept: Fv,
            multiple: "",
            style: { display: "none" },
            onChange: p[7] || (p[7] = //@ts-ignore
            (...u) => C(lt) && C(lt)(...u))
          }, null, 544),
          C(U).length > 0 ? (T(), A("div", fv, [
            (T(!0), A(Ue, null, _t(C(U), (u, ee) => (T(), A("div", {
              key: ee,
              class: "file-preview-widget"
            }, [
              v("div", hv, [
                C(cr)(u.type) ? (T(), A("img", {
                  key: 0,
                  src: C(Be)(u),
                  alt: u.filename,
                  class: "file-preview-image-widget",
                  onClick: Jn((we) => C(zn)(u), ["stop"]),
                  style: { cursor: "pointer" }
                }, null, 8, dv)) : (T(), A("div", {
                  key: 1,
                  class: "file-preview-icon-widget",
                  onClick: Jn((we) => C(zn)(u), ["stop"]),
                  style: { cursor: "pointer" }
                }, p[46] || (p[46] = [
                  v("svg", {
                    width: "20",
                    height: "20",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    "stroke-width": "2"
                  }, [
                    v("path", { d: "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" }),
                    v("polyline", { points: "13 2 13 9 20 9" })
                  ], -1)
                ]), 8, pv))
              ]),
              v("div", gv, [
                v("div", mv, Z(u.filename), 1),
                v("div", _v, Z(C(be)(u.size)), 1)
              ]),
              v("button", {
                type: "button",
                class: "file-preview-remove-widget",
                onClick: (we) => C(lr)(ee),
                title: "Remove file"
              }, " × ", 8, yv)
            ]))), 128))
          ])) : se("", !0),
          Qo.value ? (T(), A("div", vv, p[47] || (p[47] = [
            v("div", { class: "upload-spinner-widget" }, null, -1),
            v("span", { class: "upload-text-widget" }, "Uploading files...", -1)
          ]))) : se("", !0),
          v("div", bv, [
            In(v("input", {
              "onUpdate:modelValue": p[8] || (p[8] = (u) => xe.value = u),
              type: "text",
              placeholder: ss.value,
              onKeypress: xs,
              onInput: Nt,
              onChange: Nt,
              onPaste: p[9] || (p[9] = //@ts-ignore
              (...u) => C(ar) && C(ar)(...u)),
              onDrop: p[10] || (p[10] = //@ts-ignore
              (...u) => C(bt) && C(bt)(...u)),
              onDragover: p[11] || (p[11] = //@ts-ignore
              (...u) => C(Ze) && C(Ze)(...u)),
              onDragleave: p[12] || (p[12] = //@ts-ignore
              (...u) => C(Gt) && C(Gt)(...u)),
              disabled: !Ut.value,
              class: $e({ disabled: !Ut.value, "ask-anything-field": Ht.value })
            }, null, 42, wv), [
              [Xn, xe.value]
            ]),
            Tu.value ? (T(), A("button", {
              key: 0,
              type: "button",
              class: "attach-button",
              disabled: Qo.value,
              onClick: p[13] || (p[13] = //@ts-ignore
              (...u) => C(ws) && C(ws)(...u)),
              title: `Attach files (${C(U).length}/${Rl} used) or paste screenshots`
            }, p[48] || (p[48] = [
              v("svg", {
                width: "22",
                height: "22",
                viewBox: "0 0 24 24",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg"
              }, [
                v("path", {
                  d: "M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48",
                  stroke: "currentColor",
                  "stroke-width": "2.2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                })
              ], -1),
              v("span", { class: "attach-button-glow" }, null, -1)
            ]), 8, kv)) : se("", !0),
            v("button", {
              class: $e(["send-button", { "ask-anything-send": Ht.value }]),
              style: Ae(C(Se)),
              onClick: zt,
              disabled: !xe.value.trim() && C(U).length === 0 || !mt.value
            }, p[49] || (p[49] = [
              v("svg", {
                width: "20",
                height: "20",
                viewBox: "0 0 24 24",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg"
              }, [
                v("path", {
                  d: "M12 19V5M5 12l7-7 7 7",
                  stroke: "currentColor",
                  "stroke-width": "2.2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                })
              ], -1)
            ]), 14, xv)
          ])
        ], 2)) : Ts.value && !Vn.value ? (T(), A("div", Tv, [
          v("div", Av, [
            p[50] || (p[50] = v("p", { class: "ended-text" }, "This chat has ended.", -1)),
            v("button", {
              class: "start-new-conversation-button",
              style: Ae(C(Se)),
              onClick: Lu
            }, " Click here to start a new conversation ", 4)
          ])
        ])) : se("", !0),
        aa.value ? (T(), A("div", {
          key: 8,
          class: "ai-disclaimer",
          style: Ae(C(Ve))
        }, Z(C(ml)), 5)) : se("", !0),
        v("div", {
          class: "powered-by",
          style: Ae(C(Ve))
        }, p[51] || (p[51] = [
          Yn('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-56b9c02d><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-56b9c02d></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-56b9c02d></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-56b9c02d></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-56b9c02d></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-56b9c02d><span class="cm-powered-prefix" data-v-56b9c02d>Powered by </span><strong class="cm-brand" data-v-56b9c02d>ChatterMate</strong></a>', 2)
        ]), 4)
      ], 6)) : se("", !0),
      y.value ? (T(), A("div", Ev, [
        v("div", Sv, [
          p[52] || (p[52] = v("h3", null, "Rate your conversation", -1)),
          v("div", Cv, [
            (T(), A(Ue, null, _t(5, (u) => v("button", {
              key: u,
              onClick: (ee) => H.value = u,
              class: $e([{ active: u <= H.value }, "star-button"])
            }, " ★ ", 10, Rv)), 64))
          ]),
          In(v("textarea", {
            "onUpdate:modelValue": p[14] || (p[14] = (u) => J.value = u),
            placeholder: "Additional feedback (optional)",
            class: "rating-feedback"
          }, null, 512), [
            [Xn, J.value]
          ]),
          v("div", Iv, [
            v("button", {
              onClick: p[15] || (p[15] = (u) => d.submitRating(H.value, J.value)),
              disabled: !H.value,
              class: "submit-button",
              style: Ae(C(Se))
            }, " Submit ", 12, Lv),
            v("button", {
              onClick: p[16] || (p[16] = (u) => y.value = !1),
              class: "skip-rating"
            }, " Skip ")
          ])
        ])
      ])) : se("", !0),
      C(X) ? (T(), A("div", {
        key: 9,
        class: "preview-modal-overlay",
        onClick: p[19] || (p[19] = //@ts-ignore
        (...u) => C(Hn) && C(Hn)(...u))
      }, [
        v("div", {
          class: "preview-modal-content",
          onClick: p[18] || (p[18] = Jn(() => {
          }, ["stop"]))
        }, [
          v("button", {
            class: "preview-modal-close",
            onClick: p[17] || (p[17] = //@ts-ignore
            (...u) => C(Hn) && C(Hn)(...u))
          }, "×"),
          C(Q) && C(cr)(C(Q).type) ? (T(), A("div", Ov, [
            v("img", {
              src: C(Be)(C(Q)),
              alt: C(Q).filename,
              class: "preview-modal-image"
            }, null, 8, Nv),
            v("div", Mv, Z(C(Q).filename), 1)
          ])) : se("", !0)
        ])
      ])) : se("", !0)
    ], 6)) : (T(), A("div", Pv));
  }
}), Bv = /* @__PURE__ */ Vo(Dv, [["__scopeId", "data-v-56b9c02d"]]);
window.process || (window.process = { env: { NODE_ENV: "production" } });
const qt = window.__INITIAL_DATA__, uu = new URL(window.location.href), fu = uu.searchParams.get("preview") === "true", hu = (e) => {
  const t = uu.searchParams.get(e);
  if (!(!t || t === "undefined" || t.trim() === ""))
    return t;
}, $v = fu ? hu("widget_id") || (qt == null ? void 0 : qt.widgetId) || void 0 : (qt == null ? void 0 : qt.widgetId) || void 0, Uv = fu ? (qt == null ? void 0 : qt.initialToken) || hu("token") || void 0 : (qt == null ? void 0 : qt.initialToken) || void 0, zv = fd(Bv, {
  widgetId: $v,
  token: Uv || void 0,
  initialAuthError: null
  // Let backend determine if auth is required
});
zv.mount("#app");
