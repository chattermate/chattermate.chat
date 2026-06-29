var wc = Object.defineProperty;
var kc = (t, e, n) => e in t ? wc(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n;
var Xe = (t, e, n) => kc(t, typeof e != "symbol" ? e + "" : e, n);
/**
* @vue/shared v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function Ii(t) {
  const e = /* @__PURE__ */ Object.create(null);
  for (const n of t.split(",")) e[n] = 1;
  return (n) => n in e;
}
const Je = {}, ts = [], on = () => {
}, xc = () => !1, kr = (t) => t.charCodeAt(0) === 111 && t.charCodeAt(1) === 110 && // uppercase letter
(t.charCodeAt(2) > 122 || t.charCodeAt(2) < 97), Li = (t) => t.startsWith("onUpdate:"), kt = Object.assign, Oi = (t, e) => {
  const n = t.indexOf(e);
  n > -1 && t.splice(n, 1);
}, Tc = Object.prototype.hasOwnProperty, Be = (t, e) => Tc.call(t, e), fe = Array.isArray, ns = (t) => xr(t) === "[object Map]", Aa = (t) => xr(t) === "[object Set]", me = (t) => typeof t == "function", pt = (t) => typeof t == "string", Pn = (t) => typeof t == "symbol", at = (t) => t !== null && typeof t == "object", Ea = (t) => (at(t) || me(t)) && me(t.then) && me(t.catch), Ca = Object.prototype.toString, xr = (t) => Ca.call(t), Sc = (t) => xr(t).slice(8, -1), Ra = (t) => xr(t) === "[object Object]", Pi = (t) => pt(t) && t !== "NaN" && t[0] !== "-" && "" + parseInt(t, 10) === t, Es = /* @__PURE__ */ Ii(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), Tr = (t) => {
  const e = /* @__PURE__ */ Object.create(null);
  return (n) => e[n] || (e[n] = t(n));
}, Ac = /-(\w)/g, In = Tr(
  (t) => t.replace(Ac, (e, n) => n ? n.toUpperCase() : "")
), Ec = /\B([A-Z])/g, Nn = Tr(
  (t) => t.replace(Ec, "-$1").toLowerCase()
), Ia = Tr((t) => t.charAt(0).toUpperCase() + t.slice(1)), zr = Tr(
  (t) => t ? `on${Ia(t)}` : ""
), En = (t, e) => !Object.is(t, e), nr = (t, ...e) => {
  for (let n = 0; n < t.length; n++)
    t[n](...e);
}, ai = (t, e, n, s = !1) => {
  Object.defineProperty(t, e, {
    configurable: !0,
    enumerable: !1,
    writable: s,
    value: n
  });
}, li = (t) => {
  const e = parseFloat(t);
  return isNaN(e) ? t : e;
};
let Co;
const Sr = () => Co || (Co = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function Me(t) {
  if (fe(t)) {
    const e = {};
    for (let n = 0; n < t.length; n++) {
      const s = t[n], r = pt(s) ? Lc(s) : Me(s);
      if (r)
        for (const i in r)
          e[i] = r[i];
    }
    return e;
  } else if (pt(t) || at(t))
    return t;
}
const Cc = /;(?![^(]*\))/g, Rc = /:([^]+)/, Ic = /\/\*[^]*?\*\//g;
function Lc(t) {
  const e = {};
  return t.replace(Ic, "").split(Cc).forEach((n) => {
    if (n) {
      const s = n.split(Rc);
      s.length > 1 && (e[s[0].trim()] = s[1].trim());
    }
  }), e;
}
function Ze(t) {
  let e = "";
  if (pt(t))
    e = t;
  else if (fe(t))
    for (let n = 0; n < t.length; n++) {
      const s = Ze(t[n]);
      s && (e += s + " ");
    }
  else if (at(t))
    for (const n in t)
      t[n] && (e += n + " ");
  return e.trim();
}
const Oc = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", Pc = /* @__PURE__ */ Ii(Oc);
function La(t) {
  return !!t || t === "";
}
const Oa = (t) => !!(t && t.__v_isRef === !0), ce = (t) => pt(t) ? t : t == null ? "" : fe(t) || at(t) && (t.toString === Ca || !me(t.toString)) ? Oa(t) ? ce(t.value) : JSON.stringify(t, Pa, 2) : String(t), Pa = (t, e) => Oa(e) ? Pa(t, e.value) : ns(e) ? {
  [`Map(${e.size})`]: [...e.entries()].reduce(
    (n, [s, r], i) => (n[Hr(s, i) + " =>"] = r, n),
    {}
  )
} : Aa(e) ? {
  [`Set(${e.size})`]: [...e.values()].map((n) => Hr(n))
} : Pn(e) ? Hr(e) : at(e) && !fe(e) && !Ra(e) ? String(e) : e, Hr = (t, e = "") => {
  var n;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    Pn(t) ? `Symbol(${(n = t.description) != null ? n : e})` : t
  );
};
/**
* @vue/reactivity v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let Pt;
class Nc {
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
function Fc() {
  return Pt;
}
let tt;
const Wr = /* @__PURE__ */ new WeakSet();
class Na {
  constructor(e) {
    this.fn = e, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, Pt && Pt.active && Pt.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, Wr.has(this) && (Wr.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Da(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, Ro(this), Ma(this);
    const e = tt, n = Jt;
    tt = this, Jt = !0;
    try {
      return this.fn();
    } finally {
      $a(this), tt = e, Jt = n, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let e = this.deps; e; e = e.nextDep)
        Di(e);
      this.deps = this.depsTail = void 0, Ro(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? Wr.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    ci(this) && this.run();
  }
  get dirty() {
    return ci(this);
  }
}
let Fa = 0, Cs, Rs;
function Da(t, e = !1) {
  if (t.flags |= 8, e) {
    t.next = Rs, Rs = t;
    return;
  }
  t.next = Cs, Cs = t;
}
function Ni() {
  Fa++;
}
function Fi() {
  if (--Fa > 0)
    return;
  if (Rs) {
    let e = Rs;
    for (Rs = void 0; e; ) {
      const n = e.next;
      e.next = void 0, e.flags &= -9, e = n;
    }
  }
  let t;
  for (; Cs; ) {
    let e = Cs;
    for (Cs = void 0; e; ) {
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
function Ma(t) {
  for (let e = t.deps; e; e = e.nextDep)
    e.version = -1, e.prevActiveLink = e.dep.activeLink, e.dep.activeLink = e;
}
function $a(t) {
  let e, n = t.depsTail, s = n;
  for (; s; ) {
    const r = s.prevDep;
    s.version === -1 ? (s === n && (n = r), Di(s), Dc(s)) : e = s, s.dep.activeLink = s.prevActiveLink, s.prevActiveLink = void 0, s = r;
  }
  t.deps = e, t.depsTail = n;
}
function ci(t) {
  for (let e = t.deps; e; e = e.nextDep)
    if (e.dep.version !== e.version || e.dep.computed && (Ba(e.dep.computed) || e.dep.version !== e.version))
      return !0;
  return !!t._dirty;
}
function Ba(t) {
  if (t.flags & 4 && !(t.flags & 16) || (t.flags &= -17, t.globalVersion === Fs) || (t.globalVersion = Fs, !t.isSSR && t.flags & 128 && (!t.deps && !t._dirty || !ci(t))))
    return;
  t.flags |= 2;
  const e = t.dep, n = tt, s = Jt;
  tt = t, Jt = !0;
  try {
    Ma(t);
    const r = t.fn(t._value);
    (e.version === 0 || En(r, t._value)) && (t.flags |= 128, t._value = r, e.version++);
  } catch (r) {
    throw e.version++, r;
  } finally {
    tt = n, Jt = s, $a(t), t.flags &= -3;
  }
}
function Di(t, e = !1) {
  const { dep: n, prevSub: s, nextSub: r } = t;
  if (s && (s.nextSub = r, t.prevSub = void 0), r && (r.prevSub = s, t.nextSub = void 0), n.subs === t && (n.subs = s, !s && n.computed)) {
    n.computed.flags &= -5;
    for (let i = n.computed.deps; i; i = i.nextDep)
      Di(i, !0);
  }
  !e && !--n.sc && n.map && n.map.delete(n.key);
}
function Dc(t) {
  const { prevDep: e, nextDep: n } = t;
  e && (e.nextDep = n, t.prevDep = void 0), n && (n.prevDep = e, t.nextDep = void 0);
}
let Jt = !0;
const Ua = [];
function vn() {
  Ua.push(Jt), Jt = !1;
}
function bn() {
  const t = Ua.pop();
  Jt = t === void 0 ? !0 : t;
}
function Ro(t) {
  const { cleanup: e } = t;
  if (t.cleanup = void 0, e) {
    const n = tt;
    tt = void 0;
    try {
      e();
    } finally {
      tt = n;
    }
  }
}
let Fs = 0;
class Mc {
  constructor(e, n) {
    this.sub = e, this.dep = n, this.version = n.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Mi {
  // TODO isolatedDeclarations "__v_skip"
  constructor(e) {
    this.computed = e, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(e) {
    if (!tt || !Jt || tt === this.computed)
      return;
    let n = this.activeLink;
    if (n === void 0 || n.sub !== tt)
      n = this.activeLink = new Mc(tt, this), tt.deps ? (n.prevDep = tt.depsTail, tt.depsTail.nextDep = n, tt.depsTail = n) : tt.deps = tt.depsTail = n, za(n);
    else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
      const s = n.nextDep;
      s.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = s), n.prevDep = tt.depsTail, n.nextDep = void 0, tt.depsTail.nextDep = n, tt.depsTail = n, tt.deps === n && (tt.deps = s);
    }
    return n;
  }
  trigger(e) {
    this.version++, Fs++, this.notify(e);
  }
  notify(e) {
    Ni();
    try {
      for (let n = this.subs; n; n = n.prevSub)
        n.sub.notify() && n.sub.dep.notify();
    } finally {
      Fi();
    }
  }
}
function za(t) {
  if (t.dep.sc++, t.sub.flags & 4) {
    const e = t.dep.computed;
    if (e && !t.dep.subs) {
      e.flags |= 20;
      for (let s = e.deps; s; s = s.nextDep)
        za(s);
    }
    const n = t.dep.subs;
    n !== t && (t.prevSub = n, n && (n.nextSub = t)), t.dep.subs = t;
  }
}
const ui = /* @__PURE__ */ new WeakMap(), qn = Symbol(
  ""
), fi = Symbol(
  ""
), Ds = Symbol(
  ""
);
function bt(t, e, n) {
  if (Jt && tt) {
    let s = ui.get(t);
    s || ui.set(t, s = /* @__PURE__ */ new Map());
    let r = s.get(n);
    r || (s.set(n, r = new Mi()), r.map = s, r.key = n), r.track();
  }
}
function gn(t, e, n, s, r, i) {
  const o = ui.get(t);
  if (!o) {
    Fs++;
    return;
  }
  const a = (l) => {
    l && l.trigger();
  };
  if (Ni(), e === "clear")
    o.forEach(a);
  else {
    const l = fe(t), h = l && Pi(n);
    if (l && n === "length") {
      const u = Number(s);
      o.forEach((b, v) => {
        (v === "length" || v === Ds || !Pn(v) && v >= u) && a(b);
      });
    } else
      switch ((n !== void 0 || o.has(void 0)) && a(o.get(n)), h && a(o.get(Ds)), e) {
        case "add":
          l ? h && a(o.get("length")) : (a(o.get(qn)), ns(t) && a(o.get(fi)));
          break;
        case "delete":
          l || (a(o.get(qn)), ns(t) && a(o.get(fi)));
          break;
        case "set":
          ns(t) && a(o.get(qn));
          break;
      }
  }
  Fi();
}
function Zn(t) {
  const e = $e(t);
  return e === t ? e : (bt(e, "iterate", Ds), jt(t) ? e : e.map(yt));
}
function Ar(t) {
  return bt(t = $e(t), "iterate", Ds), t;
}
const $c = {
  __proto__: null,
  [Symbol.iterator]() {
    return qr(this, Symbol.iterator, yt);
  },
  concat(...t) {
    return Zn(this).concat(
      ...t.map((e) => fe(e) ? Zn(e) : e)
    );
  },
  entries() {
    return qr(this, "entries", (t) => (t[1] = yt(t[1]), t));
  },
  every(t, e) {
    return fn(this, "every", t, e, void 0, arguments);
  },
  filter(t, e) {
    return fn(this, "filter", t, e, (n) => n.map(yt), arguments);
  },
  find(t, e) {
    return fn(this, "find", t, e, yt, arguments);
  },
  findIndex(t, e) {
    return fn(this, "findIndex", t, e, void 0, arguments);
  },
  findLast(t, e) {
    return fn(this, "findLast", t, e, yt, arguments);
  },
  findLastIndex(t, e) {
    return fn(this, "findLastIndex", t, e, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(t, e) {
    return fn(this, "forEach", t, e, void 0, arguments);
  },
  includes(...t) {
    return jr(this, "includes", t);
  },
  indexOf(...t) {
    return jr(this, "indexOf", t);
  },
  join(t) {
    return Zn(this).join(t);
  },
  // keys() iterator only reads `length`, no optimisation required
  lastIndexOf(...t) {
    return jr(this, "lastIndexOf", t);
  },
  map(t, e) {
    return fn(this, "map", t, e, void 0, arguments);
  },
  pop() {
    return hs(this, "pop");
  },
  push(...t) {
    return hs(this, "push", t);
  },
  reduce(t, ...e) {
    return Io(this, "reduce", t, e);
  },
  reduceRight(t, ...e) {
    return Io(this, "reduceRight", t, e);
  },
  shift() {
    return hs(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(t, e) {
    return fn(this, "some", t, e, void 0, arguments);
  },
  splice(...t) {
    return hs(this, "splice", t);
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
    return hs(this, "unshift", t);
  },
  values() {
    return qr(this, "values", yt);
  }
};
function qr(t, e, n) {
  const s = Ar(t), r = s[e]();
  return s !== t && !jt(t) && (r._next = r.next, r.next = () => {
    const i = r._next();
    return i.value && (i.value = n(i.value)), i;
  }), r;
}
const Bc = Array.prototype;
function fn(t, e, n, s, r, i) {
  const o = Ar(t), a = o !== t && !jt(t), l = o[e];
  if (l !== Bc[e]) {
    const b = l.apply(t, i);
    return a ? yt(b) : b;
  }
  let h = n;
  o !== t && (a ? h = function(b, v) {
    return n.call(this, yt(b), v, t);
  } : n.length > 2 && (h = function(b, v) {
    return n.call(this, b, v, t);
  }));
  const u = l.call(o, h, s);
  return a && r ? r(u) : u;
}
function Io(t, e, n, s) {
  const r = Ar(t);
  let i = n;
  return r !== t && (jt(t) ? n.length > 3 && (i = function(o, a, l) {
    return n.call(this, o, a, l, t);
  }) : i = function(o, a, l) {
    return n.call(this, o, yt(a), l, t);
  }), r[e](i, ...s);
}
function jr(t, e, n) {
  const s = $e(t);
  bt(s, "iterate", Ds);
  const r = s[e](...n);
  return (r === -1 || r === !1) && zi(n[0]) ? (n[0] = $e(n[0]), s[e](...n)) : r;
}
function hs(t, e, n = []) {
  vn(), Ni();
  const s = $e(t)[e].apply(t, n);
  return Fi(), bn(), s;
}
const Uc = /* @__PURE__ */ Ii("__proto__,__v_isRef,__isVue"), Ha = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((t) => t !== "arguments" && t !== "caller").map((t) => Symbol[t]).filter(Pn)
);
function zc(t) {
  Pn(t) || (t = String(t));
  const e = $e(this);
  return bt(e, "has", t), e.hasOwnProperty(t);
}
class Wa {
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
      return s === (r ? i ? Zc : Ka : i ? Va : ja).get(e) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(e) === Object.getPrototypeOf(s) ? e : void 0;
    const o = fe(e);
    if (!r) {
      let l;
      if (o && (l = $c[n]))
        return l;
      if (n === "hasOwnProperty")
        return zc;
    }
    const a = Reflect.get(
      e,
      n,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      wt(e) ? e : s
    );
    return (Pn(n) ? Ha.has(n) : Uc(n)) || (r || bt(e, "get", n), i) ? a : wt(a) ? o && Pi(n) ? a : a.value : at(a) ? r ? Ga(a) : Bi(a) : a;
  }
}
class qa extends Wa {
  constructor(e = !1) {
    super(!1, e);
  }
  set(e, n, s, r) {
    let i = e[n];
    if (!this._isShallow) {
      const l = Ln(i);
      if (!jt(s) && !Ln(s) && (i = $e(i), s = $e(s)), !fe(e) && wt(i) && !wt(s))
        return l ? !1 : (i.value = s, !0);
    }
    const o = fe(e) && Pi(n) ? Number(n) < e.length : Be(e, n), a = Reflect.set(
      e,
      n,
      s,
      wt(e) ? e : r
    );
    return e === $e(r) && (o ? En(s, i) && gn(e, "set", n, s) : gn(e, "add", n, s)), a;
  }
  deleteProperty(e, n) {
    const s = Be(e, n);
    e[n];
    const r = Reflect.deleteProperty(e, n);
    return r && s && gn(e, "delete", n, void 0), r;
  }
  has(e, n) {
    const s = Reflect.has(e, n);
    return (!Pn(n) || !Ha.has(n)) && bt(e, "has", n), s;
  }
  ownKeys(e) {
    return bt(
      e,
      "iterate",
      fe(e) ? "length" : qn
    ), Reflect.ownKeys(e);
  }
}
class Hc extends Wa {
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
const Wc = /* @__PURE__ */ new qa(), qc = /* @__PURE__ */ new Hc(), jc = /* @__PURE__ */ new qa(!0);
const hi = (t) => t, Gs = (t) => Reflect.getPrototypeOf(t);
function Vc(t, e, n) {
  return function(...s) {
    const r = this.__v_raw, i = $e(r), o = ns(i), a = t === "entries" || t === Symbol.iterator && o, l = t === "keys" && o, h = r[t](...s), u = n ? hi : e ? dr : yt;
    return !e && bt(
      i,
      "iterate",
      l ? fi : qn
    ), {
      // iterator protocol
      next() {
        const { value: b, done: v } = h.next();
        return v ? { value: b, done: v } : {
          value: a ? [u(b[0]), u(b[1])] : u(b),
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
function Ys(t) {
  return function(...e) {
    return t === "delete" ? !1 : t === "clear" ? void 0 : this;
  };
}
function Kc(t, e) {
  const n = {
    get(r) {
      const i = this.__v_raw, o = $e(i), a = $e(r);
      t || (En(r, a) && bt(o, "get", r), bt(o, "get", a));
      const { has: l } = Gs(o), h = e ? hi : t ? dr : yt;
      if (l.call(o, r))
        return h(i.get(r));
      if (l.call(o, a))
        return h(i.get(a));
      i !== o && i.get(r);
    },
    get size() {
      const r = this.__v_raw;
      return !t && bt($e(r), "iterate", qn), Reflect.get(r, "size", r);
    },
    has(r) {
      const i = this.__v_raw, o = $e(i), a = $e(r);
      return t || (En(r, a) && bt(o, "has", r), bt(o, "has", a)), r === a ? i.has(r) : i.has(r) || i.has(a);
    },
    forEach(r, i) {
      const o = this, a = o.__v_raw, l = $e(a), h = e ? hi : t ? dr : yt;
      return !t && bt(l, "iterate", qn), a.forEach((u, b) => r.call(i, h(u), h(b), o));
    }
  };
  return kt(
    n,
    t ? {
      add: Ys("add"),
      set: Ys("set"),
      delete: Ys("delete"),
      clear: Ys("clear")
    } : {
      add(r) {
        !e && !jt(r) && !Ln(r) && (r = $e(r));
        const i = $e(this);
        return Gs(i).has.call(i, r) || (i.add(r), gn(i, "add", r, r)), this;
      },
      set(r, i) {
        !e && !jt(i) && !Ln(i) && (i = $e(i));
        const o = $e(this), { has: a, get: l } = Gs(o);
        let h = a.call(o, r);
        h || (r = $e(r), h = a.call(o, r));
        const u = l.call(o, r);
        return o.set(r, i), h ? En(i, u) && gn(o, "set", r, i) : gn(o, "add", r, i), this;
      },
      delete(r) {
        const i = $e(this), { has: o, get: a } = Gs(i);
        let l = o.call(i, r);
        l || (r = $e(r), l = o.call(i, r)), a && a.call(i, r);
        const h = i.delete(r);
        return l && gn(i, "delete", r, void 0), h;
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
    n[r] = Vc(r, t, e);
  }), n;
}
function $i(t, e) {
  const n = Kc(t, e);
  return (s, r, i) => r === "__v_isReactive" ? !t : r === "__v_isReadonly" ? t : r === "__v_raw" ? s : Reflect.get(
    Be(n, r) && r in s ? n : s,
    r,
    i
  );
}
const Gc = {
  get: /* @__PURE__ */ $i(!1, !1)
}, Yc = {
  get: /* @__PURE__ */ $i(!1, !0)
}, Xc = {
  get: /* @__PURE__ */ $i(!0, !1)
};
const ja = /* @__PURE__ */ new WeakMap(), Va = /* @__PURE__ */ new WeakMap(), Ka = /* @__PURE__ */ new WeakMap(), Zc = /* @__PURE__ */ new WeakMap();
function Jc(t) {
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
function Qc(t) {
  return t.__v_skip || !Object.isExtensible(t) ? 0 : Jc(Sc(t));
}
function Bi(t) {
  return Ln(t) ? t : Ui(
    t,
    !1,
    Wc,
    Gc,
    ja
  );
}
function eu(t) {
  return Ui(
    t,
    !1,
    jc,
    Yc,
    Va
  );
}
function Ga(t) {
  return Ui(
    t,
    !0,
    qc,
    Xc,
    Ka
  );
}
function Ui(t, e, n, s, r) {
  if (!at(t) || t.__v_raw && !(e && t.__v_isReactive))
    return t;
  const i = Qc(t);
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
function ss(t) {
  return Ln(t) ? ss(t.__v_raw) : !!(t && t.__v_isReactive);
}
function Ln(t) {
  return !!(t && t.__v_isReadonly);
}
function jt(t) {
  return !!(t && t.__v_isShallow);
}
function zi(t) {
  return t ? !!t.__v_raw : !1;
}
function $e(t) {
  const e = t && t.__v_raw;
  return e ? $e(e) : t;
}
function tu(t) {
  return !Be(t, "__v_skip") && Object.isExtensible(t) && ai(t, "__v_skip", !0), t;
}
const yt = (t) => at(t) ? Bi(t) : t, dr = (t) => at(t) ? Ga(t) : t;
function wt(t) {
  return t ? t.__v_isRef === !0 : !1;
}
function ge(t) {
  return nu(t, !1);
}
function nu(t, e) {
  return wt(t) ? t : new su(t, e);
}
class su {
  constructor(e, n) {
    this.dep = new Mi(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? e : $e(e), this._value = n ? e : yt(e), this.__v_isShallow = n;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(e) {
    const n = this._rawValue, s = this.__v_isShallow || jt(e) || Ln(e);
    e = s ? e : $e(e), En(e, n) && (this._rawValue = e, this._value = s ? e : yt(e), this.dep.trigger());
  }
}
function C(t) {
  return wt(t) ? t.value : t;
}
const ru = {
  get: (t, e, n) => e === "__v_raw" ? t : C(Reflect.get(t, e, n)),
  set: (t, e, n, s) => {
    const r = t[e];
    return wt(r) && !wt(n) ? (r.value = n, !0) : Reflect.set(t, e, n, s);
  }
};
function Ya(t) {
  return ss(t) ? t : new Proxy(t, ru);
}
class iu {
  constructor(e, n, s) {
    this.fn = e, this.setter = n, this._value = void 0, this.dep = new Mi(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Fs - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = s;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    tt !== this)
      return Da(this, !0), !0;
  }
  get value() {
    const e = this.dep.track();
    return Ba(this), e && (e.version = this.dep.version), this._value;
  }
  set value(e) {
    this.setter && this.setter(e);
  }
}
function ou(t, e, n = !1) {
  let s, r;
  return me(t) ? s = t : (s = t.get, r = t.set), new iu(s, r, n);
}
const Xs = {}, pr = /* @__PURE__ */ new WeakMap();
let Hn;
function au(t, e = !1, n = Hn) {
  if (n) {
    let s = pr.get(n);
    s || pr.set(n, s = []), s.push(t);
  }
}
function lu(t, e, n = Je) {
  const { immediate: s, deep: r, once: i, scheduler: o, augmentJob: a, call: l } = n, h = (z) => r ? z : jt(z) || r === !1 || r === 0 ? mn(z, 1) : mn(z);
  let u, b, v, F, B = !1, G = !1;
  if (wt(t) ? (b = () => t.value, B = jt(t)) : ss(t) ? (b = () => h(t), B = !0) : fe(t) ? (G = !0, B = t.some((z) => ss(z) || jt(z)), b = () => t.map((z) => {
    if (wt(z))
      return z.value;
    if (ss(z))
      return h(z);
    if (me(z))
      return l ? l(z, 2) : z();
  })) : me(t) ? e ? b = l ? () => l(t, 2) : t : b = () => {
    if (v) {
      vn();
      try {
        v();
      } finally {
        bn();
      }
    }
    const z = Hn;
    Hn = u;
    try {
      return l ? l(t, 3, [F]) : t(F);
    } finally {
      Hn = z;
    }
  } : b = on, e && r) {
    const z = b, H = r === !0 ? 1 / 0 : r;
    b = () => mn(z(), H);
  }
  const Ce = Fc(), ne = () => {
    u.stop(), Ce && Ce.active && Oi(Ce.effects, u);
  };
  if (i && e) {
    const z = e;
    e = (...H) => {
      z(...H), ne();
    };
  }
  let Ee = G ? new Array(t.length).fill(Xs) : Xs;
  const ke = (z) => {
    if (!(!(u.flags & 1) || !u.dirty && !z))
      if (e) {
        const H = u.run();
        if (r || B || (G ? H.some((J, j) => En(J, Ee[j])) : En(H, Ee))) {
          v && v();
          const J = Hn;
          Hn = u;
          try {
            const j = [
              H,
              // pass undefined as the old value when it's changed for the first time
              Ee === Xs ? void 0 : G && Ee[0] === Xs ? [] : Ee,
              F
            ];
            Ee = H, l ? l(e, 3, j) : (
              // @ts-expect-error
              e(...j)
            );
          } finally {
            Hn = J;
          }
        }
      } else
        u.run();
  };
  return a && a(ke), u = new Na(b), u.scheduler = o ? () => o(ke, !1) : ke, F = (z) => au(z, !1, u), v = u.onStop = () => {
    const z = pr.get(u);
    if (z) {
      if (l)
        l(z, 4);
      else
        for (const H of z) H();
      pr.delete(u);
    }
  }, e ? s ? ke(!0) : Ee = u.run() : o ? o(ke.bind(null, !0), !0) : u.run(), ne.pause = u.pause.bind(u), ne.resume = u.resume.bind(u), ne.stop = ne, ne;
}
function mn(t, e = 1 / 0, n) {
  if (e <= 0 || !at(t) || t.__v_skip || (n = n || /* @__PURE__ */ new Set(), n.has(t)))
    return t;
  if (n.add(t), e--, wt(t))
    mn(t.value, e, n);
  else if (fe(t))
    for (let s = 0; s < t.length; s++)
      mn(t[s], e, n);
  else if (Aa(t) || ns(t))
    t.forEach((s) => {
      mn(s, e, n);
    });
  else if (Ra(t)) {
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
function Us(t, e, n, s) {
  try {
    return s ? t(...s) : t();
  } catch (r) {
    Er(r, e, n);
  }
}
function cn(t, e, n, s) {
  if (me(t)) {
    const r = Us(t, e, n, s);
    return r && Ea(r) && r.catch((i) => {
      Er(i, e, n);
    }), r;
  }
  if (fe(t)) {
    const r = [];
    for (let i = 0; i < t.length; i++)
      r.push(cn(t[i], e, n, s));
    return r;
  }
}
function Er(t, e, n, s = !0) {
  const r = e ? e.vnode : null, { errorHandler: i, throwUnhandledErrorInProduction: o } = e && e.appContext.config || Je;
  if (e) {
    let a = e.parent;
    const l = e.proxy, h = `https://vuejs.org/error-reference/#runtime-${n}`;
    for (; a; ) {
      const u = a.ec;
      if (u) {
        for (let b = 0; b < u.length; b++)
          if (u[b](t, l, h) === !1)
            return;
      }
      a = a.parent;
    }
    if (i) {
      vn(), Us(i, null, 10, [
        t,
        l,
        h
      ]), bn();
      return;
    }
  }
  cu(t, n, r, s, o);
}
function cu(t, e, n, s = !0, r = !1) {
  if (r)
    throw t;
  console.error(t);
}
const Et = [];
let sn = -1;
const rs = [];
let Sn = null, Qn = 0;
const Xa = /* @__PURE__ */ Promise.resolve();
let gr = null;
function Za(t) {
  const e = gr || Xa;
  return t ? e.then(this ? t.bind(this) : t) : e;
}
function uu(t) {
  let e = sn + 1, n = Et.length;
  for (; e < n; ) {
    const s = e + n >>> 1, r = Et[s], i = Ms(r);
    i < t || i === t && r.flags & 2 ? e = s + 1 : n = s;
  }
  return e;
}
function Hi(t) {
  if (!(t.flags & 1)) {
    const e = Ms(t), n = Et[Et.length - 1];
    !n || // fast path when the job id is larger than the tail
    !(t.flags & 2) && e >= Ms(n) ? Et.push(t) : Et.splice(uu(e), 0, t), t.flags |= 1, Ja();
  }
}
function Ja() {
  gr || (gr = Xa.then(el));
}
function fu(t) {
  fe(t) ? rs.push(...t) : Sn && t.id === -1 ? Sn.splice(Qn + 1, 0, t) : t.flags & 1 || (rs.push(t), t.flags |= 1), Ja();
}
function Lo(t, e, n = sn + 1) {
  for (; n < Et.length; n++) {
    const s = Et[n];
    if (s && s.flags & 2) {
      if (t && s.id !== t.uid)
        continue;
      Et.splice(n, 1), n--, s.flags & 4 && (s.flags &= -2), s(), s.flags & 4 || (s.flags &= -2);
    }
  }
}
function Qa(t) {
  if (rs.length) {
    const e = [...new Set(rs)].sort(
      (n, s) => Ms(n) - Ms(s)
    );
    if (rs.length = 0, Sn) {
      Sn.push(...e);
      return;
    }
    for (Sn = e, Qn = 0; Qn < Sn.length; Qn++) {
      const n = Sn[Qn];
      n.flags & 4 && (n.flags &= -2), n.flags & 8 || n(), n.flags &= -2;
    }
    Sn = null, Qn = 0;
  }
}
const Ms = (t) => t.id == null ? t.flags & 2 ? -1 : 1 / 0 : t.id;
function el(t) {
  try {
    for (sn = 0; sn < Et.length; sn++) {
      const e = Et[sn];
      e && !(e.flags & 8) && (e.flags & 4 && (e.flags &= -2), Us(
        e,
        e.i,
        e.i ? 15 : 14
      ), e.flags & 4 || (e.flags &= -2));
    }
  } finally {
    for (; sn < Et.length; sn++) {
      const e = Et[sn];
      e && (e.flags &= -2);
    }
    sn = -1, Et.length = 0, Qa(), gr = null, (Et.length || rs.length) && el();
  }
}
let qt = null, tl = null;
function mr(t) {
  const e = qt;
  return qt = t, tl = t && t.type.__scopeId || null, e;
}
function hu(t, e = qt, n) {
  if (!e || t._n)
    return t;
  const s = (...r) => {
    s._d && Uo(-1);
    const i = mr(e);
    let o;
    try {
      o = t(...r);
    } finally {
      mr(i), s._d && Uo(1);
    }
    return o;
  };
  return s._n = !0, s._c = !0, s._d = !0, s;
}
function Mn(t, e) {
  if (qt === null)
    return t;
  const n = Lr(qt), s = t.dirs || (t.dirs = []);
  for (let r = 0; r < e.length; r++) {
    let [i, o, a, l = Je] = e[r];
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
    l && (vn(), cn(l, n, 8, [
      t.el,
      a,
      t,
      e
    ]), bn());
  }
}
const du = Symbol("_vte"), pu = (t) => t.__isTeleport;
function Wi(t, e) {
  t.shapeFlag & 6 && t.component ? (t.transition = e, Wi(t.component.subTree, e)) : t.shapeFlag & 128 ? (t.ssContent.transition = e.clone(t.ssContent), t.ssFallback.transition = e.clone(t.ssFallback)) : t.transition = e;
}
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function gu(t, e) {
  return me(t) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    kt({ name: t.name }, e, { setup: t })
  ) : t;
}
function nl(t) {
  t.ids = [t.ids[0] + t.ids[2]++ + "-", 0, 0];
}
function Is(t, e, n, s, r = !1) {
  if (fe(t)) {
    t.forEach(
      (B, G) => Is(
        B,
        e && (fe(e) ? e[G] : e),
        n,
        s,
        r
      )
    );
    return;
  }
  if (Ls(s) && !r) {
    s.shapeFlag & 512 && s.type.__asyncResolved && s.component.subTree.component && Is(t, e, n, s.component.subTree);
    return;
  }
  const i = s.shapeFlag & 4 ? Lr(s.component) : s.el, o = r ? null : i, { i: a, r: l } = t, h = e && e.r, u = a.refs === Je ? a.refs = {} : a.refs, b = a.setupState, v = $e(b), F = b === Je ? () => !1 : (B) => Be(v, B);
  if (h != null && h !== l && (pt(h) ? (u[h] = null, F(h) && (b[h] = null)) : wt(h) && (h.value = null)), me(l))
    Us(l, a, 12, [o, u]);
  else {
    const B = pt(l), G = wt(l);
    if (B || G) {
      const Ce = () => {
        if (t.f) {
          const ne = B ? F(l) ? b[l] : u[l] : l.value;
          r ? fe(ne) && Oi(ne, i) : fe(ne) ? ne.includes(i) || ne.push(i) : B ? (u[l] = [i], F(l) && (b[l] = u[l])) : (l.value = [i], t.k && (u[t.k] = l.value));
        } else B ? (u[l] = o, F(l) && (b[l] = o)) : G && (l.value = o, t.k && (u[t.k] = o));
      };
      o ? (Ce.id = -1, Ut(Ce, n)) : Ce();
    }
  }
}
Sr().requestIdleCallback;
Sr().cancelIdleCallback;
const Ls = (t) => !!t.type.__asyncLoader, sl = (t) => t.type.__isKeepAlive;
function mu(t, e) {
  rl(t, "a", e);
}
function _u(t, e) {
  rl(t, "da", e);
}
function rl(t, e, n = Ct) {
  const s = t.__wdc || (t.__wdc = () => {
    let r = n;
    for (; r; ) {
      if (r.isDeactivated)
        return;
      r = r.parent;
    }
    return t();
  });
  if (Cr(e, s, n), n) {
    let r = n.parent;
    for (; r && r.parent; )
      sl(r.parent.vnode) && yu(s, e, n, r), r = r.parent;
  }
}
function yu(t, e, n, s) {
  const r = Cr(
    e,
    t,
    s,
    !0
    /* prepend */
  );
  qi(() => {
    Oi(s[e], r);
  }, n);
}
function Cr(t, e, n = Ct, s = !1) {
  if (n) {
    const r = n[t] || (n[t] = []), i = e.__weh || (e.__weh = (...o) => {
      vn();
      const a = zs(n), l = cn(e, n, t, o);
      return a(), bn(), l;
    });
    return s ? r.unshift(i) : r.push(i), i;
  }
}
const wn = (t) => (e, n = Ct) => {
  (!Bs || t === "sp") && Cr(t, (...s) => e(...s), n);
}, vu = wn("bm"), il = wn("m"), bu = wn(
  "bu"
), wu = wn("u"), ku = wn(
  "bum"
), qi = wn("um"), xu = wn(
  "sp"
), Tu = wn("rtg"), Su = wn("rtc");
function Au(t, e = Ct) {
  Cr("ec", t, e);
}
const Eu = Symbol.for("v-ndc");
function Bt(t, e, n, s) {
  let r;
  const i = n, o = fe(t);
  if (o || pt(t)) {
    const a = o && ss(t);
    let l = !1, h = !1;
    a && (l = !jt(t), h = Ln(t), t = Ar(t)), r = new Array(t.length);
    for (let u = 0, b = t.length; u < b; u++)
      r[u] = e(
        l ? h ? dr(yt(t[u])) : yt(t[u]) : t[u],
        u,
        void 0,
        i
      );
  } else if (typeof t == "number") {
    r = new Array(t);
    for (let a = 0; a < t; a++)
      r[a] = e(a + 1, a, void 0, i);
  } else if (at(t))
    if (t[Symbol.iterator])
      r = Array.from(
        t,
        (a, l) => e(a, l, void 0, i)
      );
    else {
      const a = Object.keys(t);
      r = new Array(a.length);
      for (let l = 0, h = a.length; l < h; l++) {
        const u = a[l];
        r[l] = e(t[u], u, l, i);
      }
    }
  else
    r = [];
  return r;
}
const di = (t) => t ? Al(t) ? Lr(t) : di(t.parent) : null, Os = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ kt(/* @__PURE__ */ Object.create(null), {
    $: (t) => t,
    $el: (t) => t.vnode.el,
    $data: (t) => t.data,
    $props: (t) => t.props,
    $attrs: (t) => t.attrs,
    $slots: (t) => t.slots,
    $refs: (t) => t.refs,
    $parent: (t) => di(t.parent),
    $root: (t) => di(t.root),
    $host: (t) => t.ce,
    $emit: (t) => t.emit,
    $options: (t) => al(t),
    $forceUpdate: (t) => t.f || (t.f = () => {
      Hi(t.update);
    }),
    $nextTick: (t) => t.n || (t.n = Za.bind(t.proxy)),
    $watch: (t) => Yu.bind(t)
  })
), Vr = (t, e) => t !== Je && !t.__isScriptSetup && Be(t, e), Cu = {
  get({ _: t }, e) {
    if (e === "__v_skip")
      return !0;
    const { ctx: n, setupState: s, data: r, props: i, accessCache: o, type: a, appContext: l } = t;
    let h;
    if (e[0] !== "$") {
      const F = o[e];
      if (F !== void 0)
        switch (F) {
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
        if (Vr(s, e))
          return o[e] = 1, s[e];
        if (r !== Je && Be(r, e))
          return o[e] = 2, r[e];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (h = t.propsOptions[0]) && Be(h, e)
        )
          return o[e] = 3, i[e];
        if (n !== Je && Be(n, e))
          return o[e] = 4, n[e];
        pi && (o[e] = 0);
      }
    }
    const u = Os[e];
    let b, v;
    if (u)
      return e === "$attrs" && bt(t.attrs, "get", ""), u(t);
    if (
      // css module (injected by vue-loader)
      (b = a.__cssModules) && (b = b[e])
    )
      return b;
    if (n !== Je && Be(n, e))
      return o[e] = 4, n[e];
    if (
      // global properties
      v = l.config.globalProperties, Be(v, e)
    )
      return v[e];
  },
  set({ _: t }, e, n) {
    const { data: s, setupState: r, ctx: i } = t;
    return Vr(r, e) ? (r[e] = n, !0) : s !== Je && Be(s, e) ? (s[e] = n, !0) : Be(t.props, e) || e[0] === "$" && e.slice(1) in t ? !1 : (i[e] = n, !0);
  },
  has({
    _: { data: t, setupState: e, accessCache: n, ctx: s, appContext: r, propsOptions: i }
  }, o) {
    let a;
    return !!n[o] || t !== Je && Be(t, o) || Vr(e, o) || (a = i[0]) && Be(a, o) || Be(s, o) || Be(Os, o) || Be(r.config.globalProperties, o);
  },
  defineProperty(t, e, n) {
    return n.get != null ? t._.accessCache[e] = 0 : Be(n, "value") && this.set(t, e, n.value, null), Reflect.defineProperty(t, e, n);
  }
};
function Oo(t) {
  return fe(t) ? t.reduce(
    (e, n) => (e[n] = null, e),
    {}
  ) : t;
}
let pi = !0;
function Ru(t) {
  const e = al(t), n = t.proxy, s = t.ctx;
  pi = !1, e.beforeCreate && Po(e.beforeCreate, t, "bc");
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
    beforeMount: b,
    mounted: v,
    beforeUpdate: F,
    updated: B,
    activated: G,
    deactivated: Ce,
    beforeDestroy: ne,
    beforeUnmount: Ee,
    destroyed: ke,
    unmounted: z,
    render: H,
    renderTracked: J,
    renderTriggered: j,
    errorCaptured: Le,
    serverPrefetch: it,
    // public API
    expose: je,
    inheritAttrs: Te,
    // assets
    components: he,
    directives: Ve,
    filters: Qe
  } = e;
  if (h && Iu(h, s, null), o)
    for (const de in o) {
      const oe = o[de];
      me(oe) && (s[de] = oe.bind(n));
    }
  if (r) {
    const de = r.call(n, n);
    at(de) && (t.data = Bi(de));
  }
  if (pi = !0, i)
    for (const de in i) {
      const oe = i[de], Pe = me(oe) ? oe.bind(n, n) : me(oe.get) ? oe.get.bind(n, n) : on, st = !me(oe) && me(oe.set) ? oe.set.bind(n) : on, se = qe({
        get: Pe,
        set: st
      });
      Object.defineProperty(s, de, {
        enumerable: !0,
        configurable: !0,
        get: () => se.value,
        set: (Oe) => se.value = Oe
      });
    }
  if (a)
    for (const de in a)
      ol(a[de], s, n, de);
  if (l) {
    const de = me(l) ? l.call(n) : l;
    Reflect.ownKeys(de).forEach((oe) => {
      Du(oe, de[oe]);
    });
  }
  u && Po(u, t, "c");
  function ie(de, oe) {
    fe(oe) ? oe.forEach((Pe) => de(Pe.bind(n))) : oe && de(oe.bind(n));
  }
  if (ie(vu, b), ie(il, v), ie(bu, F), ie(wu, B), ie(mu, G), ie(_u, Ce), ie(Au, Le), ie(Su, J), ie(Tu, j), ie(ku, Ee), ie(qi, z), ie(xu, it), fe(je))
    if (je.length) {
      const de = t.exposed || (t.exposed = {});
      je.forEach((oe) => {
        Object.defineProperty(de, oe, {
          get: () => n[oe],
          set: (Pe) => n[oe] = Pe,
          enumerable: !0
        });
      });
    } else t.exposed || (t.exposed = {});
  H && t.render === on && (t.render = H), Te != null && (t.inheritAttrs = Te), he && (t.components = he), Ve && (t.directives = Ve), it && nl(t);
}
function Iu(t, e, n = on) {
  fe(t) && (t = gi(t));
  for (const s in t) {
    const r = t[s];
    let i;
    at(r) ? "default" in r ? i = sr(
      r.from || s,
      r.default,
      !0
    ) : i = sr(r.from || s) : i = sr(r), wt(i) ? Object.defineProperty(e, s, {
      enumerable: !0,
      configurable: !0,
      get: () => i.value,
      set: (o) => i.value = o
    }) : e[s] = i;
  }
}
function Po(t, e, n) {
  cn(
    fe(t) ? t.map((s) => s.bind(e.proxy)) : t.bind(e.proxy),
    e,
    n
  );
}
function ol(t, e, n, s) {
  let r = s.includes(".") ? bl(n, s) : () => n[s];
  if (pt(t)) {
    const i = e[t];
    me(i) && Wn(r, i);
  } else if (me(t))
    Wn(r, t.bind(n));
  else if (at(t))
    if (fe(t))
      t.forEach((i) => ol(i, e, n, s));
    else {
      const i = me(t.handler) ? t.handler.bind(n) : e[t.handler];
      me(i) && Wn(r, i, t);
    }
}
function al(t) {
  const e = t.type, { mixins: n, extends: s } = e, {
    mixins: r,
    optionsCache: i,
    config: { optionMergeStrategies: o }
  } = t.appContext, a = i.get(e);
  let l;
  return a ? l = a : !r.length && !n && !s ? l = e : (l = {}, r.length && r.forEach(
    (h) => _r(l, h, o, !0)
  ), _r(l, e, o)), at(e) && i.set(e, l), l;
}
function _r(t, e, n, s = !1) {
  const { mixins: r, extends: i } = e;
  i && _r(t, i, n, !0), r && r.forEach(
    (o) => _r(t, o, n, !0)
  );
  for (const o in e)
    if (!(s && o === "expose")) {
      const a = Lu[o] || n && n[o];
      t[o] = a ? a(t[o], e[o]) : e[o];
    }
  return t;
}
const Lu = {
  data: No,
  props: Fo,
  emits: Fo,
  // objects
  methods: Ts,
  computed: Ts,
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
  components: Ts,
  directives: Ts,
  // watch
  watch: Pu,
  // provide / inject
  provide: No,
  inject: Ou
};
function No(t, e) {
  return e ? t ? function() {
    return kt(
      me(t) ? t.call(this, this) : t,
      me(e) ? e.call(this, this) : e
    );
  } : e : t;
}
function Ou(t, e) {
  return Ts(gi(t), gi(e));
}
function gi(t) {
  if (fe(t)) {
    const e = {};
    for (let n = 0; n < t.length; n++)
      e[t[n]] = t[n];
    return e;
  }
  return t;
}
function At(t, e) {
  return t ? [...new Set([].concat(t, e))] : e;
}
function Ts(t, e) {
  return t ? kt(/* @__PURE__ */ Object.create(null), t, e) : e;
}
function Fo(t, e) {
  return t ? fe(t) && fe(e) ? [.../* @__PURE__ */ new Set([...t, ...e])] : kt(
    /* @__PURE__ */ Object.create(null),
    Oo(t),
    Oo(e ?? {})
  ) : e;
}
function Pu(t, e) {
  if (!t) return e;
  if (!e) return t;
  const n = kt(/* @__PURE__ */ Object.create(null), t);
  for (const s in e)
    n[s] = At(t[s], e[s]);
  return n;
}
function ll() {
  return {
    app: null,
    config: {
      isNativeTag: xc,
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
let Nu = 0;
function Fu(t, e) {
  return function(s, r = null) {
    me(s) || (s = kt({}, s)), r != null && !at(r) && (r = null);
    const i = ll(), o = /* @__PURE__ */ new WeakSet(), a = [];
    let l = !1;
    const h = i.app = {
      _uid: Nu++,
      _component: s,
      _props: r,
      _container: null,
      _context: i,
      _instance: null,
      version: yf,
      get config() {
        return i.config;
      },
      set config(u) {
      },
      use(u, ...b) {
        return o.has(u) || (u && me(u.install) ? (o.add(u), u.install(h, ...b)) : me(u) && (o.add(u), u(h, ...b))), h;
      },
      mixin(u) {
        return i.mixins.includes(u) || i.mixins.push(u), h;
      },
      component(u, b) {
        return b ? (i.components[u] = b, h) : i.components[u];
      },
      directive(u, b) {
        return b ? (i.directives[u] = b, h) : i.directives[u];
      },
      mount(u, b, v) {
        if (!l) {
          const F = h._ceVNode || an(s, r);
          return F.appContext = i, v === !0 ? v = "svg" : v === !1 && (v = void 0), t(F, u, v), l = !0, h._container = u, u.__vue_app__ = h, Lr(F.component);
        }
      },
      onUnmount(u) {
        a.push(u);
      },
      unmount() {
        l && (cn(
          a,
          h._instance,
          16
        ), t(null, h._container), delete h._container.__vue_app__);
      },
      provide(u, b) {
        return i.provides[u] = b, h;
      },
      runWithContext(u) {
        const b = is;
        is = h;
        try {
          return u();
        } finally {
          is = b;
        }
      }
    };
    return h;
  };
}
let is = null;
function Du(t, e) {
  if (Ct) {
    let n = Ct.provides;
    const s = Ct.parent && Ct.parent.provides;
    s === n && (n = Ct.provides = Object.create(s)), n[t] = e;
  }
}
function sr(t, e, n = !1) {
  const s = hf();
  if (s || is) {
    let r = is ? is._context.provides : s ? s.parent == null || s.ce ? s.vnode.appContext && s.vnode.appContext.provides : s.parent.provides : void 0;
    if (r && t in r)
      return r[t];
    if (arguments.length > 1)
      return n && me(e) ? e.call(s && s.proxy) : e;
  }
}
const cl = {}, ul = () => Object.create(cl), fl = (t) => Object.getPrototypeOf(t) === cl;
function Mu(t, e, n, s = !1) {
  const r = {}, i = ul();
  t.propsDefaults = /* @__PURE__ */ Object.create(null), hl(t, e, r, i);
  for (const o in t.propsOptions[0])
    o in r || (r[o] = void 0);
  n ? t.props = s ? r : eu(r) : t.type.props ? t.props = r : t.props = i, t.attrs = i;
}
function $u(t, e, n, s) {
  const {
    props: r,
    attrs: i,
    vnode: { patchFlag: o }
  } = t, a = $e(r), [l] = t.propsOptions;
  let h = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (s || o > 0) && !(o & 16)
  ) {
    if (o & 8) {
      const u = t.vnode.dynamicProps;
      for (let b = 0; b < u.length; b++) {
        let v = u[b];
        if (Rr(t.emitsOptions, v))
          continue;
        const F = e[v];
        if (l)
          if (Be(i, v))
            F !== i[v] && (i[v] = F, h = !0);
          else {
            const B = In(v);
            r[B] = mi(
              l,
              a,
              B,
              F,
              t,
              !1
            );
          }
        else
          F !== i[v] && (i[v] = F, h = !0);
      }
    }
  } else {
    hl(t, e, r, i) && (h = !0);
    let u;
    for (const b in a)
      (!e || // for camelCase
      !Be(e, b) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((u = Nn(b)) === b || !Be(e, u))) && (l ? n && // for camelCase
      (n[b] !== void 0 || // for kebab-case
      n[u] !== void 0) && (r[b] = mi(
        l,
        a,
        b,
        void 0,
        t,
        !0
      )) : delete r[b]);
    if (i !== a)
      for (const b in i)
        (!e || !Be(e, b)) && (delete i[b], h = !0);
  }
  h && gn(t.attrs, "set", "");
}
function hl(t, e, n, s) {
  const [r, i] = t.propsOptions;
  let o = !1, a;
  if (e)
    for (let l in e) {
      if (Es(l))
        continue;
      const h = e[l];
      let u;
      r && Be(r, u = In(l)) ? !i || !i.includes(u) ? n[u] = h : (a || (a = {}))[u] = h : Rr(t.emitsOptions, l) || (!(l in s) || h !== s[l]) && (s[l] = h, o = !0);
    }
  if (i) {
    const l = $e(n), h = a || Je;
    for (let u = 0; u < i.length; u++) {
      const b = i[u];
      n[b] = mi(
        r,
        l,
        b,
        h[b],
        t,
        !Be(h, b)
      );
    }
  }
  return o;
}
function mi(t, e, n, s, r, i) {
  const o = t[n];
  if (o != null) {
    const a = Be(o, "default");
    if (a && s === void 0) {
      const l = o.default;
      if (o.type !== Function && !o.skipFactory && me(l)) {
        const { propsDefaults: h } = r;
        if (n in h)
          s = h[n];
        else {
          const u = zs(r);
          s = h[n] = l.call(
            null,
            e
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
    ] && (s === "" || s === Nn(n)) && (s = !0));
  }
  return s;
}
const Bu = /* @__PURE__ */ new WeakMap();
function dl(t, e, n = !1) {
  const s = n ? Bu : e.propsCache, r = s.get(t);
  if (r)
    return r;
  const i = t.props, o = {}, a = [];
  let l = !1;
  if (!me(t)) {
    const u = (b) => {
      l = !0;
      const [v, F] = dl(b, e, !0);
      kt(o, v), F && a.push(...F);
    };
    !n && e.mixins.length && e.mixins.forEach(u), t.extends && u(t.extends), t.mixins && t.mixins.forEach(u);
  }
  if (!i && !l)
    return at(t) && s.set(t, ts), ts;
  if (fe(i))
    for (let u = 0; u < i.length; u++) {
      const b = In(i[u]);
      Do(b) && (o[b] = Je);
    }
  else if (i)
    for (const u in i) {
      const b = In(u);
      if (Do(b)) {
        const v = i[u], F = o[b] = fe(v) || me(v) ? { type: v } : kt({}, v), B = F.type;
        let G = !1, Ce = !0;
        if (fe(B))
          for (let ne = 0; ne < B.length; ++ne) {
            const Ee = B[ne], ke = me(Ee) && Ee.name;
            if (ke === "Boolean") {
              G = !0;
              break;
            } else ke === "String" && (Ce = !1);
          }
        else
          G = me(B) && B.name === "Boolean";
        F[
          0
          /* shouldCast */
        ] = G, F[
          1
          /* shouldCastTrue */
        ] = Ce, (G || Be(F, "default")) && a.push(b);
      }
    }
  const h = [o, a];
  return at(t) && s.set(t, h), h;
}
function Do(t) {
  return t[0] !== "$" && !Es(t);
}
const ji = (t) => t === "_" || t === "__" || t === "_ctx" || t === "$stable", Vi = (t) => fe(t) ? t.map(rn) : [rn(t)], Uu = (t, e, n) => {
  if (e._n)
    return e;
  const s = hu((...r) => Vi(e(...r)), n);
  return s._c = !1, s;
}, pl = (t, e, n) => {
  const s = t._ctx;
  for (const r in t) {
    if (ji(r)) continue;
    const i = t[r];
    if (me(i))
      e[r] = Uu(r, i, s);
    else if (i != null) {
      const o = Vi(i);
      e[r] = () => o;
    }
  }
}, gl = (t, e) => {
  const n = Vi(e);
  t.slots.default = () => n;
}, ml = (t, e, n) => {
  for (const s in e)
    (n || !ji(s)) && (t[s] = e[s]);
}, zu = (t, e, n) => {
  const s = t.slots = ul();
  if (t.vnode.shapeFlag & 32) {
    const r = e.__;
    r && ai(s, "__", r, !0);
    const i = e._;
    i ? (ml(s, e, n), n && ai(s, "_", i, !0)) : pl(e, s);
  } else e && gl(t, e);
}, Hu = (t, e, n) => {
  const { vnode: s, slots: r } = t;
  let i = !0, o = Je;
  if (s.shapeFlag & 32) {
    const a = e._;
    a ? n && a === 1 ? i = !1 : ml(r, e, n) : (i = !e.$stable, pl(e, r)), o = e;
  } else e && (gl(t, e), o = { default: 1 });
  if (i)
    for (const a in r)
      !ji(a) && o[a] == null && delete r[a];
}, Ut = nf;
function Wu(t) {
  return qu(t);
}
function qu(t, e) {
  const n = Sr();
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
    parentNode: b,
    nextSibling: v,
    setScopeId: F = on,
    insertStaticContent: B
  } = t, G = (d, m, k, L = null, S = null, A = null, D = void 0, $ = null, N = !!m.dynamicChildren) => {
    if (d === m)
      return;
    d && !ds(d, m) && (L = q(d), Oe(d, S, A, !0), d = null), m.patchFlag === -2 && (N = !1, m.dynamicChildren = null);
    const { type: O, ref: X, shapeFlag: U } = m;
    switch (O) {
      case Ir:
        Ce(d, m, k, L);
        break;
      case On:
        ne(d, m, k, L);
        break;
      case rr:
        d == null && Ee(m, k, L, D);
        break;
      case et:
        he(
          d,
          m,
          k,
          L,
          S,
          A,
          D,
          $,
          N
        );
        break;
      default:
        U & 1 ? H(
          d,
          m,
          k,
          L,
          S,
          A,
          D,
          $,
          N
        ) : U & 6 ? Ve(
          d,
          m,
          k,
          L,
          S,
          A,
          D,
          $,
          N
        ) : (U & 64 || U & 128) && O.process(
          d,
          m,
          k,
          L,
          S,
          A,
          D,
          $,
          N,
          ot
        );
    }
    X != null && S ? Is(X, d && d.ref, A, m || d, !m) : X == null && d && d.ref != null && Is(d.ref, null, A, d, !0);
  }, Ce = (d, m, k, L) => {
    if (d == null)
      s(
        m.el = a(m.children),
        k,
        L
      );
    else {
      const S = m.el = d.el;
      m.children !== d.children && h(S, m.children);
    }
  }, ne = (d, m, k, L) => {
    d == null ? s(
      m.el = l(m.children || ""),
      k,
      L
    ) : m.el = d.el;
  }, Ee = (d, m, k, L) => {
    [d.el, d.anchor] = B(
      d.children,
      m,
      k,
      L,
      d.el,
      d.anchor
    );
  }, ke = ({ el: d, anchor: m }, k, L) => {
    let S;
    for (; d && d !== m; )
      S = v(d), s(d, k, L), d = S;
    s(m, k, L);
  }, z = ({ el: d, anchor: m }) => {
    let k;
    for (; d && d !== m; )
      k = v(d), r(d), d = k;
    r(m);
  }, H = (d, m, k, L, S, A, D, $, N) => {
    m.type === "svg" ? D = "svg" : m.type === "math" && (D = "mathml"), d == null ? J(
      m,
      k,
      L,
      S,
      A,
      D,
      $,
      N
    ) : it(
      d,
      m,
      S,
      A,
      D,
      $,
      N
    );
  }, J = (d, m, k, L, S, A, D, $) => {
    let N, O;
    const { props: X, shapeFlag: U, transition: Y, dirs: Q } = d;
    if (N = d.el = o(
      d.type,
      A,
      X && X.is,
      X
    ), U & 8 ? u(N, d.children) : U & 16 && Le(
      d.children,
      N,
      null,
      L,
      S,
      Kr(d, A),
      D,
      $
    ), Q && $n(d, null, L, "created"), j(N, d, d.scopeId, D, L), X) {
      for (const _e in X)
        _e !== "value" && !Es(_e) && i(N, _e, null, X[_e], A, L);
      "value" in X && i(N, "value", null, X.value, A), (O = X.onVnodeBeforeMount) && tn(O, L, d);
    }
    Q && $n(d, null, L, "beforeMount");
    const re = ju(S, Y);
    re && Y.beforeEnter(N), s(N, m, k), ((O = X && X.onVnodeMounted) || re || Q) && Ut(() => {
      O && tn(O, L, d), re && Y.enter(N), Q && $n(d, null, L, "mounted");
    }, S);
  }, j = (d, m, k, L, S) => {
    if (k && F(d, k), L)
      for (let A = 0; A < L.length; A++)
        F(d, L[A]);
    if (S) {
      let A = S.subTree;
      if (m === A || kl(A.type) && (A.ssContent === m || A.ssFallback === m)) {
        const D = S.vnode;
        j(
          d,
          D,
          D.scopeId,
          D.slotScopeIds,
          S.parent
        );
      }
    }
  }, Le = (d, m, k, L, S, A, D, $, N = 0) => {
    for (let O = N; O < d.length; O++) {
      const X = d[O] = $ ? An(d[O]) : rn(d[O]);
      G(
        null,
        X,
        m,
        k,
        L,
        S,
        A,
        D,
        $
      );
    }
  }, it = (d, m, k, L, S, A, D) => {
    const $ = m.el = d.el;
    let { patchFlag: N, dynamicChildren: O, dirs: X } = m;
    N |= d.patchFlag & 16;
    const U = d.props || Je, Y = m.props || Je;
    let Q;
    if (k && Bn(k, !1), (Q = Y.onVnodeBeforeUpdate) && tn(Q, k, m, d), X && $n(m, d, k, "beforeUpdate"), k && Bn(k, !0), (U.innerHTML && Y.innerHTML == null || U.textContent && Y.textContent == null) && u($, ""), O ? je(
      d.dynamicChildren,
      O,
      $,
      k,
      L,
      Kr(m, S),
      A
    ) : D || oe(
      d,
      m,
      $,
      null,
      k,
      L,
      Kr(m, S),
      A,
      !1
    ), N > 0) {
      if (N & 16)
        Te($, U, Y, k, S);
      else if (N & 2 && U.class !== Y.class && i($, "class", null, Y.class, S), N & 4 && i($, "style", U.style, Y.style, S), N & 8) {
        const re = m.dynamicProps;
        for (let _e = 0; _e < re.length; _e++) {
          const xe = re[_e], Ge = U[xe], ze = Y[xe];
          (ze !== Ge || xe === "value") && i($, xe, Ge, ze, S, k);
        }
      }
      N & 1 && d.children !== m.children && u($, m.children);
    } else !D && O == null && Te($, U, Y, k, S);
    ((Q = Y.onVnodeUpdated) || X) && Ut(() => {
      Q && tn(Q, k, m, d), X && $n(m, d, k, "updated");
    }, L);
  }, je = (d, m, k, L, S, A, D) => {
    for (let $ = 0; $ < m.length; $++) {
      const N = d[$], O = m[$], X = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        N.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (N.type === et || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !ds(N, O) || // - In the case of a component, it could contain anything.
        N.shapeFlag & 198) ? b(N.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          k
        )
      );
      G(
        N,
        O,
        X,
        null,
        L,
        S,
        A,
        D,
        !0
      );
    }
  }, Te = (d, m, k, L, S) => {
    if (m !== k) {
      if (m !== Je)
        for (const A in m)
          !Es(A) && !(A in k) && i(
            d,
            A,
            m[A],
            null,
            S,
            L
          );
      for (const A in k) {
        if (Es(A)) continue;
        const D = k[A], $ = m[A];
        D !== $ && A !== "value" && i(d, A, $, D, S, L);
      }
      "value" in k && i(d, "value", m.value, k.value, S);
    }
  }, he = (d, m, k, L, S, A, D, $, N) => {
    const O = m.el = d ? d.el : a(""), X = m.anchor = d ? d.anchor : a("");
    let { patchFlag: U, dynamicChildren: Y, slotScopeIds: Q } = m;
    Q && ($ = $ ? $.concat(Q) : Q), d == null ? (s(O, k, L), s(X, k, L), Le(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      m.children || [],
      k,
      X,
      S,
      A,
      D,
      $,
      N
    )) : U > 0 && U & 64 && Y && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    d.dynamicChildren ? (je(
      d.dynamicChildren,
      Y,
      k,
      S,
      A,
      D,
      $
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (m.key != null || S && m === S.subTree) && _l(
      d,
      m,
      !0
      /* shallow */
    )) : oe(
      d,
      m,
      k,
      X,
      S,
      A,
      D,
      $,
      N
    );
  }, Ve = (d, m, k, L, S, A, D, $, N) => {
    m.slotScopeIds = $, d == null ? m.shapeFlag & 512 ? S.ctx.activate(
      m,
      k,
      L,
      D,
      N
    ) : Qe(
      m,
      k,
      L,
      S,
      A,
      D,
      N
    ) : lt(d, m, N);
  }, Qe = (d, m, k, L, S, A, D) => {
    const $ = d.component = ff(
      d,
      L,
      S
    );
    if (sl(d) && ($.ctx.renderer = ot), df($, !1, D), $.asyncDep) {
      if (S && S.registerDep($, ie, D), !d.el) {
        const N = $.subTree = an(On);
        ne(null, N, m, k), d.placeholder = N.el;
      }
    } else
      ie(
        $,
        d,
        m,
        k,
        S,
        A,
        D
      );
  }, lt = (d, m, k) => {
    const L = m.component = d.component;
    if (ef(d, m, k))
      if (L.asyncDep && !L.asyncResolved) {
        de(L, m, k);
        return;
      } else
        L.next = m, L.update();
    else
      m.el = d.el, L.vnode = m;
  }, ie = (d, m, k, L, S, A, D) => {
    const $ = () => {
      if (d.isMounted) {
        let { next: U, bu: Y, u: Q, parent: re, vnode: _e } = d;
        {
          const c = yl(d);
          if (c) {
            U && (U.el = _e.el, de(d, U, D)), c.asyncDep.then(() => {
              d.isUnmounted || $();
            });
            return;
          }
        }
        let xe = U, Ge;
        Bn(d, !1), U ? (U.el = _e.el, de(d, U, D)) : U = _e, Y && nr(Y), (Ge = U.props && U.props.onVnodeBeforeUpdate) && tn(Ge, re, U, _e), Bn(d, !0);
        const ze = $o(d), gt = d.subTree;
        d.subTree = ze, G(
          gt,
          ze,
          // parent may have changed if it's in a teleport
          b(gt.el),
          // anchor may have changed if it's in a fragment
          q(gt),
          d,
          S,
          A
        ), U.el = ze.el, xe === null && tf(d, ze.el), Q && Ut(Q, S), (Ge = U.props && U.props.onVnodeUpdated) && Ut(
          () => tn(Ge, re, U, _e),
          S
        );
      } else {
        let U;
        const { el: Y, props: Q } = m, { bm: re, m: _e, parent: xe, root: Ge, type: ze } = d, gt = Ls(m);
        Bn(d, !1), re && nr(re), !gt && (U = Q && Q.onVnodeBeforeMount) && tn(U, xe, m), Bn(d, !0);
        {
          Ge.ce && // @ts-expect-error _def is private
          Ge.ce._def.shadowRoot !== !1 && Ge.ce._injectChildStyle(ze);
          const c = d.subTree = $o(d);
          G(
            null,
            c,
            k,
            L,
            d,
            S,
            A
          ), m.el = c.el;
        }
        if (_e && Ut(_e, S), !gt && (U = Q && Q.onVnodeMounted)) {
          const c = m;
          Ut(
            () => tn(U, xe, c),
            S
          );
        }
        (m.shapeFlag & 256 || xe && Ls(xe.vnode) && xe.vnode.shapeFlag & 256) && d.a && Ut(d.a, S), d.isMounted = !0, m = k = L = null;
      }
    };
    d.scope.on();
    const N = d.effect = new Na($);
    d.scope.off();
    const O = d.update = N.run.bind(N), X = d.job = N.runIfDirty.bind(N);
    X.i = d, X.id = d.uid, N.scheduler = () => Hi(X), Bn(d, !0), O();
  }, de = (d, m, k) => {
    m.component = d;
    const L = d.vnode.props;
    d.vnode = m, d.next = null, $u(d, m.props, L, k), Hu(d, m.children, k), vn(), Lo(d), bn();
  }, oe = (d, m, k, L, S, A, D, $, N = !1) => {
    const O = d && d.children, X = d ? d.shapeFlag : 0, U = m.children, { patchFlag: Y, shapeFlag: Q } = m;
    if (Y > 0) {
      if (Y & 128) {
        st(
          O,
          U,
          k,
          L,
          S,
          A,
          D,
          $,
          N
        );
        return;
      } else if (Y & 256) {
        Pe(
          O,
          U,
          k,
          L,
          S,
          A,
          D,
          $,
          N
        );
        return;
      }
    }
    Q & 8 ? (X & 16 && le(O, S, A), U !== O && u(k, U)) : X & 16 ? Q & 16 ? st(
      O,
      U,
      k,
      L,
      S,
      A,
      D,
      $,
      N
    ) : le(O, S, A, !0) : (X & 8 && u(k, ""), Q & 16 && Le(
      U,
      k,
      L,
      S,
      A,
      D,
      $,
      N
    ));
  }, Pe = (d, m, k, L, S, A, D, $, N) => {
    d = d || ts, m = m || ts;
    const O = d.length, X = m.length, U = Math.min(O, X);
    let Y;
    for (Y = 0; Y < U; Y++) {
      const Q = m[Y] = N ? An(m[Y]) : rn(m[Y]);
      G(
        d[Y],
        Q,
        k,
        null,
        S,
        A,
        D,
        $,
        N
      );
    }
    O > X ? le(
      d,
      S,
      A,
      !0,
      !1,
      U
    ) : Le(
      m,
      k,
      L,
      S,
      A,
      D,
      $,
      N,
      U
    );
  }, st = (d, m, k, L, S, A, D, $, N) => {
    let O = 0;
    const X = m.length;
    let U = d.length - 1, Y = X - 1;
    for (; O <= U && O <= Y; ) {
      const Q = d[O], re = m[O] = N ? An(m[O]) : rn(m[O]);
      if (ds(Q, re))
        G(
          Q,
          re,
          k,
          null,
          S,
          A,
          D,
          $,
          N
        );
      else
        break;
      O++;
    }
    for (; O <= U && O <= Y; ) {
      const Q = d[U], re = m[Y] = N ? An(m[Y]) : rn(m[Y]);
      if (ds(Q, re))
        G(
          Q,
          re,
          k,
          null,
          S,
          A,
          D,
          $,
          N
        );
      else
        break;
      U--, Y--;
    }
    if (O > U) {
      if (O <= Y) {
        const Q = Y + 1, re = Q < X ? m[Q].el : L;
        for (; O <= Y; )
          G(
            null,
            m[O] = N ? An(m[O]) : rn(m[O]),
            k,
            re,
            S,
            A,
            D,
            $,
            N
          ), O++;
      }
    } else if (O > Y)
      for (; O <= U; )
        Oe(d[O], S, A, !0), O++;
    else {
      const Q = O, re = O, _e = /* @__PURE__ */ new Map();
      for (O = re; O <= Y; O++) {
        const x = m[O] = N ? An(m[O]) : rn(m[O]);
        x.key != null && _e.set(x.key, O);
      }
      let xe, Ge = 0;
      const ze = Y - re + 1;
      let gt = !1, c = 0;
      const _ = new Array(ze);
      for (O = 0; O < ze; O++) _[O] = 0;
      for (O = Q; O <= U; O++) {
        const x = d[O];
        if (Ge >= ze) {
          Oe(x, S, A, !0);
          continue;
        }
        let P;
        if (x.key != null)
          P = _e.get(x.key);
        else
          for (xe = re; xe <= Y; xe++)
            if (_[xe - re] === 0 && ds(x, m[xe])) {
              P = xe;
              break;
            }
        P === void 0 ? Oe(x, S, A, !0) : (_[P - re] = O + 1, P >= c ? c = P : gt = !0, G(
          x,
          m[P],
          k,
          null,
          S,
          A,
          D,
          $,
          N
        ), Ge++);
      }
      const T = gt ? Vu(_) : ts;
      for (xe = T.length - 1, O = ze - 1; O >= 0; O--) {
        const x = re + O, P = m[x], V = m[x + 1], ee = x + 1 < X ? (
          // #13559, fallback to el placeholder for unresolved async component
          V.el || V.placeholder
        ) : L;
        _[O] === 0 ? G(
          null,
          P,
          k,
          ee,
          S,
          A,
          D,
          $,
          N
        ) : gt && (xe < 0 || O !== T[xe] ? se(P, k, ee, 2) : xe--);
      }
    }
  }, se = (d, m, k, L, S = null) => {
    const { el: A, type: D, transition: $, children: N, shapeFlag: O } = d;
    if (O & 6) {
      se(d.component.subTree, m, k, L);
      return;
    }
    if (O & 128) {
      d.suspense.move(m, k, L);
      return;
    }
    if (O & 64) {
      D.move(d, m, k, ot);
      return;
    }
    if (D === et) {
      s(A, m, k);
      for (let U = 0; U < N.length; U++)
        se(N[U], m, k, L);
      s(d.anchor, m, k);
      return;
    }
    if (D === rr) {
      ke(d, m, k);
      return;
    }
    if (L !== 2 && O & 1 && $)
      if (L === 0)
        $.beforeEnter(A), s(A, m, k), Ut(() => $.enter(A), S);
      else {
        const { leave: U, delayLeave: Y, afterLeave: Q } = $, re = () => {
          d.ctx.isUnmounted ? r(A) : s(A, m, k);
        }, _e = () => {
          U(A, () => {
            re(), Q && Q();
          });
        };
        Y ? Y(A, re, _e) : _e();
      }
    else
      s(A, m, k);
  }, Oe = (d, m, k, L = !1, S = !1) => {
    const {
      type: A,
      props: D,
      ref: $,
      children: N,
      dynamicChildren: O,
      shapeFlag: X,
      patchFlag: U,
      dirs: Y,
      cacheIndex: Q
    } = d;
    if (U === -2 && (S = !1), $ != null && (vn(), Is($, null, k, d, !0), bn()), Q != null && (m.renderCache[Q] = void 0), X & 256) {
      m.ctx.deactivate(d);
      return;
    }
    const re = X & 1 && Y, _e = !Ls(d);
    let xe;
    if (_e && (xe = D && D.onVnodeBeforeUnmount) && tn(xe, m, d), X & 6)
      ae(d.component, k, L);
    else {
      if (X & 128) {
        d.suspense.unmount(k, L);
        return;
      }
      re && $n(d, null, m, "beforeUnmount"), X & 64 ? d.type.remove(
        d,
        m,
        k,
        ot,
        L
      ) : O && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !O.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (A !== et || U > 0 && U & 64) ? le(
        O,
        m,
        k,
        !1,
        !0
      ) : (A === et && U & 384 || !S && X & 16) && le(N, m, k), L && Ne(d);
    }
    (_e && (xe = D && D.onVnodeUnmounted) || re) && Ut(() => {
      xe && tn(xe, m, d), re && $n(d, null, m, "unmounted");
    }, k);
  }, Ne = (d) => {
    const { type: m, el: k, anchor: L, transition: S } = d;
    if (m === et) {
      W(k, L);
      return;
    }
    if (m === rr) {
      z(d);
      return;
    }
    const A = () => {
      r(k), S && !S.persisted && S.afterLeave && S.afterLeave();
    };
    if (d.shapeFlag & 1 && S && !S.persisted) {
      const { leave: D, delayLeave: $ } = S, N = () => D(k, A);
      $ ? $(d.el, A, N) : N();
    } else
      A();
  }, W = (d, m) => {
    let k;
    for (; d !== m; )
      k = v(d), r(d), d = k;
    r(m);
  }, ae = (d, m, k) => {
    const {
      bum: L,
      scope: S,
      job: A,
      subTree: D,
      um: $,
      m: N,
      a: O,
      parent: X,
      slots: { __: U }
    } = d;
    Mo(N), Mo(O), L && nr(L), X && fe(U) && U.forEach((Y) => {
      X.renderCache[Y] = void 0;
    }), S.stop(), A && (A.flags |= 8, Oe(D, d, m, k)), $ && Ut($, m), Ut(() => {
      d.isUnmounted = !0;
    }, m), m && m.pendingBranch && !m.isUnmounted && d.asyncDep && !d.asyncResolved && d.suspenseId === m.pendingId && (m.deps--, m.deps === 0 && m.resolve());
  }, le = (d, m, k, L = !1, S = !1, A = 0) => {
    for (let D = A; D < d.length; D++)
      Oe(d[D], m, k, L, S);
  }, q = (d) => {
    if (d.shapeFlag & 6)
      return q(d.component.subTree);
    if (d.shapeFlag & 128)
      return d.suspense.next();
    const m = v(d.anchor || d.el), k = m && m[du];
    return k ? v(k) : m;
  };
  let Ke = !1;
  const nt = (d, m, k) => {
    d == null ? m._vnode && Oe(m._vnode, null, null, !0) : G(
      m._vnode || null,
      d,
      m,
      null,
      null,
      null,
      k
    ), m._vnode = d, Ke || (Ke = !0, Lo(), Qa(), Ke = !1);
  }, ot = {
    p: G,
    um: Oe,
    m: se,
    r: Ne,
    mt: Qe,
    mc: Le,
    pc: oe,
    pbc: je,
    n: q,
    o: t
  };
  return {
    render: nt,
    hydrate: void 0,
    createApp: Fu(nt)
  };
}
function Kr({ type: t, props: e }, n) {
  return n === "svg" && t === "foreignObject" || n === "mathml" && t === "annotation-xml" && e && e.encoding && e.encoding.includes("html") ? void 0 : n;
}
function Bn({ effect: t, job: e }, n) {
  n ? (t.flags |= 32, e.flags |= 4) : (t.flags &= -33, e.flags &= -5);
}
function ju(t, e) {
  return (!t || t && !t.pendingBranch) && e && !e.persisted;
}
function _l(t, e, n = !1) {
  const s = t.children, r = e.children;
  if (fe(s) && fe(r))
    for (let i = 0; i < s.length; i++) {
      const o = s[i];
      let a = r[i];
      a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = r[i] = An(r[i]), a.el = o.el), !n && a.patchFlag !== -2 && _l(o, a)), a.type === Ir && (a.el = o.el), a.type === On && !a.el && (a.el = o.el);
    }
}
function Vu(t) {
  const e = t.slice(), n = [0];
  let s, r, i, o, a;
  const l = t.length;
  for (s = 0; s < l; s++) {
    const h = t[s];
    if (h !== 0) {
      if (r = n[n.length - 1], t[r] < h) {
        e[s] = r, n.push(s);
        continue;
      }
      for (i = 0, o = n.length - 1; i < o; )
        a = i + o >> 1, t[n[a]] < h ? i = a + 1 : o = a;
      h < t[n[i]] && (i > 0 && (e[s] = n[i - 1]), n[i] = s);
    }
  }
  for (i = n.length, o = n[i - 1]; i-- > 0; )
    n[i] = o, o = e[o];
  return n;
}
function yl(t) {
  const e = t.subTree.component;
  if (e)
    return e.asyncDep && !e.asyncResolved ? e : yl(e);
}
function Mo(t) {
  if (t)
    for (let e = 0; e < t.length; e++)
      t[e].flags |= 8;
}
const Ku = Symbol.for("v-scx"), Gu = () => sr(Ku);
function Wn(t, e, n) {
  return vl(t, e, n);
}
function vl(t, e, n = Je) {
  const { immediate: s, deep: r, flush: i, once: o } = n, a = kt({}, n), l = e && s || !e && i !== "post";
  let h;
  if (Bs) {
    if (i === "sync") {
      const F = Gu();
      h = F.__watcherHandles || (F.__watcherHandles = []);
    } else if (!l) {
      const F = () => {
      };
      return F.stop = on, F.resume = on, F.pause = on, F;
    }
  }
  const u = Ct;
  a.call = (F, B, G) => cn(F, u, B, G);
  let b = !1;
  i === "post" ? a.scheduler = (F) => {
    Ut(F, u && u.suspense);
  } : i !== "sync" && (b = !0, a.scheduler = (F, B) => {
    B ? F() : Hi(F);
  }), a.augmentJob = (F) => {
    e && (F.flags |= 4), b && (F.flags |= 2, u && (F.id = u.uid, F.i = u));
  };
  const v = lu(t, e, a);
  return Bs && (h ? h.push(v) : l && v()), v;
}
function Yu(t, e, n) {
  const s = this.proxy, r = pt(t) ? t.includes(".") ? bl(s, t) : () => s[t] : t.bind(s, s);
  let i;
  me(e) ? i = e : (i = e.handler, n = e);
  const o = zs(this), a = vl(r, i.bind(s), n);
  return o(), a;
}
function bl(t, e) {
  const n = e.split(".");
  return () => {
    let s = t;
    for (let r = 0; r < n.length && s; r++)
      s = s[n[r]];
    return s;
  };
}
const Xu = (t, e) => e === "modelValue" || e === "model-value" ? t.modelModifiers : t[`${e}Modifiers`] || t[`${In(e)}Modifiers`] || t[`${Nn(e)}Modifiers`];
function Zu(t, e, ...n) {
  if (t.isUnmounted) return;
  const s = t.vnode.props || Je;
  let r = n;
  const i = e.startsWith("update:"), o = i && Xu(s, e.slice(7));
  o && (o.trim && (r = n.map((u) => pt(u) ? u.trim() : u)), o.number && (r = n.map(li)));
  let a, l = s[a = zr(e)] || // also try camelCase event handler (#2249)
  s[a = zr(In(e))];
  !l && i && (l = s[a = zr(Nn(e))]), l && cn(
    l,
    t,
    6,
    r
  );
  const h = s[a + "Once"];
  if (h) {
    if (!t.emitted)
      t.emitted = {};
    else if (t.emitted[a])
      return;
    t.emitted[a] = !0, cn(
      h,
      t,
      6,
      r
    );
  }
}
function wl(t, e, n = !1) {
  const s = e.emitsCache, r = s.get(t);
  if (r !== void 0)
    return r;
  const i = t.emits;
  let o = {}, a = !1;
  if (!me(t)) {
    const l = (h) => {
      const u = wl(h, e, !0);
      u && (a = !0, kt(o, u));
    };
    !n && e.mixins.length && e.mixins.forEach(l), t.extends && l(t.extends), t.mixins && t.mixins.forEach(l);
  }
  return !i && !a ? (at(t) && s.set(t, null), null) : (fe(i) ? i.forEach((l) => o[l] = null) : kt(o, i), at(t) && s.set(t, o), o);
}
function Rr(t, e) {
  return !t || !kr(e) ? !1 : (e = e.slice(2).replace(/Once$/, ""), Be(t, e[0].toLowerCase() + e.slice(1)) || Be(t, Nn(e)) || Be(t, e));
}
function $o(t) {
  const {
    type: e,
    vnode: n,
    proxy: s,
    withProxy: r,
    propsOptions: [i],
    slots: o,
    attrs: a,
    emit: l,
    render: h,
    renderCache: u,
    props: b,
    data: v,
    setupState: F,
    ctx: B,
    inheritAttrs: G
  } = t, Ce = mr(t);
  let ne, Ee;
  try {
    if (n.shapeFlag & 4) {
      const z = r || s, H = z;
      ne = rn(
        h.call(
          H,
          z,
          u,
          b,
          F,
          v,
          B
        )
      ), Ee = a;
    } else {
      const z = e;
      ne = rn(
        z.length > 1 ? z(
          b,
          { attrs: a, slots: o, emit: l }
        ) : z(
          b,
          null
        )
      ), Ee = e.props ? a : Ju(a);
    }
  } catch (z) {
    Ps.length = 0, Er(z, t, 1), ne = an(On);
  }
  let ke = ne;
  if (Ee && G !== !1) {
    const z = Object.keys(Ee), { shapeFlag: H } = ke;
    z.length && H & 7 && (i && z.some(Li) && (Ee = Qu(
      Ee,
      i
    )), ke = os(ke, Ee, !1, !0));
  }
  return n.dirs && (ke = os(ke, null, !1, !0), ke.dirs = ke.dirs ? ke.dirs.concat(n.dirs) : n.dirs), n.transition && Wi(ke, n.transition), ne = ke, mr(Ce), ne;
}
const Ju = (t) => {
  let e;
  for (const n in t)
    (n === "class" || n === "style" || kr(n)) && ((e || (e = {}))[n] = t[n]);
  return e;
}, Qu = (t, e) => {
  const n = {};
  for (const s in t)
    (!Li(s) || !(s.slice(9) in e)) && (n[s] = t[s]);
  return n;
};
function ef(t, e, n) {
  const { props: s, children: r, component: i } = t, { props: o, children: a, patchFlag: l } = e, h = i.emitsOptions;
  if (e.dirs || e.transition)
    return !0;
  if (n && l >= 0) {
    if (l & 1024)
      return !0;
    if (l & 16)
      return s ? Bo(s, o, h) : !!o;
    if (l & 8) {
      const u = e.dynamicProps;
      for (let b = 0; b < u.length; b++) {
        const v = u[b];
        if (o[v] !== s[v] && !Rr(h, v))
          return !0;
      }
    }
  } else
    return (r || a) && (!a || !a.$stable) ? !0 : s === o ? !1 : s ? o ? Bo(s, o, h) : !0 : !!o;
  return !1;
}
function Bo(t, e, n) {
  const s = Object.keys(e);
  if (s.length !== Object.keys(t).length)
    return !0;
  for (let r = 0; r < s.length; r++) {
    const i = s[r];
    if (e[i] !== t[i] && !Rr(n, i))
      return !0;
  }
  return !1;
}
function tf({ vnode: t, parent: e }, n) {
  for (; e; ) {
    const s = e.subTree;
    if (s.suspense && s.suspense.activeBranch === t && (s.el = t.el), s === t)
      (t = e.vnode).el = n, e = e.parent;
    else
      break;
  }
}
const kl = (t) => t.__isSuspense;
function nf(t, e) {
  e && e.pendingBranch ? fe(t) ? e.effects.push(...t) : e.effects.push(t) : fu(t);
}
const et = Symbol.for("v-fgt"), Ir = Symbol.for("v-txt"), On = Symbol.for("v-cmt"), rr = Symbol.for("v-stc"), Ps = [];
let zt = null;
function R(t = !1) {
  Ps.push(zt = t ? null : []);
}
function sf() {
  Ps.pop(), zt = Ps[Ps.length - 1] || null;
}
let $s = 1;
function Uo(t, e = !1) {
  $s += t, t < 0 && zt && e && (zt.hasOnce = !0);
}
function xl(t) {
  return t.dynamicChildren = $s > 0 ? zt || ts : null, sf(), $s > 0 && zt && zt.push(t), t;
}
function I(t, e, n, s, r, i) {
  return xl(
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
function rf(t, e, n, s, r) {
  return xl(
    an(
      t,
      e,
      n,
      s,
      r,
      !0
    )
  );
}
function Tl(t) {
  return t ? t.__v_isVNode === !0 : !1;
}
function ds(t, e) {
  return t.type === e.type && t.key === e.key;
}
const Sl = ({ key: t }) => t ?? null, ir = ({
  ref: t,
  ref_key: e,
  ref_for: n
}) => (typeof t == "number" && (t = "" + t), t != null ? pt(t) || wt(t) || me(t) ? { i: qt, r: t, k: e, f: !!n } : t : null);
function w(t, e = null, n = null, s = 0, r = null, i = t === et ? 0 : 1, o = !1, a = !1) {
  const l = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: t,
    props: e,
    key: e && Sl(e),
    ref: e && ir(e),
    scopeId: tl,
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
  return a ? (Ki(l, n), i & 128 && t.normalize(l)) : n && (l.shapeFlag |= pt(n) ? 8 : 16), $s > 0 && // avoid a block node from tracking itself
  !o && // has current parent block
  zt && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (l.patchFlag > 0 || i & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  l.patchFlag !== 32 && zt.push(l), l;
}
const an = of;
function of(t, e = null, n = null, s = 0, r = null, i = !1) {
  if ((!t || t === Eu) && (t = On), Tl(t)) {
    const a = os(
      t,
      e,
      !0
      /* mergeRef: true */
    );
    return n && Ki(a, n), $s > 0 && !i && zt && (a.shapeFlag & 6 ? zt[zt.indexOf(t)] = a : zt.push(a)), a.patchFlag = -2, a;
  }
  if (_f(t) && (t = t.__vccOpts), e) {
    e = af(e);
    let { class: a, style: l } = e;
    a && !pt(a) && (e.class = Ze(a)), at(l) && (zi(l) && !fe(l) && (l = kt({}, l)), e.style = Me(l));
  }
  const o = pt(t) ? 1 : kl(t) ? 128 : pu(t) ? 64 : at(t) ? 4 : me(t) ? 2 : 0;
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
function af(t) {
  return t ? zi(t) || fl(t) ? kt({}, t) : t : null;
}
function os(t, e, n = !1, s = !1) {
  const { props: r, ref: i, patchFlag: o, children: a, transition: l } = t, h = e ? lf(r || {}, e) : r, u = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: t.type,
    props: h,
    key: h && Sl(h),
    ref: e && e.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && i ? fe(i) ? i.concat(ir(e)) : [i, ir(e)] : ir(e)
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
    patchFlag: e && t.type !== et ? o === -1 ? 16 : o | 16 : o,
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
    ssContent: t.ssContent && os(t.ssContent),
    ssFallback: t.ssFallback && os(t.ssFallback),
    placeholder: t.placeholder,
    el: t.el,
    anchor: t.anchor,
    ctx: t.ctx,
    ce: t.ce
  };
  return l && s && Wi(
    u,
    l.clone(u)
  ), u;
}
function hn(t = " ", e = 0) {
  return an(Ir, null, t, e);
}
function Un(t, e) {
  const n = an(rr, null, t);
  return n.staticCount = e, n;
}
function pe(t = "", e = !1) {
  return e ? (R(), rf(On, null, t)) : an(On, null, t);
}
function rn(t) {
  return t == null || typeof t == "boolean" ? an(On) : fe(t) ? an(
    et,
    null,
    // #3666, avoid reference pollution when reusing vnode
    t.slice()
  ) : Tl(t) ? An(t) : an(Ir, null, String(t));
}
function An(t) {
  return t.el === null && t.patchFlag !== -1 || t.memo ? t : os(t);
}
function Ki(t, e) {
  let n = 0;
  const { shapeFlag: s } = t;
  if (e == null)
    e = null;
  else if (fe(e))
    n = 16;
  else if (typeof e == "object")
    if (s & 65) {
      const r = e.default;
      r && (r._c && (r._d = !1), Ki(t, r()), r._c && (r._d = !0));
      return;
    } else {
      n = 32;
      const r = e._;
      !r && !fl(e) ? e._ctx = qt : r === 3 && qt && (qt.slots._ === 1 ? e._ = 1 : (e._ = 2, t.patchFlag |= 1024));
    }
  else me(e) ? (e = { default: e, _ctx: qt }, n = 32) : (e = String(e), s & 64 ? (n = 16, e = [hn(e)]) : n = 8);
  t.children = e, t.shapeFlag |= n;
}
function lf(...t) {
  const e = {};
  for (let n = 0; n < t.length; n++) {
    const s = t[n];
    for (const r in s)
      if (r === "class")
        e.class !== s.class && (e.class = Ze([e.class, s.class]));
      else if (r === "style")
        e.style = Me([e.style, s.style]);
      else if (kr(r)) {
        const i = e[r], o = s[r];
        o && i !== o && !(fe(i) && i.includes(o)) && (e[r] = i ? [].concat(i, o) : o);
      } else r !== "" && (e[r] = s[r]);
  }
  return e;
}
function tn(t, e, n, s = null) {
  cn(t, e, 7, [
    n,
    s
  ]);
}
const cf = ll();
let uf = 0;
function ff(t, e, n) {
  const s = t.type, r = (e ? e.appContext : t.appContext) || cf, i = {
    uid: uf++,
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
    scope: new Nc(
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
    propsOptions: dl(s, r),
    emitsOptions: wl(s, r),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: Je,
    // inheritAttrs
    inheritAttrs: s.inheritAttrs,
    // state
    ctx: Je,
    data: Je,
    props: Je,
    attrs: Je,
    slots: Je,
    refs: Je,
    setupState: Je,
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
  return i.ctx = { _: i }, i.root = e ? e.root : i, i.emit = Zu.bind(null, i), t.ce && t.ce(i), i;
}
let Ct = null;
const hf = () => Ct || qt;
let yr, _i;
{
  const t = Sr(), e = (n, s) => {
    let r;
    return (r = t[n]) || (r = t[n] = []), r.push(s), (i) => {
      r.length > 1 ? r.forEach((o) => o(i)) : r[0](i);
    };
  };
  yr = e(
    "__VUE_INSTANCE_SETTERS__",
    (n) => Ct = n
  ), _i = e(
    "__VUE_SSR_SETTERS__",
    (n) => Bs = n
  );
}
const zs = (t) => {
  const e = Ct;
  return yr(t), t.scope.on(), () => {
    t.scope.off(), yr(e);
  };
}, zo = () => {
  Ct && Ct.scope.off(), yr(null);
};
function Al(t) {
  return t.vnode.shapeFlag & 4;
}
let Bs = !1;
function df(t, e = !1, n = !1) {
  e && _i(e);
  const { props: s, children: r } = t.vnode, i = Al(t);
  Mu(t, s, i, e), zu(t, r, n || e);
  const o = i ? pf(t, e) : void 0;
  return e && _i(!1), o;
}
function pf(t, e) {
  const n = t.type;
  t.accessCache = /* @__PURE__ */ Object.create(null), t.proxy = new Proxy(t.ctx, Cu);
  const { setup: s } = n;
  if (s) {
    vn();
    const r = t.setupContext = s.length > 1 ? mf(t) : null, i = zs(t), o = Us(
      s,
      t,
      0,
      [
        t.props,
        r
      ]
    ), a = Ea(o);
    if (bn(), i(), (a || t.sp) && !Ls(t) && nl(t), a) {
      if (o.then(zo, zo), e)
        return o.then((l) => {
          Ho(t, l);
        }).catch((l) => {
          Er(l, t, 0);
        });
      t.asyncDep = o;
    } else
      Ho(t, o);
  } else
    El(t);
}
function Ho(t, e, n) {
  me(e) ? t.type.__ssrInlineRender ? t.ssrRender = e : t.render = e : at(e) && (t.setupState = Ya(e)), El(t);
}
function El(t, e, n) {
  const s = t.type;
  t.render || (t.render = s.render || on);
  {
    const r = zs(t);
    vn();
    try {
      Ru(t);
    } finally {
      bn(), r();
    }
  }
}
const gf = {
  get(t, e) {
    return bt(t, "get", ""), t[e];
  }
};
function mf(t) {
  const e = (n) => {
    t.exposed = n || {};
  };
  return {
    attrs: new Proxy(t.attrs, gf),
    slots: t.slots,
    emit: t.emit,
    expose: e
  };
}
function Lr(t) {
  return t.exposed ? t.exposeProxy || (t.exposeProxy = new Proxy(Ya(tu(t.exposed)), {
    get(e, n) {
      if (n in e)
        return e[n];
      if (n in Os)
        return Os[n](t);
    },
    has(e, n) {
      return n in e || n in Os;
    }
  })) : t.proxy;
}
function _f(t) {
  return me(t) && "__vccOpts" in t;
}
const qe = (t, e) => ou(t, e, Bs), yf = "3.5.18";
/**
* @vue/runtime-dom v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let yi;
const Wo = typeof window < "u" && window.trustedTypes;
if (Wo)
  try {
    yi = /* @__PURE__ */ Wo.createPolicy("vue", {
      createHTML: (t) => t
    });
  } catch {
  }
const Cl = yi ? (t) => yi.createHTML(t) : (t) => t, vf = "http://www.w3.org/2000/svg", bf = "http://www.w3.org/1998/Math/MathML", pn = typeof document < "u" ? document : null, qo = pn && /* @__PURE__ */ pn.createElement("template"), wf = {
  insert: (t, e, n) => {
    e.insertBefore(t, n || null);
  },
  remove: (t) => {
    const e = t.parentNode;
    e && e.removeChild(t);
  },
  createElement: (t, e, n, s) => {
    const r = e === "svg" ? pn.createElementNS(vf, t) : e === "mathml" ? pn.createElementNS(bf, t) : n ? pn.createElement(t, { is: n }) : pn.createElement(t);
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
      qo.innerHTML = Cl(
        s === "svg" ? `<svg>${t}</svg>` : s === "mathml" ? `<math>${t}</math>` : t
      );
      const a = qo.content;
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
}, kf = Symbol("_vtc");
function xf(t, e, n) {
  const s = t[kf];
  s && (e = (e ? [e, ...s] : [...s]).join(" ")), e == null ? t.removeAttribute("class") : n ? t.setAttribute("class", e) : t.className = e;
}
const jo = Symbol("_vod"), Tf = Symbol("_vsh"), Sf = Symbol(""), Af = /(^|;)\s*display\s*:/;
function Ef(t, e, n) {
  const s = t.style, r = pt(n);
  let i = !1;
  if (n && !r) {
    if (e)
      if (pt(e))
        for (const o of e.split(";")) {
          const a = o.slice(0, o.indexOf(":")).trim();
          n[a] == null && or(s, a, "");
        }
      else
        for (const o in e)
          n[o] == null && or(s, o, "");
    for (const o in n)
      o === "display" && (i = !0), or(s, o, n[o]);
  } else if (r) {
    if (e !== n) {
      const o = s[Sf];
      o && (n += ";" + o), s.cssText = n, i = Af.test(n);
    }
  } else e && t.removeAttribute("style");
  jo in t && (t[jo] = i ? s.display : "", t[Tf] && (s.display = "none"));
}
const Vo = /\s*!important$/;
function or(t, e, n) {
  if (fe(n))
    n.forEach((s) => or(t, e, s));
  else if (n == null && (n = ""), e.startsWith("--"))
    t.setProperty(e, n);
  else {
    const s = Cf(t, e);
    Vo.test(n) ? t.setProperty(
      Nn(s),
      n.replace(Vo, ""),
      "important"
    ) : t[s] = n;
  }
}
const Ko = ["Webkit", "Moz", "ms"], Gr = {};
function Cf(t, e) {
  const n = Gr[e];
  if (n)
    return n;
  let s = In(e);
  if (s !== "filter" && s in t)
    return Gr[e] = s;
  s = Ia(s);
  for (let r = 0; r < Ko.length; r++) {
    const i = Ko[r] + s;
    if (i in t)
      return Gr[e] = i;
  }
  return e;
}
const Go = "http://www.w3.org/1999/xlink";
function Yo(t, e, n, s, r, i = Pc(e)) {
  s && e.startsWith("xlink:") ? n == null ? t.removeAttributeNS(Go, e.slice(6, e.length)) : t.setAttributeNS(Go, e, n) : n == null || i && !La(n) ? t.removeAttribute(e) : t.setAttribute(
    e,
    i ? "" : Pn(n) ? String(n) : n
  );
}
function Xo(t, e, n, s, r) {
  if (e === "innerHTML" || e === "textContent") {
    n != null && (t[e] = e === "innerHTML" ? Cl(n) : n);
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
    a === "boolean" ? n = La(n) : n == null && a === "string" ? (n = "", o = !0) : a === "number" && (n = 0, o = !0);
  }
  try {
    t[e] = n;
  } catch {
  }
  o && t.removeAttribute(r || e);
}
function es(t, e, n, s) {
  t.addEventListener(e, n, s);
}
function Rf(t, e, n, s) {
  t.removeEventListener(e, n, s);
}
const Zo = Symbol("_vei");
function If(t, e, n, s, r = null) {
  const i = t[Zo] || (t[Zo] = {}), o = i[e];
  if (s && o)
    o.value = s;
  else {
    const [a, l] = Lf(e);
    if (s) {
      const h = i[e] = Nf(
        s,
        r
      );
      es(t, a, h, l);
    } else o && (Rf(t, a, o, l), i[e] = void 0);
  }
}
const Jo = /(?:Once|Passive|Capture)$/;
function Lf(t) {
  let e;
  if (Jo.test(t)) {
    e = {};
    let s;
    for (; s = t.match(Jo); )
      t = t.slice(0, t.length - s[0].length), e[s[0].toLowerCase()] = !0;
  }
  return [t[2] === ":" ? t.slice(3) : Nn(t.slice(2)), e];
}
let Yr = 0;
const Of = /* @__PURE__ */ Promise.resolve(), Pf = () => Yr || (Of.then(() => Yr = 0), Yr = Date.now());
function Nf(t, e) {
  const n = (s) => {
    if (!s._vts)
      s._vts = Date.now();
    else if (s._vts <= n.attached)
      return;
    cn(
      Ff(s, n.value),
      e,
      5,
      [s]
    );
  };
  return n.value = t, n.attached = Pf(), n;
}
function Ff(t, e) {
  if (fe(e)) {
    const n = t.stopImmediatePropagation;
    return t.stopImmediatePropagation = () => {
      n.call(t), t._stopped = !0;
    }, e.map(
      (s) => (r) => !r._stopped && s && s(r)
    );
  } else
    return e;
}
const Qo = (t) => t.charCodeAt(0) === 111 && t.charCodeAt(1) === 110 && // lowercase letter
t.charCodeAt(2) > 96 && t.charCodeAt(2) < 123, Df = (t, e, n, s, r, i) => {
  const o = r === "svg";
  e === "class" ? xf(t, s, o) : e === "style" ? Ef(t, n, s) : kr(e) ? Li(e) || If(t, e, n, s, i) : (e[0] === "." ? (e = e.slice(1), !0) : e[0] === "^" ? (e = e.slice(1), !1) : Mf(t, e, s, o)) ? (Xo(t, e, s), !t.tagName.includes("-") && (e === "value" || e === "checked" || e === "selected") && Yo(t, e, s, o, i, e !== "value")) : /* #11081 force set props for possible async custom element */ t._isVueCE && (/[A-Z]/.test(e) || !pt(s)) ? Xo(t, In(e), s, i, e) : (e === "true-value" ? t._trueValue = s : e === "false-value" && (t._falseValue = s), Yo(t, e, s, o));
};
function Mf(t, e, n, s) {
  if (s)
    return !!(e === "innerHTML" || e === "textContent" || e in t && Qo(e) && me(n));
  if (e === "spellcheck" || e === "draggable" || e === "translate" || e === "autocorrect" || e === "form" || e === "list" && t.tagName === "INPUT" || e === "type" && t.tagName === "TEXTAREA")
    return !1;
  if (e === "width" || e === "height") {
    const r = t.tagName;
    if (r === "IMG" || r === "VIDEO" || r === "CANVAS" || r === "SOURCE")
      return !1;
  }
  return Qo(e) && pt(n) ? !1 : e in t;
}
const ea = (t) => {
  const e = t.props["onUpdate:modelValue"] || !1;
  return fe(e) ? (n) => nr(e, n) : e;
};
function $f(t) {
  t.target.composing = !0;
}
function ta(t) {
  const e = t.target;
  e.composing && (e.composing = !1, e.dispatchEvent(new Event("input")));
}
const Xr = Symbol("_assign"), zn = {
  created(t, { modifiers: { lazy: e, trim: n, number: s } }, r) {
    t[Xr] = ea(r);
    const i = s || r.props && r.props.type === "number";
    es(t, e ? "change" : "input", (o) => {
      if (o.target.composing) return;
      let a = t.value;
      n && (a = a.trim()), i && (a = li(a)), t[Xr](a);
    }), n && es(t, "change", () => {
      t.value = t.value.trim();
    }), e || (es(t, "compositionstart", $f), es(t, "compositionend", ta), es(t, "change", ta));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(t, { value: e }) {
    t.value = e ?? "";
  },
  beforeUpdate(t, { value: e, oldValue: n, modifiers: { lazy: s, trim: r, number: i } }, o) {
    if (t[Xr] = ea(o), t.composing) return;
    const a = (i || t.type === "number") && !/^0\d/.test(t.value) ? li(t.value) : t.value, l = e ?? "";
    a !== l && (document.activeElement === t && t.type !== "range" && (s && e === n || r && t.value.trim() === l) || (t.value = l));
  }
}, Bf = ["ctrl", "shift", "alt", "meta"], Uf = {
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
  exact: (t, e) => Bf.some((n) => t[`${n}Key`] && !e.includes(n))
}, Jn = (t, e) => {
  const n = t._withMods || (t._withMods = {}), s = e.join(".");
  return n[s] || (n[s] = (r, ...i) => {
    for (let o = 0; o < e.length; o++) {
      const a = Uf[e[o]];
      if (a && a(r, e)) return;
    }
    return t(r, ...i);
  });
}, zf = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, na = (t, e) => {
  const n = t._withKeys || (t._withKeys = {}), s = e.join(".");
  return n[s] || (n[s] = (r) => {
    if (!("key" in r))
      return;
    const i = Nn(r.key);
    if (e.some(
      (o) => o === i || zf[o] === i
    ))
      return t(r);
  });
}, Hf = /* @__PURE__ */ kt({ patchProp: Df }, wf);
let sa;
function Wf() {
  return sa || (sa = Wu(Hf));
}
const qf = (...t) => {
  const e = Wf().createApp(...t), { mount: n } = e;
  return e.mount = (s) => {
    const r = Vf(s);
    if (!r) return;
    const i = e._component;
    !me(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
    const o = n(r, !1, jf(r));
    return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), o;
  }, e;
};
function jf(t) {
  if (t instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && t instanceof MathMLElement)
    return "mathml";
}
function Vf(t) {
  return pt(t) ? document.querySelector(t) : t;
}
const Tn = (t) => {
  const e = t.replace("#", ""), n = parseInt(e.substr(0, 2), 16), s = parseInt(e.substr(2, 2), 16), r = parseInt(e.substr(4, 2), 16);
  return (n * 299 + s * 587 + r * 114) / 1e3 < 128;
}, Kf = (t, e) => {
  const n = t.replace("#", ""), s = parseInt(n.substr(0, 2), 16), r = parseInt(n.substr(2, 2), 16), i = parseInt(n.substr(4, 2), 16), o = Tn(t), a = o ? Math.min(255, s + e) : Math.max(0, s - e), l = o ? Math.min(255, r + e) : Math.max(0, r - e), h = o ? Math.min(255, i + e) : Math.max(0, i - e);
  return `#${a.toString(16).padStart(2, "0")}${l.toString(16).padStart(2, "0")}${h.toString(16).padStart(2, "0")}`;
}, ps = (t) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t), Gf = (t) => {
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
function Gi() {
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
var Vn = Gi();
function Rl(t) {
  Vn = t;
}
var Ns = { exec: () => null };
function Ue(t, e = "") {
  let n = typeof t == "string" ? t : t.source;
  const s = {
    replace: (r, i) => {
      let o = typeof i == "string" ? i : i.source;
      return o = o.replace(Rt.caret, "$1"), n = n.replace(r, o), s;
    },
    getRegex: () => new RegExp(n, e)
  };
  return s;
}
var Rt = {
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
}, Yf = /^(?:[ \t]*(?:\n|$))+/, Xf = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/, Zf = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, Hs = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, Jf = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, Yi = /(?:[*+-]|\d{1,9}[.)])/, Il = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/, Ll = Ue(Il).replace(/bull/g, Yi).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(), Qf = Ue(Il).replace(/bull/g, Yi).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(), Xi = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/, eh = /^[^\n]+/, Zi = /(?!\s*\])(?:\\.|[^\[\]\\])+/, th = Ue(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", Zi).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), nh = Ue(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, Yi).getRegex(), Or = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", Ji = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, sh = Ue(
  "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))",
  "i"
).replace("comment", Ji).replace("tag", Or).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), Ol = Ue(Xi).replace("hr", Hs).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Or).getRegex(), rh = Ue(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", Ol).getRegex(), Qi = {
  blockquote: rh,
  code: Xf,
  def: th,
  fences: Zf,
  heading: Jf,
  hr: Hs,
  html: sh,
  lheading: Ll,
  list: nh,
  newline: Yf,
  paragraph: Ol,
  table: Ns,
  text: eh
}, ra = Ue(
  "^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"
).replace("hr", Hs).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Or).getRegex(), ih = {
  ...Qi,
  lheading: Qf,
  table: ra,
  paragraph: Ue(Xi).replace("hr", Hs).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", ra).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Or).getRegex()
}, oh = {
  ...Qi,
  html: Ue(
    `^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`
  ).replace("comment", Ji).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
  heading: /^(#{1,6})(.*)(?:\n+|$)/,
  fences: Ns,
  // fences not supported
  lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  paragraph: Ue(Xi).replace("hr", Hs).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", Ll).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
}, ah = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, lh = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, Pl = /^( {2,}|\\)\n(?!\s*$)/, ch = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, Pr = /[\p{P}\p{S}]/u, eo = /[\s\p{P}\p{S}]/u, Nl = /[^\s\p{P}\p{S}]/u, uh = Ue(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, eo).getRegex(), Fl = /(?!~)[\p{P}\p{S}]/u, fh = /(?!~)[\s\p{P}\p{S}]/u, hh = /(?:[^\s\p{P}\p{S}]|~)/u, dh = /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g, Dl = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/, ph = Ue(Dl, "u").replace(/punct/g, Pr).getRegex(), gh = Ue(Dl, "u").replace(/punct/g, Fl).getRegex(), Ml = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", mh = Ue(Ml, "gu").replace(/notPunctSpace/g, Nl).replace(/punctSpace/g, eo).replace(/punct/g, Pr).getRegex(), _h = Ue(Ml, "gu").replace(/notPunctSpace/g, hh).replace(/punctSpace/g, fh).replace(/punct/g, Fl).getRegex(), yh = Ue(
  "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)",
  "gu"
).replace(/notPunctSpace/g, Nl).replace(/punctSpace/g, eo).replace(/punct/g, Pr).getRegex(), vh = Ue(/\\(punct)/, "gu").replace(/punct/g, Pr).getRegex(), bh = Ue(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), wh = Ue(Ji).replace("(?:-->|$)", "-->").getRegex(), kh = Ue(
  "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>"
).replace("comment", wh).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), vr = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/, xh = Ue(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", vr).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), $l = Ue(/^!?\[(label)\]\[(ref)\]/).replace("label", vr).replace("ref", Zi).getRegex(), Bl = Ue(/^!?\[(ref)\](?:\[\])?/).replace("ref", Zi).getRegex(), Th = Ue("reflink|nolink(?!\\()", "g").replace("reflink", $l).replace("nolink", Bl).getRegex(), to = {
  _backpedal: Ns,
  // only used for GFM url
  anyPunctuation: vh,
  autolink: bh,
  blockSkip: dh,
  br: Pl,
  code: lh,
  del: Ns,
  emStrongLDelim: ph,
  emStrongRDelimAst: mh,
  emStrongRDelimUnd: yh,
  escape: ah,
  link: xh,
  nolink: Bl,
  punctuation: uh,
  reflink: $l,
  reflinkSearch: Th,
  tag: kh,
  text: ch,
  url: Ns
}, Sh = {
  ...to,
  link: Ue(/^!?\[(label)\]\((.*?)\)/).replace("label", vr).getRegex(),
  reflink: Ue(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", vr).getRegex()
}, vi = {
  ...to,
  emStrongRDelimAst: _h,
  emStrongLDelim: gh,
  url: Ue(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, "i").replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
  _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
}, Ah = {
  ...vi,
  br: Ue(Pl).replace("{2,}", "*").getRegex(),
  text: Ue(vi.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
}, Zs = {
  normal: Qi,
  gfm: ih,
  pedantic: oh
}, gs = {
  normal: to,
  gfm: vi,
  breaks: Ah,
  pedantic: Sh
}, Eh = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}, ia = (t) => Eh[t];
function nn(t, e) {
  if (e) {
    if (Rt.escapeTest.test(t))
      return t.replace(Rt.escapeReplace, ia);
  } else if (Rt.escapeTestNoEncode.test(t))
    return t.replace(Rt.escapeReplaceNoEncode, ia);
  return t;
}
function oa(t) {
  try {
    t = encodeURI(t).replace(Rt.percentDecode, "%");
  } catch {
    return null;
  }
  return t;
}
function aa(t, e) {
  var i;
  const n = t.replace(Rt.findPipe, (o, a, l) => {
    let h = !1, u = a;
    for (; --u >= 0 && l[u] === "\\"; ) h = !h;
    return h ? "|" : " |";
  }), s = n.split(Rt.splitPipe);
  let r = 0;
  if (s[0].trim() || s.shift(), s.length > 0 && !((i = s.at(-1)) != null && i.trim()) && s.pop(), e)
    if (s.length > e)
      s.splice(e);
    else
      for (; s.length < e; ) s.push("");
  for (; r < s.length; r++)
    s[r] = s[r].trim().replace(Rt.slashPipe, "|");
  return s;
}
function ms(t, e, n) {
  const s = t.length;
  if (s === 0)
    return "";
  let r = 0;
  for (; r < s && t.charAt(s - r - 1) === e; )
    r++;
  return t.slice(0, s - r);
}
function Ch(t, e) {
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
function la(t, e, n, s, r) {
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
function Rh(t, e, n) {
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
var br = class {
  // set by the lexer
  constructor(t) {
    Xe(this, "options");
    Xe(this, "rules");
    // set by the lexer
    Xe(this, "lexer");
    this.options = t || Vn;
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
        text: this.options.pedantic ? n : ms(n, `
`)
      };
    }
  }
  fences(t) {
    const e = this.rules.block.fences.exec(t);
    if (e) {
      const n = e[0], s = Rh(n, e[3] || "", this.rules);
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
        const s = ms(n, "#");
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
        raw: ms(e[0], `
`)
      };
  }
  blockquote(t) {
    const e = this.rules.block.blockquote.exec(t);
    if (e) {
      let n = ms(e[0], `
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
        const b = this.lexer.state.top;
        if (this.lexer.state.top = !0, this.lexer.blockTokens(u, i, !0), this.lexer.state.top = b, n.length === 0)
          break;
        const v = i.at(-1);
        if ((v == null ? void 0 : v.type) === "code")
          break;
        if ((v == null ? void 0 : v.type) === "blockquote") {
          const F = v, B = F.raw + `
` + n.join(`
`), G = this.blockquote(B);
          i[i.length - 1] = G, s = s.substring(0, s.length - F.raw.length) + G.raw, r = r.substring(0, r.length - F.text.length) + G.text;
          break;
        } else if ((v == null ? void 0 : v.type) === "list") {
          const F = v, B = F.raw + `
` + n.join(`
`), G = this.list(B);
          i[i.length - 1] = G, s = s.substring(0, s.length - v.raw.length) + G.raw, r = r.substring(0, r.length - F.raw.length) + G.raw, n = B.substring(i.at(-1).raw.length).split(`
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
        let l = !1, h = "", u = "";
        if (!(e = i.exec(t)) || this.rules.block.hr.test(t))
          break;
        h = e[0], t = t.substring(h.length);
        let b = e[2].split(`
`, 1)[0].replace(this.rules.other.listReplaceTabs, (ne) => " ".repeat(3 * ne.length)), v = t.split(`
`, 1)[0], F = !b.trim(), B = 0;
        if (this.options.pedantic ? (B = 2, u = b.trimStart()) : F ? B = e[1].length + 1 : (B = e[2].search(this.rules.other.nonSpaceChar), B = B > 4 ? 1 : B, u = b.slice(B), B += e[1].length), F && this.rules.other.blankLine.test(v) && (h += v + `
`, t = t.substring(v.length + 1), l = !0), !l) {
          const ne = this.rules.other.nextBulletRegex(B), Ee = this.rules.other.hrRegex(B), ke = this.rules.other.fencesBeginRegex(B), z = this.rules.other.headingBeginRegex(B), H = this.rules.other.htmlBeginRegex(B);
          for (; t; ) {
            const J = t.split(`
`, 1)[0];
            let j;
            if (v = J, this.options.pedantic ? (v = v.replace(this.rules.other.listReplaceNesting, "  "), j = v) : j = v.replace(this.rules.other.tabCharGlobal, "    "), ke.test(v) || z.test(v) || H.test(v) || ne.test(v) || Ee.test(v))
              break;
            if (j.search(this.rules.other.nonSpaceChar) >= B || !v.trim())
              u += `
` + j.slice(B);
            else {
              if (F || b.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || ke.test(b) || z.test(b) || Ee.test(b))
                break;
              u += `
` + v;
            }
            !F && !v.trim() && (F = !0), h += J + `
`, t = t.substring(J.length + 1), b = j.slice(B);
          }
        }
        r.loose || (o ? r.loose = !0 : this.rules.other.doubleBlankLine.test(h) && (o = !0));
        let G = null, Ce;
        this.options.gfm && (G = this.rules.other.listIsTask.exec(u), G && (Ce = G[0] !== "[ ] ", u = u.replace(this.rules.other.listReplaceTask, ""))), r.items.push({
          type: "list_item",
          raw: h,
          task: !!G,
          checked: Ce,
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
          const h = r.items[l].tokens.filter((b) => b.type === "space"), u = h.length > 0 && h.some((b) => this.rules.other.anyLine.test(b.raw));
          r.loose = u;
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
    const n = aa(e[1]), s = e[2].replace(this.rules.other.tableAlignChars, "").split("|"), r = (o = e[3]) != null && o.trim() ? e[3].replace(this.rules.other.tableRowBlankLine, "").split(`
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
        i.rows.push(aa(a, i.header.length).map((l, h) => ({
          text: l,
          tokens: this.lexer.inline(l),
          header: !1,
          align: i.align[h]
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
        const i = ms(n.slice(0, -1), "\\");
        if ((n.length - i.length) % 2 === 0)
          return;
      } else {
        const i = Ch(e[2], "()");
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
      return s = s.trim(), this.rules.other.startAngleBracket.test(s) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n) ? s = s.slice(1) : s = s.slice(1, -1)), la(e, {
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
      return la(n, r, n[0], this.lexer, this.rules);
    }
  }
  emStrong(t, e, n = "") {
    let s = this.rules.inline.emStrongLDelim.exec(t);
    if (!s || s[3] && n.match(this.rules.other.unicodeAlphaNumeric)) return;
    if (!(s[1] || s[2] || "") || !n || this.rules.inline.punctuation.exec(n)) {
      const i = [...s[0]].length - 1;
      let o, a, l = i, h = 0;
      const u = s[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      for (u.lastIndex = 0, e = e.slice(-1 * t.length + i); (s = u.exec(e)) != null; ) {
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
        const b = [...s[0]][0].length, v = t.slice(0, i + s.index + b + a);
        if (Math.min(i, a) % 2) {
          const B = v.slice(1, -1);
          return {
            type: "em",
            raw: v,
            text: B,
            tokens: this.lexer.inlineTokens(B)
          };
        }
        const F = v.slice(2, -2);
        return {
          type: "strong",
          raw: v,
          text: F,
          tokens: this.lexer.inlineTokens(F)
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
}, _n = class bi {
  constructor(e) {
    Xe(this, "tokens");
    Xe(this, "options");
    Xe(this, "state");
    Xe(this, "tokenizer");
    Xe(this, "inlineQueue");
    this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = e || Vn, this.options.tokenizer = this.options.tokenizer || new br(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = {
      inLink: !1,
      inRawBlock: !1,
      top: !0
    };
    const n = {
      other: Rt,
      block: Zs.normal,
      inline: gs.normal
    };
    this.options.pedantic ? (n.block = Zs.pedantic, n.inline = gs.pedantic) : this.options.gfm && (n.block = Zs.gfm, this.options.breaks ? n.inline = gs.breaks : n.inline = gs.gfm), this.tokenizer.rules = n;
  }
  /**
   * Expose Rules
   */
  static get rules() {
    return {
      block: Zs,
      inline: gs
    };
  }
  /**
   * Static Lex Method
   */
  static lex(e, n) {
    return new bi(n).lex(e);
  }
  /**
   * Static Lex Inline Method
   */
  static lexInline(e, n) {
    return new bi(n).inlineTokens(e);
  }
  /**
   * Preprocessing
   */
  lex(e) {
    e = e.replace(Rt.carriageReturn, `
`), this.blockTokens(e, this.tokens);
    for (let n = 0; n < this.inlineQueue.length; n++) {
      const s = this.inlineQueue[n];
      this.inlineTokens(s.src, s.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(e, n = [], s = !1) {
    var r, i, o;
    for (this.options.pedantic && (e = e.replace(Rt.tabCharGlobal, "    ").replace(Rt.spaceLine, "")); e; ) {
      let a;
      if ((i = (r = this.options.extensions) == null ? void 0 : r.block) != null && i.some((h) => (a = h.call({ lexer: this }, e, n)) ? (e = e.substring(a.raw.length), n.push(a), !0) : !1))
        continue;
      if (a = this.tokenizer.space(e)) {
        e = e.substring(a.raw.length);
        const h = n.at(-1);
        a.raw.length === 1 && h !== void 0 ? h.raw += `
` : n.push(a);
        continue;
      }
      if (a = this.tokenizer.code(e)) {
        e = e.substring(a.raw.length);
        const h = n.at(-1);
        (h == null ? void 0 : h.type) === "paragraph" || (h == null ? void 0 : h.type) === "text" ? (h.raw += `
` + a.raw, h.text += `
` + a.text, this.inlineQueue.at(-1).src = h.text) : n.push(a);
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
        const h = n.at(-1);
        (h == null ? void 0 : h.type) === "paragraph" || (h == null ? void 0 : h.type) === "text" ? (h.raw += `
` + a.raw, h.text += `
` + a.raw, this.inlineQueue.at(-1).src = h.text) : this.tokens.links[a.tag] || (this.tokens.links[a.tag] = {
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
        let h = 1 / 0;
        const u = e.slice(1);
        let b;
        this.options.extensions.startBlock.forEach((v) => {
          b = v.call({ lexer: this }, u), typeof b == "number" && b >= 0 && (h = Math.min(h, b));
        }), h < 1 / 0 && h >= 0 && (l = e.substring(0, h + 1));
      }
      if (this.state.top && (a = this.tokenizer.paragraph(l))) {
        const h = n.at(-1);
        s && (h == null ? void 0 : h.type) === "paragraph" ? (h.raw += `
` + a.raw, h.text += `
` + a.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = h.text) : n.push(a), s = l.length !== e.length, e = e.substring(a.raw.length);
        continue;
      }
      if (a = this.tokenizer.text(e)) {
        e = e.substring(a.raw.length);
        const h = n.at(-1);
        (h == null ? void 0 : h.type) === "text" ? (h.raw += `
` + a.raw, h.text += `
` + a.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = h.text) : n.push(a);
        continue;
      }
      if (e) {
        const h = "Infinite loop on byte: " + e.charCodeAt(0);
        if (this.options.silent) {
          console.error(h);
          break;
        } else
          throw new Error(h);
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
    var a, l, h;
    let s = e, r = null;
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
    for (; e; ) {
      i || (o = ""), i = !1;
      let u;
      if ((l = (a = this.options.extensions) == null ? void 0 : a.inline) != null && l.some((v) => (u = v.call({ lexer: this }, e, n)) ? (e = e.substring(u.raw.length), n.push(u), !0) : !1))
        continue;
      if (u = this.tokenizer.escape(e)) {
        e = e.substring(u.raw.length), n.push(u);
        continue;
      }
      if (u = this.tokenizer.tag(e)) {
        e = e.substring(u.raw.length), n.push(u);
        continue;
      }
      if (u = this.tokenizer.link(e)) {
        e = e.substring(u.raw.length), n.push(u);
        continue;
      }
      if (u = this.tokenizer.reflink(e, this.tokens.links)) {
        e = e.substring(u.raw.length);
        const v = n.at(-1);
        u.type === "text" && (v == null ? void 0 : v.type) === "text" ? (v.raw += u.raw, v.text += u.text) : n.push(u);
        continue;
      }
      if (u = this.tokenizer.emStrong(e, s, o)) {
        e = e.substring(u.raw.length), n.push(u);
        continue;
      }
      if (u = this.tokenizer.codespan(e)) {
        e = e.substring(u.raw.length), n.push(u);
        continue;
      }
      if (u = this.tokenizer.br(e)) {
        e = e.substring(u.raw.length), n.push(u);
        continue;
      }
      if (u = this.tokenizer.del(e)) {
        e = e.substring(u.raw.length), n.push(u);
        continue;
      }
      if (u = this.tokenizer.autolink(e)) {
        e = e.substring(u.raw.length), n.push(u);
        continue;
      }
      if (!this.state.inLink && (u = this.tokenizer.url(e))) {
        e = e.substring(u.raw.length), n.push(u);
        continue;
      }
      let b = e;
      if ((h = this.options.extensions) != null && h.startInline) {
        let v = 1 / 0;
        const F = e.slice(1);
        let B;
        this.options.extensions.startInline.forEach((G) => {
          B = G.call({ lexer: this }, F), typeof B == "number" && B >= 0 && (v = Math.min(v, B));
        }), v < 1 / 0 && v >= 0 && (b = e.substring(0, v + 1));
      }
      if (u = this.tokenizer.inlineText(b)) {
        e = e.substring(u.raw.length), u.raw.slice(-1) !== "_" && (o = u.raw.slice(-1)), i = !0;
        const v = n.at(-1);
        (v == null ? void 0 : v.type) === "text" ? (v.raw += u.raw, v.text += u.text) : n.push(u);
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
}, wr = class {
  // set by the parser
  constructor(t) {
    Xe(this, "options");
    Xe(this, "parser");
    this.options = t || Vn;
  }
  space(t) {
    return "";
  }
  code({ text: t, lang: e, escaped: n }) {
    var i;
    const s = (i = (e || "").match(Rt.notSpaceStart)) == null ? void 0 : i[0], r = t.replace(Rt.endingNewline, "") + `
`;
    return s ? '<pre><code class="language-' + nn(s) + '">' + (n ? r : nn(r, !0)) + `</code></pre>
` : "<pre><code>" + (n ? r : nn(r, !0)) + `</code></pre>
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
      t.loose ? ((n = t.tokens[0]) == null ? void 0 : n.type) === "paragraph" ? (t.tokens[0].text = s + " " + t.tokens[0].text, t.tokens[0].tokens && t.tokens[0].tokens.length > 0 && t.tokens[0].tokens[0].type === "text" && (t.tokens[0].tokens[0].text = s + " " + nn(t.tokens[0].tokens[0].text), t.tokens[0].tokens[0].escaped = !0)) : t.tokens.unshift({
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
    return `<code>${nn(t, !0)}</code>`;
  }
  br(t) {
    return "<br>";
  }
  del({ tokens: t }) {
    return `<del>${this.parser.parseInline(t)}</del>`;
  }
  link({ href: t, title: e, tokens: n }) {
    const s = this.parser.parseInline(n), r = oa(t);
    if (r === null)
      return s;
    t = r;
    let i = '<a href="' + t + '"';
    return e && (i += ' title="' + nn(e) + '"'), i += ">" + s + "</a>", i;
  }
  image({ href: t, title: e, text: n, tokens: s }) {
    s && (n = this.parser.parseInline(s, this.parser.textRenderer));
    const r = oa(t);
    if (r === null)
      return nn(n);
    t = r;
    let i = `<img src="${t}" alt="${n}"`;
    return e && (i += ` title="${nn(e)}"`), i += ">", i;
  }
  text(t) {
    return "tokens" in t && t.tokens ? this.parser.parseInline(t.tokens) : "escaped" in t && t.escaped ? t.text : nn(t.text);
  }
}, no = class {
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
}, yn = class wi {
  constructor(e) {
    Xe(this, "options");
    Xe(this, "renderer");
    Xe(this, "textRenderer");
    this.options = e || Vn, this.options.renderer = this.options.renderer || new wr(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new no();
  }
  /**
   * Static Parse Method
   */
  static parse(e, n) {
    return new wi(n).parse(e);
  }
  /**
   * Static Parse Inline Method
   */
  static parseInline(e, n) {
    return new wi(n).parseInline(e);
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
          for (; o + 1 < e.length && e[o + 1].type === "text"; )
            h = e[++o], u += `
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
  parseInline(e, n = this.renderer) {
    var r, i;
    let s = "";
    for (let o = 0; o < e.length; o++) {
      const a = e[o];
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
}, oi, ar = (oi = class {
  constructor(t) {
    Xe(this, "options");
    Xe(this, "block");
    this.options = t || Vn;
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
}, Xe(oi, "passThroughHooks", /* @__PURE__ */ new Set([
  "preprocess",
  "postprocess",
  "processAllTokens"
])), oi), Ih = class {
  constructor(...t) {
    Xe(this, "defaults", Gi());
    Xe(this, "options", this.setOptions);
    Xe(this, "parse", this.parseMarkdown(!0));
    Xe(this, "parseInline", this.parseMarkdown(!1));
    Xe(this, "Parser", yn);
    Xe(this, "Renderer", wr);
    Xe(this, "TextRenderer", no);
    Xe(this, "Lexer", _n);
    Xe(this, "Tokenizer", br);
    Xe(this, "Hooks", ar);
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
        const r = this.defaults.renderer || new wr(this.defaults);
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
        const r = this.defaults.tokenizer || new br(this.defaults);
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
        const r = this.defaults.hooks || new ar();
        for (const i in n.hooks) {
          if (!(i in r))
            throw new Error(`hook '${i}' does not exist`);
          if (["options", "block"].includes(i))
            continue;
          const o = i, a = n.hooks[o], l = r[o];
          ar.passThroughHooks.has(i) ? r[o] = (h) => {
            if (this.defaults.async)
              return Promise.resolve(a.call(r, h)).then((b) => l.call(r, b));
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
  onError(t, e) {
    return (n) => {
      if (n.message += `
Please report this to https://github.com/markedjs/marked.`, t) {
        const s = "<p>An error occurred:</p><pre>" + nn(n.message + "", !0) + "</pre>";
        return e ? Promise.resolve(s) : s;
      }
      if (e)
        return Promise.reject(n);
      throw n;
    };
  }
}, jn = new Ih();
function Ie(t, e) {
  return jn.parse(t, e);
}
Ie.options = Ie.setOptions = function(t) {
  return jn.setOptions(t), Ie.defaults = jn.defaults, Rl(Ie.defaults), Ie;
};
Ie.getDefaults = Gi;
Ie.defaults = Vn;
Ie.use = function(...t) {
  return jn.use(...t), Ie.defaults = jn.defaults, Rl(Ie.defaults), Ie;
};
Ie.walkTokens = function(t, e) {
  return jn.walkTokens(t, e);
};
Ie.parseInline = jn.parseInline;
Ie.Parser = yn;
Ie.parser = yn.parse;
Ie.Renderer = wr;
Ie.TextRenderer = no;
Ie.Lexer = _n;
Ie.lexer = _n.lex;
Ie.Tokenizer = br;
Ie.Hooks = ar;
Ie.parse = Ie;
Ie.options;
Ie.setOptions;
Ie.use;
Ie.walkTokens;
Ie.parseInline;
yn.parse;
_n.lex;
/*! @license DOMPurify 3.2.6 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.2.6/LICENSE */
const {
  entries: Ul,
  setPrototypeOf: ca,
  isFrozen: Lh,
  getPrototypeOf: Oh,
  getOwnPropertyDescriptor: Ph
} = Object;
let {
  freeze: It,
  seal: Vt,
  create: zl
} = Object, {
  apply: ki,
  construct: xi
} = typeof Reflect < "u" && Reflect;
It || (It = function(e) {
  return e;
});
Vt || (Vt = function(e) {
  return e;
});
ki || (ki = function(e, n, s) {
  return e.apply(n, s);
});
xi || (xi = function(e, n) {
  return new e(...n);
});
const Js = Lt(Array.prototype.forEach), Nh = Lt(Array.prototype.lastIndexOf), ua = Lt(Array.prototype.pop), _s = Lt(Array.prototype.push), Fh = Lt(Array.prototype.splice), lr = Lt(String.prototype.toLowerCase), Zr = Lt(String.prototype.toString), fa = Lt(String.prototype.match), ys = Lt(String.prototype.replace), Dh = Lt(String.prototype.indexOf), Mh = Lt(String.prototype.trim), Xt = Lt(Object.prototype.hasOwnProperty), St = Lt(RegExp.prototype.test), vs = $h(TypeError);
function Lt(t) {
  return function(e) {
    e instanceof RegExp && (e.lastIndex = 0);
    for (var n = arguments.length, s = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
      s[r - 1] = arguments[r];
    return ki(t, e, s);
  };
}
function $h(t) {
  return function() {
    for (var e = arguments.length, n = new Array(e), s = 0; s < e; s++)
      n[s] = arguments[s];
    return xi(t, n);
  };
}
function Ae(t, e) {
  let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : lr;
  ca && ca(t, null);
  let s = e.length;
  for (; s--; ) {
    let r = e[s];
    if (typeof r == "string") {
      const i = n(r);
      i !== r && (Lh(e) || (e[s] = i), r = i);
    }
    t[r] = !0;
  }
  return t;
}
function Bh(t) {
  for (let e = 0; e < t.length; e++)
    Xt(t, e) || (t[e] = null);
  return t;
}
function dn(t) {
  const e = zl(null);
  for (const [n, s] of Ul(t))
    Xt(t, n) && (Array.isArray(s) ? e[n] = Bh(s) : s && typeof s == "object" && s.constructor === Object ? e[n] = dn(s) : e[n] = s);
  return e;
}
function bs(t, e) {
  for (; t !== null; ) {
    const s = Ph(t, e);
    if (s) {
      if (s.get)
        return Lt(s.get);
      if (typeof s.value == "function")
        return Lt(s.value);
    }
    t = Oh(t);
  }
  function n() {
    return null;
  }
  return n;
}
const ha = It(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "section", "select", "shadow", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]), Jr = It(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]), Qr = It(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]), Uh = It(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]), ei = It(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]), zh = It(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]), da = It(["#text"]), pa = It(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns", "slot"]), ti = It(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]), ga = It(["accent", "accentunder", "align", "bevelled", "close", "columnsalign", "columnlines", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lspace", "lquote", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]), Qs = It(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]), Hh = Vt(/\{\{[\w\W]*|[\w\W]*\}\}/gm), Wh = Vt(/<%[\w\W]*|[\w\W]*%>/gm), qh = Vt(/\$\{[\w\W]*/gm), jh = Vt(/^data-[\-\w.\u00B7-\uFFFF]+$/), Vh = Vt(/^aria-[\-\w]+$/), Hl = Vt(
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  // eslint-disable-line no-useless-escape
), Kh = Vt(/^(?:\w+script|data):/i), Gh = Vt(
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g
  // eslint-disable-line no-control-regex
), Wl = Vt(/^html$/i), Yh = Vt(/^[a-z][.\w]*(-[.\w]+)+$/i);
var ma = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ARIA_ATTR: Vh,
  ATTR_WHITESPACE: Gh,
  CUSTOM_ELEMENT: Yh,
  DATA_ATTR: jh,
  DOCTYPE_NAME: Wl,
  ERB_EXPR: Wh,
  IS_ALLOWED_URI: Hl,
  IS_SCRIPT_OR_DATA: Kh,
  MUSTACHE_EXPR: Hh,
  TMPLIT_EXPR: qh
});
const ws = {
  element: 1,
  text: 3,
  // Deprecated
  progressingInstruction: 7,
  comment: 8,
  document: 9
}, Xh = function() {
  return typeof window > "u" ? null : window;
}, Zh = function(e, n) {
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
}, _a = function() {
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
function ql() {
  let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : Xh();
  const e = (Z) => ql(Z);
  if (e.version = "3.2.6", e.removed = [], !t || !t.document || t.document.nodeType !== ws.document || !t.Element)
    return e.isSupported = !1, e;
  let {
    document: n
  } = t;
  const s = n, r = s.currentScript, {
    DocumentFragment: i,
    HTMLTemplateElement: o,
    Node: a,
    Element: l,
    NodeFilter: h,
    NamedNodeMap: u = t.NamedNodeMap || t.MozNamedAttrMap,
    HTMLFormElement: b,
    DOMParser: v,
    trustedTypes: F
  } = t, B = l.prototype, G = bs(B, "cloneNode"), Ce = bs(B, "remove"), ne = bs(B, "nextSibling"), Ee = bs(B, "childNodes"), ke = bs(B, "parentNode");
  if (typeof o == "function") {
    const Z = n.createElement("template");
    Z.content && Z.content.ownerDocument && (n = Z.content.ownerDocument);
  }
  let z, H = "";
  const {
    implementation: J,
    createNodeIterator: j,
    createDocumentFragment: Le,
    getElementsByTagName: it
  } = n, {
    importNode: je
  } = s;
  let Te = _a();
  e.isSupported = typeof Ul == "function" && typeof ke == "function" && J && J.createHTMLDocument !== void 0;
  const {
    MUSTACHE_EXPR: he,
    ERB_EXPR: Ve,
    TMPLIT_EXPR: Qe,
    DATA_ATTR: lt,
    ARIA_ATTR: ie,
    IS_SCRIPT_OR_DATA: de,
    ATTR_WHITESPACE: oe,
    CUSTOM_ELEMENT: Pe
  } = ma;
  let {
    IS_ALLOWED_URI: st
  } = ma, se = null;
  const Oe = Ae({}, [...ha, ...Jr, ...Qr, ...ei, ...da]);
  let Ne = null;
  const W = Ae({}, [...pa, ...ti, ...ga, ...Qs]);
  let ae = Object.seal(zl(null, {
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
  })), le = null, q = null, Ke = !0, nt = !0, ot = !1, Nt = !0, d = !1, m = !0, k = !1, L = !1, S = !1, A = !1, D = !1, $ = !1, N = !0, O = !1;
  const X = "user-content-";
  let U = !0, Y = !1, Q = {}, re = null;
  const _e = Ae({}, ["annotation-xml", "audio", "colgroup", "desc", "foreignobject", "head", "iframe", "math", "mi", "mn", "mo", "ms", "mtext", "noembed", "noframes", "noscript", "plaintext", "script", "style", "svg", "template", "thead", "title", "video", "xmp"]);
  let xe = null;
  const Ge = Ae({}, ["audio", "video", "img", "source", "image", "track"]);
  let ze = null;
  const gt = Ae({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), c = "http://www.w3.org/1998/Math/MathML", _ = "http://www.w3.org/2000/svg", T = "http://www.w3.org/1999/xhtml";
  let x = T, P = !1, V = null;
  const ee = Ae({}, [c, _, T], Zr);
  let be = Ae({}, ["mi", "mo", "mn", "ms", "mtext"]), Se = Ae({}, ["annotation-xml"]);
  const Ye = Ae({}, ["title", "style", "font", "a", "script"]);
  let Fe = null;
  const ft = ["application/xhtml+xml", "text/html"], xt = "text/html";
  let He = null, Ft = null;
  const Ws = n.createElement("form"), ls = function(y) {
    return y instanceof RegExp || y instanceof Function;
  }, Qt = function() {
    let y = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (!(Ft && Ft === y)) {
      if ((!y || typeof y != "object") && (y = {}), y = dn(y), Fe = // eslint-disable-next-line unicorn/prefer-includes
      ft.indexOf(y.PARSER_MEDIA_TYPE) === -1 ? xt : y.PARSER_MEDIA_TYPE, He = Fe === "application/xhtml+xml" ? Zr : lr, se = Xt(y, "ALLOWED_TAGS") ? Ae({}, y.ALLOWED_TAGS, He) : Oe, Ne = Xt(y, "ALLOWED_ATTR") ? Ae({}, y.ALLOWED_ATTR, He) : W, V = Xt(y, "ALLOWED_NAMESPACES") ? Ae({}, y.ALLOWED_NAMESPACES, Zr) : ee, ze = Xt(y, "ADD_URI_SAFE_ATTR") ? Ae(dn(gt), y.ADD_URI_SAFE_ATTR, He) : gt, xe = Xt(y, "ADD_DATA_URI_TAGS") ? Ae(dn(Ge), y.ADD_DATA_URI_TAGS, He) : Ge, re = Xt(y, "FORBID_CONTENTS") ? Ae({}, y.FORBID_CONTENTS, He) : _e, le = Xt(y, "FORBID_TAGS") ? Ae({}, y.FORBID_TAGS, He) : dn({}), q = Xt(y, "FORBID_ATTR") ? Ae({}, y.FORBID_ATTR, He) : dn({}), Q = Xt(y, "USE_PROFILES") ? y.USE_PROFILES : !1, Ke = y.ALLOW_ARIA_ATTR !== !1, nt = y.ALLOW_DATA_ATTR !== !1, ot = y.ALLOW_UNKNOWN_PROTOCOLS || !1, Nt = y.ALLOW_SELF_CLOSE_IN_ATTR !== !1, d = y.SAFE_FOR_TEMPLATES || !1, m = y.SAFE_FOR_XML !== !1, k = y.WHOLE_DOCUMENT || !1, A = y.RETURN_DOM || !1, D = y.RETURN_DOM_FRAGMENT || !1, $ = y.RETURN_TRUSTED_TYPE || !1, S = y.FORCE_BODY || !1, N = y.SANITIZE_DOM !== !1, O = y.SANITIZE_NAMED_PROPS || !1, U = y.KEEP_CONTENT !== !1, Y = y.IN_PLACE || !1, st = y.ALLOWED_URI_REGEXP || Hl, x = y.NAMESPACE || T, be = y.MATHML_TEXT_INTEGRATION_POINTS || be, Se = y.HTML_INTEGRATION_POINTS || Se, ae = y.CUSTOM_ELEMENT_HANDLING || {}, y.CUSTOM_ELEMENT_HANDLING && ls(y.CUSTOM_ELEMENT_HANDLING.tagNameCheck) && (ae.tagNameCheck = y.CUSTOM_ELEMENT_HANDLING.tagNameCheck), y.CUSTOM_ELEMENT_HANDLING && ls(y.CUSTOM_ELEMENT_HANDLING.attributeNameCheck) && (ae.attributeNameCheck = y.CUSTOM_ELEMENT_HANDLING.attributeNameCheck), y.CUSTOM_ELEMENT_HANDLING && typeof y.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements == "boolean" && (ae.allowCustomizedBuiltInElements = y.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements), d && (nt = !1), D && (A = !0), Q && (se = Ae({}, da), Ne = [], Q.html === !0 && (Ae(se, ha), Ae(Ne, pa)), Q.svg === !0 && (Ae(se, Jr), Ae(Ne, ti), Ae(Ne, Qs)), Q.svgFilters === !0 && (Ae(se, Qr), Ae(Ne, ti), Ae(Ne, Qs)), Q.mathMl === !0 && (Ae(se, ei), Ae(Ne, ga), Ae(Ne, Qs))), y.ADD_TAGS && (se === Oe && (se = dn(se)), Ae(se, y.ADD_TAGS, He)), y.ADD_ATTR && (Ne === W && (Ne = dn(Ne)), Ae(Ne, y.ADD_ATTR, He)), y.ADD_URI_SAFE_ATTR && Ae(ze, y.ADD_URI_SAFE_ATTR, He), y.FORBID_CONTENTS && (re === _e && (re = dn(re)), Ae(re, y.FORBID_CONTENTS, He)), U && (se["#text"] = !0), k && Ae(se, ["html", "head", "body"]), se.table && (Ae(se, ["tbody"]), delete le.tbody), y.TRUSTED_TYPES_POLICY) {
        if (typeof y.TRUSTED_TYPES_POLICY.createHTML != "function")
          throw vs('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
        if (typeof y.TRUSTED_TYPES_POLICY.createScriptURL != "function")
          throw vs('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
        z = y.TRUSTED_TYPES_POLICY, H = z.createHTML("");
      } else
        z === void 0 && (z = Zh(F, r)), z !== null && typeof H == "string" && (H = z.createHTML(""));
      It && It(y), Ft = y;
    }
  }, cs = Ae({}, [...Jr, ...Qr, ...Uh]), kn = Ae({}, [...ei, ...zh]), qs = function(y) {
    let M = ke(y);
    (!M || !M.tagName) && (M = {
      namespaceURI: x,
      tagName: "template"
    });
    const K = lr(y.tagName), ye = lr(M.tagName);
    return V[y.namespaceURI] ? y.namespaceURI === _ ? M.namespaceURI === T ? K === "svg" : M.namespaceURI === c ? K === "svg" && (ye === "annotation-xml" || be[ye]) : !!cs[K] : y.namespaceURI === c ? M.namespaceURI === T ? K === "math" : M.namespaceURI === _ ? K === "math" && Se[ye] : !!kn[K] : y.namespaceURI === T ? M.namespaceURI === _ && !Se[ye] || M.namespaceURI === c && !be[ye] ? !1 : !kn[K] && (Ye[K] || !cs[K]) : !!(Fe === "application/xhtml+xml" && V[y.namespaceURI]) : !1;
  }, Tt = function(y) {
    _s(e.removed, {
      element: y
    });
    try {
      ke(y).removeChild(y);
    } catch {
      Ce(y);
    }
  }, xn = function(y, M) {
    try {
      _s(e.removed, {
        attribute: M.getAttributeNode(y),
        from: M
      });
    } catch {
      _s(e.removed, {
        attribute: null,
        from: M
      });
    }
    if (M.removeAttribute(y), y === "is")
      if (A || D)
        try {
          Tt(M);
        } catch {
        }
      else
        try {
          M.setAttribute(y, "");
        } catch {
        }
  }, Kn = function(y) {
    let M = null, K = null;
    if (S)
      y = "<remove></remove>" + y;
    else {
      const rt = fa(y, /^[\r\n\t ]+/);
      K = rt && rt[0];
    }
    Fe === "application/xhtml+xml" && x === T && (y = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + y + "</body></html>");
    const ye = z ? z.createHTML(y) : y;
    if (x === T)
      try {
        M = new v().parseFromString(ye, Fe);
      } catch {
      }
    if (!M || !M.documentElement) {
      M = J.createDocument(x, "template", null);
      try {
        M.documentElement.innerHTML = P ? H : ye;
      } catch {
      }
    }
    const mt = M.body || M.documentElement;
    return y && K && mt.insertBefore(n.createTextNode(K), mt.childNodes[0] || null), x === T ? it.call(M, k ? "html" : "body")[0] : k ? M.documentElement : mt;
  }, js = function(y) {
    return j.call(
      y.ownerDocument || y,
      y,
      // eslint-disable-next-line no-bitwise
      h.SHOW_ELEMENT | h.SHOW_COMMENT | h.SHOW_TEXT | h.SHOW_PROCESSING_INSTRUCTION | h.SHOW_CDATA_SECTION,
      null
    );
  }, Gn = function(y) {
    return y instanceof b && (typeof y.nodeName != "string" || typeof y.textContent != "string" || typeof y.removeChild != "function" || !(y.attributes instanceof u) || typeof y.removeAttribute != "function" || typeof y.setAttribute != "function" || typeof y.namespaceURI != "string" || typeof y.insertBefore != "function" || typeof y.hasChildNodes != "function");
  }, Fn = function(y) {
    return typeof a == "function" && y instanceof a;
  };
  function Dt(Z, y, M) {
    Js(Z, (K) => {
      K.call(e, y, M, Ft);
    });
  }
  const Mt = function(y) {
    let M = null;
    if (Dt(Te.beforeSanitizeElements, y, null), Gn(y))
      return Tt(y), !0;
    const K = He(y.nodeName);
    if (Dt(Te.uponSanitizeElement, y, {
      tagName: K,
      allowedTags: se
    }), m && y.hasChildNodes() && !Fn(y.firstElementChild) && St(/<[/\w!]/g, y.innerHTML) && St(/<[/\w!]/g, y.textContent) || y.nodeType === ws.progressingInstruction || m && y.nodeType === ws.comment && St(/<[/\w]/g, y.data))
      return Tt(y), !0;
    if (!se[K] || le[K]) {
      if (!le[K] && ct(K) && (ae.tagNameCheck instanceof RegExp && St(ae.tagNameCheck, K) || ae.tagNameCheck instanceof Function && ae.tagNameCheck(K)))
        return !1;
      if (U && !re[K]) {
        const ye = ke(y) || y.parentNode, mt = Ee(y) || y.childNodes;
        if (mt && ye) {
          const rt = mt.length;
          for (let vt = rt - 1; vt >= 0; --vt) {
            const Kt = G(mt[vt], !0);
            Kt.__removalCount = (y.__removalCount || 0) + 1, ye.insertBefore(Kt, ne(y));
          }
        }
      }
      return Tt(y), !0;
    }
    return y instanceof l && !qs(y) || (K === "noscript" || K === "noembed" || K === "noframes") && St(/<\/no(script|embed|frames)/i, y.innerHTML) ? (Tt(y), !0) : (d && y.nodeType === ws.text && (M = y.textContent, Js([he, Ve, Qe], (ye) => {
      M = ys(M, ye, " ");
    }), y.textContent !== M && (_s(e.removed, {
      element: y.cloneNode()
    }), y.textContent = M)), Dt(Te.afterSanitizeElements, y, null), !1);
  }, $t = function(y, M, K) {
    if (N && (M === "id" || M === "name") && (K in n || K in Ws))
      return !1;
    if (!(nt && !q[M] && St(lt, M))) {
      if (!(Ke && St(ie, M))) {
        if (!Ne[M] || q[M]) {
          if (
            // First condition does a very basic check if a) it's basically a valid custom element tagname AND
            // b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
            // and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
            !(ct(y) && (ae.tagNameCheck instanceof RegExp && St(ae.tagNameCheck, y) || ae.tagNameCheck instanceof Function && ae.tagNameCheck(y)) && (ae.attributeNameCheck instanceof RegExp && St(ae.attributeNameCheck, M) || ae.attributeNameCheck instanceof Function && ae.attributeNameCheck(M)) || // Alternative, second condition checks if it's an `is`-attribute, AND
            // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
            M === "is" && ae.allowCustomizedBuiltInElements && (ae.tagNameCheck instanceof RegExp && St(ae.tagNameCheck, K) || ae.tagNameCheck instanceof Function && ae.tagNameCheck(K)))
          ) return !1;
        } else if (!ze[M]) {
          if (!St(st, ys(K, oe, ""))) {
            if (!((M === "src" || M === "xlink:href" || M === "href") && y !== "script" && Dh(K, "data:") === 0 && xe[y])) {
              if (!(ot && !St(de, ys(K, oe, "")))) {
                if (K)
                  return !1;
              }
            }
          }
        }
      }
    }
    return !0;
  }, ct = function(y) {
    return y !== "annotation-xml" && fa(y, Pe);
  }, ht = function(y) {
    Dt(Te.beforeSanitizeAttributes, y, null);
    const {
      attributes: M
    } = y;
    if (!M || Gn(y))
      return;
    const K = {
      attrName: "",
      attrValue: "",
      keepAttr: !0,
      allowedAttributes: Ne,
      forceKeepAttr: void 0
    };
    let ye = M.length;
    for (; ye--; ) {
      const mt = M[ye], {
        name: rt,
        namespaceURI: vt,
        value: Kt
      } = mt, Dn = He(rt), us = Kt;
      let _t = rt === "value" ? us : Mh(us);
      if (K.attrName = Dn, K.attrValue = _t, K.keepAttr = !0, K.forceKeepAttr = void 0, Dt(Te.uponSanitizeAttribute, y, K), _t = K.attrValue, O && (Dn === "id" || Dn === "name") && (xn(rt, y), _t = X + _t), m && St(/((--!?|])>)|<\/(style|title)/i, _t)) {
        xn(rt, y);
        continue;
      }
      if (K.forceKeepAttr)
        continue;
      if (!K.keepAttr) {
        xn(rt, y);
        continue;
      }
      if (!Nt && St(/\/>/i, _t)) {
        xn(rt, y);
        continue;
      }
      d && Js([he, Ve, Qe], (Ks) => {
        _t = ys(_t, Ks, " ");
      });
      const Vs = He(y.nodeName);
      if (!$t(Vs, Dn, _t)) {
        xn(rt, y);
        continue;
      }
      if (z && typeof F == "object" && typeof F.getAttributeType == "function" && !vt)
        switch (F.getAttributeType(Vs, Dn)) {
          case "TrustedHTML": {
            _t = z.createHTML(_t);
            break;
          }
          case "TrustedScriptURL": {
            _t = z.createScriptURL(_t);
            break;
          }
        }
      if (_t !== us)
        try {
          vt ? y.setAttributeNS(vt, rt, _t) : y.setAttribute(rt, _t), Gn(y) ? Tt(y) : ua(e.removed);
        } catch {
          xn(rt, y);
        }
    }
    Dt(Te.afterSanitizeAttributes, y, null);
  }, ut = function Z(y) {
    let M = null;
    const K = js(y);
    for (Dt(Te.beforeSanitizeShadowDOM, y, null); M = K.nextNode(); )
      Dt(Te.uponSanitizeShadowNode, M, null), Mt(M), ht(M), M.content instanceof i && Z(M.content);
    Dt(Te.afterSanitizeShadowDOM, y, null);
  };
  return e.sanitize = function(Z) {
    let y = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, M = null, K = null, ye = null, mt = null;
    if (P = !Z, P && (Z = "<!-->"), typeof Z != "string" && !Fn(Z))
      if (typeof Z.toString == "function") {
        if (Z = Z.toString(), typeof Z != "string")
          throw vs("dirty is not a string, aborting");
      } else
        throw vs("toString is not a function");
    if (!e.isSupported)
      return Z;
    if (L || Qt(y), e.removed = [], typeof Z == "string" && (Y = !1), Y) {
      if (Z.nodeName) {
        const Kt = He(Z.nodeName);
        if (!se[Kt] || le[Kt])
          throw vs("root node is forbidden and cannot be sanitized in-place");
      }
    } else if (Z instanceof a)
      M = Kn("<!---->"), K = M.ownerDocument.importNode(Z, !0), K.nodeType === ws.element && K.nodeName === "BODY" || K.nodeName === "HTML" ? M = K : M.appendChild(K);
    else {
      if (!A && !d && !k && // eslint-disable-next-line unicorn/prefer-includes
      Z.indexOf("<") === -1)
        return z && $ ? z.createHTML(Z) : Z;
      if (M = Kn(Z), !M)
        return A ? null : $ ? H : "";
    }
    M && S && Tt(M.firstChild);
    const rt = js(Y ? Z : M);
    for (; ye = rt.nextNode(); )
      Mt(ye), ht(ye), ye.content instanceof i && ut(ye.content);
    if (Y)
      return Z;
    if (A) {
      if (D)
        for (mt = Le.call(M.ownerDocument); M.firstChild; )
          mt.appendChild(M.firstChild);
      else
        mt = M;
      return (Ne.shadowroot || Ne.shadowrootmode) && (mt = je.call(s, mt, !0)), mt;
    }
    let vt = k ? M.outerHTML : M.innerHTML;
    return k && se["!doctype"] && M.ownerDocument && M.ownerDocument.doctype && M.ownerDocument.doctype.name && St(Wl, M.ownerDocument.doctype.name) && (vt = "<!DOCTYPE " + M.ownerDocument.doctype.name + `>
` + vt), d && Js([he, Ve, Qe], (Kt) => {
      vt = ys(vt, Kt, " ");
    }), z && $ ? z.createHTML(vt) : vt;
  }, e.setConfig = function() {
    let Z = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    Qt(Z), L = !0;
  }, e.clearConfig = function() {
    Ft = null, L = !1;
  }, e.isValidAttribute = function(Z, y, M) {
    Ft || Qt({});
    const K = He(Z), ye = He(y);
    return $t(K, ye, M);
  }, e.addHook = function(Z, y) {
    typeof y == "function" && _s(Te[Z], y);
  }, e.removeHook = function(Z, y) {
    if (y !== void 0) {
      const M = Nh(Te[Z], y);
      return M === -1 ? void 0 : Fh(Te[Z], M, 1)[0];
    }
    return ua(Te[Z]);
  }, e.removeHooks = function(Z) {
    Te[Z] = [];
  }, e.removeAllHooks = function() {
    Te = _a();
  }, e;
}
var so = ql();
so.addHook("uponSanitizeElement", (t, e) => {
  var r, i, o, a, l, h;
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
      const u = n.textContent;
      u ? n.replaceWith(u) : (l = n.parentNode) == null || l.removeChild(n);
    } else
      (h = n.parentNode) == null || h.removeChild(n);
});
so.addHook("afterSanitizeAttributes", (t) => {
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
function Jh(t) {
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
  return so.sanitize(t, e);
}
const Ss = [
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
], Qh = (t) => (t || "").split("").reduce((e, n) => e + n.charCodeAt(0), 0) % Ss.length, ed = (t) => {
  const e = Ss[(t % Ss.length + Ss.length) % Ss.length];
  return {
    background: `
            radial-gradient(circle at 32% 28%, rgba(255,255,255,0.22) 0%, transparent 42%),
            radial-gradient(circle at 68% 72%, rgba(0,0,0,0.25) 0%, transparent 38%),
            radial-gradient(ellipse at 50% 50%, ${e.stops})
        `.trim(),
    boxShadow: `0 4px 28px ${e.glow}, inset 0 1px 0 rgba(255,255,255,0.15)`,
    borderRadius: "50%"
  };
}, td = (t, e) => {
  const n = typeof e == "number" && Number.isFinite(e) ? e : Qh(t);
  return ed(n);
}, ro = (t) => !!t && /^https?:\/\//i.test(t);
function ya() {
  return typeof window < "u" && window.APP_CONFIG ? window.APP_CONFIG : {};
}
const Cn = {
  get API_URL() {
    return ya().API_URL || "https://api.chattermate.chat/api/v1";
  },
  get WS_URL() {
    return ya().WS_URL || "wss://api.chattermate.chat";
  }
};
function nd(t) {
  const e = qe(() => ({
    backgroundColor: t.value.chat_background_color || "#ffffff",
    color: Tn(t.value.chat_background_color || "#ffffff") ? "#ffffff" : "#000000"
  })), n = qe(() => ({
    backgroundColor: t.value.chat_bubble_color || "#C9F24E",
    color: Tn(t.value.chat_bubble_color || "#C9F24E") ? "#FFFFFF" : "#000000"
  })), s = qe(() => {
    const h = t.value.chat_background_color || "#F8F9FA", u = Kf(h, 20);
    return {
      backgroundColor: u,
      color: Tn(u) ? "#FFFFFF" : "#000000"
    };
  }), r = qe(() => ({
    backgroundColor: t.value.accent_color || "#C9F24E",
    color: Tn(t.value.accent_color || "#C9F24E") ? "#FFFFFF" : "#000000"
  })), i = qe(() => ({
    color: Tn(t.value.chat_background_color || "#F8F9FA") ? "#FFFFFF" : "#000000"
  })), o = qe(() => ({
    borderBottom: `1px solid ${Tn(t.value.chat_background_color || "#F8F9FA") ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`
  })), a = qe(() => t.value.photo_url ? ro(t.value.photo_url) ? t.value.photo_url : `${Cn.API_URL}${t.value.photo_url}` : ""), l = qe(() => {
    const h = t.value.chat_background_color || "#ffffff";
    return {
      boxShadow: `0 8px 5px ${Tn(h) ? "rgba(0, 0, 0, 0.24)" : "rgba(0, 0, 0, 0.12)"}`
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
const sd = /* @__PURE__ */ new Set(["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]), rd = /* @__PURE__ */ new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);
[...sd, ...rd];
function id(t, e) {
  const n = ge([]), s = ge(!1), r = ge(null), i = (H) => {
    if (H === 0) return "0 Bytes";
    const J = 1024, j = ["Bytes", "KB", "MB", "GB"], Le = Math.floor(Math.log(H) / Math.log(J));
    return parseFloat((H / Math.pow(J, Le)).toFixed(2)) + " " + j[Le];
  }, o = (H) => H.startsWith("image/"), a = (H) => H ? H.startsWith("blob:") || H.startsWith("http://") || H.startsWith("https://") ? H : `${Cn.API_URL}${H}` : "", l = (H) => {
    const J = H.file_url || H.url;
    return J ? J.startsWith("blob:") || J.startsWith("http://") || J.startsWith("https://") ? J : `${Cn.API_URL}${J}` : "";
  }, h = async (H) => {
    const J = H.target;
    J.files && J.files.length > 0 && (await G(Array.from(J.files)), J.value = "");
  }, u = async (H) => {
    var j;
    H.preventDefault();
    const J = (j = H.dataTransfer) == null ? void 0 : j.files;
    J && J.length > 0 && await G(Array.from(J));
  }, b = (H) => {
    H.preventDefault();
  }, v = (H) => {
    H.preventDefault();
  }, F = async (H) => {
    var Le;
    const J = (Le = H.clipboardData) == null ? void 0 : Le.items;
    if (!J) return;
    const j = [];
    for (const it of Array.from(J))
      if (it.kind === "file") {
        const je = it.getAsFile();
        je && j.push(je);
      }
    j.length > 0 && await G(j);
  }, B = async (H, J = 500) => new Promise((j, Le) => {
    const it = new FileReader();
    it.onload = (je) => {
      var he;
      const Te = new Image();
      Te.onload = () => {
        const Ve = document.createElement("canvas");
        let Qe = Te.width, lt = Te.height;
        const ie = 1920;
        (Qe > ie || lt > ie) && (Qe > lt ? (lt = lt / Qe * ie, Qe = ie) : (Qe = Qe / lt * ie, lt = ie)), Ve.width = Qe, Ve.height = lt;
        const de = Ve.getContext("2d");
        if (!de) {
          Le(new Error("Failed to get canvas context"));
          return;
        }
        de.drawImage(Te, 0, 0, Qe, lt);
        let oe = 0.9;
        const Pe = () => {
          Ve.toBlob((st) => {
            if (!st) {
              Le(new Error("Failed to compress image"));
              return;
            }
            if (st.size / 1024 > J && oe > 0.3)
              oe -= 0.1, Pe();
            else {
              const Oe = new FileReader();
              Oe.onload = () => {
                const Ne = Oe.result.split(",")[1];
                j({ blob: st, base64: Ne });
              }, Oe.readAsDataURL(st);
            }
          }, H.type === "image/png" ? "image/png" : "image/jpeg", oe);
        };
        Pe();
      }, Te.onerror = () => Le(new Error("Failed to load image")), Te.src = (he = je.target) == null ? void 0 : he.result;
    }, it.onerror = () => Le(new Error("Failed to read file")), it.readAsDataURL(H);
  }), G = async (H) => {
    if (n.value.length >= 3) {
      alert("Maximum 3 files allowed per message");
      return;
    }
    const je = 3 - n.value.length, Te = H.slice(0, je);
    H.length > je && alert(`Only ${je} more file(s) can be uploaded. Maximum 3 files per message.`);
    for (const he of Te)
      try {
        if (n.value.some((ie) => ie.filename === he.name)) {
          console.warn(`File ${he.name} is already selected`), alert(`File "${he.name}" is already selected`);
          continue;
        }
        const Qe = he.type.startsWith("image/"), lt = Qe ? 5242880 : 10485760;
        if (he.size > lt) {
          const ie = lt / 1048576;
          console.error(`File ${he.name} is too large. Maximum size is ${ie}MB`), alert(`File "${he.name}" is too large. Maximum size for ${Qe ? "images" : "documents"} is ${ie}MB`);
          continue;
        }
        if (Qe)
          try {
            const { blob: ie, base64: de } = await B(he, 500), oe = ie.size;
            console.log(`Compressed ${he.name}: ${(he.size / 1024).toFixed(2)}KB → ${(oe / 1024).toFixed(2)}KB`), n.value.push({
              content: de,
              filename: he.name,
              type: he.type,
              size: oe,
              url: URL.createObjectURL(ie),
              file_url: URL.createObjectURL(ie)
            });
          } catch (ie) {
            console.error("Image compression failed, uploading original:", ie);
            const de = new FileReader();
            de.onload = (oe) => {
              var se;
              const st = ((se = oe.target) == null ? void 0 : se.result).split(",")[1];
              n.value.push({
                content: st,
                filename: he.name,
                type: he.type,
                size: he.size,
                url: URL.createObjectURL(he),
                file_url: URL.createObjectURL(he)
              });
            }, de.readAsDataURL(he);
          }
        else {
          const ie = new FileReader();
          ie.onload = (de) => {
            var st;
            const Pe = ((st = de.target) == null ? void 0 : st.result).split(",")[1];
            n.value.push({
              content: Pe,
              filename: he.name,
              type: he.type || "application/octet-stream",
              size: he.size,
              url: "",
              file_url: ""
            });
          }, ie.readAsDataURL(he);
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
    handleDragOver: b,
    handleDragLeave: v,
    handlePaste: F,
    uploadFiles: G,
    removeAttachment: async (H) => {
      const J = n.value[H];
      if (J) {
        try {
          let j = J.url;
          if (j.startsWith("/uploads/") ? j = j.substring(9) : j.startsWith("/") && (j = j.substring(1)), ro(j))
            try {
              j = new URL(j).pathname.replace(/^\/+/, "");
            } catch {
            }
          const Le = {};
          t.value && (Le.Authorization = `Bearer ${t.value}`);
          const it = await fetch(`${Cn.API_URL}/api/v1/files/upload/${j}`, {
            method: "DELETE",
            headers: Le
          });
          if (it.ok)
            console.log("File deleted successfully from backend.");
          else {
            const je = await it.json();
            console.error("Failed to delete file:", je.detail);
          }
        } catch (j) {
          console.error("Error calling delete API:", j);
        }
        J.url && J.url.startsWith("blob:") && URL.revokeObjectURL(J.url), J.file_url && J.file_url.startsWith("blob:") && URL.revokeObjectURL(J.file_url), n.value.splice(H, 1);
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
const un = /* @__PURE__ */ Object.create(null);
un.open = "0";
un.close = "1";
un.ping = "2";
un.pong = "3";
un.message = "4";
un.upgrade = "5";
un.noop = "6";
const cr = /* @__PURE__ */ Object.create(null);
Object.keys(un).forEach((t) => {
  cr[un[t]] = t;
});
const Ti = { type: "error", data: "parser error" }, jl = typeof Blob == "function" || typeof Blob < "u" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]", Vl = typeof ArrayBuffer == "function", Kl = (t) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(t) : t && t.buffer instanceof ArrayBuffer, io = ({ type: t, data: e }, n, s) => jl && e instanceof Blob ? n ? s(e) : va(e, s) : Vl && (e instanceof ArrayBuffer || Kl(e)) ? n ? s(e) : va(new Blob([e]), s) : s(un[t] + (e || "")), va = (t, e) => {
  const n = new FileReader();
  return n.onload = function() {
    const s = n.result.split(",")[1];
    e("b" + (s || ""));
  }, n.readAsDataURL(t);
};
function ba(t) {
  return t instanceof Uint8Array ? t : t instanceof ArrayBuffer ? new Uint8Array(t) : new Uint8Array(t.buffer, t.byteOffset, t.byteLength);
}
let ni;
function od(t, e) {
  if (jl && t.data instanceof Blob)
    return t.data.arrayBuffer().then(ba).then(e);
  if (Vl && (t.data instanceof ArrayBuffer || Kl(t.data)))
    return e(ba(t.data));
  io(t, !1, (n) => {
    ni || (ni = new TextEncoder()), e(ni.encode(n));
  });
}
const wa = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", As = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (let t = 0; t < wa.length; t++)
  As[wa.charCodeAt(t)] = t;
const ad = (t) => {
  let e = t.length * 0.75, n = t.length, s, r = 0, i, o, a, l;
  t[t.length - 1] === "=" && (e--, t[t.length - 2] === "=" && e--);
  const h = new ArrayBuffer(e), u = new Uint8Array(h);
  for (s = 0; s < n; s += 4)
    i = As[t.charCodeAt(s)], o = As[t.charCodeAt(s + 1)], a = As[t.charCodeAt(s + 2)], l = As[t.charCodeAt(s + 3)], u[r++] = i << 2 | o >> 4, u[r++] = (o & 15) << 4 | a >> 2, u[r++] = (a & 3) << 6 | l & 63;
  return h;
}, ld = typeof ArrayBuffer == "function", oo = (t, e) => {
  if (typeof t != "string")
    return {
      type: "message",
      data: Gl(t, e)
    };
  const n = t.charAt(0);
  return n === "b" ? {
    type: "message",
    data: cd(t.substring(1), e)
  } : cr[n] ? t.length > 1 ? {
    type: cr[n],
    data: t.substring(1)
  } : {
    type: cr[n]
  } : Ti;
}, cd = (t, e) => {
  if (ld) {
    const n = ad(t);
    return Gl(n, e);
  } else
    return { base64: !0, data: t };
}, Gl = (t, e) => {
  switch (e) {
    case "blob":
      return t instanceof Blob ? t : new Blob([t]);
    case "arraybuffer":
    default:
      return t instanceof ArrayBuffer ? t : t.buffer;
  }
}, Yl = "", ud = (t, e) => {
  const n = t.length, s = new Array(n);
  let r = 0;
  t.forEach((i, o) => {
    io(i, !1, (a) => {
      s[o] = a, ++r === n && e(s.join(Yl));
    });
  });
}, fd = (t, e) => {
  const n = t.split(Yl), s = [];
  for (let r = 0; r < n.length; r++) {
    const i = oo(n[r], e);
    if (s.push(i), i.type === "error")
      break;
  }
  return s;
};
function hd() {
  return new TransformStream({
    transform(t, e) {
      od(t, (n) => {
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
let si;
function er(t) {
  return t.reduce((e, n) => e + n.length, 0);
}
function tr(t, e) {
  if (t[0].length === e)
    return t.shift();
  const n = new Uint8Array(e);
  let s = 0;
  for (let r = 0; r < e; r++)
    n[r] = t[0][s++], s === t[0].length && (t.shift(), s = 0);
  return t.length && s < t[0].length && (t[0] = t[0].slice(s)), n;
}
function dd(t, e) {
  si || (si = new TextDecoder());
  const n = [];
  let s = 0, r = -1, i = !1;
  return new TransformStream({
    transform(o, a) {
      for (n.push(o); ; ) {
        if (s === 0) {
          if (er(n) < 1)
            break;
          const l = tr(n, 1);
          i = (l[0] & 128) === 128, r = l[0] & 127, r < 126 ? s = 3 : r === 126 ? s = 1 : s = 2;
        } else if (s === 1) {
          if (er(n) < 2)
            break;
          const l = tr(n, 2);
          r = new DataView(l.buffer, l.byteOffset, l.length).getUint16(0), s = 3;
        } else if (s === 2) {
          if (er(n) < 8)
            break;
          const l = tr(n, 8), h = new DataView(l.buffer, l.byteOffset, l.length), u = h.getUint32(0);
          if (u > Math.pow(2, 21) - 1) {
            a.enqueue(Ti);
            break;
          }
          r = u * Math.pow(2, 32) + h.getUint32(4), s = 3;
        } else {
          if (er(n) < r)
            break;
          const l = tr(n, r);
          a.enqueue(oo(i ? l : si.decode(l), e)), s = 0;
        }
        if (r === 0 || r > t) {
          a.enqueue(Ti);
          break;
        }
      }
    }
  });
}
const Xl = 4;
function dt(t) {
  if (t) return pd(t);
}
function pd(t) {
  for (var e in dt.prototype)
    t[e] = dt.prototype[e];
  return t;
}
dt.prototype.on = dt.prototype.addEventListener = function(t, e) {
  return this._callbacks = this._callbacks || {}, (this._callbacks["$" + t] = this._callbacks["$" + t] || []).push(e), this;
};
dt.prototype.once = function(t, e) {
  function n() {
    this.off(t, n), e.apply(this, arguments);
  }
  return n.fn = e, this.on(t, n), this;
};
dt.prototype.off = dt.prototype.removeListener = dt.prototype.removeAllListeners = dt.prototype.removeEventListener = function(t, e) {
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
dt.prototype.emit = function(t) {
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
dt.prototype.emitReserved = dt.prototype.emit;
dt.prototype.listeners = function(t) {
  return this._callbacks = this._callbacks || {}, this._callbacks["$" + t] || [];
};
dt.prototype.hasListeners = function(t) {
  return !!this.listeners(t).length;
};
const Nr = typeof Promise == "function" && typeof Promise.resolve == "function" ? (e) => Promise.resolve().then(e) : (e, n) => n(e, 0), Ht = typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")(), gd = "arraybuffer";
function Zl(t, ...e) {
  return e.reduce((n, s) => (t.hasOwnProperty(s) && (n[s] = t[s]), n), {});
}
const md = Ht.setTimeout, _d = Ht.clearTimeout;
function Fr(t, e) {
  e.useNativeTimers ? (t.setTimeoutFn = md.bind(Ht), t.clearTimeoutFn = _d.bind(Ht)) : (t.setTimeoutFn = Ht.setTimeout.bind(Ht), t.clearTimeoutFn = Ht.clearTimeout.bind(Ht));
}
const yd = 1.33;
function vd(t) {
  return typeof t == "string" ? bd(t) : Math.ceil((t.byteLength || t.size) * yd);
}
function bd(t) {
  let e = 0, n = 0;
  for (let s = 0, r = t.length; s < r; s++)
    e = t.charCodeAt(s), e < 128 ? n += 1 : e < 2048 ? n += 2 : e < 55296 || e >= 57344 ? n += 3 : (s++, n += 4);
  return n;
}
function Jl() {
  return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
}
function wd(t) {
  let e = "";
  for (let n in t)
    t.hasOwnProperty(n) && (e.length && (e += "&"), e += encodeURIComponent(n) + "=" + encodeURIComponent(t[n]));
  return e;
}
function kd(t) {
  let e = {}, n = t.split("&");
  for (let s = 0, r = n.length; s < r; s++) {
    let i = n[s].split("=");
    e[decodeURIComponent(i[0])] = decodeURIComponent(i[1]);
  }
  return e;
}
class xd extends Error {
  constructor(e, n, s) {
    super(e), this.description = n, this.context = s, this.type = "TransportError";
  }
}
class ao extends dt {
  /**
   * Transport abstract constructor.
   *
   * @param {Object} opts - options
   * @protected
   */
  constructor(e) {
    super(), this.writable = !1, Fr(this, e), this.opts = e, this.query = e.query, this.socket = e.socket, this.supportsBinary = !e.forceBase64;
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
    return super.emitReserved("error", new xd(e, n, s)), this;
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
    const n = oo(e, this.socket.binaryType);
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
    const n = wd(e);
    return n.length ? "?" + n : "";
  }
}
class Td extends ao {
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
    fd(e, this.socket.binaryType).forEach(n), this.readyState !== "closed" && (this._polling = !1, this.emitReserved("pollComplete"), this.readyState === "open" && this._poll());
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
    this.writable = !1, ud(e, (n) => {
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
    return this.opts.timestampRequests !== !1 && (n[this.opts.timestampParam] = Jl()), !this.supportsBinary && !n.sid && (n.b64 = 1), this.createUri(e, n);
  }
}
let Ql = !1;
try {
  Ql = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest();
} catch {
}
const Sd = Ql;
function Ad() {
}
class Ed extends Td {
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
class ln extends dt {
  /**
   * Request constructor
   *
   * @param {Object} options
   * @package
   */
  constructor(e, n, s) {
    super(), this.createRequest = e, Fr(this, s), this._opts = s, this._method = s.method || "GET", this._uri = n, this._data = s.data !== void 0 ? s.data : null, this._create();
  }
  /**
   * Creates the XHR object and sends the request.
   *
   * @private
   */
  _create() {
    var e;
    const n = Zl(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
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
    typeof document < "u" && (this._index = ln.requestsCount++, ln.requests[this._index] = this);
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
      if (this._xhr.onreadystatechange = Ad, e)
        try {
          this._xhr.abort();
        } catch {
        }
      typeof document < "u" && delete ln.requests[this._index], this._xhr = null;
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
ln.requestsCount = 0;
ln.requests = {};
if (typeof document < "u") {
  if (typeof attachEvent == "function")
    attachEvent("onunload", ka);
  else if (typeof addEventListener == "function") {
    const t = "onpagehide" in Ht ? "pagehide" : "unload";
    addEventListener(t, ka, !1);
  }
}
function ka() {
  for (let t in ln.requests)
    ln.requests.hasOwnProperty(t) && ln.requests[t].abort();
}
const Cd = function() {
  const t = ec({
    xdomain: !1
  });
  return t && t.responseType !== null;
}();
class Rd extends Ed {
  constructor(e) {
    super(e);
    const n = e && e.forceBase64;
    this.supportsBinary = Cd && !n;
  }
  request(e = {}) {
    return Object.assign(e, { xd: this.xd }, this.opts), new ln(ec, this.uri(), e);
  }
}
function ec(t) {
  const e = t.xdomain;
  try {
    if (typeof XMLHttpRequest < "u" && (!e || Sd))
      return new XMLHttpRequest();
  } catch {
  }
  if (!e)
    try {
      return new Ht[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
    } catch {
    }
}
const tc = typeof navigator < "u" && typeof navigator.product == "string" && navigator.product.toLowerCase() === "reactnative";
class Id extends ao {
  get name() {
    return "websocket";
  }
  doOpen() {
    const e = this.uri(), n = this.opts.protocols, s = tc ? {} : Zl(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
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
      io(s, this.supportsBinary, (i) => {
        try {
          this.doWrite(s, i);
        } catch {
        }
        r && Nr(() => {
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
    return this.opts.timestampRequests && (n[this.opts.timestampParam] = Jl()), this.supportsBinary || (n.b64 = 1), this.createUri(e, n);
  }
}
const ri = Ht.WebSocket || Ht.MozWebSocket;
class Ld extends Id {
  createSocket(e, n, s) {
    return tc ? new ri(e, n, s) : n ? new ri(e, n) : new ri(e);
  }
  doWrite(e, n) {
    this.ws.send(n);
  }
}
class Od extends ao {
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
        const n = dd(Number.MAX_SAFE_INTEGER, this.socket.binaryType), s = e.readable.pipeThrough(n).getReader(), r = hd();
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
        r && Nr(() => {
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
const Pd = {
  websocket: Ld,
  webtransport: Od,
  polling: Rd
}, Nd = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/, Fd = [
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
function Si(t) {
  if (t.length > 8e3)
    throw "URI too long";
  const e = t, n = t.indexOf("["), s = t.indexOf("]");
  n != -1 && s != -1 && (t = t.substring(0, n) + t.substring(n, s).replace(/:/g, ";") + t.substring(s, t.length));
  let r = Nd.exec(t || ""), i = {}, o = 14;
  for (; o--; )
    i[Fd[o]] = r[o] || "";
  return n != -1 && s != -1 && (i.source = e, i.host = i.host.substring(1, i.host.length - 1).replace(/;/g, ":"), i.authority = i.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), i.ipv6uri = !0), i.pathNames = Dd(i, i.path), i.queryKey = Md(i, i.query), i;
}
function Dd(t, e) {
  const n = /\/{2,9}/g, s = e.replace(n, "/").split("/");
  return (e.slice(0, 1) == "/" || e.length === 0) && s.splice(0, 1), e.slice(-1) == "/" && s.splice(s.length - 1, 1), s;
}
function Md(t, e) {
  const n = {};
  return e.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function(s, r, i) {
    r && (n[r] = i);
  }), n;
}
const Ai = typeof addEventListener == "function" && typeof removeEventListener == "function", ur = [];
Ai && addEventListener("offline", () => {
  ur.forEach((t) => t());
}, !1);
class Rn extends dt {
  /**
   * Socket constructor.
   *
   * @param {String|Object} uri - uri or options
   * @param {Object} opts - options
   */
  constructor(e, n) {
    if (super(), this.binaryType = gd, this.writeBuffer = [], this._prevBufferLen = 0, this._pingInterval = -1, this._pingTimeout = -1, this._maxPayload = -1, this._pingTimeoutTime = 1 / 0, e && typeof e == "object" && (n = e, e = null), e) {
      const s = Si(e);
      n.hostname = s.host, n.secure = s.protocol === "https" || s.protocol === "wss", n.port = s.port, s.query && (n.query = s.query);
    } else n.host && (n.hostname = Si(n.host).host);
    Fr(this, n), this.secure = n.secure != null ? n.secure : typeof location < "u" && location.protocol === "https:", n.hostname && !n.port && (n.port = this.secure ? "443" : "80"), this.hostname = n.hostname || (typeof location < "u" ? location.hostname : "localhost"), this.port = n.port || (typeof location < "u" && location.port ? location.port : this.secure ? "443" : "80"), this.transports = [], this._transportsByName = {}, n.transports.forEach((s) => {
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
    }, n), this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : ""), typeof this.opts.query == "string" && (this.opts.query = kd(this.opts.query)), Ai && (this.opts.closeOnBeforeunload && (this._beforeunloadEventListener = () => {
      this.transport && (this.transport.removeAllListeners(), this.transport.close());
    }, addEventListener("beforeunload", this._beforeunloadEventListener, !1)), this.hostname !== "localhost" && (this._offlineEventListener = () => {
      this._onClose("transport close", {
        description: "network connection lost"
      });
    }, ur.push(this._offlineEventListener))), this.opts.withCredentials && (this._cookieJar = void 0), this._open();
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
    n.EIO = Xl, n.transport = e, this.id && (n.sid = this.id);
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
    const e = this.opts.rememberUpgrade && Rn.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1 ? "websocket" : this.transports[0];
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
    this.readyState = "open", Rn.priorWebsocketSuccess = this.transport.name === "websocket", this.emitReserved("open"), this.flush();
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
      if (r && (n += vd(r)), s > 0 && n > this._maxPayload)
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
    return e && (this._pingTimeoutTime = 0, Nr(() => {
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
    if (Rn.priorWebsocketSuccess = !1, this.opts.tryAllTransports && this.transports.length > 1 && this.readyState === "opening")
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
      if (this.clearTimeoutFn(this._pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), Ai && (this._beforeunloadEventListener && removeEventListener("beforeunload", this._beforeunloadEventListener, !1), this._offlineEventListener)) {
        const s = ur.indexOf(this._offlineEventListener);
        s !== -1 && ur.splice(s, 1);
      }
      this.readyState = "closed", this.id = null, this.emitReserved("close", e, n), this.writeBuffer = [], this._prevBufferLen = 0;
    }
  }
}
Rn.protocol = Xl;
class $d extends Rn {
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
    Rn.priorWebsocketSuccess = !1;
    const r = () => {
      s || (n.send([{ type: "ping", data: "probe" }]), n.once("packet", (b) => {
        if (!s)
          if (b.type === "pong" && b.data === "probe") {
            if (this.upgrading = !0, this.emitReserved("upgrading", n), !n)
              return;
            Rn.priorWebsocketSuccess = n.name === "websocket", this.transport.pause(() => {
              s || this.readyState !== "closed" && (u(), this.setTransport(n), n.send([{ type: "upgrade" }]), this.emitReserved("upgrade", n), n = null, this.upgrading = !1, this.flush());
            });
          } else {
            const v = new Error("probe error");
            v.transport = n.name, this.emitReserved("upgradeError", v);
          }
      }));
    };
    function i() {
      s || (s = !0, u(), n.close(), n = null);
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
    function h(b) {
      n && b.name !== n.name && i();
    }
    const u = () => {
      n.removeListener("open", r), n.removeListener("error", o), n.removeListener("close", a), this.off("close", l), this.off("upgrading", h);
    };
    n.once("open", r), n.once("error", o), n.once("close", a), this.once("close", l), this.once("upgrading", h), this._upgrades.indexOf("webtransport") !== -1 && e !== "webtransport" ? this.setTimeoutFn(() => {
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
let Bd = class extends $d {
  constructor(e, n = {}) {
    const s = typeof e == "object" ? e : n;
    (!s.transports || s.transports && typeof s.transports[0] == "string") && (s.transports = (s.transports || ["polling", "websocket", "webtransport"]).map((r) => Pd[r]).filter((r) => !!r)), super(e, s);
  }
};
function Ud(t, e = "", n) {
  let s = t;
  n = n || typeof location < "u" && location, t == null && (t = n.protocol + "//" + n.host), typeof t == "string" && (t.charAt(0) === "/" && (t.charAt(1) === "/" ? t = n.protocol + t : t = n.host + t), /^(https?|wss?):\/\//.test(t) || (typeof n < "u" ? t = n.protocol + "//" + t : t = "https://" + t), s = Si(t)), s.port || (/^(http|ws)$/.test(s.protocol) ? s.port = "80" : /^(http|ws)s$/.test(s.protocol) && (s.port = "443")), s.path = s.path || "/";
  const i = s.host.indexOf(":") !== -1 ? "[" + s.host + "]" : s.host;
  return s.id = s.protocol + "://" + i + ":" + s.port + e, s.href = s.protocol + "://" + i + (n && n.port === s.port ? "" : ":" + s.port), s;
}
const zd = typeof ArrayBuffer == "function", Hd = (t) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(t) : t.buffer instanceof ArrayBuffer, nc = Object.prototype.toString, Wd = typeof Blob == "function" || typeof Blob < "u" && nc.call(Blob) === "[object BlobConstructor]", qd = typeof File == "function" || typeof File < "u" && nc.call(File) === "[object FileConstructor]";
function lo(t) {
  return zd && (t instanceof ArrayBuffer || Hd(t)) || Wd && t instanceof Blob || qd && t instanceof File;
}
function fr(t, e) {
  if (!t || typeof t != "object")
    return !1;
  if (Array.isArray(t)) {
    for (let n = 0, s = t.length; n < s; n++)
      if (fr(t[n]))
        return !0;
    return !1;
  }
  if (lo(t))
    return !0;
  if (t.toJSON && typeof t.toJSON == "function" && arguments.length === 1)
    return fr(t.toJSON(), !0);
  for (const n in t)
    if (Object.prototype.hasOwnProperty.call(t, n) && fr(t[n]))
      return !0;
  return !1;
}
function jd(t) {
  const e = [], n = t.data, s = t;
  return s.data = Ei(n, e), s.attachments = e.length, { packet: s, buffers: e };
}
function Ei(t, e) {
  if (!t)
    return t;
  if (lo(t)) {
    const n = { _placeholder: !0, num: e.length };
    return e.push(t), n;
  } else if (Array.isArray(t)) {
    const n = new Array(t.length);
    for (let s = 0; s < t.length; s++)
      n[s] = Ei(t[s], e);
    return n;
  } else if (typeof t == "object" && !(t instanceof Date)) {
    const n = {};
    for (const s in t)
      Object.prototype.hasOwnProperty.call(t, s) && (n[s] = Ei(t[s], e));
    return n;
  }
  return t;
}
function Vd(t, e) {
  return t.data = Ci(t.data, e), delete t.attachments, t;
}
function Ci(t, e) {
  if (!t)
    return t;
  if (t && t._placeholder === !0) {
    if (typeof t.num == "number" && t.num >= 0 && t.num < e.length)
      return e[t.num];
    throw new Error("illegal attachments");
  } else if (Array.isArray(t))
    for (let n = 0; n < t.length; n++)
      t[n] = Ci(t[n], e);
  else if (typeof t == "object")
    for (const n in t)
      Object.prototype.hasOwnProperty.call(t, n) && (t[n] = Ci(t[n], e));
  return t;
}
const Kd = [
  "connect",
  "connect_error",
  "disconnect",
  "disconnecting",
  "newListener",
  "removeListener"
  // used by the Node.js EventEmitter
], Gd = 5;
var Re;
(function(t) {
  t[t.CONNECT = 0] = "CONNECT", t[t.DISCONNECT = 1] = "DISCONNECT", t[t.EVENT = 2] = "EVENT", t[t.ACK = 3] = "ACK", t[t.CONNECT_ERROR = 4] = "CONNECT_ERROR", t[t.BINARY_EVENT = 5] = "BINARY_EVENT", t[t.BINARY_ACK = 6] = "BINARY_ACK";
})(Re || (Re = {}));
class Yd {
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
    return (e.type === Re.EVENT || e.type === Re.ACK) && fr(e) ? this.encodeAsBinary({
      type: e.type === Re.EVENT ? Re.BINARY_EVENT : Re.BINARY_ACK,
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
    return (e.type === Re.BINARY_EVENT || e.type === Re.BINARY_ACK) && (n += e.attachments + "-"), e.nsp && e.nsp !== "/" && (n += e.nsp + ","), e.id != null && (n += e.id), e.data != null && (n += JSON.stringify(e.data, this.replacer)), n;
  }
  /**
   * Encode packet as 'buffer sequence' by removing blobs, and
   * deconstructing packet into object with placeholders and
   * a list of buffers.
   */
  encodeAsBinary(e) {
    const n = jd(e), s = this.encodeAsString(n.packet), r = n.buffers;
    return r.unshift(s), r;
  }
}
function xa(t) {
  return Object.prototype.toString.call(t) === "[object Object]";
}
class co extends dt {
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
      const s = n.type === Re.BINARY_EVENT;
      s || n.type === Re.BINARY_ACK ? (n.type = s ? Re.EVENT : Re.ACK, this.reconstructor = new Xd(n), n.attachments === 0 && super.emitReserved("decoded", n)) : super.emitReserved("decoded", n);
    } else if (lo(e) || e.base64)
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
    if (Re[s.type] === void 0)
      throw new Error("unknown packet type " + s.type);
    if (s.type === Re.BINARY_EVENT || s.type === Re.BINARY_ACK) {
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
      if (co.isPayloadValid(s.type, i))
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
      case Re.CONNECT:
        return xa(n);
      case Re.DISCONNECT:
        return n === void 0;
      case Re.CONNECT_ERROR:
        return typeof n == "string" || xa(n);
      case Re.EVENT:
      case Re.BINARY_EVENT:
        return Array.isArray(n) && (typeof n[0] == "number" || typeof n[0] == "string" && Kd.indexOf(n[0]) === -1);
      case Re.ACK:
      case Re.BINARY_ACK:
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
class Xd {
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
      const n = Vd(this.reconPack, this.buffers);
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
const Zd = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Decoder: co,
  Encoder: Yd,
  get PacketType() {
    return Re;
  },
  protocol: Gd
}, Symbol.toStringTag, { value: "Module" }));
function Zt(t, e, n) {
  return t.on(e, n), function() {
    t.off(e, n);
  };
}
const Jd = Object.freeze({
  connect: 1,
  connect_error: 1,
  disconnect: 1,
  disconnecting: 1,
  // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
  newListener: 1,
  removeListener: 1
});
class sc extends dt {
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
      Zt(e, "open", this.onopen.bind(this)),
      Zt(e, "packet", this.onpacket.bind(this)),
      Zt(e, "error", this.onerror.bind(this)),
      Zt(e, "close", this.onclose.bind(this))
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
    if (Jd.hasOwnProperty(e))
      throw new Error('"' + e.toString() + '" is a reserved event name');
    if (n.unshift(e), this._opts.retries && !this.flags.fromQueue && !this.flags.volatile)
      return this._addToQueue(n), this;
    const o = {
      type: Re.EVENT,
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
      type: Re.CONNECT,
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
        case Re.CONNECT:
          e.data && e.data.sid ? this.onconnect(e.data.sid, e.data.pid) : this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
          break;
        case Re.EVENT:
        case Re.BINARY_EVENT:
          this.onevent(e);
          break;
        case Re.ACK:
        case Re.BINARY_ACK:
          this.onack(e);
          break;
        case Re.DISCONNECT:
          this.ondisconnect();
          break;
        case Re.CONNECT_ERROR:
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
        type: Re.ACK,
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
    return this.connected && this.packet({ type: Re.DISCONNECT }), this.destroy(), this.connected && this.onclose("io client disconnect"), this;
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
function as(t) {
  t = t || {}, this.ms = t.min || 100, this.max = t.max || 1e4, this.factor = t.factor || 2, this.jitter = t.jitter > 0 && t.jitter <= 1 ? t.jitter : 0, this.attempts = 0;
}
as.prototype.duration = function() {
  var t = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var e = Math.random(), n = Math.floor(e * this.jitter * t);
    t = (Math.floor(e * 10) & 1) == 0 ? t - n : t + n;
  }
  return Math.min(t, this.max) | 0;
};
as.prototype.reset = function() {
  this.attempts = 0;
};
as.prototype.setMin = function(t) {
  this.ms = t;
};
as.prototype.setMax = function(t) {
  this.max = t;
};
as.prototype.setJitter = function(t) {
  this.jitter = t;
};
class Ri extends dt {
  constructor(e, n) {
    var s;
    super(), this.nsps = {}, this.subs = [], e && typeof e == "object" && (n = e, e = void 0), n = n || {}, n.path = n.path || "/socket.io", this.opts = n, Fr(this, n), this.reconnection(n.reconnection !== !1), this.reconnectionAttempts(n.reconnectionAttempts || 1 / 0), this.reconnectionDelay(n.reconnectionDelay || 1e3), this.reconnectionDelayMax(n.reconnectionDelayMax || 5e3), this.randomizationFactor((s = n.randomizationFactor) !== null && s !== void 0 ? s : 0.5), this.backoff = new as({
      min: this.reconnectionDelay(),
      max: this.reconnectionDelayMax(),
      jitter: this.randomizationFactor()
    }), this.timeout(n.timeout == null ? 2e4 : n.timeout), this._readyState = "closed", this.uri = e;
    const r = n.parser || Zd;
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
    this.engine = new Bd(this.uri, this.opts);
    const n = this.engine, s = this;
    this._readyState = "opening", this.skipReconnect = !1;
    const r = Zt(n, "open", function() {
      s.onopen(), e && e();
    }), i = (a) => {
      this.cleanup(), this._readyState = "closed", this.emitReserved("error", a), e ? e(a) : this.maybeReconnectOnOpen();
    }, o = Zt(n, "error", i);
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
      Zt(e, "ping", this.onping.bind(this)),
      Zt(e, "data", this.ondata.bind(this)),
      Zt(e, "error", this.onerror.bind(this)),
      Zt(e, "close", this.onclose.bind(this)),
      // @ts-ignore
      Zt(this.decoder, "decoded", this.ondecoded.bind(this))
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
    Nr(() => {
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
    return s ? this._autoConnect && !s.active && s.connect() : (s = new sc(this, e, n), this.nsps[e] = s), s;
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
const ks = {};
function hr(t, e) {
  typeof t == "object" && (e = t, t = void 0), e = e || {};
  const n = Ud(t, e.path || "/socket.io"), s = n.source, r = n.id, i = n.path, o = ks[r] && i in ks[r].nsps, a = e.forceNew || e["force new connection"] || e.multiplex === !1 || o;
  let l;
  return a ? l = new Ri(s, e) : (ks[r] || (ks[r] = new Ri(s, e)), l = ks[r]), n.query && !e.query && (e.query = n.queryKey), l.socket(n.path, e);
}
Object.assign(hr, {
  Manager: Ri,
  Socket: sc,
  io: hr,
  connect: hr
});
function Qd() {
  const t = ge([]), e = ge(!1), n = ge(""), s = ge(!1), r = ge(!1), i = ge(!1), o = ge("connecting"), a = ge(0), l = 5, h = ge({}), u = ge(null), b = ge("");
  let v = null, F = null, B = null, G = null, Ce, ne;
  const Ee = (W) => {
    Ce = W, W && localStorage.setItem("ctid", W);
  }, ke = (W) => {
    ne = W;
  }, z = (W) => {
    const ae = Ce || localStorage.getItem("ctid"), le = {};
    return ae && (le.conversation_token = ae), ne && (le.widget_id = ne), v = hr(`${Cn.WS_URL}/widget`, {
      transports: ["websocket"],
      reconnection: !0,
      reconnectionAttempts: l,
      reconnectionDelay: 1e3,
      auth: Object.keys(le).length > 0 ? le : void 0
    }), v.on("connect", () => {
      o.value = "connected", a.value = 0;
    }), v.on("disconnect", () => {
      o.value === "connected" && (console.log("Socket disconnected, setting connection status to connecting"), o.value = "connecting");
    }), v.on("connect_error", () => {
      a.value++, console.error("Socket connection failed, attempt:", a.value, "connection status:", o.value), a.value >= l && (o.value = "failed");
    }), v.on("chat_response", (q) => {
      if (e.value = !1, q.session_id ? (console.log("Captured session_id from chat_response:", q.session_id), b.value = q.session_id) : console.warn("No session_id in chat_response data:", q), q.type === "agent_message") {
        const Ke = {
          message: q.message,
          message_type: "agent",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          session_id: "",
          agent_name: q.agent_name,
          attributes: {
            end_chat: q.end_chat,
            end_chat_reason: q.end_chat_reason,
            end_chat_description: q.end_chat_description,
            request_rating: q.request_rating
          }
        };
        q.attachments && Array.isArray(q.attachments) && (Ke.id = q.message_id, Ke.attachments = q.attachments.map((nt, ot) => ({
          id: q.message_id * 1e3 + ot,
          filename: nt.filename,
          file_url: nt.file_url,
          content_type: nt.content_type,
          file_size: nt.file_size
        }))), t.value.push(Ke);
      } else q.shopify_output && typeof q.shopify_output == "object" && q.shopify_output.products ? t.value.push({
        message: q.message,
        // Keep the accompanying text message
        message_type: "product",
        // Use 'product' type for rendering
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: "",
        agent_name: q.agent_name,
        // Assign the whole structured object
        shopify_output: q.shopify_output,
        // Remove the old flattened fields (product_id, product_title, etc.)
        attributes: {
          // Keep other attributes if needed
          end_chat: q.end_chat,
          request_rating: q.request_rating
        }
      }) : t.value.push({
        message: q.message,
        message_type: "bot",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: "",
        agent_name: q.agent_name,
        // Knowledge-base citations (display gated by show_citations in the widget)
        sources: Array.isArray(q.sources) && q.sources.length ? q.sources : void 0,
        attributes: {
          end_chat: q.end_chat,
          end_chat_reason: q.end_chat_reason,
          end_chat_description: q.end_chat_description,
          request_rating: q.request_rating
        }
      });
    }), v.on("handle_taken_over", (q) => {
      t.value.push({
        message: `${q.user_name} joined the conversation`,
        message_type: "system",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: q.session_id
      }), h.value = {
        ...h.value,
        human_agent_name: q.user_name,
        human_agent_profile_pic: q.profile_picture
      }, F && F(q);
    }), v.on("session_initialized", (q) => {
      q.session_id && (console.log("Initialized session_id from session_initialized:", q.session_id), b.value = q.session_id);
    }), v.on("error", je), v.on("chat_history", Te), v.on("rating_submitted", he), v.on("display_form", Ve), v.on("form_submitted", Qe), v.on("workflow_state", lt), v.on("workflow_proceeded", ie), v;
  }, H = async () => {
    try {
      return o.value = "connecting", a.value = 0, v && (v.removeAllListeners(), v.disconnect(), v = null), v = z(""), new Promise((W) => {
        v == null || v.on("connect", () => {
          W(!0);
        }), v == null || v.on("connect_error", () => {
          a.value >= l && W(!1);
        });
      });
    } catch (W) {
      return console.error("Socket initialization failed:", W), o.value = "failed", !1;
    }
  }, J = () => (v && v.disconnect(), H()), j = (W) => {
    F = W;
  }, Le = (W) => {
    B = W;
  }, it = (W) => {
    G = W;
  }, je = (W) => {
    e.value = !1, n.value = Gf(W), s.value = !0, setTimeout(() => {
      s.value = !1, n.value = "";
    }, 5e3);
  }, Te = (W) => {
    if (W.type === "chat_history" && Array.isArray(W.messages)) {
      const ae = W.messages.map((le) => {
        var Ke, nt;
        const q = {
          message: le.message,
          message_type: le.message_type,
          created_at: le.created_at,
          session_id: "",
          agent_name: le.agent_name || "",
          user_name: le.user_name || "",
          attributes: le.attributes || {},
          attachments: le.attachments || []
          // Include attachments
        };
        return Array.isArray((Ke = le.attributes) == null ? void 0 : Ke.sources) && le.attributes.sources.length && (q.sources = le.attributes.sources), (nt = le.attributes) != null && nt.shopify_output && typeof le.attributes.shopify_output == "object" ? {
          ...q,
          message_type: "product",
          shopify_output: le.attributes.shopify_output
        } : q;
      });
      t.value = [
        ...ae.filter(
          (le) => !t.value.some(
            (q) => q.message === le.message && q.created_at === le.created_at
          )
        ),
        ...t.value
      ];
    }
  }, he = (W) => {
    W.success && t.value.push({
      message: "Thank you for your feedback!",
      message_type: "system",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: ""
    });
  }, Ve = (W) => {
    var ae;
    console.log("Form display handler in composable:", W), e.value = !1, u.value = W.form_data, console.log("Set currentForm in handleDisplayForm:", u.value), ((ae = W.form_data) == null ? void 0 : ae.form_full_screen) === !0 ? (console.log("Full screen form detected, triggering workflow state callback"), B && B({
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
  }, Qe = (W) => {
    console.log("Form submitted confirmation received, clearing currentForm"), u.value = null, W.success && console.log("Form submitted successfully");
  }, lt = (W) => {
    console.log("Workflow state received in composable:", W), (W.type === "form" || W.type === "display_form") && (console.log("Setting currentForm from workflow state:", W.form_data), u.value = W.form_data), B && B(W);
  }, ie = (W) => {
    console.log("Workflow proceeded in composable:", W), G && G(W);
  };
  return {
    messages: t,
    loading: e,
    errorMessage: n,
    showError: s,
    loadingHistory: r,
    hasStartedChat: i,
    connectionStatus: o,
    sendMessage: async (W, ae, le = []) => {
      if (!v || !W.trim() && le.length === 0) return;
      h.value.human_agent_name || (e.value = !0);
      const q = {
        message: W,
        message_type: "user",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: ""
      };
      le.length > 0 && (q.attachments = le.map((Ke, nt) => {
        let ot = "";
        if (Ke.content_type.startsWith("image/")) {
          const Nt = atob(Ke.content), d = new Array(Nt.length);
          for (let L = 0; L < Nt.length; L++)
            d[L] = Nt.charCodeAt(L);
          const m = new Uint8Array(d), k = new Blob([m], { type: Ke.content_type });
          ot = URL.createObjectURL(k);
        }
        return {
          id: Date.now() * 1e3 + nt,
          // Temporary ID
          filename: Ke.filename,
          file_url: ot,
          // Temporary blob URL, will be replaced
          content_type: Ke.content_type,
          file_size: Ke.size,
          _isTemporary: !0
          // Flag to identify temporary attachments
        };
      })), t.value.push(q), v.emit("chat", {
        message: W,
        email: ae,
        files: le
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
    reconnect: J,
    cleanup: () => {
      v && (v.removeAllListeners(), v.disconnect(), v = null), F = null, B = null, G = null;
    },
    humanAgent: h,
    onTakeover: j,
    submitRating: async (W, ae) => {
      !v || !W || v.emit("submit_rating", {
        rating: W,
        feedback: ae
      });
    },
    currentForm: u,
    submitForm: async (W) => {
      var q;
      if (console.log("Submitting form in socket:", W), console.log("Current form in socket:", u.value), console.log("Socket in socket:", v), !v) {
        console.error("No socket available for form submission");
        return;
      }
      if (!W || Object.keys(W).length === 0) {
        console.error("No form data to submit");
        return;
      }
      const le = ((q = u.value) == null ? void 0 : q.form_type) === "contact" ? "submit_contact_info" : "submit_form";
      console.log(`Emitting ${le} event with data:`, W), v.emit(le, {
        form_data: W
      }), u.value = null;
    },
    getWorkflowState: async () => {
      v && (console.log("Getting workflow state 12"), v.emit("get_workflow_state"));
    },
    proceedWorkflow: async () => {
      v && v.emit("proceed_workflow", {});
    },
    onWorkflowState: Le,
    onWorkflowProceeded: it,
    currentSessionId: b,
    setToken: Ee,
    setWidgetId: ke
  };
}
function ep(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var ii = { exports: {} }, Ta;
function tp() {
  return Ta || (Ta = 1, function(t) {
    (function() {
      function e(c, _, T) {
        return c.call.apply(c.bind, arguments);
      }
      function n(c, _, T) {
        if (!c) throw Error();
        if (2 < arguments.length) {
          var x = Array.prototype.slice.call(arguments, 2);
          return function() {
            var P = Array.prototype.slice.call(arguments);
            return Array.prototype.unshift.apply(P, x), c.apply(_, P);
          };
        }
        return function() {
          return c.apply(_, arguments);
        };
      }
      function s(c, _, T) {
        return s = Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1 ? e : n, s.apply(null, arguments);
      }
      var r = Date.now || function() {
        return +/* @__PURE__ */ new Date();
      };
      function i(c, _) {
        this.a = c, this.o = _ || c, this.c = this.o.document;
      }
      var o = !!window.FontFace;
      function a(c, _, T, x) {
        if (_ = c.c.createElement(_), T) for (var P in T) T.hasOwnProperty(P) && (P == "style" ? _.style.cssText = T[P] : _.setAttribute(P, T[P]));
        return x && _.appendChild(c.c.createTextNode(x)), _;
      }
      function l(c, _, T) {
        c = c.c.getElementsByTagName(_)[0], c || (c = document.documentElement), c.insertBefore(T, c.lastChild);
      }
      function h(c) {
        c.parentNode && c.parentNode.removeChild(c);
      }
      function u(c, _, T) {
        _ = _ || [], T = T || [];
        for (var x = c.className.split(/\s+/), P = 0; P < _.length; P += 1) {
          for (var V = !1, ee = 0; ee < x.length; ee += 1) if (_[P] === x[ee]) {
            V = !0;
            break;
          }
          V || x.push(_[P]);
        }
        for (_ = [], P = 0; P < x.length; P += 1) {
          for (V = !1, ee = 0; ee < T.length; ee += 1) if (x[P] === T[ee]) {
            V = !0;
            break;
          }
          V || _.push(x[P]);
        }
        c.className = _.join(" ").replace(/\s+/g, " ").replace(/^\s+|\s+$/, "");
      }
      function b(c, _) {
        for (var T = c.className.split(/\s+/), x = 0, P = T.length; x < P; x++) if (T[x] == _) return !0;
        return !1;
      }
      function v(c) {
        return c.o.location.hostname || c.a.location.hostname;
      }
      function F(c, _, T) {
        function x() {
          be && P && V && (be(ee), be = null);
        }
        _ = a(c, "link", { rel: "stylesheet", href: _, media: "all" });
        var P = !1, V = !0, ee = null, be = T || null;
        o ? (_.onload = function() {
          P = !0, x();
        }, _.onerror = function() {
          P = !0, ee = Error("Stylesheet failed to load"), x();
        }) : setTimeout(function() {
          P = !0, x();
        }, 0), l(c, "head", _);
      }
      function B(c, _, T, x) {
        var P = c.c.getElementsByTagName("head")[0];
        if (P) {
          var V = a(c, "script", { src: _ }), ee = !1;
          return V.onload = V.onreadystatechange = function() {
            ee || this.readyState && this.readyState != "loaded" && this.readyState != "complete" || (ee = !0, T && T(null), V.onload = V.onreadystatechange = null, V.parentNode.tagName == "HEAD" && P.removeChild(V));
          }, P.appendChild(V), setTimeout(function() {
            ee || (ee = !0, T && T(Error("Script load timeout")));
          }, x || 5e3), V;
        }
        return null;
      }
      function G() {
        this.a = 0, this.c = null;
      }
      function Ce(c) {
        return c.a++, function() {
          c.a--, Ee(c);
        };
      }
      function ne(c, _) {
        c.c = _, Ee(c);
      }
      function Ee(c) {
        c.a == 0 && c.c && (c.c(), c.c = null);
      }
      function ke(c) {
        this.a = c || "-";
      }
      ke.prototype.c = function(c) {
        for (var _ = [], T = 0; T < arguments.length; T++) _.push(arguments[T].replace(/[\W_]+/g, "").toLowerCase());
        return _.join(this.a);
      };
      function z(c, _) {
        this.c = c, this.f = 4, this.a = "n";
        var T = (_ || "n4").match(/^([nio])([1-9])$/i);
        T && (this.a = T[1], this.f = parseInt(T[2], 10));
      }
      function H(c) {
        return Le(c) + " " + (c.f + "00") + " 300px " + J(c.c);
      }
      function J(c) {
        var _ = [];
        c = c.split(/,\s*/);
        for (var T = 0; T < c.length; T++) {
          var x = c[T].replace(/['"]/g, "");
          x.indexOf(" ") != -1 || /^\d/.test(x) ? _.push("'" + x + "'") : _.push(x);
        }
        return _.join(",");
      }
      function j(c) {
        return c.a + c.f;
      }
      function Le(c) {
        var _ = "normal";
        return c.a === "o" ? _ = "oblique" : c.a === "i" && (_ = "italic"), _;
      }
      function it(c) {
        var _ = 4, T = "n", x = null;
        return c && ((x = c.match(/(normal|oblique|italic)/i)) && x[1] && (T = x[1].substr(0, 1).toLowerCase()), (x = c.match(/([1-9]00|normal|bold)/i)) && x[1] && (/bold/i.test(x[1]) ? _ = 7 : /[1-9]00/.test(x[1]) && (_ = parseInt(x[1].substr(0, 1), 10)))), T + _;
      }
      function je(c, _) {
        this.c = c, this.f = c.o.document.documentElement, this.h = _, this.a = new ke("-"), this.j = _.events !== !1, this.g = _.classes !== !1;
      }
      function Te(c) {
        c.g && u(c.f, [c.a.c("wf", "loading")]), Ve(c, "loading");
      }
      function he(c) {
        if (c.g) {
          var _ = b(c.f, c.a.c("wf", "active")), T = [], x = [c.a.c("wf", "loading")];
          _ || T.push(c.a.c("wf", "inactive")), u(c.f, T, x);
        }
        Ve(c, "inactive");
      }
      function Ve(c, _, T) {
        c.j && c.h[_] && (T ? c.h[_](T.c, j(T)) : c.h[_]());
      }
      function Qe() {
        this.c = {};
      }
      function lt(c, _, T) {
        var x = [], P;
        for (P in _) if (_.hasOwnProperty(P)) {
          var V = c.c[P];
          V && x.push(V(_[P], T));
        }
        return x;
      }
      function ie(c, _) {
        this.c = c, this.f = _, this.a = a(this.c, "span", { "aria-hidden": "true" }, this.f);
      }
      function de(c) {
        l(c.c, "body", c.a);
      }
      function oe(c) {
        return "display:block;position:absolute;top:-9999px;left:-9999px;font-size:300px;width:auto;height:auto;line-height:normal;margin:0;padding:0;font-variant:normal;white-space:nowrap;font-family:" + J(c.c) + ";" + ("font-style:" + Le(c) + ";font-weight:" + (c.f + "00") + ";");
      }
      function Pe(c, _, T, x, P, V) {
        this.g = c, this.j = _, this.a = x, this.c = T, this.f = P || 3e3, this.h = V || void 0;
      }
      Pe.prototype.start = function() {
        var c = this.c.o.document, _ = this, T = r(), x = new Promise(function(ee, be) {
          function Se() {
            r() - T >= _.f ? be() : c.fonts.load(H(_.a), _.h).then(function(Ye) {
              1 <= Ye.length ? ee() : setTimeout(Se, 25);
            }, function() {
              be();
            });
          }
          Se();
        }), P = null, V = new Promise(function(ee, be) {
          P = setTimeout(be, _.f);
        });
        Promise.race([V, x]).then(function() {
          P && (clearTimeout(P), P = null), _.g(_.a);
        }, function() {
          _.j(_.a);
        });
      };
      function st(c, _, T, x, P, V, ee) {
        this.v = c, this.B = _, this.c = T, this.a = x, this.s = ee || "BESbswy", this.f = {}, this.w = P || 3e3, this.u = V || null, this.m = this.j = this.h = this.g = null, this.g = new ie(this.c, this.s), this.h = new ie(this.c, this.s), this.j = new ie(this.c, this.s), this.m = new ie(this.c, this.s), c = new z(this.a.c + ",serif", j(this.a)), c = oe(c), this.g.a.style.cssText = c, c = new z(this.a.c + ",sans-serif", j(this.a)), c = oe(c), this.h.a.style.cssText = c, c = new z("serif", j(this.a)), c = oe(c), this.j.a.style.cssText = c, c = new z("sans-serif", j(this.a)), c = oe(c), this.m.a.style.cssText = c, de(this.g), de(this.h), de(this.j), de(this.m);
      }
      var se = { D: "serif", C: "sans-serif" }, Oe = null;
      function Ne() {
        if (Oe === null) {
          var c = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent);
          Oe = !!c && (536 > parseInt(c[1], 10) || parseInt(c[1], 10) === 536 && 11 >= parseInt(c[2], 10));
        }
        return Oe;
      }
      st.prototype.start = function() {
        this.f.serif = this.j.a.offsetWidth, this.f["sans-serif"] = this.m.a.offsetWidth, this.A = r(), ae(this);
      };
      function W(c, _, T) {
        for (var x in se) if (se.hasOwnProperty(x) && _ === c.f[se[x]] && T === c.f[se[x]]) return !0;
        return !1;
      }
      function ae(c) {
        var _ = c.g.a.offsetWidth, T = c.h.a.offsetWidth, x;
        (x = _ === c.f.serif && T === c.f["sans-serif"]) || (x = Ne() && W(c, _, T)), x ? r() - c.A >= c.w ? Ne() && W(c, _, T) && (c.u === null || c.u.hasOwnProperty(c.a.c)) ? q(c, c.v) : q(c, c.B) : le(c) : q(c, c.v);
      }
      function le(c) {
        setTimeout(s(function() {
          ae(this);
        }, c), 50);
      }
      function q(c, _) {
        setTimeout(s(function() {
          h(this.g.a), h(this.h.a), h(this.j.a), h(this.m.a), _(this.a);
        }, c), 0);
      }
      function Ke(c, _, T) {
        this.c = c, this.a = _, this.f = 0, this.m = this.j = !1, this.s = T;
      }
      var nt = null;
      Ke.prototype.g = function(c) {
        var _ = this.a;
        _.g && u(_.f, [_.a.c("wf", c.c, j(c).toString(), "active")], [_.a.c("wf", c.c, j(c).toString(), "loading"), _.a.c("wf", c.c, j(c).toString(), "inactive")]), Ve(_, "fontactive", c), this.m = !0, ot(this);
      }, Ke.prototype.h = function(c) {
        var _ = this.a;
        if (_.g) {
          var T = b(_.f, _.a.c("wf", c.c, j(c).toString(), "active")), x = [], P = [_.a.c("wf", c.c, j(c).toString(), "loading")];
          T || x.push(_.a.c("wf", c.c, j(c).toString(), "inactive")), u(_.f, x, P);
        }
        Ve(_, "fontinactive", c), ot(this);
      };
      function ot(c) {
        --c.f == 0 && c.j && (c.m ? (c = c.a, c.g && u(c.f, [c.a.c("wf", "active")], [c.a.c("wf", "loading"), c.a.c("wf", "inactive")]), Ve(c, "active")) : he(c.a));
      }
      function Nt(c) {
        this.j = c, this.a = new Qe(), this.h = 0, this.f = this.g = !0;
      }
      Nt.prototype.load = function(c) {
        this.c = new i(this.j, c.context || this.j), this.g = c.events !== !1, this.f = c.classes !== !1, m(this, new je(this.c, c), c);
      };
      function d(c, _, T, x, P) {
        var V = --c.h == 0;
        (c.f || c.g) && setTimeout(function() {
          var ee = P || null, be = x || null || {};
          if (T.length === 0 && V) he(_.a);
          else {
            _.f += T.length, V && (_.j = V);
            var Se, Ye = [];
            for (Se = 0; Se < T.length; Se++) {
              var Fe = T[Se], ft = be[Fe.c], xt = _.a, He = Fe;
              if (xt.g && u(xt.f, [xt.a.c("wf", He.c, j(He).toString(), "loading")]), Ve(xt, "fontloading", He), xt = null, nt === null) if (window.FontFace) {
                var He = /Gecko.*Firefox\/(\d+)/.exec(window.navigator.userAgent), Ft = /OS X.*Version\/10\..*Safari/.exec(window.navigator.userAgent) && /Apple/.exec(window.navigator.vendor);
                nt = He ? 42 < parseInt(He[1], 10) : !Ft;
              } else nt = !1;
              nt ? xt = new Pe(s(_.g, _), s(_.h, _), _.c, Fe, _.s, ft) : xt = new st(s(_.g, _), s(_.h, _), _.c, Fe, _.s, ee, ft), Ye.push(xt);
            }
            for (Se = 0; Se < Ye.length; Se++) Ye[Se].start();
          }
        }, 0);
      }
      function m(c, _, T) {
        var P = [], x = T.timeout;
        Te(_);
        var P = lt(c.a, T, c.c), V = new Ke(c.c, _, x);
        for (c.h = P.length, _ = 0, T = P.length; _ < T; _++) P[_].load(function(ee, be, Se) {
          d(c, V, ee, be, Se);
        });
      }
      function k(c, _) {
        this.c = c, this.a = _;
      }
      k.prototype.load = function(c) {
        function _() {
          if (V["__mti_fntLst" + x]) {
            var ee = V["__mti_fntLst" + x](), be = [], Se;
            if (ee) for (var Ye = 0; Ye < ee.length; Ye++) {
              var Fe = ee[Ye].fontfamily;
              ee[Ye].fontStyle != null && ee[Ye].fontWeight != null ? (Se = ee[Ye].fontStyle + ee[Ye].fontWeight, be.push(new z(Fe, Se))) : be.push(new z(Fe));
            }
            c(be);
          } else setTimeout(function() {
            _();
          }, 50);
        }
        var T = this, x = T.a.projectId, P = T.a.version;
        if (x) {
          var V = T.c.o;
          B(this.c, (T.a.api || "https://fast.fonts.net/jsapi") + "/" + x + ".js" + (P ? "?v=" + P : ""), function(ee) {
            ee ? c([]) : (V["__MonotypeConfiguration__" + x] = function() {
              return T.a;
            }, _());
          }).id = "__MonotypeAPIScript__" + x;
        } else c([]);
      };
      function L(c, _) {
        this.c = c, this.a = _;
      }
      L.prototype.load = function(c) {
        var _, T, x = this.a.urls || [], P = this.a.families || [], V = this.a.testStrings || {}, ee = new G();
        for (_ = 0, T = x.length; _ < T; _++) F(this.c, x[_], Ce(ee));
        var be = [];
        for (_ = 0, T = P.length; _ < T; _++) if (x = P[_].split(":"), x[1]) for (var Se = x[1].split(","), Ye = 0; Ye < Se.length; Ye += 1) be.push(new z(x[0], Se[Ye]));
        else be.push(new z(x[0]));
        ne(ee, function() {
          c(be, V);
        });
      };
      function S(c, _) {
        c ? this.c = c : this.c = A, this.a = [], this.f = [], this.g = _ || "";
      }
      var A = "https://fonts.googleapis.com/css";
      function D(c, _) {
        for (var T = _.length, x = 0; x < T; x++) {
          var P = _[x].split(":");
          P.length == 3 && c.f.push(P.pop());
          var V = "";
          P.length == 2 && P[1] != "" && (V = ":"), c.a.push(P.join(V));
        }
      }
      function $(c) {
        if (c.a.length == 0) throw Error("No fonts to load!");
        if (c.c.indexOf("kit=") != -1) return c.c;
        for (var _ = c.a.length, T = [], x = 0; x < _; x++) T.push(c.a[x].replace(/ /g, "+"));
        return _ = c.c + "?family=" + T.join("%7C"), 0 < c.f.length && (_ += "&subset=" + c.f.join(",")), 0 < c.g.length && (_ += "&text=" + encodeURIComponent(c.g)), _;
      }
      function N(c) {
        this.f = c, this.a = [], this.c = {};
      }
      var O = { latin: "BESbswy", "latin-ext": "çöüğş", cyrillic: "йяЖ", greek: "αβΣ", khmer: "កខគ", Hanuman: "កខគ" }, X = { thin: "1", extralight: "2", "extra-light": "2", ultralight: "2", "ultra-light": "2", light: "3", regular: "4", book: "4", medium: "5", "semi-bold": "6", semibold: "6", "demi-bold": "6", demibold: "6", bold: "7", "extra-bold": "8", extrabold: "8", "ultra-bold": "8", ultrabold: "8", black: "9", heavy: "9", l: "3", r: "4", b: "7" }, U = { i: "i", italic: "i", n: "n", normal: "n" }, Y = /^(thin|(?:(?:extra|ultra)-?)?light|regular|book|medium|(?:(?:semi|demi|extra|ultra)-?)?bold|black|heavy|l|r|b|[1-9]00)?(n|i|normal|italic)?$/;
      function Q(c) {
        for (var _ = c.f.length, T = 0; T < _; T++) {
          var x = c.f[T].split(":"), P = x[0].replace(/\+/g, " "), V = ["n4"];
          if (2 <= x.length) {
            var ee, be = x[1];
            if (ee = [], be) for (var be = be.split(","), Se = be.length, Ye = 0; Ye < Se; Ye++) {
              var Fe;
              if (Fe = be[Ye], Fe.match(/^[\w-]+$/)) {
                var ft = Y.exec(Fe.toLowerCase());
                if (ft == null) Fe = "";
                else {
                  if (Fe = ft[2], Fe = Fe == null || Fe == "" ? "n" : U[Fe], ft = ft[1], ft == null || ft == "") ft = "4";
                  else var xt = X[ft], ft = xt || (isNaN(ft) ? "4" : ft.substr(0, 1));
                  Fe = [Fe, ft].join("");
                }
              } else Fe = "";
              Fe && ee.push(Fe);
            }
            0 < ee.length && (V = ee), x.length == 3 && (x = x[2], ee = [], x = x ? x.split(",") : ee, 0 < x.length && (x = O[x[0]]) && (c.c[P] = x));
          }
          for (c.c[P] || (x = O[P]) && (c.c[P] = x), x = 0; x < V.length; x += 1) c.a.push(new z(P, V[x]));
        }
      }
      function re(c, _) {
        this.c = c, this.a = _;
      }
      var _e = { Arimo: !0, Cousine: !0, Tinos: !0 };
      re.prototype.load = function(c) {
        var _ = new G(), T = this.c, x = new S(this.a.api, this.a.text), P = this.a.families;
        D(x, P);
        var V = new N(P);
        Q(V), F(T, $(x), Ce(_)), ne(_, function() {
          c(V.a, V.c, _e);
        });
      };
      function xe(c, _) {
        this.c = c, this.a = _;
      }
      xe.prototype.load = function(c) {
        var _ = this.a.id, T = this.c.o;
        _ ? B(this.c, (this.a.api || "https://use.typekit.net") + "/" + _ + ".js", function(x) {
          if (x) c([]);
          else if (T.Typekit && T.Typekit.config && T.Typekit.config.fn) {
            x = T.Typekit.config.fn;
            for (var P = [], V = 0; V < x.length; V += 2) for (var ee = x[V], be = x[V + 1], Se = 0; Se < be.length; Se++) P.push(new z(ee, be[Se]));
            try {
              T.Typekit.load({ events: !1, classes: !1, async: !0 });
            } catch {
            }
            c(P);
          }
        }, 2e3) : c([]);
      };
      function Ge(c, _) {
        this.c = c, this.f = _, this.a = [];
      }
      Ge.prototype.load = function(c) {
        var _ = this.f.id, T = this.c.o, x = this;
        _ ? (T.__webfontfontdeckmodule__ || (T.__webfontfontdeckmodule__ = {}), T.__webfontfontdeckmodule__[_] = function(P, V) {
          for (var ee = 0, be = V.fonts.length; ee < be; ++ee) {
            var Se = V.fonts[ee];
            x.a.push(new z(Se.name, it("font-weight:" + Se.weight + ";font-style:" + Se.style)));
          }
          c(x.a);
        }, B(this.c, (this.f.api || "https://f.fontdeck.com/s/css/js/") + v(this.c) + "/" + _ + ".js", function(P) {
          P && c([]);
        })) : c([]);
      };
      var ze = new Nt(window);
      ze.a.c.custom = function(c, _) {
        return new L(_, c);
      }, ze.a.c.fontdeck = function(c, _) {
        return new Ge(_, c);
      }, ze.a.c.monotype = function(c, _) {
        return new k(_, c);
      }, ze.a.c.typekit = function(c, _) {
        return new xe(_, c);
      }, ze.a.c.google = function(c, _) {
        return new re(_, c);
      };
      var gt = { load: s(ze.load, ze) };
      t.exports ? t.exports = gt : (window.WebFont = gt, window.WebFontConfig && ze.load(window.WebFontConfig));
    })();
  }(ii)), ii.exports;
}
var np = tp();
const sp = /* @__PURE__ */ ep(np);
function rp() {
  const t = ge({}), e = ge(""), n = (r) => {
    t.value = r, r.photo_url && (t.value.photo_url = r.photo_url), r.font_family && sp.load({
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
        chat_bubble_color: r.chat_bubble_color || "#C9F24E",
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
function ip() {
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
const op = {
  key: 0,
  class: "widget-unavailable-overlay"
}, ap = {
  key: 1,
  class: "auth-error-overlay"
}, lp = { class: "auth-error-card" }, cp = { class: "auth-error-message" }, up = {
  key: 0,
  class: "initializing-overlay"
}, fp = {
  key: 0,
  class: "connecting-message"
}, hp = {
  key: 1,
  class: "failed-message"
}, dp = { class: "welcome-content" }, pp = { class: "welcome-header" }, gp = ["src", "alt"], mp = { class: "welcome-title" }, _p = { class: "welcome-subtitle" }, yp = { class: "welcome-input-container" }, vp = {
  key: 0,
  class: "email-input"
}, bp = ["disabled"], wp = { class: "welcome-message-input" }, kp = ["placeholder", "disabled"], xp = ["disabled"], Tp = {
  key: 0,
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, Sp = {
  key: 1,
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, Ap = { class: "landing-page-content" }, Ep = { class: "landing-page-header" }, Cp = { class: "landing-page-heading" }, Rp = { class: "landing-page-text" }, Ip = { class: "landing-page-actions" }, Lp = { class: "form-fullscreen-content" }, Op = {
  key: 0,
  class: "form-header"
}, Pp = {
  key: 0,
  class: "form-title"
}, Np = {
  key: 1,
  class: "form-description"
}, Fp = { class: "form-fields" }, Dp = ["for"], Mp = {
  key: 0,
  class: "required-indicator"
}, $p = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "autocomplete", "inputmode"], Bp = ["id", "placeholder", "required", "min", "max", "value", "onInput"], Up = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput"], zp = ["id", "required", "value", "onChange"], Hp = { value: "" }, Wp = ["value"], qp = {
  key: 4,
  class: "checkbox-field"
}, jp = ["id", "required", "checked", "onChange"], Vp = { class: "checkbox-label" }, Kp = {
  key: 5,
  class: "radio-group"
}, Gp = ["name", "value", "required", "checked", "onChange"], Yp = { class: "radio-label" }, Xp = {
  key: 6,
  class: "field-error"
}, Zp = { class: "form-actions" }, Jp = ["disabled"], Qp = {
  key: 0,
  class: "loading-spinner-inline"
}, eg = { key: 1 }, tg = { class: "header-content" }, ng = ["src", "alt"], sg = { class: "header-info" }, rg = { class: "status" }, ig = { class: "ask-anything-header" }, og = ["src", "alt"], ag = { class: "header-info" }, lg = {
  key: 2,
  class: "loading-history"
}, cg = {
  key: 0,
  class: "rating-content"
}, ug = { class: "rating-prompt" }, fg = ["onMouseover", "onMouseleave", "onClick", "disabled"], hg = {
  key: 0,
  class: "feedback-wrapper"
}, dg = { class: "feedback-section" }, pg = ["onUpdate:modelValue", "disabled"], gg = { class: "feedback-counter" }, mg = ["onClick", "disabled"], _g = {
  key: 1,
  class: "submitted-feedback-wrapper"
}, yg = { class: "submitted-feedback" }, vg = { class: "submitted-feedback-text" }, bg = {
  key: 2,
  class: "submitted-message"
}, wg = {
  key: 1,
  class: "form-content"
}, kg = {
  key: 0,
  class: "form-header"
}, xg = {
  key: 0,
  class: "form-title"
}, Tg = {
  key: 1,
  class: "form-description"
}, Sg = { class: "form-fields" }, Ag = ["for"], Eg = {
  key: 0,
  class: "required-indicator"
}, Cg = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "disabled", "autocomplete", "inputmode"], Rg = ["id", "placeholder", "required", "min", "max", "value", "onInput", "disabled"], Ig = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "disabled"], Lg = ["id", "required", "value", "onChange", "disabled"], Og = { value: "" }, Pg = ["value"], Ng = {
  key: 4,
  class: "checkbox-field"
}, Fg = ["id", "checked", "onChange", "disabled"], Dg = ["for"], Mg = {
  key: 5,
  class: "radio-field"
}, $g = ["id", "name", "value", "checked", "onChange", "disabled"], Bg = ["for"], Ug = {
  key: 6,
  class: "field-error"
}, zg = { class: "form-actions" }, Hg = ["onClick", "disabled"], Wg = {
  key: 2,
  class: "user-input-content"
}, qg = {
  key: 0,
  class: "user-input-prompt"
}, jg = {
  key: 1,
  class: "user-input-form"
}, Vg = ["onUpdate:modelValue", "onKeydown"], Kg = ["onClick", "disabled"], Gg = {
  key: 2,
  class: "user-input-submitted"
}, Yg = {
  key: 0,
  class: "user-input-confirmation"
}, Xg = {
  key: 3,
  class: "product-message-container"
}, Zg = ["innerHTML"], Jg = {
  key: 1,
  class: "products-carousel"
}, Qg = { class: "carousel-items" }, em = {
  key: 0,
  class: "product-image-compact"
}, tm = ["src", "alt"], nm = { class: "product-info-compact" }, sm = { class: "product-text-area" }, rm = { class: "product-title-compact" }, im = {
  key: 0,
  class: "product-variant-compact"
}, om = { class: "product-price-compact" }, am = { class: "product-actions-compact" }, lm = ["onClick"], cm = {
  key: 2,
  class: "no-products-message"
}, um = {
  key: 3,
  class: "no-products-message"
}, fm = ["innerHTML"], hm = {
  key: 0,
  class: "message-attachments"
}, dm = {
  key: 0,
  class: "attachment-image-container"
}, pm = ["src", "alt", "onClick"], gm = { class: "attachment-image-info" }, mm = ["href"], _m = { class: "attachment-size" }, ym = ["href"], vm = { class: "attachment-size" }, bm = {
  key: 0,
  class: "citation-chips"
}, wm = ["title"], km = { class: "message-info" }, xm = {
  key: 0,
  class: "agent-name"
}, Tm = {
  key: 0,
  class: "email-input"
}, Sm = ["disabled"], Am = {
  key: 1,
  class: "file-previews-widget"
}, Em = {
  class: "file-preview-content-widget",
  style: { cursor: "pointer" }
}, Cm = ["src", "alt", "onClick"], Rm = ["onClick"], Im = { class: "file-preview-info-widget" }, Lm = { class: "file-preview-name-widget" }, Om = { class: "file-preview-size-widget" }, Pm = ["onClick"], Nm = {
  key: 2,
  class: "upload-progress-widget"
}, Fm = { class: "message-input" }, Dm = ["placeholder", "disabled"], Mm = ["disabled", "title"], $m = ["disabled"], Bm = { class: "conversation-ended-message" }, Um = {
  key: 7,
  class: "rating-dialog"
}, zm = { class: "rating-content" }, Hm = { class: "star-rating" }, Wm = ["onClick"], qm = { class: "rating-actions" }, jm = ["disabled"], Vm = {
  key: 0,
  class: "preview-modal-image-container"
}, Km = ["src", "alt"], Gm = { class: "preview-modal-filename" }, Ym = {
  key: 3,
  class: "widget-loading"
}, xs = "ctid", Sa = 3, Xm = "image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls", Zm = /* @__PURE__ */ gu({
  __name: "WidgetBuilder",
  props: {
    widgetId: {},
    token: {},
    initialAuthError: {}
  },
  setup(t) {
    var go;
    Ie.setOptions({
      renderer: new Ie.Renderer(),
      gfm: !0,
      breaks: !0
    });
    const e = new Ie.Renderer(), n = e.link;
    e.link = (p, g, f) => n.call(e, p, g, f).replace(/^<a /, '<a target="_blank" rel="nofollow" '), Ie.use({ renderer: e });
    const s = (p) => Jh(Ie(p, { renderer: e })), r = t, i = qe(() => {
      var p;
      return r.widgetId || ((p = window.__INITIAL_DATA__) == null ? void 0 : p.widgetId);
    }), {
      customization: o,
      agentName: a,
      applyCustomization: l,
      initializeFromData: h
    } = rp(), { formatCurrency: u } = ip(), {
      messages: b,
      loading: v,
      errorMessage: F,
      showError: B,
      loadingHistory: G,
      hasStartedChat: Ce,
      connectionStatus: ne,
      sendMessage: Ee,
      loadChatHistory: ke,
      connect: z,
      reconnect: H,
      cleanup: J,
      humanAgent: j,
      onTakeover: Le,
      submitRating: it,
      submitForm: je,
      currentForm: Te,
      getWorkflowState: he,
      proceedWorkflow: Ve,
      onWorkflowState: Qe,
      onWorkflowProceeded: lt,
      currentSessionId: ie,
      setToken: de,
      setWidgetId: oe
    } = Qd(), Pe = ge(""), st = ge(!0), se = ge(""), Oe = ge(!1), Ne = (p) => {
      const g = p.target;
      Pe.value = g.value;
    };
    let W = null;
    const ae = () => {
      W && W.disconnect(), W = new MutationObserver((g) => {
        let f = !1, te = !1;
        g.forEach((ve) => {
          if (ve.type === "childList") {
            const ue = Array.from(ve.addedNodes).some(
              (we) => {
                var Gt;
                return we.nodeType === Node.ELEMENT_NODE && (we.matches("input, textarea") || ((Gt = we.querySelector) == null ? void 0 : Gt.call(we, "input, textarea")));
              }
            ), We = Array.from(ve.removedNodes).some(
              (we) => {
                var Gt;
                return we.nodeType === Node.ELEMENT_NODE && (we.matches("input, textarea") || ((Gt = we.querySelector) == null ? void 0 : Gt.call(we, "input, textarea")));
              }
            );
            ue && (te = !0, f = !0), We && (f = !0);
          }
        }), f && (clearTimeout(ae.timeoutId), ae.timeoutId = setTimeout(() => {
          q();
        }, te ? 50 : 100));
      });
      const p = document.querySelector(".widget-container") || document.body;
      W.observe(p, {
        childList: !0,
        subtree: !0
      });
    };
    ae.timeoutId = null;
    let le = [];
    const q = () => {
      Ke();
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
      for (const f of p) {
        const te = document.querySelectorAll(f);
        if (te.length > 0) {
          g = Array.from(te);
          break;
        }
      }
      g.length !== 0 && (le = g, g.forEach((f) => {
        f.addEventListener("input", ot, !0), f.addEventListener("keyup", ot, !0), f.addEventListener("change", ot, !0), f.addEventListener("keypress", Nt, !0), f.addEventListener("keydown", d, !0);
      }));
    }, Ke = () => {
      le.forEach((p) => {
        p.removeEventListener("input", ot), p.removeEventListener("keyup", ot), p.removeEventListener("change", ot), p.removeEventListener("keypress", Nt), p.removeEventListener("keydown", d);
      }), le = [];
    }, nt = (p) => !!(p && p.closest && p.closest(".form-message, .form-fullscreen")), ot = (p) => {
      if (nt(p.target)) return;
      const g = p.target;
      Pe.value = g.value;
    }, Nt = (p) => {
      nt(p.target) || p.key === "Enter" && !p.shiftKey && (p.preventDefault(), p.stopPropagation(), kn());
    }, d = (p) => {
      nt(p.target) || p.key === "Enter" && !p.shiftKey && (p.preventDefault(), p.stopPropagation(), kn());
    }, m = (p) => {
      const g = p.target, f = document.querySelector(".header-menu-container");
      document.querySelector(".header-menu-btn");
      const te = document.querySelector(".header-dropdown-menu");
      te && !(f != null && f.contains(g)) && (te.style.display = "none");
    }, k = ge(!0), L = (p) => !p || p === "undefined" || p === "null" || typeof p == "string" && p.trim() === "" ? null : p, S = ge(L(((go = window.__INITIAL_DATA__) == null ? void 0 : go.initialToken) || localStorage.getItem(xs)));
    qe(() => !!S.value);
    const A = ge(null), D = ge(!1), $ = ge(!1);
    r.initialAuthError && (A.value = r.initialAuthError, D.value = !0, k.value = !1), h();
    const N = window.__INITIAL_DATA__;
    if (N != null && N.initialToken) {
      const p = L(N.initialToken);
      p && (S.value = p, window.parent.postMessage({
        type: "TOKEN_UPDATE",
        token: p
      }, "*"), Oe.value = !0);
    }
    const O = ge(!1);
    (N == null ? void 0 : N.allowAttachments) !== void 0 && (O.value = N.allowAttachments);
    const X = ge(null), {
      chatStyles: U,
      chatIconStyles: Y,
      agentBubbleStyles: Q,
      userBubbleStyles: re,
      messageNameStyles: _e,
      headerBorderStyles: xe,
      photoUrl: Ge,
      shadowStyle: ze
    } = nd(o), gt = ge(null), {
      uploadedAttachments: c,
      previewModal: _,
      previewFile: T,
      formatFileSize: x,
      isImageAttachment: P,
      getDownloadUrl: V,
      getPreviewUrl: ee,
      handleFileSelect: be,
      handleDrop: Se,
      handleDragOver: Ye,
      handleDragLeave: Fe,
      handlePaste: ft,
      removeAttachment: xt,
      openPreview: He,
      closePreview: Ft,
      openFilePicker: Ws,
      isImage: ls
    } = id(S, gt);
    qe(() => b.value.some(
      (p) => p.message_type === "form" && (!p.isSubmitted || p.isSubmitted === !1)
    ));
    const Qt = qe(() => {
      var p;
      return Ce.value && Oe.value || !Br.value ? ne.value === "connected" && !v.value : ps(se.value.trim()) && ne.value === "connected" && !v.value || ((p = window.__INITIAL_DATA__) == null ? void 0 : p.workflow);
    }), cs = qe(() => ne.value === "connected" ? en.value ? "Ask me anything..." : "Type a message..." : "Connecting..."), kn = async () => {
      if (!Pe.value.trim() && c.value.length === 0) return;
      !Ce.value && se.value && await Tt();
      const p = c.value.map((f) => ({
        content: f.content,
        // base64 content
        filename: f.filename,
        content_type: f.type,
        size: f.size
      }));
      await Ee(Pe.value, se.value, p), c.value.forEach((f) => {
        f.url && f.url.startsWith("blob:") && URL.revokeObjectURL(f.url), f.file_url && f.file_url.startsWith("blob:") && URL.revokeObjectURL(f.file_url);
      }), Pe.value = "", c.value = [];
      const g = document.querySelector('input[placeholder*="Type a message"]');
      g && (g.value = ""), setTimeout(() => {
        q();
      }, 500);
    }, qs = (p) => {
      p.key === "Enter" && !p.shiftKey && (p.preventDefault(), p.stopPropagation(), kn());
    }, Tt = async () => {
      var p, g, f, te;
      try {
        if (!i.value)
          return console.error("Widget ID is not available"), A.value = "Widget ID is not available. Please refresh and try again.", D.value = !0, !1;
        const ve = new URL(`${Cn.API_URL}/widgets/${i.value}`);
        se.value.trim() && ps(se.value.trim()) && ve.searchParams.append("email", se.value.trim());
        const ue = {
          Accept: "application/json",
          "Content-Type": "application/json"
        };
        S.value && (ue.Authorization = `Bearer ${S.value}`);
        const We = await fetch(ve, {
          headers: ue
        });
        if (We.status === 401) {
          Oe.value = !1;
          try {
            const Xn = (await We.json()).detail || "";
            (Xn.includes("generate-token") || Xn.includes("API key") || Xn.includes("Token required")) && ($.value = !0, A.value = "Widget authentication not configured. Please contact the website administrator.", D.value = !0, localStorage.removeItem(xs), S.value = null);
          } catch {
            A.value = "Authentication required. Your token has expired or is invalid. Please refresh the page.", D.value = !0, localStorage.removeItem(xs), S.value = null;
          }
          return !1;
        }
        if (!We.ok) {
          try {
            const fs = await We.json();
            A.value = fs.detail || `Error: ${We.statusText}`;
          } catch {
            A.value = `Error: ${We.statusText}. Please try again.`;
          }
          return D.value = !0, !1;
        }
        const we = await We.json();
        return we.token && (S.value = we.token, localStorage.setItem(xs, we.token), window.parent.postMessage({ type: "TOKEN_UPDATE", token: we.token }, "*")), Oe.value = !0, A.value = null, D.value = !1, de(S.value || void 0), await z() ? (await xn(), (p = we.agent) != null && p.customization && l(we.agent.customization), we.agent && !(we != null && we.human_agent) && (a.value = we.agent.name), we != null && we.human_agent && (j.value = we.human_agent), ((g = we.agent) == null ? void 0 : g.allow_attachments) !== void 0 && (O.value = we.agent.allow_attachments), ((f = we.agent) == null ? void 0 : f.workflow) !== void 0 && (window.__INITIAL_DATA__ = window.__INITIAL_DATA__ || {}, window.__INITIAL_DATA__.workflow = we.agent.workflow), (te = we.agent) != null && te.workflow && await he(), !0) : (console.error("Failed to connect to chat service"), A.value = "Failed to connect to chat service. Please try again.", D.value = !0, !1);
      } catch (ve) {
        return console.error("Error checking authorization:", ve), A.value = "An unexpected error occurred. Please try again.", D.value = !0, Oe.value = !1, !1;
      } finally {
        k.value = !1;
      }
    }, xn = async () => {
      !Ce.value && Oe.value && (Ce.value = !0, await ke());
    }, Kn = () => {
      X.value && (X.value.scrollTop = X.value.scrollHeight);
    };
    Wn(() => b.value, (p) => {
      Za(() => {
        Kn();
      });
    }, { deep: !0 }), Wn(ne, (p, g) => {
      p === "connected" && g !== "connected" && setTimeout(q, 100);
    }), Wn(() => b.value.length, (p, g) => {
      p > 0 && g === 0 && setTimeout(q, 100);
    }), Wn(() => b.value, (p) => {
      if (p.length > 0) {
        const g = p[p.length - 1];
        vt(g);
      }
    }, { deep: !0 });
    const js = async () => {
      await H() && await Tt();
    }, Gn = ge(!1), Fn = ge(0), Dt = ge(""), Mt = ge(0), $t = ge(!1), ct = ge({}), ht = ge(!1), ut = ge({}), Z = ge(!1), y = ge(null), M = ge("Start Chat"), K = ge(!1), ye = ge(null);
    qe(() => {
      var g;
      const p = b.value[b.value.length - 1];
      return ((g = p == null ? void 0 : p.attributes) == null ? void 0 : g.request_rating) || !1;
    });
    const mt = qe(() => {
      var g;
      if (!((g = window.__INITIAL_DATA__) != null && g.workflow))
        return !1;
      const p = b.value.find((f) => f.message_type === "rating");
      return (p == null ? void 0 : p.isSubmitted) === !0;
    }), rt = qe(() => j.value.human_agent_profile_pic ? ro(j.value.human_agent_profile_pic) ? j.value.human_agent_profile_pic : `${Cn.API_URL}${j.value.human_agent_profile_pic}` : ""), vt = async (p) => {
      var g, f, te, ve, ue;
      try {
        if (p.session_id && S.value && i.value) {
          const We = new URL(`${Cn.API_URL}/widgets/${i.value}/end-chat`);
          We.searchParams.append("session_id", p.session_id), (g = p.attributes) != null && g.end_chat_reason && We.searchParams.append("reason", p.attributes.end_chat_reason), (f = p.attributes) != null && f.end_chat_description && We.searchParams.append("description", p.attributes.end_chat_description);
          const we = await fetch(We, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${S.value}`,
              "Content-Type": "application/json"
            }
          });
          if (we.ok) {
            const Gt = await we.json();
            console.info(`✓ Chat session closed on backend: ${Gt.session_id}`);
          } else
            console.warn(`Failed to close session on backend: ${we.status}`);
        }
      } catch (We) {
        console.error("Error calling end-chat API:", We);
      }
      if ((te = p.attributes) != null && te.end_chat && ((ve = p.attributes) != null && ve.request_rating)) {
        const We = p.agent_name || ((ue = j.value) == null ? void 0 : ue.human_agent_name) || a.value || "our agent";
        b.value.push({
          message: `Rate the chat session that you had with ${We}`,
          message_type: "rating",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          session_id: p.session_id,
          agent_name: We,
          showFeedback: !1
        }), ie.value = p.session_id;
      }
    }, Kt = (p) => {
      $t.value || (Mt.value = p);
    }, Dn = () => {
      if (!$t.value) {
        const p = b.value[b.value.length - 1];
        Mt.value = (p == null ? void 0 : p.selectedRating) || 0;
      }
    }, us = async (p) => {
      if (!$t.value) {
        Mt.value = p;
        const g = b.value[b.value.length - 1];
        g && g.message_type === "rating" && (g.showFeedback = !0, g.selectedRating = p);
      }
    }, _t = async (p, g, f = null) => {
      try {
        $t.value = !0, await it(g, f);
        const te = b.value.find((ve) => ve.message_type === "rating");
        te && (te.isSubmitted = !0, te.finalRating = g, te.finalFeedback = f);
      } catch (te) {
        console.error("Failed to submit rating:", te);
      } finally {
        $t.value = !1;
      }
    }, Vs = (p) => {
      const g = {};
      for (const f of p.fields) {
        const te = ct.value[f.name], ve = Dr(f, te);
        ve && (g[f.name] = ve);
      }
      return ut.value = g, Object.keys(g).length === 0;
    }, Ks = async (p) => {
      if (!(ht.value || !Vs(p)))
        try {
          ht.value = !0, await je(ct.value);
          const f = b.value.findIndex(
            (te) => te.message_type === "form" && (!te.isSubmitted || te.isSubmitted === !1)
          );
          f !== -1 && b.value.splice(f, 1), ct.value = {}, ut.value = {};
        } catch (f) {
          console.error("Failed to submit form:", f);
        } finally {
          ht.value = !1;
        }
    }, Ot = (p, g) => {
      var f, te;
      if (ct.value[p] = g, g && g.toString().trim() !== "") {
        let ve = null;
        if ((f = ye.value) != null && f.fields && (ve = ye.value.fields.find((ue) => ue.name === p)), !ve && ((te = Te.value) != null && te.fields) && (ve = Te.value.fields.find((ue) => ue.name === p)), ve) {
          const ue = Dr(ve, g);
          ue ? (ut.value[p] = ue, console.log(`Validation error for ${p}:`, ue)) : delete ut.value[p];
        }
      } else
        delete ut.value[p], console.log(`Cleared error for ${p}`);
    }, ac = (p) => {
      const g = p.replace(/\D/g, "");
      return g.length >= 7 && g.length <= 15;
    }, Dr = (p, g) => {
      if (p.required && (!g || g.toString().trim() === ""))
        return `${p.label} is required`;
      if (!g || g.toString().trim() === "")
        return null;
      if (p.type === "email" && !ps(g))
        return "Please enter a valid email address";
      if (p.type === "tel" && !ac(g))
        return "Please enter a valid phone number";
      if ((p.type === "text" || p.type === "textarea") && p.minLength && g.length < p.minLength)
        return `${p.label} must be at least ${p.minLength} characters`;
      if ((p.type === "text" || p.type === "textarea") && p.maxLength && g.length > p.maxLength)
        return `${p.label} must not exceed ${p.maxLength} characters`;
      if (p.type === "number") {
        const f = parseFloat(g);
        if (isNaN(f))
          return `${p.label} must be a valid number`;
        if (p.minLength && f < p.minLength)
          return `${p.label} must be at least ${p.minLength}`;
        if (p.maxLength && f > p.maxLength)
          return `${p.label} must not exceed ${p.maxLength}`;
      }
      return null;
    }, lc = async () => {
      if (!(ht.value || !ye.value))
        try {
          ht.value = !0, ut.value = {};
          let p = !1;
          for (const g of ye.value.fields || []) {
            const f = ct.value[g.name], te = Dr(g, f);
            te && (ut.value[g.name] = te, p = !0, console.log(`Validation error for field ${g.name}:`, te));
          }
          if (p) {
            ht.value = !1, console.log("Validation failed, not submitting");
            return;
          }
          await je(ct.value), K.value = !1, ye.value = null, ct.value = {};
        } catch (p) {
          console.error("Failed to submit full screen form:", p);
        } finally {
          ht.value = !1, console.log("Full screen form submission completed");
        }
    }, cc = (p, g) => {
      if (console.log("handleViewDetails called with:", { product: p, shopDomain: g }), !p) {
        console.error("No product provided to handleViewDetails");
        return;
      }
      let f = null;
      if (p.handle && g)
        f = `https://${g}/products/${p.handle}`;
      else if (p.id && g)
        f = `https://${g}/products/${p.id}`;
      else if (g) {
        if (!p.handle && !p.id) {
          console.error("Product handle and ID are both missing! Product:", p), alert("Unable to open product: Product information incomplete.");
          return;
        }
      } else {
        console.error("Shop domain is missing! Product:", p), alert("Unable to open product: Shop domain not available. Please contact support.");
        return;
      }
      f && (console.log("Opening product URL:", f), window.open(f, "_blank"));
    }, uc = (p) => {
      if (!p) return "";
      let g = p.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "");
      const f = [];
      return g = g.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (te, ve, ue) => {
        const We = `__MARKDOWN_LINK_${f.length}__`;
        return console.log("Found markdown link:", te, "-> placeholder:", We), f.push(te), We;
      }), console.log("After replacing markdown links with placeholders:", g), console.log("Markdown links array:", f), g = g.replace(/https?:\/\/[^\s\)]+/g, "[link removed]"), console.log("After removing standalone URLs:", g), f.forEach((te, ve) => {
        g = g.replace(`__MARKDOWN_LINK_${ve}__`, te), console.log(`Restored markdown link ${ve}:`, te);
      }), g = g.replace(/\n\s*\n\s*\n/g, `

`).trim(), g;
    }, uo = ge(!1);
    ge(!1);
    const fc = qe(() => {
      var g;
      const p = !!((g = j.value) != null && g.human_agent_name);
      return O.value && p && c.value.length < Sa;
    }), hc = async () => {
      try {
        Z.value = !1, y.value = null, await Ve();
      } catch (p) {
        console.error("Failed to proceed workflow:", p);
      }
    }, Mr = async (p) => {
      try {
        if (!p.userInputValue || !p.userInputValue.trim())
          return;
        const g = p.userInputValue.trim();
        p.isSubmitted = !0, p.submittedValue = g, await Ee(g, se.value);
      } catch (g) {
        console.error("Failed to submit user input:", g), p.isSubmitted = !1, p.submittedValue = null;
      }
    }, fo = async () => {
      var p, g, f;
      try {
        let te = 0;
        const ve = 50;
        for (; !((p = window.__INITIAL_DATA__) != null && p.widgetId) && te < ve; )
          await new Promise((We) => setTimeout(We, 100)), te++;
        return (g = window.__INITIAL_DATA__) != null && g.widgetId ? (oe(window.__INITIAL_DATA__.widgetId), await Tt() ? ((f = window.__INITIAL_DATA__) != null && f.workflow && Oe.value && await he(), !0) : (ne.value = "connected", !1)) : (console.error("Widget data not available after waiting"), !1);
      } catch (te) {
        return console.error("Failed to initialize widget:", te), !1;
      }
    }, dc = () => {
      Le(async () => {
        await Tt();
      }), window.addEventListener("message", (p) => {
        p.data.type === "SCROLL_TO_BOTTOM" && Kn(), p.data.type === "TOKEN_RECEIVED" && localStorage.setItem(xs, p.data.token);
      }), Qe((p) => {
        var g;
        if (M.value = p.button_text || "Start Chat", p.type === "landing_page")
          y.value = p.landing_page_data, Z.value = !0, K.value = !1;
        else if (p.type === "form" || p.type === "display_form")
          if (((g = p.form_data) == null ? void 0 : g.form_full_screen) === !0)
            ye.value = p.form_data, K.value = !0, Z.value = !1;
          else {
            const f = {
              message: "",
              message_type: "form",
              attributes: {
                form_data: p.form_data
              },
              created_at: (/* @__PURE__ */ new Date()).toISOString(),
              isSubmitted: !1
            };
            b.value.findIndex(
              (ve) => ve.message_type === "form" && !ve.isSubmitted
            ) === -1 && b.value.push(f), Z.value = !1, K.value = !1;
          }
        else
          Z.value = !1, K.value = !1;
      }), lt((p) => {
        console.log("Workflow proceeded:", p);
      });
    }, pc = async () => {
      try {
        await fo(), await he();
      } catch (p) {
        throw console.error("Failed to start new conversation:", p), p;
      }
    }, gc = async () => {
      mt.value = !1, b.value = [], await pc();
    };
    il(async () => {
      await fo(), dc(), ae(), document.addEventListener("click", m), (() => {
        const g = b.value.length > 0, f = ne.value === "connected", te = document.querySelector('input[type="text"], textarea') !== null;
        return g || f || te;
      })() && setTimeout(q, 100);
    }), qi(() => {
      window.removeEventListener("message", (p) => {
        p.data.type === "SCROLL_TO_BOTTOM" && Kn();
      }), document.removeEventListener("click", m), W && (W.disconnect(), W = null), ae.timeoutId && (clearTimeout(ae.timeoutId), ae.timeoutId = null), Ke(), J();
    });
    const Yn = qe(() => o.value.chat_style === "AURORA"), en = qe(() => o.value.chat_style === "ASK_ANYTHING" || Yn.value), ho = qe(() => o.value.customization_metadata), mc = qe(() => {
      var g;
      const p = (g = ho.value) == null ? void 0 : g.avatar_style;
      return p === "orb" ? !0 : p === "photo" ? !1 : Yn.value && !o.value.photo_url;
    }), _c = qe(() => {
      var p;
      return td(a.value || "", (p = ho.value) == null ? void 0 : p.orb_variant);
    }), yc = {
      GLASS: "theme-glass",
      TERMINAL: "theme-terminal",
      PLAYFUL: "theme-playful",
      CALM_MINT: "theme-calm"
    }, vc = qe(() => yc[o.value.chat_style] || ""), $r = qe(() => o.value.show_citations === !0), Br = qe(() => o.value.collect_email === !0 && !en.value), bc = qe(() => {
      const p = {
        width: "100%",
        height: "580px",
        borderRadius: "var(--radius-lg)"
      };
      return window.innerWidth <= 768 && (p.width = "100vw", p.height = "100vh", p.borderRadius = "0", p.position = "fixed", p.top = "0", p.left = "0", p.bottom = "0", p.right = "0", p.maxWidth = "100vw", p.maxHeight = "100vh"), en.value ? window.innerWidth <= 768 ? {
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
    }), po = qe(() => en.value && b.value.length === 0);
    return (p, g) => D.value && $.value ? (R(), I("div", op, g[18] || (g[18] = [
      Un('<div class="widget-unavailable-card" data-v-20211073><div class="widget-unavailable-icon-wrapper" data-v-20211073><svg class="widget-unavailable-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-v-20211073><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" data-v-20211073></path><path d="M9 12l2 2 4-4" data-v-20211073></path></svg></div><h2 class="widget-unavailable-title" data-v-20211073>Chat Unavailable</h2><p class="widget-unavailable-message" data-v-20211073> This chat widget is not currently configured. Please contact the website administrator to enable chat support. </p><div class="widget-unavailable-footer" data-v-20211073><svg class="chattermate-logo-small" width="14" height="14" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-20211073><rect x="3" y="3" width="54" height="54" rx="16" fill="#C9F24E" data-v-20211073></rect><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-20211073></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-20211073></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-20211073></circle></svg><span data-v-20211073>Powered by ChatterMate</span></div></div>', 1)
    ]))) : D.value ? (R(), I("div", ap, [
      w("div", lp, [
        g[19] || (g[19] = Un('<div class="auth-error-header" data-v-20211073><svg class="auth-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-20211073><circle cx="12" cy="12" r="10" data-v-20211073></circle><line x1="12" y1="8" x2="12" y2="12" data-v-20211073></line><line x1="12" y1="16" x2="12.01" y2="16" data-v-20211073></line></svg><h2 data-v-20211073>Authentication Error</h2></div>', 1)),
        w("p", cp, ce(A.value), 1),
        w("button", {
          class: "auth-error-refresh-btn",
          onClick: g[0] || (g[0] = () => p.window.location.reload())
        }, " Refresh Page ")
      ])
    ])) : i.value && !D.value ? (R(), I("div", {
      key: 2,
      class: Ze(["chat-container", [{ collapsed: !st.value, "ask-anything-style": en.value, aurora: Yn.value }, vc.value]]),
      style: Me({ ...C(ze), ...bc.value, "--cm-accent": C(o).accent_color || "#C9F24E" })
    }, [
      k.value ? (R(), I("div", up, g[20] || (g[20] = [
        Un('<div class="loading-spinner" data-v-20211073><div class="dot" data-v-20211073></div><div class="dot" data-v-20211073></div><div class="dot" data-v-20211073></div></div><div class="loading-text" data-v-20211073>Initializing chat...</div>', 2)
      ]))) : pe("", !0),
      !k.value && C(ne) !== "connected" ? (R(), I("div", {
        key: 1,
        class: Ze(["connection-status", C(ne)])
      }, [
        C(ne) === "connecting" ? (R(), I("div", fp, g[21] || (g[21] = [
          hn(" Connecting to chat service... ", -1),
          w("div", { class: "loading-dots" }, [
            w("div", { class: "dot" }),
            w("div", { class: "dot" }),
            w("div", { class: "dot" })
          ], -1)
        ]))) : C(ne) === "failed" ? (R(), I("div", hp, [
          g[22] || (g[22] = hn(" Connection failed. ", -1)),
          w("button", {
            onClick: js,
            class: "reconnect-button"
          }, " Click here to reconnect ")
        ])) : pe("", !0)
      ], 2)) : pe("", !0),
      C(B) ? (R(), I("div", {
        key: 2,
        class: "error-alert",
        style: Me(C(Y))
      }, ce(C(F)), 5)) : pe("", !0),
      po.value ? (R(), I("div", {
        key: 3,
        class: Ze(["welcome-message-section", { aurora: Yn.value }]),
        style: Me(C(U))
      }, [
        w("div", dp, [
          w("div", pp, [
            mc.value ? (R(), I("div", {
              key: 0,
              class: "welcome-orb",
              style: Me(_c.value)
            }, null, 4)) : C(Ge) ? (R(), I("img", {
              key: 1,
              src: C(Ge),
              alt: C(a),
              class: "welcome-avatar"
            }, null, 8, gp)) : pe("", !0),
            w("h1", mp, ce(C(o).welcome_title || `Welcome to ${C(a)}`), 1),
            w("p", _p, ce(C(o).welcome_subtitle || "I'm here to help you with anything you need. What can I assist you with today?"), 1)
          ])
        ]),
        w("div", yp, [
          !C(Ce) && !Oe.value && Br.value ? (R(), I("div", vp, [
            Mn(w("input", {
              "onUpdate:modelValue": g[1] || (g[1] = (f) => se.value = f),
              type: "email",
              placeholder: "Enter your email address",
              disabled: C(v) || C(ne) !== "connected",
              class: Ze([{
                invalid: se.value.trim() && !C(ps)(se.value.trim()),
                disabled: C(ne) !== "connected"
              }, "welcome-email-input"])
            }, null, 10, bp), [
              [zn, se.value]
            ])
          ])) : pe("", !0),
          w("div", wp, [
            Mn(w("input", {
              "onUpdate:modelValue": g[2] || (g[2] = (f) => Pe.value = f),
              type: "text",
              placeholder: cs.value,
              onKeypress: qs,
              onInput: Ne,
              onChange: Ne,
              disabled: !Qt.value,
              class: Ze([{ disabled: !Qt.value }, "welcome-message-field"])
            }, null, 42, kp), [
              [zn, Pe.value]
            ]),
            w("button", {
              class: Ze(["welcome-send-button", { "aurora-send": Yn.value }]),
              style: Me(C(re)),
              onClick: kn,
              disabled: !Pe.value.trim() || !Qt.value
            }, [
              Yn.value ? (R(), I("svg", Tp, g[23] || (g[23] = [
                w("path", {
                  d: "M12 19V5M12 5L5 12M12 5L19 12",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                }, null, -1)
              ]))) : (R(), I("svg", Sp, g[24] || (g[24] = [
                w("path", {
                  d: "M5 12L3 21L21 12L3 3L5 12ZM5 12L13 12",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                }, null, -1)
              ])))
            ], 14, xp)
          ])
        ]),
        w("div", {
          class: "powered-by-welcome",
          style: Me(C(_e))
        }, g[25] || (g[25] = [
          Un('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-20211073><rect x="3" y="3" width="54" height="54" rx="16" fill="#C9F24E" data-v-20211073></rect><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-20211073></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-20211073></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-20211073></circle></svg> Powered by ChatterMate ', 2)
        ]), 4)
      ], 6)) : pe("", !0),
      Z.value && y.value ? (R(), I("div", {
        key: 4,
        class: "landing-page-fullscreen",
        style: Me(C(U))
      }, [
        w("div", Ap, [
          w("div", Ep, [
            w("h2", Cp, ce(y.value.heading), 1),
            w("div", Rp, ce(y.value.content), 1)
          ]),
          w("div", Ip, [
            w("button", {
              class: "landing-page-button",
              onClick: hc
            }, ce(M.value), 1)
          ])
        ]),
        w("div", {
          class: "powered-by-landing",
          style: Me(C(_e))
        }, g[26] || (g[26] = [
          Un('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-20211073><rect x="3" y="3" width="54" height="54" rx="16" fill="#C9F24E" data-v-20211073></rect><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-20211073></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-20211073></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-20211073></circle></svg> Powered by ChatterMate ', 2)
        ]), 4)
      ], 4)) : K.value && ye.value ? (R(), I("div", {
        key: 5,
        class: "form-fullscreen",
        style: Me(C(U))
      }, [
        w("div", Lp, [
          ye.value.title || ye.value.description ? (R(), I("div", Op, [
            ye.value.title ? (R(), I("h2", Pp, ce(ye.value.title), 1)) : pe("", !0),
            ye.value.description ? (R(), I("p", Np, ce(ye.value.description), 1)) : pe("", !0)
          ])) : pe("", !0),
          w("div", Fp, [
            (R(!0), I(et, null, Bt(ye.value.fields, (f) => {
              var te, ve;
              return R(), I("div", {
                key: f.name,
                class: "form-field"
              }, [
                w("label", {
                  for: `fullscreen-form-${f.name}`,
                  class: "field-label"
                }, [
                  hn(ce(f.label) + " ", 1),
                  f.required ? (R(), I("span", Mp, "*")) : pe("", !0)
                ], 8, Dp),
                f.type === "text" || f.type === "email" || f.type === "tel" ? (R(), I("input", {
                  key: 0,
                  id: `fullscreen-form-${f.name}`,
                  type: f.type,
                  placeholder: f.placeholder || "",
                  required: f.required,
                  minlength: f.minLength,
                  maxlength: f.maxLength,
                  value: ct.value[f.name] || "",
                  onInput: (ue) => Ot(f.name, ue.target.value),
                  onBlur: (ue) => Ot(f.name, ue.target.value),
                  class: Ze(["form-input", { error: ut.value[f.name] }]),
                  autocomplete: f.type === "email" ? "email" : f.type === "tel" ? "tel" : "off",
                  inputmode: f.type === "tel" ? "tel" : f.type === "email" ? "email" : "text"
                }, null, 42, $p)) : f.type === "number" ? (R(), I("input", {
                  key: 1,
                  id: `fullscreen-form-${f.name}`,
                  type: "number",
                  placeholder: f.placeholder || "",
                  required: f.required,
                  min: f.minLength,
                  max: f.maxLength,
                  value: ct.value[f.name] || "",
                  onInput: (ue) => Ot(f.name, ue.target.value),
                  class: Ze(["form-input", { error: ut.value[f.name] }])
                }, null, 42, Bp)) : f.type === "textarea" ? (R(), I("textarea", {
                  key: 2,
                  id: `fullscreen-form-${f.name}`,
                  placeholder: f.placeholder || "",
                  required: f.required,
                  minlength: f.minLength,
                  maxlength: f.maxLength,
                  value: ct.value[f.name] || "",
                  onInput: (ue) => Ot(f.name, ue.target.value),
                  class: Ze(["form-textarea", { error: ut.value[f.name] }]),
                  rows: "4"
                }, null, 42, Up)) : f.type === "select" ? (R(), I("select", {
                  key: 3,
                  id: `fullscreen-form-${f.name}`,
                  required: f.required,
                  value: ct.value[f.name] || "",
                  onChange: (ue) => Ot(f.name, ue.target.value),
                  class: Ze(["form-select", { error: ut.value[f.name] }])
                }, [
                  w("option", Hp, ce(f.placeholder || "Please select..."), 1),
                  (R(!0), I(et, null, Bt((Array.isArray(f.options) ? f.options : ((te = f.options) == null ? void 0 : te.split(`
`)) || []).filter((ue) => ue.trim()), (ue) => (R(), I("option", {
                    key: ue,
                    value: ue.trim()
                  }, ce(ue.trim()), 9, Wp))), 128))
                ], 42, zp)) : f.type === "checkbox" ? (R(), I("label", qp, [
                  w("input", {
                    id: `fullscreen-form-${f.name}`,
                    type: "checkbox",
                    required: f.required,
                    checked: ct.value[f.name] || !1,
                    onChange: (ue) => Ot(f.name, ue.target.checked),
                    class: "form-checkbox"
                  }, null, 40, jp),
                  w("span", Vp, ce(f.label), 1)
                ])) : f.type === "radio" ? (R(), I("div", Kp, [
                  (R(!0), I(et, null, Bt((Array.isArray(f.options) ? f.options : ((ve = f.options) == null ? void 0 : ve.split(`
`)) || []).filter((ue) => ue.trim()), (ue) => (R(), I("label", {
                    key: ue,
                    class: "radio-field"
                  }, [
                    w("input", {
                      type: "radio",
                      name: `fullscreen-form-${f.name}`,
                      value: ue.trim(),
                      required: f.required,
                      checked: ct.value[f.name] === ue.trim(),
                      onChange: (We) => Ot(f.name, ue.trim()),
                      class: "form-radio"
                    }, null, 40, Gp),
                    w("span", Yp, ce(ue.trim()), 1)
                  ]))), 128))
                ])) : pe("", !0),
                ut.value[f.name] ? (R(), I("div", Xp, ce(ut.value[f.name]), 1)) : pe("", !0)
              ]);
            }), 128))
          ]),
          w("div", Zp, [
            w("button", {
              onClick: g[3] || (g[3] = () => {
                console.log("Submit button clicked!"), lc();
              }),
              disabled: ht.value,
              class: "submit-form-button",
              style: Me(C(re))
            }, [
              ht.value ? (R(), I("span", Qp, g[27] || (g[27] = [
                w("div", { class: "dot" }, null, -1),
                w("div", { class: "dot" }, null, -1),
                w("div", { class: "dot" }, null, -1)
              ]))) : (R(), I("span", eg, ce(ye.value.submit_button_text || "Submit"), 1))
            ], 12, Jp)
          ])
        ]),
        w("div", {
          class: "powered-by-landing",
          style: Me(C(_e))
        }, g[28] || (g[28] = [
          Un('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-20211073><rect x="3" y="3" width="54" height="54" rx="16" fill="#C9F24E" data-v-20211073></rect><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-20211073></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-20211073></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-20211073></circle></svg> Powered by ChatterMate ', 2)
        ]), 4)
      ], 4)) : po.value ? pe("", !0) : (R(), I(et, { key: 6 }, [
        st.value ? (R(), I("div", {
          key: 0,
          class: Ze(["chat-panel", { "ask-anything-chat": en.value }]),
          style: Me(C(U))
        }, [
          en.value ? (R(), I("div", {
            key: 1,
            class: "ask-anything-top",
            style: Me(C(xe))
          }, [
            w("div", ig, [
              rt.value || C(Ge) ? (R(), I("img", {
                key: 0,
                src: rt.value || C(Ge),
                alt: C(j).human_agent_name || C(a),
                class: "header-avatar"
              }, null, 8, og)) : pe("", !0),
              w("div", ag, [
                w("h3", {
                  style: Me(C(_e))
                }, ce(C(a)), 5),
                w("p", {
                  class: "ask-anything-subtitle",
                  style: Me(C(_e))
                }, ce(C(o).welcome_subtitle || "Ask me anything. I'm here to help."), 5)
              ])
            ])
          ], 4)) : (R(), I("div", {
            key: 0,
            class: "chat-header",
            style: Me(C(xe))
          }, [
            w("div", tg, [
              rt.value || C(Ge) ? (R(), I("img", {
                key: 0,
                src: rt.value || C(Ge),
                alt: C(j).human_agent_name || C(a),
                class: "header-avatar"
              }, null, 8, ng)) : pe("", !0),
              w("div", sg, [
                w("h3", {
                  style: Me(C(_e))
                }, ce(C(j).human_agent_name || C(a)), 5),
                w("div", rg, [
                  g[29] || (g[29] = w("span", { class: "status-indicator online" }, null, -1)),
                  w("span", {
                    class: "status-text",
                    style: Me(C(_e))
                  }, "Online", 4)
                ])
              ])
            ])
          ], 4)),
          C(G) ? (R(), I("div", lg, g[30] || (g[30] = [
            w("div", { class: "loading-spinner" }, [
              w("div", { class: "dot" }),
              w("div", { class: "dot" }),
              w("div", { class: "dot" })
            ], -1)
          ]))) : pe("", !0),
          w("div", {
            class: "chat-messages",
            ref_key: "messagesContainer",
            ref: X
          }, [
            (R(!0), I(et, null, Bt(C(b), (f, te) => {
              var ve, ue, We, we, Gt, fs, Xn, mo, _o, yo, vo, bo, wo, ko, xo, To, So, Ao, Eo;
              return R(), I("div", {
                key: te,
                class: Ze([
                  "message",
                  f.message_type === "bot" || f.message_type === "agent" ? "agent-message" : f.message_type === "system" ? "system-message" : f.message_type === "rating" ? "rating-message" : f.message_type === "form" ? "form-message" : f.message_type === "product" || f.shopify_output ? "product-message" : "user-message"
                ])
              }, [
                w("div", {
                  class: "message-bubble",
                  style: Me(f.message_type === "system" || f.message_type === "rating" || f.message_type === "product" || f.shopify_output ? {} : f.message_type === "user" ? C(re) : C(Q))
                }, [
                  f.message_type === "rating" ? (R(), I("div", cg, [
                    w("p", ug, "Rate the chat session that you had with " + ce(f.agent_name || C(j).human_agent_name || C(a) || "our agent"), 1),
                    w("div", {
                      class: Ze(["star-rating", { submitted: $t.value || f.isSubmitted }])
                    }, [
                      (R(), I(et, null, Bt(5, (E) => w("button", {
                        key: E,
                        class: Ze(["star-button", {
                          warning: E <= (f.isSubmitted ? f.finalRating : Mt.value || f.selectedRating) && (f.isSubmitted ? f.finalRating : Mt.value || f.selectedRating) <= 3,
                          success: E <= (f.isSubmitted ? f.finalRating : Mt.value || f.selectedRating) && (f.isSubmitted ? f.finalRating : Mt.value || f.selectedRating) > 3,
                          selected: E <= (f.isSubmitted ? f.finalRating : Mt.value || f.selectedRating)
                        }]),
                        onMouseover: (Yt) => !f.isSubmitted && Kt(E),
                        onMouseleave: (Yt) => !f.isSubmitted && Dn,
                        onClick: (Yt) => !f.isSubmitted && us(E),
                        disabled: $t.value || f.isSubmitted
                      }, " ★ ", 42, fg)), 64))
                    ], 2),
                    f.showFeedback && !f.isSubmitted ? (R(), I("div", hg, [
                      w("div", dg, [
                        Mn(w("input", {
                          "onUpdate:modelValue": (E) => f.feedback = E,
                          placeholder: "Please share your feedback (optional)",
                          disabled: $t.value,
                          maxlength: "500",
                          class: "feedback-input"
                        }, null, 8, pg), [
                          [zn, f.feedback]
                        ]),
                        w("div", gg, ce(((ve = f.feedback) == null ? void 0 : ve.length) || 0) + "/500", 1)
                      ]),
                      w("button", {
                        onClick: (E) => _t(f.session_id, Mt.value, f.feedback),
                        disabled: $t.value || !Mt.value,
                        class: "submit-rating-button",
                        style: Me({ backgroundColor: C(o).accent_color || "var(--accent-solid)" })
                      }, ce($t.value ? "Submitting..." : "Submit Rating"), 13, mg)
                    ])) : pe("", !0),
                    f.isSubmitted && f.finalFeedback ? (R(), I("div", _g, [
                      w("div", yg, [
                        w("p", vg, ce(f.finalFeedback), 1)
                      ])
                    ])) : f.isSubmitted ? (R(), I("div", bg, " Thank you for your rating! ")) : pe("", !0)
                  ])) : f.message_type === "form" ? (R(), I("div", wg, [
                    (We = (ue = f.attributes) == null ? void 0 : ue.form_data) != null && We.title || (Gt = (we = f.attributes) == null ? void 0 : we.form_data) != null && Gt.description ? (R(), I("div", kg, [
                      (Xn = (fs = f.attributes) == null ? void 0 : fs.form_data) != null && Xn.title ? (R(), I("h3", xg, ce(f.attributes.form_data.title), 1)) : pe("", !0),
                      (_o = (mo = f.attributes) == null ? void 0 : mo.form_data) != null && _o.description ? (R(), I("p", Tg, ce(f.attributes.form_data.description), 1)) : pe("", !0)
                    ])) : pe("", !0),
                    w("div", Sg, [
                      (R(!0), I(et, null, Bt((vo = (yo = f.attributes) == null ? void 0 : yo.form_data) == null ? void 0 : vo.fields, (E) => {
                        var Yt, Ur;
                        return R(), I("div", {
                          key: E.name,
                          class: "form-field"
                        }, [
                          w("label", {
                            for: `form-${E.name}`,
                            class: "field-label"
                          }, [
                            hn(ce(E.label) + " ", 1),
                            E.required ? (R(), I("span", Eg, "*")) : pe("", !0)
                          ], 8, Ag),
                          E.type === "text" || E.type === "email" || E.type === "tel" ? (R(), I("input", {
                            key: 0,
                            id: `form-${E.name}`,
                            type: E.type,
                            placeholder: E.placeholder || "",
                            required: E.required,
                            minlength: E.minLength,
                            maxlength: E.maxLength,
                            value: ct.value[E.name] || "",
                            onInput: (De) => Ot(E.name, De.target.value),
                            onBlur: (De) => Ot(E.name, De.target.value),
                            class: Ze(["form-input", { error: ut.value[E.name] }]),
                            disabled: ht.value,
                            autocomplete: E.type === "email" ? "email" : E.type === "tel" ? "tel" : "off",
                            inputmode: E.type === "tel" ? "tel" : E.type === "email" ? "email" : "text"
                          }, null, 42, Cg)) : E.type === "number" ? (R(), I("input", {
                            key: 1,
                            id: `form-${E.name}`,
                            type: "number",
                            placeholder: E.placeholder || "",
                            required: E.required,
                            min: E.min,
                            max: E.max,
                            value: ct.value[E.name] || "",
                            onInput: (De) => Ot(E.name, De.target.value),
                            class: Ze(["form-input", { error: ut.value[E.name] }]),
                            disabled: ht.value
                          }, null, 42, Rg)) : E.type === "textarea" ? (R(), I("textarea", {
                            key: 2,
                            id: `form-${E.name}`,
                            placeholder: E.placeholder || "",
                            required: E.required,
                            minlength: E.minLength,
                            maxlength: E.maxLength,
                            value: ct.value[E.name] || "",
                            onInput: (De) => Ot(E.name, De.target.value),
                            class: Ze(["form-textarea", { error: ut.value[E.name] }]),
                            disabled: ht.value,
                            rows: "3"
                          }, null, 42, Ig)) : E.type === "select" ? (R(), I("select", {
                            key: 3,
                            id: `form-${E.name}`,
                            required: E.required,
                            value: ct.value[E.name] || "",
                            onChange: (De) => Ot(E.name, De.target.value),
                            class: Ze(["form-select", { error: ut.value[E.name] }]),
                            disabled: ht.value
                          }, [
                            w("option", Og, ce(E.placeholder || "Select an option"), 1),
                            (R(!0), I(et, null, Bt((Array.isArray(E.options) ? E.options : ((Yt = E.options) == null ? void 0 : Yt.split(`
`)) || []).filter((De) => De.trim()), (De) => (R(), I("option", {
                              key: De.trim(),
                              value: De.trim()
                            }, ce(De.trim()), 9, Pg))), 128))
                          ], 42, Lg)) : E.type === "checkbox" ? (R(), I("div", Ng, [
                            w("input", {
                              id: `form-${E.name}`,
                              type: "checkbox",
                              checked: ct.value[E.name] || !1,
                              onChange: (De) => Ot(E.name, De.target.checked),
                              class: "form-checkbox",
                              disabled: ht.value
                            }, null, 40, Fg),
                            w("label", {
                              for: `form-${E.name}`,
                              class: "checkbox-label"
                            }, ce(E.placeholder || E.label), 9, Dg)
                          ])) : E.type === "radio" ? (R(), I("div", Mg, [
                            (R(!0), I(et, null, Bt((Array.isArray(E.options) ? E.options : ((Ur = E.options) == null ? void 0 : Ur.split(`
`)) || []).filter((De) => De.trim()), (De) => (R(), I("div", {
                              key: De.trim(),
                              class: "radio-option"
                            }, [
                              w("input", {
                                id: `form-${E.name}-${De.trim()}`,
                                name: `form-${E.name}`,
                                type: "radio",
                                value: De.trim(),
                                checked: ct.value[E.name] === De.trim(),
                                onChange: (s_) => Ot(E.name, De.trim()),
                                class: "form-radio",
                                disabled: ht.value
                              }, null, 40, $g),
                              w("label", {
                                for: `form-${E.name}-${De.trim()}`,
                                class: "radio-label"
                              }, ce(De.trim()), 9, Bg)
                            ]))), 128))
                          ])) : pe("", !0),
                          ut.value[E.name] ? (R(), I("div", Ug, ce(ut.value[E.name]), 1)) : pe("", !0)
                        ]);
                      }), 128))
                    ]),
                    w("div", zg, [
                      w("button", {
                        onClick: () => {
                          var E;
                          console.log("Regular form submit button clicked!"), Ks((E = f.attributes) == null ? void 0 : E.form_data);
                        },
                        disabled: ht.value,
                        class: "form-submit-button",
                        style: Me(C(re))
                      }, ce(ht.value ? "Submitting..." : ((wo = (bo = f.attributes) == null ? void 0 : bo.form_data) == null ? void 0 : wo.submit_button_text) || "Submit"), 13, Hg)
                    ])
                  ])) : f.message_type === "user_input" ? (R(), I("div", Wg, [
                    (ko = f.attributes) != null && ko.prompt_message && f.attributes.prompt_message.trim() ? (R(), I("div", qg, ce(f.attributes.prompt_message), 1)) : pe("", !0),
                    f.isSubmitted ? (R(), I("div", Gg, [
                      g[31] || (g[31] = w("strong", null, "Your input:", -1)),
                      hn(" " + ce(f.submittedValue) + " ", 1),
                      (xo = f.attributes) != null && xo.confirmation_message && f.attributes.confirmation_message.trim() ? (R(), I("div", Yg, ce(f.attributes.confirmation_message), 1)) : pe("", !0)
                    ])) : (R(), I("div", jg, [
                      Mn(w("textarea", {
                        "onUpdate:modelValue": (E) => f.userInputValue = E,
                        class: "user-input-textarea",
                        placeholder: "Type your message here...",
                        rows: "3",
                        onKeydown: [
                          na(Jn((E) => Mr(f), ["ctrl"]), ["enter"]),
                          na(Jn((E) => Mr(f), ["meta"]), ["enter"])
                        ]
                      }, null, 40, Vg), [
                        [zn, f.userInputValue]
                      ]),
                      w("button", {
                        class: "user-input-submit-button",
                        onClick: (E) => Mr(f),
                        disabled: !f.userInputValue || !f.userInputValue.trim()
                      }, " Submit ", 8, Kg)
                    ]))
                  ])) : f.shopify_output || f.message_type === "product" ? (R(), I("div", Xg, [
                    f.message ? (R(), I("div", {
                      key: 0,
                      innerHTML: s(((So = (To = f.shopify_output) == null ? void 0 : To.products) == null ? void 0 : So.length) > 0 ? uc(f.message) : f.message),
                      class: "product-message-text"
                    }, null, 8, Zg)) : pe("", !0),
                    (Ao = f.shopify_output) != null && Ao.products && f.shopify_output.products.length > 0 ? (R(), I("div", Jg, [
                      g[33] || (g[33] = w("h3", { class: "carousel-title" }, "Products", -1)),
                      w("div", Qg, [
                        (R(!0), I(et, null, Bt(f.shopify_output.products, (E) => {
                          var Yt;
                          return R(), I("div", {
                            key: E.id,
                            class: "product-card-compact carousel-item"
                          }, [
                            (Yt = E.image) != null && Yt.src ? (R(), I("div", em, [
                              w("img", {
                                src: E.image.src,
                                alt: E.title,
                                class: "product-thumbnail"
                              }, null, 8, tm)
                            ])) : pe("", !0),
                            w("div", nm, [
                              w("div", sm, [
                                w("div", rm, ce(E.title), 1),
                                E.variant_title && E.variant_title !== "Default Title" ? (R(), I("div", im, ce(E.variant_title), 1)) : pe("", !0),
                                w("div", om, ce(E.price_formatted || C(u)(E.price, E.currency)), 1)
                              ]),
                              w("div", am, [
                                w("button", {
                                  class: "view-details-button-compact",
                                  onClick: (Ur) => {
                                    var De;
                                    return cc(E, (De = f.shopify_output) == null ? void 0 : De.shop_domain);
                                  }
                                }, g[32] || (g[32] = [
                                  hn(" View product ", -1),
                                  w("span", { class: "external-link-icon" }, "↗", -1)
                                ]), 8, lm)
                              ])
                            ])
                          ]);
                        }), 128))
                      ])
                    ])) : !f.message && ((Eo = f.shopify_output) != null && Eo.products) && f.shopify_output.products.length === 0 ? (R(), I("div", cm, g[34] || (g[34] = [
                      w("p", null, "No products found.", -1)
                    ]))) : !f.message && f.shopify_output && !f.shopify_output.products ? (R(), I("div", um, g[35] || (g[35] = [
                      w("p", null, "No products to display.", -1)
                    ]))) : pe("", !0)
                  ])) : (R(), I(et, { key: 4 }, [
                    w("div", {
                      innerHTML: s(f.message)
                    }, null, 8, fm),
                    f.attachments && f.attachments.length > 0 ? (R(), I("div", hm, [
                      (R(!0), I(et, null, Bt(f.attachments, (E) => (R(), I("div", {
                        key: E.id,
                        class: "attachment-item"
                      }, [
                        C(P)(E.content_type) ? (R(), I("div", dm, [
                          w("img", {
                            src: C(V)(E.file_url),
                            alt: E.filename,
                            class: "attachment-image",
                            onClick: Jn((Yt) => C(He)({ url: E.file_url, filename: E.filename, type: E.content_type, file_url: C(V)(E.file_url), size: void 0 }), ["stop"]),
                            style: { cursor: "pointer" }
                          }, null, 8, pm),
                          w("div", gm, [
                            w("a", {
                              href: C(V)(E.file_url),
                              target: "_blank",
                              class: "attachment-link"
                            }, [
                              g[36] || (g[36] = w("svg", {
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
                              hn(" " + ce(E.filename) + " ", 1),
                              w("span", _m, "(" + ce(C(x)(E.file_size)) + ")", 1)
                            ], 8, mm)
                          ])
                        ])) : (R(), I("a", {
                          key: 1,
                          href: C(V)(E.file_url),
                          target: "_blank",
                          class: "attachment-link"
                        }, [
                          g[37] || (g[37] = w("svg", {
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
                          hn(" " + ce(E.filename) + " ", 1),
                          w("span", vm, "(" + ce(C(x)(E.file_size)) + ")", 1)
                        ], 8, ym))
                      ]))), 128))
                    ])) : pe("", !0)
                  ], 64))
                ], 4),
                $r.value && (f.message_type === "bot" || f.message_type === "agent") && f.sources && f.sources.length ? (R(), I("div", bm, [
                  g[38] || (g[38] = w("span", { class: "citation-label" }, "Sources", -1)),
                  (R(!0), I(et, null, Bt(f.sources, (E, Yt) => (R(), I("span", {
                    key: Yt,
                    class: "citation-chip",
                    title: E.type
                  }, ce(E.name), 9, wm))), 128))
                ])) : pe("", !0),
                w("div", km, [
                  f.message_type === "user" ? (R(), I("span", xm, " You ")) : pe("", !0)
                ])
              ], 2);
            }), 128)),
            C(v) ? (R(), I("div", {
              key: 0,
              class: Ze(["typing-indicator", { "reading-indicator": $r.value }])
            }, [
              $r.value ? (R(), I(et, { key: 0 }, [
                g[39] || (g[39] = w("div", {
                  class: "reading-bars",
                  "aria-hidden": "true"
                }, [
                  w("span"),
                  w("span"),
                  w("span")
                ], -1)),
                g[40] || (g[40] = w("span", { class: "reading-label" }, "reading knowledge base", -1))
              ], 64)) : (R(), I(et, { key: 1 }, [
                g[41] || (g[41] = w("div", { class: "dot" }, null, -1)),
                g[42] || (g[42] = w("div", { class: "dot" }, null, -1)),
                g[43] || (g[43] = w("div", { class: "dot" }, null, -1))
              ], 64))
            ], 2)) : pe("", !0)
          ], 512),
          mt.value ? (R(), I("div", {
            key: 4,
            class: "new-conversation-section",
            style: Me(C(Q))
          }, [
            w("div", Bm, [
              g[48] || (g[48] = w("p", { class: "ended-text" }, "This chat has ended.", -1)),
              w("button", {
                class: "start-new-conversation-button",
                style: Me(C(re)),
                onClick: gc
              }, " Click here to start a new conversation ", 4)
            ])
          ], 4)) : (R(), I("div", {
            key: 3,
            class: Ze(["chat-input", { "ask-anything-input": en.value }]),
            style: Me(C(Q))
          }, [
            !C(Ce) && !Oe.value && Br.value ? (R(), I("div", Tm, [
              Mn(w("input", {
                "onUpdate:modelValue": g[4] || (g[4] = (f) => se.value = f),
                type: "email",
                placeholder: "Enter your email address to begin",
                disabled: C(v) || C(ne) !== "connected",
                class: Ze({
                  invalid: se.value.trim() && !C(ps)(se.value.trim()),
                  disabled: C(ne) !== "connected"
                })
              }, null, 10, Sm), [
                [zn, se.value]
              ])
            ])) : pe("", !0),
            w("input", {
              ref_key: "fileInputRef",
              ref: gt,
              type: "file",
              accept: Xm,
              multiple: "",
              style: { display: "none" },
              onChange: g[5] || (g[5] = //@ts-ignore
              (...f) => C(be) && C(be)(...f))
            }, null, 544),
            C(c).length > 0 ? (R(), I("div", Am, [
              (R(!0), I(et, null, Bt(C(c), (f, te) => (R(), I("div", {
                key: te,
                class: "file-preview-widget"
              }, [
                w("div", Em, [
                  C(ls)(f.type) ? (R(), I("img", {
                    key: 0,
                    src: C(ee)(f),
                    alt: f.filename,
                    class: "file-preview-image-widget",
                    onClick: Jn((ve) => C(He)(f), ["stop"]),
                    style: { cursor: "pointer" }
                  }, null, 8, Cm)) : (R(), I("div", {
                    key: 1,
                    class: "file-preview-icon-widget",
                    onClick: Jn((ve) => C(He)(f), ["stop"]),
                    style: { cursor: "pointer" }
                  }, g[44] || (g[44] = [
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
                  ]), 8, Rm))
                ]),
                w("div", Im, [
                  w("div", Lm, ce(f.filename), 1),
                  w("div", Om, ce(C(x)(f.size)), 1)
                ]),
                w("button", {
                  type: "button",
                  class: "file-preview-remove-widget",
                  onClick: (ve) => C(xt)(te),
                  title: "Remove file"
                }, " × ", 8, Pm)
              ]))), 128))
            ])) : pe("", !0),
            uo.value ? (R(), I("div", Nm, g[45] || (g[45] = [
              w("div", { class: "upload-spinner-widget" }, null, -1),
              w("span", { class: "upload-text-widget" }, "Uploading files...", -1)
            ]))) : pe("", !0),
            w("div", Fm, [
              Mn(w("input", {
                "onUpdate:modelValue": g[6] || (g[6] = (f) => Pe.value = f),
                type: "text",
                placeholder: cs.value,
                onKeypress: qs,
                onInput: Ne,
                onChange: Ne,
                onPaste: g[7] || (g[7] = //@ts-ignore
                (...f) => C(ft) && C(ft)(...f)),
                onDrop: g[8] || (g[8] = //@ts-ignore
                (...f) => C(Se) && C(Se)(...f)),
                onDragover: g[9] || (g[9] = //@ts-ignore
                (...f) => C(Ye) && C(Ye)(...f)),
                onDragleave: g[10] || (g[10] = //@ts-ignore
                (...f) => C(Fe) && C(Fe)(...f)),
                disabled: !Qt.value,
                class: Ze({ disabled: !Qt.value, "ask-anything-field": en.value })
              }, null, 42, Dm), [
                [zn, Pe.value]
              ]),
              fc.value ? (R(), I("button", {
                key: 0,
                type: "button",
                class: "attach-button",
                disabled: uo.value,
                onClick: g[11] || (g[11] = //@ts-ignore
                (...f) => C(Ws) && C(Ws)(...f)),
                title: `Attach files (${C(c).length}/${Sa} used) or paste screenshots`
              }, g[46] || (g[46] = [
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
              ]), 8, Mm)) : pe("", !0),
              w("button", {
                class: Ze(["send-button", { "ask-anything-send": en.value }]),
                style: Me(C(re)),
                onClick: kn,
                disabled: !Pe.value.trim() && C(c).length === 0 || !Qt.value
              }, g[47] || (g[47] = [
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
              ]), 14, $m)
            ])
          ], 6)),
          w("div", {
            class: "powered-by",
            style: Me(C(_e))
          }, g[49] || (g[49] = [
            Un('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-20211073><rect x="3" y="3" width="54" height="54" rx="16" fill="#C9F24E" data-v-20211073></rect><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-20211073></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-20211073></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-20211073></circle></svg> Powered by ChatterMate ', 2)
          ]), 4)
        ], 6)) : pe("", !0)
      ], 64)),
      Gn.value ? (R(), I("div", Um, [
        w("div", zm, [
          g[50] || (g[50] = w("h3", null, "Rate your conversation", -1)),
          w("div", Hm, [
            (R(), I(et, null, Bt(5, (f) => w("button", {
              key: f,
              onClick: (te) => Fn.value = f,
              class: Ze([{ active: f <= Fn.value }, "star-button"])
            }, " ★ ", 10, Wm)), 64))
          ]),
          Mn(w("textarea", {
            "onUpdate:modelValue": g[12] || (g[12] = (f) => Dt.value = f),
            placeholder: "Additional feedback (optional)",
            class: "rating-feedback"
          }, null, 512), [
            [zn, Dt.value]
          ]),
          w("div", qm, [
            w("button", {
              onClick: g[13] || (g[13] = (f) => p.submitRating(Fn.value, Dt.value)),
              disabled: !Fn.value,
              class: "submit-button",
              style: Me(C(re))
            }, " Submit ", 12, jm),
            w("button", {
              onClick: g[14] || (g[14] = (f) => Gn.value = !1),
              class: "skip-rating"
            }, " Skip ")
          ])
        ])
      ])) : pe("", !0),
      C(_) ? (R(), I("div", {
        key: 8,
        class: "preview-modal-overlay",
        onClick: g[17] || (g[17] = //@ts-ignore
        (...f) => C(Ft) && C(Ft)(...f))
      }, [
        w("div", {
          class: "preview-modal-content",
          onClick: g[16] || (g[16] = Jn(() => {
          }, ["stop"]))
        }, [
          w("button", {
            class: "preview-modal-close",
            onClick: g[15] || (g[15] = //@ts-ignore
            (...f) => C(Ft) && C(Ft)(...f))
          }, "×"),
          C(T) && C(ls)(C(T).type) ? (R(), I("div", Vm, [
            w("img", {
              src: C(ee)(C(T)),
              alt: C(T).filename,
              class: "preview-modal-image"
            }, null, 8, Km),
            w("div", Gm, ce(C(T).filename), 1)
          ])) : pe("", !0)
        ])
      ])) : pe("", !0)
    ], 6)) : (R(), I("div", Ym));
  }
}), Jm = (t, e) => {
  const n = t.__vccOpts || t;
  for (const [s, r] of e)
    n[s] = r;
  return n;
}, Qm = /* @__PURE__ */ Jm(Zm, [["__scopeId", "data-v-20211073"]]);
window.process || (window.process = { env: { NODE_ENV: "production" } });
const Wt = window.__INITIAL_DATA__, rc = new URL(window.location.href), ic = rc.searchParams.get("preview") === "true", oc = (t) => {
  const e = rc.searchParams.get(t);
  if (!(!e || e === "undefined" || e.trim() === ""))
    return e;
}, e_ = ic ? oc("widget_id") || (Wt == null ? void 0 : Wt.widgetId) || void 0 : (Wt == null ? void 0 : Wt.widgetId) || void 0, t_ = ic ? (Wt == null ? void 0 : Wt.initialToken) || oc("token") || void 0 : (Wt == null ? void 0 : Wt.initialToken) || void 0, n_ = qf(Qm, {
  widgetId: e_,
  token: t_ || void 0,
  initialAuthError: null
  // Let backend determine if auth is required
});
n_.mount("#app");
