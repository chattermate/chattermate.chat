var Uc = Object.defineProperty;
var zc = (e, t, n) => t in e ? Uc(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var Ye = (e, t, n) => zc(e, typeof t != "symbol" ? t + "" : t, n);
/**
* @vue/shared v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function Hi(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const n of e.split(",")) t[n] = 1;
  return (n) => n in t;
}
const Ze = {}, es = [], sn = () => {
}, Hc = () => !1, Ir = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), Wi = (e) => e.startsWith("onUpdate:"), kt = Object.assign, qi = (e, t) => {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}, Wc = Object.prototype.hasOwnProperty, Ue = (e, t) => Wc.call(e, t), he = Array.isArray, ts = (e) => Lr(e) === "[object Map]", za = (e) => Lr(e) === "[object Set]", _e = (e) => typeof e == "function", pt = (e) => typeof e == "string", Nn = (e) => typeof e == "symbol", ot = (e) => e !== null && typeof e == "object", Ha = (e) => (ot(e) || _e(e)) && _e(e.then) && _e(e.catch), Wa = Object.prototype.toString, Lr = (e) => Wa.call(e), qc = (e) => Lr(e).slice(8, -1), qa = (e) => Lr(e) === "[object Object]", ji = (e) => pt(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, Is = /* @__PURE__ */ Hi(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), Or = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (n) => t[n] || (t[n] = e(n));
}, jc = /-(\w)/g, Ln = Or(
  (e) => e.replace(jc, (t, n) => n ? n.toUpperCase() : "")
), Vc = /\B([A-Z])/g, Mn = Or(
  (e) => e.replace(Vc, "-$1").toLowerCase()
), ja = Or((e) => e.charAt(0).toUpperCase() + e.slice(1)), Zr = Or(
  (e) => e ? `on${ja(e)}` : ""
), Cn = (e, t) => !Object.is(e, t), lr = (e, ...t) => {
  for (let n = 0; n < e.length; n++)
    e[n](...t);
}, bi = (e, t, n, s = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: s,
    value: n
  });
}, vi = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let qo;
const Pr = () => qo || (qo = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function ke(e) {
  if (he(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
      const s = e[n], r = pt(s) ? Xc(s) : ke(s);
      if (r)
        for (const i in r)
          t[i] = r[i];
    }
    return t;
  } else if (pt(e) || ot(e))
    return e;
}
const Kc = /;(?![^(]*\))/g, Gc = /:([^]+)/, Yc = /\/\*[^]*?\*\//g;
function Xc(e) {
  const t = {};
  return e.replace(Yc, "").split(Kc).forEach((n) => {
    if (n) {
      const s = n.split(Gc);
      s.length > 1 && (t[s[0].trim()] = s[1].trim());
    }
  }), t;
}
function Xe(e) {
  let t = "";
  if (pt(e))
    t = e;
  else if (he(e))
    for (let n = 0; n < e.length; n++) {
      const s = Xe(e[n]);
      s && (t += s + " ");
    }
  else if (ot(e))
    for (const n in e)
      e[n] && (t += n + " ");
  return t.trim();
}
const Zc = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", Jc = /* @__PURE__ */ Hi(Zc);
function Va(e) {
  return !!e || e === "";
}
const Ka = (e) => !!(e && e.__v_isRef === !0), se = (e) => pt(e) ? e : e == null ? "" : he(e) || ot(e) && (e.toString === Wa || !_e(e.toString)) ? Ka(e) ? se(e.value) : JSON.stringify(e, Ga, 2) : String(e), Ga = (e, t) => Ka(t) ? Ga(e, t.value) : ts(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (n, [s, r], i) => (n[Jr(s, i) + " =>"] = r, n),
    {}
  )
} : za(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((n) => Jr(n))
} : Nn(t) ? Jr(t) : ot(t) && !he(t) && !qa(t) ? String(t) : t, Jr = (e, t = "") => {
  var n;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    Nn(e) ? `Symbol(${(n = e.description) != null ? n : t})` : e
  );
};
/**
* @vue/reactivity v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let Nt;
class Qc {
  constructor(t = !1) {
    this.detached = t, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this.parent = Nt, !t && Nt && (this.index = (Nt.scopes || (Nt.scopes = [])).push(
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
      const n = Nt;
      try {
        return Nt = this, t();
      } finally {
        Nt = n;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = Nt, Nt = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    this._on > 0 && --this._on === 0 && (Nt = this.prevScope, this.prevScope = void 0);
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
function eu() {
  return Nt;
}
let tt;
const Qr = /* @__PURE__ */ new WeakSet();
class Ya {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, Nt && Nt.active && Nt.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, Qr.has(this) && (Qr.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Za(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, jo(this), Ja(this);
    const t = tt, n = Yt;
    tt = this, Yt = !0;
    try {
      return this.fn();
    } finally {
      Qa(this), tt = t, Yt = n, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        Gi(t);
      this.deps = this.depsTail = void 0, jo(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? Qr.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    yi(this) && this.run();
  }
  get dirty() {
    return yi(this);
  }
}
let Xa = 0, Ls, Os;
function Za(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = Os, Os = e;
    return;
  }
  e.next = Ls, Ls = e;
}
function Vi() {
  Xa++;
}
function Ki() {
  if (--Xa > 0)
    return;
  if (Os) {
    let t = Os;
    for (Os = void 0; t; ) {
      const n = t.next;
      t.next = void 0, t.flags &= -9, t = n;
    }
  }
  let e;
  for (; Ls; ) {
    let t = Ls;
    for (Ls = void 0; t; ) {
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
function Ja(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Qa(e) {
  let t, n = e.depsTail, s = n;
  for (; s; ) {
    const r = s.prevDep;
    s.version === -1 ? (s === n && (n = r), Gi(s), tu(s)) : t = s, s.dep.activeLink = s.prevActiveLink, s.prevActiveLink = void 0, s = r;
  }
  e.deps = t, e.depsTail = n;
}
function yi(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (el(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function el(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === Bs) || (e.globalVersion = Bs, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !yi(e))))
    return;
  e.flags |= 2;
  const t = e.dep, n = tt, s = Yt;
  tt = e, Yt = !0;
  try {
    Ja(e);
    const r = e.fn(e._value);
    (t.version === 0 || Cn(r, e._value)) && (e.flags |= 128, e._value = r, t.version++);
  } catch (r) {
    throw t.version++, r;
  } finally {
    tt = n, Yt = s, Qa(e), e.flags &= -3;
  }
}
function Gi(e, t = !1) {
  const { dep: n, prevSub: s, nextSub: r } = e;
  if (s && (s.nextSub = r, e.prevSub = void 0), r && (r.prevSub = s, e.nextSub = void 0), n.subs === e && (n.subs = s, !s && n.computed)) {
    n.computed.flags &= -5;
    for (let i = n.computed.deps; i; i = i.nextDep)
      Gi(i, !0);
  }
  !t && !--n.sc && n.map && n.map.delete(n.key);
}
function tu(e) {
  const { prevDep: t, nextDep: n } = e;
  t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
let Yt = !0;
const tl = [];
function vn() {
  tl.push(Yt), Yt = !1;
}
function yn() {
  const e = tl.pop();
  Yt = e === void 0 ? !0 : e;
}
function jo(e) {
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
let Bs = 0;
class nu {
  constructor(t, n) {
    this.sub = t, this.dep = n, this.version = n.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Yi {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(t) {
    if (!tt || !Yt || tt === this.computed)
      return;
    let n = this.activeLink;
    if (n === void 0 || n.sub !== tt)
      n = this.activeLink = new nu(tt, this), tt.deps ? (n.prevDep = tt.depsTail, tt.depsTail.nextDep = n, tt.depsTail = n) : tt.deps = tt.depsTail = n, nl(n);
    else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
      const s = n.nextDep;
      s.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = s), n.prevDep = tt.depsTail, n.nextDep = void 0, tt.depsTail.nextDep = n, tt.depsTail = n, tt.deps === n && (tt.deps = s);
    }
    return n;
  }
  trigger(t) {
    this.version++, Bs++, this.notify(t);
  }
  notify(t) {
    Vi();
    try {
      for (let n = this.subs; n; n = n.prevSub)
        n.sub.notify() && n.sub.dep.notify();
    } finally {
      Ki();
    }
  }
}
function nl(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let s = t.deps; s; s = s.nextDep)
        nl(s);
    }
    const n = e.dep.subs;
    n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
  }
}
const wi = /* @__PURE__ */ new WeakMap(), Wn = Symbol(
  ""
), ki = Symbol(
  ""
), $s = Symbol(
  ""
);
function yt(e, t, n) {
  if (Yt && tt) {
    let s = wi.get(e);
    s || wi.set(e, s = /* @__PURE__ */ new Map());
    let r = s.get(n);
    r || (s.set(n, r = new Yi()), r.map = s, r.key = n), r.track();
  }
}
function pn(e, t, n, s, r, i) {
  const o = wi.get(e);
  if (!o) {
    Bs++;
    return;
  }
  const a = (l) => {
    l && l.trigger();
  };
  if (Vi(), t === "clear")
    o.forEach(a);
  else {
    const l = he(e), h = l && ji(n);
    if (l && n === "length") {
      const c = Number(s);
      o.forEach((y, _) => {
        (_ === "length" || _ === $s || !Nn(_) && _ >= c) && a(y);
      });
    } else
      switch ((n !== void 0 || o.has(void 0)) && a(o.get(n)), h && a(o.get($s)), t) {
        case "add":
          l ? h && a(o.get("length")) : (a(o.get(Wn)), ts(e) && a(o.get(ki)));
          break;
        case "delete":
          l || (a(o.get(Wn)), ts(e) && a(o.get(ki)));
          break;
        case "set":
          ts(e) && a(o.get(Wn));
          break;
      }
  }
  Ki();
}
function Xn(e) {
  const t = $e(e);
  return t === e ? t : (yt(t, "iterate", $s), zt(e) ? t : t.map(bt));
}
function Nr(e) {
  return yt(e = $e(e), "iterate", $s), e;
}
const su = {
  __proto__: null,
  [Symbol.iterator]() {
    return ei(this, Symbol.iterator, bt);
  },
  concat(...e) {
    return Xn(this).concat(
      ...e.map((t) => he(t) ? Xn(t) : t)
    );
  },
  entries() {
    return ei(this, "entries", (e) => (e[1] = bt(e[1]), e));
  },
  every(e, t) {
    return fn(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return fn(this, "filter", e, t, (n) => n.map(bt), arguments);
  },
  find(e, t) {
    return fn(this, "find", e, t, bt, arguments);
  },
  findIndex(e, t) {
    return fn(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return fn(this, "findLast", e, t, bt, arguments);
  },
  findLastIndex(e, t) {
    return fn(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return fn(this, "forEach", e, t, void 0, arguments);
  },
  includes(...e) {
    return ti(this, "includes", e);
  },
  indexOf(...e) {
    return ti(this, "indexOf", e);
  },
  join(e) {
    return Xn(this).join(e);
  },
  // keys() iterator only reads `length`, no optimisation required
  lastIndexOf(...e) {
    return ti(this, "lastIndexOf", e);
  },
  map(e, t) {
    return fn(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return ps(this, "pop");
  },
  push(...e) {
    return ps(this, "push", e);
  },
  reduce(e, ...t) {
    return Vo(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return Vo(this, "reduceRight", e, t);
  },
  shift() {
    return ps(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return fn(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return ps(this, "splice", e);
  },
  toReversed() {
    return Xn(this).toReversed();
  },
  toSorted(e) {
    return Xn(this).toSorted(e);
  },
  toSpliced(...e) {
    return Xn(this).toSpliced(...e);
  },
  unshift(...e) {
    return ps(this, "unshift", e);
  },
  values() {
    return ei(this, "values", bt);
  }
};
function ei(e, t, n) {
  const s = Nr(e), r = s[t]();
  return s !== e && !zt(e) && (r._next = r.next, r.next = () => {
    const i = r._next();
    return i.value && (i.value = n(i.value)), i;
  }), r;
}
const ru = Array.prototype;
function fn(e, t, n, s, r, i) {
  const o = Nr(e), a = o !== e && !zt(e), l = o[t];
  if (l !== ru[t]) {
    const y = l.apply(e, i);
    return a ? bt(y) : y;
  }
  let h = n;
  o !== e && (a ? h = function(y, _) {
    return n.call(this, bt(y), _, e);
  } : n.length > 2 && (h = function(y, _) {
    return n.call(this, y, _, e);
  }));
  const c = l.call(o, h, s);
  return a && r ? r(c) : c;
}
function Vo(e, t, n, s) {
  const r = Nr(e);
  let i = n;
  return r !== e && (zt(e) ? n.length > 3 && (i = function(o, a, l) {
    return n.call(this, o, a, l, e);
  }) : i = function(o, a, l) {
    return n.call(this, o, bt(a), l, e);
  }), r[t](i, ...s);
}
function ti(e, t, n) {
  const s = $e(e);
  yt(s, "iterate", $s);
  const r = s[t](...n);
  return (r === -1 || r === !1) && Ji(n[0]) ? (n[0] = $e(n[0]), s[t](...n)) : r;
}
function ps(e, t, n = []) {
  vn(), Vi();
  const s = $e(e)[t].apply(e, n);
  return Ki(), yn(), s;
}
const iu = /* @__PURE__ */ Hi("__proto__,__v_isRef,__isVue"), sl = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(Nn)
);
function ou(e) {
  Nn(e) || (e = String(e));
  const t = $e(this);
  return yt(t, "has", e), t.hasOwnProperty(e);
}
class rl {
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
      return s === (r ? i ? mu : ll : i ? al : ol).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(s) ? t : void 0;
    const o = he(t);
    if (!r) {
      let l;
      if (o && (l = su[n]))
        return l;
      if (n === "hasOwnProperty")
        return ou;
    }
    const a = Reflect.get(
      t,
      n,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      wt(t) ? t : s
    );
    return (Nn(n) ? sl.has(n) : iu(n)) || (r || yt(t, "get", n), i) ? a : wt(a) ? o && ji(n) ? a : a.value : ot(a) ? r ? cl(a) : Mr(a) : a;
  }
}
class il extends rl {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, n, s, r) {
    let i = t[n];
    if (!this._isShallow) {
      const l = On(i);
      if (!zt(s) && !On(s) && (i = $e(i), s = $e(s)), !he(t) && wt(i) && !wt(s))
        return l ? !1 : (i.value = s, !0);
    }
    const o = he(t) && ji(n) ? Number(n) < t.length : Ue(t, n), a = Reflect.set(
      t,
      n,
      s,
      wt(t) ? t : r
    );
    return t === $e(r) && (o ? Cn(s, i) && pn(t, "set", n, s) : pn(t, "add", n, s)), a;
  }
  deleteProperty(t, n) {
    const s = Ue(t, n);
    t[n];
    const r = Reflect.deleteProperty(t, n);
    return r && s && pn(t, "delete", n, void 0), r;
  }
  has(t, n) {
    const s = Reflect.has(t, n);
    return (!Nn(n) || !sl.has(n)) && yt(t, "has", n), s;
  }
  ownKeys(t) {
    return yt(
      t,
      "iterate",
      he(t) ? "length" : Wn
    ), Reflect.ownKeys(t);
  }
}
class au extends rl {
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
const lu = /* @__PURE__ */ new il(), cu = /* @__PURE__ */ new au(), uu = /* @__PURE__ */ new il(!0);
const xi = (e) => e, er = (e) => Reflect.getPrototypeOf(e);
function fu(e, t, n) {
  return function(...s) {
    const r = this.__v_raw, i = $e(r), o = ts(i), a = e === "entries" || e === Symbol.iterator && o, l = e === "keys" && o, h = r[e](...s), c = n ? xi : t ? yr : bt;
    return !t && yt(
      i,
      "iterate",
      l ? ki : Wn
    ), {
      // iterator protocol
      next() {
        const { value: y, done: _ } = h.next();
        return _ ? { value: y, done: _ } : {
          value: a ? [c(y[0]), c(y[1])] : c(y),
          done: _
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function tr(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function hu(e, t) {
  const n = {
    get(r) {
      const i = this.__v_raw, o = $e(i), a = $e(r);
      e || (Cn(r, a) && yt(o, "get", r), yt(o, "get", a));
      const { has: l } = er(o), h = t ? xi : e ? yr : bt;
      if (l.call(o, r))
        return h(i.get(r));
      if (l.call(o, a))
        return h(i.get(a));
      i !== o && i.get(r);
    },
    get size() {
      const r = this.__v_raw;
      return !e && yt($e(r), "iterate", Wn), Reflect.get(r, "size", r);
    },
    has(r) {
      const i = this.__v_raw, o = $e(i), a = $e(r);
      return e || (Cn(r, a) && yt(o, "has", r), yt(o, "has", a)), r === a ? i.has(r) : i.has(r) || i.has(a);
    },
    forEach(r, i) {
      const o = this, a = o.__v_raw, l = $e(a), h = t ? xi : e ? yr : bt;
      return !e && yt(l, "iterate", Wn), a.forEach((c, y) => r.call(i, h(c), h(y), o));
    }
  };
  return kt(
    n,
    e ? {
      add: tr("add"),
      set: tr("set"),
      delete: tr("delete"),
      clear: tr("clear")
    } : {
      add(r) {
        !t && !zt(r) && !On(r) && (r = $e(r));
        const i = $e(this);
        return er(i).has.call(i, r) || (i.add(r), pn(i, "add", r, r)), this;
      },
      set(r, i) {
        !t && !zt(i) && !On(i) && (i = $e(i));
        const o = $e(this), { has: a, get: l } = er(o);
        let h = a.call(o, r);
        h || (r = $e(r), h = a.call(o, r));
        const c = l.call(o, r);
        return o.set(r, i), h ? Cn(i, c) && pn(o, "set", r, i) : pn(o, "add", r, i), this;
      },
      delete(r) {
        const i = $e(this), { has: o, get: a } = er(i);
        let l = o.call(i, r);
        l || (r = $e(r), l = o.call(i, r)), a && a.call(i, r);
        const h = i.delete(r);
        return l && pn(i, "delete", r, void 0), h;
      },
      clear() {
        const r = $e(this), i = r.size !== 0, o = r.clear();
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
    n[r] = fu(r, e, t);
  }), n;
}
function Xi(e, t) {
  const n = hu(e, t);
  return (s, r, i) => r === "__v_isReactive" ? !e : r === "__v_isReadonly" ? e : r === "__v_raw" ? s : Reflect.get(
    Ue(n, r) && r in s ? n : s,
    r,
    i
  );
}
const du = {
  get: /* @__PURE__ */ Xi(!1, !1)
}, pu = {
  get: /* @__PURE__ */ Xi(!1, !0)
}, gu = {
  get: /* @__PURE__ */ Xi(!0, !1)
};
const ol = /* @__PURE__ */ new WeakMap(), al = /* @__PURE__ */ new WeakMap(), ll = /* @__PURE__ */ new WeakMap(), mu = /* @__PURE__ */ new WeakMap();
function _u(e) {
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
function bu(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : _u(qc(e));
}
function Mr(e) {
  return On(e) ? e : Zi(
    e,
    !1,
    lu,
    du,
    ol
  );
}
function vu(e) {
  return Zi(
    e,
    !1,
    uu,
    pu,
    al
  );
}
function cl(e) {
  return Zi(
    e,
    !0,
    cu,
    gu,
    ll
  );
}
function Zi(e, t, n, s, r) {
  if (!ot(e) || e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const i = bu(e);
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
function ns(e) {
  return On(e) ? ns(e.__v_raw) : !!(e && e.__v_isReactive);
}
function On(e) {
  return !!(e && e.__v_isReadonly);
}
function zt(e) {
  return !!(e && e.__v_isShallow);
}
function Ji(e) {
  return e ? !!e.__v_raw : !1;
}
function $e(e) {
  const t = e && e.__v_raw;
  return t ? $e(t) : e;
}
function yu(e) {
  return !Ue(e, "__v_skip") && Object.isExtensible(e) && bi(e, "__v_skip", !0), e;
}
const bt = (e) => ot(e) ? Mr(e) : e, yr = (e) => ot(e) ? cl(e) : e;
function wt(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function ce(e) {
  return wu(e, !1);
}
function wu(e, t) {
  return wt(e) ? e : new ku(e, t);
}
class ku {
  constructor(t, n) {
    this.dep = new Yi(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? t : $e(t), this._value = n ? t : bt(t), this.__v_isShallow = n;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const n = this._rawValue, s = this.__v_isShallow || zt(t) || On(t);
    t = s ? t : $e(t), Cn(t, n) && (this._rawValue = t, this._value = s ? t : bt(t), this.dep.trigger());
  }
}
function E(e) {
  return wt(e) ? e.value : e;
}
const xu = {
  get: (e, t, n) => t === "__v_raw" ? e : E(Reflect.get(e, t, n)),
  set: (e, t, n, s) => {
    const r = e[t];
    return wt(r) && !wt(n) ? (r.value = n, !0) : Reflect.set(e, t, n, s);
  }
};
function ul(e) {
  return ns(e) ? e : new Proxy(e, xu);
}
class Au {
  constructor(t, n, s) {
    this.fn = t, this.setter = n, this._value = void 0, this.dep = new Yi(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Bs - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = s;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    tt !== this)
      return Za(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return el(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
function Tu(e, t, n = !1) {
  let s, r;
  return _e(e) ? s = e : (s = e.get, r = e.set), new Au(s, r, n);
}
const nr = {}, wr = /* @__PURE__ */ new WeakMap();
let Hn;
function Su(e, t = !1, n = Hn) {
  if (n) {
    let s = wr.get(n);
    s || wr.set(n, s = []), s.push(e);
  }
}
function Eu(e, t, n = Ze) {
  const { immediate: s, deep: r, once: i, scheduler: o, augmentJob: a, call: l } = n, h = (z) => r ? z : zt(z) || r === !1 || r === 0 ? gn(z, 1) : gn(z);
  let c, y, _, M, $ = !1, Y = !1;
  if (wt(e) ? (y = () => e.value, $ = zt(e)) : ns(e) ? (y = () => h(e), $ = !0) : he(e) ? (Y = !0, $ = e.some((z) => ns(z) || zt(z)), y = () => e.map((z) => {
    if (wt(z))
      return z.value;
    if (ns(z))
      return h(z);
    if (_e(z))
      return l ? l(z, 2) : z();
  })) : _e(e) ? t ? y = l ? () => l(e, 2) : e : y = () => {
    if (_) {
      vn();
      try {
        _();
      } finally {
        yn();
      }
    }
    const z = Hn;
    Hn = c;
    try {
      return l ? l(e, 3, [M]) : e(M);
    } finally {
      Hn = z;
    }
  } : y = sn, t && r) {
    const z = y, W = r === !0 ? 1 / 0 : r;
    y = () => gn(z(), W);
  }
  const Re = eu(), ne = () => {
    c.stop(), Re && Re.active && qi(Re.effects, c);
  };
  if (i && t) {
    const z = t;
    t = (...W) => {
      z(...W), ne();
    };
  }
  let Ce = Y ? new Array(e.length).fill(nr) : nr;
  const xe = (z) => {
    if (!(!(c.flags & 1) || !c.dirty && !z))
      if (t) {
        const W = c.run();
        if (r || $ || (Y ? W.some((ee, V) => Cn(ee, Ce[V])) : Cn(W, Ce))) {
          _ && _();
          const ee = Hn;
          Hn = c;
          try {
            const V = [
              W,
              // pass undefined as the old value when it's changed for the first time
              Ce === nr ? void 0 : Y && Ce[0] === nr ? [] : Ce,
              M
            ];
            Ce = W, l ? l(t, 3, V) : (
              // @ts-expect-error
              t(...V)
            );
          } finally {
            Hn = ee;
          }
        }
      } else
        c.run();
  };
  return a && a(xe), c = new Ya(y), c.scheduler = o ? () => o(xe, !1) : xe, M = (z) => Su(z, !1, c), _ = c.onStop = () => {
    const z = wr.get(c);
    if (z) {
      if (l)
        l(z, 4);
      else
        for (const W of z) W();
      wr.delete(c);
    }
  }, t ? s ? xe(!0) : Ce = c.run() : o ? o(xe.bind(null, !0), !0) : c.run(), ne.pause = c.pause.bind(c), ne.resume = c.resume.bind(c), ne.stop = ne, ne;
}
function gn(e, t = 1 / 0, n) {
  if (t <= 0 || !ot(e) || e.__v_skip || (n = n || /* @__PURE__ */ new Set(), n.has(e)))
    return e;
  if (n.add(e), t--, wt(e))
    gn(e.value, t, n);
  else if (he(e))
    for (let s = 0; s < e.length; s++)
      gn(e[s], t, n);
  else if (za(e) || ts(e))
    e.forEach((s) => {
      gn(s, t, n);
    });
  else if (qa(e)) {
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
function Ws(e, t, n, s) {
  try {
    return s ? e(...s) : e();
  } catch (r) {
    Fr(r, t, n);
  }
}
function an(e, t, n, s) {
  if (_e(e)) {
    const r = Ws(e, t, n, s);
    return r && Ha(r) && r.catch((i) => {
      Fr(i, t, n);
    }), r;
  }
  if (he(e)) {
    const r = [];
    for (let i = 0; i < e.length; i++)
      r.push(an(e[i], t, n, s));
    return r;
  }
}
function Fr(e, t, n, s = !0) {
  const r = t ? t.vnode : null, { errorHandler: i, throwUnhandledErrorInProduction: o } = t && t.appContext.config || Ze;
  if (t) {
    let a = t.parent;
    const l = t.proxy, h = `https://vuejs.org/error-reference/#runtime-${n}`;
    for (; a; ) {
      const c = a.ec;
      if (c) {
        for (let y = 0; y < c.length; y++)
          if (c[y](e, l, h) === !1)
            return;
      }
      a = a.parent;
    }
    if (i) {
      vn(), Ws(i, null, 10, [
        e,
        l,
        h
      ]), yn();
      return;
    }
  }
  Cu(e, n, r, s, o);
}
function Cu(e, t, n, s = !0, r = !1) {
  if (r)
    throw e;
  console.error(e);
}
const Tt = [];
let tn = -1;
const ss = [];
let Sn = null, Jn = 0;
const fl = /* @__PURE__ */ Promise.resolve();
let kr = null;
function Ai(e) {
  const t = kr || fl;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function Ru(e) {
  let t = tn + 1, n = Tt.length;
  for (; t < n; ) {
    const s = t + n >>> 1, r = Tt[s], i = Us(r);
    i < e || i === e && r.flags & 2 ? t = s + 1 : n = s;
  }
  return t;
}
function Qi(e) {
  if (!(e.flags & 1)) {
    const t = Us(e), n = Tt[Tt.length - 1];
    !n || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= Us(n) ? Tt.push(e) : Tt.splice(Ru(t), 0, e), e.flags |= 1, hl();
  }
}
function hl() {
  kr || (kr = fl.then(pl));
}
function Iu(e) {
  he(e) ? ss.push(...e) : Sn && e.id === -1 ? Sn.splice(Jn + 1, 0, e) : e.flags & 1 || (ss.push(e), e.flags |= 1), hl();
}
function Ko(e, t, n = tn + 1) {
  for (; n < Tt.length; n++) {
    const s = Tt[n];
    if (s && s.flags & 2) {
      if (e && s.id !== e.uid)
        continue;
      Tt.splice(n, 1), n--, s.flags & 4 && (s.flags &= -2), s(), s.flags & 4 || (s.flags &= -2);
    }
  }
}
function dl(e) {
  if (ss.length) {
    const t = [...new Set(ss)].sort(
      (n, s) => Us(n) - Us(s)
    );
    if (ss.length = 0, Sn) {
      Sn.push(...t);
      return;
    }
    for (Sn = t, Jn = 0; Jn < Sn.length; Jn++) {
      const n = Sn[Jn];
      n.flags & 4 && (n.flags &= -2), n.flags & 8 || n(), n.flags &= -2;
    }
    Sn = null, Jn = 0;
  }
}
const Us = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function pl(e) {
  try {
    for (tn = 0; tn < Tt.length; tn++) {
      const t = Tt[tn];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), Ws(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; tn < Tt.length; tn++) {
      const t = Tt[tn];
      t && (t.flags &= -2);
    }
    tn = -1, Tt.length = 0, dl(), kr = null, (Tt.length || ss.length) && pl();
  }
}
let Ut = null, gl = null;
function xr(e) {
  const t = Ut;
  return Ut = e, gl = e && e.type.__scopeId || null, t;
}
function Lu(e, t = Ut, n) {
  if (!t || e._n)
    return e;
  const s = (...r) => {
    s._d && na(-1);
    const i = xr(t);
    let o;
    try {
      o = e(...r);
    } finally {
      xr(i), s._d && na(1);
    }
    return o;
  };
  return s._n = !0, s._c = !0, s._d = !0, s;
}
function An(e, t) {
  if (Ut === null)
    return e;
  const n = Ur(Ut), s = e.dirs || (e.dirs = []);
  for (let r = 0; r < t.length; r++) {
    let [i, o, a, l = Ze] = t[r];
    i && (_e(i) && (i = {
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
function Bn(e, t, n, s) {
  const r = e.dirs, i = t && t.dirs;
  for (let o = 0; o < r.length; o++) {
    const a = r[o];
    i && (a.oldValue = i[o].value);
    let l = a.dir[s];
    l && (vn(), an(l, n, 8, [
      e.el,
      a,
      e,
      t
    ]), yn());
  }
}
const Ou = Symbol("_vte"), Pu = (e) => e.__isTeleport;
function eo(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, eo(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function Nu(e, t) {
  return _e(e) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    kt({ name: e.name }, t, { setup: e })
  ) : e;
}
function ml(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
function Ps(e, t, n, s, r = !1) {
  if (he(e)) {
    e.forEach(
      ($, Y) => Ps(
        $,
        t && (he(t) ? t[Y] : t),
        n,
        s,
        r
      )
    );
    return;
  }
  if (Ns(s) && !r) {
    s.shapeFlag & 512 && s.type.__asyncResolved && s.component.subTree.component && Ps(e, t, n, s.component.subTree);
    return;
  }
  const i = s.shapeFlag & 4 ? Ur(s.component) : s.el, o = r ? null : i, { i: a, r: l } = e, h = t && t.r, c = a.refs === Ze ? a.refs = {} : a.refs, y = a.setupState, _ = $e(y), M = y === Ze ? () => !1 : ($) => Ue(_, $);
  if (h != null && h !== l && (pt(h) ? (c[h] = null, M(h) && (y[h] = null)) : wt(h) && (h.value = null)), _e(l))
    Ws(l, a, 12, [o, c]);
  else {
    const $ = pt(l), Y = wt(l);
    if ($ || Y) {
      const Re = () => {
        if (e.f) {
          const ne = $ ? M(l) ? y[l] : c[l] : l.value;
          r ? he(ne) && qi(ne, i) : he(ne) ? ne.includes(i) || ne.push(i) : $ ? (c[l] = [i], M(l) && (y[l] = c[l])) : (l.value = [i], e.k && (c[e.k] = l.value));
        } else $ ? (c[l] = o, M(l) && (y[l] = o)) : Y && (l.value = o, e.k && (c[e.k] = o));
      };
      o ? (Re.id = -1, Mt(Re, n)) : Re();
    }
  }
}
Pr().requestIdleCallback;
Pr().cancelIdleCallback;
const Ns = (e) => !!e.type.__asyncLoader, _l = (e) => e.type.__isKeepAlive;
function Mu(e, t) {
  bl(e, "a", t);
}
function Fu(e, t) {
  bl(e, "da", t);
}
function bl(e, t, n = St) {
  const s = e.__wdc || (e.__wdc = () => {
    let r = n;
    for (; r; ) {
      if (r.isDeactivated)
        return;
      r = r.parent;
    }
    return e();
  });
  if (Dr(t, s, n), n) {
    let r = n.parent;
    for (; r && r.parent; )
      _l(r.parent.vnode) && Du(s, t, n, r), r = r.parent;
  }
}
function Du(e, t, n, s) {
  const r = Dr(
    t,
    e,
    s,
    !0
    /* prepend */
  );
  qs(() => {
    qi(s[t], r);
  }, n);
}
function Dr(e, t, n = St, s = !1) {
  if (n) {
    const r = n[e] || (n[e] = []), i = t.__weh || (t.__weh = (...o) => {
      vn();
      const a = js(n), l = an(t, n, e, o);
      return a(), yn(), l;
    });
    return s ? r.unshift(i) : r.push(i), i;
  }
}
const wn = (e) => (t, n = St) => {
  (!Hs || e === "sp") && Dr(e, (...s) => t(...s), n);
}, Bu = wn("bm"), to = wn("m"), $u = wn(
  "bu"
), Uu = wn("u"), zu = wn(
  "bum"
), qs = wn("um"), Hu = wn(
  "sp"
), Wu = wn("rtg"), qu = wn("rtc");
function ju(e, t = St) {
  Dr("ec", e, t);
}
const Vu = Symbol.for("v-ndc");
function Pt(e, t, n, s) {
  let r;
  const i = n, o = he(e);
  if (o || pt(e)) {
    const a = o && ns(e);
    let l = !1, h = !1;
    a && (l = !zt(e), h = On(e), e = Nr(e)), r = new Array(e.length);
    for (let c = 0, y = e.length; c < y; c++)
      r[c] = t(
        l ? h ? yr(bt(e[c])) : bt(e[c]) : e[c],
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
      for (let l = 0, h = a.length; l < h; l++) {
        const c = a[l];
        r[l] = t(e[c], c, l, i);
      }
    }
  else
    r = [];
  return r;
}
const Ti = (e) => e ? $l(e) ? Ur(e) : Ti(e.parent) : null, Ms = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ kt(/* @__PURE__ */ Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => e.props,
    $attrs: (e) => e.attrs,
    $slots: (e) => e.slots,
    $refs: (e) => e.refs,
    $parent: (e) => Ti(e.parent),
    $root: (e) => Ti(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => yl(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      Qi(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = Ai.bind(e.proxy)),
    $watch: (e) => gf.bind(e)
  })
), ni = (e, t) => e !== Ze && !e.__isScriptSetup && Ue(e, t), Ku = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: n, setupState: s, data: r, props: i, accessCache: o, type: a, appContext: l } = e;
    let h;
    if (t[0] !== "$") {
      const M = o[t];
      if (M !== void 0)
        switch (M) {
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
        if (ni(s, t))
          return o[t] = 1, s[t];
        if (r !== Ze && Ue(r, t))
          return o[t] = 2, r[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (h = e.propsOptions[0]) && Ue(h, t)
        )
          return o[t] = 3, i[t];
        if (n !== Ze && Ue(n, t))
          return o[t] = 4, n[t];
        Si && (o[t] = 0);
      }
    }
    const c = Ms[t];
    let y, _;
    if (c)
      return t === "$attrs" && yt(e.attrs, "get", ""), c(e);
    if (
      // css module (injected by vue-loader)
      (y = a.__cssModules) && (y = y[t])
    )
      return y;
    if (n !== Ze && Ue(n, t))
      return o[t] = 4, n[t];
    if (
      // global properties
      _ = l.config.globalProperties, Ue(_, t)
    )
      return _[t];
  },
  set({ _: e }, t, n) {
    const { data: s, setupState: r, ctx: i } = e;
    return ni(r, t) ? (r[t] = n, !0) : s !== Ze && Ue(s, t) ? (s[t] = n, !0) : Ue(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (i[t] = n, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: n, ctx: s, appContext: r, propsOptions: i }
  }, o) {
    let a;
    return !!n[o] || e !== Ze && Ue(e, o) || ni(t, o) || (a = i[0]) && Ue(a, o) || Ue(s, o) || Ue(Ms, o) || Ue(r.config.globalProperties, o);
  },
  defineProperty(e, t, n) {
    return n.get != null ? e._.accessCache[t] = 0 : Ue(n, "value") && this.set(e, t, n.value, null), Reflect.defineProperty(e, t, n);
  }
};
function Go(e) {
  return he(e) ? e.reduce(
    (t, n) => (t[n] = null, t),
    {}
  ) : e;
}
let Si = !0;
function Gu(e) {
  const t = yl(e), n = e.proxy, s = e.ctx;
  Si = !1, t.beforeCreate && Yo(t.beforeCreate, e, "bc");
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
    beforeMount: y,
    mounted: _,
    beforeUpdate: M,
    updated: $,
    activated: Y,
    deactivated: Re,
    beforeDestroy: ne,
    beforeUnmount: Ce,
    destroyed: xe,
    unmounted: z,
    render: W,
    renderTracked: ee,
    renderTriggered: V,
    errorCaptured: Pe,
    serverPrefetch: rt,
    // public API
    expose: je,
    inheritAttrs: Ae,
    // assets
    components: ge,
    directives: Ve,
    filters: Je
  } = t;
  if (h && Yu(h, s, null), o)
    for (const me in o) {
      const ae = o[me];
      _e(ae) && (s[me] = ae.bind(n));
    }
  if (r) {
    const me = r.call(n, n);
    ot(me) && (e.data = Mr(me));
  }
  if (Si = !0, i)
    for (const me in i) {
      const ae = i[me], ut = _e(ae) ? ae.bind(n, n) : _e(ae.get) ? ae.get.bind(n, n) : sn, it = !_e(ae) && _e(ae.set) ? ae.set.bind(n) : sn, ie = Ie({
        get: ut,
        set: it
      });
      Object.defineProperty(s, me, {
        enumerable: !0,
        configurable: !0,
        get: () => ie.value,
        set: (nt) => ie.value = nt
      });
    }
  if (a)
    for (const me in a)
      vl(a[me], s, n, me);
  if (l) {
    const me = _e(l) ? l.call(n) : l;
    Reflect.ownKeys(me).forEach((ae) => {
      tf(ae, me[ae]);
    });
  }
  c && Yo(c, e, "c");
  function oe(me, ae) {
    he(ae) ? ae.forEach((ut) => me(ut.bind(n))) : ae && me(ae.bind(n));
  }
  if (oe(Bu, y), oe(to, _), oe($u, M), oe(Uu, $), oe(Mu, Y), oe(Fu, Re), oe(ju, Pe), oe(qu, ee), oe(Wu, V), oe(zu, Ce), oe(qs, z), oe(Hu, rt), he(je))
    if (je.length) {
      const me = e.exposed || (e.exposed = {});
      je.forEach((ae) => {
        Object.defineProperty(me, ae, {
          get: () => n[ae],
          set: (ut) => n[ae] = ut,
          enumerable: !0
        });
      });
    } else e.exposed || (e.exposed = {});
  W && e.render === sn && (e.render = W), Ae != null && (e.inheritAttrs = Ae), ge && (e.components = ge), Ve && (e.directives = Ve), rt && ml(e);
}
function Yu(e, t, n = sn) {
  he(e) && (e = Ei(e));
  for (const s in e) {
    const r = e[s];
    let i;
    ot(r) ? "default" in r ? i = cr(
      r.from || s,
      r.default,
      !0
    ) : i = cr(r.from || s) : i = cr(r), wt(i) ? Object.defineProperty(t, s, {
      enumerable: !0,
      configurable: !0,
      get: () => i.value,
      set: (o) => i.value = o
    }) : t[s] = i;
  }
}
function Yo(e, t, n) {
  an(
    he(e) ? e.map((s) => s.bind(t.proxy)) : e.bind(t.proxy),
    t,
    n
  );
}
function vl(e, t, n, s) {
  let r = s.includes(".") ? Pl(n, s) : () => n[s];
  if (pt(e)) {
    const i = t[e];
    _e(i) && mn(r, i);
  } else if (_e(e))
    mn(r, e.bind(n));
  else if (ot(e))
    if (he(e))
      e.forEach((i) => vl(i, t, n, s));
    else {
      const i = _e(e.handler) ? e.handler.bind(n) : t[e.handler];
      _e(i) && mn(r, i, e);
    }
}
function yl(e) {
  const t = e.type, { mixins: n, extends: s } = t, {
    mixins: r,
    optionsCache: i,
    config: { optionMergeStrategies: o }
  } = e.appContext, a = i.get(t);
  let l;
  return a ? l = a : !r.length && !n && !s ? l = t : (l = {}, r.length && r.forEach(
    (h) => Ar(l, h, o, !0)
  ), Ar(l, t, o)), ot(t) && i.set(t, l), l;
}
function Ar(e, t, n, s = !1) {
  const { mixins: r, extends: i } = t;
  i && Ar(e, i, n, !0), r && r.forEach(
    (o) => Ar(e, o, n, !0)
  );
  for (const o in t)
    if (!(s && o === "expose")) {
      const a = Xu[o] || n && n[o];
      e[o] = a ? a(e[o], t[o]) : t[o];
    }
  return e;
}
const Xu = {
  data: Xo,
  props: Zo,
  emits: Zo,
  // objects
  methods: Es,
  computed: Es,
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
  components: Es,
  directives: Es,
  // watch
  watch: Ju,
  // provide / inject
  provide: Xo,
  inject: Zu
};
function Xo(e, t) {
  return t ? e ? function() {
    return kt(
      _e(e) ? e.call(this, this) : e,
      _e(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function Zu(e, t) {
  return Es(Ei(e), Ei(t));
}
function Ei(e) {
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
function Es(e, t) {
  return e ? kt(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function Zo(e, t) {
  return e ? he(e) && he(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : kt(
    /* @__PURE__ */ Object.create(null),
    Go(e),
    Go(t ?? {})
  ) : t;
}
function Ju(e, t) {
  if (!e) return t;
  if (!t) return e;
  const n = kt(/* @__PURE__ */ Object.create(null), e);
  for (const s in t)
    n[s] = At(e[s], t[s]);
  return n;
}
function wl() {
  return {
    app: null,
    config: {
      isNativeTag: Hc,
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
let Qu = 0;
function ef(e, t) {
  return function(s, r = null) {
    _e(s) || (s = kt({}, s)), r != null && !ot(r) && (r = null);
    const i = wl(), o = /* @__PURE__ */ new WeakSet(), a = [];
    let l = !1;
    const h = i.app = {
      _uid: Qu++,
      _component: s,
      _props: r,
      _container: null,
      _context: i,
      _instance: null,
      version: Df,
      get config() {
        return i.config;
      },
      set config(c) {
      },
      use(c, ...y) {
        return o.has(c) || (c && _e(c.install) ? (o.add(c), c.install(h, ...y)) : _e(c) && (o.add(c), c(h, ...y))), h;
      },
      mixin(c) {
        return i.mixins.includes(c) || i.mixins.push(c), h;
      },
      component(c, y) {
        return y ? (i.components[c] = y, h) : i.components[c];
      },
      directive(c, y) {
        return y ? (i.directives[c] = y, h) : i.directives[c];
      },
      mount(c, y, _) {
        if (!l) {
          const M = h._ceVNode || rn(s, r);
          return M.appContext = i, _ === !0 ? _ = "svg" : _ === !1 && (_ = void 0), e(M, c, _), l = !0, h._container = c, c.__vue_app__ = h, Ur(M.component);
        }
      },
      onUnmount(c) {
        a.push(c);
      },
      unmount() {
        l && (an(
          a,
          h._instance,
          16
        ), e(null, h._container), delete h._container.__vue_app__);
      },
      provide(c, y) {
        return i.provides[c] = y, h;
      },
      runWithContext(c) {
        const y = rs;
        rs = h;
        try {
          return c();
        } finally {
          rs = y;
        }
      }
    };
    return h;
  };
}
let rs = null;
function tf(e, t) {
  if (St) {
    let n = St.provides;
    const s = St.parent && St.parent.provides;
    s === n && (n = St.provides = Object.create(s)), n[e] = t;
  }
}
function cr(e, t, n = !1) {
  const s = Lf();
  if (s || rs) {
    let r = rs ? rs._context.provides : s ? s.parent == null || s.ce ? s.vnode.appContext && s.vnode.appContext.provides : s.parent.provides : void 0;
    if (r && e in r)
      return r[e];
    if (arguments.length > 1)
      return n && _e(t) ? t.call(s && s.proxy) : t;
  }
}
const kl = {}, xl = () => Object.create(kl), Al = (e) => Object.getPrototypeOf(e) === kl;
function nf(e, t, n, s = !1) {
  const r = {}, i = xl();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), Tl(e, t, r, i);
  for (const o in e.propsOptions[0])
    o in r || (r[o] = void 0);
  n ? e.props = s ? r : vu(r) : e.type.props ? e.props = r : e.props = i, e.attrs = i;
}
function sf(e, t, n, s) {
  const {
    props: r,
    attrs: i,
    vnode: { patchFlag: o }
  } = e, a = $e(r), [l] = e.propsOptions;
  let h = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (s || o > 0) && !(o & 16)
  ) {
    if (o & 8) {
      const c = e.vnode.dynamicProps;
      for (let y = 0; y < c.length; y++) {
        let _ = c[y];
        if (Br(e.emitsOptions, _))
          continue;
        const M = t[_];
        if (l)
          if (Ue(i, _))
            M !== i[_] && (i[_] = M, h = !0);
          else {
            const $ = Ln(_);
            r[$] = Ci(
              l,
              a,
              $,
              M,
              e,
              !1
            );
          }
        else
          M !== i[_] && (i[_] = M, h = !0);
      }
    }
  } else {
    Tl(e, t, r, i) && (h = !0);
    let c;
    for (const y in a)
      (!t || // for camelCase
      !Ue(t, y) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((c = Mn(y)) === y || !Ue(t, c))) && (l ? n && // for camelCase
      (n[y] !== void 0 || // for kebab-case
      n[c] !== void 0) && (r[y] = Ci(
        l,
        a,
        y,
        void 0,
        e,
        !0
      )) : delete r[y]);
    if (i !== a)
      for (const y in i)
        (!t || !Ue(t, y)) && (delete i[y], h = !0);
  }
  h && pn(e.attrs, "set", "");
}
function Tl(e, t, n, s) {
  const [r, i] = e.propsOptions;
  let o = !1, a;
  if (t)
    for (let l in t) {
      if (Is(l))
        continue;
      const h = t[l];
      let c;
      r && Ue(r, c = Ln(l)) ? !i || !i.includes(c) ? n[c] = h : (a || (a = {}))[c] = h : Br(e.emitsOptions, l) || (!(l in s) || h !== s[l]) && (s[l] = h, o = !0);
    }
  if (i) {
    const l = $e(n), h = a || Ze;
    for (let c = 0; c < i.length; c++) {
      const y = i[c];
      n[y] = Ci(
        r,
        l,
        y,
        h[y],
        e,
        !Ue(h, y)
      );
    }
  }
  return o;
}
function Ci(e, t, n, s, r, i) {
  const o = e[n];
  if (o != null) {
    const a = Ue(o, "default");
    if (a && s === void 0) {
      const l = o.default;
      if (o.type !== Function && !o.skipFactory && _e(l)) {
        const { propsDefaults: h } = r;
        if (n in h)
          s = h[n];
        else {
          const c = js(r);
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
    ] && (s === "" || s === Mn(n)) && (s = !0));
  }
  return s;
}
const rf = /* @__PURE__ */ new WeakMap();
function Sl(e, t, n = !1) {
  const s = n ? rf : t.propsCache, r = s.get(e);
  if (r)
    return r;
  const i = e.props, o = {}, a = [];
  let l = !1;
  if (!_e(e)) {
    const c = (y) => {
      l = !0;
      const [_, M] = Sl(y, t, !0);
      kt(o, _), M && a.push(...M);
    };
    !n && t.mixins.length && t.mixins.forEach(c), e.extends && c(e.extends), e.mixins && e.mixins.forEach(c);
  }
  if (!i && !l)
    return ot(e) && s.set(e, es), es;
  if (he(i))
    for (let c = 0; c < i.length; c++) {
      const y = Ln(i[c]);
      Jo(y) && (o[y] = Ze);
    }
  else if (i)
    for (const c in i) {
      const y = Ln(c);
      if (Jo(y)) {
        const _ = i[c], M = o[y] = he(_) || _e(_) ? { type: _ } : kt({}, _), $ = M.type;
        let Y = !1, Re = !0;
        if (he($))
          for (let ne = 0; ne < $.length; ++ne) {
            const Ce = $[ne], xe = _e(Ce) && Ce.name;
            if (xe === "Boolean") {
              Y = !0;
              break;
            } else xe === "String" && (Re = !1);
          }
        else
          Y = _e($) && $.name === "Boolean";
        M[
          0
          /* shouldCast */
        ] = Y, M[
          1
          /* shouldCastTrue */
        ] = Re, (Y || Ue(M, "default")) && a.push(y);
      }
    }
  const h = [o, a];
  return ot(e) && s.set(e, h), h;
}
function Jo(e) {
  return e[0] !== "$" && !Is(e);
}
const no = (e) => e === "_" || e === "__" || e === "_ctx" || e === "$stable", so = (e) => he(e) ? e.map(nn) : [nn(e)], of = (e, t, n) => {
  if (t._n)
    return t;
  const s = Lu((...r) => so(t(...r)), n);
  return s._c = !1, s;
}, El = (e, t, n) => {
  const s = e._ctx;
  for (const r in e) {
    if (no(r)) continue;
    const i = e[r];
    if (_e(i))
      t[r] = of(r, i, s);
    else if (i != null) {
      const o = so(i);
      t[r] = () => o;
    }
  }
}, Cl = (e, t) => {
  const n = so(t);
  e.slots.default = () => n;
}, Rl = (e, t, n) => {
  for (const s in t)
    (n || !no(s)) && (e[s] = t[s]);
}, af = (e, t, n) => {
  const s = e.slots = xl();
  if (e.vnode.shapeFlag & 32) {
    const r = t.__;
    r && bi(s, "__", r, !0);
    const i = t._;
    i ? (Rl(s, t, n), n && bi(s, "_", i, !0)) : El(t, s);
  } else t && Cl(e, t);
}, lf = (e, t, n) => {
  const { vnode: s, slots: r } = e;
  let i = !0, o = Ze;
  if (s.shapeFlag & 32) {
    const a = t._;
    a ? n && a === 1 ? i = !1 : Rl(r, t, n) : (i = !t.$stable, El(t, r)), o = t;
  } else t && (Cl(e, t), o = { default: 1 });
  if (i)
    for (const a in r)
      !no(a) && o[a] == null && delete r[a];
}, Mt = kf;
function cf(e) {
  return uf(e);
}
function uf(e, t) {
  const n = Pr();
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
    parentNode: y,
    nextSibling: _,
    setScopeId: M = sn,
    insertStaticContent: $
  } = e, Y = (d, b, k, L = null, R = null, I = null, B = void 0, D = null, F = !!b.dynamicChildren) => {
    if (d === b)
      return;
    d && !gs(d, b) && (L = j(d), nt(d, R, I, !0), d = null), b.patchFlag === -2 && (F = !1, b.dynamicChildren = null);
    const { type: P, ref: X, shapeFlag: U } = b;
    switch (P) {
      case $r:
        Re(d, b, k, L);
        break;
      case Pn:
        ne(d, b, k, L);
        break;
      case ur:
        d == null && Ce(b, k, L, B);
        break;
      case et:
        ge(
          d,
          b,
          k,
          L,
          R,
          I,
          B,
          D,
          F
        );
        break;
      default:
        U & 1 ? W(
          d,
          b,
          k,
          L,
          R,
          I,
          B,
          D,
          F
        ) : U & 6 ? Ve(
          d,
          b,
          k,
          L,
          R,
          I,
          B,
          D,
          F
        ) : (U & 64 || U & 128) && P.process(
          d,
          b,
          k,
          L,
          R,
          I,
          B,
          D,
          F,
          gt
        );
    }
    X != null && R ? Ps(X, d && d.ref, I, b || d, !b) : X == null && d && d.ref != null && Ps(d.ref, null, I, d, !0);
  }, Re = (d, b, k, L) => {
    if (d == null)
      s(
        b.el = a(b.children),
        k,
        L
      );
    else {
      const R = b.el = d.el;
      b.children !== d.children && h(R, b.children);
    }
  }, ne = (d, b, k, L) => {
    d == null ? s(
      b.el = l(b.children || ""),
      k,
      L
    ) : b.el = d.el;
  }, Ce = (d, b, k, L) => {
    [d.el, d.anchor] = $(
      d.children,
      b,
      k,
      L,
      d.el,
      d.anchor
    );
  }, xe = ({ el: d, anchor: b }, k, L) => {
    let R;
    for (; d && d !== b; )
      R = _(d), s(d, k, L), d = R;
    s(b, k, L);
  }, z = ({ el: d, anchor: b }) => {
    let k;
    for (; d && d !== b; )
      k = _(d), r(d), d = k;
    r(b);
  }, W = (d, b, k, L, R, I, B, D, F) => {
    b.type === "svg" ? B = "svg" : b.type === "math" && (B = "mathml"), d == null ? ee(
      b,
      k,
      L,
      R,
      I,
      B,
      D,
      F
    ) : rt(
      d,
      b,
      R,
      I,
      B,
      D,
      F
    );
  }, ee = (d, b, k, L, R, I, B, D) => {
    let F, P;
    const { props: X, shapeFlag: U, transition: K, dirs: Q } = d;
    if (F = d.el = o(
      d.type,
      I,
      X && X.is,
      X
    ), U & 8 ? c(F, d.children) : U & 16 && Pe(
      d.children,
      F,
      null,
      L,
      R,
      si(d, I),
      B,
      D
    ), Q && Bn(d, null, L, "created"), V(F, d, d.scopeId, B, L), X) {
      for (const Te in X)
        Te !== "value" && !Is(Te) && i(F, Te, null, X[Te], I, L);
      "value" in X && i(F, "value", null, X.value, I), (P = X.onVnodeBeforeMount) && Jt(P, L, d);
    }
    Q && Bn(d, null, L, "beforeMount");
    const ue = ff(R, K);
    ue && K.beforeEnter(F), s(F, b, k), ((P = X && X.onVnodeMounted) || ue || Q) && Mt(() => {
      P && Jt(P, L, d), ue && K.enter(F), Q && Bn(d, null, L, "mounted");
    }, R);
  }, V = (d, b, k, L, R) => {
    if (k && M(d, k), L)
      for (let I = 0; I < L.length; I++)
        M(d, L[I]);
    if (R) {
      let I = R.subTree;
      if (b === I || Ml(I.type) && (I.ssContent === b || I.ssFallback === b)) {
        const B = R.vnode;
        V(
          d,
          B,
          B.scopeId,
          B.slotScopeIds,
          R.parent
        );
      }
    }
  }, Pe = (d, b, k, L, R, I, B, D, F = 0) => {
    for (let P = F; P < d.length; P++) {
      const X = d[P] = D ? En(d[P]) : nn(d[P]);
      Y(
        null,
        X,
        b,
        k,
        L,
        R,
        I,
        B,
        D
      );
    }
  }, rt = (d, b, k, L, R, I, B) => {
    const D = b.el = d.el;
    let { patchFlag: F, dynamicChildren: P, dirs: X } = b;
    F |= d.patchFlag & 16;
    const U = d.props || Ze, K = b.props || Ze;
    let Q;
    if (k && $n(k, !1), (Q = K.onVnodeBeforeUpdate) && Jt(Q, k, b, d), X && Bn(b, d, k, "beforeUpdate"), k && $n(k, !0), (U.innerHTML && K.innerHTML == null || U.textContent && K.textContent == null) && c(D, ""), P ? je(
      d.dynamicChildren,
      P,
      D,
      k,
      L,
      si(b, R),
      I
    ) : B || ae(
      d,
      b,
      D,
      null,
      k,
      L,
      si(b, R),
      I,
      !1
    ), F > 0) {
      if (F & 16)
        Ae(D, U, K, k, R);
      else if (F & 2 && U.class !== K.class && i(D, "class", null, K.class, R), F & 4 && i(D, "style", U.style, K.style, R), F & 8) {
        const ue = b.dynamicProps;
        for (let Te = 0; Te < ue.length; Te++) {
          const pe = ue[Te], Fe = U[pe], De = K[pe];
          (De !== Fe || pe === "value") && i(D, pe, Fe, De, R, k);
        }
      }
      F & 1 && d.children !== b.children && c(D, b.children);
    } else !B && P == null && Ae(D, U, K, k, R);
    ((Q = K.onVnodeUpdated) || X) && Mt(() => {
      Q && Jt(Q, k, b, d), X && Bn(b, d, k, "updated");
    }, L);
  }, je = (d, b, k, L, R, I, B) => {
    for (let D = 0; D < b.length; D++) {
      const F = d[D], P = b[D], X = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        F.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (F.type === et || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !gs(F, P) || // - In the case of a component, it could contain anything.
        F.shapeFlag & 198) ? y(F.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          k
        )
      );
      Y(
        F,
        P,
        X,
        null,
        L,
        R,
        I,
        B,
        !0
      );
    }
  }, Ae = (d, b, k, L, R) => {
    if (b !== k) {
      if (b !== Ze)
        for (const I in b)
          !Is(I) && !(I in k) && i(
            d,
            I,
            b[I],
            null,
            R,
            L
          );
      for (const I in k) {
        if (Is(I)) continue;
        const B = k[I], D = b[I];
        B !== D && I !== "value" && i(d, I, D, B, R, L);
      }
      "value" in k && i(d, "value", b.value, k.value, R);
    }
  }, ge = (d, b, k, L, R, I, B, D, F) => {
    const P = b.el = d ? d.el : a(""), X = b.anchor = d ? d.anchor : a("");
    let { patchFlag: U, dynamicChildren: K, slotScopeIds: Q } = b;
    Q && (D = D ? D.concat(Q) : Q), d == null ? (s(P, k, L), s(X, k, L), Pe(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      b.children || [],
      k,
      X,
      R,
      I,
      B,
      D,
      F
    )) : U > 0 && U & 64 && K && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    d.dynamicChildren ? (je(
      d.dynamicChildren,
      K,
      k,
      R,
      I,
      B,
      D
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (b.key != null || R && b === R.subTree) && Il(
      d,
      b,
      !0
      /* shallow */
    )) : ae(
      d,
      b,
      k,
      X,
      R,
      I,
      B,
      D,
      F
    );
  }, Ve = (d, b, k, L, R, I, B, D, F) => {
    b.slotScopeIds = D, d == null ? b.shapeFlag & 512 ? R.ctx.activate(
      b,
      k,
      L,
      B,
      F
    ) : Je(
      b,
      k,
      L,
      R,
      I,
      B,
      F
    ) : at(d, b, F);
  }, Je = (d, b, k, L, R, I, B) => {
    const D = d.component = If(
      d,
      L,
      R
    );
    if (_l(d) && (D.ctx.renderer = gt), Of(D, !1, B), D.asyncDep) {
      if (R && R.registerDep(D, oe, B), !d.el) {
        const F = D.subTree = rn(Pn);
        ne(null, F, b, k), d.placeholder = F.el;
      }
    } else
      oe(
        D,
        d,
        b,
        k,
        R,
        I,
        B
      );
  }, at = (d, b, k) => {
    const L = b.component = d.component;
    if (yf(d, b, k))
      if (L.asyncDep && !L.asyncResolved) {
        me(L, b, k);
        return;
      } else
        L.next = b, L.update();
    else
      b.el = d.el, L.vnode = b;
  }, oe = (d, b, k, L, R, I, B) => {
    const D = () => {
      if (d.isMounted) {
        let { next: U, bu: K, u: Q, parent: ue, vnode: Te } = d;
        {
          const u = Ll(d);
          if (u) {
            U && (U.el = Te.el, me(d, U, B)), u.asyncDep.then(() => {
              d.isUnmounted || D();
            });
            return;
          }
        }
        let pe = U, Fe;
        $n(d, !1), U ? (U.el = Te.el, me(d, U, B)) : U = Te, K && lr(K), (Fe = U.props && U.props.onVnodeBeforeUpdate) && Jt(Fe, ue, U, Te), $n(d, !0);
        const De = ea(d), Qe = d.subTree;
        d.subTree = De, Y(
          Qe,
          De,
          // parent may have changed if it's in a teleport
          y(Qe.el),
          // anchor may have changed if it's in a fragment
          j(Qe),
          d,
          R,
          I
        ), U.el = De.el, pe === null && wf(d, De.el), Q && Mt(Q, R), (Fe = U.props && U.props.onVnodeUpdated) && Mt(
          () => Jt(Fe, ue, U, Te),
          R
        );
      } else {
        let U;
        const { el: K, props: Q } = b, { bm: ue, m: Te, parent: pe, root: Fe, type: De } = d, Qe = Ns(b);
        $n(d, !1), ue && lr(ue), !Qe && (U = Q && Q.onVnodeBeforeMount) && Jt(U, pe, b), $n(d, !0);
        {
          Fe.ce && // @ts-expect-error _def is private
          Fe.ce._def.shadowRoot !== !1 && Fe.ce._injectChildStyle(De);
          const u = d.subTree = ea(d);
          Y(
            null,
            u,
            k,
            L,
            d,
            R,
            I
          ), b.el = u.el;
        }
        if (Te && Mt(Te, R), !Qe && (U = Q && Q.onVnodeMounted)) {
          const u = b;
          Mt(
            () => Jt(U, pe, u),
            R
          );
        }
        (b.shapeFlag & 256 || pe && Ns(pe.vnode) && pe.vnode.shapeFlag & 256) && d.a && Mt(d.a, R), d.isMounted = !0, b = k = L = null;
      }
    };
    d.scope.on();
    const F = d.effect = new Ya(D);
    d.scope.off();
    const P = d.update = F.run.bind(F), X = d.job = F.runIfDirty.bind(F);
    X.i = d, X.id = d.uid, F.scheduler = () => Qi(X), $n(d, !0), P();
  }, me = (d, b, k) => {
    b.component = d;
    const L = d.vnode.props;
    d.vnode = b, d.next = null, sf(d, b.props, L, k), lf(d, b.children, k), vn(), Ko(d), yn();
  }, ae = (d, b, k, L, R, I, B, D, F = !1) => {
    const P = d && d.children, X = d ? d.shapeFlag : 0, U = b.children, { patchFlag: K, shapeFlag: Q } = b;
    if (K > 0) {
      if (K & 128) {
        it(
          P,
          U,
          k,
          L,
          R,
          I,
          B,
          D,
          F
        );
        return;
      } else if (K & 256) {
        ut(
          P,
          U,
          k,
          L,
          R,
          I,
          B,
          D,
          F
        );
        return;
      }
    }
    Q & 8 ? (X & 16 && re(P, R, I), U !== P && c(k, U)) : X & 16 ? Q & 16 ? it(
      P,
      U,
      k,
      L,
      R,
      I,
      B,
      D,
      F
    ) : re(P, R, I, !0) : (X & 8 && c(k, ""), Q & 16 && Pe(
      U,
      k,
      L,
      R,
      I,
      B,
      D,
      F
    ));
  }, ut = (d, b, k, L, R, I, B, D, F) => {
    d = d || es, b = b || es;
    const P = d.length, X = b.length, U = Math.min(P, X);
    let K;
    for (K = 0; K < U; K++) {
      const Q = b[K] = F ? En(b[K]) : nn(b[K]);
      Y(
        d[K],
        Q,
        k,
        null,
        R,
        I,
        B,
        D,
        F
      );
    }
    P > X ? re(
      d,
      R,
      I,
      !0,
      !1,
      U
    ) : Pe(
      b,
      k,
      L,
      R,
      I,
      B,
      D,
      F,
      U
    );
  }, it = (d, b, k, L, R, I, B, D, F) => {
    let P = 0;
    const X = b.length;
    let U = d.length - 1, K = X - 1;
    for (; P <= U && P <= K; ) {
      const Q = d[P], ue = b[P] = F ? En(b[P]) : nn(b[P]);
      if (gs(Q, ue))
        Y(
          Q,
          ue,
          k,
          null,
          R,
          I,
          B,
          D,
          F
        );
      else
        break;
      P++;
    }
    for (; P <= U && P <= K; ) {
      const Q = d[U], ue = b[K] = F ? En(b[K]) : nn(b[K]);
      if (gs(Q, ue))
        Y(
          Q,
          ue,
          k,
          null,
          R,
          I,
          B,
          D,
          F
        );
      else
        break;
      U--, K--;
    }
    if (P > U) {
      if (P <= K) {
        const Q = K + 1, ue = Q < X ? b[Q].el : L;
        for (; P <= K; )
          Y(
            null,
            b[P] = F ? En(b[P]) : nn(b[P]),
            k,
            ue,
            R,
            I,
            B,
            D,
            F
          ), P++;
      }
    } else if (P > K)
      for (; P <= U; )
        nt(d[P], R, I, !0), P++;
    else {
      const Q = P, ue = P, Te = /* @__PURE__ */ new Map();
      for (P = ue; P <= K; P++) {
        const x = b[P] = F ? En(b[P]) : nn(b[P]);
        x.key != null && Te.set(x.key, P);
      }
      let pe, Fe = 0;
      const De = K - ue + 1;
      let Qe = !1, u = 0;
      const v = new Array(De);
      for (P = 0; P < De; P++) v[P] = 0;
      for (P = Q; P <= U; P++) {
        const x = d[P];
        if (Fe >= De) {
          nt(x, R, I, !0);
          continue;
        }
        let N;
        if (x.key != null)
          N = Te.get(x.key);
        else
          for (pe = ue; pe <= K; pe++)
            if (v[pe - ue] === 0 && gs(x, b[pe])) {
              N = pe;
              break;
            }
        N === void 0 ? nt(x, R, I, !0) : (v[N - ue] = P + 1, N >= u ? u = N : Qe = !0, Y(
          x,
          b[N],
          k,
          null,
          R,
          I,
          B,
          D,
          F
        ), Fe++);
      }
      const A = Qe ? hf(v) : es;
      for (pe = A.length - 1, P = De - 1; P >= 0; P--) {
        const x = ue + P, N = b[x], G = b[x + 1], te = x + 1 < X ? (
          // #13559, fallback to el placeholder for unresolved async component
          G.el || G.placeholder
        ) : L;
        v[P] === 0 ? Y(
          null,
          N,
          k,
          te,
          R,
          I,
          B,
          D,
          F
        ) : Qe && (pe < 0 || P !== A[pe] ? ie(N, k, te, 2) : pe--);
      }
    }
  }, ie = (d, b, k, L, R = null) => {
    const { el: I, type: B, transition: D, children: F, shapeFlag: P } = d;
    if (P & 6) {
      ie(d.component.subTree, b, k, L);
      return;
    }
    if (P & 128) {
      d.suspense.move(b, k, L);
      return;
    }
    if (P & 64) {
      B.move(d, b, k, gt);
      return;
    }
    if (B === et) {
      s(I, b, k);
      for (let U = 0; U < F.length; U++)
        ie(F[U], b, k, L);
      s(d.anchor, b, k);
      return;
    }
    if (B === ur) {
      xe(d, b, k);
      return;
    }
    if (L !== 2 && P & 1 && D)
      if (L === 0)
        D.beforeEnter(I), s(I, b, k), Mt(() => D.enter(I), R);
      else {
        const { leave: U, delayLeave: K, afterLeave: Q } = D, ue = () => {
          d.ctx.isUnmounted ? r(I) : s(I, b, k);
        }, Te = () => {
          U(I, () => {
            ue(), Q && Q();
          });
        };
        K ? K(I, ue, Te) : Te();
      }
    else
      s(I, b, k);
  }, nt = (d, b, k, L = !1, R = !1) => {
    const {
      type: I,
      props: B,
      ref: D,
      children: F,
      dynamicChildren: P,
      shapeFlag: X,
      patchFlag: U,
      dirs: K,
      cacheIndex: Q
    } = d;
    if (U === -2 && (R = !1), D != null && (vn(), Ps(D, null, k, d, !0), yn()), Q != null && (b.renderCache[Q] = void 0), X & 256) {
      b.ctx.deactivate(d);
      return;
    }
    const ue = X & 1 && K, Te = !Ns(d);
    let pe;
    if (Te && (pe = B && B.onVnodeBeforeUnmount) && Jt(pe, b, d), X & 6)
      de(d.component, k, L);
    else {
      if (X & 128) {
        d.suspense.unmount(k, L);
        return;
      }
      ue && Bn(d, null, b, "beforeUnmount"), X & 64 ? d.type.remove(
        d,
        b,
        k,
        gt,
        L
      ) : P && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !P.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (I !== et || U > 0 && U & 64) ? re(
        P,
        b,
        k,
        !1,
        !0
      ) : (I === et && U & 384 || !R && X & 16) && re(F, b, k), L && be(d);
    }
    (Te && (pe = B && B.onVnodeUnmounted) || ue) && Mt(() => {
      pe && Jt(pe, b, d), ue && Bn(d, null, b, "unmounted");
    }, k);
  }, be = (d) => {
    const { type: b, el: k, anchor: L, transition: R } = d;
    if (b === et) {
      q(k, L);
      return;
    }
    if (b === ur) {
      z(d);
      return;
    }
    const I = () => {
      r(k), R && !R.persisted && R.afterLeave && R.afterLeave();
    };
    if (d.shapeFlag & 1 && R && !R.persisted) {
      const { leave: B, delayLeave: D } = R, F = () => B(k, I);
      D ? D(d.el, I, F) : F();
    } else
      I();
  }, q = (d, b) => {
    let k;
    for (; d !== b; )
      k = _(d), r(d), d = k;
    r(b);
  }, de = (d, b, k) => {
    const {
      bum: L,
      scope: R,
      job: I,
      subTree: B,
      um: D,
      m: F,
      a: P,
      parent: X,
      slots: { __: U }
    } = d;
    Qo(F), Qo(P), L && lr(L), X && he(U) && U.forEach((K) => {
      X.renderCache[K] = void 0;
    }), R.stop(), I && (I.flags |= 8, nt(B, d, b, k)), D && Mt(D, b), Mt(() => {
      d.isUnmounted = !0;
    }, b), b && b.pendingBranch && !b.isUnmounted && d.asyncDep && !d.asyncResolved && d.suspenseId === b.pendingId && (b.deps--, b.deps === 0 && b.resolve());
  }, re = (d, b, k, L = !1, R = !1, I = 0) => {
    for (let B = I; B < d.length; B++)
      nt(d[B], b, k, L, R);
  }, j = (d) => {
    if (d.shapeFlag & 6)
      return j(d.component.subTree);
    if (d.shapeFlag & 128)
      return d.suspense.next();
    const b = _(d.anchor || d.el), k = b && b[Ou];
    return k ? _(k) : b;
  };
  let He = !1;
  const Ke = (d, b, k) => {
    d == null ? b._vnode && nt(b._vnode, null, null, !0) : Y(
      b._vnode || null,
      d,
      b,
      null,
      null,
      null,
      k
    ), b._vnode = d, He || (He = !0, Ko(), dl(), He = !1);
  }, gt = {
    p: Y,
    um: nt,
    m: ie,
    r: be,
    mt: Je,
    mc: Pe,
    pc: ae,
    pbc: je,
    n: j,
    o: e
  };
  return {
    render: Ke,
    hydrate: void 0,
    createApp: ef(Ke)
  };
}
function si({ type: e, props: t }, n) {
  return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function $n({ effect: e, job: t }, n) {
  n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function ff(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function Il(e, t, n = !1) {
  const s = e.children, r = t.children;
  if (he(s) && he(r))
    for (let i = 0; i < s.length; i++) {
      const o = s[i];
      let a = r[i];
      a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = r[i] = En(r[i]), a.el = o.el), !n && a.patchFlag !== -2 && Il(o, a)), a.type === $r && (a.el = o.el), a.type === Pn && !a.el && (a.el = o.el);
    }
}
function hf(e) {
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
function Ll(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : Ll(t);
}
function Qo(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
const df = Symbol.for("v-scx"), pf = () => cr(df);
function mn(e, t, n) {
  return Ol(e, t, n);
}
function Ol(e, t, n = Ze) {
  const { immediate: s, deep: r, flush: i, once: o } = n, a = kt({}, n), l = t && s || !t && i !== "post";
  let h;
  if (Hs) {
    if (i === "sync") {
      const M = pf();
      h = M.__watcherHandles || (M.__watcherHandles = []);
    } else if (!l) {
      const M = () => {
      };
      return M.stop = sn, M.resume = sn, M.pause = sn, M;
    }
  }
  const c = St;
  a.call = (M, $, Y) => an(M, c, $, Y);
  let y = !1;
  i === "post" ? a.scheduler = (M) => {
    Mt(M, c && c.suspense);
  } : i !== "sync" && (y = !0, a.scheduler = (M, $) => {
    $ ? M() : Qi(M);
  }), a.augmentJob = (M) => {
    t && (M.flags |= 4), y && (M.flags |= 2, c && (M.id = c.uid, M.i = c));
  };
  const _ = Eu(e, t, a);
  return Hs && (h ? h.push(_) : l && _()), _;
}
function gf(e, t, n) {
  const s = this.proxy, r = pt(e) ? e.includes(".") ? Pl(s, e) : () => s[e] : e.bind(s, s);
  let i;
  _e(t) ? i = t : (i = t.handler, n = t);
  const o = js(this), a = Ol(r, i.bind(s), n);
  return o(), a;
}
function Pl(e, t) {
  const n = t.split(".");
  return () => {
    let s = e;
    for (let r = 0; r < n.length && s; r++)
      s = s[n[r]];
    return s;
  };
}
const mf = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${Ln(t)}Modifiers`] || e[`${Mn(t)}Modifiers`];
function _f(e, t, ...n) {
  if (e.isUnmounted) return;
  const s = e.vnode.props || Ze;
  let r = n;
  const i = t.startsWith("update:"), o = i && mf(s, t.slice(7));
  o && (o.trim && (r = n.map((c) => pt(c) ? c.trim() : c)), o.number && (r = n.map(vi)));
  let a, l = s[a = Zr(t)] || // also try camelCase event handler (#2249)
  s[a = Zr(Ln(t))];
  !l && i && (l = s[a = Zr(Mn(t))]), l && an(
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
    e.emitted[a] = !0, an(
      h,
      e,
      6,
      r
    );
  }
}
function Nl(e, t, n = !1) {
  const s = t.emitsCache, r = s.get(e);
  if (r !== void 0)
    return r;
  const i = e.emits;
  let o = {}, a = !1;
  if (!_e(e)) {
    const l = (h) => {
      const c = Nl(h, t, !0);
      c && (a = !0, kt(o, c));
    };
    !n && t.mixins.length && t.mixins.forEach(l), e.extends && l(e.extends), e.mixins && e.mixins.forEach(l);
  }
  return !i && !a ? (ot(e) && s.set(e, null), null) : (he(i) ? i.forEach((l) => o[l] = null) : kt(o, i), ot(e) && s.set(e, o), o);
}
function Br(e, t) {
  return !e || !Ir(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), Ue(e, t[0].toLowerCase() + t.slice(1)) || Ue(e, Mn(t)) || Ue(e, t));
}
function ea(e) {
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
    props: y,
    data: _,
    setupState: M,
    ctx: $,
    inheritAttrs: Y
  } = e, Re = xr(e);
  let ne, Ce;
  try {
    if (n.shapeFlag & 4) {
      const z = r || s, W = z;
      ne = nn(
        h.call(
          W,
          z,
          c,
          y,
          M,
          _,
          $
        )
      ), Ce = a;
    } else {
      const z = t;
      ne = nn(
        z.length > 1 ? z(
          y,
          { attrs: a, slots: o, emit: l }
        ) : z(
          y,
          null
        )
      ), Ce = t.props ? a : bf(a);
    }
  } catch (z) {
    Fs.length = 0, Fr(z, e, 1), ne = rn(Pn);
  }
  let xe = ne;
  if (Ce && Y !== !1) {
    const z = Object.keys(Ce), { shapeFlag: W } = xe;
    z.length && W & 7 && (i && z.some(Wi) && (Ce = vf(
      Ce,
      i
    )), xe = is(xe, Ce, !1, !0));
  }
  return n.dirs && (xe = is(xe, null, !1, !0), xe.dirs = xe.dirs ? xe.dirs.concat(n.dirs) : n.dirs), n.transition && eo(xe, n.transition), ne = xe, xr(Re), ne;
}
const bf = (e) => {
  let t;
  for (const n in e)
    (n === "class" || n === "style" || Ir(n)) && ((t || (t = {}))[n] = e[n]);
  return t;
}, vf = (e, t) => {
  const n = {};
  for (const s in e)
    (!Wi(s) || !(s.slice(9) in t)) && (n[s] = e[s]);
  return n;
};
function yf(e, t, n) {
  const { props: s, children: r, component: i } = e, { props: o, children: a, patchFlag: l } = t, h = i.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (n && l >= 0) {
    if (l & 1024)
      return !0;
    if (l & 16)
      return s ? ta(s, o, h) : !!o;
    if (l & 8) {
      const c = t.dynamicProps;
      for (let y = 0; y < c.length; y++) {
        const _ = c[y];
        if (o[_] !== s[_] && !Br(h, _))
          return !0;
      }
    }
  } else
    return (r || a) && (!a || !a.$stable) ? !0 : s === o ? !1 : s ? o ? ta(s, o, h) : !0 : !!o;
  return !1;
}
function ta(e, t, n) {
  const s = Object.keys(t);
  if (s.length !== Object.keys(e).length)
    return !0;
  for (let r = 0; r < s.length; r++) {
    const i = s[r];
    if (t[i] !== e[i] && !Br(n, i))
      return !0;
  }
  return !1;
}
function wf({ vnode: e, parent: t }, n) {
  for (; t; ) {
    const s = t.subTree;
    if (s.suspense && s.suspense.activeBranch === e && (s.el = e.el), s === e)
      (e = t.vnode).el = n, t = t.parent;
    else
      break;
  }
}
const Ml = (e) => e.__isSuspense;
function kf(e, t) {
  t && t.pendingBranch ? he(e) ? t.effects.push(...e) : t.effects.push(e) : Iu(e);
}
const et = Symbol.for("v-fgt"), $r = Symbol.for("v-txt"), Pn = Symbol.for("v-cmt"), ur = Symbol.for("v-stc"), Fs = [];
let Ft = null;
function T(e = !1) {
  Fs.push(Ft = e ? null : []);
}
function xf() {
  Fs.pop(), Ft = Fs[Fs.length - 1] || null;
}
let zs = 1;
function na(e, t = !1) {
  zs += e, e < 0 && Ft && t && (Ft.hasOnce = !0);
}
function Fl(e) {
  return e.dynamicChildren = zs > 0 ? Ft || es : null, xf(), zs > 0 && Ft && Ft.push(e), e;
}
function S(e, t, n, s, r, i) {
  return Fl(
    w(
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
function Af(e, t, n, s, r) {
  return Fl(
    rn(
      e,
      t,
      n,
      s,
      r,
      !0
    )
  );
}
function Dl(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function gs(e, t) {
  return e.type === t.type && e.key === t.key;
}
const Bl = ({ key: e }) => e ?? null, fr = ({
  ref: e,
  ref_key: t,
  ref_for: n
}) => (typeof e == "number" && (e = "" + e), e != null ? pt(e) || wt(e) || _e(e) ? { i: Ut, r: e, k: t, f: !!n } : e : null);
function w(e, t = null, n = null, s = 0, r = null, i = e === et ? 0 : 1, o = !1, a = !1) {
  const l = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && Bl(t),
    ref: t && fr(t),
    scopeId: gl,
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
    ctx: Ut
  };
  return a ? (ro(l, n), i & 128 && e.normalize(l)) : n && (l.shapeFlag |= pt(n) ? 8 : 16), zs > 0 && // avoid a block node from tracking itself
  !o && // has current parent block
  Ft && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (l.patchFlag > 0 || i & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  l.patchFlag !== 32 && Ft.push(l), l;
}
const rn = Tf;
function Tf(e, t = null, n = null, s = 0, r = null, i = !1) {
  if ((!e || e === Vu) && (e = Pn), Dl(e)) {
    const a = is(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return n && ro(a, n), zs > 0 && !i && Ft && (a.shapeFlag & 6 ? Ft[Ft.indexOf(e)] = a : Ft.push(a)), a.patchFlag = -2, a;
  }
  if (Ff(e) && (e = e.__vccOpts), t) {
    t = Sf(t);
    let { class: a, style: l } = t;
    a && !pt(a) && (t.class = Xe(a)), ot(l) && (Ji(l) && !he(l) && (l = kt({}, l)), t.style = ke(l));
  }
  const o = pt(e) ? 1 : Ml(e) ? 128 : Pu(e) ? 64 : ot(e) ? 4 : _e(e) ? 2 : 0;
  return w(
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
function Sf(e) {
  return e ? Ji(e) || Al(e) ? kt({}, e) : e : null;
}
function is(e, t, n = !1, s = !1) {
  const { props: r, ref: i, patchFlag: o, children: a, transition: l } = e, h = t ? Ef(r || {}, t) : r, c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: h,
    key: h && Bl(h),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && i ? he(i) ? i.concat(fr(t)) : [i, fr(t)] : fr(t)
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
    patchFlag: t && e.type !== et ? o === -1 ? 16 : o | 16 : o,
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
    ssContent: e.ssContent && is(e.ssContent),
    ssFallback: e.ssFallback && is(e.ssFallback),
    placeholder: e.placeholder,
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce
  };
  return l && s && eo(
    c,
    l.clone(c)
  ), c;
}
function Qt(e = " ", t = 0) {
  return rn($r, null, e, t);
}
function Un(e, t) {
  const n = rn(ur, null, e);
  return n.staticCount = t, n;
}
function le(e = "", t = !1) {
  return t ? (T(), Af(Pn, null, e)) : rn(Pn, null, e);
}
function nn(e) {
  return e == null || typeof e == "boolean" ? rn(Pn) : he(e) ? rn(
    et,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : Dl(e) ? En(e) : rn($r, null, String(e));
}
function En(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : is(e);
}
function ro(e, t) {
  let n = 0;
  const { shapeFlag: s } = e;
  if (t == null)
    t = null;
  else if (he(t))
    n = 16;
  else if (typeof t == "object")
    if (s & 65) {
      const r = t.default;
      r && (r._c && (r._d = !1), ro(e, r()), r._c && (r._d = !0));
      return;
    } else {
      n = 32;
      const r = t._;
      !r && !Al(t) ? t._ctx = Ut : r === 3 && Ut && (Ut.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else _e(t) ? (t = { default: t, _ctx: Ut }, n = 32) : (t = String(t), s & 64 ? (n = 16, t = [Qt(t)]) : n = 8);
  e.children = t, e.shapeFlag |= n;
}
function Ef(...e) {
  const t = {};
  for (let n = 0; n < e.length; n++) {
    const s = e[n];
    for (const r in s)
      if (r === "class")
        t.class !== s.class && (t.class = Xe([t.class, s.class]));
      else if (r === "style")
        t.style = ke([t.style, s.style]);
      else if (Ir(r)) {
        const i = t[r], o = s[r];
        o && i !== o && !(he(i) && i.includes(o)) && (t[r] = i ? [].concat(i, o) : o);
      } else r !== "" && (t[r] = s[r]);
  }
  return t;
}
function Jt(e, t, n, s = null) {
  an(e, t, 7, [
    n,
    s
  ]);
}
const Cf = wl();
let Rf = 0;
function If(e, t, n) {
  const s = e.type, r = (t ? t.appContext : e.appContext) || Cf, i = {
    uid: Rf++,
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
    scope: new Qc(
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
    propsOptions: Sl(s, r),
    emitsOptions: Nl(s, r),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: Ze,
    // inheritAttrs
    inheritAttrs: s.inheritAttrs,
    // state
    ctx: Ze,
    data: Ze,
    props: Ze,
    attrs: Ze,
    slots: Ze,
    refs: Ze,
    setupState: Ze,
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
  return i.ctx = { _: i }, i.root = t ? t.root : i, i.emit = _f.bind(null, i), e.ce && e.ce(i), i;
}
let St = null;
const Lf = () => St || Ut;
let Tr, Ri;
{
  const e = Pr(), t = (n, s) => {
    let r;
    return (r = e[n]) || (r = e[n] = []), r.push(s), (i) => {
      r.length > 1 ? r.forEach((o) => o(i)) : r[0](i);
    };
  };
  Tr = t(
    "__VUE_INSTANCE_SETTERS__",
    (n) => St = n
  ), Ri = t(
    "__VUE_SSR_SETTERS__",
    (n) => Hs = n
  );
}
const js = (e) => {
  const t = St;
  return Tr(e), e.scope.on(), () => {
    e.scope.off(), Tr(t);
  };
}, sa = () => {
  St && St.scope.off(), Tr(null);
};
function $l(e) {
  return e.vnode.shapeFlag & 4;
}
let Hs = !1;
function Of(e, t = !1, n = !1) {
  t && Ri(t);
  const { props: s, children: r } = e.vnode, i = $l(e);
  nf(e, s, i, t), af(e, r, n || t);
  const o = i ? Pf(e, t) : void 0;
  return t && Ri(!1), o;
}
function Pf(e, t) {
  const n = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Ku);
  const { setup: s } = n;
  if (s) {
    vn();
    const r = e.setupContext = s.length > 1 ? Mf(e) : null, i = js(e), o = Ws(
      s,
      e,
      0,
      [
        e.props,
        r
      ]
    ), a = Ha(o);
    if (yn(), i(), (a || e.sp) && !Ns(e) && ml(e), a) {
      if (o.then(sa, sa), t)
        return o.then((l) => {
          ra(e, l);
        }).catch((l) => {
          Fr(l, e, 0);
        });
      e.asyncDep = o;
    } else
      ra(e, o);
  } else
    Ul(e);
}
function ra(e, t, n) {
  _e(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : ot(t) && (e.setupState = ul(t)), Ul(e);
}
function Ul(e, t, n) {
  const s = e.type;
  e.render || (e.render = s.render || sn);
  {
    const r = js(e);
    vn();
    try {
      Gu(e);
    } finally {
      yn(), r();
    }
  }
}
const Nf = {
  get(e, t) {
    return yt(e, "get", ""), e[t];
  }
};
function Mf(e) {
  const t = (n) => {
    e.exposed = n || {};
  };
  return {
    attrs: new Proxy(e.attrs, Nf),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function Ur(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(ul(yu(e.exposed)), {
    get(t, n) {
      if (n in t)
        return t[n];
      if (n in Ms)
        return Ms[n](e);
    },
    has(t, n) {
      return n in t || n in Ms;
    }
  })) : e.proxy;
}
function Ff(e) {
  return _e(e) && "__vccOpts" in e;
}
const Ie = (e, t) => Tu(e, t, Hs), Df = "3.5.18";
/**
* @vue/runtime-dom v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let Ii;
const ia = typeof window < "u" && window.trustedTypes;
if (ia)
  try {
    Ii = /* @__PURE__ */ ia.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const zl = Ii ? (e) => Ii.createHTML(e) : (e) => e, Bf = "http://www.w3.org/2000/svg", $f = "http://www.w3.org/1998/Math/MathML", dn = typeof document < "u" ? document : null, oa = dn && /* @__PURE__ */ dn.createElement("template"), Uf = {
  insert: (e, t, n) => {
    t.insertBefore(e, n || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, n, s) => {
    const r = t === "svg" ? dn.createElementNS(Bf, e) : t === "mathml" ? dn.createElementNS($f, e) : n ? dn.createElement(e, { is: n }) : dn.createElement(e);
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
      oa.innerHTML = zl(
        s === "svg" ? `<svg>${e}</svg>` : s === "mathml" ? `<math>${e}</math>` : e
      );
      const a = oa.content;
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
}, zf = Symbol("_vtc");
function Hf(e, t, n) {
  const s = e[zf];
  s && (t = (t ? [t, ...s] : [...s]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
const Sr = Symbol("_vod"), Hl = Symbol("_vsh"), Wf = {
  beforeMount(e, { value: t }, { transition: n }) {
    e[Sr] = e.style.display === "none" ? "" : e.style.display, n && t ? n.beforeEnter(e) : ms(e, t);
  },
  mounted(e, { value: t }, { transition: n }) {
    n && t && n.enter(e);
  },
  updated(e, { value: t, oldValue: n }, { transition: s }) {
    !t != !n && (s ? t ? (s.beforeEnter(e), ms(e, !0), s.enter(e)) : s.leave(e, () => {
      ms(e, !1);
    }) : ms(e, t));
  },
  beforeUnmount(e, { value: t }) {
    ms(e, t);
  }
};
function ms(e, t) {
  e.style.display = t ? e[Sr] : "none", e[Hl] = !t;
}
const qf = Symbol(""), jf = /(^|;)\s*display\s*:/;
function Vf(e, t, n) {
  const s = e.style, r = pt(n);
  let i = !1;
  if (n && !r) {
    if (t)
      if (pt(t))
        for (const o of t.split(";")) {
          const a = o.slice(0, o.indexOf(":")).trim();
          n[a] == null && hr(s, a, "");
        }
      else
        for (const o in t)
          n[o] == null && hr(s, o, "");
    for (const o in n)
      o === "display" && (i = !0), hr(s, o, n[o]);
  } else if (r) {
    if (t !== n) {
      const o = s[qf];
      o && (n += ";" + o), s.cssText = n, i = jf.test(n);
    }
  } else t && e.removeAttribute("style");
  Sr in e && (e[Sr] = i ? s.display : "", e[Hl] && (s.display = "none"));
}
const aa = /\s*!important$/;
function hr(e, t, n) {
  if (he(n))
    n.forEach((s) => hr(e, t, s));
  else if (n == null && (n = ""), t.startsWith("--"))
    e.setProperty(t, n);
  else {
    const s = Kf(e, t);
    aa.test(n) ? e.setProperty(
      Mn(s),
      n.replace(aa, ""),
      "important"
    ) : e[s] = n;
  }
}
const la = ["Webkit", "Moz", "ms"], ri = {};
function Kf(e, t) {
  const n = ri[t];
  if (n)
    return n;
  let s = Ln(t);
  if (s !== "filter" && s in e)
    return ri[t] = s;
  s = ja(s);
  for (let r = 0; r < la.length; r++) {
    const i = la[r] + s;
    if (i in e)
      return ri[t] = i;
  }
  return t;
}
const ca = "http://www.w3.org/1999/xlink";
function ua(e, t, n, s, r, i = Jc(t)) {
  s && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(ca, t.slice(6, t.length)) : e.setAttributeNS(ca, t, n) : n == null || i && !Va(n) ? e.removeAttribute(t) : e.setAttribute(
    t,
    i ? "" : Nn(n) ? String(n) : n
  );
}
function fa(e, t, n, s, r) {
  if (t === "innerHTML" || t === "textContent") {
    n != null && (e[t] = t === "innerHTML" ? zl(n) : n);
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
    a === "boolean" ? n = Va(n) : n == null && a === "string" ? (n = "", o = !0) : a === "number" && (n = 0, o = !0);
  }
  try {
    e[t] = n;
  } catch {
  }
  o && e.removeAttribute(r || t);
}
function Qn(e, t, n, s) {
  e.addEventListener(t, n, s);
}
function Gf(e, t, n, s) {
  e.removeEventListener(t, n, s);
}
const ha = Symbol("_vei");
function Yf(e, t, n, s, r = null) {
  const i = e[ha] || (e[ha] = {}), o = i[t];
  if (s && o)
    o.value = s;
  else {
    const [a, l] = Xf(t);
    if (s) {
      const h = i[t] = Qf(
        s,
        r
      );
      Qn(e, a, h, l);
    } else o && (Gf(e, a, o, l), i[t] = void 0);
  }
}
const da = /(?:Once|Passive|Capture)$/;
function Xf(e) {
  let t;
  if (da.test(e)) {
    t = {};
    let s;
    for (; s = e.match(da); )
      e = e.slice(0, e.length - s[0].length), t[s[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : Mn(e.slice(2)), t];
}
let ii = 0;
const Zf = /* @__PURE__ */ Promise.resolve(), Jf = () => ii || (Zf.then(() => ii = 0), ii = Date.now());
function Qf(e, t) {
  const n = (s) => {
    if (!s._vts)
      s._vts = Date.now();
    else if (s._vts <= n.attached)
      return;
    an(
      eh(s, n.value),
      t,
      5,
      [s]
    );
  };
  return n.value = e, n.attached = Jf(), n;
}
function eh(e, t) {
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
const pa = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, th = (e, t, n, s, r, i) => {
  const o = r === "svg";
  t === "class" ? Hf(e, s, o) : t === "style" ? Vf(e, n, s) : Ir(t) ? Wi(t) || Yf(e, t, n, s, i) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : nh(e, t, s, o)) ? (fa(e, t, s), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && ua(e, t, s, o, i, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !pt(s)) ? fa(e, Ln(t), s, i, t) : (t === "true-value" ? e._trueValue = s : t === "false-value" && (e._falseValue = s), ua(e, t, s, o));
};
function nh(e, t, n, s) {
  if (s)
    return !!(t === "innerHTML" || t === "textContent" || t in e && pa(t) && _e(n));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const r = e.tagName;
    if (r === "IMG" || r === "VIDEO" || r === "CANVAS" || r === "SOURCE")
      return !1;
  }
  return pa(t) && pt(n) ? !1 : t in e;
}
const ga = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return he(t) ? (n) => lr(t, n) : t;
};
function sh(e) {
  e.target.composing = !0;
}
function ma(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const oi = Symbol("_assign"), zn = {
  created(e, { modifiers: { lazy: t, trim: n, number: s } }, r) {
    e[oi] = ga(r);
    const i = s || r.props && r.props.type === "number";
    Qn(e, t ? "change" : "input", (o) => {
      if (o.target.composing) return;
      let a = e.value;
      n && (a = a.trim()), i && (a = vi(a)), e[oi](a);
    }), n && Qn(e, "change", () => {
      e.value = e.value.trim();
    }), t || (Qn(e, "compositionstart", sh), Qn(e, "compositionend", ma), Qn(e, "change", ma));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t }) {
    e.value = t ?? "";
  },
  beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: s, trim: r, number: i } }, o) {
    if (e[oi] = ga(o), e.composing) return;
    const a = (i || e.type === "number") && !/^0\d/.test(e.value) ? vi(e.value) : e.value, l = t ?? "";
    a !== l && (document.activeElement === e && e.type !== "range" && (s && t === n || r && e.value.trim() === l) || (e.value = l));
  }
}, rh = ["ctrl", "shift", "alt", "meta"], ih = {
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
  exact: (e, t) => rh.some((n) => e[`${n}Key`] && !t.includes(n))
}, Zn = (e, t) => {
  const n = e._withMods || (e._withMods = {}), s = t.join(".");
  return n[s] || (n[s] = (r, ...i) => {
    for (let o = 0; o < t.length; o++) {
      const a = ih[t[o]];
      if (a && a(r, t)) return;
    }
    return e(r, ...i);
  });
}, oh = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, ai = (e, t) => {
  const n = e._withKeys || (e._withKeys = {}), s = t.join(".");
  return n[s] || (n[s] = (r) => {
    if (!("key" in r))
      return;
    const i = Mn(r.key);
    if (t.some(
      (o) => o === i || oh[o] === i
    ))
      return e(r);
  });
}, ah = /* @__PURE__ */ kt({ patchProp: th }, Uf);
let _a;
function lh() {
  return _a || (_a = cf(ah));
}
const ch = (...e) => {
  const t = lh().createApp(...e), { mount: n } = t;
  return t.mount = (s) => {
    const r = fh(s);
    if (!r) return;
    const i = t._component;
    !_e(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
    const o = n(r, !1, uh(r));
    return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), o;
  }, t;
};
function uh(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function fh(e) {
  return pt(e) ? document.querySelector(e) : e;
}
const Tn = (e) => {
  const t = e.replace("#", ""), n = parseInt(t.substr(0, 2), 16), s = parseInt(t.substr(2, 2), 16), r = parseInt(t.substr(4, 2), 16);
  return (n * 299 + s * 587 + r * 114) / 1e3 < 128;
}, hh = (e, t) => {
  const n = e.replace("#", ""), s = parseInt(n.substr(0, 2), 16), r = parseInt(n.substr(2, 2), 16), i = parseInt(n.substr(4, 2), 16), o = Tn(e), a = o ? Math.min(255, s + t) : Math.max(0, s - t), l = o ? Math.min(255, r + t) : Math.max(0, r - t), h = o ? Math.min(255, i + t) : Math.max(0, i - t);
  return `#${a.toString(16).padStart(2, "0")}${l.toString(16).padStart(2, "0")}${h.toString(16).padStart(2, "0")}`;
}, _s = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e), dh = (e) => {
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
function io() {
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
var jn = io();
function Wl(e) {
  jn = e;
}
var Ds = { exec: () => null };
function ze(e, t = "") {
  let n = typeof e == "string" ? e : e.source;
  const s = {
    replace: (r, i) => {
      let o = typeof i == "string" ? i : i.source;
      return o = o.replace(Et.caret, "$1"), n = n.replace(r, o), s;
    },
    getRegex: () => new RegExp(n, t)
  };
  return s;
}
var Et = {
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
}, ph = /^(?:[ \t]*(?:\n|$))+/, gh = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/, mh = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, Vs = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, _h = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, oo = /(?:[*+-]|\d{1,9}[.)])/, ql = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/, jl = ze(ql).replace(/bull/g, oo).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(), bh = ze(ql).replace(/bull/g, oo).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(), ao = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/, vh = /^[^\n]+/, lo = /(?!\s*\])(?:\\.|[^\[\]\\])+/, yh = ze(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", lo).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), wh = ze(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, oo).getRegex(), zr = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", co = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, kh = ze(
  "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))",
  "i"
).replace("comment", co).replace("tag", zr).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), Vl = ze(ao).replace("hr", Vs).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", zr).getRegex(), xh = ze(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", Vl).getRegex(), uo = {
  blockquote: xh,
  code: gh,
  def: yh,
  fences: mh,
  heading: _h,
  hr: Vs,
  html: kh,
  lheading: jl,
  list: wh,
  newline: ph,
  paragraph: Vl,
  table: Ds,
  text: vh
}, ba = ze(
  "^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"
).replace("hr", Vs).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", zr).getRegex(), Ah = {
  ...uo,
  lheading: bh,
  table: ba,
  paragraph: ze(ao).replace("hr", Vs).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", ba).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", zr).getRegex()
}, Th = {
  ...uo,
  html: ze(
    `^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`
  ).replace("comment", co).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
  heading: /^(#{1,6})(.*)(?:\n+|$)/,
  fences: Ds,
  // fences not supported
  lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  paragraph: ze(ao).replace("hr", Vs).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", jl).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
}, Sh = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, Eh = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, Kl = /^( {2,}|\\)\n(?!\s*$)/, Ch = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, Hr = /[\p{P}\p{S}]/u, fo = /[\s\p{P}\p{S}]/u, Gl = /[^\s\p{P}\p{S}]/u, Rh = ze(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, fo).getRegex(), Yl = /(?!~)[\p{P}\p{S}]/u, Ih = /(?!~)[\s\p{P}\p{S}]/u, Lh = /(?:[^\s\p{P}\p{S}]|~)/u, Oh = /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g, Xl = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/, Ph = ze(Xl, "u").replace(/punct/g, Hr).getRegex(), Nh = ze(Xl, "u").replace(/punct/g, Yl).getRegex(), Zl = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", Mh = ze(Zl, "gu").replace(/notPunctSpace/g, Gl).replace(/punctSpace/g, fo).replace(/punct/g, Hr).getRegex(), Fh = ze(Zl, "gu").replace(/notPunctSpace/g, Lh).replace(/punctSpace/g, Ih).replace(/punct/g, Yl).getRegex(), Dh = ze(
  "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)",
  "gu"
).replace(/notPunctSpace/g, Gl).replace(/punctSpace/g, fo).replace(/punct/g, Hr).getRegex(), Bh = ze(/\\(punct)/, "gu").replace(/punct/g, Hr).getRegex(), $h = ze(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), Uh = ze(co).replace("(?:-->|$)", "-->").getRegex(), zh = ze(
  "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>"
).replace("comment", Uh).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), Er = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/, Hh = ze(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", Er).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), Jl = ze(/^!?\[(label)\]\[(ref)\]/).replace("label", Er).replace("ref", lo).getRegex(), Ql = ze(/^!?\[(ref)\](?:\[\])?/).replace("ref", lo).getRegex(), Wh = ze("reflink|nolink(?!\\()", "g").replace("reflink", Jl).replace("nolink", Ql).getRegex(), ho = {
  _backpedal: Ds,
  // only used for GFM url
  anyPunctuation: Bh,
  autolink: $h,
  blockSkip: Oh,
  br: Kl,
  code: Eh,
  del: Ds,
  emStrongLDelim: Ph,
  emStrongRDelimAst: Mh,
  emStrongRDelimUnd: Dh,
  escape: Sh,
  link: Hh,
  nolink: Ql,
  punctuation: Rh,
  reflink: Jl,
  reflinkSearch: Wh,
  tag: zh,
  text: Ch,
  url: Ds
}, qh = {
  ...ho,
  link: ze(/^!?\[(label)\]\((.*?)\)/).replace("label", Er).getRegex(),
  reflink: ze(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", Er).getRegex()
}, Li = {
  ...ho,
  emStrongRDelimAst: Fh,
  emStrongLDelim: Nh,
  url: ze(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, "i").replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
  _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
}, jh = {
  ...Li,
  br: ze(Kl).replace("{2,}", "*").getRegex(),
  text: ze(Li.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
}, sr = {
  normal: uo,
  gfm: Ah,
  pedantic: Th
}, bs = {
  normal: ho,
  gfm: Li,
  breaks: jh,
  pedantic: qh
}, Vh = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}, va = (e) => Vh[e];
function en(e, t) {
  if (t) {
    if (Et.escapeTest.test(e))
      return e.replace(Et.escapeReplace, va);
  } else if (Et.escapeTestNoEncode.test(e))
    return e.replace(Et.escapeReplaceNoEncode, va);
  return e;
}
function ya(e) {
  try {
    e = encodeURI(e).replace(Et.percentDecode, "%");
  } catch {
    return null;
  }
  return e;
}
function wa(e, t) {
  var i;
  const n = e.replace(Et.findPipe, (o, a, l) => {
    let h = !1, c = a;
    for (; --c >= 0 && l[c] === "\\"; ) h = !h;
    return h ? "|" : " |";
  }), s = n.split(Et.splitPipe);
  let r = 0;
  if (s[0].trim() || s.shift(), s.length > 0 && !((i = s.at(-1)) != null && i.trim()) && s.pop(), t)
    if (s.length > t)
      s.splice(t);
    else
      for (; s.length < t; ) s.push("");
  for (; r < s.length; r++)
    s[r] = s[r].trim().replace(Et.slashPipe, "|");
  return s;
}
function vs(e, t, n) {
  const s = e.length;
  if (s === 0)
    return "";
  let r = 0;
  for (; r < s && e.charAt(s - r - 1) === t; )
    r++;
  return e.slice(0, s - r);
}
function Kh(e, t) {
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
function ka(e, t, n, s, r) {
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
function Gh(e, t, n) {
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
var Cr = class {
  // set by the lexer
  constructor(e) {
    Ye(this, "options");
    Ye(this, "rules");
    // set by the lexer
    Ye(this, "lexer");
    this.options = e || jn;
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
        text: this.options.pedantic ? n : vs(n, `
`)
      };
    }
  }
  fences(e) {
    const t = this.rules.block.fences.exec(e);
    if (t) {
      const n = t[0], s = Gh(n, t[3] || "", this.rules);
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
        const s = vs(n, "#");
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
        raw: vs(t[0], `
`)
      };
  }
  blockquote(e) {
    const t = this.rules.block.blockquote.exec(e);
    if (t) {
      let n = vs(t[0], `
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
        const y = this.lexer.state.top;
        if (this.lexer.state.top = !0, this.lexer.blockTokens(c, i, !0), this.lexer.state.top = y, n.length === 0)
          break;
        const _ = i.at(-1);
        if ((_ == null ? void 0 : _.type) === "code")
          break;
        if ((_ == null ? void 0 : _.type) === "blockquote") {
          const M = _, $ = M.raw + `
` + n.join(`
`), Y = this.blockquote($);
          i[i.length - 1] = Y, s = s.substring(0, s.length - M.raw.length) + Y.raw, r = r.substring(0, r.length - M.text.length) + Y.text;
          break;
        } else if ((_ == null ? void 0 : _.type) === "list") {
          const M = _, $ = M.raw + `
` + n.join(`
`), Y = this.list($);
          i[i.length - 1] = Y, s = s.substring(0, s.length - _.raw.length) + Y.raw, r = r.substring(0, r.length - M.raw.length) + Y.raw, n = $.substring(i.at(-1).raw.length).split(`
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
        let y = t[2].split(`
`, 1)[0].replace(this.rules.other.listReplaceTabs, (ne) => " ".repeat(3 * ne.length)), _ = e.split(`
`, 1)[0], M = !y.trim(), $ = 0;
        if (this.options.pedantic ? ($ = 2, c = y.trimStart()) : M ? $ = t[1].length + 1 : ($ = t[2].search(this.rules.other.nonSpaceChar), $ = $ > 4 ? 1 : $, c = y.slice($), $ += t[1].length), M && this.rules.other.blankLine.test(_) && (h += _ + `
`, e = e.substring(_.length + 1), l = !0), !l) {
          const ne = this.rules.other.nextBulletRegex($), Ce = this.rules.other.hrRegex($), xe = this.rules.other.fencesBeginRegex($), z = this.rules.other.headingBeginRegex($), W = this.rules.other.htmlBeginRegex($);
          for (; e; ) {
            const ee = e.split(`
`, 1)[0];
            let V;
            if (_ = ee, this.options.pedantic ? (_ = _.replace(this.rules.other.listReplaceNesting, "  "), V = _) : V = _.replace(this.rules.other.tabCharGlobal, "    "), xe.test(_) || z.test(_) || W.test(_) || ne.test(_) || Ce.test(_))
              break;
            if (V.search(this.rules.other.nonSpaceChar) >= $ || !_.trim())
              c += `
` + V.slice($);
            else {
              if (M || y.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || xe.test(y) || z.test(y) || Ce.test(y))
                break;
              c += `
` + _;
            }
            !M && !_.trim() && (M = !0), h += ee + `
`, e = e.substring(ee.length + 1), y = V.slice($);
          }
        }
        r.loose || (o ? r.loose = !0 : this.rules.other.doubleBlankLine.test(h) && (o = !0));
        let Y = null, Re;
        this.options.gfm && (Y = this.rules.other.listIsTask.exec(c), Y && (Re = Y[0] !== "[ ] ", c = c.replace(this.rules.other.listReplaceTask, ""))), r.items.push({
          type: "list_item",
          raw: h,
          task: !!Y,
          checked: Re,
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
          const h = r.items[l].tokens.filter((y) => y.type === "space"), c = h.length > 0 && h.some((y) => this.rules.other.anyLine.test(y.raw));
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
    const n = wa(t[1]), s = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), r = (o = t[3]) != null && o.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
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
        i.rows.push(wa(a, i.header.length).map((l, h) => ({
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
        const i = vs(n.slice(0, -1), "\\");
        if ((n.length - i.length) % 2 === 0)
          return;
      } else {
        const i = Kh(t[2], "()");
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
      return s = s.trim(), this.rules.other.startAngleBracket.test(s) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n) ? s = s.slice(1) : s = s.slice(1, -1)), ka(t, {
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
      return ka(n, r, n[0], this.lexer, this.rules);
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
        const y = [...s[0]][0].length, _ = e.slice(0, i + s.index + y + a);
        if (Math.min(i, a) % 2) {
          const $ = _.slice(1, -1);
          return {
            type: "em",
            raw: _,
            text: $,
            tokens: this.lexer.inlineTokens($)
          };
        }
        const M = _.slice(2, -2);
        return {
          type: "strong",
          raw: _,
          text: M,
          tokens: this.lexer.inlineTokens(M)
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
}, _n = class Oi {
  constructor(t) {
    Ye(this, "tokens");
    Ye(this, "options");
    Ye(this, "state");
    Ye(this, "tokenizer");
    Ye(this, "inlineQueue");
    this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = t || jn, this.options.tokenizer = this.options.tokenizer || new Cr(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = {
      inLink: !1,
      inRawBlock: !1,
      top: !0
    };
    const n = {
      other: Et,
      block: sr.normal,
      inline: bs.normal
    };
    this.options.pedantic ? (n.block = sr.pedantic, n.inline = bs.pedantic) : this.options.gfm && (n.block = sr.gfm, this.options.breaks ? n.inline = bs.breaks : n.inline = bs.gfm), this.tokenizer.rules = n;
  }
  /**
   * Expose Rules
   */
  static get rules() {
    return {
      block: sr,
      inline: bs
    };
  }
  /**
   * Static Lex Method
   */
  static lex(t, n) {
    return new Oi(n).lex(t);
  }
  /**
   * Static Lex Inline Method
   */
  static lexInline(t, n) {
    return new Oi(n).inlineTokens(t);
  }
  /**
   * Preprocessing
   */
  lex(t) {
    t = t.replace(Et.carriageReturn, `
`), this.blockTokens(t, this.tokens);
    for (let n = 0; n < this.inlineQueue.length; n++) {
      const s = this.inlineQueue[n];
      this.inlineTokens(s.src, s.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(t, n = [], s = !1) {
    var r, i, o;
    for (this.options.pedantic && (t = t.replace(Et.tabCharGlobal, "    ").replace(Et.spaceLine, "")); t; ) {
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
        let y;
        this.options.extensions.startBlock.forEach((_) => {
          y = _.call({ lexer: this }, c), typeof y == "number" && y >= 0 && (h = Math.min(h, y));
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
      if ((l = (a = this.options.extensions) == null ? void 0 : a.inline) != null && l.some((_) => (c = _.call({ lexer: this }, t, n)) ? (t = t.substring(c.raw.length), n.push(c), !0) : !1))
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
        const _ = n.at(-1);
        c.type === "text" && (_ == null ? void 0 : _.type) === "text" ? (_.raw += c.raw, _.text += c.text) : n.push(c);
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
      let y = t;
      if ((h = this.options.extensions) != null && h.startInline) {
        let _ = 1 / 0;
        const M = t.slice(1);
        let $;
        this.options.extensions.startInline.forEach((Y) => {
          $ = Y.call({ lexer: this }, M), typeof $ == "number" && $ >= 0 && (_ = Math.min(_, $));
        }), _ < 1 / 0 && _ >= 0 && (y = t.substring(0, _ + 1));
      }
      if (c = this.tokenizer.inlineText(y)) {
        t = t.substring(c.raw.length), c.raw.slice(-1) !== "_" && (o = c.raw.slice(-1)), i = !0;
        const _ = n.at(-1);
        (_ == null ? void 0 : _.type) === "text" ? (_.raw += c.raw, _.text += c.text) : n.push(c);
        continue;
      }
      if (t) {
        const _ = "Infinite loop on byte: " + t.charCodeAt(0);
        if (this.options.silent) {
          console.error(_);
          break;
        } else
          throw new Error(_);
      }
    }
    return n;
  }
}, Rr = class {
  // set by the parser
  constructor(e) {
    Ye(this, "options");
    Ye(this, "parser");
    this.options = e || jn;
  }
  space(e) {
    return "";
  }
  code({ text: e, lang: t, escaped: n }) {
    var i;
    const s = (i = (t || "").match(Et.notSpaceStart)) == null ? void 0 : i[0], r = e.replace(Et.endingNewline, "") + `
`;
    return s ? '<pre><code class="language-' + en(s) + '">' + (n ? r : en(r, !0)) + `</code></pre>
` : "<pre><code>" + (n ? r : en(r, !0)) + `</code></pre>
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
      e.loose ? ((n = e.tokens[0]) == null ? void 0 : n.type) === "paragraph" ? (e.tokens[0].text = s + " " + e.tokens[0].text, e.tokens[0].tokens && e.tokens[0].tokens.length > 0 && e.tokens[0].tokens[0].type === "text" && (e.tokens[0].tokens[0].text = s + " " + en(e.tokens[0].tokens[0].text), e.tokens[0].tokens[0].escaped = !0)) : e.tokens.unshift({
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
    return `<code>${en(e, !0)}</code>`;
  }
  br(e) {
    return "<br>";
  }
  del({ tokens: e }) {
    return `<del>${this.parser.parseInline(e)}</del>`;
  }
  link({ href: e, title: t, tokens: n }) {
    const s = this.parser.parseInline(n), r = ya(e);
    if (r === null)
      return s;
    e = r;
    let i = '<a href="' + e + '"';
    return t && (i += ' title="' + en(t) + '"'), i += ">" + s + "</a>", i;
  }
  image({ href: e, title: t, text: n, tokens: s }) {
    s && (n = this.parser.parseInline(s, this.parser.textRenderer));
    const r = ya(e);
    if (r === null)
      return en(n);
    e = r;
    let i = `<img src="${e}" alt="${n}"`;
    return t && (i += ` title="${en(t)}"`), i += ">", i;
  }
  text(e) {
    return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : en(e.text);
  }
}, po = class {
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
}, bn = class Pi {
  constructor(t) {
    Ye(this, "options");
    Ye(this, "renderer");
    Ye(this, "textRenderer");
    this.options = t || jn, this.options.renderer = this.options.renderer || new Rr(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new po();
  }
  /**
   * Static Parse Method
   */
  static parse(t, n) {
    return new Pi(n).parse(t);
  }
  /**
   * Static Parse Inline Method
   */
  static parseInline(t, n) {
    return new Pi(n).parseInline(t);
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
}, _i, dr = (_i = class {
  constructor(e) {
    Ye(this, "options");
    Ye(this, "block");
    this.options = e || jn;
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
    return this.block ? bn.parse : bn.parseInline;
  }
}, Ye(_i, "passThroughHooks", /* @__PURE__ */ new Set([
  "preprocess",
  "postprocess",
  "processAllTokens"
])), _i), Yh = class {
  constructor(...e) {
    Ye(this, "defaults", io());
    Ye(this, "options", this.setOptions);
    Ye(this, "parse", this.parseMarkdown(!0));
    Ye(this, "parseInline", this.parseMarkdown(!1));
    Ye(this, "Parser", bn);
    Ye(this, "Renderer", Rr);
    Ye(this, "TextRenderer", po);
    Ye(this, "Lexer", _n);
    Ye(this, "Tokenizer", Cr);
    Ye(this, "Hooks", dr);
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
        const r = this.defaults.renderer || new Rr(this.defaults);
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
        const r = this.defaults.tokenizer || new Cr(this.defaults);
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
        const r = this.defaults.hooks || new dr();
        for (const i in n.hooks) {
          if (!(i in r))
            throw new Error(`hook '${i}' does not exist`);
          if (["options", "block"].includes(i))
            continue;
          const o = i, a = n.hooks[o], l = r[o];
          dr.passThroughHooks.has(i) ? r[o] = (h) => {
            if (this.defaults.async)
              return Promise.resolve(a.call(r, h)).then((y) => l.call(r, y));
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
    return _n.lex(e, t ?? this.defaults);
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
      const a = i.hooks ? i.hooks.provideLexer() : e ? _n.lex : _n.lexInline, l = i.hooks ? i.hooks.provideParser() : e ? bn.parse : bn.parseInline;
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
        const s = "<p>An error occurred:</p><pre>" + en(n.message + "", !0) + "</pre>";
        return t ? Promise.resolve(s) : s;
      }
      if (t)
        return Promise.reject(n);
      throw n;
    };
  }
}, qn = new Yh();
function Oe(e, t) {
  return qn.parse(e, t);
}
Oe.options = Oe.setOptions = function(e) {
  return qn.setOptions(e), Oe.defaults = qn.defaults, Wl(Oe.defaults), Oe;
};
Oe.getDefaults = io;
Oe.defaults = jn;
Oe.use = function(...e) {
  return qn.use(...e), Oe.defaults = qn.defaults, Wl(Oe.defaults), Oe;
};
Oe.walkTokens = function(e, t) {
  return qn.walkTokens(e, t);
};
Oe.parseInline = qn.parseInline;
Oe.Parser = bn;
Oe.parser = bn.parse;
Oe.Renderer = Rr;
Oe.TextRenderer = po;
Oe.Lexer = _n;
Oe.lexer = _n.lex;
Oe.Tokenizer = Cr;
Oe.Hooks = dr;
Oe.parse = Oe;
Oe.options;
Oe.setOptions;
Oe.use;
Oe.walkTokens;
Oe.parseInline;
bn.parse;
_n.lex;
/*! @license DOMPurify 3.2.6 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.2.6/LICENSE */
const {
  entries: ec,
  setPrototypeOf: xa,
  isFrozen: Xh,
  getPrototypeOf: Zh,
  getOwnPropertyDescriptor: Jh
} = Object;
let {
  freeze: Ct,
  seal: Ht,
  create: tc
} = Object, {
  apply: Ni,
  construct: Mi
} = typeof Reflect < "u" && Reflect;
Ct || (Ct = function(t) {
  return t;
});
Ht || (Ht = function(t) {
  return t;
});
Ni || (Ni = function(t, n, s) {
  return t.apply(n, s);
});
Mi || (Mi = function(t, n) {
  return new t(...n);
});
const rr = Rt(Array.prototype.forEach), Qh = Rt(Array.prototype.lastIndexOf), Aa = Rt(Array.prototype.pop), ys = Rt(Array.prototype.push), ed = Rt(Array.prototype.splice), pr = Rt(String.prototype.toLowerCase), li = Rt(String.prototype.toString), Ta = Rt(String.prototype.match), ws = Rt(String.prototype.replace), td = Rt(String.prototype.indexOf), nd = Rt(String.prototype.trim), Kt = Rt(Object.prototype.hasOwnProperty), xt = Rt(RegExp.prototype.test), ks = sd(TypeError);
function Rt(e) {
  return function(t) {
    t instanceof RegExp && (t.lastIndex = 0);
    for (var n = arguments.length, s = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
      s[r - 1] = arguments[r];
    return Ni(e, t, s);
  };
}
function sd(e) {
  return function() {
    for (var t = arguments.length, n = new Array(t), s = 0; s < t; s++)
      n[s] = arguments[s];
    return Mi(e, n);
  };
}
function Ee(e, t) {
  let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : pr;
  xa && xa(e, null);
  let s = t.length;
  for (; s--; ) {
    let r = t[s];
    if (typeof r == "string") {
      const i = n(r);
      i !== r && (Xh(t) || (t[s] = i), r = i);
    }
    e[r] = !0;
  }
  return e;
}
function rd(e) {
  for (let t = 0; t < e.length; t++)
    Kt(e, t) || (e[t] = null);
  return e;
}
function hn(e) {
  const t = tc(null);
  for (const [n, s] of ec(e))
    Kt(e, n) && (Array.isArray(s) ? t[n] = rd(s) : s && typeof s == "object" && s.constructor === Object ? t[n] = hn(s) : t[n] = s);
  return t;
}
function xs(e, t) {
  for (; e !== null; ) {
    const s = Jh(e, t);
    if (s) {
      if (s.get)
        return Rt(s.get);
      if (typeof s.value == "function")
        return Rt(s.value);
    }
    e = Zh(e);
  }
  function n() {
    return null;
  }
  return n;
}
const Sa = Ct(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "section", "select", "shadow", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]), ci = Ct(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]), ui = Ct(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]), id = Ct(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]), fi = Ct(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]), od = Ct(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]), Ea = Ct(["#text"]), Ca = Ct(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns", "slot"]), hi = Ct(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]), Ra = Ct(["accent", "accentunder", "align", "bevelled", "close", "columnsalign", "columnlines", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lspace", "lquote", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]), ir = Ct(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]), ad = Ht(/\{\{[\w\W]*|[\w\W]*\}\}/gm), ld = Ht(/<%[\w\W]*|[\w\W]*%>/gm), cd = Ht(/\$\{[\w\W]*/gm), ud = Ht(/^data-[\-\w.\u00B7-\uFFFF]+$/), fd = Ht(/^aria-[\-\w]+$/), nc = Ht(
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  // eslint-disable-line no-useless-escape
), hd = Ht(/^(?:\w+script|data):/i), dd = Ht(
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g
  // eslint-disable-line no-control-regex
), sc = Ht(/^html$/i), pd = Ht(/^[a-z][.\w]*(-[.\w]+)+$/i);
var Ia = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ARIA_ATTR: fd,
  ATTR_WHITESPACE: dd,
  CUSTOM_ELEMENT: pd,
  DATA_ATTR: ud,
  DOCTYPE_NAME: sc,
  ERB_EXPR: ld,
  IS_ALLOWED_URI: nc,
  IS_SCRIPT_OR_DATA: hd,
  MUSTACHE_EXPR: ad,
  TMPLIT_EXPR: cd
});
const As = {
  element: 1,
  text: 3,
  // Deprecated
  progressingInstruction: 7,
  comment: 8,
  document: 9
}, gd = function() {
  return typeof window > "u" ? null : window;
}, md = function(t, n) {
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
}, La = function() {
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
function rc() {
  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : gd();
  const t = (Z) => rc(Z);
  if (t.version = "3.2.6", t.removed = [], !e || !e.document || e.document.nodeType !== As.document || !e.Element)
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
    HTMLFormElement: y,
    DOMParser: _,
    trustedTypes: M
  } = e, $ = l.prototype, Y = xs($, "cloneNode"), Re = xs($, "remove"), ne = xs($, "nextSibling"), Ce = xs($, "childNodes"), xe = xs($, "parentNode");
  if (typeof o == "function") {
    const Z = n.createElement("template");
    Z.content && Z.content.ownerDocument && (n = Z.content.ownerDocument);
  }
  let z, W = "";
  const {
    implementation: ee,
    createNodeIterator: V,
    createDocumentFragment: Pe,
    getElementsByTagName: rt
  } = n, {
    importNode: je
  } = s;
  let Ae = La();
  t.isSupported = typeof ec == "function" && typeof xe == "function" && ee && ee.createHTMLDocument !== void 0;
  const {
    MUSTACHE_EXPR: ge,
    ERB_EXPR: Ve,
    TMPLIT_EXPR: Je,
    DATA_ATTR: at,
    ARIA_ATTR: oe,
    IS_SCRIPT_OR_DATA: me,
    ATTR_WHITESPACE: ae,
    CUSTOM_ELEMENT: ut
  } = Ia;
  let {
    IS_ALLOWED_URI: it
  } = Ia, ie = null;
  const nt = Ee({}, [...Sa, ...ci, ...ui, ...fi, ...Ea]);
  let be = null;
  const q = Ee({}, [...Ca, ...hi, ...Ra, ...ir]);
  let de = Object.seal(tc(null, {
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
  })), re = null, j = null, He = !0, Ke = !0, gt = !1, It = !0, d = !1, b = !0, k = !1, L = !1, R = !1, I = !1, B = !1, D = !1, F = !0, P = !1;
  const X = "user-content-";
  let U = !0, K = !1, Q = {}, ue = null;
  const Te = Ee({}, ["annotation-xml", "audio", "colgroup", "desc", "foreignobject", "head", "iframe", "math", "mi", "mn", "mo", "ms", "mtext", "noembed", "noframes", "noscript", "plaintext", "script", "style", "svg", "template", "thead", "title", "video", "xmp"]);
  let pe = null;
  const Fe = Ee({}, ["audio", "video", "img", "source", "image", "track"]);
  let De = null;
  const Qe = Ee({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), u = "http://www.w3.org/1998/Math/MathML", v = "http://www.w3.org/2000/svg", A = "http://www.w3.org/1999/xhtml";
  let x = A, N = !1, G = null;
  const te = Ee({}, [u, v, A], li);
  let ve = Ee({}, ["mi", "mo", "mn", "ms", "mtext"]), Se = Ee({}, ["annotation-xml"]);
  const Ge = Ee({}, ["title", "style", "font", "a", "script"]);
  let Ne = null;
  const ht = ["application/xhtml+xml", "text/html"], vt = "text/html";
  let We = null, Xt = null;
  const as = n.createElement("form"), Fn = function(m) {
    return m instanceof RegExp || m instanceof Function;
  }, Vn = function() {
    let m = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (!(Xt && Xt === m)) {
      if ((!m || typeof m != "object") && (m = {}), m = hn(m), Ne = // eslint-disable-next-line unicorn/prefer-includes
      ht.indexOf(m.PARSER_MEDIA_TYPE) === -1 ? vt : m.PARSER_MEDIA_TYPE, We = Ne === "application/xhtml+xml" ? li : pr, ie = Kt(m, "ALLOWED_TAGS") ? Ee({}, m.ALLOWED_TAGS, We) : nt, be = Kt(m, "ALLOWED_ATTR") ? Ee({}, m.ALLOWED_ATTR, We) : q, G = Kt(m, "ALLOWED_NAMESPACES") ? Ee({}, m.ALLOWED_NAMESPACES, li) : te, De = Kt(m, "ADD_URI_SAFE_ATTR") ? Ee(hn(Qe), m.ADD_URI_SAFE_ATTR, We) : Qe, pe = Kt(m, "ADD_DATA_URI_TAGS") ? Ee(hn(Fe), m.ADD_DATA_URI_TAGS, We) : Fe, ue = Kt(m, "FORBID_CONTENTS") ? Ee({}, m.FORBID_CONTENTS, We) : Te, re = Kt(m, "FORBID_TAGS") ? Ee({}, m.FORBID_TAGS, We) : hn({}), j = Kt(m, "FORBID_ATTR") ? Ee({}, m.FORBID_ATTR, We) : hn({}), Q = Kt(m, "USE_PROFILES") ? m.USE_PROFILES : !1, He = m.ALLOW_ARIA_ATTR !== !1, Ke = m.ALLOW_DATA_ATTR !== !1, gt = m.ALLOW_UNKNOWN_PROTOCOLS || !1, It = m.ALLOW_SELF_CLOSE_IN_ATTR !== !1, d = m.SAFE_FOR_TEMPLATES || !1, b = m.SAFE_FOR_XML !== !1, k = m.WHOLE_DOCUMENT || !1, I = m.RETURN_DOM || !1, B = m.RETURN_DOM_FRAGMENT || !1, D = m.RETURN_TRUSTED_TYPE || !1, R = m.FORCE_BODY || !1, F = m.SANITIZE_DOM !== !1, P = m.SANITIZE_NAMED_PROPS || !1, U = m.KEEP_CONTENT !== !1, K = m.IN_PLACE || !1, it = m.ALLOWED_URI_REGEXP || nc, x = m.NAMESPACE || A, ve = m.MATHML_TEXT_INTEGRATION_POINTS || ve, Se = m.HTML_INTEGRATION_POINTS || Se, de = m.CUSTOM_ELEMENT_HANDLING || {}, m.CUSTOM_ELEMENT_HANDLING && Fn(m.CUSTOM_ELEMENT_HANDLING.tagNameCheck) && (de.tagNameCheck = m.CUSTOM_ELEMENT_HANDLING.tagNameCheck), m.CUSTOM_ELEMENT_HANDLING && Fn(m.CUSTOM_ELEMENT_HANDLING.attributeNameCheck) && (de.attributeNameCheck = m.CUSTOM_ELEMENT_HANDLING.attributeNameCheck), m.CUSTOM_ELEMENT_HANDLING && typeof m.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements == "boolean" && (de.allowCustomizedBuiltInElements = m.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements), d && (Ke = !1), B && (I = !0), Q && (ie = Ee({}, Ea), be = [], Q.html === !0 && (Ee(ie, Sa), Ee(be, Ca)), Q.svg === !0 && (Ee(ie, ci), Ee(be, hi), Ee(be, ir)), Q.svgFilters === !0 && (Ee(ie, ui), Ee(be, hi), Ee(be, ir)), Q.mathMl === !0 && (Ee(ie, fi), Ee(be, Ra), Ee(be, ir))), m.ADD_TAGS && (ie === nt && (ie = hn(ie)), Ee(ie, m.ADD_TAGS, We)), m.ADD_ATTR && (be === q && (be = hn(be)), Ee(be, m.ADD_ATTR, We)), m.ADD_URI_SAFE_ATTR && Ee(De, m.ADD_URI_SAFE_ATTR, We), m.FORBID_CONTENTS && (ue === Te && (ue = hn(ue)), Ee(ue, m.FORBID_CONTENTS, We)), U && (ie["#text"] = !0), k && Ee(ie, ["html", "head", "body"]), ie.table && (Ee(ie, ["tbody"]), delete re.tbody), m.TRUSTED_TYPES_POLICY) {
        if (typeof m.TRUSTED_TYPES_POLICY.createHTML != "function")
          throw ks('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
        if (typeof m.TRUSTED_TYPES_POLICY.createScriptURL != "function")
          throw ks('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
        z = m.TRUSTED_TYPES_POLICY, W = z.createHTML("");
      } else
        z === void 0 && (z = md(M, r)), z !== null && typeof W == "string" && (W = z.createHTML(""));
      Ct && Ct(m), Xt = m;
    }
  }, ls = Ee({}, [...ci, ...ui, ...id]), Wt = Ee({}, [...fi, ...od]), Ks = function(m) {
    let O = xe(m);
    (!O || !O.tagName) && (O = {
      namespaceURI: x,
      tagName: "template"
    });
    const H = pr(m.tagName), Me = pr(O.tagName);
    return G[m.namespaceURI] ? m.namespaceURI === v ? O.namespaceURI === A ? H === "svg" : O.namespaceURI === u ? H === "svg" && (Me === "annotation-xml" || ve[Me]) : !!ls[H] : m.namespaceURI === u ? O.namespaceURI === A ? H === "math" : O.namespaceURI === v ? H === "math" && Se[Me] : !!Wt[H] : m.namespaceURI === A ? O.namespaceURI === v && !Se[Me] || O.namespaceURI === u && !ve[Me] ? !1 : !Wt[H] && (Ge[H] || !ls[H]) : !!(Ne === "application/xhtml+xml" && G[m.namespaceURI]) : !1;
  }, _t = function(m) {
    ys(t.removed, {
      element: m
    });
    try {
      xe(m).removeChild(m);
    } catch {
      Re(m);
    }
  }, kn = function(m, O) {
    try {
      ys(t.removed, {
        attribute: O.getAttributeNode(m),
        from: O
      });
    } catch {
      ys(t.removed, {
        attribute: null,
        from: O
      });
    }
    if (O.removeAttribute(m), m === "is")
      if (I || B)
        try {
          _t(O);
        } catch {
        }
      else
        try {
          O.setAttribute(m, "");
        } catch {
        }
  }, Gs = function(m) {
    let O = null, H = null;
    if (R)
      m = "<remove></remove>" + m;
    else {
      const ct = Ta(m, /^[\r\n\t ]+/);
      H = ct && ct[0];
    }
    Ne === "application/xhtml+xml" && x === A && (m = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + m + "</body></html>");
    const Me = z ? z.createHTML(m) : m;
    if (x === A)
      try {
        O = new _().parseFromString(Me, Ne);
      } catch {
      }
    if (!O || !O.documentElement) {
      O = ee.createDocument(x, "template", null);
      try {
        O.documentElement.innerHTML = N ? W : Me;
      } catch {
      }
    }
    const lt = O.body || O.documentElement;
    return m && H && lt.insertBefore(n.createTextNode(H), lt.childNodes[0] || null), x === A ? rt.call(O, k ? "html" : "body")[0] : k ? O.documentElement : lt;
  }, cs = function(m) {
    return V.call(
      m.ownerDocument || m,
      m,
      // eslint-disable-next-line no-bitwise
      h.SHOW_ELEMENT | h.SHOW_COMMENT | h.SHOW_TEXT | h.SHOW_PROCESSING_INSTRUCTION | h.SHOW_CDATA_SECTION,
      null
    );
  }, cn = function(m) {
    return m instanceof y && (typeof m.nodeName != "string" || typeof m.textContent != "string" || typeof m.removeChild != "function" || !(m.attributes instanceof c) || typeof m.removeAttribute != "function" || typeof m.setAttribute != "function" || typeof m.namespaceURI != "string" || typeof m.insertBefore != "function" || typeof m.hasChildNodes != "function");
  }, Ys = function(m) {
    return typeof a == "function" && m instanceof a;
  };
  function Lt(Z, m, O) {
    rr(Z, (H) => {
      H.call(t, m, O, Xt);
    });
  }
  const Xs = function(m) {
    let O = null;
    if (Lt(Ae.beforeSanitizeElements, m, null), cn(m))
      return _t(m), !0;
    const H = We(m.nodeName);
    if (Lt(Ae.uponSanitizeElement, m, {
      tagName: H,
      allowedTags: ie
    }), b && m.hasChildNodes() && !Ys(m.firstElementChild) && xt(/<[/\w!]/g, m.innerHTML) && xt(/<[/\w!]/g, m.textContent) || m.nodeType === As.progressingInstruction || b && m.nodeType === As.comment && xt(/<[/\w]/g, m.data))
      return _t(m), !0;
    if (!ie[H] || re[H]) {
      if (!re[H] && Dn(H) && (de.tagNameCheck instanceof RegExp && xt(de.tagNameCheck, H) || de.tagNameCheck instanceof Function && de.tagNameCheck(H)))
        return !1;
      if (U && !ue[H]) {
        const Me = xe(m) || m.parentNode, lt = Ce(m) || m.childNodes;
        if (lt && Me) {
          const ct = lt.length;
          for (let ft = ct - 1; ft >= 0; --ft) {
            const st = Y(lt[ft], !0);
            st.__removalCount = (m.__removalCount || 0) + 1, Me.insertBefore(st, ne(m));
          }
        }
      }
      return _t(m), !0;
    }
    return m instanceof l && !Ks(m) || (H === "noscript" || H === "noembed" || H === "noframes") && xt(/<\/no(script|embed|frames)/i, m.innerHTML) ? (_t(m), !0) : (d && m.nodeType === As.text && (O = m.textContent, rr([ge, Ve, Je], (Me) => {
      O = ws(O, Me, " ");
    }), m.textContent !== O && (ys(t.removed, {
      element: m.cloneNode()
    }), m.textContent = O)), Lt(Ae.afterSanitizeElements, m, null), !1);
  }, us = function(m, O, H) {
    if (F && (O === "id" || O === "name") && (H in n || H in as))
      return !1;
    if (!(Ke && !j[O] && xt(at, O))) {
      if (!(He && xt(oe, O))) {
        if (!be[O] || j[O]) {
          if (
            // First condition does a very basic check if a) it's basically a valid custom element tagname AND
            // b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
            // and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
            !(Dn(m) && (de.tagNameCheck instanceof RegExp && xt(de.tagNameCheck, m) || de.tagNameCheck instanceof Function && de.tagNameCheck(m)) && (de.attributeNameCheck instanceof RegExp && xt(de.attributeNameCheck, O) || de.attributeNameCheck instanceof Function && de.attributeNameCheck(O)) || // Alternative, second condition checks if it's an `is`-attribute, AND
            // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
            O === "is" && de.allowCustomizedBuiltInElements && (de.tagNameCheck instanceof RegExp && xt(de.tagNameCheck, H) || de.tagNameCheck instanceof Function && de.tagNameCheck(H)))
          ) return !1;
        } else if (!De[O]) {
          if (!xt(it, ws(H, ae, ""))) {
            if (!((O === "src" || O === "xlink:href" || O === "href") && m !== "script" && td(H, "data:") === 0 && pe[m])) {
              if (!(gt && !xt(me, ws(H, ae, "")))) {
                if (H)
                  return !1;
              }
            }
          }
        }
      }
    }
    return !0;
  }, Dn = function(m) {
    return m !== "annotation-xml" && Ta(m, ut);
  }, Kn = function(m) {
    Lt(Ae.beforeSanitizeAttributes, m, null);
    const {
      attributes: O
    } = m;
    if (!O || cn(m))
      return;
    const H = {
      attrName: "",
      attrValue: "",
      keepAttr: !0,
      allowedAttributes: be,
      forceKeepAttr: void 0
    };
    let Me = O.length;
    for (; Me--; ) {
      const lt = O[Me], {
        name: ct,
        namespaceURI: ft,
        value: st
      } = lt, Zt = We(ct), un = st;
      let mt = ct === "value" ? un : nd(un);
      if (H.attrName = Zt, H.attrValue = mt, H.keepAttr = !0, H.forceKeepAttr = void 0, Lt(Ae.uponSanitizeAttribute, m, H), mt = H.attrValue, P && (Zt === "id" || Zt === "name") && (kn(ct, m), mt = X + mt), b && xt(/((--!?|])>)|<\/(style|title)/i, mt)) {
        kn(ct, m);
        continue;
      }
      if (H.forceKeepAttr)
        continue;
      if (!H.keepAttr) {
        kn(ct, m);
        continue;
      }
      if (!It && xt(/\/>/i, mt)) {
        kn(ct, m);
        continue;
      }
      d && rr([ge, Ve, Je], (Js) => {
        mt = ws(mt, Js, " ");
      });
      const Zs = We(m.nodeName);
      if (!us(Zs, Zt, mt)) {
        kn(ct, m);
        continue;
      }
      if (z && typeof M == "object" && typeof M.getAttributeType == "function" && !ft)
        switch (M.getAttributeType(Zs, Zt)) {
          case "TrustedHTML": {
            mt = z.createHTML(mt);
            break;
          }
          case "TrustedScriptURL": {
            mt = z.createScriptURL(mt);
            break;
          }
        }
      if (mt !== un)
        try {
          ft ? m.setAttributeNS(ft, ct, mt) : m.setAttribute(ct, mt), cn(m) ? _t(m) : Aa(t.removed);
        } catch {
          kn(ct, m);
        }
    }
    Lt(Ae.afterSanitizeAttributes, m, null);
  }, Dt = function Z(m) {
    let O = null;
    const H = cs(m);
    for (Lt(Ae.beforeSanitizeShadowDOM, m, null); O = H.nextNode(); )
      Lt(Ae.uponSanitizeShadowNode, O, null), Xs(O), Kn(O), O.content instanceof i && Z(O.content);
    Lt(Ae.afterSanitizeShadowDOM, m, null);
  };
  return t.sanitize = function(Z) {
    let m = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, O = null, H = null, Me = null, lt = null;
    if (N = !Z, N && (Z = "<!-->"), typeof Z != "string" && !Ys(Z))
      if (typeof Z.toString == "function") {
        if (Z = Z.toString(), typeof Z != "string")
          throw ks("dirty is not a string, aborting");
      } else
        throw ks("toString is not a function");
    if (!t.isSupported)
      return Z;
    if (L || Vn(m), t.removed = [], typeof Z == "string" && (K = !1), K) {
      if (Z.nodeName) {
        const st = We(Z.nodeName);
        if (!ie[st] || re[st])
          throw ks("root node is forbidden and cannot be sanitized in-place");
      }
    } else if (Z instanceof a)
      O = Gs("<!---->"), H = O.ownerDocument.importNode(Z, !0), H.nodeType === As.element && H.nodeName === "BODY" || H.nodeName === "HTML" ? O = H : O.appendChild(H);
    else {
      if (!I && !d && !k && // eslint-disable-next-line unicorn/prefer-includes
      Z.indexOf("<") === -1)
        return z && D ? z.createHTML(Z) : Z;
      if (O = Gs(Z), !O)
        return I ? null : D ? W : "";
    }
    O && R && _t(O.firstChild);
    const ct = cs(K ? Z : O);
    for (; Me = ct.nextNode(); )
      Xs(Me), Kn(Me), Me.content instanceof i && Dt(Me.content);
    if (K)
      return Z;
    if (I) {
      if (B)
        for (lt = Pe.call(O.ownerDocument); O.firstChild; )
          lt.appendChild(O.firstChild);
      else
        lt = O;
      return (be.shadowroot || be.shadowrootmode) && (lt = je.call(s, lt, !0)), lt;
    }
    let ft = k ? O.outerHTML : O.innerHTML;
    return k && ie["!doctype"] && O.ownerDocument && O.ownerDocument.doctype && O.ownerDocument.doctype.name && xt(sc, O.ownerDocument.doctype.name) && (ft = "<!DOCTYPE " + O.ownerDocument.doctype.name + `>
` + ft), d && rr([ge, Ve, Je], (st) => {
      ft = ws(ft, st, " ");
    }), z && D ? z.createHTML(ft) : ft;
  }, t.setConfig = function() {
    let Z = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    Vn(Z), L = !0;
  }, t.clearConfig = function() {
    Xt = null, L = !1;
  }, t.isValidAttribute = function(Z, m, O) {
    Xt || Vn({});
    const H = We(Z), Me = We(m);
    return us(H, Me, O);
  }, t.addHook = function(Z, m) {
    typeof m == "function" && ys(Ae[Z], m);
  }, t.removeHook = function(Z, m) {
    if (m !== void 0) {
      const O = Qh(Ae[Z], m);
      return O === -1 ? void 0 : ed(Ae[Z], O, 1)[0];
    }
    return Aa(Ae[Z]);
  }, t.removeHooks = function(Z) {
    Ae[Z] = [];
  }, t.removeAllHooks = function() {
    Ae = La();
  }, t;
}
var go = rc();
go.addHook("uponSanitizeElement", (e, t) => {
  var r, i, o, a, l, h;
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
  if (s === "A" || s === "IMG" || s === "AREA" || s === "MAP")
    if (s === "A") {
      const c = n.textContent;
      c ? n.replaceWith(c) : (l = n.parentNode) == null || l.removeChild(n);
    } else
      (h = n.parentNode) == null || h.removeChild(n);
});
go.addHook("afterSanitizeAttributes", (e) => {
  if (e.hasAttribute("href")) {
    const t = e.getAttribute("href") || "";
    try {
      const n = decodeURIComponent(t.toLowerCase());
      (n.includes("javascript:") || n.includes("data:text/html") || n.includes("vbscript:") || n.includes("about:") || n.includes("file:")) && e.removeAttribute("href");
    } catch {
      (t.toLowerCase().includes("javascript:") || t.toLowerCase().includes("data:text/html") || t.toLowerCase().includes("vbscript:") || t.toLowerCase().includes("about:") || t.toLowerCase().includes("file:")) && e.removeAttribute("href");
    }
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
function _d(e) {
  const t = {
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
  return go.sanitize(e, t);
}
const Cs = [
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
], bd = (e) => (e || "").split("").reduce((t, n) => t + n.charCodeAt(0), 0) % Cs.length, vd = (e) => {
  const t = Cs[(e % Cs.length + Cs.length) % Cs.length];
  return {
    background: `
            radial-gradient(circle at 32% 28%, rgba(255,255,255,0.22) 0%, transparent 42%),
            radial-gradient(circle at 68% 72%, rgba(0,0,0,0.25) 0%, transparent 38%),
            radial-gradient(ellipse at 50% 50%, ${t.stops})
        `.trim(),
    boxShadow: `0 4px 28px ${t.glow}, inset 0 1px 0 rgba(255,255,255,0.15)`,
    borderRadius: "50%"
  };
}, yd = (e, t) => {
  const n = typeof t == "number" && Number.isFinite(t) ? t : bd(e);
  return vd(n);
}, mo = (e) => !!e && (/^https?:\/\//i.test(e) || e.startsWith("data:"));
function Oa() {
  return typeof window < "u" && window.APP_CONFIG ? window.APP_CONFIG : {};
}
const Rn = {
  get API_URL() {
    return Oa().API_URL || "https://api.chattermate.chat/api/v1";
  },
  get WS_URL() {
    return Oa().WS_URL || "wss://api.chattermate.chat";
  }
};
function wd(e) {
  const t = Ie(() => ({
    backgroundColor: e.value.chat_background_color || "#ffffff",
    color: Tn(e.value.chat_background_color || "#ffffff") ? "#ffffff" : "#000000"
  })), n = Ie(() => ({
    backgroundColor: e.value.chat_bubble_color || "#C9F24E",
    color: Tn(e.value.chat_bubble_color || "#C9F24E") ? "#FFFFFF" : "#000000"
  })), s = Ie(() => {
    const h = e.value.chat_background_color || "#F8F9FA", c = hh(h, 20);
    return {
      backgroundColor: c,
      color: Tn(c) ? "#FFFFFF" : "#000000"
    };
  }), r = Ie(() => ({
    backgroundColor: e.value.accent_color || "#C9F24E",
    color: Tn(e.value.accent_color || "#C9F24E") ? "#FFFFFF" : "#000000"
  })), i = Ie(() => ({
    color: Tn(e.value.chat_background_color || "#F8F9FA") ? "#FFFFFF" : "#000000"
  })), o = Ie(() => ({
    borderBottom: `1px solid ${Tn(e.value.chat_background_color || "#F8F9FA") ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`
  })), a = Ie(() => e.value.photo_url ? mo(e.value.photo_url) ? e.value.photo_url : `${Rn.API_URL}${e.value.photo_url}` : ""), l = Ie(() => {
    const h = e.value.chat_background_color || "#ffffff";
    return {
      boxShadow: `0 8px 5px ${Tn(h) ? "rgba(0, 0, 0, 0.24)" : "rgba(0, 0, 0, 0.12)"}`
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
const kd = /* @__PURE__ */ new Set(["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]), xd = /* @__PURE__ */ new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);
[...kd, ...xd];
function Ad(e, t) {
  const n = ce([]), s = ce(!1), r = ce(null), i = (W) => {
    if (W === 0) return "0 Bytes";
    const ee = 1024, V = ["Bytes", "KB", "MB", "GB"], Pe = Math.floor(Math.log(W) / Math.log(ee));
    return parseFloat((W / Math.pow(ee, Pe)).toFixed(2)) + " " + V[Pe];
  }, o = (W) => W.startsWith("image/"), a = (W) => W ? W.startsWith("blob:") || W.startsWith("http://") || W.startsWith("https://") ? W : `${Rn.API_URL}${W}` : "", l = (W) => {
    const ee = W.file_url || W.url;
    return ee ? ee.startsWith("blob:") || ee.startsWith("http://") || ee.startsWith("https://") ? ee : `${Rn.API_URL}${ee}` : "";
  }, h = async (W) => {
    const ee = W.target;
    ee.files && ee.files.length > 0 && (await Y(Array.from(ee.files)), ee.value = "");
  }, c = async (W) => {
    var V;
    W.preventDefault();
    const ee = (V = W.dataTransfer) == null ? void 0 : V.files;
    ee && ee.length > 0 && await Y(Array.from(ee));
  }, y = (W) => {
    W.preventDefault();
  }, _ = (W) => {
    W.preventDefault();
  }, M = async (W) => {
    var Pe;
    const ee = (Pe = W.clipboardData) == null ? void 0 : Pe.items;
    if (!ee) return;
    const V = [];
    for (const rt of Array.from(ee))
      if (rt.kind === "file") {
        const je = rt.getAsFile();
        je && V.push(je);
      }
    V.length > 0 && await Y(V);
  }, $ = async (W, ee = 500) => new Promise((V, Pe) => {
    const rt = new FileReader();
    rt.onload = (je) => {
      var ge;
      const Ae = new Image();
      Ae.onload = () => {
        const Ve = document.createElement("canvas");
        let Je = Ae.width, at = Ae.height;
        const oe = 1920;
        (Je > oe || at > oe) && (Je > at ? (at = at / Je * oe, Je = oe) : (Je = Je / at * oe, at = oe)), Ve.width = Je, Ve.height = at;
        const me = Ve.getContext("2d");
        if (!me) {
          Pe(new Error("Failed to get canvas context"));
          return;
        }
        me.drawImage(Ae, 0, 0, Je, at);
        let ae = 0.9;
        const ut = () => {
          Ve.toBlob((it) => {
            if (!it) {
              Pe(new Error("Failed to compress image"));
              return;
            }
            if (it.size / 1024 > ee && ae > 0.3)
              ae -= 0.1, ut();
            else {
              const nt = new FileReader();
              nt.onload = () => {
                const be = nt.result.split(",")[1];
                V({ blob: it, base64: be });
              }, nt.readAsDataURL(it);
            }
          }, W.type === "image/png" ? "image/png" : "image/jpeg", ae);
        };
        ut();
      }, Ae.onerror = () => Pe(new Error("Failed to load image")), Ae.src = (ge = je.target) == null ? void 0 : ge.result;
    }, rt.onerror = () => Pe(new Error("Failed to read file")), rt.readAsDataURL(W);
  }), Y = async (W) => {
    if (n.value.length >= 3) {
      alert("Maximum 3 files allowed per message");
      return;
    }
    const je = 3 - n.value.length, Ae = W.slice(0, je);
    W.length > je && alert(`Only ${je} more file(s) can be uploaded. Maximum 3 files per message.`);
    for (const ge of Ae)
      try {
        if (n.value.some((oe) => oe.filename === ge.name)) {
          console.warn(`File ${ge.name} is already selected`), alert(`File "${ge.name}" is already selected`);
          continue;
        }
        const Je = ge.type.startsWith("image/"), at = Je ? 5242880 : 10485760;
        if (ge.size > at) {
          const oe = at / 1048576;
          console.error(`File ${ge.name} is too large. Maximum size is ${oe}MB`), alert(`File "${ge.name}" is too large. Maximum size for ${Je ? "images" : "documents"} is ${oe}MB`);
          continue;
        }
        if (Je)
          try {
            const { blob: oe, base64: me } = await $(ge, 500), ae = oe.size;
            console.log(`Compressed ${ge.name}: ${(ge.size / 1024).toFixed(2)}KB → ${(ae / 1024).toFixed(2)}KB`), n.value.push({
              content: me,
              filename: ge.name,
              type: ge.type,
              size: ae,
              url: URL.createObjectURL(oe),
              file_url: URL.createObjectURL(oe)
            });
          } catch (oe) {
            console.error("Image compression failed, uploading original:", oe);
            const me = new FileReader();
            me.onload = (ae) => {
              var ie;
              const it = ((ie = ae.target) == null ? void 0 : ie.result).split(",")[1];
              n.value.push({
                content: it,
                filename: ge.name,
                type: ge.type,
                size: ge.size,
                url: URL.createObjectURL(ge),
                file_url: URL.createObjectURL(ge)
              });
            }, me.readAsDataURL(ge);
          }
        else {
          const oe = new FileReader();
          oe.onload = (me) => {
            var it;
            const ut = ((it = me.target) == null ? void 0 : it.result).split(",")[1];
            n.value.push({
              content: ut,
              filename: ge.name,
              type: ge.type || "application/octet-stream",
              size: ge.size,
              url: "",
              file_url: ""
            });
          }, oe.readAsDataURL(ge);
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
    handleDrop: c,
    handleDragOver: y,
    handleDragLeave: _,
    handlePaste: M,
    uploadFiles: Y,
    removeAttachment: async (W) => {
      const ee = n.value[W];
      if (ee) {
        try {
          let V = ee.url;
          if (V.startsWith("/uploads/") ? V = V.substring(9) : V.startsWith("/") && (V = V.substring(1)), mo(V))
            try {
              V = new URL(V).pathname.replace(/^\/+/, "");
            } catch {
            }
          const Pe = {};
          e.value && (Pe.Authorization = `Bearer ${e.value}`);
          const rt = await fetch(`${Rn.API_URL}/api/v1/files/upload/${V}`, {
            method: "DELETE",
            headers: Pe
          });
          if (rt.ok)
            console.log("File deleted successfully from backend.");
          else {
            const je = await rt.json();
            console.error("Failed to delete file:", je.detail);
          }
        } catch (V) {
          console.error("Error calling delete API:", V);
        }
        ee.url && ee.url.startsWith("blob:") && URL.revokeObjectURL(ee.url), ee.file_url && ee.file_url.startsWith("blob:") && URL.revokeObjectURL(ee.file_url), n.value.splice(W, 1);
      }
    },
    openPreview: (W) => {
      r.value = W, s.value = !0;
    },
    closePreview: () => {
      s.value = !1, setTimeout(() => {
        r.value = null;
      }, 300);
    },
    openFilePicker: () => {
      var W;
      (W = t.value) == null || W.click();
    },
    isImage: (W) => W.startsWith("image/")
  };
}
const ln = /* @__PURE__ */ Object.create(null);
ln.open = "0";
ln.close = "1";
ln.ping = "2";
ln.pong = "3";
ln.message = "4";
ln.upgrade = "5";
ln.noop = "6";
const gr = /* @__PURE__ */ Object.create(null);
Object.keys(ln).forEach((e) => {
  gr[ln[e]] = e;
});
const Fi = { type: "error", data: "parser error" }, ic = typeof Blob == "function" || typeof Blob < "u" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]", oc = typeof ArrayBuffer == "function", ac = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e && e.buffer instanceof ArrayBuffer, _o = ({ type: e, data: t }, n, s) => ic && t instanceof Blob ? n ? s(t) : Pa(t, s) : oc && (t instanceof ArrayBuffer || ac(t)) ? n ? s(t) : Pa(new Blob([t]), s) : s(ln[e] + (t || "")), Pa = (e, t) => {
  const n = new FileReader();
  return n.onload = function() {
    const s = n.result.split(",")[1];
    t("b" + (s || ""));
  }, n.readAsDataURL(e);
};
function Na(e) {
  return e instanceof Uint8Array ? e : e instanceof ArrayBuffer ? new Uint8Array(e) : new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
}
let di;
function Td(e, t) {
  if (ic && e.data instanceof Blob)
    return e.data.arrayBuffer().then(Na).then(t);
  if (oc && (e.data instanceof ArrayBuffer || ac(e.data)))
    return t(Na(e.data));
  _o(e, !1, (n) => {
    di || (di = new TextEncoder()), t(di.encode(n));
  });
}
const Ma = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", Rs = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (let e = 0; e < Ma.length; e++)
  Rs[Ma.charCodeAt(e)] = e;
const Sd = (e) => {
  let t = e.length * 0.75, n = e.length, s, r = 0, i, o, a, l;
  e[e.length - 1] === "=" && (t--, e[e.length - 2] === "=" && t--);
  const h = new ArrayBuffer(t), c = new Uint8Array(h);
  for (s = 0; s < n; s += 4)
    i = Rs[e.charCodeAt(s)], o = Rs[e.charCodeAt(s + 1)], a = Rs[e.charCodeAt(s + 2)], l = Rs[e.charCodeAt(s + 3)], c[r++] = i << 2 | o >> 4, c[r++] = (o & 15) << 4 | a >> 2, c[r++] = (a & 3) << 6 | l & 63;
  return h;
}, Ed = typeof ArrayBuffer == "function", bo = (e, t) => {
  if (typeof e != "string")
    return {
      type: "message",
      data: lc(e, t)
    };
  const n = e.charAt(0);
  return n === "b" ? {
    type: "message",
    data: Cd(e.substring(1), t)
  } : gr[n] ? e.length > 1 ? {
    type: gr[n],
    data: e.substring(1)
  } : {
    type: gr[n]
  } : Fi;
}, Cd = (e, t) => {
  if (Ed) {
    const n = Sd(e);
    return lc(n, t);
  } else
    return { base64: !0, data: e };
}, lc = (e, t) => {
  switch (t) {
    case "blob":
      return e instanceof Blob ? e : new Blob([e]);
    case "arraybuffer":
    default:
      return e instanceof ArrayBuffer ? e : e.buffer;
  }
}, cc = "", Rd = (e, t) => {
  const n = e.length, s = new Array(n);
  let r = 0;
  e.forEach((i, o) => {
    _o(i, !1, (a) => {
      s[o] = a, ++r === n && t(s.join(cc));
    });
  });
}, Id = (e, t) => {
  const n = e.split(cc), s = [];
  for (let r = 0; r < n.length; r++) {
    const i = bo(n[r], t);
    if (s.push(i), i.type === "error")
      break;
  }
  return s;
};
function Ld() {
  return new TransformStream({
    transform(e, t) {
      Td(e, (n) => {
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
let pi;
function or(e) {
  return e.reduce((t, n) => t + n.length, 0);
}
function ar(e, t) {
  if (e[0].length === t)
    return e.shift();
  const n = new Uint8Array(t);
  let s = 0;
  for (let r = 0; r < t; r++)
    n[r] = e[0][s++], s === e[0].length && (e.shift(), s = 0);
  return e.length && s < e[0].length && (e[0] = e[0].slice(s)), n;
}
function Od(e, t) {
  pi || (pi = new TextDecoder());
  const n = [];
  let s = 0, r = -1, i = !1;
  return new TransformStream({
    transform(o, a) {
      for (n.push(o); ; ) {
        if (s === 0) {
          if (or(n) < 1)
            break;
          const l = ar(n, 1);
          i = (l[0] & 128) === 128, r = l[0] & 127, r < 126 ? s = 3 : r === 126 ? s = 1 : s = 2;
        } else if (s === 1) {
          if (or(n) < 2)
            break;
          const l = ar(n, 2);
          r = new DataView(l.buffer, l.byteOffset, l.length).getUint16(0), s = 3;
        } else if (s === 2) {
          if (or(n) < 8)
            break;
          const l = ar(n, 8), h = new DataView(l.buffer, l.byteOffset, l.length), c = h.getUint32(0);
          if (c > Math.pow(2, 21) - 1) {
            a.enqueue(Fi);
            break;
          }
          r = c * Math.pow(2, 32) + h.getUint32(4), s = 3;
        } else {
          if (or(n) < r)
            break;
          const l = ar(n, r);
          a.enqueue(bo(i ? l : pi.decode(l), t)), s = 0;
        }
        if (r === 0 || r > e) {
          a.enqueue(Fi);
          break;
        }
      }
    }
  });
}
const uc = 4;
function dt(e) {
  if (e) return Pd(e);
}
function Pd(e) {
  for (var t in dt.prototype)
    e[t] = dt.prototype[t];
  return e;
}
dt.prototype.on = dt.prototype.addEventListener = function(e, t) {
  return this._callbacks = this._callbacks || {}, (this._callbacks["$" + e] = this._callbacks["$" + e] || []).push(t), this;
};
dt.prototype.once = function(e, t) {
  function n() {
    this.off(e, n), t.apply(this, arguments);
  }
  return n.fn = t, this.on(e, n), this;
};
dt.prototype.off = dt.prototype.removeListener = dt.prototype.removeAllListeners = dt.prototype.removeEventListener = function(e, t) {
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
dt.prototype.emit = function(e) {
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
dt.prototype.emitReserved = dt.prototype.emit;
dt.prototype.listeners = function(e) {
  return this._callbacks = this._callbacks || {}, this._callbacks["$" + e] || [];
};
dt.prototype.hasListeners = function(e) {
  return !!this.listeners(e).length;
};
const Wr = typeof Promise == "function" && typeof Promise.resolve == "function" ? (t) => Promise.resolve().then(t) : (t, n) => n(t, 0), Bt = typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")(), Nd = "arraybuffer";
function fc(e, ...t) {
  return t.reduce((n, s) => (e.hasOwnProperty(s) && (n[s] = e[s]), n), {});
}
const Md = Bt.setTimeout, Fd = Bt.clearTimeout;
function qr(e, t) {
  t.useNativeTimers ? (e.setTimeoutFn = Md.bind(Bt), e.clearTimeoutFn = Fd.bind(Bt)) : (e.setTimeoutFn = Bt.setTimeout.bind(Bt), e.clearTimeoutFn = Bt.clearTimeout.bind(Bt));
}
const Dd = 1.33;
function Bd(e) {
  return typeof e == "string" ? $d(e) : Math.ceil((e.byteLength || e.size) * Dd);
}
function $d(e) {
  let t = 0, n = 0;
  for (let s = 0, r = e.length; s < r; s++)
    t = e.charCodeAt(s), t < 128 ? n += 1 : t < 2048 ? n += 2 : t < 55296 || t >= 57344 ? n += 3 : (s++, n += 4);
  return n;
}
function hc() {
  return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
}
function Ud(e) {
  let t = "";
  for (let n in e)
    e.hasOwnProperty(n) && (t.length && (t += "&"), t += encodeURIComponent(n) + "=" + encodeURIComponent(e[n]));
  return t;
}
function zd(e) {
  let t = {}, n = e.split("&");
  for (let s = 0, r = n.length; s < r; s++) {
    let i = n[s].split("=");
    t[decodeURIComponent(i[0])] = decodeURIComponent(i[1]);
  }
  return t;
}
class Hd extends Error {
  constructor(t, n, s) {
    super(t), this.description = n, this.context = s, this.type = "TransportError";
  }
}
class vo extends dt {
  /**
   * Transport abstract constructor.
   *
   * @param {Object} opts - options
   * @protected
   */
  constructor(t) {
    super(), this.writable = !1, qr(this, t), this.opts = t, this.query = t.query, this.socket = t.socket, this.supportsBinary = !t.forceBase64;
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
    return super.emitReserved("error", new Hd(t, n, s)), this;
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
    const n = bo(t, this.socket.binaryType);
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
    const n = Ud(t);
    return n.length ? "?" + n : "";
  }
}
class Wd extends vo {
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
    Id(t, this.socket.binaryType).forEach(n), this.readyState !== "closed" && (this._polling = !1, this.emitReserved("pollComplete"), this.readyState === "open" && this._poll());
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
    this.writable = !1, Rd(t, (n) => {
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
    return this.opts.timestampRequests !== !1 && (n[this.opts.timestampParam] = hc()), !this.supportsBinary && !n.sid && (n.b64 = 1), this.createUri(t, n);
  }
}
let dc = !1;
try {
  dc = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest();
} catch {
}
const qd = dc;
function jd() {
}
class Vd extends Wd {
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
class on extends dt {
  /**
   * Request constructor
   *
   * @param {Object} options
   * @package
   */
  constructor(t, n, s) {
    super(), this.createRequest = t, qr(this, s), this._opts = s, this._method = s.method || "GET", this._uri = n, this._data = s.data !== void 0 ? s.data : null, this._create();
  }
  /**
   * Creates the XHR object and sends the request.
   *
   * @private
   */
  _create() {
    var t;
    const n = fc(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
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
    typeof document < "u" && (this._index = on.requestsCount++, on.requests[this._index] = this);
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
      if (this._xhr.onreadystatechange = jd, t)
        try {
          this._xhr.abort();
        } catch {
        }
      typeof document < "u" && delete on.requests[this._index], this._xhr = null;
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
on.requestsCount = 0;
on.requests = {};
if (typeof document < "u") {
  if (typeof attachEvent == "function")
    attachEvent("onunload", Fa);
  else if (typeof addEventListener == "function") {
    const e = "onpagehide" in Bt ? "pagehide" : "unload";
    addEventListener(e, Fa, !1);
  }
}
function Fa() {
  for (let e in on.requests)
    on.requests.hasOwnProperty(e) && on.requests[e].abort();
}
const Kd = function() {
  const e = pc({
    xdomain: !1
  });
  return e && e.responseType !== null;
}();
class Gd extends Vd {
  constructor(t) {
    super(t);
    const n = t && t.forceBase64;
    this.supportsBinary = Kd && !n;
  }
  request(t = {}) {
    return Object.assign(t, { xd: this.xd }, this.opts), new on(pc, this.uri(), t);
  }
}
function pc(e) {
  const t = e.xdomain;
  try {
    if (typeof XMLHttpRequest < "u" && (!t || qd))
      return new XMLHttpRequest();
  } catch {
  }
  if (!t)
    try {
      return new Bt[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
    } catch {
    }
}
const gc = typeof navigator < "u" && typeof navigator.product == "string" && navigator.product.toLowerCase() === "reactnative";
class Yd extends vo {
  get name() {
    return "websocket";
  }
  doOpen() {
    const t = this.uri(), n = this.opts.protocols, s = gc ? {} : fc(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
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
      _o(s, this.supportsBinary, (i) => {
        try {
          this.doWrite(s, i);
        } catch {
        }
        r && Wr(() => {
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
    return this.opts.timestampRequests && (n[this.opts.timestampParam] = hc()), this.supportsBinary || (n.b64 = 1), this.createUri(t, n);
  }
}
const gi = Bt.WebSocket || Bt.MozWebSocket;
class Xd extends Yd {
  createSocket(t, n, s) {
    return gc ? new gi(t, n, s) : n ? new gi(t, n) : new gi(t);
  }
  doWrite(t, n) {
    this.ws.send(n);
  }
}
class Zd extends vo {
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
        const n = Od(Number.MAX_SAFE_INTEGER, this.socket.binaryType), s = t.readable.pipeThrough(n).getReader(), r = Ld();
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
        r && Wr(() => {
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
const Jd = {
  websocket: Xd,
  webtransport: Zd,
  polling: Gd
}, Qd = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/, ep = [
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
function Di(e) {
  if (e.length > 8e3)
    throw "URI too long";
  const t = e, n = e.indexOf("["), s = e.indexOf("]");
  n != -1 && s != -1 && (e = e.substring(0, n) + e.substring(n, s).replace(/:/g, ";") + e.substring(s, e.length));
  let r = Qd.exec(e || ""), i = {}, o = 14;
  for (; o--; )
    i[ep[o]] = r[o] || "";
  return n != -1 && s != -1 && (i.source = t, i.host = i.host.substring(1, i.host.length - 1).replace(/;/g, ":"), i.authority = i.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), i.ipv6uri = !0), i.pathNames = tp(i, i.path), i.queryKey = np(i, i.query), i;
}
function tp(e, t) {
  const n = /\/{2,9}/g, s = t.replace(n, "/").split("/");
  return (t.slice(0, 1) == "/" || t.length === 0) && s.splice(0, 1), t.slice(-1) == "/" && s.splice(s.length - 1, 1), s;
}
function np(e, t) {
  const n = {};
  return t.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function(s, r, i) {
    r && (n[r] = i);
  }), n;
}
const Bi = typeof addEventListener == "function" && typeof removeEventListener == "function", mr = [];
Bi && addEventListener("offline", () => {
  mr.forEach((e) => e());
}, !1);
class In extends dt {
  /**
   * Socket constructor.
   *
   * @param {String|Object} uri - uri or options
   * @param {Object} opts - options
   */
  constructor(t, n) {
    if (super(), this.binaryType = Nd, this.writeBuffer = [], this._prevBufferLen = 0, this._pingInterval = -1, this._pingTimeout = -1, this._maxPayload = -1, this._pingTimeoutTime = 1 / 0, t && typeof t == "object" && (n = t, t = null), t) {
      const s = Di(t);
      n.hostname = s.host, n.secure = s.protocol === "https" || s.protocol === "wss", n.port = s.port, s.query && (n.query = s.query);
    } else n.host && (n.hostname = Di(n.host).host);
    qr(this, n), this.secure = n.secure != null ? n.secure : typeof location < "u" && location.protocol === "https:", n.hostname && !n.port && (n.port = this.secure ? "443" : "80"), this.hostname = n.hostname || (typeof location < "u" ? location.hostname : "localhost"), this.port = n.port || (typeof location < "u" && location.port ? location.port : this.secure ? "443" : "80"), this.transports = [], this._transportsByName = {}, n.transports.forEach((s) => {
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
    }, n), this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : ""), typeof this.opts.query == "string" && (this.opts.query = zd(this.opts.query)), Bi && (this.opts.closeOnBeforeunload && (this._beforeunloadEventListener = () => {
      this.transport && (this.transport.removeAllListeners(), this.transport.close());
    }, addEventListener("beforeunload", this._beforeunloadEventListener, !1)), this.hostname !== "localhost" && (this._offlineEventListener = () => {
      this._onClose("transport close", {
        description: "network connection lost"
      });
    }, mr.push(this._offlineEventListener))), this.opts.withCredentials && (this._cookieJar = void 0), this._open();
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
    n.EIO = uc, n.transport = t, this.id && (n.sid = this.id);
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
    const t = this.opts.rememberUpgrade && In.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1 ? "websocket" : this.transports[0];
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
    this.readyState = "open", In.priorWebsocketSuccess = this.transport.name === "websocket", this.emitReserved("open"), this.flush();
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
      if (r && (n += Bd(r)), s > 0 && n > this._maxPayload)
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
    return t && (this._pingTimeoutTime = 0, Wr(() => {
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
    if (In.priorWebsocketSuccess = !1, this.opts.tryAllTransports && this.transports.length > 1 && this.readyState === "opening")
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
      if (this.clearTimeoutFn(this._pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), Bi && (this._beforeunloadEventListener && removeEventListener("beforeunload", this._beforeunloadEventListener, !1), this._offlineEventListener)) {
        const s = mr.indexOf(this._offlineEventListener);
        s !== -1 && mr.splice(s, 1);
      }
      this.readyState = "closed", this.id = null, this.emitReserved("close", t, n), this.writeBuffer = [], this._prevBufferLen = 0;
    }
  }
}
In.protocol = uc;
class sp extends In {
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
    In.priorWebsocketSuccess = !1;
    const r = () => {
      s || (n.send([{ type: "ping", data: "probe" }]), n.once("packet", (y) => {
        if (!s)
          if (y.type === "pong" && y.data === "probe") {
            if (this.upgrading = !0, this.emitReserved("upgrading", n), !n)
              return;
            In.priorWebsocketSuccess = n.name === "websocket", this.transport.pause(() => {
              s || this.readyState !== "closed" && (c(), this.setTransport(n), n.send([{ type: "upgrade" }]), this.emitReserved("upgrade", n), n = null, this.upgrading = !1, this.flush());
            });
          } else {
            const _ = new Error("probe error");
            _.transport = n.name, this.emitReserved("upgradeError", _);
          }
      }));
    };
    function i() {
      s || (s = !0, c(), n.close(), n = null);
    }
    const o = (y) => {
      const _ = new Error("probe error: " + y);
      _.transport = n.name, i(), this.emitReserved("upgradeError", _);
    };
    function a() {
      o("transport closed");
    }
    function l() {
      o("socket closed");
    }
    function h(y) {
      n && y.name !== n.name && i();
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
let rp = class extends sp {
  constructor(t, n = {}) {
    const s = typeof t == "object" ? t : n;
    (!s.transports || s.transports && typeof s.transports[0] == "string") && (s.transports = (s.transports || ["polling", "websocket", "webtransport"]).map((r) => Jd[r]).filter((r) => !!r)), super(t, s);
  }
};
function ip(e, t = "", n) {
  let s = e;
  n = n || typeof location < "u" && location, e == null && (e = n.protocol + "//" + n.host), typeof e == "string" && (e.charAt(0) === "/" && (e.charAt(1) === "/" ? e = n.protocol + e : e = n.host + e), /^(https?|wss?):\/\//.test(e) || (typeof n < "u" ? e = n.protocol + "//" + e : e = "https://" + e), s = Di(e)), s.port || (/^(http|ws)$/.test(s.protocol) ? s.port = "80" : /^(http|ws)s$/.test(s.protocol) && (s.port = "443")), s.path = s.path || "/";
  const i = s.host.indexOf(":") !== -1 ? "[" + s.host + "]" : s.host;
  return s.id = s.protocol + "://" + i + ":" + s.port + t, s.href = s.protocol + "://" + i + (n && n.port === s.port ? "" : ":" + s.port), s;
}
const op = typeof ArrayBuffer == "function", ap = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e.buffer instanceof ArrayBuffer, mc = Object.prototype.toString, lp = typeof Blob == "function" || typeof Blob < "u" && mc.call(Blob) === "[object BlobConstructor]", cp = typeof File == "function" || typeof File < "u" && mc.call(File) === "[object FileConstructor]";
function yo(e) {
  return op && (e instanceof ArrayBuffer || ap(e)) || lp && e instanceof Blob || cp && e instanceof File;
}
function _r(e, t) {
  if (!e || typeof e != "object")
    return !1;
  if (Array.isArray(e)) {
    for (let n = 0, s = e.length; n < s; n++)
      if (_r(e[n]))
        return !0;
    return !1;
  }
  if (yo(e))
    return !0;
  if (e.toJSON && typeof e.toJSON == "function" && arguments.length === 1)
    return _r(e.toJSON(), !0);
  for (const n in e)
    if (Object.prototype.hasOwnProperty.call(e, n) && _r(e[n]))
      return !0;
  return !1;
}
function up(e) {
  const t = [], n = e.data, s = e;
  return s.data = $i(n, t), s.attachments = t.length, { packet: s, buffers: t };
}
function $i(e, t) {
  if (!e)
    return e;
  if (yo(e)) {
    const n = { _placeholder: !0, num: t.length };
    return t.push(e), n;
  } else if (Array.isArray(e)) {
    const n = new Array(e.length);
    for (let s = 0; s < e.length; s++)
      n[s] = $i(e[s], t);
    return n;
  } else if (typeof e == "object" && !(e instanceof Date)) {
    const n = {};
    for (const s in e)
      Object.prototype.hasOwnProperty.call(e, s) && (n[s] = $i(e[s], t));
    return n;
  }
  return e;
}
function fp(e, t) {
  return e.data = Ui(e.data, t), delete e.attachments, e;
}
function Ui(e, t) {
  if (!e)
    return e;
  if (e && e._placeholder === !0) {
    if (typeof e.num == "number" && e.num >= 0 && e.num < t.length)
      return t[e.num];
    throw new Error("illegal attachments");
  } else if (Array.isArray(e))
    for (let n = 0; n < e.length; n++)
      e[n] = Ui(e[n], t);
  else if (typeof e == "object")
    for (const n in e)
      Object.prototype.hasOwnProperty.call(e, n) && (e[n] = Ui(e[n], t));
  return e;
}
const hp = [
  "connect",
  "connect_error",
  "disconnect",
  "disconnecting",
  "newListener",
  "removeListener"
  // used by the Node.js EventEmitter
], dp = 5;
var Le;
(function(e) {
  e[e.CONNECT = 0] = "CONNECT", e[e.DISCONNECT = 1] = "DISCONNECT", e[e.EVENT = 2] = "EVENT", e[e.ACK = 3] = "ACK", e[e.CONNECT_ERROR = 4] = "CONNECT_ERROR", e[e.BINARY_EVENT = 5] = "BINARY_EVENT", e[e.BINARY_ACK = 6] = "BINARY_ACK";
})(Le || (Le = {}));
class pp {
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
    return (t.type === Le.EVENT || t.type === Le.ACK) && _r(t) ? this.encodeAsBinary({
      type: t.type === Le.EVENT ? Le.BINARY_EVENT : Le.BINARY_ACK,
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
    return (t.type === Le.BINARY_EVENT || t.type === Le.BINARY_ACK) && (n += t.attachments + "-"), t.nsp && t.nsp !== "/" && (n += t.nsp + ","), t.id != null && (n += t.id), t.data != null && (n += JSON.stringify(t.data, this.replacer)), n;
  }
  /**
   * Encode packet as 'buffer sequence' by removing blobs, and
   * deconstructing packet into object with placeholders and
   * a list of buffers.
   */
  encodeAsBinary(t) {
    const n = up(t), s = this.encodeAsString(n.packet), r = n.buffers;
    return r.unshift(s), r;
  }
}
function Da(e) {
  return Object.prototype.toString.call(e) === "[object Object]";
}
class wo extends dt {
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
      const s = n.type === Le.BINARY_EVENT;
      s || n.type === Le.BINARY_ACK ? (n.type = s ? Le.EVENT : Le.ACK, this.reconstructor = new gp(n), n.attachments === 0 && super.emitReserved("decoded", n)) : super.emitReserved("decoded", n);
    } else if (yo(t) || t.base64)
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
    if (Le[s.type] === void 0)
      throw new Error("unknown packet type " + s.type);
    if (s.type === Le.BINARY_EVENT || s.type === Le.BINARY_ACK) {
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
      if (wo.isPayloadValid(s.type, i))
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
      case Le.CONNECT:
        return Da(n);
      case Le.DISCONNECT:
        return n === void 0;
      case Le.CONNECT_ERROR:
        return typeof n == "string" || Da(n);
      case Le.EVENT:
      case Le.BINARY_EVENT:
        return Array.isArray(n) && (typeof n[0] == "number" || typeof n[0] == "string" && hp.indexOf(n[0]) === -1);
      case Le.ACK:
      case Le.BINARY_ACK:
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
class gp {
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
      const n = fp(this.reconPack, this.buffers);
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
const mp = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Decoder: wo,
  Encoder: pp,
  get PacketType() {
    return Le;
  },
  protocol: dp
}, Symbol.toStringTag, { value: "Module" }));
function Gt(e, t, n) {
  return e.on(t, n), function() {
    e.off(t, n);
  };
}
const _p = Object.freeze({
  connect: 1,
  connect_error: 1,
  disconnect: 1,
  disconnecting: 1,
  // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
  newListener: 1,
  removeListener: 1
});
class _c extends dt {
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
      Gt(t, "open", this.onopen.bind(this)),
      Gt(t, "packet", this.onpacket.bind(this)),
      Gt(t, "error", this.onerror.bind(this)),
      Gt(t, "close", this.onclose.bind(this))
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
    if (_p.hasOwnProperty(t))
      throw new Error('"' + t.toString() + '" is a reserved event name');
    if (n.unshift(t), this._opts.retries && !this.flags.fromQueue && !this.flags.volatile)
      return this._addToQueue(n), this;
    const o = {
      type: Le.EVENT,
      data: n
    };
    if (o.options = {}, o.options.compress = this.flags.compress !== !1, typeof n[n.length - 1] == "function") {
      const c = this.ids++, y = n.pop();
      this._registerAckCallback(c, y), o.id = c;
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
      type: Le.CONNECT,
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
        case Le.CONNECT:
          t.data && t.data.sid ? this.onconnect(t.data.sid, t.data.pid) : this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
          break;
        case Le.EVENT:
        case Le.BINARY_EVENT:
          this.onevent(t);
          break;
        case Le.ACK:
        case Le.BINARY_ACK:
          this.onack(t);
          break;
        case Le.DISCONNECT:
          this.ondisconnect();
          break;
        case Le.CONNECT_ERROR:
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
        type: Le.ACK,
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
    return this.connected && this.packet({ type: Le.DISCONNECT }), this.destroy(), this.connected && this.onclose("io client disconnect"), this;
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
function os(e) {
  e = e || {}, this.ms = e.min || 100, this.max = e.max || 1e4, this.factor = e.factor || 2, this.jitter = e.jitter > 0 && e.jitter <= 1 ? e.jitter : 0, this.attempts = 0;
}
os.prototype.duration = function() {
  var e = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var t = Math.random(), n = Math.floor(t * this.jitter * e);
    e = (Math.floor(t * 10) & 1) == 0 ? e - n : e + n;
  }
  return Math.min(e, this.max) | 0;
};
os.prototype.reset = function() {
  this.attempts = 0;
};
os.prototype.setMin = function(e) {
  this.ms = e;
};
os.prototype.setMax = function(e) {
  this.max = e;
};
os.prototype.setJitter = function(e) {
  this.jitter = e;
};
class zi extends dt {
  constructor(t, n) {
    var s;
    super(), this.nsps = {}, this.subs = [], t && typeof t == "object" && (n = t, t = void 0), n = n || {}, n.path = n.path || "/socket.io", this.opts = n, qr(this, n), this.reconnection(n.reconnection !== !1), this.reconnectionAttempts(n.reconnectionAttempts || 1 / 0), this.reconnectionDelay(n.reconnectionDelay || 1e3), this.reconnectionDelayMax(n.reconnectionDelayMax || 5e3), this.randomizationFactor((s = n.randomizationFactor) !== null && s !== void 0 ? s : 0.5), this.backoff = new os({
      min: this.reconnectionDelay(),
      max: this.reconnectionDelayMax(),
      jitter: this.randomizationFactor()
    }), this.timeout(n.timeout == null ? 2e4 : n.timeout), this._readyState = "closed", this.uri = t;
    const r = n.parser || mp;
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
    this.engine = new rp(this.uri, this.opts);
    const n = this.engine, s = this;
    this._readyState = "opening", this.skipReconnect = !1;
    const r = Gt(n, "open", function() {
      s.onopen(), t && t();
    }), i = (a) => {
      this.cleanup(), this._readyState = "closed", this.emitReserved("error", a), t ? t(a) : this.maybeReconnectOnOpen();
    }, o = Gt(n, "error", i);
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
      Gt(t, "ping", this.onping.bind(this)),
      Gt(t, "data", this.ondata.bind(this)),
      Gt(t, "error", this.onerror.bind(this)),
      Gt(t, "close", this.onclose.bind(this)),
      // @ts-ignore
      Gt(this.decoder, "decoded", this.ondecoded.bind(this))
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
    Wr(() => {
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
    return s ? this._autoConnect && !s.active && s.connect() : (s = new _c(this, t, n), this.nsps[t] = s), s;
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
const Ts = {};
function br(e, t) {
  typeof e == "object" && (t = e, e = void 0), t = t || {};
  const n = ip(e, t.path || "/socket.io"), s = n.source, r = n.id, i = n.path, o = Ts[r] && i in Ts[r].nsps, a = t.forceNew || t["force new connection"] || t.multiplex === !1 || o;
  let l;
  return a ? l = new zi(s, t) : (Ts[r] || (Ts[r] = new zi(s, t)), l = Ts[r]), n.query && !t.query && (t.query = n.queryKey), l.socket(n.path, t);
}
Object.assign(br, {
  Manager: zi,
  Socket: _c,
  io: br,
  connect: br
});
function bp() {
  const e = ce([]), t = ce(!1), n = ce(""), s = ce(!1), r = ce(!1), i = ce(!1), o = ce("connecting"), a = ce(0), l = 5, h = ce({}), c = ce(null), y = ce("");
  let _ = null, M = null, $ = null, Y = null, Re, ne;
  const Ce = (q) => {
    Re = q, q && localStorage.setItem("ctid", q);
  }, xe = (q) => {
    ne = q;
  }, z = (q) => {
    const de = Re || localStorage.getItem("ctid"), re = {};
    return de && (re.conversation_token = de), ne && (re.widget_id = ne), _ = br(`${Rn.WS_URL}/widget`, {
      transports: ["websocket"],
      reconnection: !0,
      reconnectionAttempts: l,
      reconnectionDelay: 1e3,
      auth: Object.keys(re).length > 0 ? re : void 0
    }), _.on("connect", () => {
      o.value = "connected", a.value = 0;
    }), _.on("disconnect", () => {
      o.value === "connected" && (console.log("Socket disconnected, setting connection status to connecting"), o.value = "connecting");
    }), _.on("connect_error", () => {
      a.value++, console.error("Socket connection failed, attempt:", a.value, "connection status:", o.value), a.value >= l && (o.value = "failed");
    }), _.on("chat_response", (j) => {
      if (t.value = !1, j.session_id ? (console.log("Captured session_id from chat_response:", j.session_id), y.value = j.session_id) : console.warn("No session_id in chat_response data:", j), j.type === "agent_message") {
        const He = {
          message: j.message,
          message_type: "agent",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          session_id: "",
          agent_name: j.agent_name,
          stream: !0,
          // live reply → client-side typewriter reveal
          attributes: {
            end_chat: j.end_chat,
            end_chat_reason: j.end_chat_reason,
            end_chat_description: j.end_chat_description,
            request_rating: j.request_rating
          }
        };
        j.attachments && Array.isArray(j.attachments) && (He.id = j.message_id, He.attachments = j.attachments.map((Ke, gt) => ({
          id: j.message_id * 1e3 + gt,
          filename: Ke.filename,
          file_url: Ke.file_url,
          content_type: Ke.content_type,
          file_size: Ke.file_size
        }))), e.value.push(He);
      } else j.shopify_output && typeof j.shopify_output == "object" && j.shopify_output.products ? e.value.push({
        message: j.message,
        // Keep the accompanying text message
        message_type: "product",
        // Use 'product' type for rendering
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: "",
        agent_name: j.agent_name,
        // Assign the whole structured object
        shopify_output: j.shopify_output,
        // Remove the old flattened fields (product_id, product_title, etc.)
        attributes: {
          // Keep other attributes if needed
          end_chat: j.end_chat,
          request_rating: j.request_rating
        }
      }) : e.value.push({
        message: j.message,
        message_type: "bot",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: "",
        agent_name: j.agent_name,
        stream: !0,
        // live reply → client-side typewriter reveal
        // Knowledge-base citations (display gated by show_citations in the widget)
        sources: Array.isArray(j.sources) && j.sources.length ? j.sources : void 0,
        attributes: {
          end_chat: j.end_chat,
          end_chat_reason: j.end_chat_reason,
          end_chat_description: j.end_chat_description,
          request_rating: j.request_rating
        }
      });
    }), _.on("handle_taken_over", (j) => {
      e.value.push({
        message: `${j.user_name} joined the conversation`,
        message_type: "system",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: j.session_id
      }), h.value = {
        ...h.value,
        human_agent_name: j.user_name,
        human_agent_profile_pic: j.profile_picture
      }, M && M(j);
    }), _.on("session_initialized", (j) => {
      j.session_id && (console.log("Initialized session_id from session_initialized:", j.session_id), y.value = j.session_id);
    }), _.on("error", je), _.on("chat_history", Ae), _.on("rating_submitted", ge), _.on("display_form", Ve), _.on("form_submitted", Je), _.on("workflow_state", at), _.on("workflow_proceeded", oe), _;
  }, W = async () => {
    try {
      return o.value = "connecting", a.value = 0, _ && (_.removeAllListeners(), _.disconnect(), _ = null), _ = z(""), new Promise((q) => {
        _ == null || _.on("connect", () => {
          q(!0);
        }), _ == null || _.on("connect_error", () => {
          a.value >= l && q(!1);
        });
      });
    } catch (q) {
      return console.error("Socket initialization failed:", q), o.value = "failed", !1;
    }
  }, ee = () => (_ && _.disconnect(), W()), V = (q) => {
    M = q;
  }, Pe = (q) => {
    $ = q;
  }, rt = (q) => {
    Y = q;
  }, je = (q) => {
    t.value = !1, n.value = dh(q), s.value = !0, setTimeout(() => {
      s.value = !1, n.value = "";
    }, 5e3);
  }, Ae = (q) => {
    if (q.type === "chat_history" && Array.isArray(q.messages)) {
      const de = q.messages.map((re) => {
        var He, Ke;
        const j = {
          message: re.message,
          message_type: re.message_type,
          created_at: re.created_at,
          session_id: "",
          agent_name: re.agent_name || "",
          user_name: re.user_name || "",
          attributes: re.attributes || {},
          attachments: re.attachments || []
          // Include attachments
        };
        return Array.isArray((He = re.attributes) == null ? void 0 : He.sources) && re.attributes.sources.length && (j.sources = re.attributes.sources), (Ke = re.attributes) != null && Ke.shopify_output && typeof re.attributes.shopify_output == "object" ? {
          ...j,
          message_type: "product",
          shopify_output: re.attributes.shopify_output
        } : j;
      });
      e.value = [
        ...de.filter(
          (re) => !e.value.some(
            (j) => j.message === re.message && j.created_at === re.created_at
          )
        ),
        ...e.value
      ];
    }
  }, ge = (q) => {
    q.success && e.value.push({
      message: "Thank you for your feedback!",
      message_type: "system",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: ""
    });
  }, Ve = (q) => {
    var de;
    console.log("Form display handler in composable:", q), t.value = !1, c.value = q.form_data, console.log("Set currentForm in handleDisplayForm:", c.value), ((de = q.form_data) == null ? void 0 : de.form_full_screen) === !0 ? (console.log("Full screen form detected, triggering workflow state callback"), $ && $({
      type: "form",
      form_data: q.form_data,
      session_id: q.session_id
    })) : e.value.push({
      message: "",
      message_type: "form",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: q.session_id,
      attributes: {
        form_data: q.form_data
      }
    });
  }, Je = (q) => {
    console.log("Form submitted confirmation received, clearing currentForm"), c.value = null, q.success && console.log("Form submitted successfully");
  }, at = (q) => {
    console.log("Workflow state received in composable:", q), (q.type === "form" || q.type === "display_form") && (console.log("Setting currentForm from workflow state:", q.form_data), c.value = q.form_data), $ && $(q);
  }, oe = (q) => {
    console.log("Workflow proceeded in composable:", q), Y && Y(q);
  };
  return {
    messages: e,
    loading: t,
    errorMessage: n,
    showError: s,
    loadingHistory: r,
    hasStartedChat: i,
    connectionStatus: o,
    sendMessage: async (q, de, re = []) => {
      if (!_ || !q.trim() && re.length === 0) return;
      h.value.human_agent_name || (t.value = !0);
      const j = {
        message: q,
        message_type: "user",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: ""
      };
      re.length > 0 && (j.attachments = re.map((He, Ke) => {
        let gt = "";
        if (He.content_type.startsWith("image/")) {
          const It = atob(He.content), d = new Array(It.length);
          for (let L = 0; L < It.length; L++)
            d[L] = It.charCodeAt(L);
          const b = new Uint8Array(d), k = new Blob([b], { type: He.content_type });
          gt = URL.createObjectURL(k);
        }
        return {
          id: Date.now() * 1e3 + Ke,
          // Temporary ID
          filename: He.filename,
          file_url: gt,
          // Temporary blob URL, will be replaced
          content_type: He.content_type,
          file_size: He.size,
          _isTemporary: !0
          // Flag to identify temporary attachments
        };
      })), e.value.push(j), _.emit("chat", {
        message: q,
        email: de,
        files: re
        // Send files with base64 content
      }), i.value = !0;
    },
    loadChatHistory: async () => {
      if (_)
        try {
          r.value = !0, _.emit("get_chat_history");
        } catch (q) {
          console.error("Failed to load chat history:", q);
        } finally {
          r.value = !1;
        }
    },
    connect: W,
    reconnect: ee,
    cleanup: () => {
      _ && (_.removeAllListeners(), _.disconnect(), _ = null), M = null, $ = null, Y = null;
    },
    humanAgent: h,
    onTakeover: V,
    submitRating: async (q, de) => {
      !_ || !q || _.emit("submit_rating", {
        rating: q,
        feedback: de
      });
    },
    currentForm: c,
    submitForm: async (q) => {
      var j;
      if (console.log("Submitting form in socket:", q), console.log("Current form in socket:", c.value), console.log("Socket in socket:", _), !_) {
        console.error("No socket available for form submission");
        return;
      }
      if (!q || Object.keys(q).length === 0) {
        console.error("No form data to submit");
        return;
      }
      const re = ((j = c.value) == null ? void 0 : j.form_type) === "contact" ? "submit_contact_info" : "submit_form";
      console.log(`Emitting ${re} event with data:`, q), _.emit(re, {
        form_data: q
      }), c.value = null;
    },
    getWorkflowState: async () => {
      _ && (console.log("Getting workflow state 12"), _.emit("get_workflow_state"));
    },
    proceedWorkflow: async () => {
      _ && _.emit("proceed_workflow", {});
    },
    onWorkflowState: Pe,
    onWorkflowProceeded: rt,
    currentSessionId: y,
    setToken: Ce,
    setWidgetId: xe
  };
}
function vp(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var mi = { exports: {} }, Ba;
function yp() {
  return Ba || (Ba = 1, function(e) {
    (function() {
      function t(u, v, A) {
        return u.call.apply(u.bind, arguments);
      }
      function n(u, v, A) {
        if (!u) throw Error();
        if (2 < arguments.length) {
          var x = Array.prototype.slice.call(arguments, 2);
          return function() {
            var N = Array.prototype.slice.call(arguments);
            return Array.prototype.unshift.apply(N, x), u.apply(v, N);
          };
        }
        return function() {
          return u.apply(v, arguments);
        };
      }
      function s(u, v, A) {
        return s = Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1 ? t : n, s.apply(null, arguments);
      }
      var r = Date.now || function() {
        return +/* @__PURE__ */ new Date();
      };
      function i(u, v) {
        this.a = u, this.o = v || u, this.c = this.o.document;
      }
      var o = !!window.FontFace;
      function a(u, v, A, x) {
        if (v = u.c.createElement(v), A) for (var N in A) A.hasOwnProperty(N) && (N == "style" ? v.style.cssText = A[N] : v.setAttribute(N, A[N]));
        return x && v.appendChild(u.c.createTextNode(x)), v;
      }
      function l(u, v, A) {
        u = u.c.getElementsByTagName(v)[0], u || (u = document.documentElement), u.insertBefore(A, u.lastChild);
      }
      function h(u) {
        u.parentNode && u.parentNode.removeChild(u);
      }
      function c(u, v, A) {
        v = v || [], A = A || [];
        for (var x = u.className.split(/\s+/), N = 0; N < v.length; N += 1) {
          for (var G = !1, te = 0; te < x.length; te += 1) if (v[N] === x[te]) {
            G = !0;
            break;
          }
          G || x.push(v[N]);
        }
        for (v = [], N = 0; N < x.length; N += 1) {
          for (G = !1, te = 0; te < A.length; te += 1) if (x[N] === A[te]) {
            G = !0;
            break;
          }
          G || v.push(x[N]);
        }
        u.className = v.join(" ").replace(/\s+/g, " ").replace(/^\s+|\s+$/, "");
      }
      function y(u, v) {
        for (var A = u.className.split(/\s+/), x = 0, N = A.length; x < N; x++) if (A[x] == v) return !0;
        return !1;
      }
      function _(u) {
        return u.o.location.hostname || u.a.location.hostname;
      }
      function M(u, v, A) {
        function x() {
          ve && N && G && (ve(te), ve = null);
        }
        v = a(u, "link", { rel: "stylesheet", href: v, media: "all" });
        var N = !1, G = !0, te = null, ve = A || null;
        o ? (v.onload = function() {
          N = !0, x();
        }, v.onerror = function() {
          N = !0, te = Error("Stylesheet failed to load"), x();
        }) : setTimeout(function() {
          N = !0, x();
        }, 0), l(u, "head", v);
      }
      function $(u, v, A, x) {
        var N = u.c.getElementsByTagName("head")[0];
        if (N) {
          var G = a(u, "script", { src: v }), te = !1;
          return G.onload = G.onreadystatechange = function() {
            te || this.readyState && this.readyState != "loaded" && this.readyState != "complete" || (te = !0, A && A(null), G.onload = G.onreadystatechange = null, G.parentNode.tagName == "HEAD" && N.removeChild(G));
          }, N.appendChild(G), setTimeout(function() {
            te || (te = !0, A && A(Error("Script load timeout")));
          }, x || 5e3), G;
        }
        return null;
      }
      function Y() {
        this.a = 0, this.c = null;
      }
      function Re(u) {
        return u.a++, function() {
          u.a--, Ce(u);
        };
      }
      function ne(u, v) {
        u.c = v, Ce(u);
      }
      function Ce(u) {
        u.a == 0 && u.c && (u.c(), u.c = null);
      }
      function xe(u) {
        this.a = u || "-";
      }
      xe.prototype.c = function(u) {
        for (var v = [], A = 0; A < arguments.length; A++) v.push(arguments[A].replace(/[\W_]+/g, "").toLowerCase());
        return v.join(this.a);
      };
      function z(u, v) {
        this.c = u, this.f = 4, this.a = "n";
        var A = (v || "n4").match(/^([nio])([1-9])$/i);
        A && (this.a = A[1], this.f = parseInt(A[2], 10));
      }
      function W(u) {
        return Pe(u) + " " + (u.f + "00") + " 300px " + ee(u.c);
      }
      function ee(u) {
        var v = [];
        u = u.split(/,\s*/);
        for (var A = 0; A < u.length; A++) {
          var x = u[A].replace(/['"]/g, "");
          x.indexOf(" ") != -1 || /^\d/.test(x) ? v.push("'" + x + "'") : v.push(x);
        }
        return v.join(",");
      }
      function V(u) {
        return u.a + u.f;
      }
      function Pe(u) {
        var v = "normal";
        return u.a === "o" ? v = "oblique" : u.a === "i" && (v = "italic"), v;
      }
      function rt(u) {
        var v = 4, A = "n", x = null;
        return u && ((x = u.match(/(normal|oblique|italic)/i)) && x[1] && (A = x[1].substr(0, 1).toLowerCase()), (x = u.match(/([1-9]00|normal|bold)/i)) && x[1] && (/bold/i.test(x[1]) ? v = 7 : /[1-9]00/.test(x[1]) && (v = parseInt(x[1].substr(0, 1), 10)))), A + v;
      }
      function je(u, v) {
        this.c = u, this.f = u.o.document.documentElement, this.h = v, this.a = new xe("-"), this.j = v.events !== !1, this.g = v.classes !== !1;
      }
      function Ae(u) {
        u.g && c(u.f, [u.a.c("wf", "loading")]), Ve(u, "loading");
      }
      function ge(u) {
        if (u.g) {
          var v = y(u.f, u.a.c("wf", "active")), A = [], x = [u.a.c("wf", "loading")];
          v || A.push(u.a.c("wf", "inactive")), c(u.f, A, x);
        }
        Ve(u, "inactive");
      }
      function Ve(u, v, A) {
        u.j && u.h[v] && (A ? u.h[v](A.c, V(A)) : u.h[v]());
      }
      function Je() {
        this.c = {};
      }
      function at(u, v, A) {
        var x = [], N;
        for (N in v) if (v.hasOwnProperty(N)) {
          var G = u.c[N];
          G && x.push(G(v[N], A));
        }
        return x;
      }
      function oe(u, v) {
        this.c = u, this.f = v, this.a = a(this.c, "span", { "aria-hidden": "true" }, this.f);
      }
      function me(u) {
        l(u.c, "body", u.a);
      }
      function ae(u) {
        return "display:block;position:absolute;top:-9999px;left:-9999px;font-size:300px;width:auto;height:auto;line-height:normal;margin:0;padding:0;font-variant:normal;white-space:nowrap;font-family:" + ee(u.c) + ";" + ("font-style:" + Pe(u) + ";font-weight:" + (u.f + "00") + ";");
      }
      function ut(u, v, A, x, N, G) {
        this.g = u, this.j = v, this.a = x, this.c = A, this.f = N || 3e3, this.h = G || void 0;
      }
      ut.prototype.start = function() {
        var u = this.c.o.document, v = this, A = r(), x = new Promise(function(te, ve) {
          function Se() {
            r() - A >= v.f ? ve() : u.fonts.load(W(v.a), v.h).then(function(Ge) {
              1 <= Ge.length ? te() : setTimeout(Se, 25);
            }, function() {
              ve();
            });
          }
          Se();
        }), N = null, G = new Promise(function(te, ve) {
          N = setTimeout(ve, v.f);
        });
        Promise.race([G, x]).then(function() {
          N && (clearTimeout(N), N = null), v.g(v.a);
        }, function() {
          v.j(v.a);
        });
      };
      function it(u, v, A, x, N, G, te) {
        this.v = u, this.B = v, this.c = A, this.a = x, this.s = te || "BESbswy", this.f = {}, this.w = N || 3e3, this.u = G || null, this.m = this.j = this.h = this.g = null, this.g = new oe(this.c, this.s), this.h = new oe(this.c, this.s), this.j = new oe(this.c, this.s), this.m = new oe(this.c, this.s), u = new z(this.a.c + ",serif", V(this.a)), u = ae(u), this.g.a.style.cssText = u, u = new z(this.a.c + ",sans-serif", V(this.a)), u = ae(u), this.h.a.style.cssText = u, u = new z("serif", V(this.a)), u = ae(u), this.j.a.style.cssText = u, u = new z("sans-serif", V(this.a)), u = ae(u), this.m.a.style.cssText = u, me(this.g), me(this.h), me(this.j), me(this.m);
      }
      var ie = { D: "serif", C: "sans-serif" }, nt = null;
      function be() {
        if (nt === null) {
          var u = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent);
          nt = !!u && (536 > parseInt(u[1], 10) || parseInt(u[1], 10) === 536 && 11 >= parseInt(u[2], 10));
        }
        return nt;
      }
      it.prototype.start = function() {
        this.f.serif = this.j.a.offsetWidth, this.f["sans-serif"] = this.m.a.offsetWidth, this.A = r(), de(this);
      };
      function q(u, v, A) {
        for (var x in ie) if (ie.hasOwnProperty(x) && v === u.f[ie[x]] && A === u.f[ie[x]]) return !0;
        return !1;
      }
      function de(u) {
        var v = u.g.a.offsetWidth, A = u.h.a.offsetWidth, x;
        (x = v === u.f.serif && A === u.f["sans-serif"]) || (x = be() && q(u, v, A)), x ? r() - u.A >= u.w ? be() && q(u, v, A) && (u.u === null || u.u.hasOwnProperty(u.a.c)) ? j(u, u.v) : j(u, u.B) : re(u) : j(u, u.v);
      }
      function re(u) {
        setTimeout(s(function() {
          de(this);
        }, u), 50);
      }
      function j(u, v) {
        setTimeout(s(function() {
          h(this.g.a), h(this.h.a), h(this.j.a), h(this.m.a), v(this.a);
        }, u), 0);
      }
      function He(u, v, A) {
        this.c = u, this.a = v, this.f = 0, this.m = this.j = !1, this.s = A;
      }
      var Ke = null;
      He.prototype.g = function(u) {
        var v = this.a;
        v.g && c(v.f, [v.a.c("wf", u.c, V(u).toString(), "active")], [v.a.c("wf", u.c, V(u).toString(), "loading"), v.a.c("wf", u.c, V(u).toString(), "inactive")]), Ve(v, "fontactive", u), this.m = !0, gt(this);
      }, He.prototype.h = function(u) {
        var v = this.a;
        if (v.g) {
          var A = y(v.f, v.a.c("wf", u.c, V(u).toString(), "active")), x = [], N = [v.a.c("wf", u.c, V(u).toString(), "loading")];
          A || x.push(v.a.c("wf", u.c, V(u).toString(), "inactive")), c(v.f, x, N);
        }
        Ve(v, "fontinactive", u), gt(this);
      };
      function gt(u) {
        --u.f == 0 && u.j && (u.m ? (u = u.a, u.g && c(u.f, [u.a.c("wf", "active")], [u.a.c("wf", "loading"), u.a.c("wf", "inactive")]), Ve(u, "active")) : ge(u.a));
      }
      function It(u) {
        this.j = u, this.a = new Je(), this.h = 0, this.f = this.g = !0;
      }
      It.prototype.load = function(u) {
        this.c = new i(this.j, u.context || this.j), this.g = u.events !== !1, this.f = u.classes !== !1, b(this, new je(this.c, u), u);
      };
      function d(u, v, A, x, N) {
        var G = --u.h == 0;
        (u.f || u.g) && setTimeout(function() {
          var te = N || null, ve = x || null || {};
          if (A.length === 0 && G) ge(v.a);
          else {
            v.f += A.length, G && (v.j = G);
            var Se, Ge = [];
            for (Se = 0; Se < A.length; Se++) {
              var Ne = A[Se], ht = ve[Ne.c], vt = v.a, We = Ne;
              if (vt.g && c(vt.f, [vt.a.c("wf", We.c, V(We).toString(), "loading")]), Ve(vt, "fontloading", We), vt = null, Ke === null) if (window.FontFace) {
                var We = /Gecko.*Firefox\/(\d+)/.exec(window.navigator.userAgent), Xt = /OS X.*Version\/10\..*Safari/.exec(window.navigator.userAgent) && /Apple/.exec(window.navigator.vendor);
                Ke = We ? 42 < parseInt(We[1], 10) : !Xt;
              } else Ke = !1;
              Ke ? vt = new ut(s(v.g, v), s(v.h, v), v.c, Ne, v.s, ht) : vt = new it(s(v.g, v), s(v.h, v), v.c, Ne, v.s, te, ht), Ge.push(vt);
            }
            for (Se = 0; Se < Ge.length; Se++) Ge[Se].start();
          }
        }, 0);
      }
      function b(u, v, A) {
        var N = [], x = A.timeout;
        Ae(v);
        var N = at(u.a, A, u.c), G = new He(u.c, v, x);
        for (u.h = N.length, v = 0, A = N.length; v < A; v++) N[v].load(function(te, ve, Se) {
          d(u, G, te, ve, Se);
        });
      }
      function k(u, v) {
        this.c = u, this.a = v;
      }
      k.prototype.load = function(u) {
        function v() {
          if (G["__mti_fntLst" + x]) {
            var te = G["__mti_fntLst" + x](), ve = [], Se;
            if (te) for (var Ge = 0; Ge < te.length; Ge++) {
              var Ne = te[Ge].fontfamily;
              te[Ge].fontStyle != null && te[Ge].fontWeight != null ? (Se = te[Ge].fontStyle + te[Ge].fontWeight, ve.push(new z(Ne, Se))) : ve.push(new z(Ne));
            }
            u(ve);
          } else setTimeout(function() {
            v();
          }, 50);
        }
        var A = this, x = A.a.projectId, N = A.a.version;
        if (x) {
          var G = A.c.o;
          $(this.c, (A.a.api || "https://fast.fonts.net/jsapi") + "/" + x + ".js" + (N ? "?v=" + N : ""), function(te) {
            te ? u([]) : (G["__MonotypeConfiguration__" + x] = function() {
              return A.a;
            }, v());
          }).id = "__MonotypeAPIScript__" + x;
        } else u([]);
      };
      function L(u, v) {
        this.c = u, this.a = v;
      }
      L.prototype.load = function(u) {
        var v, A, x = this.a.urls || [], N = this.a.families || [], G = this.a.testStrings || {}, te = new Y();
        for (v = 0, A = x.length; v < A; v++) M(this.c, x[v], Re(te));
        var ve = [];
        for (v = 0, A = N.length; v < A; v++) if (x = N[v].split(":"), x[1]) for (var Se = x[1].split(","), Ge = 0; Ge < Se.length; Ge += 1) ve.push(new z(x[0], Se[Ge]));
        else ve.push(new z(x[0]));
        ne(te, function() {
          u(ve, G);
        });
      };
      function R(u, v) {
        u ? this.c = u : this.c = I, this.a = [], this.f = [], this.g = v || "";
      }
      var I = "https://fonts.googleapis.com/css";
      function B(u, v) {
        for (var A = v.length, x = 0; x < A; x++) {
          var N = v[x].split(":");
          N.length == 3 && u.f.push(N.pop());
          var G = "";
          N.length == 2 && N[1] != "" && (G = ":"), u.a.push(N.join(G));
        }
      }
      function D(u) {
        if (u.a.length == 0) throw Error("No fonts to load!");
        if (u.c.indexOf("kit=") != -1) return u.c;
        for (var v = u.a.length, A = [], x = 0; x < v; x++) A.push(u.a[x].replace(/ /g, "+"));
        return v = u.c + "?family=" + A.join("%7C"), 0 < u.f.length && (v += "&subset=" + u.f.join(",")), 0 < u.g.length && (v += "&text=" + encodeURIComponent(u.g)), v;
      }
      function F(u) {
        this.f = u, this.a = [], this.c = {};
      }
      var P = { latin: "BESbswy", "latin-ext": "çöüğş", cyrillic: "йяЖ", greek: "αβΣ", khmer: "កខគ", Hanuman: "កខគ" }, X = { thin: "1", extralight: "2", "extra-light": "2", ultralight: "2", "ultra-light": "2", light: "3", regular: "4", book: "4", medium: "5", "semi-bold": "6", semibold: "6", "demi-bold": "6", demibold: "6", bold: "7", "extra-bold": "8", extrabold: "8", "ultra-bold": "8", ultrabold: "8", black: "9", heavy: "9", l: "3", r: "4", b: "7" }, U = { i: "i", italic: "i", n: "n", normal: "n" }, K = /^(thin|(?:(?:extra|ultra)-?)?light|regular|book|medium|(?:(?:semi|demi|extra|ultra)-?)?bold|black|heavy|l|r|b|[1-9]00)?(n|i|normal|italic)?$/;
      function Q(u) {
        for (var v = u.f.length, A = 0; A < v; A++) {
          var x = u.f[A].split(":"), N = x[0].replace(/\+/g, " "), G = ["n4"];
          if (2 <= x.length) {
            var te, ve = x[1];
            if (te = [], ve) for (var ve = ve.split(","), Se = ve.length, Ge = 0; Ge < Se; Ge++) {
              var Ne;
              if (Ne = ve[Ge], Ne.match(/^[\w-]+$/)) {
                var ht = K.exec(Ne.toLowerCase());
                if (ht == null) Ne = "";
                else {
                  if (Ne = ht[2], Ne = Ne == null || Ne == "" ? "n" : U[Ne], ht = ht[1], ht == null || ht == "") ht = "4";
                  else var vt = X[ht], ht = vt || (isNaN(ht) ? "4" : ht.substr(0, 1));
                  Ne = [Ne, ht].join("");
                }
              } else Ne = "";
              Ne && te.push(Ne);
            }
            0 < te.length && (G = te), x.length == 3 && (x = x[2], te = [], x = x ? x.split(",") : te, 0 < x.length && (x = P[x[0]]) && (u.c[N] = x));
          }
          for (u.c[N] || (x = P[N]) && (u.c[N] = x), x = 0; x < G.length; x += 1) u.a.push(new z(N, G[x]));
        }
      }
      function ue(u, v) {
        this.c = u, this.a = v;
      }
      var Te = { Arimo: !0, Cousine: !0, Tinos: !0 };
      ue.prototype.load = function(u) {
        var v = new Y(), A = this.c, x = new R(this.a.api, this.a.text), N = this.a.families;
        B(x, N);
        var G = new F(N);
        Q(G), M(A, D(x), Re(v)), ne(v, function() {
          u(G.a, G.c, Te);
        });
      };
      function pe(u, v) {
        this.c = u, this.a = v;
      }
      pe.prototype.load = function(u) {
        var v = this.a.id, A = this.c.o;
        v ? $(this.c, (this.a.api || "https://use.typekit.net") + "/" + v + ".js", function(x) {
          if (x) u([]);
          else if (A.Typekit && A.Typekit.config && A.Typekit.config.fn) {
            x = A.Typekit.config.fn;
            for (var N = [], G = 0; G < x.length; G += 2) for (var te = x[G], ve = x[G + 1], Se = 0; Se < ve.length; Se++) N.push(new z(te, ve[Se]));
            try {
              A.Typekit.load({ events: !1, classes: !1, async: !0 });
            } catch {
            }
            u(N);
          }
        }, 2e3) : u([]);
      };
      function Fe(u, v) {
        this.c = u, this.f = v, this.a = [];
      }
      Fe.prototype.load = function(u) {
        var v = this.f.id, A = this.c.o, x = this;
        v ? (A.__webfontfontdeckmodule__ || (A.__webfontfontdeckmodule__ = {}), A.__webfontfontdeckmodule__[v] = function(N, G) {
          for (var te = 0, ve = G.fonts.length; te < ve; ++te) {
            var Se = G.fonts[te];
            x.a.push(new z(Se.name, rt("font-weight:" + Se.weight + ";font-style:" + Se.style)));
          }
          u(x.a);
        }, $(this.c, (this.f.api || "https://f.fontdeck.com/s/css/js/") + _(this.c) + "/" + v + ".js", function(N) {
          N && u([]);
        })) : u([]);
      };
      var De = new It(window);
      De.a.c.custom = function(u, v) {
        return new L(v, u);
      }, De.a.c.fontdeck = function(u, v) {
        return new Fe(v, u);
      }, De.a.c.monotype = function(u, v) {
        return new k(v, u);
      }, De.a.c.typekit = function(u, v) {
        return new pe(v, u);
      }, De.a.c.google = function(u, v) {
        return new ue(v, u);
      };
      var Qe = { load: s(De.load, De) };
      e.exports ? e.exports = Qe : (window.WebFont = Qe, window.WebFontConfig && De.load(window.WebFontConfig));
    })();
  }(mi)), mi.exports;
}
var wp = yp();
const kp = /* @__PURE__ */ vp(wp), $a = [
  "Space Grotesk:400,500,600,700",
  "Instrument Sans:400,500,600",
  "JetBrains Mono:400,500,600"
], xp = (e) => {
  const t = [...$a], n = (e == null ? void 0 : e.split(",")[0].trim().replace(/['"]/g, "")) || "", s = $a.some(
    (r) => r.toLowerCase().startsWith(n.toLowerCase())
  );
  n && !s && t.push(n), kp.load({
    google: { families: t },
    active: () => {
      if (!e) return;
      const r = document.querySelector(".chat-container");
      r && (r.style.fontFamily = e.includes(",") ? e : `"${e}", system-ui, sans-serif`);
    }
  });
};
function Ap() {
  const e = ce({}), t = ce(""), n = (r) => {
    e.value = r, r.photo_url && (e.value.photo_url = r.photo_url), xp(r.font_family), window.parent.postMessage({
      type: "CUSTOMIZATION_UPDATE",
      data: {
        chat_bubble_color: r.chat_bubble_color || "#C9F24E",
        chat_style: r.chat_style,
        chat_initiation_messages: r.chat_initiation_messages || []
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
const Tp = 13, Sp = 24;
function Ep(e, t) {
  const n = Mr({}), s = [];
  let r = null;
  const i = typeof window < "u" && typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, o = (c) => {
    r || s.length === 0 || (r = setTimeout(a, c));
  }, a = () => {
    r = null;
    const c = s[0];
    if (c === void 0) return;
    const y = e.value[c], _ = n[c], M = (y == null ? void 0 : y.message) ?? "";
    if (!_ || !y) {
      s.shift(), o(0);
      return;
    }
    if (_.shown >= M.length) {
      _.done = !0, s.shift(), o(0);
      return;
    }
    _.shown += 1;
    const $ = M[_.shown - 1];
    t == null || t(), o($ === " " ? Sp : Tp);
  };
  mn(() => e.value.length, (c, y) => {
    y !== void 0 && c < y && (Object.keys(n).forEach((_) => {
      delete n[Number(_)];
    }), s.length = 0);
    for (let _ = y ?? 0; _ < c; _++) {
      const M = e.value[_];
      if (!M || !M.stream || _ in n) continue;
      const $ = M.message ?? "";
      i || !$ ? n[_] = { shown: $.length, done: !0 } : (n[_] = { shown: 0, done: !1 }, s.push(_));
    }
    o(0);
  });
  const l = (c, y) => {
    const _ = n[c];
    return _ ? y.slice(0, _.shown) : y;
  }, h = (c) => {
    const y = n[c];
    return !!y && !y.done;
  };
  return qs(() => {
    r && clearTimeout(r);
  }), { displayText: l, isStreaming: h };
}
function Cp(e) {
  const t = ce(!0);
  let n = 0;
  const s = () => {
    window.parent.postMessage({ type: "UNREAD_COUNT", count: n }, "*");
  }, r = (i) => {
    var o;
    ((o = i == null ? void 0 : i.data) == null ? void 0 : o.type) === "WIDGET_VISIBILITY" && (t.value = !!i.data.open, t.value && n !== 0 && (n = 0, s()));
  };
  mn(() => e.value.length, (i, o) => {
    if (i <= (o ?? 0) || t.value) return;
    const a = e.value[i - 1];
    a && (a.message_type === "bot" || a.message_type === "agent") && (n += 1, s());
  }), to(() => window.addEventListener("message", r)), qs(() => window.removeEventListener("message", r));
}
const Rp = {
  light: !1,
  radius: 22,
  glow: "rgba(157,140,255,.26)",
  border: "rgba(157,140,255,.32)",
  agentBg: "rgba(255,255,255,.06)",
  mono: !1,
  bubble: 16
}, Ip = {
  light: !1,
  radius: 26,
  glow: "rgba(157,140,255,.32)",
  border: "rgba(157,140,255,.40)",
  agentBg: "rgba(255,255,255,.05)",
  mono: !1,
  bubble: 18
}, Lp = {
  light: !1,
  radius: 18,
  glow: "rgba(95,227,214,.22)",
  border: "rgba(95,227,214,.30)",
  agentBg: "rgba(255,255,255,.05)",
  mono: !1,
  bubble: 14
}, vr = {
  light: !0,
  radius: 24,
  glow: "rgba(255,138,115,.22)",
  border: "rgba(0,0,0,.08)",
  agentBg: "#F3F3F6",
  mono: !1,
  bubble: 16
}, Op = {
  light: !0,
  radius: 28,
  glow: "rgba(255,138,115,.30)",
  border: "rgba(0,0,0,.07)",
  agentBg: "#F4F1F6",
  mono: !1,
  bubble: 20
}, Pp = {
  light: !1,
  radius: 8,
  glow: "rgba(201,242,78,.20)",
  border: "rgba(201,242,78,.30)",
  agentBg: "rgba(201,242,78,.045)",
  mono: !0,
  bubble: 4
}, Np = {
  AURORA: Ip,
  GLASS: Rp,
  CALM_MINT: Lp,
  TERMINAL: Pp,
  SUNRISE: vr,
  PLAYFUL: Op,
  CHATBOT: vr,
  ASK_ANYTHING: vr
};
function Mp(e) {
  return Math.max(4, Math.round(e * 0.3));
}
function Fp(e) {
  return Np[e || ""] || vr;
}
function Dp(e) {
  const t = Fp(e);
  return {
    "--cm-radius": `${t.radius}px`,
    "--cm-glow": t.glow,
    "--cm-border": t.border,
    "--cm-agent-bg": t.agentBg,
    "--cm-bubble": `${t.bubble}px`,
    "--cm-bubble-tail": `${Mp(t.bubble)}px`,
    // Inputs + send button share one field radius (square-ish on Terminal, rounded elsewhere).
    "--cm-field-radius": t.mono ? "7px" : "12px"
  };
}
function Bp() {
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
const $p = {
  key: 0,
  class: "widget-unavailable-overlay"
}, Up = {
  key: 1,
  class: "auth-error-overlay"
}, zp = { class: "auth-error-card" }, Hp = { class: "auth-error-message" }, Wp = {
  key: 0,
  class: "initializing-overlay"
}, qp = {
  key: 0,
  class: "connecting-message"
}, jp = {
  key: 1,
  class: "failed-message"
}, Vp = { class: "welcome-content" }, Kp = { class: "welcome-header" }, Gp = ["src", "alt"], Yp = { class: "welcome-title" }, Xp = { class: "welcome-subtitle" }, Zp = { class: "welcome-input-container" }, Jp = {
  key: 0,
  class: "email-input"
}, Qp = ["disabled"], eg = { class: "welcome-message-input" }, tg = ["placeholder", "disabled"], ng = ["disabled"], sg = {
  key: 0,
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, rg = {
  key: 1,
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, ig = { class: "landing-page-content" }, og = { class: "landing-page-header" }, ag = { class: "landing-page-heading" }, lg = { class: "landing-page-text" }, cg = { class: "landing-page-actions" }, ug = { class: "form-fullscreen-content" }, fg = {
  key: 0,
  class: "form-header"
}, hg = {
  key: 0,
  class: "form-title"
}, dg = {
  key: 1,
  class: "form-description"
}, pg = { class: "form-fields" }, gg = ["for"], mg = {
  key: 0,
  class: "required-indicator"
}, _g = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "autocomplete", "inputmode"], bg = ["id", "placeholder", "required", "min", "max", "value", "onInput"], vg = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput"], yg = ["id", "required", "value", "onChange"], wg = { value: "" }, kg = ["value"], xg = {
  key: 4,
  class: "checkbox-field"
}, Ag = ["id", "required", "checked", "onChange"], Tg = { class: "checkbox-label" }, Sg = {
  key: 5,
  class: "radio-group"
}, Eg = ["name", "value", "required", "checked", "onChange"], Cg = { class: "radio-label" }, Rg = {
  key: 6,
  class: "field-error"
}, Ig = { class: "form-actions" }, Lg = ["disabled"], Og = {
  key: 0,
  class: "loading-spinner-inline"
}, Pg = { key: 1 }, Ng = { class: "header-content" }, Mg = ["src", "alt"], Fg = { class: "header-info" }, Dg = { class: "status" }, Bg = { class: "ask-anything-header" }, $g = ["src", "alt"], Ug = { class: "header-info" }, zg = {
  key: 2,
  class: "loading-history"
}, Hg = { class: "cm-email-gate-title" }, Wg = ["disabled"], qg = {
  key: 0,
  class: "cm-email-gate-error"
}, jg = ["disabled"], Vg = {
  key: 0,
  class: "cm-welcome-block"
}, Kg = { class: "message agent-message cm-welcome-row" }, Gg = ["src", "alt"], Yg = {
  key: 0,
  class: "rating-content"
}, Xg = { class: "rating-prompt" }, Zg = ["onMouseover", "onMouseleave", "onClick", "disabled"], Jg = {
  key: 0,
  class: "feedback-wrapper"
}, Qg = { class: "feedback-section" }, em = ["onUpdate:modelValue", "disabled"], tm = { class: "feedback-counter" }, nm = ["onClick", "disabled"], sm = {
  key: 1,
  class: "submitted-feedback-wrapper"
}, rm = { class: "submitted-feedback" }, im = { class: "submitted-feedback-text" }, om = {
  key: 2,
  class: "submitted-message"
}, am = {
  key: 1,
  class: "form-content"
}, lm = {
  key: 0,
  class: "form-header"
}, cm = {
  key: 0,
  class: "form-title"
}, um = {
  key: 1,
  class: "form-description"
}, fm = { class: "form-fields" }, hm = ["for"], dm = {
  key: 0,
  class: "required-indicator"
}, pm = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "disabled", "autocomplete", "inputmode"], gm = ["id", "placeholder", "required", "min", "max", "value", "onInput", "disabled"], mm = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "disabled"], _m = ["id", "required", "value", "onChange", "disabled"], bm = { value: "" }, vm = ["value"], ym = {
  key: 4,
  class: "checkbox-field"
}, wm = ["id", "checked", "onChange", "disabled"], km = ["for"], xm = {
  key: 5,
  class: "radio-field"
}, Am = ["id", "name", "value", "checked", "onChange", "disabled"], Tm = ["for"], Sm = {
  key: 6,
  class: "field-error"
}, Em = { class: "form-actions" }, Cm = ["onClick", "disabled"], Rm = {
  key: 2,
  class: "user-input-content"
}, Im = {
  key: 0,
  class: "user-input-prompt"
}, Lm = {
  key: 1,
  class: "user-input-form"
}, Om = ["onUpdate:modelValue", "onKeydown"], Pm = ["onClick", "disabled"], Nm = {
  key: 2,
  class: "user-input-submitted"
}, Mm = {
  key: 0,
  class: "user-input-confirmation"
}, Fm = {
  key: 3,
  class: "product-message-container"
}, Dm = ["innerHTML"], Bm = {
  key: 1,
  class: "products-carousel"
}, $m = { class: "carousel-items" }, Um = {
  key: 0,
  class: "product-image-compact"
}, zm = ["src", "alt"], Hm = { class: "product-info-compact" }, Wm = { class: "product-text-area" }, qm = { class: "product-title-compact" }, jm = {
  key: 0,
  class: "product-variant-compact"
}, Vm = { class: "product-price-compact" }, Km = { class: "product-actions-compact" }, Gm = ["onClick"], Ym = {
  key: 2,
  class: "no-products-message"
}, Xm = {
  key: 3,
  class: "no-products-message"
}, Zm = {
  key: 0,
  class: "message-streaming"
}, Jm = ["innerHTML"], Qm = {
  key: 2,
  class: "message-attachments"
}, e_ = {
  key: 0,
  class: "attachment-image-container"
}, t_ = ["src", "alt", "onClick"], n_ = { class: "attachment-image-info" }, s_ = ["href"], r_ = { class: "attachment-size" }, i_ = ["href"], o_ = { class: "attachment-size" }, a_ = {
  key: 0,
  class: "citation-chips"
}, l_ = ["title"], c_ = { class: "message-info" }, u_ = {
  key: 0,
  class: "agent-name"
}, f_ = {
  key: 4,
  class: "cm-quick-actions-bar"
}, h_ = ["disabled", "onClick"], d_ = {
  key: 0,
  class: "file-previews-widget"
}, p_ = {
  class: "file-preview-content-widget",
  style: { cursor: "pointer" }
}, g_ = ["src", "alt", "onClick"], m_ = ["onClick"], __ = { class: "file-preview-info-widget" }, b_ = { class: "file-preview-name-widget" }, v_ = { class: "file-preview-size-widget" }, y_ = ["onClick"], w_ = {
  key: 1,
  class: "upload-progress-widget"
}, k_ = { class: "message-input" }, x_ = ["placeholder", "disabled"], A_ = ["disabled", "title"], T_ = ["disabled"], S_ = { class: "conversation-ended-message" }, E_ = {
  key: 7,
  class: "rating-dialog"
}, C_ = { class: "rating-content" }, R_ = { class: "star-rating" }, I_ = ["onClick"], L_ = { class: "rating-actions" }, O_ = ["disabled"], P_ = {
  key: 0,
  class: "preview-modal-image-container"
}, N_ = ["src", "alt"], M_ = { class: "preview-modal-filename" }, F_ = {
  key: 3,
  class: "widget-loading"
}, Ss = "ctid", Ua = 3, D_ = "image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls", B_ = /* @__PURE__ */ Nu({
  __name: "WidgetBuilder",
  props: {
    widgetId: {},
    token: {},
    initialAuthError: {}
  },
  setup(e) {
    var Lo;
    Oe.setOptions({
      renderer: new Oe.Renderer(),
      gfm: !0,
      breaks: !0
    });
    const t = new Oe.Renderer(), n = t.link;
    t.link = (p, g, f) => n.call(t, p, g, f).replace(/^<a /, '<a target="_blank" rel="nofollow" '), Oe.use({ renderer: t });
    const s = (p) => _d(Oe(p, { renderer: t })), r = e, i = Ie(() => {
      var p;
      return r.widgetId || ((p = window.__INITIAL_DATA__) == null ? void 0 : p.widgetId);
    }), {
      customization: o,
      agentName: a,
      applyCustomization: l,
      initializeFromData: h
    } = Ap(), { formatCurrency: c } = Bp(), {
      messages: y,
      loading: _,
      errorMessage: M,
      showError: $,
      loadingHistory: Y,
      hasStartedChat: Re,
      connectionStatus: ne,
      sendMessage: Ce,
      loadChatHistory: xe,
      connect: z,
      reconnect: W,
      cleanup: ee,
      humanAgent: V,
      onTakeover: Pe,
      submitRating: rt,
      submitForm: je,
      currentForm: Ae,
      getWorkflowState: ge,
      proceedWorkflow: Ve,
      onWorkflowState: Je,
      onWorkflowProceeded: at,
      currentSessionId: oe,
      setToken: me,
      setWidgetId: ae
    } = bp(), { displayText: ut, isStreaming: it } = Ep(y, () => Ai(() => Lt()));
    Cp(y);
    const ie = ce(""), nt = ce(!0), be = ce(""), q = ce(!1), de = (p) => {
      const g = p.target;
      ie.value = g.value;
    };
    let re = null;
    const j = () => {
      re && re.disconnect(), re = new MutationObserver((g) => {
        let f = !1, J = !1;
        g.forEach((ye) => {
          if (ye.type === "childList") {
            const fe = Array.from(ye.addedNodes).some(
              (we) => {
                var jt;
                return we.nodeType === Node.ELEMENT_NODE && (we.matches("input, textarea") || ((jt = we.querySelector) == null ? void 0 : jt.call(we, "input, textarea")));
              }
            ), qe = Array.from(ye.removedNodes).some(
              (we) => {
                var jt;
                return we.nodeType === Node.ELEMENT_NODE && (we.matches("input, textarea") || ((jt = we.querySelector) == null ? void 0 : jt.call(we, "input, textarea")));
              }
            );
            fe && (J = !0, f = !0), qe && (f = !0);
          }
        }), f && (clearTimeout(j.timeoutId), j.timeoutId = setTimeout(() => {
          Ke();
        }, J ? 50 : 100));
      });
      const p = document.querySelector(".widget-container") || document.body;
      re.observe(p, {
        childList: !0,
        subtree: !0
      });
    };
    j.timeoutId = null;
    let He = [];
    const Ke = () => {
      gt();
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
        const J = document.querySelectorAll(f);
        if (J.length > 0) {
          g = Array.from(J);
          break;
        }
      }
      g.length !== 0 && (He = g, g.forEach((f) => {
        f.addEventListener("input", d, !0), f.addEventListener("keyup", d, !0), f.addEventListener("change", d, !0), f.addEventListener("keypress", b, !0), f.addEventListener("keydown", k, !0);
      }));
    }, gt = () => {
      He.forEach((p) => {
        p.removeEventListener("input", d), p.removeEventListener("keyup", d), p.removeEventListener("change", d), p.removeEventListener("keypress", b), p.removeEventListener("keydown", k);
      }), He = [];
    }, It = (p) => !!(p && p.closest && p.closest(".form-message, .form-fullscreen, .cm-email-gate")), d = (p) => {
      if (It(p.target)) return;
      const g = p.target;
      ie.value = g.value;
    }, b = (p) => {
      It(p.target) || p.key === "Enter" && !p.shiftKey && (p.preventDefault(), p.stopPropagation(), _t());
    }, k = (p) => {
      It(p.target) || p.key === "Enter" && !p.shiftKey && (p.preventDefault(), p.stopPropagation(), _t());
    }, L = (p) => {
      const g = p.target, f = document.querySelector(".header-menu-container");
      document.querySelector(".header-menu-btn");
      const J = document.querySelector(".header-dropdown-menu");
      J && !(f != null && f.contains(g)) && (J.style.display = "none");
    }, R = ce(!0), I = (p) => !p || p === "undefined" || p === "null" || typeof p == "string" && p.trim() === "" ? null : p, B = ce(I(((Lo = window.__INITIAL_DATA__) == null ? void 0 : Lo.initialToken) || localStorage.getItem(Ss)));
    Ie(() => !!B.value);
    const D = ce(null), F = ce(!1), P = ce(!1);
    r.initialAuthError && (D.value = r.initialAuthError, F.value = !0, R.value = !1), h();
    const X = window.__INITIAL_DATA__;
    if (X != null && X.initialToken) {
      const p = I(X.initialToken);
      p && (B.value = p, window.parent.postMessage({
        type: "TOKEN_UPDATE",
        token: p
      }, "*"), q.value = !0);
    }
    const U = ce(!1);
    (X == null ? void 0 : X.allowAttachments) !== void 0 && (U.value = X.allowAttachments);
    const K = ce(null), {
      chatStyles: Q,
      chatIconStyles: ue,
      agentBubbleStyles: Te,
      userBubbleStyles: pe,
      messageNameStyles: Fe,
      headerBorderStyles: De,
      photoUrl: Qe,
      shadowStyle: u
    } = wd(o), v = ce(null), {
      uploadedAttachments: A,
      previewModal: x,
      previewFile: N,
      formatFileSize: G,
      isImageAttachment: te,
      getDownloadUrl: ve,
      getPreviewUrl: Se,
      handleFileSelect: Ge,
      handleDrop: Ne,
      handleDragOver: ht,
      handleDragLeave: vt,
      handlePaste: We,
      removeAttachment: Xt,
      openPreview: as,
      closePreview: Fn,
      openFilePicker: Vn,
      isImage: ls
    } = Ad(B, v);
    Ie(() => y.value.some(
      (p) => p.message_type === "form" && (!p.isSubmitted || p.isSubmitted === !1)
    ));
    const Wt = Ie(() => {
      var p;
      return Re.value && q.value || !Yr.value ? ne.value === "connected" && !_.value : _s(be.value.trim()) && ne.value === "connected" && !_.value || ((p = window.__INITIAL_DATA__) == null ? void 0 : p.workflow);
    }), Ks = Ie(() => ne.value === "connected" ? qt.value ? "Ask me anything..." : "Type a message..." : "Connecting..."), _t = async () => {
      if (!ie.value.trim() && A.value.length === 0) return;
      !Re.value && be.value && await cn();
      const p = A.value.map((f) => ({
        content: f.content,
        // base64 content
        filename: f.filename,
        content_type: f.type,
        size: f.size
      }));
      await Ce(ie.value, be.value, p), A.value.forEach((f) => {
        f.url && f.url.startsWith("blob:") && URL.revokeObjectURL(f.url), f.file_url && f.file_url.startsWith("blob:") && URL.revokeObjectURL(f.file_url);
      }), ie.value = "", A.value = [];
      const g = document.querySelector('input[placeholder*="Type a message"]');
      g && (g.value = ""), setTimeout(() => {
        Ke();
      }, 500);
    }, kn = (p) => {
      Wt.value && (ie.value = p, _t());
    }, Gs = () => {
      window.parent.postMessage({ type: "WIDGET_MINIMIZE" }, "*");
    }, cs = (p) => {
      p.key === "Enter" && !p.shiftKey && (p.preventDefault(), p.stopPropagation(), _t());
    }, cn = async () => {
      var p, g, f, J;
      try {
        if (!i.value)
          return console.error("Widget ID is not available"), D.value = "Widget ID is not available. Please refresh and try again.", F.value = !0, !1;
        const ye = new URL(`${Rn.API_URL}/widgets/${i.value}`);
        be.value.trim() && _s(be.value.trim()) && ye.searchParams.append("email", be.value.trim());
        const fe = {
          Accept: "application/json",
          "Content-Type": "application/json"
        };
        B.value && (fe.Authorization = `Bearer ${B.value}`);
        const qe = await fetch(ye, {
          headers: fe
        });
        if (qe.status === 401) {
          q.value = !1;
          try {
            const Yn = (await qe.json()).detail || "";
            (Yn.includes("generate-token") || Yn.includes("API key") || Yn.includes("Token required")) && (P.value = !0, D.value = "Widget authentication not configured. Please contact the website administrator.", F.value = !0, localStorage.removeItem(Ss), B.value = null);
          } catch {
            D.value = "Authentication required. Your token has expired or is invalid. Please refresh the page.", F.value = !0, localStorage.removeItem(Ss), B.value = null;
          }
          return !1;
        }
        if (!qe.ok) {
          try {
            const ds = await qe.json();
            D.value = ds.detail || `Error: ${qe.statusText}`;
          } catch {
            D.value = `Error: ${qe.statusText}. Please try again.`;
          }
          return F.value = !0, !1;
        }
        const we = await qe.json();
        return we.token && (B.value = we.token, localStorage.setItem(Ss, we.token), window.parent.postMessage({ type: "TOKEN_UPDATE", token: we.token }, "*")), q.value = !0, D.value = null, F.value = !1, me(B.value || void 0), await z() ? (await Ys(), (p = we.agent) != null && p.customization && l(we.agent.customization), we.agent && !(we != null && we.human_agent) && (a.value = we.agent.name), we != null && we.human_agent && (V.value = we.human_agent), ((g = we.agent) == null ? void 0 : g.allow_attachments) !== void 0 && (U.value = we.agent.allow_attachments), ((f = we.agent) == null ? void 0 : f.workflow) !== void 0 && (window.__INITIAL_DATA__ = window.__INITIAL_DATA__ || {}, window.__INITIAL_DATA__.workflow = we.agent.workflow), (J = we.agent) != null && J.workflow && await ge(), !0) : (console.error("Failed to connect to chat service"), D.value = "Failed to connect to chat service. Please try again.", F.value = !0, !1);
      } catch (ye) {
        return console.error("Error checking authorization:", ye), D.value = "An unexpected error occurred. Please try again.", F.value = !0, q.value = !1, !1;
      } finally {
        R.value = !1;
      }
    }, Ys = async () => {
      !Re.value && q.value && (Re.value = !0, await xe());
    }, Lt = () => {
      K.value && (K.value.scrollTop = K.value.scrollHeight);
    };
    mn(() => y.value, (p) => {
      Ai(() => {
        Lt();
      });
    }, { deep: !0 }), mn(ne, (p, g) => {
      p === "connected" && g !== "connected" && setTimeout(Ke, 100);
    }), mn(() => y.value.length, (p, g) => {
      p > 0 && g === 0 && setTimeout(Ke, 100);
    }), mn(() => y.value, (p) => {
      if (p.length > 0) {
        const g = p[p.length - 1];
        mt(g);
      }
    }, { deep: !0 });
    const Xs = async () => {
      await W() && await cn();
    }, us = ce(!1), Dn = ce(0), Kn = ce(""), Dt = ce(0), Z = ce(!1), m = ce({}), O = ce(!1), H = ce({}), Me = ce(!1), lt = ce(null), ct = ce("Start Chat"), ft = ce(!1), st = ce(null);
    Ie(() => {
      var g;
      const p = y.value[y.value.length - 1];
      return ((g = p == null ? void 0 : p.attributes) == null ? void 0 : g.request_rating) || !1;
    });
    const Zt = Ie(() => {
      var g;
      if (!((g = window.__INITIAL_DATA__) != null && g.workflow))
        return !1;
      const p = y.value.find((f) => f.message_type === "rating");
      return (p == null ? void 0 : p.isSubmitted) === !0;
    }), un = Ie(() => V.value.human_agent_profile_pic ? mo(V.value.human_agent_profile_pic) ? V.value.human_agent_profile_pic : `${Rn.API_URL}${V.value.human_agent_profile_pic}` : ""), mt = async (p) => {
      var g, f, J, ye, fe;
      try {
        if (p.session_id && B.value && i.value) {
          const qe = new URL(`${Rn.API_URL}/widgets/${i.value}/end-chat`);
          qe.searchParams.append("session_id", p.session_id), (g = p.attributes) != null && g.end_chat_reason && qe.searchParams.append("reason", p.attributes.end_chat_reason), (f = p.attributes) != null && f.end_chat_description && qe.searchParams.append("description", p.attributes.end_chat_description);
          const we = await fetch(qe, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${B.value}`,
              "Content-Type": "application/json"
            }
          });
          if (we.ok) {
            const jt = await we.json();
            console.info(`✓ Chat session closed on backend: ${jt.session_id}`);
          } else
            console.warn(`Failed to close session on backend: ${we.status}`);
        }
      } catch (qe) {
        console.error("Error calling end-chat API:", qe);
      }
      if ((J = p.attributes) != null && J.end_chat && ((ye = p.attributes) != null && ye.request_rating)) {
        const qe = p.agent_name || ((fe = V.value) == null ? void 0 : fe.human_agent_name) || a.value || "our agent";
        y.value.push({
          message: `Rate the chat session that you had with ${qe}`,
          message_type: "rating",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          session_id: p.session_id,
          agent_name: qe,
          showFeedback: !1
        }), oe.value = p.session_id;
      }
    }, Zs = (p) => {
      Z.value || (Dt.value = p);
    }, Js = () => {
      if (!Z.value) {
        const p = y.value[y.value.length - 1];
        Dt.value = (p == null ? void 0 : p.selectedRating) || 0;
      }
    }, wc = async (p) => {
      if (!Z.value) {
        Dt.value = p;
        const g = y.value[y.value.length - 1];
        g && g.message_type === "rating" && (g.showFeedback = !0, g.selectedRating = p);
      }
    }, kc = async (p, g, f = null) => {
      try {
        Z.value = !0, await rt(g, f);
        const J = y.value.find((ye) => ye.message_type === "rating");
        J && (J.isSubmitted = !0, J.finalRating = g, J.finalFeedback = f);
      } catch (J) {
        console.error("Failed to submit rating:", J);
      } finally {
        Z.value = !1;
      }
    }, xc = (p) => {
      const g = {};
      for (const f of p.fields) {
        const J = m.value[f.name], ye = jr(f, J);
        ye && (g[f.name] = ye);
      }
      return H.value = g, Object.keys(g).length === 0;
    }, Ac = async (p) => {
      if (!(O.value || !xc(p)))
        try {
          O.value = !0, await je(m.value);
          const f = y.value.findIndex(
            (J) => J.message_type === "form" && (!J.isSubmitted || J.isSubmitted === !1)
          );
          f !== -1 && y.value.splice(f, 1), m.value = {}, H.value = {};
        } catch (f) {
          console.error("Failed to submit form:", f);
        } finally {
          O.value = !1;
        }
    }, Ot = (p, g) => {
      var f, J;
      if (m.value[p] = g, g && g.toString().trim() !== "") {
        let ye = null;
        if ((f = st.value) != null && f.fields && (ye = st.value.fields.find((fe) => fe.name === p)), !ye && ((J = Ae.value) != null && J.fields) && (ye = Ae.value.fields.find((fe) => fe.name === p)), ye) {
          const fe = jr(ye, g);
          fe ? (H.value[p] = fe, console.log(`Validation error for ${p}:`, fe)) : delete H.value[p];
        }
      } else
        delete H.value[p], console.log(`Cleared error for ${p}`);
    }, Tc = (p) => {
      const g = p.replace(/\D/g, "");
      return g.length >= 7 && g.length <= 15;
    }, jr = (p, g) => {
      if (p.required && (!g || g.toString().trim() === ""))
        return `${p.label} is required`;
      if (!g || g.toString().trim() === "")
        return null;
      if (p.type === "email" && !_s(g))
        return "Please enter a valid email address";
      if (p.type === "tel" && !Tc(g))
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
    }, Sc = async () => {
      if (!(O.value || !st.value))
        try {
          O.value = !0, H.value = {};
          let p = !1;
          for (const g of st.value.fields || []) {
            const f = m.value[g.name], J = jr(g, f);
            J && (H.value[g.name] = J, p = !0, console.log(`Validation error for field ${g.name}:`, J));
          }
          if (p) {
            O.value = !1, console.log("Validation failed, not submitting");
            return;
          }
          await je(m.value), ft.value = !1, st.value = null, m.value = {};
        } catch (p) {
          console.error("Failed to submit full screen form:", p);
        } finally {
          O.value = !1, console.log("Full screen form submission completed");
        }
    }, Ec = (p, g) => {
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
    }, Cc = (p) => {
      if (!p) return "";
      let g = p.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "");
      const f = [];
      return g = g.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (J, ye, fe) => {
        const qe = `__MARKDOWN_LINK_${f.length}__`;
        return console.log("Found markdown link:", J, "-> placeholder:", qe), f.push(J), qe;
      }), console.log("After replacing markdown links with placeholders:", g), console.log("Markdown links array:", f), g = g.replace(/https?:\/\/[^\s\)]+/g, "[link removed]"), console.log("After removing standalone URLs:", g), f.forEach((J, ye) => {
        g = g.replace(`__MARKDOWN_LINK_${ye}__`, J), console.log(`Restored markdown link ${ye}:`, J);
      }), g = g.replace(/\n\s*\n\s*\n/g, `

`).trim(), g;
    }, ko = ce(!1);
    ce(!1);
    const Rc = Ie(() => {
      var g;
      const p = !!((g = V.value) != null && g.human_agent_name);
      return U.value && p && A.value.length < Ua;
    }), Ic = async () => {
      try {
        Me.value = !1, lt.value = null, await Ve();
      } catch (p) {
        console.error("Failed to proceed workflow:", p);
      }
    }, Vr = async (p) => {
      try {
        if (!p.userInputValue || !p.userInputValue.trim())
          return;
        const g = p.userInputValue.trim();
        p.isSubmitted = !0, p.submittedValue = g, await Ce(g, be.value);
      } catch (g) {
        console.error("Failed to submit user input:", g), p.isSubmitted = !1, p.submittedValue = null;
      }
    }, xo = async () => {
      var p, g, f;
      try {
        let J = 0;
        const ye = 50;
        for (; !((p = window.__INITIAL_DATA__) != null && p.widgetId) && J < ye; )
          await new Promise((qe) => setTimeout(qe, 100)), J++;
        return (g = window.__INITIAL_DATA__) != null && g.widgetId ? (ae(window.__INITIAL_DATA__.widgetId), await cn() ? ((f = window.__INITIAL_DATA__) != null && f.workflow && q.value && await ge(), !0) : (ne.value = "connected", !1)) : (console.error("Widget data not available after waiting"), !1);
      } catch (J) {
        return console.error("Failed to initialize widget:", J), !1;
      }
    }, Lc = () => {
      Pe(async () => {
        await cn();
      }), window.addEventListener("message", (p) => {
        p.data.type === "SCROLL_TO_BOTTOM" && Lt(), p.data.type === "TOKEN_RECEIVED" && localStorage.setItem(Ss, p.data.token);
      }), Je((p) => {
        var g;
        if (ct.value = p.button_text || "Start Chat", p.type === "landing_page")
          lt.value = p.landing_page_data, Me.value = !0, ft.value = !1;
        else if (p.type === "form" || p.type === "display_form")
          if (((g = p.form_data) == null ? void 0 : g.form_full_screen) === !0)
            st.value = p.form_data, ft.value = !0, Me.value = !1;
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
            y.value.findIndex(
              (ye) => ye.message_type === "form" && !ye.isSubmitted
            ) === -1 && y.value.push(f), Me.value = !1, ft.value = !1;
          }
        else
          Me.value = !1, ft.value = !1;
      }), at((p) => {
        console.log("Workflow proceeded:", p);
      });
    }, Oc = async () => {
      try {
        await xo(), await ge();
      } catch (p) {
        throw console.error("Failed to start new conversation:", p), p;
      }
    }, Pc = async () => {
      Zt.value = !1, y.value = [], await Oc();
    };
    to(async () => {
      await xo(), Lc(), j(), document.addEventListener("click", L), (() => {
        const g = y.value.length > 0, f = ne.value === "connected", J = document.querySelector('input[type="text"], textarea') !== null;
        return g || f || J;
      })() && setTimeout(Ke, 100);
    }), qs(() => {
      window.removeEventListener("message", (p) => {
        p.data.type === "SCROLL_TO_BOTTOM" && Lt();
      }), document.removeEventListener("click", L), re && (re.disconnect(), re = null), j.timeoutId && (clearTimeout(j.timeoutId), j.timeoutId = null), gt(), ee();
    });
    const Gn = Ie(() => o.value.chat_style === "AURORA"), qt = Ie(() => o.value.chat_style === "ASK_ANYTHING" || Gn.value), Ao = Ie(() => o.value.customization_metadata), Kr = Ie(() => {
      var g;
      const p = (g = Ao.value) == null ? void 0 : g.avatar_style;
      return p === "orb" ? !0 : p === "photo" ? !1 : Gn.value && !o.value.photo_url;
    }), Qs = Ie(() => {
      var p;
      return yd(a.value || "", (p = Ao.value) == null ? void 0 : p.orb_variant);
    }), Nc = {
      GLASS: "theme-glass",
      TERMINAL: "theme-terminal",
      PLAYFUL: "theme-playful",
      CALM_MINT: "theme-calm",
      SUNRISE: "theme-sunrise"
    }, Mc = Ie(() => Nc[o.value.chat_style] || ""), Fc = Ie(() => Dp(o.value.chat_style)), To = Ie(
      () => Array.isArray(o.value.quick_actions) ? o.value.quick_actions.filter((p) => !!p && p.trim().length > 0) : []
    ), So = Ie(() => (o.value.welcome_message || "").trim()), Eo = Ie(
      () => !qt.value && y.value.length === 0 && !Y.value && !hs.value
    ), Dc = Ie(
      () => Eo.value && So.value.length > 0
    ), Bc = Ie(
      () => Eo.value && !Zt.value && To.value.length > 0
    ), Gr = Ie(() => o.value.show_citations === !0), Yr = Ie(() => o.value.collect_email === !0 && !qt.value), Co = ce(!1), xn = ce(""), fs = ce(!1), hs = Ie(() => !Re.value && Yr.value && !Co.value), Ro = async () => {
      const p = be.value.trim();
      if (!p) {
        xn.value = "Please enter your email address.";
        return;
      }
      if (!_s(p)) {
        xn.value = "Please enter a valid email address.";
        return;
      }
      xn.value = "", fs.value = !0;
      try {
        await cn(), Co.value = !0;
      } catch {
        xn.value = "Something went wrong. Please try again.";
      } finally {
        fs.value = !1;
      }
    }, $c = Ie(() => {
      const p = {
        width: "100%",
        height: "580px",
        borderRadius: "var(--radius-lg)"
      };
      return window.innerWidth <= 768 && (p.width = "100vw", p.height = "100vh", p.borderRadius = "0", p.position = "fixed", p.top = "0", p.left = "0", p.bottom = "0", p.right = "0", p.maxWidth = "100vw", p.maxHeight = "100vh"), qt.value ? window.innerWidth <= 768 ? {
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
    }), Io = Ie(() => qt.value && y.value.length === 0);
    return (p, g) => F.value && P.value ? (T(), S("div", $p, g[19] || (g[19] = [
      Un('<div class="widget-unavailable-card" data-v-6ba357bd><div class="widget-unavailable-icon-wrapper" data-v-6ba357bd><svg class="widget-unavailable-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-v-6ba357bd><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" data-v-6ba357bd></path><path d="M9 12l2 2 4-4" data-v-6ba357bd></path></svg></div><h2 class="widget-unavailable-title" data-v-6ba357bd>Chat Unavailable</h2><p class="widget-unavailable-message" data-v-6ba357bd> This chat widget is not currently configured. Please contact the website administrator to enable chat support. </p><div class="widget-unavailable-footer" data-v-6ba357bd><svg class="chattermate-logo-small" width="14" height="14" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-6ba357bd><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-6ba357bd></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-6ba357bd></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-6ba357bd></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-6ba357bd></circle></svg><span class="cm-powered-prefix" data-v-6ba357bd>Powered by </span><strong class="cm-brand" data-v-6ba357bd>ChatterMate</strong></div></div>', 1)
    ]))) : F.value ? (T(), S("div", Up, [
      w("div", zp, [
        g[20] || (g[20] = Un('<div class="auth-error-header" data-v-6ba357bd><svg class="auth-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-6ba357bd><circle cx="12" cy="12" r="10" data-v-6ba357bd></circle><line x1="12" y1="8" x2="12" y2="12" data-v-6ba357bd></line><line x1="12" y1="16" x2="12.01" y2="16" data-v-6ba357bd></line></svg><h2 data-v-6ba357bd>Authentication Error</h2></div>', 1)),
        w("p", Hp, se(D.value), 1),
        w("button", {
          class: "auth-error-refresh-btn",
          onClick: g[0] || (g[0] = () => p.window.location.reload())
        }, " Refresh Page ")
      ])
    ])) : i.value && !F.value ? (T(), S("div", {
      key: 2,
      class: Xe(["chat-container", [{ collapsed: !nt.value, "ask-anything-style": qt.value, aurora: Gn.value }, Mc.value]]),
      style: ke({ ...E(u), ...$c.value, ...Fc.value, "--cm-accent": E(o).accent_color || "#C9F24E" })
    }, [
      R.value ? (T(), S("div", Wp, g[21] || (g[21] = [
        Un('<div class="loading-spinner" data-v-6ba357bd><div class="dot" data-v-6ba357bd></div><div class="dot" data-v-6ba357bd></div><div class="dot" data-v-6ba357bd></div></div><div class="loading-text" data-v-6ba357bd>Initializing chat...</div>', 2)
      ]))) : le("", !0),
      !R.value && E(ne) !== "connected" ? (T(), S("div", {
        key: 1,
        class: Xe(["connection-status", E(ne)])
      }, [
        E(ne) === "connecting" ? (T(), S("div", qp, g[22] || (g[22] = [
          Qt(" Connecting to chat service... ", -1),
          w("div", { class: "loading-dots" }, [
            w("div", { class: "dot" }),
            w("div", { class: "dot" }),
            w("div", { class: "dot" })
          ], -1)
        ]))) : E(ne) === "failed" ? (T(), S("div", jp, [
          g[23] || (g[23] = Qt(" Connection failed. ", -1)),
          w("button", {
            onClick: Xs,
            class: "reconnect-button"
          }, " Click here to reconnect ")
        ])) : le("", !0)
      ], 2)) : le("", !0),
      E($) ? (T(), S("div", {
        key: 2,
        class: "error-alert",
        style: ke(E(ue))
      }, se(E(M)), 5)) : le("", !0),
      Io.value ? (T(), S("div", {
        key: 3,
        class: Xe(["welcome-message-section", { aurora: Gn.value }]),
        style: ke(E(Q))
      }, [
        w("div", Vp, [
          w("div", Kp, [
            Kr.value ? (T(), S("div", {
              key: 0,
              class: "welcome-orb",
              style: ke(Qs.value)
            }, null, 4)) : E(Qe) ? (T(), S("img", {
              key: 1,
              src: E(Qe),
              alt: E(a),
              class: "welcome-avatar"
            }, null, 8, Gp)) : le("", !0),
            w("h1", Yp, se(E(o).welcome_title || `Welcome to ${E(a)}`), 1),
            w("p", Xp, se(E(o).welcome_subtitle || "I'm here to help you with anything you need. What can I assist you with today?"), 1)
          ])
        ]),
        w("div", Zp, [
          !E(Re) && !q.value && Yr.value ? (T(), S("div", Jp, [
            An(w("input", {
              "onUpdate:modelValue": g[1] || (g[1] = (f) => be.value = f),
              type: "email",
              placeholder: "Enter your email address",
              disabled: E(_) || E(ne) !== "connected",
              class: Xe([{
                invalid: be.value.trim() && !E(_s)(be.value.trim()),
                disabled: E(ne) !== "connected"
              }, "welcome-email-input"])
            }, null, 10, Qp), [
              [zn, be.value]
            ])
          ])) : le("", !0),
          w("div", eg, [
            An(w("input", {
              "onUpdate:modelValue": g[2] || (g[2] = (f) => ie.value = f),
              type: "text",
              placeholder: Ks.value,
              onKeypress: cs,
              onInput: de,
              onChange: de,
              disabled: !Wt.value,
              class: Xe([{ disabled: !Wt.value }, "welcome-message-field"])
            }, null, 42, tg), [
              [zn, ie.value]
            ]),
            w("button", {
              class: Xe(["welcome-send-button", { "aurora-send": Gn.value }]),
              style: ke(E(pe)),
              onClick: _t,
              disabled: !ie.value.trim() || !Wt.value
            }, [
              Gn.value ? (T(), S("svg", sg, g[24] || (g[24] = [
                w("path", {
                  d: "M12 19V5M12 5L5 12M12 5L19 12",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                }, null, -1)
              ]))) : (T(), S("svg", rg, g[25] || (g[25] = [
                w("path", {
                  d: "M5 12L3 21L21 12L3 3L5 12ZM5 12L13 12",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                }, null, -1)
              ])))
            ], 14, ng)
          ])
        ]),
        w("div", {
          class: "powered-by-welcome",
          style: ke(E(Fe))
        }, g[26] || (g[26] = [
          Un('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-6ba357bd><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-6ba357bd></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-6ba357bd></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-6ba357bd></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-6ba357bd></circle></svg><span class="cm-powered-prefix" data-v-6ba357bd>Powered by </span><strong class="cm-brand" data-v-6ba357bd>ChatterMate</strong>', 3)
        ]), 4)
      ], 6)) : le("", !0),
      Me.value && lt.value ? (T(), S("div", {
        key: 4,
        class: "landing-page-fullscreen",
        style: ke(E(Q))
      }, [
        w("div", ig, [
          w("div", og, [
            w("h2", ag, se(lt.value.heading), 1),
            w("div", lg, se(lt.value.content), 1)
          ]),
          w("div", cg, [
            w("button", {
              class: "landing-page-button",
              onClick: Ic
            }, se(ct.value), 1)
          ])
        ]),
        w("div", {
          class: "powered-by-landing",
          style: ke(E(Fe))
        }, g[27] || (g[27] = [
          Un('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-6ba357bd><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-6ba357bd></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-6ba357bd></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-6ba357bd></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-6ba357bd></circle></svg><span class="cm-powered-prefix" data-v-6ba357bd>Powered by </span><strong class="cm-brand" data-v-6ba357bd>ChatterMate</strong>', 3)
        ]), 4)
      ], 4)) : ft.value && st.value ? (T(), S("div", {
        key: 5,
        class: "form-fullscreen",
        style: ke(E(Q))
      }, [
        w("div", ug, [
          st.value.title || st.value.description ? (T(), S("div", fg, [
            st.value.title ? (T(), S("h2", hg, se(st.value.title), 1)) : le("", !0),
            st.value.description ? (T(), S("p", dg, se(st.value.description), 1)) : le("", !0)
          ])) : le("", !0),
          w("div", pg, [
            (T(!0), S(et, null, Pt(st.value.fields, (f) => {
              var J, ye;
              return T(), S("div", {
                key: f.name,
                class: "form-field"
              }, [
                w("label", {
                  for: `fullscreen-form-${f.name}`,
                  class: "field-label"
                }, [
                  Qt(se(f.label) + " ", 1),
                  f.required ? (T(), S("span", mg, "*")) : le("", !0)
                ], 8, gg),
                f.type === "text" || f.type === "email" || f.type === "tel" ? (T(), S("input", {
                  key: 0,
                  id: `fullscreen-form-${f.name}`,
                  type: f.type,
                  placeholder: f.placeholder || "",
                  required: f.required,
                  minlength: f.minLength,
                  maxlength: f.maxLength,
                  value: m.value[f.name] || "",
                  onInput: (fe) => Ot(f.name, fe.target.value),
                  onBlur: (fe) => Ot(f.name, fe.target.value),
                  class: Xe(["form-input", { error: H.value[f.name] }]),
                  autocomplete: f.type === "email" ? "email" : f.type === "tel" ? "tel" : "off",
                  inputmode: f.type === "tel" ? "tel" : f.type === "email" ? "email" : "text"
                }, null, 42, _g)) : f.type === "number" ? (T(), S("input", {
                  key: 1,
                  id: `fullscreen-form-${f.name}`,
                  type: "number",
                  placeholder: f.placeholder || "",
                  required: f.required,
                  min: f.minLength,
                  max: f.maxLength,
                  value: m.value[f.name] || "",
                  onInput: (fe) => Ot(f.name, fe.target.value),
                  class: Xe(["form-input", { error: H.value[f.name] }])
                }, null, 42, bg)) : f.type === "textarea" ? (T(), S("textarea", {
                  key: 2,
                  id: `fullscreen-form-${f.name}`,
                  placeholder: f.placeholder || "",
                  required: f.required,
                  minlength: f.minLength,
                  maxlength: f.maxLength,
                  value: m.value[f.name] || "",
                  onInput: (fe) => Ot(f.name, fe.target.value),
                  class: Xe(["form-textarea", { error: H.value[f.name] }]),
                  rows: "4"
                }, null, 42, vg)) : f.type === "select" ? (T(), S("select", {
                  key: 3,
                  id: `fullscreen-form-${f.name}`,
                  required: f.required,
                  value: m.value[f.name] || "",
                  onChange: (fe) => Ot(f.name, fe.target.value),
                  class: Xe(["form-select", { error: H.value[f.name] }])
                }, [
                  w("option", wg, se(f.placeholder || "Please select..."), 1),
                  (T(!0), S(et, null, Pt((Array.isArray(f.options) ? f.options : ((J = f.options) == null ? void 0 : J.split(`
`)) || []).filter((fe) => fe.trim()), (fe) => (T(), S("option", {
                    key: fe,
                    value: fe.trim()
                  }, se(fe.trim()), 9, kg))), 128))
                ], 42, yg)) : f.type === "checkbox" ? (T(), S("label", xg, [
                  w("input", {
                    id: `fullscreen-form-${f.name}`,
                    type: "checkbox",
                    required: f.required,
                    checked: m.value[f.name] || !1,
                    onChange: (fe) => Ot(f.name, fe.target.checked),
                    class: "form-checkbox"
                  }, null, 40, Ag),
                  w("span", Tg, se(f.label), 1)
                ])) : f.type === "radio" ? (T(), S("div", Sg, [
                  (T(!0), S(et, null, Pt((Array.isArray(f.options) ? f.options : ((ye = f.options) == null ? void 0 : ye.split(`
`)) || []).filter((fe) => fe.trim()), (fe) => (T(), S("label", {
                    key: fe,
                    class: "radio-field"
                  }, [
                    w("input", {
                      type: "radio",
                      name: `fullscreen-form-${f.name}`,
                      value: fe.trim(),
                      required: f.required,
                      checked: m.value[f.name] === fe.trim(),
                      onChange: (qe) => Ot(f.name, fe.trim()),
                      class: "form-radio"
                    }, null, 40, Eg),
                    w("span", Cg, se(fe.trim()), 1)
                  ]))), 128))
                ])) : le("", !0),
                H.value[f.name] ? (T(), S("div", Rg, se(H.value[f.name]), 1)) : le("", !0)
              ]);
            }), 128))
          ]),
          w("div", Ig, [
            w("button", {
              onClick: g[3] || (g[3] = () => {
                console.log("Submit button clicked!"), Sc();
              }),
              disabled: O.value,
              class: "submit-form-button",
              style: ke(E(pe))
            }, [
              O.value ? (T(), S("span", Og, g[28] || (g[28] = [
                w("div", { class: "dot" }, null, -1),
                w("div", { class: "dot" }, null, -1),
                w("div", { class: "dot" }, null, -1)
              ]))) : (T(), S("span", Pg, se(st.value.submit_button_text || "Submit"), 1))
            ], 12, Lg)
          ])
        ]),
        w("div", {
          class: "powered-by-landing",
          style: ke(E(Fe))
        }, g[29] || (g[29] = [
          Un('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-6ba357bd><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-6ba357bd></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-6ba357bd></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-6ba357bd></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-6ba357bd></circle></svg><span class="cm-powered-prefix" data-v-6ba357bd>Powered by </span><strong class="cm-brand" data-v-6ba357bd>ChatterMate</strong>', 3)
        ]), 4)
      ], 4)) : Io.value ? le("", !0) : (T(), S(et, { key: 6 }, [
        nt.value ? (T(), S("div", {
          key: 0,
          class: Xe(["chat-panel", { "ask-anything-chat": qt.value }]),
          style: ke(E(Q))
        }, [
          qt.value ? (T(), S("div", {
            key: 1,
            class: "ask-anything-top",
            style: ke(E(De))
          }, [
            w("div", Bg, [
              un.value || E(Qe) ? (T(), S("img", {
                key: 0,
                src: un.value || E(Qe),
                alt: E(V).human_agent_name || E(a),
                class: "header-avatar"
              }, null, 8, $g)) : le("", !0),
              w("div", Ug, [
                w("h3", {
                  style: ke(E(Fe))
                }, se(E(a)), 5),
                w("p", {
                  class: "ask-anything-subtitle",
                  style: ke(E(Fe))
                }, se(E(o).welcome_subtitle || "Ask me anything. I'm here to help."), 5)
              ])
            ])
          ], 4)) : (T(), S("div", {
            key: 0,
            class: "chat-header",
            style: ke(E(De))
          }, [
            w("div", {
              class: "cm-header-sheen",
              style: ke({ background: "linear-gradient(90deg, transparent, " + (E(o).accent_color || "#C9F24E") + ", transparent)" })
            }, null, 4),
            w("div", Ng, [
              !un.value && (Kr.value || !E(Qe)) ? (T(), S("div", {
                key: 0,
                class: "header-orb",
                style: ke(Qs.value)
              }, null, 4)) : un.value || E(Qe) ? (T(), S("img", {
                key: 1,
                src: un.value || E(Qe),
                alt: E(V).human_agent_name || E(a),
                class: "header-avatar"
              }, null, 8, Mg)) : le("", !0),
              w("div", Fg, [
                w("h3", {
                  style: ke(E(Fe))
                }, se(E(V).human_agent_name || E(a)), 5),
                w("div", Dg, [
                  g[30] || (g[30] = w("span", { class: "status-indicator online" }, null, -1)),
                  w("span", {
                    class: "status-text",
                    style: ke(E(Fe))
                  }, "Online · replies instantly", 4)
                ])
              ])
            ]),
            w("button", {
              type: "button",
              class: "header-minimize",
              style: ke(E(Fe)),
              title: "Minimize",
              "aria-label": "Minimize chat",
              onClick: Gs
            }, g[31] || (g[31] = [
              w("svg", {
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
                w("path", { d: "M6 9l6 6 6-6" })
              ], -1)
            ]), 4)
          ], 4)),
          E(Y) ? (T(), S("div", zg, g[32] || (g[32] = [
            w("div", { class: "loading-spinner" }, [
              w("div", { class: "dot" }),
              w("div", { class: "dot" }),
              w("div", { class: "dot" })
            ], -1)
          ]))) : le("", !0),
          hs.value ? (T(), S("div", {
            key: 3,
            class: "cm-email-gate",
            style: ke(E(Q))
          }, [
            w("div", {
              class: "cm-email-gate-orb",
              style: ke(Qs.value)
            }, null, 4),
            w("h3", Hg, se(E(o).welcome_title || "Before we start"), 1),
            g[33] || (g[33] = w("p", { class: "cm-email-gate-text" }, "Enter your email and we'll continue the chat.", -1)),
            An(w("input", {
              "onUpdate:modelValue": g[4] || (g[4] = (f) => be.value = f),
              type: "email",
              inputmode: "email",
              autocomplete: "email",
              placeholder: "you@example.com",
              class: Xe(["cm-email-gate-input", { invalid: !!xn.value }]),
              disabled: fs.value,
              onKeyup: ai(Ro, ["enter"]),
              onInput: g[5] || (g[5] = (f) => xn.value = "")
            }, null, 42, Wg), [
              [zn, be.value]
            ]),
            xn.value ? (T(), S("p", qg, se(xn.value), 1)) : le("", !0),
            w("button", {
              type: "button",
              class: "cm-email-gate-btn",
              style: ke(E(pe)),
              disabled: fs.value,
              onClick: Ro
            }, se(fs.value ? "Please wait…" : "Continue to chat"), 13, jg)
          ], 4)) : le("", !0),
          An(w("div", {
            class: "chat-messages",
            ref_key: "messagesContainer",
            ref: K
          }, [
            Dc.value ? (T(), S("div", Vg, [
              w("div", Kg, [
                Kr.value || !E(Qe) ? (T(), S("div", {
                  key: 0,
                  class: "cm-welcome-orb",
                  style: ke(Qs.value)
                }, null, 4)) : (T(), S("img", {
                  key: 1,
                  src: E(Qe),
                  alt: E(a),
                  class: "cm-welcome-avatar"
                }, null, 8, Gg)),
                w("div", {
                  class: "message-bubble cm-welcome-bubble",
                  style: ke(E(Te))
                }, se(So.value), 5)
              ])
            ])) : le("", !0),
            (T(!0), S(et, null, Pt(E(y), (f, J) => {
              var ye, fe, qe, we, jt, ds, Yn, Oo, Po, No, Mo, Fo, Do, Bo, $o, Uo, zo, Ho, Wo;
              return T(), S("div", {
                key: J,
                class: Xe([
                  "message",
                  f.message_type === "bot" || f.message_type === "agent" ? "agent-message" : f.message_type === "system" ? "system-message" : f.message_type === "rating" ? "rating-message" : f.message_type === "form" ? "form-message" : f.message_type === "product" || f.shopify_output ? "product-message" : "user-message"
                ])
              }, [
                w("div", {
                  class: "message-bubble",
                  style: ke(f.message_type === "system" || f.message_type === "rating" || f.message_type === "product" || f.shopify_output ? {} : f.message_type === "user" ? E(pe) : E(Te))
                }, [
                  f.message_type === "rating" ? (T(), S("div", Yg, [
                    w("p", Xg, "Rate the chat session that you had with " + se(f.agent_name || E(V).human_agent_name || E(a) || "our agent"), 1),
                    w("div", {
                      class: Xe(["star-rating", { submitted: Z.value || f.isSubmitted }])
                    }, [
                      (T(), S(et, null, Pt(5, (C) => w("button", {
                        key: C,
                        class: Xe(["star-button", {
                          warning: C <= (f.isSubmitted ? f.finalRating : Dt.value || f.selectedRating) && (f.isSubmitted ? f.finalRating : Dt.value || f.selectedRating) <= 3,
                          success: C <= (f.isSubmitted ? f.finalRating : Dt.value || f.selectedRating) && (f.isSubmitted ? f.finalRating : Dt.value || f.selectedRating) > 3,
                          selected: C <= (f.isSubmitted ? f.finalRating : Dt.value || f.selectedRating)
                        }]),
                        onMouseover: (Vt) => !f.isSubmitted && Zs(C),
                        onMouseleave: (Vt) => !f.isSubmitted && Js,
                        onClick: (Vt) => !f.isSubmitted && wc(C),
                        disabled: Z.value || f.isSubmitted
                      }, " ★ ", 42, Zg)), 64))
                    ], 2),
                    f.showFeedback && !f.isSubmitted ? (T(), S("div", Jg, [
                      w("div", Qg, [
                        An(w("input", {
                          "onUpdate:modelValue": (C) => f.feedback = C,
                          placeholder: "Please share your feedback (optional)",
                          disabled: Z.value,
                          maxlength: "500",
                          class: "feedback-input"
                        }, null, 8, em), [
                          [zn, f.feedback]
                        ]),
                        w("div", tm, se(((ye = f.feedback) == null ? void 0 : ye.length) || 0) + "/500", 1)
                      ]),
                      w("button", {
                        onClick: (C) => kc(f.session_id, Dt.value, f.feedback),
                        disabled: Z.value || !Dt.value,
                        class: "submit-rating-button",
                        style: ke({ backgroundColor: E(o).accent_color || "var(--accent-solid)" })
                      }, se(Z.value ? "Submitting..." : "Submit Rating"), 13, nm)
                    ])) : le("", !0),
                    f.isSubmitted && f.finalFeedback ? (T(), S("div", sm, [
                      w("div", rm, [
                        w("p", im, se(f.finalFeedback), 1)
                      ])
                    ])) : f.isSubmitted ? (T(), S("div", om, " Thank you for your rating! ")) : le("", !0)
                  ])) : f.message_type === "form" ? (T(), S("div", am, [
                    (qe = (fe = f.attributes) == null ? void 0 : fe.form_data) != null && qe.title || (jt = (we = f.attributes) == null ? void 0 : we.form_data) != null && jt.description ? (T(), S("div", lm, [
                      (Yn = (ds = f.attributes) == null ? void 0 : ds.form_data) != null && Yn.title ? (T(), S("h3", cm, se(f.attributes.form_data.title), 1)) : le("", !0),
                      (Po = (Oo = f.attributes) == null ? void 0 : Oo.form_data) != null && Po.description ? (T(), S("p", um, se(f.attributes.form_data.description), 1)) : le("", !0)
                    ])) : le("", !0),
                    w("div", fm, [
                      (T(!0), S(et, null, Pt((Mo = (No = f.attributes) == null ? void 0 : No.form_data) == null ? void 0 : Mo.fields, (C) => {
                        var Vt, Xr;
                        return T(), S("div", {
                          key: C.name,
                          class: "form-field"
                        }, [
                          w("label", {
                            for: `form-${C.name}`,
                            class: "field-label"
                          }, [
                            Qt(se(C.label) + " ", 1),
                            C.required ? (T(), S("span", dm, "*")) : le("", !0)
                          ], 8, hm),
                          C.type === "text" || C.type === "email" || C.type === "tel" ? (T(), S("input", {
                            key: 0,
                            id: `form-${C.name}`,
                            type: C.type,
                            placeholder: C.placeholder || "",
                            required: C.required,
                            minlength: C.minLength,
                            maxlength: C.maxLength,
                            value: m.value[C.name] || "",
                            onInput: (Be) => Ot(C.name, Be.target.value),
                            onBlur: (Be) => Ot(C.name, Be.target.value),
                            class: Xe(["form-input", { error: H.value[C.name] }]),
                            disabled: O.value,
                            autocomplete: C.type === "email" ? "email" : C.type === "tel" ? "tel" : "off",
                            inputmode: C.type === "tel" ? "tel" : C.type === "email" ? "email" : "text"
                          }, null, 42, pm)) : C.type === "number" ? (T(), S("input", {
                            key: 1,
                            id: `form-${C.name}`,
                            type: "number",
                            placeholder: C.placeholder || "",
                            required: C.required,
                            min: C.min,
                            max: C.max,
                            value: m.value[C.name] || "",
                            onInput: (Be) => Ot(C.name, Be.target.value),
                            class: Xe(["form-input", { error: H.value[C.name] }]),
                            disabled: O.value
                          }, null, 42, gm)) : C.type === "textarea" ? (T(), S("textarea", {
                            key: 2,
                            id: `form-${C.name}`,
                            placeholder: C.placeholder || "",
                            required: C.required,
                            minlength: C.minLength,
                            maxlength: C.maxLength,
                            value: m.value[C.name] || "",
                            onInput: (Be) => Ot(C.name, Be.target.value),
                            class: Xe(["form-textarea", { error: H.value[C.name] }]),
                            disabled: O.value,
                            rows: "3"
                          }, null, 42, mm)) : C.type === "select" ? (T(), S("select", {
                            key: 3,
                            id: `form-${C.name}`,
                            required: C.required,
                            value: m.value[C.name] || "",
                            onChange: (Be) => Ot(C.name, Be.target.value),
                            class: Xe(["form-select", { error: H.value[C.name] }]),
                            disabled: O.value
                          }, [
                            w("option", bm, se(C.placeholder || "Select an option"), 1),
                            (T(!0), S(et, null, Pt((Array.isArray(C.options) ? C.options : ((Vt = C.options) == null ? void 0 : Vt.split(`
`)) || []).filter((Be) => Be.trim()), (Be) => (T(), S("option", {
                              key: Be.trim(),
                              value: Be.trim()
                            }, se(Be.trim()), 9, vm))), 128))
                          ], 42, _m)) : C.type === "checkbox" ? (T(), S("div", ym, [
                            w("input", {
                              id: `form-${C.name}`,
                              type: "checkbox",
                              checked: m.value[C.name] || !1,
                              onChange: (Be) => Ot(C.name, Be.target.checked),
                              class: "form-checkbox",
                              disabled: O.value
                            }, null, 40, wm),
                            w("label", {
                              for: `form-${C.name}`,
                              class: "checkbox-label"
                            }, se(C.placeholder || C.label), 9, km)
                          ])) : C.type === "radio" ? (T(), S("div", xm, [
                            (T(!0), S(et, null, Pt((Array.isArray(C.options) ? C.options : ((Xr = C.options) == null ? void 0 : Xr.split(`
`)) || []).filter((Be) => Be.trim()), (Be) => (T(), S("div", {
                              key: Be.trim(),
                              class: "radio-option"
                            }, [
                              w("input", {
                                id: `form-${C.name}-${Be.trim()}`,
                                name: `form-${C.name}`,
                                type: "radio",
                                value: Be.trim(),
                                checked: m.value[C.name] === Be.trim(),
                                onChange: (q_) => Ot(C.name, Be.trim()),
                                class: "form-radio",
                                disabled: O.value
                              }, null, 40, Am),
                              w("label", {
                                for: `form-${C.name}-${Be.trim()}`,
                                class: "radio-label"
                              }, se(Be.trim()), 9, Tm)
                            ]))), 128))
                          ])) : le("", !0),
                          H.value[C.name] ? (T(), S("div", Sm, se(H.value[C.name]), 1)) : le("", !0)
                        ]);
                      }), 128))
                    ]),
                    w("div", Em, [
                      w("button", {
                        onClick: () => {
                          var C;
                          console.log("Regular form submit button clicked!"), Ac((C = f.attributes) == null ? void 0 : C.form_data);
                        },
                        disabled: O.value,
                        class: "form-submit-button",
                        style: ke(E(pe))
                      }, se(O.value ? "Submitting..." : ((Do = (Fo = f.attributes) == null ? void 0 : Fo.form_data) == null ? void 0 : Do.submit_button_text) || "Submit"), 13, Cm)
                    ])
                  ])) : f.message_type === "user_input" ? (T(), S("div", Rm, [
                    (Bo = f.attributes) != null && Bo.prompt_message && f.attributes.prompt_message.trim() ? (T(), S("div", Im, se(f.attributes.prompt_message), 1)) : le("", !0),
                    f.isSubmitted ? (T(), S("div", Nm, [
                      g[34] || (g[34] = w("strong", null, "Your input:", -1)),
                      Qt(" " + se(f.submittedValue) + " ", 1),
                      ($o = f.attributes) != null && $o.confirmation_message && f.attributes.confirmation_message.trim() ? (T(), S("div", Mm, se(f.attributes.confirmation_message), 1)) : le("", !0)
                    ])) : (T(), S("div", Lm, [
                      An(w("textarea", {
                        "onUpdate:modelValue": (C) => f.userInputValue = C,
                        class: "user-input-textarea",
                        placeholder: "Type your message here...",
                        rows: "3",
                        onKeydown: [
                          ai(Zn((C) => Vr(f), ["ctrl"]), ["enter"]),
                          ai(Zn((C) => Vr(f), ["meta"]), ["enter"])
                        ]
                      }, null, 40, Om), [
                        [zn, f.userInputValue]
                      ]),
                      w("button", {
                        class: "user-input-submit-button",
                        onClick: (C) => Vr(f),
                        disabled: !f.userInputValue || !f.userInputValue.trim()
                      }, " Submit ", 8, Pm)
                    ]))
                  ])) : f.shopify_output || f.message_type === "product" ? (T(), S("div", Fm, [
                    f.message ? (T(), S("div", {
                      key: 0,
                      innerHTML: s(((zo = (Uo = f.shopify_output) == null ? void 0 : Uo.products) == null ? void 0 : zo.length) > 0 ? Cc(f.message) : f.message),
                      class: "product-message-text"
                    }, null, 8, Dm)) : le("", !0),
                    (Ho = f.shopify_output) != null && Ho.products && f.shopify_output.products.length > 0 ? (T(), S("div", Bm, [
                      g[36] || (g[36] = w("h3", { class: "carousel-title" }, "Products", -1)),
                      w("div", $m, [
                        (T(!0), S(et, null, Pt(f.shopify_output.products, (C) => {
                          var Vt;
                          return T(), S("div", {
                            key: C.id,
                            class: "product-card-compact carousel-item"
                          }, [
                            (Vt = C.image) != null && Vt.src ? (T(), S("div", Um, [
                              w("img", {
                                src: C.image.src,
                                alt: C.title,
                                class: "product-thumbnail"
                              }, null, 8, zm)
                            ])) : le("", !0),
                            w("div", Hm, [
                              w("div", Wm, [
                                w("div", qm, se(C.title), 1),
                                C.variant_title && C.variant_title !== "Default Title" ? (T(), S("div", jm, se(C.variant_title), 1)) : le("", !0),
                                w("div", Vm, se(C.price_formatted || E(c)(C.price, C.currency)), 1)
                              ]),
                              w("div", Km, [
                                w("button", {
                                  class: "view-details-button-compact",
                                  onClick: (Xr) => {
                                    var Be;
                                    return Ec(C, (Be = f.shopify_output) == null ? void 0 : Be.shop_domain);
                                  }
                                }, g[35] || (g[35] = [
                                  Qt(" View product ", -1),
                                  w("span", { class: "external-link-icon" }, "↗", -1)
                                ]), 8, Gm)
                              ])
                            ])
                          ]);
                        }), 128))
                      ])
                    ])) : !f.message && ((Wo = f.shopify_output) != null && Wo.products) && f.shopify_output.products.length === 0 ? (T(), S("div", Ym, g[37] || (g[37] = [
                      w("p", null, "No products found.", -1)
                    ]))) : !f.message && f.shopify_output && !f.shopify_output.products ? (T(), S("div", Xm, g[38] || (g[38] = [
                      w("p", null, "No products to display.", -1)
                    ]))) : le("", !0)
                  ])) : (T(), S(et, { key: 4 }, [
                    E(it)(J) ? (T(), S("div", Zm, [
                      Qt(se(E(ut)(J, f.message)), 1),
                      g[39] || (g[39] = w("span", { class: "cm-caret" }, null, -1))
                    ])) : (T(), S("div", {
                      key: 1,
                      innerHTML: s(f.message)
                    }, null, 8, Jm)),
                    f.attachments && f.attachments.length > 0 ? (T(), S("div", Qm, [
                      (T(!0), S(et, null, Pt(f.attachments, (C) => (T(), S("div", {
                        key: C.id,
                        class: "attachment-item"
                      }, [
                        E(te)(C.content_type) ? (T(), S("div", e_, [
                          w("img", {
                            src: E(ve)(C.file_url),
                            alt: C.filename,
                            class: "attachment-image",
                            onClick: Zn((Vt) => E(as)({ url: C.file_url, filename: C.filename, type: C.content_type, file_url: E(ve)(C.file_url), size: void 0 }), ["stop"]),
                            style: { cursor: "pointer" }
                          }, null, 8, t_),
                          w("div", n_, [
                            w("a", {
                              href: E(ve)(C.file_url),
                              target: "_blank",
                              class: "attachment-link"
                            }, [
                              g[40] || (g[40] = w("svg", {
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
                              Qt(" " + se(C.filename) + " ", 1),
                              w("span", r_, "(" + se(E(G)(C.file_size)) + ")", 1)
                            ], 8, s_)
                          ])
                        ])) : (T(), S("a", {
                          key: 1,
                          href: E(ve)(C.file_url),
                          target: "_blank",
                          class: "attachment-link"
                        }, [
                          g[41] || (g[41] = w("svg", {
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
                          Qt(" " + se(C.filename) + " ", 1),
                          w("span", o_, "(" + se(E(G)(C.file_size)) + ")", 1)
                        ], 8, i_))
                      ]))), 128))
                    ])) : le("", !0)
                  ], 64))
                ], 4),
                Gr.value && (f.message_type === "bot" || f.message_type === "agent") && f.sources && f.sources.length ? (T(), S("div", a_, [
                  g[42] || (g[42] = w("span", { class: "citation-label" }, "Sources", -1)),
                  (T(!0), S(et, null, Pt(f.sources, (C, Vt) => (T(), S("span", {
                    key: Vt,
                    class: "citation-chip",
                    title: C.type
                  }, se(C.name), 9, l_))), 128))
                ])) : le("", !0),
                w("div", c_, [
                  f.message_type === "user" ? (T(), S("span", u_, " You ")) : le("", !0)
                ])
              ], 2);
            }), 128)),
            E(_) ? (T(), S("div", {
              key: 1,
              class: Xe(["typing-indicator", { "reading-indicator": Gr.value }])
            }, [
              Gr.value ? (T(), S(et, { key: 0 }, [
                g[43] || (g[43] = w("div", {
                  class: "reading-bars",
                  "aria-hidden": "true"
                }, [
                  w("span"),
                  w("span"),
                  w("span")
                ], -1)),
                g[44] || (g[44] = w("span", { class: "reading-label" }, "reading knowledge base", -1))
              ], 64)) : (T(), S("div", {
                key: 1,
                class: "cm-typing-bubble",
                style: ke(E(Te))
              }, g[45] || (g[45] = [
                w("span", { class: "cm-typing-dot" }, null, -1),
                w("span", { class: "cm-typing-dot" }, null, -1),
                w("span", { class: "cm-typing-dot" }, null, -1)
              ]), 4))
            ], 2)) : le("", !0)
          ], 512), [
            [Wf, !hs.value]
          ]),
          Bc.value ? (T(), S("div", f_, [
            (T(!0), S(et, null, Pt(To.value, (f) => (T(), S("button", {
              key: f,
              type: "button",
              class: "cm-quick-action",
              disabled: !Wt.value,
              onClick: (J) => kn(f)
            }, se(f), 9, h_))), 128))
          ])) : le("", !0),
          !Zt.value && !hs.value ? (T(), S("div", {
            key: 5,
            class: Xe(["chat-input", { "ask-anything-input": qt.value }]),
            style: ke(E(Te))
          }, [
            w("input", {
              ref_key: "fileInputRef",
              ref: v,
              type: "file",
              accept: D_,
              multiple: "",
              style: { display: "none" },
              onChange: g[6] || (g[6] = //@ts-ignore
              (...f) => E(Ge) && E(Ge)(...f))
            }, null, 544),
            E(A).length > 0 ? (T(), S("div", d_, [
              (T(!0), S(et, null, Pt(E(A), (f, J) => (T(), S("div", {
                key: J,
                class: "file-preview-widget"
              }, [
                w("div", p_, [
                  E(ls)(f.type) ? (T(), S("img", {
                    key: 0,
                    src: E(Se)(f),
                    alt: f.filename,
                    class: "file-preview-image-widget",
                    onClick: Zn((ye) => E(as)(f), ["stop"]),
                    style: { cursor: "pointer" }
                  }, null, 8, g_)) : (T(), S("div", {
                    key: 1,
                    class: "file-preview-icon-widget",
                    onClick: Zn((ye) => E(as)(f), ["stop"]),
                    style: { cursor: "pointer" }
                  }, g[46] || (g[46] = [
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
                  ]), 8, m_))
                ]),
                w("div", __, [
                  w("div", b_, se(f.filename), 1),
                  w("div", v_, se(E(G)(f.size)), 1)
                ]),
                w("button", {
                  type: "button",
                  class: "file-preview-remove-widget",
                  onClick: (ye) => E(Xt)(J),
                  title: "Remove file"
                }, " × ", 8, y_)
              ]))), 128))
            ])) : le("", !0),
            ko.value ? (T(), S("div", w_, g[47] || (g[47] = [
              w("div", { class: "upload-spinner-widget" }, null, -1),
              w("span", { class: "upload-text-widget" }, "Uploading files...", -1)
            ]))) : le("", !0),
            w("div", k_, [
              An(w("input", {
                "onUpdate:modelValue": g[7] || (g[7] = (f) => ie.value = f),
                type: "text",
                placeholder: Ks.value,
                onKeypress: cs,
                onInput: de,
                onChange: de,
                onPaste: g[8] || (g[8] = //@ts-ignore
                (...f) => E(We) && E(We)(...f)),
                onDrop: g[9] || (g[9] = //@ts-ignore
                (...f) => E(Ne) && E(Ne)(...f)),
                onDragover: g[10] || (g[10] = //@ts-ignore
                (...f) => E(ht) && E(ht)(...f)),
                onDragleave: g[11] || (g[11] = //@ts-ignore
                (...f) => E(vt) && E(vt)(...f)),
                disabled: !Wt.value,
                class: Xe({ disabled: !Wt.value, "ask-anything-field": qt.value })
              }, null, 42, x_), [
                [zn, ie.value]
              ]),
              Rc.value ? (T(), S("button", {
                key: 0,
                type: "button",
                class: "attach-button",
                disabled: ko.value,
                onClick: g[12] || (g[12] = //@ts-ignore
                (...f) => E(Vn) && E(Vn)(...f)),
                title: `Attach files (${E(A).length}/${Ua} used) or paste screenshots`
              }, g[48] || (g[48] = [
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
              ]), 8, A_)) : le("", !0),
              w("button", {
                class: Xe(["send-button", { "ask-anything-send": qt.value }]),
                style: ke(E(pe)),
                onClick: _t,
                disabled: !ie.value.trim() && E(A).length === 0 || !Wt.value
              }, g[49] || (g[49] = [
                w("svg", {
                  width: "20",
                  height: "20",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  xmlns: "http://www.w3.org/2000/svg"
                }, [
                  w("path", {
                    d: "M12 19V5M5 12l7-7 7 7",
                    stroke: "currentColor",
                    "stroke-width": "2.2",
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round"
                  })
                ], -1)
              ]), 14, T_)
            ])
          ], 6)) : Zt.value && !hs.value ? (T(), S("div", {
            key: 6,
            class: "new-conversation-section",
            style: ke(E(Te))
          }, [
            w("div", S_, [
              g[50] || (g[50] = w("p", { class: "ended-text" }, "This chat has ended.", -1)),
              w("button", {
                class: "start-new-conversation-button",
                style: ke(E(pe)),
                onClick: Pc
              }, " Click here to start a new conversation ", 4)
            ])
          ], 4)) : le("", !0),
          w("div", {
            class: "powered-by",
            style: ke(E(Fe))
          }, g[51] || (g[51] = [
            Un('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-6ba357bd><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-6ba357bd></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-6ba357bd></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-6ba357bd></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-6ba357bd></circle></svg><span class="cm-powered-prefix" data-v-6ba357bd>Powered by </span><strong class="cm-brand" data-v-6ba357bd>ChatterMate</strong>', 3)
          ]), 4)
        ], 6)) : le("", !0)
      ], 64)),
      us.value ? (T(), S("div", E_, [
        w("div", C_, [
          g[52] || (g[52] = w("h3", null, "Rate your conversation", -1)),
          w("div", R_, [
            (T(), S(et, null, Pt(5, (f) => w("button", {
              key: f,
              onClick: (J) => Dn.value = f,
              class: Xe([{ active: f <= Dn.value }, "star-button"])
            }, " ★ ", 10, I_)), 64))
          ]),
          An(w("textarea", {
            "onUpdate:modelValue": g[13] || (g[13] = (f) => Kn.value = f),
            placeholder: "Additional feedback (optional)",
            class: "rating-feedback"
          }, null, 512), [
            [zn, Kn.value]
          ]),
          w("div", L_, [
            w("button", {
              onClick: g[14] || (g[14] = (f) => p.submitRating(Dn.value, Kn.value)),
              disabled: !Dn.value,
              class: "submit-button",
              style: ke(E(pe))
            }, " Submit ", 12, O_),
            w("button", {
              onClick: g[15] || (g[15] = (f) => us.value = !1),
              class: "skip-rating"
            }, " Skip ")
          ])
        ])
      ])) : le("", !0),
      E(x) ? (T(), S("div", {
        key: 8,
        class: "preview-modal-overlay",
        onClick: g[18] || (g[18] = //@ts-ignore
        (...f) => E(Fn) && E(Fn)(...f))
      }, [
        w("div", {
          class: "preview-modal-content",
          onClick: g[17] || (g[17] = Zn(() => {
          }, ["stop"]))
        }, [
          w("button", {
            class: "preview-modal-close",
            onClick: g[16] || (g[16] = //@ts-ignore
            (...f) => E(Fn) && E(Fn)(...f))
          }, "×"),
          E(N) && E(ls)(E(N).type) ? (T(), S("div", P_, [
            w("img", {
              src: E(Se)(E(N)),
              alt: E(N).filename,
              class: "preview-modal-image"
            }, null, 8, N_),
            w("div", M_, se(E(N).filename), 1)
          ])) : le("", !0)
        ])
      ])) : le("", !0)
    ], 6)) : (T(), S("div", F_));
  }
}), $_ = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [s, r] of t)
    n[s] = r;
  return n;
}, U_ = /* @__PURE__ */ $_(B_, [["__scopeId", "data-v-6ba357bd"]]);
window.process || (window.process = { env: { NODE_ENV: "production" } });
const $t = window.__INITIAL_DATA__, bc = new URL(window.location.href), vc = bc.searchParams.get("preview") === "true", yc = (e) => {
  const t = bc.searchParams.get(e);
  if (!(!t || t === "undefined" || t.trim() === ""))
    return t;
}, z_ = vc ? yc("widget_id") || ($t == null ? void 0 : $t.widgetId) || void 0 : ($t == null ? void 0 : $t.widgetId) || void 0, H_ = vc ? ($t == null ? void 0 : $t.initialToken) || yc("token") || void 0 : ($t == null ? void 0 : $t.initialToken) || void 0, W_ = ch(U_, {
  widgetId: z_,
  token: H_ || void 0,
  initialAuthError: null
  // Let backend determine if auth is required
});
W_.mount("#app");
