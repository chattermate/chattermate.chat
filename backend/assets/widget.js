var rf = Object.defineProperty;
var of = (e, t, n) => t in e ? rf(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var Qe = (e, t, n) => of(e, typeof t != "symbol" ? t + "" : t, n);
/**
* @vue/shared v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function Zo(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const n of e.split(",")) t[n] = 1;
  return (n) => n in t;
}
const et = {}, Ds = [], vn = () => {
}, af = () => !1, Li = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), Jo = (e) => e.startsWith("onUpdate:"), Lt = Object.assign, Qo = (e, t) => {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}, lf = Object.prototype.hasOwnProperty, Ke = (e, t) => lf.call(e, t), ve = Array.isArray, Fs = (e) => Oi(e) === "[object Map]", cc = (e) => Oi(e) === "[object Set]", Te = (e) => typeof e == "function", dt = (e) => typeof e == "string", Jn = (e) => typeof e == "symbol", ot = (e) => e !== null && typeof e == "object", uc = (e) => (ot(e) || Te(e)) && Te(e.then) && Te(e.catch), fc = Object.prototype.toString, Oi = (e) => fc.call(e), cf = (e) => Oi(e).slice(8, -1), hc = (e) => Oi(e) === "[object Object]", ea = (e) => dt(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, kr = /* @__PURE__ */ Zo(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), Ni = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (n) => t[n] || (t[n] = e(n));
}, uf = /-(\w)/g, Yn = Ni(
  (e) => e.replace(uf, (t, n) => n ? n.toUpperCase() : "")
), ff = /\B([A-Z])/g, Qn = Ni(
  (e) => e.replace(ff, "-$1").toLowerCase()
), dc = Ni((e) => e.charAt(0).toUpperCase() + e.slice(1)), so = Ni(
  (e) => e ? `on${dc(e)}` : ""
), Kn = (e, t) => !Object.is(e, t), si = (e, ...t) => {
  for (let n = 0; n < e.length; n++)
    e[n](...t);
}, Ro = (e, t, n, s = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: s,
    value: n
  });
}, Io = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let Za;
const Pi = () => Za || (Za = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function Ee(e) {
  if (ve(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
      const s = e[n], r = dt(s) ? gf(s) : Ee(s);
      if (r)
        for (const i in r)
          t[i] = r[i];
    }
    return t;
  } else if (dt(e) || ot(e))
    return e;
}
const hf = /;(?![^(]*\))/g, df = /:([^]+)/, pf = /\/\*[^]*?\*\//g;
function gf(e) {
  const t = {};
  return e.replace(pf, "").split(hf).forEach((n) => {
    if (n) {
      const s = n.split(df);
      s.length > 1 && (t[s[0].trim()] = s[1].trim());
    }
  }), t;
}
function ze(e) {
  let t = "";
  if (dt(e))
    t = e;
  else if (ve(e))
    for (let n = 0; n < e.length; n++) {
      const s = ze(e[n]);
      s && (t += s + " ");
    }
  else if (ot(e))
    for (const n in e)
      e[n] && (t += n + " ");
  return t.trim();
}
const mf = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", _f = /* @__PURE__ */ Zo(mf);
function pc(e) {
  return !!e || e === "";
}
const gc = (e) => !!(e && e.__v_isRef === !0), ee = (e) => dt(e) ? e : e == null ? "" : ve(e) || ot(e) && (e.toString === fc || !Te(e.toString)) ? gc(e) ? ee(e.value) : JSON.stringify(e, mc, 2) : String(e), mc = (e, t) => gc(t) ? mc(e, t.value) : Fs(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (n, [s, r], i) => (n[ro(s, i) + " =>"] = r, n),
    {}
  )
} : cc(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((n) => ro(n))
} : Jn(t) ? ro(t) : ot(t) && !ve(t) && !hc(t) ? String(t) : t, ro = (e, t = "") => {
  var n;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    Jn(e) ? `Symbol(${(n = e.description) != null ? n : t})` : e
  );
};
/**
* @vue/reactivity v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let $t;
class yf {
  constructor(t = !1) {
    this.detached = t, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this.parent = $t, !t && $t && (this.index = ($t.scopes || ($t.scopes = [])).push(
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
      const n = $t;
      try {
        return $t = this, t();
      } finally {
        $t = n;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = $t, $t = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    this._on > 0 && --this._on === 0 && ($t = this.prevScope, this.prevScope = void 0);
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
function vf() {
  return $t;
}
let nt;
const io = /* @__PURE__ */ new WeakSet();
class _c {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, $t && $t.active && $t.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, io.has(this) && (io.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || vc(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, Ja(this), bc(this);
    const t = nt, n = cn;
    nt = this, cn = !0;
    try {
      return this.fn();
    } finally {
      wc(this), nt = t, cn = n, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        sa(t);
      this.deps = this.depsTail = void 0, Ja(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? io.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    Lo(this) && this.run();
  }
  get dirty() {
    return Lo(this);
  }
}
let yc = 0, Tr, xr;
function vc(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = xr, xr = e;
    return;
  }
  e.next = Tr, Tr = e;
}
function ta() {
  yc++;
}
function na() {
  if (--yc > 0)
    return;
  if (xr) {
    let t = xr;
    for (xr = void 0; t; ) {
      const n = t.next;
      t.next = void 0, t.flags &= -9, t = n;
    }
  }
  let e;
  for (; Tr; ) {
    let t = Tr;
    for (Tr = void 0; t; ) {
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
function bc(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function wc(e) {
  let t, n = e.depsTail, s = n;
  for (; s; ) {
    const r = s.prevDep;
    s.version === -1 ? (s === n && (n = r), sa(s), bf(s)) : t = s, s.dep.activeLink = s.prevActiveLink, s.prevActiveLink = void 0, s = r;
  }
  e.deps = t, e.depsTail = n;
}
function Lo(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (kc(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function kc(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === Ir) || (e.globalVersion = Ir, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !Lo(e))))
    return;
  e.flags |= 2;
  const t = e.dep, n = nt, s = cn;
  nt = e, cn = !0;
  try {
    bc(e);
    const r = e.fn(e._value);
    (t.version === 0 || Kn(r, e._value)) && (e.flags |= 128, e._value = r, t.version++);
  } catch (r) {
    throw t.version++, r;
  } finally {
    nt = n, cn = s, wc(e), e.flags &= -3;
  }
}
function sa(e, t = !1) {
  const { dep: n, prevSub: s, nextSub: r } = e;
  if (s && (s.nextSub = r, e.prevSub = void 0), r && (r.prevSub = s, e.nextSub = void 0), n.subs === e && (n.subs = s, !s && n.computed)) {
    n.computed.flags &= -5;
    for (let i = n.computed.deps; i; i = i.nextDep)
      sa(i, !0);
  }
  !t && !--n.sc && n.map && n.map.delete(n.key);
}
function bf(e) {
  const { prevDep: t, nextDep: n } = e;
  t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
let cn = !0;
const Tc = [];
function Nn() {
  Tc.push(cn), cn = !1;
}
function Pn() {
  const e = Tc.pop();
  cn = e === void 0 ? !0 : e;
}
function Ja(e) {
  const { cleanup: t } = e;
  if (e.cleanup = void 0, t) {
    const n = nt;
    nt = void 0;
    try {
      t();
    } finally {
      nt = n;
    }
  }
}
let Ir = 0;
class wf {
  constructor(t, n) {
    this.sub = t, this.dep = n, this.version = n.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class ra {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(t) {
    if (!nt || !cn || nt === this.computed)
      return;
    let n = this.activeLink;
    if (n === void 0 || n.sub !== nt)
      n = this.activeLink = new wf(nt, this), nt.deps ? (n.prevDep = nt.depsTail, nt.depsTail.nextDep = n, nt.depsTail = n) : nt.deps = nt.depsTail = n, xc(n);
    else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
      const s = n.nextDep;
      s.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = s), n.prevDep = nt.depsTail, n.nextDep = void 0, nt.depsTail.nextDep = n, nt.depsTail = n, nt.deps === n && (nt.deps = s);
    }
    return n;
  }
  trigger(t) {
    this.version++, Ir++, this.notify(t);
  }
  notify(t) {
    ta();
    try {
      for (let n = this.subs; n; n = n.prevSub)
        n.sub.notify() && n.sub.dep.notify();
    } finally {
      na();
    }
  }
}
function xc(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let s = t.deps; s; s = s.nextDep)
        xc(s);
    }
    const n = e.dep.subs;
    n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
  }
}
const Oo = /* @__PURE__ */ new WeakMap(), ys = Symbol(
  ""
), No = Symbol(
  ""
), Lr = Symbol(
  ""
);
function Rt(e, t, n) {
  if (cn && nt) {
    let s = Oo.get(e);
    s || Oo.set(e, s = /* @__PURE__ */ new Map());
    let r = s.get(n);
    r || (s.set(n, r = new ra()), r.map = s, r.key = n), r.track();
  }
}
function Rn(e, t, n, s, r, i) {
  const o = Oo.get(e);
  if (!o) {
    Ir++;
    return;
  }
  const a = (l) => {
    l && l.trigger();
  };
  if (ta(), t === "clear")
    o.forEach(a);
  else {
    const l = ve(e), p = l && ea(n);
    if (l && n === "length") {
      const c = Number(s);
      o.forEach((b, w) => {
        (w === "length" || w === Lr || !Jn(w) && w >= c) && a(b);
      });
    } else
      switch ((n !== void 0 || o.has(void 0)) && a(o.get(n)), p && a(o.get(Lr)), t) {
        case "add":
          l ? p && a(o.get("length")) : (a(o.get(ys)), Fs(e) && a(o.get(No)));
          break;
        case "delete":
          l || (a(o.get(ys)), Fs(e) && a(o.get(No)));
          break;
        case "set":
          Fs(e) && a(o.get(ys));
          break;
      }
  }
  na();
}
function Os(e) {
  const t = Ve(e);
  return t === e ? t : (Rt(t, "iterate", Lr), rn(e) ? t : t.map(Tt));
}
function Mi(e) {
  return Rt(e = Ve(e), "iterate", Lr), e;
}
const kf = {
  __proto__: null,
  [Symbol.iterator]() {
    return oo(this, Symbol.iterator, Tt);
  },
  concat(...e) {
    return Os(this).concat(
      ...e.map((t) => ve(t) ? Os(t) : t)
    );
  },
  entries() {
    return oo(this, "entries", (e) => (e[1] = Tt(e[1]), e));
  },
  every(e, t) {
    return Sn(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return Sn(this, "filter", e, t, (n) => n.map(Tt), arguments);
  },
  find(e, t) {
    return Sn(this, "find", e, t, Tt, arguments);
  },
  findIndex(e, t) {
    return Sn(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return Sn(this, "findLast", e, t, Tt, arguments);
  },
  findLastIndex(e, t) {
    return Sn(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return Sn(this, "forEach", e, t, void 0, arguments);
  },
  includes(...e) {
    return ao(this, "includes", e);
  },
  indexOf(...e) {
    return ao(this, "indexOf", e);
  },
  join(e) {
    return Os(this).join(e);
  },
  // keys() iterator only reads `length`, no optimisation required
  lastIndexOf(...e) {
    return ao(this, "lastIndexOf", e);
  },
  map(e, t) {
    return Sn(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return lr(this, "pop");
  },
  push(...e) {
    return lr(this, "push", e);
  },
  reduce(e, ...t) {
    return Qa(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return Qa(this, "reduceRight", e, t);
  },
  shift() {
    return lr(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return Sn(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return lr(this, "splice", e);
  },
  toReversed() {
    return Os(this).toReversed();
  },
  toSorted(e) {
    return Os(this).toSorted(e);
  },
  toSpliced(...e) {
    return Os(this).toSpliced(...e);
  },
  unshift(...e) {
    return lr(this, "unshift", e);
  },
  values() {
    return oo(this, "values", Tt);
  }
};
function oo(e, t, n) {
  const s = Mi(e), r = s[t]();
  return s !== e && !rn(e) && (r._next = r.next, r.next = () => {
    const i = r._next();
    return i.value && (i.value = n(i.value)), i;
  }), r;
}
const Tf = Array.prototype;
function Sn(e, t, n, s, r, i) {
  const o = Mi(e), a = o !== e && !rn(e), l = o[t];
  if (l !== Tf[t]) {
    const b = l.apply(e, i);
    return a ? Tt(b) : b;
  }
  let p = n;
  o !== e && (a ? p = function(b, w) {
    return n.call(this, Tt(b), w, e);
  } : n.length > 2 && (p = function(b, w) {
    return n.call(this, b, w, e);
  }));
  const c = l.call(o, p, s);
  return a && r ? r(c) : c;
}
function Qa(e, t, n, s) {
  const r = Mi(e);
  let i = n;
  return r !== e && (rn(e) ? n.length > 3 && (i = function(o, a, l) {
    return n.call(this, o, a, l, e);
  }) : i = function(o, a, l) {
    return n.call(this, o, Tt(a), l, e);
  }), r[t](i, ...s);
}
function ao(e, t, n) {
  const s = Ve(e);
  Rt(s, "iterate", Lr);
  const r = s[t](...n);
  return (r === -1 || r === !1) && aa(n[0]) ? (n[0] = Ve(n[0]), s[t](...n)) : r;
}
function lr(e, t, n = []) {
  Nn(), ta();
  const s = Ve(e)[t].apply(e, n);
  return na(), Pn(), s;
}
const xf = /* @__PURE__ */ Zo("__proto__,__v_isRef,__isVue"), Ac = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(Jn)
);
function Af(e) {
  Jn(e) || (e = String(e));
  const t = Ve(this);
  return Rt(t, "has", e), t.hasOwnProperty(e);
}
class Sc {
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
      return s === (r ? i ? Mf : Ic : i ? Rc : Cc).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(s) ? t : void 0;
    const o = ve(t);
    if (!r) {
      let l;
      if (o && (l = kf[n]))
        return l;
      if (n === "hasOwnProperty")
        return Af;
    }
    const a = Reflect.get(
      t,
      n,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      It(t) ? t : s
    );
    return (Jn(n) ? Ac.has(n) : xf(n)) || (r || Rt(t, "get", n), i) ? a : It(a) ? o && ea(n) ? a : a.value : ot(a) ? r ? Lc(a) : Di(a) : a;
  }
}
class Ec extends Sc {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, n, s, r) {
    let i = t[n];
    if (!this._isShallow) {
      const l = Xn(i);
      if (!rn(s) && !Xn(s) && (i = Ve(i), s = Ve(s)), !ve(t) && It(i) && !It(s))
        return l ? !1 : (i.value = s, !0);
    }
    const o = ve(t) && ea(n) ? Number(n) < t.length : Ke(t, n), a = Reflect.set(
      t,
      n,
      s,
      It(t) ? t : r
    );
    return t === Ve(r) && (o ? Kn(s, i) && Rn(t, "set", n, s) : Rn(t, "add", n, s)), a;
  }
  deleteProperty(t, n) {
    const s = Ke(t, n);
    t[n];
    const r = Reflect.deleteProperty(t, n);
    return r && s && Rn(t, "delete", n, void 0), r;
  }
  has(t, n) {
    const s = Reflect.has(t, n);
    return (!Jn(n) || !Ac.has(n)) && Rt(t, "has", n), s;
  }
  ownKeys(t) {
    return Rt(
      t,
      "iterate",
      ve(t) ? "length" : ys
    ), Reflect.ownKeys(t);
  }
}
class Sf extends Sc {
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
const Ef = /* @__PURE__ */ new Ec(), Cf = /* @__PURE__ */ new Sf(), Rf = /* @__PURE__ */ new Ec(!0);
const Po = (e) => e, Xr = (e) => Reflect.getPrototypeOf(e);
function If(e, t, n) {
  return function(...s) {
    const r = this.__v_raw, i = Ve(r), o = Fs(i), a = e === "entries" || e === Symbol.iterator && o, l = e === "keys" && o, p = r[e](...s), c = n ? Po : t ? yi : Tt;
    return !t && Rt(
      i,
      "iterate",
      l ? No : ys
    ), {
      // iterator protocol
      next() {
        const { value: b, done: w } = p.next();
        return w ? { value: b, done: w } : {
          value: a ? [c(b[0]), c(b[1])] : c(b),
          done: w
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function Zr(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function Lf(e, t) {
  const n = {
    get(r) {
      const i = this.__v_raw, o = Ve(i), a = Ve(r);
      e || (Kn(r, a) && Rt(o, "get", r), Rt(o, "get", a));
      const { has: l } = Xr(o), p = t ? Po : e ? yi : Tt;
      if (l.call(o, r))
        return p(i.get(r));
      if (l.call(o, a))
        return p(i.get(a));
      i !== o && i.get(r);
    },
    get size() {
      const r = this.__v_raw;
      return !e && Rt(Ve(r), "iterate", ys), Reflect.get(r, "size", r);
    },
    has(r) {
      const i = this.__v_raw, o = Ve(i), a = Ve(r);
      return e || (Kn(r, a) && Rt(o, "has", r), Rt(o, "has", a)), r === a ? i.has(r) : i.has(r) || i.has(a);
    },
    forEach(r, i) {
      const o = this, a = o.__v_raw, l = Ve(a), p = t ? Po : e ? yi : Tt;
      return !e && Rt(l, "iterate", ys), a.forEach((c, b) => r.call(i, p(c), p(b), o));
    }
  };
  return Lt(
    n,
    e ? {
      add: Zr("add"),
      set: Zr("set"),
      delete: Zr("delete"),
      clear: Zr("clear")
    } : {
      add(r) {
        !t && !rn(r) && !Xn(r) && (r = Ve(r));
        const i = Ve(this);
        return Xr(i).has.call(i, r) || (i.add(r), Rn(i, "add", r, r)), this;
      },
      set(r, i) {
        !t && !rn(i) && !Xn(i) && (i = Ve(i));
        const o = Ve(this), { has: a, get: l } = Xr(o);
        let p = a.call(o, r);
        p || (r = Ve(r), p = a.call(o, r));
        const c = l.call(o, r);
        return o.set(r, i), p ? Kn(i, c) && Rn(o, "set", r, i) : Rn(o, "add", r, i), this;
      },
      delete(r) {
        const i = Ve(this), { has: o, get: a } = Xr(i);
        let l = o.call(i, r);
        l || (r = Ve(r), l = o.call(i, r)), a && a.call(i, r);
        const p = i.delete(r);
        return l && Rn(i, "delete", r, void 0), p;
      },
      clear() {
        const r = Ve(this), i = r.size !== 0, o = r.clear();
        return i && Rn(
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
    n[r] = If(r, e, t);
  }), n;
}
function ia(e, t) {
  const n = Lf(e, t);
  return (s, r, i) => r === "__v_isReactive" ? !e : r === "__v_isReadonly" ? e : r === "__v_raw" ? s : Reflect.get(
    Ke(n, r) && r in s ? n : s,
    r,
    i
  );
}
const Of = {
  get: /* @__PURE__ */ ia(!1, !1)
}, Nf = {
  get: /* @__PURE__ */ ia(!1, !0)
}, Pf = {
  get: /* @__PURE__ */ ia(!0, !1)
};
const Cc = /* @__PURE__ */ new WeakMap(), Rc = /* @__PURE__ */ new WeakMap(), Ic = /* @__PURE__ */ new WeakMap(), Mf = /* @__PURE__ */ new WeakMap();
function Df(e) {
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
function Ff(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : Df(cf(e));
}
function Di(e) {
  return Xn(e) ? e : oa(
    e,
    !1,
    Ef,
    Of,
    Cc
  );
}
function $f(e) {
  return oa(
    e,
    !1,
    Rf,
    Nf,
    Rc
  );
}
function Lc(e) {
  return oa(
    e,
    !0,
    Cf,
    Pf,
    Ic
  );
}
function oa(e, t, n, s, r) {
  if (!ot(e) || e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const i = Ff(e);
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
function $s(e) {
  return Xn(e) ? $s(e.__v_raw) : !!(e && e.__v_isReactive);
}
function Xn(e) {
  return !!(e && e.__v_isReadonly);
}
function rn(e) {
  return !!(e && e.__v_isShallow);
}
function aa(e) {
  return e ? !!e.__v_raw : !1;
}
function Ve(e) {
  const t = e && e.__v_raw;
  return t ? Ve(t) : e;
}
function Bf(e) {
  return !Ke(e, "__v_skip") && Object.isExtensible(e) && Ro(e, "__v_skip", !0), e;
}
const Tt = (e) => ot(e) ? Di(e) : e, yi = (e) => ot(e) ? Lc(e) : e;
function It(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function le(e) {
  return Uf(e, !1);
}
function Uf(e, t) {
  return It(e) ? e : new zf(e, t);
}
class zf {
  constructor(t, n) {
    this.dep = new ra(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? t : Ve(t), this._value = n ? t : Tt(t), this.__v_isShallow = n;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const n = this._rawValue, s = this.__v_isShallow || rn(t) || Xn(t);
    t = s ? t : Ve(t), Kn(t, n) && (this._rawValue = t, this._value = s ? t : Tt(t), this.dep.trigger());
  }
}
function E(e) {
  return It(e) ? e.value : e;
}
const Hf = {
  get: (e, t, n) => t === "__v_raw" ? e : E(Reflect.get(e, t, n)),
  set: (e, t, n, s) => {
    const r = e[t];
    return It(r) && !It(n) ? (r.value = n, !0) : Reflect.set(e, t, n, s);
  }
};
function Oc(e) {
  return $s(e) ? e : new Proxy(e, Hf);
}
class Wf {
  constructor(t, n, s) {
    this.fn = t, this.setter = n, this._value = void 0, this.dep = new ra(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Ir - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = s;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    nt !== this)
      return vc(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return kc(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
function qf(e, t, n = !1) {
  let s, r;
  return Te(e) ? s = e : (s = e.get, r = e.set), new Wf(s, r, n);
}
const Jr = {}, vi = /* @__PURE__ */ new WeakMap();
let gs;
function jf(e, t = !1, n = gs) {
  if (n) {
    let s = vi.get(n);
    s || vi.set(n, s = []), s.push(e);
  }
}
function Vf(e, t, n = et) {
  const { immediate: s, deep: r, once: i, scheduler: o, augmentJob: a, call: l } = n, p = (I) => r ? I : rn(I) || r === !1 || r === 0 ? In(I, 1) : In(I);
  let c, b, w, H, L = !1, K = !1;
  if (It(e) ? (b = () => e.value, L = rn(e)) : $s(e) ? (b = () => p(e), L = !0) : ve(e) ? (K = !0, L = e.some((I) => $s(I) || rn(I)), b = () => e.map((I) => {
    if (It(I))
      return I.value;
    if ($s(I))
      return p(I);
    if (Te(I))
      return l ? l(I, 2) : I();
  })) : Te(e) ? t ? b = l ? () => l(e, 2) : e : b = () => {
    if (w) {
      Nn();
      try {
        w();
      } finally {
        Pn();
      }
    }
    const I = gs;
    gs = c;
    try {
      return l ? l(e, 3, [H]) : e(H);
    } finally {
      gs = I;
    }
  } : b = vn, t && r) {
    const I = b, P = r === !0 ? 1 / 0 : r;
    b = () => In(I(), P);
  }
  const F = vf(), re = () => {
    c.stop(), F && F.active && Qo(F.effects, c);
  };
  if (i && t) {
    const I = t;
    t = (...P) => {
      I(...P), re();
    };
  }
  let ce = K ? new Array(e.length).fill(Jr) : Jr;
  const pe = (I) => {
    if (!(!(c.flags & 1) || !c.dirty && !I))
      if (t) {
        const P = c.run();
        if (r || L || (K ? P.some((Y, J) => Kn(Y, ce[J])) : Kn(P, ce))) {
          w && w();
          const Y = gs;
          gs = c;
          try {
            const J = [
              P,
              // pass undefined as the old value when it's changed for the first time
              ce === Jr ? void 0 : K && ce[0] === Jr ? [] : ce,
              H
            ];
            ce = P, l ? l(t, 3, J) : (
              // @ts-expect-error
              t(...J)
            );
          } finally {
            gs = Y;
          }
        }
      } else
        c.run();
  };
  return a && a(pe), c = new _c(b), c.scheduler = o ? () => o(pe, !1) : pe, H = (I) => jf(I, !1, c), w = c.onStop = () => {
    const I = vi.get(c);
    if (I) {
      if (l)
        l(I, 4);
      else
        for (const P of I) P();
      vi.delete(c);
    }
  }, t ? s ? pe(!0) : ce = c.run() : o ? o(pe.bind(null, !0), !0) : c.run(), re.pause = c.pause.bind(c), re.resume = c.resume.bind(c), re.stop = re, re;
}
function In(e, t = 1 / 0, n) {
  if (t <= 0 || !ot(e) || e.__v_skip || (n = n || /* @__PURE__ */ new Set(), n.has(e)))
    return e;
  if (n.add(e), t--, It(e))
    In(e.value, t, n);
  else if (ve(e))
    for (let s = 0; s < e.length; s++)
      In(e[s], t, n);
  else if (cc(e) || Fs(e))
    e.forEach((s) => {
      In(s, t, n);
    });
  else if (hc(e)) {
    for (const s in e)
      In(e[s], t, n);
    for (const s of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, s) && In(e[s], t, n);
  }
  return e;
}
/**
* @vue/runtime-core v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function Mr(e, t, n, s) {
  try {
    return s ? e(...s) : e();
  } catch (r) {
    Fi(r, t, n);
  }
}
function kn(e, t, n, s) {
  if (Te(e)) {
    const r = Mr(e, t, n, s);
    return r && uc(r) && r.catch((i) => {
      Fi(i, t, n);
    }), r;
  }
  if (ve(e)) {
    const r = [];
    for (let i = 0; i < e.length; i++)
      r.push(kn(e[i], t, n, s));
    return r;
  }
}
function Fi(e, t, n, s = !0) {
  const r = t ? t.vnode : null, { errorHandler: i, throwUnhandledErrorInProduction: o } = t && t.appContext.config || et;
  if (t) {
    let a = t.parent;
    const l = t.proxy, p = `https://vuejs.org/error-reference/#runtime-${n}`;
    for (; a; ) {
      const c = a.ec;
      if (c) {
        for (let b = 0; b < c.length; b++)
          if (c[b](e, l, p) === !1)
            return;
      }
      a = a.parent;
    }
    if (i) {
      Nn(), Mr(i, null, 10, [
        e,
        l,
        p
      ]), Pn();
      return;
    }
  }
  Kf(e, n, r, s, o);
}
function Kf(e, t, n, s = !0, r = !1) {
  if (r)
    throw e;
  console.error(e);
}
const Pt = [];
let _n = -1;
const Bs = [];
let qn = null, Ns = 0;
const Nc = /* @__PURE__ */ Promise.resolve();
let bi = null;
function vs(e) {
  const t = bi || Nc;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function Gf(e) {
  let t = _n + 1, n = Pt.length;
  for (; t < n; ) {
    const s = t + n >>> 1, r = Pt[s], i = Or(r);
    i < e || i === e && r.flags & 2 ? t = s + 1 : n = s;
  }
  return t;
}
function la(e) {
  if (!(e.flags & 1)) {
    const t = Or(e), n = Pt[Pt.length - 1];
    !n || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= Or(n) ? Pt.push(e) : Pt.splice(Gf(t), 0, e), e.flags |= 1, Pc();
  }
}
function Pc() {
  bi || (bi = Nc.then(Dc));
}
function Yf(e) {
  ve(e) ? Bs.push(...e) : qn && e.id === -1 ? qn.splice(Ns + 1, 0, e) : e.flags & 1 || (Bs.push(e), e.flags |= 1), Pc();
}
function el(e, t, n = _n + 1) {
  for (; n < Pt.length; n++) {
    const s = Pt[n];
    if (s && s.flags & 2) {
      if (e && s.id !== e.uid)
        continue;
      Pt.splice(n, 1), n--, s.flags & 4 && (s.flags &= -2), s(), s.flags & 4 || (s.flags &= -2);
    }
  }
}
function Mc(e) {
  if (Bs.length) {
    const t = [...new Set(Bs)].sort(
      (n, s) => Or(n) - Or(s)
    );
    if (Bs.length = 0, qn) {
      qn.push(...t);
      return;
    }
    for (qn = t, Ns = 0; Ns < qn.length; Ns++) {
      const n = qn[Ns];
      n.flags & 4 && (n.flags &= -2), n.flags & 8 || n(), n.flags &= -2;
    }
    qn = null, Ns = 0;
  }
}
const Or = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function Dc(e) {
  try {
    for (_n = 0; _n < Pt.length; _n++) {
      const t = Pt[_n];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), Mr(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; _n < Pt.length; _n++) {
      const t = Pt[_n];
      t && (t.flags &= -2);
    }
    _n = -1, Pt.length = 0, Mc(), bi = null, (Pt.length || Bs.length) && Dc();
  }
}
let sn = null, Fc = null;
function wi(e) {
  const t = sn;
  return sn = e, Fc = e && e.type.__scopeId || null, t;
}
function Xf(e, t = sn, n) {
  if (!t || e._n)
    return e;
  const s = (...r) => {
    s._d && cl(-1);
    const i = wi(t);
    let o;
    try {
      o = e(...r);
    } finally {
      wi(i), s._d && cl(1);
    }
    return o;
  };
  return s._n = !0, s._c = !0, s._d = !0, s;
}
function Hn(e, t) {
  if (sn === null)
    return e;
  const n = Hi(sn), s = e.dirs || (e.dirs = []);
  for (let r = 0; r < t.length; r++) {
    let [i, o, a, l = et] = t[r];
    i && (Te(i) && (i = {
      mounted: i,
      updated: i
    }), i.deep && In(o), s.push({
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
function us(e, t, n, s) {
  const r = e.dirs, i = t && t.dirs;
  for (let o = 0; o < r.length; o++) {
    const a = r[o];
    i && (a.oldValue = i[o].value);
    let l = a.dir[s];
    l && (Nn(), kn(l, n, 8, [
      e.el,
      a,
      e,
      t
    ]), Pn());
  }
}
const Zf = Symbol("_vte"), Jf = (e) => e.__isTeleport;
function ca(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, ca(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function ua(e, t) {
  return Te(e) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    Lt({ name: e.name }, t, { setup: e })
  ) : e;
}
function $c(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
function Ar(e, t, n, s, r = !1) {
  if (ve(e)) {
    e.forEach(
      (L, K) => Ar(
        L,
        t && (ve(t) ? t[K] : t),
        n,
        s,
        r
      )
    );
    return;
  }
  if (Sr(s) && !r) {
    s.shapeFlag & 512 && s.type.__asyncResolved && s.component.subTree.component && Ar(e, t, n, s.component.subTree);
    return;
  }
  const i = s.shapeFlag & 4 ? Hi(s.component) : s.el, o = r ? null : i, { i: a, r: l } = e, p = t && t.r, c = a.refs === et ? a.refs = {} : a.refs, b = a.setupState, w = Ve(b), H = b === et ? () => !1 : (L) => Ke(w, L);
  if (p != null && p !== l && (dt(p) ? (c[p] = null, H(p) && (b[p] = null)) : It(p) && (p.value = null)), Te(l))
    Mr(l, a, 12, [o, c]);
  else {
    const L = dt(l), K = It(l);
    if (L || K) {
      const F = () => {
        if (e.f) {
          const re = L ? H(l) ? b[l] : c[l] : l.value;
          r ? ve(re) && Qo(re, i) : ve(re) ? re.includes(i) || re.push(i) : L ? (c[l] = [i], H(l) && (b[l] = c[l])) : (l.value = [i], e.k && (c[e.k] = l.value));
        } else L ? (c[l] = o, H(l) && (b[l] = o)) : K && (l.value = o, e.k && (c[e.k] = o));
      };
      o ? (F.id = -1, Wt(F, n)) : F();
    }
  }
}
Pi().requestIdleCallback;
Pi().cancelIdleCallback;
const Sr = (e) => !!e.type.__asyncLoader, Bc = (e) => e.type.__isKeepAlive;
function Qf(e, t) {
  Uc(e, "a", t);
}
function eh(e, t) {
  Uc(e, "da", t);
}
function Uc(e, t, n = Mt) {
  const s = e.__wdc || (e.__wdc = () => {
    let r = n;
    for (; r; ) {
      if (r.isDeactivated)
        return;
      r = r.parent;
    }
    return e();
  });
  if ($i(t, s, n), n) {
    let r = n.parent;
    for (; r && r.parent; )
      Bc(r.parent.vnode) && th(s, t, n, r), r = r.parent;
  }
}
function th(e, t, n, s) {
  const r = $i(
    t,
    e,
    s,
    !0
    /* prepend */
  );
  Dr(() => {
    Qo(s[t], r);
  }, n);
}
function $i(e, t, n = Mt, s = !1) {
  if (n) {
    const r = n[e] || (n[e] = []), i = t.__weh || (t.__weh = (...o) => {
      Nn();
      const a = Fr(n), l = kn(t, n, e, o);
      return a(), Pn(), l;
    });
    return s ? r.unshift(i) : r.push(i), i;
  }
}
const Mn = (e) => (t, n = Mt) => {
  (!Pr || e === "sp") && $i(e, (...s) => t(...s), n);
}, nh = Mn("bm"), Bi = Mn("m"), sh = Mn(
  "bu"
), rh = Mn("u"), zc = Mn(
  "bum"
), Dr = Mn("um"), ih = Mn(
  "sp"
), oh = Mn("rtg"), ah = Mn("rtc");
function lh(e, t = Mt) {
  $i("ec", e, t);
}
const ch = Symbol.for("v-ndc");
function kt(e, t, n, s) {
  let r;
  const i = n, o = ve(e);
  if (o || dt(e)) {
    const a = o && $s(e);
    let l = !1, p = !1;
    a && (l = !rn(e), p = Xn(e), e = Mi(e)), r = new Array(e.length);
    for (let c = 0, b = e.length; c < b; c++)
      r[c] = t(
        l ? p ? yi(Tt(e[c])) : Tt(e[c]) : e[c],
        c,
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
      for (let l = 0, p = a.length; l < p; l++) {
        const c = a[l];
        r[l] = t(e[c], c, l, i);
      }
    }
  else
    r = [];
  return r;
}
const Mo = (e) => e ? lu(e) ? Hi(e) : Mo(e.parent) : null, Er = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ Lt(/* @__PURE__ */ Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => e.props,
    $attrs: (e) => e.attrs,
    $slots: (e) => e.slots,
    $refs: (e) => e.refs,
    $parent: (e) => Mo(e.parent),
    $root: (e) => Mo(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => Wc(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      la(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = vs.bind(e.proxy)),
    $watch: (e) => Lh.bind(e)
  })
), lo = (e, t) => e !== et && !e.__isScriptSetup && Ke(e, t), uh = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: n, setupState: s, data: r, props: i, accessCache: o, type: a, appContext: l } = e;
    let p;
    if (t[0] !== "$") {
      const H = o[t];
      if (H !== void 0)
        switch (H) {
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
        if (lo(s, t))
          return o[t] = 1, s[t];
        if (r !== et && Ke(r, t))
          return o[t] = 2, r[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (p = e.propsOptions[0]) && Ke(p, t)
        )
          return o[t] = 3, i[t];
        if (n !== et && Ke(n, t))
          return o[t] = 4, n[t];
        Do && (o[t] = 0);
      }
    }
    const c = Er[t];
    let b, w;
    if (c)
      return t === "$attrs" && Rt(e.attrs, "get", ""), c(e);
    if (
      // css module (injected by vue-loader)
      (b = a.__cssModules) && (b = b[t])
    )
      return b;
    if (n !== et && Ke(n, t))
      return o[t] = 4, n[t];
    if (
      // global properties
      w = l.config.globalProperties, Ke(w, t)
    )
      return w[t];
  },
  set({ _: e }, t, n) {
    const { data: s, setupState: r, ctx: i } = e;
    return lo(r, t) ? (r[t] = n, !0) : s !== et && Ke(s, t) ? (s[t] = n, !0) : Ke(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (i[t] = n, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: n, ctx: s, appContext: r, propsOptions: i }
  }, o) {
    let a;
    return !!n[o] || e !== et && Ke(e, o) || lo(t, o) || (a = i[0]) && Ke(a, o) || Ke(s, o) || Ke(Er, o) || Ke(r.config.globalProperties, o);
  },
  defineProperty(e, t, n) {
    return n.get != null ? e._.accessCache[t] = 0 : Ke(n, "value") && this.set(e, t, n.value, null), Reflect.defineProperty(e, t, n);
  }
};
function tl(e) {
  return ve(e) ? e.reduce(
    (t, n) => (t[n] = null, t),
    {}
  ) : e;
}
let Do = !0;
function fh(e) {
  const t = Wc(e), n = e.proxy, s = e.ctx;
  Do = !1, t.beforeCreate && nl(t.beforeCreate, e, "bc");
  const {
    // state
    data: r,
    computed: i,
    methods: o,
    watch: a,
    provide: l,
    inject: p,
    // lifecycle
    created: c,
    beforeMount: b,
    mounted: w,
    beforeUpdate: H,
    updated: L,
    activated: K,
    deactivated: F,
    beforeDestroy: re,
    beforeUnmount: ce,
    destroyed: pe,
    unmounted: I,
    render: P,
    renderTracked: Y,
    renderTriggered: J,
    errorCaptured: _e,
    serverPrefetch: Ce,
    // public API
    expose: be,
    inheritAttrs: Be,
    // assets
    components: we,
    directives: Xe,
    filters: qe
  } = t;
  if (p && hh(p, s, null), o)
    for (const ke in o) {
      const ge = o[ke];
      Te(ge) && (s[ke] = ge.bind(n));
    }
  if (r) {
    const ke = r.call(n, n);
    ot(ke) && (e.data = Di(ke));
  }
  if (Do = !0, i)
    for (const ke in i) {
      const ge = i[ke], Ze = Te(ge) ? ge.bind(n, n) : Te(ge.get) ? ge.get.bind(n, n) : vn, xe = !Te(ge) && Te(ge.set) ? ge.set.bind(n) : vn, st = de({
        get: Ze,
        set: xe
      });
      Object.defineProperty(s, ke, {
        enumerable: !0,
        configurable: !0,
        get: () => st.value,
        set: (Re) => st.value = Re
      });
    }
  if (a)
    for (const ke in a)
      Hc(a[ke], s, n, ke);
  if (l) {
    const ke = Te(l) ? l.call(n) : l;
    Reflect.ownKeys(ke).forEach((ge) => {
      yh(ge, ke[ge]);
    });
  }
  c && nl(c, e, "c");
  function fe(ke, ge) {
    ve(ge) ? ge.forEach((Ze) => ke(Ze.bind(n))) : ge && ke(ge.bind(n));
  }
  if (fe(nh, b), fe(Bi, w), fe(sh, H), fe(rh, L), fe(Qf, K), fe(eh, F), fe(lh, _e), fe(ah, Y), fe(oh, J), fe(zc, ce), fe(Dr, I), fe(ih, Ce), ve(be))
    if (be.length) {
      const ke = e.exposed || (e.exposed = {});
      be.forEach((ge) => {
        Object.defineProperty(ke, ge, {
          get: () => n[ge],
          set: (Ze) => n[ge] = Ze,
          enumerable: !0
        });
      });
    } else e.exposed || (e.exposed = {});
  P && e.render === vn && (e.render = P), Be != null && (e.inheritAttrs = Be), we && (e.components = we), Xe && (e.directives = Xe), Ce && $c(e);
}
function hh(e, t, n = vn) {
  ve(e) && (e = Fo(e));
  for (const s in e) {
    const r = e[s];
    let i;
    ot(r) ? "default" in r ? i = ri(
      r.from || s,
      r.default,
      !0
    ) : i = ri(r.from || s) : i = ri(r), It(i) ? Object.defineProperty(t, s, {
      enumerable: !0,
      configurable: !0,
      get: () => i.value,
      set: (o) => i.value = o
    }) : t[s] = i;
  }
}
function nl(e, t, n) {
  kn(
    ve(e) ? e.map((s) => s.bind(t.proxy)) : e.bind(t.proxy),
    t,
    n
  );
}
function Hc(e, t, n, s) {
  let r = s.includes(".") ? nu(n, s) : () => n[s];
  if (dt(e)) {
    const i = t[e];
    Te(i) && Nt(r, i);
  } else if (Te(e))
    Nt(r, e.bind(n));
  else if (ot(e))
    if (ve(e))
      e.forEach((i) => Hc(i, t, n, s));
    else {
      const i = Te(e.handler) ? e.handler.bind(n) : t[e.handler];
      Te(i) && Nt(r, i, e);
    }
}
function Wc(e) {
  const t = e.type, { mixins: n, extends: s } = t, {
    mixins: r,
    optionsCache: i,
    config: { optionMergeStrategies: o }
  } = e.appContext, a = i.get(t);
  let l;
  return a ? l = a : !r.length && !n && !s ? l = t : (l = {}, r.length && r.forEach(
    (p) => ki(l, p, o, !0)
  ), ki(l, t, o)), ot(t) && i.set(t, l), l;
}
function ki(e, t, n, s = !1) {
  const { mixins: r, extends: i } = t;
  i && ki(e, i, n, !0), r && r.forEach(
    (o) => ki(e, o, n, !0)
  );
  for (const o in t)
    if (!(s && o === "expose")) {
      const a = dh[o] || n && n[o];
      e[o] = a ? a(e[o], t[o]) : t[o];
    }
  return e;
}
const dh = {
  data: sl,
  props: rl,
  emits: rl,
  // objects
  methods: yr,
  computed: yr,
  // lifecycle
  beforeCreate: Ot,
  created: Ot,
  beforeMount: Ot,
  mounted: Ot,
  beforeUpdate: Ot,
  updated: Ot,
  beforeDestroy: Ot,
  beforeUnmount: Ot,
  destroyed: Ot,
  unmounted: Ot,
  activated: Ot,
  deactivated: Ot,
  errorCaptured: Ot,
  serverPrefetch: Ot,
  // assets
  components: yr,
  directives: yr,
  // watch
  watch: gh,
  // provide / inject
  provide: sl,
  inject: ph
};
function sl(e, t) {
  return t ? e ? function() {
    return Lt(
      Te(e) ? e.call(this, this) : e,
      Te(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function ph(e, t) {
  return yr(Fo(e), Fo(t));
}
function Fo(e) {
  if (ve(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++)
      t[e[n]] = e[n];
    return t;
  }
  return e;
}
function Ot(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function yr(e, t) {
  return e ? Lt(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function rl(e, t) {
  return e ? ve(e) && ve(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : Lt(
    /* @__PURE__ */ Object.create(null),
    tl(e),
    tl(t ?? {})
  ) : t;
}
function gh(e, t) {
  if (!e) return t;
  if (!t) return e;
  const n = Lt(/* @__PURE__ */ Object.create(null), e);
  for (const s in t)
    n[s] = Ot(e[s], t[s]);
  return n;
}
function qc() {
  return {
    app: null,
    config: {
      isNativeTag: af,
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
let mh = 0;
function _h(e, t) {
  return function(s, r = null) {
    Te(s) || (s = Lt({}, s)), r != null && !ot(r) && (r = null);
    const i = qc(), o = /* @__PURE__ */ new WeakSet(), a = [];
    let l = !1;
    const p = i.app = {
      _uid: mh++,
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
        return o.has(c) || (c && Te(c.install) ? (o.add(c), c.install(p, ...b)) : Te(c) && (o.add(c), c(p, ...b))), p;
      },
      mixin(c) {
        return i.mixins.includes(c) || i.mixins.push(c), p;
      },
      component(c, b) {
        return b ? (i.components[c] = b, p) : i.components[c];
      },
      directive(c, b) {
        return b ? (i.directives[c] = b, p) : i.directives[c];
      },
      mount(c, b, w) {
        if (!l) {
          const H = p._ceVNode || bn(s, r);
          return H.appContext = i, w === !0 ? w = "svg" : w === !1 && (w = void 0), e(H, c, w), l = !0, p._container = c, c.__vue_app__ = p, Hi(H.component);
        }
      },
      onUnmount(c) {
        a.push(c);
      },
      unmount() {
        l && (kn(
          a,
          p._instance,
          16
        ), e(null, p._container), delete p._container.__vue_app__);
      },
      provide(c, b) {
        return i.provides[c] = b, p;
      },
      runWithContext(c) {
        const b = Us;
        Us = p;
        try {
          return c();
        } finally {
          Us = b;
        }
      }
    };
    return p;
  };
}
let Us = null;
function yh(e, t) {
  if (Mt) {
    let n = Mt.provides;
    const s = Mt.parent && Mt.parent.provides;
    s === n && (n = Mt.provides = Object.create(s)), n[e] = t;
  }
}
function ri(e, t, n = !1) {
  const s = Vh();
  if (s || Us) {
    let r = Us ? Us._context.provides : s ? s.parent == null || s.ce ? s.vnode.appContext && s.vnode.appContext.provides : s.parent.provides : void 0;
    if (r && e in r)
      return r[e];
    if (arguments.length > 1)
      return n && Te(t) ? t.call(s && s.proxy) : t;
  }
}
const jc = {}, Vc = () => Object.create(jc), Kc = (e) => Object.getPrototypeOf(e) === jc;
function vh(e, t, n, s = !1) {
  const r = {}, i = Vc();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), Gc(e, t, r, i);
  for (const o in e.propsOptions[0])
    o in r || (r[o] = void 0);
  n ? e.props = s ? r : $f(r) : e.type.props ? e.props = r : e.props = i, e.attrs = i;
}
function bh(e, t, n, s) {
  const {
    props: r,
    attrs: i,
    vnode: { patchFlag: o }
  } = e, a = Ve(r), [l] = e.propsOptions;
  let p = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (s || o > 0) && !(o & 16)
  ) {
    if (o & 8) {
      const c = e.vnode.dynamicProps;
      for (let b = 0; b < c.length; b++) {
        let w = c[b];
        if (Ui(e.emitsOptions, w))
          continue;
        const H = t[w];
        if (l)
          if (Ke(i, w))
            H !== i[w] && (i[w] = H, p = !0);
          else {
            const L = Yn(w);
            r[L] = $o(
              l,
              a,
              L,
              H,
              e,
              !1
            );
          }
        else
          H !== i[w] && (i[w] = H, p = !0);
      }
    }
  } else {
    Gc(e, t, r, i) && (p = !0);
    let c;
    for (const b in a)
      (!t || // for camelCase
      !Ke(t, b) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((c = Qn(b)) === b || !Ke(t, c))) && (l ? n && // for camelCase
      (n[b] !== void 0 || // for kebab-case
      n[c] !== void 0) && (r[b] = $o(
        l,
        a,
        b,
        void 0,
        e,
        !0
      )) : delete r[b]);
    if (i !== a)
      for (const b in i)
        (!t || !Ke(t, b)) && (delete i[b], p = !0);
  }
  p && Rn(e.attrs, "set", "");
}
function Gc(e, t, n, s) {
  const [r, i] = e.propsOptions;
  let o = !1, a;
  if (t)
    for (let l in t) {
      if (kr(l))
        continue;
      const p = t[l];
      let c;
      r && Ke(r, c = Yn(l)) ? !i || !i.includes(c) ? n[c] = p : (a || (a = {}))[c] = p : Ui(e.emitsOptions, l) || (!(l in s) || p !== s[l]) && (s[l] = p, o = !0);
    }
  if (i) {
    const l = Ve(n), p = a || et;
    for (let c = 0; c < i.length; c++) {
      const b = i[c];
      n[b] = $o(
        r,
        l,
        b,
        p[b],
        e,
        !Ke(p, b)
      );
    }
  }
  return o;
}
function $o(e, t, n, s, r, i) {
  const o = e[n];
  if (o != null) {
    const a = Ke(o, "default");
    if (a && s === void 0) {
      const l = o.default;
      if (o.type !== Function && !o.skipFactory && Te(l)) {
        const { propsDefaults: p } = r;
        if (n in p)
          s = p[n];
        else {
          const c = Fr(r);
          s = p[n] = l.call(
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
    ] && (s === "" || s === Qn(n)) && (s = !0));
  }
  return s;
}
const wh = /* @__PURE__ */ new WeakMap();
function Yc(e, t, n = !1) {
  const s = n ? wh : t.propsCache, r = s.get(e);
  if (r)
    return r;
  const i = e.props, o = {}, a = [];
  let l = !1;
  if (!Te(e)) {
    const c = (b) => {
      l = !0;
      const [w, H] = Yc(b, t, !0);
      Lt(o, w), H && a.push(...H);
    };
    !n && t.mixins.length && t.mixins.forEach(c), e.extends && c(e.extends), e.mixins && e.mixins.forEach(c);
  }
  if (!i && !l)
    return ot(e) && s.set(e, Ds), Ds;
  if (ve(i))
    for (let c = 0; c < i.length; c++) {
      const b = Yn(i[c]);
      il(b) && (o[b] = et);
    }
  else if (i)
    for (const c in i) {
      const b = Yn(c);
      if (il(b)) {
        const w = i[c], H = o[b] = ve(w) || Te(w) ? { type: w } : Lt({}, w), L = H.type;
        let K = !1, F = !0;
        if (ve(L))
          for (let re = 0; re < L.length; ++re) {
            const ce = L[re], pe = Te(ce) && ce.name;
            if (pe === "Boolean") {
              K = !0;
              break;
            } else pe === "String" && (F = !1);
          }
        else
          K = Te(L) && L.name === "Boolean";
        H[
          0
          /* shouldCast */
        ] = K, H[
          1
          /* shouldCastTrue */
        ] = F, (K || Ke(H, "default")) && a.push(b);
      }
    }
  const p = [o, a];
  return ot(e) && s.set(e, p), p;
}
function il(e) {
  return e[0] !== "$" && !kr(e);
}
const fa = (e) => e === "_" || e === "__" || e === "_ctx" || e === "$stable", ha = (e) => ve(e) ? e.map(yn) : [yn(e)], kh = (e, t, n) => {
  if (t._n)
    return t;
  const s = Xf((...r) => ha(t(...r)), n);
  return s._c = !1, s;
}, Xc = (e, t, n) => {
  const s = e._ctx;
  for (const r in e) {
    if (fa(r)) continue;
    const i = e[r];
    if (Te(i))
      t[r] = kh(r, i, s);
    else if (i != null) {
      const o = ha(i);
      t[r] = () => o;
    }
  }
}, Zc = (e, t) => {
  const n = ha(t);
  e.slots.default = () => n;
}, Jc = (e, t, n) => {
  for (const s in t)
    (n || !fa(s)) && (e[s] = t[s]);
}, Th = (e, t, n) => {
  const s = e.slots = Vc();
  if (e.vnode.shapeFlag & 32) {
    const r = t.__;
    r && Ro(s, "__", r, !0);
    const i = t._;
    i ? (Jc(s, t, n), n && Ro(s, "_", i, !0)) : Xc(t, s);
  } else t && Zc(e, t);
}, xh = (e, t, n) => {
  const { vnode: s, slots: r } = e;
  let i = !0, o = et;
  if (s.shapeFlag & 32) {
    const a = t._;
    a ? n && a === 1 ? i = !1 : Jc(r, t, n) : (i = !t.$stable, Xc(t, r)), o = t;
  } else t && (Zc(e, t), o = { default: 1 });
  if (i)
    for (const a in r)
      !fa(a) && o[a] == null && delete r[a];
}, Wt = $h;
function Ah(e) {
  return Sh(e);
}
function Sh(e, t) {
  const n = Pi();
  n.__VUE__ = !0;
  const {
    insert: s,
    remove: r,
    patchProp: i,
    createElement: o,
    createText: a,
    createComment: l,
    setText: p,
    setElementText: c,
    parentNode: b,
    nextSibling: w,
    setScopeId: H = vn,
    insertStaticContent: L
  } = e, K = (m, y, S, M = null, B = null, O = null, G = void 0, W = null, j = !!y.dynamicChildren) => {
    if (m === y)
      return;
    m && !cr(m, y) && (M = xt(m), Re(m, B, O, !0), m = null), y.patchFlag === -2 && (j = !1, y.dynamicChildren = null);
    const { type: k, ref: R, shapeFlag: $ } = y;
    switch (k) {
      case zi:
        F(m, y, S, M);
        break;
      case Zn:
        re(m, y, S, M);
        break;
      case ii:
        m == null && ce(y, S, M, G);
        break;
      case He:
        we(
          m,
          y,
          S,
          M,
          B,
          O,
          G,
          W,
          j
        );
        break;
      default:
        $ & 1 ? P(
          m,
          y,
          S,
          M,
          B,
          O,
          G,
          W,
          j
        ) : $ & 6 ? Xe(
          m,
          y,
          S,
          M,
          B,
          O,
          G,
          W,
          j
        ) : ($ & 64 || $ & 128) && k.process(
          m,
          y,
          S,
          M,
          B,
          O,
          G,
          W,
          j,
          Ft
        );
    }
    R != null && B ? Ar(R, m && m.ref, O, y || m, !y) : R == null && m && m.ref != null && Ar(m.ref, null, O, m, !0);
  }, F = (m, y, S, M) => {
    if (m == null)
      s(
        y.el = a(y.children),
        S,
        M
      );
    else {
      const B = y.el = m.el;
      y.children !== m.children && p(B, y.children);
    }
  }, re = (m, y, S, M) => {
    m == null ? s(
      y.el = l(y.children || ""),
      S,
      M
    ) : y.el = m.el;
  }, ce = (m, y, S, M) => {
    [m.el, m.anchor] = L(
      m.children,
      y,
      S,
      M,
      m.el,
      m.anchor
    );
  }, pe = ({ el: m, anchor: y }, S, M) => {
    let B;
    for (; m && m !== y; )
      B = w(m), s(m, S, M), m = B;
    s(y, S, M);
  }, I = ({ el: m, anchor: y }) => {
    let S;
    for (; m && m !== y; )
      S = w(m), r(m), m = S;
    r(y);
  }, P = (m, y, S, M, B, O, G, W, j) => {
    y.type === "svg" ? G = "svg" : y.type === "math" && (G = "mathml"), m == null ? Y(
      y,
      S,
      M,
      B,
      O,
      G,
      W,
      j
    ) : Ce(
      m,
      y,
      B,
      O,
      G,
      W,
      j
    );
  }, Y = (m, y, S, M, B, O, G, W) => {
    let j, k;
    const { props: R, shapeFlag: $, transition: V, dirs: X } = m;
    if (j = m.el = o(
      m.type,
      O,
      R && R.is,
      R
    ), $ & 8 ? c(j, m.children) : $ & 16 && _e(
      m.children,
      j,
      null,
      M,
      B,
      co(m, O),
      G,
      W
    ), X && us(m, null, M, "created"), J(j, m, m.scopeId, G, M), R) {
      for (const ue in R)
        ue !== "value" && !kr(ue) && i(j, ue, null, R[ue], O, M);
      "value" in R && i(j, "value", null, R.value, O), (k = R.onVnodeBeforeMount) && pn(k, M, m);
    }
    X && us(m, null, M, "beforeMount");
    const he = Eh(B, V);
    he && V.beforeEnter(j), s(j, y, S), ((k = R && R.onVnodeMounted) || he || X) && Wt(() => {
      k && pn(k, M, m), he && V.enter(j), X && us(m, null, M, "mounted");
    }, B);
  }, J = (m, y, S, M, B) => {
    if (S && H(m, S), M)
      for (let O = 0; O < M.length; O++)
        H(m, M[O]);
    if (B) {
      let O = B.subTree;
      if (y === O || ru(O.type) && (O.ssContent === y || O.ssFallback === y)) {
        const G = B.vnode;
        J(
          m,
          G,
          G.scopeId,
          G.slotScopeIds,
          B.parent
        );
      }
    }
  }, _e = (m, y, S, M, B, O, G, W, j = 0) => {
    for (let k = j; k < m.length; k++) {
      const R = m[k] = W ? jn(m[k]) : yn(m[k]);
      K(
        null,
        R,
        y,
        S,
        M,
        B,
        O,
        G,
        W
      );
    }
  }, Ce = (m, y, S, M, B, O, G) => {
    const W = y.el = m.el;
    let { patchFlag: j, dynamicChildren: k, dirs: R } = y;
    j |= m.patchFlag & 16;
    const $ = m.props || et, V = y.props || et;
    let X;
    if (S && fs(S, !1), (X = V.onVnodeBeforeUpdate) && pn(X, S, y, m), R && us(y, m, S, "beforeUpdate"), S && fs(S, !0), ($.innerHTML && V.innerHTML == null || $.textContent && V.textContent == null) && c(W, ""), k ? be(
      m.dynamicChildren,
      k,
      W,
      S,
      M,
      co(y, B),
      O
    ) : G || ge(
      m,
      y,
      W,
      null,
      S,
      M,
      co(y, B),
      O,
      !1
    ), j > 0) {
      if (j & 16)
        Be(W, $, V, S, B);
      else if (j & 2 && $.class !== V.class && i(W, "class", null, V.class, B), j & 4 && i(W, "style", $.style, V.style, B), j & 8) {
        const he = y.dynamicProps;
        for (let ue = 0; ue < he.length; ue++) {
          const oe = he[ue], Me = $[oe], Le = V[oe];
          (Le !== Me || oe === "value") && i(W, oe, Me, Le, B, S);
        }
      }
      j & 1 && m.children !== y.children && c(W, y.children);
    } else !G && k == null && Be(W, $, V, S, B);
    ((X = V.onVnodeUpdated) || R) && Wt(() => {
      X && pn(X, S, y, m), R && us(y, m, S, "updated");
    }, M);
  }, be = (m, y, S, M, B, O, G) => {
    for (let W = 0; W < y.length; W++) {
      const j = m[W], k = y[W], R = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        j.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (j.type === He || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !cr(j, k) || // - In the case of a component, it could contain anything.
        j.shapeFlag & 198) ? b(j.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          S
        )
      );
      K(
        j,
        k,
        R,
        null,
        M,
        B,
        O,
        G,
        !0
      );
    }
  }, Be = (m, y, S, M, B) => {
    if (y !== S) {
      if (y !== et)
        for (const O in y)
          !kr(O) && !(O in S) && i(
            m,
            O,
            y[O],
            null,
            B,
            M
          );
      for (const O in S) {
        if (kr(O)) continue;
        const G = S[O], W = y[O];
        G !== W && O !== "value" && i(m, O, W, G, B, M);
      }
      "value" in S && i(m, "value", y.value, S.value, B);
    }
  }, we = (m, y, S, M, B, O, G, W, j) => {
    const k = y.el = m ? m.el : a(""), R = y.anchor = m ? m.anchor : a("");
    let { patchFlag: $, dynamicChildren: V, slotScopeIds: X } = y;
    X && (W = W ? W.concat(X) : X), m == null ? (s(k, S, M), s(R, S, M), _e(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      y.children || [],
      S,
      R,
      B,
      O,
      G,
      W,
      j
    )) : $ > 0 && $ & 64 && V && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    m.dynamicChildren ? (be(
      m.dynamicChildren,
      V,
      S,
      B,
      O,
      G,
      W
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (y.key != null || B && y === B.subTree) && Qc(
      m,
      y,
      !0
      /* shallow */
    )) : ge(
      m,
      y,
      S,
      R,
      B,
      O,
      G,
      W,
      j
    );
  }, Xe = (m, y, S, M, B, O, G, W, j) => {
    y.slotScopeIds = W, m == null ? y.shapeFlag & 512 ? B.ctx.activate(
      y,
      S,
      M,
      G,
      j
    ) : qe(
      y,
      S,
      M,
      B,
      O,
      G,
      j
    ) : rt(m, y, j);
  }, qe = (m, y, S, M, B, O, G) => {
    const W = m.component = jh(
      m,
      M,
      B
    );
    if (Bc(m) && (W.ctx.renderer = Ft), Kh(W, !1, G), W.asyncDep) {
      if (B && B.registerDep(W, fe, G), !m.el) {
        const j = W.subTree = bn(Zn);
        re(null, j, y, S), m.placeholder = j.el;
      }
    } else
      fe(
        W,
        m,
        y,
        S,
        B,
        O,
        G
      );
  }, rt = (m, y, S) => {
    const M = y.component = m.component;
    if (Dh(m, y, S))
      if (M.asyncDep && !M.asyncResolved) {
        ke(M, y, S);
        return;
      } else
        M.next = y, M.update();
    else
      y.el = m.el, M.vnode = y;
  }, fe = (m, y, S, M, B, O, G) => {
    const W = () => {
      if (m.isMounted) {
        let { next: $, bu: V, u: X, parent: he, vnode: ue } = m;
        {
          const f = eu(m);
          if (f) {
            $ && ($.el = ue.el, ke(m, $, G)), f.asyncDep.then(() => {
              m.isUnmounted || W();
            });
            return;
          }
        }
        let oe = $, Me;
        fs(m, !1), $ ? ($.el = ue.el, ke(m, $, G)) : $ = ue, V && si(V), (Me = $.props && $.props.onVnodeBeforeUpdate) && pn(Me, he, $, ue), fs(m, !0);
        const Le = al(m), at = m.subTree;
        m.subTree = Le, K(
          at,
          Le,
          // parent may have changed if it's in a teleport
          b(at.el),
          // anchor may have changed if it's in a fragment
          xt(at),
          m,
          B,
          O
        ), $.el = Le.el, oe === null && Fh(m, Le.el), X && Wt(X, B), (Me = $.props && $.props.onVnodeUpdated) && Wt(
          () => pn(Me, he, $, ue),
          B
        );
      } else {
        let $;
        const { el: V, props: X } = y, { bm: he, m: ue, parent: oe, root: Me, type: Le } = m, at = Sr(y);
        fs(m, !1), he && si(he), !at && ($ = X && X.onVnodeBeforeMount) && pn($, oe, y), fs(m, !0);
        {
          Me.ce && // @ts-expect-error _def is private
          Me.ce._def.shadowRoot !== !1 && Me.ce._injectChildStyle(Le);
          const f = m.subTree = al(m);
          K(
            null,
            f,
            S,
            M,
            m,
            B,
            O
          ), y.el = f.el;
        }
        if (ue && Wt(ue, B), !at && ($ = X && X.onVnodeMounted)) {
          const f = y;
          Wt(
            () => pn($, oe, f),
            B
          );
        }
        (y.shapeFlag & 256 || oe && Sr(oe.vnode) && oe.vnode.shapeFlag & 256) && m.a && Wt(m.a, B), m.isMounted = !0, y = S = M = null;
      }
    };
    m.scope.on();
    const j = m.effect = new _c(W);
    m.scope.off();
    const k = m.update = j.run.bind(j), R = m.job = j.runIfDirty.bind(j);
    R.i = m, R.id = m.uid, j.scheduler = () => la(R), fs(m, !0), k();
  }, ke = (m, y, S) => {
    y.component = m;
    const M = m.vnode.props;
    m.vnode = y, m.next = null, bh(m, y.props, M, S), xh(m, y.children, S), Nn(), el(m), Pn();
  }, ge = (m, y, S, M, B, O, G, W, j = !1) => {
    const k = m && m.children, R = m ? m.shapeFlag : 0, $ = y.children, { patchFlag: V, shapeFlag: X } = y;
    if (V > 0) {
      if (V & 128) {
        xe(
          k,
          $,
          S,
          M,
          B,
          O,
          G,
          W,
          j
        );
        return;
      } else if (V & 256) {
        Ze(
          k,
          $,
          S,
          M,
          B,
          O,
          G,
          W,
          j
        );
        return;
      }
    }
    X & 8 ? (R & 16 && gt(k, B, O), $ !== k && c(S, $)) : R & 16 ? X & 16 ? xe(
      k,
      $,
      S,
      M,
      B,
      O,
      G,
      W,
      j
    ) : gt(k, B, O, !0) : (R & 8 && c(S, ""), X & 16 && _e(
      $,
      S,
      M,
      B,
      O,
      G,
      W,
      j
    ));
  }, Ze = (m, y, S, M, B, O, G, W, j) => {
    m = m || Ds, y = y || Ds;
    const k = m.length, R = y.length, $ = Math.min(k, R);
    let V;
    for (V = 0; V < $; V++) {
      const X = y[V] = j ? jn(y[V]) : yn(y[V]);
      K(
        m[V],
        X,
        S,
        null,
        B,
        O,
        G,
        W,
        j
      );
    }
    k > R ? gt(
      m,
      B,
      O,
      !0,
      !1,
      $
    ) : _e(
      y,
      S,
      M,
      B,
      O,
      G,
      W,
      j,
      $
    );
  }, xe = (m, y, S, M, B, O, G, W, j) => {
    let k = 0;
    const R = y.length;
    let $ = m.length - 1, V = R - 1;
    for (; k <= $ && k <= V; ) {
      const X = m[k], he = y[k] = j ? jn(y[k]) : yn(y[k]);
      if (cr(X, he))
        K(
          X,
          he,
          S,
          null,
          B,
          O,
          G,
          W,
          j
        );
      else
        break;
      k++;
    }
    for (; k <= $ && k <= V; ) {
      const X = m[$], he = y[V] = j ? jn(y[V]) : yn(y[V]);
      if (cr(X, he))
        K(
          X,
          he,
          S,
          null,
          B,
          O,
          G,
          W,
          j
        );
      else
        break;
      $--, V--;
    }
    if (k > $) {
      if (k <= V) {
        const X = V + 1, he = X < R ? y[X].el : M;
        for (; k <= V; )
          K(
            null,
            y[k] = j ? jn(y[k]) : yn(y[k]),
            S,
            he,
            B,
            O,
            G,
            W,
            j
          ), k++;
      }
    } else if (k > V)
      for (; k <= $; )
        Re(m[k], B, O, !0), k++;
    else {
      const X = k, he = k, ue = /* @__PURE__ */ new Map();
      for (k = he; k <= V; k++) {
        const C = y[k] = j ? jn(y[k]) : yn(y[k]);
        C.key != null && ue.set(C.key, k);
      }
      let oe, Me = 0;
      const Le = V - he + 1;
      let at = !1, f = 0;
      const _ = new Array(Le);
      for (k = 0; k < Le; k++) _[k] = 0;
      for (k = X; k <= $; k++) {
        const C = m[k];
        if (Me >= Le) {
          Re(C, B, O, !0);
          continue;
        }
        let U;
        if (C.key != null)
          U = ue.get(C.key);
        else
          for (oe = he; oe <= V; oe++)
            if (_[oe - he] === 0 && cr(C, y[oe])) {
              U = oe;
              break;
            }
        U === void 0 ? Re(C, B, O, !0) : (_[U - he] = k + 1, U >= f ? f = U : at = !0, K(
          C,
          y[U],
          S,
          null,
          B,
          O,
          G,
          W,
          j
        ), Me++);
      }
      const N = at ? Ch(_) : Ds;
      for (oe = N.length - 1, k = Le - 1; k >= 0; k--) {
        const C = he + k, U = y[C], te = y[C + 1], se = C + 1 < R ? (
          // #13559, fallback to el placeholder for unresolved async component
          te.el || te.placeholder
        ) : M;
        _[k] === 0 ? K(
          null,
          U,
          S,
          se,
          B,
          O,
          G,
          W,
          j
        ) : at && (oe < 0 || k !== N[oe] ? st(U, S, se, 2) : oe--);
      }
    }
  }, st = (m, y, S, M, B = null) => {
    const { el: O, type: G, transition: W, children: j, shapeFlag: k } = m;
    if (k & 6) {
      st(m.component.subTree, y, S, M);
      return;
    }
    if (k & 128) {
      m.suspense.move(y, S, M);
      return;
    }
    if (k & 64) {
      G.move(m, y, S, Ft);
      return;
    }
    if (G === He) {
      s(O, y, S);
      for (let $ = 0; $ < j.length; $++)
        st(j[$], y, S, M);
      s(m.anchor, y, S);
      return;
    }
    if (G === ii) {
      pe(m, y, S);
      return;
    }
    if (M !== 2 && k & 1 && W)
      if (M === 0)
        W.beforeEnter(O), s(O, y, S), Wt(() => W.enter(O), B);
      else {
        const { leave: $, delayLeave: V, afterLeave: X } = W, he = () => {
          m.ctx.isUnmounted ? r(O) : s(O, y, S);
        }, ue = () => {
          $(O, () => {
            he(), X && X();
          });
        };
        V ? V(O, he, ue) : ue();
      }
    else
      s(O, y, S);
  }, Re = (m, y, S, M = !1, B = !1) => {
    const {
      type: O,
      props: G,
      ref: W,
      children: j,
      dynamicChildren: k,
      shapeFlag: R,
      patchFlag: $,
      dirs: V,
      cacheIndex: X
    } = m;
    if ($ === -2 && (B = !1), W != null && (Nn(), Ar(W, null, S, m, !0), Pn()), X != null && (y.renderCache[X] = void 0), R & 256) {
      y.ctx.deactivate(m);
      return;
    }
    const he = R & 1 && V, ue = !Sr(m);
    let oe;
    if (ue && (oe = G && G.onVnodeBeforeUnmount) && pn(oe, y, m), R & 6)
      Se(m.component, S, M);
    else {
      if (R & 128) {
        m.suspense.unmount(S, M);
        return;
      }
      he && us(m, null, y, "beforeUnmount"), R & 64 ? m.type.remove(
        m,
        y,
        S,
        Ft,
        M
      ) : k && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !k.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (O !== He || $ > 0 && $ & 64) ? gt(
        k,
        y,
        S,
        !1,
        !0
      ) : (O === He && $ & 384 || !B && R & 16) && gt(j, y, S), M && ft(m);
    }
    (ue && (oe = G && G.onVnodeUnmounted) || he) && Wt(() => {
      oe && pn(oe, y, m), he && us(m, null, y, "unmounted");
    }, S);
  }, ft = (m) => {
    const { type: y, el: S, anchor: M, transition: B } = m;
    if (y === He) {
      Ut(S, M);
      return;
    }
    if (y === ii) {
      I(m);
      return;
    }
    const O = () => {
      r(S), B && !B.persisted && B.afterLeave && B.afterLeave();
    };
    if (m.shapeFlag & 1 && B && !B.persisted) {
      const { leave: G, delayLeave: W } = B, j = () => G(S, O);
      W ? W(m.el, O, j) : j();
    } else
      O();
  }, Ut = (m, y) => {
    let S;
    for (; m !== y; )
      S = w(m), r(m), m = S;
    r(y);
  }, Se = (m, y, S) => {
    const {
      bum: M,
      scope: B,
      job: O,
      subTree: G,
      um: W,
      m: j,
      a: k,
      parent: R,
      slots: { __: $ }
    } = m;
    ol(j), ol(k), M && si(M), R && ve($) && $.forEach((V) => {
      R.renderCache[V] = void 0;
    }), B.stop(), O && (O.flags |= 8, Re(G, m, y, S)), W && Wt(W, y), Wt(() => {
      m.isUnmounted = !0;
    }, y), y && y.pendingBranch && !y.isUnmounted && m.asyncDep && !m.asyncResolved && m.suspenseId === y.pendingId && (y.deps--, y.deps === 0 && y.resolve());
  }, gt = (m, y, S, M = !1, B = !1, O = 0) => {
    for (let G = O; G < m.length; G++)
      Re(m[G], y, S, M, B);
  }, xt = (m) => {
    if (m.shapeFlag & 6)
      return xt(m.component.subTree);
    if (m.shapeFlag & 128)
      return m.suspense.next();
    const y = w(m.anchor || m.el), S = y && y[Zf];
    return S ? w(S) : y;
  };
  let At = !1;
  const St = (m, y, S) => {
    m == null ? y._vnode && Re(y._vnode, null, null, !0) : K(
      y._vnode || null,
      m,
      y,
      null,
      null,
      null,
      S
    ), y._vnode = m, At || (At = !0, el(), Mc(), At = !1);
  }, Ft = {
    p: K,
    um: Re,
    m: st,
    r: ft,
    mt: qe,
    mc: _e,
    pc: ge,
    pbc: be,
    n: xt,
    o: e
  };
  return {
    render: St,
    hydrate: void 0,
    createApp: _h(St)
  };
}
function co({ type: e, props: t }, n) {
  return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function fs({ effect: e, job: t }, n) {
  n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function Eh(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function Qc(e, t, n = !1) {
  const s = e.children, r = t.children;
  if (ve(s) && ve(r))
    for (let i = 0; i < s.length; i++) {
      const o = s[i];
      let a = r[i];
      a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = r[i] = jn(r[i]), a.el = o.el), !n && a.patchFlag !== -2 && Qc(o, a)), a.type === zi && (a.el = o.el), a.type === Zn && !a.el && (a.el = o.el);
    }
}
function Ch(e) {
  const t = e.slice(), n = [0];
  let s, r, i, o, a;
  const l = e.length;
  for (s = 0; s < l; s++) {
    const p = e[s];
    if (p !== 0) {
      if (r = n[n.length - 1], e[r] < p) {
        t[s] = r, n.push(s);
        continue;
      }
      for (i = 0, o = n.length - 1; i < o; )
        a = i + o >> 1, e[n[a]] < p ? i = a + 1 : o = a;
      p < e[n[i]] && (i > 0 && (t[s] = n[i - 1]), n[i] = s);
    }
  }
  for (i = n.length, o = n[i - 1]; i-- > 0; )
    n[i] = o, o = t[o];
  return n;
}
function eu(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : eu(t);
}
function ol(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
const Rh = Symbol.for("v-scx"), Ih = () => ri(Rh);
function Nt(e, t, n) {
  return tu(e, t, n);
}
function tu(e, t, n = et) {
  const { immediate: s, deep: r, flush: i, once: o } = n, a = Lt({}, n), l = t && s || !t && i !== "post";
  let p;
  if (Pr) {
    if (i === "sync") {
      const H = Ih();
      p = H.__watcherHandles || (H.__watcherHandles = []);
    } else if (!l) {
      const H = () => {
      };
      return H.stop = vn, H.resume = vn, H.pause = vn, H;
    }
  }
  const c = Mt;
  a.call = (H, L, K) => kn(H, c, L, K);
  let b = !1;
  i === "post" ? a.scheduler = (H) => {
    Wt(H, c && c.suspense);
  } : i !== "sync" && (b = !0, a.scheduler = (H, L) => {
    L ? H() : la(H);
  }), a.augmentJob = (H) => {
    t && (H.flags |= 4), b && (H.flags |= 2, c && (H.id = c.uid, H.i = c));
  };
  const w = Vf(e, t, a);
  return Pr && (p ? p.push(w) : l && w()), w;
}
function Lh(e, t, n) {
  const s = this.proxy, r = dt(e) ? e.includes(".") ? nu(s, e) : () => s[e] : e.bind(s, s);
  let i;
  Te(t) ? i = t : (i = t.handler, n = t);
  const o = Fr(this), a = tu(r, i.bind(s), n);
  return o(), a;
}
function nu(e, t) {
  const n = t.split(".");
  return () => {
    let s = e;
    for (let r = 0; r < n.length && s; r++)
      s = s[n[r]];
    return s;
  };
}
const Oh = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${Yn(t)}Modifiers`] || e[`${Qn(t)}Modifiers`];
function Nh(e, t, ...n) {
  if (e.isUnmounted) return;
  const s = e.vnode.props || et;
  let r = n;
  const i = t.startsWith("update:"), o = i && Oh(s, t.slice(7));
  o && (o.trim && (r = n.map((c) => dt(c) ? c.trim() : c)), o.number && (r = n.map(Io)));
  let a, l = s[a = so(t)] || // also try camelCase event handler (#2249)
  s[a = so(Yn(t))];
  !l && i && (l = s[a = so(Qn(t))]), l && kn(
    l,
    e,
    6,
    r
  );
  const p = s[a + "Once"];
  if (p) {
    if (!e.emitted)
      e.emitted = {};
    else if (e.emitted[a])
      return;
    e.emitted[a] = !0, kn(
      p,
      e,
      6,
      r
    );
  }
}
function su(e, t, n = !1) {
  const s = t.emitsCache, r = s.get(e);
  if (r !== void 0)
    return r;
  const i = e.emits;
  let o = {}, a = !1;
  if (!Te(e)) {
    const l = (p) => {
      const c = su(p, t, !0);
      c && (a = !0, Lt(o, c));
    };
    !n && t.mixins.length && t.mixins.forEach(l), e.extends && l(e.extends), e.mixins && e.mixins.forEach(l);
  }
  return !i && !a ? (ot(e) && s.set(e, null), null) : (ve(i) ? i.forEach((l) => o[l] = null) : Lt(o, i), ot(e) && s.set(e, o), o);
}
function Ui(e, t) {
  return !e || !Li(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), Ke(e, t[0].toLowerCase() + t.slice(1)) || Ke(e, Qn(t)) || Ke(e, t));
}
function al(e) {
  const {
    type: t,
    vnode: n,
    proxy: s,
    withProxy: r,
    propsOptions: [i],
    slots: o,
    attrs: a,
    emit: l,
    render: p,
    renderCache: c,
    props: b,
    data: w,
    setupState: H,
    ctx: L,
    inheritAttrs: K
  } = e, F = wi(e);
  let re, ce;
  try {
    if (n.shapeFlag & 4) {
      const I = r || s, P = I;
      re = yn(
        p.call(
          P,
          I,
          c,
          b,
          H,
          w,
          L
        )
      ), ce = a;
    } else {
      const I = t;
      re = yn(
        I.length > 1 ? I(
          b,
          { attrs: a, slots: o, emit: l }
        ) : I(
          b,
          null
        )
      ), ce = t.props ? a : Ph(a);
    }
  } catch (I) {
    Cr.length = 0, Fi(I, e, 1), re = bn(Zn);
  }
  let pe = re;
  if (ce && K !== !1) {
    const I = Object.keys(ce), { shapeFlag: P } = pe;
    I.length && P & 7 && (i && I.some(Jo) && (ce = Mh(
      ce,
      i
    )), pe = qs(pe, ce, !1, !0));
  }
  return n.dirs && (pe = qs(pe, null, !1, !0), pe.dirs = pe.dirs ? pe.dirs.concat(n.dirs) : n.dirs), n.transition && ca(pe, n.transition), re = pe, wi(F), re;
}
const Ph = (e) => {
  let t;
  for (const n in e)
    (n === "class" || n === "style" || Li(n)) && ((t || (t = {}))[n] = e[n]);
  return t;
}, Mh = (e, t) => {
  const n = {};
  for (const s in e)
    (!Jo(s) || !(s.slice(9) in t)) && (n[s] = e[s]);
  return n;
};
function Dh(e, t, n) {
  const { props: s, children: r, component: i } = e, { props: o, children: a, patchFlag: l } = t, p = i.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (n && l >= 0) {
    if (l & 1024)
      return !0;
    if (l & 16)
      return s ? ll(s, o, p) : !!o;
    if (l & 8) {
      const c = t.dynamicProps;
      for (let b = 0; b < c.length; b++) {
        const w = c[b];
        if (o[w] !== s[w] && !Ui(p, w))
          return !0;
      }
    }
  } else
    return (r || a) && (!a || !a.$stable) ? !0 : s === o ? !1 : s ? o ? ll(s, o, p) : !0 : !!o;
  return !1;
}
function ll(e, t, n) {
  const s = Object.keys(t);
  if (s.length !== Object.keys(e).length)
    return !0;
  for (let r = 0; r < s.length; r++) {
    const i = s[r];
    if (t[i] !== e[i] && !Ui(n, i))
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
const ru = (e) => e.__isSuspense;
function $h(e, t) {
  t && t.pendingBranch ? ve(e) ? t.effects.push(...e) : t.effects.push(e) : Yf(e);
}
const He = Symbol.for("v-fgt"), zi = Symbol.for("v-txt"), Zn = Symbol.for("v-cmt"), ii = Symbol.for("v-stc"), Cr = [];
let jt = null;
function x(e = !1) {
  Cr.push(jt = e ? null : []);
}
function Bh() {
  Cr.pop(), jt = Cr[Cr.length - 1] || null;
}
let Nr = 1;
function cl(e, t = !1) {
  Nr += e, e < 0 && jt && t && (jt.hasOnce = !0);
}
function iu(e) {
  return e.dynamicChildren = Nr > 0 ? jt || Ds : null, Bh(), Nr > 0 && jt && jt.push(e), e;
}
function A(e, t, n, s, r, i) {
  return iu(
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
function Ti(e, t, n, s, r) {
  return iu(
    bn(
      e,
      t,
      n,
      s,
      r,
      !0
    )
  );
}
function ou(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function cr(e, t) {
  return e.type === t.type && e.key === t.key;
}
const au = ({ key: e }) => e ?? null, oi = ({
  ref: e,
  ref_key: t,
  ref_for: n
}) => (typeof e == "number" && (e = "" + e), e != null ? dt(e) || It(e) || Te(e) ? { i: sn, r: e, k: t, f: !!n } : e : null);
function v(e, t = null, n = null, s = 0, r = null, i = e === He ? 0 : 1, o = !1, a = !1) {
  const l = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && au(t),
    ref: t && oi(t),
    scopeId: Fc,
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
    ctx: sn
  };
  return a ? (da(l, n), i & 128 && e.normalize(l)) : n && (l.shapeFlag |= dt(n) ? 8 : 16), Nr > 0 && // avoid a block node from tracking itself
  !o && // has current parent block
  jt && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (l.patchFlag > 0 || i & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  l.patchFlag !== 32 && jt.push(l), l;
}
const bn = Uh;
function Uh(e, t = null, n = null, s = 0, r = null, i = !1) {
  if ((!e || e === ch) && (e = Zn), ou(e)) {
    const a = qs(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return n && da(a, n), Nr > 0 && !i && jt && (a.shapeFlag & 6 ? jt[jt.indexOf(e)] = a : jt.push(a)), a.patchFlag = -2, a;
  }
  if (Zh(e) && (e = e.__vccOpts), t) {
    t = zh(t);
    let { class: a, style: l } = t;
    a && !dt(a) && (t.class = ze(a)), ot(l) && (aa(l) && !ve(l) && (l = Lt({}, l)), t.style = Ee(l));
  }
  const o = dt(e) ? 1 : ru(e) ? 128 : Jf(e) ? 64 : ot(e) ? 4 : Te(e) ? 2 : 0;
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
function zh(e) {
  return e ? aa(e) || Kc(e) ? Lt({}, e) : e : null;
}
function qs(e, t, n = !1, s = !1) {
  const { props: r, ref: i, patchFlag: o, children: a, transition: l } = e, p = t ? Hh(r || {}, t) : r, c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: p,
    key: p && au(p),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && i ? ve(i) ? i.concat(oi(t)) : [i, oi(t)] : oi(t)
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
    patchFlag: t && e.type !== He ? o === -1 ? 16 : o | 16 : o,
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
    ssContent: e.ssContent && qs(e.ssContent),
    ssFallback: e.ssFallback && qs(e.ssFallback),
    placeholder: e.placeholder,
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce
  };
  return l && s && ca(
    c,
    l.clone(c)
  ), c;
}
function En(e = " ", t = 0) {
  return bn(zi, null, e, t);
}
function hs(e, t) {
  const n = bn(ii, null, e);
  return n.staticCount = t, n;
}
function ie(e = "", t = !1) {
  return t ? (x(), Ti(Zn, null, e)) : bn(Zn, null, e);
}
function yn(e) {
  return e == null || typeof e == "boolean" ? bn(Zn) : ve(e) ? bn(
    He,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : ou(e) ? jn(e) : bn(zi, null, String(e));
}
function jn(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : qs(e);
}
function da(e, t) {
  let n = 0;
  const { shapeFlag: s } = e;
  if (t == null)
    t = null;
  else if (ve(t))
    n = 16;
  else if (typeof t == "object")
    if (s & 65) {
      const r = t.default;
      r && (r._c && (r._d = !1), da(e, r()), r._c && (r._d = !0));
      return;
    } else {
      n = 32;
      const r = t._;
      !r && !Kc(t) ? t._ctx = sn : r === 3 && sn && (sn.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else Te(t) ? (t = { default: t, _ctx: sn }, n = 32) : (t = String(t), s & 64 ? (n = 16, t = [En(t)]) : n = 8);
  e.children = t, e.shapeFlag |= n;
}
function Hh(...e) {
  const t = {};
  for (let n = 0; n < e.length; n++) {
    const s = e[n];
    for (const r in s)
      if (r === "class")
        t.class !== s.class && (t.class = ze([t.class, s.class]));
      else if (r === "style")
        t.style = Ee([t.style, s.style]);
      else if (Li(r)) {
        const i = t[r], o = s[r];
        o && i !== o && !(ve(i) && i.includes(o)) && (t[r] = i ? [].concat(i, o) : o);
      } else r !== "" && (t[r] = s[r]);
  }
  return t;
}
function pn(e, t, n, s = null) {
  kn(e, t, 7, [
    n,
    s
  ]);
}
const Wh = qc();
let qh = 0;
function jh(e, t, n) {
  const s = e.type, r = (t ? t.appContext : e.appContext) || Wh, i = {
    uid: qh++,
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
    scope: new yf(
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
    propsOptions: Yc(s, r),
    emitsOptions: su(s, r),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: et,
    // inheritAttrs
    inheritAttrs: s.inheritAttrs,
    // state
    ctx: et,
    data: et,
    props: et,
    attrs: et,
    slots: et,
    refs: et,
    setupState: et,
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
let Mt = null;
const Vh = () => Mt || sn;
let xi, Bo;
{
  const e = Pi(), t = (n, s) => {
    let r;
    return (r = e[n]) || (r = e[n] = []), r.push(s), (i) => {
      r.length > 1 ? r.forEach((o) => o(i)) : r[0](i);
    };
  };
  xi = t(
    "__VUE_INSTANCE_SETTERS__",
    (n) => Mt = n
  ), Bo = t(
    "__VUE_SSR_SETTERS__",
    (n) => Pr = n
  );
}
const Fr = (e) => {
  const t = Mt;
  return xi(e), e.scope.on(), () => {
    e.scope.off(), xi(t);
  };
}, ul = () => {
  Mt && Mt.scope.off(), xi(null);
};
function lu(e) {
  return e.vnode.shapeFlag & 4;
}
let Pr = !1;
function Kh(e, t = !1, n = !1) {
  t && Bo(t);
  const { props: s, children: r } = e.vnode, i = lu(e);
  vh(e, s, i, t), Th(e, r, n || t);
  const o = i ? Gh(e, t) : void 0;
  return t && Bo(!1), o;
}
function Gh(e, t) {
  const n = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, uh);
  const { setup: s } = n;
  if (s) {
    Nn();
    const r = e.setupContext = s.length > 1 ? Xh(e) : null, i = Fr(e), o = Mr(
      s,
      e,
      0,
      [
        e.props,
        r
      ]
    ), a = uc(o);
    if (Pn(), i(), (a || e.sp) && !Sr(e) && $c(e), a) {
      if (o.then(ul, ul), t)
        return o.then((l) => {
          fl(e, l);
        }).catch((l) => {
          Fi(l, e, 0);
        });
      e.asyncDep = o;
    } else
      fl(e, o);
  } else
    cu(e);
}
function fl(e, t, n) {
  Te(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : ot(t) && (e.setupState = Oc(t)), cu(e);
}
function cu(e, t, n) {
  const s = e.type;
  e.render || (e.render = s.render || vn);
  {
    const r = Fr(e);
    Nn();
    try {
      fh(e);
    } finally {
      Pn(), r();
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
function Hi(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(Oc(Bf(e.exposed)), {
    get(t, n) {
      if (n in t)
        return t[n];
      if (n in Er)
        return Er[n](e);
    },
    has(t, n) {
      return n in t || n in Er;
    }
  })) : e.proxy;
}
function Zh(e) {
  return Te(e) && "__vccOpts" in e;
}
const de = (e, t) => qf(e, t, Pr), Jh = "3.5.18";
/**
* @vue/runtime-dom v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let Uo;
const hl = typeof window < "u" && window.trustedTypes;
if (hl)
  try {
    Uo = /* @__PURE__ */ hl.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const uu = Uo ? (e) => Uo.createHTML(e) : (e) => e, Qh = "http://www.w3.org/2000/svg", ed = "http://www.w3.org/1998/Math/MathML", Cn = typeof document < "u" ? document : null, dl = Cn && /* @__PURE__ */ Cn.createElement("template"), td = {
  insert: (e, t, n) => {
    t.insertBefore(e, n || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, n, s) => {
    const r = t === "svg" ? Cn.createElementNS(Qh, e) : t === "mathml" ? Cn.createElementNS(ed, e) : n ? Cn.createElement(e, { is: n }) : Cn.createElement(e);
    return e === "select" && s && s.multiple != null && r.setAttribute("multiple", s.multiple), r;
  },
  createText: (e) => Cn.createTextNode(e),
  createComment: (e) => Cn.createComment(e),
  setText: (e, t) => {
    e.nodeValue = t;
  },
  setElementText: (e, t) => {
    e.textContent = t;
  },
  parentNode: (e) => e.parentNode,
  nextSibling: (e) => e.nextSibling,
  querySelector: (e) => Cn.querySelector(e),
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
      dl.innerHTML = uu(
        s === "svg" ? `<svg>${e}</svg>` : s === "mathml" ? `<math>${e}</math>` : e
      );
      const a = dl.content;
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
}, nd = Symbol("_vtc");
function sd(e, t, n) {
  const s = e[nd];
  s && (t = (t ? [t, ...s] : [...s]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
const Ai = Symbol("_vod"), fu = Symbol("_vsh"), rd = {
  beforeMount(e, { value: t }, { transition: n }) {
    e[Ai] = e.style.display === "none" ? "" : e.style.display, n && t ? n.beforeEnter(e) : ur(e, t);
  },
  mounted(e, { value: t }, { transition: n }) {
    n && t && n.enter(e);
  },
  updated(e, { value: t, oldValue: n }, { transition: s }) {
    !t != !n && (s ? t ? (s.beforeEnter(e), ur(e, !0), s.enter(e)) : s.leave(e, () => {
      ur(e, !1);
    }) : ur(e, t));
  },
  beforeUnmount(e, { value: t }) {
    ur(e, t);
  }
};
function ur(e, t) {
  e.style.display = t ? e[Ai] : "none", e[fu] = !t;
}
const id = Symbol(""), od = /(^|;)\s*display\s*:/;
function ad(e, t, n) {
  const s = e.style, r = dt(n);
  let i = !1;
  if (n && !r) {
    if (t)
      if (dt(t))
        for (const o of t.split(";")) {
          const a = o.slice(0, o.indexOf(":")).trim();
          n[a] == null && ai(s, a, "");
        }
      else
        for (const o in t)
          n[o] == null && ai(s, o, "");
    for (const o in n)
      o === "display" && (i = !0), ai(s, o, n[o]);
  } else if (r) {
    if (t !== n) {
      const o = s[id];
      o && (n += ";" + o), s.cssText = n, i = od.test(n);
    }
  } else t && e.removeAttribute("style");
  Ai in e && (e[Ai] = i ? s.display : "", e[fu] && (s.display = "none"));
}
const pl = /\s*!important$/;
function ai(e, t, n) {
  if (ve(n))
    n.forEach((s) => ai(e, t, s));
  else if (n == null && (n = ""), t.startsWith("--"))
    e.setProperty(t, n);
  else {
    const s = ld(e, t);
    pl.test(n) ? e.setProperty(
      Qn(s),
      n.replace(pl, ""),
      "important"
    ) : e[s] = n;
  }
}
const gl = ["Webkit", "Moz", "ms"], uo = {};
function ld(e, t) {
  const n = uo[t];
  if (n)
    return n;
  let s = Yn(t);
  if (s !== "filter" && s in e)
    return uo[t] = s;
  s = dc(s);
  for (let r = 0; r < gl.length; r++) {
    const i = gl[r] + s;
    if (i in e)
      return uo[t] = i;
  }
  return t;
}
const ml = "http://www.w3.org/1999/xlink";
function _l(e, t, n, s, r, i = _f(t)) {
  s && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(ml, t.slice(6, t.length)) : e.setAttributeNS(ml, t, n) : n == null || i && !pc(n) ? e.removeAttribute(t) : e.setAttribute(
    t,
    i ? "" : Jn(n) ? String(n) : n
  );
}
function yl(e, t, n, s, r) {
  if (t === "innerHTML" || t === "textContent") {
    n != null && (e[t] = t === "innerHTML" ? uu(n) : n);
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
    a === "boolean" ? n = pc(n) : n == null && a === "string" ? (n = "", o = !0) : a === "number" && (n = 0, o = !0);
  }
  try {
    e[t] = n;
  } catch {
  }
  o && e.removeAttribute(r || t);
}
function Ps(e, t, n, s) {
  e.addEventListener(t, n, s);
}
function cd(e, t, n, s) {
  e.removeEventListener(t, n, s);
}
const vl = Symbol("_vei");
function ud(e, t, n, s, r = null) {
  const i = e[vl] || (e[vl] = {}), o = i[t];
  if (s && o)
    o.value = s;
  else {
    const [a, l] = fd(t);
    if (s) {
      const p = i[t] = pd(
        s,
        r
      );
      Ps(e, a, p, l);
    } else o && (cd(e, a, o, l), i[t] = void 0);
  }
}
const bl = /(?:Once|Passive|Capture)$/;
function fd(e) {
  let t;
  if (bl.test(e)) {
    t = {};
    let s;
    for (; s = e.match(bl); )
      e = e.slice(0, e.length - s[0].length), t[s[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : Qn(e.slice(2)), t];
}
let fo = 0;
const hd = /* @__PURE__ */ Promise.resolve(), dd = () => fo || (hd.then(() => fo = 0), fo = Date.now());
function pd(e, t) {
  const n = (s) => {
    if (!s._vts)
      s._vts = Date.now();
    else if (s._vts <= n.attached)
      return;
    kn(
      gd(s, n.value),
      t,
      5,
      [s]
    );
  };
  return n.value = e, n.attached = dd(), n;
}
function gd(e, t) {
  if (ve(t)) {
    const n = e.stopImmediatePropagation;
    return e.stopImmediatePropagation = () => {
      n.call(e), e._stopped = !0;
    }, t.map(
      (s) => (r) => !r._stopped && s && s(r)
    );
  } else
    return t;
}
const wl = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, md = (e, t, n, s, r, i) => {
  const o = r === "svg";
  t === "class" ? sd(e, s, o) : t === "style" ? ad(e, n, s) : Li(t) ? Jo(t) || ud(e, t, n, s, i) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : _d(e, t, s, o)) ? (yl(e, t, s), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && _l(e, t, s, o, i, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !dt(s)) ? yl(e, Yn(t), s, i, t) : (t === "true-value" ? e._trueValue = s : t === "false-value" && (e._falseValue = s), _l(e, t, s, o));
};
function _d(e, t, n, s) {
  if (s)
    return !!(t === "innerHTML" || t === "textContent" || t in e && wl(t) && Te(n));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const r = e.tagName;
    if (r === "IMG" || r === "VIDEO" || r === "CANVAS" || r === "SOURCE")
      return !1;
  }
  return wl(t) && dt(n) ? !1 : t in e;
}
const kl = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return ve(t) ? (n) => si(t, n) : t;
};
function yd(e) {
  e.target.composing = !0;
}
function Tl(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const ho = Symbol("_assign"), ds = {
  created(e, { modifiers: { lazy: t, trim: n, number: s } }, r) {
    e[ho] = kl(r);
    const i = s || r.props && r.props.type === "number";
    Ps(e, t ? "change" : "input", (o) => {
      if (o.target.composing) return;
      let a = e.value;
      n && (a = a.trim()), i && (a = Io(a)), e[ho](a);
    }), n && Ps(e, "change", () => {
      e.value = e.value.trim();
    }), t || (Ps(e, "compositionstart", yd), Ps(e, "compositionend", Tl), Ps(e, "change", Tl));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t }) {
    e.value = t ?? "";
  },
  beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: s, trim: r, number: i } }, o) {
    if (e[ho] = kl(o), e.composing) return;
    const a = (i || e.type === "number") && !/^0\d/.test(e.value) ? Io(e.value) : e.value, l = t ?? "";
    a !== l && (document.activeElement === e && e.type !== "range" && (s && t === n || r && e.value.trim() === l) || (e.value = l));
  }
}, vd = ["ctrl", "shift", "alt", "meta"], bd = {
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
  exact: (e, t) => vd.some((n) => e[`${n}Key`] && !t.includes(n))
}, ms = (e, t) => {
  const n = e._withMods || (e._withMods = {}), s = t.join(".");
  return n[s] || (n[s] = (r, ...i) => {
    for (let o = 0; o < t.length; o++) {
      const a = bd[t[o]];
      if (a && a(r, t)) return;
    }
    return e(r, ...i);
  });
}, wd = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, li = (e, t) => {
  const n = e._withKeys || (e._withKeys = {}), s = t.join(".");
  return n[s] || (n[s] = (r) => {
    if (!("key" in r))
      return;
    const i = Qn(r.key);
    if (t.some(
      (o) => o === i || wd[o] === i
    ))
      return e(r);
  });
}, kd = /* @__PURE__ */ Lt({ patchProp: md }, td);
let xl;
function Td() {
  return xl || (xl = Ah(kd));
}
const xd = (...e) => {
  const t = Td().createApp(...e), { mount: n } = t;
  return t.mount = (s) => {
    const r = Sd(s);
    if (!r) return;
    const i = t._component;
    !Te(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
    const o = n(r, !1, Ad(r));
    return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), o;
  }, t;
};
function Ad(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function Sd(e) {
  return dt(e) ? document.querySelector(e) : e;
}
const zs = (e) => {
  const t = e.replace("#", ""), n = parseInt(t.substr(0, 2), 16), s = parseInt(t.substr(2, 2), 16), r = parseInt(t.substr(4, 2), 16);
  return (n * 299 + s * 587 + r * 114) / 1e3 < 128;
}, Ed = (e, t) => {
  const n = e.replace("#", ""), s = parseInt(n.substr(0, 2), 16), r = parseInt(n.substr(2, 2), 16), i = parseInt(n.substr(4, 2), 16), o = zs(e), a = o ? Math.min(255, s + t) : Math.max(0, s - t), l = o ? Math.min(255, r + t) : Math.max(0, r - t), p = o ? Math.min(255, i + t) : Math.max(0, i - t);
  return `#${a.toString(16).padStart(2, "0")}${l.toString(16).padStart(2, "0")}${p.toString(16).padStart(2, "0")}`;
}, fr = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e), Cd = (e) => {
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
function pa() {
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
var ws = pa();
function hu(e) {
  ws = e;
}
var Rr = { exec: () => null };
function Ge(e, t = "") {
  let n = typeof e == "string" ? e : e.source;
  const s = {
    replace: (r, i) => {
      let o = typeof i == "string" ? i : i.source;
      return o = o.replace(Dt.caret, "$1"), n = n.replace(r, o), s;
    },
    getRegex: () => new RegExp(n, t)
  };
  return s;
}
var Dt = {
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
}, Rd = /^(?:[ \t]*(?:\n|$))+/, Id = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/, Ld = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, $r = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, Od = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, ga = /(?:[*+-]|\d{1,9}[.)])/, du = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/, pu = Ge(du).replace(/bull/g, ga).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(), Nd = Ge(du).replace(/bull/g, ga).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(), ma = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/, Pd = /^[^\n]+/, _a = /(?!\s*\])(?:\\.|[^\[\]\\])+/, Md = Ge(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", _a).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), Dd = Ge(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, ga).getRegex(), Wi = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", ya = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, Fd = Ge(
  "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))",
  "i"
).replace("comment", ya).replace("tag", Wi).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), gu = Ge(ma).replace("hr", $r).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Wi).getRegex(), $d = Ge(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", gu).getRegex(), va = {
  blockquote: $d,
  code: Id,
  def: Md,
  fences: Ld,
  heading: Od,
  hr: $r,
  html: Fd,
  lheading: pu,
  list: Dd,
  newline: Rd,
  paragraph: gu,
  table: Rr,
  text: Pd
}, Al = Ge(
  "^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"
).replace("hr", $r).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Wi).getRegex(), Bd = {
  ...va,
  lheading: Nd,
  table: Al,
  paragraph: Ge(ma).replace("hr", $r).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", Al).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Wi).getRegex()
}, Ud = {
  ...va,
  html: Ge(
    `^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`
  ).replace("comment", ya).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
  heading: /^(#{1,6})(.*)(?:\n+|$)/,
  fences: Rr,
  // fences not supported
  lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  paragraph: Ge(ma).replace("hr", $r).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", pu).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
}, zd = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, Hd = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, mu = /^( {2,}|\\)\n(?!\s*$)/, Wd = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, qi = /[\p{P}\p{S}]/u, ba = /[\s\p{P}\p{S}]/u, _u = /[^\s\p{P}\p{S}]/u, qd = Ge(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, ba).getRegex(), yu = /(?!~)[\p{P}\p{S}]/u, jd = /(?!~)[\s\p{P}\p{S}]/u, Vd = /(?:[^\s\p{P}\p{S}]|~)/u, Kd = /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g, vu = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/, Gd = Ge(vu, "u").replace(/punct/g, qi).getRegex(), Yd = Ge(vu, "u").replace(/punct/g, yu).getRegex(), bu = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", Xd = Ge(bu, "gu").replace(/notPunctSpace/g, _u).replace(/punctSpace/g, ba).replace(/punct/g, qi).getRegex(), Zd = Ge(bu, "gu").replace(/notPunctSpace/g, Vd).replace(/punctSpace/g, jd).replace(/punct/g, yu).getRegex(), Jd = Ge(
  "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)",
  "gu"
).replace(/notPunctSpace/g, _u).replace(/punctSpace/g, ba).replace(/punct/g, qi).getRegex(), Qd = Ge(/\\(punct)/, "gu").replace(/punct/g, qi).getRegex(), ep = Ge(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), tp = Ge(ya).replace("(?:-->|$)", "-->").getRegex(), np = Ge(
  "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>"
).replace("comment", tp).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), Si = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/, sp = Ge(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", Si).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), wu = Ge(/^!?\[(label)\]\[(ref)\]/).replace("label", Si).replace("ref", _a).getRegex(), ku = Ge(/^!?\[(ref)\](?:\[\])?/).replace("ref", _a).getRegex(), rp = Ge("reflink|nolink(?!\\()", "g").replace("reflink", wu).replace("nolink", ku).getRegex(), wa = {
  _backpedal: Rr,
  // only used for GFM url
  anyPunctuation: Qd,
  autolink: ep,
  blockSkip: Kd,
  br: mu,
  code: Hd,
  del: Rr,
  emStrongLDelim: Gd,
  emStrongRDelimAst: Xd,
  emStrongRDelimUnd: Jd,
  escape: zd,
  link: sp,
  nolink: ku,
  punctuation: qd,
  reflink: wu,
  reflinkSearch: rp,
  tag: np,
  text: Wd,
  url: Rr
}, ip = {
  ...wa,
  link: Ge(/^!?\[(label)\]\((.*?)\)/).replace("label", Si).getRegex(),
  reflink: Ge(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", Si).getRegex()
}, zo = {
  ...wa,
  emStrongRDelimAst: Zd,
  emStrongLDelim: Yd,
  url: Ge(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, "i").replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
  _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
}, op = {
  ...zo,
  br: Ge(mu).replace("{2,}", "*").getRegex(),
  text: Ge(zo.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
}, Qr = {
  normal: va,
  gfm: Bd,
  pedantic: Ud
}, hr = {
  normal: wa,
  gfm: zo,
  breaks: op,
  pedantic: ip
}, ap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}, Sl = (e) => ap[e];
function mn(e, t) {
  if (t) {
    if (Dt.escapeTest.test(e))
      return e.replace(Dt.escapeReplace, Sl);
  } else if (Dt.escapeTestNoEncode.test(e))
    return e.replace(Dt.escapeReplaceNoEncode, Sl);
  return e;
}
function El(e) {
  try {
    e = encodeURI(e).replace(Dt.percentDecode, "%");
  } catch {
    return null;
  }
  return e;
}
function Cl(e, t) {
  var i;
  const n = e.replace(Dt.findPipe, (o, a, l) => {
    let p = !1, c = a;
    for (; --c >= 0 && l[c] === "\\"; ) p = !p;
    return p ? "|" : " |";
  }), s = n.split(Dt.splitPipe);
  let r = 0;
  if (s[0].trim() || s.shift(), s.length > 0 && !((i = s.at(-1)) != null && i.trim()) && s.pop(), t)
    if (s.length > t)
      s.splice(t);
    else
      for (; s.length < t; ) s.push("");
  for (; r < s.length; r++)
    s[r] = s[r].trim().replace(Dt.slashPipe, "|");
  return s;
}
function dr(e, t, n) {
  const s = e.length;
  if (s === 0)
    return "";
  let r = 0;
  for (; r < s && e.charAt(s - r - 1) === t; )
    r++;
  return e.slice(0, s - r);
}
function lp(e, t) {
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
function Rl(e, t, n, s, r) {
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
function cp(e, t, n) {
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
var Ei = class {
  // set by the lexer
  constructor(e) {
    Qe(this, "options");
    Qe(this, "rules");
    // set by the lexer
    Qe(this, "lexer");
    this.options = e || ws;
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
        text: this.options.pedantic ? n : dr(n, `
`)
      };
    }
  }
  fences(e) {
    const t = this.rules.block.fences.exec(e);
    if (t) {
      const n = t[0], s = cp(n, t[3] || "", this.rules);
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
        const s = dr(n, "#");
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
        raw: dr(t[0], `
`)
      };
  }
  blockquote(e) {
    const t = this.rules.block.blockquote.exec(e);
    if (t) {
      let n = dr(t[0], `
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
        const p = a.join(`
`), c = p.replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
        s = s ? `${s}
${p}` : p, r = r ? `${r}
${c}` : c;
        const b = this.lexer.state.top;
        if (this.lexer.state.top = !0, this.lexer.blockTokens(c, i, !0), this.lexer.state.top = b, n.length === 0)
          break;
        const w = i.at(-1);
        if ((w == null ? void 0 : w.type) === "code")
          break;
        if ((w == null ? void 0 : w.type) === "blockquote") {
          const H = w, L = H.raw + `
` + n.join(`
`), K = this.blockquote(L);
          i[i.length - 1] = K, s = s.substring(0, s.length - H.raw.length) + K.raw, r = r.substring(0, r.length - H.text.length) + K.text;
          break;
        } else if ((w == null ? void 0 : w.type) === "list") {
          const H = w, L = H.raw + `
` + n.join(`
`), K = this.list(L);
          i[i.length - 1] = K, s = s.substring(0, s.length - w.raw.length) + K.raw, r = r.substring(0, r.length - H.raw.length) + K.raw, n = L.substring(i.at(-1).raw.length).split(`
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
        let l = !1, p = "", c = "";
        if (!(t = i.exec(e)) || this.rules.block.hr.test(e))
          break;
        p = t[0], e = e.substring(p.length);
        let b = t[2].split(`
`, 1)[0].replace(this.rules.other.listReplaceTabs, (re) => " ".repeat(3 * re.length)), w = e.split(`
`, 1)[0], H = !b.trim(), L = 0;
        if (this.options.pedantic ? (L = 2, c = b.trimStart()) : H ? L = t[1].length + 1 : (L = t[2].search(this.rules.other.nonSpaceChar), L = L > 4 ? 1 : L, c = b.slice(L), L += t[1].length), H && this.rules.other.blankLine.test(w) && (p += w + `
`, e = e.substring(w.length + 1), l = !0), !l) {
          const re = this.rules.other.nextBulletRegex(L), ce = this.rules.other.hrRegex(L), pe = this.rules.other.fencesBeginRegex(L), I = this.rules.other.headingBeginRegex(L), P = this.rules.other.htmlBeginRegex(L);
          for (; e; ) {
            const Y = e.split(`
`, 1)[0];
            let J;
            if (w = Y, this.options.pedantic ? (w = w.replace(this.rules.other.listReplaceNesting, "  "), J = w) : J = w.replace(this.rules.other.tabCharGlobal, "    "), pe.test(w) || I.test(w) || P.test(w) || re.test(w) || ce.test(w))
              break;
            if (J.search(this.rules.other.nonSpaceChar) >= L || !w.trim())
              c += `
` + J.slice(L);
            else {
              if (H || b.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || pe.test(b) || I.test(b) || ce.test(b))
                break;
              c += `
` + w;
            }
            !H && !w.trim() && (H = !0), p += Y + `
`, e = e.substring(Y.length + 1), b = J.slice(L);
          }
        }
        r.loose || (o ? r.loose = !0 : this.rules.other.doubleBlankLine.test(p) && (o = !0));
        let K = null, F;
        this.options.gfm && (K = this.rules.other.listIsTask.exec(c), K && (F = K[0] !== "[ ] ", c = c.replace(this.rules.other.listReplaceTask, ""))), r.items.push({
          type: "list_item",
          raw: p,
          task: !!K,
          checked: F,
          loose: !1,
          text: c,
          tokens: []
        }), r.raw += p;
      }
      const a = r.items.at(-1);
      if (a)
        a.raw = a.raw.trimEnd(), a.text = a.text.trimEnd();
      else
        return;
      r.raw = r.raw.trimEnd();
      for (let l = 0; l < r.items.length; l++)
        if (this.lexer.state.top = !1, r.items[l].tokens = this.lexer.blockTokens(r.items[l].text, []), !r.loose) {
          const p = r.items[l].tokens.filter((b) => b.type === "space"), c = p.length > 0 && p.some((b) => this.rules.other.anyLine.test(b.raw));
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
    const n = Cl(t[1]), s = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), r = (o = t[3]) != null && o.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
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
        i.rows.push(Cl(a, i.header.length).map((l, p) => ({
          text: l,
          tokens: this.lexer.inline(l),
          header: !1,
          align: i.align[p]
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
        const i = dr(n.slice(0, -1), "\\");
        if ((n.length - i.length) % 2 === 0)
          return;
      } else {
        const i = lp(t[2], "()");
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
      return s = s.trim(), this.rules.other.startAngleBracket.test(s) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n) ? s = s.slice(1) : s = s.slice(1, -1)), Rl(t, {
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
      return Rl(n, r, n[0], this.lexer, this.rules);
    }
  }
  emStrong(e, t, n = "") {
    let s = this.rules.inline.emStrongLDelim.exec(e);
    if (!s || s[3] && n.match(this.rules.other.unicodeAlphaNumeric)) return;
    if (!(s[1] || s[2] || "") || !n || this.rules.inline.punctuation.exec(n)) {
      const i = [...s[0]].length - 1;
      let o, a, l = i, p = 0;
      const c = s[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      for (c.lastIndex = 0, t = t.slice(-1 * e.length + i); (s = c.exec(t)) != null; ) {
        if (o = s[1] || s[2] || s[3] || s[4] || s[5] || s[6], !o) continue;
        if (a = [...o].length, s[3] || s[4]) {
          l += a;
          continue;
        } else if ((s[5] || s[6]) && i % 3 && !((i + a) % 3)) {
          p += a;
          continue;
        }
        if (l -= a, l > 0) continue;
        a = Math.min(a, a + l + p);
        const b = [...s[0]][0].length, w = e.slice(0, i + s.index + b + a);
        if (Math.min(i, a) % 2) {
          const L = w.slice(1, -1);
          return {
            type: "em",
            raw: w,
            text: L,
            tokens: this.lexer.inlineTokens(L)
          };
        }
        const H = w.slice(2, -2);
        return {
          type: "strong",
          raw: w,
          text: H,
          tokens: this.lexer.inlineTokens(H)
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
}, Ln = class Ho {
  constructor(t) {
    Qe(this, "tokens");
    Qe(this, "options");
    Qe(this, "state");
    Qe(this, "tokenizer");
    Qe(this, "inlineQueue");
    this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = t || ws, this.options.tokenizer = this.options.tokenizer || new Ei(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = {
      inLink: !1,
      inRawBlock: !1,
      top: !0
    };
    const n = {
      other: Dt,
      block: Qr.normal,
      inline: hr.normal
    };
    this.options.pedantic ? (n.block = Qr.pedantic, n.inline = hr.pedantic) : this.options.gfm && (n.block = Qr.gfm, this.options.breaks ? n.inline = hr.breaks : n.inline = hr.gfm), this.tokenizer.rules = n;
  }
  /**
   * Expose Rules
   */
  static get rules() {
    return {
      block: Qr,
      inline: hr
    };
  }
  /**
   * Static Lex Method
   */
  static lex(t, n) {
    return new Ho(n).lex(t);
  }
  /**
   * Static Lex Inline Method
   */
  static lexInline(t, n) {
    return new Ho(n).inlineTokens(t);
  }
  /**
   * Preprocessing
   */
  lex(t) {
    t = t.replace(Dt.carriageReturn, `
`), this.blockTokens(t, this.tokens);
    for (let n = 0; n < this.inlineQueue.length; n++) {
      const s = this.inlineQueue[n];
      this.inlineTokens(s.src, s.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(t, n = [], s = !1) {
    var r, i, o;
    for (this.options.pedantic && (t = t.replace(Dt.tabCharGlobal, "    ").replace(Dt.spaceLine, "")); t; ) {
      let a;
      if ((i = (r = this.options.extensions) == null ? void 0 : r.block) != null && i.some((p) => (a = p.call({ lexer: this }, t, n)) ? (t = t.substring(a.raw.length), n.push(a), !0) : !1))
        continue;
      if (a = this.tokenizer.space(t)) {
        t = t.substring(a.raw.length);
        const p = n.at(-1);
        a.raw.length === 1 && p !== void 0 ? p.raw += `
` : n.push(a);
        continue;
      }
      if (a = this.tokenizer.code(t)) {
        t = t.substring(a.raw.length);
        const p = n.at(-1);
        (p == null ? void 0 : p.type) === "paragraph" || (p == null ? void 0 : p.type) === "text" ? (p.raw += `
` + a.raw, p.text += `
` + a.text, this.inlineQueue.at(-1).src = p.text) : n.push(a);
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
        const p = n.at(-1);
        (p == null ? void 0 : p.type) === "paragraph" || (p == null ? void 0 : p.type) === "text" ? (p.raw += `
` + a.raw, p.text += `
` + a.raw, this.inlineQueue.at(-1).src = p.text) : this.tokens.links[a.tag] || (this.tokens.links[a.tag] = {
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
        let p = 1 / 0;
        const c = t.slice(1);
        let b;
        this.options.extensions.startBlock.forEach((w) => {
          b = w.call({ lexer: this }, c), typeof b == "number" && b >= 0 && (p = Math.min(p, b));
        }), p < 1 / 0 && p >= 0 && (l = t.substring(0, p + 1));
      }
      if (this.state.top && (a = this.tokenizer.paragraph(l))) {
        const p = n.at(-1);
        s && (p == null ? void 0 : p.type) === "paragraph" ? (p.raw += `
` + a.raw, p.text += `
` + a.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = p.text) : n.push(a), s = l.length !== t.length, t = t.substring(a.raw.length);
        continue;
      }
      if (a = this.tokenizer.text(t)) {
        t = t.substring(a.raw.length);
        const p = n.at(-1);
        (p == null ? void 0 : p.type) === "text" ? (p.raw += `
` + a.raw, p.text += `
` + a.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = p.text) : n.push(a);
        continue;
      }
      if (t) {
        const p = "Infinite loop on byte: " + t.charCodeAt(0);
        if (this.options.silent) {
          console.error(p);
          break;
        } else
          throw new Error(p);
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
    var a, l, p;
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
      if ((l = (a = this.options.extensions) == null ? void 0 : a.inline) != null && l.some((w) => (c = w.call({ lexer: this }, t, n)) ? (t = t.substring(c.raw.length), n.push(c), !0) : !1))
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
        const w = n.at(-1);
        c.type === "text" && (w == null ? void 0 : w.type) === "text" ? (w.raw += c.raw, w.text += c.text) : n.push(c);
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
      if ((p = this.options.extensions) != null && p.startInline) {
        let w = 1 / 0;
        const H = t.slice(1);
        let L;
        this.options.extensions.startInline.forEach((K) => {
          L = K.call({ lexer: this }, H), typeof L == "number" && L >= 0 && (w = Math.min(w, L));
        }), w < 1 / 0 && w >= 0 && (b = t.substring(0, w + 1));
      }
      if (c = this.tokenizer.inlineText(b)) {
        t = t.substring(c.raw.length), c.raw.slice(-1) !== "_" && (o = c.raw.slice(-1)), i = !0;
        const w = n.at(-1);
        (w == null ? void 0 : w.type) === "text" ? (w.raw += c.raw, w.text += c.text) : n.push(c);
        continue;
      }
      if (t) {
        const w = "Infinite loop on byte: " + t.charCodeAt(0);
        if (this.options.silent) {
          console.error(w);
          break;
        } else
          throw new Error(w);
      }
    }
    return n;
  }
}, Ci = class {
  // set by the parser
  constructor(e) {
    Qe(this, "options");
    Qe(this, "parser");
    this.options = e || ws;
  }
  space(e) {
    return "";
  }
  code({ text: e, lang: t, escaped: n }) {
    var i;
    const s = (i = (t || "").match(Dt.notSpaceStart)) == null ? void 0 : i[0], r = e.replace(Dt.endingNewline, "") + `
`;
    return s ? '<pre><code class="language-' + mn(s) + '">' + (n ? r : mn(r, !0)) + `</code></pre>
` : "<pre><code>" + (n ? r : mn(r, !0)) + `</code></pre>
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
      e.loose ? ((n = e.tokens[0]) == null ? void 0 : n.type) === "paragraph" ? (e.tokens[0].text = s + " " + e.tokens[0].text, e.tokens[0].tokens && e.tokens[0].tokens.length > 0 && e.tokens[0].tokens[0].type === "text" && (e.tokens[0].tokens[0].text = s + " " + mn(e.tokens[0].tokens[0].text), e.tokens[0].tokens[0].escaped = !0)) : e.tokens.unshift({
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
    return `<code>${mn(e, !0)}</code>`;
  }
  br(e) {
    return "<br>";
  }
  del({ tokens: e }) {
    return `<del>${this.parser.parseInline(e)}</del>`;
  }
  link({ href: e, title: t, tokens: n }) {
    const s = this.parser.parseInline(n), r = El(e);
    if (r === null)
      return s;
    e = r;
    let i = '<a href="' + e + '"';
    return t && (i += ' title="' + mn(t) + '"'), i += ">" + s + "</a>", i;
  }
  image({ href: e, title: t, text: n, tokens: s }) {
    s && (n = this.parser.parseInline(s, this.parser.textRenderer));
    const r = El(e);
    if (r === null)
      return mn(n);
    e = r;
    let i = `<img src="${e}" alt="${n}"`;
    return t && (i += ` title="${mn(t)}"`), i += ">", i;
  }
  text(e) {
    return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : mn(e.text);
  }
}, ka = class {
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
}, On = class Wo {
  constructor(t) {
    Qe(this, "options");
    Qe(this, "renderer");
    Qe(this, "textRenderer");
    this.options = t || ws, this.options.renderer = this.options.renderer || new Ci(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new ka();
  }
  /**
   * Static Parse Method
   */
  static parse(t, n) {
    return new Wo(n).parse(t);
  }
  /**
   * Static Parse Inline Method
   */
  static parseInline(t, n) {
    return new Wo(n).parseInline(t);
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
        const p = a, c = this.options.extensions.renderers[p.type].call({ parser: this }, p);
        if (c !== !1 || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "paragraph", "text"].includes(p.type)) {
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
          let p = l, c = this.renderer.text(p);
          for (; o + 1 < t.length && t[o + 1].type === "text"; )
            p = t[++o], c += `
` + this.renderer.text(p);
          n ? s += this.renderer.paragraph({
            type: "paragraph",
            raw: c,
            text: c,
            tokens: [{ type: "text", raw: c, text: c, escaped: !0 }]
          }) : s += c;
          continue;
        }
        default: {
          const p = 'Token with "' + l.type + '" type was not found.';
          if (this.options.silent)
            return console.error(p), "";
          throw new Error(p);
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
        const p = this.options.extensions.renderers[a.type].call({ parser: this }, a);
        if (p !== !1 || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(a.type)) {
          s += p || "";
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
          const p = 'Token with "' + l.type + '" type was not found.';
          if (this.options.silent)
            return console.error(p), "";
          throw new Error(p);
        }
      }
    }
    return s;
  }
}, Co, ci = (Co = class {
  constructor(e) {
    Qe(this, "options");
    Qe(this, "block");
    this.options = e || ws;
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
    return this.block ? Ln.lex : Ln.lexInline;
  }
  /**
   * Provide function to parse tokens
   */
  provideParser() {
    return this.block ? On.parse : On.parseInline;
  }
}, Qe(Co, "passThroughHooks", /* @__PURE__ */ new Set([
  "preprocess",
  "postprocess",
  "processAllTokens"
])), Co), up = class {
  constructor(...e) {
    Qe(this, "defaults", pa());
    Qe(this, "options", this.setOptions);
    Qe(this, "parse", this.parseMarkdown(!0));
    Qe(this, "parseInline", this.parseMarkdown(!1));
    Qe(this, "Parser", On);
    Qe(this, "Renderer", Ci);
    Qe(this, "TextRenderer", ka);
    Qe(this, "Lexer", Ln);
    Qe(this, "Tokenizer", Ei);
    Qe(this, "Hooks", ci);
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
        const r = this.defaults.renderer || new Ci(this.defaults);
        for (const i in n.renderer) {
          if (!(i in r))
            throw new Error(`renderer '${i}' does not exist`);
          if (["options", "parser"].includes(i))
            continue;
          const o = i, a = n.renderer[o], l = r[o];
          r[o] = (...p) => {
            let c = a.apply(r, p);
            return c === !1 && (c = l.apply(r, p)), c || "";
          };
        }
        s.renderer = r;
      }
      if (n.tokenizer) {
        const r = this.defaults.tokenizer || new Ei(this.defaults);
        for (const i in n.tokenizer) {
          if (!(i in r))
            throw new Error(`tokenizer '${i}' does not exist`);
          if (["options", "rules", "lexer"].includes(i))
            continue;
          const o = i, a = n.tokenizer[o], l = r[o];
          r[o] = (...p) => {
            let c = a.apply(r, p);
            return c === !1 && (c = l.apply(r, p)), c;
          };
        }
        s.tokenizer = r;
      }
      if (n.hooks) {
        const r = this.defaults.hooks || new ci();
        for (const i in n.hooks) {
          if (!(i in r))
            throw new Error(`hook '${i}' does not exist`);
          if (["options", "block"].includes(i))
            continue;
          const o = i, a = n.hooks[o], l = r[o];
          ci.passThroughHooks.has(i) ? r[o] = (p) => {
            if (this.defaults.async)
              return Promise.resolve(a.call(r, p)).then((b) => l.call(r, b));
            const c = a.call(r, p);
            return l.call(r, c);
          } : r[o] = (...p) => {
            let c = a.apply(r, p);
            return c === !1 && (c = l.apply(r, p)), c;
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
    return Ln.lex(e, t ?? this.defaults);
  }
  parser(e, t) {
    return On.parse(e, t ?? this.defaults);
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
      const a = i.hooks ? i.hooks.provideLexer() : e ? Ln.lex : Ln.lexInline, l = i.hooks ? i.hooks.provideParser() : e ? On.parse : On.parseInline;
      if (i.async)
        return Promise.resolve(i.hooks ? i.hooks.preprocess(n) : n).then((p) => a(p, i)).then((p) => i.hooks ? i.hooks.processAllTokens(p) : p).then((p) => i.walkTokens ? Promise.all(this.walkTokens(p, i.walkTokens)).then(() => p) : p).then((p) => l(p, i)).then((p) => i.hooks ? i.hooks.postprocess(p) : p).catch(o);
      try {
        i.hooks && (n = i.hooks.preprocess(n));
        let p = a(n, i);
        i.hooks && (p = i.hooks.processAllTokens(p)), i.walkTokens && this.walkTokens(p, i.walkTokens);
        let c = l(p, i);
        return i.hooks && (c = i.hooks.postprocess(c)), c;
      } catch (p) {
        return o(p);
      }
    };
  }
  onError(e, t) {
    return (n) => {
      if (n.message += `
Please report this to https://github.com/markedjs/marked.`, e) {
        const s = "<p>An error occurred:</p><pre>" + mn(n.message + "", !0) + "</pre>";
        return t ? Promise.resolve(s) : s;
      }
      if (t)
        return Promise.reject(n);
      throw n;
    };
  }
}, bs = new up();
function We(e, t) {
  return bs.parse(e, t);
}
We.options = We.setOptions = function(e) {
  return bs.setOptions(e), We.defaults = bs.defaults, hu(We.defaults), We;
};
We.getDefaults = pa;
We.defaults = ws;
We.use = function(...e) {
  return bs.use(...e), We.defaults = bs.defaults, hu(We.defaults), We;
};
We.walkTokens = function(e, t) {
  return bs.walkTokens(e, t);
};
We.parseInline = bs.parseInline;
We.Parser = On;
We.parser = On.parse;
We.Renderer = Ci;
We.TextRenderer = ka;
We.Lexer = Ln;
We.lexer = Ln.lex;
We.Tokenizer = Ei;
We.Hooks = ci;
We.parse = We;
We.options;
We.setOptions;
We.use;
We.walkTokens;
We.parseInline;
On.parse;
Ln.lex;
/*! @license DOMPurify 3.4.15 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.15/LICENSE */
function Il(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function fp(e) {
  if (Array.isArray(e)) return e;
}
function hp(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var s, r, i, o, a = [], l = !0, p = !1;
    try {
      if (i = (n = n.call(e)).next, t !== 0) for (; !(l = (s = i.call(n)).done) && (a.push(s.value), a.length !== t); l = !0) ;
    } catch (c) {
      p = !0, r = c;
    } finally {
      try {
        if (!l && n.return != null && (o = n.return(), Object(o) !== o)) return;
      } finally {
        if (p) throw r;
      }
    }
    return a;
  }
}
function dp() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function pp(e, t) {
  return fp(e) || hp(e, t) || gp(e, t) || dp();
}
function gp(e, t) {
  if (e) {
    if (typeof e == "string") return Il(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Il(e, t) : void 0;
  }
}
const Tu = Object.entries, Ll = Object.setPrototypeOf, mp = Object.isFrozen, _p = Object.getPrototypeOf, yp = Object.getOwnPropertyDescriptor;
let _t = Object.freeze, vt = Object.seal, Ms = Object.create, xu = typeof Reflect < "u" && Reflect, qo = xu.apply, jo = xu.construct;
_t || (_t = function(t) {
  return t;
});
vt || (vt = function(t) {
  return t;
});
qo || (qo = function(t, n) {
  for (var s = arguments.length, r = new Array(s > 2 ? s - 2 : 0), i = 2; i < s; i++)
    r[i - 2] = arguments[i];
  return t.apply(n, r);
});
jo || (jo = function(t) {
  for (var n = arguments.length, s = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
    s[r - 1] = arguments[r];
  return new t(...s);
});
const _s = pt(Array.prototype.forEach), vp = pt(Array.prototype.lastIndexOf), Ol = pt(Array.prototype.pop), pr = pt(Array.prototype.push), bp = pt(Array.prototype.splice), Hs = Array.isArray, vr = pt(String.prototype.toLowerCase), po = pt(String.prototype.toString), Nl = pt(String.prototype.match), gr = pt(String.prototype.replace), Pl = pt(String.prototype.indexOf), wp = pt(String.prototype.trim), kp = pt(Number.prototype.toString), Tp = pt(Boolean.prototype.toString), Ml = typeof BigInt > "u" ? null : pt(BigInt.prototype.toString), Dl = typeof Symbol > "u" ? null : pt(Symbol.prototype.toString), Bt = pt(Object.prototype.hasOwnProperty), mr = pt(Object.prototype.toString), Ct = pt(RegExp.prototype.test), ps = xp(TypeError);
function pt(e) {
  return function(t) {
    t instanceof RegExp && (t.lastIndex = 0);
    for (var n = arguments.length, s = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
      s[r - 1] = arguments[r];
    return qo(e, t, s);
  };
}
function xp(e) {
  return function() {
    for (var t = arguments.length, n = new Array(t), s = 0; s < t; s++)
      n[s] = arguments[s];
    return jo(e, n);
  };
}
function Fe(e, t) {
  let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : vr;
  if (Ll && Ll(e, null), !Hs(t))
    return e;
  let s = t.length;
  for (; s--; ) {
    let r = t[s];
    if (typeof r == "string") {
      const i = n(r);
      i !== r && (mp(t) || (t[s] = i), r = i);
    }
    e[r] = !0;
  }
  return e;
}
function Ap(e) {
  for (let t = 0; t < e.length; t++)
    Bt(e, t) || (e[t] = null);
  return e;
}
function qt(e) {
  const t = Ms(null);
  for (const s of Tu(e)) {
    var n = pp(s, 2);
    const r = n[0], i = n[1];
    Bt(e, r) && (Hs(i) ? t[r] = Ap(i) : i && typeof i == "object" && i.constructor === Object ? t[r] = qt(i) : t[r] = i);
  }
  return t;
}
function Sp(e) {
  switch (typeof e) {
    case "string":
      return e;
    case "number":
      return kp(e);
    case "boolean":
      return Tp(e);
    case "bigint":
      return Ml ? Ml(e) : "0";
    case "symbol":
      return Dl ? Dl(e) : "Symbol()";
    case "undefined":
      return mr(e);
    case "function":
    case "object": {
      if (e === null)
        return mr(e);
      const t = e, n = en(t, "toString");
      if (typeof n == "function") {
        const s = n(t);
        return typeof s == "string" ? s : mr(s);
      }
      return mr(e);
    }
    default:
      return mr(e);
  }
}
function en(e, t) {
  for (; e !== null; ) {
    const s = yp(e, t);
    if (s) {
      if (s.get)
        return pt(s.get);
      if (typeof s.value == "function")
        return pt(s.value);
    }
    e = _p(e);
  }
  function n() {
    return null;
  }
  return n;
}
function Ep(e) {
  try {
    return Ct(e, ""), !0;
  } catch {
    return !1;
  }
}
const Fl = _t(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]), go = _t(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "enterkeyhint", "exportparts", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "inputmode", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "part", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]), mo = _t(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]), Cp = _t(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]), _o = _t(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]), Rp = _t(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]), $l = _t(["#text"]), Bl = _t(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "command", "commandfor", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "exportparts", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inert", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "part", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "slot", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns"]), yo = _t(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dominant-baseline", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "mask-type", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "pointer-events", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-orientation", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "vector-effect", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]), Ul = _t(["accent", "accentunder", "align", "bevelled", "close", "columnalign", "columnlines", "columnspacing", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lquote", "lspace", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]), ei = _t(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]), Ip = vt(/{{[\w\W]*|^[\w\W]*}}/g), Lp = vt(/<%[\w\W]*|^[\w\W]*%>/g), Op = vt(/\${[\w\W]*/g), Np = vt(/^data-[\-\w.\u00B7-\uFFFF]+$/), Pp = vt(/^aria-[\-\w]+$/), zl = vt(
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  // eslint-disable-line no-useless-escape
), Mp = vt(/^(?:\w+script|data):/i), Dp = vt(
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g
  // eslint-disable-line no-control-regex
), Fp = vt(/^html$/i), $p = vt(/^[a-z][.\w]*(-[.\w]+)+$/i), Hl = vt(/<[/\w!]/g), Wl = vt(/<[/\w]/g), Bp = vt(/<\/no(script|embed|frames)/i), Up = vt(/\/>/i), Ht = {
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
}, Au = ["style", "script", "xmp", "iframe", "noembed", "noframes", "plaintext", "noscript"], zp = _t(Fe({}, Au)), Hp = function() {
  const e = {};
  return _s(Au, (t) => {
    e[t] = vt(new RegExp("</" + t + "(?=[\\t\\n\\f\\r />])", "i"));
  }), _t(e);
}(), Wp = function() {
  return typeof window > "u" ? null : window;
}, qp = function(t, n) {
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
}, ql = function() {
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
}, Wn = function(t, n, s, r) {
  return Bt(t, n) && Hs(t[n]) ? Fe(r.base ? qt(r.base) : {}, t[n], r.transform) : s;
}, vo = function(t, n, s) {
  const r = Bt(t, n) ? t[n] : void 0;
  return r && typeof r == "object" ? qt(r) : s();
};
function Su() {
  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : Wp();
  const t = (q) => Su(q);
  if (t.version = "3.4.15", t.removed = [], !e || !e.document || e.document.nodeType !== Ht.document || !e.Element)
    return t.isSupported = !1, t;
  let n = e.document;
  const s = n, r = s.currentScript;
  e.DocumentFragment;
  const i = e.HTMLTemplateElement, o = e.Node, a = e.Element, l = e.NodeFilter, p = e.NamedNodeMap;
  p === void 0 && (e.NamedNodeMap || e.MozNamedAttrMap), e.HTMLFormElement;
  const c = e.DOMParser, b = e.trustedTypes, w = a.prototype, H = en(w, "cloneNode"), L = en(w, "remove"), K = en(w, "removeAttributeNode"), F = en(w, "nextSibling"), re = en(w, "childNodes"), ce = en(w, "parentNode"), pe = en(w, "shadowRoot"), I = en(w, "attributes"), P = o && o.prototype ? en(o.prototype, "nodeType") : null, Y = o && o.prototype ? en(o.prototype, "nodeName") : null, J = o && o.prototype ? en(o.prototype, "ownerDocument") : null, _e = function(h) {
    return P ? P(h) : h.nodeType;
  }, Ce = function(h) {
    return Y ? Y(h) : h.nodeName;
  };
  if (typeof i == "function") {
    const q = n.createElement("template");
    q.content && q.content.ownerDocument && (n = q.content.ownerDocument);
  }
  let be, Be = "", we, Xe = !1, qe = 0;
  const rt = function() {
    if (qe > 0)
      throw ps('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.');
  }, fe = function(h) {
    rt(), qe++;
    try {
      return be.createHTML(h);
    } finally {
      qe--;
    }
  }, ke = function(h) {
    rt(), qe++;
    try {
      return be.createScriptURL(h);
    } finally {
      qe--;
    }
  }, ge = function() {
    return Xe || (we = qp(b, r), Xe = !0), we;
  }, Ze = n, xe = Ze.implementation, st = Ze.createNodeIterator, Re = Ze.createDocumentFragment, ft = Ze.getElementsByTagName, Ut = s.importNode;
  let Se = ql();
  t.isSupported = typeof Tu == "function" && typeof ce == "function" && xe && xe.createHTMLDocument !== void 0;
  const gt = Ip, xt = Lp, At = Op, St = Np, Ft = Pp, un = Mp, m = Dp, y = $p;
  let S = zl, M = null;
  const B = Fe({}, [...Fl, ...go, ...mo, ..._o, ...$l]);
  let O = null;
  const G = Fe({}, [...Bl, ...yo, ...Ul, ...ei]);
  let W = Object.seal(Ms(null, {
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
  })), j = null, k = null;
  const R = Object.seal(Ms(null, {
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
  let $ = !0, V = !0, X = !1, he = !0, ue = !1, oe = !0, Me = !1, Le = !1, at = null, f = null, _ = !1, N = !1, C = !1, U = !1, te = !0, se = !1;
  const ye = "user-content-";
  let Oe = !0, $e = !1, De = {}, it = null;
  const mt = Fe({}, [
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
  let Vt = null;
  const es = Fe({}, ["audio", "video", "img", "source", "image", "track"]);
  let Ks = null;
  const Gs = Fe({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), ts = "http://www.w3.org/1998/Math/MathML", ns = "http://www.w3.org/2000/svg", Kt = "http://www.w3.org/1999/xhtml";
  let fn = Kt, Dn = !1, ks = null;
  const Br = Fe({}, [ts, ns, Kt], po), xn = _t(["mi", "mo", "mn", "ms", "mtext"]);
  let An = Fe({}, xn);
  const Ts = _t(["annotation-xml"]);
  let ss = Fe({}, Ts);
  const hn = Fe({}, ["title", "style", "font", "a", "script"]);
  let Fn = null;
  const xs = ["application/xhtml+xml", "text/html"], Ur = "text/html";
  let Je = null, $n = null;
  const As = n.createElement("form"), Ys = function(h) {
    return h instanceof RegExp || h instanceof Function;
  }, Xs = function() {
    let h = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if ($n && $n === h)
      return;
    (!h || typeof h != "object") && (h = {}), h = qt(h), Fn = // eslint-disable-next-line unicorn/prefer-includes
    xs.indexOf(h.PARSER_MEDIA_TYPE) === -1 ? Ur : h.PARSER_MEDIA_TYPE, Je = Fn === "application/xhtml+xml" ? po : vr, M = Wn(h, "ALLOWED_TAGS", B, {
      transform: Je
    }), O = Wn(h, "ALLOWED_ATTR", G, {
      transform: Je
    }), ks = Wn(h, "ALLOWED_NAMESPACES", Br, {
      transform: po
    }), Ks = Wn(h, "ADD_URI_SAFE_ATTR", Gs, {
      transform: Je,
      base: Gs
    }), Vt = Wn(h, "ADD_DATA_URI_TAGS", es, {
      transform: Je,
      base: es
    }), it = Wn(h, "FORBID_CONTENTS", mt, {
      transform: Je
    }), j = Wn(h, "FORBID_TAGS", qt({}), {
      transform: Je
    }), k = Wn(h, "FORBID_ATTR", qt({}), {
      transform: Je
    }), De = Bt(h, "USE_PROFILES") ? h.USE_PROFILES && typeof h.USE_PROFILES == "object" ? qt(h.USE_PROFILES) : h.USE_PROFILES : !1, $ = h.ALLOW_ARIA_ATTR !== !1, V = h.ALLOW_DATA_ATTR !== !1, X = h.ALLOW_UNKNOWN_PROTOCOLS || !1, he = h.ALLOW_SELF_CLOSE_IN_ATTR !== !1, ue = h.SAFE_FOR_TEMPLATES || !1, oe = h.SAFE_FOR_XML !== !1, Me = h.WHOLE_DOCUMENT || !1, N = h.RETURN_DOM || !1, C = h.RETURN_DOM_FRAGMENT || !1, U = h.RETURN_TRUSTED_TYPE || !1, _ = h.FORCE_BODY || !1, te = h.SANITIZE_DOM !== !1, se = h.SANITIZE_NAMED_PROPS || !1, Oe = h.KEEP_CONTENT !== !1, $e = h.IN_PLACE || !1, S = Ep(h.ALLOWED_URI_REGEXP) ? h.ALLOWED_URI_REGEXP : zl, fn = typeof h.NAMESPACE == "string" ? h.NAMESPACE : Kt, An = vo(
      h,
      "MATHML_TEXT_INTEGRATION_POINTS",
      () => Fe({}, xn)
      // Default built-in map
    ), ss = vo(
      h,
      "HTML_INTEGRATION_POINTS",
      () => Fe({}, Ts)
      // Default built-in map
    );
    const T = vo(h, "CUSTOM_ELEMENT_HANDLING", () => Ms(null));
    if (W = Ms(null), Bt(T, "tagNameCheck") && Ys(T.tagNameCheck) && (W.tagNameCheck = T.tagNameCheck), Bt(T, "attributeNameCheck") && Ys(T.attributeNameCheck) && (W.attributeNameCheck = T.attributeNameCheck), Bt(T, "allowCustomizedBuiltInElements") && typeof T.allowCustomizedBuiltInElements == "boolean" && (W.allowCustomizedBuiltInElements = T.allowCustomizedBuiltInElements), vt(W), ue && (V = !1), C && (N = !0), De && (M = Fe({}, $l), O = Ms(null), De.html === !0 && (Fe(M, Fl), Fe(O, Bl)), De.svg === !0 && (Fe(M, go), Fe(O, yo), Fe(O, ei)), De.svgFilters === !0 && (Fe(M, mo), Fe(O, yo), Fe(O, ei)), De.mathMl === !0 && (Fe(M, _o), Fe(O, Ul), Fe(O, ei))), R.tagCheck = null, R.attributeCheck = null, Bt(h, "ADD_TAGS") && (typeof h.ADD_TAGS == "function" ? R.tagCheck = h.ADD_TAGS : Hs(h.ADD_TAGS) && (M === B && (M = qt(M)), Fe(M, h.ADD_TAGS, Je))), Bt(h, "ADD_ATTR") && (typeof h.ADD_ATTR == "function" ? R.attributeCheck = h.ADD_ATTR : Hs(h.ADD_ATTR) && (O === G && (O = qt(O)), Fe(O, h.ADD_ATTR, Je))), Bt(h, "ADD_FORBID_CONTENTS") && Hs(h.ADD_FORBID_CONTENTS) && (it === mt && (it = qt(it)), Fe(it, h.ADD_FORBID_CONTENTS, Je)), Oe && (M["#text"] = !0), Me && Fe(M, ["html", "head", "body"]), M.table && (Fe(M, ["tbody"]), delete j.tbody), h.TRUSTED_TYPES_POLICY) {
      if (typeof h.TRUSTED_TYPES_POLICY.createHTML != "function")
        throw ps('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
      if (typeof h.TRUSTED_TYPES_POLICY.createScriptURL != "function")
        throw ps('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
      const z = be;
      be = h.TRUSTED_TYPES_POLICY;
      try {
        Be = fe("");
      } catch (Z) {
        throw be = z, Z;
      }
    } else h.TRUSTED_TYPES_POLICY === null ? (be = void 0, Be = "") : (be === void 0 && (be = ge()), be && typeof Be == "string" && (Be = fe("")));
    _t && _t(h), $n = h;
  }, Zs = Fe({}, [...go, ...mo, ...Cp]), rs = Fe({}, [..._o, ...Rp]), Js = function(h, T, z) {
    return T.namespaceURI === Kt ? h === "svg" : T.namespaceURI === ts ? h === "svg" && (z === "annotation-xml" || An[z]) : !!Zs[h];
  }, Gt = function(h, T, z) {
    return T.namespaceURI === Kt ? h === "math" : T.namespaceURI === ns ? h === "math" && ss[z] : !!rs[h];
  }, Yt = function(h, T, z) {
    return T.namespaceURI === ns && !ss[z] || T.namespaceURI === ts && !An[z] ? !1 : !rs[h] && (hn[h] || !Zs[h]);
  }, ct = function(h) {
    let T = ce(h);
    (!T || !T.tagName) && (T = {
      namespaceURI: fn,
      tagName: "template"
    });
    const z = vr(h.tagName), Z = vr(T.tagName);
    return ks[h.namespaceURI] ? h.namespaceURI === ns ? Js(z, T, Z) : h.namespaceURI === ts ? Gt(z, T, Z) : h.namespaceURI === Kt ? Yt(z, T, Z) : !!(Fn === "application/xhtml+xml" && ks[h.namespaceURI]) : !1;
  }, tt = function(h) {
    pr(t.removed, {
      element: h
    });
    try {
      ce(h).removeChild(h);
    } catch {
      if (L(h), !ce(h))
        throw ps("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place");
    }
  }, lt = function(h, T, z) {
    try {
      K(h, T);
    } catch {
      try {
        h.removeAttribute(z);
      } catch {
      }
    }
  }, Xt = function(h) {
    Zt(h);
    const T = re(h);
    if (T) {
      const Z = [];
      _s(T, (Q) => {
        pr(Z, Q);
      }), _s(Z, (Q) => {
        try {
          L(Q);
        } catch {
        }
      });
    }
    const z = I(h);
    if (z)
      for (let Z = z.length - 1; Z >= 0; --Z) {
        const Q = z[Z], ae = Q && Q.name;
        typeof ae == "string" && lt(h, Q, ae);
      }
  }, zt = function(h, T, z) {
    if (!z)
      try {
        z = T.getAttributeNode(h);
      } catch {
        z = null;
      }
    pr(t.removed, {
      attribute: z || null,
      from: T
    });
    try {
      z ? K(T, z) : T.removeAttribute(h);
    } catch {
      try {
        T.removeAttribute(h);
      } catch {
      }
    }
    if (h === "is")
      if (N || C)
        try {
          tt(T);
        } catch {
        }
      else
        try {
          T.setAttribute(h, "");
        } catch {
        }
  }, zr = function(h) {
    const T = I(h);
    if (T)
      for (let z = T.length - 1; z >= 0; --z) {
        const Z = T[z], Q = Z && Z.name;
        typeof Q != "string" || O[Je(Q)] || lt(h, Z, Q);
      }
  }, Zt = function(h) {
    const T = [h];
    for (; T.length > 0; ) {
      const z = T.pop();
      _e(z) === Ht.element && zr(z);
      const Q = re(z);
      if (Q)
        for (let ae = Q.length - 1; ae >= 0; --ae)
          T.push(Q[ae]);
    }
  }, yt = function(h, T) {
    return oe ? h === "patchsrc" ? !0 : h === "for" && T !== "label" && T !== "output" : !1;
  }, is = function(h) {
    if (!oe)
      return;
    const T = [h];
    for (; T.length > 0; ) {
      const z = T.pop(), Z = _e(z);
      if (Z === Ht.processingInstruction || Z === Ht.comment && Ct(Wl, z.data)) {
        try {
          L(z);
        } catch {
        }
        continue;
      }
      if (Z === Ht.element) {
        const ae = z, Ne = Je(Ce(z));
        try {
          ae.hasAttribute && ae.hasAttribute("patchsrc") && ae.removeAttribute("patchsrc"), ae.hasAttribute && ae.hasAttribute("for") && yt("for", Ne) && ae.removeAttribute("for");
        } catch {
        }
      }
      const Q = re(z);
      if (Q)
        for (let ae = Q.length - 1; ae >= 0; --ae)
          T.push(Q[ae]);
    }
  }, dn = function(h) {
    let T = null, z = null;
    if (_)
      h = "<remove></remove>" + h;
    else {
      const ae = Nl(h, /^[\r\n\t ]+/);
      z = ae && ae[0];
    }
    Fn === "application/xhtml+xml" && fn === Kt && (h = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + h + "</body></html>");
    const Z = be ? fe(h) : h;
    if (fn === Kt)
      try {
        T = new c().parseFromString(Z, Fn);
      } catch {
      }
    if (!T || !T.documentElement) {
      T = xe.createDocument(fn, "template", null);
      try {
        T.documentElement.innerHTML = Dn ? Be : Z;
      } catch {
      }
    }
    const Q = T.body || T.documentElement;
    return h && z && Q.insertBefore(n.createTextNode(z), Q.childNodes[0] || null), fn === Kt ? ft.call(T, Me ? "html" : "body")[0] : Me ? T.documentElement : Q;
  }, Hr = function(h) {
    const T = J ? J(h) : h.ownerDocument;
    return st.call(
      T || h,
      h,
      // eslint-disable-next-line no-bitwise
      l.SHOW_ELEMENT | l.SHOW_COMMENT | l.SHOW_TEXT | l.SHOW_PROCESSING_INSTRUCTION | l.SHOW_CDATA_SECTION,
      null
    );
  }, Ss = function(h) {
    return h = gr(h, gt, " "), h = gr(h, xt, " "), h = gr(h, At, " "), h;
  }, Qs = function(h) {
    var T;
    h.normalize();
    const z = J ? J(h) : h.ownerDocument, Z = st.call(
      z || h,
      h,
      // eslint-disable-next-line no-bitwise
      l.SHOW_TEXT | l.SHOW_COMMENT | l.SHOW_CDATA_SECTION | l.SHOW_PROCESSING_INSTRUCTION,
      null
    );
    let Q = Z.nextNode();
    for (; Q; )
      Q.data = Ss(Q.data), Q = Z.nextNode();
    const ae = (T = h.querySelectorAll) === null || T === void 0 ? void 0 : T.call(h, "template");
    ae && _s(ae, (Ne) => {
      Bn(Ne.content) && Qs(Ne.content);
    });
  }, Es = function(h) {
    const T = Y ? Y(h) : null;
    return typeof T != "string" || Je(T) !== "form" ? !1 : typeof h.nodeName != "string" || typeof h.textContent != "string" || typeof h.removeChild != "function" || // Realm-safe NamedNodeMap detection: equality against the cached
    // prototype getter. Clobbered .attributes (e.g. <input name="attributes">)
    // makes the direct read diverge from the cached read; a clean form
    // (same-realm OR foreign-realm) has both reads pointing at the same
    // canonical NamedNodeMap.
    h.attributes !== I(h) || typeof h.removeAttribute != "function" || // A form descendant named "removeAttributeNode" or "getAttributeNode"
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
    h.childNodes !== re(h);
  }, Bn = function(h) {
    if (!P || typeof h != "object" || h === null)
      return !1;
    try {
      return P(h) === Ht.documentFragment;
    } catch {
      return !1;
    }
  }, os = function(h) {
    if (!P || typeof h != "object" || h === null)
      return !1;
    try {
      return typeof P(h) == "number";
    } catch {
      return !1;
    }
  };
  function Jt(q, h, T) {
    q.length !== 0 && _s(q, (z) => {
      z.call(t, h, T, $n);
    });
  }
  const Et = function(h, T) {
    return !!(oe && h.hasChildNodes() && !os(h.firstElementChild) && Ct(Hl, h.textContent) && Ct(Hl, h.innerHTML) || oe && h.namespaceURI === Kt && zp[T] && (os(h.firstElementChild) || typeof h.textContent == "string" && Ct(Hp[T], h.textContent)) || h.nodeType === Ht.processingInstruction || oe && h.nodeType === Ht.comment && Ct(Wl, h.data));
  }, Cs = function(h, T) {
    if (h instanceof RegExp)
      return Ct(h, T);
    if (h instanceof Function) {
      for (var z = arguments.length, Z = new Array(z > 2 ? z - 2 : 0), Q = 2; Q < z; Q++)
        Z[Q - 2] = arguments[Q];
      return !!h(T, ...Z);
    }
    return !1;
  }, er = function(h, T, z) {
    if (!j[T] && sr(T) && Cs(W.tagNameCheck, T))
      return !1;
    if (Oe && !it[T]) {
      const Z = ce(h), Q = re(h);
      if (Q && Z) {
        const ae = Q.length;
        for (let Ne = ae - 1; Ne >= 0; --Ne) {
          const Ue = h === z ? H(Q[Ne], !0) : Q[Ne];
          Z.insertBefore(Ue, F(h));
        }
      }
    }
    return tt(h), !0;
  }, Wr = function(h, T, z, Z) {
    return h.length === 0 ? T : T === z || T === Z ? qt(T) : T;
  }, qr = function(h, T) {
    return h === T || ce(h) !== null ? !1 : ($e && Zt(h), !0);
  }, jr = function(h, T) {
    if (Jt(Se.beforeSanitizeElements, h, null), qr(h, T))
      return !0;
    if (Es(h))
      return tt(h), !0;
    const z = Je(Ce(h));
    if (M = Wr(Se.uponSanitizeElement, M, B, at), Jt(Se.uponSanitizeElement, h, {
      tagName: z,
      allowedTags: M
    }), qr(h, T))
      return !0;
    if (Et(h, z))
      return tt(h), !0;
    if (j[z] || !(R.tagCheck instanceof Function && R.tagCheck(z)) && !M[z]) {
      const Q = er(h, z, T);
      return Q === !1 && Jt(Se.afterSanitizeElements, h, null), Q;
    }
    if (_e(h) === Ht.element && !ct(h) || (z === "noscript" || z === "noembed" || z === "noframes") && Ct(Bp, h.innerHTML))
      return tt(h), !0;
    if (ue && h.nodeType === Ht.text) {
      const Q = Ss(h.textContent);
      h.textContent !== Q && (pr(t.removed, {
        element: h.cloneNode()
      }), h.textContent = Q);
    }
    return Jt(Se.afterSanitizeElements, h, null), !1;
  }, tr = function(h, T, z) {
    if (k[T] || yt(T, h) || te && (T === "id" || T === "name") && (z in n || z in As))
      return !1;
    const Z = O[T] || R.attributeCheck instanceof Function && R.attributeCheck(T, h);
    return V && Ct(St, T) || $ && Ct(Ft, T) ? !0 : Z ? Ks[T] || Ct(S, gr(z, m, "")) || (T === "src" || T === "xlink:href" || T === "href") && h !== "script" && Pl(z, "data:") === 0 && Vt[h] || X && !Ct(un, gr(z, m, "")) ? !0 : !z : (
      // Condition a) covers a basically valid custom element tag name whose
      // tag passes the configured tagNameCheck and whose attribute name
      // passes the configured attributeNameCheck ...
      sr(h) && Cs(W.tagNameCheck, h) && Cs(W.attributeNameCheck, T, h) || // Condition b) covers an `is` attribute whose value passes the
      // configured tagNameCheck while customized built-in elements are
      // allowed.
      T === "is" && W.allowCustomizedBuiltInElements && Cs(W.tagNameCheck, z)
    );
  }, nr = Fe({}, ["annotation-xml", "color-profile", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "missing-glyph"]), sr = function(h) {
    return !nr[vr(h)] && Ct(y, h);
  }, Ki = function(h, T, z, Z) {
    if (be && typeof b == "object" && typeof b.getAttributeType == "function" && !z)
      switch (b.getAttributeType(h, T)) {
        case "TrustedHTML":
          return fe(Z);
        case "TrustedScriptURL":
          return ke(Z);
      }
    return Z;
  }, Gi = function(h, T, z, Z) {
    try {
      return z ? h.setAttributeNS(z, T, Z) : h.setAttribute(T, Z), Es(h) ? (tt(h), !1) : !0;
    } catch {
      return zt(T, h), !1;
    }
  }, Rs = function(h) {
    Jt(Se.beforeSanitizeAttributes, h, null);
    const T = h.attributes;
    if (!T || Es(h))
      return;
    O = Wr(Se.uponSanitizeAttribute, O, G, f);
    const z = {
      attrName: "",
      attrValue: "",
      keepAttr: !0,
      allowedAttributes: O,
      forceKeepAttr: void 0
    };
    let Z = T.length;
    const Q = Je(h.nodeName);
    for (; Z--; ) {
      const ae = T[Z], Ne = ae.name, Ue = ae.namespaceURI, ut = ae.value, bt = Je(Ne), Is = ut;
      let wt = Ne === "value" ? Is : wp(Is), Vr = !1;
      if (z.attrName = bt, z.attrValue = wt, z.keepAttr = !0, z.forceKeepAttr = void 0, Jt(Se.uponSanitizeAttribute, h, z), wt = z.attrValue, se && (bt === "id" || bt === "name") && Pl(wt, ye) !== 0 && (zt(Ne, h, ae), wt = ye + wt, Vr = !0), oe && Ct(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, wt)) {
        zt(Ne, h, ae);
        continue;
      }
      if (bt === "attributename" && Nl(wt, "href")) {
        zt(Ne, h, ae);
        continue;
      }
      if (!z.forceKeepAttr) {
        if (!z.keepAttr) {
          zt(Ne, h, ae);
          continue;
        }
        if (!he && Ct(Up, wt)) {
          zt(Ne, h, ae);
          continue;
        }
        if (ue && (wt = Ss(wt)), !tr(Q, bt, wt)) {
          zt(Ne, h, ae);
          continue;
        }
        wt = Ki(Q, bt, Ue, wt), wt !== Is && Gi(h, Ne, Ue, wt) && Vr && Ol(t.removed);
      }
    }
    Jt(Se.afterSanitizeAttributes, h, null);
  }, as = function(h) {
    let T = null;
    const z = Hr(h);
    for (Jt(Se.beforeSanitizeShadowDOM, h, null); T = z.nextNode(); )
      if (Jt(Se.uponSanitizeShadowNode, T, null), jr(T, h), Rs(T), Bn(T.content) && as(T.content), _e(T) === Ht.element) {
        const Z = pe(T);
        Bn(Z) && (rr(Z), as(Z));
      }
    Jt(Se.afterSanitizeShadowDOM, h, null);
  }, rr = function(h) {
    const T = [{
      node: h,
      shadow: null
    }];
    for (; T.length > 0; ) {
      const z = T.pop();
      if (z.shadow) {
        as(z.shadow);
        continue;
      }
      const Z = z.node, ae = _e(Z) === Ht.element, Ne = re(Z);
      if (Ne)
        for (let Ue = Ne.length - 1; Ue >= 0; --Ue)
          T.push({
            node: Ne[Ue],
            shadow: null
          });
      if (ae) {
        const Ue = Y ? Y(Z) : null;
        if (typeof Ue == "string" && Je(Ue) === "template") {
          const ut = Z.content;
          Bn(ut) && T.push({
            node: ut,
            shadow: null
          });
        }
      }
      if (ae) {
        const Ue = pe(Z);
        Bn(Ue) && T.push({
          node: null,
          shadow: Ue
        }, {
          node: Ue,
          shadow: null
        });
      }
    }
  };
  return t.sanitize = function(q) {
    let h = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, T = null, z = null, Z = null, Q = null;
    if (Dn = !q, Dn && (q = "<!-->"), typeof q != "string" && !os(q) && (q = Sp(q), typeof q != "string"))
      throw ps("dirty is not a string, aborting");
    if (!t.isSupported)
      return q;
    Le ? (M = at, O = f) : Xs(h), (Se.uponSanitizeElement.length > 0 || Se.uponSanitizeAttribute.length > 0) && (M = qt(M)), Se.uponSanitizeAttribute.length > 0 && (O = qt(O)), t.removed = [];
    const ae = $e && typeof q != "string" && os(q);
    if (ae) {
      is(q);
      const ut = Ce(q);
      if (typeof ut == "string") {
        const bt = Je(ut);
        if (!M[bt] || j[bt])
          throw Xt(q), ps("root node is forbidden and cannot be sanitized in-place");
      }
      if (Es(q))
        throw Xt(q), ps("root node is clobbered and cannot be sanitized in-place");
      try {
        rr(q);
      } catch (bt) {
        throw Xt(q), bt;
      }
    } else if (os(q))
      T = dn("<!---->"), z = T.ownerDocument.importNode(q, !0), z.nodeType === Ht.element && z.nodeName === "BODY" || z.nodeName === "HTML" ? T = z : T.appendChild(z), rr(T);
    else {
      if (!N && !ue && !Me && // eslint-disable-next-line unicorn/prefer-includes
      q.indexOf("<") === -1)
        return be && U ? fe(q) : q;
      if (T = dn(q), !T)
        return N ? null : U ? Be : "";
    }
    T && _ && tt(T.firstChild);
    const Ne = ae ? q : T;
    try {
      const ut = Hr(Ne);
      for (; Z = ut.nextNode(); )
        jr(Z, Ne), Rs(Z), Bn(Z.content) && as(Z.content);
    } catch (ut) {
      throw ae && (Xt(q), _s(t.removed, (bt) => {
        bt.element && Zt(bt.element);
      })), ut;
    }
    if (ae)
      return _s(t.removed, (ut) => {
        ut.element && Zt(ut.element);
      }), ue && Qs(q), q;
    if (N) {
      if (ue && Qs(T), C)
        for (Q = Re.call(T.ownerDocument); T.firstChild; )
          Q.appendChild(T.firstChild);
      else
        Q = T;
      return (O.shadowroot || O.shadowrootmode) && (Q = Ut.call(s, Q, !0)), Q;
    }
    let Ue = Me ? T.outerHTML : T.innerHTML;
    return Me && M["!doctype"] && T.ownerDocument && T.ownerDocument.doctype && T.ownerDocument.doctype.name && Ct(Fp, T.ownerDocument.doctype.name) && (Ue = "<!DOCTYPE " + T.ownerDocument.doctype.name + `>
` + Ue), ue && (Ue = Ss(Ue)), be && U ? fe(Ue) : Ue;
  }, t.setConfig = function() {
    let q = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    Xs(q), Le = !0, at = M, f = O;
  }, t.clearConfig = function() {
    $n = null, Le = !1, at = null, f = null, be = we, Be = "";
  }, t.isValidAttribute = function(q, h, T) {
    $n || Xs({});
    const z = Je(q), Z = Je(h);
    return tr(z, Z, T);
  }, t.addHook = function(q, h) {
    typeof h == "function" && Bt(Se, q) && pr(Se[q], h);
  }, t.removeHook = function(q, h) {
    if (Bt(Se, q)) {
      if (h !== void 0) {
        const T = vp(Se[q], h);
        return T === -1 ? void 0 : bp(Se[q], T, 1)[0];
      }
      return Ol(Se[q]);
    }
  }, t.removeHooks = function(q) {
    Bt(Se, q) && (Se[q] = []);
  }, t.removeAllHooks = function() {
    Se = ql();
  }, t;
}
var Ta = Su();
Ta.addHook("uponSanitizeElement", (e, t) => {
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
Ta.addHook("afterSanitizeAttributes", (e) => {
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
function jp(e) {
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
  return Ta.sanitize(e, t);
}
We.setOptions({
  renderer: new We.Renderer(),
  gfm: !0,
  breaks: !0
});
const ui = (e) => jp(We(e || "")), jl = "*", Vp = /* @__PURE__ */ new Set(["null", "about:blank", ""]);
let gn = null;
const fi = (e) => e && !Vp.has(e) ? e : null, Kp = (e) => {
  if (!e) return null;
  try {
    return fi(new URL(e).origin);
  } catch {
    return null;
  }
};
function Gp() {
  if (gn) return gn;
  if (window.parent === window)
    return gn = fi(window.location.origin) || jl, gn;
  try {
    const e = fi(window.parent.location.origin);
    if (e)
      return gn = e, gn;
  } catch {
  }
  try {
    const e = window.location.ancestorOrigins, t = e && e.length ? fi(e[0]) : null;
    if (t)
      return gn = t, gn;
  } catch {
  }
  return gn = Kp(document.referrer) || jl, gn;
}
function Vn(e) {
  window.parent.postMessage(e, Gp());
}
const Ri = "Start a new chat", Vl = "Start a new chat? This ends the current one.", Yp = "Start new chat", Xp = "Cancel", Kl = "Couldn't start a new chat. Please try again.", Zp = 15e3, Jp = ["aria-label"], Qp = { class: "new-chat-confirm__question" }, eg = { class: "new-chat-confirm__actions" }, tg = ["disabled"], ng = ["disabled"], sg = /* @__PURE__ */ ua({
  __name: "NewChatConfirm",
  props: {
    error: {},
    busy: { type: Boolean }
  },
  emits: ["confirm", "cancel"],
  setup(e, { emit: t }) {
    const n = t;
    return (s, r) => (x(), A("div", {
      class: "new-chat-confirm",
      role: "alertdialog",
      "aria-live": "polite",
      "aria-label": E(Vl)
    }, [
      v("p", Qp, ee(s.error || E(Vl)), 1),
      v("div", eg, [
        v("button", {
          type: "button",
          class: "new-chat-confirm__button",
          disabled: s.busy,
          onClick: r[0] || (r[0] = (i) => n("cancel"))
        }, ee(E(Xp)), 9, tg),
        v("button", {
          type: "button",
          class: "new-chat-confirm__button new-chat-confirm__button--primary",
          disabled: s.busy,
          onClick: r[1] || (r[1] = (i) => n("confirm"))
        }, ee(E(Yp)), 9, ng)
      ])
    ], 8, Jp));
  }
}), xa = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [s, r] of t)
    n[s] = r;
  return n;
}, Eu = /* @__PURE__ */ xa(sg, [["__scopeId", "data-v-6c78f353"]]), rg = { class: "askai" }, ig = { class: "askai__bar" }, og = ["value", "placeholder", "disabled", "aria-label", "onKeydown"], ag = ["disabled", "title", "aria-label", "aria-expanded"], lg = { class: "askai__intro" }, cg = { class: "askai__title" }, ug = {
  key: 0,
  class: "askai__subtitle"
}, fg = {
  key: 0,
  class: "askai__suggestions"
}, hg = ["disabled", "onClick"], dg = ["aria-live"], pg = {
  key: 0,
  class: "askai__question"
}, gg = {
  key: 1,
  class: "askai__system"
}, mg = ["innerHTML"], _g = {
  key: 0,
  class: "askai__sources"
}, yg = ["title"], vg = {
  key: 0,
  class: "askai__thinking",
  role: "status",
  "aria-live": "polite"
}, bg = { class: "askai__thinking-text" }, wg = { class: "askai__foot" }, kg = { key: 0 }, Tg = /* @__PURE__ */ ua({
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
    const n = e, s = t, r = le(null), i = le(null), o = le(null), a = ["user", "bot", "agent", "system"], l = de(
      () => n.messages.map((I, P) => ({ message: I, index: P })).filter(({ message: I }) => a.includes(I.message_type))
    ), p = de(() => l.value.length > 0), c = (I) => {
      s("update:draft", I.target.value);
    }, b = () => {
      !(n.typingEnabled ?? n.inputEnabled) || !n.draft.trim() || s("send");
    }, w = (I) => {
      n.inputEnabled && s("ask", I);
    }, H = typeof navigator < "u" && /Mac|iPod|iPhone|iPad/.test(navigator.platform || ""), L = (I) => {
      if (I.key === "Escape") {
        I.preventDefault(), s("close");
        return;
      }
      const P = H ? I.metaKey && !I.ctrlKey : I.ctrlKey && !I.metaKey;
      n.hotkey && P && !I.altKey && (I.key === "k" || I.key === "K") && (I.preventDefault(), s("close"));
    }, K = () => {
      vs(() => {
        var I;
        return (I = r.value) == null ? void 0 : I.focus();
      });
    };
    let F = 0;
    const re = () => {
      if (!o.value) return;
      const I = o.value.closest(".askai"), P = i.value;
      if (!I || !P) return;
      const Y = I.offsetHeight - P.offsetHeight, J = getComputedStyle(P), _e = parseFloat(J.paddingTop) + parseFloat(J.paddingBottom), Ce = Math.ceil(Y + _e + o.value.getBoundingClientRect().height);
      Math.abs(Ce - F) < 3 || (F = Ce, Vn({ type: "WIDGET_RESIZE", height: Ce }));
    };
    let ce = null;
    const pe = de(
      () => l.value.reduce((I, { message: P, index: Y }) => I + n.displayText(Y, P.message || "").length, 0)
    );
    return Nt(
      () => [l.value.length, pe.value, n.loading],
      () => vs(() => {
        i.value && (i.value.scrollTop = i.value.scrollHeight);
      })
    ), Nt(() => n.newChatArmed, () => vs(() => re())), Nt(() => n.active, (I) => {
      I && K();
    }), Bi(() => {
      n.active && K(), window.addEventListener("keydown", L), o.value && typeof ResizeObserver < "u" && (ce = new ResizeObserver(() => re()), ce.observe(o.value)), re();
    }), zc(() => {
      window.removeEventListener("keydown", L), ce == null || ce.disconnect(), ce = null;
    }), (I, P) => (x(), A("div", rg, [
      v("div", ig, [
        P[6] || (P[6] = v("svg", {
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
          value: I.draft,
          placeholder: I.placeholder,
          disabled: !(I.typingEnabled ?? I.inputEnabled),
          "aria-label": I.placeholder,
          autocomplete: "off",
          spellcheck: "false",
          onInput: c,
          onKeydown: li(ms(b, ["prevent"]), ["enter"])
        }, null, 40, og),
        I.canStartNewChat ? (x(), A("button", {
          key: 0,
          type: "button",
          class: ze(["askai__new", { "askai__new--armed": I.newChatArmed }]),
          disabled: I.startingNewChat,
          title: E(Ri),
          "aria-label": E(Ri),
          "aria-expanded": I.newChatArmed,
          onClick: P[0] || (P[0] = (Y) => s("newChat"))
        }, P[4] || (P[4] = [
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
        ]), 10, ag)) : ie("", !0),
        v("button", {
          type: "button",
          class: "askai__close",
          "aria-label": "Close",
          title: "Close (Esc)",
          onClick: P[1] || (P[1] = (Y) => s("close"))
        }, P[5] || (P[5] = [
          v("span", { class: "askai__kbd" }, "Esc", -1)
        ]))
      ]),
      I.newChatArmed && I.canStartNewChat ? (x(), Ti(Eu, {
        key: 0,
        busy: I.startingNewChat,
        error: I.newChatError,
        onConfirm: P[2] || (P[2] = (Y) => s("confirmNewChat")),
        onCancel: P[3] || (P[3] = (Y) => s("cancelNewChat"))
      }, null, 8, ["busy", "error"])) : ie("", !0),
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
          p.value ? (x(), A(He, { key: 1 }, [
            (x(!0), A(He, null, kt(l.value, ({ message: Y, index: J }) => (x(), A("div", {
              key: J,
              class: "askai__turn",
              "aria-live": I.isStreaming(J) ? "off" : "polite"
            }, [
              Y.message_type === "user" ? (x(), A("p", pg, ee(Y.message), 1)) : Y.message_type === "system" ? (x(), A("p", gg, ee(Y.message), 1)) : (x(), A(He, { key: 2 }, [
                v("div", {
                  class: ze(["askai__answer", { "askai__answer--streaming": I.isStreaming(J) }]),
                  innerHTML: E(ui)(I.isStreaming(J) ? I.displayText(J, Y.message || "") : Y.message || "")
                }, null, 10, mg),
                I.showCitations && !I.isStreaming(J) && Y.sources && Y.sources.length ? (x(), A("div", _g, [
                  P[9] || (P[9] = v("span", { class: "askai__label" }, "Sources", -1)),
                  (x(!0), A(He, null, kt(Y.sources, (_e, Ce) => (x(), A("span", {
                    key: Ce,
                    class: "askai__source",
                    title: I.citationTooltip(_e)
                  }, ee(I.citationLabel(_e)), 9, yg))), 128))
                ])) : ie("", !0)
              ], 64))
            ], 8, dg))), 128)),
            I.loading ? (x(), A("div", vg, [
              P[10] || (P[10] = v("span", { class: "askai__dot" }, null, -1)),
              P[11] || (P[11] = v("span", { class: "askai__dot" }, null, -1)),
              P[12] || (P[12] = v("span", { class: "askai__dot" }, null, -1)),
              v("span", bg, ee(I.showCitations ? "Searching the knowledge base" : "Thinking"), 1)
            ])) : ie("", !0)
          ], 64)) : (x(), A(He, { key: 0 }, [
            v("div", lg, [
              v("h2", cg, ee(I.welcomeTitle || `Ask ${I.agentName}`), 1),
              I.welcomeSubtitle ? (x(), A("p", ug, ee(I.welcomeSubtitle), 1)) : ie("", !0)
            ]),
            I.suggestions.length && !I.draft.trim() ? (x(), A("div", fg, [
              P[8] || (P[8] = v("p", { class: "askai__label" }, "Suggested", -1)),
              (x(!0), A(He, null, kt(I.suggestions, (Y) => (x(), A("button", {
                key: Y,
                type: "button",
                class: "askai__suggestion",
                disabled: !I.inputEnabled,
                onClick: (J) => w(Y)
              }, [
                v("span", null, ee(Y), 1),
                P[7] || (P[7] = v("svg", {
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
              ], 8, hg))), 128))
            ])) : ie("", !0)
          ], 64))
        ], 512)
      ], 512),
      v("div", wg, [
        I.disclaimer ? (x(), A("span", kg, ee(I.disclaimer), 1)) : ie("", !0),
        P[13] || (P[13] = v("a", {
          class: "askai__brand",
          href: "https://chattermate.chat",
          target: "_blank",
          rel: "noopener noreferrer"
        }, "Powered by ChatterMate", -1))
      ])
    ]));
  }
}), xg = /* @__PURE__ */ xa(Tg, [["__scopeId", "data-v-edea9534"]]), br = [
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
], Ag = (e) => (e || "").split("").reduce((t, n) => t + n.charCodeAt(0), 0) % br.length, Sg = (e) => {
  const t = br[(e % br.length + br.length) % br.length];
  return {
    background: `
            radial-gradient(circle at 32% 28%, rgba(255,255,255,0.22) 0%, transparent 42%),
            radial-gradient(circle at 68% 72%, rgba(0,0,0,0.25) 0%, transparent 38%),
            radial-gradient(ellipse at 50% 50%, ${t.stops})
        `.trim(),
    boxShadow: `0 4px 28px ${t.glow}, inset 0 1px 0 rgba(255,255,255,0.15)`,
    borderRadius: "50%"
  };
}, Eg = (e, t) => {
  const n = typeof t == "number" && Number.isFinite(t) ? t : Ag(e);
  return Sg(n);
}, Gl = (e) => {
  var t;
  return !!((t = e == null ? void 0 : e.attributes) != null && t.end_chat);
}, Yl = "AI can make mistakes. Check important info.";
function Cg(e, t = !1) {
  return e !== !1 && !t;
}
const bo = {
  ai: "Online · replies instantly",
  human: "Online · usually replies in a few minutes",
  away: "Away · we'll reply when we're back"
};
function Rg(e, t = !1) {
  return (t ? "human" : (e == null ? void 0 : e.mode) ?? "ai") === "ai" ? { text: bo.ai, online: !0 } : (e == null ? void 0 : e.available) !== !1 ? { text: bo.human, online: !0 } : { text: bo.away, online: !1 };
}
const Cu = (e) => !!e && (/^https?:\/\//i.test(e) || e.startsWith("data:")), Ig = (e, t) => e ? Cu(e) || e.startsWith("blob:") ? e : `${t.replace(/\/api\/v1\/?$/, "")}${e.startsWith("/") ? "" : "/"}${e}` : "";
function Xl() {
  return typeof window < "u" && window.APP_CONFIG ? window.APP_CONFIG : {};
}
const js = {
  get API_URL() {
    return Xl().API_URL || "https://api.chattermate.chat/api/v1";
  },
  get WS_URL() {
    return Xl().WS_URL || "wss://api.chattermate.chat";
  }
};
function Ii(e) {
  return Ig(e, js.API_URL);
}
function Lg(e) {
  const t = de(() => ({
    backgroundColor: "var(--cm-card)",
    color: "var(--cm-text)"
  })), n = de(() => ({
    backgroundColor: e.value.chat_bubble_color || "#C9F24E",
    color: zs(e.value.chat_bubble_color || "#C9F24E") ? "#FFFFFF" : "#000000"
  })), s = de(() => ({
    backgroundColor: "var(--cm-agent-bg)",
    color: "var(--cm-text)"
  })), r = de(() => ({
    backgroundColor: "var(--cm-accent)",
    color: "var(--cm-on-accent)"
  })), i = de(() => ({
    color: "var(--cm-text)"
  })), o = de(() => ({
    borderBottom: "1px solid var(--cm-hairline)"
  })), a = de(() => Ii(e.value.photo_url)), l = de(() => {
    const p = e.value.chat_background_color || "#ffffff";
    return {
      boxShadow: `0 8px 5px ${zs(p) ? "rgba(0, 0, 0, 0.24)" : "rgba(0, 0, 0, 0.12)"}`
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
const Og = /* @__PURE__ */ new Set(["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]), Ng = /* @__PURE__ */ new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);
[...Og, ...Ng];
function Pg(e, t) {
  const n = le([]), s = le(!1), r = le(null), i = (P) => {
    if (P === 0) return "0 Bytes";
    const Y = 1024, J = ["Bytes", "KB", "MB", "GB"], _e = Math.floor(Math.log(P) / Math.log(Y));
    return parseFloat((P / Math.pow(Y, _e)).toFixed(2)) + " " + J[_e];
  }, o = (P) => P.startsWith("image/"), a = (P) => P ? Ii(P) : "", l = (P) => {
    const Y = P.file_url || P.url;
    return Y ? Ii(Y) : "";
  }, p = async (P) => {
    const Y = P.target;
    Y.files && Y.files.length > 0 && (await K(Array.from(Y.files)), Y.value = "");
  }, c = async (P) => {
    var J;
    P.preventDefault();
    const Y = (J = P.dataTransfer) == null ? void 0 : J.files;
    Y && Y.length > 0 && await K(Array.from(Y));
  }, b = (P) => {
    P.preventDefault();
  }, w = (P) => {
    P.preventDefault();
  }, H = async (P) => {
    var _e;
    const Y = (_e = P.clipboardData) == null ? void 0 : _e.items;
    if (!Y) return;
    const J = [];
    for (const Ce of Array.from(Y))
      if (Ce.kind === "file") {
        const be = Ce.getAsFile();
        be && J.push(be);
      }
    J.length > 0 && await K(J);
  }, L = async (P, Y = 500) => new Promise((J, _e) => {
    const Ce = new FileReader();
    Ce.onload = (be) => {
      var we;
      const Be = new Image();
      Be.onload = () => {
        const Xe = document.createElement("canvas");
        let qe = Be.width, rt = Be.height;
        const fe = 1920;
        (qe > fe || rt > fe) && (qe > rt ? (rt = rt / qe * fe, qe = fe) : (qe = qe / rt * fe, rt = fe)), Xe.width = qe, Xe.height = rt;
        const ke = Xe.getContext("2d");
        if (!ke) {
          _e(new Error("Failed to get canvas context"));
          return;
        }
        ke.drawImage(Be, 0, 0, qe, rt);
        let ge = 0.9;
        const Ze = () => {
          Xe.toBlob((xe) => {
            if (!xe) {
              _e(new Error("Failed to compress image"));
              return;
            }
            if (xe.size / 1024 > Y && ge > 0.3)
              ge -= 0.1, Ze();
            else {
              const Re = new FileReader();
              Re.onload = () => {
                const ft = Re.result.split(",")[1];
                J({ blob: xe, base64: ft });
              }, Re.readAsDataURL(xe);
            }
          }, P.type === "image/png" ? "image/png" : "image/jpeg", ge);
        };
        Ze();
      }, Be.onerror = () => _e(new Error("Failed to load image")), Be.src = (we = be.target) == null ? void 0 : we.result;
    }, Ce.onerror = () => _e(new Error("Failed to read file")), Ce.readAsDataURL(P);
  }), K = async (P) => {
    if (n.value.length >= 3) {
      alert("Maximum 3 files allowed per message");
      return;
    }
    const be = 3 - n.value.length, Be = P.slice(0, be);
    P.length > be && alert(`Only ${be} more file(s) can be uploaded. Maximum 3 files per message.`);
    for (const we of Be)
      try {
        if (n.value.some((fe) => fe.filename === we.name)) {
          console.warn(`File ${we.name} is already selected`), alert(`File "${we.name}" is already selected`);
          continue;
        }
        const qe = we.type.startsWith("image/"), rt = qe ? 5242880 : 10485760;
        if (we.size > rt) {
          const fe = rt / 1048576;
          console.error(`File ${we.name} is too large. Maximum size is ${fe}MB`), alert(`File "${we.name}" is too large. Maximum size for ${qe ? "images" : "documents"} is ${fe}MB`);
          continue;
        }
        if (qe)
          try {
            const { blob: fe, base64: ke } = await L(we, 500), ge = fe.size;
            console.log(`Compressed ${we.name}: ${(we.size / 1024).toFixed(2)}KB → ${(ge / 1024).toFixed(2)}KB`), n.value.push({
              content: ke,
              filename: we.name,
              type: we.type,
              size: ge,
              url: URL.createObjectURL(fe),
              file_url: URL.createObjectURL(fe)
            });
          } catch (fe) {
            console.error("Image compression failed, uploading original:", fe);
            const ke = new FileReader();
            ke.onload = (ge) => {
              var st;
              const xe = ((st = ge.target) == null ? void 0 : st.result).split(",")[1];
              n.value.push({
                content: xe,
                filename: we.name,
                type: we.type,
                size: we.size,
                url: URL.createObjectURL(we),
                file_url: URL.createObjectURL(we)
              });
            }, ke.readAsDataURL(we);
          }
        else {
          const fe = new FileReader();
          fe.onload = (ke) => {
            var xe;
            const Ze = ((xe = ke.target) == null ? void 0 : xe.result).split(",")[1];
            n.value.push({
              content: Ze,
              filename: we.name,
              type: we.type || "application/octet-stream",
              size: we.size,
              url: "",
              file_url: ""
            });
          }, fe.readAsDataURL(we);
        }
      } catch (Xe) {
        console.error("File upload error:", Xe);
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
    handleFileSelect: p,
    handleDrop: c,
    handleDragOver: b,
    handleDragLeave: w,
    handlePaste: H,
    uploadFiles: K,
    removeAttachment: async (P) => {
      const Y = n.value[P];
      if (Y) {
        try {
          let J = Y.url;
          if (J.startsWith("/uploads/") ? J = J.substring(9) : J.startsWith("/") && (J = J.substring(1)), Cu(J))
            try {
              J = new URL(J).pathname.replace(/^\/+/, "");
            } catch {
            }
          const _e = {};
          e.value && (_e.Authorization = `Bearer ${e.value}`);
          const Ce = await fetch(`${js.API_URL}/files/upload/${J}`, {
            method: "DELETE",
            headers: _e
          });
          if (Ce.ok)
            console.log("File deleted successfully from backend.");
          else {
            const be = await Ce.json();
            console.error("Failed to delete file:", be.detail);
          }
        } catch (J) {
          console.error("Error calling delete API:", J);
        }
        Y.url && Y.url.startsWith("blob:") && URL.revokeObjectURL(Y.url), Y.file_url && Y.file_url.startsWith("blob:") && URL.revokeObjectURL(Y.file_url), n.value.splice(P, 1);
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
const Tn = /* @__PURE__ */ Object.create(null);
Tn.open = "0";
Tn.close = "1";
Tn.ping = "2";
Tn.pong = "3";
Tn.message = "4";
Tn.upgrade = "5";
Tn.noop = "6";
const hi = /* @__PURE__ */ Object.create(null);
Object.keys(Tn).forEach((e) => {
  hi[Tn[e]] = e;
});
const Vo = { type: "error", data: "parser error" }, Ru = typeof Blob == "function" || typeof Blob < "u" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]", Iu = typeof ArrayBuffer == "function", Lu = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e && e.buffer instanceof ArrayBuffer, Aa = ({ type: e, data: t }, n, s) => Ru && t instanceof Blob ? n ? s(t) : Zl(t, s) : Iu && (t instanceof ArrayBuffer || Lu(t)) ? n ? s(t) : Zl(new Blob([t]), s) : s(Tn[e] + (t || "")), Zl = (e, t) => {
  const n = new FileReader();
  return n.onload = function() {
    const s = n.result.split(",")[1];
    t("b" + (s || ""));
  }, n.readAsDataURL(e);
};
function Jl(e) {
  return e instanceof Uint8Array ? e : e instanceof ArrayBuffer ? new Uint8Array(e) : new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
}
let wo;
function Mg(e, t) {
  if (Ru && e.data instanceof Blob)
    return e.data.arrayBuffer().then(Jl).then(t);
  if (Iu && (e.data instanceof ArrayBuffer || Lu(e.data)))
    return t(Jl(e.data));
  Aa(e, !1, (n) => {
    wo || (wo = new TextEncoder()), t(wo.encode(n));
  });
}
const Ql = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", wr = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (let e = 0; e < Ql.length; e++)
  wr[Ql.charCodeAt(e)] = e;
const Dg = (e) => {
  let t = e.length * 0.75, n = e.length, s, r = 0, i, o, a, l;
  e[e.length - 1] === "=" && (t--, e[e.length - 2] === "=" && t--);
  const p = new ArrayBuffer(t), c = new Uint8Array(p);
  for (s = 0; s < n; s += 4)
    i = wr[e.charCodeAt(s)], o = wr[e.charCodeAt(s + 1)], a = wr[e.charCodeAt(s + 2)], l = wr[e.charCodeAt(s + 3)], c[r++] = i << 2 | o >> 4, c[r++] = (o & 15) << 4 | a >> 2, c[r++] = (a & 3) << 6 | l & 63;
  return p;
}, Fg = typeof ArrayBuffer == "function", Sa = (e, t) => {
  if (typeof e != "string")
    return {
      type: "message",
      data: Ou(e, t)
    };
  const n = e.charAt(0);
  return n === "b" ? {
    type: "message",
    data: $g(e.substring(1), t)
  } : hi[n] ? e.length > 1 ? {
    type: hi[n],
    data: e.substring(1)
  } : {
    type: hi[n]
  } : Vo;
}, $g = (e, t) => {
  if (Fg) {
    const n = Dg(e);
    return Ou(n, t);
  } else
    return { base64: !0, data: e };
}, Ou = (e, t) => {
  switch (t) {
    case "blob":
      return e instanceof Blob ? e : new Blob([e]);
    case "arraybuffer":
    default:
      return e instanceof ArrayBuffer ? e : e.buffer;
  }
}, Nu = "", Bg = (e, t) => {
  const n = e.length, s = new Array(n);
  let r = 0;
  e.forEach((i, o) => {
    Aa(i, !1, (a) => {
      s[o] = a, ++r === n && t(s.join(Nu));
    });
  });
}, Ug = (e, t) => {
  const n = e.split(Nu), s = [];
  for (let r = 0; r < n.length; r++) {
    const i = Sa(n[r], t);
    if (s.push(i), i.type === "error")
      break;
  }
  return s;
};
function zg() {
  return new TransformStream({
    transform(e, t) {
      Mg(e, (n) => {
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
let ko;
function ti(e) {
  return e.reduce((t, n) => t + n.length, 0);
}
function ni(e, t) {
  if (e[0].length === t)
    return e.shift();
  const n = new Uint8Array(t);
  let s = 0;
  for (let r = 0; r < t; r++)
    n[r] = e[0][s++], s === e[0].length && (e.shift(), s = 0);
  return e.length && s < e[0].length && (e[0] = e[0].slice(s)), n;
}
function Hg(e, t) {
  ko || (ko = new TextDecoder());
  const n = [];
  let s = 0, r = -1, i = !1;
  return new TransformStream({
    transform(o, a) {
      for (n.push(o); ; ) {
        if (s === 0) {
          if (ti(n) < 1)
            break;
          const l = ni(n, 1);
          i = (l[0] & 128) === 128, r = l[0] & 127, r < 126 ? s = 3 : r === 126 ? s = 1 : s = 2;
        } else if (s === 1) {
          if (ti(n) < 2)
            break;
          const l = ni(n, 2);
          r = new DataView(l.buffer, l.byteOffset, l.length).getUint16(0), s = 3;
        } else if (s === 2) {
          if (ti(n) < 8)
            break;
          const l = ni(n, 8), p = new DataView(l.buffer, l.byteOffset, l.length), c = p.getUint32(0);
          if (c > Math.pow(2, 21) - 1) {
            a.enqueue(Vo);
            break;
          }
          r = c * Math.pow(2, 32) + p.getUint32(4), s = 3;
        } else {
          if (ti(n) < r)
            break;
          const l = ni(n, r);
          a.enqueue(Sa(i ? l : ko.decode(l), t)), s = 0;
        }
        if (r === 0 || r > e) {
          a.enqueue(Vo);
          break;
        }
      }
    }
  });
}
const Pu = 4;
function ht(e) {
  if (e) return Wg(e);
}
function Wg(e) {
  for (var t in ht.prototype)
    e[t] = ht.prototype[t];
  return e;
}
ht.prototype.on = ht.prototype.addEventListener = function(e, t) {
  return this._callbacks = this._callbacks || {}, (this._callbacks["$" + e] = this._callbacks["$" + e] || []).push(t), this;
};
ht.prototype.once = function(e, t) {
  function n() {
    this.off(e, n), t.apply(this, arguments);
  }
  return n.fn = t, this.on(e, n), this;
};
ht.prototype.off = ht.prototype.removeListener = ht.prototype.removeAllListeners = ht.prototype.removeEventListener = function(e, t) {
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
ht.prototype.emit = function(e) {
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
ht.prototype.emitReserved = ht.prototype.emit;
ht.prototype.listeners = function(e) {
  return this._callbacks = this._callbacks || {}, this._callbacks["$" + e] || [];
};
ht.prototype.hasListeners = function(e) {
  return !!this.listeners(e).length;
};
const ji = typeof Promise == "function" && typeof Promise.resolve == "function" ? (t) => Promise.resolve().then(t) : (t, n) => n(t, 0), tn = typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")(), qg = "arraybuffer";
function Mu(e, ...t) {
  return t.reduce((n, s) => (e.hasOwnProperty(s) && (n[s] = e[s]), n), {});
}
const jg = tn.setTimeout, Vg = tn.clearTimeout;
function Vi(e, t) {
  t.useNativeTimers ? (e.setTimeoutFn = jg.bind(tn), e.clearTimeoutFn = Vg.bind(tn)) : (e.setTimeoutFn = tn.setTimeout.bind(tn), e.clearTimeoutFn = tn.clearTimeout.bind(tn));
}
const Kg = 1.33;
function Gg(e) {
  return typeof e == "string" ? Yg(e) : Math.ceil((e.byteLength || e.size) * Kg);
}
function Yg(e) {
  let t = 0, n = 0;
  for (let s = 0, r = e.length; s < r; s++)
    t = e.charCodeAt(s), t < 128 ? n += 1 : t < 2048 ? n += 2 : t < 55296 || t >= 57344 ? n += 3 : (s++, n += 4);
  return n;
}
function Du() {
  return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
}
function Xg(e) {
  let t = "";
  for (let n in e)
    e.hasOwnProperty(n) && (t.length && (t += "&"), t += encodeURIComponent(n) + "=" + encodeURIComponent(e[n]));
  return t;
}
function Zg(e) {
  let t = {}, n = e.split("&");
  for (let s = 0, r = n.length; s < r; s++) {
    let i = n[s].split("=");
    t[decodeURIComponent(i[0])] = decodeURIComponent(i[1]);
  }
  return t;
}
class Jg extends Error {
  constructor(t, n, s) {
    super(t), this.description = n, this.context = s, this.type = "TransportError";
  }
}
class Ea extends ht {
  /**
   * Transport abstract constructor.
   *
   * @param {Object} opts - options
   * @protected
   */
  constructor(t) {
    super(), this.writable = !1, Vi(this, t), this.opts = t, this.query = t.query, this.socket = t.socket, this.supportsBinary = !t.forceBase64;
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
    return super.emitReserved("error", new Jg(t, n, s)), this;
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
    const n = Sa(t, this.socket.binaryType);
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
    const n = Xg(t);
    return n.length ? "?" + n : "";
  }
}
class Qg extends Ea {
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
    Ug(t, this.socket.binaryType).forEach(n), this.readyState !== "closed" && (this._polling = !1, this.emitReserved("pollComplete"), this.readyState === "open" && this._poll());
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
    this.writable = !1, Bg(t, (n) => {
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
    return this.opts.timestampRequests !== !1 && (n[this.opts.timestampParam] = Du()), !this.supportsBinary && !n.sid && (n.b64 = 1), this.createUri(t, n);
  }
}
let Fu = !1;
try {
  Fu = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest();
} catch {
}
const em = Fu;
function tm() {
}
class nm extends Qg {
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
class wn extends ht {
  /**
   * Request constructor
   *
   * @param {Object} options
   * @package
   */
  constructor(t, n, s) {
    super(), this.createRequest = t, Vi(this, s), this._opts = s, this._method = s.method || "GET", this._uri = n, this._data = s.data !== void 0 ? s.data : null, this._create();
  }
  /**
   * Creates the XHR object and sends the request.
   *
   * @private
   */
  _create() {
    var t;
    const n = Mu(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
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
    typeof document < "u" && (this._index = wn.requestsCount++, wn.requests[this._index] = this);
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
      if (this._xhr.onreadystatechange = tm, t)
        try {
          this._xhr.abort();
        } catch {
        }
      typeof document < "u" && delete wn.requests[this._index], this._xhr = null;
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
wn.requestsCount = 0;
wn.requests = {};
if (typeof document < "u") {
  if (typeof attachEvent == "function")
    attachEvent("onunload", ec);
  else if (typeof addEventListener == "function") {
    const e = "onpagehide" in tn ? "pagehide" : "unload";
    addEventListener(e, ec, !1);
  }
}
function ec() {
  for (let e in wn.requests)
    wn.requests.hasOwnProperty(e) && wn.requests[e].abort();
}
const sm = function() {
  const e = $u({
    xdomain: !1
  });
  return e && e.responseType !== null;
}();
class rm extends nm {
  constructor(t) {
    super(t);
    const n = t && t.forceBase64;
    this.supportsBinary = sm && !n;
  }
  request(t = {}) {
    return Object.assign(t, { xd: this.xd }, this.opts), new wn($u, this.uri(), t);
  }
}
function $u(e) {
  const t = e.xdomain;
  try {
    if (typeof XMLHttpRequest < "u" && (!t || em))
      return new XMLHttpRequest();
  } catch {
  }
  if (!t)
    try {
      return new tn[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
    } catch {
    }
}
const Bu = typeof navigator < "u" && typeof navigator.product == "string" && navigator.product.toLowerCase() === "reactnative";
class im extends Ea {
  get name() {
    return "websocket";
  }
  doOpen() {
    const t = this.uri(), n = this.opts.protocols, s = Bu ? {} : Mu(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
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
      Aa(s, this.supportsBinary, (i) => {
        try {
          this.doWrite(s, i);
        } catch {
        }
        r && ji(() => {
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
    return this.opts.timestampRequests && (n[this.opts.timestampParam] = Du()), this.supportsBinary || (n.b64 = 1), this.createUri(t, n);
  }
}
const To = tn.WebSocket || tn.MozWebSocket;
class om extends im {
  createSocket(t, n, s) {
    return Bu ? new To(t, n, s) : n ? new To(t, n) : new To(t);
  }
  doWrite(t, n) {
    this.ws.send(n);
  }
}
class am extends Ea {
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
        const n = Hg(Number.MAX_SAFE_INTEGER, this.socket.binaryType), s = t.readable.pipeThrough(n).getReader(), r = zg();
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
        r && ji(() => {
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
const lm = {
  websocket: om,
  webtransport: am,
  polling: rm
}, cm = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/, um = [
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
function Ko(e) {
  if (e.length > 8e3)
    throw "URI too long";
  const t = e, n = e.indexOf("["), s = e.indexOf("]");
  n != -1 && s != -1 && (e = e.substring(0, n) + e.substring(n, s).replace(/:/g, ";") + e.substring(s, e.length));
  let r = cm.exec(e || ""), i = {}, o = 14;
  for (; o--; )
    i[um[o]] = r[o] || "";
  return n != -1 && s != -1 && (i.source = t, i.host = i.host.substring(1, i.host.length - 1).replace(/;/g, ":"), i.authority = i.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), i.ipv6uri = !0), i.pathNames = fm(i, i.path), i.queryKey = hm(i, i.query), i;
}
function fm(e, t) {
  const n = /\/{2,9}/g, s = t.replace(n, "/").split("/");
  return (t.slice(0, 1) == "/" || t.length === 0) && s.splice(0, 1), t.slice(-1) == "/" && s.splice(s.length - 1, 1), s;
}
function hm(e, t) {
  const n = {};
  return t.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function(s, r, i) {
    r && (n[r] = i);
  }), n;
}
const Go = typeof addEventListener == "function" && typeof removeEventListener == "function", di = [];
Go && addEventListener("offline", () => {
  di.forEach((e) => e());
}, !1);
class Gn extends ht {
  /**
   * Socket constructor.
   *
   * @param {String|Object} uri - uri or options
   * @param {Object} opts - options
   */
  constructor(t, n) {
    if (super(), this.binaryType = qg, this.writeBuffer = [], this._prevBufferLen = 0, this._pingInterval = -1, this._pingTimeout = -1, this._maxPayload = -1, this._pingTimeoutTime = 1 / 0, t && typeof t == "object" && (n = t, t = null), t) {
      const s = Ko(t);
      n.hostname = s.host, n.secure = s.protocol === "https" || s.protocol === "wss", n.port = s.port, s.query && (n.query = s.query);
    } else n.host && (n.hostname = Ko(n.host).host);
    Vi(this, n), this.secure = n.secure != null ? n.secure : typeof location < "u" && location.protocol === "https:", n.hostname && !n.port && (n.port = this.secure ? "443" : "80"), this.hostname = n.hostname || (typeof location < "u" ? location.hostname : "localhost"), this.port = n.port || (typeof location < "u" && location.port ? location.port : this.secure ? "443" : "80"), this.transports = [], this._transportsByName = {}, n.transports.forEach((s) => {
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
    }, n), this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : ""), typeof this.opts.query == "string" && (this.opts.query = Zg(this.opts.query)), Go && (this.opts.closeOnBeforeunload && (this._beforeunloadEventListener = () => {
      this.transport && (this.transport.removeAllListeners(), this.transport.close());
    }, addEventListener("beforeunload", this._beforeunloadEventListener, !1)), this.hostname !== "localhost" && (this._offlineEventListener = () => {
      this._onClose("transport close", {
        description: "network connection lost"
      });
    }, di.push(this._offlineEventListener))), this.opts.withCredentials && (this._cookieJar = void 0), this._open();
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
    n.EIO = Pu, n.transport = t, this.id && (n.sid = this.id);
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
    const t = this.opts.rememberUpgrade && Gn.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1 ? "websocket" : this.transports[0];
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
    this.readyState = "open", Gn.priorWebsocketSuccess = this.transport.name === "websocket", this.emitReserved("open"), this.flush();
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
      if (r && (n += Gg(r)), s > 0 && n > this._maxPayload)
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
    return t && (this._pingTimeoutTime = 0, ji(() => {
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
    if (Gn.priorWebsocketSuccess = !1, this.opts.tryAllTransports && this.transports.length > 1 && this.readyState === "opening")
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
      if (this.clearTimeoutFn(this._pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), Go && (this._beforeunloadEventListener && removeEventListener("beforeunload", this._beforeunloadEventListener, !1), this._offlineEventListener)) {
        const s = di.indexOf(this._offlineEventListener);
        s !== -1 && di.splice(s, 1);
      }
      this.readyState = "closed", this.id = null, this.emitReserved("close", t, n), this.writeBuffer = [], this._prevBufferLen = 0;
    }
  }
}
Gn.protocol = Pu;
class dm extends Gn {
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
    Gn.priorWebsocketSuccess = !1;
    const r = () => {
      s || (n.send([{ type: "ping", data: "probe" }]), n.once("packet", (b) => {
        if (!s)
          if (b.type === "pong" && b.data === "probe") {
            if (this.upgrading = !0, this.emitReserved("upgrading", n), !n)
              return;
            Gn.priorWebsocketSuccess = n.name === "websocket", this.transport.pause(() => {
              s || this.readyState !== "closed" && (c(), this.setTransport(n), n.send([{ type: "upgrade" }]), this.emitReserved("upgrade", n), n = null, this.upgrading = !1, this.flush());
            });
          } else {
            const w = new Error("probe error");
            w.transport = n.name, this.emitReserved("upgradeError", w);
          }
      }));
    };
    function i() {
      s || (s = !0, c(), n.close(), n = null);
    }
    const o = (b) => {
      const w = new Error("probe error: " + b);
      w.transport = n.name, i(), this.emitReserved("upgradeError", w);
    };
    function a() {
      o("transport closed");
    }
    function l() {
      o("socket closed");
    }
    function p(b) {
      n && b.name !== n.name && i();
    }
    const c = () => {
      n.removeListener("open", r), n.removeListener("error", o), n.removeListener("close", a), this.off("close", l), this.off("upgrading", p);
    };
    n.once("open", r), n.once("error", o), n.once("close", a), this.once("close", l), this.once("upgrading", p), this._upgrades.indexOf("webtransport") !== -1 && t !== "webtransport" ? this.setTimeoutFn(() => {
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
let pm = class extends dm {
  constructor(t, n = {}) {
    const s = typeof t == "object", r = s ? { ...t } : { ...n };
    (!r.transports || r.transports && typeof r.transports[0] == "string") && (r.transports = (r.transports || ["polling", "websocket", "webtransport"]).map((i) => lm[i]).filter((i) => !!i)), super(s ? r : t, r);
  }
};
function gm(e, t = "", n) {
  let s = e;
  n = n || typeof location < "u" && location, e == null && (e = n.protocol + "//" + n.host), typeof e == "string" && (e.charAt(0) === "/" && (e.charAt(1) === "/" ? e = n.protocol + e : e = n.host + e), /^(https?|wss?):\/\//.test(e) || (typeof n < "u" ? e = n.protocol + "//" + e : e = "https://" + e), s = Ko(e)), s.port || (/^(http|ws)$/.test(s.protocol) ? s.port = "80" : /^(http|ws)s$/.test(s.protocol) && (s.port = "443")), s.path = s.path || "/";
  const i = s.host.indexOf(":") !== -1 ? "[" + s.host + "]" : s.host;
  return s.id = s.protocol + "://" + i + ":" + s.port + t, s.href = s.protocol + "://" + i + (n && n.port === s.port ? "" : ":" + s.port), s;
}
const mm = typeof ArrayBuffer == "function", _m = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e.buffer instanceof ArrayBuffer, Uu = Object.prototype.toString, ym = typeof Blob == "function" || typeof Blob < "u" && Uu.call(Blob) === "[object BlobConstructor]", vm = typeof File == "function" || typeof File < "u" && Uu.call(File) === "[object FileConstructor]";
function Ca(e) {
  return mm && (e instanceof ArrayBuffer || _m(e)) || ym && e instanceof Blob || vm && e instanceof File;
}
function pi(e, t) {
  if (!e || typeof e != "object")
    return !1;
  if (Array.isArray(e)) {
    for (let n = 0, s = e.length; n < s; n++)
      if (pi(e[n]))
        return !0;
    return !1;
  }
  if (Ca(e))
    return !0;
  if (e.toJSON && typeof e.toJSON == "function" && arguments.length === 1)
    return pi(e.toJSON(), !0);
  for (const n in e)
    if (Object.prototype.hasOwnProperty.call(e, n) && pi(e[n]))
      return !0;
  return !1;
}
function bm(e) {
  const t = [], n = e.data, s = e;
  return s.data = gi(n, t), s.attachments = t.length, { packet: s, buffers: t };
}
function gi(e, t, n) {
  if (!e)
    return e;
  if (Ca(e)) {
    const s = { _placeholder: !0, num: t.length };
    return t.push(e), s;
  } else if (Array.isArray(e)) {
    const s = new Array(e.length);
    for (let r = 0; r < e.length; r++)
      s[r] = gi(e[r], t);
    return s;
  } else if (typeof e == "object" && !(e instanceof Date)) {
    if (e.toJSON && typeof e.toJSON == "function" && !n)
      return gi(e.toJSON(), t, !0);
    const s = {};
    for (const r in e)
      Object.prototype.hasOwnProperty.call(e, r) && (s[r] = gi(e[r], t));
    return s;
  }
  return e;
}
function wm(e, t) {
  return e.data = Yo(e.data, t), delete e.attachments, e;
}
function Yo(e, t) {
  if (!e)
    return e;
  if (e && e._placeholder === !0) {
    if (typeof e.num == "number" && e.num >= 0 && e.num < t.length)
      return t[e.num];
    throw new Error("illegal attachments");
  } else if (Array.isArray(e))
    for (let n = 0; n < e.length; n++)
      e[n] = Yo(e[n], t);
  else if (typeof e == "object")
    for (const n in e)
      Object.prototype.hasOwnProperty.call(e, n) && (e[n] = Yo(e[n], t));
  return e;
}
const km = [
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
class Tm {
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
    return (t.type === Pe.EVENT || t.type === Pe.ACK) && pi(t) ? this.encodeAsBinary({
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
    const n = bm(t), s = this.encodeAsString(n.packet), r = n.buffers;
    return r.unshift(s), r;
  }
}
class Ra extends ht {
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
      s || n.type === Pe.BINARY_ACK ? (n.type = s ? Pe.EVENT : Pe.ACK, this.reconstructor = new xm(n)) : super.emitReserved("decoded", n);
    } else if (Ca(t) || t.base64)
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
      if (!Am(a) || a < 1)
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
      if (Ra.isPayloadValid(s.type, i))
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
        return tc(n);
      case Pe.DISCONNECT:
        return n === void 0;
      case Pe.CONNECT_ERROR:
        return typeof n == "string" || tc(n);
      case Pe.EVENT:
      case Pe.BINARY_EVENT:
        return Array.isArray(n) && (typeof n[0] == "number" || typeof n[0] == "string" && km.indexOf(n[0]) === -1);
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
class xm {
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
      const n = wm(this.reconPack, this.buffers);
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
const Am = Number.isInteger || function(e) {
  return typeof e == "number" && isFinite(e) && Math.floor(e) === e;
};
function tc(e) {
  return Object.prototype.toString.call(e) === "[object Object]";
}
const Sm = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Decoder: Ra,
  Encoder: Tm,
  get PacketType() {
    return Pe;
  }
}, Symbol.toStringTag, { value: "Module" }));
function ln(e, t, n) {
  return e.on(t, n), function() {
    e.off(t, n);
  };
}
const Em = Object.freeze({
  connect: 1,
  connect_error: 1,
  disconnect: 1,
  disconnecting: 1,
  // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
  newListener: 1,
  removeListener: 1
});
class zu extends ht {
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
      ln(t, "open", this.onopen.bind(this)),
      ln(t, "packet", this.onpacket.bind(this)),
      ln(t, "error", this.onerror.bind(this)),
      ln(t, "close", this.onclose.bind(this))
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
    if (Em.hasOwnProperty(t))
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
function Vs(e) {
  e = e || {}, this.ms = e.min || 100, this.max = e.max || 1e4, this.factor = e.factor || 2, this.jitter = e.jitter > 0 && e.jitter <= 1 ? e.jitter : 0, this.attempts = 0;
}
Vs.prototype.duration = function() {
  var e = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var t = Math.random(), n = Math.floor(t * this.jitter * e);
    e = (Math.floor(t * 10) & 1) == 0 ? e - n : e + n;
  }
  return Math.min(e, this.max) | 0;
};
Vs.prototype.reset = function() {
  this.attempts = 0;
};
Vs.prototype.setMin = function(e) {
  this.ms = e;
};
Vs.prototype.setMax = function(e) {
  this.max = e;
};
Vs.prototype.setJitter = function(e) {
  this.jitter = e;
};
class Xo extends ht {
  constructor(t, n) {
    var s;
    super(), this.nsps = {}, this.subs = [], t && typeof t == "object" && (n = t, t = void 0), n = n || {}, n.path = n.path || "/socket.io", this.opts = n, Vi(this, n), this.reconnection(n.reconnection !== !1), this.reconnectionAttempts(n.reconnectionAttempts || 1 / 0), this.reconnectionDelay(n.reconnectionDelay || 1e3), this.reconnectionDelayMax(n.reconnectionDelayMax || 5e3), this.randomizationFactor((s = n.randomizationFactor) !== null && s !== void 0 ? s : 0.5), this.backoff = new Vs({
      min: this.reconnectionDelay(),
      max: this.reconnectionDelayMax(),
      jitter: this.randomizationFactor()
    }), this.timeout(n.timeout == null ? 2e4 : n.timeout), this._readyState = "closed", this.uri = t;
    const r = n.parser || Sm;
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
    this.engine = new pm(this.uri, this.opts);
    const n = this.engine, s = this;
    this._readyState = "opening", this.skipReconnect = !1;
    const r = ln(n, "open", function() {
      s.onopen(), t && t();
    }), i = (a) => {
      this.cleanup(), this._readyState = "closed", this.emitReserved("error", a), t ? t(a) : this.maybeReconnectOnOpen();
    }, o = ln(n, "error", i);
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
      ln(t, "ping", this.onping.bind(this)),
      ln(t, "data", this.ondata.bind(this)),
      ln(t, "error", this.onerror.bind(this)),
      ln(t, "close", this.onclose.bind(this)),
      // @ts-ignore
      ln(this.decoder, "decoded", this.ondecoded.bind(this))
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
    ji(() => {
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
    return s ? this._autoConnect && !s.active && s.connect() : (s = new zu(this, t, n), this.nsps[t] = s), s;
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
const _r = {};
function mi(e, t) {
  typeof e == "object" && (t = e, e = void 0), t = t || {};
  const n = gm(e, t.path || "/socket.io"), s = n.source, r = n.id, i = n.path, o = _r[r] && i in _r[r].nsps, a = t.forceNew || t["force new connection"] || t.multiplex === !1 || o;
  let l;
  return a ? l = new Xo(s, t) : (_r[r] || (_r[r] = new Xo(s, t)), l = _r[r]), n.query && !t.query && (t.query = n.queryKey), l.socket(n.path, t);
}
Object.assign(mi, {
  Manager: Xo,
  Socket: zu,
  io: mi,
  connect: mi
});
const Cm = 5e3;
function Rm() {
  const e = le([]), t = le(!1), n = le(""), s = le(!1), r = le(!1), i = le(!1), o = le("connecting"), a = le(0), l = 5, p = le({}), c = le(null), b = le("");
  let w = null;
  const H = 6e4, L = () => {
    t.value = !1, w && (clearTimeout(w), w = null);
  }, K = () => {
    t.value = !0, w && clearTimeout(w), w = setTimeout(L, H);
  };
  let F = null;
  const re = 1e3, ce = 15e3;
  let pe = null;
  const I = /* @__PURE__ */ new Set(["ai_config_missing"]);
  let P = !1;
  const Y = () => {
    pe && (clearTimeout(pe), pe = null);
  }, J = () => {
    if (pe || P) return;
    const k = Math.min(
      re * 2 ** Math.max(0, a.value - 1),
      ce
    );
    pe = setTimeout(() => {
      pe = null, F == null || F.connect();
    }, k);
  };
  let _e = null, Ce = null, be = null, Be = null, we = null, Xe, qe;
  const rt = (k) => {
    Xe = k, k && F != null && F.connected && F.emit("refresh_token", { conversation_token: k });
  }, fe = (k) => {
    qe = k;
  }, ke = () => {
    var $;
    const k = Xe || localStorage.getItem("ctid"), R = {};
    k && (R.conversation_token = k), qe && (R.widget_id = qe);
    try {
      R.page_url = window.parent !== window && (($ = window.parent.location) != null && $.href) ? window.parent.location.href : document.referrer || window.location.href;
    } catch {
      R.page_url = document.referrer || "";
    }
    return R;
  }, ge = (k) => (F = mi(`${js.WS_URL}/widget`, {
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
    auth: (R) => R(ke())
  }), F.on("connect", () => {
    o.value = "connected", Y(), a.value = 0;
  }), F.on("bot_typing", () => {
    K();
  }), F.on("disconnect", () => {
    L(), o.value === "connected" && (console.log("Socket disconnected, setting connection status to connecting"), o.value = "connecting");
  }), F.on("connect_error", () => {
    a.value++, console.error("Socket connection failed, attempt:", a.value), a.value >= l && (o.value = "failed"), F && !F.active && J();
  }), F.on("chat_response", (R) => {
    if (L(), R.session_id ? (console.log("Captured session_id from chat_response:", R.session_id), b.value = R.session_id) : console.warn("No session_id in chat_response data:", R), R.type === "agent_message") {
      const $ = {
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
      R.attachments && Array.isArray(R.attachments) && ($.id = R.message_id, $.attachments = R.attachments.map((V, X) => ({
        id: R.message_id * 1e3 + X,
        filename: V.filename,
        file_url: V.file_url,
        content_type: V.content_type,
        file_size: V.file_size
      }))), e.value.push($);
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
    }), p.value = {
      ...p.value,
      human_agent_name: R.user_name,
      human_agent_profile_pic: R.profile_picture
    }, L(), _e && _e(R);
  }), F.on("session_initialized", (R) => {
    R.session_id && (b.value = R.session_id, we = {
      session_id: R.session_id,
      authenticated: !!R.authenticated,
      created: !!R.created
    }, Be == null || Be(we));
  }), F.on("error", Se), F.on("chat_history", gt), F.on("rating_submitted", xt), F.on("display_form", At), F.on("form_submitted", St), F.on("workflow_state", Ft), F.on("workflow_proceeded", un), F), Ze = async () => {
    try {
      return o.value = "connecting", a.value = 0, L(), Y(), P = !1, F && (F.removeAllListeners(), F.disconnect(), F = null), F = ge(""), new Promise((k) => {
        F == null || F.on("connect", () => {
          k(!0);
        }), F == null || F.on("connect_error", () => {
          a.value >= l && k(!1);
        });
      });
    } catch (k) {
      return console.error("Socket initialization failed:", k), o.value = "failed", !1;
    }
  }, xe = () => (F && F.disconnect(), Ze()), st = (k) => {
    _e = k;
  }, Re = (k) => {
    Be = k, we && k(we);
  }, ft = (k) => {
    Ce = k;
  }, Ut = (k) => {
    be = k;
  }, Se = (k) => {
    L(), n.value = Cd(k), s.value = !0, I.has(k == null ? void 0 : k.type) && (P = !0, Y()), setTimeout(() => {
      s.value = !1, n.value = "";
    }, 5e3);
  }, gt = (k) => {
    if (k.type === "chat_history" && Array.isArray(k.messages)) {
      const R = k.messages.map(($) => {
        var X, he;
        const V = {
          message: $.message,
          message_type: $.message_type,
          created_at: $.created_at,
          session_id: "",
          agent_name: $.agent_name || "",
          user_name: $.user_name || "",
          attributes: $.attributes || {},
          attachments: $.attachments || []
          // Include attachments
        };
        return Array.isArray((X = $.attributes) == null ? void 0 : X.sources) && $.attributes.sources.length && (V.sources = $.attributes.sources), (he = $.attributes) != null && he.shopify_output && typeof $.attributes.shopify_output == "object" ? {
          ...V,
          message_type: "product",
          shopify_output: $.attributes.shopify_output
        } : V;
      });
      e.value = [
        ...R.filter(
          ($) => !e.value.some(
            (V) => V.message === $.message && V.created_at === $.created_at
          )
        ),
        ...e.value
      ];
    }
  }, xt = (k) => {
    k.success && e.value.push({
      message: "Thank you for your feedback!",
      message_type: "system",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: ""
    });
  }, At = (k) => {
    var R;
    console.log("Form display handler in composable:", k), L(), c.value = k.form_data, console.log("Set currentForm in handleDisplayForm:", c.value), ((R = k.form_data) == null ? void 0 : R.form_full_screen) === !0 ? (console.log("Full screen form detected, triggering workflow state callback"), Ce && Ce({
      type: "form",
      form_data: k.form_data,
      session_id: k.session_id
    })) : e.value.push({
      message: "",
      message_type: "form",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: k.session_id,
      attributes: {
        form_data: k.form_data
      }
    });
  }, St = (k) => {
    console.log("Form submitted confirmation received, clearing currentForm"), c.value = null, k.success && console.log("Form submitted successfully");
  }, Ft = (k) => {
    console.log("Workflow state received in composable:", k), (k.type === "form" || k.type === "display_form") && (console.log("Setting currentForm from workflow state:", k.form_data), c.value = k.form_data), Ce && Ce(k);
  }, un = (k) => {
    console.log("Workflow proceeded in composable:", k), be && be(k);
  }, m = async (k, R) => {
    !F || !k || F.emit("submit_rating", {
      rating: k,
      feedback: R
    });
  }, y = async (k) => {
    var V;
    if (console.log("Submitting form in socket:", k), console.log("Current form in socket:", c.value), console.log("Socket in socket:", F), !F) {
      console.error("No socket available for form submission");
      return;
    }
    if (!k || Object.keys(k).length === 0) {
      console.error("No form data to submit");
      return;
    }
    const $ = ((V = c.value) == null ? void 0 : V.form_type) === "contact" ? "submit_contact_info" : "submit_form";
    console.log(`Emitting ${$} event with data:`, k), F.emit($, {
      form_data: k
    }), c.value = null;
  }, S = async () => {
    F && (console.log("Getting workflow state 12"), F.emit("get_workflow_state"));
  }, M = async () => {
    F && F.emit("proceed_workflow", {});
  }, B = async (k, R, $ = []) => {
    if (!F || !k.trim() && $.length === 0) return;
    const V = {
      message: k,
      message_type: "user",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: ""
    };
    $.length > 0 && (V.attachments = $.map((X, he) => {
      let ue = "";
      if (X.content_type.startsWith("image/")) {
        const oe = atob(X.content), Me = new Array(oe.length);
        for (let f = 0; f < oe.length; f++)
          Me[f] = oe.charCodeAt(f);
        const Le = new Uint8Array(Me), at = new Blob([Le], { type: X.content_type });
        ue = URL.createObjectURL(at);
      }
      return {
        id: Date.now() * 1e3 + he,
        // Temporary ID
        filename: X.filename,
        file_url: ue,
        // Temporary blob URL, will be replaced
        content_type: X.content_type,
        file_size: X.size,
        _isTemporary: !0
        // Flag to identify temporary attachments
      };
    })), e.value.push(V), F.emit("chat", {
      message: k,
      email: R,
      files: $
      // Send files with base64 content
    }), i.value = !0;
  }, O = () => {
    e.value = [], i.value = !1, b.value = "", L(), c.value = null;
  };
  return {
    messages: e,
    loading: t,
    errorMessage: n,
    showError: s,
    loadingHistory: r,
    hasStartedChat: i,
    connectionStatus: o,
    sendMessage: B,
    endChat: (k = "CUSTOMER_REQUEST") => new Promise((R) => {
      if (!F || !F.connected) {
        R(!1);
        return;
      }
      let $ = !1;
      const V = (oe) => {
        $ || ($ = !0, clearTimeout(ue), F == null || F.off("chat_ended", X), F == null || F.off("error", he), oe && O(), R(oe));
      }, X = () => V(!0), he = (oe) => {
        (oe == null ? void 0 : oe.type) === "end_chat_error" && V(!1);
      }, ue = setTimeout(() => V(!1), Cm);
      F.on("chat_ended", X), F.on("error", he), F.emit("end_chat", { reason: k });
    }),
    loadChatHistory: async () => {
      if (F)
        try {
          r.value = !0, F.emit("get_chat_history");
        } catch (k) {
          console.error("Failed to load chat history:", k);
        } finally {
          r.value = !1;
        }
    },
    connect: Ze,
    reconnect: xe,
    cleanup: () => {
      L(), Y(), F && (F.removeAllListeners(), F.disconnect(), F = null), _e = null, Ce = null, be = null;
    },
    humanAgent: p,
    onTakeover: st,
    onSessionState: Re,
    submitRating: m,
    currentForm: c,
    submitForm: y,
    getWorkflowState: S,
    proceedWorkflow: M,
    onWorkflowState: ft,
    onWorkflowProceeded: Ut,
    currentSessionId: b,
    setToken: rt,
    setWidgetId: fe
  };
}
function Im(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var xo = { exports: {} }, nc;
function Lm() {
  return nc || (nc = 1, function(e) {
    (function() {
      function t(f, _, N) {
        return f.call.apply(f.bind, arguments);
      }
      function n(f, _, N) {
        if (!f) throw Error();
        if (2 < arguments.length) {
          var C = Array.prototype.slice.call(arguments, 2);
          return function() {
            var U = Array.prototype.slice.call(arguments);
            return Array.prototype.unshift.apply(U, C), f.apply(_, U);
          };
        }
        return function() {
          return f.apply(_, arguments);
        };
      }
      function s(f, _, N) {
        return s = Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1 ? t : n, s.apply(null, arguments);
      }
      var r = Date.now || function() {
        return +/* @__PURE__ */ new Date();
      };
      function i(f, _) {
        this.a = f, this.o = _ || f, this.c = this.o.document;
      }
      var o = !!window.FontFace;
      function a(f, _, N, C) {
        if (_ = f.c.createElement(_), N) for (var U in N) N.hasOwnProperty(U) && (U == "style" ? _.style.cssText = N[U] : _.setAttribute(U, N[U]));
        return C && _.appendChild(f.c.createTextNode(C)), _;
      }
      function l(f, _, N) {
        f = f.c.getElementsByTagName(_)[0], f || (f = document.documentElement), f.insertBefore(N, f.lastChild);
      }
      function p(f) {
        f.parentNode && f.parentNode.removeChild(f);
      }
      function c(f, _, N) {
        _ = _ || [], N = N || [];
        for (var C = f.className.split(/\s+/), U = 0; U < _.length; U += 1) {
          for (var te = !1, se = 0; se < C.length; se += 1) if (_[U] === C[se]) {
            te = !0;
            break;
          }
          te || C.push(_[U]);
        }
        for (_ = [], U = 0; U < C.length; U += 1) {
          for (te = !1, se = 0; se < N.length; se += 1) if (C[U] === N[se]) {
            te = !0;
            break;
          }
          te || _.push(C[U]);
        }
        f.className = _.join(" ").replace(/\s+/g, " ").replace(/^\s+|\s+$/, "");
      }
      function b(f, _) {
        for (var N = f.className.split(/\s+/), C = 0, U = N.length; C < U; C++) if (N[C] == _) return !0;
        return !1;
      }
      function w(f) {
        return f.o.location.hostname || f.a.location.hostname;
      }
      function H(f, _, N) {
        function C() {
          ye && U && te && (ye(se), ye = null);
        }
        _ = a(f, "link", { rel: "stylesheet", href: _, media: "all" });
        var U = !1, te = !0, se = null, ye = N || null;
        o ? (_.onload = function() {
          U = !0, C();
        }, _.onerror = function() {
          U = !0, se = Error("Stylesheet failed to load"), C();
        }) : setTimeout(function() {
          U = !0, C();
        }, 0), l(f, "head", _);
      }
      function L(f, _, N, C) {
        var U = f.c.getElementsByTagName("head")[0];
        if (U) {
          var te = a(f, "script", { src: _ }), se = !1;
          return te.onload = te.onreadystatechange = function() {
            se || this.readyState && this.readyState != "loaded" && this.readyState != "complete" || (se = !0, N && N(null), te.onload = te.onreadystatechange = null, te.parentNode.tagName == "HEAD" && U.removeChild(te));
          }, U.appendChild(te), setTimeout(function() {
            se || (se = !0, N && N(Error("Script load timeout")));
          }, C || 5e3), te;
        }
        return null;
      }
      function K() {
        this.a = 0, this.c = null;
      }
      function F(f) {
        return f.a++, function() {
          f.a--, ce(f);
        };
      }
      function re(f, _) {
        f.c = _, ce(f);
      }
      function ce(f) {
        f.a == 0 && f.c && (f.c(), f.c = null);
      }
      function pe(f) {
        this.a = f || "-";
      }
      pe.prototype.c = function(f) {
        for (var _ = [], N = 0; N < arguments.length; N++) _.push(arguments[N].replace(/[\W_]+/g, "").toLowerCase());
        return _.join(this.a);
      };
      function I(f, _) {
        this.c = f, this.f = 4, this.a = "n";
        var N = (_ || "n4").match(/^([nio])([1-9])$/i);
        N && (this.a = N[1], this.f = parseInt(N[2], 10));
      }
      function P(f) {
        return _e(f) + " " + (f.f + "00") + " 300px " + Y(f.c);
      }
      function Y(f) {
        var _ = [];
        f = f.split(/,\s*/);
        for (var N = 0; N < f.length; N++) {
          var C = f[N].replace(/['"]/g, "");
          C.indexOf(" ") != -1 || /^\d/.test(C) ? _.push("'" + C + "'") : _.push(C);
        }
        return _.join(",");
      }
      function J(f) {
        return f.a + f.f;
      }
      function _e(f) {
        var _ = "normal";
        return f.a === "o" ? _ = "oblique" : f.a === "i" && (_ = "italic"), _;
      }
      function Ce(f) {
        var _ = 4, N = "n", C = null;
        return f && ((C = f.match(/(normal|oblique|italic)/i)) && C[1] && (N = C[1].substr(0, 1).toLowerCase()), (C = f.match(/([1-9]00|normal|bold)/i)) && C[1] && (/bold/i.test(C[1]) ? _ = 7 : /[1-9]00/.test(C[1]) && (_ = parseInt(C[1].substr(0, 1), 10)))), N + _;
      }
      function be(f, _) {
        this.c = f, this.f = f.o.document.documentElement, this.h = _, this.a = new pe("-"), this.j = _.events !== !1, this.g = _.classes !== !1;
      }
      function Be(f) {
        f.g && c(f.f, [f.a.c("wf", "loading")]), Xe(f, "loading");
      }
      function we(f) {
        if (f.g) {
          var _ = b(f.f, f.a.c("wf", "active")), N = [], C = [f.a.c("wf", "loading")];
          _ || N.push(f.a.c("wf", "inactive")), c(f.f, N, C);
        }
        Xe(f, "inactive");
      }
      function Xe(f, _, N) {
        f.j && f.h[_] && (N ? f.h[_](N.c, J(N)) : f.h[_]());
      }
      function qe() {
        this.c = {};
      }
      function rt(f, _, N) {
        var C = [], U;
        for (U in _) if (_.hasOwnProperty(U)) {
          var te = f.c[U];
          te && C.push(te(_[U], N));
        }
        return C;
      }
      function fe(f, _) {
        this.c = f, this.f = _, this.a = a(this.c, "span", { "aria-hidden": "true" }, this.f);
      }
      function ke(f) {
        l(f.c, "body", f.a);
      }
      function ge(f) {
        return "display:block;position:absolute;top:-9999px;left:-9999px;font-size:300px;width:auto;height:auto;line-height:normal;margin:0;padding:0;font-variant:normal;white-space:nowrap;font-family:" + Y(f.c) + ";" + ("font-style:" + _e(f) + ";font-weight:" + (f.f + "00") + ";");
      }
      function Ze(f, _, N, C, U, te) {
        this.g = f, this.j = _, this.a = C, this.c = N, this.f = U || 3e3, this.h = te || void 0;
      }
      Ze.prototype.start = function() {
        var f = this.c.o.document, _ = this, N = r(), C = new Promise(function(se, ye) {
          function Oe() {
            r() - N >= _.f ? ye() : f.fonts.load(P(_.a), _.h).then(function($e) {
              1 <= $e.length ? se() : setTimeout(Oe, 25);
            }, function() {
              ye();
            });
          }
          Oe();
        }), U = null, te = new Promise(function(se, ye) {
          U = setTimeout(ye, _.f);
        });
        Promise.race([te, C]).then(function() {
          U && (clearTimeout(U), U = null), _.g(_.a);
        }, function() {
          _.j(_.a);
        });
      };
      function xe(f, _, N, C, U, te, se) {
        this.v = f, this.B = _, this.c = N, this.a = C, this.s = se || "BESbswy", this.f = {}, this.w = U || 3e3, this.u = te || null, this.m = this.j = this.h = this.g = null, this.g = new fe(this.c, this.s), this.h = new fe(this.c, this.s), this.j = new fe(this.c, this.s), this.m = new fe(this.c, this.s), f = new I(this.a.c + ",serif", J(this.a)), f = ge(f), this.g.a.style.cssText = f, f = new I(this.a.c + ",sans-serif", J(this.a)), f = ge(f), this.h.a.style.cssText = f, f = new I("serif", J(this.a)), f = ge(f), this.j.a.style.cssText = f, f = new I("sans-serif", J(this.a)), f = ge(f), this.m.a.style.cssText = f, ke(this.g), ke(this.h), ke(this.j), ke(this.m);
      }
      var st = { D: "serif", C: "sans-serif" }, Re = null;
      function ft() {
        if (Re === null) {
          var f = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent);
          Re = !!f && (536 > parseInt(f[1], 10) || parseInt(f[1], 10) === 536 && 11 >= parseInt(f[2], 10));
        }
        return Re;
      }
      xe.prototype.start = function() {
        this.f.serif = this.j.a.offsetWidth, this.f["sans-serif"] = this.m.a.offsetWidth, this.A = r(), Se(this);
      };
      function Ut(f, _, N) {
        for (var C in st) if (st.hasOwnProperty(C) && _ === f.f[st[C]] && N === f.f[st[C]]) return !0;
        return !1;
      }
      function Se(f) {
        var _ = f.g.a.offsetWidth, N = f.h.a.offsetWidth, C;
        (C = _ === f.f.serif && N === f.f["sans-serif"]) || (C = ft() && Ut(f, _, N)), C ? r() - f.A >= f.w ? ft() && Ut(f, _, N) && (f.u === null || f.u.hasOwnProperty(f.a.c)) ? xt(f, f.v) : xt(f, f.B) : gt(f) : xt(f, f.v);
      }
      function gt(f) {
        setTimeout(s(function() {
          Se(this);
        }, f), 50);
      }
      function xt(f, _) {
        setTimeout(s(function() {
          p(this.g.a), p(this.h.a), p(this.j.a), p(this.m.a), _(this.a);
        }, f), 0);
      }
      function At(f, _, N) {
        this.c = f, this.a = _, this.f = 0, this.m = this.j = !1, this.s = N;
      }
      var St = null;
      At.prototype.g = function(f) {
        var _ = this.a;
        _.g && c(_.f, [_.a.c("wf", f.c, J(f).toString(), "active")], [_.a.c("wf", f.c, J(f).toString(), "loading"), _.a.c("wf", f.c, J(f).toString(), "inactive")]), Xe(_, "fontactive", f), this.m = !0, Ft(this);
      }, At.prototype.h = function(f) {
        var _ = this.a;
        if (_.g) {
          var N = b(_.f, _.a.c("wf", f.c, J(f).toString(), "active")), C = [], U = [_.a.c("wf", f.c, J(f).toString(), "loading")];
          N || C.push(_.a.c("wf", f.c, J(f).toString(), "inactive")), c(_.f, C, U);
        }
        Xe(_, "fontinactive", f), Ft(this);
      };
      function Ft(f) {
        --f.f == 0 && f.j && (f.m ? (f = f.a, f.g && c(f.f, [f.a.c("wf", "active")], [f.a.c("wf", "loading"), f.a.c("wf", "inactive")]), Xe(f, "active")) : we(f.a));
      }
      function un(f) {
        this.j = f, this.a = new qe(), this.h = 0, this.f = this.g = !0;
      }
      un.prototype.load = function(f) {
        this.c = new i(this.j, f.context || this.j), this.g = f.events !== !1, this.f = f.classes !== !1, y(this, new be(this.c, f), f);
      };
      function m(f, _, N, C, U) {
        var te = --f.h == 0;
        (f.f || f.g) && setTimeout(function() {
          var se = U || null, ye = C || null || {};
          if (N.length === 0 && te) we(_.a);
          else {
            _.f += N.length, te && (_.j = te);
            var Oe, $e = [];
            for (Oe = 0; Oe < N.length; Oe++) {
              var De = N[Oe], it = ye[De.c], mt = _.a, Vt = De;
              if (mt.g && c(mt.f, [mt.a.c("wf", Vt.c, J(Vt).toString(), "loading")]), Xe(mt, "fontloading", Vt), mt = null, St === null) if (window.FontFace) {
                var Vt = /Gecko.*Firefox\/(\d+)/.exec(window.navigator.userAgent), es = /OS X.*Version\/10\..*Safari/.exec(window.navigator.userAgent) && /Apple/.exec(window.navigator.vendor);
                St = Vt ? 42 < parseInt(Vt[1], 10) : !es;
              } else St = !1;
              St ? mt = new Ze(s(_.g, _), s(_.h, _), _.c, De, _.s, it) : mt = new xe(s(_.g, _), s(_.h, _), _.c, De, _.s, se, it), $e.push(mt);
            }
            for (Oe = 0; Oe < $e.length; Oe++) $e[Oe].start();
          }
        }, 0);
      }
      function y(f, _, N) {
        var U = [], C = N.timeout;
        Be(_);
        var U = rt(f.a, N, f.c), te = new At(f.c, _, C);
        for (f.h = U.length, _ = 0, N = U.length; _ < N; _++) U[_].load(function(se, ye, Oe) {
          m(f, te, se, ye, Oe);
        });
      }
      function S(f, _) {
        this.c = f, this.a = _;
      }
      S.prototype.load = function(f) {
        function _() {
          if (te["__mti_fntLst" + C]) {
            var se = te["__mti_fntLst" + C](), ye = [], Oe;
            if (se) for (var $e = 0; $e < se.length; $e++) {
              var De = se[$e].fontfamily;
              se[$e].fontStyle != null && se[$e].fontWeight != null ? (Oe = se[$e].fontStyle + se[$e].fontWeight, ye.push(new I(De, Oe))) : ye.push(new I(De));
            }
            f(ye);
          } else setTimeout(function() {
            _();
          }, 50);
        }
        var N = this, C = N.a.projectId, U = N.a.version;
        if (C) {
          var te = N.c.o;
          L(this.c, (N.a.api || "https://fast.fonts.net/jsapi") + "/" + C + ".js" + (U ? "?v=" + U : ""), function(se) {
            se ? f([]) : (te["__MonotypeConfiguration__" + C] = function() {
              return N.a;
            }, _());
          }).id = "__MonotypeAPIScript__" + C;
        } else f([]);
      };
      function M(f, _) {
        this.c = f, this.a = _;
      }
      M.prototype.load = function(f) {
        var _, N, C = this.a.urls || [], U = this.a.families || [], te = this.a.testStrings || {}, se = new K();
        for (_ = 0, N = C.length; _ < N; _++) H(this.c, C[_], F(se));
        var ye = [];
        for (_ = 0, N = U.length; _ < N; _++) if (C = U[_].split(":"), C[1]) for (var Oe = C[1].split(","), $e = 0; $e < Oe.length; $e += 1) ye.push(new I(C[0], Oe[$e]));
        else ye.push(new I(C[0]));
        re(se, function() {
          f(ye, te);
        });
      };
      function B(f, _) {
        f ? this.c = f : this.c = O, this.a = [], this.f = [], this.g = _ || "";
      }
      var O = "https://fonts.googleapis.com/css";
      function G(f, _) {
        for (var N = _.length, C = 0; C < N; C++) {
          var U = _[C].split(":");
          U.length == 3 && f.f.push(U.pop());
          var te = "";
          U.length == 2 && U[1] != "" && (te = ":"), f.a.push(U.join(te));
        }
      }
      function W(f) {
        if (f.a.length == 0) throw Error("No fonts to load!");
        if (f.c.indexOf("kit=") != -1) return f.c;
        for (var _ = f.a.length, N = [], C = 0; C < _; C++) N.push(f.a[C].replace(/ /g, "+"));
        return _ = f.c + "?family=" + N.join("%7C"), 0 < f.f.length && (_ += "&subset=" + f.f.join(",")), 0 < f.g.length && (_ += "&text=" + encodeURIComponent(f.g)), _;
      }
      function j(f) {
        this.f = f, this.a = [], this.c = {};
      }
      var k = { latin: "BESbswy", "latin-ext": "çöüğş", cyrillic: "йяЖ", greek: "αβΣ", khmer: "កខគ", Hanuman: "កខគ" }, R = { thin: "1", extralight: "2", "extra-light": "2", ultralight: "2", "ultra-light": "2", light: "3", regular: "4", book: "4", medium: "5", "semi-bold": "6", semibold: "6", "demi-bold": "6", demibold: "6", bold: "7", "extra-bold": "8", extrabold: "8", "ultra-bold": "8", ultrabold: "8", black: "9", heavy: "9", l: "3", r: "4", b: "7" }, $ = { i: "i", italic: "i", n: "n", normal: "n" }, V = /^(thin|(?:(?:extra|ultra)-?)?light|regular|book|medium|(?:(?:semi|demi|extra|ultra)-?)?bold|black|heavy|l|r|b|[1-9]00)?(n|i|normal|italic)?$/;
      function X(f) {
        for (var _ = f.f.length, N = 0; N < _; N++) {
          var C = f.f[N].split(":"), U = C[0].replace(/\+/g, " "), te = ["n4"];
          if (2 <= C.length) {
            var se, ye = C[1];
            if (se = [], ye) for (var ye = ye.split(","), Oe = ye.length, $e = 0; $e < Oe; $e++) {
              var De;
              if (De = ye[$e], De.match(/^[\w-]+$/)) {
                var it = V.exec(De.toLowerCase());
                if (it == null) De = "";
                else {
                  if (De = it[2], De = De == null || De == "" ? "n" : $[De], it = it[1], it == null || it == "") it = "4";
                  else var mt = R[it], it = mt || (isNaN(it) ? "4" : it.substr(0, 1));
                  De = [De, it].join("");
                }
              } else De = "";
              De && se.push(De);
            }
            0 < se.length && (te = se), C.length == 3 && (C = C[2], se = [], C = C ? C.split(",") : se, 0 < C.length && (C = k[C[0]]) && (f.c[U] = C));
          }
          for (f.c[U] || (C = k[U]) && (f.c[U] = C), C = 0; C < te.length; C += 1) f.a.push(new I(U, te[C]));
        }
      }
      function he(f, _) {
        this.c = f, this.a = _;
      }
      var ue = { Arimo: !0, Cousine: !0, Tinos: !0 };
      he.prototype.load = function(f) {
        var _ = new K(), N = this.c, C = new B(this.a.api, this.a.text), U = this.a.families;
        G(C, U);
        var te = new j(U);
        X(te), H(N, W(C), F(_)), re(_, function() {
          f(te.a, te.c, ue);
        });
      };
      function oe(f, _) {
        this.c = f, this.a = _;
      }
      oe.prototype.load = function(f) {
        var _ = this.a.id, N = this.c.o;
        _ ? L(this.c, (this.a.api || "https://use.typekit.net") + "/" + _ + ".js", function(C) {
          if (C) f([]);
          else if (N.Typekit && N.Typekit.config && N.Typekit.config.fn) {
            C = N.Typekit.config.fn;
            for (var U = [], te = 0; te < C.length; te += 2) for (var se = C[te], ye = C[te + 1], Oe = 0; Oe < ye.length; Oe++) U.push(new I(se, ye[Oe]));
            try {
              N.Typekit.load({ events: !1, classes: !1, async: !0 });
            } catch {
            }
            f(U);
          }
        }, 2e3) : f([]);
      };
      function Me(f, _) {
        this.c = f, this.f = _, this.a = [];
      }
      Me.prototype.load = function(f) {
        var _ = this.f.id, N = this.c.o, C = this;
        _ ? (N.__webfontfontdeckmodule__ || (N.__webfontfontdeckmodule__ = {}), N.__webfontfontdeckmodule__[_] = function(U, te) {
          for (var se = 0, ye = te.fonts.length; se < ye; ++se) {
            var Oe = te.fonts[se];
            C.a.push(new I(Oe.name, Ce("font-weight:" + Oe.weight + ";font-style:" + Oe.style)));
          }
          f(C.a);
        }, L(this.c, (this.f.api || "https://f.fontdeck.com/s/css/js/") + w(this.c) + "/" + _ + ".js", function(U) {
          U && f([]);
        })) : f([]);
      };
      var Le = new un(window);
      Le.a.c.custom = function(f, _) {
        return new M(_, f);
      }, Le.a.c.fontdeck = function(f, _) {
        return new Me(_, f);
      }, Le.a.c.monotype = function(f, _) {
        return new S(_, f);
      }, Le.a.c.typekit = function(f, _) {
        return new oe(_, f);
      }, Le.a.c.google = function(f, _) {
        return new he(_, f);
      };
      var at = { load: s(Le.load, Le) };
      e.exports ? e.exports = at : (window.WebFont = at, window.WebFontConfig && Le.load(window.WebFontConfig));
    })();
  }(xo)), xo.exports;
}
var Om = Lm();
const Nm = /* @__PURE__ */ Im(Om), sc = [
  "Space Grotesk:400,500,600,700",
  "Instrument Sans:400,500,600",
  "JetBrains Mono:400,500,600"
], Pm = (e) => {
  const t = [...sc], n = (e == null ? void 0 : e.split(",")[0].trim().replace(/['"]/g, "")) || "", s = sc.some(
    (r) => r.toLowerCase().startsWith(n.toLowerCase())
  );
  n && !s && t.push(n), Nm.load({
    google: { families: t },
    active: () => {
      if (!e) return;
      const r = document.querySelector(".chat-container");
      r && (r.style.fontFamily = e.includes(",") ? e : `"${e}", system-ui, sans-serif`);
    }
  });
};
function Mm() {
  const e = le({}), t = le(""), n = (r) => {
    var i;
    e.value = r, r.photo_url && (e.value.photo_url = r.photo_url), Pm(r.font_family), Vn({
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
const Dm = 13, Fm = 24;
function $m(e, t) {
  const n = Di({}), s = [];
  let r = null;
  const i = typeof window < "u" && typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, o = (c) => {
    r || s.length === 0 || (r = setTimeout(a, c));
  }, a = () => {
    r = null;
    const c = s[0];
    if (c === void 0) return;
    const b = e.value[c], w = n[c], H = (b == null ? void 0 : b.message) ?? "";
    if (!w || !b) {
      s.shift(), o(0);
      return;
    }
    if (w.shown >= H.length) {
      w.done = !0, s.shift(), o(0);
      return;
    }
    w.shown += 1;
    const L = H[w.shown - 1];
    t == null || t(), o(L === " " ? Fm : Dm);
  };
  Nt(() => e.value.length, (c, b) => {
    b !== void 0 && c < b && (Object.keys(n).forEach((w) => {
      delete n[Number(w)];
    }), s.length = 0);
    for (let w = b ?? 0; w < c; w++) {
      const H = e.value[w];
      if (!H || !H.stream || w in n) continue;
      const L = H.message ?? "";
      i || !L ? n[w] = { shown: L.length, done: !0 } : (n[w] = { shown: 0, done: !1 }, s.push(w));
    }
    o(0);
  });
  const l = (c, b) => {
    const w = n[c];
    return w ? b.slice(0, w.shown) : b;
  }, p = (c) => {
    const b = n[c];
    return !!b && !b.done;
  };
  return Dr(() => {
    r && clearTimeout(r);
  }), { displayText: l, isStreaming: p };
}
function Bm(e) {
  const t = le(!0);
  let n = 0;
  const s = () => {
    Vn({ type: "UNREAD_COUNT", count: n });
  }, r = (i) => {
    var o;
    ((o = i == null ? void 0 : i.data) == null ? void 0 : o.type) === "WIDGET_VISIBILITY" && (t.value = !!i.data.open, t.value && n !== 0 && (n = 0, s()));
  };
  Nt(() => e.value.length, (i, o) => {
    if (i <= (o ?? 0) || t.value) return;
    const a = e.value[i - 1];
    a && (a.message_type === "bot" || a.message_type === "agent") && (n += 1, s());
  }), Bi(() => window.addEventListener("message", r)), Dr(() => window.removeEventListener("message", r));
}
const Ia = "ctid", Um = "identity_expired", rc = 0.8, zm = 720 * 60 * 1e3, Ao = 30 * 1e3, So = 1e3, Ws = (e) => {
  if (typeof e != "string") return e ? String(e) : null;
  const t = e.trim();
  return !t || t === "undefined" || t === "null" ? null : t;
}, Eo = (e) => {
  const t = Ws(e);
  if (!t) return null;
  const [, n] = t.split(".");
  if (!n) return null;
  try {
    const s = atob(n.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(s);
  } catch {
    return null;
  }
}, Hm = () => {
  try {
    return Ws(localStorage.getItem(Ia));
  } catch {
    return null;
  }
}, ic = (e) => {
  try {
    localStorage.setItem(Ia, e);
  } catch {
  }
}, Wm = () => {
  try {
    localStorage.removeItem(Ia);
  } catch {
  }
};
function qm(e = {}) {
  const t = le(null);
  let n = null, s = null;
  const r = () => {
    n && (clearTimeout(n), n = null);
  }, i = () => {
    const L = Eo(t.value);
    return L != null && L.exp ? Number(L.exp) - Math.floor(Date.now() / So) : null;
  }, o = () => {
    const L = Eo(t.value);
    if (!(L != null && L.exp)) return !1;
    const K = L.iat ? Number(L.exp) - Number(L.iat) : 0, F = i() ?? 0;
    return K <= 0 ? F <= 0 : F <= K * (1 - rc);
  }, a = (L, { persist: K = !0 } = {}) => {
    var re;
    const F = Ws(L);
    if (r(), t.value = F, !F) {
      Wm();
      return;
    }
    K && (ic(F), (re = e.onTokenChanged) == null || re.call(e, F)), c();
  }, l = async (L) => {
    if (!t.value || !L) return !1;
    if (s) return s;
    const K = t.value;
    return s = (async () => {
      var F, re;
      try {
        const ce = await fetch(`${js.API_URL}/refresh-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${K}`
          },
          body: JSON.stringify({ widget_id: L })
        });
        if (ce.status === 401)
          return (F = e.onIdentityExpired) == null || F.call(e), !1;
        if (!ce.ok)
          return c(Ao), !1;
        const pe = await ce.json(), I = Ws((re = pe == null ? void 0 : pe.data) == null ? void 0 : re.token);
        return I ? (a(I), !0) : !1;
      } catch {
        return c(Ao), !1;
      } finally {
        s = null;
      }
    })(), s;
  }, p = async (L) => t.value ? o() ? l(L) : !0 : !1, c = (L) => {
    r();
    const K = Eo(t.value);
    if (!(K != null && K.exp) || !(K != null && K.iat)) return;
    const F = (Number(K.exp) - Number(K.iat)) * So, re = (i() ?? 0) * So, ce = L ?? Math.min(
      zm,
      Math.max(0, re - F * (1 - rc))
    );
    n = setTimeout(() => {
      n = null, p(b).then((pe) => {
        c(pe ? void 0 : Ao);
      });
    }, ce);
  };
  let b = "";
  return {
    token: t,
    start: (L, K) => {
      b = L;
      const F = Ws(K) || Hm();
      a(F, { persist: !1 }), F && ic(F);
    },
    stop: () => {
      r(), s = null;
    },
    setToken: a,
    ensureFresh: p
  };
}
const jm = {
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
}, Vm = {
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
}, Km = {
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
}, Gm = {
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
}, Ym = {
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
}, _i = {
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
}, Xm = {
  GLASS: jm,
  AURORA: Vm,
  TERMINAL: Km,
  CALM_MINT: Gm,
  PLAYFUL: Ym,
  SUNRISE: _i,
  CHATBOT: _i,
  ASK_ANYTHING: _i
}, Zm = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", oc = "'Instrument Sans', system-ui, -apple-system, 'Segoe UI', sans-serif";
function Jm(e) {
  return Math.max(4, Math.round(e * 0.3));
}
function ac(e) {
  const t = (e || "").replace("#", "");
  if (t.length < 6) return "#0B0C10";
  const n = parseInt(t.slice(0, 2), 16), s = parseInt(t.slice(2, 4), 16), r = parseInt(t.slice(4, 6), 16);
  return (0.299 * n + 0.587 * s + 0.114 * r) / 255 > 0.62 ? "#0B0C10" : "#FFFFFF";
}
function Qm(e) {
  return Xm[e || ""] || _i;
}
const e_ = "#212529";
function t_(e, t) {
  const n = Qm(e), s = (t == null ? void 0 : t.chat_background_color) || "", r = /^#[0-9a-fA-F]{6}$/.test(s), i = s || n.card, o = (t == null ? void 0 : t.chat_text_color) || "", l = /^#[0-9a-fA-F]{6}$/.test(o) && o.toLowerCase() !== e_ ? o : r ? zs(s) ? "#FFFFFF" : "#111111" : n.text, p = r ? zs(s) ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)" : n.muted, c = r ? Ed(s, 20) : n.agentBg, b = (t == null ? void 0 : t.accent_color) || n.accent, w = r ? !zs(s) : n.light, H = ac(b) === "#0B0C10", L = w === H ? p : b, K = n.mono ? Zm : t != null && t.font_family ? `${t.font_family}, ${oc}` : oc;
  return {
    "--cm-card": i,
    "--cm-text": l,
    "--cm-muted": p,
    "--cm-agent-bg": c,
    "--cm-accent": b,
    "--cm-on-accent": ac(b),
    "--cm-presence": L,
    "--cm-border": n.border,
    "--cm-glow": n.glow,
    "--cm-radius": `${n.radius}px`,
    "--cm-bubble": `${n.bubble}px`,
    "--cm-bubble-tail": `${Jm(n.bubble)}px`,
    "--cm-field-radius": n.mono ? "7px" : "12px",
    "--cm-avatar-radius": n.mono ? "28%" : "50%",
    "--cm-hairline": n.light ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.08)",
    "--cm-body-font": K
  };
}
function n_() {
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
const s_ = {
  key: 0,
  class: "widget-unavailable-overlay"
}, r_ = {
  key: 1,
  class: "auth-error-overlay"
}, i_ = { class: "auth-error-card" }, o_ = { class: "auth-error-message" }, a_ = {
  key: 0,
  class: "initializing-overlay"
}, l_ = {
  key: 0,
  class: "connecting-message"
}, c_ = {
  key: 1,
  class: "failed-message"
}, u_ = { class: "welcome-content" }, f_ = { class: "welcome-header" }, h_ = ["src", "alt"], d_ = { class: "welcome-title" }, p_ = { class: "welcome-subtitle" }, g_ = { class: "welcome-input-container" }, m_ = {
  key: 0,
  class: "email-input"
}, __ = ["disabled"], y_ = { class: "welcome-message-input" }, v_ = ["placeholder", "disabled"], b_ = ["disabled"], w_ = {
  key: 0,
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, k_ = {
  key: 1,
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, T_ = { class: "landing-page-content" }, x_ = { class: "landing-page-header" }, A_ = { class: "landing-page-heading" }, S_ = { class: "landing-page-text" }, E_ = { class: "landing-page-actions" }, C_ = { class: "form-fullscreen-content" }, R_ = {
  key: 0,
  class: "form-header"
}, I_ = {
  key: 0,
  class: "form-title"
}, L_ = {
  key: 1,
  class: "form-description"
}, O_ = { class: "form-fields" }, N_ = ["for"], P_ = {
  key: 0,
  class: "required-indicator"
}, M_ = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "autocomplete", "inputmode"], D_ = ["id", "placeholder", "required", "min", "max", "value", "onInput"], F_ = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput"], $_ = ["id", "required", "value", "onChange"], B_ = { value: "" }, U_ = ["value"], z_ = {
  key: 4,
  class: "checkbox-field"
}, H_ = ["id", "required", "checked", "onChange"], W_ = { class: "checkbox-label" }, q_ = {
  key: 5,
  class: "radio-group"
}, j_ = ["name", "value", "required", "checked", "onChange"], V_ = { class: "radio-label" }, K_ = {
  key: 6,
  class: "field-error"
}, G_ = { class: "form-actions" }, Y_ = ["disabled"], X_ = {
  key: 0,
  class: "loading-spinner-inline"
}, Z_ = { key: 1 }, J_ = { class: "header-content" }, Q_ = ["src", "alt"], ey = { class: "header-info" }, ty = { class: "status" }, ny = { class: "status-text cm-presence" }, sy = { class: "header-actions" }, ry = ["disabled", "title", "aria-label", "aria-expanded"], iy = { class: "ask-anything-header" }, oy = ["src", "alt"], ay = { class: "header-info" }, ly = {
  key: 2,
  class: "loading-history"
}, cy = { class: "cm-email-gate-title" }, uy = ["disabled"], fy = {
  key: 0,
  class: "cm-email-gate-error"
}, hy = ["disabled"], dy = {
  key: 0,
  class: "cm-welcome-block"
}, py = { class: "message agent-message cm-welcome-row" }, gy = ["src", "alt"], my = {
  key: 0,
  class: "cm-msg-avatar",
  "aria-hidden": "true"
}, _y = ["src"], yy = ["src"], vy = { class: "message-col" }, by = {
  key: 0,
  class: "rating-content"
}, wy = { class: "rating-prompt" }, ky = ["onMouseover", "onMouseleave", "onClick", "disabled"], Ty = {
  key: 0,
  class: "feedback-wrapper"
}, xy = { class: "feedback-section" }, Ay = ["onUpdate:modelValue", "disabled"], Sy = { class: "feedback-counter" }, Ey = ["onClick", "disabled"], Cy = {
  key: 1,
  class: "submitted-feedback-wrapper"
}, Ry = { class: "submitted-feedback" }, Iy = { class: "submitted-feedback-text" }, Ly = {
  key: 2,
  class: "submitted-message"
}, Oy = {
  key: 1,
  class: "form-content"
}, Ny = {
  key: 0,
  class: "form-header"
}, Py = {
  key: 0,
  class: "form-title"
}, My = {
  key: 1,
  class: "form-description"
}, Dy = { class: "form-fields" }, Fy = ["for"], $y = {
  key: 0,
  class: "required-indicator"
}, By = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "disabled", "autocomplete", "inputmode"], Uy = ["id", "placeholder", "required", "min", "max", "value", "onInput", "disabled"], zy = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "disabled"], Hy = ["id", "required", "value", "onChange", "disabled"], Wy = { value: "" }, qy = ["value"], jy = {
  key: 4,
  class: "checkbox-field"
}, Vy = ["id", "checked", "onChange", "disabled"], Ky = ["for"], Gy = {
  key: 5,
  class: "radio-field"
}, Yy = ["id", "name", "value", "checked", "onChange", "disabled"], Xy = ["for"], Zy = {
  key: 6,
  class: "field-error"
}, Jy = { class: "form-actions" }, Qy = ["onClick", "disabled"], ev = {
  key: 2,
  class: "user-input-content"
}, tv = {
  key: 0,
  class: "user-input-prompt"
}, nv = {
  key: 1,
  class: "user-input-form"
}, sv = ["onUpdate:modelValue", "onKeydown"], rv = ["onClick", "disabled"], iv = {
  key: 2,
  class: "user-input-submitted"
}, ov = {
  key: 0,
  class: "user-input-confirmation"
}, av = {
  key: 3,
  class: "product-message-container"
}, lv = ["innerHTML"], cv = {
  key: 1,
  class: "products-carousel"
}, uv = { class: "carousel-items" }, fv = {
  key: 0,
  class: "product-image-compact"
}, hv = ["src", "alt"], dv = { class: "product-info-compact" }, pv = { class: "product-text-area" }, gv = { class: "product-title-compact" }, mv = {
  key: 0,
  class: "product-variant-compact"
}, _v = { class: "product-price-compact" }, yv = { class: "product-actions-compact" }, vv = ["onClick"], bv = {
  key: 2,
  class: "no-products-message"
}, wv = {
  key: 3,
  class: "no-products-message"
}, kv = ["innerHTML"], Tv = ["innerHTML"], xv = {
  key: 2,
  class: "message-attachments"
}, Av = {
  key: 0,
  class: "attachment-image-container"
}, Sv = ["src", "alt", "onClick"], Ev = { class: "attachment-image-info" }, Cv = ["href"], Rv = { class: "attachment-size" }, Iv = ["href"], Lv = { class: "attachment-size" }, Ov = {
  key: 0,
  class: "citation-chips"
}, Nv = ["title"], Pv = { class: "message-info" }, Mv = {
  key: 0,
  class: "agent-name"
}, Dv = {
  key: 5,
  class: "cm-quick-actions-bar"
}, Fv = ["disabled", "onClick"], $v = {
  key: 0,
  class: "file-previews-widget"
}, Bv = {
  class: "file-preview-content-widget",
  style: { cursor: "pointer" }
}, Uv = ["src", "alt", "onClick"], zv = ["onClick"], Hv = { class: "file-preview-info-widget" }, Wv = { class: "file-preview-name-widget" }, qv = { class: "file-preview-size-widget" }, jv = ["onClick"], Vv = {
  key: 1,
  class: "upload-progress-widget"
}, Kv = { class: "message-input" }, Gv = ["placeholder", "disabled"], Yv = ["disabled", "title"], Xv = ["disabled"], Zv = {
  key: 7,
  class: "new-conversation-section"
}, Jv = { class: "conversation-ended-message" }, Qv = {
  key: 8,
  class: "rating-dialog"
}, eb = { class: "rating-content" }, tb = { class: "star-rating" }, nb = ["onClick"], sb = { class: "rating-actions" }, rb = ["disabled"], ib = {
  key: 0,
  class: "preview-modal-image-container"
}, ob = ["src", "alt"], ab = { class: "preview-modal-filename" }, lb = {
  key: 3,
  class: "widget-loading"
}, lc = 3, cb = "image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls", ub = /* @__PURE__ */ ua({
  __name: "WidgetBuilder",
  props: {
    widgetId: {},
    token: {},
    initialAuthError: {}
  },
  setup(e) {
    const t = e, n = de(() => {
      var d;
      return t.widgetId || ((d = window.__INITIAL_DATA__) == null ? void 0 : d.widgetId);
    }), {
      customization: s,
      agentName: r,
      applyCustomization: i,
      initializeFromData: o
    } = Mm(), { formatCurrency: a } = n_(), {
      messages: l,
      loading: p,
      errorMessage: c,
      showError: b,
      loadingHistory: w,
      hasStartedChat: H,
      connectionStatus: L,
      sendMessage: K,
      endChat: F,
      loadChatHistory: re,
      connect: ce,
      reconnect: pe,
      cleanup: I,
      humanAgent: P,
      onTakeover: Y,
      submitRating: J,
      submitForm: _e,
      currentForm: Ce,
      getWorkflowState: be,
      proceedWorkflow: Be,
      onWorkflowState: we,
      onWorkflowProceeded: Xe,
      currentSessionId: qe,
      setToken: rt,
      setWidgetId: fe,
      onSessionState: ke
    } = Rm(), { displayText: ge, isStreaming: Ze } = $m(l, () => vs(() => As()));
    Bm(l);
    const xe = le(""), st = le(!0), Re = le(""), ft = le(!1), Ut = (d) => {
      const g = d.target;
      xe.value = g.value;
    };
    let Se = null;
    const gt = () => {
      Se && Se.disconnect(), Se = new MutationObserver((g) => {
        let u = !1, ne = !1;
        g.forEach((Ae) => {
          if (Ae.type === "childList") {
            const me = Array.from(Ae.addedNodes).some(
              (Ie) => {
                var on;
                return Ie.nodeType === Node.ELEMENT_NODE && (Ie.matches("input, textarea") || ((on = Ie.querySelector) == null ? void 0 : on.call(Ie, "input, textarea")));
              }
            ), Ye = Array.from(Ae.removedNodes).some(
              (Ie) => {
                var on;
                return Ie.nodeType === Node.ELEMENT_NODE && (Ie.matches("input, textarea") || ((on = Ie.querySelector) == null ? void 0 : on.call(Ie, "input, textarea")));
              }
            );
            me && (ne = !0, u = !0), Ye && (u = !0);
          }
        }), u && (clearTimeout(gt.timeoutId), gt.timeoutId = setTimeout(() => {
          un();
        }, ne ? 50 : 100));
      });
      const d = document.querySelector(".widget-container") || document.body;
      Se.observe(d, {
        childList: !0,
        subtree: !0
      });
    };
    gt.timeoutId = null;
    let xt = [];
    const At = /* @__PURE__ */ new Set(), St = (d) => {
      const g = setTimeout(() => {
        At.delete(g), un();
      }, d);
      At.add(g);
    }, Ft = () => {
      At.forEach(clearTimeout), At.clear();
    }, un = () => {
      m();
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
      let g = [];
      for (const u of d) {
        const ne = document.querySelectorAll(u);
        if (ne.length > 0) {
          g = Array.from(ne);
          break;
        }
      }
      g.length !== 0 && (xt = g, g.forEach((u) => {
        u.addEventListener("input", S, !0), u.addEventListener("keyup", S, !0), u.addEventListener("change", S, !0), u.addEventListener("keypress", M, !0), u.addEventListener("keydown", B, !0);
      }));
    }, m = () => {
      xt.forEach((d) => {
        d.removeEventListener("input", S), d.removeEventListener("keyup", S), d.removeEventListener("change", S), d.removeEventListener("keypress", M), d.removeEventListener("keydown", B);
      }), xt = [];
    }, y = (d) => !!(d && d.closest && d.closest(".form-message, .form-fullscreen, .cm-email-gate")), S = (d) => {
      if (y(d.target)) return;
      const g = d.target;
      xe.value = g.value;
    }, M = (d) => {
      y(d.target) || d.key === "Enter" && !d.shiftKey && (d.preventDefault(), d.stopPropagation(), hn());
    }, B = (d) => {
      y(d.target) || d.key === "Enter" && !d.shiftKey && (d.preventDefault(), d.stopPropagation(), hn());
    }, O = (d) => {
      const g = d.target, u = document.querySelector(".header-menu-container");
      document.querySelector(".header-menu-btn");
      const ne = document.querySelector(".header-dropdown-menu");
      ne && !(u != null && u.contains(g)) && (ne.style.display = "none");
    }, G = le(!0), {
      token: W,
      start: j,
      stop: k,
      setToken: R,
      ensureFresh: $
    } = qm({
      onTokenChanged: (d) => {
        Vn({ type: "TOKEN_UPDATE", token: d }), rt(d);
      },
      onIdentityExpired: () => {
        as();
      }
    });
    de(() => !!W.value);
    const V = le(null), X = le(!1), he = le(!1);
    t.initialAuthError && (V.value = t.initialAuthError, X.value = !0, G.value = !1), o();
    const ue = window.__INITIAL_DATA__;
    j((ue == null ? void 0 : ue.widgetId) || "", ue == null ? void 0 : ue.initialToken), W.value && (ft.value = !0);
    const oe = le(!1);
    (ue == null ? void 0 : ue.allowAttachments) !== void 0 && (oe.value = ue.allowAttachments);
    const Me = le(null), {
      chatStyles: Le,
      chatIconStyles: at,
      agentBubbleStyles: f,
      userBubbleStyles: _,
      messageNameStyles: N,
      headerBorderStyles: C,
      photoUrl: U,
      shadowStyle: te
    } = Lg(s), se = le(null), {
      uploadedAttachments: ye,
      previewModal: Oe,
      previewFile: $e,
      formatFileSize: De,
      isImageAttachment: it,
      getDownloadUrl: mt,
      getPreviewUrl: Vt,
      handleFileSelect: es,
      handleDrop: Ks,
      handleDragOver: Gs,
      handleDragLeave: ts,
      handlePaste: ns,
      removeAttachment: Kt,
      openPreview: fn,
      closePreview: Dn,
      openFilePicker: ks,
      isImage: Br
    } = Pg(W, se);
    de(() => l.value.some(
      (d) => d.message_type === "form" && (!d.isSubmitted || d.isSubmitted === !1)
    ));
    const xn = de(() => {
      var d;
      return H.value && ft.value || !Ji.value ? L.value === "connected" && !p.value : fr(Re.value.trim()) && L.value === "connected" && !p.value || ((d = window.__INITIAL_DATA__) == null ? void 0 : d.workflow);
    }), An = de(() => xn.value || p.value && L.value === "connected" && H.value), Ts = de(() => L.value === "connected" ? Qt.value ? "Ask me anything..." : "Type a message..." : "Connecting..."), ss = le(!1), hn = async () => {
      if (!xe.value.trim() && ye.value.length === 0) return;
      if (p.value && H.value) {
        ss.value = !0;
        return;
      }
      !H.value && Re.value && await Je();
      const d = ye.value.map((u) => ({
        content: u.content,
        // base64 content
        filename: u.filename,
        content_type: u.type,
        size: u.size
      }));
      await K(xe.value, Re.value, d), ye.value.forEach((u) => {
        u.url && u.url.startsWith("blob:") && URL.revokeObjectURL(u.url), u.file_url && u.file_url.startsWith("blob:") && URL.revokeObjectURL(u.file_url);
      }), xe.value = "", ye.value = [];
      const g = document.querySelector('input[placeholder*="Type a message"]');
      g && (g.value = ""), St(500);
    };
    Nt(p, (d) => {
      d || !ss.value || (ss.value = !1, L.value === "connected" && H.value && hn());
    });
    const Fn = (d) => {
      xn.value && (xe.value = d, hn());
    }, xs = () => {
      Vn({ type: "WIDGET_MINIMIZE" });
    }, Ur = (d) => {
      d.key === "Enter" && !d.shiftKey && (d.preventDefault(), d.stopPropagation(), hn());
    }, Je = async () => {
      var d, g, u, ne;
      try {
        if (!n.value)
          return console.error("Widget ID is not available"), V.value = "Widget ID is not available. Please refresh and try again.", X.value = !0, !1;
        await $(n.value);
        const Ae = new URL(`${js.API_URL}/widgets/${n.value}`);
        Re.value.trim() && fr(Re.value.trim()) && Ae.searchParams.append("email", Re.value.trim());
        const me = {
          Accept: "application/json",
          "Content-Type": "application/json"
        };
        W.value && (me.Authorization = `Bearer ${W.value}`);
        const Ye = await fetch(Ae, {
          headers: me
        });
        if (Ye.status === 401) {
          ft.value = !1;
          try {
            const zn = (await Ye.json()).detail;
            if ((zn == null ? void 0 : zn.code) === Um)
              return as(), !1;
            const Ls = typeof zn == "string" ? zn : "";
            (Ls.includes("generate-token") || Ls.includes("API key") || Ls.includes("Token required")) && (he.value = !0, V.value = "Widget authentication not configured. Please contact the website administrator.", X.value = !0, R(null));
          } catch {
            V.value = "Authentication required. Your token has expired or is invalid. Please refresh the page.", X.value = !0, R(null);
          }
          return !1;
        }
        if (!Ye.ok) {
          try {
            const ar = await Ye.json();
            V.value = ar.detail || `Error: ${Ye.statusText}`;
          } catch {
            V.value = `Error: ${Ye.statusText}. Please try again.`;
          }
          return X.value = !0, !1;
        }
        const Ie = await Ye.json();
        return Ie.token && R(Ie.token), ft.value = !0, V.value = null, X.value = !1, rt(W.value || void 0), await ce() || console.error("Chat service not reachable yet; retrying in the background"), await $n(), (d = Ie.agent) != null && d.customization && i(Ie.agent.customization), Ie.agent && !(Ie != null && Ie.human_agent) && (r.value = Ie.agent.name), Ie != null && Ie.human_agent && (P.value = Ie.human_agent), ((g = Ie.agent) == null ? void 0 : g.allow_attachments) !== void 0 && (oe.value = Ie.agent.allow_attachments), ((u = Ie.agent) == null ? void 0 : u.workflow) !== void 0 && (window.__INITIAL_DATA__ = window.__INITIAL_DATA__ || {}, window.__INITIAL_DATA__.workflow = Ie.agent.workflow), (ne = Ie.agent) != null && ne.workflow && await be(), !0;
      } catch (Ae) {
        return console.error("Error checking authorization:", Ae), V.value = "An unexpected error occurred. Please try again.", X.value = !0, ft.value = !1, !1;
      } finally {
        G.value = !1;
      }
    }, $n = async () => {
      !H.value && ft.value && (H.value = !0, await re());
    }, As = () => {
      Me.value && (Me.value.scrollTop = Me.value.scrollHeight);
    };
    Nt(() => l.value, (d) => {
      vs(() => {
        As();
      });
    }, { deep: !0 }), Nt(L, (d, g) => {
      d === "connected" && g !== "connected" && St(100);
    }), Nt(() => l.value.length, (d, g) => {
      d > 0 && g === 0 && St(100);
    });
    let Ys = null;
    Nt(() => l.value, (d) => {
      const g = d[d.length - 1];
      !Gl(g) || g === Ys || (Ys = g, Hr(g));
    }, { deep: !0 });
    const Xs = async () => {
      await pe() && await Je();
    }, Zs = le(!1), rs = le(0), Js = le(""), Gt = le(0), Yt = le(!1), ct = le({}), tt = le(!1), lt = le({}), Xt = le(!1), zt = le(null), zr = le("Start Chat"), Zt = le(!1), yt = le(null);
    de(() => {
      var g;
      const d = l.value[l.value.length - 1];
      return ((g = d == null ? void 0 : d.attributes) == null ? void 0 : g.request_rating) || !1;
    });
    const is = de(() => {
      var g;
      if (!((g = window.__INITIAL_DATA__) != null && g.workflow))
        return !1;
      const d = l.value.find((u) => u.message_type === "rating");
      return (d == null ? void 0 : d.isSubmitted) === !0;
    }), dn = de(
      () => Ii(P.value.human_agent_profile_pic)
    ), Hr = async (d) => {
      var g, u, ne, Ae, me;
      if (Gl(d)) {
        try {
          if (d.session_id && W.value && n.value) {
            const Ye = new URL(`${js.API_URL}/widgets/${n.value}/end-chat`);
            Ye.searchParams.append("session_id", d.session_id), (g = d.attributes) != null && g.end_chat_reason && Ye.searchParams.append("reason", d.attributes.end_chat_reason), (u = d.attributes) != null && u.end_chat_description && Ye.searchParams.append("description", d.attributes.end_chat_description);
            const Ie = await fetch(Ye, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${W.value}`,
                "Content-Type": "application/json"
              }
            });
            if (Ie.ok) {
              const on = await Ie.json();
              console.info(`✓ Chat session closed on backend: ${on.session_id}`);
            } else
              console.warn(`Failed to close session on backend: ${Ie.status}`);
          }
        } catch (Ye) {
          console.error("Error calling end-chat API:", Ye);
        }
        if ((ne = d.attributes) != null && ne.end_chat && ((Ae = d.attributes) != null && Ae.request_rating)) {
          const Ye = d.agent_name || ((me = P.value) == null ? void 0 : me.human_agent_name) || r.value || "our agent";
          l.value.push({
            message: `Rate the chat session that you had with ${Ye}`,
            message_type: "rating",
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            session_id: d.session_id,
            agent_name: Ye,
            showFeedback: !1
          }), qe.value = d.session_id;
        }
      }
    }, Ss = (d) => {
      Yt.value || (Gt.value = d);
    }, Qs = () => {
      if (!Yt.value) {
        const d = l.value[l.value.length - 1];
        Gt.value = (d == null ? void 0 : d.selectedRating) || 0;
      }
    }, Es = async (d) => {
      if (!Yt.value) {
        Gt.value = d;
        const g = l.value[l.value.length - 1];
        g && g.message_type === "rating" && (g.showFeedback = !0, g.selectedRating = d);
      }
    }, Bn = async (d, g, u = null) => {
      try {
        Yt.value = !0, await J(g, u);
        const ne = l.value.find((Ae) => Ae.message_type === "rating");
        ne && (ne.isSubmitted = !0, ne.finalRating = g, ne.finalFeedback = u);
      } catch (ne) {
        console.error("Failed to submit rating:", ne);
      } finally {
        Yt.value = !1;
      }
    }, os = (d) => {
      const g = {};
      for (const u of d.fields) {
        const ne = ct.value[u.name], Ae = er(u, ne);
        Ae && (g[u.name] = Ae);
      }
      return lt.value = g, Object.keys(g).length === 0;
    }, Jt = async (d) => {
      if (!(tt.value || !os(d)))
        try {
          tt.value = !0, await _e(ct.value);
          const u = l.value.findIndex(
            (ne) => ne.message_type === "form" && (!ne.isSubmitted || ne.isSubmitted === !1)
          );
          u !== -1 && l.value.splice(u, 1), ct.value = {}, lt.value = {};
        } catch (u) {
          console.error("Failed to submit form:", u);
        } finally {
          tt.value = !1;
        }
    }, Et = (d, g) => {
      var u, ne;
      if (ct.value[d] = g, g && g.toString().trim() !== "") {
        let Ae = null;
        if ((u = yt.value) != null && u.fields && (Ae = yt.value.fields.find((me) => me.name === d)), !Ae && ((ne = Ce.value) != null && ne.fields) && (Ae = Ce.value.fields.find((me) => me.name === d)), Ae) {
          const me = er(Ae, g);
          me ? (lt.value[d] = me, console.log(`Validation error for ${d}:`, me)) : delete lt.value[d];
        }
      } else
        delete lt.value[d], console.log(`Cleared error for ${d}`);
    }, Cs = (d) => {
      const g = d.replace(/\D/g, "");
      return g.length >= 7 && g.length <= 15;
    }, er = (d, g) => {
      if (d.required && (!g || g.toString().trim() === ""))
        return `${d.label} is required`;
      if (!g || g.toString().trim() === "")
        return null;
      if (d.type === "email" && !fr(g))
        return "Please enter a valid email address";
      if (d.type === "tel" && !Cs(g))
        return "Please enter a valid phone number";
      if ((d.type === "text" || d.type === "textarea") && d.minLength && g.length < d.minLength)
        return `${d.label} must be at least ${d.minLength} characters`;
      if ((d.type === "text" || d.type === "textarea") && d.maxLength && g.length > d.maxLength)
        return `${d.label} must not exceed ${d.maxLength} characters`;
      if (d.type === "number") {
        const u = parseFloat(g);
        if (isNaN(u))
          return `${d.label} must be a valid number`;
        if (d.minLength && u < d.minLength)
          return `${d.label} must be at least ${d.minLength}`;
        if (d.maxLength && u > d.maxLength)
          return `${d.label} must not exceed ${d.maxLength}`;
      }
      return null;
    }, Wr = async () => {
      if (!(tt.value || !yt.value))
        try {
          tt.value = !0, lt.value = {};
          let d = !1;
          for (const g of yt.value.fields || []) {
            const u = ct.value[g.name], ne = er(g, u);
            ne && (lt.value[g.name] = ne, d = !0, console.log(`Validation error for field ${g.name}:`, ne));
          }
          if (d) {
            tt.value = !1, console.log("Validation failed, not submitting");
            return;
          }
          await _e(ct.value), Zt.value = !1, yt.value = null, ct.value = {};
        } catch (d) {
          console.error("Failed to submit full screen form:", d);
        } finally {
          tt.value = !1, console.log("Full screen form submission completed");
        }
    }, qr = (d, g) => {
      if (console.log("handleViewDetails called with:", { product: d, shopDomain: g }), !d) {
        console.error("No product provided to handleViewDetails");
        return;
      }
      let u = null;
      if (d.handle && g)
        u = `https://${g}/products/${d.handle}`;
      else if (d.id && g)
        u = `https://${g}/products/${d.id}`;
      else if (g) {
        if (!d.handle && !d.id) {
          console.error("Product handle and ID are both missing! Product:", d), alert("Unable to open product: Product information incomplete.");
          return;
        }
      } else {
        console.error("Shop domain is missing! Product:", d), alert("Unable to open product: Shop domain not available. Please contact support.");
        return;
      }
      u && (console.log("Opening product URL:", u), window.open(u, "_blank"));
    }, jr = (d) => {
      if (!d) return "";
      let g = d.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "");
      const u = [];
      return g = g.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (ne, Ae, me) => {
        const Ye = `__MARKDOWN_LINK_${u.length}__`;
        return console.log("Found markdown link:", ne, "-> placeholder:", Ye), u.push(ne), Ye;
      }), console.log("After replacing markdown links with placeholders:", g), console.log("Markdown links array:", u), g = g.replace(/https?:\/\/[^\s\)]+/g, "[link removed]"), console.log("After removing standalone URLs:", g), u.forEach((ne, Ae) => {
        g = g.replace(`__MARKDOWN_LINK_${Ae}__`, ne), console.log(`Restored markdown link ${Ae}:`, ne);
      }), g = g.replace(/\n\s*\n\s*\n/g, `

`).trim(), g;
    }, tr = le(!1);
    le(!1);
    const nr = de(() => {
      var d;
      return !!((d = P.value) != null && d.human_agent_name);
    }), sr = de(() => {
      var d;
      return Rg((d = window.__INITIAL_DATA__) == null ? void 0 : d.presence, nr.value);
    }), Ki = de(() => oe.value && nr.value && ye.value.length < lc), Gi = async () => {
      try {
        Xt.value = !1, zt.value = null, await Be();
      } catch (d) {
        console.error("Failed to proceed workflow:", d);
      }
    }, Rs = async (d) => {
      try {
        if (!d.userInputValue || !d.userInputValue.trim())
          return;
        const g = d.userInputValue.trim();
        d.isSubmitted = !0, d.submittedValue = g, await K(g, Re.value);
      } catch (g) {
        console.error("Failed to submit user input:", g), d.isSubmitted = !1, d.submittedValue = null;
      }
    }, as = () => {
      Vn({ type: "IDENTITY_EXPIRED" });
    }, rr = async () => {
      W.value && (R(null), await h());
    }, q = async (d) => {
      const g = Ws(d);
      !g || g === W.value || (R(g), await h());
    }, h = async () => {
      var d, g, u;
      try {
        let ne = 0;
        const Ae = 50;
        for (; !((d = window.__INITIAL_DATA__) != null && d.widgetId) && ne < Ae; )
          await new Promise((Ye) => setTimeout(Ye, 100)), ne++;
        return (g = window.__INITIAL_DATA__) != null && g.widgetId ? (fe(window.__INITIAL_DATA__.widgetId), await Je() ? ((u = window.__INITIAL_DATA__) != null && u.workflow && ft.value && await be(), !0) : (L.value = "connected", !1)) : (console.error("Widget data not available after waiting"), !1);
      } catch (ne) {
        return console.error("Failed to initialize widget:", ne), !1;
      }
    };
    window.addEventListener("message", (d) => {
      d.source === window.parent && (!d.data || typeof d.data.type != "string" || (d.data.type === "SCROLL_TO_BOTTOM" && As(), d.data.type === "IDENTITY_UNAVAILABLE" && rr(), d.data.type === "TOKEN_REFRESH" && q(d.data.token), d.data.type === "WIDGET_VISIBILITY" && ($a.value = !!d.data.open), d.data.type === "WIDGET_DISPLAY" && (Qi.value = {
        mode: d.data.mode,
        width: d.data.width,
        height: d.data.height,
        hotkey: d.data.hotkey
      }), d.data.type === "PREFILL_MESSAGE" && typeof d.data.text == "string" && (xe.value = d.data.text.slice(0, 2e3), vs(() => {
        const g = document.querySelector(
          ".message-input input, .welcome-message-field"
        );
        g == null || g.focus();
      }))));
    });
    const T = () => {
      Y(async () => {
        await Je();
      }), ke(({ session_id: d, authenticated: g, created: u }) => {
        Vn({
          type: "CHAT_SESSION",
          sessionId: d,
          authenticated: g,
          created: u
        });
      }), we((d) => {
        var g;
        if (zr.value = d.button_text || "Start Chat", d.type === "landing_page")
          zt.value = d.landing_page_data, Xt.value = !0, Zt.value = !1;
        else if (d.type === "form" || d.type === "display_form")
          if (((g = d.form_data) == null ? void 0 : g.form_full_screen) === !0)
            yt.value = d.form_data, Zt.value = !0, Xt.value = !1;
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
              (Ae) => Ae.message_type === "form" && !Ae.isSubmitted
            ) === -1 && l.value.push(u), Xt.value = !1, Zt.value = !1;
          }
        else
          Xt.value = !1, Zt.value = !1;
      }), Xe((d) => {
        console.log("Workflow proceeded:", d);
      });
    }, z = async () => {
      try {
        await h(), await be();
      } catch (d) {
        throw console.error("Failed to start new conversation:", d), d;
      }
    }, Z = de(
      () => {
        var d;
        return s.value.allow_new_chat === !0 && l.value.length > 0 && !((d = P.value) != null && d.human_agent_name) && !cs.value;
      }
    ), Q = le(!1), ae = le(""), Ne = le(!1);
    let Ue = null;
    const ut = () => {
      Ne.value = !1, ae.value = "", Ue && (clearTimeout(Ue), Ue = null);
    }, bt = () => {
      if (!Q.value) {
        if (Ne.value) {
          ut();
          return;
        }
        Ne.value = !0, ae.value = "", Ue = setTimeout(ut, Zp);
      }
    };
    Nt(Z, (d) => {
      d || ut();
    });
    const Is = async () => {
      Q.value || (Ue && (clearTimeout(Ue), Ue = null), await wt(), ae.value || (Ne.value = !1));
    }, wt = async () => {
      if (!Q.value) {
        Q.value = !0, ae.value = "";
        try {
          if (!await F()) {
            ae.value = Kl;
            return;
          }
          P.value = {}, xe.value = "", ye.value = [], await h();
        } catch (d) {
          console.error("Failed to start a new chat:", d), ae.value = Kl;
        } finally {
          Q.value = !1;
        }
      }
    }, Vr = async () => {
      is.value = !1, l.value = [], P.value = {}, await z();
    };
    Bi(async () => {
      await h(), T(), gt(), document.addEventListener("click", O), (() => {
        const g = l.value.length > 0, u = L.value === "connected", ne = document.querySelector('input[type="text"], textarea') !== null;
        return g || u || ne;
      })() && St(100);
    }), Dr(() => {
      window.removeEventListener("message", (d) => {
        d.data.type === "SCROLL_TO_BOTTOM" && As();
      }), document.removeEventListener("click", O), Se && (Se.disconnect(), Se = null), gt.timeoutId && (clearTimeout(gt.timeoutId), gt.timeoutId = null), Ft(), m(), k(), ut(), I();
    });
    const ls = de(() => s.value.chat_style === "AURORA"), Qt = de(() => s.value.chat_style === "ASK_ANYTHING" || ls.value), La = de(() => s.value.customization_metadata), Kr = de(() => {
      var g;
      const d = (g = La.value) == null ? void 0 : g.avatar_style;
      return d === "orb" ? !0 : d === "photo" ? !1 : ls.value && !s.value.photo_url;
    }), ir = de(() => {
      var d;
      return Eg(r.value || "", (d = La.value) == null ? void 0 : d.orb_variant);
    }), ju = {
      GLASS: "theme-glass",
      TERMINAL: "theme-terminal",
      PLAYFUL: "theme-playful",
      CALM_MINT: "theme-calm",
      SUNRISE: "theme-sunrise"
    }, Vu = de(() => ju[s.value.chat_style] || ""), Ku = de(() => t_(s.value.chat_style, {
      chat_background_color: s.value.chat_background_color,
      chat_text_color: s.value.chat_text_color,
      accent_color: s.value.accent_color,
      font_family: s.value.font_family
    })), Yi = de(
      () => Array.isArray(s.value.quick_actions) ? s.value.quick_actions.filter((d) => !!d && d.trim().length > 0) : []
    ), Oa = de(() => (s.value.welcome_message || "").trim()), Na = de(
      () => !Qt.value && l.value.length === 0 && !w.value && !cs.value
    ), Gu = de(
      () => Na.value && Oa.value.length > 0
    ), Yu = de(
      () => Na.value && !is.value && Yi.value.length > 0
    ), Gr = de(() => s.value.show_citations === !0), Pa = de(() => Cg(s.value.show_ai_disclaimer, nr.value)), Xu = (d) => /^[0-9a-f]{16,}$/i.test(d) || /^[0-9a-f-]{32,}$/i.test(d), Xi = (d) => {
      const g = (d || "").trim().toLowerCase();
      return !g || g === "unknown" ? "Knowledge base" : g.charAt(0).toUpperCase() + g.slice(1);
    }, Zi = (d) => {
      let g = ((d == null ? void 0 : d.name) || "").trim();
      return !g || (g = g.replace(/^[0-9a-f]{16,}[_-]/i, "").replace(/\.(pdf|txt|md|html?|docx?|csv|json)$/i, ""), !g || Xu(g)) ? Xi(d == null ? void 0 : d.type) : g;
    }, Ma = (d) => {
      const g = Zi(d), u = Xi(d == null ? void 0 : d.type);
      return g === u ? u : `${g} · ${u}`;
    }, Ji = de(() => s.value.collect_email === !0 && !Qt.value), Da = le(!1), Un = le(""), or = le(!1), cs = de(() => !H.value && Ji.value && !Da.value), Fa = async () => {
      const d = Re.value.trim();
      if (!d) {
        Un.value = "Please enter your email address.";
        return;
      }
      if (!fr(d)) {
        Un.value = "Please enter a valid email address.";
        return;
      }
      Un.value = "", or.value = !0;
      try {
        await Je(), Da.value = !0;
      } catch {
        Un.value = "Something went wrong. Please try again.";
      } finally {
        or.value = !1;
      }
    }, Qi = le(null), $a = le(!0), eo = { mode: "floating", width: 400, height: 560 }, Yr = de(
      () => {
        var d;
        return Qi.value || ((d = s.value.customization_metadata) == null ? void 0 : d.widget_display) || null;
      }
    ), Zu = de(() => {
      const d = Yr.value;
      return d ? typeof d.mode == "string" && d.mode !== eo.mode || typeof d.width == "number" && d.width !== eo.width || typeof d.height == "number" && d.height !== eo.height : !1;
    }), Ju = de(() => {
      var g;
      const d = {
        width: "100%",
        height: "100%",
        borderRadius: "var(--radius-lg)"
      };
      if (Zu.value) {
        const u = (g = Yr.value) == null ? void 0 : g.mode;
        return u === "sidebar-left" || u === "sidebar-right" ? { ...d, borderRadius: "0" } : d;
      }
      return Qt.value ? window.innerWidth <= 768 ? {
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
    }), Ba = de(() => Qt.value && l.value.length === 0), Qu = ["form", "user_input", "rating", "product", "shopify_output"], ef = de(
      () => l.value.some(
        (d) => Qu.includes(d.message_type) || Array.isArray(d.attachments) && d.attachments.length > 0
      )
    ), tf = de(() => {
      var g, u;
      return Qt.value ? !0 : (((g = Yr.value) == null ? void 0 : g.mode) === "ask-ai" || ((u = Yr.value) == null ? void 0 : u.mode) === "search-bar") && !oe.value;
    }), to = de(
      () => tf.value && st.value && !Xt.value && !Zt.value && !cs.value && !is.value && !ef.value
    );
    Nt(to, (d) => {
      Vn({ type: "WIDGET_SURFACE", palette: d });
    }, { immediate: !0 });
    const nf = de(
      () => s.value.welcome_subtitle || `Ask a question — ${r.value || "the assistant"} answers from what it knows.`
    ), sf = de(() => {
      var d;
      return ((d = Qi.value) == null ? void 0 : d.hotkey) !== !1;
    });
    return (d, g) => X.value && he.value ? (x(), A("div", s_, [
      v("button", {
        type: "button",
        class: "cm-error-close",
        "aria-label": "Close chat",
        title: "Close",
        onClick: xs
      }, "×"),
      g[20] || (g[20] = hs('<div class="widget-unavailable-card" data-v-5c1a625d><div class="widget-unavailable-icon-wrapper" data-v-5c1a625d><svg class="widget-unavailable-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-v-5c1a625d><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" data-v-5c1a625d></path><path d="M9 12l2 2 4-4" data-v-5c1a625d></path></svg></div><h2 class="widget-unavailable-title" data-v-5c1a625d>Chat Unavailable</h2><p class="widget-unavailable-message" data-v-5c1a625d> This chat widget is not currently configured. Please contact the website administrator to enable chat support. </p><div class="widget-unavailable-footer" data-v-5c1a625d><svg class="chattermate-logo-small" width="14" height="14" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-5c1a625d><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-5c1a625d></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-5c1a625d></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-5c1a625d></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-5c1a625d></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-5c1a625d><span class="cm-powered-prefix" data-v-5c1a625d>Powered by </span><strong class="cm-brand" data-v-5c1a625d>ChatterMate</strong></a></div></div>', 1))
    ])) : X.value ? (x(), A("div", r_, [
      v("button", {
        type: "button",
        class: "cm-error-close",
        "aria-label": "Close chat",
        title: "Close",
        onClick: xs
      }, "×"),
      v("div", i_, [
        g[21] || (g[21] = hs('<div class="auth-error-header" data-v-5c1a625d><svg class="auth-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-5c1a625d><circle cx="12" cy="12" r="10" data-v-5c1a625d></circle><line x1="12" y1="8" x2="12" y2="12" data-v-5c1a625d></line><line x1="12" y1="16" x2="12.01" y2="16" data-v-5c1a625d></line></svg><h2 data-v-5c1a625d>Authentication Error</h2></div>', 1)),
        v("p", o_, ee(V.value), 1),
        v("button", {
          class: "auth-error-refresh-btn",
          onClick: g[0] || (g[0] = () => d.window.location.reload())
        }, " Refresh Page ")
      ])
    ])) : n.value && !X.value ? (x(), A("div", {
      key: 2,
      class: ze(["chat-container cm-surface", [{ collapsed: !st.value, "ask-anything-style": Qt.value, aurora: ls.value }, Vu.value]]),
      style: Ee({ ...E(te), ...Ju.value, ...Ku.value })
    }, [
      G.value ? (x(), A("div", a_, g[22] || (g[22] = [
        hs('<div class="loading-spinner" data-v-5c1a625d><div class="dot" data-v-5c1a625d></div><div class="dot" data-v-5c1a625d></div><div class="dot" data-v-5c1a625d></div></div><div class="loading-text" data-v-5c1a625d>Initializing chat...</div>', 2)
      ]))) : ie("", !0),
      !G.value && E(L) !== "connected" ? (x(), A("div", {
        key: 1,
        class: ze(["connection-status", E(L)])
      }, [
        E(L) === "connecting" ? (x(), A("div", l_, g[23] || (g[23] = [
          En(" Connecting to chat service... ", -1),
          v("div", { class: "loading-dots" }, [
            v("div", { class: "dot" }),
            v("div", { class: "dot" }),
            v("div", { class: "dot" })
          ], -1)
        ]))) : E(L) === "failed" ? (x(), A("div", c_, [
          g[24] || (g[24] = En(" Connection failed. ", -1)),
          v("button", {
            onClick: Xs,
            class: "reconnect-button"
          }, " Click here to reconnect ")
        ])) : ie("", !0)
      ], 2)) : ie("", !0),
      E(b) ? (x(), A("div", {
        key: 2,
        class: "error-alert",
        style: Ee(E(at))
      }, ee(E(c)), 5)) : ie("", !0),
      to.value ? (x(), Ti(xg, {
        key: 3,
        messages: E(l),
        draft: xe.value,
        "agent-name": E(r),
        suggestions: Yi.value,
        "welcome-title": E(s).welcome_title,
        "welcome-subtitle": nf.value,
        placeholder: Ts.value,
        "input-enabled": xn.value,
        "typing-enabled": An.value,
        loading: E(p),
        "show-citations": Gr.value,
        disclaimer: Pa.value ? E(Yl) : "",
        active: $a.value,
        hotkey: sf.value,
        "can-start-new-chat": Z.value,
        "starting-new-chat": Q.value,
        "new-chat-armed": Ne.value,
        "new-chat-error": ae.value,
        onNewChat: bt,
        onConfirmNewChat: Is,
        onCancelNewChat: ut,
        "citation-label": Zi,
        "citation-tooltip": Ma,
        "display-text": E(ge),
        "is-streaming": E(Ze),
        "onUpdate:draft": g[1] || (g[1] = (u) => xe.value = u),
        onSend: hn,
        onAsk: Fn,
        onClose: xs
      }, null, 8, ["messages", "draft", "agent-name", "suggestions", "welcome-title", "welcome-subtitle", "placeholder", "input-enabled", "typing-enabled", "loading", "show-citations", "disclaimer", "active", "hotkey", "can-start-new-chat", "starting-new-chat", "new-chat-armed", "new-chat-error", "display-text", "is-streaming"])) : Ba.value ? (x(), A("div", {
        key: 4,
        class: ze(["welcome-message-section", { aurora: ls.value }]),
        style: Ee(E(Le))
      }, [
        v("div", u_, [
          v("div", f_, [
            Kr.value ? (x(), A("div", {
              key: 0,
              class: "welcome-orb",
              style: Ee(ir.value)
            }, null, 4)) : E(U) ? (x(), A("img", {
              key: 1,
              src: E(U),
              alt: E(r),
              class: "welcome-avatar"
            }, null, 8, h_)) : ie("", !0),
            v("h1", d_, ee(E(s).welcome_title || `Welcome to ${E(r)}`), 1),
            v("p", p_, ee(E(s).welcome_subtitle || "I'm here to help you with anything you need. What can I assist you with today?"), 1)
          ])
        ]),
        v("div", g_, [
          !E(H) && !ft.value && Ji.value ? (x(), A("div", m_, [
            Hn(v("input", {
              "onUpdate:modelValue": g[2] || (g[2] = (u) => Re.value = u),
              type: "email",
              placeholder: "Enter your email address",
              disabled: E(p) || E(L) !== "connected",
              class: ze([{
                invalid: Re.value.trim() && !E(fr)(Re.value.trim()),
                disabled: E(L) !== "connected"
              }, "welcome-email-input"])
            }, null, 10, __), [
              [ds, Re.value]
            ])
          ])) : ie("", !0),
          v("div", y_, [
            Hn(v("input", {
              "onUpdate:modelValue": g[3] || (g[3] = (u) => xe.value = u),
              type: "text",
              placeholder: Ts.value,
              onKeypress: Ur,
              onInput: Ut,
              onChange: Ut,
              disabled: !An.value,
              class: ze([{ disabled: !An.value }, "welcome-message-field"])
            }, null, 42, v_), [
              [ds, xe.value]
            ]),
            v("button", {
              class: ze(["welcome-send-button", { "aurora-send": ls.value }]),
              style: Ee(E(_)),
              onClick: hn,
              disabled: !xe.value.trim() || !xn.value
            }, [
              ls.value ? (x(), A("svg", w_, g[25] || (g[25] = [
                v("path", {
                  d: "M12 19V5M12 5L5 12M12 5L19 12",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                }, null, -1)
              ]))) : (x(), A("svg", k_, g[26] || (g[26] = [
                v("path", {
                  d: "M5 12L3 21L21 12L3 3L5 12ZM5 12L13 12",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                }, null, -1)
              ])))
            ], 14, b_)
          ])
        ]),
        v("div", {
          class: "powered-by-welcome",
          style: Ee(E(N))
        }, g[27] || (g[27] = [
          hs('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-5c1a625d><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-5c1a625d></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-5c1a625d></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-5c1a625d></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-5c1a625d></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-5c1a625d><span class="cm-powered-prefix" data-v-5c1a625d>Powered by </span><strong class="cm-brand" data-v-5c1a625d>ChatterMate</strong></a>', 2)
        ]), 4)
      ], 6)) : ie("", !0),
      Xt.value && zt.value ? (x(), A("div", {
        key: 5,
        class: "landing-page-fullscreen",
        style: Ee(E(Le))
      }, [
        v("div", T_, [
          v("div", x_, [
            v("h2", A_, ee(zt.value.heading), 1),
            v("div", S_, ee(zt.value.content), 1)
          ]),
          v("div", E_, [
            v("button", {
              class: "landing-page-button",
              onClick: Gi
            }, ee(zr.value), 1)
          ])
        ]),
        v("div", {
          class: "powered-by-landing",
          style: Ee(E(N))
        }, g[28] || (g[28] = [
          hs('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-5c1a625d><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-5c1a625d></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-5c1a625d></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-5c1a625d></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-5c1a625d></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-5c1a625d><span class="cm-powered-prefix" data-v-5c1a625d>Powered by </span><strong class="cm-brand" data-v-5c1a625d>ChatterMate</strong></a>', 2)
        ]), 4)
      ], 4)) : Zt.value && yt.value ? (x(), A("div", {
        key: 6,
        class: "form-fullscreen",
        style: Ee(E(Le))
      }, [
        v("div", C_, [
          yt.value.title || yt.value.description ? (x(), A("div", R_, [
            yt.value.title ? (x(), A("h2", I_, ee(yt.value.title), 1)) : ie("", !0),
            yt.value.description ? (x(), A("p", L_, ee(yt.value.description), 1)) : ie("", !0)
          ])) : ie("", !0),
          v("div", O_, [
            (x(!0), A(He, null, kt(yt.value.fields, (u) => {
              var ne, Ae;
              return x(), A("div", {
                key: u.name,
                class: "form-field"
              }, [
                v("label", {
                  for: `fullscreen-form-${u.name}`,
                  class: "field-label"
                }, [
                  En(ee(u.label) + " ", 1),
                  u.required ? (x(), A("span", P_, "*")) : ie("", !0)
                ], 8, N_),
                u.type === "text" || u.type === "email" || u.type === "tel" ? (x(), A("input", {
                  key: 0,
                  id: `fullscreen-form-${u.name}`,
                  type: u.type,
                  placeholder: u.placeholder || "",
                  required: u.required,
                  minlength: u.minLength,
                  maxlength: u.maxLength,
                  value: ct.value[u.name] || "",
                  onInput: (me) => Et(u.name, me.target.value),
                  onBlur: (me) => Et(u.name, me.target.value),
                  class: ze(["form-input", { error: lt.value[u.name] }]),
                  autocomplete: u.type === "email" ? "email" : u.type === "tel" ? "tel" : "off",
                  inputmode: u.type === "tel" ? "tel" : u.type === "email" ? "email" : "text"
                }, null, 42, M_)) : u.type === "number" ? (x(), A("input", {
                  key: 1,
                  id: `fullscreen-form-${u.name}`,
                  type: "number",
                  placeholder: u.placeholder || "",
                  required: u.required,
                  min: u.minLength,
                  max: u.maxLength,
                  value: ct.value[u.name] || "",
                  onInput: (me) => Et(u.name, me.target.value),
                  class: ze(["form-input", { error: lt.value[u.name] }])
                }, null, 42, D_)) : u.type === "textarea" ? (x(), A("textarea", {
                  key: 2,
                  id: `fullscreen-form-${u.name}`,
                  placeholder: u.placeholder || "",
                  required: u.required,
                  minlength: u.minLength,
                  maxlength: u.maxLength,
                  value: ct.value[u.name] || "",
                  onInput: (me) => Et(u.name, me.target.value),
                  class: ze(["form-textarea", { error: lt.value[u.name] }]),
                  rows: "4"
                }, null, 42, F_)) : u.type === "select" ? (x(), A("select", {
                  key: 3,
                  id: `fullscreen-form-${u.name}`,
                  required: u.required,
                  value: ct.value[u.name] || "",
                  onChange: (me) => Et(u.name, me.target.value),
                  class: ze(["form-select", { error: lt.value[u.name] }])
                }, [
                  v("option", B_, ee(u.placeholder || "Please select..."), 1),
                  (x(!0), A(He, null, kt((Array.isArray(u.options) ? u.options : ((ne = u.options) == null ? void 0 : ne.split(`
`)) || []).filter((me) => me.trim()), (me) => (x(), A("option", {
                    key: me,
                    value: me.trim()
                  }, ee(me.trim()), 9, U_))), 128))
                ], 42, $_)) : u.type === "checkbox" ? (x(), A("label", z_, [
                  v("input", {
                    id: `fullscreen-form-${u.name}`,
                    type: "checkbox",
                    required: u.required,
                    checked: ct.value[u.name] || !1,
                    onChange: (me) => Et(u.name, me.target.checked),
                    class: "form-checkbox"
                  }, null, 40, H_),
                  v("span", W_, ee(u.label), 1)
                ])) : u.type === "radio" ? (x(), A("div", q_, [
                  (x(!0), A(He, null, kt((Array.isArray(u.options) ? u.options : ((Ae = u.options) == null ? void 0 : Ae.split(`
`)) || []).filter((me) => me.trim()), (me) => (x(), A("label", {
                    key: me,
                    class: "radio-field"
                  }, [
                    v("input", {
                      type: "radio",
                      name: `fullscreen-form-${u.name}`,
                      value: me.trim(),
                      required: u.required,
                      checked: ct.value[u.name] === me.trim(),
                      onChange: (Ye) => Et(u.name, me.trim()),
                      class: "form-radio"
                    }, null, 40, j_),
                    v("span", V_, ee(me.trim()), 1)
                  ]))), 128))
                ])) : ie("", !0),
                lt.value[u.name] ? (x(), A("div", K_, ee(lt.value[u.name]), 1)) : ie("", !0)
              ]);
            }), 128))
          ]),
          v("div", G_, [
            v("button", {
              onClick: g[4] || (g[4] = () => {
                console.log("Submit button clicked!"), Wr();
              }),
              disabled: tt.value,
              class: "submit-form-button",
              style: Ee(E(_))
            }, [
              tt.value ? (x(), A("span", X_, g[29] || (g[29] = [
                v("div", { class: "dot" }, null, -1),
                v("div", { class: "dot" }, null, -1),
                v("div", { class: "dot" }, null, -1)
              ]))) : (x(), A("span", Z_, ee(yt.value.submit_button_text || "Submit"), 1))
            ], 12, Y_)
          ])
        ]),
        v("div", {
          class: "powered-by-landing",
          style: Ee(E(N))
        }, g[30] || (g[30] = [
          hs('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-5c1a625d><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-5c1a625d></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-5c1a625d></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-5c1a625d></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-5c1a625d></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-5c1a625d><span class="cm-powered-prefix" data-v-5c1a625d>Powered by </span><strong class="cm-brand" data-v-5c1a625d>ChatterMate</strong></a>', 2)
        ]), 4)
      ], 4)) : !Ba.value && st.value && !to.value ? (x(), A("div", {
        key: 7,
        class: ze(["chat-panel", { "ask-anything-chat": Qt.value }]),
        style: Ee(E(Le))
      }, [
        Qt.value ? (x(), A("div", {
          key: 1,
          class: "ask-anything-top",
          style: Ee(E(C))
        }, [
          v("div", iy, [
            dn.value || E(U) ? (x(), A("img", {
              key: 0,
              src: dn.value || E(U),
              alt: E(P).human_agent_name || E(r),
              class: "header-avatar"
            }, null, 8, oy)) : ie("", !0),
            v("div", ay, [
              v("h3", {
                style: Ee(E(N))
              }, ee(E(r)), 5),
              v("p", {
                class: "ask-anything-subtitle",
                style: Ee(E(N))
              }, ee(E(s).welcome_subtitle || "Ask me anything. I'm here to help."), 5)
            ])
          ])
        ], 4)) : (x(), A("div", {
          key: 0,
          class: "chat-header",
          style: Ee(E(C))
        }, [
          v("div", {
            class: "cm-header-sheen",
            style: Ee({ background: "linear-gradient(90deg, transparent, " + (E(s).accent_color || "#C9F24E") + ", transparent)" })
          }, null, 4),
          v("div", J_, [
            !dn.value && (Kr.value || !E(U)) ? (x(), A("div", {
              key: 0,
              class: "header-orb",
              style: Ee(ir.value)
            }, null, 4)) : dn.value || E(U) ? (x(), A("img", {
              key: 1,
              src: dn.value || E(U),
              alt: E(P).human_agent_name || E(r),
              class: "header-avatar"
            }, null, 8, Q_)) : ie("", !0),
            v("div", ey, [
              v("h3", {
                style: Ee(E(N))
              }, ee(E(P).human_agent_name || E(r)), 5),
              v("div", ty, [
                v("span", {
                  class: ze(["status-indicator", sr.value.online ? "online" : "away"])
                }, null, 2),
                v("span", ny, ee(sr.value.text), 1)
              ])
            ])
          ]),
          v("div", sy, [
            Z.value ? (x(), A("button", {
              key: 0,
              type: "button",
              class: ze(["header-new-chat", { armed: Ne.value }]),
              style: Ee(E(N)),
              disabled: Q.value,
              title: E(Ri),
              "aria-label": E(Ri),
              "aria-expanded": Ne.value,
              onClick: bt
            }, g[31] || (g[31] = [
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
            ]), 14, ry)) : ie("", !0),
            v("button", {
              type: "button",
              class: "header-minimize",
              style: Ee(E(N)),
              title: "Minimize",
              "aria-label": "Minimize chat",
              onClick: xs
            }, g[32] || (g[32] = [
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
        E(w) ? (x(), A("div", ly, g[33] || (g[33] = [
          v("div", { class: "loading-spinner" }, [
            v("div", { class: "dot" }),
            v("div", { class: "dot" }),
            v("div", { class: "dot" })
          ], -1)
        ]))) : ie("", !0),
        cs.value ? (x(), A("div", {
          key: 3,
          class: "cm-email-gate",
          style: Ee(E(Le))
        }, [
          v("div", {
            class: "cm-email-gate-orb",
            style: Ee(ir.value)
          }, null, 4),
          v("h3", cy, ee(E(s).welcome_title || "Before we start"), 1),
          g[34] || (g[34] = v("p", { class: "cm-email-gate-text" }, "Enter your email and we'll continue the chat.", -1)),
          Hn(v("input", {
            "onUpdate:modelValue": g[5] || (g[5] = (u) => Re.value = u),
            type: "email",
            inputmode: "email",
            autocomplete: "email",
            placeholder: "you@example.com",
            class: ze(["cm-email-gate-input", { invalid: !!Un.value }]),
            disabled: or.value,
            onKeyup: li(Fa, ["enter"]),
            onInput: g[6] || (g[6] = (u) => Un.value = "")
          }, null, 42, uy), [
            [ds, Re.value]
          ]),
          Un.value ? (x(), A("p", fy, ee(Un.value), 1)) : ie("", !0),
          v("button", {
            type: "button",
            class: "cm-email-gate-btn",
            style: Ee(E(_)),
            disabled: or.value,
            onClick: Fa
          }, ee(or.value ? "Please wait…" : "Continue to chat"), 13, hy)
        ], 4)) : ie("", !0),
        Ne.value && Z.value ? (x(), Ti(Eu, {
          key: 4,
          busy: Q.value,
          error: ae.value,
          onConfirm: Is,
          onCancel: ut
        }, null, 8, ["busy", "error"])) : ie("", !0),
        Hn(v("div", {
          class: "chat-messages",
          ref_key: "messagesContainer",
          ref: Me
        }, [
          Gu.value ? (x(), A("div", dy, [
            v("div", py, [
              Kr.value || !E(U) ? (x(), A("div", {
                key: 0,
                class: "cm-welcome-orb",
                style: Ee(ir.value)
              }, null, 4)) : (x(), A("img", {
                key: 1,
                src: E(U),
                alt: E(r),
                class: "cm-welcome-avatar"
              }, null, 8, gy)),
              v("div", {
                class: "message-bubble cm-welcome-bubble",
                style: Ee(E(f))
              }, ee(Oa.value), 5)
            ])
          ])) : ie("", !0),
          (x(!0), A(He, null, kt(E(l), (u, ne) => {
            var Ae, me, Ye, Ie, on, ar, zn, Ls, Ua, za, Ha, Wa, qa, ja, Va, Ka, Ga, Ya, Xa;
            return x(), A("div", {
              key: ne,
              class: ze([
                "message",
                u.message_type === "bot" || u.message_type === "agent" ? "agent-message" : u.message_type === "system" ? "system-message" : u.message_type === "rating" ? "rating-message" : u.message_type === "form" ? "form-message" : u.message_type === "product" || u.shopify_output ? "product-message" : "user-message"
              ])
            }, [
              u.message_type === "bot" || u.message_type === "agent" ? (x(), A("div", my, [
                dn.value ? (x(), A("img", {
                  key: 0,
                  src: dn.value,
                  class: "cm-msg-avatar-img",
                  alt: ""
                }, null, 8, _y)) : !Kr.value && E(U) ? (x(), A("img", {
                  key: 1,
                  src: E(U),
                  class: "cm-msg-avatar-img",
                  alt: ""
                }, null, 8, yy)) : (x(), A("div", {
                  key: 2,
                  class: "cm-msg-avatar-orb",
                  style: Ee(ir.value)
                }, null, 4))
              ])) : ie("", !0),
              v("div", vy, [
                v("div", {
                  class: "message-bubble",
                  style: Ee(u.message_type === "system" || u.message_type === "rating" || u.message_type === "form" || u.message_type === "product" || u.shopify_output ? {} : u.message_type === "user" ? E(_) : E(f))
                }, [
                  u.message_type === "rating" ? (x(), A("div", by, [
                    v("p", wy, "Rate the chat session that you had with " + ee(u.agent_name || E(P).human_agent_name || E(r) || "our agent"), 1),
                    v("div", {
                      class: ze(["star-rating", { submitted: Yt.value || u.isSubmitted }])
                    }, [
                      (x(), A(He, null, kt(5, (D) => v("button", {
                        key: D,
                        class: ze(["star-button", {
                          warning: D <= (u.isSubmitted ? u.finalRating : Gt.value || u.selectedRating) && (u.isSubmitted ? u.finalRating : Gt.value || u.selectedRating) <= 3,
                          success: D <= (u.isSubmitted ? u.finalRating : Gt.value || u.selectedRating) && (u.isSubmitted ? u.finalRating : Gt.value || u.selectedRating) > 3,
                          selected: D <= (u.isSubmitted ? u.finalRating : Gt.value || u.selectedRating)
                        }]),
                        onMouseover: (an) => !u.isSubmitted && Ss(D),
                        onMouseleave: (an) => !u.isSubmitted && Qs,
                        onClick: (an) => !u.isSubmitted && Es(D),
                        disabled: Yt.value || u.isSubmitted
                      }, " ★ ", 42, ky)), 64))
                    ], 2),
                    u.showFeedback && !u.isSubmitted ? (x(), A("div", Ty, [
                      v("div", xy, [
                        Hn(v("input", {
                          "onUpdate:modelValue": (D) => u.feedback = D,
                          placeholder: "Please share your feedback (optional)",
                          disabled: Yt.value,
                          maxlength: "500",
                          class: "feedback-input"
                        }, null, 8, Ay), [
                          [ds, u.feedback]
                        ]),
                        v("div", Sy, ee(((Ae = u.feedback) == null ? void 0 : Ae.length) || 0) + "/500", 1)
                      ]),
                      v("button", {
                        onClick: (D) => Bn(u.session_id, Gt.value, u.feedback),
                        disabled: Yt.value || !Gt.value,
                        class: "submit-rating-button",
                        style: Ee({ backgroundColor: E(s).accent_color || "var(--accent-solid)" })
                      }, ee(Yt.value ? "Submitting..." : "Submit Rating"), 13, Ey)
                    ])) : ie("", !0),
                    u.isSubmitted && u.finalFeedback ? (x(), A("div", Cy, [
                      v("div", Ry, [
                        v("p", Iy, ee(u.finalFeedback), 1)
                      ])
                    ])) : u.isSubmitted ? (x(), A("div", Ly, " Thank you for your rating! ")) : ie("", !0)
                  ])) : u.message_type === "form" ? (x(), A("div", Oy, [
                    (Ye = (me = u.attributes) == null ? void 0 : me.form_data) != null && Ye.title || (on = (Ie = u.attributes) == null ? void 0 : Ie.form_data) != null && on.description ? (x(), A("div", Ny, [
                      (zn = (ar = u.attributes) == null ? void 0 : ar.form_data) != null && zn.title ? (x(), A("h3", Py, ee(u.attributes.form_data.title), 1)) : ie("", !0),
                      (Ua = (Ls = u.attributes) == null ? void 0 : Ls.form_data) != null && Ua.description ? (x(), A("p", My, ee(u.attributes.form_data.description), 1)) : ie("", !0)
                    ])) : ie("", !0),
                    v("div", Dy, [
                      (x(!0), A(He, null, kt((Ha = (za = u.attributes) == null ? void 0 : za.form_data) == null ? void 0 : Ha.fields, (D) => {
                        var an, no;
                        return x(), A("div", {
                          key: D.name,
                          class: "form-field"
                        }, [
                          v("label", {
                            for: `form-${D.name}`,
                            class: "field-label"
                          }, [
                            En(ee(D.label) + " ", 1),
                            D.required ? (x(), A("span", $y, "*")) : ie("", !0)
                          ], 8, Fy),
                          D.type === "text" || D.type === "email" || D.type === "tel" ? (x(), A("input", {
                            key: 0,
                            id: `form-${D.name}`,
                            type: D.type,
                            placeholder: D.placeholder || "",
                            required: D.required,
                            minlength: D.minLength,
                            maxlength: D.maxLength,
                            value: ct.value[D.name] || "",
                            onInput: (je) => Et(D.name, je.target.value),
                            onBlur: (je) => Et(D.name, je.target.value),
                            class: ze(["form-input", { error: lt.value[D.name] }]),
                            disabled: tt.value,
                            autocomplete: D.type === "email" ? "email" : D.type === "tel" ? "tel" : "off",
                            inputmode: D.type === "tel" ? "tel" : D.type === "email" ? "email" : "text"
                          }, null, 42, By)) : D.type === "number" ? (x(), A("input", {
                            key: 1,
                            id: `form-${D.name}`,
                            type: "number",
                            placeholder: D.placeholder || "",
                            required: D.required,
                            min: D.min,
                            max: D.max,
                            value: ct.value[D.name] || "",
                            onInput: (je) => Et(D.name, je.target.value),
                            class: ze(["form-input", { error: lt.value[D.name] }]),
                            disabled: tt.value
                          }, null, 42, Uy)) : D.type === "textarea" ? (x(), A("textarea", {
                            key: 2,
                            id: `form-${D.name}`,
                            placeholder: D.placeholder || "",
                            required: D.required,
                            minlength: D.minLength,
                            maxlength: D.maxLength,
                            value: ct.value[D.name] || "",
                            onInput: (je) => Et(D.name, je.target.value),
                            class: ze(["form-textarea", { error: lt.value[D.name] }]),
                            disabled: tt.value,
                            rows: "3"
                          }, null, 42, zy)) : D.type === "select" ? (x(), A("select", {
                            key: 3,
                            id: `form-${D.name}`,
                            required: D.required,
                            value: ct.value[D.name] || "",
                            onChange: (je) => Et(D.name, je.target.value),
                            class: ze(["form-select", { error: lt.value[D.name] }]),
                            disabled: tt.value
                          }, [
                            v("option", Wy, ee(D.placeholder || "Select an option"), 1),
                            (x(!0), A(He, null, kt((Array.isArray(D.options) ? D.options : ((an = D.options) == null ? void 0 : an.split(`
`)) || []).filter((je) => je.trim()), (je) => (x(), A("option", {
                              key: je.trim(),
                              value: je.trim()
                            }, ee(je.trim()), 9, qy))), 128))
                          ], 42, Hy)) : D.type === "checkbox" ? (x(), A("div", jy, [
                            v("input", {
                              id: `form-${D.name}`,
                              type: "checkbox",
                              checked: ct.value[D.name] || !1,
                              onChange: (je) => Et(D.name, je.target.checked),
                              class: "form-checkbox",
                              disabled: tt.value
                            }, null, 40, Vy),
                            v("label", {
                              for: `form-${D.name}`,
                              class: "checkbox-label"
                            }, ee(D.placeholder || D.label), 9, Ky)
                          ])) : D.type === "radio" ? (x(), A("div", Gy, [
                            (x(!0), A(He, null, kt((Array.isArray(D.options) ? D.options : ((no = D.options) == null ? void 0 : no.split(`
`)) || []).filter((je) => je.trim()), (je) => (x(), A("div", {
                              key: je.trim(),
                              class: "radio-option"
                            }, [
                              v("input", {
                                id: `form-${D.name}-${je.trim()}`,
                                name: `form-${D.name}`,
                                type: "radio",
                                value: je.trim(),
                                checked: ct.value[D.name] === je.trim(),
                                onChange: (gb) => Et(D.name, je.trim()),
                                class: "form-radio",
                                disabled: tt.value
                              }, null, 40, Yy),
                              v("label", {
                                for: `form-${D.name}-${je.trim()}`,
                                class: "radio-label"
                              }, ee(je.trim()), 9, Xy)
                            ]))), 128))
                          ])) : ie("", !0),
                          lt.value[D.name] ? (x(), A("div", Zy, ee(lt.value[D.name]), 1)) : ie("", !0)
                        ]);
                      }), 128))
                    ]),
                    v("div", Jy, [
                      v("button", {
                        onClick: () => {
                          var D;
                          console.log("Regular form submit button clicked!"), Jt((D = u.attributes) == null ? void 0 : D.form_data);
                        },
                        disabled: tt.value,
                        class: "form-submit-button",
                        style: Ee(E(_))
                      }, ee(tt.value ? "Submitting..." : ((qa = (Wa = u.attributes) == null ? void 0 : Wa.form_data) == null ? void 0 : qa.submit_button_text) || "Submit"), 13, Qy)
                    ])
                  ])) : u.message_type === "user_input" ? (x(), A("div", ev, [
                    (ja = u.attributes) != null && ja.prompt_message && u.attributes.prompt_message.trim() ? (x(), A("div", tv, ee(u.attributes.prompt_message), 1)) : ie("", !0),
                    u.isSubmitted ? (x(), A("div", iv, [
                      g[35] || (g[35] = v("strong", null, "Your input:", -1)),
                      En(" " + ee(u.submittedValue) + " ", 1),
                      (Va = u.attributes) != null && Va.confirmation_message && u.attributes.confirmation_message.trim() ? (x(), A("div", ov, ee(u.attributes.confirmation_message), 1)) : ie("", !0)
                    ])) : (x(), A("div", nv, [
                      Hn(v("textarea", {
                        "onUpdate:modelValue": (D) => u.userInputValue = D,
                        class: "user-input-textarea",
                        placeholder: "Type your message here...",
                        rows: "3",
                        onKeydown: [
                          li(ms((D) => Rs(u), ["ctrl"]), ["enter"]),
                          li(ms((D) => Rs(u), ["meta"]), ["enter"])
                        ]
                      }, null, 40, sv), [
                        [ds, u.userInputValue]
                      ]),
                      v("button", {
                        class: "user-input-submit-button",
                        onClick: (D) => Rs(u),
                        disabled: !u.userInputValue || !u.userInputValue.trim()
                      }, " Submit ", 8, rv)
                    ]))
                  ])) : u.shopify_output || u.message_type === "product" ? (x(), A("div", av, [
                    u.message ? (x(), A("div", {
                      key: 0,
                      innerHTML: E(ui)(((Ga = (Ka = u.shopify_output) == null ? void 0 : Ka.products) == null ? void 0 : Ga.length) > 0 ? jr(u.message) : u.message),
                      class: "product-message-text"
                    }, null, 8, lv)) : ie("", !0),
                    (Ya = u.shopify_output) != null && Ya.products && u.shopify_output.products.length > 0 ? (x(), A("div", cv, [
                      g[37] || (g[37] = v("h3", { class: "carousel-title" }, "Products", -1)),
                      v("div", uv, [
                        (x(!0), A(He, null, kt(u.shopify_output.products, (D) => {
                          var an;
                          return x(), A("div", {
                            key: D.id,
                            class: "product-card-compact carousel-item"
                          }, [
                            (an = D.image) != null && an.src ? (x(), A("div", fv, [
                              v("img", {
                                src: D.image.src,
                                alt: D.title,
                                class: "product-thumbnail"
                              }, null, 8, hv)
                            ])) : ie("", !0),
                            v("div", dv, [
                              v("div", pv, [
                                v("div", gv, ee(D.title), 1),
                                D.variant_title && D.variant_title !== "Default Title" ? (x(), A("div", mv, ee(D.variant_title), 1)) : ie("", !0),
                                v("div", _v, ee(D.price_formatted || E(a)(D.price, D.currency)), 1)
                              ]),
                              v("div", yv, [
                                v("button", {
                                  class: "view-details-button-compact",
                                  onClick: (no) => {
                                    var je;
                                    return qr(D, (je = u.shopify_output) == null ? void 0 : je.shop_domain);
                                  }
                                }, g[36] || (g[36] = [
                                  En(" View product ", -1),
                                  v("span", { class: "external-link-icon" }, "↗", -1)
                                ]), 8, vv)
                              ])
                            ])
                          ]);
                        }), 128))
                      ])
                    ])) : !u.message && ((Xa = u.shopify_output) != null && Xa.products) && u.shopify_output.products.length === 0 ? (x(), A("div", bv, g[38] || (g[38] = [
                      v("p", null, "No products found.", -1)
                    ]))) : !u.message && u.shopify_output && !u.shopify_output.products ? (x(), A("div", wv, g[39] || (g[39] = [
                      v("p", null, "No products to display.", -1)
                    ]))) : ie("", !0)
                  ])) : (x(), A(He, { key: 4 }, [
                    E(Ze)(ne) ? (x(), A("div", {
                      key: 0,
                      class: "message-streaming",
                      innerHTML: E(ui)(E(ge)(ne, u.message))
                    }, null, 8, kv)) : (x(), A("div", {
                      key: 1,
                      innerHTML: E(ui)(u.message)
                    }, null, 8, Tv)),
                    u.attachments && u.attachments.length > 0 ? (x(), A("div", xv, [
                      (x(!0), A(He, null, kt(u.attachments, (D) => (x(), A("div", {
                        key: D.id,
                        class: "attachment-item"
                      }, [
                        E(it)(D.content_type) ? (x(), A("div", Av, [
                          v("img", {
                            src: E(mt)(D.file_url),
                            alt: D.filename,
                            class: "attachment-image",
                            onClick: ms((an) => E(fn)({ url: D.file_url, filename: D.filename, type: D.content_type, file_url: E(mt)(D.file_url), size: void 0 }), ["stop"]),
                            style: { cursor: "pointer" }
                          }, null, 8, Sv),
                          v("div", Ev, [
                            v("a", {
                              href: E(mt)(D.file_url),
                              target: "_blank",
                              class: "attachment-link"
                            }, [
                              g[40] || (g[40] = v("svg", {
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
                              En(" " + ee(D.filename) + " ", 1),
                              v("span", Rv, "(" + ee(E(De)(D.file_size)) + ")", 1)
                            ], 8, Cv)
                          ])
                        ])) : (x(), A("a", {
                          key: 1,
                          href: E(mt)(D.file_url),
                          target: "_blank",
                          class: "attachment-link"
                        }, [
                          g[41] || (g[41] = v("svg", {
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
                          En(" " + ee(D.filename) + " ", 1),
                          v("span", Lv, "(" + ee(E(De)(D.file_size)) + ")", 1)
                        ], 8, Iv))
                      ]))), 128))
                    ])) : ie("", !0)
                  ], 64))
                ], 4),
                Gr.value && (u.message_type === "bot" || u.message_type === "agent") && u.sources && u.sources.length ? (x(), A("div", Ov, [
                  g[42] || (g[42] = v("span", { class: "citation-label" }, "Sources", -1)),
                  (x(!0), A(He, null, kt(u.sources, (D, an) => (x(), A("span", {
                    key: an,
                    class: "citation-chip",
                    title: Ma(D)
                  }, ee(Zi(D)), 9, Nv))), 128))
                ])) : ie("", !0),
                v("div", Pv, [
                  u.message_type === "user" ? (x(), A("span", Mv, " You ")) : ie("", !0)
                ])
              ])
            ], 2);
          }), 128)),
          E(p) ? (x(), A("div", {
            key: 1,
            class: ze(["typing-indicator", { "reading-indicator": Gr.value }])
          }, [
            Gr.value ? (x(), A(He, { key: 0 }, [
              g[43] || (g[43] = v("div", {
                class: "reading-bars",
                "aria-hidden": "true"
              }, [
                v("span"),
                v("span"),
                v("span")
              ], -1)),
              g[44] || (g[44] = v("span", { class: "reading-label" }, "reading knowledge base", -1))
            ], 64)) : (x(), A("div", {
              key: 1,
              class: "cm-typing-bubble",
              style: Ee(E(f))
            }, g[45] || (g[45] = [
              v("span", { class: "cm-typing-dot" }, null, -1),
              v("span", { class: "cm-typing-dot" }, null, -1),
              v("span", { class: "cm-typing-dot" }, null, -1)
            ]), 4))
          ], 2)) : ie("", !0)
        ], 512), [
          [rd, !cs.value]
        ]),
        Yu.value ? (x(), A("div", Dv, [
          (x(!0), A(He, null, kt(Yi.value, (u) => (x(), A("button", {
            key: u,
            type: "button",
            class: "cm-quick-action",
            disabled: !xn.value,
            onClick: (ne) => Fn(u)
          }, ee(u), 9, Fv))), 128))
        ])) : ie("", !0),
        !is.value && !cs.value ? (x(), A("div", {
          key: 6,
          class: ze(["chat-input", { "ask-anything-input": Qt.value }])
        }, [
          v("input", {
            ref_key: "fileInputRef",
            ref: se,
            type: "file",
            accept: cb,
            multiple: "",
            style: { display: "none" },
            onChange: g[7] || (g[7] = //@ts-ignore
            (...u) => E(es) && E(es)(...u))
          }, null, 544),
          E(ye).length > 0 ? (x(), A("div", $v, [
            (x(!0), A(He, null, kt(E(ye), (u, ne) => (x(), A("div", {
              key: ne,
              class: "file-preview-widget"
            }, [
              v("div", Bv, [
                E(Br)(u.type) ? (x(), A("img", {
                  key: 0,
                  src: E(Vt)(u),
                  alt: u.filename,
                  class: "file-preview-image-widget",
                  onClick: ms((Ae) => E(fn)(u), ["stop"]),
                  style: { cursor: "pointer" }
                }, null, 8, Uv)) : (x(), A("div", {
                  key: 1,
                  class: "file-preview-icon-widget",
                  onClick: ms((Ae) => E(fn)(u), ["stop"]),
                  style: { cursor: "pointer" }
                }, g[46] || (g[46] = [
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
                ]), 8, zv))
              ]),
              v("div", Hv, [
                v("div", Wv, ee(u.filename), 1),
                v("div", qv, ee(E(De)(u.size)), 1)
              ]),
              v("button", {
                type: "button",
                class: "file-preview-remove-widget",
                onClick: (Ae) => E(Kt)(ne),
                title: "Remove file"
              }, " × ", 8, jv)
            ]))), 128))
          ])) : ie("", !0),
          tr.value ? (x(), A("div", Vv, g[47] || (g[47] = [
            v("div", { class: "upload-spinner-widget" }, null, -1),
            v("span", { class: "upload-text-widget" }, "Uploading files...", -1)
          ]))) : ie("", !0),
          v("div", Kv, [
            Hn(v("input", {
              "onUpdate:modelValue": g[8] || (g[8] = (u) => xe.value = u),
              type: "text",
              placeholder: Ts.value,
              onKeypress: Ur,
              onInput: Ut,
              onChange: Ut,
              onPaste: g[9] || (g[9] = //@ts-ignore
              (...u) => E(ns) && E(ns)(...u)),
              onDrop: g[10] || (g[10] = //@ts-ignore
              (...u) => E(Ks) && E(Ks)(...u)),
              onDragover: g[11] || (g[11] = //@ts-ignore
              (...u) => E(Gs) && E(Gs)(...u)),
              onDragleave: g[12] || (g[12] = //@ts-ignore
              (...u) => E(ts) && E(ts)(...u)),
              disabled: !An.value,
              class: ze({ disabled: !An.value, "ask-anything-field": Qt.value })
            }, null, 42, Gv), [
              [ds, xe.value]
            ]),
            Ki.value ? (x(), A("button", {
              key: 0,
              type: "button",
              class: "attach-button",
              disabled: tr.value,
              onClick: g[13] || (g[13] = //@ts-ignore
              (...u) => E(ks) && E(ks)(...u)),
              title: `Attach files (${E(ye).length}/${lc} used) or paste screenshots`
            }, g[48] || (g[48] = [
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
            ]), 8, Yv)) : ie("", !0),
            v("button", {
              class: ze(["send-button", { "ask-anything-send": Qt.value }]),
              style: Ee(E(_)),
              onClick: hn,
              disabled: !xe.value.trim() && E(ye).length === 0 || !xn.value
            }, g[49] || (g[49] = [
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
            ]), 14, Xv)
          ])
        ], 2)) : is.value && !cs.value ? (x(), A("div", Zv, [
          v("div", Jv, [
            g[50] || (g[50] = v("p", { class: "ended-text" }, "This chat has ended.", -1)),
            v("button", {
              class: "start-new-conversation-button",
              style: Ee(E(_)),
              onClick: Vr
            }, " Click here to start a new conversation ", 4)
          ])
        ])) : ie("", !0),
        Pa.value ? (x(), A("div", {
          key: 8,
          class: "ai-disclaimer",
          style: Ee(E(N))
        }, ee(E(Yl)), 5)) : ie("", !0),
        v("div", {
          class: "powered-by",
          style: Ee(E(N))
        }, g[51] || (g[51] = [
          hs('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-5c1a625d><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-5c1a625d></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-5c1a625d></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-5c1a625d></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-5c1a625d></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-5c1a625d><span class="cm-powered-prefix" data-v-5c1a625d>Powered by </span><strong class="cm-brand" data-v-5c1a625d>ChatterMate</strong></a>', 2)
        ]), 4)
      ], 6)) : ie("", !0),
      Zs.value ? (x(), A("div", Qv, [
        v("div", eb, [
          g[52] || (g[52] = v("h3", null, "Rate your conversation", -1)),
          v("div", tb, [
            (x(), A(He, null, kt(5, (u) => v("button", {
              key: u,
              onClick: (ne) => rs.value = u,
              class: ze([{ active: u <= rs.value }, "star-button"])
            }, " ★ ", 10, nb)), 64))
          ]),
          Hn(v("textarea", {
            "onUpdate:modelValue": g[14] || (g[14] = (u) => Js.value = u),
            placeholder: "Additional feedback (optional)",
            class: "rating-feedback"
          }, null, 512), [
            [ds, Js.value]
          ]),
          v("div", sb, [
            v("button", {
              onClick: g[15] || (g[15] = (u) => d.submitRating(rs.value, Js.value)),
              disabled: !rs.value,
              class: "submit-button",
              style: Ee(E(_))
            }, " Submit ", 12, rb),
            v("button", {
              onClick: g[16] || (g[16] = (u) => Zs.value = !1),
              class: "skip-rating"
            }, " Skip ")
          ])
        ])
      ])) : ie("", !0),
      E(Oe) ? (x(), A("div", {
        key: 9,
        class: "preview-modal-overlay",
        onClick: g[19] || (g[19] = //@ts-ignore
        (...u) => E(Dn) && E(Dn)(...u))
      }, [
        v("div", {
          class: "preview-modal-content",
          onClick: g[18] || (g[18] = ms(() => {
          }, ["stop"]))
        }, [
          v("button", {
            class: "preview-modal-close",
            onClick: g[17] || (g[17] = //@ts-ignore
            (...u) => E(Dn) && E(Dn)(...u))
          }, "×"),
          E($e) && E(Br)(E($e).type) ? (x(), A("div", ib, [
            v("img", {
              src: E(Vt)(E($e)),
              alt: E($e).filename,
              class: "preview-modal-image"
            }, null, 8, ob),
            v("div", ab, ee(E($e).filename), 1)
          ])) : ie("", !0)
        ])
      ])) : ie("", !0)
    ], 6)) : (x(), A("div", lb));
  }
}), fb = /* @__PURE__ */ xa(ub, [["__scopeId", "data-v-5c1a625d"]]);
window.process || (window.process = { env: { NODE_ENV: "production" } });
const nn = window.__INITIAL_DATA__, Hu = new URL(window.location.href), Wu = Hu.searchParams.get("preview") === "true", qu = (e) => {
  const t = Hu.searchParams.get(e);
  if (!(!t || t === "undefined" || t.trim() === ""))
    return t;
}, hb = Wu ? qu("widget_id") || (nn == null ? void 0 : nn.widgetId) || void 0 : (nn == null ? void 0 : nn.widgetId) || void 0, db = Wu ? (nn == null ? void 0 : nn.initialToken) || qu("token") || void 0 : (nn == null ? void 0 : nn.initialToken) || void 0, pb = xd(fb, {
  widgetId: hb,
  token: db || void 0,
  initialAuthError: null
  // Let backend determine if auth is required
});
pb.mount("#app");
