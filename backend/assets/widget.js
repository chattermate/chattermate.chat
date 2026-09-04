var Wu = Object.defineProperty;
var qu = (e, t, n) => t in e ? Wu(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var et = (e, t, n) => qu(e, typeof t != "symbol" ? t + "" : t, n);
/**
* @vue/shared v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function _o(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const n of e.split(",")) t[n] = 1;
  return (n) => n in t;
}
const tt = {}, ls = [], on = () => {
}, ju = () => !1, Xr = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), yo = (e) => e.startsWith("onUpdate:"), wt = Object.assign, vo = (e, t) => {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}, Vu = Object.prototype.hasOwnProperty, je = (e, t) => Vu.call(e, t), de = Array.isArray, cs = (e) => Zr(e) === "[object Map]", Cl = (e) => Zr(e) === "[object Set]", ye = (e) => typeof e == "function", ft = (e) => typeof e == "string", $n = (e) => typeof e == "symbol", ot = (e) => e !== null && typeof e == "object", Rl = (e) => (ot(e) || ye(e)) && ye(e.then) && ye(e.catch), Il = Object.prototype.toString, Zr = (e) => Il.call(e), Ku = (e) => Zr(e).slice(8, -1), Ll = (e) => Zr(e) === "[object Object]", bo = (e) => ft(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, zs = /* @__PURE__ */ _o(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), Jr = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (n) => t[n] || (t[n] = e(n));
}, Gu = /-(\w)/g, Fn = Jr(
  (e) => e.replace(Gu, (t, n) => n ? n.toUpperCase() : "")
), Yu = /\B([A-Z])/g, Un = Jr(
  (e) => e.replace(Yu, "-$1").toLowerCase()
), Ol = Jr((e) => e.charAt(0).toUpperCase() + e.slice(1)), xi = Jr(
  (e) => e ? `on${Ol(e)}` : ""
), Mn = (e, t) => !Object.is(e, t), kr = (e, ...t) => {
  for (let n = 0; n < e.length; n++)
    e[n](...t);
}, Ki = (e, t, n, s = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: s,
    value: n
  });
}, Gi = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let ka;
const Qr = () => ka || (ka = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function Ee(e) {
  if (de(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
      const s = e[n], r = ft(s) ? Qu(s) : Ee(s);
      if (r)
        for (const i in r)
          t[i] = r[i];
    }
    return t;
  } else if (ft(e) || ot(e))
    return e;
}
const Xu = /;(?![^(]*\))/g, Zu = /:([^]+)/, Ju = /\/\*[^]*?\*\//g;
function Qu(e) {
  const t = {};
  return e.replace(Ju, "").split(Xu).forEach((n) => {
    if (n) {
      const s = n.split(Zu);
      s.length > 1 && (t[s[0].trim()] = s[1].trim());
    }
  }), t;
}
function Ue(e) {
  let t = "";
  if (ft(e))
    t = e;
  else if (de(e))
    for (let n = 0; n < e.length; n++) {
      const s = Ue(e[n]);
      s && (t += s + " ");
    }
  else if (ot(e))
    for (const n in e)
      e[n] && (t += n + " ");
  return t.trim();
}
const ef = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", tf = /* @__PURE__ */ _o(ef);
function Nl(e) {
  return !!e || e === "";
}
const Ml = (e) => !!(e && e.__v_isRef === !0), J = (e) => ft(e) ? e : e == null ? "" : de(e) || ot(e) && (e.toString === Il || !ye(e.toString)) ? Ml(e) ? J(e.value) : JSON.stringify(e, Pl, 2) : String(e), Pl = (e, t) => Ml(t) ? Pl(e, t.value) : cs(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (n, [s, r], i) => (n[Ti(s, i) + " =>"] = r, n),
    {}
  )
} : Cl(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((n) => Ti(n))
} : $n(t) ? Ti(t) : ot(t) && !de(t) && !Ll(t) ? String(t) : t, Ti = (e, t = "") => {
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
let Mt;
class nf {
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
function sf() {
  return Mt;
}
let nt;
const Ai = /* @__PURE__ */ new WeakSet();
class Fl {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, Mt && Mt.active && Mt.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, Ai.has(this) && (Ai.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Bl(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, xa(this), $l(this);
    const t = nt, n = Xt;
    nt = this, Xt = !0;
    try {
      return this.fn();
    } finally {
      Ul(this), nt = t, Xt = n, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        xo(t);
      this.deps = this.depsTail = void 0, xa(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? Ai.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    Yi(this) && this.run();
  }
  get dirty() {
    return Yi(this);
  }
}
let Dl = 0, Hs, Ws;
function Bl(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = Ws, Ws = e;
    return;
  }
  e.next = Hs, Hs = e;
}
function wo() {
  Dl++;
}
function ko() {
  if (--Dl > 0)
    return;
  if (Ws) {
    let t = Ws;
    for (Ws = void 0; t; ) {
      const n = t.next;
      t.next = void 0, t.flags &= -9, t = n;
    }
  }
  let e;
  for (; Hs; ) {
    let t = Hs;
    for (Hs = void 0; t; ) {
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
function $l(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Ul(e) {
  let t, n = e.depsTail, s = n;
  for (; s; ) {
    const r = s.prevDep;
    s.version === -1 ? (s === n && (n = r), xo(s), rf(s)) : t = s, s.dep.activeLink = s.prevActiveLink, s.prevActiveLink = void 0, s = r;
  }
  e.deps = t, e.depsTail = n;
}
function Yi(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (zl(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function zl(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === Ys) || (e.globalVersion = Ys, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !Yi(e))))
    return;
  e.flags |= 2;
  const t = e.dep, n = nt, s = Xt;
  nt = e, Xt = !0;
  try {
    $l(e);
    const r = e.fn(e._value);
    (t.version === 0 || Mn(r, e._value)) && (e.flags |= 128, e._value = r, t.version++);
  } catch (r) {
    throw t.version++, r;
  } finally {
    nt = n, Xt = s, Ul(e), e.flags &= -3;
  }
}
function xo(e, t = !1) {
  const { dep: n, prevSub: s, nextSub: r } = e;
  if (s && (s.nextSub = r, e.prevSub = void 0), r && (r.prevSub = s, e.nextSub = void 0), n.subs === e && (n.subs = s, !s && n.computed)) {
    n.computed.flags &= -5;
    for (let i = n.computed.deps; i; i = i.nextDep)
      xo(i, !0);
  }
  !t && !--n.sc && n.map && n.map.delete(n.key);
}
function rf(e) {
  const { prevDep: t, nextDep: n } = e;
  t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
let Xt = !0;
const Hl = [];
function vn() {
  Hl.push(Xt), Xt = !1;
}
function bn() {
  const e = Hl.pop();
  Xt = e === void 0 ? !0 : e;
}
function xa(e) {
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
let Ys = 0;
class of {
  constructor(t, n) {
    this.sub = t, this.dep = n, this.version = n.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class To {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(t) {
    if (!nt || !Xt || nt === this.computed)
      return;
    let n = this.activeLink;
    if (n === void 0 || n.sub !== nt)
      n = this.activeLink = new of(nt, this), nt.deps ? (n.prevDep = nt.depsTail, nt.depsTail.nextDep = n, nt.depsTail = n) : nt.deps = nt.depsTail = n, Wl(n);
    else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
      const s = n.nextDep;
      s.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = s), n.prevDep = nt.depsTail, n.nextDep = void 0, nt.depsTail.nextDep = n, nt.depsTail = n, nt.deps === n && (nt.deps = s);
    }
    return n;
  }
  trigger(t) {
    this.version++, Ys++, this.notify(t);
  }
  notify(t) {
    wo();
    try {
      for (let n = this.subs; n; n = n.prevSub)
        n.sub.notify() && n.sub.dep.notify();
    } finally {
      ko();
    }
  }
}
function Wl(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let s = t.deps; s; s = s.nextDep)
        Wl(s);
    }
    const n = e.dep.subs;
    n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
  }
}
const Xi = /* @__PURE__ */ new WeakMap(), Jn = Symbol(
  ""
), Zi = Symbol(
  ""
), Xs = Symbol(
  ""
);
function vt(e, t, n) {
  if (Xt && nt) {
    let s = Xi.get(e);
    s || Xi.set(e, s = /* @__PURE__ */ new Map());
    let r = s.get(n);
    r || (s.set(n, r = new To()), r.map = s, r.key = n), r.track();
  }
}
function gn(e, t, n, s, r, i) {
  const o = Xi.get(e);
  if (!o) {
    Ys++;
    return;
  }
  const a = (l) => {
    l && l.trigger();
  };
  if (wo(), t === "clear")
    o.forEach(a);
  else {
    const l = de(e), d = l && bo(n);
    if (l && n === "length") {
      const c = Number(s);
      o.forEach((w, k) => {
        (k === "length" || k === Xs || !$n(k) && k >= c) && a(w);
      });
    } else
      switch ((n !== void 0 || o.has(void 0)) && a(o.get(n)), d && a(o.get(Xs)), t) {
        case "add":
          l ? d && a(o.get("length")) : (a(o.get(Jn)), cs(e) && a(o.get(Zi)));
          break;
        case "delete":
          l || (a(o.get(Jn)), cs(e) && a(o.get(Zi)));
          break;
        case "set":
          cs(e) && a(o.get(Jn));
          break;
      }
  }
  ko();
}
function is(e) {
  const t = qe(e);
  return t === e ? t : (vt(t, "iterate", Xs), Ht(e) ? t : t.map(mt));
}
function ei(e) {
  return vt(e = qe(e), "iterate", Xs), e;
}
const af = {
  __proto__: null,
  [Symbol.iterator]() {
    return Ei(this, Symbol.iterator, mt);
  },
  concat(...e) {
    return is(this).concat(
      ...e.map((t) => de(t) ? is(t) : t)
    );
  },
  entries() {
    return Ei(this, "entries", (e) => (e[1] = mt(e[1]), e));
  },
  every(e, t) {
    return fn(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return fn(this, "filter", e, t, (n) => n.map(mt), arguments);
  },
  find(e, t) {
    return fn(this, "find", e, t, mt, arguments);
  },
  findIndex(e, t) {
    return fn(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return fn(this, "findLast", e, t, mt, arguments);
  },
  findLastIndex(e, t) {
    return fn(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return fn(this, "forEach", e, t, void 0, arguments);
  },
  includes(...e) {
    return Si(this, "includes", e);
  },
  indexOf(...e) {
    return Si(this, "indexOf", e);
  },
  join(e) {
    return is(this).join(e);
  },
  // keys() iterator only reads `length`, no optimisation required
  lastIndexOf(...e) {
    return Si(this, "lastIndexOf", e);
  },
  map(e, t) {
    return fn(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return Es(this, "pop");
  },
  push(...e) {
    return Es(this, "push", e);
  },
  reduce(e, ...t) {
    return Ta(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return Ta(this, "reduceRight", e, t);
  },
  shift() {
    return Es(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return fn(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return Es(this, "splice", e);
  },
  toReversed() {
    return is(this).toReversed();
  },
  toSorted(e) {
    return is(this).toSorted(e);
  },
  toSpliced(...e) {
    return is(this).toSpliced(...e);
  },
  unshift(...e) {
    return Es(this, "unshift", e);
  },
  values() {
    return Ei(this, "values", mt);
  }
};
function Ei(e, t, n) {
  const s = ei(e), r = s[t]();
  return s !== e && !Ht(e) && (r._next = r.next, r.next = () => {
    const i = r._next();
    return i.value && (i.value = n(i.value)), i;
  }), r;
}
const lf = Array.prototype;
function fn(e, t, n, s, r, i) {
  const o = ei(e), a = o !== e && !Ht(e), l = o[t];
  if (l !== lf[t]) {
    const w = l.apply(e, i);
    return a ? mt(w) : w;
  }
  let d = n;
  o !== e && (a ? d = function(w, k) {
    return n.call(this, mt(w), k, e);
  } : n.length > 2 && (d = function(w, k) {
    return n.call(this, w, k, e);
  }));
  const c = l.call(o, d, s);
  return a && r ? r(c) : c;
}
function Ta(e, t, n, s) {
  const r = ei(e);
  let i = n;
  return r !== e && (Ht(e) ? n.length > 3 && (i = function(o, a, l) {
    return n.call(this, o, a, l, e);
  }) : i = function(o, a, l) {
    return n.call(this, o, mt(a), l, e);
  }), r[t](i, ...s);
}
function Si(e, t, n) {
  const s = qe(e);
  vt(s, "iterate", Xs);
  const r = s[t](...n);
  return (r === -1 || r === !1) && So(n[0]) ? (n[0] = qe(n[0]), s[t](...n)) : r;
}
function Es(e, t, n = []) {
  vn(), wo();
  const s = qe(e)[t].apply(e, n);
  return ko(), bn(), s;
}
const cf = /* @__PURE__ */ _o("__proto__,__v_isRef,__isVue"), ql = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter($n)
);
function uf(e) {
  $n(e) || (e = String(e));
  const t = qe(this);
  return vt(t, "has", e), t.hasOwnProperty(e);
}
class jl {
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
      return s === (r ? i ? bf : Yl : i ? Gl : Kl).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(s) ? t : void 0;
    const o = de(t);
    if (!r) {
      let l;
      if (o && (l = af[n]))
        return l;
      if (n === "hasOwnProperty")
        return uf;
    }
    const a = Reflect.get(
      t,
      n,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      bt(t) ? t : s
    );
    return ($n(n) ? ql.has(n) : cf(n)) || (r || vt(t, "get", n), i) ? a : bt(a) ? o && bo(n) ? a : a.value : ot(a) ? r ? Xl(a) : ti(a) : a;
  }
}
class Vl extends jl {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, n, s, r) {
    let i = t[n];
    if (!this._isShallow) {
      const l = Dn(i);
      if (!Ht(s) && !Dn(s) && (i = qe(i), s = qe(s)), !de(t) && bt(i) && !bt(s))
        return l ? !1 : (i.value = s, !0);
    }
    const o = de(t) && bo(n) ? Number(n) < t.length : je(t, n), a = Reflect.set(
      t,
      n,
      s,
      bt(t) ? t : r
    );
    return t === qe(r) && (o ? Mn(s, i) && gn(t, "set", n, s) : gn(t, "add", n, s)), a;
  }
  deleteProperty(t, n) {
    const s = je(t, n);
    t[n];
    const r = Reflect.deleteProperty(t, n);
    return r && s && gn(t, "delete", n, void 0), r;
  }
  has(t, n) {
    const s = Reflect.has(t, n);
    return (!$n(n) || !ql.has(n)) && vt(t, "has", n), s;
  }
  ownKeys(t) {
    return vt(
      t,
      "iterate",
      de(t) ? "length" : Jn
    ), Reflect.ownKeys(t);
  }
}
class ff extends jl {
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
const hf = /* @__PURE__ */ new Vl(), df = /* @__PURE__ */ new ff(), pf = /* @__PURE__ */ new Vl(!0);
const Ji = (e) => e, pr = (e) => Reflect.getPrototypeOf(e);
function gf(e, t, n) {
  return function(...s) {
    const r = this.__v_raw, i = qe(r), o = cs(i), a = e === "entries" || e === Symbol.iterator && o, l = e === "keys" && o, d = r[e](...s), c = n ? Ji : t ? Dr : mt;
    return !t && vt(
      i,
      "iterate",
      l ? Zi : Jn
    ), {
      // iterator protocol
      next() {
        const { value: w, done: k } = d.next();
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
function gr(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function mf(e, t) {
  const n = {
    get(r) {
      const i = this.__v_raw, o = qe(i), a = qe(r);
      e || (Mn(r, a) && vt(o, "get", r), vt(o, "get", a));
      const { has: l } = pr(o), d = t ? Ji : e ? Dr : mt;
      if (l.call(o, r))
        return d(i.get(r));
      if (l.call(o, a))
        return d(i.get(a));
      i !== o && i.get(r);
    },
    get size() {
      const r = this.__v_raw;
      return !e && vt(qe(r), "iterate", Jn), Reflect.get(r, "size", r);
    },
    has(r) {
      const i = this.__v_raw, o = qe(i), a = qe(r);
      return e || (Mn(r, a) && vt(o, "has", r), vt(o, "has", a)), r === a ? i.has(r) : i.has(r) || i.has(a);
    },
    forEach(r, i) {
      const o = this, a = o.__v_raw, l = qe(a), d = t ? Ji : e ? Dr : mt;
      return !e && vt(l, "iterate", Jn), a.forEach((c, w) => r.call(i, d(c), d(w), o));
    }
  };
  return wt(
    n,
    e ? {
      add: gr("add"),
      set: gr("set"),
      delete: gr("delete"),
      clear: gr("clear")
    } : {
      add(r) {
        !t && !Ht(r) && !Dn(r) && (r = qe(r));
        const i = qe(this);
        return pr(i).has.call(i, r) || (i.add(r), gn(i, "add", r, r)), this;
      },
      set(r, i) {
        !t && !Ht(i) && !Dn(i) && (i = qe(i));
        const o = qe(this), { has: a, get: l } = pr(o);
        let d = a.call(o, r);
        d || (r = qe(r), d = a.call(o, r));
        const c = l.call(o, r);
        return o.set(r, i), d ? Mn(i, c) && gn(o, "set", r, i) : gn(o, "add", r, i), this;
      },
      delete(r) {
        const i = qe(this), { has: o, get: a } = pr(i);
        let l = o.call(i, r);
        l || (r = qe(r), l = o.call(i, r)), a && a.call(i, r);
        const d = i.delete(r);
        return l && gn(i, "delete", r, void 0), d;
      },
      clear() {
        const r = qe(this), i = r.size !== 0, o = r.clear();
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
    n[r] = gf(r, e, t);
  }), n;
}
function Ao(e, t) {
  const n = mf(e, t);
  return (s, r, i) => r === "__v_isReactive" ? !e : r === "__v_isReadonly" ? e : r === "__v_raw" ? s : Reflect.get(
    je(n, r) && r in s ? n : s,
    r,
    i
  );
}
const _f = {
  get: /* @__PURE__ */ Ao(!1, !1)
}, yf = {
  get: /* @__PURE__ */ Ao(!1, !0)
}, vf = {
  get: /* @__PURE__ */ Ao(!0, !1)
};
const Kl = /* @__PURE__ */ new WeakMap(), Gl = /* @__PURE__ */ new WeakMap(), Yl = /* @__PURE__ */ new WeakMap(), bf = /* @__PURE__ */ new WeakMap();
function wf(e) {
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
function kf(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : wf(Ku(e));
}
function ti(e) {
  return Dn(e) ? e : Eo(
    e,
    !1,
    hf,
    _f,
    Kl
  );
}
function xf(e) {
  return Eo(
    e,
    !1,
    pf,
    yf,
    Gl
  );
}
function Xl(e) {
  return Eo(
    e,
    !0,
    df,
    vf,
    Yl
  );
}
function Eo(e, t, n, s, r) {
  if (!ot(e) || e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const i = kf(e);
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
function us(e) {
  return Dn(e) ? us(e.__v_raw) : !!(e && e.__v_isReactive);
}
function Dn(e) {
  return !!(e && e.__v_isReadonly);
}
function Ht(e) {
  return !!(e && e.__v_isShallow);
}
function So(e) {
  return e ? !!e.__v_raw : !1;
}
function qe(e) {
  const t = e && e.__v_raw;
  return t ? qe(t) : e;
}
function Tf(e) {
  return !je(e, "__v_skip") && Object.isExtensible(e) && Ki(e, "__v_skip", !0), e;
}
const mt = (e) => ot(e) ? ti(e) : e, Dr = (e) => ot(e) ? Xl(e) : e;
function bt(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function re(e) {
  return Af(e, !1);
}
function Af(e, t) {
  return bt(e) ? e : new Ef(e, t);
}
class Ef {
  constructor(t, n) {
    this.dep = new To(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? t : qe(t), this._value = n ? t : mt(t), this.__v_isShallow = n;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const n = this._rawValue, s = this.__v_isShallow || Ht(t) || Dn(t);
    t = s ? t : qe(t), Mn(t, n) && (this._rawValue = t, this._value = s ? t : mt(t), this.dep.trigger());
  }
}
function C(e) {
  return bt(e) ? e.value : e;
}
const Sf = {
  get: (e, t, n) => t === "__v_raw" ? e : C(Reflect.get(e, t, n)),
  set: (e, t, n, s) => {
    const r = e[t];
    return bt(r) && !bt(n) ? (r.value = n, !0) : Reflect.set(e, t, n, s);
  }
};
function Zl(e) {
  return us(e) ? e : new Proxy(e, Sf);
}
class Cf {
  constructor(t, n, s) {
    this.fn = t, this.setter = n, this._value = void 0, this.dep = new To(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Ys - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = s;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    nt !== this)
      return Bl(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return zl(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
function Rf(e, t, n = !1) {
  let s, r;
  return ye(e) ? s = e : (s = e.get, r = e.set), new Cf(s, r, n);
}
const mr = {}, Br = /* @__PURE__ */ new WeakMap();
let Xn;
function If(e, t = !1, n = Xn) {
  if (n) {
    let s = Br.get(n);
    s || Br.set(n, s = []), s.push(e);
  }
}
function Lf(e, t, n = tt) {
  const { immediate: s, deep: r, once: i, scheduler: o, augmentJob: a, call: l } = n, d = (T) => r ? T : Ht(T) || r === !1 || r === 0 ? mn(T, 1) : mn(T);
  let c, w, k, B, I = !1, j = !1;
  if (bt(e) ? (w = () => e.value, I = Ht(e)) : us(e) ? (w = () => d(e), I = !0) : de(e) ? (j = !0, I = e.some((T) => us(T) || Ht(T)), w = () => e.map((T) => {
    if (bt(T))
      return T.value;
    if (us(T))
      return d(T);
    if (ye(T))
      return l ? l(T, 2) : T();
  })) : ye(e) ? t ? w = l ? () => l(e, 2) : e : w = () => {
    if (k) {
      vn();
      try {
        k();
      } finally {
        bn();
      }
    }
    const T = Xn;
    Xn = c;
    try {
      return l ? l(e, 3, [B]) : e(B);
    } finally {
      Xn = T;
    }
  } : w = on, t && r) {
    const T = w, L = r === !0 ? 1 / 0 : r;
    w = () => mn(T(), L);
  }
  const F = sf(), ie = () => {
    c.stop(), F && F.active && vo(F.effects, c);
  };
  if (i && t) {
    const T = t;
    t = (...L) => {
      T(...L), ie();
    };
  }
  let ce = j ? new Array(e.length).fill(mr) : mr;
  const oe = (T) => {
    if (!(!(c.flags & 1) || !c.dirty && !T))
      if (t) {
        const L = c.run();
        if (r || I || (j ? L.some((K, Y) => Mn(K, ce[Y])) : Mn(L, ce))) {
          k && k();
          const K = Xn;
          Xn = c;
          try {
            const Y = [
              L,
              // pass undefined as the old value when it's changed for the first time
              ce === mr ? void 0 : j && ce[0] === mr ? [] : ce,
              B
            ];
            ce = L, l ? l(t, 3, Y) : (
              // @ts-expect-error
              t(...Y)
            );
          } finally {
            Xn = K;
          }
        }
      } else
        c.run();
  };
  return a && a(oe), c = new Fl(w), c.scheduler = o ? () => o(oe, !1) : oe, B = (T) => If(T, !1, c), k = c.onStop = () => {
    const T = Br.get(c);
    if (T) {
      if (l)
        l(T, 4);
      else
        for (const L of T) L();
      Br.delete(c);
    }
  }, t ? s ? oe(!0) : ce = c.run() : o ? o(oe.bind(null, !0), !0) : c.run(), ie.pause = c.pause.bind(c), ie.resume = c.resume.bind(c), ie.stop = ie, ie;
}
function mn(e, t = 1 / 0, n) {
  if (t <= 0 || !ot(e) || e.__v_skip || (n = n || /* @__PURE__ */ new Set(), n.has(e)))
    return e;
  if (n.add(e), t--, bt(e))
    mn(e.value, t, n);
  else if (de(e))
    for (let s = 0; s < e.length; s++)
      mn(e[s], t, n);
  else if (Cl(e) || cs(e))
    e.forEach((s) => {
      mn(s, t, n);
    });
  else if (Ll(e)) {
    for (const s in e)
      mn(e[s], t, n);
    for (const s of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, s) && mn(e[s], t, n);
  }
  return e;
}
/**
* @vue/runtime-core v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function er(e, t, n, s) {
  try {
    return s ? e(...s) : e();
  } catch (r) {
    ni(r, t, n);
  }
}
function cn(e, t, n, s) {
  if (ye(e)) {
    const r = er(e, t, n, s);
    return r && Rl(r) && r.catch((i) => {
      ni(i, t, n);
    }), r;
  }
  if (de(e)) {
    const r = [];
    for (let i = 0; i < e.length; i++)
      r.push(cn(e[i], t, n, s));
    return r;
  }
}
function ni(e, t, n, s = !0) {
  const r = t ? t.vnode : null, { errorHandler: i, throwUnhandledErrorInProduction: o } = t && t.appContext.config || tt;
  if (t) {
    let a = t.parent;
    const l = t.proxy, d = `https://vuejs.org/error-reference/#runtime-${n}`;
    for (; a; ) {
      const c = a.ec;
      if (c) {
        for (let w = 0; w < c.length; w++)
          if (c[w](e, l, d) === !1)
            return;
      }
      a = a.parent;
    }
    if (i) {
      vn(), er(i, null, 10, [
        e,
        l,
        d
      ]), bn();
      return;
    }
  }
  Of(e, n, r, s, o);
}
function Of(e, t, n, s = !0, r = !1) {
  if (r)
    throw e;
  console.error(e);
}
const St = [];
let sn = -1;
const fs = [];
let Ln = null, os = 0;
const Jl = /* @__PURE__ */ Promise.resolve();
let $r = null;
function Qn(e) {
  const t = $r || Jl;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function Nf(e) {
  let t = sn + 1, n = St.length;
  for (; t < n; ) {
    const s = t + n >>> 1, r = St[s], i = Zs(r);
    i < e || i === e && r.flags & 2 ? t = s + 1 : n = s;
  }
  return t;
}
function Co(e) {
  if (!(e.flags & 1)) {
    const t = Zs(e), n = St[St.length - 1];
    !n || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= Zs(n) ? St.push(e) : St.splice(Nf(t), 0, e), e.flags |= 1, Ql();
  }
}
function Ql() {
  $r || ($r = Jl.then(tc));
}
function Mf(e) {
  de(e) ? fs.push(...e) : Ln && e.id === -1 ? Ln.splice(os + 1, 0, e) : e.flags & 1 || (fs.push(e), e.flags |= 1), Ql();
}
function Aa(e, t, n = sn + 1) {
  for (; n < St.length; n++) {
    const s = St[n];
    if (s && s.flags & 2) {
      if (e && s.id !== e.uid)
        continue;
      St.splice(n, 1), n--, s.flags & 4 && (s.flags &= -2), s(), s.flags & 4 || (s.flags &= -2);
    }
  }
}
function ec(e) {
  if (fs.length) {
    const t = [...new Set(fs)].sort(
      (n, s) => Zs(n) - Zs(s)
    );
    if (fs.length = 0, Ln) {
      Ln.push(...t);
      return;
    }
    for (Ln = t, os = 0; os < Ln.length; os++) {
      const n = Ln[os];
      n.flags & 4 && (n.flags &= -2), n.flags & 8 || n(), n.flags &= -2;
    }
    Ln = null, os = 0;
  }
}
const Zs = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function tc(e) {
  try {
    for (sn = 0; sn < St.length; sn++) {
      const t = St[sn];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), er(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; sn < St.length; sn++) {
      const t = St[sn];
      t && (t.flags &= -2);
    }
    sn = -1, St.length = 0, ec(), $r = null, (St.length || fs.length) && tc();
  }
}
let zt = null, nc = null;
function Ur(e) {
  const t = zt;
  return zt = e, nc = e && e.type.__scopeId || null, t;
}
function Pf(e, t = zt, n) {
  if (!t || e._n)
    return e;
  const s = (...r) => {
    s._d && Ma(-1);
    const i = Ur(t);
    let o;
    try {
      o = e(...r);
    } finally {
      Ur(i), s._d && Ma(1);
    }
    return o;
  };
  return s._n = !0, s._c = !0, s._d = !0, s;
}
function In(e, t) {
  if (zt === null)
    return e;
  const n = ai(zt), s = e.dirs || (e.dirs = []);
  for (let r = 0; r < t.length; r++) {
    let [i, o, a, l = tt] = t[r];
    i && (ye(i) && (i = {
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
  return e;
}
function Vn(e, t, n, s) {
  const r = e.dirs, i = t && t.dirs;
  for (let o = 0; o < r.length; o++) {
    const a = r[o];
    i && (a.oldValue = i[o].value);
    let l = a.dir[s];
    l && (vn(), cn(l, n, 8, [
      e.el,
      a,
      e,
      t
    ]), bn());
  }
}
const Ff = Symbol("_vte"), Df = (e) => e.__isTeleport;
function Ro(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, Ro(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function Io(e, t) {
  return ye(e) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    wt({ name: e.name }, t, { setup: e })
  ) : e;
}
function sc(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
function qs(e, t, n, s, r = !1) {
  if (de(e)) {
    e.forEach(
      (I, j) => qs(
        I,
        t && (de(t) ? t[j] : t),
        n,
        s,
        r
      )
    );
    return;
  }
  if (js(s) && !r) {
    s.shapeFlag & 512 && s.type.__asyncResolved && s.component.subTree.component && qs(e, t, n, s.component.subTree);
    return;
  }
  const i = s.shapeFlag & 4 ? ai(s.component) : s.el, o = r ? null : i, { i: a, r: l } = e, d = t && t.r, c = a.refs === tt ? a.refs = {} : a.refs, w = a.setupState, k = qe(w), B = w === tt ? () => !1 : (I) => je(k, I);
  if (d != null && d !== l && (ft(d) ? (c[d] = null, B(d) && (w[d] = null)) : bt(d) && (d.value = null)), ye(l))
    er(l, a, 12, [o, c]);
  else {
    const I = ft(l), j = bt(l);
    if (I || j) {
      const F = () => {
        if (e.f) {
          const ie = I ? B(l) ? w[l] : c[l] : l.value;
          r ? de(ie) && vo(ie, i) : de(ie) ? ie.includes(i) || ie.push(i) : I ? (c[l] = [i], B(l) && (w[l] = c[l])) : (l.value = [i], e.k && (c[e.k] = l.value));
        } else I ? (c[l] = o, B(l) && (w[l] = o)) : j && (l.value = o, e.k && (c[e.k] = o));
      };
      o ? (F.id = -1, Ft(F, n)) : F();
    }
  }
}
Qr().requestIdleCallback;
Qr().cancelIdleCallback;
const js = (e) => !!e.type.__asyncLoader, rc = (e) => e.type.__isKeepAlive;
function Bf(e, t) {
  ic(e, "a", t);
}
function $f(e, t) {
  ic(e, "da", t);
}
function ic(e, t, n = Ct) {
  const s = e.__wdc || (e.__wdc = () => {
    let r = n;
    for (; r; ) {
      if (r.isDeactivated)
        return;
      r = r.parent;
    }
    return e();
  });
  if (si(t, s, n), n) {
    let r = n.parent;
    for (; r && r.parent; )
      rc(r.parent.vnode) && Uf(s, t, n, r), r = r.parent;
  }
}
function Uf(e, t, n, s) {
  const r = si(
    t,
    e,
    s,
    !0
    /* prepend */
  );
  tr(() => {
    vo(s[t], r);
  }, n);
}
function si(e, t, n = Ct, s = !1) {
  if (n) {
    const r = n[e] || (n[e] = []), i = t.__weh || (t.__weh = (...o) => {
      vn();
      const a = nr(n), l = cn(t, n, e, o);
      return a(), bn(), l;
    });
    return s ? r.unshift(i) : r.push(i), i;
  }
}
const wn = (e) => (t, n = Ct) => {
  (!Qs || e === "sp") && si(e, (...s) => t(...s), n);
}, zf = wn("bm"), ri = wn("m"), Hf = wn(
  "bu"
), Wf = wn("u"), oc = wn(
  "bum"
), tr = wn("um"), qf = wn(
  "sp"
), jf = wn("rtg"), Vf = wn("rtc");
function Kf(e, t = Ct) {
  si("ec", e, t);
}
const Gf = Symbol.for("v-ndc");
function gt(e, t, n, s) {
  let r;
  const i = n, o = de(e);
  if (o || ft(e)) {
    const a = o && us(e);
    let l = !1, d = !1;
    a && (l = !Ht(e), d = Dn(e), e = ei(e)), r = new Array(e.length);
    for (let c = 0, w = e.length; c < w; c++)
      r[c] = t(
        l ? d ? Dr(mt(e[c])) : mt(e[c]) : e[c],
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
const Qi = (e) => e ? Sc(e) ? ai(e) : Qi(e.parent) : null, Vs = (
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
    $parent: (e) => Qi(e.parent),
    $root: (e) => Qi(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => lc(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      Co(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = Qn.bind(e.proxy)),
    $watch: (e) => mh.bind(e)
  })
), Ci = (e, t) => e !== tt && !e.__isScriptSetup && je(e, t), Yf = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: n, setupState: s, data: r, props: i, accessCache: o, type: a, appContext: l } = e;
    let d;
    if (t[0] !== "$") {
      const B = o[t];
      if (B !== void 0)
        switch (B) {
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
        if (Ci(s, t))
          return o[t] = 1, s[t];
        if (r !== tt && je(r, t))
          return o[t] = 2, r[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (d = e.propsOptions[0]) && je(d, t)
        )
          return o[t] = 3, i[t];
        if (n !== tt && je(n, t))
          return o[t] = 4, n[t];
        eo && (o[t] = 0);
      }
    }
    const c = Vs[t];
    let w, k;
    if (c)
      return t === "$attrs" && vt(e.attrs, "get", ""), c(e);
    if (
      // css module (injected by vue-loader)
      (w = a.__cssModules) && (w = w[t])
    )
      return w;
    if (n !== tt && je(n, t))
      return o[t] = 4, n[t];
    if (
      // global properties
      k = l.config.globalProperties, je(k, t)
    )
      return k[t];
  },
  set({ _: e }, t, n) {
    const { data: s, setupState: r, ctx: i } = e;
    return Ci(r, t) ? (r[t] = n, !0) : s !== tt && je(s, t) ? (s[t] = n, !0) : je(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (i[t] = n, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: n, ctx: s, appContext: r, propsOptions: i }
  }, o) {
    let a;
    return !!n[o] || e !== tt && je(e, o) || Ci(t, o) || (a = i[0]) && je(a, o) || je(s, o) || je(Vs, o) || je(r.config.globalProperties, o);
  },
  defineProperty(e, t, n) {
    return n.get != null ? e._.accessCache[t] = 0 : je(n, "value") && this.set(e, t, n.value, null), Reflect.defineProperty(e, t, n);
  }
};
function Ea(e) {
  return de(e) ? e.reduce(
    (t, n) => (t[n] = null, t),
    {}
  ) : e;
}
let eo = !0;
function Xf(e) {
  const t = lc(e), n = e.proxy, s = e.ctx;
  eo = !1, t.beforeCreate && Sa(t.beforeCreate, e, "bc");
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
    beforeMount: w,
    mounted: k,
    beforeUpdate: B,
    updated: I,
    activated: j,
    deactivated: F,
    beforeDestroy: ie,
    beforeUnmount: ce,
    destroyed: oe,
    unmounted: T,
    render: L,
    renderTracked: K,
    renderTriggered: Y,
    errorCaptured: ve,
    serverPrefetch: Me,
    // public API
    expose: Be,
    inheritAttrs: xe,
    // assets
    components: pe,
    directives: Ye,
    filters: Xe
  } = t;
  if (d && Zf(d, s, null), o)
    for (const ge in o) {
      const ae = o[ge];
      ye(ae) && (s[ge] = ae.bind(n));
    }
  if (r) {
    const ge = r.call(n, n);
    ot(ge) && (e.data = ti(ge));
  }
  if (eo = !0, i)
    for (const ge in i) {
      const ae = i[ge], st = ye(ae) ? ae.bind(n, n) : ye(ae.get) ? ae.get.bind(n, n) : on, Te = !ye(ae) && ye(ae.set) ? ae.set.bind(n) : on, be = le({
        get: st,
        set: Te
      });
      Object.defineProperty(s, ge, {
        enumerable: !0,
        configurable: !0,
        get: () => be.value,
        set: (Se) => be.value = Se
      });
    }
  if (a)
    for (const ge in a)
      ac(a[ge], s, n, ge);
  if (l) {
    const ge = ye(l) ? l.call(n) : l;
    Reflect.ownKeys(ge).forEach((ae) => {
      sh(ae, ge[ae]);
    });
  }
  c && Sa(c, e, "c");
  function fe(ge, ae) {
    de(ae) ? ae.forEach((st) => ge(st.bind(n))) : ae && ge(ae.bind(n));
  }
  if (fe(zf, w), fe(ri, k), fe(Hf, B), fe(Wf, I), fe(Bf, j), fe($f, F), fe(Kf, ve), fe(Vf, K), fe(jf, Y), fe(oc, ce), fe(tr, T), fe(qf, Me), de(Be))
    if (Be.length) {
      const ge = e.exposed || (e.exposed = {});
      Be.forEach((ae) => {
        Object.defineProperty(ge, ae, {
          get: () => n[ae],
          set: (st) => n[ae] = st,
          enumerable: !0
        });
      });
    } else e.exposed || (e.exposed = {});
  L && e.render === on && (e.render = L), xe != null && (e.inheritAttrs = xe), pe && (e.components = pe), Ye && (e.directives = Ye), Me && sc(e);
}
function Zf(e, t, n = on) {
  de(e) && (e = to(e));
  for (const s in e) {
    const r = e[s];
    let i;
    ot(r) ? "default" in r ? i = xr(
      r.from || s,
      r.default,
      !0
    ) : i = xr(r.from || s) : i = xr(r), bt(i) ? Object.defineProperty(t, s, {
      enumerable: !0,
      configurable: !0,
      get: () => i.value,
      set: (o) => i.value = o
    }) : t[s] = i;
  }
}
function Sa(e, t, n) {
  cn(
    de(e) ? e.map((s) => s.bind(t.proxy)) : e.bind(t.proxy),
    t,
    n
  );
}
function ac(e, t, n, s) {
  let r = s.includes(".") ? wc(n, s) : () => n[s];
  if (ft(e)) {
    const i = t[e];
    ye(i) && Pt(r, i);
  } else if (ye(e))
    Pt(r, e.bind(n));
  else if (ot(e))
    if (de(e))
      e.forEach((i) => ac(i, t, n, s));
    else {
      const i = ye(e.handler) ? e.handler.bind(n) : t[e.handler];
      ye(i) && Pt(r, i, e);
    }
}
function lc(e) {
  const t = e.type, { mixins: n, extends: s } = t, {
    mixins: r,
    optionsCache: i,
    config: { optionMergeStrategies: o }
  } = e.appContext, a = i.get(t);
  let l;
  return a ? l = a : !r.length && !n && !s ? l = t : (l = {}, r.length && r.forEach(
    (d) => zr(l, d, o, !0)
  ), zr(l, t, o)), ot(t) && i.set(t, l), l;
}
function zr(e, t, n, s = !1) {
  const { mixins: r, extends: i } = t;
  i && zr(e, i, n, !0), r && r.forEach(
    (o) => zr(e, o, n, !0)
  );
  for (const o in t)
    if (!(s && o === "expose")) {
      const a = Jf[o] || n && n[o];
      e[o] = a ? a(e[o], t[o]) : t[o];
    }
  return e;
}
const Jf = {
  data: Ca,
  props: Ra,
  emits: Ra,
  // objects
  methods: Bs,
  computed: Bs,
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
  components: Bs,
  directives: Bs,
  // watch
  watch: eh,
  // provide / inject
  provide: Ca,
  inject: Qf
};
function Ca(e, t) {
  return t ? e ? function() {
    return wt(
      ye(e) ? e.call(this, this) : e,
      ye(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function Qf(e, t) {
  return Bs(to(e), to(t));
}
function to(e) {
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
function Bs(e, t) {
  return e ? wt(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function Ra(e, t) {
  return e ? de(e) && de(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : wt(
    /* @__PURE__ */ Object.create(null),
    Ea(e),
    Ea(t ?? {})
  ) : t;
}
function eh(e, t) {
  if (!e) return t;
  if (!t) return e;
  const n = wt(/* @__PURE__ */ Object.create(null), e);
  for (const s in t)
    n[s] = Et(e[s], t[s]);
  return n;
}
function cc() {
  return {
    app: null,
    config: {
      isNativeTag: ju,
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
let th = 0;
function nh(e, t) {
  return function(s, r = null) {
    ye(s) || (s = wt({}, s)), r != null && !ot(r) && (r = null);
    const i = cc(), o = /* @__PURE__ */ new WeakSet(), a = [];
    let l = !1;
    const d = i.app = {
      _uid: th++,
      _component: s,
      _props: r,
      _container: null,
      _context: i,
      _instance: null,
      version: Dh,
      get config() {
        return i.config;
      },
      set config(c) {
      },
      use(c, ...w) {
        return o.has(c) || (c && ye(c.install) ? (o.add(c), c.install(d, ...w)) : ye(c) && (o.add(c), c(d, ...w))), d;
      },
      mixin(c) {
        return i.mixins.includes(c) || i.mixins.push(c), d;
      },
      component(c, w) {
        return w ? (i.components[c] = w, d) : i.components[c];
      },
      directive(c, w) {
        return w ? (i.directives[c] = w, d) : i.directives[c];
      },
      mount(c, w, k) {
        if (!l) {
          const B = d._ceVNode || an(s, r);
          return B.appContext = i, k === !0 ? k = "svg" : k === !1 && (k = void 0), e(B, c, k), l = !0, d._container = c, c.__vue_app__ = d, ai(B.component);
        }
      },
      onUnmount(c) {
        a.push(c);
      },
      unmount() {
        l && (cn(
          a,
          d._instance,
          16
        ), e(null, d._container), delete d._container.__vue_app__);
      },
      provide(c, w) {
        return i.provides[c] = w, d;
      },
      runWithContext(c) {
        const w = hs;
        hs = d;
        try {
          return c();
        } finally {
          hs = w;
        }
      }
    };
    return d;
  };
}
let hs = null;
function sh(e, t) {
  if (Ct) {
    let n = Ct.provides;
    const s = Ct.parent && Ct.parent.provides;
    s === n && (n = Ct.provides = Object.create(s)), n[e] = t;
  }
}
function xr(e, t, n = !1) {
  const s = Lh();
  if (s || hs) {
    let r = hs ? hs._context.provides : s ? s.parent == null || s.ce ? s.vnode.appContext && s.vnode.appContext.provides : s.parent.provides : void 0;
    if (r && e in r)
      return r[e];
    if (arguments.length > 1)
      return n && ye(t) ? t.call(s && s.proxy) : t;
  }
}
const uc = {}, fc = () => Object.create(uc), hc = (e) => Object.getPrototypeOf(e) === uc;
function rh(e, t, n, s = !1) {
  const r = {}, i = fc();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), dc(e, t, r, i);
  for (const o in e.propsOptions[0])
    o in r || (r[o] = void 0);
  n ? e.props = s ? r : xf(r) : e.type.props ? e.props = r : e.props = i, e.attrs = i;
}
function ih(e, t, n, s) {
  const {
    props: r,
    attrs: i,
    vnode: { patchFlag: o }
  } = e, a = qe(r), [l] = e.propsOptions;
  let d = !1;
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
        if (ii(e.emitsOptions, k))
          continue;
        const B = t[k];
        if (l)
          if (je(i, k))
            B !== i[k] && (i[k] = B, d = !0);
          else {
            const I = Fn(k);
            r[I] = no(
              l,
              a,
              I,
              B,
              e,
              !1
            );
          }
        else
          B !== i[k] && (i[k] = B, d = !0);
      }
    }
  } else {
    dc(e, t, r, i) && (d = !0);
    let c;
    for (const w in a)
      (!t || // for camelCase
      !je(t, w) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((c = Un(w)) === w || !je(t, c))) && (l ? n && // for camelCase
      (n[w] !== void 0 || // for kebab-case
      n[c] !== void 0) && (r[w] = no(
        l,
        a,
        w,
        void 0,
        e,
        !0
      )) : delete r[w]);
    if (i !== a)
      for (const w in i)
        (!t || !je(t, w)) && (delete i[w], d = !0);
  }
  d && gn(e.attrs, "set", "");
}
function dc(e, t, n, s) {
  const [r, i] = e.propsOptions;
  let o = !1, a;
  if (t)
    for (let l in t) {
      if (zs(l))
        continue;
      const d = t[l];
      let c;
      r && je(r, c = Fn(l)) ? !i || !i.includes(c) ? n[c] = d : (a || (a = {}))[c] = d : ii(e.emitsOptions, l) || (!(l in s) || d !== s[l]) && (s[l] = d, o = !0);
    }
  if (i) {
    const l = qe(n), d = a || tt;
    for (let c = 0; c < i.length; c++) {
      const w = i[c];
      n[w] = no(
        r,
        l,
        w,
        d[w],
        e,
        !je(d, w)
      );
    }
  }
  return o;
}
function no(e, t, n, s, r, i) {
  const o = e[n];
  if (o != null) {
    const a = je(o, "default");
    if (a && s === void 0) {
      const l = o.default;
      if (o.type !== Function && !o.skipFactory && ye(l)) {
        const { propsDefaults: d } = r;
        if (n in d)
          s = d[n];
        else {
          const c = nr(r);
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
    ] && (s === "" || s === Un(n)) && (s = !0));
  }
  return s;
}
const oh = /* @__PURE__ */ new WeakMap();
function pc(e, t, n = !1) {
  const s = n ? oh : t.propsCache, r = s.get(e);
  if (r)
    return r;
  const i = e.props, o = {}, a = [];
  let l = !1;
  if (!ye(e)) {
    const c = (w) => {
      l = !0;
      const [k, B] = pc(w, t, !0);
      wt(o, k), B && a.push(...B);
    };
    !n && t.mixins.length && t.mixins.forEach(c), e.extends && c(e.extends), e.mixins && e.mixins.forEach(c);
  }
  if (!i && !l)
    return ot(e) && s.set(e, ls), ls;
  if (de(i))
    for (let c = 0; c < i.length; c++) {
      const w = Fn(i[c]);
      Ia(w) && (o[w] = tt);
    }
  else if (i)
    for (const c in i) {
      const w = Fn(c);
      if (Ia(w)) {
        const k = i[c], B = o[w] = de(k) || ye(k) ? { type: k } : wt({}, k), I = B.type;
        let j = !1, F = !0;
        if (de(I))
          for (let ie = 0; ie < I.length; ++ie) {
            const ce = I[ie], oe = ye(ce) && ce.name;
            if (oe === "Boolean") {
              j = !0;
              break;
            } else oe === "String" && (F = !1);
          }
        else
          j = ye(I) && I.name === "Boolean";
        B[
          0
          /* shouldCast */
        ] = j, B[
          1
          /* shouldCastTrue */
        ] = F, (j || je(B, "default")) && a.push(w);
      }
    }
  const d = [o, a];
  return ot(e) && s.set(e, d), d;
}
function Ia(e) {
  return e[0] !== "$" && !zs(e);
}
const Lo = (e) => e === "_" || e === "__" || e === "_ctx" || e === "$stable", Oo = (e) => de(e) ? e.map(rn) : [rn(e)], ah = (e, t, n) => {
  if (t._n)
    return t;
  const s = Pf((...r) => Oo(t(...r)), n);
  return s._c = !1, s;
}, gc = (e, t, n) => {
  const s = e._ctx;
  for (const r in e) {
    if (Lo(r)) continue;
    const i = e[r];
    if (ye(i))
      t[r] = ah(r, i, s);
    else if (i != null) {
      const o = Oo(i);
      t[r] = () => o;
    }
  }
}, mc = (e, t) => {
  const n = Oo(t);
  e.slots.default = () => n;
}, _c = (e, t, n) => {
  for (const s in t)
    (n || !Lo(s)) && (e[s] = t[s]);
}, lh = (e, t, n) => {
  const s = e.slots = fc();
  if (e.vnode.shapeFlag & 32) {
    const r = t.__;
    r && Ki(s, "__", r, !0);
    const i = t._;
    i ? (_c(s, t, n), n && Ki(s, "_", i, !0)) : gc(t, s);
  } else t && mc(e, t);
}, ch = (e, t, n) => {
  const { vnode: s, slots: r } = e;
  let i = !0, o = tt;
  if (s.shapeFlag & 32) {
    const a = t._;
    a ? n && a === 1 ? i = !1 : _c(r, t, n) : (i = !t.$stable, gc(t, r)), o = t;
  } else t && (mc(e, t), o = { default: 1 });
  if (i)
    for (const a in r)
      !Lo(a) && o[a] == null && delete r[a];
}, Ft = xh;
function uh(e) {
  return fh(e);
}
function fh(e, t) {
  const n = Qr();
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
    parentNode: w,
    nextSibling: k,
    setScopeId: B = on,
    insertStaticContent: I
  } = e, j = (g, _, E, $ = null, N = null, D = null, V = void 0, W = null, q = !!_.dynamicChildren) => {
    if (g === _)
      return;
    g && !Ss(g, _) && ($ = ht(g), Se(g, N, D, !0), g = null), _.patchFlag === -2 && (q = !1, _.dynamicChildren = null);
    const { type: b, ref: R, shapeFlag: M } = _;
    switch (b) {
      case oi:
        F(g, _, E, $);
        break;
      case Bn:
        ie(g, _, E, $);
        break;
      case Tr:
        g == null && ce(_, E, $, V);
        break;
      case ze:
        pe(
          g,
          _,
          E,
          $,
          N,
          D,
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
          D,
          V,
          W,
          q
        ) : M & 6 ? Ye(
          g,
          _,
          E,
          $,
          N,
          D,
          V,
          W,
          q
        ) : (M & 64 || M & 128) && b.process(
          g,
          _,
          E,
          $,
          N,
          D,
          V,
          W,
          q,
          pt
        );
    }
    R != null && N ? qs(R, g && g.ref, D, _ || g, !_) : R == null && g && g.ref != null && qs(g.ref, null, D, g, !0);
  }, F = (g, _, E, $) => {
    if (g == null)
      s(
        _.el = a(_.children),
        E,
        $
      );
    else {
      const N = _.el = g.el;
      _.children !== g.children && d(N, _.children);
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
  }, T = ({ el: g, anchor: _ }) => {
    let E;
    for (; g && g !== _; )
      E = k(g), r(g), g = E;
    r(_);
  }, L = (g, _, E, $, N, D, V, W, q) => {
    _.type === "svg" ? V = "svg" : _.type === "math" && (V = "mathml"), g == null ? K(
      _,
      E,
      $,
      N,
      D,
      V,
      W,
      q
    ) : Me(
      g,
      _,
      N,
      D,
      V,
      W,
      q
    );
  }, K = (g, _, E, $, N, D, V, W) => {
    let q, b;
    const { props: R, shapeFlag: M, transition: H, dirs: G } = g;
    if (q = g.el = o(
      g.type,
      D,
      R && R.is,
      R
    ), M & 8 ? c(q, g.children) : M & 16 && ve(
      g.children,
      q,
      null,
      $,
      N,
      Ri(g, D),
      V,
      W
    ), G && Vn(g, null, $, "created"), Y(q, g, g.scopeId, V, $), R) {
      for (const _e in R)
        _e !== "value" && !zs(_e) && i(q, _e, null, R[_e], D, $);
      "value" in R && i(q, "value", null, R.value, D), (b = R.onVnodeBeforeMount) && en(b, $, g);
    }
    G && Vn(g, null, $, "beforeMount");
    const ne = hh(N, H);
    ne && H.beforeEnter(q), s(q, _, E), ((b = R && R.onVnodeMounted) || ne || G) && Ft(() => {
      b && en(b, $, g), ne && H.enter(q), G && Vn(g, null, $, "mounted");
    }, N);
  }, Y = (g, _, E, $, N) => {
    if (E && B(g, E), $)
      for (let D = 0; D < $.length; D++)
        B(g, $[D]);
    if (N) {
      let D = N.subTree;
      if (_ === D || xc(D.type) && (D.ssContent === _ || D.ssFallback === _)) {
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
  }, ve = (g, _, E, $, N, D, V, W, q = 0) => {
    for (let b = q; b < g.length; b++) {
      const R = g[b] = W ? On(g[b]) : rn(g[b]);
      j(
        null,
        R,
        _,
        E,
        $,
        N,
        D,
        V,
        W
      );
    }
  }, Me = (g, _, E, $, N, D, V) => {
    const W = _.el = g.el;
    let { patchFlag: q, dynamicChildren: b, dirs: R } = _;
    q |= g.patchFlag & 16;
    const M = g.props || tt, H = _.props || tt;
    let G;
    if (E && Kn(E, !1), (G = H.onVnodeBeforeUpdate) && en(G, E, _, g), R && Vn(_, g, E, "beforeUpdate"), E && Kn(E, !0), (M.innerHTML && H.innerHTML == null || M.textContent && H.textContent == null) && c(W, ""), b ? Be(
      g.dynamicChildren,
      b,
      W,
      E,
      $,
      Ri(_, N),
      D
    ) : V || ae(
      g,
      _,
      W,
      null,
      E,
      $,
      Ri(_, N),
      D,
      !1
    ), q > 0) {
      if (q & 16)
        xe(W, M, H, E, N);
      else if (q & 2 && M.class !== H.class && i(W, "class", null, H.class, N), q & 4 && i(W, "style", M.style, H.style, N), q & 8) {
        const ne = _.dynamicProps;
        for (let _e = 0; _e < ne.length; _e++) {
          const ue = ne[_e], Qe = M[ue], Ce = H[ue];
          (Ce !== Qe || ue === "value") && i(W, ue, Qe, Ce, N, E);
        }
      }
      q & 1 && g.children !== _.children && c(W, _.children);
    } else !V && b == null && xe(W, M, H, E, N);
    ((G = H.onVnodeUpdated) || R) && Ft(() => {
      G && en(G, E, _, g), R && Vn(_, g, E, "updated");
    }, $);
  }, Be = (g, _, E, $, N, D, V) => {
    for (let W = 0; W < _.length; W++) {
      const q = g[W], b = _[W], R = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        q.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (q.type === ze || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !Ss(q, b) || // - In the case of a component, it could contain anything.
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
        D,
        V,
        !0
      );
    }
  }, xe = (g, _, E, $, N) => {
    if (_ !== E) {
      if (_ !== tt)
        for (const D in _)
          !zs(D) && !(D in E) && i(
            g,
            D,
            _[D],
            null,
            N,
            $
          );
      for (const D in E) {
        if (zs(D)) continue;
        const V = E[D], W = _[D];
        V !== W && D !== "value" && i(g, D, W, V, N, $);
      }
      "value" in E && i(g, "value", _.value, E.value, N);
    }
  }, pe = (g, _, E, $, N, D, V, W, q) => {
    const b = _.el = g ? g.el : a(""), R = _.anchor = g ? g.anchor : a("");
    let { patchFlag: M, dynamicChildren: H, slotScopeIds: G } = _;
    G && (W = W ? W.concat(G) : G), g == null ? (s(b, E, $), s(R, E, $), ve(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      _.children || [],
      E,
      R,
      N,
      D,
      V,
      W,
      q
    )) : M > 0 && M & 64 && H && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    g.dynamicChildren ? (Be(
      g.dynamicChildren,
      H,
      E,
      N,
      D,
      V,
      W
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (_.key != null || N && _ === N.subTree) && yc(
      g,
      _,
      !0
      /* shallow */
    )) : ae(
      g,
      _,
      E,
      R,
      N,
      D,
      V,
      W,
      q
    );
  }, Ye = (g, _, E, $, N, D, V, W, q) => {
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
      D,
      V,
      q
    ) : rt(g, _, q);
  }, Xe = (g, _, E, $, N, D, V) => {
    const W = g.component = Ih(
      g,
      $,
      N
    );
    if (rc(g) && (W.ctx.renderer = pt), Oh(W, !1, V), W.asyncDep) {
      if (N && N.registerDep(W, fe, V), !g.el) {
        const q = W.subTree = an(Bn);
        ie(null, q, _, E), g.placeholder = q.el;
      }
    } else
      fe(
        W,
        g,
        _,
        E,
        N,
        D,
        V
      );
  }, rt = (g, _, E) => {
    const $ = _.component = g.component;
    if (wh(g, _, E))
      if ($.asyncDep && !$.asyncResolved) {
        ge($, _, E);
        return;
      } else
        $.next = _, $.update();
    else
      _.el = g.el, $.vnode = _;
  }, fe = (g, _, E, $, N, D, V) => {
    const W = () => {
      if (g.isMounted) {
        let { next: M, bu: H, u: G, parent: ne, vnode: _e } = g;
        {
          const f = vc(g);
          if (f) {
            M && (M.el = _e.el, ge(g, M, V)), f.asyncDep.then(() => {
              g.isUnmounted || W();
            });
            return;
          }
        }
        let ue = M, Qe;
        Kn(g, !1), M ? (M.el = _e.el, ge(g, M, V)) : M = _e, H && kr(H), (Qe = M.props && M.props.onVnodeBeforeUpdate) && en(Qe, ne, M, _e), Kn(g, !0);
        const Ce = Oa(g), Ke = g.subTree;
        g.subTree = Ce, j(
          Ke,
          Ce,
          // parent may have changed if it's in a teleport
          w(Ke.el),
          // anchor may have changed if it's in a fragment
          ht(Ke),
          g,
          N,
          D
        ), M.el = Ce.el, ue === null && kh(g, Ce.el), G && Ft(G, N), (Qe = M.props && M.props.onVnodeUpdated) && Ft(
          () => en(Qe, ne, M, _e),
          N
        );
      } else {
        let M;
        const { el: H, props: G } = _, { bm: ne, m: _e, parent: ue, root: Qe, type: Ce } = g, Ke = js(_);
        Kn(g, !1), ne && kr(ne), !Ke && (M = G && G.onVnodeBeforeMount) && en(M, ue, _), Kn(g, !0);
        {
          Qe.ce && // @ts-expect-error _def is private
          Qe.ce._def.shadowRoot !== !1 && Qe.ce._injectChildStyle(Ce);
          const f = g.subTree = Oa(g);
          j(
            null,
            f,
            E,
            $,
            g,
            N,
            D
          ), _.el = f.el;
        }
        if (_e && Ft(_e, N), !Ke && (M = G && G.onVnodeMounted)) {
          const f = _;
          Ft(
            () => en(M, ue, f),
            N
          );
        }
        (_.shapeFlag & 256 || ue && js(ue.vnode) && ue.vnode.shapeFlag & 256) && g.a && Ft(g.a, N), g.isMounted = !0, _ = E = $ = null;
      }
    };
    g.scope.on();
    const q = g.effect = new Fl(W);
    g.scope.off();
    const b = g.update = q.run.bind(q), R = g.job = q.runIfDirty.bind(q);
    R.i = g, R.id = g.uid, q.scheduler = () => Co(R), Kn(g, !0), b();
  }, ge = (g, _, E) => {
    _.component = g;
    const $ = g.vnode.props;
    g.vnode = _, g.next = null, ih(g, _.props, $, E), ch(g, _.children, E), vn(), Aa(g), bn();
  }, ae = (g, _, E, $, N, D, V, W, q = !1) => {
    const b = g && g.children, R = g ? g.shapeFlag : 0, M = _.children, { patchFlag: H, shapeFlag: G } = _;
    if (H > 0) {
      if (H & 128) {
        Te(
          b,
          M,
          E,
          $,
          N,
          D,
          V,
          W,
          q
        );
        return;
      } else if (H & 256) {
        st(
          b,
          M,
          E,
          $,
          N,
          D,
          V,
          W,
          q
        );
        return;
      }
    }
    G & 8 ? (R & 16 && it(b, N, D), M !== b && c(E, M)) : R & 16 ? G & 16 ? Te(
      b,
      M,
      E,
      $,
      N,
      D,
      V,
      W,
      q
    ) : it(b, N, D, !0) : (R & 8 && c(E, ""), G & 16 && ve(
      M,
      E,
      $,
      N,
      D,
      V,
      W,
      q
    ));
  }, st = (g, _, E, $, N, D, V, W, q) => {
    g = g || ls, _ = _ || ls;
    const b = g.length, R = _.length, M = Math.min(b, R);
    let H;
    for (H = 0; H < M; H++) {
      const G = _[H] = q ? On(_[H]) : rn(_[H]);
      j(
        g[H],
        G,
        E,
        null,
        N,
        D,
        V,
        W,
        q
      );
    }
    b > R ? it(
      g,
      N,
      D,
      !0,
      !1,
      M
    ) : ve(
      _,
      E,
      $,
      N,
      D,
      V,
      W,
      q,
      M
    );
  }, Te = (g, _, E, $, N, D, V, W, q) => {
    let b = 0;
    const R = _.length;
    let M = g.length - 1, H = R - 1;
    for (; b <= M && b <= H; ) {
      const G = g[b], ne = _[b] = q ? On(_[b]) : rn(_[b]);
      if (Ss(G, ne))
        j(
          G,
          ne,
          E,
          null,
          N,
          D,
          V,
          W,
          q
        );
      else
        break;
      b++;
    }
    for (; b <= M && b <= H; ) {
      const G = g[M], ne = _[H] = q ? On(_[H]) : rn(_[H]);
      if (Ss(G, ne))
        j(
          G,
          ne,
          E,
          null,
          N,
          D,
          V,
          W,
          q
        );
      else
        break;
      M--, H--;
    }
    if (b > M) {
      if (b <= H) {
        const G = H + 1, ne = G < R ? _[G].el : $;
        for (; b <= H; )
          j(
            null,
            _[b] = q ? On(_[b]) : rn(_[b]),
            E,
            ne,
            N,
            D,
            V,
            W,
            q
          ), b++;
      }
    } else if (b > H)
      for (; b <= M; )
        Se(g[b], N, D, !0), b++;
    else {
      const G = b, ne = b, _e = /* @__PURE__ */ new Map();
      for (b = ne; b <= H; b++) {
        const S = _[b] = q ? On(_[b]) : rn(_[b]);
        S.key != null && _e.set(S.key, b);
      }
      let ue, Qe = 0;
      const Ce = H - ne + 1;
      let Ke = !1, f = 0;
      const m = new Array(Ce);
      for (b = 0; b < Ce; b++) m[b] = 0;
      for (b = G; b <= M; b++) {
        const S = g[b];
        if (Qe >= Ce) {
          Se(S, N, D, !0);
          continue;
        }
        let U;
        if (S.key != null)
          U = _e.get(S.key);
        else
          for (ue = ne; ue <= H; ue++)
            if (m[ue - ne] === 0 && Ss(S, _[ue])) {
              U = ue;
              break;
            }
        U === void 0 ? Se(S, N, D, !0) : (m[U - ne] = b + 1, U >= f ? f = U : Ke = !0, j(
          S,
          _[U],
          E,
          null,
          N,
          D,
          V,
          W,
          q
        ), Qe++);
      }
      const O = Ke ? dh(m) : ls;
      for (ue = O.length - 1, b = Ce - 1; b >= 0; b--) {
        const S = ne + b, U = _[S], Z = _[S + 1], Q = S + 1 < R ? (
          // #13559, fallback to el placeholder for unresolved async component
          Z.el || Z.placeholder
        ) : $;
        m[b] === 0 ? j(
          null,
          U,
          E,
          Q,
          N,
          D,
          V,
          W,
          q
        ) : Ke && (ue < 0 || b !== O[ue] ? be(U, E, Q, 2) : ue--);
      }
    }
  }, be = (g, _, E, $, N = null) => {
    const { el: D, type: V, transition: W, children: q, shapeFlag: b } = g;
    if (b & 6) {
      be(g.component.subTree, _, E, $);
      return;
    }
    if (b & 128) {
      g.suspense.move(_, E, $);
      return;
    }
    if (b & 64) {
      V.move(g, _, E, pt);
      return;
    }
    if (V === ze) {
      s(D, _, E);
      for (let M = 0; M < q.length; M++)
        be(q[M], _, E, $);
      s(g.anchor, _, E);
      return;
    }
    if (V === Tr) {
      oe(g, _, E);
      return;
    }
    if ($ !== 2 && b & 1 && W)
      if ($ === 0)
        W.beforeEnter(D), s(D, _, E), Ft(() => W.enter(D), N);
      else {
        const { leave: M, delayLeave: H, afterLeave: G } = W, ne = () => {
          g.ctx.isUnmounted ? r(D) : s(D, _, E);
        }, _e = () => {
          M(D, () => {
            ne(), G && G();
          });
        };
        H ? H(D, ne, _e) : _e();
      }
    else
      s(D, _, E);
  }, Se = (g, _, E, $ = !1, N = !1) => {
    const {
      type: D,
      props: V,
      ref: W,
      children: q,
      dynamicChildren: b,
      shapeFlag: R,
      patchFlag: M,
      dirs: H,
      cacheIndex: G
    } = g;
    if (M === -2 && (N = !1), W != null && (vn(), qs(W, null, E, g, !0), bn()), G != null && (_.renderCache[G] = void 0), R & 256) {
      _.ctx.deactivate(g);
      return;
    }
    const ne = R & 1 && H, _e = !js(g);
    let ue;
    if (_e && (ue = V && V.onVnodeBeforeUnmount) && en(ue, _, g), R & 6)
      Oe(g.component, E, $);
    else {
      if (R & 128) {
        g.suspense.unmount(E, $);
        return;
      }
      ne && Vn(g, null, _, "beforeUnmount"), R & 64 ? g.type.remove(
        g,
        _,
        E,
        pt,
        $
      ) : b && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !b.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (D !== ze || M > 0 && M & 64) ? it(
        b,
        _,
        E,
        !1,
        !0
      ) : (D === ze && M & 384 || !N && R & 16) && it(q, _, E), $ && Le(g);
    }
    (_e && (ue = V && V.onVnodeUnmounted) || ne) && Ft(() => {
      ue && en(ue, _, g), ne && Vn(g, null, _, "unmounted");
    }, E);
  }, Le = (g) => {
    const { type: _, el: E, anchor: $, transition: N } = g;
    if (_ === ze) {
      Ot(E, $);
      return;
    }
    if (_ === Tr) {
      T(g);
      return;
    }
    const D = () => {
      r(E), N && !N.persisted && N.afterLeave && N.afterLeave();
    };
    if (g.shapeFlag & 1 && N && !N.persisted) {
      const { leave: V, delayLeave: W } = N, q = () => V(E, D);
      W ? W(g.el, D, q) : q();
    } else
      D();
  }, Ot = (g, _) => {
    let E;
    for (; g !== _; )
      E = k(g), r(g), g = E;
    r(_);
  }, Oe = (g, _, E) => {
    const {
      bum: $,
      scope: N,
      job: D,
      subTree: V,
      um: W,
      m: q,
      a: b,
      parent: R,
      slots: { __: M }
    } = g;
    La(q), La(b), $ && kr($), R && de(M) && M.forEach((H) => {
      R.renderCache[H] = void 0;
    }), N.stop(), D && (D.flags |= 8, Se(V, g, _, E)), W && Ft(W, _), Ft(() => {
      g.isUnmounted = !0;
    }, _), _ && _.pendingBranch && !_.isUnmounted && g.asyncDep && !g.asyncResolved && g.suspenseId === _.pendingId && (_.deps--, _.deps === 0 && _.resolve());
  }, it = (g, _, E, $ = !1, N = !1, D = 0) => {
    for (let V = D; V < g.length; V++)
      Se(g[V], _, E, $, N);
  }, ht = (g) => {
    if (g.shapeFlag & 6)
      return ht(g.component.subTree);
    if (g.shapeFlag & 128)
      return g.suspense.next();
    const _ = k(g.anchor || g.el), E = _ && _[Ff];
    return E ? k(E) : _;
  };
  let dt = !1;
  const _t = (g, _, E) => {
    g == null ? _._vnode && Se(_._vnode, null, null, !0) : j(
      _._vnode || null,
      g,
      _,
      null,
      null,
      null,
      E
    ), _._vnode = g, dt || (dt = !0, Aa(), ec(), dt = !1);
  }, pt = {
    p: j,
    um: Se,
    m: be,
    r: Le,
    mt: Xe,
    mc: ve,
    pc: ae,
    pbc: Be,
    n: ht,
    o: e
  };
  return {
    render: _t,
    hydrate: void 0,
    createApp: nh(_t)
  };
}
function Ri({ type: e, props: t }, n) {
  return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function Kn({ effect: e, job: t }, n) {
  n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function hh(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function yc(e, t, n = !1) {
  const s = e.children, r = t.children;
  if (de(s) && de(r))
    for (let i = 0; i < s.length; i++) {
      const o = s[i];
      let a = r[i];
      a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = r[i] = On(r[i]), a.el = o.el), !n && a.patchFlag !== -2 && yc(o, a)), a.type === oi && (a.el = o.el), a.type === Bn && !a.el && (a.el = o.el);
    }
}
function dh(e) {
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
function vc(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : vc(t);
}
function La(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
const ph = Symbol.for("v-scx"), gh = () => xr(ph);
function Pt(e, t, n) {
  return bc(e, t, n);
}
function bc(e, t, n = tt) {
  const { immediate: s, deep: r, flush: i, once: o } = n, a = wt({}, n), l = t && s || !t && i !== "post";
  let d;
  if (Qs) {
    if (i === "sync") {
      const B = gh();
      d = B.__watcherHandles || (B.__watcherHandles = []);
    } else if (!l) {
      const B = () => {
      };
      return B.stop = on, B.resume = on, B.pause = on, B;
    }
  }
  const c = Ct;
  a.call = (B, I, j) => cn(B, c, I, j);
  let w = !1;
  i === "post" ? a.scheduler = (B) => {
    Ft(B, c && c.suspense);
  } : i !== "sync" && (w = !0, a.scheduler = (B, I) => {
    I ? B() : Co(B);
  }), a.augmentJob = (B) => {
    t && (B.flags |= 4), w && (B.flags |= 2, c && (B.id = c.uid, B.i = c));
  };
  const k = Lf(e, t, a);
  return Qs && (d ? d.push(k) : l && k()), k;
}
function mh(e, t, n) {
  const s = this.proxy, r = ft(e) ? e.includes(".") ? wc(s, e) : () => s[e] : e.bind(s, s);
  let i;
  ye(t) ? i = t : (i = t.handler, n = t);
  const o = nr(this), a = bc(r, i.bind(s), n);
  return o(), a;
}
function wc(e, t) {
  const n = t.split(".");
  return () => {
    let s = e;
    for (let r = 0; r < n.length && s; r++)
      s = s[n[r]];
    return s;
  };
}
const _h = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${Fn(t)}Modifiers`] || e[`${Un(t)}Modifiers`];
function yh(e, t, ...n) {
  if (e.isUnmounted) return;
  const s = e.vnode.props || tt;
  let r = n;
  const i = t.startsWith("update:"), o = i && _h(s, t.slice(7));
  o && (o.trim && (r = n.map((c) => ft(c) ? c.trim() : c)), o.number && (r = n.map(Gi)));
  let a, l = s[a = xi(t)] || // also try camelCase event handler (#2249)
  s[a = xi(Fn(t))];
  !l && i && (l = s[a = xi(Un(t))]), l && cn(
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
    e.emitted[a] = !0, cn(
      d,
      e,
      6,
      r
    );
  }
}
function kc(e, t, n = !1) {
  const s = t.emitsCache, r = s.get(e);
  if (r !== void 0)
    return r;
  const i = e.emits;
  let o = {}, a = !1;
  if (!ye(e)) {
    const l = (d) => {
      const c = kc(d, t, !0);
      c && (a = !0, wt(o, c));
    };
    !n && t.mixins.length && t.mixins.forEach(l), e.extends && l(e.extends), e.mixins && e.mixins.forEach(l);
  }
  return !i && !a ? (ot(e) && s.set(e, null), null) : (de(i) ? i.forEach((l) => o[l] = null) : wt(o, i), ot(e) && s.set(e, o), o);
}
function ii(e, t) {
  return !e || !Xr(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), je(e, t[0].toLowerCase() + t.slice(1)) || je(e, Un(t)) || je(e, t));
}
function Oa(e) {
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
    props: w,
    data: k,
    setupState: B,
    ctx: I,
    inheritAttrs: j
  } = e, F = Ur(e);
  let ie, ce;
  try {
    if (n.shapeFlag & 4) {
      const T = r || s, L = T;
      ie = rn(
        d.call(
          L,
          T,
          c,
          w,
          B,
          k,
          I
        )
      ), ce = a;
    } else {
      const T = t;
      ie = rn(
        T.length > 1 ? T(
          w,
          { attrs: a, slots: o, emit: l }
        ) : T(
          w,
          null
        )
      ), ce = t.props ? a : vh(a);
    }
  } catch (T) {
    Ks.length = 0, ni(T, e, 1), ie = an(Bn);
  }
  let oe = ie;
  if (ce && j !== !1) {
    const T = Object.keys(ce), { shapeFlag: L } = oe;
    T.length && L & 7 && (i && T.some(yo) && (ce = bh(
      ce,
      i
    )), oe = gs(oe, ce, !1, !0));
  }
  return n.dirs && (oe = gs(oe, null, !1, !0), oe.dirs = oe.dirs ? oe.dirs.concat(n.dirs) : n.dirs), n.transition && Ro(oe, n.transition), ie = oe, Ur(F), ie;
}
const vh = (e) => {
  let t;
  for (const n in e)
    (n === "class" || n === "style" || Xr(n)) && ((t || (t = {}))[n] = e[n]);
  return t;
}, bh = (e, t) => {
  const n = {};
  for (const s in e)
    (!yo(s) || !(s.slice(9) in t)) && (n[s] = e[s]);
  return n;
};
function wh(e, t, n) {
  const { props: s, children: r, component: i } = e, { props: o, children: a, patchFlag: l } = t, d = i.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (n && l >= 0) {
    if (l & 1024)
      return !0;
    if (l & 16)
      return s ? Na(s, o, d) : !!o;
    if (l & 8) {
      const c = t.dynamicProps;
      for (let w = 0; w < c.length; w++) {
        const k = c[w];
        if (o[k] !== s[k] && !ii(d, k))
          return !0;
      }
    }
  } else
    return (r || a) && (!a || !a.$stable) ? !0 : s === o ? !1 : s ? o ? Na(s, o, d) : !0 : !!o;
  return !1;
}
function Na(e, t, n) {
  const s = Object.keys(t);
  if (s.length !== Object.keys(e).length)
    return !0;
  for (let r = 0; r < s.length; r++) {
    const i = s[r];
    if (t[i] !== e[i] && !ii(n, i))
      return !0;
  }
  return !1;
}
function kh({ vnode: e, parent: t }, n) {
  for (; t; ) {
    const s = t.subTree;
    if (s.suspense && s.suspense.activeBranch === e && (s.el = e.el), s === e)
      (e = t.vnode).el = n, t = t.parent;
    else
      break;
  }
}
const xc = (e) => e.__isSuspense;
function xh(e, t) {
  t && t.pendingBranch ? de(e) ? t.effects.push(...e) : t.effects.push(e) : Mf(e);
}
const ze = Symbol.for("v-fgt"), oi = Symbol.for("v-txt"), Bn = Symbol.for("v-cmt"), Tr = Symbol.for("v-stc"), Ks = [];
let Dt = null;
function x(e = !1) {
  Ks.push(Dt = e ? null : []);
}
function Th() {
  Ks.pop(), Dt = Ks[Ks.length - 1] || null;
}
let Js = 1;
function Ma(e, t = !1) {
  Js += e, e < 0 && Dt && t && (Dt.hasOnce = !0);
}
function Tc(e) {
  return e.dynamicChildren = Js > 0 ? Dt || ls : null, Th(), Js > 0 && Dt && Dt.push(e), e;
}
function A(e, t, n, s, r, i) {
  return Tc(
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
function Hr(e, t, n, s, r) {
  return Tc(
    an(
      e,
      t,
      n,
      s,
      r,
      !0
    )
  );
}
function Ac(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function Ss(e, t) {
  return e.type === t.type && e.key === t.key;
}
const Ec = ({ key: e }) => e ?? null, Ar = ({
  ref: e,
  ref_key: t,
  ref_for: n
}) => (typeof e == "number" && (e = "" + e), e != null ? ft(e) || bt(e) || ye(e) ? { i: zt, r: e, k: t, f: !!n } : e : null);
function v(e, t = null, n = null, s = 0, r = null, i = e === ze ? 0 : 1, o = !1, a = !1) {
  const l = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && Ec(t),
    ref: t && Ar(t),
    scopeId: nc,
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
  return a ? (No(l, n), i & 128 && e.normalize(l)) : n && (l.shapeFlag |= ft(n) ? 8 : 16), Js > 0 && // avoid a block node from tracking itself
  !o && // has current parent block
  Dt && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (l.patchFlag > 0 || i & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  l.patchFlag !== 32 && Dt.push(l), l;
}
const an = Ah;
function Ah(e, t = null, n = null, s = 0, r = null, i = !1) {
  if ((!e || e === Gf) && (e = Bn), Ac(e)) {
    const a = gs(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return n && No(a, n), Js > 0 && !i && Dt && (a.shapeFlag & 6 ? Dt[Dt.indexOf(e)] = a : Dt.push(a)), a.patchFlag = -2, a;
  }
  if (Fh(e) && (e = e.__vccOpts), t) {
    t = Eh(t);
    let { class: a, style: l } = t;
    a && !ft(a) && (t.class = Ue(a)), ot(l) && (So(l) && !de(l) && (l = wt({}, l)), t.style = Ee(l));
  }
  const o = ft(e) ? 1 : xc(e) ? 128 : Df(e) ? 64 : ot(e) ? 4 : ye(e) ? 2 : 0;
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
function Eh(e) {
  return e ? So(e) || hc(e) ? wt({}, e) : e : null;
}
function gs(e, t, n = !1, s = !1) {
  const { props: r, ref: i, patchFlag: o, children: a, transition: l } = e, d = t ? Sh(r || {}, t) : r, c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: d,
    key: d && Ec(d),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && i ? de(i) ? i.concat(Ar(t)) : [i, Ar(t)] : Ar(t)
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
    patchFlag: t && e.type !== ze ? o === -1 ? 16 : o | 16 : o,
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
    ssContent: e.ssContent && gs(e.ssContent),
    ssFallback: e.ssFallback && gs(e.ssFallback),
    placeholder: e.placeholder,
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce
  };
  return l && s && Ro(
    c,
    l.clone(c)
  ), c;
}
function hn(e = " ", t = 0) {
  return an(oi, null, e, t);
}
function Gn(e, t) {
  const n = an(Tr, null, e);
  return n.staticCount = t, n;
}
function se(e = "", t = !1) {
  return t ? (x(), Hr(Bn, null, e)) : an(Bn, null, e);
}
function rn(e) {
  return e == null || typeof e == "boolean" ? an(Bn) : de(e) ? an(
    ze,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : Ac(e) ? On(e) : an(oi, null, String(e));
}
function On(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : gs(e);
}
function No(e, t) {
  let n = 0;
  const { shapeFlag: s } = e;
  if (t == null)
    t = null;
  else if (de(t))
    n = 16;
  else if (typeof t == "object")
    if (s & 65) {
      const r = t.default;
      r && (r._c && (r._d = !1), No(e, r()), r._c && (r._d = !0));
      return;
    } else {
      n = 32;
      const r = t._;
      !r && !hc(t) ? t._ctx = zt : r === 3 && zt && (zt.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else ye(t) ? (t = { default: t, _ctx: zt }, n = 32) : (t = String(t), s & 64 ? (n = 16, t = [hn(t)]) : n = 8);
  e.children = t, e.shapeFlag |= n;
}
function Sh(...e) {
  const t = {};
  for (let n = 0; n < e.length; n++) {
    const s = e[n];
    for (const r in s)
      if (r === "class")
        t.class !== s.class && (t.class = Ue([t.class, s.class]));
      else if (r === "style")
        t.style = Ee([t.style, s.style]);
      else if (Xr(r)) {
        const i = t[r], o = s[r];
        o && i !== o && !(de(i) && i.includes(o)) && (t[r] = i ? [].concat(i, o) : o);
      } else r !== "" && (t[r] = s[r]);
  }
  return t;
}
function en(e, t, n, s = null) {
  cn(e, t, 7, [
    n,
    s
  ]);
}
const Ch = cc();
let Rh = 0;
function Ih(e, t, n) {
  const s = e.type, r = (t ? t.appContext : e.appContext) || Ch, i = {
    uid: Rh++,
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
    scope: new nf(
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
    propsOptions: pc(s, r),
    emitsOptions: kc(s, r),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: tt,
    // inheritAttrs
    inheritAttrs: s.inheritAttrs,
    // state
    ctx: tt,
    data: tt,
    props: tt,
    attrs: tt,
    slots: tt,
    refs: tt,
    setupState: tt,
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
  return i.ctx = { _: i }, i.root = t ? t.root : i, i.emit = yh.bind(null, i), e.ce && e.ce(i), i;
}
let Ct = null;
const Lh = () => Ct || zt;
let Wr, so;
{
  const e = Qr(), t = (n, s) => {
    let r;
    return (r = e[n]) || (r = e[n] = []), r.push(s), (i) => {
      r.length > 1 ? r.forEach((o) => o(i)) : r[0](i);
    };
  };
  Wr = t(
    "__VUE_INSTANCE_SETTERS__",
    (n) => Ct = n
  ), so = t(
    "__VUE_SSR_SETTERS__",
    (n) => Qs = n
  );
}
const nr = (e) => {
  const t = Ct;
  return Wr(e), e.scope.on(), () => {
    e.scope.off(), Wr(t);
  };
}, Pa = () => {
  Ct && Ct.scope.off(), Wr(null);
};
function Sc(e) {
  return e.vnode.shapeFlag & 4;
}
let Qs = !1;
function Oh(e, t = !1, n = !1) {
  t && so(t);
  const { props: s, children: r } = e.vnode, i = Sc(e);
  rh(e, s, i, t), lh(e, r, n || t);
  const o = i ? Nh(e, t) : void 0;
  return t && so(!1), o;
}
function Nh(e, t) {
  const n = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Yf);
  const { setup: s } = n;
  if (s) {
    vn();
    const r = e.setupContext = s.length > 1 ? Ph(e) : null, i = nr(e), o = er(
      s,
      e,
      0,
      [
        e.props,
        r
      ]
    ), a = Rl(o);
    if (bn(), i(), (a || e.sp) && !js(e) && sc(e), a) {
      if (o.then(Pa, Pa), t)
        return o.then((l) => {
          Fa(e, l);
        }).catch((l) => {
          ni(l, e, 0);
        });
      e.asyncDep = o;
    } else
      Fa(e, o);
  } else
    Cc(e);
}
function Fa(e, t, n) {
  ye(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : ot(t) && (e.setupState = Zl(t)), Cc(e);
}
function Cc(e, t, n) {
  const s = e.type;
  e.render || (e.render = s.render || on);
  {
    const r = nr(e);
    vn();
    try {
      Xf(e);
    } finally {
      bn(), r();
    }
  }
}
const Mh = {
  get(e, t) {
    return vt(e, "get", ""), e[t];
  }
};
function Ph(e) {
  const t = (n) => {
    e.exposed = n || {};
  };
  return {
    attrs: new Proxy(e.attrs, Mh),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function ai(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(Zl(Tf(e.exposed)), {
    get(t, n) {
      if (n in t)
        return t[n];
      if (n in Vs)
        return Vs[n](e);
    },
    has(t, n) {
      return n in t || n in Vs;
    }
  })) : e.proxy;
}
function Fh(e) {
  return ye(e) && "__vccOpts" in e;
}
const le = (e, t) => Rf(e, t, Qs), Dh = "3.5.18";
/**
* @vue/runtime-dom v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let ro;
const Da = typeof window < "u" && window.trustedTypes;
if (Da)
  try {
    ro = /* @__PURE__ */ Da.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const Rc = ro ? (e) => ro.createHTML(e) : (e) => e, Bh = "http://www.w3.org/2000/svg", $h = "http://www.w3.org/1998/Math/MathML", pn = typeof document < "u" ? document : null, Ba = pn && /* @__PURE__ */ pn.createElement("template"), Uh = {
  insert: (e, t, n) => {
    t.insertBefore(e, n || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, n, s) => {
    const r = t === "svg" ? pn.createElementNS(Bh, e) : t === "mathml" ? pn.createElementNS($h, e) : n ? pn.createElement(e, { is: n }) : pn.createElement(e);
    return e === "select" && s && s.multiple != null && r.setAttribute("multiple", s.multiple), r;
  },
  createText: (e) => pn.createTextNode(e),
  createComment: (e) => pn.createComment(e),
  setText: (e, t) => {
    e.nodeValue = t;
  },
  setElementText: (e, t) => {
    e.textContent = t;
  },
  parentNode: (e) => e.parentNode,
  nextSibling: (e) => e.nextSibling,
  querySelector: (e) => pn.querySelector(e),
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
      Ba.innerHTML = Rc(
        s === "svg" ? `<svg>${e}</svg>` : s === "mathml" ? `<math>${e}</math>` : e
      );
      const a = Ba.content;
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
}, zh = Symbol("_vtc");
function Hh(e, t, n) {
  const s = e[zh];
  s && (t = (t ? [t, ...s] : [...s]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
const qr = Symbol("_vod"), Ic = Symbol("_vsh"), Wh = {
  beforeMount(e, { value: t }, { transition: n }) {
    e[qr] = e.style.display === "none" ? "" : e.style.display, n && t ? n.beforeEnter(e) : Cs(e, t);
  },
  mounted(e, { value: t }, { transition: n }) {
    n && t && n.enter(e);
  },
  updated(e, { value: t, oldValue: n }, { transition: s }) {
    !t != !n && (s ? t ? (s.beforeEnter(e), Cs(e, !0), s.enter(e)) : s.leave(e, () => {
      Cs(e, !1);
    }) : Cs(e, t));
  },
  beforeUnmount(e, { value: t }) {
    Cs(e, t);
  }
};
function Cs(e, t) {
  e.style.display = t ? e[qr] : "none", e[Ic] = !t;
}
const qh = Symbol(""), jh = /(^|;)\s*display\s*:/;
function Vh(e, t, n) {
  const s = e.style, r = ft(n);
  let i = !1;
  if (n && !r) {
    if (t)
      if (ft(t))
        for (const o of t.split(";")) {
          const a = o.slice(0, o.indexOf(":")).trim();
          n[a] == null && Er(s, a, "");
        }
      else
        for (const o in t)
          n[o] == null && Er(s, o, "");
    for (const o in n)
      o === "display" && (i = !0), Er(s, o, n[o]);
  } else if (r) {
    if (t !== n) {
      const o = s[qh];
      o && (n += ";" + o), s.cssText = n, i = jh.test(n);
    }
  } else t && e.removeAttribute("style");
  qr in e && (e[qr] = i ? s.display : "", e[Ic] && (s.display = "none"));
}
const $a = /\s*!important$/;
function Er(e, t, n) {
  if (de(n))
    n.forEach((s) => Er(e, t, s));
  else if (n == null && (n = ""), t.startsWith("--"))
    e.setProperty(t, n);
  else {
    const s = Kh(e, t);
    $a.test(n) ? e.setProperty(
      Un(s),
      n.replace($a, ""),
      "important"
    ) : e[s] = n;
  }
}
const Ua = ["Webkit", "Moz", "ms"], Ii = {};
function Kh(e, t) {
  const n = Ii[t];
  if (n)
    return n;
  let s = Fn(t);
  if (s !== "filter" && s in e)
    return Ii[t] = s;
  s = Ol(s);
  for (let r = 0; r < Ua.length; r++) {
    const i = Ua[r] + s;
    if (i in e)
      return Ii[t] = i;
  }
  return t;
}
const za = "http://www.w3.org/1999/xlink";
function Ha(e, t, n, s, r, i = tf(t)) {
  s && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(za, t.slice(6, t.length)) : e.setAttributeNS(za, t, n) : n == null || i && !Nl(n) ? e.removeAttribute(t) : e.setAttribute(
    t,
    i ? "" : $n(n) ? String(n) : n
  );
}
function Wa(e, t, n, s, r) {
  if (t === "innerHTML" || t === "textContent") {
    n != null && (e[t] = t === "innerHTML" ? Rc(n) : n);
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
    a === "boolean" ? n = Nl(n) : n == null && a === "string" ? (n = "", o = !0) : a === "number" && (n = 0, o = !0);
  }
  try {
    e[t] = n;
  } catch {
  }
  o && e.removeAttribute(r || t);
}
function as(e, t, n, s) {
  e.addEventListener(t, n, s);
}
function Gh(e, t, n, s) {
  e.removeEventListener(t, n, s);
}
const qa = Symbol("_vei");
function Yh(e, t, n, s, r = null) {
  const i = e[qa] || (e[qa] = {}), o = i[t];
  if (s && o)
    o.value = s;
  else {
    const [a, l] = Xh(t);
    if (s) {
      const d = i[t] = Qh(
        s,
        r
      );
      as(e, a, d, l);
    } else o && (Gh(e, a, o, l), i[t] = void 0);
  }
}
const ja = /(?:Once|Passive|Capture)$/;
function Xh(e) {
  let t;
  if (ja.test(e)) {
    t = {};
    let s;
    for (; s = e.match(ja); )
      e = e.slice(0, e.length - s[0].length), t[s[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : Un(e.slice(2)), t];
}
let Li = 0;
const Zh = /* @__PURE__ */ Promise.resolve(), Jh = () => Li || (Zh.then(() => Li = 0), Li = Date.now());
function Qh(e, t) {
  const n = (s) => {
    if (!s._vts)
      s._vts = Date.now();
    else if (s._vts <= n.attached)
      return;
    cn(
      ed(s, n.value),
      t,
      5,
      [s]
    );
  };
  return n.value = e, n.attached = Jh(), n;
}
function ed(e, t) {
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
const Va = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, td = (e, t, n, s, r, i) => {
  const o = r === "svg";
  t === "class" ? Hh(e, s, o) : t === "style" ? Vh(e, n, s) : Xr(t) ? yo(t) || Yh(e, t, n, s, i) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : nd(e, t, s, o)) ? (Wa(e, t, s), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && Ha(e, t, s, o, i, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !ft(s)) ? Wa(e, Fn(t), s, i, t) : (t === "true-value" ? e._trueValue = s : t === "false-value" && (e._falseValue = s), Ha(e, t, s, o));
};
function nd(e, t, n, s) {
  if (s)
    return !!(t === "innerHTML" || t === "textContent" || t in e && Va(t) && ye(n));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const r = e.tagName;
    if (r === "IMG" || r === "VIDEO" || r === "CANVAS" || r === "SOURCE")
      return !1;
  }
  return Va(t) && ft(n) ? !1 : t in e;
}
const Ka = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return de(t) ? (n) => kr(t, n) : t;
};
function sd(e) {
  e.target.composing = !0;
}
function Ga(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const Oi = Symbol("_assign"), Yn = {
  created(e, { modifiers: { lazy: t, trim: n, number: s } }, r) {
    e[Oi] = Ka(r);
    const i = s || r.props && r.props.type === "number";
    as(e, t ? "change" : "input", (o) => {
      if (o.target.composing) return;
      let a = e.value;
      n && (a = a.trim()), i && (a = Gi(a)), e[Oi](a);
    }), n && as(e, "change", () => {
      e.value = e.value.trim();
    }), t || (as(e, "compositionstart", sd), as(e, "compositionend", Ga), as(e, "change", Ga));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t }) {
    e.value = t ?? "";
  },
  beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: s, trim: r, number: i } }, o) {
    if (e[Oi] = Ka(o), e.composing) return;
    const a = (i || e.type === "number") && !/^0\d/.test(e.value) ? Gi(e.value) : e.value, l = t ?? "";
    a !== l && (document.activeElement === e && e.type !== "range" && (s && t === n || r && e.value.trim() === l) || (e.value = l));
  }
}, rd = ["ctrl", "shift", "alt", "meta"], id = {
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
  exact: (e, t) => rd.some((n) => e[`${n}Key`] && !t.includes(n))
}, Zn = (e, t) => {
  const n = e._withMods || (e._withMods = {}), s = t.join(".");
  return n[s] || (n[s] = (r, ...i) => {
    for (let o = 0; o < t.length; o++) {
      const a = id[t[o]];
      if (a && a(r, t)) return;
    }
    return e(r, ...i);
  });
}, od = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, Sr = (e, t) => {
  const n = e._withKeys || (e._withKeys = {}), s = t.join(".");
  return n[s] || (n[s] = (r) => {
    if (!("key" in r))
      return;
    const i = Un(r.key);
    if (t.some(
      (o) => o === i || od[o] === i
    ))
      return e(r);
  });
}, ad = /* @__PURE__ */ wt({ patchProp: td }, Uh);
let Ya;
function ld() {
  return Ya || (Ya = uh(ad));
}
const cd = (...e) => {
  const t = ld().createApp(...e), { mount: n } = t;
  return t.mount = (s) => {
    const r = fd(s);
    if (!r) return;
    const i = t._component;
    !ye(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
    const o = n(r, !1, ud(r));
    return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), o;
  }, t;
};
function ud(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function fd(e) {
  return ft(e) ? document.querySelector(e) : e;
}
const ds = (e) => {
  const t = e.replace("#", ""), n = parseInt(t.substr(0, 2), 16), s = parseInt(t.substr(2, 2), 16), r = parseInt(t.substr(4, 2), 16);
  return (n * 299 + s * 587 + r * 114) / 1e3 < 128;
}, hd = (e, t) => {
  const n = e.replace("#", ""), s = parseInt(n.substr(0, 2), 16), r = parseInt(n.substr(2, 2), 16), i = parseInt(n.substr(4, 2), 16), o = ds(e), a = o ? Math.min(255, s + t) : Math.max(0, s - t), l = o ? Math.min(255, r + t) : Math.max(0, r - t), d = o ? Math.min(255, i + t) : Math.max(0, i - t);
  return `#${a.toString(16).padStart(2, "0")}${l.toString(16).padStart(2, "0")}${d.toString(16).padStart(2, "0")}`;
}, Rs = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e), dd = (e) => {
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
function Mo() {
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
var ts = Mo();
function Lc(e) {
  ts = e;
}
var Gs = { exec: () => null };
function Ve(e, t = "") {
  let n = typeof e == "string" ? e : e.source;
  const s = {
    replace: (r, i) => {
      let o = typeof i == "string" ? i : i.source;
      return o = o.replace(Rt.caret, "$1"), n = n.replace(r, o), s;
    },
    getRegex: () => new RegExp(n, t)
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
  listItemRegex: (e) => new RegExp(`^( {0,3}${e})((?:[	 ][^\\n]*)?(?:\\n|$))`),
  nextBulletRegex: (e) => new RegExp(`^ {0,${Math.min(3, e - 1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),
  hrRegex: (e) => new RegExp(`^ {0,${Math.min(3, e - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),
  fencesBeginRegex: (e) => new RegExp(`^ {0,${Math.min(3, e - 1)}}(?:\`\`\`|~~~)`),
  headingBeginRegex: (e) => new RegExp(`^ {0,${Math.min(3, e - 1)}}#`),
  htmlBeginRegex: (e) => new RegExp(`^ {0,${Math.min(3, e - 1)}}<(?:[a-z].*>|!--)`, "i")
}, pd = /^(?:[ \t]*(?:\n|$))+/, gd = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/, md = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, sr = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, _d = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, Po = /(?:[*+-]|\d{1,9}[.)])/, Oc = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/, Nc = Ve(Oc).replace(/bull/g, Po).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(), yd = Ve(Oc).replace(/bull/g, Po).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(), Fo = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/, vd = /^[^\n]+/, Do = /(?!\s*\])(?:\\.|[^\[\]\\])+/, bd = Ve(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", Do).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), wd = Ve(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, Po).getRegex(), li = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", Bo = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, kd = Ve(
  "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))",
  "i"
).replace("comment", Bo).replace("tag", li).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), Mc = Ve(Fo).replace("hr", sr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", li).getRegex(), xd = Ve(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", Mc).getRegex(), $o = {
  blockquote: xd,
  code: gd,
  def: bd,
  fences: md,
  heading: _d,
  hr: sr,
  html: kd,
  lheading: Nc,
  list: wd,
  newline: pd,
  paragraph: Mc,
  table: Gs,
  text: vd
}, Xa = Ve(
  "^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"
).replace("hr", sr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", li).getRegex(), Td = {
  ...$o,
  lheading: yd,
  table: Xa,
  paragraph: Ve(Fo).replace("hr", sr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", Xa).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", li).getRegex()
}, Ad = {
  ...$o,
  html: Ve(
    `^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`
  ).replace("comment", Bo).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
  heading: /^(#{1,6})(.*)(?:\n+|$)/,
  fences: Gs,
  // fences not supported
  lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  paragraph: Ve(Fo).replace("hr", sr).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", Nc).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
}, Ed = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, Sd = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, Pc = /^( {2,}|\\)\n(?!\s*$)/, Cd = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, ci = /[\p{P}\p{S}]/u, Uo = /[\s\p{P}\p{S}]/u, Fc = /[^\s\p{P}\p{S}]/u, Rd = Ve(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, Uo).getRegex(), Dc = /(?!~)[\p{P}\p{S}]/u, Id = /(?!~)[\s\p{P}\p{S}]/u, Ld = /(?:[^\s\p{P}\p{S}]|~)/u, Od = /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g, Bc = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/, Nd = Ve(Bc, "u").replace(/punct/g, ci).getRegex(), Md = Ve(Bc, "u").replace(/punct/g, Dc).getRegex(), $c = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", Pd = Ve($c, "gu").replace(/notPunctSpace/g, Fc).replace(/punctSpace/g, Uo).replace(/punct/g, ci).getRegex(), Fd = Ve($c, "gu").replace(/notPunctSpace/g, Ld).replace(/punctSpace/g, Id).replace(/punct/g, Dc).getRegex(), Dd = Ve(
  "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)",
  "gu"
).replace(/notPunctSpace/g, Fc).replace(/punctSpace/g, Uo).replace(/punct/g, ci).getRegex(), Bd = Ve(/\\(punct)/, "gu").replace(/punct/g, ci).getRegex(), $d = Ve(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), Ud = Ve(Bo).replace("(?:-->|$)", "-->").getRegex(), zd = Ve(
  "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>"
).replace("comment", Ud).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), jr = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/, Hd = Ve(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", jr).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), Uc = Ve(/^!?\[(label)\]\[(ref)\]/).replace("label", jr).replace("ref", Do).getRegex(), zc = Ve(/^!?\[(ref)\](?:\[\])?/).replace("ref", Do).getRegex(), Wd = Ve("reflink|nolink(?!\\()", "g").replace("reflink", Uc).replace("nolink", zc).getRegex(), zo = {
  _backpedal: Gs,
  // only used for GFM url
  anyPunctuation: Bd,
  autolink: $d,
  blockSkip: Od,
  br: Pc,
  code: Sd,
  del: Gs,
  emStrongLDelim: Nd,
  emStrongRDelimAst: Pd,
  emStrongRDelimUnd: Dd,
  escape: Ed,
  link: Hd,
  nolink: zc,
  punctuation: Rd,
  reflink: Uc,
  reflinkSearch: Wd,
  tag: zd,
  text: Cd,
  url: Gs
}, qd = {
  ...zo,
  link: Ve(/^!?\[(label)\]\((.*?)\)/).replace("label", jr).getRegex(),
  reflink: Ve(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", jr).getRegex()
}, io = {
  ...zo,
  emStrongRDelimAst: Fd,
  emStrongLDelim: Md,
  url: Ve(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, "i").replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
  _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
}, jd = {
  ...io,
  br: Ve(Pc).replace("{2,}", "*").getRegex(),
  text: Ve(io.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
}, _r = {
  normal: $o,
  gfm: Td,
  pedantic: Ad
}, Is = {
  normal: zo,
  gfm: io,
  breaks: jd,
  pedantic: qd
}, Vd = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}, Za = (e) => Vd[e];
function nn(e, t) {
  if (t) {
    if (Rt.escapeTest.test(e))
      return e.replace(Rt.escapeReplace, Za);
  } else if (Rt.escapeTestNoEncode.test(e))
    return e.replace(Rt.escapeReplaceNoEncode, Za);
  return e;
}
function Ja(e) {
  try {
    e = encodeURI(e).replace(Rt.percentDecode, "%");
  } catch {
    return null;
  }
  return e;
}
function Qa(e, t) {
  var i;
  const n = e.replace(Rt.findPipe, (o, a, l) => {
    let d = !1, c = a;
    for (; --c >= 0 && l[c] === "\\"; ) d = !d;
    return d ? "|" : " |";
  }), s = n.split(Rt.splitPipe);
  let r = 0;
  if (s[0].trim() || s.shift(), s.length > 0 && !((i = s.at(-1)) != null && i.trim()) && s.pop(), t)
    if (s.length > t)
      s.splice(t);
    else
      for (; s.length < t; ) s.push("");
  for (; r < s.length; r++)
    s[r] = s[r].trim().replace(Rt.slashPipe, "|");
  return s;
}
function Ls(e, t, n) {
  const s = e.length;
  if (s === 0)
    return "";
  let r = 0;
  for (; r < s && e.charAt(s - r - 1) === t; )
    r++;
  return e.slice(0, s - r);
}
function Kd(e, t) {
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
function el(e, t, n, s, r) {
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
function Gd(e, t, n) {
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
var Vr = class {
  // set by the lexer
  constructor(e) {
    et(this, "options");
    et(this, "rules");
    // set by the lexer
    et(this, "lexer");
    this.options = e || ts;
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
        text: this.options.pedantic ? n : Ls(n, `
`)
      };
    }
  }
  fences(e) {
    const t = this.rules.block.fences.exec(e);
    if (t) {
      const n = t[0], s = Gd(n, t[3] || "", this.rules);
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
        const s = Ls(n, "#");
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
        raw: Ls(t[0], `
`)
      };
  }
  blockquote(e) {
    const t = this.rules.block.blockquote.exec(e);
    if (t) {
      let n = Ls(t[0], `
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
        const w = this.lexer.state.top;
        if (this.lexer.state.top = !0, this.lexer.blockTokens(c, i, !0), this.lexer.state.top = w, n.length === 0)
          break;
        const k = i.at(-1);
        if ((k == null ? void 0 : k.type) === "code")
          break;
        if ((k == null ? void 0 : k.type) === "blockquote") {
          const B = k, I = B.raw + `
` + n.join(`
`), j = this.blockquote(I);
          i[i.length - 1] = j, s = s.substring(0, s.length - B.raw.length) + j.raw, r = r.substring(0, r.length - B.text.length) + j.text;
          break;
        } else if ((k == null ? void 0 : k.type) === "list") {
          const B = k, I = B.raw + `
` + n.join(`
`), j = this.list(I);
          i[i.length - 1] = j, s = s.substring(0, s.length - k.raw.length) + j.raw, r = r.substring(0, r.length - B.raw.length) + j.raw, n = I.substring(i.at(-1).raw.length).split(`
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
        let w = t[2].split(`
`, 1)[0].replace(this.rules.other.listReplaceTabs, (ie) => " ".repeat(3 * ie.length)), k = e.split(`
`, 1)[0], B = !w.trim(), I = 0;
        if (this.options.pedantic ? (I = 2, c = w.trimStart()) : B ? I = t[1].length + 1 : (I = t[2].search(this.rules.other.nonSpaceChar), I = I > 4 ? 1 : I, c = w.slice(I), I += t[1].length), B && this.rules.other.blankLine.test(k) && (d += k + `
`, e = e.substring(k.length + 1), l = !0), !l) {
          const ie = this.rules.other.nextBulletRegex(I), ce = this.rules.other.hrRegex(I), oe = this.rules.other.fencesBeginRegex(I), T = this.rules.other.headingBeginRegex(I), L = this.rules.other.htmlBeginRegex(I);
          for (; e; ) {
            const K = e.split(`
`, 1)[0];
            let Y;
            if (k = K, this.options.pedantic ? (k = k.replace(this.rules.other.listReplaceNesting, "  "), Y = k) : Y = k.replace(this.rules.other.tabCharGlobal, "    "), oe.test(k) || T.test(k) || L.test(k) || ie.test(k) || ce.test(k))
              break;
            if (Y.search(this.rules.other.nonSpaceChar) >= I || !k.trim())
              c += `
` + Y.slice(I);
            else {
              if (B || w.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || oe.test(w) || T.test(w) || ce.test(w))
                break;
              c += `
` + k;
            }
            !B && !k.trim() && (B = !0), d += K + `
`, e = e.substring(K.length + 1), w = Y.slice(I);
          }
        }
        r.loose || (o ? r.loose = !0 : this.rules.other.doubleBlankLine.test(d) && (o = !0));
        let j = null, F;
        this.options.gfm && (j = this.rules.other.listIsTask.exec(c), j && (F = j[0] !== "[ ] ", c = c.replace(this.rules.other.listReplaceTask, ""))), r.items.push({
          type: "list_item",
          raw: d,
          task: !!j,
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
          const d = r.items[l].tokens.filter((w) => w.type === "space"), c = d.length > 0 && d.some((w) => this.rules.other.anyLine.test(w.raw));
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
    const n = Qa(t[1]), s = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), r = (o = t[3]) != null && o.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
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
        i.rows.push(Qa(a, i.header.length).map((l, d) => ({
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
        const i = Ls(n.slice(0, -1), "\\");
        if ((n.length - i.length) % 2 === 0)
          return;
      } else {
        const i = Kd(t[2], "()");
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
      return s = s.trim(), this.rules.other.startAngleBracket.test(s) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n) ? s = s.slice(1) : s = s.slice(1, -1)), el(t, {
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
      return el(n, r, n[0], this.lexer, this.rules);
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
        const B = k.slice(2, -2);
        return {
          type: "strong",
          raw: k,
          text: B,
          tokens: this.lexer.inlineTokens(B)
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
}, _n = class oo {
  constructor(t) {
    et(this, "tokens");
    et(this, "options");
    et(this, "state");
    et(this, "tokenizer");
    et(this, "inlineQueue");
    this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = t || ts, this.options.tokenizer = this.options.tokenizer || new Vr(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = {
      inLink: !1,
      inRawBlock: !1,
      top: !0
    };
    const n = {
      other: Rt,
      block: _r.normal,
      inline: Is.normal
    };
    this.options.pedantic ? (n.block = _r.pedantic, n.inline = Is.pedantic) : this.options.gfm && (n.block = _r.gfm, this.options.breaks ? n.inline = Is.breaks : n.inline = Is.gfm), this.tokenizer.rules = n;
  }
  /**
   * Expose Rules
   */
  static get rules() {
    return {
      block: _r,
      inline: Is
    };
  }
  /**
   * Static Lex Method
   */
  static lex(t, n) {
    return new oo(n).lex(t);
  }
  /**
   * Static Lex Inline Method
   */
  static lexInline(t, n) {
    return new oo(n).inlineTokens(t);
  }
  /**
   * Preprocessing
   */
  lex(t) {
    t = t.replace(Rt.carriageReturn, `
`), this.blockTokens(t, this.tokens);
    for (let n = 0; n < this.inlineQueue.length; n++) {
      const s = this.inlineQueue[n];
      this.inlineTokens(s.src, s.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(t, n = [], s = !1) {
    var r, i, o;
    for (this.options.pedantic && (t = t.replace(Rt.tabCharGlobal, "    ").replace(Rt.spaceLine, "")); t; ) {
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
        let w;
        this.options.extensions.startBlock.forEach((k) => {
          w = k.call({ lexer: this }, c), typeof w == "number" && w >= 0 && (d = Math.min(d, w));
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
      if ((d = this.options.extensions) != null && d.startInline) {
        let k = 1 / 0;
        const B = t.slice(1);
        let I;
        this.options.extensions.startInline.forEach((j) => {
          I = j.call({ lexer: this }, B), typeof I == "number" && I >= 0 && (k = Math.min(k, I));
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
}, Kr = class {
  // set by the parser
  constructor(e) {
    et(this, "options");
    et(this, "parser");
    this.options = e || ts;
  }
  space(e) {
    return "";
  }
  code({ text: e, lang: t, escaped: n }) {
    var i;
    const s = (i = (t || "").match(Rt.notSpaceStart)) == null ? void 0 : i[0], r = e.replace(Rt.endingNewline, "") + `
`;
    return s ? '<pre><code class="language-' + nn(s) + '">' + (n ? r : nn(r, !0)) + `</code></pre>
` : "<pre><code>" + (n ? r : nn(r, !0)) + `</code></pre>
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
      e.loose ? ((n = e.tokens[0]) == null ? void 0 : n.type) === "paragraph" ? (e.tokens[0].text = s + " " + e.tokens[0].text, e.tokens[0].tokens && e.tokens[0].tokens.length > 0 && e.tokens[0].tokens[0].type === "text" && (e.tokens[0].tokens[0].text = s + " " + nn(e.tokens[0].tokens[0].text), e.tokens[0].tokens[0].escaped = !0)) : e.tokens.unshift({
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
    return `<code>${nn(e, !0)}</code>`;
  }
  br(e) {
    return "<br>";
  }
  del({ tokens: e }) {
    return `<del>${this.parser.parseInline(e)}</del>`;
  }
  link({ href: e, title: t, tokens: n }) {
    const s = this.parser.parseInline(n), r = Ja(e);
    if (r === null)
      return s;
    e = r;
    let i = '<a href="' + e + '"';
    return t && (i += ' title="' + nn(t) + '"'), i += ">" + s + "</a>", i;
  }
  image({ href: e, title: t, text: n, tokens: s }) {
    s && (n = this.parser.parseInline(s, this.parser.textRenderer));
    const r = Ja(e);
    if (r === null)
      return nn(n);
    e = r;
    let i = `<img src="${e}" alt="${n}"`;
    return t && (i += ` title="${nn(t)}"`), i += ">", i;
  }
  text(e) {
    return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : nn(e.text);
  }
}, Ho = class {
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
}, yn = class ao {
  constructor(t) {
    et(this, "options");
    et(this, "renderer");
    et(this, "textRenderer");
    this.options = t || ts, this.options.renderer = this.options.renderer || new Kr(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new Ho();
  }
  /**
   * Static Parse Method
   */
  static parse(t, n) {
    return new ao(n).parse(t);
  }
  /**
   * Static Parse Inline Method
   */
  static parseInline(t, n) {
    return new ao(n).parseInline(t);
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
}, Vi, Cr = (Vi = class {
  constructor(e) {
    et(this, "options");
    et(this, "block");
    this.options = e || ts;
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
    return this.block ? _n.lex : _n.lexInline;
  }
  /**
   * Provide function to parse tokens
   */
  provideParser() {
    return this.block ? yn.parse : yn.parseInline;
  }
}, et(Vi, "passThroughHooks", /* @__PURE__ */ new Set([
  "preprocess",
  "postprocess",
  "processAllTokens"
])), Vi), Yd = class {
  constructor(...e) {
    et(this, "defaults", Mo());
    et(this, "options", this.setOptions);
    et(this, "parse", this.parseMarkdown(!0));
    et(this, "parseInline", this.parseMarkdown(!1));
    et(this, "Parser", yn);
    et(this, "Renderer", Kr);
    et(this, "TextRenderer", Ho);
    et(this, "Lexer", _n);
    et(this, "Tokenizer", Vr);
    et(this, "Hooks", Cr);
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
        const r = this.defaults.renderer || new Kr(this.defaults);
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
        const r = this.defaults.tokenizer || new Vr(this.defaults);
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
        const r = this.defaults.hooks || new Cr();
        for (const i in n.hooks) {
          if (!(i in r))
            throw new Error(`hook '${i}' does not exist`);
          if (["options", "block"].includes(i))
            continue;
          const o = i, a = n.hooks[o], l = r[o];
          Cr.passThroughHooks.has(i) ? r[o] = (d) => {
            if (this.defaults.async)
              return Promise.resolve(a.call(r, d)).then((w) => l.call(r, w));
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
    return _n.lex(e, t ?? this.defaults);
  }
  parser(e, t) {
    return yn.parse(e, t ?? this.defaults);
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
      const a = i.hooks ? i.hooks.provideLexer() : e ? _n.lex : _n.lexInline, l = i.hooks ? i.hooks.provideParser() : e ? yn.parse : yn.parseInline;
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
        const s = "<p>An error occurred:</p><pre>" + nn(n.message + "", !0) + "</pre>";
        return t ? Promise.resolve(s) : s;
      }
      if (t)
        return Promise.reject(n);
      throw n;
    };
  }
}, es = new Yd();
function He(e, t) {
  return es.parse(e, t);
}
He.options = He.setOptions = function(e) {
  return es.setOptions(e), He.defaults = es.defaults, Lc(He.defaults), He;
};
He.getDefaults = Mo;
He.defaults = ts;
He.use = function(...e) {
  return es.use(...e), He.defaults = es.defaults, Lc(He.defaults), He;
};
He.walkTokens = function(e, t) {
  return es.walkTokens(e, t);
};
He.parseInline = es.parseInline;
He.Parser = yn;
He.parser = yn.parse;
He.Renderer = Kr;
He.TextRenderer = Ho;
He.Lexer = _n;
He.lexer = _n.lex;
He.Tokenizer = Vr;
He.Hooks = Cr;
He.parse = He;
He.options;
He.setOptions;
He.use;
He.walkTokens;
He.parseInline;
yn.parse;
_n.lex;
/*! @license DOMPurify 3.2.6 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.2.6/LICENSE */
const {
  entries: Hc,
  setPrototypeOf: tl,
  isFrozen: Xd,
  getPrototypeOf: Zd,
  getOwnPropertyDescriptor: Jd
} = Object;
let {
  freeze: It,
  seal: Wt,
  create: Wc
} = Object, {
  apply: lo,
  construct: co
} = typeof Reflect < "u" && Reflect;
It || (It = function(t) {
  return t;
});
Wt || (Wt = function(t) {
  return t;
});
lo || (lo = function(t, n, s) {
  return t.apply(n, s);
});
co || (co = function(t, n) {
  return new t(...n);
});
const yr = Lt(Array.prototype.forEach), Qd = Lt(Array.prototype.lastIndexOf), nl = Lt(Array.prototype.pop), Os = Lt(Array.prototype.push), ep = Lt(Array.prototype.splice), Rr = Lt(String.prototype.toLowerCase), Ni = Lt(String.prototype.toString), sl = Lt(String.prototype.match), Ns = Lt(String.prototype.replace), tp = Lt(String.prototype.indexOf), np = Lt(String.prototype.trim), Gt = Lt(Object.prototype.hasOwnProperty), At = Lt(RegExp.prototype.test), Ms = sp(TypeError);
function Lt(e) {
  return function(t) {
    t instanceof RegExp && (t.lastIndex = 0);
    for (var n = arguments.length, s = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
      s[r - 1] = arguments[r];
    return lo(e, t, s);
  };
}
function sp(e) {
  return function() {
    for (var t = arguments.length, n = new Array(t), s = 0; s < t; s++)
      n[s] = arguments[s];
    return co(e, n);
  };
}
function Ie(e, t) {
  let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : Rr;
  tl && tl(e, null);
  let s = t.length;
  for (; s--; ) {
    let r = t[s];
    if (typeof r == "string") {
      const i = n(r);
      i !== r && (Xd(t) || (t[s] = i), r = i);
    }
    e[r] = !0;
  }
  return e;
}
function rp(e) {
  for (let t = 0; t < e.length; t++)
    Gt(e, t) || (e[t] = null);
  return e;
}
function dn(e) {
  const t = Wc(null);
  for (const [n, s] of Hc(e))
    Gt(e, n) && (Array.isArray(s) ? t[n] = rp(s) : s && typeof s == "object" && s.constructor === Object ? t[n] = dn(s) : t[n] = s);
  return t;
}
function Ps(e, t) {
  for (; e !== null; ) {
    const s = Jd(e, t);
    if (s) {
      if (s.get)
        return Lt(s.get);
      if (typeof s.value == "function")
        return Lt(s.value);
    }
    e = Zd(e);
  }
  function n() {
    return null;
  }
  return n;
}
const rl = It(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "section", "select", "shadow", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]), Mi = It(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]), Pi = It(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]), ip = It(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]), Fi = It(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]), op = It(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]), il = It(["#text"]), ol = It(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns", "slot"]), Di = It(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]), al = It(["accent", "accentunder", "align", "bevelled", "close", "columnsalign", "columnlines", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lspace", "lquote", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]), vr = It(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]), ap = Wt(/\{\{[\w\W]*|[\w\W]*\}\}/gm), lp = Wt(/<%[\w\W]*|[\w\W]*%>/gm), cp = Wt(/\$\{[\w\W]*/gm), up = Wt(/^data-[\-\w.\u00B7-\uFFFF]+$/), fp = Wt(/^aria-[\-\w]+$/), qc = Wt(
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  // eslint-disable-line no-useless-escape
), hp = Wt(/^(?:\w+script|data):/i), dp = Wt(
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g
  // eslint-disable-line no-control-regex
), jc = Wt(/^html$/i), pp = Wt(/^[a-z][.\w]*(-[.\w]+)+$/i);
var ll = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ARIA_ATTR: fp,
  ATTR_WHITESPACE: dp,
  CUSTOM_ELEMENT: pp,
  DATA_ATTR: up,
  DOCTYPE_NAME: jc,
  ERB_EXPR: lp,
  IS_ALLOWED_URI: qc,
  IS_SCRIPT_OR_DATA: hp,
  MUSTACHE_EXPR: ap,
  TMPLIT_EXPR: cp
});
const Fs = {
  element: 1,
  text: 3,
  // Deprecated
  progressingInstruction: 7,
  comment: 8,
  document: 9
}, gp = function() {
  return typeof window > "u" ? null : window;
}, mp = function(t, n) {
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
}, cl = function() {
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
function Vc() {
  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : gp();
  const t = (te) => Vc(te);
  if (t.version = "3.2.6", t.removed = [], !e || !e.document || e.document.nodeType !== Fs.document || !e.Element)
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
    HTMLFormElement: w,
    DOMParser: k,
    trustedTypes: B
  } = e, I = l.prototype, j = Ps(I, "cloneNode"), F = Ps(I, "remove"), ie = Ps(I, "nextSibling"), ce = Ps(I, "childNodes"), oe = Ps(I, "parentNode");
  if (typeof o == "function") {
    const te = n.createElement("template");
    te.content && te.content.ownerDocument && (n = te.content.ownerDocument);
  }
  let T, L = "";
  const {
    implementation: K,
    createNodeIterator: Y,
    createDocumentFragment: ve,
    getElementsByTagName: Me
  } = n, {
    importNode: Be
  } = s;
  let xe = cl();
  t.isSupported = typeof Hc == "function" && typeof oe == "function" && K && K.createHTMLDocument !== void 0;
  const {
    MUSTACHE_EXPR: pe,
    ERB_EXPR: Ye,
    TMPLIT_EXPR: Xe,
    DATA_ATTR: rt,
    ARIA_ATTR: fe,
    IS_SCRIPT_OR_DATA: ge,
    ATTR_WHITESPACE: ae,
    CUSTOM_ELEMENT: st
  } = ll;
  let {
    IS_ALLOWED_URI: Te
  } = ll, be = null;
  const Se = Ie({}, [...rl, ...Mi, ...Pi, ...Fi, ...il]);
  let Le = null;
  const Ot = Ie({}, [...ol, ...Di, ...al, ...vr]);
  let Oe = Object.seal(Wc(null, {
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
  })), it = null, ht = null, dt = !0, _t = !0, pt = !1, kt = !0, g = !1, _ = !0, E = !1, $ = !1, N = !1, D = !1, V = !1, W = !1, q = !0, b = !1;
  const R = "user-content-";
  let M = !0, H = !1, G = {}, ne = null;
  const _e = Ie({}, ["annotation-xml", "audio", "colgroup", "desc", "foreignobject", "head", "iframe", "math", "mi", "mn", "mo", "ms", "mtext", "noembed", "noframes", "noscript", "plaintext", "script", "style", "svg", "template", "thead", "title", "video", "xmp"]);
  let ue = null;
  const Qe = Ie({}, ["audio", "video", "img", "source", "image", "track"]);
  let Ce = null;
  const Ke = Ie({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), f = "http://www.w3.org/1998/Math/MathML", m = "http://www.w3.org/2000/svg", O = "http://www.w3.org/1999/xhtml";
  let S = O, U = !1, Z = null;
  const Q = Ie({}, [f, m, O], Ni);
  let we = Ie({}, ["mi", "mo", "mn", "ms", "mtext"]), Ne = Ie({}, ["annotation-xml"]);
  const Ge = Ie({}, ["title", "style", "font", "a", "script"]);
  let $e = null;
  const lt = ["application/xhtml+xml", "text/html"], yt = "text/html";
  let Ze = null, qt = null;
  const rr = n.createElement("form"), ir = function(y) {
    return y instanceof RegExp || y instanceof Function;
  }, zn = function() {
    let y = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (!(qt && qt === y)) {
      if ((!y || typeof y != "object") && (y = {}), y = dn(y), $e = // eslint-disable-next-line unicorn/prefer-includes
      lt.indexOf(y.PARSER_MEDIA_TYPE) === -1 ? yt : y.PARSER_MEDIA_TYPE, Ze = $e === "application/xhtml+xml" ? Ni : Rr, be = Gt(y, "ALLOWED_TAGS") ? Ie({}, y.ALLOWED_TAGS, Ze) : Se, Le = Gt(y, "ALLOWED_ATTR") ? Ie({}, y.ALLOWED_ATTR, Ze) : Ot, Z = Gt(y, "ALLOWED_NAMESPACES") ? Ie({}, y.ALLOWED_NAMESPACES, Ni) : Q, Ce = Gt(y, "ADD_URI_SAFE_ATTR") ? Ie(dn(Ke), y.ADD_URI_SAFE_ATTR, Ze) : Ke, ue = Gt(y, "ADD_DATA_URI_TAGS") ? Ie(dn(Qe), y.ADD_DATA_URI_TAGS, Ze) : Qe, ne = Gt(y, "FORBID_CONTENTS") ? Ie({}, y.FORBID_CONTENTS, Ze) : _e, it = Gt(y, "FORBID_TAGS") ? Ie({}, y.FORBID_TAGS, Ze) : dn({}), ht = Gt(y, "FORBID_ATTR") ? Ie({}, y.FORBID_ATTR, Ze) : dn({}), G = Gt(y, "USE_PROFILES") ? y.USE_PROFILES : !1, dt = y.ALLOW_ARIA_ATTR !== !1, _t = y.ALLOW_DATA_ATTR !== !1, pt = y.ALLOW_UNKNOWN_PROTOCOLS || !1, kt = y.ALLOW_SELF_CLOSE_IN_ATTR !== !1, g = y.SAFE_FOR_TEMPLATES || !1, _ = y.SAFE_FOR_XML !== !1, E = y.WHOLE_DOCUMENT || !1, D = y.RETURN_DOM || !1, V = y.RETURN_DOM_FRAGMENT || !1, W = y.RETURN_TRUSTED_TYPE || !1, N = y.FORCE_BODY || !1, q = y.SANITIZE_DOM !== !1, b = y.SANITIZE_NAMED_PROPS || !1, M = y.KEEP_CONTENT !== !1, H = y.IN_PLACE || !1, Te = y.ALLOWED_URI_REGEXP || qc, S = y.NAMESPACE || O, we = y.MATHML_TEXT_INTEGRATION_POINTS || we, Ne = y.HTML_INTEGRATION_POINTS || Ne, Oe = y.CUSTOM_ELEMENT_HANDLING || {}, y.CUSTOM_ELEMENT_HANDLING && ir(y.CUSTOM_ELEMENT_HANDLING.tagNameCheck) && (Oe.tagNameCheck = y.CUSTOM_ELEMENT_HANDLING.tagNameCheck), y.CUSTOM_ELEMENT_HANDLING && ir(y.CUSTOM_ELEMENT_HANDLING.attributeNameCheck) && (Oe.attributeNameCheck = y.CUSTOM_ELEMENT_HANDLING.attributeNameCheck), y.CUSTOM_ELEMENT_HANDLING && typeof y.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements == "boolean" && (Oe.allowCustomizedBuiltInElements = y.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements), g && (_t = !1), V && (D = !0), G && (be = Ie({}, il), Le = [], G.html === !0 && (Ie(be, rl), Ie(Le, ol)), G.svg === !0 && (Ie(be, Mi), Ie(Le, Di), Ie(Le, vr)), G.svgFilters === !0 && (Ie(be, Pi), Ie(Le, Di), Ie(Le, vr)), G.mathMl === !0 && (Ie(be, Fi), Ie(Le, al), Ie(Le, vr))), y.ADD_TAGS && (be === Se && (be = dn(be)), Ie(be, y.ADD_TAGS, Ze)), y.ADD_ATTR && (Le === Ot && (Le = dn(Le)), Ie(Le, y.ADD_ATTR, Ze)), y.ADD_URI_SAFE_ATTR && Ie(Ce, y.ADD_URI_SAFE_ATTR, Ze), y.FORBID_CONTENTS && (ne === _e && (ne = dn(ne)), Ie(ne, y.FORBID_CONTENTS, Ze)), M && (be["#text"] = !0), E && Ie(be, ["html", "head", "body"]), be.table && (Ie(be, ["tbody"]), delete it.tbody), y.TRUSTED_TYPES_POLICY) {
        if (typeof y.TRUSTED_TYPES_POLICY.createHTML != "function")
          throw Ms('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
        if (typeof y.TRUSTED_TYPES_POLICY.createScriptURL != "function")
          throw Ms('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
        T = y.TRUSTED_TYPES_POLICY, L = T.createHTML("");
      } else
        T === void 0 && (T = mp(B, r)), T !== null && typeof L == "string" && (L = T.createHTML(""));
      It && It(y), qt = y;
    }
  }, Hn = Ie({}, [...Mi, ...Pi, ...ip]), ys = Ie({}, [...Fi, ...op]), or = function(y) {
    let z = oe(y);
    (!z || !z.tagName) && (z = {
      namespaceURI: S,
      tagName: "template"
    });
    const X = Rr(y.tagName), me = Rr(z.tagName);
    return Z[y.namespaceURI] ? y.namespaceURI === m ? z.namespaceURI === O ? X === "svg" : z.namespaceURI === f ? X === "svg" && (me === "annotation-xml" || we[me]) : !!Hn[X] : y.namespaceURI === f ? z.namespaceURI === O ? X === "math" : z.namespaceURI === m ? X === "math" && Ne[me] : !!ys[X] : y.namespaceURI === O ? z.namespaceURI === m && !Ne[me] || z.namespaceURI === f && !we[me] ? !1 : !ys[X] && (Ge[X] || !Hn[X]) : !!($e === "application/xhtml+xml" && Z[y.namespaceURI]) : !1;
  }, ct = function(y) {
    Os(t.removed, {
      element: y
    });
    try {
      oe(y).removeChild(y);
    } catch {
      F(y);
    }
  }, Zt = function(y, z) {
    try {
      Os(t.removed, {
        attribute: z.getAttributeNode(y),
        from: z
      });
    } catch {
      Os(t.removed, {
        attribute: null,
        from: z
      });
    }
    if (z.removeAttribute(y), y === "is")
      if (D || V)
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
    let z = null, X = null;
    if (N)
      y = "<remove></remove>" + y;
    else {
      const Ae = sl(y, /^[\r\n\t ]+/);
      X = Ae && Ae[0];
    }
    $e === "application/xhtml+xml" && S === O && (y = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + y + "</body></html>");
    const me = T ? T.createHTML(y) : y;
    if (S === O)
      try {
        z = new k().parseFromString(me, $e);
      } catch {
      }
    if (!z || !z.documentElement) {
      z = K.createDocument(S, "template", null);
      try {
        z.documentElement.innerHTML = U ? L : me;
      } catch {
      }
    }
    const Fe = z.body || z.documentElement;
    return y && X && Fe.insertBefore(n.createTextNode(X), Fe.childNodes[0] || null), S === O ? Me.call(z, E ? "html" : "body")[0] : E ? z.documentElement : Fe;
  }, vs = function(y) {
    return Y.call(
      y.ownerDocument || y,
      y,
      // eslint-disable-next-line no-bitwise
      d.SHOW_ELEMENT | d.SHOW_COMMENT | d.SHOW_TEXT | d.SHOW_PROCESSING_INSTRUCTION | d.SHOW_CDATA_SECTION,
      null
    );
  }, kn = function(y) {
    return y instanceof w && (typeof y.nodeName != "string" || typeof y.textContent != "string" || typeof y.removeChild != "function" || !(y.attributes instanceof c) || typeof y.removeAttribute != "function" || typeof y.setAttribute != "function" || typeof y.namespaceURI != "string" || typeof y.insertBefore != "function" || typeof y.hasChildNodes != "function");
  }, bs = function(y) {
    return typeof a == "function" && y instanceof a;
  };
  function xt(te, y, z) {
    yr(te, (X) => {
      X.call(t, y, z, qt);
    });
  }
  const ar = function(y) {
    let z = null;
    if (xt(xe.beforeSanitizeElements, y, null), kn(y))
      return ct(y), !0;
    const X = Ze(y.nodeName);
    if (xt(xe.uponSanitizeElement, y, {
      tagName: X,
      allowedTags: be
    }), _ && y.hasChildNodes() && !bs(y.firstElementChild) && At(/<[/\w!]/g, y.innerHTML) && At(/<[/\w!]/g, y.textContent) || y.nodeType === Fs.progressingInstruction || _ && y.nodeType === Fs.comment && At(/<[/\w]/g, y.data))
      return ct(y), !0;
    if (!be[X] || it[X]) {
      if (!it[X] && ws(X) && (Oe.tagNameCheck instanceof RegExp && At(Oe.tagNameCheck, X) || Oe.tagNameCheck instanceof Function && Oe.tagNameCheck(X)))
        return !1;
      if (M && !ne[X]) {
        const me = oe(y) || y.parentNode, Fe = ce(y) || y.childNodes;
        if (Fe && me) {
          const Ae = Fe.length;
          for (let at = Ae - 1; at >= 0; --at) {
            const Tt = j(Fe[at], !0);
            Tt.__removalCount = (y.__removalCount || 0) + 1, me.insertBefore(Tt, ie(y));
          }
        }
      }
      return ct(y), !0;
    }
    return y instanceof l && !or(y) || (X === "noscript" || X === "noembed" || X === "noframes") && At(/<\/no(script|embed|frames)/i, y.innerHTML) ? (ct(y), !0) : (g && y.nodeType === Fs.text && (z = y.textContent, yr([pe, Ye, Xe], (me) => {
      z = Ns(z, me, " ");
    }), y.textContent !== z && (Os(t.removed, {
      element: y.cloneNode()
    }), y.textContent = z)), xt(xe.afterSanitizeElements, y, null), !1);
  }, Wn = function(y, z, X) {
    if (q && (z === "id" || z === "name") && (X in n || X in rr))
      return !1;
    if (!(_t && !ht[z] && At(rt, z))) {
      if (!(dt && At(fe, z))) {
        if (!Le[z] || ht[z]) {
          if (
            // First condition does a very basic check if a) it's basically a valid custom element tagname AND
            // b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
            // and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
            !(ws(y) && (Oe.tagNameCheck instanceof RegExp && At(Oe.tagNameCheck, y) || Oe.tagNameCheck instanceof Function && Oe.tagNameCheck(y)) && (Oe.attributeNameCheck instanceof RegExp && At(Oe.attributeNameCheck, z) || Oe.attributeNameCheck instanceof Function && Oe.attributeNameCheck(z)) || // Alternative, second condition checks if it's an `is`-attribute, AND
            // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
            z === "is" && Oe.allowCustomizedBuiltInElements && (Oe.tagNameCheck instanceof RegExp && At(Oe.tagNameCheck, X) || Oe.tagNameCheck instanceof Function && Oe.tagNameCheck(X)))
          ) return !1;
        } else if (!Ce[z]) {
          if (!At(Te, Ns(X, ae, ""))) {
            if (!((z === "src" || z === "xlink:href" || z === "href") && y !== "script" && tp(X, "data:") === 0 && ue[y])) {
              if (!(pt && !At(ge, Ns(X, ae, "")))) {
                if (X)
                  return !1;
              }
            }
          }
        }
      }
    }
    return !0;
  }, ws = function(y) {
    return y !== "annotation-xml" && sl(y, st);
  }, lr = function(y) {
    xt(xe.beforeSanitizeAttributes, y, null);
    const {
      attributes: z
    } = y;
    if (!z || kn(y))
      return;
    const X = {
      attrName: "",
      attrValue: "",
      keepAttr: !0,
      allowedAttributes: Le,
      forceKeepAttr: void 0
    };
    let me = z.length;
    for (; me--; ) {
      const Fe = z[me], {
        name: Ae,
        namespaceURI: at,
        value: Tt
      } = Fe, xn = Ze(Ae), jt = Tt;
      let De = Ae === "value" ? jt : np(jt);
      if (X.attrName = xn, X.attrValue = De, X.keepAttr = !0, X.forceKeepAttr = void 0, xt(xe.uponSanitizeAttribute, y, X), De = X.attrValue, b && (xn === "id" || xn === "name") && (Zt(Ae, y), De = R + De), _ && At(/((--!?|])>)|<\/(style|title)/i, De)) {
        Zt(Ae, y);
        continue;
      }
      if (X.forceKeepAttr)
        continue;
      if (!X.keepAttr) {
        Zt(Ae, y);
        continue;
      }
      if (!kt && At(/\/>/i, De)) {
        Zt(Ae, y);
        continue;
      }
      g && yr([pe, Ye, Xe], (Qt) => {
        De = Ns(De, Qt, " ");
      });
      const Tn = Ze(y.nodeName);
      if (!Wn(Tn, xn, De)) {
        Zt(Ae, y);
        continue;
      }
      if (T && typeof B == "object" && typeof B.getAttributeType == "function" && !at)
        switch (B.getAttributeType(Tn, xn)) {
          case "TrustedHTML": {
            De = T.createHTML(De);
            break;
          }
          case "TrustedScriptURL": {
            De = T.createScriptURL(De);
            break;
          }
        }
      if (De !== jt)
        try {
          at ? y.setAttributeNS(at, Ae, De) : y.setAttribute(Ae, De), kn(y) ? ct(y) : nl(t.removed);
        } catch {
          Zt(Ae, y);
        }
    }
    xt(xe.afterSanitizeAttributes, y, null);
  }, cr = function te(y) {
    let z = null;
    const X = vs(y);
    for (xt(xe.beforeSanitizeShadowDOM, y, null); z = X.nextNode(); )
      xt(xe.uponSanitizeShadowNode, z, null), ar(z), lr(z), z.content instanceof i && te(z.content);
    xt(xe.afterSanitizeShadowDOM, y, null);
  };
  return t.sanitize = function(te) {
    let y = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, z = null, X = null, me = null, Fe = null;
    if (U = !te, U && (te = "<!-->"), typeof te != "string" && !bs(te))
      if (typeof te.toString == "function") {
        if (te = te.toString(), typeof te != "string")
          throw Ms("dirty is not a string, aborting");
      } else
        throw Ms("toString is not a function");
    if (!t.isSupported)
      return te;
    if ($ || zn(y), t.removed = [], typeof te == "string" && (H = !1), H) {
      if (te.nodeName) {
        const Tt = Ze(te.nodeName);
        if (!be[Tt] || it[Tt])
          throw Ms("root node is forbidden and cannot be sanitized in-place");
      }
    } else if (te instanceof a)
      z = Jt("<!---->"), X = z.ownerDocument.importNode(te, !0), X.nodeType === Fs.element && X.nodeName === "BODY" || X.nodeName === "HTML" ? z = X : z.appendChild(X);
    else {
      if (!D && !g && !E && // eslint-disable-next-line unicorn/prefer-includes
      te.indexOf("<") === -1)
        return T && W ? T.createHTML(te) : te;
      if (z = Jt(te), !z)
        return D ? null : W ? L : "";
    }
    z && N && ct(z.firstChild);
    const Ae = vs(H ? te : z);
    for (; me = Ae.nextNode(); )
      ar(me), lr(me), me.content instanceof i && cr(me.content);
    if (H)
      return te;
    if (D) {
      if (V)
        for (Fe = ve.call(z.ownerDocument); z.firstChild; )
          Fe.appendChild(z.firstChild);
      else
        Fe = z;
      return (Le.shadowroot || Le.shadowrootmode) && (Fe = Be.call(s, Fe, !0)), Fe;
    }
    let at = E ? z.outerHTML : z.innerHTML;
    return E && be["!doctype"] && z.ownerDocument && z.ownerDocument.doctype && z.ownerDocument.doctype.name && At(jc, z.ownerDocument.doctype.name) && (at = "<!DOCTYPE " + z.ownerDocument.doctype.name + `>
` + at), g && yr([pe, Ye, Xe], (Tt) => {
      at = Ns(at, Tt, " ");
    }), T && W ? T.createHTML(at) : at;
  }, t.setConfig = function() {
    let te = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    zn(te), $ = !0;
  }, t.clearConfig = function() {
    qt = null, $ = !1;
  }, t.isValidAttribute = function(te, y, z) {
    qt || zn({});
    const X = Ze(te), me = Ze(y);
    return Wn(X, me, z);
  }, t.addHook = function(te, y) {
    typeof y == "function" && Os(xe[te], y);
  }, t.removeHook = function(te, y) {
    if (y !== void 0) {
      const z = Qd(xe[te], y);
      return z === -1 ? void 0 : ep(xe[te], z, 1)[0];
    }
    return nl(xe[te]);
  }, t.removeHooks = function(te) {
    xe[te] = [];
  }, t.removeAllHooks = function() {
    xe = cl();
  }, t;
}
var Wo = Vc();
Wo.addHook("uponSanitizeElement", (e, t) => {
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
Wo.addHook("afterSanitizeAttributes", (e) => {
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
function _p(e) {
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
  return Wo.sanitize(e, t);
}
He.setOptions({
  renderer: new He.Renderer(),
  gfm: !0,
  breaks: !0
});
const Ir = (e) => _p(He(e || "")), ul = "*", yp = /* @__PURE__ */ new Set(["null", "about:blank", ""]);
let tn = null;
const Lr = (e) => e && !yp.has(e) ? e : null, vp = (e) => {
  if (!e) return null;
  try {
    return Lr(new URL(e).origin);
  } catch {
    return null;
  }
};
function bp() {
  if (tn) return tn;
  if (window.parent === window)
    return tn = Lr(window.location.origin) || ul, tn;
  try {
    const e = Lr(window.parent.location.origin);
    if (e)
      return tn = e, tn;
  } catch {
  }
  try {
    const e = window.location.ancestorOrigins, t = e && e.length ? Lr(e[0]) : null;
    if (t)
      return tn = t, tn;
  } catch {
  }
  return tn = vp(document.referrer) || ul, tn;
}
function Nn(e) {
  window.parent.postMessage(e, bp());
}
const Gr = "Start a new chat", fl = "Start a new chat? This ends the current one.", wp = "Start new chat", kp = "Cancel", hl = "Couldn't start a new chat. Please try again.", xp = 15e3, Tp = ["aria-label"], Ap = { class: "new-chat-confirm__question" }, Ep = { class: "new-chat-confirm__actions" }, Sp = ["disabled"], Cp = ["disabled"], Rp = /* @__PURE__ */ Io({
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
      "aria-label": C(fl)
    }, [
      v("p", Ap, J(s.error || C(fl)), 1),
      v("div", Ep, [
        v("button", {
          type: "button",
          class: "new-chat-confirm__button",
          disabled: s.busy,
          onClick: r[0] || (r[0] = (i) => n("cancel"))
        }, J(C(kp)), 9, Sp),
        v("button", {
          type: "button",
          class: "new-chat-confirm__button new-chat-confirm__button--primary",
          disabled: s.busy,
          onClick: r[1] || (r[1] = (i) => n("confirm"))
        }, J(C(wp)), 9, Cp)
      ])
    ], 8, Tp));
  }
}), qo = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [s, r] of t)
    n[s] = r;
  return n;
}, Kc = /* @__PURE__ */ qo(Rp, [["__scopeId", "data-v-6c78f353"]]), Ip = { class: "askai" }, Lp = { class: "askai__bar" }, Op = ["value", "placeholder", "disabled", "aria-label", "onKeydown"], Np = ["disabled", "title", "aria-label", "aria-expanded"], Mp = { class: "askai__intro" }, Pp = { class: "askai__title" }, Fp = {
  key: 0,
  class: "askai__subtitle"
}, Dp = {
  key: 0,
  class: "askai__suggestions"
}, Bp = ["disabled", "onClick"], $p = ["aria-live"], Up = {
  key: 0,
  class: "askai__question"
}, zp = {
  key: 1,
  class: "askai__system"
}, Hp = ["innerHTML"], Wp = {
  key: 0,
  class: "askai__sources"
}, qp = ["title"], jp = {
  key: 0,
  class: "askai__thinking",
  role: "status",
  "aria-live": "polite"
}, Vp = { class: "askai__thinking-text" }, Kp = { class: "askai__foot" }, Gp = { key: 0 }, Yp = /* @__PURE__ */ Io({
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
    const n = e, s = t, r = re(null), i = re(null), o = re(null), a = ["user", "bot", "agent", "system"], l = le(
      () => n.messages.map((T, L) => ({ message: T, index: L })).filter(({ message: T }) => a.includes(T.message_type))
    ), d = le(() => l.value.length > 0), c = (T) => {
      s("update:draft", T.target.value);
    }, w = () => {
      !n.inputEnabled || !n.draft.trim() || s("send");
    }, k = (T) => {
      n.inputEnabled && s("ask", T);
    }, B = typeof navigator < "u" && /Mac|iPod|iPhone|iPad/.test(navigator.platform || ""), I = (T) => {
      if (T.key === "Escape") {
        T.preventDefault(), s("close");
        return;
      }
      const L = B ? T.metaKey && !T.ctrlKey : T.ctrlKey && !T.metaKey;
      n.hotkey && L && !T.altKey && (T.key === "k" || T.key === "K") && (T.preventDefault(), s("close"));
    }, j = () => {
      Qn(() => {
        var T;
        return (T = r.value) == null ? void 0 : T.focus();
      });
    };
    let F = 0;
    const ie = () => {
      if (!o.value) return;
      const T = o.value.closest(".askai"), L = i.value;
      if (!T || !L) return;
      const K = T.offsetHeight - L.offsetHeight, Y = getComputedStyle(L), ve = parseFloat(Y.paddingTop) + parseFloat(Y.paddingBottom), Me = Math.ceil(K + ve + o.value.getBoundingClientRect().height);
      Math.abs(Me - F) < 3 || (F = Me, Nn({ type: "WIDGET_RESIZE", height: Me }));
    };
    let ce = null;
    const oe = le(
      () => l.value.reduce((T, { message: L, index: K }) => T + n.displayText(K, L.message || "").length, 0)
    );
    return Pt(
      () => [l.value.length, oe.value, n.loading],
      () => Qn(() => {
        i.value && (i.value.scrollTop = i.value.scrollHeight);
      })
    ), Pt(() => n.newChatArmed, () => Qn(() => ie())), Pt(() => n.active, (T) => {
      T && j();
    }), ri(() => {
      n.active && j(), window.addEventListener("keydown", I), o.value && typeof ResizeObserver < "u" && (ce = new ResizeObserver(() => ie()), ce.observe(o.value)), ie();
    }), oc(() => {
      window.removeEventListener("keydown", I), ce == null || ce.disconnect(), ce = null;
    }), (T, L) => (x(), A("div", Ip, [
      v("div", Lp, [
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
          value: T.draft,
          placeholder: T.placeholder,
          disabled: !T.inputEnabled,
          "aria-label": T.placeholder,
          autocomplete: "off",
          spellcheck: "false",
          onInput: c,
          onKeydown: Sr(Zn(w, ["prevent"]), ["enter"])
        }, null, 40, Op),
        T.canStartNewChat ? (x(), A("button", {
          key: 0,
          type: "button",
          class: Ue(["askai__new", { "askai__new--armed": T.newChatArmed }]),
          disabled: T.startingNewChat,
          title: C(Gr),
          "aria-label": C(Gr),
          "aria-expanded": T.newChatArmed,
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
        ]), 10, Np)) : se("", !0),
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
      T.newChatArmed && T.canStartNewChat ? (x(), Hr(Kc, {
        key: 0,
        busy: T.startingNewChat,
        error: T.newChatError,
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
          d.value ? (x(), A(ze, { key: 1 }, [
            (x(!0), A(ze, null, gt(l.value, ({ message: K, index: Y }) => (x(), A("div", {
              key: Y,
              class: "askai__turn",
              "aria-live": T.isStreaming(Y) ? "off" : "polite"
            }, [
              K.message_type === "user" ? (x(), A("p", Up, J(K.message), 1)) : K.message_type === "system" ? (x(), A("p", zp, J(K.message), 1)) : (x(), A(ze, { key: 2 }, [
                v("div", {
                  class: Ue(["askai__answer", { "askai__answer--streaming": T.isStreaming(Y) }]),
                  innerHTML: C(Ir)(T.isStreaming(Y) ? T.displayText(Y, K.message || "") : K.message || "")
                }, null, 10, Hp),
                T.showCitations && !T.isStreaming(Y) && K.sources && K.sources.length ? (x(), A("div", Wp, [
                  L[9] || (L[9] = v("span", { class: "askai__label" }, "Sources", -1)),
                  (x(!0), A(ze, null, gt(K.sources, (ve, Me) => (x(), A("span", {
                    key: Me,
                    class: "askai__source",
                    title: T.citationTooltip(ve)
                  }, J(T.citationLabel(ve)), 9, qp))), 128))
                ])) : se("", !0)
              ], 64))
            ], 8, $p))), 128)),
            T.loading ? (x(), A("div", jp, [
              L[10] || (L[10] = v("span", { class: "askai__dot" }, null, -1)),
              L[11] || (L[11] = v("span", { class: "askai__dot" }, null, -1)),
              L[12] || (L[12] = v("span", { class: "askai__dot" }, null, -1)),
              v("span", Vp, J(T.showCitations ? "Searching the knowledge base" : "Thinking"), 1)
            ])) : se("", !0)
          ], 64)) : (x(), A(ze, { key: 0 }, [
            v("div", Mp, [
              v("h2", Pp, J(T.welcomeTitle || `Ask ${T.agentName}`), 1),
              T.welcomeSubtitle ? (x(), A("p", Fp, J(T.welcomeSubtitle), 1)) : se("", !0)
            ]),
            T.suggestions.length && !T.draft.trim() ? (x(), A("div", Dp, [
              L[8] || (L[8] = v("p", { class: "askai__label" }, "Suggested", -1)),
              (x(!0), A(ze, null, gt(T.suggestions, (K) => (x(), A("button", {
                key: K,
                type: "button",
                class: "askai__suggestion",
                disabled: !T.inputEnabled,
                onClick: (Y) => k(K)
              }, [
                v("span", null, J(K), 1),
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
              ], 8, Bp))), 128))
            ])) : se("", !0)
          ], 64))
        ], 512)
      ], 512),
      v("div", Kp, [
        T.disclaimer ? (x(), A("span", Gp, J(T.disclaimer), 1)) : se("", !0),
        L[13] || (L[13] = v("a", {
          class: "askai__brand",
          href: "https://chattermate.chat",
          target: "_blank",
          rel: "noopener noreferrer"
        }, "Powered by ChatterMate", -1))
      ])
    ]));
  }
}), Xp = /* @__PURE__ */ qo(Yp, [["__scopeId", "data-v-7c4beb9f"]]), $s = [
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
], Zp = (e) => (e || "").split("").reduce((t, n) => t + n.charCodeAt(0), 0) % $s.length, Jp = (e) => {
  const t = $s[(e % $s.length + $s.length) % $s.length];
  return {
    background: `
            radial-gradient(circle at 32% 28%, rgba(255,255,255,0.22) 0%, transparent 42%),
            radial-gradient(circle at 68% 72%, rgba(0,0,0,0.25) 0%, transparent 38%),
            radial-gradient(ellipse at 50% 50%, ${t.stops})
        `.trim(),
    boxShadow: `0 4px 28px ${t.glow}, inset 0 1px 0 rgba(255,255,255,0.15)`,
    borderRadius: "50%"
  };
}, Qp = (e, t) => {
  const n = typeof t == "number" && Number.isFinite(t) ? t : Zp(e);
  return Jp(n);
}, dl = (e) => {
  var t;
  return !!((t = e == null ? void 0 : e.attributes) != null && t.end_chat);
}, pl = "AI can make mistakes. Check important info.";
function eg(e, t = !1) {
  return e !== !1 && !t;
}
const Bi = {
  ai: "Online · replies instantly",
  human: "Online · usually replies in a few minutes",
  away: "Away · we'll reply when we're back"
};
function tg(e, t = !1) {
  return (t ? "human" : (e == null ? void 0 : e.mode) ?? "ai") === "ai" ? { text: Bi.ai, online: !0 } : (e == null ? void 0 : e.available) !== !1 ? { text: Bi.human, online: !0 } : { text: Bi.away, online: !1 };
}
const Gc = (e) => !!e && (/^https?:\/\//i.test(e) || e.startsWith("data:")), ng = (e, t) => e ? Gc(e) || e.startsWith("blob:") ? e : `${t.replace(/\/api\/v1\/?$/, "")}${e.startsWith("/") ? "" : "/"}${e}` : "";
function gl() {
  return typeof window < "u" && window.APP_CONFIG ? window.APP_CONFIG : {};
}
const ms = {
  get API_URL() {
    return gl().API_URL || void 0 || "https://api.chattermate.chat/api/v1";
  },
  get WS_URL() {
    return gl().WS_URL || void 0 || "wss://api.chattermate.chat";
  }
};
function Yr(e) {
  return ng(e, ms.API_URL);
}
function sg(e) {
  const t = le(() => ({
    backgroundColor: "var(--cm-card)",
    color: "var(--cm-text)"
  })), n = le(() => ({
    backgroundColor: e.value.chat_bubble_color || "#C9F24E",
    color: ds(e.value.chat_bubble_color || "#C9F24E") ? "#FFFFFF" : "#000000"
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
  })), a = le(() => Yr(e.value.photo_url)), l = le(() => {
    const d = e.value.chat_background_color || "#ffffff";
    return {
      boxShadow: `0 8px 5px ${ds(d) ? "rgba(0, 0, 0, 0.24)" : "rgba(0, 0, 0, 0.12)"}`
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
const rg = /* @__PURE__ */ new Set(["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]), ig = /* @__PURE__ */ new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);
[...rg, ...ig];
function og(e, t) {
  const n = re([]), s = re(!1), r = re(null), i = (L) => {
    if (L === 0) return "0 Bytes";
    const K = 1024, Y = ["Bytes", "KB", "MB", "GB"], ve = Math.floor(Math.log(L) / Math.log(K));
    return parseFloat((L / Math.pow(K, ve)).toFixed(2)) + " " + Y[ve];
  }, o = (L) => L.startsWith("image/"), a = (L) => L ? Yr(L) : "", l = (L) => {
    const K = L.file_url || L.url;
    return K ? Yr(K) : "";
  }, d = async (L) => {
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
  }, B = async (L) => {
    var ve;
    const K = (ve = L.clipboardData) == null ? void 0 : ve.items;
    if (!K) return;
    const Y = [];
    for (const Me of Array.from(K))
      if (Me.kind === "file") {
        const Be = Me.getAsFile();
        Be && Y.push(Be);
      }
    Y.length > 0 && await j(Y);
  }, I = async (L, K = 500) => new Promise((Y, ve) => {
    const Me = new FileReader();
    Me.onload = (Be) => {
      var pe;
      const xe = new Image();
      xe.onload = () => {
        const Ye = document.createElement("canvas");
        let Xe = xe.width, rt = xe.height;
        const fe = 1920;
        (Xe > fe || rt > fe) && (Xe > rt ? (rt = rt / Xe * fe, Xe = fe) : (Xe = Xe / rt * fe, rt = fe)), Ye.width = Xe, Ye.height = rt;
        const ge = Ye.getContext("2d");
        if (!ge) {
          ve(new Error("Failed to get canvas context"));
          return;
        }
        ge.drawImage(xe, 0, 0, Xe, rt);
        let ae = 0.9;
        const st = () => {
          Ye.toBlob((Te) => {
            if (!Te) {
              ve(new Error("Failed to compress image"));
              return;
            }
            if (Te.size / 1024 > K && ae > 0.3)
              ae -= 0.1, st();
            else {
              const Se = new FileReader();
              Se.onload = () => {
                const Le = Se.result.split(",")[1];
                Y({ blob: Te, base64: Le });
              }, Se.readAsDataURL(Te);
            }
          }, L.type === "image/png" ? "image/png" : "image/jpeg", ae);
        };
        st();
      }, xe.onerror = () => ve(new Error("Failed to load image")), xe.src = (pe = Be.target) == null ? void 0 : pe.result;
    }, Me.onerror = () => ve(new Error("Failed to read file")), Me.readAsDataURL(L);
  }), j = async (L) => {
    if (n.value.length >= 3) {
      alert("Maximum 3 files allowed per message");
      return;
    }
    const Be = 3 - n.value.length, xe = L.slice(0, Be);
    L.length > Be && alert(`Only ${Be} more file(s) can be uploaded. Maximum 3 files per message.`);
    for (const pe of xe)
      try {
        if (n.value.some((fe) => fe.filename === pe.name)) {
          console.warn(`File ${pe.name} is already selected`), alert(`File "${pe.name}" is already selected`);
          continue;
        }
        const Xe = pe.type.startsWith("image/"), rt = Xe ? 5242880 : 10485760;
        if (pe.size > rt) {
          const fe = rt / 1048576;
          console.error(`File ${pe.name} is too large. Maximum size is ${fe}MB`), alert(`File "${pe.name}" is too large. Maximum size for ${Xe ? "images" : "documents"} is ${fe}MB`);
          continue;
        }
        if (Xe)
          try {
            const { blob: fe, base64: ge } = await I(pe, 500), ae = fe.size;
            console.log(`Compressed ${pe.name}: ${(pe.size / 1024).toFixed(2)}KB → ${(ae / 1024).toFixed(2)}KB`), n.value.push({
              content: ge,
              filename: pe.name,
              type: pe.type,
              size: ae,
              url: URL.createObjectURL(fe),
              file_url: URL.createObjectURL(fe)
            });
          } catch (fe) {
            console.error("Image compression failed, uploading original:", fe);
            const ge = new FileReader();
            ge.onload = (ae) => {
              var be;
              const Te = ((be = ae.target) == null ? void 0 : be.result).split(",")[1];
              n.value.push({
                content: Te,
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
            var Te;
            const st = ((Te = ge.target) == null ? void 0 : Te.result).split(",")[1];
            n.value.push({
              content: st,
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
    handleFileSelect: d,
    handleDrop: c,
    handleDragOver: w,
    handleDragLeave: k,
    handlePaste: B,
    uploadFiles: j,
    removeAttachment: async (L) => {
      const K = n.value[L];
      if (K) {
        try {
          let Y = K.url;
          if (Y.startsWith("/uploads/") ? Y = Y.substring(9) : Y.startsWith("/") && (Y = Y.substring(1)), Gc(Y))
            try {
              Y = new URL(Y).pathname.replace(/^\/+/, "");
            } catch {
            }
          const ve = {};
          e.value && (ve.Authorization = `Bearer ${e.value}`);
          const Me = await fetch(`${ms.API_URL}/files/upload/${Y}`, {
            method: "DELETE",
            headers: ve
          });
          if (Me.ok)
            console.log("File deleted successfully from backend.");
          else {
            const Be = await Me.json();
            console.error("Failed to delete file:", Be.detail);
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
const un = /* @__PURE__ */ Object.create(null);
un.open = "0";
un.close = "1";
un.ping = "2";
un.pong = "3";
un.message = "4";
un.upgrade = "5";
un.noop = "6";
const Or = /* @__PURE__ */ Object.create(null);
Object.keys(un).forEach((e) => {
  Or[un[e]] = e;
});
const uo = { type: "error", data: "parser error" }, Yc = typeof Blob == "function" || typeof Blob < "u" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]", Xc = typeof ArrayBuffer == "function", Zc = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e && e.buffer instanceof ArrayBuffer, jo = ({ type: e, data: t }, n, s) => Yc && t instanceof Blob ? n ? s(t) : ml(t, s) : Xc && (t instanceof ArrayBuffer || Zc(t)) ? n ? s(t) : ml(new Blob([t]), s) : s(un[e] + (t || "")), ml = (e, t) => {
  const n = new FileReader();
  return n.onload = function() {
    const s = n.result.split(",")[1];
    t("b" + (s || ""));
  }, n.readAsDataURL(e);
};
function _l(e) {
  return e instanceof Uint8Array ? e : e instanceof ArrayBuffer ? new Uint8Array(e) : new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
}
let $i;
function ag(e, t) {
  if (Yc && e.data instanceof Blob)
    return e.data.arrayBuffer().then(_l).then(t);
  if (Xc && (e.data instanceof ArrayBuffer || Zc(e.data)))
    return t(_l(e.data));
  jo(e, !1, (n) => {
    $i || ($i = new TextEncoder()), t($i.encode(n));
  });
}
const yl = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", Us = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (let e = 0; e < yl.length; e++)
  Us[yl.charCodeAt(e)] = e;
const lg = (e) => {
  let t = e.length * 0.75, n = e.length, s, r = 0, i, o, a, l;
  e[e.length - 1] === "=" && (t--, e[e.length - 2] === "=" && t--);
  const d = new ArrayBuffer(t), c = new Uint8Array(d);
  for (s = 0; s < n; s += 4)
    i = Us[e.charCodeAt(s)], o = Us[e.charCodeAt(s + 1)], a = Us[e.charCodeAt(s + 2)], l = Us[e.charCodeAt(s + 3)], c[r++] = i << 2 | o >> 4, c[r++] = (o & 15) << 4 | a >> 2, c[r++] = (a & 3) << 6 | l & 63;
  return d;
}, cg = typeof ArrayBuffer == "function", Vo = (e, t) => {
  if (typeof e != "string")
    return {
      type: "message",
      data: Jc(e, t)
    };
  const n = e.charAt(0);
  return n === "b" ? {
    type: "message",
    data: ug(e.substring(1), t)
  } : Or[n] ? e.length > 1 ? {
    type: Or[n],
    data: e.substring(1)
  } : {
    type: Or[n]
  } : uo;
}, ug = (e, t) => {
  if (cg) {
    const n = lg(e);
    return Jc(n, t);
  } else
    return { base64: !0, data: e };
}, Jc = (e, t) => {
  switch (t) {
    case "blob":
      return e instanceof Blob ? e : new Blob([e]);
    case "arraybuffer":
    default:
      return e instanceof ArrayBuffer ? e : e.buffer;
  }
}, Qc = "", fg = (e, t) => {
  const n = e.length, s = new Array(n);
  let r = 0;
  e.forEach((i, o) => {
    jo(i, !1, (a) => {
      s[o] = a, ++r === n && t(s.join(Qc));
    });
  });
}, hg = (e, t) => {
  const n = e.split(Qc), s = [];
  for (let r = 0; r < n.length; r++) {
    const i = Vo(n[r], t);
    if (s.push(i), i.type === "error")
      break;
  }
  return s;
};
function dg() {
  return new TransformStream({
    transform(e, t) {
      ag(e, (n) => {
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
let Ui;
function br(e) {
  return e.reduce((t, n) => t + n.length, 0);
}
function wr(e, t) {
  if (e[0].length === t)
    return e.shift();
  const n = new Uint8Array(t);
  let s = 0;
  for (let r = 0; r < t; r++)
    n[r] = e[0][s++], s === e[0].length && (e.shift(), s = 0);
  return e.length && s < e[0].length && (e[0] = e[0].slice(s)), n;
}
function pg(e, t) {
  Ui || (Ui = new TextDecoder());
  const n = [];
  let s = 0, r = -1, i = !1;
  return new TransformStream({
    transform(o, a) {
      for (n.push(o); ; ) {
        if (s === 0) {
          if (br(n) < 1)
            break;
          const l = wr(n, 1);
          i = (l[0] & 128) === 128, r = l[0] & 127, r < 126 ? s = 3 : r === 126 ? s = 1 : s = 2;
        } else if (s === 1) {
          if (br(n) < 2)
            break;
          const l = wr(n, 2);
          r = new DataView(l.buffer, l.byteOffset, l.length).getUint16(0), s = 3;
        } else if (s === 2) {
          if (br(n) < 8)
            break;
          const l = wr(n, 8), d = new DataView(l.buffer, l.byteOffset, l.length), c = d.getUint32(0);
          if (c > Math.pow(2, 21) - 1) {
            a.enqueue(uo);
            break;
          }
          r = c * Math.pow(2, 32) + d.getUint32(4), s = 3;
        } else {
          if (br(n) < r)
            break;
          const l = wr(n, r);
          a.enqueue(Vo(i ? l : Ui.decode(l), t)), s = 0;
        }
        if (r === 0 || r > e) {
          a.enqueue(uo);
          break;
        }
      }
    }
  });
}
const eu = 4;
function ut(e) {
  if (e) return gg(e);
}
function gg(e) {
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
const ui = typeof Promise == "function" && typeof Promise.resolve == "function" ? (t) => Promise.resolve().then(t) : (t, n) => n(t, 0), $t = typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")(), mg = "arraybuffer";
function tu(e, ...t) {
  return t.reduce((n, s) => (e.hasOwnProperty(s) && (n[s] = e[s]), n), {});
}
const _g = $t.setTimeout, yg = $t.clearTimeout;
function fi(e, t) {
  t.useNativeTimers ? (e.setTimeoutFn = _g.bind($t), e.clearTimeoutFn = yg.bind($t)) : (e.setTimeoutFn = $t.setTimeout.bind($t), e.clearTimeoutFn = $t.clearTimeout.bind($t));
}
const vg = 1.33;
function bg(e) {
  return typeof e == "string" ? wg(e) : Math.ceil((e.byteLength || e.size) * vg);
}
function wg(e) {
  let t = 0, n = 0;
  for (let s = 0, r = e.length; s < r; s++)
    t = e.charCodeAt(s), t < 128 ? n += 1 : t < 2048 ? n += 2 : t < 55296 || t >= 57344 ? n += 3 : (s++, n += 4);
  return n;
}
function nu() {
  return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
}
function kg(e) {
  let t = "";
  for (let n in e)
    e.hasOwnProperty(n) && (t.length && (t += "&"), t += encodeURIComponent(n) + "=" + encodeURIComponent(e[n]));
  return t;
}
function xg(e) {
  let t = {}, n = e.split("&");
  for (let s = 0, r = n.length; s < r; s++) {
    let i = n[s].split("=");
    t[decodeURIComponent(i[0])] = decodeURIComponent(i[1]);
  }
  return t;
}
class Tg extends Error {
  constructor(t, n, s) {
    super(t), this.description = n, this.context = s, this.type = "TransportError";
  }
}
class Ko extends ut {
  /**
   * Transport abstract constructor.
   *
   * @param {Object} opts - options
   * @protected
   */
  constructor(t) {
    super(), this.writable = !1, fi(this, t), this.opts = t, this.query = t.query, this.socket = t.socket, this.supportsBinary = !t.forceBase64;
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
    return super.emitReserved("error", new Tg(t, n, s)), this;
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
    const n = Vo(t, this.socket.binaryType);
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
    const n = kg(t);
    return n.length ? "?" + n : "";
  }
}
class Ag extends Ko {
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
    hg(t, this.socket.binaryType).forEach(n), this.readyState !== "closed" && (this._polling = !1, this.emitReserved("pollComplete"), this.readyState === "open" && this._poll());
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
    this.writable = !1, fg(t, (n) => {
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
    return this.opts.timestampRequests !== !1 && (n[this.opts.timestampParam] = nu()), !this.supportsBinary && !n.sid && (n.b64 = 1), this.createUri(t, n);
  }
}
let su = !1;
try {
  su = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest();
} catch {
}
const Eg = su;
function Sg() {
}
class Cg extends Ag {
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
class ln extends ut {
  /**
   * Request constructor
   *
   * @param {Object} options
   * @package
   */
  constructor(t, n, s) {
    super(), this.createRequest = t, fi(this, s), this._opts = s, this._method = s.method || "GET", this._uri = n, this._data = s.data !== void 0 ? s.data : null, this._create();
  }
  /**
   * Creates the XHR object and sends the request.
   *
   * @private
   */
  _create() {
    var t;
    const n = tu(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
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
    typeof document < "u" && (this._index = ln.requestsCount++, ln.requests[this._index] = this);
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
      if (this._xhr.onreadystatechange = Sg, t)
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
ln.requestsCount = 0;
ln.requests = {};
if (typeof document < "u") {
  if (typeof attachEvent == "function")
    attachEvent("onunload", vl);
  else if (typeof addEventListener == "function") {
    const e = "onpagehide" in $t ? "pagehide" : "unload";
    addEventListener(e, vl, !1);
  }
}
function vl() {
  for (let e in ln.requests)
    ln.requests.hasOwnProperty(e) && ln.requests[e].abort();
}
const Rg = function() {
  const e = ru({
    xdomain: !1
  });
  return e && e.responseType !== null;
}();
class Ig extends Cg {
  constructor(t) {
    super(t);
    const n = t && t.forceBase64;
    this.supportsBinary = Rg && !n;
  }
  request(t = {}) {
    return Object.assign(t, { xd: this.xd }, this.opts), new ln(ru, this.uri(), t);
  }
}
function ru(e) {
  const t = e.xdomain;
  try {
    if (typeof XMLHttpRequest < "u" && (!t || Eg))
      return new XMLHttpRequest();
  } catch {
  }
  if (!t)
    try {
      return new $t[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
    } catch {
    }
}
const iu = typeof navigator < "u" && typeof navigator.product == "string" && navigator.product.toLowerCase() === "reactnative";
class Lg extends Ko {
  get name() {
    return "websocket";
  }
  doOpen() {
    const t = this.uri(), n = this.opts.protocols, s = iu ? {} : tu(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
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
      jo(s, this.supportsBinary, (i) => {
        try {
          this.doWrite(s, i);
        } catch {
        }
        r && ui(() => {
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
    return this.opts.timestampRequests && (n[this.opts.timestampParam] = nu()), this.supportsBinary || (n.b64 = 1), this.createUri(t, n);
  }
}
const zi = $t.WebSocket || $t.MozWebSocket;
class Og extends Lg {
  createSocket(t, n, s) {
    return iu ? new zi(t, n, s) : n ? new zi(t, n) : new zi(t);
  }
  doWrite(t, n) {
    this.ws.send(n);
  }
}
class Ng extends Ko {
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
        const n = pg(Number.MAX_SAFE_INTEGER, this.socket.binaryType), s = t.readable.pipeThrough(n).getReader(), r = dg();
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
        r && ui(() => {
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
const Mg = {
  websocket: Og,
  webtransport: Ng,
  polling: Ig
}, Pg = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/, Fg = [
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
function fo(e) {
  if (e.length > 8e3)
    throw "URI too long";
  const t = e, n = e.indexOf("["), s = e.indexOf("]");
  n != -1 && s != -1 && (e = e.substring(0, n) + e.substring(n, s).replace(/:/g, ";") + e.substring(s, e.length));
  let r = Pg.exec(e || ""), i = {}, o = 14;
  for (; o--; )
    i[Fg[o]] = r[o] || "";
  return n != -1 && s != -1 && (i.source = t, i.host = i.host.substring(1, i.host.length - 1).replace(/;/g, ":"), i.authority = i.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), i.ipv6uri = !0), i.pathNames = Dg(i, i.path), i.queryKey = Bg(i, i.query), i;
}
function Dg(e, t) {
  const n = /\/{2,9}/g, s = t.replace(n, "/").split("/");
  return (t.slice(0, 1) == "/" || t.length === 0) && s.splice(0, 1), t.slice(-1) == "/" && s.splice(s.length - 1, 1), s;
}
function Bg(e, t) {
  const n = {};
  return t.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function(s, r, i) {
    r && (n[r] = i);
  }), n;
}
const ho = typeof addEventListener == "function" && typeof removeEventListener == "function", Nr = [];
ho && addEventListener("offline", () => {
  Nr.forEach((e) => e());
}, !1);
class Pn extends ut {
  /**
   * Socket constructor.
   *
   * @param {String|Object} uri - uri or options
   * @param {Object} opts - options
   */
  constructor(t, n) {
    if (super(), this.binaryType = mg, this.writeBuffer = [], this._prevBufferLen = 0, this._pingInterval = -1, this._pingTimeout = -1, this._maxPayload = -1, this._pingTimeoutTime = 1 / 0, t && typeof t == "object" && (n = t, t = null), t) {
      const s = fo(t);
      n.hostname = s.host, n.secure = s.protocol === "https" || s.protocol === "wss", n.port = s.port, s.query && (n.query = s.query);
    } else n.host && (n.hostname = fo(n.host).host);
    fi(this, n), this.secure = n.secure != null ? n.secure : typeof location < "u" && location.protocol === "https:", n.hostname && !n.port && (n.port = this.secure ? "443" : "80"), this.hostname = n.hostname || (typeof location < "u" ? location.hostname : "localhost"), this.port = n.port || (typeof location < "u" && location.port ? location.port : this.secure ? "443" : "80"), this.transports = [], this._transportsByName = {}, n.transports.forEach((s) => {
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
    }, n), this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : ""), typeof this.opts.query == "string" && (this.opts.query = xg(this.opts.query)), ho && (this.opts.closeOnBeforeunload && (this._beforeunloadEventListener = () => {
      this.transport && (this.transport.removeAllListeners(), this.transport.close());
    }, addEventListener("beforeunload", this._beforeunloadEventListener, !1)), this.hostname !== "localhost" && (this._offlineEventListener = () => {
      this._onClose("transport close", {
        description: "network connection lost"
      });
    }, Nr.push(this._offlineEventListener))), this.opts.withCredentials && (this._cookieJar = void 0), this._open();
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
    n.EIO = eu, n.transport = t, this.id && (n.sid = this.id);
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
      if (r && (n += bg(r)), s > 0 && n > this._maxPayload)
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
    return t && (this._pingTimeoutTime = 0, ui(() => {
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
      if (this.clearTimeoutFn(this._pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), ho && (this._beforeunloadEventListener && removeEventListener("beforeunload", this._beforeunloadEventListener, !1), this._offlineEventListener)) {
        const s = Nr.indexOf(this._offlineEventListener);
        s !== -1 && Nr.splice(s, 1);
      }
      this.readyState = "closed", this.id = null, this.emitReserved("close", t, n), this.writeBuffer = [], this._prevBufferLen = 0;
    }
  }
}
Pn.protocol = eu;
class $g extends Pn {
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
    function d(w) {
      n && w.name !== n.name && i();
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
let Ug = class extends $g {
  constructor(t, n = {}) {
    const s = typeof t == "object" ? t : n;
    (!s.transports || s.transports && typeof s.transports[0] == "string") && (s.transports = (s.transports || ["polling", "websocket", "webtransport"]).map((r) => Mg[r]).filter((r) => !!r)), super(t, s);
  }
};
function zg(e, t = "", n) {
  let s = e;
  n = n || typeof location < "u" && location, e == null && (e = n.protocol + "//" + n.host), typeof e == "string" && (e.charAt(0) === "/" && (e.charAt(1) === "/" ? e = n.protocol + e : e = n.host + e), /^(https?|wss?):\/\//.test(e) || (typeof n < "u" ? e = n.protocol + "//" + e : e = "https://" + e), s = fo(e)), s.port || (/^(http|ws)$/.test(s.protocol) ? s.port = "80" : /^(http|ws)s$/.test(s.protocol) && (s.port = "443")), s.path = s.path || "/";
  const i = s.host.indexOf(":") !== -1 ? "[" + s.host + "]" : s.host;
  return s.id = s.protocol + "://" + i + ":" + s.port + t, s.href = s.protocol + "://" + i + (n && n.port === s.port ? "" : ":" + s.port), s;
}
const Hg = typeof ArrayBuffer == "function", Wg = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e.buffer instanceof ArrayBuffer, ou = Object.prototype.toString, qg = typeof Blob == "function" || typeof Blob < "u" && ou.call(Blob) === "[object BlobConstructor]", jg = typeof File == "function" || typeof File < "u" && ou.call(File) === "[object FileConstructor]";
function Go(e) {
  return Hg && (e instanceof ArrayBuffer || Wg(e)) || qg && e instanceof Blob || jg && e instanceof File;
}
function Mr(e, t) {
  if (!e || typeof e != "object")
    return !1;
  if (Array.isArray(e)) {
    for (let n = 0, s = e.length; n < s; n++)
      if (Mr(e[n]))
        return !0;
    return !1;
  }
  if (Go(e))
    return !0;
  if (e.toJSON && typeof e.toJSON == "function" && arguments.length === 1)
    return Mr(e.toJSON(), !0);
  for (const n in e)
    if (Object.prototype.hasOwnProperty.call(e, n) && Mr(e[n]))
      return !0;
  return !1;
}
function Vg(e) {
  const t = [], n = e.data, s = e;
  return s.data = po(n, t), s.attachments = t.length, { packet: s, buffers: t };
}
function po(e, t) {
  if (!e)
    return e;
  if (Go(e)) {
    const n = { _placeholder: !0, num: t.length };
    return t.push(e), n;
  } else if (Array.isArray(e)) {
    const n = new Array(e.length);
    for (let s = 0; s < e.length; s++)
      n[s] = po(e[s], t);
    return n;
  } else if (typeof e == "object" && !(e instanceof Date)) {
    const n = {};
    for (const s in e)
      Object.prototype.hasOwnProperty.call(e, s) && (n[s] = po(e[s], t));
    return n;
  }
  return e;
}
function Kg(e, t) {
  return e.data = go(e.data, t), delete e.attachments, e;
}
function go(e, t) {
  if (!e)
    return e;
  if (e && e._placeholder === !0) {
    if (typeof e.num == "number" && e.num >= 0 && e.num < t.length)
      return t[e.num];
    throw new Error("illegal attachments");
  } else if (Array.isArray(e))
    for (let n = 0; n < e.length; n++)
      e[n] = go(e[n], t);
  else if (typeof e == "object")
    for (const n in e)
      Object.prototype.hasOwnProperty.call(e, n) && (e[n] = go(e[n], t));
  return e;
}
const Gg = [
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
class Yg {
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
    return (t.type === Pe.EVENT || t.type === Pe.ACK) && Mr(t) ? this.encodeAsBinary({
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
    const n = Vg(t), s = this.encodeAsString(n.packet), r = n.buffers;
    return r.unshift(s), r;
  }
}
function bl(e) {
  return Object.prototype.toString.call(e) === "[object Object]";
}
class Yo extends ut {
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
      s || n.type === Pe.BINARY_ACK ? (n.type = s ? Pe.EVENT : Pe.ACK, this.reconstructor = new Xg(n), n.attachments === 0 && super.emitReserved("decoded", n)) : super.emitReserved("decoded", n);
    } else if (Go(t) || t.base64)
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
      if (Yo.isPayloadValid(s.type, i))
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
        return bl(n);
      case Pe.DISCONNECT:
        return n === void 0;
      case Pe.CONNECT_ERROR:
        return typeof n == "string" || bl(n);
      case Pe.EVENT:
      case Pe.BINARY_EVENT:
        return Array.isArray(n) && (typeof n[0] == "number" || typeof n[0] == "string" && Gg.indexOf(n[0]) === -1);
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
class Xg {
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
      const n = Kg(this.reconPack, this.buffers);
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
const Zg = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Decoder: Yo,
  Encoder: Yg,
  get PacketType() {
    return Pe;
  }
}, Symbol.toStringTag, { value: "Module" }));
function Yt(e, t, n) {
  return e.on(t, n), function() {
    e.off(t, n);
  };
}
const Jg = Object.freeze({
  connect: 1,
  connect_error: 1,
  disconnect: 1,
  disconnecting: 1,
  // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
  newListener: 1,
  removeListener: 1
});
class au extends ut {
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
    if (Jg.hasOwnProperty(t))
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
function _s(e) {
  e = e || {}, this.ms = e.min || 100, this.max = e.max || 1e4, this.factor = e.factor || 2, this.jitter = e.jitter > 0 && e.jitter <= 1 ? e.jitter : 0, this.attempts = 0;
}
_s.prototype.duration = function() {
  var e = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var t = Math.random(), n = Math.floor(t * this.jitter * e);
    e = (Math.floor(t * 10) & 1) == 0 ? e - n : e + n;
  }
  return Math.min(e, this.max) | 0;
};
_s.prototype.reset = function() {
  this.attempts = 0;
};
_s.prototype.setMin = function(e) {
  this.ms = e;
};
_s.prototype.setMax = function(e) {
  this.max = e;
};
_s.prototype.setJitter = function(e) {
  this.jitter = e;
};
class mo extends ut {
  constructor(t, n) {
    var s;
    super(), this.nsps = {}, this.subs = [], t && typeof t == "object" && (n = t, t = void 0), n = n || {}, n.path = n.path || "/socket.io", this.opts = n, fi(this, n), this.reconnection(n.reconnection !== !1), this.reconnectionAttempts(n.reconnectionAttempts || 1 / 0), this.reconnectionDelay(n.reconnectionDelay || 1e3), this.reconnectionDelayMax(n.reconnectionDelayMax || 5e3), this.randomizationFactor((s = n.randomizationFactor) !== null && s !== void 0 ? s : 0.5), this.backoff = new _s({
      min: this.reconnectionDelay(),
      max: this.reconnectionDelayMax(),
      jitter: this.randomizationFactor()
    }), this.timeout(n.timeout == null ? 2e4 : n.timeout), this._readyState = "closed", this.uri = t;
    const r = n.parser || Zg;
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
    this.engine = new Ug(this.uri, this.opts);
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
    ui(() => {
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
    return s ? this._autoConnect && !s.active && s.connect() : (s = new au(this, t, n), this.nsps[t] = s), s;
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
const Ds = {};
function Pr(e, t) {
  typeof e == "object" && (t = e, e = void 0), t = t || {};
  const n = zg(e, t.path || "/socket.io"), s = n.source, r = n.id, i = n.path, o = Ds[r] && i in Ds[r].nsps, a = t.forceNew || t["force new connection"] || t.multiplex === !1 || o;
  let l;
  return a ? l = new mo(s, t) : (Ds[r] || (Ds[r] = new mo(s, t)), l = Ds[r]), n.query && !t.query && (t.query = n.queryKey), l.socket(n.path, t);
}
Object.assign(Pr, {
  Manager: mo,
  Socket: au,
  io: Pr,
  connect: Pr
});
const Qg = 5e3;
function em() {
  const e = re([]), t = re(!1), n = re(""), s = re(!1), r = re(!1), i = re(!1), o = re("connecting"), a = re(0), l = 5, d = re({}), c = re(null), w = re("");
  let k = null;
  const B = 6e4, I = () => {
    t.value = !1, k && (clearTimeout(k), k = null);
  }, j = () => {
    t.value = !0, k && clearTimeout(k), k = setTimeout(I, B);
  };
  let F = null;
  const ie = 1e3, ce = 15e3;
  let oe = null;
  const T = /* @__PURE__ */ new Set(["ai_config_missing"]);
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
  let ve = null, Me = null, Be = null, xe = null, pe = null, Ye, Xe;
  const rt = (b) => {
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
  }, ae = (b) => (F = Pr(`${ms.WS_URL}/widget`, {
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
      R.attachments && Array.isArray(R.attachments) && (M.id = R.message_id, M.attachments = R.attachments.map((H, G) => ({
        id: R.message_id * 1e3 + G,
        filename: H.filename,
        file_url: H.file_url,
        content_type: H.content_type,
        file_size: H.file_size
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
    }), d.value = {
      ...d.value,
      human_agent_name: R.user_name,
      human_agent_profile_pic: R.profile_picture
    }, I(), ve && ve(R);
  }), F.on("session_initialized", (R) => {
    R.session_id && (w.value = R.session_id, pe = {
      session_id: R.session_id,
      authenticated: !!R.authenticated,
      created: !!R.created
    }, xe == null || xe(pe));
  }), F.on("error", Oe), F.on("chat_history", it), F.on("rating_submitted", ht), F.on("display_form", dt), F.on("form_submitted", _t), F.on("workflow_state", pt), F.on("workflow_proceeded", kt), F), st = async () => {
    try {
      return o.value = "connecting", a.value = 0, I(), K(), L = !1, F && (F.removeAllListeners(), F.disconnect(), F = null), F = ae(""), new Promise((b) => {
        F == null || F.on("connect", () => {
          b(!0);
        }), F == null || F.on("connect_error", () => {
          a.value >= l && b(!1);
        });
      });
    } catch (b) {
      return console.error("Socket initialization failed:", b), o.value = "failed", !1;
    }
  }, Te = () => (F && F.disconnect(), st()), be = (b) => {
    ve = b;
  }, Se = (b) => {
    xe = b, pe && b(pe);
  }, Le = (b) => {
    Me = b;
  }, Ot = (b) => {
    Be = b;
  }, Oe = (b) => {
    I(), n.value = dd(b), s.value = !0, T.has(b == null ? void 0 : b.type) && (L = !0, K()), setTimeout(() => {
      s.value = !1, n.value = "";
    }, 5e3);
  }, it = (b) => {
    if (b.type === "chat_history" && Array.isArray(b.messages)) {
      const R = b.messages.map((M) => {
        var G, ne;
        const H = {
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
        return Array.isArray((G = M.attributes) == null ? void 0 : G.sources) && M.attributes.sources.length && (H.sources = M.attributes.sources), (ne = M.attributes) != null && ne.shopify_output && typeof M.attributes.shopify_output == "object" ? {
          ...H,
          message_type: "product",
          shopify_output: M.attributes.shopify_output
        } : H;
      });
      e.value = [
        ...R.filter(
          (M) => !e.value.some(
            (H) => H.message === M.message && H.created_at === M.created_at
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
    console.log("Form display handler in composable:", b), I(), c.value = b.form_data, console.log("Set currentForm in handleDisplayForm:", c.value), ((R = b.form_data) == null ? void 0 : R.form_full_screen) === !0 ? (console.log("Full screen form detected, triggering workflow state callback"), Me && Me({
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
  }, _t = (b) => {
    console.log("Form submitted confirmation received, clearing currentForm"), c.value = null, b.success && console.log("Form submitted successfully");
  }, pt = (b) => {
    console.log("Workflow state received in composable:", b), (b.type === "form" || b.type === "display_form") && (console.log("Setting currentForm from workflow state:", b.form_data), c.value = b.form_data), Me && Me(b);
  }, kt = (b) => {
    console.log("Workflow proceeded in composable:", b), Be && Be(b);
  }, g = async (b, R) => {
    !F || !b || F.emit("submit_rating", {
      rating: b,
      feedback: R
    });
  }, _ = async (b) => {
    var H;
    if (console.log("Submitting form in socket:", b), console.log("Current form in socket:", c.value), console.log("Socket in socket:", F), !F) {
      console.error("No socket available for form submission");
      return;
    }
    if (!b || Object.keys(b).length === 0) {
      console.error("No form data to submit");
      return;
    }
    const M = ((H = c.value) == null ? void 0 : H.form_type) === "contact" ? "submit_contact_info" : "submit_form";
    console.log(`Emitting ${M} event with data:`, b), F.emit(M, {
      form_data: b
    }), c.value = null;
  }, E = async () => {
    F && (console.log("Getting workflow state 12"), F.emit("get_workflow_state"));
  }, $ = async () => {
    F && F.emit("proceed_workflow", {});
  }, N = async (b, R, M = []) => {
    if (!F || !b.trim() && M.length === 0) return;
    const H = {
      message: b,
      message_type: "user",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: ""
    };
    M.length > 0 && (H.attachments = M.map((G, ne) => {
      let _e = "";
      if (G.content_type.startsWith("image/")) {
        const ue = atob(G.content), Qe = new Array(ue.length);
        for (let f = 0; f < ue.length; f++)
          Qe[f] = ue.charCodeAt(f);
        const Ce = new Uint8Array(Qe), Ke = new Blob([Ce], { type: G.content_type });
        _e = URL.createObjectURL(Ke);
      }
      return {
        id: Date.now() * 1e3 + ne,
        // Temporary ID
        filename: G.filename,
        file_url: _e,
        // Temporary blob URL, will be replaced
        content_type: G.content_type,
        file_size: G.size,
        _isTemporary: !0
        // Flag to identify temporary attachments
      };
    })), e.value.push(H), F.emit("chat", {
      message: b,
      email: R,
      files: M
      // Send files with base64 content
    }), i.value = !0;
  }, D = () => {
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
      const H = (ue) => {
        M || (M = !0, clearTimeout(_e), F == null || F.off("chat_ended", G), F == null || F.off("error", ne), ue && D(), R(ue));
      }, G = () => H(!0), ne = (ue) => {
        (ue == null ? void 0 : ue.type) === "end_chat_error" && H(!1);
      }, _e = setTimeout(() => H(!1), Qg);
      F.on("chat_ended", G), F.on("error", ne), F.emit("end_chat", { reason: b });
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
    connect: st,
    reconnect: Te,
    cleanup: () => {
      I(), K(), F && (F.removeAllListeners(), F.disconnect(), F = null), ve = null, Me = null, Be = null;
    },
    humanAgent: d,
    onTakeover: be,
    onSessionState: Se,
    submitRating: g,
    currentForm: c,
    submitForm: _,
    getWorkflowState: E,
    proceedWorkflow: $,
    onWorkflowState: Le,
    onWorkflowProceeded: Ot,
    currentSessionId: w,
    setToken: rt,
    setWidgetId: fe
  };
}
function tm(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Hi = { exports: {} }, wl;
function nm() {
  return wl || (wl = 1, function(e) {
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
      function d(f) {
        f.parentNode && f.parentNode.removeChild(f);
      }
      function c(f, m, O) {
        m = m || [], O = O || [];
        for (var S = f.className.split(/\s+/), U = 0; U < m.length; U += 1) {
          for (var Z = !1, Q = 0; Q < S.length; Q += 1) if (m[U] === S[Q]) {
            Z = !0;
            break;
          }
          Z || S.push(m[U]);
        }
        for (m = [], U = 0; U < S.length; U += 1) {
          for (Z = !1, Q = 0; Q < O.length; Q += 1) if (S[U] === O[Q]) {
            Z = !0;
            break;
          }
          Z || m.push(S[U]);
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
      function B(f, m, O) {
        function S() {
          we && U && Z && (we(Q), we = null);
        }
        m = a(f, "link", { rel: "stylesheet", href: m, media: "all" });
        var U = !1, Z = !0, Q = null, we = O || null;
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
          var Z = a(f, "script", { src: m }), Q = !1;
          return Z.onload = Z.onreadystatechange = function() {
            Q || this.readyState && this.readyState != "loaded" && this.readyState != "complete" || (Q = !0, O && O(null), Z.onload = Z.onreadystatechange = null, Z.parentNode.tagName == "HEAD" && U.removeChild(Z));
          }, U.appendChild(Z), setTimeout(function() {
            Q || (Q = !0, O && O(Error("Script load timeout")));
          }, S || 5e3), Z;
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
      function T(f, m) {
        this.c = f, this.f = 4, this.a = "n";
        var O = (m || "n4").match(/^([nio])([1-9])$/i);
        O && (this.a = O[1], this.f = parseInt(O[2], 10));
      }
      function L(f) {
        return ve(f) + " " + (f.f + "00") + " 300px " + K(f.c);
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
      function ve(f) {
        var m = "normal";
        return f.a === "o" ? m = "oblique" : f.a === "i" && (m = "italic"), m;
      }
      function Me(f) {
        var m = 4, O = "n", S = null;
        return f && ((S = f.match(/(normal|oblique|italic)/i)) && S[1] && (O = S[1].substr(0, 1).toLowerCase()), (S = f.match(/([1-9]00|normal|bold)/i)) && S[1] && (/bold/i.test(S[1]) ? m = 7 : /[1-9]00/.test(S[1]) && (m = parseInt(S[1].substr(0, 1), 10)))), O + m;
      }
      function Be(f, m) {
        this.c = f, this.f = f.o.document.documentElement, this.h = m, this.a = new oe("-"), this.j = m.events !== !1, this.g = m.classes !== !1;
      }
      function xe(f) {
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
      function rt(f, m, O) {
        var S = [], U;
        for (U in m) if (m.hasOwnProperty(U)) {
          var Z = f.c[U];
          Z && S.push(Z(m[U], O));
        }
        return S;
      }
      function fe(f, m) {
        this.c = f, this.f = m, this.a = a(this.c, "span", { "aria-hidden": "true" }, this.f);
      }
      function ge(f) {
        l(f.c, "body", f.a);
      }
      function ae(f) {
        return "display:block;position:absolute;top:-9999px;left:-9999px;font-size:300px;width:auto;height:auto;line-height:normal;margin:0;padding:0;font-variant:normal;white-space:nowrap;font-family:" + K(f.c) + ";" + ("font-style:" + ve(f) + ";font-weight:" + (f.f + "00") + ";");
      }
      function st(f, m, O, S, U, Z) {
        this.g = f, this.j = m, this.a = S, this.c = O, this.f = U || 3e3, this.h = Z || void 0;
      }
      st.prototype.start = function() {
        var f = this.c.o.document, m = this, O = r(), S = new Promise(function(Q, we) {
          function Ne() {
            r() - O >= m.f ? we() : f.fonts.load(L(m.a), m.h).then(function(Ge) {
              1 <= Ge.length ? Q() : setTimeout(Ne, 25);
            }, function() {
              we();
            });
          }
          Ne();
        }), U = null, Z = new Promise(function(Q, we) {
          U = setTimeout(we, m.f);
        });
        Promise.race([Z, S]).then(function() {
          U && (clearTimeout(U), U = null), m.g(m.a);
        }, function() {
          m.j(m.a);
        });
      };
      function Te(f, m, O, S, U, Z, Q) {
        this.v = f, this.B = m, this.c = O, this.a = S, this.s = Q || "BESbswy", this.f = {}, this.w = U || 3e3, this.u = Z || null, this.m = this.j = this.h = this.g = null, this.g = new fe(this.c, this.s), this.h = new fe(this.c, this.s), this.j = new fe(this.c, this.s), this.m = new fe(this.c, this.s), f = new T(this.a.c + ",serif", Y(this.a)), f = ae(f), this.g.a.style.cssText = f, f = new T(this.a.c + ",sans-serif", Y(this.a)), f = ae(f), this.h.a.style.cssText = f, f = new T("serif", Y(this.a)), f = ae(f), this.j.a.style.cssText = f, f = new T("sans-serif", Y(this.a)), f = ae(f), this.m.a.style.cssText = f, ge(this.g), ge(this.h), ge(this.j), ge(this.m);
      }
      var be = { D: "serif", C: "sans-serif" }, Se = null;
      function Le() {
        if (Se === null) {
          var f = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent);
          Se = !!f && (536 > parseInt(f[1], 10) || parseInt(f[1], 10) === 536 && 11 >= parseInt(f[2], 10));
        }
        return Se;
      }
      Te.prototype.start = function() {
        this.f.serif = this.j.a.offsetWidth, this.f["sans-serif"] = this.m.a.offsetWidth, this.A = r(), Oe(this);
      };
      function Ot(f, m, O) {
        for (var S in be) if (be.hasOwnProperty(S) && m === f.f[be[S]] && O === f.f[be[S]]) return !0;
        return !1;
      }
      function Oe(f) {
        var m = f.g.a.offsetWidth, O = f.h.a.offsetWidth, S;
        (S = m === f.f.serif && O === f.f["sans-serif"]) || (S = Le() && Ot(f, m, O)), S ? r() - f.A >= f.w ? Le() && Ot(f, m, O) && (f.u === null || f.u.hasOwnProperty(f.a.c)) ? ht(f, f.v) : ht(f, f.B) : it(f) : ht(f, f.v);
      }
      function it(f) {
        setTimeout(s(function() {
          Oe(this);
        }, f), 50);
      }
      function ht(f, m) {
        setTimeout(s(function() {
          d(this.g.a), d(this.h.a), d(this.j.a), d(this.m.a), m(this.a);
        }, f), 0);
      }
      function dt(f, m, O) {
        this.c = f, this.a = m, this.f = 0, this.m = this.j = !1, this.s = O;
      }
      var _t = null;
      dt.prototype.g = function(f) {
        var m = this.a;
        m.g && c(m.f, [m.a.c("wf", f.c, Y(f).toString(), "active")], [m.a.c("wf", f.c, Y(f).toString(), "loading"), m.a.c("wf", f.c, Y(f).toString(), "inactive")]), Ye(m, "fontactive", f), this.m = !0, pt(this);
      }, dt.prototype.h = function(f) {
        var m = this.a;
        if (m.g) {
          var O = w(m.f, m.a.c("wf", f.c, Y(f).toString(), "active")), S = [], U = [m.a.c("wf", f.c, Y(f).toString(), "loading")];
          O || S.push(m.a.c("wf", f.c, Y(f).toString(), "inactive")), c(m.f, S, U);
        }
        Ye(m, "fontinactive", f), pt(this);
      };
      function pt(f) {
        --f.f == 0 && f.j && (f.m ? (f = f.a, f.g && c(f.f, [f.a.c("wf", "active")], [f.a.c("wf", "loading"), f.a.c("wf", "inactive")]), Ye(f, "active")) : pe(f.a));
      }
      function kt(f) {
        this.j = f, this.a = new Xe(), this.h = 0, this.f = this.g = !0;
      }
      kt.prototype.load = function(f) {
        this.c = new i(this.j, f.context || this.j), this.g = f.events !== !1, this.f = f.classes !== !1, _(this, new Be(this.c, f), f);
      };
      function g(f, m, O, S, U) {
        var Z = --f.h == 0;
        (f.f || f.g) && setTimeout(function() {
          var Q = U || null, we = S || null || {};
          if (O.length === 0 && Z) pe(m.a);
          else {
            m.f += O.length, Z && (m.j = Z);
            var Ne, Ge = [];
            for (Ne = 0; Ne < O.length; Ne++) {
              var $e = O[Ne], lt = we[$e.c], yt = m.a, Ze = $e;
              if (yt.g && c(yt.f, [yt.a.c("wf", Ze.c, Y(Ze).toString(), "loading")]), Ye(yt, "fontloading", Ze), yt = null, _t === null) if (window.FontFace) {
                var Ze = /Gecko.*Firefox\/(\d+)/.exec(window.navigator.userAgent), qt = /OS X.*Version\/10\..*Safari/.exec(window.navigator.userAgent) && /Apple/.exec(window.navigator.vendor);
                _t = Ze ? 42 < parseInt(Ze[1], 10) : !qt;
              } else _t = !1;
              _t ? yt = new st(s(m.g, m), s(m.h, m), m.c, $e, m.s, lt) : yt = new Te(s(m.g, m), s(m.h, m), m.c, $e, m.s, Q, lt), Ge.push(yt);
            }
            for (Ne = 0; Ne < Ge.length; Ne++) Ge[Ne].start();
          }
        }, 0);
      }
      function _(f, m, O) {
        var U = [], S = O.timeout;
        xe(m);
        var U = rt(f.a, O, f.c), Z = new dt(f.c, m, S);
        for (f.h = U.length, m = 0, O = U.length; m < O; m++) U[m].load(function(Q, we, Ne) {
          g(f, Z, Q, we, Ne);
        });
      }
      function E(f, m) {
        this.c = f, this.a = m;
      }
      E.prototype.load = function(f) {
        function m() {
          if (Z["__mti_fntLst" + S]) {
            var Q = Z["__mti_fntLst" + S](), we = [], Ne;
            if (Q) for (var Ge = 0; Ge < Q.length; Ge++) {
              var $e = Q[Ge].fontfamily;
              Q[Ge].fontStyle != null && Q[Ge].fontWeight != null ? (Ne = Q[Ge].fontStyle + Q[Ge].fontWeight, we.push(new T($e, Ne))) : we.push(new T($e));
            }
            f(we);
          } else setTimeout(function() {
            m();
          }, 50);
        }
        var O = this, S = O.a.projectId, U = O.a.version;
        if (S) {
          var Z = O.c.o;
          I(this.c, (O.a.api || "https://fast.fonts.net/jsapi") + "/" + S + ".js" + (U ? "?v=" + U : ""), function(Q) {
            Q ? f([]) : (Z["__MonotypeConfiguration__" + S] = function() {
              return O.a;
            }, m());
          }).id = "__MonotypeAPIScript__" + S;
        } else f([]);
      };
      function $(f, m) {
        this.c = f, this.a = m;
      }
      $.prototype.load = function(f) {
        var m, O, S = this.a.urls || [], U = this.a.families || [], Z = this.a.testStrings || {}, Q = new j();
        for (m = 0, O = S.length; m < O; m++) B(this.c, S[m], F(Q));
        var we = [];
        for (m = 0, O = U.length; m < O; m++) if (S = U[m].split(":"), S[1]) for (var Ne = S[1].split(","), Ge = 0; Ge < Ne.length; Ge += 1) we.push(new T(S[0], Ne[Ge]));
        else we.push(new T(S[0]));
        ie(Q, function() {
          f(we, Z);
        });
      };
      function N(f, m) {
        f ? this.c = f : this.c = D, this.a = [], this.f = [], this.g = m || "";
      }
      var D = "https://fonts.googleapis.com/css";
      function V(f, m) {
        for (var O = m.length, S = 0; S < O; S++) {
          var U = m[S].split(":");
          U.length == 3 && f.f.push(U.pop());
          var Z = "";
          U.length == 2 && U[1] != "" && (Z = ":"), f.a.push(U.join(Z));
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
      var b = { latin: "BESbswy", "latin-ext": "çöüğş", cyrillic: "йяЖ", greek: "αβΣ", khmer: "កខគ", Hanuman: "កខគ" }, R = { thin: "1", extralight: "2", "extra-light": "2", ultralight: "2", "ultra-light": "2", light: "3", regular: "4", book: "4", medium: "5", "semi-bold": "6", semibold: "6", "demi-bold": "6", demibold: "6", bold: "7", "extra-bold": "8", extrabold: "8", "ultra-bold": "8", ultrabold: "8", black: "9", heavy: "9", l: "3", r: "4", b: "7" }, M = { i: "i", italic: "i", n: "n", normal: "n" }, H = /^(thin|(?:(?:extra|ultra)-?)?light|regular|book|medium|(?:(?:semi|demi|extra|ultra)-?)?bold|black|heavy|l|r|b|[1-9]00)?(n|i|normal|italic)?$/;
      function G(f) {
        for (var m = f.f.length, O = 0; O < m; O++) {
          var S = f.f[O].split(":"), U = S[0].replace(/\+/g, " "), Z = ["n4"];
          if (2 <= S.length) {
            var Q, we = S[1];
            if (Q = [], we) for (var we = we.split(","), Ne = we.length, Ge = 0; Ge < Ne; Ge++) {
              var $e;
              if ($e = we[Ge], $e.match(/^[\w-]+$/)) {
                var lt = H.exec($e.toLowerCase());
                if (lt == null) $e = "";
                else {
                  if ($e = lt[2], $e = $e == null || $e == "" ? "n" : M[$e], lt = lt[1], lt == null || lt == "") lt = "4";
                  else var yt = R[lt], lt = yt || (isNaN(lt) ? "4" : lt.substr(0, 1));
                  $e = [$e, lt].join("");
                }
              } else $e = "";
              $e && Q.push($e);
            }
            0 < Q.length && (Z = Q), S.length == 3 && (S = S[2], Q = [], S = S ? S.split(",") : Q, 0 < S.length && (S = b[S[0]]) && (f.c[U] = S));
          }
          for (f.c[U] || (S = b[U]) && (f.c[U] = S), S = 0; S < Z.length; S += 1) f.a.push(new T(U, Z[S]));
        }
      }
      function ne(f, m) {
        this.c = f, this.a = m;
      }
      var _e = { Arimo: !0, Cousine: !0, Tinos: !0 };
      ne.prototype.load = function(f) {
        var m = new j(), O = this.c, S = new N(this.a.api, this.a.text), U = this.a.families;
        V(S, U);
        var Z = new q(U);
        G(Z), B(O, W(S), F(m)), ie(m, function() {
          f(Z.a, Z.c, _e);
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
            for (var U = [], Z = 0; Z < S.length; Z += 2) for (var Q = S[Z], we = S[Z + 1], Ne = 0; Ne < we.length; Ne++) U.push(new T(Q, we[Ne]));
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
        m ? (O.__webfontfontdeckmodule__ || (O.__webfontfontdeckmodule__ = {}), O.__webfontfontdeckmodule__[m] = function(U, Z) {
          for (var Q = 0, we = Z.fonts.length; Q < we; ++Q) {
            var Ne = Z.fonts[Q];
            S.a.push(new T(Ne.name, Me("font-weight:" + Ne.weight + ";font-style:" + Ne.style)));
          }
          f(S.a);
        }, I(this.c, (this.f.api || "https://f.fontdeck.com/s/css/js/") + k(this.c) + "/" + m + ".js", function(U) {
          U && f([]);
        })) : f([]);
      };
      var Ce = new kt(window);
      Ce.a.c.custom = function(f, m) {
        return new $(m, f);
      }, Ce.a.c.fontdeck = function(f, m) {
        return new Qe(m, f);
      }, Ce.a.c.monotype = function(f, m) {
        return new E(m, f);
      }, Ce.a.c.typekit = function(f, m) {
        return new ue(m, f);
      }, Ce.a.c.google = function(f, m) {
        return new ne(m, f);
      };
      var Ke = { load: s(Ce.load, Ce) };
      e.exports ? e.exports = Ke : (window.WebFont = Ke, window.WebFontConfig && Ce.load(window.WebFontConfig));
    })();
  }(Hi)), Hi.exports;
}
var sm = nm();
const rm = /* @__PURE__ */ tm(sm), kl = [
  "Space Grotesk:400,500,600,700",
  "Instrument Sans:400,500,600",
  "JetBrains Mono:400,500,600"
], im = (e) => {
  const t = [...kl], n = (e == null ? void 0 : e.split(",")[0].trim().replace(/['"]/g, "")) || "", s = kl.some(
    (r) => r.toLowerCase().startsWith(n.toLowerCase())
  );
  n && !s && t.push(n), rm.load({
    google: { families: t },
    active: () => {
      if (!e) return;
      const r = document.querySelector(".chat-container");
      r && (r.style.fontFamily = e.includes(",") ? e : `"${e}", system-ui, sans-serif`);
    }
  });
};
function om() {
  const e = re({}), t = re(""), n = (r) => {
    var i;
    e.value = r, r.photo_url && (e.value.photo_url = r.photo_url), im(r.font_family), Nn({
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
const am = 13, lm = 24;
function cm(e, t) {
  const n = ti({}), s = [];
  let r = null;
  const i = typeof window < "u" && typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, o = (c) => {
    r || s.length === 0 || (r = setTimeout(a, c));
  }, a = () => {
    r = null;
    const c = s[0];
    if (c === void 0) return;
    const w = e.value[c], k = n[c], B = (w == null ? void 0 : w.message) ?? "";
    if (!k || !w) {
      s.shift(), o(0);
      return;
    }
    if (k.shown >= B.length) {
      k.done = !0, s.shift(), o(0);
      return;
    }
    k.shown += 1;
    const I = B[k.shown - 1];
    t == null || t(), o(I === " " ? lm : am);
  };
  Pt(() => e.value.length, (c, w) => {
    w !== void 0 && c < w && (Object.keys(n).forEach((k) => {
      delete n[Number(k)];
    }), s.length = 0);
    for (let k = w ?? 0; k < c; k++) {
      const B = e.value[k];
      if (!B || !B.stream || k in n) continue;
      const I = B.message ?? "";
      i || !I ? n[k] = { shown: I.length, done: !0 } : (n[k] = { shown: 0, done: !1 }, s.push(k));
    }
    o(0);
  });
  const l = (c, w) => {
    const k = n[c];
    return k ? w.slice(0, k.shown) : w;
  }, d = (c) => {
    const w = n[c];
    return !!w && !w.done;
  };
  return tr(() => {
    r && clearTimeout(r);
  }), { displayText: l, isStreaming: d };
}
function um(e) {
  const t = re(!0);
  let n = 0;
  const s = () => {
    Nn({ type: "UNREAD_COUNT", count: n });
  }, r = (i) => {
    var o;
    ((o = i == null ? void 0 : i.data) == null ? void 0 : o.type) === "WIDGET_VISIBILITY" && (t.value = !!i.data.open, t.value && n !== 0 && (n = 0, s()));
  };
  Pt(() => e.value.length, (i, o) => {
    if (i <= (o ?? 0) || t.value) return;
    const a = e.value[i - 1];
    a && (a.message_type === "bot" || a.message_type === "agent") && (n += 1, s());
  }), ri(() => window.addEventListener("message", r)), tr(() => window.removeEventListener("message", r));
}
const Xo = "ctid", fm = "identity_expired", xl = 0.8, hm = 720 * 60 * 1e3, Wi = 30 * 1e3, qi = 1e3, ps = (e) => {
  if (typeof e != "string") return e ? String(e) : null;
  const t = e.trim();
  return !t || t === "undefined" || t === "null" ? null : t;
}, ji = (e) => {
  const t = ps(e);
  if (!t) return null;
  const [, n] = t.split(".");
  if (!n) return null;
  try {
    const s = atob(n.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(s);
  } catch {
    return null;
  }
}, dm = () => {
  try {
    return ps(localStorage.getItem(Xo));
  } catch {
    return null;
  }
}, Tl = (e) => {
  try {
    localStorage.setItem(Xo, e);
  } catch {
  }
}, pm = () => {
  try {
    localStorage.removeItem(Xo);
  } catch {
  }
};
function gm(e = {}) {
  const t = re(null);
  let n = null, s = null;
  const r = () => {
    n && (clearTimeout(n), n = null);
  }, i = () => {
    const I = ji(t.value);
    return I != null && I.exp ? Number(I.exp) - Math.floor(Date.now() / qi) : null;
  }, o = () => {
    const I = ji(t.value);
    if (!(I != null && I.exp)) return !1;
    const j = I.iat ? Number(I.exp) - Number(I.iat) : 0, F = i() ?? 0;
    return j <= 0 ? F <= 0 : F <= j * (1 - xl);
  }, a = (I, { persist: j = !0 } = {}) => {
    var ie;
    const F = ps(I);
    if (r(), t.value = F, !F) {
      pm();
      return;
    }
    j && (Tl(F), (ie = e.onTokenChanged) == null || ie.call(e, F)), c();
  }, l = async (I) => {
    if (!t.value || !I) return !1;
    if (s) return s;
    const j = t.value;
    return s = (async () => {
      var F, ie;
      try {
        const ce = await fetch(`${ms.API_URL}/refresh-token`, {
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
          return c(Wi), !1;
        const oe = await ce.json(), T = ps((ie = oe == null ? void 0 : oe.data) == null ? void 0 : ie.token);
        return T ? (a(T), !0) : !1;
      } catch {
        return c(Wi), !1;
      } finally {
        s = null;
      }
    })(), s;
  }, d = async (I) => t.value ? o() ? l(I) : !0 : !1, c = (I) => {
    r();
    const j = ji(t.value);
    if (!(j != null && j.exp) || !(j != null && j.iat)) return;
    const F = (Number(j.exp) - Number(j.iat)) * qi, ie = (i() ?? 0) * qi, ce = I ?? Math.min(
      hm,
      Math.max(0, ie - F * (1 - xl))
    );
    n = setTimeout(() => {
      n = null, d(w).then((oe) => {
        c(oe ? void 0 : Wi);
      });
    }, ce);
  };
  let w = "";
  return {
    token: t,
    start: (I, j) => {
      w = I;
      const F = ps(j) || dm();
      a(F, { persist: !1 }), F && Tl(F);
    },
    stop: () => {
      r(), s = null;
    },
    setToken: a,
    ensureFresh: d
  };
}
const mm = {
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
}, _m = {
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
}, ym = {
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
}, vm = {
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
}, bm = {
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
}, Fr = {
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
}, wm = {
  GLASS: mm,
  AURORA: _m,
  TERMINAL: ym,
  CALM_MINT: vm,
  PLAYFUL: bm,
  SUNRISE: Fr,
  CHATBOT: Fr,
  ASK_ANYTHING: Fr
}, km = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", Al = "'Instrument Sans', system-ui, -apple-system, 'Segoe UI', sans-serif";
function xm(e) {
  return Math.max(4, Math.round(e * 0.3));
}
function El(e) {
  const t = (e || "").replace("#", "");
  if (t.length < 6) return "#0B0C10";
  const n = parseInt(t.slice(0, 2), 16), s = parseInt(t.slice(2, 4), 16), r = parseInt(t.slice(4, 6), 16);
  return (0.299 * n + 0.587 * s + 0.114 * r) / 255 > 0.62 ? "#0B0C10" : "#FFFFFF";
}
function Tm(e) {
  return wm[e || ""] || Fr;
}
const Am = "#212529";
function Em(e, t) {
  const n = Tm(e), s = (t == null ? void 0 : t.chat_background_color) || "", r = /^#[0-9a-fA-F]{6}$/.test(s), i = s || n.card, o = (t == null ? void 0 : t.chat_text_color) || "", l = /^#[0-9a-fA-F]{6}$/.test(o) && o.toLowerCase() !== Am ? o : r ? ds(s) ? "#FFFFFF" : "#111111" : n.text, d = r ? ds(s) ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)" : n.muted, c = r ? hd(s, 20) : n.agentBg, w = (t == null ? void 0 : t.accent_color) || n.accent, k = r ? !ds(s) : n.light, B = El(w) === "#0B0C10", I = k === B ? d : w, j = n.mono ? km : t != null && t.font_family ? `${t.font_family}, ${Al}` : Al;
  return {
    "--cm-card": i,
    "--cm-text": l,
    "--cm-muted": d,
    "--cm-agent-bg": c,
    "--cm-accent": w,
    "--cm-on-accent": El(w),
    "--cm-presence": I,
    "--cm-border": n.border,
    "--cm-glow": n.glow,
    "--cm-radius": `${n.radius}px`,
    "--cm-bubble": `${n.bubble}px`,
    "--cm-bubble-tail": `${xm(n.bubble)}px`,
    "--cm-field-radius": n.mono ? "7px" : "12px",
    "--cm-avatar-radius": n.mono ? "28%" : "50%",
    "--cm-hairline": n.light ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.08)",
    "--cm-body-font": j
  };
}
function Sm() {
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
const Cm = {
  key: 0,
  class: "widget-unavailable-overlay"
}, Rm = {
  key: 1,
  class: "auth-error-overlay"
}, Im = { class: "auth-error-card" }, Lm = { class: "auth-error-message" }, Om = {
  key: 0,
  class: "initializing-overlay"
}, Nm = {
  key: 0,
  class: "connecting-message"
}, Mm = {
  key: 1,
  class: "failed-message"
}, Pm = { class: "welcome-content" }, Fm = { class: "welcome-header" }, Dm = ["src", "alt"], Bm = { class: "welcome-title" }, $m = { class: "welcome-subtitle" }, Um = { class: "welcome-input-container" }, zm = {
  key: 0,
  class: "email-input"
}, Hm = ["disabled"], Wm = { class: "welcome-message-input" }, qm = ["placeholder", "disabled"], jm = ["disabled"], Vm = {
  key: 0,
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, Km = {
  key: 1,
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, Gm = { class: "landing-page-content" }, Ym = { class: "landing-page-header" }, Xm = { class: "landing-page-heading" }, Zm = { class: "landing-page-text" }, Jm = { class: "landing-page-actions" }, Qm = { class: "form-fullscreen-content" }, e_ = {
  key: 0,
  class: "form-header"
}, t_ = {
  key: 0,
  class: "form-title"
}, n_ = {
  key: 1,
  class: "form-description"
}, s_ = { class: "form-fields" }, r_ = ["for"], i_ = {
  key: 0,
  class: "required-indicator"
}, o_ = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "autocomplete", "inputmode"], a_ = ["id", "placeholder", "required", "min", "max", "value", "onInput"], l_ = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput"], c_ = ["id", "required", "value", "onChange"], u_ = { value: "" }, f_ = ["value"], h_ = {
  key: 4,
  class: "checkbox-field"
}, d_ = ["id", "required", "checked", "onChange"], p_ = { class: "checkbox-label" }, g_ = {
  key: 5,
  class: "radio-group"
}, m_ = ["name", "value", "required", "checked", "onChange"], __ = { class: "radio-label" }, y_ = {
  key: 6,
  class: "field-error"
}, v_ = { class: "form-actions" }, b_ = ["disabled"], w_ = {
  key: 0,
  class: "loading-spinner-inline"
}, k_ = { key: 1 }, x_ = { class: "header-content" }, T_ = ["src", "alt"], A_ = { class: "header-info" }, E_ = { class: "status" }, S_ = { class: "status-text cm-presence" }, C_ = { class: "header-actions" }, R_ = ["disabled", "title", "aria-label", "aria-expanded"], I_ = { class: "ask-anything-header" }, L_ = ["src", "alt"], O_ = { class: "header-info" }, N_ = {
  key: 2,
  class: "loading-history"
}, M_ = { class: "cm-email-gate-title" }, P_ = ["disabled"], F_ = {
  key: 0,
  class: "cm-email-gate-error"
}, D_ = ["disabled"], B_ = {
  key: 0,
  class: "cm-welcome-block"
}, $_ = { class: "message agent-message cm-welcome-row" }, U_ = ["src", "alt"], z_ = {
  key: 0,
  class: "cm-msg-avatar",
  "aria-hidden": "true"
}, H_ = ["src"], W_ = ["src"], q_ = { class: "message-col" }, j_ = {
  key: 0,
  class: "rating-content"
}, V_ = { class: "rating-prompt" }, K_ = ["onMouseover", "onMouseleave", "onClick", "disabled"], G_ = {
  key: 0,
  class: "feedback-wrapper"
}, Y_ = { class: "feedback-section" }, X_ = ["onUpdate:modelValue", "disabled"], Z_ = { class: "feedback-counter" }, J_ = ["onClick", "disabled"], Q_ = {
  key: 1,
  class: "submitted-feedback-wrapper"
}, ey = { class: "submitted-feedback" }, ty = { class: "submitted-feedback-text" }, ny = {
  key: 2,
  class: "submitted-message"
}, sy = {
  key: 1,
  class: "form-content"
}, ry = {
  key: 0,
  class: "form-header"
}, iy = {
  key: 0,
  class: "form-title"
}, oy = {
  key: 1,
  class: "form-description"
}, ay = { class: "form-fields" }, ly = ["for"], cy = {
  key: 0,
  class: "required-indicator"
}, uy = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "disabled", "autocomplete", "inputmode"], fy = ["id", "placeholder", "required", "min", "max", "value", "onInput", "disabled"], hy = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "disabled"], dy = ["id", "required", "value", "onChange", "disabled"], py = { value: "" }, gy = ["value"], my = {
  key: 4,
  class: "checkbox-field"
}, _y = ["id", "checked", "onChange", "disabled"], yy = ["for"], vy = {
  key: 5,
  class: "radio-field"
}, by = ["id", "name", "value", "checked", "onChange", "disabled"], wy = ["for"], ky = {
  key: 6,
  class: "field-error"
}, xy = { class: "form-actions" }, Ty = ["onClick", "disabled"], Ay = {
  key: 2,
  class: "user-input-content"
}, Ey = {
  key: 0,
  class: "user-input-prompt"
}, Sy = {
  key: 1,
  class: "user-input-form"
}, Cy = ["onUpdate:modelValue", "onKeydown"], Ry = ["onClick", "disabled"], Iy = {
  key: 2,
  class: "user-input-submitted"
}, Ly = {
  key: 0,
  class: "user-input-confirmation"
}, Oy = {
  key: 3,
  class: "product-message-container"
}, Ny = ["innerHTML"], My = {
  key: 1,
  class: "products-carousel"
}, Py = { class: "carousel-items" }, Fy = {
  key: 0,
  class: "product-image-compact"
}, Dy = ["src", "alt"], By = { class: "product-info-compact" }, $y = { class: "product-text-area" }, Uy = { class: "product-title-compact" }, zy = {
  key: 0,
  class: "product-variant-compact"
}, Hy = { class: "product-price-compact" }, Wy = { class: "product-actions-compact" }, qy = ["onClick"], jy = {
  key: 2,
  class: "no-products-message"
}, Vy = {
  key: 3,
  class: "no-products-message"
}, Ky = ["innerHTML"], Gy = ["innerHTML"], Yy = {
  key: 2,
  class: "message-attachments"
}, Xy = {
  key: 0,
  class: "attachment-image-container"
}, Zy = ["src", "alt", "onClick"], Jy = { class: "attachment-image-info" }, Qy = ["href"], ev = { class: "attachment-size" }, tv = ["href"], nv = { class: "attachment-size" }, sv = {
  key: 0,
  class: "citation-chips"
}, rv = ["title"], iv = { class: "message-info" }, ov = {
  key: 0,
  class: "agent-name"
}, av = {
  key: 5,
  class: "cm-quick-actions-bar"
}, lv = ["disabled", "onClick"], cv = {
  key: 0,
  class: "file-previews-widget"
}, uv = {
  class: "file-preview-content-widget",
  style: { cursor: "pointer" }
}, fv = ["src", "alt", "onClick"], hv = ["onClick"], dv = { class: "file-preview-info-widget" }, pv = { class: "file-preview-name-widget" }, gv = { class: "file-preview-size-widget" }, mv = ["onClick"], _v = {
  key: 1,
  class: "upload-progress-widget"
}, yv = { class: "message-input" }, vv = ["placeholder", "disabled"], bv = ["disabled", "title"], wv = ["disabled"], kv = {
  key: 7,
  class: "new-conversation-section"
}, xv = { class: "conversation-ended-message" }, Tv = {
  key: 8,
  class: "rating-dialog"
}, Av = { class: "rating-content" }, Ev = { class: "star-rating" }, Sv = ["onClick"], Cv = { class: "rating-actions" }, Rv = ["disabled"], Iv = {
  key: 0,
  class: "preview-modal-image-container"
}, Lv = ["src", "alt"], Ov = { class: "preview-modal-filename" }, Nv = {
  key: 3,
  class: "widget-loading"
}, Sl = 3, Mv = "image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls", Pv = /* @__PURE__ */ Io({
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
    } = om(), { formatCurrency: a } = Sm(), {
      messages: l,
      loading: d,
      errorMessage: c,
      showError: w,
      loadingHistory: k,
      hasStartedChat: B,
      connectionStatus: I,
      sendMessage: j,
      endChat: F,
      loadChatHistory: ie,
      connect: ce,
      reconnect: oe,
      cleanup: T,
      humanAgent: L,
      onTakeover: K,
      submitRating: Y,
      submitForm: ve,
      currentForm: Me,
      getWorkflowState: Be,
      proceedWorkflow: xe,
      onWorkflowState: pe,
      onWorkflowProceeded: Ye,
      currentSessionId: Xe,
      setToken: rt,
      setWidgetId: fe,
      onSessionState: ge
    } = em(), { displayText: ae, isStreaming: st } = cm(l, () => Qn(() => Wn()));
    um(l);
    const Te = re(""), be = re(!0), Se = re(""), Le = re(!1), Ot = (h) => {
      const p = h.target;
      Te.value = p.value;
    };
    let Oe = null;
    const it = () => {
      Oe && Oe.disconnect(), Oe = new MutationObserver((p) => {
        let u = !1, ee = !1;
        p.forEach((ke) => {
          if (ke.type === "childList") {
            const he = Array.from(ke.addedNodes).some(
              (Re) => {
                var Vt;
                return Re.nodeType === Node.ELEMENT_NODE && (Re.matches("input, textarea") || ((Vt = Re.querySelector) == null ? void 0 : Vt.call(Re, "input, textarea")));
              }
            ), Je = Array.from(ke.removedNodes).some(
              (Re) => {
                var Vt;
                return Re.nodeType === Node.ELEMENT_NODE && (Re.matches("input, textarea") || ((Vt = Re.querySelector) == null ? void 0 : Vt.call(Re, "input, textarea")));
              }
            );
            he && (ee = !0, u = !0), Je && (u = !0);
          }
        }), u && (clearTimeout(it.timeoutId), it.timeoutId = setTimeout(() => {
          dt();
        }, ee ? 50 : 100));
      });
      const h = document.querySelector(".widget-container") || document.body;
      Oe.observe(h, {
        childList: !0,
        subtree: !0
      });
    };
    it.timeoutId = null;
    let ht = [];
    const dt = () => {
      _t();
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
      let p = [];
      for (const u of h) {
        const ee = document.querySelectorAll(u);
        if (ee.length > 0) {
          p = Array.from(ee);
          break;
        }
      }
      p.length !== 0 && (ht = p, p.forEach((u) => {
        u.addEventListener("input", kt, !0), u.addEventListener("keyup", kt, !0), u.addEventListener("change", kt, !0), u.addEventListener("keypress", g, !0), u.addEventListener("keydown", _, !0);
      }));
    }, _t = () => {
      ht.forEach((h) => {
        h.removeEventListener("input", kt), h.removeEventListener("keyup", kt), h.removeEventListener("change", kt), h.removeEventListener("keypress", g), h.removeEventListener("keydown", _);
      }), ht = [];
    }, pt = (h) => !!(h && h.closest && h.closest(".form-message, .form-fullscreen, .cm-email-gate")), kt = (h) => {
      if (pt(h.target)) return;
      const p = h.target;
      Te.value = p.value;
    }, g = (h) => {
      pt(h.target) || h.key === "Enter" && !h.shiftKey && (h.preventDefault(), h.stopPropagation(), Jt());
    }, _ = (h) => {
      pt(h.target) || h.key === "Enter" && !h.shiftKey && (h.preventDefault(), h.stopPropagation(), Jt());
    }, E = (h) => {
      const p = h.target, u = document.querySelector(".header-menu-container");
      document.querySelector(".header-menu-btn");
      const ee = document.querySelector(".header-dropdown-menu");
      ee && !(u != null && u.contains(p)) && (ee.style.display = "none");
    }, $ = re(!0), {
      token: N,
      start: D,
      stop: V,
      setToken: W,
      ensureFresh: q
    } = gm({
      onTokenChanged: (h) => {
        Nn({ type: "TOKEN_UPDATE", token: h }), rt(h);
      },
      onIdentityExpired: () => {
        Qo();
      }
    });
    le(() => !!N.value);
    const b = re(null), R = re(!1), M = re(!1);
    t.initialAuthError && (b.value = t.initialAuthError, R.value = !0, $.value = !1), o();
    const H = window.__INITIAL_DATA__;
    D((H == null ? void 0 : H.widgetId) || "", H == null ? void 0 : H.initialToken), N.value && (Le.value = !0);
    const G = re(!1);
    (H == null ? void 0 : H.allowAttachments) !== void 0 && (G.value = H.allowAttachments);
    const ne = re(null), {
      chatStyles: _e,
      chatIconStyles: ue,
      agentBubbleStyles: Qe,
      userBubbleStyles: Ce,
      messageNameStyles: Ke,
      headerBorderStyles: f,
      photoUrl: m,
      shadowStyle: O
    } = sg(s), S = re(null), {
      uploadedAttachments: U,
      previewModal: Z,
      previewFile: Q,
      formatFileSize: we,
      isImageAttachment: Ne,
      getDownloadUrl: Ge,
      getPreviewUrl: $e,
      handleFileSelect: lt,
      handleDrop: yt,
      handleDragOver: Ze,
      handleDragLeave: qt,
      handlePaste: rr,
      removeAttachment: ir,
      openPreview: zn,
      closePreview: Hn,
      openFilePicker: ys,
      isImage: or
    } = og(N, S);
    le(() => l.value.some(
      (h) => h.message_type === "form" && (!h.isSubmitted || h.isSubmitted === !1)
    ));
    const ct = le(() => {
      var h;
      return B.value && Le.value || !yi.value ? I.value === "connected" && !d.value : Rs(Se.value.trim()) && I.value === "connected" && !d.value || ((h = window.__INITIAL_DATA__) == null ? void 0 : h.workflow);
    }), Zt = le(() => I.value === "connected" ? Bt.value ? "Ask me anything..." : "Type a message..." : "Connecting..."), Jt = async () => {
      if (!Te.value.trim() && U.value.length === 0) return;
      !B.value && Se.value && await xt();
      const h = U.value.map((u) => ({
        content: u.content,
        // base64 content
        filename: u.filename,
        content_type: u.type,
        size: u.size
      }));
      await j(Te.value, Se.value, h), U.value.forEach((u) => {
        u.url && u.url.startsWith("blob:") && URL.revokeObjectURL(u.url), u.file_url && u.file_url.startsWith("blob:") && URL.revokeObjectURL(u.file_url);
      }), Te.value = "", U.value = [];
      const p = document.querySelector('input[placeholder*="Type a message"]');
      p && (p.value = ""), setTimeout(() => {
        dt();
      }, 500);
    }, vs = (h) => {
      ct.value && (Te.value = h, Jt());
    }, kn = () => {
      Nn({ type: "WIDGET_MINIMIZE" });
    }, bs = (h) => {
      h.key === "Enter" && !h.shiftKey && (h.preventDefault(), h.stopPropagation(), Jt());
    }, xt = async () => {
      var h, p, u, ee;
      try {
        if (!n.value)
          return console.error("Widget ID is not available"), b.value = "Widget ID is not available. Please refresh and try again.", R.value = !0, !1;
        await q(n.value);
        const ke = new URL(`${ms.API_URL}/widgets/${n.value}`);
        Se.value.trim() && Rs(Se.value.trim()) && ke.searchParams.append("email", Se.value.trim());
        const he = {
          Accept: "application/json",
          "Content-Type": "application/json"
        };
        N.value && (he.Authorization = `Bearer ${N.value}`);
        const Je = await fetch(ke, {
          headers: he
        });
        if (Je.status === 401) {
          Le.value = !1;
          try {
            const Rn = (await Je.json()).detail;
            if ((Rn == null ? void 0 : Rn.code) === fm)
              return Qo(), !1;
            const rs = typeof Rn == "string" ? Rn : "";
            (rs.includes("generate-token") || rs.includes("API key") || rs.includes("Token required")) && (M.value = !0, b.value = "Widget authentication not configured. Please contact the website administrator.", R.value = !0, W(null));
          } catch {
            b.value = "Authentication required. Your token has expired or is invalid. Please refresh the page.", R.value = !0, W(null);
          }
          return !1;
        }
        if (!Je.ok) {
          try {
            const As = await Je.json();
            b.value = As.detail || `Error: ${Je.statusText}`;
          } catch {
            b.value = `Error: ${Je.statusText}. Please try again.`;
          }
          return R.value = !0, !1;
        }
        const Re = await Je.json();
        return Re.token && W(Re.token), Le.value = !0, b.value = null, R.value = !1, rt(N.value || void 0), await ce() || console.error("Chat service not reachable yet; retrying in the background"), await ar(), (h = Re.agent) != null && h.customization && i(Re.agent.customization), Re.agent && !(Re != null && Re.human_agent) && (r.value = Re.agent.name), Re != null && Re.human_agent && (L.value = Re.human_agent), ((p = Re.agent) == null ? void 0 : p.allow_attachments) !== void 0 && (G.value = Re.agent.allow_attachments), ((u = Re.agent) == null ? void 0 : u.workflow) !== void 0 && (window.__INITIAL_DATA__ = window.__INITIAL_DATA__ || {}, window.__INITIAL_DATA__.workflow = Re.agent.workflow), (ee = Re.agent) != null && ee.workflow && await Be(), !0;
      } catch (ke) {
        return console.error("Error checking authorization:", ke), b.value = "An unexpected error occurred. Please try again.", R.value = !0, Le.value = !1, !1;
      } finally {
        $.value = !1;
      }
    }, ar = async () => {
      !B.value && Le.value && (B.value = !0, await ie());
    }, Wn = () => {
      ne.value && (ne.value.scrollTop = ne.value.scrollHeight);
    };
    Pt(() => l.value, (h) => {
      Qn(() => {
        Wn();
      });
    }, { deep: !0 }), Pt(I, (h, p) => {
      h === "connected" && p !== "connected" && setTimeout(dt, 100);
    }), Pt(() => l.value.length, (h, p) => {
      h > 0 && p === 0 && setTimeout(dt, 100);
    });
    let ws = null;
    Pt(() => l.value, (h) => {
      const p = h[h.length - 1];
      !dl(p) || p === ws || (ws = p, fu(p));
    }, { deep: !0 });
    const lr = async () => {
      await oe() && await xt();
    }, cr = re(!1), te = re(0), y = re(""), z = re(0), X = re(!1), me = re({}), Fe = re(!1), Ae = re({}), at = re(!1), Tt = re(null), xn = re("Start Chat"), jt = re(!1), De = re(null);
    le(() => {
      var p;
      const h = l.value[l.value.length - 1];
      return ((p = h == null ? void 0 : h.attributes) == null ? void 0 : p.request_rating) || !1;
    });
    const Tn = le(() => {
      var p;
      if (!((p = window.__INITIAL_DATA__) != null && p.workflow))
        return !1;
      const h = l.value.find((u) => u.message_type === "rating");
      return (h == null ? void 0 : h.isSubmitted) === !0;
    }), Qt = le(
      () => Yr(L.value.human_agent_profile_pic)
    ), fu = async (h) => {
      var p, u, ee, ke, he;
      if (dl(h)) {
        try {
          if (h.session_id && N.value && n.value) {
            const Je = new URL(`${ms.API_URL}/widgets/${n.value}/end-chat`);
            Je.searchParams.append("session_id", h.session_id), (p = h.attributes) != null && p.end_chat_reason && Je.searchParams.append("reason", h.attributes.end_chat_reason), (u = h.attributes) != null && u.end_chat_description && Je.searchParams.append("description", h.attributes.end_chat_description);
            const Re = await fetch(Je, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${N.value}`,
                "Content-Type": "application/json"
              }
            });
            if (Re.ok) {
              const Vt = await Re.json();
              console.info(`✓ Chat session closed on backend: ${Vt.session_id}`);
            } else
              console.warn(`Failed to close session on backend: ${Re.status}`);
          }
        } catch (Je) {
          console.error("Error calling end-chat API:", Je);
        }
        if ((ee = h.attributes) != null && ee.end_chat && ((ke = h.attributes) != null && ke.request_rating)) {
          const Je = h.agent_name || ((he = L.value) == null ? void 0 : he.human_agent_name) || r.value || "our agent";
          l.value.push({
            message: `Rate the chat session that you had with ${Je}`,
            message_type: "rating",
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            session_id: h.session_id,
            agent_name: Je,
            showFeedback: !1
          }), Xe.value = h.session_id;
        }
      }
    }, hu = (h) => {
      X.value || (z.value = h);
    }, du = () => {
      if (!X.value) {
        const h = l.value[l.value.length - 1];
        z.value = (h == null ? void 0 : h.selectedRating) || 0;
      }
    }, pu = async (h) => {
      if (!X.value) {
        z.value = h;
        const p = l.value[l.value.length - 1];
        p && p.message_type === "rating" && (p.showFeedback = !0, p.selectedRating = h);
      }
    }, gu = async (h, p, u = null) => {
      try {
        X.value = !0, await Y(p, u);
        const ee = l.value.find((ke) => ke.message_type === "rating");
        ee && (ee.isSubmitted = !0, ee.finalRating = p, ee.finalFeedback = u);
      } catch (ee) {
        console.error("Failed to submit rating:", ee);
      } finally {
        X.value = !1;
      }
    }, mu = (h) => {
      const p = {};
      for (const u of h.fields) {
        const ee = me.value[u.name], ke = hi(u, ee);
        ke && (p[u.name] = ke);
      }
      return Ae.value = p, Object.keys(p).length === 0;
    }, _u = async (h) => {
      if (!(Fe.value || !mu(h)))
        try {
          Fe.value = !0, await ve(me.value);
          const u = l.value.findIndex(
            (ee) => ee.message_type === "form" && (!ee.isSubmitted || ee.isSubmitted === !1)
          );
          u !== -1 && l.value.splice(u, 1), me.value = {}, Ae.value = {};
        } catch (u) {
          console.error("Failed to submit form:", u);
        } finally {
          Fe.value = !1;
        }
    }, Nt = (h, p) => {
      var u, ee;
      if (me.value[h] = p, p && p.toString().trim() !== "") {
        let ke = null;
        if ((u = De.value) != null && u.fields && (ke = De.value.fields.find((he) => he.name === h)), !ke && ((ee = Me.value) != null && ee.fields) && (ke = Me.value.fields.find((he) => he.name === h)), ke) {
          const he = hi(ke, p);
          he ? (Ae.value[h] = he, console.log(`Validation error for ${h}:`, he)) : delete Ae.value[h];
        }
      } else
        delete Ae.value[h], console.log(`Cleared error for ${h}`);
    }, yu = (h) => {
      const p = h.replace(/\D/g, "");
      return p.length >= 7 && p.length <= 15;
    }, hi = (h, p) => {
      if (h.required && (!p || p.toString().trim() === ""))
        return `${h.label} is required`;
      if (!p || p.toString().trim() === "")
        return null;
      if (h.type === "email" && !Rs(p))
        return "Please enter a valid email address";
      if (h.type === "tel" && !yu(p))
        return "Please enter a valid phone number";
      if ((h.type === "text" || h.type === "textarea") && h.minLength && p.length < h.minLength)
        return `${h.label} must be at least ${h.minLength} characters`;
      if ((h.type === "text" || h.type === "textarea") && h.maxLength && p.length > h.maxLength)
        return `${h.label} must not exceed ${h.maxLength} characters`;
      if (h.type === "number") {
        const u = parseFloat(p);
        if (isNaN(u))
          return `${h.label} must be a valid number`;
        if (h.minLength && u < h.minLength)
          return `${h.label} must be at least ${h.minLength}`;
        if (h.maxLength && u > h.maxLength)
          return `${h.label} must not exceed ${h.maxLength}`;
      }
      return null;
    }, vu = async () => {
      if (!(Fe.value || !De.value))
        try {
          Fe.value = !0, Ae.value = {};
          let h = !1;
          for (const p of De.value.fields || []) {
            const u = me.value[p.name], ee = hi(p, u);
            ee && (Ae.value[p.name] = ee, h = !0, console.log(`Validation error for field ${p.name}:`, ee));
          }
          if (h) {
            Fe.value = !1, console.log("Validation failed, not submitting");
            return;
          }
          await ve(me.value), jt.value = !1, De.value = null, me.value = {};
        } catch (h) {
          console.error("Failed to submit full screen form:", h);
        } finally {
          Fe.value = !1, console.log("Full screen form submission completed");
        }
    }, bu = (h, p) => {
      if (console.log("handleViewDetails called with:", { product: h, shopDomain: p }), !h) {
        console.error("No product provided to handleViewDetails");
        return;
      }
      let u = null;
      if (h.handle && p)
        u = `https://${p}/products/${h.handle}`;
      else if (h.id && p)
        u = `https://${p}/products/${h.id}`;
      else if (p) {
        if (!h.handle && !h.id) {
          console.error("Product handle and ID are both missing! Product:", h), alert("Unable to open product: Product information incomplete.");
          return;
        }
      } else {
        console.error("Shop domain is missing! Product:", h), alert("Unable to open product: Shop domain not available. Please contact support.");
        return;
      }
      u && (console.log("Opening product URL:", u), window.open(u, "_blank"));
    }, wu = (h) => {
      if (!h) return "";
      let p = h.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "");
      const u = [];
      return p = p.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (ee, ke, he) => {
        const Je = `__MARKDOWN_LINK_${u.length}__`;
        return console.log("Found markdown link:", ee, "-> placeholder:", Je), u.push(ee), Je;
      }), console.log("After replacing markdown links with placeholders:", p), console.log("Markdown links array:", u), p = p.replace(/https?:\/\/[^\s\)]+/g, "[link removed]"), console.log("After removing standalone URLs:", p), u.forEach((ee, ke) => {
        p = p.replace(`__MARKDOWN_LINK_${ke}__`, ee), console.log(`Restored markdown link ${ke}:`, ee);
      }), p = p.replace(/\n\s*\n\s*\n/g, `

`).trim(), p;
    }, Zo = re(!1);
    re(!1);
    const di = le(() => {
      var h;
      return !!((h = L.value) != null && h.human_agent_name);
    }), Jo = le(() => {
      var h;
      return tg((h = window.__INITIAL_DATA__) == null ? void 0 : h.presence, di.value);
    }), ku = le(() => G.value && di.value && U.value.length < Sl), xu = async () => {
      try {
        at.value = !1, Tt.value = null, await xe();
      } catch (h) {
        console.error("Failed to proceed workflow:", h);
      }
    }, pi = async (h) => {
      try {
        if (!h.userInputValue || !h.userInputValue.trim())
          return;
        const p = h.userInputValue.trim();
        h.isSubmitted = !0, h.submittedValue = p, await j(p, Se.value);
      } catch (p) {
        console.error("Failed to submit user input:", p), h.isSubmitted = !1, h.submittedValue = null;
      }
    }, Qo = () => {
      Nn({ type: "IDENTITY_EXPIRED" });
    }, Tu = async () => {
      N.value && (W(null), await ks());
    }, Au = async (h) => {
      const p = ps(h);
      !p || p === N.value || (W(p), await ks());
    }, ks = async () => {
      var h, p, u;
      try {
        let ee = 0;
        const ke = 50;
        for (; !((h = window.__INITIAL_DATA__) != null && h.widgetId) && ee < ke; )
          await new Promise((Je) => setTimeout(Je, 100)), ee++;
        return (p = window.__INITIAL_DATA__) != null && p.widgetId ? (fe(window.__INITIAL_DATA__.widgetId), await xt() ? ((u = window.__INITIAL_DATA__) != null && u.workflow && Le.value && await Be(), !0) : (I.value = "connected", !1)) : (console.error("Widget data not available after waiting"), !1);
      } catch (ee) {
        return console.error("Failed to initialize widget:", ee), !1;
      }
    };
    window.addEventListener("message", (h) => {
      h.source === window.parent && (!h.data || typeof h.data.type != "string" || (h.data.type === "SCROLL_TO_BOTTOM" && Wn(), h.data.type === "IDENTITY_UNAVAILABLE" && Tu(), h.data.type === "TOKEN_REFRESH" && Au(h.data.token), h.data.type === "WIDGET_VISIBILITY" && (ca.value = !!h.data.open), h.data.type === "WIDGET_DISPLAY" && (vi.value = {
        mode: h.data.mode,
        width: h.data.width,
        height: h.data.height,
        hotkey: h.data.hotkey
      }), h.data.type === "PREFILL_MESSAGE" && typeof h.data.text == "string" && (Te.value = h.data.text.slice(0, 2e3), Qn(() => {
        const p = document.querySelector(
          ".message-input input, .welcome-message-field"
        );
        p == null || p.focus();
      }))));
    });
    const Eu = () => {
      K(async () => {
        await xt();
      }), ge(({ session_id: h, authenticated: p, created: u }) => {
        Nn({
          type: "CHAT_SESSION",
          sessionId: h,
          authenticated: p,
          created: u
        });
      }), pe((h) => {
        var p;
        if (xn.value = h.button_text || "Start Chat", h.type === "landing_page")
          Tt.value = h.landing_page_data, at.value = !0, jt.value = !1;
        else if (h.type === "form" || h.type === "display_form")
          if (((p = h.form_data) == null ? void 0 : p.form_full_screen) === !0)
            De.value = h.form_data, jt.value = !0, at.value = !1;
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
              (ke) => ke.message_type === "form" && !ke.isSubmitted
            ) === -1 && l.value.push(u), at.value = !1, jt.value = !1;
          }
        else
          at.value = !1, jt.value = !1;
      }), Ye((h) => {
        console.log("Workflow proceeded:", h);
      });
    }, Su = async () => {
      try {
        await ks(), await Be();
      } catch (h) {
        throw console.error("Failed to start new conversation:", h), h;
      }
    }, ur = le(
      () => {
        var h;
        return s.value.allow_new_chat === !0 && l.value.length > 0 && !((h = L.value) != null && h.human_agent_name) && !jn.value;
      }
    ), An = re(!1), En = re(""), Sn = re(!1);
    let qn = null;
    const ns = () => {
      Sn.value = !1, En.value = "", qn && (clearTimeout(qn), qn = null);
    }, ea = () => {
      if (!An.value) {
        if (Sn.value) {
          ns();
          return;
        }
        Sn.value = !0, En.value = "", qn = setTimeout(ns, xp);
      }
    };
    Pt(ur, (h) => {
      h || ns();
    });
    const ta = async () => {
      An.value || (qn && (clearTimeout(qn), qn = null), await Cu(), En.value || (Sn.value = !1));
    }, Cu = async () => {
      if (!An.value) {
        An.value = !0, En.value = "";
        try {
          if (!await F()) {
            En.value = hl;
            return;
          }
          L.value = {}, Te.value = "", U.value = [], await ks();
        } catch (h) {
          console.error("Failed to start a new chat:", h), En.value = hl;
        } finally {
          An.value = !1;
        }
      }
    }, Ru = async () => {
      Tn.value = !1, l.value = [], L.value = {}, await Su();
    };
    ri(async () => {
      await ks(), Eu(), it(), document.addEventListener("click", E), (() => {
        const p = l.value.length > 0, u = I.value === "connected", ee = document.querySelector('input[type="text"], textarea') !== null;
        return p || u || ee;
      })() && setTimeout(dt, 100);
    }), tr(() => {
      window.removeEventListener("message", (h) => {
        h.data.type === "SCROLL_TO_BOTTOM" && Wn();
      }), document.removeEventListener("click", E), Oe && (Oe.disconnect(), Oe = null), it.timeoutId && (clearTimeout(it.timeoutId), it.timeoutId = null), _t(), V(), ns(), T();
    });
    const ss = le(() => s.value.chat_style === "AURORA"), Bt = le(() => s.value.chat_style === "ASK_ANYTHING" || ss.value), na = le(() => s.value.customization_metadata), fr = le(() => {
      var p;
      const h = (p = na.value) == null ? void 0 : p.avatar_style;
      return h === "orb" ? !0 : h === "photo" ? !1 : ss.value && !s.value.photo_url;
    }), xs = le(() => {
      var h;
      return Qp(r.value || "", (h = na.value) == null ? void 0 : h.orb_variant);
    }), Iu = {
      GLASS: "theme-glass",
      TERMINAL: "theme-terminal",
      PLAYFUL: "theme-playful",
      CALM_MINT: "theme-calm",
      SUNRISE: "theme-sunrise"
    }, Lu = le(() => Iu[s.value.chat_style] || ""), Ou = le(() => Em(s.value.chat_style, {
      chat_background_color: s.value.chat_background_color,
      chat_text_color: s.value.chat_text_color,
      accent_color: s.value.accent_color,
      font_family: s.value.font_family
    })), gi = le(
      () => Array.isArray(s.value.quick_actions) ? s.value.quick_actions.filter((h) => !!h && h.trim().length > 0) : []
    ), sa = le(() => (s.value.welcome_message || "").trim()), ra = le(
      () => !Bt.value && l.value.length === 0 && !k.value && !jn.value
    ), Nu = le(
      () => ra.value && sa.value.length > 0
    ), Mu = le(
      () => ra.value && !Tn.value && gi.value.length > 0
    ), hr = le(() => s.value.show_citations === !0), ia = le(() => eg(s.value.show_ai_disclaimer, di.value)), Pu = (h) => /^[0-9a-f]{16,}$/i.test(h) || /^[0-9a-f-]{32,}$/i.test(h), mi = (h) => {
      const p = (h || "").trim().toLowerCase();
      return !p || p === "unknown" ? "Knowledge base" : p.charAt(0).toUpperCase() + p.slice(1);
    }, _i = (h) => {
      let p = ((h == null ? void 0 : h.name) || "").trim();
      return !p || (p = p.replace(/^[0-9a-f]{16,}[_-]/i, "").replace(/\.(pdf|txt|md|html?|docx?|csv|json)$/i, ""), !p || Pu(p)) ? mi(h == null ? void 0 : h.type) : p;
    }, oa = (h) => {
      const p = _i(h), u = mi(h == null ? void 0 : h.type);
      return p === u ? u : `${p} · ${u}`;
    }, yi = le(() => s.value.collect_email === !0 && !Bt.value), aa = re(!1), Cn = re(""), Ts = re(!1), jn = le(() => !B.value && yi.value && !aa.value), la = async () => {
      const h = Se.value.trim();
      if (!h) {
        Cn.value = "Please enter your email address.";
        return;
      }
      if (!Rs(h)) {
        Cn.value = "Please enter a valid email address.";
        return;
      }
      Cn.value = "", Ts.value = !0;
      try {
        await xt(), aa.value = !0;
      } catch {
        Cn.value = "Something went wrong. Please try again.";
      } finally {
        Ts.value = !1;
      }
    }, vi = re(null), ca = re(!0), bi = { mode: "floating", width: 400, height: 560 }, dr = le(
      () => {
        var h;
        return vi.value || ((h = s.value.customization_metadata) == null ? void 0 : h.widget_display) || null;
      }
    ), Fu = le(() => {
      const h = dr.value;
      return h ? typeof h.mode == "string" && h.mode !== bi.mode || typeof h.width == "number" && h.width !== bi.width || typeof h.height == "number" && h.height !== bi.height : !1;
    }), Du = le(() => {
      var p;
      const h = {
        width: "100%",
        height: "100%",
        borderRadius: "var(--radius-lg)"
      };
      if (Fu.value) {
        const u = (p = dr.value) == null ? void 0 : p.mode;
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
    }), ua = le(() => Bt.value && l.value.length === 0), Bu = ["form", "user_input", "rating", "product", "shopify_output"], $u = le(
      () => l.value.some(
        (h) => Bu.includes(h.message_type) || Array.isArray(h.attachments) && h.attachments.length > 0
      )
    ), Uu = le(() => {
      var p, u;
      return Bt.value ? !0 : (((p = dr.value) == null ? void 0 : p.mode) === "ask-ai" || ((u = dr.value) == null ? void 0 : u.mode) === "search-bar") && !G.value;
    }), wi = le(
      () => Uu.value && be.value && !at.value && !jt.value && !jn.value && !Tn.value && !$u.value
    );
    Pt(wi, (h) => {
      Nn({ type: "WIDGET_SURFACE", palette: h });
    }, { immediate: !0 });
    const zu = le(
      () => s.value.welcome_subtitle || `Ask a question — ${r.value || "the assistant"} answers from what it knows.`
    ), Hu = le(() => {
      var h;
      return ((h = vi.value) == null ? void 0 : h.hotkey) !== !1;
    });
    return (h, p) => R.value && M.value ? (x(), A("div", Cm, [
      v("button", {
        type: "button",
        class: "cm-error-close",
        "aria-label": "Close chat",
        title: "Close",
        onClick: kn
      }, "×"),
      p[20] || (p[20] = Gn('<div class="widget-unavailable-card" data-v-df774c9a><div class="widget-unavailable-icon-wrapper" data-v-df774c9a><svg class="widget-unavailable-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-v-df774c9a><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" data-v-df774c9a></path><path d="M9 12l2 2 4-4" data-v-df774c9a></path></svg></div><h2 class="widget-unavailable-title" data-v-df774c9a>Chat Unavailable</h2><p class="widget-unavailable-message" data-v-df774c9a> This chat widget is not currently configured. Please contact the website administrator to enable chat support. </p><div class="widget-unavailable-footer" data-v-df774c9a><svg class="chattermate-logo-small" width="14" height="14" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-df774c9a><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-df774c9a></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-df774c9a></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-df774c9a></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-df774c9a></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-df774c9a><span class="cm-powered-prefix" data-v-df774c9a>Powered by </span><strong class="cm-brand" data-v-df774c9a>ChatterMate</strong></a></div></div>', 1))
    ])) : R.value ? (x(), A("div", Rm, [
      v("button", {
        type: "button",
        class: "cm-error-close",
        "aria-label": "Close chat",
        title: "Close",
        onClick: kn
      }, "×"),
      v("div", Im, [
        p[21] || (p[21] = Gn('<div class="auth-error-header" data-v-df774c9a><svg class="auth-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-df774c9a><circle cx="12" cy="12" r="10" data-v-df774c9a></circle><line x1="12" y1="8" x2="12" y2="12" data-v-df774c9a></line><line x1="12" y1="16" x2="12.01" y2="16" data-v-df774c9a></line></svg><h2 data-v-df774c9a>Authentication Error</h2></div>', 1)),
        v("p", Lm, J(b.value), 1),
        v("button", {
          class: "auth-error-refresh-btn",
          onClick: p[0] || (p[0] = () => h.window.location.reload())
        }, " Refresh Page ")
      ])
    ])) : n.value && !R.value ? (x(), A("div", {
      key: 2,
      class: Ue(["chat-container cm-surface", [{ collapsed: !be.value, "ask-anything-style": Bt.value, aurora: ss.value }, Lu.value]]),
      style: Ee({ ...C(O), ...Du.value, ...Ou.value })
    }, [
      $.value ? (x(), A("div", Om, p[22] || (p[22] = [
        Gn('<div class="loading-spinner" data-v-df774c9a><div class="dot" data-v-df774c9a></div><div class="dot" data-v-df774c9a></div><div class="dot" data-v-df774c9a></div></div><div class="loading-text" data-v-df774c9a>Initializing chat...</div>', 2)
      ]))) : se("", !0),
      !$.value && C(I) !== "connected" ? (x(), A("div", {
        key: 1,
        class: Ue(["connection-status", C(I)])
      }, [
        C(I) === "connecting" ? (x(), A("div", Nm, p[23] || (p[23] = [
          hn(" Connecting to chat service... ", -1),
          v("div", { class: "loading-dots" }, [
            v("div", { class: "dot" }),
            v("div", { class: "dot" }),
            v("div", { class: "dot" })
          ], -1)
        ]))) : C(I) === "failed" ? (x(), A("div", Mm, [
          p[24] || (p[24] = hn(" Connection failed. ", -1)),
          v("button", {
            onClick: lr,
            class: "reconnect-button"
          }, " Click here to reconnect ")
        ])) : se("", !0)
      ], 2)) : se("", !0),
      C(w) ? (x(), A("div", {
        key: 2,
        class: "error-alert",
        style: Ee(C(ue))
      }, J(C(c)), 5)) : se("", !0),
      wi.value ? (x(), Hr(Xp, {
        key: 3,
        messages: C(l),
        draft: Te.value,
        "agent-name": C(r),
        suggestions: gi.value,
        "welcome-title": C(s).welcome_title,
        "welcome-subtitle": zu.value,
        placeholder: Zt.value,
        "input-enabled": ct.value,
        loading: C(d),
        "show-citations": hr.value,
        disclaimer: ia.value ? C(pl) : "",
        active: ca.value,
        hotkey: Hu.value,
        "can-start-new-chat": ur.value,
        "starting-new-chat": An.value,
        "new-chat-armed": Sn.value,
        "new-chat-error": En.value,
        onNewChat: ea,
        onConfirmNewChat: ta,
        onCancelNewChat: ns,
        "citation-label": _i,
        "citation-tooltip": oa,
        "display-text": C(ae),
        "is-streaming": C(st),
        "onUpdate:draft": p[1] || (p[1] = (u) => Te.value = u),
        onSend: Jt,
        onAsk: vs,
        onClose: kn
      }, null, 8, ["messages", "draft", "agent-name", "suggestions", "welcome-title", "welcome-subtitle", "placeholder", "input-enabled", "loading", "show-citations", "disclaimer", "active", "hotkey", "can-start-new-chat", "starting-new-chat", "new-chat-armed", "new-chat-error", "display-text", "is-streaming"])) : ua.value ? (x(), A("div", {
        key: 4,
        class: Ue(["welcome-message-section", { aurora: ss.value }]),
        style: Ee(C(_e))
      }, [
        v("div", Pm, [
          v("div", Fm, [
            fr.value ? (x(), A("div", {
              key: 0,
              class: "welcome-orb",
              style: Ee(xs.value)
            }, null, 4)) : C(m) ? (x(), A("img", {
              key: 1,
              src: C(m),
              alt: C(r),
              class: "welcome-avatar"
            }, null, 8, Dm)) : se("", !0),
            v("h1", Bm, J(C(s).welcome_title || `Welcome to ${C(r)}`), 1),
            v("p", $m, J(C(s).welcome_subtitle || "I'm here to help you with anything you need. What can I assist you with today?"), 1)
          ])
        ]),
        v("div", Um, [
          !C(B) && !Le.value && yi.value ? (x(), A("div", zm, [
            In(v("input", {
              "onUpdate:modelValue": p[2] || (p[2] = (u) => Se.value = u),
              type: "email",
              placeholder: "Enter your email address",
              disabled: C(d) || C(I) !== "connected",
              class: Ue([{
                invalid: Se.value.trim() && !C(Rs)(Se.value.trim()),
                disabled: C(I) !== "connected"
              }, "welcome-email-input"])
            }, null, 10, Hm), [
              [Yn, Se.value]
            ])
          ])) : se("", !0),
          v("div", Wm, [
            In(v("input", {
              "onUpdate:modelValue": p[3] || (p[3] = (u) => Te.value = u),
              type: "text",
              placeholder: Zt.value,
              onKeypress: bs,
              onInput: Ot,
              onChange: Ot,
              disabled: !ct.value,
              class: Ue([{ disabled: !ct.value }, "welcome-message-field"])
            }, null, 42, qm), [
              [Yn, Te.value]
            ]),
            v("button", {
              class: Ue(["welcome-send-button", { "aurora-send": ss.value }]),
              style: Ee(C(Ce)),
              onClick: Jt,
              disabled: !Te.value.trim() || !ct.value
            }, [
              ss.value ? (x(), A("svg", Vm, p[25] || (p[25] = [
                v("path", {
                  d: "M12 19V5M12 5L5 12M12 5L19 12",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                }, null, -1)
              ]))) : (x(), A("svg", Km, p[26] || (p[26] = [
                v("path", {
                  d: "M5 12L3 21L21 12L3 3L5 12ZM5 12L13 12",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                }, null, -1)
              ])))
            ], 14, jm)
          ])
        ]),
        v("div", {
          class: "powered-by-welcome",
          style: Ee(C(Ke))
        }, p[27] || (p[27] = [
          Gn('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-df774c9a><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-df774c9a></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-df774c9a></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-df774c9a></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-df774c9a></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-df774c9a><span class="cm-powered-prefix" data-v-df774c9a>Powered by </span><strong class="cm-brand" data-v-df774c9a>ChatterMate</strong></a>', 2)
        ]), 4)
      ], 6)) : se("", !0),
      at.value && Tt.value ? (x(), A("div", {
        key: 5,
        class: "landing-page-fullscreen",
        style: Ee(C(_e))
      }, [
        v("div", Gm, [
          v("div", Ym, [
            v("h2", Xm, J(Tt.value.heading), 1),
            v("div", Zm, J(Tt.value.content), 1)
          ]),
          v("div", Jm, [
            v("button", {
              class: "landing-page-button",
              onClick: xu
            }, J(xn.value), 1)
          ])
        ]),
        v("div", {
          class: "powered-by-landing",
          style: Ee(C(Ke))
        }, p[28] || (p[28] = [
          Gn('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-df774c9a><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-df774c9a></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-df774c9a></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-df774c9a></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-df774c9a></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-df774c9a><span class="cm-powered-prefix" data-v-df774c9a>Powered by </span><strong class="cm-brand" data-v-df774c9a>ChatterMate</strong></a>', 2)
        ]), 4)
      ], 4)) : jt.value && De.value ? (x(), A("div", {
        key: 6,
        class: "form-fullscreen",
        style: Ee(C(_e))
      }, [
        v("div", Qm, [
          De.value.title || De.value.description ? (x(), A("div", e_, [
            De.value.title ? (x(), A("h2", t_, J(De.value.title), 1)) : se("", !0),
            De.value.description ? (x(), A("p", n_, J(De.value.description), 1)) : se("", !0)
          ])) : se("", !0),
          v("div", s_, [
            (x(!0), A(ze, null, gt(De.value.fields, (u) => {
              var ee, ke;
              return x(), A("div", {
                key: u.name,
                class: "form-field"
              }, [
                v("label", {
                  for: `fullscreen-form-${u.name}`,
                  class: "field-label"
                }, [
                  hn(J(u.label) + " ", 1),
                  u.required ? (x(), A("span", i_, "*")) : se("", !0)
                ], 8, r_),
                u.type === "text" || u.type === "email" || u.type === "tel" ? (x(), A("input", {
                  key: 0,
                  id: `fullscreen-form-${u.name}`,
                  type: u.type,
                  placeholder: u.placeholder || "",
                  required: u.required,
                  minlength: u.minLength,
                  maxlength: u.maxLength,
                  value: me.value[u.name] || "",
                  onInput: (he) => Nt(u.name, he.target.value),
                  onBlur: (he) => Nt(u.name, he.target.value),
                  class: Ue(["form-input", { error: Ae.value[u.name] }]),
                  autocomplete: u.type === "email" ? "email" : u.type === "tel" ? "tel" : "off",
                  inputmode: u.type === "tel" ? "tel" : u.type === "email" ? "email" : "text"
                }, null, 42, o_)) : u.type === "number" ? (x(), A("input", {
                  key: 1,
                  id: `fullscreen-form-${u.name}`,
                  type: "number",
                  placeholder: u.placeholder || "",
                  required: u.required,
                  min: u.minLength,
                  max: u.maxLength,
                  value: me.value[u.name] || "",
                  onInput: (he) => Nt(u.name, he.target.value),
                  class: Ue(["form-input", { error: Ae.value[u.name] }])
                }, null, 42, a_)) : u.type === "textarea" ? (x(), A("textarea", {
                  key: 2,
                  id: `fullscreen-form-${u.name}`,
                  placeholder: u.placeholder || "",
                  required: u.required,
                  minlength: u.minLength,
                  maxlength: u.maxLength,
                  value: me.value[u.name] || "",
                  onInput: (he) => Nt(u.name, he.target.value),
                  class: Ue(["form-textarea", { error: Ae.value[u.name] }]),
                  rows: "4"
                }, null, 42, l_)) : u.type === "select" ? (x(), A("select", {
                  key: 3,
                  id: `fullscreen-form-${u.name}`,
                  required: u.required,
                  value: me.value[u.name] || "",
                  onChange: (he) => Nt(u.name, he.target.value),
                  class: Ue(["form-select", { error: Ae.value[u.name] }])
                }, [
                  v("option", u_, J(u.placeholder || "Please select..."), 1),
                  (x(!0), A(ze, null, gt((Array.isArray(u.options) ? u.options : ((ee = u.options) == null ? void 0 : ee.split(`
`)) || []).filter((he) => he.trim()), (he) => (x(), A("option", {
                    key: he,
                    value: he.trim()
                  }, J(he.trim()), 9, f_))), 128))
                ], 42, c_)) : u.type === "checkbox" ? (x(), A("label", h_, [
                  v("input", {
                    id: `fullscreen-form-${u.name}`,
                    type: "checkbox",
                    required: u.required,
                    checked: me.value[u.name] || !1,
                    onChange: (he) => Nt(u.name, he.target.checked),
                    class: "form-checkbox"
                  }, null, 40, d_),
                  v("span", p_, J(u.label), 1)
                ])) : u.type === "radio" ? (x(), A("div", g_, [
                  (x(!0), A(ze, null, gt((Array.isArray(u.options) ? u.options : ((ke = u.options) == null ? void 0 : ke.split(`
`)) || []).filter((he) => he.trim()), (he) => (x(), A("label", {
                    key: he,
                    class: "radio-field"
                  }, [
                    v("input", {
                      type: "radio",
                      name: `fullscreen-form-${u.name}`,
                      value: he.trim(),
                      required: u.required,
                      checked: me.value[u.name] === he.trim(),
                      onChange: (Je) => Nt(u.name, he.trim()),
                      class: "form-radio"
                    }, null, 40, m_),
                    v("span", __, J(he.trim()), 1)
                  ]))), 128))
                ])) : se("", !0),
                Ae.value[u.name] ? (x(), A("div", y_, J(Ae.value[u.name]), 1)) : se("", !0)
              ]);
            }), 128))
          ]),
          v("div", v_, [
            v("button", {
              onClick: p[4] || (p[4] = () => {
                console.log("Submit button clicked!"), vu();
              }),
              disabled: Fe.value,
              class: "submit-form-button",
              style: Ee(C(Ce))
            }, [
              Fe.value ? (x(), A("span", w_, p[29] || (p[29] = [
                v("div", { class: "dot" }, null, -1),
                v("div", { class: "dot" }, null, -1),
                v("div", { class: "dot" }, null, -1)
              ]))) : (x(), A("span", k_, J(De.value.submit_button_text || "Submit"), 1))
            ], 12, b_)
          ])
        ]),
        v("div", {
          class: "powered-by-landing",
          style: Ee(C(Ke))
        }, p[30] || (p[30] = [
          Gn('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-df774c9a><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-df774c9a></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-df774c9a></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-df774c9a></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-df774c9a></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-df774c9a><span class="cm-powered-prefix" data-v-df774c9a>Powered by </span><strong class="cm-brand" data-v-df774c9a>ChatterMate</strong></a>', 2)
        ]), 4)
      ], 4)) : !ua.value && be.value && !wi.value ? (x(), A("div", {
        key: 7,
        class: Ue(["chat-panel", { "ask-anything-chat": Bt.value }]),
        style: Ee(C(_e))
      }, [
        Bt.value ? (x(), A("div", {
          key: 1,
          class: "ask-anything-top",
          style: Ee(C(f))
        }, [
          v("div", I_, [
            Qt.value || C(m) ? (x(), A("img", {
              key: 0,
              src: Qt.value || C(m),
              alt: C(L).human_agent_name || C(r),
              class: "header-avatar"
            }, null, 8, L_)) : se("", !0),
            v("div", O_, [
              v("h3", {
                style: Ee(C(Ke))
              }, J(C(r)), 5),
              v("p", {
                class: "ask-anything-subtitle",
                style: Ee(C(Ke))
              }, J(C(s).welcome_subtitle || "Ask me anything. I'm here to help."), 5)
            ])
          ])
        ], 4)) : (x(), A("div", {
          key: 0,
          class: "chat-header",
          style: Ee(C(f))
        }, [
          v("div", {
            class: "cm-header-sheen",
            style: Ee({ background: "linear-gradient(90deg, transparent, " + (C(s).accent_color || "#C9F24E") + ", transparent)" })
          }, null, 4),
          v("div", x_, [
            !Qt.value && (fr.value || !C(m)) ? (x(), A("div", {
              key: 0,
              class: "header-orb",
              style: Ee(xs.value)
            }, null, 4)) : Qt.value || C(m) ? (x(), A("img", {
              key: 1,
              src: Qt.value || C(m),
              alt: C(L).human_agent_name || C(r),
              class: "header-avatar"
            }, null, 8, T_)) : se("", !0),
            v("div", A_, [
              v("h3", {
                style: Ee(C(Ke))
              }, J(C(L).human_agent_name || C(r)), 5),
              v("div", E_, [
                v("span", {
                  class: Ue(["status-indicator", Jo.value.online ? "online" : "away"])
                }, null, 2),
                v("span", S_, J(Jo.value.text), 1)
              ])
            ])
          ]),
          v("div", C_, [
            ur.value ? (x(), A("button", {
              key: 0,
              type: "button",
              class: Ue(["header-new-chat", { armed: Sn.value }]),
              style: Ee(C(Ke)),
              disabled: An.value,
              title: C(Gr),
              "aria-label": C(Gr),
              "aria-expanded": Sn.value,
              onClick: ea
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
            ]), 14, R_)) : se("", !0),
            v("button", {
              type: "button",
              class: "header-minimize",
              style: Ee(C(Ke)),
              title: "Minimize",
              "aria-label": "Minimize chat",
              onClick: kn
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
        C(k) ? (x(), A("div", N_, p[33] || (p[33] = [
          v("div", { class: "loading-spinner" }, [
            v("div", { class: "dot" }),
            v("div", { class: "dot" }),
            v("div", { class: "dot" })
          ], -1)
        ]))) : se("", !0),
        jn.value ? (x(), A("div", {
          key: 3,
          class: "cm-email-gate",
          style: Ee(C(_e))
        }, [
          v("div", {
            class: "cm-email-gate-orb",
            style: Ee(xs.value)
          }, null, 4),
          v("h3", M_, J(C(s).welcome_title || "Before we start"), 1),
          p[34] || (p[34] = v("p", { class: "cm-email-gate-text" }, "Enter your email and we'll continue the chat.", -1)),
          In(v("input", {
            "onUpdate:modelValue": p[5] || (p[5] = (u) => Se.value = u),
            type: "email",
            inputmode: "email",
            autocomplete: "email",
            placeholder: "you@example.com",
            class: Ue(["cm-email-gate-input", { invalid: !!Cn.value }]),
            disabled: Ts.value,
            onKeyup: Sr(la, ["enter"]),
            onInput: p[6] || (p[6] = (u) => Cn.value = "")
          }, null, 42, P_), [
            [Yn, Se.value]
          ]),
          Cn.value ? (x(), A("p", F_, J(Cn.value), 1)) : se("", !0),
          v("button", {
            type: "button",
            class: "cm-email-gate-btn",
            style: Ee(C(Ce)),
            disabled: Ts.value,
            onClick: la
          }, J(Ts.value ? "Please wait…" : "Continue to chat"), 13, D_)
        ], 4)) : se("", !0),
        Sn.value && ur.value ? (x(), Hr(Kc, {
          key: 4,
          busy: An.value,
          error: En.value,
          onConfirm: ta,
          onCancel: ns
        }, null, 8, ["busy", "error"])) : se("", !0),
        In(v("div", {
          class: "chat-messages",
          ref_key: "messagesContainer",
          ref: ne
        }, [
          Nu.value ? (x(), A("div", B_, [
            v("div", $_, [
              fr.value || !C(m) ? (x(), A("div", {
                key: 0,
                class: "cm-welcome-orb",
                style: Ee(xs.value)
              }, null, 4)) : (x(), A("img", {
                key: 1,
                src: C(m),
                alt: C(r),
                class: "cm-welcome-avatar"
              }, null, 8, U_)),
              v("div", {
                class: "message-bubble cm-welcome-bubble",
                style: Ee(C(Qe))
              }, J(sa.value), 5)
            ])
          ])) : se("", !0),
          (x(!0), A(ze, null, gt(C(l), (u, ee) => {
            var ke, he, Je, Re, Vt, As, Rn, rs, fa, ha, da, pa, ga, ma, _a, ya, va, ba, wa;
            return x(), A("div", {
              key: ee,
              class: Ue([
                "message",
                u.message_type === "bot" || u.message_type === "agent" ? "agent-message" : u.message_type === "system" ? "system-message" : u.message_type === "rating" ? "rating-message" : u.message_type === "form" ? "form-message" : u.message_type === "product" || u.shopify_output ? "product-message" : "user-message"
              ])
            }, [
              u.message_type === "bot" || u.message_type === "agent" ? (x(), A("div", z_, [
                Qt.value ? (x(), A("img", {
                  key: 0,
                  src: Qt.value,
                  class: "cm-msg-avatar-img",
                  alt: ""
                }, null, 8, H_)) : !fr.value && C(m) ? (x(), A("img", {
                  key: 1,
                  src: C(m),
                  class: "cm-msg-avatar-img",
                  alt: ""
                }, null, 8, W_)) : (x(), A("div", {
                  key: 2,
                  class: "cm-msg-avatar-orb",
                  style: Ee(xs.value)
                }, null, 4))
              ])) : se("", !0),
              v("div", q_, [
                v("div", {
                  class: "message-bubble",
                  style: Ee(u.message_type === "system" || u.message_type === "rating" || u.message_type === "form" || u.message_type === "product" || u.shopify_output ? {} : u.message_type === "user" ? C(Ce) : C(Qe))
                }, [
                  u.message_type === "rating" ? (x(), A("div", j_, [
                    v("p", V_, "Rate the chat session that you had with " + J(u.agent_name || C(L).human_agent_name || C(r) || "our agent"), 1),
                    v("div", {
                      class: Ue(["star-rating", { submitted: X.value || u.isSubmitted }])
                    }, [
                      (x(), A(ze, null, gt(5, (P) => v("button", {
                        key: P,
                        class: Ue(["star-button", {
                          warning: P <= (u.isSubmitted ? u.finalRating : z.value || u.selectedRating) && (u.isSubmitted ? u.finalRating : z.value || u.selectedRating) <= 3,
                          success: P <= (u.isSubmitted ? u.finalRating : z.value || u.selectedRating) && (u.isSubmitted ? u.finalRating : z.value || u.selectedRating) > 3,
                          selected: P <= (u.isSubmitted ? u.finalRating : z.value || u.selectedRating)
                        }]),
                        onMouseover: (Kt) => !u.isSubmitted && hu(P),
                        onMouseleave: (Kt) => !u.isSubmitted && du,
                        onClick: (Kt) => !u.isSubmitted && pu(P),
                        disabled: X.value || u.isSubmitted
                      }, " ★ ", 42, K_)), 64))
                    ], 2),
                    u.showFeedback && !u.isSubmitted ? (x(), A("div", G_, [
                      v("div", Y_, [
                        In(v("input", {
                          "onUpdate:modelValue": (P) => u.feedback = P,
                          placeholder: "Please share your feedback (optional)",
                          disabled: X.value,
                          maxlength: "500",
                          class: "feedback-input"
                        }, null, 8, X_), [
                          [Yn, u.feedback]
                        ]),
                        v("div", Z_, J(((ke = u.feedback) == null ? void 0 : ke.length) || 0) + "/500", 1)
                      ]),
                      v("button", {
                        onClick: (P) => gu(u.session_id, z.value, u.feedback),
                        disabled: X.value || !z.value,
                        class: "submit-rating-button",
                        style: Ee({ backgroundColor: C(s).accent_color || "var(--accent-solid)" })
                      }, J(X.value ? "Submitting..." : "Submit Rating"), 13, J_)
                    ])) : se("", !0),
                    u.isSubmitted && u.finalFeedback ? (x(), A("div", Q_, [
                      v("div", ey, [
                        v("p", ty, J(u.finalFeedback), 1)
                      ])
                    ])) : u.isSubmitted ? (x(), A("div", ny, " Thank you for your rating! ")) : se("", !0)
                  ])) : u.message_type === "form" ? (x(), A("div", sy, [
                    (Je = (he = u.attributes) == null ? void 0 : he.form_data) != null && Je.title || (Vt = (Re = u.attributes) == null ? void 0 : Re.form_data) != null && Vt.description ? (x(), A("div", ry, [
                      (Rn = (As = u.attributes) == null ? void 0 : As.form_data) != null && Rn.title ? (x(), A("h3", iy, J(u.attributes.form_data.title), 1)) : se("", !0),
                      (fa = (rs = u.attributes) == null ? void 0 : rs.form_data) != null && fa.description ? (x(), A("p", oy, J(u.attributes.form_data.description), 1)) : se("", !0)
                    ])) : se("", !0),
                    v("div", ay, [
                      (x(!0), A(ze, null, gt((da = (ha = u.attributes) == null ? void 0 : ha.form_data) == null ? void 0 : da.fields, (P) => {
                        var Kt, ki;
                        return x(), A("div", {
                          key: P.name,
                          class: "form-field"
                        }, [
                          v("label", {
                            for: `form-${P.name}`,
                            class: "field-label"
                          }, [
                            hn(J(P.label) + " ", 1),
                            P.required ? (x(), A("span", cy, "*")) : se("", !0)
                          ], 8, ly),
                          P.type === "text" || P.type === "email" || P.type === "tel" ? (x(), A("input", {
                            key: 0,
                            id: `form-${P.name}`,
                            type: P.type,
                            placeholder: P.placeholder || "",
                            required: P.required,
                            minlength: P.minLength,
                            maxlength: P.maxLength,
                            value: me.value[P.name] || "",
                            onInput: (We) => Nt(P.name, We.target.value),
                            onBlur: (We) => Nt(P.name, We.target.value),
                            class: Ue(["form-input", { error: Ae.value[P.name] }]),
                            disabled: Fe.value,
                            autocomplete: P.type === "email" ? "email" : P.type === "tel" ? "tel" : "off",
                            inputmode: P.type === "tel" ? "tel" : P.type === "email" ? "email" : "text"
                          }, null, 42, uy)) : P.type === "number" ? (x(), A("input", {
                            key: 1,
                            id: `form-${P.name}`,
                            type: "number",
                            placeholder: P.placeholder || "",
                            required: P.required,
                            min: P.min,
                            max: P.max,
                            value: me.value[P.name] || "",
                            onInput: (We) => Nt(P.name, We.target.value),
                            class: Ue(["form-input", { error: Ae.value[P.name] }]),
                            disabled: Fe.value
                          }, null, 42, fy)) : P.type === "textarea" ? (x(), A("textarea", {
                            key: 2,
                            id: `form-${P.name}`,
                            placeholder: P.placeholder || "",
                            required: P.required,
                            minlength: P.minLength,
                            maxlength: P.maxLength,
                            value: me.value[P.name] || "",
                            onInput: (We) => Nt(P.name, We.target.value),
                            class: Ue(["form-textarea", { error: Ae.value[P.name] }]),
                            disabled: Fe.value,
                            rows: "3"
                          }, null, 42, hy)) : P.type === "select" ? (x(), A("select", {
                            key: 3,
                            id: `form-${P.name}`,
                            required: P.required,
                            value: me.value[P.name] || "",
                            onChange: (We) => Nt(P.name, We.target.value),
                            class: Ue(["form-select", { error: Ae.value[P.name] }]),
                            disabled: Fe.value
                          }, [
                            v("option", py, J(P.placeholder || "Select an option"), 1),
                            (x(!0), A(ze, null, gt((Array.isArray(P.options) ? P.options : ((Kt = P.options) == null ? void 0 : Kt.split(`
`)) || []).filter((We) => We.trim()), (We) => (x(), A("option", {
                              key: We.trim(),
                              value: We.trim()
                            }, J(We.trim()), 9, gy))), 128))
                          ], 42, dy)) : P.type === "checkbox" ? (x(), A("div", my, [
                            v("input", {
                              id: `form-${P.name}`,
                              type: "checkbox",
                              checked: me.value[P.name] || !1,
                              onChange: (We) => Nt(P.name, We.target.checked),
                              class: "form-checkbox",
                              disabled: Fe.value
                            }, null, 40, _y),
                            v("label", {
                              for: `form-${P.name}`,
                              class: "checkbox-label"
                            }, J(P.placeholder || P.label), 9, yy)
                          ])) : P.type === "radio" ? (x(), A("div", vy, [
                            (x(!0), A(ze, null, gt((Array.isArray(P.options) ? P.options : ((ki = P.options) == null ? void 0 : ki.split(`
`)) || []).filter((We) => We.trim()), (We) => (x(), A("div", {
                              key: We.trim(),
                              class: "radio-option"
                            }, [
                              v("input", {
                                id: `form-${P.name}-${We.trim()}`,
                                name: `form-${P.name}`,
                                type: "radio",
                                value: We.trim(),
                                checked: me.value[P.name] === We.trim(),
                                onChange: (Uv) => Nt(P.name, We.trim()),
                                class: "form-radio",
                                disabled: Fe.value
                              }, null, 40, by),
                              v("label", {
                                for: `form-${P.name}-${We.trim()}`,
                                class: "radio-label"
                              }, J(We.trim()), 9, wy)
                            ]))), 128))
                          ])) : se("", !0),
                          Ae.value[P.name] ? (x(), A("div", ky, J(Ae.value[P.name]), 1)) : se("", !0)
                        ]);
                      }), 128))
                    ]),
                    v("div", xy, [
                      v("button", {
                        onClick: () => {
                          var P;
                          console.log("Regular form submit button clicked!"), _u((P = u.attributes) == null ? void 0 : P.form_data);
                        },
                        disabled: Fe.value,
                        class: "form-submit-button",
                        style: Ee(C(Ce))
                      }, J(Fe.value ? "Submitting..." : ((ga = (pa = u.attributes) == null ? void 0 : pa.form_data) == null ? void 0 : ga.submit_button_text) || "Submit"), 13, Ty)
                    ])
                  ])) : u.message_type === "user_input" ? (x(), A("div", Ay, [
                    (ma = u.attributes) != null && ma.prompt_message && u.attributes.prompt_message.trim() ? (x(), A("div", Ey, J(u.attributes.prompt_message), 1)) : se("", !0),
                    u.isSubmitted ? (x(), A("div", Iy, [
                      p[35] || (p[35] = v("strong", null, "Your input:", -1)),
                      hn(" " + J(u.submittedValue) + " ", 1),
                      (_a = u.attributes) != null && _a.confirmation_message && u.attributes.confirmation_message.trim() ? (x(), A("div", Ly, J(u.attributes.confirmation_message), 1)) : se("", !0)
                    ])) : (x(), A("div", Sy, [
                      In(v("textarea", {
                        "onUpdate:modelValue": (P) => u.userInputValue = P,
                        class: "user-input-textarea",
                        placeholder: "Type your message here...",
                        rows: "3",
                        onKeydown: [
                          Sr(Zn((P) => pi(u), ["ctrl"]), ["enter"]),
                          Sr(Zn((P) => pi(u), ["meta"]), ["enter"])
                        ]
                      }, null, 40, Cy), [
                        [Yn, u.userInputValue]
                      ]),
                      v("button", {
                        class: "user-input-submit-button",
                        onClick: (P) => pi(u),
                        disabled: !u.userInputValue || !u.userInputValue.trim()
                      }, " Submit ", 8, Ry)
                    ]))
                  ])) : u.shopify_output || u.message_type === "product" ? (x(), A("div", Oy, [
                    u.message ? (x(), A("div", {
                      key: 0,
                      innerHTML: C(Ir)(((va = (ya = u.shopify_output) == null ? void 0 : ya.products) == null ? void 0 : va.length) > 0 ? wu(u.message) : u.message),
                      class: "product-message-text"
                    }, null, 8, Ny)) : se("", !0),
                    (ba = u.shopify_output) != null && ba.products && u.shopify_output.products.length > 0 ? (x(), A("div", My, [
                      p[37] || (p[37] = v("h3", { class: "carousel-title" }, "Products", -1)),
                      v("div", Py, [
                        (x(!0), A(ze, null, gt(u.shopify_output.products, (P) => {
                          var Kt;
                          return x(), A("div", {
                            key: P.id,
                            class: "product-card-compact carousel-item"
                          }, [
                            (Kt = P.image) != null && Kt.src ? (x(), A("div", Fy, [
                              v("img", {
                                src: P.image.src,
                                alt: P.title,
                                class: "product-thumbnail"
                              }, null, 8, Dy)
                            ])) : se("", !0),
                            v("div", By, [
                              v("div", $y, [
                                v("div", Uy, J(P.title), 1),
                                P.variant_title && P.variant_title !== "Default Title" ? (x(), A("div", zy, J(P.variant_title), 1)) : se("", !0),
                                v("div", Hy, J(P.price_formatted || C(a)(P.price, P.currency)), 1)
                              ]),
                              v("div", Wy, [
                                v("button", {
                                  class: "view-details-button-compact",
                                  onClick: (ki) => {
                                    var We;
                                    return bu(P, (We = u.shopify_output) == null ? void 0 : We.shop_domain);
                                  }
                                }, p[36] || (p[36] = [
                                  hn(" View product ", -1),
                                  v("span", { class: "external-link-icon" }, "↗", -1)
                                ]), 8, qy)
                              ])
                            ])
                          ]);
                        }), 128))
                      ])
                    ])) : !u.message && ((wa = u.shopify_output) != null && wa.products) && u.shopify_output.products.length === 0 ? (x(), A("div", jy, p[38] || (p[38] = [
                      v("p", null, "No products found.", -1)
                    ]))) : !u.message && u.shopify_output && !u.shopify_output.products ? (x(), A("div", Vy, p[39] || (p[39] = [
                      v("p", null, "No products to display.", -1)
                    ]))) : se("", !0)
                  ])) : (x(), A(ze, { key: 4 }, [
                    C(st)(ee) ? (x(), A("div", {
                      key: 0,
                      class: "message-streaming",
                      innerHTML: C(Ir)(C(ae)(ee, u.message))
                    }, null, 8, Ky)) : (x(), A("div", {
                      key: 1,
                      innerHTML: C(Ir)(u.message)
                    }, null, 8, Gy)),
                    u.attachments && u.attachments.length > 0 ? (x(), A("div", Yy, [
                      (x(!0), A(ze, null, gt(u.attachments, (P) => (x(), A("div", {
                        key: P.id,
                        class: "attachment-item"
                      }, [
                        C(Ne)(P.content_type) ? (x(), A("div", Xy, [
                          v("img", {
                            src: C(Ge)(P.file_url),
                            alt: P.filename,
                            class: "attachment-image",
                            onClick: Zn((Kt) => C(zn)({ url: P.file_url, filename: P.filename, type: P.content_type, file_url: C(Ge)(P.file_url), size: void 0 }), ["stop"]),
                            style: { cursor: "pointer" }
                          }, null, 8, Zy),
                          v("div", Jy, [
                            v("a", {
                              href: C(Ge)(P.file_url),
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
                              hn(" " + J(P.filename) + " ", 1),
                              v("span", ev, "(" + J(C(we)(P.file_size)) + ")", 1)
                            ], 8, Qy)
                          ])
                        ])) : (x(), A("a", {
                          key: 1,
                          href: C(Ge)(P.file_url),
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
                          hn(" " + J(P.filename) + " ", 1),
                          v("span", nv, "(" + J(C(we)(P.file_size)) + ")", 1)
                        ], 8, tv))
                      ]))), 128))
                    ])) : se("", !0)
                  ], 64))
                ], 4),
                hr.value && (u.message_type === "bot" || u.message_type === "agent") && u.sources && u.sources.length ? (x(), A("div", sv, [
                  p[42] || (p[42] = v("span", { class: "citation-label" }, "Sources", -1)),
                  (x(!0), A(ze, null, gt(u.sources, (P, Kt) => (x(), A("span", {
                    key: Kt,
                    class: "citation-chip",
                    title: oa(P)
                  }, J(_i(P)), 9, rv))), 128))
                ])) : se("", !0),
                v("div", iv, [
                  u.message_type === "user" ? (x(), A("span", ov, " You ")) : se("", !0)
                ])
              ])
            ], 2);
          }), 128)),
          C(d) ? (x(), A("div", {
            key: 1,
            class: Ue(["typing-indicator", { "reading-indicator": hr.value }])
          }, [
            hr.value ? (x(), A(ze, { key: 0 }, [
              p[43] || (p[43] = v("div", {
                class: "reading-bars",
                "aria-hidden": "true"
              }, [
                v("span"),
                v("span"),
                v("span")
              ], -1)),
              p[44] || (p[44] = v("span", { class: "reading-label" }, "reading knowledge base", -1))
            ], 64)) : (x(), A("div", {
              key: 1,
              class: "cm-typing-bubble",
              style: Ee(C(Qe))
            }, p[45] || (p[45] = [
              v("span", { class: "cm-typing-dot" }, null, -1),
              v("span", { class: "cm-typing-dot" }, null, -1),
              v("span", { class: "cm-typing-dot" }, null, -1)
            ]), 4))
          ], 2)) : se("", !0)
        ], 512), [
          [Wh, !jn.value]
        ]),
        Mu.value ? (x(), A("div", av, [
          (x(!0), A(ze, null, gt(gi.value, (u) => (x(), A("button", {
            key: u,
            type: "button",
            class: "cm-quick-action",
            disabled: !ct.value,
            onClick: (ee) => vs(u)
          }, J(u), 9, lv))), 128))
        ])) : se("", !0),
        !Tn.value && !jn.value ? (x(), A("div", {
          key: 6,
          class: Ue(["chat-input", { "ask-anything-input": Bt.value }])
        }, [
          v("input", {
            ref_key: "fileInputRef",
            ref: S,
            type: "file",
            accept: Mv,
            multiple: "",
            style: { display: "none" },
            onChange: p[7] || (p[7] = //@ts-ignore
            (...u) => C(lt) && C(lt)(...u))
          }, null, 544),
          C(U).length > 0 ? (x(), A("div", cv, [
            (x(!0), A(ze, null, gt(C(U), (u, ee) => (x(), A("div", {
              key: ee,
              class: "file-preview-widget"
            }, [
              v("div", uv, [
                C(or)(u.type) ? (x(), A("img", {
                  key: 0,
                  src: C($e)(u),
                  alt: u.filename,
                  class: "file-preview-image-widget",
                  onClick: Zn((ke) => C(zn)(u), ["stop"]),
                  style: { cursor: "pointer" }
                }, null, 8, fv)) : (x(), A("div", {
                  key: 1,
                  class: "file-preview-icon-widget",
                  onClick: Zn((ke) => C(zn)(u), ["stop"]),
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
                ]), 8, hv))
              ]),
              v("div", dv, [
                v("div", pv, J(u.filename), 1),
                v("div", gv, J(C(we)(u.size)), 1)
              ]),
              v("button", {
                type: "button",
                class: "file-preview-remove-widget",
                onClick: (ke) => C(ir)(ee),
                title: "Remove file"
              }, " × ", 8, mv)
            ]))), 128))
          ])) : se("", !0),
          Zo.value ? (x(), A("div", _v, p[47] || (p[47] = [
            v("div", { class: "upload-spinner-widget" }, null, -1),
            v("span", { class: "upload-text-widget" }, "Uploading files...", -1)
          ]))) : se("", !0),
          v("div", yv, [
            In(v("input", {
              "onUpdate:modelValue": p[8] || (p[8] = (u) => Te.value = u),
              type: "text",
              placeholder: Zt.value,
              onKeypress: bs,
              onInput: Ot,
              onChange: Ot,
              onPaste: p[9] || (p[9] = //@ts-ignore
              (...u) => C(rr) && C(rr)(...u)),
              onDrop: p[10] || (p[10] = //@ts-ignore
              (...u) => C(yt) && C(yt)(...u)),
              onDragover: p[11] || (p[11] = //@ts-ignore
              (...u) => C(Ze) && C(Ze)(...u)),
              onDragleave: p[12] || (p[12] = //@ts-ignore
              (...u) => C(qt) && C(qt)(...u)),
              disabled: !ct.value,
              class: Ue({ disabled: !ct.value, "ask-anything-field": Bt.value })
            }, null, 42, vv), [
              [Yn, Te.value]
            ]),
            ku.value ? (x(), A("button", {
              key: 0,
              type: "button",
              class: "attach-button",
              disabled: Zo.value,
              onClick: p[13] || (p[13] = //@ts-ignore
              (...u) => C(ys) && C(ys)(...u)),
              title: `Attach files (${C(U).length}/${Sl} used) or paste screenshots`
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
            ]), 8, bv)) : se("", !0),
            v("button", {
              class: Ue(["send-button", { "ask-anything-send": Bt.value }]),
              style: Ee(C(Ce)),
              onClick: Jt,
              disabled: !Te.value.trim() && C(U).length === 0 || !ct.value
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
            ]), 14, wv)
          ])
        ], 2)) : Tn.value && !jn.value ? (x(), A("div", kv, [
          v("div", xv, [
            p[50] || (p[50] = v("p", { class: "ended-text" }, "This chat has ended.", -1)),
            v("button", {
              class: "start-new-conversation-button",
              style: Ee(C(Ce)),
              onClick: Ru
            }, " Click here to start a new conversation ", 4)
          ])
        ])) : se("", !0),
        ia.value ? (x(), A("div", {
          key: 8,
          class: "ai-disclaimer",
          style: Ee(C(Ke))
        }, J(C(pl)), 5)) : se("", !0),
        v("div", {
          class: "powered-by",
          style: Ee(C(Ke))
        }, p[51] || (p[51] = [
          Gn('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-df774c9a><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-df774c9a></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-df774c9a></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-df774c9a></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-df774c9a></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-df774c9a><span class="cm-powered-prefix" data-v-df774c9a>Powered by </span><strong class="cm-brand" data-v-df774c9a>ChatterMate</strong></a>', 2)
        ]), 4)
      ], 6)) : se("", !0),
      cr.value ? (x(), A("div", Tv, [
        v("div", Av, [
          p[52] || (p[52] = v("h3", null, "Rate your conversation", -1)),
          v("div", Ev, [
            (x(), A(ze, null, gt(5, (u) => v("button", {
              key: u,
              onClick: (ee) => te.value = u,
              class: Ue([{ active: u <= te.value }, "star-button"])
            }, " ★ ", 10, Sv)), 64))
          ]),
          In(v("textarea", {
            "onUpdate:modelValue": p[14] || (p[14] = (u) => y.value = u),
            placeholder: "Additional feedback (optional)",
            class: "rating-feedback"
          }, null, 512), [
            [Yn, y.value]
          ]),
          v("div", Cv, [
            v("button", {
              onClick: p[15] || (p[15] = (u) => h.submitRating(te.value, y.value)),
              disabled: !te.value,
              class: "submit-button",
              style: Ee(C(Ce))
            }, " Submit ", 12, Rv),
            v("button", {
              onClick: p[16] || (p[16] = (u) => cr.value = !1),
              class: "skip-rating"
            }, " Skip ")
          ])
        ])
      ])) : se("", !0),
      C(Z) ? (x(), A("div", {
        key: 9,
        class: "preview-modal-overlay",
        onClick: p[19] || (p[19] = //@ts-ignore
        (...u) => C(Hn) && C(Hn)(...u))
      }, [
        v("div", {
          class: "preview-modal-content",
          onClick: p[18] || (p[18] = Zn(() => {
          }, ["stop"]))
        }, [
          v("button", {
            class: "preview-modal-close",
            onClick: p[17] || (p[17] = //@ts-ignore
            (...u) => C(Hn) && C(Hn)(...u))
          }, "×"),
          C(Q) && C(or)(C(Q).type) ? (x(), A("div", Iv, [
            v("img", {
              src: C($e)(C(Q)),
              alt: C(Q).filename,
              class: "preview-modal-image"
            }, null, 8, Lv),
            v("div", Ov, J(C(Q).filename), 1)
          ])) : se("", !0)
        ])
      ])) : se("", !0)
    ], 6)) : (x(), A("div", Nv));
  }
}), Fv = /* @__PURE__ */ qo(Pv, [["__scopeId", "data-v-df774c9a"]]);
window.process || (window.process = { env: { NODE_ENV: "production" } });
const Ut = window.__INITIAL_DATA__, lu = new URL(window.location.href), cu = lu.searchParams.get("preview") === "true", uu = (e) => {
  const t = lu.searchParams.get(e);
  if (!(!t || t === "undefined" || t.trim() === ""))
    return t;
}, Dv = cu ? uu("widget_id") || (Ut == null ? void 0 : Ut.widgetId) || void 0 : (Ut == null ? void 0 : Ut.widgetId) || void 0, Bv = cu ? (Ut == null ? void 0 : Ut.initialToken) || uu("token") || void 0 : (Ut == null ? void 0 : Ut.initialToken) || void 0, $v = cd(Fv, {
  widgetId: Dv,
  token: Bv || void 0,
  initialAuthError: null
  // Let backend determine if auth is required
});
$v.mount("#app");
