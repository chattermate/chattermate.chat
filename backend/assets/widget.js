var dc = Object.defineProperty;
var pc = (t, e, n) => e in t ? dc(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n;
var je = (t, e, n) => pc(t, typeof e != "symbol" ? e + "" : e, n);
/**
* @vue/shared v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function ki(t) {
  const e = /* @__PURE__ */ Object.create(null);
  for (const n of t.split(",")) e[n] = 1;
  return (n) => n in e;
}
const Ve = {}, Hn = [], Gt = () => {
}, gc = () => !1, hr = (t) => t.charCodeAt(0) === 111 && t.charCodeAt(1) === 110 && // uppercase letter
(t.charCodeAt(2) > 122 || t.charCodeAt(2) < 97), xi = (t) => t.startsWith("onUpdate:"), _t = Object.assign, Si = (t, e) => {
  const n = t.indexOf(e);
  n > -1 && t.splice(n, 1);
}, mc = Object.prototype.hasOwnProperty, Be = (t, e) => mc.call(t, e), ue = Array.isArray, Wn = (t) => dr(t) === "[object Map]", ca = (t) => dr(t) === "[object Set]", me = (t) => typeof t == "function", at = (t) => typeof t == "string", kn = (t) => typeof t == "symbol", nt = (t) => t !== null && typeof t == "object", ua = (t) => (nt(t) || me(t)) && me(t.then) && me(t.catch), fa = Object.prototype.toString, dr = (t) => fa.call(t), _c = (t) => dr(t).slice(8, -1), ha = (t) => dr(t) === "[object Object]", Ai = (t) => at(t) && t !== "NaN" && t[0] !== "-" && "" + parseInt(t, 10) === t, hs = /* @__PURE__ */ ki(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), pr = (t) => {
  const e = /* @__PURE__ */ Object.create(null);
  return (n) => e[n] || (e[n] = t(n));
}, yc = /-(\w)/g, bn = pr(
  (t) => t.replace(yc, (e, n) => n ? n.toUpperCase() : "")
), bc = /\B([A-Z])/g, xn = pr(
  (t) => t.replace(bc, "-$1").toLowerCase()
), da = pr((t) => t.charAt(0).toUpperCase() + t.slice(1)), Fr = pr(
  (t) => t ? `on${da(t)}` : ""
), mn = (t, e) => !Object.is(t, e), Ks = (t, ...e) => {
  for (let n = 0; n < t.length; n++)
    t[n](...e);
}, Qr = (t, e, n, s = !1) => {
  Object.defineProperty(t, e, {
    configurable: !0,
    enumerable: !1,
    writable: s,
    value: n
  });
}, ei = (t) => {
  const e = parseFloat(t);
  return isNaN(e) ? t : e;
};
let uo;
const gr = () => uo || (uo = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function Ne(t) {
  if (ue(t)) {
    const e = {};
    for (let n = 0; n < t.length; n++) {
      const s = t[n], r = at(s) ? xc(s) : Ne(s);
      if (r)
        for (const o in r)
          e[o] = r[o];
    }
    return e;
  } else if (at(t) || nt(t))
    return t;
}
const vc = /;(?![^(]*\))/g, wc = /:([^]+)/, kc = /\/\*[^]*?\*\//g;
function xc(t) {
  const e = {};
  return t.replace(kc, "").split(vc).forEach((n) => {
    if (n) {
      const s = n.split(wc);
      s.length > 1 && (e[s[0].trim()] = s[1].trim());
    }
  }), e;
}
function Ge(t) {
  let e = "";
  if (at(t))
    e = t;
  else if (ue(t))
    for (let n = 0; n < t.length; n++) {
      const s = Ge(t[n]);
      s && (e += s + " ");
    }
  else if (nt(t))
    for (const n in t)
      t[n] && (e += n + " ");
  return e.trim();
}
const Sc = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", Ac = /* @__PURE__ */ ki(Sc);
function pa(t) {
  return !!t || t === "";
}
const ga = (t) => !!(t && t.__v_isRef === !0), ae = (t) => at(t) ? t : t == null ? "" : ue(t) || nt(t) && (t.toString === fa || !me(t.toString)) ? ga(t) ? ae(t.value) : JSON.stringify(t, ma, 2) : String(t), ma = (t, e) => ga(e) ? ma(t, e.value) : Wn(e) ? {
  [`Map(${e.size})`]: [...e.entries()].reduce(
    (n, [s, r], o) => (n[Pr(s, o) + " =>"] = r, n),
    {}
  )
} : ca(e) ? {
  [`Set(${e.size})`]: [...e.values()].map((n) => Pr(n))
} : kn(e) ? Pr(e) : nt(e) && !ue(e) && !ha(e) ? String(e) : e, Pr = (t, e = "") => {
  var n;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    kn(t) ? `Symbol(${(n = t.description) != null ? n : e})` : t
  );
};
/**
* @vue/reactivity v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let Et;
class Tc {
  constructor(e = !1) {
    this.detached = e, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this.parent = Et, !e && Et && (this.index = (Et.scopes || (Et.scopes = [])).push(
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
      const n = Et;
      try {
        return Et = this, e();
      } finally {
        Et = n;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = Et, Et = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    this._on > 0 && --this._on === 0 && (Et = this.prevScope, this.prevScope = void 0);
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
function Ec() {
  return Et;
}
let Ye;
const Dr = /* @__PURE__ */ new WeakSet();
class _a {
  constructor(e) {
    this.fn = e, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, Et && Et.active && Et.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, Dr.has(this) && (Dr.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || ba(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, fo(this), va(this);
    const e = Ye, n = Ht;
    Ye = this, Ht = !0;
    try {
      return this.fn();
    } finally {
      wa(this), Ye = e, Ht = n, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let e = this.deps; e; e = e.nextDep)
        Ci(e);
      this.deps = this.depsTail = void 0, fo(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? Dr.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    ti(this) && this.run();
  }
  get dirty() {
    return ti(this);
  }
}
let ya = 0, ds, ps;
function ba(t, e = !1) {
  if (t.flags |= 8, e) {
    t.next = ps, ps = t;
    return;
  }
  t.next = ds, ds = t;
}
function Ti() {
  ya++;
}
function Ei() {
  if (--ya > 0)
    return;
  if (ps) {
    let e = ps;
    for (ps = void 0; e; ) {
      const n = e.next;
      e.next = void 0, e.flags &= -9, e = n;
    }
  }
  let t;
  for (; ds; ) {
    let e = ds;
    for (ds = void 0; e; ) {
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
function va(t) {
  for (let e = t.deps; e; e = e.nextDep)
    e.version = -1, e.prevActiveLink = e.dep.activeLink, e.dep.activeLink = e;
}
function wa(t) {
  let e, n = t.depsTail, s = n;
  for (; s; ) {
    const r = s.prevDep;
    s.version === -1 ? (s === n && (n = r), Ci(s), Cc(s)) : e = s, s.dep.activeLink = s.prevActiveLink, s.prevActiveLink = void 0, s = r;
  }
  t.deps = e, t.depsTail = n;
}
function ti(t) {
  for (let e = t.deps; e; e = e.nextDep)
    if (e.dep.version !== e.version || e.dep.computed && (ka(e.dep.computed) || e.dep.version !== e.version))
      return !0;
  return !!t._dirty;
}
function ka(t) {
  if (t.flags & 4 && !(t.flags & 16) || (t.flags &= -17, t.globalVersion === vs) || (t.globalVersion = vs, !t.isSSR && t.flags & 128 && (!t.deps && !t._dirty || !ti(t))))
    return;
  t.flags |= 2;
  const e = t.dep, n = Ye, s = Ht;
  Ye = t, Ht = !0;
  try {
    va(t);
    const r = t.fn(t._value);
    (e.version === 0 || mn(r, t._value)) && (t.flags |= 128, t._value = r, e.version++);
  } catch (r) {
    throw e.version++, r;
  } finally {
    Ye = n, Ht = s, wa(t), t.flags &= -3;
  }
}
function Ci(t, e = !1) {
  const { dep: n, prevSub: s, nextSub: r } = t;
  if (s && (s.nextSub = r, t.prevSub = void 0), r && (r.prevSub = s, t.nextSub = void 0), n.subs === t && (n.subs = s, !s && n.computed)) {
    n.computed.flags &= -5;
    for (let o = n.computed.deps; o; o = o.nextDep)
      Ci(o, !0);
  }
  !e && !--n.sc && n.map && n.map.delete(n.key);
}
function Cc(t) {
  const { prevDep: e, nextDep: n } = t;
  e && (e.nextDep = n, t.prevDep = void 0), n && (n.prevDep = e, t.nextDep = void 0);
}
let Ht = !0;
const xa = [];
function an() {
  xa.push(Ht), Ht = !1;
}
function ln() {
  const t = xa.pop();
  Ht = t === void 0 ? !0 : t;
}
function fo(t) {
  const { cleanup: e } = t;
  if (t.cleanup = void 0, e) {
    const n = Ye;
    Ye = void 0;
    try {
      e();
    } finally {
      Ye = n;
    }
  }
}
let vs = 0;
class Rc {
  constructor(e, n) {
    this.sub = e, this.dep = n, this.version = n.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Ri {
  // TODO isolatedDeclarations "__v_skip"
  constructor(e) {
    this.computed = e, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(e) {
    if (!Ye || !Ht || Ye === this.computed)
      return;
    let n = this.activeLink;
    if (n === void 0 || n.sub !== Ye)
      n = this.activeLink = new Rc(Ye, this), Ye.deps ? (n.prevDep = Ye.depsTail, Ye.depsTail.nextDep = n, Ye.depsTail = n) : Ye.deps = Ye.depsTail = n, Sa(n);
    else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
      const s = n.nextDep;
      s.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = s), n.prevDep = Ye.depsTail, n.nextDep = void 0, Ye.depsTail.nextDep = n, Ye.depsTail = n, Ye.deps === n && (Ye.deps = s);
    }
    return n;
  }
  trigger(e) {
    this.version++, vs++, this.notify(e);
  }
  notify(e) {
    Ti();
    try {
      for (let n = this.subs; n; n = n.prevSub)
        n.sub.notify() && n.sub.dep.notify();
    } finally {
      Ei();
    }
  }
}
function Sa(t) {
  if (t.dep.sc++, t.sub.flags & 4) {
    const e = t.dep.computed;
    if (e && !t.dep.subs) {
      e.flags |= 20;
      for (let s = e.deps; s; s = s.nextDep)
        Sa(s);
    }
    const n = t.dep.subs;
    n !== t && (t.prevSub = n, n && (n.nextSub = t)), t.dep.subs = t;
  }
}
const ni = /* @__PURE__ */ new WeakMap(), Fn = Symbol(
  ""
), si = Symbol(
  ""
), ws = Symbol(
  ""
);
function gt(t, e, n) {
  if (Ht && Ye) {
    let s = ni.get(t);
    s || ni.set(t, s = /* @__PURE__ */ new Map());
    let r = s.get(n);
    r || (s.set(n, r = new Ri()), r.map = s, r.key = n), r.track();
  }
}
function nn(t, e, n, s, r, o) {
  const i = ni.get(t);
  if (!i) {
    vs++;
    return;
  }
  const a = (l) => {
    l && l.trigger();
  };
  if (Ti(), e === "clear")
    i.forEach(a);
  else {
    const l = ue(t), c = l && Ai(n);
    if (l && n === "length") {
      const u = Number(s);
      i.forEach((y, p) => {
        (p === "length" || p === ws || !kn(p) && p >= u) && a(y);
      });
    } else
      switch ((n !== void 0 || i.has(void 0)) && a(i.get(n)), c && a(i.get(ws)), e) {
        case "add":
          l ? c && a(i.get("length")) : (a(i.get(Fn)), Wn(t) && a(i.get(si)));
          break;
        case "delete":
          l || (a(i.get(Fn)), Wn(t) && a(i.get(si)));
          break;
        case "set":
          Wn(t) && a(i.get(Fn));
          break;
      }
  }
  Ei();
}
function Nn(t) {
  const e = Me(t);
  return e === t ? e : (gt(e, "iterate", ws), Mt(t) ? e : e.map(dt));
}
function mr(t) {
  return gt(t = Me(t), "iterate", ws), t;
}
const Ic = {
  __proto__: null,
  [Symbol.iterator]() {
    return Nr(this, Symbol.iterator, dt);
  },
  concat(...t) {
    return Nn(this).concat(
      ...t.map((e) => ue(e) ? Nn(e) : e)
    );
  },
  entries() {
    return Nr(this, "entries", (t) => (t[1] = dt(t[1]), t));
  },
  every(t, e) {
    return Jt(this, "every", t, e, void 0, arguments);
  },
  filter(t, e) {
    return Jt(this, "filter", t, e, (n) => n.map(dt), arguments);
  },
  find(t, e) {
    return Jt(this, "find", t, e, dt, arguments);
  },
  findIndex(t, e) {
    return Jt(this, "findIndex", t, e, void 0, arguments);
  },
  findLast(t, e) {
    return Jt(this, "findLast", t, e, dt, arguments);
  },
  findLastIndex(t, e) {
    return Jt(this, "findLastIndex", t, e, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(t, e) {
    return Jt(this, "forEach", t, e, void 0, arguments);
  },
  includes(...t) {
    return Mr(this, "includes", t);
  },
  indexOf(...t) {
    return Mr(this, "indexOf", t);
  },
  join(t) {
    return Nn(this).join(t);
  },
  // keys() iterator only reads `length`, no optimisation required
  lastIndexOf(...t) {
    return Mr(this, "lastIndexOf", t);
  },
  map(t, e) {
    return Jt(this, "map", t, e, void 0, arguments);
  },
  pop() {
    return Qn(this, "pop");
  },
  push(...t) {
    return Qn(this, "push", t);
  },
  reduce(t, ...e) {
    return ho(this, "reduce", t, e);
  },
  reduceRight(t, ...e) {
    return ho(this, "reduceRight", t, e);
  },
  shift() {
    return Qn(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(t, e) {
    return Jt(this, "some", t, e, void 0, arguments);
  },
  splice(...t) {
    return Qn(this, "splice", t);
  },
  toReversed() {
    return Nn(this).toReversed();
  },
  toSorted(t) {
    return Nn(this).toSorted(t);
  },
  toSpliced(...t) {
    return Nn(this).toSpliced(...t);
  },
  unshift(...t) {
    return Qn(this, "unshift", t);
  },
  values() {
    return Nr(this, "values", dt);
  }
};
function Nr(t, e, n) {
  const s = mr(t), r = s[e]();
  return s !== t && !Mt(t) && (r._next = r.next, r.next = () => {
    const o = r._next();
    return o.value && (o.value = n(o.value)), o;
  }), r;
}
const Lc = Array.prototype;
function Jt(t, e, n, s, r, o) {
  const i = mr(t), a = i !== t && !Mt(t), l = i[e];
  if (l !== Lc[e]) {
    const y = l.apply(t, o);
    return a ? dt(y) : y;
  }
  let c = n;
  i !== t && (a ? c = function(y, p) {
    return n.call(this, dt(y), p, t);
  } : n.length > 2 && (c = function(y, p) {
    return n.call(this, y, p, t);
  }));
  const u = l.call(i, c, s);
  return a && r ? r(u) : u;
}
function ho(t, e, n, s) {
  const r = mr(t);
  let o = n;
  return r !== t && (Mt(t) ? n.length > 3 && (o = function(i, a, l) {
    return n.call(this, i, a, l, t);
  }) : o = function(i, a, l) {
    return n.call(this, i, dt(a), l, t);
  }), r[e](o, ...s);
}
function Mr(t, e, n) {
  const s = Me(t);
  gt(s, "iterate", ws);
  const r = s[e](...n);
  return (r === -1 || r === !1) && Fi(n[0]) ? (n[0] = Me(n[0]), s[e](...n)) : r;
}
function Qn(t, e, n = []) {
  an(), Ti();
  const s = Me(t)[e].apply(t, n);
  return Ei(), ln(), s;
}
const Oc = /* @__PURE__ */ ki("__proto__,__v_isRef,__isVue"), Aa = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((t) => t !== "arguments" && t !== "caller").map((t) => Symbol[t]).filter(kn)
);
function Fc(t) {
  kn(t) || (t = String(t));
  const e = Me(this);
  return gt(e, "has", t), e.hasOwnProperty(t);
}
class Ta {
  constructor(e = !1, n = !1) {
    this._isReadonly = e, this._isShallow = n;
  }
  get(e, n, s) {
    if (n === "__v_skip") return e.__v_skip;
    const r = this._isReadonly, o = this._isShallow;
    if (n === "__v_isReactive")
      return !r;
    if (n === "__v_isReadonly")
      return r;
    if (n === "__v_isShallow")
      return o;
    if (n === "__v_raw")
      return s === (r ? o ? qc : Ia : o ? Ra : Ca).get(e) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(e) === Object.getPrototypeOf(s) ? e : void 0;
    const i = ue(e);
    if (!r) {
      let l;
      if (i && (l = Ic[n]))
        return l;
      if (n === "hasOwnProperty")
        return Fc;
    }
    const a = Reflect.get(
      e,
      n,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      mt(e) ? e : s
    );
    return (kn(n) ? Aa.has(n) : Oc(n)) || (r || gt(e, "get", n), o) ? a : mt(a) ? i && Ai(n) ? a : a.value : nt(a) ? r ? La(a) : Li(a) : a;
  }
}
class Ea extends Ta {
  constructor(e = !1) {
    super(!1, e);
  }
  set(e, n, s, r) {
    let o = e[n];
    if (!this._isShallow) {
      const l = vn(o);
      if (!Mt(s) && !vn(s) && (o = Me(o), s = Me(s)), !ue(e) && mt(o) && !mt(s))
        return l ? !1 : (o.value = s, !0);
    }
    const i = ue(e) && Ai(n) ? Number(n) < e.length : Be(e, n), a = Reflect.set(
      e,
      n,
      s,
      mt(e) ? e : r
    );
    return e === Me(r) && (i ? mn(s, o) && nn(e, "set", n, s) : nn(e, "add", n, s)), a;
  }
  deleteProperty(e, n) {
    const s = Be(e, n);
    e[n];
    const r = Reflect.deleteProperty(e, n);
    return r && s && nn(e, "delete", n, void 0), r;
  }
  has(e, n) {
    const s = Reflect.has(e, n);
    return (!kn(n) || !Aa.has(n)) && gt(e, "has", n), s;
  }
  ownKeys(e) {
    return gt(
      e,
      "iterate",
      ue(e) ? "length" : Fn
    ), Reflect.ownKeys(e);
  }
}
class Pc extends Ta {
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
const Dc = /* @__PURE__ */ new Ea(), Nc = /* @__PURE__ */ new Pc(), Mc = /* @__PURE__ */ new Ea(!0);
const ri = (t) => t, Ms = (t) => Reflect.getPrototypeOf(t);
function Bc(t, e, n) {
  return function(...s) {
    const r = this.__v_raw, o = Me(r), i = Wn(o), a = t === "entries" || t === Symbol.iterator && i, l = t === "keys" && i, c = r[t](...s), u = n ? ri : e ? sr : dt;
    return !e && gt(
      o,
      "iterate",
      l ? si : Fn
    ), {
      // iterator protocol
      next() {
        const { value: y, done: p } = c.next();
        return p ? { value: y, done: p } : {
          value: a ? [u(y[0]), u(y[1])] : u(y),
          done: p
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function Bs(t) {
  return function(...e) {
    return t === "delete" ? !1 : t === "clear" ? void 0 : this;
  };
}
function Uc(t, e) {
  const n = {
    get(r) {
      const o = this.__v_raw, i = Me(o), a = Me(r);
      t || (mn(r, a) && gt(i, "get", r), gt(i, "get", a));
      const { has: l } = Ms(i), c = e ? ri : t ? sr : dt;
      if (l.call(i, r))
        return c(o.get(r));
      if (l.call(i, a))
        return c(o.get(a));
      o !== i && o.get(r);
    },
    get size() {
      const r = this.__v_raw;
      return !t && gt(Me(r), "iterate", Fn), Reflect.get(r, "size", r);
    },
    has(r) {
      const o = this.__v_raw, i = Me(o), a = Me(r);
      return t || (mn(r, a) && gt(i, "has", r), gt(i, "has", a)), r === a ? o.has(r) : o.has(r) || o.has(a);
    },
    forEach(r, o) {
      const i = this, a = i.__v_raw, l = Me(a), c = e ? ri : t ? sr : dt;
      return !t && gt(l, "iterate", Fn), a.forEach((u, y) => r.call(o, c(u), c(y), i));
    }
  };
  return _t(
    n,
    t ? {
      add: Bs("add"),
      set: Bs("set"),
      delete: Bs("delete"),
      clear: Bs("clear")
    } : {
      add(r) {
        !e && !Mt(r) && !vn(r) && (r = Me(r));
        const o = Me(this);
        return Ms(o).has.call(o, r) || (o.add(r), nn(o, "add", r, r)), this;
      },
      set(r, o) {
        !e && !Mt(o) && !vn(o) && (o = Me(o));
        const i = Me(this), { has: a, get: l } = Ms(i);
        let c = a.call(i, r);
        c || (r = Me(r), c = a.call(i, r));
        const u = l.call(i, r);
        return i.set(r, o), c ? mn(o, u) && nn(i, "set", r, o) : nn(i, "add", r, o), this;
      },
      delete(r) {
        const o = Me(this), { has: i, get: a } = Ms(o);
        let l = i.call(o, r);
        l || (r = Me(r), l = i.call(o, r)), a && a.call(o, r);
        const c = o.delete(r);
        return l && nn(o, "delete", r, void 0), c;
      },
      clear() {
        const r = Me(this), o = r.size !== 0, i = r.clear();
        return o && nn(
          r,
          "clear",
          void 0,
          void 0
        ), i;
      }
    }
  ), [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ].forEach((r) => {
    n[r] = Bc(r, t, e);
  }), n;
}
function Ii(t, e) {
  const n = Uc(t, e);
  return (s, r, o) => r === "__v_isReactive" ? !t : r === "__v_isReadonly" ? t : r === "__v_raw" ? s : Reflect.get(
    Be(n, r) && r in s ? n : s,
    r,
    o
  );
}
const zc = {
  get: /* @__PURE__ */ Ii(!1, !1)
}, Hc = {
  get: /* @__PURE__ */ Ii(!1, !0)
}, Wc = {
  get: /* @__PURE__ */ Ii(!0, !1)
};
const Ca = /* @__PURE__ */ new WeakMap(), Ra = /* @__PURE__ */ new WeakMap(), Ia = /* @__PURE__ */ new WeakMap(), qc = /* @__PURE__ */ new WeakMap();
function jc(t) {
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
function Vc(t) {
  return t.__v_skip || !Object.isExtensible(t) ? 0 : jc(_c(t));
}
function Li(t) {
  return vn(t) ? t : Oi(
    t,
    !1,
    Dc,
    zc,
    Ca
  );
}
function Kc(t) {
  return Oi(
    t,
    !1,
    Mc,
    Hc,
    Ra
  );
}
function La(t) {
  return Oi(
    t,
    !0,
    Nc,
    Wc,
    Ia
  );
}
function Oi(t, e, n, s, r) {
  if (!nt(t) || t.__v_raw && !(e && t.__v_isReactive))
    return t;
  const o = Vc(t);
  if (o === 0)
    return t;
  const i = r.get(t);
  if (i)
    return i;
  const a = new Proxy(
    t,
    o === 2 ? s : n
  );
  return r.set(t, a), a;
}
function qn(t) {
  return vn(t) ? qn(t.__v_raw) : !!(t && t.__v_isReactive);
}
function vn(t) {
  return !!(t && t.__v_isReadonly);
}
function Mt(t) {
  return !!(t && t.__v_isShallow);
}
function Fi(t) {
  return t ? !!t.__v_raw : !1;
}
function Me(t) {
  const e = t && t.__v_raw;
  return e ? Me(e) : t;
}
function Gc(t) {
  return !Be(t, "__v_skip") && Object.isExtensible(t) && Qr(t, "__v_skip", !0), t;
}
const dt = (t) => nt(t) ? Li(t) : t, sr = (t) => nt(t) ? La(t) : t;
function mt(t) {
  return t ? t.__v_isRef === !0 : !1;
}
function ge(t) {
  return Yc(t, !1);
}
function Yc(t, e) {
  return mt(t) ? t : new $c(t, e);
}
class $c {
  constructor(e, n) {
    this.dep = new Ri(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? e : Me(e), this._value = n ? e : dt(e), this.__v_isShallow = n;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(e) {
    const n = this._rawValue, s = this.__v_isShallow || Mt(e) || vn(e);
    e = s ? e : Me(e), mn(e, n) && (this._rawValue = e, this._value = s ? e : dt(e), this.dep.trigger());
  }
}
function Xc(t) {
  return mt(t) ? t.value : t;
}
const Zc = {
  get: (t, e, n) => e === "__v_raw" ? t : Xc(Reflect.get(t, e, n)),
  set: (t, e, n, s) => {
    const r = t[e];
    return mt(r) && !mt(n) ? (r.value = n, !0) : Reflect.set(t, e, n, s);
  }
};
function Oa(t) {
  return qn(t) ? t : new Proxy(t, Zc);
}
class Jc {
  constructor(e, n, s) {
    this.fn = e, this.setter = n, this._value = void 0, this.dep = new Ri(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = vs - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = s;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    Ye !== this)
      return ba(this, !0), !0;
  }
  get value() {
    const e = this.dep.track();
    return ka(this), e && (e.version = this.dep.version), this._value;
  }
  set value(e) {
    this.setter && this.setter(e);
  }
}
function Qc(t, e, n = !1) {
  let s, r;
  return me(t) ? s = t : (s = t.get, r = t.set), new Jc(s, r, n);
}
const Us = {}, rr = /* @__PURE__ */ new WeakMap();
let Ln;
function eu(t, e = !1, n = Ln) {
  if (n) {
    let s = rr.get(n);
    s || rr.set(n, s = []), s.push(t);
  }
}
function tu(t, e, n = Ve) {
  const { immediate: s, deep: r, once: o, scheduler: i, augmentJob: a, call: l } = n, c = (U) => r ? U : Mt(U) || r === !1 || r === 0 ? sn(U, 1) : sn(U);
  let u, y, p, L, B = !1, V = !1;
  if (mt(t) ? (y = () => t.value, B = Mt(t)) : qn(t) ? (y = () => c(t), B = !0) : ue(t) ? (V = !0, B = t.some((U) => qn(U) || Mt(U)), y = () => t.map((U) => {
    if (mt(U))
      return U.value;
    if (qn(U))
      return c(U);
    if (me(U))
      return l ? l(U, 2) : U();
  })) : me(t) ? e ? y = l ? () => l(t, 2) : t : y = () => {
    if (p) {
      an();
      try {
        p();
      } finally {
        ln();
      }
    }
    const U = Ln;
    Ln = u;
    try {
      return l ? l(t, 3, [L]) : t(L);
    } finally {
      Ln = U;
    }
  } : y = Gt, e && r) {
    const U = y, z = r === !0 ? 1 / 0 : r;
    y = () => sn(U(), z);
  }
  const Te = Ec(), se = () => {
    u.stop(), Te && Te.active && Si(Te.effects, u);
  };
  if (o && e) {
    const U = e;
    e = (...z) => {
      U(...z), se();
    };
  }
  let ce = V ? new Array(t.length).fill(Us) : Us;
  const he = (U) => {
    if (!(!(u.flags & 1) || !u.dirty && !U))
      if (e) {
        const z = u.run();
        if (r || B || (V ? z.some(($, Y) => mn($, ce[Y])) : mn(z, ce))) {
          p && p();
          const $ = Ln;
          Ln = u;
          try {
            const Y = [
              z,
              // pass undefined as the old value when it's changed for the first time
              ce === Us ? void 0 : V && ce[0] === Us ? [] : ce,
              L
            ];
            ce = z, l ? l(e, 3, Y) : (
              // @ts-expect-error
              e(...Y)
            );
          } finally {
            Ln = $;
          }
        }
      } else
        u.run();
  };
  return a && a(he), u = new _a(y), u.scheduler = i ? () => i(he, !1) : he, L = (U) => eu(U, !1, u), p = u.onStop = () => {
    const U = rr.get(u);
    if (U) {
      if (l)
        l(U, 4);
      else
        for (const z of U) z();
      rr.delete(u);
    }
  }, e ? s ? he(!0) : ce = u.run() : i ? i(he.bind(null, !0), !0) : u.run(), se.pause = u.pause.bind(u), se.resume = u.resume.bind(u), se.stop = se, se;
}
function sn(t, e = 1 / 0, n) {
  if (e <= 0 || !nt(t) || t.__v_skip || (n = n || /* @__PURE__ */ new Set(), n.has(t)))
    return t;
  if (n.add(t), e--, mt(t))
    sn(t.value, e, n);
  else if (ue(t))
    for (let s = 0; s < t.length; s++)
      sn(t[s], e, n);
  else if (ca(t) || Wn(t))
    t.forEach((s) => {
      sn(s, e, n);
    });
  else if (ha(t)) {
    for (const s in t)
      sn(t[s], e, n);
    for (const s of Object.getOwnPropertySymbols(t))
      Object.prototype.propertyIsEnumerable.call(t, s) && sn(t[s], e, n);
  }
  return t;
}
/**
* @vue/runtime-core v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function As(t, e, n, s) {
  try {
    return s ? t(...s) : t();
  } catch (r) {
    _r(r, e, n);
  }
}
function Xt(t, e, n, s) {
  if (me(t)) {
    const r = As(t, e, n, s);
    return r && ua(r) && r.catch((o) => {
      _r(o, e, n);
    }), r;
  }
  if (ue(t)) {
    const r = [];
    for (let o = 0; o < t.length; o++)
      r.push(Xt(t[o], e, n, s));
    return r;
  }
}
function _r(t, e, n, s = !0) {
  const r = e ? e.vnode : null, { errorHandler: o, throwUnhandledErrorInProduction: i } = e && e.appContext.config || Ve;
  if (e) {
    let a = e.parent;
    const l = e.proxy, c = `https://vuejs.org/error-reference/#runtime-${n}`;
    for (; a; ) {
      const u = a.ec;
      if (u) {
        for (let y = 0; y < u.length; y++)
          if (u[y](t, l, c) === !1)
            return;
      }
      a = a.parent;
    }
    if (o) {
      an(), As(o, null, 10, [
        t,
        l,
        c
      ]), ln();
      return;
    }
  }
  nu(t, n, r, s, i);
}
function nu(t, e, n, s = !0, r = !1) {
  if (r)
    throw t;
  console.error(t);
}
const kt = [];
let Vt = -1;
const jn = [];
let pn = null, Un = 0;
const Fa = /* @__PURE__ */ Promise.resolve();
let ir = null;
function Pa(t) {
  const e = ir || Fa;
  return t ? e.then(this ? t.bind(this) : t) : e;
}
function su(t) {
  let e = Vt + 1, n = kt.length;
  for (; e < n; ) {
    const s = e + n >>> 1, r = kt[s], o = ks(r);
    o < t || o === t && r.flags & 2 ? e = s + 1 : n = s;
  }
  return e;
}
function Pi(t) {
  if (!(t.flags & 1)) {
    const e = ks(t), n = kt[kt.length - 1];
    !n || // fast path when the job id is larger than the tail
    !(t.flags & 2) && e >= ks(n) ? kt.push(t) : kt.splice(su(e), 0, t), t.flags |= 1, Da();
  }
}
function Da() {
  ir || (ir = Fa.then(Ma));
}
function ru(t) {
  ue(t) ? jn.push(...t) : pn && t.id === -1 ? pn.splice(Un + 1, 0, t) : t.flags & 1 || (jn.push(t), t.flags |= 1), Da();
}
function po(t, e, n = Vt + 1) {
  for (; n < kt.length; n++) {
    const s = kt[n];
    if (s && s.flags & 2) {
      if (t && s.id !== t.uid)
        continue;
      kt.splice(n, 1), n--, s.flags & 4 && (s.flags &= -2), s(), s.flags & 4 || (s.flags &= -2);
    }
  }
}
function Na(t) {
  if (jn.length) {
    const e = [...new Set(jn)].sort(
      (n, s) => ks(n) - ks(s)
    );
    if (jn.length = 0, pn) {
      pn.push(...e);
      return;
    }
    for (pn = e, Un = 0; Un < pn.length; Un++) {
      const n = pn[Un];
      n.flags & 4 && (n.flags &= -2), n.flags & 8 || n(), n.flags &= -2;
    }
    pn = null, Un = 0;
  }
}
const ks = (t) => t.id == null ? t.flags & 2 ? -1 : 1 / 0 : t.id;
function Ma(t) {
  try {
    for (Vt = 0; Vt < kt.length; Vt++) {
      const e = kt[Vt];
      e && !(e.flags & 8) && (e.flags & 4 && (e.flags &= -2), As(
        e,
        e.i,
        e.i ? 15 : 14
      ), e.flags & 4 || (e.flags &= -2));
    }
  } finally {
    for (; Vt < kt.length; Vt++) {
      const e = kt[Vt];
      e && (e.flags &= -2);
    }
    Vt = -1, kt.length = 0, Na(), ir = null, (kt.length || jn.length) && Ma();
  }
}
let Nt = null, Ba = null;
function or(t) {
  const e = Nt;
  return Nt = t, Ba = t && t.type.__scopeId || null, e;
}
function iu(t, e = Nt, n) {
  if (!e || t._n)
    return t;
  const s = (...r) => {
    s._d && xo(-1);
    const o = or(e);
    let i;
    try {
      i = t(...r);
    } finally {
      or(o), s._d && xo(1);
    }
    return i;
  };
  return s._n = !0, s._c = !0, s._d = !0, s;
}
function Tn(t, e) {
  if (Nt === null)
    return t;
  const n = wr(Nt), s = t.dirs || (t.dirs = []);
  for (let r = 0; r < e.length; r++) {
    let [o, i, a, l = Ve] = e[r];
    o && (me(o) && (o = {
      mounted: o,
      updated: o
    }), o.deep && sn(i), s.push({
      dir: o,
      instance: n,
      value: i,
      oldValue: void 0,
      arg: a,
      modifiers: l
    }));
  }
  return t;
}
function En(t, e, n, s) {
  const r = t.dirs, o = e && e.dirs;
  for (let i = 0; i < r.length; i++) {
    const a = r[i];
    o && (a.oldValue = o[i].value);
    let l = a.dir[s];
    l && (an(), Xt(l, n, 8, [
      t.el,
      a,
      t,
      e
    ]), ln());
  }
}
const ou = Symbol("_vte"), au = (t) => t.__isTeleport;
function Di(t, e) {
  t.shapeFlag & 6 && t.component ? (t.transition = e, Di(t.component.subTree, e)) : t.shapeFlag & 128 ? (t.ssContent.transition = e.clone(t.ssContent), t.ssFallback.transition = e.clone(t.ssFallback)) : t.transition = e;
}
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function lu(t, e) {
  return me(t) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    _t({ name: t.name }, e, { setup: t })
  ) : t;
}
function Ua(t) {
  t.ids = [t.ids[0] + t.ids[2]++ + "-", 0, 0];
}
function gs(t, e, n, s, r = !1) {
  if (ue(t)) {
    t.forEach(
      (B, V) => gs(
        B,
        e && (ue(e) ? e[V] : e),
        n,
        s,
        r
      )
    );
    return;
  }
  if (ms(s) && !r) {
    s.shapeFlag & 512 && s.type.__asyncResolved && s.component.subTree.component && gs(t, e, n, s.component.subTree);
    return;
  }
  const o = s.shapeFlag & 4 ? wr(s.component) : s.el, i = r ? null : o, { i: a, r: l } = t, c = e && e.r, u = a.refs === Ve ? a.refs = {} : a.refs, y = a.setupState, p = Me(y), L = y === Ve ? () => !1 : (B) => Be(p, B);
  if (c != null && c !== l && (at(c) ? (u[c] = null, L(c) && (y[c] = null)) : mt(c) && (c.value = null)), me(l))
    As(l, a, 12, [i, u]);
  else {
    const B = at(l), V = mt(l);
    if (B || V) {
      const Te = () => {
        if (t.f) {
          const se = B ? L(l) ? y[l] : u[l] : l.value;
          r ? ue(se) && Si(se, o) : ue(se) ? se.includes(o) || se.push(o) : B ? (u[l] = [o], L(l) && (y[l] = u[l])) : (l.value = [o], t.k && (u[t.k] = l.value));
        } else B ? (u[l] = i, L(l) && (y[l] = i)) : V && (l.value = i, t.k && (u[t.k] = i));
      };
      i ? (Te.id = -1, It(Te, n)) : Te();
    }
  }
}
gr().requestIdleCallback;
gr().cancelIdleCallback;
const ms = (t) => !!t.type.__asyncLoader, za = (t) => t.type.__isKeepAlive;
function cu(t, e) {
  Ha(t, "a", e);
}
function uu(t, e) {
  Ha(t, "da", e);
}
function Ha(t, e, n = xt) {
  const s = t.__wdc || (t.__wdc = () => {
    let r = n;
    for (; r; ) {
      if (r.isDeactivated)
        return;
      r = r.parent;
    }
    return t();
  });
  if (yr(e, s, n), n) {
    let r = n.parent;
    for (; r && r.parent; )
      za(r.parent.vnode) && fu(s, e, n, r), r = r.parent;
  }
}
function fu(t, e, n, s) {
  const r = yr(
    e,
    t,
    s,
    !0
    /* prepend */
  );
  Ni(() => {
    Si(s[e], r);
  }, n);
}
function yr(t, e, n = xt, s = !1) {
  if (n) {
    const r = n[t] || (n[t] = []), o = e.__weh || (e.__weh = (...i) => {
      an();
      const a = Ts(n), l = Xt(e, n, t, i);
      return a(), ln(), l;
    });
    return s ? r.unshift(o) : r.push(o), o;
  }
}
const cn = (t) => (e, n = xt) => {
  (!Ss || t === "sp") && yr(t, (...s) => e(...s), n);
}, hu = cn("bm"), Wa = cn("m"), du = cn(
  "bu"
), pu = cn("u"), gu = cn(
  "bum"
), Ni = cn("um"), mu = cn(
  "sp"
), _u = cn("rtg"), yu = cn("rtc");
function bu(t, e = xt) {
  yr("ec", t, e);
}
const vu = Symbol.for("v-ndc");
function Rt(t, e, n, s) {
  let r;
  const o = n, i = ue(t);
  if (i || at(t)) {
    const a = i && qn(t);
    let l = !1, c = !1;
    a && (l = !Mt(t), c = vn(t), t = mr(t)), r = new Array(t.length);
    for (let u = 0, y = t.length; u < y; u++)
      r[u] = e(
        l ? c ? sr(dt(t[u])) : dt(t[u]) : t[u],
        u,
        void 0,
        o
      );
  } else if (typeof t == "number") {
    r = new Array(t);
    for (let a = 0; a < t; a++)
      r[a] = e(a + 1, a, void 0, o);
  } else if (nt(t))
    if (t[Symbol.iterator])
      r = Array.from(
        t,
        (a, l) => e(a, l, void 0, o)
      );
    else {
      const a = Object.keys(t);
      r = new Array(a.length);
      for (let l = 0, c = a.length; l < c; l++) {
        const u = a[l];
        r[l] = e(t[u], u, l, o);
      }
    }
  else
    r = [];
  return r;
}
const ii = (t) => t ? cl(t) ? wr(t) : ii(t.parent) : null, _s = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ _t(/* @__PURE__ */ Object.create(null), {
    $: (t) => t,
    $el: (t) => t.vnode.el,
    $data: (t) => t.data,
    $props: (t) => t.props,
    $attrs: (t) => t.attrs,
    $slots: (t) => t.slots,
    $refs: (t) => t.refs,
    $parent: (t) => ii(t.parent),
    $root: (t) => ii(t.root),
    $host: (t) => t.ce,
    $emit: (t) => t.emit,
    $options: (t) => ja(t),
    $forceUpdate: (t) => t.f || (t.f = () => {
      Pi(t.update);
    }),
    $nextTick: (t) => t.n || (t.n = Pa.bind(t.proxy)),
    $watch: (t) => Wu.bind(t)
  })
), Br = (t, e) => t !== Ve && !t.__isScriptSetup && Be(t, e), wu = {
  get({ _: t }, e) {
    if (e === "__v_skip")
      return !0;
    const { ctx: n, setupState: s, data: r, props: o, accessCache: i, type: a, appContext: l } = t;
    let c;
    if (e[0] !== "$") {
      const L = i[e];
      if (L !== void 0)
        switch (L) {
          case 1:
            return s[e];
          case 2:
            return r[e];
          case 4:
            return n[e];
          case 3:
            return o[e];
        }
      else {
        if (Br(s, e))
          return i[e] = 1, s[e];
        if (r !== Ve && Be(r, e))
          return i[e] = 2, r[e];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (c = t.propsOptions[0]) && Be(c, e)
        )
          return i[e] = 3, o[e];
        if (n !== Ve && Be(n, e))
          return i[e] = 4, n[e];
        oi && (i[e] = 0);
      }
    }
    const u = _s[e];
    let y, p;
    if (u)
      return e === "$attrs" && gt(t.attrs, "get", ""), u(t);
    if (
      // css module (injected by vue-loader)
      (y = a.__cssModules) && (y = y[e])
    )
      return y;
    if (n !== Ve && Be(n, e))
      return i[e] = 4, n[e];
    if (
      // global properties
      p = l.config.globalProperties, Be(p, e)
    )
      return p[e];
  },
  set({ _: t }, e, n) {
    const { data: s, setupState: r, ctx: o } = t;
    return Br(r, e) ? (r[e] = n, !0) : s !== Ve && Be(s, e) ? (s[e] = n, !0) : Be(t.props, e) || e[0] === "$" && e.slice(1) in t ? !1 : (o[e] = n, !0);
  },
  has({
    _: { data: t, setupState: e, accessCache: n, ctx: s, appContext: r, propsOptions: o }
  }, i) {
    let a;
    return !!n[i] || t !== Ve && Be(t, i) || Br(e, i) || (a = o[0]) && Be(a, i) || Be(s, i) || Be(_s, i) || Be(r.config.globalProperties, i);
  },
  defineProperty(t, e, n) {
    return n.get != null ? t._.accessCache[e] = 0 : Be(n, "value") && this.set(t, e, n.value, null), Reflect.defineProperty(t, e, n);
  }
};
function go(t) {
  return ue(t) ? t.reduce(
    (e, n) => (e[n] = null, e),
    {}
  ) : t;
}
let oi = !0;
function ku(t) {
  const e = ja(t), n = t.proxy, s = t.ctx;
  oi = !1, e.beforeCreate && mo(e.beforeCreate, t, "bc");
  const {
    // state
    data: r,
    computed: o,
    methods: i,
    watch: a,
    provide: l,
    inject: c,
    // lifecycle
    created: u,
    beforeMount: y,
    mounted: p,
    beforeUpdate: L,
    updated: B,
    activated: V,
    deactivated: Te,
    beforeDestroy: se,
    beforeUnmount: ce,
    destroyed: he,
    unmounted: U,
    render: z,
    renderTracked: $,
    renderTriggered: Y,
    errorCaptured: we,
    serverPrefetch: Ee,
    // public API
    expose: Fe,
    inheritAttrs: b,
    // assets
    components: te,
    directives: Ce,
    filters: X
  } = e;
  if (c && xu(c, s, null), i)
    for (const fe in i) {
      const oe = i[fe];
      me(oe) && (s[fe] = oe.bind(n));
    }
  if (r) {
    const fe = r.call(n, n);
    nt(fe) && (t.data = Li(fe));
  }
  if (oi = !0, o)
    for (const fe in o) {
      const oe = o[fe], st = me(oe) ? oe.bind(n, n) : me(oe.get) ? oe.get.bind(n, n) : Gt, Xe = !me(oe) && me(oe.set) ? oe.set.bind(n) : Gt, de = We({
        get: st,
        set: Xe
      });
      Object.defineProperty(s, fe, {
        enumerable: !0,
        configurable: !0,
        get: () => de.value,
        set: (Ze) => de.value = Ze
      });
    }
  if (a)
    for (const fe in a)
      qa(a[fe], s, n, fe);
  if (l) {
    const fe = me(l) ? l.call(n) : l;
    Reflect.ownKeys(fe).forEach((oe) => {
      Ru(oe, fe[oe]);
    });
  }
  u && mo(u, t, "c");
  function ie(fe, oe) {
    ue(oe) ? oe.forEach((st) => fe(st.bind(n))) : oe && fe(oe.bind(n));
  }
  if (ie(hu, y), ie(Wa, p), ie(du, L), ie(pu, B), ie(cu, V), ie(uu, Te), ie(bu, we), ie(yu, $), ie(_u, Y), ie(gu, ce), ie(Ni, U), ie(mu, Ee), ue(Fe))
    if (Fe.length) {
      const fe = t.exposed || (t.exposed = {});
      Fe.forEach((oe) => {
        Object.defineProperty(fe, oe, {
          get: () => n[oe],
          set: (st) => n[oe] = st,
          enumerable: !0
        });
      });
    } else t.exposed || (t.exposed = {});
  z && t.render === Gt && (t.render = z), b != null && (t.inheritAttrs = b), te && (t.components = te), Ce && (t.directives = Ce), Ee && Ua(t);
}
function xu(t, e, n = Gt) {
  ue(t) && (t = ai(t));
  for (const s in t) {
    const r = t[s];
    let o;
    nt(r) ? "default" in r ? o = Gs(
      r.from || s,
      r.default,
      !0
    ) : o = Gs(r.from || s) : o = Gs(r), mt(o) ? Object.defineProperty(e, s, {
      enumerable: !0,
      configurable: !0,
      get: () => o.value,
      set: (i) => o.value = i
    }) : e[s] = o;
  }
}
function mo(t, e, n) {
  Xt(
    ue(t) ? t.map((s) => s.bind(e.proxy)) : t.bind(e.proxy),
    e,
    n
  );
}
function qa(t, e, n, s) {
  let r = s.includes(".") ? sl(n, s) : () => n[s];
  if (at(t)) {
    const o = e[t];
    me(o) && On(r, o);
  } else if (me(t))
    On(r, t.bind(n));
  else if (nt(t))
    if (ue(t))
      t.forEach((o) => qa(o, e, n, s));
    else {
      const o = me(t.handler) ? t.handler.bind(n) : e[t.handler];
      me(o) && On(r, o, t);
    }
}
function ja(t) {
  const e = t.type, { mixins: n, extends: s } = e, {
    mixins: r,
    optionsCache: o,
    config: { optionMergeStrategies: i }
  } = t.appContext, a = o.get(e);
  let l;
  return a ? l = a : !r.length && !n && !s ? l = e : (l = {}, r.length && r.forEach(
    (c) => ar(l, c, i, !0)
  ), ar(l, e, i)), nt(e) && o.set(e, l), l;
}
function ar(t, e, n, s = !1) {
  const { mixins: r, extends: o } = e;
  o && ar(t, o, n, !0), r && r.forEach(
    (i) => ar(t, i, n, !0)
  );
  for (const i in e)
    if (!(s && i === "expose")) {
      const a = Su[i] || n && n[i];
      t[i] = a ? a(t[i], e[i]) : e[i];
    }
  return t;
}
const Su = {
  data: _o,
  props: yo,
  emits: yo,
  // objects
  methods: cs,
  computed: cs,
  // lifecycle
  beforeCreate: wt,
  created: wt,
  beforeMount: wt,
  mounted: wt,
  beforeUpdate: wt,
  updated: wt,
  beforeDestroy: wt,
  beforeUnmount: wt,
  destroyed: wt,
  unmounted: wt,
  activated: wt,
  deactivated: wt,
  errorCaptured: wt,
  serverPrefetch: wt,
  // assets
  components: cs,
  directives: cs,
  // watch
  watch: Tu,
  // provide / inject
  provide: _o,
  inject: Au
};
function _o(t, e) {
  return e ? t ? function() {
    return _t(
      me(t) ? t.call(this, this) : t,
      me(e) ? e.call(this, this) : e
    );
  } : e : t;
}
function Au(t, e) {
  return cs(ai(t), ai(e));
}
function ai(t) {
  if (ue(t)) {
    const e = {};
    for (let n = 0; n < t.length; n++)
      e[t[n]] = t[n];
    return e;
  }
  return t;
}
function wt(t, e) {
  return t ? [...new Set([].concat(t, e))] : e;
}
function cs(t, e) {
  return t ? _t(/* @__PURE__ */ Object.create(null), t, e) : e;
}
function yo(t, e) {
  return t ? ue(t) && ue(e) ? [.../* @__PURE__ */ new Set([...t, ...e])] : _t(
    /* @__PURE__ */ Object.create(null),
    go(t),
    go(e ?? {})
  ) : e;
}
function Tu(t, e) {
  if (!t) return e;
  if (!e) return t;
  const n = _t(/* @__PURE__ */ Object.create(null), t);
  for (const s in e)
    n[s] = wt(t[s], e[s]);
  return n;
}
function Va() {
  return {
    app: null,
    config: {
      isNativeTag: gc,
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
let Eu = 0;
function Cu(t, e) {
  return function(s, r = null) {
    me(s) || (s = _t({}, s)), r != null && !nt(r) && (r = null);
    const o = Va(), i = /* @__PURE__ */ new WeakSet(), a = [];
    let l = !1;
    const c = o.app = {
      _uid: Eu++,
      _component: s,
      _props: r,
      _container: null,
      _context: o,
      _instance: null,
      version: ff,
      get config() {
        return o.config;
      },
      set config(u) {
      },
      use(u, ...y) {
        return i.has(u) || (u && me(u.install) ? (i.add(u), u.install(c, ...y)) : me(u) && (i.add(u), u(c, ...y))), c;
      },
      mixin(u) {
        return o.mixins.includes(u) || o.mixins.push(u), c;
      },
      component(u, y) {
        return y ? (o.components[u] = y, c) : o.components[u];
      },
      directive(u, y) {
        return y ? (o.directives[u] = y, c) : o.directives[u];
      },
      mount(u, y, p) {
        if (!l) {
          const L = c._ceVNode || Yt(s, r);
          return L.appContext = o, p === !0 ? p = "svg" : p === !1 && (p = void 0), t(L, u, p), l = !0, c._container = u, u.__vue_app__ = c, wr(L.component);
        }
      },
      onUnmount(u) {
        a.push(u);
      },
      unmount() {
        l && (Xt(
          a,
          c._instance,
          16
        ), t(null, c._container), delete c._container.__vue_app__);
      },
      provide(u, y) {
        return o.provides[u] = y, c;
      },
      runWithContext(u) {
        const y = Vn;
        Vn = c;
        try {
          return u();
        } finally {
          Vn = y;
        }
      }
    };
    return c;
  };
}
let Vn = null;
function Ru(t, e) {
  if (xt) {
    let n = xt.provides;
    const s = xt.parent && xt.parent.provides;
    s === n && (n = xt.provides = Object.create(s)), n[t] = e;
  }
}
function Gs(t, e, n = !1) {
  const s = rf();
  if (s || Vn) {
    let r = Vn ? Vn._context.provides : s ? s.parent == null || s.ce ? s.vnode.appContext && s.vnode.appContext.provides : s.parent.provides : void 0;
    if (r && t in r)
      return r[t];
    if (arguments.length > 1)
      return n && me(e) ? e.call(s && s.proxy) : e;
  }
}
const Ka = {}, Ga = () => Object.create(Ka), Ya = (t) => Object.getPrototypeOf(t) === Ka;
function Iu(t, e, n, s = !1) {
  const r = {}, o = Ga();
  t.propsDefaults = /* @__PURE__ */ Object.create(null), $a(t, e, r, o);
  for (const i in t.propsOptions[0])
    i in r || (r[i] = void 0);
  n ? t.props = s ? r : Kc(r) : t.type.props ? t.props = r : t.props = o, t.attrs = o;
}
function Lu(t, e, n, s) {
  const {
    props: r,
    attrs: o,
    vnode: { patchFlag: i }
  } = t, a = Me(r), [l] = t.propsOptions;
  let c = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (s || i > 0) && !(i & 16)
  ) {
    if (i & 8) {
      const u = t.vnode.dynamicProps;
      for (let y = 0; y < u.length; y++) {
        let p = u[y];
        if (br(t.emitsOptions, p))
          continue;
        const L = e[p];
        if (l)
          if (Be(o, p))
            L !== o[p] && (o[p] = L, c = !0);
          else {
            const B = bn(p);
            r[B] = li(
              l,
              a,
              B,
              L,
              t,
              !1
            );
          }
        else
          L !== o[p] && (o[p] = L, c = !0);
      }
    }
  } else {
    $a(t, e, r, o) && (c = !0);
    let u;
    for (const y in a)
      (!e || // for camelCase
      !Be(e, y) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((u = xn(y)) === y || !Be(e, u))) && (l ? n && // for camelCase
      (n[y] !== void 0 || // for kebab-case
      n[u] !== void 0) && (r[y] = li(
        l,
        a,
        y,
        void 0,
        t,
        !0
      )) : delete r[y]);
    if (o !== a)
      for (const y in o)
        (!e || !Be(e, y)) && (delete o[y], c = !0);
  }
  c && nn(t.attrs, "set", "");
}
function $a(t, e, n, s) {
  const [r, o] = t.propsOptions;
  let i = !1, a;
  if (e)
    for (let l in e) {
      if (hs(l))
        continue;
      const c = e[l];
      let u;
      r && Be(r, u = bn(l)) ? !o || !o.includes(u) ? n[u] = c : (a || (a = {}))[u] = c : br(t.emitsOptions, l) || (!(l in s) || c !== s[l]) && (s[l] = c, i = !0);
    }
  if (o) {
    const l = Me(n), c = a || Ve;
    for (let u = 0; u < o.length; u++) {
      const y = o[u];
      n[y] = li(
        r,
        l,
        y,
        c[y],
        t,
        !Be(c, y)
      );
    }
  }
  return i;
}
function li(t, e, n, s, r, o) {
  const i = t[n];
  if (i != null) {
    const a = Be(i, "default");
    if (a && s === void 0) {
      const l = i.default;
      if (i.type !== Function && !i.skipFactory && me(l)) {
        const { propsDefaults: c } = r;
        if (n in c)
          s = c[n];
        else {
          const u = Ts(r);
          s = c[n] = l.call(
            null,
            e
          ), u();
        }
      } else
        s = l;
      r.ce && r.ce._setProp(n, s);
    }
    i[
      0
      /* shouldCast */
    ] && (o && !a ? s = !1 : i[
      1
      /* shouldCastTrue */
    ] && (s === "" || s === xn(n)) && (s = !0));
  }
  return s;
}
const Ou = /* @__PURE__ */ new WeakMap();
function Xa(t, e, n = !1) {
  const s = n ? Ou : e.propsCache, r = s.get(t);
  if (r)
    return r;
  const o = t.props, i = {}, a = [];
  let l = !1;
  if (!me(t)) {
    const u = (y) => {
      l = !0;
      const [p, L] = Xa(y, e, !0);
      _t(i, p), L && a.push(...L);
    };
    !n && e.mixins.length && e.mixins.forEach(u), t.extends && u(t.extends), t.mixins && t.mixins.forEach(u);
  }
  if (!o && !l)
    return nt(t) && s.set(t, Hn), Hn;
  if (ue(o))
    for (let u = 0; u < o.length; u++) {
      const y = bn(o[u]);
      bo(y) && (i[y] = Ve);
    }
  else if (o)
    for (const u in o) {
      const y = bn(u);
      if (bo(y)) {
        const p = o[u], L = i[y] = ue(p) || me(p) ? { type: p } : _t({}, p), B = L.type;
        let V = !1, Te = !0;
        if (ue(B))
          for (let se = 0; se < B.length; ++se) {
            const ce = B[se], he = me(ce) && ce.name;
            if (he === "Boolean") {
              V = !0;
              break;
            } else he === "String" && (Te = !1);
          }
        else
          V = me(B) && B.name === "Boolean";
        L[
          0
          /* shouldCast */
        ] = V, L[
          1
          /* shouldCastTrue */
        ] = Te, (V || Be(L, "default")) && a.push(y);
      }
    }
  const c = [i, a];
  return nt(t) && s.set(t, c), c;
}
function bo(t) {
  return t[0] !== "$" && !hs(t);
}
const Mi = (t) => t === "_" || t === "__" || t === "_ctx" || t === "$stable", Bi = (t) => ue(t) ? t.map(Kt) : [Kt(t)], Fu = (t, e, n) => {
  if (e._n)
    return e;
  const s = iu((...r) => Bi(e(...r)), n);
  return s._c = !1, s;
}, Za = (t, e, n) => {
  const s = t._ctx;
  for (const r in t) {
    if (Mi(r)) continue;
    const o = t[r];
    if (me(o))
      e[r] = Fu(r, o, s);
    else if (o != null) {
      const i = Bi(o);
      e[r] = () => i;
    }
  }
}, Ja = (t, e) => {
  const n = Bi(e);
  t.slots.default = () => n;
}, Qa = (t, e, n) => {
  for (const s in e)
    (n || !Mi(s)) && (t[s] = e[s]);
}, Pu = (t, e, n) => {
  const s = t.slots = Ga();
  if (t.vnode.shapeFlag & 32) {
    const r = e.__;
    r && Qr(s, "__", r, !0);
    const o = e._;
    o ? (Qa(s, e, n), n && Qr(s, "_", o, !0)) : Za(e, s);
  } else e && Ja(t, e);
}, Du = (t, e, n) => {
  const { vnode: s, slots: r } = t;
  let o = !0, i = Ve;
  if (s.shapeFlag & 32) {
    const a = e._;
    a ? n && a === 1 ? o = !1 : Qa(r, e, n) : (o = !e.$stable, Za(e, r)), i = e;
  } else e && (Ja(t, e), i = { default: 1 });
  if (o)
    for (const a in r)
      !Mi(a) && i[a] == null && delete r[a];
}, It = $u;
function Nu(t) {
  return Mu(t);
}
function Mu(t, e) {
  const n = gr();
  n.__VUE__ = !0;
  const {
    insert: s,
    remove: r,
    patchProp: o,
    createElement: i,
    createText: a,
    createComment: l,
    setText: c,
    setElementText: u,
    parentNode: y,
    nextSibling: p,
    setScopeId: L = Gt,
    insertStaticContent: B
  } = t, V = (h, g, k, E = null, A = null, T = null, D = void 0, M = null, F = !!g.dynamicChildren) => {
    if (h === g)
      return;
    h && !es(h, g) && (E = H(h), Ze(h, A, T, !0), h = null), g.patchFlag === -2 && (F = !1, g.dynamicChildren = null);
    const { type: C, ref: Z, shapeFlag: N } = g;
    switch (C) {
      case vr:
        Te(h, g, k, E);
        break;
      case wn:
        se(h, g, k, E);
        break;
      case Ys:
        h == null && ce(g, k, E, D);
        break;
      case Qe:
        te(
          h,
          g,
          k,
          E,
          A,
          T,
          D,
          M,
          F
        );
        break;
      default:
        N & 1 ? z(
          h,
          g,
          k,
          E,
          A,
          T,
          D,
          M,
          F
        ) : N & 6 ? Ce(
          h,
          g,
          k,
          E,
          A,
          T,
          D,
          M,
          F
        ) : (N & 64 || N & 128) && C.process(
          h,
          g,
          k,
          E,
          A,
          T,
          D,
          M,
          F,
          it
        );
    }
    Z != null && A ? gs(Z, h && h.ref, T, g || h, !g) : Z == null && h && h.ref != null && gs(h.ref, null, T, h, !0);
  }, Te = (h, g, k, E) => {
    if (h == null)
      s(
        g.el = a(g.children),
        k,
        E
      );
    else {
      const A = g.el = h.el;
      g.children !== h.children && c(A, g.children);
    }
  }, se = (h, g, k, E) => {
    h == null ? s(
      g.el = l(g.children || ""),
      k,
      E
    ) : g.el = h.el;
  }, ce = (h, g, k, E) => {
    [h.el, h.anchor] = B(
      h.children,
      g,
      k,
      E,
      h.el,
      h.anchor
    );
  }, he = ({ el: h, anchor: g }, k, E) => {
    let A;
    for (; h && h !== g; )
      A = p(h), s(h, k, E), h = A;
    s(g, k, E);
  }, U = ({ el: h, anchor: g }) => {
    let k;
    for (; h && h !== g; )
      k = p(h), r(h), h = k;
    r(g);
  }, z = (h, g, k, E, A, T, D, M, F) => {
    g.type === "svg" ? D = "svg" : g.type === "math" && (D = "mathml"), h == null ? $(
      g,
      k,
      E,
      A,
      T,
      D,
      M,
      F
    ) : Ee(
      h,
      g,
      A,
      T,
      D,
      M,
      F
    );
  }, $ = (h, g, k, E, A, T, D, M) => {
    let F, C;
    const { props: Z, shapeFlag: N, transition: K, dirs: Q } = h;
    if (F = h.el = i(
      h.type,
      T,
      Z && Z.is,
      Z
    ), N & 8 ? u(F, h.children) : N & 16 && we(
      h.children,
      F,
      null,
      E,
      A,
      Ur(h, T),
      D,
      M
    ), Q && En(h, null, E, "created"), Y(F, h, h.scopeId, D, E), Z) {
      for (const Re in Z)
        Re !== "value" && !hs(Re) && o(F, Re, null, Z[Re], T, E);
      "value" in Z && o(F, "value", null, Z.value, T), (C = Z.onVnodeBeforeMount) && qt(C, E, h);
    }
    Q && En(h, null, E, "beforeMount");
    const le = Bu(A, K);
    le && K.beforeEnter(F), s(F, g, k), ((C = Z && Z.onVnodeMounted) || le || Q) && It(() => {
      C && qt(C, E, h), le && K.enter(F), Q && En(h, null, E, "mounted");
    }, A);
  }, Y = (h, g, k, E, A) => {
    if (k && L(h, k), E)
      for (let T = 0; T < E.length; T++)
        L(h, E[T]);
    if (A) {
      let T = A.subTree;
      if (g === T || il(T.type) && (T.ssContent === g || T.ssFallback === g)) {
        const D = A.vnode;
        Y(
          h,
          D,
          D.scopeId,
          D.slotScopeIds,
          A.parent
        );
      }
    }
  }, we = (h, g, k, E, A, T, D, M, F = 0) => {
    for (let C = F; C < h.length; C++) {
      const Z = h[C] = M ? gn(h[C]) : Kt(h[C]);
      V(
        null,
        Z,
        g,
        k,
        E,
        A,
        T,
        D,
        M
      );
    }
  }, Ee = (h, g, k, E, A, T, D) => {
    const M = g.el = h.el;
    let { patchFlag: F, dynamicChildren: C, dirs: Z } = g;
    F |= h.patchFlag & 16;
    const N = h.props || Ve, K = g.props || Ve;
    let Q;
    if (k && Cn(k, !1), (Q = K.onVnodeBeforeUpdate) && qt(Q, k, g, h), Z && En(g, h, k, "beforeUpdate"), k && Cn(k, !0), (N.innerHTML && K.innerHTML == null || N.textContent && K.textContent == null) && u(M, ""), C ? Fe(
      h.dynamicChildren,
      C,
      M,
      k,
      E,
      Ur(g, A),
      T
    ) : D || oe(
      h,
      g,
      M,
      null,
      k,
      E,
      Ur(g, A),
      T,
      !1
    ), F > 0) {
      if (F & 16)
        b(M, N, K, k, A);
      else if (F & 2 && N.class !== K.class && o(M, "class", null, K.class, A), F & 4 && o(M, "style", N.style, K.style, A), F & 8) {
        const le = g.dynamicProps;
        for (let Re = 0; Re < le.length; Re++) {
          const be = le[Re], rt = N[be], ze = K[be];
          (ze !== rt || be === "value") && o(M, be, rt, ze, A, k);
        }
      }
      F & 1 && h.children !== g.children && u(M, g.children);
    } else !D && C == null && b(M, N, K, k, A);
    ((Q = K.onVnodeUpdated) || Z) && It(() => {
      Q && qt(Q, k, g, h), Z && En(g, h, k, "updated");
    }, E);
  }, Fe = (h, g, k, E, A, T, D) => {
    for (let M = 0; M < g.length; M++) {
      const F = h[M], C = g[M], Z = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        F.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (F.type === Qe || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !es(F, C) || // - In the case of a component, it could contain anything.
        F.shapeFlag & 198) ? y(F.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          k
        )
      );
      V(
        F,
        C,
        Z,
        null,
        E,
        A,
        T,
        D,
        !0
      );
    }
  }, b = (h, g, k, E, A) => {
    if (g !== k) {
      if (g !== Ve)
        for (const T in g)
          !hs(T) && !(T in k) && o(
            h,
            T,
            g[T],
            null,
            A,
            E
          );
      for (const T in k) {
        if (hs(T)) continue;
        const D = k[T], M = g[T];
        D !== M && T !== "value" && o(h, T, M, D, A, E);
      }
      "value" in k && o(h, "value", g.value, k.value, A);
    }
  }, te = (h, g, k, E, A, T, D, M, F) => {
    const C = g.el = h ? h.el : a(""), Z = g.anchor = h ? h.anchor : a("");
    let { patchFlag: N, dynamicChildren: K, slotScopeIds: Q } = g;
    Q && (M = M ? M.concat(Q) : Q), h == null ? (s(C, k, E), s(Z, k, E), we(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      g.children || [],
      k,
      Z,
      A,
      T,
      D,
      M,
      F
    )) : N > 0 && N & 64 && K && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    h.dynamicChildren ? (Fe(
      h.dynamicChildren,
      K,
      k,
      A,
      T,
      D,
      M
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (g.key != null || A && g === A.subTree) && el(
      h,
      g,
      !0
      /* shallow */
    )) : oe(
      h,
      g,
      k,
      Z,
      A,
      T,
      D,
      M,
      F
    );
  }, Ce = (h, g, k, E, A, T, D, M, F) => {
    g.slotScopeIds = M, h == null ? g.shapeFlag & 512 ? A.ctx.activate(
      g,
      k,
      E,
      D,
      F
    ) : X(
      g,
      k,
      E,
      A,
      T,
      D,
      F
    ) : $e(h, g, F);
  }, X = (h, g, k, E, A, T, D) => {
    const M = h.component = sf(
      h,
      E,
      A
    );
    if (za(h) && (M.ctx.renderer = it), of(M, !1, D), M.asyncDep) {
      if (A && A.registerDep(M, ie, D), !h.el) {
        const F = M.subTree = Yt(wn);
        se(null, F, g, k), h.placeholder = F.el;
      }
    } else
      ie(
        M,
        h,
        g,
        k,
        A,
        T,
        D
      );
  }, $e = (h, g, k) => {
    const E = g.component = h.component;
    if (Gu(h, g, k))
      if (E.asyncDep && !E.asyncResolved) {
        fe(E, g, k);
        return;
      } else
        E.next = g, E.update();
    else
      g.el = h.el, E.vnode = g;
  }, ie = (h, g, k, E, A, T, D) => {
    const M = () => {
      if (h.isMounted) {
        let { next: N, bu: K, u: Q, parent: le, vnode: Re } = h;
        {
          const f = tl(h);
          if (f) {
            N && (N.el = Re.el, fe(h, N, D)), f.asyncDep.then(() => {
              h.isUnmounted || M();
            });
            return;
          }
        }
        let be = N, rt;
        Cn(h, !1), N ? (N.el = Re.el, fe(h, N, D)) : N = Re, K && Ks(K), (rt = N.props && N.props.onVnodeBeforeUpdate) && qt(rt, le, N, Re), Cn(h, !0);
        const ze = wo(h), ut = h.subTree;
        h.subTree = ze, V(
          ut,
          ze,
          // parent may have changed if it's in a teleport
          y(ut.el),
          // anchor may have changed if it's in a fragment
          H(ut),
          h,
          A,
          T
        ), N.el = ze.el, be === null && Yu(h, ze.el), Q && It(Q, A), (rt = N.props && N.props.onVnodeUpdated) && It(
          () => qt(rt, le, N, Re),
          A
        );
      } else {
        let N;
        const { el: K, props: Q } = g, { bm: le, m: Re, parent: be, root: rt, type: ze } = h, ut = ms(g);
        Cn(h, !1), le && Ks(le), !ut && (N = Q && Q.onVnodeBeforeMount) && qt(N, be, g), Cn(h, !0);
        {
          rt.ce && // @ts-expect-error _def is private
          rt.ce._def.shadowRoot !== !1 && rt.ce._injectChildStyle(ze);
          const f = h.subTree = wo(h);
          V(
            null,
            f,
            k,
            E,
            h,
            A,
            T
          ), g.el = f.el;
        }
        if (Re && It(Re, A), !ut && (N = Q && Q.onVnodeMounted)) {
          const f = g;
          It(
            () => qt(N, be, f),
            A
          );
        }
        (g.shapeFlag & 256 || be && ms(be.vnode) && be.vnode.shapeFlag & 256) && h.a && It(h.a, A), h.isMounted = !0, g = k = E = null;
      }
    };
    h.scope.on();
    const F = h.effect = new _a(M);
    h.scope.off();
    const C = h.update = F.run.bind(F), Z = h.job = F.runIfDirty.bind(F);
    Z.i = h, Z.id = h.uid, F.scheduler = () => Pi(Z), Cn(h, !0), C();
  }, fe = (h, g, k) => {
    g.component = h;
    const E = h.vnode.props;
    h.vnode = g, h.next = null, Lu(h, g.props, E, k), Du(h, g.children, k), an(), po(h), ln();
  }, oe = (h, g, k, E, A, T, D, M, F = !1) => {
    const C = h && h.children, Z = h ? h.shapeFlag : 0, N = g.children, { patchFlag: K, shapeFlag: Q } = g;
    if (K > 0) {
      if (K & 128) {
        Xe(
          C,
          N,
          k,
          E,
          A,
          T,
          D,
          M,
          F
        );
        return;
      } else if (K & 256) {
        st(
          C,
          N,
          k,
          E,
          A,
          T,
          D,
          M,
          F
        );
        return;
      }
    }
    Q & 8 ? (Z & 16 && ne(C, A, T), N !== C && u(k, N)) : Z & 16 ? Q & 16 ? Xe(
      C,
      N,
      k,
      E,
      A,
      T,
      D,
      M,
      F
    ) : ne(C, A, T, !0) : (Z & 8 && u(k, ""), Q & 16 && we(
      N,
      k,
      E,
      A,
      T,
      D,
      M,
      F
    ));
  }, st = (h, g, k, E, A, T, D, M, F) => {
    h = h || Hn, g = g || Hn;
    const C = h.length, Z = g.length, N = Math.min(C, Z);
    let K;
    for (K = 0; K < N; K++) {
      const Q = g[K] = F ? gn(g[K]) : Kt(g[K]);
      V(
        h[K],
        Q,
        k,
        null,
        A,
        T,
        D,
        M,
        F
      );
    }
    C > Z ? ne(
      h,
      A,
      T,
      !0,
      !1,
      N
    ) : we(
      g,
      k,
      E,
      A,
      T,
      D,
      M,
      F,
      N
    );
  }, Xe = (h, g, k, E, A, T, D, M, F) => {
    let C = 0;
    const Z = g.length;
    let N = h.length - 1, K = Z - 1;
    for (; C <= N && C <= K; ) {
      const Q = h[C], le = g[C] = F ? gn(g[C]) : Kt(g[C]);
      if (es(Q, le))
        V(
          Q,
          le,
          k,
          null,
          A,
          T,
          D,
          M,
          F
        );
      else
        break;
      C++;
    }
    for (; C <= N && C <= K; ) {
      const Q = h[N], le = g[K] = F ? gn(g[K]) : Kt(g[K]);
      if (es(Q, le))
        V(
          Q,
          le,
          k,
          null,
          A,
          T,
          D,
          M,
          F
        );
      else
        break;
      N--, K--;
    }
    if (C > N) {
      if (C <= K) {
        const Q = K + 1, le = Q < Z ? g[Q].el : E;
        for (; C <= K; )
          V(
            null,
            g[C] = F ? gn(g[C]) : Kt(g[C]),
            k,
            le,
            A,
            T,
            D,
            M,
            F
          ), C++;
      }
    } else if (C > K)
      for (; C <= N; )
        Ze(h[C], A, T, !0), C++;
    else {
      const Q = C, le = C, Re = /* @__PURE__ */ new Map();
      for (C = le; C <= K; C++) {
        const w = g[C] = F ? gn(g[C]) : Kt(g[C]);
        w.key != null && Re.set(w.key, C);
      }
      let be, rt = 0;
      const ze = K - le + 1;
      let ut = !1, f = 0;
      const m = new Array(ze);
      for (C = 0; C < ze; C++) m[C] = 0;
      for (C = Q; C <= N; C++) {
        const w = h[C];
        if (rt >= ze) {
          Ze(w, A, T, !0);
          continue;
        }
        let P;
        if (w.key != null)
          P = Re.get(w.key);
        else
          for (be = le; be <= K; be++)
            if (m[be - le] === 0 && es(w, g[be])) {
              P = be;
              break;
            }
        P === void 0 ? Ze(w, A, T, !0) : (m[P - le] = C + 1, P >= f ? f = P : ut = !0, V(
          w,
          g[P],
          k,
          null,
          A,
          T,
          D,
          M,
          F
        ), rt++);
      }
      const x = ut ? Uu(m) : Hn;
      for (be = x.length - 1, C = ze - 1; C >= 0; C--) {
        const w = le + C, P = g[w], G = g[w + 1], ee = w + 1 < Z ? (
          // #13559, fallback to el placeholder for unresolved async component
          G.el || G.placeholder
        ) : E;
        m[C] === 0 ? V(
          null,
          P,
          k,
          ee,
          A,
          T,
          D,
          M,
          F
        ) : ut && (be < 0 || C !== x[be] ? de(P, k, ee, 2) : be--);
      }
    }
  }, de = (h, g, k, E, A = null) => {
    const { el: T, type: D, transition: M, children: F, shapeFlag: C } = h;
    if (C & 6) {
      de(h.component.subTree, g, k, E);
      return;
    }
    if (C & 128) {
      h.suspense.move(g, k, E);
      return;
    }
    if (C & 64) {
      D.move(h, g, k, it);
      return;
    }
    if (D === Qe) {
      s(T, g, k);
      for (let N = 0; N < F.length; N++)
        de(F[N], g, k, E);
      s(h.anchor, g, k);
      return;
    }
    if (D === Ys) {
      he(h, g, k);
      return;
    }
    if (E !== 2 && C & 1 && M)
      if (E === 0)
        M.beforeEnter(T), s(T, g, k), It(() => M.enter(T), A);
      else {
        const { leave: N, delayLeave: K, afterLeave: Q } = M, le = () => {
          h.ctx.isUnmounted ? r(T) : s(T, g, k);
        }, Re = () => {
          N(T, () => {
            le(), Q && Q();
          });
        };
        K ? K(T, le, Re) : Re();
      }
    else
      s(T, g, k);
  }, Ze = (h, g, k, E = !1, A = !1) => {
    const {
      type: T,
      props: D,
      ref: M,
      children: F,
      dynamicChildren: C,
      shapeFlag: Z,
      patchFlag: N,
      dirs: K,
      cacheIndex: Q
    } = h;
    if (N === -2 && (A = !1), M != null && (an(), gs(M, null, k, h, !0), ln()), Q != null && (g.renderCache[Q] = void 0), Z & 256) {
      g.ctx.deactivate(h);
      return;
    }
    const le = Z & 1 && K, Re = !ms(h);
    let be;
    if (Re && (be = D && D.onVnodeBeforeUnmount) && qt(be, g, h), Z & 6)
      _e(h.component, k, E);
    else {
      if (Z & 128) {
        h.suspense.unmount(k, E);
        return;
      }
      le && En(h, null, g, "beforeUnmount"), Z & 64 ? h.type.remove(
        h,
        g,
        k,
        it,
        E
      ) : C && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !C.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (T !== Qe || N > 0 && N & 64) ? ne(
        C,
        g,
        k,
        !1,
        !0
      ) : (T === Qe && N & 384 || !A && Z & 16) && ne(F, g, k), E && Se(h);
    }
    (Re && (be = D && D.onVnodeUnmounted) || le) && It(() => {
      be && qt(be, g, h), le && En(h, null, g, "unmounted");
    }, k);
  }, Se = (h) => {
    const { type: g, el: k, anchor: E, transition: A } = h;
    if (g === Qe) {
      W(k, E);
      return;
    }
    if (g === Ys) {
      U(h);
      return;
    }
    const T = () => {
      r(k), A && !A.persisted && A.afterLeave && A.afterLeave();
    };
    if (h.shapeFlag & 1 && A && !A.persisted) {
      const { leave: D, delayLeave: M } = A, F = () => D(k, T);
      M ? M(h.el, T, F) : F();
    } else
      T();
  }, W = (h, g) => {
    let k;
    for (; h !== g; )
      k = p(h), r(h), h = k;
    r(g);
  }, _e = (h, g, k) => {
    const {
      bum: E,
      scope: A,
      job: T,
      subTree: D,
      um: M,
      m: F,
      a: C,
      parent: Z,
      slots: { __: N }
    } = h;
    vo(F), vo(C), E && Ks(E), Z && ue(N) && N.forEach((K) => {
      Z.renderCache[K] = void 0;
    }), A.stop(), T && (T.flags |= 8, Ze(D, h, g, k)), M && It(M, g), It(() => {
      h.isUnmounted = !0;
    }, g), g && g.pendingBranch && !g.isUnmounted && h.asyncDep && !h.asyncResolved && h.suspenseId === g.pendingId && (g.deps--, g.deps === 0 && g.resolve());
  }, ne = (h, g, k, E = !1, A = !1, T = 0) => {
    for (let D = T; D < h.length; D++)
      Ze(h[D], g, k, E, A);
  }, H = (h) => {
    if (h.shapeFlag & 6)
      return H(h.component.subTree);
    if (h.shapeFlag & 128)
      return h.suspense.next();
    const g = p(h.anchor || h.el), k = g && g[ou];
    return k ? p(k) : g;
  };
  let Pe = !1;
  const He = (h, g, k) => {
    h == null ? g._vnode && Ze(g._vnode, null, null, !0) : V(
      g._vnode || null,
      h,
      g,
      null,
      null,
      null,
      k
    ), g._vnode = h, Pe || (Pe = !0, po(), Na(), Pe = !1);
  }, it = {
    p: V,
    um: Ze,
    m: de,
    r: Se,
    mt: X,
    mc: we,
    pc: oe,
    pbc: Fe,
    n: H,
    o: t
  };
  return {
    render: He,
    hydrate: void 0,
    createApp: Cu(He)
  };
}
function Ur({ type: t, props: e }, n) {
  return n === "svg" && t === "foreignObject" || n === "mathml" && t === "annotation-xml" && e && e.encoding && e.encoding.includes("html") ? void 0 : n;
}
function Cn({ effect: t, job: e }, n) {
  n ? (t.flags |= 32, e.flags |= 4) : (t.flags &= -33, e.flags &= -5);
}
function Bu(t, e) {
  return (!t || t && !t.pendingBranch) && e && !e.persisted;
}
function el(t, e, n = !1) {
  const s = t.children, r = e.children;
  if (ue(s) && ue(r))
    for (let o = 0; o < s.length; o++) {
      const i = s[o];
      let a = r[o];
      a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = r[o] = gn(r[o]), a.el = i.el), !n && a.patchFlag !== -2 && el(i, a)), a.type === vr && (a.el = i.el), a.type === wn && !a.el && (a.el = i.el);
    }
}
function Uu(t) {
  const e = t.slice(), n = [0];
  let s, r, o, i, a;
  const l = t.length;
  for (s = 0; s < l; s++) {
    const c = t[s];
    if (c !== 0) {
      if (r = n[n.length - 1], t[r] < c) {
        e[s] = r, n.push(s);
        continue;
      }
      for (o = 0, i = n.length - 1; o < i; )
        a = o + i >> 1, t[n[a]] < c ? o = a + 1 : i = a;
      c < t[n[o]] && (o > 0 && (e[s] = n[o - 1]), n[o] = s);
    }
  }
  for (o = n.length, i = n[o - 1]; o-- > 0; )
    n[o] = i, i = e[i];
  return n;
}
function tl(t) {
  const e = t.subTree.component;
  if (e)
    return e.asyncDep && !e.asyncResolved ? e : tl(e);
}
function vo(t) {
  if (t)
    for (let e = 0; e < t.length; e++)
      t[e].flags |= 8;
}
const zu = Symbol.for("v-scx"), Hu = () => Gs(zu);
function On(t, e, n) {
  return nl(t, e, n);
}
function nl(t, e, n = Ve) {
  const { immediate: s, deep: r, flush: o, once: i } = n, a = _t({}, n), l = e && s || !e && o !== "post";
  let c;
  if (Ss) {
    if (o === "sync") {
      const L = Hu();
      c = L.__watcherHandles || (L.__watcherHandles = []);
    } else if (!l) {
      const L = () => {
      };
      return L.stop = Gt, L.resume = Gt, L.pause = Gt, L;
    }
  }
  const u = xt;
  a.call = (L, B, V) => Xt(L, u, B, V);
  let y = !1;
  o === "post" ? a.scheduler = (L) => {
    It(L, u && u.suspense);
  } : o !== "sync" && (y = !0, a.scheduler = (L, B) => {
    B ? L() : Pi(L);
  }), a.augmentJob = (L) => {
    e && (L.flags |= 4), y && (L.flags |= 2, u && (L.id = u.uid, L.i = u));
  };
  const p = tu(t, e, a);
  return Ss && (c ? c.push(p) : l && p()), p;
}
function Wu(t, e, n) {
  const s = this.proxy, r = at(t) ? t.includes(".") ? sl(s, t) : () => s[t] : t.bind(s, s);
  let o;
  me(e) ? o = e : (o = e.handler, n = e);
  const i = Ts(this), a = nl(r, o.bind(s), n);
  return i(), a;
}
function sl(t, e) {
  const n = e.split(".");
  return () => {
    let s = t;
    for (let r = 0; r < n.length && s; r++)
      s = s[n[r]];
    return s;
  };
}
const qu = (t, e) => e === "modelValue" || e === "model-value" ? t.modelModifiers : t[`${e}Modifiers`] || t[`${bn(e)}Modifiers`] || t[`${xn(e)}Modifiers`];
function ju(t, e, ...n) {
  if (t.isUnmounted) return;
  const s = t.vnode.props || Ve;
  let r = n;
  const o = e.startsWith("update:"), i = o && qu(s, e.slice(7));
  i && (i.trim && (r = n.map((u) => at(u) ? u.trim() : u)), i.number && (r = n.map(ei)));
  let a, l = s[a = Fr(e)] || // also try camelCase event handler (#2249)
  s[a = Fr(bn(e))];
  !l && o && (l = s[a = Fr(xn(e))]), l && Xt(
    l,
    t,
    6,
    r
  );
  const c = s[a + "Once"];
  if (c) {
    if (!t.emitted)
      t.emitted = {};
    else if (t.emitted[a])
      return;
    t.emitted[a] = !0, Xt(
      c,
      t,
      6,
      r
    );
  }
}
function rl(t, e, n = !1) {
  const s = e.emitsCache, r = s.get(t);
  if (r !== void 0)
    return r;
  const o = t.emits;
  let i = {}, a = !1;
  if (!me(t)) {
    const l = (c) => {
      const u = rl(c, e, !0);
      u && (a = !0, _t(i, u));
    };
    !n && e.mixins.length && e.mixins.forEach(l), t.extends && l(t.extends), t.mixins && t.mixins.forEach(l);
  }
  return !o && !a ? (nt(t) && s.set(t, null), null) : (ue(o) ? o.forEach((l) => i[l] = null) : _t(i, o), nt(t) && s.set(t, i), i);
}
function br(t, e) {
  return !t || !hr(e) ? !1 : (e = e.slice(2).replace(/Once$/, ""), Be(t, e[0].toLowerCase() + e.slice(1)) || Be(t, xn(e)) || Be(t, e));
}
function wo(t) {
  const {
    type: e,
    vnode: n,
    proxy: s,
    withProxy: r,
    propsOptions: [o],
    slots: i,
    attrs: a,
    emit: l,
    render: c,
    renderCache: u,
    props: y,
    data: p,
    setupState: L,
    ctx: B,
    inheritAttrs: V
  } = t, Te = or(t);
  let se, ce;
  try {
    if (n.shapeFlag & 4) {
      const U = r || s, z = U;
      se = Kt(
        c.call(
          z,
          U,
          u,
          y,
          L,
          p,
          B
        )
      ), ce = a;
    } else {
      const U = e;
      se = Kt(
        U.length > 1 ? U(
          y,
          { attrs: a, slots: i, emit: l }
        ) : U(
          y,
          null
        )
      ), ce = e.props ? a : Vu(a);
    }
  } catch (U) {
    ys.length = 0, _r(U, t, 1), se = Yt(wn);
  }
  let he = se;
  if (ce && V !== !1) {
    const U = Object.keys(ce), { shapeFlag: z } = he;
    U.length && z & 7 && (o && U.some(xi) && (ce = Ku(
      ce,
      o
    )), he = Kn(he, ce, !1, !0));
  }
  return n.dirs && (he = Kn(he, null, !1, !0), he.dirs = he.dirs ? he.dirs.concat(n.dirs) : n.dirs), n.transition && Di(he, n.transition), se = he, or(Te), se;
}
const Vu = (t) => {
  let e;
  for (const n in t)
    (n === "class" || n === "style" || hr(n)) && ((e || (e = {}))[n] = t[n]);
  return e;
}, Ku = (t, e) => {
  const n = {};
  for (const s in t)
    (!xi(s) || !(s.slice(9) in e)) && (n[s] = t[s]);
  return n;
};
function Gu(t, e, n) {
  const { props: s, children: r, component: o } = t, { props: i, children: a, patchFlag: l } = e, c = o.emitsOptions;
  if (e.dirs || e.transition)
    return !0;
  if (n && l >= 0) {
    if (l & 1024)
      return !0;
    if (l & 16)
      return s ? ko(s, i, c) : !!i;
    if (l & 8) {
      const u = e.dynamicProps;
      for (let y = 0; y < u.length; y++) {
        const p = u[y];
        if (i[p] !== s[p] && !br(c, p))
          return !0;
      }
    }
  } else
    return (r || a) && (!a || !a.$stable) ? !0 : s === i ? !1 : s ? i ? ko(s, i, c) : !0 : !!i;
  return !1;
}
function ko(t, e, n) {
  const s = Object.keys(e);
  if (s.length !== Object.keys(t).length)
    return !0;
  for (let r = 0; r < s.length; r++) {
    const o = s[r];
    if (e[o] !== t[o] && !br(n, o))
      return !0;
  }
  return !1;
}
function Yu({ vnode: t, parent: e }, n) {
  for (; e; ) {
    const s = e.subTree;
    if (s.suspense && s.suspense.activeBranch === t && (s.el = t.el), s === t)
      (t = e.vnode).el = n, e = e.parent;
    else
      break;
  }
}
const il = (t) => t.__isSuspense;
function $u(t, e) {
  e && e.pendingBranch ? ue(t) ? e.effects.push(...t) : e.effects.push(t) : ru(t);
}
const Qe = Symbol.for("v-fgt"), vr = Symbol.for("v-txt"), wn = Symbol.for("v-cmt"), Ys = Symbol.for("v-stc"), ys = [];
let Lt = null;
function R(t = !1) {
  ys.push(Lt = t ? null : []);
}
function Xu() {
  ys.pop(), Lt = ys[ys.length - 1] || null;
}
let xs = 1;
function xo(t, e = !1) {
  xs += t, t < 0 && Lt && e && (Lt.hasOnce = !0);
}
function ol(t) {
  return t.dynamicChildren = xs > 0 ? Lt || Hn : null, Xu(), xs > 0 && Lt && Lt.push(t), t;
}
function I(t, e, n, s, r, o) {
  return ol(
    v(
      t,
      e,
      n,
      s,
      r,
      o,
      !0
    )
  );
}
function Zu(t, e, n, s, r) {
  return ol(
    Yt(
      t,
      e,
      n,
      s,
      r,
      !0
    )
  );
}
function al(t) {
  return t ? t.__v_isVNode === !0 : !1;
}
function es(t, e) {
  return t.type === e.type && t.key === e.key;
}
const ll = ({ key: t }) => t ?? null, $s = ({
  ref: t,
  ref_key: e,
  ref_for: n
}) => (typeof t == "number" && (t = "" + t), t != null ? at(t) || mt(t) || me(t) ? { i: Nt, r: t, k: e, f: !!n } : t : null);
function v(t, e = null, n = null, s = 0, r = null, o = t === Qe ? 0 : 1, i = !1, a = !1) {
  const l = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: t,
    props: e,
    key: e && ll(e),
    ref: e && $s(e),
    scopeId: Ba,
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
    shapeFlag: o,
    patchFlag: s,
    dynamicProps: r,
    dynamicChildren: null,
    appContext: null,
    ctx: Nt
  };
  return a ? (Ui(l, n), o & 128 && t.normalize(l)) : n && (l.shapeFlag |= at(n) ? 8 : 16), xs > 0 && // avoid a block node from tracking itself
  !i && // has current parent block
  Lt && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (l.patchFlag > 0 || o & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  l.patchFlag !== 32 && Lt.push(l), l;
}
const Yt = Ju;
function Ju(t, e = null, n = null, s = 0, r = null, o = !1) {
  if ((!t || t === vu) && (t = wn), al(t)) {
    const a = Kn(
      t,
      e,
      !0
      /* mergeRef: true */
    );
    return n && Ui(a, n), xs > 0 && !o && Lt && (a.shapeFlag & 6 ? Lt[Lt.indexOf(t)] = a : Lt.push(a)), a.patchFlag = -2, a;
  }
  if (uf(t) && (t = t.__vccOpts), e) {
    e = Qu(e);
    let { class: a, style: l } = e;
    a && !at(a) && (e.class = Ge(a)), nt(l) && (Fi(l) && !ue(l) && (l = _t({}, l)), e.style = Ne(l));
  }
  const i = at(t) ? 1 : il(t) ? 128 : au(t) ? 64 : nt(t) ? 4 : me(t) ? 2 : 0;
  return v(
    t,
    e,
    n,
    s,
    r,
    i,
    o,
    !0
  );
}
function Qu(t) {
  return t ? Fi(t) || Ya(t) ? _t({}, t) : t : null;
}
function Kn(t, e, n = !1, s = !1) {
  const { props: r, ref: o, patchFlag: i, children: a, transition: l } = t, c = e ? ef(r || {}, e) : r, u = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: t.type,
    props: c,
    key: c && ll(c),
    ref: e && e.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && o ? ue(o) ? o.concat($s(e)) : [o, $s(e)] : $s(e)
    ) : o,
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
    patchFlag: e && t.type !== Qe ? i === -1 ? 16 : i | 16 : i,
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
    ssContent: t.ssContent && Kn(t.ssContent),
    ssFallback: t.ssFallback && Kn(t.ssFallback),
    placeholder: t.placeholder,
    el: t.el,
    anchor: t.anchor,
    ctx: t.ctx,
    ce: t.ce
  };
  return l && s && Di(
    u,
    l.clone(u)
  ), u;
}
function Qt(t = " ", e = 0) {
  return Yt(vr, null, t, e);
}
function Rn(t, e) {
  const n = Yt(Ys, null, t);
  return n.staticCount = e, n;
}
function pe(t = "", e = !1) {
  return e ? (R(), Zu(wn, null, t)) : Yt(wn, null, t);
}
function Kt(t) {
  return t == null || typeof t == "boolean" ? Yt(wn) : ue(t) ? Yt(
    Qe,
    null,
    // #3666, avoid reference pollution when reusing vnode
    t.slice()
  ) : al(t) ? gn(t) : Yt(vr, null, String(t));
}
function gn(t) {
  return t.el === null && t.patchFlag !== -1 || t.memo ? t : Kn(t);
}
function Ui(t, e) {
  let n = 0;
  const { shapeFlag: s } = t;
  if (e == null)
    e = null;
  else if (ue(e))
    n = 16;
  else if (typeof e == "object")
    if (s & 65) {
      const r = e.default;
      r && (r._c && (r._d = !1), Ui(t, r()), r._c && (r._d = !0));
      return;
    } else {
      n = 32;
      const r = e._;
      !r && !Ya(e) ? e._ctx = Nt : r === 3 && Nt && (Nt.slots._ === 1 ? e._ = 1 : (e._ = 2, t.patchFlag |= 1024));
    }
  else me(e) ? (e = { default: e, _ctx: Nt }, n = 32) : (e = String(e), s & 64 ? (n = 16, e = [Qt(e)]) : n = 8);
  t.children = e, t.shapeFlag |= n;
}
function ef(...t) {
  const e = {};
  for (let n = 0; n < t.length; n++) {
    const s = t[n];
    for (const r in s)
      if (r === "class")
        e.class !== s.class && (e.class = Ge([e.class, s.class]));
      else if (r === "style")
        e.style = Ne([e.style, s.style]);
      else if (hr(r)) {
        const o = e[r], i = s[r];
        i && o !== i && !(ue(o) && o.includes(i)) && (e[r] = o ? [].concat(o, i) : i);
      } else r !== "" && (e[r] = s[r]);
  }
  return e;
}
function qt(t, e, n, s = null) {
  Xt(t, e, 7, [
    n,
    s
  ]);
}
const tf = Va();
let nf = 0;
function sf(t, e, n) {
  const s = t.type, r = (e ? e.appContext : t.appContext) || tf, o = {
    uid: nf++,
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
    scope: new Tc(
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
    propsOptions: Xa(s, r),
    emitsOptions: rl(s, r),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: Ve,
    // inheritAttrs
    inheritAttrs: s.inheritAttrs,
    // state
    ctx: Ve,
    data: Ve,
    props: Ve,
    attrs: Ve,
    slots: Ve,
    refs: Ve,
    setupState: Ve,
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
  return o.ctx = { _: o }, o.root = e ? e.root : o, o.emit = ju.bind(null, o), t.ce && t.ce(o), o;
}
let xt = null;
const rf = () => xt || Nt;
let lr, ci;
{
  const t = gr(), e = (n, s) => {
    let r;
    return (r = t[n]) || (r = t[n] = []), r.push(s), (o) => {
      r.length > 1 ? r.forEach((i) => i(o)) : r[0](o);
    };
  };
  lr = e(
    "__VUE_INSTANCE_SETTERS__",
    (n) => xt = n
  ), ci = e(
    "__VUE_SSR_SETTERS__",
    (n) => Ss = n
  );
}
const Ts = (t) => {
  const e = xt;
  return lr(t), t.scope.on(), () => {
    t.scope.off(), lr(e);
  };
}, So = () => {
  xt && xt.scope.off(), lr(null);
};
function cl(t) {
  return t.vnode.shapeFlag & 4;
}
let Ss = !1;
function of(t, e = !1, n = !1) {
  e && ci(e);
  const { props: s, children: r } = t.vnode, o = cl(t);
  Iu(t, s, o, e), Pu(t, r, n || e);
  const i = o ? af(t, e) : void 0;
  return e && ci(!1), i;
}
function af(t, e) {
  const n = t.type;
  t.accessCache = /* @__PURE__ */ Object.create(null), t.proxy = new Proxy(t.ctx, wu);
  const { setup: s } = n;
  if (s) {
    an();
    const r = t.setupContext = s.length > 1 ? cf(t) : null, o = Ts(t), i = As(
      s,
      t,
      0,
      [
        t.props,
        r
      ]
    ), a = ua(i);
    if (ln(), o(), (a || t.sp) && !ms(t) && Ua(t), a) {
      if (i.then(So, So), e)
        return i.then((l) => {
          Ao(t, l);
        }).catch((l) => {
          _r(l, t, 0);
        });
      t.asyncDep = i;
    } else
      Ao(t, i);
  } else
    ul(t);
}
function Ao(t, e, n) {
  me(e) ? t.type.__ssrInlineRender ? t.ssrRender = e : t.render = e : nt(e) && (t.setupState = Oa(e)), ul(t);
}
function ul(t, e, n) {
  const s = t.type;
  t.render || (t.render = s.render || Gt);
  {
    const r = Ts(t);
    an();
    try {
      ku(t);
    } finally {
      ln(), r();
    }
  }
}
const lf = {
  get(t, e) {
    return gt(t, "get", ""), t[e];
  }
};
function cf(t) {
  const e = (n) => {
    t.exposed = n || {};
  };
  return {
    attrs: new Proxy(t.attrs, lf),
    slots: t.slots,
    emit: t.emit,
    expose: e
  };
}
function wr(t) {
  return t.exposed ? t.exposeProxy || (t.exposeProxy = new Proxy(Oa(Gc(t.exposed)), {
    get(e, n) {
      if (n in e)
        return e[n];
      if (n in _s)
        return _s[n](t);
    },
    has(e, n) {
      return n in e || n in _s;
    }
  })) : t.proxy;
}
function uf(t) {
  return me(t) && "__vccOpts" in t;
}
const We = (t, e) => Qc(t, e, Ss), ff = "3.5.18";
/**
* @vue/runtime-dom v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let ui;
const To = typeof window < "u" && window.trustedTypes;
if (To)
  try {
    ui = /* @__PURE__ */ To.createPolicy("vue", {
      createHTML: (t) => t
    });
  } catch {
  }
const fl = ui ? (t) => ui.createHTML(t) : (t) => t, hf = "http://www.w3.org/2000/svg", df = "http://www.w3.org/1998/Math/MathML", tn = typeof document < "u" ? document : null, Eo = tn && /* @__PURE__ */ tn.createElement("template"), pf = {
  insert: (t, e, n) => {
    e.insertBefore(t, n || null);
  },
  remove: (t) => {
    const e = t.parentNode;
    e && e.removeChild(t);
  },
  createElement: (t, e, n, s) => {
    const r = e === "svg" ? tn.createElementNS(hf, t) : e === "mathml" ? tn.createElementNS(df, t) : n ? tn.createElement(t, { is: n }) : tn.createElement(t);
    return t === "select" && s && s.multiple != null && r.setAttribute("multiple", s.multiple), r;
  },
  createText: (t) => tn.createTextNode(t),
  createComment: (t) => tn.createComment(t),
  setText: (t, e) => {
    t.nodeValue = e;
  },
  setElementText: (t, e) => {
    t.textContent = e;
  },
  parentNode: (t) => t.parentNode,
  nextSibling: (t) => t.nextSibling,
  querySelector: (t) => tn.querySelector(t),
  setScopeId(t, e) {
    t.setAttribute(e, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(t, e, n, s, r, o) {
    const i = n ? n.previousSibling : e.lastChild;
    if (r && (r === o || r.nextSibling))
      for (; e.insertBefore(r.cloneNode(!0), n), !(r === o || !(r = r.nextSibling)); )
        ;
    else {
      Eo.innerHTML = fl(
        s === "svg" ? `<svg>${t}</svg>` : s === "mathml" ? `<math>${t}</math>` : t
      );
      const a = Eo.content;
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
      i ? i.nextSibling : e.firstChild,
      // last
      n ? n.previousSibling : e.lastChild
    ];
  }
}, gf = Symbol("_vtc");
function mf(t, e, n) {
  const s = t[gf];
  s && (e = (e ? [e, ...s] : [...s]).join(" ")), e == null ? t.removeAttribute("class") : n ? t.setAttribute("class", e) : t.className = e;
}
const Co = Symbol("_vod"), _f = Symbol("_vsh"), yf = Symbol(""), bf = /(^|;)\s*display\s*:/;
function vf(t, e, n) {
  const s = t.style, r = at(n);
  let o = !1;
  if (n && !r) {
    if (e)
      if (at(e))
        for (const i of e.split(";")) {
          const a = i.slice(0, i.indexOf(":")).trim();
          n[a] == null && Xs(s, a, "");
        }
      else
        for (const i in e)
          n[i] == null && Xs(s, i, "");
    for (const i in n)
      i === "display" && (o = !0), Xs(s, i, n[i]);
  } else if (r) {
    if (e !== n) {
      const i = s[yf];
      i && (n += ";" + i), s.cssText = n, o = bf.test(n);
    }
  } else e && t.removeAttribute("style");
  Co in t && (t[Co] = o ? s.display : "", t[_f] && (s.display = "none"));
}
const Ro = /\s*!important$/;
function Xs(t, e, n) {
  if (ue(n))
    n.forEach((s) => Xs(t, e, s));
  else if (n == null && (n = ""), e.startsWith("--"))
    t.setProperty(e, n);
  else {
    const s = wf(t, e);
    Ro.test(n) ? t.setProperty(
      xn(s),
      n.replace(Ro, ""),
      "important"
    ) : t[s] = n;
  }
}
const Io = ["Webkit", "Moz", "ms"], zr = {};
function wf(t, e) {
  const n = zr[e];
  if (n)
    return n;
  let s = bn(e);
  if (s !== "filter" && s in t)
    return zr[e] = s;
  s = da(s);
  for (let r = 0; r < Io.length; r++) {
    const o = Io[r] + s;
    if (o in t)
      return zr[e] = o;
  }
  return e;
}
const Lo = "http://www.w3.org/1999/xlink";
function Oo(t, e, n, s, r, o = Ac(e)) {
  s && e.startsWith("xlink:") ? n == null ? t.removeAttributeNS(Lo, e.slice(6, e.length)) : t.setAttributeNS(Lo, e, n) : n == null || o && !pa(n) ? t.removeAttribute(e) : t.setAttribute(
    e,
    o ? "" : kn(n) ? String(n) : n
  );
}
function Fo(t, e, n, s, r) {
  if (e === "innerHTML" || e === "textContent") {
    n != null && (t[e] = e === "innerHTML" ? fl(n) : n);
    return;
  }
  const o = t.tagName;
  if (e === "value" && o !== "PROGRESS" && // custom elements may use _value internally
  !o.includes("-")) {
    const a = o === "OPTION" ? t.getAttribute("value") || "" : t.value, l = n == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      t.type === "checkbox" ? "on" : ""
    ) : String(n);
    (a !== l || !("_value" in t)) && (t.value = l), n == null && t.removeAttribute(e), t._value = n;
    return;
  }
  let i = !1;
  if (n === "" || n == null) {
    const a = typeof t[e];
    a === "boolean" ? n = pa(n) : n == null && a === "string" ? (n = "", i = !0) : a === "number" && (n = 0, i = !0);
  }
  try {
    t[e] = n;
  } catch {
  }
  i && t.removeAttribute(r || e);
}
function zn(t, e, n, s) {
  t.addEventListener(e, n, s);
}
function kf(t, e, n, s) {
  t.removeEventListener(e, n, s);
}
const Po = Symbol("_vei");
function xf(t, e, n, s, r = null) {
  const o = t[Po] || (t[Po] = {}), i = o[e];
  if (s && i)
    i.value = s;
  else {
    const [a, l] = Sf(e);
    if (s) {
      const c = o[e] = Ef(
        s,
        r
      );
      zn(t, a, c, l);
    } else i && (kf(t, a, i, l), o[e] = void 0);
  }
}
const Do = /(?:Once|Passive|Capture)$/;
function Sf(t) {
  let e;
  if (Do.test(t)) {
    e = {};
    let s;
    for (; s = t.match(Do); )
      t = t.slice(0, t.length - s[0].length), e[s[0].toLowerCase()] = !0;
  }
  return [t[2] === ":" ? t.slice(3) : xn(t.slice(2)), e];
}
let Hr = 0;
const Af = /* @__PURE__ */ Promise.resolve(), Tf = () => Hr || (Af.then(() => Hr = 0), Hr = Date.now());
function Ef(t, e) {
  const n = (s) => {
    if (!s._vts)
      s._vts = Date.now();
    else if (s._vts <= n.attached)
      return;
    Xt(
      Cf(s, n.value),
      e,
      5,
      [s]
    );
  };
  return n.value = t, n.attached = Tf(), n;
}
function Cf(t, e) {
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
const No = (t) => t.charCodeAt(0) === 111 && t.charCodeAt(1) === 110 && // lowercase letter
t.charCodeAt(2) > 96 && t.charCodeAt(2) < 123, Rf = (t, e, n, s, r, o) => {
  const i = r === "svg";
  e === "class" ? mf(t, s, i) : e === "style" ? vf(t, n, s) : hr(e) ? xi(e) || xf(t, e, n, s, o) : (e[0] === "." ? (e = e.slice(1), !0) : e[0] === "^" ? (e = e.slice(1), !1) : If(t, e, s, i)) ? (Fo(t, e, s), !t.tagName.includes("-") && (e === "value" || e === "checked" || e === "selected") && Oo(t, e, s, i, o, e !== "value")) : /* #11081 force set props for possible async custom element */ t._isVueCE && (/[A-Z]/.test(e) || !at(s)) ? Fo(t, bn(e), s, o, e) : (e === "true-value" ? t._trueValue = s : e === "false-value" && (t._falseValue = s), Oo(t, e, s, i));
};
function If(t, e, n, s) {
  if (s)
    return !!(e === "innerHTML" || e === "textContent" || e in t && No(e) && me(n));
  if (e === "spellcheck" || e === "draggable" || e === "translate" || e === "autocorrect" || e === "form" || e === "list" && t.tagName === "INPUT" || e === "type" && t.tagName === "TEXTAREA")
    return !1;
  if (e === "width" || e === "height") {
    const r = t.tagName;
    if (r === "IMG" || r === "VIDEO" || r === "CANVAS" || r === "SOURCE")
      return !1;
  }
  return No(e) && at(n) ? !1 : e in t;
}
const Mo = (t) => {
  const e = t.props["onUpdate:modelValue"] || !1;
  return ue(e) ? (n) => Ks(e, n) : e;
};
function Lf(t) {
  t.target.composing = !0;
}
function Bo(t) {
  const e = t.target;
  e.composing && (e.composing = !1, e.dispatchEvent(new Event("input")));
}
const Wr = Symbol("_assign"), In = {
  created(t, { modifiers: { lazy: e, trim: n, number: s } }, r) {
    t[Wr] = Mo(r);
    const o = s || r.props && r.props.type === "number";
    zn(t, e ? "change" : "input", (i) => {
      if (i.target.composing) return;
      let a = t.value;
      n && (a = a.trim()), o && (a = ei(a)), t[Wr](a);
    }), n && zn(t, "change", () => {
      t.value = t.value.trim();
    }), e || (zn(t, "compositionstart", Lf), zn(t, "compositionend", Bo), zn(t, "change", Bo));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(t, { value: e }) {
    t.value = e ?? "";
  },
  beforeUpdate(t, { value: e, oldValue: n, modifiers: { lazy: s, trim: r, number: o } }, i) {
    if (t[Wr] = Mo(i), t.composing) return;
    const a = (o || t.type === "number") && !/^0\d/.test(t.value) ? ei(t.value) : t.value, l = e ?? "";
    a !== l && (document.activeElement === t && t.type !== "range" && (s && e === n || r && t.value.trim() === l) || (t.value = l));
  }
}, Of = ["ctrl", "shift", "alt", "meta"], Ff = {
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
  exact: (t, e) => Of.some((n) => t[`${n}Key`] && !e.includes(n))
}, Mn = (t, e) => {
  const n = t._withMods || (t._withMods = {}), s = e.join(".");
  return n[s] || (n[s] = (r, ...o) => {
    for (let i = 0; i < e.length; i++) {
      const a = Ff[e[i]];
      if (a && a(r, e)) return;
    }
    return t(r, ...o);
  });
}, Pf = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, Uo = (t, e) => {
  const n = t._withKeys || (t._withKeys = {}), s = e.join(".");
  return n[s] || (n[s] = (r) => {
    if (!("key" in r))
      return;
    const o = xn(r.key);
    if (e.some(
      (i) => i === o || Pf[i] === o
    ))
      return t(r);
  });
}, Df = /* @__PURE__ */ _t({ patchProp: Rf }, pf);
let zo;
function Nf() {
  return zo || (zo = Nu(Df));
}
const Mf = (...t) => {
  const e = Nf().createApp(...t), { mount: n } = e;
  return e.mount = (s) => {
    const r = Uf(s);
    if (!r) return;
    const o = e._component;
    !me(o) && !o.render && !o.template && (o.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
    const i = n(r, !1, Bf(r));
    return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), i;
  }, e;
};
function Bf(t) {
  if (t instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && t instanceof MathMLElement)
    return "mathml";
}
function Uf(t) {
  return at(t) ? document.querySelector(t) : t;
}
const dn = (t) => {
  const e = t.replace("#", ""), n = parseInt(e.substr(0, 2), 16), s = parseInt(e.substr(2, 2), 16), r = parseInt(e.substr(4, 2), 16);
  return (n * 299 + s * 587 + r * 114) / 1e3 < 128;
}, zf = (t, e) => {
  const n = t.replace("#", ""), s = parseInt(n.substr(0, 2), 16), r = parseInt(n.substr(2, 2), 16), o = parseInt(n.substr(4, 2), 16), i = dn(t), a = i ? Math.min(255, s + e) : Math.max(0, s - e), l = i ? Math.min(255, r + e) : Math.max(0, r - e), c = i ? Math.min(255, o + e) : Math.max(0, o - e);
  return `#${a.toString(16).padStart(2, "0")}${l.toString(16).padStart(2, "0")}${c.toString(16).padStart(2, "0")}`;
}, zs = (t) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t), Hf = (t) => {
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
function zi() {
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
var Dn = zi();
function hl(t) {
  Dn = t;
}
var bs = { exec: () => null };
function Ue(t, e = "") {
  let n = typeof t == "string" ? t : t.source;
  const s = {
    replace: (r, o) => {
      let i = typeof o == "string" ? o : o.source;
      return i = i.replace(St.caret, "$1"), n = n.replace(r, i), s;
    },
    getRegex: () => new RegExp(n, e)
  };
  return s;
}
var St = {
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
}, Wf = /^(?:[ \t]*(?:\n|$))+/, qf = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/, jf = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, Es = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, Vf = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, Hi = /(?:[*+-]|\d{1,9}[.)])/, dl = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/, pl = Ue(dl).replace(/bull/g, Hi).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(), Kf = Ue(dl).replace(/bull/g, Hi).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(), Wi = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/, Gf = /^[^\n]+/, qi = /(?!\s*\])(?:\\.|[^\[\]\\])+/, Yf = Ue(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", qi).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), $f = Ue(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, Hi).getRegex(), kr = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", ji = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, Xf = Ue(
  "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))",
  "i"
).replace("comment", ji).replace("tag", kr).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), gl = Ue(Wi).replace("hr", Es).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", kr).getRegex(), Zf = Ue(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", gl).getRegex(), Vi = {
  blockquote: Zf,
  code: qf,
  def: Yf,
  fences: jf,
  heading: Vf,
  hr: Es,
  html: Xf,
  lheading: pl,
  list: $f,
  newline: Wf,
  paragraph: gl,
  table: bs,
  text: Gf
}, Ho = Ue(
  "^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"
).replace("hr", Es).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", kr).getRegex(), Jf = {
  ...Vi,
  lheading: Kf,
  table: Ho,
  paragraph: Ue(Wi).replace("hr", Es).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", Ho).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", kr).getRegex()
}, Qf = {
  ...Vi,
  html: Ue(
    `^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`
  ).replace("comment", ji).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
  heading: /^(#{1,6})(.*)(?:\n+|$)/,
  fences: bs,
  // fences not supported
  lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  paragraph: Ue(Wi).replace("hr", Es).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", pl).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
}, eh = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, th = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, ml = /^( {2,}|\\)\n(?!\s*$)/, nh = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, xr = /[\p{P}\p{S}]/u, Ki = /[\s\p{P}\p{S}]/u, _l = /[^\s\p{P}\p{S}]/u, sh = Ue(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, Ki).getRegex(), yl = /(?!~)[\p{P}\p{S}]/u, rh = /(?!~)[\s\p{P}\p{S}]/u, ih = /(?:[^\s\p{P}\p{S}]|~)/u, oh = /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g, bl = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/, ah = Ue(bl, "u").replace(/punct/g, xr).getRegex(), lh = Ue(bl, "u").replace(/punct/g, yl).getRegex(), vl = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", ch = Ue(vl, "gu").replace(/notPunctSpace/g, _l).replace(/punctSpace/g, Ki).replace(/punct/g, xr).getRegex(), uh = Ue(vl, "gu").replace(/notPunctSpace/g, ih).replace(/punctSpace/g, rh).replace(/punct/g, yl).getRegex(), fh = Ue(
  "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)",
  "gu"
).replace(/notPunctSpace/g, _l).replace(/punctSpace/g, Ki).replace(/punct/g, xr).getRegex(), hh = Ue(/\\(punct)/, "gu").replace(/punct/g, xr).getRegex(), dh = Ue(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), ph = Ue(ji).replace("(?:-->|$)", "-->").getRegex(), gh = Ue(
  "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>"
).replace("comment", ph).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), cr = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/, mh = Ue(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", cr).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), wl = Ue(/^!?\[(label)\]\[(ref)\]/).replace("label", cr).replace("ref", qi).getRegex(), kl = Ue(/^!?\[(ref)\](?:\[\])?/).replace("ref", qi).getRegex(), _h = Ue("reflink|nolink(?!\\()", "g").replace("reflink", wl).replace("nolink", kl).getRegex(), Gi = {
  _backpedal: bs,
  // only used for GFM url
  anyPunctuation: hh,
  autolink: dh,
  blockSkip: oh,
  br: ml,
  code: th,
  del: bs,
  emStrongLDelim: ah,
  emStrongRDelimAst: ch,
  emStrongRDelimUnd: fh,
  escape: eh,
  link: mh,
  nolink: kl,
  punctuation: sh,
  reflink: wl,
  reflinkSearch: _h,
  tag: gh,
  text: nh,
  url: bs
}, yh = {
  ...Gi,
  link: Ue(/^!?\[(label)\]\((.*?)\)/).replace("label", cr).getRegex(),
  reflink: Ue(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", cr).getRegex()
}, fi = {
  ...Gi,
  emStrongRDelimAst: uh,
  emStrongLDelim: lh,
  url: Ue(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, "i").replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
  _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
}, bh = {
  ...fi,
  br: Ue(ml).replace("{2,}", "*").getRegex(),
  text: Ue(fi.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
}, Hs = {
  normal: Vi,
  gfm: Jf,
  pedantic: Qf
}, ts = {
  normal: Gi,
  gfm: fi,
  breaks: bh,
  pedantic: yh
}, vh = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}, Wo = (t) => vh[t];
function jt(t, e) {
  if (e) {
    if (St.escapeTest.test(t))
      return t.replace(St.escapeReplace, Wo);
  } else if (St.escapeTestNoEncode.test(t))
    return t.replace(St.escapeReplaceNoEncode, Wo);
  return t;
}
function qo(t) {
  try {
    t = encodeURI(t).replace(St.percentDecode, "%");
  } catch {
    return null;
  }
  return t;
}
function jo(t, e) {
  var o;
  const n = t.replace(St.findPipe, (i, a, l) => {
    let c = !1, u = a;
    for (; --u >= 0 && l[u] === "\\"; ) c = !c;
    return c ? "|" : " |";
  }), s = n.split(St.splitPipe);
  let r = 0;
  if (s[0].trim() || s.shift(), s.length > 0 && !((o = s.at(-1)) != null && o.trim()) && s.pop(), e)
    if (s.length > e)
      s.splice(e);
    else
      for (; s.length < e; ) s.push("");
  for (; r < s.length; r++)
    s[r] = s[r].trim().replace(St.slashPipe, "|");
  return s;
}
function ns(t, e, n) {
  const s = t.length;
  if (s === 0)
    return "";
  let r = 0;
  for (; r < s && t.charAt(s - r - 1) === e; )
    r++;
  return t.slice(0, s - r);
}
function wh(t, e) {
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
function Vo(t, e, n, s, r) {
  const o = e.href, i = e.title || null, a = t[1].replace(r.other.outputLinkReplace, "$1");
  s.state.inLink = !0;
  const l = {
    type: t[0].charAt(0) === "!" ? "image" : "link",
    raw: n,
    href: o,
    title: i,
    text: a,
    tokens: s.inlineTokens(a)
  };
  return s.state.inLink = !1, l;
}
function kh(t, e, n) {
  const s = t.match(n.other.indentCodeCompensation);
  if (s === null)
    return e;
  const r = s[1];
  return e.split(`
`).map((o) => {
    const i = o.match(n.other.beginningSpace);
    if (i === null)
      return o;
    const [a] = i;
    return a.length >= r.length ? o.slice(r.length) : o;
  }).join(`
`);
}
var ur = class {
  // set by the lexer
  constructor(t) {
    je(this, "options");
    je(this, "rules");
    // set by the lexer
    je(this, "lexer");
    this.options = t || Dn;
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
        text: this.options.pedantic ? n : ns(n, `
`)
      };
    }
  }
  fences(t) {
    const e = this.rules.block.fences.exec(t);
    if (e) {
      const n = e[0], s = kh(n, e[3] || "", this.rules);
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
        const s = ns(n, "#");
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
        raw: ns(e[0], `
`)
      };
  }
  blockquote(t) {
    const e = this.rules.block.blockquote.exec(t);
    if (e) {
      let n = ns(e[0], `
`).split(`
`), s = "", r = "";
      const o = [];
      for (; n.length > 0; ) {
        let i = !1;
        const a = [];
        let l;
        for (l = 0; l < n.length; l++)
          if (this.rules.other.blockquoteStart.test(n[l]))
            a.push(n[l]), i = !0;
          else if (!i)
            a.push(n[l]);
          else
            break;
        n = n.slice(l);
        const c = a.join(`
`), u = c.replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
        s = s ? `${s}
${c}` : c, r = r ? `${r}
${u}` : u;
        const y = this.lexer.state.top;
        if (this.lexer.state.top = !0, this.lexer.blockTokens(u, o, !0), this.lexer.state.top = y, n.length === 0)
          break;
        const p = o.at(-1);
        if ((p == null ? void 0 : p.type) === "code")
          break;
        if ((p == null ? void 0 : p.type) === "blockquote") {
          const L = p, B = L.raw + `
` + n.join(`
`), V = this.blockquote(B);
          o[o.length - 1] = V, s = s.substring(0, s.length - L.raw.length) + V.raw, r = r.substring(0, r.length - L.text.length) + V.text;
          break;
        } else if ((p == null ? void 0 : p.type) === "list") {
          const L = p, B = L.raw + `
` + n.join(`
`), V = this.list(B);
          o[o.length - 1] = V, s = s.substring(0, s.length - p.raw.length) + V.raw, r = r.substring(0, r.length - L.raw.length) + V.raw, n = B.substring(o.at(-1).raw.length).split(`
`);
          continue;
        }
      }
      return {
        type: "blockquote",
        raw: s,
        tokens: o,
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
      const o = this.rules.other.listItemRegex(n);
      let i = !1;
      for (; t; ) {
        let l = !1, c = "", u = "";
        if (!(e = o.exec(t)) || this.rules.block.hr.test(t))
          break;
        c = e[0], t = t.substring(c.length);
        let y = e[2].split(`
`, 1)[0].replace(this.rules.other.listReplaceTabs, (se) => " ".repeat(3 * se.length)), p = t.split(`
`, 1)[0], L = !y.trim(), B = 0;
        if (this.options.pedantic ? (B = 2, u = y.trimStart()) : L ? B = e[1].length + 1 : (B = e[2].search(this.rules.other.nonSpaceChar), B = B > 4 ? 1 : B, u = y.slice(B), B += e[1].length), L && this.rules.other.blankLine.test(p) && (c += p + `
`, t = t.substring(p.length + 1), l = !0), !l) {
          const se = this.rules.other.nextBulletRegex(B), ce = this.rules.other.hrRegex(B), he = this.rules.other.fencesBeginRegex(B), U = this.rules.other.headingBeginRegex(B), z = this.rules.other.htmlBeginRegex(B);
          for (; t; ) {
            const $ = t.split(`
`, 1)[0];
            let Y;
            if (p = $, this.options.pedantic ? (p = p.replace(this.rules.other.listReplaceNesting, "  "), Y = p) : Y = p.replace(this.rules.other.tabCharGlobal, "    "), he.test(p) || U.test(p) || z.test(p) || se.test(p) || ce.test(p))
              break;
            if (Y.search(this.rules.other.nonSpaceChar) >= B || !p.trim())
              u += `
` + Y.slice(B);
            else {
              if (L || y.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || he.test(y) || U.test(y) || ce.test(y))
                break;
              u += `
` + p;
            }
            !L && !p.trim() && (L = !0), c += $ + `
`, t = t.substring($.length + 1), y = Y.slice(B);
          }
        }
        r.loose || (i ? r.loose = !0 : this.rules.other.doubleBlankLine.test(c) && (i = !0));
        let V = null, Te;
        this.options.gfm && (V = this.rules.other.listIsTask.exec(u), V && (Te = V[0] !== "[ ] ", u = u.replace(this.rules.other.listReplaceTask, ""))), r.items.push({
          type: "list_item",
          raw: c,
          task: !!V,
          checked: Te,
          loose: !1,
          text: u,
          tokens: []
        }), r.raw += c;
      }
      const a = r.items.at(-1);
      if (a)
        a.raw = a.raw.trimEnd(), a.text = a.text.trimEnd();
      else
        return;
      r.raw = r.raw.trimEnd();
      for (let l = 0; l < r.items.length; l++)
        if (this.lexer.state.top = !1, r.items[l].tokens = this.lexer.blockTokens(r.items[l].text, []), !r.loose) {
          const c = r.items[l].tokens.filter((y) => y.type === "space"), u = c.length > 0 && c.some((y) => this.rules.other.anyLine.test(y.raw));
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
    var i;
    const e = this.rules.block.table.exec(t);
    if (!e || !this.rules.other.tableDelimiter.test(e[2]))
      return;
    const n = jo(e[1]), s = e[2].replace(this.rules.other.tableAlignChars, "").split("|"), r = (i = e[3]) != null && i.trim() ? e[3].replace(this.rules.other.tableRowBlankLine, "").split(`
`) : [], o = {
      type: "table",
      raw: e[0],
      header: [],
      align: [],
      rows: []
    };
    if (n.length === s.length) {
      for (const a of s)
        this.rules.other.tableAlignRight.test(a) ? o.align.push("right") : this.rules.other.tableAlignCenter.test(a) ? o.align.push("center") : this.rules.other.tableAlignLeft.test(a) ? o.align.push("left") : o.align.push(null);
      for (let a = 0; a < n.length; a++)
        o.header.push({
          text: n[a],
          tokens: this.lexer.inline(n[a]),
          header: !0,
          align: o.align[a]
        });
      for (const a of r)
        o.rows.push(jo(a, o.header.length).map((l, c) => ({
          text: l,
          tokens: this.lexer.inline(l),
          header: !1,
          align: o.align[c]
        })));
      return o;
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
        const o = ns(n.slice(0, -1), "\\");
        if ((n.length - o.length) % 2 === 0)
          return;
      } else {
        const o = wh(e[2], "()");
        if (o === -2)
          return;
        if (o > -1) {
          const a = (e[0].indexOf("!") === 0 ? 5 : 4) + e[1].length + o;
          e[2] = e[2].substring(0, o), e[0] = e[0].substring(0, a).trim(), e[3] = "";
        }
      }
      let s = e[2], r = "";
      if (this.options.pedantic) {
        const o = this.rules.other.pedanticHrefTitle.exec(s);
        o && (s = o[1], r = o[3]);
      } else
        r = e[3] ? e[3].slice(1, -1) : "";
      return s = s.trim(), this.rules.other.startAngleBracket.test(s) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n) ? s = s.slice(1) : s = s.slice(1, -1)), Vo(e, {
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
        const o = n[0].charAt(0);
        return {
          type: "text",
          raw: o,
          text: o
        };
      }
      return Vo(n, r, n[0], this.lexer, this.rules);
    }
  }
  emStrong(t, e, n = "") {
    let s = this.rules.inline.emStrongLDelim.exec(t);
    if (!s || s[3] && n.match(this.rules.other.unicodeAlphaNumeric)) return;
    if (!(s[1] || s[2] || "") || !n || this.rules.inline.punctuation.exec(n)) {
      const o = [...s[0]].length - 1;
      let i, a, l = o, c = 0;
      const u = s[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      for (u.lastIndex = 0, e = e.slice(-1 * t.length + o); (s = u.exec(e)) != null; ) {
        if (i = s[1] || s[2] || s[3] || s[4] || s[5] || s[6], !i) continue;
        if (a = [...i].length, s[3] || s[4]) {
          l += a;
          continue;
        } else if ((s[5] || s[6]) && o % 3 && !((o + a) % 3)) {
          c += a;
          continue;
        }
        if (l -= a, l > 0) continue;
        a = Math.min(a, a + l + c);
        const y = [...s[0]][0].length, p = t.slice(0, o + s.index + y + a);
        if (Math.min(o, a) % 2) {
          const B = p.slice(1, -1);
          return {
            type: "em",
            raw: p,
            text: B,
            tokens: this.lexer.inlineTokens(B)
          };
        }
        const L = p.slice(2, -2);
        return {
          type: "strong",
          raw: p,
          text: L,
          tokens: this.lexer.inlineTokens(L)
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
        let o;
        do
          o = e[0], e[0] = ((n = this.rules.inline._backpedal.exec(e[0])) == null ? void 0 : n[0]) ?? "";
        while (o !== e[0]);
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
}, rn = class hi {
  constructor(e) {
    je(this, "tokens");
    je(this, "options");
    je(this, "state");
    je(this, "tokenizer");
    je(this, "inlineQueue");
    this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = e || Dn, this.options.tokenizer = this.options.tokenizer || new ur(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = {
      inLink: !1,
      inRawBlock: !1,
      top: !0
    };
    const n = {
      other: St,
      block: Hs.normal,
      inline: ts.normal
    };
    this.options.pedantic ? (n.block = Hs.pedantic, n.inline = ts.pedantic) : this.options.gfm && (n.block = Hs.gfm, this.options.breaks ? n.inline = ts.breaks : n.inline = ts.gfm), this.tokenizer.rules = n;
  }
  /**
   * Expose Rules
   */
  static get rules() {
    return {
      block: Hs,
      inline: ts
    };
  }
  /**
   * Static Lex Method
   */
  static lex(e, n) {
    return new hi(n).lex(e);
  }
  /**
   * Static Lex Inline Method
   */
  static lexInline(e, n) {
    return new hi(n).inlineTokens(e);
  }
  /**
   * Preprocessing
   */
  lex(e) {
    e = e.replace(St.carriageReturn, `
`), this.blockTokens(e, this.tokens);
    for (let n = 0; n < this.inlineQueue.length; n++) {
      const s = this.inlineQueue[n];
      this.inlineTokens(s.src, s.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(e, n = [], s = !1) {
    var r, o, i;
    for (this.options.pedantic && (e = e.replace(St.tabCharGlobal, "    ").replace(St.spaceLine, "")); e; ) {
      let a;
      if ((o = (r = this.options.extensions) == null ? void 0 : r.block) != null && o.some((c) => (a = c.call({ lexer: this }, e, n)) ? (e = e.substring(a.raw.length), n.push(a), !0) : !1))
        continue;
      if (a = this.tokenizer.space(e)) {
        e = e.substring(a.raw.length);
        const c = n.at(-1);
        a.raw.length === 1 && c !== void 0 ? c.raw += `
` : n.push(a);
        continue;
      }
      if (a = this.tokenizer.code(e)) {
        e = e.substring(a.raw.length);
        const c = n.at(-1);
        (c == null ? void 0 : c.type) === "paragraph" || (c == null ? void 0 : c.type) === "text" ? (c.raw += `
` + a.raw, c.text += `
` + a.text, this.inlineQueue.at(-1).src = c.text) : n.push(a);
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
        const c = n.at(-1);
        (c == null ? void 0 : c.type) === "paragraph" || (c == null ? void 0 : c.type) === "text" ? (c.raw += `
` + a.raw, c.text += `
` + a.raw, this.inlineQueue.at(-1).src = c.text) : this.tokens.links[a.tag] || (this.tokens.links[a.tag] = {
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
      if ((i = this.options.extensions) != null && i.startBlock) {
        let c = 1 / 0;
        const u = e.slice(1);
        let y;
        this.options.extensions.startBlock.forEach((p) => {
          y = p.call({ lexer: this }, u), typeof y == "number" && y >= 0 && (c = Math.min(c, y));
        }), c < 1 / 0 && c >= 0 && (l = e.substring(0, c + 1));
      }
      if (this.state.top && (a = this.tokenizer.paragraph(l))) {
        const c = n.at(-1);
        s && (c == null ? void 0 : c.type) === "paragraph" ? (c.raw += `
` + a.raw, c.text += `
` + a.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = c.text) : n.push(a), s = l.length !== e.length, e = e.substring(a.raw.length);
        continue;
      }
      if (a = this.tokenizer.text(e)) {
        e = e.substring(a.raw.length);
        const c = n.at(-1);
        (c == null ? void 0 : c.type) === "text" ? (c.raw += `
` + a.raw, c.text += `
` + a.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = c.text) : n.push(a);
        continue;
      }
      if (e) {
        const c = "Infinite loop on byte: " + e.charCodeAt(0);
        if (this.options.silent) {
          console.error(c);
          break;
        } else
          throw new Error(c);
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
    var a, l, c;
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
    let o = !1, i = "";
    for (; e; ) {
      o || (i = ""), o = !1;
      let u;
      if ((l = (a = this.options.extensions) == null ? void 0 : a.inline) != null && l.some((p) => (u = p.call({ lexer: this }, e, n)) ? (e = e.substring(u.raw.length), n.push(u), !0) : !1))
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
        const p = n.at(-1);
        u.type === "text" && (p == null ? void 0 : p.type) === "text" ? (p.raw += u.raw, p.text += u.text) : n.push(u);
        continue;
      }
      if (u = this.tokenizer.emStrong(e, s, i)) {
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
      let y = e;
      if ((c = this.options.extensions) != null && c.startInline) {
        let p = 1 / 0;
        const L = e.slice(1);
        let B;
        this.options.extensions.startInline.forEach((V) => {
          B = V.call({ lexer: this }, L), typeof B == "number" && B >= 0 && (p = Math.min(p, B));
        }), p < 1 / 0 && p >= 0 && (y = e.substring(0, p + 1));
      }
      if (u = this.tokenizer.inlineText(y)) {
        e = e.substring(u.raw.length), u.raw.slice(-1) !== "_" && (i = u.raw.slice(-1)), o = !0;
        const p = n.at(-1);
        (p == null ? void 0 : p.type) === "text" ? (p.raw += u.raw, p.text += u.text) : n.push(u);
        continue;
      }
      if (e) {
        const p = "Infinite loop on byte: " + e.charCodeAt(0);
        if (this.options.silent) {
          console.error(p);
          break;
        } else
          throw new Error(p);
      }
    }
    return n;
  }
}, fr = class {
  // set by the parser
  constructor(t) {
    je(this, "options");
    je(this, "parser");
    this.options = t || Dn;
  }
  space(t) {
    return "";
  }
  code({ text: t, lang: e, escaped: n }) {
    var o;
    const s = (o = (e || "").match(St.notSpaceStart)) == null ? void 0 : o[0], r = t.replace(St.endingNewline, "") + `
`;
    return s ? '<pre><code class="language-' + jt(s) + '">' + (n ? r : jt(r, !0)) + `</code></pre>
` : "<pre><code>" + (n ? r : jt(r, !0)) + `</code></pre>
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
    for (let i = 0; i < t.items.length; i++) {
      const a = t.items[i];
      s += this.listitem(a);
    }
    const r = e ? "ol" : "ul", o = e && n !== 1 ? ' start="' + n + '"' : "";
    return "<" + r + o + `>
` + s + "</" + r + `>
`;
  }
  listitem(t) {
    var n;
    let e = "";
    if (t.task) {
      const s = this.checkbox({ checked: !!t.checked });
      t.loose ? ((n = t.tokens[0]) == null ? void 0 : n.type) === "paragraph" ? (t.tokens[0].text = s + " " + t.tokens[0].text, t.tokens[0].tokens && t.tokens[0].tokens.length > 0 && t.tokens[0].tokens[0].type === "text" && (t.tokens[0].tokens[0].text = s + " " + jt(t.tokens[0].tokens[0].text), t.tokens[0].tokens[0].escaped = !0)) : t.tokens.unshift({
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
      const o = t.rows[r];
      n = "";
      for (let i = 0; i < o.length; i++)
        n += this.tablecell(o[i]);
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
    return `<code>${jt(t, !0)}</code>`;
  }
  br(t) {
    return "<br>";
  }
  del({ tokens: t }) {
    return `<del>${this.parser.parseInline(t)}</del>`;
  }
  link({ href: t, title: e, tokens: n }) {
    const s = this.parser.parseInline(n), r = qo(t);
    if (r === null)
      return s;
    t = r;
    let o = '<a href="' + t + '"';
    return e && (o += ' title="' + jt(e) + '"'), o += ">" + s + "</a>", o;
  }
  image({ href: t, title: e, text: n, tokens: s }) {
    s && (n = this.parser.parseInline(s, this.parser.textRenderer));
    const r = qo(t);
    if (r === null)
      return jt(n);
    t = r;
    let o = `<img src="${t}" alt="${n}"`;
    return e && (o += ` title="${jt(e)}"`), o += ">", o;
  }
  text(t) {
    return "tokens" in t && t.tokens ? this.parser.parseInline(t.tokens) : "escaped" in t && t.escaped ? t.text : jt(t.text);
  }
}, Yi = class {
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
}, on = class di {
  constructor(e) {
    je(this, "options");
    je(this, "renderer");
    je(this, "textRenderer");
    this.options = e || Dn, this.options.renderer = this.options.renderer || new fr(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new Yi();
  }
  /**
   * Static Parse Method
   */
  static parse(e, n) {
    return new di(n).parse(e);
  }
  /**
   * Static Parse Inline Method
   */
  static parseInline(e, n) {
    return new di(n).parseInline(e);
  }
  /**
   * Parse Loop
   */
  parse(e, n = !0) {
    var r, o;
    let s = "";
    for (let i = 0; i < e.length; i++) {
      const a = e[i];
      if ((o = (r = this.options.extensions) == null ? void 0 : r.renderers) != null && o[a.type]) {
        const c = a, u = this.options.extensions.renderers[c.type].call({ parser: this }, c);
        if (u !== !1 || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "paragraph", "text"].includes(c.type)) {
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
          let c = l, u = this.renderer.text(c);
          for (; i + 1 < e.length && e[i + 1].type === "text"; )
            c = e[++i], u += `
` + this.renderer.text(c);
          n ? s += this.renderer.paragraph({
            type: "paragraph",
            raw: u,
            text: u,
            tokens: [{ type: "text", raw: u, text: u, escaped: !0 }]
          }) : s += u;
          continue;
        }
        default: {
          const c = 'Token with "' + l.type + '" type was not found.';
          if (this.options.silent)
            return console.error(c), "";
          throw new Error(c);
        }
      }
    }
    return s;
  }
  /**
   * Parse Inline Tokens
   */
  parseInline(e, n = this.renderer) {
    var r, o;
    let s = "";
    for (let i = 0; i < e.length; i++) {
      const a = e[i];
      if ((o = (r = this.options.extensions) == null ? void 0 : r.renderers) != null && o[a.type]) {
        const c = this.options.extensions.renderers[a.type].call({ parser: this }, a);
        if (c !== !1 || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(a.type)) {
          s += c || "";
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
          const c = 'Token with "' + l.type + '" type was not found.';
          if (this.options.silent)
            return console.error(c), "";
          throw new Error(c);
        }
      }
    }
    return s;
  }
}, Jr, Zs = (Jr = class {
  constructor(t) {
    je(this, "options");
    je(this, "block");
    this.options = t || Dn;
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
    return this.block ? rn.lex : rn.lexInline;
  }
  /**
   * Provide function to parse tokens
   */
  provideParser() {
    return this.block ? on.parse : on.parseInline;
  }
}, je(Jr, "passThroughHooks", /* @__PURE__ */ new Set([
  "preprocess",
  "postprocess",
  "processAllTokens"
])), Jr), xh = class {
  constructor(...t) {
    je(this, "defaults", zi());
    je(this, "options", this.setOptions);
    je(this, "parse", this.parseMarkdown(!0));
    je(this, "parseInline", this.parseMarkdown(!1));
    je(this, "Parser", on);
    je(this, "Renderer", fr);
    je(this, "TextRenderer", Yi);
    je(this, "Lexer", rn);
    je(this, "Tokenizer", ur);
    je(this, "Hooks", Zs);
    this.use(...t);
  }
  /**
   * Run callback for every token
   */
  walkTokens(t, e) {
    var s, r;
    let n = [];
    for (const o of t)
      switch (n = n.concat(e.call(this, o)), o.type) {
        case "table": {
          const i = o;
          for (const a of i.header)
            n = n.concat(this.walkTokens(a.tokens, e));
          for (const a of i.rows)
            for (const l of a)
              n = n.concat(this.walkTokens(l.tokens, e));
          break;
        }
        case "list": {
          const i = o;
          n = n.concat(this.walkTokens(i.items, e));
          break;
        }
        default: {
          const i = o;
          (r = (s = this.defaults.extensions) == null ? void 0 : s.childTokens) != null && r[i.type] ? this.defaults.extensions.childTokens[i.type].forEach((a) => {
            const l = i[a].flat(1 / 0);
            n = n.concat(this.walkTokens(l, e));
          }) : i.tokens && (n = n.concat(this.walkTokens(i.tokens, e)));
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
          const o = e.renderers[r.name];
          o ? e.renderers[r.name] = function(...i) {
            let a = r.renderer.apply(this, i);
            return a === !1 && (a = o.apply(this, i)), a;
          } : e.renderers[r.name] = r.renderer;
        }
        if ("tokenizer" in r) {
          if (!r.level || r.level !== "block" && r.level !== "inline")
            throw new Error("extension level must be 'block' or 'inline'");
          const o = e[r.level];
          o ? o.unshift(r.tokenizer) : e[r.level] = [r.tokenizer], r.start && (r.level === "block" ? e.startBlock ? e.startBlock.push(r.start) : e.startBlock = [r.start] : r.level === "inline" && (e.startInline ? e.startInline.push(r.start) : e.startInline = [r.start]));
        }
        "childTokens" in r && r.childTokens && (e.childTokens[r.name] = r.childTokens);
      }), s.extensions = e), n.renderer) {
        const r = this.defaults.renderer || new fr(this.defaults);
        for (const o in n.renderer) {
          if (!(o in r))
            throw new Error(`renderer '${o}' does not exist`);
          if (["options", "parser"].includes(o))
            continue;
          const i = o, a = n.renderer[i], l = r[i];
          r[i] = (...c) => {
            let u = a.apply(r, c);
            return u === !1 && (u = l.apply(r, c)), u || "";
          };
        }
        s.renderer = r;
      }
      if (n.tokenizer) {
        const r = this.defaults.tokenizer || new ur(this.defaults);
        for (const o in n.tokenizer) {
          if (!(o in r))
            throw new Error(`tokenizer '${o}' does not exist`);
          if (["options", "rules", "lexer"].includes(o))
            continue;
          const i = o, a = n.tokenizer[i], l = r[i];
          r[i] = (...c) => {
            let u = a.apply(r, c);
            return u === !1 && (u = l.apply(r, c)), u;
          };
        }
        s.tokenizer = r;
      }
      if (n.hooks) {
        const r = this.defaults.hooks || new Zs();
        for (const o in n.hooks) {
          if (!(o in r))
            throw new Error(`hook '${o}' does not exist`);
          if (["options", "block"].includes(o))
            continue;
          const i = o, a = n.hooks[i], l = r[i];
          Zs.passThroughHooks.has(o) ? r[i] = (c) => {
            if (this.defaults.async)
              return Promise.resolve(a.call(r, c)).then((y) => l.call(r, y));
            const u = a.call(r, c);
            return l.call(r, u);
          } : r[i] = (...c) => {
            let u = a.apply(r, c);
            return u === !1 && (u = l.apply(r, c)), u;
          };
        }
        s.hooks = r;
      }
      if (n.walkTokens) {
        const r = this.defaults.walkTokens, o = n.walkTokens;
        s.walkTokens = function(i) {
          let a = [];
          return a.push(o.call(this, i)), r && (a = a.concat(r.call(this, i))), a;
        };
      }
      this.defaults = { ...this.defaults, ...s };
    }), this;
  }
  setOptions(t) {
    return this.defaults = { ...this.defaults, ...t }, this;
  }
  lexer(t, e) {
    return rn.lex(t, e ?? this.defaults);
  }
  parser(t, e) {
    return on.parse(t, e ?? this.defaults);
  }
  parseMarkdown(t) {
    return (n, s) => {
      const r = { ...s }, o = { ...this.defaults, ...r }, i = this.onError(!!o.silent, !!o.async);
      if (this.defaults.async === !0 && r.async === !1)
        return i(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
      if (typeof n > "u" || n === null)
        return i(new Error("marked(): input parameter is undefined or null"));
      if (typeof n != "string")
        return i(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(n) + ", string expected"));
      o.hooks && (o.hooks.options = o, o.hooks.block = t);
      const a = o.hooks ? o.hooks.provideLexer() : t ? rn.lex : rn.lexInline, l = o.hooks ? o.hooks.provideParser() : t ? on.parse : on.parseInline;
      if (o.async)
        return Promise.resolve(o.hooks ? o.hooks.preprocess(n) : n).then((c) => a(c, o)).then((c) => o.hooks ? o.hooks.processAllTokens(c) : c).then((c) => o.walkTokens ? Promise.all(this.walkTokens(c, o.walkTokens)).then(() => c) : c).then((c) => l(c, o)).then((c) => o.hooks ? o.hooks.postprocess(c) : c).catch(i);
      try {
        o.hooks && (n = o.hooks.preprocess(n));
        let c = a(n, o);
        o.hooks && (c = o.hooks.processAllTokens(c)), o.walkTokens && this.walkTokens(c, o.walkTokens);
        let u = l(c, o);
        return o.hooks && (u = o.hooks.postprocess(u)), u;
      } catch (c) {
        return i(c);
      }
    };
  }
  onError(t, e) {
    return (n) => {
      if (n.message += `
Please report this to https://github.com/markedjs/marked.`, t) {
        const s = "<p>An error occurred:</p><pre>" + jt(n.message + "", !0) + "</pre>";
        return e ? Promise.resolve(s) : s;
      }
      if (e)
        return Promise.reject(n);
      throw n;
    };
  }
}, Pn = new xh();
function Le(t, e) {
  return Pn.parse(t, e);
}
Le.options = Le.setOptions = function(t) {
  return Pn.setOptions(t), Le.defaults = Pn.defaults, hl(Le.defaults), Le;
};
Le.getDefaults = zi;
Le.defaults = Dn;
Le.use = function(...t) {
  return Pn.use(...t), Le.defaults = Pn.defaults, hl(Le.defaults), Le;
};
Le.walkTokens = function(t, e) {
  return Pn.walkTokens(t, e);
};
Le.parseInline = Pn.parseInline;
Le.Parser = on;
Le.parser = on.parse;
Le.Renderer = fr;
Le.TextRenderer = Yi;
Le.Lexer = rn;
Le.lexer = rn.lex;
Le.Tokenizer = ur;
Le.Hooks = Zs;
Le.parse = Le;
Le.options;
Le.setOptions;
Le.use;
Le.walkTokens;
Le.parseInline;
on.parse;
rn.lex;
/*! @license DOMPurify 3.2.6 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.2.6/LICENSE */
const {
  entries: xl,
  setPrototypeOf: Ko,
  isFrozen: Sh,
  getPrototypeOf: Ah,
  getOwnPropertyDescriptor: Th
} = Object;
let {
  freeze: At,
  seal: Bt,
  create: Sl
} = Object, {
  apply: pi,
  construct: gi
} = typeof Reflect < "u" && Reflect;
At || (At = function(e) {
  return e;
});
Bt || (Bt = function(e) {
  return e;
});
pi || (pi = function(e, n, s) {
  return e.apply(n, s);
});
gi || (gi = function(e, n) {
  return new e(...n);
});
const Ws = Tt(Array.prototype.forEach), Eh = Tt(Array.prototype.lastIndexOf), Go = Tt(Array.prototype.pop), ss = Tt(Array.prototype.push), Ch = Tt(Array.prototype.splice), Js = Tt(String.prototype.toLowerCase), qr = Tt(String.prototype.toString), Yo = Tt(String.prototype.match), rs = Tt(String.prototype.replace), Rh = Tt(String.prototype.indexOf), Ih = Tt(String.prototype.trim), Ut = Tt(Object.prototype.hasOwnProperty), vt = Tt(RegExp.prototype.test), is = Lh(TypeError);
function Tt(t) {
  return function(e) {
    e instanceof RegExp && (e.lastIndex = 0);
    for (var n = arguments.length, s = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
      s[r - 1] = arguments[r];
    return pi(t, e, s);
  };
}
function Lh(t) {
  return function() {
    for (var e = arguments.length, n = new Array(e), s = 0; s < e; s++)
      n[s] = arguments[s];
    return gi(t, n);
  };
}
function ve(t, e) {
  let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : Js;
  Ko && Ko(t, null);
  let s = e.length;
  for (; s--; ) {
    let r = e[s];
    if (typeof r == "string") {
      const o = n(r);
      o !== r && (Sh(e) || (e[s] = o), r = o);
    }
    t[r] = !0;
  }
  return t;
}
function Oh(t) {
  for (let e = 0; e < t.length; e++)
    Ut(t, e) || (t[e] = null);
  return t;
}
function en(t) {
  const e = Sl(null);
  for (const [n, s] of xl(t))
    Ut(t, n) && (Array.isArray(s) ? e[n] = Oh(s) : s && typeof s == "object" && s.constructor === Object ? e[n] = en(s) : e[n] = s);
  return e;
}
function os(t, e) {
  for (; t !== null; ) {
    const s = Th(t, e);
    if (s) {
      if (s.get)
        return Tt(s.get);
      if (typeof s.value == "function")
        return Tt(s.value);
    }
    t = Ah(t);
  }
  function n() {
    return null;
  }
  return n;
}
const $o = At(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "section", "select", "shadow", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]), jr = At(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]), Vr = At(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]), Fh = At(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]), Kr = At(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]), Ph = At(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]), Xo = At(["#text"]), Zo = At(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns", "slot"]), Gr = At(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]), Jo = At(["accent", "accentunder", "align", "bevelled", "close", "columnsalign", "columnlines", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lspace", "lquote", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]), qs = At(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]), Dh = Bt(/\{\{[\w\W]*|[\w\W]*\}\}/gm), Nh = Bt(/<%[\w\W]*|[\w\W]*%>/gm), Mh = Bt(/\$\{[\w\W]*/gm), Bh = Bt(/^data-[\-\w.\u00B7-\uFFFF]+$/), Uh = Bt(/^aria-[\-\w]+$/), Al = Bt(
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  // eslint-disable-line no-useless-escape
), zh = Bt(/^(?:\w+script|data):/i), Hh = Bt(
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g
  // eslint-disable-line no-control-regex
), Tl = Bt(/^html$/i), Wh = Bt(/^[a-z][.\w]*(-[.\w]+)+$/i);
var Qo = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ARIA_ATTR: Uh,
  ATTR_WHITESPACE: Hh,
  CUSTOM_ELEMENT: Wh,
  DATA_ATTR: Bh,
  DOCTYPE_NAME: Tl,
  ERB_EXPR: Nh,
  IS_ALLOWED_URI: Al,
  IS_SCRIPT_OR_DATA: zh,
  MUSTACHE_EXPR: Dh,
  TMPLIT_EXPR: Mh
});
const as = {
  element: 1,
  text: 3,
  // Deprecated
  progressingInstruction: 7,
  comment: 8,
  document: 9
}, qh = function() {
  return typeof window > "u" ? null : window;
}, jh = function(e, n) {
  if (typeof e != "object" || typeof e.createPolicy != "function")
    return null;
  let s = null;
  const r = "data-tt-policy-suffix";
  n && n.hasAttribute(r) && (s = n.getAttribute(r));
  const o = "dompurify" + (s ? "#" + s : "");
  try {
    return e.createPolicy(o, {
      createHTML(i) {
        return i;
      },
      createScriptURL(i) {
        return i;
      }
    });
  } catch {
    return console.warn("TrustedTypes policy " + o + " could not be created."), null;
  }
}, ea = function() {
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
function El() {
  let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : qh();
  const e = (J) => El(J);
  if (e.version = "3.2.6", e.removed = [], !t || !t.document || t.document.nodeType !== as.document || !t.Element)
    return e.isSupported = !1, e;
  let {
    document: n
  } = t;
  const s = n, r = s.currentScript, {
    DocumentFragment: o,
    HTMLTemplateElement: i,
    Node: a,
    Element: l,
    NodeFilter: c,
    NamedNodeMap: u = t.NamedNodeMap || t.MozNamedAttrMap,
    HTMLFormElement: y,
    DOMParser: p,
    trustedTypes: L
  } = t, B = l.prototype, V = os(B, "cloneNode"), Te = os(B, "remove"), se = os(B, "nextSibling"), ce = os(B, "childNodes"), he = os(B, "parentNode");
  if (typeof i == "function") {
    const J = n.createElement("template");
    J.content && J.content.ownerDocument && (n = J.content.ownerDocument);
  }
  let U, z = "";
  const {
    implementation: $,
    createNodeIterator: Y,
    createDocumentFragment: we,
    getElementsByTagName: Ee
  } = n, {
    importNode: Fe
  } = s;
  let b = ea();
  e.isSupported = typeof xl == "function" && typeof he == "function" && $ && $.createHTMLDocument !== void 0;
  const {
    MUSTACHE_EXPR: te,
    ERB_EXPR: Ce,
    TMPLIT_EXPR: X,
    DATA_ATTR: $e,
    ARIA_ATTR: ie,
    IS_SCRIPT_OR_DATA: fe,
    ATTR_WHITESPACE: oe,
    CUSTOM_ELEMENT: st
  } = Qo;
  let {
    IS_ALLOWED_URI: Xe
  } = Qo, de = null;
  const Ze = ve({}, [...$o, ...jr, ...Vr, ...Kr, ...Xo]);
  let Se = null;
  const W = ve({}, [...Zo, ...Gr, ...Jo, ...qs]);
  let _e = Object.seal(Sl(null, {
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
  })), ne = null, H = null, Pe = !0, He = !0, it = !1, yt = !0, h = !1, g = !0, k = !1, E = !1, A = !1, T = !1, D = !1, M = !1, F = !0, C = !1;
  const Z = "user-content-";
  let N = !0, K = !1, Q = {}, le = null;
  const Re = ve({}, ["annotation-xml", "audio", "colgroup", "desc", "foreignobject", "head", "iframe", "math", "mi", "mn", "mo", "ms", "mtext", "noembed", "noframes", "noscript", "plaintext", "script", "style", "svg", "template", "thead", "title", "video", "xmp"]);
  let be = null;
  const rt = ve({}, ["audio", "video", "img", "source", "image", "track"]);
  let ze = null;
  const ut = ve({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), f = "http://www.w3.org/1998/Math/MathML", m = "http://www.w3.org/2000/svg", x = "http://www.w3.org/1999/xhtml";
  let w = x, P = !1, G = null;
  const ee = ve({}, [f, m, x], qr);
  let ye = ve({}, ["mi", "mo", "mn", "ms", "mtext"]), ke = ve({}, ["annotation-xml"]);
  const Ke = ve({}, ["title", "style", "font", "a", "script"]);
  let De = null;
  const lt = ["application/xhtml+xml", "text/html"], bt = "text/html";
  let qe = null, Wt = null;
  const Tr = n.createElement("form"), Cs = function(_) {
    return _ instanceof RegExp || _ instanceof Function;
  }, Yn = function() {
    let _ = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (!(Wt && Wt === _)) {
      if ((!_ || typeof _ != "object") && (_ = {}), _ = en(_), De = // eslint-disable-next-line unicorn/prefer-includes
      lt.indexOf(_.PARSER_MEDIA_TYPE) === -1 ? bt : _.PARSER_MEDIA_TYPE, qe = De === "application/xhtml+xml" ? qr : Js, de = Ut(_, "ALLOWED_TAGS") ? ve({}, _.ALLOWED_TAGS, qe) : Ze, Se = Ut(_, "ALLOWED_ATTR") ? ve({}, _.ALLOWED_ATTR, qe) : W, G = Ut(_, "ALLOWED_NAMESPACES") ? ve({}, _.ALLOWED_NAMESPACES, qr) : ee, ze = Ut(_, "ADD_URI_SAFE_ATTR") ? ve(en(ut), _.ADD_URI_SAFE_ATTR, qe) : ut, be = Ut(_, "ADD_DATA_URI_TAGS") ? ve(en(rt), _.ADD_DATA_URI_TAGS, qe) : rt, le = Ut(_, "FORBID_CONTENTS") ? ve({}, _.FORBID_CONTENTS, qe) : Re, ne = Ut(_, "FORBID_TAGS") ? ve({}, _.FORBID_TAGS, qe) : en({}), H = Ut(_, "FORBID_ATTR") ? ve({}, _.FORBID_ATTR, qe) : en({}), Q = Ut(_, "USE_PROFILES") ? _.USE_PROFILES : !1, Pe = _.ALLOW_ARIA_ATTR !== !1, He = _.ALLOW_DATA_ATTR !== !1, it = _.ALLOW_UNKNOWN_PROTOCOLS || !1, yt = _.ALLOW_SELF_CLOSE_IN_ATTR !== !1, h = _.SAFE_FOR_TEMPLATES || !1, g = _.SAFE_FOR_XML !== !1, k = _.WHOLE_DOCUMENT || !1, T = _.RETURN_DOM || !1, D = _.RETURN_DOM_FRAGMENT || !1, M = _.RETURN_TRUSTED_TYPE || !1, A = _.FORCE_BODY || !1, F = _.SANITIZE_DOM !== !1, C = _.SANITIZE_NAMED_PROPS || !1, N = _.KEEP_CONTENT !== !1, K = _.IN_PLACE || !1, Xe = _.ALLOWED_URI_REGEXP || Al, w = _.NAMESPACE || x, ye = _.MATHML_TEXT_INTEGRATION_POINTS || ye, ke = _.HTML_INTEGRATION_POINTS || ke, _e = _.CUSTOM_ELEMENT_HANDLING || {}, _.CUSTOM_ELEMENT_HANDLING && Cs(_.CUSTOM_ELEMENT_HANDLING.tagNameCheck) && (_e.tagNameCheck = _.CUSTOM_ELEMENT_HANDLING.tagNameCheck), _.CUSTOM_ELEMENT_HANDLING && Cs(_.CUSTOM_ELEMENT_HANDLING.attributeNameCheck) && (_e.attributeNameCheck = _.CUSTOM_ELEMENT_HANDLING.attributeNameCheck), _.CUSTOM_ELEMENT_HANDLING && typeof _.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements == "boolean" && (_e.allowCustomizedBuiltInElements = _.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements), h && (He = !1), D && (T = !0), Q && (de = ve({}, Xo), Se = [], Q.html === !0 && (ve(de, $o), ve(Se, Zo)), Q.svg === !0 && (ve(de, jr), ve(Se, Gr), ve(Se, qs)), Q.svgFilters === !0 && (ve(de, Vr), ve(Se, Gr), ve(Se, qs)), Q.mathMl === !0 && (ve(de, Kr), ve(Se, Jo), ve(Se, qs))), _.ADD_TAGS && (de === Ze && (de = en(de)), ve(de, _.ADD_TAGS, qe)), _.ADD_ATTR && (Se === W && (Se = en(Se)), ve(Se, _.ADD_ATTR, qe)), _.ADD_URI_SAFE_ATTR && ve(ze, _.ADD_URI_SAFE_ATTR, qe), _.FORBID_CONTENTS && (le === Re && (le = en(le)), ve(le, _.FORBID_CONTENTS, qe)), N && (de["#text"] = !0), k && ve(de, ["html", "head", "body"]), de.table && (ve(de, ["tbody"]), delete ne.tbody), _.TRUSTED_TYPES_POLICY) {
        if (typeof _.TRUSTED_TYPES_POLICY.createHTML != "function")
          throw is('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
        if (typeof _.TRUSTED_TYPES_POLICY.createScriptURL != "function")
          throw is('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
        U = _.TRUSTED_TYPES_POLICY, z = U.createHTML("");
      } else
        U === void 0 && (U = jh(L, r)), U !== null && typeof z == "string" && (z = U.createHTML(""));
      At && At(_), Wt = _;
    }
  }, Rs = ve({}, [...jr, ...Vr, ...Fh]), Is = ve({}, [...Kr, ...Ph]), Er = function(_) {
    let O = he(_);
    (!O || !O.tagName) && (O = {
      namespaceURI: w,
      tagName: "template"
    });
    const j = Js(_.tagName), Ie = Js(O.tagName);
    return G[_.namespaceURI] ? _.namespaceURI === m ? O.namespaceURI === x ? j === "svg" : O.namespaceURI === f ? j === "svg" && (Ie === "annotation-xml" || ye[Ie]) : !!Rs[j] : _.namespaceURI === f ? O.namespaceURI === x ? j === "math" : O.namespaceURI === m ? j === "math" && ke[Ie] : !!Is[j] : _.namespaceURI === x ? O.namespaceURI === m && !ke[Ie] || O.namespaceURI === f && !ye[Ie] ? !1 : !Is[j] && (Ke[j] || !Rs[j]) : !!(De === "application/xhtml+xml" && G[_.namespaceURI]) : !1;
  }, Ot = function(_) {
    ss(e.removed, {
      element: _
    });
    try {
      he(_).removeChild(_);
    } catch {
      Te(_);
    }
  }, un = function(_, O) {
    try {
      ss(e.removed, {
        attribute: O.getAttributeNode(_),
        from: O
      });
    } catch {
      ss(e.removed, {
        attribute: null,
        from: O
      });
    }
    if (O.removeAttribute(_), _ === "is")
      if (T || D)
        try {
          Ot(O);
        } catch {
        }
      else
        try {
          O.setAttribute(_, "");
        } catch {
        }
  }, Ls = function(_) {
    let O = null, j = null;
    if (A)
      _ = "<remove></remove>" + _;
    else {
      const tt = Yo(_, /^[\r\n\t ]+/);
      j = tt && tt[0];
    }
    De === "application/xhtml+xml" && w === x && (_ = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + _ + "</body></html>");
    const Ie = U ? U.createHTML(_) : _;
    if (w === x)
      try {
        O = new p().parseFromString(Ie, De);
      } catch {
      }
    if (!O || !O.documentElement) {
      O = $.createDocument(w, "template", null);
      try {
        O.documentElement.innerHTML = P ? z : Ie;
      } catch {
      }
    }
    const et = O.body || O.documentElement;
    return _ && j && et.insertBefore(n.createTextNode(j), et.childNodes[0] || null), w === x ? Ee.call(O, k ? "html" : "body")[0] : k ? O.documentElement : et;
  }, Sn = function(_) {
    return Y.call(
      _.ownerDocument || _,
      _,
      // eslint-disable-next-line no-bitwise
      c.SHOW_ELEMENT | c.SHOW_COMMENT | c.SHOW_TEXT | c.SHOW_PROCESSING_INSTRUCTION | c.SHOW_CDATA_SECTION,
      null
    );
  }, $n = function(_) {
    return _ instanceof y && (typeof _.nodeName != "string" || typeof _.textContent != "string" || typeof _.removeChild != "function" || !(_.attributes instanceof u) || typeof _.removeAttribute != "function" || typeof _.setAttribute != "function" || typeof _.namespaceURI != "string" || typeof _.insertBefore != "function" || typeof _.hasChildNodes != "function");
  }, fn = function(_) {
    return typeof a == "function" && _ instanceof a;
  };
  function Ft(J, _, O) {
    Ws(J, (j) => {
      j.call(e, _, O, Wt);
    });
  }
  const An = function(_) {
    let O = null;
    if (Ft(b.beforeSanitizeElements, _, null), $n(_))
      return Ot(_), !0;
    const j = qe(_.nodeName);
    if (Ft(b.uponSanitizeElement, _, {
      tagName: j,
      allowedTags: de
    }), g && _.hasChildNodes() && !fn(_.firstElementChild) && vt(/<[/\w!]/g, _.innerHTML) && vt(/<[/\w!]/g, _.textContent) || _.nodeType === as.progressingInstruction || g && _.nodeType === as.comment && vt(/<[/\w]/g, _.data))
      return Ot(_), !0;
    if (!de[j] || ne[j]) {
      if (!ne[j] && Fs(j) && (_e.tagNameCheck instanceof RegExp && vt(_e.tagNameCheck, j) || _e.tagNameCheck instanceof Function && _e.tagNameCheck(j)))
        return !1;
      if (N && !le[j]) {
        const Ie = he(_) || _.parentNode, et = ce(_) || _.childNodes;
        if (et && Ie) {
          const tt = et.length;
          for (let ft = tt - 1; ft >= 0; --ft) {
            const pt = V(et[ft], !0);
            pt.__removalCount = (_.__removalCount || 0) + 1, Ie.insertBefore(pt, se(_));
          }
        }
      }
      return Ot(_), !0;
    }
    return _ instanceof l && !Er(_) || (j === "noscript" || j === "noembed" || j === "noframes") && vt(/<\/no(script|embed|frames)/i, _.innerHTML) ? (Ot(_), !0) : (h && _.nodeType === as.text && (O = _.textContent, Ws([te, Ce, X], (Ie) => {
      O = rs(O, Ie, " ");
    }), _.textContent !== O && (ss(e.removed, {
      element: _.cloneNode()
    }), _.textContent = O)), Ft(b.afterSanitizeElements, _, null), !1);
  }, Os = function(_, O, j) {
    if (F && (O === "id" || O === "name") && (j in n || j in Tr))
      return !1;
    if (!(He && !H[O] && vt($e, O))) {
      if (!(Pe && vt(ie, O))) {
        if (!Se[O] || H[O]) {
          if (
            // First condition does a very basic check if a) it's basically a valid custom element tagname AND
            // b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
            // and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
            !(Fs(_) && (_e.tagNameCheck instanceof RegExp && vt(_e.tagNameCheck, _) || _e.tagNameCheck instanceof Function && _e.tagNameCheck(_)) && (_e.attributeNameCheck instanceof RegExp && vt(_e.attributeNameCheck, O) || _e.attributeNameCheck instanceof Function && _e.attributeNameCheck(O)) || // Alternative, second condition checks if it's an `is`-attribute, AND
            // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
            O === "is" && _e.allowCustomizedBuiltInElements && (_e.tagNameCheck instanceof RegExp && vt(_e.tagNameCheck, j) || _e.tagNameCheck instanceof Function && _e.tagNameCheck(j)))
          ) return !1;
        } else if (!ze[O]) {
          if (!vt(Xe, rs(j, oe, ""))) {
            if (!((O === "src" || O === "xlink:href" || O === "href") && _ !== "script" && Rh(j, "data:") === 0 && be[_])) {
              if (!(it && !vt(fe, rs(j, oe, "")))) {
                if (j)
                  return !1;
              }
            }
          }
        }
      }
    }
    return !0;
  }, Fs = function(_) {
    return _ !== "annotation-xml" && Yo(_, st);
  }, Ps = function(_) {
    Ft(b.beforeSanitizeAttributes, _, null);
    const {
      attributes: O
    } = _;
    if (!O || $n(_))
      return;
    const j = {
      attrName: "",
      attrValue: "",
      keepAttr: !0,
      allowedAttributes: Se,
      forceKeepAttr: void 0
    };
    let Ie = O.length;
    for (; Ie--; ) {
      const et = O[Ie], {
        name: tt,
        namespaceURI: ft,
        value: pt
      } = et, Ct = qe(tt), Xn = pt;
      let ct = tt === "value" ? Xn : Ih(Xn);
      if (j.attrName = Ct, j.attrValue = ct, j.keepAttr = !0, j.forceKeepAttr = void 0, Ft(b.uponSanitizeAttribute, _, j), ct = j.attrValue, C && (Ct === "id" || Ct === "name") && (un(tt, _), ct = Z + ct), g && vt(/((--!?|])>)|<\/(style|title)/i, ct)) {
        un(tt, _);
        continue;
      }
      if (j.forceKeepAttr)
        continue;
      if (!j.keepAttr) {
        un(tt, _);
        continue;
      }
      if (!yt && vt(/\/>/i, ct)) {
        un(tt, _);
        continue;
      }
      h && Ws([te, Ce, X], (Zn) => {
        ct = rs(ct, Zn, " ");
      });
      const Ds = qe(_.nodeName);
      if (!Os(Ds, Ct, ct)) {
        un(tt, _);
        continue;
      }
      if (U && typeof L == "object" && typeof L.getAttributeType == "function" && !ft)
        switch (L.getAttributeType(Ds, Ct)) {
          case "TrustedHTML": {
            ct = U.createHTML(ct);
            break;
          }
          case "TrustedScriptURL": {
            ct = U.createScriptURL(ct);
            break;
          }
        }
      if (ct !== Xn)
        try {
          ft ? _.setAttributeNS(ft, tt, ct) : _.setAttribute(tt, ct), $n(_) ? Ot(_) : Go(e.removed);
        } catch {
          un(tt, _);
        }
    }
    Ft(b.afterSanitizeAttributes, _, null);
  }, Cr = function J(_) {
    let O = null;
    const j = Sn(_);
    for (Ft(b.beforeSanitizeShadowDOM, _, null); O = j.nextNode(); )
      Ft(b.uponSanitizeShadowNode, O, null), An(O), Ps(O), O.content instanceof o && J(O.content);
    Ft(b.afterSanitizeShadowDOM, _, null);
  };
  return e.sanitize = function(J) {
    let _ = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, O = null, j = null, Ie = null, et = null;
    if (P = !J, P && (J = "<!-->"), typeof J != "string" && !fn(J))
      if (typeof J.toString == "function") {
        if (J = J.toString(), typeof J != "string")
          throw is("dirty is not a string, aborting");
      } else
        throw is("toString is not a function");
    if (!e.isSupported)
      return J;
    if (E || Yn(_), e.removed = [], typeof J == "string" && (K = !1), K) {
      if (J.nodeName) {
        const pt = qe(J.nodeName);
        if (!de[pt] || ne[pt])
          throw is("root node is forbidden and cannot be sanitized in-place");
      }
    } else if (J instanceof a)
      O = Ls("<!---->"), j = O.ownerDocument.importNode(J, !0), j.nodeType === as.element && j.nodeName === "BODY" || j.nodeName === "HTML" ? O = j : O.appendChild(j);
    else {
      if (!T && !h && !k && // eslint-disable-next-line unicorn/prefer-includes
      J.indexOf("<") === -1)
        return U && M ? U.createHTML(J) : J;
      if (O = Ls(J), !O)
        return T ? null : M ? z : "";
    }
    O && A && Ot(O.firstChild);
    const tt = Sn(K ? J : O);
    for (; Ie = tt.nextNode(); )
      An(Ie), Ps(Ie), Ie.content instanceof o && Cr(Ie.content);
    if (K)
      return J;
    if (T) {
      if (D)
        for (et = we.call(O.ownerDocument); O.firstChild; )
          et.appendChild(O.firstChild);
      else
        et = O;
      return (Se.shadowroot || Se.shadowrootmode) && (et = Fe.call(s, et, !0)), et;
    }
    let ft = k ? O.outerHTML : O.innerHTML;
    return k && de["!doctype"] && O.ownerDocument && O.ownerDocument.doctype && O.ownerDocument.doctype.name && vt(Tl, O.ownerDocument.doctype.name) && (ft = "<!DOCTYPE " + O.ownerDocument.doctype.name + `>
` + ft), h && Ws([te, Ce, X], (pt) => {
      ft = rs(ft, pt, " ");
    }), U && M ? U.createHTML(ft) : ft;
  }, e.setConfig = function() {
    let J = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    Yn(J), E = !0;
  }, e.clearConfig = function() {
    Wt = null, E = !1;
  }, e.isValidAttribute = function(J, _, O) {
    Wt || Yn({});
    const j = qe(J), Ie = qe(_);
    return Os(j, Ie, O);
  }, e.addHook = function(J, _) {
    typeof _ == "function" && ss(b[J], _);
  }, e.removeHook = function(J, _) {
    if (_ !== void 0) {
      const O = Eh(b[J], _);
      return O === -1 ? void 0 : Ch(b[J], O, 1)[0];
    }
    return Go(b[J]);
  }, e.removeHooks = function(J) {
    b[J] = [];
  }, e.removeAllHooks = function() {
    b = ea();
  }, e;
}
var $i = El();
$i.addHook("uponSanitizeElement", (t, e) => {
  var r, o, i, a, l, c;
  if (e.tagName === "svg") {
    (r = t.parentNode) == null || r.removeChild(t);
    return;
  }
  if (e.tagName === "math") {
    (o = t.parentNode) == null || o.removeChild(t);
    return;
  }
  if (e.tagName === "foreignobject") {
    (i = t.parentNode) == null || i.removeChild(t);
    return;
  }
  const n = t, s = (a = e.tagName) == null ? void 0 : a.toUpperCase();
  if (s === "A" || s === "IMG" || s === "AREA" || s === "MAP")
    if (s === "A") {
      const u = n.textContent;
      u ? n.replaceWith(u) : (l = n.parentNode) == null || l.removeChild(n);
    } else
      (c = n.parentNode) == null || c.removeChild(n);
});
$i.addHook("afterSanitizeAttributes", (t) => {
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
function Vh(t) {
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
  return $i.sanitize(t, e);
}
const us = [
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
], Kh = (t) => (t || "").split("").reduce((e, n) => e + n.charCodeAt(0), 0) % us.length, Gh = (t) => {
  const e = us[(t % us.length + us.length) % us.length];
  return {
    background: `
            radial-gradient(circle at 32% 28%, rgba(255,255,255,0.22) 0%, transparent 42%),
            radial-gradient(circle at 68% 72%, rgba(0,0,0,0.25) 0%, transparent 38%),
            radial-gradient(ellipse at 50% 50%, ${e.stops})
        `.trim(),
    boxShadow: `0 4px 28px ${e.glow}, inset 0 1px 0 rgba(255,255,255,0.15)`,
    borderRadius: "50%"
  };
}, Yh = (t, e) => {
  const n = typeof e == "number" && Number.isFinite(e) ? e : Kh(t);
  return Gh(n);
};
function ta() {
  return typeof window < "u" && window.APP_CONFIG ? window.APP_CONFIG : {};
}
const _n = {
  get API_URL() {
    return ta().API_URL || "http://localhost:8000/api/v1";
  },
  get WS_URL() {
    return ta().WS_URL || "ws://localhost:8000";
  }
};
function $h(t) {
  const e = We(() => ({
    backgroundColor: t.value.chat_background_color || "#ffffff",
    color: dn(t.value.chat_background_color || "#ffffff") ? "#ffffff" : "#000000"
  })), n = We(() => ({
    backgroundColor: t.value.chat_bubble_color || "#C9F24E",
    color: dn(t.value.chat_bubble_color || "#C9F24E") ? "#FFFFFF" : "#000000"
  })), s = We(() => {
    const c = t.value.chat_background_color || "#F8F9FA", u = zf(c, 20);
    return {
      backgroundColor: u,
      color: dn(u) ? "#FFFFFF" : "#000000"
    };
  }), r = We(() => ({
    backgroundColor: t.value.accent_color || "#C9F24E",
    color: dn(t.value.accent_color || "#C9F24E") ? "#FFFFFF" : "#000000"
  })), o = We(() => ({
    color: dn(t.value.chat_background_color || "#F8F9FA") ? "#FFFFFF" : "#000000"
  })), i = We(() => ({
    borderBottom: `1px solid ${dn(t.value.chat_background_color || "#F8F9FA") ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`
  })), a = We(() => t.value.photo_url ? t.value.photo_url.includes("amazonaws.com") ? t.value.photo_url : `${_n.API_URL}${t.value.photo_url}` : ""), l = We(() => {
    const c = t.value.chat_background_color || "#ffffff";
    return {
      boxShadow: `0 8px 5px ${dn(c) ? "rgba(0, 0, 0, 0.24)" : "rgba(0, 0, 0, 0.12)"}`
    };
  });
  return {
    chatStyles: e,
    chatIconStyles: n,
    agentBubbleStyles: s,
    userBubbleStyles: r,
    messageNameStyles: o,
    headerBorderStyles: i,
    photoUrl: a,
    shadowStyle: l
  };
}
const Xh = /* @__PURE__ */ new Set(["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]), Zh = /* @__PURE__ */ new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);
[...Xh, ...Zh];
function Jh(t, e) {
  const n = ge([]), s = ge(!1), r = ge(null), o = (z) => {
    if (z === 0) return "0 Bytes";
    const $ = 1024, Y = ["Bytes", "KB", "MB", "GB"], we = Math.floor(Math.log(z) / Math.log($));
    return parseFloat((z / Math.pow($, we)).toFixed(2)) + " " + Y[we];
  }, i = (z) => z.startsWith("image/"), a = (z) => z ? z.startsWith("blob:") || z.startsWith("http://") || z.startsWith("https://") ? z : `${_n.API_URL}${z}` : "", l = (z) => {
    const $ = z.file_url || z.url;
    return $ ? $.startsWith("blob:") || $.startsWith("http://") || $.startsWith("https://") ? $ : `${_n.API_URL}${$}` : "";
  }, c = async (z) => {
    const $ = z.target;
    $.files && $.files.length > 0 && (await V(Array.from($.files)), $.value = "");
  }, u = async (z) => {
    var Y;
    z.preventDefault();
    const $ = (Y = z.dataTransfer) == null ? void 0 : Y.files;
    $ && $.length > 0 && await V(Array.from($));
  }, y = (z) => {
    z.preventDefault();
  }, p = (z) => {
    z.preventDefault();
  }, L = async (z) => {
    var we;
    const $ = (we = z.clipboardData) == null ? void 0 : we.items;
    if (!$) return;
    const Y = [];
    for (const Ee of Array.from($))
      if (Ee.kind === "file") {
        const Fe = Ee.getAsFile();
        Fe && Y.push(Fe);
      }
    Y.length > 0 && await V(Y);
  }, B = async (z, $ = 500) => new Promise((Y, we) => {
    const Ee = new FileReader();
    Ee.onload = (Fe) => {
      var te;
      const b = new Image();
      b.onload = () => {
        const Ce = document.createElement("canvas");
        let X = b.width, $e = b.height;
        const ie = 1920;
        (X > ie || $e > ie) && (X > $e ? ($e = $e / X * ie, X = ie) : (X = X / $e * ie, $e = ie)), Ce.width = X, Ce.height = $e;
        const fe = Ce.getContext("2d");
        if (!fe) {
          we(new Error("Failed to get canvas context"));
          return;
        }
        fe.drawImage(b, 0, 0, X, $e);
        let oe = 0.9;
        const st = () => {
          Ce.toBlob((Xe) => {
            if (!Xe) {
              we(new Error("Failed to compress image"));
              return;
            }
            if (Xe.size / 1024 > $ && oe > 0.3)
              oe -= 0.1, st();
            else {
              const Ze = new FileReader();
              Ze.onload = () => {
                const Se = Ze.result.split(",")[1];
                Y({ blob: Xe, base64: Se });
              }, Ze.readAsDataURL(Xe);
            }
          }, z.type === "image/png" ? "image/png" : "image/jpeg", oe);
        };
        st();
      }, b.onerror = () => we(new Error("Failed to load image")), b.src = (te = Fe.target) == null ? void 0 : te.result;
    }, Ee.onerror = () => we(new Error("Failed to read file")), Ee.readAsDataURL(z);
  }), V = async (z) => {
    if (n.value.length >= 3) {
      alert("Maximum 3 files allowed per message");
      return;
    }
    const Fe = 3 - n.value.length, b = z.slice(0, Fe);
    z.length > Fe && alert(`Only ${Fe} more file(s) can be uploaded. Maximum 3 files per message.`);
    for (const te of b)
      try {
        if (n.value.some((ie) => ie.filename === te.name)) {
          console.warn(`File ${te.name} is already selected`), alert(`File "${te.name}" is already selected`);
          continue;
        }
        const X = te.type.startsWith("image/"), $e = X ? 5242880 : 10485760;
        if (te.size > $e) {
          const ie = $e / 1048576;
          console.error(`File ${te.name} is too large. Maximum size is ${ie}MB`), alert(`File "${te.name}" is too large. Maximum size for ${X ? "images" : "documents"} is ${ie}MB`);
          continue;
        }
        if (X)
          try {
            const { blob: ie, base64: fe } = await B(te, 500), oe = ie.size;
            console.log(`Compressed ${te.name}: ${(te.size / 1024).toFixed(2)}KB → ${(oe / 1024).toFixed(2)}KB`), n.value.push({
              content: fe,
              filename: te.name,
              type: te.type,
              size: oe,
              url: URL.createObjectURL(ie),
              file_url: URL.createObjectURL(ie)
            });
          } catch (ie) {
            console.error("Image compression failed, uploading original:", ie);
            const fe = new FileReader();
            fe.onload = (oe) => {
              var de;
              const Xe = ((de = oe.target) == null ? void 0 : de.result).split(",")[1];
              n.value.push({
                content: Xe,
                filename: te.name,
                type: te.type,
                size: te.size,
                url: URL.createObjectURL(te),
                file_url: URL.createObjectURL(te)
              });
            }, fe.readAsDataURL(te);
          }
        else {
          const ie = new FileReader();
          ie.onload = (fe) => {
            var Xe;
            const st = ((Xe = fe.target) == null ? void 0 : Xe.result).split(",")[1];
            n.value.push({
              content: st,
              filename: te.name,
              type: te.type || "application/octet-stream",
              size: te.size,
              url: "",
              file_url: ""
            });
          }, ie.readAsDataURL(te);
        }
      } catch (Ce) {
        console.error("File upload error:", Ce);
      }
  };
  return {
    uploadedAttachments: n,
    previewModal: s,
    previewFile: r,
    formatFileSize: o,
    isImageAttachment: i,
    getDownloadUrl: a,
    getPreviewUrl: l,
    handleFileSelect: c,
    handleDrop: u,
    handleDragOver: y,
    handleDragLeave: p,
    handlePaste: L,
    uploadFiles: V,
    removeAttachment: async (z) => {
      const $ = n.value[z];
      if ($) {
        try {
          let Y = $.url;
          Y.startsWith("/uploads/") ? Y = Y.substring(9) : Y.startsWith("/") && (Y = Y.substring(1)), Y.includes("amazonaws.com/") && (Y = Y.split("amazonaws.com/")[1]);
          const we = {};
          t.value && (we.Authorization = `Bearer ${t.value}`);
          const Ee = await fetch(`${_n.API_URL}/api/v1/files/upload/${Y}`, {
            method: "DELETE",
            headers: we
          });
          if (Ee.ok)
            console.log("File deleted successfully from backend.");
          else {
            const Fe = await Ee.json();
            console.error("Failed to delete file:", Fe.detail);
          }
        } catch (Y) {
          console.error("Error calling delete API:", Y);
        }
        $.url && $.url.startsWith("blob:") && URL.revokeObjectURL($.url), $.file_url && $.file_url.startsWith("blob:") && URL.revokeObjectURL($.file_url), n.value.splice(z, 1);
      }
    },
    openPreview: (z) => {
      r.value = z, s.value = !0;
    },
    closePreview: () => {
      s.value = !1, setTimeout(() => {
        r.value = null;
      }, 300);
    },
    openFilePicker: () => {
      var z;
      (z = e.value) == null || z.click();
    },
    isImage: (z) => z.startsWith("image/")
  };
}
const Zt = /* @__PURE__ */ Object.create(null);
Zt.open = "0";
Zt.close = "1";
Zt.ping = "2";
Zt.pong = "3";
Zt.message = "4";
Zt.upgrade = "5";
Zt.noop = "6";
const Qs = /* @__PURE__ */ Object.create(null);
Object.keys(Zt).forEach((t) => {
  Qs[Zt[t]] = t;
});
const mi = { type: "error", data: "parser error" }, Cl = typeof Blob == "function" || typeof Blob < "u" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]", Rl = typeof ArrayBuffer == "function", Il = (t) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(t) : t && t.buffer instanceof ArrayBuffer, Xi = ({ type: t, data: e }, n, s) => Cl && e instanceof Blob ? n ? s(e) : na(e, s) : Rl && (e instanceof ArrayBuffer || Il(e)) ? n ? s(e) : na(new Blob([e]), s) : s(Zt[t] + (e || "")), na = (t, e) => {
  const n = new FileReader();
  return n.onload = function() {
    const s = n.result.split(",")[1];
    e("b" + (s || ""));
  }, n.readAsDataURL(t);
};
function sa(t) {
  return t instanceof Uint8Array ? t : t instanceof ArrayBuffer ? new Uint8Array(t) : new Uint8Array(t.buffer, t.byteOffset, t.byteLength);
}
let Yr;
function Qh(t, e) {
  if (Cl && t.data instanceof Blob)
    return t.data.arrayBuffer().then(sa).then(e);
  if (Rl && (t.data instanceof ArrayBuffer || Il(t.data)))
    return e(sa(t.data));
  Xi(t, !1, (n) => {
    Yr || (Yr = new TextEncoder()), e(Yr.encode(n));
  });
}
const ra = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", fs = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (let t = 0; t < ra.length; t++)
  fs[ra.charCodeAt(t)] = t;
const ed = (t) => {
  let e = t.length * 0.75, n = t.length, s, r = 0, o, i, a, l;
  t[t.length - 1] === "=" && (e--, t[t.length - 2] === "=" && e--);
  const c = new ArrayBuffer(e), u = new Uint8Array(c);
  for (s = 0; s < n; s += 4)
    o = fs[t.charCodeAt(s)], i = fs[t.charCodeAt(s + 1)], a = fs[t.charCodeAt(s + 2)], l = fs[t.charCodeAt(s + 3)], u[r++] = o << 2 | i >> 4, u[r++] = (i & 15) << 4 | a >> 2, u[r++] = (a & 3) << 6 | l & 63;
  return c;
}, td = typeof ArrayBuffer == "function", Zi = (t, e) => {
  if (typeof t != "string")
    return {
      type: "message",
      data: Ll(t, e)
    };
  const n = t.charAt(0);
  return n === "b" ? {
    type: "message",
    data: nd(t.substring(1), e)
  } : Qs[n] ? t.length > 1 ? {
    type: Qs[n],
    data: t.substring(1)
  } : {
    type: Qs[n]
  } : mi;
}, nd = (t, e) => {
  if (td) {
    const n = ed(t);
    return Ll(n, e);
  } else
    return { base64: !0, data: t };
}, Ll = (t, e) => {
  switch (e) {
    case "blob":
      return t instanceof Blob ? t : new Blob([t]);
    case "arraybuffer":
    default:
      return t instanceof ArrayBuffer ? t : t.buffer;
  }
}, Ol = "", sd = (t, e) => {
  const n = t.length, s = new Array(n);
  let r = 0;
  t.forEach((o, i) => {
    Xi(o, !1, (a) => {
      s[i] = a, ++r === n && e(s.join(Ol));
    });
  });
}, rd = (t, e) => {
  const n = t.split(Ol), s = [];
  for (let r = 0; r < n.length; r++) {
    const o = Zi(n[r], e);
    if (s.push(o), o.type === "error")
      break;
  }
  return s;
};
function id() {
  return new TransformStream({
    transform(t, e) {
      Qh(t, (n) => {
        const s = n.length;
        let r;
        if (s < 126)
          r = new Uint8Array(1), new DataView(r.buffer).setUint8(0, s);
        else if (s < 65536) {
          r = new Uint8Array(3);
          const o = new DataView(r.buffer);
          o.setUint8(0, 126), o.setUint16(1, s);
        } else {
          r = new Uint8Array(9);
          const o = new DataView(r.buffer);
          o.setUint8(0, 127), o.setBigUint64(1, BigInt(s));
        }
        t.data && typeof t.data != "string" && (r[0] |= 128), e.enqueue(r), e.enqueue(n);
      });
    }
  });
}
let $r;
function js(t) {
  return t.reduce((e, n) => e + n.length, 0);
}
function Vs(t, e) {
  if (t[0].length === e)
    return t.shift();
  const n = new Uint8Array(e);
  let s = 0;
  for (let r = 0; r < e; r++)
    n[r] = t[0][s++], s === t[0].length && (t.shift(), s = 0);
  return t.length && s < t[0].length && (t[0] = t[0].slice(s)), n;
}
function od(t, e) {
  $r || ($r = new TextDecoder());
  const n = [];
  let s = 0, r = -1, o = !1;
  return new TransformStream({
    transform(i, a) {
      for (n.push(i); ; ) {
        if (s === 0) {
          if (js(n) < 1)
            break;
          const l = Vs(n, 1);
          o = (l[0] & 128) === 128, r = l[0] & 127, r < 126 ? s = 3 : r === 126 ? s = 1 : s = 2;
        } else if (s === 1) {
          if (js(n) < 2)
            break;
          const l = Vs(n, 2);
          r = new DataView(l.buffer, l.byteOffset, l.length).getUint16(0), s = 3;
        } else if (s === 2) {
          if (js(n) < 8)
            break;
          const l = Vs(n, 8), c = new DataView(l.buffer, l.byteOffset, l.length), u = c.getUint32(0);
          if (u > Math.pow(2, 21) - 1) {
            a.enqueue(mi);
            break;
          }
          r = u * Math.pow(2, 32) + c.getUint32(4), s = 3;
        } else {
          if (js(n) < r)
            break;
          const l = Vs(n, r);
          a.enqueue(Zi(o ? l : $r.decode(l), e)), s = 0;
        }
        if (r === 0 || r > t) {
          a.enqueue(mi);
          break;
        }
      }
    }
  });
}
const Fl = 4;
function ot(t) {
  if (t) return ad(t);
}
function ad(t) {
  for (var e in ot.prototype)
    t[e] = ot.prototype[e];
  return t;
}
ot.prototype.on = ot.prototype.addEventListener = function(t, e) {
  return this._callbacks = this._callbacks || {}, (this._callbacks["$" + t] = this._callbacks["$" + t] || []).push(e), this;
};
ot.prototype.once = function(t, e) {
  function n() {
    this.off(t, n), e.apply(this, arguments);
  }
  return n.fn = e, this.on(t, n), this;
};
ot.prototype.off = ot.prototype.removeListener = ot.prototype.removeAllListeners = ot.prototype.removeEventListener = function(t, e) {
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
ot.prototype.emit = function(t) {
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
ot.prototype.emitReserved = ot.prototype.emit;
ot.prototype.listeners = function(t) {
  return this._callbacks = this._callbacks || {}, this._callbacks["$" + t] || [];
};
ot.prototype.hasListeners = function(t) {
  return !!this.listeners(t).length;
};
const Sr = typeof Promise == "function" && typeof Promise.resolve == "function" ? (e) => Promise.resolve().then(e) : (e, n) => n(e, 0), Pt = typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")(), ld = "arraybuffer";
function Pl(t, ...e) {
  return e.reduce((n, s) => (t.hasOwnProperty(s) && (n[s] = t[s]), n), {});
}
const cd = Pt.setTimeout, ud = Pt.clearTimeout;
function Ar(t, e) {
  e.useNativeTimers ? (t.setTimeoutFn = cd.bind(Pt), t.clearTimeoutFn = ud.bind(Pt)) : (t.setTimeoutFn = Pt.setTimeout.bind(Pt), t.clearTimeoutFn = Pt.clearTimeout.bind(Pt));
}
const fd = 1.33;
function hd(t) {
  return typeof t == "string" ? dd(t) : Math.ceil((t.byteLength || t.size) * fd);
}
function dd(t) {
  let e = 0, n = 0;
  for (let s = 0, r = t.length; s < r; s++)
    e = t.charCodeAt(s), e < 128 ? n += 1 : e < 2048 ? n += 2 : e < 55296 || e >= 57344 ? n += 3 : (s++, n += 4);
  return n;
}
function Dl() {
  return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
}
function pd(t) {
  let e = "";
  for (let n in t)
    t.hasOwnProperty(n) && (e.length && (e += "&"), e += encodeURIComponent(n) + "=" + encodeURIComponent(t[n]));
  return e;
}
function gd(t) {
  let e = {}, n = t.split("&");
  for (let s = 0, r = n.length; s < r; s++) {
    let o = n[s].split("=");
    e[decodeURIComponent(o[0])] = decodeURIComponent(o[1]);
  }
  return e;
}
class md extends Error {
  constructor(e, n, s) {
    super(e), this.description = n, this.context = s, this.type = "TransportError";
  }
}
class Ji extends ot {
  /**
   * Transport abstract constructor.
   *
   * @param {Object} opts - options
   * @protected
   */
  constructor(e) {
    super(), this.writable = !1, Ar(this, e), this.opts = e, this.query = e.query, this.socket = e.socket, this.supportsBinary = !e.forceBase64;
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
    return super.emitReserved("error", new md(e, n, s)), this;
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
    const n = Zi(e, this.socket.binaryType);
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
    const n = pd(e);
    return n.length ? "?" + n : "";
  }
}
class _d extends Ji {
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
    rd(e, this.socket.binaryType).forEach(n), this.readyState !== "closed" && (this._polling = !1, this.emitReserved("pollComplete"), this.readyState === "open" && this._poll());
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
    this.writable = !1, sd(e, (n) => {
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
    return this.opts.timestampRequests !== !1 && (n[this.opts.timestampParam] = Dl()), !this.supportsBinary && !n.sid && (n.b64 = 1), this.createUri(e, n);
  }
}
let Nl = !1;
try {
  Nl = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest();
} catch {
}
const yd = Nl;
function bd() {
}
class vd extends _d {
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
    s.on("success", n), s.on("error", (r, o) => {
      this.onError("xhr post error", r, o);
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
class $t extends ot {
  /**
   * Request constructor
   *
   * @param {Object} options
   * @package
   */
  constructor(e, n, s) {
    super(), this.createRequest = e, Ar(this, s), this._opts = s, this._method = s.method || "GET", this._uri = n, this._data = s.data !== void 0 ? s.data : null, this._create();
  }
  /**
   * Creates the XHR object and sends the request.
   *
   * @private
   */
  _create() {
    var e;
    const n = Pl(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
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
    typeof document < "u" && (this._index = $t.requestsCount++, $t.requests[this._index] = this);
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
      if (this._xhr.onreadystatechange = bd, e)
        try {
          this._xhr.abort();
        } catch {
        }
      typeof document < "u" && delete $t.requests[this._index], this._xhr = null;
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
$t.requestsCount = 0;
$t.requests = {};
if (typeof document < "u") {
  if (typeof attachEvent == "function")
    attachEvent("onunload", ia);
  else if (typeof addEventListener == "function") {
    const t = "onpagehide" in Pt ? "pagehide" : "unload";
    addEventListener(t, ia, !1);
  }
}
function ia() {
  for (let t in $t.requests)
    $t.requests.hasOwnProperty(t) && $t.requests[t].abort();
}
const wd = function() {
  const t = Ml({
    xdomain: !1
  });
  return t && t.responseType !== null;
}();
class kd extends vd {
  constructor(e) {
    super(e);
    const n = e && e.forceBase64;
    this.supportsBinary = wd && !n;
  }
  request(e = {}) {
    return Object.assign(e, { xd: this.xd }, this.opts), new $t(Ml, this.uri(), e);
  }
}
function Ml(t) {
  const e = t.xdomain;
  try {
    if (typeof XMLHttpRequest < "u" && (!e || yd))
      return new XMLHttpRequest();
  } catch {
  }
  if (!e)
    try {
      return new Pt[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
    } catch {
    }
}
const Bl = typeof navigator < "u" && typeof navigator.product == "string" && navigator.product.toLowerCase() === "reactnative";
class xd extends Ji {
  get name() {
    return "websocket";
  }
  doOpen() {
    const e = this.uri(), n = this.opts.protocols, s = Bl ? {} : Pl(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
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
      Xi(s, this.supportsBinary, (o) => {
        try {
          this.doWrite(s, o);
        } catch {
        }
        r && Sr(() => {
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
    return this.opts.timestampRequests && (n[this.opts.timestampParam] = Dl()), this.supportsBinary || (n.b64 = 1), this.createUri(e, n);
  }
}
const Xr = Pt.WebSocket || Pt.MozWebSocket;
class Sd extends xd {
  createSocket(e, n, s) {
    return Bl ? new Xr(e, n, s) : n ? new Xr(e, n) : new Xr(e);
  }
  doWrite(e, n) {
    this.ws.send(n);
  }
}
class Ad extends Ji {
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
        const n = od(Number.MAX_SAFE_INTEGER, this.socket.binaryType), s = e.readable.pipeThrough(n).getReader(), r = id();
        r.readable.pipeTo(e.writable), this._writer = r.writable.getWriter();
        const o = () => {
          s.read().then(({ done: a, value: l }) => {
            a || (this.onPacket(l), o());
          }).catch((a) => {
          });
        };
        o();
        const i = { type: "open" };
        this.query.sid && (i.data = `{"sid":"${this.query.sid}"}`), this._writer.write(i).then(() => this.onOpen());
      });
    });
  }
  write(e) {
    this.writable = !1;
    for (let n = 0; n < e.length; n++) {
      const s = e[n], r = n === e.length - 1;
      this._writer.write(s).then(() => {
        r && Sr(() => {
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
const Td = {
  websocket: Sd,
  webtransport: Ad,
  polling: kd
}, Ed = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/, Cd = [
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
function _i(t) {
  if (t.length > 8e3)
    throw "URI too long";
  const e = t, n = t.indexOf("["), s = t.indexOf("]");
  n != -1 && s != -1 && (t = t.substring(0, n) + t.substring(n, s).replace(/:/g, ";") + t.substring(s, t.length));
  let r = Ed.exec(t || ""), o = {}, i = 14;
  for (; i--; )
    o[Cd[i]] = r[i] || "";
  return n != -1 && s != -1 && (o.source = e, o.host = o.host.substring(1, o.host.length - 1).replace(/;/g, ":"), o.authority = o.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), o.ipv6uri = !0), o.pathNames = Rd(o, o.path), o.queryKey = Id(o, o.query), o;
}
function Rd(t, e) {
  const n = /\/{2,9}/g, s = e.replace(n, "/").split("/");
  return (e.slice(0, 1) == "/" || e.length === 0) && s.splice(0, 1), e.slice(-1) == "/" && s.splice(s.length - 1, 1), s;
}
function Id(t, e) {
  const n = {};
  return e.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function(s, r, o) {
    r && (n[r] = o);
  }), n;
}
const yi = typeof addEventListener == "function" && typeof removeEventListener == "function", er = [];
yi && addEventListener("offline", () => {
  er.forEach((t) => t());
}, !1);
class yn extends ot {
  /**
   * Socket constructor.
   *
   * @param {String|Object} uri - uri or options
   * @param {Object} opts - options
   */
  constructor(e, n) {
    if (super(), this.binaryType = ld, this.writeBuffer = [], this._prevBufferLen = 0, this._pingInterval = -1, this._pingTimeout = -1, this._maxPayload = -1, this._pingTimeoutTime = 1 / 0, e && typeof e == "object" && (n = e, e = null), e) {
      const s = _i(e);
      n.hostname = s.host, n.secure = s.protocol === "https" || s.protocol === "wss", n.port = s.port, s.query && (n.query = s.query);
    } else n.host && (n.hostname = _i(n.host).host);
    Ar(this, n), this.secure = n.secure != null ? n.secure : typeof location < "u" && location.protocol === "https:", n.hostname && !n.port && (n.port = this.secure ? "443" : "80"), this.hostname = n.hostname || (typeof location < "u" ? location.hostname : "localhost"), this.port = n.port || (typeof location < "u" && location.port ? location.port : this.secure ? "443" : "80"), this.transports = [], this._transportsByName = {}, n.transports.forEach((s) => {
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
    }, n), this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : ""), typeof this.opts.query == "string" && (this.opts.query = gd(this.opts.query)), yi && (this.opts.closeOnBeforeunload && (this._beforeunloadEventListener = () => {
      this.transport && (this.transport.removeAllListeners(), this.transport.close());
    }, addEventListener("beforeunload", this._beforeunloadEventListener, !1)), this.hostname !== "localhost" && (this._offlineEventListener = () => {
      this._onClose("transport close", {
        description: "network connection lost"
      });
    }, er.push(this._offlineEventListener))), this.opts.withCredentials && (this._cookieJar = void 0), this._open();
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
    n.EIO = Fl, n.transport = e, this.id && (n.sid = this.id);
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
    const e = this.opts.rememberUpgrade && yn.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1 ? "websocket" : this.transports[0];
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
    this.readyState = "open", yn.priorWebsocketSuccess = this.transport.name === "websocket", this.emitReserved("open"), this.flush();
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
      if (r && (n += hd(r)), s > 0 && n > this._maxPayload)
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
    return e && (this._pingTimeoutTime = 0, Sr(() => {
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
    const o = {
      type: e,
      data: n,
      options: s
    };
    this.emitReserved("packetCreate", o), this.writeBuffer.push(o), r && this.once("flush", r), this.flush();
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
    if (yn.priorWebsocketSuccess = !1, this.opts.tryAllTransports && this.transports.length > 1 && this.readyState === "opening")
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
      if (this.clearTimeoutFn(this._pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), yi && (this._beforeunloadEventListener && removeEventListener("beforeunload", this._beforeunloadEventListener, !1), this._offlineEventListener)) {
        const s = er.indexOf(this._offlineEventListener);
        s !== -1 && er.splice(s, 1);
      }
      this.readyState = "closed", this.id = null, this.emitReserved("close", e, n), this.writeBuffer = [], this._prevBufferLen = 0;
    }
  }
}
yn.protocol = Fl;
class Ld extends yn {
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
    yn.priorWebsocketSuccess = !1;
    const r = () => {
      s || (n.send([{ type: "ping", data: "probe" }]), n.once("packet", (y) => {
        if (!s)
          if (y.type === "pong" && y.data === "probe") {
            if (this.upgrading = !0, this.emitReserved("upgrading", n), !n)
              return;
            yn.priorWebsocketSuccess = n.name === "websocket", this.transport.pause(() => {
              s || this.readyState !== "closed" && (u(), this.setTransport(n), n.send([{ type: "upgrade" }]), this.emitReserved("upgrade", n), n = null, this.upgrading = !1, this.flush());
            });
          } else {
            const p = new Error("probe error");
            p.transport = n.name, this.emitReserved("upgradeError", p);
          }
      }));
    };
    function o() {
      s || (s = !0, u(), n.close(), n = null);
    }
    const i = (y) => {
      const p = new Error("probe error: " + y);
      p.transport = n.name, o(), this.emitReserved("upgradeError", p);
    };
    function a() {
      i("transport closed");
    }
    function l() {
      i("socket closed");
    }
    function c(y) {
      n && y.name !== n.name && o();
    }
    const u = () => {
      n.removeListener("open", r), n.removeListener("error", i), n.removeListener("close", a), this.off("close", l), this.off("upgrading", c);
    };
    n.once("open", r), n.once("error", i), n.once("close", a), this.once("close", l), this.once("upgrading", c), this._upgrades.indexOf("webtransport") !== -1 && e !== "webtransport" ? this.setTimeoutFn(() => {
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
let Od = class extends Ld {
  constructor(e, n = {}) {
    const s = typeof e == "object" ? e : n;
    (!s.transports || s.transports && typeof s.transports[0] == "string") && (s.transports = (s.transports || ["polling", "websocket", "webtransport"]).map((r) => Td[r]).filter((r) => !!r)), super(e, s);
  }
};
function Fd(t, e = "", n) {
  let s = t;
  n = n || typeof location < "u" && location, t == null && (t = n.protocol + "//" + n.host), typeof t == "string" && (t.charAt(0) === "/" && (t.charAt(1) === "/" ? t = n.protocol + t : t = n.host + t), /^(https?|wss?):\/\//.test(t) || (typeof n < "u" ? t = n.protocol + "//" + t : t = "https://" + t), s = _i(t)), s.port || (/^(http|ws)$/.test(s.protocol) ? s.port = "80" : /^(http|ws)s$/.test(s.protocol) && (s.port = "443")), s.path = s.path || "/";
  const o = s.host.indexOf(":") !== -1 ? "[" + s.host + "]" : s.host;
  return s.id = s.protocol + "://" + o + ":" + s.port + e, s.href = s.protocol + "://" + o + (n && n.port === s.port ? "" : ":" + s.port), s;
}
const Pd = typeof ArrayBuffer == "function", Dd = (t) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(t) : t.buffer instanceof ArrayBuffer, Ul = Object.prototype.toString, Nd = typeof Blob == "function" || typeof Blob < "u" && Ul.call(Blob) === "[object BlobConstructor]", Md = typeof File == "function" || typeof File < "u" && Ul.call(File) === "[object FileConstructor]";
function Qi(t) {
  return Pd && (t instanceof ArrayBuffer || Dd(t)) || Nd && t instanceof Blob || Md && t instanceof File;
}
function tr(t, e) {
  if (!t || typeof t != "object")
    return !1;
  if (Array.isArray(t)) {
    for (let n = 0, s = t.length; n < s; n++)
      if (tr(t[n]))
        return !0;
    return !1;
  }
  if (Qi(t))
    return !0;
  if (t.toJSON && typeof t.toJSON == "function" && arguments.length === 1)
    return tr(t.toJSON(), !0);
  for (const n in t)
    if (Object.prototype.hasOwnProperty.call(t, n) && tr(t[n]))
      return !0;
  return !1;
}
function Bd(t) {
  const e = [], n = t.data, s = t;
  return s.data = bi(n, e), s.attachments = e.length, { packet: s, buffers: e };
}
function bi(t, e) {
  if (!t)
    return t;
  if (Qi(t)) {
    const n = { _placeholder: !0, num: e.length };
    return e.push(t), n;
  } else if (Array.isArray(t)) {
    const n = new Array(t.length);
    for (let s = 0; s < t.length; s++)
      n[s] = bi(t[s], e);
    return n;
  } else if (typeof t == "object" && !(t instanceof Date)) {
    const n = {};
    for (const s in t)
      Object.prototype.hasOwnProperty.call(t, s) && (n[s] = bi(t[s], e));
    return n;
  }
  return t;
}
function Ud(t, e) {
  return t.data = vi(t.data, e), delete t.attachments, t;
}
function vi(t, e) {
  if (!t)
    return t;
  if (t && t._placeholder === !0) {
    if (typeof t.num == "number" && t.num >= 0 && t.num < e.length)
      return e[t.num];
    throw new Error("illegal attachments");
  } else if (Array.isArray(t))
    for (let n = 0; n < t.length; n++)
      t[n] = vi(t[n], e);
  else if (typeof t == "object")
    for (const n in t)
      Object.prototype.hasOwnProperty.call(t, n) && (t[n] = vi(t[n], e));
  return t;
}
const zd = [
  "connect",
  "connect_error",
  "disconnect",
  "disconnecting",
  "newListener",
  "removeListener"
  // used by the Node.js EventEmitter
], Hd = 5;
var Ae;
(function(t) {
  t[t.CONNECT = 0] = "CONNECT", t[t.DISCONNECT = 1] = "DISCONNECT", t[t.EVENT = 2] = "EVENT", t[t.ACK = 3] = "ACK", t[t.CONNECT_ERROR = 4] = "CONNECT_ERROR", t[t.BINARY_EVENT = 5] = "BINARY_EVENT", t[t.BINARY_ACK = 6] = "BINARY_ACK";
})(Ae || (Ae = {}));
class Wd {
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
    return (e.type === Ae.EVENT || e.type === Ae.ACK) && tr(e) ? this.encodeAsBinary({
      type: e.type === Ae.EVENT ? Ae.BINARY_EVENT : Ae.BINARY_ACK,
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
    return (e.type === Ae.BINARY_EVENT || e.type === Ae.BINARY_ACK) && (n += e.attachments + "-"), e.nsp && e.nsp !== "/" && (n += e.nsp + ","), e.id != null && (n += e.id), e.data != null && (n += JSON.stringify(e.data, this.replacer)), n;
  }
  /**
   * Encode packet as 'buffer sequence' by removing blobs, and
   * deconstructing packet into object with placeholders and
   * a list of buffers.
   */
  encodeAsBinary(e) {
    const n = Bd(e), s = this.encodeAsString(n.packet), r = n.buffers;
    return r.unshift(s), r;
  }
}
function oa(t) {
  return Object.prototype.toString.call(t) === "[object Object]";
}
class eo extends ot {
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
      const s = n.type === Ae.BINARY_EVENT;
      s || n.type === Ae.BINARY_ACK ? (n.type = s ? Ae.EVENT : Ae.ACK, this.reconstructor = new qd(n), n.attachments === 0 && super.emitReserved("decoded", n)) : super.emitReserved("decoded", n);
    } else if (Qi(e) || e.base64)
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
    if (Ae[s.type] === void 0)
      throw new Error("unknown packet type " + s.type);
    if (s.type === Ae.BINARY_EVENT || s.type === Ae.BINARY_ACK) {
      const o = n + 1;
      for (; e.charAt(++n) !== "-" && n != e.length; )
        ;
      const i = e.substring(o, n);
      if (i != Number(i) || e.charAt(n) !== "-")
        throw new Error("Illegal attachments");
      s.attachments = Number(i);
    }
    if (e.charAt(n + 1) === "/") {
      const o = n + 1;
      for (; ++n && !(e.charAt(n) === "," || n === e.length); )
        ;
      s.nsp = e.substring(o, n);
    } else
      s.nsp = "/";
    const r = e.charAt(n + 1);
    if (r !== "" && Number(r) == r) {
      const o = n + 1;
      for (; ++n; ) {
        const i = e.charAt(n);
        if (i == null || Number(i) != i) {
          --n;
          break;
        }
        if (n === e.length)
          break;
      }
      s.id = Number(e.substring(o, n + 1));
    }
    if (e.charAt(++n)) {
      const o = this.tryParse(e.substr(n));
      if (eo.isPayloadValid(s.type, o))
        s.data = o;
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
      case Ae.CONNECT:
        return oa(n);
      case Ae.DISCONNECT:
        return n === void 0;
      case Ae.CONNECT_ERROR:
        return typeof n == "string" || oa(n);
      case Ae.EVENT:
      case Ae.BINARY_EVENT:
        return Array.isArray(n) && (typeof n[0] == "number" || typeof n[0] == "string" && zd.indexOf(n[0]) === -1);
      case Ae.ACK:
      case Ae.BINARY_ACK:
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
class qd {
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
      const n = Ud(this.reconPack, this.buffers);
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
const jd = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Decoder: eo,
  Encoder: Wd,
  get PacketType() {
    return Ae;
  },
  protocol: Hd
}, Symbol.toStringTag, { value: "Module" }));
function zt(t, e, n) {
  return t.on(e, n), function() {
    t.off(e, n);
  };
}
const Vd = Object.freeze({
  connect: 1,
  connect_error: 1,
  disconnect: 1,
  disconnecting: 1,
  // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
  newListener: 1,
  removeListener: 1
});
class zl extends ot {
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
      zt(e, "open", this.onopen.bind(this)),
      zt(e, "packet", this.onpacket.bind(this)),
      zt(e, "error", this.onerror.bind(this)),
      zt(e, "close", this.onclose.bind(this))
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
    var s, r, o;
    if (Vd.hasOwnProperty(e))
      throw new Error('"' + e.toString() + '" is a reserved event name');
    if (n.unshift(e), this._opts.retries && !this.flags.fromQueue && !this.flags.volatile)
      return this._addToQueue(n), this;
    const i = {
      type: Ae.EVENT,
      data: n
    };
    if (i.options = {}, i.options.compress = this.flags.compress !== !1, typeof n[n.length - 1] == "function") {
      const u = this.ids++, y = n.pop();
      this._registerAckCallback(u, y), i.id = u;
    }
    const a = (r = (s = this.io.engine) === null || s === void 0 ? void 0 : s.transport) === null || r === void 0 ? void 0 : r.writable, l = this.connected && !(!((o = this.io.engine) === null || o === void 0) && o._hasPingExpired());
    return this.flags.volatile && !a || (l ? (this.notifyOutgoingListeners(i), this.packet(i)) : this.sendBuffer.push(i)), this.flags = {}, this;
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
    const o = this.io.setTimeoutFn(() => {
      delete this.acks[e];
      for (let a = 0; a < this.sendBuffer.length; a++)
        this.sendBuffer[a].id === e && this.sendBuffer.splice(a, 1);
      n.call(this, new Error("operation has timed out"));
    }, r), i = (...a) => {
      this.io.clearTimeoutFn(o), n.apply(this, a);
    };
    i.withError = !0, this.acks[e] = i;
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
      const o = (i, a) => i ? r(i) : s(a);
      o.withError = !0, n.push(o), this.emit(e, ...n);
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
    e.push((r, ...o) => s !== this._queue[0] ? void 0 : (r !== null ? s.tryCount > this._opts.retries && (this._queue.shift(), n && n(r)) : (this._queue.shift(), n && n(null, ...o)), s.pending = !1, this._drainQueue())), this._queue.push(s), this._drainQueue();
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
      type: Ae.CONNECT,
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
        case Ae.CONNECT:
          e.data && e.data.sid ? this.onconnect(e.data.sid, e.data.pid) : this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
          break;
        case Ae.EVENT:
        case Ae.BINARY_EVENT:
          this.onevent(e);
          break;
        case Ae.ACK:
        case Ae.BINARY_ACK:
          this.onack(e);
          break;
        case Ae.DISCONNECT:
          this.ondisconnect();
          break;
        case Ae.CONNECT_ERROR:
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
        type: Ae.ACK,
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
    return this.connected && this.packet({ type: Ae.DISCONNECT }), this.destroy(), this.connected && this.onclose("io client disconnect"), this;
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
function Gn(t) {
  t = t || {}, this.ms = t.min || 100, this.max = t.max || 1e4, this.factor = t.factor || 2, this.jitter = t.jitter > 0 && t.jitter <= 1 ? t.jitter : 0, this.attempts = 0;
}
Gn.prototype.duration = function() {
  var t = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var e = Math.random(), n = Math.floor(e * this.jitter * t);
    t = (Math.floor(e * 10) & 1) == 0 ? t - n : t + n;
  }
  return Math.min(t, this.max) | 0;
};
Gn.prototype.reset = function() {
  this.attempts = 0;
};
Gn.prototype.setMin = function(t) {
  this.ms = t;
};
Gn.prototype.setMax = function(t) {
  this.max = t;
};
Gn.prototype.setJitter = function(t) {
  this.jitter = t;
};
class wi extends ot {
  constructor(e, n) {
    var s;
    super(), this.nsps = {}, this.subs = [], e && typeof e == "object" && (n = e, e = void 0), n = n || {}, n.path = n.path || "/socket.io", this.opts = n, Ar(this, n), this.reconnection(n.reconnection !== !1), this.reconnectionAttempts(n.reconnectionAttempts || 1 / 0), this.reconnectionDelay(n.reconnectionDelay || 1e3), this.reconnectionDelayMax(n.reconnectionDelayMax || 5e3), this.randomizationFactor((s = n.randomizationFactor) !== null && s !== void 0 ? s : 0.5), this.backoff = new Gn({
      min: this.reconnectionDelay(),
      max: this.reconnectionDelayMax(),
      jitter: this.randomizationFactor()
    }), this.timeout(n.timeout == null ? 2e4 : n.timeout), this._readyState = "closed", this.uri = e;
    const r = n.parser || jd;
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
    this.engine = new Od(this.uri, this.opts);
    const n = this.engine, s = this;
    this._readyState = "opening", this.skipReconnect = !1;
    const r = zt(n, "open", function() {
      s.onopen(), e && e();
    }), o = (a) => {
      this.cleanup(), this._readyState = "closed", this.emitReserved("error", a), e ? e(a) : this.maybeReconnectOnOpen();
    }, i = zt(n, "error", o);
    if (this._timeout !== !1) {
      const a = this._timeout, l = this.setTimeoutFn(() => {
        r(), o(new Error("timeout")), n.close();
      }, a);
      this.opts.autoUnref && l.unref(), this.subs.push(() => {
        this.clearTimeoutFn(l);
      });
    }
    return this.subs.push(r), this.subs.push(i), this;
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
      zt(e, "ping", this.onping.bind(this)),
      zt(e, "data", this.ondata.bind(this)),
      zt(e, "error", this.onerror.bind(this)),
      zt(e, "close", this.onclose.bind(this)),
      // @ts-ignore
      zt(this.decoder, "decoded", this.ondecoded.bind(this))
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
    Sr(() => {
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
    return s ? this._autoConnect && !s.active && s.connect() : (s = new zl(this, e, n), this.nsps[e] = s), s;
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
const ls = {};
function nr(t, e) {
  typeof t == "object" && (e = t, t = void 0), e = e || {};
  const n = Fd(t, e.path || "/socket.io"), s = n.source, r = n.id, o = n.path, i = ls[r] && o in ls[r].nsps, a = e.forceNew || e["force new connection"] || e.multiplex === !1 || i;
  let l;
  return a ? l = new wi(s, e) : (ls[r] || (ls[r] = new wi(s, e)), l = ls[r]), n.query && !e.query && (e.query = n.queryKey), l.socket(n.path, e);
}
Object.assign(nr, {
  Manager: wi,
  Socket: zl,
  io: nr,
  connect: nr
});
function Kd() {
  const t = ge([]), e = ge(!1), n = ge(""), s = ge(!1), r = ge(!1), o = ge(!1), i = ge("connecting"), a = ge(0), l = 5, c = ge({}), u = ge(null), y = ge("");
  let p = null, L = null, B = null, V = null, Te, se;
  const ce = (W) => {
    Te = W, W && localStorage.setItem("ctid", W);
  }, he = (W) => {
    se = W;
  }, U = (W) => {
    const _e = Te || localStorage.getItem("ctid"), ne = {};
    return _e && (ne.conversation_token = _e), se && (ne.widget_id = se), p = nr(`${_n.WS_URL}/widget`, {
      transports: ["websocket"],
      reconnection: !0,
      reconnectionAttempts: l,
      reconnectionDelay: 1e3,
      auth: Object.keys(ne).length > 0 ? ne : void 0
    }), p.on("connect", () => {
      i.value = "connected", a.value = 0;
    }), p.on("disconnect", () => {
      i.value === "connected" && (console.log("Socket disconnected, setting connection status to connecting"), i.value = "connecting");
    }), p.on("connect_error", () => {
      a.value++, console.error("Socket connection failed, attempt:", a.value, "connection status:", i.value), a.value >= l && (i.value = "failed");
    }), p.on("chat_response", (H) => {
      if (e.value = !1, H.session_id ? (console.log("Captured session_id from chat_response:", H.session_id), y.value = H.session_id) : console.warn("No session_id in chat_response data:", H), H.type === "agent_message") {
        const Pe = {
          message: H.message,
          message_type: "agent",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          session_id: "",
          agent_name: H.agent_name,
          attributes: {
            end_chat: H.end_chat,
            end_chat_reason: H.end_chat_reason,
            end_chat_description: H.end_chat_description,
            request_rating: H.request_rating
          }
        };
        H.attachments && Array.isArray(H.attachments) && (Pe.id = H.message_id, Pe.attachments = H.attachments.map((He, it) => ({
          id: H.message_id * 1e3 + it,
          filename: He.filename,
          file_url: He.file_url,
          content_type: He.content_type,
          file_size: He.file_size
        }))), t.value.push(Pe);
      } else H.shopify_output && typeof H.shopify_output == "object" && H.shopify_output.products ? t.value.push({
        message: H.message,
        // Keep the accompanying text message
        message_type: "product",
        // Use 'product' type for rendering
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: "",
        agent_name: H.agent_name,
        // Assign the whole structured object
        shopify_output: H.shopify_output,
        // Remove the old flattened fields (product_id, product_title, etc.)
        attributes: {
          // Keep other attributes if needed
          end_chat: H.end_chat,
          request_rating: H.request_rating
        }
      }) : t.value.push({
        message: H.message,
        message_type: "bot",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: "",
        agent_name: H.agent_name,
        // Knowledge-base citations (display gated by show_citations in the widget)
        sources: Array.isArray(H.sources) && H.sources.length ? H.sources : void 0,
        attributes: {
          end_chat: H.end_chat,
          end_chat_reason: H.end_chat_reason,
          end_chat_description: H.end_chat_description,
          request_rating: H.request_rating
        }
      });
    }), p.on("handle_taken_over", (H) => {
      t.value.push({
        message: `${H.user_name} joined the conversation`,
        message_type: "system",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: H.session_id
      }), c.value = {
        ...c.value,
        human_agent_name: H.user_name,
        human_agent_profile_pic: H.profile_picture
      }, L && L(H);
    }), p.on("session_initialized", (H) => {
      H.session_id && (console.log("Initialized session_id from session_initialized:", H.session_id), y.value = H.session_id);
    }), p.on("error", Fe), p.on("chat_history", b), p.on("rating_submitted", te), p.on("display_form", Ce), p.on("form_submitted", X), p.on("workflow_state", $e), p.on("workflow_proceeded", ie), p;
  }, z = async () => {
    try {
      return i.value = "connecting", a.value = 0, p && (p.removeAllListeners(), p.disconnect(), p = null), p = U(""), new Promise((W) => {
        p == null || p.on("connect", () => {
          W(!0);
        }), p == null || p.on("connect_error", () => {
          a.value >= l && W(!1);
        });
      });
    } catch (W) {
      return console.error("Socket initialization failed:", W), i.value = "failed", !1;
    }
  }, $ = () => (p && p.disconnect(), z()), Y = (W) => {
    L = W;
  }, we = (W) => {
    B = W;
  }, Ee = (W) => {
    V = W;
  }, Fe = (W) => {
    e.value = !1, n.value = Hf(W), s.value = !0, setTimeout(() => {
      s.value = !1, n.value = "";
    }, 5e3);
  }, b = (W) => {
    if (W.type === "chat_history" && Array.isArray(W.messages)) {
      const _e = W.messages.map((ne) => {
        var Pe, He;
        const H = {
          message: ne.message,
          message_type: ne.message_type,
          created_at: ne.created_at,
          session_id: "",
          agent_name: ne.agent_name || "",
          user_name: ne.user_name || "",
          attributes: ne.attributes || {},
          attachments: ne.attachments || []
          // Include attachments
        };
        return Array.isArray((Pe = ne.attributes) == null ? void 0 : Pe.sources) && ne.attributes.sources.length && (H.sources = ne.attributes.sources), (He = ne.attributes) != null && He.shopify_output && typeof ne.attributes.shopify_output == "object" ? {
          ...H,
          message_type: "product",
          shopify_output: ne.attributes.shopify_output
        } : H;
      });
      t.value = [
        ..._e.filter(
          (ne) => !t.value.some(
            (H) => H.message === ne.message && H.created_at === ne.created_at
          )
        ),
        ...t.value
      ];
    }
  }, te = (W) => {
    W.success && t.value.push({
      message: "Thank you for your feedback!",
      message_type: "system",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: ""
    });
  }, Ce = (W) => {
    var _e;
    console.log("Form display handler in composable:", W), e.value = !1, u.value = W.form_data, console.log("Set currentForm in handleDisplayForm:", u.value), ((_e = W.form_data) == null ? void 0 : _e.form_full_screen) === !0 ? (console.log("Full screen form detected, triggering workflow state callback"), B && B({
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
  }, X = (W) => {
    console.log("Form submitted confirmation received, clearing currentForm"), u.value = null, W.success && console.log("Form submitted successfully");
  }, $e = (W) => {
    console.log("Workflow state received in composable:", W), (W.type === "form" || W.type === "display_form") && (console.log("Setting currentForm from workflow state:", W.form_data), u.value = W.form_data), B && B(W);
  }, ie = (W) => {
    console.log("Workflow proceeded in composable:", W), V && V(W);
  };
  return {
    messages: t,
    loading: e,
    errorMessage: n,
    showError: s,
    loadingHistory: r,
    hasStartedChat: o,
    connectionStatus: i,
    sendMessage: async (W, _e, ne = []) => {
      if (!p || !W.trim() && ne.length === 0) return;
      c.value.human_agent_name || (e.value = !0);
      const H = {
        message: W,
        message_type: "user",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: ""
      };
      ne.length > 0 && (H.attachments = ne.map((Pe, He) => {
        let it = "";
        if (Pe.content_type.startsWith("image/")) {
          const yt = atob(Pe.content), h = new Array(yt.length);
          for (let E = 0; E < yt.length; E++)
            h[E] = yt.charCodeAt(E);
          const g = new Uint8Array(h), k = new Blob([g], { type: Pe.content_type });
          it = URL.createObjectURL(k);
        }
        return {
          id: Date.now() * 1e3 + He,
          // Temporary ID
          filename: Pe.filename,
          file_url: it,
          // Temporary blob URL, will be replaced
          content_type: Pe.content_type,
          file_size: Pe.size,
          _isTemporary: !0
          // Flag to identify temporary attachments
        };
      })), t.value.push(H), p.emit("chat", {
        message: W,
        email: _e,
        files: ne
        // Send files with base64 content
      }), o.value = !0;
    },
    loadChatHistory: async () => {
      if (p)
        try {
          r.value = !0, p.emit("get_chat_history");
        } catch (W) {
          console.error("Failed to load chat history:", W);
        } finally {
          r.value = !1;
        }
    },
    connect: z,
    reconnect: $,
    cleanup: () => {
      p && (p.removeAllListeners(), p.disconnect(), p = null), L = null, B = null, V = null;
    },
    humanAgent: c,
    onTakeover: Y,
    submitRating: async (W, _e) => {
      !p || !W || p.emit("submit_rating", {
        rating: W,
        feedback: _e
      });
    },
    currentForm: u,
    submitForm: async (W) => {
      var H;
      if (console.log("Submitting form in socket:", W), console.log("Current form in socket:", u.value), console.log("Socket in socket:", p), !p) {
        console.error("No socket available for form submission");
        return;
      }
      if (!W || Object.keys(W).length === 0) {
        console.error("No form data to submit");
        return;
      }
      const ne = ((H = u.value) == null ? void 0 : H.form_type) === "contact" ? "submit_contact_info" : "submit_form";
      console.log(`Emitting ${ne} event with data:`, W), p.emit(ne, {
        form_data: W
      }), u.value = null;
    },
    getWorkflowState: async () => {
      p && (console.log("Getting workflow state 12"), p.emit("get_workflow_state"));
    },
    proceedWorkflow: async () => {
      p && p.emit("proceed_workflow", {});
    },
    onWorkflowState: we,
    onWorkflowProceeded: Ee,
    currentSessionId: y,
    setToken: ce,
    setWidgetId: he
  };
}
function Gd(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var Zr = { exports: {} }, aa;
function Yd() {
  return aa || (aa = 1, function(t) {
    (function() {
      function e(f, m, x) {
        return f.call.apply(f.bind, arguments);
      }
      function n(f, m, x) {
        if (!f) throw Error();
        if (2 < arguments.length) {
          var w = Array.prototype.slice.call(arguments, 2);
          return function() {
            var P = Array.prototype.slice.call(arguments);
            return Array.prototype.unshift.apply(P, w), f.apply(m, P);
          };
        }
        return function() {
          return f.apply(m, arguments);
        };
      }
      function s(f, m, x) {
        return s = Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1 ? e : n, s.apply(null, arguments);
      }
      var r = Date.now || function() {
        return +/* @__PURE__ */ new Date();
      };
      function o(f, m) {
        this.a = f, this.o = m || f, this.c = this.o.document;
      }
      var i = !!window.FontFace;
      function a(f, m, x, w) {
        if (m = f.c.createElement(m), x) for (var P in x) x.hasOwnProperty(P) && (P == "style" ? m.style.cssText = x[P] : m.setAttribute(P, x[P]));
        return w && m.appendChild(f.c.createTextNode(w)), m;
      }
      function l(f, m, x) {
        f = f.c.getElementsByTagName(m)[0], f || (f = document.documentElement), f.insertBefore(x, f.lastChild);
      }
      function c(f) {
        f.parentNode && f.parentNode.removeChild(f);
      }
      function u(f, m, x) {
        m = m || [], x = x || [];
        for (var w = f.className.split(/\s+/), P = 0; P < m.length; P += 1) {
          for (var G = !1, ee = 0; ee < w.length; ee += 1) if (m[P] === w[ee]) {
            G = !0;
            break;
          }
          G || w.push(m[P]);
        }
        for (m = [], P = 0; P < w.length; P += 1) {
          for (G = !1, ee = 0; ee < x.length; ee += 1) if (w[P] === x[ee]) {
            G = !0;
            break;
          }
          G || m.push(w[P]);
        }
        f.className = m.join(" ").replace(/\s+/g, " ").replace(/^\s+|\s+$/, "");
      }
      function y(f, m) {
        for (var x = f.className.split(/\s+/), w = 0, P = x.length; w < P; w++) if (x[w] == m) return !0;
        return !1;
      }
      function p(f) {
        return f.o.location.hostname || f.a.location.hostname;
      }
      function L(f, m, x) {
        function w() {
          ye && P && G && (ye(ee), ye = null);
        }
        m = a(f, "link", { rel: "stylesheet", href: m, media: "all" });
        var P = !1, G = !0, ee = null, ye = x || null;
        i ? (m.onload = function() {
          P = !0, w();
        }, m.onerror = function() {
          P = !0, ee = Error("Stylesheet failed to load"), w();
        }) : setTimeout(function() {
          P = !0, w();
        }, 0), l(f, "head", m);
      }
      function B(f, m, x, w) {
        var P = f.c.getElementsByTagName("head")[0];
        if (P) {
          var G = a(f, "script", { src: m }), ee = !1;
          return G.onload = G.onreadystatechange = function() {
            ee || this.readyState && this.readyState != "loaded" && this.readyState != "complete" || (ee = !0, x && x(null), G.onload = G.onreadystatechange = null, G.parentNode.tagName == "HEAD" && P.removeChild(G));
          }, P.appendChild(G), setTimeout(function() {
            ee || (ee = !0, x && x(Error("Script load timeout")));
          }, w || 5e3), G;
        }
        return null;
      }
      function V() {
        this.a = 0, this.c = null;
      }
      function Te(f) {
        return f.a++, function() {
          f.a--, ce(f);
        };
      }
      function se(f, m) {
        f.c = m, ce(f);
      }
      function ce(f) {
        f.a == 0 && f.c && (f.c(), f.c = null);
      }
      function he(f) {
        this.a = f || "-";
      }
      he.prototype.c = function(f) {
        for (var m = [], x = 0; x < arguments.length; x++) m.push(arguments[x].replace(/[\W_]+/g, "").toLowerCase());
        return m.join(this.a);
      };
      function U(f, m) {
        this.c = f, this.f = 4, this.a = "n";
        var x = (m || "n4").match(/^([nio])([1-9])$/i);
        x && (this.a = x[1], this.f = parseInt(x[2], 10));
      }
      function z(f) {
        return we(f) + " " + (f.f + "00") + " 300px " + $(f.c);
      }
      function $(f) {
        var m = [];
        f = f.split(/,\s*/);
        for (var x = 0; x < f.length; x++) {
          var w = f[x].replace(/['"]/g, "");
          w.indexOf(" ") != -1 || /^\d/.test(w) ? m.push("'" + w + "'") : m.push(w);
        }
        return m.join(",");
      }
      function Y(f) {
        return f.a + f.f;
      }
      function we(f) {
        var m = "normal";
        return f.a === "o" ? m = "oblique" : f.a === "i" && (m = "italic"), m;
      }
      function Ee(f) {
        var m = 4, x = "n", w = null;
        return f && ((w = f.match(/(normal|oblique|italic)/i)) && w[1] && (x = w[1].substr(0, 1).toLowerCase()), (w = f.match(/([1-9]00|normal|bold)/i)) && w[1] && (/bold/i.test(w[1]) ? m = 7 : /[1-9]00/.test(w[1]) && (m = parseInt(w[1].substr(0, 1), 10)))), x + m;
      }
      function Fe(f, m) {
        this.c = f, this.f = f.o.document.documentElement, this.h = m, this.a = new he("-"), this.j = m.events !== !1, this.g = m.classes !== !1;
      }
      function b(f) {
        f.g && u(f.f, [f.a.c("wf", "loading")]), Ce(f, "loading");
      }
      function te(f) {
        if (f.g) {
          var m = y(f.f, f.a.c("wf", "active")), x = [], w = [f.a.c("wf", "loading")];
          m || x.push(f.a.c("wf", "inactive")), u(f.f, x, w);
        }
        Ce(f, "inactive");
      }
      function Ce(f, m, x) {
        f.j && f.h[m] && (x ? f.h[m](x.c, Y(x)) : f.h[m]());
      }
      function X() {
        this.c = {};
      }
      function $e(f, m, x) {
        var w = [], P;
        for (P in m) if (m.hasOwnProperty(P)) {
          var G = f.c[P];
          G && w.push(G(m[P], x));
        }
        return w;
      }
      function ie(f, m) {
        this.c = f, this.f = m, this.a = a(this.c, "span", { "aria-hidden": "true" }, this.f);
      }
      function fe(f) {
        l(f.c, "body", f.a);
      }
      function oe(f) {
        return "display:block;position:absolute;top:-9999px;left:-9999px;font-size:300px;width:auto;height:auto;line-height:normal;margin:0;padding:0;font-variant:normal;white-space:nowrap;font-family:" + $(f.c) + ";" + ("font-style:" + we(f) + ";font-weight:" + (f.f + "00") + ";");
      }
      function st(f, m, x, w, P, G) {
        this.g = f, this.j = m, this.a = w, this.c = x, this.f = P || 3e3, this.h = G || void 0;
      }
      st.prototype.start = function() {
        var f = this.c.o.document, m = this, x = r(), w = new Promise(function(ee, ye) {
          function ke() {
            r() - x >= m.f ? ye() : f.fonts.load(z(m.a), m.h).then(function(Ke) {
              1 <= Ke.length ? ee() : setTimeout(ke, 25);
            }, function() {
              ye();
            });
          }
          ke();
        }), P = null, G = new Promise(function(ee, ye) {
          P = setTimeout(ye, m.f);
        });
        Promise.race([G, w]).then(function() {
          P && (clearTimeout(P), P = null), m.g(m.a);
        }, function() {
          m.j(m.a);
        });
      };
      function Xe(f, m, x, w, P, G, ee) {
        this.v = f, this.B = m, this.c = x, this.a = w, this.s = ee || "BESbswy", this.f = {}, this.w = P || 3e3, this.u = G || null, this.m = this.j = this.h = this.g = null, this.g = new ie(this.c, this.s), this.h = new ie(this.c, this.s), this.j = new ie(this.c, this.s), this.m = new ie(this.c, this.s), f = new U(this.a.c + ",serif", Y(this.a)), f = oe(f), this.g.a.style.cssText = f, f = new U(this.a.c + ",sans-serif", Y(this.a)), f = oe(f), this.h.a.style.cssText = f, f = new U("serif", Y(this.a)), f = oe(f), this.j.a.style.cssText = f, f = new U("sans-serif", Y(this.a)), f = oe(f), this.m.a.style.cssText = f, fe(this.g), fe(this.h), fe(this.j), fe(this.m);
      }
      var de = { D: "serif", C: "sans-serif" }, Ze = null;
      function Se() {
        if (Ze === null) {
          var f = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent);
          Ze = !!f && (536 > parseInt(f[1], 10) || parseInt(f[1], 10) === 536 && 11 >= parseInt(f[2], 10));
        }
        return Ze;
      }
      Xe.prototype.start = function() {
        this.f.serif = this.j.a.offsetWidth, this.f["sans-serif"] = this.m.a.offsetWidth, this.A = r(), _e(this);
      };
      function W(f, m, x) {
        for (var w in de) if (de.hasOwnProperty(w) && m === f.f[de[w]] && x === f.f[de[w]]) return !0;
        return !1;
      }
      function _e(f) {
        var m = f.g.a.offsetWidth, x = f.h.a.offsetWidth, w;
        (w = m === f.f.serif && x === f.f["sans-serif"]) || (w = Se() && W(f, m, x)), w ? r() - f.A >= f.w ? Se() && W(f, m, x) && (f.u === null || f.u.hasOwnProperty(f.a.c)) ? H(f, f.v) : H(f, f.B) : ne(f) : H(f, f.v);
      }
      function ne(f) {
        setTimeout(s(function() {
          _e(this);
        }, f), 50);
      }
      function H(f, m) {
        setTimeout(s(function() {
          c(this.g.a), c(this.h.a), c(this.j.a), c(this.m.a), m(this.a);
        }, f), 0);
      }
      function Pe(f, m, x) {
        this.c = f, this.a = m, this.f = 0, this.m = this.j = !1, this.s = x;
      }
      var He = null;
      Pe.prototype.g = function(f) {
        var m = this.a;
        m.g && u(m.f, [m.a.c("wf", f.c, Y(f).toString(), "active")], [m.a.c("wf", f.c, Y(f).toString(), "loading"), m.a.c("wf", f.c, Y(f).toString(), "inactive")]), Ce(m, "fontactive", f), this.m = !0, it(this);
      }, Pe.prototype.h = function(f) {
        var m = this.a;
        if (m.g) {
          var x = y(m.f, m.a.c("wf", f.c, Y(f).toString(), "active")), w = [], P = [m.a.c("wf", f.c, Y(f).toString(), "loading")];
          x || w.push(m.a.c("wf", f.c, Y(f).toString(), "inactive")), u(m.f, w, P);
        }
        Ce(m, "fontinactive", f), it(this);
      };
      function it(f) {
        --f.f == 0 && f.j && (f.m ? (f = f.a, f.g && u(f.f, [f.a.c("wf", "active")], [f.a.c("wf", "loading"), f.a.c("wf", "inactive")]), Ce(f, "active")) : te(f.a));
      }
      function yt(f) {
        this.j = f, this.a = new X(), this.h = 0, this.f = this.g = !0;
      }
      yt.prototype.load = function(f) {
        this.c = new o(this.j, f.context || this.j), this.g = f.events !== !1, this.f = f.classes !== !1, g(this, new Fe(this.c, f), f);
      };
      function h(f, m, x, w, P) {
        var G = --f.h == 0;
        (f.f || f.g) && setTimeout(function() {
          var ee = P || null, ye = w || null || {};
          if (x.length === 0 && G) te(m.a);
          else {
            m.f += x.length, G && (m.j = G);
            var ke, Ke = [];
            for (ke = 0; ke < x.length; ke++) {
              var De = x[ke], lt = ye[De.c], bt = m.a, qe = De;
              if (bt.g && u(bt.f, [bt.a.c("wf", qe.c, Y(qe).toString(), "loading")]), Ce(bt, "fontloading", qe), bt = null, He === null) if (window.FontFace) {
                var qe = /Gecko.*Firefox\/(\d+)/.exec(window.navigator.userAgent), Wt = /OS X.*Version\/10\..*Safari/.exec(window.navigator.userAgent) && /Apple/.exec(window.navigator.vendor);
                He = qe ? 42 < parseInt(qe[1], 10) : !Wt;
              } else He = !1;
              He ? bt = new st(s(m.g, m), s(m.h, m), m.c, De, m.s, lt) : bt = new Xe(s(m.g, m), s(m.h, m), m.c, De, m.s, ee, lt), Ke.push(bt);
            }
            for (ke = 0; ke < Ke.length; ke++) Ke[ke].start();
          }
        }, 0);
      }
      function g(f, m, x) {
        var P = [], w = x.timeout;
        b(m);
        var P = $e(f.a, x, f.c), G = new Pe(f.c, m, w);
        for (f.h = P.length, m = 0, x = P.length; m < x; m++) P[m].load(function(ee, ye, ke) {
          h(f, G, ee, ye, ke);
        });
      }
      function k(f, m) {
        this.c = f, this.a = m;
      }
      k.prototype.load = function(f) {
        function m() {
          if (G["__mti_fntLst" + w]) {
            var ee = G["__mti_fntLst" + w](), ye = [], ke;
            if (ee) for (var Ke = 0; Ke < ee.length; Ke++) {
              var De = ee[Ke].fontfamily;
              ee[Ke].fontStyle != null && ee[Ke].fontWeight != null ? (ke = ee[Ke].fontStyle + ee[Ke].fontWeight, ye.push(new U(De, ke))) : ye.push(new U(De));
            }
            f(ye);
          } else setTimeout(function() {
            m();
          }, 50);
        }
        var x = this, w = x.a.projectId, P = x.a.version;
        if (w) {
          var G = x.c.o;
          B(this.c, (x.a.api || "https://fast.fonts.net/jsapi") + "/" + w + ".js" + (P ? "?v=" + P : ""), function(ee) {
            ee ? f([]) : (G["__MonotypeConfiguration__" + w] = function() {
              return x.a;
            }, m());
          }).id = "__MonotypeAPIScript__" + w;
        } else f([]);
      };
      function E(f, m) {
        this.c = f, this.a = m;
      }
      E.prototype.load = function(f) {
        var m, x, w = this.a.urls || [], P = this.a.families || [], G = this.a.testStrings || {}, ee = new V();
        for (m = 0, x = w.length; m < x; m++) L(this.c, w[m], Te(ee));
        var ye = [];
        for (m = 0, x = P.length; m < x; m++) if (w = P[m].split(":"), w[1]) for (var ke = w[1].split(","), Ke = 0; Ke < ke.length; Ke += 1) ye.push(new U(w[0], ke[Ke]));
        else ye.push(new U(w[0]));
        se(ee, function() {
          f(ye, G);
        });
      };
      function A(f, m) {
        f ? this.c = f : this.c = T, this.a = [], this.f = [], this.g = m || "";
      }
      var T = "https://fonts.googleapis.com/css";
      function D(f, m) {
        for (var x = m.length, w = 0; w < x; w++) {
          var P = m[w].split(":");
          P.length == 3 && f.f.push(P.pop());
          var G = "";
          P.length == 2 && P[1] != "" && (G = ":"), f.a.push(P.join(G));
        }
      }
      function M(f) {
        if (f.a.length == 0) throw Error("No fonts to load!");
        if (f.c.indexOf("kit=") != -1) return f.c;
        for (var m = f.a.length, x = [], w = 0; w < m; w++) x.push(f.a[w].replace(/ /g, "+"));
        return m = f.c + "?family=" + x.join("%7C"), 0 < f.f.length && (m += "&subset=" + f.f.join(",")), 0 < f.g.length && (m += "&text=" + encodeURIComponent(f.g)), m;
      }
      function F(f) {
        this.f = f, this.a = [], this.c = {};
      }
      var C = { latin: "BESbswy", "latin-ext": "çöüğş", cyrillic: "йяЖ", greek: "αβΣ", khmer: "កខគ", Hanuman: "កខគ" }, Z = { thin: "1", extralight: "2", "extra-light": "2", ultralight: "2", "ultra-light": "2", light: "3", regular: "4", book: "4", medium: "5", "semi-bold": "6", semibold: "6", "demi-bold": "6", demibold: "6", bold: "7", "extra-bold": "8", extrabold: "8", "ultra-bold": "8", ultrabold: "8", black: "9", heavy: "9", l: "3", r: "4", b: "7" }, N = { i: "i", italic: "i", n: "n", normal: "n" }, K = /^(thin|(?:(?:extra|ultra)-?)?light|regular|book|medium|(?:(?:semi|demi|extra|ultra)-?)?bold|black|heavy|l|r|b|[1-9]00)?(n|i|normal|italic)?$/;
      function Q(f) {
        for (var m = f.f.length, x = 0; x < m; x++) {
          var w = f.f[x].split(":"), P = w[0].replace(/\+/g, " "), G = ["n4"];
          if (2 <= w.length) {
            var ee, ye = w[1];
            if (ee = [], ye) for (var ye = ye.split(","), ke = ye.length, Ke = 0; Ke < ke; Ke++) {
              var De;
              if (De = ye[Ke], De.match(/^[\w-]+$/)) {
                var lt = K.exec(De.toLowerCase());
                if (lt == null) De = "";
                else {
                  if (De = lt[2], De = De == null || De == "" ? "n" : N[De], lt = lt[1], lt == null || lt == "") lt = "4";
                  else var bt = Z[lt], lt = bt || (isNaN(lt) ? "4" : lt.substr(0, 1));
                  De = [De, lt].join("");
                }
              } else De = "";
              De && ee.push(De);
            }
            0 < ee.length && (G = ee), w.length == 3 && (w = w[2], ee = [], w = w ? w.split(",") : ee, 0 < w.length && (w = C[w[0]]) && (f.c[P] = w));
          }
          for (f.c[P] || (w = C[P]) && (f.c[P] = w), w = 0; w < G.length; w += 1) f.a.push(new U(P, G[w]));
        }
      }
      function le(f, m) {
        this.c = f, this.a = m;
      }
      var Re = { Arimo: !0, Cousine: !0, Tinos: !0 };
      le.prototype.load = function(f) {
        var m = new V(), x = this.c, w = new A(this.a.api, this.a.text), P = this.a.families;
        D(w, P);
        var G = new F(P);
        Q(G), L(x, M(w), Te(m)), se(m, function() {
          f(G.a, G.c, Re);
        });
      };
      function be(f, m) {
        this.c = f, this.a = m;
      }
      be.prototype.load = function(f) {
        var m = this.a.id, x = this.c.o;
        m ? B(this.c, (this.a.api || "https://use.typekit.net") + "/" + m + ".js", function(w) {
          if (w) f([]);
          else if (x.Typekit && x.Typekit.config && x.Typekit.config.fn) {
            w = x.Typekit.config.fn;
            for (var P = [], G = 0; G < w.length; G += 2) for (var ee = w[G], ye = w[G + 1], ke = 0; ke < ye.length; ke++) P.push(new U(ee, ye[ke]));
            try {
              x.Typekit.load({ events: !1, classes: !1, async: !0 });
            } catch {
            }
            f(P);
          }
        }, 2e3) : f([]);
      };
      function rt(f, m) {
        this.c = f, this.f = m, this.a = [];
      }
      rt.prototype.load = function(f) {
        var m = this.f.id, x = this.c.o, w = this;
        m ? (x.__webfontfontdeckmodule__ || (x.__webfontfontdeckmodule__ = {}), x.__webfontfontdeckmodule__[m] = function(P, G) {
          for (var ee = 0, ye = G.fonts.length; ee < ye; ++ee) {
            var ke = G.fonts[ee];
            w.a.push(new U(ke.name, Ee("font-weight:" + ke.weight + ";font-style:" + ke.style)));
          }
          f(w.a);
        }, B(this.c, (this.f.api || "https://f.fontdeck.com/s/css/js/") + p(this.c) + "/" + m + ".js", function(P) {
          P && f([]);
        })) : f([]);
      };
      var ze = new yt(window);
      ze.a.c.custom = function(f, m) {
        return new E(m, f);
      }, ze.a.c.fontdeck = function(f, m) {
        return new rt(m, f);
      }, ze.a.c.monotype = function(f, m) {
        return new k(m, f);
      }, ze.a.c.typekit = function(f, m) {
        return new be(m, f);
      }, ze.a.c.google = function(f, m) {
        return new le(m, f);
      };
      var ut = { load: s(ze.load, ze) };
      t.exports ? t.exports = ut : (window.WebFont = ut, window.WebFontConfig && ze.load(window.WebFontConfig));
    })();
  }(Zr)), Zr.exports;
}
var $d = Yd();
const Xd = /* @__PURE__ */ Gd($d);
function Zd() {
  const t = ge({}), e = ge(""), n = (r) => {
    t.value = r, r.photo_url && (t.value.photo_url = r.photo_url), r.font_family && Xd.load({
      google: {
        families: [r.font_family]
      },
      active: () => {
        const o = document.querySelector(".chat-container");
        o && (o.style.fontFamily = `"${r.font_family}", system-ui, sans-serif`);
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
function Jd() {
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
      const o = r ? t[r] || r : "", i = typeof s == "string" ? s : s.toString();
      return o ? `${o}${i}` : i;
    },
    getCurrencySymbol: (s) => t[s] || s,
    currencySymbols: t
  };
}
const Bn = "ctid", la = 3, Qd = "image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls", ep = /* @__PURE__ */ lu({
  __name: "WidgetBuilder",
  props: {
    widgetId: { type: [String, null], required: !1 },
    token: { type: [String, null], required: !1 },
    initialAuthError: { type: [String, null], required: !1 }
  },
  setup(t, { expose: e }) {
    var lo;
    e(), Le.setOptions({
      renderer: new Le.Renderer(),
      gfm: !0,
      breaks: !0
    });
    const n = new Le.Renderer(), s = n.link;
    n.link = (d, S, q) => s.call(n, d, S, q).replace(/^<a /, '<a target="_blank" rel="nofollow" '), Le.use({ renderer: n });
    const r = (d) => Vh(Le(d, { renderer: n })), o = t, i = We(() => {
      var d;
      return o.widgetId || ((d = window.__INITIAL_DATA__) == null ? void 0 : d.widgetId);
    }), {
      customization: a,
      agentName: l,
      applyCustomization: c,
      initializeFromData: u
    } = Zd(), { formatCurrency: y } = Jd(), {
      messages: p,
      loading: L,
      errorMessage: B,
      showError: V,
      loadingHistory: Te,
      hasStartedChat: se,
      connectionStatus: ce,
      sendMessage: he,
      sendFileAttachments: U,
      loadChatHistory: z,
      connect: $,
      reconnect: Y,
      cleanup: we,
      humanAgent: Ee,
      onTakeover: Fe,
      submitRating: b,
      submitForm: te,
      currentForm: Ce,
      getWorkflowState: X,
      proceedWorkflow: $e,
      onWorkflowState: ie,
      onWorkflowProceeded: fe,
      currentSessionId: oe,
      setToken: st,
      setWidgetId: Xe
    } = Kd(), de = ge(""), Ze = ge(!0), Se = ge(""), W = ge(!1), _e = (d) => {
      const S = d.target;
      de.value = S.value;
    };
    let ne = null;
    const H = () => {
      ne && ne.disconnect(), ne = new MutationObserver((S) => {
        let q = !1, re = !1;
        S.forEach((Oe) => {
          if (Oe.type === "childList") {
            const ht = Array.from(Oe.addedNodes).some(
              (xe) => {
                var hn;
                return xe.nodeType === Node.ELEMENT_NODE && (xe.matches("input, textarea") || ((hn = xe.querySelector) == null ? void 0 : hn.call(xe, "input, textarea")));
              }
            ), Je = Array.from(Oe.removedNodes).some(
              (xe) => {
                var hn;
                return xe.nodeType === Node.ELEMENT_NODE && (xe.matches("input, textarea") || ((hn = xe.querySelector) == null ? void 0 : hn.call(xe, "input, textarea")));
              }
            );
            ht && (re = !0, q = !0), Je && (q = !0);
          }
        }), q && (clearTimeout(H.timeoutId), H.timeoutId = setTimeout(() => {
          He();
        }, re ? 50 : 100));
      });
      const d = document.querySelector(".widget-container") || document.body;
      ne.observe(d, {
        childList: !0,
        subtree: !0
      });
    };
    H.timeoutId = null;
    let Pe = [];
    const He = () => {
      it();
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
      let S = [];
      for (const q of d) {
        const re = document.querySelectorAll(q);
        if (re.length > 0) {
          S = Array.from(re);
          break;
        }
      }
      S.length !== 0 && (Pe = S, S.forEach((q) => {
        q.addEventListener("input", h, !0), q.addEventListener("keyup", h, !0), q.addEventListener("change", h, !0), q.addEventListener("keypress", g, !0), q.addEventListener("keydown", k, !0);
      }));
    }, it = () => {
      Pe.forEach((d) => {
        d.removeEventListener("input", h), d.removeEventListener("keyup", h), d.removeEventListener("change", h), d.removeEventListener("keypress", g), d.removeEventListener("keydown", k);
      }), Pe = [];
    }, yt = (d) => !!(d && d.closest && d.closest(".form-message, .form-fullscreen")), h = (d) => {
      if (yt(d.target)) return;
      const S = d.target;
      de.value = S.value;
    }, g = (d) => {
      yt(d.target) || d.key === "Enter" && !d.shiftKey && (d.preventDefault(), d.stopPropagation(), Sn());
    }, k = (d) => {
      yt(d.target) || d.key === "Enter" && !d.shiftKey && (d.preventDefault(), d.stopPropagation(), Sn());
    }, E = (d) => {
      const S = d.target, q = document.querySelector(".header-menu-container");
      document.querySelector(".header-menu-btn");
      const re = document.querySelector(".header-dropdown-menu");
      re && !(q != null && q.contains(S)) && (re.style.display = "none");
    }, A = ge(!0), T = (d) => !d || d === "undefined" || d === "null" || typeof d == "string" && d.trim() === "" ? null : d, D = ge(T(((lo = window.__INITIAL_DATA__) == null ? void 0 : lo.initialToken) || localStorage.getItem(Bn))), M = We(() => !!D.value), F = ge(null), C = ge(!1), Z = ge(!1);
    o.initialAuthError && (F.value = o.initialAuthError, C.value = !0, A.value = !1), u();
    const N = window.__INITIAL_DATA__;
    if (N != null && N.initialToken) {
      const d = T(N.initialToken);
      d && (D.value = d, window.parent.postMessage({
        type: "TOKEN_UPDATE",
        token: d
      }, "*"), W.value = !0);
    }
    const K = ge(!1);
    (N == null ? void 0 : N.allowAttachments) !== void 0 && (K.value = N.allowAttachments);
    const Q = ge(null), {
      chatStyles: le,
      chatIconStyles: Re,
      agentBubbleStyles: be,
      userBubbleStyles: rt,
      messageNameStyles: ze,
      headerBorderStyles: ut,
      photoUrl: f,
      shadowStyle: m
    } = $h(a), x = ge(null), {
      uploadedAttachments: w,
      previewModal: P,
      previewFile: G,
      formatFileSize: ee,
      isImageAttachment: ye,
      getDownloadUrl: ke,
      getPreviewUrl: Ke,
      handleFileSelect: De,
      handleDrop: lt,
      handleDragOver: bt,
      handleDragLeave: qe,
      handlePaste: Wt,
      uploadFiles: Tr,
      removeAttachment: Cs,
      openPreview: Yn,
      closePreview: Rs,
      openFilePicker: Is,
      isImage: Er
    } = Jh(D, x), Ot = We(() => p.value.some(
      (d) => d.message_type === "form" && (!d.isSubmitted || d.isSubmitted === !1)
    )), un = We(() => {
      var d;
      return se.value && W.value || !oo.value ? ce.value === "connected" && !L.value : zs(Se.value.trim()) && ce.value === "connected" && !L.value || ((d = window.__INITIAL_DATA__) == null ? void 0 : d.workflow);
    }), Ls = We(() => ce.value === "connected" ? Jn.value ? "Ask me anything..." : "Type a message..." : "Connecting..."), Sn = async () => {
      if (!de.value.trim() && w.value.length === 0) return;
      !se.value && Se.value && await fn();
      const d = w.value.map((q) => ({
        content: q.content,
        // base64 content
        filename: q.filename,
        content_type: q.type,
        size: q.size
      }));
      await he(de.value, Se.value, d), w.value.forEach((q) => {
        q.url && q.url.startsWith("blob:") && URL.revokeObjectURL(q.url), q.file_url && q.file_url.startsWith("blob:") && URL.revokeObjectURL(q.file_url);
      }), de.value = "", w.value = [];
      const S = document.querySelector('input[placeholder*="Type a message"]');
      S && (S.value = ""), setTimeout(() => {
        He();
      }, 500);
    }, $n = (d) => {
      d.key === "Enter" && !d.shiftKey && (d.preventDefault(), d.stopPropagation(), Sn());
    }, fn = async () => {
      var d, S, q, re;
      try {
        if (!i.value)
          return console.error("Widget ID is not available"), F.value = "Widget ID is not available. Please refresh and try again.", C.value = !0, !1;
        const Oe = new URL(`${_n.API_URL}/widgets/${i.value}`);
        Se.value.trim() && zs(Se.value.trim()) && Oe.searchParams.append("email", Se.value.trim());
        const ht = {
          Accept: "application/json",
          "Content-Type": "application/json"
        };
        D.value && (ht.Authorization = `Bearer ${D.value}`);
        const Je = await fetch(Oe, {
          headers: ht
        });
        if (Je.status === 401) {
          W.value = !1;
          try {
            const Or = (await Je.json()).detail || "";
            (Or.includes("generate-token") || Or.includes("API key") || Or.includes("Token required")) && (Z.value = !0, F.value = "Widget authentication not configured. Please contact the website administrator.", C.value = !0, localStorage.removeItem(Bn), D.value = null);
          } catch {
            F.value = "Authentication required. Your token has expired or is invalid. Please refresh the page.", C.value = !0, localStorage.removeItem(Bn), D.value = null;
          }
          return !1;
        }
        if (!Je.ok) {
          try {
            const co = await Je.json();
            F.value = co.detail || `Error: ${Je.statusText}`;
          } catch {
            F.value = `Error: ${Je.statusText}. Please try again.`;
          }
          return C.value = !0, !1;
        }
        const xe = await Je.json();
        return xe.token && (D.value = xe.token, localStorage.setItem(Bn, xe.token), window.parent.postMessage({ type: "TOKEN_UPDATE", token: xe.token }, "*")), W.value = !0, F.value = null, C.value = !1, st(D.value || void 0), await $() ? (await Ft(), (d = xe.agent) != null && d.customization && c(xe.agent.customization), xe.agent && !(xe != null && xe.human_agent) && (l.value = xe.agent.name), xe != null && xe.human_agent && (Ee.value = xe.human_agent), ((S = xe.agent) == null ? void 0 : S.allow_attachments) !== void 0 && (K.value = xe.agent.allow_attachments), ((q = xe.agent) == null ? void 0 : q.workflow) !== void 0 && (window.__INITIAL_DATA__ = window.__INITIAL_DATA__ || {}, window.__INITIAL_DATA__.workflow = xe.agent.workflow), (re = xe.agent) != null && re.workflow && await X(), !0) : (console.error("Failed to connect to chat service"), F.value = "Failed to connect to chat service. Please try again.", C.value = !0, !1);
      } catch (Oe) {
        return console.error("Error checking authorization:", Oe), F.value = "An unexpected error occurred. Please try again.", C.value = !0, W.value = !1, !1;
      } finally {
        A.value = !1;
      }
    }, Ft = async () => {
      !se.value && W.value && (se.value = !0, await z());
    }, An = () => {
      Q.value && (Q.value.scrollTop = Q.value.scrollHeight);
    };
    On(() => p.value, (d) => {
      Pa(() => {
        An();
      });
    }, { deep: !0 }), On(ce, (d, S) => {
      d === "connected" && S !== "connected" && setTimeout(He, 100);
    }), On(() => p.value.length, (d, S) => {
      d > 0 && S === 0 && setTimeout(He, 100);
    }), On(() => p.value, (d) => {
      if (d.length > 0) {
        const S = d[d.length - 1];
        Zn(S);
      }
    }, { deep: !0 });
    const Os = async () => {
      await Y() && await fn();
    }, Fs = ge(!1), Ps = ge(0), Cr = ge(""), J = ge(0), _ = ge(!1), O = ge({}), j = ge(!1), Ie = ge({}), et = ge(!1), tt = ge(null), ft = ge("Start Chat"), pt = ge(!1), Ct = ge(null), Xn = We(() => {
      var S;
      const d = p.value[p.value.length - 1];
      return ((S = d == null ? void 0 : d.attributes) == null ? void 0 : S.request_rating) || !1;
    }), ct = We(() => {
      var S;
      if (!((S = window.__INITIAL_DATA__) != null && S.workflow))
        return !1;
      const d = p.value.find((q) => q.message_type === "rating");
      return (d == null ? void 0 : d.isSubmitted) === !0;
    }), Ds = We(() => Ee.value.human_agent_profile_pic ? Ee.value.human_agent_profile_pic.includes("amazonaws.com") ? Ee.value.human_agent_profile_pic : `${_n.API_URL}${Ee.value.human_agent_profile_pic}` : ""), Zn = async (d) => {
      var S, q, re, Oe, ht;
      try {
        if (d.session_id && D.value && i.value) {
          const Je = new URL(`${_n.API_URL}/widgets/${i.value}/end-chat`);
          Je.searchParams.append("session_id", d.session_id), (S = d.attributes) != null && S.end_chat_reason && Je.searchParams.append("reason", d.attributes.end_chat_reason), (q = d.attributes) != null && q.end_chat_description && Je.searchParams.append("description", d.attributes.end_chat_description);
          const xe = await fetch(Je, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${D.value}`,
              "Content-Type": "application/json"
            }
          });
          if (xe.ok) {
            const hn = await xe.json();
            console.info(`✓ Chat session closed on backend: ${hn.session_id}`);
          } else
            console.warn(`Failed to close session on backend: ${xe.status}`);
        }
      } catch (Je) {
        console.error("Error calling end-chat API:", Je);
      }
      if ((re = d.attributes) != null && re.end_chat && ((Oe = d.attributes) != null && Oe.request_rating)) {
        const Je = d.agent_name || ((ht = Ee.value) == null ? void 0 : ht.human_agent_name) || l.value || "our agent";
        p.value.push({
          message: `Rate the chat session that you had with ${Je}`,
          message_type: "rating",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          session_id: d.session_id,
          agent_name: Je,
          showFeedback: !1
        }), oe.value = d.session_id;
      }
    }, jl = (d) => {
      _.value || (J.value = d);
    }, Vl = () => {
      if (!_.value) {
        const d = p.value[p.value.length - 1];
        J.value = (d == null ? void 0 : d.selectedRating) || 0;
      }
    }, Kl = async (d) => {
      if (!_.value) {
        J.value = d;
        const S = p.value[p.value.length - 1];
        S && S.message_type === "rating" && (S.showFeedback = !0, S.selectedRating = d);
      }
    }, Gl = async (d, S, q = null) => {
      try {
        _.value = !0, await b(S, q);
        const re = p.value.find((Oe) => Oe.message_type === "rating");
        re && (re.isSubmitted = !0, re.finalRating = S, re.finalFeedback = q);
      } catch (re) {
        console.error("Failed to submit rating:", re);
      } finally {
        _.value = !1;
      }
    }, Yl = (d) => {
      const S = d.shopify_output || {
        id: d.product_id,
        title: d.product_title,
        price: d.product_price,
        image: d.product_image,
        vendor: d.product_vendor
      };
      S && window.parent.postMessage({
        type: "ADD_TO_CART",
        product: S
      }, "*");
    }, $l = (d) => {
      d && window.parent.postMessage({
        type: "ADD_TO_CART",
        product: d
      }, "*");
    }, to = (d) => {
      const S = {};
      for (const q of d.fields) {
        const re = O.value[q.name], Oe = Ns(q, re);
        Oe && (S[q.name] = Oe);
      }
      return Ie.value = S, Object.keys(S).length === 0;
    }, Xl = async (d) => {
      if (!(j.value || !to(d)))
        try {
          j.value = !0, await te(O.value);
          const q = p.value.findIndex(
            (re) => re.message_type === "form" && (!re.isSubmitted || re.isSubmitted === !1)
          );
          q !== -1 && p.value.splice(q, 1), O.value = {}, Ie.value = {};
        } catch (q) {
          console.error("Failed to submit form:", q);
        } finally {
          j.value = !1;
        }
    }, Zl = (d, S) => {
      var q, re;
      if (O.value[d] = S, S && S.toString().trim() !== "") {
        let Oe = null;
        if ((q = Ct.value) != null && q.fields && (Oe = Ct.value.fields.find((ht) => ht.name === d)), !Oe && ((re = Ce.value) != null && re.fields) && (Oe = Ce.value.fields.find((ht) => ht.name === d)), Oe) {
          const ht = Ns(Oe, S);
          ht ? (Ie.value[d] = ht, console.log(`Validation error for ${d}:`, ht)) : delete Ie.value[d];
        }
      } else
        delete Ie.value[d], console.log(`Cleared error for ${d}`);
    }, no = (d) => {
      const S = d.replace(/\D/g, "");
      return S.length >= 7 && S.length <= 15;
    }, Ns = (d, S) => {
      if (d.required && (!S || S.toString().trim() === ""))
        return `${d.label} is required`;
      if (!S || S.toString().trim() === "")
        return null;
      if (d.type === "email" && !zs(S))
        return "Please enter a valid email address";
      if (d.type === "tel" && !no(S))
        return "Please enter a valid phone number";
      if ((d.type === "text" || d.type === "textarea") && d.minLength && S.length < d.minLength)
        return `${d.label} must be at least ${d.minLength} characters`;
      if ((d.type === "text" || d.type === "textarea") && d.maxLength && S.length > d.maxLength)
        return `${d.label} must not exceed ${d.maxLength} characters`;
      if (d.type === "number") {
        const q = parseFloat(S);
        if (isNaN(q))
          return `${d.label} must be a valid number`;
        if (d.minLength && q < d.minLength)
          return `${d.label} must be at least ${d.minLength}`;
        if (d.maxLength && q > d.maxLength)
          return `${d.label} must not exceed ${d.maxLength}`;
      }
      return null;
    }, Jl = async () => {
      if (!(j.value || !Ct.value))
        try {
          j.value = !0, Ie.value = {};
          let d = !1;
          for (const S of Ct.value.fields || []) {
            const q = O.value[S.name], re = Ns(S, q);
            re && (Ie.value[S.name] = re, d = !0, console.log(`Validation error for field ${S.name}:`, re));
          }
          if (d) {
            j.value = !1, console.log("Validation failed, not submitting");
            return;
          }
          await te(O.value), pt.value = !1, Ct.value = null, O.value = {};
        } catch (d) {
          console.error("Failed to submit full screen form:", d);
        } finally {
          j.value = !1, console.log("Full screen form submission completed");
        }
    }, Ql = (d, S) => {
      if (console.log("handleViewDetails called with:", { product: d, shopDomain: S }), !d) {
        console.error("No product provided to handleViewDetails");
        return;
      }
      let q = null;
      if (d.handle && S)
        q = `https://${S}/products/${d.handle}`;
      else if (d.id && S)
        q = `https://${S}/products/${d.id}`;
      else if (S) {
        if (!d.handle && !d.id) {
          console.error("Product handle and ID are both missing! Product:", d), alert("Unable to open product: Product information incomplete.");
          return;
        }
      } else {
        console.error("Shop domain is missing! Product:", d), alert("Unable to open product: Shop domain not available. Please contact support.");
        return;
      }
      q && (console.log("Opening product URL:", q), window.open(q, "_blank"));
    }, ec = (d) => {
      if (!d) return "";
      let S = d.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "");
      const q = [];
      return S = S.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (re, Oe, ht) => {
        const Je = `__MARKDOWN_LINK_${q.length}__`;
        return console.log("Found markdown link:", re, "-> placeholder:", Je), q.push(re), Je;
      }), console.log("After replacing markdown links with placeholders:", S), console.log("Markdown links array:", q), S = S.replace(/https?:\/\/[^\s\)]+/g, "[link removed]"), console.log("After removing standalone URLs:", S), q.forEach((re, Oe) => {
        S = S.replace(`__MARKDOWN_LINK_${Oe}__`, re), console.log(`Restored markdown link ${Oe}:`, re);
      }), S = S.replace(/\n\s*\n\s*\n/g, `

`).trim(), S;
    }, tc = ge(!1), nc = ge(!1), sc = We(() => {
      var S;
      const d = !!((S = Ee.value) != null && S.human_agent_name);
      return K.value && d && w.value.length < la;
    }), rc = async () => {
      try {
        et.value = !1, tt.value = null, await $e();
      } catch (d) {
        console.error("Failed to proceed workflow:", d);
      }
    }, ic = async (d) => {
      try {
        if (!d.userInputValue || !d.userInputValue.trim())
          return;
        const S = d.userInputValue.trim();
        d.isSubmitted = !0, d.submittedValue = S, await he(S, Se.value);
      } catch (S) {
        console.error("Failed to submit user input:", S), d.isSubmitted = !1, d.submittedValue = null;
      }
    }, Rr = async () => {
      var d, S, q;
      try {
        let re = 0;
        const Oe = 50;
        for (; !((d = window.__INITIAL_DATA__) != null && d.widgetId) && re < Oe; )
          await new Promise((Je) => setTimeout(Je, 100)), re++;
        return (S = window.__INITIAL_DATA__) != null && S.widgetId ? (Xe(window.__INITIAL_DATA__.widgetId), await fn() ? ((q = window.__INITIAL_DATA__) != null && q.workflow && W.value && await X(), !0) : (ce.value = "connected", !1)) : (console.error("Widget data not available after waiting"), !1);
      } catch (re) {
        return console.error("Failed to initialize widget:", re), !1;
      }
    }, so = () => {
      Fe(async () => {
        await fn();
      }), window.addEventListener("message", (d) => {
        d.data.type === "SCROLL_TO_BOTTOM" && An(), d.data.type === "TOKEN_RECEIVED" && localStorage.setItem(Bn, d.data.token);
      }), ie((d) => {
        var S;
        if (ft.value = d.button_text || "Start Chat", d.type === "landing_page")
          tt.value = d.landing_page_data, et.value = !0, pt.value = !1;
        else if (d.type === "form" || d.type === "display_form")
          if (((S = d.form_data) == null ? void 0 : S.form_full_screen) === !0)
            Ct.value = d.form_data, pt.value = !0, et.value = !1;
          else {
            const q = {
              message: "",
              message_type: "form",
              attributes: {
                form_data: d.form_data
              },
              created_at: (/* @__PURE__ */ new Date()).toISOString(),
              isSubmitted: !1
            };
            p.value.findIndex(
              (Oe) => Oe.message_type === "form" && !Oe.isSubmitted
            ) === -1 && p.value.push(q), et.value = !1, pt.value = !1;
          }
        else
          et.value = !1, pt.value = !1;
      }), fe((d) => {
        console.log("Workflow proceeded:", d);
      });
    }, ro = async () => {
      try {
        await Rr(), await X();
      } catch (d) {
        throw console.error("Failed to start new conversation:", d), d;
      }
    }, oc = async () => {
      ct.value = !1, p.value = [], await ro();
    };
    Wa(async () => {
      await Rr(), so(), H(), document.addEventListener("click", E), (() => {
        const S = p.value.length > 0, q = ce.value === "connected", re = document.querySelector('input[type="text"], textarea') !== null;
        return S || q || re;
      })() && setTimeout(He, 100);
    }), Ni(() => {
      window.removeEventListener("message", (d) => {
        d.data.type === "SCROLL_TO_BOTTOM" && An();
      }), document.removeEventListener("click", E), ne && (ne.disconnect(), ne = null), H.timeoutId && (clearTimeout(H.timeoutId), H.timeoutId = null), it(), we();
    });
    const Ir = We(() => a.value.chat_style === "AURORA"), Jn = We(() => a.value.chat_style === "ASK_ANYTHING" || Ir.value), Lr = We(() => a.value.customization_metadata), ac = We(() => {
      var S;
      const d = (S = Lr.value) == null ? void 0 : S.avatar_style;
      return d === "orb" ? !0 : d === "photo" ? !1 : Ir.value && !a.value.photo_url;
    }), lc = We(() => {
      var d;
      return Yh(l.value || "", (d = Lr.value) == null ? void 0 : d.orb_variant);
    }), io = {
      GLASS: "theme-glass",
      TERMINAL: "theme-terminal",
      PLAYFUL: "theme-playful",
      CALM_MINT: "theme-calm"
    }, cc = We(() => io[a.value.chat_style] || ""), uc = We(() => a.value.show_citations === !0), oo = We(() => a.value.collect_email === !0 && !Jn.value), fc = We(() => {
      const d = {
        width: "100%",
        height: "580px",
        borderRadius: "var(--radius-lg)"
      };
      return window.innerWidth <= 768 && (d.width = "100vw", d.height = "100vh", d.borderRadius = "0", d.position = "fixed", d.top = "0", d.left = "0", d.bottom = "0", d.right = "0", d.maxWidth = "100vw", d.maxHeight = "100vh"), Jn.value ? window.innerWidth <= 768 ? {
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
    }), hc = We(() => Jn.value && p.value.length === 0), ao = { renderer: n, linkRenderer: s, renderMarkdown: r, props: o, widgetId: i, customization: a, agentName: l, applyCustomization: c, initializeFromData: u, formatCurrency: y, messages: p, loading: L, errorMessage: B, showError: V, loadingHistory: Te, hasStartedChat: se, connectionStatus: ce, socketSendMessage: he, sendFileAttachments: U, loadChatHistory: z, connect: $, reconnect: Y, cleanup: we, humanAgent: Ee, onTakeover: Fe, socketSubmitRating: b, submitForm: te, currentForm: Ce, getWorkflowState: X, proceedWorkflow: $e, onWorkflowState: ie, onWorkflowProceeded: fe, currentSessionId: oe, setToken: st, setWidgetId: Xe, newMessage: de, isExpanded: Ze, emailInput: Se, hasConversationToken: W, handleInputSync: _e, get domObserver() {
      return ne;
    }, set domObserver(d) {
      ne = d;
    }, setupDOMObserver: H, get currentInputFields() {
      return Pe;
    }, set currentInputFields(d) {
      Pe = d;
    }, setupNativeEventListeners: He, cleanupNativeEventListeners: it, isFormField: yt, handleNativeInput: h, handleNativeKeyPress: g, handleNativeKeyDown: k, closeHeaderMenu: E, isInitializing: A, TOKEN_KEY: Bn, sanitizeToken: T, token: D, hasToken: M, authError: F, showAuthError: C, isApiKeyAuthRequired: Z, initialData: N, allowAttachments: K, messagesContainer: Q, chatStyles: le, chatIconStyles: Re, agentBubbleStyles: be, userBubbleStyles: rt, messageNameStyles: ze, headerBorderStyles: ut, photoUrl: f, shadowStyle: m, fileInputRef: x, uploadedAttachments: w, previewModal: P, previewFile: G, formatFileSize: ee, isImageAttachment: ye, getDownloadUrl: ke, getPreviewUrl: Ke, handleFileSelect: De, handleDrop: lt, handleDragOver: bt, handleDragLeave: qe, handlePaste: Wt, uploadFiles: Tr, removeAttachment: Cs, openPreview: Yn, closePreview: Rs, openFilePicker: Is, isImage: Er, hasActiveForm: Ot, isMessageInputEnabled: un, placeholderText: Ls, sendMessage: Sn, handleKeyPress: $n, checkAuthorization: fn, fetchChatHistory: Ft, scrollToBottom: An, handleReconnect: Os, showRatingDialog: Fs, currentRating: Ps, ratingFeedback: Cr, hoverRating: J, isSubmittingRating: _, formData: O, isSubmittingForm: j, formErrors: Ie, showLandingPage: et, landingPageData: tt, workflowButtonText: ft, showFullScreenForm: pt, fullScreenFormData: Ct, ratingEnabled: Xn, shouldShowNewConversationOption: ct, humanAgentPhotoUrl: Ds, handleEndChat: Zn, handleStarHover: jl, handleStarLeave: Vl, handleStarClick: Kl, handleSubmitRating: Gl, handleAddToCart: Yl, handleAddToCartFromCarousel: $l, validateForm: to, handleFormSubmit: Xl, handleFieldChange: Zl, isValidPhoneNumber: no, validateFormField: Ns, submitFullScreenForm: Jl, handleViewDetails: Ql, removeUrls: ec, isUploading: tc, dragOver: nc, maxFiles: la, acceptTypes: Qd, canUploadMore: sc, handleLandingPageProceed: rc, handleUserInputSubmit: ic, initializeWidget: Rr, setupEventListeners: so, startNewConversationWorkflow: ro, handleStartNewConversation: oc, isAuroraStyle: Ir, isAskAnythingStyle: Jn, orbMeta: Lr, useOrbAvatar: ac, orbStyle: lc, THEME_CLASS_MAP: io, themeClass: cc, showCitations: uc, shouldCollectEmail: oo, containerStyles: fc, shouldShowWelcomeMessage: hc, get isValidEmail() {
      return zs;
    } };
    return Object.defineProperty(ao, "__isScriptSetup", { enumerable: !1, value: !0 }), ao;
  }
}), tp = (t, e) => {
  const n = t.__vccOpts || t;
  for (const [s, r] of e)
    n[s] = r;
  return n;
}, np = {
  key: 0,
  class: "widget-unavailable-overlay"
}, sp = {
  key: 1,
  class: "auth-error-overlay"
}, rp = { class: "auth-error-card" }, ip = { class: "auth-error-message" }, op = {
  key: 0,
  class: "initializing-overlay"
}, ap = {
  key: 0,
  class: "connecting-message"
}, lp = {
  key: 1,
  class: "failed-message"
}, cp = { class: "welcome-content" }, up = { class: "welcome-header" }, fp = ["src", "alt"], hp = { class: "welcome-title" }, dp = { class: "welcome-subtitle" }, pp = { class: "welcome-input-container" }, gp = {
  key: 0,
  class: "email-input"
}, mp = ["disabled"], _p = { class: "welcome-message-input" }, yp = ["placeholder", "disabled"], bp = ["disabled"], vp = {
  key: 0,
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, wp = {
  key: 1,
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, kp = { class: "landing-page-content" }, xp = { class: "landing-page-header" }, Sp = { class: "landing-page-heading" }, Ap = { class: "landing-page-text" }, Tp = { class: "landing-page-actions" }, Ep = { class: "form-fullscreen-content" }, Cp = {
  key: 0,
  class: "form-header"
}, Rp = {
  key: 0,
  class: "form-title"
}, Ip = {
  key: 1,
  class: "form-description"
}, Lp = { class: "form-fields" }, Op = ["for"], Fp = {
  key: 0,
  class: "required-indicator"
}, Pp = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "autocomplete", "inputmode"], Dp = ["id", "placeholder", "required", "min", "max", "value", "onInput"], Np = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput"], Mp = ["id", "required", "value", "onChange"], Bp = { value: "" }, Up = ["value"], zp = {
  key: 4,
  class: "checkbox-field"
}, Hp = ["id", "required", "checked", "onChange"], Wp = { class: "checkbox-label" }, qp = {
  key: 5,
  class: "radio-group"
}, jp = ["name", "value", "required", "checked", "onChange"], Vp = { class: "radio-label" }, Kp = {
  key: 6,
  class: "field-error"
}, Gp = { class: "form-actions" }, Yp = ["disabled"], $p = {
  key: 0,
  class: "loading-spinner-inline"
}, Xp = { key: 1 }, Zp = { class: "header-content" }, Jp = ["src", "alt"], Qp = { class: "header-info" }, eg = { class: "status" }, tg = { class: "ask-anything-header" }, ng = ["src", "alt"], sg = { class: "header-info" }, rg = {
  key: 2,
  class: "loading-history"
}, ig = {
  class: "chat-messages",
  ref: "messagesContainer"
}, og = {
  key: 0,
  class: "rating-content"
}, ag = { class: "rating-prompt" }, lg = ["onMouseover", "onMouseleave", "onClick", "disabled"], cg = {
  key: 0,
  class: "feedback-wrapper"
}, ug = { class: "feedback-section" }, fg = ["onUpdate:modelValue", "disabled"], hg = { class: "feedback-counter" }, dg = ["onClick", "disabled"], pg = {
  key: 1,
  class: "submitted-feedback-wrapper"
}, gg = { class: "submitted-feedback" }, mg = { class: "submitted-feedback-text" }, _g = {
  key: 2,
  class: "submitted-message"
}, yg = {
  key: 1,
  class: "form-content"
}, bg = {
  key: 0,
  class: "form-header"
}, vg = {
  key: 0,
  class: "form-title"
}, wg = {
  key: 1,
  class: "form-description"
}, kg = { class: "form-fields" }, xg = ["for"], Sg = {
  key: 0,
  class: "required-indicator"
}, Ag = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "disabled", "autocomplete", "inputmode"], Tg = ["id", "placeholder", "required", "min", "max", "value", "onInput", "disabled"], Eg = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "disabled"], Cg = ["id", "required", "value", "onChange", "disabled"], Rg = { value: "" }, Ig = ["value"], Lg = {
  key: 4,
  class: "checkbox-field"
}, Og = ["id", "checked", "onChange", "disabled"], Fg = ["for"], Pg = {
  key: 5,
  class: "radio-field"
}, Dg = ["id", "name", "value", "checked", "onChange", "disabled"], Ng = ["for"], Mg = {
  key: 6,
  class: "field-error"
}, Bg = { class: "form-actions" }, Ug = ["onClick", "disabled"], zg = {
  key: 2,
  class: "user-input-content"
}, Hg = {
  key: 0,
  class: "user-input-prompt"
}, Wg = {
  key: 1,
  class: "user-input-form"
}, qg = ["onUpdate:modelValue", "onKeydown"], jg = ["onClick", "disabled"], Vg = {
  key: 2,
  class: "user-input-submitted"
}, Kg = {
  key: 0,
  class: "user-input-confirmation"
}, Gg = {
  key: 3,
  class: "product-message-container"
}, Yg = ["innerHTML"], $g = {
  key: 1,
  class: "products-carousel"
}, Xg = { class: "carousel-items" }, Zg = {
  key: 0,
  class: "product-image-compact"
}, Jg = ["src", "alt"], Qg = { class: "product-info-compact" }, em = { class: "product-text-area" }, tm = { class: "product-title-compact" }, nm = {
  key: 0,
  class: "product-variant-compact"
}, sm = { class: "product-price-compact" }, rm = { class: "product-actions-compact" }, im = ["onClick"], om = {
  key: 2,
  class: "no-products-message"
}, am = {
  key: 3,
  class: "no-products-message"
}, lm = ["innerHTML"], cm = {
  key: 0,
  class: "message-attachments"
}, um = {
  key: 0,
  class: "attachment-image-container"
}, fm = ["src", "alt", "onClick"], hm = { class: "attachment-image-info" }, dm = ["href"], pm = { class: "attachment-size" }, gm = ["href"], mm = { class: "attachment-size" }, _m = {
  key: 0,
  class: "citation-chips"
}, ym = ["title"], bm = { class: "message-info" }, vm = {
  key: 0,
  class: "agent-name"
}, wm = {
  key: 0,
  class: "typing-indicator reading-indicator"
}, km = {
  key: 0,
  class: "email-input"
}, xm = ["disabled"], Sm = {
  key: 1,
  class: "file-previews-widget"
}, Am = {
  class: "file-preview-content-widget",
  style: { cursor: "pointer" }
}, Tm = ["src", "alt", "onClick"], Em = ["onClick"], Cm = { class: "file-preview-info-widget" }, Rm = { class: "file-preview-name-widget" }, Im = { class: "file-preview-size-widget" }, Lm = ["onClick"], Om = {
  key: 2,
  class: "upload-progress-widget"
}, Fm = { class: "message-input" }, Pm = ["placeholder", "disabled"], Dm = ["disabled", "title"], Nm = ["disabled"], Mm = { class: "conversation-ended-message" }, Bm = {
  key: 7,
  class: "rating-dialog"
}, Um = { class: "rating-content" }, zm = { class: "star-rating" }, Hm = ["onClick"], Wm = { class: "rating-actions" }, qm = ["disabled"], jm = {
  key: 0,
  class: "preview-modal-image-container"
}, Vm = ["src", "alt"], Km = { class: "preview-modal-filename" }, Gm = {
  key: 3,
  class: "widget-loading"
};
function Ym(t, e, n, s, r, o) {
  return s.showAuthError && s.isApiKeyAuthRequired ? (R(), I("div", np, e[18] || (e[18] = [
    Rn('<div class="widget-unavailable-card" data-v-a3601fa3><div class="widget-unavailable-icon-wrapper" data-v-a3601fa3><svg class="widget-unavailable-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-v-a3601fa3><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" data-v-a3601fa3></path><path d="M9 12l2 2 4-4" data-v-a3601fa3></path></svg></div><h2 class="widget-unavailable-title" data-v-a3601fa3>Chat Unavailable</h2><p class="widget-unavailable-message" data-v-a3601fa3> This chat widget is not currently configured. Please contact the website administrator to enable chat support. </p><div class="widget-unavailable-footer" data-v-a3601fa3><svg class="chattermate-logo-small" width="14" height="14" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-a3601fa3><rect x="3" y="3" width="54" height="54" rx="16" fill="#C9F24E" data-v-a3601fa3></rect><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-a3601fa3></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-a3601fa3></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-a3601fa3></circle></svg><span data-v-a3601fa3>Powered by ChatterMate</span></div></div>', 1)
  ]))) : s.showAuthError ? (R(), I("div", sp, [
    v("div", rp, [
      e[19] || (e[19] = Rn('<div class="auth-error-header" data-v-a3601fa3><svg class="auth-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-a3601fa3><circle cx="12" cy="12" r="10" data-v-a3601fa3></circle><line x1="12" y1="8" x2="12" y2="12" data-v-a3601fa3></line><line x1="12" y1="16" x2="12.01" y2="16" data-v-a3601fa3></line></svg><h2 data-v-a3601fa3>Authentication Error</h2></div>', 1)),
      v("p", ip, ae(s.authError), 1),
      v("button", {
        class: "auth-error-refresh-btn",
        onClick: e[0] || (e[0] = () => t.window.location.reload())
      }, " Refresh Page ")
    ])
  ])) : s.widgetId && !s.showAuthError ? (R(), I("div", {
    key: 2,
    class: Ge(["chat-container", [{ collapsed: !s.isExpanded, "ask-anything-style": s.isAskAnythingStyle, aurora: s.isAuroraStyle }, s.themeClass]]),
    style: Ne({ ...s.shadowStyle, ...s.containerStyles, "--cm-accent": s.customization.accent_color || "#C9F24E" })
  }, [
    s.isInitializing ? (R(), I("div", op, e[20] || (e[20] = [
      Rn('<div class="loading-spinner" data-v-a3601fa3><div class="dot" data-v-a3601fa3></div><div class="dot" data-v-a3601fa3></div><div class="dot" data-v-a3601fa3></div></div><div class="loading-text" data-v-a3601fa3>Initializing chat...</div>', 2)
    ]))) : pe("", !0),
    !s.isInitializing && s.connectionStatus !== "connected" ? (R(), I("div", {
      key: 1,
      class: Ge(["connection-status", s.connectionStatus])
    }, [
      s.connectionStatus === "connecting" ? (R(), I("div", ap, e[21] || (e[21] = [
        Qt(" Connecting to chat service... ", -1),
        v("div", { class: "loading-dots" }, [
          v("div", { class: "dot" }),
          v("div", { class: "dot" }),
          v("div", { class: "dot" })
        ], -1)
      ]))) : s.connectionStatus === "failed" ? (R(), I("div", lp, [
        e[22] || (e[22] = Qt(" Connection failed. ", -1)),
        v("button", {
          onClick: s.handleReconnect,
          class: "reconnect-button"
        }, " Click here to reconnect ")
      ])) : pe("", !0)
    ], 2)) : pe("", !0),
    s.showError ? (R(), I("div", {
      key: 2,
      class: "error-alert",
      style: Ne(s.chatIconStyles)
    }, ae(s.errorMessage), 5)) : pe("", !0),
    s.shouldShowWelcomeMessage ? (R(), I("div", {
      key: 3,
      class: Ge(["welcome-message-section", { aurora: s.isAuroraStyle }]),
      style: Ne(s.chatStyles)
    }, [
      v("div", cp, [
        v("div", up, [
          s.useOrbAvatar ? (R(), I("div", {
            key: 0,
            class: "welcome-orb",
            style: Ne(s.orbStyle)
          }, null, 4)) : s.photoUrl ? (R(), I("img", {
            key: 1,
            src: s.photoUrl,
            alt: s.agentName,
            class: "welcome-avatar"
          }, null, 8, fp)) : pe("", !0),
          v("h1", hp, ae(s.customization.welcome_title || `Welcome to ${s.agentName}`), 1),
          v("p", dp, ae(s.customization.welcome_subtitle || "I'm here to help you with anything you need. What can I assist you with today?"), 1)
        ])
      ]),
      v("div", pp, [
        !s.hasStartedChat && !s.hasConversationToken && s.shouldCollectEmail ? (R(), I("div", gp, [
          Tn(v("input", {
            "onUpdate:modelValue": e[1] || (e[1] = (i) => s.emailInput = i),
            type: "email",
            placeholder: "Enter your email address",
            disabled: s.loading || s.connectionStatus !== "connected",
            class: Ge([{
              invalid: s.emailInput.trim() && !s.isValidEmail(s.emailInput.trim()),
              disabled: s.connectionStatus !== "connected"
            }, "welcome-email-input"])
          }, null, 10, mp), [
            [In, s.emailInput]
          ])
        ])) : pe("", !0),
        v("div", _p, [
          Tn(v("input", {
            "onUpdate:modelValue": e[2] || (e[2] = (i) => s.newMessage = i),
            type: "text",
            placeholder: s.placeholderText,
            onKeypress: s.handleKeyPress,
            onInput: s.handleInputSync,
            onChange: s.handleInputSync,
            disabled: !s.isMessageInputEnabled,
            class: Ge([{ disabled: !s.isMessageInputEnabled }, "welcome-message-field"])
          }, null, 42, yp), [
            [In, s.newMessage]
          ]),
          v("button", {
            class: Ge(["welcome-send-button", { "aurora-send": s.isAuroraStyle }]),
            style: Ne(s.userBubbleStyles),
            onClick: s.sendMessage,
            disabled: !s.newMessage.trim() || !s.isMessageInputEnabled
          }, [
            s.isAuroraStyle ? (R(), I("svg", vp, e[23] || (e[23] = [
              v("path", {
                d: "M12 19V5M12 5L5 12M12 5L19 12",
                stroke: "currentColor",
                "stroke-width": "2",
                "stroke-linecap": "round",
                "stroke-linejoin": "round"
              }, null, -1)
            ]))) : (R(), I("svg", wp, e[24] || (e[24] = [
              v("path", {
                d: "M5 12L3 21L21 12L3 3L5 12ZM5 12L13 12",
                stroke: "currentColor",
                "stroke-width": "2",
                "stroke-linecap": "round",
                "stroke-linejoin": "round"
              }, null, -1)
            ])))
          ], 14, bp)
        ])
      ]),
      v("div", {
        class: "powered-by-welcome",
        style: Ne(s.messageNameStyles)
      }, e[25] || (e[25] = [
        Rn('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-a3601fa3><rect x="3" y="3" width="54" height="54" rx="16" fill="#C9F24E" data-v-a3601fa3></rect><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-a3601fa3></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-a3601fa3></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-a3601fa3></circle></svg> Powered by ChatterMate ', 2)
      ]), 4)
    ], 6)) : pe("", !0),
    s.showLandingPage && s.landingPageData ? (R(), I("div", {
      key: 4,
      class: "landing-page-fullscreen",
      style: Ne(s.chatStyles)
    }, [
      v("div", kp, [
        v("div", xp, [
          v("h2", Sp, ae(s.landingPageData.heading), 1),
          v("div", Ap, ae(s.landingPageData.content), 1)
        ]),
        v("div", Tp, [
          v("button", {
            class: "landing-page-button",
            onClick: s.handleLandingPageProceed
          }, ae(s.workflowButtonText), 1)
        ])
      ]),
      v("div", {
        class: "powered-by-landing",
        style: Ne(s.messageNameStyles)
      }, e[26] || (e[26] = [
        Rn('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-a3601fa3><rect x="3" y="3" width="54" height="54" rx="16" fill="#C9F24E" data-v-a3601fa3></rect><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-a3601fa3></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-a3601fa3></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-a3601fa3></circle></svg> Powered by ChatterMate ', 2)
      ]), 4)
    ], 4)) : s.showFullScreenForm && s.fullScreenFormData ? (R(), I("div", {
      key: 5,
      class: "form-fullscreen",
      style: Ne(s.chatStyles)
    }, [
      v("div", Ep, [
        s.fullScreenFormData.title || s.fullScreenFormData.description ? (R(), I("div", Cp, [
          s.fullScreenFormData.title ? (R(), I("h2", Rp, ae(s.fullScreenFormData.title), 1)) : pe("", !0),
          s.fullScreenFormData.description ? (R(), I("p", Ip, ae(s.fullScreenFormData.description), 1)) : pe("", !0)
        ])) : pe("", !0),
        v("div", Lp, [
          (R(!0), I(Qe, null, Rt(s.fullScreenFormData.fields, (i) => {
            var a, l;
            return R(), I("div", {
              key: i.name,
              class: "form-field"
            }, [
              v("label", {
                for: `fullscreen-form-${i.name}`,
                class: "field-label"
              }, [
                Qt(ae(i.label) + " ", 1),
                i.required ? (R(), I("span", Fp, "*")) : pe("", !0)
              ], 8, Op),
              i.type === "text" || i.type === "email" || i.type === "tel" ? (R(), I("input", {
                key: 0,
                id: `fullscreen-form-${i.name}`,
                type: i.type,
                placeholder: i.placeholder || "",
                required: i.required,
                minlength: i.minLength,
                maxlength: i.maxLength,
                value: s.formData[i.name] || "",
                onInput: (c) => s.handleFieldChange(i.name, c.target.value),
                onBlur: (c) => s.handleFieldChange(i.name, c.target.value),
                class: Ge(["form-input", { error: s.formErrors[i.name] }]),
                autocomplete: i.type === "email" ? "email" : i.type === "tel" ? "tel" : "off",
                inputmode: i.type === "tel" ? "tel" : i.type === "email" ? "email" : "text"
              }, null, 42, Pp)) : i.type === "number" ? (R(), I("input", {
                key: 1,
                id: `fullscreen-form-${i.name}`,
                type: "number",
                placeholder: i.placeholder || "",
                required: i.required,
                min: i.minLength,
                max: i.maxLength,
                value: s.formData[i.name] || "",
                onInput: (c) => s.handleFieldChange(i.name, c.target.value),
                class: Ge(["form-input", { error: s.formErrors[i.name] }])
              }, null, 42, Dp)) : i.type === "textarea" ? (R(), I("textarea", {
                key: 2,
                id: `fullscreen-form-${i.name}`,
                placeholder: i.placeholder || "",
                required: i.required,
                minlength: i.minLength,
                maxlength: i.maxLength,
                value: s.formData[i.name] || "",
                onInput: (c) => s.handleFieldChange(i.name, c.target.value),
                class: Ge(["form-textarea", { error: s.formErrors[i.name] }]),
                rows: "4"
              }, null, 42, Np)) : i.type === "select" ? (R(), I("select", {
                key: 3,
                id: `fullscreen-form-${i.name}`,
                required: i.required,
                value: s.formData[i.name] || "",
                onChange: (c) => s.handleFieldChange(i.name, c.target.value),
                class: Ge(["form-select", { error: s.formErrors[i.name] }])
              }, [
                v("option", Bp, ae(i.placeholder || "Please select..."), 1),
                (R(!0), I(Qe, null, Rt((Array.isArray(i.options) ? i.options : ((a = i.options) == null ? void 0 : a.split(`
`)) || []).filter((c) => c.trim()), (c) => (R(), I("option", {
                  key: c,
                  value: c.trim()
                }, ae(c.trim()), 9, Up))), 128))
              ], 42, Mp)) : i.type === "checkbox" ? (R(), I("label", zp, [
                v("input", {
                  id: `fullscreen-form-${i.name}`,
                  type: "checkbox",
                  required: i.required,
                  checked: s.formData[i.name] || !1,
                  onChange: (c) => s.handleFieldChange(i.name, c.target.checked),
                  class: "form-checkbox"
                }, null, 40, Hp),
                v("span", Wp, ae(i.label), 1)
              ])) : i.type === "radio" ? (R(), I("div", qp, [
                (R(!0), I(Qe, null, Rt((Array.isArray(i.options) ? i.options : ((l = i.options) == null ? void 0 : l.split(`
`)) || []).filter((c) => c.trim()), (c) => (R(), I("label", {
                  key: c,
                  class: "radio-field"
                }, [
                  v("input", {
                    type: "radio",
                    name: `fullscreen-form-${i.name}`,
                    value: c.trim(),
                    required: i.required,
                    checked: s.formData[i.name] === c.trim(),
                    onChange: (u) => s.handleFieldChange(i.name, c.trim()),
                    class: "form-radio"
                  }, null, 40, jp),
                  v("span", Vp, ae(c.trim()), 1)
                ]))), 128))
              ])) : pe("", !0),
              s.formErrors[i.name] ? (R(), I("div", Kp, ae(s.formErrors[i.name]), 1)) : pe("", !0)
            ]);
          }), 128))
        ]),
        v("div", Gp, [
          v("button", {
            onClick: e[3] || (e[3] = () => {
              console.log("Submit button clicked!"), s.submitFullScreenForm();
            }),
            disabled: s.isSubmittingForm,
            class: "submit-form-button",
            style: Ne(s.userBubbleStyles)
          }, [
            s.isSubmittingForm ? (R(), I("span", $p, e[27] || (e[27] = [
              v("div", { class: "dot" }, null, -1),
              v("div", { class: "dot" }, null, -1),
              v("div", { class: "dot" }, null, -1)
            ]))) : (R(), I("span", Xp, ae(s.fullScreenFormData.submit_button_text || "Submit"), 1))
          ], 12, Yp)
        ])
      ]),
      v("div", {
        class: "powered-by-landing",
        style: Ne(s.messageNameStyles)
      }, e[28] || (e[28] = [
        Rn('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-a3601fa3><rect x="3" y="3" width="54" height="54" rx="16" fill="#C9F24E" data-v-a3601fa3></rect><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-a3601fa3></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-a3601fa3></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-a3601fa3></circle></svg> Powered by ChatterMate ', 2)
      ]), 4)
    ], 4)) : s.shouldShowWelcomeMessage ? pe("", !0) : (R(), I(Qe, { key: 6 }, [
      s.isExpanded ? (R(), I("div", {
        key: 0,
        class: Ge(["chat-panel", { "ask-anything-chat": s.isAskAnythingStyle }]),
        style: Ne(s.chatStyles)
      }, [
        s.isAskAnythingStyle ? (R(), I("div", {
          key: 1,
          class: "ask-anything-top",
          style: Ne(s.headerBorderStyles)
        }, [
          v("div", tg, [
            s.humanAgentPhotoUrl || s.photoUrl ? (R(), I("img", {
              key: 0,
              src: s.humanAgentPhotoUrl || s.photoUrl,
              alt: s.humanAgent.human_agent_name || s.agentName,
              class: "header-avatar"
            }, null, 8, ng)) : pe("", !0),
            v("div", sg, [
              v("h3", {
                style: Ne(s.messageNameStyles)
              }, ae(s.agentName), 5),
              v("p", {
                class: "ask-anything-subtitle",
                style: Ne(s.messageNameStyles)
              }, ae(s.customization.welcome_subtitle || "Ask me anything. I'm here to help."), 5)
            ])
          ])
        ], 4)) : (R(), I("div", {
          key: 0,
          class: "chat-header",
          style: Ne(s.headerBorderStyles)
        }, [
          v("div", Zp, [
            s.humanAgentPhotoUrl || s.photoUrl ? (R(), I("img", {
              key: 0,
              src: s.humanAgentPhotoUrl || s.photoUrl,
              alt: s.humanAgent.human_agent_name || s.agentName,
              class: "header-avatar"
            }, null, 8, Jp)) : pe("", !0),
            v("div", Qp, [
              v("h3", {
                style: Ne(s.messageNameStyles)
              }, ae(s.humanAgent.human_agent_name || s.agentName), 5),
              v("div", eg, [
                e[29] || (e[29] = v("span", { class: "status-indicator online" }, null, -1)),
                v("span", {
                  class: "status-text",
                  style: Ne(s.messageNameStyles)
                }, "Online", 4)
              ])
            ])
          ])
        ], 4)),
        s.loadingHistory ? (R(), I("div", rg, e[30] || (e[30] = [
          v("div", { class: "loading-spinner" }, [
            v("div", { class: "dot" }),
            v("div", { class: "dot" }),
            v("div", { class: "dot" })
          ], -1)
        ]))) : pe("", !0),
        v("div", ig, [
          (R(!0), I(Qe, null, Rt(s.messages, (i, a) => {
            var l, c, u, y, p, L, B, V, Te, se, ce, he, U, z, $, Y, we, Ee, Fe;
            return R(), I("div", {
              key: a,
              class: Ge([
                "message",
                i.message_type === "bot" || i.message_type === "agent" ? "agent-message" : i.message_type === "system" ? "system-message" : i.message_type === "rating" ? "rating-message" : i.message_type === "form" ? "form-message" : i.message_type === "product" || i.shopify_output ? "product-message" : "user-message"
              ])
            }, [
              v("div", {
                class: "message-bubble",
                style: Ne(i.message_type === "system" || i.message_type === "rating" || i.message_type === "product" || i.shopify_output ? {} : i.message_type === "user" ? s.userBubbleStyles : s.agentBubbleStyles)
              }, [
                i.message_type === "rating" ? (R(), I("div", og, [
                  v("p", ag, "Rate the chat session that you had with " + ae(i.agent_name || s.humanAgent.human_agent_name || s.agentName || "our agent"), 1),
                  v("div", {
                    class: Ge(["star-rating", { submitted: s.isSubmittingRating || i.isSubmitted }])
                  }, [
                    (R(), I(Qe, null, Rt(5, (b) => v("button", {
                      key: b,
                      class: Ge(["star-button", {
                        warning: b <= (i.isSubmitted ? i.finalRating : s.hoverRating || i.selectedRating) && (i.isSubmitted ? i.finalRating : s.hoverRating || i.selectedRating) <= 3,
                        success: b <= (i.isSubmitted ? i.finalRating : s.hoverRating || i.selectedRating) && (i.isSubmitted ? i.finalRating : s.hoverRating || i.selectedRating) > 3,
                        selected: b <= (i.isSubmitted ? i.finalRating : s.hoverRating || i.selectedRating)
                      }]),
                      onMouseover: (te) => !i.isSubmitted && s.handleStarHover(b),
                      onMouseleave: (te) => !i.isSubmitted && s.handleStarLeave,
                      onClick: (te) => !i.isSubmitted && s.handleStarClick(b),
                      disabled: s.isSubmittingRating || i.isSubmitted
                    }, " ★ ", 42, lg)), 64))
                  ], 2),
                  i.showFeedback && !i.isSubmitted ? (R(), I("div", cg, [
                    v("div", ug, [
                      Tn(v("input", {
                        "onUpdate:modelValue": (b) => i.feedback = b,
                        placeholder: "Please share your feedback (optional)",
                        disabled: s.isSubmittingRating,
                        maxlength: "500",
                        class: "feedback-input"
                      }, null, 8, fg), [
                        [In, i.feedback]
                      ]),
                      v("div", hg, ae(((l = i.feedback) == null ? void 0 : l.length) || 0) + "/500", 1)
                    ]),
                    v("button", {
                      onClick: (b) => s.handleSubmitRating(i.session_id, s.hoverRating, i.feedback),
                      disabled: s.isSubmittingRating || !s.hoverRating,
                      class: "submit-rating-button",
                      style: Ne({ backgroundColor: s.customization.accent_color || "var(--accent-solid)" })
                    }, ae(s.isSubmittingRating ? "Submitting..." : "Submit Rating"), 13, dg)
                  ])) : pe("", !0),
                  i.isSubmitted && i.finalFeedback ? (R(), I("div", pg, [
                    v("div", gg, [
                      v("p", mg, ae(i.finalFeedback), 1)
                    ])
                  ])) : i.isSubmitted ? (R(), I("div", _g, " Thank you for your rating! ")) : pe("", !0)
                ])) : i.message_type === "form" ? (R(), I("div", yg, [
                  (u = (c = i.attributes) == null ? void 0 : c.form_data) != null && u.title || (p = (y = i.attributes) == null ? void 0 : y.form_data) != null && p.description ? (R(), I("div", bg, [
                    (B = (L = i.attributes) == null ? void 0 : L.form_data) != null && B.title ? (R(), I("h3", vg, ae(i.attributes.form_data.title), 1)) : pe("", !0),
                    (Te = (V = i.attributes) == null ? void 0 : V.form_data) != null && Te.description ? (R(), I("p", wg, ae(i.attributes.form_data.description), 1)) : pe("", !0)
                  ])) : pe("", !0),
                  v("div", kg, [
                    (R(!0), I(Qe, null, Rt((ce = (se = i.attributes) == null ? void 0 : se.form_data) == null ? void 0 : ce.fields, (b) => {
                      var te, Ce;
                      return R(), I("div", {
                        key: b.name,
                        class: "form-field"
                      }, [
                        v("label", {
                          for: `form-${b.name}`,
                          class: "field-label"
                        }, [
                          Qt(ae(b.label) + " ", 1),
                          b.required ? (R(), I("span", Sg, "*")) : pe("", !0)
                        ], 8, xg),
                        b.type === "text" || b.type === "email" || b.type === "tel" ? (R(), I("input", {
                          key: 0,
                          id: `form-${b.name}`,
                          type: b.type,
                          placeholder: b.placeholder || "",
                          required: b.required,
                          minlength: b.minLength,
                          maxlength: b.maxLength,
                          value: s.formData[b.name] || "",
                          onInput: (X) => s.handleFieldChange(b.name, X.target.value),
                          onBlur: (X) => s.handleFieldChange(b.name, X.target.value),
                          class: Ge(["form-input", { error: s.formErrors[b.name] }]),
                          disabled: s.isSubmittingForm,
                          autocomplete: b.type === "email" ? "email" : b.type === "tel" ? "tel" : "off",
                          inputmode: b.type === "tel" ? "tel" : b.type === "email" ? "email" : "text"
                        }, null, 42, Ag)) : b.type === "number" ? (R(), I("input", {
                          key: 1,
                          id: `form-${b.name}`,
                          type: "number",
                          placeholder: b.placeholder || "",
                          required: b.required,
                          min: b.min,
                          max: b.max,
                          value: s.formData[b.name] || "",
                          onInput: (X) => s.handleFieldChange(b.name, X.target.value),
                          class: Ge(["form-input", { error: s.formErrors[b.name] }]),
                          disabled: s.isSubmittingForm
                        }, null, 42, Tg)) : b.type === "textarea" ? (R(), I("textarea", {
                          key: 2,
                          id: `form-${b.name}`,
                          placeholder: b.placeholder || "",
                          required: b.required,
                          minlength: b.minLength,
                          maxlength: b.maxLength,
                          value: s.formData[b.name] || "",
                          onInput: (X) => s.handleFieldChange(b.name, X.target.value),
                          class: Ge(["form-textarea", { error: s.formErrors[b.name] }]),
                          disabled: s.isSubmittingForm,
                          rows: "3"
                        }, null, 42, Eg)) : b.type === "select" ? (R(), I("select", {
                          key: 3,
                          id: `form-${b.name}`,
                          required: b.required,
                          value: s.formData[b.name] || "",
                          onChange: (X) => s.handleFieldChange(b.name, X.target.value),
                          class: Ge(["form-select", { error: s.formErrors[b.name] }]),
                          disabled: s.isSubmittingForm
                        }, [
                          v("option", Rg, ae(b.placeholder || "Select an option"), 1),
                          (R(!0), I(Qe, null, Rt((Array.isArray(b.options) ? b.options : ((te = b.options) == null ? void 0 : te.split(`
`)) || []).filter((X) => X.trim()), (X) => (R(), I("option", {
                            key: X.trim(),
                            value: X.trim()
                          }, ae(X.trim()), 9, Ig))), 128))
                        ], 42, Cg)) : b.type === "checkbox" ? (R(), I("div", Lg, [
                          v("input", {
                            id: `form-${b.name}`,
                            type: "checkbox",
                            checked: s.formData[b.name] || !1,
                            onChange: (X) => s.handleFieldChange(b.name, X.target.checked),
                            class: "form-checkbox",
                            disabled: s.isSubmittingForm
                          }, null, 40, Og),
                          v("label", {
                            for: `form-${b.name}`,
                            class: "checkbox-label"
                          }, ae(b.placeholder || b.label), 9, Fg)
                        ])) : b.type === "radio" ? (R(), I("div", Pg, [
                          (R(!0), I(Qe, null, Rt((Array.isArray(b.options) ? b.options : ((Ce = b.options) == null ? void 0 : Ce.split(`
`)) || []).filter((X) => X.trim()), (X) => (R(), I("div", {
                            key: X.trim(),
                            class: "radio-option"
                          }, [
                            v("input", {
                              id: `form-${b.name}-${X.trim()}`,
                              name: `form-${b.name}`,
                              type: "radio",
                              value: X.trim(),
                              checked: s.formData[b.name] === X.trim(),
                              onChange: ($e) => s.handleFieldChange(b.name, X.trim()),
                              class: "form-radio",
                              disabled: s.isSubmittingForm
                            }, null, 40, Dg),
                            v("label", {
                              for: `form-${b.name}-${X.trim()}`,
                              class: "radio-label"
                            }, ae(X.trim()), 9, Ng)
                          ]))), 128))
                        ])) : pe("", !0),
                        s.formErrors[b.name] ? (R(), I("div", Mg, ae(s.formErrors[b.name]), 1)) : pe("", !0)
                      ]);
                    }), 128))
                  ]),
                  v("div", Bg, [
                    v("button", {
                      onClick: () => {
                        var b;
                        console.log("Regular form submit button clicked!"), s.handleFormSubmit((b = i.attributes) == null ? void 0 : b.form_data);
                      },
                      disabled: s.isSubmittingForm,
                      class: "form-submit-button",
                      style: Ne(s.userBubbleStyles)
                    }, ae(s.isSubmittingForm ? "Submitting..." : ((U = (he = i.attributes) == null ? void 0 : he.form_data) == null ? void 0 : U.submit_button_text) || "Submit"), 13, Ug)
                  ])
                ])) : i.message_type === "user_input" ? (R(), I("div", zg, [
                  (z = i.attributes) != null && z.prompt_message && i.attributes.prompt_message.trim() ? (R(), I("div", Hg, ae(i.attributes.prompt_message), 1)) : pe("", !0),
                  i.isSubmitted ? (R(), I("div", Vg, [
                    e[31] || (e[31] = v("strong", null, "Your input:", -1)),
                    Qt(" " + ae(i.submittedValue) + " ", 1),
                    ($ = i.attributes) != null && $.confirmation_message && i.attributes.confirmation_message.trim() ? (R(), I("div", Kg, ae(i.attributes.confirmation_message), 1)) : pe("", !0)
                  ])) : (R(), I("div", Wg, [
                    Tn(v("textarea", {
                      "onUpdate:modelValue": (b) => i.userInputValue = b,
                      class: "user-input-textarea",
                      placeholder: "Type your message here...",
                      rows: "3",
                      onKeydown: [
                        Uo(Mn((b) => s.handleUserInputSubmit(i), ["ctrl"]), ["enter"]),
                        Uo(Mn((b) => s.handleUserInputSubmit(i), ["meta"]), ["enter"])
                      ]
                    }, null, 40, qg), [
                      [In, i.userInputValue]
                    ]),
                    v("button", {
                      class: "user-input-submit-button",
                      onClick: (b) => s.handleUserInputSubmit(i),
                      disabled: !i.userInputValue || !i.userInputValue.trim()
                    }, " Submit ", 8, jg)
                  ]))
                ])) : i.shopify_output || i.message_type === "product" ? (R(), I("div", Gg, [
                  i.message ? (R(), I("div", {
                    key: 0,
                    innerHTML: s.renderMarkdown(((we = (Y = i.shopify_output) == null ? void 0 : Y.products) == null ? void 0 : we.length) > 0 ? s.removeUrls(i.message) : i.message),
                    class: "product-message-text"
                  }, null, 8, Yg)) : pe("", !0),
                  (Ee = i.shopify_output) != null && Ee.products && i.shopify_output.products.length > 0 ? (R(), I("div", $g, [
                    e[33] || (e[33] = v("h3", { class: "carousel-title" }, "Products", -1)),
                    v("div", Xg, [
                      (R(!0), I(Qe, null, Rt(i.shopify_output.products, (b) => {
                        var te;
                        return R(), I("div", {
                          key: b.id,
                          class: "product-card-compact carousel-item"
                        }, [
                          (te = b.image) != null && te.src ? (R(), I("div", Zg, [
                            v("img", {
                              src: b.image.src,
                              alt: b.title,
                              class: "product-thumbnail"
                            }, null, 8, Jg)
                          ])) : pe("", !0),
                          v("div", Qg, [
                            v("div", em, [
                              v("div", tm, ae(b.title), 1),
                              b.variant_title && b.variant_title !== "Default Title" ? (R(), I("div", nm, ae(b.variant_title), 1)) : pe("", !0),
                              v("div", sm, ae(b.price_formatted || s.formatCurrency(b.price, b.currency)), 1)
                            ]),
                            v("div", rm, [
                              v("button", {
                                class: "view-details-button-compact",
                                onClick: (Ce) => {
                                  var X;
                                  return s.handleViewDetails(b, (X = i.shopify_output) == null ? void 0 : X.shop_domain);
                                }
                              }, [...e[32] || (e[32] = [
                                Qt(" View product ", -1),
                                v("span", { class: "external-link-icon" }, "↗", -1)
                              ])], 8, im)
                            ])
                          ])
                        ]);
                      }), 128))
                    ])
                  ])) : !i.message && ((Fe = i.shopify_output) != null && Fe.products) && i.shopify_output.products.length === 0 ? (R(), I("div", om, [...e[34] || (e[34] = [
                    v("p", null, "No products found.", -1)
                  ])])) : !i.message && i.shopify_output && !i.shopify_output.products ? (R(), I("div", am, [...e[35] || (e[35] = [
                    v("p", null, "No products to display.", -1)
                  ])])) : pe("", !0)
                ])) : (R(), I(Qe, { key: 4 }, [
                  v("div", {
                    innerHTML: s.renderMarkdown(i.message)
                  }, null, 8, lm),
                  i.attachments && i.attachments.length > 0 ? (R(), I("div", cm, [
                    (R(!0), I(Qe, null, Rt(i.attachments, (b) => (R(), I("div", {
                      key: b.id,
                      class: "attachment-item"
                    }, [
                      s.isImageAttachment(b.content_type) ? (R(), I("div", um, [
                        v("img", {
                          src: s.getDownloadUrl(b.file_url),
                          alt: b.filename,
                          class: "attachment-image",
                          onClick: Mn((te) => s.openPreview({ url: b.file_url, filename: b.filename, type: b.content_type, file_url: s.getDownloadUrl(b.file_url), size: void 0 }), ["stop"]),
                          style: { cursor: "pointer" }
                        }, null, 8, fm),
                        v("div", hm, [
                          v("a", {
                            href: s.getDownloadUrl(b.file_url),
                            target: "_blank",
                            class: "attachment-link"
                          }, [
                            e[36] || (e[36] = v("svg", {
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
                            Qt(" " + ae(b.filename) + " ", 1),
                            v("span", pm, "(" + ae(s.formatFileSize(b.file_size)) + ")", 1)
                          ], 8, dm)
                        ])
                      ])) : (R(), I("a", {
                        key: 1,
                        href: s.getDownloadUrl(b.file_url),
                        target: "_blank",
                        class: "attachment-link"
                      }, [
                        e[37] || (e[37] = v("svg", {
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
                        Qt(" " + ae(b.filename) + " ", 1),
                        v("span", mm, "(" + ae(s.formatFileSize(b.file_size)) + ")", 1)
                      ], 8, gm))
                    ]))), 128))
                  ])) : pe("", !0)
                ], 64))
              ], 4),
              s.showCitations && (i.message_type === "bot" || i.message_type === "agent") && i.sources && i.sources.length ? (R(), I("div", _m, [
                e[38] || (e[38] = v("span", { class: "citation-label" }, "Sources", -1)),
                (R(!0), I(Qe, null, Rt(i.sources, (b, te) => (R(), I("span", {
                  key: te,
                  class: "citation-chip",
                  title: b.type
                }, ae(b.name), 9, ym))), 128))
              ])) : pe("", !0),
              v("div", bm, [
                i.message_type === "user" ? (R(), I("span", vm, " You ")) : pe("", !0)
              ])
            ], 2);
          }), 128)),
          s.loading ? (R(), I("div", wm, e[39] || (e[39] = [
            v("div", {
              class: "reading-bars",
              "aria-hidden": "true"
            }, [
              v("span"),
              v("span"),
              v("span")
            ], -1),
            v("span", { class: "reading-label" }, "reading knowledge base", -1)
          ]))) : pe("", !0)
        ], 512),
        s.shouldShowNewConversationOption ? (R(), I("div", {
          key: 4,
          class: "new-conversation-section",
          style: Ne(s.agentBubbleStyles)
        }, [
          v("div", Mm, [
            e[44] || (e[44] = v("p", { class: "ended-text" }, "This chat has ended.", -1)),
            v("button", {
              class: "start-new-conversation-button",
              style: Ne(s.userBubbleStyles),
              onClick: s.handleStartNewConversation
            }, " Click here to start a new conversation ", 4)
          ])
        ], 4)) : (R(), I("div", {
          key: 3,
          class: Ge(["chat-input", { "ask-anything-input": s.isAskAnythingStyle }]),
          style: Ne(s.agentBubbleStyles)
        }, [
          !s.hasStartedChat && !s.hasConversationToken && s.shouldCollectEmail ? (R(), I("div", km, [
            Tn(v("input", {
              "onUpdate:modelValue": e[4] || (e[4] = (i) => s.emailInput = i),
              type: "email",
              placeholder: "Enter your email address to begin",
              disabled: s.loading || s.connectionStatus !== "connected",
              class: Ge({
                invalid: s.emailInput.trim() && !s.isValidEmail(s.emailInput.trim()),
                disabled: s.connectionStatus !== "connected"
              })
            }, null, 10, xm), [
              [In, s.emailInput]
            ])
          ])) : pe("", !0),
          v("input", {
            ref: "fileInputRef",
            type: "file",
            accept: s.acceptTypes,
            multiple: "",
            style: { display: "none" },
            onChange: e[5] || (e[5] = (...i) => s.handleFileSelect && s.handleFileSelect(...i))
          }, null, 544),
          s.uploadedAttachments.length > 0 ? (R(), I("div", Sm, [
            (R(!0), I(Qe, null, Rt(s.uploadedAttachments, (i, a) => (R(), I("div", {
              key: a,
              class: "file-preview-widget"
            }, [
              v("div", Am, [
                s.isImage(i.type) ? (R(), I("img", {
                  key: 0,
                  src: s.getPreviewUrl(i),
                  alt: i.filename,
                  class: "file-preview-image-widget",
                  onClick: Mn((l) => s.openPreview(i), ["stop"]),
                  style: { cursor: "pointer" }
                }, null, 8, Tm)) : (R(), I("div", {
                  key: 1,
                  class: "file-preview-icon-widget",
                  onClick: Mn((l) => s.openPreview(i), ["stop"]),
                  style: { cursor: "pointer" }
                }, [...e[40] || (e[40] = [
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
                ])], 8, Em))
              ]),
              v("div", Cm, [
                v("div", Rm, ae(i.filename), 1),
                v("div", Im, ae(s.formatFileSize(i.size)), 1)
              ]),
              v("button", {
                type: "button",
                class: "file-preview-remove-widget",
                onClick: (l) => s.removeAttachment(a),
                title: "Remove file"
              }, " × ", 8, Lm)
            ]))), 128))
          ])) : pe("", !0),
          s.isUploading ? (R(), I("div", Om, e[41] || (e[41] = [
            v("div", { class: "upload-spinner-widget" }, null, -1),
            v("span", { class: "upload-text-widget" }, "Uploading files...", -1)
          ]))) : pe("", !0),
          v("div", Fm, [
            Tn(v("input", {
              "onUpdate:modelValue": e[6] || (e[6] = (i) => s.newMessage = i),
              type: "text",
              placeholder: s.placeholderText,
              onKeypress: s.handleKeyPress,
              onInput: s.handleInputSync,
              onChange: s.handleInputSync,
              onPaste: e[7] || (e[7] = (...i) => s.handlePaste && s.handlePaste(...i)),
              onDrop: e[8] || (e[8] = (...i) => s.handleDrop && s.handleDrop(...i)),
              onDragover: e[9] || (e[9] = (...i) => s.handleDragOver && s.handleDragOver(...i)),
              onDragleave: e[10] || (e[10] = (...i) => s.handleDragLeave && s.handleDragLeave(...i)),
              disabled: !s.isMessageInputEnabled,
              class: Ge({ disabled: !s.isMessageInputEnabled, "ask-anything-field": s.isAskAnythingStyle })
            }, null, 42, Pm), [
              [In, s.newMessage]
            ]),
            s.canUploadMore ? (R(), I("button", {
              key: 0,
              type: "button",
              class: "attach-button",
              disabled: s.isUploading,
              onClick: e[11] || (e[11] = (...i) => s.openFilePicker && s.openFilePicker(...i)),
              title: `Attach files (${s.uploadedAttachments.length}/${s.maxFiles} used) or paste screenshots`
            }, e[42] || (e[42] = [
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
            ]), 8, Dm)) : pe("", !0),
            v("button", {
              class: Ge(["send-button", { "ask-anything-send": s.isAskAnythingStyle }]),
              style: Ne(s.userBubbleStyles),
              onClick: s.sendMessage,
              disabled: !s.newMessage.trim() && s.uploadedAttachments.length === 0 || !s.isMessageInputEnabled
            }, e[43] || (e[43] = [
              v("svg", {
                width: "20",
                height: "20",
                viewBox: "0 0 24 24",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg"
              }, [
                v("path", {
                  d: "M5 12L3 21L21 12L3 3L5 12ZM5 12L13 12",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                })
              ], -1)
            ]), 14, Nm)
          ])
        ], 6)),
        v("div", {
          class: "powered-by",
          style: Ne(s.messageNameStyles)
        }, e[45] || (e[45] = [
          Rn('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-a3601fa3><rect x="3" y="3" width="54" height="54" rx="16" fill="#C9F24E" data-v-a3601fa3></rect><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-a3601fa3></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-a3601fa3></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-a3601fa3></circle></svg> Powered by ChatterMate ', 2)
        ]), 4)
      ], 6)) : pe("", !0)
    ], 64)),
    s.showRatingDialog ? (R(), I("div", Bm, [
      v("div", Um, [
        e[46] || (e[46] = v("h3", null, "Rate your conversation", -1)),
        v("div", zm, [
          (R(), I(Qe, null, Rt(5, (i) => v("button", {
            key: i,
            onClick: (a) => s.currentRating = i,
            class: Ge([{ active: i <= s.currentRating }, "star-button"])
          }, " ★ ", 10, Hm)), 64))
        ]),
        Tn(v("textarea", {
          "onUpdate:modelValue": e[12] || (e[12] = (i) => s.ratingFeedback = i),
          placeholder: "Additional feedback (optional)",
          class: "rating-feedback"
        }, null, 512), [
          [In, s.ratingFeedback]
        ]),
        v("div", Wm, [
          v("button", {
            onClick: e[13] || (e[13] = (i) => t.submitRating(s.currentRating, s.ratingFeedback)),
            disabled: !s.currentRating,
            class: "submit-button",
            style: Ne(s.userBubbleStyles)
          }, " Submit ", 12, qm),
          v("button", {
            onClick: e[14] || (e[14] = (i) => s.showRatingDialog = !1),
            class: "skip-rating"
          }, " Skip ")
        ])
      ])
    ])) : pe("", !0),
    s.previewModal ? (R(), I("div", {
      key: 8,
      class: "preview-modal-overlay",
      onClick: e[17] || (e[17] = (...i) => s.closePreview && s.closePreview(...i))
    }, [
      v("div", {
        class: "preview-modal-content",
        onClick: e[16] || (e[16] = Mn(() => {
        }, ["stop"]))
      }, [
        v("button", {
          class: "preview-modal-close",
          onClick: e[15] || (e[15] = (...i) => s.closePreview && s.closePreview(...i))
        }, "×"),
        s.previewFile && s.isImage(s.previewFile.type) ? (R(), I("div", jm, [
          v("img", {
            src: s.getPreviewUrl(s.previewFile),
            alt: s.previewFile.filename,
            class: "preview-modal-image"
          }, null, 8, Vm),
          v("div", Km, ae(s.previewFile.filename), 1)
        ])) : pe("", !0)
      ])
    ])) : pe("", !0)
  ], 6)) : (R(), I("div", Gm));
}
const $m = /* @__PURE__ */ tp(ep, [["render", Ym], ["__scopeId", "data-v-a3601fa3"], ["__file", "/Users/arun/Documents/code/chattermate.chat/frontend/src/webclient/WidgetBuilder.vue"]]);
window.process || (window.process = { env: { NODE_ENV: "production" } });
const Dt = window.__INITIAL_DATA__, Hl = new URL(window.location.href), Wl = Hl.searchParams.get("preview") === "true", ql = (t) => {
  const e = Hl.searchParams.get(t);
  if (!(!e || e === "undefined" || e.trim() === ""))
    return e;
}, Xm = Wl ? ql("widget_id") || (Dt == null ? void 0 : Dt.widgetId) || void 0 : (Dt == null ? void 0 : Dt.widgetId) || void 0, Zm = Wl ? (Dt == null ? void 0 : Dt.initialToken) || ql("token") || void 0 : (Dt == null ? void 0 : Dt.initialToken) || void 0, Jm = Mf($m, {
  widgetId: Xm,
  token: Zm || void 0,
  initialAuthError: null
  // Let backend determine if auth is required
});
Jm.mount("#app");
