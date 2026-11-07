var Wf = Object.defineProperty;
var qf = (e, t, n) => t in e ? Wf(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var Je = (e, t, n) => qf(e, typeof t != "symbol" ? t + "" : t, n);
/**
* @vue/shared v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function ga(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const n of e.split(",")) t[n] = 1;
  return (n) => n in t;
}
const Qe = {}, er = [], xn = () => {
}, Vf = () => !1, Vi = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), _a = (e) => e.startsWith("onUpdate:"), Ot = Object.assign, ya = (e, t) => {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}, Kf = Object.prototype.hasOwnProperty, We = (e, t) => Kf.call(e, t), Te = Array.isArray, tr = (e) => Ki(e) === "[object Map]", Mc = (e) => Ki(e) === "[object Set]", xe = (e) => typeof e == "function", pt = (e) => typeof e == "string", fs = (e) => typeof e == "symbol", at = (e) => e !== null && typeof e == "object", Dc = (e) => (at(e) || xe(e)) && xe(e.then) && xe(e.catch), Fc = Object.prototype.toString, Ki = (e) => Fc.call(e), Gf = (e) => Ki(e).slice(8, -1), $c = (e) => Ki(e) === "[object Object]", va = (e) => pt(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, $r = /* @__PURE__ */ ga(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), Gi = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (n) => t[n] || (t[n] = e(n));
}, Yf = /-(\w)/g, ls = Gi(
  (e) => e.replace(Yf, (t, n) => n ? n.toUpperCase() : "")
), Xf = /\B([A-Z])/g, ds = Gi(
  (e) => e.replace(Xf, "-$1").toLowerCase()
), Bc = Gi((e) => e.charAt(0).toUpperCase() + e.slice(1)), To = Gi(
  (e) => e ? `on${Bc(e)}` : ""
), is = (e, t) => !Object.is(e, t), gi = (e, ...t) => {
  for (let n = 0; n < e.length; n++)
    e[n](...t);
}, Ko = (e, t, n, s = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: s,
    value: n
  });
}, Go = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let bl;
const Yi = () => bl || (bl = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function Ee(e) {
  if (Te(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
      const s = e[n], r = pt(s) ? ed(s) : Ee(s);
      if (r)
        for (const i in r)
          t[i] = r[i];
    }
    return t;
  } else if (pt(e) || at(e))
    return e;
}
const Zf = /;(?![^(]*\))/g, Jf = /:([^]+)/, Qf = /\/\*[^]*?\*\//g;
function ed(e) {
  const t = {};
  return e.replace(Qf, "").split(Zf).forEach((n) => {
    if (n) {
      const s = n.split(Jf);
      s.length > 1 && (t[s[0].trim()] = s[1].trim());
    }
  }), t;
}
function Pe(e) {
  let t = "";
  if (pt(e))
    t = e;
  else if (Te(e))
    for (let n = 0; n < e.length; n++) {
      const s = Pe(e[n]);
      s && (t += s + " ");
    }
  else if (at(e))
    for (const n in e)
      e[n] && (t += n + " ");
  return t.trim();
}
const td = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", nd = /* @__PURE__ */ ga(td);
function Uc(e) {
  return !!e || e === "";
}
const zc = (e) => !!(e && e.__v_isRef === !0), Z = (e) => pt(e) ? e : e == null ? "" : Te(e) || at(e) && (e.toString === Fc || !xe(e.toString)) ? zc(e) ? Z(e.value) : JSON.stringify(e, Hc, 2) : String(e), Hc = (e, t) => zc(t) ? Hc(e, t.value) : tr(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (n, [s, r], i) => (n[Ao(s, i) + " =>"] = r, n),
    {}
  )
} : Mc(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((n) => Ao(n))
} : fs(t) ? Ao(t) : at(t) && !Te(t) && !$c(t) ? String(t) : t, Ao = (e, t = "") => {
  var n;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    fs(e) ? `Symbol(${(n = e.description) != null ? n : t})` : e
  );
};
/**
* @vue/reactivity v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let jt;
class sd {
  constructor(t = !1) {
    this.detached = t, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this.parent = jt, !t && jt && (this.index = (jt.scopes || (jt.scopes = [])).push(
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
      const n = jt;
      try {
        return jt = this, t();
      } finally {
        jt = n;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = jt, jt = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    this._on > 0 && --this._on === 0 && (jt = this.prevScope, this.prevScope = void 0);
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
function rd() {
  return jt;
}
let tt;
const So = /* @__PURE__ */ new WeakSet();
class jc {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, jt && jt.active && jt.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, So.has(this) && (So.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || qc(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, wl(this), Vc(this);
    const t = tt, n = yn;
    tt = this, yn = !0;
    try {
      return this.fn();
    } finally {
      Kc(this), tt = t, yn = n, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        ka(t);
      this.deps = this.depsTail = void 0, wl(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? So.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    Yo(this) && this.run();
  }
  get dirty() {
    return Yo(this);
  }
}
let Wc = 0, Br, Ur;
function qc(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = Ur, Ur = e;
    return;
  }
  e.next = Br, Br = e;
}
function ba() {
  Wc++;
}
function wa() {
  if (--Wc > 0)
    return;
  if (Ur) {
    let t = Ur;
    for (Ur = void 0; t; ) {
      const n = t.next;
      t.next = void 0, t.flags &= -9, t = n;
    }
  }
  let e;
  for (; Br; ) {
    let t = Br;
    for (Br = void 0; t; ) {
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
function Vc(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Kc(e) {
  let t, n = e.depsTail, s = n;
  for (; s; ) {
    const r = s.prevDep;
    s.version === -1 ? (s === n && (n = r), ka(s), id(s)) : t = s, s.dep.activeLink = s.prevActiveLink, s.prevActiveLink = void 0, s = r;
  }
  e.deps = t, e.depsTail = n;
}
function Yo(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (Gc(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function Gc(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === Kr) || (e.globalVersion = Kr, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !Yo(e))))
    return;
  e.flags |= 2;
  const t = e.dep, n = tt, s = yn;
  tt = e, yn = !0;
  try {
    Vc(e);
    const r = e.fn(e._value);
    (t.version === 0 || is(r, e._value)) && (e.flags |= 128, e._value = r, t.version++);
  } catch (r) {
    throw t.version++, r;
  } finally {
    tt = n, yn = s, Kc(e), e.flags &= -3;
  }
}
function ka(e, t = !1) {
  const { dep: n, prevSub: s, nextSub: r } = e;
  if (s && (s.nextSub = r, e.prevSub = void 0), r && (r.prevSub = s, e.nextSub = void 0), n.subs === e && (n.subs = s, !s && n.computed)) {
    n.computed.flags &= -5;
    for (let i = n.computed.deps; i; i = i.nextDep)
      ka(i, !0);
  }
  !t && !--n.sc && n.map && n.map.delete(n.key);
}
function id(e) {
  const { prevDep: t, nextDep: n } = e;
  t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
let yn = !0;
const Yc = [];
function zn() {
  Yc.push(yn), yn = !1;
}
function Hn() {
  const e = Yc.pop();
  yn = e === void 0 ? !0 : e;
}
function wl(e) {
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
let Kr = 0;
class od {
  constructor(t, n) {
    this.sub = t, this.dep = n, this.version = n.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Ta {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(t) {
    if (!tt || !yn || tt === this.computed)
      return;
    let n = this.activeLink;
    if (n === void 0 || n.sub !== tt)
      n = this.activeLink = new od(tt, this), tt.deps ? (n.prevDep = tt.depsTail, tt.depsTail.nextDep = n, tt.depsTail = n) : tt.deps = tt.depsTail = n, Xc(n);
    else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
      const s = n.nextDep;
      s.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = s), n.prevDep = tt.depsTail, n.nextDep = void 0, tt.depsTail.nextDep = n, tt.depsTail = n, tt.deps === n && (tt.deps = s);
    }
    return n;
  }
  trigger(t) {
    this.version++, Kr++, this.notify(t);
  }
  notify(t) {
    ba();
    try {
      for (let n = this.subs; n; n = n.prevSub)
        n.sub.notify() && n.sub.dep.notify();
    } finally {
      wa();
    }
  }
}
function Xc(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let s = t.deps; s; s = s.nextDep)
        Xc(s);
    }
    const n = e.dep.subs;
    n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
  }
}
const Xo = /* @__PURE__ */ new WeakMap(), Os = Symbol(
  ""
), Zo = Symbol(
  ""
), Gr = Symbol(
  ""
);
function Rt(e, t, n) {
  if (yn && tt) {
    let s = Xo.get(e);
    s || Xo.set(e, s = /* @__PURE__ */ new Map());
    let r = s.get(n);
    r || (s.set(n, r = new Ta()), r.map = s, r.key = n), r.track();
  }
}
function Fn(e, t, n, s, r, i) {
  const o = Xo.get(e);
  if (!o) {
    Kr++;
    return;
  }
  const a = (l) => {
    l && l.trigger();
  };
  if (ba(), t === "clear")
    o.forEach(a);
  else {
    const l = Te(e), u = l && va(n);
    if (l && n === "length") {
      const c = Number(s);
      o.forEach((b, w) => {
        (w === "length" || w === Gr || !fs(w) && w >= c) && a(b);
      });
    } else
      switch ((n !== void 0 || o.has(void 0)) && a(o.get(n)), u && a(o.get(Gr)), t) {
        case "add":
          l ? u && a(o.get("length")) : (a(o.get(Os)), tr(e) && a(o.get(Zo)));
          break;
        case "delete":
          l || (a(o.get(Os)), tr(e) && a(o.get(Zo)));
          break;
        case "set":
          tr(e) && a(o.get(Os));
          break;
      }
  }
  wa();
}
function Xs(e) {
  const t = je(e);
  return t === e ? t : (Rt(t, "iterate", Gr), hn(e) ? t : t.map(At));
}
function Xi(e) {
  return Rt(e = je(e), "iterate", Gr), e;
}
const ad = {
  __proto__: null,
  [Symbol.iterator]() {
    return xo(this, Symbol.iterator, At);
  },
  concat(...e) {
    return Xs(this).concat(
      ...e.map((t) => Te(t) ? Xs(t) : t)
    );
  },
  entries() {
    return xo(this, "entries", (e) => (e[1] = At(e[1]), e));
  },
  every(e, t) {
    return Pn(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return Pn(this, "filter", e, t, (n) => n.map(At), arguments);
  },
  find(e, t) {
    return Pn(this, "find", e, t, At, arguments);
  },
  findIndex(e, t) {
    return Pn(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return Pn(this, "findLast", e, t, At, arguments);
  },
  findLastIndex(e, t) {
    return Pn(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return Pn(this, "forEach", e, t, void 0, arguments);
  },
  includes(...e) {
    return Eo(this, "includes", e);
  },
  indexOf(...e) {
    return Eo(this, "indexOf", e);
  },
  join(e) {
    return Xs(this).join(e);
  },
  // keys() iterator only reads `length`, no optimisation required
  lastIndexOf(...e) {
    return Eo(this, "lastIndexOf", e);
  },
  map(e, t) {
    return Pn(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return Ar(this, "pop");
  },
  push(...e) {
    return Ar(this, "push", e);
  },
  reduce(e, ...t) {
    return kl(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return kl(this, "reduceRight", e, t);
  },
  shift() {
    return Ar(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return Pn(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return Ar(this, "splice", e);
  },
  toReversed() {
    return Xs(this).toReversed();
  },
  toSorted(e) {
    return Xs(this).toSorted(e);
  },
  toSpliced(...e) {
    return Xs(this).toSpliced(...e);
  },
  unshift(...e) {
    return Ar(this, "unshift", e);
  },
  values() {
    return xo(this, "values", At);
  }
};
function xo(e, t, n) {
  const s = Xi(e), r = s[t]();
  return s !== e && !hn(e) && (r._next = r.next, r.next = () => {
    const i = r._next();
    return i.value && (i.value = n(i.value)), i;
  }), r;
}
const ld = Array.prototype;
function Pn(e, t, n, s, r, i) {
  const o = Xi(e), a = o !== e && !hn(e), l = o[t];
  if (l !== ld[t]) {
    const b = l.apply(e, i);
    return a ? At(b) : b;
  }
  let u = n;
  o !== e && (a ? u = function(b, w) {
    return n.call(this, At(b), w, e);
  } : n.length > 2 && (u = function(b, w) {
    return n.call(this, b, w, e);
  }));
  const c = l.call(o, u, s);
  return a && r ? r(c) : c;
}
function kl(e, t, n, s) {
  const r = Xi(e);
  let i = n;
  return r !== e && (hn(e) ? n.length > 3 && (i = function(o, a, l) {
    return n.call(this, o, a, l, e);
  }) : i = function(o, a, l) {
    return n.call(this, o, At(a), l, e);
  }), r[t](i, ...s);
}
function Eo(e, t, n) {
  const s = je(e);
  Rt(s, "iterate", Gr);
  const r = s[t](...n);
  return (r === -1 || r === !1) && xa(n[0]) ? (n[0] = je(n[0]), s[t](...n)) : r;
}
function Ar(e, t, n = []) {
  zn(), ba();
  const s = je(e)[t].apply(e, n);
  return wa(), Hn(), s;
}
const cd = /* @__PURE__ */ ga("__proto__,__v_isRef,__isVue"), Zc = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(fs)
);
function ud(e) {
  fs(e) || (e = String(e));
  const t = je(this);
  return Rt(t, "has", e), t.hasOwnProperty(e);
}
class Jc {
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
      return s === (r ? i ? bd : nu : i ? tu : eu).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(s) ? t : void 0;
    const o = Te(t);
    if (!r) {
      let l;
      if (o && (l = ad[n]))
        return l;
      if (n === "hasOwnProperty")
        return ud;
    }
    const a = Reflect.get(
      t,
      n,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      It(t) ? t : s
    );
    return (fs(n) ? Zc.has(n) : cd(n)) || (r || Rt(t, "get", n), i) ? a : It(a) ? o && va(n) ? a : a.value : at(a) ? r ? su(a) : Zi(a) : a;
  }
}
class Qc extends Jc {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, n, s, r) {
    let i = t[n];
    if (!this._isShallow) {
      const l = cs(i);
      if (!hn(s) && !cs(s) && (i = je(i), s = je(s)), !Te(t) && It(i) && !It(s))
        return l ? !1 : (i.value = s, !0);
    }
    const o = Te(t) && va(n) ? Number(n) < t.length : We(t, n), a = Reflect.set(
      t,
      n,
      s,
      It(t) ? t : r
    );
    return t === je(r) && (o ? is(s, i) && Fn(t, "set", n, s) : Fn(t, "add", n, s)), a;
  }
  deleteProperty(t, n) {
    const s = We(t, n);
    t[n];
    const r = Reflect.deleteProperty(t, n);
    return r && s && Fn(t, "delete", n, void 0), r;
  }
  has(t, n) {
    const s = Reflect.has(t, n);
    return (!fs(n) || !Zc.has(n)) && Rt(t, "has", n), s;
  }
  ownKeys(t) {
    return Rt(
      t,
      "iterate",
      Te(t) ? "length" : Os
    ), Reflect.ownKeys(t);
  }
}
class fd extends Jc {
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
const dd = /* @__PURE__ */ new Qc(), hd = /* @__PURE__ */ new fd(), pd = /* @__PURE__ */ new Qc(!0);
const Jo = (e) => e, ci = (e) => Reflect.getPrototypeOf(e);
function md(e, t, n) {
  return function(...s) {
    const r = this.__v_raw, i = je(r), o = tr(i), a = e === "entries" || e === Symbol.iterator && o, l = e === "keys" && o, u = r[e](...s), c = n ? Jo : t ? Oi : At;
    return !t && Rt(
      i,
      "iterate",
      l ? Zo : Os
    ), {
      // iterator protocol
      next() {
        const { value: b, done: w } = u.next();
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
function ui(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function gd(e, t) {
  const n = {
    get(r) {
      const i = this.__v_raw, o = je(i), a = je(r);
      e || (is(r, a) && Rt(o, "get", r), Rt(o, "get", a));
      const { has: l } = ci(o), u = t ? Jo : e ? Oi : At;
      if (l.call(o, r))
        return u(i.get(r));
      if (l.call(o, a))
        return u(i.get(a));
      i !== o && i.get(r);
    },
    get size() {
      const r = this.__v_raw;
      return !e && Rt(je(r), "iterate", Os), Reflect.get(r, "size", r);
    },
    has(r) {
      const i = this.__v_raw, o = je(i), a = je(r);
      return e || (is(r, a) && Rt(o, "has", r), Rt(o, "has", a)), r === a ? i.has(r) : i.has(r) || i.has(a);
    },
    forEach(r, i) {
      const o = this, a = o.__v_raw, l = je(a), u = t ? Jo : e ? Oi : At;
      return !e && Rt(l, "iterate", Os), a.forEach((c, b) => r.call(i, u(c), u(b), o));
    }
  };
  return Ot(
    n,
    e ? {
      add: ui("add"),
      set: ui("set"),
      delete: ui("delete"),
      clear: ui("clear")
    } : {
      add(r) {
        !t && !hn(r) && !cs(r) && (r = je(r));
        const i = je(this);
        return ci(i).has.call(i, r) || (i.add(r), Fn(i, "add", r, r)), this;
      },
      set(r, i) {
        !t && !hn(i) && !cs(i) && (i = je(i));
        const o = je(this), { has: a, get: l } = ci(o);
        let u = a.call(o, r);
        u || (r = je(r), u = a.call(o, r));
        const c = l.call(o, r);
        return o.set(r, i), u ? is(i, c) && Fn(o, "set", r, i) : Fn(o, "add", r, i), this;
      },
      delete(r) {
        const i = je(this), { has: o, get: a } = ci(i);
        let l = o.call(i, r);
        l || (r = je(r), l = o.call(i, r)), a && a.call(i, r);
        const u = i.delete(r);
        return l && Fn(i, "delete", r, void 0), u;
      },
      clear() {
        const r = je(this), i = r.size !== 0, o = r.clear();
        return i && Fn(
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
    n[r] = md(r, e, t);
  }), n;
}
function Aa(e, t) {
  const n = gd(e, t);
  return (s, r, i) => r === "__v_isReactive" ? !e : r === "__v_isReadonly" ? e : r === "__v_raw" ? s : Reflect.get(
    We(n, r) && r in s ? n : s,
    r,
    i
  );
}
const _d = {
  get: /* @__PURE__ */ Aa(!1, !1)
}, yd = {
  get: /* @__PURE__ */ Aa(!1, !0)
}, vd = {
  get: /* @__PURE__ */ Aa(!0, !1)
};
const eu = /* @__PURE__ */ new WeakMap(), tu = /* @__PURE__ */ new WeakMap(), nu = /* @__PURE__ */ new WeakMap(), bd = /* @__PURE__ */ new WeakMap();
function wd(e) {
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
function kd(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : wd(Gf(e));
}
function Zi(e) {
  return cs(e) ? e : Sa(
    e,
    !1,
    dd,
    _d,
    eu
  );
}
function Td(e) {
  return Sa(
    e,
    !1,
    pd,
    yd,
    tu
  );
}
function su(e) {
  return Sa(
    e,
    !0,
    hd,
    vd,
    nu
  );
}
function Sa(e, t, n, s, r) {
  if (!at(e) || e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const i = kd(e);
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
function nr(e) {
  return cs(e) ? nr(e.__v_raw) : !!(e && e.__v_isReactive);
}
function cs(e) {
  return !!(e && e.__v_isReadonly);
}
function hn(e) {
  return !!(e && e.__v_isShallow);
}
function xa(e) {
  return e ? !!e.__v_raw : !1;
}
function je(e) {
  const t = e && e.__v_raw;
  return t ? je(t) : e;
}
function Ad(e) {
  return !We(e, "__v_skip") && Object.isExtensible(e) && Ko(e, "__v_skip", !0), e;
}
const At = (e) => at(e) ? Zi(e) : e, Oi = (e) => at(e) ? su(e) : e;
function It(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function oe(e) {
  return Sd(e, !1);
}
function Sd(e, t) {
  return It(e) ? e : new xd(e, t);
}
class xd {
  constructor(t, n) {
    this.dep = new Ta(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? t : je(t), this._value = n ? t : At(t), this.__v_isShallow = n;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const n = this._rawValue, s = this.__v_isShallow || hn(t) || cs(t);
    t = s ? t : je(t), is(t, n) && (this._rawValue = t, this._value = s ? t : At(t), this.dep.trigger());
  }
}
function x(e) {
  return It(e) ? e.value : e;
}
const Ed = {
  get: (e, t, n) => t === "__v_raw" ? e : x(Reflect.get(e, t, n)),
  set: (e, t, n, s) => {
    const r = e[t];
    return It(r) && !It(n) ? (r.value = n, !0) : Reflect.set(e, t, n, s);
  }
};
function ru(e) {
  return nr(e) ? e : new Proxy(e, Ed);
}
class Cd {
  constructor(t, n, s) {
    this.fn = t, this.setter = n, this._value = void 0, this.dep = new Ta(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Kr - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = s;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    tt !== this)
      return qc(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return Gc(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
function Rd(e, t, n = !1) {
  let s, r;
  return xe(e) ? s = e : (s = e.get, r = e.set), new Cd(s, r, n);
}
const fi = {}, Li = /* @__PURE__ */ new WeakMap();
let xs;
function Id(e, t = !1, n = xs) {
  if (n) {
    let s = Li.get(n);
    s || Li.set(n, s = []), s.push(e);
  }
}
function Od(e, t, n = Qe) {
  const { immediate: s, deep: r, once: i, scheduler: o, augmentJob: a, call: l } = n, u = (C) => r ? C : hn(C) || r === !1 || r === 0 ? $n(C, 1) : $n(C);
  let c, b, w, I, O = !1, j = !1;
  if (It(e) ? (b = () => e.value, O = hn(e)) : nr(e) ? (b = () => u(e), O = !0) : Te(e) ? (j = !0, O = e.some((C) => nr(C) || hn(C)), b = () => e.map((C) => {
    if (It(C))
      return C.value;
    if (nr(C))
      return u(C);
    if (xe(C))
      return l ? l(C, 2) : C();
  })) : xe(e) ? t ? b = l ? () => l(e, 2) : e : b = () => {
    if (w) {
      zn();
      try {
        w();
      } finally {
        Hn();
      }
    }
    const C = xs;
    xs = c;
    try {
      return l ? l(e, 3, [I]) : e(I);
    } finally {
      xs = C;
    }
  } : b = xn, t && r) {
    const C = b, P = r === !0 ? 1 / 0 : r;
    b = () => $n(C(), P);
  }
  const ce = rd(), R = () => {
    c.stop(), ce && ce.active && ya(ce.effects, c);
  };
  if (i && t) {
    const C = t;
    t = (...P) => {
      C(...P), R();
    };
  }
  let ue = j ? new Array(e.length).fill(fi) : fi;
  const me = (C) => {
    if (!(!(c.flags & 1) || !c.dirty && !C))
      if (t) {
        const P = c.run();
        if (r || O || (j ? P.some((S, q) => is(S, ue[q])) : is(P, ue))) {
          w && w();
          const S = xs;
          xs = c;
          try {
            const q = [
              P,
              // pass undefined as the old value when it's changed for the first time
              ue === fi ? void 0 : j && ue[0] === fi ? [] : ue,
              I
            ];
            ue = P, l ? l(t, 3, q) : (
              // @ts-expect-error
              t(...q)
            );
          } finally {
            xs = S;
          }
        }
      } else
        c.run();
  };
  return a && a(me), c = new jc(b), c.scheduler = o ? () => o(me, !1) : me, I = (C) => Id(C, !1, c), w = c.onStop = () => {
    const C = Li.get(c);
    if (C) {
      if (l)
        l(C, 4);
      else
        for (const P of C) P();
      Li.delete(c);
    }
  }, t ? s ? me(!0) : ue = c.run() : o ? o(me.bind(null, !0), !0) : c.run(), R.pause = c.pause.bind(c), R.resume = c.resume.bind(c), R.stop = R, R;
}
function $n(e, t = 1 / 0, n) {
  if (t <= 0 || !at(e) || e.__v_skip || (n = n || /* @__PURE__ */ new Set(), n.has(e)))
    return e;
  if (n.add(e), t--, It(e))
    $n(e.value, t, n);
  else if (Te(e))
    for (let s = 0; s < e.length; s++)
      $n(e[s], t, n);
  else if (Mc(e) || tr(e))
    e.forEach((s) => {
      $n(s, t, n);
    });
  else if ($c(e)) {
    for (const s in e)
      $n(e[s], t, n);
    for (const s of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, s) && $n(e[s], t, n);
  }
  return e;
}
/**
* @vue/runtime-core v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function Jr(e, t, n, s) {
  try {
    return s ? e(...s) : e();
  } catch (r) {
    Ji(r, t, n);
  }
}
function Rn(e, t, n, s) {
  if (xe(e)) {
    const r = Jr(e, t, n, s);
    return r && Dc(r) && r.catch((i) => {
      Ji(i, t, n);
    }), r;
  }
  if (Te(e)) {
    const r = [];
    for (let i = 0; i < e.length; i++)
      r.push(Rn(e[i], t, n, s));
    return r;
  }
}
function Ji(e, t, n, s = !0) {
  const r = t ? t.vnode : null, { errorHandler: i, throwUnhandledErrorInProduction: o } = t && t.appContext.config || Qe;
  if (t) {
    let a = t.parent;
    const l = t.proxy, u = `https://vuejs.org/error-reference/#runtime-${n}`;
    for (; a; ) {
      const c = a.ec;
      if (c) {
        for (let b = 0; b < c.length; b++)
          if (c[b](e, l, u) === !1)
            return;
      }
      a = a.parent;
    }
    if (i) {
      zn(), Jr(i, null, 10, [
        e,
        l,
        u
      ]), Hn();
      return;
    }
  }
  Ld(e, n, r, s, o);
}
function Ld(e, t, n, s = !0, r = !1) {
  if (r)
    throw e;
  console.error(e);
}
const $t = [];
let An = -1;
const sr = [];
let ts = null, Zs = 0;
const iu = /* @__PURE__ */ Promise.resolve();
let Ni = null;
function rs(e) {
  const t = Ni || iu;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function Nd(e) {
  let t = An + 1, n = $t.length;
  for (; t < n; ) {
    const s = t + n >>> 1, r = $t[s], i = Yr(r);
    i < e || i === e && r.flags & 2 ? t = s + 1 : n = s;
  }
  return t;
}
function Ea(e) {
  if (!(e.flags & 1)) {
    const t = Yr(e), n = $t[$t.length - 1];
    !n || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= Yr(n) ? $t.push(e) : $t.splice(Nd(t), 0, e), e.flags |= 1, ou();
  }
}
function ou() {
  Ni || (Ni = iu.then(lu));
}
function Pd(e) {
  Te(e) ? sr.push(...e) : ts && e.id === -1 ? ts.splice(Zs + 1, 0, e) : e.flags & 1 || (sr.push(e), e.flags |= 1), ou();
}
function Tl(e, t, n = An + 1) {
  for (; n < $t.length; n++) {
    const s = $t[n];
    if (s && s.flags & 2) {
      if (e && s.id !== e.uid)
        continue;
      $t.splice(n, 1), n--, s.flags & 4 && (s.flags &= -2), s(), s.flags & 4 || (s.flags &= -2);
    }
  }
}
function au(e) {
  if (sr.length) {
    const t = [...new Set(sr)].sort(
      (n, s) => Yr(n) - Yr(s)
    );
    if (sr.length = 0, ts) {
      ts.push(...t);
      return;
    }
    for (ts = t, Zs = 0; Zs < ts.length; Zs++) {
      const n = ts[Zs];
      n.flags & 4 && (n.flags &= -2), n.flags & 8 || n(), n.flags &= -2;
    }
    ts = null, Zs = 0;
  }
}
const Yr = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function lu(e) {
  try {
    for (An = 0; An < $t.length; An++) {
      const t = $t[An];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), Jr(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; An < $t.length; An++) {
      const t = $t[An];
      t && (t.flags &= -2);
    }
    An = -1, $t.length = 0, au(), Ni = null, ($t.length || sr.length) && lu();
  }
}
let dn = null, cu = null;
function Pi(e) {
  const t = dn;
  return dn = e, cu = e && e.type.__scopeId || null, t;
}
function Md(e, t = dn, n) {
  if (!t || e._n)
    return e;
  const s = (...r) => {
    s._d && Ll(-1);
    const i = Pi(t);
    let o;
    try {
      o = e(...r);
    } finally {
      Pi(i), s._d && Ll(1);
    }
    return o;
  };
  return s._n = !0, s._c = !0, s._d = !0, s;
}
function Qn(e, t) {
  if (dn === null)
    return e;
  const n = ro(dn), s = e.dirs || (e.dirs = []);
  for (let r = 0; r < t.length; r++) {
    let [i, o, a, l = Qe] = t[r];
    i && (xe(i) && (i = {
      mounted: i,
      updated: i
    }), i.deep && $n(o), s.push({
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
function ws(e, t, n, s) {
  const r = e.dirs, i = t && t.dirs;
  for (let o = 0; o < r.length; o++) {
    const a = r[o];
    i && (a.oldValue = i[o].value);
    let l = a.dir[s];
    l && (zn(), Rn(l, n, 8, [
      e.el,
      a,
      e,
      t
    ]), Hn());
  }
}
const Dd = Symbol("_vte"), Fd = (e) => e.__isTeleport;
function Ca(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, Ca(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function Ps(e, t) {
  return xe(e) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    Ot({ name: e.name }, t, { setup: e })
  ) : e;
}
function uu(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
function zr(e, t, n, s, r = !1) {
  if (Te(e)) {
    e.forEach(
      (O, j) => zr(
        O,
        t && (Te(t) ? t[j] : t),
        n,
        s,
        r
      )
    );
    return;
  }
  if (Hr(s) && !r) {
    s.shapeFlag & 512 && s.type.__asyncResolved && s.component.subTree.component && zr(e, t, n, s.component.subTree);
    return;
  }
  const i = s.shapeFlag & 4 ? ro(s.component) : s.el, o = r ? null : i, { i: a, r: l } = e, u = t && t.r, c = a.refs === Qe ? a.refs = {} : a.refs, b = a.setupState, w = je(b), I = b === Qe ? () => !1 : (O) => We(w, O);
  if (u != null && u !== l && (pt(u) ? (c[u] = null, I(u) && (b[u] = null)) : It(u) && (u.value = null)), xe(l))
    Jr(l, a, 12, [o, c]);
  else {
    const O = pt(l), j = It(l);
    if (O || j) {
      const ce = () => {
        if (e.f) {
          const R = O ? I(l) ? b[l] : c[l] : l.value;
          r ? Te(R) && ya(R, i) : Te(R) ? R.includes(i) || R.push(i) : O ? (c[l] = [i], I(l) && (b[l] = c[l])) : (l.value = [i], e.k && (c[e.k] = l.value));
        } else O ? (c[l] = o, I(l) && (b[l] = o)) : j && (l.value = o, e.k && (c[e.k] = o));
      };
      o ? (ce.id = -1, en(ce, n)) : ce();
    }
  }
}
Yi().requestIdleCallback;
Yi().cancelIdleCallback;
const Hr = (e) => !!e.type.__asyncLoader, fu = (e) => e.type.__isKeepAlive;
function $d(e, t) {
  du(e, "a", t);
}
function Bd(e, t) {
  du(e, "da", t);
}
function du(e, t, n = Bt) {
  const s = e.__wdc || (e.__wdc = () => {
    let r = n;
    for (; r; ) {
      if (r.isDeactivated)
        return;
      r = r.parent;
    }
    return e();
  });
  if (Qi(t, s, n), n) {
    let r = n.parent;
    for (; r && r.parent; )
      fu(r.parent.vnode) && Ud(s, t, n, r), r = r.parent;
  }
}
function Ud(e, t, n, s) {
  const r = Qi(
    t,
    e,
    s,
    !0
    /* prepend */
  );
  Qr(() => {
    ya(s[t], r);
  }, n);
}
function Qi(e, t, n = Bt, s = !1) {
  if (n) {
    const r = n[e] || (n[e] = []), i = t.__weh || (t.__weh = (...o) => {
      zn();
      const a = ei(n), l = Rn(t, n, e, o);
      return a(), Hn(), l;
    });
    return s ? r.unshift(i) : r.push(i), i;
  }
}
const jn = (e) => (t, n = Bt) => {
  (!Zr || e === "sp") && Qi(e, (...s) => t(...s), n);
}, zd = jn("bm"), eo = jn("m"), Hd = jn(
  "bu"
), jd = jn("u"), to = jn(
  "bum"
), Qr = jn("um"), Wd = jn(
  "sp"
), qd = jn("rtg"), Vd = jn("rtc");
function Kd(e, t = Bt) {
  Qi("ec", e, t);
}
const Gd = Symbol.for("v-ndc");
function ft(e, t, n, s) {
  let r;
  const i = n, o = Te(e);
  if (o || pt(e)) {
    const a = o && nr(e);
    let l = !1, u = !1;
    a && (l = !hn(e), u = cs(e), e = Xi(e)), r = new Array(e.length);
    for (let c = 0, b = e.length; c < b; c++)
      r[c] = t(
        l ? u ? Oi(At(e[c])) : At(e[c]) : e[c],
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
      for (let l = 0, u = a.length; l < u; l++) {
        const c = a[l];
        r[l] = t(e[c], c, l, i);
      }
    }
  else
    r = [];
  return r;
}
const Qo = (e) => e ? Nu(e) ? ro(e) : Qo(e.parent) : null, jr = (
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
    $parent: (e) => Qo(e.parent),
    $root: (e) => Qo(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => pu(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      Ea(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = rs.bind(e.proxy)),
    $watch: (e) => gh.bind(e)
  })
), Co = (e, t) => e !== Qe && !e.__isScriptSetup && We(e, t), Yd = {
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
        if (Co(s, t))
          return o[t] = 1, s[t];
        if (r !== Qe && We(r, t))
          return o[t] = 2, r[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (u = e.propsOptions[0]) && We(u, t)
        )
          return o[t] = 3, i[t];
        if (n !== Qe && We(n, t))
          return o[t] = 4, n[t];
        ea && (o[t] = 0);
      }
    }
    const c = jr[t];
    let b, w;
    if (c)
      return t === "$attrs" && Rt(e.attrs, "get", ""), c(e);
    if (
      // css module (injected by vue-loader)
      (b = a.__cssModules) && (b = b[t])
    )
      return b;
    if (n !== Qe && We(n, t))
      return o[t] = 4, n[t];
    if (
      // global properties
      w = l.config.globalProperties, We(w, t)
    )
      return w[t];
  },
  set({ _: e }, t, n) {
    const { data: s, setupState: r, ctx: i } = e;
    return Co(r, t) ? (r[t] = n, !0) : s !== Qe && We(s, t) ? (s[t] = n, !0) : We(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (i[t] = n, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: n, ctx: s, appContext: r, propsOptions: i }
  }, o) {
    let a;
    return !!n[o] || e !== Qe && We(e, o) || Co(t, o) || (a = i[0]) && We(a, o) || We(s, o) || We(jr, o) || We(r.config.globalProperties, o);
  },
  defineProperty(e, t, n) {
    return n.get != null ? e._.accessCache[t] = 0 : We(n, "value") && this.set(e, t, n.value, null), Reflect.defineProperty(e, t, n);
  }
};
function Al(e) {
  return Te(e) ? e.reduce(
    (t, n) => (t[n] = null, t),
    {}
  ) : e;
}
let ea = !0;
function Xd(e) {
  const t = pu(e), n = e.proxy, s = e.ctx;
  ea = !1, t.beforeCreate && Sl(t.beforeCreate, e, "bc");
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
    beforeMount: b,
    mounted: w,
    beforeUpdate: I,
    updated: O,
    activated: j,
    deactivated: ce,
    beforeDestroy: R,
    beforeUnmount: ue,
    destroyed: me,
    unmounted: C,
    render: P,
    renderTracked: S,
    renderTriggered: q,
    errorCaptured: ne,
    serverPrefetch: he,
    // public API
    expose: pe,
    inheritAttrs: Le,
    // assets
    components: Ae,
    directives: Ve,
    filters: $e
  } = t;
  if (u && Zd(u, s, null), o)
    for (const we in o) {
      const ge = o[we];
      xe(ge) && (s[we] = ge.bind(n));
    }
  if (r) {
    const we = r.call(n, n);
    at(we) && (e.data = Zi(we));
  }
  if (ea = !0, i)
    for (const we in i) {
      const ge = i[we], Ye = xe(ge) ? ge.bind(n, n) : xe(ge.get) ? ge.get.bind(n, n) : xn, Xe = !xe(ge) && xe(ge.set) ? ge.set.bind(n) : xn, rt = le({
        get: Ye,
        set: Xe
      });
      Object.defineProperty(s, we, {
        enumerable: !0,
        configurable: !0,
        get: () => rt.value,
        set: (ze) => rt.value = ze
      });
    }
  if (a)
    for (const we in a)
      hu(a[we], s, n, we);
  if (l) {
    const we = xe(l) ? l.call(n) : l;
    Reflect.ownKeys(we).forEach((ge) => {
      sh(ge, we[ge]);
    });
  }
  c && Sl(c, e, "c");
  function fe(we, ge) {
    Te(ge) ? ge.forEach((Ye) => we(Ye.bind(n))) : ge && we(ge.bind(n));
  }
  if (fe(zd, b), fe(eo, w), fe(Hd, I), fe(jd, O), fe($d, j), fe(Bd, ce), fe(Kd, ne), fe(Vd, S), fe(qd, q), fe(to, ue), fe(Qr, C), fe(Wd, he), Te(pe))
    if (pe.length) {
      const we = e.exposed || (e.exposed = {});
      pe.forEach((ge) => {
        Object.defineProperty(we, ge, {
          get: () => n[ge],
          set: (Ye) => n[ge] = Ye,
          enumerable: !0
        });
      });
    } else e.exposed || (e.exposed = {});
  P && e.render === xn && (e.render = P), Le != null && (e.inheritAttrs = Le), Ae && (e.components = Ae), Ve && (e.directives = Ve), he && uu(e);
}
function Zd(e, t, n = xn) {
  Te(e) && (e = ta(e));
  for (const s in e) {
    const r = e[s];
    let i;
    at(r) ? "default" in r ? i = _i(
      r.from || s,
      r.default,
      !0
    ) : i = _i(r.from || s) : i = _i(r), It(i) ? Object.defineProperty(t, s, {
      enumerable: !0,
      configurable: !0,
      get: () => i.value,
      set: (o) => i.value = o
    }) : t[s] = i;
  }
}
function Sl(e, t, n) {
  Rn(
    Te(e) ? e.map((s) => s.bind(t.proxy)) : e.bind(t.proxy),
    t,
    n
  );
}
function hu(e, t, n, s) {
  let r = s.includes(".") ? Eu(n, s) : () => n[s];
  if (pt(e)) {
    const i = t[e];
    xe(i) && bt(r, i);
  } else if (xe(e))
    bt(r, e.bind(n));
  else if (at(e))
    if (Te(e))
      e.forEach((i) => hu(i, t, n, s));
    else {
      const i = xe(e.handler) ? e.handler.bind(n) : t[e.handler];
      xe(i) && bt(r, i, e);
    }
}
function pu(e) {
  const t = e.type, { mixins: n, extends: s } = t, {
    mixins: r,
    optionsCache: i,
    config: { optionMergeStrategies: o }
  } = e.appContext, a = i.get(t);
  let l;
  return a ? l = a : !r.length && !n && !s ? l = t : (l = {}, r.length && r.forEach(
    (u) => Mi(l, u, o, !0)
  ), Mi(l, t, o)), at(t) && i.set(t, l), l;
}
function Mi(e, t, n, s = !1) {
  const { mixins: r, extends: i } = t;
  i && Mi(e, i, n, !0), r && r.forEach(
    (o) => Mi(e, o, n, !0)
  );
  for (const o in t)
    if (!(s && o === "expose")) {
      const a = Jd[o] || n && n[o];
      e[o] = a ? a(e[o], t[o]) : t[o];
    }
  return e;
}
const Jd = {
  data: xl,
  props: El,
  emits: El,
  // objects
  methods: Pr,
  computed: Pr,
  // lifecycle
  beforeCreate: Ft,
  created: Ft,
  beforeMount: Ft,
  mounted: Ft,
  beforeUpdate: Ft,
  updated: Ft,
  beforeDestroy: Ft,
  beforeUnmount: Ft,
  destroyed: Ft,
  unmounted: Ft,
  activated: Ft,
  deactivated: Ft,
  errorCaptured: Ft,
  serverPrefetch: Ft,
  // assets
  components: Pr,
  directives: Pr,
  // watch
  watch: eh,
  // provide / inject
  provide: xl,
  inject: Qd
};
function xl(e, t) {
  return t ? e ? function() {
    return Ot(
      xe(e) ? e.call(this, this) : e,
      xe(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function Qd(e, t) {
  return Pr(ta(e), ta(t));
}
function ta(e) {
  if (Te(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++)
      t[e[n]] = e[n];
    return t;
  }
  return e;
}
function Ft(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function Pr(e, t) {
  return e ? Ot(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function El(e, t) {
  return e ? Te(e) && Te(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : Ot(
    /* @__PURE__ */ Object.create(null),
    Al(e),
    Al(t ?? {})
  ) : t;
}
function eh(e, t) {
  if (!e) return t;
  if (!t) return e;
  const n = Ot(/* @__PURE__ */ Object.create(null), e);
  for (const s in t)
    n[s] = Ft(e[s], t[s]);
  return n;
}
function mu() {
  return {
    app: null,
    config: {
      isNativeTag: Vf,
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
    xe(s) || (s = Ot({}, s)), r != null && !at(r) && (r = null);
    const i = mu(), o = /* @__PURE__ */ new WeakSet(), a = [];
    let l = !1;
    const u = i.app = {
      _uid: th++,
      _component: s,
      _props: r,
      _container: null,
      _context: i,
      _instance: null,
      version: Fh,
      get config() {
        return i.config;
      },
      set config(c) {
      },
      use(c, ...b) {
        return o.has(c) || (c && xe(c.install) ? (o.add(c), c.install(u, ...b)) : xe(c) && (o.add(c), c(u, ...b))), u;
      },
      mixin(c) {
        return i.mixins.includes(c) || i.mixins.push(c), u;
      },
      component(c, b) {
        return b ? (i.components[c] = b, u) : i.components[c];
      },
      directive(c, b) {
        return b ? (i.directives[c] = b, u) : i.directives[c];
      },
      mount(c, b, w) {
        if (!l) {
          const I = u._ceVNode || En(s, r);
          return I.appContext = i, w === !0 ? w = "svg" : w === !1 && (w = void 0), e(I, c, w), l = !0, u._container = c, c.__vue_app__ = u, ro(I.component);
        }
      },
      onUnmount(c) {
        a.push(c);
      },
      unmount() {
        l && (Rn(
          a,
          u._instance,
          16
        ), e(null, u._container), delete u._container.__vue_app__);
      },
      provide(c, b) {
        return i.provides[c] = b, u;
      },
      runWithContext(c) {
        const b = rr;
        rr = u;
        try {
          return c();
        } finally {
          rr = b;
        }
      }
    };
    return u;
  };
}
let rr = null;
function sh(e, t) {
  if (Bt) {
    let n = Bt.provides;
    const s = Bt.parent && Bt.parent.provides;
    s === n && (n = Bt.provides = Object.create(s)), n[e] = t;
  }
}
function _i(e, t, n = !1) {
  const s = Oh();
  if (s || rr) {
    let r = rr ? rr._context.provides : s ? s.parent == null || s.ce ? s.vnode.appContext && s.vnode.appContext.provides : s.parent.provides : void 0;
    if (r && e in r)
      return r[e];
    if (arguments.length > 1)
      return n && xe(t) ? t.call(s && s.proxy) : t;
  }
}
const gu = {}, _u = () => Object.create(gu), yu = (e) => Object.getPrototypeOf(e) === gu;
function rh(e, t, n, s = !1) {
  const r = {}, i = _u();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), vu(e, t, r, i);
  for (const o in e.propsOptions[0])
    o in r || (r[o] = void 0);
  n ? e.props = s ? r : Td(r) : e.type.props ? e.props = r : e.props = i, e.attrs = i;
}
function ih(e, t, n, s) {
  const {
    props: r,
    attrs: i,
    vnode: { patchFlag: o }
  } = e, a = je(r), [l] = e.propsOptions;
  let u = !1;
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
        if (no(e.emitsOptions, w))
          continue;
        const I = t[w];
        if (l)
          if (We(i, w))
            I !== i[w] && (i[w] = I, u = !0);
          else {
            const O = ls(w);
            r[O] = na(
              l,
              a,
              O,
              I,
              e,
              !1
            );
          }
        else
          I !== i[w] && (i[w] = I, u = !0);
      }
    }
  } else {
    vu(e, t, r, i) && (u = !0);
    let c;
    for (const b in a)
      (!t || // for camelCase
      !We(t, b) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((c = ds(b)) === b || !We(t, c))) && (l ? n && // for camelCase
      (n[b] !== void 0 || // for kebab-case
      n[c] !== void 0) && (r[b] = na(
        l,
        a,
        b,
        void 0,
        e,
        !0
      )) : delete r[b]);
    if (i !== a)
      for (const b in i)
        (!t || !We(t, b)) && (delete i[b], u = !0);
  }
  u && Fn(e.attrs, "set", "");
}
function vu(e, t, n, s) {
  const [r, i] = e.propsOptions;
  let o = !1, a;
  if (t)
    for (let l in t) {
      if ($r(l))
        continue;
      const u = t[l];
      let c;
      r && We(r, c = ls(l)) ? !i || !i.includes(c) ? n[c] = u : (a || (a = {}))[c] = u : no(e.emitsOptions, l) || (!(l in s) || u !== s[l]) && (s[l] = u, o = !0);
    }
  if (i) {
    const l = je(n), u = a || Qe;
    for (let c = 0; c < i.length; c++) {
      const b = i[c];
      n[b] = na(
        r,
        l,
        b,
        u[b],
        e,
        !We(u, b)
      );
    }
  }
  return o;
}
function na(e, t, n, s, r, i) {
  const o = e[n];
  if (o != null) {
    const a = We(o, "default");
    if (a && s === void 0) {
      const l = o.default;
      if (o.type !== Function && !o.skipFactory && xe(l)) {
        const { propsDefaults: u } = r;
        if (n in u)
          s = u[n];
        else {
          const c = ei(r);
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
    ] && (s === "" || s === ds(n)) && (s = !0));
  }
  return s;
}
const oh = /* @__PURE__ */ new WeakMap();
function bu(e, t, n = !1) {
  const s = n ? oh : t.propsCache, r = s.get(e);
  if (r)
    return r;
  const i = e.props, o = {}, a = [];
  let l = !1;
  if (!xe(e)) {
    const c = (b) => {
      l = !0;
      const [w, I] = bu(b, t, !0);
      Ot(o, w), I && a.push(...I);
    };
    !n && t.mixins.length && t.mixins.forEach(c), e.extends && c(e.extends), e.mixins && e.mixins.forEach(c);
  }
  if (!i && !l)
    return at(e) && s.set(e, er), er;
  if (Te(i))
    for (let c = 0; c < i.length; c++) {
      const b = ls(i[c]);
      Cl(b) && (o[b] = Qe);
    }
  else if (i)
    for (const c in i) {
      const b = ls(c);
      if (Cl(b)) {
        const w = i[c], I = o[b] = Te(w) || xe(w) ? { type: w } : Ot({}, w), O = I.type;
        let j = !1, ce = !0;
        if (Te(O))
          for (let R = 0; R < O.length; ++R) {
            const ue = O[R], me = xe(ue) && ue.name;
            if (me === "Boolean") {
              j = !0;
              break;
            } else me === "String" && (ce = !1);
          }
        else
          j = xe(O) && O.name === "Boolean";
        I[
          0
          /* shouldCast */
        ] = j, I[
          1
          /* shouldCastTrue */
        ] = ce, (j || We(I, "default")) && a.push(b);
      }
    }
  const u = [o, a];
  return at(e) && s.set(e, u), u;
}
function Cl(e) {
  return e[0] !== "$" && !$r(e);
}
const Ra = (e) => e === "_" || e === "__" || e === "_ctx" || e === "$stable", Ia = (e) => Te(e) ? e.map(Sn) : [Sn(e)], ah = (e, t, n) => {
  if (t._n)
    return t;
  const s = Md((...r) => Ia(t(...r)), n);
  return s._c = !1, s;
}, wu = (e, t, n) => {
  const s = e._ctx;
  for (const r in e) {
    if (Ra(r)) continue;
    const i = e[r];
    if (xe(i))
      t[r] = ah(r, i, s);
    else if (i != null) {
      const o = Ia(i);
      t[r] = () => o;
    }
  }
}, ku = (e, t) => {
  const n = Ia(t);
  e.slots.default = () => n;
}, Tu = (e, t, n) => {
  for (const s in t)
    (n || !Ra(s)) && (e[s] = t[s]);
}, lh = (e, t, n) => {
  const s = e.slots = _u();
  if (e.vnode.shapeFlag & 32) {
    const r = t.__;
    r && Ko(s, "__", r, !0);
    const i = t._;
    i ? (Tu(s, t, n), n && Ko(s, "_", i, !0)) : wu(t, s);
  } else t && ku(e, t);
}, ch = (e, t, n) => {
  const { vnode: s, slots: r } = e;
  let i = !0, o = Qe;
  if (s.shapeFlag & 32) {
    const a = t._;
    a ? n && a === 1 ? i = !1 : Tu(r, t, n) : (i = !t.$stable, wu(t, r)), o = t;
  } else t && (ku(e, t), o = { default: 1 });
  if (i)
    for (const a in r)
      !Ra(a) && o[a] == null && delete r[a];
}, en = Th;
function uh(e) {
  return fh(e);
}
function fh(e, t) {
  const n = Yi();
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
    parentNode: b,
    nextSibling: w,
    setScopeId: I = xn,
    insertStaticContent: O
  } = e, j = (_, v, L, D = null, B = null, M = null, X = void 0, K = null, G = !!v.dynamicChildren) => {
    if (_ === v)
      return;
    _ && !Sr(_, v) && (D = zt(_), ze(_, B, M, !0), _ = null), v.patchFlag === -2 && (G = !1, v.dynamicChildren = null);
    const { type: F, ref: se, shapeFlag: Y } = v;
    switch (F) {
      case so:
        ce(_, v, L, D);
        break;
      case us:
        R(_, v, L, D);
        break;
      case yi:
        _ == null && ue(v, L, D, X);
        break;
      case Oe:
        Ae(
          _,
          v,
          L,
          D,
          B,
          M,
          X,
          K,
          G
        );
        break;
      default:
        Y & 1 ? P(
          _,
          v,
          L,
          D,
          B,
          M,
          X,
          K,
          G
        ) : Y & 6 ? Ve(
          _,
          v,
          L,
          D,
          B,
          M,
          X,
          K,
          G
        ) : (Y & 64 || Y & 128) && F.process(
          _,
          v,
          L,
          D,
          B,
          M,
          X,
          K,
          G,
          Nt
        );
    }
    se != null && B ? zr(se, _ && _.ref, M, v || _, !v) : se == null && _ && _.ref != null && zr(_.ref, null, M, _, !0);
  }, ce = (_, v, L, D) => {
    if (_ == null)
      s(
        v.el = a(v.children),
        L,
        D
      );
    else {
      const B = v.el = _.el;
      v.children !== _.children && u(B, v.children);
    }
  }, R = (_, v, L, D) => {
    _ == null ? s(
      v.el = l(v.children || ""),
      L,
      D
    ) : v.el = _.el;
  }, ue = (_, v, L, D) => {
    [_.el, _.anchor] = O(
      _.children,
      v,
      L,
      D,
      _.el,
      _.anchor
    );
  }, me = ({ el: _, anchor: v }, L, D) => {
    let B;
    for (; _ && _ !== v; )
      B = w(_), s(_, L, D), _ = B;
    s(v, L, D);
  }, C = ({ el: _, anchor: v }) => {
    let L;
    for (; _ && _ !== v; )
      L = w(_), r(_), _ = L;
    r(v);
  }, P = (_, v, L, D, B, M, X, K, G) => {
    v.type === "svg" ? X = "svg" : v.type === "math" && (X = "mathml"), _ == null ? S(
      v,
      L,
      D,
      B,
      M,
      X,
      K,
      G
    ) : he(
      _,
      v,
      B,
      M,
      X,
      K,
      G
    );
  }, S = (_, v, L, D, B, M, X, K) => {
    let G, F;
    const { props: se, shapeFlag: Y, transition: te, dirs: de } = _;
    if (G = _.el = o(
      _.type,
      M,
      se && se.is,
      se
    ), Y & 8 ? c(G, _.children) : Y & 16 && ne(
      _.children,
      G,
      null,
      D,
      B,
      Ro(_, M),
      X,
      K
    ), de && ws(_, null, D, "created"), q(G, _, _.scopeId, X, D), se) {
      for (const be in se)
        be !== "value" && !$r(be) && i(G, be, null, se[be], M, D);
      "value" in se && i(G, "value", null, se.value, M), (F = se.onVnodeBeforeMount) && kn(F, D, _);
    }
    de && ws(_, null, D, "beforeMount");
    const _e = dh(B, te);
    _e && te.beforeEnter(G), s(G, v, L), ((F = se && se.onVnodeMounted) || _e || de) && en(() => {
      F && kn(F, D, _), _e && te.enter(G), de && ws(_, null, D, "mounted");
    }, B);
  }, q = (_, v, L, D, B) => {
    if (L && I(_, L), D)
      for (let M = 0; M < D.length; M++)
        I(_, D[M]);
    if (B) {
      let M = B.subTree;
      if (v === M || Ru(M.type) && (M.ssContent === v || M.ssFallback === v)) {
        const X = B.vnode;
        q(
          _,
          X,
          X.scopeId,
          X.slotScopeIds,
          B.parent
        );
      }
    }
  }, ne = (_, v, L, D, B, M, X, K, G = 0) => {
    for (let F = G; F < _.length; F++) {
      const se = _[F] = K ? ss(_[F]) : Sn(_[F]);
      j(
        null,
        se,
        v,
        L,
        D,
        B,
        M,
        X,
        K
      );
    }
  }, he = (_, v, L, D, B, M, X) => {
    const K = v.el = _.el;
    let { patchFlag: G, dynamicChildren: F, dirs: se } = v;
    G |= _.patchFlag & 16;
    const Y = _.props || Qe, te = v.props || Qe;
    let de;
    if (L && ks(L, !1), (de = te.onVnodeBeforeUpdate) && kn(de, L, v, _), se && ws(v, _, L, "beforeUpdate"), L && ks(L, !0), (Y.innerHTML && te.innerHTML == null || Y.textContent && te.textContent == null) && c(K, ""), F ? pe(
      _.dynamicChildren,
      F,
      K,
      L,
      D,
      Ro(v, B),
      M
    ) : X || ge(
      _,
      v,
      K,
      null,
      L,
      D,
      Ro(v, B),
      M,
      !1
    ), G > 0) {
      if (G & 16)
        Le(K, Y, te, L, B);
      else if (G & 2 && Y.class !== te.class && i(K, "class", null, te.class, B), G & 4 && i(K, "style", Y.style, te.style, B), G & 8) {
        const _e = v.dynamicProps;
        for (let be = 0; be < _e.length; be++) {
          const ke = _e[be], Be = Y[ke], U = te[ke];
          (U !== Be || ke === "value") && i(K, ke, Be, U, B, L);
        }
      }
      G & 1 && _.children !== v.children && c(K, v.children);
    } else !X && F == null && Le(K, Y, te, L, B);
    ((de = te.onVnodeUpdated) || se) && en(() => {
      de && kn(de, L, v, _), se && ws(v, _, L, "updated");
    }, D);
  }, pe = (_, v, L, D, B, M, X) => {
    for (let K = 0; K < v.length; K++) {
      const G = _[K], F = v[K], se = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        G.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (G.type === Oe || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !Sr(G, F) || // - In the case of a component, it could contain anything.
        G.shapeFlag & 198) ? b(G.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          L
        )
      );
      j(
        G,
        F,
        se,
        null,
        D,
        B,
        M,
        X,
        !0
      );
    }
  }, Le = (_, v, L, D, B) => {
    if (v !== L) {
      if (v !== Qe)
        for (const M in v)
          !$r(M) && !(M in L) && i(
            _,
            M,
            v[M],
            null,
            B,
            D
          );
      for (const M in L) {
        if ($r(M)) continue;
        const X = L[M], K = v[M];
        X !== K && M !== "value" && i(_, M, K, X, B, D);
      }
      "value" in L && i(_, "value", v.value, L.value, B);
    }
  }, Ae = (_, v, L, D, B, M, X, K, G) => {
    const F = v.el = _ ? _.el : a(""), se = v.anchor = _ ? _.anchor : a("");
    let { patchFlag: Y, dynamicChildren: te, slotScopeIds: de } = v;
    de && (K = K ? K.concat(de) : de), _ == null ? (s(F, L, D), s(se, L, D), ne(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      v.children || [],
      L,
      se,
      B,
      M,
      X,
      K,
      G
    )) : Y > 0 && Y & 64 && te && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    _.dynamicChildren ? (pe(
      _.dynamicChildren,
      te,
      L,
      B,
      M,
      X,
      K
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (v.key != null || B && v === B.subTree) && Au(
      _,
      v,
      !0
      /* shallow */
    )) : ge(
      _,
      v,
      L,
      se,
      B,
      M,
      X,
      K,
      G
    );
  }, Ve = (_, v, L, D, B, M, X, K, G) => {
    v.slotScopeIds = K, _ == null ? v.shapeFlag & 512 ? B.ctx.activate(
      v,
      L,
      D,
      X,
      G
    ) : $e(
      v,
      L,
      D,
      B,
      M,
      X,
      G
    ) : et(_, v, G);
  }, $e = (_, v, L, D, B, M, X) => {
    const K = _.component = Ih(
      _,
      D,
      B
    );
    if (fu(_) && (K.ctx.renderer = Nt), Lh(K, !1, X), K.asyncDep) {
      if (B && B.registerDep(K, fe, X), !_.el) {
        const G = K.subTree = En(us);
        R(null, G, v, L), _.placeholder = G.el;
      }
    } else
      fe(
        K,
        _,
        v,
        L,
        B,
        M,
        X
      );
  }, et = (_, v, L) => {
    const D = v.component = _.component;
    if (wh(_, v, L))
      if (D.asyncDep && !D.asyncResolved) {
        we(D, v, L);
        return;
      } else
        D.next = v, D.update();
    else
      v.el = _.el, D.vnode = v;
  }, fe = (_, v, L, D, B, M, X) => {
    const K = () => {
      if (_.isMounted) {
        let { next: Y, bu: te, u: de, parent: _e, vnode: be } = _;
        {
          const f = Su(_);
          if (f) {
            Y && (Y.el = be.el, we(_, Y, X)), f.asyncDep.then(() => {
              _.isUnmounted || K();
            });
            return;
          }
        }
        let ke = Y, Be;
        ks(_, !1), Y ? (Y.el = be.el, we(_, Y, X)) : Y = be, te && gi(te), (Be = Y.props && Y.props.onVnodeBeforeUpdate) && kn(Be, _e, Y, be), ks(_, !0);
        const U = Il(_), z = _.subTree;
        _.subTree = U, j(
          z,
          U,
          // parent may have changed if it's in a teleport
          b(z.el),
          // anchor may have changed if it's in a fragment
          zt(z),
          _,
          B,
          M
        ), Y.el = U.el, ke === null && kh(_, U.el), de && en(de, B), (Be = Y.props && Y.props.onVnodeUpdated) && en(
          () => kn(Be, _e, Y, be),
          B
        );
      } else {
        let Y;
        const { el: te, props: de } = v, { bm: _e, m: be, parent: ke, root: Be, type: U } = _, z = Hr(v);
        ks(_, !1), _e && gi(_e), !z && (Y = de && de.onVnodeBeforeMount) && kn(Y, ke, v), ks(_, !0);
        {
          Be.ce && // @ts-expect-error _def is private
          Be.ce._def.shadowRoot !== !1 && Be.ce._injectChildStyle(U);
          const f = _.subTree = Il(_);
          j(
            null,
            f,
            L,
            D,
            _,
            B,
            M
          ), v.el = f.el;
        }
        if (be && en(be, B), !z && (Y = de && de.onVnodeMounted)) {
          const f = v;
          en(
            () => kn(Y, ke, f),
            B
          );
        }
        (v.shapeFlag & 256 || ke && Hr(ke.vnode) && ke.vnode.shapeFlag & 256) && _.a && en(_.a, B), _.isMounted = !0, v = L = D = null;
      }
    };
    _.scope.on();
    const G = _.effect = new jc(K);
    _.scope.off();
    const F = _.update = G.run.bind(G), se = _.job = G.runIfDirty.bind(G);
    se.i = _, se.id = _.uid, G.scheduler = () => Ea(se), ks(_, !0), F();
  }, we = (_, v, L) => {
    v.component = _;
    const D = _.vnode.props;
    _.vnode = v, _.next = null, ih(_, v.props, D, L), ch(_, v.children, L), zn(), Tl(_), Hn();
  }, ge = (_, v, L, D, B, M, X, K, G = !1) => {
    const F = _ && _.children, se = _ ? _.shapeFlag : 0, Y = v.children, { patchFlag: te, shapeFlag: de } = v;
    if (te > 0) {
      if (te & 128) {
        Xe(
          F,
          Y,
          L,
          D,
          B,
          M,
          X,
          K,
          G
        );
        return;
      } else if (te & 256) {
        Ye(
          F,
          Y,
          L,
          D,
          B,
          M,
          X,
          K,
          G
        );
        return;
      }
    }
    de & 8 ? (se & 16 && vt(F, B, M), Y !== F && c(L, Y)) : se & 16 ? de & 16 ? Xe(
      F,
      Y,
      L,
      D,
      B,
      M,
      X,
      K,
      G
    ) : vt(F, B, M, !0) : (se & 8 && c(L, ""), de & 16 && ne(
      Y,
      L,
      D,
      B,
      M,
      X,
      K,
      G
    ));
  }, Ye = (_, v, L, D, B, M, X, K, G) => {
    _ = _ || er, v = v || er;
    const F = _.length, se = v.length, Y = Math.min(F, se);
    let te;
    for (te = 0; te < Y; te++) {
      const de = v[te] = G ? ss(v[te]) : Sn(v[te]);
      j(
        _[te],
        de,
        L,
        null,
        B,
        M,
        X,
        K,
        G
      );
    }
    F > se ? vt(
      _,
      B,
      M,
      !0,
      !1,
      Y
    ) : ne(
      v,
      L,
      D,
      B,
      M,
      X,
      K,
      G,
      Y
    );
  }, Xe = (_, v, L, D, B, M, X, K, G) => {
    let F = 0;
    const se = v.length;
    let Y = _.length - 1, te = se - 1;
    for (; F <= Y && F <= te; ) {
      const de = _[F], _e = v[F] = G ? ss(v[F]) : Sn(v[F]);
      if (Sr(de, _e))
        j(
          de,
          _e,
          L,
          null,
          B,
          M,
          X,
          K,
          G
        );
      else
        break;
      F++;
    }
    for (; F <= Y && F <= te; ) {
      const de = _[Y], _e = v[te] = G ? ss(v[te]) : Sn(v[te]);
      if (Sr(de, _e))
        j(
          de,
          _e,
          L,
          null,
          B,
          M,
          X,
          K,
          G
        );
      else
        break;
      Y--, te--;
    }
    if (F > Y) {
      if (F <= te) {
        const de = te + 1, _e = de < se ? v[de].el : D;
        for (; F <= te; )
          j(
            null,
            v[F] = G ? ss(v[F]) : Sn(v[F]),
            L,
            _e,
            B,
            M,
            X,
            K,
            G
          ), F++;
      }
    } else if (F > te)
      for (; F <= Y; )
        ze(_[F], B, M, !0), F++;
    else {
      const de = F, _e = F, be = /* @__PURE__ */ new Map();
      for (F = _e; F <= te; F++) {
        const E = v[F] = G ? ss(v[F]) : Sn(v[F]);
        E.key != null && be.set(E.key, F);
      }
      let ke, Be = 0;
      const U = te - _e + 1;
      let z = !1, f = 0;
      const y = new Array(U);
      for (F = 0; F < U; F++) y[F] = 0;
      for (F = de; F <= Y; F++) {
        const E = _[F];
        if (Be >= U) {
          ze(E, B, M, !0);
          continue;
        }
        let W;
        if (E.key != null)
          W = be.get(E.key);
        else
          for (ke = _e; ke <= te; ke++)
            if (y[ke - _e] === 0 && Sr(E, v[ke])) {
              W = ke;
              break;
            }
        W === void 0 ? ze(E, B, M, !0) : (y[W - _e] = F + 1, W >= f ? f = W : z = !0, j(
          E,
          v[W],
          L,
          null,
          B,
          M,
          X,
          K,
          G
        ), Be++);
      }
      const N = z ? hh(y) : er;
      for (ke = N.length - 1, F = U - 1; F >= 0; F--) {
        const E = _e + F, W = v[E], Q = v[E + 1], ie = E + 1 < se ? (
          // #13559, fallback to el placeholder for unresolved async component
          Q.el || Q.placeholder
        ) : D;
        y[F] === 0 ? j(
          null,
          W,
          L,
          ie,
          B,
          M,
          X,
          K,
          G
        ) : z && (ke < 0 || F !== N[ke] ? rt(W, L, ie, 2) : ke--);
      }
    }
  }, rt = (_, v, L, D, B = null) => {
    const { el: M, type: X, transition: K, children: G, shapeFlag: F } = _;
    if (F & 6) {
      rt(_.component.subTree, v, L, D);
      return;
    }
    if (F & 128) {
      _.suspense.move(v, L, D);
      return;
    }
    if (F & 64) {
      X.move(_, v, L, Nt);
      return;
    }
    if (X === Oe) {
      s(M, v, L);
      for (let Y = 0; Y < G.length; Y++)
        rt(G[Y], v, L, D);
      s(_.anchor, v, L);
      return;
    }
    if (X === yi) {
      me(_, v, L);
      return;
    }
    if (D !== 2 && F & 1 && K)
      if (D === 0)
        K.beforeEnter(M), s(M, v, L), en(() => K.enter(M), B);
      else {
        const { leave: Y, delayLeave: te, afterLeave: de } = K, _e = () => {
          _.ctx.isUnmounted ? r(M) : s(M, v, L);
        }, be = () => {
          Y(M, () => {
            _e(), de && de();
          });
        };
        te ? te(M, _e, be) : be();
      }
    else
      s(M, v, L);
  }, ze = (_, v, L, D = !1, B = !1) => {
    const {
      type: M,
      props: X,
      ref: K,
      children: G,
      dynamicChildren: F,
      shapeFlag: se,
      patchFlag: Y,
      dirs: te,
      cacheIndex: de
    } = _;
    if (Y === -2 && (B = !1), K != null && (zn(), zr(K, null, L, _, !0), Hn()), de != null && (v.renderCache[de] = void 0), se & 256) {
      v.ctx.deactivate(_);
      return;
    }
    const _e = se & 1 && te, be = !Hr(_);
    let ke;
    if (be && (ke = X && X.onVnodeBeforeUnmount) && kn(ke, v, _), se & 6)
      De(_.component, L, D);
    else {
      if (se & 128) {
        _.suspense.unmount(L, D);
        return;
      }
      _e && ws(_, null, v, "beforeUnmount"), se & 64 ? _.type.remove(
        _,
        v,
        L,
        Nt,
        D
      ) : F && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !F.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (M !== Oe || Y > 0 && Y & 64) ? vt(
        F,
        v,
        L,
        !1,
        !0
      ) : (M === Oe && Y & 384 || !B && se & 16) && vt(G, v, L), D && Lt(_);
    }
    (be && (ke = X && X.onVnodeUnmounted) || _e) && en(() => {
      ke && kn(ke, v, _), _e && ws(_, null, v, "unmounted");
    }, L);
  }, Lt = (_) => {
    const { type: v, el: L, anchor: D, transition: B } = _;
    if (v === Oe) {
      vn(L, D);
      return;
    }
    if (v === yi) {
      C(_);
      return;
    }
    const M = () => {
      r(L), B && !B.persisted && B.afterLeave && B.afterLeave();
    };
    if (_.shapeFlag & 1 && B && !B.persisted) {
      const { leave: X, delayLeave: K } = B, G = () => X(L, M);
      K ? K(_.el, M, G) : G();
    } else
      M();
  }, vn = (_, v) => {
    let L;
    for (; _ !== v; )
      L = w(_), r(_), _ = L;
    r(v);
  }, De = (_, v, L) => {
    const {
      bum: D,
      scope: B,
      job: M,
      subTree: X,
      um: K,
      m: G,
      a: F,
      parent: se,
      slots: { __: Y }
    } = _;
    Rl(G), Rl(F), D && gi(D), se && Te(Y) && Y.forEach((te) => {
      se.renderCache[te] = void 0;
    }), B.stop(), M && (M.flags |= 8, ze(X, _, v, L)), K && en(K, v), en(() => {
      _.isUnmounted = !0;
    }, v), v && v.pendingBranch && !v.isUnmounted && _.asyncDep && !_.asyncResolved && _.suspenseId === v.pendingId && (v.deps--, v.deps === 0 && v.resolve());
  }, vt = (_, v, L, D = !1, B = !1, M = 0) => {
    for (let X = M; X < _.length; X++)
      ze(_[X], v, L, D, B);
  }, zt = (_) => {
    if (_.shapeFlag & 6)
      return zt(_.component.subTree);
    if (_.shapeFlag & 128)
      return _.suspense.next();
    const v = w(_.anchor || _.el), L = v && v[Dd];
    return L ? w(L) : v;
  };
  let qt = !1;
  const Vt = (_, v, L) => {
    _ == null ? v._vnode && ze(v._vnode, null, null, !0) : j(
      v._vnode || null,
      _,
      v,
      null,
      null,
      null,
      L
    ), v._vnode = _, qt || (qt = !0, Tl(), au(), qt = !1);
  }, Nt = {
    p: j,
    um: ze,
    m: rt,
    r: Lt,
    mt: $e,
    mc: ne,
    pc: ge,
    pbc: pe,
    n: zt,
    o: e
  };
  return {
    render: Vt,
    hydrate: void 0,
    createApp: nh(Vt)
  };
}
function Ro({ type: e, props: t }, n) {
  return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function ks({ effect: e, job: t }, n) {
  n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function dh(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function Au(e, t, n = !1) {
  const s = e.children, r = t.children;
  if (Te(s) && Te(r))
    for (let i = 0; i < s.length; i++) {
      const o = s[i];
      let a = r[i];
      a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = r[i] = ss(r[i]), a.el = o.el), !n && a.patchFlag !== -2 && Au(o, a)), a.type === so && (a.el = o.el), a.type === us && !a.el && (a.el = o.el);
    }
}
function hh(e) {
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
function Su(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : Su(t);
}
function Rl(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
const ph = Symbol.for("v-scx"), mh = () => _i(ph);
function bt(e, t, n) {
  return xu(e, t, n);
}
function xu(e, t, n = Qe) {
  const { immediate: s, deep: r, flush: i, once: o } = n, a = Ot({}, n), l = t && s || !t && i !== "post";
  let u;
  if (Zr) {
    if (i === "sync") {
      const I = mh();
      u = I.__watcherHandles || (I.__watcherHandles = []);
    } else if (!l) {
      const I = () => {
      };
      return I.stop = xn, I.resume = xn, I.pause = xn, I;
    }
  }
  const c = Bt;
  a.call = (I, O, j) => Rn(I, c, O, j);
  let b = !1;
  i === "post" ? a.scheduler = (I) => {
    en(I, c && c.suspense);
  } : i !== "sync" && (b = !0, a.scheduler = (I, O) => {
    O ? I() : Ea(I);
  }), a.augmentJob = (I) => {
    t && (I.flags |= 4), b && (I.flags |= 2, c && (I.id = c.uid, I.i = c));
  };
  const w = Od(e, t, a);
  return Zr && (u ? u.push(w) : l && w()), w;
}
function gh(e, t, n) {
  const s = this.proxy, r = pt(e) ? e.includes(".") ? Eu(s, e) : () => s[e] : e.bind(s, s);
  let i;
  xe(t) ? i = t : (i = t.handler, n = t);
  const o = ei(this), a = xu(r, i.bind(s), n);
  return o(), a;
}
function Eu(e, t) {
  const n = t.split(".");
  return () => {
    let s = e;
    for (let r = 0; r < n.length && s; r++)
      s = s[n[r]];
    return s;
  };
}
const _h = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${ls(t)}Modifiers`] || e[`${ds(t)}Modifiers`];
function yh(e, t, ...n) {
  if (e.isUnmounted) return;
  const s = e.vnode.props || Qe;
  let r = n;
  const i = t.startsWith("update:"), o = i && _h(s, t.slice(7));
  o && (o.trim && (r = n.map((c) => pt(c) ? c.trim() : c)), o.number && (r = n.map(Go)));
  let a, l = s[a = To(t)] || // also try camelCase event handler (#2249)
  s[a = To(ls(t))];
  !l && i && (l = s[a = To(ds(t))]), l && Rn(
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
    e.emitted[a] = !0, Rn(
      u,
      e,
      6,
      r
    );
  }
}
function Cu(e, t, n = !1) {
  const s = t.emitsCache, r = s.get(e);
  if (r !== void 0)
    return r;
  const i = e.emits;
  let o = {}, a = !1;
  if (!xe(e)) {
    const l = (u) => {
      const c = Cu(u, t, !0);
      c && (a = !0, Ot(o, c));
    };
    !n && t.mixins.length && t.mixins.forEach(l), e.extends && l(e.extends), e.mixins && e.mixins.forEach(l);
  }
  return !i && !a ? (at(e) && s.set(e, null), null) : (Te(i) ? i.forEach((l) => o[l] = null) : Ot(o, i), at(e) && s.set(e, o), o);
}
function no(e, t) {
  return !e || !Vi(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), We(e, t[0].toLowerCase() + t.slice(1)) || We(e, ds(t)) || We(e, t));
}
function Il(e) {
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
    props: b,
    data: w,
    setupState: I,
    ctx: O,
    inheritAttrs: j
  } = e, ce = Pi(e);
  let R, ue;
  try {
    if (n.shapeFlag & 4) {
      const C = r || s, P = C;
      R = Sn(
        u.call(
          P,
          C,
          c,
          b,
          I,
          w,
          O
        )
      ), ue = a;
    } else {
      const C = t;
      R = Sn(
        C.length > 1 ? C(
          b,
          { attrs: a, slots: o, emit: l }
        ) : C(
          b,
          null
        )
      ), ue = t.props ? a : vh(a);
    }
  } catch (C) {
    Wr.length = 0, Ji(C, e, 1), R = En(us);
  }
  let me = R;
  if (ue && j !== !1) {
    const C = Object.keys(ue), { shapeFlag: P } = me;
    C.length && P & 7 && (i && C.some(_a) && (ue = bh(
      ue,
      i
    )), me = lr(me, ue, !1, !0));
  }
  return n.dirs && (me = lr(me, null, !1, !0), me.dirs = me.dirs ? me.dirs.concat(n.dirs) : n.dirs), n.transition && Ca(me, n.transition), R = me, Pi(ce), R;
}
const vh = (e) => {
  let t;
  for (const n in e)
    (n === "class" || n === "style" || Vi(n)) && ((t || (t = {}))[n] = e[n]);
  return t;
}, bh = (e, t) => {
  const n = {};
  for (const s in e)
    (!_a(s) || !(s.slice(9) in t)) && (n[s] = e[s]);
  return n;
};
function wh(e, t, n) {
  const { props: s, children: r, component: i } = e, { props: o, children: a, patchFlag: l } = t, u = i.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (n && l >= 0) {
    if (l & 1024)
      return !0;
    if (l & 16)
      return s ? Ol(s, o, u) : !!o;
    if (l & 8) {
      const c = t.dynamicProps;
      for (let b = 0; b < c.length; b++) {
        const w = c[b];
        if (o[w] !== s[w] && !no(u, w))
          return !0;
      }
    }
  } else
    return (r || a) && (!a || !a.$stable) ? !0 : s === o ? !1 : s ? o ? Ol(s, o, u) : !0 : !!o;
  return !1;
}
function Ol(e, t, n) {
  const s = Object.keys(t);
  if (s.length !== Object.keys(e).length)
    return !0;
  for (let r = 0; r < s.length; r++) {
    const i = s[r];
    if (t[i] !== e[i] && !no(n, i))
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
const Ru = (e) => e.__isSuspense;
function Th(e, t) {
  t && t.pendingBranch ? Te(e) ? t.effects.push(...e) : t.effects.push(e) : Pd(e);
}
const Oe = Symbol.for("v-fgt"), so = Symbol.for("v-txt"), us = Symbol.for("v-cmt"), yi = Symbol.for("v-stc"), Wr = [];
let nn = null;
function k(e = !1) {
  Wr.push(nn = e ? null : []);
}
function Ah() {
  Wr.pop(), nn = Wr[Wr.length - 1] || null;
}
let Xr = 1;
function Ll(e, t = !1) {
  Xr += e, e < 0 && nn && t && (nn.hasOnce = !0);
}
function Iu(e) {
  return e.dynamicChildren = Xr > 0 ? nn || er : null, Ah(), Xr > 0 && nn && nn.push(e), e;
}
function A(e, t, n, s, r, i) {
  return Iu(
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
function ns(e, t, n, s, r) {
  return Iu(
    En(
      e,
      t,
      n,
      s,
      r,
      !0
    )
  );
}
function Ou(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function Sr(e, t) {
  return e.type === t.type && e.key === t.key;
}
const Lu = ({ key: e }) => e ?? null, vi = ({
  ref: e,
  ref_key: t,
  ref_for: n
}) => (typeof e == "number" && (e = "" + e), e != null ? pt(e) || It(e) || xe(e) ? { i: dn, r: e, k: t, f: !!n } : e : null);
function g(e, t = null, n = null, s = 0, r = null, i = e === Oe ? 0 : 1, o = !1, a = !1) {
  const l = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && Lu(t),
    ref: t && vi(t),
    scopeId: cu,
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
    ctx: dn
  };
  return a ? (Oa(l, n), i & 128 && e.normalize(l)) : n && (l.shapeFlag |= pt(n) ? 8 : 16), Xr > 0 && // avoid a block node from tracking itself
  !o && // has current parent block
  nn && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (l.patchFlag > 0 || i & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  l.patchFlag !== 32 && nn.push(l), l;
}
const En = Sh;
function Sh(e, t = null, n = null, s = 0, r = null, i = !1) {
  if ((!e || e === Gd) && (e = us), Ou(e)) {
    const a = lr(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return n && Oa(a, n), Xr > 0 && !i && nn && (a.shapeFlag & 6 ? nn[nn.indexOf(e)] = a : nn.push(a)), a.patchFlag = -2, a;
  }
  if (Dh(e) && (e = e.__vccOpts), t) {
    t = xh(t);
    let { class: a, style: l } = t;
    a && !pt(a) && (t.class = Pe(a)), at(l) && (xa(l) && !Te(l) && (l = Ot({}, l)), t.style = Ee(l));
  }
  const o = pt(e) ? 1 : Ru(e) ? 128 : Fd(e) ? 64 : at(e) ? 4 : xe(e) ? 2 : 0;
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
function xh(e) {
  return e ? xa(e) || yu(e) ? Ot({}, e) : e : null;
}
function lr(e, t, n = !1, s = !1) {
  const { props: r, ref: i, patchFlag: o, children: a, transition: l } = e, u = t ? Eh(r || {}, t) : r, c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: u,
    key: u && Lu(u),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && i ? Te(i) ? i.concat(vi(t)) : [i, vi(t)] : vi(t)
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
    patchFlag: t && e.type !== Oe ? o === -1 ? 16 : o | 16 : o,
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
    ssContent: e.ssContent && lr(e.ssContent),
    ssFallback: e.ssFallback && lr(e.ssFallback),
    placeholder: e.placeholder,
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce
  };
  return l && s && Ca(
    c,
    l.clone(c)
  ), c;
}
function Mn(e = " ", t = 0) {
  return En(so, null, e, t);
}
function Ts(e, t) {
  const n = En(yi, null, e);
  return n.staticCount = t, n;
}
function re(e = "", t = !1) {
  return t ? (k(), ns(us, null, e)) : En(us, null, e);
}
function Sn(e) {
  return e == null || typeof e == "boolean" ? En(us) : Te(e) ? En(
    Oe,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : Ou(e) ? ss(e) : En(so, null, String(e));
}
function ss(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : lr(e);
}
function Oa(e, t) {
  let n = 0;
  const { shapeFlag: s } = e;
  if (t == null)
    t = null;
  else if (Te(t))
    n = 16;
  else if (typeof t == "object")
    if (s & 65) {
      const r = t.default;
      r && (r._c && (r._d = !1), Oa(e, r()), r._c && (r._d = !0));
      return;
    } else {
      n = 32;
      const r = t._;
      !r && !yu(t) ? t._ctx = dn : r === 3 && dn && (dn.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else xe(t) ? (t = { default: t, _ctx: dn }, n = 32) : (t = String(t), s & 64 ? (n = 16, t = [Mn(t)]) : n = 8);
  e.children = t, e.shapeFlag |= n;
}
function Eh(...e) {
  const t = {};
  for (let n = 0; n < e.length; n++) {
    const s = e[n];
    for (const r in s)
      if (r === "class")
        t.class !== s.class && (t.class = Pe([t.class, s.class]));
      else if (r === "style")
        t.style = Ee([t.style, s.style]);
      else if (Vi(r)) {
        const i = t[r], o = s[r];
        o && i !== o && !(Te(i) && i.includes(o)) && (t[r] = i ? [].concat(i, o) : o);
      } else r !== "" && (t[r] = s[r]);
  }
  return t;
}
function kn(e, t, n, s = null) {
  Rn(e, t, 7, [
    n,
    s
  ]);
}
const Ch = mu();
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
    scope: new sd(
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
    propsOptions: bu(s, r),
    emitsOptions: Cu(s, r),
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
  return i.ctx = { _: i }, i.root = t ? t.root : i, i.emit = yh.bind(null, i), e.ce && e.ce(i), i;
}
let Bt = null;
const Oh = () => Bt || dn;
let Di, sa;
{
  const e = Yi(), t = (n, s) => {
    let r;
    return (r = e[n]) || (r = e[n] = []), r.push(s), (i) => {
      r.length > 1 ? r.forEach((o) => o(i)) : r[0](i);
    };
  };
  Di = t(
    "__VUE_INSTANCE_SETTERS__",
    (n) => Bt = n
  ), sa = t(
    "__VUE_SSR_SETTERS__",
    (n) => Zr = n
  );
}
const ei = (e) => {
  const t = Bt;
  return Di(e), e.scope.on(), () => {
    e.scope.off(), Di(t);
  };
}, Nl = () => {
  Bt && Bt.scope.off(), Di(null);
};
function Nu(e) {
  return e.vnode.shapeFlag & 4;
}
let Zr = !1;
function Lh(e, t = !1, n = !1) {
  t && sa(t);
  const { props: s, children: r } = e.vnode, i = Nu(e);
  rh(e, s, i, t), lh(e, r, n || t);
  const o = i ? Nh(e, t) : void 0;
  return t && sa(!1), o;
}
function Nh(e, t) {
  const n = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Yd);
  const { setup: s } = n;
  if (s) {
    zn();
    const r = e.setupContext = s.length > 1 ? Mh(e) : null, i = ei(e), o = Jr(
      s,
      e,
      0,
      [
        e.props,
        r
      ]
    ), a = Dc(o);
    if (Hn(), i(), (a || e.sp) && !Hr(e) && uu(e), a) {
      if (o.then(Nl, Nl), t)
        return o.then((l) => {
          Pl(e, l);
        }).catch((l) => {
          Ji(l, e, 0);
        });
      e.asyncDep = o;
    } else
      Pl(e, o);
  } else
    Pu(e);
}
function Pl(e, t, n) {
  xe(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : at(t) && (e.setupState = ru(t)), Pu(e);
}
function Pu(e, t, n) {
  const s = e.type;
  e.render || (e.render = s.render || xn);
  {
    const r = ei(e);
    zn();
    try {
      Xd(e);
    } finally {
      Hn(), r();
    }
  }
}
const Ph = {
  get(e, t) {
    return Rt(e, "get", ""), e[t];
  }
};
function Mh(e) {
  const t = (n) => {
    e.exposed = n || {};
  };
  return {
    attrs: new Proxy(e.attrs, Ph),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function ro(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(ru(Ad(e.exposed)), {
    get(t, n) {
      if (n in t)
        return t[n];
      if (n in jr)
        return jr[n](e);
    },
    has(t, n) {
      return n in t || n in jr;
    }
  })) : e.proxy;
}
function Dh(e) {
  return xe(e) && "__vccOpts" in e;
}
const le = (e, t) => Rd(e, t, Zr), Fh = "3.5.18";
/**
* @vue/runtime-dom v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let ra;
const Ml = typeof window < "u" && window.trustedTypes;
if (Ml)
  try {
    ra = /* @__PURE__ */ Ml.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const Mu = ra ? (e) => ra.createHTML(e) : (e) => e, $h = "http://www.w3.org/2000/svg", Bh = "http://www.w3.org/1998/Math/MathML", Dn = typeof document < "u" ? document : null, Dl = Dn && /* @__PURE__ */ Dn.createElement("template"), Uh = {
  insert: (e, t, n) => {
    t.insertBefore(e, n || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, n, s) => {
    const r = t === "svg" ? Dn.createElementNS($h, e) : t === "mathml" ? Dn.createElementNS(Bh, e) : n ? Dn.createElement(e, { is: n }) : Dn.createElement(e);
    return e === "select" && s && s.multiple != null && r.setAttribute("multiple", s.multiple), r;
  },
  createText: (e) => Dn.createTextNode(e),
  createComment: (e) => Dn.createComment(e),
  setText: (e, t) => {
    e.nodeValue = t;
  },
  setElementText: (e, t) => {
    e.textContent = t;
  },
  parentNode: (e) => e.parentNode,
  nextSibling: (e) => e.nextSibling,
  querySelector: (e) => Dn.querySelector(e),
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
      Dl.innerHTML = Mu(
        s === "svg" ? `<svg>${e}</svg>` : s === "mathml" ? `<math>${e}</math>` : e
      );
      const a = Dl.content;
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
const Fi = Symbol("_vod"), Du = Symbol("_vsh"), jh = {
  beforeMount(e, { value: t }, { transition: n }) {
    e[Fi] = e.style.display === "none" ? "" : e.style.display, n && t ? n.beforeEnter(e) : xr(e, t);
  },
  mounted(e, { value: t }, { transition: n }) {
    n && t && n.enter(e);
  },
  updated(e, { value: t, oldValue: n }, { transition: s }) {
    !t != !n && (s ? t ? (s.beforeEnter(e), xr(e, !0), s.enter(e)) : s.leave(e, () => {
      xr(e, !1);
    }) : xr(e, t));
  },
  beforeUnmount(e, { value: t }) {
    xr(e, t);
  }
};
function xr(e, t) {
  e.style.display = t ? e[Fi] : "none", e[Du] = !t;
}
const Wh = Symbol(""), qh = /(^|;)\s*display\s*:/;
function Vh(e, t, n) {
  const s = e.style, r = pt(n);
  let i = !1;
  if (n && !r) {
    if (t)
      if (pt(t))
        for (const o of t.split(";")) {
          const a = o.slice(0, o.indexOf(":")).trim();
          n[a] == null && bi(s, a, "");
        }
      else
        for (const o in t)
          n[o] == null && bi(s, o, "");
    for (const o in n)
      o === "display" && (i = !0), bi(s, o, n[o]);
  } else if (r) {
    if (t !== n) {
      const o = s[Wh];
      o && (n += ";" + o), s.cssText = n, i = qh.test(n);
    }
  } else t && e.removeAttribute("style");
  Fi in e && (e[Fi] = i ? s.display : "", e[Du] && (s.display = "none"));
}
const Fl = /\s*!important$/;
function bi(e, t, n) {
  if (Te(n))
    n.forEach((s) => bi(e, t, s));
  else if (n == null && (n = ""), t.startsWith("--"))
    e.setProperty(t, n);
  else {
    const s = Kh(e, t);
    Fl.test(n) ? e.setProperty(
      ds(s),
      n.replace(Fl, ""),
      "important"
    ) : e[s] = n;
  }
}
const $l = ["Webkit", "Moz", "ms"], Io = {};
function Kh(e, t) {
  const n = Io[t];
  if (n)
    return n;
  let s = ls(t);
  if (s !== "filter" && s in e)
    return Io[t] = s;
  s = Bc(s);
  for (let r = 0; r < $l.length; r++) {
    const i = $l[r] + s;
    if (i in e)
      return Io[t] = i;
  }
  return t;
}
const Bl = "http://www.w3.org/1999/xlink";
function Ul(e, t, n, s, r, i = nd(t)) {
  s && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(Bl, t.slice(6, t.length)) : e.setAttributeNS(Bl, t, n) : n == null || i && !Uc(n) ? e.removeAttribute(t) : e.setAttribute(
    t,
    i ? "" : fs(n) ? String(n) : n
  );
}
function zl(e, t, n, s, r) {
  if (t === "innerHTML" || t === "textContent") {
    n != null && (e[t] = t === "innerHTML" ? Mu(n) : n);
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
    a === "boolean" ? n = Uc(n) : n == null && a === "string" ? (n = "", o = !0) : a === "number" && (n = 0, o = !0);
  }
  try {
    e[t] = n;
  } catch {
  }
  o && e.removeAttribute(r || t);
}
function Js(e, t, n, s) {
  e.addEventListener(t, n, s);
}
function Gh(e, t, n, s) {
  e.removeEventListener(t, n, s);
}
const Hl = Symbol("_vei");
function Yh(e, t, n, s, r = null) {
  const i = e[Hl] || (e[Hl] = {}), o = i[t];
  if (s && o)
    o.value = s;
  else {
    const [a, l] = Xh(t);
    if (s) {
      const u = i[t] = Qh(
        s,
        r
      );
      Js(e, a, u, l);
    } else o && (Gh(e, a, o, l), i[t] = void 0);
  }
}
const jl = /(?:Once|Passive|Capture)$/;
function Xh(e) {
  let t;
  if (jl.test(e)) {
    t = {};
    let s;
    for (; s = e.match(jl); )
      e = e.slice(0, e.length - s[0].length), t[s[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : ds(e.slice(2)), t];
}
let Oo = 0;
const Zh = /* @__PURE__ */ Promise.resolve(), Jh = () => Oo || (Zh.then(() => Oo = 0), Oo = Date.now());
function Qh(e, t) {
  const n = (s) => {
    if (!s._vts)
      s._vts = Date.now();
    else if (s._vts <= n.attached)
      return;
    Rn(
      ep(s, n.value),
      t,
      5,
      [s]
    );
  };
  return n.value = e, n.attached = Jh(), n;
}
function ep(e, t) {
  if (Te(t)) {
    const n = e.stopImmediatePropagation;
    return e.stopImmediatePropagation = () => {
      n.call(e), e._stopped = !0;
    }, t.map(
      (s) => (r) => !r._stopped && s && s(r)
    );
  } else
    return t;
}
const Wl = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, tp = (e, t, n, s, r, i) => {
  const o = r === "svg";
  t === "class" ? Hh(e, s, o) : t === "style" ? Vh(e, n, s) : Vi(t) ? _a(t) || Yh(e, t, n, s, i) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : np(e, t, s, o)) ? (zl(e, t, s), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && Ul(e, t, s, o, i, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !pt(s)) ? zl(e, ls(t), s, i, t) : (t === "true-value" ? e._trueValue = s : t === "false-value" && (e._falseValue = s), Ul(e, t, s, o));
};
function np(e, t, n, s) {
  if (s)
    return !!(t === "innerHTML" || t === "textContent" || t in e && Wl(t) && xe(n));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const r = e.tagName;
    if (r === "IMG" || r === "VIDEO" || r === "CANVAS" || r === "SOURCE")
      return !1;
  }
  return Wl(t) && pt(n) ? !1 : t in e;
}
const ql = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return Te(t) ? (n) => gi(t, n) : t;
};
function sp(e) {
  e.target.composing = !0;
}
function Vl(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const Lo = Symbol("_assign"), As = {
  created(e, { modifiers: { lazy: t, trim: n, number: s } }, r) {
    e[Lo] = ql(r);
    const i = s || r.props && r.props.type === "number";
    Js(e, t ? "change" : "input", (o) => {
      if (o.target.composing) return;
      let a = e.value;
      n && (a = a.trim()), i && (a = Go(a)), e[Lo](a);
    }), n && Js(e, "change", () => {
      e.value = e.value.trim();
    }), t || (Js(e, "compositionstart", sp), Js(e, "compositionend", Vl), Js(e, "change", Vl));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t }) {
    e.value = t ?? "";
  },
  beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: s, trim: r, number: i } }, o) {
    if (e[Lo] = ql(o), e.composing) return;
    const a = (i || e.type === "number") && !/^0\d/.test(e.value) ? Go(e.value) : e.value, l = t ?? "";
    a !== l && (document.activeElement === e && e.type !== "range" && (s && t === n || r && e.value.trim() === l) || (e.value = l));
  }
}, rp = ["ctrl", "shift", "alt", "meta"], ip = {
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
  exact: (e, t) => rp.some((n) => e[`${n}Key`] && !t.includes(n))
}, Es = (e, t) => {
  const n = e._withMods || (e._withMods = {}), s = t.join(".");
  return n[s] || (n[s] = (r, ...i) => {
    for (let o = 0; o < t.length; o++) {
      const a = ip[t[o]];
      if (a && a(r, t)) return;
    }
    return e(r, ...i);
  });
}, op = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, wi = (e, t) => {
  const n = e._withKeys || (e._withKeys = {}), s = t.join(".");
  return n[s] || (n[s] = (r) => {
    if (!("key" in r))
      return;
    const i = ds(r.key);
    if (t.some(
      (o) => o === i || op[o] === i
    ))
      return e(r);
  });
}, ap = /* @__PURE__ */ Ot({ patchProp: tp }, Uh);
let Kl;
function lp() {
  return Kl || (Kl = uh(ap));
}
const cp = (...e) => {
  const t = lp().createApp(...e), { mount: n } = t;
  return t.mount = (s) => {
    const r = fp(s);
    if (!r) return;
    const i = t._component;
    !xe(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
    const o = n(r, !1, up(r));
    return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), o;
  }, t;
};
function up(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function fp(e) {
  return pt(e) ? document.querySelector(e) : e;
}
const Fu = /* @__PURE__ */ new Set(["customer_required", "token_invalid"]), ia = (e) => !!e && Fu.has(e), ir = (e) => {
  const t = e.replace("#", ""), n = parseInt(t.substr(0, 2), 16), s = parseInt(t.substr(2, 2), 16), r = parseInt(t.substr(4, 2), 16);
  return (n * 299 + s * 587 + r * 114) / 1e3 < 128;
}, dp = (e, t) => {
  const n = e.replace("#", ""), s = parseInt(n.substr(0, 2), 16), r = parseInt(n.substr(2, 2), 16), i = parseInt(n.substr(4, 2), 16), o = ir(e), a = o ? Math.min(255, s + t) : Math.max(0, s - t), l = o ? Math.min(255, r + t) : Math.max(0, r - t), u = o ? Math.min(255, i + t) : Math.max(0, i - t);
  return `#${a.toString(16).padStart(2, "0")}${l.toString(16).padStart(2, "0")}${u.toString(16).padStart(2, "0")}`;
}, Er = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e), hp = (e) => {
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
function La() {
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
var Ms = La();
function $u(e) {
  Ms = e;
}
var qr = { exec: () => null };
function qe(e, t = "") {
  let n = typeof e == "string" ? e : e.source;
  const s = {
    replace: (r, i) => {
      let o = typeof i == "string" ? i : i.source;
      return o = o.replace(Ut.caret, "$1"), n = n.replace(r, o), s;
    },
    getRegex: () => new RegExp(n, t)
  };
  return s;
}
var Ut = {
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
}, pp = /^(?:[ \t]*(?:\n|$))+/, mp = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/, gp = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, ti = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, _p = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, Na = /(?:[*+-]|\d{1,9}[.)])/, Bu = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/, Uu = qe(Bu).replace(/bull/g, Na).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(), yp = qe(Bu).replace(/bull/g, Na).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(), Pa = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/, vp = /^[^\n]+/, Ma = /(?!\s*\])(?:\\.|[^\[\]\\])+/, bp = qe(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", Ma).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), wp = qe(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, Na).getRegex(), io = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", Da = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, kp = qe(
  "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))",
  "i"
).replace("comment", Da).replace("tag", io).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), zu = qe(Pa).replace("hr", ti).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", io).getRegex(), Tp = qe(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", zu).getRegex(), Fa = {
  blockquote: Tp,
  code: mp,
  def: bp,
  fences: gp,
  heading: _p,
  hr: ti,
  html: kp,
  lheading: Uu,
  list: wp,
  newline: pp,
  paragraph: zu,
  table: qr,
  text: vp
}, Gl = qe(
  "^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"
).replace("hr", ti).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", io).getRegex(), Ap = {
  ...Fa,
  lheading: yp,
  table: Gl,
  paragraph: qe(Pa).replace("hr", ti).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", Gl).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", io).getRegex()
}, Sp = {
  ...Fa,
  html: qe(
    `^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`
  ).replace("comment", Da).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
  heading: /^(#{1,6})(.*)(?:\n+|$)/,
  fences: qr,
  // fences not supported
  lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  paragraph: qe(Pa).replace("hr", ti).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", Uu).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
}, xp = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, Ep = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, Hu = /^( {2,}|\\)\n(?!\s*$)/, Cp = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, oo = /[\p{P}\p{S}]/u, $a = /[\s\p{P}\p{S}]/u, ju = /[^\s\p{P}\p{S}]/u, Rp = qe(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, $a).getRegex(), Wu = /(?!~)[\p{P}\p{S}]/u, Ip = /(?!~)[\s\p{P}\p{S}]/u, Op = /(?:[^\s\p{P}\p{S}]|~)/u, Lp = /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g, qu = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/, Np = qe(qu, "u").replace(/punct/g, oo).getRegex(), Pp = qe(qu, "u").replace(/punct/g, Wu).getRegex(), Vu = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", Mp = qe(Vu, "gu").replace(/notPunctSpace/g, ju).replace(/punctSpace/g, $a).replace(/punct/g, oo).getRegex(), Dp = qe(Vu, "gu").replace(/notPunctSpace/g, Op).replace(/punctSpace/g, Ip).replace(/punct/g, Wu).getRegex(), Fp = qe(
  "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)",
  "gu"
).replace(/notPunctSpace/g, ju).replace(/punctSpace/g, $a).replace(/punct/g, oo).getRegex(), $p = qe(/\\(punct)/, "gu").replace(/punct/g, oo).getRegex(), Bp = qe(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), Up = qe(Da).replace("(?:-->|$)", "-->").getRegex(), zp = qe(
  "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>"
).replace("comment", Up).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), $i = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/, Hp = qe(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", $i).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), Ku = qe(/^!?\[(label)\]\[(ref)\]/).replace("label", $i).replace("ref", Ma).getRegex(), Gu = qe(/^!?\[(ref)\](?:\[\])?/).replace("ref", Ma).getRegex(), jp = qe("reflink|nolink(?!\\()", "g").replace("reflink", Ku).replace("nolink", Gu).getRegex(), Ba = {
  _backpedal: qr,
  // only used for GFM url
  anyPunctuation: $p,
  autolink: Bp,
  blockSkip: Lp,
  br: Hu,
  code: Ep,
  del: qr,
  emStrongLDelim: Np,
  emStrongRDelimAst: Mp,
  emStrongRDelimUnd: Fp,
  escape: xp,
  link: Hp,
  nolink: Gu,
  punctuation: Rp,
  reflink: Ku,
  reflinkSearch: jp,
  tag: zp,
  text: Cp,
  url: qr
}, Wp = {
  ...Ba,
  link: qe(/^!?\[(label)\]\((.*?)\)/).replace("label", $i).getRegex(),
  reflink: qe(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", $i).getRegex()
}, oa = {
  ...Ba,
  emStrongRDelimAst: Dp,
  emStrongLDelim: Pp,
  url: qe(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, "i").replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
  _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
}, qp = {
  ...oa,
  br: qe(Hu).replace("{2,}", "*").getRegex(),
  text: qe(oa.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
}, di = {
  normal: Fa,
  gfm: Ap,
  pedantic: Sp
}, Cr = {
  normal: Ba,
  gfm: oa,
  breaks: qp,
  pedantic: Wp
}, Vp = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}, Yl = (e) => Vp[e];
function Tn(e, t) {
  if (t) {
    if (Ut.escapeTest.test(e))
      return e.replace(Ut.escapeReplace, Yl);
  } else if (Ut.escapeTestNoEncode.test(e))
    return e.replace(Ut.escapeReplaceNoEncode, Yl);
  return e;
}
function Xl(e) {
  try {
    e = encodeURI(e).replace(Ut.percentDecode, "%");
  } catch {
    return null;
  }
  return e;
}
function Zl(e, t) {
  var i;
  const n = e.replace(Ut.findPipe, (o, a, l) => {
    let u = !1, c = a;
    for (; --c >= 0 && l[c] === "\\"; ) u = !u;
    return u ? "|" : " |";
  }), s = n.split(Ut.splitPipe);
  let r = 0;
  if (s[0].trim() || s.shift(), s.length > 0 && !((i = s.at(-1)) != null && i.trim()) && s.pop(), t)
    if (s.length > t)
      s.splice(t);
    else
      for (; s.length < t; ) s.push("");
  for (; r < s.length; r++)
    s[r] = s[r].trim().replace(Ut.slashPipe, "|");
  return s;
}
function Rr(e, t, n) {
  const s = e.length;
  if (s === 0)
    return "";
  let r = 0;
  for (; r < s && e.charAt(s - r - 1) === t; )
    r++;
  return e.slice(0, s - r);
}
function Kp(e, t) {
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
function Jl(e, t, n, s, r) {
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
function Gp(e, t, n) {
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
var Bi = class {
  // set by the lexer
  constructor(e) {
    Je(this, "options");
    Je(this, "rules");
    // set by the lexer
    Je(this, "lexer");
    this.options = e || Ms;
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
        text: this.options.pedantic ? n : Rr(n, `
`)
      };
    }
  }
  fences(e) {
    const t = this.rules.block.fences.exec(e);
    if (t) {
      const n = t[0], s = Gp(n, t[3] || "", this.rules);
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
        const s = Rr(n, "#");
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
        raw: Rr(t[0], `
`)
      };
  }
  blockquote(e) {
    const t = this.rules.block.blockquote.exec(e);
    if (t) {
      let n = Rr(t[0], `
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
        const b = this.lexer.state.top;
        if (this.lexer.state.top = !0, this.lexer.blockTokens(c, i, !0), this.lexer.state.top = b, n.length === 0)
          break;
        const w = i.at(-1);
        if ((w == null ? void 0 : w.type) === "code")
          break;
        if ((w == null ? void 0 : w.type) === "blockquote") {
          const I = w, O = I.raw + `
` + n.join(`
`), j = this.blockquote(O);
          i[i.length - 1] = j, s = s.substring(0, s.length - I.raw.length) + j.raw, r = r.substring(0, r.length - I.text.length) + j.text;
          break;
        } else if ((w == null ? void 0 : w.type) === "list") {
          const I = w, O = I.raw + `
` + n.join(`
`), j = this.list(O);
          i[i.length - 1] = j, s = s.substring(0, s.length - w.raw.length) + j.raw, r = r.substring(0, r.length - I.raw.length) + j.raw, n = O.substring(i.at(-1).raw.length).split(`
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
        let b = t[2].split(`
`, 1)[0].replace(this.rules.other.listReplaceTabs, (R) => " ".repeat(3 * R.length)), w = e.split(`
`, 1)[0], I = !b.trim(), O = 0;
        if (this.options.pedantic ? (O = 2, c = b.trimStart()) : I ? O = t[1].length + 1 : (O = t[2].search(this.rules.other.nonSpaceChar), O = O > 4 ? 1 : O, c = b.slice(O), O += t[1].length), I && this.rules.other.blankLine.test(w) && (u += w + `
`, e = e.substring(w.length + 1), l = !0), !l) {
          const R = this.rules.other.nextBulletRegex(O), ue = this.rules.other.hrRegex(O), me = this.rules.other.fencesBeginRegex(O), C = this.rules.other.headingBeginRegex(O), P = this.rules.other.htmlBeginRegex(O);
          for (; e; ) {
            const S = e.split(`
`, 1)[0];
            let q;
            if (w = S, this.options.pedantic ? (w = w.replace(this.rules.other.listReplaceNesting, "  "), q = w) : q = w.replace(this.rules.other.tabCharGlobal, "    "), me.test(w) || C.test(w) || P.test(w) || R.test(w) || ue.test(w))
              break;
            if (q.search(this.rules.other.nonSpaceChar) >= O || !w.trim())
              c += `
` + q.slice(O);
            else {
              if (I || b.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || me.test(b) || C.test(b) || ue.test(b))
                break;
              c += `
` + w;
            }
            !I && !w.trim() && (I = !0), u += S + `
`, e = e.substring(S.length + 1), b = q.slice(O);
          }
        }
        r.loose || (o ? r.loose = !0 : this.rules.other.doubleBlankLine.test(u) && (o = !0));
        let j = null, ce;
        this.options.gfm && (j = this.rules.other.listIsTask.exec(c), j && (ce = j[0] !== "[ ] ", c = c.replace(this.rules.other.listReplaceTask, ""))), r.items.push({
          type: "list_item",
          raw: u,
          task: !!j,
          checked: ce,
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
          const u = r.items[l].tokens.filter((b) => b.type === "space"), c = u.length > 0 && u.some((b) => this.rules.other.anyLine.test(b.raw));
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
    const n = Zl(t[1]), s = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), r = (o = t[3]) != null && o.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
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
        i.rows.push(Zl(a, i.header.length).map((l, u) => ({
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
        const i = Rr(n.slice(0, -1), "\\");
        if ((n.length - i.length) % 2 === 0)
          return;
      } else {
        const i = Kp(t[2], "()");
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
      return s = s.trim(), this.rules.other.startAngleBracket.test(s) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n) ? s = s.slice(1) : s = s.slice(1, -1)), Jl(t, {
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
      return Jl(n, r, n[0], this.lexer, this.rules);
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
        const b = [...s[0]][0].length, w = e.slice(0, i + s.index + b + a);
        if (Math.min(i, a) % 2) {
          const O = w.slice(1, -1);
          return {
            type: "em",
            raw: w,
            text: O,
            tokens: this.lexer.inlineTokens(O)
          };
        }
        const I = w.slice(2, -2);
        return {
          type: "strong",
          raw: w,
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
}, Bn = class aa {
  constructor(t) {
    Je(this, "tokens");
    Je(this, "options");
    Je(this, "state");
    Je(this, "tokenizer");
    Je(this, "inlineQueue");
    this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = t || Ms, this.options.tokenizer = this.options.tokenizer || new Bi(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = {
      inLink: !1,
      inRawBlock: !1,
      top: !0
    };
    const n = {
      other: Ut,
      block: di.normal,
      inline: Cr.normal
    };
    this.options.pedantic ? (n.block = di.pedantic, n.inline = Cr.pedantic) : this.options.gfm && (n.block = di.gfm, this.options.breaks ? n.inline = Cr.breaks : n.inline = Cr.gfm), this.tokenizer.rules = n;
  }
  /**
   * Expose Rules
   */
  static get rules() {
    return {
      block: di,
      inline: Cr
    };
  }
  /**
   * Static Lex Method
   */
  static lex(t, n) {
    return new aa(n).lex(t);
  }
  /**
   * Static Lex Inline Method
   */
  static lexInline(t, n) {
    return new aa(n).inlineTokens(t);
  }
  /**
   * Preprocessing
   */
  lex(t) {
    t = t.replace(Ut.carriageReturn, `
`), this.blockTokens(t, this.tokens);
    for (let n = 0; n < this.inlineQueue.length; n++) {
      const s = this.inlineQueue[n];
      this.inlineTokens(s.src, s.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(t, n = [], s = !1) {
    var r, i, o;
    for (this.options.pedantic && (t = t.replace(Ut.tabCharGlobal, "    ").replace(Ut.spaceLine, "")); t; ) {
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
        let b;
        this.options.extensions.startBlock.forEach((w) => {
          b = w.call({ lexer: this }, c), typeof b == "number" && b >= 0 && (u = Math.min(u, b));
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
      if ((u = this.options.extensions) != null && u.startInline) {
        let w = 1 / 0;
        const I = t.slice(1);
        let O;
        this.options.extensions.startInline.forEach((j) => {
          O = j.call({ lexer: this }, I), typeof O == "number" && O >= 0 && (w = Math.min(w, O));
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
}, Ui = class {
  // set by the parser
  constructor(e) {
    Je(this, "options");
    Je(this, "parser");
    this.options = e || Ms;
  }
  space(e) {
    return "";
  }
  code({ text: e, lang: t, escaped: n }) {
    var i;
    const s = (i = (t || "").match(Ut.notSpaceStart)) == null ? void 0 : i[0], r = e.replace(Ut.endingNewline, "") + `
`;
    return s ? '<pre><code class="language-' + Tn(s) + '">' + (n ? r : Tn(r, !0)) + `</code></pre>
` : "<pre><code>" + (n ? r : Tn(r, !0)) + `</code></pre>
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
      e.loose ? ((n = e.tokens[0]) == null ? void 0 : n.type) === "paragraph" ? (e.tokens[0].text = s + " " + e.tokens[0].text, e.tokens[0].tokens && e.tokens[0].tokens.length > 0 && e.tokens[0].tokens[0].type === "text" && (e.tokens[0].tokens[0].text = s + " " + Tn(e.tokens[0].tokens[0].text), e.tokens[0].tokens[0].escaped = !0)) : e.tokens.unshift({
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
    return `<code>${Tn(e, !0)}</code>`;
  }
  br(e) {
    return "<br>";
  }
  del({ tokens: e }) {
    return `<del>${this.parser.parseInline(e)}</del>`;
  }
  link({ href: e, title: t, tokens: n }) {
    const s = this.parser.parseInline(n), r = Xl(e);
    if (r === null)
      return s;
    e = r;
    let i = '<a href="' + e + '"';
    return t && (i += ' title="' + Tn(t) + '"'), i += ">" + s + "</a>", i;
  }
  image({ href: e, title: t, text: n, tokens: s }) {
    s && (n = this.parser.parseInline(s, this.parser.textRenderer));
    const r = Xl(e);
    if (r === null)
      return Tn(n);
    e = r;
    let i = `<img src="${e}" alt="${n}"`;
    return t && (i += ` title="${Tn(t)}"`), i += ">", i;
  }
  text(e) {
    return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : Tn(e.text);
  }
}, Ua = class {
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
}, Un = class la {
  constructor(t) {
    Je(this, "options");
    Je(this, "renderer");
    Je(this, "textRenderer");
    this.options = t || Ms, this.options.renderer = this.options.renderer || new Ui(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new Ua();
  }
  /**
   * Static Parse Method
   */
  static parse(t, n) {
    return new la(n).parse(t);
  }
  /**
   * Static Parse Inline Method
   */
  static parseInline(t, n) {
    return new la(n).parseInline(t);
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
}, Vo, ki = (Vo = class {
  constructor(e) {
    Je(this, "options");
    Je(this, "block");
    this.options = e || Ms;
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
    return this.block ? Bn.lex : Bn.lexInline;
  }
  /**
   * Provide function to parse tokens
   */
  provideParser() {
    return this.block ? Un.parse : Un.parseInline;
  }
}, Je(Vo, "passThroughHooks", /* @__PURE__ */ new Set([
  "preprocess",
  "postprocess",
  "processAllTokens"
])), Vo), Yp = class {
  constructor(...e) {
    Je(this, "defaults", La());
    Je(this, "options", this.setOptions);
    Je(this, "parse", this.parseMarkdown(!0));
    Je(this, "parseInline", this.parseMarkdown(!1));
    Je(this, "Parser", Un);
    Je(this, "Renderer", Ui);
    Je(this, "TextRenderer", Ua);
    Je(this, "Lexer", Bn);
    Je(this, "Tokenizer", Bi);
    Je(this, "Hooks", ki);
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
        const r = this.defaults.renderer || new Ui(this.defaults);
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
        const r = this.defaults.tokenizer || new Bi(this.defaults);
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
        const r = this.defaults.hooks || new ki();
        for (const i in n.hooks) {
          if (!(i in r))
            throw new Error(`hook '${i}' does not exist`);
          if (["options", "block"].includes(i))
            continue;
          const o = i, a = n.hooks[o], l = r[o];
          ki.passThroughHooks.has(i) ? r[o] = (u) => {
            if (this.defaults.async)
              return Promise.resolve(a.call(r, u)).then((b) => l.call(r, b));
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
    return Bn.lex(e, t ?? this.defaults);
  }
  parser(e, t) {
    return Un.parse(e, t ?? this.defaults);
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
      const a = i.hooks ? i.hooks.provideLexer() : e ? Bn.lex : Bn.lexInline, l = i.hooks ? i.hooks.provideParser() : e ? Un.parse : Un.parseInline;
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
        const s = "<p>An error occurred:</p><pre>" + Tn(n.message + "", !0) + "</pre>";
        return t ? Promise.resolve(s) : s;
      }
      if (t)
        return Promise.reject(n);
      throw n;
    };
  }
}, Ls = new Yp();
function Ue(e, t) {
  return Ls.parse(e, t);
}
Ue.options = Ue.setOptions = function(e) {
  return Ls.setOptions(e), Ue.defaults = Ls.defaults, $u(Ue.defaults), Ue;
};
Ue.getDefaults = La;
Ue.defaults = Ms;
Ue.use = function(...e) {
  return Ls.use(...e), Ue.defaults = Ls.defaults, $u(Ue.defaults), Ue;
};
Ue.walkTokens = function(e, t) {
  return Ls.walkTokens(e, t);
};
Ue.parseInline = Ls.parseInline;
Ue.Parser = Un;
Ue.parser = Un.parse;
Ue.Renderer = Ui;
Ue.TextRenderer = Ua;
Ue.Lexer = Bn;
Ue.lexer = Bn.lex;
Ue.Tokenizer = Bi;
Ue.Hooks = ki;
Ue.parse = Ue;
Ue.options;
Ue.setOptions;
Ue.use;
Ue.walkTokens;
Ue.parseInline;
Un.parse;
Bn.lex;
/*! @license DOMPurify 3.4.15 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.15/LICENSE */
function Ql(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function Xp(e) {
  if (Array.isArray(e)) return e;
}
function Zp(e, t) {
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
function Jp() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Qp(e, t) {
  return Xp(e) || Zp(e, t) || em(e, t) || Jp();
}
function em(e, t) {
  if (e) {
    if (typeof e == "string") return Ql(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ql(e, t) : void 0;
  }
}
const Yu = Object.entries, ec = Object.setPrototypeOf, tm = Object.isFrozen, nm = Object.getPrototypeOf, sm = Object.getOwnPropertyDescriptor;
let yt = Object.freeze, wt = Object.seal, Qs = Object.create, Xu = typeof Reflect < "u" && Reflect, ca = Xu.apply, ua = Xu.construct;
yt || (yt = function(t) {
  return t;
});
wt || (wt = function(t) {
  return t;
});
ca || (ca = function(t, n) {
  for (var s = arguments.length, r = new Array(s > 2 ? s - 2 : 0), i = 2; i < s; i++)
    r[i - 2] = arguments[i];
  return t.apply(n, r);
});
ua || (ua = function(t) {
  for (var n = arguments.length, s = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
    s[r - 1] = arguments[r];
  return new t(...s);
});
const Cs = mt(Array.prototype.forEach), rm = mt(Array.prototype.lastIndexOf), tc = mt(Array.prototype.pop), Ir = mt(Array.prototype.push), im = mt(Array.prototype.splice), or = Array.isArray, Mr = mt(String.prototype.toLowerCase), No = mt(String.prototype.toString), nc = mt(String.prototype.match), Or = mt(String.prototype.replace), sc = mt(String.prototype.indexOf), om = mt(String.prototype.trim), am = mt(Number.prototype.toString), lm = mt(Boolean.prototype.toString), rc = typeof BigInt > "u" ? null : mt(BigInt.prototype.toString), ic = typeof Symbol > "u" ? null : mt(Symbol.prototype.toString), Wt = mt(Object.prototype.hasOwnProperty), Lr = mt(Object.prototype.toString), Ct = mt(RegExp.prototype.test), Ss = cm(TypeError);
function mt(e) {
  return function(t) {
    t instanceof RegExp && (t.lastIndex = 0);
    for (var n = arguments.length, s = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
      s[r - 1] = arguments[r];
    return ca(e, t, s);
  };
}
function cm(e) {
  return function() {
    for (var t = arguments.length, n = new Array(t), s = 0; s < t; s++)
      n[s] = arguments[s];
    return ua(e, n);
  };
}
function Fe(e, t) {
  let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : Mr;
  if (ec && ec(e, null), !or(t))
    return e;
  let s = t.length;
  for (; s--; ) {
    let r = t[s];
    if (typeof r == "string") {
      const i = n(r);
      i !== r && (tm(t) || (t[s] = i), r = i);
    }
    e[r] = !0;
  }
  return e;
}
function um(e) {
  for (let t = 0; t < e.length; t++)
    Wt(e, t) || (e[t] = null);
  return e;
}
function tn(e) {
  const t = Qs(null);
  for (const s of Yu(e)) {
    var n = Qp(s, 2);
    const r = n[0], i = n[1];
    Wt(e, r) && (or(i) ? t[r] = um(i) : i && typeof i == "object" && i.constructor === Object ? t[r] = tn(i) : t[r] = i);
  }
  return t;
}
function fm(e) {
  switch (typeof e) {
    case "string":
      return e;
    case "number":
      return am(e);
    case "boolean":
      return lm(e);
    case "bigint":
      return rc ? rc(e) : "0";
    case "symbol":
      return ic ? ic(e) : "Symbol()";
    case "undefined":
      return Lr(e);
    case "function":
    case "object": {
      if (e === null)
        return Lr(e);
      const t = e, n = cn(t, "toString");
      if (typeof n == "function") {
        const s = n(t);
        return typeof s == "string" ? s : Lr(s);
      }
      return Lr(e);
    }
    default:
      return Lr(e);
  }
}
function cn(e, t) {
  for (; e !== null; ) {
    const s = sm(e, t);
    if (s) {
      if (s.get)
        return mt(s.get);
      if (typeof s.value == "function")
        return mt(s.value);
    }
    e = nm(e);
  }
  function n() {
    return null;
  }
  return n;
}
function dm(e) {
  try {
    return Ct(e, ""), !0;
  } catch {
    return !1;
  }
}
const oc = yt(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]), Po = yt(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "enterkeyhint", "exportparts", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "inputmode", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "part", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]), Mo = yt(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]), hm = yt(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]), Do = yt(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]), pm = yt(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]), ac = yt(["#text"]), lc = yt(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "command", "commandfor", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "exportparts", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inert", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "part", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "slot", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns"]), Fo = yt(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dominant-baseline", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "mask-type", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "pointer-events", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-orientation", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "vector-effect", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]), cc = yt(["accent", "accentunder", "align", "bevelled", "close", "columnalign", "columnlines", "columnspacing", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lquote", "lspace", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]), hi = yt(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]), mm = wt(/{{[\w\W]*|^[\w\W]*}}/g), gm = wt(/<%[\w\W]*|^[\w\W]*%>/g), _m = wt(/\${[\w\W]*/g), ym = wt(/^data-[\-\w.\u00B7-\uFFFF]+$/), vm = wt(/^aria-[\-\w]+$/), uc = wt(
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  // eslint-disable-line no-useless-escape
), bm = wt(/^(?:\w+script|data):/i), wm = wt(
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g
  // eslint-disable-line no-control-regex
), km = wt(/^html$/i), Tm = wt(/^[a-z][.\w]*(-[.\w]+)+$/i), fc = wt(/<[/\w!]/g), dc = wt(/<[/\w]/g), Am = wt(/<\/no(script|embed|frames)/i), Sm = wt(/\/>/i), Qt = {
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
}, Zu = ["style", "script", "xmp", "iframe", "noembed", "noframes", "plaintext", "noscript"], xm = yt(Fe({}, Zu)), Em = function() {
  const e = {};
  return Cs(Zu, (t) => {
    e[t] = wt(new RegExp("</" + t + "(?=[\\t\\n\\f\\r />])", "i"));
  }), yt(e);
}(), Cm = function() {
  return typeof window > "u" ? null : window;
}, Rm = function(t, n) {
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
}, hc = function() {
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
}, es = function(t, n, s, r) {
  return Wt(t, n) && or(t[n]) ? Fe(r.base ? tn(r.base) : {}, t[n], r.transform) : s;
}, $o = function(t, n, s) {
  const r = Wt(t, n) ? t[n] : void 0;
  return r && typeof r == "object" ? tn(r) : s();
};
function Ju() {
  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : Cm();
  const t = (V) => Ju(V);
  if (t.version = "3.4.15", t.removed = [], !e || !e.document || e.document.nodeType !== Qt.document || !e.Element)
    return t.isSupported = !1, t;
  let n = e.document;
  const s = n, r = s.currentScript;
  e.DocumentFragment;
  const i = e.HTMLTemplateElement, o = e.Node, a = e.Element, l = e.NodeFilter, u = e.NamedNodeMap;
  u === void 0 && (e.NamedNodeMap || e.MozNamedAttrMap), e.HTMLFormElement;
  const c = e.DOMParser, b = e.trustedTypes, w = a.prototype, I = cn(w, "cloneNode"), O = cn(w, "remove"), j = cn(w, "removeAttributeNode"), ce = cn(w, "nextSibling"), R = cn(w, "childNodes"), ue = cn(w, "parentNode"), me = cn(w, "shadowRoot"), C = cn(w, "attributes"), P = o && o.prototype ? cn(o.prototype, "nodeType") : null, S = o && o.prototype ? cn(o.prototype, "nodeName") : null, q = o && o.prototype ? cn(o.prototype, "ownerDocument") : null, ne = function(p) {
    return P ? P(p) : p.nodeType;
  }, he = function(p) {
    return S ? S(p) : p.nodeName;
  };
  if (typeof i == "function") {
    const V = n.createElement("template");
    V.content && V.content.ownerDocument && (n = V.content.ownerDocument);
  }
  let pe, Le = "", Ae, Ve = !1, $e = 0;
  const et = function() {
    if ($e > 0)
      throw Ss('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.');
  }, fe = function(p) {
    et(), $e++;
    try {
      return pe.createHTML(p);
    } finally {
      $e--;
    }
  }, we = function(p) {
    et(), $e++;
    try {
      return pe.createScriptURL(p);
    } finally {
      $e--;
    }
  }, ge = function() {
    return Ve || (Ae = Rm(b, r), Ve = !0), Ae;
  }, Ye = n, Xe = Ye.implementation, rt = Ye.createNodeIterator, ze = Ye.createDocumentFragment, Lt = Ye.getElementsByTagName, vn = s.importNode;
  let De = hc();
  t.isSupported = typeof Yu == "function" && typeof ue == "function" && Xe && Xe.createHTMLDocument !== void 0;
  const vt = mm, zt = gm, qt = _m, Vt = ym, Nt = vm, bn = bm, _ = wm, v = Tm;
  let L = uc, D = null;
  const B = Fe({}, [...oc, ...Po, ...Mo, ...Do, ...ac]);
  let M = null;
  const X = Fe({}, [...lc, ...Fo, ...cc, ...hi]);
  let K = Object.seal(Qs(null, {
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
  })), G = null, F = null;
  const se = Object.seal(Qs(null, {
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
  let Y = !0, te = !0, de = !1, _e = !0, be = !1, ke = !0, Be = !1, U = !1, z = null, f = null, y = !1, N = !1, E = !1, W = !1, Q = !0, ie = !1;
  const Ce = "user-content-";
  let Re = !0, Ie = !1, Ne = {}, it = null;
  const dt = Fe({}, [
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
  let pn = null;
  const Ht = Fe({}, ["audio", "video", "img", "source", "image", "track"]);
  let Kt = null;
  const ur = Fe({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), Pt = "http://www.w3.org/1998/Math/MathML", On = "http://www.w3.org/2000/svg", Mt = "http://www.w3.org/1999/xhtml";
  let sn = Mt, fr = !1, Wn = null;
  const wn = Fe({}, [Pt, On, Mt], No), rn = yt(["mi", "mo", "mn", "ms", "mtext"]);
  let Fs = Fe({}, rn);
  const St = yt(["annotation-xml"]);
  let dr = Fe({}, St);
  const ni = Fe({}, ["title", "style", "font", "a", "script"]);
  let xt = null;
  const co = ["application/xhtml+xml", "text/html"], hs = "text/html";
  let nt = null, qn = null;
  const $s = n.createElement("form"), hr = function(p) {
    return p instanceof RegExp || p instanceof Function;
  }, Bs = function() {
    let p = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (qn && qn === p)
      return;
    (!p || typeof p != "object") && (p = {}), p = tn(p), xt = // eslint-disable-next-line unicorn/prefer-includes
    co.indexOf(p.PARSER_MEDIA_TYPE) === -1 ? hs : p.PARSER_MEDIA_TYPE, nt = xt === "application/xhtml+xml" ? No : Mr, D = es(p, "ALLOWED_TAGS", B, {
      transform: nt
    }), M = es(p, "ALLOWED_ATTR", X, {
      transform: nt
    }), Wn = es(p, "ALLOWED_NAMESPACES", wn, {
      transform: No
    }), Kt = es(p, "ADD_URI_SAFE_ATTR", ur, {
      transform: nt,
      base: ur
    }), pn = es(p, "ADD_DATA_URI_TAGS", Ht, {
      transform: nt,
      base: Ht
    }), it = es(p, "FORBID_CONTENTS", dt, {
      transform: nt
    }), G = es(p, "FORBID_TAGS", tn({}), {
      transform: nt
    }), F = es(p, "FORBID_ATTR", tn({}), {
      transform: nt
    }), Ne = Wt(p, "USE_PROFILES") ? p.USE_PROFILES && typeof p.USE_PROFILES == "object" ? tn(p.USE_PROFILES) : p.USE_PROFILES : !1, Y = p.ALLOW_ARIA_ATTR !== !1, te = p.ALLOW_DATA_ATTR !== !1, de = p.ALLOW_UNKNOWN_PROTOCOLS || !1, _e = p.ALLOW_SELF_CLOSE_IN_ATTR !== !1, be = p.SAFE_FOR_TEMPLATES || !1, ke = p.SAFE_FOR_XML !== !1, Be = p.WHOLE_DOCUMENT || !1, N = p.RETURN_DOM || !1, E = p.RETURN_DOM_FRAGMENT || !1, W = p.RETURN_TRUSTED_TYPE || !1, y = p.FORCE_BODY || !1, Q = p.SANITIZE_DOM !== !1, ie = p.SANITIZE_NAMED_PROPS || !1, Re = p.KEEP_CONTENT !== !1, Ie = p.IN_PLACE || !1, L = dm(p.ALLOWED_URI_REGEXP) ? p.ALLOWED_URI_REGEXP : uc, sn = typeof p.NAMESPACE == "string" ? p.NAMESPACE : Mt, Fs = $o(
      p,
      "MATHML_TEXT_INTEGRATION_POINTS",
      () => Fe({}, rn)
      // Default built-in map
    ), dr = $o(
      p,
      "HTML_INTEGRATION_POINTS",
      () => Fe({}, St)
      // Default built-in map
    );
    const T = $o(p, "CUSTOM_ELEMENT_HANDLING", () => Qs(null));
    if (K = Qs(null), Wt(T, "tagNameCheck") && hr(T.tagNameCheck) && (K.tagNameCheck = T.tagNameCheck), Wt(T, "attributeNameCheck") && hr(T.attributeNameCheck) && (K.attributeNameCheck = T.attributeNameCheck), Wt(T, "allowCustomizedBuiltInElements") && typeof T.allowCustomizedBuiltInElements == "boolean" && (K.allowCustomizedBuiltInElements = T.allowCustomizedBuiltInElements), wt(K), be && (te = !1), E && (N = !0), Ne && (D = Fe({}, ac), M = Qs(null), Ne.html === !0 && (Fe(D, oc), Fe(M, lc)), Ne.svg === !0 && (Fe(D, Po), Fe(M, Fo), Fe(M, hi)), Ne.svgFilters === !0 && (Fe(D, Mo), Fe(M, Fo), Fe(M, hi)), Ne.mathMl === !0 && (Fe(D, Do), Fe(M, cc), Fe(M, hi))), se.tagCheck = null, se.attributeCheck = null, Wt(p, "ADD_TAGS") && (typeof p.ADD_TAGS == "function" ? se.tagCheck = p.ADD_TAGS : or(p.ADD_TAGS) && (D === B && (D = tn(D)), Fe(D, p.ADD_TAGS, nt))), Wt(p, "ADD_ATTR") && (typeof p.ADD_ATTR == "function" ? se.attributeCheck = p.ADD_ATTR : or(p.ADD_ATTR) && (M === X && (M = tn(M)), Fe(M, p.ADD_ATTR, nt))), Wt(p, "ADD_FORBID_CONTENTS") && or(p.ADD_FORBID_CONTENTS) && (it === dt && (it = tn(it)), Fe(it, p.ADD_FORBID_CONTENTS, nt)), Re && (D["#text"] = !0), Be && Fe(D, ["html", "head", "body"]), D.table && (Fe(D, ["tbody"]), delete G.tbody), p.TRUSTED_TYPES_POLICY) {
      if (typeof p.TRUSTED_TYPES_POLICY.createHTML != "function")
        throw Ss('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
      if (typeof p.TRUSTED_TYPES_POLICY.createScriptURL != "function")
        throw Ss('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
      const H = pe;
      pe = p.TRUSTED_TYPES_POLICY;
      try {
        Le = fe("");
      } catch (ee) {
        throw pe = H, ee;
      }
    } else p.TRUSTED_TYPES_POLICY === null ? (pe = void 0, Le = "") : (pe === void 0 && (pe = ge()), pe && typeof Le == "string" && (Le = fe("")));
    yt && yt(p), qn = p;
  }, pr = Fe({}, [...Po, ...Mo, ...hm]), mr = Fe({}, [...Do, ...pm]), si = function(p, T, H) {
    return T.namespaceURI === Mt ? p === "svg" : T.namespaceURI === Pt ? p === "svg" && (H === "annotation-xml" || Fs[H]) : !!pr[p];
  }, ri = function(p, T, H) {
    return T.namespaceURI === Mt ? p === "math" : T.namespaceURI === On ? p === "math" && dr[H] : !!mr[p];
  }, uo = function(p, T, H) {
    return T.namespaceURI === On && !dr[H] || T.namespaceURI === Pt && !Fs[H] ? !1 : !mr[p] && (ni[p] || !pr[p]);
  }, gr = function(p) {
    let T = ue(p);
    (!T || !T.tagName) && (T = {
      namespaceURI: sn,
      tagName: "template"
    });
    const H = Mr(p.tagName), ee = Mr(T.tagName);
    return Wn[p.namespaceURI] ? p.namespaceURI === On ? si(H, T, ee) : p.namespaceURI === Pt ? ri(H, T, ee) : p.namespaceURI === Mt ? uo(H, T, ee) : !!(xt === "application/xhtml+xml" && Wn[p.namespaceURI]) : !1;
  }, Gt = function(p) {
    Ir(t.removed, {
      element: p
    });
    try {
      ue(p).removeChild(p);
    } catch {
      if (O(p), !ue(p))
        throw Ss("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place");
    }
  }, _r = function(p, T, H) {
    try {
      j(p, T);
    } catch {
      try {
        p.removeAttribute(H);
      } catch {
      }
    }
  }, ps = function(p) {
    Vn(p);
    const T = R(p);
    if (T) {
      const ee = [];
      Cs(T, (ae) => {
        Ir(ee, ae);
      }), Cs(ee, (ae) => {
        try {
          O(ae);
        } catch {
        }
      });
    }
    const H = C(p);
    if (H)
      for (let ee = H.length - 1; ee >= 0; --ee) {
        const ae = H[ee], ye = ae && ae.name;
        typeof ye == "string" && _r(p, ae, ye);
      }
  }, Dt = function(p, T, H) {
    if (!H)
      try {
        H = T.getAttributeNode(p);
      } catch {
        H = null;
      }
    Ir(t.removed, {
      attribute: H || null,
      from: T
    });
    try {
      H ? j(T, H) : T.removeAttribute(p);
    } catch {
      try {
        T.removeAttribute(p);
      } catch {
      }
    }
    if (p === "is")
      if (N || E)
        try {
          Gt(T);
        } catch {
        }
      else
        try {
          T.setAttribute(p, "");
        } catch {
        }
  }, ms = function(p) {
    const T = C(p);
    if (T)
      for (let H = T.length - 1; H >= 0; --H) {
        const ee = T[H], ae = ee && ee.name;
        typeof ae != "string" || M[nt(ae)] || _r(p, ee, ae);
      }
  }, Vn = function(p) {
    const T = [p];
    for (; T.length > 0; ) {
      const H = T.pop();
      ne(H) === Qt.element && ms(H);
      const ae = R(H);
      if (ae)
        for (let ye = ae.length - 1; ye >= 0; --ye)
          T.push(ae[ye]);
    }
  }, Us = function(p, T) {
    return ke ? p === "patchsrc" ? !0 : p === "for" && T !== "label" && T !== "output" : !1;
  }, zs = function(p) {
    if (!ke)
      return;
    const T = [p];
    for (; T.length > 0; ) {
      const H = T.pop(), ee = ne(H);
      if (ee === Qt.processingInstruction || ee === Qt.comment && Ct(dc, H.data)) {
        try {
          O(H);
        } catch {
        }
        continue;
      }
      if (ee === Qt.element) {
        const ye = H, Ge = nt(he(H));
        try {
          ye.hasAttribute && ye.hasAttribute("patchsrc") && ye.removeAttribute("patchsrc"), ye.hasAttribute && ye.hasAttribute("for") && Us("for", Ge) && ye.removeAttribute("for");
        } catch {
        }
      }
      const ae = R(H);
      if (ae)
        for (let ye = ae.length - 1; ye >= 0; --ye)
          T.push(ae[ye]);
    }
  }, mn = function(p) {
    let T = null, H = null;
    if (y)
      p = "<remove></remove>" + p;
    else {
      const ye = nc(p, /^[\r\n\t ]+/);
      H = ye && ye[0];
    }
    xt === "application/xhtml+xml" && sn === Mt && (p = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + p + "</body></html>");
    const ee = pe ? fe(p) : p;
    if (sn === Mt)
      try {
        T = new c().parseFromString(ee, xt);
      } catch {
      }
    if (!T || !T.documentElement) {
      T = Xe.createDocument(sn, "template", null);
      try {
        T.documentElement.innerHTML = fr ? Le : ee;
      } catch {
      }
    }
    const ae = T.body || T.documentElement;
    return p && H && ae.insertBefore(n.createTextNode(H), ae.childNodes[0] || null), sn === Mt ? Lt.call(T, Be ? "html" : "body")[0] : Be ? T.documentElement : ae;
  }, Hs = function(p) {
    const T = q ? q(p) : p.ownerDocument;
    return rt.call(
      T || p,
      p,
      // eslint-disable-next-line no-bitwise
      l.SHOW_ELEMENT | l.SHOW_COMMENT | l.SHOW_TEXT | l.SHOW_PROCESSING_INSTRUCTION | l.SHOW_CDATA_SECTION,
      null
    );
  }, Ln = function(p) {
    return p = Or(p, vt, " "), p = Or(p, zt, " "), p = Or(p, qt, " "), p;
  }, js = function(p) {
    var T;
    p.normalize();
    const H = q ? q(p) : p.ownerDocument, ee = rt.call(
      H || p,
      p,
      // eslint-disable-next-line no-bitwise
      l.SHOW_TEXT | l.SHOW_COMMENT | l.SHOW_CDATA_SECTION | l.SHOW_PROCESSING_INSTRUCTION,
      null
    );
    let ae = ee.nextNode();
    for (; ae; )
      ae.data = Ln(ae.data), ae = ee.nextNode();
    const ye = (T = p.querySelectorAll) === null || T === void 0 ? void 0 : T.call(p, "template");
    ye && Cs(ye, (Ge) => {
      Kn(Ge.content) && js(Ge.content);
    });
  }, on = function(p) {
    const T = S ? S(p) : null;
    return typeof T != "string" || nt(T) !== "form" ? !1 : typeof p.nodeName != "string" || typeof p.textContent != "string" || typeof p.removeChild != "function" || // Realm-safe NamedNodeMap detection: equality against the cached
    // prototype getter. Clobbered .attributes (e.g. <input name="attributes">)
    // makes the direct read diverge from the cached read; a clean form
    // (same-realm OR foreign-realm) has both reads pointing at the same
    // canonical NamedNodeMap.
    p.attributes !== C(p) || typeof p.removeAttribute != "function" || // A form descendant named "removeAttributeNode" or "getAttributeNode"
    // shadows these Attr-node methods via [LegacyOverrideBuiltIns].
    // _removeAttribute() / _stripAttributeNode() reach for
    // element.removeAttributeNode(attr) first; when it is shadowed the call
    // throws and the name-based fallback element.removeAttribute(name)
    // ASCII-lowercases its lookup key in an HTML document, silently missing
    // a case-preserved event-handler attribute (e.g. an ONANIMATIONSTART
    // that reached the sanitizer through an XML/XHTML parse). Flag the form
    // so it is removed wholesale, exactly as for the other shadowed methods.
    typeof p.removeAttributeNode != "function" || typeof p.getAttributeNode != "function" || typeof p.setAttribute != "function" || typeof p.namespaceURI != "string" || typeof p.insertBefore != "function" || typeof p.hasChildNodes != "function" || // NodeType clobbering probe. Cached Node.prototype.nodeType getter
    // returns the integer 1 for any Element regardless of realm; direct
    // read on a clobbered form (e.g. <input name="nodeType">) returns
    // the named child element. Cheap addition — nodeType is read from
    // an internal slot, no serialization cost — and removes a residual
    // clobbering surface used by several mXSS / PI / comment branches
    // in _sanitizeElements that compare currentNode.nodeType directly.
    p.nodeType !== P(p) || // HTMLFormElement has [LegacyOverrideBuiltIns]: a descendant named
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
    p.childNodes !== R(p);
  }, Kn = function(p) {
    if (!P || typeof p != "object" || p === null)
      return !1;
    try {
      return P(p) === Qt.documentFragment;
    } catch {
      return !1;
    }
  }, gn = function(p) {
    if (!P || typeof p != "object" || p === null)
      return !1;
    try {
      return typeof P(p) == "number";
    } catch {
      return !1;
    }
  };
  function Yt(V, p, T) {
    V.length !== 0 && Cs(V, (H) => {
      H.call(t, p, T, qn);
    });
  }
  const fo = function(p, T) {
    return !!(ke && p.hasChildNodes() && !gn(p.firstElementChild) && Ct(fc, p.textContent) && Ct(fc, p.innerHTML) || ke && p.namespaceURI === Mt && xm[T] && (gn(p.firstElementChild) || typeof p.textContent == "string" && Ct(Em[T], p.textContent)) || p.nodeType === Qt.processingInstruction || ke && p.nodeType === Qt.comment && Ct(dc, p.data));
  }, gs = function(p, T) {
    if (p instanceof RegExp)
      return Ct(p, T);
    if (p instanceof Function) {
      for (var H = arguments.length, ee = new Array(H > 2 ? H - 2 : 0), ae = 2; ae < H; ae++)
        ee[ae - 2] = arguments[ae];
      return !!p(T, ...ee);
    }
    return !1;
  }, Ws = function(p, T, H) {
    if (!G[T] && ct(T) && gs(K.tagNameCheck, T))
      return !1;
    if (Re && !it[T]) {
      const ee = ue(p), ae = R(p);
      if (ae && ee) {
        const ye = ae.length;
        for (let Ge = ye - 1; Ge >= 0; --Ge) {
          const st = p === H ? I(ae[Ge], !0) : ae[Ge];
          ee.insertBefore(st, ce(p));
        }
      }
    }
    return Gt(p), !0;
  }, qs = function(p, T, H, ee) {
    return p.length === 0 ? T : T === H || T === ee ? tn(T) : T;
  }, Xt = function(p, T) {
    return p === T || ue(p) !== null ? !1 : (Ie && Vn(p), !0);
  }, Zt = function(p, T) {
    if (Yt(De.beforeSanitizeElements, p, null), Xt(p, T))
      return !0;
    if (on(p))
      return Gt(p), !0;
    const H = nt(he(p));
    if (D = qs(De.uponSanitizeElement, D, B, z), Yt(De.uponSanitizeElement, p, {
      tagName: H,
      allowedTags: D
    }), Xt(p, T))
      return !0;
    if (fo(p, H))
      return Gt(p), !0;
    if (G[H] || !(se.tagCheck instanceof Function && se.tagCheck(H)) && !D[H]) {
      const ae = Ws(p, H, T);
      return ae === !1 && Yt(De.afterSanitizeElements, p, null), ae;
    }
    if (ne(p) === Qt.element && !gr(p) || (H === "noscript" || H === "noembed" || H === "noframes") && Ct(Am, p.innerHTML))
      return Gt(p), !0;
    if (be && p.nodeType === Qt.text) {
      const ae = Ln(p.textContent);
      p.textContent !== ae && (Ir(t.removed, {
        element: p.cloneNode()
      }), p.textContent = ae);
    }
    return Yt(De.afterSanitizeElements, p, null), !1;
  }, lt = function(p, T, H) {
    if (F[T] || Us(T, p) || Q && (T === "id" || T === "name") && (H in n || H in $s))
      return !1;
    const ee = M[T] || se.attributeCheck instanceof Function && se.attributeCheck(T, p);
    return te && Ct(Vt, T) || Y && Ct(Nt, T) ? !0 : ee ? Kt[T] || Ct(L, Or(H, _, "")) || (T === "src" || T === "xlink:href" || T === "href") && p !== "script" && sc(H, "data:") === 0 && pn[p] || de && !Ct(bn, Or(H, _, "")) ? !0 : !H : (
      // Condition a) covers a basically valid custom element tag name whose
      // tag passes the configured tagNameCheck and whose attribute name
      // passes the configured attributeNameCheck ...
      ct(p) && gs(K.tagNameCheck, p) && gs(K.attributeNameCheck, T, p) || // Condition b) covers an `is` attribute whose value passes the
      // configured tagNameCheck while customized built-in elements are
      // allowed.
      T === "is" && K.allowCustomizedBuiltInElements && gs(K.tagNameCheck, H)
    );
  }, gt = Fe({}, ["annotation-xml", "color-profile", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "missing-glyph"]), ct = function(p) {
    return !gt[Mr(p)] && Ct(v, p);
  }, Nn = function(p, T, H, ee) {
    if (pe && typeof b == "object" && typeof b.getAttributeType == "function" && !H)
      switch (b.getAttributeType(p, T)) {
        case "TrustedHTML":
          return fe(ee);
        case "TrustedScriptURL":
          return we(ee);
      }
    return ee;
  }, _s = function(p, T, H, ee) {
    try {
      return H ? p.setAttributeNS(H, T, ee) : p.setAttribute(T, ee), on(p) ? (Gt(p), !1) : !0;
    } catch {
      return Dt(T, p), !1;
    }
  }, yr = function(p) {
    Yt(De.beforeSanitizeAttributes, p, null);
    const T = p.attributes;
    if (!T || on(p))
      return;
    M = qs(De.uponSanitizeAttribute, M, X, f);
    const H = {
      attrName: "",
      attrValue: "",
      keepAttr: !0,
      allowedAttributes: M,
      forceKeepAttr: void 0
    };
    let ee = T.length;
    const ae = nt(p.nodeName);
    for (; ee--; ) {
      const ye = T[ee], Ge = ye.name, st = ye.namespaceURI, Ke = ye.value, Et = nt(Ge), ys = Ke;
      let kt = Ge === "value" ? ys : om(ys), ii = !1;
      if (H.attrName = Et, H.attrValue = kt, H.keepAttr = !0, H.forceKeepAttr = void 0, Yt(De.uponSanitizeAttribute, p, H), kt = H.attrValue, ie && (Et === "id" || Et === "name") && sc(kt, Ce) !== 0 && (Dt(Ge, p, ye), kt = Ce + kt, ii = !0), ke && Ct(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, kt)) {
        Dt(Ge, p, ye);
        continue;
      }
      if (Et === "attributename" && nc(kt, "href")) {
        Dt(Ge, p, ye);
        continue;
      }
      if (!H.forceKeepAttr) {
        if (!H.keepAttr) {
          Dt(Ge, p, ye);
          continue;
        }
        if (!_e && Ct(Sm, kt)) {
          Dt(Ge, p, ye);
          continue;
        }
        if (be && (kt = Ln(kt)), !lt(ae, Et, kt)) {
          Dt(Ge, p, ye);
          continue;
        }
        kt = Nn(ae, Et, st, kt), kt !== ys && _s(p, Ge, st, kt) && ii && tc(t.removed);
      }
    }
    Yt(De.afterSanitizeAttributes, p, null);
  }, an = function(p) {
    let T = null;
    const H = Hs(p);
    for (Yt(De.beforeSanitizeShadowDOM, p, null); T = H.nextNode(); )
      if (Yt(De.uponSanitizeShadowNode, T, null), Zt(T, p), yr(T), Kn(T.content) && an(T.content), ne(T) === Qt.element) {
        const ee = me(T);
        Kn(ee) && (_t(ee), an(ee));
      }
    Yt(De.afterSanitizeShadowDOM, p, null);
  }, _t = function(p) {
    const T = [{
      node: p,
      shadow: null
    }];
    for (; T.length > 0; ) {
      const H = T.pop();
      if (H.shadow) {
        an(H.shadow);
        continue;
      }
      const ee = H.node, ye = ne(ee) === Qt.element, Ge = R(ee);
      if (Ge)
        for (let st = Ge.length - 1; st >= 0; --st)
          T.push({
            node: Ge[st],
            shadow: null
          });
      if (ye) {
        const st = S ? S(ee) : null;
        if (typeof st == "string" && nt(st) === "template") {
          const Ke = ee.content;
          Kn(Ke) && T.push({
            node: Ke,
            shadow: null
          });
        }
      }
      if (ye) {
        const st = me(ee);
        Kn(st) && T.push({
          node: null,
          shadow: st
        }, {
          node: st,
          shadow: null
        });
      }
    }
  };
  return t.sanitize = function(V) {
    let p = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, T = null, H = null, ee = null, ae = null;
    if (fr = !V, fr && (V = "<!-->"), typeof V != "string" && !gn(V) && (V = fm(V), typeof V != "string"))
      throw Ss("dirty is not a string, aborting");
    if (!t.isSupported)
      return V;
    U ? (D = z, M = f) : Bs(p), (De.uponSanitizeElement.length > 0 || De.uponSanitizeAttribute.length > 0) && (D = tn(D)), De.uponSanitizeAttribute.length > 0 && (M = tn(M)), t.removed = [];
    const ye = Ie && typeof V != "string" && gn(V);
    if (ye) {
      zs(V);
      const Ke = he(V);
      if (typeof Ke == "string") {
        const Et = nt(Ke);
        if (!D[Et] || G[Et])
          throw ps(V), Ss("root node is forbidden and cannot be sanitized in-place");
      }
      if (on(V))
        throw ps(V), Ss("root node is clobbered and cannot be sanitized in-place");
      try {
        _t(V);
      } catch (Et) {
        throw ps(V), Et;
      }
    } else if (gn(V))
      T = mn("<!---->"), H = T.ownerDocument.importNode(V, !0), H.nodeType === Qt.element && H.nodeName === "BODY" || H.nodeName === "HTML" ? T = H : T.appendChild(H), _t(T);
    else {
      if (!N && !be && !Be && // eslint-disable-next-line unicorn/prefer-includes
      V.indexOf("<") === -1)
        return pe && W ? fe(V) : V;
      if (T = mn(V), !T)
        return N ? null : W ? Le : "";
    }
    T && y && Gt(T.firstChild);
    const Ge = ye ? V : T;
    try {
      const Ke = Hs(Ge);
      for (; ee = Ke.nextNode(); )
        Zt(ee, Ge), yr(ee), Kn(ee.content) && an(ee.content);
    } catch (Ke) {
      throw ye && (ps(V), Cs(t.removed, (Et) => {
        Et.element && Vn(Et.element);
      })), Ke;
    }
    if (ye)
      return Cs(t.removed, (Ke) => {
        Ke.element && Vn(Ke.element);
      }), be && js(V), V;
    if (N) {
      if (be && js(T), E)
        for (ae = ze.call(T.ownerDocument); T.firstChild; )
          ae.appendChild(T.firstChild);
      else
        ae = T;
      return (M.shadowroot || M.shadowrootmode) && (ae = vn.call(s, ae, !0)), ae;
    }
    let st = Be ? T.outerHTML : T.innerHTML;
    return Be && D["!doctype"] && T.ownerDocument && T.ownerDocument.doctype && T.ownerDocument.doctype.name && Ct(km, T.ownerDocument.doctype.name) && (st = "<!DOCTYPE " + T.ownerDocument.doctype.name + `>
` + st), be && (st = Ln(st)), pe && W ? fe(st) : st;
  }, t.setConfig = function() {
    let V = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    Bs(V), U = !0, z = D, f = M;
  }, t.clearConfig = function() {
    qn = null, U = !1, z = null, f = null, pe = Ae, Le = "";
  }, t.isValidAttribute = function(V, p, T) {
    qn || Bs({});
    const H = nt(V), ee = nt(p);
    return lt(H, ee, T);
  }, t.addHook = function(V, p) {
    typeof p == "function" && Wt(De, V) && Ir(De[V], p);
  }, t.removeHook = function(V, p) {
    if (Wt(De, V)) {
      if (p !== void 0) {
        const T = rm(De[V], p);
        return T === -1 ? void 0 : im(De[V], T, 1)[0];
      }
      return tc(De[V]);
    }
  }, t.removeHooks = function(V) {
    Wt(De, V) && (De[V] = []);
  }, t.removeAllHooks = function() {
    De = hc();
  }, t;
}
var za = Ju();
za.addHook("uponSanitizeElement", (e, t) => {
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
za.addHook("afterSanitizeAttributes", (e) => {
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
function Im(e) {
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
  return za.sanitize(e, t);
}
Ue.setOptions({
  renderer: new Ue.Renderer(),
  gfm: !0,
  breaks: !0
});
const Ti = (e) => Im(Ue(e || "")), pc = "*", Om = /* @__PURE__ */ new Set(["null", "about:blank", ""]);
let un = null;
const Vr = (e) => e && !Om.has(e) ? e : null, Lm = (e) => {
  if (!e) return null;
  try {
    return Vr(new URL(e).origin);
  } catch {
    return null;
  }
};
function Qu() {
  if (un) return un;
  if (window.parent === window)
    return un = Vr(window.location.origin) || pc, un;
  try {
    const e = Vr(window.parent.location.origin);
    if (e)
      return un = e, un;
  } catch {
  }
  try {
    const e = window.location.ancestorOrigins, t = e && e.length ? Vr(e[0]) : null;
    if (t)
      return un = t, un;
  } catch {
  }
  return un = Lm(document.referrer) || pc, un;
}
function mc(e) {
  un = Vr(e) || un;
}
function Tt(e) {
  window.parent.postMessage(e, Qu());
}
const zi = "Start a new chat", gc = "Start a new chat? This ends the current one.", Nm = "Start new chat", Pm = "Cancel", _c = "Couldn't start a new chat. Please try again.", Mm = 15e3, Dm = ["aria-label"], Fm = { class: "new-chat-confirm__question" }, $m = { class: "new-chat-confirm__actions" }, Bm = ["disabled"], Um = ["disabled"], zm = /* @__PURE__ */ Ps({
  __name: "NewChatConfirm",
  props: {
    error: {},
    busy: { type: Boolean }
  },
  emits: ["confirm", "cancel"],
  setup(e, { emit: t }) {
    const n = t;
    return (s, r) => (k(), A("div", {
      class: "new-chat-confirm",
      role: "alertdialog",
      "aria-live": "polite",
      "aria-label": x(gc)
    }, [
      g("p", Fm, Z(s.error || x(gc)), 1),
      g("div", $m, [
        g("button", {
          type: "button",
          class: "new-chat-confirm__button",
          disabled: s.busy,
          onClick: r[0] || (r[0] = (i) => n("cancel"))
        }, Z(x(Pm)), 9, Bm),
        g("button", {
          type: "button",
          class: "new-chat-confirm__button new-chat-confirm__button--primary",
          disabled: s.busy,
          onClick: r[1] || (r[1] = (i) => n("confirm"))
        }, Z(x(Nm)), 9, Um)
      ])
    ], 8, Dm));
  }
}), Ds = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [s, r] of t)
    n[s] = r;
  return n;
}, ef = /* @__PURE__ */ Ds(zm, [["__scopeId", "data-v-6c78f353"]]), Hm = { class: "askai" }, jm = { class: "askai__bar" }, Wm = ["value", "placeholder", "disabled", "aria-label", "onKeydown"], qm = ["disabled", "title", "aria-label", "aria-expanded"], Vm = { class: "askai__intro" }, Km = { class: "askai__title" }, Gm = {
  key: 0,
  class: "askai__subtitle"
}, Ym = {
  key: 0,
  class: "askai__suggestions"
}, Xm = ["disabled", "onClick"], Zm = ["aria-live"], Jm = {
  key: 0,
  class: "askai__question"
}, Qm = {
  key: 1,
  class: "askai__system"
}, eg = ["innerHTML"], tg = {
  key: 0,
  class: "askai__sources"
}, ng = ["title"], sg = {
  key: 0,
  class: "askai__thinking",
  role: "status",
  "aria-live": "polite"
}, rg = { class: "askai__thinking-text" }, ig = { class: "askai__foot" }, og = { key: 0 }, ag = /* @__PURE__ */ Ps({
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
    const n = e, s = t, r = oe(null), i = oe(null), o = oe(null), a = ["user", "bot", "agent", "system"], l = le(
      () => n.messages.map((C, P) => ({ message: C, index: P })).filter(({ message: C }) => a.includes(C.message_type))
    ), u = le(() => l.value.length > 0), c = (C) => {
      s("update:draft", C.target.value);
    }, b = () => {
      !(n.typingEnabled ?? n.inputEnabled) || !n.draft.trim() || s("send");
    }, w = (C) => {
      n.inputEnabled && s("ask", C);
    }, I = typeof navigator < "u" && /Mac|iPod|iPhone|iPad/.test(navigator.platform || ""), O = (C) => {
      if (C.key === "Escape") {
        C.preventDefault(), s("close");
        return;
      }
      const P = I ? C.metaKey && !C.ctrlKey : C.ctrlKey && !C.metaKey;
      n.hotkey && P && !C.altKey && (C.key === "k" || C.key === "K") && (C.preventDefault(), s("close"));
    }, j = () => {
      rs(() => {
        var C;
        return (C = r.value) == null ? void 0 : C.focus();
      });
    };
    let ce = 0;
    const R = () => {
      if (!o.value) return;
      const C = o.value.closest(".askai"), P = i.value;
      if (!C || !P) return;
      const S = C.offsetHeight - P.offsetHeight, q = getComputedStyle(P), ne = parseFloat(q.paddingTop) + parseFloat(q.paddingBottom), he = Math.ceil(S + ne + o.value.getBoundingClientRect().height);
      Math.abs(he - ce) < 3 || (ce = he, Tt({ type: "WIDGET_RESIZE", height: he }));
    };
    let ue = null;
    const me = le(
      () => l.value.reduce((C, { message: P, index: S }) => C + n.displayText(S, P.message || "").length, 0)
    );
    return bt(
      () => [l.value.length, me.value, n.loading],
      () => rs(() => {
        i.value && (i.value.scrollTop = i.value.scrollHeight);
      })
    ), bt(() => n.newChatArmed, () => rs(() => R())), bt(() => n.active, (C) => {
      C && j();
    }), eo(() => {
      n.active && j(), window.addEventListener("keydown", O), o.value && typeof ResizeObserver < "u" && (ue = new ResizeObserver(() => R()), ue.observe(o.value)), R();
    }), to(() => {
      window.removeEventListener("keydown", O), ue == null || ue.disconnect(), ue = null;
    }), (C, P) => (k(), A("div", Hm, [
      g("div", jm, [
        P[6] || (P[6] = g("svg", {
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
          onInput: c,
          onKeydown: wi(Es(b, ["prevent"]), ["enter"])
        }, null, 40, Wm),
        C.canStartNewChat ? (k(), A("button", {
          key: 0,
          type: "button",
          class: Pe(["askai__new", { "askai__new--armed": C.newChatArmed }]),
          disabled: C.startingNewChat,
          title: x(zi),
          "aria-label": x(zi),
          "aria-expanded": C.newChatArmed,
          onClick: P[0] || (P[0] = (S) => s("newChat"))
        }, P[4] || (P[4] = [
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
        ]), 10, qm)) : re("", !0),
        g("button", {
          type: "button",
          class: "askai__close",
          "aria-label": "Close",
          title: "Close (Esc)",
          onClick: P[1] || (P[1] = (S) => s("close"))
        }, P[5] || (P[5] = [
          g("span", { class: "askai__kbd" }, "Esc", -1)
        ]))
      ]),
      C.newChatArmed && C.canStartNewChat ? (k(), ns(ef, {
        key: 0,
        busy: C.startingNewChat,
        error: C.newChatError,
        onConfirm: P[2] || (P[2] = (S) => s("confirmNewChat")),
        onCancel: P[3] || (P[3] = (S) => s("cancelNewChat"))
      }, null, 8, ["busy", "error"])) : re("", !0),
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
          u.value ? (k(), A(Oe, { key: 1 }, [
            (k(!0), A(Oe, null, ft(l.value, ({ message: S, index: q }) => (k(), A("div", {
              key: q,
              class: "askai__turn",
              "aria-live": C.isStreaming(q) ? "off" : "polite"
            }, [
              S.message_type === "user" ? (k(), A("p", Jm, Z(S.message), 1)) : S.message_type === "system" ? (k(), A("p", Qm, Z(S.message), 1)) : (k(), A(Oe, { key: 2 }, [
                g("div", {
                  class: Pe(["askai__answer", { "askai__answer--streaming": C.isStreaming(q) }]),
                  innerHTML: x(Ti)(C.isStreaming(q) ? C.displayText(q, S.message || "") : S.message || "")
                }, null, 10, eg),
                C.showCitations && !C.isStreaming(q) && S.sources && S.sources.length ? (k(), A("div", tg, [
                  P[9] || (P[9] = g("span", { class: "askai__label" }, "Sources", -1)),
                  (k(!0), A(Oe, null, ft(S.sources, (ne, he) => (k(), A("span", {
                    key: he,
                    class: "askai__source",
                    title: C.citationTooltip(ne)
                  }, Z(C.citationLabel(ne)), 9, ng))), 128))
                ])) : re("", !0)
              ], 64))
            ], 8, Zm))), 128)),
            C.loading ? (k(), A("div", sg, [
              P[10] || (P[10] = g("span", { class: "askai__dot" }, null, -1)),
              P[11] || (P[11] = g("span", { class: "askai__dot" }, null, -1)),
              P[12] || (P[12] = g("span", { class: "askai__dot" }, null, -1)),
              g("span", rg, Z(C.showCitations ? "Searching the knowledge base" : "Thinking"), 1)
            ])) : re("", !0)
          ], 64)) : (k(), A(Oe, { key: 0 }, [
            g("div", Vm, [
              g("h2", Km, Z(C.welcomeTitle || `Ask ${C.agentName}`), 1),
              C.welcomeSubtitle ? (k(), A("p", Gm, Z(C.welcomeSubtitle), 1)) : re("", !0)
            ]),
            C.suggestions.length && !C.draft.trim() ? (k(), A("div", Ym, [
              P[8] || (P[8] = g("p", { class: "askai__label" }, "Suggested", -1)),
              (k(!0), A(Oe, null, ft(C.suggestions, (S) => (k(), A("button", {
                key: S,
                type: "button",
                class: "askai__suggestion",
                disabled: !C.inputEnabled,
                onClick: (q) => w(S)
              }, [
                g("span", null, Z(S), 1),
                P[7] || (P[7] = g("svg", {
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
              ], 8, Xm))), 128))
            ])) : re("", !0)
          ], 64))
        ], 512)
      ], 512),
      g("div", ig, [
        C.disclaimer ? (k(), A("span", og, Z(C.disclaimer), 1)) : re("", !0),
        P[13] || (P[13] = g("a", {
          class: "askai__brand",
          href: "https://chattermate.chat",
          target: "_blank",
          rel: "noopener noreferrer"
        }, "Powered by ChatterMate", -1))
      ])
    ]));
  }
}), lg = /* @__PURE__ */ Ds(ag, [["__scopeId", "data-v-edea9534"]]), cg = 40;
function Hi(e) {
  if (typeof e == "number" || typeof e == "boolean") return String(e);
  if (typeof e != "string") return null;
  const t = e.trim();
  return t && t.length <= cg && !t.includes(`
`) ? t : null;
}
function ug(e) {
  var s, r;
  const t = Hi((s = e.preview) == null ? void 0 : s.before), n = Hi((r = e.preview) == null ? void 0 : r.after);
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
function fg(e, t, n, s) {
  if (!s) return { approve: e, decline: "Not now" };
  const r = Hi(t), i = Hi(n);
  return {
    approve: i ? `Change to ${i}` : "Change it",
    decline: r ? `Keep ${r}` : "Keep current"
  };
}
const dg = ["aria-label"], hg = { class: "cm-action-head" }, pg = { class: "cm-action-row before" }, mg = { class: "cm-action-text" }, gg = { class: "cm-action-row after" }, _g = { class: "cm-action-text" }, yg = {
  key: 1,
  class: "cm-action-args"
}, vg = { class: "cm-action-buttons" }, bg = /* @__PURE__ */ Ps({
  __name: "ActionConfirmCard",
  props: {
    pending: {}
  },
  emits: ["approve", "decline"],
  setup(e, { emit: t }) {
    const n = e, s = t, r = le(() => !!n.pending.preview);
    function i(u) {
      return u == null || u === "" ? "—" : typeof u == "string" ? u : JSON.stringify(u, null, 2);
    }
    function o(u) {
      const c = u.replace(/[_-]+/g, " ").trim();
      return c.charAt(0).toUpperCase() + c.slice(1);
    }
    const a = le(
      () => n.pending.details ?? Object.entries(n.pending.request.args || {}).map(([u, c]) => ({ key: o(u), value: i(c) }))
    ), l = le(
      () => {
        var u, c;
        return fg(n.pending.request.label, (u = n.pending.preview) == null ? void 0 : u.before, (c = n.pending.preview) == null ? void 0 : c.after, r.value);
      }
    );
    return (u, c) => {
      var b, w;
      return k(), A("div", {
        class: "cm-action-confirm",
        role: "group",
        "aria-label": u.pending.request.label
      }, [
        g("div", hg, Z(u.pending.request.label) + "?", 1),
        r.value ? (k(), A(Oe, { key: 0 }, [
          g("div", pg, [
            c[2] || (c[2] = g("span", { class: "cm-action-tag" }, "Current", -1)),
            g("span", mg, Z(i((b = u.pending.preview) == null ? void 0 : b.before)), 1)
          ]),
          g("div", gg, [
            c[3] || (c[3] = g("span", { class: "cm-action-tag" }, "New", -1)),
            g("span", _g, Z(i((w = u.pending.preview) == null ? void 0 : w.after)), 1)
          ])
        ], 64)) : a.value.length ? (k(), A("dl", yg, [
          (k(!0), A(Oe, null, ft(a.value, (I) => (k(), A(Oe, {
            key: I.key
          }, [
            g("dt", null, Z(I.key), 1),
            g("dd", null, Z(I.value), 1)
          ], 64))), 128))
        ])) : re("", !0),
        g("div", vg, [
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
      ], 8, dg);
    };
  }
}), wg = /* @__PURE__ */ Ds(bg, [["__scopeId", "data-v-bdc9ad66"]]), kg = {
  key: 0,
  class: "cm-receipt-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, Tg = {
  key: 1,
  class: "cm-receipt-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, Ag = {
  key: 2,
  class: "cm-receipt-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, Sg = { class: "cm-visually-hidden" }, xg = { class: "cm-receipt-text" }, Eg = /* @__PURE__ */ Ps({
  __name: "ActionReceiptLine",
  props: {
    receipt: {}
  },
  setup(e) {
    return (t, n) => (k(), A("div", {
      class: Pe(["cm-receipt", t.receipt.tone]),
      role: "status"
    }, [
      t.receipt.tone === "done" ? (k(), A("svg", kg, n[0] || (n[0] = [
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
      ]))) : t.receipt.tone === "failed" ? (k(), A("svg", Tg, n[1] || (n[1] = [
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
      ]))) : (k(), A("svg", Ag, n[2] || (n[2] = [
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
      g("span", Sg, Z(t.receipt.tone === "done" ? "Done:" : t.receipt.tone === "failed" ? "Failed:" : "Skipped:"), 1),
      g("span", xg, Z(t.receipt.text), 1)
    ], 2));
  }
}), Cg = /* @__PURE__ */ Ds(Eg, [["__scopeId", "data-v-be379090"]]), Rg = { class: "cm-plan-pin" }, Ig = ["aria-label"], Og = ["aria-expanded"], Lg = { class: "cm-plan-label" }, Ng = { class: "cm-plan-name" }, Pg = {
  key: 0,
  class: "cm-plan-now"
}, Mg = { class: "cm-plan-count" }, Dg = ["aria-valuenow", "aria-valuemax", "aria-label"], Fg = {
  key: 0,
  class: "cm-plan-steps"
}, $g = ["aria-current"], Bg = {
  key: 0,
  class: "cm-plan-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, Ug = {
  key: 1,
  class: "cm-plan-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, zg = {
  key: 2,
  class: "cm-plan-icon",
  "aria-hidden": "true",
  viewBox: "0 0 24 24"
}, Hg = { class: "cm-plan-title" }, jg = {
  key: 3,
  class: "cm-visually-hidden"
}, Wg = { class: "cm-plan-actions" }, qg = /* @__PURE__ */ Ps({
  __name: "JourneyPlan",
  props: {
    progress: {}
  },
  emits: ["skip", "hide"],
  setup(e, { emit: t }) {
    const n = e, s = t, r = oe(!1);
    bt(() => n.progress.finished, (l) => {
      l && (r.value = !1);
    });
    const i = le(() => Math.min(n.progress.index, n.progress.count)), o = le(() => n.progress.count ? Math.round(i.value / n.progress.count * 100) : 0), a = le(
      () => n.progress.titles.map((l, u) => ({
        title: l,
        state: u < i.value ? "done" : u === n.progress.index ? "now" : "todo"
      }))
    );
    return (l, u) => (k(), A("div", Rg, [
      g("section", {
        class: Pe(["cm-plan", { finished: l.progress.finished }]),
        "aria-label": `Guide: ${l.progress.name}`
      }, [
        g("button", {
          type: "button",
          class: "cm-plan-head",
          "aria-expanded": r.value,
          onClick: u[0] || (u[0] = (c) => r.value = !r.value)
        }, [
          g("span", Lg, [
            g("span", Ng, Z(l.progress.name), 1),
            !l.progress.finished && l.progress.title ? (k(), A("span", Pg, Z(l.progress.title), 1)) : re("", !0)
          ]),
          g("span", Mg, Z(l.progress.finished ? "Done" : `${i.value} of ${l.progress.count}`), 1),
          (k(), A("svg", {
            class: Pe(["cm-plan-chevron", { open: r.value }]),
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
        ], 8, Og),
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
        ], 8, Dg),
        r.value ? (k(), A(Oe, { key: 0 }, [
          a.value.length ? (k(), A("ol", Fg, [
            (k(!0), A(Oe, null, ft(a.value, (c, b) => (k(), A("li", {
              key: b,
              class: Pe(c.state),
              "aria-current": c.state === "now" ? "step" : void 0
            }, [
              c.state === "done" ? (k(), A("svg", Bg, u[4] || (u[4] = [
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
              ]))) : c.state === "now" ? (k(), A("svg", Ug, u[5] || (u[5] = [
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
              ]))) : (k(), A("svg", zg, u[6] || (u[6] = [
                g("circle", {
                  cx: "12",
                  cy: "12",
                  r: "9",
                  class: "ring todo"
                }, null, -1)
              ]))),
              g("span", Hg, Z(c.title), 1),
              c.state === "done" ? (k(), A("span", jg, "(done)")) : re("", !0)
            ], 10, $g))), 128))
          ])) : re("", !0),
          g("div", Wg, [
            l.progress.skippable ? (k(), A("button", {
              key: 0,
              type: "button",
              onClick: u[1] || (u[1] = (c) => s("skip"))
            }, "Skip this step")) : re("", !0),
            g("button", {
              type: "button",
              onClick: u[2] || (u[2] = (c) => s("hide"))
            }, "Hide guide")
          ])
        ], 64)) : re("", !0)
      ], 10, Ig)
    ]));
  }
}), Vg = /* @__PURE__ */ Ds(qg, [["__scopeId", "data-v-016d08e3"]]), Kg = {
  class: "cm-replies",
  role: "group",
  "aria-label": "Suggested replies"
}, Gg = ["disabled", "onClick"], Yg = /* @__PURE__ */ Ps({
  __name: "SuggestedReplies",
  props: {
    chips: {},
    disabled: { type: Boolean }
  },
  emits: ["pick"],
  setup(e, { emit: t }) {
    const n = t;
    return (s, r) => (k(), A("div", Kg, [
      (k(!0), A(Oe, null, ft(s.chips, (i) => (k(), A("button", {
        key: i.label,
        type: "button",
        class: "cm-reply",
        disabled: s.disabled,
        onClick: (o) => n("pick", i)
      }, Z(i.label), 9, Gg))), 128))
    ]));
  }
}), Xg = /* @__PURE__ */ Ds(Yg, [["__scopeId", "data-v-7b650713"]]);
function Zg(e) {
  const t = oe([]);
  function n(r) {
    t.value.push({ after: e.value.length, receipt: ug(r) });
  }
  function s(r) {
    return t.value.filter((i) => i.after === r).map((i) => i.receipt);
  }
  return bt(() => e.value.length, (r) => {
    r === 0 ? t.value = [] : t.value.some((i) => i.after > r) && (t.value = t.value.filter((i) => i.after <= r));
  }), { receipts: t, addReceipt: n, receiptsAfter: s };
}
const Jg = "Please don't paste passwords or keys here.", Qg = [
  /\bsk-(?:proj-|ant-)?[A-Za-z0-9_-]{20,}/,
  /\bcmat_[A-Za-z0-9_-]{16,}/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{30,}/,
  /\bxox[abposr]-[A-Za-z0-9-]{10,}/
], e_ = /\b(password|passwd|pwd|passcode|api[ _-]?key|secret)\s*(?:is|:|=)\s*\S+/i, t_ = /\b(?:\d[ -]?){12,18}\d\b/g;
function n_(e) {
  let t = 0;
  for (let n = 0; n < e.length; n++) {
    let s = Number(e[e.length - 1 - n]);
    n % 2 === 1 && (s *= 2, s > 9 && (s -= 9)), t += s;
  }
  return t % 10 === 0;
}
function s_(e) {
  return e ? Qg.some((t) => t.test(e)) || e_.test(e) ? !0 : (e.match(t_) || []).some((t) => {
    const n = t.replace(/\D/g, "");
    return n.length >= 13 && n.length <= 19 && n_(n);
  }) : !1;
}
const Dr = [
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
], r_ = (e) => (e || "").split("").reduce((t, n) => t + n.charCodeAt(0), 0) % Dr.length, i_ = (e) => {
  const t = Dr[(e % Dr.length + Dr.length) % Dr.length];
  return {
    background: `
            radial-gradient(circle at 32% 28%, rgba(255,255,255,0.22) 0%, transparent 42%),
            radial-gradient(circle at 68% 72%, rgba(0,0,0,0.25) 0%, transparent 38%),
            radial-gradient(ellipse at 50% 50%, ${t.stops})
        `.trim(),
    boxShadow: `0 4px 28px ${t.glow}, inset 0 1px 0 rgba(255,255,255,0.15)`,
    borderRadius: "50%"
  };
}, o_ = (e, t) => {
  const n = typeof t == "number" && Number.isFinite(t) ? t : r_(e);
  return i_(n);
}, yc = (e) => {
  var t;
  return !!((t = e == null ? void 0 : e.attributes) != null && t.end_chat);
}, vc = "AI can make mistakes. Check important info.";
function a_(e, t = !1) {
  return e !== !1 && !t;
}
const Bo = {
  ai: "Online · replies instantly",
  human: "Online · usually replies in a few minutes",
  away: "Away · we'll reply when we're back"
};
function l_(e, t = !1) {
  return (t ? "human" : (e == null ? void 0 : e.mode) ?? "ai") === "ai" ? { text: Bo.ai, online: !0 } : (e == null ? void 0 : e.available) !== !1 ? { text: Bo.human, online: !0 } : { text: Bo.away, online: !1 };
}
const tf = (e) => !!e && (/^https?:\/\//i.test(e) || e.startsWith("data:")), c_ = (e, t) => e ? tf(e) || e.startsWith("blob:") ? e : `${t.replace(/\/api\/v1\/?$/, "")}${e.startsWith("/") ? "" : "/"}${e}` : "";
function bc() {
  return typeof window < "u" && window.APP_CONFIG ? window.APP_CONFIG : {};
}
const Ns = {
  get API_URL() {
    return bc().API_URL || "https://api.chattermate.chat/api/v1";
  },
  get WS_URL() {
    return bc().WS_URL || "wss://api.chattermate.chat";
  }
};
function ji(e) {
  return c_(e, Ns.API_URL);
}
const nf = "ctid", u_ = "identity_expired", f_ = "invalid_token", wc = 0.8, d_ = 720 * 60 * 1e3, Uo = 30 * 1e3, zo = 1e3, os = (e) => {
  if (typeof e != "string") return e ? String(e) : null;
  const t = e.trim();
  return !t || t === "undefined" || t === "null" ? null : t;
}, Ai = (e) => {
  const t = os(e);
  if (!t) return null;
  const [, n] = t.split(".");
  if (!n) return null;
  try {
    const s = atob(n.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(s);
  } catch {
    return null;
  }
}, h_ = async (e) => {
  var t, n;
  try {
    return (n = (t = await e.json()) == null ? void 0 : t.detail) == null ? void 0 : n.code;
  } catch {
    return;
  }
}, Wi = (e = nf) => ({
  read: () => {
    try {
      return os(localStorage.getItem(e));
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
}), p_ = () => ({
  read: () => null,
  write: () => {
  },
  clear: () => {
  }
});
function m_(e = {}) {
  const t = e.store ?? Wi(), n = oe(null);
  let s = null, r = null;
  const i = () => {
    s && (clearTimeout(s), s = null);
  }, o = () => {
    const j = Ai(n.value);
    return j != null && j.exp ? Number(j.exp) - Math.floor(Date.now() / zo) : null;
  }, a = () => {
    const j = Ai(n.value);
    if (!(j != null && j.exp)) return !1;
    const ce = j.iat ? Number(j.exp) - Number(j.iat) : 0, R = o() ?? 0;
    return ce <= 0 ? R <= 0 : R <= ce * (1 - wc);
  }, l = (j, { persist: ce = !0 } = {}) => {
    var me, C;
    const R = os(j), ue = !!n.value;
    if (i(), n.value = R, !R) {
      t.clear(), ue && ((me = e.onTokenCleared) == null || me.call(e));
      return;
    }
    ce && (t.write(R), (C = e.onTokenChanged) == null || C.call(e, R)), b();
  }, u = async (j) => {
    if (!n.value || !j) return !1;
    if (r) return r;
    const ce = n.value;
    return r = (async () => {
      var R, ue;
      try {
        const me = await fetch(`${Ns.API_URL}/refresh-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ce}`
          },
          body: JSON.stringify({ widget_id: j })
        });
        if (me.status === 401)
          return await h_(me) !== f_ && ((R = e.onIdentityExpired) == null || R.call(e)), !1;
        if (!me.ok)
          return b(Uo), !1;
        const C = await me.json(), P = os((ue = C == null ? void 0 : C.data) == null ? void 0 : ue.token);
        return P ? (l(P), !0) : !1;
      } catch {
        return b(Uo), !1;
      } finally {
        r = null;
      }
    })(), r;
  }, c = async (j) => n.value ? a() ? u(j) : !0 : !1, b = (j) => {
    i();
    const ce = Ai(n.value);
    if (!(ce != null && ce.exp) || !(ce != null && ce.iat)) return;
    const R = (Number(ce.exp) - Number(ce.iat)) * zo, ue = (o() ?? 0) * zo, me = j ?? Math.min(
      d_,
      Math.max(0, ue - R * (1 - wc))
    );
    s = setTimeout(() => {
      s = null, c(w).then((C) => {
        b(C ? void 0 : Uo);
      });
    }, me);
  };
  let w = "";
  return {
    token: n,
    start: (j, ce) => {
      w = j;
      const R = os(ce) || t.read();
      l(R, { persist: !1 }), R && t.write(R);
    },
    stop: () => {
      i(), r = null;
    },
    setToken: l,
    ensureFresh: c
  };
}
const ar = window.__CM_FRAME__, sf = "null";
let Is = !1, rf = !1, of = null;
const qi = () => !!ar, Rs = () => !ar || Is && !rf, af = () => of, lf = (e) => {
  typeof e == "string" && e && (of = e);
}, cf = (e) => ar ? Is ? p_() : Wi(`${nf}:${e}`) : Wi(), g_ = () => new Promise((e) => {
  const t = (n) => {
    var r;
    if (n.source !== window.parent || ((r = n.data) == null ? void 0 : r.type) !== "HOST_INIT") return;
    window.removeEventListener("message", t);
    const s = n.origin === sf;
    e({
      origin: n.origin,
      // An opaque host can't be addressed, so nothing it hands over can be
      // answered safely: such a frame runs as an anonymous visitor.
      token: s ? null : os(n.data.token),
      pageUrl: typeof n.data.pageUrl == "string" ? n.data.pageUrl : null
    });
  };
  window.addEventListener("message", t), window.parent.postMessage({ type: "FRAME_READY" }, "*");
}), __ = async (e) => {
  var t;
  try {
    const n = await e.json();
    return ((t = n == null ? void 0 : n.detail) == null ? void 0 : t.code) || "unavailable";
  } catch {
    return "unavailable";
  }
}, kc = () => {
  const e = document.getElementById("app");
  e && (e.textContent = "Chat is unavailable right now.");
};
async function y_() {
  if (!ar) return !0;
  const e = new URL(window.location.href).searchParams;
  Is = e.get("host") === "1" && window.parent !== window;
  let t, n = null;
  if (Is) {
    const o = await g_();
    o.origin !== sf ? (mc(o.origin), n = o.origin) : (rf = !0, mc("*")), lf(o.pageUrl), t = o.token;
  } else
    t = cf(ar.widgetId).read();
  let s;
  try {
    s = await fetch(`${Ns.API_URL}/widgets/${encodeURIComponent(ar.widgetId)}/bootstrap`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...t ? { Authorization: `Bearer ${t}` } : {}
      },
      body: JSON.stringify({ host_origin: n, source: e.get("source") })
    });
  } catch {
    return Is ? Tt({ type: "WIDGET_ERROR", code: "unavailable" }) : kc(), !1;
  }
  if (!s.ok) {
    const o = await __(s);
    return Is ? Tt({ type: "WIDGET_ERROR", code: o }) : kc(), !1;
  }
  const r = await s.json();
  window.__INITIAL_DATA__ = r;
  const i = os(r.initialToken);
  return Rs() && i && i !== t && Tt({ type: "TOKEN_UPDATE", token: i }), !0;
}
const v_ = () => {
  Is && Tt({ type: "WIDGET_READY" });
};
function b_(e) {
  const t = le(() => ({
    backgroundColor: "var(--cm-card)",
    color: "var(--cm-text)"
  })), n = le(() => ({
    backgroundColor: e.value.chat_bubble_color || "#C9F24E",
    color: ir(e.value.chat_bubble_color || "#C9F24E") ? "#FFFFFF" : "#000000"
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
  })), a = le(() => ji(e.value.photo_url)), l = le(() => {
    const u = e.value.chat_background_color || "#ffffff";
    return {
      boxShadow: `0 8px 5px ${ir(u) ? "rgba(0, 0, 0, 0.24)" : "rgba(0, 0, 0, 0.12)"}`
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
const w_ = /* @__PURE__ */ new Set(["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]), k_ = /* @__PURE__ */ new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);
[...w_, ...k_];
function T_(e, t) {
  const n = oe([]), s = oe(!1), r = oe(null), i = (P) => {
    if (P === 0) return "0 Bytes";
    const S = 1024, q = ["Bytes", "KB", "MB", "GB"], ne = Math.floor(Math.log(P) / Math.log(S));
    return parseFloat((P / Math.pow(S, ne)).toFixed(2)) + " " + q[ne];
  }, o = (P) => P.startsWith("image/"), a = (P) => P ? ji(P) : "", l = (P) => {
    const S = P.file_url || P.url;
    return S ? ji(S) : "";
  }, u = async (P) => {
    const S = P.target;
    S.files && S.files.length > 0 && (await j(Array.from(S.files)), S.value = "");
  }, c = async (P) => {
    var q;
    P.preventDefault();
    const S = (q = P.dataTransfer) == null ? void 0 : q.files;
    S && S.length > 0 && await j(Array.from(S));
  }, b = (P) => {
    P.preventDefault();
  }, w = (P) => {
    P.preventDefault();
  }, I = async (P) => {
    var ne;
    const S = (ne = P.clipboardData) == null ? void 0 : ne.items;
    if (!S) return;
    const q = [];
    for (const he of Array.from(S))
      if (he.kind === "file") {
        const pe = he.getAsFile();
        pe && q.push(pe);
      }
    q.length > 0 && await j(q);
  }, O = async (P, S = 500) => new Promise((q, ne) => {
    const he = new FileReader();
    he.onload = (pe) => {
      var Ae;
      const Le = new Image();
      Le.onload = () => {
        const Ve = document.createElement("canvas");
        let $e = Le.width, et = Le.height;
        const fe = 1920;
        ($e > fe || et > fe) && ($e > et ? (et = et / $e * fe, $e = fe) : ($e = $e / et * fe, et = fe)), Ve.width = $e, Ve.height = et;
        const we = Ve.getContext("2d");
        if (!we) {
          ne(new Error("Failed to get canvas context"));
          return;
        }
        we.drawImage(Le, 0, 0, $e, et);
        let ge = 0.9;
        const Ye = () => {
          Ve.toBlob((Xe) => {
            if (!Xe) {
              ne(new Error("Failed to compress image"));
              return;
            }
            if (Xe.size / 1024 > S && ge > 0.3)
              ge -= 0.1, Ye();
            else {
              const ze = new FileReader();
              ze.onload = () => {
                const Lt = ze.result.split(",")[1];
                q({ blob: Xe, base64: Lt });
              }, ze.readAsDataURL(Xe);
            }
          }, P.type === "image/png" ? "image/png" : "image/jpeg", ge);
        };
        Ye();
      }, Le.onerror = () => ne(new Error("Failed to load image")), Le.src = (Ae = pe.target) == null ? void 0 : Ae.result;
    }, he.onerror = () => ne(new Error("Failed to read file")), he.readAsDataURL(P);
  }), j = async (P) => {
    if (n.value.length >= 3) {
      alert("Maximum 3 files allowed per message");
      return;
    }
    const pe = 3 - n.value.length, Le = P.slice(0, pe);
    P.length > pe && alert(`Only ${pe} more file(s) can be uploaded. Maximum 3 files per message.`);
    for (const Ae of Le)
      try {
        if (n.value.some((fe) => fe.filename === Ae.name)) {
          console.warn(`File ${Ae.name} is already selected`), alert(`File "${Ae.name}" is already selected`);
          continue;
        }
        const $e = Ae.type.startsWith("image/"), et = $e ? 5242880 : 10485760;
        if (Ae.size > et) {
          const fe = et / 1048576;
          console.error(`File ${Ae.name} is too large. Maximum size is ${fe}MB`), alert(`File "${Ae.name}" is too large. Maximum size for ${$e ? "images" : "documents"} is ${fe}MB`);
          continue;
        }
        if ($e)
          try {
            const { blob: fe, base64: we } = await O(Ae, 500), ge = fe.size;
            console.log(`Compressed ${Ae.name}: ${(Ae.size / 1024).toFixed(2)}KB → ${(ge / 1024).toFixed(2)}KB`), n.value.push({
              content: we,
              filename: Ae.name,
              type: Ae.type,
              size: ge,
              url: URL.createObjectURL(fe),
              file_url: URL.createObjectURL(fe)
            });
          } catch (fe) {
            console.error("Image compression failed, uploading original:", fe);
            const we = new FileReader();
            we.onload = (ge) => {
              var rt;
              const Xe = ((rt = ge.target) == null ? void 0 : rt.result).split(",")[1];
              n.value.push({
                content: Xe,
                filename: Ae.name,
                type: Ae.type,
                size: Ae.size,
                url: URL.createObjectURL(Ae),
                file_url: URL.createObjectURL(Ae)
              });
            }, we.readAsDataURL(Ae);
          }
        else {
          const fe = new FileReader();
          fe.onload = (we) => {
            var Xe;
            const Ye = ((Xe = we.target) == null ? void 0 : Xe.result).split(",")[1];
            n.value.push({
              content: Ye,
              filename: Ae.name,
              type: Ae.type || "application/octet-stream",
              size: Ae.size,
              url: "",
              file_url: ""
            });
          }, fe.readAsDataURL(Ae);
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
    handleFileSelect: u,
    handleDrop: c,
    handleDragOver: b,
    handleDragLeave: w,
    handlePaste: I,
    uploadFiles: j,
    removeAttachment: async (P) => {
      const S = n.value[P];
      if (S) {
        try {
          let q = S.url;
          if (q.startsWith("/uploads/") ? q = q.substring(9) : q.startsWith("/") && (q = q.substring(1)), tf(q))
            try {
              q = new URL(q).pathname.replace(/^\/+/, "");
            } catch {
            }
          const ne = {};
          e.value && (ne.Authorization = `Bearer ${e.value}`);
          const he = await fetch(`${Ns.API_URL}/files/upload/${q}`, {
            method: "DELETE",
            headers: ne
          });
          if (he.ok)
            console.log("File deleted successfully from backend.");
          else {
            const pe = await he.json();
            console.error("Failed to delete file:", pe.detail);
          }
        } catch (q) {
          console.error("Error calling delete API:", q);
        }
        S.url && S.url.startsWith("blob:") && URL.revokeObjectURL(S.url), S.file_url && S.file_url.startsWith("blob:") && URL.revokeObjectURL(S.file_url), n.value.splice(P, 1);
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
const In = /* @__PURE__ */ Object.create(null);
In.open = "0";
In.close = "1";
In.ping = "2";
In.pong = "3";
In.message = "4";
In.upgrade = "5";
In.noop = "6";
const Si = /* @__PURE__ */ Object.create(null);
Object.keys(In).forEach((e) => {
  Si[In[e]] = e;
});
const fa = { type: "error", data: "parser error" }, uf = typeof Blob == "function" || typeof Blob < "u" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]", ff = typeof ArrayBuffer == "function", df = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e && e.buffer instanceof ArrayBuffer, Ha = ({ type: e, data: t }, n, s) => uf && t instanceof Blob ? n ? s(t) : Tc(t, s) : ff && (t instanceof ArrayBuffer || df(t)) ? n ? s(t) : Tc(new Blob([t]), s) : s(In[e] + (t || "")), Tc = (e, t) => {
  const n = new FileReader();
  return n.onload = function() {
    const s = n.result.split(",")[1];
    t("b" + (s || ""));
  }, n.readAsDataURL(e);
};
function Ac(e) {
  return e instanceof Uint8Array ? e : e instanceof ArrayBuffer ? new Uint8Array(e) : new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
}
let Ho;
function A_(e, t) {
  if (uf && e.data instanceof Blob)
    return e.data.arrayBuffer().then(Ac).then(t);
  if (ff && (e.data instanceof ArrayBuffer || df(e.data)))
    return t(Ac(e.data));
  Ha(e, !1, (n) => {
    Ho || (Ho = new TextEncoder()), t(Ho.encode(n));
  });
}
const Sc = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", Fr = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (let e = 0; e < Sc.length; e++)
  Fr[Sc.charCodeAt(e)] = e;
const S_ = (e) => {
  let t = e.length * 0.75, n = e.length, s, r = 0, i, o, a, l;
  e[e.length - 1] === "=" && (t--, e[e.length - 2] === "=" && t--);
  const u = new ArrayBuffer(t), c = new Uint8Array(u);
  for (s = 0; s < n; s += 4)
    i = Fr[e.charCodeAt(s)], o = Fr[e.charCodeAt(s + 1)], a = Fr[e.charCodeAt(s + 2)], l = Fr[e.charCodeAt(s + 3)], c[r++] = i << 2 | o >> 4, c[r++] = (o & 15) << 4 | a >> 2, c[r++] = (a & 3) << 6 | l & 63;
  return u;
}, x_ = typeof ArrayBuffer == "function", ja = (e, t) => {
  if (typeof e != "string")
    return {
      type: "message",
      data: hf(e, t)
    };
  const n = e.charAt(0);
  return n === "b" ? {
    type: "message",
    data: E_(e.substring(1), t)
  } : Si[n] ? e.length > 1 ? {
    type: Si[n],
    data: e.substring(1)
  } : {
    type: Si[n]
  } : fa;
}, E_ = (e, t) => {
  if (x_) {
    const n = S_(e);
    return hf(n, t);
  } else
    return { base64: !0, data: e };
}, hf = (e, t) => {
  switch (t) {
    case "blob":
      return e instanceof Blob ? e : new Blob([e]);
    case "arraybuffer":
    default:
      return e instanceof ArrayBuffer ? e : e.buffer;
  }
}, pf = "", C_ = (e, t) => {
  const n = e.length, s = new Array(n);
  let r = 0;
  e.forEach((i, o) => {
    Ha(i, !1, (a) => {
      s[o] = a, ++r === n && t(s.join(pf));
    });
  });
}, R_ = (e, t) => {
  const n = e.split(pf), s = [];
  for (let r = 0; r < n.length; r++) {
    const i = ja(n[r], t);
    if (s.push(i), i.type === "error")
      break;
  }
  return s;
};
function I_() {
  return new TransformStream({
    transform(e, t) {
      A_(e, (n) => {
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
let jo;
function pi(e) {
  return e.reduce((t, n) => t + n.length, 0);
}
function mi(e, t) {
  if (e[0].length === t)
    return e.shift();
  const n = new Uint8Array(t);
  let s = 0;
  for (let r = 0; r < t; r++)
    n[r] = e[0][s++], s === e[0].length && (e.shift(), s = 0);
  return e.length && s < e[0].length && (e[0] = e[0].slice(s)), n;
}
function O_(e, t) {
  jo || (jo = new TextDecoder());
  const n = [];
  let s = 0, r = -1, i = !1;
  return new TransformStream({
    transform(o, a) {
      for (n.push(o); ; ) {
        if (s === 0) {
          if (pi(n) < 1)
            break;
          const l = mi(n, 1);
          i = (l[0] & 128) === 128, r = l[0] & 127, r < 126 ? s = 3 : r === 126 ? s = 1 : s = 2;
        } else if (s === 1) {
          if (pi(n) < 2)
            break;
          const l = mi(n, 2);
          r = new DataView(l.buffer, l.byteOffset, l.length).getUint16(0), s = 3;
        } else if (s === 2) {
          if (pi(n) < 8)
            break;
          const l = mi(n, 8), u = new DataView(l.buffer, l.byteOffset, l.length), c = u.getUint32(0);
          if (c > Math.pow(2, 21) - 1) {
            a.enqueue(fa);
            break;
          }
          r = c * Math.pow(2, 32) + u.getUint32(4), s = 3;
        } else {
          if (pi(n) < r)
            break;
          const l = mi(n, r);
          a.enqueue(ja(i ? l : jo.decode(l), t)), s = 0;
        }
        if (r === 0 || r > e) {
          a.enqueue(fa);
          break;
        }
      }
    }
  });
}
const mf = 4;
function ht(e) {
  if (e) return L_(e);
}
function L_(e) {
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
const ao = typeof Promise == "function" && typeof Promise.resolve == "function" ? (t) => Promise.resolve().then(t) : (t, n) => n(t, 0), fn = typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")(), N_ = "arraybuffer";
function gf(e, ...t) {
  return t.reduce((n, s) => (e.hasOwnProperty(s) && (n[s] = e[s]), n), {});
}
const P_ = fn.setTimeout, M_ = fn.clearTimeout;
function lo(e, t) {
  t.useNativeTimers ? (e.setTimeoutFn = P_.bind(fn), e.clearTimeoutFn = M_.bind(fn)) : (e.setTimeoutFn = fn.setTimeout.bind(fn), e.clearTimeoutFn = fn.clearTimeout.bind(fn));
}
const D_ = 1.33;
function F_(e) {
  return typeof e == "string" ? $_(e) : Math.ceil((e.byteLength || e.size) * D_);
}
function $_(e) {
  let t = 0, n = 0;
  for (let s = 0, r = e.length; s < r; s++)
    t = e.charCodeAt(s), t < 128 ? n += 1 : t < 2048 ? n += 2 : t < 55296 || t >= 57344 ? n += 3 : (s++, n += 4);
  return n;
}
function _f() {
  return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
}
function B_(e) {
  let t = "";
  for (let n in e)
    e.hasOwnProperty(n) && (t.length && (t += "&"), t += encodeURIComponent(n) + "=" + encodeURIComponent(e[n]));
  return t;
}
function U_(e) {
  let t = {}, n = e.split("&");
  for (let s = 0, r = n.length; s < r; s++) {
    let i = n[s].split("=");
    t[decodeURIComponent(i[0])] = decodeURIComponent(i[1]);
  }
  return t;
}
class z_ extends Error {
  constructor(t, n, s) {
    super(t), this.description = n, this.context = s, this.type = "TransportError";
  }
}
class Wa extends ht {
  /**
   * Transport abstract constructor.
   *
   * @param {Object} opts - options
   * @protected
   */
  constructor(t) {
    super(), this.writable = !1, lo(this, t), this.opts = t, this.query = t.query, this.socket = t.socket, this.supportsBinary = !t.forceBase64;
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
    return super.emitReserved("error", new z_(t, n, s)), this;
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
    const n = ja(t, this.socket.binaryType);
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
    const n = B_(t);
    return n.length ? "?" + n : "";
  }
}
class H_ extends Wa {
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
    R_(t, this.socket.binaryType).forEach(n), this.readyState !== "closed" && (this._polling = !1, this.emitReserved("pollComplete"), this.readyState === "open" && this._poll());
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
    this.writable = !1, C_(t, (n) => {
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
    return this.opts.timestampRequests !== !1 && (n[this.opts.timestampParam] = _f()), !this.supportsBinary && !n.sid && (n.b64 = 1), this.createUri(t, n);
  }
}
let yf = !1;
try {
  yf = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest();
} catch {
}
const j_ = yf;
function W_() {
}
class q_ extends H_ {
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
class Cn extends ht {
  /**
   * Request constructor
   *
   * @param {Object} options
   * @package
   */
  constructor(t, n, s) {
    super(), this.createRequest = t, lo(this, s), this._opts = s, this._method = s.method || "GET", this._uri = n, this._data = s.data !== void 0 ? s.data : null, this._create();
  }
  /**
   * Creates the XHR object and sends the request.
   *
   * @private
   */
  _create() {
    var t;
    const n = gf(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
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
    typeof document < "u" && (this._index = Cn.requestsCount++, Cn.requests[this._index] = this);
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
      if (this._xhr.onreadystatechange = W_, t)
        try {
          this._xhr.abort();
        } catch {
        }
      typeof document < "u" && delete Cn.requests[this._index], this._xhr = null;
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
Cn.requestsCount = 0;
Cn.requests = {};
if (typeof document < "u") {
  if (typeof attachEvent == "function")
    attachEvent("onunload", xc);
  else if (typeof addEventListener == "function") {
    const e = "onpagehide" in fn ? "pagehide" : "unload";
    addEventListener(e, xc, !1);
  }
}
function xc() {
  for (let e in Cn.requests)
    Cn.requests.hasOwnProperty(e) && Cn.requests[e].abort();
}
const V_ = function() {
  const e = vf({
    xdomain: !1
  });
  return e && e.responseType !== null;
}();
class K_ extends q_ {
  constructor(t) {
    super(t);
    const n = t && t.forceBase64;
    this.supportsBinary = V_ && !n;
  }
  request(t = {}) {
    return Object.assign(t, { xd: this.xd }, this.opts), new Cn(vf, this.uri(), t);
  }
}
function vf(e) {
  const t = e.xdomain;
  try {
    if (typeof XMLHttpRequest < "u" && (!t || j_))
      return new XMLHttpRequest();
  } catch {
  }
  if (!t)
    try {
      return new fn[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
    } catch {
    }
}
const bf = typeof navigator < "u" && typeof navigator.product == "string" && navigator.product.toLowerCase() === "reactnative";
class G_ extends Wa {
  get name() {
    return "websocket";
  }
  doOpen() {
    const t = this.uri(), n = this.opts.protocols, s = bf ? {} : gf(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
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
      Ha(s, this.supportsBinary, (i) => {
        try {
          this.doWrite(s, i);
        } catch {
        }
        r && ao(() => {
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
    return this.opts.timestampRequests && (n[this.opts.timestampParam] = _f()), this.supportsBinary || (n.b64 = 1), this.createUri(t, n);
  }
}
const Wo = fn.WebSocket || fn.MozWebSocket;
class Y_ extends G_ {
  createSocket(t, n, s) {
    return bf ? new Wo(t, n, s) : n ? new Wo(t, n) : new Wo(t);
  }
  doWrite(t, n) {
    this.ws.send(n);
  }
}
class X_ extends Wa {
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
        const n = O_(Number.MAX_SAFE_INTEGER, this.socket.binaryType), s = t.readable.pipeThrough(n).getReader(), r = I_();
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
        r && ao(() => {
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
const Z_ = {
  websocket: Y_,
  webtransport: X_,
  polling: K_
}, J_ = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/, Q_ = [
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
function da(e) {
  if (e.length > 8e3)
    throw "URI too long";
  const t = e, n = e.indexOf("["), s = e.indexOf("]");
  n != -1 && s != -1 && (e = e.substring(0, n) + e.substring(n, s).replace(/:/g, ";") + e.substring(s, e.length));
  let r = J_.exec(e || ""), i = {}, o = 14;
  for (; o--; )
    i[Q_[o]] = r[o] || "";
  return n != -1 && s != -1 && (i.source = t, i.host = i.host.substring(1, i.host.length - 1).replace(/;/g, ":"), i.authority = i.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), i.ipv6uri = !0), i.pathNames = ey(i, i.path), i.queryKey = ty(i, i.query), i;
}
function ey(e, t) {
  const n = /\/{2,9}/g, s = t.replace(n, "/").split("/");
  return (t.slice(0, 1) == "/" || t.length === 0) && s.splice(0, 1), t.slice(-1) == "/" && s.splice(s.length - 1, 1), s;
}
function ty(e, t) {
  const n = {};
  return t.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function(s, r, i) {
    r && (n[r] = i);
  }), n;
}
const ha = typeof addEventListener == "function" && typeof removeEventListener == "function", xi = [];
ha && addEventListener("offline", () => {
  xi.forEach((e) => e());
}, !1);
class as extends ht {
  /**
   * Socket constructor.
   *
   * @param {String|Object} uri - uri or options
   * @param {Object} opts - options
   */
  constructor(t, n) {
    if (super(), this.binaryType = N_, this.writeBuffer = [], this._prevBufferLen = 0, this._pingInterval = -1, this._pingTimeout = -1, this._maxPayload = -1, this._pingTimeoutTime = 1 / 0, t && typeof t == "object" && (n = t, t = null), t) {
      const s = da(t);
      n.hostname = s.host, n.secure = s.protocol === "https" || s.protocol === "wss", n.port = s.port, s.query && (n.query = s.query);
    } else n.host && (n.hostname = da(n.host).host);
    lo(this, n), this.secure = n.secure != null ? n.secure : typeof location < "u" && location.protocol === "https:", n.hostname && !n.port && (n.port = this.secure ? "443" : "80"), this.hostname = n.hostname || (typeof location < "u" ? location.hostname : "localhost"), this.port = n.port || (typeof location < "u" && location.port ? location.port : this.secure ? "443" : "80"), this.transports = [], this._transportsByName = {}, n.transports.forEach((s) => {
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
    }, n), this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : ""), typeof this.opts.query == "string" && (this.opts.query = U_(this.opts.query)), ha && (this.opts.closeOnBeforeunload && (this._beforeunloadEventListener = () => {
      this.transport && (this.transport.removeAllListeners(), this.transport.close());
    }, addEventListener("beforeunload", this._beforeunloadEventListener, !1)), this.hostname !== "localhost" && (this._offlineEventListener = () => {
      this._onClose("transport close", {
        description: "network connection lost"
      });
    }, xi.push(this._offlineEventListener))), this.opts.withCredentials && (this._cookieJar = void 0), this._open();
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
    n.EIO = mf, n.transport = t, this.id && (n.sid = this.id);
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
    const t = this.opts.rememberUpgrade && as.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1 ? "websocket" : this.transports[0];
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
    this.readyState = "open", as.priorWebsocketSuccess = this.transport.name === "websocket", this.emitReserved("open"), this.flush();
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
      if (r && (n += F_(r)), s > 0 && n > this._maxPayload)
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
    return t && (this._pingTimeoutTime = 0, ao(() => {
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
    if (as.priorWebsocketSuccess = !1, this.opts.tryAllTransports && this.transports.length > 1 && this.readyState === "opening")
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
      if (this.clearTimeoutFn(this._pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), ha && (this._beforeunloadEventListener && removeEventListener("beforeunload", this._beforeunloadEventListener, !1), this._offlineEventListener)) {
        const s = xi.indexOf(this._offlineEventListener);
        s !== -1 && xi.splice(s, 1);
      }
      this.readyState = "closed", this.id = null, this.emitReserved("close", t, n), this.writeBuffer = [], this._prevBufferLen = 0;
    }
  }
}
as.protocol = mf;
class ny extends as {
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
    as.priorWebsocketSuccess = !1;
    const r = () => {
      s || (n.send([{ type: "ping", data: "probe" }]), n.once("packet", (b) => {
        if (!s)
          if (b.type === "pong" && b.data === "probe") {
            if (this.upgrading = !0, this.emitReserved("upgrading", n), !n)
              return;
            as.priorWebsocketSuccess = n.name === "websocket", this.transport.pause(() => {
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
    function u(b) {
      n && b.name !== n.name && i();
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
let sy = class extends ny {
  constructor(t, n = {}) {
    const s = typeof t == "object", r = s ? { ...t } : { ...n };
    (!r.transports || r.transports && typeof r.transports[0] == "string") && (r.transports = (r.transports || ["polling", "websocket", "webtransport"]).map((i) => Z_[i]).filter((i) => !!i)), super(s ? r : t, r);
  }
};
function ry(e, t = "", n) {
  let s = e;
  n = n || typeof location < "u" && location, e == null && (e = n.protocol + "//" + n.host), typeof e == "string" && (e.charAt(0) === "/" && (e.charAt(1) === "/" ? e = n.protocol + e : e = n.host + e), /^(https?|wss?):\/\//.test(e) || (typeof n < "u" ? e = n.protocol + "//" + e : e = "https://" + e), s = da(e)), s.port || (/^(http|ws)$/.test(s.protocol) ? s.port = "80" : /^(http|ws)s$/.test(s.protocol) && (s.port = "443")), s.path = s.path || "/";
  const i = s.host.indexOf(":") !== -1 ? "[" + s.host + "]" : s.host;
  return s.id = s.protocol + "://" + i + ":" + s.port + t, s.href = s.protocol + "://" + i + (n && n.port === s.port ? "" : ":" + s.port), s;
}
const iy = typeof ArrayBuffer == "function", oy = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e.buffer instanceof ArrayBuffer, wf = Object.prototype.toString, ay = typeof Blob == "function" || typeof Blob < "u" && wf.call(Blob) === "[object BlobConstructor]", ly = typeof File == "function" || typeof File < "u" && wf.call(File) === "[object FileConstructor]";
function qa(e) {
  return iy && (e instanceof ArrayBuffer || oy(e)) || ay && e instanceof Blob || ly && e instanceof File;
}
function Ei(e, t) {
  if (!e || typeof e != "object")
    return !1;
  if (Array.isArray(e)) {
    for (let n = 0, s = e.length; n < s; n++)
      if (Ei(e[n]))
        return !0;
    return !1;
  }
  if (qa(e))
    return !0;
  if (e.toJSON && typeof e.toJSON == "function" && arguments.length === 1)
    return Ei(e.toJSON(), !0);
  for (const n in e)
    if (Object.prototype.hasOwnProperty.call(e, n) && Ei(e[n]))
      return !0;
  return !1;
}
function cy(e) {
  const t = [], n = e.data, s = e;
  return s.data = Ci(n, t), s.attachments = t.length, { packet: s, buffers: t };
}
function Ci(e, t, n) {
  if (!e)
    return e;
  if (qa(e)) {
    const s = { _placeholder: !0, num: t.length };
    return t.push(e), s;
  } else if (Array.isArray(e)) {
    const s = new Array(e.length);
    for (let r = 0; r < e.length; r++)
      s[r] = Ci(e[r], t);
    return s;
  } else if (typeof e == "object" && !(e instanceof Date)) {
    if (e.toJSON && typeof e.toJSON == "function" && !n)
      return Ci(e.toJSON(), t, !0);
    const s = {};
    for (const r in e)
      Object.prototype.hasOwnProperty.call(e, r) && (s[r] = Ci(e[r], t));
    return s;
  }
  return e;
}
function uy(e, t) {
  return e.data = pa(e.data, t), delete e.attachments, e;
}
function pa(e, t) {
  if (!e)
    return e;
  if (e && e._placeholder === !0) {
    if (typeof e.num == "number" && e.num >= 0 && e.num < t.length)
      return t[e.num];
    throw new Error("illegal attachments");
  } else if (Array.isArray(e))
    for (let n = 0; n < e.length; n++)
      e[n] = pa(e[n], t);
  else if (typeof e == "object")
    for (const n in e)
      Object.prototype.hasOwnProperty.call(e, n) && (e[n] = pa(e[n], t));
  return e;
}
const fy = [
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
var Me;
(function(e) {
  e[e.CONNECT = 0] = "CONNECT", e[e.DISCONNECT = 1] = "DISCONNECT", e[e.EVENT = 2] = "EVENT", e[e.ACK = 3] = "ACK", e[e.CONNECT_ERROR = 4] = "CONNECT_ERROR", e[e.BINARY_EVENT = 5] = "BINARY_EVENT", e[e.BINARY_ACK = 6] = "BINARY_ACK";
})(Me || (Me = {}));
class dy {
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
    return (t.type === Me.EVENT || t.type === Me.ACK) && Ei(t) ? this.encodeAsBinary({
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
    const n = cy(t), s = this.encodeAsString(n.packet), r = n.buffers;
    return r.unshift(s), r;
  }
}
class Va extends ht {
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
      const s = n.type === Me.BINARY_EVENT;
      s || n.type === Me.BINARY_ACK ? (n.type = s ? Me.EVENT : Me.ACK, this.reconstructor = new hy(n)) : super.emitReserved("decoded", n);
    } else if (qa(t) || t.base64)
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
      const a = Number(o);
      if (!py(a) || a < 1)
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
      if (Va.isPayloadValid(s.type, i))
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
      case Me.CONNECT:
        return Ec(n);
      case Me.DISCONNECT:
        return n === void 0;
      case Me.CONNECT_ERROR:
        return typeof n == "string" || Ec(n);
      case Me.EVENT:
      case Me.BINARY_EVENT:
        return Array.isArray(n) && (typeof n[0] == "number" || typeof n[0] == "string" && fy.indexOf(n[0]) === -1);
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
class hy {
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
      const n = uy(this.reconPack, this.buffers);
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
const py = Number.isInteger || function(e) {
  return typeof e == "number" && isFinite(e) && Math.floor(e) === e;
};
function Ec(e) {
  return Object.prototype.toString.call(e) === "[object Object]";
}
const my = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Decoder: Va,
  Encoder: dy,
  get PacketType() {
    return Me;
  }
}, Symbol.toStringTag, { value: "Module" }));
function _n(e, t, n) {
  return e.on(t, n), function() {
    e.off(t, n);
  };
}
const gy = Object.freeze({
  connect: 1,
  connect_error: 1,
  disconnect: 1,
  disconnecting: 1,
  // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
  newListener: 1,
  removeListener: 1
});
class kf extends ht {
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
      _n(t, "open", this.onopen.bind(this)),
      _n(t, "packet", this.onpacket.bind(this)),
      _n(t, "error", this.onerror.bind(this)),
      _n(t, "close", this.onclose.bind(this))
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
    if (gy.hasOwnProperty(t))
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
function cr(e) {
  e = e || {}, this.ms = e.min || 100, this.max = e.max || 1e4, this.factor = e.factor || 2, this.jitter = e.jitter > 0 && e.jitter <= 1 ? e.jitter : 0, this.attempts = 0;
}
cr.prototype.duration = function() {
  var e = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var t = Math.random(), n = Math.floor(t * this.jitter * e);
    e = (Math.floor(t * 10) & 1) == 0 ? e - n : e + n;
  }
  return Math.min(e, this.max) | 0;
};
cr.prototype.reset = function() {
  this.attempts = 0;
};
cr.prototype.setMin = function(e) {
  this.ms = e;
};
cr.prototype.setMax = function(e) {
  this.max = e;
};
cr.prototype.setJitter = function(e) {
  this.jitter = e;
};
class ma extends ht {
  constructor(t, n) {
    var s;
    super(), this.nsps = {}, this.subs = [], t && typeof t == "object" && (n = t, t = void 0), n = n || {}, n.path = n.path || "/socket.io", this.opts = n, lo(this, n), this.reconnection(n.reconnection !== !1), this.reconnectionAttempts(n.reconnectionAttempts || 1 / 0), this.reconnectionDelay(n.reconnectionDelay || 1e3), this.reconnectionDelayMax(n.reconnectionDelayMax || 5e3), this.randomizationFactor((s = n.randomizationFactor) !== null && s !== void 0 ? s : 0.5), this.backoff = new cr({
      min: this.reconnectionDelay(),
      max: this.reconnectionDelayMax(),
      jitter: this.randomizationFactor()
    }), this.timeout(n.timeout == null ? 2e4 : n.timeout), this._readyState = "closed", this.uri = t;
    const r = n.parser || my;
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
    this.engine = new sy(this.uri, this.opts);
    const n = this.engine, s = this;
    this._readyState = "opening", this.skipReconnect = !1;
    const r = _n(n, "open", function() {
      s.onopen(), t && t();
    }), i = (a) => {
      this.cleanup(), this._readyState = "closed", this.emitReserved("error", a), t ? t(a) : this.maybeReconnectOnOpen();
    }, o = _n(n, "error", i);
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
      _n(t, "ping", this.onping.bind(this)),
      _n(t, "data", this.ondata.bind(this)),
      _n(t, "error", this.onerror.bind(this)),
      _n(t, "close", this.onclose.bind(this)),
      // @ts-ignore
      _n(this.decoder, "decoded", this.ondecoded.bind(this))
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
    ao(() => {
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
    return s ? this._autoConnect && !s.active && s.connect() : (s = new kf(this, t, n), this.nsps[t] = s), s;
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
const Nr = {};
function Ri(e, t) {
  typeof e == "object" && (t = e, e = void 0), t = t || {};
  const n = ry(e, t.path || "/socket.io"), s = n.source, r = n.id, i = n.path, o = Nr[r] && i in Nr[r].nsps, a = t.forceNew || t["force new connection"] || t.multiplex === !1 || o;
  let l;
  return a ? l = new ma(s, t) : (Nr[r] || (Nr[r] = new ma(s, t)), l = Nr[r]), n.query && !t.query && (t.query = n.queryKey), l.socket(n.path, t);
}
Object.assign(Ri, {
  Manager: ma,
  Socket: kf,
  io: Ri,
  connect: Ri
});
const _y = 5e3;
function yy() {
  const e = oe([]), t = oe(!1), n = oe(""), s = oe(!1), r = oe(!1), i = oe(!1), o = oe("connecting"), a = oe(0), l = 5, u = oe({}), c = oe(null), b = oe(""), w = [];
  let I = null;
  const O = 6e4, j = () => {
    t.value = !1, I && (clearTimeout(I), I = null);
  }, ce = () => {
    t.value = !0, I && clearTimeout(I), I = setTimeout(j, O);
  };
  let R = null;
  const ue = 1e3, me = 15e3;
  let C = null;
  const P = /* @__PURE__ */ new Set(["ai_config_missing", ...Fu]);
  let S = !1;
  const q = oe(null), ne = () => {
    C && (clearTimeout(C), C = null);
  }, he = () => {
    if (C || S) return;
    const U = Math.min(
      ue * 2 ** Math.max(0, a.value - 1),
      me
    );
    C = setTimeout(() => {
      C = null, R == null || R.connect();
    }, U);
  };
  let pe = null, Le = null, Ae = null, Ve = null, $e = null, et = !1, fe = null, we, ge, Ye;
  const Xe = (U) => {
    var z;
    return (z = Ai(U ?? null)) == null ? void 0 : z.sub;
  }, rt = (U) => {
    we = U, U && R != null && R.connected && R.emit("refresh_token", { conversation_token: U });
  }, ze = (U) => {
    ge = U;
  }, Lt = () => {
    var f;
    const U = we || (qi() ? null : Wi().read()), z = {};
    U && (z.conversation_token = U), ge && (z.widget_id = ge);
    try {
      z.page_url = af() || (window.parent !== window && ((f = window.parent.location) != null && f.href) ? window.parent.location.href : document.referrer || window.location.href);
    } catch {
      z.page_url = document.referrer || "";
    }
    return z;
  }, vn = (U) => {
    R = Ri(`${Ns.WS_URL}/widget`, {
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
      Ye = Xe(Lt().conversation_token), o.value = "connected", ne(), a.value = 0;
    }), R.on("bot_typing", () => {
      ce();
    }), R.on("disconnect", () => {
      j(), o.value === "connected" && (console.log("Socket disconnected, setting connection status to connecting"), o.value = "connecting");
    }), R.on("connect_error", (z) => {
      var y;
      const f = (y = z == null ? void 0 : z.data) == null ? void 0 : y.type;
      if (f && P.has(f)) {
        S = !0, q.value = f, ne(), o.value = "failed", ia(f) ? et || $e == null || $e() : _(z.data);
        return;
      }
      a.value++, console.error("Socket connection failed, attempt:", a.value), a.value >= l && (o.value = "failed"), R && !R.active && he();
    }), R.on("chat_response", (z) => {
      if (j(), z.session_id ? (console.log("Captured session_id from chat_response:", z.session_id), b.value = z.session_id) : console.warn("No session_id in chat_response data:", z), z.type === "agent_message") {
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
      }, j(), pe && pe(z);
    }), R.on("session_initialized", (z) => {
      z.session_id && (b.value = z.session_id, fe = {
        session_id: z.session_id,
        authenticated: !!z.authenticated,
        created: !!z.created
      }, Ve == null || Ve(fe));
    }), R.on("error", _);
    for (const [z, f] of w) R.on(z, f);
    return R.on("chat_history", v), R.on("rating_submitted", L), R.on("display_form", D), R.on("form_submitted", B), R.on("workflow_state", M), R.on("workflow_proceeded", X), R;
  }, De = async () => {
    try {
      return R != null && R.connected && Ye && Ye === Xe(Lt().conversation_token) ? (o.value = "connected", !0) : (o.value = "connecting", a.value = 0, j(), ne(), S = !1, q.value = null, R && (R.removeAllListeners(), R.disconnect(), R = null), et = !0, R = vn(""), new Promise((U) => {
        const z = (f) => {
          et = !1, U(f);
        };
        R == null || R.on("connect", () => {
          z(!0);
        }), R == null || R.on("connect_error", () => {
          (S || a.value >= l) && z(!1);
        });
      }));
    } catch (U) {
      return console.error("Socket initialization failed:", U), et = !1, o.value = "failed", !1;
    }
  }, vt = () => (R && R.disconnect(), De()), zt = (U) => {
    pe = U;
  }, qt = (U) => {
    $e = U;
  }, Vt = (U) => {
    Ve = U, fe && U(fe);
  }, Nt = (U) => {
    Le = U;
  }, bn = (U) => {
    Ae = U;
  }, _ = (U) => {
    j(), n.value = hp(U), s.value = !0, setTimeout(() => {
      s.value = !1, n.value = "";
    }, 5e3);
  }, v = (U) => {
    if (U.type === "chat_history" && Array.isArray(U.messages)) {
      const z = U.messages.map((f) => {
        var N, E;
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
        return Array.isArray((N = f.attributes) == null ? void 0 : N.sources) && f.attributes.sources.length && (y.sources = f.attributes.sources), (E = f.attributes) != null && E.shopify_output && typeof f.attributes.shopify_output == "object" ? {
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
  }, L = (U) => {
    U.success && e.value.push({
      message: "Thank you for your feedback!",
      message_type: "system",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: ""
    });
  }, D = (U) => {
    var z;
    console.log("Form display handler in composable:", U), j(), c.value = U.form_data, console.log("Set currentForm in handleDisplayForm:", c.value), ((z = U.form_data) == null ? void 0 : z.form_full_screen) === !0 ? (console.log("Full screen form detected, triggering workflow state callback"), Le && Le({
      type: "form",
      form_data: U.form_data,
      session_id: U.session_id
    })) : e.value.push({
      message: "",
      message_type: "form",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: U.session_id,
      attributes: {
        form_data: U.form_data
      }
    });
  }, B = (U) => {
    console.log("Form submitted confirmation received, clearing currentForm"), c.value = null, U.success && console.log("Form submitted successfully");
  }, M = (U) => {
    console.log("Workflow state received in composable:", U), (U.type === "form" || U.type === "display_form") && (console.log("Setting currentForm from workflow state:", U.form_data), c.value = U.form_data), Le && Le(U);
  }, X = (U) => {
    console.log("Workflow proceeded in composable:", U), Ae && Ae(U);
  }, K = async (U, z) => {
    !R || !U || R.emit("submit_rating", {
      rating: U,
      feedback: z
    });
  }, G = async (U) => {
    var y;
    if (console.log("Submitting form in socket:", U), console.log("Current form in socket:", c.value), console.log("Socket in socket:", R), !R) {
      console.error("No socket available for form submission");
      return;
    }
    if (!U || Object.keys(U).length === 0) {
      console.error("No form data to submit");
      return;
    }
    const f = ((y = c.value) == null ? void 0 : y.form_type) === "contact" ? "submit_contact_info" : "submit_form";
    console.log(`Emitting ${f} event with data:`, U), R.emit(f, {
      form_data: U
    }), c.value = null;
  }, F = async () => {
    R && (console.log("Getting workflow state 12"), R.emit("get_workflow_state"));
  }, se = async () => {
    R && R.emit("proceed_workflow", {});
  }, Y = async (U, z, f = [], y = {}) => {
    if (!R || !U.trim() && f.length === 0) return;
    const N = {
      message: U,
      message_type: "user",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: ""
    };
    f.length > 0 && (N.attachments = f.map((E, W) => {
      let Q = "";
      if (E.content_type.startsWith("image/")) {
        const ie = atob(E.content), Ce = new Array(ie.length);
        for (let Ne = 0; Ne < ie.length; Ne++)
          Ce[Ne] = ie.charCodeAt(Ne);
        const Re = new Uint8Array(Ce), Ie = new Blob([Re], { type: E.content_type });
        Q = URL.createObjectURL(Ie);
      }
      return {
        id: Date.now() * 1e3 + W,
        // Temporary ID
        filename: E.filename,
        file_url: Q,
        // Temporary blob URL, will be replaced
        content_type: E.content_type,
        file_size: E.size,
        _isTemporary: !0
        // Flag to identify temporary attachments
      };
    })), e.value.push(N), R.emit("chat", {
      ...y,
      message: U,
      email: z,
      files: f
      // Send files with base64 content
    }), i.value = !0;
  }, te = () => {
    e.value = [], i.value = !1, b.value = "", j(), c.value = null;
  };
  return {
    messages: e,
    loading: t,
    errorMessage: n,
    showError: s,
    loadingHistory: r,
    hasStartedChat: i,
    connectionStatus: o,
    sendMessage: Y,
    endChat: (U = "CUSTOMER_REQUEST") => new Promise((z) => {
      if (!R || !R.connected) {
        z(!1);
        return;
      }
      let f = !1;
      const y = (Q) => {
        f || (f = !0, clearTimeout(W), R == null || R.off("chat_ended", N), R == null || R.off("error", E), Q && te(), z(Q));
      }, N = () => y(!0), E = (Q) => {
        (Q == null ? void 0 : Q.type) === "end_chat_error" && y(!1);
      }, W = setTimeout(() => y(!1), _y);
      R.on("chat_ended", N), R.on("error", E), R.emit("end_chat", { reason: U });
    }),
    loadChatHistory: async () => {
      if (R)
        try {
          r.value = !0, R.emit("get_chat_history");
        } catch (U) {
          console.error("Failed to load chat history:", U);
        } finally {
          r.value = !1;
        }
    },
    connect: De,
    reconnect: vt,
    cleanup: () => {
      j(), ne(), R && (R.removeAllListeners(), R.disconnect(), R = null), pe = null, Le = null, Ae = null;
    },
    humanAgent: u,
    onTakeover: zt,
    onSessionState: Vt,
    onReauthorize: qt,
    refusal: q,
    submitRating: K,
    currentForm: c,
    submitForm: G,
    getWorkflowState: F,
    proceedWorkflow: se,
    onWorkflowState: Nt,
    onWorkflowProceeded: bn,
    currentSessionId: b,
    setToken: rt,
    setWidgetId: ze,
    on: (U, z) => {
      w.push([U, z]), R == null || R.on(U, z);
    },
    emit: (U, z) => {
      R == null || R.emit(U, z);
    }
  };
}
const vy = 8, by = 200;
function wy(e) {
  const t = e && typeof e == "object" ? e.details : null;
  if (!t || typeof t != "object" || Array.isArray(t)) return null;
  const n = Object.entries(t).filter(([s, r]) => s.trim() && ["string", "number", "boolean"].includes(typeof r) && String(r).trim()).slice(0, vy).map(([s, r]) => ({ key: s.trim().slice(0, 60), value: String(r).trim().slice(0, by) }));
  return n.length ? n : null;
}
const ky = 140;
function Ty(e) {
  const t = e && typeof e == "object" ? e.summary : null;
  return typeof t == "string" && t.trim() ? t.trim().slice(0, ky) : null;
}
const Ay = 2e3, Sy = 4;
function xy(e) {
  if (typeof e.message != "string" || !e.message.trim()) return null;
  const t = Array.isArray(e.suggestions) ? e.suggestions.filter((n) => typeof n == "string" && !!n.trim()).map((n) => ({ label: n.slice(0, 80), kind: "text", value: n.slice(0, 500) })).slice(0, Sy) : [];
  return { message: e.message.slice(0, Ay), chips: t, open: e.open === !0, source: "host" };
}
const Ey = 2e3;
function Cy(e) {
  const t = e.setTimer ?? ((S, q) => setTimeout(S, q)), n = e.clearTimer ?? ((S) => clearTimeout(S));
  let s = [], r = null, i = null;
  const o = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map();
  function u() {
    const S = e.trustedHostOrigin();
    S && s.length && e.emit("actions_available", { names: s, host_origin: S }), r && e.emit("set_context", { context: r });
  }
  function c(S) {
    s = Array.isArray(S) ? S.filter((q) => typeof q == "string") : [], u();
  }
  function b(S) {
    r = S && typeof S == "object" && !Array.isArray(S) ? S : null, r && e.emit("set_context", { context: r });
  }
  function w(S, q, ne, he = {}) {
    var pe;
    (pe = e.onOutcome) == null || pe.call(e, {
      label: S,
      status: q,
      preview: ne,
      summary: q === "ok" ? Ty(he.result) : null,
      error: typeof he.error == "string" && he.error ? he.error : null
    });
  }
  function I(S, q, ne = {}) {
    const he = o.get(S);
    he && (n(he.timer), w(he.label, q, he.preview, ne)), o.delete(S);
    const pe = a.get(S);
    if (pe) {
      a.delete(S), pe(q);
      return;
    }
    const Le = (he == null ? void 0 : he.confirmed) ?? void 0;
    e.emit("action_result", { call_id: S, status: q, confirmed: Le, ...ne });
  }
  function O(S) {
    const q = i && S ? a.get(i.request.call_id) : void 0;
    q && i && (a.delete(i.request.call_id), q("declined")), i = S, e.onConfirmChange(S);
  }
  function j(S, q, ne = null) {
    const he = Math.max(1, S.timeout_s) * 1e3 + Ey;
    o.set(S.call_id, {
      timer: t(() => I(S.call_id, "timeout"), he),
      confirmed: q,
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
  function ce(S) {
    if (!(!S || typeof S.call_id != "string") && !(o.has(S.call_id) || l.has(S.call_id) || (i == null ? void 0 : i.request.call_id) === S.call_id)) {
      if (S.confirm === "always") {
        O({ request: S, preview: null, details: null }), l.set(S.call_id, S), e.postToHost({ type: "ACTION_PREVIEW", callId: S.call_id, name: S.name, args: S.args });
        return;
      }
      if (S.confirm === "when_overwriting") {
        l.set(S.call_id, S), e.postToHost({ type: "ACTION_PREVIEW", callId: S.call_id, name: S.name, args: S.args });
        return;
      }
      j(S, null);
    }
  }
  function R(S) {
    var q;
    switch (S.type) {
      case "HOST_ACTIONS":
        return c(S.names), !0;
      case "HOST_CONTEXT":
        return b(S.context), !0;
      case "HOST_PROMPT": {
        const ne = xy(S);
        return ne && ((q = e.onPrompt) == null || q.call(e, ne)), !0;
      }
      case "ACTION_PREVIEW_DONE": {
        const ne = l.get(String(S.callId));
        if (!ne) return !0;
        if (l.delete(ne.call_id), ne.confirm === "always") {
          const pe = wy(S.preview);
          return pe && (i == null ? void 0 : i.request.call_id) === ne.call_id && (i = { ...i, details: pe }, e.onConfirmChange(i)), !0;
        }
        const he = S.preview;
        return he && typeof he == "object" ? O({ request: ne, preview: he, details: null }) : j(ne, null), !0;
      }
      case "ACTION_DONE": {
        const ne = String(S.callId);
        if (!o.has(ne)) return !0;
        const he = ["ok", "error", "timeout"].includes(S.status) ? S.status : "error";
        return I(ne, he, {
          result: he === "ok" ? S.result : void 0,
          error: typeof S.error == "string" ? S.error : void 0
        }), !0;
      }
      default:
        return !1;
    }
  }
  function ue() {
    if (!i) return;
    const { request: S, preview: q } = i;
    O(null), l.delete(S.call_id), j(S, !0, q);
  }
  function me() {
    if (!i) return;
    const { request: S, preview: q } = i;
    O(null), l.delete(S.call_id), w(S.label, "declined", q);
    const ne = a.get(S.call_id);
    if (ne) {
      a.delete(S.call_id), ne("declined");
      return;
    }
    e.emit("action_result", { call_id: S.call_id, status: "declined", confirmed: !1 });
  }
  function C(S, q) {
    if (S.kind !== "action" || !S.action || i || a.size > 0 || o.size > 0 || l.size > 0) return !1;
    const ne = `chip-${S.value}-${Date.now()}`;
    return a.set(ne, q), ce({
      call_id: ne,
      name: S.value,
      label: S.action.label,
      args: {},
      confirm: S.action.confirm,
      timeout_s: S.action.timeout_s
    }), !0;
  }
  function P() {
    for (const S of o.values()) n(S.timer);
    o.clear(), l.clear(), a.clear(), O(null);
  }
  return { announce: u, handleRequest: ce, handleHostMessage: R, approve: ue, decline: me, runLocal: C, dispose: P };
}
function Ry(e, t, n) {
  const s = oe(null), r = Cy({
    postToHost: Tt,
    emit: e.emit,
    // Actions need a page whose origin we know: the framed widget with a real host.
    trustedHostOrigin: () => {
      if (!qi()) return null;
      const o = Qu();
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
  return window.addEventListener("message", i), to(() => {
    window.removeEventListener("message", i), r.dispose();
  }), { pendingConfirm: s, approveAction: r.approve, declineAction: r.decline, runLocalAction: r.runLocal };
}
function Cc(e, t) {
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
const Iy = 6e4;
function Oy(e) {
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
    }, I.nudge.after_min * Iy));
  }
  function u(I) {
    if (a = I.nudge && I.step_id ? { stepId: I.step_id, nudge: I.nudge } : null, !a) {
      i(), o = null;
      return;
    }
    o === a.stepId && s !== null || l();
  }
  let c = !1;
  function b(I) {
    var ce;
    const O = (I == null ? void 0 : I.view) ?? null;
    if ((ce = O == null ? void 0 : O.notice) != null && ce.text && e.addNotice(O.notice.text, O.notice.kind), !O && c) return;
    if (c = !!(O != null && O.finished) && !!O.journey_name, !O || O.finished || O.waiting) {
      i(), a = null, o = null;
      const R = O != null && O.journey_name ? Cc(O, !!O.finished) : null;
      e.showStep(null, R), O != null && O.finished && O.message && e.addNotice(O.message, "message");
      return;
    }
    const j = O.message ? { message: O.message, chips: O.chips ?? [], open: !1, source: "journey" } : null;
    e.showStep(j, Cc(O, !1)), O.fresh && O.auto_open && e.openChat(), u(O);
  }
  function w() {
    s !== null && l();
  }
  return {
    handleState: b,
    activity: w,
    sync: (I = {}) => e.emit("journey_sync", I),
    skip: () => e.emit("journey_skip", {}),
    dismiss: () => {
      c = !1, e.showStep(null, null), e.emit("journey_dismiss", {});
    },
    start: (I) => e.emit("journey_start", { key: I }),
    dispose: i
  };
}
function Ly(e) {
  const t = oe(null), n = oe(!1);
  let s = !1;
  const r = [], o = Oy({
    emit: (u, c) => {
      s ? e.emit(u, c) : r.push([u, c]);
    },
    showStep: (u, c) => {
      t.value = c;
      const b = e.currentPrompt();
      b && b.source !== "journey" || e.showPrompt(u);
    },
    addNotice: e.addNotice,
    openChat: () => Tt({ type: "WIDGET_OPEN_REQUEST" })
  });
  e.on("journey_state", o.handleState), e.on("session_initialized", () => {
    s = !0, o.sync({ url: af() });
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
    e.runLocalAction(u, (w) => {
      n.value = !1, w === "ok" && o.sync({ action: u.value });
    }) && (n.value = !0);
  }
  return to(() => {
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
function Ny(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var qo = { exports: {} }, Rc;
function Py() {
  return Rc || (Rc = 1, function(e) {
    (function() {
      function t(f, y, N) {
        return f.call.apply(f.bind, arguments);
      }
      function n(f, y, N) {
        if (!f) throw Error();
        if (2 < arguments.length) {
          var E = Array.prototype.slice.call(arguments, 2);
          return function() {
            var W = Array.prototype.slice.call(arguments);
            return Array.prototype.unshift.apply(W, E), f.apply(y, W);
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
      function a(f, y, N, E) {
        if (y = f.c.createElement(y), N) for (var W in N) N.hasOwnProperty(W) && (W == "style" ? y.style.cssText = N[W] : y.setAttribute(W, N[W]));
        return E && y.appendChild(f.c.createTextNode(E)), y;
      }
      function l(f, y, N) {
        f = f.c.getElementsByTagName(y)[0], f || (f = document.documentElement), f.insertBefore(N, f.lastChild);
      }
      function u(f) {
        f.parentNode && f.parentNode.removeChild(f);
      }
      function c(f, y, N) {
        y = y || [], N = N || [];
        for (var E = f.className.split(/\s+/), W = 0; W < y.length; W += 1) {
          for (var Q = !1, ie = 0; ie < E.length; ie += 1) if (y[W] === E[ie]) {
            Q = !0;
            break;
          }
          Q || E.push(y[W]);
        }
        for (y = [], W = 0; W < E.length; W += 1) {
          for (Q = !1, ie = 0; ie < N.length; ie += 1) if (E[W] === N[ie]) {
            Q = !0;
            break;
          }
          Q || y.push(E[W]);
        }
        f.className = y.join(" ").replace(/\s+/g, " ").replace(/^\s+|\s+$/, "");
      }
      function b(f, y) {
        for (var N = f.className.split(/\s+/), E = 0, W = N.length; E < W; E++) if (N[E] == y) return !0;
        return !1;
      }
      function w(f) {
        return f.o.location.hostname || f.a.location.hostname;
      }
      function I(f, y, N) {
        function E() {
          Ce && W && Q && (Ce(ie), Ce = null);
        }
        y = a(f, "link", { rel: "stylesheet", href: y, media: "all" });
        var W = !1, Q = !0, ie = null, Ce = N || null;
        o ? (y.onload = function() {
          W = !0, E();
        }, y.onerror = function() {
          W = !0, ie = Error("Stylesheet failed to load"), E();
        }) : setTimeout(function() {
          W = !0, E();
        }, 0), l(f, "head", y);
      }
      function O(f, y, N, E) {
        var W = f.c.getElementsByTagName("head")[0];
        if (W) {
          var Q = a(f, "script", { src: y }), ie = !1;
          return Q.onload = Q.onreadystatechange = function() {
            ie || this.readyState && this.readyState != "loaded" && this.readyState != "complete" || (ie = !0, N && N(null), Q.onload = Q.onreadystatechange = null, Q.parentNode.tagName == "HEAD" && W.removeChild(Q));
          }, W.appendChild(Q), setTimeout(function() {
            ie || (ie = !0, N && N(Error("Script load timeout")));
          }, E || 5e3), Q;
        }
        return null;
      }
      function j() {
        this.a = 0, this.c = null;
      }
      function ce(f) {
        return f.a++, function() {
          f.a--, ue(f);
        };
      }
      function R(f, y) {
        f.c = y, ue(f);
      }
      function ue(f) {
        f.a == 0 && f.c && (f.c(), f.c = null);
      }
      function me(f) {
        this.a = f || "-";
      }
      me.prototype.c = function(f) {
        for (var y = [], N = 0; N < arguments.length; N++) y.push(arguments[N].replace(/[\W_]+/g, "").toLowerCase());
        return y.join(this.a);
      };
      function C(f, y) {
        this.c = f, this.f = 4, this.a = "n";
        var N = (y || "n4").match(/^([nio])([1-9])$/i);
        N && (this.a = N[1], this.f = parseInt(N[2], 10));
      }
      function P(f) {
        return ne(f) + " " + (f.f + "00") + " 300px " + S(f.c);
      }
      function S(f) {
        var y = [];
        f = f.split(/,\s*/);
        for (var N = 0; N < f.length; N++) {
          var E = f[N].replace(/['"]/g, "");
          E.indexOf(" ") != -1 || /^\d/.test(E) ? y.push("'" + E + "'") : y.push(E);
        }
        return y.join(",");
      }
      function q(f) {
        return f.a + f.f;
      }
      function ne(f) {
        var y = "normal";
        return f.a === "o" ? y = "oblique" : f.a === "i" && (y = "italic"), y;
      }
      function he(f) {
        var y = 4, N = "n", E = null;
        return f && ((E = f.match(/(normal|oblique|italic)/i)) && E[1] && (N = E[1].substr(0, 1).toLowerCase()), (E = f.match(/([1-9]00|normal|bold)/i)) && E[1] && (/bold/i.test(E[1]) ? y = 7 : /[1-9]00/.test(E[1]) && (y = parseInt(E[1].substr(0, 1), 10)))), N + y;
      }
      function pe(f, y) {
        this.c = f, this.f = f.o.document.documentElement, this.h = y, this.a = new me("-"), this.j = y.events !== !1, this.g = y.classes !== !1;
      }
      function Le(f) {
        f.g && c(f.f, [f.a.c("wf", "loading")]), Ve(f, "loading");
      }
      function Ae(f) {
        if (f.g) {
          var y = b(f.f, f.a.c("wf", "active")), N = [], E = [f.a.c("wf", "loading")];
          y || N.push(f.a.c("wf", "inactive")), c(f.f, N, E);
        }
        Ve(f, "inactive");
      }
      function Ve(f, y, N) {
        f.j && f.h[y] && (N ? f.h[y](N.c, q(N)) : f.h[y]());
      }
      function $e() {
        this.c = {};
      }
      function et(f, y, N) {
        var E = [], W;
        for (W in y) if (y.hasOwnProperty(W)) {
          var Q = f.c[W];
          Q && E.push(Q(y[W], N));
        }
        return E;
      }
      function fe(f, y) {
        this.c = f, this.f = y, this.a = a(this.c, "span", { "aria-hidden": "true" }, this.f);
      }
      function we(f) {
        l(f.c, "body", f.a);
      }
      function ge(f) {
        return "display:block;position:absolute;top:-9999px;left:-9999px;font-size:300px;width:auto;height:auto;line-height:normal;margin:0;padding:0;font-variant:normal;white-space:nowrap;font-family:" + S(f.c) + ";" + ("font-style:" + ne(f) + ";font-weight:" + (f.f + "00") + ";");
      }
      function Ye(f, y, N, E, W, Q) {
        this.g = f, this.j = y, this.a = E, this.c = N, this.f = W || 3e3, this.h = Q || void 0;
      }
      Ye.prototype.start = function() {
        var f = this.c.o.document, y = this, N = r(), E = new Promise(function(ie, Ce) {
          function Re() {
            r() - N >= y.f ? Ce() : f.fonts.load(P(y.a), y.h).then(function(Ie) {
              1 <= Ie.length ? ie() : setTimeout(Re, 25);
            }, function() {
              Ce();
            });
          }
          Re();
        }), W = null, Q = new Promise(function(ie, Ce) {
          W = setTimeout(Ce, y.f);
        });
        Promise.race([Q, E]).then(function() {
          W && (clearTimeout(W), W = null), y.g(y.a);
        }, function() {
          y.j(y.a);
        });
      };
      function Xe(f, y, N, E, W, Q, ie) {
        this.v = f, this.B = y, this.c = N, this.a = E, this.s = ie || "BESbswy", this.f = {}, this.w = W || 3e3, this.u = Q || null, this.m = this.j = this.h = this.g = null, this.g = new fe(this.c, this.s), this.h = new fe(this.c, this.s), this.j = new fe(this.c, this.s), this.m = new fe(this.c, this.s), f = new C(this.a.c + ",serif", q(this.a)), f = ge(f), this.g.a.style.cssText = f, f = new C(this.a.c + ",sans-serif", q(this.a)), f = ge(f), this.h.a.style.cssText = f, f = new C("serif", q(this.a)), f = ge(f), this.j.a.style.cssText = f, f = new C("sans-serif", q(this.a)), f = ge(f), this.m.a.style.cssText = f, we(this.g), we(this.h), we(this.j), we(this.m);
      }
      var rt = { D: "serif", C: "sans-serif" }, ze = null;
      function Lt() {
        if (ze === null) {
          var f = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent);
          ze = !!f && (536 > parseInt(f[1], 10) || parseInt(f[1], 10) === 536 && 11 >= parseInt(f[2], 10));
        }
        return ze;
      }
      Xe.prototype.start = function() {
        this.f.serif = this.j.a.offsetWidth, this.f["sans-serif"] = this.m.a.offsetWidth, this.A = r(), De(this);
      };
      function vn(f, y, N) {
        for (var E in rt) if (rt.hasOwnProperty(E) && y === f.f[rt[E]] && N === f.f[rt[E]]) return !0;
        return !1;
      }
      function De(f) {
        var y = f.g.a.offsetWidth, N = f.h.a.offsetWidth, E;
        (E = y === f.f.serif && N === f.f["sans-serif"]) || (E = Lt() && vn(f, y, N)), E ? r() - f.A >= f.w ? Lt() && vn(f, y, N) && (f.u === null || f.u.hasOwnProperty(f.a.c)) ? zt(f, f.v) : zt(f, f.B) : vt(f) : zt(f, f.v);
      }
      function vt(f) {
        setTimeout(s(function() {
          De(this);
        }, f), 50);
      }
      function zt(f, y) {
        setTimeout(s(function() {
          u(this.g.a), u(this.h.a), u(this.j.a), u(this.m.a), y(this.a);
        }, f), 0);
      }
      function qt(f, y, N) {
        this.c = f, this.a = y, this.f = 0, this.m = this.j = !1, this.s = N;
      }
      var Vt = null;
      qt.prototype.g = function(f) {
        var y = this.a;
        y.g && c(y.f, [y.a.c("wf", f.c, q(f).toString(), "active")], [y.a.c("wf", f.c, q(f).toString(), "loading"), y.a.c("wf", f.c, q(f).toString(), "inactive")]), Ve(y, "fontactive", f), this.m = !0, Nt(this);
      }, qt.prototype.h = function(f) {
        var y = this.a;
        if (y.g) {
          var N = b(y.f, y.a.c("wf", f.c, q(f).toString(), "active")), E = [], W = [y.a.c("wf", f.c, q(f).toString(), "loading")];
          N || E.push(y.a.c("wf", f.c, q(f).toString(), "inactive")), c(y.f, E, W);
        }
        Ve(y, "fontinactive", f), Nt(this);
      };
      function Nt(f) {
        --f.f == 0 && f.j && (f.m ? (f = f.a, f.g && c(f.f, [f.a.c("wf", "active")], [f.a.c("wf", "loading"), f.a.c("wf", "inactive")]), Ve(f, "active")) : Ae(f.a));
      }
      function bn(f) {
        this.j = f, this.a = new $e(), this.h = 0, this.f = this.g = !0;
      }
      bn.prototype.load = function(f) {
        this.c = new i(this.j, f.context || this.j), this.g = f.events !== !1, this.f = f.classes !== !1, v(this, new pe(this.c, f), f);
      };
      function _(f, y, N, E, W) {
        var Q = --f.h == 0;
        (f.f || f.g) && setTimeout(function() {
          var ie = W || null, Ce = E || null || {};
          if (N.length === 0 && Q) Ae(y.a);
          else {
            y.f += N.length, Q && (y.j = Q);
            var Re, Ie = [];
            for (Re = 0; Re < N.length; Re++) {
              var Ne = N[Re], it = Ce[Ne.c], dt = y.a, pn = Ne;
              if (dt.g && c(dt.f, [dt.a.c("wf", pn.c, q(pn).toString(), "loading")]), Ve(dt, "fontloading", pn), dt = null, Vt === null) if (window.FontFace) {
                var pn = /Gecko.*Firefox\/(\d+)/.exec(window.navigator.userAgent), Ht = /OS X.*Version\/10\..*Safari/.exec(window.navigator.userAgent) && /Apple/.exec(window.navigator.vendor);
                Vt = pn ? 42 < parseInt(pn[1], 10) : !Ht;
              } else Vt = !1;
              Vt ? dt = new Ye(s(y.g, y), s(y.h, y), y.c, Ne, y.s, it) : dt = new Xe(s(y.g, y), s(y.h, y), y.c, Ne, y.s, ie, it), Ie.push(dt);
            }
            for (Re = 0; Re < Ie.length; Re++) Ie[Re].start();
          }
        }, 0);
      }
      function v(f, y, N) {
        var W = [], E = N.timeout;
        Le(y);
        var W = et(f.a, N, f.c), Q = new qt(f.c, y, E);
        for (f.h = W.length, y = 0, N = W.length; y < N; y++) W[y].load(function(ie, Ce, Re) {
          _(f, Q, ie, Ce, Re);
        });
      }
      function L(f, y) {
        this.c = f, this.a = y;
      }
      L.prototype.load = function(f) {
        function y() {
          if (Q["__mti_fntLst" + E]) {
            var ie = Q["__mti_fntLst" + E](), Ce = [], Re;
            if (ie) for (var Ie = 0; Ie < ie.length; Ie++) {
              var Ne = ie[Ie].fontfamily;
              ie[Ie].fontStyle != null && ie[Ie].fontWeight != null ? (Re = ie[Ie].fontStyle + ie[Ie].fontWeight, Ce.push(new C(Ne, Re))) : Ce.push(new C(Ne));
            }
            f(Ce);
          } else setTimeout(function() {
            y();
          }, 50);
        }
        var N = this, E = N.a.projectId, W = N.a.version;
        if (E) {
          var Q = N.c.o;
          O(this.c, (N.a.api || "https://fast.fonts.net/jsapi") + "/" + E + ".js" + (W ? "?v=" + W : ""), function(ie) {
            ie ? f([]) : (Q["__MonotypeConfiguration__" + E] = function() {
              return N.a;
            }, y());
          }).id = "__MonotypeAPIScript__" + E;
        } else f([]);
      };
      function D(f, y) {
        this.c = f, this.a = y;
      }
      D.prototype.load = function(f) {
        var y, N, E = this.a.urls || [], W = this.a.families || [], Q = this.a.testStrings || {}, ie = new j();
        for (y = 0, N = E.length; y < N; y++) I(this.c, E[y], ce(ie));
        var Ce = [];
        for (y = 0, N = W.length; y < N; y++) if (E = W[y].split(":"), E[1]) for (var Re = E[1].split(","), Ie = 0; Ie < Re.length; Ie += 1) Ce.push(new C(E[0], Re[Ie]));
        else Ce.push(new C(E[0]));
        R(ie, function() {
          f(Ce, Q);
        });
      };
      function B(f, y) {
        f ? this.c = f : this.c = M, this.a = [], this.f = [], this.g = y || "";
      }
      var M = "https://fonts.googleapis.com/css";
      function X(f, y) {
        for (var N = y.length, E = 0; E < N; E++) {
          var W = y[E].split(":");
          W.length == 3 && f.f.push(W.pop());
          var Q = "";
          W.length == 2 && W[1] != "" && (Q = ":"), f.a.push(W.join(Q));
        }
      }
      function K(f) {
        if (f.a.length == 0) throw Error("No fonts to load!");
        if (f.c.indexOf("kit=") != -1) return f.c;
        for (var y = f.a.length, N = [], E = 0; E < y; E++) N.push(f.a[E].replace(/ /g, "+"));
        return y = f.c + "?family=" + N.join("%7C"), 0 < f.f.length && (y += "&subset=" + f.f.join(",")), 0 < f.g.length && (y += "&text=" + encodeURIComponent(f.g)), y;
      }
      function G(f) {
        this.f = f, this.a = [], this.c = {};
      }
      var F = { latin: "BESbswy", "latin-ext": "çöüğş", cyrillic: "йяЖ", greek: "αβΣ", khmer: "កខគ", Hanuman: "កខគ" }, se = { thin: "1", extralight: "2", "extra-light": "2", ultralight: "2", "ultra-light": "2", light: "3", regular: "4", book: "4", medium: "5", "semi-bold": "6", semibold: "6", "demi-bold": "6", demibold: "6", bold: "7", "extra-bold": "8", extrabold: "8", "ultra-bold": "8", ultrabold: "8", black: "9", heavy: "9", l: "3", r: "4", b: "7" }, Y = { i: "i", italic: "i", n: "n", normal: "n" }, te = /^(thin|(?:(?:extra|ultra)-?)?light|regular|book|medium|(?:(?:semi|demi|extra|ultra)-?)?bold|black|heavy|l|r|b|[1-9]00)?(n|i|normal|italic)?$/;
      function de(f) {
        for (var y = f.f.length, N = 0; N < y; N++) {
          var E = f.f[N].split(":"), W = E[0].replace(/\+/g, " "), Q = ["n4"];
          if (2 <= E.length) {
            var ie, Ce = E[1];
            if (ie = [], Ce) for (var Ce = Ce.split(","), Re = Ce.length, Ie = 0; Ie < Re; Ie++) {
              var Ne;
              if (Ne = Ce[Ie], Ne.match(/^[\w-]+$/)) {
                var it = te.exec(Ne.toLowerCase());
                if (it == null) Ne = "";
                else {
                  if (Ne = it[2], Ne = Ne == null || Ne == "" ? "n" : Y[Ne], it = it[1], it == null || it == "") it = "4";
                  else var dt = se[it], it = dt || (isNaN(it) ? "4" : it.substr(0, 1));
                  Ne = [Ne, it].join("");
                }
              } else Ne = "";
              Ne && ie.push(Ne);
            }
            0 < ie.length && (Q = ie), E.length == 3 && (E = E[2], ie = [], E = E ? E.split(",") : ie, 0 < E.length && (E = F[E[0]]) && (f.c[W] = E));
          }
          for (f.c[W] || (E = F[W]) && (f.c[W] = E), E = 0; E < Q.length; E += 1) f.a.push(new C(W, Q[E]));
        }
      }
      function _e(f, y) {
        this.c = f, this.a = y;
      }
      var be = { Arimo: !0, Cousine: !0, Tinos: !0 };
      _e.prototype.load = function(f) {
        var y = new j(), N = this.c, E = new B(this.a.api, this.a.text), W = this.a.families;
        X(E, W);
        var Q = new G(W);
        de(Q), I(N, K(E), ce(y)), R(y, function() {
          f(Q.a, Q.c, be);
        });
      };
      function ke(f, y) {
        this.c = f, this.a = y;
      }
      ke.prototype.load = function(f) {
        var y = this.a.id, N = this.c.o;
        y ? O(this.c, (this.a.api || "https://use.typekit.net") + "/" + y + ".js", function(E) {
          if (E) f([]);
          else if (N.Typekit && N.Typekit.config && N.Typekit.config.fn) {
            E = N.Typekit.config.fn;
            for (var W = [], Q = 0; Q < E.length; Q += 2) for (var ie = E[Q], Ce = E[Q + 1], Re = 0; Re < Ce.length; Re++) W.push(new C(ie, Ce[Re]));
            try {
              N.Typekit.load({ events: !1, classes: !1, async: !0 });
            } catch {
            }
            f(W);
          }
        }, 2e3) : f([]);
      };
      function Be(f, y) {
        this.c = f, this.f = y, this.a = [];
      }
      Be.prototype.load = function(f) {
        var y = this.f.id, N = this.c.o, E = this;
        y ? (N.__webfontfontdeckmodule__ || (N.__webfontfontdeckmodule__ = {}), N.__webfontfontdeckmodule__[y] = function(W, Q) {
          for (var ie = 0, Ce = Q.fonts.length; ie < Ce; ++ie) {
            var Re = Q.fonts[ie];
            E.a.push(new C(Re.name, he("font-weight:" + Re.weight + ";font-style:" + Re.style)));
          }
          f(E.a);
        }, O(this.c, (this.f.api || "https://f.fontdeck.com/s/css/js/") + w(this.c) + "/" + y + ".js", function(W) {
          W && f([]);
        })) : f([]);
      };
      var U = new bn(window);
      U.a.c.custom = function(f, y) {
        return new D(y, f);
      }, U.a.c.fontdeck = function(f, y) {
        return new Be(y, f);
      }, U.a.c.monotype = function(f, y) {
        return new L(y, f);
      }, U.a.c.typekit = function(f, y) {
        return new ke(y, f);
      }, U.a.c.google = function(f, y) {
        return new _e(y, f);
      };
      var z = { load: s(U.load, U) };
      e.exports ? e.exports = z : (window.WebFont = z, window.WebFontConfig && U.load(window.WebFontConfig));
    })();
  }(qo)), qo.exports;
}
var My = Py();
const Dy = /* @__PURE__ */ Ny(My), Ic = [
  "Space Grotesk:400,500,600,700",
  "Instrument Sans:400,500,600",
  "JetBrains Mono:400,500,600"
], Fy = (e) => {
  const t = [...Ic], n = (e == null ? void 0 : e.split(",")[0].trim().replace(/['"]/g, "")) || "", s = Ic.some(
    (r) => r.toLowerCase().startsWith(n.toLowerCase())
  );
  n && !s && t.push(n), Dy.load({
    google: { families: t },
    active: () => {
      if (!e) return;
      const r = document.querySelector(".chat-container");
      r && (r.style.fontFamily = e.includes(",") ? e : `"${e}", system-ui, sans-serif`);
    }
  });
};
function $y() {
  const e = oe({}), t = oe(""), n = (r) => {
    var i;
    e.value = r, r.photo_url && (e.value.photo_url = r.photo_url), Fy(r.font_family), Tt({
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
const By = 13, Uy = 24;
function zy(e, t) {
  const n = Zi({}), s = [];
  let r = null;
  const i = typeof window < "u" && typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, o = (c) => {
    r || s.length === 0 || (r = setTimeout(a, c));
  }, a = () => {
    r = null;
    const c = s[0];
    if (c === void 0) return;
    const b = e.value[c], w = n[c], I = (b == null ? void 0 : b.message) ?? "";
    if (!w || !b) {
      s.shift(), o(0);
      return;
    }
    if (w.shown >= I.length) {
      w.done = !0, s.shift(), o(0);
      return;
    }
    w.shown += 1;
    const O = I[w.shown - 1];
    t == null || t(), o(O === " " ? Uy : By);
  };
  bt(() => e.value.length, (c, b) => {
    b !== void 0 && c < b && (Object.keys(n).forEach((w) => {
      delete n[Number(w)];
    }), s.length = 0);
    for (let w = b ?? 0; w < c; w++) {
      const I = e.value[w];
      if (!I || !I.stream || w in n) continue;
      const O = I.message ?? "";
      i || !O ? n[w] = { shown: O.length, done: !0 } : (n[w] = { shown: 0, done: !1 }, s.push(w));
    }
    o(0);
  });
  const l = (c, b) => {
    const w = n[c];
    return w ? b.slice(0, w.shown) : b;
  }, u = (c) => {
    const b = n[c];
    return !!b && !b.done;
  };
  return Qr(() => {
    r && clearTimeout(r);
  }), { displayText: l, isStreaming: u };
}
function Hy(e) {
  const t = oe(!0);
  let n = 0;
  const s = () => {
    Tt({ type: "UNREAD_COUNT", count: n });
  }, r = (i) => {
    var o;
    ((o = i == null ? void 0 : i.data) == null ? void 0 : o.type) === "WIDGET_VISIBILITY" && (t.value = !!i.data.open, t.value && n !== 0 && (n = 0, s()));
  };
  bt(() => e.value.length, (i, o) => {
    if (i <= (o ?? 0) || t.value) return;
    const a = e.value[i - 1];
    a && (a.message_type === "bot" || a.message_type === "agent") && (n += 1, s());
  }), eo(() => window.addEventListener("message", r)), Qr(() => window.removeEventListener("message", r));
}
const jy = {
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
}, Wy = {
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
}, qy = {
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
}, Vy = {
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
}, Ky = {
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
}, Ii = {
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
}, Gy = {
  GLASS: jy,
  AURORA: Wy,
  TERMINAL: qy,
  CALM_MINT: Vy,
  PLAYFUL: Ky,
  SUNRISE: Ii,
  CHATBOT: Ii,
  ASK_ANYTHING: Ii
}, Yy = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", Oc = "'Instrument Sans', system-ui, -apple-system, 'Segoe UI', sans-serif";
function Xy(e) {
  return Math.max(4, Math.round(e * 0.3));
}
function Lc(e) {
  const t = (e || "").replace("#", "");
  if (t.length < 6) return "#0B0C10";
  const n = parseInt(t.slice(0, 2), 16), s = parseInt(t.slice(2, 4), 16), r = parseInt(t.slice(4, 6), 16);
  return (0.299 * n + 0.587 * s + 0.114 * r) / 255 > 0.62 ? "#0B0C10" : "#FFFFFF";
}
function Zy(e) {
  return Gy[e || ""] || Ii;
}
const Jy = "#212529";
function Qy(e, t) {
  const n = Zy(e), s = (t == null ? void 0 : t.chat_background_color) || "", r = /^#[0-9a-fA-F]{6}$/.test(s), i = s || n.card, o = (t == null ? void 0 : t.chat_text_color) || "", l = /^#[0-9a-fA-F]{6}$/.test(o) && o.toLowerCase() !== Jy ? o : r ? ir(s) ? "#FFFFFF" : "#111111" : n.text, u = r ? ir(s) ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.62)" : n.muted, c = r ? dp(s, 20) : n.agentBg, b = (t == null ? void 0 : t.accent_color) || n.accent, w = r ? !ir(s) : n.light, I = Lc(b) === "#0B0C10", O = w === I ? u : b, j = n.mono ? Yy : t != null && t.font_family ? `${t.font_family}, ${Oc}` : Oc;
  return {
    "--cm-card": i,
    "--cm-text": l,
    "--cm-muted": u,
    "--cm-agent-bg": c,
    "--cm-accent": b,
    "--cm-on-accent": Lc(b),
    "--cm-presence": O,
    "--cm-border": n.border,
    "--cm-glow": n.glow,
    "--cm-radius": `${n.radius}px`,
    "--cm-bubble": `${n.bubble}px`,
    "--cm-bubble-tail": `${Xy(n.bubble)}px`,
    "--cm-field-radius": n.mono ? "7px" : "12px",
    "--cm-avatar-radius": n.mono ? "28%" : "50%",
    "--cm-hairline": n.light ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.08)",
    "--cm-body-font": j
  };
}
const Nc = (e) => {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: e || "USD" }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
};
function ev() {
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
        minimumFractionDigits: Nc(r),
        maximumFractionDigits: Nc(r)
      }) : String(s);
      return i ? `${i}${a}` : a;
    },
    getCurrencySymbol: (s) => e[s] || s,
    currencySymbols: e
  };
}
const tv = {
  key: 0,
  class: "widget-unavailable-overlay"
}, nv = {
  key: 1,
  class: "auth-error-overlay"
}, sv = { class: "auth-error-card" }, rv = { class: "auth-error-message" }, iv = {
  key: 0,
  class: "initializing-overlay"
}, ov = {
  key: 0,
  class: "connecting-message"
}, av = {
  key: 1,
  class: "failed-message"
}, lv = { class: "welcome-content" }, cv = { class: "welcome-header" }, uv = ["src", "alt"], fv = { class: "welcome-title" }, dv = { class: "welcome-subtitle" }, hv = { class: "welcome-input-container" }, pv = {
  key: 0,
  class: "email-input"
}, mv = ["disabled"], gv = { class: "welcome-message-input" }, _v = ["placeholder", "disabled"], yv = ["disabled"], vv = {
  key: 0,
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, bv = {
  key: 1,
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, wv = { class: "landing-page-content" }, kv = { class: "landing-page-header" }, Tv = { class: "landing-page-heading" }, Av = { class: "landing-page-text" }, Sv = { class: "landing-page-actions" }, xv = { class: "form-fullscreen-content" }, Ev = {
  key: 0,
  class: "form-header"
}, Cv = {
  key: 0,
  class: "form-title"
}, Rv = {
  key: 1,
  class: "form-description"
}, Iv = { class: "form-fields" }, Ov = ["for"], Lv = {
  key: 0,
  class: "required-indicator"
}, Nv = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "autocomplete", "inputmode"], Pv = ["id", "placeholder", "required", "min", "max", "value", "onInput"], Mv = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput"], Dv = ["id", "required", "value", "onChange"], Fv = { value: "" }, $v = ["value"], Bv = {
  key: 4,
  class: "checkbox-field"
}, Uv = ["id", "required", "checked", "onChange"], zv = { class: "checkbox-label" }, Hv = {
  key: 5,
  class: "radio-group"
}, jv = ["name", "value", "required", "checked", "onChange"], Wv = { class: "radio-label" }, qv = {
  key: 6,
  class: "field-error"
}, Vv = { class: "form-actions" }, Kv = ["disabled"], Gv = {
  key: 0,
  class: "loading-spinner-inline"
}, Yv = { key: 1 }, Xv = { class: "header-content" }, Zv = ["src", "alt"], Jv = { class: "header-info" }, Qv = { class: "status" }, eb = { class: "status-text cm-presence" }, tb = { class: "header-actions" }, nb = ["disabled", "title", "aria-label", "aria-expanded"], sb = { class: "ask-anything-header" }, rb = ["src", "alt"], ib = { class: "header-info" }, ob = {
  key: 2,
  class: "loading-history"
}, ab = { class: "cm-email-gate-title" }, lb = ["disabled"], cb = {
  key: 0,
  class: "cm-email-gate-error"
}, ub = ["disabled"], fb = {
  key: 1,
  class: "cm-welcome-block"
}, db = { class: "message agent-message cm-welcome-row" }, hb = ["src", "alt"], pb = {
  key: 0,
  class: "cm-msg-avatar",
  "aria-hidden": "true"
}, mb = ["src"], gb = ["src"], _b = { class: "message-col" }, yb = {
  key: 0,
  class: "rating-content"
}, vb = { class: "rating-prompt" }, bb = ["onMouseover", "onMouseleave", "onClick", "disabled"], wb = {
  key: 0,
  class: "feedback-wrapper"
}, kb = { class: "feedback-section" }, Tb = ["onUpdate:modelValue", "disabled"], Ab = { class: "feedback-counter" }, Sb = ["onClick", "disabled"], xb = {
  key: 1,
  class: "submitted-feedback-wrapper"
}, Eb = { class: "submitted-feedback" }, Cb = { class: "submitted-feedback-text" }, Rb = {
  key: 2,
  class: "submitted-message"
}, Ib = {
  key: 1,
  class: "form-content"
}, Ob = {
  key: 0,
  class: "form-header"
}, Lb = {
  key: 0,
  class: "form-title"
}, Nb = {
  key: 1,
  class: "form-description"
}, Pb = { class: "form-fields" }, Mb = ["for"], Db = {
  key: 0,
  class: "required-indicator"
}, Fb = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "disabled", "autocomplete", "inputmode"], $b = ["id", "placeholder", "required", "min", "max", "value", "onInput", "disabled"], Bb = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "disabled"], Ub = ["id", "required", "value", "onChange", "disabled"], zb = { value: "" }, Hb = ["value"], jb = {
  key: 4,
  class: "checkbox-field"
}, Wb = ["id", "checked", "onChange", "disabled"], qb = ["for"], Vb = {
  key: 5,
  class: "radio-field"
}, Kb = ["id", "name", "value", "checked", "onChange", "disabled"], Gb = ["for"], Yb = {
  key: 6,
  class: "field-error"
}, Xb = { class: "form-actions" }, Zb = ["onClick", "disabled"], Jb = {
  key: 2,
  class: "user-input-content"
}, Qb = {
  key: 0,
  class: "user-input-prompt"
}, ew = {
  key: 1,
  class: "user-input-form"
}, tw = ["onUpdate:modelValue", "onKeydown"], nw = ["onClick", "disabled"], sw = {
  key: 2,
  class: "user-input-submitted"
}, rw = {
  key: 0,
  class: "user-input-confirmation"
}, iw = {
  key: 3,
  class: "product-message-container"
}, ow = ["innerHTML"], aw = {
  key: 1,
  class: "products-carousel"
}, lw = { class: "carousel-items" }, cw = {
  key: 0,
  class: "product-image-compact"
}, uw = ["src", "alt"], fw = { class: "product-info-compact" }, dw = { class: "product-text-area" }, hw = { class: "product-title-compact" }, pw = {
  key: 0,
  class: "product-variant-compact"
}, mw = { class: "product-price-compact" }, gw = { class: "product-actions-compact" }, _w = ["onClick"], yw = {
  key: 2,
  class: "no-products-message"
}, vw = {
  key: 3,
  class: "no-products-message"
}, bw = ["innerHTML"], ww = ["innerHTML"], kw = {
  key: 2,
  class: "message-attachments"
}, Tw = {
  key: 0,
  class: "attachment-image-container"
}, Aw = ["src", "alt", "onClick"], Sw = { class: "attachment-image-info" }, xw = ["href"], Ew = { class: "attachment-size" }, Cw = ["href"], Rw = { class: "attachment-size" }, Iw = {
  key: 0,
  class: "citation-chips"
}, Ow = ["title"], Lw = { class: "message-info" }, Nw = {
  key: 0,
  class: "agent-name"
}, Pw = {
  key: 2,
  class: "message agent-message cm-welcome-row cm-host-prompt"
}, Mw = ["src", "alt"], Dw = {
  key: 5,
  class: "cm-quick-actions-bar"
}, Fw = ["disabled", "onClick"], $w = {
  key: 0,
  class: "file-previews-widget"
}, Bw = {
  class: "file-preview-content-widget",
  style: { cursor: "pointer" }
}, Uw = ["src", "alt", "onClick"], zw = ["onClick"], Hw = { class: "file-preview-info-widget" }, jw = { class: "file-preview-name-widget" }, Ww = { class: "file-preview-size-widget" }, qw = ["onClick"], Vw = {
  key: 1,
  class: "upload-progress-widget"
}, Kw = { class: "message-input" }, Gw = ["placeholder", "disabled"], Yw = ["disabled", "title"], Xw = ["disabled"], Zw = {
  key: 2,
  class: "cm-secret-hint",
  role: "alert"
}, Jw = {
  key: 7,
  class: "new-conversation-section"
}, Qw = { class: "conversation-ended-message" }, e0 = {
  key: 8,
  class: "ai-disclaimer"
}, t0 = {
  key: 8,
  class: "rating-dialog"
}, n0 = { class: "rating-content" }, s0 = { class: "star-rating" }, r0 = ["onClick"], i0 = { class: "rating-actions" }, o0 = ["disabled"], a0 = {
  key: 0,
  class: "preview-modal-image-container"
}, l0 = ["src", "alt"], c0 = { class: "preview-modal-filename" }, u0 = {
  key: 3,
  class: "widget-loading"
}, Pc = 3, f0 = "image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls", d0 = /* @__PURE__ */ Ps({
  __name: "WidgetBuilder",
  props: {
    widgetId: {},
    token: {},
    initialAuthError: {}
  },
  setup(e) {
    const t = e, n = le(() => {
      var d;
      return t.widgetId || ((d = window.__INITIAL_DATA__) == null ? void 0 : d.widgetId);
    }), {
      customization: s,
      agentName: r,
      applyCustomization: i,
      initializeFromData: o
    } = $y(), { formatCurrency: a } = ev(), {
      messages: l,
      loading: u,
      errorMessage: c,
      showError: b,
      loadingHistory: w,
      hasStartedChat: I,
      connectionStatus: O,
      sendMessage: j,
      endChat: ce,
      loadChatHistory: R,
      connect: ue,
      reconnect: me,
      cleanup: C,
      humanAgent: P,
      onTakeover: S,
      refusal: q,
      submitRating: ne,
      submitForm: he,
      currentForm: pe,
      getWorkflowState: Le,
      proceedWorkflow: Ae,
      onWorkflowState: Ve,
      onWorkflowProceeded: $e,
      currentSessionId: et,
      setToken: fe,
      setWidgetId: we,
      onSessionState: ge,
      onReauthorize: Ye,
      on: Xe,
      emit: rt
    } = yy(), ze = oe(null), { receipts: Lt, addReceipt: vn, receiptsAfter: De } = Zg(l), { pendingConfirm: vt, approveAction: zt, declineAction: qt, runLocalAction: Vt } = Ry(
      { on: Xe, emit: rt },
      (d) => {
        ze.value = d;
      },
      vn
    ), { journeyProgress: Nt, chipBusy: bn, runChip: _, skipStep: v, dismissJourney: L, noteActivity: D } = Ly({
      on: Xe,
      emit: rt,
      currentPrompt: () => ze.value,
      showPrompt: (d) => {
        ze.value = d;
      },
      addNotice: (d) => {
        l.value.push({
          message: d,
          message_type: "bot",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          session_id: "",
          attributes: { source: "journey" }
        });
      },
      runLocalAction: Vt
    }), B = (d) => {
      if (d.kind === "action" && !bn.value && !vt.value) {
        const m = X.value, h = (/* @__PURE__ */ new Date()).toISOString();
        m && l.value.push({ message: m.message, message_type: "bot", created_at: h, session_id: "", attributes: { source: m.source } }), l.value.push({ message: d.label, message_type: "user", created_at: h, session_id: "", attributes: { source: "journey" } });
      }
      _(d, Hs);
    }, M = le(() => {
      const d = ze.value;
      return !(d != null && d.chips.length) || vt.value || u.value ? [] : d.chips;
    }), X = le(() => {
      const d = ze.value;
      return !d || d.source !== "journey" ? d : l.value.some((h) => h.message_type === "bot" && h.message === d.message) ? null : d;
    }), { displayText: K, isStreaming: G } = zy(l, () => rs(() => gn()));
    Hy(l);
    const F = oe(""), se = oe(!0), Y = oe(""), te = oe(!1), de = (d) => {
      const m = d.target;
      F.value = m.value;
    };
    let _e = null;
    const be = () => {
      _e && _e.disconnect(), _e = new MutationObserver((m) => {
        let h = !1, J = !1;
        m.forEach((Se) => {
          if (Se.type === "childList") {
            const ve = Array.from(Se.addedNodes).some(
              (ot) => {
                var Ze;
                return ot.nodeType === Node.ELEMENT_NODE && (ot.matches("input, textarea") || ((Ze = ot.querySelector) == null ? void 0 : Ze.call(ot, "input, textarea")));
              }
            ), ut = Array.from(Se.removedNodes).some(
              (ot) => {
                var Ze;
                return ot.nodeType === Node.ELEMENT_NODE && (ot.matches("input, textarea") || ((Ze = ot.querySelector) == null ? void 0 : Ze.call(ot, "input, textarea")));
              }
            );
            ve && (J = !0, h = !0), ut && (h = !0);
          }
        }), h && (clearTimeout(be.timeoutId), be.timeoutId = setTimeout(() => {
          y();
        }, J ? 50 : 100));
      });
      const d = document.querySelector(".widget-container") || document.body;
      _e.observe(d, {
        childList: !0,
        subtree: !0
      });
    };
    be.timeoutId = null;
    let ke = [];
    const Be = /* @__PURE__ */ new Set();
    let U = !1;
    const z = (d) => {
      if (U) return;
      const m = setTimeout(() => {
        Be.delete(m), y();
      }, d);
      Be.add(m);
    }, f = () => {
      Be.forEach(clearTimeout), Be.clear();
    }, y = () => {
      N();
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
      let m = [];
      for (const h of d) {
        const J = document.querySelectorAll(h);
        if (J.length > 0) {
          m = Array.from(J);
          break;
        }
      }
      m.length !== 0 && (ke = m, m.forEach((h) => {
        h.addEventListener("input", W, !0), h.addEventListener("keyup", W, !0), h.addEventListener("change", W, !0), h.addEventListener("keypress", Q, !0), h.addEventListener("keydown", ie, !0);
      }));
    }, N = () => {
      ke.forEach((d) => {
        d.removeEventListener("input", W), d.removeEventListener("keyup", W), d.removeEventListener("change", W), d.removeEventListener("keypress", Q), d.removeEventListener("keydown", ie);
      }), ke = [];
    }, E = (d) => !!(d && d.closest && d.closest(".form-message, .form-fullscreen, .cm-email-gate")), W = (d) => {
      if (E(d.target)) return;
      const m = d.target;
      F.value = m.value;
    }, Q = (d) => {
      E(d.target) || d.key === "Enter" && !d.shiftKey && (d.preventDefault(), d.stopPropagation(), mn());
    }, ie = (d) => {
      E(d.target) || d.key === "Enter" && !d.shiftKey && (d.preventDefault(), d.stopPropagation(), mn());
    }, Ce = (d) => {
      const m = d.target, h = document.querySelector(".header-menu-container");
      document.querySelector(".header-menu-btn");
      const J = document.querySelector(".header-dropdown-menu");
      J && !(h != null && h.contains(m)) && (J.style.display = "none");
    }, Re = oe(!0), {
      token: Ie,
      start: Ne,
      stop: it,
      setToken: dt,
      ensureFresh: pn
    } = m_({
      onTokenChanged: (d) => {
        Rs() && Tt({ type: "TOKEN_UPDATE", token: d }), fe(d);
      },
      onIdentityExpired: () => {
        Za();
      },
      // A framed widget holds the token only in memory: the host page keeps it, so
      // it must hear when the widget lets it go.
      onTokenCleared: () => {
        qi() && Rs() && Tt({ type: "TOKEN_CLEAR" });
      },
      store: cf(n.value || "")
    });
    le(() => !!Ie.value);
    const Ht = oe(null), Kt = oe(!1), ur = oe(!1);
    t.initialAuthError && (Ht.value = t.initialAuthError, Kt.value = !0, Re.value = !1), o();
    const Pt = window.__INITIAL_DATA__;
    Ne((Pt == null ? void 0 : Pt.widgetId) || "", Pt == null ? void 0 : Pt.initialToken), Ie.value && (te.value = !0);
    const On = oe(!1);
    (Pt == null ? void 0 : Pt.allowAttachments) !== void 0 && (On.value = Pt.allowAttachments);
    const Mt = oe(null), {
      chatStyles: sn,
      chatIconStyles: fr,
      agentBubbleStyles: Wn,
      userBubbleStyles: wn,
      messageNameStyles: rn,
      headerBorderStyles: Fs,
      photoUrl: St,
      shadowStyle: dr
    } = b_(s), ni = oe(null), {
      uploadedAttachments: xt,
      previewModal: co,
      previewFile: hs,
      formatFileSize: nt,
      isImageAttachment: qn,
      getDownloadUrl: $s,
      getPreviewUrl: hr,
      handleFileSelect: Bs,
      handleDrop: pr,
      handleDragOver: mr,
      handleDragLeave: si,
      handlePaste: ri,
      removeAttachment: uo,
      openPreview: gr,
      closePreview: Gt,
      openFilePicker: _r,
      isImage: ps
    } = T_(Ie, ni);
    le(() => l.value.some(
      (d) => d.message_type === "form" && (!d.isSubmitted || d.isSubmitted === !1)
    ));
    const Dt = le(() => {
      var d;
      return I.value && te.value || !yo.value ? O.value === "connected" && !u.value : Er(Y.value.trim()) && O.value === "connected" && !u.value || ((d = window.__INITIAL_DATA__) == null ? void 0 : d.workflow);
    }), ms = le(() => Dt.value || u.value && O.value === "connected" && I.value), Vn = le(() => O.value === "connected" ? ln.value ? "Ask me anything..." : "Type a message..." : "Connecting..."), Us = oe(!1), zs = le(() => s_(F.value)), mn = async () => {
      if (!F.value.trim() && xt.value.length === 0 || zs.value) return;
      if (u.value && I.value) {
        Us.value = !0;
        return;
      }
      !I.value && Y.value && await on();
      const d = xt.value.map((J) => ({
        content: J.content,
        // base64 content
        filename: J.filename,
        content_type: J.type,
        size: J.size
      }));
      D();
      const m = X.value;
      ze.value = null, m && l.value.push({
        message: m.message,
        message_type: "bot",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: "",
        attributes: { source: m.source }
      }), await j(
        F.value,
        Y.value,
        d,
        m ? { host_prompt: m.message, host_prompt_source: m.source } : {}
      ), xt.value.forEach((J) => {
        J.url && J.url.startsWith("blob:") && URL.revokeObjectURL(J.url), J.file_url && J.file_url.startsWith("blob:") && URL.revokeObjectURL(J.file_url);
      }), F.value = "", xt.value = [];
      const h = document.querySelector('input[placeholder*="Type a message"]');
      h && (h.value = ""), z(500);
    };
    bt(u, (d) => {
      d || !Us.value || (Us.value = !1, O.value === "connected" && I.value && mn());
    });
    const Hs = (d) => {
      Dt.value && (F.value = d, mn());
    }, Ln = () => {
      Tt({ type: "WIDGET_MINIMIZE" });
    }, js = (d) => {
      d.key === "Enter" && !d.shiftKey && (d.preventDefault(), d.stopPropagation(), mn());
    }, on = async ({ afterRefusal: d = !1 } = {}) => {
      var m, h, J, Se;
      try {
        if (!n.value)
          return console.error("Widget ID is not available"), Ht.value = "Widget ID is not available. Please refresh and try again.", Kt.value = !0, !1;
        await pn(n.value);
        const ve = new URL(`${Ns.API_URL}/widgets/${n.value}`);
        Y.value.trim() && Er(Y.value.trim()) && ve.searchParams.append("email", Y.value.trim());
        const ut = {
          Accept: "application/json",
          "Content-Type": "application/json"
        };
        Ie.value && (ut.Authorization = `Bearer ${Ie.value}`);
        const ot = await fetch(ve, {
          headers: ut,
          cache: "no-store"
        });
        if (ot.status === 401) {
          te.value = !1;
          try {
            const Jn = (await ot.json()).detail;
            if ((Jn == null ? void 0 : Jn.code) === u_)
              return Za(), !1;
            const Ys = typeof Jn == "string" ? Jn : "";
            (Ys.includes("generate-token") || Ys.includes("API key") || Ys.includes("Token required")) && (ur.value = !0, Ht.value = "Widget authentication not configured. Please contact the website administrator.", Kt.value = !0, dt(null));
          } catch {
            Ht.value = "Authentication required. Your token has expired or is invalid. Please refresh the page.", Kt.value = !0, dt(null);
          }
          return !1;
        }
        if (!ot.ok) {
          try {
            const Tr = await ot.json();
            Ht.value = Tr.detail || `Error: ${ot.statusText}`;
          } catch {
            Ht.value = `Error: ${ot.statusText}. Please try again.`;
          }
          return Kt.value = !0, !1;
        }
        const Ze = await ot.json();
        Ze.token && dt(Ze.token), te.value = !0, Ht.value = null, Kt.value = !1, fe(Ie.value || void 0);
        const kr = await ue();
        return !kr && ia(q.value) && !d ? await on({ afterRefusal: !0 }) : (kr || console.error("Chat service not reachable yet; retrying in the background"), await Kn(), (m = Ze.agent) != null && m.customization && i(Ze.agent.customization), Ze.agent && !(Ze != null && Ze.human_agent) && (r.value = Ze.agent.name), Ze != null && Ze.human_agent && (P.value = Ze.human_agent), ((h = Ze.agent) == null ? void 0 : h.allow_attachments) !== void 0 && (On.value = Ze.agent.allow_attachments), ((J = Ze.agent) == null ? void 0 : J.workflow) !== void 0 && (window.__INITIAL_DATA__ = window.__INITIAL_DATA__ || {}, window.__INITIAL_DATA__.workflow = Ze.agent.workflow), (Se = Ze.agent) != null && Se.workflow && await Le(), !0);
      } catch (ve) {
        return console.error("Error checking authorization:", ve), Ht.value = "An unexpected error occurred. Please try again.", Kt.value = !0, te.value = !1, !1;
      } finally {
        Re.value = !1;
      }
    }, Kn = async () => {
      !I.value && te.value && (I.value = !0, await R());
    }, gn = () => {
      Mt.value && (Mt.value.scrollTop = Mt.value.scrollHeight);
    };
    bt(() => l.value, (d) => {
      rs(() => {
        gn();
      });
    }, { deep: !0 }), bt([vt, ze, () => Lt.value.length, u], ([d, m, h, J]) => {
      (d || m || h || J) && rs(() => gn());
    }), bt(O, (d, m) => {
      d === "connected" && m !== "connected" && z(100);
    }), bt(() => l.value.length, (d, m) => {
      d > 0 && m === 0 && z(100);
    });
    let Yt = null;
    bt(() => l.value, (d) => {
      const m = d[d.length - 1];
      !yc(m) || m === Yt || (Yt = m, T(m));
    }, { deep: !0 });
    const fo = async () => {
      (await me() || ia(q.value)) && await on();
    }, gs = oe(!1), Ws = oe(0), qs = oe(""), Xt = oe(0), Zt = oe(!1), lt = oe({}), gt = oe(!1), ct = oe({}), Nn = oe(!1), _s = oe(null), yr = oe("Start Chat"), an = oe(!1), _t = oe(null);
    le(() => {
      var m;
      const d = l.value[l.value.length - 1];
      return ((m = d == null ? void 0 : d.attributes) == null ? void 0 : m.request_rating) || !1;
    });
    const V = le(() => {
      var m;
      if (!((m = window.__INITIAL_DATA__) != null && m.workflow))
        return !1;
      const d = l.value.find((h) => h.message_type === "rating");
      return (d == null ? void 0 : d.isSubmitted) === !0;
    }), p = le(
      () => ji(P.value.human_agent_profile_pic)
    ), T = async (d) => {
      var m, h, J, Se, ve;
      if (yc(d)) {
        try {
          if (d.session_id && Ie.value && n.value) {
            const ut = await Xa(d.session_id, {
              reason: (m = d.attributes) == null ? void 0 : m.end_chat_reason,
              description: (h = d.attributes) == null ? void 0 : h.end_chat_description
            });
            if (ut.ok) {
              const ot = await ut.json();
              console.info(`✓ Chat session closed on backend: ${ot.session_id}`);
            } else
              console.warn(`Failed to close session on backend: ${ut.status}`);
          }
        } catch (ut) {
          console.error("Error calling end-chat API:", ut);
        }
        if ((J = d.attributes) != null && J.end_chat && ((Se = d.attributes) != null && Se.request_rating)) {
          const ut = d.agent_name || ((ve = P.value) == null ? void 0 : ve.human_agent_name) || r.value || "our agent";
          l.value.push({
            message: `Rate the chat session that you had with ${ut}`,
            message_type: "rating",
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            session_id: d.session_id,
            agent_name: ut,
            showFeedback: !1
          }), et.value = d.session_id;
        }
      }
    }, H = (d) => {
      Zt.value || (Xt.value = d);
    }, ee = () => {
      if (!Zt.value) {
        const d = l.value[l.value.length - 1];
        Xt.value = (d == null ? void 0 : d.selectedRating) || 0;
      }
    }, ae = async (d) => {
      if (!Zt.value) {
        Xt.value = d;
        const m = l.value[l.value.length - 1];
        m && m.message_type === "rating" && (m.showFeedback = !0, m.selectedRating = d);
      }
    }, ye = async (d, m, h = null) => {
      try {
        Zt.value = !0, await ne(m, h);
        const J = l.value.find((Se) => Se.message_type === "rating");
        J && (J.isSubmitted = !0, J.finalRating = m, J.finalFeedback = h);
      } catch (J) {
        console.error("Failed to submit rating:", J);
      } finally {
        Zt.value = !1;
      }
    }, Ge = (d) => {
      const m = {};
      for (const h of d.fields) {
        const J = lt.value[h.name], Se = ys(h, J);
        Se && (m[h.name] = Se);
      }
      return ct.value = m, Object.keys(m).length === 0;
    }, st = async (d) => {
      if (!(gt.value || !Ge(d)))
        try {
          gt.value = !0, await he(lt.value);
          const h = l.value.findIndex(
            (J) => J.message_type === "form" && (!J.isSubmitted || J.isSubmitted === !1)
          );
          h !== -1 && l.value.splice(h, 1), lt.value = {}, ct.value = {};
        } catch (h) {
          console.error("Failed to submit form:", h);
        } finally {
          gt.value = !1;
        }
    }, Ke = (d, m) => {
      var h, J;
      if (lt.value[d] = m, m && m.toString().trim() !== "") {
        let Se = null;
        if ((h = _t.value) != null && h.fields && (Se = _t.value.fields.find((ve) => ve.name === d)), !Se && ((J = pe.value) != null && J.fields) && (Se = pe.value.fields.find((ve) => ve.name === d)), Se) {
          const ve = ys(Se, m);
          ve ? (ct.value[d] = ve, console.log(`Validation error for ${d}:`, ve)) : delete ct.value[d];
        }
      } else
        delete ct.value[d], console.log(`Cleared error for ${d}`);
    }, Et = (d) => {
      const m = d.replace(/\D/g, "");
      return m.length >= 7 && m.length <= 15;
    }, ys = (d, m) => {
      if (d.required && (!m || m.toString().trim() === ""))
        return `${d.label} is required`;
      if (!m || m.toString().trim() === "")
        return null;
      if (d.type === "email" && !Er(m))
        return "Please enter a valid email address";
      if (d.type === "tel" && !Et(m))
        return "Please enter a valid phone number";
      if ((d.type === "text" || d.type === "textarea") && d.minLength && m.length < d.minLength)
        return `${d.label} must be at least ${d.minLength} characters`;
      if ((d.type === "text" || d.type === "textarea") && d.maxLength && m.length > d.maxLength)
        return `${d.label} must not exceed ${d.maxLength} characters`;
      if (d.type === "number") {
        const h = parseFloat(m);
        if (isNaN(h))
          return `${d.label} must be a valid number`;
        if (d.minLength && h < d.minLength)
          return `${d.label} must be at least ${d.minLength}`;
        if (d.maxLength && h > d.maxLength)
          return `${d.label} must not exceed ${d.maxLength}`;
      }
      return null;
    }, kt = async () => {
      if (!(gt.value || !_t.value))
        try {
          gt.value = !0, ct.value = {};
          let d = !1;
          for (const m of _t.value.fields || []) {
            const h = lt.value[m.name], J = ys(m, h);
            J && (ct.value[m.name] = J, d = !0, console.log(`Validation error for field ${m.name}:`, J));
          }
          if (d) {
            gt.value = !1, console.log("Validation failed, not submitting");
            return;
          }
          await he(lt.value), an.value = !1, _t.value = null, lt.value = {};
        } catch (d) {
          console.error("Failed to submit full screen form:", d);
        } finally {
          gt.value = !1, console.log("Full screen form submission completed");
        }
    }, ii = (d, m) => {
      if (console.log("handleViewDetails called with:", { product: d, shopDomain: m }), !d) {
        console.error("No product provided to handleViewDetails");
        return;
      }
      let h = null;
      if (d.handle && m)
        h = `https://${m}/products/${d.handle}`;
      else if (d.id && m)
        h = `https://${m}/products/${d.id}`;
      else if (m) {
        if (!d.handle && !d.id) {
          console.error("Product handle and ID are both missing! Product:", d), alert("Unable to open product: Product information incomplete.");
          return;
        }
      } else {
        console.error("Shop domain is missing! Product:", d), alert("Unable to open product: Shop domain not available. Please contact support.");
        return;
      }
      h && (console.log("Opening product URL:", h), window.open(h, "_blank", "noopener"));
    }, Ka = (d) => {
      if (!d) return "";
      let m = d.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "");
      const h = [];
      return m = m.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (J, Se, ve) => {
        const ut = `__MARKDOWN_LINK_${h.length}__`;
        return console.log("Found markdown link:", J, "-> placeholder:", ut), h.push(J), ut;
      }), console.log("After replacing markdown links with placeholders:", m), console.log("Markdown links array:", h), m = m.replace(/https?:\/\/[^\s\)]+/g, "[link removed]"), console.log("After removing standalone URLs:", m), h.forEach((J, Se) => {
        m = m.replace(`__MARKDOWN_LINK_${Se}__`, J), console.log(`Restored markdown link ${Se}:`, J);
      }), m = m.replace(/\n\s*\n\s*\n/g, `

`).trim(), m;
    }, Ga = oe(!1);
    oe(!1);
    const ho = le(() => {
      var d;
      return !!((d = P.value) != null && d.human_agent_name);
    }), Ya = le(() => {
      var d;
      return l_((d = window.__INITIAL_DATA__) == null ? void 0 : d.presence, ho.value);
    }), Tf = le(() => On.value && ho.value && xt.value.length < Pc), Af = async () => {
      try {
        Nn.value = !1, _s.value = null, await Ae();
      } catch (d) {
        console.error("Failed to proceed workflow:", d);
      }
    }, po = async (d) => {
      try {
        if (!d.userInputValue || !d.userInputValue.trim())
          return;
        const m = d.userInputValue.trim();
        d.isSubmitted = !0, d.submittedValue = m, await j(m, Y.value);
      } catch (m) {
        console.error("Failed to submit user input:", m), d.isSubmitted = !1, d.submittedValue = null;
      }
    }, Xa = (d, { reason: m, description: h, keepalive: J = !1 } = {}) => {
      const Se = new URL(`${Ns.API_URL}/widgets/${n.value}/end-chat`);
      return Se.searchParams.append("session_id", d), m && Se.searchParams.append("reason", m), h && Se.searchParams.append("description", h), fetch(Se, {
        method: "POST",
        keepalive: J,
        headers: {
          Authorization: `Bearer ${Ie.value}`,
          "Content-Type": "application/json"
        }
      });
    }, Sf = async (d) => {
      try {
        typeof d == "string" && d && Ie.value && n.value && await Xa(d, { reason: "CUSTOMER_REQUEST", keepalive: !0 });
      } catch {
      } finally {
        Tt({ type: "END_CHAT_DONE" });
      }
    }, Za = () => {
      if (!Rs()) {
        Ja();
        return;
      }
      Tt({ type: "IDENTITY_EXPIRED" });
    }, Ja = async () => {
      Ie.value && (dt(null), await vr());
    }, xf = async (d) => {
      const m = os(d);
      !m || m === Ie.value || (dt(m), await vr());
    }, vr = async () => {
      var d, m, h;
      try {
        let J = 0;
        const Se = 50;
        for (; !((d = window.__INITIAL_DATA__) != null && d.widgetId) && J < Se; )
          await new Promise((ut) => setTimeout(ut, 100)), J++;
        return (m = window.__INITIAL_DATA__) != null && m.widgetId ? (we(window.__INITIAL_DATA__.widgetId), await on() ? ((h = window.__INITIAL_DATA__) != null && h.workflow && te.value && await Le(), !0) : (O.value = "connected", !1)) : (console.error("Widget data not available after waiting"), !1);
      } catch (J) {
        return console.error("Failed to initialize widget:", J), !1;
      }
    };
    window.addEventListener("message", (d) => {
      d.source === window.parent && (!d.data || typeof d.data.type != "string" || (d.data.type === "SCROLL_TO_BOTTOM" && gn(), d.data.type === "HOST_PAGE" && lf(d.data.url), d.data.type === "END_CHAT" && Rs() && Sf(d.data.sessionId), d.data.type === "IDENTITY_UNAVAILABLE" && Rs() && Ja(), d.data.type === "TOKEN_REFRESH" && Rs() && xf(d.data.token), d.data.type === "WIDGET_VISIBILITY" && (ll.value = !!d.data.open), d.data.type === "WIDGET_DISPLAY" && (vo.value = {
        mode: d.data.mode,
        width: d.data.width,
        height: d.data.height,
        hotkey: d.data.hotkey
      }), d.data.type === "PREFILL_MESSAGE" && typeof d.data.text == "string" && (F.value = d.data.text.slice(0, 2e3), rs(() => {
        const m = document.querySelector(
          ".message-input input, .welcome-message-field"
        );
        m == null || m.focus();
      }))));
    }), window.addEventListener("keydown", (d) => {
      d.key !== "Escape" || d.defaultPrevented || !qi() || Tt({ type: "WIDGET_ESCAPE" });
    });
    const Ef = () => {
      S(async () => {
        await on();
      }), Ye(async () => {
        await on();
      }), ge(({ session_id: d, authenticated: m, created: h }) => {
        Tt({
          type: "CHAT_SESSION",
          sessionId: d,
          authenticated: m,
          created: h
        });
      }), Ve((d) => {
        var m;
        if (yr.value = d.button_text || "Start Chat", d.type === "landing_page")
          _s.value = d.landing_page_data, Nn.value = !0, an.value = !1;
        else if (d.type === "form" || d.type === "display_form")
          if (((m = d.form_data) == null ? void 0 : m.form_full_screen) === !0)
            _t.value = d.form_data, an.value = !0, Nn.value = !1;
          else {
            const h = {
              message: "",
              message_type: "form",
              attributes: {
                form_data: d.form_data
              },
              created_at: (/* @__PURE__ */ new Date()).toISOString(),
              isSubmitted: !1
            };
            l.value.findIndex(
              (Se) => Se.message_type === "form" && !Se.isSubmitted
            ) === -1 && l.value.push(h), Nn.value = !1, an.value = !1;
          }
        else
          Nn.value = !1, an.value = !1;
      }), $e((d) => {
        console.log("Workflow proceeded:", d);
      });
    }, Cf = async () => {
      try {
        await vr(), await Le();
      } catch (d) {
        throw console.error("Failed to start new conversation:", d), d;
      }
    }, oi = le(
      () => {
        var d;
        return s.value.allow_new_chat === !0 && l.value.length > 0 && !((d = P.value) != null && d.human_agent_name) && !bs.value;
      }
    ), Gn = oe(!1), Yn = oe(""), Xn = oe(!1);
    let vs = null;
    const Vs = () => {
      Xn.value = !1, Yn.value = "", vs && (clearTimeout(vs), vs = null);
    }, Qa = () => {
      if (!Gn.value) {
        if (Xn.value) {
          Vs();
          return;
        }
        Xn.value = !0, Yn.value = "", vs = setTimeout(Vs, Mm);
      }
    };
    bt(oi, (d) => {
      d || Vs();
    });
    const el = async () => {
      Gn.value || (vs && (clearTimeout(vs), vs = null), await Rf(), Yn.value || (Xn.value = !1));
    }, Rf = async () => {
      if (!Gn.value) {
        Gn.value = !0, Yn.value = "";
        try {
          if (!await ce()) {
            Yn.value = _c;
            return;
          }
          P.value = {}, F.value = "", xt.value = [], await vr();
        } catch (d) {
          console.error("Failed to start a new chat:", d), Yn.value = _c;
        } finally {
          Gn.value = !1;
        }
      }
    }, If = async () => {
      V.value = !1, l.value = [], P.value = {}, await Cf();
    };
    eo(async () => {
      await vr(), Ef(), be(), document.addEventListener("click", Ce), (() => {
        const m = l.value.length > 0, h = O.value === "connected", J = document.querySelector('input[type="text"], textarea') !== null;
        return m || h || J;
      })() && z(100);
    }), Qr(() => {
      window.removeEventListener("message", (d) => {
        d.data.type === "SCROLL_TO_BOTTOM" && gn();
      }), document.removeEventListener("click", Ce), _e && (_e.disconnect(), _e = null), be.timeoutId && (clearTimeout(be.timeoutId), be.timeoutId = null), U = !0, f(), N(), it(), Vs(), C();
    });
    const Ks = le(() => s.value.chat_style === "AURORA"), ln = le(() => s.value.chat_style === "ASK_ANYTHING" || Ks.value), tl = le(() => s.value.customization_metadata), br = le(() => {
      var m;
      const d = (m = tl.value) == null ? void 0 : m.avatar_style;
      return d === "orb" ? !0 : d === "photo" ? !1 : Ks.value && !s.value.photo_url;
    }), Gs = le(() => {
      var d;
      return o_(r.value || "", (d = tl.value) == null ? void 0 : d.orb_variant);
    }), Of = {
      GLASS: "theme-glass",
      TERMINAL: "theme-terminal",
      PLAYFUL: "theme-playful",
      CALM_MINT: "theme-calm",
      SUNRISE: "theme-sunrise"
    }, Lf = le(() => Of[s.value.chat_style] || ""), Nf = le(() => Qy(s.value.chat_style, {
      chat_background_color: s.value.chat_background_color,
      chat_text_color: s.value.chat_text_color,
      accent_color: s.value.accent_color,
      font_family: s.value.font_family
    })), mo = le(
      () => Array.isArray(s.value.quick_actions) ? s.value.quick_actions.filter((d) => !!d && d.trim().length > 0) : []
    ), nl = le(() => (s.value.welcome_message || "").trim()), sl = le(
      () => !ln.value && l.value.length === 0 && !w.value && !bs.value
    ), Pf = le(
      () => sl.value && nl.value.length > 0
    ), Mf = le(
      () => sl.value && !V.value && mo.value.length > 0
    ), ai = le(() => s.value.show_citations === !0), rl = le(() => a_(s.value.show_ai_disclaimer, ho.value)), Df = (d) => /^[0-9a-f]{16,}$/i.test(d) || /^[0-9a-f-]{32,}$/i.test(d), go = (d) => {
      const m = (d || "").trim().toLowerCase();
      return !m || m === "unknown" ? "Knowledge base" : m.charAt(0).toUpperCase() + m.slice(1);
    }, _o = (d) => {
      let m = ((d == null ? void 0 : d.name) || "").trim();
      return !m || (m = m.replace(/^[0-9a-f]{16,}[_-]/i, "").replace(/\.(pdf|txt|md|html?|docx?|csv|json)$/i, ""), !m || Df(m)) ? go(d == null ? void 0 : d.type) : m;
    }, il = (d) => {
      const m = _o(d), h = go(d == null ? void 0 : d.type);
      return m === h ? h : `${m} · ${h}`;
    }, yo = le(() => s.value.collect_email === !0 && !ln.value), ol = oe(!1), Zn = oe(""), wr = oe(!1), bs = le(() => !I.value && yo.value && !ol.value), al = async () => {
      const d = Y.value.trim();
      if (!d) {
        Zn.value = "Please enter your email address.";
        return;
      }
      if (!Er(d)) {
        Zn.value = "Please enter a valid email address.";
        return;
      }
      Zn.value = "", wr.value = !0;
      try {
        await on(), ol.value = !0;
      } catch {
        Zn.value = "Something went wrong. Please try again.";
      } finally {
        wr.value = !1;
      }
    }, vo = oe(null), ll = oe(!0), bo = { mode: "floating", width: 400, height: 560 }, li = le(
      () => {
        var d;
        return vo.value || ((d = s.value.customization_metadata) == null ? void 0 : d.widget_display) || null;
      }
    ), Ff = le(() => {
      const d = li.value;
      return d ? typeof d.mode == "string" && d.mode !== bo.mode || typeof d.width == "number" && d.width !== bo.width || typeof d.height == "number" && d.height !== bo.height : !1;
    }), $f = le(() => {
      var m;
      const d = {
        width: "100%",
        height: "100%",
        borderRadius: "var(--radius-lg)"
      };
      if (Ff.value) {
        const h = (m = li.value) == null ? void 0 : m.mode;
        return h === "sidebar-left" || h === "sidebar-right" ? { ...d, borderRadius: "0" } : d;
      }
      return ln.value ? window.innerWidth <= 768 ? {
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
    }), cl = le(() => ln.value && l.value.length === 0), Bf = ["form", "user_input", "rating", "product", "shopify_output"], Uf = le(
      () => l.value.some(
        (d) => Bf.includes(d.message_type) || Array.isArray(d.attachments) && d.attachments.length > 0
      )
    ), zf = le(() => {
      var m, h;
      return ln.value ? !0 : (((m = li.value) == null ? void 0 : m.mode) === "ask-ai" || ((h = li.value) == null ? void 0 : h.mode) === "search-bar") && !On.value;
    }), wo = le(
      () => zf.value && se.value && !Nn.value && !an.value && !bs.value && !V.value && !Uf.value
    );
    bt(wo, (d) => {
      Tt({ type: "WIDGET_SURFACE", palette: d });
    }, { immediate: !0 });
    const Hf = le(
      () => s.value.welcome_subtitle || `Ask a question — ${r.value || "the assistant"} answers from what it knows.`
    ), jf = le(() => {
      var d;
      return ((d = vo.value) == null ? void 0 : d.hotkey) !== !1;
    });
    return (d, m) => Kt.value && ur.value ? (k(), A("div", tv, [
      g("button", {
        type: "button",
        class: "cm-error-close",
        "aria-label": "Close chat",
        title: "Close",
        onClick: Ln
      }, "×"),
      m[20] || (m[20] = Ts('<div class="widget-unavailable-card" data-v-939d55b6><div class="widget-unavailable-icon-wrapper" data-v-939d55b6><svg class="widget-unavailable-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-v-939d55b6><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" data-v-939d55b6></path><path d="M9 12l2 2 4-4" data-v-939d55b6></path></svg></div><h2 class="widget-unavailable-title" data-v-939d55b6>Chat Unavailable</h2><p class="widget-unavailable-message" data-v-939d55b6> This chat widget is not currently configured. Please contact the website administrator to enable chat support. </p><div class="widget-unavailable-footer" data-v-939d55b6><svg class="chattermate-logo-small" width="14" height="14" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-939d55b6><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-939d55b6></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-939d55b6></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-939d55b6></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-939d55b6></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-939d55b6><span class="cm-powered-prefix" data-v-939d55b6>Powered by </span><strong class="cm-brand" data-v-939d55b6>ChatterMate</strong></a></div></div>', 1))
    ])) : Kt.value ? (k(), A("div", nv, [
      g("button", {
        type: "button",
        class: "cm-error-close",
        "aria-label": "Close chat",
        title: "Close",
        onClick: Ln
      }, "×"),
      g("div", sv, [
        m[21] || (m[21] = Ts('<div class="auth-error-header" data-v-939d55b6><svg class="auth-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-939d55b6><circle cx="12" cy="12" r="10" data-v-939d55b6></circle><line x1="12" y1="8" x2="12" y2="12" data-v-939d55b6></line><line x1="12" y1="16" x2="12.01" y2="16" data-v-939d55b6></line></svg><h2 data-v-939d55b6>Authentication Error</h2></div>', 1)),
        g("p", rv, Z(Ht.value), 1),
        g("button", {
          class: "auth-error-refresh-btn",
          onClick: m[0] || (m[0] = () => d.window.location.reload())
        }, " Refresh Page ")
      ])
    ])) : n.value && !Kt.value ? (k(), A("div", {
      key: 2,
      class: Pe(["chat-container cm-surface", [{ collapsed: !se.value, "ask-anything-style": ln.value, aurora: Ks.value }, Lf.value]]),
      style: Ee({ ...x(dr), ...$f.value, ...Nf.value })
    }, [
      Re.value ? (k(), A("div", iv, m[22] || (m[22] = [
        Ts('<div class="loading-spinner" data-v-939d55b6><div class="dot" data-v-939d55b6></div><div class="dot" data-v-939d55b6></div><div class="dot" data-v-939d55b6></div></div><div class="loading-text" data-v-939d55b6>Initializing chat...</div>', 2)
      ]))) : re("", !0),
      !Re.value && x(O) !== "connected" ? (k(), A("div", {
        key: 1,
        class: Pe(["connection-status", x(O)])
      }, [
        x(O) === "connecting" ? (k(), A("div", ov, m[23] || (m[23] = [
          Mn(" Connecting to chat service... ", -1),
          g("div", { class: "loading-dots" }, [
            g("div", { class: "dot" }),
            g("div", { class: "dot" }),
            g("div", { class: "dot" })
          ], -1)
        ]))) : x(O) === "failed" ? (k(), A("div", av, [
          m[24] || (m[24] = Mn(" Connection failed. ", -1)),
          g("button", {
            onClick: fo,
            class: "reconnect-button"
          }, " Click here to reconnect ")
        ])) : re("", !0)
      ], 2)) : re("", !0),
      x(b) ? (k(), A("div", {
        key: 2,
        class: "error-alert",
        style: Ee(x(fr))
      }, Z(x(c)), 5)) : re("", !0),
      wo.value ? (k(), ns(lg, {
        key: 3,
        messages: x(l),
        draft: F.value,
        "agent-name": x(r),
        suggestions: mo.value,
        "welcome-title": x(s).welcome_title,
        "welcome-subtitle": Hf.value,
        placeholder: Vn.value,
        "input-enabled": Dt.value,
        "typing-enabled": ms.value,
        loading: x(u),
        "show-citations": ai.value,
        disclaimer: rl.value ? x(vc) : "",
        active: ll.value,
        hotkey: jf.value,
        "can-start-new-chat": oi.value,
        "starting-new-chat": Gn.value,
        "new-chat-armed": Xn.value,
        "new-chat-error": Yn.value,
        onNewChat: Qa,
        onConfirmNewChat: el,
        onCancelNewChat: Vs,
        "citation-label": _o,
        "citation-tooltip": il,
        "display-text": x(K),
        "is-streaming": x(G),
        "onUpdate:draft": m[1] || (m[1] = (h) => F.value = h),
        onSend: mn,
        onAsk: Hs,
        onClose: Ln
      }, null, 8, ["messages", "draft", "agent-name", "suggestions", "welcome-title", "welcome-subtitle", "placeholder", "input-enabled", "typing-enabled", "loading", "show-citations", "disclaimer", "active", "hotkey", "can-start-new-chat", "starting-new-chat", "new-chat-armed", "new-chat-error", "display-text", "is-streaming"])) : cl.value ? (k(), A("div", {
        key: 4,
        class: Pe(["welcome-message-section", { aurora: Ks.value }]),
        style: Ee(x(sn))
      }, [
        g("div", lv, [
          g("div", cv, [
            br.value ? (k(), A("div", {
              key: 0,
              class: "welcome-orb",
              style: Ee(Gs.value)
            }, null, 4)) : x(St) ? (k(), A("img", {
              key: 1,
              src: x(St),
              alt: x(r),
              class: "welcome-avatar"
            }, null, 8, uv)) : re("", !0),
            g("h1", fv, Z(x(s).welcome_title || `Welcome to ${x(r)}`), 1),
            g("p", dv, Z(x(s).welcome_subtitle || "I'm here to help you with anything you need. What can I assist you with today?"), 1)
          ])
        ]),
        g("div", hv, [
          !x(I) && !te.value && yo.value ? (k(), A("div", pv, [
            Qn(g("input", {
              "onUpdate:modelValue": m[2] || (m[2] = (h) => Y.value = h),
              type: "email",
              placeholder: "Enter your email address",
              disabled: x(u) || x(O) !== "connected",
              class: Pe([{
                invalid: Y.value.trim() && !x(Er)(Y.value.trim()),
                disabled: x(O) !== "connected"
              }, "welcome-email-input"])
            }, null, 10, mv), [
              [As, Y.value]
            ])
          ])) : re("", !0),
          g("div", gv, [
            Qn(g("input", {
              "onUpdate:modelValue": m[3] || (m[3] = (h) => F.value = h),
              type: "text",
              placeholder: Vn.value,
              onKeypress: js,
              onInput: de,
              onChange: de,
              disabled: !ms.value,
              class: Pe([{ disabled: !ms.value }, "welcome-message-field"])
            }, null, 42, _v), [
              [As, F.value]
            ]),
            g("button", {
              class: Pe(["welcome-send-button", { "aurora-send": Ks.value }]),
              style: Ee(x(wn)),
              onClick: mn,
              disabled: !F.value.trim() || !Dt.value || zs.value
            }, [
              Ks.value ? (k(), A("svg", vv, m[25] || (m[25] = [
                g("path", {
                  d: "M12 19V5M12 5L5 12M12 5L19 12",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                }, null, -1)
              ]))) : (k(), A("svg", bv, m[26] || (m[26] = [
                g("path", {
                  d: "M5 12L3 21L21 12L3 3L5 12ZM5 12L13 12",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                }, null, -1)
              ])))
            ], 14, yv)
          ])
        ]),
        g("div", {
          class: "powered-by-welcome",
          style: Ee(x(rn))
        }, m[27] || (m[27] = [
          Ts('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-939d55b6><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-939d55b6></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-939d55b6></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-939d55b6></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-939d55b6></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-939d55b6><span class="cm-powered-prefix" data-v-939d55b6>Powered by </span><strong class="cm-brand" data-v-939d55b6>ChatterMate</strong></a>', 2)
        ]), 4)
      ], 6)) : re("", !0),
      Nn.value && _s.value ? (k(), A("div", {
        key: 5,
        class: "landing-page-fullscreen",
        style: Ee(x(sn))
      }, [
        g("div", wv, [
          g("div", kv, [
            g("h2", Tv, Z(_s.value.heading), 1),
            g("div", Av, Z(_s.value.content), 1)
          ]),
          g("div", Sv, [
            g("button", {
              class: "landing-page-button",
              onClick: Af
            }, Z(yr.value), 1)
          ])
        ]),
        g("div", {
          class: "powered-by-landing",
          style: Ee(x(rn))
        }, m[28] || (m[28] = [
          Ts('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-939d55b6><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-939d55b6></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-939d55b6></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-939d55b6></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-939d55b6></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-939d55b6><span class="cm-powered-prefix" data-v-939d55b6>Powered by </span><strong class="cm-brand" data-v-939d55b6>ChatterMate</strong></a>', 2)
        ]), 4)
      ], 4)) : an.value && _t.value ? (k(), A("div", {
        key: 6,
        class: "form-fullscreen",
        style: Ee(x(sn))
      }, [
        g("div", xv, [
          _t.value.title || _t.value.description ? (k(), A("div", Ev, [
            _t.value.title ? (k(), A("h2", Cv, Z(_t.value.title), 1)) : re("", !0),
            _t.value.description ? (k(), A("p", Rv, Z(_t.value.description), 1)) : re("", !0)
          ])) : re("", !0),
          g("div", Iv, [
            (k(!0), A(Oe, null, ft(_t.value.fields, (h) => {
              var J, Se;
              return k(), A("div", {
                key: h.name,
                class: "form-field"
              }, [
                g("label", {
                  for: `fullscreen-form-${h.name}`,
                  class: "field-label"
                }, [
                  Mn(Z(h.label) + " ", 1),
                  h.required ? (k(), A("span", Lv, "*")) : re("", !0)
                ], 8, Ov),
                h.type === "text" || h.type === "email" || h.type === "tel" ? (k(), A("input", {
                  key: 0,
                  id: `fullscreen-form-${h.name}`,
                  type: h.type,
                  placeholder: h.placeholder || "",
                  required: h.required,
                  minlength: h.minLength,
                  maxlength: h.maxLength,
                  value: lt.value[h.name] || "",
                  onInput: (ve) => Ke(h.name, ve.target.value),
                  onBlur: (ve) => Ke(h.name, ve.target.value),
                  class: Pe(["form-input", { error: ct.value[h.name] }]),
                  autocomplete: h.type === "email" ? "email" : h.type === "tel" ? "tel" : "off",
                  inputmode: h.type === "tel" ? "tel" : h.type === "email" ? "email" : "text"
                }, null, 42, Nv)) : h.type === "number" ? (k(), A("input", {
                  key: 1,
                  id: `fullscreen-form-${h.name}`,
                  type: "number",
                  placeholder: h.placeholder || "",
                  required: h.required,
                  min: h.minLength,
                  max: h.maxLength,
                  value: lt.value[h.name] || "",
                  onInput: (ve) => Ke(h.name, ve.target.value),
                  class: Pe(["form-input", { error: ct.value[h.name] }])
                }, null, 42, Pv)) : h.type === "textarea" ? (k(), A("textarea", {
                  key: 2,
                  id: `fullscreen-form-${h.name}`,
                  placeholder: h.placeholder || "",
                  required: h.required,
                  minlength: h.minLength,
                  maxlength: h.maxLength,
                  value: lt.value[h.name] || "",
                  onInput: (ve) => Ke(h.name, ve.target.value),
                  class: Pe(["form-textarea", { error: ct.value[h.name] }]),
                  rows: "4"
                }, null, 42, Mv)) : h.type === "select" ? (k(), A("select", {
                  key: 3,
                  id: `fullscreen-form-${h.name}`,
                  required: h.required,
                  value: lt.value[h.name] || "",
                  onChange: (ve) => Ke(h.name, ve.target.value),
                  class: Pe(["form-select", { error: ct.value[h.name] }])
                }, [
                  g("option", Fv, Z(h.placeholder || "Please select..."), 1),
                  (k(!0), A(Oe, null, ft((Array.isArray(h.options) ? h.options : ((J = h.options) == null ? void 0 : J.split(`
`)) || []).filter((ve) => ve.trim()), (ve) => (k(), A("option", {
                    key: ve,
                    value: ve.trim()
                  }, Z(ve.trim()), 9, $v))), 128))
                ], 42, Dv)) : h.type === "checkbox" ? (k(), A("label", Bv, [
                  g("input", {
                    id: `fullscreen-form-${h.name}`,
                    type: "checkbox",
                    required: h.required,
                    checked: lt.value[h.name] || !1,
                    onChange: (ve) => Ke(h.name, ve.target.checked),
                    class: "form-checkbox"
                  }, null, 40, Uv),
                  g("span", zv, Z(h.label), 1)
                ])) : h.type === "radio" ? (k(), A("div", Hv, [
                  (k(!0), A(Oe, null, ft((Array.isArray(h.options) ? h.options : ((Se = h.options) == null ? void 0 : Se.split(`
`)) || []).filter((ve) => ve.trim()), (ve) => (k(), A("label", {
                    key: ve,
                    class: "radio-field"
                  }, [
                    g("input", {
                      type: "radio",
                      name: `fullscreen-form-${h.name}`,
                      value: ve.trim(),
                      required: h.required,
                      checked: lt.value[h.name] === ve.trim(),
                      onChange: (ut) => Ke(h.name, ve.trim()),
                      class: "form-radio"
                    }, null, 40, jv),
                    g("span", Wv, Z(ve.trim()), 1)
                  ]))), 128))
                ])) : re("", !0),
                ct.value[h.name] ? (k(), A("div", qv, Z(ct.value[h.name]), 1)) : re("", !0)
              ]);
            }), 128))
          ]),
          g("div", Vv, [
            g("button", {
              onClick: m[4] || (m[4] = () => {
                console.log("Submit button clicked!"), kt();
              }),
              disabled: gt.value,
              class: "submit-form-button",
              style: Ee(x(wn))
            }, [
              gt.value ? (k(), A("span", Gv, m[29] || (m[29] = [
                g("div", { class: "dot" }, null, -1),
                g("div", { class: "dot" }, null, -1),
                g("div", { class: "dot" }, null, -1)
              ]))) : (k(), A("span", Yv, Z(_t.value.submit_button_text || "Submit"), 1))
            ], 12, Kv)
          ])
        ]),
        g("div", {
          class: "powered-by-landing",
          style: Ee(x(rn))
        }, m[30] || (m[30] = [
          Ts('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-939d55b6><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-939d55b6></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-939d55b6></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-939d55b6></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-939d55b6></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-939d55b6><span class="cm-powered-prefix" data-v-939d55b6>Powered by </span><strong class="cm-brand" data-v-939d55b6>ChatterMate</strong></a>', 2)
        ]), 4)
      ], 4)) : !cl.value && se.value && !wo.value ? (k(), A("div", {
        key: 7,
        class: Pe(["chat-panel", { "ask-anything-chat": ln.value }]),
        style: Ee(x(sn))
      }, [
        ln.value ? (k(), A("div", {
          key: 1,
          class: "ask-anything-top",
          style: Ee(x(Fs))
        }, [
          g("div", sb, [
            p.value || x(St) ? (k(), A("img", {
              key: 0,
              src: p.value || x(St),
              alt: x(P).human_agent_name || x(r),
              class: "header-avatar"
            }, null, 8, rb)) : re("", !0),
            g("div", ib, [
              g("h3", {
                style: Ee(x(rn))
              }, Z(x(r)), 5),
              g("p", {
                class: "ask-anything-subtitle",
                style: Ee(x(rn))
              }, Z(x(s).welcome_subtitle || "Ask me anything. I'm here to help."), 5)
            ])
          ])
        ], 4)) : (k(), A("div", {
          key: 0,
          class: "chat-header",
          style: Ee(x(Fs))
        }, [
          g("div", {
            class: "cm-header-sheen",
            style: Ee({ background: "linear-gradient(90deg, transparent, " + (x(s).accent_color || "#C9F24E") + ", transparent)" })
          }, null, 4),
          g("div", Xv, [
            !p.value && (br.value || !x(St)) ? (k(), A("div", {
              key: 0,
              class: "header-orb",
              style: Ee(Gs.value)
            }, null, 4)) : p.value || x(St) ? (k(), A("img", {
              key: 1,
              src: p.value || x(St),
              alt: x(P).human_agent_name || x(r),
              class: "header-avatar"
            }, null, 8, Zv)) : re("", !0),
            g("div", Jv, [
              g("h3", {
                style: Ee(x(rn))
              }, Z(x(P).human_agent_name || x(r)), 5),
              g("div", Qv, [
                g("span", {
                  class: Pe(["status-indicator", Ya.value.online ? "online" : "away"])
                }, null, 2),
                g("span", eb, Z(Ya.value.text), 1)
              ])
            ])
          ]),
          g("div", tb, [
            oi.value ? (k(), A("button", {
              key: 0,
              type: "button",
              class: Pe(["header-new-chat", { armed: Xn.value }]),
              style: Ee(x(rn)),
              disabled: Gn.value,
              title: x(zi),
              "aria-label": x(zi),
              "aria-expanded": Xn.value,
              onClick: Qa
            }, m[31] || (m[31] = [
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
            ]), 14, nb)) : re("", !0),
            g("button", {
              type: "button",
              class: "header-minimize",
              style: Ee(x(rn)),
              title: "Minimize",
              "aria-label": "Minimize chat",
              onClick: Ln
            }, m[32] || (m[32] = [
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
        x(w) ? (k(), A("div", ob, m[33] || (m[33] = [
          g("div", { class: "loading-spinner" }, [
            g("div", { class: "dot" }),
            g("div", { class: "dot" }),
            g("div", { class: "dot" })
          ], -1)
        ]))) : re("", !0),
        bs.value ? (k(), A("div", {
          key: 3,
          class: "cm-email-gate",
          style: Ee(x(sn))
        }, [
          g("div", {
            class: "cm-email-gate-orb",
            style: Ee(Gs.value)
          }, null, 4),
          g("h3", ab, Z(x(s).welcome_title || "Before we start"), 1),
          m[34] || (m[34] = g("p", { class: "cm-email-gate-text" }, "Enter your email and we'll continue the chat.", -1)),
          Qn(g("input", {
            "onUpdate:modelValue": m[5] || (m[5] = (h) => Y.value = h),
            type: "email",
            inputmode: "email",
            autocomplete: "email",
            placeholder: "you@example.com",
            class: Pe(["cm-email-gate-input", { invalid: !!Zn.value }]),
            disabled: wr.value,
            onKeyup: wi(al, ["enter"]),
            onInput: m[6] || (m[6] = (h) => Zn.value = "")
          }, null, 42, lb), [
            [As, Y.value]
          ]),
          Zn.value ? (k(), A("p", cb, Z(Zn.value), 1)) : re("", !0),
          g("button", {
            type: "button",
            class: "cm-email-gate-btn",
            style: Ee(x(wn)),
            disabled: wr.value,
            onClick: al
          }, Z(wr.value ? "Please wait…" : "Continue to chat"), 13, ub)
        ], 4)) : re("", !0),
        Xn.value && oi.value ? (k(), ns(ef, {
          key: 4,
          busy: Gn.value,
          error: Yn.value,
          onConfirm: el,
          onCancel: Vs
        }, null, 8, ["busy", "error"])) : re("", !0),
        Qn(g("div", {
          class: "chat-messages",
          ref_key: "messagesContainer",
          ref: Mt,
          role: "log",
          "aria-label": "Messages"
        }, [
          x(Nt) ? (k(), ns(Vg, {
            key: 0,
            progress: x(Nt),
            onSkip: x(v),
            onHide: x(L)
          }, null, 8, ["progress", "onSkip", "onHide"])) : re("", !0),
          Pf.value ? (k(), A("div", fb, [
            g("div", db, [
              br.value || !x(St) ? (k(), A("div", {
                key: 0,
                class: "cm-welcome-orb",
                style: Ee(Gs.value)
              }, null, 4)) : (k(), A("img", {
                key: 1,
                src: x(St),
                alt: x(r),
                class: "cm-welcome-avatar"
              }, null, 8, hb)),
              g("div", {
                class: "message-bubble cm-welcome-bubble",
                style: Ee(x(Wn))
              }, Z(nl.value), 5)
            ])
          ])) : re("", !0),
          (k(!0), A(Oe, null, ft(x(l), (h, J) => {
            var Se, ve, ut, ot, Ze, kr, Tr, Jn, Ys, ul, fl, dl, hl, pl, ml, gl, _l, yl, vl;
            return k(), A(Oe, { key: J }, [
              g("div", {
                class: Pe([
                  "message",
                  h.message_type === "bot" || h.message_type === "agent" ? "agent-message" : h.message_type === "system" ? "system-message" : h.message_type === "rating" ? "rating-message" : h.message_type === "form" ? "form-message" : h.message_type === "product" || h.shopify_output ? "product-message" : "user-message"
                ])
              }, [
                h.message_type === "bot" || h.message_type === "agent" ? (k(), A("div", pb, [
                  p.value ? (k(), A("img", {
                    key: 0,
                    src: p.value,
                    class: "cm-msg-avatar-img",
                    alt: ""
                  }, null, 8, mb)) : !br.value && x(St) ? (k(), A("img", {
                    key: 1,
                    src: x(St),
                    class: "cm-msg-avatar-img",
                    alt: ""
                  }, null, 8, gb)) : (k(), A("div", {
                    key: 2,
                    class: "cm-msg-avatar-orb",
                    style: Ee(Gs.value)
                  }, null, 4))
                ])) : re("", !0),
                g("div", _b, [
                  g("div", {
                    class: "message-bubble",
                    style: Ee(h.message_type === "system" || h.message_type === "rating" || h.message_type === "form" || h.message_type === "product" || h.shopify_output ? {} : h.message_type === "user" ? x(wn) : x(Wn))
                  }, [
                    h.message_type === "rating" ? (k(), A("div", yb, [
                      g("p", vb, "Rate the chat session that you had with " + Z(h.agent_name || x(P).human_agent_name || x(r) || "our agent"), 1),
                      g("div", {
                        class: Pe(["star-rating", { submitted: Zt.value || h.isSubmitted }])
                      }, [
                        (k(), A(Oe, null, ft(5, ($) => g("button", {
                          key: $,
                          class: Pe(["star-button", {
                            warning: $ <= (h.isSubmitted ? h.finalRating : Xt.value || h.selectedRating) && (h.isSubmitted ? h.finalRating : Xt.value || h.selectedRating) <= 3,
                            success: $ <= (h.isSubmitted ? h.finalRating : Xt.value || h.selectedRating) && (h.isSubmitted ? h.finalRating : Xt.value || h.selectedRating) > 3,
                            selected: $ <= (h.isSubmitted ? h.finalRating : Xt.value || h.selectedRating)
                          }]),
                          onMouseover: (Jt) => !h.isSubmitted && H($),
                          onMouseleave: (Jt) => !h.isSubmitted && ee,
                          onClick: (Jt) => !h.isSubmitted && ae($),
                          disabled: Zt.value || h.isSubmitted
                        }, " ★ ", 42, bb)), 64))
                      ], 2),
                      h.showFeedback && !h.isSubmitted ? (k(), A("div", wb, [
                        g("div", kb, [
                          Qn(g("input", {
                            "onUpdate:modelValue": ($) => h.feedback = $,
                            placeholder: "Please share your feedback (optional)",
                            disabled: Zt.value,
                            maxlength: "500",
                            class: "feedback-input"
                          }, null, 8, Tb), [
                            [As, h.feedback]
                          ]),
                          g("div", Ab, Z(((Se = h.feedback) == null ? void 0 : Se.length) || 0) + "/500", 1)
                        ]),
                        g("button", {
                          onClick: ($) => ye(h.session_id, Xt.value, h.feedback),
                          disabled: Zt.value || !Xt.value,
                          class: "submit-rating-button",
                          style: Ee({ backgroundColor: x(s).accent_color || "var(--accent-solid)" })
                        }, Z(Zt.value ? "Submitting..." : "Submit Rating"), 13, Sb)
                      ])) : re("", !0),
                      h.isSubmitted && h.finalFeedback ? (k(), A("div", xb, [
                        g("div", Eb, [
                          g("p", Cb, Z(h.finalFeedback), 1)
                        ])
                      ])) : h.isSubmitted ? (k(), A("div", Rb, " Thank you for your rating! ")) : re("", !0)
                    ])) : h.message_type === "form" ? (k(), A("div", Ib, [
                      (ut = (ve = h.attributes) == null ? void 0 : ve.form_data) != null && ut.title || (Ze = (ot = h.attributes) == null ? void 0 : ot.form_data) != null && Ze.description ? (k(), A("div", Ob, [
                        (Tr = (kr = h.attributes) == null ? void 0 : kr.form_data) != null && Tr.title ? (k(), A("h3", Lb, Z(h.attributes.form_data.title), 1)) : re("", !0),
                        (Ys = (Jn = h.attributes) == null ? void 0 : Jn.form_data) != null && Ys.description ? (k(), A("p", Nb, Z(h.attributes.form_data.description), 1)) : re("", !0)
                      ])) : re("", !0),
                      g("div", Pb, [
                        (k(!0), A(Oe, null, ft((fl = (ul = h.attributes) == null ? void 0 : ul.form_data) == null ? void 0 : fl.fields, ($) => {
                          var Jt, ko;
                          return k(), A("div", {
                            key: $.name,
                            class: "form-field"
                          }, [
                            g("label", {
                              for: `form-${$.name}`,
                              class: "field-label"
                            }, [
                              Mn(Z($.label) + " ", 1),
                              $.required ? (k(), A("span", Db, "*")) : re("", !0)
                            ], 8, Mb),
                            $.type === "text" || $.type === "email" || $.type === "tel" ? (k(), A("input", {
                              key: 0,
                              id: `form-${$.name}`,
                              type: $.type,
                              placeholder: $.placeholder || "",
                              required: $.required,
                              minlength: $.minLength,
                              maxlength: $.maxLength,
                              value: lt.value[$.name] || "",
                              onInput: (He) => Ke($.name, He.target.value),
                              onBlur: (He) => Ke($.name, He.target.value),
                              class: Pe(["form-input", { error: ct.value[$.name] }]),
                              disabled: gt.value,
                              autocomplete: $.type === "email" ? "email" : $.type === "tel" ? "tel" : "off",
                              inputmode: $.type === "tel" ? "tel" : $.type === "email" ? "email" : "text"
                            }, null, 42, Fb)) : $.type === "number" ? (k(), A("input", {
                              key: 1,
                              id: `form-${$.name}`,
                              type: "number",
                              placeholder: $.placeholder || "",
                              required: $.required,
                              min: $.min,
                              max: $.max,
                              value: lt.value[$.name] || "",
                              onInput: (He) => Ke($.name, He.target.value),
                              class: Pe(["form-input", { error: ct.value[$.name] }]),
                              disabled: gt.value
                            }, null, 42, $b)) : $.type === "textarea" ? (k(), A("textarea", {
                              key: 2,
                              id: `form-${$.name}`,
                              placeholder: $.placeholder || "",
                              required: $.required,
                              minlength: $.minLength,
                              maxlength: $.maxLength,
                              value: lt.value[$.name] || "",
                              onInput: (He) => Ke($.name, He.target.value),
                              class: Pe(["form-textarea", { error: ct.value[$.name] }]),
                              disabled: gt.value,
                              rows: "3"
                            }, null, 42, Bb)) : $.type === "select" ? (k(), A("select", {
                              key: 3,
                              id: `form-${$.name}`,
                              required: $.required,
                              value: lt.value[$.name] || "",
                              onChange: (He) => Ke($.name, He.target.value),
                              class: Pe(["form-select", { error: ct.value[$.name] }]),
                              disabled: gt.value
                            }, [
                              g("option", zb, Z($.placeholder || "Select an option"), 1),
                              (k(!0), A(Oe, null, ft((Array.isArray($.options) ? $.options : ((Jt = $.options) == null ? void 0 : Jt.split(`
`)) || []).filter((He) => He.trim()), (He) => (k(), A("option", {
                                key: He.trim(),
                                value: He.trim()
                              }, Z(He.trim()), 9, Hb))), 128))
                            ], 42, Ub)) : $.type === "checkbox" ? (k(), A("div", jb, [
                              g("input", {
                                id: `form-${$.name}`,
                                type: "checkbox",
                                checked: lt.value[$.name] || !1,
                                onChange: (He) => Ke($.name, He.target.checked),
                                class: "form-checkbox",
                                disabled: gt.value
                              }, null, 40, Wb),
                              g("label", {
                                for: `form-${$.name}`,
                                class: "checkbox-label"
                              }, Z($.placeholder || $.label), 9, qb)
                            ])) : $.type === "radio" ? (k(), A("div", Vb, [
                              (k(!0), A(Oe, null, ft((Array.isArray($.options) ? $.options : ((ko = $.options) == null ? void 0 : ko.split(`
`)) || []).filter((He) => He.trim()), (He) => (k(), A("div", {
                                key: He.trim(),
                                class: "radio-option"
                              }, [
                                g("input", {
                                  id: `form-${$.name}-${He.trim()}`,
                                  name: `form-${$.name}`,
                                  type: "radio",
                                  value: He.trim(),
                                  checked: lt.value[$.name] === He.trim(),
                                  onChange: (m0) => Ke($.name, He.trim()),
                                  class: "form-radio",
                                  disabled: gt.value
                                }, null, 40, Kb),
                                g("label", {
                                  for: `form-${$.name}-${He.trim()}`,
                                  class: "radio-label"
                                }, Z(He.trim()), 9, Gb)
                              ]))), 128))
                            ])) : re("", !0),
                            ct.value[$.name] ? (k(), A("div", Yb, Z(ct.value[$.name]), 1)) : re("", !0)
                          ]);
                        }), 128))
                      ]),
                      g("div", Xb, [
                        g("button", {
                          onClick: () => {
                            var $;
                            console.log("Regular form submit button clicked!"), st(($ = h.attributes) == null ? void 0 : $.form_data);
                          },
                          disabled: gt.value,
                          class: "form-submit-button",
                          style: Ee(x(wn))
                        }, Z(gt.value ? "Submitting..." : ((hl = (dl = h.attributes) == null ? void 0 : dl.form_data) == null ? void 0 : hl.submit_button_text) || "Submit"), 13, Zb)
                      ])
                    ])) : h.message_type === "user_input" ? (k(), A("div", Jb, [
                      (pl = h.attributes) != null && pl.prompt_message && h.attributes.prompt_message.trim() ? (k(), A("div", Qb, Z(h.attributes.prompt_message), 1)) : re("", !0),
                      h.isSubmitted ? (k(), A("div", sw, [
                        m[35] || (m[35] = g("strong", null, "Your input:", -1)),
                        Mn(" " + Z(h.submittedValue) + " ", 1),
                        (ml = h.attributes) != null && ml.confirmation_message && h.attributes.confirmation_message.trim() ? (k(), A("div", rw, Z(h.attributes.confirmation_message), 1)) : re("", !0)
                      ])) : (k(), A("div", ew, [
                        Qn(g("textarea", {
                          "onUpdate:modelValue": ($) => h.userInputValue = $,
                          class: "user-input-textarea",
                          placeholder: "Type your message here...",
                          rows: "3",
                          onKeydown: [
                            wi(Es(($) => po(h), ["ctrl"]), ["enter"]),
                            wi(Es(($) => po(h), ["meta"]), ["enter"])
                          ]
                        }, null, 40, tw), [
                          [As, h.userInputValue]
                        ]),
                        g("button", {
                          class: "user-input-submit-button",
                          onClick: ($) => po(h),
                          disabled: !h.userInputValue || !h.userInputValue.trim()
                        }, " Submit ", 8, nw)
                      ]))
                    ])) : h.shopify_output || h.message_type === "product" ? (k(), A("div", iw, [
                      h.message ? (k(), A("div", {
                        key: 0,
                        innerHTML: x(Ti)(((_l = (gl = h.shopify_output) == null ? void 0 : gl.products) == null ? void 0 : _l.length) > 0 ? Ka(h.message) : h.message),
                        class: "product-message-text"
                      }, null, 8, ow)) : re("", !0),
                      (yl = h.shopify_output) != null && yl.products && h.shopify_output.products.length > 0 ? (k(), A("div", aw, [
                        m[37] || (m[37] = g("h3", { class: "carousel-title" }, "Products", -1)),
                        g("div", lw, [
                          (k(!0), A(Oe, null, ft(h.shopify_output.products, ($) => {
                            var Jt;
                            return k(), A("div", {
                              key: $.id,
                              class: "product-card-compact carousel-item"
                            }, [
                              (Jt = $.image) != null && Jt.src ? (k(), A("div", cw, [
                                g("img", {
                                  src: $.image.src,
                                  alt: $.title,
                                  class: "product-thumbnail"
                                }, null, 8, uw)
                              ])) : re("", !0),
                              g("div", fw, [
                                g("div", dw, [
                                  g("div", hw, Z($.title), 1),
                                  $.variant_title && $.variant_title !== "Default Title" ? (k(), A("div", pw, Z($.variant_title), 1)) : re("", !0),
                                  g("div", mw, Z($.price_formatted || x(a)($.price, $.currency)), 1)
                                ]),
                                g("div", gw, [
                                  g("button", {
                                    class: "view-details-button-compact",
                                    onClick: (ko) => {
                                      var He;
                                      return ii($, (He = h.shopify_output) == null ? void 0 : He.shop_domain);
                                    }
                                  }, m[36] || (m[36] = [
                                    Mn(" View product ", -1),
                                    g("span", { class: "external-link-icon" }, "↗", -1)
                                  ]), 8, _w)
                                ])
                              ])
                            ]);
                          }), 128))
                        ])
                      ])) : !h.message && ((vl = h.shopify_output) != null && vl.products) && h.shopify_output.products.length === 0 ? (k(), A("div", yw, m[38] || (m[38] = [
                        g("p", null, "No products found.", -1)
                      ]))) : !h.message && h.shopify_output && !h.shopify_output.products ? (k(), A("div", vw, m[39] || (m[39] = [
                        g("p", null, "No products to display.", -1)
                      ]))) : re("", !0)
                    ])) : (k(), A(Oe, { key: 4 }, [
                      x(G)(J) ? (k(), A("div", {
                        key: 0,
                        class: "message-streaming",
                        innerHTML: x(Ti)(x(K)(J, h.message))
                      }, null, 8, bw)) : (k(), A("div", {
                        key: 1,
                        innerHTML: x(Ti)(h.message)
                      }, null, 8, ww)),
                      h.attachments && h.attachments.length > 0 ? (k(), A("div", kw, [
                        (k(!0), A(Oe, null, ft(h.attachments, ($) => (k(), A("div", {
                          key: $.id,
                          class: "attachment-item"
                        }, [
                          x(qn)($.content_type) ? (k(), A("div", Tw, [
                            g("img", {
                              src: x($s)($.file_url),
                              alt: $.filename,
                              class: "attachment-image",
                              onClick: Es((Jt) => x(gr)({ url: $.file_url, filename: $.filename, type: $.content_type, file_url: x($s)($.file_url), size: void 0 }), ["stop"]),
                              style: { cursor: "pointer" }
                            }, null, 8, Aw),
                            g("div", Sw, [
                              g("a", {
                                href: x($s)($.file_url),
                                target: "_blank",
                                class: "attachment-link"
                              }, [
                                m[40] || (m[40] = g("svg", {
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
                                Mn(" " + Z($.filename) + " ", 1),
                                g("span", Ew, "(" + Z(x(nt)($.file_size)) + ")", 1)
                              ], 8, xw)
                            ])
                          ])) : (k(), A("a", {
                            key: 1,
                            href: x($s)($.file_url),
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
                              g("path", { d: "M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" })
                            ], -1)),
                            Mn(" " + Z($.filename) + " ", 1),
                            g("span", Rw, "(" + Z(x(nt)($.file_size)) + ")", 1)
                          ], 8, Cw))
                        ]))), 128))
                      ])) : re("", !0)
                    ], 64))
                  ], 4),
                  ai.value && (h.message_type === "bot" || h.message_type === "agent") && h.sources && h.sources.length ? (k(), A("div", Iw, [
                    m[42] || (m[42] = g("span", { class: "citation-label" }, "Sources", -1)),
                    (k(!0), A(Oe, null, ft(h.sources, ($, Jt) => (k(), A("span", {
                      key: Jt,
                      class: "citation-chip",
                      title: il($)
                    }, Z(_o($)), 9, Ow))), 128))
                  ])) : re("", !0),
                  g("div", Lw, [
                    h.message_type === "user" ? (k(), A("span", Nw, " You ")) : re("", !0)
                  ])
                ])
              ], 2),
              (k(!0), A(Oe, null, ft(x(De)(J + 1), ($, Jt) => (k(), ns(Cg, {
                key: `receipt-${J}-${Jt}`,
                receipt: $
              }, null, 8, ["receipt"]))), 128))
            ], 64);
          }), 128)),
          X.value ? (k(), A("div", Pw, [
            br.value || !x(St) ? (k(), A("div", {
              key: 0,
              class: "cm-welcome-orb",
              style: Ee(Gs.value)
            }, null, 4)) : (k(), A("img", {
              key: 1,
              src: x(St),
              alt: x(r),
              class: "cm-welcome-avatar"
            }, null, 8, Mw)),
            g("div", {
              class: "message-bubble cm-welcome-bubble",
              style: Ee(x(Wn))
            }, Z(X.value.message), 5)
          ])) : re("", !0),
          M.value.length ? (k(), ns(Xg, {
            key: 3,
            chips: M.value,
            disabled: !Dt.value || x(bn),
            onPick: B
          }, null, 8, ["chips", "disabled"])) : re("", !0),
          x(vt) ? (k(), ns(wg, {
            key: 4,
            pending: x(vt),
            onApprove: x(zt),
            onDecline: x(qt)
          }, null, 8, ["pending", "onApprove", "onDecline"])) : re("", !0),
          x(u) && !x(vt) ? (k(), A("div", {
            key: 5,
            class: Pe(["typing-indicator", { "reading-indicator": ai.value }])
          }, [
            ai.value ? (k(), A(Oe, { key: 0 }, [
              m[43] || (m[43] = g("div", {
                class: "reading-bars",
                "aria-hidden": "true"
              }, [
                g("span"),
                g("span"),
                g("span")
              ], -1)),
              m[44] || (m[44] = g("span", { class: "reading-label" }, "reading knowledge base", -1))
            ], 64)) : (k(), A("div", {
              key: 1,
              class: "cm-typing-bubble",
              style: Ee(x(Wn))
            }, m[45] || (m[45] = [
              g("span", { class: "cm-typing-dot" }, null, -1),
              g("span", { class: "cm-typing-dot" }, null, -1),
              g("span", { class: "cm-typing-dot" }, null, -1)
            ]), 4))
          ], 2)) : re("", !0)
        ], 512), [
          [jh, !bs.value]
        ]),
        Mf.value ? (k(), A("div", Dw, [
          (k(!0), A(Oe, null, ft(mo.value, (h) => (k(), A("button", {
            key: h,
            type: "button",
            class: "cm-quick-action",
            disabled: !Dt.value,
            onClick: (J) => Hs(h)
          }, Z(h), 9, Fw))), 128))
        ])) : re("", !0),
        !V.value && !bs.value ? (k(), A("div", {
          key: 6,
          class: Pe(["chat-input", { "ask-anything-input": ln.value }])
        }, [
          g("input", {
            ref_key: "fileInputRef",
            ref: ni,
            type: "file",
            accept: f0,
            multiple: "",
            style: { display: "none" },
            onChange: m[7] || (m[7] = //@ts-ignore
            (...h) => x(Bs) && x(Bs)(...h))
          }, null, 544),
          x(xt).length > 0 ? (k(), A("div", $w, [
            (k(!0), A(Oe, null, ft(x(xt), (h, J) => (k(), A("div", {
              key: J,
              class: "file-preview-widget"
            }, [
              g("div", Bw, [
                x(ps)(h.type) ? (k(), A("img", {
                  key: 0,
                  src: x(hr)(h),
                  alt: h.filename,
                  class: "file-preview-image-widget",
                  onClick: Es((Se) => x(gr)(h), ["stop"]),
                  style: { cursor: "pointer" }
                }, null, 8, Uw)) : (k(), A("div", {
                  key: 1,
                  class: "file-preview-icon-widget",
                  onClick: Es((Se) => x(gr)(h), ["stop"]),
                  style: { cursor: "pointer" }
                }, m[46] || (m[46] = [
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
                ]), 8, zw))
              ]),
              g("div", Hw, [
                g("div", jw, Z(h.filename), 1),
                g("div", Ww, Z(x(nt)(h.size)), 1)
              ]),
              g("button", {
                type: "button",
                class: "file-preview-remove-widget",
                onClick: (Se) => x(uo)(J),
                title: "Remove file"
              }, " × ", 8, qw)
            ]))), 128))
          ])) : re("", !0),
          Ga.value ? (k(), A("div", Vw, m[47] || (m[47] = [
            g("div", { class: "upload-spinner-widget" }, null, -1),
            g("span", { class: "upload-text-widget" }, "Uploading files...", -1)
          ]))) : re("", !0),
          g("div", Kw, [
            Qn(g("input", {
              "onUpdate:modelValue": m[8] || (m[8] = (h) => F.value = h),
              type: "text",
              placeholder: Vn.value,
              onKeypress: js,
              onInput: de,
              onChange: de,
              onPaste: m[9] || (m[9] = //@ts-ignore
              (...h) => x(ri) && x(ri)(...h)),
              onDrop: m[10] || (m[10] = //@ts-ignore
              (...h) => x(pr) && x(pr)(...h)),
              onDragover: m[11] || (m[11] = //@ts-ignore
              (...h) => x(mr) && x(mr)(...h)),
              onDragleave: m[12] || (m[12] = //@ts-ignore
              (...h) => x(si) && x(si)(...h)),
              disabled: !ms.value,
              class: Pe({ disabled: !ms.value, "ask-anything-field": ln.value })
            }, null, 42, Gw), [
              [As, F.value]
            ]),
            Tf.value ? (k(), A("button", {
              key: 0,
              type: "button",
              class: "attach-button",
              disabled: Ga.value,
              onClick: m[13] || (m[13] = //@ts-ignore
              (...h) => x(_r) && x(_r)(...h)),
              title: `Attach files (${x(xt).length}/${Pc} used) or paste screenshots`
            }, m[48] || (m[48] = [
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
            ]), 8, Yw)) : re("", !0),
            g("button", {
              class: Pe(["send-button", { "ask-anything-send": ln.value }]),
              "aria-label": "Send message",
              style: Ee(x(wn)),
              onClick: mn,
              disabled: !F.value.trim() && x(xt).length === 0 || !Dt.value || zs.value
            }, m[49] || (m[49] = [
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
            ]), 14, Xw)
          ]),
          zs.value ? (k(), A("p", Zw, Z(x(Jg)), 1)) : re("", !0)
        ], 2)) : V.value && !bs.value ? (k(), A("div", Jw, [
          g("div", Qw, [
            m[50] || (m[50] = g("p", { class: "ended-text" }, "This chat has ended.", -1)),
            g("button", {
              class: "start-new-conversation-button",
              style: Ee(x(wn)),
              onClick: If
            }, " Click here to start a new conversation ", 4)
          ])
        ])) : re("", !0),
        rl.value ? (k(), A("div", e0, Z(x(vc)), 1)) : re("", !0),
        g("div", {
          class: "powered-by",
          style: Ee(x(rn))
        }, m[51] || (m[51] = [
          Ts('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-939d55b6><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-939d55b6></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-939d55b6></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-939d55b6></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-939d55b6></circle></svg><a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener" data-v-939d55b6><span class="cm-powered-prefix" data-v-939d55b6>Powered by </span><strong class="cm-brand" data-v-939d55b6>ChatterMate</strong></a>', 2)
        ]), 4)
      ], 6)) : re("", !0),
      gs.value ? (k(), A("div", t0, [
        g("div", n0, [
          m[52] || (m[52] = g("h3", null, "Rate your conversation", -1)),
          g("div", s0, [
            (k(), A(Oe, null, ft(5, (h) => g("button", {
              key: h,
              onClick: (J) => Ws.value = h,
              class: Pe([{ active: h <= Ws.value }, "star-button"])
            }, " ★ ", 10, r0)), 64))
          ]),
          Qn(g("textarea", {
            "onUpdate:modelValue": m[14] || (m[14] = (h) => qs.value = h),
            placeholder: "Additional feedback (optional)",
            class: "rating-feedback"
          }, null, 512), [
            [As, qs.value]
          ]),
          g("div", i0, [
            g("button", {
              onClick: m[15] || (m[15] = (h) => d.submitRating(Ws.value, qs.value)),
              disabled: !Ws.value,
              class: "submit-button",
              style: Ee(x(wn))
            }, " Submit ", 12, o0),
            g("button", {
              onClick: m[16] || (m[16] = (h) => gs.value = !1),
              class: "skip-rating"
            }, " Skip ")
          ])
        ])
      ])) : re("", !0),
      x(co) ? (k(), A("div", {
        key: 9,
        class: "preview-modal-overlay",
        onClick: m[19] || (m[19] = //@ts-ignore
        (...h) => x(Gt) && x(Gt)(...h))
      }, [
        g("div", {
          class: "preview-modal-content",
          onClick: m[18] || (m[18] = Es(() => {
          }, ["stop"]))
        }, [
          g("button", {
            class: "preview-modal-close",
            onClick: m[17] || (m[17] = //@ts-ignore
            (...h) => x(Gt) && x(Gt)(...h))
          }, "×"),
          x(hs) && x(ps)(x(hs).type) ? (k(), A("div", a0, [
            g("img", {
              src: x(hr)(x(hs)),
              alt: x(hs).filename,
              class: "preview-modal-image"
            }, null, 8, l0),
            g("div", c0, Z(x(hs).filename), 1)
          ])) : re("", !0)
        ])
      ])) : re("", !0)
    ], 6)) : (k(), A("div", u0));
  }
}), h0 = /* @__PURE__ */ Ds(d0, [["__scopeId", "data-v-939d55b6"]]);
window.process || (window.process = { env: { NODE_ENV: "production" } });
async function p0() {
  if (!await y_()) return;
  const e = window.__INITIAL_DATA__, t = new URL(window.location.href), n = t.searchParams.get("preview") === "true", s = (a) => {
    const l = t.searchParams.get(a);
    if (!(!l || l === "undefined" || l.trim() === ""))
      return l;
  }, r = n ? s("widget_id") || (e == null ? void 0 : e.widgetId) || void 0 : (e == null ? void 0 : e.widgetId) || void 0, i = n ? (e == null ? void 0 : e.initialToken) || s("token") || void 0 : (e == null ? void 0 : e.initialToken) || void 0;
  cp(h0, {
    widgetId: r,
    token: i || void 0,
    initialAuthError: null
    // Let backend determine if auth is required
  }).mount("#app"), v_();
}
p0();
