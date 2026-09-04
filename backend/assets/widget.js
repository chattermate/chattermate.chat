var $u = Object.defineProperty;
var Uu = (e, t, n) => t in e ? $u(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var Je = (e, t, n) => Uu(e, typeof t != "symbol" ? t + "" : t, n);
/**
* @vue/shared v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function po(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const n of e.split(",")) t[n] = 1;
  return (n) => n in t;
}
const Qe = {}, os = [], rn = () => {
}, zu = () => !1, Kr = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), go = (e) => e.startsWith("onUpdate:"), wt = Object.assign, mo = (e, t) => {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}, Hu = Object.prototype.hasOwnProperty, qe = (e, t) => Hu.call(e, t), he = Array.isArray, as = (e) => Gr(e) === "[object Map]", Tl = (e) => Gr(e) === "[object Set]", ge = (e) => typeof e == "function", ft = (e) => typeof e == "string", Dn = (e) => typeof e == "symbol", ot = (e) => e !== null && typeof e == "object", Al = (e) => (ot(e) || ge(e)) && ge(e.then) && ge(e.catch), El = Object.prototype.toString, Gr = (e) => El.call(e), Wu = (e) => Gr(e).slice(8, -1), Sl = (e) => Gr(e) === "[object Object]", _o = (e) => ft(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, $s = /* @__PURE__ */ po(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), Yr = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (n) => t[n] || (t[n] = e(n));
}, qu = /-(\w)/g, Mn = Yr(
  (e) => e.replace(qu, (t, n) => n ? n.toUpperCase() : "")
), ju = /\B([A-Z])/g, Bn = Yr(
  (e) => e.replace(ju, "-$1").toLowerCase()
), Cl = Yr((e) => e.charAt(0).toUpperCase() + e.slice(1)), bi = Yr(
  (e) => e ? `on${Cl(e)}` : ""
), On = (e, t) => !Object.is(e, t), br = (e, ...t) => {
  for (let n = 0; n < e.length; n++)
    e[n](...t);
}, qi = (e, t, n, s = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: s,
    value: n
  });
}, ji = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let va;
const Xr = () => va || (va = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function ke(e) {
  if (he(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
      const s = e[n], r = ft(s) ? Yu(s) : ke(s);
      if (r)
        for (const i in r)
          t[i] = r[i];
    }
    return t;
  } else if (ft(e) || ot(e))
    return e;
}
const Vu = /;(?![^(]*\))/g, Ku = /:([^]+)/, Gu = /\/\*[^]*?\*\//g;
function Yu(e) {
  const t = {};
  return e.replace(Gu, "").split(Vu).forEach((n) => {
    if (n) {
      const s = n.split(Ku);
      s.length > 1 && (t[s[0].trim()] = s[1].trim());
    }
  }), t;
}
function Be(e) {
  let t = "";
  if (ft(e))
    t = e;
  else if (he(e))
    for (let n = 0; n < e.length; n++) {
      const s = Be(e[n]);
      s && (t += s + " ");
    }
  else if (ot(e))
    for (const n in e)
      e[n] && (t += n + " ");
  return t.trim();
}
const Xu = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", Zu = /* @__PURE__ */ po(Xu);
function Rl(e) {
  return !!e || e === "";
}
const Il = (e) => !!(e && e.__v_isRef === !0), Z = (e) => ft(e) ? e : e == null ? "" : he(e) || ot(e) && (e.toString === El || !ge(e.toString)) ? Il(e) ? Z(e.value) : JSON.stringify(e, Ll, 2) : String(e), Ll = (e, t) => Il(t) ? Ll(e, t.value) : as(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (n, [s, r], i) => (n[wi(s, i) + " =>"] = r, n),
    {}
  )
} : Tl(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((n) => wi(n))
} : Dn(t) ? wi(t) : ot(t) && !he(t) && !Sl(t) ? String(t) : t, wi = (e, t = "") => {
  var n;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    Dn(e) ? `Symbol(${(n = e.description) != null ? n : t})` : e
  );
};
/**
* @vue/reactivity v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let Mt;
class Ju {
  constructor(t = !1) {
    this.detached = t, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this.parent = Mt, !t && Mt && (this.index = (Mt.scopes || (Mt.scopes = [])).push(
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
      const n = Mt;
      try {
        return Mt = this, t();
      } finally {
        Mt = n;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = Mt, Mt = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    this._on > 0 && --this._on === 0 && (Mt = this.prevScope, this.prevScope = void 0);
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
function Qu() {
  return Mt;
}
let tt;
const ki = /* @__PURE__ */ new WeakSet();
class Ol {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, Mt && Mt.active && Mt.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, ki.has(this) && (ki.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Ml(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, ba(this), Pl(this);
    const t = tt, n = Xt;
    tt = this, Xt = !0;
    try {
      return this.fn();
    } finally {
      Fl(this), tt = t, Xt = n, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        bo(t);
      this.deps = this.depsTail = void 0, ba(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? ki.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    Vi(this) && this.run();
  }
  get dirty() {
    return Vi(this);
  }
}
let Nl = 0, Us, zs;
function Ml(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = zs, zs = e;
    return;
  }
  e.next = Us, Us = e;
}
function yo() {
  Nl++;
}
function vo() {
  if (--Nl > 0)
    return;
  if (zs) {
    let t = zs;
    for (zs = void 0; t; ) {
      const n = t.next;
      t.next = void 0, t.flags &= -9, t = n;
    }
  }
  let e;
  for (; Us; ) {
    let t = Us;
    for (Us = void 0; t; ) {
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
function Pl(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Fl(e) {
  let t, n = e.depsTail, s = n;
  for (; s; ) {
    const r = s.prevDep;
    s.version === -1 ? (s === n && (n = r), bo(s), ef(s)) : t = s, s.dep.activeLink = s.prevActiveLink, s.prevActiveLink = void 0, s = r;
  }
  e.deps = t, e.depsTail = n;
}
function Vi(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (Dl(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function Dl(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === Ks) || (e.globalVersion = Ks, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !Vi(e))))
    return;
  e.flags |= 2;
  const t = e.dep, n = tt, s = Xt;
  tt = e, Xt = !0;
  try {
    Pl(e);
    const r = e.fn(e._value);
    (t.version === 0 || On(r, e._value)) && (e.flags |= 128, e._value = r, t.version++);
  } catch (r) {
    throw t.version++, r;
  } finally {
    tt = n, Xt = s, Fl(e), e.flags &= -3;
  }
}
function bo(e, t = !1) {
  const { dep: n, prevSub: s, nextSub: r } = e;
  if (s && (s.nextSub = r, e.prevSub = void 0), r && (r.prevSub = s, e.nextSub = void 0), n.subs === e && (n.subs = s, !s && n.computed)) {
    n.computed.flags &= -5;
    for (let i = n.computed.deps; i; i = i.nextDep)
      bo(i, !0);
  }
  !t && !--n.sc && n.map && n.map.delete(n.key);
}
function ef(e) {
  const { prevDep: t, nextDep: n } = e;
  t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
let Xt = !0;
const Bl = [];
function yn() {
  Bl.push(Xt), Xt = !1;
}
function vn() {
  const e = Bl.pop();
  Xt = e === void 0 ? !0 : e;
}
function ba(e) {
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
let Ks = 0;
class tf {
  constructor(t, n) {
    this.sub = t, this.dep = n, this.version = n.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class wo {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(t) {
    if (!tt || !Xt || tt === this.computed)
      return;
    let n = this.activeLink;
    if (n === void 0 || n.sub !== tt)
      n = this.activeLink = new tf(tt, this), tt.deps ? (n.prevDep = tt.depsTail, tt.depsTail.nextDep = n, tt.depsTail = n) : tt.deps = tt.depsTail = n, $l(n);
    else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
      const s = n.nextDep;
      s.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = s), n.prevDep = tt.depsTail, n.nextDep = void 0, tt.depsTail.nextDep = n, tt.depsTail = n, tt.deps === n && (tt.deps = s);
    }
    return n;
  }
  trigger(t) {
    this.version++, Ks++, this.notify(t);
  }
  notify(t) {
    yo();
    try {
      for (let n = this.subs; n; n = n.prevSub)
        n.sub.notify() && n.sub.dep.notify();
    } finally {
      vo();
    }
  }
}
function $l(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let s = t.deps; s; s = s.nextDep)
        $l(s);
    }
    const n = e.dep.subs;
    n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
  }
}
const Ki = /* @__PURE__ */ new WeakMap(), Xn = Symbol(
  ""
), Gi = Symbol(
  ""
), Gs = Symbol(
  ""
);
function vt(e, t, n) {
  if (Xt && tt) {
    let s = Ki.get(e);
    s || Ki.set(e, s = /* @__PURE__ */ new Map());
    let r = s.get(n);
    r || (s.set(n, r = new wo()), r.map = s, r.key = n), r.track();
  }
}
function pn(e, t, n, s, r, i) {
  const o = Ki.get(e);
  if (!o) {
    Ks++;
    return;
  }
  const a = (l) => {
    l && l.trigger();
  };
  if (yo(), t === "clear")
    o.forEach(a);
  else {
    const l = he(e), d = l && _o(n);
    if (l && n === "length") {
      const c = Number(s);
      o.forEach((b, w) => {
        (w === "length" || w === Gs || !Dn(w) && w >= c) && a(b);
      });
    } else
      switch ((n !== void 0 || o.has(void 0)) && a(o.get(n)), d && a(o.get(Gs)), t) {
        case "add":
          l ? d && a(o.get("length")) : (a(o.get(Xn)), as(e) && a(o.get(Gi)));
          break;
        case "delete":
          l || (a(o.get(Xn)), as(e) && a(o.get(Gi)));
          break;
        case "set":
          as(e) && a(o.get(Xn));
          break;
      }
  }
  vo();
}
function ss(e) {
  const t = We(e);
  return t === e ? t : (vt(t, "iterate", Gs), Ht(e) ? t : t.map(gt));
}
function Zr(e) {
  return vt(e = We(e), "iterate", Gs), e;
}
const nf = {
  __proto__: null,
  [Symbol.iterator]() {
    return xi(this, Symbol.iterator, gt);
  },
  concat(...e) {
    return ss(this).concat(
      ...e.map((t) => he(t) ? ss(t) : t)
    );
  },
  entries() {
    return xi(this, "entries", (e) => (e[1] = gt(e[1]), e));
  },
  every(e, t) {
    return un(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return un(this, "filter", e, t, (n) => n.map(gt), arguments);
  },
  find(e, t) {
    return un(this, "find", e, t, gt, arguments);
  },
  findIndex(e, t) {
    return un(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return un(this, "findLast", e, t, gt, arguments);
  },
  findLastIndex(e, t) {
    return un(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return un(this, "forEach", e, t, void 0, arguments);
  },
  includes(...e) {
    return Ti(this, "includes", e);
  },
  indexOf(...e) {
    return Ti(this, "indexOf", e);
  },
  join(e) {
    return ss(this).join(e);
  },
  // keys() iterator only reads `length`, no optimisation required
  lastIndexOf(...e) {
    return Ti(this, "lastIndexOf", e);
  },
  map(e, t) {
    return un(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return Ts(this, "pop");
  },
  push(...e) {
    return Ts(this, "push", e);
  },
  reduce(e, ...t) {
    return wa(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return wa(this, "reduceRight", e, t);
  },
  shift() {
    return Ts(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return un(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return Ts(this, "splice", e);
  },
  toReversed() {
    return ss(this).toReversed();
  },
  toSorted(e) {
    return ss(this).toSorted(e);
  },
  toSpliced(...e) {
    return ss(this).toSpliced(...e);
  },
  unshift(...e) {
    return Ts(this, "unshift", e);
  },
  values() {
    return xi(this, "values", gt);
  }
};
function xi(e, t, n) {
  const s = Zr(e), r = s[t]();
  return s !== e && !Ht(e) && (r._next = r.next, r.next = () => {
    const i = r._next();
    return i.value && (i.value = n(i.value)), i;
  }), r;
}
const sf = Array.prototype;
function un(e, t, n, s, r, i) {
  const o = Zr(e), a = o !== e && !Ht(e), l = o[t];
  if (l !== sf[t]) {
    const b = l.apply(e, i);
    return a ? gt(b) : b;
  }
  let d = n;
  o !== e && (a ? d = function(b, w) {
    return n.call(this, gt(b), w, e);
  } : n.length > 2 && (d = function(b, w) {
    return n.call(this, b, w, e);
  }));
  const c = l.call(o, d, s);
  return a && r ? r(c) : c;
}
function wa(e, t, n, s) {
  const r = Zr(e);
  let i = n;
  return r !== e && (Ht(e) ? n.length > 3 && (i = function(o, a, l) {
    return n.call(this, o, a, l, e);
  }) : i = function(o, a, l) {
    return n.call(this, o, gt(a), l, e);
  }), r[t](i, ...s);
}
function Ti(e, t, n) {
  const s = We(e);
  vt(s, "iterate", Gs);
  const r = s[t](...n);
  return (r === -1 || r === !1) && To(n[0]) ? (n[0] = We(n[0]), s[t](...n)) : r;
}
function Ts(e, t, n = []) {
  yn(), yo();
  const s = We(e)[t].apply(e, n);
  return vo(), vn(), s;
}
const rf = /* @__PURE__ */ po("__proto__,__v_isRef,__isVue"), Ul = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(Dn)
);
function of(e) {
  Dn(e) || (e = String(e));
  const t = We(this);
  return vt(t, "has", e), t.hasOwnProperty(e);
}
class zl {
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
      return s === (r ? i ? mf : jl : i ? ql : Wl).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(s) ? t : void 0;
    const o = he(t);
    if (!r) {
      let l;
      if (o && (l = nf[n]))
        return l;
      if (n === "hasOwnProperty")
        return of;
    }
    const a = Reflect.get(
      t,
      n,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      bt(t) ? t : s
    );
    return (Dn(n) ? Ul.has(n) : rf(n)) || (r || vt(t, "get", n), i) ? a : bt(a) ? o && _o(n) ? a : a.value : ot(a) ? r ? Vl(a) : Jr(a) : a;
  }
}
class Hl extends zl {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, n, s, r) {
    let i = t[n];
    if (!this._isShallow) {
      const l = Pn(i);
      if (!Ht(s) && !Pn(s) && (i = We(i), s = We(s)), !he(t) && bt(i) && !bt(s))
        return l ? !1 : (i.value = s, !0);
    }
    const o = he(t) && _o(n) ? Number(n) < t.length : qe(t, n), a = Reflect.set(
      t,
      n,
      s,
      bt(t) ? t : r
    );
    return t === We(r) && (o ? On(s, i) && pn(t, "set", n, s) : pn(t, "add", n, s)), a;
  }
  deleteProperty(t, n) {
    const s = qe(t, n);
    t[n];
    const r = Reflect.deleteProperty(t, n);
    return r && s && pn(t, "delete", n, void 0), r;
  }
  has(t, n) {
    const s = Reflect.has(t, n);
    return (!Dn(n) || !Ul.has(n)) && vt(t, "has", n), s;
  }
  ownKeys(t) {
    return vt(
      t,
      "iterate",
      he(t) ? "length" : Xn
    ), Reflect.ownKeys(t);
  }
}
class af extends zl {
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
const lf = /* @__PURE__ */ new Hl(), cf = /* @__PURE__ */ new af(), uf = /* @__PURE__ */ new Hl(!0);
const Yi = (e) => e, hr = (e) => Reflect.getPrototypeOf(e);
function ff(e, t, n) {
  return function(...s) {
    const r = this.__v_raw, i = We(r), o = as(i), a = e === "entries" || e === Symbol.iterator && o, l = e === "keys" && o, d = r[e](...s), c = n ? Yi : t ? Mr : gt;
    return !t && vt(
      i,
      "iterate",
      l ? Gi : Xn
    ), {
      // iterator protocol
      next() {
        const { value: b, done: w } = d.next();
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
function dr(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function hf(e, t) {
  const n = {
    get(r) {
      const i = this.__v_raw, o = We(i), a = We(r);
      e || (On(r, a) && vt(o, "get", r), vt(o, "get", a));
      const { has: l } = hr(o), d = t ? Yi : e ? Mr : gt;
      if (l.call(o, r))
        return d(i.get(r));
      if (l.call(o, a))
        return d(i.get(a));
      i !== o && i.get(r);
    },
    get size() {
      const r = this.__v_raw;
      return !e && vt(We(r), "iterate", Xn), Reflect.get(r, "size", r);
    },
    has(r) {
      const i = this.__v_raw, o = We(i), a = We(r);
      return e || (On(r, a) && vt(o, "has", r), vt(o, "has", a)), r === a ? i.has(r) : i.has(r) || i.has(a);
    },
    forEach(r, i) {
      const o = this, a = o.__v_raw, l = We(a), d = t ? Yi : e ? Mr : gt;
      return !e && vt(l, "iterate", Xn), a.forEach((c, b) => r.call(i, d(c), d(b), o));
    }
  };
  return wt(
    n,
    e ? {
      add: dr("add"),
      set: dr("set"),
      delete: dr("delete"),
      clear: dr("clear")
    } : {
      add(r) {
        !t && !Ht(r) && !Pn(r) && (r = We(r));
        const i = We(this);
        return hr(i).has.call(i, r) || (i.add(r), pn(i, "add", r, r)), this;
      },
      set(r, i) {
        !t && !Ht(i) && !Pn(i) && (i = We(i));
        const o = We(this), { has: a, get: l } = hr(o);
        let d = a.call(o, r);
        d || (r = We(r), d = a.call(o, r));
        const c = l.call(o, r);
        return o.set(r, i), d ? On(i, c) && pn(o, "set", r, i) : pn(o, "add", r, i), this;
      },
      delete(r) {
        const i = We(this), { has: o, get: a } = hr(i);
        let l = o.call(i, r);
        l || (r = We(r), l = o.call(i, r)), a && a.call(i, r);
        const d = i.delete(r);
        return l && pn(i, "delete", r, void 0), d;
      },
      clear() {
        const r = We(this), i = r.size !== 0, o = r.clear();
        return i && pn(
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
    n[r] = ff(r, e, t);
  }), n;
}
function ko(e, t) {
  const n = hf(e, t);
  return (s, r, i) => r === "__v_isReactive" ? !e : r === "__v_isReadonly" ? e : r === "__v_raw" ? s : Reflect.get(
    qe(n, r) && r in s ? n : s,
    r,
    i
  );
}
const df = {
  get: /* @__PURE__ */ ko(!1, !1)
}, pf = {
  get: /* @__PURE__ */ ko(!1, !0)
}, gf = {
  get: /* @__PURE__ */ ko(!0, !1)
};
const Wl = /* @__PURE__ */ new WeakMap(), ql = /* @__PURE__ */ new WeakMap(), jl = /* @__PURE__ */ new WeakMap(), mf = /* @__PURE__ */ new WeakMap();
function _f(e) {
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
function yf(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : _f(Wu(e));
}
function Jr(e) {
  return Pn(e) ? e : xo(
    e,
    !1,
    lf,
    df,
    Wl
  );
}
function vf(e) {
  return xo(
    e,
    !1,
    uf,
    pf,
    ql
  );
}
function Vl(e) {
  return xo(
    e,
    !0,
    cf,
    gf,
    jl
  );
}
function xo(e, t, n, s, r) {
  if (!ot(e) || e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const i = yf(e);
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
function ls(e) {
  return Pn(e) ? ls(e.__v_raw) : !!(e && e.__v_isReactive);
}
function Pn(e) {
  return !!(e && e.__v_isReadonly);
}
function Ht(e) {
  return !!(e && e.__v_isShallow);
}
function To(e) {
  return e ? !!e.__v_raw : !1;
}
function We(e) {
  const t = e && e.__v_raw;
  return t ? We(t) : e;
}
function bf(e) {
  return !qe(e, "__v_skip") && Object.isExtensible(e) && qi(e, "__v_skip", !0), e;
}
const gt = (e) => ot(e) ? Jr(e) : e, Mr = (e) => ot(e) ? Vl(e) : e;
function bt(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function re(e) {
  return wf(e, !1);
}
function wf(e, t) {
  return bt(e) ? e : new kf(e, t);
}
class kf {
  constructor(t, n) {
    this.dep = new wo(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? t : We(t), this._value = n ? t : gt(t), this.__v_isShallow = n;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const n = this._rawValue, s = this.__v_isShallow || Ht(t) || Pn(t);
    t = s ? t : We(t), On(t, n) && (this._rawValue = t, this._value = s ? t : gt(t), this.dep.trigger());
  }
}
function R(e) {
  return bt(e) ? e.value : e;
}
const xf = {
  get: (e, t, n) => t === "__v_raw" ? e : R(Reflect.get(e, t, n)),
  set: (e, t, n, s) => {
    const r = e[t];
    return bt(r) && !bt(n) ? (r.value = n, !0) : Reflect.set(e, t, n, s);
  }
};
function Kl(e) {
  return ls(e) ? e : new Proxy(e, xf);
}
class Tf {
  constructor(t, n, s) {
    this.fn = t, this.setter = n, this._value = void 0, this.dep = new wo(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Ks - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = s;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    tt !== this)
      return Ml(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return Dl(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
function Af(e, t, n = !1) {
  let s, r;
  return ge(e) ? s = e : (s = e.get, r = e.set), new Tf(s, r, n);
}
const pr = {}, Pr = /* @__PURE__ */ new WeakMap();
let Gn;
function Ef(e, t = !1, n = Gn) {
  if (n) {
    let s = Pr.get(n);
    s || Pr.set(n, s = []), s.push(e);
  }
}
function Sf(e, t, n = Qe) {
  const { immediate: s, deep: r, once: i, scheduler: o, augmentJob: a, call: l } = n, d = (T) => r ? T : Ht(T) || r === !1 || r === 0 ? gn(T, 1) : gn(T);
  let c, b, w, D, L = !1, W = !1;
  if (bt(e) ? (b = () => e.value, L = Ht(e)) : ls(e) ? (b = () => d(e), L = !0) : he(e) ? (W = !0, L = e.some((T) => ls(T) || Ht(T)), b = () => e.map((T) => {
    if (bt(T))
      return T.value;
    if (ls(T))
      return d(T);
    if (ge(T))
      return l ? l(T, 2) : T();
  })) : ge(e) ? t ? b = l ? () => l(e, 2) : e : b = () => {
    if (w) {
      yn();
      try {
        w();
      } finally {
        vn();
      }
    }
    const T = Gn;
    Gn = c;
    try {
      return l ? l(e, 3, [D]) : e(D);
    } finally {
      Gn = T;
    }
  } : b = rn, t && r) {
    const T = b, O = r === !0 ? 1 / 0 : r;
    b = () => gn(T(), O);
  }
  const F = Qu(), se = () => {
    c.stop(), F && F.active && mo(F.effects, c);
  };
  if (i && t) {
    const T = t;
    t = (...O) => {
      T(...O), se();
    };
  }
  let ie = W ? new Array(e.length).fill(pr) : pr;
  const oe = (T) => {
    if (!(!(c.flags & 1) || !c.dirty && !T))
      if (t) {
        const O = c.run();
        if (r || L || (W ? O.some((V, K) => On(V, ie[K])) : On(O, ie))) {
          w && w();
          const V = Gn;
          Gn = c;
          try {
            const K = [
              O,
              // pass undefined as the old value when it's changed for the first time
              ie === pr ? void 0 : W && ie[0] === pr ? [] : ie,
              D
            ];
            ie = O, l ? l(t, 3, K) : (
              // @ts-expect-error
              t(...K)
            );
          } finally {
            Gn = V;
          }
        }
      } else
        c.run();
  };
  return a && a(oe), c = new Ol(b), c.scheduler = o ? () => o(oe, !1) : oe, D = (T) => Ef(T, !1, c), w = c.onStop = () => {
    const T = Pr.get(c);
    if (T) {
      if (l)
        l(T, 4);
      else
        for (const O of T) O();
      Pr.delete(c);
    }
  }, t ? s ? oe(!0) : ie = c.run() : o ? o(oe.bind(null, !0), !0) : c.run(), se.pause = c.pause.bind(c), se.resume = c.resume.bind(c), se.stop = se, se;
}
function gn(e, t = 1 / 0, n) {
  if (t <= 0 || !ot(e) || e.__v_skip || (n = n || /* @__PURE__ */ new Set(), n.has(e)))
    return e;
  if (n.add(e), t--, bt(e))
    gn(e.value, t, n);
  else if (he(e))
    for (let s = 0; s < e.length; s++)
      gn(e[s], t, n);
  else if (Tl(e) || as(e))
    e.forEach((s) => {
      gn(s, t, n);
    });
  else if (Sl(e)) {
    for (const s in e)
      gn(e[s], t, n);
    for (const s of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, s) && gn(e[s], t, n);
  }
  return e;
}
/**
* @vue/runtime-core v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function Js(e, t, n, s) {
  try {
    return s ? e(...s) : e();
  } catch (r) {
    Qr(r, t, n);
  }
}
function ln(e, t, n, s) {
  if (ge(e)) {
    const r = Js(e, t, n, s);
    return r && Al(r) && r.catch((i) => {
      Qr(i, t, n);
    }), r;
  }
  if (he(e)) {
    const r = [];
    for (let i = 0; i < e.length; i++)
      r.push(ln(e[i], t, n, s));
    return r;
  }
}
function Qr(e, t, n, s = !0) {
  const r = t ? t.vnode : null, { errorHandler: i, throwUnhandledErrorInProduction: o } = t && t.appContext.config || Qe;
  if (t) {
    let a = t.parent;
    const l = t.proxy, d = `https://vuejs.org/error-reference/#runtime-${n}`;
    for (; a; ) {
      const c = a.ec;
      if (c) {
        for (let b = 0; b < c.length; b++)
          if (c[b](e, l, d) === !1)
            return;
      }
      a = a.parent;
    }
    if (i) {
      yn(), Js(i, null, 10, [
        e,
        l,
        d
      ]), vn();
      return;
    }
  }
  Cf(e, n, r, s, o);
}
function Cf(e, t, n, s = !0, r = !1) {
  if (r)
    throw e;
  console.error(e);
}
const Et = [];
let nn = -1;
const cs = [];
let In = null, rs = 0;
const Gl = /* @__PURE__ */ Promise.resolve();
let Fr = null;
function Zn(e) {
  const t = Fr || Gl;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function Rf(e) {
  let t = nn + 1, n = Et.length;
  for (; t < n; ) {
    const s = t + n >>> 1, r = Et[s], i = Ys(r);
    i < e || i === e && r.flags & 2 ? t = s + 1 : n = s;
  }
  return t;
}
function Ao(e) {
  if (!(e.flags & 1)) {
    const t = Ys(e), n = Et[Et.length - 1];
    !n || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= Ys(n) ? Et.push(e) : Et.splice(Rf(t), 0, e), e.flags |= 1, Yl();
  }
}
function Yl() {
  Fr || (Fr = Gl.then(Zl));
}
function If(e) {
  he(e) ? cs.push(...e) : In && e.id === -1 ? In.splice(rs + 1, 0, e) : e.flags & 1 || (cs.push(e), e.flags |= 1), Yl();
}
function ka(e, t, n = nn + 1) {
  for (; n < Et.length; n++) {
    const s = Et[n];
    if (s && s.flags & 2) {
      if (e && s.id !== e.uid)
        continue;
      Et.splice(n, 1), n--, s.flags & 4 && (s.flags &= -2), s(), s.flags & 4 || (s.flags &= -2);
    }
  }
}
function Xl(e) {
  if (cs.length) {
    const t = [...new Set(cs)].sort(
      (n, s) => Ys(n) - Ys(s)
    );
    if (cs.length = 0, In) {
      In.push(...t);
      return;
    }
    for (In = t, rs = 0; rs < In.length; rs++) {
      const n = In[rs];
      n.flags & 4 && (n.flags &= -2), n.flags & 8 || n(), n.flags &= -2;
    }
    In = null, rs = 0;
  }
}
const Ys = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function Zl(e) {
  try {
    for (nn = 0; nn < Et.length; nn++) {
      const t = Et[nn];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), Js(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; nn < Et.length; nn++) {
      const t = Et[nn];
      t && (t.flags &= -2);
    }
    nn = -1, Et.length = 0, Xl(), Fr = null, (Et.length || cs.length) && Zl();
  }
}
let zt = null, Jl = null;
function Dr(e) {
  const t = zt;
  return zt = e, Jl = e && e.type.__scopeId || null, t;
}
function Lf(e, t = zt, n) {
  if (!t || e._n)
    return e;
  const s = (...r) => {
    s._d && La(-1);
    const i = Dr(t);
    let o;
    try {
      o = e(...r);
    } finally {
      Dr(i), s._d && La(1);
    }
    return o;
  };
  return s._n = !0, s._c = !0, s._d = !0, s;
}
function Rn(e, t) {
  if (zt === null)
    return e;
  const n = ri(zt), s = e.dirs || (e.dirs = []);
  for (let r = 0; r < t.length; r++) {
    let [i, o, a, l = Qe] = t[r];
    i && (ge(i) && (i = {
      mounted: i,
      updated: i
    }), i.deep && gn(o), s.push({
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
function qn(e, t, n, s) {
  const r = e.dirs, i = t && t.dirs;
  for (let o = 0; o < r.length; o++) {
    const a = r[o];
    i && (a.oldValue = i[o].value);
    let l = a.dir[s];
    l && (yn(), ln(l, n, 8, [
      e.el,
      a,
      e,
      t
    ]), vn());
  }
}
const Of = Symbol("_vte"), Nf = (e) => e.__isTeleport;
function Eo(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, Eo(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function So(e, t) {
  return ge(e) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    wt({ name: e.name }, t, { setup: e })
  ) : e;
}
function Ql(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
function Hs(e, t, n, s, r = !1) {
  if (he(e)) {
    e.forEach(
      (L, W) => Hs(
        L,
        t && (he(t) ? t[W] : t),
        n,
        s,
        r
      )
    );
    return;
  }
  if (Ws(s) && !r) {
    s.shapeFlag & 512 && s.type.__asyncResolved && s.component.subTree.component && Hs(e, t, n, s.component.subTree);
    return;
  }
  const i = s.shapeFlag & 4 ? ri(s.component) : s.el, o = r ? null : i, { i: a, r: l } = e, d = t && t.r, c = a.refs === Qe ? a.refs = {} : a.refs, b = a.setupState, w = We(b), D = b === Qe ? () => !1 : (L) => qe(w, L);
  if (d != null && d !== l && (ft(d) ? (c[d] = null, D(d) && (b[d] = null)) : bt(d) && (d.value = null)), ge(l))
    Js(l, a, 12, [o, c]);
  else {
    const L = ft(l), W = bt(l);
    if (L || W) {
      const F = () => {
        if (e.f) {
          const se = L ? D(l) ? b[l] : c[l] : l.value;
          r ? he(se) && mo(se, i) : he(se) ? se.includes(i) || se.push(i) : L ? (c[l] = [i], D(l) && (b[l] = c[l])) : (l.value = [i], e.k && (c[e.k] = l.value));
        } else L ? (c[l] = o, D(l) && (b[l] = o)) : W && (l.value = o, e.k && (c[e.k] = o));
      };
      o ? (F.id = -1, Ft(F, n)) : F();
    }
  }
}
Xr().requestIdleCallback;
Xr().cancelIdleCallback;
const Ws = (e) => !!e.type.__asyncLoader, ec = (e) => e.type.__isKeepAlive;
function Mf(e, t) {
  tc(e, "a", t);
}
function Pf(e, t) {
  tc(e, "da", t);
}
function tc(e, t, n = St) {
  const s = e.__wdc || (e.__wdc = () => {
    let r = n;
    for (; r; ) {
      if (r.isDeactivated)
        return;
      r = r.parent;
    }
    return e();
  });
  if (ei(t, s, n), n) {
    let r = n.parent;
    for (; r && r.parent; )
      ec(r.parent.vnode) && Ff(s, t, n, r), r = r.parent;
  }
}
function Ff(e, t, n, s) {
  const r = ei(
    t,
    e,
    s,
    !0
    /* prepend */
  );
  Qs(() => {
    mo(s[t], r);
  }, n);
}
function ei(e, t, n = St, s = !1) {
  if (n) {
    const r = n[e] || (n[e] = []), i = t.__weh || (t.__weh = (...o) => {
      yn();
      const a = er(n), l = ln(t, n, e, o);
      return a(), vn(), l;
    });
    return s ? r.unshift(i) : r.push(i), i;
  }
}
const bn = (e) => (t, n = St) => {
  (!Zs || e === "sp") && ei(e, (...s) => t(...s), n);
}, Df = bn("bm"), ti = bn("m"), Bf = bn(
  "bu"
), $f = bn("u"), nc = bn(
  "bum"
), Qs = bn("um"), Uf = bn(
  "sp"
), zf = bn("rtg"), Hf = bn("rtc");
function Wf(e, t = St) {
  ei("ec", e, t);
}
const qf = Symbol.for("v-ndc");
function pt(e, t, n, s) {
  let r;
  const i = n, o = he(e);
  if (o || ft(e)) {
    const a = o && ls(e);
    let l = !1, d = !1;
    a && (l = !Ht(e), d = Pn(e), e = Zr(e)), r = new Array(e.length);
    for (let c = 0, b = e.length; c < b; c++)
      r[c] = t(
        l ? d ? Mr(gt(e[c])) : gt(e[c]) : e[c],
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
      for (let l = 0, d = a.length; l < d; l++) {
        const c = a[l];
        r[l] = t(e[c], c, l, i);
      }
    }
  else
    r = [];
  return r;
}
const Xi = (e) => e ? xc(e) ? ri(e) : Xi(e.parent) : null, qs = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ wt(/* @__PURE__ */ Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => e.props,
    $attrs: (e) => e.attrs,
    $slots: (e) => e.slots,
    $refs: (e) => e.refs,
    $parent: (e) => Xi(e.parent),
    $root: (e) => Xi(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => rc(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      Ao(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = Zn.bind(e.proxy)),
    $watch: (e) => hh.bind(e)
  })
), Ai = (e, t) => e !== Qe && !e.__isScriptSetup && qe(e, t), jf = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: n, setupState: s, data: r, props: i, accessCache: o, type: a, appContext: l } = e;
    let d;
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
        if (Ai(s, t))
          return o[t] = 1, s[t];
        if (r !== Qe && qe(r, t))
          return o[t] = 2, r[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (d = e.propsOptions[0]) && qe(d, t)
        )
          return o[t] = 3, i[t];
        if (n !== Qe && qe(n, t))
          return o[t] = 4, n[t];
        Zi && (o[t] = 0);
      }
    }
    const c = qs[t];
    let b, w;
    if (c)
      return t === "$attrs" && vt(e.attrs, "get", ""), c(e);
    if (
      // css module (injected by vue-loader)
      (b = a.__cssModules) && (b = b[t])
    )
      return b;
    if (n !== Qe && qe(n, t))
      return o[t] = 4, n[t];
    if (
      // global properties
      w = l.config.globalProperties, qe(w, t)
    )
      return w[t];
  },
  set({ _: e }, t, n) {
    const { data: s, setupState: r, ctx: i } = e;
    return Ai(r, t) ? (r[t] = n, !0) : s !== Qe && qe(s, t) ? (s[t] = n, !0) : qe(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (i[t] = n, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: n, ctx: s, appContext: r, propsOptions: i }
  }, o) {
    let a;
    return !!n[o] || e !== Qe && qe(e, o) || Ai(t, o) || (a = i[0]) && qe(a, o) || qe(s, o) || qe(qs, o) || qe(r.config.globalProperties, o);
  },
  defineProperty(e, t, n) {
    return n.get != null ? e._.accessCache[t] = 0 : qe(n, "value") && this.set(e, t, n.value, null), Reflect.defineProperty(e, t, n);
  }
};
function xa(e) {
  return he(e) ? e.reduce(
    (t, n) => (t[n] = null, t),
    {}
  ) : e;
}
let Zi = !0;
function Vf(e) {
  const t = rc(e), n = e.proxy, s = e.ctx;
  Zi = !1, t.beforeCreate && Ta(t.beforeCreate, e, "bc");
  const {
    // state
    data: r,
    computed: i,
    methods: o,
    watch: a,
    provide: l,
    inject: d,
    // lifecycle
    created: c,
    beforeMount: b,
    mounted: w,
    beforeUpdate: D,
    updated: L,
    activated: W,
    deactivated: F,
    beforeDestroy: se,
    beforeUnmount: ie,
    destroyed: oe,
    unmounted: T,
    render: O,
    renderTracked: V,
    renderTriggered: K,
    errorCaptured: xe,
    serverPrefetch: ze,
    // public API
    expose: Ke,
    inheritAttrs: Ae,
    // assets
    components: me,
    directives: Xe,
    filters: et
  } = t;
  if (d && Kf(d, s, null), o)
    for (const de in o) {
      const ae = o[de];
      ge(ae) && (s[de] = ae.bind(n));
    }
  if (r) {
    const de = r.call(n, n);
    ot(de) && (e.data = Jr(de));
  }
  if (Zi = !0, i)
    for (const de in i) {
      const ae = i[de], rt = ge(ae) ? ae.bind(n, n) : ge(ae.get) ? ae.get.bind(n, n) : rn, be = !ge(ae) && ge(ae.set) ? ae.set.bind(n) : rn, _e = ce({
        get: rt,
        set: be
      });
      Object.defineProperty(s, de, {
        enumerable: !0,
        configurable: !0,
        get: () => _e.value,
        set: (Te) => _e.value = Te
      });
    }
  if (a)
    for (const de in a)
      sc(a[de], s, n, de);
  if (l) {
    const de = ge(l) ? l.call(n) : l;
    Reflect.ownKeys(de).forEach((ae) => {
      Qf(ae, de[ae]);
    });
  }
  c && Ta(c, e, "c");
  function ue(de, ae) {
    he(ae) ? ae.forEach((rt) => de(rt.bind(n))) : ae && de(ae.bind(n));
  }
  if (ue(Df, b), ue(ti, w), ue(Bf, D), ue($f, L), ue(Mf, W), ue(Pf, F), ue(Wf, xe), ue(Hf, V), ue(zf, K), ue(nc, ie), ue(Qs, T), ue(Uf, ze), he(Ke))
    if (Ke.length) {
      const de = e.exposed || (e.exposed = {});
      Ke.forEach((ae) => {
        Object.defineProperty(de, ae, {
          get: () => n[ae],
          set: (rt) => n[ae] = rt,
          enumerable: !0
        });
      });
    } else e.exposed || (e.exposed = {});
  O && e.render === rn && (e.render = O), Ae != null && (e.inheritAttrs = Ae), me && (e.components = me), Xe && (e.directives = Xe), ze && Ql(e);
}
function Kf(e, t, n = rn) {
  he(e) && (e = Ji(e));
  for (const s in e) {
    const r = e[s];
    let i;
    ot(r) ? "default" in r ? i = wr(
      r.from || s,
      r.default,
      !0
    ) : i = wr(r.from || s) : i = wr(r), bt(i) ? Object.defineProperty(t, s, {
      enumerable: !0,
      configurable: !0,
      get: () => i.value,
      set: (o) => i.value = o
    }) : t[s] = i;
  }
}
function Ta(e, t, n) {
  ln(
    he(e) ? e.map((s) => s.bind(t.proxy)) : e.bind(t.proxy),
    t,
    n
  );
}
function sc(e, t, n, s) {
  let r = s.includes(".") ? _c(n, s) : () => n[s];
  if (ft(e)) {
    const i = t[e];
    ge(i) && Pt(r, i);
  } else if (ge(e))
    Pt(r, e.bind(n));
  else if (ot(e))
    if (he(e))
      e.forEach((i) => sc(i, t, n, s));
    else {
      const i = ge(e.handler) ? e.handler.bind(n) : t[e.handler];
      ge(i) && Pt(r, i, e);
    }
}
function rc(e) {
  const t = e.type, { mixins: n, extends: s } = t, {
    mixins: r,
    optionsCache: i,
    config: { optionMergeStrategies: o }
  } = e.appContext, a = i.get(t);
  let l;
  return a ? l = a : !r.length && !n && !s ? l = t : (l = {}, r.length && r.forEach(
    (d) => Br(l, d, o, !0)
  ), Br(l, t, o)), ot(t) && i.set(t, l), l;
}
function Br(e, t, n, s = !1) {
  const { mixins: r, extends: i } = t;
  i && Br(e, i, n, !0), r && r.forEach(
    (o) => Br(e, o, n, !0)
  );
  for (const o in t)
    if (!(s && o === "expose")) {
      const a = Gf[o] || n && n[o];
      e[o] = a ? a(e[o], t[o]) : t[o];
    }
  return e;
}
const Gf = {
  data: Aa,
  props: Ea,
  emits: Ea,
  // objects
  methods: Fs,
  computed: Fs,
  // lifecycle
  beforeCreate: At,
  created: At,
  beforeMount: At,
  mounted: At,
  beforeUpdate: At,
  updated: At,
  beforeDestroy: At,
  beforeUnmount: At,
  destroyed: At,
  unmounted: At,
  activated: At,
  deactivated: At,
  errorCaptured: At,
  serverPrefetch: At,
  // assets
  components: Fs,
  directives: Fs,
  // watch
  watch: Xf,
  // provide / inject
  provide: Aa,
  inject: Yf
};
function Aa(e, t) {
  return t ? e ? function() {
    return wt(
      ge(e) ? e.call(this, this) : e,
      ge(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function Yf(e, t) {
  return Fs(Ji(e), Ji(t));
}
function Ji(e) {
  if (he(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++)
      t[e[n]] = e[n];
    return t;
  }
  return e;
}
function At(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function Fs(e, t) {
  return e ? wt(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function Ea(e, t) {
  return e ? he(e) && he(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : wt(
    /* @__PURE__ */ Object.create(null),
    xa(e),
    xa(t ?? {})
  ) : t;
}
function Xf(e, t) {
  if (!e) return t;
  if (!t) return e;
  const n = wt(/* @__PURE__ */ Object.create(null), e);
  for (const s in t)
    n[s] = At(e[s], t[s]);
  return n;
}
function ic() {
  return {
    app: null,
    config: {
      isNativeTag: zu,
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
let Zf = 0;
function Jf(e, t) {
  return function(s, r = null) {
    ge(s) || (s = wt({}, s)), r != null && !ot(r) && (r = null);
    const i = ic(), o = /* @__PURE__ */ new WeakSet(), a = [];
    let l = !1;
    const d = i.app = {
      _uid: Zf++,
      _component: s,
      _props: r,
      _container: null,
      _context: i,
      _instance: null,
      version: Nh,
      get config() {
        return i.config;
      },
      set config(c) {
      },
      use(c, ...b) {
        return o.has(c) || (c && ge(c.install) ? (o.add(c), c.install(d, ...b)) : ge(c) && (o.add(c), c(d, ...b))), d;
      },
      mixin(c) {
        return i.mixins.includes(c) || i.mixins.push(c), d;
      },
      component(c, b) {
        return b ? (i.components[c] = b, d) : i.components[c];
      },
      directive(c, b) {
        return b ? (i.directives[c] = b, d) : i.directives[c];
      },
      mount(c, b, w) {
        if (!l) {
          const D = d._ceVNode || on(s, r);
          return D.appContext = i, w === !0 ? w = "svg" : w === !1 && (w = void 0), e(D, c, w), l = !0, d._container = c, c.__vue_app__ = d, ri(D.component);
        }
      },
      onUnmount(c) {
        a.push(c);
      },
      unmount() {
        l && (ln(
          a,
          d._instance,
          16
        ), e(null, d._container), delete d._container.__vue_app__);
      },
      provide(c, b) {
        return i.provides[c] = b, d;
      },
      runWithContext(c) {
        const b = us;
        us = d;
        try {
          return c();
        } finally {
          us = b;
        }
      }
    };
    return d;
  };
}
let us = null;
function Qf(e, t) {
  if (St) {
    let n = St.provides;
    const s = St.parent && St.parent.provides;
    s === n && (n = St.provides = Object.create(s)), n[e] = t;
  }
}
function wr(e, t, n = !1) {
  const s = Sh();
  if (s || us) {
    let r = us ? us._context.provides : s ? s.parent == null || s.ce ? s.vnode.appContext && s.vnode.appContext.provides : s.parent.provides : void 0;
    if (r && e in r)
      return r[e];
    if (arguments.length > 1)
      return n && ge(t) ? t.call(s && s.proxy) : t;
  }
}
const oc = {}, ac = () => Object.create(oc), lc = (e) => Object.getPrototypeOf(e) === oc;
function eh(e, t, n, s = !1) {
  const r = {}, i = ac();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), cc(e, t, r, i);
  for (const o in e.propsOptions[0])
    o in r || (r[o] = void 0);
  n ? e.props = s ? r : vf(r) : e.type.props ? e.props = r : e.props = i, e.attrs = i;
}
function th(e, t, n, s) {
  const {
    props: r,
    attrs: i,
    vnode: { patchFlag: o }
  } = e, a = We(r), [l] = e.propsOptions;
  let d = !1;
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
        if (ni(e.emitsOptions, w))
          continue;
        const D = t[w];
        if (l)
          if (qe(i, w))
            D !== i[w] && (i[w] = D, d = !0);
          else {
            const L = Mn(w);
            r[L] = Qi(
              l,
              a,
              L,
              D,
              e,
              !1
            );
          }
        else
          D !== i[w] && (i[w] = D, d = !0);
      }
    }
  } else {
    cc(e, t, r, i) && (d = !0);
    let c;
    for (const b in a)
      (!t || // for camelCase
      !qe(t, b) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((c = Bn(b)) === b || !qe(t, c))) && (l ? n && // for camelCase
      (n[b] !== void 0 || // for kebab-case
      n[c] !== void 0) && (r[b] = Qi(
        l,
        a,
        b,
        void 0,
        e,
        !0
      )) : delete r[b]);
    if (i !== a)
      for (const b in i)
        (!t || !qe(t, b)) && (delete i[b], d = !0);
  }
  d && pn(e.attrs, "set", "");
}
function cc(e, t, n, s) {
  const [r, i] = e.propsOptions;
  let o = !1, a;
  if (t)
    for (let l in t) {
      if ($s(l))
        continue;
      const d = t[l];
      let c;
      r && qe(r, c = Mn(l)) ? !i || !i.includes(c) ? n[c] = d : (a || (a = {}))[c] = d : ni(e.emitsOptions, l) || (!(l in s) || d !== s[l]) && (s[l] = d, o = !0);
    }
  if (i) {
    const l = We(n), d = a || Qe;
    for (let c = 0; c < i.length; c++) {
      const b = i[c];
      n[b] = Qi(
        r,
        l,
        b,
        d[b],
        e,
        !qe(d, b)
      );
    }
  }
  return o;
}
function Qi(e, t, n, s, r, i) {
  const o = e[n];
  if (o != null) {
    const a = qe(o, "default");
    if (a && s === void 0) {
      const l = o.default;
      if (o.type !== Function && !o.skipFactory && ge(l)) {
        const { propsDefaults: d } = r;
        if (n in d)
          s = d[n];
        else {
          const c = er(r);
          s = d[n] = l.call(
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
    ] && (s === "" || s === Bn(n)) && (s = !0));
  }
  return s;
}
const nh = /* @__PURE__ */ new WeakMap();
function uc(e, t, n = !1) {
  const s = n ? nh : t.propsCache, r = s.get(e);
  if (r)
    return r;
  const i = e.props, o = {}, a = [];
  let l = !1;
  if (!ge(e)) {
    const c = (b) => {
      l = !0;
      const [w, D] = uc(b, t, !0);
      wt(o, w), D && a.push(...D);
    };
    !n && t.mixins.length && t.mixins.forEach(c), e.extends && c(e.extends), e.mixins && e.mixins.forEach(c);
  }
  if (!i && !l)
    return ot(e) && s.set(e, os), os;
  if (he(i))
    for (let c = 0; c < i.length; c++) {
      const b = Mn(i[c]);
      Sa(b) && (o[b] = Qe);
    }
  else if (i)
    for (const c in i) {
      const b = Mn(c);
      if (Sa(b)) {
        const w = i[c], D = o[b] = he(w) || ge(w) ? { type: w } : wt({}, w), L = D.type;
        let W = !1, F = !0;
        if (he(L))
          for (let se = 0; se < L.length; ++se) {
            const ie = L[se], oe = ge(ie) && ie.name;
            if (oe === "Boolean") {
              W = !0;
              break;
            } else oe === "String" && (F = !1);
          }
        else
          W = ge(L) && L.name === "Boolean";
        D[
          0
          /* shouldCast */
        ] = W, D[
          1
          /* shouldCastTrue */
        ] = F, (W || qe(D, "default")) && a.push(b);
      }
    }
  const d = [o, a];
  return ot(e) && s.set(e, d), d;
}
function Sa(e) {
  return e[0] !== "$" && !$s(e);
}
const Co = (e) => e === "_" || e === "__" || e === "_ctx" || e === "$stable", Ro = (e) => he(e) ? e.map(sn) : [sn(e)], sh = (e, t, n) => {
  if (t._n)
    return t;
  const s = Lf((...r) => Ro(t(...r)), n);
  return s._c = !1, s;
}, fc = (e, t, n) => {
  const s = e._ctx;
  for (const r in e) {
    if (Co(r)) continue;
    const i = e[r];
    if (ge(i))
      t[r] = sh(r, i, s);
    else if (i != null) {
      const o = Ro(i);
      t[r] = () => o;
    }
  }
}, hc = (e, t) => {
  const n = Ro(t);
  e.slots.default = () => n;
}, dc = (e, t, n) => {
  for (const s in t)
    (n || !Co(s)) && (e[s] = t[s]);
}, rh = (e, t, n) => {
  const s = e.slots = ac();
  if (e.vnode.shapeFlag & 32) {
    const r = t.__;
    r && qi(s, "__", r, !0);
    const i = t._;
    i ? (dc(s, t, n), n && qi(s, "_", i, !0)) : fc(t, s);
  } else t && hc(e, t);
}, ih = (e, t, n) => {
  const { vnode: s, slots: r } = e;
  let i = !0, o = Qe;
  if (s.shapeFlag & 32) {
    const a = t._;
    a ? n && a === 1 ? i = !1 : dc(r, t, n) : (i = !t.$stable, fc(t, r)), o = t;
  } else t && (hc(e, t), o = { default: 1 });
  if (i)
    for (const a in r)
      !Co(a) && o[a] == null && delete r[a];
}, Ft = vh;
function oh(e) {
  return ah(e);
}
function ah(e, t) {
  const n = Xr();
  n.__VUE__ = !0;
  const {
    insert: s,
    remove: r,
    patchProp: i,
    createElement: o,
    createText: a,
    createComment: l,
    setText: d,
    setElementText: c,
    parentNode: b,
    nextSibling: w,
    setScopeId: D = rn,
    insertStaticContent: L
  } = e, W = (m, p, x, C = null, I = null, k = null, H = void 0, $ = null, U = !!p.dynamicChildren) => {
    if (m === p)
      return;
    m && !As(m, p) && (C = ht(m), Te(m, I, k, !0), m = null), p.patchFlag === -2 && (U = !1, p.dynamicChildren = null);
    const { type: P, ref: G, shapeFlag: q } = p;
    switch (P) {
      case si:
        F(m, p, x, C);
        break;
      case Fn:
        se(m, p, x, C);
        break;
      case kr:
        m == null && ie(p, x, C, H);
        break;
      case $e:
        me(
          m,
          p,
          x,
          C,
          I,
          k,
          H,
          $,
          U
        );
        break;
      default:
        q & 1 ? O(
          m,
          p,
          x,
          C,
          I,
          k,
          H,
          $,
          U
        ) : q & 6 ? Xe(
          m,
          p,
          x,
          C,
          I,
          k,
          H,
          $,
          U
        ) : (q & 64 || q & 128) && P.process(
          m,
          p,
          x,
          C,
          I,
          k,
          H,
          $,
          U,
          _t
        );
    }
    G != null && I ? Hs(G, m && m.ref, k, p || m, !p) : G == null && m && m.ref != null && Hs(m.ref, null, k, m, !0);
  }, F = (m, p, x, C) => {
    if (m == null)
      s(
        p.el = a(p.children),
        x,
        C
      );
    else {
      const I = p.el = m.el;
      p.children !== m.children && d(I, p.children);
    }
  }, se = (m, p, x, C) => {
    m == null ? s(
      p.el = l(p.children || ""),
      x,
      C
    ) : p.el = m.el;
  }, ie = (m, p, x, C) => {
    [m.el, m.anchor] = L(
      m.children,
      p,
      x,
      C,
      m.el,
      m.anchor
    );
  }, oe = ({ el: m, anchor: p }, x, C) => {
    let I;
    for (; m && m !== p; )
      I = w(m), s(m, x, C), m = I;
    s(p, x, C);
  }, T = ({ el: m, anchor: p }) => {
    let x;
    for (; m && m !== p; )
      x = w(m), r(m), m = x;
    r(p);
  }, O = (m, p, x, C, I, k, H, $, U) => {
    p.type === "svg" ? H = "svg" : p.type === "math" && (H = "mathml"), m == null ? V(
      p,
      x,
      C,
      I,
      k,
      H,
      $,
      U
    ) : ze(
      m,
      p,
      I,
      k,
      H,
      $,
      U
    );
  }, V = (m, p, x, C, I, k, H, $) => {
    let U, P;
    const { props: G, shapeFlag: q, transition: j, dirs: te } = m;
    if (U = m.el = o(
      m.type,
      k,
      G && G.is,
      G
    ), q & 8 ? c(U, m.children) : q & 16 && xe(
      m.children,
      U,
      null,
      C,
      I,
      Ei(m, k),
      H,
      $
    ), te && qn(m, null, C, "created"), K(U, m, m.scopeId, H, C), G) {
      for (const Ee in G)
        Ee !== "value" && !$s(Ee) && i(U, Ee, null, G[Ee], k, C);
      "value" in G && i(U, "value", null, G.value, k), (P = G.onVnodeBeforeMount) && en(P, C, m);
    }
    te && qn(m, null, C, "beforeMount");
    const le = lh(I, j);
    le && j.beforeEnter(U), s(U, p, x), ((P = G && G.onVnodeMounted) || le || te) && Ft(() => {
      P && en(P, C, m), le && j.enter(U), te && qn(m, null, C, "mounted");
    }, I);
  }, K = (m, p, x, C, I) => {
    if (x && D(m, x), C)
      for (let k = 0; k < C.length; k++)
        D(m, C[k]);
    if (I) {
      let k = I.subTree;
      if (p === k || vc(k.type) && (k.ssContent === p || k.ssFallback === p)) {
        const H = I.vnode;
        K(
          m,
          H,
          H.scopeId,
          H.slotScopeIds,
          I.parent
        );
      }
    }
  }, xe = (m, p, x, C, I, k, H, $, U = 0) => {
    for (let P = U; P < m.length; P++) {
      const G = m[P] = $ ? Ln(m[P]) : sn(m[P]);
      W(
        null,
        G,
        p,
        x,
        C,
        I,
        k,
        H,
        $
      );
    }
  }, ze = (m, p, x, C, I, k, H) => {
    const $ = p.el = m.el;
    let { patchFlag: U, dynamicChildren: P, dirs: G } = p;
    U |= m.patchFlag & 16;
    const q = m.props || Qe, j = p.props || Qe;
    let te;
    if (x && jn(x, !1), (te = j.onVnodeBeforeUpdate) && en(te, x, p, m), G && qn(p, m, x, "beforeUpdate"), x && jn(x, !0), (q.innerHTML && j.innerHTML == null || q.textContent && j.textContent == null) && c($, ""), P ? Ke(
      m.dynamicChildren,
      P,
      $,
      x,
      C,
      Ei(p, I),
      k
    ) : H || ae(
      m,
      p,
      $,
      null,
      x,
      C,
      Ei(p, I),
      k,
      !1
    ), U > 0) {
      if (U & 16)
        Ae($, q, j, x, I);
      else if (U & 2 && q.class !== j.class && i($, "class", null, j.class, I), U & 4 && i($, "style", q.style, j.style, I), U & 8) {
        const le = p.dynamicProps;
        for (let Ee = 0; Ee < le.length; Ee++) {
          const Se = le[Ee], nt = q[Se], Oe = j[Se];
          (Oe !== nt || Se === "value") && i($, Se, nt, Oe, I, x);
        }
      }
      U & 1 && m.children !== p.children && c($, p.children);
    } else !H && P == null && Ae($, q, j, x, I);
    ((te = j.onVnodeUpdated) || G) && Ft(() => {
      te && en(te, x, p, m), G && qn(p, m, x, "updated");
    }, C);
  }, Ke = (m, p, x, C, I, k, H) => {
    for (let $ = 0; $ < p.length; $++) {
      const U = m[$], P = p[$], G = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        U.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (U.type === $e || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !As(U, P) || // - In the case of a component, it could contain anything.
        U.shapeFlag & 198) ? b(U.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          x
        )
      );
      W(
        U,
        P,
        G,
        null,
        C,
        I,
        k,
        H,
        !0
      );
    }
  }, Ae = (m, p, x, C, I) => {
    if (p !== x) {
      if (p !== Qe)
        for (const k in p)
          !$s(k) && !(k in x) && i(
            m,
            k,
            p[k],
            null,
            I,
            C
          );
      for (const k in x) {
        if ($s(k)) continue;
        const H = x[k], $ = p[k];
        H !== $ && k !== "value" && i(m, k, $, H, I, C);
      }
      "value" in x && i(m, "value", p.value, x.value, I);
    }
  }, me = (m, p, x, C, I, k, H, $, U) => {
    const P = p.el = m ? m.el : a(""), G = p.anchor = m ? m.anchor : a("");
    let { patchFlag: q, dynamicChildren: j, slotScopeIds: te } = p;
    te && ($ = $ ? $.concat(te) : te), m == null ? (s(P, x, C), s(G, x, C), xe(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      p.children || [],
      x,
      G,
      I,
      k,
      H,
      $,
      U
    )) : q > 0 && q & 64 && j && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    m.dynamicChildren ? (Ke(
      m.dynamicChildren,
      j,
      x,
      I,
      k,
      H,
      $
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (p.key != null || I && p === I.subTree) && pc(
      m,
      p,
      !0
      /* shallow */
    )) : ae(
      m,
      p,
      x,
      G,
      I,
      k,
      H,
      $,
      U
    );
  }, Xe = (m, p, x, C, I, k, H, $, U) => {
    p.slotScopeIds = $, m == null ? p.shapeFlag & 512 ? I.ctx.activate(
      p,
      x,
      C,
      H,
      U
    ) : et(
      p,
      x,
      C,
      I,
      k,
      H,
      U
    ) : st(m, p, U);
  }, et = (m, p, x, C, I, k, H) => {
    const $ = m.component = Eh(
      m,
      C,
      I
    );
    if (ec(m) && ($.ctx.renderer = _t), Ch($, !1, H), $.asyncDep) {
      if (I && I.registerDep($, ue, H), !m.el) {
        const U = $.subTree = on(Fn);
        se(null, U, p, x), m.placeholder = U.el;
      }
    } else
      ue(
        $,
        m,
        p,
        x,
        I,
        k,
        H
      );
  }, st = (m, p, x) => {
    const C = p.component = m.component;
    if (_h(m, p, x))
      if (C.asyncDep && !C.asyncResolved) {
        de(C, p, x);
        return;
      } else
        C.next = p, C.update();
    else
      p.el = m.el, C.vnode = p;
  }, ue = (m, p, x, C, I, k, H) => {
    const $ = () => {
      if (m.isMounted) {
        let { next: q, bu: j, u: te, parent: le, vnode: Ee } = m;
        {
          const f = gc(m);
          if (f) {
            q && (q.el = Ee.el, de(m, q, H)), f.asyncDep.then(() => {
              m.isUnmounted || $();
            });
            return;
          }
        }
        let Se = q, nt;
        jn(m, !1), q ? (q.el = Ee.el, de(m, q, H)) : q = Ee, j && br(j), (nt = q.props && q.props.onVnodeBeforeUpdate) && en(nt, le, q, Ee), jn(m, !0);
        const Oe = Ra(m), Ze = m.subTree;
        m.subTree = Oe, W(
          Ze,
          Oe,
          // parent may have changed if it's in a teleport
          b(Ze.el),
          // anchor may have changed if it's in a fragment
          ht(Ze),
          m,
          I,
          k
        ), q.el = Oe.el, Se === null && yh(m, Oe.el), te && Ft(te, I), (nt = q.props && q.props.onVnodeUpdated) && Ft(
          () => en(nt, le, q, Ee),
          I
        );
      } else {
        let q;
        const { el: j, props: te } = p, { bm: le, m: Ee, parent: Se, root: nt, type: Oe } = m, Ze = Ws(p);
        jn(m, !1), le && br(le), !Ze && (q = te && te.onVnodeBeforeMount) && en(q, Se, p), jn(m, !0);
        {
          nt.ce && // @ts-expect-error _def is private
          nt.ce._def.shadowRoot !== !1 && nt.ce._injectChildStyle(Oe);
          const f = m.subTree = Ra(m);
          W(
            null,
            f,
            x,
            C,
            m,
            I,
            k
          ), p.el = f.el;
        }
        if (Ee && Ft(Ee, I), !Ze && (q = te && te.onVnodeMounted)) {
          const f = p;
          Ft(
            () => en(q, Se, f),
            I
          );
        }
        (p.shapeFlag & 256 || Se && Ws(Se.vnode) && Se.vnode.shapeFlag & 256) && m.a && Ft(m.a, I), m.isMounted = !0, p = x = C = null;
      }
    };
    m.scope.on();
    const U = m.effect = new Ol($);
    m.scope.off();
    const P = m.update = U.run.bind(U), G = m.job = U.runIfDirty.bind(U);
    G.i = m, G.id = m.uid, U.scheduler = () => Ao(G), jn(m, !0), P();
  }, de = (m, p, x) => {
    p.component = m;
    const C = m.vnode.props;
    m.vnode = p, m.next = null, th(m, p.props, C, x), ih(m, p.children, x), yn(), ka(m), vn();
  }, ae = (m, p, x, C, I, k, H, $, U = !1) => {
    const P = m && m.children, G = m ? m.shapeFlag : 0, q = p.children, { patchFlag: j, shapeFlag: te } = p;
    if (j > 0) {
      if (j & 128) {
        be(
          P,
          q,
          x,
          C,
          I,
          k,
          H,
          $,
          U
        );
        return;
      } else if (j & 256) {
        rt(
          P,
          q,
          x,
          C,
          I,
          k,
          H,
          $,
          U
        );
        return;
      }
    }
    te & 8 ? (G & 16 && it(P, I, k), q !== P && c(x, q)) : G & 16 ? te & 16 ? be(
      P,
      q,
      x,
      C,
      I,
      k,
      H,
      $,
      U
    ) : it(P, I, k, !0) : (G & 8 && c(x, ""), te & 16 && xe(
      q,
      x,
      C,
      I,
      k,
      H,
      $,
      U
    ));
  }, rt = (m, p, x, C, I, k, H, $, U) => {
    m = m || os, p = p || os;
    const P = m.length, G = p.length, q = Math.min(P, G);
    let j;
    for (j = 0; j < q; j++) {
      const te = p[j] = U ? Ln(p[j]) : sn(p[j]);
      W(
        m[j],
        te,
        x,
        null,
        I,
        k,
        H,
        $,
        U
      );
    }
    P > G ? it(
      m,
      I,
      k,
      !0,
      !1,
      q
    ) : xe(
      p,
      x,
      C,
      I,
      k,
      H,
      $,
      U,
      q
    );
  }, be = (m, p, x, C, I, k, H, $, U) => {
    let P = 0;
    const G = p.length;
    let q = m.length - 1, j = G - 1;
    for (; P <= q && P <= j; ) {
      const te = m[P], le = p[P] = U ? Ln(p[P]) : sn(p[P]);
      if (As(te, le))
        W(
          te,
          le,
          x,
          null,
          I,
          k,
          H,
          $,
          U
        );
      else
        break;
      P++;
    }
    for (; P <= q && P <= j; ) {
      const te = m[q], le = p[j] = U ? Ln(p[j]) : sn(p[j]);
      if (As(te, le))
        W(
          te,
          le,
          x,
          null,
          I,
          k,
          H,
          $,
          U
        );
      else
        break;
      q--, j--;
    }
    if (P > q) {
      if (P <= j) {
        const te = j + 1, le = te < G ? p[te].el : C;
        for (; P <= j; )
          W(
            null,
            p[P] = U ? Ln(p[P]) : sn(p[P]),
            x,
            le,
            I,
            k,
            H,
            $,
            U
          ), P++;
      }
    } else if (P > j)
      for (; P <= q; )
        Te(m[P], I, k, !0), P++;
    else {
      const te = P, le = P, Ee = /* @__PURE__ */ new Map();
      for (P = le; P <= j; P++) {
        const S = p[P] = U ? Ln(p[P]) : sn(p[P]);
        S.key != null && Ee.set(S.key, P);
      }
      let Se, nt = 0;
      const Oe = j - le + 1;
      let Ze = !1, f = 0;
      const _ = new Array(Oe);
      for (P = 0; P < Oe; P++) _[P] = 0;
      for (P = te; P <= q; P++) {
        const S = m[P];
        if (nt >= Oe) {
          Te(S, I, k, !0);
          continue;
        }
        let B;
        if (S.key != null)
          B = Ee.get(S.key);
        else
          for (Se = le; Se <= j; Se++)
            if (_[Se - le] === 0 && As(S, p[Se])) {
              B = Se;
              break;
            }
        B === void 0 ? Te(S, I, k, !0) : (_[B - le] = P + 1, B >= f ? f = B : Ze = !0, W(
          S,
          p[B],
          x,
          null,
          I,
          k,
          H,
          $,
          U
        ), nt++);
      }
      const N = Ze ? ch(_) : os;
      for (Se = N.length - 1, P = Oe - 1; P >= 0; P--) {
        const S = le + P, B = p[S], X = p[S + 1], J = S + 1 < G ? (
          // #13559, fallback to el placeholder for unresolved async component
          X.el || X.placeholder
        ) : C;
        _[P] === 0 ? W(
          null,
          B,
          x,
          J,
          I,
          k,
          H,
          $,
          U
        ) : Ze && (Se < 0 || P !== N[Se] ? _e(B, x, J, 2) : Se--);
      }
    }
  }, _e = (m, p, x, C, I = null) => {
    const { el: k, type: H, transition: $, children: U, shapeFlag: P } = m;
    if (P & 6) {
      _e(m.component.subTree, p, x, C);
      return;
    }
    if (P & 128) {
      m.suspense.move(p, x, C);
      return;
    }
    if (P & 64) {
      H.move(m, p, x, _t);
      return;
    }
    if (H === $e) {
      s(k, p, x);
      for (let q = 0; q < U.length; q++)
        _e(U[q], p, x, C);
      s(m.anchor, p, x);
      return;
    }
    if (H === kr) {
      oe(m, p, x);
      return;
    }
    if (C !== 2 && P & 1 && $)
      if (C === 0)
        $.beforeEnter(k), s(k, p, x), Ft(() => $.enter(k), I);
      else {
        const { leave: q, delayLeave: j, afterLeave: te } = $, le = () => {
          m.ctx.isUnmounted ? r(k) : s(k, p, x);
        }, Ee = () => {
          q(k, () => {
            le(), te && te();
          });
        };
        j ? j(k, le, Ee) : Ee();
      }
    else
      s(k, p, x);
  }, Te = (m, p, x, C = !1, I = !1) => {
    const {
      type: k,
      props: H,
      ref: $,
      children: U,
      dynamicChildren: P,
      shapeFlag: G,
      patchFlag: q,
      dirs: j,
      cacheIndex: te
    } = m;
    if (q === -2 && (I = !1), $ != null && (yn(), Hs($, null, x, m, !0), vn()), te != null && (p.renderCache[te] = void 0), G & 256) {
      p.ctx.deactivate(m);
      return;
    }
    const le = G & 1 && j, Ee = !Ws(m);
    let Se;
    if (Ee && (Se = H && H.onVnodeBeforeUnmount) && en(Se, p, m), G & 6)
      Le(m.component, x, C);
    else {
      if (G & 128) {
        m.suspense.unmount(x, C);
        return;
      }
      le && qn(m, null, p, "beforeUnmount"), G & 64 ? m.type.remove(
        m,
        p,
        x,
        _t,
        C
      ) : P && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !P.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (k !== $e || q > 0 && q & 64) ? it(
        P,
        p,
        x,
        !1,
        !0
      ) : (k === $e && q & 384 || !I && G & 16) && it(U, p, x), C && Ie(m);
    }
    (Ee && (Se = H && H.onVnodeUnmounted) || le) && Ft(() => {
      Se && en(Se, p, m), le && qn(m, null, p, "unmounted");
    }, x);
  }, Ie = (m) => {
    const { type: p, el: x, anchor: C, transition: I } = m;
    if (p === $e) {
      Lt(x, C);
      return;
    }
    if (p === kr) {
      T(m);
      return;
    }
    const k = () => {
      r(x), I && !I.persisted && I.afterLeave && I.afterLeave();
    };
    if (m.shapeFlag & 1 && I && !I.persisted) {
      const { leave: H, delayLeave: $ } = I, U = () => H(x, k);
      $ ? $(m.el, k, U) : U();
    } else
      k();
  }, Lt = (m, p) => {
    let x;
    for (; m !== p; )
      x = w(m), r(m), m = x;
    r(p);
  }, Le = (m, p, x) => {
    const {
      bum: C,
      scope: I,
      job: k,
      subTree: H,
      um: $,
      m: U,
      a: P,
      parent: G,
      slots: { __: q }
    } = m;
    Ca(U), Ca(P), C && br(C), G && he(q) && q.forEach((j) => {
      G.renderCache[j] = void 0;
    }), I.stop(), k && (k.flags |= 8, Te(H, m, p, x)), $ && Ft($, p), Ft(() => {
      m.isUnmounted = !0;
    }, p), p && p.pendingBranch && !p.isUnmounted && m.asyncDep && !m.asyncResolved && m.suspenseId === p.pendingId && (p.deps--, p.deps === 0 && p.resolve());
  }, it = (m, p, x, C = !1, I = !1, k = 0) => {
    for (let H = k; H < m.length; H++)
      Te(m[H], p, x, C, I);
  }, ht = (m) => {
    if (m.shapeFlag & 6)
      return ht(m.component.subTree);
    if (m.shapeFlag & 128)
      return m.suspense.next();
    const p = w(m.anchor || m.el), x = p && p[Of];
    return x ? w(x) : p;
  };
  let dt = !1;
  const mt = (m, p, x) => {
    m == null ? p._vnode && Te(p._vnode, null, null, !0) : W(
      p._vnode || null,
      m,
      p,
      null,
      null,
      null,
      x
    ), p._vnode = m, dt || (dt = !0, ka(), Xl(), dt = !1);
  }, _t = {
    p: W,
    um: Te,
    m: _e,
    r: Ie,
    mt: et,
    mc: xe,
    pc: ae,
    pbc: Ke,
    n: ht,
    o: e
  };
  return {
    render: mt,
    hydrate: void 0,
    createApp: Jf(mt)
  };
}
function Ei({ type: e, props: t }, n) {
  return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function jn({ effect: e, job: t }, n) {
  n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function lh(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function pc(e, t, n = !1) {
  const s = e.children, r = t.children;
  if (he(s) && he(r))
    for (let i = 0; i < s.length; i++) {
      const o = s[i];
      let a = r[i];
      a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = r[i] = Ln(r[i]), a.el = o.el), !n && a.patchFlag !== -2 && pc(o, a)), a.type === si && (a.el = o.el), a.type === Fn && !a.el && (a.el = o.el);
    }
}
function ch(e) {
  const t = e.slice(), n = [0];
  let s, r, i, o, a;
  const l = e.length;
  for (s = 0; s < l; s++) {
    const d = e[s];
    if (d !== 0) {
      if (r = n[n.length - 1], e[r] < d) {
        t[s] = r, n.push(s);
        continue;
      }
      for (i = 0, o = n.length - 1; i < o; )
        a = i + o >> 1, e[n[a]] < d ? i = a + 1 : o = a;
      d < e[n[i]] && (i > 0 && (t[s] = n[i - 1]), n[i] = s);
    }
  }
  for (i = n.length, o = n[i - 1]; i-- > 0; )
    n[i] = o, o = t[o];
  return n;
}
function gc(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : gc(t);
}
function Ca(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
const uh = Symbol.for("v-scx"), fh = () => wr(uh);
function Pt(e, t, n) {
  return mc(e, t, n);
}
function mc(e, t, n = Qe) {
  const { immediate: s, deep: r, flush: i, once: o } = n, a = wt({}, n), l = t && s || !t && i !== "post";
  let d;
  if (Zs) {
    if (i === "sync") {
      const D = fh();
      d = D.__watcherHandles || (D.__watcherHandles = []);
    } else if (!l) {
      const D = () => {
      };
      return D.stop = rn, D.resume = rn, D.pause = rn, D;
    }
  }
  const c = St;
  a.call = (D, L, W) => ln(D, c, L, W);
  let b = !1;
  i === "post" ? a.scheduler = (D) => {
    Ft(D, c && c.suspense);
  } : i !== "sync" && (b = !0, a.scheduler = (D, L) => {
    L ? D() : Ao(D);
  }), a.augmentJob = (D) => {
    t && (D.flags |= 4), b && (D.flags |= 2, c && (D.id = c.uid, D.i = c));
  };
  const w = Sf(e, t, a);
  return Zs && (d ? d.push(w) : l && w()), w;
}
function hh(e, t, n) {
  const s = this.proxy, r = ft(e) ? e.includes(".") ? _c(s, e) : () => s[e] : e.bind(s, s);
  let i;
  ge(t) ? i = t : (i = t.handler, n = t);
  const o = er(this), a = mc(r, i.bind(s), n);
  return o(), a;
}
function _c(e, t) {
  const n = t.split(".");
  return () => {
    let s = e;
    for (let r = 0; r < n.length && s; r++)
      s = s[n[r]];
    return s;
  };
}
const dh = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${Mn(t)}Modifiers`] || e[`${Bn(t)}Modifiers`];
function ph(e, t, ...n) {
  if (e.isUnmounted) return;
  const s = e.vnode.props || Qe;
  let r = n;
  const i = t.startsWith("update:"), o = i && dh(s, t.slice(7));
  o && (o.trim && (r = n.map((c) => ft(c) ? c.trim() : c)), o.number && (r = n.map(ji)));
  let a, l = s[a = bi(t)] || // also try camelCase event handler (#2249)
  s[a = bi(Mn(t))];
  !l && i && (l = s[a = bi(Bn(t))]), l && ln(
    l,
    e,
    6,
    r
  );
  const d = s[a + "Once"];
  if (d) {
    if (!e.emitted)
      e.emitted = {};
    else if (e.emitted[a])
      return;
    e.emitted[a] = !0, ln(
      d,
      e,
      6,
      r
    );
  }
}
function yc(e, t, n = !1) {
  const s = t.emitsCache, r = s.get(e);
  if (r !== void 0)
    return r;
  const i = e.emits;
  let o = {}, a = !1;
  if (!ge(e)) {
    const l = (d) => {
      const c = yc(d, t, !0);
      c && (a = !0, wt(o, c));
    };
    !n && t.mixins.length && t.mixins.forEach(l), e.extends && l(e.extends), e.mixins && e.mixins.forEach(l);
  }
  return !i && !a ? (ot(e) && s.set(e, null), null) : (he(i) ? i.forEach((l) => o[l] = null) : wt(o, i), ot(e) && s.set(e, o), o);
}
function ni(e, t) {
  return !e || !Kr(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), qe(e, t[0].toLowerCase() + t.slice(1)) || qe(e, Bn(t)) || qe(e, t));
}
function Ra(e) {
  const {
    type: t,
    vnode: n,
    proxy: s,
    withProxy: r,
    propsOptions: [i],
    slots: o,
    attrs: a,
    emit: l,
    render: d,
    renderCache: c,
    props: b,
    data: w,
    setupState: D,
    ctx: L,
    inheritAttrs: W
  } = e, F = Dr(e);
  let se, ie;
  try {
    if (n.shapeFlag & 4) {
      const T = r || s, O = T;
      se = sn(
        d.call(
          O,
          T,
          c,
          b,
          D,
          w,
          L
        )
      ), ie = a;
    } else {
      const T = t;
      se = sn(
        T.length > 1 ? T(
          b,
          { attrs: a, slots: o, emit: l }
        ) : T(
          b,
          null
        )
      ), ie = t.props ? a : gh(a);
    }
  } catch (T) {
    js.length = 0, Qr(T, e, 1), se = on(Fn);
  }
  let oe = se;
  if (ie && W !== !1) {
    const T = Object.keys(ie), { shapeFlag: O } = oe;
    T.length && O & 7 && (i && T.some(go) && (ie = mh(
      ie,
      i
    )), oe = ds(oe, ie, !1, !0));
  }
  return n.dirs && (oe = ds(oe, null, !1, !0), oe.dirs = oe.dirs ? oe.dirs.concat(n.dirs) : n.dirs), n.transition && Eo(oe, n.transition), se = oe, Dr(F), se;
}
const gh = (e) => {
  let t;
  for (const n in e)
    (n === "class" || n === "style" || Kr(n)) && ((t || (t = {}))[n] = e[n]);
  return t;
}, mh = (e, t) => {
  const n = {};
  for (const s in e)
    (!go(s) || !(s.slice(9) in t)) && (n[s] = e[s]);
  return n;
};
function _h(e, t, n) {
  const { props: s, children: r, component: i } = e, { props: o, children: a, patchFlag: l } = t, d = i.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (n && l >= 0) {
    if (l & 1024)
      return !0;
    if (l & 16)
      return s ? Ia(s, o, d) : !!o;
    if (l & 8) {
      const c = t.dynamicProps;
      for (let b = 0; b < c.length; b++) {
        const w = c[b];
        if (o[w] !== s[w] && !ni(d, w))
          return !0;
      }
    }
  } else
    return (r || a) && (!a || !a.$stable) ? !0 : s === o ? !1 : s ? o ? Ia(s, o, d) : !0 : !!o;
  return !1;
}
function Ia(e, t, n) {
  const s = Object.keys(t);
  if (s.length !== Object.keys(e).length)
    return !0;
  for (let r = 0; r < s.length; r++) {
    const i = s[r];
    if (t[i] !== e[i] && !ni(n, i))
      return !0;
  }
  return !1;
}
function yh({ vnode: e, parent: t }, n) {
  for (; t; ) {
    const s = t.subTree;
    if (s.suspense && s.suspense.activeBranch === e && (s.el = e.el), s === e)
      (e = t.vnode).el = n, t = t.parent;
    else
      break;
  }
}
const vc = (e) => e.__isSuspense;
function vh(e, t) {
  t && t.pendingBranch ? he(e) ? t.effects.push(...e) : t.effects.push(e) : If(e);
}
const $e = Symbol.for("v-fgt"), si = Symbol.for("v-txt"), Fn = Symbol.for("v-cmt"), kr = Symbol.for("v-stc"), js = [];
let Dt = null;
function A(e = !1) {
  js.push(Dt = e ? null : []);
}
function bh() {
  js.pop(), Dt = js[js.length - 1] || null;
}
let Xs = 1;
function La(e, t = !1) {
  Xs += e, e < 0 && Dt && t && (Dt.hasOnce = !0);
}
function bc(e) {
  return e.dynamicChildren = Xs > 0 ? Dt || os : null, bh(), Xs > 0 && Dt && Dt.push(e), e;
}
function E(e, t, n, s, r, i) {
  return bc(
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
function $r(e, t, n, s, r) {
  return bc(
    on(
      e,
      t,
      n,
      s,
      r,
      !0
    )
  );
}
function wc(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function As(e, t) {
  return e.type === t.type && e.key === t.key;
}
const kc = ({ key: e }) => e ?? null, xr = ({
  ref: e,
  ref_key: t,
  ref_for: n
}) => (typeof e == "number" && (e = "" + e), e != null ? ft(e) || bt(e) || ge(e) ? { i: zt, r: e, k: t, f: !!n } : e : null);
function v(e, t = null, n = null, s = 0, r = null, i = e === $e ? 0 : 1, o = !1, a = !1) {
  const l = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && kc(t),
    ref: t && xr(t),
    scopeId: Jl,
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
    ctx: zt
  };
  return a ? (Io(l, n), i & 128 && e.normalize(l)) : n && (l.shapeFlag |= ft(n) ? 8 : 16), Xs > 0 && // avoid a block node from tracking itself
  !o && // has current parent block
  Dt && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (l.patchFlag > 0 || i & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  l.patchFlag !== 32 && Dt.push(l), l;
}
const on = wh;
function wh(e, t = null, n = null, s = 0, r = null, i = !1) {
  if ((!e || e === qf) && (e = Fn), wc(e)) {
    const a = ds(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return n && Io(a, n), Xs > 0 && !i && Dt && (a.shapeFlag & 6 ? Dt[Dt.indexOf(e)] = a : Dt.push(a)), a.patchFlag = -2, a;
  }
  if (Oh(e) && (e = e.__vccOpts), t) {
    t = kh(t);
    let { class: a, style: l } = t;
    a && !ft(a) && (t.class = Be(a)), ot(l) && (To(l) && !he(l) && (l = wt({}, l)), t.style = ke(l));
  }
  const o = ft(e) ? 1 : vc(e) ? 128 : Nf(e) ? 64 : ot(e) ? 4 : ge(e) ? 2 : 0;
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
function kh(e) {
  return e ? To(e) || lc(e) ? wt({}, e) : e : null;
}
function ds(e, t, n = !1, s = !1) {
  const { props: r, ref: i, patchFlag: o, children: a, transition: l } = e, d = t ? xh(r || {}, t) : r, c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: d,
    key: d && kc(d),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && i ? he(i) ? i.concat(xr(t)) : [i, xr(t)] : xr(t)
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
    patchFlag: t && e.type !== $e ? o === -1 ? 16 : o | 16 : o,
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
    ssContent: e.ssContent && ds(e.ssContent),
    ssFallback: e.ssFallback && ds(e.ssFallback),
    placeholder: e.placeholder,
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce
  };
  return l && s && Eo(
    c,
    l.clone(c)
  ), c;
}
function fn(e = " ", t = 0) {
  return on(si, null, e, t);
}
function Vn(e, t) {
  const n = on(kr, null, e);
  return n.staticCount = t, n;
}
function ne(e = "", t = !1) {
  return t ? (A(), $r(Fn, null, e)) : on(Fn, null, e);
}
function sn(e) {
  return e == null || typeof e == "boolean" ? on(Fn) : he(e) ? on(
    $e,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : wc(e) ? Ln(e) : on(si, null, String(e));
}
function Ln(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : ds(e);
}
function Io(e, t) {
  let n = 0;
  const { shapeFlag: s } = e;
  if (t == null)
    t = null;
  else if (he(t))
    n = 16;
  else if (typeof t == "object")
    if (s & 65) {
      const r = t.default;
      r && (r._c && (r._d = !1), Io(e, r()), r._c && (r._d = !0));
      return;
    } else {
      n = 32;
      const r = t._;
      !r && !lc(t) ? t._ctx = zt : r === 3 && zt && (zt.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else ge(t) ? (t = { default: t, _ctx: zt }, n = 32) : (t = String(t), s & 64 ? (n = 16, t = [fn(t)]) : n = 8);
  e.children = t, e.shapeFlag |= n;
}
function xh(...e) {
  const t = {};
  for (let n = 0; n < e.length; n++) {
    const s = e[n];
    for (const r in s)
      if (r === "class")
        t.class !== s.class && (t.class = Be([t.class, s.class]));
      else if (r === "style")
        t.style = ke([t.style, s.style]);
      else if (Kr(r)) {
        const i = t[r], o = s[r];
        o && i !== o && !(he(i) && i.includes(o)) && (t[r] = i ? [].concat(i, o) : o);
      } else r !== "" && (t[r] = s[r]);
  }
  return t;
}
function en(e, t, n, s = null) {
  ln(e, t, 7, [
    n,
    s
  ]);
}
const Th = ic();
let Ah = 0;
function Eh(e, t, n) {
  const s = e.type, r = (t ? t.appContext : e.appContext) || Th, i = {
    uid: Ah++,
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
    scope: new Ju(
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
    propsOptions: uc(s, r),
    emitsOptions: yc(s, r),
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
  return i.ctx = { _: i }, i.root = t ? t.root : i, i.emit = ph.bind(null, i), e.ce && e.ce(i), i;
}
let St = null;
const Sh = () => St || zt;
let Ur, eo;
{
  const e = Xr(), t = (n, s) => {
    let r;
    return (r = e[n]) || (r = e[n] = []), r.push(s), (i) => {
      r.length > 1 ? r.forEach((o) => o(i)) : r[0](i);
    };
  };
  Ur = t(
    "__VUE_INSTANCE_SETTERS__",
    (n) => St = n
  ), eo = t(
    "__VUE_SSR_SETTERS__",
    (n) => Zs = n
  );
}
const er = (e) => {
  const t = St;
  return Ur(e), e.scope.on(), () => {
    e.scope.off(), Ur(t);
  };
}, Oa = () => {
  St && St.scope.off(), Ur(null);
};
function xc(e) {
  return e.vnode.shapeFlag & 4;
}
let Zs = !1;
function Ch(e, t = !1, n = !1) {
  t && eo(t);
  const { props: s, children: r } = e.vnode, i = xc(e);
  eh(e, s, i, t), rh(e, r, n || t);
  const o = i ? Rh(e, t) : void 0;
  return t && eo(!1), o;
}
function Rh(e, t) {
  const n = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, jf);
  const { setup: s } = n;
  if (s) {
    yn();
    const r = e.setupContext = s.length > 1 ? Lh(e) : null, i = er(e), o = Js(
      s,
      e,
      0,
      [
        e.props,
        r
      ]
    ), a = Al(o);
    if (vn(), i(), (a || e.sp) && !Ws(e) && Ql(e), a) {
      if (o.then(Oa, Oa), t)
        return o.then((l) => {
          Na(e, l);
        }).catch((l) => {
          Qr(l, e, 0);
        });
      e.asyncDep = o;
    } else
      Na(e, o);
  } else
    Tc(e);
}
function Na(e, t, n) {
  ge(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : ot(t) && (e.setupState = Kl(t)), Tc(e);
}
function Tc(e, t, n) {
  const s = e.type;
  e.render || (e.render = s.render || rn);
  {
    const r = er(e);
    yn();
    try {
      Vf(e);
    } finally {
      vn(), r();
    }
  }
}
const Ih = {
  get(e, t) {
    return vt(e, "get", ""), e[t];
  }
};
function Lh(e) {
  const t = (n) => {
    e.exposed = n || {};
  };
  return {
    attrs: new Proxy(e.attrs, Ih),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function ri(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(Kl(bf(e.exposed)), {
    get(t, n) {
      if (n in t)
        return t[n];
      if (n in qs)
        return qs[n](e);
    },
    has(t, n) {
      return n in t || n in qs;
    }
  })) : e.proxy;
}
function Oh(e) {
  return ge(e) && "__vccOpts" in e;
}
const ce = (e, t) => Af(e, t, Zs), Nh = "3.5.18";
/**
* @vue/runtime-dom v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let to;
const Ma = typeof window < "u" && window.trustedTypes;
if (Ma)
  try {
    to = /* @__PURE__ */ Ma.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const Ac = to ? (e) => to.createHTML(e) : (e) => e, Mh = "http://www.w3.org/2000/svg", Ph = "http://www.w3.org/1998/Math/MathML", dn = typeof document < "u" ? document : null, Pa = dn && /* @__PURE__ */ dn.createElement("template"), Fh = {
  insert: (e, t, n) => {
    t.insertBefore(e, n || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, n, s) => {
    const r = t === "svg" ? dn.createElementNS(Mh, e) : t === "mathml" ? dn.createElementNS(Ph, e) : n ? dn.createElement(e, { is: n }) : dn.createElement(e);
    return e === "select" && s && s.multiple != null && r.setAttribute("multiple", s.multiple), r;
  },
  createText: (e) => dn.createTextNode(e),
  createComment: (e) => dn.createComment(e),
  setText: (e, t) => {
    e.nodeValue = t;
  },
  setElementText: (e, t) => {
    e.textContent = t;
  },
  parentNode: (e) => e.parentNode,
  nextSibling: (e) => e.nextSibling,
  querySelector: (e) => dn.querySelector(e),
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
      Pa.innerHTML = Ac(
        s === "svg" ? `<svg>${e}</svg>` : s === "mathml" ? `<math>${e}</math>` : e
      );
      const a = Pa.content;
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
}, Dh = Symbol("_vtc");
function Bh(e, t, n) {
  const s = e[Dh];
  s && (t = (t ? [t, ...s] : [...s]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
const zr = Symbol("_vod"), Ec = Symbol("_vsh"), $h = {
  beforeMount(e, { value: t }, { transition: n }) {
    e[zr] = e.style.display === "none" ? "" : e.style.display, n && t ? n.beforeEnter(e) : Es(e, t);
  },
  mounted(e, { value: t }, { transition: n }) {
    n && t && n.enter(e);
  },
  updated(e, { value: t, oldValue: n }, { transition: s }) {
    !t != !n && (s ? t ? (s.beforeEnter(e), Es(e, !0), s.enter(e)) : s.leave(e, () => {
      Es(e, !1);
    }) : Es(e, t));
  },
  beforeUnmount(e, { value: t }) {
    Es(e, t);
  }
};
function Es(e, t) {
  e.style.display = t ? e[zr] : "none", e[Ec] = !t;
}
const Uh = Symbol(""), zh = /(^|;)\s*display\s*:/;
function Hh(e, t, n) {
  const s = e.style, r = ft(n);
  let i = !1;
  if (n && !r) {
    if (t)
      if (ft(t))
        for (const o of t.split(";")) {
          const a = o.slice(0, o.indexOf(":")).trim();
          n[a] == null && Tr(s, a, "");
        }
      else
        for (const o in t)
          n[o] == null && Tr(s, o, "");
    for (const o in n)
      o === "display" && (i = !0), Tr(s, o, n[o]);
  } else if (r) {
    if (t !== n) {
      const o = s[Uh];
      o && (n += ";" + o), s.cssText = n, i = zh.test(n);
    }
  } else t && e.removeAttribute("style");
  zr in e && (e[zr] = i ? s.display : "", e[Ec] && (s.display = "none"));
}
const Fa = /\s*!important$/;
function Tr(e, t, n) {
  if (he(n))
    n.forEach((s) => Tr(e, t, s));
  else if (n == null && (n = ""), t.startsWith("--"))
    e.setProperty(t, n);
  else {
    const s = Wh(e, t);
    Fa.test(n) ? e.setProperty(
      Bn(s),
      n.replace(Fa, ""),
      "important"
    ) : e[s] = n;
  }
}
const Da = ["Webkit", "Moz", "ms"], Si = {};
function Wh(e, t) {
  const n = Si[t];
  if (n)
    return n;
  let s = Mn(t);
  if (s !== "filter" && s in e)
    return Si[t] = s;
  s = Cl(s);
  for (let r = 0; r < Da.length; r++) {
    const i = Da[r] + s;
    if (i in e)
      return Si[t] = i;
  }
  return t;
}
const Ba = "http://www.w3.org/1999/xlink";
function $a(e, t, n, s, r, i = Zu(t)) {
  s && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(Ba, t.slice(6, t.length)) : e.setAttributeNS(Ba, t, n) : n == null || i && !Rl(n) ? e.removeAttribute(t) : e.setAttribute(
    t,
    i ? "" : Dn(n) ? String(n) : n
  );
}
function Ua(e, t, n, s, r) {
  if (t === "innerHTML" || t === "textContent") {
    n != null && (e[t] = t === "innerHTML" ? Ac(n) : n);
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
    a === "boolean" ? n = Rl(n) : n == null && a === "string" ? (n = "", o = !0) : a === "number" && (n = 0, o = !0);
  }
  try {
    e[t] = n;
  } catch {
  }
  o && e.removeAttribute(r || t);
}
function is(e, t, n, s) {
  e.addEventListener(t, n, s);
}
function qh(e, t, n, s) {
  e.removeEventListener(t, n, s);
}
const za = Symbol("_vei");
function jh(e, t, n, s, r = null) {
  const i = e[za] || (e[za] = {}), o = i[t];
  if (s && o)
    o.value = s;
  else {
    const [a, l] = Vh(t);
    if (s) {
      const d = i[t] = Yh(
        s,
        r
      );
      is(e, a, d, l);
    } else o && (qh(e, a, o, l), i[t] = void 0);
  }
}
const Ha = /(?:Once|Passive|Capture)$/;
function Vh(e) {
  let t;
  if (Ha.test(e)) {
    t = {};
    let s;
    for (; s = e.match(Ha); )
      e = e.slice(0, e.length - s[0].length), t[s[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : Bn(e.slice(2)), t];
}
let Ci = 0;
const Kh = /* @__PURE__ */ Promise.resolve(), Gh = () => Ci || (Kh.then(() => Ci = 0), Ci = Date.now());
function Yh(e, t) {
  const n = (s) => {
    if (!s._vts)
      s._vts = Date.now();
    else if (s._vts <= n.attached)
      return;
    ln(
      Xh(s, n.value),
      t,
      5,
      [s]
    );
  };
  return n.value = e, n.attached = Gh(), n;
}
function Xh(e, t) {
  if (he(t)) {
    const n = e.stopImmediatePropagation;
    return e.stopImmediatePropagation = () => {
      n.call(e), e._stopped = !0;
    }, t.map(
      (s) => (r) => !r._stopped && s && s(r)
    );
  } else
    return t;
}
const Wa = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, Zh = (e, t, n, s, r, i) => {
  const o = r === "svg";
  t === "class" ? Bh(e, s, o) : t === "style" ? Hh(e, n, s) : Kr(t) ? go(t) || jh(e, t, n, s, i) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : Jh(e, t, s, o)) ? (Ua(e, t, s), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && $a(e, t, s, o, i, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !ft(s)) ? Ua(e, Mn(t), s, i, t) : (t === "true-value" ? e._trueValue = s : t === "false-value" && (e._falseValue = s), $a(e, t, s, o));
};
function Jh(e, t, n, s) {
  if (s)
    return !!(t === "innerHTML" || t === "textContent" || t in e && Wa(t) && ge(n));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const r = e.tagName;
    if (r === "IMG" || r === "VIDEO" || r === "CANVAS" || r === "SOURCE")
      return !1;
  }
  return Wa(t) && ft(n) ? !1 : t in e;
}
const qa = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return he(t) ? (n) => br(t, n) : t;
};
function Qh(e) {
  e.target.composing = !0;
}
function ja(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const Ri = Symbol("_assign"), Kn = {
  created(e, { modifiers: { lazy: t, trim: n, number: s } }, r) {
    e[Ri] = qa(r);
    const i = s || r.props && r.props.type === "number";
    is(e, t ? "change" : "input", (o) => {
      if (o.target.composing) return;
      let a = e.value;
      n && (a = a.trim()), i && (a = ji(a)), e[Ri](a);
    }), n && is(e, "change", () => {
      e.value = e.value.trim();
    }), t || (is(e, "compositionstart", Qh), is(e, "compositionend", ja), is(e, "change", ja));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t }) {
    e.value = t ?? "";
  },
  beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: s, trim: r, number: i } }, o) {
    if (e[Ri] = qa(o), e.composing) return;
    const a = (i || e.type === "number") && !/^0\d/.test(e.value) ? ji(e.value) : e.value, l = t ?? "";
    a !== l && (document.activeElement === e && e.type !== "range" && (s && t === n || r && e.value.trim() === l) || (e.value = l));
  }
}, ed = ["ctrl", "shift", "alt", "meta"], td = {
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
  exact: (e, t) => ed.some((n) => e[`${n}Key`] && !t.includes(n))
}, Yn = (e, t) => {
  const n = e._withMods || (e._withMods = {}), s = t.join(".");
  return n[s] || (n[s] = (r, ...i) => {
    for (let o = 0; o < t.length; o++) {
      const a = td[t[o]];
      if (a && a(r, t)) return;
    }
    return e(r, ...i);
  });
}, nd = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, Ar = (e, t) => {
  const n = e._withKeys || (e._withKeys = {}), s = t.join(".");
  return n[s] || (n[s] = (r) => {
    if (!("key" in r))
      return;
    const i = Bn(r.key);
    if (t.some(
      (o) => o === i || nd[o] === i
    ))
      return e(r);
  });
}, sd = /* @__PURE__ */ wt({ patchProp: Zh }, Fh);
let Va;
function rd() {
  return Va || (Va = oh(sd));
}
const id = (...e) => {
  const t = rd().createApp(...e), { mount: n } = t;
  return t.mount = (s) => {
    const r = ad(s);
    if (!r) return;
    const i = t._component;
    !ge(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
    const o = n(r, !1, od(r));
    return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), o;
  }, t;
};
function od(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function ad(e) {
  return ft(e) ? document.querySelector(e) : e;
}
const fs = (e) => {
  const t = e.replace("#", ""), n = parseInt(t.substr(0, 2), 16), s = parseInt(t.substr(2, 2), 16), r = parseInt(t.substr(4, 2), 16);
  return (n * 299 + s * 587 + r * 114) / 1e3 < 128;
}, ld = (e, t) => {
  const n = e.replace("#", ""), s = parseInt(n.substr(0, 2), 16), r = parseInt(n.substr(2, 2), 16), i = parseInt(n.substr(4, 2), 16), o = fs(e), a = o ? Math.min(255, s + t) : Math.max(0, s - t), l = o ? Math.min(255, r + t) : Math.max(0, r - t), d = o ? Math.min(255, i + t) : Math.max(0, i - t);
  return `#${a.toString(16).padStart(2, "0")}${l.toString(16).padStart(2, "0")}${d.toString(16).padStart(2, "0")}`;
}, Ss = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e), cd = (e) => {
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
function Lo() {
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
var Qn = Lo();
function Sc(e) {
  Qn = e;
}
var Vs = { exec: () => null };
function je(e, t = "") {
  let n = typeof e == "string" ? e : e.source;
  const s = {
    replace: (r, i) => {
      let o = typeof i == "string" ? i : i.source;
      return o = o.replace(Ct.caret, "$1"), n = n.replace(r, o), s;
    },
    getRegex: () => new RegExp(n, t)
  };
  return s;
}
var Ct = {
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
}, ud = /^(?:[ \t]*(?:\n|$))+/, fd = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/, hd = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, tr = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, dd = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, Oo = /(?:[*+-]|\d{1,9}[.)])/, Cc = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/, Rc = je(Cc).replace(/bull/g, Oo).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(), pd = je(Cc).replace(/bull/g, Oo).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(), No = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/, gd = /^[^\n]+/, Mo = /(?!\s*\])(?:\\.|[^\[\]\\])+/, md = je(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", Mo).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), _d = je(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, Oo).getRegex(), ii = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", Po = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, yd = je(
  "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))",
  "i"
).replace("comment", Po).replace("tag", ii).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), Ic = je(No).replace("hr", tr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", ii).getRegex(), vd = je(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", Ic).getRegex(), Fo = {
  blockquote: vd,
  code: fd,
  def: md,
  fences: hd,
  heading: dd,
  hr: tr,
  html: yd,
  lheading: Rc,
  list: _d,
  newline: ud,
  paragraph: Ic,
  table: Vs,
  text: gd
}, Ka = je(
  "^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"
).replace("hr", tr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", ii).getRegex(), bd = {
  ...Fo,
  lheading: pd,
  table: Ka,
  paragraph: je(No).replace("hr", tr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", Ka).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", ii).getRegex()
}, wd = {
  ...Fo,
  html: je(
    `^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`
  ).replace("comment", Po).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
  heading: /^(#{1,6})(.*)(?:\n+|$)/,
  fences: Vs,
  // fences not supported
  lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  paragraph: je(No).replace("hr", tr).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", Rc).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
}, kd = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, xd = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, Lc = /^( {2,}|\\)\n(?!\s*$)/, Td = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, oi = /[\p{P}\p{S}]/u, Do = /[\s\p{P}\p{S}]/u, Oc = /[^\s\p{P}\p{S}]/u, Ad = je(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, Do).getRegex(), Nc = /(?!~)[\p{P}\p{S}]/u, Ed = /(?!~)[\s\p{P}\p{S}]/u, Sd = /(?:[^\s\p{P}\p{S}]|~)/u, Cd = /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g, Mc = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/, Rd = je(Mc, "u").replace(/punct/g, oi).getRegex(), Id = je(Mc, "u").replace(/punct/g, Nc).getRegex(), Pc = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", Ld = je(Pc, "gu").replace(/notPunctSpace/g, Oc).replace(/punctSpace/g, Do).replace(/punct/g, oi).getRegex(), Od = je(Pc, "gu").replace(/notPunctSpace/g, Sd).replace(/punctSpace/g, Ed).replace(/punct/g, Nc).getRegex(), Nd = je(
  "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)",
  "gu"
).replace(/notPunctSpace/g, Oc).replace(/punctSpace/g, Do).replace(/punct/g, oi).getRegex(), Md = je(/\\(punct)/, "gu").replace(/punct/g, oi).getRegex(), Pd = je(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), Fd = je(Po).replace("(?:-->|$)", "-->").getRegex(), Dd = je(
  "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>"
).replace("comment", Fd).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), Hr = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/, Bd = je(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", Hr).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), Fc = je(/^!?\[(label)\]\[(ref)\]/).replace("label", Hr).replace("ref", Mo).getRegex(), Dc = je(/^!?\[(ref)\](?:\[\])?/).replace("ref", Mo).getRegex(), $d = je("reflink|nolink(?!\\()", "g").replace("reflink", Fc).replace("nolink", Dc).getRegex(), Bo = {
  _backpedal: Vs,
  // only used for GFM url
  anyPunctuation: Md,
  autolink: Pd,
  blockSkip: Cd,
  br: Lc,
  code: xd,
  del: Vs,
  emStrongLDelim: Rd,
  emStrongRDelimAst: Ld,
  emStrongRDelimUnd: Nd,
  escape: kd,
  link: Bd,
  nolink: Dc,
  punctuation: Ad,
  reflink: Fc,
  reflinkSearch: $d,
  tag: Dd,
  text: Td,
  url: Vs
}, Ud = {
  ...Bo,
  link: je(/^!?\[(label)\]\((.*?)\)/).replace("label", Hr).getRegex(),
  reflink: je(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", Hr).getRegex()
}, no = {
  ...Bo,
  emStrongRDelimAst: Od,
  emStrongLDelim: Id,
  url: je(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, "i").replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
  _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
}, zd = {
  ...no,
  br: je(Lc).replace("{2,}", "*").getRegex(),
  text: je(no.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
}, gr = {
  normal: Fo,
  gfm: bd,
  pedantic: wd
}, Cs = {
  normal: Bo,
  gfm: no,
  breaks: zd,
  pedantic: Ud
}, Hd = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}, Ga = (e) => Hd[e];
function tn(e, t) {
  if (t) {
    if (Ct.escapeTest.test(e))
      return e.replace(Ct.escapeReplace, Ga);
  } else if (Ct.escapeTestNoEncode.test(e))
    return e.replace(Ct.escapeReplaceNoEncode, Ga);
  return e;
}
function Ya(e) {
  try {
    e = encodeURI(e).replace(Ct.percentDecode, "%");
  } catch {
    return null;
  }
  return e;
}
function Xa(e, t) {
  var i;
  const n = e.replace(Ct.findPipe, (o, a, l) => {
    let d = !1, c = a;
    for (; --c >= 0 && l[c] === "\\"; ) d = !d;
    return d ? "|" : " |";
  }), s = n.split(Ct.splitPipe);
  let r = 0;
  if (s[0].trim() || s.shift(), s.length > 0 && !((i = s.at(-1)) != null && i.trim()) && s.pop(), t)
    if (s.length > t)
      s.splice(t);
    else
      for (; s.length < t; ) s.push("");
  for (; r < s.length; r++)
    s[r] = s[r].trim().replace(Ct.slashPipe, "|");
  return s;
}
function Rs(e, t, n) {
  const s = e.length;
  if (s === 0)
    return "";
  let r = 0;
  for (; r < s && e.charAt(s - r - 1) === t; )
    r++;
  return e.slice(0, s - r);
}
function Wd(e, t) {
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
function Za(e, t, n, s, r) {
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
function qd(e, t, n) {
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
var Wr = class {
  // set by the lexer
  constructor(e) {
    Je(this, "options");
    Je(this, "rules");
    // set by the lexer
    Je(this, "lexer");
    this.options = e || Qn;
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
        text: this.options.pedantic ? n : Rs(n, `
`)
      };
    }
  }
  fences(e) {
    const t = this.rules.block.fences.exec(e);
    if (t) {
      const n = t[0], s = qd(n, t[3] || "", this.rules);
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
        const s = Rs(n, "#");
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
        raw: Rs(t[0], `
`)
      };
  }
  blockquote(e) {
    const t = this.rules.block.blockquote.exec(e);
    if (t) {
      let n = Rs(t[0], `
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
        const d = a.join(`
`), c = d.replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
        s = s ? `${s}
${d}` : d, r = r ? `${r}
${c}` : c;
        const b = this.lexer.state.top;
        if (this.lexer.state.top = !0, this.lexer.blockTokens(c, i, !0), this.lexer.state.top = b, n.length === 0)
          break;
        const w = i.at(-1);
        if ((w == null ? void 0 : w.type) === "code")
          break;
        if ((w == null ? void 0 : w.type) === "blockquote") {
          const D = w, L = D.raw + `
` + n.join(`
`), W = this.blockquote(L);
          i[i.length - 1] = W, s = s.substring(0, s.length - D.raw.length) + W.raw, r = r.substring(0, r.length - D.text.length) + W.text;
          break;
        } else if ((w == null ? void 0 : w.type) === "list") {
          const D = w, L = D.raw + `
` + n.join(`
`), W = this.list(L);
          i[i.length - 1] = W, s = s.substring(0, s.length - w.raw.length) + W.raw, r = r.substring(0, r.length - D.raw.length) + W.raw, n = L.substring(i.at(-1).raw.length).split(`
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
        let l = !1, d = "", c = "";
        if (!(t = i.exec(e)) || this.rules.block.hr.test(e))
          break;
        d = t[0], e = e.substring(d.length);
        let b = t[2].split(`
`, 1)[0].replace(this.rules.other.listReplaceTabs, (se) => " ".repeat(3 * se.length)), w = e.split(`
`, 1)[0], D = !b.trim(), L = 0;
        if (this.options.pedantic ? (L = 2, c = b.trimStart()) : D ? L = t[1].length + 1 : (L = t[2].search(this.rules.other.nonSpaceChar), L = L > 4 ? 1 : L, c = b.slice(L), L += t[1].length), D && this.rules.other.blankLine.test(w) && (d += w + `
`, e = e.substring(w.length + 1), l = !0), !l) {
          const se = this.rules.other.nextBulletRegex(L), ie = this.rules.other.hrRegex(L), oe = this.rules.other.fencesBeginRegex(L), T = this.rules.other.headingBeginRegex(L), O = this.rules.other.htmlBeginRegex(L);
          for (; e; ) {
            const V = e.split(`
`, 1)[0];
            let K;
            if (w = V, this.options.pedantic ? (w = w.replace(this.rules.other.listReplaceNesting, "  "), K = w) : K = w.replace(this.rules.other.tabCharGlobal, "    "), oe.test(w) || T.test(w) || O.test(w) || se.test(w) || ie.test(w))
              break;
            if (K.search(this.rules.other.nonSpaceChar) >= L || !w.trim())
              c += `
` + K.slice(L);
            else {
              if (D || b.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || oe.test(b) || T.test(b) || ie.test(b))
                break;
              c += `
` + w;
            }
            !D && !w.trim() && (D = !0), d += V + `
`, e = e.substring(V.length + 1), b = K.slice(L);
          }
        }
        r.loose || (o ? r.loose = !0 : this.rules.other.doubleBlankLine.test(d) && (o = !0));
        let W = null, F;
        this.options.gfm && (W = this.rules.other.listIsTask.exec(c), W && (F = W[0] !== "[ ] ", c = c.replace(this.rules.other.listReplaceTask, ""))), r.items.push({
          type: "list_item",
          raw: d,
          task: !!W,
          checked: F,
          loose: !1,
          text: c,
          tokens: []
        }), r.raw += d;
      }
      const a = r.items.at(-1);
      if (a)
        a.raw = a.raw.trimEnd(), a.text = a.text.trimEnd();
      else
        return;
      r.raw = r.raw.trimEnd();
      for (let l = 0; l < r.items.length; l++)
        if (this.lexer.state.top = !1, r.items[l].tokens = this.lexer.blockTokens(r.items[l].text, []), !r.loose) {
          const d = r.items[l].tokens.filter((b) => b.type === "space"), c = d.length > 0 && d.some((b) => this.rules.other.anyLine.test(b.raw));
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
    const n = Xa(t[1]), s = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), r = (o = t[3]) != null && o.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
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
        i.rows.push(Xa(a, i.header.length).map((l, d) => ({
          text: l,
          tokens: this.lexer.inline(l),
          header: !1,
          align: i.align[d]
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
        const i = Rs(n.slice(0, -1), "\\");
        if ((n.length - i.length) % 2 === 0)
          return;
      } else {
        const i = Wd(t[2], "()");
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
      return s = s.trim(), this.rules.other.startAngleBracket.test(s) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n) ? s = s.slice(1) : s = s.slice(1, -1)), Za(t, {
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
      return Za(n, r, n[0], this.lexer, this.rules);
    }
  }
  emStrong(e, t, n = "") {
    let s = this.rules.inline.emStrongLDelim.exec(e);
    if (!s || s[3] && n.match(this.rules.other.unicodeAlphaNumeric)) return;
    if (!(s[1] || s[2] || "") || !n || this.rules.inline.punctuation.exec(n)) {
      const i = [...s[0]].length - 1;
      let o, a, l = i, d = 0;
      const c = s[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      for (c.lastIndex = 0, t = t.slice(-1 * e.length + i); (s = c.exec(t)) != null; ) {
        if (o = s[1] || s[2] || s[3] || s[4] || s[5] || s[6], !o) continue;
        if (a = [...o].length, s[3] || s[4]) {
          l += a;
          continue;
        } else if ((s[5] || s[6]) && i % 3 && !((i + a) % 3)) {
          d += a;
          continue;
        }
        if (l -= a, l > 0) continue;
        a = Math.min(a, a + l + d);
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
        const D = w.slice(2, -2);
        return {
          type: "strong",
          raw: w,
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
}, mn = class so {
  constructor(t) {
    Je(this, "tokens");
    Je(this, "options");
    Je(this, "state");
    Je(this, "tokenizer");
    Je(this, "inlineQueue");
    this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = t || Qn, this.options.tokenizer = this.options.tokenizer || new Wr(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = {
      inLink: !1,
      inRawBlock: !1,
      top: !0
    };
    const n = {
      other: Ct,
      block: gr.normal,
      inline: Cs.normal
    };
    this.options.pedantic ? (n.block = gr.pedantic, n.inline = Cs.pedantic) : this.options.gfm && (n.block = gr.gfm, this.options.breaks ? n.inline = Cs.breaks : n.inline = Cs.gfm), this.tokenizer.rules = n;
  }
  /**
   * Expose Rules
   */
  static get rules() {
    return {
      block: gr,
      inline: Cs
    };
  }
  /**
   * Static Lex Method
   */
  static lex(t, n) {
    return new so(n).lex(t);
  }
  /**
   * Static Lex Inline Method
   */
  static lexInline(t, n) {
    return new so(n).inlineTokens(t);
  }
  /**
   * Preprocessing
   */
  lex(t) {
    t = t.replace(Ct.carriageReturn, `
`), this.blockTokens(t, this.tokens);
    for (let n = 0; n < this.inlineQueue.length; n++) {
      const s = this.inlineQueue[n];
      this.inlineTokens(s.src, s.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(t, n = [], s = !1) {
    var r, i, o;
    for (this.options.pedantic && (t = t.replace(Ct.tabCharGlobal, "    ").replace(Ct.spaceLine, "")); t; ) {
      let a;
      if ((i = (r = this.options.extensions) == null ? void 0 : r.block) != null && i.some((d) => (a = d.call({ lexer: this }, t, n)) ? (t = t.substring(a.raw.length), n.push(a), !0) : !1))
        continue;
      if (a = this.tokenizer.space(t)) {
        t = t.substring(a.raw.length);
        const d = n.at(-1);
        a.raw.length === 1 && d !== void 0 ? d.raw += `
` : n.push(a);
        continue;
      }
      if (a = this.tokenizer.code(t)) {
        t = t.substring(a.raw.length);
        const d = n.at(-1);
        (d == null ? void 0 : d.type) === "paragraph" || (d == null ? void 0 : d.type) === "text" ? (d.raw += `
` + a.raw, d.text += `
` + a.text, this.inlineQueue.at(-1).src = d.text) : n.push(a);
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
        const d = n.at(-1);
        (d == null ? void 0 : d.type) === "paragraph" || (d == null ? void 0 : d.type) === "text" ? (d.raw += `
` + a.raw, d.text += `
` + a.raw, this.inlineQueue.at(-1).src = d.text) : this.tokens.links[a.tag] || (this.tokens.links[a.tag] = {
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
        let d = 1 / 0;
        const c = t.slice(1);
        let b;
        this.options.extensions.startBlock.forEach((w) => {
          b = w.call({ lexer: this }, c), typeof b == "number" && b >= 0 && (d = Math.min(d, b));
        }), d < 1 / 0 && d >= 0 && (l = t.substring(0, d + 1));
      }
      if (this.state.top && (a = this.tokenizer.paragraph(l))) {
        const d = n.at(-1);
        s && (d == null ? void 0 : d.type) === "paragraph" ? (d.raw += `
` + a.raw, d.text += `
` + a.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = d.text) : n.push(a), s = l.length !== t.length, t = t.substring(a.raw.length);
        continue;
      }
      if (a = this.tokenizer.text(t)) {
        t = t.substring(a.raw.length);
        const d = n.at(-1);
        (d == null ? void 0 : d.type) === "text" ? (d.raw += `
` + a.raw, d.text += `
` + a.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = d.text) : n.push(a);
        continue;
      }
      if (t) {
        const d = "Infinite loop on byte: " + t.charCodeAt(0);
        if (this.options.silent) {
          console.error(d);
          break;
        } else
          throw new Error(d);
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
    var a, l, d;
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
      if ((d = this.options.extensions) != null && d.startInline) {
        let w = 1 / 0;
        const D = t.slice(1);
        let L;
        this.options.extensions.startInline.forEach((W) => {
          L = W.call({ lexer: this }, D), typeof L == "number" && L >= 0 && (w = Math.min(w, L));
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
}, qr = class {
  // set by the parser
  constructor(e) {
    Je(this, "options");
    Je(this, "parser");
    this.options = e || Qn;
  }
  space(e) {
    return "";
  }
  code({ text: e, lang: t, escaped: n }) {
    var i;
    const s = (i = (t || "").match(Ct.notSpaceStart)) == null ? void 0 : i[0], r = e.replace(Ct.endingNewline, "") + `
`;
    return s ? '<pre><code class="language-' + tn(s) + '">' + (n ? r : tn(r, !0)) + `</code></pre>
` : "<pre><code>" + (n ? r : tn(r, !0)) + `</code></pre>
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
      e.loose ? ((n = e.tokens[0]) == null ? void 0 : n.type) === "paragraph" ? (e.tokens[0].text = s + " " + e.tokens[0].text, e.tokens[0].tokens && e.tokens[0].tokens.length > 0 && e.tokens[0].tokens[0].type === "text" && (e.tokens[0].tokens[0].text = s + " " + tn(e.tokens[0].tokens[0].text), e.tokens[0].tokens[0].escaped = !0)) : e.tokens.unshift({
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
    return `<code>${tn(e, !0)}</code>`;
  }
  br(e) {
    return "<br>";
  }
  del({ tokens: e }) {
    return `<del>${this.parser.parseInline(e)}</del>`;
  }
  link({ href: e, title: t, tokens: n }) {
    const s = this.parser.parseInline(n), r = Ya(e);
    if (r === null)
      return s;
    e = r;
    let i = '<a href="' + e + '"';
    return t && (i += ' title="' + tn(t) + '"'), i += ">" + s + "</a>", i;
  }
  image({ href: e, title: t, text: n, tokens: s }) {
    s && (n = this.parser.parseInline(s, this.parser.textRenderer));
    const r = Ya(e);
    if (r === null)
      return tn(n);
    e = r;
    let i = `<img src="${e}" alt="${n}"`;
    return t && (i += ` title="${tn(t)}"`), i += ">", i;
  }
  text(e) {
    return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : tn(e.text);
  }
}, $o = class {
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
}, _n = class ro {
  constructor(t) {
    Je(this, "options");
    Je(this, "renderer");
    Je(this, "textRenderer");
    this.options = t || Qn, this.options.renderer = this.options.renderer || new qr(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new $o();
  }
  /**
   * Static Parse Method
   */
  static parse(t, n) {
    return new ro(n).parse(t);
  }
  /**
   * Static Parse Inline Method
   */
  static parseInline(t, n) {
    return new ro(n).parseInline(t);
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
        const d = a, c = this.options.extensions.renderers[d.type].call({ parser: this }, d);
        if (c !== !1 || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "paragraph", "text"].includes(d.type)) {
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
          let d = l, c = this.renderer.text(d);
          for (; o + 1 < t.length && t[o + 1].type === "text"; )
            d = t[++o], c += `
` + this.renderer.text(d);
          n ? s += this.renderer.paragraph({
            type: "paragraph",
            raw: c,
            text: c,
            tokens: [{ type: "text", raw: c, text: c, escaped: !0 }]
          }) : s += c;
          continue;
        }
        default: {
          const d = 'Token with "' + l.type + '" type was not found.';
          if (this.options.silent)
            return console.error(d), "";
          throw new Error(d);
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
        const d = this.options.extensions.renderers[a.type].call({ parser: this }, a);
        if (d !== !1 || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(a.type)) {
          s += d || "";
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
          const d = 'Token with "' + l.type + '" type was not found.';
          if (this.options.silent)
            return console.error(d), "";
          throw new Error(d);
        }
      }
    }
    return s;
  }
}, Wi, Er = (Wi = class {
  constructor(e) {
    Je(this, "options");
    Je(this, "block");
    this.options = e || Qn;
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
    return this.block ? mn.lex : mn.lexInline;
  }
  /**
   * Provide function to parse tokens
   */
  provideParser() {
    return this.block ? _n.parse : _n.parseInline;
  }
}, Je(Wi, "passThroughHooks", /* @__PURE__ */ new Set([
  "preprocess",
  "postprocess",
  "processAllTokens"
])), Wi), jd = class {
  constructor(...e) {
    Je(this, "defaults", Lo());
    Je(this, "options", this.setOptions);
    Je(this, "parse", this.parseMarkdown(!0));
    Je(this, "parseInline", this.parseMarkdown(!1));
    Je(this, "Parser", _n);
    Je(this, "Renderer", qr);
    Je(this, "TextRenderer", $o);
    Je(this, "Lexer", mn);
    Je(this, "Tokenizer", Wr);
    Je(this, "Hooks", Er);
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
        const r = this.defaults.renderer || new qr(this.defaults);
        for (const i in n.renderer) {
          if (!(i in r))
            throw new Error(`renderer '${i}' does not exist`);
          if (["options", "parser"].includes(i))
            continue;
          const o = i, a = n.renderer[o], l = r[o];
          r[o] = (...d) => {
            let c = a.apply(r, d);
            return c === !1 && (c = l.apply(r, d)), c || "";
          };
        }
        s.renderer = r;
      }
      if (n.tokenizer) {
        const r = this.defaults.tokenizer || new Wr(this.defaults);
        for (const i in n.tokenizer) {
          if (!(i in r))
            throw new Error(`tokenizer '${i}' does not exist`);
          if (["options", "rules", "lexer"].includes(i))
            continue;
          const o = i, a = n.tokenizer[o], l = r[o];
          r[o] = (...d) => {
            let c = a.apply(r, d);
            return c === !1 && (c = l.apply(r, d)), c;
          };
        }
        s.tokenizer = r;
      }
      if (n.hooks) {
        const r = this.defaults.hooks || new Er();
        for (const i in n.hooks) {
          if (!(i in r))
            throw new Error(`hook '${i}' does not exist`);
          if (["options", "block"].includes(i))
            continue;
          const o = i, a = n.hooks[o], l = r[o];
          Er.passThroughHooks.has(i) ? r[o] = (d) => {
            if (this.defaults.async)
              return Promise.resolve(a.call(r, d)).then((b) => l.call(r, b));
            const c = a.call(r, d);
            return l.call(r, c);
          } : r[o] = (...d) => {
            let c = a.apply(r, d);
            return c === !1 && (c = l.apply(r, d)), c;
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
    return mn.lex(e, t ?? this.defaults);
  }
  parser(e, t) {
    return _n.parse(e, t ?? this.defaults);
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
      const a = i.hooks ? i.hooks.provideLexer() : e ? mn.lex : mn.lexInline, l = i.hooks ? i.hooks.provideParser() : e ? _n.parse : _n.parseInline;
      if (i.async)
        return Promise.resolve(i.hooks ? i.hooks.preprocess(n) : n).then((d) => a(d, i)).then((d) => i.hooks ? i.hooks.processAllTokens(d) : d).then((d) => i.walkTokens ? Promise.all(this.walkTokens(d, i.walkTokens)).then(() => d) : d).then((d) => l(d, i)).then((d) => i.hooks ? i.hooks.postprocess(d) : d).catch(o);
      try {
        i.hooks && (n = i.hooks.preprocess(n));
        let d = a(n, i);
        i.hooks && (d = i.hooks.processAllTokens(d)), i.walkTokens && this.walkTokens(d, i.walkTokens);
        let c = l(d, i);
        return i.hooks && (c = i.hooks.postprocess(c)), c;
      } catch (d) {
        return o(d);
      }
    };
  }
  onError(e, t) {
    return (n) => {
      if (n.message += `
Please report this to https://github.com/markedjs/marked.`, e) {
        const s = "<p>An error occurred:</p><pre>" + tn(n.message + "", !0) + "</pre>";
        return t ? Promise.resolve(s) : s;
      }
      if (t)
        return Promise.reject(n);
      throw n;
    };
  }
}, Jn = new jd();
function Ue(e, t) {
  return Jn.parse(e, t);
}
Ue.options = Ue.setOptions = function(e) {
  return Jn.setOptions(e), Ue.defaults = Jn.defaults, Sc(Ue.defaults), Ue;
};
Ue.getDefaults = Lo;
Ue.defaults = Qn;
Ue.use = function(...e) {
  return Jn.use(...e), Ue.defaults = Jn.defaults, Sc(Ue.defaults), Ue;
};
Ue.walkTokens = function(e, t) {
  return Jn.walkTokens(e, t);
};
Ue.parseInline = Jn.parseInline;
Ue.Parser = _n;
Ue.parser = _n.parse;
Ue.Renderer = qr;
Ue.TextRenderer = $o;
Ue.Lexer = mn;
Ue.lexer = mn.lex;
Ue.Tokenizer = Wr;
Ue.Hooks = Er;
Ue.parse = Ue;
Ue.options;
Ue.setOptions;
Ue.use;
Ue.walkTokens;
Ue.parseInline;
_n.parse;
mn.lex;
/*! @license DOMPurify 3.2.6 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.2.6/LICENSE */
const {
  entries: Bc,
  setPrototypeOf: Ja,
  isFrozen: Vd,
  getPrototypeOf: Kd,
  getOwnPropertyDescriptor: Gd
} = Object;
let {
  freeze: Rt,
  seal: Wt,
  create: $c
} = Object, {
  apply: io,
  construct: oo
} = typeof Reflect < "u" && Reflect;
Rt || (Rt = function(t) {
  return t;
});
Wt || (Wt = function(t) {
  return t;
});
io || (io = function(t, n, s) {
  return t.apply(n, s);
});
oo || (oo = function(t, n) {
  return new t(...n);
});
const mr = It(Array.prototype.forEach), Yd = It(Array.prototype.lastIndexOf), Qa = It(Array.prototype.pop), Is = It(Array.prototype.push), Xd = It(Array.prototype.splice), Sr = It(String.prototype.toLowerCase), Ii = It(String.prototype.toString), el = It(String.prototype.match), Ls = It(String.prototype.replace), Zd = It(String.prototype.indexOf), Jd = It(String.prototype.trim), Gt = It(Object.prototype.hasOwnProperty), Tt = It(RegExp.prototype.test), Os = Qd(TypeError);
function It(e) {
  return function(t) {
    t instanceof RegExp && (t.lastIndex = 0);
    for (var n = arguments.length, s = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
      s[r - 1] = arguments[r];
    return io(e, t, s);
  };
}
function Qd(e) {
  return function() {
    for (var t = arguments.length, n = new Array(t), s = 0; s < t; s++)
      n[s] = arguments[s];
    return oo(e, n);
  };
}
function Re(e, t) {
  let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : Sr;
  Ja && Ja(e, null);
  let s = t.length;
  for (; s--; ) {
    let r = t[s];
    if (typeof r == "string") {
      const i = n(r);
      i !== r && (Vd(t) || (t[s] = i), r = i);
    }
    e[r] = !0;
  }
  return e;
}
function ep(e) {
  for (let t = 0; t < e.length; t++)
    Gt(e, t) || (e[t] = null);
  return e;
}
function hn(e) {
  const t = $c(null);
  for (const [n, s] of Bc(e))
    Gt(e, n) && (Array.isArray(s) ? t[n] = ep(s) : s && typeof s == "object" && s.constructor === Object ? t[n] = hn(s) : t[n] = s);
  return t;
}
function Ns(e, t) {
  for (; e !== null; ) {
    const s = Gd(e, t);
    if (s) {
      if (s.get)
        return It(s.get);
      if (typeof s.value == "function")
        return It(s.value);
    }
    e = Kd(e);
  }
  function n() {
    return null;
  }
  return n;
}
const tl = Rt(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "section", "select", "shadow", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]), Li = Rt(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]), Oi = Rt(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]), tp = Rt(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]), Ni = Rt(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]), np = Rt(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]), nl = Rt(["#text"]), sl = Rt(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns", "slot"]), Mi = Rt(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]), rl = Rt(["accent", "accentunder", "align", "bevelled", "close", "columnsalign", "columnlines", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lspace", "lquote", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]), _r = Rt(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]), sp = Wt(/\{\{[\w\W]*|[\w\W]*\}\}/gm), rp = Wt(/<%[\w\W]*|[\w\W]*%>/gm), ip = Wt(/\$\{[\w\W]*/gm), op = Wt(/^data-[\-\w.\u00B7-\uFFFF]+$/), ap = Wt(/^aria-[\-\w]+$/), Uc = Wt(
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  // eslint-disable-line no-useless-escape
), lp = Wt(/^(?:\w+script|data):/i), cp = Wt(
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g
  // eslint-disable-line no-control-regex
), zc = Wt(/^html$/i), up = Wt(/^[a-z][.\w]*(-[.\w]+)+$/i);
var il = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ARIA_ATTR: ap,
  ATTR_WHITESPACE: cp,
  CUSTOM_ELEMENT: up,
  DATA_ATTR: op,
  DOCTYPE_NAME: zc,
  ERB_EXPR: rp,
  IS_ALLOWED_URI: Uc,
  IS_SCRIPT_OR_DATA: lp,
  MUSTACHE_EXPR: sp,
  TMPLIT_EXPR: ip
});
const Ms = {
  element: 1,
  text: 3,
  // Deprecated
  progressingInstruction: 7,
  comment: 8,
  document: 9
}, fp = function() {
  return typeof window > "u" ? null : window;
}, hp = function(t, n) {
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
}, ol = function() {
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
function Hc() {
  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : fp();
  const t = (ee) => Hc(ee);
  if (t.version = "3.2.6", t.removed = [], !e || !e.document || e.document.nodeType !== Ms.document || !e.Element)
    return t.isSupported = !1, t;
  let {
    document: n
  } = e;
  const s = n, r = s.currentScript, {
    DocumentFragment: i,
    HTMLTemplateElement: o,
    Node: a,
    Element: l,
    NodeFilter: d,
    NamedNodeMap: c = e.NamedNodeMap || e.MozNamedAttrMap,
    HTMLFormElement: b,
    DOMParser: w,
    trustedTypes: D
  } = e, L = l.prototype, W = Ns(L, "cloneNode"), F = Ns(L, "remove"), se = Ns(L, "nextSibling"), ie = Ns(L, "childNodes"), oe = Ns(L, "parentNode");
  if (typeof o == "function") {
    const ee = n.createElement("template");
    ee.content && ee.content.ownerDocument && (n = ee.content.ownerDocument);
  }
  let T, O = "";
  const {
    implementation: V,
    createNodeIterator: K,
    createDocumentFragment: xe,
    getElementsByTagName: ze
  } = n, {
    importNode: Ke
  } = s;
  let Ae = ol();
  t.isSupported = typeof Bc == "function" && typeof oe == "function" && V && V.createHTMLDocument !== void 0;
  const {
    MUSTACHE_EXPR: me,
    ERB_EXPR: Xe,
    TMPLIT_EXPR: et,
    DATA_ATTR: st,
    ARIA_ATTR: ue,
    IS_SCRIPT_OR_DATA: de,
    ATTR_WHITESPACE: ae,
    CUSTOM_ELEMENT: rt
  } = il;
  let {
    IS_ALLOWED_URI: be
  } = il, _e = null;
  const Te = Re({}, [...tl, ...Li, ...Oi, ...Ni, ...nl]);
  let Ie = null;
  const Lt = Re({}, [...sl, ...Mi, ...rl, ..._r]);
  let Le = Object.seal($c(null, {
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
  })), it = null, ht = null, dt = !0, mt = !0, _t = !1, Ot = !0, m = !1, p = !0, x = !1, C = !1, I = !1, k = !1, H = !1, $ = !1, U = !0, P = !1;
  const G = "user-content-";
  let q = !0, j = !1, te = {}, le = null;
  const Ee = Re({}, ["annotation-xml", "audio", "colgroup", "desc", "foreignobject", "head", "iframe", "math", "mi", "mn", "mo", "ms", "mtext", "noembed", "noframes", "noscript", "plaintext", "script", "style", "svg", "template", "thead", "title", "video", "xmp"]);
  let Se = null;
  const nt = Re({}, ["audio", "video", "img", "source", "image", "track"]);
  let Oe = null;
  const Ze = Re({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), f = "http://www.w3.org/1998/Math/MathML", _ = "http://www.w3.org/2000/svg", N = "http://www.w3.org/1999/xhtml";
  let S = N, B = !1, X = null;
  const J = Re({}, [f, _, N], Ii);
  let ye = Re({}, ["mi", "mo", "mn", "ms", "mtext"]), Ne = Re({}, ["annotation-xml"]);
  const Ve = Re({}, ["title", "style", "font", "a", "script"]);
  let De = null;
  const lt = ["application/xhtml+xml", "text/html"], yt = "text/html";
  let Ge = null, qt = null;
  const nr = n.createElement("form"), sr = function(y) {
    return y instanceof RegExp || y instanceof Function;
  }, $n = function() {
    let y = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (!(qt && qt === y)) {
      if ((!y || typeof y != "object") && (y = {}), y = hn(y), De = // eslint-disable-next-line unicorn/prefer-includes
      lt.indexOf(y.PARSER_MEDIA_TYPE) === -1 ? yt : y.PARSER_MEDIA_TYPE, Ge = De === "application/xhtml+xml" ? Ii : Sr, _e = Gt(y, "ALLOWED_TAGS") ? Re({}, y.ALLOWED_TAGS, Ge) : Te, Ie = Gt(y, "ALLOWED_ATTR") ? Re({}, y.ALLOWED_ATTR, Ge) : Lt, X = Gt(y, "ALLOWED_NAMESPACES") ? Re({}, y.ALLOWED_NAMESPACES, Ii) : J, Oe = Gt(y, "ADD_URI_SAFE_ATTR") ? Re(hn(Ze), y.ADD_URI_SAFE_ATTR, Ge) : Ze, Se = Gt(y, "ADD_DATA_URI_TAGS") ? Re(hn(nt), y.ADD_DATA_URI_TAGS, Ge) : nt, le = Gt(y, "FORBID_CONTENTS") ? Re({}, y.FORBID_CONTENTS, Ge) : Ee, it = Gt(y, "FORBID_TAGS") ? Re({}, y.FORBID_TAGS, Ge) : hn({}), ht = Gt(y, "FORBID_ATTR") ? Re({}, y.FORBID_ATTR, Ge) : hn({}), te = Gt(y, "USE_PROFILES") ? y.USE_PROFILES : !1, dt = y.ALLOW_ARIA_ATTR !== !1, mt = y.ALLOW_DATA_ATTR !== !1, _t = y.ALLOW_UNKNOWN_PROTOCOLS || !1, Ot = y.ALLOW_SELF_CLOSE_IN_ATTR !== !1, m = y.SAFE_FOR_TEMPLATES || !1, p = y.SAFE_FOR_XML !== !1, x = y.WHOLE_DOCUMENT || !1, k = y.RETURN_DOM || !1, H = y.RETURN_DOM_FRAGMENT || !1, $ = y.RETURN_TRUSTED_TYPE || !1, I = y.FORCE_BODY || !1, U = y.SANITIZE_DOM !== !1, P = y.SANITIZE_NAMED_PROPS || !1, q = y.KEEP_CONTENT !== !1, j = y.IN_PLACE || !1, be = y.ALLOWED_URI_REGEXP || Uc, S = y.NAMESPACE || N, ye = y.MATHML_TEXT_INTEGRATION_POINTS || ye, Ne = y.HTML_INTEGRATION_POINTS || Ne, Le = y.CUSTOM_ELEMENT_HANDLING || {}, y.CUSTOM_ELEMENT_HANDLING && sr(y.CUSTOM_ELEMENT_HANDLING.tagNameCheck) && (Le.tagNameCheck = y.CUSTOM_ELEMENT_HANDLING.tagNameCheck), y.CUSTOM_ELEMENT_HANDLING && sr(y.CUSTOM_ELEMENT_HANDLING.attributeNameCheck) && (Le.attributeNameCheck = y.CUSTOM_ELEMENT_HANDLING.attributeNameCheck), y.CUSTOM_ELEMENT_HANDLING && typeof y.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements == "boolean" && (Le.allowCustomizedBuiltInElements = y.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements), m && (mt = !1), H && (k = !0), te && (_e = Re({}, nl), Ie = [], te.html === !0 && (Re(_e, tl), Re(Ie, sl)), te.svg === !0 && (Re(_e, Li), Re(Ie, Mi), Re(Ie, _r)), te.svgFilters === !0 && (Re(_e, Oi), Re(Ie, Mi), Re(Ie, _r)), te.mathMl === !0 && (Re(_e, Ni), Re(Ie, rl), Re(Ie, _r))), y.ADD_TAGS && (_e === Te && (_e = hn(_e)), Re(_e, y.ADD_TAGS, Ge)), y.ADD_ATTR && (Ie === Lt && (Ie = hn(Ie)), Re(Ie, y.ADD_ATTR, Ge)), y.ADD_URI_SAFE_ATTR && Re(Oe, y.ADD_URI_SAFE_ATTR, Ge), y.FORBID_CONTENTS && (le === Ee && (le = hn(le)), Re(le, y.FORBID_CONTENTS, Ge)), q && (_e["#text"] = !0), x && Re(_e, ["html", "head", "body"]), _e.table && (Re(_e, ["tbody"]), delete it.tbody), y.TRUSTED_TYPES_POLICY) {
        if (typeof y.TRUSTED_TYPES_POLICY.createHTML != "function")
          throw Os('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
        if (typeof y.TRUSTED_TYPES_POLICY.createScriptURL != "function")
          throw Os('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
        T = y.TRUSTED_TYPES_POLICY, O = T.createHTML("");
      } else
        T === void 0 && (T = hp(D, r)), T !== null && typeof O == "string" && (O = T.createHTML(""));
      Rt && Rt(y), qt = y;
    }
  }, Un = Re({}, [...Li, ...Oi, ...tp]), ms = Re({}, [...Ni, ...np]), rr = function(y) {
    let z = oe(y);
    (!z || !z.tagName) && (z = {
      namespaceURI: S,
      tagName: "template"
    });
    const Y = Sr(y.tagName), pe = Sr(z.tagName);
    return X[y.namespaceURI] ? y.namespaceURI === _ ? z.namespaceURI === N ? Y === "svg" : z.namespaceURI === f ? Y === "svg" && (pe === "annotation-xml" || ye[pe]) : !!Un[Y] : y.namespaceURI === f ? z.namespaceURI === N ? Y === "math" : z.namespaceURI === _ ? Y === "math" && Ne[pe] : !!ms[Y] : y.namespaceURI === N ? z.namespaceURI === _ && !Ne[pe] || z.namespaceURI === f && !ye[pe] ? !1 : !ms[Y] && (Ve[Y] || !Un[Y]) : !!(De === "application/xhtml+xml" && X[y.namespaceURI]) : !1;
  }, ct = function(y) {
    Is(t.removed, {
      element: y
    });
    try {
      oe(y).removeChild(y);
    } catch {
      F(y);
    }
  }, Zt = function(y, z) {
    try {
      Is(t.removed, {
        attribute: z.getAttributeNode(y),
        from: z
      });
    } catch {
      Is(t.removed, {
        attribute: null,
        from: z
      });
    }
    if (z.removeAttribute(y), y === "is")
      if (k || H)
        try {
          ct(z);
        } catch {
        }
      else
        try {
          z.setAttribute(y, "");
        } catch {
        }
  }, Jt = function(y) {
    let z = null, Y = null;
    if (I)
      y = "<remove></remove>" + y;
    else {
      const we = el(y, /^[\r\n\t ]+/);
      Y = we && we[0];
    }
    De === "application/xhtml+xml" && S === N && (y = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + y + "</body></html>");
    const pe = T ? T.createHTML(y) : y;
    if (S === N)
      try {
        z = new w().parseFromString(pe, De);
      } catch {
      }
    if (!z || !z.documentElement) {
      z = V.createDocument(S, "template", null);
      try {
        z.documentElement.innerHTML = B ? O : pe;
      } catch {
      }
    }
    const Pe = z.body || z.documentElement;
    return y && Y && Pe.insertBefore(n.createTextNode(Y), Pe.childNodes[0] || null), S === N ? ze.call(z, x ? "html" : "body")[0] : x ? z.documentElement : Pe;
  }, _s = function(y) {
    return K.call(
      y.ownerDocument || y,
      y,
      // eslint-disable-next-line no-bitwise
      d.SHOW_ELEMENT | d.SHOW_COMMENT | d.SHOW_TEXT | d.SHOW_PROCESSING_INSTRUCTION | d.SHOW_CDATA_SECTION,
      null
    );
  }, wn = function(y) {
    return y instanceof b && (typeof y.nodeName != "string" || typeof y.textContent != "string" || typeof y.removeChild != "function" || !(y.attributes instanceof c) || typeof y.removeAttribute != "function" || typeof y.setAttribute != "function" || typeof y.namespaceURI != "string" || typeof y.insertBefore != "function" || typeof y.hasChildNodes != "function");
  }, ys = function(y) {
    return typeof a == "function" && y instanceof a;
  };
  function kt(ee, y, z) {
    mr(ee, (Y) => {
      Y.call(t, y, z, qt);
    });
  }
  const ir = function(y) {
    let z = null;
    if (kt(Ae.beforeSanitizeElements, y, null), wn(y))
      return ct(y), !0;
    const Y = Ge(y.nodeName);
    if (kt(Ae.uponSanitizeElement, y, {
      tagName: Y,
      allowedTags: _e
    }), p && y.hasChildNodes() && !ys(y.firstElementChild) && Tt(/<[/\w!]/g, y.innerHTML) && Tt(/<[/\w!]/g, y.textContent) || y.nodeType === Ms.progressingInstruction || p && y.nodeType === Ms.comment && Tt(/<[/\w]/g, y.data))
      return ct(y), !0;
    if (!_e[Y] || it[Y]) {
      if (!it[Y] && vs(Y) && (Le.tagNameCheck instanceof RegExp && Tt(Le.tagNameCheck, Y) || Le.tagNameCheck instanceof Function && Le.tagNameCheck(Y)))
        return !1;
      if (q && !le[Y]) {
        const pe = oe(y) || y.parentNode, Pe = ie(y) || y.childNodes;
        if (Pe && pe) {
          const we = Pe.length;
          for (let at = we - 1; at >= 0; --at) {
            const xt = W(Pe[at], !0);
            xt.__removalCount = (y.__removalCount || 0) + 1, pe.insertBefore(xt, se(y));
          }
        }
      }
      return ct(y), !0;
    }
    return y instanceof l && !rr(y) || (Y === "noscript" || Y === "noembed" || Y === "noframes") && Tt(/<\/no(script|embed|frames)/i, y.innerHTML) ? (ct(y), !0) : (m && y.nodeType === Ms.text && (z = y.textContent, mr([me, Xe, et], (pe) => {
      z = Ls(z, pe, " ");
    }), y.textContent !== z && (Is(t.removed, {
      element: y.cloneNode()
    }), y.textContent = z)), kt(Ae.afterSanitizeElements, y, null), !1);
  }, zn = function(y, z, Y) {
    if (U && (z === "id" || z === "name") && (Y in n || Y in nr))
      return !1;
    if (!(mt && !ht[z] && Tt(st, z))) {
      if (!(dt && Tt(ue, z))) {
        if (!Ie[z] || ht[z]) {
          if (
            // First condition does a very basic check if a) it's basically a valid custom element tagname AND
            // b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
            // and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
            !(vs(y) && (Le.tagNameCheck instanceof RegExp && Tt(Le.tagNameCheck, y) || Le.tagNameCheck instanceof Function && Le.tagNameCheck(y)) && (Le.attributeNameCheck instanceof RegExp && Tt(Le.attributeNameCheck, z) || Le.attributeNameCheck instanceof Function && Le.attributeNameCheck(z)) || // Alternative, second condition checks if it's an `is`-attribute, AND
            // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
            z === "is" && Le.allowCustomizedBuiltInElements && (Le.tagNameCheck instanceof RegExp && Tt(Le.tagNameCheck, Y) || Le.tagNameCheck instanceof Function && Le.tagNameCheck(Y)))
          ) return !1;
        } else if (!Oe[z]) {
          if (!Tt(be, Ls(Y, ae, ""))) {
            if (!((z === "src" || z === "xlink:href" || z === "href") && y !== "script" && Zd(Y, "data:") === 0 && Se[y])) {
              if (!(_t && !Tt(de, Ls(Y, ae, "")))) {
                if (Y)
                  return !1;
              }
            }
          }
        }
      }
    }
    return !0;
  }, vs = function(y) {
    return y !== "annotation-xml" && el(y, rt);
  }, or = function(y) {
    kt(Ae.beforeSanitizeAttributes, y, null);
    const {
      attributes: z
    } = y;
    if (!z || wn(y))
      return;
    const Y = {
      attrName: "",
      attrValue: "",
      keepAttr: !0,
      allowedAttributes: Ie,
      forceKeepAttr: void 0
    };
    let pe = z.length;
    for (; pe--; ) {
      const Pe = z[pe], {
        name: we,
        namespaceURI: at,
        value: xt
      } = Pe, kn = Ge(we), jt = xt;
      let Fe = we === "value" ? jt : Jd(jt);
      if (Y.attrName = kn, Y.attrValue = Fe, Y.keepAttr = !0, Y.forceKeepAttr = void 0, kt(Ae.uponSanitizeAttribute, y, Y), Fe = Y.attrValue, P && (kn === "id" || kn === "name") && (Zt(we, y), Fe = G + Fe), p && Tt(/((--!?|])>)|<\/(style|title)/i, Fe)) {
        Zt(we, y);
        continue;
      }
      if (Y.forceKeepAttr)
        continue;
      if (!Y.keepAttr) {
        Zt(we, y);
        continue;
      }
      if (!Ot && Tt(/\/>/i, Fe)) {
        Zt(we, y);
        continue;
      }
      m && mr([me, Xe, et], (Qt) => {
        Fe = Ls(Fe, Qt, " ");
      });
      const xn = Ge(y.nodeName);
      if (!zn(xn, kn, Fe)) {
        Zt(we, y);
        continue;
      }
      if (T && typeof D == "object" && typeof D.getAttributeType == "function" && !at)
        switch (D.getAttributeType(xn, kn)) {
          case "TrustedHTML": {
            Fe = T.createHTML(Fe);
            break;
          }
          case "TrustedScriptURL": {
            Fe = T.createScriptURL(Fe);
            break;
          }
        }
      if (Fe !== jt)
        try {
          at ? y.setAttributeNS(at, we, Fe) : y.setAttribute(we, Fe), wn(y) ? ct(y) : Qa(t.removed);
        } catch {
          Zt(we, y);
        }
    }
    kt(Ae.afterSanitizeAttributes, y, null);
  }, ar = function ee(y) {
    let z = null;
    const Y = _s(y);
    for (kt(Ae.beforeSanitizeShadowDOM, y, null); z = Y.nextNode(); )
      kt(Ae.uponSanitizeShadowNode, z, null), ir(z), or(z), z.content instanceof i && ee(z.content);
    kt(Ae.afterSanitizeShadowDOM, y, null);
  };
  return t.sanitize = function(ee) {
    let y = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, z = null, Y = null, pe = null, Pe = null;
    if (B = !ee, B && (ee = "<!-->"), typeof ee != "string" && !ys(ee))
      if (typeof ee.toString == "function") {
        if (ee = ee.toString(), typeof ee != "string")
          throw Os("dirty is not a string, aborting");
      } else
        throw Os("toString is not a function");
    if (!t.isSupported)
      return ee;
    if (C || $n(y), t.removed = [], typeof ee == "string" && (j = !1), j) {
      if (ee.nodeName) {
        const xt = Ge(ee.nodeName);
        if (!_e[xt] || it[xt])
          throw Os("root node is forbidden and cannot be sanitized in-place");
      }
    } else if (ee instanceof a)
      z = Jt("<!---->"), Y = z.ownerDocument.importNode(ee, !0), Y.nodeType === Ms.element && Y.nodeName === "BODY" || Y.nodeName === "HTML" ? z = Y : z.appendChild(Y);
    else {
      if (!k && !m && !x && // eslint-disable-next-line unicorn/prefer-includes
      ee.indexOf("<") === -1)
        return T && $ ? T.createHTML(ee) : ee;
      if (z = Jt(ee), !z)
        return k ? null : $ ? O : "";
    }
    z && I && ct(z.firstChild);
    const we = _s(j ? ee : z);
    for (; pe = we.nextNode(); )
      ir(pe), or(pe), pe.content instanceof i && ar(pe.content);
    if (j)
      return ee;
    if (k) {
      if (H)
        for (Pe = xe.call(z.ownerDocument); z.firstChild; )
          Pe.appendChild(z.firstChild);
      else
        Pe = z;
      return (Ie.shadowroot || Ie.shadowrootmode) && (Pe = Ke.call(s, Pe, !0)), Pe;
    }
    let at = x ? z.outerHTML : z.innerHTML;
    return x && _e["!doctype"] && z.ownerDocument && z.ownerDocument.doctype && z.ownerDocument.doctype.name && Tt(zc, z.ownerDocument.doctype.name) && (at = "<!DOCTYPE " + z.ownerDocument.doctype.name + `>
` + at), m && mr([me, Xe, et], (xt) => {
      at = Ls(at, xt, " ");
    }), T && $ ? T.createHTML(at) : at;
  }, t.setConfig = function() {
    let ee = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    $n(ee), C = !0;
  }, t.clearConfig = function() {
    qt = null, C = !1;
  }, t.isValidAttribute = function(ee, y, z) {
    qt || $n({});
    const Y = Ge(ee), pe = Ge(y);
    return zn(Y, pe, z);
  }, t.addHook = function(ee, y) {
    typeof y == "function" && Is(Ae[ee], y);
  }, t.removeHook = function(ee, y) {
    if (y !== void 0) {
      const z = Yd(Ae[ee], y);
      return z === -1 ? void 0 : Xd(Ae[ee], z, 1)[0];
    }
    return Qa(Ae[ee]);
  }, t.removeHooks = function(ee) {
    Ae[ee] = [];
  }, t.removeAllHooks = function() {
    Ae = ol();
  }, t;
}
var Uo = Hc();
Uo.addHook("uponSanitizeElement", (e, t) => {
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
Uo.addHook("afterSanitizeAttributes", (e) => {
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
function dp(e) {
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
  return Uo.sanitize(e, t);
}
Ue.setOptions({
  renderer: new Ue.Renderer(),
  gfm: !0,
  breaks: !0
});
const Cr = (e) => dp(Ue(e || "")), jr = "Start a new chat", al = "Start a new chat? This ends the current one.", pp = "Start new chat", gp = "Cancel", ll = "Couldn't start a new chat. Please try again.", mp = 15e3, _p = ["aria-label"], yp = { class: "new-chat-confirm__question" }, vp = { class: "new-chat-confirm__actions" }, bp = ["disabled"], wp = ["disabled"], kp = /* @__PURE__ */ So({
  __name: "NewChatConfirm",
  props: {
    error: {},
    busy: { type: Boolean }
  },
  emits: ["confirm", "cancel"],
  setup(e, { emit: t }) {
    const n = t;
    return (s, r) => (A(), E("div", {
      class: "new-chat-confirm",
      role: "alertdialog",
      "aria-live": "polite",
      "aria-label": R(al)
    }, [
      v("p", yp, Z(s.error || R(al)), 1),
      v("div", vp, [
        v("button", {
          type: "button",
          class: "new-chat-confirm__button",
          disabled: s.busy,
          onClick: r[0] || (r[0] = (i) => n("cancel"))
        }, Z(R(gp)), 9, bp),
        v("button", {
          type: "button",
          class: "new-chat-confirm__button new-chat-confirm__button--primary",
          disabled: s.busy,
          onClick: r[1] || (r[1] = (i) => n("confirm"))
        }, Z(R(pp)), 9, wp)
      ])
    ], 8, _p));
  }
}), zo = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [s, r] of t)
    n[s] = r;
  return n;
}, Wc = /* @__PURE__ */ zo(kp, [["__scopeId", "data-v-6c78f353"]]), xp = { class: "askai" }, Tp = { class: "askai__bar" }, Ap = ["value", "placeholder", "disabled", "aria-label", "onKeydown"], Ep = ["disabled", "title", "aria-label", "aria-expanded"], Sp = { class: "askai__intro" }, Cp = { class: "askai__title" }, Rp = {
  key: 0,
  class: "askai__subtitle"
}, Ip = {
  key: 0,
  class: "askai__suggestions"
}, Lp = ["disabled", "onClick"], Op = ["aria-live"], Np = {
  key: 0,
  class: "askai__question"
}, Mp = {
  key: 1,
  class: "askai__system"
}, Pp = ["innerHTML"], Fp = {
  key: 0,
  class: "askai__sources"
}, Dp = ["title"], Bp = {
  key: 0,
  class: "askai__thinking",
  role: "status",
  "aria-live": "polite"
}, $p = { class: "askai__thinking-text" }, Up = { class: "askai__foot" }, zp = { key: 0 }, Hp = /* @__PURE__ */ So({
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
    const n = e, s = t, r = re(null), i = re(null), o = re(null), a = ["user", "bot", "agent", "system"], l = ce(
      () => n.messages.map((T, O) => ({ message: T, index: O })).filter(({ message: T }) => a.includes(T.message_type))
    ), d = ce(() => l.value.length > 0), c = (T) => {
      s("update:draft", T.target.value);
    }, b = () => {
      !n.inputEnabled || !n.draft.trim() || s("send");
    }, w = (T) => {
      n.inputEnabled && s("ask", T);
    }, D = typeof navigator < "u" && /Mac|iPod|iPhone|iPad/.test(navigator.platform || ""), L = (T) => {
      if (T.key === "Escape") {
        T.preventDefault(), s("close");
        return;
      }
      const O = D ? T.metaKey && !T.ctrlKey : T.ctrlKey && !T.metaKey;
      n.hotkey && O && !T.altKey && (T.key === "k" || T.key === "K") && (T.preventDefault(), s("close"));
    }, W = () => {
      Zn(() => {
        var T;
        return (T = r.value) == null ? void 0 : T.focus();
      });
    };
    let F = 0;
    const se = () => {
      if (!o.value) return;
      const T = o.value.closest(".askai"), O = i.value;
      if (!T || !O) return;
      const V = T.offsetHeight - O.offsetHeight, K = getComputedStyle(O), xe = parseFloat(K.paddingTop) + parseFloat(K.paddingBottom), ze = Math.ceil(V + xe + o.value.getBoundingClientRect().height);
      Math.abs(ze - F) < 3 || (F = ze, window.parent.postMessage({ type: "WIDGET_RESIZE", height: ze }, "*"));
    };
    let ie = null;
    const oe = ce(
      () => l.value.reduce((T, { message: O, index: V }) => T + n.displayText(V, O.message || "").length, 0)
    );
    return Pt(
      () => [l.value.length, oe.value, n.loading],
      () => Zn(() => {
        i.value && (i.value.scrollTop = i.value.scrollHeight);
      })
    ), Pt(() => n.newChatArmed, () => Zn(() => se())), Pt(() => n.active, (T) => {
      T && W();
    }), ti(() => {
      n.active && W(), window.addEventListener("keydown", L), o.value && typeof ResizeObserver < "u" && (ie = new ResizeObserver(() => se()), ie.observe(o.value)), se();
    }), nc(() => {
      window.removeEventListener("keydown", L), ie == null || ie.disconnect(), ie = null;
    }), (T, O) => (A(), E("div", xp, [
      v("div", Tp, [
        O[6] || (O[6] = v("svg", {
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
          value: T.draft,
          placeholder: T.placeholder,
          disabled: !T.inputEnabled,
          "aria-label": T.placeholder,
          autocomplete: "off",
          spellcheck: "false",
          onInput: c,
          onKeydown: Ar(Yn(b, ["prevent"]), ["enter"])
        }, null, 40, Ap),
        T.canStartNewChat ? (A(), E("button", {
          key: 0,
          type: "button",
          class: Be(["askai__new", { "askai__new--armed": T.newChatArmed }]),
          disabled: T.startingNewChat,
          title: R(jr),
          "aria-label": R(jr),
          "aria-expanded": T.newChatArmed,
          onClick: O[0] || (O[0] = (V) => s("newChat"))
        }, O[4] || (O[4] = [
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
        ]), 10, Ep)) : ne("", !0),
        v("button", {
          type: "button",
          class: "askai__close",
          "aria-label": "Close",
          title: "Close (Esc)",
          onClick: O[1] || (O[1] = (V) => s("close"))
        }, O[5] || (O[5] = [
          v("span", { class: "askai__kbd" }, "Esc", -1)
        ]))
      ]),
      T.newChatArmed && T.canStartNewChat ? (A(), $r(Wc, {
        key: 0,
        busy: T.startingNewChat,
        error: T.newChatError,
        onConfirm: O[2] || (O[2] = (V) => s("confirmNewChat")),
        onCancel: O[3] || (O[3] = (V) => s("cancelNewChat"))
      }, null, 8, ["busy", "error"])) : ne("", !0),
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
          d.value ? (A(), E($e, { key: 1 }, [
            (A(!0), E($e, null, pt(l.value, ({ message: V, index: K }) => (A(), E("div", {
              key: K,
              class: "askai__turn",
              "aria-live": T.isStreaming(K) ? "off" : "polite"
            }, [
              V.message_type === "user" ? (A(), E("p", Np, Z(V.message), 1)) : V.message_type === "system" ? (A(), E("p", Mp, Z(V.message), 1)) : (A(), E($e, { key: 2 }, [
                v("div", {
                  class: Be(["askai__answer", { "askai__answer--streaming": T.isStreaming(K) }]),
                  innerHTML: R(Cr)(T.isStreaming(K) ? T.displayText(K, V.message || "") : V.message || "")
                }, null, 10, Pp),
                T.showCitations && !T.isStreaming(K) && V.sources && V.sources.length ? (A(), E("div", Fp, [
                  O[9] || (O[9] = v("span", { class: "askai__label" }, "Sources", -1)),
                  (A(!0), E($e, null, pt(V.sources, (xe, ze) => (A(), E("span", {
                    key: ze,
                    class: "askai__source",
                    title: T.citationTooltip(xe)
                  }, Z(T.citationLabel(xe)), 9, Dp))), 128))
                ])) : ne("", !0)
              ], 64))
            ], 8, Op))), 128)),
            T.loading ? (A(), E("div", Bp, [
              O[10] || (O[10] = v("span", { class: "askai__dot" }, null, -1)),
              O[11] || (O[11] = v("span", { class: "askai__dot" }, null, -1)),
              O[12] || (O[12] = v("span", { class: "askai__dot" }, null, -1)),
              v("span", $p, Z(T.showCitations ? "Searching the knowledge base" : "Thinking"), 1)
            ])) : ne("", !0)
          ], 64)) : (A(), E($e, { key: 0 }, [
            v("div", Sp, [
              v("h2", Cp, Z(T.welcomeTitle || `Ask ${T.agentName}`), 1),
              T.welcomeSubtitle ? (A(), E("p", Rp, Z(T.welcomeSubtitle), 1)) : ne("", !0)
            ]),
            T.suggestions.length && !T.draft.trim() ? (A(), E("div", Ip, [
              O[8] || (O[8] = v("p", { class: "askai__label" }, "Suggested", -1)),
              (A(!0), E($e, null, pt(T.suggestions, (V) => (A(), E("button", {
                key: V,
                type: "button",
                class: "askai__suggestion",
                disabled: !T.inputEnabled,
                onClick: (K) => w(V)
              }, [
                v("span", null, Z(V), 1),
                O[7] || (O[7] = v("svg", {
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
              ], 8, Lp))), 128))
            ])) : ne("", !0)
          ], 64))
        ], 512)
      ], 512),
      v("div", Up, [
        T.disclaimer ? (A(), E("span", zp, Z(T.disclaimer), 1)) : ne("", !0),
        O[13] || (O[13] = v("a", {
          class: "askai__brand",
          href: "https://chattermate.chat",
          target: "_blank",
          rel: "noopener noreferrer"
        }, "Powered by ChatterMate", -1))
      ])
    ]));
  }
}), Wp = /* @__PURE__ */ zo(Hp, [["__scopeId", "data-v-2f36cd0a"]]), Ds = [
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
], qp = (e) => (e || "").split("").reduce((t, n) => t + n.charCodeAt(0), 0) % Ds.length, jp = (e) => {
  const t = Ds[(e % Ds.length + Ds.length) % Ds.length];
  return {
    background: `
            radial-gradient(circle at 32% 28%, rgba(255,255,255,0.22) 0%, transparent 42%),
            radial-gradient(circle at 68% 72%, rgba(0,0,0,0.25) 0%, transparent 38%),
            radial-gradient(ellipse at 50% 50%, ${t.stops})
        `.trim(),
    boxShadow: `0 4px 28px ${t.glow}, inset 0 1px 0 rgba(255,255,255,0.15)`,
    borderRadius: "50%"
  };
}, Vp = (e, t) => {
  const n = typeof t == "number" && Number.isFinite(t) ? t : qp(e);
  return jp(n);
}, cl = (e) => {
  var t;
  return !!((t = e == null ? void 0 : e.attributes) != null && t.end_chat);
}, ul = "AI can make mistakes. Check important info.";
function Kp(e, t = !1) {
  return e !== !1 && !t;
}
const Pi = {
  ai: "Online · replies instantly",
  human: "Online · usually replies in a few minutes",
  away: "Away · we'll reply when we're back"
};
function Gp(e, t = !1) {
  return (t ? "human" : (e == null ? void 0 : e.mode) ?? "ai") === "ai" ? { text: Pi.ai, online: !0 } : (e == null ? void 0 : e.available) !== !1 ? { text: Pi.human, online: !0 } : { text: Pi.away, online: !1 };
}
const qc = (e) => !!e && (/^https?:\/\//i.test(e) || e.startsWith("data:")), Yp = (e, t) => e ? qc(e) || e.startsWith("blob:") ? e : `${t.replace(/\/api\/v1\/?$/, "")}${e.startsWith("/") ? "" : "/"}${e}` : "";
function fl() {
  return typeof window < "u" && window.APP_CONFIG ? window.APP_CONFIG : {};
}
const ps = {
  get API_URL() {
    return fl().API_URL || "https://api.chattermate.chat/api/v1";
  },
  get WS_URL() {
    return fl().WS_URL || "wss://api.chattermate.chat";
  }
};
function Vr(e) {
  return Yp(e, ps.API_URL);
}
function Xp(e) {
  const t = ce(() => ({
    backgroundColor: "var(--cm-card)",
    color: "var(--cm-text)"
  })), n = ce(() => ({
    backgroundColor: e.value.chat_bubble_color || "#C9F24E",
    color: fs(e.value.chat_bubble_color || "#C9F24E") ? "#FFFFFF" : "#000000"
  })), s = ce(() => ({
    backgroundColor: "var(--cm-agent-bg)",
    color: "var(--cm-text)"
  })), r = ce(() => ({
    backgroundColor: "var(--cm-accent)",
    color: "var(--cm-on-accent)"
  })), i = ce(() => ({
    color: "var(--cm-text)"
  })), o = ce(() => ({
    borderBottom: "1px solid var(--cm-hairline)"
  })), a = ce(() => Vr(e.value.photo_url)), l = ce(() => {
    const d = e.value.chat_background_color || "#ffffff";
    return {
      boxShadow: `0 8px 5px ${fs(d) ? "rgba(0, 0, 0, 0.24)" : "rgba(0, 0, 0, 0.12)"}`
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
const Zp = /* @__PURE__ */ new Set(["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]), Jp = /* @__PURE__ */ new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);
[...Zp, ...Jp];
function Qp(e, t) {
  const n = re([]), s = re(!1), r = re(null), i = (O) => {
    if (O === 0) return "0 Bytes";
    const V = 1024, K = ["Bytes", "KB", "MB", "GB"], xe = Math.floor(Math.log(O) / Math.log(V));
    return parseFloat((O / Math.pow(V, xe)).toFixed(2)) + " " + K[xe];
  }, o = (O) => O.startsWith("image/"), a = (O) => O ? Vr(O) : "", l = (O) => {
    const V = O.file_url || O.url;
    return V ? Vr(V) : "";
  }, d = async (O) => {
    const V = O.target;
    V.files && V.files.length > 0 && (await W(Array.from(V.files)), V.value = "");
  }, c = async (O) => {
    var K;
    O.preventDefault();
    const V = (K = O.dataTransfer) == null ? void 0 : K.files;
    V && V.length > 0 && await W(Array.from(V));
  }, b = (O) => {
    O.preventDefault();
  }, w = (O) => {
    O.preventDefault();
  }, D = async (O) => {
    var xe;
    const V = (xe = O.clipboardData) == null ? void 0 : xe.items;
    if (!V) return;
    const K = [];
    for (const ze of Array.from(V))
      if (ze.kind === "file") {
        const Ke = ze.getAsFile();
        Ke && K.push(Ke);
      }
    K.length > 0 && await W(K);
  }, L = async (O, V = 500) => new Promise((K, xe) => {
    const ze = new FileReader();
    ze.onload = (Ke) => {
      var me;
      const Ae = new Image();
      Ae.onload = () => {
        const Xe = document.createElement("canvas");
        let et = Ae.width, st = Ae.height;
        const ue = 1920;
        (et > ue || st > ue) && (et > st ? (st = st / et * ue, et = ue) : (et = et / st * ue, st = ue)), Xe.width = et, Xe.height = st;
        const de = Xe.getContext("2d");
        if (!de) {
          xe(new Error("Failed to get canvas context"));
          return;
        }
        de.drawImage(Ae, 0, 0, et, st);
        let ae = 0.9;
        const rt = () => {
          Xe.toBlob((be) => {
            if (!be) {
              xe(new Error("Failed to compress image"));
              return;
            }
            if (be.size / 1024 > V && ae > 0.3)
              ae -= 0.1, rt();
            else {
              const Te = new FileReader();
              Te.onload = () => {
                const Ie = Te.result.split(",")[1];
                K({ blob: be, base64: Ie });
              }, Te.readAsDataURL(be);
            }
          }, O.type === "image/png" ? "image/png" : "image/jpeg", ae);
        };
        rt();
      }, Ae.onerror = () => xe(new Error("Failed to load image")), Ae.src = (me = Ke.target) == null ? void 0 : me.result;
    }, ze.onerror = () => xe(new Error("Failed to read file")), ze.readAsDataURL(O);
  }), W = async (O) => {
    if (n.value.length >= 3) {
      alert("Maximum 3 files allowed per message");
      return;
    }
    const Ke = 3 - n.value.length, Ae = O.slice(0, Ke);
    O.length > Ke && alert(`Only ${Ke} more file(s) can be uploaded. Maximum 3 files per message.`);
    for (const me of Ae)
      try {
        if (n.value.some((ue) => ue.filename === me.name)) {
          console.warn(`File ${me.name} is already selected`), alert(`File "${me.name}" is already selected`);
          continue;
        }
        const et = me.type.startsWith("image/"), st = et ? 5242880 : 10485760;
        if (me.size > st) {
          const ue = st / 1048576;
          console.error(`File ${me.name} is too large. Maximum size is ${ue}MB`), alert(`File "${me.name}" is too large. Maximum size for ${et ? "images" : "documents"} is ${ue}MB`);
          continue;
        }
        if (et)
          try {
            const { blob: ue, base64: de } = await L(me, 500), ae = ue.size;
            console.log(`Compressed ${me.name}: ${(me.size / 1024).toFixed(2)}KB → ${(ae / 1024).toFixed(2)}KB`), n.value.push({
              content: de,
              filename: me.name,
              type: me.type,
              size: ae,
              url: URL.createObjectURL(ue),
              file_url: URL.createObjectURL(ue)
            });
          } catch (ue) {
            console.error("Image compression failed, uploading original:", ue);
            const de = new FileReader();
            de.onload = (ae) => {
              var _e;
              const be = ((_e = ae.target) == null ? void 0 : _e.result).split(",")[1];
              n.value.push({
                content: be,
                filename: me.name,
                type: me.type,
                size: me.size,
                url: URL.createObjectURL(me),
                file_url: URL.createObjectURL(me)
              });
            }, de.readAsDataURL(me);
          }
        else {
          const ue = new FileReader();
          ue.onload = (de) => {
            var be;
            const rt = ((be = de.target) == null ? void 0 : be.result).split(",")[1];
            n.value.push({
              content: rt,
              filename: me.name,
              type: me.type || "application/octet-stream",
              size: me.size,
              url: "",
              file_url: ""
            });
          }, ue.readAsDataURL(me);
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
    handleFileSelect: d,
    handleDrop: c,
    handleDragOver: b,
    handleDragLeave: w,
    handlePaste: D,
    uploadFiles: W,
    removeAttachment: async (O) => {
      const V = n.value[O];
      if (V) {
        try {
          let K = V.url;
          if (K.startsWith("/uploads/") ? K = K.substring(9) : K.startsWith("/") && (K = K.substring(1)), qc(K))
            try {
              K = new URL(K).pathname.replace(/^\/+/, "");
            } catch {
            }
          const xe = {};
          e.value && (xe.Authorization = `Bearer ${e.value}`);
          const ze = await fetch(`${ps.API_URL}/files/upload/${K}`, {
            method: "DELETE",
            headers: xe
          });
          if (ze.ok)
            console.log("File deleted successfully from backend.");
          else {
            const Ke = await ze.json();
            console.error("Failed to delete file:", Ke.detail);
          }
        } catch (K) {
          console.error("Error calling delete API:", K);
        }
        V.url && V.url.startsWith("blob:") && URL.revokeObjectURL(V.url), V.file_url && V.file_url.startsWith("blob:") && URL.revokeObjectURL(V.file_url), n.value.splice(O, 1);
      }
    },
    openPreview: (O) => {
      r.value = O, s.value = !0;
    },
    closePreview: () => {
      s.value = !1, setTimeout(() => {
        r.value = null;
      }, 300);
    },
    openFilePicker: () => {
      var O;
      (O = t.value) == null || O.click();
    },
    isImage: (O) => O.startsWith("image/")
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
const Rr = /* @__PURE__ */ Object.create(null);
Object.keys(cn).forEach((e) => {
  Rr[cn[e]] = e;
});
const ao = { type: "error", data: "parser error" }, jc = typeof Blob == "function" || typeof Blob < "u" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]", Vc = typeof ArrayBuffer == "function", Kc = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e && e.buffer instanceof ArrayBuffer, Ho = ({ type: e, data: t }, n, s) => jc && t instanceof Blob ? n ? s(t) : hl(t, s) : Vc && (t instanceof ArrayBuffer || Kc(t)) ? n ? s(t) : hl(new Blob([t]), s) : s(cn[e] + (t || "")), hl = (e, t) => {
  const n = new FileReader();
  return n.onload = function() {
    const s = n.result.split(",")[1];
    t("b" + (s || ""));
  }, n.readAsDataURL(e);
};
function dl(e) {
  return e instanceof Uint8Array ? e : e instanceof ArrayBuffer ? new Uint8Array(e) : new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
}
let Fi;
function eg(e, t) {
  if (jc && e.data instanceof Blob)
    return e.data.arrayBuffer().then(dl).then(t);
  if (Vc && (e.data instanceof ArrayBuffer || Kc(e.data)))
    return t(dl(e.data));
  Ho(e, !1, (n) => {
    Fi || (Fi = new TextEncoder()), t(Fi.encode(n));
  });
}
const pl = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", Bs = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (let e = 0; e < pl.length; e++)
  Bs[pl.charCodeAt(e)] = e;
const tg = (e) => {
  let t = e.length * 0.75, n = e.length, s, r = 0, i, o, a, l;
  e[e.length - 1] === "=" && (t--, e[e.length - 2] === "=" && t--);
  const d = new ArrayBuffer(t), c = new Uint8Array(d);
  for (s = 0; s < n; s += 4)
    i = Bs[e.charCodeAt(s)], o = Bs[e.charCodeAt(s + 1)], a = Bs[e.charCodeAt(s + 2)], l = Bs[e.charCodeAt(s + 3)], c[r++] = i << 2 | o >> 4, c[r++] = (o & 15) << 4 | a >> 2, c[r++] = (a & 3) << 6 | l & 63;
  return d;
}, ng = typeof ArrayBuffer == "function", Wo = (e, t) => {
  if (typeof e != "string")
    return {
      type: "message",
      data: Gc(e, t)
    };
  const n = e.charAt(0);
  return n === "b" ? {
    type: "message",
    data: sg(e.substring(1), t)
  } : Rr[n] ? e.length > 1 ? {
    type: Rr[n],
    data: e.substring(1)
  } : {
    type: Rr[n]
  } : ao;
}, sg = (e, t) => {
  if (ng) {
    const n = tg(e);
    return Gc(n, t);
  } else
    return { base64: !0, data: e };
}, Gc = (e, t) => {
  switch (t) {
    case "blob":
      return e instanceof Blob ? e : new Blob([e]);
    case "arraybuffer":
    default:
      return e instanceof ArrayBuffer ? e : e.buffer;
  }
}, Yc = "", rg = (e, t) => {
  const n = e.length, s = new Array(n);
  let r = 0;
  e.forEach((i, o) => {
    Ho(i, !1, (a) => {
      s[o] = a, ++r === n && t(s.join(Yc));
    });
  });
}, ig = (e, t) => {
  const n = e.split(Yc), s = [];
  for (let r = 0; r < n.length; r++) {
    const i = Wo(n[r], t);
    if (s.push(i), i.type === "error")
      break;
  }
  return s;
};
function og() {
  return new TransformStream({
    transform(e, t) {
      eg(e, (n) => {
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
let Di;
function yr(e) {
  return e.reduce((t, n) => t + n.length, 0);
}
function vr(e, t) {
  if (e[0].length === t)
    return e.shift();
  const n = new Uint8Array(t);
  let s = 0;
  for (let r = 0; r < t; r++)
    n[r] = e[0][s++], s === e[0].length && (e.shift(), s = 0);
  return e.length && s < e[0].length && (e[0] = e[0].slice(s)), n;
}
function ag(e, t) {
  Di || (Di = new TextDecoder());
  const n = [];
  let s = 0, r = -1, i = !1;
  return new TransformStream({
    transform(o, a) {
      for (n.push(o); ; ) {
        if (s === 0) {
          if (yr(n) < 1)
            break;
          const l = vr(n, 1);
          i = (l[0] & 128) === 128, r = l[0] & 127, r < 126 ? s = 3 : r === 126 ? s = 1 : s = 2;
        } else if (s === 1) {
          if (yr(n) < 2)
            break;
          const l = vr(n, 2);
          r = new DataView(l.buffer, l.byteOffset, l.length).getUint16(0), s = 3;
        } else if (s === 2) {
          if (yr(n) < 8)
            break;
          const l = vr(n, 8), d = new DataView(l.buffer, l.byteOffset, l.length), c = d.getUint32(0);
          if (c > Math.pow(2, 21) - 1) {
            a.enqueue(ao);
            break;
          }
          r = c * Math.pow(2, 32) + d.getUint32(4), s = 3;
        } else {
          if (yr(n) < r)
            break;
          const l = vr(n, r);
          a.enqueue(Wo(i ? l : Di.decode(l), t)), s = 0;
        }
        if (r === 0 || r > e) {
          a.enqueue(ao);
          break;
        }
      }
    }
  });
}
const Xc = 4;
function ut(e) {
  if (e) return lg(e);
}
function lg(e) {
  for (var t in ut.prototype)
    e[t] = ut.prototype[t];
  return e;
}
ut.prototype.on = ut.prototype.addEventListener = function(e, t) {
  return this._callbacks = this._callbacks || {}, (this._callbacks["$" + e] = this._callbacks["$" + e] || []).push(t), this;
};
ut.prototype.once = function(e, t) {
  function n() {
    this.off(e, n), t.apply(this, arguments);
  }
  return n.fn = t, this.on(e, n), this;
};
ut.prototype.off = ut.prototype.removeListener = ut.prototype.removeAllListeners = ut.prototype.removeEventListener = function(e, t) {
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
ut.prototype.emit = function(e) {
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
ut.prototype.emitReserved = ut.prototype.emit;
ut.prototype.listeners = function(e) {
  return this._callbacks = this._callbacks || {}, this._callbacks["$" + e] || [];
};
ut.prototype.hasListeners = function(e) {
  return !!this.listeners(e).length;
};
const ai = typeof Promise == "function" && typeof Promise.resolve == "function" ? (t) => Promise.resolve().then(t) : (t, n) => n(t, 0), $t = typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")(), cg = "arraybuffer";
function Zc(e, ...t) {
  return t.reduce((n, s) => (e.hasOwnProperty(s) && (n[s] = e[s]), n), {});
}
const ug = $t.setTimeout, fg = $t.clearTimeout;
function li(e, t) {
  t.useNativeTimers ? (e.setTimeoutFn = ug.bind($t), e.clearTimeoutFn = fg.bind($t)) : (e.setTimeoutFn = $t.setTimeout.bind($t), e.clearTimeoutFn = $t.clearTimeout.bind($t));
}
const hg = 1.33;
function dg(e) {
  return typeof e == "string" ? pg(e) : Math.ceil((e.byteLength || e.size) * hg);
}
function pg(e) {
  let t = 0, n = 0;
  for (let s = 0, r = e.length; s < r; s++)
    t = e.charCodeAt(s), t < 128 ? n += 1 : t < 2048 ? n += 2 : t < 55296 || t >= 57344 ? n += 3 : (s++, n += 4);
  return n;
}
function Jc() {
  return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
}
function gg(e) {
  let t = "";
  for (let n in e)
    e.hasOwnProperty(n) && (t.length && (t += "&"), t += encodeURIComponent(n) + "=" + encodeURIComponent(e[n]));
  return t;
}
function mg(e) {
  let t = {}, n = e.split("&");
  for (let s = 0, r = n.length; s < r; s++) {
    let i = n[s].split("=");
    t[decodeURIComponent(i[0])] = decodeURIComponent(i[1]);
  }
  return t;
}
class _g extends Error {
  constructor(t, n, s) {
    super(t), this.description = n, this.context = s, this.type = "TransportError";
  }
}
class qo extends ut {
  /**
   * Transport abstract constructor.
   *
   * @param {Object} opts - options
   * @protected
   */
  constructor(t) {
    super(), this.writable = !1, li(this, t), this.opts = t, this.query = t.query, this.socket = t.socket, this.supportsBinary = !t.forceBase64;
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
    return super.emitReserved("error", new _g(t, n, s)), this;
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
    const n = Wo(t, this.socket.binaryType);
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
    const n = gg(t);
    return n.length ? "?" + n : "";
  }
}
class yg extends qo {
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
    ig(t, this.socket.binaryType).forEach(n), this.readyState !== "closed" && (this._polling = !1, this.emitReserved("pollComplete"), this.readyState === "open" && this._poll());
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
    this.writable = !1, rg(t, (n) => {
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
    return this.opts.timestampRequests !== !1 && (n[this.opts.timestampParam] = Jc()), !this.supportsBinary && !n.sid && (n.b64 = 1), this.createUri(t, n);
  }
}
let Qc = !1;
try {
  Qc = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest();
} catch {
}
const vg = Qc;
function bg() {
}
class wg extends yg {
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
class an extends ut {
  /**
   * Request constructor
   *
   * @param {Object} options
   * @package
   */
  constructor(t, n, s) {
    super(), this.createRequest = t, li(this, s), this._opts = s, this._method = s.method || "GET", this._uri = n, this._data = s.data !== void 0 ? s.data : null, this._create();
  }
  /**
   * Creates the XHR object and sends the request.
   *
   * @private
   */
  _create() {
    var t;
    const n = Zc(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
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
    typeof document < "u" && (this._index = an.requestsCount++, an.requests[this._index] = this);
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
      if (this._xhr.onreadystatechange = bg, t)
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
an.requestsCount = 0;
an.requests = {};
if (typeof document < "u") {
  if (typeof attachEvent == "function")
    attachEvent("onunload", gl);
  else if (typeof addEventListener == "function") {
    const e = "onpagehide" in $t ? "pagehide" : "unload";
    addEventListener(e, gl, !1);
  }
}
function gl() {
  for (let e in an.requests)
    an.requests.hasOwnProperty(e) && an.requests[e].abort();
}
const kg = function() {
  const e = eu({
    xdomain: !1
  });
  return e && e.responseType !== null;
}();
class xg extends wg {
  constructor(t) {
    super(t);
    const n = t && t.forceBase64;
    this.supportsBinary = kg && !n;
  }
  request(t = {}) {
    return Object.assign(t, { xd: this.xd }, this.opts), new an(eu, this.uri(), t);
  }
}
function eu(e) {
  const t = e.xdomain;
  try {
    if (typeof XMLHttpRequest < "u" && (!t || vg))
      return new XMLHttpRequest();
  } catch {
  }
  if (!t)
    try {
      return new $t[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
    } catch {
    }
}
const tu = typeof navigator < "u" && typeof navigator.product == "string" && navigator.product.toLowerCase() === "reactnative";
class Tg extends qo {
  get name() {
    return "websocket";
  }
  doOpen() {
    const t = this.uri(), n = this.opts.protocols, s = tu ? {} : Zc(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
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
      Ho(s, this.supportsBinary, (i) => {
        try {
          this.doWrite(s, i);
        } catch {
        }
        r && ai(() => {
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
    return this.opts.timestampRequests && (n[this.opts.timestampParam] = Jc()), this.supportsBinary || (n.b64 = 1), this.createUri(t, n);
  }
}
const Bi = $t.WebSocket || $t.MozWebSocket;
class Ag extends Tg {
  createSocket(t, n, s) {
    return tu ? new Bi(t, n, s) : n ? new Bi(t, n) : new Bi(t);
  }
  doWrite(t, n) {
    this.ws.send(n);
  }
}
class Eg extends qo {
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
        const n = ag(Number.MAX_SAFE_INTEGER, this.socket.binaryType), s = t.readable.pipeThrough(n).getReader(), r = og();
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
        r && ai(() => {
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
const Sg = {
  websocket: Ag,
  webtransport: Eg,
  polling: xg
}, Cg = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/, Rg = [
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
function lo(e) {
  if (e.length > 8e3)
    throw "URI too long";
  const t = e, n = e.indexOf("["), s = e.indexOf("]");
  n != -1 && s != -1 && (e = e.substring(0, n) + e.substring(n, s).replace(/:/g, ";") + e.substring(s, e.length));
  let r = Cg.exec(e || ""), i = {}, o = 14;
  for (; o--; )
    i[Rg[o]] = r[o] || "";
  return n != -1 && s != -1 && (i.source = t, i.host = i.host.substring(1, i.host.length - 1).replace(/;/g, ":"), i.authority = i.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), i.ipv6uri = !0), i.pathNames = Ig(i, i.path), i.queryKey = Lg(i, i.query), i;
}
function Ig(e, t) {
  const n = /\/{2,9}/g, s = t.replace(n, "/").split("/");
  return (t.slice(0, 1) == "/" || t.length === 0) && s.splice(0, 1), t.slice(-1) == "/" && s.splice(s.length - 1, 1), s;
}
function Lg(e, t) {
  const n = {};
  return t.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function(s, r, i) {
    r && (n[r] = i);
  }), n;
}
const co = typeof addEventListener == "function" && typeof removeEventListener == "function", Ir = [];
co && addEventListener("offline", () => {
  Ir.forEach((e) => e());
}, !1);
class Nn extends ut {
  /**
   * Socket constructor.
   *
   * @param {String|Object} uri - uri or options
   * @param {Object} opts - options
   */
  constructor(t, n) {
    if (super(), this.binaryType = cg, this.writeBuffer = [], this._prevBufferLen = 0, this._pingInterval = -1, this._pingTimeout = -1, this._maxPayload = -1, this._pingTimeoutTime = 1 / 0, t && typeof t == "object" && (n = t, t = null), t) {
      const s = lo(t);
      n.hostname = s.host, n.secure = s.protocol === "https" || s.protocol === "wss", n.port = s.port, s.query && (n.query = s.query);
    } else n.host && (n.hostname = lo(n.host).host);
    li(this, n), this.secure = n.secure != null ? n.secure : typeof location < "u" && location.protocol === "https:", n.hostname && !n.port && (n.port = this.secure ? "443" : "80"), this.hostname = n.hostname || (typeof location < "u" ? location.hostname : "localhost"), this.port = n.port || (typeof location < "u" && location.port ? location.port : this.secure ? "443" : "80"), this.transports = [], this._transportsByName = {}, n.transports.forEach((s) => {
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
    }, n), this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : ""), typeof this.opts.query == "string" && (this.opts.query = mg(this.opts.query)), co && (this.opts.closeOnBeforeunload && (this._beforeunloadEventListener = () => {
      this.transport && (this.transport.removeAllListeners(), this.transport.close());
    }, addEventListener("beforeunload", this._beforeunloadEventListener, !1)), this.hostname !== "localhost" && (this._offlineEventListener = () => {
      this._onClose("transport close", {
        description: "network connection lost"
      });
    }, Ir.push(this._offlineEventListener))), this.opts.withCredentials && (this._cookieJar = void 0), this._open();
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
    n.EIO = Xc, n.transport = t, this.id && (n.sid = this.id);
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
    const t = this.opts.rememberUpgrade && Nn.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1 ? "websocket" : this.transports[0];
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
    this.readyState = "open", Nn.priorWebsocketSuccess = this.transport.name === "websocket", this.emitReserved("open"), this.flush();
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
      if (r && (n += dg(r)), s > 0 && n > this._maxPayload)
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
    return t && (this._pingTimeoutTime = 0, ai(() => {
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
    if (Nn.priorWebsocketSuccess = !1, this.opts.tryAllTransports && this.transports.length > 1 && this.readyState === "opening")
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
      if (this.clearTimeoutFn(this._pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), co && (this._beforeunloadEventListener && removeEventListener("beforeunload", this._beforeunloadEventListener, !1), this._offlineEventListener)) {
        const s = Ir.indexOf(this._offlineEventListener);
        s !== -1 && Ir.splice(s, 1);
      }
      this.readyState = "closed", this.id = null, this.emitReserved("close", t, n), this.writeBuffer = [], this._prevBufferLen = 0;
    }
  }
}
Nn.protocol = Xc;
class Og extends Nn {
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
    Nn.priorWebsocketSuccess = !1;
    const r = () => {
      s || (n.send([{ type: "ping", data: "probe" }]), n.once("packet", (b) => {
        if (!s)
          if (b.type === "pong" && b.data === "probe") {
            if (this.upgrading = !0, this.emitReserved("upgrading", n), !n)
              return;
            Nn.priorWebsocketSuccess = n.name === "websocket", this.transport.pause(() => {
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
    function d(b) {
      n && b.name !== n.name && i();
    }
    const c = () => {
      n.removeListener("open", r), n.removeListener("error", o), n.removeListener("close", a), this.off("close", l), this.off("upgrading", d);
    };
    n.once("open", r), n.once("error", o), n.once("close", a), this.once("close", l), this.once("upgrading", d), this._upgrades.indexOf("webtransport") !== -1 && t !== "webtransport" ? this.setTimeoutFn(() => {
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
let Ng = class extends Og {
  constructor(t, n = {}) {
    const s = typeof t == "object" ? t : n;
    (!s.transports || s.transports && typeof s.transports[0] == "string") && (s.transports = (s.transports || ["polling", "websocket", "webtransport"]).map((r) => Sg[r]).filter((r) => !!r)), super(t, s);
  }
};
function Mg(e, t = "", n) {
  let s = e;
  n = n || typeof location < "u" && location, e == null && (e = n.protocol + "//" + n.host), typeof e == "string" && (e.charAt(0) === "/" && (e.charAt(1) === "/" ? e = n.protocol + e : e = n.host + e), /^(https?|wss?):\/\//.test(e) || (typeof n < "u" ? e = n.protocol + "//" + e : e = "https://" + e), s = lo(e)), s.port || (/^(http|ws)$/.test(s.protocol) ? s.port = "80" : /^(http|ws)s$/.test(s.protocol) && (s.port = "443")), s.path = s.path || "/";
  const i = s.host.indexOf(":") !== -1 ? "[" + s.host + "]" : s.host;
  return s.id = s.protocol + "://" + i + ":" + s.port + t, s.href = s.protocol + "://" + i + (n && n.port === s.port ? "" : ":" + s.port), s;
}
const Pg = typeof ArrayBuffer == "function", Fg = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e.buffer instanceof ArrayBuffer, nu = Object.prototype.toString, Dg = typeof Blob == "function" || typeof Blob < "u" && nu.call(Blob) === "[object BlobConstructor]", Bg = typeof File == "function" || typeof File < "u" && nu.call(File) === "[object FileConstructor]";
function jo(e) {
  return Pg && (e instanceof ArrayBuffer || Fg(e)) || Dg && e instanceof Blob || Bg && e instanceof File;
}
function Lr(e, t) {
  if (!e || typeof e != "object")
    return !1;
  if (Array.isArray(e)) {
    for (let n = 0, s = e.length; n < s; n++)
      if (Lr(e[n]))
        return !0;
    return !1;
  }
  if (jo(e))
    return !0;
  if (e.toJSON && typeof e.toJSON == "function" && arguments.length === 1)
    return Lr(e.toJSON(), !0);
  for (const n in e)
    if (Object.prototype.hasOwnProperty.call(e, n) && Lr(e[n]))
      return !0;
  return !1;
}
function $g(e) {
  const t = [], n = e.data, s = e;
  return s.data = uo(n, t), s.attachments = t.length, { packet: s, buffers: t };
}
function uo(e, t) {
  if (!e)
    return e;
  if (jo(e)) {
    const n = { _placeholder: !0, num: t.length };
    return t.push(e), n;
  } else if (Array.isArray(e)) {
    const n = new Array(e.length);
    for (let s = 0; s < e.length; s++)
      n[s] = uo(e[s], t);
    return n;
  } else if (typeof e == "object" && !(e instanceof Date)) {
    const n = {};
    for (const s in e)
      Object.prototype.hasOwnProperty.call(e, s) && (n[s] = uo(e[s], t));
    return n;
  }
  return e;
}
function Ug(e, t) {
  return e.data = fo(e.data, t), delete e.attachments, e;
}
function fo(e, t) {
  if (!e)
    return e;
  if (e && e._placeholder === !0) {
    if (typeof e.num == "number" && e.num >= 0 && e.num < t.length)
      return t[e.num];
    throw new Error("illegal attachments");
  } else if (Array.isArray(e))
    for (let n = 0; n < e.length; n++)
      e[n] = fo(e[n], t);
  else if (typeof e == "object")
    for (const n in e)
      Object.prototype.hasOwnProperty.call(e, n) && (e[n] = fo(e[n], t));
  return e;
}
const zg = [
  "connect",
  "connect_error",
  "disconnect",
  "disconnecting",
  "newListener",
  "removeListener"
  // used by the Node.js EventEmitter
];
var Me;
(function(e) {
  e[e.CONNECT = 0] = "CONNECT", e[e.DISCONNECT = 1] = "DISCONNECT", e[e.EVENT = 2] = "EVENT", e[e.ACK = 3] = "ACK", e[e.CONNECT_ERROR = 4] = "CONNECT_ERROR", e[e.BINARY_EVENT = 5] = "BINARY_EVENT", e[e.BINARY_ACK = 6] = "BINARY_ACK";
})(Me || (Me = {}));
class Hg {
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
    return (t.type === Me.EVENT || t.type === Me.ACK) && Lr(t) ? this.encodeAsBinary({
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
    const n = $g(t), s = this.encodeAsString(n.packet), r = n.buffers;
    return r.unshift(s), r;
  }
}
function ml(e) {
  return Object.prototype.toString.call(e) === "[object Object]";
}
class Vo extends ut {
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
      const s = n.type === Me.BINARY_EVENT;
      s || n.type === Me.BINARY_ACK ? (n.type = s ? Me.EVENT : Me.ACK, this.reconstructor = new Wg(n), n.attachments === 0 && super.emitReserved("decoded", n)) : super.emitReserved("decoded", n);
    } else if (jo(t) || t.base64)
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
      if (Vo.isPayloadValid(s.type, i))
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
      case Me.CONNECT:
        return ml(n);
      case Me.DISCONNECT:
        return n === void 0;
      case Me.CONNECT_ERROR:
        return typeof n == "string" || ml(n);
      case Me.EVENT:
      case Me.BINARY_EVENT:
        return Array.isArray(n) && (typeof n[0] == "number" || typeof n[0] == "string" && zg.indexOf(n[0]) === -1);
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
class Wg {
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
      const n = Ug(this.reconPack, this.buffers);
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
const qg = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Decoder: Vo,
  Encoder: Hg,
  get PacketType() {
    return Me;
  }
}, Symbol.toStringTag, { value: "Module" }));
function Yt(e, t, n) {
  return e.on(t, n), function() {
    e.off(t, n);
  };
}
const jg = Object.freeze({
  connect: 1,
  connect_error: 1,
  disconnect: 1,
  disconnecting: 1,
  // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
  newListener: 1,
  removeListener: 1
});
class su extends ut {
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
      Yt(t, "open", this.onopen.bind(this)),
      Yt(t, "packet", this.onpacket.bind(this)),
      Yt(t, "error", this.onerror.bind(this)),
      Yt(t, "close", this.onclose.bind(this))
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
    if (jg.hasOwnProperty(t))
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
function gs(e) {
  e = e || {}, this.ms = e.min || 100, this.max = e.max || 1e4, this.factor = e.factor || 2, this.jitter = e.jitter > 0 && e.jitter <= 1 ? e.jitter : 0, this.attempts = 0;
}
gs.prototype.duration = function() {
  var e = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var t = Math.random(), n = Math.floor(t * this.jitter * e);
    e = (Math.floor(t * 10) & 1) == 0 ? e - n : e + n;
  }
  return Math.min(e, this.max) | 0;
};
gs.prototype.reset = function() {
  this.attempts = 0;
};
gs.prototype.setMin = function(e) {
  this.ms = e;
};
gs.prototype.setMax = function(e) {
  this.max = e;
};
gs.prototype.setJitter = function(e) {
  this.jitter = e;
};
class ho extends ut {
  constructor(t, n) {
    var s;
    super(), this.nsps = {}, this.subs = [], t && typeof t == "object" && (n = t, t = void 0), n = n || {}, n.path = n.path || "/socket.io", this.opts = n, li(this, n), this.reconnection(n.reconnection !== !1), this.reconnectionAttempts(n.reconnectionAttempts || 1 / 0), this.reconnectionDelay(n.reconnectionDelay || 1e3), this.reconnectionDelayMax(n.reconnectionDelayMax || 5e3), this.randomizationFactor((s = n.randomizationFactor) !== null && s !== void 0 ? s : 0.5), this.backoff = new gs({
      min: this.reconnectionDelay(),
      max: this.reconnectionDelayMax(),
      jitter: this.randomizationFactor()
    }), this.timeout(n.timeout == null ? 2e4 : n.timeout), this._readyState = "closed", this.uri = t;
    const r = n.parser || qg;
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
    this.engine = new Ng(this.uri, this.opts);
    const n = this.engine, s = this;
    this._readyState = "opening", this.skipReconnect = !1;
    const r = Yt(n, "open", function() {
      s.onopen(), t && t();
    }), i = (a) => {
      this.cleanup(), this._readyState = "closed", this.emitReserved("error", a), t ? t(a) : this.maybeReconnectOnOpen();
    }, o = Yt(n, "error", i);
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
      Yt(t, "ping", this.onping.bind(this)),
      Yt(t, "data", this.ondata.bind(this)),
      Yt(t, "error", this.onerror.bind(this)),
      Yt(t, "close", this.onclose.bind(this)),
      // @ts-ignore
      Yt(this.decoder, "decoded", this.ondecoded.bind(this))
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
    ai(() => {
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
    return s ? this._autoConnect && !s.active && s.connect() : (s = new su(this, t, n), this.nsps[t] = s), s;
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
const Ps = {};
function Or(e, t) {
  typeof e == "object" && (t = e, e = void 0), t = t || {};
  const n = Mg(e, t.path || "/socket.io"), s = n.source, r = n.id, i = n.path, o = Ps[r] && i in Ps[r].nsps, a = t.forceNew || t["force new connection"] || t.multiplex === !1 || o;
  let l;
  return a ? l = new ho(s, t) : (Ps[r] || (Ps[r] = new ho(s, t)), l = Ps[r]), n.query && !t.query && (t.query = n.queryKey), l.socket(n.path, t);
}
Object.assign(Or, {
  Manager: ho,
  Socket: su,
  io: Or,
  connect: Or
});
const Vg = 5e3;
function Kg() {
  const e = re([]), t = re(!1), n = re(""), s = re(!1), r = re(!1), i = re(!1), o = re("connecting"), a = re(0), l = 5, d = re({}), c = re(null), b = re("");
  let w = null;
  const D = 6e4, L = () => {
    t.value = !1, w && (clearTimeout(w), w = null);
  }, W = () => {
    t.value = !0, w && clearTimeout(w), w = setTimeout(L, D);
  };
  let F = null, se = null, ie = null, oe = null, T = null, O = null, V, K;
  const xe = (p) => {
    V = p, p && F != null && F.connected && F.emit("refresh_token", { conversation_token: p });
  }, ze = (p) => {
    K = p;
  }, Ke = (p) => {
    var I;
    const x = V || localStorage.getItem("ctid"), C = {};
    x && (C.conversation_token = x), K && (C.widget_id = K);
    try {
      C.page_url = window.parent !== window && ((I = window.parent.location) != null && I.href) ? window.parent.location.href : document.referrer || window.location.href;
    } catch {
      C.page_url = document.referrer || "";
    }
    return F = Or(`${ps.WS_URL}/widget`, {
      transports: ["websocket"],
      reconnection: !0,
      reconnectionAttempts: l,
      reconnectionDelay: 1e3,
      auth: Object.keys(C).length > 0 ? C : void 0
    }), F.on("connect", () => {
      o.value = "connected", a.value = 0;
    }), F.on("bot_typing", () => {
      W();
    }), F.on("disconnect", () => {
      L(), o.value === "connected" && (console.log("Socket disconnected, setting connection status to connecting"), o.value = "connecting");
    }), F.on("connect_error", () => {
      a.value++, console.error("Socket connection failed, attempt:", a.value, "connection status:", o.value), a.value >= l && (o.value = "failed");
    }), F.on("chat_response", (k) => {
      if (L(), k.session_id ? (console.log("Captured session_id from chat_response:", k.session_id), b.value = k.session_id) : console.warn("No session_id in chat_response data:", k), k.type === "agent_message") {
        const H = {
          message: k.message,
          message_type: "agent",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          session_id: "",
          agent_name: k.agent_name,
          stream: !0,
          // live reply → client-side typewriter reveal
          attributes: {
            end_chat: k.end_chat,
            end_chat_reason: k.end_chat_reason,
            end_chat_description: k.end_chat_description,
            request_rating: k.request_rating
          }
        };
        k.attachments && Array.isArray(k.attachments) && (H.id = k.message_id, H.attachments = k.attachments.map(($, U) => ({
          id: k.message_id * 1e3 + U,
          filename: $.filename,
          file_url: $.file_url,
          content_type: $.content_type,
          file_size: $.file_size
        }))), e.value.push(H);
      } else k.shopify_output && typeof k.shopify_output == "object" && k.shopify_output.products ? e.value.push({
        message: k.message,
        // Keep the accompanying text message
        message_type: "product",
        // Use 'product' type for rendering
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: "",
        agent_name: k.agent_name,
        // Assign the whole structured object
        shopify_output: k.shopify_output,
        // Remove the old flattened fields (product_id, product_title, etc.)
        attributes: {
          // Keep other attributes if needed
          end_chat: k.end_chat,
          request_rating: k.request_rating
        }
      }) : e.value.push({
        message: k.message,
        message_type: "bot",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: "",
        agent_name: k.agent_name,
        stream: !0,
        // live reply → client-side typewriter reveal
        // Knowledge-base citations (display gated by show_citations in the widget)
        sources: Array.isArray(k.sources) && k.sources.length ? k.sources : void 0,
        attributes: {
          end_chat: k.end_chat,
          end_chat_reason: k.end_chat_reason,
          end_chat_description: k.end_chat_description,
          request_rating: k.request_rating
        }
      });
    }), F.on("handle_taken_over", (k) => {
      e.value.push({
        message: `${k.user_name} joined the conversation`,
        message_type: "system",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: k.session_id
      }), d.value = {
        ...d.value,
        human_agent_name: k.user_name,
        human_agent_profile_pic: k.profile_picture
      }, L(), se && se(k);
    }), F.on("session_initialized", (k) => {
      k.session_id && (b.value = k.session_id, O = {
        session_id: k.session_id,
        authenticated: !!k.authenticated,
        created: !!k.created
      }, T == null || T(O));
    }), F.on("error", de), F.on("chat_history", ae), F.on("rating_submitted", rt), F.on("display_form", be), F.on("form_submitted", _e), F.on("workflow_state", Te), F.on("workflow_proceeded", Ie), F;
  }, Ae = async () => {
    try {
      return o.value = "connecting", a.value = 0, L(), F && (F.removeAllListeners(), F.disconnect(), F = null), F = Ke(""), new Promise((p) => {
        F == null || F.on("connect", () => {
          p(!0);
        }), F == null || F.on("connect_error", () => {
          a.value >= l && p(!1);
        });
      });
    } catch (p) {
      return console.error("Socket initialization failed:", p), o.value = "failed", !1;
    }
  }, me = () => (F && F.disconnect(), Ae()), Xe = (p) => {
    se = p;
  }, et = (p) => {
    T = p, O && p(O);
  }, st = (p) => {
    ie = p;
  }, ue = (p) => {
    oe = p;
  }, de = (p) => {
    L(), n.value = cd(p), s.value = !0, setTimeout(() => {
      s.value = !1, n.value = "";
    }, 5e3);
  }, ae = (p) => {
    if (p.type === "chat_history" && Array.isArray(p.messages)) {
      const x = p.messages.map((C) => {
        var k, H;
        const I = {
          message: C.message,
          message_type: C.message_type,
          created_at: C.created_at,
          session_id: "",
          agent_name: C.agent_name || "",
          user_name: C.user_name || "",
          attributes: C.attributes || {},
          attachments: C.attachments || []
          // Include attachments
        };
        return Array.isArray((k = C.attributes) == null ? void 0 : k.sources) && C.attributes.sources.length && (I.sources = C.attributes.sources), (H = C.attributes) != null && H.shopify_output && typeof C.attributes.shopify_output == "object" ? {
          ...I,
          message_type: "product",
          shopify_output: C.attributes.shopify_output
        } : I;
      });
      e.value = [
        ...x.filter(
          (C) => !e.value.some(
            (I) => I.message === C.message && I.created_at === C.created_at
          )
        ),
        ...e.value
      ];
    }
  }, rt = (p) => {
    p.success && e.value.push({
      message: "Thank you for your feedback!",
      message_type: "system",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: ""
    });
  }, be = (p) => {
    var x;
    console.log("Form display handler in composable:", p), L(), c.value = p.form_data, console.log("Set currentForm in handleDisplayForm:", c.value), ((x = p.form_data) == null ? void 0 : x.form_full_screen) === !0 ? (console.log("Full screen form detected, triggering workflow state callback"), ie && ie({
      type: "form",
      form_data: p.form_data,
      session_id: p.session_id
    })) : e.value.push({
      message: "",
      message_type: "form",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: p.session_id,
      attributes: {
        form_data: p.form_data
      }
    });
  }, _e = (p) => {
    console.log("Form submitted confirmation received, clearing currentForm"), c.value = null, p.success && console.log("Form submitted successfully");
  }, Te = (p) => {
    console.log("Workflow state received in composable:", p), (p.type === "form" || p.type === "display_form") && (console.log("Setting currentForm from workflow state:", p.form_data), c.value = p.form_data), ie && ie(p);
  }, Ie = (p) => {
    console.log("Workflow proceeded in composable:", p), oe && oe(p);
  }, Lt = async (p, x) => {
    !F || !p || F.emit("submit_rating", {
      rating: p,
      feedback: x
    });
  }, Le = async (p) => {
    var I;
    if (console.log("Submitting form in socket:", p), console.log("Current form in socket:", c.value), console.log("Socket in socket:", F), !F) {
      console.error("No socket available for form submission");
      return;
    }
    if (!p || Object.keys(p).length === 0) {
      console.error("No form data to submit");
      return;
    }
    const C = ((I = c.value) == null ? void 0 : I.form_type) === "contact" ? "submit_contact_info" : "submit_form";
    console.log(`Emitting ${C} event with data:`, p), F.emit(C, {
      form_data: p
    }), c.value = null;
  }, it = async () => {
    F && (console.log("Getting workflow state 12"), F.emit("get_workflow_state"));
  }, ht = async () => {
    F && F.emit("proceed_workflow", {});
  }, dt = async (p, x, C = []) => {
    if (!F || !p.trim() && C.length === 0) return;
    const I = {
      message: p,
      message_type: "user",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: ""
    };
    C.length > 0 && (I.attachments = C.map((k, H) => {
      let $ = "";
      if (k.content_type.startsWith("image/")) {
        const U = atob(k.content), P = new Array(U.length);
        for (let j = 0; j < U.length; j++)
          P[j] = U.charCodeAt(j);
        const G = new Uint8Array(P), q = new Blob([G], { type: k.content_type });
        $ = URL.createObjectURL(q);
      }
      return {
        id: Date.now() * 1e3 + H,
        // Temporary ID
        filename: k.filename,
        file_url: $,
        // Temporary blob URL, will be replaced
        content_type: k.content_type,
        file_size: k.size,
        _isTemporary: !0
        // Flag to identify temporary attachments
      };
    })), e.value.push(I), F.emit("chat", {
      message: p,
      email: x,
      files: C
      // Send files with base64 content
    }), i.value = !0;
  }, mt = () => {
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
    sendMessage: dt,
    endChat: (p = "CUSTOMER_REQUEST") => new Promise((x) => {
      if (!F || !F.connected) {
        x(!1);
        return;
      }
      let C = !1;
      const I = (U) => {
        C || (C = !0, clearTimeout($), F == null || F.off("chat_ended", k), F == null || F.off("error", H), U && mt(), x(U));
      }, k = () => I(!0), H = (U) => {
        (U == null ? void 0 : U.type) === "end_chat_error" && I(!1);
      }, $ = setTimeout(() => I(!1), Vg);
      F.on("chat_ended", k), F.on("error", H), F.emit("end_chat", { reason: p });
    }),
    loadChatHistory: async () => {
      if (F)
        try {
          r.value = !0, F.emit("get_chat_history");
        } catch (p) {
          console.error("Failed to load chat history:", p);
        } finally {
          r.value = !1;
        }
    },
    connect: Ae,
    reconnect: me,
    cleanup: () => {
      L(), F && (F.removeAllListeners(), F.disconnect(), F = null), se = null, ie = null, oe = null;
    },
    humanAgent: d,
    onTakeover: Xe,
    onSessionState: et,
    submitRating: Lt,
    currentForm: c,
    submitForm: Le,
    getWorkflowState: it,
    proceedWorkflow: ht,
    onWorkflowState: st,
    onWorkflowProceeded: ue,
    currentSessionId: b,
    setToken: xe,
    setWidgetId: ze
  };
}
function Gg(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var $i = { exports: {} }, _l;
function Yg() {
  return _l || (_l = 1, function(e) {
    (function() {
      function t(f, _, N) {
        return f.call.apply(f.bind, arguments);
      }
      function n(f, _, N) {
        if (!f) throw Error();
        if (2 < arguments.length) {
          var S = Array.prototype.slice.call(arguments, 2);
          return function() {
            var B = Array.prototype.slice.call(arguments);
            return Array.prototype.unshift.apply(B, S), f.apply(_, B);
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
      function a(f, _, N, S) {
        if (_ = f.c.createElement(_), N) for (var B in N) N.hasOwnProperty(B) && (B == "style" ? _.style.cssText = N[B] : _.setAttribute(B, N[B]));
        return S && _.appendChild(f.c.createTextNode(S)), _;
      }
      function l(f, _, N) {
        f = f.c.getElementsByTagName(_)[0], f || (f = document.documentElement), f.insertBefore(N, f.lastChild);
      }
      function d(f) {
        f.parentNode && f.parentNode.removeChild(f);
      }
      function c(f, _, N) {
        _ = _ || [], N = N || [];
        for (var S = f.className.split(/\s+/), B = 0; B < _.length; B += 1) {
          for (var X = !1, J = 0; J < S.length; J += 1) if (_[B] === S[J]) {
            X = !0;
            break;
          }
          X || S.push(_[B]);
        }
        for (_ = [], B = 0; B < S.length; B += 1) {
          for (X = !1, J = 0; J < N.length; J += 1) if (S[B] === N[J]) {
            X = !0;
            break;
          }
          X || _.push(S[B]);
        }
        f.className = _.join(" ").replace(/\s+/g, " ").replace(/^\s+|\s+$/, "");
      }
      function b(f, _) {
        for (var N = f.className.split(/\s+/), S = 0, B = N.length; S < B; S++) if (N[S] == _) return !0;
        return !1;
      }
      function w(f) {
        return f.o.location.hostname || f.a.location.hostname;
      }
      function D(f, _, N) {
        function S() {
          ye && B && X && (ye(J), ye = null);
        }
        _ = a(f, "link", { rel: "stylesheet", href: _, media: "all" });
        var B = !1, X = !0, J = null, ye = N || null;
        o ? (_.onload = function() {
          B = !0, S();
        }, _.onerror = function() {
          B = !0, J = Error("Stylesheet failed to load"), S();
        }) : setTimeout(function() {
          B = !0, S();
        }, 0), l(f, "head", _);
      }
      function L(f, _, N, S) {
        var B = f.c.getElementsByTagName("head")[0];
        if (B) {
          var X = a(f, "script", { src: _ }), J = !1;
          return X.onload = X.onreadystatechange = function() {
            J || this.readyState && this.readyState != "loaded" && this.readyState != "complete" || (J = !0, N && N(null), X.onload = X.onreadystatechange = null, X.parentNode.tagName == "HEAD" && B.removeChild(X));
          }, B.appendChild(X), setTimeout(function() {
            J || (J = !0, N && N(Error("Script load timeout")));
          }, S || 5e3), X;
        }
        return null;
      }
      function W() {
        this.a = 0, this.c = null;
      }
      function F(f) {
        return f.a++, function() {
          f.a--, ie(f);
        };
      }
      function se(f, _) {
        f.c = _, ie(f);
      }
      function ie(f) {
        f.a == 0 && f.c && (f.c(), f.c = null);
      }
      function oe(f) {
        this.a = f || "-";
      }
      oe.prototype.c = function(f) {
        for (var _ = [], N = 0; N < arguments.length; N++) _.push(arguments[N].replace(/[\W_]+/g, "").toLowerCase());
        return _.join(this.a);
      };
      function T(f, _) {
        this.c = f, this.f = 4, this.a = "n";
        var N = (_ || "n4").match(/^([nio])([1-9])$/i);
        N && (this.a = N[1], this.f = parseInt(N[2], 10));
      }
      function O(f) {
        return xe(f) + " " + (f.f + "00") + " 300px " + V(f.c);
      }
      function V(f) {
        var _ = [];
        f = f.split(/,\s*/);
        for (var N = 0; N < f.length; N++) {
          var S = f[N].replace(/['"]/g, "");
          S.indexOf(" ") != -1 || /^\d/.test(S) ? _.push("'" + S + "'") : _.push(S);
        }
        return _.join(",");
      }
      function K(f) {
        return f.a + f.f;
      }
      function xe(f) {
        var _ = "normal";
        return f.a === "o" ? _ = "oblique" : f.a === "i" && (_ = "italic"), _;
      }
      function ze(f) {
        var _ = 4, N = "n", S = null;
        return f && ((S = f.match(/(normal|oblique|italic)/i)) && S[1] && (N = S[1].substr(0, 1).toLowerCase()), (S = f.match(/([1-9]00|normal|bold)/i)) && S[1] && (/bold/i.test(S[1]) ? _ = 7 : /[1-9]00/.test(S[1]) && (_ = parseInt(S[1].substr(0, 1), 10)))), N + _;
      }
      function Ke(f, _) {
        this.c = f, this.f = f.o.document.documentElement, this.h = _, this.a = new oe("-"), this.j = _.events !== !1, this.g = _.classes !== !1;
      }
      function Ae(f) {
        f.g && c(f.f, [f.a.c("wf", "loading")]), Xe(f, "loading");
      }
      function me(f) {
        if (f.g) {
          var _ = b(f.f, f.a.c("wf", "active")), N = [], S = [f.a.c("wf", "loading")];
          _ || N.push(f.a.c("wf", "inactive")), c(f.f, N, S);
        }
        Xe(f, "inactive");
      }
      function Xe(f, _, N) {
        f.j && f.h[_] && (N ? f.h[_](N.c, K(N)) : f.h[_]());
      }
      function et() {
        this.c = {};
      }
      function st(f, _, N) {
        var S = [], B;
        for (B in _) if (_.hasOwnProperty(B)) {
          var X = f.c[B];
          X && S.push(X(_[B], N));
        }
        return S;
      }
      function ue(f, _) {
        this.c = f, this.f = _, this.a = a(this.c, "span", { "aria-hidden": "true" }, this.f);
      }
      function de(f) {
        l(f.c, "body", f.a);
      }
      function ae(f) {
        return "display:block;position:absolute;top:-9999px;left:-9999px;font-size:300px;width:auto;height:auto;line-height:normal;margin:0;padding:0;font-variant:normal;white-space:nowrap;font-family:" + V(f.c) + ";" + ("font-style:" + xe(f) + ";font-weight:" + (f.f + "00") + ";");
      }
      function rt(f, _, N, S, B, X) {
        this.g = f, this.j = _, this.a = S, this.c = N, this.f = B || 3e3, this.h = X || void 0;
      }
      rt.prototype.start = function() {
        var f = this.c.o.document, _ = this, N = r(), S = new Promise(function(J, ye) {
          function Ne() {
            r() - N >= _.f ? ye() : f.fonts.load(O(_.a), _.h).then(function(Ve) {
              1 <= Ve.length ? J() : setTimeout(Ne, 25);
            }, function() {
              ye();
            });
          }
          Ne();
        }), B = null, X = new Promise(function(J, ye) {
          B = setTimeout(ye, _.f);
        });
        Promise.race([X, S]).then(function() {
          B && (clearTimeout(B), B = null), _.g(_.a);
        }, function() {
          _.j(_.a);
        });
      };
      function be(f, _, N, S, B, X, J) {
        this.v = f, this.B = _, this.c = N, this.a = S, this.s = J || "BESbswy", this.f = {}, this.w = B || 3e3, this.u = X || null, this.m = this.j = this.h = this.g = null, this.g = new ue(this.c, this.s), this.h = new ue(this.c, this.s), this.j = new ue(this.c, this.s), this.m = new ue(this.c, this.s), f = new T(this.a.c + ",serif", K(this.a)), f = ae(f), this.g.a.style.cssText = f, f = new T(this.a.c + ",sans-serif", K(this.a)), f = ae(f), this.h.a.style.cssText = f, f = new T("serif", K(this.a)), f = ae(f), this.j.a.style.cssText = f, f = new T("sans-serif", K(this.a)), f = ae(f), this.m.a.style.cssText = f, de(this.g), de(this.h), de(this.j), de(this.m);
      }
      var _e = { D: "serif", C: "sans-serif" }, Te = null;
      function Ie() {
        if (Te === null) {
          var f = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent);
          Te = !!f && (536 > parseInt(f[1], 10) || parseInt(f[1], 10) === 536 && 11 >= parseInt(f[2], 10));
        }
        return Te;
      }
      be.prototype.start = function() {
        this.f.serif = this.j.a.offsetWidth, this.f["sans-serif"] = this.m.a.offsetWidth, this.A = r(), Le(this);
      };
      function Lt(f, _, N) {
        for (var S in _e) if (_e.hasOwnProperty(S) && _ === f.f[_e[S]] && N === f.f[_e[S]]) return !0;
        return !1;
      }
      function Le(f) {
        var _ = f.g.a.offsetWidth, N = f.h.a.offsetWidth, S;
        (S = _ === f.f.serif && N === f.f["sans-serif"]) || (S = Ie() && Lt(f, _, N)), S ? r() - f.A >= f.w ? Ie() && Lt(f, _, N) && (f.u === null || f.u.hasOwnProperty(f.a.c)) ? ht(f, f.v) : ht(f, f.B) : it(f) : ht(f, f.v);
      }
      function it(f) {
        setTimeout(s(function() {
          Le(this);
        }, f), 50);
      }
      function ht(f, _) {
        setTimeout(s(function() {
          d(this.g.a), d(this.h.a), d(this.j.a), d(this.m.a), _(this.a);
        }, f), 0);
      }
      function dt(f, _, N) {
        this.c = f, this.a = _, this.f = 0, this.m = this.j = !1, this.s = N;
      }
      var mt = null;
      dt.prototype.g = function(f) {
        var _ = this.a;
        _.g && c(_.f, [_.a.c("wf", f.c, K(f).toString(), "active")], [_.a.c("wf", f.c, K(f).toString(), "loading"), _.a.c("wf", f.c, K(f).toString(), "inactive")]), Xe(_, "fontactive", f), this.m = !0, _t(this);
      }, dt.prototype.h = function(f) {
        var _ = this.a;
        if (_.g) {
          var N = b(_.f, _.a.c("wf", f.c, K(f).toString(), "active")), S = [], B = [_.a.c("wf", f.c, K(f).toString(), "loading")];
          N || S.push(_.a.c("wf", f.c, K(f).toString(), "inactive")), c(_.f, S, B);
        }
        Xe(_, "fontinactive", f), _t(this);
      };
      function _t(f) {
        --f.f == 0 && f.j && (f.m ? (f = f.a, f.g && c(f.f, [f.a.c("wf", "active")], [f.a.c("wf", "loading"), f.a.c("wf", "inactive")]), Xe(f, "active")) : me(f.a));
      }
      function Ot(f) {
        this.j = f, this.a = new et(), this.h = 0, this.f = this.g = !0;
      }
      Ot.prototype.load = function(f) {
        this.c = new i(this.j, f.context || this.j), this.g = f.events !== !1, this.f = f.classes !== !1, p(this, new Ke(this.c, f), f);
      };
      function m(f, _, N, S, B) {
        var X = --f.h == 0;
        (f.f || f.g) && setTimeout(function() {
          var J = B || null, ye = S || null || {};
          if (N.length === 0 && X) me(_.a);
          else {
            _.f += N.length, X && (_.j = X);
            var Ne, Ve = [];
            for (Ne = 0; Ne < N.length; Ne++) {
              var De = N[Ne], lt = ye[De.c], yt = _.a, Ge = De;
              if (yt.g && c(yt.f, [yt.a.c("wf", Ge.c, K(Ge).toString(), "loading")]), Xe(yt, "fontloading", Ge), yt = null, mt === null) if (window.FontFace) {
                var Ge = /Gecko.*Firefox\/(\d+)/.exec(window.navigator.userAgent), qt = /OS X.*Version\/10\..*Safari/.exec(window.navigator.userAgent) && /Apple/.exec(window.navigator.vendor);
                mt = Ge ? 42 < parseInt(Ge[1], 10) : !qt;
              } else mt = !1;
              mt ? yt = new rt(s(_.g, _), s(_.h, _), _.c, De, _.s, lt) : yt = new be(s(_.g, _), s(_.h, _), _.c, De, _.s, J, lt), Ve.push(yt);
            }
            for (Ne = 0; Ne < Ve.length; Ne++) Ve[Ne].start();
          }
        }, 0);
      }
      function p(f, _, N) {
        var B = [], S = N.timeout;
        Ae(_);
        var B = st(f.a, N, f.c), X = new dt(f.c, _, S);
        for (f.h = B.length, _ = 0, N = B.length; _ < N; _++) B[_].load(function(J, ye, Ne) {
          m(f, X, J, ye, Ne);
        });
      }
      function x(f, _) {
        this.c = f, this.a = _;
      }
      x.prototype.load = function(f) {
        function _() {
          if (X["__mti_fntLst" + S]) {
            var J = X["__mti_fntLst" + S](), ye = [], Ne;
            if (J) for (var Ve = 0; Ve < J.length; Ve++) {
              var De = J[Ve].fontfamily;
              J[Ve].fontStyle != null && J[Ve].fontWeight != null ? (Ne = J[Ve].fontStyle + J[Ve].fontWeight, ye.push(new T(De, Ne))) : ye.push(new T(De));
            }
            f(ye);
          } else setTimeout(function() {
            _();
          }, 50);
        }
        var N = this, S = N.a.projectId, B = N.a.version;
        if (S) {
          var X = N.c.o;
          L(this.c, (N.a.api || "https://fast.fonts.net/jsapi") + "/" + S + ".js" + (B ? "?v=" + B : ""), function(J) {
            J ? f([]) : (X["__MonotypeConfiguration__" + S] = function() {
              return N.a;
            }, _());
          }).id = "__MonotypeAPIScript__" + S;
        } else f([]);
      };
      function C(f, _) {
        this.c = f, this.a = _;
      }
      C.prototype.load = function(f) {
        var _, N, S = this.a.urls || [], B = this.a.families || [], X = this.a.testStrings || {}, J = new W();
        for (_ = 0, N = S.length; _ < N; _++) D(this.c, S[_], F(J));
        var ye = [];
        for (_ = 0, N = B.length; _ < N; _++) if (S = B[_].split(":"), S[1]) for (var Ne = S[1].split(","), Ve = 0; Ve < Ne.length; Ve += 1) ye.push(new T(S[0], Ne[Ve]));
        else ye.push(new T(S[0]));
        se(J, function() {
          f(ye, X);
        });
      };
      function I(f, _) {
        f ? this.c = f : this.c = k, this.a = [], this.f = [], this.g = _ || "";
      }
      var k = "https://fonts.googleapis.com/css";
      function H(f, _) {
        for (var N = _.length, S = 0; S < N; S++) {
          var B = _[S].split(":");
          B.length == 3 && f.f.push(B.pop());
          var X = "";
          B.length == 2 && B[1] != "" && (X = ":"), f.a.push(B.join(X));
        }
      }
      function $(f) {
        if (f.a.length == 0) throw Error("No fonts to load!");
        if (f.c.indexOf("kit=") != -1) return f.c;
        for (var _ = f.a.length, N = [], S = 0; S < _; S++) N.push(f.a[S].replace(/ /g, "+"));
        return _ = f.c + "?family=" + N.join("%7C"), 0 < f.f.length && (_ += "&subset=" + f.f.join(",")), 0 < f.g.length && (_ += "&text=" + encodeURIComponent(f.g)), _;
      }
      function U(f) {
        this.f = f, this.a = [], this.c = {};
      }
      var P = { latin: "BESbswy", "latin-ext": "çöüğş", cyrillic: "йяЖ", greek: "αβΣ", khmer: "កខគ", Hanuman: "កខគ" }, G = { thin: "1", extralight: "2", "extra-light": "2", ultralight: "2", "ultra-light": "2", light: "3", regular: "4", book: "4", medium: "5", "semi-bold": "6", semibold: "6", "demi-bold": "6", demibold: "6", bold: "7", "extra-bold": "8", extrabold: "8", "ultra-bold": "8", ultrabold: "8", black: "9", heavy: "9", l: "3", r: "4", b: "7" }, q = { i: "i", italic: "i", n: "n", normal: "n" }, j = /^(thin|(?:(?:extra|ultra)-?)?light|regular|book|medium|(?:(?:semi|demi|extra|ultra)-?)?bold|black|heavy|l|r|b|[1-9]00)?(n|i|normal|italic)?$/;
      function te(f) {
        for (var _ = f.f.length, N = 0; N < _; N++) {
          var S = f.f[N].split(":"), B = S[0].replace(/\+/g, " "), X = ["n4"];
          if (2 <= S.length) {
            var J, ye = S[1];
            if (J = [], ye) for (var ye = ye.split(","), Ne = ye.length, Ve = 0; Ve < Ne; Ve++) {
              var De;
              if (De = ye[Ve], De.match(/^[\w-]+$/)) {
                var lt = j.exec(De.toLowerCase());
                if (lt == null) De = "";
                else {
                  if (De = lt[2], De = De == null || De == "" ? "n" : q[De], lt = lt[1], lt == null || lt == "") lt = "4";
                  else var yt = G[lt], lt = yt || (isNaN(lt) ? "4" : lt.substr(0, 1));
                  De = [De, lt].join("");
                }
              } else De = "";
              De && J.push(De);
            }
            0 < J.length && (X = J), S.length == 3 && (S = S[2], J = [], S = S ? S.split(",") : J, 0 < S.length && (S = P[S[0]]) && (f.c[B] = S));
          }
          for (f.c[B] || (S = P[B]) && (f.c[B] = S), S = 0; S < X.length; S += 1) f.a.push(new T(B, X[S]));
        }
      }
      function le(f, _) {
        this.c = f, this.a = _;
      }
      var Ee = { Arimo: !0, Cousine: !0, Tinos: !0 };
      le.prototype.load = function(f) {
        var _ = new W(), N = this.c, S = new I(this.a.api, this.a.text), B = this.a.families;
        H(S, B);
        var X = new U(B);
        te(X), D(N, $(S), F(_)), se(_, function() {
          f(X.a, X.c, Ee);
        });
      };
      function Se(f, _) {
        this.c = f, this.a = _;
      }
      Se.prototype.load = function(f) {
        var _ = this.a.id, N = this.c.o;
        _ ? L(this.c, (this.a.api || "https://use.typekit.net") + "/" + _ + ".js", function(S) {
          if (S) f([]);
          else if (N.Typekit && N.Typekit.config && N.Typekit.config.fn) {
            S = N.Typekit.config.fn;
            for (var B = [], X = 0; X < S.length; X += 2) for (var J = S[X], ye = S[X + 1], Ne = 0; Ne < ye.length; Ne++) B.push(new T(J, ye[Ne]));
            try {
              N.Typekit.load({ events: !1, classes: !1, async: !0 });
            } catch {
            }
            f(B);
          }
        }, 2e3) : f([]);
      };
      function nt(f, _) {
        this.c = f, this.f = _, this.a = [];
      }
      nt.prototype.load = function(f) {
        var _ = this.f.id, N = this.c.o, S = this;
        _ ? (N.__webfontfontdeckmodule__ || (N.__webfontfontdeckmodule__ = {}), N.__webfontfontdeckmodule__[_] = function(B, X) {
          for (var J = 0, ye = X.fonts.length; J < ye; ++J) {
            var Ne = X.fonts[J];
            S.a.push(new T(Ne.name, ze("font-weight:" + Ne.weight + ";font-style:" + Ne.style)));
          }
          f(S.a);
        }, L(this.c, (this.f.api || "https://f.fontdeck.com/s/css/js/") + w(this.c) + "/" + _ + ".js", function(B) {
          B && f([]);
        })) : f([]);
      };
      var Oe = new Ot(window);
      Oe.a.c.custom = function(f, _) {
        return new C(_, f);
      }, Oe.a.c.fontdeck = function(f, _) {
        return new nt(_, f);
      }, Oe.a.c.monotype = function(f, _) {
        return new x(_, f);
      }, Oe.a.c.typekit = function(f, _) {
        return new Se(_, f);
      }, Oe.a.c.google = function(f, _) {
        return new le(_, f);
      };
      var Ze = { load: s(Oe.load, Oe) };
      e.exports ? e.exports = Ze : (window.WebFont = Ze, window.WebFontConfig && Oe.load(window.WebFontConfig));
    })();
  }($i)), $i.exports;
}
var Xg = Yg();
const Zg = /* @__PURE__ */ Gg(Xg), yl = [
  "Space Grotesk:400,500,600,700",
  "Instrument Sans:400,500,600",
  "JetBrains Mono:400,500,600"
], Jg = (e) => {
  const t = [...yl], n = (e == null ? void 0 : e.split(",")[0].trim().replace(/['"]/g, "")) || "", s = yl.some(
    (r) => r.toLowerCase().startsWith(n.toLowerCase())
  );
  n && !s && t.push(n), Zg.load({
    google: { families: t },
    active: () => {
      if (!e) return;
      const r = document.querySelector(".chat-container");
      r && (r.style.fontFamily = e.includes(",") ? e : `"${e}", system-ui, sans-serif`);
    }
  });
};
function Qg() {
  const e = re({}), t = re(""), n = (r) => {
    var i;
    e.value = r, r.photo_url && (e.value.photo_url = r.photo_url), Jg(r.font_family), window.parent.postMessage({
      type: "CUSTOMIZATION_UPDATE",
      data: {
        chat_bubble_color: r.chat_bubble_color || "#C9F24E",
        chat_style: r.chat_style,
        chat_initiation_messages: r.chat_initiation_messages || [],
        // Dashboard "Widget placement" defaults — the embed loader merges these
        // under any options the installing developer set.
        widget_display: (i = r.customization_metadata) == null ? void 0 : i.widget_display
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
const em = 13, tm = 24;
function nm(e, t) {
  const n = Jr({}), s = [];
  let r = null;
  const i = typeof window < "u" && typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, o = (c) => {
    r || s.length === 0 || (r = setTimeout(a, c));
  }, a = () => {
    r = null;
    const c = s[0];
    if (c === void 0) return;
    const b = e.value[c], w = n[c], D = (b == null ? void 0 : b.message) ?? "";
    if (!w || !b) {
      s.shift(), o(0);
      return;
    }
    if (w.shown >= D.length) {
      w.done = !0, s.shift(), o(0);
      return;
    }
    w.shown += 1;
    const L = D[w.shown - 1];
    t == null || t(), o(L === " " ? tm : em);
  };
  Pt(() => e.value.length, (c, b) => {
    b !== void 0 && c < b && (Object.keys(n).forEach((w) => {
      delete n[Number(w)];
    }), s.length = 0);
    for (let w = b ?? 0; w < c; w++) {
      const D = e.value[w];
      if (!D || !D.stream || w in n) continue;
      const L = D.message ?? "";
      i || !L ? n[w] = { shown: L.length, done: !0 } : (n[w] = { shown: 0, done: !1 }, s.push(w));
    }
    o(0);
  });
  const l = (c, b) => {
    const w = n[c];
    return w ? b.slice(0, w.shown) : b;
  }, d = (c) => {
    const b = n[c];
    return !!b && !b.done;
  };
  return Qs(() => {
    r && clearTimeout(r);
  }), { displayText: l, isStreaming: d };
}
function sm(e) {
  const t = re(!0);
  let n = 0;
  const s = () => {
    window.parent.postMessage({ type: "UNREAD_COUNT", count: n }, "*");
  }, r = (i) => {
    var o;
    ((o = i == null ? void 0 : i.data) == null ? void 0 : o.type) === "WIDGET_VISIBILITY" && (t.value = !!i.data.open, t.value && n !== 0 && (n = 0, s()));
  };
  Pt(() => e.value.length, (i, o) => {
    if (i <= (o ?? 0) || t.value) return;
    const a = e.value[i - 1];
    a && (a.message_type === "bot" || a.message_type === "agent") && (n += 1, s());
  }), ti(() => window.addEventListener("message", r)), Qs(() => window.removeEventListener("message", r));
}
const Ko = "ctid", rm = "identity_expired", vl = 0.8, im = 720 * 60 * 1e3, Ui = 30 * 1e3, zi = 1e3, hs = (e) => {
  if (typeof e != "string") return e ? String(e) : null;
  const t = e.trim();
  return !t || t === "undefined" || t === "null" ? null : t;
}, Hi = (e) => {
  const t = hs(e);
  if (!t) return null;
  const [, n] = t.split(".");
  if (!n) return null;
  try {
    const s = atob(n.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(s);
  } catch {
    return null;
  }
}, om = () => {
  try {
    return hs(localStorage.getItem(Ko));
  } catch {
    return null;
  }
}, bl = (e) => {
  try {
    localStorage.setItem(Ko, e);
  } catch {
  }
}, am = () => {
  try {
    localStorage.removeItem(Ko);
  } catch {
  }
};
function lm(e = {}) {
  const t = re(null);
  let n = null, s = null;
  const r = () => {
    n && (clearTimeout(n), n = null);
  }, i = () => {
    const L = Hi(t.value);
    return L != null && L.exp ? Number(L.exp) - Math.floor(Date.now() / zi) : null;
  }, o = () => {
    const L = Hi(t.value);
    if (!(L != null && L.exp)) return !1;
    const W = L.iat ? Number(L.exp) - Number(L.iat) : 0, F = i() ?? 0;
    return W <= 0 ? F <= 0 : F <= W * (1 - vl);
  }, a = (L, { persist: W = !0 } = {}) => {
    var se;
    const F = hs(L);
    if (r(), t.value = F, !F) {
      am();
      return;
    }
    W && (bl(F), (se = e.onTokenChanged) == null || se.call(e, F)), c();
  }, l = async (L) => {
    if (!t.value || !L) return !1;
    if (s) return s;
    const W = t.value;
    return s = (async () => {
      var F, se;
      try {
        const ie = await fetch(`${ps.API_URL}/refresh-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${W}`
          },
          body: JSON.stringify({ widget_id: L })
        });
        if (ie.status === 401)
          return (F = e.onIdentityExpired) == null || F.call(e), !1;
        if (!ie.ok)
          return c(Ui), !1;
        const oe = await ie.json(), T = hs((se = oe == null ? void 0 : oe.data) == null ? void 0 : se.token);
        return T ? (a(T), !0) : !1;
      } catch {
        return c(Ui), !1;
      } finally {
        s = null;
      }
    })(), s;
  }, d = async (L) => t.value ? o() ? l(L) : !0 : !1, c = (L) => {
    r();
    const W = Hi(t.value);
    if (!(W != null && W.exp) || !(W != null && W.iat)) return;
    const F = (Number(W.exp) - Number(W.iat)) * zi, se = (i() ?? 0) * zi, ie = L ?? Math.min(
      im,
      Math.max(0, se - F * (1 - vl))
    );
    n = setTimeout(() => {
      n = null, d(b).then((oe) => {
        c(oe ? void 0 : Ui);
      });
    }, ie);
  };
  let b = "";
  return {
    token: t,
    start: (L, W) => {
      b = L;
      const F = hs(W) || om();
      a(F, { persist: !1 }), F && bl(F);
    },
    stop: () => {
      r(), s = null;
    },
    setToken: a,
    ensureFresh: d
  };
}
const cm = {
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
}, um = {
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
}, fm = {
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
}, hm = {
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
}, dm = {
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
}, Nr = {
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
}, pm = {
  GLASS: cm,
  AURORA: um,
  TERMINAL: fm,
  CALM_MINT: hm,
  PLAYFUL: dm,
  SUNRISE: Nr,
  CHATBOT: Nr,
  ASK_ANYTHING: Nr
}, gm = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", wl = "'Instrument Sans', system-ui, -apple-system, 'Segoe UI', sans-serif";
function mm(e) {
  return Math.max(4, Math.round(e * 0.3));
}
function kl(e) {
  const t = (e || "").replace("#", "");
  if (t.length < 6) return "#0B0C10";
  const n = parseInt(t.slice(0, 2), 16), s = parseInt(t.slice(2, 4), 16), r = parseInt(t.slice(4, 6), 16);
  return (0.299 * n + 0.587 * s + 0.114 * r) / 255 > 0.62 ? "#0B0C10" : "#FFFFFF";
}
function _m(e) {
  return pm[e || ""] || Nr;
}
const ym = "#212529";
function vm(e, t) {
  const n = _m(e), s = (t == null ? void 0 : t.chat_background_color) || "", r = /^#[0-9a-fA-F]{6}$/.test(s), i = s || n.card, o = (t == null ? void 0 : t.chat_text_color) || "", l = /^#[0-9a-fA-F]{6}$/.test(o) && o.toLowerCase() !== ym ? o : r ? fs(s) ? "#FFFFFF" : "#111111" : n.text, d = r ? fs(s) ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)" : n.muted, c = r ? ld(s, 20) : n.agentBg, b = (t == null ? void 0 : t.accent_color) || n.accent, w = r ? !fs(s) : n.light, D = kl(b) === "#0B0C10", L = w === D ? d : b, W = n.mono ? gm : t != null && t.font_family ? `${t.font_family}, ${wl}` : wl;
  return {
    "--cm-card": i,
    "--cm-text": l,
    "--cm-muted": d,
    "--cm-agent-bg": c,
    "--cm-accent": b,
    "--cm-on-accent": kl(b),
    "--cm-presence": L,
    "--cm-border": n.border,
    "--cm-glow": n.glow,
    "--cm-radius": `${n.radius}px`,
    "--cm-bubble": `${n.bubble}px`,
    "--cm-bubble-tail": `${mm(n.bubble)}px`,
    "--cm-field-radius": n.mono ? "7px" : "12px",
    "--cm-avatar-radius": n.mono ? "28%" : "50%",
    "--cm-hairline": n.light ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.08)",
    "--cm-body-font": W
  };
}
function bm() {
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
const wm = {
  key: 0,
  class: "widget-unavailable-overlay"
}, km = {
  key: 1,
  class: "auth-error-overlay"
}, xm = { class: "auth-error-card" }, Tm = { class: "auth-error-message" }, Am = {
  key: 0,
  class: "initializing-overlay"
}, Em = {
  key: 0,
  class: "connecting-message"
}, Sm = {
  key: 1,
  class: "failed-message"
}, Cm = { class: "welcome-content" }, Rm = { class: "welcome-header" }, Im = ["src", "alt"], Lm = { class: "welcome-title" }, Om = { class: "welcome-subtitle" }, Nm = { class: "welcome-input-container" }, Mm = {
  key: 0,
  class: "email-input"
}, Pm = ["disabled"], Fm = { class: "welcome-message-input" }, Dm = ["placeholder", "disabled"], Bm = ["disabled"], $m = {
  key: 0,
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, Um = {
  key: 1,
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, zm = { class: "landing-page-content" }, Hm = { class: "landing-page-header" }, Wm = { class: "landing-page-heading" }, qm = { class: "landing-page-text" }, jm = { class: "landing-page-actions" }, Vm = { class: "form-fullscreen-content" }, Km = {
  key: 0,
  class: "form-header"
}, Gm = {
  key: 0,
  class: "form-title"
}, Ym = {
  key: 1,
  class: "form-description"
}, Xm = { class: "form-fields" }, Zm = ["for"], Jm = {
  key: 0,
  class: "required-indicator"
}, Qm = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "autocomplete", "inputmode"], e_ = ["id", "placeholder", "required", "min", "max", "value", "onInput"], t_ = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput"], n_ = ["id", "required", "value", "onChange"], s_ = { value: "" }, r_ = ["value"], i_ = {
  key: 4,
  class: "checkbox-field"
}, o_ = ["id", "required", "checked", "onChange"], a_ = { class: "checkbox-label" }, l_ = {
  key: 5,
  class: "radio-group"
}, c_ = ["name", "value", "required", "checked", "onChange"], u_ = { class: "radio-label" }, f_ = {
  key: 6,
  class: "field-error"
}, h_ = { class: "form-actions" }, d_ = ["disabled"], p_ = {
  key: 0,
  class: "loading-spinner-inline"
}, g_ = { key: 1 }, m_ = { class: "header-content" }, __ = ["src", "alt"], y_ = { class: "header-info" }, v_ = { class: "status" }, b_ = { class: "status-text cm-presence" }, w_ = { class: "header-actions" }, k_ = ["disabled", "title", "aria-label", "aria-expanded"], x_ = { class: "ask-anything-header" }, T_ = ["src", "alt"], A_ = { class: "header-info" }, E_ = {
  key: 2,
  class: "loading-history"
}, S_ = { class: "cm-email-gate-title" }, C_ = ["disabled"], R_ = {
  key: 0,
  class: "cm-email-gate-error"
}, I_ = ["disabled"], L_ = {
  key: 0,
  class: "cm-welcome-block"
}, O_ = { class: "message agent-message cm-welcome-row" }, N_ = ["src", "alt"], M_ = {
  key: 0,
  class: "cm-msg-avatar",
  "aria-hidden": "true"
}, P_ = ["src"], F_ = ["src"], D_ = { class: "message-col" }, B_ = {
  key: 0,
  class: "rating-content"
}, $_ = { class: "rating-prompt" }, U_ = ["onMouseover", "onMouseleave", "onClick", "disabled"], z_ = {
  key: 0,
  class: "feedback-wrapper"
}, H_ = { class: "feedback-section" }, W_ = ["onUpdate:modelValue", "disabled"], q_ = { class: "feedback-counter" }, j_ = ["onClick", "disabled"], V_ = {
  key: 1,
  class: "submitted-feedback-wrapper"
}, K_ = { class: "submitted-feedback" }, G_ = { class: "submitted-feedback-text" }, Y_ = {
  key: 2,
  class: "submitted-message"
}, X_ = {
  key: 1,
  class: "form-content"
}, Z_ = {
  key: 0,
  class: "form-header"
}, J_ = {
  key: 0,
  class: "form-title"
}, Q_ = {
  key: 1,
  class: "form-description"
}, ey = { class: "form-fields" }, ty = ["for"], ny = {
  key: 0,
  class: "required-indicator"
}, sy = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "disabled", "autocomplete", "inputmode"], ry = ["id", "placeholder", "required", "min", "max", "value", "onInput", "disabled"], iy = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "disabled"], oy = ["id", "required", "value", "onChange", "disabled"], ay = { value: "" }, ly = ["value"], cy = {
  key: 4,
  class: "checkbox-field"
}, uy = ["id", "checked", "onChange", "disabled"], fy = ["for"], hy = {
  key: 5,
  class: "radio-field"
}, dy = ["id", "name", "value", "checked", "onChange", "disabled"], py = ["for"], gy = {
  key: 6,
  class: "field-error"
}, my = { class: "form-actions" }, _y = ["onClick", "disabled"], yy = {
  key: 2,
  class: "user-input-content"
}, vy = {
  key: 0,
  class: "user-input-prompt"
}, by = {
  key: 1,
  class: "user-input-form"
}, wy = ["onUpdate:modelValue", "onKeydown"], ky = ["onClick", "disabled"], xy = {
  key: 2,
  class: "user-input-submitted"
}, Ty = {
  key: 0,
  class: "user-input-confirmation"
}, Ay = {
  key: 3,
  class: "product-message-container"
}, Ey = ["innerHTML"], Sy = {
  key: 1,
  class: "products-carousel"
}, Cy = { class: "carousel-items" }, Ry = {
  key: 0,
  class: "product-image-compact"
}, Iy = ["src", "alt"], Ly = { class: "product-info-compact" }, Oy = { class: "product-text-area" }, Ny = { class: "product-title-compact" }, My = {
  key: 0,
  class: "product-variant-compact"
}, Py = { class: "product-price-compact" }, Fy = { class: "product-actions-compact" }, Dy = ["onClick"], By = {
  key: 2,
  class: "no-products-message"
}, $y = {
  key: 3,
  class: "no-products-message"
}, Uy = ["innerHTML"], zy = ["innerHTML"], Hy = {
  key: 2,
  class: "message-attachments"
}, Wy = {
  key: 0,
  class: "attachment-image-container"
}, qy = ["src", "alt", "onClick"], jy = { class: "attachment-image-info" }, Vy = ["href"], Ky = { class: "attachment-size" }, Gy = ["href"], Yy = { class: "attachment-size" }, Xy = {
  key: 0,
  class: "citation-chips"
}, Zy = ["title"], Jy = { class: "message-info" }, Qy = {
  key: 0,
  class: "agent-name"
}, ev = {
  key: 5,
  class: "cm-quick-actions-bar"
}, tv = ["disabled", "onClick"], nv = {
  key: 0,
  class: "file-previews-widget"
}, sv = {
  class: "file-preview-content-widget",
  style: { cursor: "pointer" }
}, rv = ["src", "alt", "onClick"], iv = ["onClick"], ov = { class: "file-preview-info-widget" }, av = { class: "file-preview-name-widget" }, lv = { class: "file-preview-size-widget" }, cv = ["onClick"], uv = {
  key: 1,
  class: "upload-progress-widget"
}, fv = { class: "message-input" }, hv = ["placeholder", "disabled"], dv = ["disabled", "title"], pv = ["disabled"], gv = {
  key: 7,
  class: "new-conversation-section"
}, mv = { class: "conversation-ended-message" }, _v = {
  key: 8,
  class: "rating-dialog"
}, yv = { class: "rating-content" }, vv = { class: "star-rating" }, bv = ["onClick"], wv = { class: "rating-actions" }, kv = ["disabled"], xv = {
  key: 0,
  class: "preview-modal-image-container"
}, Tv = ["src", "alt"], Av = { class: "preview-modal-filename" }, Ev = {
  key: 3,
  class: "widget-loading"
}, xl = 3, Sv = "image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls", Cv = /* @__PURE__ */ So({
  __name: "WidgetBuilder",
  props: {
    widgetId: {},
    token: {},
    initialAuthError: {}
  },
  setup(e) {
    const t = e, n = ce(() => {
      var h;
      return t.widgetId || ((h = window.__INITIAL_DATA__) == null ? void 0 : h.widgetId);
    }), {
      customization: s,
      agentName: r,
      applyCustomization: i,
      initializeFromData: o
    } = Qg(), { formatCurrency: a } = bm(), {
      messages: l,
      loading: d,
      errorMessage: c,
      showError: b,
      loadingHistory: w,
      hasStartedChat: D,
      connectionStatus: L,
      sendMessage: W,
      endChat: F,
      loadChatHistory: se,
      connect: ie,
      reconnect: oe,
      cleanup: T,
      humanAgent: O,
      onTakeover: V,
      submitRating: K,
      submitForm: xe,
      currentForm: ze,
      getWorkflowState: Ke,
      proceedWorkflow: Ae,
      onWorkflowState: me,
      onWorkflowProceeded: Xe,
      currentSessionId: et,
      setToken: st,
      setWidgetId: ue,
      onSessionState: de
    } = Kg(), { displayText: ae, isStreaming: rt } = nm(l, () => Zn(() => zn()));
    sm(l);
    const be = re(""), _e = re(!0), Te = re(""), Ie = re(!1), Lt = (h) => {
      const g = h.target;
      be.value = g.value;
    };
    let Le = null;
    const it = () => {
      Le && Le.disconnect(), Le = new MutationObserver((g) => {
        let u = !1, Q = !1;
        g.forEach((ve) => {
          if (ve.type === "childList") {
            const fe = Array.from(ve.addedNodes).some(
              (Ce) => {
                var Vt;
                return Ce.nodeType === Node.ELEMENT_NODE && (Ce.matches("input, textarea") || ((Vt = Ce.querySelector) == null ? void 0 : Vt.call(Ce, "input, textarea")));
              }
            ), Ye = Array.from(ve.removedNodes).some(
              (Ce) => {
                var Vt;
                return Ce.nodeType === Node.ELEMENT_NODE && (Ce.matches("input, textarea") || ((Vt = Ce.querySelector) == null ? void 0 : Vt.call(Ce, "input, textarea")));
              }
            );
            fe && (Q = !0, u = !0), Ye && (u = !0);
          }
        }), u && (clearTimeout(it.timeoutId), it.timeoutId = setTimeout(() => {
          dt();
        }, Q ? 50 : 100));
      });
      const h = document.querySelector(".widget-container") || document.body;
      Le.observe(h, {
        childList: !0,
        subtree: !0
      });
    };
    it.timeoutId = null;
    let ht = [];
    const dt = () => {
      mt();
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
      let g = [];
      for (const u of h) {
        const Q = document.querySelectorAll(u);
        if (Q.length > 0) {
          g = Array.from(Q);
          break;
        }
      }
      g.length !== 0 && (ht = g, g.forEach((u) => {
        u.addEventListener("input", Ot, !0), u.addEventListener("keyup", Ot, !0), u.addEventListener("change", Ot, !0), u.addEventListener("keypress", m, !0), u.addEventListener("keydown", p, !0);
      }));
    }, mt = () => {
      ht.forEach((h) => {
        h.removeEventListener("input", Ot), h.removeEventListener("keyup", Ot), h.removeEventListener("change", Ot), h.removeEventListener("keypress", m), h.removeEventListener("keydown", p);
      }), ht = [];
    }, _t = (h) => !!(h && h.closest && h.closest(".form-message, .form-fullscreen, .cm-email-gate")), Ot = (h) => {
      if (_t(h.target)) return;
      const g = h.target;
      be.value = g.value;
    }, m = (h) => {
      _t(h.target) || h.key === "Enter" && !h.shiftKey && (h.preventDefault(), h.stopPropagation(), Jt());
    }, p = (h) => {
      _t(h.target) || h.key === "Enter" && !h.shiftKey && (h.preventDefault(), h.stopPropagation(), Jt());
    }, x = (h) => {
      const g = h.target, u = document.querySelector(".header-menu-container");
      document.querySelector(".header-menu-btn");
      const Q = document.querySelector(".header-dropdown-menu");
      Q && !(u != null && u.contains(g)) && (Q.style.display = "none");
    }, C = re(!0), {
      token: I,
      start: k,
      stop: H,
      setToken: $,
      ensureFresh: U
    } = lm({
      onTokenChanged: (h) => {
        window.parent.postMessage({ type: "TOKEN_UPDATE", token: h }, "*"), st(h);
      },
      onIdentityExpired: () => {
        Xo();
      }
    });
    ce(() => !!I.value);
    const P = re(null), G = re(!1), q = re(!1);
    t.initialAuthError && (P.value = t.initialAuthError, G.value = !0, C.value = !1), o();
    const j = window.__INITIAL_DATA__;
    k((j == null ? void 0 : j.widgetId) || "", j == null ? void 0 : j.initialToken), I.value && (Ie.value = !0);
    const te = re(!1);
    (j == null ? void 0 : j.allowAttachments) !== void 0 && (te.value = j.allowAttachments);
    const le = re(null), {
      chatStyles: Ee,
      chatIconStyles: Se,
      agentBubbleStyles: nt,
      userBubbleStyles: Oe,
      messageNameStyles: Ze,
      headerBorderStyles: f,
      photoUrl: _,
      shadowStyle: N
    } = Xp(s), S = re(null), {
      uploadedAttachments: B,
      previewModal: X,
      previewFile: J,
      formatFileSize: ye,
      isImageAttachment: Ne,
      getDownloadUrl: Ve,
      getPreviewUrl: De,
      handleFileSelect: lt,
      handleDrop: yt,
      handleDragOver: Ge,
      handleDragLeave: qt,
      handlePaste: nr,
      removeAttachment: sr,
      openPreview: $n,
      closePreview: Un,
      openFilePicker: ms,
      isImage: rr
    } = Qp(I, S);
    ce(() => l.value.some(
      (h) => h.message_type === "form" && (!h.isSubmitted || h.isSubmitted === !1)
    ));
    const ct = ce(() => {
      var h;
      return D.value && Ie.value || !gi.value ? L.value === "connected" && !d.value : Ss(Te.value.trim()) && L.value === "connected" && !d.value || ((h = window.__INITIAL_DATA__) == null ? void 0 : h.workflow);
    }), Zt = ce(() => L.value === "connected" ? Bt.value ? "Ask me anything..." : "Type a message..." : "Connecting..."), Jt = async () => {
      if (!be.value.trim() && B.value.length === 0) return;
      !D.value && Te.value && await kt();
      const h = B.value.map((u) => ({
        content: u.content,
        // base64 content
        filename: u.filename,
        content_type: u.type,
        size: u.size
      }));
      await W(be.value, Te.value, h), B.value.forEach((u) => {
        u.url && u.url.startsWith("blob:") && URL.revokeObjectURL(u.url), u.file_url && u.file_url.startsWith("blob:") && URL.revokeObjectURL(u.file_url);
      }), be.value = "", B.value = [];
      const g = document.querySelector('input[placeholder*="Type a message"]');
      g && (g.value = ""), setTimeout(() => {
        dt();
      }, 500);
    }, _s = (h) => {
      ct.value && (be.value = h, Jt());
    }, wn = () => {
      window.parent.postMessage({ type: "WIDGET_MINIMIZE" }, "*");
    }, ys = (h) => {
      h.key === "Enter" && !h.shiftKey && (h.preventDefault(), h.stopPropagation(), Jt());
    }, kt = async () => {
      var h, g, u, Q;
      try {
        if (!n.value)
          return console.error("Widget ID is not available"), P.value = "Widget ID is not available. Please refresh and try again.", G.value = !0, !1;
        await U(n.value);
        const ve = new URL(`${ps.API_URL}/widgets/${n.value}`);
        Te.value.trim() && Ss(Te.value.trim()) && ve.searchParams.append("email", Te.value.trim());
        const fe = {
          Accept: "application/json",
          "Content-Type": "application/json"
        };
        I.value && (fe.Authorization = `Bearer ${I.value}`);
        const Ye = await fetch(ve, {
          headers: fe
        });
        if (Ye.status === 401) {
          Ie.value = !1;
          try {
            const Cn = (await Ye.json()).detail;
            if ((Cn == null ? void 0 : Cn.code) === rm)
              return Xo(), !1;
            const ns = typeof Cn == "string" ? Cn : "";
            (ns.includes("generate-token") || ns.includes("API key") || ns.includes("Token required")) && (q.value = !0, P.value = "Widget authentication not configured. Please contact the website administrator.", G.value = !0, $(null));
          } catch {
            P.value = "Authentication required. Your token has expired or is invalid. Please refresh the page.", G.value = !0, $(null);
          }
          return !1;
        }
        if (!Ye.ok) {
          try {
            const xs = await Ye.json();
            P.value = xs.detail || `Error: ${Ye.statusText}`;
          } catch {
            P.value = `Error: ${Ye.statusText}. Please try again.`;
          }
          return G.value = !0, !1;
        }
        const Ce = await Ye.json();
        return Ce.token && $(Ce.token), Ie.value = !0, P.value = null, G.value = !1, st(I.value || void 0), await ie() ? (await ir(), (h = Ce.agent) != null && h.customization && i(Ce.agent.customization), Ce.agent && !(Ce != null && Ce.human_agent) && (r.value = Ce.agent.name), Ce != null && Ce.human_agent && (O.value = Ce.human_agent), ((g = Ce.agent) == null ? void 0 : g.allow_attachments) !== void 0 && (te.value = Ce.agent.allow_attachments), ((u = Ce.agent) == null ? void 0 : u.workflow) !== void 0 && (window.__INITIAL_DATA__ = window.__INITIAL_DATA__ || {}, window.__INITIAL_DATA__.workflow = Ce.agent.workflow), (Q = Ce.agent) != null && Q.workflow && await Ke(), !0) : (console.error("Failed to connect to chat service"), P.value = "Failed to connect to chat service. Please try again.", G.value = !0, !1);
      } catch (ve) {
        return console.error("Error checking authorization:", ve), P.value = "An unexpected error occurred. Please try again.", G.value = !0, Ie.value = !1, !1;
      } finally {
        C.value = !1;
      }
    }, ir = async () => {
      !D.value && Ie.value && (D.value = !0, await se());
    }, zn = () => {
      le.value && (le.value.scrollTop = le.value.scrollHeight);
    };
    Pt(() => l.value, (h) => {
      Zn(() => {
        zn();
      });
    }, { deep: !0 }), Pt(L, (h, g) => {
      h === "connected" && g !== "connected" && setTimeout(dt, 100);
    }), Pt(() => l.value.length, (h, g) => {
      h > 0 && g === 0 && setTimeout(dt, 100);
    });
    let vs = null;
    Pt(() => l.value, (h) => {
      const g = h[h.length - 1];
      !cl(g) || g === vs || (vs = g, au(g));
    }, { deep: !0 });
    const or = async () => {
      await oe() && await kt();
    }, ar = re(!1), ee = re(0), y = re(""), z = re(0), Y = re(!1), pe = re({}), Pe = re(!1), we = re({}), at = re(!1), xt = re(null), kn = re("Start Chat"), jt = re(!1), Fe = re(null);
    ce(() => {
      var g;
      const h = l.value[l.value.length - 1];
      return ((g = h == null ? void 0 : h.attributes) == null ? void 0 : g.request_rating) || !1;
    });
    const xn = ce(() => {
      var g;
      if (!((g = window.__INITIAL_DATA__) != null && g.workflow))
        return !1;
      const h = l.value.find((u) => u.message_type === "rating");
      return (h == null ? void 0 : h.isSubmitted) === !0;
    }), Qt = ce(
      () => Vr(O.value.human_agent_profile_pic)
    ), au = async (h) => {
      var g, u, Q, ve, fe;
      if (cl(h)) {
        try {
          if (h.session_id && I.value && n.value) {
            const Ye = new URL(`${ps.API_URL}/widgets/${n.value}/end-chat`);
            Ye.searchParams.append("session_id", h.session_id), (g = h.attributes) != null && g.end_chat_reason && Ye.searchParams.append("reason", h.attributes.end_chat_reason), (u = h.attributes) != null && u.end_chat_description && Ye.searchParams.append("description", h.attributes.end_chat_description);
            const Ce = await fetch(Ye, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${I.value}`,
                "Content-Type": "application/json"
              }
            });
            if (Ce.ok) {
              const Vt = await Ce.json();
              console.info(`✓ Chat session closed on backend: ${Vt.session_id}`);
            } else
              console.warn(`Failed to close session on backend: ${Ce.status}`);
          }
        } catch (Ye) {
          console.error("Error calling end-chat API:", Ye);
        }
        if ((Q = h.attributes) != null && Q.end_chat && ((ve = h.attributes) != null && ve.request_rating)) {
          const Ye = h.agent_name || ((fe = O.value) == null ? void 0 : fe.human_agent_name) || r.value || "our agent";
          l.value.push({
            message: `Rate the chat session that you had with ${Ye}`,
            message_type: "rating",
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            session_id: h.session_id,
            agent_name: Ye,
            showFeedback: !1
          }), et.value = h.session_id;
        }
      }
    }, lu = (h) => {
      Y.value || (z.value = h);
    }, cu = () => {
      if (!Y.value) {
        const h = l.value[l.value.length - 1];
        z.value = (h == null ? void 0 : h.selectedRating) || 0;
      }
    }, uu = async (h) => {
      if (!Y.value) {
        z.value = h;
        const g = l.value[l.value.length - 1];
        g && g.message_type === "rating" && (g.showFeedback = !0, g.selectedRating = h);
      }
    }, fu = async (h, g, u = null) => {
      try {
        Y.value = !0, await K(g, u);
        const Q = l.value.find((ve) => ve.message_type === "rating");
        Q && (Q.isSubmitted = !0, Q.finalRating = g, Q.finalFeedback = u);
      } catch (Q) {
        console.error("Failed to submit rating:", Q);
      } finally {
        Y.value = !1;
      }
    }, hu = (h) => {
      const g = {};
      for (const u of h.fields) {
        const Q = pe.value[u.name], ve = ci(u, Q);
        ve && (g[u.name] = ve);
      }
      return we.value = g, Object.keys(g).length === 0;
    }, du = async (h) => {
      if (!(Pe.value || !hu(h)))
        try {
          Pe.value = !0, await xe(pe.value);
          const u = l.value.findIndex(
            (Q) => Q.message_type === "form" && (!Q.isSubmitted || Q.isSubmitted === !1)
          );
          u !== -1 && l.value.splice(u, 1), pe.value = {}, we.value = {};
        } catch (u) {
          console.error("Failed to submit form:", u);
        } finally {
          Pe.value = !1;
        }
    }, Nt = (h, g) => {
      var u, Q;
      if (pe.value[h] = g, g && g.toString().trim() !== "") {
        let ve = null;
        if ((u = Fe.value) != null && u.fields && (ve = Fe.value.fields.find((fe) => fe.name === h)), !ve && ((Q = ze.value) != null && Q.fields) && (ve = ze.value.fields.find((fe) => fe.name === h)), ve) {
          const fe = ci(ve, g);
          fe ? (we.value[h] = fe, console.log(`Validation error for ${h}:`, fe)) : delete we.value[h];
        }
      } else
        delete we.value[h], console.log(`Cleared error for ${h}`);
    }, pu = (h) => {
      const g = h.replace(/\D/g, "");
      return g.length >= 7 && g.length <= 15;
    }, ci = (h, g) => {
      if (h.required && (!g || g.toString().trim() === ""))
        return `${h.label} is required`;
      if (!g || g.toString().trim() === "")
        return null;
      if (h.type === "email" && !Ss(g))
        return "Please enter a valid email address";
      if (h.type === "tel" && !pu(g))
        return "Please enter a valid phone number";
      if ((h.type === "text" || h.type === "textarea") && h.minLength && g.length < h.minLength)
        return `${h.label} must be at least ${h.minLength} characters`;
      if ((h.type === "text" || h.type === "textarea") && h.maxLength && g.length > h.maxLength)
        return `${h.label} must not exceed ${h.maxLength} characters`;
      if (h.type === "number") {
        const u = parseFloat(g);
        if (isNaN(u))
          return `${h.label} must be a valid number`;
        if (h.minLength && u < h.minLength)
          return `${h.label} must be at least ${h.minLength}`;
        if (h.maxLength && u > h.maxLength)
          return `${h.label} must not exceed ${h.maxLength}`;
      }
      return null;
    }, gu = async () => {
      if (!(Pe.value || !Fe.value))
        try {
          Pe.value = !0, we.value = {};
          let h = !1;
          for (const g of Fe.value.fields || []) {
            const u = pe.value[g.name], Q = ci(g, u);
            Q && (we.value[g.name] = Q, h = !0, console.log(`Validation error for field ${g.name}:`, Q));
          }
          if (h) {
            Pe.value = !1, console.log("Validation failed, not submitting");
            return;
          }
          await xe(pe.value), jt.value = !1, Fe.value = null, pe.value = {};
        } catch (h) {
          console.error("Failed to submit full screen form:", h);
        } finally {
          Pe.value = !1, console.log("Full screen form submission completed");
        }
    }, mu = (h, g) => {
      if (console.log("handleViewDetails called with:", { product: h, shopDomain: g }), !h) {
        console.error("No product provided to handleViewDetails");
        return;
      }
      let u = null;
      if (h.handle && g)
        u = `https://${g}/products/${h.handle}`;
      else if (h.id && g)
        u = `https://${g}/products/${h.id}`;
      else if (g) {
        if (!h.handle && !h.id) {
          console.error("Product handle and ID are both missing! Product:", h), alert("Unable to open product: Product information incomplete.");
          return;
        }
      } else {
        console.error("Shop domain is missing! Product:", h), alert("Unable to open product: Shop domain not available. Please contact support.");
        return;
      }
      u && (console.log("Opening product URL:", u), window.open(u, "_blank"));
    }, _u = (h) => {
      if (!h) return "";
      let g = h.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "");
      const u = [];
      return g = g.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (Q, ve, fe) => {
        const Ye = `__MARKDOWN_LINK_${u.length}__`;
        return console.log("Found markdown link:", Q, "-> placeholder:", Ye), u.push(Q), Ye;
      }), console.log("After replacing markdown links with placeholders:", g), console.log("Markdown links array:", u), g = g.replace(/https?:\/\/[^\s\)]+/g, "[link removed]"), console.log("After removing standalone URLs:", g), u.forEach((Q, ve) => {
        g = g.replace(`__MARKDOWN_LINK_${ve}__`, Q), console.log(`Restored markdown link ${ve}:`, Q);
      }), g = g.replace(/\n\s*\n\s*\n/g, `

`).trim(), g;
    }, Go = re(!1);
    re(!1);
    const ui = ce(() => {
      var h;
      return !!((h = O.value) != null && h.human_agent_name);
    }), Yo = ce(() => {
      var h;
      return Gp((h = window.__INITIAL_DATA__) == null ? void 0 : h.presence, ui.value);
    }), yu = ce(() => te.value && ui.value && B.value.length < xl), vu = async () => {
      try {
        at.value = !1, xt.value = null, await Ae();
      } catch (h) {
        console.error("Failed to proceed workflow:", h);
      }
    }, fi = async (h) => {
      try {
        if (!h.userInputValue || !h.userInputValue.trim())
          return;
        const g = h.userInputValue.trim();
        h.isSubmitted = !0, h.submittedValue = g, await W(g, Te.value);
      } catch (g) {
        console.error("Failed to submit user input:", g), h.isSubmitted = !1, h.submittedValue = null;
      }
    }, Xo = () => {
      window.parent.postMessage({ type: "IDENTITY_EXPIRED" }, "*");
    }, bu = async () => {
      I.value && ($(null), await bs());
    }, wu = async (h) => {
      const g = hs(h);
      !g || g === I.value || ($(g), await bs());
    }, bs = async () => {
      var h, g, u;
      try {
        let Q = 0;
        const ve = 50;
        for (; !((h = window.__INITIAL_DATA__) != null && h.widgetId) && Q < ve; )
          await new Promise((Ye) => setTimeout(Ye, 100)), Q++;
        return (g = window.__INITIAL_DATA__) != null && g.widgetId ? (ue(window.__INITIAL_DATA__.widgetId), await kt() ? ((u = window.__INITIAL_DATA__) != null && u.workflow && Ie.value && await Ke(), !0) : (L.value = "connected", !1)) : (console.error("Widget data not available after waiting"), !1);
      } catch (Q) {
        return console.error("Failed to initialize widget:", Q), !1;
      }
    };
    window.addEventListener("message", (h) => {
      h.source === window.parent && (!h.data || typeof h.data.type != "string" || (h.data.type === "SCROLL_TO_BOTTOM" && zn(), h.data.type === "IDENTITY_UNAVAILABLE" && bu(), h.data.type === "TOKEN_REFRESH" && wu(h.data.token), h.data.type === "WIDGET_VISIBILITY" && (oa.value = !!h.data.open), h.data.type === "WIDGET_DISPLAY" && (mi.value = {
        mode: h.data.mode,
        width: h.data.width,
        height: h.data.height,
        hotkey: h.data.hotkey
      }), h.data.type === "PREFILL_MESSAGE" && typeof h.data.text == "string" && (be.value = h.data.text.slice(0, 2e3), Zn(() => {
        const g = document.querySelector(
          ".message-input input, .welcome-message-field"
        );
        g == null || g.focus();
      }))));
    });
    const ku = () => {
      V(async () => {
        await kt();
      }), de(({ session_id: h, authenticated: g, created: u }) => {
        window.parent.postMessage({
          type: "CHAT_SESSION",
          sessionId: h,
          authenticated: g,
          created: u
        }, "*");
      }), me((h) => {
        var g;
        if (kn.value = h.button_text || "Start Chat", h.type === "landing_page")
          xt.value = h.landing_page_data, at.value = !0, jt.value = !1;
        else if (h.type === "form" || h.type === "display_form")
          if (((g = h.form_data) == null ? void 0 : g.form_full_screen) === !0)
            Fe.value = h.form_data, jt.value = !0, at.value = !1;
          else {
            const u = {
              message: "",
              message_type: "form",
              attributes: {
                form_data: h.form_data
              },
              created_at: (/* @__PURE__ */ new Date()).toISOString(),
              isSubmitted: !1
            };
            l.value.findIndex(
              (ve) => ve.message_type === "form" && !ve.isSubmitted
            ) === -1 && l.value.push(u), at.value = !1, jt.value = !1;
          }
        else
          at.value = !1, jt.value = !1;
      }), Xe((h) => {
        console.log("Workflow proceeded:", h);
      });
    }, xu = async () => {
      try {
        await bs(), await Ke();
      } catch (h) {
        throw console.error("Failed to start new conversation:", h), h;
      }
    }, lr = ce(
      () => {
        var h;
        return s.value.allow_new_chat === !0 && l.value.length > 0 && !((h = O.value) != null && h.human_agent_name) && !Wn.value;
      }
    ), Tn = re(!1), An = re(""), En = re(!1);
    let Hn = null;
    const es = () => {
      En.value = !1, An.value = "", Hn && (clearTimeout(Hn), Hn = null);
    }, Zo = () => {
      if (!Tn.value) {
        if (En.value) {
          es();
          return;
        }
        En.value = !0, An.value = "", Hn = setTimeout(es, mp);
      }
    };
    Pt(lr, (h) => {
      h || es();
    });
    const Jo = async () => {
      Tn.value || (Hn && (clearTimeout(Hn), Hn = null), await Tu(), An.value || (En.value = !1));
    }, Tu = async () => {
      if (!Tn.value) {
        Tn.value = !0, An.value = "";
        try {
          if (!await F()) {
            An.value = ll;
            return;
          }
          O.value = {}, be.value = "", B.value = [], await bs();
        } catch (h) {
          console.error("Failed to start a new chat:", h), An.value = ll;
        } finally {
          Tn.value = !1;
        }
      }
    }, Au = async () => {
      xn.value = !1, l.value = [], O.value = {}, await xu();
    };
    ti(async () => {
      await bs(), ku(), it(), document.addEventListener("click", x), (() => {
        const g = l.value.length > 0, u = L.value === "connected", Q = document.querySelector('input[type="text"], textarea') !== null;
        return g || u || Q;
      })() && setTimeout(dt, 100);
    }), Qs(() => {
      window.removeEventListener("message", (h) => {
        h.data.type === "SCROLL_TO_BOTTOM" && zn();
      }), document.removeEventListener("click", x), Le && (Le.disconnect(), Le = null), it.timeoutId && (clearTimeout(it.timeoutId), it.timeoutId = null), mt(), H(), es(), T();
    });
    const ts = ce(() => s.value.chat_style === "AURORA"), Bt = ce(() => s.value.chat_style === "ASK_ANYTHING" || ts.value), Qo = ce(() => s.value.customization_metadata), cr = ce(() => {
      var g;
      const h = (g = Qo.value) == null ? void 0 : g.avatar_style;
      return h === "orb" ? !0 : h === "photo" ? !1 : ts.value && !s.value.photo_url;
    }), ws = ce(() => {
      var h;
      return Vp(r.value || "", (h = Qo.value) == null ? void 0 : h.orb_variant);
    }), Eu = {
      GLASS: "theme-glass",
      TERMINAL: "theme-terminal",
      PLAYFUL: "theme-playful",
      CALM_MINT: "theme-calm",
      SUNRISE: "theme-sunrise"
    }, Su = ce(() => Eu[s.value.chat_style] || ""), Cu = ce(() => vm(s.value.chat_style, {
      chat_background_color: s.value.chat_background_color,
      chat_text_color: s.value.chat_text_color,
      accent_color: s.value.accent_color,
      font_family: s.value.font_family
    })), hi = ce(
      () => Array.isArray(s.value.quick_actions) ? s.value.quick_actions.filter((h) => !!h && h.trim().length > 0) : []
    ), ea = ce(() => (s.value.welcome_message || "").trim()), ta = ce(
      () => !Bt.value && l.value.length === 0 && !w.value && !Wn.value
    ), Ru = ce(
      () => ta.value && ea.value.length > 0
    ), Iu = ce(
      () => ta.value && !xn.value && hi.value.length > 0
    ), ur = ce(() => s.value.show_citations === !0), na = ce(() => Kp(s.value.show_ai_disclaimer, ui.value)), Lu = (h) => /^[0-9a-f]{16,}$/i.test(h) || /^[0-9a-f-]{32,}$/i.test(h), di = (h) => {
      const g = (h || "").trim().toLowerCase();
      return !g || g === "unknown" ? "Knowledge base" : g.charAt(0).toUpperCase() + g.slice(1);
    }, pi = (h) => {
      let g = ((h == null ? void 0 : h.name) || "").trim();
      return !g || (g = g.replace(/^[0-9a-f]{16,}[_-]/i, "").replace(/\.(pdf|txt|md|html?|docx?|csv|json)$/i, ""), !g || Lu(g)) ? di(h == null ? void 0 : h.type) : g;
    }, sa = (h) => {
      const g = pi(h), u = di(h == null ? void 0 : h.type);
      return g === u ? u : `${g} · ${u}`;
    }, gi = ce(() => s.value.collect_email === !0 && !Bt.value), ra = re(!1), Sn = re(""), ks = re(!1), Wn = ce(() => !D.value && gi.value && !ra.value), ia = async () => {
      const h = Te.value.trim();
      if (!h) {
        Sn.value = "Please enter your email address.";
        return;
      }
      if (!Ss(h)) {
        Sn.value = "Please enter a valid email address.";
        return;
      }
      Sn.value = "", ks.value = !0;
      try {
        await kt(), ra.value = !0;
      } catch {
        Sn.value = "Something went wrong. Please try again.";
      } finally {
        ks.value = !1;
      }
    }, mi = re(null), oa = re(!0), _i = { mode: "floating", width: 400, height: 560 }, fr = ce(
      () => {
        var h;
        return mi.value || ((h = s.value.customization_metadata) == null ? void 0 : h.widget_display) || null;
      }
    ), Ou = ce(() => {
      const h = fr.value;
      return h ? typeof h.mode == "string" && h.mode !== _i.mode || typeof h.width == "number" && h.width !== _i.width || typeof h.height == "number" && h.height !== _i.height : !1;
    }), Nu = ce(() => {
      var g;
      const h = {
        width: "100%",
        height: "100%",
        borderRadius: "var(--radius-lg)"
      };
      if (Ou.value) {
        const u = (g = fr.value) == null ? void 0 : g.mode;
        return u === "sidebar-left" || u === "sidebar-right" ? { ...h, borderRadius: "0" } : h;
      }
      return Bt.value ? window.innerWidth <= 768 ? {
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
    }), aa = ce(() => Bt.value && l.value.length === 0), Mu = ["form", "user_input", "rating", "product", "shopify_output"], Pu = ce(
      () => l.value.some(
        (h) => Mu.includes(h.message_type) || Array.isArray(h.attachments) && h.attachments.length > 0
      )
    ), Fu = ce(() => {
      var g, u;
      return Bt.value ? !0 : (((g = fr.value) == null ? void 0 : g.mode) === "ask-ai" || ((u = fr.value) == null ? void 0 : u.mode) === "search-bar") && !te.value;
    }), yi = ce(
      () => Fu.value && _e.value && !at.value && !jt.value && !Wn.value && !xn.value && !Pu.value
    );
    Pt(yi, (h) => {
      window.parent.postMessage({ type: "WIDGET_SURFACE", palette: h }, "*");
    }, { immediate: !0 });
    const Du = ce(
      () => s.value.welcome_subtitle || `Ask a question — ${r.value || "the assistant"} answers from what it knows.`
    ), Bu = ce(() => {
      var h;
      return ((h = mi.value) == null ? void 0 : h.hotkey) !== !1;
    });
    return (h, g) => G.value && q.value ? (A(), E("div", wm, [
      v("button", {
        type: "button",
        class: "cm-error-close",
        "aria-label": "Close chat",
        title: "Close",
        onClick: wn
      }, "×"),
      g[20] || (g[20] = Vn('<div class="widget-unavailable-card" data-v-7db5dd71><div class="widget-unavailable-icon-wrapper" data-v-7db5dd71><svg class="widget-unavailable-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-v-7db5dd71><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" data-v-7db5dd71></path><path d="M9 12l2 2 4-4" data-v-7db5dd71></path></svg></div><h2 class="widget-unavailable-title" data-v-7db5dd71>Chat Unavailable</h2><p class="widget-unavailable-message" data-v-7db5dd71> This chat widget is not currently configured. Please contact the website administrator to enable chat support. </p><div class="widget-unavailable-footer" data-v-7db5dd71><svg class="chattermate-logo-small" width="14" height="14" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-7db5dd71><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-7db5dd71></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-7db5dd71></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-7db5dd71></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-7db5dd71></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-7db5dd71><span class="cm-powered-prefix" data-v-7db5dd71>Powered by </span><strong class="cm-brand" data-v-7db5dd71>ChatterMate</strong></a></div></div>', 1))
    ])) : G.value ? (A(), E("div", km, [
      v("button", {
        type: "button",
        class: "cm-error-close",
        "aria-label": "Close chat",
        title: "Close",
        onClick: wn
      }, "×"),
      v("div", xm, [
        g[21] || (g[21] = Vn('<div class="auth-error-header" data-v-7db5dd71><svg class="auth-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-7db5dd71><circle cx="12" cy="12" r="10" data-v-7db5dd71></circle><line x1="12" y1="8" x2="12" y2="12" data-v-7db5dd71></line><line x1="12" y1="16" x2="12.01" y2="16" data-v-7db5dd71></line></svg><h2 data-v-7db5dd71>Authentication Error</h2></div>', 1)),
        v("p", Tm, Z(P.value), 1),
        v("button", {
          class: "auth-error-refresh-btn",
          onClick: g[0] || (g[0] = () => h.window.location.reload())
        }, " Refresh Page ")
      ])
    ])) : n.value && !G.value ? (A(), E("div", {
      key: 2,
      class: Be(["chat-container cm-surface", [{ collapsed: !_e.value, "ask-anything-style": Bt.value, aurora: ts.value }, Su.value]]),
      style: ke({ ...R(N), ...Nu.value, ...Cu.value })
    }, [
      C.value ? (A(), E("div", Am, g[22] || (g[22] = [
        Vn('<div class="loading-spinner" data-v-7db5dd71><div class="dot" data-v-7db5dd71></div><div class="dot" data-v-7db5dd71></div><div class="dot" data-v-7db5dd71></div></div><div class="loading-text" data-v-7db5dd71>Initializing chat...</div>', 2)
      ]))) : ne("", !0),
      !C.value && R(L) !== "connected" ? (A(), E("div", {
        key: 1,
        class: Be(["connection-status", R(L)])
      }, [
        R(L) === "connecting" ? (A(), E("div", Em, g[23] || (g[23] = [
          fn(" Connecting to chat service... ", -1),
          v("div", { class: "loading-dots" }, [
            v("div", { class: "dot" }),
            v("div", { class: "dot" }),
            v("div", { class: "dot" })
          ], -1)
        ]))) : R(L) === "failed" ? (A(), E("div", Sm, [
          g[24] || (g[24] = fn(" Connection failed. ", -1)),
          v("button", {
            onClick: or,
            class: "reconnect-button"
          }, " Click here to reconnect ")
        ])) : ne("", !0)
      ], 2)) : ne("", !0),
      R(b) ? (A(), E("div", {
        key: 2,
        class: "error-alert",
        style: ke(R(Se))
      }, Z(R(c)), 5)) : ne("", !0),
      yi.value ? (A(), $r(Wp, {
        key: 3,
        messages: R(l),
        draft: be.value,
        "agent-name": R(r),
        suggestions: hi.value,
        "welcome-title": R(s).welcome_title,
        "welcome-subtitle": Du.value,
        placeholder: Zt.value,
        "input-enabled": ct.value,
        loading: R(d),
        "show-citations": ur.value,
        disclaimer: na.value ? R(ul) : "",
        active: oa.value,
        hotkey: Bu.value,
        "can-start-new-chat": lr.value,
        "starting-new-chat": Tn.value,
        "new-chat-armed": En.value,
        "new-chat-error": An.value,
        onNewChat: Zo,
        onConfirmNewChat: Jo,
        onCancelNewChat: es,
        "citation-label": pi,
        "citation-tooltip": sa,
        "display-text": R(ae),
        "is-streaming": R(rt),
        "onUpdate:draft": g[1] || (g[1] = (u) => be.value = u),
        onSend: Jt,
        onAsk: _s,
        onClose: wn
      }, null, 8, ["messages", "draft", "agent-name", "suggestions", "welcome-title", "welcome-subtitle", "placeholder", "input-enabled", "loading", "show-citations", "disclaimer", "active", "hotkey", "can-start-new-chat", "starting-new-chat", "new-chat-armed", "new-chat-error", "display-text", "is-streaming"])) : aa.value ? (A(), E("div", {
        key: 4,
        class: Be(["welcome-message-section", { aurora: ts.value }]),
        style: ke(R(Ee))
      }, [
        v("div", Cm, [
          v("div", Rm, [
            cr.value ? (A(), E("div", {
              key: 0,
              class: "welcome-orb",
              style: ke(ws.value)
            }, null, 4)) : R(_) ? (A(), E("img", {
              key: 1,
              src: R(_),
              alt: R(r),
              class: "welcome-avatar"
            }, null, 8, Im)) : ne("", !0),
            v("h1", Lm, Z(R(s).welcome_title || `Welcome to ${R(r)}`), 1),
            v("p", Om, Z(R(s).welcome_subtitle || "I'm here to help you with anything you need. What can I assist you with today?"), 1)
          ])
        ]),
        v("div", Nm, [
          !R(D) && !Ie.value && gi.value ? (A(), E("div", Mm, [
            Rn(v("input", {
              "onUpdate:modelValue": g[2] || (g[2] = (u) => Te.value = u),
              type: "email",
              placeholder: "Enter your email address",
              disabled: R(d) || R(L) !== "connected",
              class: Be([{
                invalid: Te.value.trim() && !R(Ss)(Te.value.trim()),
                disabled: R(L) !== "connected"
              }, "welcome-email-input"])
            }, null, 10, Pm), [
              [Kn, Te.value]
            ])
          ])) : ne("", !0),
          v("div", Fm, [
            Rn(v("input", {
              "onUpdate:modelValue": g[3] || (g[3] = (u) => be.value = u),
              type: "text",
              placeholder: Zt.value,
              onKeypress: ys,
              onInput: Lt,
              onChange: Lt,
              disabled: !ct.value,
              class: Be([{ disabled: !ct.value }, "welcome-message-field"])
            }, null, 42, Dm), [
              [Kn, be.value]
            ]),
            v("button", {
              class: Be(["welcome-send-button", { "aurora-send": ts.value }]),
              style: ke(R(Oe)),
              onClick: Jt,
              disabled: !be.value.trim() || !ct.value
            }, [
              ts.value ? (A(), E("svg", $m, g[25] || (g[25] = [
                v("path", {
                  d: "M12 19V5M12 5L5 12M12 5L19 12",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                }, null, -1)
              ]))) : (A(), E("svg", Um, g[26] || (g[26] = [
                v("path", {
                  d: "M5 12L3 21L21 12L3 3L5 12ZM5 12L13 12",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                }, null, -1)
              ])))
            ], 14, Bm)
          ])
        ]),
        v("div", {
          class: "powered-by-welcome",
          style: ke(R(Ze))
        }, g[27] || (g[27] = [
          Vn('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-7db5dd71><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-7db5dd71></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-7db5dd71></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-7db5dd71></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-7db5dd71></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-7db5dd71><span class="cm-powered-prefix" data-v-7db5dd71>Powered by </span><strong class="cm-brand" data-v-7db5dd71>ChatterMate</strong></a>', 2)
        ]), 4)
      ], 6)) : ne("", !0),
      at.value && xt.value ? (A(), E("div", {
        key: 5,
        class: "landing-page-fullscreen",
        style: ke(R(Ee))
      }, [
        v("div", zm, [
          v("div", Hm, [
            v("h2", Wm, Z(xt.value.heading), 1),
            v("div", qm, Z(xt.value.content), 1)
          ]),
          v("div", jm, [
            v("button", {
              class: "landing-page-button",
              onClick: vu
            }, Z(kn.value), 1)
          ])
        ]),
        v("div", {
          class: "powered-by-landing",
          style: ke(R(Ze))
        }, g[28] || (g[28] = [
          Vn('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-7db5dd71><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-7db5dd71></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-7db5dd71></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-7db5dd71></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-7db5dd71></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-7db5dd71><span class="cm-powered-prefix" data-v-7db5dd71>Powered by </span><strong class="cm-brand" data-v-7db5dd71>ChatterMate</strong></a>', 2)
        ]), 4)
      ], 4)) : jt.value && Fe.value ? (A(), E("div", {
        key: 6,
        class: "form-fullscreen",
        style: ke(R(Ee))
      }, [
        v("div", Vm, [
          Fe.value.title || Fe.value.description ? (A(), E("div", Km, [
            Fe.value.title ? (A(), E("h2", Gm, Z(Fe.value.title), 1)) : ne("", !0),
            Fe.value.description ? (A(), E("p", Ym, Z(Fe.value.description), 1)) : ne("", !0)
          ])) : ne("", !0),
          v("div", Xm, [
            (A(!0), E($e, null, pt(Fe.value.fields, (u) => {
              var Q, ve;
              return A(), E("div", {
                key: u.name,
                class: "form-field"
              }, [
                v("label", {
                  for: `fullscreen-form-${u.name}`,
                  class: "field-label"
                }, [
                  fn(Z(u.label) + " ", 1),
                  u.required ? (A(), E("span", Jm, "*")) : ne("", !0)
                ], 8, Zm),
                u.type === "text" || u.type === "email" || u.type === "tel" ? (A(), E("input", {
                  key: 0,
                  id: `fullscreen-form-${u.name}`,
                  type: u.type,
                  placeholder: u.placeholder || "",
                  required: u.required,
                  minlength: u.minLength,
                  maxlength: u.maxLength,
                  value: pe.value[u.name] || "",
                  onInput: (fe) => Nt(u.name, fe.target.value),
                  onBlur: (fe) => Nt(u.name, fe.target.value),
                  class: Be(["form-input", { error: we.value[u.name] }]),
                  autocomplete: u.type === "email" ? "email" : u.type === "tel" ? "tel" : "off",
                  inputmode: u.type === "tel" ? "tel" : u.type === "email" ? "email" : "text"
                }, null, 42, Qm)) : u.type === "number" ? (A(), E("input", {
                  key: 1,
                  id: `fullscreen-form-${u.name}`,
                  type: "number",
                  placeholder: u.placeholder || "",
                  required: u.required,
                  min: u.minLength,
                  max: u.maxLength,
                  value: pe.value[u.name] || "",
                  onInput: (fe) => Nt(u.name, fe.target.value),
                  class: Be(["form-input", { error: we.value[u.name] }])
                }, null, 42, e_)) : u.type === "textarea" ? (A(), E("textarea", {
                  key: 2,
                  id: `fullscreen-form-${u.name}`,
                  placeholder: u.placeholder || "",
                  required: u.required,
                  minlength: u.minLength,
                  maxlength: u.maxLength,
                  value: pe.value[u.name] || "",
                  onInput: (fe) => Nt(u.name, fe.target.value),
                  class: Be(["form-textarea", { error: we.value[u.name] }]),
                  rows: "4"
                }, null, 42, t_)) : u.type === "select" ? (A(), E("select", {
                  key: 3,
                  id: `fullscreen-form-${u.name}`,
                  required: u.required,
                  value: pe.value[u.name] || "",
                  onChange: (fe) => Nt(u.name, fe.target.value),
                  class: Be(["form-select", { error: we.value[u.name] }])
                }, [
                  v("option", s_, Z(u.placeholder || "Please select..."), 1),
                  (A(!0), E($e, null, pt((Array.isArray(u.options) ? u.options : ((Q = u.options) == null ? void 0 : Q.split(`
`)) || []).filter((fe) => fe.trim()), (fe) => (A(), E("option", {
                    key: fe,
                    value: fe.trim()
                  }, Z(fe.trim()), 9, r_))), 128))
                ], 42, n_)) : u.type === "checkbox" ? (A(), E("label", i_, [
                  v("input", {
                    id: `fullscreen-form-${u.name}`,
                    type: "checkbox",
                    required: u.required,
                    checked: pe.value[u.name] || !1,
                    onChange: (fe) => Nt(u.name, fe.target.checked),
                    class: "form-checkbox"
                  }, null, 40, o_),
                  v("span", a_, Z(u.label), 1)
                ])) : u.type === "radio" ? (A(), E("div", l_, [
                  (A(!0), E($e, null, pt((Array.isArray(u.options) ? u.options : ((ve = u.options) == null ? void 0 : ve.split(`
`)) || []).filter((fe) => fe.trim()), (fe) => (A(), E("label", {
                    key: fe,
                    class: "radio-field"
                  }, [
                    v("input", {
                      type: "radio",
                      name: `fullscreen-form-${u.name}`,
                      value: fe.trim(),
                      required: u.required,
                      checked: pe.value[u.name] === fe.trim(),
                      onChange: (Ye) => Nt(u.name, fe.trim()),
                      class: "form-radio"
                    }, null, 40, c_),
                    v("span", u_, Z(fe.trim()), 1)
                  ]))), 128))
                ])) : ne("", !0),
                we.value[u.name] ? (A(), E("div", f_, Z(we.value[u.name]), 1)) : ne("", !0)
              ]);
            }), 128))
          ]),
          v("div", h_, [
            v("button", {
              onClick: g[4] || (g[4] = () => {
                console.log("Submit button clicked!"), gu();
              }),
              disabled: Pe.value,
              class: "submit-form-button",
              style: ke(R(Oe))
            }, [
              Pe.value ? (A(), E("span", p_, g[29] || (g[29] = [
                v("div", { class: "dot" }, null, -1),
                v("div", { class: "dot" }, null, -1),
                v("div", { class: "dot" }, null, -1)
              ]))) : (A(), E("span", g_, Z(Fe.value.submit_button_text || "Submit"), 1))
            ], 12, d_)
          ])
        ]),
        v("div", {
          class: "powered-by-landing",
          style: ke(R(Ze))
        }, g[30] || (g[30] = [
          Vn('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-7db5dd71><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-7db5dd71></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-7db5dd71></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-7db5dd71></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-7db5dd71></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-7db5dd71><span class="cm-powered-prefix" data-v-7db5dd71>Powered by </span><strong class="cm-brand" data-v-7db5dd71>ChatterMate</strong></a>', 2)
        ]), 4)
      ], 4)) : !aa.value && _e.value && !yi.value ? (A(), E("div", {
        key: 7,
        class: Be(["chat-panel", { "ask-anything-chat": Bt.value }]),
        style: ke(R(Ee))
      }, [
        Bt.value ? (A(), E("div", {
          key: 1,
          class: "ask-anything-top",
          style: ke(R(f))
        }, [
          v("div", x_, [
            Qt.value || R(_) ? (A(), E("img", {
              key: 0,
              src: Qt.value || R(_),
              alt: R(O).human_agent_name || R(r),
              class: "header-avatar"
            }, null, 8, T_)) : ne("", !0),
            v("div", A_, [
              v("h3", {
                style: ke(R(Ze))
              }, Z(R(r)), 5),
              v("p", {
                class: "ask-anything-subtitle",
                style: ke(R(Ze))
              }, Z(R(s).welcome_subtitle || "Ask me anything. I'm here to help."), 5)
            ])
          ])
        ], 4)) : (A(), E("div", {
          key: 0,
          class: "chat-header",
          style: ke(R(f))
        }, [
          v("div", {
            class: "cm-header-sheen",
            style: ke({ background: "linear-gradient(90deg, transparent, " + (R(s).accent_color || "#C9F24E") + ", transparent)" })
          }, null, 4),
          v("div", m_, [
            !Qt.value && (cr.value || !R(_)) ? (A(), E("div", {
              key: 0,
              class: "header-orb",
              style: ke(ws.value)
            }, null, 4)) : Qt.value || R(_) ? (A(), E("img", {
              key: 1,
              src: Qt.value || R(_),
              alt: R(O).human_agent_name || R(r),
              class: "header-avatar"
            }, null, 8, __)) : ne("", !0),
            v("div", y_, [
              v("h3", {
                style: ke(R(Ze))
              }, Z(R(O).human_agent_name || R(r)), 5),
              v("div", v_, [
                v("span", {
                  class: Be(["status-indicator", Yo.value.online ? "online" : "away"])
                }, null, 2),
                v("span", b_, Z(Yo.value.text), 1)
              ])
            ])
          ]),
          v("div", w_, [
            lr.value ? (A(), E("button", {
              key: 0,
              type: "button",
              class: Be(["header-new-chat", { armed: En.value }]),
              style: ke(R(Ze)),
              disabled: Tn.value,
              title: R(jr),
              "aria-label": R(jr),
              "aria-expanded": En.value,
              onClick: Zo
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
            ]), 14, k_)) : ne("", !0),
            v("button", {
              type: "button",
              class: "header-minimize",
              style: ke(R(Ze)),
              title: "Minimize",
              "aria-label": "Minimize chat",
              onClick: wn
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
        R(w) ? (A(), E("div", E_, g[33] || (g[33] = [
          v("div", { class: "loading-spinner" }, [
            v("div", { class: "dot" }),
            v("div", { class: "dot" }),
            v("div", { class: "dot" })
          ], -1)
        ]))) : ne("", !0),
        Wn.value ? (A(), E("div", {
          key: 3,
          class: "cm-email-gate",
          style: ke(R(Ee))
        }, [
          v("div", {
            class: "cm-email-gate-orb",
            style: ke(ws.value)
          }, null, 4),
          v("h3", S_, Z(R(s).welcome_title || "Before we start"), 1),
          g[34] || (g[34] = v("p", { class: "cm-email-gate-text" }, "Enter your email and we'll continue the chat.", -1)),
          Rn(v("input", {
            "onUpdate:modelValue": g[5] || (g[5] = (u) => Te.value = u),
            type: "email",
            inputmode: "email",
            autocomplete: "email",
            placeholder: "you@example.com",
            class: Be(["cm-email-gate-input", { invalid: !!Sn.value }]),
            disabled: ks.value,
            onKeyup: Ar(ia, ["enter"]),
            onInput: g[6] || (g[6] = (u) => Sn.value = "")
          }, null, 42, C_), [
            [Kn, Te.value]
          ]),
          Sn.value ? (A(), E("p", R_, Z(Sn.value), 1)) : ne("", !0),
          v("button", {
            type: "button",
            class: "cm-email-gate-btn",
            style: ke(R(Oe)),
            disabled: ks.value,
            onClick: ia
          }, Z(ks.value ? "Please wait…" : "Continue to chat"), 13, I_)
        ], 4)) : ne("", !0),
        En.value && lr.value ? (A(), $r(Wc, {
          key: 4,
          busy: Tn.value,
          error: An.value,
          onConfirm: Jo,
          onCancel: es
        }, null, 8, ["busy", "error"])) : ne("", !0),
        Rn(v("div", {
          class: "chat-messages",
          ref_key: "messagesContainer",
          ref: le
        }, [
          Ru.value ? (A(), E("div", L_, [
            v("div", O_, [
              cr.value || !R(_) ? (A(), E("div", {
                key: 0,
                class: "cm-welcome-orb",
                style: ke(ws.value)
              }, null, 4)) : (A(), E("img", {
                key: 1,
                src: R(_),
                alt: R(r),
                class: "cm-welcome-avatar"
              }, null, 8, N_)),
              v("div", {
                class: "message-bubble cm-welcome-bubble",
                style: ke(R(nt))
              }, Z(ea.value), 5)
            ])
          ])) : ne("", !0),
          (A(!0), E($e, null, pt(R(l), (u, Q) => {
            var ve, fe, Ye, Ce, Vt, xs, Cn, ns, la, ca, ua, fa, ha, da, pa, ga, ma, _a, ya;
            return A(), E("div", {
              key: Q,
              class: Be([
                "message",
                u.message_type === "bot" || u.message_type === "agent" ? "agent-message" : u.message_type === "system" ? "system-message" : u.message_type === "rating" ? "rating-message" : u.message_type === "form" ? "form-message" : u.message_type === "product" || u.shopify_output ? "product-message" : "user-message"
              ])
            }, [
              u.message_type === "bot" || u.message_type === "agent" ? (A(), E("div", M_, [
                Qt.value ? (A(), E("img", {
                  key: 0,
                  src: Qt.value,
                  class: "cm-msg-avatar-img",
                  alt: ""
                }, null, 8, P_)) : !cr.value && R(_) ? (A(), E("img", {
                  key: 1,
                  src: R(_),
                  class: "cm-msg-avatar-img",
                  alt: ""
                }, null, 8, F_)) : (A(), E("div", {
                  key: 2,
                  class: "cm-msg-avatar-orb",
                  style: ke(ws.value)
                }, null, 4))
              ])) : ne("", !0),
              v("div", D_, [
                v("div", {
                  class: "message-bubble",
                  style: ke(u.message_type === "system" || u.message_type === "rating" || u.message_type === "form" || u.message_type === "product" || u.shopify_output ? {} : u.message_type === "user" ? R(Oe) : R(nt))
                }, [
                  u.message_type === "rating" ? (A(), E("div", B_, [
                    v("p", $_, "Rate the chat session that you had with " + Z(u.agent_name || R(O).human_agent_name || R(r) || "our agent"), 1),
                    v("div", {
                      class: Be(["star-rating", { submitted: Y.value || u.isSubmitted }])
                    }, [
                      (A(), E($e, null, pt(5, (M) => v("button", {
                        key: M,
                        class: Be(["star-button", {
                          warning: M <= (u.isSubmitted ? u.finalRating : z.value || u.selectedRating) && (u.isSubmitted ? u.finalRating : z.value || u.selectedRating) <= 3,
                          success: M <= (u.isSubmitted ? u.finalRating : z.value || u.selectedRating) && (u.isSubmitted ? u.finalRating : z.value || u.selectedRating) > 3,
                          selected: M <= (u.isSubmitted ? u.finalRating : z.value || u.selectedRating)
                        }]),
                        onMouseover: (Kt) => !u.isSubmitted && lu(M),
                        onMouseleave: (Kt) => !u.isSubmitted && cu,
                        onClick: (Kt) => !u.isSubmitted && uu(M),
                        disabled: Y.value || u.isSubmitted
                      }, " ★ ", 42, U_)), 64))
                    ], 2),
                    u.showFeedback && !u.isSubmitted ? (A(), E("div", z_, [
                      v("div", H_, [
                        Rn(v("input", {
                          "onUpdate:modelValue": (M) => u.feedback = M,
                          placeholder: "Please share your feedback (optional)",
                          disabled: Y.value,
                          maxlength: "500",
                          class: "feedback-input"
                        }, null, 8, W_), [
                          [Kn, u.feedback]
                        ]),
                        v("div", q_, Z(((ve = u.feedback) == null ? void 0 : ve.length) || 0) + "/500", 1)
                      ]),
                      v("button", {
                        onClick: (M) => fu(u.session_id, z.value, u.feedback),
                        disabled: Y.value || !z.value,
                        class: "submit-rating-button",
                        style: ke({ backgroundColor: R(s).accent_color || "var(--accent-solid)" })
                      }, Z(Y.value ? "Submitting..." : "Submit Rating"), 13, j_)
                    ])) : ne("", !0),
                    u.isSubmitted && u.finalFeedback ? (A(), E("div", V_, [
                      v("div", K_, [
                        v("p", G_, Z(u.finalFeedback), 1)
                      ])
                    ])) : u.isSubmitted ? (A(), E("div", Y_, " Thank you for your rating! ")) : ne("", !0)
                  ])) : u.message_type === "form" ? (A(), E("div", X_, [
                    (Ye = (fe = u.attributes) == null ? void 0 : fe.form_data) != null && Ye.title || (Vt = (Ce = u.attributes) == null ? void 0 : Ce.form_data) != null && Vt.description ? (A(), E("div", Z_, [
                      (Cn = (xs = u.attributes) == null ? void 0 : xs.form_data) != null && Cn.title ? (A(), E("h3", J_, Z(u.attributes.form_data.title), 1)) : ne("", !0),
                      (la = (ns = u.attributes) == null ? void 0 : ns.form_data) != null && la.description ? (A(), E("p", Q_, Z(u.attributes.form_data.description), 1)) : ne("", !0)
                    ])) : ne("", !0),
                    v("div", ey, [
                      (A(!0), E($e, null, pt((ua = (ca = u.attributes) == null ? void 0 : ca.form_data) == null ? void 0 : ua.fields, (M) => {
                        var Kt, vi;
                        return A(), E("div", {
                          key: M.name,
                          class: "form-field"
                        }, [
                          v("label", {
                            for: `form-${M.name}`,
                            class: "field-label"
                          }, [
                            fn(Z(M.label) + " ", 1),
                            M.required ? (A(), E("span", ny, "*")) : ne("", !0)
                          ], 8, ty),
                          M.type === "text" || M.type === "email" || M.type === "tel" ? (A(), E("input", {
                            key: 0,
                            id: `form-${M.name}`,
                            type: M.type,
                            placeholder: M.placeholder || "",
                            required: M.required,
                            minlength: M.minLength,
                            maxlength: M.maxLength,
                            value: pe.value[M.name] || "",
                            onInput: (He) => Nt(M.name, He.target.value),
                            onBlur: (He) => Nt(M.name, He.target.value),
                            class: Be(["form-input", { error: we.value[M.name] }]),
                            disabled: Pe.value,
                            autocomplete: M.type === "email" ? "email" : M.type === "tel" ? "tel" : "off",
                            inputmode: M.type === "tel" ? "tel" : M.type === "email" ? "email" : "text"
                          }, null, 42, sy)) : M.type === "number" ? (A(), E("input", {
                            key: 1,
                            id: `form-${M.name}`,
                            type: "number",
                            placeholder: M.placeholder || "",
                            required: M.required,
                            min: M.min,
                            max: M.max,
                            value: pe.value[M.name] || "",
                            onInput: (He) => Nt(M.name, He.target.value),
                            class: Be(["form-input", { error: we.value[M.name] }]),
                            disabled: Pe.value
                          }, null, 42, ry)) : M.type === "textarea" ? (A(), E("textarea", {
                            key: 2,
                            id: `form-${M.name}`,
                            placeholder: M.placeholder || "",
                            required: M.required,
                            minlength: M.minLength,
                            maxlength: M.maxLength,
                            value: pe.value[M.name] || "",
                            onInput: (He) => Nt(M.name, He.target.value),
                            class: Be(["form-textarea", { error: we.value[M.name] }]),
                            disabled: Pe.value,
                            rows: "3"
                          }, null, 42, iy)) : M.type === "select" ? (A(), E("select", {
                            key: 3,
                            id: `form-${M.name}`,
                            required: M.required,
                            value: pe.value[M.name] || "",
                            onChange: (He) => Nt(M.name, He.target.value),
                            class: Be(["form-select", { error: we.value[M.name] }]),
                            disabled: Pe.value
                          }, [
                            v("option", ay, Z(M.placeholder || "Select an option"), 1),
                            (A(!0), E($e, null, pt((Array.isArray(M.options) ? M.options : ((Kt = M.options) == null ? void 0 : Kt.split(`
`)) || []).filter((He) => He.trim()), (He) => (A(), E("option", {
                              key: He.trim(),
                              value: He.trim()
                            }, Z(He.trim()), 9, ly))), 128))
                          ], 42, oy)) : M.type === "checkbox" ? (A(), E("div", cy, [
                            v("input", {
                              id: `form-${M.name}`,
                              type: "checkbox",
                              checked: pe.value[M.name] || !1,
                              onChange: (He) => Nt(M.name, He.target.checked),
                              class: "form-checkbox",
                              disabled: Pe.value
                            }, null, 40, uy),
                            v("label", {
                              for: `form-${M.name}`,
                              class: "checkbox-label"
                            }, Z(M.placeholder || M.label), 9, fy)
                          ])) : M.type === "radio" ? (A(), E("div", hy, [
                            (A(!0), E($e, null, pt((Array.isArray(M.options) ? M.options : ((vi = M.options) == null ? void 0 : vi.split(`
`)) || []).filter((He) => He.trim()), (He) => (A(), E("div", {
                              key: He.trim(),
                              class: "radio-option"
                            }, [
                              v("input", {
                                id: `form-${M.name}-${He.trim()}`,
                                name: `form-${M.name}`,
                                type: "radio",
                                value: He.trim(),
                                checked: pe.value[M.name] === He.trim(),
                                onChange: (Nv) => Nt(M.name, He.trim()),
                                class: "form-radio",
                                disabled: Pe.value
                              }, null, 40, dy),
                              v("label", {
                                for: `form-${M.name}-${He.trim()}`,
                                class: "radio-label"
                              }, Z(He.trim()), 9, py)
                            ]))), 128))
                          ])) : ne("", !0),
                          we.value[M.name] ? (A(), E("div", gy, Z(we.value[M.name]), 1)) : ne("", !0)
                        ]);
                      }), 128))
                    ]),
                    v("div", my, [
                      v("button", {
                        onClick: () => {
                          var M;
                          console.log("Regular form submit button clicked!"), du((M = u.attributes) == null ? void 0 : M.form_data);
                        },
                        disabled: Pe.value,
                        class: "form-submit-button",
                        style: ke(R(Oe))
                      }, Z(Pe.value ? "Submitting..." : ((ha = (fa = u.attributes) == null ? void 0 : fa.form_data) == null ? void 0 : ha.submit_button_text) || "Submit"), 13, _y)
                    ])
                  ])) : u.message_type === "user_input" ? (A(), E("div", yy, [
                    (da = u.attributes) != null && da.prompt_message && u.attributes.prompt_message.trim() ? (A(), E("div", vy, Z(u.attributes.prompt_message), 1)) : ne("", !0),
                    u.isSubmitted ? (A(), E("div", xy, [
                      g[35] || (g[35] = v("strong", null, "Your input:", -1)),
                      fn(" " + Z(u.submittedValue) + " ", 1),
                      (pa = u.attributes) != null && pa.confirmation_message && u.attributes.confirmation_message.trim() ? (A(), E("div", Ty, Z(u.attributes.confirmation_message), 1)) : ne("", !0)
                    ])) : (A(), E("div", by, [
                      Rn(v("textarea", {
                        "onUpdate:modelValue": (M) => u.userInputValue = M,
                        class: "user-input-textarea",
                        placeholder: "Type your message here...",
                        rows: "3",
                        onKeydown: [
                          Ar(Yn((M) => fi(u), ["ctrl"]), ["enter"]),
                          Ar(Yn((M) => fi(u), ["meta"]), ["enter"])
                        ]
                      }, null, 40, wy), [
                        [Kn, u.userInputValue]
                      ]),
                      v("button", {
                        class: "user-input-submit-button",
                        onClick: (M) => fi(u),
                        disabled: !u.userInputValue || !u.userInputValue.trim()
                      }, " Submit ", 8, ky)
                    ]))
                  ])) : u.shopify_output || u.message_type === "product" ? (A(), E("div", Ay, [
                    u.message ? (A(), E("div", {
                      key: 0,
                      innerHTML: R(Cr)(((ma = (ga = u.shopify_output) == null ? void 0 : ga.products) == null ? void 0 : ma.length) > 0 ? _u(u.message) : u.message),
                      class: "product-message-text"
                    }, null, 8, Ey)) : ne("", !0),
                    (_a = u.shopify_output) != null && _a.products && u.shopify_output.products.length > 0 ? (A(), E("div", Sy, [
                      g[37] || (g[37] = v("h3", { class: "carousel-title" }, "Products", -1)),
                      v("div", Cy, [
                        (A(!0), E($e, null, pt(u.shopify_output.products, (M) => {
                          var Kt;
                          return A(), E("div", {
                            key: M.id,
                            class: "product-card-compact carousel-item"
                          }, [
                            (Kt = M.image) != null && Kt.src ? (A(), E("div", Ry, [
                              v("img", {
                                src: M.image.src,
                                alt: M.title,
                                class: "product-thumbnail"
                              }, null, 8, Iy)
                            ])) : ne("", !0),
                            v("div", Ly, [
                              v("div", Oy, [
                                v("div", Ny, Z(M.title), 1),
                                M.variant_title && M.variant_title !== "Default Title" ? (A(), E("div", My, Z(M.variant_title), 1)) : ne("", !0),
                                v("div", Py, Z(M.price_formatted || R(a)(M.price, M.currency)), 1)
                              ]),
                              v("div", Fy, [
                                v("button", {
                                  class: "view-details-button-compact",
                                  onClick: (vi) => {
                                    var He;
                                    return mu(M, (He = u.shopify_output) == null ? void 0 : He.shop_domain);
                                  }
                                }, g[36] || (g[36] = [
                                  fn(" View product ", -1),
                                  v("span", { class: "external-link-icon" }, "↗", -1)
                                ]), 8, Dy)
                              ])
                            ])
                          ]);
                        }), 128))
                      ])
                    ])) : !u.message && ((ya = u.shopify_output) != null && ya.products) && u.shopify_output.products.length === 0 ? (A(), E("div", By, g[38] || (g[38] = [
                      v("p", null, "No products found.", -1)
                    ]))) : !u.message && u.shopify_output && !u.shopify_output.products ? (A(), E("div", $y, g[39] || (g[39] = [
                      v("p", null, "No products to display.", -1)
                    ]))) : ne("", !0)
                  ])) : (A(), E($e, { key: 4 }, [
                    R(rt)(Q) ? (A(), E("div", {
                      key: 0,
                      class: "message-streaming",
                      innerHTML: R(Cr)(R(ae)(Q, u.message))
                    }, null, 8, Uy)) : (A(), E("div", {
                      key: 1,
                      innerHTML: R(Cr)(u.message)
                    }, null, 8, zy)),
                    u.attachments && u.attachments.length > 0 ? (A(), E("div", Hy, [
                      (A(!0), E($e, null, pt(u.attachments, (M) => (A(), E("div", {
                        key: M.id,
                        class: "attachment-item"
                      }, [
                        R(Ne)(M.content_type) ? (A(), E("div", Wy, [
                          v("img", {
                            src: R(Ve)(M.file_url),
                            alt: M.filename,
                            class: "attachment-image",
                            onClick: Yn((Kt) => R($n)({ url: M.file_url, filename: M.filename, type: M.content_type, file_url: R(Ve)(M.file_url), size: void 0 }), ["stop"]),
                            style: { cursor: "pointer" }
                          }, null, 8, qy),
                          v("div", jy, [
                            v("a", {
                              href: R(Ve)(M.file_url),
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
                              fn(" " + Z(M.filename) + " ", 1),
                              v("span", Ky, "(" + Z(R(ye)(M.file_size)) + ")", 1)
                            ], 8, Vy)
                          ])
                        ])) : (A(), E("a", {
                          key: 1,
                          href: R(Ve)(M.file_url),
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
                          fn(" " + Z(M.filename) + " ", 1),
                          v("span", Yy, "(" + Z(R(ye)(M.file_size)) + ")", 1)
                        ], 8, Gy))
                      ]))), 128))
                    ])) : ne("", !0)
                  ], 64))
                ], 4),
                ur.value && (u.message_type === "bot" || u.message_type === "agent") && u.sources && u.sources.length ? (A(), E("div", Xy, [
                  g[42] || (g[42] = v("span", { class: "citation-label" }, "Sources", -1)),
                  (A(!0), E($e, null, pt(u.sources, (M, Kt) => (A(), E("span", {
                    key: Kt,
                    class: "citation-chip",
                    title: sa(M)
                  }, Z(pi(M)), 9, Zy))), 128))
                ])) : ne("", !0),
                v("div", Jy, [
                  u.message_type === "user" ? (A(), E("span", Qy, " You ")) : ne("", !0)
                ])
              ])
            ], 2);
          }), 128)),
          R(d) ? (A(), E("div", {
            key: 1,
            class: Be(["typing-indicator", { "reading-indicator": ur.value }])
          }, [
            ur.value ? (A(), E($e, { key: 0 }, [
              g[43] || (g[43] = v("div", {
                class: "reading-bars",
                "aria-hidden": "true"
              }, [
                v("span"),
                v("span"),
                v("span")
              ], -1)),
              g[44] || (g[44] = v("span", { class: "reading-label" }, "reading knowledge base", -1))
            ], 64)) : (A(), E("div", {
              key: 1,
              class: "cm-typing-bubble",
              style: ke(R(nt))
            }, g[45] || (g[45] = [
              v("span", { class: "cm-typing-dot" }, null, -1),
              v("span", { class: "cm-typing-dot" }, null, -1),
              v("span", { class: "cm-typing-dot" }, null, -1)
            ]), 4))
          ], 2)) : ne("", !0)
        ], 512), [
          [$h, !Wn.value]
        ]),
        Iu.value ? (A(), E("div", ev, [
          (A(!0), E($e, null, pt(hi.value, (u) => (A(), E("button", {
            key: u,
            type: "button",
            class: "cm-quick-action",
            disabled: !ct.value,
            onClick: (Q) => _s(u)
          }, Z(u), 9, tv))), 128))
        ])) : ne("", !0),
        !xn.value && !Wn.value ? (A(), E("div", {
          key: 6,
          class: Be(["chat-input", { "ask-anything-input": Bt.value }])
        }, [
          v("input", {
            ref_key: "fileInputRef",
            ref: S,
            type: "file",
            accept: Sv,
            multiple: "",
            style: { display: "none" },
            onChange: g[7] || (g[7] = //@ts-ignore
            (...u) => R(lt) && R(lt)(...u))
          }, null, 544),
          R(B).length > 0 ? (A(), E("div", nv, [
            (A(!0), E($e, null, pt(R(B), (u, Q) => (A(), E("div", {
              key: Q,
              class: "file-preview-widget"
            }, [
              v("div", sv, [
                R(rr)(u.type) ? (A(), E("img", {
                  key: 0,
                  src: R(De)(u),
                  alt: u.filename,
                  class: "file-preview-image-widget",
                  onClick: Yn((ve) => R($n)(u), ["stop"]),
                  style: { cursor: "pointer" }
                }, null, 8, rv)) : (A(), E("div", {
                  key: 1,
                  class: "file-preview-icon-widget",
                  onClick: Yn((ve) => R($n)(u), ["stop"]),
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
                ]), 8, iv))
              ]),
              v("div", ov, [
                v("div", av, Z(u.filename), 1),
                v("div", lv, Z(R(ye)(u.size)), 1)
              ]),
              v("button", {
                type: "button",
                class: "file-preview-remove-widget",
                onClick: (ve) => R(sr)(Q),
                title: "Remove file"
              }, " × ", 8, cv)
            ]))), 128))
          ])) : ne("", !0),
          Go.value ? (A(), E("div", uv, g[47] || (g[47] = [
            v("div", { class: "upload-spinner-widget" }, null, -1),
            v("span", { class: "upload-text-widget" }, "Uploading files...", -1)
          ]))) : ne("", !0),
          v("div", fv, [
            Rn(v("input", {
              "onUpdate:modelValue": g[8] || (g[8] = (u) => be.value = u),
              type: "text",
              placeholder: Zt.value,
              onKeypress: ys,
              onInput: Lt,
              onChange: Lt,
              onPaste: g[9] || (g[9] = //@ts-ignore
              (...u) => R(nr) && R(nr)(...u)),
              onDrop: g[10] || (g[10] = //@ts-ignore
              (...u) => R(yt) && R(yt)(...u)),
              onDragover: g[11] || (g[11] = //@ts-ignore
              (...u) => R(Ge) && R(Ge)(...u)),
              onDragleave: g[12] || (g[12] = //@ts-ignore
              (...u) => R(qt) && R(qt)(...u)),
              disabled: !ct.value,
              class: Be({ disabled: !ct.value, "ask-anything-field": Bt.value })
            }, null, 42, hv), [
              [Kn, be.value]
            ]),
            yu.value ? (A(), E("button", {
              key: 0,
              type: "button",
              class: "attach-button",
              disabled: Go.value,
              onClick: g[13] || (g[13] = //@ts-ignore
              (...u) => R(ms) && R(ms)(...u)),
              title: `Attach files (${R(B).length}/${xl} used) or paste screenshots`
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
            ]), 8, dv)) : ne("", !0),
            v("button", {
              class: Be(["send-button", { "ask-anything-send": Bt.value }]),
              style: ke(R(Oe)),
              onClick: Jt,
              disabled: !be.value.trim() && R(B).length === 0 || !ct.value
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
            ]), 14, pv)
          ])
        ], 2)) : xn.value && !Wn.value ? (A(), E("div", gv, [
          v("div", mv, [
            g[50] || (g[50] = v("p", { class: "ended-text" }, "This chat has ended.", -1)),
            v("button", {
              class: "start-new-conversation-button",
              style: ke(R(Oe)),
              onClick: Au
            }, " Click here to start a new conversation ", 4)
          ])
        ])) : ne("", !0),
        na.value ? (A(), E("div", {
          key: 8,
          class: "ai-disclaimer",
          style: ke(R(Ze))
        }, Z(R(ul)), 5)) : ne("", !0),
        v("div", {
          class: "powered-by",
          style: ke(R(Ze))
        }, g[51] || (g[51] = [
          Vn('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-7db5dd71><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-7db5dd71></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-7db5dd71></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-7db5dd71></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-7db5dd71></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-7db5dd71><span class="cm-powered-prefix" data-v-7db5dd71>Powered by </span><strong class="cm-brand" data-v-7db5dd71>ChatterMate</strong></a>', 2)
        ]), 4)
      ], 6)) : ne("", !0),
      ar.value ? (A(), E("div", _v, [
        v("div", yv, [
          g[52] || (g[52] = v("h3", null, "Rate your conversation", -1)),
          v("div", vv, [
            (A(), E($e, null, pt(5, (u) => v("button", {
              key: u,
              onClick: (Q) => ee.value = u,
              class: Be([{ active: u <= ee.value }, "star-button"])
            }, " ★ ", 10, bv)), 64))
          ]),
          Rn(v("textarea", {
            "onUpdate:modelValue": g[14] || (g[14] = (u) => y.value = u),
            placeholder: "Additional feedback (optional)",
            class: "rating-feedback"
          }, null, 512), [
            [Kn, y.value]
          ]),
          v("div", wv, [
            v("button", {
              onClick: g[15] || (g[15] = (u) => h.submitRating(ee.value, y.value)),
              disabled: !ee.value,
              class: "submit-button",
              style: ke(R(Oe))
            }, " Submit ", 12, kv),
            v("button", {
              onClick: g[16] || (g[16] = (u) => ar.value = !1),
              class: "skip-rating"
            }, " Skip ")
          ])
        ])
      ])) : ne("", !0),
      R(X) ? (A(), E("div", {
        key: 9,
        class: "preview-modal-overlay",
        onClick: g[19] || (g[19] = //@ts-ignore
        (...u) => R(Un) && R(Un)(...u))
      }, [
        v("div", {
          class: "preview-modal-content",
          onClick: g[18] || (g[18] = Yn(() => {
          }, ["stop"]))
        }, [
          v("button", {
            class: "preview-modal-close",
            onClick: g[17] || (g[17] = //@ts-ignore
            (...u) => R(Un) && R(Un)(...u))
          }, "×"),
          R(J) && R(rr)(R(J).type) ? (A(), E("div", xv, [
            v("img", {
              src: R(De)(R(J)),
              alt: R(J).filename,
              class: "preview-modal-image"
            }, null, 8, Tv),
            v("div", Av, Z(R(J).filename), 1)
          ])) : ne("", !0)
        ])
      ])) : ne("", !0)
    ], 6)) : (A(), E("div", Ev));
  }
}), Rv = /* @__PURE__ */ zo(Cv, [["__scopeId", "data-v-7db5dd71"]]);
window.process || (window.process = { env: { NODE_ENV: "production" } });
const Ut = window.__INITIAL_DATA__, ru = new URL(window.location.href), iu = ru.searchParams.get("preview") === "true", ou = (e) => {
  const t = ru.searchParams.get(e);
  if (!(!t || t === "undefined" || t.trim() === ""))
    return t;
}, Iv = iu ? ou("widget_id") || (Ut == null ? void 0 : Ut.widgetId) || void 0 : (Ut == null ? void 0 : Ut.widgetId) || void 0, Lv = iu ? (Ut == null ? void 0 : Ut.initialToken) || ou("token") || void 0 : (Ut == null ? void 0 : Ut.initialToken) || void 0, Ov = id(Rv, {
  widgetId: Iv,
  token: Lv || void 0,
  initialAuthError: null
  // Let backend determine if auth is required
});
Ov.mount("#app");
