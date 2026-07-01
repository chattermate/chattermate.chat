var zc = Object.defineProperty;
var Hc = (t, e, n) => e in t ? zc(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n;
var Xe = (t, e, n) => Hc(t, typeof e != "symbol" ? e + "" : e, n);
/**
* @vue/shared v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function Hi(t) {
  const e = /* @__PURE__ */ Object.create(null);
  for (const n of t.split(",")) e[n] = 1;
  return (n) => n in e;
}
const Je = {}, Qn = [], rn = () => {
}, Wc = () => !1, Lr = (t) => t.charCodeAt(0) === 111 && t.charCodeAt(1) === 110 && // uppercase letter
(t.charCodeAt(2) > 122 || t.charCodeAt(2) < 97), Wi = (t) => t.startsWith("onUpdate:"), kt = Object.assign, qi = (t, e) => {
  const n = t.indexOf(e);
  n > -1 && t.splice(n, 1);
}, qc = Object.prototype.hasOwnProperty, $e = (t, e) => qc.call(t, e), he = Array.isArray, es = (t) => Or(t) === "[object Map]", Ha = (t) => Or(t) === "[object Set]", _e = (t) => typeof t == "function", pt = (t) => typeof t == "string", Pn = (t) => typeof t == "symbol", ot = (t) => t !== null && typeof t == "object", Wa = (t) => (ot(t) || _e(t)) && _e(t.then) && _e(t.catch), qa = Object.prototype.toString, Or = (t) => qa.call(t), jc = (t) => Or(t).slice(8, -1), ja = (t) => Or(t) === "[object Object]", ji = (t) => pt(t) && t !== "NaN" && t[0] !== "-" && "" + parseInt(t, 10) === t, Is = /* @__PURE__ */ Hi(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), Pr = (t) => {
  const e = /* @__PURE__ */ Object.create(null);
  return (n) => e[n] || (e[n] = t(n));
}, Vc = /-(\w)/g, In = Pr(
  (t) => t.replace(Vc, (e, n) => n ? n.toUpperCase() : "")
), Kc = /\B([A-Z])/g, Nn = Pr(
  (t) => t.replace(Kc, "-$1").toLowerCase()
), Va = Pr((t) => t.charAt(0).toUpperCase() + t.slice(1)), Zr = Pr(
  (t) => t ? `on${Va(t)}` : ""
), En = (t, e) => !Object.is(t, e), cr = (t, ...e) => {
  for (let n = 0; n < t.length; n++)
    t[n](...e);
}, vi = (t, e, n, s = !1) => {
  Object.defineProperty(t, e, {
    configurable: !0,
    enumerable: !1,
    writable: s,
    value: n
  });
}, yi = (t) => {
  const e = parseFloat(t);
  return isNaN(e) ? t : e;
};
let qo;
const Nr = () => qo || (qo = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function Se(t) {
  if (he(t)) {
    const e = {};
    for (let n = 0; n < t.length; n++) {
      const s = t[n], r = pt(s) ? Zc(s) : Se(s);
      if (r)
        for (const i in r)
          e[i] = r[i];
    }
    return e;
  } else if (pt(t) || ot(t))
    return t;
}
const Gc = /;(?![^(]*\))/g, Yc = /:([^]+)/, Xc = /\/\*[^]*?\*\//g;
function Zc(t) {
  const e = {};
  return t.replace(Xc, "").split(Gc).forEach((n) => {
    if (n) {
      const s = n.split(Yc);
      s.length > 1 && (e[s[0].trim()] = s[1].trim());
    }
  }), e;
}
function Ze(t) {
  let e = "";
  if (pt(t))
    e = t;
  else if (he(t))
    for (let n = 0; n < t.length; n++) {
      const s = Ze(t[n]);
      s && (e += s + " ");
    }
  else if (ot(t))
    for (const n in t)
      t[n] && (e += n + " ");
  return e.trim();
}
const Jc = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", Qc = /* @__PURE__ */ Hi(Jc);
function Ka(t) {
  return !!t || t === "";
}
const Ga = (t) => !!(t && t.__v_isRef === !0), se = (t) => pt(t) ? t : t == null ? "" : he(t) || ot(t) && (t.toString === qa || !_e(t.toString)) ? Ga(t) ? se(t.value) : JSON.stringify(t, Ya, 2) : String(t), Ya = (t, e) => Ga(e) ? Ya(t, e.value) : es(e) ? {
  [`Map(${e.size})`]: [...e.entries()].reduce(
    (n, [s, r], i) => (n[Jr(s, i) + " =>"] = r, n),
    {}
  )
} : Ha(e) ? {
  [`Set(${e.size})`]: [...e.values()].map((n) => Jr(n))
} : Pn(e) ? Jr(e) : ot(e) && !he(e) && !ja(e) ? String(e) : e, Jr = (t, e = "") => {
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
let Nt;
class eu {
  constructor(e = !1) {
    this.detached = e, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this.parent = Nt, !e && Nt && (this.index = (Nt.scopes || (Nt.scopes = [])).push(
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
      const n = Nt;
      try {
        return Nt = this, e();
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
function tu() {
  return Nt;
}
let tt;
const Qr = /* @__PURE__ */ new WeakSet();
class Xa {
  constructor(e) {
    this.fn = e, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, Nt && Nt.active && Nt.effects.push(this);
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
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Ja(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, jo(this), Qa(this);
    const e = tt, n = Xt;
    tt = this, Xt = !0;
    try {
      return this.fn();
    } finally {
      el(this), tt = e, Xt = n, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let e = this.deps; e; e = e.nextDep)
        Gi(e);
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
    bi(this) && this.run();
  }
  get dirty() {
    return bi(this);
  }
}
let Za = 0, Ls, Os;
function Ja(t, e = !1) {
  if (t.flags |= 8, e) {
    t.next = Os, Os = t;
    return;
  }
  t.next = Ls, Ls = t;
}
function Vi() {
  Za++;
}
function Ki() {
  if (--Za > 0)
    return;
  if (Os) {
    let e = Os;
    for (Os = void 0; e; ) {
      const n = e.next;
      e.next = void 0, e.flags &= -9, e = n;
    }
  }
  let t;
  for (; Ls; ) {
    let e = Ls;
    for (Ls = void 0; e; ) {
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
function Qa(t) {
  for (let e = t.deps; e; e = e.nextDep)
    e.version = -1, e.prevActiveLink = e.dep.activeLink, e.dep.activeLink = e;
}
function el(t) {
  let e, n = t.depsTail, s = n;
  for (; s; ) {
    const r = s.prevDep;
    s.version === -1 ? (s === n && (n = r), Gi(s), nu(s)) : e = s, s.dep.activeLink = s.prevActiveLink, s.prevActiveLink = void 0, s = r;
  }
  t.deps = e, t.depsTail = n;
}
function bi(t) {
  for (let e = t.deps; e; e = e.nextDep)
    if (e.dep.version !== e.version || e.dep.computed && (tl(e.dep.computed) || e.dep.version !== e.version))
      return !0;
  return !!t._dirty;
}
function tl(t) {
  if (t.flags & 4 && !(t.flags & 16) || (t.flags &= -17, t.globalVersion === Bs) || (t.globalVersion = Bs, !t.isSSR && t.flags & 128 && (!t.deps && !t._dirty || !bi(t))))
    return;
  t.flags |= 2;
  const e = t.dep, n = tt, s = Xt;
  tt = t, Xt = !0;
  try {
    Qa(t);
    const r = t.fn(t._value);
    (e.version === 0 || En(r, t._value)) && (t.flags |= 128, t._value = r, e.version++);
  } catch (r) {
    throw e.version++, r;
  } finally {
    tt = n, Xt = s, el(t), t.flags &= -3;
  }
}
function Gi(t, e = !1) {
  const { dep: n, prevSub: s, nextSub: r } = t;
  if (s && (s.nextSub = r, t.prevSub = void 0), r && (r.prevSub = s, t.nextSub = void 0), n.subs === t && (n.subs = s, !s && n.computed)) {
    n.computed.flags &= -5;
    for (let i = n.computed.deps; i; i = i.nextDep)
      Gi(i, !0);
  }
  !e && !--n.sc && n.map && n.map.delete(n.key);
}
function nu(t) {
  const { prevDep: e, nextDep: n } = t;
  e && (e.nextDep = n, t.prevDep = void 0), n && (n.prevDep = e, t.nextDep = void 0);
}
let Xt = !0;
const nl = [];
function yn() {
  nl.push(Xt), Xt = !1;
}
function bn() {
  const t = nl.pop();
  Xt = t === void 0 ? !0 : t;
}
function jo(t) {
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
let Bs = 0;
class su {
  constructor(e, n) {
    this.sub = e, this.dep = n, this.version = n.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Yi {
  // TODO isolatedDeclarations "__v_skip"
  constructor(e) {
    this.computed = e, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(e) {
    if (!tt || !Xt || tt === this.computed)
      return;
    let n = this.activeLink;
    if (n === void 0 || n.sub !== tt)
      n = this.activeLink = new su(tt, this), tt.deps ? (n.prevDep = tt.depsTail, tt.depsTail.nextDep = n, tt.depsTail = n) : tt.deps = tt.depsTail = n, sl(n);
    else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
      const s = n.nextDep;
      s.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = s), n.prevDep = tt.depsTail, n.nextDep = void 0, tt.depsTail.nextDep = n, tt.depsTail = n, tt.deps === n && (tt.deps = s);
    }
    return n;
  }
  trigger(e) {
    this.version++, Bs++, this.notify(e);
  }
  notify(e) {
    Vi();
    try {
      for (let n = this.subs; n; n = n.prevSub)
        n.sub.notify() && n.sub.dep.notify();
    } finally {
      Ki();
    }
  }
}
function sl(t) {
  if (t.dep.sc++, t.sub.flags & 4) {
    const e = t.dep.computed;
    if (e && !t.dep.subs) {
      e.flags |= 20;
      for (let s = e.deps; s; s = s.nextDep)
        sl(s);
    }
    const n = t.dep.subs;
    n !== t && (t.prevSub = n, n && (n.nextSub = t)), t.dep.subs = t;
  }
}
const wi = /* @__PURE__ */ new WeakMap(), Hn = Symbol(
  ""
), ki = Symbol(
  ""
), $s = Symbol(
  ""
);
function bt(t, e, n) {
  if (Xt && tt) {
    let s = wi.get(t);
    s || wi.set(t, s = /* @__PURE__ */ new Map());
    let r = s.get(n);
    r || (s.set(n, r = new Yi()), r.map = s, r.key = n), r.track();
  }
}
function pn(t, e, n, s, r, i) {
  const o = wi.get(t);
  if (!o) {
    Bs++;
    return;
  }
  const a = (l) => {
    l && l.trigger();
  };
  if (Vi(), e === "clear")
    o.forEach(a);
  else {
    const l = he(t), h = l && ji(n);
    if (l && n === "length") {
      const c = Number(s);
      o.forEach((b, _) => {
        (_ === "length" || _ === $s || !Pn(_) && _ >= c) && a(b);
      });
    } else
      switch ((n !== void 0 || o.has(void 0)) && a(o.get(n)), h && a(o.get($s)), e) {
        case "add":
          l ? h && a(o.get("length")) : (a(o.get(Hn)), es(t) && a(o.get(ki)));
          break;
        case "delete":
          l || (a(o.get(Hn)), es(t) && a(o.get(ki)));
          break;
        case "set":
          es(t) && a(o.get(Hn));
          break;
      }
  }
  Ki();
}
function Yn(t) {
  const e = Be(t);
  return e === t ? e : (bt(e, "iterate", $s), zt(t) ? e : e.map(vt));
}
function Fr(t) {
  return bt(t = Be(t), "iterate", $s), t;
}
const ru = {
  __proto__: null,
  [Symbol.iterator]() {
    return ei(this, Symbol.iterator, vt);
  },
  concat(...t) {
    return Yn(this).concat(
      ...t.map((e) => he(e) ? Yn(e) : e)
    );
  },
  entries() {
    return ei(this, "entries", (t) => (t[1] = vt(t[1]), t));
  },
  every(t, e) {
    return fn(this, "every", t, e, void 0, arguments);
  },
  filter(t, e) {
    return fn(this, "filter", t, e, (n) => n.map(vt), arguments);
  },
  find(t, e) {
    return fn(this, "find", t, e, vt, arguments);
  },
  findIndex(t, e) {
    return fn(this, "findIndex", t, e, void 0, arguments);
  },
  findLast(t, e) {
    return fn(this, "findLast", t, e, vt, arguments);
  },
  findLastIndex(t, e) {
    return fn(this, "findLastIndex", t, e, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(t, e) {
    return fn(this, "forEach", t, e, void 0, arguments);
  },
  includes(...t) {
    return ti(this, "includes", t);
  },
  indexOf(...t) {
    return ti(this, "indexOf", t);
  },
  join(t) {
    return Yn(this).join(t);
  },
  // keys() iterator only reads `length`, no optimisation required
  lastIndexOf(...t) {
    return ti(this, "lastIndexOf", t);
  },
  map(t, e) {
    return fn(this, "map", t, e, void 0, arguments);
  },
  pop() {
    return ps(this, "pop");
  },
  push(...t) {
    return ps(this, "push", t);
  },
  reduce(t, ...e) {
    return Vo(this, "reduce", t, e);
  },
  reduceRight(t, ...e) {
    return Vo(this, "reduceRight", t, e);
  },
  shift() {
    return ps(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(t, e) {
    return fn(this, "some", t, e, void 0, arguments);
  },
  splice(...t) {
    return ps(this, "splice", t);
  },
  toReversed() {
    return Yn(this).toReversed();
  },
  toSorted(t) {
    return Yn(this).toSorted(t);
  },
  toSpliced(...t) {
    return Yn(this).toSpliced(...t);
  },
  unshift(...t) {
    return ps(this, "unshift", t);
  },
  values() {
    return ei(this, "values", vt);
  }
};
function ei(t, e, n) {
  const s = Fr(t), r = s[e]();
  return s !== t && !zt(t) && (r._next = r.next, r.next = () => {
    const i = r._next();
    return i.value && (i.value = n(i.value)), i;
  }), r;
}
const iu = Array.prototype;
function fn(t, e, n, s, r, i) {
  const o = Fr(t), a = o !== t && !zt(t), l = o[e];
  if (l !== iu[e]) {
    const b = l.apply(t, i);
    return a ? vt(b) : b;
  }
  let h = n;
  o !== t && (a ? h = function(b, _) {
    return n.call(this, vt(b), _, t);
  } : n.length > 2 && (h = function(b, _) {
    return n.call(this, b, _, t);
  }));
  const c = l.call(o, h, s);
  return a && r ? r(c) : c;
}
function Vo(t, e, n, s) {
  const r = Fr(t);
  let i = n;
  return r !== t && (zt(t) ? n.length > 3 && (i = function(o, a, l) {
    return n.call(this, o, a, l, t);
  }) : i = function(o, a, l) {
    return n.call(this, o, vt(a), l, t);
  }), r[e](i, ...s);
}
function ti(t, e, n) {
  const s = Be(t);
  bt(s, "iterate", $s);
  const r = s[e](...n);
  return (r === -1 || r === !1) && Ji(n[0]) ? (n[0] = Be(n[0]), s[e](...n)) : r;
}
function ps(t, e, n = []) {
  yn(), Vi();
  const s = Be(t)[e].apply(t, n);
  return Ki(), bn(), s;
}
const ou = /* @__PURE__ */ Hi("__proto__,__v_isRef,__isVue"), rl = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((t) => t !== "arguments" && t !== "caller").map((t) => Symbol[t]).filter(Pn)
);
function au(t) {
  Pn(t) || (t = String(t));
  const e = Be(this);
  return bt(e, "has", t), e.hasOwnProperty(t);
}
class il {
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
      return s === (r ? i ? _u : cl : i ? ll : al).get(e) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(e) === Object.getPrototypeOf(s) ? e : void 0;
    const o = he(e);
    if (!r) {
      let l;
      if (o && (l = ru[n]))
        return l;
      if (n === "hasOwnProperty")
        return au;
    }
    const a = Reflect.get(
      e,
      n,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      wt(e) ? e : s
    );
    return (Pn(n) ? rl.has(n) : ou(n)) || (r || bt(e, "get", n), i) ? a : wt(a) ? o && ji(n) ? a : a.value : ot(a) ? r ? ul(a) : Mr(a) : a;
  }
}
class ol extends il {
  constructor(e = !1) {
    super(!1, e);
  }
  set(e, n, s, r) {
    let i = e[n];
    if (!this._isShallow) {
      const l = Ln(i);
      if (!zt(s) && !Ln(s) && (i = Be(i), s = Be(s)), !he(e) && wt(i) && !wt(s))
        return l ? !1 : (i.value = s, !0);
    }
    const o = he(e) && ji(n) ? Number(n) < e.length : $e(e, n), a = Reflect.set(
      e,
      n,
      s,
      wt(e) ? e : r
    );
    return e === Be(r) && (o ? En(s, i) && pn(e, "set", n, s) : pn(e, "add", n, s)), a;
  }
  deleteProperty(e, n) {
    const s = $e(e, n);
    e[n];
    const r = Reflect.deleteProperty(e, n);
    return r && s && pn(e, "delete", n, void 0), r;
  }
  has(e, n) {
    const s = Reflect.has(e, n);
    return (!Pn(n) || !rl.has(n)) && bt(e, "has", n), s;
  }
  ownKeys(e) {
    return bt(
      e,
      "iterate",
      he(e) ? "length" : Hn
    ), Reflect.ownKeys(e);
  }
}
class lu extends il {
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
const cu = /* @__PURE__ */ new ol(), uu = /* @__PURE__ */ new lu(), fu = /* @__PURE__ */ new ol(!0);
const xi = (t) => t, tr = (t) => Reflect.getPrototypeOf(t);
function hu(t, e, n) {
  return function(...s) {
    const r = this.__v_raw, i = Be(r), o = es(i), a = t === "entries" || t === Symbol.iterator && o, l = t === "keys" && o, h = r[t](...s), c = n ? xi : e ? wr : vt;
    return !e && bt(
      i,
      "iterate",
      l ? ki : Hn
    ), {
      // iterator protocol
      next() {
        const { value: b, done: _ } = h.next();
        return _ ? { value: b, done: _ } : {
          value: a ? [c(b[0]), c(b[1])] : c(b),
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
function nr(t) {
  return function(...e) {
    return t === "delete" ? !1 : t === "clear" ? void 0 : this;
  };
}
function du(t, e) {
  const n = {
    get(r) {
      const i = this.__v_raw, o = Be(i), a = Be(r);
      t || (En(r, a) && bt(o, "get", r), bt(o, "get", a));
      const { has: l } = tr(o), h = e ? xi : t ? wr : vt;
      if (l.call(o, r))
        return h(i.get(r));
      if (l.call(o, a))
        return h(i.get(a));
      i !== o && i.get(r);
    },
    get size() {
      const r = this.__v_raw;
      return !t && bt(Be(r), "iterate", Hn), Reflect.get(r, "size", r);
    },
    has(r) {
      const i = this.__v_raw, o = Be(i), a = Be(r);
      return t || (En(r, a) && bt(o, "has", r), bt(o, "has", a)), r === a ? i.has(r) : i.has(r) || i.has(a);
    },
    forEach(r, i) {
      const o = this, a = o.__v_raw, l = Be(a), h = e ? xi : t ? wr : vt;
      return !t && bt(l, "iterate", Hn), a.forEach((c, b) => r.call(i, h(c), h(b), o));
    }
  };
  return kt(
    n,
    t ? {
      add: nr("add"),
      set: nr("set"),
      delete: nr("delete"),
      clear: nr("clear")
    } : {
      add(r) {
        !e && !zt(r) && !Ln(r) && (r = Be(r));
        const i = Be(this);
        return tr(i).has.call(i, r) || (i.add(r), pn(i, "add", r, r)), this;
      },
      set(r, i) {
        !e && !zt(i) && !Ln(i) && (i = Be(i));
        const o = Be(this), { has: a, get: l } = tr(o);
        let h = a.call(o, r);
        h || (r = Be(r), h = a.call(o, r));
        const c = l.call(o, r);
        return o.set(r, i), h ? En(i, c) && pn(o, "set", r, i) : pn(o, "add", r, i), this;
      },
      delete(r) {
        const i = Be(this), { has: o, get: a } = tr(i);
        let l = o.call(i, r);
        l || (r = Be(r), l = o.call(i, r)), a && a.call(i, r);
        const h = i.delete(r);
        return l && pn(i, "delete", r, void 0), h;
      },
      clear() {
        const r = Be(this), i = r.size !== 0, o = r.clear();
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
    n[r] = hu(r, t, e);
  }), n;
}
function Xi(t, e) {
  const n = du(t, e);
  return (s, r, i) => r === "__v_isReactive" ? !t : r === "__v_isReadonly" ? t : r === "__v_raw" ? s : Reflect.get(
    $e(n, r) && r in s ? n : s,
    r,
    i
  );
}
const pu = {
  get: /* @__PURE__ */ Xi(!1, !1)
}, gu = {
  get: /* @__PURE__ */ Xi(!1, !0)
}, mu = {
  get: /* @__PURE__ */ Xi(!0, !1)
};
const al = /* @__PURE__ */ new WeakMap(), ll = /* @__PURE__ */ new WeakMap(), cl = /* @__PURE__ */ new WeakMap(), _u = /* @__PURE__ */ new WeakMap();
function vu(t) {
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
function yu(t) {
  return t.__v_skip || !Object.isExtensible(t) ? 0 : vu(jc(t));
}
function Mr(t) {
  return Ln(t) ? t : Zi(
    t,
    !1,
    cu,
    pu,
    al
  );
}
function bu(t) {
  return Zi(
    t,
    !1,
    fu,
    gu,
    ll
  );
}
function ul(t) {
  return Zi(
    t,
    !0,
    uu,
    mu,
    cl
  );
}
function Zi(t, e, n, s, r) {
  if (!ot(t) || t.__v_raw && !(e && t.__v_isReactive))
    return t;
  const i = yu(t);
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
function ts(t) {
  return Ln(t) ? ts(t.__v_raw) : !!(t && t.__v_isReactive);
}
function Ln(t) {
  return !!(t && t.__v_isReadonly);
}
function zt(t) {
  return !!(t && t.__v_isShallow);
}
function Ji(t) {
  return t ? !!t.__v_raw : !1;
}
function Be(t) {
  const e = t && t.__v_raw;
  return e ? Be(e) : t;
}
function wu(t) {
  return !$e(t, "__v_skip") && Object.isExtensible(t) && vi(t, "__v_skip", !0), t;
}
const vt = (t) => ot(t) ? Mr(t) : t, wr = (t) => ot(t) ? ul(t) : t;
function wt(t) {
  return t ? t.__v_isRef === !0 : !1;
}
function ce(t) {
  return ku(t, !1);
}
function ku(t, e) {
  return wt(t) ? t : new xu(t, e);
}
class xu {
  constructor(e, n) {
    this.dep = new Yi(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? e : Be(e), this._value = n ? e : vt(e), this.__v_isShallow = n;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(e) {
    const n = this._rawValue, s = this.__v_isShallow || zt(e) || Ln(e);
    e = s ? e : Be(e), En(e, n) && (this._rawValue = e, this._value = s ? e : vt(e), this.dep.trigger());
  }
}
function E(t) {
  return wt(t) ? t.value : t;
}
const Au = {
  get: (t, e, n) => e === "__v_raw" ? t : E(Reflect.get(t, e, n)),
  set: (t, e, n, s) => {
    const r = t[e];
    return wt(r) && !wt(n) ? (r.value = n, !0) : Reflect.set(t, e, n, s);
  }
};
function fl(t) {
  return ts(t) ? t : new Proxy(t, Au);
}
class Tu {
  constructor(e, n, s) {
    this.fn = e, this.setter = n, this._value = void 0, this.dep = new Yi(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Bs - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = s;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    tt !== this)
      return Ja(this, !0), !0;
  }
  get value() {
    const e = this.dep.track();
    return tl(this), e && (e.version = this.dep.version), this._value;
  }
  set value(e) {
    this.setter && this.setter(e);
  }
}
function Su(t, e, n = !1) {
  let s, r;
  return _e(t) ? s = t : (s = t.get, r = t.set), new Tu(s, r, n);
}
const sr = {}, kr = /* @__PURE__ */ new WeakMap();
let zn;
function Eu(t, e = !1, n = zn) {
  if (n) {
    let s = kr.get(n);
    s || kr.set(n, s = []), s.push(t);
  }
}
function Cu(t, e, n = Je) {
  const { immediate: s, deep: r, once: i, scheduler: o, augmentJob: a, call: l } = n, h = (z) => r ? z : zt(z) || r === !1 || r === 0 ? gn(z, 1) : gn(z);
  let c, b, _, F, $ = !1, Y = !1;
  if (wt(t) ? (b = () => t.value, $ = zt(t)) : ts(t) ? (b = () => h(t), $ = !0) : he(t) ? (Y = !0, $ = t.some((z) => ts(z) || zt(z)), b = () => t.map((z) => {
    if (wt(z))
      return z.value;
    if (ts(z))
      return h(z);
    if (_e(z))
      return l ? l(z, 2) : z();
  })) : _e(t) ? e ? b = l ? () => l(t, 2) : t : b = () => {
    if (_) {
      yn();
      try {
        _();
      } finally {
        bn();
      }
    }
    const z = zn;
    zn = c;
    try {
      return l ? l(t, 3, [F]) : t(F);
    } finally {
      zn = z;
    }
  } : b = rn, e && r) {
    const z = b, W = r === !0 ? 1 / 0 : r;
    b = () => gn(z(), W);
  }
  const Ce = tu(), ne = () => {
    c.stop(), Ce && Ce.active && qi(Ce.effects, c);
  };
  if (i && e) {
    const z = e;
    e = (...W) => {
      z(...W), ne();
    };
  }
  let Ee = Y ? new Array(t.length).fill(sr) : sr;
  const ke = (z) => {
    if (!(!(c.flags & 1) || !c.dirty && !z))
      if (e) {
        const W = c.run();
        if (r || $ || (Y ? W.some((ee, V) => En(ee, Ee[V])) : En(W, Ee))) {
          _ && _();
          const ee = zn;
          zn = c;
          try {
            const V = [
              W,
              // pass undefined as the old value when it's changed for the first time
              Ee === sr ? void 0 : Y && Ee[0] === sr ? [] : Ee,
              F
            ];
            Ee = W, l ? l(e, 3, V) : (
              // @ts-expect-error
              e(...V)
            );
          } finally {
            zn = ee;
          }
        }
      } else
        c.run();
  };
  return a && a(ke), c = new Xa(b), c.scheduler = o ? () => o(ke, !1) : ke, F = (z) => Eu(z, !1, c), _ = c.onStop = () => {
    const z = kr.get(c);
    if (z) {
      if (l)
        l(z, 4);
      else
        for (const W of z) W();
      kr.delete(c);
    }
  }, e ? s ? ke(!0) : Ee = c.run() : o ? o(ke.bind(null, !0), !0) : c.run(), ne.pause = c.pause.bind(c), ne.resume = c.resume.bind(c), ne.stop = ne, ne;
}
function gn(t, e = 1 / 0, n) {
  if (e <= 0 || !ot(t) || t.__v_skip || (n = n || /* @__PURE__ */ new Set(), n.has(t)))
    return t;
  if (n.add(t), e--, wt(t))
    gn(t.value, e, n);
  else if (he(t))
    for (let s = 0; s < t.length; s++)
      gn(t[s], e, n);
  else if (Ha(t) || es(t))
    t.forEach((s) => {
      gn(s, e, n);
    });
  else if (ja(t)) {
    for (const s in t)
      gn(t[s], e, n);
    for (const s of Object.getOwnPropertySymbols(t))
      Object.prototype.propertyIsEnumerable.call(t, s) && gn(t[s], e, n);
  }
  return t;
}
/**
* @vue/runtime-core v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function qs(t, e, n, s) {
  try {
    return s ? t(...s) : t();
  } catch (r) {
    Dr(r, e, n);
  }
}
function ln(t, e, n, s) {
  if (_e(t)) {
    const r = qs(t, e, n, s);
    return r && Wa(r) && r.catch((i) => {
      Dr(i, e, n);
    }), r;
  }
  if (he(t)) {
    const r = [];
    for (let i = 0; i < t.length; i++)
      r.push(ln(t[i], e, n, s));
    return r;
  }
}
function Dr(t, e, n, s = !0) {
  const r = e ? e.vnode : null, { errorHandler: i, throwUnhandledErrorInProduction: o } = e && e.appContext.config || Je;
  if (e) {
    let a = e.parent;
    const l = e.proxy, h = `https://vuejs.org/error-reference/#runtime-${n}`;
    for (; a; ) {
      const c = a.ec;
      if (c) {
        for (let b = 0; b < c.length; b++)
          if (c[b](t, l, h) === !1)
            return;
      }
      a = a.parent;
    }
    if (i) {
      yn(), qs(i, null, 10, [
        t,
        l,
        h
      ]), bn();
      return;
    }
  }
  Ru(t, n, r, s, o);
}
function Ru(t, e, n, s = !0, r = !1) {
  if (r)
    throw t;
  console.error(t);
}
const Tt = [];
let nn = -1;
const ns = [];
let Tn = null, Zn = 0;
const hl = /* @__PURE__ */ Promise.resolve();
let xr = null;
function Ai(t) {
  const e = xr || hl;
  return t ? e.then(this ? t.bind(this) : t) : e;
}
function Iu(t) {
  let e = nn + 1, n = Tt.length;
  for (; e < n; ) {
    const s = e + n >>> 1, r = Tt[s], i = Us(r);
    i < t || i === t && r.flags & 2 ? e = s + 1 : n = s;
  }
  return e;
}
function Qi(t) {
  if (!(t.flags & 1)) {
    const e = Us(t), n = Tt[Tt.length - 1];
    !n || // fast path when the job id is larger than the tail
    !(t.flags & 2) && e >= Us(n) ? Tt.push(t) : Tt.splice(Iu(e), 0, t), t.flags |= 1, dl();
  }
}
function dl() {
  xr || (xr = hl.then(gl));
}
function Lu(t) {
  he(t) ? ns.push(...t) : Tn && t.id === -1 ? Tn.splice(Zn + 1, 0, t) : t.flags & 1 || (ns.push(t), t.flags |= 1), dl();
}
function Ko(t, e, n = nn + 1) {
  for (; n < Tt.length; n++) {
    const s = Tt[n];
    if (s && s.flags & 2) {
      if (t && s.id !== t.uid)
        continue;
      Tt.splice(n, 1), n--, s.flags & 4 && (s.flags &= -2), s(), s.flags & 4 || (s.flags &= -2);
    }
  }
}
function pl(t) {
  if (ns.length) {
    const e = [...new Set(ns)].sort(
      (n, s) => Us(n) - Us(s)
    );
    if (ns.length = 0, Tn) {
      Tn.push(...e);
      return;
    }
    for (Tn = e, Zn = 0; Zn < Tn.length; Zn++) {
      const n = Tn[Zn];
      n.flags & 4 && (n.flags &= -2), n.flags & 8 || n(), n.flags &= -2;
    }
    Tn = null, Zn = 0;
  }
}
const Us = (t) => t.id == null ? t.flags & 2 ? -1 : 1 / 0 : t.id;
function gl(t) {
  try {
    for (nn = 0; nn < Tt.length; nn++) {
      const e = Tt[nn];
      e && !(e.flags & 8) && (e.flags & 4 && (e.flags &= -2), qs(
        e,
        e.i,
        e.i ? 15 : 14
      ), e.flags & 4 || (e.flags &= -2));
    }
  } finally {
    for (; nn < Tt.length; nn++) {
      const e = Tt[nn];
      e && (e.flags &= -2);
    }
    nn = -1, Tt.length = 0, pl(), xr = null, (Tt.length || ns.length) && gl();
  }
}
let Ut = null, ml = null;
function Ar(t) {
  const e = Ut;
  return Ut = t, ml = t && t.type.__scopeId || null, e;
}
function Ou(t, e = Ut, n) {
  if (!e || t._n)
    return t;
  const s = (...r) => {
    s._d && na(-1);
    const i = Ar(e);
    let o;
    try {
      o = t(...r);
    } finally {
      Ar(i), s._d && na(1);
    }
    return o;
  };
  return s._n = !0, s._c = !0, s._d = !0, s;
}
function An(t, e) {
  if (Ut === null)
    return t;
  const n = zr(Ut), s = t.dirs || (t.dirs = []);
  for (let r = 0; r < e.length; r++) {
    let [i, o, a, l = Je] = e[r];
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
  return t;
}
function Dn(t, e, n, s) {
  const r = t.dirs, i = e && e.dirs;
  for (let o = 0; o < r.length; o++) {
    const a = r[o];
    i && (a.oldValue = i[o].value);
    let l = a.dir[s];
    l && (yn(), ln(l, n, 8, [
      t.el,
      a,
      t,
      e
    ]), bn());
  }
}
const Pu = Symbol("_vte"), Nu = (t) => t.__isTeleport;
function eo(t, e) {
  t.shapeFlag & 6 && t.component ? (t.transition = e, eo(t.component.subTree, e)) : t.shapeFlag & 128 ? (t.ssContent.transition = e.clone(t.ssContent), t.ssFallback.transition = e.clone(t.ssFallback)) : t.transition = e;
}
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function Fu(t, e) {
  return _e(t) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    kt({ name: t.name }, e, { setup: t })
  ) : t;
}
function _l(t) {
  t.ids = [t.ids[0] + t.ids[2]++ + "-", 0, 0];
}
function Ps(t, e, n, s, r = !1) {
  if (he(t)) {
    t.forEach(
      ($, Y) => Ps(
        $,
        e && (he(e) ? e[Y] : e),
        n,
        s,
        r
      )
    );
    return;
  }
  if (Ns(s) && !r) {
    s.shapeFlag & 512 && s.type.__asyncResolved && s.component.subTree.component && Ps(t, e, n, s.component.subTree);
    return;
  }
  const i = s.shapeFlag & 4 ? zr(s.component) : s.el, o = r ? null : i, { i: a, r: l } = t, h = e && e.r, c = a.refs === Je ? a.refs = {} : a.refs, b = a.setupState, _ = Be(b), F = b === Je ? () => !1 : ($) => $e(_, $);
  if (h != null && h !== l && (pt(h) ? (c[h] = null, F(h) && (b[h] = null)) : wt(h) && (h.value = null)), _e(l))
    qs(l, a, 12, [o, c]);
  else {
    const $ = pt(l), Y = wt(l);
    if ($ || Y) {
      const Ce = () => {
        if (t.f) {
          const ne = $ ? F(l) ? b[l] : c[l] : l.value;
          r ? he(ne) && qi(ne, i) : he(ne) ? ne.includes(i) || ne.push(i) : $ ? (c[l] = [i], F(l) && (b[l] = c[l])) : (l.value = [i], t.k && (c[t.k] = l.value));
        } else $ ? (c[l] = o, F(l) && (b[l] = o)) : Y && (l.value = o, t.k && (c[t.k] = o));
      };
      o ? (Ce.id = -1, Ft(Ce, n)) : Ce();
    }
  }
}
Nr().requestIdleCallback;
Nr().cancelIdleCallback;
const Ns = (t) => !!t.type.__asyncLoader, vl = (t) => t.type.__isKeepAlive;
function Mu(t, e) {
  yl(t, "a", e);
}
function Du(t, e) {
  yl(t, "da", e);
}
function yl(t, e, n = St) {
  const s = t.__wdc || (t.__wdc = () => {
    let r = n;
    for (; r; ) {
      if (r.isDeactivated)
        return;
      r = r.parent;
    }
    return t();
  });
  if (Br(e, s, n), n) {
    let r = n.parent;
    for (; r && r.parent; )
      vl(r.parent.vnode) && Bu(s, e, n, r), r = r.parent;
  }
}
function Bu(t, e, n, s) {
  const r = Br(
    e,
    t,
    s,
    !0
    /* prepend */
  );
  js(() => {
    qi(s[e], r);
  }, n);
}
function Br(t, e, n = St, s = !1) {
  if (n) {
    const r = n[t] || (n[t] = []), i = e.__weh || (e.__weh = (...o) => {
      yn();
      const a = Vs(n), l = ln(e, n, t, o);
      return a(), bn(), l;
    });
    return s ? r.unshift(i) : r.push(i), i;
  }
}
const wn = (t) => (e, n = St) => {
  (!Hs || t === "sp") && Br(t, (...s) => e(...s), n);
}, $u = wn("bm"), to = wn("m"), Uu = wn(
  "bu"
), zu = wn("u"), Hu = wn(
  "bum"
), js = wn("um"), Wu = wn(
  "sp"
), qu = wn("rtg"), ju = wn("rtc");
function Vu(t, e = St) {
  Br("ec", t, e);
}
const Ku = Symbol.for("v-ndc");
function Pt(t, e, n, s) {
  let r;
  const i = n, o = he(t);
  if (o || pt(t)) {
    const a = o && ts(t);
    let l = !1, h = !1;
    a && (l = !zt(t), h = Ln(t), t = Fr(t)), r = new Array(t.length);
    for (let c = 0, b = t.length; c < b; c++)
      r[c] = e(
        l ? h ? wr(vt(t[c])) : vt(t[c]) : t[c],
        c,
        void 0,
        i
      );
  } else if (typeof t == "number") {
    r = new Array(t);
    for (let a = 0; a < t; a++)
      r[a] = e(a + 1, a, void 0, i);
  } else if (ot(t))
    if (t[Symbol.iterator])
      r = Array.from(
        t,
        (a, l) => e(a, l, void 0, i)
      );
    else {
      const a = Object.keys(t);
      r = new Array(a.length);
      for (let l = 0, h = a.length; l < h; l++) {
        const c = a[l];
        r[l] = e(t[c], c, l, i);
      }
    }
  else
    r = [];
  return r;
}
const Ti = (t) => t ? Ul(t) ? zr(t) : Ti(t.parent) : null, Fs = (
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
    $parent: (t) => Ti(t.parent),
    $root: (t) => Ti(t.root),
    $host: (t) => t.ce,
    $emit: (t) => t.emit,
    $options: (t) => wl(t),
    $forceUpdate: (t) => t.f || (t.f = () => {
      Qi(t.update);
    }),
    $nextTick: (t) => t.n || (t.n = Ai.bind(t.proxy)),
    $watch: (t) => mf.bind(t)
  })
), ni = (t, e) => t !== Je && !t.__isScriptSetup && $e(t, e), Gu = {
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
        if (ni(s, e))
          return o[e] = 1, s[e];
        if (r !== Je && $e(r, e))
          return o[e] = 2, r[e];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (h = t.propsOptions[0]) && $e(h, e)
        )
          return o[e] = 3, i[e];
        if (n !== Je && $e(n, e))
          return o[e] = 4, n[e];
        Si && (o[e] = 0);
      }
    }
    const c = Fs[e];
    let b, _;
    if (c)
      return e === "$attrs" && bt(t.attrs, "get", ""), c(t);
    if (
      // css module (injected by vue-loader)
      (b = a.__cssModules) && (b = b[e])
    )
      return b;
    if (n !== Je && $e(n, e))
      return o[e] = 4, n[e];
    if (
      // global properties
      _ = l.config.globalProperties, $e(_, e)
    )
      return _[e];
  },
  set({ _: t }, e, n) {
    const { data: s, setupState: r, ctx: i } = t;
    return ni(r, e) ? (r[e] = n, !0) : s !== Je && $e(s, e) ? (s[e] = n, !0) : $e(t.props, e) || e[0] === "$" && e.slice(1) in t ? !1 : (i[e] = n, !0);
  },
  has({
    _: { data: t, setupState: e, accessCache: n, ctx: s, appContext: r, propsOptions: i }
  }, o) {
    let a;
    return !!n[o] || t !== Je && $e(t, o) || ni(e, o) || (a = i[0]) && $e(a, o) || $e(s, o) || $e(Fs, o) || $e(r.config.globalProperties, o);
  },
  defineProperty(t, e, n) {
    return n.get != null ? t._.accessCache[e] = 0 : $e(n, "value") && this.set(t, e, n.value, null), Reflect.defineProperty(t, e, n);
  }
};
function Go(t) {
  return he(t) ? t.reduce(
    (e, n) => (e[n] = null, e),
    {}
  ) : t;
}
let Si = !0;
function Yu(t) {
  const e = wl(t), n = t.proxy, s = t.ctx;
  Si = !1, e.beforeCreate && Yo(e.beforeCreate, t, "bc");
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
    beforeMount: b,
    mounted: _,
    beforeUpdate: F,
    updated: $,
    activated: Y,
    deactivated: Ce,
    beforeDestroy: ne,
    beforeUnmount: Ee,
    destroyed: ke,
    unmounted: z,
    render: W,
    renderTracked: ee,
    renderTriggered: V,
    errorCaptured: Pe,
    serverPrefetch: rt,
    // public API
    expose: Ve,
    inheritAttrs: xe,
    // assets
    components: ge,
    directives: Ke,
    filters: Qe
  } = e;
  if (h && Xu(h, s, null), o)
    for (const me in o) {
      const le = o[me];
      _e(le) && (s[me] = le.bind(n));
    }
  if (r) {
    const me = r.call(n, n);
    ot(me) && (t.data = Mr(me));
  }
  if (Si = !0, i)
    for (const me in i) {
      const le = i[me], ut = _e(le) ? le.bind(n, n) : _e(le.get) ? le.get.bind(n, n) : rn, it = !_e(le) && _e(le.set) ? le.set.bind(n) : rn, ie = Ie({
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
      bl(a[me], s, n, me);
  if (l) {
    const me = _e(l) ? l.call(n) : l;
    Reflect.ownKeys(me).forEach((le) => {
      nf(le, me[le]);
    });
  }
  c && Yo(c, t, "c");
  function ae(me, le) {
    he(le) ? le.forEach((ut) => me(ut.bind(n))) : le && me(le.bind(n));
  }
  if (ae($u, b), ae(to, _), ae(Uu, F), ae(zu, $), ae(Mu, Y), ae(Du, Ce), ae(Vu, Pe), ae(ju, ee), ae(qu, V), ae(Hu, Ee), ae(js, z), ae(Wu, rt), he(Ve))
    if (Ve.length) {
      const me = t.exposed || (t.exposed = {});
      Ve.forEach((le) => {
        Object.defineProperty(me, le, {
          get: () => n[le],
          set: (ut) => n[le] = ut,
          enumerable: !0
        });
      });
    } else t.exposed || (t.exposed = {});
  W && t.render === rn && (t.render = W), xe != null && (t.inheritAttrs = xe), ge && (t.components = ge), Ke && (t.directives = Ke), rt && _l(t);
}
function Xu(t, e, n = rn) {
  he(t) && (t = Ei(t));
  for (const s in t) {
    const r = t[s];
    let i;
    ot(r) ? "default" in r ? i = ur(
      r.from || s,
      r.default,
      !0
    ) : i = ur(r.from || s) : i = ur(r), wt(i) ? Object.defineProperty(e, s, {
      enumerable: !0,
      configurable: !0,
      get: () => i.value,
      set: (o) => i.value = o
    }) : e[s] = i;
  }
}
function Yo(t, e, n) {
  ln(
    he(t) ? t.map((s) => s.bind(e.proxy)) : t.bind(e.proxy),
    e,
    n
  );
}
function bl(t, e, n, s) {
  let r = s.includes(".") ? Nl(n, s) : () => n[s];
  if (pt(t)) {
    const i = e[t];
    _e(i) && mn(r, i);
  } else if (_e(t))
    mn(r, t.bind(n));
  else if (ot(t))
    if (he(t))
      t.forEach((i) => bl(i, e, n, s));
    else {
      const i = _e(t.handler) ? t.handler.bind(n) : e[t.handler];
      _e(i) && mn(r, i, t);
    }
}
function wl(t) {
  const e = t.type, { mixins: n, extends: s } = e, {
    mixins: r,
    optionsCache: i,
    config: { optionMergeStrategies: o }
  } = t.appContext, a = i.get(e);
  let l;
  return a ? l = a : !r.length && !n && !s ? l = e : (l = {}, r.length && r.forEach(
    (h) => Tr(l, h, o, !0)
  ), Tr(l, e, o)), ot(e) && i.set(e, l), l;
}
function Tr(t, e, n, s = !1) {
  const { mixins: r, extends: i } = e;
  i && Tr(t, i, n, !0), r && r.forEach(
    (o) => Tr(t, o, n, !0)
  );
  for (const o in e)
    if (!(s && o === "expose")) {
      const a = Zu[o] || n && n[o];
      t[o] = a ? a(t[o], e[o]) : e[o];
    }
  return t;
}
const Zu = {
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
  watch: Qu,
  // provide / inject
  provide: Xo,
  inject: Ju
};
function Xo(t, e) {
  return e ? t ? function() {
    return kt(
      _e(t) ? t.call(this, this) : t,
      _e(e) ? e.call(this, this) : e
    );
  } : e : t;
}
function Ju(t, e) {
  return Es(Ei(t), Ei(e));
}
function Ei(t) {
  if (he(t)) {
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
function Es(t, e) {
  return t ? kt(/* @__PURE__ */ Object.create(null), t, e) : e;
}
function Zo(t, e) {
  return t ? he(t) && he(e) ? [.../* @__PURE__ */ new Set([...t, ...e])] : kt(
    /* @__PURE__ */ Object.create(null),
    Go(t),
    Go(e ?? {})
  ) : e;
}
function Qu(t, e) {
  if (!t) return e;
  if (!e) return t;
  const n = kt(/* @__PURE__ */ Object.create(null), t);
  for (const s in e)
    n[s] = At(t[s], e[s]);
  return n;
}
function kl() {
  return {
    app: null,
    config: {
      isNativeTag: Wc,
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
let ef = 0;
function tf(t, e) {
  return function(s, r = null) {
    _e(s) || (s = kt({}, s)), r != null && !ot(r) && (r = null);
    const i = kl(), o = /* @__PURE__ */ new WeakSet(), a = [];
    let l = !1;
    const h = i.app = {
      _uid: ef++,
      _component: s,
      _props: r,
      _container: null,
      _context: i,
      _instance: null,
      version: Bf,
      get config() {
        return i.config;
      },
      set config(c) {
      },
      use(c, ...b) {
        return o.has(c) || (c && _e(c.install) ? (o.add(c), c.install(h, ...b)) : _e(c) && (o.add(c), c(h, ...b))), h;
      },
      mixin(c) {
        return i.mixins.includes(c) || i.mixins.push(c), h;
      },
      component(c, b) {
        return b ? (i.components[c] = b, h) : i.components[c];
      },
      directive(c, b) {
        return b ? (i.directives[c] = b, h) : i.directives[c];
      },
      mount(c, b, _) {
        if (!l) {
          const F = h._ceVNode || on(s, r);
          return F.appContext = i, _ === !0 ? _ = "svg" : _ === !1 && (_ = void 0), t(F, c, _), l = !0, h._container = c, c.__vue_app__ = h, zr(F.component);
        }
      },
      onUnmount(c) {
        a.push(c);
      },
      unmount() {
        l && (ln(
          a,
          h._instance,
          16
        ), t(null, h._container), delete h._container.__vue_app__);
      },
      provide(c, b) {
        return i.provides[c] = b, h;
      },
      runWithContext(c) {
        const b = ss;
        ss = h;
        try {
          return c();
        } finally {
          ss = b;
        }
      }
    };
    return h;
  };
}
let ss = null;
function nf(t, e) {
  if (St) {
    let n = St.provides;
    const s = St.parent && St.parent.provides;
    s === n && (n = St.provides = Object.create(s)), n[t] = e;
  }
}
function ur(t, e, n = !1) {
  const s = Of();
  if (s || ss) {
    let r = ss ? ss._context.provides : s ? s.parent == null || s.ce ? s.vnode.appContext && s.vnode.appContext.provides : s.parent.provides : void 0;
    if (r && t in r)
      return r[t];
    if (arguments.length > 1)
      return n && _e(e) ? e.call(s && s.proxy) : e;
  }
}
const xl = {}, Al = () => Object.create(xl), Tl = (t) => Object.getPrototypeOf(t) === xl;
function sf(t, e, n, s = !1) {
  const r = {}, i = Al();
  t.propsDefaults = /* @__PURE__ */ Object.create(null), Sl(t, e, r, i);
  for (const o in t.propsOptions[0])
    o in r || (r[o] = void 0);
  n ? t.props = s ? r : bu(r) : t.type.props ? t.props = r : t.props = i, t.attrs = i;
}
function rf(t, e, n, s) {
  const {
    props: r,
    attrs: i,
    vnode: { patchFlag: o }
  } = t, a = Be(r), [l] = t.propsOptions;
  let h = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (s || o > 0) && !(o & 16)
  ) {
    if (o & 8) {
      const c = t.vnode.dynamicProps;
      for (let b = 0; b < c.length; b++) {
        let _ = c[b];
        if ($r(t.emitsOptions, _))
          continue;
        const F = e[_];
        if (l)
          if ($e(i, _))
            F !== i[_] && (i[_] = F, h = !0);
          else {
            const $ = In(_);
            r[$] = Ci(
              l,
              a,
              $,
              F,
              t,
              !1
            );
          }
        else
          F !== i[_] && (i[_] = F, h = !0);
      }
    }
  } else {
    Sl(t, e, r, i) && (h = !0);
    let c;
    for (const b in a)
      (!e || // for camelCase
      !$e(e, b) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((c = Nn(b)) === b || !$e(e, c))) && (l ? n && // for camelCase
      (n[b] !== void 0 || // for kebab-case
      n[c] !== void 0) && (r[b] = Ci(
        l,
        a,
        b,
        void 0,
        t,
        !0
      )) : delete r[b]);
    if (i !== a)
      for (const b in i)
        (!e || !$e(e, b)) && (delete i[b], h = !0);
  }
  h && pn(t.attrs, "set", "");
}
function Sl(t, e, n, s) {
  const [r, i] = t.propsOptions;
  let o = !1, a;
  if (e)
    for (let l in e) {
      if (Is(l))
        continue;
      const h = e[l];
      let c;
      r && $e(r, c = In(l)) ? !i || !i.includes(c) ? n[c] = h : (a || (a = {}))[c] = h : $r(t.emitsOptions, l) || (!(l in s) || h !== s[l]) && (s[l] = h, o = !0);
    }
  if (i) {
    const l = Be(n), h = a || Je;
    for (let c = 0; c < i.length; c++) {
      const b = i[c];
      n[b] = Ci(
        r,
        l,
        b,
        h[b],
        t,
        !$e(h, b)
      );
    }
  }
  return o;
}
function Ci(t, e, n, s, r, i) {
  const o = t[n];
  if (o != null) {
    const a = $e(o, "default");
    if (a && s === void 0) {
      const l = o.default;
      if (o.type !== Function && !o.skipFactory && _e(l)) {
        const { propsDefaults: h } = r;
        if (n in h)
          s = h[n];
        else {
          const c = Vs(r);
          s = h[n] = l.call(
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
    ] && (s === "" || s === Nn(n)) && (s = !0));
  }
  return s;
}
const of = /* @__PURE__ */ new WeakMap();
function El(t, e, n = !1) {
  const s = n ? of : e.propsCache, r = s.get(t);
  if (r)
    return r;
  const i = t.props, o = {}, a = [];
  let l = !1;
  if (!_e(t)) {
    const c = (b) => {
      l = !0;
      const [_, F] = El(b, e, !0);
      kt(o, _), F && a.push(...F);
    };
    !n && e.mixins.length && e.mixins.forEach(c), t.extends && c(t.extends), t.mixins && t.mixins.forEach(c);
  }
  if (!i && !l)
    return ot(t) && s.set(t, Qn), Qn;
  if (he(i))
    for (let c = 0; c < i.length; c++) {
      const b = In(i[c]);
      Jo(b) && (o[b] = Je);
    }
  else if (i)
    for (const c in i) {
      const b = In(c);
      if (Jo(b)) {
        const _ = i[c], F = o[b] = he(_) || _e(_) ? { type: _ } : kt({}, _), $ = F.type;
        let Y = !1, Ce = !0;
        if (he($))
          for (let ne = 0; ne < $.length; ++ne) {
            const Ee = $[ne], ke = _e(Ee) && Ee.name;
            if (ke === "Boolean") {
              Y = !0;
              break;
            } else ke === "String" && (Ce = !1);
          }
        else
          Y = _e($) && $.name === "Boolean";
        F[
          0
          /* shouldCast */
        ] = Y, F[
          1
          /* shouldCastTrue */
        ] = Ce, (Y || $e(F, "default")) && a.push(b);
      }
    }
  const h = [o, a];
  return ot(t) && s.set(t, h), h;
}
function Jo(t) {
  return t[0] !== "$" && !Is(t);
}
const no = (t) => t === "_" || t === "__" || t === "_ctx" || t === "$stable", so = (t) => he(t) ? t.map(sn) : [sn(t)], af = (t, e, n) => {
  if (e._n)
    return e;
  const s = Ou((...r) => so(e(...r)), n);
  return s._c = !1, s;
}, Cl = (t, e, n) => {
  const s = t._ctx;
  for (const r in t) {
    if (no(r)) continue;
    const i = t[r];
    if (_e(i))
      e[r] = af(r, i, s);
    else if (i != null) {
      const o = so(i);
      e[r] = () => o;
    }
  }
}, Rl = (t, e) => {
  const n = so(e);
  t.slots.default = () => n;
}, Il = (t, e, n) => {
  for (const s in e)
    (n || !no(s)) && (t[s] = e[s]);
}, lf = (t, e, n) => {
  const s = t.slots = Al();
  if (t.vnode.shapeFlag & 32) {
    const r = e.__;
    r && vi(s, "__", r, !0);
    const i = e._;
    i ? (Il(s, e, n), n && vi(s, "_", i, !0)) : Cl(e, s);
  } else e && Rl(t, e);
}, cf = (t, e, n) => {
  const { vnode: s, slots: r } = t;
  let i = !0, o = Je;
  if (s.shapeFlag & 32) {
    const a = e._;
    a ? n && a === 1 ? i = !1 : Il(r, e, n) : (i = !e.$stable, Cl(e, r)), o = e;
  } else e && (Rl(t, e), o = { default: 1 });
  if (i)
    for (const a in r)
      !no(a) && o[a] == null && delete r[a];
}, Ft = xf;
function uf(t) {
  return ff(t);
}
function ff(t, e) {
  const n = Nr();
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
    parentNode: b,
    nextSibling: _,
    setScopeId: F = rn,
    insertStaticContent: $
  } = t, Y = (d, v, k, L = null, R = null, I = null, B = void 0, D = null, M = !!v.dynamicChildren) => {
    if (d === v)
      return;
    d && !gs(d, v) && (L = j(d), nt(d, R, I, !0), d = null), v.patchFlag === -2 && (M = !1, v.dynamicChildren = null);
    const { type: P, ref: X, shapeFlag: U } = v;
    switch (P) {
      case Ur:
        Ce(d, v, k, L);
        break;
      case On:
        ne(d, v, k, L);
        break;
      case fr:
        d == null && Ee(v, k, L, B);
        break;
      case et:
        ge(
          d,
          v,
          k,
          L,
          R,
          I,
          B,
          D,
          M
        );
        break;
      default:
        U & 1 ? W(
          d,
          v,
          k,
          L,
          R,
          I,
          B,
          D,
          M
        ) : U & 6 ? Ke(
          d,
          v,
          k,
          L,
          R,
          I,
          B,
          D,
          M
        ) : (U & 64 || U & 128) && P.process(
          d,
          v,
          k,
          L,
          R,
          I,
          B,
          D,
          M,
          gt
        );
    }
    X != null && R ? Ps(X, d && d.ref, I, v || d, !v) : X == null && d && d.ref != null && Ps(d.ref, null, I, d, !0);
  }, Ce = (d, v, k, L) => {
    if (d == null)
      s(
        v.el = a(v.children),
        k,
        L
      );
    else {
      const R = v.el = d.el;
      v.children !== d.children && h(R, v.children);
    }
  }, ne = (d, v, k, L) => {
    d == null ? s(
      v.el = l(v.children || ""),
      k,
      L
    ) : v.el = d.el;
  }, Ee = (d, v, k, L) => {
    [d.el, d.anchor] = $(
      d.children,
      v,
      k,
      L,
      d.el,
      d.anchor
    );
  }, ke = ({ el: d, anchor: v }, k, L) => {
    let R;
    for (; d && d !== v; )
      R = _(d), s(d, k, L), d = R;
    s(v, k, L);
  }, z = ({ el: d, anchor: v }) => {
    let k;
    for (; d && d !== v; )
      k = _(d), r(d), d = k;
    r(v);
  }, W = (d, v, k, L, R, I, B, D, M) => {
    v.type === "svg" ? B = "svg" : v.type === "math" && (B = "mathml"), d == null ? ee(
      v,
      k,
      L,
      R,
      I,
      B,
      D,
      M
    ) : rt(
      d,
      v,
      R,
      I,
      B,
      D,
      M
    );
  }, ee = (d, v, k, L, R, I, B, D) => {
    let M, P;
    const { props: X, shapeFlag: U, transition: K, dirs: Q } = d;
    if (M = d.el = o(
      d.type,
      I,
      X && X.is,
      X
    ), U & 8 ? c(M, d.children) : U & 16 && Pe(
      d.children,
      M,
      null,
      L,
      R,
      si(d, I),
      B,
      D
    ), Q && Dn(d, null, L, "created"), V(M, d, d.scopeId, B, L), X) {
      for (const Re in X)
        Re !== "value" && !Is(Re) && i(M, Re, null, X[Re], I, L);
      "value" in X && i(M, "value", null, X.value, I), (P = X.onVnodeBeforeMount) && Qt(P, L, d);
    }
    Q && Dn(d, null, L, "beforeMount");
    const ue = hf(R, K);
    ue && K.beforeEnter(M), s(M, v, k), ((P = X && X.onVnodeMounted) || ue || Q) && Ft(() => {
      P && Qt(P, L, d), ue && K.enter(M), Q && Dn(d, null, L, "mounted");
    }, R);
  }, V = (d, v, k, L, R) => {
    if (k && F(d, k), L)
      for (let I = 0; I < L.length; I++)
        F(d, L[I]);
    if (R) {
      let I = R.subTree;
      if (v === I || Ml(I.type) && (I.ssContent === v || I.ssFallback === v)) {
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
  }, Pe = (d, v, k, L, R, I, B, D, M = 0) => {
    for (let P = M; P < d.length; P++) {
      const X = d[P] = D ? Sn(d[P]) : sn(d[P]);
      Y(
        null,
        X,
        v,
        k,
        L,
        R,
        I,
        B,
        D
      );
    }
  }, rt = (d, v, k, L, R, I, B) => {
    const D = v.el = d.el;
    let { patchFlag: M, dynamicChildren: P, dirs: X } = v;
    M |= d.patchFlag & 16;
    const U = d.props || Je, K = v.props || Je;
    let Q;
    if (k && Bn(k, !1), (Q = K.onVnodeBeforeUpdate) && Qt(Q, k, v, d), X && Dn(v, d, k, "beforeUpdate"), k && Bn(k, !0), (U.innerHTML && K.innerHTML == null || U.textContent && K.textContent == null) && c(D, ""), P ? Ve(
      d.dynamicChildren,
      P,
      D,
      k,
      L,
      si(v, R),
      I
    ) : B || le(
      d,
      v,
      D,
      null,
      k,
      L,
      si(v, R),
      I,
      !1
    ), M > 0) {
      if (M & 16)
        xe(D, U, K, k, R);
      else if (M & 2 && U.class !== K.class && i(D, "class", null, K.class, R), M & 4 && i(D, "style", U.style, K.style, R), M & 8) {
        const ue = v.dynamicProps;
        for (let Re = 0; Re < ue.length; Re++) {
          const pe = ue[Re], ze = U[pe], Me = K[pe];
          (Me !== ze || pe === "value") && i(D, pe, ze, Me, R, k);
        }
      }
      M & 1 && d.children !== v.children && c(D, v.children);
    } else !B && P == null && xe(D, U, K, k, R);
    ((Q = K.onVnodeUpdated) || X) && Ft(() => {
      Q && Qt(Q, k, v, d), X && Dn(v, d, k, "updated");
    }, L);
  }, Ve = (d, v, k, L, R, I, B) => {
    for (let D = 0; D < v.length; D++) {
      const M = d[D], P = v[D], X = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        M.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (M.type === et || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !gs(M, P) || // - In the case of a component, it could contain anything.
        M.shapeFlag & 198) ? b(M.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          k
        )
      );
      Y(
        M,
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
  }, xe = (d, v, k, L, R) => {
    if (v !== k) {
      if (v !== Je)
        for (const I in v)
          !Is(I) && !(I in k) && i(
            d,
            I,
            v[I],
            null,
            R,
            L
          );
      for (const I in k) {
        if (Is(I)) continue;
        const B = k[I], D = v[I];
        B !== D && I !== "value" && i(d, I, D, B, R, L);
      }
      "value" in k && i(d, "value", v.value, k.value, R);
    }
  }, ge = (d, v, k, L, R, I, B, D, M) => {
    const P = v.el = d ? d.el : a(""), X = v.anchor = d ? d.anchor : a("");
    let { patchFlag: U, dynamicChildren: K, slotScopeIds: Q } = v;
    Q && (D = D ? D.concat(Q) : Q), d == null ? (s(P, k, L), s(X, k, L), Pe(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      v.children || [],
      k,
      X,
      R,
      I,
      B,
      D,
      M
    )) : U > 0 && U & 64 && K && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    d.dynamicChildren ? (Ve(
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
    (v.key != null || R && v === R.subTree) && Ll(
      d,
      v,
      !0
      /* shallow */
    )) : le(
      d,
      v,
      k,
      X,
      R,
      I,
      B,
      D,
      M
    );
  }, Ke = (d, v, k, L, R, I, B, D, M) => {
    v.slotScopeIds = D, d == null ? v.shapeFlag & 512 ? R.ctx.activate(
      v,
      k,
      L,
      B,
      M
    ) : Qe(
      v,
      k,
      L,
      R,
      I,
      B,
      M
    ) : at(d, v, M);
  }, Qe = (d, v, k, L, R, I, B) => {
    const D = d.component = Lf(
      d,
      L,
      R
    );
    if (vl(d) && (D.ctx.renderer = gt), Pf(D, !1, B), D.asyncDep) {
      if (R && R.registerDep(D, ae, B), !d.el) {
        const M = D.subTree = on(On);
        ne(null, M, v, k), d.placeholder = M.el;
      }
    } else
      ae(
        D,
        d,
        v,
        k,
        R,
        I,
        B
      );
  }, at = (d, v, k) => {
    const L = v.component = d.component;
    if (wf(d, v, k))
      if (L.asyncDep && !L.asyncResolved) {
        me(L, v, k);
        return;
      } else
        L.next = v, L.update();
    else
      v.el = d.el, L.vnode = v;
  }, ae = (d, v, k, L, R, I, B) => {
    const D = () => {
      if (d.isMounted) {
        let { next: U, bu: K, u: Q, parent: ue, vnode: Re } = d;
        {
          const u = Ol(d);
          if (u) {
            U && (U.el = Re.el, me(d, U, B)), u.asyncDep.then(() => {
              d.isUnmounted || D();
            });
            return;
          }
        }
        let pe = U, ze;
        Bn(d, !1), U ? (U.el = Re.el, me(d, U, B)) : U = Re, K && cr(K), (ze = U.props && U.props.onVnodeBeforeUpdate) && Qt(ze, ue, U, Re), Bn(d, !0);
        const Me = ea(d), We = d.subTree;
        d.subTree = Me, Y(
          We,
          Me,
          // parent may have changed if it's in a teleport
          b(We.el),
          // anchor may have changed if it's in a fragment
          j(We),
          d,
          R,
          I
        ), U.el = Me.el, pe === null && kf(d, Me.el), Q && Ft(Q, R), (ze = U.props && U.props.onVnodeUpdated) && Ft(
          () => Qt(ze, ue, U, Re),
          R
        );
      } else {
        let U;
        const { el: K, props: Q } = v, { bm: ue, m: Re, parent: pe, root: ze, type: Me } = d, We = Ns(v);
        Bn(d, !1), ue && cr(ue), !We && (U = Q && Q.onVnodeBeforeMount) && Qt(U, pe, v), Bn(d, !0);
        {
          ze.ce && // @ts-expect-error _def is private
          ze.ce._def.shadowRoot !== !1 && ze.ce._injectChildStyle(Me);
          const u = d.subTree = ea(d);
          Y(
            null,
            u,
            k,
            L,
            d,
            R,
            I
          ), v.el = u.el;
        }
        if (Re && Ft(Re, R), !We && (U = Q && Q.onVnodeMounted)) {
          const u = v;
          Ft(
            () => Qt(U, pe, u),
            R
          );
        }
        (v.shapeFlag & 256 || pe && Ns(pe.vnode) && pe.vnode.shapeFlag & 256) && d.a && Ft(d.a, R), d.isMounted = !0, v = k = L = null;
      }
    };
    d.scope.on();
    const M = d.effect = new Xa(D);
    d.scope.off();
    const P = d.update = M.run.bind(M), X = d.job = M.runIfDirty.bind(M);
    X.i = d, X.id = d.uid, M.scheduler = () => Qi(X), Bn(d, !0), P();
  }, me = (d, v, k) => {
    v.component = d;
    const L = d.vnode.props;
    d.vnode = v, d.next = null, rf(d, v.props, L, k), cf(d, v.children, k), yn(), Ko(d), bn();
  }, le = (d, v, k, L, R, I, B, D, M = !1) => {
    const P = d && d.children, X = d ? d.shapeFlag : 0, U = v.children, { patchFlag: K, shapeFlag: Q } = v;
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
          M
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
          M
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
      M
    ) : re(P, R, I, !0) : (X & 8 && c(k, ""), Q & 16 && Pe(
      U,
      k,
      L,
      R,
      I,
      B,
      D,
      M
    ));
  }, ut = (d, v, k, L, R, I, B, D, M) => {
    d = d || Qn, v = v || Qn;
    const P = d.length, X = v.length, U = Math.min(P, X);
    let K;
    for (K = 0; K < U; K++) {
      const Q = v[K] = M ? Sn(v[K]) : sn(v[K]);
      Y(
        d[K],
        Q,
        k,
        null,
        R,
        I,
        B,
        D,
        M
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
      v,
      k,
      L,
      R,
      I,
      B,
      D,
      M,
      U
    );
  }, it = (d, v, k, L, R, I, B, D, M) => {
    let P = 0;
    const X = v.length;
    let U = d.length - 1, K = X - 1;
    for (; P <= U && P <= K; ) {
      const Q = d[P], ue = v[P] = M ? Sn(v[P]) : sn(v[P]);
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
          M
        );
      else
        break;
      P++;
    }
    for (; P <= U && P <= K; ) {
      const Q = d[U], ue = v[K] = M ? Sn(v[K]) : sn(v[K]);
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
          M
        );
      else
        break;
      U--, K--;
    }
    if (P > U) {
      if (P <= K) {
        const Q = K + 1, ue = Q < X ? v[Q].el : L;
        for (; P <= K; )
          Y(
            null,
            v[P] = M ? Sn(v[P]) : sn(v[P]),
            k,
            ue,
            R,
            I,
            B,
            D,
            M
          ), P++;
      }
    } else if (P > K)
      for (; P <= U; )
        nt(d[P], R, I, !0), P++;
    else {
      const Q = P, ue = P, Re = /* @__PURE__ */ new Map();
      for (P = ue; P <= K; P++) {
        const x = v[P] = M ? Sn(v[P]) : sn(v[P]);
        x.key != null && Re.set(x.key, P);
      }
      let pe, ze = 0;
      const Me = K - ue + 1;
      let We = !1, u = 0;
      const y = new Array(Me);
      for (P = 0; P < Me; P++) y[P] = 0;
      for (P = Q; P <= U; P++) {
        const x = d[P];
        if (ze >= Me) {
          nt(x, R, I, !0);
          continue;
        }
        let N;
        if (x.key != null)
          N = Re.get(x.key);
        else
          for (pe = ue; pe <= K; pe++)
            if (y[pe - ue] === 0 && gs(x, v[pe])) {
              N = pe;
              break;
            }
        N === void 0 ? nt(x, R, I, !0) : (y[N - ue] = P + 1, N >= u ? u = N : We = !0, Y(
          x,
          v[N],
          k,
          null,
          R,
          I,
          B,
          D,
          M
        ), ze++);
      }
      const A = We ? df(y) : Qn;
      for (pe = A.length - 1, P = Me - 1; P >= 0; P--) {
        const x = ue + P, N = v[x], G = v[x + 1], te = x + 1 < X ? (
          // #13559, fallback to el placeholder for unresolved async component
          G.el || G.placeholder
        ) : L;
        y[P] === 0 ? Y(
          null,
          N,
          k,
          te,
          R,
          I,
          B,
          D,
          M
        ) : We && (pe < 0 || P !== A[pe] ? ie(N, k, te, 2) : pe--);
      }
    }
  }, ie = (d, v, k, L, R = null) => {
    const { el: I, type: B, transition: D, children: M, shapeFlag: P } = d;
    if (P & 6) {
      ie(d.component.subTree, v, k, L);
      return;
    }
    if (P & 128) {
      d.suspense.move(v, k, L);
      return;
    }
    if (P & 64) {
      B.move(d, v, k, gt);
      return;
    }
    if (B === et) {
      s(I, v, k);
      for (let U = 0; U < M.length; U++)
        ie(M[U], v, k, L);
      s(d.anchor, v, k);
      return;
    }
    if (B === fr) {
      ke(d, v, k);
      return;
    }
    if (L !== 2 && P & 1 && D)
      if (L === 0)
        D.beforeEnter(I), s(I, v, k), Ft(() => D.enter(I), R);
      else {
        const { leave: U, delayLeave: K, afterLeave: Q } = D, ue = () => {
          d.ctx.isUnmounted ? r(I) : s(I, v, k);
        }, Re = () => {
          U(I, () => {
            ue(), Q && Q();
          });
        };
        K ? K(I, ue, Re) : Re();
      }
    else
      s(I, v, k);
  }, nt = (d, v, k, L = !1, R = !1) => {
    const {
      type: I,
      props: B,
      ref: D,
      children: M,
      dynamicChildren: P,
      shapeFlag: X,
      patchFlag: U,
      dirs: K,
      cacheIndex: Q
    } = d;
    if (U === -2 && (R = !1), D != null && (yn(), Ps(D, null, k, d, !0), bn()), Q != null && (v.renderCache[Q] = void 0), X & 256) {
      v.ctx.deactivate(d);
      return;
    }
    const ue = X & 1 && K, Re = !Ns(d);
    let pe;
    if (Re && (pe = B && B.onVnodeBeforeUnmount) && Qt(pe, v, d), X & 6)
      de(d.component, k, L);
    else {
      if (X & 128) {
        d.suspense.unmount(k, L);
        return;
      }
      ue && Dn(d, null, v, "beforeUnmount"), X & 64 ? d.type.remove(
        d,
        v,
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
        v,
        k,
        !1,
        !0
      ) : (I === et && U & 384 || !R && X & 16) && re(M, v, k), L && ve(d);
    }
    (Re && (pe = B && B.onVnodeUnmounted) || ue) && Ft(() => {
      pe && Qt(pe, v, d), ue && Dn(d, null, v, "unmounted");
    }, k);
  }, ve = (d) => {
    const { type: v, el: k, anchor: L, transition: R } = d;
    if (v === et) {
      q(k, L);
      return;
    }
    if (v === fr) {
      z(d);
      return;
    }
    const I = () => {
      r(k), R && !R.persisted && R.afterLeave && R.afterLeave();
    };
    if (d.shapeFlag & 1 && R && !R.persisted) {
      const { leave: B, delayLeave: D } = R, M = () => B(k, I);
      D ? D(d.el, I, M) : M();
    } else
      I();
  }, q = (d, v) => {
    let k;
    for (; d !== v; )
      k = _(d), r(d), d = k;
    r(v);
  }, de = (d, v, k) => {
    const {
      bum: L,
      scope: R,
      job: I,
      subTree: B,
      um: D,
      m: M,
      a: P,
      parent: X,
      slots: { __: U }
    } = d;
    Qo(M), Qo(P), L && cr(L), X && he(U) && U.forEach((K) => {
      X.renderCache[K] = void 0;
    }), R.stop(), I && (I.flags |= 8, nt(B, d, v, k)), D && Ft(D, v), Ft(() => {
      d.isUnmounted = !0;
    }, v), v && v.pendingBranch && !v.isUnmounted && d.asyncDep && !d.asyncResolved && d.suspenseId === v.pendingId && (v.deps--, v.deps === 0 && v.resolve());
  }, re = (d, v, k, L = !1, R = !1, I = 0) => {
    for (let B = I; B < d.length; B++)
      nt(d[B], v, k, L, R);
  }, j = (d) => {
    if (d.shapeFlag & 6)
      return j(d.component.subTree);
    if (d.shapeFlag & 128)
      return d.suspense.next();
    const v = _(d.anchor || d.el), k = v && v[Pu];
    return k ? _(k) : v;
  };
  let He = !1;
  const Ge = (d, v, k) => {
    d == null ? v._vnode && nt(v._vnode, null, null, !0) : Y(
      v._vnode || null,
      d,
      v,
      null,
      null,
      null,
      k
    ), v._vnode = d, He || (He = !0, Ko(), pl(), He = !1);
  }, gt = {
    p: Y,
    um: nt,
    m: ie,
    r: ve,
    mt: Qe,
    mc: Pe,
    pc: le,
    pbc: Ve,
    n: j,
    o: t
  };
  return {
    render: Ge,
    hydrate: void 0,
    createApp: tf(Ge)
  };
}
function si({ type: t, props: e }, n) {
  return n === "svg" && t === "foreignObject" || n === "mathml" && t === "annotation-xml" && e && e.encoding && e.encoding.includes("html") ? void 0 : n;
}
function Bn({ effect: t, job: e }, n) {
  n ? (t.flags |= 32, e.flags |= 4) : (t.flags &= -33, e.flags &= -5);
}
function hf(t, e) {
  return (!t || t && !t.pendingBranch) && e && !e.persisted;
}
function Ll(t, e, n = !1) {
  const s = t.children, r = e.children;
  if (he(s) && he(r))
    for (let i = 0; i < s.length; i++) {
      const o = s[i];
      let a = r[i];
      a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = r[i] = Sn(r[i]), a.el = o.el), !n && a.patchFlag !== -2 && Ll(o, a)), a.type === Ur && (a.el = o.el), a.type === On && !a.el && (a.el = o.el);
    }
}
function df(t) {
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
function Ol(t) {
  const e = t.subTree.component;
  if (e)
    return e.asyncDep && !e.asyncResolved ? e : Ol(e);
}
function Qo(t) {
  if (t)
    for (let e = 0; e < t.length; e++)
      t[e].flags |= 8;
}
const pf = Symbol.for("v-scx"), gf = () => ur(pf);
function mn(t, e, n) {
  return Pl(t, e, n);
}
function Pl(t, e, n = Je) {
  const { immediate: s, deep: r, flush: i, once: o } = n, a = kt({}, n), l = e && s || !e && i !== "post";
  let h;
  if (Hs) {
    if (i === "sync") {
      const F = gf();
      h = F.__watcherHandles || (F.__watcherHandles = []);
    } else if (!l) {
      const F = () => {
      };
      return F.stop = rn, F.resume = rn, F.pause = rn, F;
    }
  }
  const c = St;
  a.call = (F, $, Y) => ln(F, c, $, Y);
  let b = !1;
  i === "post" ? a.scheduler = (F) => {
    Ft(F, c && c.suspense);
  } : i !== "sync" && (b = !0, a.scheduler = (F, $) => {
    $ ? F() : Qi(F);
  }), a.augmentJob = (F) => {
    e && (F.flags |= 4), b && (F.flags |= 2, c && (F.id = c.uid, F.i = c));
  };
  const _ = Cu(t, e, a);
  return Hs && (h ? h.push(_) : l && _()), _;
}
function mf(t, e, n) {
  const s = this.proxy, r = pt(t) ? t.includes(".") ? Nl(s, t) : () => s[t] : t.bind(s, s);
  let i;
  _e(e) ? i = e : (i = e.handler, n = e);
  const o = Vs(this), a = Pl(r, i.bind(s), n);
  return o(), a;
}
function Nl(t, e) {
  const n = e.split(".");
  return () => {
    let s = t;
    for (let r = 0; r < n.length && s; r++)
      s = s[n[r]];
    return s;
  };
}
const _f = (t, e) => e === "modelValue" || e === "model-value" ? t.modelModifiers : t[`${e}Modifiers`] || t[`${In(e)}Modifiers`] || t[`${Nn(e)}Modifiers`];
function vf(t, e, ...n) {
  if (t.isUnmounted) return;
  const s = t.vnode.props || Je;
  let r = n;
  const i = e.startsWith("update:"), o = i && _f(s, e.slice(7));
  o && (o.trim && (r = n.map((c) => pt(c) ? c.trim() : c)), o.number && (r = n.map(yi)));
  let a, l = s[a = Zr(e)] || // also try camelCase event handler (#2249)
  s[a = Zr(In(e))];
  !l && i && (l = s[a = Zr(Nn(e))]), l && ln(
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
    t.emitted[a] = !0, ln(
      h,
      t,
      6,
      r
    );
  }
}
function Fl(t, e, n = !1) {
  const s = e.emitsCache, r = s.get(t);
  if (r !== void 0)
    return r;
  const i = t.emits;
  let o = {}, a = !1;
  if (!_e(t)) {
    const l = (h) => {
      const c = Fl(h, e, !0);
      c && (a = !0, kt(o, c));
    };
    !n && e.mixins.length && e.mixins.forEach(l), t.extends && l(t.extends), t.mixins && t.mixins.forEach(l);
  }
  return !i && !a ? (ot(t) && s.set(t, null), null) : (he(i) ? i.forEach((l) => o[l] = null) : kt(o, i), ot(t) && s.set(t, o), o);
}
function $r(t, e) {
  return !t || !Lr(e) ? !1 : (e = e.slice(2).replace(/Once$/, ""), $e(t, e[0].toLowerCase() + e.slice(1)) || $e(t, Nn(e)) || $e(t, e));
}
function ea(t) {
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
    renderCache: c,
    props: b,
    data: _,
    setupState: F,
    ctx: $,
    inheritAttrs: Y
  } = t, Ce = Ar(t);
  let ne, Ee;
  try {
    if (n.shapeFlag & 4) {
      const z = r || s, W = z;
      ne = sn(
        h.call(
          W,
          z,
          c,
          b,
          F,
          _,
          $
        )
      ), Ee = a;
    } else {
      const z = e;
      ne = sn(
        z.length > 1 ? z(
          b,
          { attrs: a, slots: o, emit: l }
        ) : z(
          b,
          null
        )
      ), Ee = e.props ? a : yf(a);
    }
  } catch (z) {
    Ms.length = 0, Dr(z, t, 1), ne = on(On);
  }
  let ke = ne;
  if (Ee && Y !== !1) {
    const z = Object.keys(Ee), { shapeFlag: W } = ke;
    z.length && W & 7 && (i && z.some(Wi) && (Ee = bf(
      Ee,
      i
    )), ke = rs(ke, Ee, !1, !0));
  }
  return n.dirs && (ke = rs(ke, null, !1, !0), ke.dirs = ke.dirs ? ke.dirs.concat(n.dirs) : n.dirs), n.transition && eo(ke, n.transition), ne = ke, Ar(Ce), ne;
}
const yf = (t) => {
  let e;
  for (const n in t)
    (n === "class" || n === "style" || Lr(n)) && ((e || (e = {}))[n] = t[n]);
  return e;
}, bf = (t, e) => {
  const n = {};
  for (const s in t)
    (!Wi(s) || !(s.slice(9) in e)) && (n[s] = t[s]);
  return n;
};
function wf(t, e, n) {
  const { props: s, children: r, component: i } = t, { props: o, children: a, patchFlag: l } = e, h = i.emitsOptions;
  if (e.dirs || e.transition)
    return !0;
  if (n && l >= 0) {
    if (l & 1024)
      return !0;
    if (l & 16)
      return s ? ta(s, o, h) : !!o;
    if (l & 8) {
      const c = e.dynamicProps;
      for (let b = 0; b < c.length; b++) {
        const _ = c[b];
        if (o[_] !== s[_] && !$r(h, _))
          return !0;
      }
    }
  } else
    return (r || a) && (!a || !a.$stable) ? !0 : s === o ? !1 : s ? o ? ta(s, o, h) : !0 : !!o;
  return !1;
}
function ta(t, e, n) {
  const s = Object.keys(e);
  if (s.length !== Object.keys(t).length)
    return !0;
  for (let r = 0; r < s.length; r++) {
    const i = s[r];
    if (e[i] !== t[i] && !$r(n, i))
      return !0;
  }
  return !1;
}
function kf({ vnode: t, parent: e }, n) {
  for (; e; ) {
    const s = e.subTree;
    if (s.suspense && s.suspense.activeBranch === t && (s.el = t.el), s === t)
      (t = e.vnode).el = n, e = e.parent;
    else
      break;
  }
}
const Ml = (t) => t.__isSuspense;
function xf(t, e) {
  e && e.pendingBranch ? he(t) ? e.effects.push(...t) : e.effects.push(t) : Lu(t);
}
const et = Symbol.for("v-fgt"), Ur = Symbol.for("v-txt"), On = Symbol.for("v-cmt"), fr = Symbol.for("v-stc"), Ms = [];
let Mt = null;
function T(t = !1) {
  Ms.push(Mt = t ? null : []);
}
function Af() {
  Ms.pop(), Mt = Ms[Ms.length - 1] || null;
}
let zs = 1;
function na(t, e = !1) {
  zs += t, t < 0 && Mt && e && (Mt.hasOnce = !0);
}
function Dl(t) {
  return t.dynamicChildren = zs > 0 ? Mt || Qn : null, Af(), zs > 0 && Mt && Mt.push(t), t;
}
function S(t, e, n, s, r, i) {
  return Dl(
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
function Tf(t, e, n, s, r) {
  return Dl(
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
function Bl(t) {
  return t ? t.__v_isVNode === !0 : !1;
}
function gs(t, e) {
  return t.type === e.type && t.key === e.key;
}
const $l = ({ key: t }) => t ?? null, hr = ({
  ref: t,
  ref_key: e,
  ref_for: n
}) => (typeof t == "number" && (t = "" + t), t != null ? pt(t) || wt(t) || _e(t) ? { i: Ut, r: t, k: e, f: !!n } : t : null);
function w(t, e = null, n = null, s = 0, r = null, i = t === et ? 0 : 1, o = !1, a = !1) {
  const l = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: t,
    props: e,
    key: e && $l(e),
    ref: e && hr(e),
    scopeId: ml,
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
  return a ? (ro(l, n), i & 128 && t.normalize(l)) : n && (l.shapeFlag |= pt(n) ? 8 : 16), zs > 0 && // avoid a block node from tracking itself
  !o && // has current parent block
  Mt && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (l.patchFlag > 0 || i & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  l.patchFlag !== 32 && Mt.push(l), l;
}
const on = Sf;
function Sf(t, e = null, n = null, s = 0, r = null, i = !1) {
  if ((!t || t === Ku) && (t = On), Bl(t)) {
    const a = rs(
      t,
      e,
      !0
      /* mergeRef: true */
    );
    return n && ro(a, n), zs > 0 && !i && Mt && (a.shapeFlag & 6 ? Mt[Mt.indexOf(t)] = a : Mt.push(a)), a.patchFlag = -2, a;
  }
  if (Df(t) && (t = t.__vccOpts), e) {
    e = Ef(e);
    let { class: a, style: l } = e;
    a && !pt(a) && (e.class = Ze(a)), ot(l) && (Ji(l) && !he(l) && (l = kt({}, l)), e.style = Se(l));
  }
  const o = pt(t) ? 1 : Ml(t) ? 128 : Nu(t) ? 64 : ot(t) ? 4 : _e(t) ? 2 : 0;
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
function Ef(t) {
  return t ? Ji(t) || Tl(t) ? kt({}, t) : t : null;
}
function rs(t, e, n = !1, s = !1) {
  const { props: r, ref: i, patchFlag: o, children: a, transition: l } = t, h = e ? Cf(r || {}, e) : r, c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: t.type,
    props: h,
    key: h && $l(h),
    ref: e && e.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && i ? he(i) ? i.concat(hr(e)) : [i, hr(e)] : hr(e)
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
    ssContent: t.ssContent && rs(t.ssContent),
    ssFallback: t.ssFallback && rs(t.ssFallback),
    placeholder: t.placeholder,
    el: t.el,
    anchor: t.anchor,
    ctx: t.ctx,
    ce: t.ce
  };
  return l && s && eo(
    c,
    l.clone(c)
  ), c;
}
function en(t = " ", e = 0) {
  return on(Ur, null, t, e);
}
function $n(t, e) {
  const n = on(fr, null, t);
  return n.staticCount = e, n;
}
function oe(t = "", e = !1) {
  return e ? (T(), Tf(On, null, t)) : on(On, null, t);
}
function sn(t) {
  return t == null || typeof t == "boolean" ? on(On) : he(t) ? on(
    et,
    null,
    // #3666, avoid reference pollution when reusing vnode
    t.slice()
  ) : Bl(t) ? Sn(t) : on(Ur, null, String(t));
}
function Sn(t) {
  return t.el === null && t.patchFlag !== -1 || t.memo ? t : rs(t);
}
function ro(t, e) {
  let n = 0;
  const { shapeFlag: s } = t;
  if (e == null)
    e = null;
  else if (he(e))
    n = 16;
  else if (typeof e == "object")
    if (s & 65) {
      const r = e.default;
      r && (r._c && (r._d = !1), ro(t, r()), r._c && (r._d = !0));
      return;
    } else {
      n = 32;
      const r = e._;
      !r && !Tl(e) ? e._ctx = Ut : r === 3 && Ut && (Ut.slots._ === 1 ? e._ = 1 : (e._ = 2, t.patchFlag |= 1024));
    }
  else _e(e) ? (e = { default: e, _ctx: Ut }, n = 32) : (e = String(e), s & 64 ? (n = 16, e = [en(e)]) : n = 8);
  t.children = e, t.shapeFlag |= n;
}
function Cf(...t) {
  const e = {};
  for (let n = 0; n < t.length; n++) {
    const s = t[n];
    for (const r in s)
      if (r === "class")
        e.class !== s.class && (e.class = Ze([e.class, s.class]));
      else if (r === "style")
        e.style = Se([e.style, s.style]);
      else if (Lr(r)) {
        const i = e[r], o = s[r];
        o && i !== o && !(he(i) && i.includes(o)) && (e[r] = i ? [].concat(i, o) : o);
      } else r !== "" && (e[r] = s[r]);
  }
  return e;
}
function Qt(t, e, n, s = null) {
  ln(t, e, 7, [
    n,
    s
  ]);
}
const Rf = kl();
let If = 0;
function Lf(t, e, n) {
  const s = t.type, r = (e ? e.appContext : t.appContext) || Rf, i = {
    uid: If++,
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
    scope: new eu(
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
    propsOptions: El(s, r),
    emitsOptions: Fl(s, r),
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
  return i.ctx = { _: i }, i.root = e ? e.root : i, i.emit = vf.bind(null, i), t.ce && t.ce(i), i;
}
let St = null;
const Of = () => St || Ut;
let Sr, Ri;
{
  const t = Nr(), e = (n, s) => {
    let r;
    return (r = t[n]) || (r = t[n] = []), r.push(s), (i) => {
      r.length > 1 ? r.forEach((o) => o(i)) : r[0](i);
    };
  };
  Sr = e(
    "__VUE_INSTANCE_SETTERS__",
    (n) => St = n
  ), Ri = e(
    "__VUE_SSR_SETTERS__",
    (n) => Hs = n
  );
}
const Vs = (t) => {
  const e = St;
  return Sr(t), t.scope.on(), () => {
    t.scope.off(), Sr(e);
  };
}, sa = () => {
  St && St.scope.off(), Sr(null);
};
function Ul(t) {
  return t.vnode.shapeFlag & 4;
}
let Hs = !1;
function Pf(t, e = !1, n = !1) {
  e && Ri(e);
  const { props: s, children: r } = t.vnode, i = Ul(t);
  sf(t, s, i, e), lf(t, r, n || e);
  const o = i ? Nf(t, e) : void 0;
  return e && Ri(!1), o;
}
function Nf(t, e) {
  const n = t.type;
  t.accessCache = /* @__PURE__ */ Object.create(null), t.proxy = new Proxy(t.ctx, Gu);
  const { setup: s } = n;
  if (s) {
    yn();
    const r = t.setupContext = s.length > 1 ? Mf(t) : null, i = Vs(t), o = qs(
      s,
      t,
      0,
      [
        t.props,
        r
      ]
    ), a = Wa(o);
    if (bn(), i(), (a || t.sp) && !Ns(t) && _l(t), a) {
      if (o.then(sa, sa), e)
        return o.then((l) => {
          ra(t, l);
        }).catch((l) => {
          Dr(l, t, 0);
        });
      t.asyncDep = o;
    } else
      ra(t, o);
  } else
    zl(t);
}
function ra(t, e, n) {
  _e(e) ? t.type.__ssrInlineRender ? t.ssrRender = e : t.render = e : ot(e) && (t.setupState = fl(e)), zl(t);
}
function zl(t, e, n) {
  const s = t.type;
  t.render || (t.render = s.render || rn);
  {
    const r = Vs(t);
    yn();
    try {
      Yu(t);
    } finally {
      bn(), r();
    }
  }
}
const Ff = {
  get(t, e) {
    return bt(t, "get", ""), t[e];
  }
};
function Mf(t) {
  const e = (n) => {
    t.exposed = n || {};
  };
  return {
    attrs: new Proxy(t.attrs, Ff),
    slots: t.slots,
    emit: t.emit,
    expose: e
  };
}
function zr(t) {
  return t.exposed ? t.exposeProxy || (t.exposeProxy = new Proxy(fl(wu(t.exposed)), {
    get(e, n) {
      if (n in e)
        return e[n];
      if (n in Fs)
        return Fs[n](t);
    },
    has(e, n) {
      return n in e || n in Fs;
    }
  })) : t.proxy;
}
function Df(t) {
  return _e(t) && "__vccOpts" in t;
}
const Ie = (t, e) => Su(t, e, Hs), Bf = "3.5.18";
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
      createHTML: (t) => t
    });
  } catch {
  }
const Hl = Ii ? (t) => Ii.createHTML(t) : (t) => t, $f = "http://www.w3.org/2000/svg", Uf = "http://www.w3.org/1998/Math/MathML", dn = typeof document < "u" ? document : null, oa = dn && /* @__PURE__ */ dn.createElement("template"), zf = {
  insert: (t, e, n) => {
    e.insertBefore(t, n || null);
  },
  remove: (t) => {
    const e = t.parentNode;
    e && e.removeChild(t);
  },
  createElement: (t, e, n, s) => {
    const r = e === "svg" ? dn.createElementNS($f, t) : e === "mathml" ? dn.createElementNS(Uf, t) : n ? dn.createElement(t, { is: n }) : dn.createElement(t);
    return t === "select" && s && s.multiple != null && r.setAttribute("multiple", s.multiple), r;
  },
  createText: (t) => dn.createTextNode(t),
  createComment: (t) => dn.createComment(t),
  setText: (t, e) => {
    t.nodeValue = e;
  },
  setElementText: (t, e) => {
    t.textContent = e;
  },
  parentNode: (t) => t.parentNode,
  nextSibling: (t) => t.nextSibling,
  querySelector: (t) => dn.querySelector(t),
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
      oa.innerHTML = Hl(
        s === "svg" ? `<svg>${t}</svg>` : s === "mathml" ? `<math>${t}</math>` : t
      );
      const a = oa.content;
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
}, Hf = Symbol("_vtc");
function Wf(t, e, n) {
  const s = t[Hf];
  s && (e = (e ? [e, ...s] : [...s]).join(" ")), e == null ? t.removeAttribute("class") : n ? t.setAttribute("class", e) : t.className = e;
}
const Er = Symbol("_vod"), Wl = Symbol("_vsh"), qf = {
  beforeMount(t, { value: e }, { transition: n }) {
    t[Er] = t.style.display === "none" ? "" : t.style.display, n && e ? n.beforeEnter(t) : ms(t, e);
  },
  mounted(t, { value: e }, { transition: n }) {
    n && e && n.enter(t);
  },
  updated(t, { value: e, oldValue: n }, { transition: s }) {
    !e != !n && (s ? e ? (s.beforeEnter(t), ms(t, !0), s.enter(t)) : s.leave(t, () => {
      ms(t, !1);
    }) : ms(t, e));
  },
  beforeUnmount(t, { value: e }) {
    ms(t, e);
  }
};
function ms(t, e) {
  t.style.display = e ? t[Er] : "none", t[Wl] = !e;
}
const jf = Symbol(""), Vf = /(^|;)\s*display\s*:/;
function Kf(t, e, n) {
  const s = t.style, r = pt(n);
  let i = !1;
  if (n && !r) {
    if (e)
      if (pt(e))
        for (const o of e.split(";")) {
          const a = o.slice(0, o.indexOf(":")).trim();
          n[a] == null && dr(s, a, "");
        }
      else
        for (const o in e)
          n[o] == null && dr(s, o, "");
    for (const o in n)
      o === "display" && (i = !0), dr(s, o, n[o]);
  } else if (r) {
    if (e !== n) {
      const o = s[jf];
      o && (n += ";" + o), s.cssText = n, i = Vf.test(n);
    }
  } else e && t.removeAttribute("style");
  Er in t && (t[Er] = i ? s.display : "", t[Wl] && (s.display = "none"));
}
const aa = /\s*!important$/;
function dr(t, e, n) {
  if (he(n))
    n.forEach((s) => dr(t, e, s));
  else if (n == null && (n = ""), e.startsWith("--"))
    t.setProperty(e, n);
  else {
    const s = Gf(t, e);
    aa.test(n) ? t.setProperty(
      Nn(s),
      n.replace(aa, ""),
      "important"
    ) : t[s] = n;
  }
}
const la = ["Webkit", "Moz", "ms"], ri = {};
function Gf(t, e) {
  const n = ri[e];
  if (n)
    return n;
  let s = In(e);
  if (s !== "filter" && s in t)
    return ri[e] = s;
  s = Va(s);
  for (let r = 0; r < la.length; r++) {
    const i = la[r] + s;
    if (i in t)
      return ri[e] = i;
  }
  return e;
}
const ca = "http://www.w3.org/1999/xlink";
function ua(t, e, n, s, r, i = Qc(e)) {
  s && e.startsWith("xlink:") ? n == null ? t.removeAttributeNS(ca, e.slice(6, e.length)) : t.setAttributeNS(ca, e, n) : n == null || i && !Ka(n) ? t.removeAttribute(e) : t.setAttribute(
    e,
    i ? "" : Pn(n) ? String(n) : n
  );
}
function fa(t, e, n, s, r) {
  if (e === "innerHTML" || e === "textContent") {
    n != null && (t[e] = e === "innerHTML" ? Hl(n) : n);
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
    a === "boolean" ? n = Ka(n) : n == null && a === "string" ? (n = "", o = !0) : a === "number" && (n = 0, o = !0);
  }
  try {
    t[e] = n;
  } catch {
  }
  o && t.removeAttribute(r || e);
}
function Jn(t, e, n, s) {
  t.addEventListener(e, n, s);
}
function Yf(t, e, n, s) {
  t.removeEventListener(e, n, s);
}
const ha = Symbol("_vei");
function Xf(t, e, n, s, r = null) {
  const i = t[ha] || (t[ha] = {}), o = i[e];
  if (s && o)
    o.value = s;
  else {
    const [a, l] = Zf(e);
    if (s) {
      const h = i[e] = eh(
        s,
        r
      );
      Jn(t, a, h, l);
    } else o && (Yf(t, a, o, l), i[e] = void 0);
  }
}
const da = /(?:Once|Passive|Capture)$/;
function Zf(t) {
  let e;
  if (da.test(t)) {
    e = {};
    let s;
    for (; s = t.match(da); )
      t = t.slice(0, t.length - s[0].length), e[s[0].toLowerCase()] = !0;
  }
  return [t[2] === ":" ? t.slice(3) : Nn(t.slice(2)), e];
}
let ii = 0;
const Jf = /* @__PURE__ */ Promise.resolve(), Qf = () => ii || (Jf.then(() => ii = 0), ii = Date.now());
function eh(t, e) {
  const n = (s) => {
    if (!s._vts)
      s._vts = Date.now();
    else if (s._vts <= n.attached)
      return;
    ln(
      th(s, n.value),
      e,
      5,
      [s]
    );
  };
  return n.value = t, n.attached = Qf(), n;
}
function th(t, e) {
  if (he(e)) {
    const n = t.stopImmediatePropagation;
    return t.stopImmediatePropagation = () => {
      n.call(t), t._stopped = !0;
    }, e.map(
      (s) => (r) => !r._stopped && s && s(r)
    );
  } else
    return e;
}
const pa = (t) => t.charCodeAt(0) === 111 && t.charCodeAt(1) === 110 && // lowercase letter
t.charCodeAt(2) > 96 && t.charCodeAt(2) < 123, nh = (t, e, n, s, r, i) => {
  const o = r === "svg";
  e === "class" ? Wf(t, s, o) : e === "style" ? Kf(t, n, s) : Lr(e) ? Wi(e) || Xf(t, e, n, s, i) : (e[0] === "." ? (e = e.slice(1), !0) : e[0] === "^" ? (e = e.slice(1), !1) : sh(t, e, s, o)) ? (fa(t, e, s), !t.tagName.includes("-") && (e === "value" || e === "checked" || e === "selected") && ua(t, e, s, o, i, e !== "value")) : /* #11081 force set props for possible async custom element */ t._isVueCE && (/[A-Z]/.test(e) || !pt(s)) ? fa(t, In(e), s, i, e) : (e === "true-value" ? t._trueValue = s : e === "false-value" && (t._falseValue = s), ua(t, e, s, o));
};
function sh(t, e, n, s) {
  if (s)
    return !!(e === "innerHTML" || e === "textContent" || e in t && pa(e) && _e(n));
  if (e === "spellcheck" || e === "draggable" || e === "translate" || e === "autocorrect" || e === "form" || e === "list" && t.tagName === "INPUT" || e === "type" && t.tagName === "TEXTAREA")
    return !1;
  if (e === "width" || e === "height") {
    const r = t.tagName;
    if (r === "IMG" || r === "VIDEO" || r === "CANVAS" || r === "SOURCE")
      return !1;
  }
  return pa(e) && pt(n) ? !1 : e in t;
}
const ga = (t) => {
  const e = t.props["onUpdate:modelValue"] || !1;
  return he(e) ? (n) => cr(e, n) : e;
};
function rh(t) {
  t.target.composing = !0;
}
function ma(t) {
  const e = t.target;
  e.composing && (e.composing = !1, e.dispatchEvent(new Event("input")));
}
const oi = Symbol("_assign"), Un = {
  created(t, { modifiers: { lazy: e, trim: n, number: s } }, r) {
    t[oi] = ga(r);
    const i = s || r.props && r.props.type === "number";
    Jn(t, e ? "change" : "input", (o) => {
      if (o.target.composing) return;
      let a = t.value;
      n && (a = a.trim()), i && (a = yi(a)), t[oi](a);
    }), n && Jn(t, "change", () => {
      t.value = t.value.trim();
    }), e || (Jn(t, "compositionstart", rh), Jn(t, "compositionend", ma), Jn(t, "change", ma));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(t, { value: e }) {
    t.value = e ?? "";
  },
  beforeUpdate(t, { value: e, oldValue: n, modifiers: { lazy: s, trim: r, number: i } }, o) {
    if (t[oi] = ga(o), t.composing) return;
    const a = (i || t.type === "number") && !/^0\d/.test(t.value) ? yi(t.value) : t.value, l = e ?? "";
    a !== l && (document.activeElement === t && t.type !== "range" && (s && e === n || r && t.value.trim() === l) || (t.value = l));
  }
}, ih = ["ctrl", "shift", "alt", "meta"], oh = {
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
  exact: (t, e) => ih.some((n) => t[`${n}Key`] && !e.includes(n))
}, Xn = (t, e) => {
  const n = t._withMods || (t._withMods = {}), s = e.join(".");
  return n[s] || (n[s] = (r, ...i) => {
    for (let o = 0; o < e.length; o++) {
      const a = oh[e[o]];
      if (a && a(r, e)) return;
    }
    return t(r, ...i);
  });
}, ah = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, ai = (t, e) => {
  const n = t._withKeys || (t._withKeys = {}), s = e.join(".");
  return n[s] || (n[s] = (r) => {
    if (!("key" in r))
      return;
    const i = Nn(r.key);
    if (e.some(
      (o) => o === i || ah[o] === i
    ))
      return t(r);
  });
}, lh = /* @__PURE__ */ kt({ patchProp: nh }, zf);
let _a;
function ch() {
  return _a || (_a = uf(lh));
}
const uh = (...t) => {
  const e = ch().createApp(...t), { mount: n } = e;
  return e.mount = (s) => {
    const r = hh(s);
    if (!r) return;
    const i = e._component;
    !_e(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
    const o = n(r, !1, fh(r));
    return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), o;
  }, e;
};
function fh(t) {
  if (t instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && t instanceof MathMLElement)
    return "mathml";
}
function hh(t) {
  return pt(t) ? document.querySelector(t) : t;
}
const Ws = (t) => {
  const e = t.replace("#", ""), n = parseInt(e.substr(0, 2), 16), s = parseInt(e.substr(2, 2), 16), r = parseInt(e.substr(4, 2), 16);
  return (n * 299 + s * 587 + r * 114) / 1e3 < 128;
}, dh = (t, e) => {
  const n = t.replace("#", ""), s = parseInt(n.substr(0, 2), 16), r = parseInt(n.substr(2, 2), 16), i = parseInt(n.substr(4, 2), 16), o = Ws(t), a = o ? Math.min(255, s + e) : Math.max(0, s - e), l = o ? Math.min(255, r + e) : Math.max(0, r - e), h = o ? Math.min(255, i + e) : Math.max(0, i - e);
  return `#${a.toString(16).padStart(2, "0")}${l.toString(16).padStart(2, "0")}${h.toString(16).padStart(2, "0")}`;
}, _s = (t) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t), ph = (t) => {
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
var qn = io();
function ql(t) {
  qn = t;
}
var Ds = { exec: () => null };
function Ue(t, e = "") {
  let n = typeof t == "string" ? t : t.source;
  const s = {
    replace: (r, i) => {
      let o = typeof i == "string" ? i : i.source;
      return o = o.replace(Et.caret, "$1"), n = n.replace(r, o), s;
    },
    getRegex: () => new RegExp(n, e)
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
  listItemRegex: (t) => new RegExp(`^( {0,3}${t})((?:[	 ][^\\n]*)?(?:\\n|$))`),
  nextBulletRegex: (t) => new RegExp(`^ {0,${Math.min(3, t - 1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),
  hrRegex: (t) => new RegExp(`^ {0,${Math.min(3, t - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),
  fencesBeginRegex: (t) => new RegExp(`^ {0,${Math.min(3, t - 1)}}(?:\`\`\`|~~~)`),
  headingBeginRegex: (t) => new RegExp(`^ {0,${Math.min(3, t - 1)}}#`),
  htmlBeginRegex: (t) => new RegExp(`^ {0,${Math.min(3, t - 1)}}<(?:[a-z].*>|!--)`, "i")
}, gh = /^(?:[ \t]*(?:\n|$))+/, mh = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/, _h = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, Ks = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, vh = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, oo = /(?:[*+-]|\d{1,9}[.)])/, jl = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/, Vl = Ue(jl).replace(/bull/g, oo).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(), yh = Ue(jl).replace(/bull/g, oo).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(), ao = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/, bh = /^[^\n]+/, lo = /(?!\s*\])(?:\\.|[^\[\]\\])+/, wh = Ue(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", lo).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), kh = Ue(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, oo).getRegex(), Hr = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", co = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, xh = Ue(
  "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))",
  "i"
).replace("comment", co).replace("tag", Hr).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), Kl = Ue(ao).replace("hr", Ks).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Hr).getRegex(), Ah = Ue(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", Kl).getRegex(), uo = {
  blockquote: Ah,
  code: mh,
  def: wh,
  fences: _h,
  heading: vh,
  hr: Ks,
  html: xh,
  lheading: Vl,
  list: kh,
  newline: gh,
  paragraph: Kl,
  table: Ds,
  text: bh
}, va = Ue(
  "^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"
).replace("hr", Ks).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Hr).getRegex(), Th = {
  ...uo,
  lheading: yh,
  table: va,
  paragraph: Ue(ao).replace("hr", Ks).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", va).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Hr).getRegex()
}, Sh = {
  ...uo,
  html: Ue(
    `^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`
  ).replace("comment", co).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
  heading: /^(#{1,6})(.*)(?:\n+|$)/,
  fences: Ds,
  // fences not supported
  lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  paragraph: Ue(ao).replace("hr", Ks).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", Vl).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
}, Eh = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, Ch = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, Gl = /^( {2,}|\\)\n(?!\s*$)/, Rh = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, Wr = /[\p{P}\p{S}]/u, fo = /[\s\p{P}\p{S}]/u, Yl = /[^\s\p{P}\p{S}]/u, Ih = Ue(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, fo).getRegex(), Xl = /(?!~)[\p{P}\p{S}]/u, Lh = /(?!~)[\s\p{P}\p{S}]/u, Oh = /(?:[^\s\p{P}\p{S}]|~)/u, Ph = /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g, Zl = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/, Nh = Ue(Zl, "u").replace(/punct/g, Wr).getRegex(), Fh = Ue(Zl, "u").replace(/punct/g, Xl).getRegex(), Jl = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", Mh = Ue(Jl, "gu").replace(/notPunctSpace/g, Yl).replace(/punctSpace/g, fo).replace(/punct/g, Wr).getRegex(), Dh = Ue(Jl, "gu").replace(/notPunctSpace/g, Oh).replace(/punctSpace/g, Lh).replace(/punct/g, Xl).getRegex(), Bh = Ue(
  "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)",
  "gu"
).replace(/notPunctSpace/g, Yl).replace(/punctSpace/g, fo).replace(/punct/g, Wr).getRegex(), $h = Ue(/\\(punct)/, "gu").replace(/punct/g, Wr).getRegex(), Uh = Ue(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), zh = Ue(co).replace("(?:-->|$)", "-->").getRegex(), Hh = Ue(
  "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>"
).replace("comment", zh).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), Cr = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/, Wh = Ue(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", Cr).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), Ql = Ue(/^!?\[(label)\]\[(ref)\]/).replace("label", Cr).replace("ref", lo).getRegex(), ec = Ue(/^!?\[(ref)\](?:\[\])?/).replace("ref", lo).getRegex(), qh = Ue("reflink|nolink(?!\\()", "g").replace("reflink", Ql).replace("nolink", ec).getRegex(), ho = {
  _backpedal: Ds,
  // only used for GFM url
  anyPunctuation: $h,
  autolink: Uh,
  blockSkip: Ph,
  br: Gl,
  code: Ch,
  del: Ds,
  emStrongLDelim: Nh,
  emStrongRDelimAst: Mh,
  emStrongRDelimUnd: Bh,
  escape: Eh,
  link: Wh,
  nolink: ec,
  punctuation: Ih,
  reflink: Ql,
  reflinkSearch: qh,
  tag: Hh,
  text: Rh,
  url: Ds
}, jh = {
  ...ho,
  link: Ue(/^!?\[(label)\]\((.*?)\)/).replace("label", Cr).getRegex(),
  reflink: Ue(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", Cr).getRegex()
}, Li = {
  ...ho,
  emStrongRDelimAst: Dh,
  emStrongLDelim: Fh,
  url: Ue(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, "i").replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
  _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
}, Vh = {
  ...Li,
  br: Ue(Gl).replace("{2,}", "*").getRegex(),
  text: Ue(Li.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
}, rr = {
  normal: uo,
  gfm: Th,
  pedantic: Sh
}, vs = {
  normal: ho,
  gfm: Li,
  breaks: Vh,
  pedantic: jh
}, Kh = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}, ya = (t) => Kh[t];
function tn(t, e) {
  if (e) {
    if (Et.escapeTest.test(t))
      return t.replace(Et.escapeReplace, ya);
  } else if (Et.escapeTestNoEncode.test(t))
    return t.replace(Et.escapeReplaceNoEncode, ya);
  return t;
}
function ba(t) {
  try {
    t = encodeURI(t).replace(Et.percentDecode, "%");
  } catch {
    return null;
  }
  return t;
}
function wa(t, e) {
  var i;
  const n = t.replace(Et.findPipe, (o, a, l) => {
    let h = !1, c = a;
    for (; --c >= 0 && l[c] === "\\"; ) h = !h;
    return h ? "|" : " |";
  }), s = n.split(Et.splitPipe);
  let r = 0;
  if (s[0].trim() || s.shift(), s.length > 0 && !((i = s.at(-1)) != null && i.trim()) && s.pop(), e)
    if (s.length > e)
      s.splice(e);
    else
      for (; s.length < e; ) s.push("");
  for (; r < s.length; r++)
    s[r] = s[r].trim().replace(Et.slashPipe, "|");
  return s;
}
function ys(t, e, n) {
  const s = t.length;
  if (s === 0)
    return "";
  let r = 0;
  for (; r < s && t.charAt(s - r - 1) === e; )
    r++;
  return t.slice(0, s - r);
}
function Gh(t, e) {
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
function ka(t, e, n, s, r) {
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
function Yh(t, e, n) {
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
var Rr = class {
  // set by the lexer
  constructor(t) {
    Xe(this, "options");
    Xe(this, "rules");
    // set by the lexer
    Xe(this, "lexer");
    this.options = t || qn;
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
        text: this.options.pedantic ? n : ys(n, `
`)
      };
    }
  }
  fences(t) {
    const e = this.rules.block.fences.exec(t);
    if (e) {
      const n = e[0], s = Yh(n, e[3] || "", this.rules);
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
        const s = ys(n, "#");
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
        raw: ys(e[0], `
`)
      };
  }
  blockquote(t) {
    const e = this.rules.block.blockquote.exec(t);
    if (e) {
      let n = ys(e[0], `
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
        const b = this.lexer.state.top;
        if (this.lexer.state.top = !0, this.lexer.blockTokens(c, i, !0), this.lexer.state.top = b, n.length === 0)
          break;
        const _ = i.at(-1);
        if ((_ == null ? void 0 : _.type) === "code")
          break;
        if ((_ == null ? void 0 : _.type) === "blockquote") {
          const F = _, $ = F.raw + `
` + n.join(`
`), Y = this.blockquote($);
          i[i.length - 1] = Y, s = s.substring(0, s.length - F.raw.length) + Y.raw, r = r.substring(0, r.length - F.text.length) + Y.text;
          break;
        } else if ((_ == null ? void 0 : _.type) === "list") {
          const F = _, $ = F.raw + `
` + n.join(`
`), Y = this.list($);
          i[i.length - 1] = Y, s = s.substring(0, s.length - _.raw.length) + Y.raw, r = r.substring(0, r.length - F.raw.length) + Y.raw, n = $.substring(i.at(-1).raw.length).split(`
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
        let l = !1, h = "", c = "";
        if (!(e = i.exec(t)) || this.rules.block.hr.test(t))
          break;
        h = e[0], t = t.substring(h.length);
        let b = e[2].split(`
`, 1)[0].replace(this.rules.other.listReplaceTabs, (ne) => " ".repeat(3 * ne.length)), _ = t.split(`
`, 1)[0], F = !b.trim(), $ = 0;
        if (this.options.pedantic ? ($ = 2, c = b.trimStart()) : F ? $ = e[1].length + 1 : ($ = e[2].search(this.rules.other.nonSpaceChar), $ = $ > 4 ? 1 : $, c = b.slice($), $ += e[1].length), F && this.rules.other.blankLine.test(_) && (h += _ + `
`, t = t.substring(_.length + 1), l = !0), !l) {
          const ne = this.rules.other.nextBulletRegex($), Ee = this.rules.other.hrRegex($), ke = this.rules.other.fencesBeginRegex($), z = this.rules.other.headingBeginRegex($), W = this.rules.other.htmlBeginRegex($);
          for (; t; ) {
            const ee = t.split(`
`, 1)[0];
            let V;
            if (_ = ee, this.options.pedantic ? (_ = _.replace(this.rules.other.listReplaceNesting, "  "), V = _) : V = _.replace(this.rules.other.tabCharGlobal, "    "), ke.test(_) || z.test(_) || W.test(_) || ne.test(_) || Ee.test(_))
              break;
            if (V.search(this.rules.other.nonSpaceChar) >= $ || !_.trim())
              c += `
` + V.slice($);
            else {
              if (F || b.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || ke.test(b) || z.test(b) || Ee.test(b))
                break;
              c += `
` + _;
            }
            !F && !_.trim() && (F = !0), h += ee + `
`, t = t.substring(ee.length + 1), b = V.slice($);
          }
        }
        r.loose || (o ? r.loose = !0 : this.rules.other.doubleBlankLine.test(h) && (o = !0));
        let Y = null, Ce;
        this.options.gfm && (Y = this.rules.other.listIsTask.exec(c), Y && (Ce = Y[0] !== "[ ] ", c = c.replace(this.rules.other.listReplaceTask, ""))), r.items.push({
          type: "list_item",
          raw: h,
          task: !!Y,
          checked: Ce,
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
          const h = r.items[l].tokens.filter((b) => b.type === "space"), c = h.length > 0 && h.some((b) => this.rules.other.anyLine.test(b.raw));
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
    const n = wa(e[1]), s = e[2].replace(this.rules.other.tableAlignChars, "").split("|"), r = (o = e[3]) != null && o.trim() ? e[3].replace(this.rules.other.tableRowBlankLine, "").split(`
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
        i.rows.push(wa(a, i.header.length).map((l, h) => ({
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
        const i = ys(n.slice(0, -1), "\\");
        if ((n.length - i.length) % 2 === 0)
          return;
      } else {
        const i = Gh(e[2], "()");
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
      return s = s.trim(), this.rules.other.startAngleBracket.test(s) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n) ? s = s.slice(1) : s = s.slice(1, -1)), ka(e, {
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
      return ka(n, r, n[0], this.lexer, this.rules);
    }
  }
  emStrong(t, e, n = "") {
    let s = this.rules.inline.emStrongLDelim.exec(t);
    if (!s || s[3] && n.match(this.rules.other.unicodeAlphaNumeric)) return;
    if (!(s[1] || s[2] || "") || !n || this.rules.inline.punctuation.exec(n)) {
      const i = [...s[0]].length - 1;
      let o, a, l = i, h = 0;
      const c = s[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      for (c.lastIndex = 0, e = e.slice(-1 * t.length + i); (s = c.exec(e)) != null; ) {
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
        const b = [...s[0]][0].length, _ = t.slice(0, i + s.index + b + a);
        if (Math.min(i, a) % 2) {
          const $ = _.slice(1, -1);
          return {
            type: "em",
            raw: _,
            text: $,
            tokens: this.lexer.inlineTokens($)
          };
        }
        const F = _.slice(2, -2);
        return {
          type: "strong",
          raw: _,
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
}, _n = class Oi {
  constructor(e) {
    Xe(this, "tokens");
    Xe(this, "options");
    Xe(this, "state");
    Xe(this, "tokenizer");
    Xe(this, "inlineQueue");
    this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = e || qn, this.options.tokenizer = this.options.tokenizer || new Rr(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = {
      inLink: !1,
      inRawBlock: !1,
      top: !0
    };
    const n = {
      other: Et,
      block: rr.normal,
      inline: vs.normal
    };
    this.options.pedantic ? (n.block = rr.pedantic, n.inline = vs.pedantic) : this.options.gfm && (n.block = rr.gfm, this.options.breaks ? n.inline = vs.breaks : n.inline = vs.gfm), this.tokenizer.rules = n;
  }
  /**
   * Expose Rules
   */
  static get rules() {
    return {
      block: rr,
      inline: vs
    };
  }
  /**
   * Static Lex Method
   */
  static lex(e, n) {
    return new Oi(n).lex(e);
  }
  /**
   * Static Lex Inline Method
   */
  static lexInline(e, n) {
    return new Oi(n).inlineTokens(e);
  }
  /**
   * Preprocessing
   */
  lex(e) {
    e = e.replace(Et.carriageReturn, `
`), this.blockTokens(e, this.tokens);
    for (let n = 0; n < this.inlineQueue.length; n++) {
      const s = this.inlineQueue[n];
      this.inlineTokens(s.src, s.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(e, n = [], s = !1) {
    var r, i, o;
    for (this.options.pedantic && (e = e.replace(Et.tabCharGlobal, "    ").replace(Et.spaceLine, "")); e; ) {
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
        const c = e.slice(1);
        let b;
        this.options.extensions.startBlock.forEach((_) => {
          b = _.call({ lexer: this }, c), typeof b == "number" && b >= 0 && (h = Math.min(h, b));
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
      if ((l = (a = this.options.extensions) == null ? void 0 : a.inline) != null && l.some((_) => (c = _.call({ lexer: this }, e, n)) ? (e = e.substring(c.raw.length), n.push(c), !0) : !1))
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
        const _ = n.at(-1);
        c.type === "text" && (_ == null ? void 0 : _.type) === "text" ? (_.raw += c.raw, _.text += c.text) : n.push(c);
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
      if ((h = this.options.extensions) != null && h.startInline) {
        let _ = 1 / 0;
        const F = e.slice(1);
        let $;
        this.options.extensions.startInline.forEach((Y) => {
          $ = Y.call({ lexer: this }, F), typeof $ == "number" && $ >= 0 && (_ = Math.min(_, $));
        }), _ < 1 / 0 && _ >= 0 && (b = e.substring(0, _ + 1));
      }
      if (c = this.tokenizer.inlineText(b)) {
        e = e.substring(c.raw.length), c.raw.slice(-1) !== "_" && (o = c.raw.slice(-1)), i = !0;
        const _ = n.at(-1);
        (_ == null ? void 0 : _.type) === "text" ? (_.raw += c.raw, _.text += c.text) : n.push(c);
        continue;
      }
      if (e) {
        const _ = "Infinite loop on byte: " + e.charCodeAt(0);
        if (this.options.silent) {
          console.error(_);
          break;
        } else
          throw new Error(_);
      }
    }
    return n;
  }
}, Ir = class {
  // set by the parser
  constructor(t) {
    Xe(this, "options");
    Xe(this, "parser");
    this.options = t || qn;
  }
  space(t) {
    return "";
  }
  code({ text: t, lang: e, escaped: n }) {
    var i;
    const s = (i = (e || "").match(Et.notSpaceStart)) == null ? void 0 : i[0], r = t.replace(Et.endingNewline, "") + `
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
    const s = this.parser.parseInline(n), r = ba(t);
    if (r === null)
      return s;
    t = r;
    let i = '<a href="' + t + '"';
    return e && (i += ' title="' + tn(e) + '"'), i += ">" + s + "</a>", i;
  }
  image({ href: t, title: e, text: n, tokens: s }) {
    s && (n = this.parser.parseInline(s, this.parser.textRenderer));
    const r = ba(t);
    if (r === null)
      return tn(n);
    t = r;
    let i = `<img src="${t}" alt="${n}"`;
    return e && (i += ` title="${tn(e)}"`), i += ">", i;
  }
  text(t) {
    return "tokens" in t && t.tokens ? this.parser.parseInline(t.tokens) : "escaped" in t && t.escaped ? t.text : tn(t.text);
  }
}, po = class {
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
}, vn = class Pi {
  constructor(e) {
    Xe(this, "options");
    Xe(this, "renderer");
    Xe(this, "textRenderer");
    this.options = e || qn, this.options.renderer = this.options.renderer || new Ir(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new po();
  }
  /**
   * Static Parse Method
   */
  static parse(e, n) {
    return new Pi(n).parse(e);
  }
  /**
   * Static Parse Inline Method
   */
  static parseInline(e, n) {
    return new Pi(n).parseInline(e);
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
          for (; o + 1 < e.length && e[o + 1].type === "text"; )
            h = e[++o], c += `
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
}, _i, pr = (_i = class {
  constructor(t) {
    Xe(this, "options");
    Xe(this, "block");
    this.options = t || qn;
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
    return this.block ? vn.parse : vn.parseInline;
  }
}, Xe(_i, "passThroughHooks", /* @__PURE__ */ new Set([
  "preprocess",
  "postprocess",
  "processAllTokens"
])), _i), Xh = class {
  constructor(...t) {
    Xe(this, "defaults", io());
    Xe(this, "options", this.setOptions);
    Xe(this, "parse", this.parseMarkdown(!0));
    Xe(this, "parseInline", this.parseMarkdown(!1));
    Xe(this, "Parser", vn);
    Xe(this, "Renderer", Ir);
    Xe(this, "TextRenderer", po);
    Xe(this, "Lexer", _n);
    Xe(this, "Tokenizer", Rr);
    Xe(this, "Hooks", pr);
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
        const r = this.defaults.renderer || new Ir(this.defaults);
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
        const r = this.defaults.tokenizer || new Rr(this.defaults);
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
        const r = this.defaults.hooks || new pr();
        for (const i in n.hooks) {
          if (!(i in r))
            throw new Error(`hook '${i}' does not exist`);
          if (["options", "block"].includes(i))
            continue;
          const o = i, a = n.hooks[o], l = r[o];
          pr.passThroughHooks.has(i) ? r[o] = (h) => {
            if (this.defaults.async)
              return Promise.resolve(a.call(r, h)).then((b) => l.call(r, b));
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
  setOptions(t) {
    return this.defaults = { ...this.defaults, ...t }, this;
  }
  lexer(t, e) {
    return _n.lex(t, e ?? this.defaults);
  }
  parser(t, e) {
    return vn.parse(t, e ?? this.defaults);
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
      const a = i.hooks ? i.hooks.provideLexer() : t ? _n.lex : _n.lexInline, l = i.hooks ? i.hooks.provideParser() : t ? vn.parse : vn.parseInline;
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
}, Wn = new Xh();
function Oe(t, e) {
  return Wn.parse(t, e);
}
Oe.options = Oe.setOptions = function(t) {
  return Wn.setOptions(t), Oe.defaults = Wn.defaults, ql(Oe.defaults), Oe;
};
Oe.getDefaults = io;
Oe.defaults = qn;
Oe.use = function(...t) {
  return Wn.use(...t), Oe.defaults = Wn.defaults, ql(Oe.defaults), Oe;
};
Oe.walkTokens = function(t, e) {
  return Wn.walkTokens(t, e);
};
Oe.parseInline = Wn.parseInline;
Oe.Parser = vn;
Oe.parser = vn.parse;
Oe.Renderer = Ir;
Oe.TextRenderer = po;
Oe.Lexer = _n;
Oe.lexer = _n.lex;
Oe.Tokenizer = Rr;
Oe.Hooks = pr;
Oe.parse = Oe;
Oe.options;
Oe.setOptions;
Oe.use;
Oe.walkTokens;
Oe.parseInline;
vn.parse;
_n.lex;
/*! @license DOMPurify 3.2.6 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.2.6/LICENSE */
const {
  entries: tc,
  setPrototypeOf: xa,
  isFrozen: Zh,
  getPrototypeOf: Jh,
  getOwnPropertyDescriptor: Qh
} = Object;
let {
  freeze: Ct,
  seal: Ht,
  create: nc
} = Object, {
  apply: Ni,
  construct: Fi
} = typeof Reflect < "u" && Reflect;
Ct || (Ct = function(e) {
  return e;
});
Ht || (Ht = function(e) {
  return e;
});
Ni || (Ni = function(e, n, s) {
  return e.apply(n, s);
});
Fi || (Fi = function(e, n) {
  return new e(...n);
});
const ir = Rt(Array.prototype.forEach), ed = Rt(Array.prototype.lastIndexOf), Aa = Rt(Array.prototype.pop), bs = Rt(Array.prototype.push), td = Rt(Array.prototype.splice), gr = Rt(String.prototype.toLowerCase), li = Rt(String.prototype.toString), Ta = Rt(String.prototype.match), ws = Rt(String.prototype.replace), nd = Rt(String.prototype.indexOf), sd = Rt(String.prototype.trim), Gt = Rt(Object.prototype.hasOwnProperty), xt = Rt(RegExp.prototype.test), ks = rd(TypeError);
function Rt(t) {
  return function(e) {
    e instanceof RegExp && (e.lastIndex = 0);
    for (var n = arguments.length, s = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
      s[r - 1] = arguments[r];
    return Ni(t, e, s);
  };
}
function rd(t) {
  return function() {
    for (var e = arguments.length, n = new Array(e), s = 0; s < e; s++)
      n[s] = arguments[s];
    return Fi(t, n);
  };
}
function Te(t, e) {
  let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : gr;
  xa && xa(t, null);
  let s = e.length;
  for (; s--; ) {
    let r = e[s];
    if (typeof r == "string") {
      const i = n(r);
      i !== r && (Zh(e) || (e[s] = i), r = i);
    }
    t[r] = !0;
  }
  return t;
}
function id(t) {
  for (let e = 0; e < t.length; e++)
    Gt(t, e) || (t[e] = null);
  return t;
}
function hn(t) {
  const e = nc(null);
  for (const [n, s] of tc(t))
    Gt(t, n) && (Array.isArray(s) ? e[n] = id(s) : s && typeof s == "object" && s.constructor === Object ? e[n] = hn(s) : e[n] = s);
  return e;
}
function xs(t, e) {
  for (; t !== null; ) {
    const s = Qh(t, e);
    if (s) {
      if (s.get)
        return Rt(s.get);
      if (typeof s.value == "function")
        return Rt(s.value);
    }
    t = Jh(t);
  }
  function n() {
    return null;
  }
  return n;
}
const Sa = Ct(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "section", "select", "shadow", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]), ci = Ct(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]), ui = Ct(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]), od = Ct(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]), fi = Ct(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]), ad = Ct(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]), Ea = Ct(["#text"]), Ca = Ct(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns", "slot"]), hi = Ct(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]), Ra = Ct(["accent", "accentunder", "align", "bevelled", "close", "columnsalign", "columnlines", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lspace", "lquote", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]), or = Ct(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]), ld = Ht(/\{\{[\w\W]*|[\w\W]*\}\}/gm), cd = Ht(/<%[\w\W]*|[\w\W]*%>/gm), ud = Ht(/\$\{[\w\W]*/gm), fd = Ht(/^data-[\-\w.\u00B7-\uFFFF]+$/), hd = Ht(/^aria-[\-\w]+$/), sc = Ht(
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  // eslint-disable-line no-useless-escape
), dd = Ht(/^(?:\w+script|data):/i), pd = Ht(
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g
  // eslint-disable-line no-control-regex
), rc = Ht(/^html$/i), gd = Ht(/^[a-z][.\w]*(-[.\w]+)+$/i);
var Ia = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ARIA_ATTR: hd,
  ATTR_WHITESPACE: pd,
  CUSTOM_ELEMENT: gd,
  DATA_ATTR: fd,
  DOCTYPE_NAME: rc,
  ERB_EXPR: cd,
  IS_ALLOWED_URI: sc,
  IS_SCRIPT_OR_DATA: dd,
  MUSTACHE_EXPR: ld,
  TMPLIT_EXPR: ud
});
const As = {
  element: 1,
  text: 3,
  // Deprecated
  progressingInstruction: 7,
  comment: 8,
  document: 9
}, md = function() {
  return typeof window > "u" ? null : window;
}, _d = function(e, n) {
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
function ic() {
  let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : md();
  const e = (Z) => ic(Z);
  if (e.version = "3.2.6", e.removed = [], !t || !t.document || t.document.nodeType !== As.document || !t.Element)
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
    NamedNodeMap: c = t.NamedNodeMap || t.MozNamedAttrMap,
    HTMLFormElement: b,
    DOMParser: _,
    trustedTypes: F
  } = t, $ = l.prototype, Y = xs($, "cloneNode"), Ce = xs($, "remove"), ne = xs($, "nextSibling"), Ee = xs($, "childNodes"), ke = xs($, "parentNode");
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
    importNode: Ve
  } = s;
  let xe = La();
  e.isSupported = typeof tc == "function" && typeof ke == "function" && ee && ee.createHTMLDocument !== void 0;
  const {
    MUSTACHE_EXPR: ge,
    ERB_EXPR: Ke,
    TMPLIT_EXPR: Qe,
    DATA_ATTR: at,
    ARIA_ATTR: ae,
    IS_SCRIPT_OR_DATA: me,
    ATTR_WHITESPACE: le,
    CUSTOM_ELEMENT: ut
  } = Ia;
  let {
    IS_ALLOWED_URI: it
  } = Ia, ie = null;
  const nt = Te({}, [...Sa, ...ci, ...ui, ...fi, ...Ea]);
  let ve = null;
  const q = Te({}, [...Ca, ...hi, ...Ra, ...or]);
  let de = Object.seal(nc(null, {
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
  })), re = null, j = null, He = !0, Ge = !0, gt = !1, It = !0, d = !1, v = !0, k = !1, L = !1, R = !1, I = !1, B = !1, D = !1, M = !0, P = !1;
  const X = "user-content-";
  let U = !0, K = !1, Q = {}, ue = null;
  const Re = Te({}, ["annotation-xml", "audio", "colgroup", "desc", "foreignobject", "head", "iframe", "math", "mi", "mn", "mo", "ms", "mtext", "noembed", "noframes", "noscript", "plaintext", "script", "style", "svg", "template", "thead", "title", "video", "xmp"]);
  let pe = null;
  const ze = Te({}, ["audio", "video", "img", "source", "image", "track"]);
  let Me = null;
  const We = Te({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), u = "http://www.w3.org/1998/Math/MathML", y = "http://www.w3.org/2000/svg", A = "http://www.w3.org/1999/xhtml";
  let x = A, N = !1, G = null;
  const te = Te({}, [u, y, A], li);
  let ye = Te({}, ["mi", "mo", "mn", "ms", "mtext"]), Ae = Te({}, ["annotation-xml"]);
  const Ye = Te({}, ["title", "style", "font", "a", "script"]);
  let Ne = null;
  const ht = ["application/xhtml+xml", "text/html"], yt = "text/html";
  let qe = null, Zt = null;
  const os = n.createElement("form"), Fn = function(m) {
    return m instanceof RegExp || m instanceof Function;
  }, jn = function() {
    let m = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (!(Zt && Zt === m)) {
      if ((!m || typeof m != "object") && (m = {}), m = hn(m), Ne = // eslint-disable-next-line unicorn/prefer-includes
      ht.indexOf(m.PARSER_MEDIA_TYPE) === -1 ? yt : m.PARSER_MEDIA_TYPE, qe = Ne === "application/xhtml+xml" ? li : gr, ie = Gt(m, "ALLOWED_TAGS") ? Te({}, m.ALLOWED_TAGS, qe) : nt, ve = Gt(m, "ALLOWED_ATTR") ? Te({}, m.ALLOWED_ATTR, qe) : q, G = Gt(m, "ALLOWED_NAMESPACES") ? Te({}, m.ALLOWED_NAMESPACES, li) : te, Me = Gt(m, "ADD_URI_SAFE_ATTR") ? Te(hn(We), m.ADD_URI_SAFE_ATTR, qe) : We, pe = Gt(m, "ADD_DATA_URI_TAGS") ? Te(hn(ze), m.ADD_DATA_URI_TAGS, qe) : ze, ue = Gt(m, "FORBID_CONTENTS") ? Te({}, m.FORBID_CONTENTS, qe) : Re, re = Gt(m, "FORBID_TAGS") ? Te({}, m.FORBID_TAGS, qe) : hn({}), j = Gt(m, "FORBID_ATTR") ? Te({}, m.FORBID_ATTR, qe) : hn({}), Q = Gt(m, "USE_PROFILES") ? m.USE_PROFILES : !1, He = m.ALLOW_ARIA_ATTR !== !1, Ge = m.ALLOW_DATA_ATTR !== !1, gt = m.ALLOW_UNKNOWN_PROTOCOLS || !1, It = m.ALLOW_SELF_CLOSE_IN_ATTR !== !1, d = m.SAFE_FOR_TEMPLATES || !1, v = m.SAFE_FOR_XML !== !1, k = m.WHOLE_DOCUMENT || !1, I = m.RETURN_DOM || !1, B = m.RETURN_DOM_FRAGMENT || !1, D = m.RETURN_TRUSTED_TYPE || !1, R = m.FORCE_BODY || !1, M = m.SANITIZE_DOM !== !1, P = m.SANITIZE_NAMED_PROPS || !1, U = m.KEEP_CONTENT !== !1, K = m.IN_PLACE || !1, it = m.ALLOWED_URI_REGEXP || sc, x = m.NAMESPACE || A, ye = m.MATHML_TEXT_INTEGRATION_POINTS || ye, Ae = m.HTML_INTEGRATION_POINTS || Ae, de = m.CUSTOM_ELEMENT_HANDLING || {}, m.CUSTOM_ELEMENT_HANDLING && Fn(m.CUSTOM_ELEMENT_HANDLING.tagNameCheck) && (de.tagNameCheck = m.CUSTOM_ELEMENT_HANDLING.tagNameCheck), m.CUSTOM_ELEMENT_HANDLING && Fn(m.CUSTOM_ELEMENT_HANDLING.attributeNameCheck) && (de.attributeNameCheck = m.CUSTOM_ELEMENT_HANDLING.attributeNameCheck), m.CUSTOM_ELEMENT_HANDLING && typeof m.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements == "boolean" && (de.allowCustomizedBuiltInElements = m.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements), d && (Ge = !1), B && (I = !0), Q && (ie = Te({}, Ea), ve = [], Q.html === !0 && (Te(ie, Sa), Te(ve, Ca)), Q.svg === !0 && (Te(ie, ci), Te(ve, hi), Te(ve, or)), Q.svgFilters === !0 && (Te(ie, ui), Te(ve, hi), Te(ve, or)), Q.mathMl === !0 && (Te(ie, fi), Te(ve, Ra), Te(ve, or))), m.ADD_TAGS && (ie === nt && (ie = hn(ie)), Te(ie, m.ADD_TAGS, qe)), m.ADD_ATTR && (ve === q && (ve = hn(ve)), Te(ve, m.ADD_ATTR, qe)), m.ADD_URI_SAFE_ATTR && Te(Me, m.ADD_URI_SAFE_ATTR, qe), m.FORBID_CONTENTS && (ue === Re && (ue = hn(ue)), Te(ue, m.FORBID_CONTENTS, qe)), U && (ie["#text"] = !0), k && Te(ie, ["html", "head", "body"]), ie.table && (Te(ie, ["tbody"]), delete re.tbody), m.TRUSTED_TYPES_POLICY) {
        if (typeof m.TRUSTED_TYPES_POLICY.createHTML != "function")
          throw ks('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
        if (typeof m.TRUSTED_TYPES_POLICY.createScriptURL != "function")
          throw ks('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
        z = m.TRUSTED_TYPES_POLICY, W = z.createHTML("");
      } else
        z === void 0 && (z = _d(F, r)), z !== null && typeof W == "string" && (W = z.createHTML(""));
      Ct && Ct(m), Zt = m;
    }
  }, as = Te({}, [...ci, ...ui, ...od]), Wt = Te({}, [...fi, ...ad]), Gs = function(m) {
    let O = ke(m);
    (!O || !O.tagName) && (O = {
      namespaceURI: x,
      tagName: "template"
    });
    const H = gr(m.tagName), Fe = gr(O.tagName);
    return G[m.namespaceURI] ? m.namespaceURI === y ? O.namespaceURI === A ? H === "svg" : O.namespaceURI === u ? H === "svg" && (Fe === "annotation-xml" || ye[Fe]) : !!as[H] : m.namespaceURI === u ? O.namespaceURI === A ? H === "math" : O.namespaceURI === y ? H === "math" && Ae[Fe] : !!Wt[H] : m.namespaceURI === A ? O.namespaceURI === y && !Ae[Fe] || O.namespaceURI === u && !ye[Fe] ? !1 : !Wt[H] && (Ye[H] || !as[H]) : !!(Ne === "application/xhtml+xml" && G[m.namespaceURI]) : !1;
  }, _t = function(m) {
    bs(e.removed, {
      element: m
    });
    try {
      ke(m).removeChild(m);
    } catch {
      Ce(m);
    }
  }, kn = function(m, O) {
    try {
      bs(e.removed, {
        attribute: O.getAttributeNode(m),
        from: O
      });
    } catch {
      bs(e.removed, {
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
  }, Ys = function(m) {
    let O = null, H = null;
    if (R)
      m = "<remove></remove>" + m;
    else {
      const ct = Ta(m, /^[\r\n\t ]+/);
      H = ct && ct[0];
    }
    Ne === "application/xhtml+xml" && x === A && (m = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + m + "</body></html>");
    const Fe = z ? z.createHTML(m) : m;
    if (x === A)
      try {
        O = new _().parseFromString(Fe, Ne);
      } catch {
      }
    if (!O || !O.documentElement) {
      O = ee.createDocument(x, "template", null);
      try {
        O.documentElement.innerHTML = N ? W : Fe;
      } catch {
      }
    }
    const lt = O.body || O.documentElement;
    return m && H && lt.insertBefore(n.createTextNode(H), lt.childNodes[0] || null), x === A ? rt.call(O, k ? "html" : "body")[0] : k ? O.documentElement : lt;
  }, ls = function(m) {
    return V.call(
      m.ownerDocument || m,
      m,
      // eslint-disable-next-line no-bitwise
      h.SHOW_ELEMENT | h.SHOW_COMMENT | h.SHOW_TEXT | h.SHOW_PROCESSING_INSTRUCTION | h.SHOW_CDATA_SECTION,
      null
    );
  }, un = function(m) {
    return m instanceof b && (typeof m.nodeName != "string" || typeof m.textContent != "string" || typeof m.removeChild != "function" || !(m.attributes instanceof c) || typeof m.removeAttribute != "function" || typeof m.setAttribute != "function" || typeof m.namespaceURI != "string" || typeof m.insertBefore != "function" || typeof m.hasChildNodes != "function");
  }, Xs = function(m) {
    return typeof a == "function" && m instanceof a;
  };
  function Lt(Z, m, O) {
    ir(Z, (H) => {
      H.call(e, m, O, Zt);
    });
  }
  const Zs = function(m) {
    let O = null;
    if (Lt(xe.beforeSanitizeElements, m, null), un(m))
      return _t(m), !0;
    const H = qe(m.nodeName);
    if (Lt(xe.uponSanitizeElement, m, {
      tagName: H,
      allowedTags: ie
    }), v && m.hasChildNodes() && !Xs(m.firstElementChild) && xt(/<[/\w!]/g, m.innerHTML) && xt(/<[/\w!]/g, m.textContent) || m.nodeType === As.progressingInstruction || v && m.nodeType === As.comment && xt(/<[/\w]/g, m.data))
      return _t(m), !0;
    if (!ie[H] || re[H]) {
      if (!re[H] && Mn(H) && (de.tagNameCheck instanceof RegExp && xt(de.tagNameCheck, H) || de.tagNameCheck instanceof Function && de.tagNameCheck(H)))
        return !1;
      if (U && !ue[H]) {
        const Fe = ke(m) || m.parentNode, lt = Ee(m) || m.childNodes;
        if (lt && Fe) {
          const ct = lt.length;
          for (let ft = ct - 1; ft >= 0; --ft) {
            const st = Y(lt[ft], !0);
            st.__removalCount = (m.__removalCount || 0) + 1, Fe.insertBefore(st, ne(m));
          }
        }
      }
      return _t(m), !0;
    }
    return m instanceof l && !Gs(m) || (H === "noscript" || H === "noembed" || H === "noframes") && xt(/<\/no(script|embed|frames)/i, m.innerHTML) ? (_t(m), !0) : (d && m.nodeType === As.text && (O = m.textContent, ir([ge, Ke, Qe], (Fe) => {
      O = ws(O, Fe, " ");
    }), m.textContent !== O && (bs(e.removed, {
      element: m.cloneNode()
    }), m.textContent = O)), Lt(xe.afterSanitizeElements, m, null), !1);
  }, cs = function(m, O, H) {
    if (M && (O === "id" || O === "name") && (H in n || H in os))
      return !1;
    if (!(Ge && !j[O] && xt(at, O))) {
      if (!(He && xt(ae, O))) {
        if (!ve[O] || j[O]) {
          if (
            // First condition does a very basic check if a) it's basically a valid custom element tagname AND
            // b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
            // and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
            !(Mn(m) && (de.tagNameCheck instanceof RegExp && xt(de.tagNameCheck, m) || de.tagNameCheck instanceof Function && de.tagNameCheck(m)) && (de.attributeNameCheck instanceof RegExp && xt(de.attributeNameCheck, O) || de.attributeNameCheck instanceof Function && de.attributeNameCheck(O)) || // Alternative, second condition checks if it's an `is`-attribute, AND
            // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
            O === "is" && de.allowCustomizedBuiltInElements && (de.tagNameCheck instanceof RegExp && xt(de.tagNameCheck, H) || de.tagNameCheck instanceof Function && de.tagNameCheck(H)))
          ) return !1;
        } else if (!Me[O]) {
          if (!xt(it, ws(H, le, ""))) {
            if (!((O === "src" || O === "xlink:href" || O === "href") && m !== "script" && nd(H, "data:") === 0 && pe[m])) {
              if (!(gt && !xt(me, ws(H, le, "")))) {
                if (H)
                  return !1;
              }
            }
          }
        }
      }
    }
    return !0;
  }, Mn = function(m) {
    return m !== "annotation-xml" && Ta(m, ut);
  }, Vn = function(m) {
    Lt(xe.beforeSanitizeAttributes, m, null);
    const {
      attributes: O
    } = m;
    if (!O || un(m))
      return;
    const H = {
      attrName: "",
      attrValue: "",
      keepAttr: !0,
      allowedAttributes: ve,
      forceKeepAttr: void 0
    };
    let Fe = O.length;
    for (; Fe--; ) {
      const lt = O[Fe], {
        name: ct,
        namespaceURI: ft,
        value: st
      } = lt, Jt = qe(ct), qt = st;
      let mt = ct === "value" ? qt : sd(qt);
      if (H.attrName = Jt, H.attrValue = mt, H.keepAttr = !0, H.forceKeepAttr = void 0, Lt(xe.uponSanitizeAttribute, m, H), mt = H.attrValue, P && (Jt === "id" || Jt === "name") && (kn(ct, m), mt = X + mt), v && xt(/((--!?|])>)|<\/(style|title)/i, mt)) {
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
      d && ir([ge, Ke, Qe], (Qs) => {
        mt = ws(mt, Qs, " ");
      });
      const Js = qe(m.nodeName);
      if (!cs(Js, Jt, mt)) {
        kn(ct, m);
        continue;
      }
      if (z && typeof F == "object" && typeof F.getAttributeType == "function" && !ft)
        switch (F.getAttributeType(Js, Jt)) {
          case "TrustedHTML": {
            mt = z.createHTML(mt);
            break;
          }
          case "TrustedScriptURL": {
            mt = z.createScriptURL(mt);
            break;
          }
        }
      if (mt !== qt)
        try {
          ft ? m.setAttributeNS(ft, ct, mt) : m.setAttribute(ct, mt), un(m) ? _t(m) : Aa(e.removed);
        } catch {
          kn(ct, m);
        }
    }
    Lt(xe.afterSanitizeAttributes, m, null);
  }, Dt = function Z(m) {
    let O = null;
    const H = ls(m);
    for (Lt(xe.beforeSanitizeShadowDOM, m, null); O = H.nextNode(); )
      Lt(xe.uponSanitizeShadowNode, O, null), Zs(O), Vn(O), O.content instanceof i && Z(O.content);
    Lt(xe.afterSanitizeShadowDOM, m, null);
  };
  return e.sanitize = function(Z) {
    let m = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, O = null, H = null, Fe = null, lt = null;
    if (N = !Z, N && (Z = "<!-->"), typeof Z != "string" && !Xs(Z))
      if (typeof Z.toString == "function") {
        if (Z = Z.toString(), typeof Z != "string")
          throw ks("dirty is not a string, aborting");
      } else
        throw ks("toString is not a function");
    if (!e.isSupported)
      return Z;
    if (L || jn(m), e.removed = [], typeof Z == "string" && (K = !1), K) {
      if (Z.nodeName) {
        const st = qe(Z.nodeName);
        if (!ie[st] || re[st])
          throw ks("root node is forbidden and cannot be sanitized in-place");
      }
    } else if (Z instanceof a)
      O = Ys("<!---->"), H = O.ownerDocument.importNode(Z, !0), H.nodeType === As.element && H.nodeName === "BODY" || H.nodeName === "HTML" ? O = H : O.appendChild(H);
    else {
      if (!I && !d && !k && // eslint-disable-next-line unicorn/prefer-includes
      Z.indexOf("<") === -1)
        return z && D ? z.createHTML(Z) : Z;
      if (O = Ys(Z), !O)
        return I ? null : D ? W : "";
    }
    O && R && _t(O.firstChild);
    const ct = ls(K ? Z : O);
    for (; Fe = ct.nextNode(); )
      Zs(Fe), Vn(Fe), Fe.content instanceof i && Dt(Fe.content);
    if (K)
      return Z;
    if (I) {
      if (B)
        for (lt = Pe.call(O.ownerDocument); O.firstChild; )
          lt.appendChild(O.firstChild);
      else
        lt = O;
      return (ve.shadowroot || ve.shadowrootmode) && (lt = Ve.call(s, lt, !0)), lt;
    }
    let ft = k ? O.outerHTML : O.innerHTML;
    return k && ie["!doctype"] && O.ownerDocument && O.ownerDocument.doctype && O.ownerDocument.doctype.name && xt(rc, O.ownerDocument.doctype.name) && (ft = "<!DOCTYPE " + O.ownerDocument.doctype.name + `>
` + ft), d && ir([ge, Ke, Qe], (st) => {
      ft = ws(ft, st, " ");
    }), z && D ? z.createHTML(ft) : ft;
  }, e.setConfig = function() {
    let Z = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    jn(Z), L = !0;
  }, e.clearConfig = function() {
    Zt = null, L = !1;
  }, e.isValidAttribute = function(Z, m, O) {
    Zt || jn({});
    const H = qe(Z), Fe = qe(m);
    return cs(H, Fe, O);
  }, e.addHook = function(Z, m) {
    typeof m == "function" && bs(xe[Z], m);
  }, e.removeHook = function(Z, m) {
    if (m !== void 0) {
      const O = ed(xe[Z], m);
      return O === -1 ? void 0 : td(xe[Z], O, 1)[0];
    }
    return Aa(xe[Z]);
  }, e.removeHooks = function(Z) {
    xe[Z] = [];
  }, e.removeAllHooks = function() {
    xe = La();
  }, e;
}
var go = ic();
go.addHook("uponSanitizeElement", (t, e) => {
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
      const c = n.textContent;
      c ? n.replaceWith(c) : (l = n.parentNode) == null || l.removeChild(n);
    } else
      (h = n.parentNode) == null || h.removeChild(n);
});
go.addHook("afterSanitizeAttributes", (t) => {
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
function vd(t) {
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
  return go.sanitize(t, e);
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
], yd = (t) => (t || "").split("").reduce((e, n) => e + n.charCodeAt(0), 0) % Cs.length, bd = (t) => {
  const e = Cs[(t % Cs.length + Cs.length) % Cs.length];
  return {
    background: `
            radial-gradient(circle at 32% 28%, rgba(255,255,255,0.22) 0%, transparent 42%),
            radial-gradient(circle at 68% 72%, rgba(0,0,0,0.25) 0%, transparent 38%),
            radial-gradient(ellipse at 50% 50%, ${e.stops})
        `.trim(),
    boxShadow: `0 4px 28px ${e.glow}, inset 0 1px 0 rgba(255,255,255,0.15)`,
    borderRadius: "50%"
  };
}, wd = (t, e) => {
  const n = typeof e == "number" && Number.isFinite(e) ? e : yd(t);
  return bd(n);
}, mo = (t) => !!t && (/^https?:\/\//i.test(t) || t.startsWith("data:"));
function Oa() {
  return typeof window < "u" && window.APP_CONFIG ? window.APP_CONFIG : {};
}
const Cn = {
  get API_URL() {
    return Oa().API_URL || "https://api.chattermate.chat/api/v1";
  },
  get WS_URL() {
    return Oa().WS_URL || "wss://api.chattermate.chat";
  }
};
function kd(t) {
  const e = Ie(() => ({
    backgroundColor: "var(--cm-card)",
    color: "var(--cm-text)"
  })), n = Ie(() => ({
    backgroundColor: t.value.chat_bubble_color || "#C9F24E",
    color: Ws(t.value.chat_bubble_color || "#C9F24E") ? "#FFFFFF" : "#000000"
  })), s = Ie(() => ({
    backgroundColor: "var(--cm-agent-bg)",
    color: "var(--cm-text)"
  })), r = Ie(() => ({
    backgroundColor: "var(--cm-accent)",
    color: "var(--cm-on-accent)"
  })), i = Ie(() => ({
    color: "var(--cm-text)"
  })), o = Ie(() => ({
    borderBottom: "1px solid var(--cm-hairline)"
  })), a = Ie(() => t.value.photo_url ? mo(t.value.photo_url) ? t.value.photo_url : `${Cn.API_URL}${t.value.photo_url}` : ""), l = Ie(() => {
    const h = t.value.chat_background_color || "#ffffff";
    return {
      boxShadow: `0 8px 5px ${Ws(h) ? "rgba(0, 0, 0, 0.24)" : "rgba(0, 0, 0, 0.12)"}`
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
const xd = /* @__PURE__ */ new Set(["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]), Ad = /* @__PURE__ */ new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);
[...xd, ...Ad];
function Td(t, e) {
  const n = ce([]), s = ce(!1), r = ce(null), i = (W) => {
    if (W === 0) return "0 Bytes";
    const ee = 1024, V = ["Bytes", "KB", "MB", "GB"], Pe = Math.floor(Math.log(W) / Math.log(ee));
    return parseFloat((W / Math.pow(ee, Pe)).toFixed(2)) + " " + V[Pe];
  }, o = (W) => W.startsWith("image/"), a = (W) => W ? W.startsWith("blob:") || W.startsWith("http://") || W.startsWith("https://") ? W : `${Cn.API_URL}${W}` : "", l = (W) => {
    const ee = W.file_url || W.url;
    return ee ? ee.startsWith("blob:") || ee.startsWith("http://") || ee.startsWith("https://") ? ee : `${Cn.API_URL}${ee}` : "";
  }, h = async (W) => {
    const ee = W.target;
    ee.files && ee.files.length > 0 && (await Y(Array.from(ee.files)), ee.value = "");
  }, c = async (W) => {
    var V;
    W.preventDefault();
    const ee = (V = W.dataTransfer) == null ? void 0 : V.files;
    ee && ee.length > 0 && await Y(Array.from(ee));
  }, b = (W) => {
    W.preventDefault();
  }, _ = (W) => {
    W.preventDefault();
  }, F = async (W) => {
    var Pe;
    const ee = (Pe = W.clipboardData) == null ? void 0 : Pe.items;
    if (!ee) return;
    const V = [];
    for (const rt of Array.from(ee))
      if (rt.kind === "file") {
        const Ve = rt.getAsFile();
        Ve && V.push(Ve);
      }
    V.length > 0 && await Y(V);
  }, $ = async (W, ee = 500) => new Promise((V, Pe) => {
    const rt = new FileReader();
    rt.onload = (Ve) => {
      var ge;
      const xe = new Image();
      xe.onload = () => {
        const Ke = document.createElement("canvas");
        let Qe = xe.width, at = xe.height;
        const ae = 1920;
        (Qe > ae || at > ae) && (Qe > at ? (at = at / Qe * ae, Qe = ae) : (Qe = Qe / at * ae, at = ae)), Ke.width = Qe, Ke.height = at;
        const me = Ke.getContext("2d");
        if (!me) {
          Pe(new Error("Failed to get canvas context"));
          return;
        }
        me.drawImage(xe, 0, 0, Qe, at);
        let le = 0.9;
        const ut = () => {
          Ke.toBlob((it) => {
            if (!it) {
              Pe(new Error("Failed to compress image"));
              return;
            }
            if (it.size / 1024 > ee && le > 0.3)
              le -= 0.1, ut();
            else {
              const nt = new FileReader();
              nt.onload = () => {
                const ve = nt.result.split(",")[1];
                V({ blob: it, base64: ve });
              }, nt.readAsDataURL(it);
            }
          }, W.type === "image/png" ? "image/png" : "image/jpeg", le);
        };
        ut();
      }, xe.onerror = () => Pe(new Error("Failed to load image")), xe.src = (ge = Ve.target) == null ? void 0 : ge.result;
    }, rt.onerror = () => Pe(new Error("Failed to read file")), rt.readAsDataURL(W);
  }), Y = async (W) => {
    if (n.value.length >= 3) {
      alert("Maximum 3 files allowed per message");
      return;
    }
    const Ve = 3 - n.value.length, xe = W.slice(0, Ve);
    W.length > Ve && alert(`Only ${Ve} more file(s) can be uploaded. Maximum 3 files per message.`);
    for (const ge of xe)
      try {
        if (n.value.some((ae) => ae.filename === ge.name)) {
          console.warn(`File ${ge.name} is already selected`), alert(`File "${ge.name}" is already selected`);
          continue;
        }
        const Qe = ge.type.startsWith("image/"), at = Qe ? 5242880 : 10485760;
        if (ge.size > at) {
          const ae = at / 1048576;
          console.error(`File ${ge.name} is too large. Maximum size is ${ae}MB`), alert(`File "${ge.name}" is too large. Maximum size for ${Qe ? "images" : "documents"} is ${ae}MB`);
          continue;
        }
        if (Qe)
          try {
            const { blob: ae, base64: me } = await $(ge, 500), le = ae.size;
            console.log(`Compressed ${ge.name}: ${(ge.size / 1024).toFixed(2)}KB → ${(le / 1024).toFixed(2)}KB`), n.value.push({
              content: me,
              filename: ge.name,
              type: ge.type,
              size: le,
              url: URL.createObjectURL(ae),
              file_url: URL.createObjectURL(ae)
            });
          } catch (ae) {
            console.error("Image compression failed, uploading original:", ae);
            const me = new FileReader();
            me.onload = (le) => {
              var ie;
              const it = ((ie = le.target) == null ? void 0 : ie.result).split(",")[1];
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
          const ae = new FileReader();
          ae.onload = (me) => {
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
          }, ae.readAsDataURL(ge);
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
    handleFileSelect: h,
    handleDrop: c,
    handleDragOver: b,
    handleDragLeave: _,
    handlePaste: F,
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
          t.value && (Pe.Authorization = `Bearer ${t.value}`);
          const rt = await fetch(`${Cn.API_URL}/api/v1/files/upload/${V}`, {
            method: "DELETE",
            headers: Pe
          });
          if (rt.ok)
            console.log("File deleted successfully from backend.");
          else {
            const Ve = await rt.json();
            console.error("Failed to delete file:", Ve.detail);
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
      (W = e.value) == null || W.click();
    },
    isImage: (W) => W.startsWith("image/")
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
const mr = /* @__PURE__ */ Object.create(null);
Object.keys(cn).forEach((t) => {
  mr[cn[t]] = t;
});
const Mi = { type: "error", data: "parser error" }, oc = typeof Blob == "function" || typeof Blob < "u" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]", ac = typeof ArrayBuffer == "function", lc = (t) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(t) : t && t.buffer instanceof ArrayBuffer, _o = ({ type: t, data: e }, n, s) => oc && e instanceof Blob ? n ? s(e) : Pa(e, s) : ac && (e instanceof ArrayBuffer || lc(e)) ? n ? s(e) : Pa(new Blob([e]), s) : s(cn[t] + (e || "")), Pa = (t, e) => {
  const n = new FileReader();
  return n.onload = function() {
    const s = n.result.split(",")[1];
    e("b" + (s || ""));
  }, n.readAsDataURL(t);
};
function Na(t) {
  return t instanceof Uint8Array ? t : t instanceof ArrayBuffer ? new Uint8Array(t) : new Uint8Array(t.buffer, t.byteOffset, t.byteLength);
}
let di;
function Sd(t, e) {
  if (oc && t.data instanceof Blob)
    return t.data.arrayBuffer().then(Na).then(e);
  if (ac && (t.data instanceof ArrayBuffer || lc(t.data)))
    return e(Na(t.data));
  _o(t, !1, (n) => {
    di || (di = new TextEncoder()), e(di.encode(n));
  });
}
const Fa = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", Rs = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (let t = 0; t < Fa.length; t++)
  Rs[Fa.charCodeAt(t)] = t;
const Ed = (t) => {
  let e = t.length * 0.75, n = t.length, s, r = 0, i, o, a, l;
  t[t.length - 1] === "=" && (e--, t[t.length - 2] === "=" && e--);
  const h = new ArrayBuffer(e), c = new Uint8Array(h);
  for (s = 0; s < n; s += 4)
    i = Rs[t.charCodeAt(s)], o = Rs[t.charCodeAt(s + 1)], a = Rs[t.charCodeAt(s + 2)], l = Rs[t.charCodeAt(s + 3)], c[r++] = i << 2 | o >> 4, c[r++] = (o & 15) << 4 | a >> 2, c[r++] = (a & 3) << 6 | l & 63;
  return h;
}, Cd = typeof ArrayBuffer == "function", vo = (t, e) => {
  if (typeof t != "string")
    return {
      type: "message",
      data: cc(t, e)
    };
  const n = t.charAt(0);
  return n === "b" ? {
    type: "message",
    data: Rd(t.substring(1), e)
  } : mr[n] ? t.length > 1 ? {
    type: mr[n],
    data: t.substring(1)
  } : {
    type: mr[n]
  } : Mi;
}, Rd = (t, e) => {
  if (Cd) {
    const n = Ed(t);
    return cc(n, e);
  } else
    return { base64: !0, data: t };
}, cc = (t, e) => {
  switch (e) {
    case "blob":
      return t instanceof Blob ? t : new Blob([t]);
    case "arraybuffer":
    default:
      return t instanceof ArrayBuffer ? t : t.buffer;
  }
}, uc = "", Id = (t, e) => {
  const n = t.length, s = new Array(n);
  let r = 0;
  t.forEach((i, o) => {
    _o(i, !1, (a) => {
      s[o] = a, ++r === n && e(s.join(uc));
    });
  });
}, Ld = (t, e) => {
  const n = t.split(uc), s = [];
  for (let r = 0; r < n.length; r++) {
    const i = vo(n[r], e);
    if (s.push(i), i.type === "error")
      break;
  }
  return s;
};
function Od() {
  return new TransformStream({
    transform(t, e) {
      Sd(t, (n) => {
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
let pi;
function ar(t) {
  return t.reduce((e, n) => e + n.length, 0);
}
function lr(t, e) {
  if (t[0].length === e)
    return t.shift();
  const n = new Uint8Array(e);
  let s = 0;
  for (let r = 0; r < e; r++)
    n[r] = t[0][s++], s === t[0].length && (t.shift(), s = 0);
  return t.length && s < t[0].length && (t[0] = t[0].slice(s)), n;
}
function Pd(t, e) {
  pi || (pi = new TextDecoder());
  const n = [];
  let s = 0, r = -1, i = !1;
  return new TransformStream({
    transform(o, a) {
      for (n.push(o); ; ) {
        if (s === 0) {
          if (ar(n) < 1)
            break;
          const l = lr(n, 1);
          i = (l[0] & 128) === 128, r = l[0] & 127, r < 126 ? s = 3 : r === 126 ? s = 1 : s = 2;
        } else if (s === 1) {
          if (ar(n) < 2)
            break;
          const l = lr(n, 2);
          r = new DataView(l.buffer, l.byteOffset, l.length).getUint16(0), s = 3;
        } else if (s === 2) {
          if (ar(n) < 8)
            break;
          const l = lr(n, 8), h = new DataView(l.buffer, l.byteOffset, l.length), c = h.getUint32(0);
          if (c > Math.pow(2, 21) - 1) {
            a.enqueue(Mi);
            break;
          }
          r = c * Math.pow(2, 32) + h.getUint32(4), s = 3;
        } else {
          if (ar(n) < r)
            break;
          const l = lr(n, r);
          a.enqueue(vo(i ? l : pi.decode(l), e)), s = 0;
        }
        if (r === 0 || r > t) {
          a.enqueue(Mi);
          break;
        }
      }
    }
  });
}
const fc = 4;
function dt(t) {
  if (t) return Nd(t);
}
function Nd(t) {
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
const qr = typeof Promise == "function" && typeof Promise.resolve == "function" ? (e) => Promise.resolve().then(e) : (e, n) => n(e, 0), Bt = typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")(), Fd = "arraybuffer";
function hc(t, ...e) {
  return e.reduce((n, s) => (t.hasOwnProperty(s) && (n[s] = t[s]), n), {});
}
const Md = Bt.setTimeout, Dd = Bt.clearTimeout;
function jr(t, e) {
  e.useNativeTimers ? (t.setTimeoutFn = Md.bind(Bt), t.clearTimeoutFn = Dd.bind(Bt)) : (t.setTimeoutFn = Bt.setTimeout.bind(Bt), t.clearTimeoutFn = Bt.clearTimeout.bind(Bt));
}
const Bd = 1.33;
function $d(t) {
  return typeof t == "string" ? Ud(t) : Math.ceil((t.byteLength || t.size) * Bd);
}
function Ud(t) {
  let e = 0, n = 0;
  for (let s = 0, r = t.length; s < r; s++)
    e = t.charCodeAt(s), e < 128 ? n += 1 : e < 2048 ? n += 2 : e < 55296 || e >= 57344 ? n += 3 : (s++, n += 4);
  return n;
}
function dc() {
  return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
}
function zd(t) {
  let e = "";
  for (let n in t)
    t.hasOwnProperty(n) && (e.length && (e += "&"), e += encodeURIComponent(n) + "=" + encodeURIComponent(t[n]));
  return e;
}
function Hd(t) {
  let e = {}, n = t.split("&");
  for (let s = 0, r = n.length; s < r; s++) {
    let i = n[s].split("=");
    e[decodeURIComponent(i[0])] = decodeURIComponent(i[1]);
  }
  return e;
}
class Wd extends Error {
  constructor(e, n, s) {
    super(e), this.description = n, this.context = s, this.type = "TransportError";
  }
}
class yo extends dt {
  /**
   * Transport abstract constructor.
   *
   * @param {Object} opts - options
   * @protected
   */
  constructor(e) {
    super(), this.writable = !1, jr(this, e), this.opts = e, this.query = e.query, this.socket = e.socket, this.supportsBinary = !e.forceBase64;
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
    return super.emitReserved("error", new Wd(e, n, s)), this;
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
    const n = vo(e, this.socket.binaryType);
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
    const n = zd(e);
    return n.length ? "?" + n : "";
  }
}
class qd extends yo {
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
    Ld(e, this.socket.binaryType).forEach(n), this.readyState !== "closed" && (this._polling = !1, this.emitReserved("pollComplete"), this.readyState === "open" && this._poll());
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
    this.writable = !1, Id(e, (n) => {
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
    return this.opts.timestampRequests !== !1 && (n[this.opts.timestampParam] = dc()), !this.supportsBinary && !n.sid && (n.b64 = 1), this.createUri(e, n);
  }
}
let pc = !1;
try {
  pc = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest();
} catch {
}
const jd = pc;
function Vd() {
}
class Kd extends qd {
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
class an extends dt {
  /**
   * Request constructor
   *
   * @param {Object} options
   * @package
   */
  constructor(e, n, s) {
    super(), this.createRequest = e, jr(this, s), this._opts = s, this._method = s.method || "GET", this._uri = n, this._data = s.data !== void 0 ? s.data : null, this._create();
  }
  /**
   * Creates the XHR object and sends the request.
   *
   * @private
   */
  _create() {
    var e;
    const n = hc(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
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
      if (this._xhr.onreadystatechange = Vd, e)
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
    attachEvent("onunload", Ma);
  else if (typeof addEventListener == "function") {
    const t = "onpagehide" in Bt ? "pagehide" : "unload";
    addEventListener(t, Ma, !1);
  }
}
function Ma() {
  for (let t in an.requests)
    an.requests.hasOwnProperty(t) && an.requests[t].abort();
}
const Gd = function() {
  const t = gc({
    xdomain: !1
  });
  return t && t.responseType !== null;
}();
class Yd extends Kd {
  constructor(e) {
    super(e);
    const n = e && e.forceBase64;
    this.supportsBinary = Gd && !n;
  }
  request(e = {}) {
    return Object.assign(e, { xd: this.xd }, this.opts), new an(gc, this.uri(), e);
  }
}
function gc(t) {
  const e = t.xdomain;
  try {
    if (typeof XMLHttpRequest < "u" && (!e || jd))
      return new XMLHttpRequest();
  } catch {
  }
  if (!e)
    try {
      return new Bt[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
    } catch {
    }
}
const mc = typeof navigator < "u" && typeof navigator.product == "string" && navigator.product.toLowerCase() === "reactnative";
class Xd extends yo {
  get name() {
    return "websocket";
  }
  doOpen() {
    const e = this.uri(), n = this.opts.protocols, s = mc ? {} : hc(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
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
      _o(s, this.supportsBinary, (i) => {
        try {
          this.doWrite(s, i);
        } catch {
        }
        r && qr(() => {
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
    return this.opts.timestampRequests && (n[this.opts.timestampParam] = dc()), this.supportsBinary || (n.b64 = 1), this.createUri(e, n);
  }
}
const gi = Bt.WebSocket || Bt.MozWebSocket;
class Zd extends Xd {
  createSocket(e, n, s) {
    return mc ? new gi(e, n, s) : n ? new gi(e, n) : new gi(e);
  }
  doWrite(e, n) {
    this.ws.send(n);
  }
}
class Jd extends yo {
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
        const n = Pd(Number.MAX_SAFE_INTEGER, this.socket.binaryType), s = e.readable.pipeThrough(n).getReader(), r = Od();
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
        r && qr(() => {
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
const Qd = {
  websocket: Zd,
  webtransport: Jd,
  polling: Yd
}, ep = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/, tp = [
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
function Di(t) {
  if (t.length > 8e3)
    throw "URI too long";
  const e = t, n = t.indexOf("["), s = t.indexOf("]");
  n != -1 && s != -1 && (t = t.substring(0, n) + t.substring(n, s).replace(/:/g, ";") + t.substring(s, t.length));
  let r = ep.exec(t || ""), i = {}, o = 14;
  for (; o--; )
    i[tp[o]] = r[o] || "";
  return n != -1 && s != -1 && (i.source = e, i.host = i.host.substring(1, i.host.length - 1).replace(/;/g, ":"), i.authority = i.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), i.ipv6uri = !0), i.pathNames = np(i, i.path), i.queryKey = sp(i, i.query), i;
}
function np(t, e) {
  const n = /\/{2,9}/g, s = e.replace(n, "/").split("/");
  return (e.slice(0, 1) == "/" || e.length === 0) && s.splice(0, 1), e.slice(-1) == "/" && s.splice(s.length - 1, 1), s;
}
function sp(t, e) {
  const n = {};
  return e.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function(s, r, i) {
    r && (n[r] = i);
  }), n;
}
const Bi = typeof addEventListener == "function" && typeof removeEventListener == "function", _r = [];
Bi && addEventListener("offline", () => {
  _r.forEach((t) => t());
}, !1);
class Rn extends dt {
  /**
   * Socket constructor.
   *
   * @param {String|Object} uri - uri or options
   * @param {Object} opts - options
   */
  constructor(e, n) {
    if (super(), this.binaryType = Fd, this.writeBuffer = [], this._prevBufferLen = 0, this._pingInterval = -1, this._pingTimeout = -1, this._maxPayload = -1, this._pingTimeoutTime = 1 / 0, e && typeof e == "object" && (n = e, e = null), e) {
      const s = Di(e);
      n.hostname = s.host, n.secure = s.protocol === "https" || s.protocol === "wss", n.port = s.port, s.query && (n.query = s.query);
    } else n.host && (n.hostname = Di(n.host).host);
    jr(this, n), this.secure = n.secure != null ? n.secure : typeof location < "u" && location.protocol === "https:", n.hostname && !n.port && (n.port = this.secure ? "443" : "80"), this.hostname = n.hostname || (typeof location < "u" ? location.hostname : "localhost"), this.port = n.port || (typeof location < "u" && location.port ? location.port : this.secure ? "443" : "80"), this.transports = [], this._transportsByName = {}, n.transports.forEach((s) => {
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
    }, n), this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : ""), typeof this.opts.query == "string" && (this.opts.query = Hd(this.opts.query)), Bi && (this.opts.closeOnBeforeunload && (this._beforeunloadEventListener = () => {
      this.transport && (this.transport.removeAllListeners(), this.transport.close());
    }, addEventListener("beforeunload", this._beforeunloadEventListener, !1)), this.hostname !== "localhost" && (this._offlineEventListener = () => {
      this._onClose("transport close", {
        description: "network connection lost"
      });
    }, _r.push(this._offlineEventListener))), this.opts.withCredentials && (this._cookieJar = void 0), this._open();
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
    n.EIO = fc, n.transport = e, this.id && (n.sid = this.id);
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
      if (r && (n += $d(r)), s > 0 && n > this._maxPayload)
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
    return e && (this._pingTimeoutTime = 0, qr(() => {
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
      if (this.clearTimeoutFn(this._pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), Bi && (this._beforeunloadEventListener && removeEventListener("beforeunload", this._beforeunloadEventListener, !1), this._offlineEventListener)) {
        const s = _r.indexOf(this._offlineEventListener);
        s !== -1 && _r.splice(s, 1);
      }
      this.readyState = "closed", this.id = null, this.emitReserved("close", e, n), this.writeBuffer = [], this._prevBufferLen = 0;
    }
  }
}
Rn.protocol = fc;
class rp extends Rn {
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
    const o = (b) => {
      const _ = new Error("probe error: " + b);
      _.transport = n.name, i(), this.emitReserved("upgradeError", _);
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
    const c = () => {
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
let ip = class extends rp {
  constructor(e, n = {}) {
    const s = typeof e == "object" ? e : n;
    (!s.transports || s.transports && typeof s.transports[0] == "string") && (s.transports = (s.transports || ["polling", "websocket", "webtransport"]).map((r) => Qd[r]).filter((r) => !!r)), super(e, s);
  }
};
function op(t, e = "", n) {
  let s = t;
  n = n || typeof location < "u" && location, t == null && (t = n.protocol + "//" + n.host), typeof t == "string" && (t.charAt(0) === "/" && (t.charAt(1) === "/" ? t = n.protocol + t : t = n.host + t), /^(https?|wss?):\/\//.test(t) || (typeof n < "u" ? t = n.protocol + "//" + t : t = "https://" + t), s = Di(t)), s.port || (/^(http|ws)$/.test(s.protocol) ? s.port = "80" : /^(http|ws)s$/.test(s.protocol) && (s.port = "443")), s.path = s.path || "/";
  const i = s.host.indexOf(":") !== -1 ? "[" + s.host + "]" : s.host;
  return s.id = s.protocol + "://" + i + ":" + s.port + e, s.href = s.protocol + "://" + i + (n && n.port === s.port ? "" : ":" + s.port), s;
}
const ap = typeof ArrayBuffer == "function", lp = (t) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(t) : t.buffer instanceof ArrayBuffer, _c = Object.prototype.toString, cp = typeof Blob == "function" || typeof Blob < "u" && _c.call(Blob) === "[object BlobConstructor]", up = typeof File == "function" || typeof File < "u" && _c.call(File) === "[object FileConstructor]";
function bo(t) {
  return ap && (t instanceof ArrayBuffer || lp(t)) || cp && t instanceof Blob || up && t instanceof File;
}
function vr(t, e) {
  if (!t || typeof t != "object")
    return !1;
  if (Array.isArray(t)) {
    for (let n = 0, s = t.length; n < s; n++)
      if (vr(t[n]))
        return !0;
    return !1;
  }
  if (bo(t))
    return !0;
  if (t.toJSON && typeof t.toJSON == "function" && arguments.length === 1)
    return vr(t.toJSON(), !0);
  for (const n in t)
    if (Object.prototype.hasOwnProperty.call(t, n) && vr(t[n]))
      return !0;
  return !1;
}
function fp(t) {
  const e = [], n = t.data, s = t;
  return s.data = $i(n, e), s.attachments = e.length, { packet: s, buffers: e };
}
function $i(t, e) {
  if (!t)
    return t;
  if (bo(t)) {
    const n = { _placeholder: !0, num: e.length };
    return e.push(t), n;
  } else if (Array.isArray(t)) {
    const n = new Array(t.length);
    for (let s = 0; s < t.length; s++)
      n[s] = $i(t[s], e);
    return n;
  } else if (typeof t == "object" && !(t instanceof Date)) {
    const n = {};
    for (const s in t)
      Object.prototype.hasOwnProperty.call(t, s) && (n[s] = $i(t[s], e));
    return n;
  }
  return t;
}
function hp(t, e) {
  return t.data = Ui(t.data, e), delete t.attachments, t;
}
function Ui(t, e) {
  if (!t)
    return t;
  if (t && t._placeholder === !0) {
    if (typeof t.num == "number" && t.num >= 0 && t.num < e.length)
      return e[t.num];
    throw new Error("illegal attachments");
  } else if (Array.isArray(t))
    for (let n = 0; n < t.length; n++)
      t[n] = Ui(t[n], e);
  else if (typeof t == "object")
    for (const n in t)
      Object.prototype.hasOwnProperty.call(t, n) && (t[n] = Ui(t[n], e));
  return t;
}
const dp = [
  "connect",
  "connect_error",
  "disconnect",
  "disconnecting",
  "newListener",
  "removeListener"
  // used by the Node.js EventEmitter
], pp = 5;
var Le;
(function(t) {
  t[t.CONNECT = 0] = "CONNECT", t[t.DISCONNECT = 1] = "DISCONNECT", t[t.EVENT = 2] = "EVENT", t[t.ACK = 3] = "ACK", t[t.CONNECT_ERROR = 4] = "CONNECT_ERROR", t[t.BINARY_EVENT = 5] = "BINARY_EVENT", t[t.BINARY_ACK = 6] = "BINARY_ACK";
})(Le || (Le = {}));
class gp {
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
    return (e.type === Le.EVENT || e.type === Le.ACK) && vr(e) ? this.encodeAsBinary({
      type: e.type === Le.EVENT ? Le.BINARY_EVENT : Le.BINARY_ACK,
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
    return (e.type === Le.BINARY_EVENT || e.type === Le.BINARY_ACK) && (n += e.attachments + "-"), e.nsp && e.nsp !== "/" && (n += e.nsp + ","), e.id != null && (n += e.id), e.data != null && (n += JSON.stringify(e.data, this.replacer)), n;
  }
  /**
   * Encode packet as 'buffer sequence' by removing blobs, and
   * deconstructing packet into object with placeholders and
   * a list of buffers.
   */
  encodeAsBinary(e) {
    const n = fp(e), s = this.encodeAsString(n.packet), r = n.buffers;
    return r.unshift(s), r;
  }
}
function Da(t) {
  return Object.prototype.toString.call(t) === "[object Object]";
}
class wo extends dt {
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
      const s = n.type === Le.BINARY_EVENT;
      s || n.type === Le.BINARY_ACK ? (n.type = s ? Le.EVENT : Le.ACK, this.reconstructor = new mp(n), n.attachments === 0 && super.emitReserved("decoded", n)) : super.emitReserved("decoded", n);
    } else if (bo(e) || e.base64)
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
    if (Le[s.type] === void 0)
      throw new Error("unknown packet type " + s.type);
    if (s.type === Le.BINARY_EVENT || s.type === Le.BINARY_ACK) {
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
      if (wo.isPayloadValid(s.type, i))
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
      case Le.CONNECT:
        return Da(n);
      case Le.DISCONNECT:
        return n === void 0;
      case Le.CONNECT_ERROR:
        return typeof n == "string" || Da(n);
      case Le.EVENT:
      case Le.BINARY_EVENT:
        return Array.isArray(n) && (typeof n[0] == "number" || typeof n[0] == "string" && dp.indexOf(n[0]) === -1);
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
class mp {
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
      const n = hp(this.reconPack, this.buffers);
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
const _p = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Decoder: wo,
  Encoder: gp,
  get PacketType() {
    return Le;
  },
  protocol: pp
}, Symbol.toStringTag, { value: "Module" }));
function Yt(t, e, n) {
  return t.on(e, n), function() {
    t.off(e, n);
  };
}
const vp = Object.freeze({
  connect: 1,
  connect_error: 1,
  disconnect: 1,
  disconnecting: 1,
  // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
  newListener: 1,
  removeListener: 1
});
class vc extends dt {
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
      Yt(e, "open", this.onopen.bind(this)),
      Yt(e, "packet", this.onpacket.bind(this)),
      Yt(e, "error", this.onerror.bind(this)),
      Yt(e, "close", this.onclose.bind(this))
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
    if (vp.hasOwnProperty(e))
      throw new Error('"' + e.toString() + '" is a reserved event name');
    if (n.unshift(e), this._opts.retries && !this.flags.fromQueue && !this.flags.volatile)
      return this._addToQueue(n), this;
    const o = {
      type: Le.EVENT,
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
      type: Le.CONNECT,
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
        case Le.CONNECT:
          e.data && e.data.sid ? this.onconnect(e.data.sid, e.data.pid) : this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
          break;
        case Le.EVENT:
        case Le.BINARY_EVENT:
          this.onevent(e);
          break;
        case Le.ACK:
        case Le.BINARY_ACK:
          this.onack(e);
          break;
        case Le.DISCONNECT:
          this.ondisconnect();
          break;
        case Le.CONNECT_ERROR:
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
        type: Le.ACK,
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
function is(t) {
  t = t || {}, this.ms = t.min || 100, this.max = t.max || 1e4, this.factor = t.factor || 2, this.jitter = t.jitter > 0 && t.jitter <= 1 ? t.jitter : 0, this.attempts = 0;
}
is.prototype.duration = function() {
  var t = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var e = Math.random(), n = Math.floor(e * this.jitter * t);
    t = (Math.floor(e * 10) & 1) == 0 ? t - n : t + n;
  }
  return Math.min(t, this.max) | 0;
};
is.prototype.reset = function() {
  this.attempts = 0;
};
is.prototype.setMin = function(t) {
  this.ms = t;
};
is.prototype.setMax = function(t) {
  this.max = t;
};
is.prototype.setJitter = function(t) {
  this.jitter = t;
};
class zi extends dt {
  constructor(e, n) {
    var s;
    super(), this.nsps = {}, this.subs = [], e && typeof e == "object" && (n = e, e = void 0), n = n || {}, n.path = n.path || "/socket.io", this.opts = n, jr(this, n), this.reconnection(n.reconnection !== !1), this.reconnectionAttempts(n.reconnectionAttempts || 1 / 0), this.reconnectionDelay(n.reconnectionDelay || 1e3), this.reconnectionDelayMax(n.reconnectionDelayMax || 5e3), this.randomizationFactor((s = n.randomizationFactor) !== null && s !== void 0 ? s : 0.5), this.backoff = new is({
      min: this.reconnectionDelay(),
      max: this.reconnectionDelayMax(),
      jitter: this.randomizationFactor()
    }), this.timeout(n.timeout == null ? 2e4 : n.timeout), this._readyState = "closed", this.uri = e;
    const r = n.parser || _p;
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
    this.engine = new ip(this.uri, this.opts);
    const n = this.engine, s = this;
    this._readyState = "opening", this.skipReconnect = !1;
    const r = Yt(n, "open", function() {
      s.onopen(), e && e();
    }), i = (a) => {
      this.cleanup(), this._readyState = "closed", this.emitReserved("error", a), e ? e(a) : this.maybeReconnectOnOpen();
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
      Yt(e, "ping", this.onping.bind(this)),
      Yt(e, "data", this.ondata.bind(this)),
      Yt(e, "error", this.onerror.bind(this)),
      Yt(e, "close", this.onclose.bind(this)),
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
    qr(() => {
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
    return s ? this._autoConnect && !s.active && s.connect() : (s = new vc(this, e, n), this.nsps[e] = s), s;
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
const Ts = {};
function yr(t, e) {
  typeof t == "object" && (e = t, t = void 0), e = e || {};
  const n = op(t, e.path || "/socket.io"), s = n.source, r = n.id, i = n.path, o = Ts[r] && i in Ts[r].nsps, a = e.forceNew || e["force new connection"] || e.multiplex === !1 || o;
  let l;
  return a ? l = new zi(s, e) : (Ts[r] || (Ts[r] = new zi(s, e)), l = Ts[r]), n.query && !e.query && (e.query = n.queryKey), l.socket(n.path, e);
}
Object.assign(yr, {
  Manager: zi,
  Socket: vc,
  io: yr,
  connect: yr
});
function yp() {
  const t = ce([]), e = ce(!1), n = ce(""), s = ce(!1), r = ce(!1), i = ce(!1), o = ce("connecting"), a = ce(0), l = 5, h = ce({}), c = ce(null), b = ce("");
  let _ = null, F = null, $ = null, Y = null, Ce, ne;
  const Ee = (q) => {
    Ce = q, q && localStorage.setItem("ctid", q);
  }, ke = (q) => {
    ne = q;
  }, z = (q) => {
    const de = Ce || localStorage.getItem("ctid"), re = {};
    return de && (re.conversation_token = de), ne && (re.widget_id = ne), _ = yr(`${Cn.WS_URL}/widget`, {
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
      if (e.value = !1, j.session_id ? (console.log("Captured session_id from chat_response:", j.session_id), b.value = j.session_id) : console.warn("No session_id in chat_response data:", j), j.type === "agent_message") {
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
        j.attachments && Array.isArray(j.attachments) && (He.id = j.message_id, He.attachments = j.attachments.map((Ge, gt) => ({
          id: j.message_id * 1e3 + gt,
          filename: Ge.filename,
          file_url: Ge.file_url,
          content_type: Ge.content_type,
          file_size: Ge.file_size
        }))), t.value.push(He);
      } else j.shopify_output && typeof j.shopify_output == "object" && j.shopify_output.products ? t.value.push({
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
      }) : t.value.push({
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
      t.value.push({
        message: `${j.user_name} joined the conversation`,
        message_type: "system",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: j.session_id
      }), h.value = {
        ...h.value,
        human_agent_name: j.user_name,
        human_agent_profile_pic: j.profile_picture
      }, F && F(j);
    }), _.on("session_initialized", (j) => {
      j.session_id && (console.log("Initialized session_id from session_initialized:", j.session_id), b.value = j.session_id);
    }), _.on("error", Ve), _.on("chat_history", xe), _.on("rating_submitted", ge), _.on("display_form", Ke), _.on("form_submitted", Qe), _.on("workflow_state", at), _.on("workflow_proceeded", ae), _;
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
    F = q;
  }, Pe = (q) => {
    $ = q;
  }, rt = (q) => {
    Y = q;
  }, Ve = (q) => {
    e.value = !1, n.value = ph(q), s.value = !0, setTimeout(() => {
      s.value = !1, n.value = "";
    }, 5e3);
  }, xe = (q) => {
    if (q.type === "chat_history" && Array.isArray(q.messages)) {
      const de = q.messages.map((re) => {
        var He, Ge;
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
        return Array.isArray((He = re.attributes) == null ? void 0 : He.sources) && re.attributes.sources.length && (j.sources = re.attributes.sources), (Ge = re.attributes) != null && Ge.shopify_output && typeof re.attributes.shopify_output == "object" ? {
          ...j,
          message_type: "product",
          shopify_output: re.attributes.shopify_output
        } : j;
      });
      t.value = [
        ...de.filter(
          (re) => !t.value.some(
            (j) => j.message === re.message && j.created_at === re.created_at
          )
        ),
        ...t.value
      ];
    }
  }, ge = (q) => {
    q.success && t.value.push({
      message: "Thank you for your feedback!",
      message_type: "system",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: ""
    });
  }, Ke = (q) => {
    var de;
    console.log("Form display handler in composable:", q), e.value = !1, c.value = q.form_data, console.log("Set currentForm in handleDisplayForm:", c.value), ((de = q.form_data) == null ? void 0 : de.form_full_screen) === !0 ? (console.log("Full screen form detected, triggering workflow state callback"), $ && $({
      type: "form",
      form_data: q.form_data,
      session_id: q.session_id
    })) : t.value.push({
      message: "",
      message_type: "form",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: q.session_id,
      attributes: {
        form_data: q.form_data
      }
    });
  }, Qe = (q) => {
    console.log("Form submitted confirmation received, clearing currentForm"), c.value = null, q.success && console.log("Form submitted successfully");
  }, at = (q) => {
    console.log("Workflow state received in composable:", q), (q.type === "form" || q.type === "display_form") && (console.log("Setting currentForm from workflow state:", q.form_data), c.value = q.form_data), $ && $(q);
  }, ae = (q) => {
    console.log("Workflow proceeded in composable:", q), Y && Y(q);
  };
  return {
    messages: t,
    loading: e,
    errorMessage: n,
    showError: s,
    loadingHistory: r,
    hasStartedChat: i,
    connectionStatus: o,
    sendMessage: async (q, de, re = []) => {
      if (!_ || !q.trim() && re.length === 0) return;
      h.value.human_agent_name || (e.value = !0);
      const j = {
        message: q,
        message_type: "user",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: ""
      };
      re.length > 0 && (j.attachments = re.map((He, Ge) => {
        let gt = "";
        if (He.content_type.startsWith("image/")) {
          const It = atob(He.content), d = new Array(It.length);
          for (let L = 0; L < It.length; L++)
            d[L] = It.charCodeAt(L);
          const v = new Uint8Array(d), k = new Blob([v], { type: He.content_type });
          gt = URL.createObjectURL(k);
        }
        return {
          id: Date.now() * 1e3 + Ge,
          // Temporary ID
          filename: He.filename,
          file_url: gt,
          // Temporary blob URL, will be replaced
          content_type: He.content_type,
          file_size: He.size,
          _isTemporary: !0
          // Flag to identify temporary attachments
        };
      })), t.value.push(j), _.emit("chat", {
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
      _ && (_.removeAllListeners(), _.disconnect(), _ = null), F = null, $ = null, Y = null;
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
    currentSessionId: b,
    setToken: Ee,
    setWidgetId: ke
  };
}
function bp(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var mi = { exports: {} }, Ba;
function wp() {
  return Ba || (Ba = 1, function(t) {
    (function() {
      function e(u, y, A) {
        return u.call.apply(u.bind, arguments);
      }
      function n(u, y, A) {
        if (!u) throw Error();
        if (2 < arguments.length) {
          var x = Array.prototype.slice.call(arguments, 2);
          return function() {
            var N = Array.prototype.slice.call(arguments);
            return Array.prototype.unshift.apply(N, x), u.apply(y, N);
          };
        }
        return function() {
          return u.apply(y, arguments);
        };
      }
      function s(u, y, A) {
        return s = Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1 ? e : n, s.apply(null, arguments);
      }
      var r = Date.now || function() {
        return +/* @__PURE__ */ new Date();
      };
      function i(u, y) {
        this.a = u, this.o = y || u, this.c = this.o.document;
      }
      var o = !!window.FontFace;
      function a(u, y, A, x) {
        if (y = u.c.createElement(y), A) for (var N in A) A.hasOwnProperty(N) && (N == "style" ? y.style.cssText = A[N] : y.setAttribute(N, A[N]));
        return x && y.appendChild(u.c.createTextNode(x)), y;
      }
      function l(u, y, A) {
        u = u.c.getElementsByTagName(y)[0], u || (u = document.documentElement), u.insertBefore(A, u.lastChild);
      }
      function h(u) {
        u.parentNode && u.parentNode.removeChild(u);
      }
      function c(u, y, A) {
        y = y || [], A = A || [];
        for (var x = u.className.split(/\s+/), N = 0; N < y.length; N += 1) {
          for (var G = !1, te = 0; te < x.length; te += 1) if (y[N] === x[te]) {
            G = !0;
            break;
          }
          G || x.push(y[N]);
        }
        for (y = [], N = 0; N < x.length; N += 1) {
          for (G = !1, te = 0; te < A.length; te += 1) if (x[N] === A[te]) {
            G = !0;
            break;
          }
          G || y.push(x[N]);
        }
        u.className = y.join(" ").replace(/\s+/g, " ").replace(/^\s+|\s+$/, "");
      }
      function b(u, y) {
        for (var A = u.className.split(/\s+/), x = 0, N = A.length; x < N; x++) if (A[x] == y) return !0;
        return !1;
      }
      function _(u) {
        return u.o.location.hostname || u.a.location.hostname;
      }
      function F(u, y, A) {
        function x() {
          ye && N && G && (ye(te), ye = null);
        }
        y = a(u, "link", { rel: "stylesheet", href: y, media: "all" });
        var N = !1, G = !0, te = null, ye = A || null;
        o ? (y.onload = function() {
          N = !0, x();
        }, y.onerror = function() {
          N = !0, te = Error("Stylesheet failed to load"), x();
        }) : setTimeout(function() {
          N = !0, x();
        }, 0), l(u, "head", y);
      }
      function $(u, y, A, x) {
        var N = u.c.getElementsByTagName("head")[0];
        if (N) {
          var G = a(u, "script", { src: y }), te = !1;
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
      function Ce(u) {
        return u.a++, function() {
          u.a--, Ee(u);
        };
      }
      function ne(u, y) {
        u.c = y, Ee(u);
      }
      function Ee(u) {
        u.a == 0 && u.c && (u.c(), u.c = null);
      }
      function ke(u) {
        this.a = u || "-";
      }
      ke.prototype.c = function(u) {
        for (var y = [], A = 0; A < arguments.length; A++) y.push(arguments[A].replace(/[\W_]+/g, "").toLowerCase());
        return y.join(this.a);
      };
      function z(u, y) {
        this.c = u, this.f = 4, this.a = "n";
        var A = (y || "n4").match(/^([nio])([1-9])$/i);
        A && (this.a = A[1], this.f = parseInt(A[2], 10));
      }
      function W(u) {
        return Pe(u) + " " + (u.f + "00") + " 300px " + ee(u.c);
      }
      function ee(u) {
        var y = [];
        u = u.split(/,\s*/);
        for (var A = 0; A < u.length; A++) {
          var x = u[A].replace(/['"]/g, "");
          x.indexOf(" ") != -1 || /^\d/.test(x) ? y.push("'" + x + "'") : y.push(x);
        }
        return y.join(",");
      }
      function V(u) {
        return u.a + u.f;
      }
      function Pe(u) {
        var y = "normal";
        return u.a === "o" ? y = "oblique" : u.a === "i" && (y = "italic"), y;
      }
      function rt(u) {
        var y = 4, A = "n", x = null;
        return u && ((x = u.match(/(normal|oblique|italic)/i)) && x[1] && (A = x[1].substr(0, 1).toLowerCase()), (x = u.match(/([1-9]00|normal|bold)/i)) && x[1] && (/bold/i.test(x[1]) ? y = 7 : /[1-9]00/.test(x[1]) && (y = parseInt(x[1].substr(0, 1), 10)))), A + y;
      }
      function Ve(u, y) {
        this.c = u, this.f = u.o.document.documentElement, this.h = y, this.a = new ke("-"), this.j = y.events !== !1, this.g = y.classes !== !1;
      }
      function xe(u) {
        u.g && c(u.f, [u.a.c("wf", "loading")]), Ke(u, "loading");
      }
      function ge(u) {
        if (u.g) {
          var y = b(u.f, u.a.c("wf", "active")), A = [], x = [u.a.c("wf", "loading")];
          y || A.push(u.a.c("wf", "inactive")), c(u.f, A, x);
        }
        Ke(u, "inactive");
      }
      function Ke(u, y, A) {
        u.j && u.h[y] && (A ? u.h[y](A.c, V(A)) : u.h[y]());
      }
      function Qe() {
        this.c = {};
      }
      function at(u, y, A) {
        var x = [], N;
        for (N in y) if (y.hasOwnProperty(N)) {
          var G = u.c[N];
          G && x.push(G(y[N], A));
        }
        return x;
      }
      function ae(u, y) {
        this.c = u, this.f = y, this.a = a(this.c, "span", { "aria-hidden": "true" }, this.f);
      }
      function me(u) {
        l(u.c, "body", u.a);
      }
      function le(u) {
        return "display:block;position:absolute;top:-9999px;left:-9999px;font-size:300px;width:auto;height:auto;line-height:normal;margin:0;padding:0;font-variant:normal;white-space:nowrap;font-family:" + ee(u.c) + ";" + ("font-style:" + Pe(u) + ";font-weight:" + (u.f + "00") + ";");
      }
      function ut(u, y, A, x, N, G) {
        this.g = u, this.j = y, this.a = x, this.c = A, this.f = N || 3e3, this.h = G || void 0;
      }
      ut.prototype.start = function() {
        var u = this.c.o.document, y = this, A = r(), x = new Promise(function(te, ye) {
          function Ae() {
            r() - A >= y.f ? ye() : u.fonts.load(W(y.a), y.h).then(function(Ye) {
              1 <= Ye.length ? te() : setTimeout(Ae, 25);
            }, function() {
              ye();
            });
          }
          Ae();
        }), N = null, G = new Promise(function(te, ye) {
          N = setTimeout(ye, y.f);
        });
        Promise.race([G, x]).then(function() {
          N && (clearTimeout(N), N = null), y.g(y.a);
        }, function() {
          y.j(y.a);
        });
      };
      function it(u, y, A, x, N, G, te) {
        this.v = u, this.B = y, this.c = A, this.a = x, this.s = te || "BESbswy", this.f = {}, this.w = N || 3e3, this.u = G || null, this.m = this.j = this.h = this.g = null, this.g = new ae(this.c, this.s), this.h = new ae(this.c, this.s), this.j = new ae(this.c, this.s), this.m = new ae(this.c, this.s), u = new z(this.a.c + ",serif", V(this.a)), u = le(u), this.g.a.style.cssText = u, u = new z(this.a.c + ",sans-serif", V(this.a)), u = le(u), this.h.a.style.cssText = u, u = new z("serif", V(this.a)), u = le(u), this.j.a.style.cssText = u, u = new z("sans-serif", V(this.a)), u = le(u), this.m.a.style.cssText = u, me(this.g), me(this.h), me(this.j), me(this.m);
      }
      var ie = { D: "serif", C: "sans-serif" }, nt = null;
      function ve() {
        if (nt === null) {
          var u = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent);
          nt = !!u && (536 > parseInt(u[1], 10) || parseInt(u[1], 10) === 536 && 11 >= parseInt(u[2], 10));
        }
        return nt;
      }
      it.prototype.start = function() {
        this.f.serif = this.j.a.offsetWidth, this.f["sans-serif"] = this.m.a.offsetWidth, this.A = r(), de(this);
      };
      function q(u, y, A) {
        for (var x in ie) if (ie.hasOwnProperty(x) && y === u.f[ie[x]] && A === u.f[ie[x]]) return !0;
        return !1;
      }
      function de(u) {
        var y = u.g.a.offsetWidth, A = u.h.a.offsetWidth, x;
        (x = y === u.f.serif && A === u.f["sans-serif"]) || (x = ve() && q(u, y, A)), x ? r() - u.A >= u.w ? ve() && q(u, y, A) && (u.u === null || u.u.hasOwnProperty(u.a.c)) ? j(u, u.v) : j(u, u.B) : re(u) : j(u, u.v);
      }
      function re(u) {
        setTimeout(s(function() {
          de(this);
        }, u), 50);
      }
      function j(u, y) {
        setTimeout(s(function() {
          h(this.g.a), h(this.h.a), h(this.j.a), h(this.m.a), y(this.a);
        }, u), 0);
      }
      function He(u, y, A) {
        this.c = u, this.a = y, this.f = 0, this.m = this.j = !1, this.s = A;
      }
      var Ge = null;
      He.prototype.g = function(u) {
        var y = this.a;
        y.g && c(y.f, [y.a.c("wf", u.c, V(u).toString(), "active")], [y.a.c("wf", u.c, V(u).toString(), "loading"), y.a.c("wf", u.c, V(u).toString(), "inactive")]), Ke(y, "fontactive", u), this.m = !0, gt(this);
      }, He.prototype.h = function(u) {
        var y = this.a;
        if (y.g) {
          var A = b(y.f, y.a.c("wf", u.c, V(u).toString(), "active")), x = [], N = [y.a.c("wf", u.c, V(u).toString(), "loading")];
          A || x.push(y.a.c("wf", u.c, V(u).toString(), "inactive")), c(y.f, x, N);
        }
        Ke(y, "fontinactive", u), gt(this);
      };
      function gt(u) {
        --u.f == 0 && u.j && (u.m ? (u = u.a, u.g && c(u.f, [u.a.c("wf", "active")], [u.a.c("wf", "loading"), u.a.c("wf", "inactive")]), Ke(u, "active")) : ge(u.a));
      }
      function It(u) {
        this.j = u, this.a = new Qe(), this.h = 0, this.f = this.g = !0;
      }
      It.prototype.load = function(u) {
        this.c = new i(this.j, u.context || this.j), this.g = u.events !== !1, this.f = u.classes !== !1, v(this, new Ve(this.c, u), u);
      };
      function d(u, y, A, x, N) {
        var G = --u.h == 0;
        (u.f || u.g) && setTimeout(function() {
          var te = N || null, ye = x || null || {};
          if (A.length === 0 && G) ge(y.a);
          else {
            y.f += A.length, G && (y.j = G);
            var Ae, Ye = [];
            for (Ae = 0; Ae < A.length; Ae++) {
              var Ne = A[Ae], ht = ye[Ne.c], yt = y.a, qe = Ne;
              if (yt.g && c(yt.f, [yt.a.c("wf", qe.c, V(qe).toString(), "loading")]), Ke(yt, "fontloading", qe), yt = null, Ge === null) if (window.FontFace) {
                var qe = /Gecko.*Firefox\/(\d+)/.exec(window.navigator.userAgent), Zt = /OS X.*Version\/10\..*Safari/.exec(window.navigator.userAgent) && /Apple/.exec(window.navigator.vendor);
                Ge = qe ? 42 < parseInt(qe[1], 10) : !Zt;
              } else Ge = !1;
              Ge ? yt = new ut(s(y.g, y), s(y.h, y), y.c, Ne, y.s, ht) : yt = new it(s(y.g, y), s(y.h, y), y.c, Ne, y.s, te, ht), Ye.push(yt);
            }
            for (Ae = 0; Ae < Ye.length; Ae++) Ye[Ae].start();
          }
        }, 0);
      }
      function v(u, y, A) {
        var N = [], x = A.timeout;
        xe(y);
        var N = at(u.a, A, u.c), G = new He(u.c, y, x);
        for (u.h = N.length, y = 0, A = N.length; y < A; y++) N[y].load(function(te, ye, Ae) {
          d(u, G, te, ye, Ae);
        });
      }
      function k(u, y) {
        this.c = u, this.a = y;
      }
      k.prototype.load = function(u) {
        function y() {
          if (G["__mti_fntLst" + x]) {
            var te = G["__mti_fntLst" + x](), ye = [], Ae;
            if (te) for (var Ye = 0; Ye < te.length; Ye++) {
              var Ne = te[Ye].fontfamily;
              te[Ye].fontStyle != null && te[Ye].fontWeight != null ? (Ae = te[Ye].fontStyle + te[Ye].fontWeight, ye.push(new z(Ne, Ae))) : ye.push(new z(Ne));
            }
            u(ye);
          } else setTimeout(function() {
            y();
          }, 50);
        }
        var A = this, x = A.a.projectId, N = A.a.version;
        if (x) {
          var G = A.c.o;
          $(this.c, (A.a.api || "https://fast.fonts.net/jsapi") + "/" + x + ".js" + (N ? "?v=" + N : ""), function(te) {
            te ? u([]) : (G["__MonotypeConfiguration__" + x] = function() {
              return A.a;
            }, y());
          }).id = "__MonotypeAPIScript__" + x;
        } else u([]);
      };
      function L(u, y) {
        this.c = u, this.a = y;
      }
      L.prototype.load = function(u) {
        var y, A, x = this.a.urls || [], N = this.a.families || [], G = this.a.testStrings || {}, te = new Y();
        for (y = 0, A = x.length; y < A; y++) F(this.c, x[y], Ce(te));
        var ye = [];
        for (y = 0, A = N.length; y < A; y++) if (x = N[y].split(":"), x[1]) for (var Ae = x[1].split(","), Ye = 0; Ye < Ae.length; Ye += 1) ye.push(new z(x[0], Ae[Ye]));
        else ye.push(new z(x[0]));
        ne(te, function() {
          u(ye, G);
        });
      };
      function R(u, y) {
        u ? this.c = u : this.c = I, this.a = [], this.f = [], this.g = y || "";
      }
      var I = "https://fonts.googleapis.com/css";
      function B(u, y) {
        for (var A = y.length, x = 0; x < A; x++) {
          var N = y[x].split(":");
          N.length == 3 && u.f.push(N.pop());
          var G = "";
          N.length == 2 && N[1] != "" && (G = ":"), u.a.push(N.join(G));
        }
      }
      function D(u) {
        if (u.a.length == 0) throw Error("No fonts to load!");
        if (u.c.indexOf("kit=") != -1) return u.c;
        for (var y = u.a.length, A = [], x = 0; x < y; x++) A.push(u.a[x].replace(/ /g, "+"));
        return y = u.c + "?family=" + A.join("%7C"), 0 < u.f.length && (y += "&subset=" + u.f.join(",")), 0 < u.g.length && (y += "&text=" + encodeURIComponent(u.g)), y;
      }
      function M(u) {
        this.f = u, this.a = [], this.c = {};
      }
      var P = { latin: "BESbswy", "latin-ext": "çöüğş", cyrillic: "йяЖ", greek: "αβΣ", khmer: "កខគ", Hanuman: "កខគ" }, X = { thin: "1", extralight: "2", "extra-light": "2", ultralight: "2", "ultra-light": "2", light: "3", regular: "4", book: "4", medium: "5", "semi-bold": "6", semibold: "6", "demi-bold": "6", demibold: "6", bold: "7", "extra-bold": "8", extrabold: "8", "ultra-bold": "8", ultrabold: "8", black: "9", heavy: "9", l: "3", r: "4", b: "7" }, U = { i: "i", italic: "i", n: "n", normal: "n" }, K = /^(thin|(?:(?:extra|ultra)-?)?light|regular|book|medium|(?:(?:semi|demi|extra|ultra)-?)?bold|black|heavy|l|r|b|[1-9]00)?(n|i|normal|italic)?$/;
      function Q(u) {
        for (var y = u.f.length, A = 0; A < y; A++) {
          var x = u.f[A].split(":"), N = x[0].replace(/\+/g, " "), G = ["n4"];
          if (2 <= x.length) {
            var te, ye = x[1];
            if (te = [], ye) for (var ye = ye.split(","), Ae = ye.length, Ye = 0; Ye < Ae; Ye++) {
              var Ne;
              if (Ne = ye[Ye], Ne.match(/^[\w-]+$/)) {
                var ht = K.exec(Ne.toLowerCase());
                if (ht == null) Ne = "";
                else {
                  if (Ne = ht[2], Ne = Ne == null || Ne == "" ? "n" : U[Ne], ht = ht[1], ht == null || ht == "") ht = "4";
                  else var yt = X[ht], ht = yt || (isNaN(ht) ? "4" : ht.substr(0, 1));
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
      function ue(u, y) {
        this.c = u, this.a = y;
      }
      var Re = { Arimo: !0, Cousine: !0, Tinos: !0 };
      ue.prototype.load = function(u) {
        var y = new Y(), A = this.c, x = new R(this.a.api, this.a.text), N = this.a.families;
        B(x, N);
        var G = new M(N);
        Q(G), F(A, D(x), Ce(y)), ne(y, function() {
          u(G.a, G.c, Re);
        });
      };
      function pe(u, y) {
        this.c = u, this.a = y;
      }
      pe.prototype.load = function(u) {
        var y = this.a.id, A = this.c.o;
        y ? $(this.c, (this.a.api || "https://use.typekit.net") + "/" + y + ".js", function(x) {
          if (x) u([]);
          else if (A.Typekit && A.Typekit.config && A.Typekit.config.fn) {
            x = A.Typekit.config.fn;
            for (var N = [], G = 0; G < x.length; G += 2) for (var te = x[G], ye = x[G + 1], Ae = 0; Ae < ye.length; Ae++) N.push(new z(te, ye[Ae]));
            try {
              A.Typekit.load({ events: !1, classes: !1, async: !0 });
            } catch {
            }
            u(N);
          }
        }, 2e3) : u([]);
      };
      function ze(u, y) {
        this.c = u, this.f = y, this.a = [];
      }
      ze.prototype.load = function(u) {
        var y = this.f.id, A = this.c.o, x = this;
        y ? (A.__webfontfontdeckmodule__ || (A.__webfontfontdeckmodule__ = {}), A.__webfontfontdeckmodule__[y] = function(N, G) {
          for (var te = 0, ye = G.fonts.length; te < ye; ++te) {
            var Ae = G.fonts[te];
            x.a.push(new z(Ae.name, rt("font-weight:" + Ae.weight + ";font-style:" + Ae.style)));
          }
          u(x.a);
        }, $(this.c, (this.f.api || "https://f.fontdeck.com/s/css/js/") + _(this.c) + "/" + y + ".js", function(N) {
          N && u([]);
        })) : u([]);
      };
      var Me = new It(window);
      Me.a.c.custom = function(u, y) {
        return new L(y, u);
      }, Me.a.c.fontdeck = function(u, y) {
        return new ze(y, u);
      }, Me.a.c.monotype = function(u, y) {
        return new k(y, u);
      }, Me.a.c.typekit = function(u, y) {
        return new pe(y, u);
      }, Me.a.c.google = function(u, y) {
        return new ue(y, u);
      };
      var We = { load: s(Me.load, Me) };
      t.exports ? t.exports = We : (window.WebFont = We, window.WebFontConfig && Me.load(window.WebFontConfig));
    })();
  }(mi)), mi.exports;
}
var kp = wp();
const xp = /* @__PURE__ */ bp(kp), $a = [
  "Space Grotesk:400,500,600,700",
  "Instrument Sans:400,500,600",
  "JetBrains Mono:400,500,600"
], Ap = (t) => {
  const e = [...$a], n = (t == null ? void 0 : t.split(",")[0].trim().replace(/['"]/g, "")) || "", s = $a.some(
    (r) => r.toLowerCase().startsWith(n.toLowerCase())
  );
  n && !s && e.push(n), xp.load({
    google: { families: e },
    active: () => {
      if (!t) return;
      const r = document.querySelector(".chat-container");
      r && (r.style.fontFamily = t.includes(",") ? t : `"${t}", system-ui, sans-serif`);
    }
  });
};
function Tp() {
  const t = ce({}), e = ce(""), n = (r) => {
    t.value = r, r.photo_url && (t.value.photo_url = r.photo_url), Ap(r.font_family), window.parent.postMessage({
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
const Sp = 13, Ep = 24;
function Cp(t, e) {
  const n = Mr({}), s = [];
  let r = null;
  const i = typeof window < "u" && typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, o = (c) => {
    r || s.length === 0 || (r = setTimeout(a, c));
  }, a = () => {
    r = null;
    const c = s[0];
    if (c === void 0) return;
    const b = t.value[c], _ = n[c], F = (b == null ? void 0 : b.message) ?? "";
    if (!_ || !b) {
      s.shift(), o(0);
      return;
    }
    if (_.shown >= F.length) {
      _.done = !0, s.shift(), o(0);
      return;
    }
    _.shown += 1;
    const $ = F[_.shown - 1];
    e == null || e(), o($ === " " ? Ep : Sp);
  };
  mn(() => t.value.length, (c, b) => {
    b !== void 0 && c < b && (Object.keys(n).forEach((_) => {
      delete n[Number(_)];
    }), s.length = 0);
    for (let _ = b ?? 0; _ < c; _++) {
      const F = t.value[_];
      if (!F || !F.stream || _ in n) continue;
      const $ = F.message ?? "";
      i || !$ ? n[_] = { shown: $.length, done: !0 } : (n[_] = { shown: 0, done: !1 }, s.push(_));
    }
    o(0);
  });
  const l = (c, b) => {
    const _ = n[c];
    return _ ? b.slice(0, _.shown) : b;
  }, h = (c) => {
    const b = n[c];
    return !!b && !b.done;
  };
  return js(() => {
    r && clearTimeout(r);
  }), { displayText: l, isStreaming: h };
}
function Rp(t) {
  const e = ce(!0);
  let n = 0;
  const s = () => {
    window.parent.postMessage({ type: "UNREAD_COUNT", count: n }, "*");
  }, r = (i) => {
    var o;
    ((o = i == null ? void 0 : i.data) == null ? void 0 : o.type) === "WIDGET_VISIBILITY" && (e.value = !!i.data.open, e.value && n !== 0 && (n = 0, s()));
  };
  mn(() => t.value.length, (i, o) => {
    if (i <= (o ?? 0) || e.value) return;
    const a = t.value[i - 1];
    a && (a.message_type === "bot" || a.message_type === "agent") && (n += 1, s());
  }), to(() => window.addEventListener("message", r)), js(() => window.removeEventListener("message", r));
}
const Ip = {
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
}, Lp = {
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
}, Op = {
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
}, Pp = {
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
}, Np = {
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
}, br = {
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
}, Fp = {
  GLASS: Ip,
  AURORA: Lp,
  TERMINAL: Op,
  CALM_MINT: Pp,
  PLAYFUL: Np,
  SUNRISE: br,
  CHATBOT: br,
  ASK_ANYTHING: br
}, Mp = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", Ua = "'Instrument Sans', system-ui, -apple-system, 'Segoe UI', sans-serif";
function Dp(t) {
  return Math.max(4, Math.round(t * 0.3));
}
function Bp(t) {
  const e = (t || "").replace("#", "");
  if (e.length < 6) return "#0B0C10";
  const n = parseInt(e.slice(0, 2), 16), s = parseInt(e.slice(2, 4), 16), r = parseInt(e.slice(4, 6), 16);
  return (0.299 * n + 0.587 * s + 0.114 * r) / 255 > 0.62 ? "#0B0C10" : "#FFFFFF";
}
function $p(t) {
  return Fp[t || ""] || br;
}
const Up = "#212529";
function zp(t, e) {
  const n = $p(t), s = (e == null ? void 0 : e.chat_background_color) || "", r = /^#[0-9a-fA-F]{6}$/.test(s), i = s || n.card, o = (e == null ? void 0 : e.chat_text_color) || "", l = /^#[0-9a-fA-F]{6}$/.test(o) && o.toLowerCase() !== Up ? o : r ? Ws(s) ? "#FFFFFF" : "#111111" : n.text, h = r ? Ws(s) ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)" : n.muted, c = r ? dh(s, 20) : n.agentBg, b = (e == null ? void 0 : e.accent_color) || n.accent, _ = n.mono ? Mp : e != null && e.font_family ? `${e.font_family}, ${Ua}` : Ua;
  return {
    "--cm-card": i,
    "--cm-text": l,
    "--cm-muted": h,
    "--cm-agent-bg": c,
    "--cm-accent": b,
    "--cm-on-accent": Bp(b),
    "--cm-border": n.border,
    "--cm-glow": n.glow,
    "--cm-radius": `${n.radius}px`,
    "--cm-bubble": `${n.bubble}px`,
    "--cm-bubble-tail": `${Dp(n.bubble)}px`,
    "--cm-field-radius": n.mono ? "7px" : "12px",
    "--cm-avatar-radius": n.mono ? "28%" : "50%",
    "--cm-hairline": n.light ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.08)",
    "--cm-body-font": _
  };
}
function Hp() {
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
const Wp = {
  key: 0,
  class: "widget-unavailable-overlay"
}, qp = {
  key: 1,
  class: "auth-error-overlay"
}, jp = { class: "auth-error-card" }, Vp = { class: "auth-error-message" }, Kp = {
  key: 0,
  class: "initializing-overlay"
}, Gp = {
  key: 0,
  class: "connecting-message"
}, Yp = {
  key: 1,
  class: "failed-message"
}, Xp = { class: "welcome-content" }, Zp = { class: "welcome-header" }, Jp = ["src", "alt"], Qp = { class: "welcome-title" }, eg = { class: "welcome-subtitle" }, tg = { class: "welcome-input-container" }, ng = {
  key: 0,
  class: "email-input"
}, sg = ["disabled"], rg = { class: "welcome-message-input" }, ig = ["placeholder", "disabled"], og = ["disabled"], ag = {
  key: 0,
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, lg = {
  key: 1,
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, cg = { class: "landing-page-content" }, ug = { class: "landing-page-header" }, fg = { class: "landing-page-heading" }, hg = { class: "landing-page-text" }, dg = { class: "landing-page-actions" }, pg = { class: "form-fullscreen-content" }, gg = {
  key: 0,
  class: "form-header"
}, mg = {
  key: 0,
  class: "form-title"
}, _g = {
  key: 1,
  class: "form-description"
}, vg = { class: "form-fields" }, yg = ["for"], bg = {
  key: 0,
  class: "required-indicator"
}, wg = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "autocomplete", "inputmode"], kg = ["id", "placeholder", "required", "min", "max", "value", "onInput"], xg = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput"], Ag = ["id", "required", "value", "onChange"], Tg = { value: "" }, Sg = ["value"], Eg = {
  key: 4,
  class: "checkbox-field"
}, Cg = ["id", "required", "checked", "onChange"], Rg = { class: "checkbox-label" }, Ig = {
  key: 5,
  class: "radio-group"
}, Lg = ["name", "value", "required", "checked", "onChange"], Og = { class: "radio-label" }, Pg = {
  key: 6,
  class: "field-error"
}, Ng = { class: "form-actions" }, Fg = ["disabled"], Mg = {
  key: 0,
  class: "loading-spinner-inline"
}, Dg = { key: 1 }, Bg = { class: "header-content" }, $g = ["src", "alt"], Ug = { class: "header-info" }, zg = { class: "ask-anything-header" }, Hg = ["src", "alt"], Wg = { class: "header-info" }, qg = {
  key: 2,
  class: "loading-history"
}, jg = { class: "cm-email-gate-title" }, Vg = ["disabled"], Kg = {
  key: 0,
  class: "cm-email-gate-error"
}, Gg = ["disabled"], Yg = {
  key: 0,
  class: "cm-welcome-block"
}, Xg = { class: "message agent-message cm-welcome-row" }, Zg = ["src", "alt"], Jg = {
  key: 0,
  class: "cm-msg-avatar",
  "aria-hidden": "true"
}, Qg = ["src"], em = ["src"], tm = {
  key: 0,
  class: "rating-content"
}, nm = { class: "rating-prompt" }, sm = ["onMouseover", "onMouseleave", "onClick", "disabled"], rm = {
  key: 0,
  class: "feedback-wrapper"
}, im = { class: "feedback-section" }, om = ["onUpdate:modelValue", "disabled"], am = { class: "feedback-counter" }, lm = ["onClick", "disabled"], cm = {
  key: 1,
  class: "submitted-feedback-wrapper"
}, um = { class: "submitted-feedback" }, fm = { class: "submitted-feedback-text" }, hm = {
  key: 2,
  class: "submitted-message"
}, dm = {
  key: 1,
  class: "form-content"
}, pm = {
  key: 0,
  class: "form-header"
}, gm = {
  key: 0,
  class: "form-title"
}, mm = {
  key: 1,
  class: "form-description"
}, _m = { class: "form-fields" }, vm = ["for"], ym = {
  key: 0,
  class: "required-indicator"
}, bm = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "disabled", "autocomplete", "inputmode"], wm = ["id", "placeholder", "required", "min", "max", "value", "onInput", "disabled"], km = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "disabled"], xm = ["id", "required", "value", "onChange", "disabled"], Am = { value: "" }, Tm = ["value"], Sm = {
  key: 4,
  class: "checkbox-field"
}, Em = ["id", "checked", "onChange", "disabled"], Cm = ["for"], Rm = {
  key: 5,
  class: "radio-field"
}, Im = ["id", "name", "value", "checked", "onChange", "disabled"], Lm = ["for"], Om = {
  key: 6,
  class: "field-error"
}, Pm = { class: "form-actions" }, Nm = ["onClick", "disabled"], Fm = {
  key: 2,
  class: "user-input-content"
}, Mm = {
  key: 0,
  class: "user-input-prompt"
}, Dm = {
  key: 1,
  class: "user-input-form"
}, Bm = ["onUpdate:modelValue", "onKeydown"], $m = ["onClick", "disabled"], Um = {
  key: 2,
  class: "user-input-submitted"
}, zm = {
  key: 0,
  class: "user-input-confirmation"
}, Hm = {
  key: 3,
  class: "product-message-container"
}, Wm = ["innerHTML"], qm = {
  key: 1,
  class: "products-carousel"
}, jm = { class: "carousel-items" }, Vm = {
  key: 0,
  class: "product-image-compact"
}, Km = ["src", "alt"], Gm = { class: "product-info-compact" }, Ym = { class: "product-text-area" }, Xm = { class: "product-title-compact" }, Zm = {
  key: 0,
  class: "product-variant-compact"
}, Jm = { class: "product-price-compact" }, Qm = { class: "product-actions-compact" }, e_ = ["onClick"], t_ = {
  key: 2,
  class: "no-products-message"
}, n_ = {
  key: 3,
  class: "no-products-message"
}, s_ = {
  key: 0,
  class: "message-streaming"
}, r_ = ["innerHTML"], i_ = {
  key: 2,
  class: "message-attachments"
}, o_ = {
  key: 0,
  class: "attachment-image-container"
}, a_ = ["src", "alt", "onClick"], l_ = { class: "attachment-image-info" }, c_ = ["href"], u_ = { class: "attachment-size" }, f_ = ["href"], h_ = { class: "attachment-size" }, d_ = {
  key: 1,
  class: "citation-chips"
}, p_ = ["title"], g_ = { class: "message-info" }, m_ = {
  key: 0,
  class: "agent-name"
}, __ = {
  key: 4,
  class: "cm-quick-actions-bar"
}, v_ = ["disabled", "onClick"], y_ = {
  key: 0,
  class: "file-previews-widget"
}, b_ = {
  class: "file-preview-content-widget",
  style: { cursor: "pointer" }
}, w_ = ["src", "alt", "onClick"], k_ = ["onClick"], x_ = { class: "file-preview-info-widget" }, A_ = { class: "file-preview-name-widget" }, T_ = { class: "file-preview-size-widget" }, S_ = ["onClick"], E_ = {
  key: 1,
  class: "upload-progress-widget"
}, C_ = { class: "message-input" }, R_ = ["placeholder", "disabled"], I_ = ["disabled", "title"], L_ = ["disabled"], O_ = {
  key: 6,
  class: "new-conversation-section"
}, P_ = { class: "conversation-ended-message" }, N_ = {
  key: 7,
  class: "rating-dialog"
}, F_ = { class: "rating-content" }, M_ = { class: "star-rating" }, D_ = ["onClick"], B_ = { class: "rating-actions" }, $_ = ["disabled"], U_ = {
  key: 0,
  class: "preview-modal-image-container"
}, z_ = ["src", "alt"], H_ = { class: "preview-modal-filename" }, W_ = {
  key: 3,
  class: "widget-loading"
}, Ss = "ctid", za = 3, q_ = "image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls", j_ = /* @__PURE__ */ Fu({
  __name: "WidgetBuilder",
  props: {
    widgetId: {},
    token: {},
    initialAuthError: {}
  },
  setup(t) {
    var Lo;
    Oe.setOptions({
      renderer: new Oe.Renderer(),
      gfm: !0,
      breaks: !0
    });
    const e = new Oe.Renderer(), n = e.link;
    e.link = (p, g, f) => n.call(e, p, g, f).replace(/^<a /, '<a target="_blank" rel="nofollow" '), Oe.use({ renderer: e });
    const s = (p) => vd(Oe(p, { renderer: e })), r = t, i = Ie(() => {
      var p;
      return r.widgetId || ((p = window.__INITIAL_DATA__) == null ? void 0 : p.widgetId);
    }), {
      customization: o,
      agentName: a,
      applyCustomization: l,
      initializeFromData: h
    } = Tp(), { formatCurrency: c } = Hp(), {
      messages: b,
      loading: _,
      errorMessage: F,
      showError: $,
      loadingHistory: Y,
      hasStartedChat: Ce,
      connectionStatus: ne,
      sendMessage: Ee,
      loadChatHistory: ke,
      connect: z,
      reconnect: W,
      cleanup: ee,
      humanAgent: V,
      onTakeover: Pe,
      submitRating: rt,
      submitForm: Ve,
      currentForm: xe,
      getWorkflowState: ge,
      proceedWorkflow: Ke,
      onWorkflowState: Qe,
      onWorkflowProceeded: at,
      currentSessionId: ae,
      setToken: me,
      setWidgetId: le
    } = yp(), { displayText: ut, isStreaming: it } = Cp(b, () => Ai(() => Lt()));
    Rp(b);
    const ie = ce(""), nt = ce(!0), ve = ce(""), q = ce(!1), de = (p) => {
      const g = p.target;
      ie.value = g.value;
    };
    let re = null;
    const j = () => {
      re && re.disconnect(), re = new MutationObserver((g) => {
        let f = !1, J = !1;
        g.forEach((be) => {
          if (be.type === "childList") {
            const fe = Array.from(be.addedNodes).some(
              (we) => {
                var Vt;
                return we.nodeType === Node.ELEMENT_NODE && (we.matches("input, textarea") || ((Vt = we.querySelector) == null ? void 0 : Vt.call(we, "input, textarea")));
              }
            ), je = Array.from(be.removedNodes).some(
              (we) => {
                var Vt;
                return we.nodeType === Node.ELEMENT_NODE && (we.matches("input, textarea") || ((Vt = we.querySelector) == null ? void 0 : Vt.call(we, "input, textarea")));
              }
            );
            fe && (J = !0, f = !0), je && (f = !0);
          }
        }), f && (clearTimeout(j.timeoutId), j.timeoutId = setTimeout(() => {
          Ge();
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
    const Ge = () => {
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
        f.addEventListener("input", d, !0), f.addEventListener("keyup", d, !0), f.addEventListener("change", d, !0), f.addEventListener("keypress", v, !0), f.addEventListener("keydown", k, !0);
      }));
    }, gt = () => {
      He.forEach((p) => {
        p.removeEventListener("input", d), p.removeEventListener("keyup", d), p.removeEventListener("change", d), p.removeEventListener("keypress", v), p.removeEventListener("keydown", k);
      }), He = [];
    }, It = (p) => !!(p && p.closest && p.closest(".form-message, .form-fullscreen, .cm-email-gate")), d = (p) => {
      if (It(p.target)) return;
      const g = p.target;
      ie.value = g.value;
    }, v = (p) => {
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
    const D = ce(null), M = ce(!1), P = ce(!1);
    r.initialAuthError && (D.value = r.initialAuthError, M.value = !0, R.value = !1), h();
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
      agentBubbleStyles: Re,
      userBubbleStyles: pe,
      messageNameStyles: ze,
      headerBorderStyles: Me,
      photoUrl: We,
      shadowStyle: u
    } = kd(o), y = ce(null), {
      uploadedAttachments: A,
      previewModal: x,
      previewFile: N,
      formatFileSize: G,
      isImageAttachment: te,
      getDownloadUrl: ye,
      getPreviewUrl: Ae,
      handleFileSelect: Ye,
      handleDrop: Ne,
      handleDragOver: ht,
      handleDragLeave: yt,
      handlePaste: qe,
      removeAttachment: Zt,
      openPreview: os,
      closePreview: Fn,
      openFilePicker: jn,
      isImage: as
    } = Td(B, y);
    Ie(() => b.value.some(
      (p) => p.message_type === "form" && (!p.isSubmitted || p.isSubmitted === !1)
    ));
    const Wt = Ie(() => {
      var p;
      return Ce.value && q.value || !Yr.value ? ne.value === "connected" && !_.value : _s(ve.value.trim()) && ne.value === "connected" && !_.value || ((p = window.__INITIAL_DATA__) == null ? void 0 : p.workflow);
    }), Gs = Ie(() => ne.value === "connected" ? jt.value ? "Ask me anything..." : "Type a message..." : "Connecting..."), _t = async () => {
      if (!ie.value.trim() && A.value.length === 0) return;
      !Ce.value && ve.value && await un();
      const p = A.value.map((f) => ({
        content: f.content,
        // base64 content
        filename: f.filename,
        content_type: f.type,
        size: f.size
      }));
      await Ee(ie.value, ve.value, p), A.value.forEach((f) => {
        f.url && f.url.startsWith("blob:") && URL.revokeObjectURL(f.url), f.file_url && f.file_url.startsWith("blob:") && URL.revokeObjectURL(f.file_url);
      }), ie.value = "", A.value = [];
      const g = document.querySelector('input[placeholder*="Type a message"]');
      g && (g.value = ""), setTimeout(() => {
        Ge();
      }, 500);
    }, kn = (p) => {
      Wt.value && (ie.value = p, _t());
    }, Ys = () => {
      window.parent.postMessage({ type: "WIDGET_MINIMIZE" }, "*");
    }, ls = (p) => {
      p.key === "Enter" && !p.shiftKey && (p.preventDefault(), p.stopPropagation(), _t());
    }, un = async () => {
      var p, g, f, J;
      try {
        if (!i.value)
          return console.error("Widget ID is not available"), D.value = "Widget ID is not available. Please refresh and try again.", M.value = !0, !1;
        const be = new URL(`${Cn.API_URL}/widgets/${i.value}`);
        ve.value.trim() && _s(ve.value.trim()) && be.searchParams.append("email", ve.value.trim());
        const fe = {
          Accept: "application/json",
          "Content-Type": "application/json"
        };
        B.value && (fe.Authorization = `Bearer ${B.value}`);
        const je = await fetch(be, {
          headers: fe
        });
        if (je.status === 401) {
          q.value = !1;
          try {
            const Gn = (await je.json()).detail || "";
            (Gn.includes("generate-token") || Gn.includes("API key") || Gn.includes("Token required")) && (P.value = !0, D.value = "Widget authentication not configured. Please contact the website administrator.", M.value = !0, localStorage.removeItem(Ss), B.value = null);
          } catch {
            D.value = "Authentication required. Your token has expired or is invalid. Please refresh the page.", M.value = !0, localStorage.removeItem(Ss), B.value = null;
          }
          return !1;
        }
        if (!je.ok) {
          try {
            const ds = await je.json();
            D.value = ds.detail || `Error: ${je.statusText}`;
          } catch {
            D.value = `Error: ${je.statusText}. Please try again.`;
          }
          return M.value = !0, !1;
        }
        const we = await je.json();
        return we.token && (B.value = we.token, localStorage.setItem(Ss, we.token), window.parent.postMessage({ type: "TOKEN_UPDATE", token: we.token }, "*")), q.value = !0, D.value = null, M.value = !1, me(B.value || void 0), await z() ? (await Xs(), (p = we.agent) != null && p.customization && l(we.agent.customization), we.agent && !(we != null && we.human_agent) && (a.value = we.agent.name), we != null && we.human_agent && (V.value = we.human_agent), ((g = we.agent) == null ? void 0 : g.allow_attachments) !== void 0 && (U.value = we.agent.allow_attachments), ((f = we.agent) == null ? void 0 : f.workflow) !== void 0 && (window.__INITIAL_DATA__ = window.__INITIAL_DATA__ || {}, window.__INITIAL_DATA__.workflow = we.agent.workflow), (J = we.agent) != null && J.workflow && await ge(), !0) : (console.error("Failed to connect to chat service"), D.value = "Failed to connect to chat service. Please try again.", M.value = !0, !1);
      } catch (be) {
        return console.error("Error checking authorization:", be), D.value = "An unexpected error occurred. Please try again.", M.value = !0, q.value = !1, !1;
      } finally {
        R.value = !1;
      }
    }, Xs = async () => {
      !Ce.value && q.value && (Ce.value = !0, await ke());
    }, Lt = () => {
      K.value && (K.value.scrollTop = K.value.scrollHeight);
    };
    mn(() => b.value, (p) => {
      Ai(() => {
        Lt();
      });
    }, { deep: !0 }), mn(ne, (p, g) => {
      p === "connected" && g !== "connected" && setTimeout(Ge, 100);
    }), mn(() => b.value.length, (p, g) => {
      p > 0 && g === 0 && setTimeout(Ge, 100);
    }), mn(() => b.value, (p) => {
      if (p.length > 0) {
        const g = p[p.length - 1];
        mt(g);
      }
    }, { deep: !0 });
    const Zs = async () => {
      await W() && await un();
    }, cs = ce(!1), Mn = ce(0), Vn = ce(""), Dt = ce(0), Z = ce(!1), m = ce({}), O = ce(!1), H = ce({}), Fe = ce(!1), lt = ce(null), ct = ce("Start Chat"), ft = ce(!1), st = ce(null);
    Ie(() => {
      var g;
      const p = b.value[b.value.length - 1];
      return ((g = p == null ? void 0 : p.attributes) == null ? void 0 : g.request_rating) || !1;
    });
    const Jt = Ie(() => {
      var g;
      if (!((g = window.__INITIAL_DATA__) != null && g.workflow))
        return !1;
      const p = b.value.find((f) => f.message_type === "rating");
      return (p == null ? void 0 : p.isSubmitted) === !0;
    }), qt = Ie(() => V.value.human_agent_profile_pic ? mo(V.value.human_agent_profile_pic) ? V.value.human_agent_profile_pic : `${Cn.API_URL}${V.value.human_agent_profile_pic}` : ""), mt = async (p) => {
      var g, f, J, be, fe;
      try {
        if (p.session_id && B.value && i.value) {
          const je = new URL(`${Cn.API_URL}/widgets/${i.value}/end-chat`);
          je.searchParams.append("session_id", p.session_id), (g = p.attributes) != null && g.end_chat_reason && je.searchParams.append("reason", p.attributes.end_chat_reason), (f = p.attributes) != null && f.end_chat_description && je.searchParams.append("description", p.attributes.end_chat_description);
          const we = await fetch(je, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${B.value}`,
              "Content-Type": "application/json"
            }
          });
          if (we.ok) {
            const Vt = await we.json();
            console.info(`✓ Chat session closed on backend: ${Vt.session_id}`);
          } else
            console.warn(`Failed to close session on backend: ${we.status}`);
        }
      } catch (je) {
        console.error("Error calling end-chat API:", je);
      }
      if ((J = p.attributes) != null && J.end_chat && ((be = p.attributes) != null && be.request_rating)) {
        const je = p.agent_name || ((fe = V.value) == null ? void 0 : fe.human_agent_name) || a.value || "our agent";
        b.value.push({
          message: `Rate the chat session that you had with ${je}`,
          message_type: "rating",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          session_id: p.session_id,
          agent_name: je,
          showFeedback: !1
        }), ae.value = p.session_id;
      }
    }, Js = (p) => {
      Z.value || (Dt.value = p);
    }, Qs = () => {
      if (!Z.value) {
        const p = b.value[b.value.length - 1];
        Dt.value = (p == null ? void 0 : p.selectedRating) || 0;
      }
    }, kc = async (p) => {
      if (!Z.value) {
        Dt.value = p;
        const g = b.value[b.value.length - 1];
        g && g.message_type === "rating" && (g.showFeedback = !0, g.selectedRating = p);
      }
    }, xc = async (p, g, f = null) => {
      try {
        Z.value = !0, await rt(g, f);
        const J = b.value.find((be) => be.message_type === "rating");
        J && (J.isSubmitted = !0, J.finalRating = g, J.finalFeedback = f);
      } catch (J) {
        console.error("Failed to submit rating:", J);
      } finally {
        Z.value = !1;
      }
    }, Ac = (p) => {
      const g = {};
      for (const f of p.fields) {
        const J = m.value[f.name], be = Vr(f, J);
        be && (g[f.name] = be);
      }
      return H.value = g, Object.keys(g).length === 0;
    }, Tc = async (p) => {
      if (!(O.value || !Ac(p)))
        try {
          O.value = !0, await Ve(m.value);
          const f = b.value.findIndex(
            (J) => J.message_type === "form" && (!J.isSubmitted || J.isSubmitted === !1)
          );
          f !== -1 && b.value.splice(f, 1), m.value = {}, H.value = {};
        } catch (f) {
          console.error("Failed to submit form:", f);
        } finally {
          O.value = !1;
        }
    }, Ot = (p, g) => {
      var f, J;
      if (m.value[p] = g, g && g.toString().trim() !== "") {
        let be = null;
        if ((f = st.value) != null && f.fields && (be = st.value.fields.find((fe) => fe.name === p)), !be && ((J = xe.value) != null && J.fields) && (be = xe.value.fields.find((fe) => fe.name === p)), be) {
          const fe = Vr(be, g);
          fe ? (H.value[p] = fe, console.log(`Validation error for ${p}:`, fe)) : delete H.value[p];
        }
      } else
        delete H.value[p], console.log(`Cleared error for ${p}`);
    }, Sc = (p) => {
      const g = p.replace(/\D/g, "");
      return g.length >= 7 && g.length <= 15;
    }, Vr = (p, g) => {
      if (p.required && (!g || g.toString().trim() === ""))
        return `${p.label} is required`;
      if (!g || g.toString().trim() === "")
        return null;
      if (p.type === "email" && !_s(g))
        return "Please enter a valid email address";
      if (p.type === "tel" && !Sc(g))
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
    }, Ec = async () => {
      if (!(O.value || !st.value))
        try {
          O.value = !0, H.value = {};
          let p = !1;
          for (const g of st.value.fields || []) {
            const f = m.value[g.name], J = Vr(g, f);
            J && (H.value[g.name] = J, p = !0, console.log(`Validation error for field ${g.name}:`, J));
          }
          if (p) {
            O.value = !1, console.log("Validation failed, not submitting");
            return;
          }
          await Ve(m.value), ft.value = !1, st.value = null, m.value = {};
        } catch (p) {
          console.error("Failed to submit full screen form:", p);
        } finally {
          O.value = !1, console.log("Full screen form submission completed");
        }
    }, Cc = (p, g) => {
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
    }, Rc = (p) => {
      if (!p) return "";
      let g = p.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "");
      const f = [];
      return g = g.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (J, be, fe) => {
        const je = `__MARKDOWN_LINK_${f.length}__`;
        return console.log("Found markdown link:", J, "-> placeholder:", je), f.push(J), je;
      }), console.log("After replacing markdown links with placeholders:", g), console.log("Markdown links array:", f), g = g.replace(/https?:\/\/[^\s\)]+/g, "[link removed]"), console.log("After removing standalone URLs:", g), f.forEach((J, be) => {
        g = g.replace(`__MARKDOWN_LINK_${be}__`, J), console.log(`Restored markdown link ${be}:`, J);
      }), g = g.replace(/\n\s*\n\s*\n/g, `

`).trim(), g;
    }, ko = ce(!1);
    ce(!1);
    const Ic = Ie(() => {
      var g;
      const p = !!((g = V.value) != null && g.human_agent_name);
      return U.value && p && A.value.length < za;
    }), Lc = async () => {
      try {
        Fe.value = !1, lt.value = null, await Ke();
      } catch (p) {
        console.error("Failed to proceed workflow:", p);
      }
    }, Kr = async (p) => {
      try {
        if (!p.userInputValue || !p.userInputValue.trim())
          return;
        const g = p.userInputValue.trim();
        p.isSubmitted = !0, p.submittedValue = g, await Ee(g, ve.value);
      } catch (g) {
        console.error("Failed to submit user input:", g), p.isSubmitted = !1, p.submittedValue = null;
      }
    }, xo = async () => {
      var p, g, f;
      try {
        let J = 0;
        const be = 50;
        for (; !((p = window.__INITIAL_DATA__) != null && p.widgetId) && J < be; )
          await new Promise((je) => setTimeout(je, 100)), J++;
        return (g = window.__INITIAL_DATA__) != null && g.widgetId ? (le(window.__INITIAL_DATA__.widgetId), await un() ? ((f = window.__INITIAL_DATA__) != null && f.workflow && q.value && await ge(), !0) : (ne.value = "connected", !1)) : (console.error("Widget data not available after waiting"), !1);
      } catch (J) {
        return console.error("Failed to initialize widget:", J), !1;
      }
    }, Oc = () => {
      Pe(async () => {
        await un();
      }), window.addEventListener("message", (p) => {
        p.data.type === "SCROLL_TO_BOTTOM" && Lt(), p.data.type === "TOKEN_RECEIVED" && localStorage.setItem(Ss, p.data.token);
      }), Qe((p) => {
        var g;
        if (ct.value = p.button_text || "Start Chat", p.type === "landing_page")
          lt.value = p.landing_page_data, Fe.value = !0, ft.value = !1;
        else if (p.type === "form" || p.type === "display_form")
          if (((g = p.form_data) == null ? void 0 : g.form_full_screen) === !0)
            st.value = p.form_data, ft.value = !0, Fe.value = !1;
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
              (be) => be.message_type === "form" && !be.isSubmitted
            ) === -1 && b.value.push(f), Fe.value = !1, ft.value = !1;
          }
        else
          Fe.value = !1, ft.value = !1;
      }), at((p) => {
        console.log("Workflow proceeded:", p);
      });
    }, Pc = async () => {
      try {
        await xo(), await ge();
      } catch (p) {
        throw console.error("Failed to start new conversation:", p), p;
      }
    }, Nc = async () => {
      Jt.value = !1, b.value = [], await Pc();
    };
    to(async () => {
      await xo(), Oc(), j(), document.addEventListener("click", L), (() => {
        const g = b.value.length > 0, f = ne.value === "connected", J = document.querySelector('input[type="text"], textarea') !== null;
        return g || f || J;
      })() && setTimeout(Ge, 100);
    }), js(() => {
      window.removeEventListener("message", (p) => {
        p.data.type === "SCROLL_TO_BOTTOM" && Lt();
      }), document.removeEventListener("click", L), re && (re.disconnect(), re = null), j.timeoutId && (clearTimeout(j.timeoutId), j.timeoutId = null), gt(), ee();
    });
    const Kn = Ie(() => o.value.chat_style === "AURORA"), jt = Ie(() => o.value.chat_style === "ASK_ANYTHING" || Kn.value), Ao = Ie(() => o.value.customization_metadata), er = Ie(() => {
      var g;
      const p = (g = Ao.value) == null ? void 0 : g.avatar_style;
      return p === "orb" ? !0 : p === "photo" ? !1 : Kn.value && !o.value.photo_url;
    }), us = Ie(() => {
      var p;
      return wd(a.value || "", (p = Ao.value) == null ? void 0 : p.orb_variant);
    }), Fc = {
      GLASS: "theme-glass",
      TERMINAL: "theme-terminal",
      PLAYFUL: "theme-playful",
      CALM_MINT: "theme-calm",
      SUNRISE: "theme-sunrise"
    }, Mc = Ie(() => Fc[o.value.chat_style] || ""), Dc = Ie(() => zp(o.value.chat_style, {
      chat_background_color: o.value.chat_background_color,
      chat_text_color: o.value.chat_text_color,
      accent_color: o.value.accent_color,
      font_family: o.value.font_family
    })), To = Ie(
      () => Array.isArray(o.value.quick_actions) ? o.value.quick_actions.filter((p) => !!p && p.trim().length > 0) : []
    ), So = Ie(() => (o.value.welcome_message || "").trim()), Eo = Ie(
      () => !jt.value && b.value.length === 0 && !Y.value && !hs.value
    ), Bc = Ie(
      () => Eo.value && So.value.length > 0
    ), $c = Ie(
      () => Eo.value && !Jt.value && To.value.length > 0
    ), Gr = Ie(() => o.value.show_citations === !0), Yr = Ie(() => o.value.collect_email === !0 && !jt.value), Co = ce(!1), xn = ce(""), fs = ce(!1), hs = Ie(() => !Ce.value && Yr.value && !Co.value), Ro = async () => {
      const p = ve.value.trim();
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
        await un(), Co.value = !0;
      } catch {
        xn.value = "Something went wrong. Please try again.";
      } finally {
        fs.value = !1;
      }
    }, Uc = Ie(() => {
      const p = {
        width: "100%",
        // Fill the embed iframe (sized by chattermate.js to the comp's 560px);
        // must be 100% so the panel isn't a fixed height inside the iframe.
        height: "100%",
        borderRadius: "var(--radius-lg)"
      };
      return window.innerWidth <= 768 && (p.width = "100vw", p.height = "100vh", p.borderRadius = "0", p.position = "fixed", p.top = "0", p.left = "0", p.bottom = "0", p.right = "0", p.maxWidth = "100vw", p.maxHeight = "100vh"), jt.value ? window.innerWidth <= 768 ? {
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
    }), Io = Ie(() => jt.value && b.value.length === 0);
    return (p, g) => M.value && P.value ? (T(), S("div", Wp, g[19] || (g[19] = [
      $n('<div class="widget-unavailable-card" data-v-11d88882><div class="widget-unavailable-icon-wrapper" data-v-11d88882><svg class="widget-unavailable-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-v-11d88882><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" data-v-11d88882></path><path d="M9 12l2 2 4-4" data-v-11d88882></path></svg></div><h2 class="widget-unavailable-title" data-v-11d88882>Chat Unavailable</h2><p class="widget-unavailable-message" data-v-11d88882> This chat widget is not currently configured. Please contact the website administrator to enable chat support. </p><div class="widget-unavailable-footer" data-v-11d88882><svg class="chattermate-logo-small" width="14" height="14" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-11d88882><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-11d88882></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-11d88882></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-11d88882></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-11d88882></circle></svg><span class="cm-powered-prefix" data-v-11d88882>Powered by </span><strong class="cm-brand" data-v-11d88882>ChatterMate</strong></div></div>', 1)
    ]))) : M.value ? (T(), S("div", qp, [
      w("div", jp, [
        g[20] || (g[20] = $n('<div class="auth-error-header" data-v-11d88882><svg class="auth-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-11d88882><circle cx="12" cy="12" r="10" data-v-11d88882></circle><line x1="12" y1="8" x2="12" y2="12" data-v-11d88882></line><line x1="12" y1="16" x2="12.01" y2="16" data-v-11d88882></line></svg><h2 data-v-11d88882>Authentication Error</h2></div>', 1)),
        w("p", Vp, se(D.value), 1),
        w("button", {
          class: "auth-error-refresh-btn",
          onClick: g[0] || (g[0] = () => p.window.location.reload())
        }, " Refresh Page ")
      ])
    ])) : i.value && !M.value ? (T(), S("div", {
      key: 2,
      class: Ze(["chat-container cm-surface", [{ collapsed: !nt.value, "ask-anything-style": jt.value, aurora: Kn.value }, Mc.value]]),
      style: Se({ ...E(u), ...Uc.value, ...Dc.value })
    }, [
      R.value ? (T(), S("div", Kp, g[21] || (g[21] = [
        $n('<div class="loading-spinner" data-v-11d88882><div class="dot" data-v-11d88882></div><div class="dot" data-v-11d88882></div><div class="dot" data-v-11d88882></div></div><div class="loading-text" data-v-11d88882>Initializing chat...</div>', 2)
      ]))) : oe("", !0),
      !R.value && E(ne) !== "connected" ? (T(), S("div", {
        key: 1,
        class: Ze(["connection-status", E(ne)])
      }, [
        E(ne) === "connecting" ? (T(), S("div", Gp, g[22] || (g[22] = [
          en(" Connecting to chat service... ", -1),
          w("div", { class: "loading-dots" }, [
            w("div", { class: "dot" }),
            w("div", { class: "dot" }),
            w("div", { class: "dot" })
          ], -1)
        ]))) : E(ne) === "failed" ? (T(), S("div", Yp, [
          g[23] || (g[23] = en(" Connection failed. ", -1)),
          w("button", {
            onClick: Zs,
            class: "reconnect-button"
          }, " Click here to reconnect ")
        ])) : oe("", !0)
      ], 2)) : oe("", !0),
      E($) ? (T(), S("div", {
        key: 2,
        class: "error-alert",
        style: Se(E(ue))
      }, se(E(F)), 5)) : oe("", !0),
      Io.value ? (T(), S("div", {
        key: 3,
        class: Ze(["welcome-message-section", { aurora: Kn.value }]),
        style: Se(E(Q))
      }, [
        w("div", Xp, [
          w("div", Zp, [
            er.value ? (T(), S("div", {
              key: 0,
              class: "welcome-orb",
              style: Se(us.value)
            }, null, 4)) : E(We) ? (T(), S("img", {
              key: 1,
              src: E(We),
              alt: E(a),
              class: "welcome-avatar"
            }, null, 8, Jp)) : oe("", !0),
            w("h1", Qp, se(E(o).welcome_title || `Welcome to ${E(a)}`), 1),
            w("p", eg, se(E(o).welcome_subtitle || "I'm here to help you with anything you need. What can I assist you with today?"), 1)
          ])
        ]),
        w("div", tg, [
          !E(Ce) && !q.value && Yr.value ? (T(), S("div", ng, [
            An(w("input", {
              "onUpdate:modelValue": g[1] || (g[1] = (f) => ve.value = f),
              type: "email",
              placeholder: "Enter your email address",
              disabled: E(_) || E(ne) !== "connected",
              class: Ze([{
                invalid: ve.value.trim() && !E(_s)(ve.value.trim()),
                disabled: E(ne) !== "connected"
              }, "welcome-email-input"])
            }, null, 10, sg), [
              [Un, ve.value]
            ])
          ])) : oe("", !0),
          w("div", rg, [
            An(w("input", {
              "onUpdate:modelValue": g[2] || (g[2] = (f) => ie.value = f),
              type: "text",
              placeholder: Gs.value,
              onKeypress: ls,
              onInput: de,
              onChange: de,
              disabled: !Wt.value,
              class: Ze([{ disabled: !Wt.value }, "welcome-message-field"])
            }, null, 42, ig), [
              [Un, ie.value]
            ]),
            w("button", {
              class: Ze(["welcome-send-button", { "aurora-send": Kn.value }]),
              style: Se(E(pe)),
              onClick: _t,
              disabled: !ie.value.trim() || !Wt.value
            }, [
              Kn.value ? (T(), S("svg", ag, g[24] || (g[24] = [
                w("path", {
                  d: "M12 19V5M12 5L5 12M12 5L19 12",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                }, null, -1)
              ]))) : (T(), S("svg", lg, g[25] || (g[25] = [
                w("path", {
                  d: "M5 12L3 21L21 12L3 3L5 12ZM5 12L13 12",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                }, null, -1)
              ])))
            ], 14, og)
          ])
        ]),
        w("div", {
          class: "powered-by-welcome",
          style: Se(E(ze))
        }, g[26] || (g[26] = [
          $n('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-11d88882><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-11d88882></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-11d88882></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-11d88882></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-11d88882></circle></svg><span class="cm-powered-prefix" data-v-11d88882>Powered by </span><strong class="cm-brand" data-v-11d88882>ChatterMate</strong>', 3)
        ]), 4)
      ], 6)) : oe("", !0),
      Fe.value && lt.value ? (T(), S("div", {
        key: 4,
        class: "landing-page-fullscreen",
        style: Se(E(Q))
      }, [
        w("div", cg, [
          w("div", ug, [
            w("h2", fg, se(lt.value.heading), 1),
            w("div", hg, se(lt.value.content), 1)
          ]),
          w("div", dg, [
            w("button", {
              class: "landing-page-button",
              onClick: Lc
            }, se(ct.value), 1)
          ])
        ]),
        w("div", {
          class: "powered-by-landing",
          style: Se(E(ze))
        }, g[27] || (g[27] = [
          $n('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-11d88882><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-11d88882></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-11d88882></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-11d88882></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-11d88882></circle></svg><span class="cm-powered-prefix" data-v-11d88882>Powered by </span><strong class="cm-brand" data-v-11d88882>ChatterMate</strong>', 3)
        ]), 4)
      ], 4)) : ft.value && st.value ? (T(), S("div", {
        key: 5,
        class: "form-fullscreen",
        style: Se(E(Q))
      }, [
        w("div", pg, [
          st.value.title || st.value.description ? (T(), S("div", gg, [
            st.value.title ? (T(), S("h2", mg, se(st.value.title), 1)) : oe("", !0),
            st.value.description ? (T(), S("p", _g, se(st.value.description), 1)) : oe("", !0)
          ])) : oe("", !0),
          w("div", vg, [
            (T(!0), S(et, null, Pt(st.value.fields, (f) => {
              var J, be;
              return T(), S("div", {
                key: f.name,
                class: "form-field"
              }, [
                w("label", {
                  for: `fullscreen-form-${f.name}`,
                  class: "field-label"
                }, [
                  en(se(f.label) + " ", 1),
                  f.required ? (T(), S("span", bg, "*")) : oe("", !0)
                ], 8, yg),
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
                  class: Ze(["form-input", { error: H.value[f.name] }]),
                  autocomplete: f.type === "email" ? "email" : f.type === "tel" ? "tel" : "off",
                  inputmode: f.type === "tel" ? "tel" : f.type === "email" ? "email" : "text"
                }, null, 42, wg)) : f.type === "number" ? (T(), S("input", {
                  key: 1,
                  id: `fullscreen-form-${f.name}`,
                  type: "number",
                  placeholder: f.placeholder || "",
                  required: f.required,
                  min: f.minLength,
                  max: f.maxLength,
                  value: m.value[f.name] || "",
                  onInput: (fe) => Ot(f.name, fe.target.value),
                  class: Ze(["form-input", { error: H.value[f.name] }])
                }, null, 42, kg)) : f.type === "textarea" ? (T(), S("textarea", {
                  key: 2,
                  id: `fullscreen-form-${f.name}`,
                  placeholder: f.placeholder || "",
                  required: f.required,
                  minlength: f.minLength,
                  maxlength: f.maxLength,
                  value: m.value[f.name] || "",
                  onInput: (fe) => Ot(f.name, fe.target.value),
                  class: Ze(["form-textarea", { error: H.value[f.name] }]),
                  rows: "4"
                }, null, 42, xg)) : f.type === "select" ? (T(), S("select", {
                  key: 3,
                  id: `fullscreen-form-${f.name}`,
                  required: f.required,
                  value: m.value[f.name] || "",
                  onChange: (fe) => Ot(f.name, fe.target.value),
                  class: Ze(["form-select", { error: H.value[f.name] }])
                }, [
                  w("option", Tg, se(f.placeholder || "Please select..."), 1),
                  (T(!0), S(et, null, Pt((Array.isArray(f.options) ? f.options : ((J = f.options) == null ? void 0 : J.split(`
`)) || []).filter((fe) => fe.trim()), (fe) => (T(), S("option", {
                    key: fe,
                    value: fe.trim()
                  }, se(fe.trim()), 9, Sg))), 128))
                ], 42, Ag)) : f.type === "checkbox" ? (T(), S("label", Eg, [
                  w("input", {
                    id: `fullscreen-form-${f.name}`,
                    type: "checkbox",
                    required: f.required,
                    checked: m.value[f.name] || !1,
                    onChange: (fe) => Ot(f.name, fe.target.checked),
                    class: "form-checkbox"
                  }, null, 40, Cg),
                  w("span", Rg, se(f.label), 1)
                ])) : f.type === "radio" ? (T(), S("div", Ig, [
                  (T(!0), S(et, null, Pt((Array.isArray(f.options) ? f.options : ((be = f.options) == null ? void 0 : be.split(`
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
                      onChange: (je) => Ot(f.name, fe.trim()),
                      class: "form-radio"
                    }, null, 40, Lg),
                    w("span", Og, se(fe.trim()), 1)
                  ]))), 128))
                ])) : oe("", !0),
                H.value[f.name] ? (T(), S("div", Pg, se(H.value[f.name]), 1)) : oe("", !0)
              ]);
            }), 128))
          ]),
          w("div", Ng, [
            w("button", {
              onClick: g[3] || (g[3] = () => {
                console.log("Submit button clicked!"), Ec();
              }),
              disabled: O.value,
              class: "submit-form-button",
              style: Se(E(pe))
            }, [
              O.value ? (T(), S("span", Mg, g[28] || (g[28] = [
                w("div", { class: "dot" }, null, -1),
                w("div", { class: "dot" }, null, -1),
                w("div", { class: "dot" }, null, -1)
              ]))) : (T(), S("span", Dg, se(st.value.submit_button_text || "Submit"), 1))
            ], 12, Fg)
          ])
        ]),
        w("div", {
          class: "powered-by-landing",
          style: Se(E(ze))
        }, g[29] || (g[29] = [
          $n('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-11d88882><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-11d88882></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-11d88882></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-11d88882></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-11d88882></circle></svg><span class="cm-powered-prefix" data-v-11d88882>Powered by </span><strong class="cm-brand" data-v-11d88882>ChatterMate</strong>', 3)
        ]), 4)
      ], 4)) : Io.value ? oe("", !0) : (T(), S(et, { key: 6 }, [
        nt.value ? (T(), S("div", {
          key: 0,
          class: Ze(["chat-panel", { "ask-anything-chat": jt.value }]),
          style: Se(E(Q))
        }, [
          jt.value ? (T(), S("div", {
            key: 1,
            class: "ask-anything-top",
            style: Se(E(Me))
          }, [
            w("div", zg, [
              qt.value || E(We) ? (T(), S("img", {
                key: 0,
                src: qt.value || E(We),
                alt: E(V).human_agent_name || E(a),
                class: "header-avatar"
              }, null, 8, Hg)) : oe("", !0),
              w("div", Wg, [
                w("h3", {
                  style: Se(E(ze))
                }, se(E(a)), 5),
                w("p", {
                  class: "ask-anything-subtitle",
                  style: Se(E(ze))
                }, se(E(o).welcome_subtitle || "Ask me anything. I'm here to help."), 5)
              ])
            ])
          ], 4)) : (T(), S("div", {
            key: 0,
            class: "chat-header",
            style: Se(E(Me))
          }, [
            w("div", {
              class: "cm-header-sheen",
              style: Se({ background: "linear-gradient(90deg, transparent, " + (E(o).accent_color || "#C9F24E") + ", transparent)" })
            }, null, 4),
            w("div", Bg, [
              !qt.value && (er.value || !E(We)) ? (T(), S("div", {
                key: 0,
                class: "header-orb",
                style: Se(us.value)
              }, null, 4)) : qt.value || E(We) ? (T(), S("img", {
                key: 1,
                src: qt.value || E(We),
                alt: E(V).human_agent_name || E(a),
                class: "header-avatar"
              }, null, 8, $g)) : oe("", !0),
              w("div", Ug, [
                w("h3", {
                  style: Se(E(ze))
                }, se(E(V).human_agent_name || E(a)), 5),
                g[30] || (g[30] = w("div", { class: "status" }, [
                  w("span", { class: "status-indicator online" }),
                  w("span", { class: "status-text cm-presence" }, "Online · replies instantly")
                ], -1))
              ])
            ]),
            w("button", {
              type: "button",
              class: "header-minimize",
              style: Se(E(ze)),
              title: "Minimize",
              "aria-label": "Minimize chat",
              onClick: Ys
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
          E(Y) ? (T(), S("div", qg, g[32] || (g[32] = [
            w("div", { class: "loading-spinner" }, [
              w("div", { class: "dot" }),
              w("div", { class: "dot" }),
              w("div", { class: "dot" })
            ], -1)
          ]))) : oe("", !0),
          hs.value ? (T(), S("div", {
            key: 3,
            class: "cm-email-gate",
            style: Se(E(Q))
          }, [
            w("div", {
              class: "cm-email-gate-orb",
              style: Se(us.value)
            }, null, 4),
            w("h3", jg, se(E(o).welcome_title || "Before we start"), 1),
            g[33] || (g[33] = w("p", { class: "cm-email-gate-text" }, "Enter your email and we'll continue the chat.", -1)),
            An(w("input", {
              "onUpdate:modelValue": g[4] || (g[4] = (f) => ve.value = f),
              type: "email",
              inputmode: "email",
              autocomplete: "email",
              placeholder: "you@example.com",
              class: Ze(["cm-email-gate-input", { invalid: !!xn.value }]),
              disabled: fs.value,
              onKeyup: ai(Ro, ["enter"]),
              onInput: g[5] || (g[5] = (f) => xn.value = "")
            }, null, 42, Vg), [
              [Un, ve.value]
            ]),
            xn.value ? (T(), S("p", Kg, se(xn.value), 1)) : oe("", !0),
            w("button", {
              type: "button",
              class: "cm-email-gate-btn",
              style: Se(E(pe)),
              disabled: fs.value,
              onClick: Ro
            }, se(fs.value ? "Please wait…" : "Continue to chat"), 13, Gg)
          ], 4)) : oe("", !0),
          An(w("div", {
            class: "chat-messages",
            ref_key: "messagesContainer",
            ref: K
          }, [
            Bc.value ? (T(), S("div", Yg, [
              w("div", Xg, [
                er.value || !E(We) ? (T(), S("div", {
                  key: 0,
                  class: "cm-welcome-orb",
                  style: Se(us.value)
                }, null, 4)) : (T(), S("img", {
                  key: 1,
                  src: E(We),
                  alt: E(a),
                  class: "cm-welcome-avatar"
                }, null, 8, Zg)),
                w("div", {
                  class: "message-bubble cm-welcome-bubble",
                  style: Se(E(Re))
                }, se(So.value), 5)
              ])
            ])) : oe("", !0),
            (T(!0), S(et, null, Pt(E(b), (f, J) => {
              var be, fe, je, we, Vt, ds, Gn, Oo, Po, No, Fo, Mo, Do, Bo, $o, Uo, zo, Ho, Wo;
              return T(), S("div", {
                key: J,
                class: Ze([
                  "message",
                  f.message_type === "bot" || f.message_type === "agent" ? "agent-message" : f.message_type === "system" ? "system-message" : f.message_type === "rating" ? "rating-message" : f.message_type === "form" ? "form-message" : f.message_type === "product" || f.shopify_output ? "product-message" : "user-message"
                ])
              }, [
                f.message_type === "bot" || f.message_type === "agent" ? (T(), S("div", Jg, [
                  qt.value ? (T(), S("img", {
                    key: 0,
                    src: qt.value,
                    class: "cm-msg-avatar-img",
                    alt: ""
                  }, null, 8, Qg)) : !er.value && E(We) ? (T(), S("img", {
                    key: 1,
                    src: E(We),
                    class: "cm-msg-avatar-img",
                    alt: ""
                  }, null, 8, em)) : (T(), S("div", {
                    key: 2,
                    class: "cm-msg-avatar-orb",
                    style: Se(us.value)
                  }, null, 4))
                ])) : oe("", !0),
                w("div", {
                  class: "message-bubble",
                  style: Se(f.message_type === "system" || f.message_type === "rating" || f.message_type === "product" || f.shopify_output ? {} : f.message_type === "user" ? E(pe) : E(Re))
                }, [
                  f.message_type === "rating" ? (T(), S("div", tm, [
                    w("p", nm, "Rate the chat session that you had with " + se(f.agent_name || E(V).human_agent_name || E(a) || "our agent"), 1),
                    w("div", {
                      class: Ze(["star-rating", { submitted: Z.value || f.isSubmitted }])
                    }, [
                      (T(), S(et, null, Pt(5, (C) => w("button", {
                        key: C,
                        class: Ze(["star-button", {
                          warning: C <= (f.isSubmitted ? f.finalRating : Dt.value || f.selectedRating) && (f.isSubmitted ? f.finalRating : Dt.value || f.selectedRating) <= 3,
                          success: C <= (f.isSubmitted ? f.finalRating : Dt.value || f.selectedRating) && (f.isSubmitted ? f.finalRating : Dt.value || f.selectedRating) > 3,
                          selected: C <= (f.isSubmitted ? f.finalRating : Dt.value || f.selectedRating)
                        }]),
                        onMouseover: (Kt) => !f.isSubmitted && Js(C),
                        onMouseleave: (Kt) => !f.isSubmitted && Qs,
                        onClick: (Kt) => !f.isSubmitted && kc(C),
                        disabled: Z.value || f.isSubmitted
                      }, " ★ ", 42, sm)), 64))
                    ], 2),
                    f.showFeedback && !f.isSubmitted ? (T(), S("div", rm, [
                      w("div", im, [
                        An(w("input", {
                          "onUpdate:modelValue": (C) => f.feedback = C,
                          placeholder: "Please share your feedback (optional)",
                          disabled: Z.value,
                          maxlength: "500",
                          class: "feedback-input"
                        }, null, 8, om), [
                          [Un, f.feedback]
                        ]),
                        w("div", am, se(((be = f.feedback) == null ? void 0 : be.length) || 0) + "/500", 1)
                      ]),
                      w("button", {
                        onClick: (C) => xc(f.session_id, Dt.value, f.feedback),
                        disabled: Z.value || !Dt.value,
                        class: "submit-rating-button",
                        style: Se({ backgroundColor: E(o).accent_color || "var(--accent-solid)" })
                      }, se(Z.value ? "Submitting..." : "Submit Rating"), 13, lm)
                    ])) : oe("", !0),
                    f.isSubmitted && f.finalFeedback ? (T(), S("div", cm, [
                      w("div", um, [
                        w("p", fm, se(f.finalFeedback), 1)
                      ])
                    ])) : f.isSubmitted ? (T(), S("div", hm, " Thank you for your rating! ")) : oe("", !0)
                  ])) : f.message_type === "form" ? (T(), S("div", dm, [
                    (je = (fe = f.attributes) == null ? void 0 : fe.form_data) != null && je.title || (Vt = (we = f.attributes) == null ? void 0 : we.form_data) != null && Vt.description ? (T(), S("div", pm, [
                      (Gn = (ds = f.attributes) == null ? void 0 : ds.form_data) != null && Gn.title ? (T(), S("h3", gm, se(f.attributes.form_data.title), 1)) : oe("", !0),
                      (Po = (Oo = f.attributes) == null ? void 0 : Oo.form_data) != null && Po.description ? (T(), S("p", mm, se(f.attributes.form_data.description), 1)) : oe("", !0)
                    ])) : oe("", !0),
                    w("div", _m, [
                      (T(!0), S(et, null, Pt((Fo = (No = f.attributes) == null ? void 0 : No.form_data) == null ? void 0 : Fo.fields, (C) => {
                        var Kt, Xr;
                        return T(), S("div", {
                          key: C.name,
                          class: "form-field"
                        }, [
                          w("label", {
                            for: `form-${C.name}`,
                            class: "field-label"
                          }, [
                            en(se(C.label) + " ", 1),
                            C.required ? (T(), S("span", ym, "*")) : oe("", !0)
                          ], 8, vm),
                          C.type === "text" || C.type === "email" || C.type === "tel" ? (T(), S("input", {
                            key: 0,
                            id: `form-${C.name}`,
                            type: C.type,
                            placeholder: C.placeholder || "",
                            required: C.required,
                            minlength: C.minLength,
                            maxlength: C.maxLength,
                            value: m.value[C.name] || "",
                            onInput: (De) => Ot(C.name, De.target.value),
                            onBlur: (De) => Ot(C.name, De.target.value),
                            class: Ze(["form-input", { error: H.value[C.name] }]),
                            disabled: O.value,
                            autocomplete: C.type === "email" ? "email" : C.type === "tel" ? "tel" : "off",
                            inputmode: C.type === "tel" ? "tel" : C.type === "email" ? "email" : "text"
                          }, null, 42, bm)) : C.type === "number" ? (T(), S("input", {
                            key: 1,
                            id: `form-${C.name}`,
                            type: "number",
                            placeholder: C.placeholder || "",
                            required: C.required,
                            min: C.min,
                            max: C.max,
                            value: m.value[C.name] || "",
                            onInput: (De) => Ot(C.name, De.target.value),
                            class: Ze(["form-input", { error: H.value[C.name] }]),
                            disabled: O.value
                          }, null, 42, wm)) : C.type === "textarea" ? (T(), S("textarea", {
                            key: 2,
                            id: `form-${C.name}`,
                            placeholder: C.placeholder || "",
                            required: C.required,
                            minlength: C.minLength,
                            maxlength: C.maxLength,
                            value: m.value[C.name] || "",
                            onInput: (De) => Ot(C.name, De.target.value),
                            class: Ze(["form-textarea", { error: H.value[C.name] }]),
                            disabled: O.value,
                            rows: "3"
                          }, null, 42, km)) : C.type === "select" ? (T(), S("select", {
                            key: 3,
                            id: `form-${C.name}`,
                            required: C.required,
                            value: m.value[C.name] || "",
                            onChange: (De) => Ot(C.name, De.target.value),
                            class: Ze(["form-select", { error: H.value[C.name] }]),
                            disabled: O.value
                          }, [
                            w("option", Am, se(C.placeholder || "Select an option"), 1),
                            (T(!0), S(et, null, Pt((Array.isArray(C.options) ? C.options : ((Kt = C.options) == null ? void 0 : Kt.split(`
`)) || []).filter((De) => De.trim()), (De) => (T(), S("option", {
                              key: De.trim(),
                              value: De.trim()
                            }, se(De.trim()), 9, Tm))), 128))
                          ], 42, xm)) : C.type === "checkbox" ? (T(), S("div", Sm, [
                            w("input", {
                              id: `form-${C.name}`,
                              type: "checkbox",
                              checked: m.value[C.name] || !1,
                              onChange: (De) => Ot(C.name, De.target.checked),
                              class: "form-checkbox",
                              disabled: O.value
                            }, null, 40, Em),
                            w("label", {
                              for: `form-${C.name}`,
                              class: "checkbox-label"
                            }, se(C.placeholder || C.label), 9, Cm)
                          ])) : C.type === "radio" ? (T(), S("div", Rm, [
                            (T(!0), S(et, null, Pt((Array.isArray(C.options) ? C.options : ((Xr = C.options) == null ? void 0 : Xr.split(`
`)) || []).filter((De) => De.trim()), (De) => (T(), S("div", {
                              key: De.trim(),
                              class: "radio-option"
                            }, [
                              w("input", {
                                id: `form-${C.name}-${De.trim()}`,
                                name: `form-${C.name}`,
                                type: "radio",
                                value: De.trim(),
                                checked: m.value[C.name] === De.trim(),
                                onChange: (Z_) => Ot(C.name, De.trim()),
                                class: "form-radio",
                                disabled: O.value
                              }, null, 40, Im),
                              w("label", {
                                for: `form-${C.name}-${De.trim()}`,
                                class: "radio-label"
                              }, se(De.trim()), 9, Lm)
                            ]))), 128))
                          ])) : oe("", !0),
                          H.value[C.name] ? (T(), S("div", Om, se(H.value[C.name]), 1)) : oe("", !0)
                        ]);
                      }), 128))
                    ]),
                    w("div", Pm, [
                      w("button", {
                        onClick: () => {
                          var C;
                          console.log("Regular form submit button clicked!"), Tc((C = f.attributes) == null ? void 0 : C.form_data);
                        },
                        disabled: O.value,
                        class: "form-submit-button",
                        style: Se(E(pe))
                      }, se(O.value ? "Submitting..." : ((Do = (Mo = f.attributes) == null ? void 0 : Mo.form_data) == null ? void 0 : Do.submit_button_text) || "Submit"), 13, Nm)
                    ])
                  ])) : f.message_type === "user_input" ? (T(), S("div", Fm, [
                    (Bo = f.attributes) != null && Bo.prompt_message && f.attributes.prompt_message.trim() ? (T(), S("div", Mm, se(f.attributes.prompt_message), 1)) : oe("", !0),
                    f.isSubmitted ? (T(), S("div", Um, [
                      g[34] || (g[34] = w("strong", null, "Your input:", -1)),
                      en(" " + se(f.submittedValue) + " ", 1),
                      ($o = f.attributes) != null && $o.confirmation_message && f.attributes.confirmation_message.trim() ? (T(), S("div", zm, se(f.attributes.confirmation_message), 1)) : oe("", !0)
                    ])) : (T(), S("div", Dm, [
                      An(w("textarea", {
                        "onUpdate:modelValue": (C) => f.userInputValue = C,
                        class: "user-input-textarea",
                        placeholder: "Type your message here...",
                        rows: "3",
                        onKeydown: [
                          ai(Xn((C) => Kr(f), ["ctrl"]), ["enter"]),
                          ai(Xn((C) => Kr(f), ["meta"]), ["enter"])
                        ]
                      }, null, 40, Bm), [
                        [Un, f.userInputValue]
                      ]),
                      w("button", {
                        class: "user-input-submit-button",
                        onClick: (C) => Kr(f),
                        disabled: !f.userInputValue || !f.userInputValue.trim()
                      }, " Submit ", 8, $m)
                    ]))
                  ])) : f.shopify_output || f.message_type === "product" ? (T(), S("div", Hm, [
                    f.message ? (T(), S("div", {
                      key: 0,
                      innerHTML: s(((zo = (Uo = f.shopify_output) == null ? void 0 : Uo.products) == null ? void 0 : zo.length) > 0 ? Rc(f.message) : f.message),
                      class: "product-message-text"
                    }, null, 8, Wm)) : oe("", !0),
                    (Ho = f.shopify_output) != null && Ho.products && f.shopify_output.products.length > 0 ? (T(), S("div", qm, [
                      g[36] || (g[36] = w("h3", { class: "carousel-title" }, "Products", -1)),
                      w("div", jm, [
                        (T(!0), S(et, null, Pt(f.shopify_output.products, (C) => {
                          var Kt;
                          return T(), S("div", {
                            key: C.id,
                            class: "product-card-compact carousel-item"
                          }, [
                            (Kt = C.image) != null && Kt.src ? (T(), S("div", Vm, [
                              w("img", {
                                src: C.image.src,
                                alt: C.title,
                                class: "product-thumbnail"
                              }, null, 8, Km)
                            ])) : oe("", !0),
                            w("div", Gm, [
                              w("div", Ym, [
                                w("div", Xm, se(C.title), 1),
                                C.variant_title && C.variant_title !== "Default Title" ? (T(), S("div", Zm, se(C.variant_title), 1)) : oe("", !0),
                                w("div", Jm, se(C.price_formatted || E(c)(C.price, C.currency)), 1)
                              ]),
                              w("div", Qm, [
                                w("button", {
                                  class: "view-details-button-compact",
                                  onClick: (Xr) => {
                                    var De;
                                    return Cc(C, (De = f.shopify_output) == null ? void 0 : De.shop_domain);
                                  }
                                }, g[35] || (g[35] = [
                                  en(" View product ", -1),
                                  w("span", { class: "external-link-icon" }, "↗", -1)
                                ]), 8, e_)
                              ])
                            ])
                          ]);
                        }), 128))
                      ])
                    ])) : !f.message && ((Wo = f.shopify_output) != null && Wo.products) && f.shopify_output.products.length === 0 ? (T(), S("div", t_, g[37] || (g[37] = [
                      w("p", null, "No products found.", -1)
                    ]))) : !f.message && f.shopify_output && !f.shopify_output.products ? (T(), S("div", n_, g[38] || (g[38] = [
                      w("p", null, "No products to display.", -1)
                    ]))) : oe("", !0)
                  ])) : (T(), S(et, { key: 4 }, [
                    E(it)(J) ? (T(), S("div", s_, [
                      en(se(E(ut)(J, f.message)), 1),
                      g[39] || (g[39] = w("span", { class: "cm-caret" }, null, -1))
                    ])) : (T(), S("div", {
                      key: 1,
                      innerHTML: s(f.message)
                    }, null, 8, r_)),
                    f.attachments && f.attachments.length > 0 ? (T(), S("div", i_, [
                      (T(!0), S(et, null, Pt(f.attachments, (C) => (T(), S("div", {
                        key: C.id,
                        class: "attachment-item"
                      }, [
                        E(te)(C.content_type) ? (T(), S("div", o_, [
                          w("img", {
                            src: E(ye)(C.file_url),
                            alt: C.filename,
                            class: "attachment-image",
                            onClick: Xn((Kt) => E(os)({ url: C.file_url, filename: C.filename, type: C.content_type, file_url: E(ye)(C.file_url), size: void 0 }), ["stop"]),
                            style: { cursor: "pointer" }
                          }, null, 8, a_),
                          w("div", l_, [
                            w("a", {
                              href: E(ye)(C.file_url),
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
                              en(" " + se(C.filename) + " ", 1),
                              w("span", u_, "(" + se(E(G)(C.file_size)) + ")", 1)
                            ], 8, c_)
                          ])
                        ])) : (T(), S("a", {
                          key: 1,
                          href: E(ye)(C.file_url),
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
                          en(" " + se(C.filename) + " ", 1),
                          w("span", h_, "(" + se(E(G)(C.file_size)) + ")", 1)
                        ], 8, f_))
                      ]))), 128))
                    ])) : oe("", !0)
                  ], 64))
                ], 4),
                Gr.value && (f.message_type === "bot" || f.message_type === "agent") && f.sources && f.sources.length ? (T(), S("div", d_, [
                  g[42] || (g[42] = w("span", { class: "citation-label" }, "Sources", -1)),
                  (T(!0), S(et, null, Pt(f.sources, (C, Kt) => (T(), S("span", {
                    key: Kt,
                    class: "citation-chip",
                    title: C.type
                  }, se(C.name), 9, p_))), 128))
                ])) : oe("", !0),
                w("div", g_, [
                  f.message_type === "user" ? (T(), S("span", m_, " You ")) : oe("", !0)
                ])
              ], 2);
            }), 128)),
            E(_) ? (T(), S("div", {
              key: 1,
              class: Ze(["typing-indicator", { "reading-indicator": Gr.value }])
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
                style: Se(E(Re))
              }, g[45] || (g[45] = [
                w("span", { class: "cm-typing-dot" }, null, -1),
                w("span", { class: "cm-typing-dot" }, null, -1),
                w("span", { class: "cm-typing-dot" }, null, -1)
              ]), 4))
            ], 2)) : oe("", !0)
          ], 512), [
            [qf, !hs.value]
          ]),
          $c.value ? (T(), S("div", __, [
            (T(!0), S(et, null, Pt(To.value, (f) => (T(), S("button", {
              key: f,
              type: "button",
              class: "cm-quick-action",
              disabled: !Wt.value,
              onClick: (J) => kn(f)
            }, se(f), 9, v_))), 128))
          ])) : oe("", !0),
          !Jt.value && !hs.value ? (T(), S("div", {
            key: 5,
            class: Ze(["chat-input", { "ask-anything-input": jt.value }])
          }, [
            w("input", {
              ref_key: "fileInputRef",
              ref: y,
              type: "file",
              accept: q_,
              multiple: "",
              style: { display: "none" },
              onChange: g[6] || (g[6] = //@ts-ignore
              (...f) => E(Ye) && E(Ye)(...f))
            }, null, 544),
            E(A).length > 0 ? (T(), S("div", y_, [
              (T(!0), S(et, null, Pt(E(A), (f, J) => (T(), S("div", {
                key: J,
                class: "file-preview-widget"
              }, [
                w("div", b_, [
                  E(as)(f.type) ? (T(), S("img", {
                    key: 0,
                    src: E(Ae)(f),
                    alt: f.filename,
                    class: "file-preview-image-widget",
                    onClick: Xn((be) => E(os)(f), ["stop"]),
                    style: { cursor: "pointer" }
                  }, null, 8, w_)) : (T(), S("div", {
                    key: 1,
                    class: "file-preview-icon-widget",
                    onClick: Xn((be) => E(os)(f), ["stop"]),
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
                  ]), 8, k_))
                ]),
                w("div", x_, [
                  w("div", A_, se(f.filename), 1),
                  w("div", T_, se(E(G)(f.size)), 1)
                ]),
                w("button", {
                  type: "button",
                  class: "file-preview-remove-widget",
                  onClick: (be) => E(Zt)(J),
                  title: "Remove file"
                }, " × ", 8, S_)
              ]))), 128))
            ])) : oe("", !0),
            ko.value ? (T(), S("div", E_, g[47] || (g[47] = [
              w("div", { class: "upload-spinner-widget" }, null, -1),
              w("span", { class: "upload-text-widget" }, "Uploading files...", -1)
            ]))) : oe("", !0),
            w("div", C_, [
              An(w("input", {
                "onUpdate:modelValue": g[7] || (g[7] = (f) => ie.value = f),
                type: "text",
                placeholder: Gs.value,
                onKeypress: ls,
                onInput: de,
                onChange: de,
                onPaste: g[8] || (g[8] = //@ts-ignore
                (...f) => E(qe) && E(qe)(...f)),
                onDrop: g[9] || (g[9] = //@ts-ignore
                (...f) => E(Ne) && E(Ne)(...f)),
                onDragover: g[10] || (g[10] = //@ts-ignore
                (...f) => E(ht) && E(ht)(...f)),
                onDragleave: g[11] || (g[11] = //@ts-ignore
                (...f) => E(yt) && E(yt)(...f)),
                disabled: !Wt.value,
                class: Ze({ disabled: !Wt.value, "ask-anything-field": jt.value })
              }, null, 42, R_), [
                [Un, ie.value]
              ]),
              Ic.value ? (T(), S("button", {
                key: 0,
                type: "button",
                class: "attach-button",
                disabled: ko.value,
                onClick: g[12] || (g[12] = //@ts-ignore
                (...f) => E(jn) && E(jn)(...f)),
                title: `Attach files (${E(A).length}/${za} used) or paste screenshots`
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
              ]), 8, I_)) : oe("", !0),
              w("button", {
                class: Ze(["send-button", { "ask-anything-send": jt.value }]),
                style: Se(E(pe)),
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
              ]), 14, L_)
            ])
          ], 2)) : Jt.value && !hs.value ? (T(), S("div", O_, [
            w("div", P_, [
              g[50] || (g[50] = w("p", { class: "ended-text" }, "This chat has ended.", -1)),
              w("button", {
                class: "start-new-conversation-button",
                style: Se(E(pe)),
                onClick: Nc
              }, " Click here to start a new conversation ", 4)
            ])
          ])) : oe("", !0),
          w("div", {
            class: "powered-by",
            style: Se(E(ze))
          }, g[51] || (g[51] = [
            $n('<svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-11d88882><path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E" data-v-11d88882></path><circle cx="19.7" cy="30" r="4.3" fill="#0B0C10" data-v-11d88882></circle><circle cx="30" cy="30" r="4.3" fill="#0B0C10" data-v-11d88882></circle><circle cx="40.3" cy="30" r="4.3" fill="#0B0C10" data-v-11d88882></circle></svg><span class="cm-powered-prefix" data-v-11d88882>Powered by </span><strong class="cm-brand" data-v-11d88882>ChatterMate</strong>', 3)
          ]), 4)
        ], 6)) : oe("", !0)
      ], 64)),
      cs.value ? (T(), S("div", N_, [
        w("div", F_, [
          g[52] || (g[52] = w("h3", null, "Rate your conversation", -1)),
          w("div", M_, [
            (T(), S(et, null, Pt(5, (f) => w("button", {
              key: f,
              onClick: (J) => Mn.value = f,
              class: Ze([{ active: f <= Mn.value }, "star-button"])
            }, " ★ ", 10, D_)), 64))
          ]),
          An(w("textarea", {
            "onUpdate:modelValue": g[13] || (g[13] = (f) => Vn.value = f),
            placeholder: "Additional feedback (optional)",
            class: "rating-feedback"
          }, null, 512), [
            [Un, Vn.value]
          ]),
          w("div", B_, [
            w("button", {
              onClick: g[14] || (g[14] = (f) => p.submitRating(Mn.value, Vn.value)),
              disabled: !Mn.value,
              class: "submit-button",
              style: Se(E(pe))
            }, " Submit ", 12, $_),
            w("button", {
              onClick: g[15] || (g[15] = (f) => cs.value = !1),
              class: "skip-rating"
            }, " Skip ")
          ])
        ])
      ])) : oe("", !0),
      E(x) ? (T(), S("div", {
        key: 8,
        class: "preview-modal-overlay",
        onClick: g[18] || (g[18] = //@ts-ignore
        (...f) => E(Fn) && E(Fn)(...f))
      }, [
        w("div", {
          class: "preview-modal-content",
          onClick: g[17] || (g[17] = Xn(() => {
          }, ["stop"]))
        }, [
          w("button", {
            class: "preview-modal-close",
            onClick: g[16] || (g[16] = //@ts-ignore
            (...f) => E(Fn) && E(Fn)(...f))
          }, "×"),
          E(N) && E(as)(E(N).type) ? (T(), S("div", U_, [
            w("img", {
              src: E(Ae)(E(N)),
              alt: E(N).filename,
              class: "preview-modal-image"
            }, null, 8, z_),
            w("div", H_, se(E(N).filename), 1)
          ])) : oe("", !0)
        ])
      ])) : oe("", !0)
    ], 6)) : (T(), S("div", W_));
  }
}), V_ = (t, e) => {
  const n = t.__vccOpts || t;
  for (const [s, r] of e)
    n[s] = r;
  return n;
}, K_ = /* @__PURE__ */ V_(j_, [["__scopeId", "data-v-11d88882"]]);
window.process || (window.process = { env: { NODE_ENV: "production" } });
const $t = window.__INITIAL_DATA__, yc = new URL(window.location.href), bc = yc.searchParams.get("preview") === "true", wc = (t) => {
  const e = yc.searchParams.get(t);
  if (!(!e || e === "undefined" || e.trim() === ""))
    return e;
}, G_ = bc ? wc("widget_id") || ($t == null ? void 0 : $t.widgetId) || void 0 : ($t == null ? void 0 : $t.widgetId) || void 0, Y_ = bc ? ($t == null ? void 0 : $t.initialToken) || wc("token") || void 0 : ($t == null ? void 0 : $t.initialToken) || void 0, X_ = uh(K_, {
  widgetId: G_,
  token: Y_ || void 0,
  initialAuthError: null
  // Let backend determine if auth is required
});
X_.mount("#app");
