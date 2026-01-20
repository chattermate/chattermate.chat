var uc = Object.defineProperty;
var fc = (t, e, n) => e in t ? uc(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n;
var Ge = (t, e, n) => fc(t, typeof e != "symbol" ? e + "" : e, n);
/**
* @vue/shared v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function Si(t) {
  const e = /* @__PURE__ */ Object.create(null);
  for (const n of t.split(",")) e[n] = 1;
  return (n) => n in e;
}
const Ye = {}, es = [], rn = () => {
}, hc = () => !1, yr = (t) => t.charCodeAt(0) === 111 && t.charCodeAt(1) === 110 && // uppercase letter
(t.charCodeAt(2) > 122 || t.charCodeAt(2) < 97), Ai = (t) => t.startsWith("onUpdate:"), St = Object.assign, Ei = (t, e) => {
  const n = t.indexOf(e);
  n > -1 && t.splice(n, 1);
}, dc = Object.prototype.hasOwnProperty, Be = (t, e) => dc.call(t, e), ue = Array.isArray, ts = (t) => vr(t) === "[object Map]", va = (t) => vr(t) === "[object Set]", me = (t) => typeof t == "function", gt = (t) => typeof t == "string", Nn = (t) => typeof t == "symbol", rt = (t) => t !== null && typeof t == "object", ba = (t) => (rt(t) || me(t)) && me(t.then) && me(t.catch), wa = Object.prototype.toString, vr = (t) => wa.call(t), pc = (t) => vr(t).slice(8, -1), ka = (t) => vr(t) === "[object Object]", Ci = (t) => gt(t) && t !== "NaN" && t[0] !== "-" && "" + parseInt(t, 10) === t, Ss = /* @__PURE__ */ Si(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), br = (t) => {
  const e = /* @__PURE__ */ Object.create(null);
  return (n) => e[n] || (e[n] = t(n));
}, gc = /-(\w)/g, In = br(
  (t) => t.replace(gc, (e, n) => n ? n.toUpperCase() : "")
), mc = /\B([A-Z])/g, Mn = br(
  (t) => t.replace(mc, "-$1").toLowerCase()
), xa = br((t) => t.charAt(0).toUpperCase() + t.slice(1)), Mr = br(
  (t) => t ? `on${xa(t)}` : ""
), Cn = (t, e) => !Object.is(t, e), Js = (t, ...e) => {
  for (let n = 0; n < t.length; n++)
    t[n](...e);
}, ni = (t, e, n, s = !1) => {
  Object.defineProperty(t, e, {
    configurable: !0,
    enumerable: !1,
    writable: s,
    value: n
  });
}, si = (t) => {
  const e = parseFloat(t);
  return isNaN(e) ? t : e;
};
let wo;
const wr = () => wo || (wo = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function ze(t) {
  if (ue(t)) {
    const e = {};
    for (let n = 0; n < t.length; n++) {
      const s = t[n], r = gt(s) ? bc(s) : ze(s);
      if (r)
        for (const i in r)
          e[i] = r[i];
    }
    return e;
  } else if (gt(t) || rt(t))
    return t;
}
const _c = /;(?![^(]*\))/g, yc = /:([^]+)/, vc = /\/\*[^]*?\*\//g;
function bc(t) {
  const e = {};
  return t.replace(vc, "").split(_c).forEach((n) => {
    if (n) {
      const s = n.split(yc);
      s.length > 1 && (e[s[0].trim()] = s[1].trim());
    }
  }), e;
}
function tt(t) {
  let e = "";
  if (gt(t))
    e = t;
  else if (ue(t))
    for (let n = 0; n < t.length; n++) {
      const s = tt(t[n]);
      s && (e += s + " ");
    }
  else if (rt(t))
    for (const n in t)
      t[n] && (e += n + " ");
  return e.trim();
}
const wc = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", kc = /* @__PURE__ */ Si(wc);
function Ta(t) {
  return !!t || t === "";
}
const Sa = (t) => !!(t && t.__v_isRef === !0), ce = (t) => gt(t) ? t : t == null ? "" : ue(t) || rt(t) && (t.toString === wa || !me(t.toString)) ? Sa(t) ? ce(t.value) : JSON.stringify(t, Aa, 2) : String(t), Aa = (t, e) => Sa(e) ? Aa(t, e.value) : ts(e) ? {
  [`Map(${e.size})`]: [...e.entries()].reduce(
    (n, [s, r], i) => (n[Dr(s, i) + " =>"] = r, n),
    {}
  )
} : va(e) ? {
  [`Set(${e.size})`]: [...e.values()].map((n) => Dr(n))
} : Nn(e) ? Dr(e) : rt(e) && !ue(e) && !ka(e) ? String(e) : e, Dr = (t, e = "") => {
  var n;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    Nn(t) ? `Symbol(${(n = t.description) != null ? n : e})` : t
  );
};
/**
* @vue/reactivity v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let Pt;
class xc {
  constructor(e = !1) {
    this.detached = e, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this.parent = Pt, !e && Pt && (this.index = (Pt.scopes || (Pt.scopes = [])).push(
      this
    ) - 1);
  }
  get active() {
    return this._active;
  }
  pause() {
    if (this._active) {
      this._isPaused = !0;
      let e, n;
      if (this.scopes)
        for (e = 0, n = this.scopes.length; e < n; e++)
          this.scopes[e].pause();
      for (e = 0, n = this.effects.length; e < n; e++)
        this.effects[e].pause();
    }
  }
  /**
   * Resumes the effect scope, including all child scopes and effects.
   */
  resume() {
    if (this._active && this._isPaused) {
      this._isPaused = !1;
      let e, n;
      if (this.scopes)
        for (e = 0, n = this.scopes.length; e < n; e++)
          this.scopes[e].resume();
      for (e = 0, n = this.effects.length; e < n; e++)
        this.effects[e].resume();
    }
  }
  run(e) {
    if (this._active) {
      const n = Pt;
      try {
        return Pt = this, e();
      } finally {
        Pt = n;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = Pt, Pt = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    this._on > 0 && --this._on === 0 && (Pt = this.prevScope, this.prevScope = void 0);
  }
  stop(e) {
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
      if (!this.detached && this.parent && !e) {
        const r = this.parent.scopes.pop();
        r && r !== this && (this.parent.scopes[this.index] = r, r.index = this.index);
      }
      this.parent = void 0;
    }
  }
}
function Tc() {
  return Pt;
}
let Je;
const Fr = /* @__PURE__ */ new WeakSet();
class Ea {
  constructor(e) {
    this.fn = e, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, Pt && Pt.active && Pt.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, Fr.has(this) && (Fr.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Ra(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, ko(this), La(this);
    const e = Je, n = Jt;
    Je = this, Jt = !0;
    try {
      return this.fn();
    } finally {
      Ia(this), Je = e, Jt = n, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let e = this.deps; e; e = e.nextDep)
        Ii(e);
      this.deps = this.depsTail = void 0, ko(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? Fr.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    ri(this) && this.run();
  }
  get dirty() {
    return ri(this);
  }
}
let Ca = 0, As, Es;
function Ra(t, e = !1) {
  if (t.flags |= 8, e) {
    t.next = Es, Es = t;
    return;
  }
  t.next = As, As = t;
}
function Ri() {
  Ca++;
}
function Li() {
  if (--Ca > 0)
    return;
  if (Es) {
    let e = Es;
    for (Es = void 0; e; ) {
      const n = e.next;
      e.next = void 0, e.flags &= -9, e = n;
    }
  }
  let t;
  for (; As; ) {
    let e = As;
    for (As = void 0; e; ) {
      const n = e.next;
      if (e.next = void 0, e.flags &= -9, e.flags & 1)
        try {
          e.trigger();
        } catch (s) {
          t || (t = s);
        }
      e = n;
    }
  }
  if (t) throw t;
}
function La(t) {
  for (let e = t.deps; e; e = e.nextDep)
    e.version = -1, e.prevActiveLink = e.dep.activeLink, e.dep.activeLink = e;
}
function Ia(t) {
  let e, n = t.depsTail, s = n;
  for (; s; ) {
    const r = s.prevDep;
    s.version === -1 ? (s === n && (n = r), Ii(s), Sc(s)) : e = s, s.dep.activeLink = s.prevActiveLink, s.prevActiveLink = void 0, s = r;
  }
  t.deps = e, t.depsTail = n;
}
function ri(t) {
  for (let e = t.deps; e; e = e.nextDep)
    if (e.dep.version !== e.version || e.dep.computed && (Oa(e.dep.computed) || e.dep.version !== e.version))
      return !0;
  return !!t._dirty;
}
function Oa(t) {
  if (t.flags & 4 && !(t.flags & 16) || (t.flags &= -17, t.globalVersion === Ps) || (t.globalVersion = Ps, !t.isSSR && t.flags & 128 && (!t.deps && !t._dirty || !ri(t))))
    return;
  t.flags |= 2;
  const e = t.dep, n = Je, s = Jt;
  Je = t, Jt = !0;
  try {
    La(t);
    const r = t.fn(t._value);
    (e.version === 0 || Cn(r, t._value)) && (t.flags |= 128, t._value = r, e.version++);
  } catch (r) {
    throw e.version++, r;
  } finally {
    Je = n, Jt = s, Ia(t), t.flags &= -3;
  }
}
function Ii(t, e = !1) {
  const { dep: n, prevSub: s, nextSub: r } = t;
  if (s && (s.nextSub = r, t.prevSub = void 0), r && (r.prevSub = s, t.nextSub = void 0), n.subs === t && (n.subs = s, !s && n.computed)) {
    n.computed.flags &= -5;
    for (let i = n.computed.deps; i; i = i.nextDep)
      Ii(i, !0);
  }
  !e && !--n.sc && n.map && n.map.delete(n.key);
}
function Sc(t) {
  const { prevDep: e, nextDep: n } = t;
  e && (e.nextDep = n, t.prevDep = void 0), n && (n.prevDep = e, t.nextDep = void 0);
}
let Jt = !0;
const Pa = [];
function vn() {
  Pa.push(Jt), Jt = !1;
}
function bn() {
  const t = Pa.pop();
  Jt = t === void 0 ? !0 : t;
}
function ko(t) {
  const { cleanup: e } = t;
  if (t.cleanup = void 0, e) {
    const n = Je;
    Je = void 0;
    try {
      e();
    } finally {
      Je = n;
    }
  }
}
let Ps = 0;
class Ac {
  constructor(e, n) {
    this.sub = e, this.dep = n, this.version = n.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Oi {
  // TODO isolatedDeclarations "__v_skip"
  constructor(e) {
    this.computed = e, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(e) {
    if (!Je || !Jt || Je === this.computed)
      return;
    let n = this.activeLink;
    if (n === void 0 || n.sub !== Je)
      n = this.activeLink = new Ac(Je, this), Je.deps ? (n.prevDep = Je.depsTail, Je.depsTail.nextDep = n, Je.depsTail = n) : Je.deps = Je.depsTail = n, Na(n);
    else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
      const s = n.nextDep;
      s.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = s), n.prevDep = Je.depsTail, n.nextDep = void 0, Je.depsTail.nextDep = n, Je.depsTail = n, Je.deps === n && (Je.deps = s);
    }
    return n;
  }
  trigger(e) {
    this.version++, Ps++, this.notify(e);
  }
  notify(e) {
    Ri();
    try {
      for (let n = this.subs; n; n = n.prevSub)
        n.sub.notify() && n.sub.dep.notify();
    } finally {
      Li();
    }
  }
}
function Na(t) {
  if (t.dep.sc++, t.sub.flags & 4) {
    const e = t.dep.computed;
    if (e && !t.dep.subs) {
      e.flags |= 20;
      for (let s = e.deps; s; s = s.nextDep)
        Na(s);
    }
    const n = t.dep.subs;
    n !== t && (t.prevSub = n, n && (n.nextSub = t)), t.dep.subs = t;
  }
}
const ii = /* @__PURE__ */ new WeakMap(), Wn = Symbol(
  ""
), oi = Symbol(
  ""
), Ns = Symbol(
  ""
);
function xt(t, e, n) {
  if (Jt && Je) {
    let s = ii.get(t);
    s || ii.set(t, s = /* @__PURE__ */ new Map());
    let r = s.get(n);
    r || (s.set(n, r = new Oi()), r.map = s, r.key = n), r.track();
  }
}
function gn(t, e, n, s, r, i) {
  const o = ii.get(t);
  if (!o) {
    Ps++;
    return;
  }
  const a = (l) => {
    l && l.trigger();
  };
  if (Ri(), e === "clear")
    o.forEach(a);
  else {
    const l = ue(t), f = l && Ci(n);
    if (l && n === "length") {
      const c = Number(s);
      o.forEach((b, v) => {
        (v === "length" || v === Ns || !Nn(v) && v >= c) && a(b);
      });
    } else
      switch ((n !== void 0 || o.has(void 0)) && a(o.get(n)), f && a(o.get(Ns)), e) {
        case "add":
          l ? f && a(o.get("length")) : (a(o.get(Wn)), ts(t) && a(o.get(oi)));
          break;
        case "delete":
          l || (a(o.get(Wn)), ts(t) && a(o.get(oi)));
          break;
        case "set":
          ts(t) && a(o.get(Wn));
          break;
      }
  }
  Li();
}
function Zn(t) {
  const e = $e(t);
  return e === t ? e : (xt(e, "iterate", Ns), jt(t) ? e : e.map(wt));
}
function kr(t) {
  return xt(t = $e(t), "iterate", Ns), t;
}
const Ec = {
  __proto__: null,
  [Symbol.iterator]() {
    return $r(this, Symbol.iterator, wt);
  },
  concat(...t) {
    return Zn(this).concat(
      ...t.map((e) => ue(e) ? Zn(e) : e)
    );
  },
  entries() {
    return $r(this, "entries", (t) => (t[1] = wt(t[1]), t));
  },
  every(t, e) {
    return hn(this, "every", t, e, void 0, arguments);
  },
  filter(t, e) {
    return hn(this, "filter", t, e, (n) => n.map(wt), arguments);
  },
  find(t, e) {
    return hn(this, "find", t, e, wt, arguments);
  },
  findIndex(t, e) {
    return hn(this, "findIndex", t, e, void 0, arguments);
  },
  findLast(t, e) {
    return hn(this, "findLast", t, e, wt, arguments);
  },
  findLastIndex(t, e) {
    return hn(this, "findLastIndex", t, e, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(t, e) {
    return hn(this, "forEach", t, e, void 0, arguments);
  },
  includes(...t) {
    return Br(this, "includes", t);
  },
  indexOf(...t) {
    return Br(this, "indexOf", t);
  },
  join(t) {
    return Zn(this).join(t);
  },
  // keys() iterator only reads `length`, no optimisation required
  lastIndexOf(...t) {
    return Br(this, "lastIndexOf", t);
  },
  map(t, e) {
    return hn(this, "map", t, e, void 0, arguments);
  },
  pop() {
    return fs(this, "pop");
  },
  push(...t) {
    return fs(this, "push", t);
  },
  reduce(t, ...e) {
    return xo(this, "reduce", t, e);
  },
  reduceRight(t, ...e) {
    return xo(this, "reduceRight", t, e);
  },
  shift() {
    return fs(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(t, e) {
    return hn(this, "some", t, e, void 0, arguments);
  },
  splice(...t) {
    return fs(this, "splice", t);
  },
  toReversed() {
    return Zn(this).toReversed();
  },
  toSorted(t) {
    return Zn(this).toSorted(t);
  },
  toSpliced(...t) {
    return Zn(this).toSpliced(...t);
  },
  unshift(...t) {
    return fs(this, "unshift", t);
  },
  values() {
    return $r(this, "values", wt);
  }
};
function $r(t, e, n) {
  const s = kr(t), r = s[e]();
  return s !== t && !jt(t) && (r._next = r.next, r.next = () => {
    const i = r._next();
    return i.value && (i.value = n(i.value)), i;
  }), r;
}
const Cc = Array.prototype;
function hn(t, e, n, s, r, i) {
  const o = kr(t), a = o !== t && !jt(t), l = o[e];
  if (l !== Cc[e]) {
    const b = l.apply(t, i);
    return a ? wt(b) : b;
  }
  let f = n;
  o !== t && (a ? f = function(b, v) {
    return n.call(this, wt(b), v, t);
  } : n.length > 2 && (f = function(b, v) {
    return n.call(this, b, v, t);
  }));
  const c = l.call(o, f, s);
  return a && r ? r(c) : c;
}
function xo(t, e, n, s) {
  const r = kr(t);
  let i = n;
  return r !== t && (jt(t) ? n.length > 3 && (i = function(o, a, l) {
    return n.call(this, o, a, l, t);
  }) : i = function(o, a, l) {
    return n.call(this, o, wt(a), l, t);
  }), r[e](i, ...s);
}
function Br(t, e, n) {
  const s = $e(t);
  xt(s, "iterate", Ns);
  const r = s[e](...n);
  return (r === -1 || r === !1) && Di(n[0]) ? (n[0] = $e(n[0]), s[e](...n)) : r;
}
function fs(t, e, n = []) {
  vn(), Ri();
  const s = $e(t)[e].apply(t, n);
  return Li(), bn(), s;
}
const Rc = /* @__PURE__ */ Si("__proto__,__v_isRef,__isVue"), Ma = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((t) => t !== "arguments" && t !== "caller").map((t) => Symbol[t]).filter(Nn)
);
function Lc(t) {
  Nn(t) || (t = String(t));
  const e = $e(this);
  return xt(e, "has", t), e.hasOwnProperty(t);
}
class Da {
  constructor(e = !1, n = !1) {
    this._isReadonly = e, this._isShallow = n;
  }
  get(e, n, s) {
    if (n === "__v_skip") return e.__v_skip;
    const r = this._isReadonly, i = this._isShallow;
    if (n === "__v_isReactive")
      return !r;
    if (n === "__v_isReadonly")
      return r;
    if (n === "__v_isShallow")
      return i;
    if (n === "__v_raw")
      return s === (r ? i ? Uc : Ua : i ? Ba : $a).get(e) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(e) === Object.getPrototypeOf(s) ? e : void 0;
    const o = ue(e);
    if (!r) {
      let l;
      if (o && (l = Ec[n]))
        return l;
      if (n === "hasOwnProperty")
        return Lc;
    }
    const a = Reflect.get(
      e,
      n,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      Tt(e) ? e : s
    );
    return (Nn(n) ? Ma.has(n) : Rc(n)) || (r || xt(e, "get", n), i) ? a : Tt(a) ? o && Ci(n) ? a : a.value : rt(a) ? r ? za(a) : Ni(a) : a;
  }
}
class Fa extends Da {
  constructor(e = !1) {
    super(!1, e);
  }
  set(e, n, s, r) {
    let i = e[n];
    if (!this._isShallow) {
      const l = On(i);
      if (!jt(s) && !On(s) && (i = $e(i), s = $e(s)), !ue(e) && Tt(i) && !Tt(s))
        return l ? !1 : (i.value = s, !0);
    }
    const o = ue(e) && Ci(n) ? Number(n) < e.length : Be(e, n), a = Reflect.set(
      e,
      n,
      s,
      Tt(e) ? e : r
    );
    return e === $e(r) && (o ? Cn(s, i) && gn(e, "set", n, s) : gn(e, "add", n, s)), a;
  }
  deleteProperty(e, n) {
    const s = Be(e, n);
    e[n];
    const r = Reflect.deleteProperty(e, n);
    return r && s && gn(e, "delete", n, void 0), r;
  }
  has(e, n) {
    const s = Reflect.has(e, n);
    return (!Nn(n) || !Ma.has(n)) && xt(e, "has", n), s;
  }
  ownKeys(e) {
    return xt(
      e,
      "iterate",
      ue(e) ? "length" : Wn
    ), Reflect.ownKeys(e);
  }
}
class Ic extends Da {
  constructor(e = !1) {
    super(!0, e);
  }
  set(e, n) {
    return !0;
  }
  deleteProperty(e, n) {
    return !0;
  }
}
const Oc = /* @__PURE__ */ new Fa(), Pc = /* @__PURE__ */ new Ic(), Nc = /* @__PURE__ */ new Fa(!0);
const ai = (t) => t, qs = (t) => Reflect.getPrototypeOf(t);
function Mc(t, e, n) {
  return function(...s) {
    const r = this.__v_raw, i = $e(r), o = ts(i), a = t === "entries" || t === Symbol.iterator && o, l = t === "keys" && o, f = r[t](...s), c = n ? ai : e ? cr : wt;
    return !e && xt(
      i,
      "iterate",
      l ? oi : Wn
    ), {
      // iterator protocol
      next() {
        const { value: b, done: v } = f.next();
        return v ? { value: b, done: v } : {
          value: a ? [c(b[0]), c(b[1])] : c(b),
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
function js(t) {
  return function(...e) {
    return t === "delete" ? !1 : t === "clear" ? void 0 : this;
  };
}
function Dc(t, e) {
  const n = {
    get(r) {
      const i = this.__v_raw, o = $e(i), a = $e(r);
      t || (Cn(r, a) && xt(o, "get", r), xt(o, "get", a));
      const { has: l } = qs(o), f = e ? ai : t ? cr : wt;
      if (l.call(o, r))
        return f(i.get(r));
      if (l.call(o, a))
        return f(i.get(a));
      i !== o && i.get(r);
    },
    get size() {
      const r = this.__v_raw;
      return !t && xt($e(r), "iterate", Wn), Reflect.get(r, "size", r);
    },
    has(r) {
      const i = this.__v_raw, o = $e(i), a = $e(r);
      return t || (Cn(r, a) && xt(o, "has", r), xt(o, "has", a)), r === a ? i.has(r) : i.has(r) || i.has(a);
    },
    forEach(r, i) {
      const o = this, a = o.__v_raw, l = $e(a), f = e ? ai : t ? cr : wt;
      return !t && xt(l, "iterate", Wn), a.forEach((c, b) => r.call(i, f(c), f(b), o));
    }
  };
  return St(
    n,
    t ? {
      add: js("add"),
      set: js("set"),
      delete: js("delete"),
      clear: js("clear")
    } : {
      add(r) {
        !e && !jt(r) && !On(r) && (r = $e(r));
        const i = $e(this);
        return qs(i).has.call(i, r) || (i.add(r), gn(i, "add", r, r)), this;
      },
      set(r, i) {
        !e && !jt(i) && !On(i) && (i = $e(i));
        const o = $e(this), { has: a, get: l } = qs(o);
        let f = a.call(o, r);
        f || (r = $e(r), f = a.call(o, r));
        const c = l.call(o, r);
        return o.set(r, i), f ? Cn(i, c) && gn(o, "set", r, i) : gn(o, "add", r, i), this;
      },
      delete(r) {
        const i = $e(this), { has: o, get: a } = qs(i);
        let l = o.call(i, r);
        l || (r = $e(r), l = o.call(i, r)), a && a.call(i, r);
        const f = i.delete(r);
        return l && gn(i, "delete", r, void 0), f;
      },
      clear() {
        const r = $e(this), i = r.size !== 0, o = r.clear();
        return i && gn(
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
    n[r] = Mc(r, t, e);
  }), n;
}
function Pi(t, e) {
  const n = Dc(t, e);
  return (s, r, i) => r === "__v_isReactive" ? !t : r === "__v_isReadonly" ? t : r === "__v_raw" ? s : Reflect.get(
    Be(n, r) && r in s ? n : s,
    r,
    i
  );
}
const Fc = {
  get: /* @__PURE__ */ Pi(!1, !1)
}, $c = {
  get: /* @__PURE__ */ Pi(!1, !0)
}, Bc = {
  get: /* @__PURE__ */ Pi(!0, !1)
};
const $a = /* @__PURE__ */ new WeakMap(), Ba = /* @__PURE__ */ new WeakMap(), Ua = /* @__PURE__ */ new WeakMap(), Uc = /* @__PURE__ */ new WeakMap();
function zc(t) {
  switch (t) {
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
function Hc(t) {
  return t.__v_skip || !Object.isExtensible(t) ? 0 : zc(pc(t));
}
function Ni(t) {
  return On(t) ? t : Mi(
    t,
    !1,
    Oc,
    Fc,
    $a
  );
}
function Wc(t) {
  return Mi(
    t,
    !1,
    Nc,
    $c,
    Ba
  );
}
function za(t) {
  return Mi(
    t,
    !0,
    Pc,
    Bc,
    Ua
  );
}
function Mi(t, e, n, s, r) {
  if (!rt(t) || t.__v_raw && !(e && t.__v_isReactive))
    return t;
  const i = Hc(t);
  if (i === 0)
    return t;
  const o = r.get(t);
  if (o)
    return o;
  const a = new Proxy(
    t,
    i === 2 ? s : n
  );
  return r.set(t, a), a;
}
function ns(t) {
  return On(t) ? ns(t.__v_raw) : !!(t && t.__v_isReactive);
}
function On(t) {
  return !!(t && t.__v_isReadonly);
}
function jt(t) {
  return !!(t && t.__v_isShallow);
}
function Di(t) {
  return t ? !!t.__v_raw : !1;
}
function $e(t) {
  const e = t && t.__v_raw;
  return e ? $e(e) : t;
}
function qc(t) {
  return !Be(t, "__v_skip") && Object.isExtensible(t) && ni(t, "__v_skip", !0), t;
}
const wt = (t) => rt(t) ? Ni(t) : t, cr = (t) => rt(t) ? za(t) : t;
function Tt(t) {
  return t ? t.__v_isRef === !0 : !1;
}
function de(t) {
  return jc(t, !1);
}
function jc(t, e) {
  return Tt(t) ? t : new Vc(t, e);
}
class Vc {
  constructor(e, n) {
    this.dep = new Oi(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? e : $e(e), this._value = n ? e : wt(e), this.__v_isShallow = n;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(e) {
    const n = this._rawValue, s = this.__v_isShallow || jt(e) || On(e);
    e = s ? e : $e(e), Cn(e, n) && (this._rawValue = e, this._value = s ? e : wt(e), this.dep.trigger());
  }
}
function R(t) {
  return Tt(t) ? t.value : t;
}
const Kc = {
  get: (t, e, n) => e === "__v_raw" ? t : R(Reflect.get(t, e, n)),
  set: (t, e, n, s) => {
    const r = t[e];
    return Tt(r) && !Tt(n) ? (r.value = n, !0) : Reflect.set(t, e, n, s);
  }
};
function Ha(t) {
  return ns(t) ? t : new Proxy(t, Kc);
}
class Gc {
  constructor(e, n, s) {
    this.fn = e, this.setter = n, this._value = void 0, this.dep = new Oi(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Ps - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = s;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    Je !== this)
      return Ra(this, !0), !0;
  }
  get value() {
    const e = this.dep.track();
    return Oa(this), e && (e.version = this.dep.version), this._value;
  }
  set value(e) {
    this.setter && this.setter(e);
  }
}
function Yc(t, e, n = !1) {
  let s, r;
  return me(t) ? s = t : (s = t.get, r = t.set), new Gc(s, r, n);
}
const Vs = {}, ur = /* @__PURE__ */ new WeakMap();
let zn;
function Zc(t, e = !1, n = zn) {
  if (n) {
    let s = ur.get(n);
    s || ur.set(n, s = []), s.push(t);
  }
}
function Xc(t, e, n = Ye) {
  const { immediate: s, deep: r, once: i, scheduler: o, augmentJob: a, call: l } = n, f = (U) => r ? U : jt(U) || r === !1 || r === 0 ? mn(U, 1) : mn(U);
  let c, b, v, D, $ = !1, Y = !1;
  if (Tt(t) ? (b = () => t.value, $ = jt(t)) : ns(t) ? (b = () => f(t), $ = !0) : ue(t) ? (Y = !0, $ = t.some((U) => ns(U) || jt(U)), b = () => t.map((U) => {
    if (Tt(U))
      return U.value;
    if (ns(U))
      return f(U);
    if (me(U))
      return l ? l(U, 2) : U();
  })) : me(t) ? e ? b = l ? () => l(t, 2) : t : b = () => {
    if (v) {
      vn();
      try {
        v();
      } finally {
        bn();
      }
    }
    const U = zn;
    zn = c;
    try {
      return l ? l(t, 3, [D]) : t(D);
    } finally {
      zn = U;
    }
  } : b = rn, e && r) {
    const U = b, H = r === !0 ? 1 / 0 : r;
    b = () => mn(U(), H);
  }
  const Ae = Tc(), ne = () => {
    c.stop(), Ae && Ae.active && Ei(Ae.effects, c);
  };
  if (i && e) {
    const U = e;
    e = (...H) => {
      U(...H), ne();
    };
  }
  let Se = Y ? new Array(t.length).fill(Vs) : Vs;
  const we = (U) => {
    if (!(!(c.flags & 1) || !c.dirty && !U))
      if (e) {
        const H = c.run();
        if (r || $ || (Y ? H.some((Q, j) => Cn(Q, Se[j])) : Cn(H, Se))) {
          v && v();
          const Q = zn;
          zn = c;
          try {
            const j = [
              H,
              // pass undefined as the old value when it's changed for the first time
              Se === Vs ? void 0 : Y && Se[0] === Vs ? [] : Se,
              D
            ];
            Se = H, l ? l(e, 3, j) : (
              // @ts-expect-error
              e(...j)
            );
          } finally {
            zn = Q;
          }
        }
      } else
        c.run();
  };
  return a && a(we), c = new Ea(b), c.scheduler = o ? () => o(we, !1) : we, D = (U) => Zc(U, !1, c), v = c.onStop = () => {
    const U = ur.get(c);
    if (U) {
      if (l)
        l(U, 4);
      else
        for (const H of U) H();
      ur.delete(c);
    }
  }, e ? s ? we(!0) : Se = c.run() : o ? o(we.bind(null, !0), !0) : c.run(), ne.pause = c.pause.bind(c), ne.resume = c.resume.bind(c), ne.stop = ne, ne;
}
function mn(t, e = 1 / 0, n) {
  if (e <= 0 || !rt(t) || t.__v_skip || (n = n || /* @__PURE__ */ new Set(), n.has(t)))
    return t;
  if (n.add(t), e--, Tt(t))
    mn(t.value, e, n);
  else if (ue(t))
    for (let s = 0; s < t.length; s++)
      mn(t[s], e, n);
  else if (va(t) || ts(t))
    t.forEach((s) => {
      mn(s, e, n);
    });
  else if (ka(t)) {
    for (const s in t)
      mn(t[s], e, n);
    for (const s of Object.getOwnPropertySymbols(t))
      Object.prototype.propertyIsEnumerable.call(t, s) && mn(t[s], e, n);
  }
  return t;
}
/**
* @vue/runtime-core v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function $s(t, e, n, s) {
  try {
    return s ? t(...s) : t();
  } catch (r) {
    xr(r, e, n);
  }
}
function ln(t, e, n, s) {
  if (me(t)) {
    const r = $s(t, e, n, s);
    return r && ba(r) && r.catch((i) => {
      xr(i, e, n);
    }), r;
  }
  if (ue(t)) {
    const r = [];
    for (let i = 0; i < t.length; i++)
      r.push(ln(t[i], e, n, s));
    return r;
  }
}
function xr(t, e, n, s = !0) {
  const r = e ? e.vnode : null, { errorHandler: i, throwUnhandledErrorInProduction: o } = e && e.appContext.config || Ye;
  if (e) {
    let a = e.parent;
    const l = e.proxy, f = `https://vuejs.org/error-reference/#runtime-${n}`;
    for (; a; ) {
      const c = a.ec;
      if (c) {
        for (let b = 0; b < c.length; b++)
          if (c[b](t, l, f) === !1)
            return;
      }
      a = a.parent;
    }
    if (i) {
      vn(), $s(i, null, 10, [
        t,
        l,
        f
      ]), bn();
      return;
    }
  }
  Jc(t, n, r, s, o);
}
function Jc(t, e, n, s = !0, r = !1) {
  if (r)
    throw t;
  console.error(t);
}
const Ct = [];
let nn = -1;
const ss = [];
let An = null, Jn = 0;
const Wa = /* @__PURE__ */ Promise.resolve();
let fr = null;
function qa(t) {
  const e = fr || Wa;
  return t ? e.then(this ? t.bind(this) : t) : e;
}
function Qc(t) {
  let e = nn + 1, n = Ct.length;
  for (; e < n; ) {
    const s = e + n >>> 1, r = Ct[s], i = Ms(r);
    i < t || i === t && r.flags & 2 ? e = s + 1 : n = s;
  }
  return e;
}
function Fi(t) {
  if (!(t.flags & 1)) {
    const e = Ms(t), n = Ct[Ct.length - 1];
    !n || // fast path when the job id is larger than the tail
    !(t.flags & 2) && e >= Ms(n) ? Ct.push(t) : Ct.splice(Qc(e), 0, t), t.flags |= 1, ja();
  }
}
function ja() {
  fr || (fr = Wa.then(Ka));
}
function eu(t) {
  ue(t) ? ss.push(...t) : An && t.id === -1 ? An.splice(Jn + 1, 0, t) : t.flags & 1 || (ss.push(t), t.flags |= 1), ja();
}
function To(t, e, n = nn + 1) {
  for (; n < Ct.length; n++) {
    const s = Ct[n];
    if (s && s.flags & 2) {
      if (t && s.id !== t.uid)
        continue;
      Ct.splice(n, 1), n--, s.flags & 4 && (s.flags &= -2), s(), s.flags & 4 || (s.flags &= -2);
    }
  }
}
function Va(t) {
  if (ss.length) {
    const e = [...new Set(ss)].sort(
      (n, s) => Ms(n) - Ms(s)
    );
    if (ss.length = 0, An) {
      An.push(...e);
      return;
    }
    for (An = e, Jn = 0; Jn < An.length; Jn++) {
      const n = An[Jn];
      n.flags & 4 && (n.flags &= -2), n.flags & 8 || n(), n.flags &= -2;
    }
    An = null, Jn = 0;
  }
}
const Ms = (t) => t.id == null ? t.flags & 2 ? -1 : 1 / 0 : t.id;
function Ka(t) {
  try {
    for (nn = 0; nn < Ct.length; nn++) {
      const e = Ct[nn];
      e && !(e.flags & 8) && (e.flags & 4 && (e.flags &= -2), $s(
        e,
        e.i,
        e.i ? 15 : 14
      ), e.flags & 4 || (e.flags &= -2));
    }
  } finally {
    for (; nn < Ct.length; nn++) {
      const e = Ct[nn];
      e && (e.flags &= -2);
    }
    nn = -1, Ct.length = 0, Va(), fr = null, (Ct.length || ss.length) && Ka();
  }
}
let qt = null, Ga = null;
function hr(t) {
  const e = qt;
  return qt = t, Ga = t && t.type.__scopeId || null, e;
}
function tu(t, e = qt, n) {
  if (!e || t._n)
    return t;
  const s = (...r) => {
    s._d && Po(-1);
    const i = hr(e);
    let o;
    try {
      o = t(...r);
    } finally {
      hr(i), s._d && Po(1);
    }
    return o;
  };
  return s._n = !0, s._c = !0, s._d = !0, s;
}
function Fn(t, e) {
  if (qt === null)
    return t;
  const n = Er(qt), s = t.dirs || (t.dirs = []);
  for (let r = 0; r < e.length; r++) {
    let [i, o, a, l = Ye] = e[r];
    i && (me(i) && (i = {
      mounted: i,
      updated: i
    }), i.deep && mn(o), s.push({
      dir: i,
      instance: n,
      value: o,
      oldValue: void 0,
      arg: a,
      modifiers: l
    }));
  }
  return t;
}
function $n(t, e, n, s) {
  const r = t.dirs, i = e && e.dirs;
  for (let o = 0; o < r.length; o++) {
    const a = r[o];
    i && (a.oldValue = i[o].value);
    let l = a.dir[s];
    l && (vn(), ln(l, n, 8, [
      t.el,
      a,
      t,
      e
    ]), bn());
  }
}
const nu = Symbol("_vte"), su = (t) => t.__isTeleport;
function $i(t, e) {
  t.shapeFlag & 6 && t.component ? (t.transition = e, $i(t.component.subTree, e)) : t.shapeFlag & 128 ? (t.ssContent.transition = e.clone(t.ssContent), t.ssFallback.transition = e.clone(t.ssFallback)) : t.transition = e;
}
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function ru(t, e) {
  return me(t) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    St({ name: t.name }, e, { setup: t })
  ) : t;
}
function Ya(t) {
  t.ids = [t.ids[0] + t.ids[2]++ + "-", 0, 0];
}
function Cs(t, e, n, s, r = !1) {
  if (ue(t)) {
    t.forEach(
      ($, Y) => Cs(
        $,
        e && (ue(e) ? e[Y] : e),
        n,
        s,
        r
      )
    );
    return;
  }
  if (Rs(s) && !r) {
    s.shapeFlag & 512 && s.type.__asyncResolved && s.component.subTree.component && Cs(t, e, n, s.component.subTree);
    return;
  }
  const i = s.shapeFlag & 4 ? Er(s.component) : s.el, o = r ? null : i, { i: a, r: l } = t, f = e && e.r, c = a.refs === Ye ? a.refs = {} : a.refs, b = a.setupState, v = $e(b), D = b === Ye ? () => !1 : ($) => Be(v, $);
  if (f != null && f !== l && (gt(f) ? (c[f] = null, D(f) && (b[f] = null)) : Tt(f) && (f.value = null)), me(l))
    $s(l, a, 12, [o, c]);
  else {
    const $ = gt(l), Y = Tt(l);
    if ($ || Y) {
      const Ae = () => {
        if (t.f) {
          const ne = $ ? D(l) ? b[l] : c[l] : l.value;
          r ? ue(ne) && Ei(ne, i) : ue(ne) ? ne.includes(i) || ne.push(i) : $ ? (c[l] = [i], D(l) && (b[l] = c[l])) : (l.value = [i], t.k && (c[t.k] = l.value));
        } else $ ? (c[l] = o, D(l) && (b[l] = o)) : Y && (l.value = o, t.k && (c[t.k] = o));
      };
      o ? (Ae.id = -1, Ft(Ae, n)) : Ae();
    }
  }
}
wr().requestIdleCallback;
wr().cancelIdleCallback;
const Rs = (t) => !!t.type.__asyncLoader, Za = (t) => t.type.__isKeepAlive;
function iu(t, e) {
  Xa(t, "a", e);
}
function ou(t, e) {
  Xa(t, "da", e);
}
function Xa(t, e, n = Rt) {
  const s = t.__wdc || (t.__wdc = () => {
    let r = n;
    for (; r; ) {
      if (r.isDeactivated)
        return;
      r = r.parent;
    }
    return t();
  });
  if (Tr(e, s, n), n) {
    let r = n.parent;
    for (; r && r.parent; )
      Za(r.parent.vnode) && au(s, e, n, r), r = r.parent;
  }
}
function au(t, e, n, s) {
  const r = Tr(
    e,
    t,
    s,
    !0
    /* prepend */
  );
  Bi(() => {
    Ei(s[e], r);
  }, n);
}
function Tr(t, e, n = Rt, s = !1) {
  if (n) {
    const r = n[t] || (n[t] = []), i = e.__weh || (e.__weh = (...o) => {
      vn();
      const a = Bs(n), l = ln(e, n, t, o);
      return a(), bn(), l;
    });
    return s ? r.unshift(i) : r.push(i), i;
  }
}
const wn = (t) => (e, n = Rt) => {
  (!Fs || t === "sp") && Tr(t, (...s) => e(...s), n);
}, lu = wn("bm"), Ja = wn("m"), cu = wn(
  "bu"
), uu = wn("u"), fu = wn(
  "bum"
), Bi = wn("um"), hu = wn(
  "sp"
), du = wn("rtg"), pu = wn("rtc");
function gu(t, e = Rt) {
  Tr("ec", t, e);
}
const mu = Symbol.for("v-ndc");
function zt(t, e, n, s) {
  let r;
  const i = n, o = ue(t);
  if (o || gt(t)) {
    const a = o && ns(t);
    let l = !1, f = !1;
    a && (l = !jt(t), f = On(t), t = kr(t)), r = new Array(t.length);
    for (let c = 0, b = t.length; c < b; c++)
      r[c] = e(
        l ? f ? cr(wt(t[c])) : wt(t[c]) : t[c],
        c,
        void 0,
        i
      );
  } else if (typeof t == "number") {
    r = new Array(t);
    for (let a = 0; a < t; a++)
      r[a] = e(a + 1, a, void 0, i);
  } else if (rt(t))
    if (t[Symbol.iterator])
      r = Array.from(
        t,
        (a, l) => e(a, l, void 0, i)
      );
    else {
      const a = Object.keys(t);
      r = new Array(a.length);
      for (let l = 0, f = a.length; l < f; l++) {
        const c = a[l];
        r[l] = e(t[c], c, l, i);
      }
    }
  else
    r = [];
  return r;
}
const li = (t) => t ? vl(t) ? Er(t) : li(t.parent) : null, Ls = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ St(/* @__PURE__ */ Object.create(null), {
    $: (t) => t,
    $el: (t) => t.vnode.el,
    $data: (t) => t.data,
    $props: (t) => t.props,
    $attrs: (t) => t.attrs,
    $slots: (t) => t.slots,
    $refs: (t) => t.refs,
    $parent: (t) => li(t.parent),
    $root: (t) => li(t.root),
    $host: (t) => t.ce,
    $emit: (t) => t.emit,
    $options: (t) => el(t),
    $forceUpdate: (t) => t.f || (t.f = () => {
      Fi(t.update);
    }),
    $nextTick: (t) => t.n || (t.n = qa.bind(t.proxy)),
    $watch: (t) => $u.bind(t)
  })
), Ur = (t, e) => t !== Ye && !t.__isScriptSetup && Be(t, e), _u = {
  get({ _: t }, e) {
    if (e === "__v_skip")
      return !0;
    const { ctx: n, setupState: s, data: r, props: i, accessCache: o, type: a, appContext: l } = t;
    let f;
    if (e[0] !== "$") {
      const D = o[e];
      if (D !== void 0)
        switch (D) {
          case 1:
            return s[e];
          case 2:
            return r[e];
          case 4:
            return n[e];
          case 3:
            return i[e];
        }
      else {
        if (Ur(s, e))
          return o[e] = 1, s[e];
        if (r !== Ye && Be(r, e))
          return o[e] = 2, r[e];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (f = t.propsOptions[0]) && Be(f, e)
        )
          return o[e] = 3, i[e];
        if (n !== Ye && Be(n, e))
          return o[e] = 4, n[e];
        ci && (o[e] = 0);
      }
    }
    const c = Ls[e];
    let b, v;
    if (c)
      return e === "$attrs" && xt(t.attrs, "get", ""), c(t);
    if (
      // css module (injected by vue-loader)
      (b = a.__cssModules) && (b = b[e])
    )
      return b;
    if (n !== Ye && Be(n, e))
      return o[e] = 4, n[e];
    if (
      // global properties
      v = l.config.globalProperties, Be(v, e)
    )
      return v[e];
  },
  set({ _: t }, e, n) {
    const { data: s, setupState: r, ctx: i } = t;
    return Ur(r, e) ? (r[e] = n, !0) : s !== Ye && Be(s, e) ? (s[e] = n, !0) : Be(t.props, e) || e[0] === "$" && e.slice(1) in t ? !1 : (i[e] = n, !0);
  },
  has({
    _: { data: t, setupState: e, accessCache: n, ctx: s, appContext: r, propsOptions: i }
  }, o) {
    let a;
    return !!n[o] || t !== Ye && Be(t, o) || Ur(e, o) || (a = i[0]) && Be(a, o) || Be(s, o) || Be(Ls, o) || Be(r.config.globalProperties, o);
  },
  defineProperty(t, e, n) {
    return n.get != null ? t._.accessCache[e] = 0 : Be(n, "value") && this.set(t, e, n.value, null), Reflect.defineProperty(t, e, n);
  }
};
function So(t) {
  return ue(t) ? t.reduce(
    (e, n) => (e[n] = null, e),
    {}
  ) : t;
}
let ci = !0;
function yu(t) {
  const e = el(t), n = t.proxy, s = t.ctx;
  ci = !1, e.beforeCreate && Ao(e.beforeCreate, t, "bc");
  const {
    // state
    data: r,
    computed: i,
    methods: o,
    watch: a,
    provide: l,
    inject: f,
    // lifecycle
    created: c,
    beforeMount: b,
    mounted: v,
    beforeUpdate: D,
    updated: $,
    activated: Y,
    deactivated: Ae,
    beforeDestroy: ne,
    beforeUnmount: Se,
    destroyed: we,
    unmounted: U,
    render: H,
    renderTracked: Q,
    renderTriggered: j,
    errorCaptured: Le,
    serverPrefetch: nt,
    // public API
    expose: We,
    inheritAttrs: ke,
    // assets
    components: fe,
    directives: qe,
    filters: Ze
  } = e;
  if (f && vu(f, s, null), o)
    for (const he in o) {
      const oe = o[he];
      me(oe) && (s[he] = oe.bind(n));
    }
  if (r) {
    const he = r.call(n, n);
    rt(he) && (t.data = Ni(he));
  }
  if (ci = !0, i)
    for (const he in i) {
      const oe = i[he], Oe = me(oe) ? oe.bind(n, n) : me(oe.get) ? oe.get.bind(n, n) : rn, et = !me(oe) && me(oe.set) ? oe.set.bind(n) : rn, re = ft({
        get: Oe,
        set: et
      });
      Object.defineProperty(s, he, {
        enumerable: !0,
        configurable: !0,
        get: () => re.value,
        set: (Ie) => re.value = Ie
      });
    }
  if (a)
    for (const he in a)
      Qa(a[he], s, n, he);
  if (l) {
    const he = me(l) ? l.call(n) : l;
    Reflect.ownKeys(he).forEach((oe) => {
      Su(oe, he[oe]);
    });
  }
  c && Ao(c, t, "c");
  function ie(he, oe) {
    ue(oe) ? oe.forEach((Oe) => he(Oe.bind(n))) : oe && he(oe.bind(n));
  }
  if (ie(lu, b), ie(Ja, v), ie(cu, D), ie(uu, $), ie(iu, Y), ie(ou, Ae), ie(gu, Le), ie(pu, Q), ie(du, j), ie(fu, Se), ie(Bi, U), ie(hu, nt), ue(We))
    if (We.length) {
      const he = t.exposed || (t.exposed = {});
      We.forEach((oe) => {
        Object.defineProperty(he, oe, {
          get: () => n[oe],
          set: (Oe) => n[oe] = Oe,
          enumerable: !0
        });
      });
    } else t.exposed || (t.exposed = {});
  H && t.render === rn && (t.render = H), ke != null && (t.inheritAttrs = ke), fe && (t.components = fe), qe && (t.directives = qe), nt && Ya(t);
}
function vu(t, e, n = rn) {
  ue(t) && (t = ui(t));
  for (const s in t) {
    const r = t[s];
    let i;
    rt(r) ? "default" in r ? i = Qs(
      r.from || s,
      r.default,
      !0
    ) : i = Qs(r.from || s) : i = Qs(r), Tt(i) ? Object.defineProperty(e, s, {
      enumerable: !0,
      configurable: !0,
      get: () => i.value,
      set: (o) => i.value = o
    }) : e[s] = i;
  }
}
function Ao(t, e, n) {
  ln(
    ue(t) ? t.map((s) => s.bind(e.proxy)) : t.bind(e.proxy),
    e,
    n
  );
}
function Qa(t, e, n, s) {
  let r = s.includes(".") ? dl(n, s) : () => n[s];
  if (gt(t)) {
    const i = e[t];
    me(i) && Hn(r, i);
  } else if (me(t))
    Hn(r, t.bind(n));
  else if (rt(t))
    if (ue(t))
      t.forEach((i) => Qa(i, e, n, s));
    else {
      const i = me(t.handler) ? t.handler.bind(n) : e[t.handler];
      me(i) && Hn(r, i, t);
    }
}
function el(t) {
  const e = t.type, { mixins: n, extends: s } = e, {
    mixins: r,
    optionsCache: i,
    config: { optionMergeStrategies: o }
  } = t.appContext, a = i.get(e);
  let l;
  return a ? l = a : !r.length && !n && !s ? l = e : (l = {}, r.length && r.forEach(
    (f) => dr(l, f, o, !0)
  ), dr(l, e, o)), rt(e) && i.set(e, l), l;
}
function dr(t, e, n, s = !1) {
  const { mixins: r, extends: i } = e;
  i && dr(t, i, n, !0), r && r.forEach(
    (o) => dr(t, o, n, !0)
  );
  for (const o in e)
    if (!(s && o === "expose")) {
      const a = bu[o] || n && n[o];
      t[o] = a ? a(t[o], e[o]) : e[o];
    }
  return t;
}
const bu = {
  data: Eo,
  props: Co,
  emits: Co,
  // objects
  methods: xs,
  computed: xs,
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
  components: xs,
  directives: xs,
  // watch
  watch: ku,
  // provide / inject
  provide: Eo,
  inject: wu
};
function Eo(t, e) {
  return e ? t ? function() {
    return St(
      me(t) ? t.call(this, this) : t,
      me(e) ? e.call(this, this) : e
    );
  } : e : t;
}
function wu(t, e) {
  return xs(ui(t), ui(e));
}
function ui(t) {
  if (ue(t)) {
    const e = {};
    for (let n = 0; n < t.length; n++)
      e[t[n]] = t[n];
    return e;
  }
  return t;
}
function Et(t, e) {
  return t ? [...new Set([].concat(t, e))] : e;
}
function xs(t, e) {
  return t ? St(/* @__PURE__ */ Object.create(null), t, e) : e;
}
function Co(t, e) {
  return t ? ue(t) && ue(e) ? [.../* @__PURE__ */ new Set([...t, ...e])] : St(
    /* @__PURE__ */ Object.create(null),
    So(t),
    So(e ?? {})
  ) : e;
}
function ku(t, e) {
  if (!t) return e;
  if (!e) return t;
  const n = St(/* @__PURE__ */ Object.create(null), t);
  for (const s in e)
    n[s] = Et(t[s], e[s]);
  return n;
}
function tl() {
  return {
    app: null,
    config: {
      isNativeTag: hc,
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
let xu = 0;
function Tu(t, e) {
  return function(s, r = null) {
    me(s) || (s = St({}, s)), r != null && !rt(r) && (r = null);
    const i = tl(), o = /* @__PURE__ */ new WeakSet(), a = [];
    let l = !1;
    const f = i.app = {
      _uid: xu++,
      _component: s,
      _props: r,
      _container: null,
      _context: i,
      _instance: null,
      version: af,
      get config() {
        return i.config;
      },
      set config(c) {
      },
      use(c, ...b) {
        return o.has(c) || (c && me(c.install) ? (o.add(c), c.install(f, ...b)) : me(c) && (o.add(c), c(f, ...b))), f;
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
        if (!l) {
          const D = f._ceVNode || on(s, r);
          return D.appContext = i, v === !0 ? v = "svg" : v === !1 && (v = void 0), t(D, c, v), l = !0, f._container = c, c.__vue_app__ = f, Er(D.component);
        }
      },
      onUnmount(c) {
        a.push(c);
      },
      unmount() {
        l && (ln(
          a,
          f._instance,
          16
        ), t(null, f._container), delete f._container.__vue_app__);
      },
      provide(c, b) {
        return i.provides[c] = b, f;
      },
      runWithContext(c) {
        const b = rs;
        rs = f;
        try {
          return c();
        } finally {
          rs = b;
        }
      }
    };
    return f;
  };
}
let rs = null;
function Su(t, e) {
  if (Rt) {
    let n = Rt.provides;
    const s = Rt.parent && Rt.parent.provides;
    s === n && (n = Rt.provides = Object.create(s)), n[t] = e;
  }
}
function Qs(t, e, n = !1) {
  const s = ef();
  if (s || rs) {
    let r = rs ? rs._context.provides : s ? s.parent == null || s.ce ? s.vnode.appContext && s.vnode.appContext.provides : s.parent.provides : void 0;
    if (r && t in r)
      return r[t];
    if (arguments.length > 1)
      return n && me(e) ? e.call(s && s.proxy) : e;
  }
}
const nl = {}, sl = () => Object.create(nl), rl = (t) => Object.getPrototypeOf(t) === nl;
function Au(t, e, n, s = !1) {
  const r = {}, i = sl();
  t.propsDefaults = /* @__PURE__ */ Object.create(null), il(t, e, r, i);
  for (const o in t.propsOptions[0])
    o in r || (r[o] = void 0);
  n ? t.props = s ? r : Wc(r) : t.type.props ? t.props = r : t.props = i, t.attrs = i;
}
function Eu(t, e, n, s) {
  const {
    props: r,
    attrs: i,
    vnode: { patchFlag: o }
  } = t, a = $e(r), [l] = t.propsOptions;
  let f = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (s || o > 0) && !(o & 16)
  ) {
    if (o & 8) {
      const c = t.vnode.dynamicProps;
      for (let b = 0; b < c.length; b++) {
        let v = c[b];
        if (Sr(t.emitsOptions, v))
          continue;
        const D = e[v];
        if (l)
          if (Be(i, v))
            D !== i[v] && (i[v] = D, f = !0);
          else {
            const $ = In(v);
            r[$] = fi(
              l,
              a,
              $,
              D,
              t,
              !1
            );
          }
        else
          D !== i[v] && (i[v] = D, f = !0);
      }
    }
  } else {
    il(t, e, r, i) && (f = !0);
    let c;
    for (const b in a)
      (!e || // for camelCase
      !Be(e, b) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((c = Mn(b)) === b || !Be(e, c))) && (l ? n && // for camelCase
      (n[b] !== void 0 || // for kebab-case
      n[c] !== void 0) && (r[b] = fi(
        l,
        a,
        b,
        void 0,
        t,
        !0
      )) : delete r[b]);
    if (i !== a)
      for (const b in i)
        (!e || !Be(e, b)) && (delete i[b], f = !0);
  }
  f && gn(t.attrs, "set", "");
}
function il(t, e, n, s) {
  const [r, i] = t.propsOptions;
  let o = !1, a;
  if (e)
    for (let l in e) {
      if (Ss(l))
        continue;
      const f = e[l];
      let c;
      r && Be(r, c = In(l)) ? !i || !i.includes(c) ? n[c] = f : (a || (a = {}))[c] = f : Sr(t.emitsOptions, l) || (!(l in s) || f !== s[l]) && (s[l] = f, o = !0);
    }
  if (i) {
    const l = $e(n), f = a || Ye;
    for (let c = 0; c < i.length; c++) {
      const b = i[c];
      n[b] = fi(
        r,
        l,
        b,
        f[b],
        t,
        !Be(f, b)
      );
    }
  }
  return o;
}
function fi(t, e, n, s, r, i) {
  const o = t[n];
  if (o != null) {
    const a = Be(o, "default");
    if (a && s === void 0) {
      const l = o.default;
      if (o.type !== Function && !o.skipFactory && me(l)) {
        const { propsDefaults: f } = r;
        if (n in f)
          s = f[n];
        else {
          const c = Bs(r);
          s = f[n] = l.call(
            null,
            e
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
    ] && (s === "" || s === Mn(n)) && (s = !0));
  }
  return s;
}
const Cu = /* @__PURE__ */ new WeakMap();
function ol(t, e, n = !1) {
  const s = n ? Cu : e.propsCache, r = s.get(t);
  if (r)
    return r;
  const i = t.props, o = {}, a = [];
  let l = !1;
  if (!me(t)) {
    const c = (b) => {
      l = !0;
      const [v, D] = ol(b, e, !0);
      St(o, v), D && a.push(...D);
    };
    !n && e.mixins.length && e.mixins.forEach(c), t.extends && c(t.extends), t.mixins && t.mixins.forEach(c);
  }
  if (!i && !l)
    return rt(t) && s.set(t, es), es;
  if (ue(i))
    for (let c = 0; c < i.length; c++) {
      const b = In(i[c]);
      Ro(b) && (o[b] = Ye);
    }
  else if (i)
    for (const c in i) {
      const b = In(c);
      if (Ro(b)) {
        const v = i[c], D = o[b] = ue(v) || me(v) ? { type: v } : St({}, v), $ = D.type;
        let Y = !1, Ae = !0;
        if (ue($))
          for (let ne = 0; ne < $.length; ++ne) {
            const Se = $[ne], we = me(Se) && Se.name;
            if (we === "Boolean") {
              Y = !0;
              break;
            } else we === "String" && (Ae = !1);
          }
        else
          Y = me($) && $.name === "Boolean";
        D[
          0
          /* shouldCast */
        ] = Y, D[
          1
          /* shouldCastTrue */
        ] = Ae, (Y || Be(D, "default")) && a.push(b);
      }
    }
  const f = [o, a];
  return rt(t) && s.set(t, f), f;
}
function Ro(t) {
  return t[0] !== "$" && !Ss(t);
}
const Ui = (t) => t === "_" || t === "__" || t === "_ctx" || t === "$stable", zi = (t) => ue(t) ? t.map(sn) : [sn(t)], Ru = (t, e, n) => {
  if (e._n)
    return e;
  const s = tu((...r) => zi(e(...r)), n);
  return s._c = !1, s;
}, al = (t, e, n) => {
  const s = t._ctx;
  for (const r in t) {
    if (Ui(r)) continue;
    const i = t[r];
    if (me(i))
      e[r] = Ru(r, i, s);
    else if (i != null) {
      const o = zi(i);
      e[r] = () => o;
    }
  }
}, ll = (t, e) => {
  const n = zi(e);
  t.slots.default = () => n;
}, cl = (t, e, n) => {
  for (const s in e)
    (n || !Ui(s)) && (t[s] = e[s]);
}, Lu = (t, e, n) => {
  const s = t.slots = sl();
  if (t.vnode.shapeFlag & 32) {
    const r = e.__;
    r && ni(s, "__", r, !0);
    const i = e._;
    i ? (cl(s, e, n), n && ni(s, "_", i, !0)) : al(e, s);
  } else e && ll(t, e);
}, Iu = (t, e, n) => {
  const { vnode: s, slots: r } = t;
  let i = !0, o = Ye;
  if (s.shapeFlag & 32) {
    const a = e._;
    a ? n && a === 1 ? i = !1 : cl(r, e, n) : (i = !e.$stable, al(e, r)), o = e;
  } else e && (ll(t, e), o = { default: 1 });
  if (i)
    for (const a in r)
      !Ui(a) && o[a] == null && delete r[a];
}, Ft = ju;
function Ou(t) {
  return Pu(t);
}
function Pu(t, e) {
  const n = wr();
  n.__VUE__ = !0;
  const {
    insert: s,
    remove: r,
    patchProp: i,
    createElement: o,
    createText: a,
    createComment: l,
    setText: f,
    setElementText: c,
    parentNode: b,
    nextSibling: v,
    setScopeId: D = rn,
    insertStaticContent: $
  } = t, Y = (d, g, k, A = null, E = null, S = null, B = void 0, M = null, F = !!g.dynamicChildren) => {
    if (d === g)
      return;
    d && !hs(d, g) && (A = V(d), Ie(d, E, S, !0), d = null), g.patchFlag === -2 && (F = !1, g.dynamicChildren = null);
    const { type: L, ref: Z, shapeFlag: z } = g;
    switch (L) {
      case Ar:
        Ae(d, g, k, A);
        break;
      case Pn:
        ne(d, g, k, A);
        break;
      case er:
        d == null && Se(g, k, A, B);
        break;
      case st:
        fe(
          d,
          g,
          k,
          A,
          E,
          S,
          B,
          M,
          F
        );
        break;
      default:
        z & 1 ? H(
          d,
          g,
          k,
          A,
          E,
          S,
          B,
          M,
          F
        ) : z & 6 ? qe(
          d,
          g,
          k,
          A,
          E,
          S,
          B,
          M,
          F
        ) : (z & 64 || z & 128) && L.process(
          d,
          g,
          k,
          A,
          E,
          S,
          B,
          M,
          F,
          mt
        );
    }
    Z != null && E ? Cs(Z, d && d.ref, S, g || d, !g) : Z == null && d && d.ref != null && Cs(d.ref, null, S, d, !0);
  }, Ae = (d, g, k, A) => {
    if (d == null)
      s(
        g.el = a(g.children),
        k,
        A
      );
    else {
      const E = g.el = d.el;
      g.children !== d.children && f(E, g.children);
    }
  }, ne = (d, g, k, A) => {
    d == null ? s(
      g.el = l(g.children || ""),
      k,
      A
    ) : g.el = d.el;
  }, Se = (d, g, k, A) => {
    [d.el, d.anchor] = $(
      d.children,
      g,
      k,
      A,
      d.el,
      d.anchor
    );
  }, we = ({ el: d, anchor: g }, k, A) => {
    let E;
    for (; d && d !== g; )
      E = v(d), s(d, k, A), d = E;
    s(g, k, A);
  }, U = ({ el: d, anchor: g }) => {
    let k;
    for (; d && d !== g; )
      k = v(d), r(d), d = k;
    r(g);
  }, H = (d, g, k, A, E, S, B, M, F) => {
    g.type === "svg" ? B = "svg" : g.type === "math" && (B = "mathml"), d == null ? Q(
      g,
      k,
      A,
      E,
      S,
      B,
      M,
      F
    ) : nt(
      d,
      g,
      E,
      S,
      B,
      M,
      F
    );
  }, Q = (d, g, k, A, E, S, B, M) => {
    let F, L;
    const { props: Z, shapeFlag: z, transition: K, dirs: X } = d;
    if (F = d.el = o(
      d.type,
      S,
      Z && Z.is,
      Z
    ), z & 8 ? c(F, d.children) : z & 16 && Le(
      d.children,
      F,
      null,
      A,
      E,
      zr(d, S),
      B,
      M
    ), X && $n(d, null, A, "created"), j(F, d, d.scopeId, B, A), Z) {
      for (const Ce in Z)
        Ce !== "value" && !Ss(Ce) && i(F, Ce, null, Z[Ce], S, A);
      "value" in Z && i(F, "value", null, Z.value, S), (L = Z.onVnodeBeforeMount) && en(L, A, d);
    }
    X && $n(d, null, A, "beforeMount");
    const se = Nu(E, K);
    se && K.beforeEnter(F), s(F, g, k), ((L = Z && Z.onVnodeMounted) || se || X) && Ft(() => {
      L && en(L, A, d), se && K.enter(F), X && $n(d, null, A, "mounted");
    }, E);
  }, j = (d, g, k, A, E) => {
    if (k && D(d, k), A)
      for (let S = 0; S < A.length; S++)
        D(d, A[S]);
    if (E) {
      let S = E.subTree;
      if (g === S || gl(S.type) && (S.ssContent === g || S.ssFallback === g)) {
        const B = E.vnode;
        j(
          d,
          B,
          B.scopeId,
          B.slotScopeIds,
          E.parent
        );
      }
    }
  }, Le = (d, g, k, A, E, S, B, M, F = 0) => {
    for (let L = F; L < d.length; L++) {
      const Z = d[L] = M ? En(d[L]) : sn(d[L]);
      Y(
        null,
        Z,
        g,
        k,
        A,
        E,
        S,
        B,
        M
      );
    }
  }, nt = (d, g, k, A, E, S, B) => {
    const M = g.el = d.el;
    let { patchFlag: F, dynamicChildren: L, dirs: Z } = g;
    F |= d.patchFlag & 16;
    const z = d.props || Ye, K = g.props || Ye;
    let X;
    if (k && Bn(k, !1), (X = K.onVnodeBeforeUpdate) && en(X, k, g, d), Z && $n(g, d, k, "beforeUpdate"), k && Bn(k, !0), (z.innerHTML && K.innerHTML == null || z.textContent && K.textContent == null) && c(M, ""), L ? We(
      d.dynamicChildren,
      L,
      M,
      k,
      A,
      zr(g, E),
      S
    ) : B || oe(
      d,
      g,
      M,
      null,
      k,
      A,
      zr(g, E),
      S,
      !1
    ), F > 0) {
      if (F & 16)
        ke(M, z, K, k, E);
      else if (F & 2 && z.class !== K.class && i(M, "class", null, K.class, E), F & 4 && i(M, "style", z.style, K.style, E), F & 8) {
        const se = g.dynamicProps;
        for (let Ce = 0; Ce < se.length; Ce++) {
          const pe = se[Ce], ot = z[pe], Me = K[pe];
          (Me !== ot || pe === "value") && i(M, pe, ot, Me, E, k);
        }
      }
      F & 1 && d.children !== g.children && c(M, g.children);
    } else !B && L == null && ke(M, z, K, k, E);
    ((X = K.onVnodeUpdated) || Z) && Ft(() => {
      X && en(X, k, g, d), Z && $n(g, d, k, "updated");
    }, A);
  }, We = (d, g, k, A, E, S, B) => {
    for (let M = 0; M < g.length; M++) {
      const F = d[M], L = g[M], Z = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        F.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (F.type === st || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !hs(F, L) || // - In the case of a component, it could contain anything.
        F.shapeFlag & 198) ? b(F.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          k
        )
      );
      Y(
        F,
        L,
        Z,
        null,
        A,
        E,
        S,
        B,
        !0
      );
    }
  }, ke = (d, g, k, A, E) => {
    if (g !== k) {
      if (g !== Ye)
        for (const S in g)
          !Ss(S) && !(S in k) && i(
            d,
            S,
            g[S],
            null,
            E,
            A
          );
      for (const S in k) {
        if (Ss(S)) continue;
        const B = k[S], M = g[S];
        B !== M && S !== "value" && i(d, S, M, B, E, A);
      }
      "value" in k && i(d, "value", g.value, k.value, E);
    }
  }, fe = (d, g, k, A, E, S, B, M, F) => {
    const L = g.el = d ? d.el : a(""), Z = g.anchor = d ? d.anchor : a("");
    let { patchFlag: z, dynamicChildren: K, slotScopeIds: X } = g;
    X && (M = M ? M.concat(X) : X), d == null ? (s(L, k, A), s(Z, k, A), Le(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      g.children || [],
      k,
      Z,
      E,
      S,
      B,
      M,
      F
    )) : z > 0 && z & 64 && K && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    d.dynamicChildren ? (We(
      d.dynamicChildren,
      K,
      k,
      E,
      S,
      B,
      M
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (g.key != null || E && g === E.subTree) && ul(
      d,
      g,
      !0
      /* shallow */
    )) : oe(
      d,
      g,
      k,
      Z,
      E,
      S,
      B,
      M,
      F
    );
  }, qe = (d, g, k, A, E, S, B, M, F) => {
    g.slotScopeIds = M, d == null ? g.shapeFlag & 512 ? E.ctx.activate(
      g,
      k,
      A,
      B,
      F
    ) : Ze(
      g,
      k,
      A,
      E,
      S,
      B,
      F
    ) : it(d, g, F);
  }, Ze = (d, g, k, A, E, S, B) => {
    const M = d.component = Qu(
      d,
      A,
      E
    );
    if (Za(d) && (M.ctx.renderer = mt), tf(M, !1, B), M.asyncDep) {
      if (E && E.registerDep(M, ie, B), !d.el) {
        const F = M.subTree = on(Pn);
        ne(null, F, g, k), d.placeholder = F.el;
      }
    } else
      ie(
        M,
        d,
        g,
        k,
        E,
        S,
        B
      );
  }, it = (d, g, k) => {
    const A = g.component = d.component;
    if (Wu(d, g, k))
      if (A.asyncDep && !A.asyncResolved) {
        he(A, g, k);
        return;
      } else
        A.next = g, A.update();
    else
      g.el = d.el, A.vnode = g;
  }, ie = (d, g, k, A, E, S, B) => {
    const M = () => {
      if (d.isMounted) {
        let { next: z, bu: K, u: X, parent: se, vnode: Ce } = d;
        {
          const u = fl(d);
          if (u) {
            z && (z.el = Ce.el, he(d, z, B)), u.asyncDep.then(() => {
              d.isUnmounted || M();
            });
            return;
          }
        }
        let pe = z, ot;
        Bn(d, !1), z ? (z.el = Ce.el, he(d, z, B)) : z = Ce, K && Js(K), (ot = z.props && z.props.onVnodeBeforeUpdate) && en(ot, se, z, Ce), Bn(d, !0);
        const Me = Io(d), Xe = d.subTree;
        d.subTree = Me, Y(
          Xe,
          Me,
          // parent may have changed if it's in a teleport
          b(Xe.el),
          // anchor may have changed if it's in a fragment
          V(Xe),
          d,
          E,
          S
        ), z.el = Me.el, pe === null && qu(d, Me.el), X && Ft(X, E), (ot = z.props && z.props.onVnodeUpdated) && Ft(
          () => en(ot, se, z, Ce),
          E
        );
      } else {
        let z;
        const { el: K, props: X } = g, { bm: se, m: Ce, parent: pe, root: ot, type: Me } = d, Xe = Rs(g);
        Bn(d, !1), se && Js(se), !Xe && (z = X && X.onVnodeBeforeMount) && en(z, pe, g), Bn(d, !0);
        {
          ot.ce && // @ts-expect-error _def is private
          ot.ce._def.shadowRoot !== !1 && ot.ce._injectChildStyle(Me);
          const u = d.subTree = Io(d);
          Y(
            null,
            u,
            k,
            A,
            d,
            E,
            S
          ), g.el = u.el;
        }
        if (Ce && Ft(Ce, E), !Xe && (z = X && X.onVnodeMounted)) {
          const u = g;
          Ft(
            () => en(z, pe, u),
            E
          );
        }
        (g.shapeFlag & 256 || pe && Rs(pe.vnode) && pe.vnode.shapeFlag & 256) && d.a && Ft(d.a, E), d.isMounted = !0, g = k = A = null;
      }
    };
    d.scope.on();
    const F = d.effect = new Ea(M);
    d.scope.off();
    const L = d.update = F.run.bind(F), Z = d.job = F.runIfDirty.bind(F);
    Z.i = d, Z.id = d.uid, F.scheduler = () => Fi(Z), Bn(d, !0), L();
  }, he = (d, g, k) => {
    g.component = d;
    const A = d.vnode.props;
    d.vnode = g, d.next = null, Eu(d, g.props, A, k), Iu(d, g.children, k), vn(), To(d), bn();
  }, oe = (d, g, k, A, E, S, B, M, F = !1) => {
    const L = d && d.children, Z = d ? d.shapeFlag : 0, z = g.children, { patchFlag: K, shapeFlag: X } = g;
    if (K > 0) {
      if (K & 128) {
        et(
          L,
          z,
          k,
          A,
          E,
          S,
          B,
          M,
          F
        );
        return;
      } else if (K & 256) {
        Oe(
          L,
          z,
          k,
          A,
          E,
          S,
          B,
          M,
          F
        );
        return;
      }
    }
    X & 8 ? (Z & 16 && _e(L, E, S), z !== L && c(k, z)) : Z & 16 ? X & 16 ? et(
      L,
      z,
      k,
      A,
      E,
      S,
      B,
      M,
      F
    ) : _e(L, E, S, !0) : (Z & 8 && c(k, ""), X & 16 && Le(
      z,
      k,
      A,
      E,
      S,
      B,
      M,
      F
    ));
  }, Oe = (d, g, k, A, E, S, B, M, F) => {
    d = d || es, g = g || es;
    const L = d.length, Z = g.length, z = Math.min(L, Z);
    let K;
    for (K = 0; K < z; K++) {
      const X = g[K] = F ? En(g[K]) : sn(g[K]);
      Y(
        d[K],
        X,
        k,
        null,
        E,
        S,
        B,
        M,
        F
      );
    }
    L > Z ? _e(
      d,
      E,
      S,
      !0,
      !1,
      z
    ) : Le(
      g,
      k,
      A,
      E,
      S,
      B,
      M,
      F,
      z
    );
  }, et = (d, g, k, A, E, S, B, M, F) => {
    let L = 0;
    const Z = g.length;
    let z = d.length - 1, K = Z - 1;
    for (; L <= z && L <= K; ) {
      const X = d[L], se = g[L] = F ? En(g[L]) : sn(g[L]);
      if (hs(X, se))
        Y(
          X,
          se,
          k,
          null,
          E,
          S,
          B,
          M,
          F
        );
      else
        break;
      L++;
    }
    for (; L <= z && L <= K; ) {
      const X = d[z], se = g[K] = F ? En(g[K]) : sn(g[K]);
      if (hs(X, se))
        Y(
          X,
          se,
          k,
          null,
          E,
          S,
          B,
          M,
          F
        );
      else
        break;
      z--, K--;
    }
    if (L > z) {
      if (L <= K) {
        const X = K + 1, se = X < Z ? g[X].el : A;
        for (; L <= K; )
          Y(
            null,
            g[L] = F ? En(g[L]) : sn(g[L]),
            k,
            se,
            E,
            S,
            B,
            M,
            F
          ), L++;
      }
    } else if (L > K)
      for (; L <= z; )
        Ie(d[L], E, S, !0), L++;
    else {
      const X = L, se = L, Ce = /* @__PURE__ */ new Map();
      for (L = se; L <= K; L++) {
        const x = g[L] = F ? En(g[L]) : sn(g[L]);
        x.key != null && Ce.set(x.key, L);
      }
      let pe, ot = 0;
      const Me = K - se + 1;
      let Xe = !1, u = 0;
      const m = new Array(Me);
      for (L = 0; L < Me; L++) m[L] = 0;
      for (L = X; L <= z; L++) {
        const x = d[L];
        if (ot >= Me) {
          Ie(x, E, S, !0);
          continue;
        }
        let P;
        if (x.key != null)
          P = Ce.get(x.key);
        else
          for (pe = se; pe <= K; pe++)
            if (m[pe - se] === 0 && hs(x, g[pe])) {
              P = pe;
              break;
            }
        P === void 0 ? Ie(x, E, S, !0) : (m[P - se] = L + 1, P >= u ? u = P : Xe = !0, Y(
          x,
          g[P],
          k,
          null,
          E,
          S,
          B,
          M,
          F
        ), ot++);
      }
      const T = Xe ? Mu(m) : es;
      for (pe = T.length - 1, L = Me - 1; L >= 0; L--) {
        const x = se + L, P = g[x], G = g[x + 1], ee = x + 1 < Z ? (
          // #13559, fallback to el placeholder for unresolved async component
          G.el || G.placeholder
        ) : A;
        m[L] === 0 ? Y(
          null,
          P,
          k,
          ee,
          E,
          S,
          B,
          M,
          F
        ) : Xe && (pe < 0 || L !== T[pe] ? re(P, k, ee, 2) : pe--);
      }
    }
  }, re = (d, g, k, A, E = null) => {
    const { el: S, type: B, transition: M, children: F, shapeFlag: L } = d;
    if (L & 6) {
      re(d.component.subTree, g, k, A);
      return;
    }
    if (L & 128) {
      d.suspense.move(g, k, A);
      return;
    }
    if (L & 64) {
      B.move(d, g, k, mt);
      return;
    }
    if (B === st) {
      s(S, g, k);
      for (let z = 0; z < F.length; z++)
        re(F[z], g, k, A);
      s(d.anchor, g, k);
      return;
    }
    if (B === er) {
      we(d, g, k);
      return;
    }
    if (A !== 2 && L & 1 && M)
      if (A === 0)
        M.beforeEnter(S), s(S, g, k), Ft(() => M.enter(S), E);
      else {
        const { leave: z, delayLeave: K, afterLeave: X } = M, se = () => {
          d.ctx.isUnmounted ? r(S) : s(S, g, k);
        }, Ce = () => {
          z(S, () => {
            se(), X && X();
          });
        };
        K ? K(S, se, Ce) : Ce();
      }
    else
      s(S, g, k);
  }, Ie = (d, g, k, A = !1, E = !1) => {
    const {
      type: S,
      props: B,
      ref: M,
      children: F,
      dynamicChildren: L,
      shapeFlag: Z,
      patchFlag: z,
      dirs: K,
      cacheIndex: X
    } = d;
    if (z === -2 && (E = !1), M != null && (vn(), Cs(M, null, k, d, !0), bn()), X != null && (g.renderCache[X] = void 0), Z & 256) {
      g.ctx.deactivate(d);
      return;
    }
    const se = Z & 1 && K, Ce = !Rs(d);
    let pe;
    if (Ce && (pe = B && B.onVnodeBeforeUnmount) && en(pe, g, d), Z & 6)
      ae(d.component, k, A);
    else {
      if (Z & 128) {
        d.suspense.unmount(k, A);
        return;
      }
      se && $n(d, null, g, "beforeUnmount"), Z & 64 ? d.type.remove(
        d,
        g,
        k,
        mt,
        A
      ) : L && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !L.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (S !== st || z > 0 && z & 64) ? _e(
        L,
        g,
        k,
        !1,
        !0
      ) : (S === st && z & 384 || !E && Z & 16) && _e(F, g, k), A && Pe(d);
    }
    (Ce && (pe = B && B.onVnodeUnmounted) || se) && Ft(() => {
      pe && en(pe, g, d), se && $n(d, null, g, "unmounted");
    }, k);
  }, Pe = (d) => {
    const { type: g, el: k, anchor: A, transition: E } = d;
    if (g === st) {
      W(k, A);
      return;
    }
    if (g === er) {
      U(d);
      return;
    }
    const S = () => {
      r(k), E && !E.persisted && E.afterLeave && E.afterLeave();
    };
    if (d.shapeFlag & 1 && E && !E.persisted) {
      const { leave: B, delayLeave: M } = E, F = () => B(k, S);
      M ? M(d.el, S, F) : F();
    } else
      S();
  }, W = (d, g) => {
    let k;
    for (; d !== g; )
      k = v(d), r(d), d = k;
    r(g);
  }, ae = (d, g, k) => {
    const {
      bum: A,
      scope: E,
      job: S,
      subTree: B,
      um: M,
      m: F,
      a: L,
      parent: Z,
      slots: { __: z }
    } = d;
    Lo(F), Lo(L), A && Js(A), Z && ue(z) && z.forEach((K) => {
      Z.renderCache[K] = void 0;
    }), E.stop(), S && (S.flags |= 8, Ie(B, d, g, k)), M && Ft(M, g), Ft(() => {
      d.isUnmounted = !0;
    }, g), g && g.pendingBranch && !g.isUnmounted && d.asyncDep && !d.asyncResolved && d.suspenseId === g.pendingId && (g.deps--, g.deps === 0 && g.resolve());
  }, _e = (d, g, k, A = !1, E = !1, S = 0) => {
    for (let B = S; B < d.length; B++)
      Ie(d[B], g, k, A, E);
  }, V = (d) => {
    if (d.shapeFlag & 6)
      return V(d.component.subTree);
    if (d.shapeFlag & 128)
      return d.suspense.next();
    const g = v(d.anchor || d.el), k = g && g[nu];
    return k ? v(k) : g;
  };
  let je = !1;
  const Qe = (d, g, k) => {
    d == null ? g._vnode && Ie(g._vnode, null, null, !0) : Y(
      g._vnode || null,
      d,
      g,
      null,
      null,
      null,
      k
    ), g._vnode = d, je || (je = !0, To(), Va(), je = !1);
  }, mt = {
    p: Y,
    um: Ie,
    m: re,
    r: Pe,
    mt: Ze,
    mc: Le,
    pc: oe,
    pbc: We,
    n: V,
    o: t
  };
  return {
    render: Qe,
    hydrate: void 0,
    createApp: Tu(Qe)
  };
}
function zr({ type: t, props: e }, n) {
  return n === "svg" && t === "foreignObject" || n === "mathml" && t === "annotation-xml" && e && e.encoding && e.encoding.includes("html") ? void 0 : n;
}
function Bn({ effect: t, job: e }, n) {
  n ? (t.flags |= 32, e.flags |= 4) : (t.flags &= -33, e.flags &= -5);
}
function Nu(t, e) {
  return (!t || t && !t.pendingBranch) && e && !e.persisted;
}
function ul(t, e, n = !1) {
  const s = t.children, r = e.children;
  if (ue(s) && ue(r))
    for (let i = 0; i < s.length; i++) {
      const o = s[i];
      let a = r[i];
      a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = r[i] = En(r[i]), a.el = o.el), !n && a.patchFlag !== -2 && ul(o, a)), a.type === Ar && (a.el = o.el), a.type === Pn && !a.el && (a.el = o.el);
    }
}
function Mu(t) {
  const e = t.slice(), n = [0];
  let s, r, i, o, a;
  const l = t.length;
  for (s = 0; s < l; s++) {
    const f = t[s];
    if (f !== 0) {
      if (r = n[n.length - 1], t[r] < f) {
        e[s] = r, n.push(s);
        continue;
      }
      for (i = 0, o = n.length - 1; i < o; )
        a = i + o >> 1, t[n[a]] < f ? i = a + 1 : o = a;
      f < t[n[i]] && (i > 0 && (e[s] = n[i - 1]), n[i] = s);
    }
  }
  for (i = n.length, o = n[i - 1]; i-- > 0; )
    n[i] = o, o = e[o];
  return n;
}
function fl(t) {
  const e = t.subTree.component;
  if (e)
    return e.asyncDep && !e.asyncResolved ? e : fl(e);
}
function Lo(t) {
  if (t)
    for (let e = 0; e < t.length; e++)
      t[e].flags |= 8;
}
const Du = Symbol.for("v-scx"), Fu = () => Qs(Du);
function Hn(t, e, n) {
  return hl(t, e, n);
}
function hl(t, e, n = Ye) {
  const { immediate: s, deep: r, flush: i, once: o } = n, a = St({}, n), l = e && s || !e && i !== "post";
  let f;
  if (Fs) {
    if (i === "sync") {
      const D = Fu();
      f = D.__watcherHandles || (D.__watcherHandles = []);
    } else if (!l) {
      const D = () => {
      };
      return D.stop = rn, D.resume = rn, D.pause = rn, D;
    }
  }
  const c = Rt;
  a.call = (D, $, Y) => ln(D, c, $, Y);
  let b = !1;
  i === "post" ? a.scheduler = (D) => {
    Ft(D, c && c.suspense);
  } : i !== "sync" && (b = !0, a.scheduler = (D, $) => {
    $ ? D() : Fi(D);
  }), a.augmentJob = (D) => {
    e && (D.flags |= 4), b && (D.flags |= 2, c && (D.id = c.uid, D.i = c));
  };
  const v = Xc(t, e, a);
  return Fs && (f ? f.push(v) : l && v()), v;
}
function $u(t, e, n) {
  const s = this.proxy, r = gt(t) ? t.includes(".") ? dl(s, t) : () => s[t] : t.bind(s, s);
  let i;
  me(e) ? i = e : (i = e.handler, n = e);
  const o = Bs(this), a = hl(r, i.bind(s), n);
  return o(), a;
}
function dl(t, e) {
  const n = e.split(".");
  return () => {
    let s = t;
    for (let r = 0; r < n.length && s; r++)
      s = s[n[r]];
    return s;
  };
}
const Bu = (t, e) => e === "modelValue" || e === "model-value" ? t.modelModifiers : t[`${e}Modifiers`] || t[`${In(e)}Modifiers`] || t[`${Mn(e)}Modifiers`];
function Uu(t, e, ...n) {
  if (t.isUnmounted) return;
  const s = t.vnode.props || Ye;
  let r = n;
  const i = e.startsWith("update:"), o = i && Bu(s, e.slice(7));
  o && (o.trim && (r = n.map((c) => gt(c) ? c.trim() : c)), o.number && (r = n.map(si)));
  let a, l = s[a = Mr(e)] || // also try camelCase event handler (#2249)
  s[a = Mr(In(e))];
  !l && i && (l = s[a = Mr(Mn(e))]), l && ln(
    l,
    t,
    6,
    r
  );
  const f = s[a + "Once"];
  if (f) {
    if (!t.emitted)
      t.emitted = {};
    else if (t.emitted[a])
      return;
    t.emitted[a] = !0, ln(
      f,
      t,
      6,
      r
    );
  }
}
function pl(t, e, n = !1) {
  const s = e.emitsCache, r = s.get(t);
  if (r !== void 0)
    return r;
  const i = t.emits;
  let o = {}, a = !1;
  if (!me(t)) {
    const l = (f) => {
      const c = pl(f, e, !0);
      c && (a = !0, St(o, c));
    };
    !n && e.mixins.length && e.mixins.forEach(l), t.extends && l(t.extends), t.mixins && t.mixins.forEach(l);
  }
  return !i && !a ? (rt(t) && s.set(t, null), null) : (ue(i) ? i.forEach((l) => o[l] = null) : St(o, i), rt(t) && s.set(t, o), o);
}
function Sr(t, e) {
  return !t || !yr(e) ? !1 : (e = e.slice(2).replace(/Once$/, ""), Be(t, e[0].toLowerCase() + e.slice(1)) || Be(t, Mn(e)) || Be(t, e));
}
function Io(t) {
  const {
    type: e,
    vnode: n,
    proxy: s,
    withProxy: r,
    propsOptions: [i],
    slots: o,
    attrs: a,
    emit: l,
    render: f,
    renderCache: c,
    props: b,
    data: v,
    setupState: D,
    ctx: $,
    inheritAttrs: Y
  } = t, Ae = hr(t);
  let ne, Se;
  try {
    if (n.shapeFlag & 4) {
      const U = r || s, H = U;
      ne = sn(
        f.call(
          H,
          U,
          c,
          b,
          D,
          v,
          $
        )
      ), Se = a;
    } else {
      const U = e;
      ne = sn(
        U.length > 1 ? U(
          b,
          { attrs: a, slots: o, emit: l }
        ) : U(
          b,
          null
        )
      ), Se = e.props ? a : zu(a);
    }
  } catch (U) {
    Is.length = 0, xr(U, t, 1), ne = on(Pn);
  }
  let we = ne;
  if (Se && Y !== !1) {
    const U = Object.keys(Se), { shapeFlag: H } = we;
    U.length && H & 7 && (i && U.some(Ai) && (Se = Hu(
      Se,
      i
    )), we = is(we, Se, !1, !0));
  }
  return n.dirs && (we = is(we, null, !1, !0), we.dirs = we.dirs ? we.dirs.concat(n.dirs) : n.dirs), n.transition && $i(we, n.transition), ne = we, hr(Ae), ne;
}
const zu = (t) => {
  let e;
  for (const n in t)
    (n === "class" || n === "style" || yr(n)) && ((e || (e = {}))[n] = t[n]);
  return e;
}, Hu = (t, e) => {
  const n = {};
  for (const s in t)
    (!Ai(s) || !(s.slice(9) in e)) && (n[s] = t[s]);
  return n;
};
function Wu(t, e, n) {
  const { props: s, children: r, component: i } = t, { props: o, children: a, patchFlag: l } = e, f = i.emitsOptions;
  if (e.dirs || e.transition)
    return !0;
  if (n && l >= 0) {
    if (l & 1024)
      return !0;
    if (l & 16)
      return s ? Oo(s, o, f) : !!o;
    if (l & 8) {
      const c = e.dynamicProps;
      for (let b = 0; b < c.length; b++) {
        const v = c[b];
        if (o[v] !== s[v] && !Sr(f, v))
          return !0;
      }
    }
  } else
    return (r || a) && (!a || !a.$stable) ? !0 : s === o ? !1 : s ? o ? Oo(s, o, f) : !0 : !!o;
  return !1;
}
function Oo(t, e, n) {
  const s = Object.keys(e);
  if (s.length !== Object.keys(t).length)
    return !0;
  for (let r = 0; r < s.length; r++) {
    const i = s[r];
    if (e[i] !== t[i] && !Sr(n, i))
      return !0;
  }
  return !1;
}
function qu({ vnode: t, parent: e }, n) {
  for (; e; ) {
    const s = e.subTree;
    if (s.suspense && s.suspense.activeBranch === t && (s.el = t.el), s === t)
      (t = e.vnode).el = n, e = e.parent;
    else
      break;
  }
}
const gl = (t) => t.__isSuspense;
function ju(t, e) {
  e && e.pendingBranch ? ue(t) ? e.effects.push(...t) : e.effects.push(t) : eu(t);
}
const st = Symbol.for("v-fgt"), Ar = Symbol.for("v-txt"), Pn = Symbol.for("v-cmt"), er = Symbol.for("v-stc"), Is = [];
let $t = null;
function I(t = !1) {
  Is.push($t = t ? null : []);
}
function Vu() {
  Is.pop(), $t = Is[Is.length - 1] || null;
}
let Ds = 1;
function Po(t, e = !1) {
  Ds += t, t < 0 && $t && e && ($t.hasOnce = !0);
}
function ml(t) {
  return t.dynamicChildren = Ds > 0 ? $t || es : null, Vu(), Ds > 0 && $t && $t.push(t), t;
}
function O(t, e, n, s, r, i) {
  return ml(
    w(
      t,
      e,
      n,
      s,
      r,
      i,
      !0
    )
  );
}
function Ku(t, e, n, s, r) {
  return ml(
    on(
      t,
      e,
      n,
      s,
      r,
      !0
    )
  );
}
function _l(t) {
  return t ? t.__v_isVNode === !0 : !1;
}
function hs(t, e) {
  return t.type === e.type && t.key === e.key;
}
const yl = ({ key: t }) => t ?? null, tr = ({
  ref: t,
  ref_key: e,
  ref_for: n
}) => (typeof t == "number" && (t = "" + t), t != null ? gt(t) || Tt(t) || me(t) ? { i: qt, r: t, k: e, f: !!n } : t : null);
function w(t, e = null, n = null, s = 0, r = null, i = t === st ? 0 : 1, o = !1, a = !1) {
  const l = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: t,
    props: e,
    key: e && yl(e),
    ref: e && tr(e),
    scopeId: Ga,
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
    ctx: qt
  };
  return a ? (Hi(l, n), i & 128 && t.normalize(l)) : n && (l.shapeFlag |= gt(n) ? 8 : 16), Ds > 0 && // avoid a block node from tracking itself
  !o && // has current parent block
  $t && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (l.patchFlag > 0 || i & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  l.patchFlag !== 32 && $t.push(l), l;
}
const on = Gu;
function Gu(t, e = null, n = null, s = 0, r = null, i = !1) {
  if ((!t || t === mu) && (t = Pn), _l(t)) {
    const a = is(
      t,
      e,
      !0
      /* mergeRef: true */
    );
    return n && Hi(a, n), Ds > 0 && !i && $t && (a.shapeFlag & 6 ? $t[$t.indexOf(t)] = a : $t.push(a)), a.patchFlag = -2, a;
  }
  if (of(t) && (t = t.__vccOpts), e) {
    e = Yu(e);
    let { class: a, style: l } = e;
    a && !gt(a) && (e.class = tt(a)), rt(l) && (Di(l) && !ue(l) && (l = St({}, l)), e.style = ze(l));
  }
  const o = gt(t) ? 1 : gl(t) ? 128 : su(t) ? 64 : rt(t) ? 4 : me(t) ? 2 : 0;
  return w(
    t,
    e,
    n,
    s,
    r,
    o,
    i,
    !0
  );
}
function Yu(t) {
  return t ? Di(t) || rl(t) ? St({}, t) : t : null;
}
function is(t, e, n = !1, s = !1) {
  const { props: r, ref: i, patchFlag: o, children: a, transition: l } = t, f = e ? Zu(r || {}, e) : r, c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: t.type,
    props: f,
    key: f && yl(f),
    ref: e && e.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && i ? ue(i) ? i.concat(tr(e)) : [i, tr(e)] : tr(e)
    ) : i,
    scopeId: t.scopeId,
    slotScopeIds: t.slotScopeIds,
    children: a,
    target: t.target,
    targetStart: t.targetStart,
    targetAnchor: t.targetAnchor,
    staticCount: t.staticCount,
    shapeFlag: t.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: e && t.type !== st ? o === -1 ? 16 : o | 16 : o,
    dynamicProps: t.dynamicProps,
    dynamicChildren: t.dynamicChildren,
    appContext: t.appContext,
    dirs: t.dirs,
    transition: l,
    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: t.component,
    suspense: t.suspense,
    ssContent: t.ssContent && is(t.ssContent),
    ssFallback: t.ssFallback && is(t.ssFallback),
    placeholder: t.placeholder,
    el: t.el,
    anchor: t.anchor,
    ctx: t.ctx,
    ce: t.ce
  };
  return l && s && $i(
    c,
    l.clone(c)
  ), c;
}
function Dt(t = " ", e = 0) {
  return on(Ar, null, t, e);
}
function Hr(t, e) {
  const n = on(er, null, t);
  return n.staticCount = e, n;
}
function ge(t = "", e = !1) {
  return e ? (I(), Ku(Pn, null, t)) : on(Pn, null, t);
}
function sn(t) {
  return t == null || typeof t == "boolean" ? on(Pn) : ue(t) ? on(
    st,
    null,
    // #3666, avoid reference pollution when reusing vnode
    t.slice()
  ) : _l(t) ? En(t) : on(Ar, null, String(t));
}
function En(t) {
  return t.el === null && t.patchFlag !== -1 || t.memo ? t : is(t);
}
function Hi(t, e) {
  let n = 0;
  const { shapeFlag: s } = t;
  if (e == null)
    e = null;
  else if (ue(e))
    n = 16;
  else if (typeof e == "object")
    if (s & 65) {
      const r = e.default;
      r && (r._c && (r._d = !1), Hi(t, r()), r._c && (r._d = !0));
      return;
    } else {
      n = 32;
      const r = e._;
      !r && !rl(e) ? e._ctx = qt : r === 3 && qt && (qt.slots._ === 1 ? e._ = 1 : (e._ = 2, t.patchFlag |= 1024));
    }
  else me(e) ? (e = { default: e, _ctx: qt }, n = 32) : (e = String(e), s & 64 ? (n = 16, e = [Dt(e)]) : n = 8);
  t.children = e, t.shapeFlag |= n;
}
function Zu(...t) {
  const e = {};
  for (let n = 0; n < t.length; n++) {
    const s = t[n];
    for (const r in s)
      if (r === "class")
        e.class !== s.class && (e.class = tt([e.class, s.class]));
      else if (r === "style")
        e.style = ze([e.style, s.style]);
      else if (yr(r)) {
        const i = e[r], o = s[r];
        o && i !== o && !(ue(i) && i.includes(o)) && (e[r] = i ? [].concat(i, o) : o);
      } else r !== "" && (e[r] = s[r]);
  }
  return e;
}
function en(t, e, n, s = null) {
  ln(t, e, 7, [
    n,
    s
  ]);
}
const Xu = tl();
let Ju = 0;
function Qu(t, e, n) {
  const s = t.type, r = (e ? e.appContext : t.appContext) || Xu, i = {
    uid: Ju++,
    vnode: t,
    type: s,
    parent: e,
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
    scope: new xc(
      !0
      /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: e ? e.provides : Object.create(r.provides),
    ids: e ? e.ids : ["", 0, 0],
    accessCache: null,
    renderCache: [],
    // local resolved assets
    components: null,
    directives: null,
    // resolved props and emits options
    propsOptions: ol(s, r),
    emitsOptions: pl(s, r),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: Ye,
    // inheritAttrs
    inheritAttrs: s.inheritAttrs,
    // state
    ctx: Ye,
    data: Ye,
    props: Ye,
    attrs: Ye,
    slots: Ye,
    refs: Ye,
    setupState: Ye,
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
  return i.ctx = { _: i }, i.root = e ? e.root : i, i.emit = Uu.bind(null, i), t.ce && t.ce(i), i;
}
let Rt = null;
const ef = () => Rt || qt;
let pr, hi;
{
  const t = wr(), e = (n, s) => {
    let r;
    return (r = t[n]) || (r = t[n] = []), r.push(s), (i) => {
      r.length > 1 ? r.forEach((o) => o(i)) : r[0](i);
    };
  };
  pr = e(
    "__VUE_INSTANCE_SETTERS__",
    (n) => Rt = n
  ), hi = e(
    "__VUE_SSR_SETTERS__",
    (n) => Fs = n
  );
}
const Bs = (t) => {
  const e = Rt;
  return pr(t), t.scope.on(), () => {
    t.scope.off(), pr(e);
  };
}, No = () => {
  Rt && Rt.scope.off(), pr(null);
};
function vl(t) {
  return t.vnode.shapeFlag & 4;
}
let Fs = !1;
function tf(t, e = !1, n = !1) {
  e && hi(e);
  const { props: s, children: r } = t.vnode, i = vl(t);
  Au(t, s, i, e), Lu(t, r, n || e);
  const o = i ? nf(t, e) : void 0;
  return e && hi(!1), o;
}
function nf(t, e) {
  const n = t.type;
  t.accessCache = /* @__PURE__ */ Object.create(null), t.proxy = new Proxy(t.ctx, _u);
  const { setup: s } = n;
  if (s) {
    vn();
    const r = t.setupContext = s.length > 1 ? rf(t) : null, i = Bs(t), o = $s(
      s,
      t,
      0,
      [
        t.props,
        r
      ]
    ), a = ba(o);
    if (bn(), i(), (a || t.sp) && !Rs(t) && Ya(t), a) {
      if (o.then(No, No), e)
        return o.then((l) => {
          Mo(t, l);
        }).catch((l) => {
          xr(l, t, 0);
        });
      t.asyncDep = o;
    } else
      Mo(t, o);
  } else
    bl(t);
}
function Mo(t, e, n) {
  me(e) ? t.type.__ssrInlineRender ? t.ssrRender = e : t.render = e : rt(e) && (t.setupState = Ha(e)), bl(t);
}
function bl(t, e, n) {
  const s = t.type;
  t.render || (t.render = s.render || rn);
  {
    const r = Bs(t);
    vn();
    try {
      yu(t);
    } finally {
      bn(), r();
    }
  }
}
const sf = {
  get(t, e) {
    return xt(t, "get", ""), t[e];
  }
};
function rf(t) {
  const e = (n) => {
    t.exposed = n || {};
  };
  return {
    attrs: new Proxy(t.attrs, sf),
    slots: t.slots,
    emit: t.emit,
    expose: e
  };
}
function Er(t) {
  return t.exposed ? t.exposeProxy || (t.exposeProxy = new Proxy(Ha(qc(t.exposed)), {
    get(e, n) {
      if (n in e)
        return e[n];
      if (n in Ls)
        return Ls[n](t);
    },
    has(e, n) {
      return n in e || n in Ls;
    }
  })) : t.proxy;
}
function of(t) {
  return me(t) && "__vccOpts" in t;
}
const ft = (t, e) => Yc(t, e, Fs), af = "3.5.18";
/**
* @vue/runtime-dom v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let di;
const Do = typeof window < "u" && window.trustedTypes;
if (Do)
  try {
    di = /* @__PURE__ */ Do.createPolicy("vue", {
      createHTML: (t) => t
    });
  } catch {
  }
const wl = di ? (t) => di.createHTML(t) : (t) => t, lf = "http://www.w3.org/2000/svg", cf = "http://www.w3.org/1998/Math/MathML", pn = typeof document < "u" ? document : null, Fo = pn && /* @__PURE__ */ pn.createElement("template"), uf = {
  insert: (t, e, n) => {
    e.insertBefore(t, n || null);
  },
  remove: (t) => {
    const e = t.parentNode;
    e && e.removeChild(t);
  },
  createElement: (t, e, n, s) => {
    const r = e === "svg" ? pn.createElementNS(lf, t) : e === "mathml" ? pn.createElementNS(cf, t) : n ? pn.createElement(t, { is: n }) : pn.createElement(t);
    return t === "select" && s && s.multiple != null && r.setAttribute("multiple", s.multiple), r;
  },
  createText: (t) => pn.createTextNode(t),
  createComment: (t) => pn.createComment(t),
  setText: (t, e) => {
    t.nodeValue = e;
  },
  setElementText: (t, e) => {
    t.textContent = e;
  },
  parentNode: (t) => t.parentNode,
  nextSibling: (t) => t.nextSibling,
  querySelector: (t) => pn.querySelector(t),
  setScopeId(t, e) {
    t.setAttribute(e, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(t, e, n, s, r, i) {
    const o = n ? n.previousSibling : e.lastChild;
    if (r && (r === i || r.nextSibling))
      for (; e.insertBefore(r.cloneNode(!0), n), !(r === i || !(r = r.nextSibling)); )
        ;
    else {
      Fo.innerHTML = wl(
        s === "svg" ? `<svg>${t}</svg>` : s === "mathml" ? `<math>${t}</math>` : t
      );
      const a = Fo.content;
      if (s === "svg" || s === "mathml") {
        const l = a.firstChild;
        for (; l.firstChild; )
          a.appendChild(l.firstChild);
        a.removeChild(l);
      }
      e.insertBefore(a, n);
    }
    return [
      // first
      o ? o.nextSibling : e.firstChild,
      // last
      n ? n.previousSibling : e.lastChild
    ];
  }
}, ff = Symbol("_vtc");
function hf(t, e, n) {
  const s = t[ff];
  s && (e = (e ? [e, ...s] : [...s]).join(" ")), e == null ? t.removeAttribute("class") : n ? t.setAttribute("class", e) : t.className = e;
}
const $o = Symbol("_vod"), df = Symbol("_vsh"), pf = Symbol(""), gf = /(^|;)\s*display\s*:/;
function mf(t, e, n) {
  const s = t.style, r = gt(n);
  let i = !1;
  if (n && !r) {
    if (e)
      if (gt(e))
        for (const o of e.split(";")) {
          const a = o.slice(0, o.indexOf(":")).trim();
          n[a] == null && nr(s, a, "");
        }
      else
        for (const o in e)
          n[o] == null && nr(s, o, "");
    for (const o in n)
      o === "display" && (i = !0), nr(s, o, n[o]);
  } else if (r) {
    if (e !== n) {
      const o = s[pf];
      o && (n += ";" + o), s.cssText = n, i = gf.test(n);
    }
  } else e && t.removeAttribute("style");
  $o in t && (t[$o] = i ? s.display : "", t[df] && (s.display = "none"));
}
const Bo = /\s*!important$/;
function nr(t, e, n) {
  if (ue(n))
    n.forEach((s) => nr(t, e, s));
  else if (n == null && (n = ""), e.startsWith("--"))
    t.setProperty(e, n);
  else {
    const s = _f(t, e);
    Bo.test(n) ? t.setProperty(
      Mn(s),
      n.replace(Bo, ""),
      "important"
    ) : t[s] = n;
  }
}
const Uo = ["Webkit", "Moz", "ms"], Wr = {};
function _f(t, e) {
  const n = Wr[e];
  if (n)
    return n;
  let s = In(e);
  if (s !== "filter" && s in t)
    return Wr[e] = s;
  s = xa(s);
  for (let r = 0; r < Uo.length; r++) {
    const i = Uo[r] + s;
    if (i in t)
      return Wr[e] = i;
  }
  return e;
}
const zo = "http://www.w3.org/1999/xlink";
function Ho(t, e, n, s, r, i = kc(e)) {
  s && e.startsWith("xlink:") ? n == null ? t.removeAttributeNS(zo, e.slice(6, e.length)) : t.setAttributeNS(zo, e, n) : n == null || i && !Ta(n) ? t.removeAttribute(e) : t.setAttribute(
    e,
    i ? "" : Nn(n) ? String(n) : n
  );
}
function Wo(t, e, n, s, r) {
  if (e === "innerHTML" || e === "textContent") {
    n != null && (t[e] = e === "innerHTML" ? wl(n) : n);
    return;
  }
  const i = t.tagName;
  if (e === "value" && i !== "PROGRESS" && // custom elements may use _value internally
  !i.includes("-")) {
    const a = i === "OPTION" ? t.getAttribute("value") || "" : t.value, l = n == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      t.type === "checkbox" ? "on" : ""
    ) : String(n);
    (a !== l || !("_value" in t)) && (t.value = l), n == null && t.removeAttribute(e), t._value = n;
    return;
  }
  let o = !1;
  if (n === "" || n == null) {
    const a = typeof t[e];
    a === "boolean" ? n = Ta(n) : n == null && a === "string" ? (n = "", o = !0) : a === "number" && (n = 0, o = !0);
  }
  try {
    t[e] = n;
  } catch {
  }
  o && t.removeAttribute(r || e);
}
function Qn(t, e, n, s) {
  t.addEventListener(e, n, s);
}
function yf(t, e, n, s) {
  t.removeEventListener(e, n, s);
}
const qo = Symbol("_vei");
function vf(t, e, n, s, r = null) {
  const i = t[qo] || (t[qo] = {}), o = i[e];
  if (s && o)
    o.value = s;
  else {
    const [a, l] = bf(e);
    if (s) {
      const f = i[e] = xf(
        s,
        r
      );
      Qn(t, a, f, l);
    } else o && (yf(t, a, o, l), i[e] = void 0);
  }
}
const jo = /(?:Once|Passive|Capture)$/;
function bf(t) {
  let e;
  if (jo.test(t)) {
    e = {};
    let s;
    for (; s = t.match(jo); )
      t = t.slice(0, t.length - s[0].length), e[s[0].toLowerCase()] = !0;
  }
  return [t[2] === ":" ? t.slice(3) : Mn(t.slice(2)), e];
}
let qr = 0;
const wf = /* @__PURE__ */ Promise.resolve(), kf = () => qr || (wf.then(() => qr = 0), qr = Date.now());
function xf(t, e) {
  const n = (s) => {
    if (!s._vts)
      s._vts = Date.now();
    else if (s._vts <= n.attached)
      return;
    ln(
      Tf(s, n.value),
      e,
      5,
      [s]
    );
  };
  return n.value = t, n.attached = kf(), n;
}
function Tf(t, e) {
  if (ue(e)) {
    const n = t.stopImmediatePropagation;
    return t.stopImmediatePropagation = () => {
      n.call(t), t._stopped = !0;
    }, e.map(
      (s) => (r) => !r._stopped && s && s(r)
    );
  } else
    return e;
}
const Vo = (t) => t.charCodeAt(0) === 111 && t.charCodeAt(1) === 110 && // lowercase letter
t.charCodeAt(2) > 96 && t.charCodeAt(2) < 123, Sf = (t, e, n, s, r, i) => {
  const o = r === "svg";
  e === "class" ? hf(t, s, o) : e === "style" ? mf(t, n, s) : yr(e) ? Ai(e) || vf(t, e, n, s, i) : (e[0] === "." ? (e = e.slice(1), !0) : e[0] === "^" ? (e = e.slice(1), !1) : Af(t, e, s, o)) ? (Wo(t, e, s), !t.tagName.includes("-") && (e === "value" || e === "checked" || e === "selected") && Ho(t, e, s, o, i, e !== "value")) : /* #11081 force set props for possible async custom element */ t._isVueCE && (/[A-Z]/.test(e) || !gt(s)) ? Wo(t, In(e), s, i, e) : (e === "true-value" ? t._trueValue = s : e === "false-value" && (t._falseValue = s), Ho(t, e, s, o));
};
function Af(t, e, n, s) {
  if (s)
    return !!(e === "innerHTML" || e === "textContent" || e in t && Vo(e) && me(n));
  if (e === "spellcheck" || e === "draggable" || e === "translate" || e === "autocorrect" || e === "form" || e === "list" && t.tagName === "INPUT" || e === "type" && t.tagName === "TEXTAREA")
    return !1;
  if (e === "width" || e === "height") {
    const r = t.tagName;
    if (r === "IMG" || r === "VIDEO" || r === "CANVAS" || r === "SOURCE")
      return !1;
  }
  return Vo(e) && gt(n) ? !1 : e in t;
}
const Ko = (t) => {
  const e = t.props["onUpdate:modelValue"] || !1;
  return ue(e) ? (n) => Js(e, n) : e;
};
function Ef(t) {
  t.target.composing = !0;
}
function Go(t) {
  const e = t.target;
  e.composing && (e.composing = !1, e.dispatchEvent(new Event("input")));
}
const jr = Symbol("_assign"), Un = {
  created(t, { modifiers: { lazy: e, trim: n, number: s } }, r) {
    t[jr] = Ko(r);
    const i = s || r.props && r.props.type === "number";
    Qn(t, e ? "change" : "input", (o) => {
      if (o.target.composing) return;
      let a = t.value;
      n && (a = a.trim()), i && (a = si(a)), t[jr](a);
    }), n && Qn(t, "change", () => {
      t.value = t.value.trim();
    }), e || (Qn(t, "compositionstart", Ef), Qn(t, "compositionend", Go), Qn(t, "change", Go));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(t, { value: e }) {
    t.value = e ?? "";
  },
  beforeUpdate(t, { value: e, oldValue: n, modifiers: { lazy: s, trim: r, number: i } }, o) {
    if (t[jr] = Ko(o), t.composing) return;
    const a = (i || t.type === "number") && !/^0\d/.test(t.value) ? si(t.value) : t.value, l = e ?? "";
    a !== l && (document.activeElement === t && t.type !== "range" && (s && e === n || r && t.value.trim() === l) || (t.value = l));
  }
}, Cf = ["ctrl", "shift", "alt", "meta"], Rf = {
  stop: (t) => t.stopPropagation(),
  prevent: (t) => t.preventDefault(),
  self: (t) => t.target !== t.currentTarget,
  ctrl: (t) => !t.ctrlKey,
  shift: (t) => !t.shiftKey,
  alt: (t) => !t.altKey,
  meta: (t) => !t.metaKey,
  left: (t) => "button" in t && t.button !== 0,
  middle: (t) => "button" in t && t.button !== 1,
  right: (t) => "button" in t && t.button !== 2,
  exact: (t, e) => Cf.some((n) => t[`${n}Key`] && !e.includes(n))
}, Xn = (t, e) => {
  const n = t._withMods || (t._withMods = {}), s = e.join(".");
  return n[s] || (n[s] = (r, ...i) => {
    for (let o = 0; o < e.length; o++) {
      const a = Rf[e[o]];
      if (a && a(r, e)) return;
    }
    return t(r, ...i);
  });
}, Lf = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, Yo = (t, e) => {
  const n = t._withKeys || (t._withKeys = {}), s = e.join(".");
  return n[s] || (n[s] = (r) => {
    if (!("key" in r))
      return;
    const i = Mn(r.key);
    if (e.some(
      (o) => o === i || Lf[o] === i
    ))
      return t(r);
  });
}, If = /* @__PURE__ */ St({ patchProp: Sf }, uf);
let Zo;
function Of() {
  return Zo || (Zo = Ou(If));
}
const Pf = (...t) => {
  const e = Of().createApp(...t), { mount: n } = e;
  return e.mount = (s) => {
    const r = Mf(s);
    if (!r) return;
    const i = e._component;
    !me(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
    const o = n(r, !1, Nf(r));
    return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), o;
  }, e;
};
function Nf(t) {
  if (t instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && t instanceof MathMLElement)
    return "mathml";
}
function Mf(t) {
  return gt(t) ? document.querySelector(t) : t;
}
const Sn = (t) => {
  const e = t.replace("#", ""), n = parseInt(e.substr(0, 2), 16), s = parseInt(e.substr(2, 2), 16), r = parseInt(e.substr(4, 2), 16);
  return (n * 299 + s * 587 + r * 114) / 1e3 < 128;
}, Df = (t, e) => {
  const n = t.replace("#", ""), s = parseInt(n.substr(0, 2), 16), r = parseInt(n.substr(2, 2), 16), i = parseInt(n.substr(4, 2), 16), o = Sn(t), a = o ? Math.min(255, s + e) : Math.max(0, s - e), l = o ? Math.min(255, r + e) : Math.max(0, r - e), f = o ? Math.min(255, i + e) : Math.max(0, i - e);
  return `#${a.toString(16).padStart(2, "0")}${l.toString(16).padStart(2, "0")}${f.toString(16).padStart(2, "0")}`;
}, ds = (t) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t), Ff = (t) => {
  switch (t.type) {
    case "connection_error":
      return "Unable to connect. Please try again later.";
    case "auth_error":
      return "Authentication failed. Please refresh the page.";
    case "chat_error":
      return "Unable to send message. Please try again.";
    case "ai_config_missing":
      return "Chat service is currently unavailable.";
    default:
      return t.error || "Something went wrong. Please try again.";
  }
};
function Wi() {
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
var jn = Wi();
function kl(t) {
  jn = t;
}
var Os = { exec: () => null };
function Ue(t, e = "") {
  let n = typeof t == "string" ? t : t.source;
  const s = {
    replace: (r, i) => {
      let o = typeof i == "string" ? i : i.source;
      return o = o.replace(Lt.caret, "$1"), n = n.replace(r, o), s;
    },
    getRegex: () => new RegExp(n, e)
  };
  return s;
}
var Lt = {
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
  listItemRegex: (t) => new RegExp(`^( {0,3}${t})((?:[	 ][^\\n]*)?(?:\\n|$))`),
  nextBulletRegex: (t) => new RegExp(`^ {0,${Math.min(3, t - 1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),
  hrRegex: (t) => new RegExp(`^ {0,${Math.min(3, t - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),
  fencesBeginRegex: (t) => new RegExp(`^ {0,${Math.min(3, t - 1)}}(?:\`\`\`|~~~)`),
  headingBeginRegex: (t) => new RegExp(`^ {0,${Math.min(3, t - 1)}}#`),
  htmlBeginRegex: (t) => new RegExp(`^ {0,${Math.min(3, t - 1)}}<(?:[a-z].*>|!--)`, "i")
}, $f = /^(?:[ \t]*(?:\n|$))+/, Bf = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/, Uf = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, Us = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, zf = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, qi = /(?:[*+-]|\d{1,9}[.)])/, xl = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/, Tl = Ue(xl).replace(/bull/g, qi).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(), Hf = Ue(xl).replace(/bull/g, qi).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(), ji = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/, Wf = /^[^\n]+/, Vi = /(?!\s*\])(?:\\.|[^\[\]\\])+/, qf = Ue(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", Vi).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), jf = Ue(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, qi).getRegex(), Cr = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", Ki = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, Vf = Ue(
  "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))",
  "i"
).replace("comment", Ki).replace("tag", Cr).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), Sl = Ue(ji).replace("hr", Us).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Cr).getRegex(), Kf = Ue(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", Sl).getRegex(), Gi = {
  blockquote: Kf,
  code: Bf,
  def: qf,
  fences: Uf,
  heading: zf,
  hr: Us,
  html: Vf,
  lheading: Tl,
  list: jf,
  newline: $f,
  paragraph: Sl,
  table: Os,
  text: Wf
}, Xo = Ue(
  "^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"
).replace("hr", Us).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Cr).getRegex(), Gf = {
  ...Gi,
  lheading: Hf,
  table: Xo,
  paragraph: Ue(ji).replace("hr", Us).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", Xo).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Cr).getRegex()
}, Yf = {
  ...Gi,
  html: Ue(
    `^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`
  ).replace("comment", Ki).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
  heading: /^(#{1,6})(.*)(?:\n+|$)/,
  fences: Os,
  // fences not supported
  lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  paragraph: Ue(ji).replace("hr", Us).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", Tl).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
}, Zf = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, Xf = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, Al = /^( {2,}|\\)\n(?!\s*$)/, Jf = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, Rr = /[\p{P}\p{S}]/u, Yi = /[\s\p{P}\p{S}]/u, El = /[^\s\p{P}\p{S}]/u, Qf = Ue(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, Yi).getRegex(), Cl = /(?!~)[\p{P}\p{S}]/u, eh = /(?!~)[\s\p{P}\p{S}]/u, th = /(?:[^\s\p{P}\p{S}]|~)/u, nh = /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g, Rl = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/, sh = Ue(Rl, "u").replace(/punct/g, Rr).getRegex(), rh = Ue(Rl, "u").replace(/punct/g, Cl).getRegex(), Ll = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", ih = Ue(Ll, "gu").replace(/notPunctSpace/g, El).replace(/punctSpace/g, Yi).replace(/punct/g, Rr).getRegex(), oh = Ue(Ll, "gu").replace(/notPunctSpace/g, th).replace(/punctSpace/g, eh).replace(/punct/g, Cl).getRegex(), ah = Ue(
  "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)",
  "gu"
).replace(/notPunctSpace/g, El).replace(/punctSpace/g, Yi).replace(/punct/g, Rr).getRegex(), lh = Ue(/\\(punct)/, "gu").replace(/punct/g, Rr).getRegex(), ch = Ue(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), uh = Ue(Ki).replace("(?:-->|$)", "-->").getRegex(), fh = Ue(
  "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>"
).replace("comment", uh).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), gr = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/, hh = Ue(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", gr).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), Il = Ue(/^!?\[(label)\]\[(ref)\]/).replace("label", gr).replace("ref", Vi).getRegex(), Ol = Ue(/^!?\[(ref)\](?:\[\])?/).replace("ref", Vi).getRegex(), dh = Ue("reflink|nolink(?!\\()", "g").replace("reflink", Il).replace("nolink", Ol).getRegex(), Zi = {
  _backpedal: Os,
  // only used for GFM url
  anyPunctuation: lh,
  autolink: ch,
  blockSkip: nh,
  br: Al,
  code: Xf,
  del: Os,
  emStrongLDelim: sh,
  emStrongRDelimAst: ih,
  emStrongRDelimUnd: ah,
  escape: Zf,
  link: hh,
  nolink: Ol,
  punctuation: Qf,
  reflink: Il,
  reflinkSearch: dh,
  tag: fh,
  text: Jf,
  url: Os
}, ph = {
  ...Zi,
  link: Ue(/^!?\[(label)\]\((.*?)\)/).replace("label", gr).getRegex(),
  reflink: Ue(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", gr).getRegex()
}, pi = {
  ...Zi,
  emStrongRDelimAst: oh,
  emStrongLDelim: rh,
  url: Ue(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, "i").replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
  _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
}, gh = {
  ...pi,
  br: Ue(Al).replace("{2,}", "*").getRegex(),
  text: Ue(pi.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
}, Ks = {
  normal: Gi,
  gfm: Gf,
  pedantic: Yf
}, ps = {
  normal: Zi,
  gfm: pi,
  breaks: gh,
  pedantic: ph
}, mh = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}, Jo = (t) => mh[t];
function tn(t, e) {
  if (e) {
    if (Lt.escapeTest.test(t))
      return t.replace(Lt.escapeReplace, Jo);
  } else if (Lt.escapeTestNoEncode.test(t))
    return t.replace(Lt.escapeReplaceNoEncode, Jo);
  return t;
}
function Qo(t) {
  try {
    t = encodeURI(t).replace(Lt.percentDecode, "%");
  } catch {
    return null;
  }
  return t;
}
function ea(t, e) {
  var i;
  const n = t.replace(Lt.findPipe, (o, a, l) => {
    let f = !1, c = a;
    for (; --c >= 0 && l[c] === "\\"; ) f = !f;
    return f ? "|" : " |";
  }), s = n.split(Lt.splitPipe);
  let r = 0;
  if (s[0].trim() || s.shift(), s.length > 0 && !((i = s.at(-1)) != null && i.trim()) && s.pop(), e)
    if (s.length > e)
      s.splice(e);
    else
      for (; s.length < e; ) s.push("");
  for (; r < s.length; r++)
    s[r] = s[r].trim().replace(Lt.slashPipe, "|");
  return s;
}
function gs(t, e, n) {
  const s = t.length;
  if (s === 0)
    return "";
  let r = 0;
  for (; r < s && t.charAt(s - r - 1) === e; )
    r++;
  return t.slice(0, s - r);
}
function _h(t, e) {
  if (t.indexOf(e[1]) === -1)
    return -1;
  let n = 0;
  for (let s = 0; s < t.length; s++)
    if (t[s] === "\\")
      s++;
    else if (t[s] === e[0])
      n++;
    else if (t[s] === e[1] && (n--, n < 0))
      return s;
  return n > 0 ? -2 : -1;
}
function ta(t, e, n, s, r) {
  const i = e.href, o = e.title || null, a = t[1].replace(r.other.outputLinkReplace, "$1");
  s.state.inLink = !0;
  const l = {
    type: t[0].charAt(0) === "!" ? "image" : "link",
    raw: n,
    href: i,
    title: o,
    text: a,
    tokens: s.inlineTokens(a)
  };
  return s.state.inLink = !1, l;
}
function yh(t, e, n) {
  const s = t.match(n.other.indentCodeCompensation);
  if (s === null)
    return e;
  const r = s[1];
  return e.split(`
`).map((i) => {
    const o = i.match(n.other.beginningSpace);
    if (o === null)
      return i;
    const [a] = o;
    return a.length >= r.length ? i.slice(r.length) : i;
  }).join(`
`);
}
var mr = class {
  // set by the lexer
  constructor(t) {
    Ge(this, "options");
    Ge(this, "rules");
    // set by the lexer
    Ge(this, "lexer");
    this.options = t || jn;
  }
  space(t) {
    const e = this.rules.block.newline.exec(t);
    if (e && e[0].length > 0)
      return {
        type: "space",
        raw: e[0]
      };
  }
  code(t) {
    const e = this.rules.block.code.exec(t);
    if (e) {
      const n = e[0].replace(this.rules.other.codeRemoveIndent, "");
      return {
        type: "code",
        raw: e[0],
        codeBlockStyle: "indented",
        text: this.options.pedantic ? n : gs(n, `
`)
      };
    }
  }
  fences(t) {
    const e = this.rules.block.fences.exec(t);
    if (e) {
      const n = e[0], s = yh(n, e[3] || "", this.rules);
      return {
        type: "code",
        raw: n,
        lang: e[2] ? e[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : e[2],
        text: s
      };
    }
  }
  heading(t) {
    const e = this.rules.block.heading.exec(t);
    if (e) {
      let n = e[2].trim();
      if (this.rules.other.endingHash.test(n)) {
        const s = gs(n, "#");
        (this.options.pedantic || !s || this.rules.other.endingSpaceChar.test(s)) && (n = s.trim());
      }
      return {
        type: "heading",
        raw: e[0],
        depth: e[1].length,
        text: n,
        tokens: this.lexer.inline(n)
      };
    }
  }
  hr(t) {
    const e = this.rules.block.hr.exec(t);
    if (e)
      return {
        type: "hr",
        raw: gs(e[0], `
`)
      };
  }
  blockquote(t) {
    const e = this.rules.block.blockquote.exec(t);
    if (e) {
      let n = gs(e[0], `
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
          const D = v, $ = D.raw + `
` + n.join(`
`), Y = this.blockquote($);
          i[i.length - 1] = Y, s = s.substring(0, s.length - D.raw.length) + Y.raw, r = r.substring(0, r.length - D.text.length) + Y.text;
          break;
        } else if ((v == null ? void 0 : v.type) === "list") {
          const D = v, $ = D.raw + `
` + n.join(`
`), Y = this.list($);
          i[i.length - 1] = Y, s = s.substring(0, s.length - v.raw.length) + Y.raw, r = r.substring(0, r.length - D.raw.length) + Y.raw, n = $.substring(i.at(-1).raw.length).split(`
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
  list(t) {
    let e = this.rules.block.list.exec(t);
    if (e) {
      let n = e[1].trim();
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
      for (; t; ) {
        let l = !1, f = "", c = "";
        if (!(e = i.exec(t)) || this.rules.block.hr.test(t))
          break;
        f = e[0], t = t.substring(f.length);
        let b = e[2].split(`
`, 1)[0].replace(this.rules.other.listReplaceTabs, (ne) => " ".repeat(3 * ne.length)), v = t.split(`
`, 1)[0], D = !b.trim(), $ = 0;
        if (this.options.pedantic ? ($ = 2, c = b.trimStart()) : D ? $ = e[1].length + 1 : ($ = e[2].search(this.rules.other.nonSpaceChar), $ = $ > 4 ? 1 : $, c = b.slice($), $ += e[1].length), D && this.rules.other.blankLine.test(v) && (f += v + `
`, t = t.substring(v.length + 1), l = !0), !l) {
          const ne = this.rules.other.nextBulletRegex($), Se = this.rules.other.hrRegex($), we = this.rules.other.fencesBeginRegex($), U = this.rules.other.headingBeginRegex($), H = this.rules.other.htmlBeginRegex($);
          for (; t; ) {
            const Q = t.split(`
`, 1)[0];
            let j;
            if (v = Q, this.options.pedantic ? (v = v.replace(this.rules.other.listReplaceNesting, "  "), j = v) : j = v.replace(this.rules.other.tabCharGlobal, "    "), we.test(v) || U.test(v) || H.test(v) || ne.test(v) || Se.test(v))
              break;
            if (j.search(this.rules.other.nonSpaceChar) >= $ || !v.trim())
              c += `
` + j.slice($);
            else {
              if (D || b.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || we.test(b) || U.test(b) || Se.test(b))
                break;
              c += `
` + v;
            }
            !D && !v.trim() && (D = !0), f += Q + `
`, t = t.substring(Q.length + 1), b = j.slice($);
          }
        }
        r.loose || (o ? r.loose = !0 : this.rules.other.doubleBlankLine.test(f) && (o = !0));
        let Y = null, Ae;
        this.options.gfm && (Y = this.rules.other.listIsTask.exec(c), Y && (Ae = Y[0] !== "[ ] ", c = c.replace(this.rules.other.listReplaceTask, ""))), r.items.push({
          type: "list_item",
          raw: f,
          task: !!Y,
          checked: Ae,
          loose: !1,
          text: c,
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
          const f = r.items[l].tokens.filter((b) => b.type === "space"), c = f.length > 0 && f.some((b) => this.rules.other.anyLine.test(b.raw));
          r.loose = c;
        }
      if (r.loose)
        for (let l = 0; l < r.items.length; l++)
          r.items[l].loose = !0;
      return r;
    }
  }
  html(t) {
    const e = this.rules.block.html.exec(t);
    if (e)
      return {
        type: "html",
        block: !0,
        raw: e[0],
        pre: e[1] === "pre" || e[1] === "script" || e[1] === "style",
        text: e[0]
      };
  }
  def(t) {
    const e = this.rules.block.def.exec(t);
    if (e) {
      const n = e[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal, " "), s = e[2] ? e[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "", r = e[3] ? e[3].substring(1, e[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : e[3];
      return {
        type: "def",
        tag: n,
        raw: e[0],
        href: s,
        title: r
      };
    }
  }
  table(t) {
    var o;
    const e = this.rules.block.table.exec(t);
    if (!e || !this.rules.other.tableDelimiter.test(e[2]))
      return;
    const n = ea(e[1]), s = e[2].replace(this.rules.other.tableAlignChars, "").split("|"), r = (o = e[3]) != null && o.trim() ? e[3].replace(this.rules.other.tableRowBlankLine, "").split(`
`) : [], i = {
      type: "table",
      raw: e[0],
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
        i.rows.push(ea(a, i.header.length).map((l, f) => ({
          text: l,
          tokens: this.lexer.inline(l),
          header: !1,
          align: i.align[f]
        })));
      return i;
    }
  }
  lheading(t) {
    const e = this.rules.block.lheading.exec(t);
    if (e)
      return {
        type: "heading",
        raw: e[0],
        depth: e[2].charAt(0) === "=" ? 1 : 2,
        text: e[1],
        tokens: this.lexer.inline(e[1])
      };
  }
  paragraph(t) {
    const e = this.rules.block.paragraph.exec(t);
    if (e) {
      const n = e[1].charAt(e[1].length - 1) === `
` ? e[1].slice(0, -1) : e[1];
      return {
        type: "paragraph",
        raw: e[0],
        text: n,
        tokens: this.lexer.inline(n)
      };
    }
  }
  text(t) {
    const e = this.rules.block.text.exec(t);
    if (e)
      return {
        type: "text",
        raw: e[0],
        text: e[0],
        tokens: this.lexer.inline(e[0])
      };
  }
  escape(t) {
    const e = this.rules.inline.escape.exec(t);
    if (e)
      return {
        type: "escape",
        raw: e[0],
        text: e[1]
      };
  }
  tag(t) {
    const e = this.rules.inline.tag.exec(t);
    if (e)
      return !this.lexer.state.inLink && this.rules.other.startATag.test(e[0]) ? this.lexer.state.inLink = !0 : this.lexer.state.inLink && this.rules.other.endATag.test(e[0]) && (this.lexer.state.inLink = !1), !this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(e[0]) ? this.lexer.state.inRawBlock = !0 : this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(e[0]) && (this.lexer.state.inRawBlock = !1), {
        type: "html",
        raw: e[0],
        inLink: this.lexer.state.inLink,
        inRawBlock: this.lexer.state.inRawBlock,
        block: !1,
        text: e[0]
      };
  }
  link(t) {
    const e = this.rules.inline.link.exec(t);
    if (e) {
      const n = e[2].trim();
      if (!this.options.pedantic && this.rules.other.startAngleBracket.test(n)) {
        if (!this.rules.other.endAngleBracket.test(n))
          return;
        const i = gs(n.slice(0, -1), "\\");
        if ((n.length - i.length) % 2 === 0)
          return;
      } else {
        const i = _h(e[2], "()");
        if (i === -2)
          return;
        if (i > -1) {
          const a = (e[0].indexOf("!") === 0 ? 5 : 4) + e[1].length + i;
          e[2] = e[2].substring(0, i), e[0] = e[0].substring(0, a).trim(), e[3] = "";
        }
      }
      let s = e[2], r = "";
      if (this.options.pedantic) {
        const i = this.rules.other.pedanticHrefTitle.exec(s);
        i && (s = i[1], r = i[3]);
      } else
        r = e[3] ? e[3].slice(1, -1) : "";
      return s = s.trim(), this.rules.other.startAngleBracket.test(s) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n) ? s = s.slice(1) : s = s.slice(1, -1)), ta(e, {
        href: s && s.replace(this.rules.inline.anyPunctuation, "$1"),
        title: r && r.replace(this.rules.inline.anyPunctuation, "$1")
      }, e[0], this.lexer, this.rules);
    }
  }
  reflink(t, e) {
    let n;
    if ((n = this.rules.inline.reflink.exec(t)) || (n = this.rules.inline.nolink.exec(t))) {
      const s = (n[2] || n[1]).replace(this.rules.other.multipleSpaceGlobal, " "), r = e[s.toLowerCase()];
      if (!r) {
        const i = n[0].charAt(0);
        return {
          type: "text",
          raw: i,
          text: i
        };
      }
      return ta(n, r, n[0], this.lexer, this.rules);
    }
  }
  emStrong(t, e, n = "") {
    let s = this.rules.inline.emStrongLDelim.exec(t);
    if (!s || s[3] && n.match(this.rules.other.unicodeAlphaNumeric)) return;
    if (!(s[1] || s[2] || "") || !n || this.rules.inline.punctuation.exec(n)) {
      const i = [...s[0]].length - 1;
      let o, a, l = i, f = 0;
      const c = s[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      for (c.lastIndex = 0, e = e.slice(-1 * t.length + i); (s = c.exec(e)) != null; ) {
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
        const b = [...s[0]][0].length, v = t.slice(0, i + s.index + b + a);
        if (Math.min(i, a) % 2) {
          const $ = v.slice(1, -1);
          return {
            type: "em",
            raw: v,
            text: $,
            tokens: this.lexer.inlineTokens($)
          };
        }
        const D = v.slice(2, -2);
        return {
          type: "strong",
          raw: v,
          text: D,
          tokens: this.lexer.inlineTokens(D)
        };
      }
    }
  }
  codespan(t) {
    const e = this.rules.inline.code.exec(t);
    if (e) {
      let n = e[2].replace(this.rules.other.newLineCharGlobal, " ");
      const s = this.rules.other.nonSpaceChar.test(n), r = this.rules.other.startingSpaceChar.test(n) && this.rules.other.endingSpaceChar.test(n);
      return s && r && (n = n.substring(1, n.length - 1)), {
        type: "codespan",
        raw: e[0],
        text: n
      };
    }
  }
  br(t) {
    const e = this.rules.inline.br.exec(t);
    if (e)
      return {
        type: "br",
        raw: e[0]
      };
  }
  del(t) {
    const e = this.rules.inline.del.exec(t);
    if (e)
      return {
        type: "del",
        raw: e[0],
        text: e[2],
        tokens: this.lexer.inlineTokens(e[2])
      };
  }
  autolink(t) {
    const e = this.rules.inline.autolink.exec(t);
    if (e) {
      let n, s;
      return e[2] === "@" ? (n = e[1], s = "mailto:" + n) : (n = e[1], s = n), {
        type: "link",
        raw: e[0],
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
  url(t) {
    var n;
    let e;
    if (e = this.rules.inline.url.exec(t)) {
      let s, r;
      if (e[2] === "@")
        s = e[0], r = "mailto:" + s;
      else {
        let i;
        do
          i = e[0], e[0] = ((n = this.rules.inline._backpedal.exec(e[0])) == null ? void 0 : n[0]) ?? "";
        while (i !== e[0]);
        s = e[0], e[1] === "www." ? r = "http://" + e[0] : r = e[0];
      }
      return {
        type: "link",
        raw: e[0],
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
  inlineText(t) {
    const e = this.rules.inline.text.exec(t);
    if (e) {
      const n = this.lexer.state.inRawBlock;
      return {
        type: "text",
        raw: e[0],
        text: e[0],
        escaped: n
      };
    }
  }
}, _n = class gi {
  constructor(e) {
    Ge(this, "tokens");
    Ge(this, "options");
    Ge(this, "state");
    Ge(this, "tokenizer");
    Ge(this, "inlineQueue");
    this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = e || jn, this.options.tokenizer = this.options.tokenizer || new mr(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = {
      inLink: !1,
      inRawBlock: !1,
      top: !0
    };
    const n = {
      other: Lt,
      block: Ks.normal,
      inline: ps.normal
    };
    this.options.pedantic ? (n.block = Ks.pedantic, n.inline = ps.pedantic) : this.options.gfm && (n.block = Ks.gfm, this.options.breaks ? n.inline = ps.breaks : n.inline = ps.gfm), this.tokenizer.rules = n;
  }
  /**
   * Expose Rules
   */
  static get rules() {
    return {
      block: Ks,
      inline: ps
    };
  }
  /**
   * Static Lex Method
   */
  static lex(e, n) {
    return new gi(n).lex(e);
  }
  /**
   * Static Lex Inline Method
   */
  static lexInline(e, n) {
    return new gi(n).inlineTokens(e);
  }
  /**
   * Preprocessing
   */
  lex(e) {
    e = e.replace(Lt.carriageReturn, `
`), this.blockTokens(e, this.tokens);
    for (let n = 0; n < this.inlineQueue.length; n++) {
      const s = this.inlineQueue[n];
      this.inlineTokens(s.src, s.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(e, n = [], s = !1) {
    var r, i, o;
    for (this.options.pedantic && (e = e.replace(Lt.tabCharGlobal, "    ").replace(Lt.spaceLine, "")); e; ) {
      let a;
      if ((i = (r = this.options.extensions) == null ? void 0 : r.block) != null && i.some((f) => (a = f.call({ lexer: this }, e, n)) ? (e = e.substring(a.raw.length), n.push(a), !0) : !1))
        continue;
      if (a = this.tokenizer.space(e)) {
        e = e.substring(a.raw.length);
        const f = n.at(-1);
        a.raw.length === 1 && f !== void 0 ? f.raw += `
` : n.push(a);
        continue;
      }
      if (a = this.tokenizer.code(e)) {
        e = e.substring(a.raw.length);
        const f = n.at(-1);
        (f == null ? void 0 : f.type) === "paragraph" || (f == null ? void 0 : f.type) === "text" ? (f.raw += `
` + a.raw, f.text += `
` + a.text, this.inlineQueue.at(-1).src = f.text) : n.push(a);
        continue;
      }
      if (a = this.tokenizer.fences(e)) {
        e = e.substring(a.raw.length), n.push(a);
        continue;
      }
      if (a = this.tokenizer.heading(e)) {
        e = e.substring(a.raw.length), n.push(a);
        continue;
      }
      if (a = this.tokenizer.hr(e)) {
        e = e.substring(a.raw.length), n.push(a);
        continue;
      }
      if (a = this.tokenizer.blockquote(e)) {
        e = e.substring(a.raw.length), n.push(a);
        continue;
      }
      if (a = this.tokenizer.list(e)) {
        e = e.substring(a.raw.length), n.push(a);
        continue;
      }
      if (a = this.tokenizer.html(e)) {
        e = e.substring(a.raw.length), n.push(a);
        continue;
      }
      if (a = this.tokenizer.def(e)) {
        e = e.substring(a.raw.length);
        const f = n.at(-1);
        (f == null ? void 0 : f.type) === "paragraph" || (f == null ? void 0 : f.type) === "text" ? (f.raw += `
` + a.raw, f.text += `
` + a.raw, this.inlineQueue.at(-1).src = f.text) : this.tokens.links[a.tag] || (this.tokens.links[a.tag] = {
          href: a.href,
          title: a.title
        });
        continue;
      }
      if (a = this.tokenizer.table(e)) {
        e = e.substring(a.raw.length), n.push(a);
        continue;
      }
      if (a = this.tokenizer.lheading(e)) {
        e = e.substring(a.raw.length), n.push(a);
        continue;
      }
      let l = e;
      if ((o = this.options.extensions) != null && o.startBlock) {
        let f = 1 / 0;
        const c = e.slice(1);
        let b;
        this.options.extensions.startBlock.forEach((v) => {
          b = v.call({ lexer: this }, c), typeof b == "number" && b >= 0 && (f = Math.min(f, b));
        }), f < 1 / 0 && f >= 0 && (l = e.substring(0, f + 1));
      }
      if (this.state.top && (a = this.tokenizer.paragraph(l))) {
        const f = n.at(-1);
        s && (f == null ? void 0 : f.type) === "paragraph" ? (f.raw += `
` + a.raw, f.text += `
` + a.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = f.text) : n.push(a), s = l.length !== e.length, e = e.substring(a.raw.length);
        continue;
      }
      if (a = this.tokenizer.text(e)) {
        e = e.substring(a.raw.length);
        const f = n.at(-1);
        (f == null ? void 0 : f.type) === "text" ? (f.raw += `
` + a.raw, f.text += `
` + a.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = f.text) : n.push(a);
        continue;
      }
      if (e) {
        const f = "Infinite loop on byte: " + e.charCodeAt(0);
        if (this.options.silent) {
          console.error(f);
          break;
        } else
          throw new Error(f);
      }
    }
    return this.state.top = !0, n;
  }
  inline(e, n = []) {
    return this.inlineQueue.push({ src: e, tokens: n }), n;
  }
  /**
   * Lexing/Compiling
   */
  inlineTokens(e, n = []) {
    var a, l, f;
    let s = e, r = null;
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
    for (; e; ) {
      i || (o = ""), i = !1;
      let c;
      if ((l = (a = this.options.extensions) == null ? void 0 : a.inline) != null && l.some((v) => (c = v.call({ lexer: this }, e, n)) ? (e = e.substring(c.raw.length), n.push(c), !0) : !1))
        continue;
      if (c = this.tokenizer.escape(e)) {
        e = e.substring(c.raw.length), n.push(c);
        continue;
      }
      if (c = this.tokenizer.tag(e)) {
        e = e.substring(c.raw.length), n.push(c);
        continue;
      }
      if (c = this.tokenizer.link(e)) {
        e = e.substring(c.raw.length), n.push(c);
        continue;
      }
      if (c = this.tokenizer.reflink(e, this.tokens.links)) {
        e = e.substring(c.raw.length);
        const v = n.at(-1);
        c.type === "text" && (v == null ? void 0 : v.type) === "text" ? (v.raw += c.raw, v.text += c.text) : n.push(c);
        continue;
      }
      if (c = this.tokenizer.emStrong(e, s, o)) {
        e = e.substring(c.raw.length), n.push(c);
        continue;
      }
      if (c = this.tokenizer.codespan(e)) {
        e = e.substring(c.raw.length), n.push(c);
        continue;
      }
      if (c = this.tokenizer.br(e)) {
        e = e.substring(c.raw.length), n.push(c);
        continue;
      }
      if (c = this.tokenizer.del(e)) {
        e = e.substring(c.raw.length), n.push(c);
        continue;
      }
      if (c = this.tokenizer.autolink(e)) {
        e = e.substring(c.raw.length), n.push(c);
        continue;
      }
      if (!this.state.inLink && (c = this.tokenizer.url(e))) {
        e = e.substring(c.raw.length), n.push(c);
        continue;
      }
      let b = e;
      if ((f = this.options.extensions) != null && f.startInline) {
        let v = 1 / 0;
        const D = e.slice(1);
        let $;
        this.options.extensions.startInline.forEach((Y) => {
          $ = Y.call({ lexer: this }, D), typeof $ == "number" && $ >= 0 && (v = Math.min(v, $));
        }), v < 1 / 0 && v >= 0 && (b = e.substring(0, v + 1));
      }
      if (c = this.tokenizer.inlineText(b)) {
        e = e.substring(c.raw.length), c.raw.slice(-1) !== "_" && (o = c.raw.slice(-1)), i = !0;
        const v = n.at(-1);
        (v == null ? void 0 : v.type) === "text" ? (v.raw += c.raw, v.text += c.text) : n.push(c);
        continue;
      }
      if (e) {
        const v = "Infinite loop on byte: " + e.charCodeAt(0);
        if (this.options.silent) {
          console.error(v);
          break;
        } else
          throw new Error(v);
      }
    }
    return n;
  }
}, _r = class {
  // set by the parser
  constructor(t) {
    Ge(this, "options");
    Ge(this, "parser");
    this.options = t || jn;
  }
  space(t) {
    return "";
  }
  code({ text: t, lang: e, escaped: n }) {
    var i;
    const s = (i = (e || "").match(Lt.notSpaceStart)) == null ? void 0 : i[0], r = t.replace(Lt.endingNewline, "") + `
`;
    return s ? '<pre><code class="language-' + tn(s) + '">' + (n ? r : tn(r, !0)) + `</code></pre>
` : "<pre><code>" + (n ? r : tn(r, !0)) + `</code></pre>
`;
  }
  blockquote({ tokens: t }) {
    return `<blockquote>
${this.parser.parse(t)}</blockquote>
`;
  }
  html({ text: t }) {
    return t;
  }
  heading({ tokens: t, depth: e }) {
    return `<h${e}>${this.parser.parseInline(t)}</h${e}>
`;
  }
  hr(t) {
    return `<hr>
`;
  }
  list(t) {
    const e = t.ordered, n = t.start;
    let s = "";
    for (let o = 0; o < t.items.length; o++) {
      const a = t.items[o];
      s += this.listitem(a);
    }
    const r = e ? "ol" : "ul", i = e && n !== 1 ? ' start="' + n + '"' : "";
    return "<" + r + i + `>
` + s + "</" + r + `>
`;
  }
  listitem(t) {
    var n;
    let e = "";
    if (t.task) {
      const s = this.checkbox({ checked: !!t.checked });
      t.loose ? ((n = t.tokens[0]) == null ? void 0 : n.type) === "paragraph" ? (t.tokens[0].text = s + " " + t.tokens[0].text, t.tokens[0].tokens && t.tokens[0].tokens.length > 0 && t.tokens[0].tokens[0].type === "text" && (t.tokens[0].tokens[0].text = s + " " + tn(t.tokens[0].tokens[0].text), t.tokens[0].tokens[0].escaped = !0)) : t.tokens.unshift({
        type: "text",
        raw: s + " ",
        text: s + " ",
        escaped: !0
      }) : e += s + " ";
    }
    return e += this.parser.parse(t.tokens, !!t.loose), `<li>${e}</li>
`;
  }
  checkbox({ checked: t }) {
    return "<input " + (t ? 'checked="" ' : "") + 'disabled="" type="checkbox">';
  }
  paragraph({ tokens: t }) {
    return `<p>${this.parser.parseInline(t)}</p>
`;
  }
  table(t) {
    let e = "", n = "";
    for (let r = 0; r < t.header.length; r++)
      n += this.tablecell(t.header[r]);
    e += this.tablerow({ text: n });
    let s = "";
    for (let r = 0; r < t.rows.length; r++) {
      const i = t.rows[r];
      n = "";
      for (let o = 0; o < i.length; o++)
        n += this.tablecell(i[o]);
      s += this.tablerow({ text: n });
    }
    return s && (s = `<tbody>${s}</tbody>`), `<table>
<thead>
` + e + `</thead>
` + s + `</table>
`;
  }
  tablerow({ text: t }) {
    return `<tr>
${t}</tr>
`;
  }
  tablecell(t) {
    const e = this.parser.parseInline(t.tokens), n = t.header ? "th" : "td";
    return (t.align ? `<${n} align="${t.align}">` : `<${n}>`) + e + `</${n}>
`;
  }
  /**
   * span level renderer
   */
  strong({ tokens: t }) {
    return `<strong>${this.parser.parseInline(t)}</strong>`;
  }
  em({ tokens: t }) {
    return `<em>${this.parser.parseInline(t)}</em>`;
  }
  codespan({ text: t }) {
    return `<code>${tn(t, !0)}</code>`;
  }
  br(t) {
    return "<br>";
  }
  del({ tokens: t }) {
    return `<del>${this.parser.parseInline(t)}</del>`;
  }
  link({ href: t, title: e, tokens: n }) {
    const s = this.parser.parseInline(n), r = Qo(t);
    if (r === null)
      return s;
    t = r;
    let i = '<a href="' + t + '"';
    return e && (i += ' title="' + tn(e) + '"'), i += ">" + s + "</a>", i;
  }
  image({ href: t, title: e, text: n, tokens: s }) {
    s && (n = this.parser.parseInline(s, this.parser.textRenderer));
    const r = Qo(t);
    if (r === null)
      return tn(n);
    t = r;
    let i = `<img src="${t}" alt="${n}"`;
    return e && (i += ` title="${tn(e)}"`), i += ">", i;
  }
  text(t) {
    return "tokens" in t && t.tokens ? this.parser.parseInline(t.tokens) : "escaped" in t && t.escaped ? t.text : tn(t.text);
  }
}, Xi = class {
  // no need for block level renderers
  strong({ text: t }) {
    return t;
  }
  em({ text: t }) {
    return t;
  }
  codespan({ text: t }) {
    return t;
  }
  del({ text: t }) {
    return t;
  }
  html({ text: t }) {
    return t;
  }
  text({ text: t }) {
    return t;
  }
  link({ text: t }) {
    return "" + t;
  }
  image({ text: t }) {
    return "" + t;
  }
  br() {
    return "";
  }
}, yn = class mi {
  constructor(e) {
    Ge(this, "options");
    Ge(this, "renderer");
    Ge(this, "textRenderer");
    this.options = e || jn, this.options.renderer = this.options.renderer || new _r(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new Xi();
  }
  /**
   * Static Parse Method
   */
  static parse(e, n) {
    return new mi(n).parse(e);
  }
  /**
   * Static Parse Inline Method
   */
  static parseInline(e, n) {
    return new mi(n).parseInline(e);
  }
  /**
   * Parse Loop
   */
  parse(e, n = !0) {
    var r, i;
    let s = "";
    for (let o = 0; o < e.length; o++) {
      const a = e[o];
      if ((i = (r = this.options.extensions) == null ? void 0 : r.renderers) != null && i[a.type]) {
        const f = a, c = this.options.extensions.renderers[f.type].call({ parser: this }, f);
        if (c !== !1 || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "paragraph", "text"].includes(f.type)) {
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
          let f = l, c = this.renderer.text(f);
          for (; o + 1 < e.length && e[o + 1].type === "text"; )
            f = e[++o], c += `
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
  parseInline(e, n = this.renderer) {
    var r, i;
    let s = "";
    for (let o = 0; o < e.length; o++) {
      const a = e[o];
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
}, ti, sr = (ti = class {
  constructor(t) {
    Ge(this, "options");
    Ge(this, "block");
    this.options = t || jn;
  }
  /**
   * Process markdown before marked
   */
  preprocess(t) {
    return t;
  }
  /**
   * Process HTML after marked is finished
   */
  postprocess(t) {
    return t;
  }
  /**
   * Process all tokens before walk tokens
   */
  processAllTokens(t) {
    return t;
  }
  /**
   * Provide function to tokenize markdown
   */
  provideLexer() {
    return this.block ? _n.lex : _n.lexInline;
  }
  /**
   * Provide function to parse tokens
   */
  provideParser() {
    return this.block ? yn.parse : yn.parseInline;
  }
}, Ge(ti, "passThroughHooks", /* @__PURE__ */ new Set([
  "preprocess",
  "postprocess",
  "processAllTokens"
])), ti), vh = class {
  constructor(...t) {
    Ge(this, "defaults", Wi());
    Ge(this, "options", this.setOptions);
    Ge(this, "parse", this.parseMarkdown(!0));
    Ge(this, "parseInline", this.parseMarkdown(!1));
    Ge(this, "Parser", yn);
    Ge(this, "Renderer", _r);
    Ge(this, "TextRenderer", Xi);
    Ge(this, "Lexer", _n);
    Ge(this, "Tokenizer", mr);
    Ge(this, "Hooks", sr);
    this.use(...t);
  }
  /**
   * Run callback for every token
   */
  walkTokens(t, e) {
    var s, r;
    let n = [];
    for (const i of t)
      switch (n = n.concat(e.call(this, i)), i.type) {
        case "table": {
          const o = i;
          for (const a of o.header)
            n = n.concat(this.walkTokens(a.tokens, e));
          for (const a of o.rows)
            for (const l of a)
              n = n.concat(this.walkTokens(l.tokens, e));
          break;
        }
        case "list": {
          const o = i;
          n = n.concat(this.walkTokens(o.items, e));
          break;
        }
        default: {
          const o = i;
          (r = (s = this.defaults.extensions) == null ? void 0 : s.childTokens) != null && r[o.type] ? this.defaults.extensions.childTokens[o.type].forEach((a) => {
            const l = o[a].flat(1 / 0);
            n = n.concat(this.walkTokens(l, e));
          }) : o.tokens && (n = n.concat(this.walkTokens(o.tokens, e)));
        }
      }
    return n;
  }
  use(...t) {
    const e = this.defaults.extensions || { renderers: {}, childTokens: {} };
    return t.forEach((n) => {
      const s = { ...n };
      if (s.async = this.defaults.async || s.async || !1, n.extensions && (n.extensions.forEach((r) => {
        if (!r.name)
          throw new Error("extension name required");
        if ("renderer" in r) {
          const i = e.renderers[r.name];
          i ? e.renderers[r.name] = function(...o) {
            let a = r.renderer.apply(this, o);
            return a === !1 && (a = i.apply(this, o)), a;
          } : e.renderers[r.name] = r.renderer;
        }
        if ("tokenizer" in r) {
          if (!r.level || r.level !== "block" && r.level !== "inline")
            throw new Error("extension level must be 'block' or 'inline'");
          const i = e[r.level];
          i ? i.unshift(r.tokenizer) : e[r.level] = [r.tokenizer], r.start && (r.level === "block" ? e.startBlock ? e.startBlock.push(r.start) : e.startBlock = [r.start] : r.level === "inline" && (e.startInline ? e.startInline.push(r.start) : e.startInline = [r.start]));
        }
        "childTokens" in r && r.childTokens && (e.childTokens[r.name] = r.childTokens);
      }), s.extensions = e), n.renderer) {
        const r = this.defaults.renderer || new _r(this.defaults);
        for (const i in n.renderer) {
          if (!(i in r))
            throw new Error(`renderer '${i}' does not exist`);
          if (["options", "parser"].includes(i))
            continue;
          const o = i, a = n.renderer[o], l = r[o];
          r[o] = (...f) => {
            let c = a.apply(r, f);
            return c === !1 && (c = l.apply(r, f)), c || "";
          };
        }
        s.renderer = r;
      }
      if (n.tokenizer) {
        const r = this.defaults.tokenizer || new mr(this.defaults);
        for (const i in n.tokenizer) {
          if (!(i in r))
            throw new Error(`tokenizer '${i}' does not exist`);
          if (["options", "rules", "lexer"].includes(i))
            continue;
          const o = i, a = n.tokenizer[o], l = r[o];
          r[o] = (...f) => {
            let c = a.apply(r, f);
            return c === !1 && (c = l.apply(r, f)), c;
          };
        }
        s.tokenizer = r;
      }
      if (n.hooks) {
        const r = this.defaults.hooks || new sr();
        for (const i in n.hooks) {
          if (!(i in r))
            throw new Error(`hook '${i}' does not exist`);
          if (["options", "block"].includes(i))
            continue;
          const o = i, a = n.hooks[o], l = r[o];
          sr.passThroughHooks.has(i) ? r[o] = (f) => {
            if (this.defaults.async)
              return Promise.resolve(a.call(r, f)).then((b) => l.call(r, b));
            const c = a.call(r, f);
            return l.call(r, c);
          } : r[o] = (...f) => {
            let c = a.apply(r, f);
            return c === !1 && (c = l.apply(r, f)), c;
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
  setOptions(t) {
    return this.defaults = { ...this.defaults, ...t }, this;
  }
  lexer(t, e) {
    return _n.lex(t, e ?? this.defaults);
  }
  parser(t, e) {
    return yn.parse(t, e ?? this.defaults);
  }
  parseMarkdown(t) {
    return (n, s) => {
      const r = { ...s }, i = { ...this.defaults, ...r }, o = this.onError(!!i.silent, !!i.async);
      if (this.defaults.async === !0 && r.async === !1)
        return o(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
      if (typeof n > "u" || n === null)
        return o(new Error("marked(): input parameter is undefined or null"));
      if (typeof n != "string")
        return o(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(n) + ", string expected"));
      i.hooks && (i.hooks.options = i, i.hooks.block = t);
      const a = i.hooks ? i.hooks.provideLexer() : t ? _n.lex : _n.lexInline, l = i.hooks ? i.hooks.provideParser() : t ? yn.parse : yn.parseInline;
      if (i.async)
        return Promise.resolve(i.hooks ? i.hooks.preprocess(n) : n).then((f) => a(f, i)).then((f) => i.hooks ? i.hooks.processAllTokens(f) : f).then((f) => i.walkTokens ? Promise.all(this.walkTokens(f, i.walkTokens)).then(() => f) : f).then((f) => l(f, i)).then((f) => i.hooks ? i.hooks.postprocess(f) : f).catch(o);
      try {
        i.hooks && (n = i.hooks.preprocess(n));
        let f = a(n, i);
        i.hooks && (f = i.hooks.processAllTokens(f)), i.walkTokens && this.walkTokens(f, i.walkTokens);
        let c = l(f, i);
        return i.hooks && (c = i.hooks.postprocess(c)), c;
      } catch (f) {
        return o(f);
      }
    };
  }
  onError(t, e) {
    return (n) => {
      if (n.message += `
Please report this to https://github.com/markedjs/marked.`, t) {
        const s = "<p>An error occurred:</p><pre>" + tn(n.message + "", !0) + "</pre>";
        return e ? Promise.resolve(s) : s;
      }
      if (e)
        return Promise.reject(n);
      throw n;
    };
  }
}, qn = new vh();
function Re(t, e) {
  return qn.parse(t, e);
}
Re.options = Re.setOptions = function(t) {
  return qn.setOptions(t), Re.defaults = qn.defaults, kl(Re.defaults), Re;
};
Re.getDefaults = Wi;
Re.defaults = jn;
Re.use = function(...t) {
  return qn.use(...t), Re.defaults = qn.defaults, kl(Re.defaults), Re;
};
Re.walkTokens = function(t, e) {
  return qn.walkTokens(t, e);
};
Re.parseInline = qn.parseInline;
Re.Parser = yn;
Re.parser = yn.parse;
Re.Renderer = _r;
Re.TextRenderer = Xi;
Re.Lexer = _n;
Re.lexer = _n.lex;
Re.Tokenizer = mr;
Re.Hooks = sr;
Re.parse = Re;
Re.options;
Re.setOptions;
Re.use;
Re.walkTokens;
Re.parseInline;
yn.parse;
_n.lex;
/*! @license DOMPurify 3.2.6 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.2.6/LICENSE */
const {
  entries: Pl,
  setPrototypeOf: na,
  isFrozen: bh,
  getPrototypeOf: wh,
  getOwnPropertyDescriptor: kh
} = Object;
let {
  freeze: It,
  seal: Vt,
  create: Nl
} = Object, {
  apply: _i,
  construct: yi
} = typeof Reflect < "u" && Reflect;
It || (It = function(e) {
  return e;
});
Vt || (Vt = function(e) {
  return e;
});
_i || (_i = function(e, n, s) {
  return e.apply(n, s);
});
yi || (yi = function(e, n) {
  return new e(...n);
});
const Gs = Ot(Array.prototype.forEach), xh = Ot(Array.prototype.lastIndexOf), sa = Ot(Array.prototype.pop), ms = Ot(Array.prototype.push), Th = Ot(Array.prototype.splice), rr = Ot(String.prototype.toLowerCase), Vr = Ot(String.prototype.toString), ra = Ot(String.prototype.match), _s = Ot(String.prototype.replace), Sh = Ot(String.prototype.indexOf), Ah = Ot(String.prototype.trim), Zt = Ot(Object.prototype.hasOwnProperty), At = Ot(RegExp.prototype.test), ys = Eh(TypeError);
function Ot(t) {
  return function(e) {
    e instanceof RegExp && (e.lastIndex = 0);
    for (var n = arguments.length, s = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
      s[r - 1] = arguments[r];
    return _i(t, e, s);
  };
}
function Eh(t) {
  return function() {
    for (var e = arguments.length, n = new Array(e), s = 0; s < e; s++)
      n[s] = arguments[s];
    return yi(t, n);
  };
}
function Te(t, e) {
  let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : rr;
  na && na(t, null);
  let s = e.length;
  for (; s--; ) {
    let r = e[s];
    if (typeof r == "string") {
      const i = n(r);
      i !== r && (bh(e) || (e[s] = i), r = i);
    }
    t[r] = !0;
  }
  return t;
}
function Ch(t) {
  for (let e = 0; e < t.length; e++)
    Zt(t, e) || (t[e] = null);
  return t;
}
function dn(t) {
  const e = Nl(null);
  for (const [n, s] of Pl(t))
    Zt(t, n) && (Array.isArray(s) ? e[n] = Ch(s) : s && typeof s == "object" && s.constructor === Object ? e[n] = dn(s) : e[n] = s);
  return e;
}
function vs(t, e) {
  for (; t !== null; ) {
    const s = kh(t, e);
    if (s) {
      if (s.get)
        return Ot(s.get);
      if (typeof s.value == "function")
        return Ot(s.value);
    }
    t = wh(t);
  }
  function n() {
    return null;
  }
  return n;
}
const ia = It(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "section", "select", "shadow", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]), Kr = It(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]), Gr = It(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]), Rh = It(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]), Yr = It(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]), Lh = It(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]), oa = It(["#text"]), aa = It(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns", "slot"]), Zr = It(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]), la = It(["accent", "accentunder", "align", "bevelled", "close", "columnsalign", "columnlines", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lspace", "lquote", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]), Ys = It(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]), Ih = Vt(/\{\{[\w\W]*|[\w\W]*\}\}/gm), Oh = Vt(/<%[\w\W]*|[\w\W]*%>/gm), Ph = Vt(/\$\{[\w\W]*/gm), Nh = Vt(/^data-[\-\w.\u00B7-\uFFFF]+$/), Mh = Vt(/^aria-[\-\w]+$/), Ml = Vt(
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  // eslint-disable-line no-useless-escape
), Dh = Vt(/^(?:\w+script|data):/i), Fh = Vt(
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g
  // eslint-disable-line no-control-regex
), Dl = Vt(/^html$/i), $h = Vt(/^[a-z][.\w]*(-[.\w]+)+$/i);
var ca = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ARIA_ATTR: Mh,
  ATTR_WHITESPACE: Fh,
  CUSTOM_ELEMENT: $h,
  DATA_ATTR: Nh,
  DOCTYPE_NAME: Dl,
  ERB_EXPR: Oh,
  IS_ALLOWED_URI: Ml,
  IS_SCRIPT_OR_DATA: Dh,
  MUSTACHE_EXPR: Ih,
  TMPLIT_EXPR: Ph
});
const bs = {
  element: 1,
  text: 3,
  // Deprecated
  progressingInstruction: 7,
  comment: 8,
  document: 9
}, Bh = function() {
  return typeof window > "u" ? null : window;
}, Uh = function(e, n) {
  if (typeof e != "object" || typeof e.createPolicy != "function")
    return null;
  let s = null;
  const r = "data-tt-policy-suffix";
  n && n.hasAttribute(r) && (s = n.getAttribute(r));
  const i = "dompurify" + (s ? "#" + s : "");
  try {
    return e.createPolicy(i, {
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
}, ua = function() {
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
function Fl() {
  let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : Bh();
  const e = (J) => Fl(J);
  if (e.version = "3.2.6", e.removed = [], !t || !t.document || t.document.nodeType !== bs.document || !t.Element)
    return e.isSupported = !1, e;
  let {
    document: n
  } = t;
  const s = n, r = s.currentScript, {
    DocumentFragment: i,
    HTMLTemplateElement: o,
    Node: a,
    Element: l,
    NodeFilter: f,
    NamedNodeMap: c = t.NamedNodeMap || t.MozNamedAttrMap,
    HTMLFormElement: b,
    DOMParser: v,
    trustedTypes: D
  } = t, $ = l.prototype, Y = vs($, "cloneNode"), Ae = vs($, "remove"), ne = vs($, "nextSibling"), Se = vs($, "childNodes"), we = vs($, "parentNode");
  if (typeof o == "function") {
    const J = n.createElement("template");
    J.content && J.content.ownerDocument && (n = J.content.ownerDocument);
  }
  let U, H = "";
  const {
    implementation: Q,
    createNodeIterator: j,
    createDocumentFragment: Le,
    getElementsByTagName: nt
  } = n, {
    importNode: We
  } = s;
  let ke = ua();
  e.isSupported = typeof Pl == "function" && typeof we == "function" && Q && Q.createHTMLDocument !== void 0;
  const {
    MUSTACHE_EXPR: fe,
    ERB_EXPR: qe,
    TMPLIT_EXPR: Ze,
    DATA_ATTR: it,
    ARIA_ATTR: ie,
    IS_SCRIPT_OR_DATA: he,
    ATTR_WHITESPACE: oe,
    CUSTOM_ELEMENT: Oe
  } = ca;
  let {
    IS_ALLOWED_URI: et
  } = ca, re = null;
  const Ie = Te({}, [...ia, ...Kr, ...Gr, ...Yr, ...oa]);
  let Pe = null;
  const W = Te({}, [...aa, ...Zr, ...la, ...Ys]);
  let ae = Object.seal(Nl(null, {
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
  })), _e = null, V = null, je = !0, Qe = !0, mt = !1, Nt = !0, d = !1, g = !0, k = !1, A = !1, E = !1, S = !1, B = !1, M = !1, F = !0, L = !1;
  const Z = "user-content-";
  let z = !0, K = !1, X = {}, se = null;
  const Ce = Te({}, ["annotation-xml", "audio", "colgroup", "desc", "foreignobject", "head", "iframe", "math", "mi", "mn", "mo", "ms", "mtext", "noembed", "noframes", "noscript", "plaintext", "script", "style", "svg", "template", "thead", "title", "video", "xmp"]);
  let pe = null;
  const ot = Te({}, ["audio", "video", "img", "source", "image", "track"]);
  let Me = null;
  const Xe = Te({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), u = "http://www.w3.org/1998/Math/MathML", m = "http://www.w3.org/2000/svg", T = "http://www.w3.org/1999/xhtml";
  let x = T, P = !1, G = null;
  const ee = Te({}, [u, m, T], Vr);
  let ve = Te({}, ["mi", "mo", "mn", "ms", "mtext"]), xe = Te({}, ["annotation-xml"]);
  const Ve = Te({}, ["title", "style", "font", "a", "script"]);
  let Ne = null;
  const _t = ["application/xhtml+xml", "text/html"], vt = "text/html";
  let De = null, Kt = null;
  const zs = n.createElement("form"), un = function(y) {
    return y instanceof RegExp || y instanceof Function;
  }, Vn = function() {
    let y = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (!(Kt && Kt === y)) {
      if ((!y || typeof y != "object") && (y = {}), y = dn(y), Ne = // eslint-disable-next-line unicorn/prefer-includes
      _t.indexOf(y.PARSER_MEDIA_TYPE) === -1 ? vt : y.PARSER_MEDIA_TYPE, De = Ne === "application/xhtml+xml" ? Vr : rr, re = Zt(y, "ALLOWED_TAGS") ? Te({}, y.ALLOWED_TAGS, De) : Ie, Pe = Zt(y, "ALLOWED_ATTR") ? Te({}, y.ALLOWED_ATTR, De) : W, G = Zt(y, "ALLOWED_NAMESPACES") ? Te({}, y.ALLOWED_NAMESPACES, Vr) : ee, Me = Zt(y, "ADD_URI_SAFE_ATTR") ? Te(dn(Xe), y.ADD_URI_SAFE_ATTR, De) : Xe, pe = Zt(y, "ADD_DATA_URI_TAGS") ? Te(dn(ot), y.ADD_DATA_URI_TAGS, De) : ot, se = Zt(y, "FORBID_CONTENTS") ? Te({}, y.FORBID_CONTENTS, De) : Ce, _e = Zt(y, "FORBID_TAGS") ? Te({}, y.FORBID_TAGS, De) : dn({}), V = Zt(y, "FORBID_ATTR") ? Te({}, y.FORBID_ATTR, De) : dn({}), X = Zt(y, "USE_PROFILES") ? y.USE_PROFILES : !1, je = y.ALLOW_ARIA_ATTR !== !1, Qe = y.ALLOW_DATA_ATTR !== !1, mt = y.ALLOW_UNKNOWN_PROTOCOLS || !1, Nt = y.ALLOW_SELF_CLOSE_IN_ATTR !== !1, d = y.SAFE_FOR_TEMPLATES || !1, g = y.SAFE_FOR_XML !== !1, k = y.WHOLE_DOCUMENT || !1, S = y.RETURN_DOM || !1, B = y.RETURN_DOM_FRAGMENT || !1, M = y.RETURN_TRUSTED_TYPE || !1, E = y.FORCE_BODY || !1, F = y.SANITIZE_DOM !== !1, L = y.SANITIZE_NAMED_PROPS || !1, z = y.KEEP_CONTENT !== !1, K = y.IN_PLACE || !1, et = y.ALLOWED_URI_REGEXP || Ml, x = y.NAMESPACE || T, ve = y.MATHML_TEXT_INTEGRATION_POINTS || ve, xe = y.HTML_INTEGRATION_POINTS || xe, ae = y.CUSTOM_ELEMENT_HANDLING || {}, y.CUSTOM_ELEMENT_HANDLING && un(y.CUSTOM_ELEMENT_HANDLING.tagNameCheck) && (ae.tagNameCheck = y.CUSTOM_ELEMENT_HANDLING.tagNameCheck), y.CUSTOM_ELEMENT_HANDLING && un(y.CUSTOM_ELEMENT_HANDLING.attributeNameCheck) && (ae.attributeNameCheck = y.CUSTOM_ELEMENT_HANDLING.attributeNameCheck), y.CUSTOM_ELEMENT_HANDLING && typeof y.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements == "boolean" && (ae.allowCustomizedBuiltInElements = y.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements), d && (Qe = !1), B && (S = !0), X && (re = Te({}, oa), Pe = [], X.html === !0 && (Te(re, ia), Te(Pe, aa)), X.svg === !0 && (Te(re, Kr), Te(Pe, Zr), Te(Pe, Ys)), X.svgFilters === !0 && (Te(re, Gr), Te(Pe, Zr), Te(Pe, Ys)), X.mathMl === !0 && (Te(re, Yr), Te(Pe, la), Te(Pe, Ys))), y.ADD_TAGS && (re === Ie && (re = dn(re)), Te(re, y.ADD_TAGS, De)), y.ADD_ATTR && (Pe === W && (Pe = dn(Pe)), Te(Pe, y.ADD_ATTR, De)), y.ADD_URI_SAFE_ATTR && Te(Me, y.ADD_URI_SAFE_ATTR, De), y.FORBID_CONTENTS && (se === Ce && (se = dn(se)), Te(se, y.FORBID_CONTENTS, De)), z && (re["#text"] = !0), k && Te(re, ["html", "head", "body"]), re.table && (Te(re, ["tbody"]), delete _e.tbody), y.TRUSTED_TYPES_POLICY) {
        if (typeof y.TRUSTED_TYPES_POLICY.createHTML != "function")
          throw ys('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
        if (typeof y.TRUSTED_TYPES_POLICY.createScriptURL != "function")
          throw ys('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
        U = y.TRUSTED_TYPES_POLICY, H = U.createHTML("");
      } else
        U === void 0 && (U = Uh(D, r)), U !== null && typeof H == "string" && (H = U.createHTML(""));
      It && It(y), Kt = y;
    }
  }, kn = Te({}, [...Kr, ...Gr, ...Rh]), as = Te({}, [...Yr, ...Lh]), Kn = function(y) {
    let N = we(y);
    (!N || !N.tagName) && (N = {
      namespaceURI: x,
      tagName: "template"
    });
    const q = rr(y.tagName), Ke = rr(N.tagName);
    return G[y.namespaceURI] ? y.namespaceURI === m ? N.namespaceURI === T ? q === "svg" : N.namespaceURI === u ? q === "svg" && (Ke === "annotation-xml" || ve[Ke]) : !!kn[q] : y.namespaceURI === u ? N.namespaceURI === T ? q === "math" : N.namespaceURI === m ? q === "math" && xe[Ke] : !!as[q] : y.namespaceURI === T ? N.namespaceURI === m && !xe[Ke] || N.namespaceURI === u && !ve[Ke] ? !1 : !as[q] && (Ve[q] || !kn[q]) : !!(Ne === "application/xhtml+xml" && G[y.namespaceURI]) : !1;
  }, Bt = function(y) {
    ms(e.removed, {
      element: y
    });
    try {
      we(y).removeChild(y);
    } catch {
      Ae(y);
    }
  }, Qt = function(y, N) {
    try {
      ms(e.removed, {
        attribute: N.getAttributeNode(y),
        from: N
      });
    } catch {
      ms(e.removed, {
        attribute: null,
        from: N
      });
    }
    if (N.removeAttribute(y), y === "is")
      if (S || B)
        try {
          Bt(N);
        } catch {
        }
      else
        try {
          N.setAttribute(y, "");
        } catch {
        }
  }, Hs = function(y) {
    let N = null, q = null;
    if (E)
      y = "<remove></remove>" + y;
    else {
      const ut = ra(y, /^[\r\n\t ]+/);
      q = ut && ut[0];
    }
    Ne === "application/xhtml+xml" && x === T && (y = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + y + "</body></html>");
    const Ke = U ? U.createHTML(y) : y;
    if (x === T)
      try {
        N = new v().parseFromString(Ke, Ne);
      } catch {
      }
    if (!N || !N.documentElement) {
      N = Q.createDocument(x, "template", null);
      try {
        N.documentElement.innerHTML = P ? H : Ke;
      } catch {
      }
    }
    const ct = N.body || N.documentElement;
    return y && q && ct.insertBefore(n.createTextNode(q), ct.childNodes[0] || null), x === T ? nt.call(N, k ? "html" : "body")[0] : k ? N.documentElement : ct;
  }, ls = function(y) {
    return j.call(
      y.ownerDocument || y,
      y,
      // eslint-disable-next-line no-bitwise
      f.SHOW_ELEMENT | f.SHOW_COMMENT | f.SHOW_TEXT | f.SHOW_PROCESSING_INSTRUCTION | f.SHOW_CDATA_SECTION,
      null
    );
  }, xn = function(y) {
    return y instanceof b && (typeof y.nodeName != "string" || typeof y.textContent != "string" || typeof y.removeChild != "function" || !(y.attributes instanceof c) || typeof y.removeAttribute != "function" || typeof y.setAttribute != "function" || typeof y.namespaceURI != "string" || typeof y.insertBefore != "function" || typeof y.hasChildNodes != "function");
  }, Gn = function(y) {
    return typeof a == "function" && y instanceof a;
  };
  function ht(J, y, N) {
    Gs(J, (q) => {
      q.call(e, y, N, Kt);
    });
  }
  const Mt = function(y) {
    let N = null;
    if (ht(ke.beforeSanitizeElements, y, null), xn(y))
      return Bt(y), !0;
    const q = De(y.nodeName);
    if (ht(ke.uponSanitizeElement, y, {
      tagName: q,
      allowedTags: re
    }), g && y.hasChildNodes() && !Gn(y.firstElementChild) && At(/<[/\w!]/g, y.innerHTML) && At(/<[/\w!]/g, y.textContent) || y.nodeType === bs.progressingInstruction || g && y.nodeType === bs.comment && At(/<[/\w]/g, y.data))
      return Bt(y), !0;
    if (!re[q] || _e[q]) {
      if (!_e[q] && dt(q) && (ae.tagNameCheck instanceof RegExp && At(ae.tagNameCheck, q) || ae.tagNameCheck instanceof Function && ae.tagNameCheck(q)))
        return !1;
      if (z && !se[q]) {
        const Ke = we(y) || y.parentNode, ct = Se(y) || y.childNodes;
        if (ct && Ke) {
          const ut = ct.length;
          for (let kt = ut - 1; kt >= 0; --kt) {
            const Gt = Y(ct[kt], !0);
            Gt.__removalCount = (y.__removalCount || 0) + 1, Ke.insertBefore(Gt, ne(y));
          }
        }
      }
      return Bt(y), !0;
    }
    return y instanceof l && !Kn(y) || (q === "noscript" || q === "noembed" || q === "noframes") && At(/<\/no(script|embed|frames)/i, y.innerHTML) ? (Bt(y), !0) : (d && y.nodeType === bs.text && (N = y.textContent, Gs([fe, qe, Ze], (Ke) => {
      N = _s(N, Ke, " ");
    }), y.textContent !== N && (ms(e.removed, {
      element: y.cloneNode()
    }), y.textContent = N)), ht(ke.afterSanitizeElements, y, null), !1);
  }, at = function(y, N, q) {
    if (F && (N === "id" || N === "name") && (q in n || q in zs))
      return !1;
    if (!(Qe && !V[N] && At(it, N))) {
      if (!(je && At(ie, N))) {
        if (!Pe[N] || V[N]) {
          if (
            // First condition does a very basic check if a) it's basically a valid custom element tagname AND
            // b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
            // and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
            !(dt(y) && (ae.tagNameCheck instanceof RegExp && At(ae.tagNameCheck, y) || ae.tagNameCheck instanceof Function && ae.tagNameCheck(y)) && (ae.attributeNameCheck instanceof RegExp && At(ae.attributeNameCheck, N) || ae.attributeNameCheck instanceof Function && ae.attributeNameCheck(N)) || // Alternative, second condition checks if it's an `is`-attribute, AND
            // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
            N === "is" && ae.allowCustomizedBuiltInElements && (ae.tagNameCheck instanceof RegExp && At(ae.tagNameCheck, q) || ae.tagNameCheck instanceof Function && ae.tagNameCheck(q)))
          ) return !1;
        } else if (!Me[N]) {
          if (!At(et, _s(q, oe, ""))) {
            if (!((N === "src" || N === "xlink:href" || N === "href") && y !== "script" && Sh(q, "data:") === 0 && pe[y])) {
              if (!(mt && !At(he, _s(q, oe, "")))) {
                if (q)
                  return !1;
              }
            }
          }
        }
      }
    }
    return !0;
  }, dt = function(y) {
    return y !== "annotation-xml" && ra(y, Oe);
  }, lt = function(y) {
    ht(ke.beforeSanitizeAttributes, y, null);
    const {
      attributes: N
    } = y;
    if (!N || xn(y))
      return;
    const q = {
      attrName: "",
      attrValue: "",
      keepAttr: !0,
      allowedAttributes: Pe,
      forceKeepAttr: void 0
    };
    let Ke = N.length;
    for (; Ke--; ) {
      const ct = N[Ke], {
        name: ut,
        namespaceURI: kt,
        value: Gt
      } = ct, Dn = De(ut), cs = Gt;
      let yt = ut === "value" ? cs : Ah(cs);
      if (q.attrName = Dn, q.attrValue = yt, q.keepAttr = !0, q.forceKeepAttr = void 0, ht(ke.uponSanitizeAttribute, y, q), yt = q.attrValue, L && (Dn === "id" || Dn === "name") && (Qt(ut, y), yt = Z + yt), g && At(/((--!?|])>)|<\/(style|title)/i, yt)) {
        Qt(ut, y);
        continue;
      }
      if (q.forceKeepAttr)
        continue;
      if (!q.keepAttr) {
        Qt(ut, y);
        continue;
      }
      if (!Nt && At(/\/>/i, yt)) {
        Qt(ut, y);
        continue;
      }
      d && Gs([fe, qe, Ze], (bt) => {
        yt = _s(yt, bt, " ");
      });
      const Ws = De(y.nodeName);
      if (!at(Ws, Dn, yt)) {
        Qt(ut, y);
        continue;
      }
      if (U && typeof D == "object" && typeof D.getAttributeType == "function" && !kt)
        switch (D.getAttributeType(Ws, Dn)) {
          case "TrustedHTML": {
            yt = U.createHTML(yt);
            break;
          }
          case "TrustedScriptURL": {
            yt = U.createScriptURL(yt);
            break;
          }
        }
      if (yt !== cs)
        try {
          kt ? y.setAttributeNS(kt, ut, yt) : y.setAttribute(ut, yt), xn(y) ? Bt(y) : sa(e.removed);
        } catch {
          Qt(ut, y);
        }
    }
    ht(ke.afterSanitizeAttributes, y, null);
  }, Tn = function J(y) {
    let N = null;
    const q = ls(y);
    for (ht(ke.beforeSanitizeShadowDOM, y, null); N = q.nextNode(); )
      ht(ke.uponSanitizeShadowNode, N, null), Mt(N), lt(N), N.content instanceof i && J(N.content);
    ht(ke.afterSanitizeShadowDOM, y, null);
  };
  return e.sanitize = function(J) {
    let y = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, N = null, q = null, Ke = null, ct = null;
    if (P = !J, P && (J = "<!-->"), typeof J != "string" && !Gn(J))
      if (typeof J.toString == "function") {
        if (J = J.toString(), typeof J != "string")
          throw ys("dirty is not a string, aborting");
      } else
        throw ys("toString is not a function");
    if (!e.isSupported)
      return J;
    if (A || Vn(y), e.removed = [], typeof J == "string" && (K = !1), K) {
      if (J.nodeName) {
        const Gt = De(J.nodeName);
        if (!re[Gt] || _e[Gt])
          throw ys("root node is forbidden and cannot be sanitized in-place");
      }
    } else if (J instanceof a)
      N = Hs("<!---->"), q = N.ownerDocument.importNode(J, !0), q.nodeType === bs.element && q.nodeName === "BODY" || q.nodeName === "HTML" ? N = q : N.appendChild(q);
    else {
      if (!S && !d && !k && // eslint-disable-next-line unicorn/prefer-includes
      J.indexOf("<") === -1)
        return U && M ? U.createHTML(J) : J;
      if (N = Hs(J), !N)
        return S ? null : M ? H : "";
    }
    N && E && Bt(N.firstChild);
    const ut = ls(K ? J : N);
    for (; Ke = ut.nextNode(); )
      Mt(Ke), lt(Ke), Ke.content instanceof i && Tn(Ke.content);
    if (K)
      return J;
    if (S) {
      if (B)
        for (ct = Le.call(N.ownerDocument); N.firstChild; )
          ct.appendChild(N.firstChild);
      else
        ct = N;
      return (Pe.shadowroot || Pe.shadowrootmode) && (ct = We.call(s, ct, !0)), ct;
    }
    let kt = k ? N.outerHTML : N.innerHTML;
    return k && re["!doctype"] && N.ownerDocument && N.ownerDocument.doctype && N.ownerDocument.doctype.name && At(Dl, N.ownerDocument.doctype.name) && (kt = "<!DOCTYPE " + N.ownerDocument.doctype.name + `>
` + kt), d && Gs([fe, qe, Ze], (Gt) => {
      kt = _s(kt, Gt, " ");
    }), U && M ? U.createHTML(kt) : kt;
  }, e.setConfig = function() {
    let J = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    Vn(J), A = !0;
  }, e.clearConfig = function() {
    Kt = null, A = !1;
  }, e.isValidAttribute = function(J, y, N) {
    Kt || Vn({});
    const q = De(J), Ke = De(y);
    return at(q, Ke, N);
  }, e.addHook = function(J, y) {
    typeof y == "function" && ms(ke[J], y);
  }, e.removeHook = function(J, y) {
    if (y !== void 0) {
      const N = xh(ke[J], y);
      return N === -1 ? void 0 : Th(ke[J], N, 1)[0];
    }
    return sa(ke[J]);
  }, e.removeHooks = function(J) {
    ke[J] = [];
  }, e.removeAllHooks = function() {
    ke = ua();
  }, e;
}
var Ji = Fl();
Ji.addHook("uponSanitizeElement", (t, e) => {
  var r, i, o, a, l, f;
  if (e.tagName === "svg") {
    (r = t.parentNode) == null || r.removeChild(t);
    return;
  }
  if (e.tagName === "math") {
    (i = t.parentNode) == null || i.removeChild(t);
    return;
  }
  if (e.tagName === "foreignobject") {
    (o = t.parentNode) == null || o.removeChild(t);
    return;
  }
  const n = t, s = (a = e.tagName) == null ? void 0 : a.toUpperCase();
  if (s === "A" || s === "IMG" || s === "AREA" || s === "MAP")
    if (s === "A") {
      const c = n.textContent;
      c ? n.replaceWith(c) : (l = n.parentNode) == null || l.removeChild(n);
    } else
      (f = n.parentNode) == null || f.removeChild(n);
});
Ji.addHook("afterSanitizeAttributes", (t) => {
  if (t.hasAttribute("href")) {
    const e = t.getAttribute("href") || "";
    try {
      const n = decodeURIComponent(e.toLowerCase());
      (n.includes("javascript:") || n.includes("data:text/html") || n.includes("vbscript:") || n.includes("about:") || n.includes("file:")) && t.removeAttribute("href");
    } catch {
      (e.toLowerCase().includes("javascript:") || e.toLowerCase().includes("data:text/html") || e.toLowerCase().includes("vbscript:") || e.toLowerCase().includes("about:") || e.toLowerCase().includes("file:")) && t.removeAttribute("href");
    }
  }
  if (t.hasAttribute("src")) {
    const e = t.getAttribute("src") || "";
    try {
      const n = decodeURIComponent(e.toLowerCase());
      (n.includes("javascript:") || n.includes("data:text/html") || n.includes("vbscript:") || n.includes("about:") || n.includes("file:")) && t.removeAttribute("src");
    } catch {
      (e.toLowerCase().includes("javascript:") || e.toLowerCase().includes("data:text/html") || e.toLowerCase().includes("vbscript:") || e.toLowerCase().includes("about:") || e.toLowerCase().includes("file:")) && t.removeAttribute("src");
    }
  }
  if (t.hasAttribute("style")) {
    const e = t.getAttribute("style") || "";
    try {
      const n = decodeURIComponent(e.toLowerCase());
      (n.includes("expression(") || n.includes("behavior:") || n.includes("-moz-binding") || n.includes("import") || n.includes("javascript:") || n.includes("vbscript:")) && t.removeAttribute("style");
    } catch {
      (e.toLowerCase().includes("expression(") || e.toLowerCase().includes("behavior:") || e.toLowerCase().includes("-moz-binding") || e.toLowerCase().includes("import") || e.toLowerCase().includes("javascript:") || e.toLowerCase().includes("vbscript:")) && t.removeAttribute("style");
    }
  }
  Array.from(t.attributes).forEach((e) => {
    e.name.toLowerCase().startsWith("on") && t.removeAttribute(e.name);
  });
});
function zh(t) {
  const e = {
    // Block all dangerous tags including SVG, form elements, links and images
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
      "a",
      "img",
      "area",
      "map"
      // SECURITY: Remove link and image tags completely
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
      "href",
      "src",
      "data"
      // SECURITY: Block resource loading attributes
    ],
    // Only allow safe protocols
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    // SECURITY: Strip ALL HTML tags to prevent rendering exploits
    // Only allow basic text formatting for markdown (no links, images, or any potentially dangerous tags)
    ALLOWED_TAGS: [
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
    // SECURITY: No href, src, or any attributes that can load external resources
    ALLOWED_ATTR: [
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
    ALLOW_DATA_ATTR: !1,
    // Forbid unknown protocols
    USE_PROFILES: { html: !0 }
  };
  return Ji.sanitize(t, e);
}
function fa() {
  return typeof window < "u" && window.APP_CONFIG ? window.APP_CONFIG : {};
}
const Rn = {
  get API_URL() {
    return fa().API_URL || "https://api.chattermate.chat/api/v1";
  },
  get WS_URL() {
    return fa().WS_URL || "wss://api.chattermate.chat";
  }
};
function Hh(t) {
  const e = ft(() => ({
    backgroundColor: t.value.chat_background_color || "#ffffff",
    color: Sn(t.value.chat_background_color || "#ffffff") ? "#ffffff" : "#000000"
  })), n = ft(() => ({
    backgroundColor: t.value.chat_bubble_color || "#f34611",
    color: Sn(t.value.chat_bubble_color || "#f34611") ? "#FFFFFF" : "#000000"
  })), s = ft(() => {
    const f = t.value.chat_background_color || "#F8F9FA", c = Df(f, 20);
    return {
      backgroundColor: c,
      color: Sn(c) ? "#FFFFFF" : "#000000"
    };
  }), r = ft(() => ({
    backgroundColor: t.value.accent_color || "#f34611",
    color: Sn(t.value.accent_color || "#f34611") ? "#FFFFFF" : "#000000"
  })), i = ft(() => ({
    color: Sn(t.value.chat_background_color || "#F8F9FA") ? "#FFFFFF" : "#000000"
  })), o = ft(() => ({
    borderBottom: `1px solid ${Sn(t.value.chat_background_color || "#F8F9FA") ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`
  })), a = ft(() => t.value.photo_url ? t.value.photo_url.includes("amazonaws.com") ? t.value.photo_url : `${Rn.API_URL}${t.value.photo_url}` : ""), l = ft(() => {
    const f = t.value.chat_background_color || "#ffffff";
    return {
      boxShadow: `0 8px 5px ${Sn(f) ? "rgba(0, 0, 0, 0.24)" : "rgba(0, 0, 0, 0.12)"}`
    };
  });
  return {
    chatStyles: e,
    chatIconStyles: n,
    agentBubbleStyles: s,
    userBubbleStyles: r,
    messageNameStyles: i,
    headerBorderStyles: o,
    photoUrl: a,
    shadowStyle: l
  };
}
const Wh = /* @__PURE__ */ new Set(["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]), qh = /* @__PURE__ */ new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);
[...Wh, ...qh];
function jh(t, e) {
  const n = de([]), s = de(!1), r = de(null), i = (H) => {
    if (H === 0) return "0 Bytes";
    const Q = 1024, j = ["Bytes", "KB", "MB", "GB"], Le = Math.floor(Math.log(H) / Math.log(Q));
    return parseFloat((H / Math.pow(Q, Le)).toFixed(2)) + " " + j[Le];
  }, o = (H) => H.startsWith("image/"), a = (H) => H ? H.startsWith("blob:") || H.startsWith("http://") || H.startsWith("https://") ? H : `${Rn.API_URL}${H}` : "", l = (H) => {
    const Q = H.file_url || H.url;
    return Q ? Q.startsWith("blob:") || Q.startsWith("http://") || Q.startsWith("https://") ? Q : `${Rn.API_URL}${Q}` : "";
  }, f = async (H) => {
    const Q = H.target;
    Q.files && Q.files.length > 0 && (await Y(Array.from(Q.files)), Q.value = "");
  }, c = async (H) => {
    var j;
    H.preventDefault();
    const Q = (j = H.dataTransfer) == null ? void 0 : j.files;
    Q && Q.length > 0 && await Y(Array.from(Q));
  }, b = (H) => {
    H.preventDefault();
  }, v = (H) => {
    H.preventDefault();
  }, D = async (H) => {
    var Le;
    const Q = (Le = H.clipboardData) == null ? void 0 : Le.items;
    if (!Q) return;
    const j = [];
    for (const nt of Array.from(Q))
      if (nt.kind === "file") {
        const We = nt.getAsFile();
        We && j.push(We);
      }
    j.length > 0 && await Y(j);
  }, $ = async (H, Q = 500) => new Promise((j, Le) => {
    const nt = new FileReader();
    nt.onload = (We) => {
      var fe;
      const ke = new Image();
      ke.onload = () => {
        const qe = document.createElement("canvas");
        let Ze = ke.width, it = ke.height;
        const ie = 1920;
        (Ze > ie || it > ie) && (Ze > it ? (it = it / Ze * ie, Ze = ie) : (Ze = Ze / it * ie, it = ie)), qe.width = Ze, qe.height = it;
        const he = qe.getContext("2d");
        if (!he) {
          Le(new Error("Failed to get canvas context"));
          return;
        }
        he.drawImage(ke, 0, 0, Ze, it);
        let oe = 0.9;
        const Oe = () => {
          qe.toBlob((et) => {
            if (!et) {
              Le(new Error("Failed to compress image"));
              return;
            }
            if (et.size / 1024 > Q && oe > 0.3)
              oe -= 0.1, Oe();
            else {
              const Ie = new FileReader();
              Ie.onload = () => {
                const Pe = Ie.result.split(",")[1];
                j({ blob: et, base64: Pe });
              }, Ie.readAsDataURL(et);
            }
          }, H.type === "image/png" ? "image/png" : "image/jpeg", oe);
        };
        Oe();
      }, ke.onerror = () => Le(new Error("Failed to load image")), ke.src = (fe = We.target) == null ? void 0 : fe.result;
    }, nt.onerror = () => Le(new Error("Failed to read file")), nt.readAsDataURL(H);
  }), Y = async (H) => {
    if (n.value.length >= 3) {
      alert("Maximum 3 files allowed per message");
      return;
    }
    const We = 3 - n.value.length, ke = H.slice(0, We);
    H.length > We && alert(`Only ${We} more file(s) can be uploaded. Maximum 3 files per message.`);
    for (const fe of ke)
      try {
        if (n.value.some((ie) => ie.filename === fe.name)) {
          console.warn(`File ${fe.name} is already selected`), alert(`File "${fe.name}" is already selected`);
          continue;
        }
        const Ze = fe.type.startsWith("image/"), it = Ze ? 5242880 : 10485760;
        if (fe.size > it) {
          const ie = it / 1048576;
          console.error(`File ${fe.name} is too large. Maximum size is ${ie}MB`), alert(`File "${fe.name}" is too large. Maximum size for ${Ze ? "images" : "documents"} is ${ie}MB`);
          continue;
        }
        if (Ze)
          try {
            const { blob: ie, base64: he } = await $(fe, 500), oe = ie.size;
            console.log(`Compressed ${fe.name}: ${(fe.size / 1024).toFixed(2)}KB → ${(oe / 1024).toFixed(2)}KB`), n.value.push({
              content: he,
              filename: fe.name,
              type: fe.type,
              size: oe,
              url: URL.createObjectURL(ie),
              file_url: URL.createObjectURL(ie)
            });
          } catch (ie) {
            console.error("Image compression failed, uploading original:", ie);
            const he = new FileReader();
            he.onload = (oe) => {
              var re;
              const et = ((re = oe.target) == null ? void 0 : re.result).split(",")[1];
              n.value.push({
                content: et,
                filename: fe.name,
                type: fe.type,
                size: fe.size,
                url: URL.createObjectURL(fe),
                file_url: URL.createObjectURL(fe)
              });
            }, he.readAsDataURL(fe);
          }
        else {
          const ie = new FileReader();
          ie.onload = (he) => {
            var et;
            const Oe = ((et = he.target) == null ? void 0 : et.result).split(",")[1];
            n.value.push({
              content: Oe,
              filename: fe.name,
              type: fe.type || "application/octet-stream",
              size: fe.size,
              url: "",
              file_url: ""
            });
          }, ie.readAsDataURL(fe);
        }
      } catch (qe) {
        console.error("File upload error:", qe);
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
    handleDrop: c,
    handleDragOver: b,
    handleDragLeave: v,
    handlePaste: D,
    uploadFiles: Y,
    removeAttachment: async (H) => {
      const Q = n.value[H];
      if (Q) {
        try {
          let j = Q.url;
          j.startsWith("/uploads/") ? j = j.substring(9) : j.startsWith("/") && (j = j.substring(1)), j.includes("amazonaws.com/") && (j = j.split("amazonaws.com/")[1]);
          const Le = {};
          t.value && (Le.Authorization = `Bearer ${t.value}`);
          const nt = await fetch(`${Rn.API_URL}/api/v1/files/upload/${j}`, {
            method: "DELETE",
            headers: Le
          });
          if (nt.ok)
            console.log("File deleted successfully from backend.");
          else {
            const We = await nt.json();
            console.error("Failed to delete file:", We.detail);
          }
        } catch (j) {
          console.error("Error calling delete API:", j);
        }
        Q.url && Q.url.startsWith("blob:") && URL.revokeObjectURL(Q.url), Q.file_url && Q.file_url.startsWith("blob:") && URL.revokeObjectURL(Q.file_url), n.value.splice(H, 1);
      }
    },
    openPreview: (H) => {
      r.value = H, s.value = !0;
    },
    closePreview: () => {
      s.value = !1, setTimeout(() => {
        r.value = null;
      }, 300);
    },
    openFilePicker: () => {
      var H;
      (H = e.value) == null || H.click();
    },
    isImage: (H) => H.startsWith("image/")
  };
}
const cn = /* @__PURE__ */ Object.create(null);
cn.open = "0";
cn.close = "1";
cn.ping = "2";
cn.pong = "3";
cn.message = "4";
cn.upgrade = "5";
cn.noop = "6";
const ir = /* @__PURE__ */ Object.create(null);
Object.keys(cn).forEach((t) => {
  ir[cn[t]] = t;
});
const vi = { type: "error", data: "parser error" }, $l = typeof Blob == "function" || typeof Blob < "u" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]", Bl = typeof ArrayBuffer == "function", Ul = (t) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(t) : t && t.buffer instanceof ArrayBuffer, Qi = ({ type: t, data: e }, n, s) => $l && e instanceof Blob ? n ? s(e) : ha(e, s) : Bl && (e instanceof ArrayBuffer || Ul(e)) ? n ? s(e) : ha(new Blob([e]), s) : s(cn[t] + (e || "")), ha = (t, e) => {
  const n = new FileReader();
  return n.onload = function() {
    const s = n.result.split(",")[1];
    e("b" + (s || ""));
  }, n.readAsDataURL(t);
};
function da(t) {
  return t instanceof Uint8Array ? t : t instanceof ArrayBuffer ? new Uint8Array(t) : new Uint8Array(t.buffer, t.byteOffset, t.byteLength);
}
let Xr;
function Vh(t, e) {
  if ($l && t.data instanceof Blob)
    return t.data.arrayBuffer().then(da).then(e);
  if (Bl && (t.data instanceof ArrayBuffer || Ul(t.data)))
    return e(da(t.data));
  Qi(t, !1, (n) => {
    Xr || (Xr = new TextEncoder()), e(Xr.encode(n));
  });
}
const pa = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", Ts = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (let t = 0; t < pa.length; t++)
  Ts[pa.charCodeAt(t)] = t;
const Kh = (t) => {
  let e = t.length * 0.75, n = t.length, s, r = 0, i, o, a, l;
  t[t.length - 1] === "=" && (e--, t[t.length - 2] === "=" && e--);
  const f = new ArrayBuffer(e), c = new Uint8Array(f);
  for (s = 0; s < n; s += 4)
    i = Ts[t.charCodeAt(s)], o = Ts[t.charCodeAt(s + 1)], a = Ts[t.charCodeAt(s + 2)], l = Ts[t.charCodeAt(s + 3)], c[r++] = i << 2 | o >> 4, c[r++] = (o & 15) << 4 | a >> 2, c[r++] = (a & 3) << 6 | l & 63;
  return f;
}, Gh = typeof ArrayBuffer == "function", eo = (t, e) => {
  if (typeof t != "string")
    return {
      type: "message",
      data: zl(t, e)
    };
  const n = t.charAt(0);
  return n === "b" ? {
    type: "message",
    data: Yh(t.substring(1), e)
  } : ir[n] ? t.length > 1 ? {
    type: ir[n],
    data: t.substring(1)
  } : {
    type: ir[n]
  } : vi;
}, Yh = (t, e) => {
  if (Gh) {
    const n = Kh(t);
    return zl(n, e);
  } else
    return { base64: !0, data: t };
}, zl = (t, e) => {
  switch (e) {
    case "blob":
      return t instanceof Blob ? t : new Blob([t]);
    case "arraybuffer":
    default:
      return t instanceof ArrayBuffer ? t : t.buffer;
  }
}, Hl = "", Zh = (t, e) => {
  const n = t.length, s = new Array(n);
  let r = 0;
  t.forEach((i, o) => {
    Qi(i, !1, (a) => {
      s[o] = a, ++r === n && e(s.join(Hl));
    });
  });
}, Xh = (t, e) => {
  const n = t.split(Hl), s = [];
  for (let r = 0; r < n.length; r++) {
    const i = eo(n[r], e);
    if (s.push(i), i.type === "error")
      break;
  }
  return s;
};
function Jh() {
  return new TransformStream({
    transform(t, e) {
      Vh(t, (n) => {
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
        t.data && typeof t.data != "string" && (r[0] |= 128), e.enqueue(r), e.enqueue(n);
      });
    }
  });
}
let Jr;
function Zs(t) {
  return t.reduce((e, n) => e + n.length, 0);
}
function Xs(t, e) {
  if (t[0].length === e)
    return t.shift();
  const n = new Uint8Array(e);
  let s = 0;
  for (let r = 0; r < e; r++)
    n[r] = t[0][s++], s === t[0].length && (t.shift(), s = 0);
  return t.length && s < t[0].length && (t[0] = t[0].slice(s)), n;
}
function Qh(t, e) {
  Jr || (Jr = new TextDecoder());
  const n = [];
  let s = 0, r = -1, i = !1;
  return new TransformStream({
    transform(o, a) {
      for (n.push(o); ; ) {
        if (s === 0) {
          if (Zs(n) < 1)
            break;
          const l = Xs(n, 1);
          i = (l[0] & 128) === 128, r = l[0] & 127, r < 126 ? s = 3 : r === 126 ? s = 1 : s = 2;
        } else if (s === 1) {
          if (Zs(n) < 2)
            break;
          const l = Xs(n, 2);
          r = new DataView(l.buffer, l.byteOffset, l.length).getUint16(0), s = 3;
        } else if (s === 2) {
          if (Zs(n) < 8)
            break;
          const l = Xs(n, 8), f = new DataView(l.buffer, l.byteOffset, l.length), c = f.getUint32(0);
          if (c > Math.pow(2, 21) - 1) {
            a.enqueue(vi);
            break;
          }
          r = c * Math.pow(2, 32) + f.getUint32(4), s = 3;
        } else {
          if (Zs(n) < r)
            break;
          const l = Xs(n, r);
          a.enqueue(eo(i ? l : Jr.decode(l), e)), s = 0;
        }
        if (r === 0 || r > t) {
          a.enqueue(vi);
          break;
        }
      }
    }
  });
}
const Wl = 4;
function pt(t) {
  if (t) return ed(t);
}
function ed(t) {
  for (var e in pt.prototype)
    t[e] = pt.prototype[e];
  return t;
}
pt.prototype.on = pt.prototype.addEventListener = function(t, e) {
  return this._callbacks = this._callbacks || {}, (this._callbacks["$" + t] = this._callbacks["$" + t] || []).push(e), this;
};
pt.prototype.once = function(t, e) {
  function n() {
    this.off(t, n), e.apply(this, arguments);
  }
  return n.fn = e, this.on(t, n), this;
};
pt.prototype.off = pt.prototype.removeListener = pt.prototype.removeAllListeners = pt.prototype.removeEventListener = function(t, e) {
  if (this._callbacks = this._callbacks || {}, arguments.length == 0)
    return this._callbacks = {}, this;
  var n = this._callbacks["$" + t];
  if (!n) return this;
  if (arguments.length == 1)
    return delete this._callbacks["$" + t], this;
  for (var s, r = 0; r < n.length; r++)
    if (s = n[r], s === e || s.fn === e) {
      n.splice(r, 1);
      break;
    }
  return n.length === 0 && delete this._callbacks["$" + t], this;
};
pt.prototype.emit = function(t) {
  this._callbacks = this._callbacks || {};
  for (var e = new Array(arguments.length - 1), n = this._callbacks["$" + t], s = 1; s < arguments.length; s++)
    e[s - 1] = arguments[s];
  if (n) {
    n = n.slice(0);
    for (var s = 0, r = n.length; s < r; ++s)
      n[s].apply(this, e);
  }
  return this;
};
pt.prototype.emitReserved = pt.prototype.emit;
pt.prototype.listeners = function(t) {
  return this._callbacks = this._callbacks || {}, this._callbacks["$" + t] || [];
};
pt.prototype.hasListeners = function(t) {
  return !!this.listeners(t).length;
};
const Lr = typeof Promise == "function" && typeof Promise.resolve == "function" ? (e) => Promise.resolve().then(e) : (e, n) => n(e, 0), Ht = typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")(), td = "arraybuffer";
function ql(t, ...e) {
  return e.reduce((n, s) => (t.hasOwnProperty(s) && (n[s] = t[s]), n), {});
}
const nd = Ht.setTimeout, sd = Ht.clearTimeout;
function Ir(t, e) {
  e.useNativeTimers ? (t.setTimeoutFn = nd.bind(Ht), t.clearTimeoutFn = sd.bind(Ht)) : (t.setTimeoutFn = Ht.setTimeout.bind(Ht), t.clearTimeoutFn = Ht.clearTimeout.bind(Ht));
}
const rd = 1.33;
function id(t) {
  return typeof t == "string" ? od(t) : Math.ceil((t.byteLength || t.size) * rd);
}
function od(t) {
  let e = 0, n = 0;
  for (let s = 0, r = t.length; s < r; s++)
    e = t.charCodeAt(s), e < 128 ? n += 1 : e < 2048 ? n += 2 : e < 55296 || e >= 57344 ? n += 3 : (s++, n += 4);
  return n;
}
function jl() {
  return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
}
function ad(t) {
  let e = "";
  for (let n in t)
    t.hasOwnProperty(n) && (e.length && (e += "&"), e += encodeURIComponent(n) + "=" + encodeURIComponent(t[n]));
  return e;
}
function ld(t) {
  let e = {}, n = t.split("&");
  for (let s = 0, r = n.length; s < r; s++) {
    let i = n[s].split("=");
    e[decodeURIComponent(i[0])] = decodeURIComponent(i[1]);
  }
  return e;
}
class cd extends Error {
  constructor(e, n, s) {
    super(e), this.description = n, this.context = s, this.type = "TransportError";
  }
}
class to extends pt {
  /**
   * Transport abstract constructor.
   *
   * @param {Object} opts - options
   * @protected
   */
  constructor(e) {
    super(), this.writable = !1, Ir(this, e), this.opts = e, this.query = e.query, this.socket = e.socket, this.supportsBinary = !e.forceBase64;
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
  onError(e, n, s) {
    return super.emitReserved("error", new cd(e, n, s)), this;
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
  send(e) {
    this.readyState === "open" && this.write(e);
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
  onData(e) {
    const n = eo(e, this.socket.binaryType);
    this.onPacket(n);
  }
  /**
   * Called with a decoded packet.
   *
   * @protected
   */
  onPacket(e) {
    super.emitReserved("packet", e);
  }
  /**
   * Called upon close.
   *
   * @protected
   */
  onClose(e) {
    this.readyState = "closed", super.emitReserved("close", e);
  }
  /**
   * Pauses the transport, in order not to lose packets during an upgrade.
   *
   * @param onPause
   */
  pause(e) {
  }
  createUri(e, n = {}) {
    return e + "://" + this._hostname() + this._port() + this.opts.path + this._query(n);
  }
  _hostname() {
    const e = this.opts.hostname;
    return e.indexOf(":") === -1 ? e : "[" + e + "]";
  }
  _port() {
    return this.opts.port && (this.opts.secure && +(this.opts.port !== 443) || !this.opts.secure && Number(this.opts.port) !== 80) ? ":" + this.opts.port : "";
  }
  _query(e) {
    const n = ad(e);
    return n.length ? "?" + n : "";
  }
}
class ud extends to {
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
  pause(e) {
    this.readyState = "pausing";
    const n = () => {
      this.readyState = "paused", e();
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
  onData(e) {
    const n = (s) => {
      if (this.readyState === "opening" && s.type === "open" && this.onOpen(), s.type === "close")
        return this.onClose({ description: "transport closed by the server" }), !1;
      this.onPacket(s);
    };
    Xh(e, this.socket.binaryType).forEach(n), this.readyState !== "closed" && (this._polling = !1, this.emitReserved("pollComplete"), this.readyState === "open" && this._poll());
  }
  /**
   * For polling, send a close packet.
   *
   * @protected
   */
  doClose() {
    const e = () => {
      this.write([{ type: "close" }]);
    };
    this.readyState === "open" ? e() : this.once("open", e);
  }
  /**
   * Writes a packets payload.
   *
   * @param {Array} packets - data packets
   * @protected
   */
  write(e) {
    this.writable = !1, Zh(e, (n) => {
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
    const e = this.opts.secure ? "https" : "http", n = this.query || {};
    return this.opts.timestampRequests !== !1 && (n[this.opts.timestampParam] = jl()), !this.supportsBinary && !n.sid && (n.b64 = 1), this.createUri(e, n);
  }
}
let Vl = !1;
try {
  Vl = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest();
} catch {
}
const fd = Vl;
function hd() {
}
class dd extends ud {
  /**
   * XHR Polling constructor.
   *
   * @param {Object} opts
   * @package
   */
  constructor(e) {
    if (super(e), typeof location < "u") {
      const n = location.protocol === "https:";
      let s = location.port;
      s || (s = n ? "443" : "80"), this.xd = typeof location < "u" && e.hostname !== location.hostname || s !== e.port;
    }
  }
  /**
   * Sends data.
   *
   * @param {String} data to send.
   * @param {Function} called upon flush.
   * @private
   */
  doWrite(e, n) {
    const s = this.request({
      method: "POST",
      data: e
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
    const e = this.request();
    e.on("data", this.onData.bind(this)), e.on("error", (n, s) => {
      this.onError("xhr poll error", n, s);
    }), this.pollXhr = e;
  }
}
class an extends pt {
  /**
   * Request constructor
   *
   * @param {Object} options
   * @package
   */
  constructor(e, n, s) {
    super(), this.createRequest = e, Ir(this, s), this._opts = s, this._method = s.method || "GET", this._uri = n, this._data = s.data !== void 0 ? s.data : null, this._create();
  }
  /**
   * Creates the XHR object and sends the request.
   *
   * @private
   */
  _create() {
    var e;
    const n = ql(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
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
      (e = this._opts.cookieJar) === null || e === void 0 || e.addCookies(s), "withCredentials" in s && (s.withCredentials = this._opts.withCredentials), this._opts.requestTimeout && (s.timeout = this._opts.requestTimeout), s.onreadystatechange = () => {
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
    typeof document < "u" && (this._index = an.requestsCount++, an.requests[this._index] = this);
  }
  /**
   * Called upon error.
   *
   * @private
   */
  _onError(e) {
    this.emitReserved("error", e, this._xhr), this._cleanup(!0);
  }
  /**
   * Cleans up house.
   *
   * @private
   */
  _cleanup(e) {
    if (!(typeof this._xhr > "u" || this._xhr === null)) {
      if (this._xhr.onreadystatechange = hd, e)
        try {
          this._xhr.abort();
        } catch {
        }
      typeof document < "u" && delete an.requests[this._index], this._xhr = null;
    }
  }
  /**
   * Called upon load.
   *
   * @private
   */
  _onLoad() {
    const e = this._xhr.responseText;
    e !== null && (this.emitReserved("data", e), this.emitReserved("success"), this._cleanup());
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
an.requestsCount = 0;
an.requests = {};
if (typeof document < "u") {
  if (typeof attachEvent == "function")
    attachEvent("onunload", ga);
  else if (typeof addEventListener == "function") {
    const t = "onpagehide" in Ht ? "pagehide" : "unload";
    addEventListener(t, ga, !1);
  }
}
function ga() {
  for (let t in an.requests)
    an.requests.hasOwnProperty(t) && an.requests[t].abort();
}
const pd = function() {
  const t = Kl({
    xdomain: !1
  });
  return t && t.responseType !== null;
}();
class gd extends dd {
  constructor(e) {
    super(e);
    const n = e && e.forceBase64;
    this.supportsBinary = pd && !n;
  }
  request(e = {}) {
    return Object.assign(e, { xd: this.xd }, this.opts), new an(Kl, this.uri(), e);
  }
}
function Kl(t) {
  const e = t.xdomain;
  try {
    if (typeof XMLHttpRequest < "u" && (!e || fd))
      return new XMLHttpRequest();
  } catch {
  }
  if (!e)
    try {
      return new Ht[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
    } catch {
    }
}
const Gl = typeof navigator < "u" && typeof navigator.product == "string" && navigator.product.toLowerCase() === "reactnative";
class md extends to {
  get name() {
    return "websocket";
  }
  doOpen() {
    const e = this.uri(), n = this.opts.protocols, s = Gl ? {} : ql(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
    this.opts.extraHeaders && (s.headers = this.opts.extraHeaders);
    try {
      this.ws = this.createSocket(e, n, s);
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
    }, this.ws.onclose = (e) => this.onClose({
      description: "websocket connection closed",
      context: e
    }), this.ws.onmessage = (e) => this.onData(e.data), this.ws.onerror = (e) => this.onError("websocket error", e);
  }
  write(e) {
    this.writable = !1;
    for (let n = 0; n < e.length; n++) {
      const s = e[n], r = n === e.length - 1;
      Qi(s, this.supportsBinary, (i) => {
        try {
          this.doWrite(s, i);
        } catch {
        }
        r && Lr(() => {
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
    const e = this.opts.secure ? "wss" : "ws", n = this.query || {};
    return this.opts.timestampRequests && (n[this.opts.timestampParam] = jl()), this.supportsBinary || (n.b64 = 1), this.createUri(e, n);
  }
}
const Qr = Ht.WebSocket || Ht.MozWebSocket;
class _d extends md {
  createSocket(e, n, s) {
    return Gl ? new Qr(e, n, s) : n ? new Qr(e, n) : new Qr(e);
  }
  doWrite(e, n) {
    this.ws.send(n);
  }
}
class yd extends to {
  get name() {
    return "webtransport";
  }
  doOpen() {
    try {
      this._transport = new WebTransport(this.createUri("https"), this.opts.transportOptions[this.name]);
    } catch (e) {
      return this.emitReserved("error", e);
    }
    this._transport.closed.then(() => {
      this.onClose();
    }).catch((e) => {
      this.onError("webtransport error", e);
    }), this._transport.ready.then(() => {
      this._transport.createBidirectionalStream().then((e) => {
        const n = Qh(Number.MAX_SAFE_INTEGER, this.socket.binaryType), s = e.readable.pipeThrough(n).getReader(), r = Jh();
        r.readable.pipeTo(e.writable), this._writer = r.writable.getWriter();
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
  write(e) {
    this.writable = !1;
    for (let n = 0; n < e.length; n++) {
      const s = e[n], r = n === e.length - 1;
      this._writer.write(s).then(() => {
        r && Lr(() => {
          this.writable = !0, this.emitReserved("drain");
        }, this.setTimeoutFn);
      });
    }
  }
  doClose() {
    var e;
    (e = this._transport) === null || e === void 0 || e.close();
  }
}
const vd = {
  websocket: _d,
  webtransport: yd,
  polling: gd
}, bd = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/, wd = [
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
function bi(t) {
  if (t.length > 8e3)
    throw "URI too long";
  const e = t, n = t.indexOf("["), s = t.indexOf("]");
  n != -1 && s != -1 && (t = t.substring(0, n) + t.substring(n, s).replace(/:/g, ";") + t.substring(s, t.length));
  let r = bd.exec(t || ""), i = {}, o = 14;
  for (; o--; )
    i[wd[o]] = r[o] || "";
  return n != -1 && s != -1 && (i.source = e, i.host = i.host.substring(1, i.host.length - 1).replace(/;/g, ":"), i.authority = i.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), i.ipv6uri = !0), i.pathNames = kd(i, i.path), i.queryKey = xd(i, i.query), i;
}
function kd(t, e) {
  const n = /\/{2,9}/g, s = e.replace(n, "/").split("/");
  return (e.slice(0, 1) == "/" || e.length === 0) && s.splice(0, 1), e.slice(-1) == "/" && s.splice(s.length - 1, 1), s;
}
function xd(t, e) {
  const n = {};
  return e.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function(s, r, i) {
    r && (n[r] = i);
  }), n;
}
const wi = typeof addEventListener == "function" && typeof removeEventListener == "function", or = [];
wi && addEventListener("offline", () => {
  or.forEach((t) => t());
}, !1);
class Ln extends pt {
  /**
   * Socket constructor.
   *
   * @param {String|Object} uri - uri or options
   * @param {Object} opts - options
   */
  constructor(e, n) {
    if (super(), this.binaryType = td, this.writeBuffer = [], this._prevBufferLen = 0, this._pingInterval = -1, this._pingTimeout = -1, this._maxPayload = -1, this._pingTimeoutTime = 1 / 0, e && typeof e == "object" && (n = e, e = null), e) {
      const s = bi(e);
      n.hostname = s.host, n.secure = s.protocol === "https" || s.protocol === "wss", n.port = s.port, s.query && (n.query = s.query);
    } else n.host && (n.hostname = bi(n.host).host);
    Ir(this, n), this.secure = n.secure != null ? n.secure : typeof location < "u" && location.protocol === "https:", n.hostname && !n.port && (n.port = this.secure ? "443" : "80"), this.hostname = n.hostname || (typeof location < "u" ? location.hostname : "localhost"), this.port = n.port || (typeof location < "u" && location.port ? location.port : this.secure ? "443" : "80"), this.transports = [], this._transportsByName = {}, n.transports.forEach((s) => {
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
    }, n), this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : ""), typeof this.opts.query == "string" && (this.opts.query = ld(this.opts.query)), wi && (this.opts.closeOnBeforeunload && (this._beforeunloadEventListener = () => {
      this.transport && (this.transport.removeAllListeners(), this.transport.close());
    }, addEventListener("beforeunload", this._beforeunloadEventListener, !1)), this.hostname !== "localhost" && (this._offlineEventListener = () => {
      this._onClose("transport close", {
        description: "network connection lost"
      });
    }, or.push(this._offlineEventListener))), this.opts.withCredentials && (this._cookieJar = void 0), this._open();
  }
  /**
   * Creates transport of the given type.
   *
   * @param {String} name - transport name
   * @return {Transport}
   * @private
   */
  createTransport(e) {
    const n = Object.assign({}, this.opts.query);
    n.EIO = Wl, n.transport = e, this.id && (n.sid = this.id);
    const s = Object.assign({}, this.opts, {
      query: n,
      socket: this,
      hostname: this.hostname,
      secure: this.secure,
      port: this.port
    }, this.opts.transportOptions[e]);
    return new this._transportsByName[e](s);
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
    const e = this.opts.rememberUpgrade && Ln.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1 ? "websocket" : this.transports[0];
    this.readyState = "opening";
    const n = this.createTransport(e);
    n.open(), this.setTransport(n);
  }
  /**
   * Sets the current transport. Disables the existing one (if any).
   *
   * @private
   */
  setTransport(e) {
    this.transport && this.transport.removeAllListeners(), this.transport = e, e.on("drain", this._onDrain.bind(this)).on("packet", this._onPacket.bind(this)).on("error", this._onError.bind(this)).on("close", (n) => this._onClose("transport close", n));
  }
  /**
   * Called when connection is deemed open.
   *
   * @private
   */
  onOpen() {
    this.readyState = "open", Ln.priorWebsocketSuccess = this.transport.name === "websocket", this.emitReserved("open"), this.flush();
  }
  /**
   * Handles a packet.
   *
   * @private
   */
  _onPacket(e) {
    if (this.readyState === "opening" || this.readyState === "open" || this.readyState === "closing")
      switch (this.emitReserved("packet", e), this.emitReserved("heartbeat"), e.type) {
        case "open":
          this.onHandshake(JSON.parse(e.data));
          break;
        case "ping":
          this._sendPacket("pong"), this.emitReserved("ping"), this.emitReserved("pong"), this._resetPingTimeout();
          break;
        case "error":
          const n = new Error("server error");
          n.code = e.data, this._onError(n);
          break;
        case "message":
          this.emitReserved("data", e.data), this.emitReserved("message", e.data);
          break;
      }
  }
  /**
   * Called upon handshake completion.
   *
   * @param {Object} data - handshake obj
   * @private
   */
  onHandshake(e) {
    this.emitReserved("handshake", e), this.id = e.sid, this.transport.query.sid = e.sid, this._pingInterval = e.pingInterval, this._pingTimeout = e.pingTimeout, this._maxPayload = e.maxPayload, this.onOpen(), this.readyState !== "closed" && this._resetPingTimeout();
  }
  /**
   * Sets and resets ping timeout timer based on server pings.
   *
   * @private
   */
  _resetPingTimeout() {
    this.clearTimeoutFn(this._pingTimeoutTimer);
    const e = this._pingInterval + this._pingTimeout;
    this._pingTimeoutTime = Date.now() + e, this._pingTimeoutTimer = this.setTimeoutFn(() => {
      this._onClose("ping timeout");
    }, e), this.opts.autoUnref && this._pingTimeoutTimer.unref();
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
      const e = this._getWritablePackets();
      this.transport.send(e), this._prevBufferLen = e.length, this.emitReserved("flush");
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
      if (r && (n += id(r)), s > 0 && n > this._maxPayload)
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
    const e = Date.now() > this._pingTimeoutTime;
    return e && (this._pingTimeoutTime = 0, Lr(() => {
      this._onClose("ping timeout");
    }, this.setTimeoutFn)), e;
  }
  /**
   * Sends a message.
   *
   * @param {String} msg - message.
   * @param {Object} options.
   * @param {Function} fn - callback function.
   * @return {Socket} for chaining.
   */
  write(e, n, s) {
    return this._sendPacket("message", e, n, s), this;
  }
  /**
   * Sends a message. Alias of {@link Socket#write}.
   *
   * @param {String} msg - message.
   * @param {Object} options.
   * @param {Function} fn - callback function.
   * @return {Socket} for chaining.
   */
  send(e, n, s) {
    return this._sendPacket("message", e, n, s), this;
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
  _sendPacket(e, n, s, r) {
    if (typeof n == "function" && (r = n, n = void 0), typeof s == "function" && (r = s, s = null), this.readyState === "closing" || this.readyState === "closed")
      return;
    s = s || {}, s.compress = s.compress !== !1;
    const i = {
      type: e,
      data: n,
      options: s
    };
    this.emitReserved("packetCreate", i), this.writeBuffer.push(i), r && this.once("flush", r), this.flush();
  }
  /**
   * Closes the connection.
   */
  close() {
    const e = () => {
      this._onClose("forced close"), this.transport.close();
    }, n = () => {
      this.off("upgrade", n), this.off("upgradeError", n), e();
    }, s = () => {
      this.once("upgrade", n), this.once("upgradeError", n);
    };
    return (this.readyState === "opening" || this.readyState === "open") && (this.readyState = "closing", this.writeBuffer.length ? this.once("drain", () => {
      this.upgrading ? s() : e();
    }) : this.upgrading ? s() : e()), this;
  }
  /**
   * Called upon transport error
   *
   * @private
   */
  _onError(e) {
    if (Ln.priorWebsocketSuccess = !1, this.opts.tryAllTransports && this.transports.length > 1 && this.readyState === "opening")
      return this.transports.shift(), this._open();
    this.emitReserved("error", e), this._onClose("transport error", e);
  }
  /**
   * Called upon transport close.
   *
   * @private
   */
  _onClose(e, n) {
    if (this.readyState === "opening" || this.readyState === "open" || this.readyState === "closing") {
      if (this.clearTimeoutFn(this._pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), wi && (this._beforeunloadEventListener && removeEventListener("beforeunload", this._beforeunloadEventListener, !1), this._offlineEventListener)) {
        const s = or.indexOf(this._offlineEventListener);
        s !== -1 && or.splice(s, 1);
      }
      this.readyState = "closed", this.id = null, this.emitReserved("close", e, n), this.writeBuffer = [], this._prevBufferLen = 0;
    }
  }
}
Ln.protocol = Wl;
class Td extends Ln {
  constructor() {
    super(...arguments), this._upgrades = [];
  }
  onOpen() {
    if (super.onOpen(), this.readyState === "open" && this.opts.upgrade)
      for (let e = 0; e < this._upgrades.length; e++)
        this._probe(this._upgrades[e]);
  }
  /**
   * Probes a transport.
   *
   * @param {String} name - transport name
   * @private
   */
  _probe(e) {
    let n = this.createTransport(e), s = !1;
    Ln.priorWebsocketSuccess = !1;
    const r = () => {
      s || (n.send([{ type: "ping", data: "probe" }]), n.once("packet", (b) => {
        if (!s)
          if (b.type === "pong" && b.data === "probe") {
            if (this.upgrading = !0, this.emitReserved("upgrading", n), !n)
              return;
            Ln.priorWebsocketSuccess = n.name === "websocket", this.transport.pause(() => {
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
    function a() {
      o("transport closed");
    }
    function l() {
      o("socket closed");
    }
    function f(b) {
      n && b.name !== n.name && i();
    }
    const c = () => {
      n.removeListener("open", r), n.removeListener("error", o), n.removeListener("close", a), this.off("close", l), this.off("upgrading", f);
    };
    n.once("open", r), n.once("error", o), n.once("close", a), this.once("close", l), this.once("upgrading", f), this._upgrades.indexOf("webtransport") !== -1 && e !== "webtransport" ? this.setTimeoutFn(() => {
      s || n.open();
    }, 200) : n.open();
  }
  onHandshake(e) {
    this._upgrades = this._filterUpgrades(e.upgrades), super.onHandshake(e);
  }
  /**
   * Filters upgrades, returning only those matching client transports.
   *
   * @param {Array} upgrades - server upgrades
   * @private
   */
  _filterUpgrades(e) {
    const n = [];
    for (let s = 0; s < e.length; s++)
      ~this.transports.indexOf(e[s]) && n.push(e[s]);
    return n;
  }
}
let Sd = class extends Td {
  constructor(e, n = {}) {
    const s = typeof e == "object" ? e : n;
    (!s.transports || s.transports && typeof s.transports[0] == "string") && (s.transports = (s.transports || ["polling", "websocket", "webtransport"]).map((r) => vd[r]).filter((r) => !!r)), super(e, s);
  }
};
function Ad(t, e = "", n) {
  let s = t;
  n = n || typeof location < "u" && location, t == null && (t = n.protocol + "//" + n.host), typeof t == "string" && (t.charAt(0) === "/" && (t.charAt(1) === "/" ? t = n.protocol + t : t = n.host + t), /^(https?|wss?):\/\//.test(t) || (typeof n < "u" ? t = n.protocol + "//" + t : t = "https://" + t), s = bi(t)), s.port || (/^(http|ws)$/.test(s.protocol) ? s.port = "80" : /^(http|ws)s$/.test(s.protocol) && (s.port = "443")), s.path = s.path || "/";
  const i = s.host.indexOf(":") !== -1 ? "[" + s.host + "]" : s.host;
  return s.id = s.protocol + "://" + i + ":" + s.port + e, s.href = s.protocol + "://" + i + (n && n.port === s.port ? "" : ":" + s.port), s;
}
const Ed = typeof ArrayBuffer == "function", Cd = (t) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(t) : t.buffer instanceof ArrayBuffer, Yl = Object.prototype.toString, Rd = typeof Blob == "function" || typeof Blob < "u" && Yl.call(Blob) === "[object BlobConstructor]", Ld = typeof File == "function" || typeof File < "u" && Yl.call(File) === "[object FileConstructor]";
function no(t) {
  return Ed && (t instanceof ArrayBuffer || Cd(t)) || Rd && t instanceof Blob || Ld && t instanceof File;
}
function ar(t, e) {
  if (!t || typeof t != "object")
    return !1;
  if (Array.isArray(t)) {
    for (let n = 0, s = t.length; n < s; n++)
      if (ar(t[n]))
        return !0;
    return !1;
  }
  if (no(t))
    return !0;
  if (t.toJSON && typeof t.toJSON == "function" && arguments.length === 1)
    return ar(t.toJSON(), !0);
  for (const n in t)
    if (Object.prototype.hasOwnProperty.call(t, n) && ar(t[n]))
      return !0;
  return !1;
}
function Id(t) {
  const e = [], n = t.data, s = t;
  return s.data = ki(n, e), s.attachments = e.length, { packet: s, buffers: e };
}
function ki(t, e) {
  if (!t)
    return t;
  if (no(t)) {
    const n = { _placeholder: !0, num: e.length };
    return e.push(t), n;
  } else if (Array.isArray(t)) {
    const n = new Array(t.length);
    for (let s = 0; s < t.length; s++)
      n[s] = ki(t[s], e);
    return n;
  } else if (typeof t == "object" && !(t instanceof Date)) {
    const n = {};
    for (const s in t)
      Object.prototype.hasOwnProperty.call(t, s) && (n[s] = ki(t[s], e));
    return n;
  }
  return t;
}
function Od(t, e) {
  return t.data = xi(t.data, e), delete t.attachments, t;
}
function xi(t, e) {
  if (!t)
    return t;
  if (t && t._placeholder === !0) {
    if (typeof t.num == "number" && t.num >= 0 && t.num < e.length)
      return e[t.num];
    throw new Error("illegal attachments");
  } else if (Array.isArray(t))
    for (let n = 0; n < t.length; n++)
      t[n] = xi(t[n], e);
  else if (typeof t == "object")
    for (const n in t)
      Object.prototype.hasOwnProperty.call(t, n) && (t[n] = xi(t[n], e));
  return t;
}
const Pd = [
  "connect",
  "connect_error",
  "disconnect",
  "disconnecting",
  "newListener",
  "removeListener"
  // used by the Node.js EventEmitter
], Nd = 5;
var Ee;
(function(t) {
  t[t.CONNECT = 0] = "CONNECT", t[t.DISCONNECT = 1] = "DISCONNECT", t[t.EVENT = 2] = "EVENT", t[t.ACK = 3] = "ACK", t[t.CONNECT_ERROR = 4] = "CONNECT_ERROR", t[t.BINARY_EVENT = 5] = "BINARY_EVENT", t[t.BINARY_ACK = 6] = "BINARY_ACK";
})(Ee || (Ee = {}));
class Md {
  /**
   * Encoder constructor
   *
   * @param {function} replacer - custom replacer to pass down to JSON.parse
   */
  constructor(e) {
    this.replacer = e;
  }
  /**
   * Encode a packet as a single string if non-binary, or as a
   * buffer sequence, depending on packet type.
   *
   * @param {Object} obj - packet object
   */
  encode(e) {
    return (e.type === Ee.EVENT || e.type === Ee.ACK) && ar(e) ? this.encodeAsBinary({
      type: e.type === Ee.EVENT ? Ee.BINARY_EVENT : Ee.BINARY_ACK,
      nsp: e.nsp,
      data: e.data,
      id: e.id
    }) : [this.encodeAsString(e)];
  }
  /**
   * Encode packet as string.
   */
  encodeAsString(e) {
    let n = "" + e.type;
    return (e.type === Ee.BINARY_EVENT || e.type === Ee.BINARY_ACK) && (n += e.attachments + "-"), e.nsp && e.nsp !== "/" && (n += e.nsp + ","), e.id != null && (n += e.id), e.data != null && (n += JSON.stringify(e.data, this.replacer)), n;
  }
  /**
   * Encode packet as 'buffer sequence' by removing blobs, and
   * deconstructing packet into object with placeholders and
   * a list of buffers.
   */
  encodeAsBinary(e) {
    const n = Id(e), s = this.encodeAsString(n.packet), r = n.buffers;
    return r.unshift(s), r;
  }
}
function ma(t) {
  return Object.prototype.toString.call(t) === "[object Object]";
}
class so extends pt {
  /**
   * Decoder constructor
   *
   * @param {function} reviver - custom reviver to pass down to JSON.stringify
   */
  constructor(e) {
    super(), this.reviver = e;
  }
  /**
   * Decodes an encoded packet string into packet JSON.
   *
   * @param {String} obj - encoded packet
   */
  add(e) {
    let n;
    if (typeof e == "string") {
      if (this.reconstructor)
        throw new Error("got plaintext data when reconstructing a packet");
      n = this.decodeString(e);
      const s = n.type === Ee.BINARY_EVENT;
      s || n.type === Ee.BINARY_ACK ? (n.type = s ? Ee.EVENT : Ee.ACK, this.reconstructor = new Dd(n), n.attachments === 0 && super.emitReserved("decoded", n)) : super.emitReserved("decoded", n);
    } else if (no(e) || e.base64)
      if (this.reconstructor)
        n = this.reconstructor.takeBinaryData(e), n && (this.reconstructor = null, super.emitReserved("decoded", n));
      else
        throw new Error("got binary data when not reconstructing a packet");
    else
      throw new Error("Unknown type: " + e);
  }
  /**
   * Decode a packet String (JSON data)
   *
   * @param {String} str
   * @return {Object} packet
   */
  decodeString(e) {
    let n = 0;
    const s = {
      type: Number(e.charAt(0))
    };
    if (Ee[s.type] === void 0)
      throw new Error("unknown packet type " + s.type);
    if (s.type === Ee.BINARY_EVENT || s.type === Ee.BINARY_ACK) {
      const i = n + 1;
      for (; e.charAt(++n) !== "-" && n != e.length; )
        ;
      const o = e.substring(i, n);
      if (o != Number(o) || e.charAt(n) !== "-")
        throw new Error("Illegal attachments");
      s.attachments = Number(o);
    }
    if (e.charAt(n + 1) === "/") {
      const i = n + 1;
      for (; ++n && !(e.charAt(n) === "," || n === e.length); )
        ;
      s.nsp = e.substring(i, n);
    } else
      s.nsp = "/";
    const r = e.charAt(n + 1);
    if (r !== "" && Number(r) == r) {
      const i = n + 1;
      for (; ++n; ) {
        const o = e.charAt(n);
        if (o == null || Number(o) != o) {
          --n;
          break;
        }
        if (n === e.length)
          break;
      }
      s.id = Number(e.substring(i, n + 1));
    }
    if (e.charAt(++n)) {
      const i = this.tryParse(e.substr(n));
      if (so.isPayloadValid(s.type, i))
        s.data = i;
      else
        throw new Error("invalid payload");
    }
    return s;
  }
  tryParse(e) {
    try {
      return JSON.parse(e, this.reviver);
    } catch {
      return !1;
    }
  }
  static isPayloadValid(e, n) {
    switch (e) {
      case Ee.CONNECT:
        return ma(n);
      case Ee.DISCONNECT:
        return n === void 0;
      case Ee.CONNECT_ERROR:
        return typeof n == "string" || ma(n);
      case Ee.EVENT:
      case Ee.BINARY_EVENT:
        return Array.isArray(n) && (typeof n[0] == "number" || typeof n[0] == "string" && Pd.indexOf(n[0]) === -1);
      case Ee.ACK:
      case Ee.BINARY_ACK:
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
class Dd {
  constructor(e) {
    this.packet = e, this.buffers = [], this.reconPack = e;
  }
  /**
   * Method to be called when binary data received from connection
   * after a BINARY_EVENT packet.
   *
   * @param {Buffer | ArrayBuffer} binData - the raw binary data received
   * @return {null | Object} returns null if more binary data is expected or
   *   a reconstructed packet object if all buffers have been received.
   */
  takeBinaryData(e) {
    if (this.buffers.push(e), this.buffers.length === this.reconPack.attachments) {
      const n = Od(this.reconPack, this.buffers);
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
const Fd = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Decoder: so,
  Encoder: Md,
  get PacketType() {
    return Ee;
  },
  protocol: Nd
}, Symbol.toStringTag, { value: "Module" }));
function Xt(t, e, n) {
  return t.on(e, n), function() {
    t.off(e, n);
  };
}
const $d = Object.freeze({
  connect: 1,
  connect_error: 1,
  disconnect: 1,
  disconnecting: 1,
  // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
  newListener: 1,
  removeListener: 1
});
class Zl extends pt {
  /**
   * `Socket` constructor.
   */
  constructor(e, n, s) {
    super(), this.connected = !1, this.recovered = !1, this.receiveBuffer = [], this.sendBuffer = [], this._queue = [], this._queueSeq = 0, this.ids = 0, this.acks = {}, this.flags = {}, this.io = e, this.nsp = n, s && s.auth && (this.auth = s.auth), this._opts = Object.assign({}, s), this.io._autoConnect && this.open();
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
    const e = this.io;
    this.subs = [
      Xt(e, "open", this.onopen.bind(this)),
      Xt(e, "packet", this.onpacket.bind(this)),
      Xt(e, "error", this.onerror.bind(this)),
      Xt(e, "close", this.onclose.bind(this))
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
  send(...e) {
    return e.unshift("message"), this.emit.apply(this, e), this;
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
  emit(e, ...n) {
    var s, r, i;
    if ($d.hasOwnProperty(e))
      throw new Error('"' + e.toString() + '" is a reserved event name');
    if (n.unshift(e), this._opts.retries && !this.flags.fromQueue && !this.flags.volatile)
      return this._addToQueue(n), this;
    const o = {
      type: Ee.EVENT,
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
  _registerAckCallback(e, n) {
    var s;
    const r = (s = this.flags.timeout) !== null && s !== void 0 ? s : this._opts.ackTimeout;
    if (r === void 0) {
      this.acks[e] = n;
      return;
    }
    const i = this.io.setTimeoutFn(() => {
      delete this.acks[e];
      for (let a = 0; a < this.sendBuffer.length; a++)
        this.sendBuffer[a].id === e && this.sendBuffer.splice(a, 1);
      n.call(this, new Error("operation has timed out"));
    }, r), o = (...a) => {
      this.io.clearTimeoutFn(i), n.apply(this, a);
    };
    o.withError = !0, this.acks[e] = o;
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
  emitWithAck(e, ...n) {
    return new Promise((s, r) => {
      const i = (o, a) => o ? r(o) : s(a);
      i.withError = !0, n.push(i), this.emit(e, ...n);
    });
  }
  /**
   * Add the packet to the queue.
   * @param args
   * @private
   */
  _addToQueue(e) {
    let n;
    typeof e[e.length - 1] == "function" && (n = e.pop());
    const s = {
      id: this._queueSeq++,
      tryCount: 0,
      pending: !1,
      args: e,
      flags: Object.assign({ fromQueue: !0 }, this.flags)
    };
    e.push((r, ...i) => s !== this._queue[0] ? void 0 : (r !== null ? s.tryCount > this._opts.retries && (this._queue.shift(), n && n(r)) : (this._queue.shift(), n && n(null, ...i)), s.pending = !1, this._drainQueue())), this._queue.push(s), this._drainQueue();
  }
  /**
   * Send the first packet of the queue, and wait for an acknowledgement from the server.
   * @param force - whether to resend a packet that has not been acknowledged yet
   *
   * @private
   */
  _drainQueue(e = !1) {
    if (!this.connected || this._queue.length === 0)
      return;
    const n = this._queue[0];
    n.pending && !e || (n.pending = !0, n.tryCount++, this.flags = n.flags, this.emit.apply(this, n.args));
  }
  /**
   * Sends a packet.
   *
   * @param packet
   * @private
   */
  packet(e) {
    e.nsp = this.nsp, this.io._packet(e);
  }
  /**
   * Called upon engine `open`.
   *
   * @private
   */
  onopen() {
    typeof this.auth == "function" ? this.auth((e) => {
      this._sendConnectPacket(e);
    }) : this._sendConnectPacket(this.auth);
  }
  /**
   * Sends a CONNECT packet to initiate the Socket.IO session.
   *
   * @param data
   * @private
   */
  _sendConnectPacket(e) {
    this.packet({
      type: Ee.CONNECT,
      data: this._pid ? Object.assign({ pid: this._pid, offset: this._lastOffset }, e) : e
    });
  }
  /**
   * Called upon engine or manager `error`.
   *
   * @param err
   * @private
   */
  onerror(e) {
    this.connected || this.emitReserved("connect_error", e);
  }
  /**
   * Called upon engine `close`.
   *
   * @param reason
   * @param description
   * @private
   */
  onclose(e, n) {
    this.connected = !1, delete this.id, this.emitReserved("disconnect", e, n), this._clearAcks();
  }
  /**
   * Clears the acknowledgement handlers upon disconnection, since the client will never receive an acknowledgement from
   * the server.
   *
   * @private
   */
  _clearAcks() {
    Object.keys(this.acks).forEach((e) => {
      if (!this.sendBuffer.some((s) => String(s.id) === e)) {
        const s = this.acks[e];
        delete this.acks[e], s.withError && s.call(this, new Error("socket has been disconnected"));
      }
    });
  }
  /**
   * Called with socket packet.
   *
   * @param packet
   * @private
   */
  onpacket(e) {
    if (e.nsp === this.nsp)
      switch (e.type) {
        case Ee.CONNECT:
          e.data && e.data.sid ? this.onconnect(e.data.sid, e.data.pid) : this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
          break;
        case Ee.EVENT:
        case Ee.BINARY_EVENT:
          this.onevent(e);
          break;
        case Ee.ACK:
        case Ee.BINARY_ACK:
          this.onack(e);
          break;
        case Ee.DISCONNECT:
          this.ondisconnect();
          break;
        case Ee.CONNECT_ERROR:
          this.destroy();
          const s = new Error(e.data.message);
          s.data = e.data.data, this.emitReserved("connect_error", s);
          break;
      }
  }
  /**
   * Called upon a server event.
   *
   * @param packet
   * @private
   */
  onevent(e) {
    const n = e.data || [];
    e.id != null && n.push(this.ack(e.id)), this.connected ? this.emitEvent(n) : this.receiveBuffer.push(Object.freeze(n));
  }
  emitEvent(e) {
    if (this._anyListeners && this._anyListeners.length) {
      const n = this._anyListeners.slice();
      for (const s of n)
        s.apply(this, e);
    }
    super.emit.apply(this, e), this._pid && e.length && typeof e[e.length - 1] == "string" && (this._lastOffset = e[e.length - 1]);
  }
  /**
   * Produces an ack callback to emit with an event.
   *
   * @private
   */
  ack(e) {
    const n = this;
    let s = !1;
    return function(...r) {
      s || (s = !0, n.packet({
        type: Ee.ACK,
        id: e,
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
  onack(e) {
    const n = this.acks[e.id];
    typeof n == "function" && (delete this.acks[e.id], n.withError && e.data.unshift(null), n.apply(this, e.data));
  }
  /**
   * Called upon server connect.
   *
   * @private
   */
  onconnect(e, n) {
    this.id = e, this.recovered = n && this._pid === n, this._pid = n, this.connected = !0, this.emitBuffered(), this.emitReserved("connect"), this._drainQueue(!0);
  }
  /**
   * Emit buffered events (received and emitted).
   *
   * @private
   */
  emitBuffered() {
    this.receiveBuffer.forEach((e) => this.emitEvent(e)), this.receiveBuffer = [], this.sendBuffer.forEach((e) => {
      this.notifyOutgoingListeners(e), this.packet(e);
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
    this.subs && (this.subs.forEach((e) => e()), this.subs = void 0), this.io._destroy(this);
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
    return this.connected && this.packet({ type: Ee.DISCONNECT }), this.destroy(), this.connected && this.onclose("io client disconnect"), this;
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
  compress(e) {
    return this.flags.compress = e, this;
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
  timeout(e) {
    return this.flags.timeout = e, this;
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
  onAny(e) {
    return this._anyListeners = this._anyListeners || [], this._anyListeners.push(e), this;
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
  prependAny(e) {
    return this._anyListeners = this._anyListeners || [], this._anyListeners.unshift(e), this;
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
  offAny(e) {
    if (!this._anyListeners)
      return this;
    if (e) {
      const n = this._anyListeners;
      for (let s = 0; s < n.length; s++)
        if (e === n[s])
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
  onAnyOutgoing(e) {
    return this._anyOutgoingListeners = this._anyOutgoingListeners || [], this._anyOutgoingListeners.push(e), this;
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
  prependAnyOutgoing(e) {
    return this._anyOutgoingListeners = this._anyOutgoingListeners || [], this._anyOutgoingListeners.unshift(e), this;
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
  offAnyOutgoing(e) {
    if (!this._anyOutgoingListeners)
      return this;
    if (e) {
      const n = this._anyOutgoingListeners;
      for (let s = 0; s < n.length; s++)
        if (e === n[s])
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
  notifyOutgoingListeners(e) {
    if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
      const n = this._anyOutgoingListeners.slice();
      for (const s of n)
        s.apply(this, e.data);
    }
  }
}
function os(t) {
  t = t || {}, this.ms = t.min || 100, this.max = t.max || 1e4, this.factor = t.factor || 2, this.jitter = t.jitter > 0 && t.jitter <= 1 ? t.jitter : 0, this.attempts = 0;
}
os.prototype.duration = function() {
  var t = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var e = Math.random(), n = Math.floor(e * this.jitter * t);
    t = (Math.floor(e * 10) & 1) == 0 ? t - n : t + n;
  }
  return Math.min(t, this.max) | 0;
};
os.prototype.reset = function() {
  this.attempts = 0;
};
os.prototype.setMin = function(t) {
  this.ms = t;
};
os.prototype.setMax = function(t) {
  this.max = t;
};
os.prototype.setJitter = function(t) {
  this.jitter = t;
};
class Ti extends pt {
  constructor(e, n) {
    var s;
    super(), this.nsps = {}, this.subs = [], e && typeof e == "object" && (n = e, e = void 0), n = n || {}, n.path = n.path || "/socket.io", this.opts = n, Ir(this, n), this.reconnection(n.reconnection !== !1), this.reconnectionAttempts(n.reconnectionAttempts || 1 / 0), this.reconnectionDelay(n.reconnectionDelay || 1e3), this.reconnectionDelayMax(n.reconnectionDelayMax || 5e3), this.randomizationFactor((s = n.randomizationFactor) !== null && s !== void 0 ? s : 0.5), this.backoff = new os({
      min: this.reconnectionDelay(),
      max: this.reconnectionDelayMax(),
      jitter: this.randomizationFactor()
    }), this.timeout(n.timeout == null ? 2e4 : n.timeout), this._readyState = "closed", this.uri = e;
    const r = n.parser || Fd;
    this.encoder = new r.Encoder(), this.decoder = new r.Decoder(), this._autoConnect = n.autoConnect !== !1, this._autoConnect && this.open();
  }
  reconnection(e) {
    return arguments.length ? (this._reconnection = !!e, e || (this.skipReconnect = !0), this) : this._reconnection;
  }
  reconnectionAttempts(e) {
    return e === void 0 ? this._reconnectionAttempts : (this._reconnectionAttempts = e, this);
  }
  reconnectionDelay(e) {
    var n;
    return e === void 0 ? this._reconnectionDelay : (this._reconnectionDelay = e, (n = this.backoff) === null || n === void 0 || n.setMin(e), this);
  }
  randomizationFactor(e) {
    var n;
    return e === void 0 ? this._randomizationFactor : (this._randomizationFactor = e, (n = this.backoff) === null || n === void 0 || n.setJitter(e), this);
  }
  reconnectionDelayMax(e) {
    var n;
    return e === void 0 ? this._reconnectionDelayMax : (this._reconnectionDelayMax = e, (n = this.backoff) === null || n === void 0 || n.setMax(e), this);
  }
  timeout(e) {
    return arguments.length ? (this._timeout = e, this) : this._timeout;
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
  open(e) {
    if (~this._readyState.indexOf("open"))
      return this;
    this.engine = new Sd(this.uri, this.opts);
    const n = this.engine, s = this;
    this._readyState = "opening", this.skipReconnect = !1;
    const r = Xt(n, "open", function() {
      s.onopen(), e && e();
    }), i = (a) => {
      this.cleanup(), this._readyState = "closed", this.emitReserved("error", a), e ? e(a) : this.maybeReconnectOnOpen();
    }, o = Xt(n, "error", i);
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
  connect(e) {
    return this.open(e);
  }
  /**
   * Called upon transport open.
   *
   * @private
   */
  onopen() {
    this.cleanup(), this._readyState = "open", this.emitReserved("open");
    const e = this.engine;
    this.subs.push(
      Xt(e, "ping", this.onping.bind(this)),
      Xt(e, "data", this.ondata.bind(this)),
      Xt(e, "error", this.onerror.bind(this)),
      Xt(e, "close", this.onclose.bind(this)),
      // @ts-ignore
      Xt(this.decoder, "decoded", this.ondecoded.bind(this))
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
  ondata(e) {
    try {
      this.decoder.add(e);
    } catch (n) {
      this.onclose("parse error", n);
    }
  }
  /**
   * Called when parser fully decodes a packet.
   *
   * @private
   */
  ondecoded(e) {
    Lr(() => {
      this.emitReserved("packet", e);
    }, this.setTimeoutFn);
  }
  /**
   * Called upon socket error.
   *
   * @private
   */
  onerror(e) {
    this.emitReserved("error", e);
  }
  /**
   * Creates a new socket for the given `nsp`.
   *
   * @return {Socket}
   * @public
   */
  socket(e, n) {
    let s = this.nsps[e];
    return s ? this._autoConnect && !s.active && s.connect() : (s = new Zl(this, e, n), this.nsps[e] = s), s;
  }
  /**
   * Called upon a socket close.
   *
   * @param socket
   * @private
   */
  _destroy(e) {
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
  _packet(e) {
    const n = this.encoder.encode(e);
    for (let s = 0; s < n.length; s++)
      this.engine.write(n[s], e.options);
  }
  /**
   * Clean up transport subscriptions and packet buffer.
   *
   * @private
   */
  cleanup() {
    this.subs.forEach((e) => e()), this.subs.length = 0, this.decoder.destroy();
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
  onclose(e, n) {
    var s;
    this.cleanup(), (s = this.engine) === null || s === void 0 || s.close(), this.backoff.reset(), this._readyState = "closed", this.emitReserved("close", e, n), this._reconnection && !this.skipReconnect && this.reconnect();
  }
  /**
   * Attempt a reconnection.
   *
   * @private
   */
  reconnect() {
    if (this._reconnecting || this.skipReconnect)
      return this;
    const e = this;
    if (this.backoff.attempts >= this._reconnectionAttempts)
      this.backoff.reset(), this.emitReserved("reconnect_failed"), this._reconnecting = !1;
    else {
      const n = this.backoff.duration();
      this._reconnecting = !0;
      const s = this.setTimeoutFn(() => {
        e.skipReconnect || (this.emitReserved("reconnect_attempt", e.backoff.attempts), !e.skipReconnect && e.open((r) => {
          r ? (e._reconnecting = !1, e.reconnect(), this.emitReserved("reconnect_error", r)) : e.onreconnect();
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
    const e = this.backoff.attempts;
    this._reconnecting = !1, this.backoff.reset(), this.emitReserved("reconnect", e);
  }
}
const ws = {};
function lr(t, e) {
  typeof t == "object" && (e = t, t = void 0), e = e || {};
  const n = Ad(t, e.path || "/socket.io"), s = n.source, r = n.id, i = n.path, o = ws[r] && i in ws[r].nsps, a = e.forceNew || e["force new connection"] || e.multiplex === !1 || o;
  let l;
  return a ? l = new Ti(s, e) : (ws[r] || (ws[r] = new Ti(s, e)), l = ws[r]), n.query && !e.query && (e.query = n.queryKey), l.socket(n.path, e);
}
Object.assign(lr, {
  Manager: Ti,
  Socket: Zl,
  io: lr,
  connect: lr
});
function Bd() {
  const t = de([]), e = de(!1), n = de(""), s = de(!1), r = de(!1), i = de(!1), o = de("connecting"), a = de(0), l = 5, f = de({}), c = de(null), b = de("");
  let v = null, D = null, $ = null, Y = null, Ae, ne;
  const Se = (W) => {
    Ae = W, W && localStorage.setItem("ctid", W);
  }, we = (W) => {
    ne = W;
  }, U = (W) => {
    const ae = Ae || localStorage.getItem("ctid"), _e = {};
    return ae && (_e.conversation_token = ae), ne && (_e.widget_id = ne), v = lr(`${Rn.WS_URL}/widget`, {
      transports: ["websocket"],
      reconnection: !0,
      reconnectionAttempts: l,
      reconnectionDelay: 1e3,
      auth: Object.keys(_e).length > 0 ? _e : void 0
    }), v.on("connect", () => {
      o.value = "connected", a.value = 0;
    }), v.on("disconnect", () => {
      o.value === "connected" && (console.log("Socket disconnected, setting connection status to connecting"), o.value = "connecting");
    }), v.on("connect_error", () => {
      a.value++, console.error("Socket connection failed, attempt:", a.value, "connection status:", o.value), a.value >= l && (o.value = "failed");
    }), v.on("chat_response", (V) => {
      if (e.value = !1, V.session_id ? (console.log("Captured session_id from chat_response:", V.session_id), b.value = V.session_id) : console.warn("No session_id in chat_response data:", V), V.type === "agent_message") {
        const je = {
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
        V.attachments && Array.isArray(V.attachments) && (je.id = V.message_id, je.attachments = V.attachments.map((Qe, mt) => ({
          id: V.message_id * 1e3 + mt,
          filename: Qe.filename,
          file_url: Qe.file_url,
          content_type: Qe.content_type,
          file_size: Qe.file_size
        }))), t.value.push(je);
      } else V.shopify_output && typeof V.shopify_output == "object" && V.shopify_output.products ? t.value.push({
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
      }) : t.value.push({
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
      t.value.push({
        message: `${V.user_name} joined the conversation`,
        message_type: "system",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: V.session_id
      }), f.value = {
        ...f.value,
        human_agent_name: V.user_name,
        human_agent_profile_pic: V.profile_picture
      }, D && D(V);
    }), v.on("session_initialized", (V) => {
      V.session_id && (console.log("Initialized session_id from session_initialized:", V.session_id), b.value = V.session_id);
    }), v.on("error", We), v.on("chat_history", ke), v.on("rating_submitted", fe), v.on("display_form", qe), v.on("form_submitted", Ze), v.on("workflow_state", it), v.on("workflow_proceeded", ie), v;
  }, H = async () => {
    try {
      return o.value = "connecting", a.value = 0, v && (v.removeAllListeners(), v.disconnect(), v = null), v = U(""), new Promise((W) => {
        v == null || v.on("connect", () => {
          W(!0);
        }), v == null || v.on("connect_error", () => {
          a.value >= l && W(!1);
        });
      });
    } catch (W) {
      return console.error("Socket initialization failed:", W), o.value = "failed", !1;
    }
  }, Q = () => (v && v.disconnect(), H()), j = (W) => {
    D = W;
  }, Le = (W) => {
    $ = W;
  }, nt = (W) => {
    Y = W;
  }, We = (W) => {
    e.value = !1, n.value = Ff(W), s.value = !0, setTimeout(() => {
      s.value = !1, n.value = "";
    }, 5e3);
  }, ke = (W) => {
    if (W.type === "chat_history" && Array.isArray(W.messages)) {
      const ae = W.messages.map((_e) => {
        var je;
        const V = {
          message: _e.message,
          message_type: _e.message_type,
          created_at: _e.created_at,
          session_id: "",
          agent_name: _e.agent_name || "",
          user_name: _e.user_name || "",
          attributes: _e.attributes || {},
          attachments: _e.attachments || []
          // Include attachments
        };
        return (je = _e.attributes) != null && je.shopify_output && typeof _e.attributes.shopify_output == "object" ? {
          ...V,
          message_type: "product",
          shopify_output: _e.attributes.shopify_output
        } : V;
      });
      t.value = [
        ...ae.filter(
          (_e) => !t.value.some(
            (V) => V.message === _e.message && V.created_at === _e.created_at
          )
        ),
        ...t.value
      ];
    }
  }, fe = (W) => {
    W.success && t.value.push({
      message: "Thank you for your feedback!",
      message_type: "system",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: ""
    });
  }, qe = (W) => {
    var ae;
    console.log("Form display handler in composable:", W), e.value = !1, c.value = W.form_data, console.log("Set currentForm in handleDisplayForm:", c.value), ((ae = W.form_data) == null ? void 0 : ae.form_full_screen) === !0 ? (console.log("Full screen form detected, triggering workflow state callback"), $ && $({
      type: "form",
      form_data: W.form_data,
      session_id: W.session_id
    })) : t.value.push({
      message: "",
      message_type: "form",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: W.session_id,
      attributes: {
        form_data: W.form_data
      }
    });
  }, Ze = (W) => {
    console.log("Form submitted confirmation received, clearing currentForm"), c.value = null, W.success && console.log("Form submitted successfully");
  }, it = (W) => {
    console.log("Workflow state received in composable:", W), (W.type === "form" || W.type === "display_form") && (console.log("Setting currentForm from workflow state:", W.form_data), c.value = W.form_data), $ && $(W);
  }, ie = (W) => {
    console.log("Workflow proceeded in composable:", W), Y && Y(W);
  };
  return {
    messages: t,
    loading: e,
    errorMessage: n,
    showError: s,
    loadingHistory: r,
    hasStartedChat: i,
    connectionStatus: o,
    sendMessage: async (W, ae, _e = []) => {
      if (!v || !W.trim() && _e.length === 0) return;
      f.value.human_agent_name || (e.value = !0);
      const V = {
        message: W,
        message_type: "user",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: ""
      };
      _e.length > 0 && (V.attachments = _e.map((je, Qe) => {
        let mt = "";
        if (je.content_type.startsWith("image/")) {
          const Nt = atob(je.content), d = new Array(Nt.length);
          for (let A = 0; A < Nt.length; A++)
            d[A] = Nt.charCodeAt(A);
          const g = new Uint8Array(d), k = new Blob([g], { type: je.content_type });
          mt = URL.createObjectURL(k);
        }
        return {
          id: Date.now() * 1e3 + Qe,
          // Temporary ID
          filename: je.filename,
          file_url: mt,
          // Temporary blob URL, will be replaced
          content_type: je.content_type,
          file_size: je.size,
          _isTemporary: !0
          // Flag to identify temporary attachments
        };
      })), t.value.push(V), v.emit("chat", {
        message: W,
        email: ae,
        files: _e
        // Send files with base64 content
      }), i.value = !0;
    },
    loadChatHistory: async () => {
      if (v)
        try {
          r.value = !0, v.emit("get_chat_history");
        } catch (W) {
          console.error("Failed to load chat history:", W);
        } finally {
          r.value = !1;
        }
    },
    connect: H,
    reconnect: Q,
    cleanup: () => {
      v && (v.removeAllListeners(), v.disconnect(), v = null), D = null, $ = null, Y = null;
    },
    humanAgent: f,
    onTakeover: j,
    submitRating: async (W, ae) => {
      !v || !W || v.emit("submit_rating", {
        rating: W,
        feedback: ae
      });
    },
    currentForm: c,
    submitForm: async (W) => {
      if (console.log("Submitting form in socket:", W), console.log("Current form in socket:", c.value), console.log("Socket in socket:", v), !v) {
        console.error("No socket available for form submission");
        return;
      }
      if (!W || Object.keys(W).length === 0) {
        console.error("No form data to submit");
        return;
      }
      console.log("Emitting submit_form event with data:", W), v.emit("submit_form", {
        form_data: W
      }), c.value = null;
    },
    getWorkflowState: async () => {
      v && (console.log("Getting workflow state 12"), v.emit("get_workflow_state"));
    },
    proceedWorkflow: async () => {
      v && v.emit("proceed_workflow", {});
    },
    onWorkflowState: Le,
    onWorkflowProceeded: nt,
    currentSessionId: b,
    setToken: Se,
    setWidgetId: we
  };
}
function Ud(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var ei = { exports: {} }, _a;
function zd() {
  return _a || (_a = 1, function(t) {
    (function() {
      function e(u, m, T) {
        return u.call.apply(u.bind, arguments);
      }
      function n(u, m, T) {
        if (!u) throw Error();
        if (2 < arguments.length) {
          var x = Array.prototype.slice.call(arguments, 2);
          return function() {
            var P = Array.prototype.slice.call(arguments);
            return Array.prototype.unshift.apply(P, x), u.apply(m, P);
          };
        }
        return function() {
          return u.apply(m, arguments);
        };
      }
      function s(u, m, T) {
        return s = Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1 ? e : n, s.apply(null, arguments);
      }
      var r = Date.now || function() {
        return +/* @__PURE__ */ new Date();
      };
      function i(u, m) {
        this.a = u, this.o = m || u, this.c = this.o.document;
      }
      var o = !!window.FontFace;
      function a(u, m, T, x) {
        if (m = u.c.createElement(m), T) for (var P in T) T.hasOwnProperty(P) && (P == "style" ? m.style.cssText = T[P] : m.setAttribute(P, T[P]));
        return x && m.appendChild(u.c.createTextNode(x)), m;
      }
      function l(u, m, T) {
        u = u.c.getElementsByTagName(m)[0], u || (u = document.documentElement), u.insertBefore(T, u.lastChild);
      }
      function f(u) {
        u.parentNode && u.parentNode.removeChild(u);
      }
      function c(u, m, T) {
        m = m || [], T = T || [];
        for (var x = u.className.split(/\s+/), P = 0; P < m.length; P += 1) {
          for (var G = !1, ee = 0; ee < x.length; ee += 1) if (m[P] === x[ee]) {
            G = !0;
            break;
          }
          G || x.push(m[P]);
        }
        for (m = [], P = 0; P < x.length; P += 1) {
          for (G = !1, ee = 0; ee < T.length; ee += 1) if (x[P] === T[ee]) {
            G = !0;
            break;
          }
          G || m.push(x[P]);
        }
        u.className = m.join(" ").replace(/\s+/g, " ").replace(/^\s+|\s+$/, "");
      }
      function b(u, m) {
        for (var T = u.className.split(/\s+/), x = 0, P = T.length; x < P; x++) if (T[x] == m) return !0;
        return !1;
      }
      function v(u) {
        return u.o.location.hostname || u.a.location.hostname;
      }
      function D(u, m, T) {
        function x() {
          ve && P && G && (ve(ee), ve = null);
        }
        m = a(u, "link", { rel: "stylesheet", href: m, media: "all" });
        var P = !1, G = !0, ee = null, ve = T || null;
        o ? (m.onload = function() {
          P = !0, x();
        }, m.onerror = function() {
          P = !0, ee = Error("Stylesheet failed to load"), x();
        }) : setTimeout(function() {
          P = !0, x();
        }, 0), l(u, "head", m);
      }
      function $(u, m, T, x) {
        var P = u.c.getElementsByTagName("head")[0];
        if (P) {
          var G = a(u, "script", { src: m }), ee = !1;
          return G.onload = G.onreadystatechange = function() {
            ee || this.readyState && this.readyState != "loaded" && this.readyState != "complete" || (ee = !0, T && T(null), G.onload = G.onreadystatechange = null, G.parentNode.tagName == "HEAD" && P.removeChild(G));
          }, P.appendChild(G), setTimeout(function() {
            ee || (ee = !0, T && T(Error("Script load timeout")));
          }, x || 5e3), G;
        }
        return null;
      }
      function Y() {
        this.a = 0, this.c = null;
      }
      function Ae(u) {
        return u.a++, function() {
          u.a--, Se(u);
        };
      }
      function ne(u, m) {
        u.c = m, Se(u);
      }
      function Se(u) {
        u.a == 0 && u.c && (u.c(), u.c = null);
      }
      function we(u) {
        this.a = u || "-";
      }
      we.prototype.c = function(u) {
        for (var m = [], T = 0; T < arguments.length; T++) m.push(arguments[T].replace(/[\W_]+/g, "").toLowerCase());
        return m.join(this.a);
      };
      function U(u, m) {
        this.c = u, this.f = 4, this.a = "n";
        var T = (m || "n4").match(/^([nio])([1-9])$/i);
        T && (this.a = T[1], this.f = parseInt(T[2], 10));
      }
      function H(u) {
        return Le(u) + " " + (u.f + "00") + " 300px " + Q(u.c);
      }
      function Q(u) {
        var m = [];
        u = u.split(/,\s*/);
        for (var T = 0; T < u.length; T++) {
          var x = u[T].replace(/['"]/g, "");
          x.indexOf(" ") != -1 || /^\d/.test(x) ? m.push("'" + x + "'") : m.push(x);
        }
        return m.join(",");
      }
      function j(u) {
        return u.a + u.f;
      }
      function Le(u) {
        var m = "normal";
        return u.a === "o" ? m = "oblique" : u.a === "i" && (m = "italic"), m;
      }
      function nt(u) {
        var m = 4, T = "n", x = null;
        return u && ((x = u.match(/(normal|oblique|italic)/i)) && x[1] && (T = x[1].substr(0, 1).toLowerCase()), (x = u.match(/([1-9]00|normal|bold)/i)) && x[1] && (/bold/i.test(x[1]) ? m = 7 : /[1-9]00/.test(x[1]) && (m = parseInt(x[1].substr(0, 1), 10)))), T + m;
      }
      function We(u, m) {
        this.c = u, this.f = u.o.document.documentElement, this.h = m, this.a = new we("-"), this.j = m.events !== !1, this.g = m.classes !== !1;
      }
      function ke(u) {
        u.g && c(u.f, [u.a.c("wf", "loading")]), qe(u, "loading");
      }
      function fe(u) {
        if (u.g) {
          var m = b(u.f, u.a.c("wf", "active")), T = [], x = [u.a.c("wf", "loading")];
          m || T.push(u.a.c("wf", "inactive")), c(u.f, T, x);
        }
        qe(u, "inactive");
      }
      function qe(u, m, T) {
        u.j && u.h[m] && (T ? u.h[m](T.c, j(T)) : u.h[m]());
      }
      function Ze() {
        this.c = {};
      }
      function it(u, m, T) {
        var x = [], P;
        for (P in m) if (m.hasOwnProperty(P)) {
          var G = u.c[P];
          G && x.push(G(m[P], T));
        }
        return x;
      }
      function ie(u, m) {
        this.c = u, this.f = m, this.a = a(this.c, "span", { "aria-hidden": "true" }, this.f);
      }
      function he(u) {
        l(u.c, "body", u.a);
      }
      function oe(u) {
        return "display:block;position:absolute;top:-9999px;left:-9999px;font-size:300px;width:auto;height:auto;line-height:normal;margin:0;padding:0;font-variant:normal;white-space:nowrap;font-family:" + Q(u.c) + ";" + ("font-style:" + Le(u) + ";font-weight:" + (u.f + "00") + ";");
      }
      function Oe(u, m, T, x, P, G) {
        this.g = u, this.j = m, this.a = x, this.c = T, this.f = P || 3e3, this.h = G || void 0;
      }
      Oe.prototype.start = function() {
        var u = this.c.o.document, m = this, T = r(), x = new Promise(function(ee, ve) {
          function xe() {
            r() - T >= m.f ? ve() : u.fonts.load(H(m.a), m.h).then(function(Ve) {
              1 <= Ve.length ? ee() : setTimeout(xe, 25);
            }, function() {
              ve();
            });
          }
          xe();
        }), P = null, G = new Promise(function(ee, ve) {
          P = setTimeout(ve, m.f);
        });
        Promise.race([G, x]).then(function() {
          P && (clearTimeout(P), P = null), m.g(m.a);
        }, function() {
          m.j(m.a);
        });
      };
      function et(u, m, T, x, P, G, ee) {
        this.v = u, this.B = m, this.c = T, this.a = x, this.s = ee || "BESbswy", this.f = {}, this.w = P || 3e3, this.u = G || null, this.m = this.j = this.h = this.g = null, this.g = new ie(this.c, this.s), this.h = new ie(this.c, this.s), this.j = new ie(this.c, this.s), this.m = new ie(this.c, this.s), u = new U(this.a.c + ",serif", j(this.a)), u = oe(u), this.g.a.style.cssText = u, u = new U(this.a.c + ",sans-serif", j(this.a)), u = oe(u), this.h.a.style.cssText = u, u = new U("serif", j(this.a)), u = oe(u), this.j.a.style.cssText = u, u = new U("sans-serif", j(this.a)), u = oe(u), this.m.a.style.cssText = u, he(this.g), he(this.h), he(this.j), he(this.m);
      }
      var re = { D: "serif", C: "sans-serif" }, Ie = null;
      function Pe() {
        if (Ie === null) {
          var u = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent);
          Ie = !!u && (536 > parseInt(u[1], 10) || parseInt(u[1], 10) === 536 && 11 >= parseInt(u[2], 10));
        }
        return Ie;
      }
      et.prototype.start = function() {
        this.f.serif = this.j.a.offsetWidth, this.f["sans-serif"] = this.m.a.offsetWidth, this.A = r(), ae(this);
      };
      function W(u, m, T) {
        for (var x in re) if (re.hasOwnProperty(x) && m === u.f[re[x]] && T === u.f[re[x]]) return !0;
        return !1;
      }
      function ae(u) {
        var m = u.g.a.offsetWidth, T = u.h.a.offsetWidth, x;
        (x = m === u.f.serif && T === u.f["sans-serif"]) || (x = Pe() && W(u, m, T)), x ? r() - u.A >= u.w ? Pe() && W(u, m, T) && (u.u === null || u.u.hasOwnProperty(u.a.c)) ? V(u, u.v) : V(u, u.B) : _e(u) : V(u, u.v);
      }
      function _e(u) {
        setTimeout(s(function() {
          ae(this);
        }, u), 50);
      }
      function V(u, m) {
        setTimeout(s(function() {
          f(this.g.a), f(this.h.a), f(this.j.a), f(this.m.a), m(this.a);
        }, u), 0);
      }
      function je(u, m, T) {
        this.c = u, this.a = m, this.f = 0, this.m = this.j = !1, this.s = T;
      }
      var Qe = null;
      je.prototype.g = function(u) {
        var m = this.a;
        m.g && c(m.f, [m.a.c("wf", u.c, j(u).toString(), "active")], [m.a.c("wf", u.c, j(u).toString(), "loading"), m.a.c("wf", u.c, j(u).toString(), "inactive")]), qe(m, "fontactive", u), this.m = !0, mt(this);
      }, je.prototype.h = function(u) {
        var m = this.a;
        if (m.g) {
          var T = b(m.f, m.a.c("wf", u.c, j(u).toString(), "active")), x = [], P = [m.a.c("wf", u.c, j(u).toString(), "loading")];
          T || x.push(m.a.c("wf", u.c, j(u).toString(), "inactive")), c(m.f, x, P);
        }
        qe(m, "fontinactive", u), mt(this);
      };
      function mt(u) {
        --u.f == 0 && u.j && (u.m ? (u = u.a, u.g && c(u.f, [u.a.c("wf", "active")], [u.a.c("wf", "loading"), u.a.c("wf", "inactive")]), qe(u, "active")) : fe(u.a));
      }
      function Nt(u) {
        this.j = u, this.a = new Ze(), this.h = 0, this.f = this.g = !0;
      }
      Nt.prototype.load = function(u) {
        this.c = new i(this.j, u.context || this.j), this.g = u.events !== !1, this.f = u.classes !== !1, g(this, new We(this.c, u), u);
      };
      function d(u, m, T, x, P) {
        var G = --u.h == 0;
        (u.f || u.g) && setTimeout(function() {
          var ee = P || null, ve = x || null || {};
          if (T.length === 0 && G) fe(m.a);
          else {
            m.f += T.length, G && (m.j = G);
            var xe, Ve = [];
            for (xe = 0; xe < T.length; xe++) {
              var Ne = T[xe], _t = ve[Ne.c], vt = m.a, De = Ne;
              if (vt.g && c(vt.f, [vt.a.c("wf", De.c, j(De).toString(), "loading")]), qe(vt, "fontloading", De), vt = null, Qe === null) if (window.FontFace) {
                var De = /Gecko.*Firefox\/(\d+)/.exec(window.navigator.userAgent), Kt = /OS X.*Version\/10\..*Safari/.exec(window.navigator.userAgent) && /Apple/.exec(window.navigator.vendor);
                Qe = De ? 42 < parseInt(De[1], 10) : !Kt;
              } else Qe = !1;
              Qe ? vt = new Oe(s(m.g, m), s(m.h, m), m.c, Ne, m.s, _t) : vt = new et(s(m.g, m), s(m.h, m), m.c, Ne, m.s, ee, _t), Ve.push(vt);
            }
            for (xe = 0; xe < Ve.length; xe++) Ve[xe].start();
          }
        }, 0);
      }
      function g(u, m, T) {
        var P = [], x = T.timeout;
        ke(m);
        var P = it(u.a, T, u.c), G = new je(u.c, m, x);
        for (u.h = P.length, m = 0, T = P.length; m < T; m++) P[m].load(function(ee, ve, xe) {
          d(u, G, ee, ve, xe);
        });
      }
      function k(u, m) {
        this.c = u, this.a = m;
      }
      k.prototype.load = function(u) {
        function m() {
          if (G["__mti_fntLst" + x]) {
            var ee = G["__mti_fntLst" + x](), ve = [], xe;
            if (ee) for (var Ve = 0; Ve < ee.length; Ve++) {
              var Ne = ee[Ve].fontfamily;
              ee[Ve].fontStyle != null && ee[Ve].fontWeight != null ? (xe = ee[Ve].fontStyle + ee[Ve].fontWeight, ve.push(new U(Ne, xe))) : ve.push(new U(Ne));
            }
            u(ve);
          } else setTimeout(function() {
            m();
          }, 50);
        }
        var T = this, x = T.a.projectId, P = T.a.version;
        if (x) {
          var G = T.c.o;
          $(this.c, (T.a.api || "https://fast.fonts.net/jsapi") + "/" + x + ".js" + (P ? "?v=" + P : ""), function(ee) {
            ee ? u([]) : (G["__MonotypeConfiguration__" + x] = function() {
              return T.a;
            }, m());
          }).id = "__MonotypeAPIScript__" + x;
        } else u([]);
      };
      function A(u, m) {
        this.c = u, this.a = m;
      }
      A.prototype.load = function(u) {
        var m, T, x = this.a.urls || [], P = this.a.families || [], G = this.a.testStrings || {}, ee = new Y();
        for (m = 0, T = x.length; m < T; m++) D(this.c, x[m], Ae(ee));
        var ve = [];
        for (m = 0, T = P.length; m < T; m++) if (x = P[m].split(":"), x[1]) for (var xe = x[1].split(","), Ve = 0; Ve < xe.length; Ve += 1) ve.push(new U(x[0], xe[Ve]));
        else ve.push(new U(x[0]));
        ne(ee, function() {
          u(ve, G);
        });
      };
      function E(u, m) {
        u ? this.c = u : this.c = S, this.a = [], this.f = [], this.g = m || "";
      }
      var S = "https://fonts.googleapis.com/css";
      function B(u, m) {
        for (var T = m.length, x = 0; x < T; x++) {
          var P = m[x].split(":");
          P.length == 3 && u.f.push(P.pop());
          var G = "";
          P.length == 2 && P[1] != "" && (G = ":"), u.a.push(P.join(G));
        }
      }
      function M(u) {
        if (u.a.length == 0) throw Error("No fonts to load!");
        if (u.c.indexOf("kit=") != -1) return u.c;
        for (var m = u.a.length, T = [], x = 0; x < m; x++) T.push(u.a[x].replace(/ /g, "+"));
        return m = u.c + "?family=" + T.join("%7C"), 0 < u.f.length && (m += "&subset=" + u.f.join(",")), 0 < u.g.length && (m += "&text=" + encodeURIComponent(u.g)), m;
      }
      function F(u) {
        this.f = u, this.a = [], this.c = {};
      }
      var L = { latin: "BESbswy", "latin-ext": "çöüğş", cyrillic: "йяЖ", greek: "αβΣ", khmer: "កខគ", Hanuman: "កខគ" }, Z = { thin: "1", extralight: "2", "extra-light": "2", ultralight: "2", "ultra-light": "2", light: "3", regular: "4", book: "4", medium: "5", "semi-bold": "6", semibold: "6", "demi-bold": "6", demibold: "6", bold: "7", "extra-bold": "8", extrabold: "8", "ultra-bold": "8", ultrabold: "8", black: "9", heavy: "9", l: "3", r: "4", b: "7" }, z = { i: "i", italic: "i", n: "n", normal: "n" }, K = /^(thin|(?:(?:extra|ultra)-?)?light|regular|book|medium|(?:(?:semi|demi|extra|ultra)-?)?bold|black|heavy|l|r|b|[1-9]00)?(n|i|normal|italic)?$/;
      function X(u) {
        for (var m = u.f.length, T = 0; T < m; T++) {
          var x = u.f[T].split(":"), P = x[0].replace(/\+/g, " "), G = ["n4"];
          if (2 <= x.length) {
            var ee, ve = x[1];
            if (ee = [], ve) for (var ve = ve.split(","), xe = ve.length, Ve = 0; Ve < xe; Ve++) {
              var Ne;
              if (Ne = ve[Ve], Ne.match(/^[\w-]+$/)) {
                var _t = K.exec(Ne.toLowerCase());
                if (_t == null) Ne = "";
                else {
                  if (Ne = _t[2], Ne = Ne == null || Ne == "" ? "n" : z[Ne], _t = _t[1], _t == null || _t == "") _t = "4";
                  else var vt = Z[_t], _t = vt || (isNaN(_t) ? "4" : _t.substr(0, 1));
                  Ne = [Ne, _t].join("");
                }
              } else Ne = "";
              Ne && ee.push(Ne);
            }
            0 < ee.length && (G = ee), x.length == 3 && (x = x[2], ee = [], x = x ? x.split(",") : ee, 0 < x.length && (x = L[x[0]]) && (u.c[P] = x));
          }
          for (u.c[P] || (x = L[P]) && (u.c[P] = x), x = 0; x < G.length; x += 1) u.a.push(new U(P, G[x]));
        }
      }
      function se(u, m) {
        this.c = u, this.a = m;
      }
      var Ce = { Arimo: !0, Cousine: !0, Tinos: !0 };
      se.prototype.load = function(u) {
        var m = new Y(), T = this.c, x = new E(this.a.api, this.a.text), P = this.a.families;
        B(x, P);
        var G = new F(P);
        X(G), D(T, M(x), Ae(m)), ne(m, function() {
          u(G.a, G.c, Ce);
        });
      };
      function pe(u, m) {
        this.c = u, this.a = m;
      }
      pe.prototype.load = function(u) {
        var m = this.a.id, T = this.c.o;
        m ? $(this.c, (this.a.api || "https://use.typekit.net") + "/" + m + ".js", function(x) {
          if (x) u([]);
          else if (T.Typekit && T.Typekit.config && T.Typekit.config.fn) {
            x = T.Typekit.config.fn;
            for (var P = [], G = 0; G < x.length; G += 2) for (var ee = x[G], ve = x[G + 1], xe = 0; xe < ve.length; xe++) P.push(new U(ee, ve[xe]));
            try {
              T.Typekit.load({ events: !1, classes: !1, async: !0 });
            } catch {
            }
            u(P);
          }
        }, 2e3) : u([]);
      };
      function ot(u, m) {
        this.c = u, this.f = m, this.a = [];
      }
      ot.prototype.load = function(u) {
        var m = this.f.id, T = this.c.o, x = this;
        m ? (T.__webfontfontdeckmodule__ || (T.__webfontfontdeckmodule__ = {}), T.__webfontfontdeckmodule__[m] = function(P, G) {
          for (var ee = 0, ve = G.fonts.length; ee < ve; ++ee) {
            var xe = G.fonts[ee];
            x.a.push(new U(xe.name, nt("font-weight:" + xe.weight + ";font-style:" + xe.style)));
          }
          u(x.a);
        }, $(this.c, (this.f.api || "https://f.fontdeck.com/s/css/js/") + v(this.c) + "/" + m + ".js", function(P) {
          P && u([]);
        })) : u([]);
      };
      var Me = new Nt(window);
      Me.a.c.custom = function(u, m) {
        return new A(m, u);
      }, Me.a.c.fontdeck = function(u, m) {
        return new ot(m, u);
      }, Me.a.c.monotype = function(u, m) {
        return new k(m, u);
      }, Me.a.c.typekit = function(u, m) {
        return new pe(m, u);
      }, Me.a.c.google = function(u, m) {
        return new se(m, u);
      };
      var Xe = { load: s(Me.load, Me) };
      t.exports ? t.exports = Xe : (window.WebFont = Xe, window.WebFontConfig && Me.load(window.WebFontConfig));
    })();
  }(ei)), ei.exports;
}
var Hd = zd();
const Wd = /* @__PURE__ */ Ud(Hd);
function qd() {
  const t = de({}), e = de(""), n = (r) => {
    t.value = r, r.photo_url && (t.value.photo_url = r.photo_url), r.font_family && Wd.load({
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
    customization: t,
    agentName: e,
    applyCustomization: n,
    initializeFromData: () => {
      const r = window.__INITIAL_DATA__;
      r && (n(r.customization || {}), e.value = r.agentName || "");
    }
  };
}
function jd() {
  const t = {
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
      const i = r ? t[r] || r : "", o = typeof s == "string" ? s : s.toString();
      return i ? `${i}${o}` : o;
    },
    getCurrencySymbol: (s) => t[s] || s,
    currencySymbols: t
  };
}
const Vd = {
  key: 0,
  class: "widget-unavailable-overlay"
}, Kd = {
  key: 1,
  class: "auth-error-overlay"
}, Gd = { class: "auth-error-card" }, Yd = { class: "auth-error-message" }, Zd = {
  key: 0,
  class: "initializing-overlay"
}, Xd = {
  key: 0,
  class: "connecting-message"
}, Jd = {
  key: 1,
  class: "failed-message"
}, Qd = { class: "welcome-content" }, ep = { class: "welcome-header" }, tp = ["src", "alt"], np = { class: "welcome-title" }, sp = { class: "welcome-subtitle" }, rp = { class: "welcome-input-container" }, ip = {
  key: 0,
  class: "email-input"
}, op = ["disabled"], ap = { class: "welcome-message-input" }, lp = ["placeholder", "disabled"], cp = ["disabled"], up = { class: "landing-page-content" }, fp = { class: "landing-page-header" }, hp = { class: "landing-page-heading" }, dp = { class: "landing-page-text" }, pp = { class: "landing-page-actions" }, gp = { class: "form-fullscreen-content" }, mp = {
  key: 0,
  class: "form-header"
}, _p = {
  key: 0,
  class: "form-title"
}, yp = {
  key: 1,
  class: "form-description"
}, vp = { class: "form-fields" }, bp = ["for"], wp = {
  key: 0,
  class: "required-indicator"
}, kp = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "autocomplete", "inputmode"], xp = ["id", "placeholder", "required", "min", "max", "value", "onInput"], Tp = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput"], Sp = ["id", "required", "value", "onChange"], Ap = { value: "" }, Ep = ["value"], Cp = {
  key: 4,
  class: "checkbox-field"
}, Rp = ["id", "required", "checked", "onChange"], Lp = { class: "checkbox-label" }, Ip = {
  key: 5,
  class: "radio-group"
}, Op = ["name", "value", "required", "checked", "onChange"], Pp = { class: "radio-label" }, Np = {
  key: 6,
  class: "field-error"
}, Mp = { class: "form-actions" }, Dp = ["disabled"], Fp = {
  key: 0,
  class: "loading-spinner-inline"
}, $p = { key: 1 }, Bp = { class: "header-content" }, Up = ["src", "alt"], zp = { class: "header-info" }, Hp = { class: "status" }, Wp = { class: "ask-anything-header" }, qp = ["src", "alt"], jp = { class: "header-info" }, Vp = {
  key: 2,
  class: "loading-history"
}, Kp = {
  key: 0,
  class: "rating-content"
}, Gp = { class: "rating-prompt" }, Yp = ["onMouseover", "onMouseleave", "onClick", "disabled"], Zp = {
  key: 0,
  class: "feedback-wrapper"
}, Xp = { class: "feedback-section" }, Jp = ["onUpdate:modelValue", "disabled"], Qp = { class: "feedback-counter" }, eg = ["onClick", "disabled"], tg = {
  key: 1,
  class: "submitted-feedback-wrapper"
}, ng = { class: "submitted-feedback" }, sg = { class: "submitted-feedback-text" }, rg = {
  key: 2,
  class: "submitted-message"
}, ig = {
  key: 1,
  class: "form-content"
}, og = {
  key: 0,
  class: "form-header"
}, ag = {
  key: 0,
  class: "form-title"
}, lg = {
  key: 1,
  class: "form-description"
}, cg = { class: "form-fields" }, ug = ["for"], fg = {
  key: 0,
  class: "required-indicator"
}, hg = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "disabled", "autocomplete", "inputmode"], dg = ["id", "placeholder", "required", "min", "max", "value", "onInput", "disabled"], pg = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "disabled"], gg = ["id", "required", "value", "onChange", "disabled"], mg = { value: "" }, _g = ["value"], yg = {
  key: 4,
  class: "checkbox-field"
}, vg = ["id", "checked", "onChange", "disabled"], bg = ["for"], wg = {
  key: 5,
  class: "radio-field"
}, kg = ["id", "name", "value", "checked", "onChange", "disabled"], xg = ["for"], Tg = {
  key: 6,
  class: "field-error"
}, Sg = { class: "form-actions" }, Ag = ["onClick", "disabled"], Eg = {
  key: 2,
  class: "user-input-content"
}, Cg = {
  key: 0,
  class: "user-input-prompt"
}, Rg = {
  key: 1,
  class: "user-input-form"
}, Lg = ["onUpdate:modelValue", "onKeydown"], Ig = ["onClick", "disabled"], Og = {
  key: 2,
  class: "user-input-submitted"
}, Pg = {
  key: 0,
  class: "user-input-confirmation"
}, Ng = {
  key: 3,
  class: "product-message-container"
}, Mg = ["innerHTML"], Dg = {
  key: 1,
  class: "products-carousel"
}, Fg = { class: "carousel-items" }, $g = {
  key: 0,
  class: "product-image-compact"
}, Bg = ["src", "alt"], Ug = { class: "product-info-compact" }, zg = { class: "product-text-area" }, Hg = { class: "product-title-compact" }, Wg = {
  key: 0,
  class: "product-variant-compact"
}, qg = { class: "product-price-compact" }, jg = { class: "product-actions-compact" }, Vg = ["onClick"], Kg = {
  key: 2,
  class: "no-products-message"
}, Gg = {
  key: 3,
  class: "no-products-message"
}, Yg = ["innerHTML"], Zg = {
  key: 0,
  class: "message-attachments"
}, Xg = {
  key: 0,
  class: "attachment-image-container"
}, Jg = ["src", "alt", "onClick"], Qg = { class: "attachment-image-info" }, em = ["href"], tm = { class: "attachment-size" }, nm = ["href"], sm = { class: "attachment-size" }, rm = { class: "message-info" }, im = {
  key: 0,
  class: "agent-name"
}, om = {
  key: 0,
  class: "typing-indicator"
}, am = {
  key: 0,
  class: "email-input"
}, lm = ["disabled"], cm = {
  key: 1,
  class: "file-previews-widget"
}, um = {
  class: "file-preview-content-widget",
  style: { cursor: "pointer" }
}, fm = ["src", "alt", "onClick"], hm = ["onClick"], dm = { class: "file-preview-info-widget" }, pm = { class: "file-preview-name-widget" }, gm = { class: "file-preview-size-widget" }, mm = ["onClick"], _m = {
  key: 2,
  class: "upload-progress-widget"
}, ym = { class: "message-input" }, vm = ["placeholder", "disabled"], bm = ["disabled", "title"], wm = ["disabled"], km = { class: "conversation-ended-message" }, xm = {
  key: 7,
  class: "rating-dialog"
}, Tm = { class: "rating-content" }, Sm = { class: "star-rating" }, Am = ["onClick"], Em = { class: "rating-actions" }, Cm = ["disabled"], Rm = {
  key: 0,
  class: "preview-modal-image-container"
}, Lm = ["src", "alt"], Im = { class: "preview-modal-filename" }, Om = {
  key: 3,
  class: "widget-loading"
}, ks = "ctid", ya = 3, Pm = "image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls", Nm = /* @__PURE__ */ ru({
  __name: "WidgetBuilder",
  props: {
    widgetId: {},
    token: {},
    initialAuthError: {}
  },
  setup(t) {
    var ao;
    Re.setOptions({
      renderer: new Re.Renderer(),
      gfm: !0,
      breaks: !0
    });
    const e = new Re.Renderer(), n = e.link;
    e.link = (p, _, h) => n.call(e, p, _, h).replace(/^<a /, '<a target="_blank" rel="nofollow" '), Re.use({ renderer: e });
    const s = (p) => zh(Re(p, { renderer: e })), r = t, i = ft(() => {
      var p;
      return r.widgetId || ((p = window.__INITIAL_DATA__) == null ? void 0 : p.widgetId);
    }), {
      customization: o,
      agentName: a,
      applyCustomization: l,
      initializeFromData: f
    } = qd(), { formatCurrency: c } = jd(), {
      messages: b,
      loading: v,
      errorMessage: D,
      showError: $,
      loadingHistory: Y,
      hasStartedChat: Ae,
      connectionStatus: ne,
      sendMessage: Se,
      loadChatHistory: we,
      connect: U,
      reconnect: H,
      cleanup: Q,
      humanAgent: j,
      onTakeover: Le,
      submitRating: nt,
      submitForm: We,
      currentForm: ke,
      getWorkflowState: fe,
      proceedWorkflow: qe,
      onWorkflowState: Ze,
      onWorkflowProceeded: it,
      currentSessionId: ie,
      setToken: he,
      setWidgetId: oe
    } = Bd(), Oe = de(""), et = de(!0), re = de(""), Ie = de(!1), Pe = (p) => {
      const _ = p.target;
      Oe.value = _.value;
    };
    let W = null;
    const ae = () => {
      W && W.disconnect(), W = new MutationObserver((_) => {
        let h = !1, te = !1;
        _.forEach((ye) => {
          if (ye.type === "childList") {
            const le = Array.from(ye.addedNodes).some(
              (be) => {
                var Yt;
                return be.nodeType === Node.ELEMENT_NODE && (be.matches("input, textarea") || ((Yt = be.querySelector) == null ? void 0 : Yt.call(be, "input, textarea")));
              }
            ), He = Array.from(ye.removedNodes).some(
              (be) => {
                var Yt;
                return be.nodeType === Node.ELEMENT_NODE && (be.matches("input, textarea") || ((Yt = be.querySelector) == null ? void 0 : Yt.call(be, "input, textarea")));
              }
            );
            le && (te = !0, h = !0), He && (h = !0);
          }
        }), h && (clearTimeout(ae.timeoutId), ae.timeoutId = setTimeout(() => {
          V();
        }, te ? 50 : 100));
      });
      const p = document.querySelector(".widget-container") || document.body;
      W.observe(p, {
        childList: !0,
        subtree: !0
      });
    };
    ae.timeoutId = null;
    let _e = [];
    const V = () => {
      je();
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
      let _ = [];
      for (const h of p) {
        const te = document.querySelectorAll(h);
        if (te.length > 0) {
          _ = Array.from(te);
          break;
        }
      }
      _.length !== 0 && (_e = _, _.forEach((h) => {
        h.addEventListener("input", Qe, !0), h.addEventListener("keyup", Qe, !0), h.addEventListener("change", Qe, !0), h.addEventListener("keypress", mt, !0), h.addEventListener("keydown", Nt, !0);
      }));
    }, je = () => {
      _e.forEach((p) => {
        p.removeEventListener("input", Qe), p.removeEventListener("keyup", Qe), p.removeEventListener("change", Qe), p.removeEventListener("keypress", mt), p.removeEventListener("keydown", Nt);
      }), _e = [];
    }, Qe = (p) => {
      const _ = p.target;
      Oe.value = _.value;
    }, mt = (p) => {
      p.key === "Enter" && !p.shiftKey && (p.preventDefault(), p.stopPropagation(), kn());
    }, Nt = (p) => {
      p.key === "Enter" && !p.shiftKey && (p.preventDefault(), p.stopPropagation(), kn());
    }, d = (p) => {
      const _ = p.target, h = document.querySelector(".header-menu-container");
      document.querySelector(".header-menu-btn");
      const te = document.querySelector(".header-dropdown-menu");
      te && !(h != null && h.contains(_)) && (te.style.display = "none");
    }, g = de(!0), k = (p) => !p || p === "undefined" || p === "null" || typeof p == "string" && p.trim() === "" ? null : p, A = de(k(((ao = window.__INITIAL_DATA__) == null ? void 0 : ao.initialToken) || localStorage.getItem(ks)));
    ft(() => !!A.value);
    const E = de(null), S = de(!1), B = de(!1);
    r.initialAuthError && (E.value = r.initialAuthError, S.value = !0, g.value = !1), f();
    const M = window.__INITIAL_DATA__;
    if (M != null && M.initialToken) {
      const p = k(M.initialToken);
      p && (A.value = p, window.parent.postMessage({
        type: "TOKEN_UPDATE",
        token: p
      }, "*"), Ie.value = !0);
    }
    const F = de(!1);
    (M == null ? void 0 : M.allowAttachments) !== void 0 && (F.value = M.allowAttachments);
    const L = de(null), {
      chatStyles: Z,
      chatIconStyles: z,
      agentBubbleStyles: K,
      userBubbleStyles: X,
      messageNameStyles: se,
      headerBorderStyles: Ce,
      photoUrl: pe,
      shadowStyle: ot
    } = Hh(o), Me = de(null), {
      uploadedAttachments: Xe,
      previewModal: u,
      previewFile: m,
      formatFileSize: T,
      isImageAttachment: x,
      getDownloadUrl: P,
      getPreviewUrl: G,
      handleFileSelect: ee,
      handleDrop: ve,
      handleDragOver: xe,
      handleDragLeave: Ve,
      handlePaste: Ne,
      removeAttachment: _t,
      openPreview: vt,
      closePreview: De,
      openFilePicker: Kt,
      isImage: zs
    } = jh(A, Me);
    ft(() => b.value.some(
      (p) => p.message_type === "form" && (!p.isSubmitted || p.isSubmitted === !1)
    ));
    const un = ft(() => {
      var p;
      return Ae.value && Ie.value || Ut.value ? ne.value === "connected" && !v.value : ds(re.value.trim()) && ne.value === "connected" && !v.value || ((p = window.__INITIAL_DATA__) == null ? void 0 : p.workflow);
    }), Vn = ft(() => ne.value === "connected" ? Ut.value ? "Ask me anything..." : "Type a message..." : "Connecting..."), kn = async () => {
      if (!Oe.value.trim() && Xe.value.length === 0) return;
      !Ae.value && re.value && await Kn();
      const p = Xe.value.map((h) => ({
        content: h.content,
        // base64 content
        filename: h.filename,
        content_type: h.type,
        size: h.size
      }));
      await Se(Oe.value, re.value, p), Xe.value.forEach((h) => {
        h.url && h.url.startsWith("blob:") && URL.revokeObjectURL(h.url), h.file_url && h.file_url.startsWith("blob:") && URL.revokeObjectURL(h.file_url);
      }), Oe.value = "", Xe.value = [];
      const _ = document.querySelector('input[placeholder*="Type a message"]');
      _ && (_.value = ""), setTimeout(() => {
        V();
      }, 500);
    }, as = (p) => {
      p.key === "Enter" && !p.shiftKey && (p.preventDefault(), p.stopPropagation(), kn());
    }, Kn = async () => {
      var p, _, h, te;
      try {
        if (!i.value)
          return console.error("Widget ID is not available"), E.value = "Widget ID is not available. Please refresh and try again.", S.value = !0, !1;
        const ye = new URL(`${Rn.API_URL}/widgets/${i.value}`);
        re.value.trim() && ds(re.value.trim()) && ye.searchParams.append("email", re.value.trim());
        const le = {
          Accept: "application/json",
          "Content-Type": "application/json"
        };
        A.value && (le.Authorization = `Bearer ${A.value}`);
        const He = await fetch(ye, {
          headers: le
        });
        if (He.status === 401) {
          Ie.value = !1;
          try {
            const Yn = (await He.json()).detail || "";
            (Yn.includes("generate-token") || Yn.includes("API key") || Yn.includes("Token required")) && (B.value = !0, E.value = "Widget authentication not configured. Please contact the website administrator.", S.value = !0, localStorage.removeItem(ks), A.value = null);
          } catch {
            E.value = "Authentication required. Your token has expired or is invalid. Please refresh the page.", S.value = !0, localStorage.removeItem(ks), A.value = null;
          }
          return !1;
        }
        if (!He.ok) {
          try {
            const us = await He.json();
            E.value = us.detail || `Error: ${He.statusText}`;
          } catch {
            E.value = `Error: ${He.statusText}. Please try again.`;
          }
          return S.value = !0, !1;
        }
        const be = await He.json();
        return be.token && (A.value = be.token, localStorage.setItem(ks, be.token), window.parent.postMessage({ type: "TOKEN_UPDATE", token: be.token }, "*")), Ie.value = !0, E.value = null, S.value = !1, he(A.value || void 0), await U() ? (await Bt(), (p = be.agent) != null && p.customization && l(be.agent.customization), be.agent && !(be != null && be.human_agent) && (a.value = be.agent.name), be != null && be.human_agent && (j.value = be.human_agent), ((_ = be.agent) == null ? void 0 : _.allow_attachments) !== void 0 && (F.value = be.agent.allow_attachments), ((h = be.agent) == null ? void 0 : h.workflow) !== void 0 && (window.__INITIAL_DATA__ = window.__INITIAL_DATA__ || {}, window.__INITIAL_DATA__.workflow = be.agent.workflow), (te = be.agent) != null && te.workflow && await fe(), !0) : (console.error("Failed to connect to chat service"), E.value = "Failed to connect to chat service. Please try again.", S.value = !0, !1);
      } catch (ye) {
        return console.error("Error checking authorization:", ye), E.value = "An unexpected error occurred. Please try again.", S.value = !0, Ie.value = !1, !1;
      } finally {
        g.value = !1;
      }
    }, Bt = async () => {
      !Ae.value && Ie.value && (Ae.value = !0, await we());
    }, Qt = () => {
      L.value && (L.value.scrollTop = L.value.scrollHeight);
    };
    Hn(() => b.value, (p) => {
      qa(() => {
        Qt();
      });
    }, { deep: !0 }), Hn(ne, (p, _) => {
      p === "connected" && _ !== "connected" && setTimeout(V, 100);
    }), Hn(() => b.value.length, (p, _) => {
      p > 0 && _ === 0 && setTimeout(V, 100);
    }), Hn(() => b.value, (p) => {
      if (p.length > 0) {
        const _ = p[p.length - 1];
        ut(_);
      }
    }, { deep: !0 });
    const Hs = async () => {
      await H() && await Kn();
    }, ls = de(!1), xn = de(0), Gn = de(""), ht = de(0), Mt = de(!1), at = de({}), dt = de(!1), lt = de({}), Tn = de(!1), J = de(null), y = de("Start Chat"), N = de(!1), q = de(null);
    ft(() => {
      var _;
      const p = b.value[b.value.length - 1];
      return ((_ = p == null ? void 0 : p.attributes) == null ? void 0 : _.request_rating) || !1;
    });
    const Ke = ft(() => {
      var _;
      if (!((_ = window.__INITIAL_DATA__) != null && _.workflow))
        return !1;
      const p = b.value.find((h) => h.message_type === "rating");
      return (p == null ? void 0 : p.isSubmitted) === !0;
    }), ct = ft(() => j.value.human_agent_profile_pic ? j.value.human_agent_profile_pic.includes("amazonaws.com") ? j.value.human_agent_profile_pic : `${Rn.API_URL}${j.value.human_agent_profile_pic}` : ""), ut = async (p) => {
      var _, h, te, ye, le;
      try {
        if (p.session_id && A.value && i.value) {
          const He = new URL(`${Rn.API_URL}/widgets/${i.value}/end-chat`);
          He.searchParams.append("session_id", p.session_id), (_ = p.attributes) != null && _.end_chat_reason && He.searchParams.append("reason", p.attributes.end_chat_reason), (h = p.attributes) != null && h.end_chat_description && He.searchParams.append("description", p.attributes.end_chat_description);
          const be = await fetch(He, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${A.value}`,
              "Content-Type": "application/json"
            }
          });
          if (be.ok) {
            const Yt = await be.json();
            console.info(`✓ Chat session closed on backend: ${Yt.session_id}`);
          } else
            console.warn(`Failed to close session on backend: ${be.status}`);
        }
      } catch (He) {
        console.error("Error calling end-chat API:", He);
      }
      if ((te = p.attributes) != null && te.end_chat && ((ye = p.attributes) != null && ye.request_rating)) {
        const He = p.agent_name || ((le = j.value) == null ? void 0 : le.human_agent_name) || a.value || "our agent";
        b.value.push({
          message: `Rate the chat session that you had with ${He}`,
          message_type: "rating",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          session_id: p.session_id,
          agent_name: He,
          showFeedback: !1
        }), ie.value = p.session_id;
      }
    }, kt = (p) => {
      Mt.value || (ht.value = p);
    }, Gt = () => {
      if (!Mt.value) {
        const p = b.value[b.value.length - 1];
        ht.value = (p == null ? void 0 : p.selectedRating) || 0;
      }
    }, Dn = async (p) => {
      if (!Mt.value) {
        ht.value = p;
        const _ = b.value[b.value.length - 1];
        _ && _.message_type === "rating" && (_.showFeedback = !0, _.selectedRating = p);
      }
    }, cs = async (p, _, h = null) => {
      try {
        Mt.value = !0, await nt(_, h);
        const te = b.value.find((ye) => ye.message_type === "rating");
        te && (te.isSubmitted = !0, te.finalRating = _, te.finalFeedback = h);
      } catch (te) {
        console.error("Failed to submit rating:", te);
      } finally {
        Mt.value = !1;
      }
    }, yt = (p) => {
      const _ = {};
      for (const h of p.fields) {
        const te = at.value[h.name], ye = Or(h, te);
        ye && (_[h.name] = ye);
      }
      return lt.value = _, Object.keys(_).length === 0;
    }, Ws = async (p) => {
      if (!(dt.value || !yt(p)))
        try {
          dt.value = !0, await We(at.value);
          const h = b.value.findIndex(
            (te) => te.message_type === "form" && (!te.isSubmitted || te.isSubmitted === !1)
          );
          h !== -1 && b.value.splice(h, 1), at.value = {}, lt.value = {};
        } catch (h) {
          console.error("Failed to submit form:", h);
        } finally {
          dt.value = !1;
        }
    }, bt = (p, _) => {
      var h, te;
      if (at.value[p] = _, _ && _.toString().trim() !== "") {
        let ye = null;
        if ((h = q.value) != null && h.fields && (ye = q.value.fields.find((le) => le.name === p)), !ye && ((te = ke.value) != null && te.fields) && (ye = ke.value.fields.find((le) => le.name === p)), ye) {
          const le = Or(ye, _);
          le ? (lt.value[p] = le, console.log(`Validation error for ${p}:`, le)) : delete lt.value[p];
        }
      } else
        delete lt.value[p], console.log(`Cleared error for ${p}`);
    }, ec = (p) => {
      const _ = p.replace(/\D/g, "");
      return _.length >= 7 && _.length <= 15;
    }, Or = (p, _) => {
      if (p.required && (!_ || _.toString().trim() === ""))
        return `${p.label} is required`;
      if (!_ || _.toString().trim() === "")
        return null;
      if (p.type === "email" && !ds(_))
        return "Please enter a valid email address";
      if (p.type === "tel" && !ec(_))
        return "Please enter a valid phone number";
      if ((p.type === "text" || p.type === "textarea") && p.minLength && _.length < p.minLength)
        return `${p.label} must be at least ${p.minLength} characters`;
      if ((p.type === "text" || p.type === "textarea") && p.maxLength && _.length > p.maxLength)
        return `${p.label} must not exceed ${p.maxLength} characters`;
      if (p.type === "number") {
        const h = parseFloat(_);
        if (isNaN(h))
          return `${p.label} must be a valid number`;
        if (p.minLength && h < p.minLength)
          return `${p.label} must be at least ${p.minLength}`;
        if (p.maxLength && h > p.maxLength)
          return `${p.label} must not exceed ${p.maxLength}`;
      }
      return null;
    }, tc = async () => {
      if (!(dt.value || !q.value))
        try {
          dt.value = !0, lt.value = {};
          let p = !1;
          for (const _ of q.value.fields || []) {
            const h = at.value[_.name], te = Or(_, h);
            te && (lt.value[_.name] = te, p = !0, console.log(`Validation error for field ${_.name}:`, te));
          }
          if (p) {
            dt.value = !1, console.log("Validation failed, not submitting");
            return;
          }
          await We(at.value), N.value = !1, q.value = null, at.value = {};
        } catch (p) {
          console.error("Failed to submit full screen form:", p);
        } finally {
          dt.value = !1, console.log("Full screen form submission completed");
        }
    }, nc = (p, _) => {
      if (console.log("handleViewDetails called with:", { product: p, shopDomain: _ }), !p) {
        console.error("No product provided to handleViewDetails");
        return;
      }
      let h = null;
      if (p.handle && _)
        h = `https://${_}/products/${p.handle}`;
      else if (p.id && _)
        h = `https://${_}/products/${p.id}`;
      else if (_) {
        if (!p.handle && !p.id) {
          console.error("Product handle and ID are both missing! Product:", p), alert("Unable to open product: Product information incomplete.");
          return;
        }
      } else {
        console.error("Shop domain is missing! Product:", p), alert("Unable to open product: Shop domain not available. Please contact support.");
        return;
      }
      h && (console.log("Opening product URL:", h), window.open(h, "_blank"));
    }, sc = (p) => {
      if (!p) return "";
      let _ = p.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "");
      const h = [];
      return _ = _.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (te, ye, le) => {
        const He = `__MARKDOWN_LINK_${h.length}__`;
        return console.log("Found markdown link:", te, "-> placeholder:", He), h.push(te), He;
      }), console.log("After replacing markdown links with placeholders:", _), console.log("Markdown links array:", h), _ = _.replace(/https?:\/\/[^\s\)]+/g, "[link removed]"), console.log("After removing standalone URLs:", _), h.forEach((te, ye) => {
        _ = _.replace(`__MARKDOWN_LINK_${ye}__`, te), console.log(`Restored markdown link ${ye}:`, te);
      }), _ = _.replace(/\n\s*\n\s*\n/g, `

`).trim(), _;
    }, ro = de(!1);
    de(!1);
    const rc = ft(() => {
      var _;
      const p = !!((_ = j.value) != null && _.human_agent_name);
      return F.value && p && Xe.value.length < ya;
    }), ic = async () => {
      try {
        Tn.value = !1, J.value = null, await qe();
      } catch (p) {
        console.error("Failed to proceed workflow:", p);
      }
    }, Pr = async (p) => {
      try {
        if (!p.userInputValue || !p.userInputValue.trim())
          return;
        const _ = p.userInputValue.trim();
        p.isSubmitted = !0, p.submittedValue = _, await Se(_, re.value);
      } catch (_) {
        console.error("Failed to submit user input:", _), p.isSubmitted = !1, p.submittedValue = null;
      }
    }, io = async () => {
      var p, _, h;
      try {
        let te = 0;
        const ye = 50;
        for (; !((p = window.__INITIAL_DATA__) != null && p.widgetId) && te < ye; )
          await new Promise((He) => setTimeout(He, 100)), te++;
        return (_ = window.__INITIAL_DATA__) != null && _.widgetId ? (oe(window.__INITIAL_DATA__.widgetId), await Kn() ? ((h = window.__INITIAL_DATA__) != null && h.workflow && Ie.value && await fe(), !0) : (ne.value = "connected", !1)) : (console.error("Widget data not available after waiting"), !1);
      } catch (te) {
        return console.error("Failed to initialize widget:", te), !1;
      }
    }, oc = () => {
      Le(async () => {
        await Kn();
      }), window.addEventListener("message", (p) => {
        p.data.type === "SCROLL_TO_BOTTOM" && Qt(), p.data.type === "TOKEN_RECEIVED" && localStorage.setItem(ks, p.data.token);
      }), Ze((p) => {
        var _;
        if (y.value = p.button_text || "Start Chat", p.type === "landing_page")
          J.value = p.landing_page_data, Tn.value = !0, N.value = !1;
        else if (p.type === "form" || p.type === "display_form")
          if (((_ = p.form_data) == null ? void 0 : _.form_full_screen) === !0)
            q.value = p.form_data, N.value = !0, Tn.value = !1;
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
            b.value.findIndex(
              (ye) => ye.message_type === "form" && !ye.isSubmitted
            ) === -1 && b.value.push(h), Tn.value = !1, N.value = !1;
          }
        else
          Tn.value = !1, N.value = !1;
      }), it((p) => {
        console.log("Workflow proceeded:", p);
      });
    }, ac = async () => {
      try {
        await io(), await fe();
      } catch (p) {
        throw console.error("Failed to start new conversation:", p), p;
      }
    }, lc = async () => {
      Ke.value = !1, b.value = [], await ac();
    };
    Ja(async () => {
      await io(), oc(), ae(), document.addEventListener("click", d), (() => {
        const _ = b.value.length > 0, h = ne.value === "connected", te = document.querySelector('input[type="text"], textarea') !== null;
        return _ || h || te;
      })() && setTimeout(V, 100);
    }), Bi(() => {
      window.removeEventListener("message", (p) => {
        p.data.type === "SCROLL_TO_BOTTOM" && Qt();
      }), document.removeEventListener("click", d), W && (W.disconnect(), W = null), ae.timeoutId && (clearTimeout(ae.timeoutId), ae.timeoutId = null), je(), Q();
    });
    const Ut = ft(() => o.value.chat_style === "ASK_ANYTHING"), cc = ft(() => {
      const p = {
        width: "100%",
        height: "580px",
        borderRadius: "var(--radius-lg)"
      };
      return window.innerWidth <= 768 && (p.width = "100vw", p.height = "100vh", p.borderRadius = "0", p.position = "fixed", p.top = "0", p.left = "0", p.bottom = "0", p.right = "0", p.maxWidth = "100vw", p.maxHeight = "100vh"), Ut.value ? window.innerWidth <= 768 ? {
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
    }), oo = ft(() => Ut.value && b.value.length === 0);
    return (p, _) => S.value && B.value ? (I(), O("div", Vd, _[18] || (_[18] = [
      Hr('<div class="widget-unavailable-card" data-v-a51832d1><div class="widget-unavailable-icon-wrapper" data-v-a51832d1><svg class="widget-unavailable-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-v-a51832d1><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" data-v-a51832d1></path><path d="M9 12l2 2 4-4" data-v-a51832d1></path></svg></div><h2 class="widget-unavailable-title" data-v-a51832d1>Chat Unavailable</h2><p class="widget-unavailable-message" data-v-a51832d1> This chat widget is not currently configured. Please contact the website administrator to enable chat support. </p><div class="widget-unavailable-footer" data-v-a51832d1><svg class="chattermate-logo-small" width="14" height="14" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-a51832d1><path d="M45 15H15C13.3431 15 12 16.3431 12 18V42C12 43.6569 13.3431 45 15 45H25L30 52L35 45H45C46.6569 45 48 43.6569 48 42V18C48 16.3431 46.6569 15 45 15Z" fill="currentColor" opacity="0.6" data-v-a51832d1></path></svg><span data-v-a51832d1>Powered by ChatterMate</span></div></div>', 1)
    ]))) : S.value ? (I(), O("div", Kd, [
      w("div", Gd, [
        _[19] || (_[19] = Hr('<div class="auth-error-header" data-v-a51832d1><svg class="auth-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-a51832d1><circle cx="12" cy="12" r="10" data-v-a51832d1></circle><line x1="12" y1="8" x2="12" y2="12" data-v-a51832d1></line><line x1="12" y1="16" x2="12.01" y2="16" data-v-a51832d1></line></svg><h2 data-v-a51832d1>Authentication Error</h2></div>', 1)),
        w("p", Yd, ce(E.value), 1),
        w("button", {
          class: "auth-error-refresh-btn",
          onClick: _[0] || (_[0] = () => p.window.location.reload())
        }, " Refresh Page ")
      ])
    ])) : i.value && !S.value ? (I(), O("div", {
      key: 2,
      class: tt(["chat-container", { collapsed: !et.value, "ask-anything-style": Ut.value }]),
      style: ze({ ...R(ot), ...cc.value })
    }, [
      g.value ? (I(), O("div", Zd, _[20] || (_[20] = [
        Hr('<div class="loading-spinner" data-v-a51832d1><div class="dot" data-v-a51832d1></div><div class="dot" data-v-a51832d1></div><div class="dot" data-v-a51832d1></div></div><div class="loading-text" data-v-a51832d1>Initializing chat...</div>', 2)
      ]))) : ge("", !0),
      !g.value && R(ne) !== "connected" ? (I(), O("div", {
        key: 1,
        class: tt(["connection-status", R(ne)])
      }, [
        R(ne) === "connecting" ? (I(), O("div", Xd, _[21] || (_[21] = [
          Dt(" Connecting to chat service... ", -1),
          w("div", { class: "loading-dots" }, [
            w("div", { class: "dot" }),
            w("div", { class: "dot" }),
            w("div", { class: "dot" })
          ], -1)
        ]))) : R(ne) === "failed" ? (I(), O("div", Jd, [
          _[22] || (_[22] = Dt(" Connection failed. ", -1)),
          w("button", {
            onClick: Hs,
            class: "reconnect-button"
          }, " Click here to reconnect ")
        ])) : ge("", !0)
      ], 2)) : ge("", !0),
      R($) ? (I(), O("div", {
        key: 2,
        class: "error-alert",
        style: ze(R(z))
      }, ce(R(D)), 5)) : ge("", !0),
      oo.value ? (I(), O("div", {
        key: 3,
        class: "welcome-message-section",
        style: ze(R(Z))
      }, [
        w("div", Qd, [
          w("div", ep, [
            R(pe) ? (I(), O("img", {
              key: 0,
              src: R(pe),
              alt: R(a),
              class: "welcome-avatar"
            }, null, 8, tp)) : ge("", !0),
            w("h1", np, ce(R(o).welcome_title || `Welcome to ${R(a)}`), 1),
            w("p", sp, ce(R(o).welcome_subtitle || "I'm here to help you with anything you need. What can I assist you with today?"), 1)
          ])
        ]),
        w("div", rp, [
          !R(Ae) && !Ie.value && !Ut.value ? (I(), O("div", ip, [
            Fn(w("input", {
              "onUpdate:modelValue": _[1] || (_[1] = (h) => re.value = h),
              type: "email",
              placeholder: "Enter your email address",
              disabled: R(v) || R(ne) !== "connected",
              class: tt([{
                invalid: re.value.trim() && !R(ds)(re.value.trim()),
                disabled: R(ne) !== "connected"
              }, "welcome-email-input"])
            }, null, 10, op), [
              [Un, re.value]
            ])
          ])) : ge("", !0),
          w("div", ap, [
            Fn(w("input", {
              "onUpdate:modelValue": _[2] || (_[2] = (h) => Oe.value = h),
              type: "text",
              placeholder: Vn.value,
              onKeypress: as,
              onInput: Pe,
              onChange: Pe,
              disabled: !un.value,
              class: tt([{ disabled: !un.value }, "welcome-message-field"])
            }, null, 42, lp), [
              [Un, Oe.value]
            ]),
            w("button", {
              class: "welcome-send-button",
              style: ze(R(X)),
              onClick: kn,
              disabled: !Oe.value.trim() || !un.value
            }, _[23] || (_[23] = [
              w("svg", {
                width: "20",
                height: "20",
                viewBox: "0 0 24 24",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg"
              }, [
                w("path", {
                  d: "M5 12L3 21L21 12L3 3L5 12ZM5 12L13 12",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                })
              ], -1)
            ]), 12, cp)
          ])
        ]),
        w("div", {
          class: "powered-by-welcome",
          style: ze(R(se))
        }, _[24] || (_[24] = [
          w("svg", {
            class: "chattermate-logo",
            width: "16",
            height: "16",
            viewBox: "0 0 60 60",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg"
          }, [
            w("path", {
              d: "M45 15H15C13.3431 15 12 16.3431 12 18V42C12 43.6569 13.3431 45 15 45H25L30 52L35 45H45C46.6569 45 48 43.6569 48 42V18C48 16.3431 46.6569 15 45 15Z",
              fill: "currentColor",
              opacity: "0.8"
            }),
            w("path", {
              d: "M36 27C36 27 32.5 26 30 26C27.5 26 24 27 24 31C24 35 27.5 36 30 36C32.5 36 36 35 36 35V33C36 33 33 34 31.5 34C30 34 27 33 27 31C27 29 30 28 31.5 28C33 28 36 29 36 29V27Z",
              fill: "currentColor"
            })
          ], -1),
          Dt(" Powered by ChatterMate ", -1)
        ]), 4)
      ], 4)) : ge("", !0),
      Tn.value && J.value ? (I(), O("div", {
        key: 4,
        class: "landing-page-fullscreen",
        style: ze(R(Z))
      }, [
        w("div", up, [
          w("div", fp, [
            w("h2", hp, ce(J.value.heading), 1),
            w("div", dp, ce(J.value.content), 1)
          ]),
          w("div", pp, [
            w("button", {
              class: "landing-page-button",
              onClick: ic
            }, ce(y.value), 1)
          ])
        ]),
        w("div", {
          class: "powered-by-landing",
          style: ze(R(se))
        }, _[25] || (_[25] = [
          w("svg", {
            class: "chattermate-logo",
            width: "16",
            height: "16",
            viewBox: "0 0 60 60",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg"
          }, [
            w("path", {
              d: "M45 15H15C13.3431 15 12 16.3431 12 18V42C12 43.6569 13.3431 45 15 45H25L30 52L35 45H45C46.6569 45 48 43.6569 48 42V18C48 16.3431 46.6569 15 45 15Z",
              fill: "currentColor",
              opacity: "0.8"
            }),
            w("path", {
              d: "M36 27C36 27 32.5 26 30 26C27.5 26 24 27 24 31C24 35 27.5 36 30 36C32.5 36 36 35 36 35V33C36 33 33 34 31.5 34C30 34 27 33 27 31C27 29 30 28 31.5 28C33 28 36 29 36 29V27Z",
              fill: "currentColor"
            })
          ], -1),
          Dt(" Powered by ChatterMate ", -1)
        ]), 4)
      ], 4)) : N.value && q.value ? (I(), O("div", {
        key: 5,
        class: "form-fullscreen",
        style: ze(R(Z))
      }, [
        w("div", gp, [
          q.value.title || q.value.description ? (I(), O("div", mp, [
            q.value.title ? (I(), O("h2", _p, ce(q.value.title), 1)) : ge("", !0),
            q.value.description ? (I(), O("p", yp, ce(q.value.description), 1)) : ge("", !0)
          ])) : ge("", !0),
          w("div", vp, [
            (I(!0), O(st, null, zt(q.value.fields, (h) => {
              var te, ye;
              return I(), O("div", {
                key: h.name,
                class: "form-field"
              }, [
                w("label", {
                  for: `fullscreen-form-${h.name}`,
                  class: "field-label"
                }, [
                  Dt(ce(h.label) + " ", 1),
                  h.required ? (I(), O("span", wp, "*")) : ge("", !0)
                ], 8, bp),
                h.type === "text" || h.type === "email" || h.type === "tel" ? (I(), O("input", {
                  key: 0,
                  id: `fullscreen-form-${h.name}`,
                  type: h.type,
                  placeholder: h.placeholder || "",
                  required: h.required,
                  minlength: h.minLength,
                  maxlength: h.maxLength,
                  value: at.value[h.name] || "",
                  onInput: (le) => bt(h.name, le.target.value),
                  onBlur: (le) => bt(h.name, le.target.value),
                  class: tt(["form-input", { error: lt.value[h.name] }]),
                  autocomplete: h.type === "email" ? "email" : h.type === "tel" ? "tel" : "off",
                  inputmode: h.type === "tel" ? "tel" : h.type === "email" ? "email" : "text"
                }, null, 42, kp)) : h.type === "number" ? (I(), O("input", {
                  key: 1,
                  id: `fullscreen-form-${h.name}`,
                  type: "number",
                  placeholder: h.placeholder || "",
                  required: h.required,
                  min: h.minLength,
                  max: h.maxLength,
                  value: at.value[h.name] || "",
                  onInput: (le) => bt(h.name, le.target.value),
                  class: tt(["form-input", { error: lt.value[h.name] }])
                }, null, 42, xp)) : h.type === "textarea" ? (I(), O("textarea", {
                  key: 2,
                  id: `fullscreen-form-${h.name}`,
                  placeholder: h.placeholder || "",
                  required: h.required,
                  minlength: h.minLength,
                  maxlength: h.maxLength,
                  value: at.value[h.name] || "",
                  onInput: (le) => bt(h.name, le.target.value),
                  class: tt(["form-textarea", { error: lt.value[h.name] }]),
                  rows: "4"
                }, null, 42, Tp)) : h.type === "select" ? (I(), O("select", {
                  key: 3,
                  id: `fullscreen-form-${h.name}`,
                  required: h.required,
                  value: at.value[h.name] || "",
                  onChange: (le) => bt(h.name, le.target.value),
                  class: tt(["form-select", { error: lt.value[h.name] }])
                }, [
                  w("option", Ap, ce(h.placeholder || "Please select..."), 1),
                  (I(!0), O(st, null, zt((Array.isArray(h.options) ? h.options : ((te = h.options) == null ? void 0 : te.split(`
`)) || []).filter((le) => le.trim()), (le) => (I(), O("option", {
                    key: le,
                    value: le.trim()
                  }, ce(le.trim()), 9, Ep))), 128))
                ], 42, Sp)) : h.type === "checkbox" ? (I(), O("label", Cp, [
                  w("input", {
                    id: `fullscreen-form-${h.name}`,
                    type: "checkbox",
                    required: h.required,
                    checked: at.value[h.name] || !1,
                    onChange: (le) => bt(h.name, le.target.checked),
                    class: "form-checkbox"
                  }, null, 40, Rp),
                  w("span", Lp, ce(h.label), 1)
                ])) : h.type === "radio" ? (I(), O("div", Ip, [
                  (I(!0), O(st, null, zt((Array.isArray(h.options) ? h.options : ((ye = h.options) == null ? void 0 : ye.split(`
`)) || []).filter((le) => le.trim()), (le) => (I(), O("label", {
                    key: le,
                    class: "radio-field"
                  }, [
                    w("input", {
                      type: "radio",
                      name: `fullscreen-form-${h.name}`,
                      value: le.trim(),
                      required: h.required,
                      checked: at.value[h.name] === le.trim(),
                      onChange: (He) => bt(h.name, le.trim()),
                      class: "form-radio"
                    }, null, 40, Op),
                    w("span", Pp, ce(le.trim()), 1)
                  ]))), 128))
                ])) : ge("", !0),
                lt.value[h.name] ? (I(), O("div", Np, ce(lt.value[h.name]), 1)) : ge("", !0)
              ]);
            }), 128))
          ]),
          w("div", Mp, [
            w("button", {
              onClick: _[3] || (_[3] = () => {
                console.log("Submit button clicked!"), tc();
              }),
              disabled: dt.value,
              class: "submit-form-button",
              style: ze(R(X))
            }, [
              dt.value ? (I(), O("span", Fp, _[26] || (_[26] = [
                w("div", { class: "dot" }, null, -1),
                w("div", { class: "dot" }, null, -1),
                w("div", { class: "dot" }, null, -1)
              ]))) : (I(), O("span", $p, ce(q.value.submit_button_text || "Submit"), 1))
            ], 12, Dp)
          ])
        ]),
        w("div", {
          class: "powered-by-landing",
          style: ze(R(se))
        }, _[27] || (_[27] = [
          w("svg", {
            class: "chattermate-logo",
            width: "16",
            height: "16",
            viewBox: "0 0 60 60",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg"
          }, [
            w("path", {
              d: "M45 15H15C13.3431 15 12 16.3431 12 18V42C12 43.6569 13.3431 45 15 45H25L30 52L35 45H45C46.6569 45 48 43.6569 48 42V18C48 16.3431 46.6569 15 45 15Z",
              fill: "currentColor",
              opacity: "0.8"
            }),
            w("path", {
              d: "M36 27C36 27 32.5 26 30 26C27.5 26 24 27 24 31C24 35 27.5 36 30 36C32.5 36 36 35 36 35V33C36 33 33 34 31.5 34C30 34 27 33 27 31C27 29 30 28 31.5 28C33 28 36 29 36 29V27Z",
              fill: "currentColor"
            })
          ], -1),
          Dt(" Powered by ChatterMate ", -1)
        ]), 4)
      ], 4)) : oo.value ? ge("", !0) : (I(), O(st, { key: 6 }, [
        et.value ? (I(), O("div", {
          key: 0,
          class: tt(["chat-panel", { "ask-anything-chat": Ut.value }]),
          style: ze(R(Z))
        }, [
          Ut.value ? (I(), O("div", {
            key: 1,
            class: "ask-anything-top",
            style: ze(R(Ce))
          }, [
            w("div", Wp, [
              ct.value || R(pe) ? (I(), O("img", {
                key: 0,
                src: ct.value || R(pe),
                alt: R(j).human_agent_name || R(a),
                class: "header-avatar"
              }, null, 8, qp)) : ge("", !0),
              w("div", jp, [
                w("h3", {
                  style: ze(R(se))
                }, ce(R(a)), 5),
                w("p", {
                  class: "ask-anything-subtitle",
                  style: ze(R(se))
                }, ce(R(o).welcome_subtitle || "Ask me anything. I'm here to help."), 5)
              ])
            ])
          ], 4)) : (I(), O("div", {
            key: 0,
            class: "chat-header",
            style: ze(R(Ce))
          }, [
            w("div", Bp, [
              ct.value || R(pe) ? (I(), O("img", {
                key: 0,
                src: ct.value || R(pe),
                alt: R(j).human_agent_name || R(a),
                class: "header-avatar"
              }, null, 8, Up)) : ge("", !0),
              w("div", zp, [
                w("h3", {
                  style: ze(R(se))
                }, ce(R(j).human_agent_name || R(a)), 5),
                w("div", Hp, [
                  _[28] || (_[28] = w("span", { class: "status-indicator online" }, null, -1)),
                  w("span", {
                    class: "status-text",
                    style: ze(R(se))
                  }, "Online", 4)
                ])
              ])
            ])
          ], 4)),
          R(Y) ? (I(), O("div", Vp, _[29] || (_[29] = [
            w("div", { class: "loading-spinner" }, [
              w("div", { class: "dot" }),
              w("div", { class: "dot" }),
              w("div", { class: "dot" })
            ], -1)
          ]))) : ge("", !0),
          w("div", {
            class: "chat-messages",
            ref_key: "messagesContainer",
            ref: L
          }, [
            (I(!0), O(st, null, zt(R(b), (h, te) => {
              var ye, le, He, be, Yt, us, Yn, lo, co, uo, fo, ho, po, go, mo, _o, yo, vo, bo;
              return I(), O("div", {
                key: te,
                class: tt([
                  "message",
                  h.message_type === "bot" || h.message_type === "agent" ? "agent-message" : h.message_type === "system" ? "system-message" : h.message_type === "rating" ? "rating-message" : h.message_type === "form" ? "form-message" : h.message_type === "product" || h.shopify_output ? "product-message" : "user-message"
                ])
              }, [
                w("div", {
                  class: "message-bubble",
                  style: ze(h.message_type === "system" || h.message_type === "rating" || h.message_type === "product" || h.shopify_output ? {} : h.message_type === "user" ? R(X) : R(K))
                }, [
                  h.message_type === "rating" ? (I(), O("div", Kp, [
                    w("p", Gp, "Rate the chat session that you had with " + ce(h.agent_name || R(j).human_agent_name || R(a) || "our agent"), 1),
                    w("div", {
                      class: tt(["star-rating", { submitted: Mt.value || h.isSubmitted }])
                    }, [
                      (I(), O(st, null, zt(5, (C) => w("button", {
                        key: C,
                        class: tt(["star-button", {
                          warning: C <= (h.isSubmitted ? h.finalRating : ht.value || h.selectedRating) && (h.isSubmitted ? h.finalRating : ht.value || h.selectedRating) <= 3,
                          success: C <= (h.isSubmitted ? h.finalRating : ht.value || h.selectedRating) && (h.isSubmitted ? h.finalRating : ht.value || h.selectedRating) > 3,
                          selected: C <= (h.isSubmitted ? h.finalRating : ht.value || h.selectedRating)
                        }]),
                        onMouseover: (fn) => !h.isSubmitted && kt(C),
                        onMouseleave: (fn) => !h.isSubmitted && Gt,
                        onClick: (fn) => !h.isSubmitted && Dn(C),
                        disabled: Mt.value || h.isSubmitted
                      }, " ★ ", 42, Yp)), 64))
                    ], 2),
                    h.showFeedback && !h.isSubmitted ? (I(), O("div", Zp, [
                      w("div", Xp, [
                        Fn(w("input", {
                          "onUpdate:modelValue": (C) => h.feedback = C,
                          placeholder: "Please share your feedback (optional)",
                          disabled: Mt.value,
                          maxlength: "500",
                          class: "feedback-input"
                        }, null, 8, Jp), [
                          [Un, h.feedback]
                        ]),
                        w("div", Qp, ce(((ye = h.feedback) == null ? void 0 : ye.length) || 0) + "/500", 1)
                      ]),
                      w("button", {
                        onClick: (C) => cs(h.session_id, ht.value, h.feedback),
                        disabled: Mt.value || !ht.value,
                        class: "submit-rating-button",
                        style: ze({ backgroundColor: R(o).accent_color || "var(--primary-color)" })
                      }, ce(Mt.value ? "Submitting..." : "Submit Rating"), 13, eg)
                    ])) : ge("", !0),
                    h.isSubmitted && h.finalFeedback ? (I(), O("div", tg, [
                      w("div", ng, [
                        w("p", sg, ce(h.finalFeedback), 1)
                      ])
                    ])) : h.isSubmitted ? (I(), O("div", rg, " Thank you for your rating! ")) : ge("", !0)
                  ])) : h.message_type === "form" ? (I(), O("div", ig, [
                    (He = (le = h.attributes) == null ? void 0 : le.form_data) != null && He.title || (Yt = (be = h.attributes) == null ? void 0 : be.form_data) != null && Yt.description ? (I(), O("div", og, [
                      (Yn = (us = h.attributes) == null ? void 0 : us.form_data) != null && Yn.title ? (I(), O("h3", ag, ce(h.attributes.form_data.title), 1)) : ge("", !0),
                      (co = (lo = h.attributes) == null ? void 0 : lo.form_data) != null && co.description ? (I(), O("p", lg, ce(h.attributes.form_data.description), 1)) : ge("", !0)
                    ])) : ge("", !0),
                    w("div", cg, [
                      (I(!0), O(st, null, zt((fo = (uo = h.attributes) == null ? void 0 : uo.form_data) == null ? void 0 : fo.fields, (C) => {
                        var fn, Nr;
                        return I(), O("div", {
                          key: C.name,
                          class: "form-field"
                        }, [
                          w("label", {
                            for: `form-${C.name}`,
                            class: "field-label"
                          }, [
                            Dt(ce(C.label) + " ", 1),
                            C.required ? (I(), O("span", fg, "*")) : ge("", !0)
                          ], 8, ug),
                          C.type === "text" || C.type === "email" || C.type === "tel" ? (I(), O("input", {
                            key: 0,
                            id: `form-${C.name}`,
                            type: C.type,
                            placeholder: C.placeholder || "",
                            required: C.required,
                            minlength: C.minLength,
                            maxlength: C.maxLength,
                            value: at.value[C.name] || "",
                            onInput: (Fe) => bt(C.name, Fe.target.value),
                            onBlur: (Fe) => bt(C.name, Fe.target.value),
                            class: tt(["form-input", { error: lt.value[C.name] }]),
                            disabled: dt.value,
                            autocomplete: C.type === "email" ? "email" : C.type === "tel" ? "tel" : "off",
                            inputmode: C.type === "tel" ? "tel" : C.type === "email" ? "email" : "text"
                          }, null, 42, hg)) : C.type === "number" ? (I(), O("input", {
                            key: 1,
                            id: `form-${C.name}`,
                            type: "number",
                            placeholder: C.placeholder || "",
                            required: C.required,
                            min: C.min,
                            max: C.max,
                            value: at.value[C.name] || "",
                            onInput: (Fe) => bt(C.name, Fe.target.value),
                            class: tt(["form-input", { error: lt.value[C.name] }]),
                            disabled: dt.value
                          }, null, 42, dg)) : C.type === "textarea" ? (I(), O("textarea", {
                            key: 2,
                            id: `form-${C.name}`,
                            placeholder: C.placeholder || "",
                            required: C.required,
                            minlength: C.minLength,
                            maxlength: C.maxLength,
                            value: at.value[C.name] || "",
                            onInput: (Fe) => bt(C.name, Fe.target.value),
                            class: tt(["form-textarea", { error: lt.value[C.name] }]),
                            disabled: dt.value,
                            rows: "3"
                          }, null, 42, pg)) : C.type === "select" ? (I(), O("select", {
                            key: 3,
                            id: `form-${C.name}`,
                            required: C.required,
                            value: at.value[C.name] || "",
                            onChange: (Fe) => bt(C.name, Fe.target.value),
                            class: tt(["form-select", { error: lt.value[C.name] }]),
                            disabled: dt.value
                          }, [
                            w("option", mg, ce(C.placeholder || "Select an option"), 1),
                            (I(!0), O(st, null, zt((Array.isArray(C.options) ? C.options : ((fn = C.options) == null ? void 0 : fn.split(`
`)) || []).filter((Fe) => Fe.trim()), (Fe) => (I(), O("option", {
                              key: Fe.trim(),
                              value: Fe.trim()
                            }, ce(Fe.trim()), 9, _g))), 128))
                          ], 42, gg)) : C.type === "checkbox" ? (I(), O("div", yg, [
                            w("input", {
                              id: `form-${C.name}`,
                              type: "checkbox",
                              checked: at.value[C.name] || !1,
                              onChange: (Fe) => bt(C.name, Fe.target.checked),
                              class: "form-checkbox",
                              disabled: dt.value
                            }, null, 40, vg),
                            w("label", {
                              for: `form-${C.name}`,
                              class: "checkbox-label"
                            }, ce(C.placeholder || C.label), 9, bg)
                          ])) : C.type === "radio" ? (I(), O("div", wg, [
                            (I(!0), O(st, null, zt((Array.isArray(C.options) ? C.options : ((Nr = C.options) == null ? void 0 : Nr.split(`
`)) || []).filter((Fe) => Fe.trim()), (Fe) => (I(), O("div", {
                              key: Fe.trim(),
                              class: "radio-option"
                            }, [
                              w("input", {
                                id: `form-${C.name}-${Fe.trim()}`,
                                name: `form-${C.name}`,
                                type: "radio",
                                value: Fe.trim(),
                                checked: at.value[C.name] === Fe.trim(),
                                onChange: (Um) => bt(C.name, Fe.trim()),
                                class: "form-radio",
                                disabled: dt.value
                              }, null, 40, kg),
                              w("label", {
                                for: `form-${C.name}-${Fe.trim()}`,
                                class: "radio-label"
                              }, ce(Fe.trim()), 9, xg)
                            ]))), 128))
                          ])) : ge("", !0),
                          lt.value[C.name] ? (I(), O("div", Tg, ce(lt.value[C.name]), 1)) : ge("", !0)
                        ]);
                      }), 128))
                    ]),
                    w("div", Sg, [
                      w("button", {
                        onClick: () => {
                          var C;
                          console.log("Regular form submit button clicked!"), Ws((C = h.attributes) == null ? void 0 : C.form_data);
                        },
                        disabled: dt.value,
                        class: "form-submit-button",
                        style: ze(R(X))
                      }, ce(dt.value ? "Submitting..." : ((po = (ho = h.attributes) == null ? void 0 : ho.form_data) == null ? void 0 : po.submit_button_text) || "Submit"), 13, Ag)
                    ])
                  ])) : h.message_type === "user_input" ? (I(), O("div", Eg, [
                    (go = h.attributes) != null && go.prompt_message && h.attributes.prompt_message.trim() ? (I(), O("div", Cg, ce(h.attributes.prompt_message), 1)) : ge("", !0),
                    h.isSubmitted ? (I(), O("div", Og, [
                      _[30] || (_[30] = w("strong", null, "Your input:", -1)),
                      Dt(" " + ce(h.submittedValue) + " ", 1),
                      (mo = h.attributes) != null && mo.confirmation_message && h.attributes.confirmation_message.trim() ? (I(), O("div", Pg, ce(h.attributes.confirmation_message), 1)) : ge("", !0)
                    ])) : (I(), O("div", Rg, [
                      Fn(w("textarea", {
                        "onUpdate:modelValue": (C) => h.userInputValue = C,
                        class: "user-input-textarea",
                        placeholder: "Type your message here...",
                        rows: "3",
                        onKeydown: [
                          Yo(Xn((C) => Pr(h), ["ctrl"]), ["enter"]),
                          Yo(Xn((C) => Pr(h), ["meta"]), ["enter"])
                        ]
                      }, null, 40, Lg), [
                        [Un, h.userInputValue]
                      ]),
                      w("button", {
                        class: "user-input-submit-button",
                        onClick: (C) => Pr(h),
                        disabled: !h.userInputValue || !h.userInputValue.trim()
                      }, " Submit ", 8, Ig)
                    ]))
                  ])) : h.shopify_output || h.message_type === "product" ? (I(), O("div", Ng, [
                    h.message ? (I(), O("div", {
                      key: 0,
                      innerHTML: s(((yo = (_o = h.shopify_output) == null ? void 0 : _o.products) == null ? void 0 : yo.length) > 0 ? sc(h.message) : h.message),
                      class: "product-message-text"
                    }, null, 8, Mg)) : ge("", !0),
                    (vo = h.shopify_output) != null && vo.products && h.shopify_output.products.length > 0 ? (I(), O("div", Dg, [
                      _[32] || (_[32] = w("h3", { class: "carousel-title" }, "Products", -1)),
                      w("div", Fg, [
                        (I(!0), O(st, null, zt(h.shopify_output.products, (C) => {
                          var fn;
                          return I(), O("div", {
                            key: C.id,
                            class: "product-card-compact carousel-item"
                          }, [
                            (fn = C.image) != null && fn.src ? (I(), O("div", $g, [
                              w("img", {
                                src: C.image.src,
                                alt: C.title,
                                class: "product-thumbnail"
                              }, null, 8, Bg)
                            ])) : ge("", !0),
                            w("div", Ug, [
                              w("div", zg, [
                                w("div", Hg, ce(C.title), 1),
                                C.variant_title && C.variant_title !== "Default Title" ? (I(), O("div", Wg, ce(C.variant_title), 1)) : ge("", !0),
                                w("div", qg, ce(C.price_formatted || R(c)(C.price, C.currency)), 1)
                              ]),
                              w("div", jg, [
                                w("button", {
                                  class: "view-details-button-compact",
                                  onClick: (Nr) => {
                                    var Fe;
                                    return nc(C, (Fe = h.shopify_output) == null ? void 0 : Fe.shop_domain);
                                  }
                                }, _[31] || (_[31] = [
                                  Dt(" View product ", -1),
                                  w("span", { class: "external-link-icon" }, "↗", -1)
                                ]), 8, Vg)
                              ])
                            ])
                          ]);
                        }), 128))
                      ])
                    ])) : !h.message && ((bo = h.shopify_output) != null && bo.products) && h.shopify_output.products.length === 0 ? (I(), O("div", Kg, _[33] || (_[33] = [
                      w("p", null, "No products found.", -1)
                    ]))) : !h.message && h.shopify_output && !h.shopify_output.products ? (I(), O("div", Gg, _[34] || (_[34] = [
                      w("p", null, "No products to display.", -1)
                    ]))) : ge("", !0)
                  ])) : (I(), O(st, { key: 4 }, [
                    w("div", {
                      innerHTML: s(h.message)
                    }, null, 8, Yg),
                    h.attachments && h.attachments.length > 0 ? (I(), O("div", Zg, [
                      (I(!0), O(st, null, zt(h.attachments, (C) => (I(), O("div", {
                        key: C.id,
                        class: "attachment-item"
                      }, [
                        R(x)(C.content_type) ? (I(), O("div", Xg, [
                          w("img", {
                            src: R(P)(C.file_url),
                            alt: C.filename,
                            class: "attachment-image",
                            onClick: Xn((fn) => R(vt)({ url: C.file_url, filename: C.filename, type: C.content_type, file_url: R(P)(C.file_url), size: void 0 }), ["stop"]),
                            style: { cursor: "pointer" }
                          }, null, 8, Jg),
                          w("div", Qg, [
                            w("a", {
                              href: R(P)(C.file_url),
                              target: "_blank",
                              class: "attachment-link"
                            }, [
                              _[35] || (_[35] = w("svg", {
                                width: "14",
                                height: "14",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                stroke: "currentColor",
                                "stroke-width": "2",
                                "stroke-linecap": "round",
                                "stroke-linejoin": "round"
                              }, [
                                w("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
                                w("polyline", { points: "7 10 12 15 17 10" }),
                                w("line", {
                                  x1: "12",
                                  y1: "15",
                                  x2: "12",
                                  y2: "3"
                                })
                              ], -1)),
                              Dt(" " + ce(C.filename) + " ", 1),
                              w("span", tm, "(" + ce(R(T)(C.file_size)) + ")", 1)
                            ], 8, em)
                          ])
                        ])) : (I(), O("a", {
                          key: 1,
                          href: R(P)(C.file_url),
                          target: "_blank",
                          class: "attachment-link"
                        }, [
                          _[36] || (_[36] = w("svg", {
                            width: "14",
                            height: "14",
                            viewBox: "0 0 24 24",
                            fill: "none",
                            stroke: "currentColor",
                            "stroke-width": "2",
                            "stroke-linecap": "round",
                            "stroke-linejoin": "round"
                          }, [
                            w("path", { d: "M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" })
                          ], -1)),
                          Dt(" " + ce(C.filename) + " ", 1),
                          w("span", sm, "(" + ce(R(T)(C.file_size)) + ")", 1)
                        ], 8, nm))
                      ]))), 128))
                    ])) : ge("", !0)
                  ], 64))
                ], 4),
                w("div", rm, [
                  h.message_type === "user" ? (I(), O("span", im, " You ")) : ge("", !0)
                ])
              ], 2);
            }), 128)),
            R(v) ? (I(), O("div", om, _[37] || (_[37] = [
              w("div", { class: "dot" }, null, -1),
              w("div", { class: "dot" }, null, -1),
              w("div", { class: "dot" }, null, -1)
            ]))) : ge("", !0)
          ], 512),
          Ke.value ? (I(), O("div", {
            key: 4,
            class: "new-conversation-section",
            style: ze(R(K))
          }, [
            w("div", km, [
              _[42] || (_[42] = w("p", { class: "ended-text" }, "This chat has ended.", -1)),
              w("button", {
                class: "start-new-conversation-button",
                style: ze(R(X)),
                onClick: lc
              }, " Click here to start a new conversation ", 4)
            ])
          ], 4)) : (I(), O("div", {
            key: 3,
            class: tt(["chat-input", { "ask-anything-input": Ut.value }]),
            style: ze(R(K))
          }, [
            !R(Ae) && !Ie.value && !Ut.value ? (I(), O("div", am, [
              Fn(w("input", {
                "onUpdate:modelValue": _[4] || (_[4] = (h) => re.value = h),
                type: "email",
                placeholder: "Enter your email address to begin",
                disabled: R(v) || R(ne) !== "connected",
                class: tt({
                  invalid: re.value.trim() && !R(ds)(re.value.trim()),
                  disabled: R(ne) !== "connected"
                })
              }, null, 10, lm), [
                [Un, re.value]
              ])
            ])) : ge("", !0),
            w("input", {
              ref_key: "fileInputRef",
              ref: Me,
              type: "file",
              accept: Pm,
              multiple: "",
              style: { display: "none" },
              onChange: _[5] || (_[5] = //@ts-ignore
              (...h) => R(ee) && R(ee)(...h))
            }, null, 544),
            R(Xe).length > 0 ? (I(), O("div", cm, [
              (I(!0), O(st, null, zt(R(Xe), (h, te) => (I(), O("div", {
                key: te,
                class: "file-preview-widget"
              }, [
                w("div", um, [
                  R(zs)(h.type) ? (I(), O("img", {
                    key: 0,
                    src: R(G)(h),
                    alt: h.filename,
                    class: "file-preview-image-widget",
                    onClick: Xn((ye) => R(vt)(h), ["stop"]),
                    style: { cursor: "pointer" }
                  }, null, 8, fm)) : (I(), O("div", {
                    key: 1,
                    class: "file-preview-icon-widget",
                    onClick: Xn((ye) => R(vt)(h), ["stop"]),
                    style: { cursor: "pointer" }
                  }, _[38] || (_[38] = [
                    w("svg", {
                      width: "20",
                      height: "20",
                      viewBox: "0 0 24 24",
                      fill: "none",
                      stroke: "currentColor",
                      "stroke-width": "2"
                    }, [
                      w("path", { d: "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" }),
                      w("polyline", { points: "13 2 13 9 20 9" })
                    ], -1)
                  ]), 8, hm))
                ]),
                w("div", dm, [
                  w("div", pm, ce(h.filename), 1),
                  w("div", gm, ce(R(T)(h.size)), 1)
                ]),
                w("button", {
                  type: "button",
                  class: "file-preview-remove-widget",
                  onClick: (ye) => R(_t)(te),
                  title: "Remove file"
                }, " × ", 8, mm)
              ]))), 128))
            ])) : ge("", !0),
            ro.value ? (I(), O("div", _m, _[39] || (_[39] = [
              w("div", { class: "upload-spinner-widget" }, null, -1),
              w("span", { class: "upload-text-widget" }, "Uploading files...", -1)
            ]))) : ge("", !0),
            w("div", ym, [
              Fn(w("input", {
                "onUpdate:modelValue": _[6] || (_[6] = (h) => Oe.value = h),
                type: "text",
                placeholder: Vn.value,
                onKeypress: as,
                onInput: Pe,
                onChange: Pe,
                onPaste: _[7] || (_[7] = //@ts-ignore
                (...h) => R(Ne) && R(Ne)(...h)),
                onDrop: _[8] || (_[8] = //@ts-ignore
                (...h) => R(ve) && R(ve)(...h)),
                onDragover: _[9] || (_[9] = //@ts-ignore
                (...h) => R(xe) && R(xe)(...h)),
                onDragleave: _[10] || (_[10] = //@ts-ignore
                (...h) => R(Ve) && R(Ve)(...h)),
                disabled: !un.value,
                class: tt({ disabled: !un.value, "ask-anything-field": Ut.value })
              }, null, 42, vm), [
                [Un, Oe.value]
              ]),
              rc.value ? (I(), O("button", {
                key: 0,
                type: "button",
                class: "attach-button",
                disabled: ro.value,
                onClick: _[11] || (_[11] = //@ts-ignore
                (...h) => R(Kt) && R(Kt)(...h)),
                title: `Attach files (${R(Xe).length}/${ya} used) or paste screenshots`
              }, _[40] || (_[40] = [
                w("svg", {
                  width: "22",
                  height: "22",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  xmlns: "http://www.w3.org/2000/svg"
                }, [
                  w("path", {
                    d: "M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48",
                    stroke: "currentColor",
                    "stroke-width": "2.2",
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round"
                  })
                ], -1),
                w("span", { class: "attach-button-glow" }, null, -1)
              ]), 8, bm)) : ge("", !0),
              w("button", {
                class: tt(["send-button", { "ask-anything-send": Ut.value }]),
                style: ze(R(X)),
                onClick: kn,
                disabled: !Oe.value.trim() && R(Xe).length === 0 || !un.value
              }, _[41] || (_[41] = [
                w("svg", {
                  width: "20",
                  height: "20",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  xmlns: "http://www.w3.org/2000/svg"
                }, [
                  w("path", {
                    d: "M5 12L3 21L21 12L3 3L5 12ZM5 12L13 12",
                    stroke: "currentColor",
                    "stroke-width": "2",
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round"
                  })
                ], -1)
              ]), 14, wm)
            ])
          ], 6)),
          w("div", {
            class: "powered-by",
            style: ze(R(se))
          }, _[43] || (_[43] = [
            w("svg", {
              class: "chattermate-logo",
              width: "16",
              height: "16",
              viewBox: "0 0 60 60",
              fill: "none",
              xmlns: "http://www.w3.org/2000/svg"
            }, [
              w("path", {
                d: "M45 15H15C13.3431 15 12 16.3431 12 18V42C12 43.6569 13.3431 45 15 45H25L30 52L35 45H45C46.6569 45 48 43.6569 48 42V18C48 16.3431 46.6569 15 45 15Z",
                fill: "currentColor",
                opacity: "0.8"
              }),
              w("path", {
                d: "M36 27C36 27 32.5 26 30 26C27.5 26 24 27 24 31C24 35 27.5 36 30 36C32.5 36 36 35 36 35V33C36 33 33 34 31.5 34C30 34 27 33 27 31C27 29 30 28 31.5 28C33 28 36 29 36 29V27Z",
                fill: "currentColor"
              })
            ], -1),
            Dt(" Powered by ChatterMate ", -1)
          ]), 4)
        ], 6)) : ge("", !0)
      ], 64)),
      ls.value ? (I(), O("div", xm, [
        w("div", Tm, [
          _[44] || (_[44] = w("h3", null, "Rate your conversation", -1)),
          w("div", Sm, [
            (I(), O(st, null, zt(5, (h) => w("button", {
              key: h,
              onClick: (te) => xn.value = h,
              class: tt([{ active: h <= xn.value }, "star-button"])
            }, " ★ ", 10, Am)), 64))
          ]),
          Fn(w("textarea", {
            "onUpdate:modelValue": _[12] || (_[12] = (h) => Gn.value = h),
            placeholder: "Additional feedback (optional)",
            class: "rating-feedback"
          }, null, 512), [
            [Un, Gn.value]
          ]),
          w("div", Em, [
            w("button", {
              onClick: _[13] || (_[13] = (h) => p.submitRating(xn.value, Gn.value)),
              disabled: !xn.value,
              class: "submit-button",
              style: ze(R(X))
            }, " Submit ", 12, Cm),
            w("button", {
              onClick: _[14] || (_[14] = (h) => ls.value = !1),
              class: "skip-rating"
            }, " Skip ")
          ])
        ])
      ])) : ge("", !0),
      R(u) ? (I(), O("div", {
        key: 8,
        class: "preview-modal-overlay",
        onClick: _[17] || (_[17] = //@ts-ignore
        (...h) => R(De) && R(De)(...h))
      }, [
        w("div", {
          class: "preview-modal-content",
          onClick: _[16] || (_[16] = Xn(() => {
          }, ["stop"]))
        }, [
          w("button", {
            class: "preview-modal-close",
            onClick: _[15] || (_[15] = //@ts-ignore
            (...h) => R(De) && R(De)(...h))
          }, "×"),
          R(m) && R(zs)(R(m).type) ? (I(), O("div", Rm, [
            w("img", {
              src: R(G)(R(m)),
              alt: R(m).filename,
              class: "preview-modal-image"
            }, null, 8, Lm),
            w("div", Im, ce(R(m).filename), 1)
          ])) : ge("", !0)
        ])
      ])) : ge("", !0)
    ], 6)) : (I(), O("div", Om));
  }
}), Mm = (t, e) => {
  const n = t.__vccOpts || t;
  for (const [s, r] of e)
    n[s] = r;
  return n;
}, Dm = /* @__PURE__ */ Mm(Nm, [["__scopeId", "data-v-a51832d1"]]);
window.process || (window.process = { env: { NODE_ENV: "production" } });
const Wt = window.__INITIAL_DATA__, Xl = new URL(window.location.href), Jl = Xl.searchParams.get("preview") === "true", Ql = (t) => {
  const e = Xl.searchParams.get(t);
  if (!(!e || e === "undefined" || e.trim() === ""))
    return e;
}, Fm = Jl ? Ql("widget_id") || (Wt == null ? void 0 : Wt.widgetId) || void 0 : (Wt == null ? void 0 : Wt.widgetId) || void 0, $m = Jl ? (Wt == null ? void 0 : Wt.initialToken) || Ql("token") || void 0 : (Wt == null ? void 0 : Wt.initialToken) || void 0, Bm = Pf(Dm, {
  widgetId: Fm,
  token: $m || void 0,
  initialAuthError: null
  // Let backend determine if auth is required
});
Bm.mount("#app");
