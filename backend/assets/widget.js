var uh = Object.defineProperty;
var fh = (e, t, n) => t in e ? uh(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var tt = (e, t, n) => fh(e, typeof t != "symbol" ? t + "" : t, n);
/**
* @vue/shared v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function Sa(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const n of e.split(",")) t[n] = 1;
  return (n) => n in t;
}
const nt = {}, Js = [], Sn = () => {
}, hh = () => !1, Qi = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), Ea = (e) => e.startsWith("onUpdate:"), Ot = Object.assign, xa = (e, t) => {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}, dh = Object.prototype.hasOwnProperty, Ve = (e, t) => dh.call(e, t), Se = Array.isArray, Qs = (e) => eo(e) === "[object Map]", Kc = (e) => eo(e) === "[object Set]", xe = (e) => typeof e == "function", gt = (e) => typeof e == "string", ps = (e) => typeof e == "symbol", ct = (e) => e !== null && typeof e == "object", Gc = (e) => (ct(e) || xe(e)) && xe(e.then) && xe(e.catch), Yc = Object.prototype.toString, eo = (e) => Yc.call(e), ph = (e) => eo(e).slice(8, -1), Xc = (e) => eo(e) === "[object Object]", Ca = (e) => gt(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, Lr = /* @__PURE__ */ Sa(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), to = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (n) => t[n] || (t[n] = e(n));
}, mh = /-(\w)/g, fs = to(
  (e) => e.replace(mh, (t, n) => n ? n.toUpperCase() : "")
), gh = /\B([A-Z])/g, ms = to(
  (e) => e.replace(gh, "-$1").toLowerCase()
), Zc = to((e) => e.charAt(0).toUpperCase() + e.slice(1)), Co = to(
  (e) => e ? `on${Zc(e)}` : ""
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
let Ol;
const no = () => Ol || (Ol = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function Ee(e) {
  if (Se(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
      const s = e[n], r = gt(s) ? bh(s) : Ee(s);
      if (r)
        for (const i in r)
          t[i] = r[i];
    }
    return t;
  } else if (gt(e) || ct(e))
    return e;
}
const _h = /;(?![^(]*\))/g, yh = /:([^]+)/, vh = /\/\*[^]*?\*\//g;
function bh(e) {
  const t = {};
  return e.replace(vh, "").split(_h).forEach((n) => {
    if (n) {
      const s = n.split(yh);
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
const wh = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", kh = /* @__PURE__ */ Sa(wh);
function Jc(e) {
  return !!e || e === "";
}
const Qc = (e) => !!(e && e.__v_isRef === !0), X = (e) => gt(e) ? e : e == null ? "" : Se(e) || ct(e) && (e.toString === Yc || !xe(e.toString)) ? Qc(e) ? X(e.value) : JSON.stringify(e, eu, 2) : String(e), eu = (e, t) => Qc(t) ? eu(e, t.value) : Qs(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (n, [s, r], i) => (n[Ro(s, i) + " =>"] = r, n),
    {}
  )
} : Kc(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((n) => Ro(n))
} : ps(t) ? Ro(t) : ct(t) && !Se(t) && !Xc(t) ? String(t) : t, Ro = (e, t = "") => {
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
let zt;
class Th {
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
function Ah() {
  return zt;
}
let it;
const Io = /* @__PURE__ */ new WeakSet();
class tu {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, zt && zt.active && zt.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, Io.has(this) && (Io.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || su(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, Ll(this), ru(this);
    const t = it, n = _n;
    it = this, _n = !0;
    try {
      return this.fn();
    } finally {
      iu(this), it = t, _n = n, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        Oa(t);
      this.deps = this.depsTail = void 0, Ll(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? Io.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
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
let nu = 0, Nr, Pr;
function su(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = Pr, Pr = e;
    return;
  }
  e.next = Nr, Nr = e;
}
function Ra() {
  nu++;
}
function Ia() {
  if (--nu > 0)
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
function ru(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function iu(e) {
  let t, n = e.depsTail, s = n;
  for (; s; ) {
    const r = s.prevDep;
    s.version === -1 ? (s === n && (n = r), Oa(s), Sh(s)) : t = s, s.dep.activeLink = s.prevActiveLink, s.prevActiveLink = void 0, s = r;
  }
  e.deps = t, e.depsTail = n;
}
function ta(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (ou(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function ou(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === zr) || (e.globalVersion = zr, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !ta(e))))
    return;
  e.flags |= 2;
  const t = e.dep, n = it, s = _n;
  it = e, _n = !0;
  try {
    ru(e);
    const r = e.fn(e._value);
    (t.version === 0 || ls(r, e._value)) && (e.flags |= 128, e._value = r, t.version++);
  } catch (r) {
    throw t.version++, r;
  } finally {
    it = n, _n = s, iu(e), e.flags &= -3;
  }
}
function Oa(e, t = !1) {
  const { dep: n, prevSub: s, nextSub: r } = e;
  if (s && (s.nextSub = r, e.prevSub = void 0), r && (r.prevSub = s, e.nextSub = void 0), n.subs === e && (n.subs = s, !s && n.computed)) {
    n.computed.flags &= -5;
    for (let i = n.computed.deps; i; i = i.nextDep)
      Oa(i, !0);
  }
  !t && !--n.sc && n.map && n.map.delete(n.key);
}
function Sh(e) {
  const { prevDep: t, nextDep: n } = e;
  t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
let _n = !0;
const au = [];
function Un() {
  au.push(_n), _n = !1;
}
function zn() {
  const e = au.pop();
  _n = e === void 0 ? !0 : e;
}
function Ll(e) {
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
class Eh {
  constructor(t, n) {
    this.sub = t, this.dep = n, this.version = n.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class La {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(t) {
    if (!it || !_n || it === this.computed)
      return;
    let n = this.activeLink;
    if (n === void 0 || n.sub !== it)
      n = this.activeLink = new Eh(it, this), it.deps ? (n.prevDep = it.depsTail, it.depsTail.nextDep = n, it.depsTail = n) : it.deps = it.depsTail = n, lu(n);
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
    Ra();
    try {
      for (let n = this.subs; n; n = n.prevSub)
        n.sub.notify() && n.sub.dep.notify();
    } finally {
      Ia();
    }
  }
}
function lu(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let s = t.deps; s; s = s.nextDep)
        lu(s);
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
  if (_n && it) {
    let s = na.get(e);
    s || na.set(e, s = /* @__PURE__ */ new Map());
    let r = s.get(n);
    r || (s.set(n, r = new La()), r.map = s, r.key = n), r.track();
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
  if (Ra(), t === "clear")
    o.forEach(a);
  else {
    const l = Se(e), u = l && Ca(n);
    if (l && n === "length") {
      const f = Number(s);
      o.forEach((b, A) => {
        (A === "length" || A === Hr || !ps(A) && A >= f) && a(b);
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
  Ia();
}
function Gs(e) {
  const t = Ne(e);
  return t === e ? t : (Rt(t, "iterate", Hr), fn(e) ? t : t.map(St));
}
function so(e) {
  return Rt(e = Ne(e), "iterate", Hr), e;
}
const xh = {
  __proto__: null,
  [Symbol.iterator]() {
    return Oo(this, Symbol.iterator, St);
  },
  concat(...e) {
    return Gs(this).concat(
      ...e.map((t) => Se(t) ? Gs(t) : t)
    );
  },
  entries() {
    return Oo(this, "entries", (e) => (e[1] = St(e[1]), e));
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
    return Lo(this, "includes", e);
  },
  indexOf(...e) {
    return Lo(this, "indexOf", e);
  },
  join(e) {
    return Gs(this).join(e);
  },
  // keys() iterator only reads `length`, no optimisation required
  lastIndexOf(...e) {
    return Lo(this, "lastIndexOf", e);
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
    return Nl(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return Nl(this, "reduceRight", e, t);
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
    return Oo(this, "values", St);
  }
};
function Oo(e, t, n) {
  const s = so(e), r = s[t]();
  return s !== e && !fn(e) && (r._next = r.next, r.next = () => {
    const i = r._next();
    return i.value && (i.value = n(i.value)), i;
  }), r;
}
const Ch = Array.prototype;
function Ln(e, t, n, s, r, i) {
  const o = so(e), a = o !== e && !fn(e), l = o[t];
  if (l !== Ch[t]) {
    const b = l.apply(e, i);
    return a ? St(b) : b;
  }
  let u = n;
  o !== e && (a ? u = function(b, A) {
    return n.call(this, St(b), A, e);
  } : n.length > 2 && (u = function(b, A) {
    return n.call(this, b, A, e);
  }));
  const f = l.call(o, u, s);
  return a && r ? r(f) : f;
}
function Nl(e, t, n, s) {
  const r = so(e);
  let i = n;
  return r !== e && (fn(e) ? n.length > 3 && (i = function(o, a, l) {
    return n.call(this, o, a, l, e);
  }) : i = function(o, a, l) {
    return n.call(this, o, St(a), l, e);
  }), r[t](i, ...s);
}
function Lo(e, t, n) {
  const s = Ne(e);
  Rt(s, "iterate", Hr);
  const r = s[t](...n);
  return (r === -1 || r === !1) && Ma(n[0]) ? (n[0] = Ne(n[0]), s[t](...n)) : r;
}
function _r(e, t, n = []) {
  Un(), Ra();
  const s = Ne(e)[t].apply(e, n);
  return Ia(), zn(), s;
}
const Rh = /* @__PURE__ */ Sa("__proto__,__v_isRef,__isVue"), cu = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(ps)
);
function Ih(e) {
  ps(e) || (e = String(e));
  const t = Ne(this);
  return Rt(t, "has", e), t.hasOwnProperty(e);
}
class uu {
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
      return s === (r ? i ? Uh : pu : i ? du : hu).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(s) ? t : void 0;
    const o = Se(t);
    if (!r) {
      let l;
      if (o && (l = xh[n]))
        return l;
      if (n === "hasOwnProperty")
        return Ih;
    }
    const a = Reflect.get(
      t,
      n,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      It(t) ? t : s
    );
    return (ps(n) ? cu.has(n) : Rh(n)) || (r || Rt(t, "get", n), i) ? a : It(a) ? o && Ca(n) ? a : a.value : ct(a) ? r ? mu(a) : Vr(a) : a;
  }
}
class fu extends uu {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, n, s, r) {
    let i = t[n];
    if (!this._isShallow) {
      const l = hs(i);
      if (!fn(s) && !hs(s) && (i = Ne(i), s = Ne(s)), !Se(t) && It(i) && !It(s))
        return l ? !1 : (i.value = s, !0);
    }
    const o = Se(t) && Ca(n) ? Number(n) < t.length : Ve(t, n), a = Reflect.set(
      t,
      n,
      s,
      It(t) ? t : r
    );
    return t === Ne(r) && (o ? ls(s, i) && Dn(t, "set", n, s) : Dn(t, "add", n, s)), a;
  }
  deleteProperty(t, n) {
    const s = Ve(t, n);
    t[n];
    const r = Reflect.deleteProperty(t, n);
    return r && s && Dn(t, "delete", n, void 0), r;
  }
  has(t, n) {
    const s = Reflect.has(t, n);
    return (!ps(n) || !cu.has(n)) && Rt(t, "has", n), s;
  }
  ownKeys(t) {
    return Rt(
      t,
      "iterate",
      Se(t) ? "length" : Ps
    ), Reflect.ownKeys(t);
  }
}
class Oh extends uu {
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
const Lh = /* @__PURE__ */ new fu(), Nh = /* @__PURE__ */ new Oh(), Ph = /* @__PURE__ */ new fu(!0);
const ra = (e) => e, pi = (e) => Reflect.getPrototypeOf(e);
function Mh(e, t, n) {
  return function(...s) {
    const r = this.__v_raw, i = Ne(r), o = Qs(i), a = e === "entries" || e === Symbol.iterator && o, l = e === "keys" && o, u = r[e](...s), f = n ? ra : t ? $i : St;
    return !t && Rt(
      i,
      "iterate",
      l ? sa : Ps
    ), {
      // iterator protocol
      next() {
        const { value: b, done: A } = u.next();
        return A ? { value: b, done: A } : {
          value: a ? [f(b[0]), f(b[1])] : f(b),
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
function Dh(e, t) {
  const n = {
    get(r) {
      const i = this.__v_raw, o = Ne(i), a = Ne(r);
      e || (ls(r, a) && Rt(o, "get", r), Rt(o, "get", a));
      const { has: l } = pi(o), u = t ? ra : e ? $i : St;
      if (l.call(o, r))
        return u(i.get(r));
      if (l.call(o, a))
        return u(i.get(a));
      i !== o && i.get(r);
    },
    get size() {
      const r = this.__v_raw;
      return !e && Rt(Ne(r), "iterate", Ps), Reflect.get(r, "size", r);
    },
    has(r) {
      const i = this.__v_raw, o = Ne(i), a = Ne(r);
      return e || (ls(r, a) && Rt(o, "has", r), Rt(o, "has", a)), r === a ? i.has(r) : i.has(r) || i.has(a);
    },
    forEach(r, i) {
      const o = this, a = o.__v_raw, l = Ne(a), u = t ? ra : e ? $i : St;
      return !e && Rt(l, "iterate", Ps), a.forEach((f, b) => r.call(i, u(f), u(b), o));
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
        !t && !fn(r) && !hs(r) && (r = Ne(r));
        const i = Ne(this);
        return pi(i).has.call(i, r) || (i.add(r), Dn(i, "add", r, r)), this;
      },
      set(r, i) {
        !t && !fn(i) && !hs(i) && (i = Ne(i));
        const o = Ne(this), { has: a, get: l } = pi(o);
        let u = a.call(o, r);
        u || (r = Ne(r), u = a.call(o, r));
        const f = l.call(o, r);
        return o.set(r, i), u ? ls(i, f) && Dn(o, "set", r, i) : Dn(o, "add", r, i), this;
      },
      delete(r) {
        const i = Ne(this), { has: o, get: a } = pi(i);
        let l = o.call(i, r);
        l || (r = Ne(r), l = o.call(i, r)), a && a.call(i, r);
        const u = i.delete(r);
        return l && Dn(i, "delete", r, void 0), u;
      },
      clear() {
        const r = Ne(this), i = r.size !== 0, o = r.clear();
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
    n[r] = Mh(r, e, t);
  }), n;
}
function Na(e, t) {
  const n = Dh(e, t);
  return (s, r, i) => r === "__v_isReactive" ? !e : r === "__v_isReadonly" ? e : r === "__v_raw" ? s : Reflect.get(
    Ve(n, r) && r in s ? n : s,
    r,
    i
  );
}
const Fh = {
  get: /* @__PURE__ */ Na(!1, !1)
}, $h = {
  get: /* @__PURE__ */ Na(!1, !0)
}, Bh = {
  get: /* @__PURE__ */ Na(!0, !1)
};
const hu = /* @__PURE__ */ new WeakMap(), du = /* @__PURE__ */ new WeakMap(), pu = /* @__PURE__ */ new WeakMap(), Uh = /* @__PURE__ */ new WeakMap();
function zh(e) {
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
function Hh(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : zh(ph(e));
}
function Vr(e) {
  return hs(e) ? e : Pa(
    e,
    !1,
    Lh,
    Fh,
    hu
  );
}
function jh(e) {
  return Pa(
    e,
    !1,
    Ph,
    $h,
    du
  );
}
function mu(e) {
  return Pa(
    e,
    !0,
    Nh,
    Bh,
    pu
  );
}
function Pa(e, t, n, s, r) {
  if (!ct(e) || e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const i = Hh(e);
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
function fn(e) {
  return !!(e && e.__v_isShallow);
}
function Ma(e) {
  return e ? !!e.__v_raw : !1;
}
function Ne(e) {
  const t = e && e.__v_raw;
  return t ? Ne(t) : e;
}
function Wh(e) {
  return !Ve(e, "__v_skip") && Object.isExtensible(e) && Qo(e, "__v_skip", !0), e;
}
const St = (e) => ct(e) ? Vr(e) : e, $i = (e) => ct(e) ? mu(e) : e;
function It(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function ie(e) {
  return gu(e, !1);
}
function qh(e) {
  return gu(e, !0);
}
function gu(e, t) {
  return It(e) ? e : new Vh(e, t);
}
class Vh {
  constructor(t, n) {
    this.dep = new La(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? t : Ne(t), this._value = n ? t : St(t), this.__v_isShallow = n;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const n = this._rawValue, s = this.__v_isShallow || fn(t) || hs(t);
    t = s ? t : Ne(t), ls(t, n) && (this._rawValue = t, this._value = s ? t : St(t), this.dep.trigger());
  }
}
function E(e) {
  return It(e) ? e.value : e;
}
const Kh = {
  get: (e, t, n) => t === "__v_raw" ? e : E(Reflect.get(e, t, n)),
  set: (e, t, n, s) => {
    const r = e[t];
    return It(r) && !It(n) ? (r.value = n, !0) : Reflect.set(e, t, n, s);
  }
};
function _u(e) {
  return er(e) ? e : new Proxy(e, Kh);
}
class Gh {
  constructor(t, n, s) {
    this.fn = t, this.setter = n, this._value = void 0, this.dep = new La(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = zr - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = s;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    it !== this)
      return su(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return ou(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
function Yh(e, t, n = !1) {
  let s, r;
  return xe(e) ? s = e : (s = e.get, r = e.set), new Gh(s, r, n);
}
const gi = {}, Bi = /* @__PURE__ */ new WeakMap();
let Rs;
function Xh(e, t = !1, n = Rs) {
  if (n) {
    let s = Bi.get(n);
    s || Bi.set(n, s = []), s.push(e);
  }
}
function Zh(e, t, n = nt) {
  const { immediate: s, deep: r, once: i, scheduler: o, augmentJob: a, call: l } = n, u = (C) => r ? C : fn(C) || r === !1 || r === 0 ? Fn(C, 1) : Fn(C);
  let f, b, A, x, L = !1, z = !1;
  if (It(e) ? (b = () => e.value, L = fn(e)) : er(e) ? (b = () => u(e), L = !0) : Se(e) ? (z = !0, L = e.some((C) => er(C) || fn(C)), b = () => e.map((C) => {
    if (It(C))
      return C.value;
    if (er(C))
      return u(C);
    if (xe(C))
      return l ? l(C, 2) : C();
  })) : xe(e) ? t ? b = l ? () => l(e, 2) : e : b = () => {
    if (A) {
      Un();
      try {
        A();
      } finally {
        zn();
      }
    }
    const C = Rs;
    Rs = f;
    try {
      return l ? l(e, 3, [x]) : e(x);
    } finally {
      Rs = C;
    }
  } : b = Sn, t && r) {
    const C = b, M = r === !0 ? 1 / 0 : r;
    b = () => Fn(C(), M);
  }
  const ue = Ah(), R = () => {
    f.stop(), ue && ue.active && xa(ue.effects, f);
  };
  if (i && t) {
    const C = t;
    t = (...M) => {
      C(...M), R();
    };
  }
  let fe = z ? new Array(e.length).fill(gi) : gi;
  const me = (C) => {
    if (!(!(f.flags & 1) || !f.dirty && !C))
      if (t) {
        const M = f.run();
        if (r || L || (z ? M.some((S, j) => ls(S, fe[j])) : ls(M, fe))) {
          A && A();
          const S = Rs;
          Rs = f;
          try {
            const j = [
              M,
              // pass undefined as the old value when it's changed for the first time
              fe === gi ? void 0 : z && fe[0] === gi ? [] : fe,
              x
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
        f.run();
  };
  return a && a(me), f = new tu(b), f.scheduler = o ? () => o(me, !1) : me, x = (C) => Xh(C, !1, f), A = f.onStop = () => {
    const C = Bi.get(f);
    if (C) {
      if (l)
        l(C, 4);
      else
        for (const M of C) M();
      Bi.delete(f);
    }
  }, t ? s ? me(!0) : fe = f.run() : o ? o(me.bind(null, !0), !0) : f.run(), R.pause = f.pause.bind(f), R.resume = f.resume.bind(f), R.stop = R, R;
}
function Fn(e, t = 1 / 0, n) {
  if (t <= 0 || !ct(e) || e.__v_skip || (n = n || /* @__PURE__ */ new Set(), n.has(e)))
    return e;
  if (n.add(e), t--, It(e))
    Fn(e.value, t, n);
  else if (Se(e))
    for (let s = 0; s < e.length; s++)
      Fn(e[s], t, n);
  else if (Kc(e) || Qs(e))
    e.forEach((s) => {
      Fn(s, t, n);
    });
  else if (Xc(e)) {
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
    ro(r, t, n);
  }
}
function xn(e, t, n, s) {
  if (xe(e)) {
    const r = Kr(e, t, n, s);
    return r && Gc(r) && r.catch((i) => {
      ro(i, t, n);
    }), r;
  }
  if (Se(e)) {
    const r = [];
    for (let i = 0; i < e.length; i++)
      r.push(xn(e[i], t, n, s));
    return r;
  }
}
function ro(e, t, n, s = !0) {
  const r = t ? t.vnode : null, { errorHandler: i, throwUnhandledErrorInProduction: o } = t && t.appContext.config || nt;
  if (t) {
    let a = t.parent;
    const l = t.proxy, u = `https://vuejs.org/error-reference/#runtime-${n}`;
    for (; a; ) {
      const f = a.ec;
      if (f) {
        for (let b = 0; b < f.length; b++)
          if (f[b](e, l, u) === !1)
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
  Jh(e, n, r, s, o);
}
function Jh(e, t, n, s = !0, r = !1) {
  if (r)
    throw e;
  console.error(e);
}
const Mt = [];
let Tn = -1;
const tr = [];
let is = null, Ys = 0;
const yu = /* @__PURE__ */ Promise.resolve();
let Ui = null;
function as(e) {
  const t = Ui || yu;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function Qh(e) {
  let t = Tn + 1, n = Mt.length;
  for (; t < n; ) {
    const s = t + n >>> 1, r = Mt[s], i = jr(r);
    i < e || i === e && r.flags & 2 ? t = s + 1 : n = s;
  }
  return t;
}
function Da(e) {
  if (!(e.flags & 1)) {
    const t = jr(e), n = Mt[Mt.length - 1];
    !n || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= jr(n) ? Mt.push(e) : Mt.splice(Qh(t), 0, e), e.flags |= 1, vu();
  }
}
function vu() {
  Ui || (Ui = yu.then(wu));
}
function ed(e) {
  Se(e) ? tr.push(...e) : is && e.id === -1 ? is.splice(Ys + 1, 0, e) : e.flags & 1 || (tr.push(e), e.flags |= 1), vu();
}
function Pl(e, t, n = Tn + 1) {
  for (; n < Mt.length; n++) {
    const s = Mt[n];
    if (s && s.flags & 2) {
      if (e && s.id !== e.uid)
        continue;
      Mt.splice(n, 1), n--, s.flags & 4 && (s.flags &= -2), s(), s.flags & 4 || (s.flags &= -2);
    }
  }
}
function bu(e) {
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
function wu(e) {
  try {
    for (Tn = 0; Tn < Mt.length; Tn++) {
      const t = Mt[Tn];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), Kr(
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
    Tn = -1, Mt.length = 0, bu(), Ui = null, (Mt.length || tr.length) && wu();
  }
}
let un = null, ku = null;
function zi(e) {
  const t = un;
  return un = e, ku = e && e.type.__scopeId || null, t;
}
function td(e, t = un, n) {
  if (!t || e._n)
    return e;
  const s = (...r) => {
    s._d && jl(-1);
    const i = zi(t);
    let o;
    try {
      o = e(...r);
    } finally {
      zi(i), s._d && jl(1);
    }
    return o;
  };
  return s._n = !0, s._c = !0, s._d = !0, s;
}
function ss(e, t) {
  if (un === null)
    return e;
  const n = uo(un), s = e.dirs || (e.dirs = []);
  for (let r = 0; r < t.length; r++) {
    let [i, o, a, l = nt] = t[r];
    i && (xe(i) && (i = {
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
const nd = Symbol("_vte"), sd = (e) => e.__isTeleport;
function Fa(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, Fa(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function Hn(e, t) {
  return xe(e) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    Ot({ name: e.name }, t, { setup: e })
  ) : e;
}
function Tu(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
function Mr(e, t, n, s, r = !1) {
  if (Se(e)) {
    e.forEach(
      (L, z) => Mr(
        L,
        t && (Se(t) ? t[z] : t),
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
  const i = s.shapeFlag & 4 ? uo(s.component) : s.el, o = r ? null : i, { i: a, r: l } = e, u = t && t.r, f = a.refs === nt ? a.refs = {} : a.refs, b = a.setupState, A = Ne(b), x = b === nt ? () => !1 : (L) => Ve(A, L);
  if (u != null && u !== l && (gt(u) ? (f[u] = null, x(u) && (b[u] = null)) : It(u) && (u.value = null)), xe(l))
    Kr(l, a, 12, [o, f]);
  else {
    const L = gt(l), z = It(l);
    if (L || z) {
      const ue = () => {
        if (e.f) {
          const R = L ? x(l) ? b[l] : f[l] : l.value;
          r ? Se(R) && xa(R, i) : Se(R) ? R.includes(i) || R.push(i) : L ? (f[l] = [i], x(l) && (b[l] = f[l])) : (l.value = [i], e.k && (f[e.k] = l.value));
        } else L ? (f[l] = o, x(l) && (b[l] = o)) : z && (l.value = o, e.k && (f[e.k] = o));
      };
      o ? (ue.id = -1, Zt(ue, n)) : ue();
    }
  }
}
no().requestIdleCallback;
no().cancelIdleCallback;
const Dr = (e) => !!e.type.__asyncLoader, Au = (e) => e.type.__isKeepAlive;
function rd(e, t) {
  Su(e, "a", t);
}
function id(e, t) {
  Su(e, "da", t);
}
function Su(e, t, n = Ft) {
  const s = e.__wdc || (e.__wdc = () => {
    let r = n;
    for (; r; ) {
      if (r.isDeactivated)
        return;
      r = r.parent;
    }
    return e();
  });
  if (io(t, s, n), n) {
    let r = n.parent;
    for (; r && r.parent; )
      Au(r.parent.vnode) && od(s, t, n, r), r = r.parent;
  }
}
function od(e, t, n, s) {
  const r = io(
    t,
    e,
    s,
    !0
    /* prepend */
  );
  Gr(() => {
    xa(s[t], r);
  }, n);
}
function io(e, t, n = Ft, s = !1) {
  if (n) {
    const r = n[e] || (n[e] = []), i = t.__weh || (t.__weh = (...o) => {
      Un();
      const a = Yr(n), l = xn(t, n, e, o);
      return a(), zn(), l;
    });
    return s ? r.unshift(i) : r.push(i), i;
  }
}
const jn = (e) => (t, n = Ft) => {
  (!qr || e === "sp") && io(e, (...s) => t(...s), n);
}, ad = jn("bm"), oo = jn("m"), ld = jn(
  "bu"
), cd = jn("u"), ao = jn(
  "bum"
), Gr = jn("um"), ud = jn(
  "sp"
), fd = jn("rtg"), hd = jn("rtc");
function dd(e, t = Ft) {
  io("ec", e, t);
}
const pd = Symbol.for("v-ndc");
function dt(e, t, n, s) {
  let r;
  const i = n, o = Se(e);
  if (o || gt(e)) {
    const a = o && er(e);
    let l = !1, u = !1;
    a && (l = !fn(e), u = hs(e), e = so(e)), r = new Array(e.length);
    for (let f = 0, b = e.length; f < b; f++)
      r[f] = t(
        l ? u ? $i(St(e[f])) : St(e[f]) : e[f],
        f,
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
        const f = a[l];
        r[l] = t(e[f], f, l, i);
      }
    }
  else
    r = [];
  return r;
}
const ia = (e) => e ? Vu(e) ? uo(e) : ia(e.parent) : null, Fr = (
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
    $options: (e) => xu(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      Da(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = as.bind(e.proxy)),
    $watch: (e) => Dd.bind(e)
  })
), No = (e, t) => e !== nt && !e.__isScriptSetup && Ve(e, t), md = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: n, setupState: s, data: r, props: i, accessCache: o, type: a, appContext: l } = e;
    let u;
    if (t[0] !== "$") {
      const x = o[t];
      if (x !== void 0)
        switch (x) {
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
        if (No(s, t))
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
        oa && (o[t] = 0);
      }
    }
    const f = Fr[t];
    let b, A;
    if (f)
      return t === "$attrs" && Rt(e.attrs, "get", ""), f(e);
    if (
      // css module (injected by vue-loader)
      (b = a.__cssModules) && (b = b[t])
    )
      return b;
    if (n !== nt && Ve(n, t))
      return o[t] = 4, n[t];
    if (
      // global properties
      A = l.config.globalProperties, Ve(A, t)
    )
      return A[t];
  },
  set({ _: e }, t, n) {
    const { data: s, setupState: r, ctx: i } = e;
    return No(r, t) ? (r[t] = n, !0) : s !== nt && Ve(s, t) ? (s[t] = n, !0) : Ve(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (i[t] = n, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: n, ctx: s, appContext: r, propsOptions: i }
  }, o) {
    let a;
    return !!n[o] || e !== nt && Ve(e, o) || No(t, o) || (a = i[0]) && Ve(a, o) || Ve(s, o) || Ve(Fr, o) || Ve(r.config.globalProperties, o);
  },
  defineProperty(e, t, n) {
    return n.get != null ? e._.accessCache[t] = 0 : Ve(n, "value") && this.set(e, t, n.value, null), Reflect.defineProperty(e, t, n);
  }
};
function Ml(e) {
  return Se(e) ? e.reduce(
    (t, n) => (t[n] = null, t),
    {}
  ) : e;
}
let oa = !0;
function gd(e) {
  const t = xu(e), n = e.proxy, s = e.ctx;
  oa = !1, t.beforeCreate && Dl(t.beforeCreate, e, "bc");
  const {
    // state
    data: r,
    computed: i,
    methods: o,
    watch: a,
    provide: l,
    inject: u,
    // lifecycle
    created: f,
    beforeMount: b,
    mounted: A,
    beforeUpdate: x,
    updated: L,
    activated: z,
    deactivated: ue,
    beforeDestroy: R,
    beforeUnmount: fe,
    destroyed: me,
    unmounted: C,
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
    directives: Ge,
    filters: ze
  } = t;
  if (u && _d(u, s, null), o)
    for (const ve in o) {
      const ye = o[ve];
      xe(ye) && (s[ve] = ye.bind(n));
    }
  if (r) {
    const ve = r.call(n, n);
    ct(ve) && (e.data = Vr(ve));
  }
  if (oa = !0, i)
    for (const ve in i) {
      const ye = i[ve], Qe = xe(ye) ? ye.bind(n, n) : xe(ye.get) ? ye.get.bind(n, n) : Sn, Ye = !xe(ye) && xe(ye.set) ? ye.set.bind(n) : Sn, ot = oe({
        get: Qe,
        set: Ye
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
      Eu(a[ve], s, n, ve);
  if (l) {
    const ve = xe(l) ? l.call(n) : l;
    Reflect.ownKeys(ve).forEach((ye) => {
      Td(ye, ve[ye]);
    });
  }
  f && Dl(f, e, "c");
  function he(ve, ye) {
    Se(ye) ? ye.forEach((Qe) => ve(Qe.bind(n))) : ye && ve(ye.bind(n));
  }
  if (he(ad, b), he(oo, A), he(ld, x), he(cd, L), he(rd, z), he(id, ue), he(dd, ne), he(hd, S), he(fd, j), he(ao, fe), he(Gr, C), he(ud, ce), Se(ge))
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
  M && e.render === Sn && (e.render = M), Oe != null && (e.inheritAttrs = Oe), ke && (e.components = ke), Ge && (e.directives = Ge), ce && Tu(e);
}
function _d(e, t, n = Sn) {
  Se(e) && (e = aa(e));
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
function Dl(e, t, n) {
  xn(
    Se(e) ? e.map((s) => s.bind(t.proxy)) : e.bind(t.proxy),
    t,
    n
  );
}
function Eu(e, t, n, s) {
  let r = s.includes(".") ? Uu(n, s) : () => n[s];
  if (gt(e)) {
    const i = t[e];
    xe(i) && pt(r, i);
  } else if (xe(e))
    pt(r, e.bind(n));
  else if (ct(e))
    if (Se(e))
      e.forEach((i) => Eu(i, t, n, s));
    else {
      const i = xe(e.handler) ? e.handler.bind(n) : t[e.handler];
      xe(i) && pt(r, i, e);
    }
}
function xu(e) {
  const t = e.type, { mixins: n, extends: s } = t, {
    mixins: r,
    optionsCache: i,
    config: { optionMergeStrategies: o }
  } = e.appContext, a = i.get(t);
  let l;
  return a ? l = a : !r.length && !n && !s ? l = t : (l = {}, r.length && r.forEach(
    (u) => Hi(l, u, o, !0)
  ), Hi(l, t, o)), ct(t) && i.set(t, l), l;
}
function Hi(e, t, n, s = !1) {
  const { mixins: r, extends: i } = t;
  i && Hi(e, i, n, !0), r && r.forEach(
    (o) => Hi(e, o, n, !0)
  );
  for (const o in t)
    if (!(s && o === "expose")) {
      const a = yd[o] || n && n[o];
      e[o] = a ? a(e[o], t[o]) : t[o];
    }
  return e;
}
const yd = {
  data: Fl,
  props: $l,
  emits: $l,
  // objects
  methods: Cr,
  computed: Cr,
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
  components: Cr,
  directives: Cr,
  // watch
  watch: bd,
  // provide / inject
  provide: Fl,
  inject: vd
};
function Fl(e, t) {
  return t ? e ? function() {
    return Ot(
      xe(e) ? e.call(this, this) : e,
      xe(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function vd(e, t) {
  return Cr(aa(e), aa(t));
}
function aa(e) {
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
function Cr(e, t) {
  return e ? Ot(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function $l(e, t) {
  return e ? Se(e) && Se(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : Ot(
    /* @__PURE__ */ Object.create(null),
    Ml(e),
    Ml(t ?? {})
  ) : t;
}
function bd(e, t) {
  if (!e) return t;
  if (!t) return e;
  const n = Ot(/* @__PURE__ */ Object.create(null), e);
  for (const s in t)
    n[s] = Pt(e[s], t[s]);
  return n;
}
function Cu() {
  return {
    app: null,
    config: {
      isNativeTag: hh,
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
let wd = 0;
function kd(e, t) {
  return function(s, r = null) {
    xe(s) || (s = Ot({}, s)), r != null && !ct(r) && (r = null);
    const i = Cu(), o = /* @__PURE__ */ new WeakSet(), a = [];
    let l = !1;
    const u = i.app = {
      _uid: wd++,
      _component: s,
      _props: r,
      _container: null,
      _context: i,
      _instance: null,
      version: sp,
      get config() {
        return i.config;
      },
      set config(f) {
      },
      use(f, ...b) {
        return o.has(f) || (f && xe(f.install) ? (o.add(f), f.install(u, ...b)) : xe(f) && (o.add(f), f(u, ...b))), u;
      },
      mixin(f) {
        return i.mixins.includes(f) || i.mixins.push(f), u;
      },
      component(f, b) {
        return b ? (i.components[f] = b, u) : i.components[f];
      },
      directive(f, b) {
        return b ? (i.directives[f] = b, u) : i.directives[f];
      },
      mount(f, b, A) {
        if (!l) {
          const x = u._ceVNode || Dt(s, r);
          return x.appContext = i, A === !0 ? A = "svg" : A === !1 && (A = void 0), e(x, f, A), l = !0, u._container = f, f.__vue_app__ = u, uo(x.component);
        }
      },
      onUnmount(f) {
        a.push(f);
      },
      unmount() {
        l && (xn(
          a,
          u._instance,
          16
        ), e(null, u._container), delete u._container.__vue_app__);
      },
      provide(f, b) {
        return i.provides[f] = b, u;
      },
      runWithContext(f) {
        const b = nr;
        nr = u;
        try {
          return f();
        } finally {
          nr = b;
        }
      }
    };
    return u;
  };
}
let nr = null;
function Td(e, t) {
  if (Ft) {
    let n = Ft.provides;
    const s = Ft.parent && Ft.parent.provides;
    s === n && (n = Ft.provides = Object.create(s)), n[e] = t;
  }
}
function Ti(e, t, n = !1) {
  const s = Zd();
  if (s || nr) {
    let r = nr ? nr._context.provides : s ? s.parent == null || s.ce ? s.vnode.appContext && s.vnode.appContext.provides : s.parent.provides : void 0;
    if (r && e in r)
      return r[e];
    if (arguments.length > 1)
      return n && xe(t) ? t.call(s && s.proxy) : t;
  }
}
const Ru = {}, Iu = () => Object.create(Ru), Ou = (e) => Object.getPrototypeOf(e) === Ru;
function Ad(e, t, n, s = !1) {
  const r = {}, i = Iu();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), Lu(e, t, r, i);
  for (const o in e.propsOptions[0])
    o in r || (r[o] = void 0);
  n ? e.props = s ? r : jh(r) : e.type.props ? e.props = r : e.props = i, e.attrs = i;
}
function Sd(e, t, n, s) {
  const {
    props: r,
    attrs: i,
    vnode: { patchFlag: o }
  } = e, a = Ne(r), [l] = e.propsOptions;
  let u = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (s || o > 0) && !(o & 16)
  ) {
    if (o & 8) {
      const f = e.vnode.dynamicProps;
      for (let b = 0; b < f.length; b++) {
        let A = f[b];
        if (lo(e.emitsOptions, A))
          continue;
        const x = t[A];
        if (l)
          if (Ve(i, A))
            x !== i[A] && (i[A] = x, u = !0);
          else {
            const L = fs(A);
            r[L] = la(
              l,
              a,
              L,
              x,
              e,
              !1
            );
          }
        else
          x !== i[A] && (i[A] = x, u = !0);
      }
    }
  } else {
    Lu(e, t, r, i) && (u = !0);
    let f;
    for (const b in a)
      (!t || // for camelCase
      !Ve(t, b) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((f = ms(b)) === b || !Ve(t, f))) && (l ? n && // for camelCase
      (n[b] !== void 0 || // for kebab-case
      n[f] !== void 0) && (r[b] = la(
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
  u && Dn(e.attrs, "set", "");
}
function Lu(e, t, n, s) {
  const [r, i] = e.propsOptions;
  let o = !1, a;
  if (t)
    for (let l in t) {
      if (Lr(l))
        continue;
      const u = t[l];
      let f;
      r && Ve(r, f = fs(l)) ? !i || !i.includes(f) ? n[f] = u : (a || (a = {}))[f] = u : lo(e.emitsOptions, l) || (!(l in s) || u !== s[l]) && (s[l] = u, o = !0);
    }
  if (i) {
    const l = Ne(n), u = a || nt;
    for (let f = 0; f < i.length; f++) {
      const b = i[f];
      n[b] = la(
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
function la(e, t, n, s, r, i) {
  const o = e[n];
  if (o != null) {
    const a = Ve(o, "default");
    if (a && s === void 0) {
      const l = o.default;
      if (o.type !== Function && !o.skipFactory && xe(l)) {
        const { propsDefaults: u } = r;
        if (n in u)
          s = u[n];
        else {
          const f = Yr(r);
          s = u[n] = l.call(
            null,
            t
          ), f();
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
const Ed = /* @__PURE__ */ new WeakMap();
function Nu(e, t, n = !1) {
  const s = n ? Ed : t.propsCache, r = s.get(e);
  if (r)
    return r;
  const i = e.props, o = {}, a = [];
  let l = !1;
  if (!xe(e)) {
    const f = (b) => {
      l = !0;
      const [A, x] = Nu(b, t, !0);
      Ot(o, A), x && a.push(...x);
    };
    !n && t.mixins.length && t.mixins.forEach(f), e.extends && f(e.extends), e.mixins && e.mixins.forEach(f);
  }
  if (!i && !l)
    return ct(e) && s.set(e, Js), Js;
  if (Se(i))
    for (let f = 0; f < i.length; f++) {
      const b = fs(i[f]);
      Bl(b) && (o[b] = nt);
    }
  else if (i)
    for (const f in i) {
      const b = fs(f);
      if (Bl(b)) {
        const A = i[f], x = o[b] = Se(A) || xe(A) ? { type: A } : Ot({}, A), L = x.type;
        let z = !1, ue = !0;
        if (Se(L))
          for (let R = 0; R < L.length; ++R) {
            const fe = L[R], me = xe(fe) && fe.name;
            if (me === "Boolean") {
              z = !0;
              break;
            } else me === "String" && (ue = !1);
          }
        else
          z = xe(L) && L.name === "Boolean";
        x[
          0
          /* shouldCast */
        ] = z, x[
          1
          /* shouldCastTrue */
        ] = ue, (z || Ve(x, "default")) && a.push(b);
      }
    }
  const u = [o, a];
  return ct(e) && s.set(e, u), u;
}
function Bl(e) {
  return e[0] !== "$" && !Lr(e);
}
const $a = (e) => e === "_" || e === "__" || e === "_ctx" || e === "$stable", Ba = (e) => Se(e) ? e.map(An) : [An(e)], xd = (e, t, n) => {
  if (t._n)
    return t;
  const s = td((...r) => Ba(t(...r)), n);
  return s._c = !1, s;
}, Pu = (e, t, n) => {
  const s = e._ctx;
  for (const r in e) {
    if ($a(r)) continue;
    const i = e[r];
    if (xe(i))
      t[r] = xd(r, i, s);
    else if (i != null) {
      const o = Ba(i);
      t[r] = () => o;
    }
  }
}, Mu = (e, t) => {
  const n = Ba(t);
  e.slots.default = () => n;
}, Du = (e, t, n) => {
  for (const s in t)
    (n || !$a(s)) && (e[s] = t[s]);
}, Cd = (e, t, n) => {
  const s = e.slots = Iu();
  if (e.vnode.shapeFlag & 32) {
    const r = t.__;
    r && Qo(s, "__", r, !0);
    const i = t._;
    i ? (Du(s, t, n), n && Qo(s, "_", i, !0)) : Pu(t, s);
  } else t && Mu(e, t);
}, Rd = (e, t, n) => {
  const { vnode: s, slots: r } = e;
  let i = !0, o = nt;
  if (s.shapeFlag & 32) {
    const a = t._;
    a ? n && a === 1 ? i = !1 : Du(r, t, n) : (i = !t.$stable, Pu(t, r)), o = t;
  } else t && (Mu(e, t), o = { default: 1 });
  if (i)
    for (const a in r)
      !$a(a) && o[a] == null && delete r[a];
}, Zt = jd;
function Id(e) {
  return Od(e);
}
function Od(e, t) {
  const n = no();
  n.__VUE__ = !0;
  const {
    insert: s,
    remove: r,
    patchProp: i,
    createElement: o,
    createText: a,
    createComment: l,
    setText: u,
    setElementText: f,
    parentNode: b,
    nextSibling: A,
    setScopeId: x = Sn,
    insertStaticContent: L
  } = e, z = (y, v, N, D = null, U = null, P = null, Y = void 0, q = null, V = !!v.dynamicChildren) => {
    if (y === v)
      return;
    y && !yr(y, v) && (D = Bt(y), We(y, U, P, !0), y = null), v.patchFlag === -2 && (V = !1, v.dynamicChildren = null);
    const { type: H, ref: se, shapeFlag: Z } = v;
    switch (H) {
      case co:
        ue(y, v, N, D);
        break;
      case ds:
        R(y, v, N, D);
        break;
      case Ai:
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
        Z & 1 ? M(
          y,
          v,
          N,
          D,
          U,
          P,
          Y,
          q,
          V
        ) : Z & 6 ? Ge(
          y,
          v,
          N,
          D,
          U,
          P,
          Y,
          q,
          V
        ) : (Z & 64 || Z & 128) && H.process(
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
    se != null && U ? Mr(se, y && y.ref, P, v || y, !v) : se == null && y && y.ref != null && Mr(y.ref, null, P, y, !0);
  }, ue = (y, v, N, D) => {
    if (y == null)
      s(
        v.el = a(v.children),
        N,
        D
      );
    else {
      const U = v.el = y.el;
      v.children !== y.children && u(U, v.children);
    }
  }, R = (y, v, N, D) => {
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
      U = A(y), s(y, N, D), y = U;
    s(v, N, D);
  }, C = ({ el: y, anchor: v }) => {
    let N;
    for (; y && y !== v; )
      N = A(y), r(y), y = N;
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
    const { props: se, shapeFlag: Z, transition: J, dirs: de } = y;
    if (V = y.el = o(
      y.type,
      P,
      se && se.is,
      se
    ), Z & 8 ? f(V, y.children) : Z & 16 && ne(
      y.children,
      V,
      null,
      D,
      U,
      Po(y, P),
      Y,
      q
    ), de && Ss(y, null, D, "created"), j(V, y, y.scopeId, Y, D), se) {
      for (const be in se)
        be !== "value" && !Lr(be) && i(V, be, null, se[be], P, D);
      "value" in se && i(V, "value", null, se.value, P), (H = se.onVnodeBeforeMount) && wn(H, D, y);
    }
    de && Ss(y, null, D, "beforeMount");
    const pe = Ld(U, J);
    pe && J.beforeEnter(V), s(V, v, N), ((H = se && se.onVnodeMounted) || pe || de) && Zt(() => {
      H && wn(H, D, y), pe && J.enter(V), de && Ss(y, null, D, "mounted");
    }, U);
  }, j = (y, v, N, D, U) => {
    if (N && x(y, N), D)
      for (let P = 0; P < D.length; P++)
        x(y, D[P]);
    if (U) {
      let P = U.subTree;
      if (v === P || Hu(P.type) && (P.ssContent === v || P.ssFallback === v)) {
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
      const se = y[H] = q ? os(y[H]) : An(y[H]);
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
    const Z = y.props || nt, J = v.props || nt;
    let de;
    if (N && Es(N, !1), (de = J.onVnodeBeforeUpdate) && wn(de, N, v, y), se && Ss(v, y, N, "beforeUpdate"), N && Es(N, !0), (Z.innerHTML && J.innerHTML == null || Z.textContent && J.textContent == null) && f(q, ""), H ? ge(
      y.dynamicChildren,
      H,
      q,
      N,
      D,
      Po(v, U),
      P
    ) : Y || ye(
      y,
      v,
      q,
      null,
      N,
      D,
      Po(v, U),
      P,
      !1
    ), V > 0) {
      if (V & 16)
        Oe(q, Z, J, N, U);
      else if (V & 2 && Z.class !== J.class && i(q, "class", null, J.class, U), V & 4 && i(q, "style", Z.style, J.style, U), V & 8) {
        const pe = v.dynamicProps;
        for (let be = 0; be < pe.length; be++) {
          const Te = pe[be], Me = Z[Te], Ie = J[Te];
          (Ie !== Me || Te === "value") && i(q, Te, Me, Ie, U, N);
        }
      }
      V & 1 && y.children !== v.children && f(q, v.children);
    } else !Y && H == null && Oe(q, Z, J, N, U);
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
        !yr(V, H) || // - In the case of a component, it could contain anything.
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
          !Lr(P) && !(P in N) && i(
            y,
            P,
            v[P],
            null,
            U,
            D
          );
      for (const P in N) {
        if (Lr(P)) continue;
        const Y = N[P], q = v[P];
        Y !== q && P !== "value" && i(y, P, q, Y, U, D);
      }
      "value" in N && i(y, "value", v.value, N.value, U);
    }
  }, ke = (y, v, N, D, U, P, Y, q, V) => {
    const H = v.el = y ? y.el : a(""), se = v.anchor = y ? y.anchor : a("");
    let { patchFlag: Z, dynamicChildren: J, slotScopeIds: de } = v;
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
    )) : Z > 0 && Z & 64 && J && // #2715 the previous fragment could've been a BAILed one as a result
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
    (v.key != null || U && v === U.subTree) && Fu(
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
  }, Ge = (y, v, N, D, U, P, Y, q, V) => {
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
    const q = y.component = Xd(
      y,
      D,
      U
    );
    if (Au(y) && (q.ctx.renderer = Lt), Jd(q, !1, Y), q.asyncDep) {
      if (U && U.registerDep(q, he, Y), !y.el) {
        const V = q.subTree = Dt(ds);
        R(null, V, v, N), y.placeholder = V.el;
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
    if (zd(y, v, N))
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
        let { next: Z, bu: J, u: de, parent: pe, vnode: be } = y;
        {
          const c = $u(y);
          if (c) {
            Z && (Z.el = be.el, ve(y, Z, Y)), c.asyncDep.then(() => {
              y.isUnmounted || q();
            });
            return;
          }
        }
        let Te = Z, Me;
        Es(y, !1), Z ? (Z.el = be.el, ve(y, Z, Y)) : Z = be, J && ki(J), (Me = Z.props && Z.props.onVnodeBeforeUpdate) && wn(Me, pe, Z, be), Es(y, !0);
        const Ie = zl(y), W = y.subTree;
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
        ), Z.el = Ie.el, Te === null && Hd(y, Ie.el), de && Zt(de, U), (Me = Z.props && Z.props.onVnodeUpdated) && Zt(
          () => wn(Me, pe, Z, be),
          U
        );
      } else {
        let Z;
        const { el: J, props: de } = v, { bm: pe, m: be, parent: Te, root: Me, type: Ie } = y, W = Dr(v);
        Es(y, !1), pe && ki(pe), !W && (Z = de && de.onVnodeBeforeMount) && wn(Z, Te, v), Es(y, !0);
        {
          Me.ce && // @ts-expect-error _def is private
          Me.ce._def.shadowRoot !== !1 && Me.ce._injectChildStyle(Ie);
          const c = y.subTree = zl(y);
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
        if (be && Zt(be, U), !W && (Z = de && de.onVnodeMounted)) {
          const c = v;
          Zt(
            () => wn(Z, Te, c),
            U
          );
        }
        (v.shapeFlag & 256 || Te && Dr(Te.vnode) && Te.vnode.shapeFlag & 256) && y.a && Zt(y.a, U), y.isMounted = !0, v = N = D = null;
      }
    };
    y.scope.on();
    const V = y.effect = new tu(q);
    y.scope.off();
    const H = y.update = V.run.bind(V), se = y.job = V.runIfDirty.bind(V);
    se.i = y, se.id = y.uid, V.scheduler = () => Da(se), Es(y, !0), H();
  }, ve = (y, v, N) => {
    v.component = y;
    const D = y.vnode.props;
    y.vnode = v, y.next = null, Sd(y, v.props, D, N), Rd(y, v.children, N), Un(), Pl(y), zn();
  }, ye = (y, v, N, D, U, P, Y, q, V = !1) => {
    const H = y && y.children, se = y ? y.shapeFlag : 0, Z = v.children, { patchFlag: J, shapeFlag: de } = v;
    if (J > 0) {
      if (J & 128) {
        Ye(
          H,
          Z,
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
          Z,
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
    de & 8 ? (se & 16 && yt(H, U, P), Z !== H && f(N, Z)) : se & 16 ? de & 16 ? Ye(
      H,
      Z,
      N,
      D,
      U,
      P,
      Y,
      q,
      V
    ) : yt(H, U, P, !0) : (se & 8 && f(N, ""), de & 16 && ne(
      Z,
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
    const H = y.length, se = v.length, Z = Math.min(H, se);
    let J;
    for (J = 0; J < Z; J++) {
      const de = v[J] = V ? os(v[J]) : An(v[J]);
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
      Z
    ) : ne(
      v,
      N,
      D,
      U,
      P,
      Y,
      q,
      V,
      Z
    );
  }, Ye = (y, v, N, D, U, P, Y, q, V) => {
    let H = 0;
    const se = v.length;
    let Z = y.length - 1, J = se - 1;
    for (; H <= Z && H <= J; ) {
      const de = y[H], pe = v[H] = V ? os(v[H]) : An(v[H]);
      if (yr(de, pe))
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
    for (; H <= Z && H <= J; ) {
      const de = y[Z], pe = v[J] = V ? os(v[J]) : An(v[J]);
      if (yr(de, pe))
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
      Z--, J--;
    }
    if (H > Z) {
      if (H <= J) {
        const de = J + 1, pe = de < se ? v[de].el : D;
        for (; H <= J; )
          z(
            null,
            v[H] = V ? os(v[H]) : An(v[H]),
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
      for (; H <= Z; )
        We(y[H], U, P, !0), H++;
    else {
      const de = H, pe = H, be = /* @__PURE__ */ new Map();
      for (H = pe; H <= J; H++) {
        const I = v[H] = V ? os(v[H]) : An(v[H]);
        I.key != null && be.set(I.key, H);
      }
      let Te, Me = 0;
      const Ie = J - pe + 1;
      let W = !1, c = 0;
      const _ = new Array(Ie);
      for (H = 0; H < Ie; H++) _[H] = 0;
      for (H = de; H <= Z; H++) {
        const I = y[H];
        if (Me >= Ie) {
          We(I, U, P, !0);
          continue;
        }
        let $;
        if (I.key != null)
          $ = be.get(I.key);
        else
          for (Te = pe; Te <= J; Te++)
            if (_[Te - pe] === 0 && yr(I, v[Te])) {
              $ = Te;
              break;
            }
        $ === void 0 ? We(I, U, P, !0) : (_[$ - pe] = H + 1, $ >= c ? c = $ : W = !0, z(
          I,
          v[$],
          N,
          null,
          U,
          P,
          Y,
          q,
          V
        ), Me++);
      }
      const O = W ? Nd(_) : Js;
      for (Te = O.length - 1, H = Ie - 1; H >= 0; H--) {
        const I = pe + H, $ = v[I], re = v[I + 1], te = I + 1 < se ? (
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
        ) : W && (Te < 0 || H !== O[Te] ? ot($, N, te, 2) : Te--);
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
      for (let Z = 0; Z < V.length; Z++)
        ot(V[Z], v, N, D);
      s(y.anchor, v, N);
      return;
    }
    if (Y === Ai) {
      me(y, v, N);
      return;
    }
    if (D !== 2 && H & 1 && q)
      if (D === 0)
        q.beforeEnter(P), s(P, v, N), Zt(() => q.enter(P), U);
      else {
        const { leave: Z, delayLeave: J, afterLeave: de } = q, pe = () => {
          y.ctx.isUnmounted ? r(P) : s(P, v, N);
        }, be = () => {
          Z(P, () => {
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
      patchFlag: Z,
      dirs: J,
      cacheIndex: de
    } = y;
    if (Z === -2 && (U = !1), q != null && (Un(), Mr(q, null, N, y, !0), zn()), de != null && (v.renderCache[de] = void 0), se & 256) {
      v.ctx.deactivate(y);
      return;
    }
    const pe = se & 1 && J, be = !Dr(y);
    let Te;
    if (be && (Te = Y && Y.onVnodeBeforeUnmount) && wn(Te, v, y), se & 6)
      Fe(y.component, N, D);
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
      (P !== Re || Z > 0 && Z & 64) ? yt(
        H,
        v,
        N,
        !1,
        !0
      ) : (P === Re && Z & 384 || !U && se & 16) && yt(V, v, N), D && jt(y);
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
    if (v === Ai) {
      C(y);
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
      N = A(y), r(y), y = N;
    r(v);
  }, Fe = (y, v, N) => {
    const {
      bum: D,
      scope: U,
      job: P,
      subTree: Y,
      um: q,
      m: V,
      a: H,
      parent: se,
      slots: { __: Z }
    } = y;
    Ul(V), Ul(H), D && ki(D), se && Se(Z) && Z.forEach((J) => {
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
    const v = A(y.anchor || y.el), N = v && v[nd];
    return N ? A(N) : v;
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
    ), v._vnode = y, Wt || (Wt = !0, Pl(), bu(), Wt = !1);
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
    createApp: kd(qt)
  };
}
function Po({ type: e, props: t }, n) {
  return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function Es({ effect: e, job: t }, n) {
  n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function Ld(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function Fu(e, t, n = !1) {
  const s = e.children, r = t.children;
  if (Se(s) && Se(r))
    for (let i = 0; i < s.length; i++) {
      const o = s[i];
      let a = r[i];
      a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = r[i] = os(r[i]), a.el = o.el), !n && a.patchFlag !== -2 && Fu(o, a)), a.type === co && (a.el = o.el), a.type === ds && !a.el && (a.el = o.el);
    }
}
function Nd(e) {
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
function $u(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : $u(t);
}
function Ul(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
const Pd = Symbol.for("v-scx"), Md = () => Ti(Pd);
function pt(e, t, n) {
  return Bu(e, t, n);
}
function Bu(e, t, n = nt) {
  const { immediate: s, deep: r, flush: i, once: o } = n, a = Ot({}, n), l = t && s || !t && i !== "post";
  let u;
  if (qr) {
    if (i === "sync") {
      const x = Md();
      u = x.__watcherHandles || (x.__watcherHandles = []);
    } else if (!l) {
      const x = () => {
      };
      return x.stop = Sn, x.resume = Sn, x.pause = Sn, x;
    }
  }
  const f = Ft;
  a.call = (x, L, z) => xn(x, f, L, z);
  let b = !1;
  i === "post" ? a.scheduler = (x) => {
    Zt(x, f && f.suspense);
  } : i !== "sync" && (b = !0, a.scheduler = (x, L) => {
    L ? x() : Da(x);
  }), a.augmentJob = (x) => {
    t && (x.flags |= 4), b && (x.flags |= 2, f && (x.id = f.uid, x.i = f));
  };
  const A = Zh(e, t, a);
  return qr && (u ? u.push(A) : l && A()), A;
}
function Dd(e, t, n) {
  const s = this.proxy, r = gt(e) ? e.includes(".") ? Uu(s, e) : () => s[e] : e.bind(s, s);
  let i;
  xe(t) ? i = t : (i = t.handler, n = t);
  const o = Yr(this), a = Bu(r, i.bind(s), n);
  return o(), a;
}
function Uu(e, t) {
  const n = t.split(".");
  return () => {
    let s = e;
    for (let r = 0; r < n.length && s; r++)
      s = s[n[r]];
    return s;
  };
}
const Fd = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${fs(t)}Modifiers`] || e[`${ms(t)}Modifiers`];
function $d(e, t, ...n) {
  if (e.isUnmounted) return;
  const s = e.vnode.props || nt;
  let r = n;
  const i = t.startsWith("update:"), o = i && Fd(s, t.slice(7));
  o && (o.trim && (r = n.map((f) => gt(f) ? f.trim() : f)), o.number && (r = n.map(ea)));
  let a, l = s[a = Co(t)] || // also try camelCase event handler (#2249)
  s[a = Co(fs(t))];
  !l && i && (l = s[a = Co(ms(t))]), l && xn(
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
function zu(e, t, n = !1) {
  const s = t.emitsCache, r = s.get(e);
  if (r !== void 0)
    return r;
  const i = e.emits;
  let o = {}, a = !1;
  if (!xe(e)) {
    const l = (u) => {
      const f = zu(u, t, !0);
      f && (a = !0, Ot(o, f));
    };
    !n && t.mixins.length && t.mixins.forEach(l), e.extends && l(e.extends), e.mixins && e.mixins.forEach(l);
  }
  return !i && !a ? (ct(e) && s.set(e, null), null) : (Se(i) ? i.forEach((l) => o[l] = null) : Ot(o, i), ct(e) && s.set(e, o), o);
}
function lo(e, t) {
  return !e || !Qi(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), Ve(e, t[0].toLowerCase() + t.slice(1)) || Ve(e, ms(t)) || Ve(e, t));
}
function zl(e) {
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
    renderCache: f,
    props: b,
    data: A,
    setupState: x,
    ctx: L,
    inheritAttrs: z
  } = e, ue = zi(e);
  let R, fe;
  try {
    if (n.shapeFlag & 4) {
      const C = r || s, M = C;
      R = An(
        u.call(
          M,
          C,
          f,
          b,
          x,
          A,
          L
        )
      ), fe = a;
    } else {
      const C = t;
      R = An(
        C.length > 1 ? C(
          b,
          { attrs: a, slots: o, emit: l }
        ) : C(
          b,
          null
        )
      ), fe = t.props ? a : Bd(a);
    }
  } catch (C) {
    $r.length = 0, ro(C, e, 1), R = Dt(ds);
  }
  let me = R;
  if (fe && z !== !1) {
    const C = Object.keys(fe), { shapeFlag: M } = me;
    C.length && M & 7 && (i && C.some(Ea) && (fe = Ud(
      fe,
      i
    )), me = or(me, fe, !1, !0));
  }
  return n.dirs && (me = or(me, null, !1, !0), me.dirs = me.dirs ? me.dirs.concat(n.dirs) : n.dirs), n.transition && Fa(me, n.transition), R = me, zi(ue), R;
}
const Bd = (e) => {
  let t;
  for (const n in e)
    (n === "class" || n === "style" || Qi(n)) && ((t || (t = {}))[n] = e[n]);
  return t;
}, Ud = (e, t) => {
  const n = {};
  for (const s in e)
    (!Ea(s) || !(s.slice(9) in t)) && (n[s] = e[s]);
  return n;
};
function zd(e, t, n) {
  const { props: s, children: r, component: i } = e, { props: o, children: a, patchFlag: l } = t, u = i.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (n && l >= 0) {
    if (l & 1024)
      return !0;
    if (l & 16)
      return s ? Hl(s, o, u) : !!o;
    if (l & 8) {
      const f = t.dynamicProps;
      for (let b = 0; b < f.length; b++) {
        const A = f[b];
        if (o[A] !== s[A] && !lo(u, A))
          return !0;
      }
    }
  } else
    return (r || a) && (!a || !a.$stable) ? !0 : s === o ? !1 : s ? o ? Hl(s, o, u) : !0 : !!o;
  return !1;
}
function Hl(e, t, n) {
  const s = Object.keys(t);
  if (s.length !== Object.keys(e).length)
    return !0;
  for (let r = 0; r < s.length; r++) {
    const i = s[r];
    if (t[i] !== e[i] && !lo(n, i))
      return !0;
  }
  return !1;
}
function Hd({ vnode: e, parent: t }, n) {
  for (; t; ) {
    const s = t.subTree;
    if (s.suspense && s.suspense.activeBranch === e && (s.el = e.el), s === e)
      (e = t.vnode).el = n, t = t.parent;
    else
      break;
  }
}
const Hu = (e) => e.__isSuspense;
function jd(e, t) {
  t && t.pendingBranch ? Se(e) ? t.effects.push(...e) : t.effects.push(e) : ed(e);
}
const Re = Symbol.for("v-fgt"), co = Symbol.for("v-txt"), ds = Symbol.for("v-cmt"), Ai = Symbol.for("v-stc"), $r = [];
let Qt = null;
function w(e = !1) {
  $r.push(Qt = e ? null : []);
}
function Wd() {
  $r.pop(), Qt = $r[$r.length - 1] || null;
}
let Wr = 1;
function jl(e, t = !1) {
  Wr += e, e < 0 && Qt && t && (Qt.hasOnce = !0);
}
function ju(e) {
  return e.dynamicChildren = Wr > 0 ? Qt || Js : null, Wd(), Wr > 0 && Qt && Qt.push(e), e;
}
function k(e, t, n, s, r, i) {
  return ju(
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
  return ju(
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
function Wu(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function yr(e, t) {
  return e.type === t.type && e.key === t.key;
}
const qu = ({ key: e }) => e ?? null, Si = ({
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
    key: t && qu(t),
    ref: t && Si(t),
    scopeId: ku,
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
  return a ? (Ua(l, n), i & 128 && e.normalize(l)) : n && (l.shapeFlag |= gt(n) ? 8 : 16), Wr > 0 && // avoid a block node from tracking itself
  !o && // has current parent block
  Qt && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (l.patchFlag > 0 || i & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  l.patchFlag !== 32 && Qt.push(l), l;
}
const Dt = qd;
function qd(e, t = null, n = null, s = 0, r = null, i = !1) {
  if ((!e || e === pd) && (e = ds), Wu(e)) {
    const a = or(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return n && Ua(a, n), Wr > 0 && !i && Qt && (a.shapeFlag & 6 ? Qt[Qt.indexOf(e)] = a : Qt.push(a)), a.patchFlag = -2, a;
  }
  if (np(e) && (e = e.__vccOpts), t) {
    t = Vd(t);
    let { class: a, style: l } = t;
    a && !gt(a) && (t.class = Le(a)), ct(l) && (Ma(l) && !Se(l) && (l = Ot({}, l)), t.style = Ee(l));
  }
  const o = gt(e) ? 1 : Hu(e) ? 128 : sd(e) ? 64 : ct(e) ? 4 : xe(e) ? 2 : 0;
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
function Vd(e) {
  return e ? Ma(e) || Ou(e) ? Ot({}, e) : e : null;
}
function or(e, t, n = !1, s = !1) {
  const { props: r, ref: i, patchFlag: o, children: a, transition: l } = e, u = t ? Kd(r || {}, t) : r, f = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: u,
    key: u && qu(u),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && i ? Se(i) ? i.concat(Si(t)) : [i, Si(t)] : Si(t)
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
  return l && s && Fa(
    f,
    l.clone(f)
  ), f;
}
function Nn(e = " ", t = 0) {
  return Dt(co, null, e, t);
}
function Mo(e, t) {
  const n = Dt(Ai, null, e);
  return n.staticCount = t, n;
}
function ee(e = "", t = !1) {
  return t ? (w(), Pn(ds, null, e)) : Dt(ds, null, e);
}
function An(e) {
  return e == null || typeof e == "boolean" ? Dt(ds) : Se(e) ? Dt(
    Re,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : Wu(e) ? os(e) : Dt(co, null, String(e));
}
function os(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : or(e);
}
function Ua(e, t) {
  let n = 0;
  const { shapeFlag: s } = e;
  if (t == null)
    t = null;
  else if (Se(t))
    n = 16;
  else if (typeof t == "object")
    if (s & 65) {
      const r = t.default;
      r && (r._c && (r._d = !1), Ua(e, r()), r._c && (r._d = !0));
      return;
    } else {
      n = 32;
      const r = t._;
      !r && !Ou(t) ? t._ctx = un : r === 3 && un && (un.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else xe(t) ? (t = { default: t, _ctx: un }, n = 32) : (t = String(t), s & 64 ? (n = 16, t = [Nn(t)]) : n = 8);
  e.children = t, e.shapeFlag |= n;
}
function Kd(...e) {
  const t = {};
  for (let n = 0; n < e.length; n++) {
    const s = e[n];
    for (const r in s)
      if (r === "class")
        t.class !== s.class && (t.class = Le([t.class, s.class]));
      else if (r === "style")
        t.style = Ee([t.style, s.style]);
      else if (Qi(r)) {
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
const Gd = Cu();
let Yd = 0;
function Xd(e, t, n) {
  const s = e.type, r = (t ? t.appContext : e.appContext) || Gd, i = {
    uid: Yd++,
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
    scope: new Th(
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
    propsOptions: Nu(s, r),
    emitsOptions: zu(s, r),
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
  return i.ctx = { _: i }, i.root = t ? t.root : i, i.emit = $d.bind(null, i), e.ce && e.ce(i), i;
}
let Ft = null;
const Zd = () => Ft || un;
let ji, ca;
{
  const e = no(), t = (n, s) => {
    let r;
    return (r = e[n]) || (r = e[n] = []), r.push(s), (i) => {
      r.length > 1 ? r.forEach((o) => o(i)) : r[0](i);
    };
  };
  ji = t(
    "__VUE_INSTANCE_SETTERS__",
    (n) => Ft = n
  ), ca = t(
    "__VUE_SSR_SETTERS__",
    (n) => qr = n
  );
}
const Yr = (e) => {
  const t = Ft;
  return ji(e), e.scope.on(), () => {
    e.scope.off(), ji(t);
  };
}, Wl = () => {
  Ft && Ft.scope.off(), ji(null);
};
function Vu(e) {
  return e.vnode.shapeFlag & 4;
}
let qr = !1;
function Jd(e, t = !1, n = !1) {
  t && ca(t);
  const { props: s, children: r } = e.vnode, i = Vu(e);
  Ad(e, s, i, t), Cd(e, r, n || t);
  const o = i ? Qd(e, t) : void 0;
  return t && ca(!1), o;
}
function Qd(e, t) {
  const n = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, md);
  const { setup: s } = n;
  if (s) {
    Un();
    const r = e.setupContext = s.length > 1 ? tp(e) : null, i = Yr(e), o = Kr(
      s,
      e,
      0,
      [
        e.props,
        r
      ]
    ), a = Gc(o);
    if (zn(), i(), (a || e.sp) && !Dr(e) && Tu(e), a) {
      if (o.then(Wl, Wl), t)
        return o.then((l) => {
          ql(e, l);
        }).catch((l) => {
          ro(l, e, 0);
        });
      e.asyncDep = o;
    } else
      ql(e, o);
  } else
    Ku(e);
}
function ql(e, t, n) {
  xe(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : ct(t) && (e.setupState = _u(t)), Ku(e);
}
function Ku(e, t, n) {
  const s = e.type;
  e.render || (e.render = s.render || Sn);
  {
    const r = Yr(e);
    Un();
    try {
      gd(e);
    } finally {
      zn(), r();
    }
  }
}
const ep = {
  get(e, t) {
    return Rt(e, "get", ""), e[t];
  }
};
function tp(e) {
  const t = (n) => {
    e.exposed = n || {};
  };
  return {
    attrs: new Proxy(e.attrs, ep),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function uo(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(_u(Wh(e.exposed)), {
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
function np(e) {
  return xe(e) && "__vccOpts" in e;
}
const oe = (e, t) => Yh(e, t, qr), sp = "3.5.18";
/**
* @vue/runtime-dom v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let ua;
const Vl = typeof window < "u" && window.trustedTypes;
if (Vl)
  try {
    ua = /* @__PURE__ */ Vl.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const Gu = ua ? (e) => ua.createHTML(e) : (e) => e, rp = "http://www.w3.org/2000/svg", ip = "http://www.w3.org/1998/Math/MathML", Mn = typeof document < "u" ? document : null, Kl = Mn && /* @__PURE__ */ Mn.createElement("template"), op = {
  insert: (e, t, n) => {
    t.insertBefore(e, n || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, n, s) => {
    const r = t === "svg" ? Mn.createElementNS(rp, e) : t === "mathml" ? Mn.createElementNS(ip, e) : n ? Mn.createElement(e, { is: n }) : Mn.createElement(e);
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
      Kl.innerHTML = Gu(
        s === "svg" ? `<svg>${e}</svg>` : s === "mathml" ? `<math>${e}</math>` : e
      );
      const a = Kl.content;
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
}, ap = Symbol("_vtc");
function lp(e, t, n) {
  const s = e[ap];
  s && (t = (t ? [t, ...s] : [...s]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
const Wi = Symbol("_vod"), Yu = Symbol("_vsh"), cp = {
  beforeMount(e, { value: t }, { transition: n }) {
    e[Wi] = e.style.display === "none" ? "" : e.style.display, n && t ? n.beforeEnter(e) : vr(e, t);
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
  e.style.display = t ? e[Wi] : "none", e[Yu] = !t;
}
const up = Symbol(""), fp = /(^|;)\s*display\s*:/;
function hp(e, t, n) {
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
      const o = s[up];
      o && (n += ";" + o), s.cssText = n, i = fp.test(n);
    }
  } else t && e.removeAttribute("style");
  Wi in e && (e[Wi] = i ? s.display : "", e[Yu] && (s.display = "none"));
}
const Gl = /\s*!important$/;
function Ei(e, t, n) {
  if (Se(n))
    n.forEach((s) => Ei(e, t, s));
  else if (n == null && (n = ""), t.startsWith("--"))
    e.setProperty(t, n);
  else {
    const s = dp(e, t);
    Gl.test(n) ? e.setProperty(
      ms(s),
      n.replace(Gl, ""),
      "important"
    ) : e[s] = n;
  }
}
const Yl = ["Webkit", "Moz", "ms"], Do = {};
function dp(e, t) {
  const n = Do[t];
  if (n)
    return n;
  let s = fs(t);
  if (s !== "filter" && s in e)
    return Do[t] = s;
  s = Zc(s);
  for (let r = 0; r < Yl.length; r++) {
    const i = Yl[r] + s;
    if (i in e)
      return Do[t] = i;
  }
  return t;
}
const Xl = "http://www.w3.org/1999/xlink";
function Zl(e, t, n, s, r, i = kh(t)) {
  s && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(Xl, t.slice(6, t.length)) : e.setAttributeNS(Xl, t, n) : n == null || i && !Jc(n) ? e.removeAttribute(t) : e.setAttribute(
    t,
    i ? "" : ps(n) ? String(n) : n
  );
}
function Jl(e, t, n, s, r) {
  if (t === "innerHTML" || t === "textContent") {
    n != null && (e[t] = t === "innerHTML" ? Gu(n) : n);
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
    a === "boolean" ? n = Jc(n) : n == null && a === "string" ? (n = "", o = !0) : a === "number" && (n = 0, o = !0);
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
function pp(e, t, n, s) {
  e.removeEventListener(t, n, s);
}
const Ql = Symbol("_vei");
function mp(e, t, n, s, r = null) {
  const i = e[Ql] || (e[Ql] = {}), o = i[t];
  if (s && o)
    o.value = s;
  else {
    const [a, l] = gp(t);
    if (s) {
      const u = i[t] = vp(
        s,
        r
      );
      Xs(e, a, u, l);
    } else o && (pp(e, a, o, l), i[t] = void 0);
  }
}
const ec = /(?:Once|Passive|Capture)$/;
function gp(e) {
  let t;
  if (ec.test(e)) {
    t = {};
    let s;
    for (; s = e.match(ec); )
      e = e.slice(0, e.length - s[0].length), t[s[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : ms(e.slice(2)), t];
}
let Fo = 0;
const _p = /* @__PURE__ */ Promise.resolve(), yp = () => Fo || (_p.then(() => Fo = 0), Fo = Date.now());
function vp(e, t) {
  const n = (s) => {
    if (!s._vts)
      s._vts = Date.now();
    else if (s._vts <= n.attached)
      return;
    xn(
      bp(s, n.value),
      t,
      5,
      [s]
    );
  };
  return n.value = e, n.attached = yp(), n;
}
function bp(e, t) {
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
const tc = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, wp = (e, t, n, s, r, i) => {
  const o = r === "svg";
  t === "class" ? lp(e, s, o) : t === "style" ? hp(e, n, s) : Qi(t) ? Ea(t) || mp(e, t, n, s, i) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : kp(e, t, s, o)) ? (Jl(e, t, s), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && Zl(e, t, s, o, i, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !gt(s)) ? Jl(e, fs(t), s, i, t) : (t === "true-value" ? e._trueValue = s : t === "false-value" && (e._falseValue = s), Zl(e, t, s, o));
};
function kp(e, t, n, s) {
  if (s)
    return !!(t === "innerHTML" || t === "textContent" || t in e && tc(t) && xe(n));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const r = e.tagName;
    if (r === "IMG" || r === "VIDEO" || r === "CANVAS" || r === "SOURCE")
      return !1;
  }
  return tc(t) && gt(n) ? !1 : t in e;
}
const nc = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return Se(t) ? (n) => ki(t, n) : t;
};
function Tp(e) {
  e.target.composing = !0;
}
function sc(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const $o = Symbol("_assign"), xs = {
  created(e, { modifiers: { lazy: t, trim: n, number: s } }, r) {
    e[$o] = nc(r);
    const i = s || r.props && r.props.type === "number";
    Xs(e, t ? "change" : "input", (o) => {
      if (o.target.composing) return;
      let a = e.value;
      n && (a = a.trim()), i && (a = ea(a)), e[$o](a);
    }), n && Xs(e, "change", () => {
      e.value = e.value.trim();
    }), t || (Xs(e, "compositionstart", Tp), Xs(e, "compositionend", sc), Xs(e, "change", sc));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t }) {
    e.value = t ?? "";
  },
  beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: s, trim: r, number: i } }, o) {
    if (e[$o] = nc(o), e.composing) return;
    const a = (i || e.type === "number") && !/^0\d/.test(e.value) ? ea(e.value) : e.value, l = t ?? "";
    a !== l && (document.activeElement === e && e.type !== "range" && (s && t === n || r && e.value.trim() === l) || (e.value = l));
  }
}, Ap = ["ctrl", "shift", "alt", "meta"], Sp = {
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
  exact: (e, t) => Ap.some((n) => e[`${n}Key`] && !t.includes(n))
}, Is = (e, t) => {
  const n = e._withMods || (e._withMods = {}), s = t.join(".");
  return n[s] || (n[s] = (r, ...i) => {
    for (let o = 0; o < t.length; o++) {
      const a = Sp[t[o]];
      if (a && a(r, t)) return;
    }
    return e(r, ...i);
  });
}, Ep = {
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
      (o) => o === i || Ep[o] === i
    ))
      return e(r);
  });
}, xp = /* @__PURE__ */ Ot({ patchProp: wp }, op);
let rc;
function Cp() {
  return rc || (rc = Id(xp));
}
const Rp = (...e) => {
  const t = Cp().createApp(...e), { mount: n } = t;
  return t.mount = (s) => {
    const r = Op(s);
    if (!r) return;
    const i = t._component;
    !xe(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
    const o = n(r, !1, Ip(r));
    return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), o;
  }, t;
};
function Ip(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function Op(e) {
  return gt(e) ? document.querySelector(e) : e;
}
const Xu = /* @__PURE__ */ new Set(["customer_required", "token_invalid"]), fa = (e) => !!e && Xu.has(e), sr = (e) => {
  const t = e.replace("#", ""), n = parseInt(t.substr(0, 2), 16), s = parseInt(t.substr(2, 2), 16), r = parseInt(t.substr(4, 2), 16);
  return (n * 299 + s * 587 + r * 114) / 1e3 < 128;
}, Lp = (e, t) => {
  const n = e.replace("#", ""), s = parseInt(n.substr(0, 2), 16), r = parseInt(n.substr(2, 2), 16), i = parseInt(n.substr(4, 2), 16), o = sr(e), a = o ? Math.min(255, s + t) : Math.max(0, s - t), l = o ? Math.min(255, r + t) : Math.max(0, r - t), u = o ? Math.min(255, i + t) : Math.max(0, i - t);
  return `#${a.toString(16).padStart(2, "0")}${l.toString(16).padStart(2, "0")}${u.toString(16).padStart(2, "0")}`;
}, br = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e), Np = (e) => {
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
function za() {
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
var Fs = za();
function Zu(e) {
  Fs = e;
}
var Br = { exec: () => null };
function Ke(e, t = "") {
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
}, Pp = /^(?:[ \t]*(?:\n|$))+/, Mp = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/, Dp = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, Xr = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, Fp = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, Ha = /(?:[*+-]|\d{1,9}[.)])/, Ju = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/, Qu = Ke(Ju).replace(/bull/g, Ha).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(), $p = Ke(Ju).replace(/bull/g, Ha).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(), ja = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/, Bp = /^[^\n]+/, Wa = /(?!\s*\])(?:\\.|[^\[\]\\])+/, Up = Ke(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", Wa).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), zp = Ke(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, Ha).getRegex(), fo = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", qa = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, Hp = Ke(
  "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))",
  "i"
).replace("comment", qa).replace("tag", fo).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), ef = Ke(ja).replace("hr", Xr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", fo).getRegex(), jp = Ke(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", ef).getRegex(), Va = {
  blockquote: jp,
  code: Mp,
  def: Up,
  fences: Dp,
  heading: Fp,
  hr: Xr,
  html: Hp,
  lheading: Qu,
  list: zp,
  newline: Pp,
  paragraph: ef,
  table: Br,
  text: Bp
}, ic = Ke(
  "^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"
).replace("hr", Xr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", fo).getRegex(), Wp = {
  ...Va,
  lheading: $p,
  table: ic,
  paragraph: Ke(ja).replace("hr", Xr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", ic).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", fo).getRegex()
}, qp = {
  ...Va,
  html: Ke(
    `^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`
  ).replace("comment", qa).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
  heading: /^(#{1,6})(.*)(?:\n+|$)/,
  fences: Br,
  // fences not supported
  lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  paragraph: Ke(ja).replace("hr", Xr).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", Qu).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
}, Vp = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, Kp = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, tf = /^( {2,}|\\)\n(?!\s*$)/, Gp = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, ho = /[\p{P}\p{S}]/u, Ka = /[\s\p{P}\p{S}]/u, nf = /[^\s\p{P}\p{S}]/u, Yp = Ke(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, Ka).getRegex(), sf = /(?!~)[\p{P}\p{S}]/u, Xp = /(?!~)[\s\p{P}\p{S}]/u, Zp = /(?:[^\s\p{P}\p{S}]|~)/u, Jp = /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g, rf = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/, Qp = Ke(rf, "u").replace(/punct/g, ho).getRegex(), em = Ke(rf, "u").replace(/punct/g, sf).getRegex(), of = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", tm = Ke(of, "gu").replace(/notPunctSpace/g, nf).replace(/punctSpace/g, Ka).replace(/punct/g, ho).getRegex(), nm = Ke(of, "gu").replace(/notPunctSpace/g, Zp).replace(/punctSpace/g, Xp).replace(/punct/g, sf).getRegex(), sm = Ke(
  "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)",
  "gu"
).replace(/notPunctSpace/g, nf).replace(/punctSpace/g, Ka).replace(/punct/g, ho).getRegex(), rm = Ke(/\\(punct)/, "gu").replace(/punct/g, ho).getRegex(), im = Ke(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), om = Ke(qa).replace("(?:-->|$)", "-->").getRegex(), am = Ke(
  "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>"
).replace("comment", om).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), qi = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/, lm = Ke(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", qi).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), af = Ke(/^!?\[(label)\]\[(ref)\]/).replace("label", qi).replace("ref", Wa).getRegex(), lf = Ke(/^!?\[(ref)\](?:\[\])?/).replace("ref", Wa).getRegex(), cm = Ke("reflink|nolink(?!\\()", "g").replace("reflink", af).replace("nolink", lf).getRegex(), Ga = {
  _backpedal: Br,
  // only used for GFM url
  anyPunctuation: rm,
  autolink: im,
  blockSkip: Jp,
  br: tf,
  code: Kp,
  del: Br,
  emStrongLDelim: Qp,
  emStrongRDelimAst: tm,
  emStrongRDelimUnd: sm,
  escape: Vp,
  link: lm,
  nolink: lf,
  punctuation: Yp,
  reflink: af,
  reflinkSearch: cm,
  tag: am,
  text: Gp,
  url: Br
}, um = {
  ...Ga,
  link: Ke(/^!?\[(label)\]\((.*?)\)/).replace("label", qi).getRegex(),
  reflink: Ke(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", qi).getRegex()
}, ha = {
  ...Ga,
  emStrongRDelimAst: nm,
  emStrongLDelim: em,
  url: Ke(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, "i").replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
  _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
}, fm = {
  ...ha,
  br: Ke(tf).replace("{2,}", "*").getRegex(),
  text: Ke(ha.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
}, _i = {
  normal: Va,
  gfm: Wp,
  pedantic: qp
}, wr = {
  normal: Ga,
  gfm: ha,
  breaks: fm,
  pedantic: um
}, hm = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}, oc = (e) => hm[e];
function kn(e, t) {
  if (t) {
    if ($t.escapeTest.test(e))
      return e.replace($t.escapeReplace, oc);
  } else if ($t.escapeTestNoEncode.test(e))
    return e.replace($t.escapeReplaceNoEncode, oc);
  return e;
}
function ac(e) {
  try {
    e = encodeURI(e).replace($t.percentDecode, "%");
  } catch {
    return null;
  }
  return e;
}
function lc(e, t) {
  var i;
  const n = e.replace($t.findPipe, (o, a, l) => {
    let u = !1, f = a;
    for (; --f >= 0 && l[f] === "\\"; ) u = !u;
    return u ? "|" : " |";
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
function kr(e, t, n) {
  const s = e.length;
  if (s === 0)
    return "";
  let r = 0;
  for (; r < s && e.charAt(s - r - 1) === t; )
    r++;
  return e.slice(0, s - r);
}
function dm(e, t) {
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
function cc(e, t, n, s, r) {
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
function pm(e, t, n) {
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
var Vi = class {
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
      const n = t[0], s = pm(n, t[3] || "", this.rules);
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
`), f = u.replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
        s = s ? `${s}
${u}` : u, r = r ? `${r}
${f}` : f;
        const b = this.lexer.state.top;
        if (this.lexer.state.top = !0, this.lexer.blockTokens(f, i, !0), this.lexer.state.top = b, n.length === 0)
          break;
        const A = i.at(-1);
        if ((A == null ? void 0 : A.type) === "code")
          break;
        if ((A == null ? void 0 : A.type) === "blockquote") {
          const x = A, L = x.raw + `
` + n.join(`
`), z = this.blockquote(L);
          i[i.length - 1] = z, s = s.substring(0, s.length - x.raw.length) + z.raw, r = r.substring(0, r.length - x.text.length) + z.text;
          break;
        } else if ((A == null ? void 0 : A.type) === "list") {
          const x = A, L = x.raw + `
` + n.join(`
`), z = this.list(L);
          i[i.length - 1] = z, s = s.substring(0, s.length - A.raw.length) + z.raw, r = r.substring(0, r.length - x.raw.length) + z.raw, n = L.substring(i.at(-1).raw.length).split(`
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
        let l = !1, u = "", f = "";
        if (!(t = i.exec(e)) || this.rules.block.hr.test(e))
          break;
        u = t[0], e = e.substring(u.length);
        let b = t[2].split(`
`, 1)[0].replace(this.rules.other.listReplaceTabs, (R) => " ".repeat(3 * R.length)), A = e.split(`
`, 1)[0], x = !b.trim(), L = 0;
        if (this.options.pedantic ? (L = 2, f = b.trimStart()) : x ? L = t[1].length + 1 : (L = t[2].search(this.rules.other.nonSpaceChar), L = L > 4 ? 1 : L, f = b.slice(L), L += t[1].length), x && this.rules.other.blankLine.test(A) && (u += A + `
`, e = e.substring(A.length + 1), l = !0), !l) {
          const R = this.rules.other.nextBulletRegex(L), fe = this.rules.other.hrRegex(L), me = this.rules.other.fencesBeginRegex(L), C = this.rules.other.headingBeginRegex(L), M = this.rules.other.htmlBeginRegex(L);
          for (; e; ) {
            const S = e.split(`
`, 1)[0];
            let j;
            if (A = S, this.options.pedantic ? (A = A.replace(this.rules.other.listReplaceNesting, "  "), j = A) : j = A.replace(this.rules.other.tabCharGlobal, "    "), me.test(A) || C.test(A) || M.test(A) || R.test(A) || fe.test(A))
              break;
            if (j.search(this.rules.other.nonSpaceChar) >= L || !A.trim())
              f += `
` + j.slice(L);
            else {
              if (x || b.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || me.test(b) || C.test(b) || fe.test(b))
                break;
              f += `
` + A;
            }
            !x && !A.trim() && (x = !0), u += S + `
`, e = e.substring(S.length + 1), b = j.slice(L);
          }
        }
        r.loose || (o ? r.loose = !0 : this.rules.other.doubleBlankLine.test(u) && (o = !0));
        let z = null, ue;
        this.options.gfm && (z = this.rules.other.listIsTask.exec(f), z && (ue = z[0] !== "[ ] ", f = f.replace(this.rules.other.listReplaceTask, ""))), r.items.push({
          type: "list_item",
          raw: u,
          task: !!z,
          checked: ue,
          loose: !1,
          text: f,
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
          const u = r.items[l].tokens.filter((b) => b.type === "space"), f = u.length > 0 && u.some((b) => this.rules.other.anyLine.test(b.raw));
          r.loose = f;
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
    const n = lc(t[1]), s = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), r = (o = t[3]) != null && o.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
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
        i.rows.push(lc(a, i.header.length).map((l, u) => ({
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
        const i = dm(t[2], "()");
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
      return s = s.trim(), this.rules.other.startAngleBracket.test(s) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n) ? s = s.slice(1) : s = s.slice(1, -1)), cc(t, {
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
      return cc(n, r, n[0], this.lexer, this.rules);
    }
  }
  emStrong(e, t, n = "") {
    let s = this.rules.inline.emStrongLDelim.exec(e);
    if (!s || s[3] && n.match(this.rules.other.unicodeAlphaNumeric)) return;
    if (!(s[1] || s[2] || "") || !n || this.rules.inline.punctuation.exec(n)) {
      const i = [...s[0]].length - 1;
      let o, a, l = i, u = 0;
      const f = s[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      for (f.lastIndex = 0, t = t.slice(-1 * e.length + i); (s = f.exec(t)) != null; ) {
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
        const b = [...s[0]][0].length, A = e.slice(0, i + s.index + b + a);
        if (Math.min(i, a) % 2) {
          const L = A.slice(1, -1);
          return {
            type: "em",
            raw: A,
            text: L,
            tokens: this.lexer.inlineTokens(L)
          };
        }
        const x = A.slice(2, -2);
        return {
          type: "strong",
          raw: A,
          text: x,
          tokens: this.lexer.inlineTokens(x)
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
    this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = t || Fs, this.options.tokenizer = this.options.tokenizer || new Vi(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = {
      inLink: !1,
      inRawBlock: !1,
      top: !0
    };
    const n = {
      other: $t,
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
        const f = t.slice(1);
        let b;
        this.options.extensions.startBlock.forEach((A) => {
          b = A.call({ lexer: this }, f), typeof b == "number" && b >= 0 && (u = Math.min(u, b));
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
      const f = Object.keys(this.tokens.links);
      if (f.length > 0)
        for (; (r = this.tokenizer.rules.inline.reflinkSearch.exec(s)) != null; )
          f.includes(r[0].slice(r[0].lastIndexOf("[") + 1, -1)) && (s = s.slice(0, r.index) + "[" + "a".repeat(r[0].length - 2) + "]" + s.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex));
    }
    for (; (r = this.tokenizer.rules.inline.anyPunctuation.exec(s)) != null; )
      s = s.slice(0, r.index) + "++" + s.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);
    for (; (r = this.tokenizer.rules.inline.blockSkip.exec(s)) != null; )
      s = s.slice(0, r.index) + "[" + "a".repeat(r[0].length - 2) + "]" + s.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
    let i = !1, o = "";
    for (; t; ) {
      i || (o = ""), i = !1;
      let f;
      if ((l = (a = this.options.extensions) == null ? void 0 : a.inline) != null && l.some((A) => (f = A.call({ lexer: this }, t, n)) ? (t = t.substring(f.raw.length), n.push(f), !0) : !1))
        continue;
      if (f = this.tokenizer.escape(t)) {
        t = t.substring(f.raw.length), n.push(f);
        continue;
      }
      if (f = this.tokenizer.tag(t)) {
        t = t.substring(f.raw.length), n.push(f);
        continue;
      }
      if (f = this.tokenizer.link(t)) {
        t = t.substring(f.raw.length), n.push(f);
        continue;
      }
      if (f = this.tokenizer.reflink(t, this.tokens.links)) {
        t = t.substring(f.raw.length);
        const A = n.at(-1);
        f.type === "text" && (A == null ? void 0 : A.type) === "text" ? (A.raw += f.raw, A.text += f.text) : n.push(f);
        continue;
      }
      if (f = this.tokenizer.emStrong(t, s, o)) {
        t = t.substring(f.raw.length), n.push(f);
        continue;
      }
      if (f = this.tokenizer.codespan(t)) {
        t = t.substring(f.raw.length), n.push(f);
        continue;
      }
      if (f = this.tokenizer.br(t)) {
        t = t.substring(f.raw.length), n.push(f);
        continue;
      }
      if (f = this.tokenizer.del(t)) {
        t = t.substring(f.raw.length), n.push(f);
        continue;
      }
      if (f = this.tokenizer.autolink(t)) {
        t = t.substring(f.raw.length), n.push(f);
        continue;
      }
      if (!this.state.inLink && (f = this.tokenizer.url(t))) {
        t = t.substring(f.raw.length), n.push(f);
        continue;
      }
      let b = t;
      if ((u = this.options.extensions) != null && u.startInline) {
        let A = 1 / 0;
        const x = t.slice(1);
        let L;
        this.options.extensions.startInline.forEach((z) => {
          L = z.call({ lexer: this }, x), typeof L == "number" && L >= 0 && (A = Math.min(A, L));
        }), A < 1 / 0 && A >= 0 && (b = t.substring(0, A + 1));
      }
      if (f = this.tokenizer.inlineText(b)) {
        t = t.substring(f.raw.length), f.raw.slice(-1) !== "_" && (o = f.raw.slice(-1)), i = !0;
        const A = n.at(-1);
        (A == null ? void 0 : A.type) === "text" ? (A.raw += f.raw, A.text += f.text) : n.push(f);
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
}, Ki = class {
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
    const s = this.parser.parseInline(n), r = ac(e);
    if (r === null)
      return s;
    e = r;
    let i = '<a href="' + e + '"';
    return t && (i += ' title="' + kn(t) + '"'), i += ">" + s + "</a>", i;
  }
  image({ href: e, title: t, text: n, tokens: s }) {
    s && (n = this.parser.parseInline(s, this.parser.textRenderer));
    const r = ac(e);
    if (r === null)
      return kn(n);
    e = r;
    let i = `<img src="${e}" alt="${n}"`;
    return t && (i += ` title="${kn(t)}"`), i += ">", i;
  }
  text(e) {
    return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : kn(e.text);
  }
}, Ya = class {
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
    this.options = t || Fs, this.options.renderer = this.options.renderer || new Ki(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new Ya();
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
        const u = a, f = this.options.extensions.renderers[u.type].call({ parser: this }, u);
        if (f !== !1 || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "paragraph", "text"].includes(u.type)) {
          s += f || "";
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
          let u = l, f = this.renderer.text(u);
          for (; o + 1 < t.length && t[o + 1].type === "text"; )
            u = t[++o], f += `
` + this.renderer.text(u);
          n ? s += this.renderer.paragraph({
            type: "paragraph",
            raw: f,
            text: f,
            tokens: [{ type: "text", raw: f, text: f, escaped: !0 }]
          }) : s += f;
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
])), Jo), mm = class {
  constructor(...e) {
    tt(this, "defaults", za());
    tt(this, "options", this.setOptions);
    tt(this, "parse", this.parseMarkdown(!0));
    tt(this, "parseInline", this.parseMarkdown(!1));
    tt(this, "Parser", Bn);
    tt(this, "Renderer", Ki);
    tt(this, "TextRenderer", Ya);
    tt(this, "Lexer", $n);
    tt(this, "Tokenizer", Vi);
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
        const r = this.defaults.renderer || new Ki(this.defaults);
        for (const i in n.renderer) {
          if (!(i in r))
            throw new Error(`renderer '${i}' does not exist`);
          if (["options", "parser"].includes(i))
            continue;
          const o = i, a = n.renderer[o], l = r[o];
          r[o] = (...u) => {
            let f = a.apply(r, u);
            return f === !1 && (f = l.apply(r, u)), f || "";
          };
        }
        s.renderer = r;
      }
      if (n.tokenizer) {
        const r = this.defaults.tokenizer || new Vi(this.defaults);
        for (const i in n.tokenizer) {
          if (!(i in r))
            throw new Error(`tokenizer '${i}' does not exist`);
          if (["options", "rules", "lexer"].includes(i))
            continue;
          const o = i, a = n.tokenizer[o], l = r[o];
          r[o] = (...u) => {
            let f = a.apply(r, u);
            return f === !1 && (f = l.apply(r, u)), f;
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
              return Promise.resolve(a.call(r, u)).then((b) => l.call(r, b));
            const f = a.call(r, u);
            return l.call(r, f);
          } : r[o] = (...u) => {
            let f = a.apply(r, u);
            return f === !1 && (f = l.apply(r, u)), f;
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
        let f = l(u, i);
        return i.hooks && (f = i.hooks.postprocess(f)), f;
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
}, Ms = new mm();
function je(e, t) {
  return Ms.parse(e, t);
}
je.options = je.setOptions = function(e) {
  return Ms.setOptions(e), je.defaults = Ms.defaults, Zu(je.defaults), je;
};
je.getDefaults = za;
je.defaults = Fs;
je.use = function(...e) {
  return Ms.use(...e), je.defaults = Ms.defaults, Zu(je.defaults), je;
};
je.walkTokens = function(e, t) {
  return Ms.walkTokens(e, t);
};
je.parseInline = Ms.parseInline;
je.Parser = Bn;
je.parser = Bn.parse;
je.Renderer = Ki;
je.TextRenderer = Ya;
je.Lexer = $n;
je.lexer = $n.lex;
je.Tokenizer = Vi;
je.Hooks = Ci;
je.parse = je;
je.options;
je.setOptions;
je.use;
je.walkTokens;
je.parseInline;
Bn.parse;
$n.lex;
/*! @license DOMPurify 3.4.15 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.15/LICENSE */
function uc(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function gm(e) {
  if (Array.isArray(e)) return e;
}
function _m(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var s, r, i, o, a = [], l = !0, u = !1;
    try {
      if (i = (n = n.call(e)).next, t !== 0) for (; !(l = (s = i.call(n)).done) && (a.push(s.value), a.length !== t); l = !0) ;
    } catch (f) {
      u = !0, r = f;
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
function ym() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function vm(e, t) {
  return gm(e) || _m(e, t) || bm(e, t) || ym();
}
function bm(e, t) {
  if (e) {
    if (typeof e == "string") return uc(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? uc(e, t) : void 0;
  }
}
const cf = Object.entries, fc = Object.setPrototypeOf, wm = Object.isFrozen, km = Object.getPrototypeOf, Tm = Object.getOwnPropertyDescriptor;
let wt = Object.freeze, Tt = Object.seal, Zs = Object.create, uf = typeof Reflect < "u" && Reflect, ma = uf.apply, ga = uf.construct;
wt || (wt = function(t) {
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
const Os = _t(Array.prototype.forEach), Am = _t(Array.prototype.lastIndexOf), hc = _t(Array.prototype.pop), Tr = _t(Array.prototype.push), Sm = _t(Array.prototype.splice), rr = Array.isArray, Rr = _t(String.prototype.toLowerCase), Bo = _t(String.prototype.toString), dc = _t(String.prototype.match), Ar = _t(String.prototype.replace), pc = _t(String.prototype.indexOf), Em = _t(String.prototype.trim), xm = _t(Number.prototype.toString), Cm = _t(Boolean.prototype.toString), mc = typeof BigInt > "u" ? null : _t(BigInt.prototype.toString), gc = typeof Symbol > "u" ? null : _t(Symbol.prototype.toString), Ht = _t(Object.prototype.hasOwnProperty), Sr = _t(Object.prototype.toString), Ct = _t(RegExp.prototype.test), Cs = Rm(TypeError);
function _t(e) {
  return function(t) {
    t instanceof RegExp && (t.lastIndex = 0);
    for (var n = arguments.length, s = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
      s[r - 1] = arguments[r];
    return ma(e, t, s);
  };
}
function Rm(e) {
  return function() {
    for (var t = arguments.length, n = new Array(t), s = 0; s < t; s++)
      n[s] = arguments[s];
    return ga(e, n);
  };
}
function $e(e, t) {
  let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : Rr;
  if (fc && fc(e, null), !rr(t))
    return e;
  let s = t.length;
  for (; s--; ) {
    let r = t[s];
    if (typeof r == "string") {
      const i = n(r);
      i !== r && (wm(t) || (t[s] = i), r = i);
    }
    e[r] = !0;
  }
  return e;
}
function Im(e) {
  for (let t = 0; t < e.length; t++)
    Ht(e, t) || (e[t] = null);
  return e;
}
function Jt(e) {
  const t = Zs(null);
  for (const s of cf(e)) {
    var n = vm(s, 2);
    const r = n[0], i = n[1];
    Ht(e, r) && (rr(i) ? t[r] = Im(i) : i && typeof i == "object" && i.constructor === Object ? t[r] = Jt(i) : t[r] = i);
  }
  return t;
}
function Om(e) {
  switch (typeof e) {
    case "string":
      return e;
    case "number":
      return xm(e);
    case "boolean":
      return Cm(e);
    case "bigint":
      return mc ? mc(e) : "0";
    case "symbol":
      return gc ? gc(e) : "Symbol()";
    case "undefined":
      return Sr(e);
    case "function":
    case "object": {
      if (e === null)
        return Sr(e);
      const t = e, n = an(t, "toString");
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
function an(e, t) {
  for (; e !== null; ) {
    const s = Tm(e, t);
    if (s) {
      if (s.get)
        return _t(s.get);
      if (typeof s.value == "function")
        return _t(s.value);
    }
    e = km(e);
  }
  function n() {
    return null;
  }
  return n;
}
function Lm(e) {
  try {
    return Ct(e, ""), !0;
  } catch {
    return !1;
  }
}
const _c = wt(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]), Uo = wt(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "enterkeyhint", "exportparts", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "inputmode", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "part", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]), zo = wt(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]), Nm = wt(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]), Ho = wt(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]), Pm = wt(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]), yc = wt(["#text"]), vc = wt(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "command", "commandfor", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "exportparts", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inert", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "part", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "slot", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns"]), jo = wt(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dominant-baseline", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "mask-type", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "pointer-events", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-orientation", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "vector-effect", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]), bc = wt(["accent", "accentunder", "align", "bevelled", "close", "columnalign", "columnlines", "columnspacing", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lquote", "lspace", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]), yi = wt(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]), Mm = Tt(/{{[\w\W]*|^[\w\W]*}}/g), Dm = Tt(/<%[\w\W]*|^[\w\W]*%>/g), Fm = Tt(/\${[\w\W]*/g), $m = Tt(/^data-[\-\w.\u00B7-\uFFFF]+$/), Bm = Tt(/^aria-[\-\w]+$/), wc = Tt(
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  // eslint-disable-line no-useless-escape
), Um = Tt(/^(?:\w+script|data):/i), zm = Tt(
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g
  // eslint-disable-line no-control-regex
), Hm = Tt(/^html$/i), jm = Tt(/^[a-z][.\w]*(-[.\w]+)+$/i), kc = Tt(/<[/\w!]/g), Tc = Tt(/<[/\w]/g), Wm = Tt(/<\/no(script|embed|frames)/i), qm = Tt(/\/>/i), Xt = {
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
}, ff = ["style", "script", "xmp", "iframe", "noembed", "noframes", "plaintext", "noscript"], Vm = wt($e({}, ff)), Km = function() {
  const e = {};
  return Os(ff, (t) => {
    e[t] = Tt(new RegExp("</" + t + "(?=[\\t\\n\\f\\r />])", "i"));
  }), wt(e);
}(), Gm = function() {
  return typeof window > "u" ? null : window;
}, Ym = function(t, n) {
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
}, Ac = function() {
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
  return Ht(t, n) && rr(t[n]) ? $e(r.base ? Jt(r.base) : {}, t[n], r.transform) : s;
}, Wo = function(t, n, s) {
  const r = Ht(t, n) ? t[n] : void 0;
  return r && typeof r == "object" ? Jt(r) : s();
};
function hf() {
  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : Gm();
  const t = (K) => hf(K);
  if (t.version = "3.4.15", t.removed = [], !e || !e.document || e.document.nodeType !== Xt.document || !e.Element)
    return t.isSupported = !1, t;
  let n = e.document;
  const s = n, r = s.currentScript;
  e.DocumentFragment;
  const i = e.HTMLTemplateElement, o = e.Node, a = e.Element, l = e.NodeFilter, u = e.NamedNodeMap;
  u === void 0 && (e.NamedNodeMap || e.MozNamedAttrMap), e.HTMLFormElement;
  const f = e.DOMParser, b = e.trustedTypes, A = a.prototype, x = an(A, "cloneNode"), L = an(A, "remove"), z = an(A, "removeAttributeNode"), ue = an(A, "nextSibling"), R = an(A, "childNodes"), fe = an(A, "parentNode"), me = an(A, "shadowRoot"), C = an(A, "attributes"), M = o && o.prototype ? an(o.prototype, "nodeType") : null, S = o && o.prototype ? an(o.prototype, "nodeName") : null, j = o && o.prototype ? an(o.prototype, "ownerDocument") : null, ne = function(d) {
    return M ? M(d) : d.nodeType;
  }, ce = function(d) {
    return S ? S(d) : d.nodeName;
  };
  if (typeof i == "function") {
    const K = n.createElement("template");
    K.content && K.content.ownerDocument && (n = K.content.ownerDocument);
  }
  let ge, Oe = "", ke, Ge = !1, ze = 0;
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
    return Ge || (ke = Ym(b, r), Ge = !0), ke;
  }, Qe = n, Ye = Qe.implementation, ot = Qe.createNodeIterator, We = Qe.createDocumentFragment, jt = Qe.getElementsByTagName, en = s.importNode;
  let Fe = Ac();
  t.isSupported = typeof cf == "function" && typeof fe == "function" && Ye && Ye.createHTMLDocument !== void 0;
  const yt = Mm, Bt = Dm, Wt = Fm, qt = $m, Lt = Bm, yn = Um, y = zm, v = jm;
  let N = wc, D = null;
  const U = $e({}, [..._c, ...Uo, ...zo, ...Ho, ...yc]);
  let P = null;
  const Y = $e({}, [...vc, ...jo, ...bc, ...yi]);
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
  let Z = !0, J = !0, de = !1, pe = !0, be = !1, Te = !0, Me = !1, Ie = !1, W = null, c = null, _ = !1, O = !1, I = !1, $ = !1, re = !0, te = !1;
  const Ae = "user-content-";
  let Ce = !0, He = !1, De = {}, Be = null;
  const rt = $e({}, [
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
  const $s = $e({}, ["audio", "video", "img", "source", "image", "track"]);
  let qn = null;
  const Zr = $e({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), Ut = "http://www.w3.org/1998/Math/MathML", Nt = "http://www.w3.org/2000/svg", Vt = "http://www.w3.org/1999/xhtml";
  let At = Vt, Vn = !1, Kn = null;
  const gs = $e({}, [Ut, Nt, Vt], Bo), Jr = wt(["mi", "mo", "mn", "ms", "mtext"]);
  let Rn = $e({}, Jr);
  const dn = wt(["annotation-xml"]);
  let Kt = $e({}, dn);
  const Qr = $e({}, ["title", "style", "font", "a", "script"]);
  let ft = null;
  const go = ["application/xhtml+xml", "text/html"], ei = "text/html";
  let Ue = null, Gn = null;
  const _s = n.createElement("form"), Bs = function(d) {
    return d instanceof RegExp || d instanceof Function;
  }, lr = function() {
    let d = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (Gn && Gn === d)
      return;
    (!d || typeof d != "object") && (d = {}), d = Jt(d), ft = // eslint-disable-next-line unicorn/prefer-includes
    go.indexOf(d.PARSER_MEDIA_TYPE) === -1 ? ei : d.PARSER_MEDIA_TYPE, Ue = ft === "application/xhtml+xml" ? Bo : Rr, D = rs(d, "ALLOWED_TAGS", U, {
      transform: Ue
    }), P = rs(d, "ALLOWED_ATTR", Y, {
      transform: Ue
    }), Kn = rs(d, "ALLOWED_NAMESPACES", gs, {
      transform: Bo
    }), qn = rs(d, "ADD_URI_SAFE_ATTR", Zr, {
      transform: Ue,
      base: Zr
    }), hn = rs(d, "ADD_DATA_URI_TAGS", $s, {
      transform: Ue,
      base: $s
    }), Be = rs(d, "FORBID_CONTENTS", rt, {
      transform: Ue
    }), V = rs(d, "FORBID_TAGS", Jt({}), {
      transform: Ue
    }), H = rs(d, "FORBID_ATTR", Jt({}), {
      transform: Ue
    }), De = Ht(d, "USE_PROFILES") ? d.USE_PROFILES && typeof d.USE_PROFILES == "object" ? Jt(d.USE_PROFILES) : d.USE_PROFILES : !1, Z = d.ALLOW_ARIA_ATTR !== !1, J = d.ALLOW_DATA_ATTR !== !1, de = d.ALLOW_UNKNOWN_PROTOCOLS || !1, pe = d.ALLOW_SELF_CLOSE_IN_ATTR !== !1, be = d.SAFE_FOR_TEMPLATES || !1, Te = d.SAFE_FOR_XML !== !1, Me = d.WHOLE_DOCUMENT || !1, O = d.RETURN_DOM || !1, I = d.RETURN_DOM_FRAGMENT || !1, $ = d.RETURN_TRUSTED_TYPE || !1, _ = d.FORCE_BODY || !1, re = d.SANITIZE_DOM !== !1, te = d.SANITIZE_NAMED_PROPS || !1, Ce = d.KEEP_CONTENT !== !1, He = d.IN_PLACE || !1, N = Lm(d.ALLOWED_URI_REGEXP) ? d.ALLOWED_URI_REGEXP : wc, At = typeof d.NAMESPACE == "string" ? d.NAMESPACE : Vt, Rn = Wo(
      d,
      "MATHML_TEXT_INTEGRATION_POINTS",
      () => $e({}, Jr)
      // Default built-in map
    ), Kt = Wo(
      d,
      "HTML_INTEGRATION_POINTS",
      () => $e({}, dn)
      // Default built-in map
    );
    const T = Wo(d, "CUSTOM_ELEMENT_HANDLING", () => Zs(null));
    if (q = Zs(null), Ht(T, "tagNameCheck") && Bs(T.tagNameCheck) && (q.tagNameCheck = T.tagNameCheck), Ht(T, "attributeNameCheck") && Bs(T.attributeNameCheck) && (q.attributeNameCheck = T.attributeNameCheck), Ht(T, "allowCustomizedBuiltInElements") && typeof T.allowCustomizedBuiltInElements == "boolean" && (q.allowCustomizedBuiltInElements = T.allowCustomizedBuiltInElements), Tt(q), be && (J = !1), I && (O = !0), De && (D = $e({}, yc), P = Zs(null), De.html === !0 && ($e(D, _c), $e(P, vc)), De.svg === !0 && ($e(D, Uo), $e(P, jo), $e(P, yi)), De.svgFilters === !0 && ($e(D, zo), $e(P, jo), $e(P, yi)), De.mathMl === !0 && ($e(D, Ho), $e(P, bc), $e(P, yi))), se.tagCheck = null, se.attributeCheck = null, Ht(d, "ADD_TAGS") && (typeof d.ADD_TAGS == "function" ? se.tagCheck = d.ADD_TAGS : rr(d.ADD_TAGS) && (D === U && (D = Jt(D)), $e(D, d.ADD_TAGS, Ue))), Ht(d, "ADD_ATTR") && (typeof d.ADD_ATTR == "function" ? se.attributeCheck = d.ADD_ATTR : rr(d.ADD_ATTR) && (P === Y && (P = Jt(P)), $e(P, d.ADD_ATTR, Ue))), Ht(d, "ADD_FORBID_CONTENTS") && rr(d.ADD_FORBID_CONTENTS) && (Be === rt && (Be = Jt(Be)), $e(Be, d.ADD_FORBID_CONTENTS, Ue)), Ce && (D["#text"] = !0), Me && $e(D, ["html", "head", "body"]), D.table && ($e(D, ["tbody"]), delete V.tbody), d.TRUSTED_TYPES_POLICY) {
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
    wt && wt(d), Gn = d;
  }, ys = $e({}, [...Uo, ...zo, ...Nm]), cr = $e({}, [...Ho, ...Pm]), ti = function(d, T, B) {
    return T.namespaceURI === Vt ? d === "svg" : T.namespaceURI === Ut ? d === "svg" && (B === "annotation-xml" || Rn[B]) : !!ys[d];
  }, ni = function(d, T, B) {
    return T.namespaceURI === Vt ? d === "math" : T.namespaceURI === Nt ? d === "math" && Kt[B] : !!cr[d];
  }, si = function(d, T, B) {
    return T.namespaceURI === Nt && !Kt[B] || T.namespaceURI === Ut && !Rn[B] ? !1 : !cr[d] && (Qr[d] || !ys[d]);
  }, ri = function(d) {
    let T = fe(d);
    (!T || !T.tagName) && (T = {
      namespaceURI: At,
      tagName: "template"
    });
    const B = Rr(d.tagName), Q = Rr(T.tagName);
    return Kn[d.namespaceURI] ? d.namespaceURI === Nt ? ti(B, T, Q) : d.namespaceURI === Ut ? ni(B, T, Q) : d.namespaceURI === Vt ? si(B, T, Q) : !!(ft === "application/xhtml+xml" && Kn[d.namespaceURI]) : !1;
  }, pn = function(d) {
    Tr(t.removed, {
      element: d
    });
    try {
      fe(d).removeChild(d);
    } catch {
      if (L(d), !fe(d))
        throw Cs("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place");
    }
  }, ii = function(d, T, B) {
    try {
      z(d, T);
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
      const Q = [];
      Os(T, (ae) => {
        Tr(Q, ae);
      }), Os(Q, (ae) => {
        try {
          L(ae);
        } catch {
        }
      });
    }
    const B = C(d);
    if (B)
      for (let Q = B.length - 1; Q >= 0; --Q) {
        const ae = B[Q], _e = ae && ae.name;
        typeof _e == "string" && ii(d, ae, _e);
      }
  }, tn = function(d, T, B) {
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
      B ? z(T, B) : T.removeAttribute(d);
    } catch {
      try {
        T.removeAttribute(d);
      } catch {
      }
    }
    if (d === "is")
      if (O || I)
        try {
          pn(T);
        } catch {
        }
      else
        try {
          T.setAttribute(d, "");
        } catch {
        }
  }, oi = function(d) {
    const T = C(d);
    if (T)
      for (let B = T.length - 1; B >= 0; --B) {
        const Q = T[B], ae = Q && Q.name;
        typeof ae != "string" || P[Ue(ae)] || ii(d, Q, ae);
      }
  }, vs = function(d) {
    const T = [d];
    for (; T.length > 0; ) {
      const B = T.pop();
      ne(B) === Xt.element && oi(B);
      const ae = R(B);
      if (ae)
        for (let _e = ae.length - 1; _e >= 0; --_e)
          T.push(ae[_e]);
    }
  }, vn = function(d, T) {
    return Te ? d === "patchsrc" ? !0 : d === "for" && T !== "label" && T !== "output" : !1;
  }, bs = function(d) {
    if (!Te)
      return;
    const T = [d];
    for (; T.length > 0; ) {
      const B = T.pop(), Q = ne(B);
      if (Q === Xt.processingInstruction || Q === Xt.comment && Ct(Tc, B.data)) {
        try {
          L(B);
        } catch {
        }
        continue;
      }
      if (Q === Xt.element) {
        const _e = B, Xe = Ue(ce(B));
        try {
          _e.hasAttribute && _e.hasAttribute("patchsrc") && _e.removeAttribute("patchsrc"), _e.hasAttribute && _e.hasAttribute("for") && vn("for", Xe) && _e.removeAttribute("for");
        } catch {
        }
      }
      const ae = R(B);
      if (ae)
        for (let _e = ae.length - 1; _e >= 0; --_e)
          T.push(ae[_e]);
    }
  }, Us = function(d) {
    let T = null, B = null;
    if (_)
      d = "<remove></remove>" + d;
    else {
      const _e = dc(d, /^[\r\n\t ]+/);
      B = _e && _e[0];
    }
    ft === "application/xhtml+xml" && At === Vt && (d = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + d + "</body></html>");
    const Q = ge ? he(d) : d;
    if (At === Vt)
      try {
        T = new f().parseFromString(Q, ft);
      } catch {
      }
    if (!T || !T.documentElement) {
      T = Ye.createDocument(At, "template", null);
      try {
        T.documentElement.innerHTML = Vn ? Oe : Q;
      } catch {
      }
    }
    const ae = T.body || T.documentElement;
    return d && B && ae.insertBefore(n.createTextNode(B), ae.childNodes[0] || null), At === Vt ? jt.call(T, Me ? "html" : "body")[0] : Me ? T.documentElement : ae;
  }, zs = function(d) {
    const T = j ? j(d) : d.ownerDocument;
    return ot.call(
      T || d,
      d,
      // eslint-disable-next-line no-bitwise
      l.SHOW_ELEMENT | l.SHOW_COMMENT | l.SHOW_TEXT | l.SHOW_PROCESSING_INSTRUCTION | l.SHOW_CDATA_SECTION,
      null
    );
  }, In = function(d) {
    return d = Ar(d, yt, " "), d = Ar(d, Bt, " "), d = Ar(d, Wt, " "), d;
  }, nn = function(d) {
    var T;
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
    const _e = (T = d.querySelectorAll) === null || T === void 0 ? void 0 : T.call(d, "template");
    _e && Os(_e, (Xe) => {
      mn(Xe.content) && nn(Xe.content);
    });
  }, Xn = function(d) {
    const T = S ? S(d) : null;
    return typeof T != "string" || Ue(T) !== "form" ? !1 : typeof d.nodeName != "string" || typeof d.textContent != "string" || typeof d.removeChild != "function" || // Realm-safe NamedNodeMap detection: equality against the cached
    // prototype getter. Clobbered .attributes (e.g. <input name="attributes">)
    // makes the direct read diverge from the cached read; a clean form
    // (same-realm OR foreign-realm) has both reads pointing at the same
    // canonical NamedNodeMap.
    d.attributes !== C(d) || typeof d.removeAttribute != "function" || // A form descendant named "removeAttributeNode" or "getAttributeNode"
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
  }, mn = function(d) {
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
  function kt(K, d, T) {
    K.length !== 0 && Os(K, (B) => {
      B.call(t, d, T, Gn);
    });
  }
  const _o = function(d, T) {
    return !!(Te && d.hasChildNodes() && !Zn(d.firstElementChild) && Ct(kc, d.textContent) && Ct(kc, d.innerHTML) || Te && d.namespaceURI === Vt && Vm[T] && (Zn(d.firstElementChild) || typeof d.textContent == "string" && Ct(Km[T], d.textContent)) || d.nodeType === Xt.processingInstruction || Te && d.nodeType === Xt.comment && Ct(Tc, d.data));
  }, bn = function(d, T) {
    if (d instanceof RegExp)
      return Ct(d, T);
    if (d instanceof Function) {
      for (var B = arguments.length, Q = new Array(B > 2 ? B - 2 : 0), ae = 2; ae < B; ae++)
        Q[ae - 2] = arguments[ae];
      return !!d(T, ...Q);
    }
    return !1;
  }, ai = function(d, T, B) {
    if (!V[T] && Gt(T) && bn(q.tagNameCheck, T))
      return !1;
    if (Ce && !Be[T]) {
      const Q = fe(d), ae = R(d);
      if (ae && Q) {
        const _e = ae.length;
        for (let Xe = _e - 1; Xe >= 0; --Xe) {
          const at = d === B ? x(ae[Xe], !0) : ae[Xe];
          Q.insertBefore(at, ue(d));
        }
      }
    }
    return pn(d), !0;
  }, li = function(d, T, B, Q) {
    return d.length === 0 ? T : T === B || T === Q ? Jt(T) : T;
  }, ur = function(d, T) {
    return d === T || fe(d) !== null ? !1 : (He && vs(d), !0);
  }, ws = function(d, T) {
    if (kt(Fe.beforeSanitizeElements, d, null), ur(d, T))
      return !0;
    if (Xn(d))
      return pn(d), !0;
    const B = Ue(ce(d));
    if (D = li(Fe.uponSanitizeElement, D, U, W), kt(Fe.uponSanitizeElement, d, {
      tagName: B,
      allowedTags: D
    }), ur(d, T))
      return !0;
    if (_o(d, B))
      return pn(d), !0;
    if (V[B] || !(se.tagCheck instanceof Function && se.tagCheck(B)) && !D[B]) {
      const ae = ai(d, B, T);
      return ae === !1 && kt(Fe.afterSanitizeElements, d, null), ae;
    }
    if (ne(d) === Xt.element && !ri(d) || (B === "noscript" || B === "noembed" || B === "noframes") && Ct(Wm, d.innerHTML))
      return pn(d), !0;
    if (be && d.nodeType === Xt.text) {
      const ae = In(d.textContent);
      d.textContent !== ae && (Tr(t.removed, {
        element: d.cloneNode()
      }), d.textContent = ae);
    }
    return kt(Fe.afterSanitizeElements, d, null), !1;
  }, Hs = function(d, T, B) {
    if (H[T] || vn(T, d) || re && (T === "id" || T === "name") && (B in n || B in _s))
      return !1;
    const Q = P[T] || se.attributeCheck instanceof Function && se.attributeCheck(T, d);
    return J && Ct(qt, T) || Z && Ct(Lt, T) ? !0 : Q ? qn[T] || Ct(N, Ar(B, y, "")) || (T === "src" || T === "xlink:href" || T === "href") && d !== "script" && pc(B, "data:") === 0 && hn[d] || de && !Ct(yn, Ar(B, y, "")) ? !0 : !B : (
      // Condition a) covers a basically valid custom element tag name whose
      // tag passes the configured tagNameCheck and whose attribute name
      // passes the configured attributeNameCheck ...
      Gt(d) && bn(q.tagNameCheck, d) && bn(q.attributeNameCheck, T, d) || // Condition b) covers an `is` attribute whose value passes the
      // configured tagNameCheck while customized built-in elements are
      // allowed.
      T === "is" && q.allowCustomizedBuiltInElements && bn(q.tagNameCheck, B)
    );
  }, sn = $e({}, ["annotation-xml", "color-profile", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "missing-glyph"]), Gt = function(d) {
    return !sn[Rr(d)] && Ct(v, d);
  }, ht = function(d, T, B, Q) {
    if (ge && typeof b == "object" && typeof b.getAttributeType == "function" && !B)
      switch (b.getAttributeType(d, T)) {
        case "TrustedHTML":
          return he(Q);
        case "TrustedScriptURL":
          return ve(Q);
      }
    return Q;
  }, vt = function(d, T, B, Q) {
    try {
      return B ? d.setAttributeNS(B, T, Q) : d.setAttribute(T, Q), Xn(d) ? (pn(d), !1) : !0;
    } catch {
      return tn(T, d), !1;
    }
  }, ut = function(d) {
    kt(Fe.beforeSanitizeAttributes, d, null);
    const T = d.attributes;
    if (!T || Xn(d))
      return;
    P = li(Fe.uponSanitizeAttribute, P, Y, c);
    const B = {
      attrName: "",
      attrValue: "",
      keepAttr: !0,
      allowedAttributes: P,
      forceKeepAttr: void 0
    };
    let Q = T.length;
    const ae = Ue(d.nodeName);
    for (; Q--; ) {
      const _e = T[Q], Xe = _e.name, at = _e.namespaceURI, Et = _e.value, xt = Ue(Xe), fr = Et;
      let qe = Xe === "value" ? fr : Em(fr), ci = !1;
      if (B.attrName = xt, B.attrValue = qe, B.keepAttr = !0, B.forceKeepAttr = void 0, kt(Fe.uponSanitizeAttribute, d, B), qe = B.attrValue, te && (xt === "id" || xt === "name") && pc(qe, Ae) !== 0 && (tn(Xe, d, _e), qe = Ae + qe, ci = !0), Te && Ct(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, qe)) {
        tn(Xe, d, _e);
        continue;
      }
      if (xt === "attributename" && dc(qe, "href")) {
        tn(Xe, d, _e);
        continue;
      }
      if (!B.forceKeepAttr) {
        if (!B.keepAttr) {
          tn(Xe, d, _e);
          continue;
        }
        if (!pe && Ct(qm, qe)) {
          tn(Xe, d, _e);
          continue;
        }
        if (be && (qe = In(qe)), !Hs(ae, xt, qe)) {
          tn(Xe, d, _e);
          continue;
        }
        qe = ht(ae, xt, at, qe), qe !== fr && vt(d, Xe, at, qe) && ci && hc(t.removed);
      }
    }
    kt(Fe.afterSanitizeAttributes, d, null);
  }, rn = function(d) {
    let T = null;
    const B = zs(d);
    for (kt(Fe.beforeSanitizeShadowDOM, d, null); T = B.nextNode(); )
      if (kt(Fe.uponSanitizeShadowNode, T, null), ws(T, d), ut(T), mn(T.content) && rn(T.content), ne(T) === Xt.element) {
        const Q = me(T);
        mn(Q) && (On(Q), rn(Q));
      }
    kt(Fe.afterSanitizeShadowDOM, d, null);
  }, On = function(d) {
    const T = [{
      node: d,
      shadow: null
    }];
    for (; T.length > 0; ) {
      const B = T.pop();
      if (B.shadow) {
        rn(B.shadow);
        continue;
      }
      const Q = B.node, _e = ne(Q) === Xt.element, Xe = R(Q);
      if (Xe)
        for (let at = Xe.length - 1; at >= 0; --at)
          T.push({
            node: Xe[at],
            shadow: null
          });
      if (_e) {
        const at = S ? S(Q) : null;
        if (typeof at == "string" && Ue(at) === "template") {
          const Et = Q.content;
          mn(Et) && T.push({
            node: Et,
            shadow: null
          });
        }
      }
      if (_e) {
        const at = me(Q);
        mn(at) && T.push({
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
    let d = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, T = null, B = null, Q = null, ae = null;
    if (Vn = !K, Vn && (K = "<!-->"), typeof K != "string" && !Zn(K) && (K = Om(K), typeof K != "string"))
      throw Cs("dirty is not a string, aborting");
    if (!t.isSupported)
      return K;
    Ie ? (D = W, P = c) : lr(d), (Fe.uponSanitizeElement.length > 0 || Fe.uponSanitizeAttribute.length > 0) && (D = Jt(D)), Fe.uponSanitizeAttribute.length > 0 && (P = Jt(P)), t.removed = [];
    const _e = He && typeof K != "string" && Zn(K);
    if (_e) {
      bs(K);
      const Et = ce(K);
      if (typeof Et == "string") {
        const xt = Ue(Et);
        if (!D[xt] || V[xt])
          throw Yn(K), Cs("root node is forbidden and cannot be sanitized in-place");
      }
      if (Xn(K))
        throw Yn(K), Cs("root node is clobbered and cannot be sanitized in-place");
      try {
        On(K);
      } catch (xt) {
        throw Yn(K), xt;
      }
    } else if (Zn(K))
      T = Us("<!---->"), B = T.ownerDocument.importNode(K, !0), B.nodeType === Xt.element && B.nodeName === "BODY" || B.nodeName === "HTML" ? T = B : T.appendChild(B), On(T);
    else {
      if (!O && !be && !Me && // eslint-disable-next-line unicorn/prefer-includes
      K.indexOf("<") === -1)
        return ge && $ ? he(K) : K;
      if (T = Us(K), !T)
        return O ? null : $ ? Oe : "";
    }
    T && _ && pn(T.firstChild);
    const Xe = _e ? K : T;
    try {
      const Et = zs(Xe);
      for (; Q = Et.nextNode(); )
        ws(Q, Xe), ut(Q), mn(Q.content) && rn(Q.content);
    } catch (Et) {
      throw _e && (Yn(K), Os(t.removed, (xt) => {
        xt.element && vs(xt.element);
      })), Et;
    }
    if (_e)
      return Os(t.removed, (Et) => {
        Et.element && vs(Et.element);
      }), be && nn(K), K;
    if (O) {
      if (be && nn(T), I)
        for (ae = We.call(T.ownerDocument); T.firstChild; )
          ae.appendChild(T.firstChild);
      else
        ae = T;
      return (P.shadowroot || P.shadowrootmode) && (ae = en.call(s, ae, !0)), ae;
    }
    let at = Me ? T.outerHTML : T.innerHTML;
    return Me && D["!doctype"] && T.ownerDocument && T.ownerDocument.doctype && T.ownerDocument.doctype.name && Ct(Hm, T.ownerDocument.doctype.name) && (at = "<!DOCTYPE " + T.ownerDocument.doctype.name + `>
` + at), be && (at = In(at)), ge && $ ? he(at) : at;
  }, t.setConfig = function() {
    let K = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    lr(K), Ie = !0, W = D, c = P;
  }, t.clearConfig = function() {
    Gn = null, Ie = !1, W = null, c = null, ge = ke, Oe = "";
  }, t.isValidAttribute = function(K, d, T) {
    Gn || lr({});
    const B = Ue(K), Q = Ue(d);
    return Hs(B, Q, T);
  }, t.addHook = function(K, d) {
    typeof d == "function" && Ht(Fe, K) && Tr(Fe[K], d);
  }, t.removeHook = function(K, d) {
    if (Ht(Fe, K)) {
      if (d !== void 0) {
        const T = Am(Fe[K], d);
        return T === -1 ? void 0 : Sm(Fe[K], T, 1)[0];
      }
      return hc(Fe[K]);
    }
  }, t.removeHooks = function(K) {
    Ht(Fe, K) && (Fe[K] = []);
  }, t.removeAllHooks = function() {
    Fe = Ac();
  }, t;
}
var Xa = hf();
Xa.addHook("uponSanitizeElement", (e, t) => {
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
Xa.addHook("afterSanitizeAttributes", (e) => {
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
function Xm(e) {
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
  return Xa.sanitize(e, t);
}
je.setOptions({
  renderer: new je.Renderer(),
  gfm: !0,
  breaks: !0
});
const Ri = (e) => Xm(je(e || "")), Sc = "*", Zm = /* @__PURE__ */ new Set(["null", "about:blank", ""]);
let ln = null;
const Ur = (e) => e && !Zm.has(e) ? e : null, Jm = (e) => {
  if (!e) return null;
  try {
    return Ur(new URL(e).origin);
  } catch {
    return null;
  }
};
function df() {
  if (ln) return ln;
  if (window.parent === window)
    return ln = Ur(window.location.origin) || Sc, ln;
  try {
    const e = Ur(window.parent.location.origin);
    if (e)
      return ln = e, ln;
  } catch {
  }
  try {
    const e = window.location.ancestorOrigins, t = e && e.length ? Ur(e[0]) : null;
    if (t)
      return ln = t, ln;
  } catch {
  }
  return ln = Jm(document.referrer) || Sc, ln;
}
function Ec(e) {
  ln = Ur(e) || ln;
}
function bt(e) {
  window.parent.postMessage(e, df());
}
const Gi = "Start a new chat", xc = "Start a new chat? This ends the current one.", Qm = "Start new chat", eg = "Cancel", Cc = "Couldn't start a new chat. Please try again.", tg = 15e3, ng = ["aria-label"], sg = { class: "new-chat-confirm__question" }, rg = { class: "new-chat-confirm__actions" }, ig = ["disabled"], og = ["disabled"], ag = /* @__PURE__ */ Hn({
  __name: "NewChatConfirm",
  props: {
    error: {},
    busy: { type: Boolean }
  },
  emits: ["confirm", "cancel"],
  setup(e, { emit: t }) {
    const n = t;
    return (s, r) => (w(), k("div", {
      class: "new-chat-confirm",
      role: "alertdialog",
      "aria-live": "polite",
      "aria-label": E(xc)
    }, [
      g("p", sg, X(s.error || E(xc)), 1),
      g("div", rg, [
        g("button", {
          type: "button",
          class: "new-chat-confirm__button",
          disabled: s.busy,
          onClick: r[0] || (r[0] = (i) => n("cancel"))
        }, X(E(eg)), 9, ig),
        g("button", {
          type: "button",
          class: "new-chat-confirm__button new-chat-confirm__button--primary",
          disabled: s.busy,
          onClick: r[1] || (r[1] = (i) => n("confirm"))
        }, X(E(Qm)), 9, og)
      ])
    ], 8, ng));
  }
}), Wn = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [s, r] of t)
    n[s] = r;
  return n;
}, pf = /* @__PURE__ */ Wn(ag, [["__scopeId", "data-v-6c78f353"]]), lg = { class: "askai" }, cg = { class: "askai__bar" }, ug = ["value", "placeholder", "disabled", "aria-label", "onKeydown"], fg = ["disabled", "title", "aria-label", "aria-expanded"], hg = { class: "askai__intro" }, dg = { class: "askai__title" }, pg = {
  key: 0,
  class: "askai__subtitle"
}, mg = {
  key: 0,
  class: "askai__suggestions"
}, gg = ["disabled", "onClick"], _g = ["aria-live"], yg = {
  key: 0,
  class: "askai__question"
}, vg = {
  key: 1,
  class: "askai__system"
}, bg = ["innerHTML"], wg = {
  key: 0,
  class: "askai__sources"
}, kg = ["title"], Tg = {
  key: 0,
  class: "askai__thinking",
  role: "status",
  "aria-live": "polite"
}, Ag = { class: "askai__thinking-text" }, Sg = {
  key: 1,
  class: "askai__foot"
}, Eg = { key: 0 }, xg = {
  key: 1,
  class: "askai__brand",
  href: "https://chattermate.chat",
  target: "_blank",
  rel: "noopener noreferrer"
}, Cg = /* @__PURE__ */ Hn({
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
      () => n.messages.map((C, M) => ({ message: C, index: M })).filter(({ message: C }) => a.includes(C.message_type))
    ), u = oe(() => l.value.length > 0), f = (C) => {
      s("update:draft", C.target.value);
    }, b = () => {
      !(n.typingEnabled ?? n.inputEnabled) || !n.draft.trim() || s("send");
    }, A = (C) => {
      n.inputEnabled && s("ask", C);
    }, x = typeof navigator < "u" && /Mac|iPod|iPhone|iPad/.test(navigator.platform || ""), L = (C) => {
      if (C.key === "Escape") {
        C.preventDefault(), s("close");
        return;
      }
      const M = x ? C.metaKey && !C.ctrlKey : C.ctrlKey && !C.metaKey;
      n.hotkey && M && !C.altKey && (C.key === "k" || C.key === "K") && (C.preventDefault(), s("close"));
    }, z = () => {
      as(() => {
        var C;
        return (C = r.value) == null ? void 0 : C.focus();
      });
    };
    let ue = 0;
    const R = () => {
      if (!o.value) return;
      const C = o.value.closest(".askai"), M = i.value;
      if (!C || !M) return;
      const S = C.offsetHeight - M.offsetHeight, j = getComputedStyle(M), ne = parseFloat(j.paddingTop) + parseFloat(j.paddingBottom), ce = Math.ceil(S + ne + o.value.getBoundingClientRect().height);
      Math.abs(ce - ue) < 3 || (ue = ce, bt({ type: "WIDGET_RESIZE", height: ce }));
    };
    let fe = null;
    const me = oe(
      () => l.value.reduce((C, { message: M, index: S }) => C + n.displayText(S, M.message || "").length, 0)
    );
    return pt(
      () => [l.value.length, me.value, n.loading],
      () => as(() => {
        i.value && (i.value.scrollTop = i.value.scrollHeight);
      })
    ), pt(() => n.newChatArmed, () => as(() => R())), pt(() => n.active, (C) => {
      C && z();
    }), oo(() => {
      n.active && z(), window.addEventListener("keydown", L), o.value && typeof ResizeObserver < "u" && (fe = new ResizeObserver(() => R()), fe.observe(o.value)), R();
    }), ao(() => {
      window.removeEventListener("keydown", L), fe == null || fe.disconnect(), fe = null;
    }), (C, M) => (w(), k("div", lg, [
      g("div", cg, [
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
          value: C.draft,
          placeholder: C.placeholder,
          disabled: !(C.typingEnabled ?? C.inputEnabled),
          "aria-label": C.placeholder,
          autocomplete: "off",
          spellcheck: "false",
          onInput: f,
          onKeydown: xi(Is(b, ["prevent"]), ["enter"])
        }, null, 40, ug),
        C.canStartNewChat ? (w(), k("button", {
          key: 0,
          type: "button",
          class: Le(["askai__new", { "askai__new--armed": C.newChatArmed }]),
          disabled: C.startingNewChat,
          title: E(Gi),
          "aria-label": E(Gi),
          "aria-expanded": C.newChatArmed,
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
        ]), 10, fg)) : ee("", !0),
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
      C.newChatArmed && C.canStartNewChat ? (w(), Pn(pf, {
        key: 0,
        busy: C.startingNewChat,
        error: C.newChatError,
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
          u.value ? (w(), k(Re, { key: 1 }, [
            (w(!0), k(Re, null, dt(l.value, ({ message: S, index: j }) => (w(), k("div", {
              key: j,
              class: "askai__turn",
              "aria-live": C.isStreaming(j) ? "off" : "polite"
            }, [
              S.message_type === "user" ? (w(), k("p", yg, X(S.message), 1)) : S.message_type === "system" ? (w(), k("p", vg, X(S.message), 1)) : (w(), k(Re, { key: 2 }, [
                g("div", {
                  class: Le(["askai__answer", { "askai__answer--streaming": C.isStreaming(j) }]),
                  innerHTML: E(Ri)(C.isStreaming(j) ? C.displayText(j, S.message || "") : S.message || "")
                }, null, 10, bg),
                C.showCitations && !C.isStreaming(j) && S.sources && S.sources.length ? (w(), k("div", wg, [
                  M[9] || (M[9] = g("span", { class: "askai__label" }, "Sources", -1)),
                  (w(!0), k(Re, null, dt(S.sources, (ne, ce) => (w(), k("span", {
                    key: ce,
                    class: "askai__source",
                    title: C.citationTooltip(ne)
                  }, X(C.citationLabel(ne)), 9, kg))), 128))
                ])) : ee("", !0)
              ], 64))
            ], 8, _g))), 128)),
            C.loading ? (w(), k("div", Tg, [
              M[10] || (M[10] = g("span", { class: "askai__dot" }, null, -1)),
              M[11] || (M[11] = g("span", { class: "askai__dot" }, null, -1)),
              M[12] || (M[12] = g("span", { class: "askai__dot" }, null, -1)),
              g("span", Ag, X(C.showCitations ? "Searching the knowledge base" : "Thinking"), 1)
            ])) : ee("", !0)
          ], 64)) : (w(), k(Re, { key: 0 }, [
            g("div", hg, [
              g("h2", dg, X(C.welcomeTitle || `Ask ${C.agentName}`), 1),
              C.welcomeSubtitle ? (w(), k("p", pg, X(C.welcomeSubtitle), 1)) : ee("", !0)
            ]),
            C.suggestions.length && !C.draft.trim() ? (w(), k("div", mg, [
              M[8] || (M[8] = g("p", { class: "askai__label" }, "Suggested", -1)),
              (w(!0), k(Re, null, dt(C.suggestions, (S) => (w(), k("button", {
                key: S,
                type: "button",
                class: "askai__suggestion",
                disabled: !C.inputEnabled,
                onClick: (j) => A(S)
              }, [
                g("span", null, X(S), 1),
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
              ], 8, gg))), 128))
            ])) : ee("", !0)
          ], 64))
        ], 512)
      ], 512),
      C.disclaimer || C.showBranding ? (w(), k("div", Sg, [
        C.disclaimer ? (w(), k("span", Eg, X(C.disclaimer), 1)) : ee("", !0),
        C.showBranding ? (w(), k("a", xg, "Powered by ChatterMate")) : ee("", !0)
      ])) : ee("", !0)
    ]));
  }
}), Rg = /* @__PURE__ */ Wn(Cg, [["__scopeId", "data-v-68aaa0d9"]]), Ig = "#12150E", Og = "#C9F24E", Lg = "#FF9D87", Ng = "#F5F6F0", Pg = {
  ink: Ig,
  lime: Og,
  coral: Lg,
  paper: Ng
}, Ii = Object.freeze(Pg), Mg = ["width", "height"], Dg = ["fill"], Fg = ["cx", "r", "fill"], $g = ["cx", "r", "fill"], Bg = 24, Ug = /* @__PURE__ */ Hn({
  __name: "BrandMark",
  props: {
    size: { default: 32 }
  },
  setup(e) {
    const t = e, n = oe(
      () => t.size <= Bg ? { left: 22, right: 42, r: 10 } : { left: 23, right: 41, r: 8 }
    );
    return (s, r) => (w(), k("svg", {
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
        fill: E(Ii).ink
      }, null, 8, Dg),
      g("circle", {
        cx: n.value.left,
        cy: "32",
        r: n.value.r,
        fill: E(Ii).lime
      }, null, 8, Fg),
      g("circle", {
        cx: n.value.right,
        cy: "32",
        r: n.value.r,
        fill: E(Ii).coral
      }, null, 8, $g)
    ], 8, Mg));
  }
}), Er = /* @__PURE__ */ Wn(Ug, [["__scopeId", "data-v-982a6f45"]]), zg = 40;
function Yi(e) {
  if (typeof e == "number" || typeof e == "boolean") return String(e);
  if (typeof e != "string") return null;
  const t = e.trim();
  return t && t.length <= zg && !t.includes(`
`) ? t : null;
}
function Hg(e) {
  var s, r;
  const t = Yi((s = e.preview) == null ? void 0 : s.before), n = Yi((r = e.preview) == null ? void 0 : r.after);
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
function jg(e, t, n, s) {
  if (!s) return { approve: e, decline: "Not now" };
  const r = Yi(t), i = Yi(n);
  return {
    approve: i ? `Change to ${i}` : "Change it",
    decline: r ? `Keep ${r}` : "Keep current"
  };
}
const Wg = ["aria-label"], qg = { class: "cm-action-head" }, Vg = { class: "cm-action-row before" }, Kg = { class: "cm-action-text" }, Gg = { class: "cm-action-row after" }, Yg = { class: "cm-action-text" }, Xg = {
  key: 1,
  class: "cm-action-args"
}, Zg = { class: "cm-action-buttons" }, Jg = /* @__PURE__ */ Hn({
  __name: "ActionConfirmCard",
  props: {
    pending: {}
  },
  emits: ["approve", "decline"],
  setup(e, { emit: t }) {
    const n = e, s = t, r = oe(() => !!n.pending.preview);
    function i(u) {
      return u == null || u === "" ? "—" : typeof u == "string" ? u : JSON.stringify(u, null, 2);
    }
    function o(u) {
      const f = u.replace(/[_-]+/g, " ").trim();
      return f.charAt(0).toUpperCase() + f.slice(1);
    }
    const a = oe(
      () => n.pending.details ?? Object.entries(n.pending.request.args || {}).map(([u, f]) => ({ key: o(u), value: i(f) }))
    ), l = oe(
      () => {
        var u, f;
        return jg(n.pending.request.label, (u = n.pending.preview) == null ? void 0 : u.before, (f = n.pending.preview) == null ? void 0 : f.after, r.value);
      }
    );
    return (u, f) => {
      var b, A;
      return w(), k("div", {
        class: "cm-action-confirm",
        role: "group",
        "aria-label": u.pending.request.label
      }, [
        g("div", qg, X(u.pending.request.label) + "?", 1),
        r.value ? (w(), k(Re, { key: 0 }, [
          g("div", Vg, [
            f[2] || (f[2] = g("span", { class: "cm-action-tag" }, "Current", -1)),
            g("span", Kg, X(i((b = u.pending.preview) == null ? void 0 : b.before)), 1)
          ]),
          g("div", Gg, [
            f[3] || (f[3] = g("span", { class: "cm-action-tag" }, "New", -1)),
            g("span", Yg, X(i((A = u.pending.preview) == null ? void 0 : A.after)), 1)
          ])
        ], 64)) : a.value.length ? (w(), k("dl", Xg, [
          (w(!0), k(Re, null, dt(a.value, (x) => (w(), k(Re, {
            key: x.key
          }, [
            g("dt", null, X(x.key), 1),
            g("dd", null, X(x.value), 1)
          ], 64))), 128))
        ])) : ee("", !0),
        g("div", Zg, [
          g("button", {
            type: "button",
            class: "cm-action-apply",
            onClick: f[0] || (f[0] = (x) => s("approve"))
          }, X(l.value.approve), 1),
          g("button", {
            type: "button",
            class: "cm-action-cancel",
            onClick: f[1] || (f[1] = (x) => s("decline"))
          }, X(l.value.decline), 1)
        ])
      ], 8, Wg);
    };
  }
}), Qg = /* @__PURE__ */ Wn(Jg, [["__scopeId", "data-v-bdc9ad66"]]), e_ = {
  key: 0,
  class: "cm-receipt-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, t_ = {
  key: 1,
  class: "cm-receipt-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, n_ = {
  key: 2,
  class: "cm-receipt-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, s_ = { class: "cm-visually-hidden" }, r_ = { class: "cm-receipt-text" }, i_ = /* @__PURE__ */ Hn({
  __name: "ActionReceiptLine",
  props: {
    receipt: {}
  },
  setup(e) {
    return (t, n) => (w(), k("div", {
      class: Le(["cm-receipt", t.receipt.tone]),
      role: "status"
    }, [
      t.receipt.tone === "done" ? (w(), k("svg", e_, n[0] || (n[0] = [
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
      ]))) : t.receipt.tone === "failed" ? (w(), k("svg", t_, n[1] || (n[1] = [
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
      ]))) : (w(), k("svg", n_, n[2] || (n[2] = [
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
      g("span", s_, X(t.receipt.tone === "done" ? "Done:" : t.receipt.tone === "failed" ? "Failed:" : "Skipped:"), 1),
      g("span", r_, X(t.receipt.text), 1)
    ], 2));
  }
}), o_ = /* @__PURE__ */ Wn(i_, [["__scopeId", "data-v-be379090"]]), a_ = { class: "cm-plan-pin" }, l_ = ["aria-label"], c_ = ["aria-expanded"], u_ = { class: "cm-plan-label" }, f_ = { class: "cm-plan-name" }, h_ = {
  key: 0,
  class: "cm-plan-now"
}, d_ = { class: "cm-plan-count" }, p_ = ["aria-valuenow", "aria-valuemax", "aria-label"], m_ = {
  key: 0,
  class: "cm-plan-steps"
}, g_ = ["aria-current"], __ = {
  key: 0,
  class: "cm-plan-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, y_ = {
  key: 1,
  class: "cm-plan-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, v_ = {
  key: 2,
  class: "cm-plan-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, b_ = { class: "cm-plan-title" }, w_ = {
  key: 3,
  class: "cm-visually-hidden"
}, k_ = { class: "cm-plan-actions" }, T_ = /* @__PURE__ */ Hn({
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
      () => n.progress.titles.map((l, u) => ({
        title: l,
        state: u < i.value ? "done" : u === n.progress.index ? "now" : "todo"
      }))
    );
    return (l, u) => (w(), k("div", a_, [
      g("section", {
        class: Le(["cm-plan", { finished: l.progress.finished }]),
        "aria-label": `Guide: ${l.progress.name}`
      }, [
        g("button", {
          type: "button",
          class: "cm-plan-head",
          "aria-expanded": r.value,
          onClick: u[0] || (u[0] = (f) => r.value = !r.value)
        }, [
          g("span", u_, [
            g("span", f_, X(l.progress.name), 1),
            !l.progress.finished && l.progress.title ? (w(), k("span", h_, X(l.progress.title), 1)) : ee("", !0)
          ]),
          g("span", d_, X(l.progress.finished ? "Done" : `${i.value} of ${l.progress.count}`), 1),
          (w(), k("svg", {
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
          }, u[3] || (u[3] = [
            g("path", { d: "M6 9l6 6 6-6" }, null, -1)
          ]), 2))
        ], 8, c_),
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
        ], 8, p_),
        r.value ? (w(), k(Re, { key: 0 }, [
          a.value.length ? (w(), k("ol", m_, [
            (w(!0), k(Re, null, dt(a.value, (f, b) => (w(), k("li", {
              key: b,
              class: Le(f.state),
              "aria-current": f.state === "now" ? "step" : void 0
            }, [
              f.state === "done" ? (w(), k("svg", __, u[4] || (u[4] = [
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
              ]))) : f.state === "now" ? (w(), k("svg", y_, u[5] || (u[5] = [
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
              ]))) : (w(), k("svg", v_, u[6] || (u[6] = [
                g("circle", {
                  cx: "12",
                  cy: "12",
                  r: "9",
                  class: "ring todo"
                }, null, -1)
              ]))),
              g("span", b_, X(f.title), 1),
              f.state === "done" ? (w(), k("span", w_, "(done)")) : ee("", !0)
            ], 10, g_))), 128))
          ])) : ee("", !0),
          g("div", k_, [
            l.progress.skippable ? (w(), k("button", {
              key: 0,
              type: "button",
              onClick: u[1] || (u[1] = (f) => s("skip"))
            }, "Skip this step")) : ee("", !0),
            g("button", {
              type: "button",
              onClick: u[2] || (u[2] = (f) => s("hide"))
            }, "Hide guide")
          ])
        ], 64)) : ee("", !0)
      ], 10, l_)
    ]));
  }
}), A_ = /* @__PURE__ */ Wn(T_, [["__scopeId", "data-v-016d08e3"]]), S_ = {
  class: "cm-replies",
  role: "group",
  "aria-label": "Suggested replies"
}, E_ = ["disabled", "onClick"], x_ = /* @__PURE__ */ Hn({
  __name: "SuggestedReplies",
  props: {
    chips: {},
    disabled: { type: Boolean }
  },
  emits: ["pick"],
  setup(e, { emit: t }) {
    const n = t;
    return (s, r) => (w(), k("div", S_, [
      (w(!0), k(Re, null, dt(s.chips, (i) => (w(), k("button", {
        key: i.label,
        type: "button",
        class: "cm-reply",
        disabled: s.disabled,
        onClick: (o) => n("pick", i)
      }, X(i.label), 9, E_))), 128))
    ]));
  }
}), C_ = /* @__PURE__ */ Wn(x_, [["__scopeId", "data-v-7b650713"]]), R_ = 2e4, mf = "Couldn't add this to your cart. Please try again.", I_ = { status: "idle", error: null }, _a = ie(null), Za = Vr({}), ya = /* @__PURE__ */ new Map(), gf = /* @__PURE__ */ new Map();
let O_ = 0;
const L_ = (e, t) => e.toLowerCase() === t.toLowerCase();
function N_(e, t) {
  return !!(e.cart_variant_id && t && _a.value && L_(_a.value, t));
}
function _f(e) {
  return Za[e] ?? I_;
}
function yf(e, t, n) {
  (n.status === "added" || gf.get(e) === t) && (Za[e] = n);
}
function P_(e, t) {
  const n = ya.get(e);
  n && (clearTimeout(n.timer), ya.delete(e), yf(n.variantId, e, t));
}
function M_(e) {
  if (_f(e).status === "adding") return;
  const t = `cart-${++O_}`;
  Za[e] = { status: "adding", error: null }, gf.set(e, t), ya.set(t, {
    variantId: e,
    timer: setTimeout(() => yf(e, t, { status: "failed", error: mf }), R_)
  }), bt({ type: "ADD_TO_CART", requestId: t, variantId: e });
}
function Rc() {
  bt({ type: "VIEW_CART" });
}
function D_(e) {
  if (e.type === "CART_AVAILABLE")
    return _a.value = typeof e.shop == "string" && e.shop ? e.shop : null, !0;
  if (e.type === "ADD_TO_CART_DONE") {
    const t = typeof e.error == "string" && e.error ? e.error : mf;
    return P_(String(e.requestId), e.ok === !0 ? { status: "added", error: null } : { status: "failed", error: t }), !0;
  }
  return !1;
}
const F_ = { class: "cm-cart" }, $_ = ["disabled"], B_ = {
  key: 2,
  class: "cm-cart-note",
  role: "status"
}, U_ = {
  key: 3,
  class: "cm-cart-note cm-cart-error",
  role: "alert"
}, z_ = /* @__PURE__ */ Hn({
  __name: "ProductCartButton",
  props: {
    variantId: {}
  },
  setup(e) {
    const t = e, n = oe(() => _f(t.variantId));
    return (s, r) => (w(), k("div", F_, [
      n.value.status === "added" ? (w(), k("button", {
        key: 0,
        type: "button",
        class: "cm-cart-button",
        onClick: r[0] || (r[0] = //@ts-ignore
        (...i) => E(Rc) && E(Rc)(...i))
      }, " View cart ")) : (w(), k("button", {
        key: 1,
        type: "button",
        class: "cm-cart-button",
        disabled: n.value.status === "adding",
        onClick: r[1] || (r[1] = (i) => E(M_)(s.variantId))
      }, X(n.value.status === "adding" ? "Adding…" : "Add to cart"), 9, $_)),
      n.value.status === "added" ? (w(), k("p", B_, "Added to your cart")) : n.value.error ? (w(), k("p", U_, X(n.value.error), 1)) : ee("", !0)
    ]));
  }
}), H_ = /* @__PURE__ */ Wn(z_, [["__scopeId", "data-v-375a4eee"]]);
function j_(e) {
  const t = ie([]);
  function n(r) {
    t.value.push({ after: e.value.length, receipt: Hg(r) });
  }
  function s(r) {
    return t.value.filter((i) => i.after === r).map((i) => i.receipt);
  }
  return pt(() => e.value.length, (r) => {
    r === 0 ? t.value = [] : t.value.some((i) => i.after > r) && (t.value = t.value.filter((i) => i.after <= r));
  }), { receipts: t, addReceipt: n, receiptsAfter: s };
}
const W_ = "Please don't paste passwords or keys here.", q_ = [
  /\bsk-(?:proj-|ant-)?[A-Za-z0-9_-]{20,}/,
  /\bcmat_[A-Za-z0-9_-]{16,}/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{30,}/,
  /\bxox[abposr]-[A-Za-z0-9-]{10,}/
], V_ = /\b(password|passwd|pwd|passcode|api[ _-]?key|secret)\s*(?:is|:|=)\s*\S+/i, K_ = /\b(?:\d[ -]?){12,18}\d\b/g;
function G_(e) {
  let t = 0;
  for (let n = 0; n < e.length; n++) {
    let s = Number(e[e.length - 1 - n]);
    n % 2 === 1 && (s *= 2, s > 9 && (s -= 9)), t += s;
  }
  return t % 10 === 0;
}
function Y_(e) {
  return e ? q_.some((t) => t.test(e)) || V_.test(e) ? !0 : (e.match(K_) || []).some((t) => {
    const n = t.replace(/\D/g, "");
    return n.length >= 13 && n.length <= 19 && G_(n);
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
], X_ = (e) => (e || "").split("").reduce((t, n) => t + n.charCodeAt(0), 0) % Ir.length, Z_ = (e) => {
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
}, J_ = (e, t) => {
  const n = typeof t == "number" && Number.isFinite(t) ? t : X_(e);
  return Z_(n);
}, Ic = (e) => {
  var t;
  return !!((t = e == null ? void 0 : e.attributes) != null && t.end_chat);
}, Oc = "AI can make mistakes. Check important info.";
function Q_(e, t = !1) {
  return e !== !1 && !t;
}
const qo = {
  ai: "Online · replies instantly",
  human: "Online · usually replies in a few minutes",
  away: "Away · we'll reply when we're back"
};
function ey(e, t = !1) {
  return (t ? "human" : (e == null ? void 0 : e.mode) ?? "ai") === "ai" ? { text: qo.ai, online: !0 } : (e == null ? void 0 : e.available) !== !1 ? { text: qo.human, online: !0 } : { text: qo.away, online: !1 };
}
const vf = (e) => !!e && (/^https?:\/\//i.test(e) || e.startsWith("data:")), ty = (e, t) => e ? vf(e) || e.startsWith("blob:") ? e : `${t.replace(/\/api\/v1\/?$/, "")}${e.startsWith("/") ? "" : "/"}${e}` : "";
function Lc() {
  return typeof window < "u" && window.APP_CONFIG ? window.APP_CONFIG : {};
}
const Ds = {
  get API_URL() {
    return Lc().API_URL || void 0 || "https://api.chattermate.chat/api/v1";
  },
  get WS_URL() {
    return Lc().WS_URL || void 0 || "wss://api.chattermate.chat";
  }
};
function Xi(e) {
  return ty(e, Ds.API_URL);
}
const bf = "ctid", ny = "identity_expired", sy = "invalid_token", Nc = 0.8, ry = 720 * 60 * 1e3, Vo = 30 * 1e3, Ko = 1e3, cs = (e) => {
  if (typeof e != "string") return e ? String(e) : null;
  const t = e.trim();
  return !t || t === "undefined" || t === "null" ? null : t;
}, Oi = (e) => {
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
}, iy = async (e) => {
  var t, n;
  try {
    return (n = (t = await e.json()) == null ? void 0 : t.detail) == null ? void 0 : n.code;
  } catch {
    return;
  }
}, Zi = (e = bf) => ({
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
}), oy = () => ({
  read: () => null,
  write: () => {
  },
  clear: () => {
  }
});
function ay(e = {}) {
  const t = e.store ?? Zi(), n = ie(null);
  let s = null, r = null;
  const i = () => {
    s && (clearTimeout(s), s = null);
  }, o = () => {
    const z = Oi(n.value);
    return z != null && z.exp ? Number(z.exp) - Math.floor(Date.now() / Ko) : null;
  }, a = () => {
    const z = Oi(n.value);
    if (!(z != null && z.exp)) return !1;
    const ue = z.iat ? Number(z.exp) - Number(z.iat) : 0, R = o() ?? 0;
    return ue <= 0 ? R <= 0 : R <= ue * (1 - Nc);
  }, l = (z, { persist: ue = !0 } = {}) => {
    var me, C;
    const R = cs(z), fe = !!n.value;
    if (i(), n.value = R, !R) {
      t.clear(), fe && ((me = e.onTokenCleared) == null || me.call(e));
      return;
    }
    ue && (t.write(R), (C = e.onTokenChanged) == null || C.call(e, R)), b();
  }, u = async (z) => {
    if (!n.value || !z) return !1;
    if (r) return r;
    const ue = n.value;
    return r = (async () => {
      var R, fe;
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
          return await iy(me) !== sy && ((R = e.onIdentityExpired) == null || R.call(e)), !1;
        if (!me.ok)
          return b(Vo), !1;
        const C = await me.json(), M = cs((fe = C == null ? void 0 : C.data) == null ? void 0 : fe.token);
        return M ? (l(M), !0) : !1;
      } catch {
        return b(Vo), !1;
      } finally {
        r = null;
      }
    })(), r;
  }, f = async (z) => n.value ? a() ? u(z) : !0 : !1, b = (z) => {
    i();
    const ue = Oi(n.value);
    if (!(ue != null && ue.exp) || !(ue != null && ue.iat)) return;
    const R = (Number(ue.exp) - Number(ue.iat)) * Ko, fe = (o() ?? 0) * Ko, me = z ?? Math.min(
      ry,
      Math.max(0, fe - R * (1 - Nc))
    );
    s = setTimeout(() => {
      s = null, f(A).then((C) => {
        b(C ? void 0 : Vo);
      });
    }, me);
  };
  let A = "";
  return {
    token: n,
    start: (z, ue) => {
      A = z;
      const R = cs(ue) || t.read();
      l(R, { persist: !1 }), R && t.write(R);
    },
    stop: () => {
      i(), r = null;
    },
    setToken: l,
    ensureFresh: f
  };
}
const ir = window.__CM_FRAME__, wf = "null";
let Ns = !1, kf = !1, Tf = null;
const Ji = () => !!ir, Ls = () => !ir || Ns && !kf, Af = () => Tf, Sf = (e) => {
  typeof e == "string" && e && (Tf = e);
}, Ef = (e) => ir ? Ns ? oy() : Zi(`${bf}:${e}`) : Zi(), ly = () => new Promise((e) => {
  const t = (n) => {
    var r;
    if (n.source !== window.parent || ((r = n.data) == null ? void 0 : r.type) !== "HOST_INIT") return;
    window.removeEventListener("message", t);
    const s = n.origin === wf;
    e({
      origin: n.origin,
      // An opaque host can't be addressed, so nothing it hands over can be
      // answered safely: such a frame runs as an anonymous visitor.
      token: s ? null : cs(n.data.token),
      pageUrl: typeof n.data.pageUrl == "string" ? n.data.pageUrl : null
    });
  };
  window.addEventListener("message", t), window.parent.postMessage({ type: "FRAME_READY" }, "*");
}), cy = async (e) => {
  var t;
  try {
    const n = await e.json();
    return ((t = n == null ? void 0 : n.detail) == null ? void 0 : t.code) || "unavailable";
  } catch {
    return "unavailable";
  }
}, Pc = () => {
  const e = document.getElementById("app");
  e && (e.textContent = "Chat is unavailable right now.");
};
async function uy() {
  if (!ir) return !0;
  const e = new URL(window.location.href).searchParams;
  Ns = e.get("host") === "1" && window.parent !== window;
  let t, n = null;
  if (Ns) {
    const o = await ly();
    o.origin !== wf ? (Ec(o.origin), n = o.origin) : (kf = !0, Ec("*")), Sf(o.pageUrl), t = o.token;
  } else
    t = Ef(ir.widgetId).read();
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
    return Ns ? bt({ type: "WIDGET_ERROR", code: "unavailable" }) : Pc(), !1;
  }
  if (!s.ok) {
    const o = await cy(s);
    return Ns ? bt({ type: "WIDGET_ERROR", code: o }) : Pc(), !1;
  }
  const r = await s.json();
  window.__INITIAL_DATA__ = r;
  const i = cs(r.initialToken);
  return Ls() && i && i !== t && bt({ type: "TOKEN_UPDATE", token: i }), !0;
}
const fy = () => {
  Ns && bt({ type: "WIDGET_READY" });
}, va = Ii.ink;
function hy(e) {
  const t = oe(() => ({
    backgroundColor: "var(--cm-card)",
    color: "var(--cm-text)"
  })), n = oe(() => ({
    backgroundColor: e.value.chat_bubble_color || va,
    color: sr(e.value.chat_bubble_color || va) ? "#FFFFFF" : "#000000"
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
  })), a = oe(() => Xi(e.value.photo_url)), l = oe(() => {
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
const dy = /* @__PURE__ */ new Set(["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]), py = /* @__PURE__ */ new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);
[...dy, ...py];
function my(e, t) {
  const n = ie([]), s = ie(!1), r = ie(null), i = (M) => {
    if (M === 0) return "0 Bytes";
    const S = 1024, j = ["Bytes", "KB", "MB", "GB"], ne = Math.floor(Math.log(M) / Math.log(S));
    return parseFloat((M / Math.pow(S, ne)).toFixed(2)) + " " + j[ne];
  }, o = (M) => M.startsWith("image/"), a = (M) => M ? Xi(M) : "", l = (M) => {
    const S = M.file_url || M.url;
    return S ? Xi(S) : "";
  }, u = async (M) => {
    const S = M.target;
    S.files && S.files.length > 0 && (await z(Array.from(S.files)), S.value = "");
  }, f = async (M) => {
    var j;
    M.preventDefault();
    const S = (j = M.dataTransfer) == null ? void 0 : j.files;
    S && S.length > 0 && await z(Array.from(S));
  }, b = (M) => {
    M.preventDefault();
  }, A = (M) => {
    M.preventDefault();
  }, x = async (M) => {
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
        const Ge = document.createElement("canvas");
        let ze = Oe.width, st = Oe.height;
        const he = 1920;
        (ze > he || st > he) && (ze > st ? (st = st / ze * he, ze = he) : (ze = ze / st * he, st = he)), Ge.width = ze, Ge.height = st;
        const ve = Ge.getContext("2d");
        if (!ve) {
          ne(new Error("Failed to get canvas context"));
          return;
        }
        ve.drawImage(Oe, 0, 0, ze, st);
        let ye = 0.9;
        const Qe = () => {
          Ge.toBlob((Ye) => {
            if (!Ye) {
              ne(new Error("Failed to compress image"));
              return;
            }
            if (Ye.size / 1024 > S && ye > 0.3)
              ye -= 0.1, Qe();
            else {
              const We = new FileReader();
              We.onload = () => {
                const jt = We.result.split(",")[1];
                j({ blob: Ye, base64: jt });
              }, We.readAsDataURL(Ye);
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
              const Ye = ((ot = ye.target) == null ? void 0 : ot.result).split(",")[1];
              n.value.push({
                content: Ye,
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
            var Ye;
            const Qe = ((Ye = ve.target) == null ? void 0 : Ye.result).split(",")[1];
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
    handleDrop: f,
    handleDragOver: b,
    handleDragLeave: A,
    handlePaste: x,
    uploadFiles: z,
    removeAttachment: async (M) => {
      const S = n.value[M];
      if (S) {
        try {
          let j = S.url;
          if (j.startsWith("/uploads/") ? j = j.substring(9) : j.startsWith("/") && (j = j.substring(1)), vf(j))
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
const Li = /* @__PURE__ */ Object.create(null);
Object.keys(Cn).forEach((e) => {
  Li[Cn[e]] = e;
});
const ba = { type: "error", data: "parser error" }, xf = typeof Blob == "function" || typeof Blob < "u" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]", Cf = typeof ArrayBuffer == "function", Rf = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e && e.buffer instanceof ArrayBuffer, Ja = ({ type: e, data: t }, n, s) => xf && t instanceof Blob ? n ? s(t) : Mc(t, s) : Cf && (t instanceof ArrayBuffer || Rf(t)) ? n ? s(t) : Mc(new Blob([t]), s) : s(Cn[e] + (t || "")), Mc = (e, t) => {
  const n = new FileReader();
  return n.onload = function() {
    const s = n.result.split(",")[1];
    t("b" + (s || ""));
  }, n.readAsDataURL(e);
};
function Dc(e) {
  return e instanceof Uint8Array ? e : e instanceof ArrayBuffer ? new Uint8Array(e) : new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
}
let Go;
function gy(e, t) {
  if (xf && e.data instanceof Blob)
    return e.data.arrayBuffer().then(Dc).then(t);
  if (Cf && (e.data instanceof ArrayBuffer || Rf(e.data)))
    return t(Dc(e.data));
  Ja(e, !1, (n) => {
    Go || (Go = new TextEncoder()), t(Go.encode(n));
  });
}
const Fc = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", Or = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (let e = 0; e < Fc.length; e++)
  Or[Fc.charCodeAt(e)] = e;
const _y = (e) => {
  let t = e.length * 0.75, n = e.length, s, r = 0, i, o, a, l;
  e[e.length - 1] === "=" && (t--, e[e.length - 2] === "=" && t--);
  const u = new ArrayBuffer(t), f = new Uint8Array(u);
  for (s = 0; s < n; s += 4)
    i = Or[e.charCodeAt(s)], o = Or[e.charCodeAt(s + 1)], a = Or[e.charCodeAt(s + 2)], l = Or[e.charCodeAt(s + 3)], f[r++] = i << 2 | o >> 4, f[r++] = (o & 15) << 4 | a >> 2, f[r++] = (a & 3) << 6 | l & 63;
  return u;
}, yy = typeof ArrayBuffer == "function", Qa = (e, t) => {
  if (typeof e != "string")
    return {
      type: "message",
      data: If(e, t)
    };
  const n = e.charAt(0);
  return n === "b" ? {
    type: "message",
    data: vy(e.substring(1), t)
  } : Li[n] ? e.length > 1 ? {
    type: Li[n],
    data: e.substring(1)
  } : {
    type: Li[n]
  } : ba;
}, vy = (e, t) => {
  if (yy) {
    const n = _y(e);
    return If(n, t);
  } else
    return { base64: !0, data: e };
}, If = (e, t) => {
  switch (t) {
    case "blob":
      return e instanceof Blob ? e : new Blob([e]);
    case "arraybuffer":
    default:
      return e instanceof ArrayBuffer ? e : e.buffer;
  }
}, Of = "", by = (e, t) => {
  const n = e.length, s = new Array(n);
  let r = 0;
  e.forEach((i, o) => {
    Ja(i, !1, (a) => {
      s[o] = a, ++r === n && t(s.join(Of));
    });
  });
}, wy = (e, t) => {
  const n = e.split(Of), s = [];
  for (let r = 0; r < n.length; r++) {
    const i = Qa(n[r], t);
    if (s.push(i), i.type === "error")
      break;
  }
  return s;
};
function ky() {
  return new TransformStream({
    transform(e, t) {
      gy(e, (n) => {
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
function Ty(e, t) {
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
          const l = bi(n, 8), u = new DataView(l.buffer, l.byteOffset, l.length), f = u.getUint32(0);
          if (f > Math.pow(2, 21) - 1) {
            a.enqueue(ba);
            break;
          }
          r = f * Math.pow(2, 32) + u.getUint32(4), s = 3;
        } else {
          if (vi(n) < r)
            break;
          const l = bi(n, r);
          a.enqueue(Qa(i ? l : Yo.decode(l), t)), s = 0;
        }
        if (r === 0 || r > e) {
          a.enqueue(ba);
          break;
        }
      }
    }
  });
}
const Lf = 4;
function mt(e) {
  if (e) return Ay(e);
}
function Ay(e) {
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
const po = typeof Promise == "function" && typeof Promise.resolve == "function" ? (t) => Promise.resolve().then(t) : (t, n) => n(t, 0), cn = typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")(), Sy = "arraybuffer";
function Nf(e, ...t) {
  return t.reduce((n, s) => (e.hasOwnProperty(s) && (n[s] = e[s]), n), {});
}
const Ey = cn.setTimeout, xy = cn.clearTimeout;
function mo(e, t) {
  t.useNativeTimers ? (e.setTimeoutFn = Ey.bind(cn), e.clearTimeoutFn = xy.bind(cn)) : (e.setTimeoutFn = cn.setTimeout.bind(cn), e.clearTimeoutFn = cn.clearTimeout.bind(cn));
}
const Cy = 1.33;
function Ry(e) {
  return typeof e == "string" ? Iy(e) : Math.ceil((e.byteLength || e.size) * Cy);
}
function Iy(e) {
  let t = 0, n = 0;
  for (let s = 0, r = e.length; s < r; s++)
    t = e.charCodeAt(s), t < 128 ? n += 1 : t < 2048 ? n += 2 : t < 55296 || t >= 57344 ? n += 3 : (s++, n += 4);
  return n;
}
function Pf() {
  return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
}
function Oy(e) {
  let t = "";
  for (let n in e)
    e.hasOwnProperty(n) && (t.length && (t += "&"), t += encodeURIComponent(n) + "=" + encodeURIComponent(e[n]));
  return t;
}
function Ly(e) {
  let t = {}, n = e.split("&");
  for (let s = 0, r = n.length; s < r; s++) {
    let i = n[s].split("=");
    t[decodeURIComponent(i[0])] = decodeURIComponent(i[1]);
  }
  return t;
}
class Ny extends Error {
  constructor(t, n, s) {
    super(t), this.description = n, this.context = s, this.type = "TransportError";
  }
}
class el extends mt {
  /**
   * Transport abstract constructor.
   *
   * @param {Object} opts - options
   * @protected
   */
  constructor(t) {
    super(), this.writable = !1, mo(this, t), this.opts = t, this.query = t.query, this.socket = t.socket, this.supportsBinary = !t.forceBase64;
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
    return super.emitReserved("error", new Ny(t, n, s)), this;
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
    const n = Qa(t, this.socket.binaryType);
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
    const n = Oy(t);
    return n.length ? "?" + n : "";
  }
}
class Py extends el {
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
    wy(t, this.socket.binaryType).forEach(n), this.readyState !== "closed" && (this._polling = !1, this.emitReserved("pollComplete"), this.readyState === "open" && this._poll());
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
    this.writable = !1, by(t, (n) => {
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
    return this.opts.timestampRequests !== !1 && (n[this.opts.timestampParam] = Pf()), !this.supportsBinary && !n.sid && (n.b64 = 1), this.createUri(t, n);
  }
}
let Mf = !1;
try {
  Mf = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest();
} catch {
}
const My = Mf;
function Dy() {
}
class Fy extends Py {
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
    super(), this.createRequest = t, mo(this, s), this._opts = s, this._method = s.method || "GET", this._uri = n, this._data = s.data !== void 0 ? s.data : null, this._create();
  }
  /**
   * Creates the XHR object and sends the request.
   *
   * @private
   */
  _create() {
    var t;
    const n = Nf(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
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
      if (this._xhr.onreadystatechange = Dy, t)
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
    attachEvent("onunload", $c);
  else if (typeof addEventListener == "function") {
    const e = "onpagehide" in cn ? "pagehide" : "unload";
    addEventListener(e, $c, !1);
  }
}
function $c() {
  for (let e in En.requests)
    En.requests.hasOwnProperty(e) && En.requests[e].abort();
}
const $y = function() {
  const e = Df({
    xdomain: !1
  });
  return e && e.responseType !== null;
}();
class By extends Fy {
  constructor(t) {
    super(t);
    const n = t && t.forceBase64;
    this.supportsBinary = $y && !n;
  }
  request(t = {}) {
    return Object.assign(t, { xd: this.xd }, this.opts), new En(Df, this.uri(), t);
  }
}
function Df(e) {
  const t = e.xdomain;
  try {
    if (typeof XMLHttpRequest < "u" && (!t || My))
      return new XMLHttpRequest();
  } catch {
  }
  if (!t)
    try {
      return new cn[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
    } catch {
    }
}
const Ff = typeof navigator < "u" && typeof navigator.product == "string" && navigator.product.toLowerCase() === "reactnative";
class Uy extends el {
  get name() {
    return "websocket";
  }
  doOpen() {
    const t = this.uri(), n = this.opts.protocols, s = Ff ? {} : Nf(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
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
      Ja(s, this.supportsBinary, (i) => {
        try {
          this.doWrite(s, i);
        } catch {
        }
        r && po(() => {
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
    return this.opts.timestampRequests && (n[this.opts.timestampParam] = Pf()), this.supportsBinary || (n.b64 = 1), this.createUri(t, n);
  }
}
const Xo = cn.WebSocket || cn.MozWebSocket;
class zy extends Uy {
  createSocket(t, n, s) {
    return Ff ? new Xo(t, n, s) : n ? new Xo(t, n) : new Xo(t);
  }
  doWrite(t, n) {
    this.ws.send(n);
  }
}
class Hy extends el {
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
        const n = Ty(Number.MAX_SAFE_INTEGER, this.socket.binaryType), s = t.readable.pipeThrough(n).getReader(), r = ky();
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
        r && po(() => {
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
const jy = {
  websocket: zy,
  webtransport: Hy,
  polling: By
}, Wy = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/, qy = [
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
function wa(e) {
  if (e.length > 8e3)
    throw "URI too long";
  const t = e, n = e.indexOf("["), s = e.indexOf("]");
  n != -1 && s != -1 && (e = e.substring(0, n) + e.substring(n, s).replace(/:/g, ";") + e.substring(s, e.length));
  let r = Wy.exec(e || ""), i = {}, o = 14;
  for (; o--; )
    i[qy[o]] = r[o] || "";
  return n != -1 && s != -1 && (i.source = t, i.host = i.host.substring(1, i.host.length - 1).replace(/;/g, ":"), i.authority = i.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), i.ipv6uri = !0), i.pathNames = Vy(i, i.path), i.queryKey = Ky(i, i.query), i;
}
function Vy(e, t) {
  const n = /\/{2,9}/g, s = t.replace(n, "/").split("/");
  return (t.slice(0, 1) == "/" || t.length === 0) && s.splice(0, 1), t.slice(-1) == "/" && s.splice(s.length - 1, 1), s;
}
function Ky(e, t) {
  const n = {};
  return t.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function(s, r, i) {
    r && (n[r] = i);
  }), n;
}
const ka = typeof addEventListener == "function" && typeof removeEventListener == "function", Ni = [];
ka && addEventListener("offline", () => {
  Ni.forEach((e) => e());
}, !1);
class us extends mt {
  /**
   * Socket constructor.
   *
   * @param {String|Object} uri - uri or options
   * @param {Object} opts - options
   */
  constructor(t, n) {
    if (super(), this.binaryType = Sy, this.writeBuffer = [], this._prevBufferLen = 0, this._pingInterval = -1, this._pingTimeout = -1, this._maxPayload = -1, this._pingTimeoutTime = 1 / 0, t && typeof t == "object" && (n = t, t = null), t) {
      const s = wa(t);
      n.hostname = s.host, n.secure = s.protocol === "https" || s.protocol === "wss", n.port = s.port, s.query && (n.query = s.query);
    } else n.host && (n.hostname = wa(n.host).host);
    mo(this, n), this.secure = n.secure != null ? n.secure : typeof location < "u" && location.protocol === "https:", n.hostname && !n.port && (n.port = this.secure ? "443" : "80"), this.hostname = n.hostname || (typeof location < "u" ? location.hostname : "localhost"), this.port = n.port || (typeof location < "u" && location.port ? location.port : this.secure ? "443" : "80"), this.transports = [], this._transportsByName = {}, n.transports.forEach((s) => {
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
    }, n), this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : ""), typeof this.opts.query == "string" && (this.opts.query = Ly(this.opts.query)), ka && (this.opts.closeOnBeforeunload && (this._beforeunloadEventListener = () => {
      this.transport && (this.transport.removeAllListeners(), this.transport.close());
    }, addEventListener("beforeunload", this._beforeunloadEventListener, !1)), this.hostname !== "localhost" && (this._offlineEventListener = () => {
      this._onClose("transport close", {
        description: "network connection lost"
      });
    }, Ni.push(this._offlineEventListener))), this.opts.withCredentials && (this._cookieJar = void 0), this._open();
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
    n.EIO = Lf, n.transport = t, this.id && (n.sid = this.id);
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
      if (r && (n += Ry(r)), s > 0 && n > this._maxPayload)
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
    return t && (this._pingTimeoutTime = 0, po(() => {
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
      if (this.clearTimeoutFn(this._pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), ka && (this._beforeunloadEventListener && removeEventListener("beforeunload", this._beforeunloadEventListener, !1), this._offlineEventListener)) {
        const s = Ni.indexOf(this._offlineEventListener);
        s !== -1 && Ni.splice(s, 1);
      }
      this.readyState = "closed", this.id = null, this.emitReserved("close", t, n), this.writeBuffer = [], this._prevBufferLen = 0;
    }
  }
}
us.protocol = Lf;
class Gy extends us {
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
      s || (n.send([{ type: "ping", data: "probe" }]), n.once("packet", (b) => {
        if (!s)
          if (b.type === "pong" && b.data === "probe") {
            if (this.upgrading = !0, this.emitReserved("upgrading", n), !n)
              return;
            us.priorWebsocketSuccess = n.name === "websocket", this.transport.pause(() => {
              s || this.readyState !== "closed" && (f(), this.setTransport(n), n.send([{ type: "upgrade" }]), this.emitReserved("upgrade", n), n = null, this.upgrading = !1, this.flush());
            });
          } else {
            const A = new Error("probe error");
            A.transport = n.name, this.emitReserved("upgradeError", A);
          }
      }));
    };
    function i() {
      s || (s = !0, f(), n.close(), n = null);
    }
    const o = (b) => {
      const A = new Error("probe error: " + b);
      A.transport = n.name, i(), this.emitReserved("upgradeError", A);
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
    const f = () => {
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
let Yy = class extends Gy {
  constructor(t, n = {}) {
    const s = typeof t == "object", r = s ? { ...t } : { ...n };
    (!r.transports || r.transports && typeof r.transports[0] == "string") && (r.transports = (r.transports || ["polling", "websocket", "webtransport"]).map((i) => jy[i]).filter((i) => !!i)), super(s ? r : t, r);
  }
};
function Xy(e, t = "", n) {
  let s = e;
  n = n || typeof location < "u" && location, e == null && (e = n.protocol + "//" + n.host), typeof e == "string" && (e.charAt(0) === "/" && (e.charAt(1) === "/" ? e = n.protocol + e : e = n.host + e), /^(https?|wss?):\/\//.test(e) || (typeof n < "u" ? e = n.protocol + "//" + e : e = "https://" + e), s = wa(e)), s.port || (/^(http|ws)$/.test(s.protocol) ? s.port = "80" : /^(http|ws)s$/.test(s.protocol) && (s.port = "443")), s.path = s.path || "/";
  const i = s.host.indexOf(":") !== -1 ? "[" + s.host + "]" : s.host;
  return s.id = s.protocol + "://" + i + ":" + s.port + t, s.href = s.protocol + "://" + i + (n && n.port === s.port ? "" : ":" + s.port), s;
}
const Zy = typeof ArrayBuffer == "function", Jy = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e.buffer instanceof ArrayBuffer, $f = Object.prototype.toString, Qy = typeof Blob == "function" || typeof Blob < "u" && $f.call(Blob) === "[object BlobConstructor]", ev = typeof File == "function" || typeof File < "u" && $f.call(File) === "[object FileConstructor]";
function tl(e) {
  return Zy && (e instanceof ArrayBuffer || Jy(e)) || Qy && e instanceof Blob || ev && e instanceof File;
}
function Pi(e, t) {
  if (!e || typeof e != "object")
    return !1;
  if (Array.isArray(e)) {
    for (let n = 0, s = e.length; n < s; n++)
      if (Pi(e[n]))
        return !0;
    return !1;
  }
  if (tl(e))
    return !0;
  if (e.toJSON && typeof e.toJSON == "function" && arguments.length === 1)
    return Pi(e.toJSON(), !0);
  for (const n in e)
    if (Object.prototype.hasOwnProperty.call(e, n) && Pi(e[n]))
      return !0;
  return !1;
}
function tv(e) {
  const t = [], n = e.data, s = e;
  return s.data = Mi(n, t), s.attachments = t.length, { packet: s, buffers: t };
}
function Mi(e, t, n) {
  if (!e)
    return e;
  if (tl(e)) {
    const s = { _placeholder: !0, num: t.length };
    return t.push(e), s;
  } else if (Array.isArray(e)) {
    const s = new Array(e.length);
    for (let r = 0; r < e.length; r++)
      s[r] = Mi(e[r], t);
    return s;
  } else if (typeof e == "object" && !(e instanceof Date)) {
    if (e.toJSON && typeof e.toJSON == "function" && !n)
      return Mi(e.toJSON(), t, !0);
    const s = {};
    for (const r in e)
      Object.prototype.hasOwnProperty.call(e, r) && (s[r] = Mi(e[r], t));
    return s;
  }
  return e;
}
function nv(e, t) {
  return e.data = Ta(e.data, t), delete e.attachments, e;
}
function Ta(e, t) {
  if (!e)
    return e;
  if (e && e._placeholder === !0) {
    if (typeof e.num == "number" && e.num >= 0 && e.num < t.length)
      return t[e.num];
    throw new Error("illegal attachments");
  } else if (Array.isArray(e))
    for (let n = 0; n < e.length; n++)
      e[n] = Ta(e[n], t);
  else if (typeof e == "object")
    for (const n in e)
      Object.prototype.hasOwnProperty.call(e, n) && (e[n] = Ta(e[n], t));
  return e;
}
const sv = [
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
class rv {
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
    return (t.type === Pe.EVENT || t.type === Pe.ACK) && Pi(t) ? this.encodeAsBinary({
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
    const n = tv(t), s = this.encodeAsString(n.packet), r = n.buffers;
    return r.unshift(s), r;
  }
}
class nl extends mt {
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
      s || n.type === Pe.BINARY_ACK ? (n.type = s ? Pe.EVENT : Pe.ACK, this.reconstructor = new iv(n)) : super.emitReserved("decoded", n);
    } else if (tl(t) || t.base64)
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
      if (!ov(a) || a < 1)
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
      if (nl.isPayloadValid(s.type, i))
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
        return Bc(n);
      case Pe.DISCONNECT:
        return n === void 0;
      case Pe.CONNECT_ERROR:
        return typeof n == "string" || Bc(n);
      case Pe.EVENT:
      case Pe.BINARY_EVENT:
        return Array.isArray(n) && (typeof n[0] == "number" || typeof n[0] == "string" && sv.indexOf(n[0]) === -1);
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
class iv {
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
      const n = nv(this.reconPack, this.buffers);
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
const ov = Number.isInteger || function(e) {
  return typeof e == "number" && isFinite(e) && Math.floor(e) === e;
};
function Bc(e) {
  return Object.prototype.toString.call(e) === "[object Object]";
}
const av = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Decoder: nl,
  Encoder: rv,
  get PacketType() {
    return Pe;
  }
}, Symbol.toStringTag, { value: "Module" }));
function gn(e, t, n) {
  return e.on(t, n), function() {
    e.off(t, n);
  };
}
const lv = Object.freeze({
  connect: 1,
  connect_error: 1,
  disconnect: 1,
  disconnecting: 1,
  // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
  newListener: 1,
  removeListener: 1
});
class Bf extends mt {
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
    if (lv.hasOwnProperty(t))
      throw new Error('"' + t.toString() + '" is a reserved event name');
    if (n.unshift(t), this._opts.retries && !this.flags.fromQueue && !this.flags.volatile)
      return this._addToQueue(n), this;
    const o = {
      type: Pe.EVENT,
      data: n
    };
    if (o.options = {}, o.options.compress = this.flags.compress !== !1, typeof n[n.length - 1] == "function") {
      const f = this.ids++, b = n.pop();
      this._registerAckCallback(f, b), o.id = f;
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
class Aa extends mt {
  constructor(t, n) {
    var s;
    super(), this.nsps = {}, this.subs = [], t && typeof t == "object" && (n = t, t = void 0), n = n || {}, n.path = n.path || "/socket.io", this.opts = n, mo(this, n), this.reconnection(n.reconnection !== !1), this.reconnectionAttempts(n.reconnectionAttempts || 1 / 0), this.reconnectionDelay(n.reconnectionDelay || 1e3), this.reconnectionDelayMax(n.reconnectionDelayMax || 5e3), this.randomizationFactor((s = n.randomizationFactor) !== null && s !== void 0 ? s : 0.5), this.backoff = new ar({
      min: this.reconnectionDelay(),
      max: this.reconnectionDelayMax(),
      jitter: this.randomizationFactor()
    }), this.timeout(n.timeout == null ? 2e4 : n.timeout), this._readyState = "closed", this.uri = t;
    const r = n.parser || av;
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
    this.engine = new Yy(this.uri, this.opts);
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
    po(() => {
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
    return s ? this._autoConnect && !s.active && s.connect() : (s = new Bf(this, t, n), this.nsps[t] = s), s;
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
function Di(e, t) {
  typeof e == "object" && (t = e, e = void 0), t = t || {};
  const n = Xy(e, t.path || "/socket.io"), s = n.source, r = n.id, i = n.path, o = xr[r] && i in xr[r].nsps, a = t.forceNew || t["force new connection"] || t.multiplex === !1 || o;
  let l;
  return a ? l = new Aa(s, t) : (xr[r] || (xr[r] = new Aa(s, t)), l = xr[r]), n.query && !t.query && (t.query = n.queryKey), l.socket(n.path, t);
}
Object.assign(Di, {
  Manager: Aa,
  Socket: Bf,
  io: Di,
  connect: Di
});
const cv = 5e3;
function uv() {
  const e = ie([]), t = ie(!1), n = ie(""), s = ie(!1), r = ie(!1), i = ie(!1), o = ie("connecting"), a = ie(0), l = 5, u = ie({}), f = ie(null), b = ie(""), A = [];
  let x = null;
  const L = 6e4, z = () => {
    t.value = !1, x && (clearTimeout(x), x = null);
  }, ue = () => {
    t.value = !0, x && clearTimeout(x), x = setTimeout(z, L);
  };
  let R = null;
  const fe = 1e3, me = 15e3;
  let C = null;
  const M = /* @__PURE__ */ new Set(["ai_config_missing", ...Xu]);
  let S = !1, j = !1;
  const ne = ie(null), ce = () => {
    C && (clearTimeout(C), C = null);
  }, ge = () => {
    if (C || S) return;
    const W = Math.min(
      fe * 2 ** Math.max(0, a.value - 1),
      me
    );
    C = setTimeout(() => {
      C = null, R == null || R.connect();
    }, W);
  };
  let Oe = null, ke = null, Ge = null, ze = null, st = null, he = !1, ve = null, ye, Qe, Ye;
  const ot = (W) => {
    var c;
    return (c = Oi(W ?? null)) == null ? void 0 : c.sub;
  }, We = (W) => {
    ye = W, W && R != null && R.connected && R.emit("refresh_token", { conversation_token: W });
  }, jt = (W) => {
    Qe = W;
  }, en = () => {
    var _;
    const W = ye || (Ji() ? null : Zi().read()), c = {};
    W && (c.conversation_token = W), Qe && (c.widget_id = Qe);
    try {
      c.page_url = Af() || (window.parent !== window && ((_ = window.parent.location) != null && _.href) ? window.parent.location.href : document.referrer || window.location.href);
    } catch {
      c.page_url = document.referrer || "";
    }
    return c;
  }, Fe = (W) => {
    R = Di(`${Ds.WS_URL}/widget`, {
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
    }), R.on("connect", () => {
      Ye = ot(en().conversation_token), o.value = "connected", ce(), a.value = 0;
    }), R.on("bot_typing", () => {
      ue();
    }), R.on("disconnect", (c) => {
      z(), o.value === "connected" && (console.log("Socket disconnected, setting connection status to connecting"), o.value = "connecting");
      const _ = j;
      j = !1, c === "io server disconnect" && _ && (R == null || R.connect());
    }), R.on("error", (c) => {
      (c == null ? void 0 : c.type) === "conversation_gone" && (j = !0);
    }), R.on("connect_error", (c) => {
      var O;
      const _ = (O = c == null ? void 0 : c.data) == null ? void 0 : O.type;
      if (_ && M.has(_)) {
        S = !0, ne.value = _, ce(), o.value = "failed", fa(_) ? he || st == null || st() : v(c.data);
        return;
      }
      a.value++, console.error("Socket connection failed, attempt:", a.value), a.value >= l && (o.value = "failed"), R && !R.active && ge();
    }), R.on("chat_response", (c) => {
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
        c.attachments && Array.isArray(c.attachments) && (_.id = c.message_id, _.attachments = c.attachments.map((O, I) => ({
          id: c.message_id * 1e3 + I,
          filename: O.filename,
          file_url: O.file_url,
          content_type: O.content_type,
          file_size: O.file_size
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
    }), R.on("handle_taken_over", (c) => {
      e.value.push({
        message: `${c.user_name} joined the conversation`,
        message_type: "system",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: c.session_id
      }), u.value = {
        ...u.value,
        human_agent_name: c.user_name,
        human_agent_profile_pic: c.profile_picture
      }, z(), Oe && Oe(c);
    }), R.on("session_initialized", (c) => {
      c.session_id && (b.value = c.session_id, ve = {
        session_id: c.session_id,
        authenticated: !!c.authenticated,
        created: !!c.created
      }, ze == null || ze(ve));
    }), R.on("error", v);
    for (const [c, _] of A) R.on(c, _);
    return R.on("chat_history", N), R.on("rating_submitted", D), R.on("display_form", U), R.on("form_submitted", P), R.on("workflow_state", Y), R.on("workflow_proceeded", q), R;
  }, yt = async () => {
    try {
      return R != null && R.connected && Ye && Ye === ot(en().conversation_token) ? (o.value = "connected", !0) : (o.value = "connecting", a.value = 0, z(), ce(), S = !1, ne.value = null, R && (R.removeAllListeners(), R.disconnect(), R = null), he = !0, R = Fe(""), new Promise((W) => {
        const c = (_) => {
          he = !1, W(_);
        };
        R == null || R.on("connect", () => {
          c(!0);
        }), R == null || R.on("connect_error", () => {
          (S || a.value >= l) && c(!1);
        });
      }));
    } catch (W) {
      return console.error("Socket initialization failed:", W), he = !1, o.value = "failed", !1;
    }
  }, Bt = () => (R && R.disconnect(), yt()), Wt = (W) => {
    Oe = W;
  }, qt = (W) => {
    st = W;
  }, Lt = (W) => {
    ze = W, ve && W(ve);
  }, yn = (W) => {
    ke = W;
  }, y = (W) => {
    Ge = W;
  }, v = (W) => {
    z(), n.value = Np(W), s.value = !0, setTimeout(() => {
      s.value = !1, n.value = "";
    }, 5e3);
  }, N = (W) => {
    if (W.type === "chat_history" && Array.isArray(W.messages)) {
      const c = W.messages.map((_) => {
        var I, $;
        const O = {
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
        return Array.isArray((I = _.attributes) == null ? void 0 : I.sources) && _.attributes.sources.length && (O.sources = _.attributes.sources), ($ = _.attributes) != null && $.shopify_output && typeof _.attributes.shopify_output == "object" ? {
          ...O,
          message_type: "product",
          shopify_output: _.attributes.shopify_output
        } : O;
      });
      e.value = [
        ...c.filter(
          (_) => !e.value.some(
            (O) => O.message === _.message && O.created_at === _.created_at
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
    console.log("Form display handler in composable:", W), z(), f.value = W.form_data, console.log("Set currentForm in handleDisplayForm:", f.value), ((c = W.form_data) == null ? void 0 : c.form_full_screen) === !0 ? (console.log("Full screen form detected, triggering workflow state callback"), ke && ke({
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
    console.log("Form submitted confirmation received, clearing currentForm"), f.value = null, W.success && console.log("Form submitted successfully");
  }, Y = (W) => {
    console.log("Workflow state received in composable:", W), (W.type === "form" || W.type === "display_form") && (console.log("Setting currentForm from workflow state:", W.form_data), f.value = W.form_data), ke && ke(W);
  }, q = (W) => {
    console.log("Workflow proceeded in composable:", W), Ge && Ge(W);
  }, V = async (W, c) => {
    !R || !W || R.emit("submit_rating", {
      rating: W,
      feedback: c
    });
  }, H = async (W) => {
    var O;
    if (console.log("Submitting form in socket:", W), console.log("Current form in socket:", f.value), console.log("Socket in socket:", R), !R) {
      console.error("No socket available for form submission");
      return;
    }
    if (!W || Object.keys(W).length === 0) {
      console.error("No form data to submit");
      return;
    }
    const _ = ((O = f.value) == null ? void 0 : O.form_type) === "contact" ? "submit_contact_info" : "submit_form";
    console.log(`Emitting ${_} event with data:`, W), R.emit(_, {
      form_data: W
    }), f.value = null;
  }, se = async () => {
    R && (console.log("Getting workflow state 12"), R.emit("get_workflow_state"));
  }, Z = async () => {
    R && R.emit("proceed_workflow", {});
  }, J = async (W, c, _ = [], O = {}) => {
    if (!R || !W.trim() && _.length === 0) return;
    const I = {
      message: W,
      message_type: "user",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: ""
    };
    _.length > 0 && (I.attachments = _.map(($, re) => {
      let te = "";
      if ($.content_type.startsWith("image/")) {
        const Ae = atob($.content), Ce = new Array(Ae.length);
        for (let Be = 0; Be < Ae.length; Be++)
          Ce[Be] = Ae.charCodeAt(Be);
        const He = new Uint8Array(Ce), De = new Blob([He], { type: $.content_type });
        te = URL.createObjectURL(De);
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
    })), e.value.push(I), R.emit("chat", {
      ...O,
      message: W,
      email: c,
      files: _
      // Send files with base64 content
    }), i.value = !0;
  }, de = () => {
    e.value = [], i.value = !1, b.value = "", z(), f.value = null;
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
      if (!R || !R.connected) {
        c(!1);
        return;
      }
      let _ = !1;
      const O = (te) => {
        _ || (_ = !0, clearTimeout(re), R == null || R.off("chat_ended", I), R == null || R.off("error", $), te && de(), c(te));
      }, I = () => O(!0), $ = (te) => {
        (te == null ? void 0 : te.type) === "end_chat_error" && O(!1);
      }, re = setTimeout(() => O(!1), cv);
      R.on("chat_ended", I), R.on("error", $), R.emit("end_chat", { reason: W });
    }),
    loadChatHistory: async () => {
      if (R)
        try {
          r.value = !0, R.emit("get_chat_history");
        } catch (W) {
          console.error("Failed to load chat history:", W);
        } finally {
          r.value = !1;
        }
    },
    connect: yt,
    reconnect: Bt,
    cleanup: () => {
      z(), ce(), R && (R.removeAllListeners(), R.disconnect(), R = null), Oe = null, ke = null, Ge = null;
    },
    humanAgent: u,
    onTakeover: Wt,
    onSessionState: Lt,
    onReauthorize: qt,
    refusal: ne,
    submitRating: V,
    currentForm: f,
    submitForm: H,
    getWorkflowState: se,
    proceedWorkflow: Z,
    onWorkflowState: yn,
    onWorkflowProceeded: y,
    currentSessionId: b,
    setToken: We,
    setWidgetId: jt,
    on: (W, c) => {
      A.push([W, c]), R == null || R.on(W, c);
    },
    emit: (W, c) => {
      R == null || R.emit(W, c);
    }
  };
}
const fv = 8, hv = 200;
function dv(e) {
  const t = e && typeof e == "object" ? e.details : null;
  if (!t || typeof t != "object" || Array.isArray(t)) return null;
  const n = Object.entries(t).filter(([s, r]) => s.trim() && ["string", "number", "boolean"].includes(typeof r) && String(r).trim()).slice(0, fv).map(([s, r]) => ({ key: s.trim().slice(0, 60), value: String(r).trim().slice(0, hv) }));
  return n.length ? n : null;
}
const pv = 140;
function mv(e) {
  const t = e && typeof e == "object" ? e.summary : null;
  return typeof t == "string" && t.trim() ? t.trim().slice(0, pv) : null;
}
const gv = 2e3, _v = 4;
function yv(e) {
  if (typeof e.message != "string" || !e.message.trim()) return null;
  const t = Array.isArray(e.suggestions) ? e.suggestions.filter((n) => typeof n == "string" && !!n.trim()).map((n) => ({ label: n.slice(0, 80), kind: "text", value: n.slice(0, 500) })).slice(0, _v) : [];
  return { message: e.message.slice(0, gv), chips: t, open: e.open === !0, source: "host" };
}
const vv = 2e3;
function bv(e) {
  const t = e.setTimer ?? ((S, j) => setTimeout(S, j)), n = e.clearTimer ?? ((S) => clearTimeout(S));
  let s = [], r = null, i = null;
  const o = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map();
  function u() {
    const S = e.trustedHostOrigin();
    S && s.length && e.emit("actions_available", { names: s, host_origin: S }), r && e.emit("set_context", { context: r });
  }
  function f(S) {
    s = Array.isArray(S) ? S.filter((j) => typeof j == "string") : [], u();
  }
  function b(S) {
    r = S && typeof S == "object" && !Array.isArray(S) ? S : null, r && e.emit("set_context", { context: r });
  }
  function A(S, j, ne, ce = {}) {
    var ge;
    (ge = e.onOutcome) == null || ge.call(e, {
      label: S,
      status: j,
      preview: ne,
      summary: j === "ok" ? mv(ce.result) : null,
      error: typeof ce.error == "string" && ce.error ? ce.error : null
    });
  }
  function x(S, j, ne = {}) {
    const ce = o.get(S);
    ce && (n(ce.timer), A(ce.label, j, ce.preview, ne)), o.delete(S);
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
    const ce = Math.max(1, S.timeout_s) * 1e3 + vv;
    o.set(S.call_id, {
      timer: t(() => x(S.call_id, "timeout"), ce),
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
  function R(S) {
    var j;
    switch (S.type) {
      case "HOST_ACTIONS":
        return f(S.names), !0;
      case "HOST_CONTEXT":
        return b(S.context), !0;
      case "HOST_PROMPT": {
        const ne = yv(S);
        return ne && ((j = e.onPrompt) == null || j.call(e, ne)), !0;
      }
      case "ACTION_PREVIEW_DONE": {
        const ne = l.get(String(S.callId));
        if (!ne) return !0;
        if (l.delete(ne.call_id), ne.confirm === "always") {
          const ge = dv(S.preview);
          return ge && (i == null ? void 0 : i.request.call_id) === ne.call_id && (i = { ...i, details: ge }, e.onConfirmChange(i)), !0;
        }
        const ce = S.preview;
        return ce && typeof ce == "object" ? L({ request: ne, preview: ce, details: null }) : z(ne, null), !0;
      }
      case "ACTION_DONE": {
        const ne = String(S.callId);
        if (!o.has(ne)) return !0;
        const ce = ["ok", "error", "timeout"].includes(S.status) ? S.status : "error";
        return x(ne, ce, {
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
    L(null), l.delete(S.call_id), A(S.label, "declined", j);
    const ne = a.get(S.call_id);
    if (ne) {
      a.delete(S.call_id), ne("declined");
      return;
    }
    e.emit("action_result", { call_id: S.call_id, status: "declined", confirmed: !1 });
  }
  function C(S, j) {
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
  return { announce: u, handleRequest: ue, handleHostMessage: R, approve: fe, decline: me, runLocal: C, dispose: M };
}
function wv(e, t, n) {
  const s = ie(null), r = bv({
    postToHost: bt,
    emit: e.emit,
    // Actions need a page whose origin we know: the framed widget with a real host.
    trustedHostOrigin: () => {
      if (!Ji()) return null;
      const o = df();
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
  return window.addEventListener("message", i), ao(() => {
    window.removeEventListener("message", i), r.dispose();
  }), { pendingConfirm: s, approveAction: r.approve, declineAction: r.decline, runLocalAction: r.runLocal };
}
function Uc(e, t) {
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
const kv = 6e4;
function Tv(e) {
  const t = e.setTimer ?? ((x, L) => setTimeout(x, L)), n = e.clearTimer ?? ((x) => clearTimeout(x));
  let s = null, r = null;
  function i() {
    s !== null && n(s), s = null;
  }
  let o = null, a = null;
  function l() {
    i();
    const x = a;
    !x || r === x.stepId || (o = x.stepId, s = t(() => {
      s = null, r = x.stepId, e.addNotice(x.nudge.message, "message");
    }, x.nudge.after_min * kv));
  }
  function u(x) {
    if (a = x.nudge && x.step_id ? { stepId: x.step_id, nudge: x.nudge } : null, !a) {
      i(), o = null;
      return;
    }
    o === a.stepId && s !== null || l();
  }
  let f = !1;
  function b(x) {
    var ue;
    const L = (x == null ? void 0 : x.view) ?? null;
    if ((ue = L == null ? void 0 : L.notice) != null && ue.text && e.addNotice(L.notice.text, L.notice.kind), !L && f) return;
    if (f = !!(L != null && L.finished) && !!L.journey_name, !L || L.finished || L.waiting) {
      i(), a = null, o = null;
      const R = L != null && L.journey_name ? Uc(L, !!L.finished) : null;
      e.showStep(null, R), L != null && L.finished && L.message && e.addNotice(L.message, "message");
      return;
    }
    const z = L.message ? { message: L.message, chips: L.chips ?? [], open: !1, source: "journey" } : null;
    e.showStep(z, Uc(L, !1)), L.fresh && L.auto_open && e.openChat(), u(L);
  }
  function A() {
    s !== null && l();
  }
  return {
    handleState: b,
    activity: A,
    sync: (x = {}) => e.emit("journey_sync", x),
    skip: () => e.emit("journey_skip", {}),
    dismiss: () => {
      f = !1, e.showStep(null, null), e.emit("journey_dismiss", {});
    },
    start: (x) => e.emit("journey_start", { key: x }),
    dispose: i
  };
}
function Av(e) {
  const t = ie(null), n = ie(!1);
  let s = !1;
  const r = [], o = Tv({
    emit: (u, f) => {
      s ? e.emit(u, f) : r.push([u, f]);
    },
    showStep: (u, f) => {
      t.value = f;
      const b = e.currentPrompt();
      b && b.source !== "journey" || e.showPrompt(u);
    },
    addNotice: e.addNotice,
    openChat: () => bt({ type: "WIDGET_OPEN_REQUEST" })
  });
  e.on("journey_state", o.handleState), e.on("session_initialized", () => {
    s = !0, o.sync({ url: Af() });
    for (const [u, f] of r.splice(0)) e.emit(u, f);
  });
  const a = (u) => {
    if (u.source !== window.parent) return;
    const f = u.data;
    !f || typeof f.type != "string" || (f.type === "HOST_PAGE" && typeof f.url == "string" && o.sync({ url: f.url }), f.type === "HOST_CONTEXT" && o.sync({}), f.type === "HOST_EVENT" && typeof f.event == "string" && o.sync({ event: f.event }), f.type === "HOST_JOURNEY_START" && typeof f.key == "string" && o.start(f.key));
  };
  window.addEventListener("message", a);
  function l(u, f) {
    if (o.activity(), u.kind === "text") {
      f(u.value);
      return;
    }
    if (n.value) return;
    e.runLocalAction(u, (A) => {
      n.value = !1, A === "ok" && o.sync({ action: u.value });
    }) && (n.value = !0);
  }
  return ao(() => {
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
const wi = (e, t) => Ne(e) === Ne(t);
function Sv(e, t) {
  let n;
  const s = qh(null), r = () => {
    n = e.value[e.value.length - 1], s.value = null;
  };
  return pt(() => {
    var l;
    return (l = t.value) == null ? void 0 : l.message;
  }, r), pt(e, (l) => {
    (!s.value || !l.some((u) => wi(u, s.value))) && r();
  }, { flush: "sync" }), pt(() => e.value.length, () => {
    if (!t.value || s.value) return;
    const l = e.value, u = l[l.findIndex((f) => wi(f, n)) + 1];
    u && (s.value = u);
  }), { isBefore: (l) => !!t.value && wi(l, s.value), isLast: () => !!t.value && !s.value, index: () => {
    const l = e.value.findIndex((u) => wi(u, s.value));
    return l === -1 ? e.value.length : l;
  } };
}
function Ev(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Zo = { exports: {} }, zc;
function xv() {
  return zc || (zc = 1, function(e) {
    (function() {
      function t(c, _, O) {
        return c.call.apply(c.bind, arguments);
      }
      function n(c, _, O) {
        if (!c) throw Error();
        if (2 < arguments.length) {
          var I = Array.prototype.slice.call(arguments, 2);
          return function() {
            var $ = Array.prototype.slice.call(arguments);
            return Array.prototype.unshift.apply($, I), c.apply(_, $);
          };
        }
        return function() {
          return c.apply(_, arguments);
        };
      }
      function s(c, _, O) {
        return s = Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1 ? t : n, s.apply(null, arguments);
      }
      var r = Date.now || function() {
        return +/* @__PURE__ */ new Date();
      };
      function i(c, _) {
        this.a = c, this.o = _ || c, this.c = this.o.document;
      }
      var o = !!window.FontFace;
      function a(c, _, O, I) {
        if (_ = c.c.createElement(_), O) for (var $ in O) O.hasOwnProperty($) && ($ == "style" ? _.style.cssText = O[$] : _.setAttribute($, O[$]));
        return I && _.appendChild(c.c.createTextNode(I)), _;
      }
      function l(c, _, O) {
        c = c.c.getElementsByTagName(_)[0], c || (c = document.documentElement), c.insertBefore(O, c.lastChild);
      }
      function u(c) {
        c.parentNode && c.parentNode.removeChild(c);
      }
      function f(c, _, O) {
        _ = _ || [], O = O || [];
        for (var I = c.className.split(/\s+/), $ = 0; $ < _.length; $ += 1) {
          for (var re = !1, te = 0; te < I.length; te += 1) if (_[$] === I[te]) {
            re = !0;
            break;
          }
          re || I.push(_[$]);
        }
        for (_ = [], $ = 0; $ < I.length; $ += 1) {
          for (re = !1, te = 0; te < O.length; te += 1) if (I[$] === O[te]) {
            re = !0;
            break;
          }
          re || _.push(I[$]);
        }
        c.className = _.join(" ").replace(/\s+/g, " ").replace(/^\s+|\s+$/, "");
      }
      function b(c, _) {
        for (var O = c.className.split(/\s+/), I = 0, $ = O.length; I < $; I++) if (O[I] == _) return !0;
        return !1;
      }
      function A(c) {
        return c.o.location.hostname || c.a.location.hostname;
      }
      function x(c, _, O) {
        function I() {
          Ae && $ && re && (Ae(te), Ae = null);
        }
        _ = a(c, "link", { rel: "stylesheet", href: _, media: "all" });
        var $ = !1, re = !0, te = null, Ae = O || null;
        o ? (_.onload = function() {
          $ = !0, I();
        }, _.onerror = function() {
          $ = !0, te = Error("Stylesheet failed to load"), I();
        }) : setTimeout(function() {
          $ = !0, I();
        }, 0), l(c, "head", _);
      }
      function L(c, _, O, I) {
        var $ = c.c.getElementsByTagName("head")[0];
        if ($) {
          var re = a(c, "script", { src: _ }), te = !1;
          return re.onload = re.onreadystatechange = function() {
            te || this.readyState && this.readyState != "loaded" && this.readyState != "complete" || (te = !0, O && O(null), re.onload = re.onreadystatechange = null, re.parentNode.tagName == "HEAD" && $.removeChild(re));
          }, $.appendChild(re), setTimeout(function() {
            te || (te = !0, O && O(Error("Script load timeout")));
          }, I || 5e3), re;
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
      function R(c, _) {
        c.c = _, fe(c);
      }
      function fe(c) {
        c.a == 0 && c.c && (c.c(), c.c = null);
      }
      function me(c) {
        this.a = c || "-";
      }
      me.prototype.c = function(c) {
        for (var _ = [], O = 0; O < arguments.length; O++) _.push(arguments[O].replace(/[\W_]+/g, "").toLowerCase());
        return _.join(this.a);
      };
      function C(c, _) {
        this.c = c, this.f = 4, this.a = "n";
        var O = (_ || "n4").match(/^([nio])([1-9])$/i);
        O && (this.a = O[1], this.f = parseInt(O[2], 10));
      }
      function M(c) {
        return ne(c) + " " + (c.f + "00") + " 300px " + S(c.c);
      }
      function S(c) {
        var _ = [];
        c = c.split(/,\s*/);
        for (var O = 0; O < c.length; O++) {
          var I = c[O].replace(/['"]/g, "");
          I.indexOf(" ") != -1 || /^\d/.test(I) ? _.push("'" + I + "'") : _.push(I);
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
        var _ = 4, O = "n", I = null;
        return c && ((I = c.match(/(normal|oblique|italic)/i)) && I[1] && (O = I[1].substr(0, 1).toLowerCase()), (I = c.match(/([1-9]00|normal|bold)/i)) && I[1] && (/bold/i.test(I[1]) ? _ = 7 : /[1-9]00/.test(I[1]) && (_ = parseInt(I[1].substr(0, 1), 10)))), O + _;
      }
      function ge(c, _) {
        this.c = c, this.f = c.o.document.documentElement, this.h = _, this.a = new me("-"), this.j = _.events !== !1, this.g = _.classes !== !1;
      }
      function Oe(c) {
        c.g && f(c.f, [c.a.c("wf", "loading")]), Ge(c, "loading");
      }
      function ke(c) {
        if (c.g) {
          var _ = b(c.f, c.a.c("wf", "active")), O = [], I = [c.a.c("wf", "loading")];
          _ || O.push(c.a.c("wf", "inactive")), f(c.f, O, I);
        }
        Ge(c, "inactive");
      }
      function Ge(c, _, O) {
        c.j && c.h[_] && (O ? c.h[_](O.c, j(O)) : c.h[_]());
      }
      function ze() {
        this.c = {};
      }
      function st(c, _, O) {
        var I = [], $;
        for ($ in _) if (_.hasOwnProperty($)) {
          var re = c.c[$];
          re && I.push(re(_[$], O));
        }
        return I;
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
      function Qe(c, _, O, I, $, re) {
        this.g = c, this.j = _, this.a = I, this.c = O, this.f = $ || 3e3, this.h = re || void 0;
      }
      Qe.prototype.start = function() {
        var c = this.c.o.document, _ = this, O = r(), I = new Promise(function(te, Ae) {
          function Ce() {
            r() - O >= _.f ? Ae() : c.fonts.load(M(_.a), _.h).then(function(He) {
              1 <= He.length ? te() : setTimeout(Ce, 25);
            }, function() {
              Ae();
            });
          }
          Ce();
        }), $ = null, re = new Promise(function(te, Ae) {
          $ = setTimeout(Ae, _.f);
        });
        Promise.race([re, I]).then(function() {
          $ && (clearTimeout($), $ = null), _.g(_.a);
        }, function() {
          _.j(_.a);
        });
      };
      function Ye(c, _, O, I, $, re, te) {
        this.v = c, this.B = _, this.c = O, this.a = I, this.s = te || "BESbswy", this.f = {}, this.w = $ || 3e3, this.u = re || null, this.m = this.j = this.h = this.g = null, this.g = new he(this.c, this.s), this.h = new he(this.c, this.s), this.j = new he(this.c, this.s), this.m = new he(this.c, this.s), c = new C(this.a.c + ",serif", j(this.a)), c = ye(c), this.g.a.style.cssText = c, c = new C(this.a.c + ",sans-serif", j(this.a)), c = ye(c), this.h.a.style.cssText = c, c = new C("serif", j(this.a)), c = ye(c), this.j.a.style.cssText = c, c = new C("sans-serif", j(this.a)), c = ye(c), this.m.a.style.cssText = c, ve(this.g), ve(this.h), ve(this.j), ve(this.m);
      }
      var ot = { D: "serif", C: "sans-serif" }, We = null;
      function jt() {
        if (We === null) {
          var c = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent);
          We = !!c && (536 > parseInt(c[1], 10) || parseInt(c[1], 10) === 536 && 11 >= parseInt(c[2], 10));
        }
        return We;
      }
      Ye.prototype.start = function() {
        this.f.serif = this.j.a.offsetWidth, this.f["sans-serif"] = this.m.a.offsetWidth, this.A = r(), Fe(this);
      };
      function en(c, _, O) {
        for (var I in ot) if (ot.hasOwnProperty(I) && _ === c.f[ot[I]] && O === c.f[ot[I]]) return !0;
        return !1;
      }
      function Fe(c) {
        var _ = c.g.a.offsetWidth, O = c.h.a.offsetWidth, I;
        (I = _ === c.f.serif && O === c.f["sans-serif"]) || (I = jt() && en(c, _, O)), I ? r() - c.A >= c.w ? jt() && en(c, _, O) && (c.u === null || c.u.hasOwnProperty(c.a.c)) ? Bt(c, c.v) : Bt(c, c.B) : yt(c) : Bt(c, c.v);
      }
      function yt(c) {
        setTimeout(s(function() {
          Fe(this);
        }, c), 50);
      }
      function Bt(c, _) {
        setTimeout(s(function() {
          u(this.g.a), u(this.h.a), u(this.j.a), u(this.m.a), _(this.a);
        }, c), 0);
      }
      function Wt(c, _, O) {
        this.c = c, this.a = _, this.f = 0, this.m = this.j = !1, this.s = O;
      }
      var qt = null;
      Wt.prototype.g = function(c) {
        var _ = this.a;
        _.g && f(_.f, [_.a.c("wf", c.c, j(c).toString(), "active")], [_.a.c("wf", c.c, j(c).toString(), "loading"), _.a.c("wf", c.c, j(c).toString(), "inactive")]), Ge(_, "fontactive", c), this.m = !0, Lt(this);
      }, Wt.prototype.h = function(c) {
        var _ = this.a;
        if (_.g) {
          var O = b(_.f, _.a.c("wf", c.c, j(c).toString(), "active")), I = [], $ = [_.a.c("wf", c.c, j(c).toString(), "loading")];
          O || I.push(_.a.c("wf", c.c, j(c).toString(), "inactive")), f(_.f, I, $);
        }
        Ge(_, "fontinactive", c), Lt(this);
      };
      function Lt(c) {
        --c.f == 0 && c.j && (c.m ? (c = c.a, c.g && f(c.f, [c.a.c("wf", "active")], [c.a.c("wf", "loading"), c.a.c("wf", "inactive")]), Ge(c, "active")) : ke(c.a));
      }
      function yn(c) {
        this.j = c, this.a = new ze(), this.h = 0, this.f = this.g = !0;
      }
      yn.prototype.load = function(c) {
        this.c = new i(this.j, c.context || this.j), this.g = c.events !== !1, this.f = c.classes !== !1, v(this, new ge(this.c, c), c);
      };
      function y(c, _, O, I, $) {
        var re = --c.h == 0;
        (c.f || c.g) && setTimeout(function() {
          var te = $ || null, Ae = I || null || {};
          if (O.length === 0 && re) ke(_.a);
          else {
            _.f += O.length, re && (_.j = re);
            var Ce, He = [];
            for (Ce = 0; Ce < O.length; Ce++) {
              var De = O[Ce], Be = Ae[De.c], rt = _.a, hn = De;
              if (rt.g && f(rt.f, [rt.a.c("wf", hn.c, j(hn).toString(), "loading")]), Ge(rt, "fontloading", hn), rt = null, qt === null) if (window.FontFace) {
                var hn = /Gecko.*Firefox\/(\d+)/.exec(window.navigator.userAgent), $s = /OS X.*Version\/10\..*Safari/.exec(window.navigator.userAgent) && /Apple/.exec(window.navigator.vendor);
                qt = hn ? 42 < parseInt(hn[1], 10) : !$s;
              } else qt = !1;
              qt ? rt = new Qe(s(_.g, _), s(_.h, _), _.c, De, _.s, Be) : rt = new Ye(s(_.g, _), s(_.h, _), _.c, De, _.s, te, Be), He.push(rt);
            }
            for (Ce = 0; Ce < He.length; Ce++) He[Ce].start();
          }
        }, 0);
      }
      function v(c, _, O) {
        var $ = [], I = O.timeout;
        Oe(_);
        var $ = st(c.a, O, c.c), re = new Wt(c.c, _, I);
        for (c.h = $.length, _ = 0, O = $.length; _ < O; _++) $[_].load(function(te, Ae, Ce) {
          y(c, re, te, Ae, Ce);
        });
      }
      function N(c, _) {
        this.c = c, this.a = _;
      }
      N.prototype.load = function(c) {
        function _() {
          if (re["__mti_fntLst" + I]) {
            var te = re["__mti_fntLst" + I](), Ae = [], Ce;
            if (te) for (var He = 0; He < te.length; He++) {
              var De = te[He].fontfamily;
              te[He].fontStyle != null && te[He].fontWeight != null ? (Ce = te[He].fontStyle + te[He].fontWeight, Ae.push(new C(De, Ce))) : Ae.push(new C(De));
            }
            c(Ae);
          } else setTimeout(function() {
            _();
          }, 50);
        }
        var O = this, I = O.a.projectId, $ = O.a.version;
        if (I) {
          var re = O.c.o;
          L(this.c, (O.a.api || "https://fast.fonts.net/jsapi") + "/" + I + ".js" + ($ ? "?v=" + $ : ""), function(te) {
            te ? c([]) : (re["__MonotypeConfiguration__" + I] = function() {
              return O.a;
            }, _());
          }).id = "__MonotypeAPIScript__" + I;
        } else c([]);
      };
      function D(c, _) {
        this.c = c, this.a = _;
      }
      D.prototype.load = function(c) {
        var _, O, I = this.a.urls || [], $ = this.a.families || [], re = this.a.testStrings || {}, te = new z();
        for (_ = 0, O = I.length; _ < O; _++) x(this.c, I[_], ue(te));
        var Ae = [];
        for (_ = 0, O = $.length; _ < O; _++) if (I = $[_].split(":"), I[1]) for (var Ce = I[1].split(","), He = 0; He < Ce.length; He += 1) Ae.push(new C(I[0], Ce[He]));
        else Ae.push(new C(I[0]));
        R(te, function() {
          c(Ae, re);
        });
      };
      function U(c, _) {
        c ? this.c = c : this.c = P, this.a = [], this.f = [], this.g = _ || "";
      }
      var P = "https://fonts.googleapis.com/css";
      function Y(c, _) {
        for (var O = _.length, I = 0; I < O; I++) {
          var $ = _[I].split(":");
          $.length == 3 && c.f.push($.pop());
          var re = "";
          $.length == 2 && $[1] != "" && (re = ":"), c.a.push($.join(re));
        }
      }
      function q(c) {
        if (c.a.length == 0) throw Error("No fonts to load!");
        if (c.c.indexOf("kit=") != -1) return c.c;
        for (var _ = c.a.length, O = [], I = 0; I < _; I++) O.push(c.a[I].replace(/ /g, "+"));
        return _ = c.c + "?family=" + O.join("%7C"), 0 < c.f.length && (_ += "&subset=" + c.f.join(",")), 0 < c.g.length && (_ += "&text=" + encodeURIComponent(c.g)), _;
      }
      function V(c) {
        this.f = c, this.a = [], this.c = {};
      }
      var H = { latin: "BESbswy", "latin-ext": "çöüğş", cyrillic: "йяЖ", greek: "αβΣ", khmer: "កខគ", Hanuman: "កខគ" }, se = { thin: "1", extralight: "2", "extra-light": "2", ultralight: "2", "ultra-light": "2", light: "3", regular: "4", book: "4", medium: "5", "semi-bold": "6", semibold: "6", "demi-bold": "6", demibold: "6", bold: "7", "extra-bold": "8", extrabold: "8", "ultra-bold": "8", ultrabold: "8", black: "9", heavy: "9", l: "3", r: "4", b: "7" }, Z = { i: "i", italic: "i", n: "n", normal: "n" }, J = /^(thin|(?:(?:extra|ultra)-?)?light|regular|book|medium|(?:(?:semi|demi|extra|ultra)-?)?bold|black|heavy|l|r|b|[1-9]00)?(n|i|normal|italic)?$/;
      function de(c) {
        for (var _ = c.f.length, O = 0; O < _; O++) {
          var I = c.f[O].split(":"), $ = I[0].replace(/\+/g, " "), re = ["n4"];
          if (2 <= I.length) {
            var te, Ae = I[1];
            if (te = [], Ae) for (var Ae = Ae.split(","), Ce = Ae.length, He = 0; He < Ce; He++) {
              var De;
              if (De = Ae[He], De.match(/^[\w-]+$/)) {
                var Be = J.exec(De.toLowerCase());
                if (Be == null) De = "";
                else {
                  if (De = Be[2], De = De == null || De == "" ? "n" : Z[De], Be = Be[1], Be == null || Be == "") Be = "4";
                  else var rt = se[Be], Be = rt || (isNaN(Be) ? "4" : Be.substr(0, 1));
                  De = [De, Be].join("");
                }
              } else De = "";
              De && te.push(De);
            }
            0 < te.length && (re = te), I.length == 3 && (I = I[2], te = [], I = I ? I.split(",") : te, 0 < I.length && (I = H[I[0]]) && (c.c[$] = I));
          }
          for (c.c[$] || (I = H[$]) && (c.c[$] = I), I = 0; I < re.length; I += 1) c.a.push(new C($, re[I]));
        }
      }
      function pe(c, _) {
        this.c = c, this.a = _;
      }
      var be = { Arimo: !0, Cousine: !0, Tinos: !0 };
      pe.prototype.load = function(c) {
        var _ = new z(), O = this.c, I = new U(this.a.api, this.a.text), $ = this.a.families;
        Y(I, $);
        var re = new V($);
        de(re), x(O, q(I), ue(_)), R(_, function() {
          c(re.a, re.c, be);
        });
      };
      function Te(c, _) {
        this.c = c, this.a = _;
      }
      Te.prototype.load = function(c) {
        var _ = this.a.id, O = this.c.o;
        _ ? L(this.c, (this.a.api || "https://use.typekit.net") + "/" + _ + ".js", function(I) {
          if (I) c([]);
          else if (O.Typekit && O.Typekit.config && O.Typekit.config.fn) {
            I = O.Typekit.config.fn;
            for (var $ = [], re = 0; re < I.length; re += 2) for (var te = I[re], Ae = I[re + 1], Ce = 0; Ce < Ae.length; Ce++) $.push(new C(te, Ae[Ce]));
            try {
              O.Typekit.load({ events: !1, classes: !1, async: !0 });
            } catch {
            }
            c($);
          }
        }, 2e3) : c([]);
      };
      function Me(c, _) {
        this.c = c, this.f = _, this.a = [];
      }
      Me.prototype.load = function(c) {
        var _ = this.f.id, O = this.c.o, I = this;
        _ ? (O.__webfontfontdeckmodule__ || (O.__webfontfontdeckmodule__ = {}), O.__webfontfontdeckmodule__[_] = function($, re) {
          for (var te = 0, Ae = re.fonts.length; te < Ae; ++te) {
            var Ce = re.fonts[te];
            I.a.push(new C(Ce.name, ce("font-weight:" + Ce.weight + ";font-style:" + Ce.style)));
          }
          c(I.a);
        }, L(this.c, (this.f.api || "https://f.fontdeck.com/s/css/js/") + A(this.c) + "/" + _ + ".js", function($) {
          $ && c([]);
        })) : c([]);
      };
      var Ie = new yn(window);
      Ie.a.c.custom = function(c, _) {
        return new D(_, c);
      }, Ie.a.c.fontdeck = function(c, _) {
        return new Me(_, c);
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
  }(Zo)), Zo.exports;
}
var Cv = xv();
const Rv = /* @__PURE__ */ Ev(Cv), Hc = [
  "Space Grotesk:400,500,600,700",
  "Instrument Sans:400,500,600",
  "JetBrains Mono:400,500,600"
], Iv = (e) => {
  const t = [...Hc], n = (e == null ? void 0 : e.split(",")[0].trim().replace(/['"]/g, "")) || "", s = Hc.some(
    (r) => r.toLowerCase().startsWith(n.toLowerCase())
  );
  n && !s && t.push(n), Rv.load({
    google: { families: t },
    active: () => {
      if (!e) return;
      const r = document.querySelector(".chat-container");
      r && (r.style.fontFamily = e.includes(",") ? e : `"${e}", system-ui, sans-serif`);
    }
  });
};
function Ov() {
  const e = ie({}), t = ie(""), n = (r) => {
    var i, o;
    e.value = r, r.photo_url && (e.value.photo_url = r.photo_url), Iv(r.font_family), bt({
      type: "CUSTOMIZATION_UPDATE",
      data: {
        chat_bubble_color: r.chat_bubble_color || va,
        chat_style: r.chat_style,
        chat_initiation_messages: r.chat_initiation_messages || [],
        // Dashboard "Widget placement" defaults — the embed loader merges these
        // under any options the installing developer set.
        widget_display: (i = r.customization_metadata) == null ? void 0 : i.widget_display,
        launcher: (o = r.customization_metadata) == null ? void 0 : o.launcher,
        launcher_logo_url: r.launcher_logo_url
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
const Lv = 13, Nv = 24;
function Pv(e, t) {
  const n = Vr(/* @__PURE__ */ new Map()), s = [];
  let r = null;
  const i = typeof window < "u" && typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, o = (b) => {
    r || s.length === 0 || (r = setTimeout(a, b));
  }, a = () => {
    r = null;
    const b = s[0];
    if (b === void 0) return;
    const A = n.get(b), x = (b == null ? void 0 : b.message) ?? "";
    if (!A) {
      s.shift(), o(0);
      return;
    }
    if (A.shown >= x.length) {
      A.done = !0, s.shift(), o(0);
      return;
    }
    A.shown += 1;
    const L = x[A.shown - 1];
    t == null || t(), o(L === " " ? Nv : Lv);
  };
  pt(() => [...e.value], (b) => {
    const A = new Set(b.map((x) => Ne(x)));
    for (const x of [...n.keys()])
      A.has(Ne(x)) || n.delete(x);
    for (let x = s.length - 1; x >= 0; x--)
      A.has(Ne(s[x])) || s.splice(x, 1);
    for (const x of b) {
      if (!x || !x.stream || n.has(x)) continue;
      const L = x.message ?? "";
      i || !L ? n.set(x, { shown: L.length, done: !0 }) : (n.set(x, { shown: 0, done: !1 }), s.push(x));
    }
    o(0);
  }, { immediate: !0 });
  const l = (b) => {
    const A = e.value[b];
    return A ? n.get(A) : void 0;
  }, u = (b, A) => {
    const x = l(b);
    return x ? A.slice(0, x.shown) : A;
  }, f = (b) => {
    const A = l(b);
    return !!A && !A.done;
  };
  return Gr(() => {
    r && clearTimeout(r);
  }), { displayText: u, isStreaming: f };
}
function Mv(e) {
  const t = ie(!0);
  let n = 0;
  const s = () => {
    bt({ type: "UNREAD_COUNT", count: n });
  }, r = (i) => {
    var o;
    ((o = i == null ? void 0 : i.data) == null ? void 0 : o.type) === "WIDGET_VISIBILITY" && (t.value = !!i.data.open, t.value && n !== 0 && (n = 0, s()));
  };
  pt(() => e.value.length, (i, o) => {
    if (i <= (o ?? 0) || t.value) return;
    const a = e.value[i - 1];
    a && (a.message_type === "bot" || a.message_type === "agent") && (n += 1, s());
  }), oo(() => window.addEventListener("message", r)), Gr(() => window.removeEventListener("message", r));
}
const Dv = {
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
}, Fv = {
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
}, $v = {
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
}, Bv = {
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
}, Uv = {
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
}, Fi = {
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
}, zv = {
  GLASS: Dv,
  AURORA: Fv,
  TERMINAL: $v,
  CALM_MINT: Bv,
  PLAYFUL: Uv,
  SUNRISE: Fi,
  CHATBOT: Fi,
  ASK_ANYTHING: Fi
}, Hv = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", jc = "'Instrument Sans', system-ui, -apple-system, 'Segoe UI', sans-serif";
function jv(e) {
  return Math.max(4, Math.round(e * 0.3));
}
function Wc(e) {
  const t = (e || "").replace("#", "");
  if (t.length < 6) return "#0B0C10";
  const n = parseInt(t.slice(0, 2), 16), s = parseInt(t.slice(2, 4), 16), r = parseInt(t.slice(4, 6), 16);
  return (0.299 * n + 0.587 * s + 0.114 * r) / 255 > 0.62 ? "#0B0C10" : "#FFFFFF";
}
function Wv(e) {
  return zv[e || ""] || Fi;
}
const qv = "#212529";
function Vv(e, t) {
  const n = Wv(e), s = (t == null ? void 0 : t.chat_background_color) || "", r = /^#[0-9a-fA-F]{6}$/.test(s), i = s || n.card, o = (t == null ? void 0 : t.chat_text_color) || "", l = /^#[0-9a-fA-F]{6}$/.test(o) && o.toLowerCase() !== qv ? o : r ? sr(s) ? "#FFFFFF" : "#111111" : n.text, u = r ? sr(s) ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.62)" : n.muted, f = r ? Lp(s, 20) : n.agentBg, b = (t == null ? void 0 : t.accent_color) || n.accent, A = r ? !sr(s) : n.light, x = Wc(b) === "#0B0C10", L = A === x ? u : b, z = n.mono ? Hv : t != null && t.font_family ? `${t.font_family}, ${jc}` : jc;
  return {
    "--cm-card": i,
    "--cm-text": l,
    "--cm-muted": u,
    "--cm-agent-bg": f,
    "--cm-accent": b,
    "--cm-on-accent": Wc(b),
    "--cm-presence": L,
    "--cm-border": n.border,
    "--cm-glow": n.glow,
    "--cm-radius": `${n.radius}px`,
    "--cm-bubble": `${n.bubble}px`,
    "--cm-bubble-tail": `${jv(n.bubble)}px`,
    "--cm-field-radius": n.mono ? "7px" : "12px",
    "--cm-avatar-radius": n.mono ? "28%" : "50%",
    "--cm-hairline": n.light ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.08)",
    "--cm-body-font": z
  };
}
const qc = (e) => {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: e || "USD" }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
};
function Kv() {
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
        minimumFractionDigits: qc(r),
        maximumFractionDigits: qc(r)
      }) : String(s);
      return i ? `${i}${a}` : a;
    },
    getCurrencySymbol: (s) => e[s] || s,
    currencySymbols: e
  };
}
const Gv = {
  key: 0,
  class: "widget-unavailable-overlay"
}, Yv = { class: "widget-unavailable-card" }, Xv = {
  key: 0,
  class: "widget-unavailable-footer"
}, Zv = {
  key: 1,
  class: "auth-error-overlay"
}, Jv = { class: "auth-error-card" }, Qv = { class: "auth-error-message" }, eb = {
  key: 0,
  class: "initializing-overlay"
}, tb = {
  key: 0,
  class: "connecting-message"
}, nb = {
  key: 1,
  class: "failed-message"
}, sb = { class: "welcome-content" }, rb = { class: "welcome-header" }, ib = ["src", "alt"], ob = { class: "welcome-title" }, ab = { class: "welcome-subtitle" }, lb = { class: "welcome-input-container" }, cb = {
  key: 0,
  class: "email-input"
}, ub = ["disabled"], fb = { class: "welcome-message-input" }, hb = ["placeholder", "disabled"], db = ["disabled"], pb = {
  key: 0,
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, mb = {
  key: 1,
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, gb = { class: "landing-page-content" }, _b = { class: "landing-page-header" }, yb = { class: "landing-page-heading" }, vb = { class: "landing-page-text" }, bb = { class: "landing-page-actions" }, wb = { class: "form-fullscreen-content" }, kb = {
  key: 0,
  class: "form-header"
}, Tb = {
  key: 0,
  class: "form-title"
}, Ab = {
  key: 1,
  class: "form-description"
}, Sb = { class: "form-fields" }, Eb = ["for"], xb = {
  key: 0,
  class: "required-indicator"
}, Cb = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "autocomplete", "inputmode"], Rb = ["id", "placeholder", "required", "min", "max", "value", "onInput"], Ib = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput"], Ob = ["id", "required", "value", "onChange"], Lb = { value: "" }, Nb = ["value"], Pb = {
  key: 4,
  class: "checkbox-field"
}, Mb = ["id", "required", "checked", "onChange"], Db = { class: "checkbox-label" }, Fb = {
  key: 5,
  class: "radio-group"
}, $b = ["name", "value", "required", "checked", "onChange"], Bb = { class: "radio-label" }, Ub = {
  key: 6,
  class: "field-error"
}, zb = { class: "form-actions" }, Hb = ["disabled"], jb = {
  key: 0,
  class: "loading-spinner-inline"
}, Wb = { key: 1 }, qb = { class: "header-content" }, Vb = ["src", "alt"], Kb = { class: "header-info" }, Gb = { class: "status" }, Yb = { class: "status-text cm-presence" }, Xb = { class: "header-actions" }, Zb = ["disabled", "title", "aria-label", "aria-expanded"], Jb = { class: "ask-anything-header" }, Qb = ["src", "alt"], ew = { class: "header-info" }, tw = {
  key: 2,
  class: "loading-history"
}, nw = { class: "cm-email-gate-title" }, sw = ["disabled"], rw = {
  key: 0,
  class: "cm-email-gate-error"
}, iw = ["disabled"], ow = {
  key: 1,
  class: "cm-welcome-block"
}, aw = { class: "message agent-message cm-welcome-row" }, lw = ["src", "alt"], cw = {
  key: 0,
  class: "message agent-message cm-welcome-row cm-host-prompt"
}, uw = ["src", "alt"], fw = {
  key: 0,
  class: "cm-msg-avatar",
  "aria-hidden": "true"
}, hw = ["src"], dw = ["src"], pw = { class: "message-col" }, mw = {
  key: 0,
  class: "rating-content"
}, gw = { class: "rating-prompt" }, _w = ["onMouseover", "onMouseleave", "onClick", "disabled"], yw = {
  key: 0,
  class: "feedback-wrapper"
}, vw = { class: "feedback-section" }, bw = ["onUpdate:modelValue", "disabled"], ww = { class: "feedback-counter" }, kw = ["onClick", "disabled"], Tw = {
  key: 1,
  class: "submitted-feedback-wrapper"
}, Aw = { class: "submitted-feedback" }, Sw = { class: "submitted-feedback-text" }, Ew = {
  key: 2,
  class: "submitted-message"
}, xw = {
  key: 1,
  class: "form-content"
}, Cw = {
  key: 0,
  class: "form-header"
}, Rw = {
  key: 0,
  class: "form-title"
}, Iw = {
  key: 1,
  class: "form-description"
}, Ow = { class: "form-fields" }, Lw = ["for"], Nw = {
  key: 0,
  class: "required-indicator"
}, Pw = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "disabled", "autocomplete", "inputmode"], Mw = ["id", "placeholder", "required", "min", "max", "value", "onInput", "disabled"], Dw = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "disabled"], Fw = ["id", "required", "value", "onChange", "disabled"], $w = { value: "" }, Bw = ["value"], Uw = {
  key: 4,
  class: "checkbox-field"
}, zw = ["id", "checked", "onChange", "disabled"], Hw = ["for"], jw = {
  key: 5,
  class: "radio-field"
}, Ww = ["id", "name", "value", "checked", "onChange", "disabled"], qw = ["for"], Vw = {
  key: 6,
  class: "field-error"
}, Kw = { class: "form-actions" }, Gw = ["onClick", "disabled"], Yw = {
  key: 2,
  class: "user-input-content"
}, Xw = {
  key: 0,
  class: "user-input-prompt"
}, Zw = {
  key: 1,
  class: "user-input-form"
}, Jw = ["onUpdate:modelValue", "onKeydown"], Qw = ["onClick", "disabled"], e0 = {
  key: 2,
  class: "user-input-submitted"
}, t0 = {
  key: 0,
  class: "user-input-confirmation"
}, n0 = {
  key: 3,
  class: "product-message-container"
}, s0 = ["innerHTML"], r0 = {
  key: 1,
  class: "products-carousel"
}, i0 = { class: "carousel-items" }, o0 = ["aria-label"], a0 = {
  key: 0,
  class: "product-image-compact"
}, l0 = ["src", "alt"], c0 = { class: "product-info-compact" }, u0 = { class: "product-text-area" }, f0 = { class: "product-title-compact" }, h0 = {
  key: 0,
  class: "product-variant-compact"
}, d0 = { class: "product-price-compact" }, p0 = { class: "product-actions-compact" }, m0 = ["onClick"], g0 = {
  key: 2,
  class: "no-products-message"
}, _0 = {
  key: 3,
  class: "no-products-message"
}, y0 = ["innerHTML"], v0 = ["innerHTML"], b0 = {
  key: 2,
  class: "message-attachments"
}, w0 = {
  key: 0,
  class: "attachment-image-container"
}, k0 = ["src", "alt", "onClick"], T0 = { class: "attachment-image-info" }, A0 = ["href"], S0 = { class: "attachment-size" }, E0 = ["href"], x0 = { class: "attachment-size" }, C0 = {
  key: 0,
  class: "citation-chips"
}, R0 = ["title"], I0 = { class: "message-info" }, O0 = {
  key: 0,
  class: "agent-name"
}, L0 = {
  key: 2,
  class: "message agent-message cm-welcome-row cm-host-prompt"
}, N0 = ["src", "alt"], P0 = {
  key: 5,
  class: "cm-quick-actions-bar"
}, M0 = ["disabled", "onClick"], D0 = {
  key: 0,
  class: "file-previews-widget"
}, F0 = {
  class: "file-preview-content-widget",
  style: { cursor: "pointer" }
}, $0 = ["src", "alt", "onClick"], B0 = ["onClick"], U0 = { class: "file-preview-info-widget" }, z0 = { class: "file-preview-name-widget" }, H0 = { class: "file-preview-size-widget" }, j0 = ["onClick"], W0 = {
  key: 1,
  class: "upload-progress-widget"
}, q0 = { class: "message-input" }, V0 = ["placeholder", "disabled"], K0 = ["disabled", "title"], G0 = ["disabled"], Y0 = {
  key: 2,
  class: "cm-secret-hint",
  role: "alert"
}, X0 = {
  key: 7,
  class: "new-conversation-section"
}, Z0 = { class: "conversation-ended-message" }, J0 = {
  key: 8,
  class: "ai-disclaimer"
}, Q0 = {
  key: 8,
  class: "rating-dialog"
}, ek = { class: "rating-content" }, tk = { class: "star-rating" }, nk = ["onClick"], sk = { class: "rating-actions" }, rk = ["disabled"], ik = {
  key: 0,
  class: "preview-modal-image-container"
}, ok = ["src", "alt"], ak = { class: "preview-modal-filename" }, lk = {
  key: 3,
  class: "widget-loading"
}, Vc = 3, ck = "image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls", uk = /* @__PURE__ */ Hn({
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
    } = Ov(), { formatCurrency: a } = Kv(), {
      messages: l,
      loading: u,
      errorMessage: f,
      showError: b,
      loadingHistory: A,
      hasStartedChat: x,
      connectionStatus: L,
      sendMessage: z,
      endChat: ue,
      loadChatHistory: R,
      connect: fe,
      reconnect: me,
      cleanup: C,
      humanAgent: M,
      onTakeover: S,
      refusal: j,
      submitRating: ne,
      submitForm: ce,
      currentForm: ge,
      getWorkflowState: Oe,
      proceedWorkflow: ke,
      onWorkflowState: Ge,
      onWorkflowProceeded: ze,
      currentSessionId: st,
      setToken: he,
      setWidgetId: ve,
      onSessionState: ye,
      onReauthorize: Qe,
      on: Ye,
      emit: ot
    } = uv(), We = ie(null), { receipts: jt, addReceipt: en, receiptsAfter: Fe } = j_(l), { pendingConfirm: yt, approveAction: Bt, declineAction: Wt, runLocalAction: qt } = wv(
      { on: Ye, emit: ot },
      (h) => {
        We.value = h;
      },
      en
    ), { journeyProgress: Lt, chipBusy: yn, runChip: y, skipStep: v, dismissJourney: N, noteActivity: D } = Av({
      on: Ye,
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
      h.kind === "action" && !yn.value && !yt.value && (Y.value && H(Y.value), l.value.push({ message: h.label, message_type: "user", created_at: (/* @__PURE__ */ new Date()).toISOString(), session_id: "", attributes: { source: "journey" } })), y(h, Xn);
    }, P = oe(() => {
      const h = We.value;
      return !(h != null && h.chips.length) || yt.value || u.value ? [] : h.chips;
    }), Y = oe(() => {
      const h = We.value;
      return !h || h.source !== "journey" ? h : l.value.some((G) => G.message_type === "bot" && G.message === h.message) ? null : h;
    }), q = oe(() => u.value ? null : Y.value), V = Sv(l, q), H = (h) => {
      l.value.splice(V.index(), 0, {
        message: h.message,
        message_type: "bot",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: "",
        attributes: { source: h.source }
      });
    }, { displayText: se, isStreaming: Z } = Pv(l, () => as(() => bn()));
    Mv(l);
    const J = ie(""), de = ie(!0), pe = ie(""), be = ie(!1), Te = (h) => {
      const m = h.target;
      J.value = m.value;
    };
    let Me = null;
    const Ie = () => {
      Me && Me.disconnect(), Me = new MutationObserver((m) => {
        let G = !1, p = !1;
        m.forEach((le) => {
          if (le.type === "childList") {
            const Ze = Array.from(le.addedNodes).some(
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
            Ze && (p = !0, G = !0), we && (G = !0);
          }
        }), G && (clearTimeout(Ie.timeoutId), Ie.timeoutId = setTimeout(() => {
          $();
        }, p ? 50 : 100));
      });
      const h = document.querySelector(".widget-container") || document.body;
      Me.observe(h, {
        childList: !0,
        subtree: !0
      });
    };
    Ie.timeoutId = null;
    let W = [];
    const c = /* @__PURE__ */ new Set();
    let _ = !1;
    const O = (h) => {
      if (_) return;
      const m = setTimeout(() => {
        c.delete(m), $();
      }, h);
      c.add(m);
    }, I = () => {
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
    }, De = (h) => {
      const m = h.target, G = document.querySelector(".header-menu-container");
      document.querySelector(".header-menu-btn");
      const p = document.querySelector(".header-dropdown-menu");
      p && !(G != null && G.contains(m)) && (p.style.display = "none");
    }, Be = ie(!0), {
      token: rt,
      start: hn,
      stop: $s,
      setToken: qn,
      ensureFresh: Zr
    } = ay({
      onTokenChanged: (h) => {
        Ls() && bt({ type: "TOKEN_UPDATE", token: h }), he(h);
      },
      onIdentityExpired: () => {
        ol();
      },
      // A framed widget holds the token only in memory: the host page keeps it, so
      // it must hear when the widget lets it go.
      onTokenCleared: () => {
        Ji() && Ls() && bt({ type: "TOKEN_CLEAR" });
      },
      store: Ef(n.value || "")
    });
    oe(() => !!rt.value);
    const Ut = ie(null), Nt = ie(!1), Vt = ie(!1);
    t.initialAuthError && (Ut.value = t.initialAuthError, Nt.value = !0, Be.value = !1), o();
    const At = window.__INITIAL_DATA__;
    hn((At == null ? void 0 : At.widgetId) || "", At == null ? void 0 : At.initialToken), rt.value && (be.value = !0);
    const Vn = ie(!1);
    (At == null ? void 0 : At.allowAttachments) !== void 0 && (Vn.value = At.allowAttachments);
    const Kn = ie(null), {
      chatStyles: gs,
      chatIconStyles: Jr,
      agentBubbleStyles: Rn,
      userBubbleStyles: dn,
      messageNameStyles: Kt,
      headerBorderStyles: Qr,
      photoUrl: ft,
      shadowStyle: go
    } = hy(s), ei = ie(null), {
      uploadedAttachments: Ue,
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
      handlePaste: pn,
      removeAttachment: ii,
      openPreview: Yn,
      closePreview: tn,
      openFilePicker: oi,
      isImage: vs
    } = my(rt, ei);
    oe(() => l.value.some(
      (h) => h.message_type === "form" && (!h.isSubmitted || h.isSubmitted === !1)
    ));
    const vn = oe(() => {
      var h;
      return x.value && be.value || !To.value ? L.value === "connected" && !u.value : br(pe.value.trim()) && L.value === "connected" && !u.value || ((h = window.__INITIAL_DATA__) == null ? void 0 : h.workflow);
    }), bs = oe(() => vn.value || u.value && L.value === "connected" && x.value), Us = oe(() => L.value === "connected" ? on.value ? "Ask me anything..." : "Type a message..." : "Connecting..."), zs = ie(!1), In = oe(() => Y_(J.value)), nn = async () => {
      var p;
      if (!J.value.trim() && Ue.value.length === 0 || In.value) return;
      if (u.value && x.value) {
        zs.value = !0;
        return;
      }
      !x.value && pe.value && await kt();
      const h = Ue.value.map((le) => ({
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
      ), Ue.value.forEach((le) => {
        le.url && le.url.startsWith("blob:") && URL.revokeObjectURL(le.url), le.file_url && le.file_url.startsWith("blob:") && URL.revokeObjectURL(le.file_url);
      }), J.value = "", Ue.value = [];
      const G = document.querySelector('input[placeholder*="Type a message"]');
      G && (G.value = ""), O(500);
    };
    pt(u, (h) => {
      h || !zs.value || (zs.value = !1, L.value === "connected" && x.value && nn());
    });
    const Xn = (h) => {
      vn.value && (J.value = h, nn());
    }, mn = () => {
      bt({ type: "WIDGET_MINIMIZE" });
    }, Zn = (h) => {
      h.key === "Enter" && !h.shiftKey && (h.preventDefault(), h.stopPropagation(), nn());
    }, kt = async ({ afterRefusal: h = !1 } = {}) => {
      var m, G, p, le;
      try {
        if (!n.value)
          return console.error("Widget ID is not available"), Ut.value = "Widget ID is not available. Please refresh and try again.", Nt.value = !0, !1;
        await Zr(n.value);
        const Ze = new URL(`${Ds.API_URL}/widgets/${n.value}`);
        pe.value.trim() && br(pe.value.trim()) && Ze.searchParams.append("email", pe.value.trim());
        const we = {
          Accept: "application/json",
          "Content-Type": "application/json"
        };
        rt.value && (we.Authorization = `Bearer ${rt.value}`);
        const lt = await fetch(Ze, {
          headers: we,
          cache: "no-store"
        });
        if (lt.status === 401) {
          be.value = !1;
          try {
            const ns = (await lt.json()).detail;
            if ((ns == null ? void 0 : ns.code) === ny)
              return ol(), !1;
            const Ks = typeof ns == "string" ? ns : "";
            (Ks.includes("generate-token") || Ks.includes("API key") || Ks.includes("Token required")) && (Vt.value = !0, Ut.value = "Widget authentication not configured. Please contact the website administrator.", Nt.value = !0, qn(null));
          } catch {
            Ut.value = "Authentication required. Your token has expired or is invalid. Please refresh the page.", Nt.value = !0, qn(null);
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
        et.token && qn(et.token), be.value = !0, Ut.value = null, Nt.value = !1, he(rt.value || void 0);
        const pr = await fe();
        return !pr && fa(j.value) && !h ? await kt({ afterRefusal: !0 }) : (pr || console.error("Chat service not reachable yet; retrying in the background"), await _o(), (m = et.agent) != null && m.customization && i(et.agent.customization), et.agent && !(et != null && et.human_agent) && (r.value = et.agent.name), et != null && et.human_agent && (M.value = et.human_agent), ((G = et.agent) == null ? void 0 : G.allow_attachments) !== void 0 && (Vn.value = et.agent.allow_attachments), ((p = et.agent) == null ? void 0 : p.workflow) !== void 0 && (window.__INITIAL_DATA__ = window.__INITIAL_DATA__ || {}, window.__INITIAL_DATA__.workflow = et.agent.workflow), (le = et.agent) != null && le.workflow && await Oe(), !0);
      } catch (Ze) {
        return console.error("Error checking authorization:", Ze), Ut.value = "An unexpected error occurred. Please try again.", Nt.value = !0, be.value = !1, !1;
      } finally {
        Be.value = !1;
      }
    }, _o = async () => {
      !x.value && be.value && (x.value = !0, await R());
    }, bn = () => {
      Kn.value && (Kn.value.scrollTop = Kn.value.scrollHeight);
    };
    pt(() => l.value, (h) => {
      as(() => {
        bn();
      });
    }, { deep: !0 }), pt([yt, q, () => jt.value.length, u], ([h, m, G, p]) => {
      (h || m || G || p) && as(() => bn());
    }), pt(L, (h, m) => {
      h === "connected" && m !== "connected" && O(100);
    }), pt(() => l.value.length, (h, m) => {
      h > 0 && m === 0 && O(100);
    });
    let ai = null;
    pt(() => l.value, (h) => {
      const m = h[h.length - 1];
      !Ic(m) || m === ai || (ai = m, ae(m));
    }, { deep: !0 });
    const li = async () => {
      (await me() || fa(j.value)) && await kt();
    }, ur = ie(!1), ws = ie(0), Hs = ie(""), sn = ie(0), Gt = ie(!1), ht = ie({}), vt = ie(!1), ut = ie({}), rn = ie(!1), On = ie(null), K = ie("Start Chat"), d = ie(!1), T = ie(null);
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
      () => Xi(M.value.human_agent_profile_pic)
    ), ae = async (h) => {
      var m, G, p, le, Ze;
      if (Ic(h)) {
        try {
          if (h.session_id && rt.value && n.value) {
            const we = await il(h.session_id, {
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
          const we = h.agent_name || ((Ze = M.value) == null ? void 0 : Ze.human_agent_name) || r.value || "our agent";
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
    }, Xe = () => {
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
        const p = ht.value[G.name], le = ui(G, p);
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
        if ((G = T.value) != null && G.fields && (le = T.value.fields.find((Ze) => Ze.name === h)), !le && ((p = ge.value) != null && p.fields) && (le = ge.value.fields.find((Ze) => Ze.name === h)), le) {
          const Ze = ui(le, m);
          Ze ? (ut.value[h] = Ze, console.log(`Validation error for ${h}:`, Ze)) : delete ut.value[h];
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
        const G = parseFloat(m);
        if (isNaN(G))
          return `${h.label} must be a valid number`;
        if (h.minLength && G < h.minLength)
          return `${h.label} must be at least ${h.minLength}`;
        if (h.maxLength && G > h.maxLength)
          return `${h.label} must not exceed ${h.maxLength}`;
      }
      return null;
    }, Uf = async () => {
      if (!(vt.value || !T.value))
        try {
          vt.value = !0, ut.value = {};
          let h = !1;
          for (const m of T.value.fields || []) {
            const G = ht.value[m.name], p = ui(m, G);
            p && (ut.value[m.name] = p, h = !0, console.log(`Validation error for field ${m.name}:`, p));
          }
          if (h) {
            vt.value = !1, console.log("Validation failed, not submitting");
            return;
          }
          await ce(ht.value), d.value = !1, T.value = null, ht.value = {};
        } catch (h) {
          console.error("Failed to submit full screen form:", h);
        } finally {
          vt.value = !1, console.log("Full screen form submission completed");
        }
    }, zf = (h, m) => {
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
    }, Hf = (h) => {
      if (!h) return "";
      let m = h.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "");
      const G = [];
      return m = m.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (p, le, Ze) => {
        const we = `__MARKDOWN_LINK_${G.length}__`;
        return console.log("Found markdown link:", p, "-> placeholder:", we), G.push(p), we;
      }), console.log("After replacing markdown links with placeholders:", m), console.log("Markdown links array:", G), m = m.replace(/https?:\/\/[^\s\)]+/g, "[link removed]"), console.log("After removing standalone URLs:", m), G.forEach((p, le) => {
        m = m.replace(`__MARKDOWN_LINK_${le}__`, p), console.log(`Restored markdown link ${le}:`, p);
      }), m = m.replace(/\n\s*\n\s*\n/g, `

`).trim(), m;
    }, sl = ie(!1);
    ie(!1);
    const yo = oe(() => {
      var h;
      return !!((h = M.value) != null && h.human_agent_name);
    }), rl = oe(() => {
      var h;
      return ey((h = window.__INITIAL_DATA__) == null ? void 0 : h.presence, yo.value);
    }), js = oe(() => {
      var h;
      return !((h = window.__INITIAL_DATA__) != null && h.hideBranding);
    }), jf = oe(() => Vn.value && yo.value && Ue.value.length < Vc), Wf = async () => {
      try {
        rn.value = !1, On.value = null, await ke();
      } catch (h) {
        console.error("Failed to proceed workflow:", h);
      }
    }, vo = async (h) => {
      try {
        if (!h.userInputValue || !h.userInputValue.trim())
          return;
        const m = h.userInputValue.trim();
        h.isSubmitted = !0, h.submittedValue = m, await z(m, pe.value);
      } catch (m) {
        console.error("Failed to submit user input:", m), h.isSubmitted = !1, h.submittedValue = null;
      }
    }, il = (h, { reason: m, description: G, keepalive: p = !1 } = {}) => {
      const le = new URL(`${Ds.API_URL}/widgets/${n.value}/end-chat`);
      return le.searchParams.append("session_id", h), m && le.searchParams.append("reason", m), G && le.searchParams.append("description", G), fetch(le, {
        method: "POST",
        keepalive: p,
        headers: {
          Authorization: `Bearer ${rt.value}`,
          "Content-Type": "application/json"
        }
      });
    }, qf = async (h) => {
      try {
        typeof h == "string" && h && rt.value && n.value && await il(h, { reason: "CUSTOMER_REQUEST", keepalive: !0 });
      } catch {
      } finally {
        bt({ type: "END_CHAT_DONE" });
      }
    }, ol = () => {
      if (!Ls()) {
        al();
        return;
      }
      bt({ type: "IDENTITY_EXPIRED" });
    }, al = async () => {
      rt.value && (qn(null), await hr());
    }, Vf = async (h) => {
      const m = cs(h);
      !m || m === rt.value || (qn(m), await hr());
    }, hr = async () => {
      var h, m, G;
      try {
        let p = 0;
        const le = 50;
        for (; !((h = window.__INITIAL_DATA__) != null && h.widgetId) && p < le; )
          await new Promise((we) => setTimeout(we, 100)), p++;
        return (m = window.__INITIAL_DATA__) != null && m.widgetId ? (ve(window.__INITIAL_DATA__.widgetId), await kt() ? ((G = window.__INITIAL_DATA__) != null && G.workflow && be.value && await Oe(), !0) : (L.value = "connected", !1)) : (console.error("Widget data not available after waiting"), !1);
      } catch (p) {
        return console.error("Failed to initialize widget:", p), !1;
      }
    };
    window.addEventListener("message", (h) => {
      h.source === window.parent && (!h.data || typeof h.data.type != "string" || D_(h.data) || (h.data.type === "SCROLL_TO_BOTTOM" && bn(), h.data.type === "HOST_PAGE" && Sf(h.data.url), h.data.type === "END_CHAT" && Ls() && qf(h.data.sessionId), h.data.type === "IDENTITY_UNAVAILABLE" && Ls() && al(), h.data.type === "TOKEN_REFRESH" && Ls() && Vf(h.data.token), h.data.type === "WIDGET_VISIBILITY" && (_l.value = !!h.data.open), h.data.type === "WIDGET_DISPLAY" && (Ao.value = {
        mode: h.data.mode,
        width: h.data.width,
        height: h.data.height,
        hotkey: h.data.hotkey
      }), h.data.type === "PREFILL_MESSAGE" && typeof h.data.text == "string" && (J.value = h.data.text.slice(0, 2e3), as(() => {
        const m = document.querySelector(
          ".message-input input, .welcome-message-field"
        );
        m == null || m.focus();
      }))));
    }), window.addEventListener("keydown", (h) => {
      h.key !== "Escape" || h.defaultPrevented || !Ji() || bt({ type: "WIDGET_ESCAPE" });
    });
    const Kf = () => {
      S(async () => {
        await kt();
      }), Qe(async () => {
        await kt();
      }), ye(({ session_id: h, authenticated: m, created: G }) => {
        bt({
          type: "CHAT_SESSION",
          sessionId: h,
          authenticated: m,
          created: G
        });
      }), Ge((h) => {
        var m;
        if (K.value = h.button_text || "Start Chat", h.type === "landing_page")
          On.value = h.landing_page_data, rn.value = !0, d.value = !1;
        else if (h.type === "form" || h.type === "display_form")
          if (((m = h.form_data) == null ? void 0 : m.form_full_screen) === !0)
            T.value = h.form_data, d.value = !0, rn.value = !1;
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
    }, Gf = async () => {
      try {
        await hr(), await Oe();
      } catch (h) {
        throw console.error("Failed to start new conversation:", h), h;
      }
    }, fi = oe(
      () => {
        var h;
        return s.value.allow_new_chat === !0 && l.value.length > 0 && !((h = M.value) != null && h.human_agent_name) && !As.value;
      }
    ), Jn = ie(!1), Qn = ie(""), es = ie(!1);
    let ks = null;
    const Ws = () => {
      es.value = !1, Qn.value = "", ks && (clearTimeout(ks), ks = null);
    }, ll = () => {
      if (!Jn.value) {
        if (es.value) {
          Ws();
          return;
        }
        es.value = !0, Qn.value = "", ks = setTimeout(Ws, tg);
      }
    };
    pt(fi, (h) => {
      h || Ws();
    });
    const cl = async () => {
      Jn.value || (ks && (clearTimeout(ks), ks = null), await Yf(), Qn.value || (es.value = !1));
    }, Yf = async () => {
      if (!Jn.value) {
        Jn.value = !0, Qn.value = "";
        try {
          if (!await ue()) {
            Qn.value = Cc;
            return;
          }
          M.value = {}, J.value = "", Ue.value = [], await hr();
        } catch (h) {
          console.error("Failed to start a new chat:", h), Qn.value = Cc;
        } finally {
          Jn.value = !1;
        }
      }
    }, Xf = async () => {
      B.value = !1, l.value = [], M.value = {}, await Gf();
    };
    oo(async () => {
      await hr(), Kf(), Ie(), document.addEventListener("click", De), (() => {
        const m = l.value.length > 0, G = L.value === "connected", p = document.querySelector('input[type="text"], textarea') !== null;
        return m || G || p;
      })() && O(100);
    }), Gr(() => {
      window.removeEventListener("message", (h) => {
        h.data.type === "SCROLL_TO_BOTTOM" && bn();
      }), document.removeEventListener("click", De), Me && (Me.disconnect(), Me = null), Ie.timeoutId && (clearTimeout(Ie.timeoutId), Ie.timeoutId = null), _ = !0, I(), re(), $s(), Ws(), C();
    });
    const qs = oe(() => s.value.chat_style === "AURORA"), on = oe(() => s.value.chat_style === "ASK_ANYTHING" || qs.value), ul = oe(() => s.value.customization_metadata), Vs = oe(() => {
      var m;
      const h = (m = ul.value) == null ? void 0 : m.avatar_style;
      return h === "orb" ? !0 : h === "photo" ? !1 : qs.value && !s.value.photo_url;
    }), Ts = oe(() => {
      var h;
      return J_(r.value || "", (h = ul.value) == null ? void 0 : h.orb_variant);
    }), Zf = {
      GLASS: "theme-glass",
      TERMINAL: "theme-terminal",
      PLAYFUL: "theme-playful",
      CALM_MINT: "theme-calm",
      SUNRISE: "theme-sunrise"
    }, Jf = oe(() => Zf[s.value.chat_style] || ""), Qf = oe(() => Vv(s.value.chat_style, {
      chat_background_color: s.value.chat_background_color,
      chat_text_color: s.value.chat_text_color,
      accent_color: s.value.accent_color,
      font_family: s.value.font_family
    })), bo = oe(
      () => Array.isArray(s.value.quick_actions) ? s.value.quick_actions.filter((h) => !!h && h.trim().length > 0) : []
    ), fl = oe(() => (s.value.welcome_message || "").trim()), hl = oe(
      () => !on.value && l.value.length === 0 && !A.value && !As.value
    ), eh = oe(
      () => hl.value && fl.value.length > 0
    ), th = oe(
      () => hl.value && !B.value && bo.value.length > 0
    ), hi = oe(() => s.value.show_citations === !0), dl = oe(() => Q_(s.value.show_ai_disclaimer, yo.value)), nh = (h) => /^[0-9a-f]{16,}$/i.test(h) || /^[0-9a-f-]{32,}$/i.test(h), wo = (h) => {
      const m = (h || "").trim().toLowerCase();
      return !m || m === "unknown" ? "Knowledge base" : m.charAt(0).toUpperCase() + m.slice(1);
    }, ko = (h) => {
      let m = ((h == null ? void 0 : h.name) || "").trim();
      return !m || (m = m.replace(/^[0-9a-f]{16,}[_-]/i, "").replace(/\.(pdf|txt|md|html?|docx?|csv|json)$/i, ""), !m || nh(m)) ? wo(h == null ? void 0 : h.type) : m;
    }, pl = (h) => {
      const m = ko(h), G = wo(h == null ? void 0 : h.type);
      return m === G ? G : `${m} · ${G}`;
    }, To = oe(() => s.value.collect_email === !0 && !on.value), ml = ie(!1), ts = ie(""), dr = ie(!1), As = oe(() => !x.value && To.value && !ml.value), gl = async () => {
      const h = pe.value.trim();
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
        await kt(), ml.value = !0;
      } catch {
        ts.value = "Something went wrong. Please try again.";
      } finally {
        dr.value = !1;
      }
    }, Ao = ie(null), _l = ie(!0), So = { mode: "floating", width: 400, height: 560 }, di = oe(
      () => {
        var h;
        return Ao.value || ((h = s.value.customization_metadata) == null ? void 0 : h.widget_display) || null;
      }
    ), sh = oe(() => {
      const h = di.value;
      return h ? typeof h.mode == "string" && h.mode !== So.mode || typeof h.width == "number" && h.width !== So.width || typeof h.height == "number" && h.height !== So.height : !1;
    }), rh = oe(() => {
      var m;
      const h = {
        width: "100%",
        height: "100%",
        borderRadius: "var(--radius-lg)"
      };
      if (sh.value) {
        const G = (m = di.value) == null ? void 0 : m.mode;
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
    }), yl = oe(() => on.value && l.value.length === 0), ih = ["form", "user_input", "rating", "product", "shopify_output"], oh = oe(
      () => l.value.some(
        (h) => ih.includes(h.message_type) || Array.isArray(h.attachments) && h.attachments.length > 0
      )
    ), ah = oe(() => {
      var m, G;
      return on.value ? !0 : (((m = di.value) == null ? void 0 : m.mode) === "ask-ai" || ((G = di.value) == null ? void 0 : G.mode) === "search-bar") && !Vn.value;
    }), Eo = oe(
      () => ah.value && de.value && !rn.value && !d.value && !As.value && !B.value && !oh.value
    );
    pt(Eo, (h) => {
      bt({ type: "WIDGET_SURFACE", palette: h });
    }, { immediate: !0 });
    const lh = oe(
      () => s.value.welcome_subtitle || `Ask a question — ${r.value || "the assistant"} answers from what it knows.`
    ), ch = oe(() => {
      var h;
      return ((h = Ao.value) == null ? void 0 : h.hotkey) !== !1;
    });
    return (h, m) => {
      var G;
      return Nt.value && Vt.value ? (w(), k("div", Gv, [
        g("button", {
          type: "button",
          class: "cm-error-close",
          "aria-label": "Close chat",
          title: "Close",
          onClick: mn
        }, "×"),
        g("div", Yv, [
          m[21] || (m[21] = Mo('<div class="widget-unavailable-icon-wrapper" data-v-57645127><svg class="widget-unavailable-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-v-57645127><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" data-v-57645127></path><path d="M9 12l2 2 4-4" data-v-57645127></path></svg></div><h2 class="widget-unavailable-title" data-v-57645127>Chat Unavailable</h2><p class="widget-unavailable-message" data-v-57645127> This chat widget is not currently configured. Please contact the website administrator to enable chat support. </p>', 3)),
          js.value ? (w(), k("div", Xv, [
            Dt(Er, {
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
      ])) : Nt.value ? (w(), k("div", Zv, [
        g("button", {
          type: "button",
          class: "cm-error-close",
          "aria-label": "Close chat",
          title: "Close",
          onClick: mn
        }, "×"),
        g("div", Jv, [
          m[22] || (m[22] = Mo('<div class="auth-error-header" data-v-57645127><svg class="auth-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-57645127><circle cx="12" cy="12" r="10" data-v-57645127></circle><line x1="12" y1="8" x2="12" y2="12" data-v-57645127></line><line x1="12" y1="16" x2="12.01" y2="16" data-v-57645127></line></svg><h2 data-v-57645127>Authentication Error</h2></div>', 1)),
          g("p", Qv, X(Ut.value), 1),
          g("button", {
            class: "auth-error-refresh-btn",
            onClick: m[0] || (m[0] = () => h.window.location.reload())
          }, " Refresh Page ")
        ])
      ])) : n.value && !Nt.value ? (w(), k("div", {
        key: 2,
        class: Le(["chat-container cm-surface", [{ collapsed: !de.value, "ask-anything-style": on.value, aurora: qs.value }, Jf.value]]),
        style: Ee({ ...E(go), ...rh.value, ...Qf.value })
      }, [
        Be.value ? (w(), k("div", eb, m[23] || (m[23] = [
          Mo('<div class="loading-spinner" data-v-57645127><div class="dot" data-v-57645127></div><div class="dot" data-v-57645127></div><div class="dot" data-v-57645127></div></div><div class="loading-text" data-v-57645127>Initializing chat...</div>', 2)
        ]))) : ee("", !0),
        !Be.value && E(L) !== "connected" ? (w(), k("div", {
          key: 1,
          class: Le(["connection-status", E(L)])
        }, [
          E(L) === "connecting" ? (w(), k("div", tb, m[24] || (m[24] = [
            Nn(" Connecting to chat service... ", -1),
            g("div", { class: "loading-dots" }, [
              g("div", { class: "dot" }),
              g("div", { class: "dot" }),
              g("div", { class: "dot" })
            ], -1)
          ]))) : E(L) === "failed" ? (w(), k("div", nb, [
            m[25] || (m[25] = Nn(" Connection failed. ", -1)),
            g("button", {
              onClick: li,
              class: "reconnect-button"
            }, " Click here to reconnect ")
          ])) : ee("", !0)
        ], 2)) : ee("", !0),
        E(b) ? (w(), k("div", {
          key: 2,
          class: "error-alert",
          style: Ee(E(Jr))
        }, X(E(f)), 5)) : ee("", !0),
        Eo.value ? (w(), Pn(Rg, {
          key: 3,
          messages: E(l),
          draft: J.value,
          "agent-name": E(r),
          suggestions: bo.value,
          "welcome-title": E(s).welcome_title,
          "welcome-subtitle": lh.value,
          placeholder: Us.value,
          "input-enabled": vn.value,
          "typing-enabled": bs.value,
          loading: E(u),
          "show-citations": hi.value,
          disclaimer: dl.value ? E(Oc) : "",
          "show-branding": js.value,
          active: _l.value,
          hotkey: ch.value,
          "can-start-new-chat": fi.value,
          "starting-new-chat": Jn.value,
          "new-chat-armed": es.value,
          "new-chat-error": Qn.value,
          onNewChat: ll,
          onConfirmNewChat: cl,
          onCancelNewChat: Ws,
          "citation-label": ko,
          "citation-tooltip": pl,
          "display-text": E(se),
          "is-streaming": E(Z),
          "onUpdate:draft": m[1] || (m[1] = (p) => J.value = p),
          onSend: nn,
          onAsk: Xn,
          onClose: mn
        }, null, 8, ["messages", "draft", "agent-name", "suggestions", "welcome-title", "welcome-subtitle", "placeholder", "input-enabled", "typing-enabled", "loading", "show-citations", "disclaimer", "show-branding", "active", "hotkey", "can-start-new-chat", "starting-new-chat", "new-chat-armed", "new-chat-error", "display-text", "is-streaming"])) : yl.value ? (w(), k("div", {
          key: 4,
          class: Le(["welcome-message-section", { aurora: qs.value }]),
          style: Ee(E(gs))
        }, [
          g("div", sb, [
            g("div", rb, [
              Vs.value ? (w(), k("div", {
                key: 0,
                class: "welcome-orb",
                style: Ee(Ts.value)
              }, null, 4)) : E(ft) ? (w(), k("img", {
                key: 1,
                src: E(ft),
                alt: E(r),
                class: "welcome-avatar"
              }, null, 8, ib)) : ee("", !0),
              g("h1", ob, X(E(s).welcome_title || `Welcome to ${E(r)}`), 1),
              g("p", ab, X(E(s).welcome_subtitle || "I'm here to help you with anything you need. What can I assist you with today?"), 1)
            ])
          ]),
          g("div", lb, [
            !E(x) && !be.value && To.value ? (w(), k("div", cb, [
              ss(g("input", {
                "onUpdate:modelValue": m[2] || (m[2] = (p) => pe.value = p),
                type: "email",
                placeholder: "Enter your email address",
                disabled: E(u) || E(L) !== "connected",
                class: Le([{
                  invalid: pe.value.trim() && !E(br)(pe.value.trim()),
                  disabled: E(L) !== "connected"
                }, "welcome-email-input"])
              }, null, 10, ub), [
                [xs, pe.value]
              ])
            ])) : ee("", !0),
            g("div", fb, [
              ss(g("input", {
                "onUpdate:modelValue": m[3] || (m[3] = (p) => J.value = p),
                type: "text",
                placeholder: Us.value,
                onKeypress: Zn,
                onInput: Te,
                onChange: Te,
                disabled: !bs.value,
                class: Le([{ disabled: !bs.value }, "welcome-message-field"])
              }, null, 42, hb), [
                [xs, J.value]
              ]),
              g("button", {
                class: Le(["welcome-send-button", { "aurora-send": qs.value }]),
                style: Ee(E(dn)),
                onClick: nn,
                disabled: !J.value.trim() || !vn.value || In.value
              }, [
                qs.value ? (w(), k("svg", pb, m[26] || (m[26] = [
                  g("path", {
                    d: "M12 19V5M12 5L5 12M12 5L19 12",
                    stroke: "currentColor",
                    "stroke-width": "2",
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round"
                  }, null, -1)
                ]))) : (w(), k("svg", mb, m[27] || (m[27] = [
                  g("path", {
                    d: "M5 12L3 21L21 12L3 3L5 12ZM5 12L13 12",
                    stroke: "currentColor",
                    "stroke-width": "2",
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round"
                  }, null, -1)
                ])))
              ], 14, db)
            ])
          ]),
          js.value ? (w(), k("div", {
            key: 0,
            class: "powered-by-welcome",
            style: Ee(E(Kt))
          }, [
            Dt(Er, {
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
        rn.value && On.value ? (w(), k("div", {
          key: 5,
          class: "landing-page-fullscreen",
          style: Ee(E(gs))
        }, [
          g("div", gb, [
            g("div", _b, [
              g("h2", yb, X(On.value.heading), 1),
              g("div", vb, X(On.value.content), 1)
            ]),
            g("div", bb, [
              g("button", {
                class: "landing-page-button",
                onClick: Wf
              }, X(K.value), 1)
            ])
          ]),
          js.value ? (w(), k("div", {
            key: 0,
            class: "powered-by-landing",
            style: Ee(E(Kt))
          }, [
            Dt(Er, {
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
        ], 4)) : d.value && T.value ? (w(), k("div", {
          key: 6,
          class: "form-fullscreen",
          style: Ee(E(gs))
        }, [
          g("div", wb, [
            T.value.title || T.value.description ? (w(), k("div", kb, [
              T.value.title ? (w(), k("h2", Tb, X(T.value.title), 1)) : ee("", !0),
              T.value.description ? (w(), k("p", Ab, X(T.value.description), 1)) : ee("", !0)
            ])) : ee("", !0),
            g("div", Sb, [
              (w(!0), k(Re, null, dt(T.value.fields, (p) => {
                var le, Ze;
                return w(), k("div", {
                  key: p.name,
                  class: "form-field"
                }, [
                  g("label", {
                    for: `fullscreen-form-${p.name}`,
                    class: "field-label"
                  }, [
                    Nn(X(p.label) + " ", 1),
                    p.required ? (w(), k("span", xb, "*")) : ee("", !0)
                  ], 8, Eb),
                  p.type === "text" || p.type === "email" || p.type === "tel" ? (w(), k("input", {
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
                  }, null, 42, Cb)) : p.type === "number" ? (w(), k("input", {
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
                  }, null, 42, Rb)) : p.type === "textarea" ? (w(), k("textarea", {
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
                  }, null, 42, Ib)) : p.type === "select" ? (w(), k("select", {
                    key: 3,
                    id: `fullscreen-form-${p.name}`,
                    required: p.required,
                    value: ht.value[p.name] || "",
                    onChange: (we) => qe(p.name, we.target.value),
                    class: Le(["form-select", { error: ut.value[p.name] }])
                  }, [
                    g("option", Lb, X(p.placeholder || "Please select..."), 1),
                    (w(!0), k(Re, null, dt((Array.isArray(p.options) ? p.options : ((le = p.options) == null ? void 0 : le.split(`
`)) || []).filter((we) => we.trim()), (we) => (w(), k("option", {
                      key: we,
                      value: we.trim()
                    }, X(we.trim()), 9, Nb))), 128))
                  ], 42, Ob)) : p.type === "checkbox" ? (w(), k("label", Pb, [
                    g("input", {
                      id: `fullscreen-form-${p.name}`,
                      type: "checkbox",
                      required: p.required,
                      checked: ht.value[p.name] || !1,
                      onChange: (we) => qe(p.name, we.target.checked),
                      class: "form-checkbox"
                    }, null, 40, Mb),
                    g("span", Db, X(p.label), 1)
                  ])) : p.type === "radio" ? (w(), k("div", Fb, [
                    (w(!0), k(Re, null, dt((Array.isArray(p.options) ? p.options : ((Ze = p.options) == null ? void 0 : Ze.split(`
`)) || []).filter((we) => we.trim()), (we) => (w(), k("label", {
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
                      }, null, 40, $b),
                      g("span", Bb, X(we.trim()), 1)
                    ]))), 128))
                  ])) : ee("", !0),
                  ut.value[p.name] ? (w(), k("div", Ub, X(ut.value[p.name]), 1)) : ee("", !0)
                ]);
              }), 128))
            ]),
            g("div", zb, [
              g("button", {
                onClick: m[4] || (m[4] = () => {
                  console.log("Submit button clicked!"), Uf();
                }),
                disabled: vt.value,
                class: "submit-form-button",
                style: Ee(E(dn))
              }, [
                vt.value ? (w(), k("span", jb, m[30] || (m[30] = [
                  g("div", { class: "dot" }, null, -1),
                  g("div", { class: "dot" }, null, -1),
                  g("div", { class: "dot" }, null, -1)
                ]))) : (w(), k("span", Wb, X(T.value.submit_button_text || "Submit"), 1))
              ], 12, Hb)
            ])
          ]),
          js.value ? (w(), k("div", {
            key: 0,
            class: "powered-by-landing",
            style: Ee(E(Kt))
          }, [
            Dt(Er, {
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
        ], 4)) : !yl.value && de.value && !Eo.value ? (w(), k("div", {
          key: 7,
          class: Le(["chat-panel", { "ask-anything-chat": on.value }]),
          style: Ee(E(gs))
        }, [
          on.value ? (w(), k("div", {
            key: 1,
            class: "ask-anything-top",
            style: Ee(E(Qr))
          }, [
            g("div", Jb, [
              Q.value || E(ft) ? (w(), k("img", {
                key: 0,
                src: Q.value || E(ft),
                alt: E(M).human_agent_name || E(r),
                class: "header-avatar"
              }, null, 8, Qb)) : ee("", !0),
              g("div", ew, [
                g("h3", {
                  style: Ee(E(Kt))
                }, X(E(r)), 5),
                g("p", {
                  class: "ask-anything-subtitle",
                  style: Ee(E(Kt))
                }, X(E(s).welcome_subtitle || "Ask me anything. I'm here to help."), 5)
              ])
            ])
          ], 4)) : (w(), k("div", {
            key: 0,
            class: "chat-header",
            style: Ee(E(Qr))
          }, [
            g("div", {
              class: "cm-header-sheen",
              style: Ee({ background: "linear-gradient(90deg, transparent, " + (E(s).accent_color || "#C9F24E") + ", transparent)" })
            }, null, 4),
            g("div", qb, [
              !Q.value && (Vs.value || !E(ft)) ? (w(), k("div", {
                key: 0,
                class: "header-orb",
                style: Ee(Ts.value)
              }, null, 4)) : Q.value || E(ft) ? (w(), k("img", {
                key: 1,
                src: Q.value || E(ft),
                alt: E(M).human_agent_name || E(r),
                class: "header-avatar"
              }, null, 8, Vb)) : ee("", !0),
              g("div", Kb, [
                g("h3", {
                  style: Ee(E(Kt))
                }, X(E(M).human_agent_name || E(r)), 5),
                g("div", Gb, [
                  g("span", {
                    class: Le(["status-indicator", rl.value.online ? "online" : "away"])
                  }, null, 2),
                  g("span", Yb, X(rl.value.text), 1)
                ])
              ])
            ]),
            g("div", Xb, [
              fi.value ? (w(), k("button", {
                key: 0,
                type: "button",
                class: Le(["header-new-chat", { armed: es.value }]),
                style: Ee(E(Kt)),
                disabled: Jn.value,
                title: E(Gi),
                "aria-label": E(Gi),
                "aria-expanded": es.value,
                onClick: ll
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
              ]), 14, Zb)) : ee("", !0),
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
          E(A) ? (w(), k("div", tw, m[34] || (m[34] = [
            g("div", { class: "loading-spinner" }, [
              g("div", { class: "dot" }),
              g("div", { class: "dot" }),
              g("div", { class: "dot" })
            ], -1)
          ]))) : ee("", !0),
          As.value ? (w(), k("div", {
            key: 3,
            class: "cm-email-gate",
            style: Ee(E(gs))
          }, [
            g("div", {
              class: "cm-email-gate-orb",
              style: Ee(Ts.value)
            }, null, 4),
            g("h3", nw, X(E(s).welcome_title || "Before we start"), 1),
            m[35] || (m[35] = g("p", { class: "cm-email-gate-text" }, "Enter your email and we'll continue the chat.", -1)),
            ss(g("input", {
              "onUpdate:modelValue": m[5] || (m[5] = (p) => pe.value = p),
              type: "email",
              inputmode: "email",
              autocomplete: "email",
              placeholder: "you@example.com",
              class: Le(["cm-email-gate-input", { invalid: !!ts.value }]),
              disabled: dr.value,
              onKeyup: xi(gl, ["enter"]),
              onInput: m[6] || (m[6] = (p) => ts.value = "")
            }, null, 42, sw), [
              [xs, pe.value]
            ]),
            ts.value ? (w(), k("p", rw, X(ts.value), 1)) : ee("", !0),
            g("button", {
              type: "button",
              class: "cm-email-gate-btn",
              style: Ee(E(dn)),
              disabled: dr.value,
              onClick: gl
            }, X(dr.value ? "Please wait…" : "Continue to chat"), 13, iw)
          ], 4)) : ee("", !0),
          es.value && fi.value ? (w(), Pn(pf, {
            key: 4,
            busy: Jn.value,
            error: Qn.value,
            onConfirm: cl,
            onCancel: Ws
          }, null, 8, ["busy", "error"])) : ee("", !0),
          ss(g("div", {
            class: "chat-messages",
            ref_key: "messagesContainer",
            ref: Kn,
            role: "log",
            "aria-label": "Messages"
          }, [
            E(Lt) ? (w(), Pn(A_, {
              key: 0,
              progress: E(Lt),
              onSkip: E(v),
              onHide: E(N)
            }, null, 8, ["progress", "onSkip", "onHide"])) : ee("", !0),
            eh.value ? (w(), k("div", ow, [
              g("div", aw, [
                Vs.value || !E(ft) ? (w(), k("div", {
                  key: 0,
                  class: "cm-welcome-orb",
                  style: Ee(Ts.value)
                }, null, 4)) : (w(), k("img", {
                  key: 1,
                  src: E(ft),
                  alt: E(r),
                  class: "cm-welcome-avatar"
                }, null, 8, lw)),
                g("div", {
                  class: "message-bubble cm-welcome-bubble",
                  style: Ee(E(Rn))
                }, X(fl.value), 5)
              ])
            ])) : ee("", !0),
            (w(!0), k(Re, null, dt(E(l), (p, le) => {
              var Ze, we, lt, et, pr, mr, ns, Ks, vl, bl, wl, kl, Tl, Al, Sl, El, xl, Cl, Rl, Il;
              return w(), k(Re, { key: le }, [
                E(V).isBefore(p) ? (w(), k("div", cw, [
                  Vs.value || !E(ft) ? (w(), k("div", {
                    key: 0,
                    class: "cm-welcome-orb",
                    style: Ee(Ts.value)
                  }, null, 4)) : (w(), k("img", {
                    key: 1,
                    src: E(ft),
                    alt: E(r),
                    class: "cm-welcome-avatar"
                  }, null, 8, uw)),
                  g("div", {
                    class: "message-bubble cm-welcome-bubble",
                    style: Ee(E(Rn))
                  }, X((Ze = q.value) == null ? void 0 : Ze.message), 5)
                ])) : ee("", !0),
                g("div", {
                  class: Le([
                    "message",
                    p.message_type === "bot" || p.message_type === "agent" ? "agent-message" : p.message_type === "system" ? "system-message" : p.message_type === "rating" ? "rating-message" : p.message_type === "form" ? "form-message" : p.message_type === "product" || p.shopify_output ? "product-message" : "user-message"
                  ])
                }, [
                  p.message_type === "bot" || p.message_type === "agent" ? (w(), k("div", fw, [
                    Q.value ? (w(), k("img", {
                      key: 0,
                      src: Q.value,
                      class: "cm-msg-avatar-img",
                      alt: ""
                    }, null, 8, hw)) : !Vs.value && E(ft) ? (w(), k("img", {
                      key: 1,
                      src: E(ft),
                      class: "cm-msg-avatar-img",
                      alt: ""
                    }, null, 8, dw)) : (w(), k("div", {
                      key: 2,
                      class: "cm-msg-avatar-orb",
                      style: Ee(Ts.value)
                    }, null, 4))
                  ])) : ee("", !0),
                  g("div", pw, [
                    g("div", {
                      class: "message-bubble",
                      style: Ee(p.message_type === "system" || p.message_type === "rating" || p.message_type === "form" || p.message_type === "product" || p.shopify_output ? {} : p.message_type === "user" ? E(dn) : E(Rn))
                    }, [
                      p.message_type === "rating" ? (w(), k("div", mw, [
                        g("p", gw, "Rate the chat session that you had with " + X(p.agent_name || E(M).human_agent_name || E(r) || "our agent"), 1),
                        g("div", {
                          class: Le(["star-rating", { submitted: Gt.value || p.isSubmitted }])
                        }, [
                          (w(), k(Re, null, dt(5, (F) => g("button", {
                            key: F,
                            class: Le(["star-button", {
                              warning: F <= (p.isSubmitted ? p.finalRating : sn.value || p.selectedRating) && (p.isSubmitted ? p.finalRating : sn.value || p.selectedRating) <= 3,
                              success: F <= (p.isSubmitted ? p.finalRating : sn.value || p.selectedRating) && (p.isSubmitted ? p.finalRating : sn.value || p.selectedRating) > 3,
                              selected: F <= (p.isSubmitted ? p.finalRating : sn.value || p.selectedRating)
                            }]),
                            onMouseover: (Yt) => !p.isSubmitted && _e(F),
                            onMouseleave: (Yt) => !p.isSubmitted && Xe,
                            onClick: (Yt) => !p.isSubmitted && at(F),
                            disabled: Gt.value || p.isSubmitted
                          }, " ★ ", 42, _w)), 64))
                        ], 2),
                        p.showFeedback && !p.isSubmitted ? (w(), k("div", yw, [
                          g("div", vw, [
                            ss(g("input", {
                              "onUpdate:modelValue": (F) => p.feedback = F,
                              placeholder: "Please share your feedback (optional)",
                              disabled: Gt.value,
                              maxlength: "500",
                              class: "feedback-input"
                            }, null, 8, bw), [
                              [xs, p.feedback]
                            ]),
                            g("div", ww, X(((we = p.feedback) == null ? void 0 : we.length) || 0) + "/500", 1)
                          ]),
                          g("button", {
                            onClick: (F) => Et(p.session_id, sn.value, p.feedback),
                            disabled: Gt.value || !sn.value,
                            class: "submit-rating-button",
                            style: Ee({ backgroundColor: E(s).accent_color || "var(--accent-solid)" })
                          }, X(Gt.value ? "Submitting..." : "Submit Rating"), 13, kw)
                        ])) : ee("", !0),
                        p.isSubmitted && p.finalFeedback ? (w(), k("div", Tw, [
                          g("div", Aw, [
                            g("p", Sw, X(p.finalFeedback), 1)
                          ])
                        ])) : p.isSubmitted ? (w(), k("div", Ew, " Thank you for your rating! ")) : ee("", !0)
                      ])) : p.message_type === "form" ? (w(), k("div", xw, [
                        (et = (lt = p.attributes) == null ? void 0 : lt.form_data) != null && et.title || (mr = (pr = p.attributes) == null ? void 0 : pr.form_data) != null && mr.description ? (w(), k("div", Cw, [
                          (Ks = (ns = p.attributes) == null ? void 0 : ns.form_data) != null && Ks.title ? (w(), k("h3", Rw, X(p.attributes.form_data.title), 1)) : ee("", !0),
                          (bl = (vl = p.attributes) == null ? void 0 : vl.form_data) != null && bl.description ? (w(), k("p", Iw, X(p.attributes.form_data.description), 1)) : ee("", !0)
                        ])) : ee("", !0),
                        g("div", Ow, [
                          (w(!0), k(Re, null, dt((kl = (wl = p.attributes) == null ? void 0 : wl.form_data) == null ? void 0 : kl.fields, (F) => {
                            var Yt, gr;
                            return w(), k("div", {
                              key: F.name,
                              class: "form-field"
                            }, [
                              g("label", {
                                for: `form-${F.name}`,
                                class: "field-label"
                              }, [
                                Nn(X(F.label) + " ", 1),
                                F.required ? (w(), k("span", Nw, "*")) : ee("", !0)
                              ], 8, Lw),
                              F.type === "text" || F.type === "email" || F.type === "tel" ? (w(), k("input", {
                                key: 0,
                                id: `form-${F.name}`,
                                type: F.type,
                                placeholder: F.placeholder || "",
                                required: F.required,
                                minlength: F.minLength,
                                maxlength: F.maxLength,
                                value: ht.value[F.name] || "",
                                onInput: (Je) => qe(F.name, Je.target.value),
                                onBlur: (Je) => qe(F.name, Je.target.value),
                                class: Le(["form-input", { error: ut.value[F.name] }]),
                                disabled: vt.value,
                                autocomplete: F.type === "email" ? "email" : F.type === "tel" ? "tel" : "off",
                                inputmode: F.type === "tel" ? "tel" : F.type === "email" ? "email" : "text"
                              }, null, 42, Pw)) : F.type === "number" ? (w(), k("input", {
                                key: 1,
                                id: `form-${F.name}`,
                                type: "number",
                                placeholder: F.placeholder || "",
                                required: F.required,
                                min: F.min,
                                max: F.max,
                                value: ht.value[F.name] || "",
                                onInput: (Je) => qe(F.name, Je.target.value),
                                class: Le(["form-input", { error: ut.value[F.name] }]),
                                disabled: vt.value
                              }, null, 42, Mw)) : F.type === "textarea" ? (w(), k("textarea", {
                                key: 2,
                                id: `form-${F.name}`,
                                placeholder: F.placeholder || "",
                                required: F.required,
                                minlength: F.minLength,
                                maxlength: F.maxLength,
                                value: ht.value[F.name] || "",
                                onInput: (Je) => qe(F.name, Je.target.value),
                                class: Le(["form-textarea", { error: ut.value[F.name] }]),
                                disabled: vt.value,
                                rows: "3"
                              }, null, 42, Dw)) : F.type === "select" ? (w(), k("select", {
                                key: 3,
                                id: `form-${F.name}`,
                                required: F.required,
                                value: ht.value[F.name] || "",
                                onChange: (Je) => qe(F.name, Je.target.value),
                                class: Le(["form-select", { error: ut.value[F.name] }]),
                                disabled: vt.value
                              }, [
                                g("option", $w, X(F.placeholder || "Select an option"), 1),
                                (w(!0), k(Re, null, dt((Array.isArray(F.options) ? F.options : ((Yt = F.options) == null ? void 0 : Yt.split(`
`)) || []).filter((Je) => Je.trim()), (Je) => (w(), k("option", {
                                  key: Je.trim(),
                                  value: Je.trim()
                                }, X(Je.trim()), 9, Bw))), 128))
                              ], 42, Fw)) : F.type === "checkbox" ? (w(), k("div", Uw, [
                                g("input", {
                                  id: `form-${F.name}`,
                                  type: "checkbox",
                                  checked: ht.value[F.name] || !1,
                                  onChange: (Je) => qe(F.name, Je.target.checked),
                                  class: "form-checkbox",
                                  disabled: vt.value
                                }, null, 40, zw),
                                g("label", {
                                  for: `form-${F.name}`,
                                  class: "checkbox-label"
                                }, X(F.placeholder || F.label), 9, Hw)
                              ])) : F.type === "radio" ? (w(), k("div", jw, [
                                (w(!0), k(Re, null, dt((Array.isArray(F.options) ? F.options : ((gr = F.options) == null ? void 0 : gr.split(`
`)) || []).filter((Je) => Je.trim()), (Je) => (w(), k("div", {
                                  key: Je.trim(),
                                  class: "radio-option"
                                }, [
                                  g("input", {
                                    id: `form-${F.name}-${Je.trim()}`,
                                    name: `form-${F.name}`,
                                    type: "radio",
                                    value: Je.trim(),
                                    checked: ht.value[F.name] === Je.trim(),
                                    onChange: (xo) => qe(F.name, Je.trim()),
                                    class: "form-radio",
                                    disabled: vt.value
                                  }, null, 40, Ww),
                                  g("label", {
                                    for: `form-${F.name}-${Je.trim()}`,
                                    class: "radio-label"
                                  }, X(Je.trim()), 9, qw)
                                ]))), 128))
                              ])) : ee("", !0),
                              ut.value[F.name] ? (w(), k("div", Vw, X(ut.value[F.name]), 1)) : ee("", !0)
                            ]);
                          }), 128))
                        ]),
                        g("div", Kw, [
                          g("button", {
                            onClick: () => {
                              var F;
                              console.log("Regular form submit button clicked!"), fr((F = p.attributes) == null ? void 0 : F.form_data);
                            },
                            disabled: vt.value,
                            class: "form-submit-button",
                            style: Ee(E(dn))
                          }, X(vt.value ? "Submitting..." : ((Al = (Tl = p.attributes) == null ? void 0 : Tl.form_data) == null ? void 0 : Al.submit_button_text) || "Submit"), 13, Gw)
                        ])
                      ])) : p.message_type === "user_input" ? (w(), k("div", Yw, [
                        (Sl = p.attributes) != null && Sl.prompt_message && p.attributes.prompt_message.trim() ? (w(), k("div", Xw, X(p.attributes.prompt_message), 1)) : ee("", !0),
                        p.isSubmitted ? (w(), k("div", e0, [
                          m[36] || (m[36] = g("strong", null, "Your input:", -1)),
                          Nn(" " + X(p.submittedValue) + " ", 1),
                          (El = p.attributes) != null && El.confirmation_message && p.attributes.confirmation_message.trim() ? (w(), k("div", t0, X(p.attributes.confirmation_message), 1)) : ee("", !0)
                        ])) : (w(), k("div", Zw, [
                          ss(g("textarea", {
                            "onUpdate:modelValue": (F) => p.userInputValue = F,
                            class: "user-input-textarea",
                            placeholder: "Type your message here...",
                            rows: "3",
                            onKeydown: [
                              xi(Is((F) => vo(p), ["ctrl"]), ["enter"]),
                              xi(Is((F) => vo(p), ["meta"]), ["enter"])
                            ]
                          }, null, 40, Jw), [
                            [xs, p.userInputValue]
                          ]),
                          g("button", {
                            class: "user-input-submit-button",
                            onClick: (F) => vo(p),
                            disabled: !p.userInputValue || !p.userInputValue.trim()
                          }, " Submit ", 8, Qw)
                        ]))
                      ])) : p.shopify_output || p.message_type === "product" ? (w(), k("div", n0, [
                        p.message ? (w(), k("div", {
                          key: 0,
                          innerHTML: E(Ri)(((Cl = (xl = p.shopify_output) == null ? void 0 : xl.products) == null ? void 0 : Cl.length) > 0 ? Hf(p.message) : p.message),
                          class: "product-message-text"
                        }, null, 8, s0)) : ee("", !0),
                        (Rl = p.shopify_output) != null && Rl.products && p.shopify_output.products.length > 0 ? (w(), k("div", r0, [
                          m[38] || (m[38] = g("h3", { class: "carousel-title" }, "Products", -1)),
                          g("div", i0, [
                            (w(!0), k(Re, null, dt(p.shopify_output.products, (F) => {
                              var Yt, gr;
                              return w(), k("div", {
                                key: F.id,
                                class: "product-card-compact carousel-item",
                                role: "group",
                                "aria-label": F.title
                              }, [
                                (Yt = F.image) != null && Yt.src ? (w(), k("div", a0, [
                                  g("img", {
                                    src: F.image.src,
                                    alt: F.title,
                                    class: "product-thumbnail"
                                  }, null, 8, l0)
                                ])) : ee("", !0),
                                g("div", c0, [
                                  g("div", u0, [
                                    g("div", f0, X(F.title), 1),
                                    F.variant_title && F.variant_title !== "Default Title" ? (w(), k("div", h0, X(F.variant_title), 1)) : ee("", !0),
                                    g("div", d0, X(F.price_formatted || E(a)(F.price, F.currency)), 1)
                                  ]),
                                  g("div", p0, [
                                    E(N_)(F, (gr = p.shopify_output) == null ? void 0 : gr.shop_domain) ? (w(), Pn(H_, {
                                      key: 0,
                                      "variant-id": F.cart_variant_id
                                    }, null, 8, ["variant-id"])) : ee("", !0),
                                    g("button", {
                                      class: "view-details-button-compact",
                                      onClick: (Je) => {
                                        var xo;
                                        return zf(F, (xo = p.shopify_output) == null ? void 0 : xo.shop_domain);
                                      }
                                    }, m[37] || (m[37] = [
                                      Nn(" View product ", -1),
                                      g("span", { class: "external-link-icon" }, "↗", -1)
                                    ]), 8, m0)
                                  ])
                                ])
                              ], 8, o0);
                            }), 128))
                          ])
                        ])) : !p.message && ((Il = p.shopify_output) != null && Il.products) && p.shopify_output.products.length === 0 ? (w(), k("div", g0, m[39] || (m[39] = [
                          g("p", null, "No products found.", -1)
                        ]))) : !p.message && p.shopify_output && !p.shopify_output.products ? (w(), k("div", _0, m[40] || (m[40] = [
                          g("p", null, "No products to display.", -1)
                        ]))) : ee("", !0)
                      ])) : (w(), k(Re, { key: 4 }, [
                        E(Z)(le) ? (w(), k("div", {
                          key: 0,
                          class: "message-streaming",
                          innerHTML: E(Ri)(E(se)(le, p.message))
                        }, null, 8, y0)) : (w(), k("div", {
                          key: 1,
                          innerHTML: E(Ri)(p.message)
                        }, null, 8, v0)),
                        p.attachments && p.attachments.length > 0 ? (w(), k("div", b0, [
                          (w(!0), k(Re, null, dt(p.attachments, (F) => (w(), k("div", {
                            key: F.id,
                            class: "attachment-item"
                          }, [
                            E(lr)(F.content_type) ? (w(), k("div", w0, [
                              g("img", {
                                src: E(ys)(F.file_url),
                                alt: F.filename,
                                class: "attachment-image",
                                onClick: Is((Yt) => E(Yn)({ url: F.file_url, filename: F.filename, type: F.content_type, file_url: E(ys)(F.file_url), size: void 0 }), ["stop"]),
                                style: { cursor: "pointer" }
                              }, null, 8, k0),
                              g("div", T0, [
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
                                  Nn(" " + X(F.filename) + " ", 1),
                                  g("span", S0, "(" + X(E(Bs)(F.file_size)) + ")", 1)
                                ], 8, A0)
                              ])
                            ])) : (w(), k("a", {
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
                              Nn(" " + X(F.filename) + " ", 1),
                              g("span", x0, "(" + X(E(Bs)(F.file_size)) + ")", 1)
                            ], 8, E0))
                          ]))), 128))
                        ])) : ee("", !0)
                      ], 64))
                    ], 4),
                    hi.value && (p.message_type === "bot" || p.message_type === "agent") && p.sources && p.sources.length ? (w(), k("div", C0, [
                      m[43] || (m[43] = g("span", { class: "citation-label" }, "Sources", -1)),
                      (w(!0), k(Re, null, dt(p.sources, (F, Yt) => (w(), k("span", {
                        key: Yt,
                        class: "citation-chip",
                        title: pl(F)
                      }, X(ko(F)), 9, R0))), 128))
                    ])) : ee("", !0),
                    g("div", I0, [
                      p.message_type === "user" ? (w(), k("span", O0, " You ")) : ee("", !0)
                    ])
                  ])
                ], 2),
                (w(!0), k(Re, null, dt(E(Fe)(le + 1), (F, Yt) => (w(), Pn(o_, {
                  key: `receipt-${le}-${Yt}`,
                  receipt: F
                }, null, 8, ["receipt"]))), 128))
              ], 64);
            }), 128)),
            E(V).isLast() ? (w(), k("div", L0, [
              Vs.value || !E(ft) ? (w(), k("div", {
                key: 0,
                class: "cm-welcome-orb",
                style: Ee(Ts.value)
              }, null, 4)) : (w(), k("img", {
                key: 1,
                src: E(ft),
                alt: E(r),
                class: "cm-welcome-avatar"
              }, null, 8, N0)),
              g("div", {
                class: "message-bubble cm-welcome-bubble",
                style: Ee(E(Rn))
              }, X((G = q.value) == null ? void 0 : G.message), 5)
            ])) : ee("", !0),
            P.value.length ? (w(), Pn(C_, {
              key: 3,
              chips: P.value,
              disabled: !vn.value || E(yn),
              onPick: U
            }, null, 8, ["chips", "disabled"])) : ee("", !0),
            E(yt) ? (w(), Pn(Qg, {
              key: 4,
              pending: E(yt),
              onApprove: E(Bt),
              onDecline: E(Wt)
            }, null, 8, ["pending", "onApprove", "onDecline"])) : ee("", !0),
            E(u) && !E(yt) ? (w(), k("div", {
              key: 5,
              class: Le(["typing-indicator", { "reading-indicator": hi.value }])
            }, [
              hi.value ? (w(), k(Re, { key: 0 }, [
                m[44] || (m[44] = g("div", {
                  class: "reading-bars",
                  "aria-hidden": "true"
                }, [
                  g("span"),
                  g("span"),
                  g("span")
                ], -1)),
                m[45] || (m[45] = g("span", { class: "reading-label" }, "reading knowledge base", -1))
              ], 64)) : (w(), k("div", {
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
            [cp, !As.value]
          ]),
          th.value ? (w(), k("div", P0, [
            (w(!0), k(Re, null, dt(bo.value, (p) => (w(), k("button", {
              key: p,
              type: "button",
              class: "cm-quick-action",
              disabled: !vn.value,
              onClick: (le) => Xn(p)
            }, X(p), 9, M0))), 128))
          ])) : ee("", !0),
          !B.value && !As.value ? (w(), k("div", {
            key: 6,
            class: Le(["chat-input", { "ask-anything-input": on.value }])
          }, [
            g("input", {
              ref_key: "fileInputRef",
              ref: ei,
              type: "file",
              accept: ck,
              multiple: "",
              style: { display: "none" },
              onChange: m[7] || (m[7] = //@ts-ignore
              (...p) => E(ti) && E(ti)(...p))
            }, null, 544),
            E(Ue).length > 0 ? (w(), k("div", D0, [
              (w(!0), k(Re, null, dt(E(Ue), (p, le) => (w(), k("div", {
                key: le,
                class: "file-preview-widget"
              }, [
                g("div", F0, [
                  E(vs)(p.type) ? (w(), k("img", {
                    key: 0,
                    src: E(cr)(p),
                    alt: p.filename,
                    class: "file-preview-image-widget",
                    onClick: Is((Ze) => E(Yn)(p), ["stop"]),
                    style: { cursor: "pointer" }
                  }, null, 8, $0)) : (w(), k("div", {
                    key: 1,
                    class: "file-preview-icon-widget",
                    onClick: Is((Ze) => E(Yn)(p), ["stop"]),
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
                  ]), 8, B0))
                ]),
                g("div", U0, [
                  g("div", z0, X(p.filename), 1),
                  g("div", H0, X(E(Bs)(p.size)), 1)
                ]),
                g("button", {
                  type: "button",
                  class: "file-preview-remove-widget",
                  onClick: (Ze) => E(ii)(le),
                  title: "Remove file"
                }, " × ", 8, j0)
              ]))), 128))
            ])) : ee("", !0),
            sl.value ? (w(), k("div", W0, m[48] || (m[48] = [
              g("div", { class: "upload-spinner-widget" }, null, -1),
              g("span", { class: "upload-text-widget" }, "Uploading files...", -1)
            ]))) : ee("", !0),
            g("div", q0, [
              ss(g("input", {
                "onUpdate:modelValue": m[8] || (m[8] = (p) => J.value = p),
                type: "text",
                placeholder: Us.value,
                onKeypress: Zn,
                onInput: Te,
                onChange: Te,
                onPaste: m[9] || (m[9] = //@ts-ignore
                (...p) => E(pn) && E(pn)(...p)),
                onDrop: m[10] || (m[10] = //@ts-ignore
                (...p) => E(ni) && E(ni)(...p)),
                onDragover: m[11] || (m[11] = //@ts-ignore
                (...p) => E(si) && E(si)(...p)),
                onDragleave: m[12] || (m[12] = //@ts-ignore
                (...p) => E(ri) && E(ri)(...p)),
                disabled: !bs.value,
                class: Le({ disabled: !bs.value, "ask-anything-field": on.value })
              }, null, 42, V0), [
                [xs, J.value]
              ]),
              jf.value ? (w(), k("button", {
                key: 0,
                type: "button",
                class: "attach-button",
                disabled: sl.value,
                onClick: m[13] || (m[13] = //@ts-ignore
                (...p) => E(oi) && E(oi)(...p)),
                title: `Attach files (${E(Ue).length}/${Vc} used) or paste screenshots`
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
              ]), 8, K0)) : ee("", !0),
              g("button", {
                class: Le(["send-button", { "ask-anything-send": on.value }]),
                "aria-label": "Send message",
                style: Ee(E(dn)),
                onClick: nn,
                disabled: !J.value.trim() && E(Ue).length === 0 || !vn.value || In.value
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
              ]), 14, G0)
            ]),
            In.value ? (w(), k("p", Y0, X(E(W_)), 1)) : ee("", !0)
          ], 2)) : B.value && !As.value ? (w(), k("div", X0, [
            g("div", Z0, [
              m[51] || (m[51] = g("p", { class: "ended-text" }, "This chat has ended.", -1)),
              g("button", {
                class: "start-new-conversation-button",
                style: Ee(E(dn)),
                onClick: Xf
              }, " Click here to start a new conversation ", 4)
            ])
          ])) : ee("", !0),
          dl.value ? (w(), k("div", J0, X(E(Oc)), 1)) : ee("", !0),
          js.value ? (w(), k("div", {
            key: 9,
            class: "powered-by",
            style: Ee(E(Kt))
          }, [
            Dt(Er, {
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
        ur.value ? (w(), k("div", Q0, [
          g("div", ek, [
            m[53] || (m[53] = g("h3", null, "Rate your conversation", -1)),
            g("div", tk, [
              (w(), k(Re, null, dt(5, (p) => g("button", {
                key: p,
                onClick: (le) => ws.value = p,
                class: Le([{ active: p <= ws.value }, "star-button"])
              }, " ★ ", 10, nk)), 64))
            ]),
            ss(g("textarea", {
              "onUpdate:modelValue": m[14] || (m[14] = (p) => Hs.value = p),
              placeholder: "Additional feedback (optional)",
              class: "rating-feedback"
            }, null, 512), [
              [xs, Hs.value]
            ]),
            g("div", sk, [
              g("button", {
                onClick: m[15] || (m[15] = (p) => h.submitRating(ws.value, Hs.value)),
                disabled: !ws.value,
                class: "submit-button",
                style: Ee(E(dn))
              }, " Submit ", 12, rk),
              g("button", {
                onClick: m[16] || (m[16] = (p) => ur.value = !1),
                class: "skip-rating"
              }, " Skip ")
            ])
          ])
        ])) : ee("", !0),
        E(Gn) ? (w(), k("div", {
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
            E(_s) && E(vs)(E(_s).type) ? (w(), k("div", ik, [
              g("img", {
                src: E(cr)(E(_s)),
                alt: E(_s).filename,
                class: "preview-modal-image"
              }, null, 8, ok),
              g("div", ak, X(E(_s).filename), 1)
            ])) : ee("", !0)
          ])
        ])) : ee("", !0)
      ], 6)) : (w(), k("div", lk));
    };
  }
}), fk = /* @__PURE__ */ Wn(uk, [["__scopeId", "data-v-57645127"]]);
window.process || (window.process = { env: { NODE_ENV: "production" } });
async function hk() {
  if (!await uy()) return;
  const e = window.__INITIAL_DATA__, t = new URL(window.location.href), n = t.searchParams.get("preview") === "true", s = (a) => {
    const l = t.searchParams.get(a);
    if (!(!l || l === "undefined" || l.trim() === ""))
      return l;
  }, r = n ? s("widget_id") || (e == null ? void 0 : e.widgetId) || void 0 : (e == null ? void 0 : e.widgetId) || void 0, i = n ? (e == null ? void 0 : e.initialToken) || s("token") || void 0 : (e == null ? void 0 : e.initialToken) || void 0;
  Rp(fk, {
    widgetId: r,
    token: i || void 0,
    initialAuthError: null
    // Let backend determine if auth is required
  }).mount("#app"), fy();
}
hk();
