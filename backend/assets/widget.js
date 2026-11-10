var ch = Object.defineProperty;
var uh = (e, t, n) => t in e ? ch(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var tt = (e, t, n) => uh(e, typeof t != "symbol" ? t + "" : t, n);
/**
* @vue/shared v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function Aa(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const n of e.split(",")) t[n] = 1;
  return (n) => n in t;
}
const nt = {}, Js = [], Sn = () => {
}, fh = () => !1, Ji = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), Sa = (e) => e.startsWith("onUpdate:"), Ot = Object.assign, Ea = (e, t) => {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}, hh = Object.prototype.hasOwnProperty, qe = (e, t) => hh.call(e, t), Ae = Array.isArray, Qs = (e) => Qi(e) === "[object Map]", Vc = (e) => Qi(e) === "[object Set]", Ce = (e) => typeof e == "function", gt = (e) => typeof e == "string", ps = (e) => typeof e == "symbol", ct = (e) => e !== null && typeof e == "object", Kc = (e) => (ct(e) || Ce(e)) && Ce(e.then) && Ce(e.catch), Gc = Object.prototype.toString, Qi = (e) => Gc.call(e), dh = (e) => Qi(e).slice(8, -1), Yc = (e) => Qi(e) === "[object Object]", xa = (e) => gt(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, Lr = /* @__PURE__ */ Aa(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), eo = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (n) => t[n] || (t[n] = e(n));
}, ph = /-(\w)/g, fs = eo(
  (e) => e.replace(ph, (t, n) => n ? n.toUpperCase() : "")
), mh = /\B([A-Z])/g, ms = eo(
  (e) => e.replace(mh, "-$1").toLowerCase()
), Xc = eo((e) => e.charAt(0).toUpperCase() + e.slice(1)), xo = eo(
  (e) => e ? `on${Xc(e)}` : ""
), ls = (e, t) => !Object.is(e, t), ki = (e, ...t) => {
  for (let n = 0; n < e.length; n++)
    e[n](...t);
}, Qo = (e, t, n, s = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: s,
    value: n
  });
}, ea = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let Il;
const to = () => Il || (Il = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function xe(e) {
  if (Ae(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
      const s = e[n], r = gt(s) ? vh(s) : xe(s);
      if (r)
        for (const i in r)
          t[i] = r[i];
    }
    return t;
  } else if (gt(e) || ct(e))
    return e;
}
const gh = /;(?![^(]*\))/g, _h = /:([^]+)/, yh = /\/\*[^]*?\*\//g;
function vh(e) {
  const t = {};
  return e.replace(yh, "").split(gh).forEach((n) => {
    if (n) {
      const s = n.split(_h);
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
const bh = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", wh = /* @__PURE__ */ Aa(bh);
function Zc(e) {
  return !!e || e === "";
}
const Jc = (e) => !!(e && e.__v_isRef === !0), Z = (e) => gt(e) ? e : e == null ? "" : Ae(e) || ct(e) && (e.toString === Gc || !Ce(e.toString)) ? Jc(e) ? Z(e.value) : JSON.stringify(e, Qc, 2) : String(e), Qc = (e, t) => Jc(t) ? Qc(e, t.value) : Qs(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (n, [s, r], i) => (n[Co(s, i) + " =>"] = r, n),
    {}
  )
} : Vc(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((n) => Co(n))
} : ps(t) ? Co(t) : ct(t) && !Ae(t) && !Yc(t) ? String(t) : t, Co = (e, t = "") => {
  var n;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    ps(e) ? `Symbol(${(n = e.description) != null ? n : t})` : e
  );
};
/**
* @vue/reactivity v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let Ht;
class kh {
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
function Th() {
  return Ht;
}
let it;
const Ro = /* @__PURE__ */ new WeakSet();
class eu {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, Ht && Ht.active && Ht.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, Ro.has(this) && (Ro.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || nu(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, Ol(this), su(this);
    const t = it, n = gn;
    it = this, gn = !0;
    try {
      return this.fn();
    } finally {
      ru(this), it = t, gn = n, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        Ia(t);
      this.deps = this.depsTail = void 0, Ol(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? Ro.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    ta(this) && this.run();
  }
  get dirty() {
    return ta(this);
  }
}
let tu = 0, Nr, Pr;
function nu(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = Pr, Pr = e;
    return;
  }
  e.next = Nr, Nr = e;
}
function Ca() {
  tu++;
}
function Ra() {
  if (--tu > 0)
    return;
  if (Pr) {
    let t = Pr;
    for (Pr = void 0; t; ) {
      const n = t.next;
      t.next = void 0, t.flags &= -9, t = n;
    }
  }
  let e;
  for (; Nr; ) {
    let t = Nr;
    for (Nr = void 0; t; ) {
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
function su(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function ru(e) {
  let t, n = e.depsTail, s = n;
  for (; s; ) {
    const r = s.prevDep;
    s.version === -1 ? (s === n && (n = r), Ia(s), Ah(s)) : t = s, s.dep.activeLink = s.prevActiveLink, s.prevActiveLink = void 0, s = r;
  }
  e.deps = t, e.depsTail = n;
}
function ta(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (iu(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function iu(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === zr) || (e.globalVersion = zr, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !ta(e))))
    return;
  e.flags |= 2;
  const t = e.dep, n = it, s = gn;
  it = e, gn = !0;
  try {
    su(e);
    const r = e.fn(e._value);
    (t.version === 0 || ls(r, e._value)) && (e.flags |= 128, e._value = r, t.version++);
  } catch (r) {
    throw t.version++, r;
  } finally {
    it = n, gn = s, ru(e), e.flags &= -3;
  }
}
function Ia(e, t = !1) {
  const { dep: n, prevSub: s, nextSub: r } = e;
  if (s && (s.nextSub = r, e.prevSub = void 0), r && (r.prevSub = s, e.nextSub = void 0), n.subs === e && (n.subs = s, !s && n.computed)) {
    n.computed.flags &= -5;
    for (let i = n.computed.deps; i; i = i.nextDep)
      Ia(i, !0);
  }
  !t && !--n.sc && n.map && n.map.delete(n.key);
}
function Ah(e) {
  const { prevDep: t, nextDep: n } = e;
  t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
let gn = !0;
const ou = [];
function Un() {
  ou.push(gn), gn = !1;
}
function zn() {
  const e = ou.pop();
  gn = e === void 0 ? !0 : e;
}
function Ol(e) {
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
let zr = 0;
class Sh {
  constructor(t, n) {
    this.sub = t, this.dep = n, this.version = n.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Oa {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(t) {
    if (!it || !gn || it === this.computed)
      return;
    let n = this.activeLink;
    if (n === void 0 || n.sub !== it)
      n = this.activeLink = new Sh(it, this), it.deps ? (n.prevDep = it.depsTail, it.depsTail.nextDep = n, it.depsTail = n) : it.deps = it.depsTail = n, au(n);
    else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
      const s = n.nextDep;
      s.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = s), n.prevDep = it.depsTail, n.nextDep = void 0, it.depsTail.nextDep = n, it.depsTail = n, it.deps === n && (it.deps = s);
    }
    return n;
  }
  trigger(t) {
    this.version++, zr++, this.notify(t);
  }
  notify(t) {
    Ca();
    try {
      for (let n = this.subs; n; n = n.prevSub)
        n.sub.notify() && n.sub.dep.notify();
    } finally {
      Ra();
    }
  }
}
function au(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let s = t.deps; s; s = s.nextDep)
        au(s);
    }
    const n = e.dep.subs;
    n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
  }
}
const na = /* @__PURE__ */ new WeakMap(), Ps = Symbol(
  ""
), sa = Symbol(
  ""
), Hr = Symbol(
  ""
);
function Rt(e, t, n) {
  if (gn && it) {
    let s = na.get(e);
    s || na.set(e, s = /* @__PURE__ */ new Map());
    let r = s.get(n);
    r || (s.set(n, r = new Oa()), r.map = s, r.key = n), r.track();
  }
}
function Dn(e, t, n, s, r, i) {
  const o = na.get(e);
  if (!o) {
    zr++;
    return;
  }
  const a = (l) => {
    l && l.trigger();
  };
  if (Ca(), t === "clear")
    o.forEach(a);
  else {
    const l = Ae(e), u = l && xa(n);
    if (l && n === "length") {
      const c = Number(s);
      o.forEach((w, A) => {
        (A === "length" || A === Hr || !ps(A) && A >= c) && a(w);
      });
    } else
      switch ((n !== void 0 || o.has(void 0)) && a(o.get(n)), u && a(o.get(Hr)), t) {
        case "add":
          l ? u && a(o.get("length")) : (a(o.get(Ps)), Qs(e) && a(o.get(sa)));
          break;
        case "delete":
          l || (a(o.get(Ps)), Qs(e) && a(o.get(sa)));
          break;
        case "set":
          Qs(e) && a(o.get(Ps));
          break;
      }
  }
  Ra();
}
function Gs(e) {
  const t = Be(e);
  return t === e ? t : (Rt(t, "iterate", Hr), un(e) ? t : t.map(St));
}
function no(e) {
  return Rt(e = Be(e), "iterate", Hr), e;
}
const Eh = {
  __proto__: null,
  [Symbol.iterator]() {
    return Io(this, Symbol.iterator, St);
  },
  concat(...e) {
    return Gs(this).concat(
      ...e.map((t) => Ae(t) ? Gs(t) : t)
    );
  },
  entries() {
    return Io(this, "entries", (e) => (e[1] = St(e[1]), e));
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
    return Oo(this, "includes", e);
  },
  indexOf(...e) {
    return Oo(this, "indexOf", e);
  },
  join(e) {
    return Gs(this).join(e);
  },
  // keys() iterator only reads `length`, no optimisation required
  lastIndexOf(...e) {
    return Oo(this, "lastIndexOf", e);
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
    return Ll(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return Ll(this, "reduceRight", e, t);
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
    return Io(this, "values", St);
  }
};
function Io(e, t, n) {
  const s = no(e), r = s[t]();
  return s !== e && !un(e) && (r._next = r.next, r.next = () => {
    const i = r._next();
    return i.value && (i.value = n(i.value)), i;
  }), r;
}
const xh = Array.prototype;
function Ln(e, t, n, s, r, i) {
  const o = no(e), a = o !== e && !un(e), l = o[t];
  if (l !== xh[t]) {
    const w = l.apply(e, i);
    return a ? St(w) : w;
  }
  let u = n;
  o !== e && (a ? u = function(w, A) {
    return n.call(this, St(w), A, e);
  } : n.length > 2 && (u = function(w, A) {
    return n.call(this, w, A, e);
  }));
  const c = l.call(o, u, s);
  return a && r ? r(c) : c;
}
function Ll(e, t, n, s) {
  const r = no(e);
  let i = n;
  return r !== e && (un(e) ? n.length > 3 && (i = function(o, a, l) {
    return n.call(this, o, a, l, e);
  }) : i = function(o, a, l) {
    return n.call(this, o, St(a), l, e);
  }), r[t](i, ...s);
}
function Oo(e, t, n) {
  const s = Be(e);
  Rt(s, "iterate", Hr);
  const r = s[t](...n);
  return (r === -1 || r === !1) && Pa(n[0]) ? (n[0] = Be(n[0]), s[t](...n)) : r;
}
function _r(e, t, n = []) {
  Un(), Ca();
  const s = Be(e)[t].apply(e, n);
  return Ra(), zn(), s;
}
const Ch = /* @__PURE__ */ Aa("__proto__,__v_isRef,__isVue"), lu = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(ps)
);
function Rh(e) {
  ps(e) || (e = String(e));
  const t = Be(this);
  return Rt(t, "has", e), t.hasOwnProperty(e);
}
class cu {
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
      return s === (r ? i ? Bh : du : i ? hu : fu).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(s) ? t : void 0;
    const o = Ae(t);
    if (!r) {
      let l;
      if (o && (l = Eh[n]))
        return l;
      if (n === "hasOwnProperty")
        return Rh;
    }
    const a = Reflect.get(
      t,
      n,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      It(t) ? t : s
    );
    return (ps(n) ? lu.has(n) : Ch(n)) || (r || Rt(t, "get", n), i) ? a : It(a) ? o && xa(n) ? a : a.value : ct(a) ? r ? pu(a) : Vr(a) : a;
  }
}
class uu extends cu {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, n, s, r) {
    let i = t[n];
    if (!this._isShallow) {
      const l = hs(i);
      if (!un(s) && !hs(s) && (i = Be(i), s = Be(s)), !Ae(t) && It(i) && !It(s))
        return l ? !1 : (i.value = s, !0);
    }
    const o = Ae(t) && xa(n) ? Number(n) < t.length : qe(t, n), a = Reflect.set(
      t,
      n,
      s,
      It(t) ? t : r
    );
    return t === Be(r) && (o ? ls(s, i) && Dn(t, "set", n, s) : Dn(t, "add", n, s)), a;
  }
  deleteProperty(t, n) {
    const s = qe(t, n);
    t[n];
    const r = Reflect.deleteProperty(t, n);
    return r && s && Dn(t, "delete", n, void 0), r;
  }
  has(t, n) {
    const s = Reflect.has(t, n);
    return (!ps(n) || !lu.has(n)) && Rt(t, "has", n), s;
  }
  ownKeys(t) {
    return Rt(
      t,
      "iterate",
      Ae(t) ? "length" : Ps
    ), Reflect.ownKeys(t);
  }
}
class Ih extends cu {
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
const Oh = /* @__PURE__ */ new uu(), Lh = /* @__PURE__ */ new Ih(), Nh = /* @__PURE__ */ new uu(!0);
const ra = (e) => e, pi = (e) => Reflect.getPrototypeOf(e);
function Ph(e, t, n) {
  return function(...s) {
    const r = this.__v_raw, i = Be(r), o = Qs(i), a = e === "entries" || e === Symbol.iterator && o, l = e === "keys" && o, u = r[e](...s), c = n ? ra : t ? Fi : St;
    return !t && Rt(
      i,
      "iterate",
      l ? sa : Ps
    ), {
      // iterator protocol
      next() {
        const { value: w, done: A } = u.next();
        return A ? { value: w, done: A } : {
          value: a ? [c(w[0]), c(w[1])] : c(w),
          done: A
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function mi(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function Mh(e, t) {
  const n = {
    get(r) {
      const i = this.__v_raw, o = Be(i), a = Be(r);
      e || (ls(r, a) && Rt(o, "get", r), Rt(o, "get", a));
      const { has: l } = pi(o), u = t ? ra : e ? Fi : St;
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
      return e || (ls(r, a) && Rt(o, "has", r), Rt(o, "has", a)), r === a ? i.has(r) : i.has(r) || i.has(a);
    },
    forEach(r, i) {
      const o = this, a = o.__v_raw, l = Be(a), u = t ? ra : e ? Fi : St;
      return !e && Rt(l, "iterate", Ps), a.forEach((c, w) => r.call(i, u(c), u(w), o));
    }
  };
  return Ot(
    n,
    e ? {
      add: mi("add"),
      set: mi("set"),
      delete: mi("delete"),
      clear: mi("clear")
    } : {
      add(r) {
        !t && !un(r) && !hs(r) && (r = Be(r));
        const i = Be(this);
        return pi(i).has.call(i, r) || (i.add(r), Dn(i, "add", r, r)), this;
      },
      set(r, i) {
        !t && !un(i) && !hs(i) && (i = Be(i));
        const o = Be(this), { has: a, get: l } = pi(o);
        let u = a.call(o, r);
        u || (r = Be(r), u = a.call(o, r));
        const c = l.call(o, r);
        return o.set(r, i), u ? ls(i, c) && Dn(o, "set", r, i) : Dn(o, "add", r, i), this;
      },
      delete(r) {
        const i = Be(this), { has: o, get: a } = pi(i);
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
    n[r] = Ph(r, e, t);
  }), n;
}
function La(e, t) {
  const n = Mh(e, t);
  return (s, r, i) => r === "__v_isReactive" ? !e : r === "__v_isReadonly" ? e : r === "__v_raw" ? s : Reflect.get(
    qe(n, r) && r in s ? n : s,
    r,
    i
  );
}
const Dh = {
  get: /* @__PURE__ */ La(!1, !1)
}, Fh = {
  get: /* @__PURE__ */ La(!1, !0)
}, $h = {
  get: /* @__PURE__ */ La(!0, !1)
};
const fu = /* @__PURE__ */ new WeakMap(), hu = /* @__PURE__ */ new WeakMap(), du = /* @__PURE__ */ new WeakMap(), Bh = /* @__PURE__ */ new WeakMap();
function Uh(e) {
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
function zh(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : Uh(dh(e));
}
function Vr(e) {
  return hs(e) ? e : Na(
    e,
    !1,
    Oh,
    Dh,
    fu
  );
}
function Hh(e) {
  return Na(
    e,
    !1,
    Nh,
    Fh,
    hu
  );
}
function pu(e) {
  return Na(
    e,
    !0,
    Lh,
    $h,
    du
  );
}
function Na(e, t, n, s, r) {
  if (!ct(e) || e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const i = zh(e);
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
  return hs(e) ? er(e.__v_raw) : !!(e && e.__v_isReactive);
}
function hs(e) {
  return !!(e && e.__v_isReadonly);
}
function un(e) {
  return !!(e && e.__v_isShallow);
}
function Pa(e) {
  return e ? !!e.__v_raw : !1;
}
function Be(e) {
  const t = e && e.__v_raw;
  return t ? Be(t) : e;
}
function jh(e) {
  return !qe(e, "__v_skip") && Object.isExtensible(e) && Qo(e, "__v_skip", !0), e;
}
const St = (e) => ct(e) ? Vr(e) : e, Fi = (e) => ct(e) ? pu(e) : e;
function It(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function oe(e) {
  return mu(e, !1);
}
function Wh(e) {
  return mu(e, !0);
}
function mu(e, t) {
  return It(e) ? e : new qh(e, t);
}
class qh {
  constructor(t, n) {
    this.dep = new Oa(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? t : Be(t), this._value = n ? t : St(t), this.__v_isShallow = n;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const n = this._rawValue, s = this.__v_isShallow || un(t) || hs(t);
    t = s ? t : Be(t), ls(t, n) && (this._rawValue = t, this._value = s ? t : St(t), this.dep.trigger());
  }
}
function E(e) {
  return It(e) ? e.value : e;
}
const Vh = {
  get: (e, t, n) => t === "__v_raw" ? e : E(Reflect.get(e, t, n)),
  set: (e, t, n, s) => {
    const r = e[t];
    return It(r) && !It(n) ? (r.value = n, !0) : Reflect.set(e, t, n, s);
  }
};
function gu(e) {
  return er(e) ? e : new Proxy(e, Vh);
}
class Kh {
  constructor(t, n, s) {
    this.fn = t, this.setter = n, this._value = void 0, this.dep = new Oa(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = zr - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = s;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    it !== this)
      return nu(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return iu(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
function Gh(e, t, n = !1) {
  let s, r;
  return Ce(e) ? s = e : (s = e.get, r = e.set), new Kh(s, r, n);
}
const gi = {}, $i = /* @__PURE__ */ new WeakMap();
let Rs;
function Yh(e, t = !1, n = Rs) {
  if (n) {
    let s = $i.get(n);
    s || $i.set(n, s = []), s.push(e);
  }
}
function Xh(e, t, n = nt) {
  const { immediate: s, deep: r, once: i, scheduler: o, augmentJob: a, call: l } = n, u = (x) => r ? x : un(x) || r === !1 || r === 0 ? Fn(x, 1) : Fn(x);
  let c, w, A, I, O = !1, H = !1;
  if (It(e) ? (w = () => e.value, O = un(e)) : er(e) ? (w = () => u(e), O = !0) : Ae(e) ? (H = !0, O = e.some((x) => er(x) || un(x)), w = () => e.map((x) => {
    if (It(x))
      return x.value;
    if (er(x))
      return u(x);
    if (Ce(x))
      return l ? l(x, 2) : x();
  })) : Ce(e) ? t ? w = l ? () => l(e, 2) : e : w = () => {
    if (A) {
      Un();
      try {
        A();
      } finally {
        zn();
      }
    }
    const x = Rs;
    Rs = c;
    try {
      return l ? l(e, 3, [I]) : e(I);
    } finally {
      Rs = x;
    }
  } : w = Sn, t && r) {
    const x = w, M = r === !0 ? 1 / 0 : r;
    w = () => Fn(x(), M);
  }
  const ue = Th(), R = () => {
    c.stop(), ue && ue.active && Ea(ue.effects, c);
  };
  if (i && t) {
    const x = t;
    t = (...M) => {
      x(...M), R();
    };
  }
  let fe = H ? new Array(e.length).fill(gi) : gi;
  const _e = (x) => {
    if (!(!(c.flags & 1) || !c.dirty && !x))
      if (t) {
        const M = c.run();
        if (r || O || (H ? M.some((S, W) => ls(S, fe[W])) : ls(M, fe))) {
          A && A();
          const S = Rs;
          Rs = c;
          try {
            const W = [
              M,
              // pass undefined as the old value when it's changed for the first time
              fe === gi ? void 0 : H && fe[0] === gi ? [] : fe,
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
  return a && a(_e), c = new eu(w), c.scheduler = o ? () => o(_e, !1) : _e, I = (x) => Yh(x, !1, c), A = c.onStop = () => {
    const x = $i.get(c);
    if (x) {
      if (l)
        l(x, 4);
      else
        for (const M of x) M();
      $i.delete(c);
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
  else if (Vc(e) || Qs(e))
    e.forEach((s) => {
      Fn(s, t, n);
    });
  else if (Yc(e)) {
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
function Kr(e, t, n, s) {
  try {
    return s ? e(...s) : e();
  } catch (r) {
    so(r, t, n);
  }
}
function xn(e, t, n, s) {
  if (Ce(e)) {
    const r = Kr(e, t, n, s);
    return r && Kc(r) && r.catch((i) => {
      so(i, t, n);
    }), r;
  }
  if (Ae(e)) {
    const r = [];
    for (let i = 0; i < e.length; i++)
      r.push(xn(e[i], t, n, s));
    return r;
  }
}
function so(e, t, n, s = !0) {
  const r = t ? t.vnode : null, { errorHandler: i, throwUnhandledErrorInProduction: o } = t && t.appContext.config || nt;
  if (t) {
    let a = t.parent;
    const l = t.proxy, u = `https://vuejs.org/error-reference/#runtime-${n}`;
    for (; a; ) {
      const c = a.ec;
      if (c) {
        for (let w = 0; w < c.length; w++)
          if (c[w](e, l, u) === !1)
            return;
      }
      a = a.parent;
    }
    if (i) {
      Un(), Kr(i, null, 10, [
        e,
        l,
        u
      ]), zn();
      return;
    }
  }
  Zh(e, n, r, s, o);
}
function Zh(e, t, n, s = !0, r = !1) {
  if (r)
    throw e;
  console.error(e);
}
const Dt = [];
let Tn = -1;
const tr = [];
let is = null, Ys = 0;
const _u = /* @__PURE__ */ Promise.resolve();
let Bi = null;
function as(e) {
  const t = Bi || _u;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function Jh(e) {
  let t = Tn + 1, n = Dt.length;
  for (; t < n; ) {
    const s = t + n >>> 1, r = Dt[s], i = jr(r);
    i < e || i === e && r.flags & 2 ? t = s + 1 : n = s;
  }
  return t;
}
function Ma(e) {
  if (!(e.flags & 1)) {
    const t = jr(e), n = Dt[Dt.length - 1];
    !n || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= jr(n) ? Dt.push(e) : Dt.splice(Jh(t), 0, e), e.flags |= 1, yu();
  }
}
function yu() {
  Bi || (Bi = _u.then(bu));
}
function Qh(e) {
  Ae(e) ? tr.push(...e) : is && e.id === -1 ? is.splice(Ys + 1, 0, e) : e.flags & 1 || (tr.push(e), e.flags |= 1), yu();
}
function Nl(e, t, n = Tn + 1) {
  for (; n < Dt.length; n++) {
    const s = Dt[n];
    if (s && s.flags & 2) {
      if (e && s.id !== e.uid)
        continue;
      Dt.splice(n, 1), n--, s.flags & 4 && (s.flags &= -2), s(), s.flags & 4 || (s.flags &= -2);
    }
  }
}
function vu(e) {
  if (tr.length) {
    const t = [...new Set(tr)].sort(
      (n, s) => jr(n) - jr(s)
    );
    if (tr.length = 0, is) {
      is.push(...t);
      return;
    }
    for (is = t, Ys = 0; Ys < is.length; Ys++) {
      const n = is[Ys];
      n.flags & 4 && (n.flags &= -2), n.flags & 8 || n(), n.flags &= -2;
    }
    is = null, Ys = 0;
  }
}
const jr = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function bu(e) {
  try {
    for (Tn = 0; Tn < Dt.length; Tn++) {
      const t = Dt[Tn];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), Kr(
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
    Tn = -1, Dt.length = 0, vu(), Bi = null, (Dt.length || tr.length) && bu();
  }
}
let cn = null, wu = null;
function Ui(e) {
  const t = cn;
  return cn = e, wu = e && e.type.__scopeId || null, t;
}
function ed(e, t = cn, n) {
  if (!t || e._n)
    return e;
  const s = (...r) => {
    s._d && Hl(-1);
    const i = Ui(t);
    let o;
    try {
      o = e(...r);
    } finally {
      Ui(i), s._d && Hl(1);
    }
    return o;
  };
  return s._n = !0, s._c = !0, s._d = !0, s;
}
function ss(e, t) {
  if (cn === null)
    return e;
  const n = co(cn), s = e.dirs || (e.dirs = []);
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
    l && (Un(), xn(l, n, 8, [
      e.el,
      a,
      e,
      t
    ]), zn());
  }
}
const td = Symbol("_vte"), nd = (e) => e.__isTeleport;
function Da(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, Da(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function Hn(e, t) {
  return Ce(e) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    Ot({ name: e.name }, t, { setup: e })
  ) : e;
}
function ku(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
function Mr(e, t, n, s, r = !1) {
  if (Ae(e)) {
    e.forEach(
      (O, H) => Mr(
        O,
        t && (Ae(t) ? t[H] : t),
        n,
        s,
        r
      )
    );
    return;
  }
  if (Dr(s) && !r) {
    s.shapeFlag & 512 && s.type.__asyncResolved && s.component.subTree.component && Mr(e, t, n, s.component.subTree);
    return;
  }
  const i = s.shapeFlag & 4 ? co(s.component) : s.el, o = r ? null : i, { i: a, r: l } = e, u = t && t.r, c = a.refs === nt ? a.refs = {} : a.refs, w = a.setupState, A = Be(w), I = w === nt ? () => !1 : (O) => qe(A, O);
  if (u != null && u !== l && (gt(u) ? (c[u] = null, I(u) && (w[u] = null)) : It(u) && (u.value = null)), Ce(l))
    Kr(l, a, 12, [o, c]);
  else {
    const O = gt(l), H = It(l);
    if (O || H) {
      const ue = () => {
        if (e.f) {
          const R = O ? I(l) ? w[l] : c[l] : l.value;
          r ? Ae(R) && Ea(R, i) : Ae(R) ? R.includes(i) || R.push(i) : O ? (c[l] = [i], I(l) && (w[l] = c[l])) : (l.value = [i], e.k && (c[e.k] = l.value));
        } else O ? (c[l] = o, I(l) && (w[l] = o)) : H && (l.value = o, e.k && (c[e.k] = o));
      };
      o ? (ue.id = -1, Zt(ue, n)) : ue();
    }
  }
}
to().requestIdleCallback;
to().cancelIdleCallback;
const Dr = (e) => !!e.type.__asyncLoader, Tu = (e) => e.type.__isKeepAlive;
function sd(e, t) {
  Au(e, "a", t);
}
function rd(e, t) {
  Au(e, "da", t);
}
function Au(e, t, n = $t) {
  const s = e.__wdc || (e.__wdc = () => {
    let r = n;
    for (; r; ) {
      if (r.isDeactivated)
        return;
      r = r.parent;
    }
    return e();
  });
  if (ro(t, s, n), n) {
    let r = n.parent;
    for (; r && r.parent; )
      Tu(r.parent.vnode) && id(s, t, n, r), r = r.parent;
  }
}
function id(e, t, n, s) {
  const r = ro(
    t,
    e,
    s,
    !0
    /* prepend */
  );
  Gr(() => {
    Ea(s[t], r);
  }, n);
}
function ro(e, t, n = $t, s = !1) {
  if (n) {
    const r = n[e] || (n[e] = []), i = t.__weh || (t.__weh = (...o) => {
      Un();
      const a = Yr(n), l = xn(t, n, e, o);
      return a(), zn(), l;
    });
    return s ? r.unshift(i) : r.push(i), i;
  }
}
const jn = (e) => (t, n = $t) => {
  (!qr || e === "sp") && ro(e, (...s) => t(...s), n);
}, od = jn("bm"), io = jn("m"), ad = jn(
  "bu"
), ld = jn("u"), oo = jn(
  "bum"
), Gr = jn("um"), cd = jn(
  "sp"
), ud = jn("rtg"), fd = jn("rtc");
function hd(e, t = $t) {
  ro("ec", e, t);
}
const dd = Symbol.for("v-ndc");
function dt(e, t, n, s) {
  let r;
  const i = n, o = Ae(e);
  if (o || gt(e)) {
    const a = o && er(e);
    let l = !1, u = !1;
    a && (l = !un(e), u = hs(e), e = no(e)), r = new Array(e.length);
    for (let c = 0, w = e.length; c < w; c++)
      r[c] = t(
        l ? u ? Fi(St(e[c])) : St(e[c]) : e[c],
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
const ia = (e) => e ? qu(e) ? co(e) : ia(e.parent) : null, Fr = (
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
    $parent: (e) => ia(e.parent),
    $root: (e) => ia(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => Eu(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      Ma(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = as.bind(e.proxy)),
    $watch: (e) => Md.bind(e)
  })
), Lo = (e, t) => e !== nt && !e.__isScriptSetup && qe(e, t), pd = {
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
        if (Lo(s, t))
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
        oa && (o[t] = 0);
      }
    }
    const c = Fr[t];
    let w, A;
    if (c)
      return t === "$attrs" && Rt(e.attrs, "get", ""), c(e);
    if (
      // css module (injected by vue-loader)
      (w = a.__cssModules) && (w = w[t])
    )
      return w;
    if (n !== nt && qe(n, t))
      return o[t] = 4, n[t];
    if (
      // global properties
      A = l.config.globalProperties, qe(A, t)
    )
      return A[t];
  },
  set({ _: e }, t, n) {
    const { data: s, setupState: r, ctx: i } = e;
    return Lo(r, t) ? (r[t] = n, !0) : s !== nt && qe(s, t) ? (s[t] = n, !0) : qe(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (i[t] = n, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: n, ctx: s, appContext: r, propsOptions: i }
  }, o) {
    let a;
    return !!n[o] || e !== nt && qe(e, o) || Lo(t, o) || (a = i[0]) && qe(a, o) || qe(s, o) || qe(Fr, o) || qe(r.config.globalProperties, o);
  },
  defineProperty(e, t, n) {
    return n.get != null ? e._.accessCache[t] = 0 : qe(n, "value") && this.set(e, t, n.value, null), Reflect.defineProperty(e, t, n);
  }
};
function Pl(e) {
  return Ae(e) ? e.reduce(
    (t, n) => (t[n] = null, t),
    {}
  ) : e;
}
let oa = !0;
function md(e) {
  const t = Eu(e), n = e.proxy, s = e.ctx;
  oa = !1, t.beforeCreate && Ml(t.beforeCreate, e, "bc");
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
    beforeMount: w,
    mounted: A,
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
    directives: Ke,
    filters: Ue
  } = t;
  if (u && gd(u, s, null), o)
    for (const Te in o) {
      const ye = o[Te];
      Ce(ye) && (s[Te] = ye.bind(n));
    }
  if (r) {
    const Te = r.call(n, n);
    ct(Te) && (e.data = Vr(Te));
  }
  if (oa = !0, i)
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
      Su(a[Te], s, n, Te);
  if (l) {
    const Te = Ce(l) ? l.call(n) : l;
    Reflect.ownKeys(Te).forEach((ye) => {
      kd(ye, Te[ye]);
    });
  }
  c && Ml(c, e, "c");
  function he(Te, ye) {
    Ae(ye) ? ye.forEach((Ze) => Te(Ze.bind(n))) : ye && Te(ye.bind(n));
  }
  if (he(od, w), he(io, A), he(ad, I), he(ld, O), he(sd, H), he(rd, ue), he(hd, se), he(fd, S), he(ud, W), he(oo, fe), he(Gr, x), he(cd, me), Ae(ge))
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
  M && e.render === Sn && (e.render = M), Oe != null && (e.inheritAttrs = Oe), Se && (e.components = Se), Ke && (e.directives = Ke), me && ku(e);
}
function gd(e, t, n = Sn) {
  Ae(e) && (e = aa(e));
  for (const s in e) {
    const r = e[s];
    let i;
    ct(r) ? "default" in r ? i = Ti(
      r.from || s,
      r.default,
      !0
    ) : i = Ti(r.from || s) : i = Ti(r), It(i) ? Object.defineProperty(t, s, {
      enumerable: !0,
      configurable: !0,
      get: () => i.value,
      set: (o) => i.value = o
    }) : t[s] = i;
  }
}
function Ml(e, t, n) {
  xn(
    Ae(e) ? e.map((s) => s.bind(t.proxy)) : e.bind(t.proxy),
    t,
    n
  );
}
function Su(e, t, n, s) {
  let r = s.includes(".") ? Bu(n, s) : () => n[s];
  if (gt(e)) {
    const i = t[e];
    Ce(i) && pt(r, i);
  } else if (Ce(e))
    pt(r, e.bind(n));
  else if (ct(e))
    if (Ae(e))
      e.forEach((i) => Su(i, t, n, s));
    else {
      const i = Ce(e.handler) ? e.handler.bind(n) : t[e.handler];
      Ce(i) && pt(r, i, e);
    }
}
function Eu(e) {
  const t = e.type, { mixins: n, extends: s } = t, {
    mixins: r,
    optionsCache: i,
    config: { optionMergeStrategies: o }
  } = e.appContext, a = i.get(t);
  let l;
  return a ? l = a : !r.length && !n && !s ? l = t : (l = {}, r.length && r.forEach(
    (u) => zi(l, u, o, !0)
  ), zi(l, t, o)), ct(t) && i.set(t, l), l;
}
function zi(e, t, n, s = !1) {
  const { mixins: r, extends: i } = t;
  i && zi(e, i, n, !0), r && r.forEach(
    (o) => zi(e, o, n, !0)
  );
  for (const o in t)
    if (!(s && o === "expose")) {
      const a = _d[o] || n && n[o];
      e[o] = a ? a(e[o], t[o]) : t[o];
    }
  return e;
}
const _d = {
  data: Dl,
  props: Fl,
  emits: Fl,
  // objects
  methods: Cr,
  computed: Cr,
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
  components: Cr,
  directives: Cr,
  // watch
  watch: vd,
  // provide / inject
  provide: Dl,
  inject: yd
};
function Dl(e, t) {
  return t ? e ? function() {
    return Ot(
      Ce(e) ? e.call(this, this) : e,
      Ce(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function yd(e, t) {
  return Cr(aa(e), aa(t));
}
function aa(e) {
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
function Cr(e, t) {
  return e ? Ot(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function Fl(e, t) {
  return e ? Ae(e) && Ae(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : Ot(
    /* @__PURE__ */ Object.create(null),
    Pl(e),
    Pl(t ?? {})
  ) : t;
}
function vd(e, t) {
  if (!e) return t;
  if (!t) return e;
  const n = Ot(/* @__PURE__ */ Object.create(null), e);
  for (const s in t)
    n[s] = Mt(e[s], t[s]);
  return n;
}
function xu() {
  return {
    app: null,
    config: {
      isNativeTag: fh,
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
let bd = 0;
function wd(e, t) {
  return function(s, r = null) {
    Ce(s) || (s = Ot({}, s)), r != null && !ct(r) && (r = null);
    const i = xu(), o = /* @__PURE__ */ new WeakSet(), a = [];
    let l = !1;
    const u = i.app = {
      _uid: bd++,
      _component: s,
      _props: r,
      _container: null,
      _context: i,
      _instance: null,
      version: np,
      get config() {
        return i.config;
      },
      set config(c) {
      },
      use(c, ...w) {
        return o.has(c) || (c && Ce(c.install) ? (o.add(c), c.install(u, ...w)) : Ce(c) && (o.add(c), c(u, ...w))), u;
      },
      mixin(c) {
        return i.mixins.includes(c) || i.mixins.push(c), u;
      },
      component(c, w) {
        return w ? (i.components[c] = w, u) : i.components[c];
      },
      directive(c, w) {
        return w ? (i.directives[c] = w, u) : i.directives[c];
      },
      mount(c, w, A) {
        if (!l) {
          const I = u._ceVNode || Ft(s, r);
          return I.appContext = i, A === !0 ? A = "svg" : A === !1 && (A = void 0), e(I, c, A), l = !0, u._container = c, c.__vue_app__ = u, co(I.component);
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
      provide(c, w) {
        return i.provides[c] = w, u;
      },
      runWithContext(c) {
        const w = nr;
        nr = u;
        try {
          return c();
        } finally {
          nr = w;
        }
      }
    };
    return u;
  };
}
let nr = null;
function kd(e, t) {
  if ($t) {
    let n = $t.provides;
    const s = $t.parent && $t.parent.provides;
    s === n && (n = $t.provides = Object.create(s)), n[e] = t;
  }
}
function Ti(e, t, n = !1) {
  const s = Xd();
  if (s || nr) {
    let r = nr ? nr._context.provides : s ? s.parent == null || s.ce ? s.vnode.appContext && s.vnode.appContext.provides : s.parent.provides : void 0;
    if (r && e in r)
      return r[e];
    if (arguments.length > 1)
      return n && Ce(t) ? t.call(s && s.proxy) : t;
  }
}
const Cu = {}, Ru = () => Object.create(Cu), Iu = (e) => Object.getPrototypeOf(e) === Cu;
function Td(e, t, n, s = !1) {
  const r = {}, i = Ru();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), Ou(e, t, r, i);
  for (const o in e.propsOptions[0])
    o in r || (r[o] = void 0);
  n ? e.props = s ? r : Hh(r) : e.type.props ? e.props = r : e.props = i, e.attrs = i;
}
function Ad(e, t, n, s) {
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
      for (let w = 0; w < c.length; w++) {
        let A = c[w];
        if (ao(e.emitsOptions, A))
          continue;
        const I = t[A];
        if (l)
          if (qe(i, A))
            I !== i[A] && (i[A] = I, u = !0);
          else {
            const O = fs(A);
            r[O] = la(
              l,
              a,
              O,
              I,
              e,
              !1
            );
          }
        else
          I !== i[A] && (i[A] = I, u = !0);
      }
    }
  } else {
    Ou(e, t, r, i) && (u = !0);
    let c;
    for (const w in a)
      (!t || // for camelCase
      !qe(t, w) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((c = ms(w)) === w || !qe(t, c))) && (l ? n && // for camelCase
      (n[w] !== void 0 || // for kebab-case
      n[c] !== void 0) && (r[w] = la(
        l,
        a,
        w,
        void 0,
        e,
        !0
      )) : delete r[w]);
    if (i !== a)
      for (const w in i)
        (!t || !qe(t, w)) && (delete i[w], u = !0);
  }
  u && Dn(e.attrs, "set", "");
}
function Ou(e, t, n, s) {
  const [r, i] = e.propsOptions;
  let o = !1, a;
  if (t)
    for (let l in t) {
      if (Lr(l))
        continue;
      const u = t[l];
      let c;
      r && qe(r, c = fs(l)) ? !i || !i.includes(c) ? n[c] = u : (a || (a = {}))[c] = u : ao(e.emitsOptions, l) || (!(l in s) || u !== s[l]) && (s[l] = u, o = !0);
    }
  if (i) {
    const l = Be(n), u = a || nt;
    for (let c = 0; c < i.length; c++) {
      const w = i[c];
      n[w] = la(
        r,
        l,
        w,
        u[w],
        e,
        !qe(u, w)
      );
    }
  }
  return o;
}
function la(e, t, n, s, r, i) {
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
          const c = Yr(r);
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
    ] && (s === "" || s === ms(n)) && (s = !0));
  }
  return s;
}
const Sd = /* @__PURE__ */ new WeakMap();
function Lu(e, t, n = !1) {
  const s = n ? Sd : t.propsCache, r = s.get(e);
  if (r)
    return r;
  const i = e.props, o = {}, a = [];
  let l = !1;
  if (!Ce(e)) {
    const c = (w) => {
      l = !0;
      const [A, I] = Lu(w, t, !0);
      Ot(o, A), I && a.push(...I);
    };
    !n && t.mixins.length && t.mixins.forEach(c), e.extends && c(e.extends), e.mixins && e.mixins.forEach(c);
  }
  if (!i && !l)
    return ct(e) && s.set(e, Js), Js;
  if (Ae(i))
    for (let c = 0; c < i.length; c++) {
      const w = fs(i[c]);
      $l(w) && (o[w] = nt);
    }
  else if (i)
    for (const c in i) {
      const w = fs(c);
      if ($l(w)) {
        const A = i[c], I = o[w] = Ae(A) || Ce(A) ? { type: A } : Ot({}, A), O = I.type;
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
        ] = ue, (H || qe(I, "default")) && a.push(w);
      }
    }
  const u = [o, a];
  return ct(e) && s.set(e, u), u;
}
function $l(e) {
  return e[0] !== "$" && !Lr(e);
}
const Fa = (e) => e === "_" || e === "__" || e === "_ctx" || e === "$stable", $a = (e) => Ae(e) ? e.map(An) : [An(e)], Ed = (e, t, n) => {
  if (t._n)
    return t;
  const s = ed((...r) => $a(t(...r)), n);
  return s._c = !1, s;
}, Nu = (e, t, n) => {
  const s = e._ctx;
  for (const r in e) {
    if (Fa(r)) continue;
    const i = e[r];
    if (Ce(i))
      t[r] = Ed(r, i, s);
    else if (i != null) {
      const o = $a(i);
      t[r] = () => o;
    }
  }
}, Pu = (e, t) => {
  const n = $a(t);
  e.slots.default = () => n;
}, Mu = (e, t, n) => {
  for (const s in t)
    (n || !Fa(s)) && (e[s] = t[s]);
}, xd = (e, t, n) => {
  const s = e.slots = Ru();
  if (e.vnode.shapeFlag & 32) {
    const r = t.__;
    r && Qo(s, "__", r, !0);
    const i = t._;
    i ? (Mu(s, t, n), n && Qo(s, "_", i, !0)) : Nu(t, s);
  } else t && Pu(e, t);
}, Cd = (e, t, n) => {
  const { vnode: s, slots: r } = e;
  let i = !0, o = nt;
  if (s.shapeFlag & 32) {
    const a = t._;
    a ? n && a === 1 ? i = !1 : Mu(r, t, n) : (i = !t.$stable, Nu(t, r)), o = t;
  } else t && (Pu(e, t), o = { default: 1 });
  if (i)
    for (const a in r)
      !Fa(a) && o[a] == null && delete r[a];
}, Zt = Hd;
function Rd(e) {
  return Id(e);
}
function Id(e, t) {
  const n = to();
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
    parentNode: w,
    nextSibling: A,
    setScopeId: I = Sn,
    insertStaticContent: O
  } = e, H = (_, v, L, D = null, U = null, P = null, X = void 0, V = null, K = !!v.dynamicChildren) => {
    if (_ === v)
      return;
    _ && !yr(_, v) && (D = Ut(_), je(_, U, P, !0), _ = null), v.patchFlag === -2 && (K = !1, v.dynamicChildren = null);
    const { type: j, ref: re, shapeFlag: J } = v;
    switch (j) {
      case lo:
        ue(_, v, L, D);
        break;
      case ds:
        R(_, v, L, D);
        break;
      case Ai:
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
        J & 1 ? M(
          _,
          v,
          L,
          D,
          U,
          P,
          X,
          V,
          K
        ) : J & 6 ? Ke(
          _,
          v,
          L,
          D,
          U,
          P,
          X,
          V,
          K
        ) : (J & 64 || J & 128) && j.process(
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
    re != null && U ? Mr(re, _ && _.ref, P, v || _, !v) : re == null && _ && _.ref != null && Mr(_.ref, null, P, _, !0);
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
      U = A(_), s(_, L, D), _ = U;
    s(v, L, D);
  }, x = ({ el: _, anchor: v }) => {
    let L;
    for (; _ && _ !== v; )
      L = A(_), r(_), _ = L;
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
    const { props: re, shapeFlag: J, transition: Q, dirs: pe } = _;
    if (K = _.el = o(
      _.type,
      P,
      re && re.is,
      re
    ), J & 8 ? c(K, _.children) : J & 16 && se(
      _.children,
      K,
      null,
      D,
      U,
      No(_, P),
      X,
      V
    ), pe && Ss(_, null, D, "created"), W(K, _, _.scopeId, X, D), re) {
      for (const be in re)
        be !== "value" && !Lr(be) && i(K, be, null, re[be], P, D);
      "value" in re && i(K, "value", null, re.value, P), (j = re.onVnodeBeforeMount) && wn(j, D, _);
    }
    pe && Ss(_, null, D, "beforeMount");
    const de = Od(U, Q);
    de && Q.beforeEnter(K), s(K, v, L), ((j = re && re.onVnodeMounted) || de || pe) && Zt(() => {
      j && wn(j, D, _), de && Q.enter(K), pe && Ss(_, null, D, "mounted");
    }, U);
  }, W = (_, v, L, D, U) => {
    if (L && I(_, L), D)
      for (let P = 0; P < D.length; P++)
        I(_, D[P]);
    if (U) {
      let P = U.subTree;
      if (v === P || zu(P.type) && (P.ssContent === v || P.ssFallback === v)) {
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
      const re = _[j] = V ? os(_[j]) : An(_[j]);
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
    const J = _.props || nt, Q = v.props || nt;
    let pe;
    if (L && Es(L, !1), (pe = Q.onVnodeBeforeUpdate) && wn(pe, L, v, _), re && Ss(v, _, L, "beforeUpdate"), L && Es(L, !0), (J.innerHTML && Q.innerHTML == null || J.textContent && Q.textContent == null) && c(V, ""), j ? ge(
      _.dynamicChildren,
      j,
      V,
      L,
      D,
      No(v, U),
      P
    ) : X || ye(
      _,
      v,
      V,
      null,
      L,
      D,
      No(v, U),
      P,
      !1
    ), K > 0) {
      if (K & 16)
        Oe(V, J, Q, L, U);
      else if (K & 2 && J.class !== Q.class && i(V, "class", null, Q.class, U), K & 4 && i(V, "style", J.style, Q.style, U), K & 8) {
        const de = v.dynamicProps;
        for (let be = 0; be < de.length; be++) {
          const ke = de[be], De = J[ke], $ = Q[ke];
          ($ !== De || ke === "value") && i(V, ke, De, $, U, L);
        }
      }
      K & 1 && _.children !== v.children && c(V, v.children);
    } else !X && j == null && Oe(V, J, Q, L, U);
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
        !yr(K, j) || // - In the case of a component, it could contain anything.
        K.shapeFlag & 198) ? w(K.el) : (
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
          !Lr(P) && !(P in L) && i(
            _,
            P,
            v[P],
            null,
            U,
            D
          );
      for (const P in L) {
        if (Lr(P)) continue;
        const X = L[P], V = v[P];
        X !== V && P !== "value" && i(_, P, V, X, U, D);
      }
      "value" in L && i(_, "value", v.value, L.value, U);
    }
  }, Se = (_, v, L, D, U, P, X, V, K) => {
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
      P,
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
      P,
      X,
      V
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (v.key != null || U && v === U.subTree) && Du(
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
  }, Ke = (_, v, L, D, U, P, X, V, K) => {
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
    const V = _.component = Yd(
      _,
      D,
      U
    );
    if (Tu(_) && (V.ctx.renderer = Nt), Zd(V, !1, X), V.asyncDep) {
      if (U && U.registerDep(V, he, X), !_.el) {
        const K = V.subTree = Ft(ds);
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
    if (Ud(_, v, L))
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
        let { next: J, bu: Q, u: pe, parent: de, vnode: be } = _;
        {
          const f = Fu(_);
          if (f) {
            J && (J.el = be.el, Te(_, J, X)), f.asyncDep.then(() => {
              _.isUnmounted || V();
            });
            return;
          }
        }
        let ke = J, De;
        Es(_, !1), J ? (J.el = be.el, Te(_, J, X)) : J = be, Q && ki(Q), (De = J.props && J.props.onVnodeBeforeUpdate) && wn(De, de, J, be), Es(_, !0);
        const $ = Ul(_), z = _.subTree;
        _.subTree = $, H(
          z,
          $,
          // parent may have changed if it's in a teleport
          w(z.el),
          // anchor may have changed if it's in a fragment
          Ut(z),
          _,
          U,
          P
        ), J.el = $.el, ke === null && zd(_, $.el), pe && Zt(pe, U), (De = J.props && J.props.onVnodeUpdated) && Zt(
          () => wn(De, de, J, be),
          U
        );
      } else {
        let J;
        const { el: Q, props: pe } = v, { bm: de, m: be, parent: ke, root: De, type: $ } = _, z = Dr(v);
        Es(_, !1), de && ki(de), !z && (J = pe && pe.onVnodeBeforeMount) && wn(J, ke, v), Es(_, !0);
        {
          De.ce && // @ts-expect-error _def is private
          De.ce._def.shadowRoot !== !1 && De.ce._injectChildStyle($);
          const f = _.subTree = Ul(_);
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
        if (be && Zt(be, U), !z && (J = pe && pe.onVnodeMounted)) {
          const f = v;
          Zt(
            () => wn(J, ke, f),
            U
          );
        }
        (v.shapeFlag & 256 || ke && Dr(ke.vnode) && ke.vnode.shapeFlag & 256) && _.a && Zt(_.a, U), _.isMounted = !0, v = L = D = null;
      }
    };
    _.scope.on();
    const K = _.effect = new eu(V);
    _.scope.off();
    const j = _.update = K.run.bind(K), re = _.job = K.runIfDirty.bind(K);
    re.i = _, re.id = _.uid, K.scheduler = () => Ma(re), Es(_, !0), j();
  }, Te = (_, v, L) => {
    v.component = _;
    const D = _.vnode.props;
    _.vnode = v, _.next = null, Ad(_, v.props, D, L), Cd(_, v.children, L), Un(), Nl(_), zn();
  }, ye = (_, v, L, D, U, P, X, V, K = !1) => {
    const j = _ && _.children, re = _ ? _.shapeFlag : 0, J = v.children, { patchFlag: Q, shapeFlag: pe } = v;
    if (Q > 0) {
      if (Q & 128) {
        Je(
          j,
          J,
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
          J,
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
    pe & 8 ? (re & 16 && wt(j, U, P), J !== j && c(L, J)) : re & 16 ? pe & 16 ? Je(
      j,
      J,
      L,
      D,
      U,
      P,
      X,
      V,
      K
    ) : wt(j, U, P, !0) : (re & 8 && c(L, ""), pe & 16 && se(
      J,
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
    const j = _.length, re = v.length, J = Math.min(j, re);
    let Q;
    for (Q = 0; Q < J; Q++) {
      const pe = v[Q] = K ? os(v[Q]) : An(v[Q]);
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
    j > re ? wt(
      _,
      U,
      P,
      !0,
      !1,
      J
    ) : se(
      v,
      L,
      D,
      U,
      P,
      X,
      V,
      K,
      J
    );
  }, Je = (_, v, L, D, U, P, X, V, K) => {
    let j = 0;
    const re = v.length;
    let J = _.length - 1, Q = re - 1;
    for (; j <= J && j <= Q; ) {
      const pe = _[j], de = v[j] = K ? os(v[j]) : An(v[j]);
      if (yr(pe, de))
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
    for (; j <= J && j <= Q; ) {
      const pe = _[J], de = v[Q] = K ? os(v[Q]) : An(v[Q]);
      if (yr(pe, de))
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
      J--, Q--;
    }
    if (j > J) {
      if (j <= Q) {
        const pe = Q + 1, de = pe < re ? v[pe].el : D;
        for (; j <= Q; )
          H(
            null,
            v[j] = K ? os(v[j]) : An(v[j]),
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
      for (; j <= J; )
        je(_[j], U, P, !0), j++;
    else {
      const pe = j, de = j, be = /* @__PURE__ */ new Map();
      for (j = de; j <= Q; j++) {
        const C = v[j] = K ? os(v[j]) : An(v[j]);
        C.key != null && be.set(C.key, j);
      }
      let ke, De = 0;
      const $ = Q - de + 1;
      let z = !1, f = 0;
      const y = new Array($);
      for (j = 0; j < $; j++) y[j] = 0;
      for (j = pe; j <= J; j++) {
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
            if (y[ke - de] === 0 && yr(C, v[ke])) {
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
      const N = z ? Ld(y) : Js;
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
      for (let J = 0; J < K.length; J++)
        lt(K[J], v, L, D);
      s(_.anchor, v, L);
      return;
    }
    if (X === Ai) {
      _e(_, v, L);
      return;
    }
    if (D !== 2 && j & 1 && V)
      if (D === 0)
        V.beforeEnter(P), s(P, v, L), Zt(() => V.enter(P), U);
      else {
        const { leave: J, delayLeave: Q, afterLeave: pe } = V, de = () => {
          _.ctx.isUnmounted ? r(P) : s(P, v, L);
        }, be = () => {
          J(P, () => {
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
      patchFlag: J,
      dirs: Q,
      cacheIndex: pe
    } = _;
    if (J === -2 && (U = !1), V != null && (Un(), Mr(V, null, L, _, !0), zn()), pe != null && (v.renderCache[pe] = void 0), re & 256) {
      v.ctx.deactivate(_);
      return;
    }
    const de = re & 1 && Q, be = !Dr(_);
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
      (P !== Re || J > 0 && J & 64) ? wt(
        j,
        v,
        L,
        !1,
        !0
      ) : (P === Re && J & 384 || !U && re & 16) && wt(K, v, L), D && Lt(_);
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
    if (v === Ai) {
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
      L = A(_), r(_), _ = L;
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
      slots: { __: J }
    } = _;
    Bl(K), Bl(j), D && ki(D), re && Ae(J) && J.forEach((Q) => {
      re.renderCache[Q] = void 0;
    }), U.stop(), P && (P.flags |= 8, je(X, _, v, L)), V && Zt(V, v), Zt(() => {
      _.isUnmounted = !0;
    }, v), v && v.pendingBranch && !v.isUnmounted && _.asyncDep && !_.asyncResolved && _.suspenseId === v.pendingId && (v.deps--, v.deps === 0 && v.resolve());
  }, wt = (_, v, L, D = !1, U = !1, P = 0) => {
    for (let X = P; X < _.length; X++)
      je(_[X], v, L, D, U);
  }, Ut = (_) => {
    if (_.shapeFlag & 6)
      return Ut(_.component.subTree);
    if (_.shapeFlag & 128)
      return _.suspense.next();
    const v = A(_.anchor || _.el), L = v && v[td];
    return L ? A(L) : v;
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
    ), v._vnode = _, Wt || (Wt = !0, Nl(), vu(), Wt = !1);
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
    createApp: wd(qt)
  };
}
function No({ type: e, props: t }, n) {
  return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function Es({ effect: e, job: t }, n) {
  n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function Od(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function Du(e, t, n = !1) {
  const s = e.children, r = t.children;
  if (Ae(s) && Ae(r))
    for (let i = 0; i < s.length; i++) {
      const o = s[i];
      let a = r[i];
      a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = r[i] = os(r[i]), a.el = o.el), !n && a.patchFlag !== -2 && Du(o, a)), a.type === lo && (a.el = o.el), a.type === ds && !a.el && (a.el = o.el);
    }
}
function Ld(e) {
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
function Fu(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : Fu(t);
}
function Bl(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
const Nd = Symbol.for("v-scx"), Pd = () => Ti(Nd);
function pt(e, t, n) {
  return $u(e, t, n);
}
function $u(e, t, n = nt) {
  const { immediate: s, deep: r, flush: i, once: o } = n, a = Ot({}, n), l = t && s || !t && i !== "post";
  let u;
  if (qr) {
    if (i === "sync") {
      const I = Pd();
      u = I.__watcherHandles || (I.__watcherHandles = []);
    } else if (!l) {
      const I = () => {
      };
      return I.stop = Sn, I.resume = Sn, I.pause = Sn, I;
    }
  }
  const c = $t;
  a.call = (I, O, H) => xn(I, c, O, H);
  let w = !1;
  i === "post" ? a.scheduler = (I) => {
    Zt(I, c && c.suspense);
  } : i !== "sync" && (w = !0, a.scheduler = (I, O) => {
    O ? I() : Ma(I);
  }), a.augmentJob = (I) => {
    t && (I.flags |= 4), w && (I.flags |= 2, c && (I.id = c.uid, I.i = c));
  };
  const A = Xh(e, t, a);
  return qr && (u ? u.push(A) : l && A()), A;
}
function Md(e, t, n) {
  const s = this.proxy, r = gt(e) ? e.includes(".") ? Bu(s, e) : () => s[e] : e.bind(s, s);
  let i;
  Ce(t) ? i = t : (i = t.handler, n = t);
  const o = Yr(this), a = $u(r, i.bind(s), n);
  return o(), a;
}
function Bu(e, t) {
  const n = t.split(".");
  return () => {
    let s = e;
    for (let r = 0; r < n.length && s; r++)
      s = s[n[r]];
    return s;
  };
}
const Dd = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${fs(t)}Modifiers`] || e[`${ms(t)}Modifiers`];
function Fd(e, t, ...n) {
  if (e.isUnmounted) return;
  const s = e.vnode.props || nt;
  let r = n;
  const i = t.startsWith("update:"), o = i && Dd(s, t.slice(7));
  o && (o.trim && (r = n.map((c) => gt(c) ? c.trim() : c)), o.number && (r = n.map(ea)));
  let a, l = s[a = xo(t)] || // also try camelCase event handler (#2249)
  s[a = xo(fs(t))];
  !l && i && (l = s[a = xo(ms(t))]), l && xn(
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
function Uu(e, t, n = !1) {
  const s = t.emitsCache, r = s.get(e);
  if (r !== void 0)
    return r;
  const i = e.emits;
  let o = {}, a = !1;
  if (!Ce(e)) {
    const l = (u) => {
      const c = Uu(u, t, !0);
      c && (a = !0, Ot(o, c));
    };
    !n && t.mixins.length && t.mixins.forEach(l), e.extends && l(e.extends), e.mixins && e.mixins.forEach(l);
  }
  return !i && !a ? (ct(e) && s.set(e, null), null) : (Ae(i) ? i.forEach((l) => o[l] = null) : Ot(o, i), ct(e) && s.set(e, o), o);
}
function ao(e, t) {
  return !e || !Ji(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), qe(e, t[0].toLowerCase() + t.slice(1)) || qe(e, ms(t)) || qe(e, t));
}
function Ul(e) {
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
    props: w,
    data: A,
    setupState: I,
    ctx: O,
    inheritAttrs: H
  } = e, ue = Ui(e);
  let R, fe;
  try {
    if (n.shapeFlag & 4) {
      const x = r || s, M = x;
      R = An(
        u.call(
          M,
          x,
          c,
          w,
          I,
          A,
          O
        )
      ), fe = a;
    } else {
      const x = t;
      R = An(
        x.length > 1 ? x(
          w,
          { attrs: a, slots: o, emit: l }
        ) : x(
          w,
          null
        )
      ), fe = t.props ? a : $d(a);
    }
  } catch (x) {
    $r.length = 0, so(x, e, 1), R = Ft(ds);
  }
  let _e = R;
  if (fe && H !== !1) {
    const x = Object.keys(fe), { shapeFlag: M } = _e;
    x.length && M & 7 && (i && x.some(Sa) && (fe = Bd(
      fe,
      i
    )), _e = or(_e, fe, !1, !0));
  }
  return n.dirs && (_e = or(_e, null, !1, !0), _e.dirs = _e.dirs ? _e.dirs.concat(n.dirs) : n.dirs), n.transition && Da(_e, n.transition), R = _e, Ui(ue), R;
}
const $d = (e) => {
  let t;
  for (const n in e)
    (n === "class" || n === "style" || Ji(n)) && ((t || (t = {}))[n] = e[n]);
  return t;
}, Bd = (e, t) => {
  const n = {};
  for (const s in e)
    (!Sa(s) || !(s.slice(9) in t)) && (n[s] = e[s]);
  return n;
};
function Ud(e, t, n) {
  const { props: s, children: r, component: i } = e, { props: o, children: a, patchFlag: l } = t, u = i.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (n && l >= 0) {
    if (l & 1024)
      return !0;
    if (l & 16)
      return s ? zl(s, o, u) : !!o;
    if (l & 8) {
      const c = t.dynamicProps;
      for (let w = 0; w < c.length; w++) {
        const A = c[w];
        if (o[A] !== s[A] && !ao(u, A))
          return !0;
      }
    }
  } else
    return (r || a) && (!a || !a.$stable) ? !0 : s === o ? !1 : s ? o ? zl(s, o, u) : !0 : !!o;
  return !1;
}
function zl(e, t, n) {
  const s = Object.keys(t);
  if (s.length !== Object.keys(e).length)
    return !0;
  for (let r = 0; r < s.length; r++) {
    const i = s[r];
    if (t[i] !== e[i] && !ao(n, i))
      return !0;
  }
  return !1;
}
function zd({ vnode: e, parent: t }, n) {
  for (; t; ) {
    const s = t.subTree;
    if (s.suspense && s.suspense.activeBranch === e && (s.el = e.el), s === e)
      (e = t.vnode).el = n, t = t.parent;
    else
      break;
  }
}
const zu = (e) => e.__isSuspense;
function Hd(e, t) {
  t && t.pendingBranch ? Ae(e) ? t.effects.push(...e) : t.effects.push(e) : Qh(e);
}
const Re = Symbol.for("v-fgt"), lo = Symbol.for("v-txt"), ds = Symbol.for("v-cmt"), Ai = Symbol.for("v-stc"), $r = [];
let Qt = null;
function b(e = !1) {
  $r.push(Qt = e ? null : []);
}
function jd() {
  $r.pop(), Qt = $r[$r.length - 1] || null;
}
let Wr = 1;
function Hl(e, t = !1) {
  Wr += e, e < 0 && Qt && t && (Qt.hasOnce = !0);
}
function Hu(e) {
  return e.dynamicChildren = Wr > 0 ? Qt || Js : null, jd(), Wr > 0 && Qt && Qt.push(e), e;
}
function k(e, t, n, s, r, i) {
  return Hu(
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
  return Hu(
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
function ju(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function yr(e, t) {
  return e.type === t.type && e.key === t.key;
}
const Wu = ({ key: e }) => e ?? null, Si = ({
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
    key: t && Wu(t),
    ref: t && Si(t),
    scopeId: wu,
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
  return a ? (Ba(l, n), i & 128 && e.normalize(l)) : n && (l.shapeFlag |= gt(n) ? 8 : 16), Wr > 0 && // avoid a block node from tracking itself
  !o && // has current parent block
  Qt && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (l.patchFlag > 0 || i & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  l.patchFlag !== 32 && Qt.push(l), l;
}
const Ft = Wd;
function Wd(e, t = null, n = null, s = 0, r = null, i = !1) {
  if ((!e || e === dd) && (e = ds), ju(e)) {
    const a = or(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return n && Ba(a, n), Wr > 0 && !i && Qt && (a.shapeFlag & 6 ? Qt[Qt.indexOf(e)] = a : Qt.push(a)), a.patchFlag = -2, a;
  }
  if (tp(e) && (e = e.__vccOpts), t) {
    t = qd(t);
    let { class: a, style: l } = t;
    a && !gt(a) && (t.class = Ne(a)), ct(l) && (Pa(l) && !Ae(l) && (l = Ot({}, l)), t.style = xe(l));
  }
  const o = gt(e) ? 1 : zu(e) ? 128 : nd(e) ? 64 : ct(e) ? 4 : Ce(e) ? 2 : 0;
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
function qd(e) {
  return e ? Pa(e) || Iu(e) ? Ot({}, e) : e : null;
}
function or(e, t, n = !1, s = !1) {
  const { props: r, ref: i, patchFlag: o, children: a, transition: l } = e, u = t ? Vd(r || {}, t) : r, c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: u,
    key: u && Wu(u),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && i ? Ae(i) ? i.concat(Si(t)) : [i, Si(t)] : Si(t)
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
  return l && s && Da(
    c,
    l.clone(c)
  ), c;
}
function Nn(e = " ", t = 0) {
  return Ft(lo, null, e, t);
}
function Po(e, t) {
  const n = Ft(Ai, null, e);
  return n.staticCount = t, n;
}
function te(e = "", t = !1) {
  return t ? (b(), Pn(ds, null, e)) : Ft(ds, null, e);
}
function An(e) {
  return e == null || typeof e == "boolean" ? Ft(ds) : Ae(e) ? Ft(
    Re,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : ju(e) ? os(e) : Ft(lo, null, String(e));
}
function os(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : or(e);
}
function Ba(e, t) {
  let n = 0;
  const { shapeFlag: s } = e;
  if (t == null)
    t = null;
  else if (Ae(t))
    n = 16;
  else if (typeof t == "object")
    if (s & 65) {
      const r = t.default;
      r && (r._c && (r._d = !1), Ba(e, r()), r._c && (r._d = !0));
      return;
    } else {
      n = 32;
      const r = t._;
      !r && !Iu(t) ? t._ctx = cn : r === 3 && cn && (cn.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else Ce(t) ? (t = { default: t, _ctx: cn }, n = 32) : (t = String(t), s & 64 ? (n = 16, t = [Nn(t)]) : n = 8);
  e.children = t, e.shapeFlag |= n;
}
function Vd(...e) {
  const t = {};
  for (let n = 0; n < e.length; n++) {
    const s = e[n];
    for (const r in s)
      if (r === "class")
        t.class !== s.class && (t.class = Ne([t.class, s.class]));
      else if (r === "style")
        t.style = xe([t.style, s.style]);
      else if (Ji(r)) {
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
const Kd = xu();
let Gd = 0;
function Yd(e, t, n) {
  const s = e.type, r = (t ? t.appContext : e.appContext) || Kd, i = {
    uid: Gd++,
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
    scope: new kh(
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
    propsOptions: Lu(s, r),
    emitsOptions: Uu(s, r),
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
  return i.ctx = { _: i }, i.root = t ? t.root : i, i.emit = Fd.bind(null, i), e.ce && e.ce(i), i;
}
let $t = null;
const Xd = () => $t || cn;
let Hi, ca;
{
  const e = to(), t = (n, s) => {
    let r;
    return (r = e[n]) || (r = e[n] = []), r.push(s), (i) => {
      r.length > 1 ? r.forEach((o) => o(i)) : r[0](i);
    };
  };
  Hi = t(
    "__VUE_INSTANCE_SETTERS__",
    (n) => $t = n
  ), ca = t(
    "__VUE_SSR_SETTERS__",
    (n) => qr = n
  );
}
const Yr = (e) => {
  const t = $t;
  return Hi(e), e.scope.on(), () => {
    e.scope.off(), Hi(t);
  };
}, jl = () => {
  $t && $t.scope.off(), Hi(null);
};
function qu(e) {
  return e.vnode.shapeFlag & 4;
}
let qr = !1;
function Zd(e, t = !1, n = !1) {
  t && ca(t);
  const { props: s, children: r } = e.vnode, i = qu(e);
  Td(e, s, i, t), xd(e, r, n || t);
  const o = i ? Jd(e, t) : void 0;
  return t && ca(!1), o;
}
function Jd(e, t) {
  const n = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, pd);
  const { setup: s } = n;
  if (s) {
    Un();
    const r = e.setupContext = s.length > 1 ? ep(e) : null, i = Yr(e), o = Kr(
      s,
      e,
      0,
      [
        e.props,
        r
      ]
    ), a = Kc(o);
    if (zn(), i(), (a || e.sp) && !Dr(e) && ku(e), a) {
      if (o.then(jl, jl), t)
        return o.then((l) => {
          Wl(e, l);
        }).catch((l) => {
          so(l, e, 0);
        });
      e.asyncDep = o;
    } else
      Wl(e, o);
  } else
    Vu(e);
}
function Wl(e, t, n) {
  Ce(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : ct(t) && (e.setupState = gu(t)), Vu(e);
}
function Vu(e, t, n) {
  const s = e.type;
  e.render || (e.render = s.render || Sn);
  {
    const r = Yr(e);
    Un();
    try {
      md(e);
    } finally {
      zn(), r();
    }
  }
}
const Qd = {
  get(e, t) {
    return Rt(e, "get", ""), e[t];
  }
};
function ep(e) {
  const t = (n) => {
    e.exposed = n || {};
  };
  return {
    attrs: new Proxy(e.attrs, Qd),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function co(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(gu(jh(e.exposed)), {
    get(t, n) {
      if (n in t)
        return t[n];
      if (n in Fr)
        return Fr[n](e);
    },
    has(t, n) {
      return n in t || n in Fr;
    }
  })) : e.proxy;
}
function tp(e) {
  return Ce(e) && "__vccOpts" in e;
}
const ae = (e, t) => Gh(e, t, qr), np = "3.5.18";
/**
* @vue/runtime-dom v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let ua;
const ql = typeof window < "u" && window.trustedTypes;
if (ql)
  try {
    ua = /* @__PURE__ */ ql.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const Ku = ua ? (e) => ua.createHTML(e) : (e) => e, sp = "http://www.w3.org/2000/svg", rp = "http://www.w3.org/1998/Math/MathML", Mn = typeof document < "u" ? document : null, Vl = Mn && /* @__PURE__ */ Mn.createElement("template"), ip = {
  insert: (e, t, n) => {
    t.insertBefore(e, n || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, n, s) => {
    const r = t === "svg" ? Mn.createElementNS(sp, e) : t === "mathml" ? Mn.createElementNS(rp, e) : n ? Mn.createElement(e, { is: n }) : Mn.createElement(e);
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
      Vl.innerHTML = Ku(
        s === "svg" ? `<svg>${e}</svg>` : s === "mathml" ? `<math>${e}</math>` : e
      );
      const a = Vl.content;
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
}, op = Symbol("_vtc");
function ap(e, t, n) {
  const s = e[op];
  s && (t = (t ? [t, ...s] : [...s]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
const ji = Symbol("_vod"), Gu = Symbol("_vsh"), lp = {
  beforeMount(e, { value: t }, { transition: n }) {
    e[ji] = e.style.display === "none" ? "" : e.style.display, n && t ? n.beforeEnter(e) : vr(e, t);
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
  e.style.display = t ? e[ji] : "none", e[Gu] = !t;
}
const cp = Symbol(""), up = /(^|;)\s*display\s*:/;
function fp(e, t, n) {
  const s = e.style, r = gt(n);
  let i = !1;
  if (n && !r) {
    if (t)
      if (gt(t))
        for (const o of t.split(";")) {
          const a = o.slice(0, o.indexOf(":")).trim();
          n[a] == null && Ei(s, a, "");
        }
      else
        for (const o in t)
          n[o] == null && Ei(s, o, "");
    for (const o in n)
      o === "display" && (i = !0), Ei(s, o, n[o]);
  } else if (r) {
    if (t !== n) {
      const o = s[cp];
      o && (n += ";" + o), s.cssText = n, i = up.test(n);
    }
  } else t && e.removeAttribute("style");
  ji in e && (e[ji] = i ? s.display : "", e[Gu] && (s.display = "none"));
}
const Kl = /\s*!important$/;
function Ei(e, t, n) {
  if (Ae(n))
    n.forEach((s) => Ei(e, t, s));
  else if (n == null && (n = ""), t.startsWith("--"))
    e.setProperty(t, n);
  else {
    const s = hp(e, t);
    Kl.test(n) ? e.setProperty(
      ms(s),
      n.replace(Kl, ""),
      "important"
    ) : e[s] = n;
  }
}
const Gl = ["Webkit", "Moz", "ms"], Mo = {};
function hp(e, t) {
  const n = Mo[t];
  if (n)
    return n;
  let s = fs(t);
  if (s !== "filter" && s in e)
    return Mo[t] = s;
  s = Xc(s);
  for (let r = 0; r < Gl.length; r++) {
    const i = Gl[r] + s;
    if (i in e)
      return Mo[t] = i;
  }
  return t;
}
const Yl = "http://www.w3.org/1999/xlink";
function Xl(e, t, n, s, r, i = wh(t)) {
  s && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(Yl, t.slice(6, t.length)) : e.setAttributeNS(Yl, t, n) : n == null || i && !Zc(n) ? e.removeAttribute(t) : e.setAttribute(
    t,
    i ? "" : ps(n) ? String(n) : n
  );
}
function Zl(e, t, n, s, r) {
  if (t === "innerHTML" || t === "textContent") {
    n != null && (e[t] = t === "innerHTML" ? Ku(n) : n);
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
    a === "boolean" ? n = Zc(n) : n == null && a === "string" ? (n = "", o = !0) : a === "number" && (n = 0, o = !0);
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
function dp(e, t, n, s) {
  e.removeEventListener(t, n, s);
}
const Jl = Symbol("_vei");
function pp(e, t, n, s, r = null) {
  const i = e[Jl] || (e[Jl] = {}), o = i[t];
  if (s && o)
    o.value = s;
  else {
    const [a, l] = mp(t);
    if (s) {
      const u = i[t] = yp(
        s,
        r
      );
      Xs(e, a, u, l);
    } else o && (dp(e, a, o, l), i[t] = void 0);
  }
}
const Ql = /(?:Once|Passive|Capture)$/;
function mp(e) {
  let t;
  if (Ql.test(e)) {
    t = {};
    let s;
    for (; s = e.match(Ql); )
      e = e.slice(0, e.length - s[0].length), t[s[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : ms(e.slice(2)), t];
}
let Do = 0;
const gp = /* @__PURE__ */ Promise.resolve(), _p = () => Do || (gp.then(() => Do = 0), Do = Date.now());
function yp(e, t) {
  const n = (s) => {
    if (!s._vts)
      s._vts = Date.now();
    else if (s._vts <= n.attached)
      return;
    xn(
      vp(s, n.value),
      t,
      5,
      [s]
    );
  };
  return n.value = e, n.attached = _p(), n;
}
function vp(e, t) {
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
const ec = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, bp = (e, t, n, s, r, i) => {
  const o = r === "svg";
  t === "class" ? ap(e, s, o) : t === "style" ? fp(e, n, s) : Ji(t) ? Sa(t) || pp(e, t, n, s, i) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : wp(e, t, s, o)) ? (Zl(e, t, s), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && Xl(e, t, s, o, i, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !gt(s)) ? Zl(e, fs(t), s, i, t) : (t === "true-value" ? e._trueValue = s : t === "false-value" && (e._falseValue = s), Xl(e, t, s, o));
};
function wp(e, t, n, s) {
  if (s)
    return !!(t === "innerHTML" || t === "textContent" || t in e && ec(t) && Ce(n));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const r = e.tagName;
    if (r === "IMG" || r === "VIDEO" || r === "CANVAS" || r === "SOURCE")
      return !1;
  }
  return ec(t) && gt(n) ? !1 : t in e;
}
const tc = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return Ae(t) ? (n) => ki(t, n) : t;
};
function kp(e) {
  e.target.composing = !0;
}
function nc(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const Fo = Symbol("_assign"), xs = {
  created(e, { modifiers: { lazy: t, trim: n, number: s } }, r) {
    e[Fo] = tc(r);
    const i = s || r.props && r.props.type === "number";
    Xs(e, t ? "change" : "input", (o) => {
      if (o.target.composing) return;
      let a = e.value;
      n && (a = a.trim()), i && (a = ea(a)), e[Fo](a);
    }), n && Xs(e, "change", () => {
      e.value = e.value.trim();
    }), t || (Xs(e, "compositionstart", kp), Xs(e, "compositionend", nc), Xs(e, "change", nc));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t }) {
    e.value = t ?? "";
  },
  beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: s, trim: r, number: i } }, o) {
    if (e[Fo] = tc(o), e.composing) return;
    const a = (i || e.type === "number") && !/^0\d/.test(e.value) ? ea(e.value) : e.value, l = t ?? "";
    a !== l && (document.activeElement === e && e.type !== "range" && (s && t === n || r && e.value.trim() === l) || (e.value = l));
  }
}, Tp = ["ctrl", "shift", "alt", "meta"], Ap = {
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
  exact: (e, t) => Tp.some((n) => e[`${n}Key`] && !t.includes(n))
}, Is = (e, t) => {
  const n = e._withMods || (e._withMods = {}), s = t.join(".");
  return n[s] || (n[s] = (r, ...i) => {
    for (let o = 0; o < t.length; o++) {
      const a = Ap[t[o]];
      if (a && a(r, t)) return;
    }
    return e(r, ...i);
  });
}, Sp = {
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
    const i = ms(r.key);
    if (t.some(
      (o) => o === i || Sp[o] === i
    ))
      return e(r);
  });
}, Ep = /* @__PURE__ */ Ot({ patchProp: bp }, ip);
let sc;
function xp() {
  return sc || (sc = Rd(Ep));
}
const Cp = (...e) => {
  const t = xp().createApp(...e), { mount: n } = t;
  return t.mount = (s) => {
    const r = Ip(s);
    if (!r) return;
    const i = t._component;
    !Ce(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
    const o = n(r, !1, Rp(r));
    return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), o;
  }, t;
};
function Rp(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function Ip(e) {
  return gt(e) ? document.querySelector(e) : e;
}
const Yu = /* @__PURE__ */ new Set(["customer_required", "token_invalid"]), fa = (e) => !!e && Yu.has(e), sr = (e) => {
  const t = e.replace("#", ""), n = parseInt(t.substr(0, 2), 16), s = parseInt(t.substr(2, 2), 16), r = parseInt(t.substr(4, 2), 16);
  return (n * 299 + s * 587 + r * 114) / 1e3 < 128;
}, Op = (e, t) => {
  const n = e.replace("#", ""), s = parseInt(n.substr(0, 2), 16), r = parseInt(n.substr(2, 2), 16), i = parseInt(n.substr(4, 2), 16), o = sr(e), a = o ? Math.min(255, s + t) : Math.max(0, s - t), l = o ? Math.min(255, r + t) : Math.max(0, r - t), u = o ? Math.min(255, i + t) : Math.max(0, i - t);
  return `#${a.toString(16).padStart(2, "0")}${l.toString(16).padStart(2, "0")}${u.toString(16).padStart(2, "0")}`;
}, br = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e), Lp = (e) => {
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
function Ua() {
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
var Fs = Ua();
function Xu(e) {
  Fs = e;
}
var Br = { exec: () => null };
function Ve(e, t = "") {
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
}, Np = /^(?:[ \t]*(?:\n|$))+/, Pp = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/, Mp = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, Xr = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, Dp = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, za = /(?:[*+-]|\d{1,9}[.)])/, Zu = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/, Ju = Ve(Zu).replace(/bull/g, za).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(), Fp = Ve(Zu).replace(/bull/g, za).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(), Ha = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/, $p = /^[^\n]+/, ja = /(?!\s*\])(?:\\.|[^\[\]\\])+/, Bp = Ve(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", ja).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), Up = Ve(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, za).getRegex(), uo = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", Wa = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, zp = Ve(
  "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))",
  "i"
).replace("comment", Wa).replace("tag", uo).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), Qu = Ve(Ha).replace("hr", Xr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", uo).getRegex(), Hp = Ve(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", Qu).getRegex(), qa = {
  blockquote: Hp,
  code: Pp,
  def: Bp,
  fences: Mp,
  heading: Dp,
  hr: Xr,
  html: zp,
  lheading: Ju,
  list: Up,
  newline: Np,
  paragraph: Qu,
  table: Br,
  text: $p
}, rc = Ve(
  "^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"
).replace("hr", Xr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", uo).getRegex(), jp = {
  ...qa,
  lheading: Fp,
  table: rc,
  paragraph: Ve(Ha).replace("hr", Xr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", rc).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", uo).getRegex()
}, Wp = {
  ...qa,
  html: Ve(
    `^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`
  ).replace("comment", Wa).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
  heading: /^(#{1,6})(.*)(?:\n+|$)/,
  fences: Br,
  // fences not supported
  lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  paragraph: Ve(Ha).replace("hr", Xr).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", Ju).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
}, qp = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, Vp = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, ef = /^( {2,}|\\)\n(?!\s*$)/, Kp = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, fo = /[\p{P}\p{S}]/u, Va = /[\s\p{P}\p{S}]/u, tf = /[^\s\p{P}\p{S}]/u, Gp = Ve(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, Va).getRegex(), nf = /(?!~)[\p{P}\p{S}]/u, Yp = /(?!~)[\s\p{P}\p{S}]/u, Xp = /(?:[^\s\p{P}\p{S}]|~)/u, Zp = /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g, sf = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/, Jp = Ve(sf, "u").replace(/punct/g, fo).getRegex(), Qp = Ve(sf, "u").replace(/punct/g, nf).getRegex(), rf = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", em = Ve(rf, "gu").replace(/notPunctSpace/g, tf).replace(/punctSpace/g, Va).replace(/punct/g, fo).getRegex(), tm = Ve(rf, "gu").replace(/notPunctSpace/g, Xp).replace(/punctSpace/g, Yp).replace(/punct/g, nf).getRegex(), nm = Ve(
  "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)",
  "gu"
).replace(/notPunctSpace/g, tf).replace(/punctSpace/g, Va).replace(/punct/g, fo).getRegex(), sm = Ve(/\\(punct)/, "gu").replace(/punct/g, fo).getRegex(), rm = Ve(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), im = Ve(Wa).replace("(?:-->|$)", "-->").getRegex(), om = Ve(
  "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>"
).replace("comment", im).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), Wi = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/, am = Ve(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", Wi).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), of = Ve(/^!?\[(label)\]\[(ref)\]/).replace("label", Wi).replace("ref", ja).getRegex(), af = Ve(/^!?\[(ref)\](?:\[\])?/).replace("ref", ja).getRegex(), lm = Ve("reflink|nolink(?!\\()", "g").replace("reflink", of).replace("nolink", af).getRegex(), Ka = {
  _backpedal: Br,
  // only used for GFM url
  anyPunctuation: sm,
  autolink: rm,
  blockSkip: Zp,
  br: ef,
  code: Vp,
  del: Br,
  emStrongLDelim: Jp,
  emStrongRDelimAst: em,
  emStrongRDelimUnd: nm,
  escape: qp,
  link: am,
  nolink: af,
  punctuation: Gp,
  reflink: of,
  reflinkSearch: lm,
  tag: om,
  text: Kp,
  url: Br
}, cm = {
  ...Ka,
  link: Ve(/^!?\[(label)\]\((.*?)\)/).replace("label", Wi).getRegex(),
  reflink: Ve(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", Wi).getRegex()
}, ha = {
  ...Ka,
  emStrongRDelimAst: tm,
  emStrongLDelim: Qp,
  url: Ve(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, "i").replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
  _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
}, um = {
  ...ha,
  br: Ve(ef).replace("{2,}", "*").getRegex(),
  text: Ve(ha.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
}, _i = {
  normal: qa,
  gfm: jp,
  pedantic: Wp
}, wr = {
  normal: Ka,
  gfm: ha,
  breaks: um,
  pedantic: cm
}, fm = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}, ic = (e) => fm[e];
function kn(e, t) {
  if (t) {
    if (Bt.escapeTest.test(e))
      return e.replace(Bt.escapeReplace, ic);
  } else if (Bt.escapeTestNoEncode.test(e))
    return e.replace(Bt.escapeReplaceNoEncode, ic);
  return e;
}
function oc(e) {
  try {
    e = encodeURI(e).replace(Bt.percentDecode, "%");
  } catch {
    return null;
  }
  return e;
}
function ac(e, t) {
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
function kr(e, t, n) {
  const s = e.length;
  if (s === 0)
    return "";
  let r = 0;
  for (; r < s && e.charAt(s - r - 1) === t; )
    r++;
  return e.slice(0, s - r);
}
function hm(e, t) {
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
function lc(e, t, n, s, r) {
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
function dm(e, t, n) {
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
var qi = class {
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
        text: this.options.pedantic ? n : kr(n, `
`)
      };
    }
  }
  fences(e) {
    const t = this.rules.block.fences.exec(e);
    if (t) {
      const n = t[0], s = dm(n, t[3] || "", this.rules);
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
        const w = this.lexer.state.top;
        if (this.lexer.state.top = !0, this.lexer.blockTokens(c, i, !0), this.lexer.state.top = w, n.length === 0)
          break;
        const A = i.at(-1);
        if ((A == null ? void 0 : A.type) === "code")
          break;
        if ((A == null ? void 0 : A.type) === "blockquote") {
          const I = A, O = I.raw + `
` + n.join(`
`), H = this.blockquote(O);
          i[i.length - 1] = H, s = s.substring(0, s.length - I.raw.length) + H.raw, r = r.substring(0, r.length - I.text.length) + H.text;
          break;
        } else if ((A == null ? void 0 : A.type) === "list") {
          const I = A, O = I.raw + `
` + n.join(`
`), H = this.list(O);
          i[i.length - 1] = H, s = s.substring(0, s.length - A.raw.length) + H.raw, r = r.substring(0, r.length - I.raw.length) + H.raw, n = O.substring(i.at(-1).raw.length).split(`
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
        let w = t[2].split(`
`, 1)[0].replace(this.rules.other.listReplaceTabs, (R) => " ".repeat(3 * R.length)), A = e.split(`
`, 1)[0], I = !w.trim(), O = 0;
        if (this.options.pedantic ? (O = 2, c = w.trimStart()) : I ? O = t[1].length + 1 : (O = t[2].search(this.rules.other.nonSpaceChar), O = O > 4 ? 1 : O, c = w.slice(O), O += t[1].length), I && this.rules.other.blankLine.test(A) && (u += A + `
`, e = e.substring(A.length + 1), l = !0), !l) {
          const R = this.rules.other.nextBulletRegex(O), fe = this.rules.other.hrRegex(O), _e = this.rules.other.fencesBeginRegex(O), x = this.rules.other.headingBeginRegex(O), M = this.rules.other.htmlBeginRegex(O);
          for (; e; ) {
            const S = e.split(`
`, 1)[0];
            let W;
            if (A = S, this.options.pedantic ? (A = A.replace(this.rules.other.listReplaceNesting, "  "), W = A) : W = A.replace(this.rules.other.tabCharGlobal, "    "), _e.test(A) || x.test(A) || M.test(A) || R.test(A) || fe.test(A))
              break;
            if (W.search(this.rules.other.nonSpaceChar) >= O || !A.trim())
              c += `
` + W.slice(O);
            else {
              if (I || w.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || _e.test(w) || x.test(w) || fe.test(w))
                break;
              c += `
` + A;
            }
            !I && !A.trim() && (I = !0), u += S + `
`, e = e.substring(S.length + 1), w = W.slice(O);
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
          const u = r.items[l].tokens.filter((w) => w.type === "space"), c = u.length > 0 && u.some((w) => this.rules.other.anyLine.test(w.raw));
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
    const n = ac(t[1]), s = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), r = (o = t[3]) != null && o.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
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
        i.rows.push(ac(a, i.header.length).map((l, u) => ({
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
        const i = hm(t[2], "()");
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
      return s = s.trim(), this.rules.other.startAngleBracket.test(s) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n) ? s = s.slice(1) : s = s.slice(1, -1)), lc(t, {
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
      return lc(n, r, n[0], this.lexer, this.rules);
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
        const w = [...s[0]][0].length, A = e.slice(0, i + s.index + w + a);
        if (Math.min(i, a) % 2) {
          const O = A.slice(1, -1);
          return {
            type: "em",
            raw: A,
            text: O,
            tokens: this.lexer.inlineTokens(O)
          };
        }
        const I = A.slice(2, -2);
        return {
          type: "strong",
          raw: A,
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
}, $n = class da {
  constructor(t) {
    tt(this, "tokens");
    tt(this, "options");
    tt(this, "state");
    tt(this, "tokenizer");
    tt(this, "inlineQueue");
    this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = t || Fs, this.options.tokenizer = this.options.tokenizer || new qi(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = {
      inLink: !1,
      inRawBlock: !1,
      top: !0
    };
    const n = {
      other: Bt,
      block: _i.normal,
      inline: wr.normal
    };
    this.options.pedantic ? (n.block = _i.pedantic, n.inline = wr.pedantic) : this.options.gfm && (n.block = _i.gfm, this.options.breaks ? n.inline = wr.breaks : n.inline = wr.gfm), this.tokenizer.rules = n;
  }
  /**
   * Expose Rules
   */
  static get rules() {
    return {
      block: _i,
      inline: wr
    };
  }
  /**
   * Static Lex Method
   */
  static lex(t, n) {
    return new da(n).lex(t);
  }
  /**
   * Static Lex Inline Method
   */
  static lexInline(t, n) {
    return new da(n).inlineTokens(t);
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
        let w;
        this.options.extensions.startBlock.forEach((A) => {
          w = A.call({ lexer: this }, c), typeof w == "number" && w >= 0 && (u = Math.min(u, w));
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
      if ((l = (a = this.options.extensions) == null ? void 0 : a.inline) != null && l.some((A) => (c = A.call({ lexer: this }, t, n)) ? (t = t.substring(c.raw.length), n.push(c), !0) : !1))
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
        const A = n.at(-1);
        c.type === "text" && (A == null ? void 0 : A.type) === "text" ? (A.raw += c.raw, A.text += c.text) : n.push(c);
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
      if ((u = this.options.extensions) != null && u.startInline) {
        let A = 1 / 0;
        const I = t.slice(1);
        let O;
        this.options.extensions.startInline.forEach((H) => {
          O = H.call({ lexer: this }, I), typeof O == "number" && O >= 0 && (A = Math.min(A, O));
        }), A < 1 / 0 && A >= 0 && (w = t.substring(0, A + 1));
      }
      if (c = this.tokenizer.inlineText(w)) {
        t = t.substring(c.raw.length), c.raw.slice(-1) !== "_" && (o = c.raw.slice(-1)), i = !0;
        const A = n.at(-1);
        (A == null ? void 0 : A.type) === "text" ? (A.raw += c.raw, A.text += c.text) : n.push(c);
        continue;
      }
      if (t) {
        const A = "Infinite loop on byte: " + t.charCodeAt(0);
        if (this.options.silent) {
          console.error(A);
          break;
        } else
          throw new Error(A);
      }
    }
    return n;
  }
}, Vi = class {
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
    const s = this.parser.parseInline(n), r = oc(e);
    if (r === null)
      return s;
    e = r;
    let i = '<a href="' + e + '"';
    return t && (i += ' title="' + kn(t) + '"'), i += ">" + s + "</a>", i;
  }
  image({ href: e, title: t, text: n, tokens: s }) {
    s && (n = this.parser.parseInline(s, this.parser.textRenderer));
    const r = oc(e);
    if (r === null)
      return kn(n);
    e = r;
    let i = `<img src="${e}" alt="${n}"`;
    return t && (i += ` title="${kn(t)}"`), i += ">", i;
  }
  text(e) {
    return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : kn(e.text);
  }
}, Ga = class {
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
}, Bn = class pa {
  constructor(t) {
    tt(this, "options");
    tt(this, "renderer");
    tt(this, "textRenderer");
    this.options = t || Fs, this.options.renderer = this.options.renderer || new Vi(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new Ga();
  }
  /**
   * Static Parse Method
   */
  static parse(t, n) {
    return new pa(n).parse(t);
  }
  /**
   * Static Parse Inline Method
   */
  static parseInline(t, n) {
    return new pa(n).parseInline(t);
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
}, Jo, Ci = (Jo = class {
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
    return this.block ? $n.lex : $n.lexInline;
  }
  /**
   * Provide function to parse tokens
   */
  provideParser() {
    return this.block ? Bn.parse : Bn.parseInline;
  }
}, tt(Jo, "passThroughHooks", /* @__PURE__ */ new Set([
  "preprocess",
  "postprocess",
  "processAllTokens"
])), Jo), pm = class {
  constructor(...e) {
    tt(this, "defaults", Ua());
    tt(this, "options", this.setOptions);
    tt(this, "parse", this.parseMarkdown(!0));
    tt(this, "parseInline", this.parseMarkdown(!1));
    tt(this, "Parser", Bn);
    tt(this, "Renderer", Vi);
    tt(this, "TextRenderer", Ga);
    tt(this, "Lexer", $n);
    tt(this, "Tokenizer", qi);
    tt(this, "Hooks", Ci);
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
        const r = this.defaults.renderer || new Vi(this.defaults);
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
        const r = this.defaults.tokenizer || new qi(this.defaults);
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
        const r = this.defaults.hooks || new Ci();
        for (const i in n.hooks) {
          if (!(i in r))
            throw new Error(`hook '${i}' does not exist`);
          if (["options", "block"].includes(i))
            continue;
          const o = i, a = n.hooks[o], l = r[o];
          Ci.passThroughHooks.has(i) ? r[o] = (u) => {
            if (this.defaults.async)
              return Promise.resolve(a.call(r, u)).then((w) => l.call(r, w));
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
        const s = "<p>An error occurred:</p><pre>" + kn(n.message + "", !0) + "</pre>";
        return t ? Promise.resolve(s) : s;
      }
      if (t)
        return Promise.reject(n);
      throw n;
    };
  }
}, Ms = new pm();
function He(e, t) {
  return Ms.parse(e, t);
}
He.options = He.setOptions = function(e) {
  return Ms.setOptions(e), He.defaults = Ms.defaults, Xu(He.defaults), He;
};
He.getDefaults = Ua;
He.defaults = Fs;
He.use = function(...e) {
  return Ms.use(...e), He.defaults = Ms.defaults, Xu(He.defaults), He;
};
He.walkTokens = function(e, t) {
  return Ms.walkTokens(e, t);
};
He.parseInline = Ms.parseInline;
He.Parser = Bn;
He.parser = Bn.parse;
He.Renderer = Vi;
He.TextRenderer = Ga;
He.Lexer = $n;
He.lexer = $n.lex;
He.Tokenizer = qi;
He.Hooks = Ci;
He.parse = He;
He.options;
He.setOptions;
He.use;
He.walkTokens;
He.parseInline;
Bn.parse;
$n.lex;
/*! @license DOMPurify 3.4.15 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.15/LICENSE */
function cc(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function mm(e) {
  if (Array.isArray(e)) return e;
}
function gm(e, t) {
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
function _m() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ym(e, t) {
  return mm(e) || gm(e, t) || vm(e, t) || _m();
}
function vm(e, t) {
  if (e) {
    if (typeof e == "string") return cc(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? cc(e, t) : void 0;
  }
}
const lf = Object.entries, uc = Object.setPrototypeOf, bm = Object.isFrozen, wm = Object.getPrototypeOf, km = Object.getOwnPropertyDescriptor;
let bt = Object.freeze, Tt = Object.seal, Zs = Object.create, cf = typeof Reflect < "u" && Reflect, ma = cf.apply, ga = cf.construct;
bt || (bt = function(t) {
  return t;
});
Tt || (Tt = function(t) {
  return t;
});
ma || (ma = function(t, n) {
  for (var s = arguments.length, r = new Array(s > 2 ? s - 2 : 0), i = 2; i < s; i++)
    r[i - 2] = arguments[i];
  return t.apply(n, r);
});
ga || (ga = function(t) {
  for (var n = arguments.length, s = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
    s[r - 1] = arguments[r];
  return new t(...s);
});
const Os = _t(Array.prototype.forEach), Tm = _t(Array.prototype.lastIndexOf), fc = _t(Array.prototype.pop), Tr = _t(Array.prototype.push), Am = _t(Array.prototype.splice), rr = Array.isArray, Rr = _t(String.prototype.toLowerCase), $o = _t(String.prototype.toString), hc = _t(String.prototype.match), Ar = _t(String.prototype.replace), dc = _t(String.prototype.indexOf), Sm = _t(String.prototype.trim), Em = _t(Number.prototype.toString), xm = _t(Boolean.prototype.toString), pc = typeof BigInt > "u" ? null : _t(BigInt.prototype.toString), mc = typeof Symbol > "u" ? null : _t(Symbol.prototype.toString), jt = _t(Object.prototype.hasOwnProperty), Sr = _t(Object.prototype.toString), Ct = _t(RegExp.prototype.test), Cs = Cm(TypeError);
function _t(e) {
  return function(t) {
    t instanceof RegExp && (t.lastIndex = 0);
    for (var n = arguments.length, s = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
      s[r - 1] = arguments[r];
    return ma(e, t, s);
  };
}
function Cm(e) {
  return function() {
    for (var t = arguments.length, n = new Array(t), s = 0; s < t; s++)
      n[s] = arguments[s];
    return ga(e, n);
  };
}
function Fe(e, t) {
  let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : Rr;
  if (uc && uc(e, null), !rr(t))
    return e;
  let s = t.length;
  for (; s--; ) {
    let r = t[s];
    if (typeof r == "string") {
      const i = n(r);
      i !== r && (bm(t) || (t[s] = i), r = i);
    }
    e[r] = !0;
  }
  return e;
}
function Rm(e) {
  for (let t = 0; t < e.length; t++)
    jt(e, t) || (e[t] = null);
  return e;
}
function Jt(e) {
  const t = Zs(null);
  for (const s of lf(e)) {
    var n = ym(s, 2);
    const r = n[0], i = n[1];
    jt(e, r) && (rr(i) ? t[r] = Rm(i) : i && typeof i == "object" && i.constructor === Object ? t[r] = Jt(i) : t[r] = i);
  }
  return t;
}
function Im(e) {
  switch (typeof e) {
    case "string":
      return e;
    case "number":
      return Em(e);
    case "boolean":
      return xm(e);
    case "bigint":
      return pc ? pc(e) : "0";
    case "symbol":
      return mc ? mc(e) : "Symbol()";
    case "undefined":
      return Sr(e);
    case "function":
    case "object": {
      if (e === null)
        return Sr(e);
      const t = e, n = on(t, "toString");
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
function on(e, t) {
  for (; e !== null; ) {
    const s = km(e, t);
    if (s) {
      if (s.get)
        return _t(s.get);
      if (typeof s.value == "function")
        return _t(s.value);
    }
    e = wm(e);
  }
  function n() {
    return null;
  }
  return n;
}
function Om(e) {
  try {
    return Ct(e, ""), !0;
  } catch {
    return !1;
  }
}
const gc = bt(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]), Bo = bt(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "enterkeyhint", "exportparts", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "inputmode", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "part", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]), Uo = bt(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]), Lm = bt(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]), zo = bt(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]), Nm = bt(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]), _c = bt(["#text"]), yc = bt(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "command", "commandfor", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "exportparts", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inert", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "part", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "slot", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns"]), Ho = bt(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dominant-baseline", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "mask-type", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "pointer-events", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-orientation", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "vector-effect", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]), vc = bt(["accent", "accentunder", "align", "bevelled", "close", "columnalign", "columnlines", "columnspacing", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lquote", "lspace", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]), yi = bt(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]), Pm = Tt(/{{[\w\W]*|^[\w\W]*}}/g), Mm = Tt(/<%[\w\W]*|^[\w\W]*%>/g), Dm = Tt(/\${[\w\W]*/g), Fm = Tt(/^data-[\-\w.\u00B7-\uFFFF]+$/), $m = Tt(/^aria-[\-\w]+$/), bc = Tt(
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  // eslint-disable-line no-useless-escape
), Bm = Tt(/^(?:\w+script|data):/i), Um = Tt(
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g
  // eslint-disable-line no-control-regex
), zm = Tt(/^html$/i), Hm = Tt(/^[a-z][.\w]*(-[.\w]+)+$/i), wc = Tt(/<[/\w!]/g), kc = Tt(/<[/\w]/g), jm = Tt(/<\/no(script|embed|frames)/i), Wm = Tt(/\/>/i), Xt = {
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
}, uf = ["style", "script", "xmp", "iframe", "noembed", "noframes", "plaintext", "noscript"], qm = bt(Fe({}, uf)), Vm = function() {
  const e = {};
  return Os(uf, (t) => {
    e[t] = Tt(new RegExp("</" + t + "(?=[\\t\\n\\f\\r />])", "i"));
  }), bt(e);
}(), Km = function() {
  return typeof window > "u" ? null : window;
}, Gm = function(t, n) {
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
}, Tc = function() {
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
}, rs = function(t, n, s, r) {
  return jt(t, n) && rr(t[n]) ? Fe(r.base ? Jt(r.base) : {}, t[n], r.transform) : s;
}, jo = function(t, n, s) {
  const r = jt(t, n) ? t[n] : void 0;
  return r && typeof r == "object" ? Jt(r) : s();
};
function ff() {
  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : Km();
  const t = (G) => ff(G);
  if (t.version = "3.4.15", t.removed = [], !e || !e.document || e.document.nodeType !== Xt.document || !e.Element)
    return t.isSupported = !1, t;
  let n = e.document;
  const s = n, r = s.currentScript;
  e.DocumentFragment;
  const i = e.HTMLTemplateElement, o = e.Node, a = e.Element, l = e.NodeFilter, u = e.NamedNodeMap;
  u === void 0 && (e.NamedNodeMap || e.MozNamedAttrMap), e.HTMLFormElement;
  const c = e.DOMParser, w = e.trustedTypes, A = a.prototype, I = on(A, "cloneNode"), O = on(A, "remove"), H = on(A, "removeAttributeNode"), ue = on(A, "nextSibling"), R = on(A, "childNodes"), fe = on(A, "parentNode"), _e = on(A, "shadowRoot"), x = on(A, "attributes"), M = o && o.prototype ? on(o.prototype, "nodeType") : null, S = o && o.prototype ? on(o.prototype, "nodeName") : null, W = o && o.prototype ? on(o.prototype, "ownerDocument") : null, se = function(d) {
    return M ? M(d) : d.nodeType;
  }, me = function(d) {
    return S ? S(d) : d.nodeName;
  };
  if (typeof i == "function") {
    const G = n.createElement("template");
    G.content && G.content.ownerDocument && (n = G.content.ownerDocument);
  }
  let ge, Oe = "", Se, Ke = !1, Ue = 0;
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
    return Ke || (Se = Gm(w, r), Ke = !0), Se;
  }, Ze = n, Je = Ze.implementation, lt = Ze.createNodeIterator, je = Ze.createDocumentFragment, Lt = Ze.getElementsByTagName, _n = s.importNode;
  let Me = Tc();
  t.isSupported = typeof lf == "function" && typeof fe == "function" && Je && Je.createHTMLDocument !== void 0;
  const wt = Pm, Ut = Mm, Wt = Dm, qt = Fm, Nt = $m, yn = Bm, _ = Um, v = Hm;
  let L = bc, D = null;
  const U = Fe({}, [...gc, ...Bo, ...Uo, ...zo, ..._c]);
  let P = null;
  const X = Fe({}, [...yc, ...Ho, ...vc, ...yi]);
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
  let J = !0, Q = !0, pe = !1, de = !0, be = !1, ke = !0, De = !1, $ = !1, z = null, f = null, y = !1, N = !1, C = !1, q = !1, ne = !0, ie = !1;
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
  let qn = null;
  const Zr = Fe({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), zt = "http://www.w3.org/1998/Math/MathML", Pt = "http://www.w3.org/2000/svg", Vt = "http://www.w3.org/1999/xhtml";
  let At = Vt, Vn = !1, Kn = null;
  const gs = Fe({}, [zt, Pt, Vt], $o), Jr = bt(["mi", "mo", "mn", "ms", "mtext"]);
  let Rn = Fe({}, Jr);
  const hn = bt(["annotation-xml"]);
  let Kt = Fe({}, hn);
  const Qr = Fe({}, ["title", "style", "font", "a", "script"]);
  let ft = null;
  const mo = ["application/xhtml+xml", "text/html"], ei = "text/html";
  let $e = null, Gn = null;
  const _s = n.createElement("form"), Bs = function(d) {
    return d instanceof RegExp || d instanceof Function;
  }, lr = function() {
    let d = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (Gn && Gn === d)
      return;
    (!d || typeof d != "object") && (d = {}), d = Jt(d), ft = // eslint-disable-next-line unicorn/prefer-includes
    mo.indexOf(d.PARSER_MEDIA_TYPE) === -1 ? ei : d.PARSER_MEDIA_TYPE, $e = ft === "application/xhtml+xml" ? $o : Rr, D = rs(d, "ALLOWED_TAGS", U, {
      transform: $e
    }), P = rs(d, "ALLOWED_ATTR", X, {
      transform: $e
    }), Kn = rs(d, "ALLOWED_NAMESPACES", gs, {
      transform: $o
    }), qn = rs(d, "ADD_URI_SAFE_ATTR", Zr, {
      transform: $e,
      base: Zr
    }), fn = rs(d, "ADD_DATA_URI_TAGS", $s, {
      transform: $e,
      base: $s
    }), Qe = rs(d, "FORBID_CONTENTS", rt, {
      transform: $e
    }), K = rs(d, "FORBID_TAGS", Jt({}), {
      transform: $e
    }), j = rs(d, "FORBID_ATTR", Jt({}), {
      transform: $e
    }), Le = jt(d, "USE_PROFILES") ? d.USE_PROFILES && typeof d.USE_PROFILES == "object" ? Jt(d.USE_PROFILES) : d.USE_PROFILES : !1, J = d.ALLOW_ARIA_ATTR !== !1, Q = d.ALLOW_DATA_ATTR !== !1, pe = d.ALLOW_UNKNOWN_PROTOCOLS || !1, de = d.ALLOW_SELF_CLOSE_IN_ATTR !== !1, be = d.SAFE_FOR_TEMPLATES || !1, ke = d.SAFE_FOR_XML !== !1, De = d.WHOLE_DOCUMENT || !1, N = d.RETURN_DOM || !1, C = d.RETURN_DOM_FRAGMENT || !1, q = d.RETURN_TRUSTED_TYPE || !1, y = d.FORCE_BODY || !1, ne = d.SANITIZE_DOM !== !1, ie = d.SANITIZE_NAMED_PROPS || !1, Ie = d.KEEP_CONTENT !== !1, ze = d.IN_PLACE || !1, L = Om(d.ALLOWED_URI_REGEXP) ? d.ALLOWED_URI_REGEXP : bc, At = typeof d.NAMESPACE == "string" ? d.NAMESPACE : Vt, Rn = jo(
      d,
      "MATHML_TEXT_INTEGRATION_POINTS",
      () => Fe({}, Jr)
      // Default built-in map
    ), Kt = jo(
      d,
      "HTML_INTEGRATION_POINTS",
      () => Fe({}, hn)
      // Default built-in map
    );
    const T = jo(d, "CUSTOM_ELEMENT_HANDLING", () => Zs(null));
    if (V = Zs(null), jt(T, "tagNameCheck") && Bs(T.tagNameCheck) && (V.tagNameCheck = T.tagNameCheck), jt(T, "attributeNameCheck") && Bs(T.attributeNameCheck) && (V.attributeNameCheck = T.attributeNameCheck), jt(T, "allowCustomizedBuiltInElements") && typeof T.allowCustomizedBuiltInElements == "boolean" && (V.allowCustomizedBuiltInElements = T.allowCustomizedBuiltInElements), Tt(V), be && (Q = !1), C && (N = !0), Le && (D = Fe({}, _c), P = Zs(null), Le.html === !0 && (Fe(D, gc), Fe(P, yc)), Le.svg === !0 && (Fe(D, Bo), Fe(P, Ho), Fe(P, yi)), Le.svgFilters === !0 && (Fe(D, Uo), Fe(P, Ho), Fe(P, yi)), Le.mathMl === !0 && (Fe(D, zo), Fe(P, vc), Fe(P, yi))), re.tagCheck = null, re.attributeCheck = null, jt(d, "ADD_TAGS") && (typeof d.ADD_TAGS == "function" ? re.tagCheck = d.ADD_TAGS : rr(d.ADD_TAGS) && (D === U && (D = Jt(D)), Fe(D, d.ADD_TAGS, $e))), jt(d, "ADD_ATTR") && (typeof d.ADD_ATTR == "function" ? re.attributeCheck = d.ADD_ATTR : rr(d.ADD_ATTR) && (P === X && (P = Jt(P)), Fe(P, d.ADD_ATTR, $e))), jt(d, "ADD_FORBID_CONTENTS") && rr(d.ADD_FORBID_CONTENTS) && (Qe === rt && (Qe = Jt(Qe)), Fe(Qe, d.ADD_FORBID_CONTENTS, $e)), Ie && (D["#text"] = !0), De && Fe(D, ["html", "head", "body"]), D.table && (Fe(D, ["tbody"]), delete K.tbody), d.TRUSTED_TYPES_POLICY) {
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
    bt && bt(d), Gn = d;
  }, ys = Fe({}, [...Bo, ...Uo, ...Lm]), cr = Fe({}, [...zo, ...Nm]), ti = function(d, T, B) {
    return T.namespaceURI === Vt ? d === "svg" : T.namespaceURI === zt ? d === "svg" && (B === "annotation-xml" || Rn[B]) : !!ys[d];
  }, ni = function(d, T, B) {
    return T.namespaceURI === Vt ? d === "math" : T.namespaceURI === Pt ? d === "math" && Kt[B] : !!cr[d];
  }, si = function(d, T, B) {
    return T.namespaceURI === Pt && !Kt[B] || T.namespaceURI === zt && !Rn[B] ? !1 : !cr[d] && (Qr[d] || !ys[d]);
  }, ri = function(d) {
    let T = fe(d);
    (!T || !T.tagName) && (T = {
      namespaceURI: At,
      tagName: "template"
    });
    const B = Rr(d.tagName), ee = Rr(T.tagName);
    return Kn[d.namespaceURI] ? d.namespaceURI === Pt ? ti(B, T, ee) : d.namespaceURI === zt ? ni(B, T, ee) : d.namespaceURI === Vt ? si(B, T, ee) : !!(ft === "application/xhtml+xml" && Kn[d.namespaceURI]) : !1;
  }, dn = function(d) {
    Tr(t.removed, {
      element: d
    });
    try {
      fe(d).removeChild(d);
    } catch {
      if (O(d), !fe(d))
        throw Cs("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place");
    }
  }, ii = function(d, T, B) {
    try {
      H(d, T);
    } catch {
      try {
        d.removeAttribute(B);
      } catch {
      }
    }
  }, Yn = function(d) {
    vs(d);
    const T = R(d);
    if (T) {
      const ee = [];
      Os(T, (le) => {
        Tr(ee, le);
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
        typeof ve == "string" && ii(d, le, ve);
      }
  }, en = function(d, T, B) {
    if (!B)
      try {
        B = T.getAttributeNode(d);
      } catch {
        B = null;
      }
    Tr(t.removed, {
      attribute: B || null,
      from: T
    });
    try {
      B ? H(T, B) : T.removeAttribute(d);
    } catch {
      try {
        T.removeAttribute(d);
      } catch {
      }
    }
    if (d === "is")
      if (N || C)
        try {
          dn(T);
        } catch {
        }
      else
        try {
          T.setAttribute(d, "");
        } catch {
        }
  }, oi = function(d) {
    const T = x(d);
    if (T)
      for (let B = T.length - 1; B >= 0; --B) {
        const ee = T[B], le = ee && ee.name;
        typeof le != "string" || P[$e(le)] || ii(d, ee, le);
      }
  }, vs = function(d) {
    const T = [d];
    for (; T.length > 0; ) {
      const B = T.pop();
      se(B) === Xt.element && oi(B);
      const le = R(B);
      if (le)
        for (let ve = le.length - 1; ve >= 0; --ve)
          T.push(le[ve]);
    }
  }, vn = function(d, T) {
    return ke ? d === "patchsrc" ? !0 : d === "for" && T !== "label" && T !== "output" : !1;
  }, bs = function(d) {
    if (!ke)
      return;
    const T = [d];
    for (; T.length > 0; ) {
      const B = T.pop(), ee = se(B);
      if (ee === Xt.processingInstruction || ee === Xt.comment && Ct(kc, B.data)) {
        try {
          O(B);
        } catch {
        }
        continue;
      }
      if (ee === Xt.element) {
        const ve = B, Ge = $e(me(B));
        try {
          ve.hasAttribute && ve.hasAttribute("patchsrc") && ve.removeAttribute("patchsrc"), ve.hasAttribute && ve.hasAttribute("for") && vn("for", Ge) && ve.removeAttribute("for");
        } catch {
        }
      }
      const le = R(B);
      if (le)
        for (let ve = le.length - 1; ve >= 0; --ve)
          T.push(le[ve]);
    }
  }, Us = function(d) {
    let T = null, B = null;
    if (y)
      d = "<remove></remove>" + d;
    else {
      const ve = hc(d, /^[\r\n\t ]+/);
      B = ve && ve[0];
    }
    ft === "application/xhtml+xml" && At === Vt && (d = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + d + "</body></html>");
    const ee = ge ? he(d) : d;
    if (At === Vt)
      try {
        T = new c().parseFromString(ee, ft);
      } catch {
      }
    if (!T || !T.documentElement) {
      T = Je.createDocument(At, "template", null);
      try {
        T.documentElement.innerHTML = Vn ? Oe : ee;
      } catch {
      }
    }
    const le = T.body || T.documentElement;
    return d && B && le.insertBefore(n.createTextNode(B), le.childNodes[0] || null), At === Vt ? Lt.call(T, De ? "html" : "body")[0] : De ? T.documentElement : le;
  }, zs = function(d) {
    const T = W ? W(d) : d.ownerDocument;
    return lt.call(
      T || d,
      d,
      // eslint-disable-next-line no-bitwise
      l.SHOW_ELEMENT | l.SHOW_COMMENT | l.SHOW_TEXT | l.SHOW_PROCESSING_INSTRUCTION | l.SHOW_CDATA_SECTION,
      null
    );
  }, In = function(d) {
    return d = Ar(d, wt, " "), d = Ar(d, Ut, " "), d = Ar(d, Wt, " "), d;
  }, tn = function(d) {
    var T;
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
    const ve = (T = d.querySelectorAll) === null || T === void 0 ? void 0 : T.call(d, "template");
    ve && Os(ve, (Ge) => {
      pn(Ge.content) && tn(Ge.content);
    });
  }, Xn = function(d) {
    const T = S ? S(d) : null;
    return typeof T != "string" || $e(T) !== "form" ? !1 : typeof d.nodeName != "string" || typeof d.textContent != "string" || typeof d.removeChild != "function" || // Realm-safe NamedNodeMap detection: equality against the cached
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
  }, Zn = function(d) {
    if (!M || typeof d != "object" || d === null)
      return !1;
    try {
      return typeof M(d) == "number";
    } catch {
      return !1;
    }
  };
  function kt(G, d, T) {
    G.length !== 0 && Os(G, (B) => {
      B.call(t, d, T, Gn);
    });
  }
  const go = function(d, T) {
    return !!(ke && d.hasChildNodes() && !Zn(d.firstElementChild) && Ct(wc, d.textContent) && Ct(wc, d.innerHTML) || ke && d.namespaceURI === Vt && qm[T] && (Zn(d.firstElementChild) || typeof d.textContent == "string" && Ct(Vm[T], d.textContent)) || d.nodeType === Xt.processingInstruction || ke && d.nodeType === Xt.comment && Ct(kc, d.data));
  }, bn = function(d, T) {
    if (d instanceof RegExp)
      return Ct(d, T);
    if (d instanceof Function) {
      for (var B = arguments.length, ee = new Array(B > 2 ? B - 2 : 0), le = 2; le < B; le++)
        ee[le - 2] = arguments[le];
      return !!d(T, ...ee);
    }
    return !1;
  }, ai = function(d, T, B) {
    if (!K[T] && Gt(T) && bn(V.tagNameCheck, T))
      return !1;
    if (Ie && !Qe[T]) {
      const ee = fe(d), le = R(d);
      if (le && ee) {
        const ve = le.length;
        for (let Ge = ve - 1; Ge >= 0; --Ge) {
          const ot = d === B ? I(le[Ge], !0) : le[Ge];
          ee.insertBefore(ot, ue(d));
        }
      }
    }
    return dn(d), !0;
  }, li = function(d, T, B, ee) {
    return d.length === 0 ? T : T === B || T === ee ? Jt(T) : T;
  }, ur = function(d, T) {
    return d === T || fe(d) !== null ? !1 : (ze && vs(d), !0);
  }, ws = function(d, T) {
    if (kt(Me.beforeSanitizeElements, d, null), ur(d, T))
      return !0;
    if (Xn(d))
      return dn(d), !0;
    const B = $e(me(d));
    if (D = li(Me.uponSanitizeElement, D, U, z), kt(Me.uponSanitizeElement, d, {
      tagName: B,
      allowedTags: D
    }), ur(d, T))
      return !0;
    if (go(d, B))
      return dn(d), !0;
    if (K[B] || !(re.tagCheck instanceof Function && re.tagCheck(B)) && !D[B]) {
      const le = ai(d, B, T);
      return le === !1 && kt(Me.afterSanitizeElements, d, null), le;
    }
    if (se(d) === Xt.element && !ri(d) || (B === "noscript" || B === "noembed" || B === "noframes") && Ct(jm, d.innerHTML))
      return dn(d), !0;
    if (be && d.nodeType === Xt.text) {
      const le = In(d.textContent);
      d.textContent !== le && (Tr(t.removed, {
        element: d.cloneNode()
      }), d.textContent = le);
    }
    return kt(Me.afterSanitizeElements, d, null), !1;
  }, Hs = function(d, T, B) {
    if (j[T] || vn(T, d) || ne && (T === "id" || T === "name") && (B in n || B in _s))
      return !1;
    const ee = P[T] || re.attributeCheck instanceof Function && re.attributeCheck(T, d);
    return Q && Ct(qt, T) || J && Ct(Nt, T) ? !0 : ee ? qn[T] || Ct(L, Ar(B, _, "")) || (T === "src" || T === "xlink:href" || T === "href") && d !== "script" && dc(B, "data:") === 0 && fn[d] || pe && !Ct(yn, Ar(B, _, "")) ? !0 : !B : (
      // Condition a) covers a basically valid custom element tag name whose
      // tag passes the configured tagNameCheck and whose attribute name
      // passes the configured attributeNameCheck ...
      Gt(d) && bn(V.tagNameCheck, d) && bn(V.attributeNameCheck, T, d) || // Condition b) covers an `is` attribute whose value passes the
      // configured tagNameCheck while customized built-in elements are
      // allowed.
      T === "is" && V.allowCustomizedBuiltInElements && bn(V.tagNameCheck, B)
    );
  }, nn = Fe({}, ["annotation-xml", "color-profile", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "missing-glyph"]), Gt = function(d) {
    return !nn[Rr(d)] && Ct(v, d);
  }, ht = function(d, T, B, ee) {
    if (ge && typeof w == "object" && typeof w.getAttributeType == "function" && !B)
      switch (w.getAttributeType(d, T)) {
        case "TrustedHTML":
          return he(ee);
        case "TrustedScriptURL":
          return Te(ee);
      }
    return ee;
  }, yt = function(d, T, B, ee) {
    try {
      return B ? d.setAttributeNS(B, T, ee) : d.setAttribute(T, ee), Xn(d) ? (dn(d), !1) : !0;
    } catch {
      return en(T, d), !1;
    }
  }, ut = function(d) {
    kt(Me.beforeSanitizeAttributes, d, null);
    const T = d.attributes;
    if (!T || Xn(d))
      return;
    P = li(Me.uponSanitizeAttribute, P, X, f);
    const B = {
      attrName: "",
      attrValue: "",
      keepAttr: !0,
      allowedAttributes: P,
      forceKeepAttr: void 0
    };
    let ee = T.length;
    const le = $e(d.nodeName);
    for (; ee--; ) {
      const ve = T[ee], Ge = ve.name, ot = ve.namespaceURI, Et = ve.value, xt = $e(Ge), fr = Et;
      let We = Ge === "value" ? fr : Sm(fr), ci = !1;
      if (B.attrName = xt, B.attrValue = We, B.keepAttr = !0, B.forceKeepAttr = void 0, kt(Me.uponSanitizeAttribute, d, B), We = B.attrValue, ie && (xt === "id" || xt === "name") && dc(We, Ee) !== 0 && (en(Ge, d, ve), We = Ee + We, ci = !0), ke && Ct(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, We)) {
        en(Ge, d, ve);
        continue;
      }
      if (xt === "attributename" && hc(We, "href")) {
        en(Ge, d, ve);
        continue;
      }
      if (!B.forceKeepAttr) {
        if (!B.keepAttr) {
          en(Ge, d, ve);
          continue;
        }
        if (!de && Ct(Wm, We)) {
          en(Ge, d, ve);
          continue;
        }
        if (be && (We = In(We)), !Hs(le, xt, We)) {
          en(Ge, d, ve);
          continue;
        }
        We = ht(le, xt, ot, We), We !== fr && yt(d, Ge, ot, We) && ci && fc(t.removed);
      }
    }
    kt(Me.afterSanitizeAttributes, d, null);
  }, sn = function(d) {
    let T = null;
    const B = zs(d);
    for (kt(Me.beforeSanitizeShadowDOM, d, null); T = B.nextNode(); )
      if (kt(Me.uponSanitizeShadowNode, T, null), ws(T, d), ut(T), pn(T.content) && sn(T.content), se(T) === Xt.element) {
        const ee = _e(T);
        pn(ee) && (On(ee), sn(ee));
      }
    kt(Me.afterSanitizeShadowDOM, d, null);
  }, On = function(d) {
    const T = [{
      node: d,
      shadow: null
    }];
    for (; T.length > 0; ) {
      const B = T.pop();
      if (B.shadow) {
        sn(B.shadow);
        continue;
      }
      const ee = B.node, ve = se(ee) === Xt.element, Ge = R(ee);
      if (Ge)
        for (let ot = Ge.length - 1; ot >= 0; --ot)
          T.push({
            node: Ge[ot],
            shadow: null
          });
      if (ve) {
        const ot = S ? S(ee) : null;
        if (typeof ot == "string" && $e(ot) === "template") {
          const Et = ee.content;
          pn(Et) && T.push({
            node: Et,
            shadow: null
          });
        }
      }
      if (ve) {
        const ot = _e(ee);
        pn(ot) && T.push({
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
    let d = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, T = null, B = null, ee = null, le = null;
    if (Vn = !G, Vn && (G = "<!-->"), typeof G != "string" && !Zn(G) && (G = Im(G), typeof G != "string"))
      throw Cs("dirty is not a string, aborting");
    if (!t.isSupported)
      return G;
    $ ? (D = z, P = f) : lr(d), (Me.uponSanitizeElement.length > 0 || Me.uponSanitizeAttribute.length > 0) && (D = Jt(D)), Me.uponSanitizeAttribute.length > 0 && (P = Jt(P)), t.removed = [];
    const ve = ze && typeof G != "string" && Zn(G);
    if (ve) {
      bs(G);
      const Et = me(G);
      if (typeof Et == "string") {
        const xt = $e(Et);
        if (!D[xt] || K[xt])
          throw Yn(G), Cs("root node is forbidden and cannot be sanitized in-place");
      }
      if (Xn(G))
        throw Yn(G), Cs("root node is clobbered and cannot be sanitized in-place");
      try {
        On(G);
      } catch (xt) {
        throw Yn(G), xt;
      }
    } else if (Zn(G))
      T = Us("<!---->"), B = T.ownerDocument.importNode(G, !0), B.nodeType === Xt.element && B.nodeName === "BODY" || B.nodeName === "HTML" ? T = B : T.appendChild(B), On(T);
    else {
      if (!N && !be && !De && // eslint-disable-next-line unicorn/prefer-includes
      G.indexOf("<") === -1)
        return ge && q ? he(G) : G;
      if (T = Us(G), !T)
        return N ? null : q ? Oe : "";
    }
    T && y && dn(T.firstChild);
    const Ge = ve ? G : T;
    try {
      const Et = zs(Ge);
      for (; ee = Et.nextNode(); )
        ws(ee, Ge), ut(ee), pn(ee.content) && sn(ee.content);
    } catch (Et) {
      throw ve && (Yn(G), Os(t.removed, (xt) => {
        xt.element && vs(xt.element);
      })), Et;
    }
    if (ve)
      return Os(t.removed, (Et) => {
        Et.element && vs(Et.element);
      }), be && tn(G), G;
    if (N) {
      if (be && tn(T), C)
        for (le = je.call(T.ownerDocument); T.firstChild; )
          le.appendChild(T.firstChild);
      else
        le = T;
      return (P.shadowroot || P.shadowrootmode) && (le = _n.call(s, le, !0)), le;
    }
    let ot = De ? T.outerHTML : T.innerHTML;
    return De && D["!doctype"] && T.ownerDocument && T.ownerDocument.doctype && T.ownerDocument.doctype.name && Ct(zm, T.ownerDocument.doctype.name) && (ot = "<!DOCTYPE " + T.ownerDocument.doctype.name + `>
` + ot), be && (ot = In(ot)), ge && q ? he(ot) : ot;
  }, t.setConfig = function() {
    let G = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    lr(G), $ = !0, z = D, f = P;
  }, t.clearConfig = function() {
    Gn = null, $ = !1, z = null, f = null, ge = Se, Oe = "";
  }, t.isValidAttribute = function(G, d, T) {
    Gn || lr({});
    const B = $e(G), ee = $e(d);
    return Hs(B, ee, T);
  }, t.addHook = function(G, d) {
    typeof d == "function" && jt(Me, G) && Tr(Me[G], d);
  }, t.removeHook = function(G, d) {
    if (jt(Me, G)) {
      if (d !== void 0) {
        const T = Tm(Me[G], d);
        return T === -1 ? void 0 : Am(Me[G], T, 1)[0];
      }
      return fc(Me[G]);
    }
  }, t.removeHooks = function(G) {
    jt(Me, G) && (Me[G] = []);
  }, t.removeAllHooks = function() {
    Me = Tc();
  }, t;
}
var Ya = ff();
Ya.addHook("uponSanitizeElement", (e, t) => {
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
Ya.addHook("afterSanitizeAttributes", (e) => {
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
function Ym(e) {
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
  return Ya.sanitize(e, t);
}
He.setOptions({
  renderer: new He.Renderer(),
  gfm: !0,
  breaks: !0
});
const Ri = (e) => Ym(He(e || "")), Ac = "*", Xm = /* @__PURE__ */ new Set(["null", "about:blank", ""]);
let an = null;
const Ur = (e) => e && !Xm.has(e) ? e : null, Zm = (e) => {
  if (!e) return null;
  try {
    return Ur(new URL(e).origin);
  } catch {
    return null;
  }
};
function hf() {
  if (an) return an;
  if (window.parent === window)
    return an = Ur(window.location.origin) || Ac, an;
  try {
    const e = Ur(window.parent.location.origin);
    if (e)
      return an = e, an;
  } catch {
  }
  try {
    const e = window.location.ancestorOrigins, t = e && e.length ? Ur(e[0]) : null;
    if (t)
      return an = t, an;
  } catch {
  }
  return an = Zm(document.referrer) || Ac, an;
}
function Sc(e) {
  an = Ur(e) || an;
}
function vt(e) {
  window.parent.postMessage(e, hf());
}
const Ki = "Start a new chat", Ec = "Start a new chat? This ends the current one.", Jm = "Start new chat", Qm = "Cancel", xc = "Couldn't start a new chat. Please try again.", eg = 15e3, tg = ["aria-label"], ng = { class: "new-chat-confirm__question" }, sg = { class: "new-chat-confirm__actions" }, rg = ["disabled"], ig = ["disabled"], og = /* @__PURE__ */ Hn({
  __name: "NewChatConfirm",
  props: {
    error: {},
    busy: { type: Boolean }
  },
  emits: ["confirm", "cancel"],
  setup(e, { emit: t }) {
    const n = t;
    return (s, r) => (b(), k("div", {
      class: "new-chat-confirm",
      role: "alertdialog",
      "aria-live": "polite",
      "aria-label": E(Ec)
    }, [
      g("p", ng, Z(s.error || E(Ec)), 1),
      g("div", sg, [
        g("button", {
          type: "button",
          class: "new-chat-confirm__button",
          disabled: s.busy,
          onClick: r[0] || (r[0] = (i) => n("cancel"))
        }, Z(E(Qm)), 9, rg),
        g("button", {
          type: "button",
          class: "new-chat-confirm__button new-chat-confirm__button--primary",
          disabled: s.busy,
          onClick: r[1] || (r[1] = (i) => n("confirm"))
        }, Z(E(Jm)), 9, ig)
      ])
    ], 8, tg));
  }
}), Wn = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [s, r] of t)
    n[s] = r;
  return n;
}, df = /* @__PURE__ */ Wn(og, [["__scopeId", "data-v-6c78f353"]]), ag = { class: "askai" }, lg = { class: "askai__bar" }, cg = ["value", "placeholder", "disabled", "aria-label", "onKeydown"], ug = ["disabled", "title", "aria-label", "aria-expanded"], fg = { class: "askai__intro" }, hg = { class: "askai__title" }, dg = {
  key: 0,
  class: "askai__subtitle"
}, pg = {
  key: 0,
  class: "askai__suggestions"
}, mg = ["disabled", "onClick"], gg = ["aria-live"], _g = {
  key: 0,
  class: "askai__question"
}, yg = {
  key: 1,
  class: "askai__system"
}, vg = ["innerHTML"], bg = {
  key: 0,
  class: "askai__sources"
}, wg = ["title"], kg = {
  key: 0,
  class: "askai__thinking",
  role: "status",
  "aria-live": "polite"
}, Tg = { class: "askai__thinking-text" }, Ag = {
  key: 1,
  class: "askai__foot"
}, Sg = { key: 0 }, Eg = {
  key: 1,
  class: "askai__brand",
  href: "https://chattermate.chat",
  target: "_blank",
  rel: "noopener noreferrer"
}, xg = /* @__PURE__ */ Hn({
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
    }, w = () => {
      !(n.typingEnabled ?? n.inputEnabled) || !n.draft.trim() || s("send");
    }, A = (x) => {
      n.inputEnabled && s("ask", x);
    }, I = typeof navigator < "u" && /Mac|iPod|iPhone|iPad/.test(navigator.platform || ""), O = (x) => {
      if (x.key === "Escape") {
        x.preventDefault(), s("close");
        return;
      }
      const M = I ? x.metaKey && !x.ctrlKey : x.ctrlKey && !x.metaKey;
      n.hotkey && M && !x.altKey && (x.key === "k" || x.key === "K") && (x.preventDefault(), s("close"));
    }, H = () => {
      as(() => {
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
      Math.abs(me - ue) < 3 || (ue = me, vt({ type: "WIDGET_RESIZE", height: me }));
    };
    let fe = null;
    const _e = ae(
      () => l.value.reduce((x, { message: M, index: S }) => x + n.displayText(S, M.message || "").length, 0)
    );
    return pt(
      () => [l.value.length, _e.value, n.loading],
      () => as(() => {
        i.value && (i.value.scrollTop = i.value.scrollHeight);
      })
    ), pt(() => n.newChatArmed, () => as(() => R())), pt(() => n.active, (x) => {
      x && H();
    }), io(() => {
      n.active && H(), window.addEventListener("keydown", O), o.value && typeof ResizeObserver < "u" && (fe = new ResizeObserver(() => R()), fe.observe(o.value)), R();
    }), oo(() => {
      window.removeEventListener("keydown", O), fe == null || fe.disconnect(), fe = null;
    }), (x, M) => (b(), k("div", ag, [
      g("div", lg, [
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
          onKeydown: xi(Is(w, ["prevent"]), ["enter"])
        }, null, 40, cg),
        x.canStartNewChat ? (b(), k("button", {
          key: 0,
          type: "button",
          class: Ne(["askai__new", { "askai__new--armed": x.newChatArmed }]),
          disabled: x.startingNewChat,
          title: E(Ki),
          "aria-label": E(Ki),
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
        ]), 10, ug)) : te("", !0),
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
      x.newChatArmed && x.canStartNewChat ? (b(), Pn(df, {
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
          u.value ? (b(), k(Re, { key: 1 }, [
            (b(!0), k(Re, null, dt(l.value, ({ message: S, index: W }) => (b(), k("div", {
              key: W,
              class: "askai__turn",
              "aria-live": x.isStreaming(W) ? "off" : "polite"
            }, [
              S.message_type === "user" ? (b(), k("p", _g, Z(S.message), 1)) : S.message_type === "system" ? (b(), k("p", yg, Z(S.message), 1)) : (b(), k(Re, { key: 2 }, [
                g("div", {
                  class: Ne(["askai__answer", { "askai__answer--streaming": x.isStreaming(W) }]),
                  innerHTML: E(Ri)(x.isStreaming(W) ? x.displayText(W, S.message || "") : S.message || "")
                }, null, 10, vg),
                x.showCitations && !x.isStreaming(W) && S.sources && S.sources.length ? (b(), k("div", bg, [
                  M[9] || (M[9] = g("span", { class: "askai__label" }, "Sources", -1)),
                  (b(!0), k(Re, null, dt(S.sources, (se, me) => (b(), k("span", {
                    key: me,
                    class: "askai__source",
                    title: x.citationTooltip(se)
                  }, Z(x.citationLabel(se)), 9, wg))), 128))
                ])) : te("", !0)
              ], 64))
            ], 8, gg))), 128)),
            x.loading ? (b(), k("div", kg, [
              M[10] || (M[10] = g("span", { class: "askai__dot" }, null, -1)),
              M[11] || (M[11] = g("span", { class: "askai__dot" }, null, -1)),
              M[12] || (M[12] = g("span", { class: "askai__dot" }, null, -1)),
              g("span", Tg, Z(x.showCitations ? "Searching the knowledge base" : "Thinking"), 1)
            ])) : te("", !0)
          ], 64)) : (b(), k(Re, { key: 0 }, [
            g("div", fg, [
              g("h2", hg, Z(x.welcomeTitle || `Ask ${x.agentName}`), 1),
              x.welcomeSubtitle ? (b(), k("p", dg, Z(x.welcomeSubtitle), 1)) : te("", !0)
            ]),
            x.suggestions.length && !x.draft.trim() ? (b(), k("div", pg, [
              M[8] || (M[8] = g("p", { class: "askai__label" }, "Suggested", -1)),
              (b(!0), k(Re, null, dt(x.suggestions, (S) => (b(), k("button", {
                key: S,
                type: "button",
                class: "askai__suggestion",
                disabled: !x.inputEnabled,
                onClick: (W) => A(S)
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
              ], 8, mg))), 128))
            ])) : te("", !0)
          ], 64))
        ], 512)
      ], 512),
      x.disclaimer || x.showBranding ? (b(), k("div", Ag, [
        x.disclaimer ? (b(), k("span", Sg, Z(x.disclaimer), 1)) : te("", !0),
        x.showBranding ? (b(), k("a", Eg, "Powered by ChatterMate")) : te("", !0)
      ])) : te("", !0)
    ]));
  }
}), Cg = /* @__PURE__ */ Wn(xg, [["__scopeId", "data-v-68aaa0d9"]]), Rg = "#12150E", Ig = "#C9F24E", Og = "#FF9D87", Lg = "#F5F6F0", Ng = {
  ink: Rg,
  lime: Ig,
  coral: Og,
  paper: Lg
}, Wo = Object.freeze(Ng), Pg = ["width", "height"], Mg = ["fill"], Dg = ["cx", "r", "fill"], Fg = ["cx", "r", "fill"], $g = 24, Bg = /* @__PURE__ */ Hn({
  __name: "BrandMark",
  props: {
    size: { default: 32 }
  },
  setup(e) {
    const t = e, n = ae(
      () => t.size <= $g ? { left: 22, right: 42, r: 10 } : { left: 23, right: 41, r: 8 }
    );
    return (s, r) => (b(), k("svg", {
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
        fill: E(Wo).ink
      }, null, 8, Mg),
      g("circle", {
        cx: n.value.left,
        cy: "32",
        r: n.value.r,
        fill: E(Wo).lime
      }, null, 8, Dg),
      g("circle", {
        cx: n.value.right,
        cy: "32",
        r: n.value.r,
        fill: E(Wo).coral
      }, null, 8, Fg)
    ], 8, Pg));
  }
}), Er = /* @__PURE__ */ Wn(Bg, [["__scopeId", "data-v-982a6f45"]]), Ug = 40;
function Gi(e) {
  if (typeof e == "number" || typeof e == "boolean") return String(e);
  if (typeof e != "string") return null;
  const t = e.trim();
  return t && t.length <= Ug && !t.includes(`
`) ? t : null;
}
function zg(e) {
  var s, r;
  const t = Gi((s = e.preview) == null ? void 0 : s.before), n = Gi((r = e.preview) == null ? void 0 : r.after);
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
function Hg(e, t, n, s) {
  if (!s) return { approve: e, decline: "Not now" };
  const r = Gi(t), i = Gi(n);
  return {
    approve: i ? `Change to ${i}` : "Change it",
    decline: r ? `Keep ${r}` : "Keep current"
  };
}
const jg = ["aria-label"], Wg = { class: "cm-action-head" }, qg = { class: "cm-action-row before" }, Vg = { class: "cm-action-text" }, Kg = { class: "cm-action-row after" }, Gg = { class: "cm-action-text" }, Yg = {
  key: 1,
  class: "cm-action-args"
}, Xg = { class: "cm-action-buttons" }, Zg = /* @__PURE__ */ Hn({
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
        return Hg(n.pending.request.label, (u = n.pending.preview) == null ? void 0 : u.before, (c = n.pending.preview) == null ? void 0 : c.after, r.value);
      }
    );
    return (u, c) => {
      var w, A;
      return b(), k("div", {
        class: "cm-action-confirm",
        role: "group",
        "aria-label": u.pending.request.label
      }, [
        g("div", Wg, Z(u.pending.request.label) + "?", 1),
        r.value ? (b(), k(Re, { key: 0 }, [
          g("div", qg, [
            c[2] || (c[2] = g("span", { class: "cm-action-tag" }, "Current", -1)),
            g("span", Vg, Z(i((w = u.pending.preview) == null ? void 0 : w.before)), 1)
          ]),
          g("div", Kg, [
            c[3] || (c[3] = g("span", { class: "cm-action-tag" }, "New", -1)),
            g("span", Gg, Z(i((A = u.pending.preview) == null ? void 0 : A.after)), 1)
          ])
        ], 64)) : a.value.length ? (b(), k("dl", Yg, [
          (b(!0), k(Re, null, dt(a.value, (I) => (b(), k(Re, {
            key: I.key
          }, [
            g("dt", null, Z(I.key), 1),
            g("dd", null, Z(I.value), 1)
          ], 64))), 128))
        ])) : te("", !0),
        g("div", Xg, [
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
      ], 8, jg);
    };
  }
}), Jg = /* @__PURE__ */ Wn(Zg, [["__scopeId", "data-v-bdc9ad66"]]), Qg = {
  key: 0,
  class: "cm-receipt-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, e_ = {
  key: 1,
  class: "cm-receipt-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, t_ = {
  key: 2,
  class: "cm-receipt-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, n_ = { class: "cm-visually-hidden" }, s_ = { class: "cm-receipt-text" }, r_ = /* @__PURE__ */ Hn({
  __name: "ActionReceiptLine",
  props: {
    receipt: {}
  },
  setup(e) {
    return (t, n) => (b(), k("div", {
      class: Ne(["cm-receipt", t.receipt.tone]),
      role: "status"
    }, [
      t.receipt.tone === "done" ? (b(), k("svg", Qg, n[0] || (n[0] = [
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
      ]))) : t.receipt.tone === "failed" ? (b(), k("svg", e_, n[1] || (n[1] = [
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
      ]))) : (b(), k("svg", t_, n[2] || (n[2] = [
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
      g("span", n_, Z(t.receipt.tone === "done" ? "Done:" : t.receipt.tone === "failed" ? "Failed:" : "Skipped:"), 1),
      g("span", s_, Z(t.receipt.text), 1)
    ], 2));
  }
}), i_ = /* @__PURE__ */ Wn(r_, [["__scopeId", "data-v-be379090"]]), o_ = { class: "cm-plan-pin" }, a_ = ["aria-label"], l_ = ["aria-expanded"], c_ = { class: "cm-plan-label" }, u_ = { class: "cm-plan-name" }, f_ = {
  key: 0,
  class: "cm-plan-now"
}, h_ = { class: "cm-plan-count" }, d_ = ["aria-valuenow", "aria-valuemax", "aria-label"], p_ = {
  key: 0,
  class: "cm-plan-steps"
}, m_ = ["aria-current"], g_ = {
  key: 0,
  class: "cm-plan-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, __ = {
  key: 1,
  class: "cm-plan-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, y_ = {
  key: 2,
  class: "cm-plan-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, v_ = { class: "cm-plan-title" }, b_ = {
  key: 3,
  class: "cm-visually-hidden"
}, w_ = { class: "cm-plan-actions" }, k_ = /* @__PURE__ */ Hn({
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
    return (l, u) => (b(), k("div", o_, [
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
          g("span", c_, [
            g("span", u_, Z(l.progress.name), 1),
            !l.progress.finished && l.progress.title ? (b(), k("span", f_, Z(l.progress.title), 1)) : te("", !0)
          ]),
          g("span", h_, Z(l.progress.finished ? "Done" : `${i.value} of ${l.progress.count}`), 1),
          (b(), k("svg", {
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
        ], 8, l_),
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
        ], 8, d_),
        r.value ? (b(), k(Re, { key: 0 }, [
          a.value.length ? (b(), k("ol", p_, [
            (b(!0), k(Re, null, dt(a.value, (c, w) => (b(), k("li", {
              key: w,
              class: Ne(c.state),
              "aria-current": c.state === "now" ? "step" : void 0
            }, [
              c.state === "done" ? (b(), k("svg", g_, u[4] || (u[4] = [
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
              ]))) : c.state === "now" ? (b(), k("svg", __, u[5] || (u[5] = [
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
              ]))) : (b(), k("svg", y_, u[6] || (u[6] = [
                g("circle", {
                  cx: "12",
                  cy: "12",
                  r: "9",
                  class: "ring todo"
                }, null, -1)
              ]))),
              g("span", v_, Z(c.title), 1),
              c.state === "done" ? (b(), k("span", b_, "(done)")) : te("", !0)
            ], 10, m_))), 128))
          ])) : te("", !0),
          g("div", w_, [
            l.progress.skippable ? (b(), k("button", {
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
      ], 10, a_)
    ]));
  }
}), T_ = /* @__PURE__ */ Wn(k_, [["__scopeId", "data-v-016d08e3"]]), A_ = {
  class: "cm-replies",
  role: "group",
  "aria-label": "Suggested replies"
}, S_ = ["disabled", "onClick"], E_ = /* @__PURE__ */ Hn({
  __name: "SuggestedReplies",
  props: {
    chips: {},
    disabled: { type: Boolean }
  },
  emits: ["pick"],
  setup(e, { emit: t }) {
    const n = t;
    return (s, r) => (b(), k("div", A_, [
      (b(!0), k(Re, null, dt(s.chips, (i) => (b(), k("button", {
        key: i.label,
        type: "button",
        class: "cm-reply",
        disabled: s.disabled,
        onClick: (o) => n("pick", i)
      }, Z(i.label), 9, S_))), 128))
    ]));
  }
}), x_ = /* @__PURE__ */ Wn(E_, [["__scopeId", "data-v-7b650713"]]), C_ = 2e4, pf = "Couldn't add this to your cart. Please try again.", R_ = { status: "idle", error: null }, _a = oe(null), Xa = Vr({}), ya = /* @__PURE__ */ new Map(), mf = /* @__PURE__ */ new Map();
let I_ = 0;
const O_ = (e, t) => e.toLowerCase() === t.toLowerCase();
function L_(e, t) {
  return !!(e.cart_variant_id && t && _a.value && O_(_a.value, t));
}
function gf(e) {
  return Xa[e] ?? R_;
}
function _f(e, t, n) {
  (n.status === "added" || mf.get(e) === t) && (Xa[e] = n);
}
function N_(e, t) {
  const n = ya.get(e);
  n && (clearTimeout(n.timer), ya.delete(e), _f(n.variantId, e, t));
}
function P_(e) {
  if (gf(e).status === "adding") return;
  const t = `cart-${++I_}`;
  Xa[e] = { status: "adding", error: null }, mf.set(e, t), ya.set(t, {
    variantId: e,
    timer: setTimeout(() => _f(e, t, { status: "failed", error: pf }), C_)
  }), vt({ type: "ADD_TO_CART", requestId: t, variantId: e });
}
function Cc() {
  vt({ type: "VIEW_CART" });
}
function M_(e) {
  if (e.type === "CART_AVAILABLE")
    return _a.value = typeof e.shop == "string" && e.shop ? e.shop : null, !0;
  if (e.type === "ADD_TO_CART_DONE") {
    const t = typeof e.error == "string" && e.error ? e.error : pf;
    return N_(String(e.requestId), e.ok === !0 ? { status: "added", error: null } : { status: "failed", error: t }), !0;
  }
  return !1;
}
const D_ = { class: "cm-cart" }, F_ = ["disabled"], $_ = {
  key: 2,
  class: "cm-cart-note",
  role: "status"
}, B_ = {
  key: 3,
  class: "cm-cart-note cm-cart-error",
  role: "alert"
}, U_ = /* @__PURE__ */ Hn({
  __name: "ProductCartButton",
  props: {
    variantId: {}
  },
  setup(e) {
    const t = e, n = ae(() => gf(t.variantId));
    return (s, r) => (b(), k("div", D_, [
      n.value.status === "added" ? (b(), k("button", {
        key: 0,
        type: "button",
        class: "cm-cart-button",
        onClick: r[0] || (r[0] = //@ts-ignore
        (...i) => E(Cc) && E(Cc)(...i))
      }, " View cart ")) : (b(), k("button", {
        key: 1,
        type: "button",
        class: "cm-cart-button",
        disabled: n.value.status === "adding",
        onClick: r[1] || (r[1] = (i) => E(P_)(s.variantId))
      }, Z(n.value.status === "adding" ? "Adding…" : "Add to cart"), 9, F_)),
      n.value.status === "added" ? (b(), k("p", $_, "Added to your cart")) : n.value.error ? (b(), k("p", B_, Z(n.value.error), 1)) : te("", !0)
    ]));
  }
}), z_ = /* @__PURE__ */ Wn(U_, [["__scopeId", "data-v-375a4eee"]]);
function H_(e) {
  const t = oe([]);
  function n(r) {
    t.value.push({ after: e.value.length, receipt: zg(r) });
  }
  function s(r) {
    return t.value.filter((i) => i.after === r).map((i) => i.receipt);
  }
  return pt(() => e.value.length, (r) => {
    r === 0 ? t.value = [] : t.value.some((i) => i.after > r) && (t.value = t.value.filter((i) => i.after <= r));
  }), { receipts: t, addReceipt: n, receiptsAfter: s };
}
const j_ = "Please don't paste passwords or keys here.", W_ = [
  /\bsk-(?:proj-|ant-)?[A-Za-z0-9_-]{20,}/,
  /\bcmat_[A-Za-z0-9_-]{16,}/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{30,}/,
  /\bxox[abposr]-[A-Za-z0-9-]{10,}/
], q_ = /\b(password|passwd|pwd|passcode|api[ _-]?key|secret)\s*(?:is|:|=)\s*\S+/i, V_ = /\b(?:\d[ -]?){12,18}\d\b/g;
function K_(e) {
  let t = 0;
  for (let n = 0; n < e.length; n++) {
    let s = Number(e[e.length - 1 - n]);
    n % 2 === 1 && (s *= 2, s > 9 && (s -= 9)), t += s;
  }
  return t % 10 === 0;
}
function G_(e) {
  return e ? W_.some((t) => t.test(e)) || q_.test(e) ? !0 : (e.match(V_) || []).some((t) => {
    const n = t.replace(/\D/g, "");
    return n.length >= 13 && n.length <= 19 && K_(n);
  }) : !1;
}
const Ir = [
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
], Y_ = (e) => (e || "").split("").reduce((t, n) => t + n.charCodeAt(0), 0) % Ir.length, X_ = (e) => {
  const t = Ir[(e % Ir.length + Ir.length) % Ir.length];
  return {
    background: `
            radial-gradient(circle at 32% 28%, rgba(255,255,255,0.22) 0%, transparent 42%),
            radial-gradient(circle at 68% 72%, rgba(0,0,0,0.25) 0%, transparent 38%),
            radial-gradient(ellipse at 50% 50%, ${t.stops})
        `.trim(),
    boxShadow: `0 4px 28px ${t.glow}, inset 0 1px 0 rgba(255,255,255,0.15)`,
    borderRadius: "50%"
  };
}, Z_ = (e, t) => {
  const n = typeof t == "number" && Number.isFinite(t) ? t : Y_(e);
  return X_(n);
}, Rc = (e) => {
  var t;
  return !!((t = e == null ? void 0 : e.attributes) != null && t.end_chat);
}, Ic = "AI can make mistakes. Check important info.";
function J_(e, t = !1) {
  return e !== !1 && !t;
}
const qo = {
  ai: "Online · replies instantly",
  human: "Online · usually replies in a few minutes",
  away: "Away · we'll reply when we're back"
};
function Q_(e, t = !1) {
  return (t ? "human" : (e == null ? void 0 : e.mode) ?? "ai") === "ai" ? { text: qo.ai, online: !0 } : (e == null ? void 0 : e.available) !== !1 ? { text: qo.human, online: !0 } : { text: qo.away, online: !1 };
}
const yf = (e) => !!e && (/^https?:\/\//i.test(e) || e.startsWith("data:")), ey = (e, t) => e ? yf(e) || e.startsWith("blob:") ? e : `${t.replace(/\/api\/v1\/?$/, "")}${e.startsWith("/") ? "" : "/"}${e}` : "";
function Oc() {
  return typeof window < "u" && window.APP_CONFIG ? window.APP_CONFIG : {};
}
const Ds = {
  get API_URL() {
    return Oc().API_URL || "https://api.chattermate.chat/api/v1";
  },
  get WS_URL() {
    return Oc().WS_URL || "wss://api.chattermate.chat";
  }
};
function Yi(e) {
  return ey(e, Ds.API_URL);
}
const vf = "ctid", ty = "identity_expired", ny = "invalid_token", Lc = 0.8, sy = 720 * 60 * 1e3, Vo = 30 * 1e3, Ko = 1e3, cs = (e) => {
  if (typeof e != "string") return e ? String(e) : null;
  const t = e.trim();
  return !t || t === "undefined" || t === "null" ? null : t;
}, Ii = (e) => {
  const t = cs(e);
  if (!t) return null;
  const [, n] = t.split(".");
  if (!n) return null;
  try {
    const s = atob(n.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(s);
  } catch {
    return null;
  }
}, ry = async (e) => {
  var t, n;
  try {
    return (n = (t = await e.json()) == null ? void 0 : t.detail) == null ? void 0 : n.code;
  } catch {
    return;
  }
}, Xi = (e = vf) => ({
  read: () => {
    try {
      return cs(localStorage.getItem(e));
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
}), iy = () => ({
  read: () => null,
  write: () => {
  },
  clear: () => {
  }
});
function oy(e = {}) {
  const t = e.store ?? Xi(), n = oe(null);
  let s = null, r = null;
  const i = () => {
    s && (clearTimeout(s), s = null);
  }, o = () => {
    const H = Ii(n.value);
    return H != null && H.exp ? Number(H.exp) - Math.floor(Date.now() / Ko) : null;
  }, a = () => {
    const H = Ii(n.value);
    if (!(H != null && H.exp)) return !1;
    const ue = H.iat ? Number(H.exp) - Number(H.iat) : 0, R = o() ?? 0;
    return ue <= 0 ? R <= 0 : R <= ue * (1 - Lc);
  }, l = (H, { persist: ue = !0 } = {}) => {
    var _e, x;
    const R = cs(H), fe = !!n.value;
    if (i(), n.value = R, !R) {
      t.clear(), fe && ((_e = e.onTokenCleared) == null || _e.call(e));
      return;
    }
    ue && (t.write(R), (x = e.onTokenChanged) == null || x.call(e, R)), w();
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
          return await ry(_e) !== ny && ((R = e.onIdentityExpired) == null || R.call(e)), !1;
        if (!_e.ok)
          return w(Vo), !1;
        const x = await _e.json(), M = cs((fe = x == null ? void 0 : x.data) == null ? void 0 : fe.token);
        return M ? (l(M), !0) : !1;
      } catch {
        return w(Vo), !1;
      } finally {
        r = null;
      }
    })(), r;
  }, c = async (H) => n.value ? a() ? u(H) : !0 : !1, w = (H) => {
    i();
    const ue = Ii(n.value);
    if (!(ue != null && ue.exp) || !(ue != null && ue.iat)) return;
    const R = (Number(ue.exp) - Number(ue.iat)) * Ko, fe = (o() ?? 0) * Ko, _e = H ?? Math.min(
      sy,
      Math.max(0, fe - R * (1 - Lc))
    );
    s = setTimeout(() => {
      s = null, c(A).then((x) => {
        w(x ? void 0 : Vo);
      });
    }, _e);
  };
  let A = "";
  return {
    token: n,
    start: (H, ue) => {
      A = H;
      const R = cs(ue) || t.read();
      l(R, { persist: !1 }), R && t.write(R);
    },
    stop: () => {
      i(), r = null;
    },
    setToken: l,
    ensureFresh: c
  };
}
const ir = window.__CM_FRAME__, bf = "null";
let Ns = !1, wf = !1, kf = null;
const Zi = () => !!ir, Ls = () => !ir || Ns && !wf, Tf = () => kf, Af = (e) => {
  typeof e == "string" && e && (kf = e);
}, Sf = (e) => ir ? Ns ? iy() : Xi(`${vf}:${e}`) : Xi(), ay = () => new Promise((e) => {
  const t = (n) => {
    var r;
    if (n.source !== window.parent || ((r = n.data) == null ? void 0 : r.type) !== "HOST_INIT") return;
    window.removeEventListener("message", t);
    const s = n.origin === bf;
    e({
      origin: n.origin,
      // An opaque host can't be addressed, so nothing it hands over can be
      // answered safely: such a frame runs as an anonymous visitor.
      token: s ? null : cs(n.data.token),
      pageUrl: typeof n.data.pageUrl == "string" ? n.data.pageUrl : null
    });
  };
  window.addEventListener("message", t), window.parent.postMessage({ type: "FRAME_READY" }, "*");
}), ly = async (e) => {
  var t;
  try {
    const n = await e.json();
    return ((t = n == null ? void 0 : n.detail) == null ? void 0 : t.code) || "unavailable";
  } catch {
    return "unavailable";
  }
}, Nc = () => {
  const e = document.getElementById("app");
  e && (e.textContent = "Chat is unavailable right now.");
};
async function cy() {
  if (!ir) return !0;
  const e = new URL(window.location.href).searchParams;
  Ns = e.get("host") === "1" && window.parent !== window;
  let t, n = null;
  if (Ns) {
    const o = await ay();
    o.origin !== bf ? (Sc(o.origin), n = o.origin) : (wf = !0, Sc("*")), Af(o.pageUrl), t = o.token;
  } else
    t = Sf(ir.widgetId).read();
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
    return Ns ? vt({ type: "WIDGET_ERROR", code: "unavailable" }) : Nc(), !1;
  }
  if (!s.ok) {
    const o = await ly(s);
    return Ns ? vt({ type: "WIDGET_ERROR", code: o }) : Nc(), !1;
  }
  const r = await s.json();
  window.__INITIAL_DATA__ = r;
  const i = cs(r.initialToken);
  return Ls() && i && i !== t && vt({ type: "TOKEN_UPDATE", token: i }), !0;
}
const uy = () => {
  Ns && vt({ type: "WIDGET_READY" });
};
function fy(e) {
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
  })), a = ae(() => Yi(e.value.photo_url)), l = ae(() => {
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
const hy = /* @__PURE__ */ new Set(["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]), dy = /* @__PURE__ */ new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);
[...hy, ...dy];
function py(e, t) {
  const n = oe([]), s = oe(!1), r = oe(null), i = (M) => {
    if (M === 0) return "0 Bytes";
    const S = 1024, W = ["Bytes", "KB", "MB", "GB"], se = Math.floor(Math.log(M) / Math.log(S));
    return parseFloat((M / Math.pow(S, se)).toFixed(2)) + " " + W[se];
  }, o = (M) => M.startsWith("image/"), a = (M) => M ? Yi(M) : "", l = (M) => {
    const S = M.file_url || M.url;
    return S ? Yi(S) : "";
  }, u = async (M) => {
    const S = M.target;
    S.files && S.files.length > 0 && (await H(Array.from(S.files)), S.value = "");
  }, c = async (M) => {
    var W;
    M.preventDefault();
    const S = (W = M.dataTransfer) == null ? void 0 : W.files;
    S && S.length > 0 && await H(Array.from(S));
  }, w = (M) => {
    M.preventDefault();
  }, A = (M) => {
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
        const Ke = document.createElement("canvas");
        let Ue = Oe.width, st = Oe.height;
        const he = 1920;
        (Ue > he || st > he) && (Ue > st ? (st = st / Ue * he, Ue = he) : (Ue = Ue / st * he, st = he)), Ke.width = Ue, Ke.height = st;
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
    handleDragOver: w,
    handleDragLeave: A,
    handlePaste: I,
    uploadFiles: H,
    removeAttachment: async (M) => {
      const S = n.value[M];
      if (S) {
        try {
          let W = S.url;
          if (W.startsWith("/uploads/") ? W = W.substring(9) : W.startsWith("/") && (W = W.substring(1)), yf(W))
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
const Oi = /* @__PURE__ */ Object.create(null);
Object.keys(Cn).forEach((e) => {
  Oi[Cn[e]] = e;
});
const va = { type: "error", data: "parser error" }, Ef = typeof Blob == "function" || typeof Blob < "u" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]", xf = typeof ArrayBuffer == "function", Cf = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e && e.buffer instanceof ArrayBuffer, Za = ({ type: e, data: t }, n, s) => Ef && t instanceof Blob ? n ? s(t) : Pc(t, s) : xf && (t instanceof ArrayBuffer || Cf(t)) ? n ? s(t) : Pc(new Blob([t]), s) : s(Cn[e] + (t || "")), Pc = (e, t) => {
  const n = new FileReader();
  return n.onload = function() {
    const s = n.result.split(",")[1];
    t("b" + (s || ""));
  }, n.readAsDataURL(e);
};
function Mc(e) {
  return e instanceof Uint8Array ? e : e instanceof ArrayBuffer ? new Uint8Array(e) : new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
}
let Go;
function my(e, t) {
  if (Ef && e.data instanceof Blob)
    return e.data.arrayBuffer().then(Mc).then(t);
  if (xf && (e.data instanceof ArrayBuffer || Cf(e.data)))
    return t(Mc(e.data));
  Za(e, !1, (n) => {
    Go || (Go = new TextEncoder()), t(Go.encode(n));
  });
}
const Dc = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", Or = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (let e = 0; e < Dc.length; e++)
  Or[Dc.charCodeAt(e)] = e;
const gy = (e) => {
  let t = e.length * 0.75, n = e.length, s, r = 0, i, o, a, l;
  e[e.length - 1] === "=" && (t--, e[e.length - 2] === "=" && t--);
  const u = new ArrayBuffer(t), c = new Uint8Array(u);
  for (s = 0; s < n; s += 4)
    i = Or[e.charCodeAt(s)], o = Or[e.charCodeAt(s + 1)], a = Or[e.charCodeAt(s + 2)], l = Or[e.charCodeAt(s + 3)], c[r++] = i << 2 | o >> 4, c[r++] = (o & 15) << 4 | a >> 2, c[r++] = (a & 3) << 6 | l & 63;
  return u;
}, _y = typeof ArrayBuffer == "function", Ja = (e, t) => {
  if (typeof e != "string")
    return {
      type: "message",
      data: Rf(e, t)
    };
  const n = e.charAt(0);
  return n === "b" ? {
    type: "message",
    data: yy(e.substring(1), t)
  } : Oi[n] ? e.length > 1 ? {
    type: Oi[n],
    data: e.substring(1)
  } : {
    type: Oi[n]
  } : va;
}, yy = (e, t) => {
  if (_y) {
    const n = gy(e);
    return Rf(n, t);
  } else
    return { base64: !0, data: e };
}, Rf = (e, t) => {
  switch (t) {
    case "blob":
      return e instanceof Blob ? e : new Blob([e]);
    case "arraybuffer":
    default:
      return e instanceof ArrayBuffer ? e : e.buffer;
  }
}, If = "", vy = (e, t) => {
  const n = e.length, s = new Array(n);
  let r = 0;
  e.forEach((i, o) => {
    Za(i, !1, (a) => {
      s[o] = a, ++r === n && t(s.join(If));
    });
  });
}, by = (e, t) => {
  const n = e.split(If), s = [];
  for (let r = 0; r < n.length; r++) {
    const i = Ja(n[r], t);
    if (s.push(i), i.type === "error")
      break;
  }
  return s;
};
function wy() {
  return new TransformStream({
    transform(e, t) {
      my(e, (n) => {
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
let Yo;
function vi(e) {
  return e.reduce((t, n) => t + n.length, 0);
}
function bi(e, t) {
  if (e[0].length === t)
    return e.shift();
  const n = new Uint8Array(t);
  let s = 0;
  for (let r = 0; r < t; r++)
    n[r] = e[0][s++], s === e[0].length && (e.shift(), s = 0);
  return e.length && s < e[0].length && (e[0] = e[0].slice(s)), n;
}
function ky(e, t) {
  Yo || (Yo = new TextDecoder());
  const n = [];
  let s = 0, r = -1, i = !1;
  return new TransformStream({
    transform(o, a) {
      for (n.push(o); ; ) {
        if (s === 0) {
          if (vi(n) < 1)
            break;
          const l = bi(n, 1);
          i = (l[0] & 128) === 128, r = l[0] & 127, r < 126 ? s = 3 : r === 126 ? s = 1 : s = 2;
        } else if (s === 1) {
          if (vi(n) < 2)
            break;
          const l = bi(n, 2);
          r = new DataView(l.buffer, l.byteOffset, l.length).getUint16(0), s = 3;
        } else if (s === 2) {
          if (vi(n) < 8)
            break;
          const l = bi(n, 8), u = new DataView(l.buffer, l.byteOffset, l.length), c = u.getUint32(0);
          if (c > Math.pow(2, 21) - 1) {
            a.enqueue(va);
            break;
          }
          r = c * Math.pow(2, 32) + u.getUint32(4), s = 3;
        } else {
          if (vi(n) < r)
            break;
          const l = bi(n, r);
          a.enqueue(Ja(i ? l : Yo.decode(l), t)), s = 0;
        }
        if (r === 0 || r > e) {
          a.enqueue(va);
          break;
        }
      }
    }
  });
}
const Of = 4;
function mt(e) {
  if (e) return Ty(e);
}
function Ty(e) {
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
const ho = typeof Promise == "function" && typeof Promise.resolve == "function" ? (t) => Promise.resolve().then(t) : (t, n) => n(t, 0), ln = typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")(), Ay = "arraybuffer";
function Lf(e, ...t) {
  return t.reduce((n, s) => (e.hasOwnProperty(s) && (n[s] = e[s]), n), {});
}
const Sy = ln.setTimeout, Ey = ln.clearTimeout;
function po(e, t) {
  t.useNativeTimers ? (e.setTimeoutFn = Sy.bind(ln), e.clearTimeoutFn = Ey.bind(ln)) : (e.setTimeoutFn = ln.setTimeout.bind(ln), e.clearTimeoutFn = ln.clearTimeout.bind(ln));
}
const xy = 1.33;
function Cy(e) {
  return typeof e == "string" ? Ry(e) : Math.ceil((e.byteLength || e.size) * xy);
}
function Ry(e) {
  let t = 0, n = 0;
  for (let s = 0, r = e.length; s < r; s++)
    t = e.charCodeAt(s), t < 128 ? n += 1 : t < 2048 ? n += 2 : t < 55296 || t >= 57344 ? n += 3 : (s++, n += 4);
  return n;
}
function Nf() {
  return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
}
function Iy(e) {
  let t = "";
  for (let n in e)
    e.hasOwnProperty(n) && (t.length && (t += "&"), t += encodeURIComponent(n) + "=" + encodeURIComponent(e[n]));
  return t;
}
function Oy(e) {
  let t = {}, n = e.split("&");
  for (let s = 0, r = n.length; s < r; s++) {
    let i = n[s].split("=");
    t[decodeURIComponent(i[0])] = decodeURIComponent(i[1]);
  }
  return t;
}
class Ly extends Error {
  constructor(t, n, s) {
    super(t), this.description = n, this.context = s, this.type = "TransportError";
  }
}
class Qa extends mt {
  /**
   * Transport abstract constructor.
   *
   * @param {Object} opts - options
   * @protected
   */
  constructor(t) {
    super(), this.writable = !1, po(this, t), this.opts = t, this.query = t.query, this.socket = t.socket, this.supportsBinary = !t.forceBase64;
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
    return super.emitReserved("error", new Ly(t, n, s)), this;
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
    const n = Ja(t, this.socket.binaryType);
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
    const n = Iy(t);
    return n.length ? "?" + n : "";
  }
}
class Ny extends Qa {
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
    by(t, this.socket.binaryType).forEach(n), this.readyState !== "closed" && (this._polling = !1, this.emitReserved("pollComplete"), this.readyState === "open" && this._poll());
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
    this.writable = !1, vy(t, (n) => {
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
    return this.opts.timestampRequests !== !1 && (n[this.opts.timestampParam] = Nf()), !this.supportsBinary && !n.sid && (n.b64 = 1), this.createUri(t, n);
  }
}
let Pf = !1;
try {
  Pf = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest();
} catch {
}
const Py = Pf;
function My() {
}
class Dy extends Ny {
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
    super(), this.createRequest = t, po(this, s), this._opts = s, this._method = s.method || "GET", this._uri = n, this._data = s.data !== void 0 ? s.data : null, this._create();
  }
  /**
   * Creates the XHR object and sends the request.
   *
   * @private
   */
  _create() {
    var t;
    const n = Lf(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
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
      if (this._xhr.onreadystatechange = My, t)
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
    attachEvent("onunload", Fc);
  else if (typeof addEventListener == "function") {
    const e = "onpagehide" in ln ? "pagehide" : "unload";
    addEventListener(e, Fc, !1);
  }
}
function Fc() {
  for (let e in En.requests)
    En.requests.hasOwnProperty(e) && En.requests[e].abort();
}
const Fy = function() {
  const e = Mf({
    xdomain: !1
  });
  return e && e.responseType !== null;
}();
class $y extends Dy {
  constructor(t) {
    super(t);
    const n = t && t.forceBase64;
    this.supportsBinary = Fy && !n;
  }
  request(t = {}) {
    return Object.assign(t, { xd: this.xd }, this.opts), new En(Mf, this.uri(), t);
  }
}
function Mf(e) {
  const t = e.xdomain;
  try {
    if (typeof XMLHttpRequest < "u" && (!t || Py))
      return new XMLHttpRequest();
  } catch {
  }
  if (!t)
    try {
      return new ln[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
    } catch {
    }
}
const Df = typeof navigator < "u" && typeof navigator.product == "string" && navigator.product.toLowerCase() === "reactnative";
class By extends Qa {
  get name() {
    return "websocket";
  }
  doOpen() {
    const t = this.uri(), n = this.opts.protocols, s = Df ? {} : Lf(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
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
      Za(s, this.supportsBinary, (i) => {
        try {
          this.doWrite(s, i);
        } catch {
        }
        r && ho(() => {
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
    return this.opts.timestampRequests && (n[this.opts.timestampParam] = Nf()), this.supportsBinary || (n.b64 = 1), this.createUri(t, n);
  }
}
const Xo = ln.WebSocket || ln.MozWebSocket;
class Uy extends By {
  createSocket(t, n, s) {
    return Df ? new Xo(t, n, s) : n ? new Xo(t, n) : new Xo(t);
  }
  doWrite(t, n) {
    this.ws.send(n);
  }
}
class zy extends Qa {
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
        const n = ky(Number.MAX_SAFE_INTEGER, this.socket.binaryType), s = t.readable.pipeThrough(n).getReader(), r = wy();
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
        r && ho(() => {
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
const Hy = {
  websocket: Uy,
  webtransport: zy,
  polling: $y
}, jy = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/, Wy = [
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
function ba(e) {
  if (e.length > 8e3)
    throw "URI too long";
  const t = e, n = e.indexOf("["), s = e.indexOf("]");
  n != -1 && s != -1 && (e = e.substring(0, n) + e.substring(n, s).replace(/:/g, ";") + e.substring(s, e.length));
  let r = jy.exec(e || ""), i = {}, o = 14;
  for (; o--; )
    i[Wy[o]] = r[o] || "";
  return n != -1 && s != -1 && (i.source = t, i.host = i.host.substring(1, i.host.length - 1).replace(/;/g, ":"), i.authority = i.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), i.ipv6uri = !0), i.pathNames = qy(i, i.path), i.queryKey = Vy(i, i.query), i;
}
function qy(e, t) {
  const n = /\/{2,9}/g, s = t.replace(n, "/").split("/");
  return (t.slice(0, 1) == "/" || t.length === 0) && s.splice(0, 1), t.slice(-1) == "/" && s.splice(s.length - 1, 1), s;
}
function Vy(e, t) {
  const n = {};
  return t.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function(s, r, i) {
    r && (n[r] = i);
  }), n;
}
const wa = typeof addEventListener == "function" && typeof removeEventListener == "function", Li = [];
wa && addEventListener("offline", () => {
  Li.forEach((e) => e());
}, !1);
class us extends mt {
  /**
   * Socket constructor.
   *
   * @param {String|Object} uri - uri or options
   * @param {Object} opts - options
   */
  constructor(t, n) {
    if (super(), this.binaryType = Ay, this.writeBuffer = [], this._prevBufferLen = 0, this._pingInterval = -1, this._pingTimeout = -1, this._maxPayload = -1, this._pingTimeoutTime = 1 / 0, t && typeof t == "object" && (n = t, t = null), t) {
      const s = ba(t);
      n.hostname = s.host, n.secure = s.protocol === "https" || s.protocol === "wss", n.port = s.port, s.query && (n.query = s.query);
    } else n.host && (n.hostname = ba(n.host).host);
    po(this, n), this.secure = n.secure != null ? n.secure : typeof location < "u" && location.protocol === "https:", n.hostname && !n.port && (n.port = this.secure ? "443" : "80"), this.hostname = n.hostname || (typeof location < "u" ? location.hostname : "localhost"), this.port = n.port || (typeof location < "u" && location.port ? location.port : this.secure ? "443" : "80"), this.transports = [], this._transportsByName = {}, n.transports.forEach((s) => {
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
    }, n), this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : ""), typeof this.opts.query == "string" && (this.opts.query = Oy(this.opts.query)), wa && (this.opts.closeOnBeforeunload && (this._beforeunloadEventListener = () => {
      this.transport && (this.transport.removeAllListeners(), this.transport.close());
    }, addEventListener("beforeunload", this._beforeunloadEventListener, !1)), this.hostname !== "localhost" && (this._offlineEventListener = () => {
      this._onClose("transport close", {
        description: "network connection lost"
      });
    }, Li.push(this._offlineEventListener))), this.opts.withCredentials && (this._cookieJar = void 0), this._open();
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
    n.EIO = Of, n.transport = t, this.id && (n.sid = this.id);
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
    const t = this.opts.rememberUpgrade && us.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1 ? "websocket" : this.transports[0];
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
    this.readyState = "open", us.priorWebsocketSuccess = this.transport.name === "websocket", this.emitReserved("open"), this.flush();
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
      if (r && (n += Cy(r)), s > 0 && n > this._maxPayload)
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
    return t && (this._pingTimeoutTime = 0, ho(() => {
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
    if (us.priorWebsocketSuccess = !1, this.opts.tryAllTransports && this.transports.length > 1 && this.readyState === "opening")
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
      if (this.clearTimeoutFn(this._pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), wa && (this._beforeunloadEventListener && removeEventListener("beforeunload", this._beforeunloadEventListener, !1), this._offlineEventListener)) {
        const s = Li.indexOf(this._offlineEventListener);
        s !== -1 && Li.splice(s, 1);
      }
      this.readyState = "closed", this.id = null, this.emitReserved("close", t, n), this.writeBuffer = [], this._prevBufferLen = 0;
    }
  }
}
us.protocol = Of;
class Ky extends us {
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
    us.priorWebsocketSuccess = !1;
    const r = () => {
      s || (n.send([{ type: "ping", data: "probe" }]), n.once("packet", (w) => {
        if (!s)
          if (w.type === "pong" && w.data === "probe") {
            if (this.upgrading = !0, this.emitReserved("upgrading", n), !n)
              return;
            us.priorWebsocketSuccess = n.name === "websocket", this.transport.pause(() => {
              s || this.readyState !== "closed" && (c(), this.setTransport(n), n.send([{ type: "upgrade" }]), this.emitReserved("upgrade", n), n = null, this.upgrading = !1, this.flush());
            });
          } else {
            const A = new Error("probe error");
            A.transport = n.name, this.emitReserved("upgradeError", A);
          }
      }));
    };
    function i() {
      s || (s = !0, c(), n.close(), n = null);
    }
    const o = (w) => {
      const A = new Error("probe error: " + w);
      A.transport = n.name, i(), this.emitReserved("upgradeError", A);
    };
    function a() {
      o("transport closed");
    }
    function l() {
      o("socket closed");
    }
    function u(w) {
      n && w.name !== n.name && i();
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
let Gy = class extends Ky {
  constructor(t, n = {}) {
    const s = typeof t == "object", r = s ? { ...t } : { ...n };
    (!r.transports || r.transports && typeof r.transports[0] == "string") && (r.transports = (r.transports || ["polling", "websocket", "webtransport"]).map((i) => Hy[i]).filter((i) => !!i)), super(s ? r : t, r);
  }
};
function Yy(e, t = "", n) {
  let s = e;
  n = n || typeof location < "u" && location, e == null && (e = n.protocol + "//" + n.host), typeof e == "string" && (e.charAt(0) === "/" && (e.charAt(1) === "/" ? e = n.protocol + e : e = n.host + e), /^(https?|wss?):\/\//.test(e) || (typeof n < "u" ? e = n.protocol + "//" + e : e = "https://" + e), s = ba(e)), s.port || (/^(http|ws)$/.test(s.protocol) ? s.port = "80" : /^(http|ws)s$/.test(s.protocol) && (s.port = "443")), s.path = s.path || "/";
  const i = s.host.indexOf(":") !== -1 ? "[" + s.host + "]" : s.host;
  return s.id = s.protocol + "://" + i + ":" + s.port + t, s.href = s.protocol + "://" + i + (n && n.port === s.port ? "" : ":" + s.port), s;
}
const Xy = typeof ArrayBuffer == "function", Zy = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e.buffer instanceof ArrayBuffer, Ff = Object.prototype.toString, Jy = typeof Blob == "function" || typeof Blob < "u" && Ff.call(Blob) === "[object BlobConstructor]", Qy = typeof File == "function" || typeof File < "u" && Ff.call(File) === "[object FileConstructor]";
function el(e) {
  return Xy && (e instanceof ArrayBuffer || Zy(e)) || Jy && e instanceof Blob || Qy && e instanceof File;
}
function Ni(e, t) {
  if (!e || typeof e != "object")
    return !1;
  if (Array.isArray(e)) {
    for (let n = 0, s = e.length; n < s; n++)
      if (Ni(e[n]))
        return !0;
    return !1;
  }
  if (el(e))
    return !0;
  if (e.toJSON && typeof e.toJSON == "function" && arguments.length === 1)
    return Ni(e.toJSON(), !0);
  for (const n in e)
    if (Object.prototype.hasOwnProperty.call(e, n) && Ni(e[n]))
      return !0;
  return !1;
}
function ev(e) {
  const t = [], n = e.data, s = e;
  return s.data = Pi(n, t), s.attachments = t.length, { packet: s, buffers: t };
}
function Pi(e, t, n) {
  if (!e)
    return e;
  if (el(e)) {
    const s = { _placeholder: !0, num: t.length };
    return t.push(e), s;
  } else if (Array.isArray(e)) {
    const s = new Array(e.length);
    for (let r = 0; r < e.length; r++)
      s[r] = Pi(e[r], t);
    return s;
  } else if (typeof e == "object" && !(e instanceof Date)) {
    if (e.toJSON && typeof e.toJSON == "function" && !n)
      return Pi(e.toJSON(), t, !0);
    const s = {};
    for (const r in e)
      Object.prototype.hasOwnProperty.call(e, r) && (s[r] = Pi(e[r], t));
    return s;
  }
  return e;
}
function tv(e, t) {
  return e.data = ka(e.data, t), delete e.attachments, e;
}
function ka(e, t) {
  if (!e)
    return e;
  if (e && e._placeholder === !0) {
    if (typeof e.num == "number" && e.num >= 0 && e.num < t.length)
      return t[e.num];
    throw new Error("illegal attachments");
  } else if (Array.isArray(e))
    for (let n = 0; n < e.length; n++)
      e[n] = ka(e[n], t);
  else if (typeof e == "object")
    for (const n in e)
      Object.prototype.hasOwnProperty.call(e, n) && (e[n] = ka(e[n], t));
  return e;
}
const nv = [
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
class sv {
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
    return (t.type === Pe.EVENT || t.type === Pe.ACK) && Ni(t) ? this.encodeAsBinary({
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
    const n = ev(t), s = this.encodeAsString(n.packet), r = n.buffers;
    return r.unshift(s), r;
  }
}
class tl extends mt {
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
      s || n.type === Pe.BINARY_ACK ? (n.type = s ? Pe.EVENT : Pe.ACK, this.reconstructor = new rv(n)) : super.emitReserved("decoded", n);
    } else if (el(t) || t.base64)
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
      if (!iv(a) || a < 1)
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
      if (tl.isPayloadValid(s.type, i))
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
        return $c(n);
      case Pe.DISCONNECT:
        return n === void 0;
      case Pe.CONNECT_ERROR:
        return typeof n == "string" || $c(n);
      case Pe.EVENT:
      case Pe.BINARY_EVENT:
        return Array.isArray(n) && (typeof n[0] == "number" || typeof n[0] == "string" && nv.indexOf(n[0]) === -1);
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
class rv {
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
      const n = tv(this.reconPack, this.buffers);
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
const iv = Number.isInteger || function(e) {
  return typeof e == "number" && isFinite(e) && Math.floor(e) === e;
};
function $c(e) {
  return Object.prototype.toString.call(e) === "[object Object]";
}
const ov = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Decoder: tl,
  Encoder: sv,
  get PacketType() {
    return Pe;
  }
}, Symbol.toStringTag, { value: "Module" }));
function mn(e, t, n) {
  return e.on(t, n), function() {
    e.off(t, n);
  };
}
const av = Object.freeze({
  connect: 1,
  connect_error: 1,
  disconnect: 1,
  disconnecting: 1,
  // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
  newListener: 1,
  removeListener: 1
});
class $f extends mt {
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
    if (av.hasOwnProperty(t))
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
class Ta extends mt {
  constructor(t, n) {
    var s;
    super(), this.nsps = {}, this.subs = [], t && typeof t == "object" && (n = t, t = void 0), n = n || {}, n.path = n.path || "/socket.io", this.opts = n, po(this, n), this.reconnection(n.reconnection !== !1), this.reconnectionAttempts(n.reconnectionAttempts || 1 / 0), this.reconnectionDelay(n.reconnectionDelay || 1e3), this.reconnectionDelayMax(n.reconnectionDelayMax || 5e3), this.randomizationFactor((s = n.randomizationFactor) !== null && s !== void 0 ? s : 0.5), this.backoff = new ar({
      min: this.reconnectionDelay(),
      max: this.reconnectionDelayMax(),
      jitter: this.randomizationFactor()
    }), this.timeout(n.timeout == null ? 2e4 : n.timeout), this._readyState = "closed", this.uri = t;
    const r = n.parser || ov;
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
    this.engine = new Gy(this.uri, this.opts);
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
    ho(() => {
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
    return s ? this._autoConnect && !s.active && s.connect() : (s = new $f(this, t, n), this.nsps[t] = s), s;
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
function Mi(e, t) {
  typeof e == "object" && (t = e, e = void 0), t = t || {};
  const n = Yy(e, t.path || "/socket.io"), s = n.source, r = n.id, i = n.path, o = xr[r] && i in xr[r].nsps, a = t.forceNew || t["force new connection"] || t.multiplex === !1 || o;
  let l;
  return a ? l = new Ta(s, t) : (xr[r] || (xr[r] = new Ta(s, t)), l = xr[r]), n.query && !t.query && (t.query = n.queryKey), l.socket(n.path, t);
}
Object.assign(Mi, {
  Manager: Ta,
  Socket: $f,
  io: Mi,
  connect: Mi
});
const lv = 5e3;
function cv() {
  const e = oe([]), t = oe(!1), n = oe(""), s = oe(!1), r = oe(!1), i = oe(!1), o = oe("connecting"), a = oe(0), l = 5, u = oe({}), c = oe(null), w = oe(""), A = [];
  let I = null;
  const O = 6e4, H = () => {
    t.value = !1, I && (clearTimeout(I), I = null);
  }, ue = () => {
    t.value = !0, I && clearTimeout(I), I = setTimeout(H, O);
  };
  let R = null;
  const fe = 1e3, _e = 15e3;
  let x = null;
  const M = /* @__PURE__ */ new Set(["ai_config_missing", ...Yu]);
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
  let ge = null, Oe = null, Se = null, Ke = null, Ue = null, st = !1, he = null, Te, ye, Ze;
  const Je = ($) => {
    var z;
    return (z = Ii($ ?? null)) == null ? void 0 : z.sub;
  }, lt = ($) => {
    Te = $, $ && R != null && R.connected && R.emit("refresh_token", { conversation_token: $ });
  }, je = ($) => {
    ye = $;
  }, Lt = () => {
    var f;
    const $ = Te || (Zi() ? null : Xi().read()), z = {};
    $ && (z.conversation_token = $), ye && (z.widget_id = ye);
    try {
      z.page_url = Tf() || (window.parent !== window && ((f = window.parent.location) != null && f.href) ? window.parent.location.href : document.referrer || window.location.href);
    } catch {
      z.page_url = document.referrer || "";
    }
    return z;
  }, _n = ($) => {
    R = Mi(`${Ds.WS_URL}/widget`, {
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
        S = !0, W.value = f, se(), o.value = "failed", fa(f) ? st || Ue == null || Ue() : _(z.data);
        return;
      }
      a.value++, console.error("Socket connection failed, attempt:", a.value), a.value >= l && (o.value = "failed"), R && !R.active && me();
    }), R.on("chat_response", (z) => {
      if (H(), z.session_id ? (console.log("Captured session_id from chat_response:", z.session_id), w.value = z.session_id) : console.warn("No session_id in chat_response data:", z), z.type === "agent_message") {
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
      z.session_id && (w.value = z.session_id, he = {
        session_id: z.session_id,
        authenticated: !!z.authenticated,
        created: !!z.created
      }, Ke == null || Ke(he));
    }), R.on("error", _);
    for (const [z, f] of A) R.on(z, f);
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
  }, wt = () => (R && R.disconnect(), Me()), Ut = ($) => {
    ge = $;
  }, Wt = ($) => {
    Ue = $;
  }, qt = ($) => {
    Ke = $, he && $(he);
  }, Nt = ($) => {
    Oe = $;
  }, yn = ($) => {
    Se = $;
  }, _ = ($) => {
    H(), n.value = Lp($), s.value = !0, setTimeout(() => {
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
  }, J = async ($, z, f = [], y = {}) => {
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
    e.value = [], i.value = !1, w.value = "", H(), c.value = null;
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
      const y = (ne) => {
        f || (f = !0, clearTimeout(q), R == null || R.off("chat_ended", N), R == null || R.off("error", C), ne && Q(), z(ne));
      }, N = () => y(!0), C = (ne) => {
        (ne == null ? void 0 : ne.type) === "end_chat_error" && y(!1);
      }, q = setTimeout(() => y(!1), lv);
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
    reconnect: wt,
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
    currentSessionId: w,
    setToken: lt,
    setWidgetId: je,
    on: ($, z) => {
      A.push([$, z]), R == null || R.on($, z);
    },
    emit: ($, z) => {
      R == null || R.emit($, z);
    }
  };
}
const uv = 8, fv = 200;
function hv(e) {
  const t = e && typeof e == "object" ? e.details : null;
  if (!t || typeof t != "object" || Array.isArray(t)) return null;
  const n = Object.entries(t).filter(([s, r]) => s.trim() && ["string", "number", "boolean"].includes(typeof r) && String(r).trim()).slice(0, uv).map(([s, r]) => ({ key: s.trim().slice(0, 60), value: String(r).trim().slice(0, fv) }));
  return n.length ? n : null;
}
const dv = 140;
function pv(e) {
  const t = e && typeof e == "object" ? e.summary : null;
  return typeof t == "string" && t.trim() ? t.trim().slice(0, dv) : null;
}
const mv = 2e3, gv = 4;
function _v(e) {
  if (typeof e.message != "string" || !e.message.trim()) return null;
  const t = Array.isArray(e.suggestions) ? e.suggestions.filter((n) => typeof n == "string" && !!n.trim()).map((n) => ({ label: n.slice(0, 80), kind: "text", value: n.slice(0, 500) })).slice(0, gv) : [];
  return { message: e.message.slice(0, mv), chips: t, open: e.open === !0, source: "host" };
}
const yv = 2e3;
function vv(e) {
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
  function w(S) {
    r = S && typeof S == "object" && !Array.isArray(S) ? S : null, r && e.emit("set_context", { context: r });
  }
  function A(S, W, se, me = {}) {
    var ge;
    (ge = e.onOutcome) == null || ge.call(e, {
      label: S,
      status: W,
      preview: se,
      summary: W === "ok" ? pv(me.result) : null,
      error: typeof me.error == "string" && me.error ? me.error : null
    });
  }
  function I(S, W, se = {}) {
    const me = o.get(S);
    me && (n(me.timer), A(me.label, W, me.preview, se)), o.delete(S);
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
    const me = Math.max(1, S.timeout_s) * 1e3 + yv;
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
        return w(S.context), !0;
      case "HOST_PROMPT": {
        const se = _v(S);
        return se && ((W = e.onPrompt) == null || W.call(e, se)), !0;
      }
      case "ACTION_PREVIEW_DONE": {
        const se = l.get(String(S.callId));
        if (!se) return !0;
        if (l.delete(se.call_id), se.confirm === "always") {
          const ge = hv(S.preview);
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
    O(null), l.delete(S.call_id), A(S.label, "declined", W);
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
function bv(e, t, n) {
  const s = oe(null), r = vv({
    postToHost: vt,
    emit: e.emit,
    // Actions need a page whose origin we know: the framed widget with a real host.
    trustedHostOrigin: () => {
      if (!Zi()) return null;
      const o = hf();
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
  return window.addEventListener("message", i), oo(() => {
    window.removeEventListener("message", i), r.dispose();
  }), { pendingConfirm: s, approveAction: r.approve, declineAction: r.decline, runLocalAction: r.runLocal };
}
function Bc(e, t) {
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
const wv = 6e4;
function kv(e) {
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
    }, I.nudge.after_min * wv));
  }
  function u(I) {
    if (a = I.nudge && I.step_id ? { stepId: I.step_id, nudge: I.nudge } : null, !a) {
      i(), o = null;
      return;
    }
    o === a.stepId && s !== null || l();
  }
  let c = !1;
  function w(I) {
    var ue;
    const O = (I == null ? void 0 : I.view) ?? null;
    if ((ue = O == null ? void 0 : O.notice) != null && ue.text && e.addNotice(O.notice.text, O.notice.kind), !O && c) return;
    if (c = !!(O != null && O.finished) && !!O.journey_name, !O || O.finished || O.waiting) {
      i(), a = null, o = null;
      const R = O != null && O.journey_name ? Bc(O, !!O.finished) : null;
      e.showStep(null, R), O != null && O.finished && O.message && e.addNotice(O.message, "message");
      return;
    }
    const H = O.message ? { message: O.message, chips: O.chips ?? [], open: !1, source: "journey" } : null;
    e.showStep(H, Bc(O, !1)), O.fresh && O.auto_open && e.openChat(), u(O);
  }
  function A() {
    s !== null && l();
  }
  return {
    handleState: w,
    activity: A,
    sync: (I = {}) => e.emit("journey_sync", I),
    skip: () => e.emit("journey_skip", {}),
    dismiss: () => {
      c = !1, e.showStep(null, null), e.emit("journey_dismiss", {});
    },
    start: (I) => e.emit("journey_start", { key: I }),
    dispose: i
  };
}
function Tv(e) {
  const t = oe(null), n = oe(!1);
  let s = !1;
  const r = [], o = kv({
    emit: (u, c) => {
      s ? e.emit(u, c) : r.push([u, c]);
    },
    showStep: (u, c) => {
      t.value = c;
      const w = e.currentPrompt();
      w && w.source !== "journey" || e.showPrompt(u);
    },
    addNotice: e.addNotice,
    openChat: () => vt({ type: "WIDGET_OPEN_REQUEST" })
  });
  e.on("journey_state", o.handleState), e.on("session_initialized", () => {
    s = !0, o.sync({ url: Tf() });
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
    e.runLocalAction(u, (A) => {
      n.value = !1, A === "ok" && o.sync({ action: u.value });
    }) && (n.value = !0);
  }
  return oo(() => {
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
const wi = (e, t) => Be(e) === Be(t);
function Av(e, t) {
  let n;
  const s = Wh(null), r = () => {
    n = e.value[e.value.length - 1], s.value = null;
  };
  return pt(() => {
    var l;
    return (l = t.value) == null ? void 0 : l.message;
  }, r), pt(e, (l) => {
    (!s.value || !l.some((u) => wi(u, s.value))) && r();
  }, { flush: "sync" }), pt(() => e.value.length, () => {
    if (!t.value || s.value) return;
    const l = e.value, u = l[l.findIndex((c) => wi(c, n)) + 1];
    u && (s.value = u);
  }), { isBefore: (l) => !!t.value && wi(l, s.value), isLast: () => !!t.value && !s.value, index: () => {
    const l = e.value.findIndex((u) => wi(u, s.value));
    return l === -1 ? e.value.length : l;
  } };
}
function Sv(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Zo = { exports: {} }, Uc;
function Ev() {
  return Uc || (Uc = 1, function(e) {
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
      function w(f, y) {
        for (var N = f.className.split(/\s+/), C = 0, q = N.length; C < q; C++) if (N[C] == y) return !0;
        return !1;
      }
      function A(f) {
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
        f.g && c(f.f, [f.a.c("wf", "loading")]), Ke(f, "loading");
      }
      function Se(f) {
        if (f.g) {
          var y = w(f.f, f.a.c("wf", "active")), N = [], C = [f.a.c("wf", "loading")];
          y || N.push(f.a.c("wf", "inactive")), c(f.f, N, C);
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
        (C = y === f.f.serif && N === f.f["sans-serif"]) || (C = Lt() && _n(f, y, N)), C ? r() - f.A >= f.w ? Lt() && _n(f, y, N) && (f.u === null || f.u.hasOwnProperty(f.a.c)) ? Ut(f, f.v) : Ut(f, f.B) : wt(f) : Ut(f, f.v);
      }
      function wt(f) {
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
        y.g && c(y.f, [y.a.c("wf", f.c, W(f).toString(), "active")], [y.a.c("wf", f.c, W(f).toString(), "loading"), y.a.c("wf", f.c, W(f).toString(), "inactive")]), Ke(y, "fontactive", f), this.m = !0, Nt(this);
      }, Wt.prototype.h = function(f) {
        var y = this.a;
        if (y.g) {
          var N = w(y.f, y.a.c("wf", f.c, W(f).toString(), "active")), C = [], q = [y.a.c("wf", f.c, W(f).toString(), "loading")];
          N || C.push(y.a.c("wf", f.c, W(f).toString(), "inactive")), c(y.f, C, q);
        }
        Ke(y, "fontinactive", f), Nt(this);
      };
      function Nt(f) {
        --f.f == 0 && f.j && (f.m ? (f = f.a, f.g && c(f.f, [f.a.c("wf", "active")], [f.a.c("wf", "loading"), f.a.c("wf", "inactive")]), Ke(f, "active")) : Se(f.a));
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
              if (rt.g && c(rt.f, [rt.a.c("wf", fn.c, W(fn).toString(), "loading")]), Ke(rt, "fontloading", fn), rt = null, qt === null) if (window.FontFace) {
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
      var j = { latin: "BESbswy", "latin-ext": "çöüğş", cyrillic: "йяЖ", greek: "αβΣ", khmer: "កខគ", Hanuman: "កខគ" }, re = { thin: "1", extralight: "2", "extra-light": "2", ultralight: "2", "ultra-light": "2", light: "3", regular: "4", book: "4", medium: "5", "semi-bold": "6", semibold: "6", "demi-bold": "6", demibold: "6", bold: "7", "extra-bold": "8", extrabold: "8", "ultra-bold": "8", ultrabold: "8", black: "9", heavy: "9", l: "3", r: "4", b: "7" }, J = { i: "i", italic: "i", n: "n", normal: "n" }, Q = /^(thin|(?:(?:extra|ultra)-?)?light|regular|book|medium|(?:(?:semi|demi|extra|ultra)-?)?bold|black|heavy|l|r|b|[1-9]00)?(n|i|normal|italic)?$/;
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
                  if (Le = Qe[2], Le = Le == null || Le == "" ? "n" : J[Le], Qe = Qe[1], Qe == null || Qe == "") Qe = "4";
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
        }, O(this.c, (this.f.api || "https://f.fontdeck.com/s/css/js/") + A(this.c) + "/" + y + ".js", function(q) {
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
  }(Zo)), Zo.exports;
}
var xv = Ev();
const Cv = /* @__PURE__ */ Sv(xv), zc = [
  "Space Grotesk:400,500,600,700",
  "Instrument Sans:400,500,600",
  "JetBrains Mono:400,500,600"
], Rv = (e) => {
  const t = [...zc], n = (e == null ? void 0 : e.split(",")[0].trim().replace(/['"]/g, "")) || "", s = zc.some(
    (r) => r.toLowerCase().startsWith(n.toLowerCase())
  );
  n && !s && t.push(n), Cv.load({
    google: { families: t },
    active: () => {
      if (!e) return;
      const r = document.querySelector(".chat-container");
      r && (r.style.fontFamily = e.includes(",") ? e : `"${e}", system-ui, sans-serif`);
    }
  });
};
function Iv() {
  const e = oe({}), t = oe(""), n = (r) => {
    var i;
    e.value = r, r.photo_url && (e.value.photo_url = r.photo_url), Rv(r.font_family), vt({
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
const Ov = 13, Lv = 24;
function Nv(e, t) {
  const n = Vr({}), s = [];
  let r = null;
  const i = typeof window < "u" && typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, o = (c) => {
    r || s.length === 0 || (r = setTimeout(a, c));
  }, a = () => {
    r = null;
    const c = s[0];
    if (c === void 0) return;
    const w = e.value[c], A = n[c], I = (w == null ? void 0 : w.message) ?? "";
    if (!A || !w) {
      s.shift(), o(0);
      return;
    }
    if (A.shown >= I.length) {
      A.done = !0, s.shift(), o(0);
      return;
    }
    A.shown += 1;
    const O = I[A.shown - 1];
    t == null || t(), o(O === " " ? Lv : Ov);
  };
  pt(() => e.value.length, (c, w) => {
    w !== void 0 && c < w && (Object.keys(n).forEach((A) => {
      delete n[Number(A)];
    }), s.length = 0);
    for (let A = w ?? 0; A < c; A++) {
      const I = e.value[A];
      if (!I || !I.stream || A in n) continue;
      const O = I.message ?? "";
      i || !O ? n[A] = { shown: O.length, done: !0 } : (n[A] = { shown: 0, done: !1 }, s.push(A));
    }
    o(0);
  });
  const l = (c, w) => {
    const A = n[c];
    return A ? w.slice(0, A.shown) : w;
  }, u = (c) => {
    const w = n[c];
    return !!w && !w.done;
  };
  return Gr(() => {
    r && clearTimeout(r);
  }), { displayText: l, isStreaming: u };
}
function Pv(e) {
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
  }), io(() => window.addEventListener("message", r)), Gr(() => window.removeEventListener("message", r));
}
const Mv = {
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
}, Dv = {
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
}, Fv = {
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
}, $v = {
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
}, Bv = {
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
}, Di = {
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
}, Uv = {
  GLASS: Mv,
  AURORA: Dv,
  TERMINAL: Fv,
  CALM_MINT: $v,
  PLAYFUL: Bv,
  SUNRISE: Di,
  CHATBOT: Di,
  ASK_ANYTHING: Di
}, zv = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", Hc = "'Instrument Sans', system-ui, -apple-system, 'Segoe UI', sans-serif";
function Hv(e) {
  return Math.max(4, Math.round(e * 0.3));
}
function jc(e) {
  const t = (e || "").replace("#", "");
  if (t.length < 6) return "#0B0C10";
  const n = parseInt(t.slice(0, 2), 16), s = parseInt(t.slice(2, 4), 16), r = parseInt(t.slice(4, 6), 16);
  return (0.299 * n + 0.587 * s + 0.114 * r) / 255 > 0.62 ? "#0B0C10" : "#FFFFFF";
}
function jv(e) {
  return Uv[e || ""] || Di;
}
const Wv = "#212529";
function qv(e, t) {
  const n = jv(e), s = (t == null ? void 0 : t.chat_background_color) || "", r = /^#[0-9a-fA-F]{6}$/.test(s), i = s || n.card, o = (t == null ? void 0 : t.chat_text_color) || "", l = /^#[0-9a-fA-F]{6}$/.test(o) && o.toLowerCase() !== Wv ? o : r ? sr(s) ? "#FFFFFF" : "#111111" : n.text, u = r ? sr(s) ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.62)" : n.muted, c = r ? Op(s, 20) : n.agentBg, w = (t == null ? void 0 : t.accent_color) || n.accent, A = r ? !sr(s) : n.light, I = jc(w) === "#0B0C10", O = A === I ? u : w, H = n.mono ? zv : t != null && t.font_family ? `${t.font_family}, ${Hc}` : Hc;
  return {
    "--cm-card": i,
    "--cm-text": l,
    "--cm-muted": u,
    "--cm-agent-bg": c,
    "--cm-accent": w,
    "--cm-on-accent": jc(w),
    "--cm-presence": O,
    "--cm-border": n.border,
    "--cm-glow": n.glow,
    "--cm-radius": `${n.radius}px`,
    "--cm-bubble": `${n.bubble}px`,
    "--cm-bubble-tail": `${Hv(n.bubble)}px`,
    "--cm-field-radius": n.mono ? "7px" : "12px",
    "--cm-avatar-radius": n.mono ? "28%" : "50%",
    "--cm-hairline": n.light ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.08)",
    "--cm-body-font": H
  };
}
const Wc = (e) => {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: e || "USD" }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
};
function Vv() {
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
        minimumFractionDigits: Wc(r),
        maximumFractionDigits: Wc(r)
      }) : String(s);
      return i ? `${i}${a}` : a;
    },
    getCurrencySymbol: (s) => e[s] || s,
    currencySymbols: e
  };
}
const Kv = {
  key: 0,
  class: "widget-unavailable-overlay"
}, Gv = { class: "widget-unavailable-card" }, Yv = {
  key: 0,
  class: "widget-unavailable-footer"
}, Xv = {
  key: 1,
  class: "auth-error-overlay"
}, Zv = { class: "auth-error-card" }, Jv = { class: "auth-error-message" }, Qv = {
  key: 0,
  class: "initializing-overlay"
}, eb = {
  key: 0,
  class: "connecting-message"
}, tb = {
  key: 1,
  class: "failed-message"
}, nb = { class: "welcome-content" }, sb = { class: "welcome-header" }, rb = ["src", "alt"], ib = { class: "welcome-title" }, ob = { class: "welcome-subtitle" }, ab = { class: "welcome-input-container" }, lb = {
  key: 0,
  class: "email-input"
}, cb = ["disabled"], ub = { class: "welcome-message-input" }, fb = ["placeholder", "disabled"], hb = ["disabled"], db = {
  key: 0,
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, pb = {
  key: 1,
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, mb = { class: "landing-page-content" }, gb = { class: "landing-page-header" }, _b = { class: "landing-page-heading" }, yb = { class: "landing-page-text" }, vb = { class: "landing-page-actions" }, bb = { class: "form-fullscreen-content" }, wb = {
  key: 0,
  class: "form-header"
}, kb = {
  key: 0,
  class: "form-title"
}, Tb = {
  key: 1,
  class: "form-description"
}, Ab = { class: "form-fields" }, Sb = ["for"], Eb = {
  key: 0,
  class: "required-indicator"
}, xb = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "autocomplete", "inputmode"], Cb = ["id", "placeholder", "required", "min", "max", "value", "onInput"], Rb = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput"], Ib = ["id", "required", "value", "onChange"], Ob = { value: "" }, Lb = ["value"], Nb = {
  key: 4,
  class: "checkbox-field"
}, Pb = ["id", "required", "checked", "onChange"], Mb = { class: "checkbox-label" }, Db = {
  key: 5,
  class: "radio-group"
}, Fb = ["name", "value", "required", "checked", "onChange"], $b = { class: "radio-label" }, Bb = {
  key: 6,
  class: "field-error"
}, Ub = { class: "form-actions" }, zb = ["disabled"], Hb = {
  key: 0,
  class: "loading-spinner-inline"
}, jb = { key: 1 }, Wb = { class: "header-content" }, qb = ["src", "alt"], Vb = { class: "header-info" }, Kb = { class: "status" }, Gb = { class: "status-text cm-presence" }, Yb = { class: "header-actions" }, Xb = ["disabled", "title", "aria-label", "aria-expanded"], Zb = { class: "ask-anything-header" }, Jb = ["src", "alt"], Qb = { class: "header-info" }, ew = {
  key: 2,
  class: "loading-history"
}, tw = { class: "cm-email-gate-title" }, nw = ["disabled"], sw = {
  key: 0,
  class: "cm-email-gate-error"
}, rw = ["disabled"], iw = {
  key: 1,
  class: "cm-welcome-block"
}, ow = { class: "message agent-message cm-welcome-row" }, aw = ["src", "alt"], lw = {
  key: 0,
  class: "message agent-message cm-welcome-row cm-host-prompt"
}, cw = ["src", "alt"], uw = {
  key: 0,
  class: "cm-msg-avatar",
  "aria-hidden": "true"
}, fw = ["src"], hw = ["src"], dw = { class: "message-col" }, pw = {
  key: 0,
  class: "rating-content"
}, mw = { class: "rating-prompt" }, gw = ["onMouseover", "onMouseleave", "onClick", "disabled"], _w = {
  key: 0,
  class: "feedback-wrapper"
}, yw = { class: "feedback-section" }, vw = ["onUpdate:modelValue", "disabled"], bw = { class: "feedback-counter" }, ww = ["onClick", "disabled"], kw = {
  key: 1,
  class: "submitted-feedback-wrapper"
}, Tw = { class: "submitted-feedback" }, Aw = { class: "submitted-feedback-text" }, Sw = {
  key: 2,
  class: "submitted-message"
}, Ew = {
  key: 1,
  class: "form-content"
}, xw = {
  key: 0,
  class: "form-header"
}, Cw = {
  key: 0,
  class: "form-title"
}, Rw = {
  key: 1,
  class: "form-description"
}, Iw = { class: "form-fields" }, Ow = ["for"], Lw = {
  key: 0,
  class: "required-indicator"
}, Nw = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "disabled", "autocomplete", "inputmode"], Pw = ["id", "placeholder", "required", "min", "max", "value", "onInput", "disabled"], Mw = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "disabled"], Dw = ["id", "required", "value", "onChange", "disabled"], Fw = { value: "" }, $w = ["value"], Bw = {
  key: 4,
  class: "checkbox-field"
}, Uw = ["id", "checked", "onChange", "disabled"], zw = ["for"], Hw = {
  key: 5,
  class: "radio-field"
}, jw = ["id", "name", "value", "checked", "onChange", "disabled"], Ww = ["for"], qw = {
  key: 6,
  class: "field-error"
}, Vw = { class: "form-actions" }, Kw = ["onClick", "disabled"], Gw = {
  key: 2,
  class: "user-input-content"
}, Yw = {
  key: 0,
  class: "user-input-prompt"
}, Xw = {
  key: 1,
  class: "user-input-form"
}, Zw = ["onUpdate:modelValue", "onKeydown"], Jw = ["onClick", "disabled"], Qw = {
  key: 2,
  class: "user-input-submitted"
}, e0 = {
  key: 0,
  class: "user-input-confirmation"
}, t0 = {
  key: 3,
  class: "product-message-container"
}, n0 = ["innerHTML"], s0 = {
  key: 1,
  class: "products-carousel"
}, r0 = { class: "carousel-items" }, i0 = ["aria-label"], o0 = {
  key: 0,
  class: "product-image-compact"
}, a0 = ["src", "alt"], l0 = { class: "product-info-compact" }, c0 = { class: "product-text-area" }, u0 = { class: "product-title-compact" }, f0 = {
  key: 0,
  class: "product-variant-compact"
}, h0 = { class: "product-price-compact" }, d0 = { class: "product-actions-compact" }, p0 = ["onClick"], m0 = {
  key: 2,
  class: "no-products-message"
}, g0 = {
  key: 3,
  class: "no-products-message"
}, _0 = ["innerHTML"], y0 = ["innerHTML"], v0 = {
  key: 2,
  class: "message-attachments"
}, b0 = {
  key: 0,
  class: "attachment-image-container"
}, w0 = ["src", "alt", "onClick"], k0 = { class: "attachment-image-info" }, T0 = ["href"], A0 = { class: "attachment-size" }, S0 = ["href"], E0 = { class: "attachment-size" }, x0 = {
  key: 0,
  class: "citation-chips"
}, C0 = ["title"], R0 = { class: "message-info" }, I0 = {
  key: 0,
  class: "agent-name"
}, O0 = {
  key: 2,
  class: "message agent-message cm-welcome-row cm-host-prompt"
}, L0 = ["src", "alt"], N0 = {
  key: 5,
  class: "cm-quick-actions-bar"
}, P0 = ["disabled", "onClick"], M0 = {
  key: 0,
  class: "file-previews-widget"
}, D0 = {
  class: "file-preview-content-widget",
  style: { cursor: "pointer" }
}, F0 = ["src", "alt", "onClick"], $0 = ["onClick"], B0 = { class: "file-preview-info-widget" }, U0 = { class: "file-preview-name-widget" }, z0 = { class: "file-preview-size-widget" }, H0 = ["onClick"], j0 = {
  key: 1,
  class: "upload-progress-widget"
}, W0 = { class: "message-input" }, q0 = ["placeholder", "disabled"], V0 = ["disabled", "title"], K0 = ["disabled"], G0 = {
  key: 2,
  class: "cm-secret-hint",
  role: "alert"
}, Y0 = {
  key: 7,
  class: "new-conversation-section"
}, X0 = { class: "conversation-ended-message" }, Z0 = {
  key: 8,
  class: "ai-disclaimer"
}, J0 = {
  key: 8,
  class: "rating-dialog"
}, Q0 = { class: "rating-content" }, ek = { class: "star-rating" }, tk = ["onClick"], nk = { class: "rating-actions" }, sk = ["disabled"], rk = {
  key: 0,
  class: "preview-modal-image-container"
}, ik = ["src", "alt"], ok = { class: "preview-modal-filename" }, ak = {
  key: 3,
  class: "widget-loading"
}, qc = 3, lk = "image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls", ck = /* @__PURE__ */ Hn({
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
    } = Iv(), { formatCurrency: a } = Vv(), {
      messages: l,
      loading: u,
      errorMessage: c,
      showError: w,
      loadingHistory: A,
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
      onWorkflowState: Ke,
      onWorkflowProceeded: Ue,
      currentSessionId: st,
      setToken: he,
      setWidgetId: Te,
      onSessionState: ye,
      onReauthorize: Ze,
      on: Je,
      emit: lt
    } = cv(), je = oe(null), { receipts: Lt, addReceipt: _n, receiptsAfter: Me } = H_(l), { pendingConfirm: wt, approveAction: Ut, declineAction: Wt, runLocalAction: qt } = bv(
      { on: Je, emit: lt },
      (h) => {
        je.value = h;
      },
      _n
    ), { journeyProgress: Nt, chipBusy: yn, runChip: _, skipStep: v, dismissJourney: L, noteActivity: D } = Tv({
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
      h.kind === "action" && !yn.value && !wt.value && (X.value && j(X.value), l.value.push({ message: h.label, message_type: "user", created_at: (/* @__PURE__ */ new Date()).toISOString(), session_id: "", attributes: { source: "journey" } })), _(h, Xn);
    }, P = ae(() => {
      const h = je.value;
      return !(h != null && h.chips.length) || wt.value || u.value ? [] : h.chips;
    }), X = ae(() => {
      const h = je.value;
      return !h || h.source !== "journey" ? h : l.value.some((Y) => Y.message_type === "bot" && Y.message === h.message) ? null : h;
    }), V = ae(() => u.value ? null : X.value), K = Av(l, V), j = (h) => {
      l.value.splice(K.index(), 0, {
        message: h.message,
        message_type: "bot",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: "",
        attributes: { source: h.source }
      });
    }, { displayText: re, isStreaming: J } = Nv(l, () => as(() => bn()));
    Pv(l);
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
      setToken: qn,
      ensureFresh: Zr
    } = oy({
      onTokenChanged: (h) => {
        Ls() && vt({ type: "TOKEN_UPDATE", token: h }), he(h);
      },
      onIdentityExpired: () => {
        il();
      },
      // A framed widget holds the token only in memory: the host page keeps it, so
      // it must hear when the widget lets it go.
      onTokenCleared: () => {
        Zi() && Ls() && vt({ type: "TOKEN_CLEAR" });
      },
      store: Sf(n.value || "")
    });
    ae(() => !!rt.value);
    const zt = oe(null), Pt = oe(!1), Vt = oe(!1);
    t.initialAuthError && (zt.value = t.initialAuthError, Pt.value = !0, Qe.value = !1), o();
    const At = window.__INITIAL_DATA__;
    fn((At == null ? void 0 : At.widgetId) || "", At == null ? void 0 : At.initialToken), rt.value && (be.value = !0);
    const Vn = oe(!1);
    (At == null ? void 0 : At.allowAttachments) !== void 0 && (Vn.value = At.allowAttachments);
    const Kn = oe(null), {
      chatStyles: gs,
      chatIconStyles: Jr,
      agentBubbleStyles: Rn,
      userBubbleStyles: hn,
      messageNameStyles: Kt,
      headerBorderStyles: Qr,
      photoUrl: ft,
      shadowStyle: mo
    } = fy(s), ei = oe(null), {
      uploadedAttachments: $e,
      previewModal: Gn,
      previewFile: _s,
      formatFileSize: Bs,
      isImageAttachment: lr,
      getDownloadUrl: ys,
      getPreviewUrl: cr,
      handleFileSelect: ti,
      handleDrop: ni,
      handleDragOver: si,
      handleDragLeave: ri,
      handlePaste: dn,
      removeAttachment: ii,
      openPreview: Yn,
      closePreview: en,
      openFilePicker: oi,
      isImage: vs
    } = py(rt, ei);
    ae(() => l.value.some(
      (h) => h.message_type === "form" && (!h.isSubmitted || h.isSubmitted === !1)
    ));
    const vn = ae(() => {
      var h;
      return I.value && be.value || !ko.value ? O.value === "connected" && !u.value : br(de.value.trim()) && O.value === "connected" && !u.value || ((h = window.__INITIAL_DATA__) == null ? void 0 : h.workflow);
    }), bs = ae(() => vn.value || u.value && O.value === "connected" && I.value), Us = ae(() => O.value === "connected" ? rn.value ? "Ask me anything..." : "Type a message..." : "Connecting..."), zs = oe(!1), In = ae(() => G_(Q.value)), tn = async () => {
      var p;
      if (!Q.value.trim() && $e.value.length === 0 || In.value) return;
      if (u.value && I.value) {
        zs.value = !0;
        return;
      }
      !I.value && de.value && await kt();
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
    const Xn = (h) => {
      vn.value && (Q.value = h, tn());
    }, pn = () => {
      vt({ type: "WIDGET_MINIMIZE" });
    }, Zn = (h) => {
      h.key === "Enter" && !h.shiftKey && (h.preventDefault(), h.stopPropagation(), tn());
    }, kt = async ({ afterRefusal: h = !1 } = {}) => {
      var m, Y, p, ce;
      try {
        if (!n.value)
          return console.error("Widget ID is not available"), zt.value = "Widget ID is not available. Please refresh and try again.", Pt.value = !0, !1;
        await Zr(n.value);
        const Ye = new URL(`${Ds.API_URL}/widgets/${n.value}`);
        de.value.trim() && br(de.value.trim()) && Ye.searchParams.append("email", de.value.trim());
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
            const ns = (await at.json()).detail;
            if ((ns == null ? void 0 : ns.code) === ty)
              return il(), !1;
            const Ks = typeof ns == "string" ? ns : "";
            (Ks.includes("generate-token") || Ks.includes("API key") || Ks.includes("Token required")) && (Vt.value = !0, zt.value = "Widget authentication not configured. Please contact the website administrator.", Pt.value = !0, qn(null));
          } catch {
            zt.value = "Authentication required. Your token has expired or is invalid. Please refresh the page.", Pt.value = !0, qn(null);
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
        et.token && qn(et.token), be.value = !0, zt.value = null, Pt.value = !1, he(rt.value || void 0);
        const pr = await fe();
        return !pr && fa(W.value) && !h ? await kt({ afterRefusal: !0 }) : (pr || console.error("Chat service not reachable yet; retrying in the background"), await go(), (m = et.agent) != null && m.customization && i(et.agent.customization), et.agent && !(et != null && et.human_agent) && (r.value = et.agent.name), et != null && et.human_agent && (M.value = et.human_agent), ((Y = et.agent) == null ? void 0 : Y.allow_attachments) !== void 0 && (Vn.value = et.agent.allow_attachments), ((p = et.agent) == null ? void 0 : p.workflow) !== void 0 && (window.__INITIAL_DATA__ = window.__INITIAL_DATA__ || {}, window.__INITIAL_DATA__.workflow = et.agent.workflow), (ce = et.agent) != null && ce.workflow && await Oe(), !0);
      } catch (Ye) {
        return console.error("Error checking authorization:", Ye), zt.value = "An unexpected error occurred. Please try again.", Pt.value = !0, be.value = !1, !1;
      } finally {
        Qe.value = !1;
      }
    }, go = async () => {
      !I.value && be.value && (I.value = !0, await R());
    }, bn = () => {
      Kn.value && (Kn.value.scrollTop = Kn.value.scrollHeight);
    };
    pt(() => l.value, (h) => {
      as(() => {
        bn();
      });
    }, { deep: !0 }), pt([wt, V, () => Lt.value.length, u], ([h, m, Y, p]) => {
      (h || m || Y || p) && as(() => bn());
    }), pt(O, (h, m) => {
      h === "connected" && m !== "connected" && N(100);
    }), pt(() => l.value.length, (h, m) => {
      h > 0 && m === 0 && N(100);
    });
    let ai = null;
    pt(() => l.value, (h) => {
      const m = h[h.length - 1];
      !Rc(m) || m === ai || (ai = m, le(m));
    }, { deep: !0 });
    const li = async () => {
      (await _e() || fa(W.value)) && await kt();
    }, ur = oe(!1), ws = oe(0), Hs = oe(""), nn = oe(0), Gt = oe(!1), ht = oe({}), yt = oe(!1), ut = oe({}), sn = oe(!1), On = oe(null), G = oe("Start Chat"), d = oe(!1), T = oe(null);
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
      () => Yi(M.value.human_agent_profile_pic)
    ), le = async (h) => {
      var m, Y, p, ce, Ye;
      if (Rc(h)) {
        try {
          if (h.session_id && rt.value && n.value) {
            const we = await rl(h.session_id, {
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
          const we = h.agent_name || ((Ye = M.value) == null ? void 0 : Ye.human_agent_name) || r.value || "our agent";
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
    }, Ge = () => {
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
        const p = ht.value[Y.name], ce = ui(Y, p);
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
        if ((Y = T.value) != null && Y.fields && (ce = T.value.fields.find((Ye) => Ye.name === h)), !ce && ((p = ge.value) != null && p.fields) && (ce = ge.value.fields.find((Ye) => Ye.name === h)), ce) {
          const Ye = ui(ce, m);
          Ye ? (ut.value[h] = Ye, console.log(`Validation error for ${h}:`, Ye)) : delete ut.value[h];
        }
      } else
        delete ut.value[h], console.log(`Cleared error for ${h}`);
    }, ci = (h) => {
      const m = h.replace(/\D/g, "");
      return m.length >= 7 && m.length <= 15;
    }, ui = (h, m) => {
      if (h.required && (!m || m.toString().trim() === ""))
        return `${h.label} is required`;
      if (!m || m.toString().trim() === "")
        return null;
      if (h.type === "email" && !br(m))
        return "Please enter a valid email address";
      if (h.type === "tel" && !ci(m))
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
    }, Bf = async () => {
      if (!(yt.value || !T.value))
        try {
          yt.value = !0, ut.value = {};
          let h = !1;
          for (const m of T.value.fields || []) {
            const Y = ht.value[m.name], p = ui(m, Y);
            p && (ut.value[m.name] = p, h = !0, console.log(`Validation error for field ${m.name}:`, p));
          }
          if (h) {
            yt.value = !1, console.log("Validation failed, not submitting");
            return;
          }
          await me(ht.value), d.value = !1, T.value = null, ht.value = {};
        } catch (h) {
          console.error("Failed to submit full screen form:", h);
        } finally {
          yt.value = !1, console.log("Full screen form submission completed");
        }
    }, Uf = (h, m) => {
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
    }, zf = (h) => {
      if (!h) return "";
      let m = h.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "");
      const Y = [];
      return m = m.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (p, ce, Ye) => {
        const we = `__MARKDOWN_LINK_${Y.length}__`;
        return console.log("Found markdown link:", p, "-> placeholder:", we), Y.push(p), we;
      }), console.log("After replacing markdown links with placeholders:", m), console.log("Markdown links array:", Y), m = m.replace(/https?:\/\/[^\s\)]+/g, "[link removed]"), console.log("After removing standalone URLs:", m), Y.forEach((p, ce) => {
        m = m.replace(`__MARKDOWN_LINK_${ce}__`, p), console.log(`Restored markdown link ${ce}:`, p);
      }), m = m.replace(/\n\s*\n\s*\n/g, `

`).trim(), m;
    }, nl = oe(!1);
    oe(!1);
    const _o = ae(() => {
      var h;
      return !!((h = M.value) != null && h.human_agent_name);
    }), sl = ae(() => {
      var h;
      return Q_((h = window.__INITIAL_DATA__) == null ? void 0 : h.presence, _o.value);
    }), js = ae(() => {
      var h;
      return !((h = window.__INITIAL_DATA__) != null && h.hideBranding);
    }), Hf = ae(() => Vn.value && _o.value && $e.value.length < qc), jf = async () => {
      try {
        sn.value = !1, On.value = null, await Se();
      } catch (h) {
        console.error("Failed to proceed workflow:", h);
      }
    }, yo = async (h) => {
      try {
        if (!h.userInputValue || !h.userInputValue.trim())
          return;
        const m = h.userInputValue.trim();
        h.isSubmitted = !0, h.submittedValue = m, await H(m, de.value);
      } catch (m) {
        console.error("Failed to submit user input:", m), h.isSubmitted = !1, h.submittedValue = null;
      }
    }, rl = (h, { reason: m, description: Y, keepalive: p = !1 } = {}) => {
      const ce = new URL(`${Ds.API_URL}/widgets/${n.value}/end-chat`);
      return ce.searchParams.append("session_id", h), m && ce.searchParams.append("reason", m), Y && ce.searchParams.append("description", Y), fetch(ce, {
        method: "POST",
        keepalive: p,
        headers: {
          Authorization: `Bearer ${rt.value}`,
          "Content-Type": "application/json"
        }
      });
    }, Wf = async (h) => {
      try {
        typeof h == "string" && h && rt.value && n.value && await rl(h, { reason: "CUSTOMER_REQUEST", keepalive: !0 });
      } catch {
      } finally {
        vt({ type: "END_CHAT_DONE" });
      }
    }, il = () => {
      if (!Ls()) {
        ol();
        return;
      }
      vt({ type: "IDENTITY_EXPIRED" });
    }, ol = async () => {
      rt.value && (qn(null), await hr());
    }, qf = async (h) => {
      const m = cs(h);
      !m || m === rt.value || (qn(m), await hr());
    }, hr = async () => {
      var h, m, Y;
      try {
        let p = 0;
        const ce = 50;
        for (; !((h = window.__INITIAL_DATA__) != null && h.widgetId) && p < ce; )
          await new Promise((we) => setTimeout(we, 100)), p++;
        return (m = window.__INITIAL_DATA__) != null && m.widgetId ? (Te(window.__INITIAL_DATA__.widgetId), await kt() ? ((Y = window.__INITIAL_DATA__) != null && Y.workflow && be.value && await Oe(), !0) : (O.value = "connected", !1)) : (console.error("Widget data not available after waiting"), !1);
      } catch (p) {
        return console.error("Failed to initialize widget:", p), !1;
      }
    };
    window.addEventListener("message", (h) => {
      h.source === window.parent && (!h.data || typeof h.data.type != "string" || M_(h.data) || (h.data.type === "SCROLL_TO_BOTTOM" && bn(), h.data.type === "HOST_PAGE" && Af(h.data.url), h.data.type === "END_CHAT" && Ls() && Wf(h.data.sessionId), h.data.type === "IDENTITY_UNAVAILABLE" && Ls() && ol(), h.data.type === "TOKEN_REFRESH" && Ls() && qf(h.data.token), h.data.type === "WIDGET_VISIBILITY" && (gl.value = !!h.data.open), h.data.type === "WIDGET_DISPLAY" && (To.value = {
        mode: h.data.mode,
        width: h.data.width,
        height: h.data.height,
        hotkey: h.data.hotkey
      }), h.data.type === "PREFILL_MESSAGE" && typeof h.data.text == "string" && (Q.value = h.data.text.slice(0, 2e3), as(() => {
        const m = document.querySelector(
          ".message-input input, .welcome-message-field"
        );
        m == null || m.focus();
      }))));
    }), window.addEventListener("keydown", (h) => {
      h.key !== "Escape" || h.defaultPrevented || !Zi() || vt({ type: "WIDGET_ESCAPE" });
    });
    const Vf = () => {
      S(async () => {
        await kt();
      }), Ze(async () => {
        await kt();
      }), ye(({ session_id: h, authenticated: m, created: Y }) => {
        vt({
          type: "CHAT_SESSION",
          sessionId: h,
          authenticated: m,
          created: Y
        });
      }), Ke((h) => {
        var m;
        if (G.value = h.button_text || "Start Chat", h.type === "landing_page")
          On.value = h.landing_page_data, sn.value = !0, d.value = !1;
        else if (h.type === "form" || h.type === "display_form")
          if (((m = h.form_data) == null ? void 0 : m.form_full_screen) === !0)
            T.value = h.form_data, d.value = !0, sn.value = !1;
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
    }, Kf = async () => {
      try {
        await hr(), await Oe();
      } catch (h) {
        throw console.error("Failed to start new conversation:", h), h;
      }
    }, fi = ae(
      () => {
        var h;
        return s.value.allow_new_chat === !0 && l.value.length > 0 && !((h = M.value) != null && h.human_agent_name) && !As.value;
      }
    ), Jn = oe(!1), Qn = oe(""), es = oe(!1);
    let ks = null;
    const Ws = () => {
      es.value = !1, Qn.value = "", ks && (clearTimeout(ks), ks = null);
    }, al = () => {
      if (!Jn.value) {
        if (es.value) {
          Ws();
          return;
        }
        es.value = !0, Qn.value = "", ks = setTimeout(Ws, eg);
      }
    };
    pt(fi, (h) => {
      h || Ws();
    });
    const ll = async () => {
      Jn.value || (ks && (clearTimeout(ks), ks = null), await Gf(), Qn.value || (es.value = !1));
    }, Gf = async () => {
      if (!Jn.value) {
        Jn.value = !0, Qn.value = "";
        try {
          if (!await ue()) {
            Qn.value = xc;
            return;
          }
          M.value = {}, Q.value = "", $e.value = [], await hr();
        } catch (h) {
          console.error("Failed to start a new chat:", h), Qn.value = xc;
        } finally {
          Jn.value = !1;
        }
      }
    }, Yf = async () => {
      B.value = !1, l.value = [], M.value = {}, await Kf();
    };
    io(async () => {
      await hr(), Vf(), $(), document.addEventListener("click", Le), (() => {
        const m = l.value.length > 0, Y = O.value === "connected", p = document.querySelector('input[type="text"], textarea') !== null;
        return m || Y || p;
      })() && N(100);
    }), Gr(() => {
      window.removeEventListener("message", (h) => {
        h.data.type === "SCROLL_TO_BOTTOM" && bn();
      }), document.removeEventListener("click", Le), De && (De.disconnect(), De = null), $.timeoutId && (clearTimeout($.timeoutId), $.timeoutId = null), y = !0, C(), ne(), $s(), Ws(), x();
    });
    const qs = ae(() => s.value.chat_style === "AURORA"), rn = ae(() => s.value.chat_style === "ASK_ANYTHING" || qs.value), cl = ae(() => s.value.customization_metadata), Vs = ae(() => {
      var m;
      const h = (m = cl.value) == null ? void 0 : m.avatar_style;
      return h === "orb" ? !0 : h === "photo" ? !1 : qs.value && !s.value.photo_url;
    }), Ts = ae(() => {
      var h;
      return Z_(r.value || "", (h = cl.value) == null ? void 0 : h.orb_variant);
    }), Xf = {
      GLASS: "theme-glass",
      TERMINAL: "theme-terminal",
      PLAYFUL: "theme-playful",
      CALM_MINT: "theme-calm",
      SUNRISE: "theme-sunrise"
    }, Zf = ae(() => Xf[s.value.chat_style] || ""), Jf = ae(() => qv(s.value.chat_style, {
      chat_background_color: s.value.chat_background_color,
      chat_text_color: s.value.chat_text_color,
      accent_color: s.value.accent_color,
      font_family: s.value.font_family
    })), vo = ae(
      () => Array.isArray(s.value.quick_actions) ? s.value.quick_actions.filter((h) => !!h && h.trim().length > 0) : []
    ), ul = ae(() => (s.value.welcome_message || "").trim()), fl = ae(
      () => !rn.value && l.value.length === 0 && !A.value && !As.value
    ), Qf = ae(
      () => fl.value && ul.value.length > 0
    ), eh = ae(
      () => fl.value && !B.value && vo.value.length > 0
    ), hi = ae(() => s.value.show_citations === !0), hl = ae(() => J_(s.value.show_ai_disclaimer, _o.value)), th = (h) => /^[0-9a-f]{16,}$/i.test(h) || /^[0-9a-f-]{32,}$/i.test(h), bo = (h) => {
      const m = (h || "").trim().toLowerCase();
      return !m || m === "unknown" ? "Knowledge base" : m.charAt(0).toUpperCase() + m.slice(1);
    }, wo = (h) => {
      let m = ((h == null ? void 0 : h.name) || "").trim();
      return !m || (m = m.replace(/^[0-9a-f]{16,}[_-]/i, "").replace(/\.(pdf|txt|md|html?|docx?|csv|json)$/i, ""), !m || th(m)) ? bo(h == null ? void 0 : h.type) : m;
    }, dl = (h) => {
      const m = wo(h), Y = bo(h == null ? void 0 : h.type);
      return m === Y ? Y : `${m} · ${Y}`;
    }, ko = ae(() => s.value.collect_email === !0 && !rn.value), pl = oe(!1), ts = oe(""), dr = oe(!1), As = ae(() => !I.value && ko.value && !pl.value), ml = async () => {
      const h = de.value.trim();
      if (!h) {
        ts.value = "Please enter your email address.";
        return;
      }
      if (!br(h)) {
        ts.value = "Please enter a valid email address.";
        return;
      }
      ts.value = "", dr.value = !0;
      try {
        await kt(), pl.value = !0;
      } catch {
        ts.value = "Something went wrong. Please try again.";
      } finally {
        dr.value = !1;
      }
    }, To = oe(null), gl = oe(!0), Ao = { mode: "floating", width: 400, height: 560 }, di = ae(
      () => {
        var h;
        return To.value || ((h = s.value.customization_metadata) == null ? void 0 : h.widget_display) || null;
      }
    ), nh = ae(() => {
      const h = di.value;
      return h ? typeof h.mode == "string" && h.mode !== Ao.mode || typeof h.width == "number" && h.width !== Ao.width || typeof h.height == "number" && h.height !== Ao.height : !1;
    }), sh = ae(() => {
      var m;
      const h = {
        width: "100%",
        height: "100%",
        borderRadius: "var(--radius-lg)"
      };
      if (nh.value) {
        const Y = (m = di.value) == null ? void 0 : m.mode;
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
    }), _l = ae(() => rn.value && l.value.length === 0), rh = ["form", "user_input", "rating", "product", "shopify_output"], ih = ae(
      () => l.value.some(
        (h) => rh.includes(h.message_type) || Array.isArray(h.attachments) && h.attachments.length > 0
      )
    ), oh = ae(() => {
      var m, Y;
      return rn.value ? !0 : (((m = di.value) == null ? void 0 : m.mode) === "ask-ai" || ((Y = di.value) == null ? void 0 : Y.mode) === "search-bar") && !Vn.value;
    }), So = ae(
      () => oh.value && pe.value && !sn.value && !d.value && !As.value && !B.value && !ih.value
    );
    pt(So, (h) => {
      vt({ type: "WIDGET_SURFACE", palette: h });
    }, { immediate: !0 });
    const ah = ae(
      () => s.value.welcome_subtitle || `Ask a question — ${r.value || "the assistant"} answers from what it knows.`
    ), lh = ae(() => {
      var h;
      return ((h = To.value) == null ? void 0 : h.hotkey) !== !1;
    });
    return (h, m) => {
      var Y;
      return Pt.value && Vt.value ? (b(), k("div", Kv, [
        g("button", {
          type: "button",
          class: "cm-error-close",
          "aria-label": "Close chat",
          title: "Close",
          onClick: pn
        }, "×"),
        g("div", Gv, [
          m[21] || (m[21] = Po('<div class="widget-unavailable-icon-wrapper" data-v-57645127><svg class="widget-unavailable-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-v-57645127><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" data-v-57645127></path><path d="M9 12l2 2 4-4" data-v-57645127></path></svg></div><h2 class="widget-unavailable-title" data-v-57645127>Chat Unavailable</h2><p class="widget-unavailable-message" data-v-57645127> This chat widget is not currently configured. Please contact the website administrator to enable chat support. </p>', 3)),
          js.value ? (b(), k("div", Yv, [
            Ft(Er, {
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
      ])) : Pt.value ? (b(), k("div", Xv, [
        g("button", {
          type: "button",
          class: "cm-error-close",
          "aria-label": "Close chat",
          title: "Close",
          onClick: pn
        }, "×"),
        g("div", Zv, [
          m[22] || (m[22] = Po('<div class="auth-error-header" data-v-57645127><svg class="auth-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-57645127><circle cx="12" cy="12" r="10" data-v-57645127></circle><line x1="12" y1="8" x2="12" y2="12" data-v-57645127></line><line x1="12" y1="16" x2="12.01" y2="16" data-v-57645127></line></svg><h2 data-v-57645127>Authentication Error</h2></div>', 1)),
          g("p", Jv, Z(zt.value), 1),
          g("button", {
            class: "auth-error-refresh-btn",
            onClick: m[0] || (m[0] = () => h.window.location.reload())
          }, " Refresh Page ")
        ])
      ])) : n.value && !Pt.value ? (b(), k("div", {
        key: 2,
        class: Ne(["chat-container cm-surface", [{ collapsed: !pe.value, "ask-anything-style": rn.value, aurora: qs.value }, Zf.value]]),
        style: xe({ ...E(mo), ...sh.value, ...Jf.value })
      }, [
        Qe.value ? (b(), k("div", Qv, m[23] || (m[23] = [
          Po('<div class="loading-spinner" data-v-57645127><div class="dot" data-v-57645127></div><div class="dot" data-v-57645127></div><div class="dot" data-v-57645127></div></div><div class="loading-text" data-v-57645127>Initializing chat...</div>', 2)
        ]))) : te("", !0),
        !Qe.value && E(O) !== "connected" ? (b(), k("div", {
          key: 1,
          class: Ne(["connection-status", E(O)])
        }, [
          E(O) === "connecting" ? (b(), k("div", eb, m[24] || (m[24] = [
            Nn(" Connecting to chat service... ", -1),
            g("div", { class: "loading-dots" }, [
              g("div", { class: "dot" }),
              g("div", { class: "dot" }),
              g("div", { class: "dot" })
            ], -1)
          ]))) : E(O) === "failed" ? (b(), k("div", tb, [
            m[25] || (m[25] = Nn(" Connection failed. ", -1)),
            g("button", {
              onClick: li,
              class: "reconnect-button"
            }, " Click here to reconnect ")
          ])) : te("", !0)
        ], 2)) : te("", !0),
        E(w) ? (b(), k("div", {
          key: 2,
          class: "error-alert",
          style: xe(E(Jr))
        }, Z(E(c)), 5)) : te("", !0),
        So.value ? (b(), Pn(Cg, {
          key: 3,
          messages: E(l),
          draft: Q.value,
          "agent-name": E(r),
          suggestions: vo.value,
          "welcome-title": E(s).welcome_title,
          "welcome-subtitle": ah.value,
          placeholder: Us.value,
          "input-enabled": vn.value,
          "typing-enabled": bs.value,
          loading: E(u),
          "show-citations": hi.value,
          disclaimer: hl.value ? E(Ic) : "",
          "show-branding": js.value,
          active: gl.value,
          hotkey: lh.value,
          "can-start-new-chat": fi.value,
          "starting-new-chat": Jn.value,
          "new-chat-armed": es.value,
          "new-chat-error": Qn.value,
          onNewChat: al,
          onConfirmNewChat: ll,
          onCancelNewChat: Ws,
          "citation-label": wo,
          "citation-tooltip": dl,
          "display-text": E(re),
          "is-streaming": E(J),
          "onUpdate:draft": m[1] || (m[1] = (p) => Q.value = p),
          onSend: tn,
          onAsk: Xn,
          onClose: pn
        }, null, 8, ["messages", "draft", "agent-name", "suggestions", "welcome-title", "welcome-subtitle", "placeholder", "input-enabled", "typing-enabled", "loading", "show-citations", "disclaimer", "show-branding", "active", "hotkey", "can-start-new-chat", "starting-new-chat", "new-chat-armed", "new-chat-error", "display-text", "is-streaming"])) : _l.value ? (b(), k("div", {
          key: 4,
          class: Ne(["welcome-message-section", { aurora: qs.value }]),
          style: xe(E(gs))
        }, [
          g("div", nb, [
            g("div", sb, [
              Vs.value ? (b(), k("div", {
                key: 0,
                class: "welcome-orb",
                style: xe(Ts.value)
              }, null, 4)) : E(ft) ? (b(), k("img", {
                key: 1,
                src: E(ft),
                alt: E(r),
                class: "welcome-avatar"
              }, null, 8, rb)) : te("", !0),
              g("h1", ib, Z(E(s).welcome_title || `Welcome to ${E(r)}`), 1),
              g("p", ob, Z(E(s).welcome_subtitle || "I'm here to help you with anything you need. What can I assist you with today?"), 1)
            ])
          ]),
          g("div", ab, [
            !E(I) && !be.value && ko.value ? (b(), k("div", lb, [
              ss(g("input", {
                "onUpdate:modelValue": m[2] || (m[2] = (p) => de.value = p),
                type: "email",
                placeholder: "Enter your email address",
                disabled: E(u) || E(O) !== "connected",
                class: Ne([{
                  invalid: de.value.trim() && !E(br)(de.value.trim()),
                  disabled: E(O) !== "connected"
                }, "welcome-email-input"])
              }, null, 10, cb), [
                [xs, de.value]
              ])
            ])) : te("", !0),
            g("div", ub, [
              ss(g("input", {
                "onUpdate:modelValue": m[3] || (m[3] = (p) => Q.value = p),
                type: "text",
                placeholder: Us.value,
                onKeypress: Zn,
                onInput: ke,
                onChange: ke,
                disabled: !bs.value,
                class: Ne([{ disabled: !bs.value }, "welcome-message-field"])
              }, null, 42, fb), [
                [xs, Q.value]
              ]),
              g("button", {
                class: Ne(["welcome-send-button", { "aurora-send": qs.value }]),
                style: xe(E(hn)),
                onClick: tn,
                disabled: !Q.value.trim() || !vn.value || In.value
              }, [
                qs.value ? (b(), k("svg", db, m[26] || (m[26] = [
                  g("path", {
                    d: "M12 19V5M12 5L5 12M12 5L19 12",
                    stroke: "currentColor",
                    "stroke-width": "2",
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round"
                  }, null, -1)
                ]))) : (b(), k("svg", pb, m[27] || (m[27] = [
                  g("path", {
                    d: "M5 12L3 21L21 12L3 3L5 12ZM5 12L13 12",
                    stroke: "currentColor",
                    "stroke-width": "2",
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round"
                  }, null, -1)
                ])))
              ], 14, hb)
            ])
          ]),
          js.value ? (b(), k("div", {
            key: 0,
            class: "powered-by-welcome",
            style: xe(E(Kt))
          }, [
            Ft(Er, {
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
        sn.value && On.value ? (b(), k("div", {
          key: 5,
          class: "landing-page-fullscreen",
          style: xe(E(gs))
        }, [
          g("div", mb, [
            g("div", gb, [
              g("h2", _b, Z(On.value.heading), 1),
              g("div", yb, Z(On.value.content), 1)
            ]),
            g("div", vb, [
              g("button", {
                class: "landing-page-button",
                onClick: jf
              }, Z(G.value), 1)
            ])
          ]),
          js.value ? (b(), k("div", {
            key: 0,
            class: "powered-by-landing",
            style: xe(E(Kt))
          }, [
            Ft(Er, {
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
        ], 4)) : d.value && T.value ? (b(), k("div", {
          key: 6,
          class: "form-fullscreen",
          style: xe(E(gs))
        }, [
          g("div", bb, [
            T.value.title || T.value.description ? (b(), k("div", wb, [
              T.value.title ? (b(), k("h2", kb, Z(T.value.title), 1)) : te("", !0),
              T.value.description ? (b(), k("p", Tb, Z(T.value.description), 1)) : te("", !0)
            ])) : te("", !0),
            g("div", Ab, [
              (b(!0), k(Re, null, dt(T.value.fields, (p) => {
                var ce, Ye;
                return b(), k("div", {
                  key: p.name,
                  class: "form-field"
                }, [
                  g("label", {
                    for: `fullscreen-form-${p.name}`,
                    class: "field-label"
                  }, [
                    Nn(Z(p.label) + " ", 1),
                    p.required ? (b(), k("span", Eb, "*")) : te("", !0)
                  ], 8, Sb),
                  p.type === "text" || p.type === "email" || p.type === "tel" ? (b(), k("input", {
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
                  }, null, 42, xb)) : p.type === "number" ? (b(), k("input", {
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
                  }, null, 42, Cb)) : p.type === "textarea" ? (b(), k("textarea", {
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
                  }, null, 42, Rb)) : p.type === "select" ? (b(), k("select", {
                    key: 3,
                    id: `fullscreen-form-${p.name}`,
                    required: p.required,
                    value: ht.value[p.name] || "",
                    onChange: (we) => We(p.name, we.target.value),
                    class: Ne(["form-select", { error: ut.value[p.name] }])
                  }, [
                    g("option", Ob, Z(p.placeholder || "Please select..."), 1),
                    (b(!0), k(Re, null, dt((Array.isArray(p.options) ? p.options : ((ce = p.options) == null ? void 0 : ce.split(`
`)) || []).filter((we) => we.trim()), (we) => (b(), k("option", {
                      key: we,
                      value: we.trim()
                    }, Z(we.trim()), 9, Lb))), 128))
                  ], 42, Ib)) : p.type === "checkbox" ? (b(), k("label", Nb, [
                    g("input", {
                      id: `fullscreen-form-${p.name}`,
                      type: "checkbox",
                      required: p.required,
                      checked: ht.value[p.name] || !1,
                      onChange: (we) => We(p.name, we.target.checked),
                      class: "form-checkbox"
                    }, null, 40, Pb),
                    g("span", Mb, Z(p.label), 1)
                  ])) : p.type === "radio" ? (b(), k("div", Db, [
                    (b(!0), k(Re, null, dt((Array.isArray(p.options) ? p.options : ((Ye = p.options) == null ? void 0 : Ye.split(`
`)) || []).filter((we) => we.trim()), (we) => (b(), k("label", {
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
                      }, null, 40, Fb),
                      g("span", $b, Z(we.trim()), 1)
                    ]))), 128))
                  ])) : te("", !0),
                  ut.value[p.name] ? (b(), k("div", Bb, Z(ut.value[p.name]), 1)) : te("", !0)
                ]);
              }), 128))
            ]),
            g("div", Ub, [
              g("button", {
                onClick: m[4] || (m[4] = () => {
                  console.log("Submit button clicked!"), Bf();
                }),
                disabled: yt.value,
                class: "submit-form-button",
                style: xe(E(hn))
              }, [
                yt.value ? (b(), k("span", Hb, m[30] || (m[30] = [
                  g("div", { class: "dot" }, null, -1),
                  g("div", { class: "dot" }, null, -1),
                  g("div", { class: "dot" }, null, -1)
                ]))) : (b(), k("span", jb, Z(T.value.submit_button_text || "Submit"), 1))
              ], 12, zb)
            ])
          ]),
          js.value ? (b(), k("div", {
            key: 0,
            class: "powered-by-landing",
            style: xe(E(Kt))
          }, [
            Ft(Er, {
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
        ], 4)) : !_l.value && pe.value && !So.value ? (b(), k("div", {
          key: 7,
          class: Ne(["chat-panel", { "ask-anything-chat": rn.value }]),
          style: xe(E(gs))
        }, [
          rn.value ? (b(), k("div", {
            key: 1,
            class: "ask-anything-top",
            style: xe(E(Qr))
          }, [
            g("div", Zb, [
              ee.value || E(ft) ? (b(), k("img", {
                key: 0,
                src: ee.value || E(ft),
                alt: E(M).human_agent_name || E(r),
                class: "header-avatar"
              }, null, 8, Jb)) : te("", !0),
              g("div", Qb, [
                g("h3", {
                  style: xe(E(Kt))
                }, Z(E(r)), 5),
                g("p", {
                  class: "ask-anything-subtitle",
                  style: xe(E(Kt))
                }, Z(E(s).welcome_subtitle || "Ask me anything. I'm here to help."), 5)
              ])
            ])
          ], 4)) : (b(), k("div", {
            key: 0,
            class: "chat-header",
            style: xe(E(Qr))
          }, [
            g("div", {
              class: "cm-header-sheen",
              style: xe({ background: "linear-gradient(90deg, transparent, " + (E(s).accent_color || "#C9F24E") + ", transparent)" })
            }, null, 4),
            g("div", Wb, [
              !ee.value && (Vs.value || !E(ft)) ? (b(), k("div", {
                key: 0,
                class: "header-orb",
                style: xe(Ts.value)
              }, null, 4)) : ee.value || E(ft) ? (b(), k("img", {
                key: 1,
                src: ee.value || E(ft),
                alt: E(M).human_agent_name || E(r),
                class: "header-avatar"
              }, null, 8, qb)) : te("", !0),
              g("div", Vb, [
                g("h3", {
                  style: xe(E(Kt))
                }, Z(E(M).human_agent_name || E(r)), 5),
                g("div", Kb, [
                  g("span", {
                    class: Ne(["status-indicator", sl.value.online ? "online" : "away"])
                  }, null, 2),
                  g("span", Gb, Z(sl.value.text), 1)
                ])
              ])
            ]),
            g("div", Yb, [
              fi.value ? (b(), k("button", {
                key: 0,
                type: "button",
                class: Ne(["header-new-chat", { armed: es.value }]),
                style: xe(E(Kt)),
                disabled: Jn.value,
                title: E(Ki),
                "aria-label": E(Ki),
                "aria-expanded": es.value,
                onClick: al
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
              ]), 14, Xb)) : te("", !0),
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
          E(A) ? (b(), k("div", ew, m[34] || (m[34] = [
            g("div", { class: "loading-spinner" }, [
              g("div", { class: "dot" }),
              g("div", { class: "dot" }),
              g("div", { class: "dot" })
            ], -1)
          ]))) : te("", !0),
          As.value ? (b(), k("div", {
            key: 3,
            class: "cm-email-gate",
            style: xe(E(gs))
          }, [
            g("div", {
              class: "cm-email-gate-orb",
              style: xe(Ts.value)
            }, null, 4),
            g("h3", tw, Z(E(s).welcome_title || "Before we start"), 1),
            m[35] || (m[35] = g("p", { class: "cm-email-gate-text" }, "Enter your email and we'll continue the chat.", -1)),
            ss(g("input", {
              "onUpdate:modelValue": m[5] || (m[5] = (p) => de.value = p),
              type: "email",
              inputmode: "email",
              autocomplete: "email",
              placeholder: "you@example.com",
              class: Ne(["cm-email-gate-input", { invalid: !!ts.value }]),
              disabled: dr.value,
              onKeyup: xi(ml, ["enter"]),
              onInput: m[6] || (m[6] = (p) => ts.value = "")
            }, null, 42, nw), [
              [xs, de.value]
            ]),
            ts.value ? (b(), k("p", sw, Z(ts.value), 1)) : te("", !0),
            g("button", {
              type: "button",
              class: "cm-email-gate-btn",
              style: xe(E(hn)),
              disabled: dr.value,
              onClick: ml
            }, Z(dr.value ? "Please wait…" : "Continue to chat"), 13, rw)
          ], 4)) : te("", !0),
          es.value && fi.value ? (b(), Pn(df, {
            key: 4,
            busy: Jn.value,
            error: Qn.value,
            onConfirm: ll,
            onCancel: Ws
          }, null, 8, ["busy", "error"])) : te("", !0),
          ss(g("div", {
            class: "chat-messages",
            ref_key: "messagesContainer",
            ref: Kn,
            role: "log",
            "aria-label": "Messages"
          }, [
            E(Nt) ? (b(), Pn(T_, {
              key: 0,
              progress: E(Nt),
              onSkip: E(v),
              onHide: E(L)
            }, null, 8, ["progress", "onSkip", "onHide"])) : te("", !0),
            Qf.value ? (b(), k("div", iw, [
              g("div", ow, [
                Vs.value || !E(ft) ? (b(), k("div", {
                  key: 0,
                  class: "cm-welcome-orb",
                  style: xe(Ts.value)
                }, null, 4)) : (b(), k("img", {
                  key: 1,
                  src: E(ft),
                  alt: E(r),
                  class: "cm-welcome-avatar"
                }, null, 8, aw)),
                g("div", {
                  class: "message-bubble cm-welcome-bubble",
                  style: xe(E(Rn))
                }, Z(ul.value), 5)
              ])
            ])) : te("", !0),
            (b(!0), k(Re, null, dt(E(l), (p, ce) => {
              var Ye, we, at, et, pr, mr, ns, Ks, yl, vl, bl, wl, kl, Tl, Al, Sl, El, xl, Cl, Rl;
              return b(), k(Re, { key: ce }, [
                E(K).isBefore(p) ? (b(), k("div", lw, [
                  Vs.value || !E(ft) ? (b(), k("div", {
                    key: 0,
                    class: "cm-welcome-orb",
                    style: xe(Ts.value)
                  }, null, 4)) : (b(), k("img", {
                    key: 1,
                    src: E(ft),
                    alt: E(r),
                    class: "cm-welcome-avatar"
                  }, null, 8, cw)),
                  g("div", {
                    class: "message-bubble cm-welcome-bubble",
                    style: xe(E(Rn))
                  }, Z((Ye = V.value) == null ? void 0 : Ye.message), 5)
                ])) : te("", !0),
                g("div", {
                  class: Ne([
                    "message",
                    p.message_type === "bot" || p.message_type === "agent" ? "agent-message" : p.message_type === "system" ? "system-message" : p.message_type === "rating" ? "rating-message" : p.message_type === "form" ? "form-message" : p.message_type === "product" || p.shopify_output ? "product-message" : "user-message"
                  ])
                }, [
                  p.message_type === "bot" || p.message_type === "agent" ? (b(), k("div", uw, [
                    ee.value ? (b(), k("img", {
                      key: 0,
                      src: ee.value,
                      class: "cm-msg-avatar-img",
                      alt: ""
                    }, null, 8, fw)) : !Vs.value && E(ft) ? (b(), k("img", {
                      key: 1,
                      src: E(ft),
                      class: "cm-msg-avatar-img",
                      alt: ""
                    }, null, 8, hw)) : (b(), k("div", {
                      key: 2,
                      class: "cm-msg-avatar-orb",
                      style: xe(Ts.value)
                    }, null, 4))
                  ])) : te("", !0),
                  g("div", dw, [
                    g("div", {
                      class: "message-bubble",
                      style: xe(p.message_type === "system" || p.message_type === "rating" || p.message_type === "form" || p.message_type === "product" || p.shopify_output ? {} : p.message_type === "user" ? E(hn) : E(Rn))
                    }, [
                      p.message_type === "rating" ? (b(), k("div", pw, [
                        g("p", mw, "Rate the chat session that you had with " + Z(p.agent_name || E(M).human_agent_name || E(r) || "our agent"), 1),
                        g("div", {
                          class: Ne(["star-rating", { submitted: Gt.value || p.isSubmitted }])
                        }, [
                          (b(), k(Re, null, dt(5, (F) => g("button", {
                            key: F,
                            class: Ne(["star-button", {
                              warning: F <= (p.isSubmitted ? p.finalRating : nn.value || p.selectedRating) && (p.isSubmitted ? p.finalRating : nn.value || p.selectedRating) <= 3,
                              success: F <= (p.isSubmitted ? p.finalRating : nn.value || p.selectedRating) && (p.isSubmitted ? p.finalRating : nn.value || p.selectedRating) > 3,
                              selected: F <= (p.isSubmitted ? p.finalRating : nn.value || p.selectedRating)
                            }]),
                            onMouseover: (Yt) => !p.isSubmitted && ve(F),
                            onMouseleave: (Yt) => !p.isSubmitted && Ge,
                            onClick: (Yt) => !p.isSubmitted && ot(F),
                            disabled: Gt.value || p.isSubmitted
                          }, " ★ ", 42, gw)), 64))
                        ], 2),
                        p.showFeedback && !p.isSubmitted ? (b(), k("div", _w, [
                          g("div", yw, [
                            ss(g("input", {
                              "onUpdate:modelValue": (F) => p.feedback = F,
                              placeholder: "Please share your feedback (optional)",
                              disabled: Gt.value,
                              maxlength: "500",
                              class: "feedback-input"
                            }, null, 8, vw), [
                              [xs, p.feedback]
                            ]),
                            g("div", bw, Z(((we = p.feedback) == null ? void 0 : we.length) || 0) + "/500", 1)
                          ]),
                          g("button", {
                            onClick: (F) => Et(p.session_id, nn.value, p.feedback),
                            disabled: Gt.value || !nn.value,
                            class: "submit-rating-button",
                            style: xe({ backgroundColor: E(s).accent_color || "var(--accent-solid)" })
                          }, Z(Gt.value ? "Submitting..." : "Submit Rating"), 13, ww)
                        ])) : te("", !0),
                        p.isSubmitted && p.finalFeedback ? (b(), k("div", kw, [
                          g("div", Tw, [
                            g("p", Aw, Z(p.finalFeedback), 1)
                          ])
                        ])) : p.isSubmitted ? (b(), k("div", Sw, " Thank you for your rating! ")) : te("", !0)
                      ])) : p.message_type === "form" ? (b(), k("div", Ew, [
                        (et = (at = p.attributes) == null ? void 0 : at.form_data) != null && et.title || (mr = (pr = p.attributes) == null ? void 0 : pr.form_data) != null && mr.description ? (b(), k("div", xw, [
                          (Ks = (ns = p.attributes) == null ? void 0 : ns.form_data) != null && Ks.title ? (b(), k("h3", Cw, Z(p.attributes.form_data.title), 1)) : te("", !0),
                          (vl = (yl = p.attributes) == null ? void 0 : yl.form_data) != null && vl.description ? (b(), k("p", Rw, Z(p.attributes.form_data.description), 1)) : te("", !0)
                        ])) : te("", !0),
                        g("div", Iw, [
                          (b(!0), k(Re, null, dt((wl = (bl = p.attributes) == null ? void 0 : bl.form_data) == null ? void 0 : wl.fields, (F) => {
                            var Yt, gr;
                            return b(), k("div", {
                              key: F.name,
                              class: "form-field"
                            }, [
                              g("label", {
                                for: `form-${F.name}`,
                                class: "field-label"
                              }, [
                                Nn(Z(F.label) + " ", 1),
                                F.required ? (b(), k("span", Lw, "*")) : te("", !0)
                              ], 8, Ow),
                              F.type === "text" || F.type === "email" || F.type === "tel" ? (b(), k("input", {
                                key: 0,
                                id: `form-${F.name}`,
                                type: F.type,
                                placeholder: F.placeholder || "",
                                required: F.required,
                                minlength: F.minLength,
                                maxlength: F.maxLength,
                                value: ht.value[F.name] || "",
                                onInput: (Xe) => We(F.name, Xe.target.value),
                                onBlur: (Xe) => We(F.name, Xe.target.value),
                                class: Ne(["form-input", { error: ut.value[F.name] }]),
                                disabled: yt.value,
                                autocomplete: F.type === "email" ? "email" : F.type === "tel" ? "tel" : "off",
                                inputmode: F.type === "tel" ? "tel" : F.type === "email" ? "email" : "text"
                              }, null, 42, Nw)) : F.type === "number" ? (b(), k("input", {
                                key: 1,
                                id: `form-${F.name}`,
                                type: "number",
                                placeholder: F.placeholder || "",
                                required: F.required,
                                min: F.min,
                                max: F.max,
                                value: ht.value[F.name] || "",
                                onInput: (Xe) => We(F.name, Xe.target.value),
                                class: Ne(["form-input", { error: ut.value[F.name] }]),
                                disabled: yt.value
                              }, null, 42, Pw)) : F.type === "textarea" ? (b(), k("textarea", {
                                key: 2,
                                id: `form-${F.name}`,
                                placeholder: F.placeholder || "",
                                required: F.required,
                                minlength: F.minLength,
                                maxlength: F.maxLength,
                                value: ht.value[F.name] || "",
                                onInput: (Xe) => We(F.name, Xe.target.value),
                                class: Ne(["form-textarea", { error: ut.value[F.name] }]),
                                disabled: yt.value,
                                rows: "3"
                              }, null, 42, Mw)) : F.type === "select" ? (b(), k("select", {
                                key: 3,
                                id: `form-${F.name}`,
                                required: F.required,
                                value: ht.value[F.name] || "",
                                onChange: (Xe) => We(F.name, Xe.target.value),
                                class: Ne(["form-select", { error: ut.value[F.name] }]),
                                disabled: yt.value
                              }, [
                                g("option", Fw, Z(F.placeholder || "Select an option"), 1),
                                (b(!0), k(Re, null, dt((Array.isArray(F.options) ? F.options : ((Yt = F.options) == null ? void 0 : Yt.split(`
`)) || []).filter((Xe) => Xe.trim()), (Xe) => (b(), k("option", {
                                  key: Xe.trim(),
                                  value: Xe.trim()
                                }, Z(Xe.trim()), 9, $w))), 128))
                              ], 42, Dw)) : F.type === "checkbox" ? (b(), k("div", Bw, [
                                g("input", {
                                  id: `form-${F.name}`,
                                  type: "checkbox",
                                  checked: ht.value[F.name] || !1,
                                  onChange: (Xe) => We(F.name, Xe.target.checked),
                                  class: "form-checkbox",
                                  disabled: yt.value
                                }, null, 40, Uw),
                                g("label", {
                                  for: `form-${F.name}`,
                                  class: "checkbox-label"
                                }, Z(F.placeholder || F.label), 9, zw)
                              ])) : F.type === "radio" ? (b(), k("div", Hw, [
                                (b(!0), k(Re, null, dt((Array.isArray(F.options) ? F.options : ((gr = F.options) == null ? void 0 : gr.split(`
`)) || []).filter((Xe) => Xe.trim()), (Xe) => (b(), k("div", {
                                  key: Xe.trim(),
                                  class: "radio-option"
                                }, [
                                  g("input", {
                                    id: `form-${F.name}-${Xe.trim()}`,
                                    name: `form-${F.name}`,
                                    type: "radio",
                                    value: Xe.trim(),
                                    checked: ht.value[F.name] === Xe.trim(),
                                    onChange: (Eo) => We(F.name, Xe.trim()),
                                    class: "form-radio",
                                    disabled: yt.value
                                  }, null, 40, jw),
                                  g("label", {
                                    for: `form-${F.name}-${Xe.trim()}`,
                                    class: "radio-label"
                                  }, Z(Xe.trim()), 9, Ww)
                                ]))), 128))
                              ])) : te("", !0),
                              ut.value[F.name] ? (b(), k("div", qw, Z(ut.value[F.name]), 1)) : te("", !0)
                            ]);
                          }), 128))
                        ]),
                        g("div", Vw, [
                          g("button", {
                            onClick: () => {
                              var F;
                              console.log("Regular form submit button clicked!"), fr((F = p.attributes) == null ? void 0 : F.form_data);
                            },
                            disabled: yt.value,
                            class: "form-submit-button",
                            style: xe(E(hn))
                          }, Z(yt.value ? "Submitting..." : ((Tl = (kl = p.attributes) == null ? void 0 : kl.form_data) == null ? void 0 : Tl.submit_button_text) || "Submit"), 13, Kw)
                        ])
                      ])) : p.message_type === "user_input" ? (b(), k("div", Gw, [
                        (Al = p.attributes) != null && Al.prompt_message && p.attributes.prompt_message.trim() ? (b(), k("div", Yw, Z(p.attributes.prompt_message), 1)) : te("", !0),
                        p.isSubmitted ? (b(), k("div", Qw, [
                          m[36] || (m[36] = g("strong", null, "Your input:", -1)),
                          Nn(" " + Z(p.submittedValue) + " ", 1),
                          (Sl = p.attributes) != null && Sl.confirmation_message && p.attributes.confirmation_message.trim() ? (b(), k("div", e0, Z(p.attributes.confirmation_message), 1)) : te("", !0)
                        ])) : (b(), k("div", Xw, [
                          ss(g("textarea", {
                            "onUpdate:modelValue": (F) => p.userInputValue = F,
                            class: "user-input-textarea",
                            placeholder: "Type your message here...",
                            rows: "3",
                            onKeydown: [
                              xi(Is((F) => yo(p), ["ctrl"]), ["enter"]),
                              xi(Is((F) => yo(p), ["meta"]), ["enter"])
                            ]
                          }, null, 40, Zw), [
                            [xs, p.userInputValue]
                          ]),
                          g("button", {
                            class: "user-input-submit-button",
                            onClick: (F) => yo(p),
                            disabled: !p.userInputValue || !p.userInputValue.trim()
                          }, " Submit ", 8, Jw)
                        ]))
                      ])) : p.shopify_output || p.message_type === "product" ? (b(), k("div", t0, [
                        p.message ? (b(), k("div", {
                          key: 0,
                          innerHTML: E(Ri)(((xl = (El = p.shopify_output) == null ? void 0 : El.products) == null ? void 0 : xl.length) > 0 ? zf(p.message) : p.message),
                          class: "product-message-text"
                        }, null, 8, n0)) : te("", !0),
                        (Cl = p.shopify_output) != null && Cl.products && p.shopify_output.products.length > 0 ? (b(), k("div", s0, [
                          m[38] || (m[38] = g("h3", { class: "carousel-title" }, "Products", -1)),
                          g("div", r0, [
                            (b(!0), k(Re, null, dt(p.shopify_output.products, (F) => {
                              var Yt, gr;
                              return b(), k("div", {
                                key: F.id,
                                class: "product-card-compact carousel-item",
                                role: "group",
                                "aria-label": F.title
                              }, [
                                (Yt = F.image) != null && Yt.src ? (b(), k("div", o0, [
                                  g("img", {
                                    src: F.image.src,
                                    alt: F.title,
                                    class: "product-thumbnail"
                                  }, null, 8, a0)
                                ])) : te("", !0),
                                g("div", l0, [
                                  g("div", c0, [
                                    g("div", u0, Z(F.title), 1),
                                    F.variant_title && F.variant_title !== "Default Title" ? (b(), k("div", f0, Z(F.variant_title), 1)) : te("", !0),
                                    g("div", h0, Z(F.price_formatted || E(a)(F.price, F.currency)), 1)
                                  ]),
                                  g("div", d0, [
                                    E(L_)(F, (gr = p.shopify_output) == null ? void 0 : gr.shop_domain) ? (b(), Pn(z_, {
                                      key: 0,
                                      "variant-id": F.cart_variant_id
                                    }, null, 8, ["variant-id"])) : te("", !0),
                                    g("button", {
                                      class: "view-details-button-compact",
                                      onClick: (Xe) => {
                                        var Eo;
                                        return Uf(F, (Eo = p.shopify_output) == null ? void 0 : Eo.shop_domain);
                                      }
                                    }, m[37] || (m[37] = [
                                      Nn(" View product ", -1),
                                      g("span", { class: "external-link-icon" }, "↗", -1)
                                    ]), 8, p0)
                                  ])
                                ])
                              ], 8, i0);
                            }), 128))
                          ])
                        ])) : !p.message && ((Rl = p.shopify_output) != null && Rl.products) && p.shopify_output.products.length === 0 ? (b(), k("div", m0, m[39] || (m[39] = [
                          g("p", null, "No products found.", -1)
                        ]))) : !p.message && p.shopify_output && !p.shopify_output.products ? (b(), k("div", g0, m[40] || (m[40] = [
                          g("p", null, "No products to display.", -1)
                        ]))) : te("", !0)
                      ])) : (b(), k(Re, { key: 4 }, [
                        E(J)(ce) ? (b(), k("div", {
                          key: 0,
                          class: "message-streaming",
                          innerHTML: E(Ri)(E(re)(ce, p.message))
                        }, null, 8, _0)) : (b(), k("div", {
                          key: 1,
                          innerHTML: E(Ri)(p.message)
                        }, null, 8, y0)),
                        p.attachments && p.attachments.length > 0 ? (b(), k("div", v0, [
                          (b(!0), k(Re, null, dt(p.attachments, (F) => (b(), k("div", {
                            key: F.id,
                            class: "attachment-item"
                          }, [
                            E(lr)(F.content_type) ? (b(), k("div", b0, [
                              g("img", {
                                src: E(ys)(F.file_url),
                                alt: F.filename,
                                class: "attachment-image",
                                onClick: Is((Yt) => E(Yn)({ url: F.file_url, filename: F.filename, type: F.content_type, file_url: E(ys)(F.file_url), size: void 0 }), ["stop"]),
                                style: { cursor: "pointer" }
                              }, null, 8, w0),
                              g("div", k0, [
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
                                  g("span", A0, "(" + Z(E(Bs)(F.file_size)) + ")", 1)
                                ], 8, T0)
                              ])
                            ])) : (b(), k("a", {
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
                              g("span", E0, "(" + Z(E(Bs)(F.file_size)) + ")", 1)
                            ], 8, S0))
                          ]))), 128))
                        ])) : te("", !0)
                      ], 64))
                    ], 4),
                    hi.value && (p.message_type === "bot" || p.message_type === "agent") && p.sources && p.sources.length ? (b(), k("div", x0, [
                      m[43] || (m[43] = g("span", { class: "citation-label" }, "Sources", -1)),
                      (b(!0), k(Re, null, dt(p.sources, (F, Yt) => (b(), k("span", {
                        key: Yt,
                        class: "citation-chip",
                        title: dl(F)
                      }, Z(wo(F)), 9, C0))), 128))
                    ])) : te("", !0),
                    g("div", R0, [
                      p.message_type === "user" ? (b(), k("span", I0, " You ")) : te("", !0)
                    ])
                  ])
                ], 2),
                (b(!0), k(Re, null, dt(E(Me)(ce + 1), (F, Yt) => (b(), Pn(i_, {
                  key: `receipt-${ce}-${Yt}`,
                  receipt: F
                }, null, 8, ["receipt"]))), 128))
              ], 64);
            }), 128)),
            E(K).isLast() ? (b(), k("div", O0, [
              Vs.value || !E(ft) ? (b(), k("div", {
                key: 0,
                class: "cm-welcome-orb",
                style: xe(Ts.value)
              }, null, 4)) : (b(), k("img", {
                key: 1,
                src: E(ft),
                alt: E(r),
                class: "cm-welcome-avatar"
              }, null, 8, L0)),
              g("div", {
                class: "message-bubble cm-welcome-bubble",
                style: xe(E(Rn))
              }, Z((Y = V.value) == null ? void 0 : Y.message), 5)
            ])) : te("", !0),
            P.value.length ? (b(), Pn(x_, {
              key: 3,
              chips: P.value,
              disabled: !vn.value || E(yn),
              onPick: U
            }, null, 8, ["chips", "disabled"])) : te("", !0),
            E(wt) ? (b(), Pn(Jg, {
              key: 4,
              pending: E(wt),
              onApprove: E(Ut),
              onDecline: E(Wt)
            }, null, 8, ["pending", "onApprove", "onDecline"])) : te("", !0),
            E(u) && !E(wt) ? (b(), k("div", {
              key: 5,
              class: Ne(["typing-indicator", { "reading-indicator": hi.value }])
            }, [
              hi.value ? (b(), k(Re, { key: 0 }, [
                m[44] || (m[44] = g("div", {
                  class: "reading-bars",
                  "aria-hidden": "true"
                }, [
                  g("span"),
                  g("span"),
                  g("span")
                ], -1)),
                m[45] || (m[45] = g("span", { class: "reading-label" }, "reading knowledge base", -1))
              ], 64)) : (b(), k("div", {
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
            [lp, !As.value]
          ]),
          eh.value ? (b(), k("div", N0, [
            (b(!0), k(Re, null, dt(vo.value, (p) => (b(), k("button", {
              key: p,
              type: "button",
              class: "cm-quick-action",
              disabled: !vn.value,
              onClick: (ce) => Xn(p)
            }, Z(p), 9, P0))), 128))
          ])) : te("", !0),
          !B.value && !As.value ? (b(), k("div", {
            key: 6,
            class: Ne(["chat-input", { "ask-anything-input": rn.value }])
          }, [
            g("input", {
              ref_key: "fileInputRef",
              ref: ei,
              type: "file",
              accept: lk,
              multiple: "",
              style: { display: "none" },
              onChange: m[7] || (m[7] = //@ts-ignore
              (...p) => E(ti) && E(ti)(...p))
            }, null, 544),
            E($e).length > 0 ? (b(), k("div", M0, [
              (b(!0), k(Re, null, dt(E($e), (p, ce) => (b(), k("div", {
                key: ce,
                class: "file-preview-widget"
              }, [
                g("div", D0, [
                  E(vs)(p.type) ? (b(), k("img", {
                    key: 0,
                    src: E(cr)(p),
                    alt: p.filename,
                    class: "file-preview-image-widget",
                    onClick: Is((Ye) => E(Yn)(p), ["stop"]),
                    style: { cursor: "pointer" }
                  }, null, 8, F0)) : (b(), k("div", {
                    key: 1,
                    class: "file-preview-icon-widget",
                    onClick: Is((Ye) => E(Yn)(p), ["stop"]),
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
                  ]), 8, $0))
                ]),
                g("div", B0, [
                  g("div", U0, Z(p.filename), 1),
                  g("div", z0, Z(E(Bs)(p.size)), 1)
                ]),
                g("button", {
                  type: "button",
                  class: "file-preview-remove-widget",
                  onClick: (Ye) => E(ii)(ce),
                  title: "Remove file"
                }, " × ", 8, H0)
              ]))), 128))
            ])) : te("", !0),
            nl.value ? (b(), k("div", j0, m[48] || (m[48] = [
              g("div", { class: "upload-spinner-widget" }, null, -1),
              g("span", { class: "upload-text-widget" }, "Uploading files...", -1)
            ]))) : te("", !0),
            g("div", W0, [
              ss(g("input", {
                "onUpdate:modelValue": m[8] || (m[8] = (p) => Q.value = p),
                type: "text",
                placeholder: Us.value,
                onKeypress: Zn,
                onInput: ke,
                onChange: ke,
                onPaste: m[9] || (m[9] = //@ts-ignore
                (...p) => E(dn) && E(dn)(...p)),
                onDrop: m[10] || (m[10] = //@ts-ignore
                (...p) => E(ni) && E(ni)(...p)),
                onDragover: m[11] || (m[11] = //@ts-ignore
                (...p) => E(si) && E(si)(...p)),
                onDragleave: m[12] || (m[12] = //@ts-ignore
                (...p) => E(ri) && E(ri)(...p)),
                disabled: !bs.value,
                class: Ne({ disabled: !bs.value, "ask-anything-field": rn.value })
              }, null, 42, q0), [
                [xs, Q.value]
              ]),
              Hf.value ? (b(), k("button", {
                key: 0,
                type: "button",
                class: "attach-button",
                disabled: nl.value,
                onClick: m[13] || (m[13] = //@ts-ignore
                (...p) => E(oi) && E(oi)(...p)),
                title: `Attach files (${E($e).length}/${qc} used) or paste screenshots`
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
              ]), 8, V0)) : te("", !0),
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
              ]), 14, K0)
            ]),
            In.value ? (b(), k("p", G0, Z(E(j_)), 1)) : te("", !0)
          ], 2)) : B.value && !As.value ? (b(), k("div", Y0, [
            g("div", X0, [
              m[51] || (m[51] = g("p", { class: "ended-text" }, "This chat has ended.", -1)),
              g("button", {
                class: "start-new-conversation-button",
                style: xe(E(hn)),
                onClick: Yf
              }, " Click here to start a new conversation ", 4)
            ])
          ])) : te("", !0),
          hl.value ? (b(), k("div", Z0, Z(E(Ic)), 1)) : te("", !0),
          js.value ? (b(), k("div", {
            key: 9,
            class: "powered-by",
            style: xe(E(Kt))
          }, [
            Ft(Er, {
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
        ur.value ? (b(), k("div", J0, [
          g("div", Q0, [
            m[53] || (m[53] = g("h3", null, "Rate your conversation", -1)),
            g("div", ek, [
              (b(), k(Re, null, dt(5, (p) => g("button", {
                key: p,
                onClick: (ce) => ws.value = p,
                class: Ne([{ active: p <= ws.value }, "star-button"])
              }, " ★ ", 10, tk)), 64))
            ]),
            ss(g("textarea", {
              "onUpdate:modelValue": m[14] || (m[14] = (p) => Hs.value = p),
              placeholder: "Additional feedback (optional)",
              class: "rating-feedback"
            }, null, 512), [
              [xs, Hs.value]
            ]),
            g("div", nk, [
              g("button", {
                onClick: m[15] || (m[15] = (p) => h.submitRating(ws.value, Hs.value)),
                disabled: !ws.value,
                class: "submit-button",
                style: xe(E(hn))
              }, " Submit ", 12, sk),
              g("button", {
                onClick: m[16] || (m[16] = (p) => ur.value = !1),
                class: "skip-rating"
              }, " Skip ")
            ])
          ])
        ])) : te("", !0),
        E(Gn) ? (b(), k("div", {
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
            E(_s) && E(vs)(E(_s).type) ? (b(), k("div", rk, [
              g("img", {
                src: E(cr)(E(_s)),
                alt: E(_s).filename,
                class: "preview-modal-image"
              }, null, 8, ik),
              g("div", ok, Z(E(_s).filename), 1)
            ])) : te("", !0)
          ])
        ])) : te("", !0)
      ], 6)) : (b(), k("div", ak));
    };
  }
}), uk = /* @__PURE__ */ Wn(ck, [["__scopeId", "data-v-57645127"]]);
window.process || (window.process = { env: { NODE_ENV: "production" } });
async function fk() {
  if (!await cy()) return;
  const e = window.__INITIAL_DATA__, t = new URL(window.location.href), n = t.searchParams.get("preview") === "true", s = (a) => {
    const l = t.searchParams.get(a);
    if (!(!l || l === "undefined" || l.trim() === ""))
      return l;
  }, r = n ? s("widget_id") || (e == null ? void 0 : e.widgetId) || void 0 : (e == null ? void 0 : e.widgetId) || void 0, i = n ? (e == null ? void 0 : e.initialToken) || s("token") || void 0 : (e == null ? void 0 : e.initialToken) || void 0;
  Cp(uk, {
    widgetId: r,
    token: i || void 0,
    initialAuthError: null
    // Let backend determine if auth is required
  }).mount("#app"), uy();
}
fk();
