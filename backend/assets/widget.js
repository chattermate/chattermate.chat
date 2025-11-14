var da = Object.defineProperty;
var pa = (e, t, n) => t in e ? da(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var Ie = (e, t, n) => pa(e, typeof t != "symbol" ? t + "" : t, n);
/**
* @vue/shared v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function $r(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const n of e.split(",")) t[n] = 1;
  return (n) => n in t;
}
const Le = {}, An = [], Mt = () => {
}, ga = () => !1, Os = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), Fr = (e) => e.startsWith("onUpdate:"), ot = Object.assign, Br = (e, t) => {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}, ma = Object.prototype.hasOwnProperty, Se = (e, t) => ma.call(e, t), ne = Array.isArray, En = (e) => Ps(e) === "[object Map]", So = (e) => Ps(e) === "[object Set]", ie = (e) => typeof e == "function", Ye = (e) => typeof e == "string", un = (e) => typeof e == "symbol", De = (e) => e !== null && typeof e == "object", Co = (e) => (De(e) || ie(e)) && ie(e.then) && ie(e.catch), To = Object.prototype.toString, Ps = (e) => To.call(e), _a = (e) => Ps(e).slice(8, -1), Ao = (e) => Ps(e) === "[object Object]", Nr = (e) => Ye(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, Hn = /* @__PURE__ */ $r(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), $s = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (n) => t[n] || (t[n] = e(n));
}, ya = /-(\w)/g, ln = $s(
  (e) => e.replace(ya, (t, n) => n ? n.toUpperCase() : "")
), va = /\B([A-Z])/g, fn = $s(
  (e) => e.replace(va, "-$1").toLowerCase()
), Eo = $s((e) => e.charAt(0).toUpperCase() + e.slice(1)), Ys = $s(
  (e) => e ? `on${Eo(e)}` : ""
), rn = (e, t) => !Object.is(e, t), ds = (e, ...t) => {
  for (let n = 0; n < e.length; n++)
    e[n](...t);
}, dr = (e, t, n, s = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: s,
    value: n
  });
}, pr = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let $i;
const Fs = () => $i || ($i = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function Ae(e) {
  if (ne(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
      const s = e[n], r = Ye(s) ? xa(s) : Ae(s);
      if (r)
        for (const i in r)
          t[i] = r[i];
    }
    return t;
  } else if (Ye(e) || De(e))
    return e;
}
const ba = /;(?![^(]*\))/g, wa = /:([^]+)/, ka = /\/\*[^]*?\*\//g;
function xa(e) {
  const t = {};
  return e.replace(ka, "").split(ba).forEach((n) => {
    if (n) {
      const s = n.split(wa);
      s.length > 1 && (t[s[0].trim()] = s[1].trim());
    }
  }), t;
}
function Ne(e) {
  let t = "";
  if (Ye(e))
    t = e;
  else if (ne(e))
    for (let n = 0; n < e.length; n++) {
      const s = Ne(e[n]);
      s && (t += s + " ");
    }
  else if (De(e))
    for (const n in e)
      e[n] && (t += n + " ");
  return t.trim();
}
const Sa = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", Ca = /* @__PURE__ */ $r(Sa);
function Ro(e) {
  return !!e || e === "";
}
const Io = (e) => !!(e && e.__v_isRef === !0), te = (e) => Ye(e) ? e : e == null ? "" : ne(e) || De(e) && (e.toString === To || !ie(e.toString)) ? Io(e) ? te(e.value) : JSON.stringify(e, Lo, 2) : String(e), Lo = (e, t) => Io(t) ? Lo(e, t.value) : En(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (n, [s, r], i) => (n[Js(s, i) + " =>"] = r, n),
    {}
  )
} : So(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((n) => Js(n))
} : un(t) ? Js(t) : De(t) && !ne(t) && !Ao(t) ? String(t) : t, Js = (e, t = "") => {
  var n;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    un(e) ? `Symbol(${(n = e.description) != null ? n : t})` : e
  );
};
/**
* @vue/reactivity v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let mt;
class Ta {
  constructor(t = !1) {
    this.detached = t, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this.parent = mt, !t && mt && (this.index = (mt.scopes || (mt.scopes = [])).push(
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
      const n = mt;
      try {
        return mt = this, t();
      } finally {
        mt = n;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = mt, mt = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    this._on > 0 && --this._on === 0 && (mt = this.prevScope, this.prevScope = void 0);
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
function Aa() {
  return mt;
}
let Fe;
const Qs = /* @__PURE__ */ new WeakSet();
class Oo {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, mt && mt.active && mt.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, Qs.has(this) && (Qs.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || $o(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, Fi(this), Fo(this);
    const t = Fe, n = It;
    Fe = this, It = !0;
    try {
      return this.fn();
    } finally {
      Bo(this), Fe = t, It = n, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        qr(t);
      this.deps = this.depsTail = void 0, Fi(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? Qs.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    gr(this) && this.run();
  }
  get dirty() {
    return gr(this);
  }
}
let Po = 0, Vn, Wn;
function $o(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = Wn, Wn = e;
    return;
  }
  e.next = Vn, Vn = e;
}
function Mr() {
  Po++;
}
function Dr() {
  if (--Po > 0)
    return;
  if (Wn) {
    let t = Wn;
    for (Wn = void 0; t; ) {
      const n = t.next;
      t.next = void 0, t.flags &= -9, t = n;
    }
  }
  let e;
  for (; Vn; ) {
    let t = Vn;
    for (Vn = void 0; t; ) {
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
function Fo(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Bo(e) {
  let t, n = e.depsTail, s = n;
  for (; s; ) {
    const r = s.prevDep;
    s.version === -1 ? (s === n && (n = r), qr(s), Ea(s)) : t = s, s.dep.activeLink = s.prevActiveLink, s.prevActiveLink = void 0, s = r;
  }
  e.deps = t, e.depsTail = n;
}
function gr(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (No(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function No(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === Yn) || (e.globalVersion = Yn, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !gr(e))))
    return;
  e.flags |= 2;
  const t = e.dep, n = Fe, s = It;
  Fe = e, It = !0;
  try {
    Fo(e);
    const r = e.fn(e._value);
    (t.version === 0 || rn(r, e._value)) && (e.flags |= 128, e._value = r, t.version++);
  } catch (r) {
    throw t.version++, r;
  } finally {
    Fe = n, It = s, Bo(e), e.flags &= -3;
  }
}
function qr(e, t = !1) {
  const { dep: n, prevSub: s, nextSub: r } = e;
  if (s && (s.nextSub = r, e.prevSub = void 0), r && (r.prevSub = s, e.nextSub = void 0), n.subs === e && (n.subs = s, !s && n.computed)) {
    n.computed.flags &= -5;
    for (let i = n.computed.deps; i; i = i.nextDep)
      qr(i, !0);
  }
  !t && !--n.sc && n.map && n.map.delete(n.key);
}
function Ea(e) {
  const { prevDep: t, nextDep: n } = e;
  t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
let It = !0;
const Mo = [];
function Yt() {
  Mo.push(It), It = !1;
}
function Jt() {
  const e = Mo.pop();
  It = e === void 0 ? !0 : e;
}
function Fi(e) {
  const { cleanup: t } = e;
  if (e.cleanup = void 0, t) {
    const n = Fe;
    Fe = void 0;
    try {
      t();
    } finally {
      Fe = n;
    }
  }
}
let Yn = 0;
class Ra {
  constructor(t, n) {
    this.sub = t, this.dep = n, this.version = n.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Ur {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(t) {
    if (!Fe || !It || Fe === this.computed)
      return;
    let n = this.activeLink;
    if (n === void 0 || n.sub !== Fe)
      n = this.activeLink = new Ra(Fe, this), Fe.deps ? (n.prevDep = Fe.depsTail, Fe.depsTail.nextDep = n, Fe.depsTail = n) : Fe.deps = Fe.depsTail = n, Do(n);
    else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
      const s = n.nextDep;
      s.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = s), n.prevDep = Fe.depsTail, n.nextDep = void 0, Fe.depsTail.nextDep = n, Fe.depsTail = n, Fe.deps === n && (Fe.deps = s);
    }
    return n;
  }
  trigger(t) {
    this.version++, Yn++, this.notify(t);
  }
  notify(t) {
    Mr();
    try {
      for (let n = this.subs; n; n = n.prevSub)
        n.sub.notify() && n.sub.dep.notify();
    } finally {
      Dr();
    }
  }
}
function Do(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let s = t.deps; s; s = s.nextDep)
        Do(s);
    }
    const n = e.dep.subs;
    n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
  }
}
const mr = /* @__PURE__ */ new WeakMap(), _n = Symbol(
  ""
), _r = Symbol(
  ""
), Jn = Symbol(
  ""
);
function rt(e, t, n) {
  if (It && Fe) {
    let s = mr.get(e);
    s || mr.set(e, s = /* @__PURE__ */ new Map());
    let r = s.get(n);
    r || (s.set(n, r = new Ur()), r.map = s, r.key = n), r.track();
  }
}
function Kt(e, t, n, s, r, i) {
  const o = mr.get(e);
  if (!o) {
    Yn++;
    return;
  }
  const l = (a) => {
    a && a.trigger();
  };
  if (Mr(), t === "clear")
    o.forEach(l);
  else {
    const a = ne(e), c = a && Nr(n);
    if (a && n === "length") {
      const u = Number(s);
      o.forEach((b, y) => {
        (y === "length" || y === Jn || !un(y) && y >= u) && l(b);
      });
    } else
      switch ((n !== void 0 || o.has(void 0)) && l(o.get(n)), c && l(o.get(Jn)), t) {
        case "add":
          a ? c && l(o.get("length")) : (l(o.get(_n)), En(e) && l(o.get(_r)));
          break;
        case "delete":
          a || (l(o.get(_n)), En(e) && l(o.get(_r)));
          break;
        case "set":
          En(e) && l(o.get(_n));
          break;
      }
  }
  Dr();
}
function xn(e) {
  const t = xe(e);
  return t === e ? t : (rt(t, "iterate", Jn), Et(e) ? t : t.map(tt));
}
function Bs(e) {
  return rt(e = xe(e), "iterate", Jn), e;
}
const Ia = {
  __proto__: null,
  [Symbol.iterator]() {
    return er(this, Symbol.iterator, tt);
  },
  concat(...e) {
    return xn(this).concat(
      ...e.map((t) => ne(t) ? xn(t) : t)
    );
  },
  entries() {
    return er(this, "entries", (e) => (e[1] = tt(e[1]), e));
  },
  every(e, t) {
    return Wt(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return Wt(this, "filter", e, t, (n) => n.map(tt), arguments);
  },
  find(e, t) {
    return Wt(this, "find", e, t, tt, arguments);
  },
  findIndex(e, t) {
    return Wt(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return Wt(this, "findLast", e, t, tt, arguments);
  },
  findLastIndex(e, t) {
    return Wt(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return Wt(this, "forEach", e, t, void 0, arguments);
  },
  includes(...e) {
    return tr(this, "includes", e);
  },
  indexOf(...e) {
    return tr(this, "indexOf", e);
  },
  join(e) {
    return xn(this).join(e);
  },
  // keys() iterator only reads `length`, no optimisation required
  lastIndexOf(...e) {
    return tr(this, "lastIndexOf", e);
  },
  map(e, t) {
    return Wt(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return Fn(this, "pop");
  },
  push(...e) {
    return Fn(this, "push", e);
  },
  reduce(e, ...t) {
    return Bi(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return Bi(this, "reduceRight", e, t);
  },
  shift() {
    return Fn(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return Wt(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return Fn(this, "splice", e);
  },
  toReversed() {
    return xn(this).toReversed();
  },
  toSorted(e) {
    return xn(this).toSorted(e);
  },
  toSpliced(...e) {
    return xn(this).toSpliced(...e);
  },
  unshift(...e) {
    return Fn(this, "unshift", e);
  },
  values() {
    return er(this, "values", tt);
  }
};
function er(e, t, n) {
  const s = Bs(e), r = s[t]();
  return s !== e && !Et(e) && (r._next = r.next, r.next = () => {
    const i = r._next();
    return i.value && (i.value = n(i.value)), i;
  }), r;
}
const La = Array.prototype;
function Wt(e, t, n, s, r, i) {
  const o = Bs(e), l = o !== e && !Et(e), a = o[t];
  if (a !== La[t]) {
    const b = a.apply(e, i);
    return l ? tt(b) : b;
  }
  let c = n;
  o !== e && (l ? c = function(b, y) {
    return n.call(this, tt(b), y, e);
  } : n.length > 2 && (c = function(b, y) {
    return n.call(this, b, y, e);
  }));
  const u = a.call(o, c, s);
  return l && r ? r(u) : u;
}
function Bi(e, t, n, s) {
  const r = Bs(e);
  let i = n;
  return r !== e && (Et(e) ? n.length > 3 && (i = function(o, l, a) {
    return n.call(this, o, l, a, e);
  }) : i = function(o, l, a) {
    return n.call(this, o, tt(l), a, e);
  }), r[t](i, ...s);
}
function tr(e, t, n) {
  const s = xe(e);
  rt(s, "iterate", Jn);
  const r = s[t](...n);
  return (r === -1 || r === !1) && Wr(n[0]) ? (n[0] = xe(n[0]), s[t](...n)) : r;
}
function Fn(e, t, n = []) {
  Yt(), Mr();
  const s = xe(e)[t].apply(e, n);
  return Dr(), Jt(), s;
}
const Oa = /* @__PURE__ */ $r("__proto__,__v_isRef,__isVue"), qo = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(un)
);
function Pa(e) {
  un(e) || (e = String(e));
  const t = xe(this);
  return rt(t, "has", e), t.hasOwnProperty(e);
}
class Uo {
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
      return s === (r ? i ? Ha : Wo : i ? Vo : Ho).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(s) ? t : void 0;
    const o = ne(t);
    if (!r) {
      let a;
      if (o && (a = Ia[n]))
        return a;
      if (n === "hasOwnProperty")
        return Pa;
    }
    const l = Reflect.get(
      t,
      n,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      it(t) ? t : s
    );
    return (un(n) ? qo.has(n) : Oa(n)) || (r || rt(t, "get", n), i) ? l : it(l) ? o && Nr(n) ? l : l.value : De(l) ? r ? jo(l) : Hr(l) : l;
  }
}
class zo extends Uo {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, n, s, r) {
    let i = t[n];
    if (!this._isShallow) {
      const a = an(i);
      if (!Et(s) && !an(s) && (i = xe(i), s = xe(s)), !ne(t) && it(i) && !it(s))
        return a ? !1 : (i.value = s, !0);
    }
    const o = ne(t) && Nr(n) ? Number(n) < t.length : Se(t, n), l = Reflect.set(
      t,
      n,
      s,
      it(t) ? t : r
    );
    return t === xe(r) && (o ? rn(s, i) && Kt(t, "set", n, s) : Kt(t, "add", n, s)), l;
  }
  deleteProperty(t, n) {
    const s = Se(t, n);
    t[n];
    const r = Reflect.deleteProperty(t, n);
    return r && s && Kt(t, "delete", n, void 0), r;
  }
  has(t, n) {
    const s = Reflect.has(t, n);
    return (!un(n) || !qo.has(n)) && rt(t, "has", n), s;
  }
  ownKeys(t) {
    return rt(
      t,
      "iterate",
      ne(t) ? "length" : _n
    ), Reflect.ownKeys(t);
  }
}
class $a extends Uo {
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
const Fa = /* @__PURE__ */ new zo(), Ba = /* @__PURE__ */ new $a(), Na = /* @__PURE__ */ new zo(!0);
const yr = (e) => e, ls = (e) => Reflect.getPrototypeOf(e);
function Ma(e, t, n) {
  return function(...s) {
    const r = this.__v_raw, i = xe(r), o = En(i), l = e === "entries" || e === Symbol.iterator && o, a = e === "keys" && o, c = r[e](...s), u = n ? yr : t ? xs : tt;
    return !t && rt(
      i,
      "iterate",
      a ? _r : _n
    ), {
      // iterator protocol
      next() {
        const { value: b, done: y } = c.next();
        return y ? { value: b, done: y } : {
          value: l ? [u(b[0]), u(b[1])] : u(b),
          done: y
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function as(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function Da(e, t) {
  const n = {
    get(r) {
      const i = this.__v_raw, o = xe(i), l = xe(r);
      e || (rn(r, l) && rt(o, "get", r), rt(o, "get", l));
      const { has: a } = ls(o), c = t ? yr : e ? xs : tt;
      if (a.call(o, r))
        return c(i.get(r));
      if (a.call(o, l))
        return c(i.get(l));
      i !== o && i.get(r);
    },
    get size() {
      const r = this.__v_raw;
      return !e && rt(xe(r), "iterate", _n), Reflect.get(r, "size", r);
    },
    has(r) {
      const i = this.__v_raw, o = xe(i), l = xe(r);
      return e || (rn(r, l) && rt(o, "has", r), rt(o, "has", l)), r === l ? i.has(r) : i.has(r) || i.has(l);
    },
    forEach(r, i) {
      const o = this, l = o.__v_raw, a = xe(l), c = t ? yr : e ? xs : tt;
      return !e && rt(a, "iterate", _n), l.forEach((u, b) => r.call(i, c(u), c(b), o));
    }
  };
  return ot(
    n,
    e ? {
      add: as("add"),
      set: as("set"),
      delete: as("delete"),
      clear: as("clear")
    } : {
      add(r) {
        !t && !Et(r) && !an(r) && (r = xe(r));
        const i = xe(this);
        return ls(i).has.call(i, r) || (i.add(r), Kt(i, "add", r, r)), this;
      },
      set(r, i) {
        !t && !Et(i) && !an(i) && (i = xe(i));
        const o = xe(this), { has: l, get: a } = ls(o);
        let c = l.call(o, r);
        c || (r = xe(r), c = l.call(o, r));
        const u = a.call(o, r);
        return o.set(r, i), c ? rn(i, u) && Kt(o, "set", r, i) : Kt(o, "add", r, i), this;
      },
      delete(r) {
        const i = xe(this), { has: o, get: l } = ls(i);
        let a = o.call(i, r);
        a || (r = xe(r), a = o.call(i, r)), l && l.call(i, r);
        const c = i.delete(r);
        return a && Kt(i, "delete", r, void 0), c;
      },
      clear() {
        const r = xe(this), i = r.size !== 0, o = r.clear();
        return i && Kt(
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
    n[r] = Ma(r, e, t);
  }), n;
}
function zr(e, t) {
  const n = Da(e, t);
  return (s, r, i) => r === "__v_isReactive" ? !e : r === "__v_isReadonly" ? e : r === "__v_raw" ? s : Reflect.get(
    Se(n, r) && r in s ? n : s,
    r,
    i
  );
}
const qa = {
  get: /* @__PURE__ */ zr(!1, !1)
}, Ua = {
  get: /* @__PURE__ */ zr(!1, !0)
}, za = {
  get: /* @__PURE__ */ zr(!0, !1)
};
const Ho = /* @__PURE__ */ new WeakMap(), Vo = /* @__PURE__ */ new WeakMap(), Wo = /* @__PURE__ */ new WeakMap(), Ha = /* @__PURE__ */ new WeakMap();
function Va(e) {
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
function Wa(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : Va(_a(e));
}
function Hr(e) {
  return an(e) ? e : Vr(
    e,
    !1,
    Fa,
    qa,
    Ho
  );
}
function ja(e) {
  return Vr(
    e,
    !1,
    Na,
    Ua,
    Vo
  );
}
function jo(e) {
  return Vr(
    e,
    !0,
    Ba,
    za,
    Wo
  );
}
function Vr(e, t, n, s, r) {
  if (!De(e) || e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const i = Wa(e);
  if (i === 0)
    return e;
  const o = r.get(e);
  if (o)
    return o;
  const l = new Proxy(
    e,
    i === 2 ? s : n
  );
  return r.set(e, l), l;
}
function Rn(e) {
  return an(e) ? Rn(e.__v_raw) : !!(e && e.__v_isReactive);
}
function an(e) {
  return !!(e && e.__v_isReadonly);
}
function Et(e) {
  return !!(e && e.__v_isShallow);
}
function Wr(e) {
  return e ? !!e.__v_raw : !1;
}
function xe(e) {
  const t = e && e.__v_raw;
  return t ? xe(t) : e;
}
function Ka(e) {
  return !Se(e, "__v_skip") && Object.isExtensible(e) && dr(e, "__v_skip", !0), e;
}
const tt = (e) => De(e) ? Hr(e) : e, xs = (e) => De(e) ? jo(e) : e;
function it(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function ae(e) {
  return Za(e, !1);
}
function Za(e, t) {
  return it(e) ? e : new Ga(e, t);
}
class Ga {
  constructor(t, n) {
    this.dep = new Ur(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? t : xe(t), this._value = n ? t : tt(t), this.__v_isShallow = n;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const n = this._rawValue, s = this.__v_isShallow || Et(t) || an(t);
    t = s ? t : xe(t), rn(t, n) && (this._rawValue = t, this._value = s ? t : tt(t), this.dep.trigger());
  }
}
function x(e) {
  return it(e) ? e.value : e;
}
const Xa = {
  get: (e, t, n) => t === "__v_raw" ? e : x(Reflect.get(e, t, n)),
  set: (e, t, n, s) => {
    const r = e[t];
    return it(r) && !it(n) ? (r.value = n, !0) : Reflect.set(e, t, n, s);
  }
};
function Ko(e) {
  return Rn(e) ? e : new Proxy(e, Xa);
}
class Ya {
  constructor(t, n, s) {
    this.fn = t, this.setter = n, this._value = void 0, this.dep = new Ur(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Yn - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = s;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    Fe !== this)
      return $o(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return No(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
function Ja(e, t, n = !1) {
  let s, r;
  return ie(e) ? s = e : (s = e.get, r = e.set), new Ya(s, r, n);
}
const cs = {}, Ss = /* @__PURE__ */ new WeakMap();
let mn;
function Qa(e, t = !1, n = mn) {
  if (n) {
    let s = Ss.get(n);
    s || Ss.set(n, s = []), s.push(e);
  }
}
function ec(e, t, n = Le) {
  const { immediate: s, deep: r, once: i, scheduler: o, augmentJob: l, call: a } = n, c = (H) => r ? H : Et(H) || r === !1 || r === 0 ? Zt(H, 1) : Zt(H);
  let u, b, y, P, B = !1, U = !1;
  if (it(e) ? (b = () => e.value, B = Et(e)) : Rn(e) ? (b = () => c(e), B = !0) : ne(e) ? (U = !0, B = e.some((H) => Rn(H) || Et(H)), b = () => e.map((H) => {
    if (it(H))
      return H.value;
    if (Rn(H))
      return c(H);
    if (ie(H))
      return a ? a(H, 2) : H();
  })) : ie(e) ? t ? b = a ? () => a(e, 2) : e : b = () => {
    if (y) {
      Yt();
      try {
        y();
      } finally {
        Jt();
      }
    }
    const H = mn;
    mn = u;
    try {
      return a ? a(e, 3, [P]) : e(P);
    } finally {
      mn = H;
    }
  } : b = Mt, t && r) {
    const H = b, N = r === !0 ? 1 / 0 : r;
    b = () => Zt(H(), N);
  }
  const Ee = Aa(), oe = () => {
    u.stop(), Ee && Ee.active && Br(Ee.effects, u);
  };
  if (i && t) {
    const H = t;
    t = (...N) => {
      H(...N), oe();
    };
  }
  let _e = U ? new Array(e.length).fill(cs) : cs;
  const ye = (H) => {
    if (!(!(u.flags & 1) || !u.dirty && !H))
      if (t) {
        const N = u.run();
        if (r || B || (U ? N.some((Y, K) => rn(Y, _e[K])) : rn(N, _e))) {
          y && y();
          const Y = mn;
          mn = u;
          try {
            const K = [
              N,
              // pass undefined as the old value when it's changed for the first time
              _e === cs ? void 0 : U && _e[0] === cs ? [] : _e,
              P
            ];
            _e = N, a ? a(t, 3, K) : (
              // @ts-expect-error
              t(...K)
            );
          } finally {
            mn = Y;
          }
        }
      } else
        u.run();
  };
  return l && l(ye), u = new Oo(b), u.scheduler = o ? () => o(ye, !1) : ye, P = (H) => Qa(H, !1, u), y = u.onStop = () => {
    const H = Ss.get(u);
    if (H) {
      if (a)
        a(H, 4);
      else
        for (const N of H) N();
      Ss.delete(u);
    }
  }, t ? s ? ye(!0) : _e = u.run() : o ? o(ye.bind(null, !0), !0) : u.run(), oe.pause = u.pause.bind(u), oe.resume = u.resume.bind(u), oe.stop = oe, oe;
}
function Zt(e, t = 1 / 0, n) {
  if (t <= 0 || !De(e) || e.__v_skip || (n = n || /* @__PURE__ */ new Set(), n.has(e)))
    return e;
  if (n.add(e), t--, it(e))
    Zt(e.value, t, n);
  else if (ne(e))
    for (let s = 0; s < e.length; s++)
      Zt(e[s], t, n);
  else if (So(e) || En(e))
    e.forEach((s) => {
      Zt(s, t, n);
    });
  else if (Ao(e)) {
    for (const s in e)
      Zt(e[s], t, n);
    for (const s of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, s) && Zt(e[s], t, n);
  }
  return e;
}
/**
* @vue/runtime-core v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function ns(e, t, n, s) {
  try {
    return s ? e(...s) : e();
  } catch (r) {
    Ns(r, t, n);
  }
}
function Ut(e, t, n, s) {
  if (ie(e)) {
    const r = ns(e, t, n, s);
    return r && Co(r) && r.catch((i) => {
      Ns(i, t, n);
    }), r;
  }
  if (ne(e)) {
    const r = [];
    for (let i = 0; i < e.length; i++)
      r.push(Ut(e[i], t, n, s));
    return r;
  }
}
function Ns(e, t, n, s = !0) {
  const r = t ? t.vnode : null, { errorHandler: i, throwUnhandledErrorInProduction: o } = t && t.appContext.config || Le;
  if (t) {
    let l = t.parent;
    const a = t.proxy, c = `https://vuejs.org/error-reference/#runtime-${n}`;
    for (; l; ) {
      const u = l.ec;
      if (u) {
        for (let b = 0; b < u.length; b++)
          if (u[b](e, a, c) === !1)
            return;
      }
      l = l.parent;
    }
    if (i) {
      Yt(), ns(i, null, 10, [
        e,
        a,
        c
      ]), Jt();
      return;
    }
  }
  tc(e, n, r, s, o);
}
function tc(e, t, n, s = !0, r = !1) {
  if (r)
    throw e;
  console.error(e);
}
const ft = [];
let Bt = -1;
const In = [];
let tn = null, Cn = 0;
const Zo = /* @__PURE__ */ Promise.resolve();
let Cs = null;
function Go(e) {
  const t = Cs || Zo;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function nc(e) {
  let t = Bt + 1, n = ft.length;
  for (; t < n; ) {
    const s = t + n >>> 1, r = ft[s], i = Qn(r);
    i < e || i === e && r.flags & 2 ? t = s + 1 : n = s;
  }
  return t;
}
function jr(e) {
  if (!(e.flags & 1)) {
    const t = Qn(e), n = ft[ft.length - 1];
    !n || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= Qn(n) ? ft.push(e) : ft.splice(nc(t), 0, e), e.flags |= 1, Xo();
  }
}
function Xo() {
  Cs || (Cs = Zo.then(Jo));
}
function sc(e) {
  ne(e) ? In.push(...e) : tn && e.id === -1 ? tn.splice(Cn + 1, 0, e) : e.flags & 1 || (In.push(e), e.flags |= 1), Xo();
}
function Ni(e, t, n = Bt + 1) {
  for (; n < ft.length; n++) {
    const s = ft[n];
    if (s && s.flags & 2) {
      if (e && s.id !== e.uid)
        continue;
      ft.splice(n, 1), n--, s.flags & 4 && (s.flags &= -2), s(), s.flags & 4 || (s.flags &= -2);
    }
  }
}
function Yo(e) {
  if (In.length) {
    const t = [...new Set(In)].sort(
      (n, s) => Qn(n) - Qn(s)
    );
    if (In.length = 0, tn) {
      tn.push(...t);
      return;
    }
    for (tn = t, Cn = 0; Cn < tn.length; Cn++) {
      const n = tn[Cn];
      n.flags & 4 && (n.flags &= -2), n.flags & 8 || n(), n.flags &= -2;
    }
    tn = null, Cn = 0;
  }
}
const Qn = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function Jo(e) {
  try {
    for (Bt = 0; Bt < ft.length; Bt++) {
      const t = ft[Bt];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), ns(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; Bt < ft.length; Bt++) {
      const t = ft[Bt];
      t && (t.flags &= -2);
    }
    Bt = -1, ft.length = 0, Yo(), Cs = null, (ft.length || In.length) && Jo();
  }
}
let At = null, Qo = null;
function Ts(e) {
  const t = At;
  return At = e, Qo = e && e.type.__scopeId || null, t;
}
function rc(e, t = At, n) {
  if (!t || e._n)
    return e;
  const s = (...r) => {
    s._d && ji(-1);
    const i = Ts(t);
    let o;
    try {
      o = e(...r);
    } finally {
      Ts(i), s._d && ji(1);
    }
    return o;
  };
  return s._n = !0, s._c = !0, s._d = !0, s;
}
function hn(e, t) {
  if (At === null)
    return e;
  const n = Us(At), s = e.dirs || (e.dirs = []);
  for (let r = 0; r < t.length; r++) {
    let [i, o, l, a = Le] = t[r];
    i && (ie(i) && (i = {
      mounted: i,
      updated: i
    }), i.deep && Zt(o), s.push({
      dir: i,
      instance: n,
      value: o,
      oldValue: void 0,
      arg: l,
      modifiers: a
    }));
  }
  return e;
}
function dn(e, t, n, s) {
  const r = e.dirs, i = t && t.dirs;
  for (let o = 0; o < r.length; o++) {
    const l = r[o];
    i && (l.oldValue = i[o].value);
    let a = l.dir[s];
    a && (Yt(), Ut(a, n, 8, [
      e.el,
      l,
      e,
      t
    ]), Jt());
  }
}
const ic = Symbol("_vte"), oc = (e) => e.__isTeleport;
function Kr(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, Kr(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function lc(e, t) {
  return ie(e) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    ot({ name: e.name }, t, { setup: e })
  ) : e;
}
function el(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
function jn(e, t, n, s, r = !1) {
  if (ne(e)) {
    e.forEach(
      (B, U) => jn(
        B,
        t && (ne(t) ? t[U] : t),
        n,
        s,
        r
      )
    );
    return;
  }
  if (Kn(s) && !r) {
    s.shapeFlag & 512 && s.type.__asyncResolved && s.component.subTree.component && jn(e, t, n, s.component.subTree);
    return;
  }
  const i = s.shapeFlag & 4 ? Us(s.component) : s.el, o = r ? null : i, { i: l, r: a } = e, c = t && t.r, u = l.refs === Le ? l.refs = {} : l.refs, b = l.setupState, y = xe(b), P = b === Le ? () => !1 : (B) => Se(y, B);
  if (c != null && c !== a && (Ye(c) ? (u[c] = null, P(c) && (b[c] = null)) : it(c) && (c.value = null)), ie(a))
    ns(a, l, 12, [o, u]);
  else {
    const B = Ye(a), U = it(a);
    if (B || U) {
      const Ee = () => {
        if (e.f) {
          const oe = B ? P(a) ? b[a] : u[a] : a.value;
          r ? ne(oe) && Br(oe, i) : ne(oe) ? oe.includes(i) || oe.push(i) : B ? (u[a] = [i], P(a) && (b[a] = u[a])) : (a.value = [i], e.k && (u[e.k] = a.value));
        } else B ? (u[a] = o, P(a) && (b[a] = o)) : U && (a.value = o, e.k && (u[e.k] = o));
      };
      o ? (Ee.id = -1, kt(Ee, n)) : Ee();
    }
  }
}
Fs().requestIdleCallback;
Fs().cancelIdleCallback;
const Kn = (e) => !!e.type.__asyncLoader, tl = (e) => e.type.__isKeepAlive;
function ac(e, t) {
  nl(e, "a", t);
}
function cc(e, t) {
  nl(e, "da", t);
}
function nl(e, t, n = ht) {
  const s = e.__wdc || (e.__wdc = () => {
    let r = n;
    for (; r; ) {
      if (r.isDeactivated)
        return;
      r = r.parent;
    }
    return e();
  });
  if (Ms(t, s, n), n) {
    let r = n.parent;
    for (; r && r.parent; )
      tl(r.parent.vnode) && uc(s, t, n, r), r = r.parent;
  }
}
function uc(e, t, n, s) {
  const r = Ms(
    t,
    e,
    s,
    !0
    /* prepend */
  );
  Zr(() => {
    Br(s[t], r);
  }, n);
}
function Ms(e, t, n = ht, s = !1) {
  if (n) {
    const r = n[e] || (n[e] = []), i = t.__weh || (t.__weh = (...o) => {
      Yt();
      const l = ss(n), a = Ut(t, n, e, o);
      return l(), Jt(), a;
    });
    return s ? r.unshift(i) : r.push(i), i;
  }
}
const Qt = (e) => (t, n = ht) => {
  (!ts || e === "sp") && Ms(e, (...s) => t(...s), n);
}, fc = Qt("bm"), sl = Qt("m"), hc = Qt(
  "bu"
), dc = Qt("u"), pc = Qt(
  "bum"
), Zr = Qt("um"), gc = Qt(
  "sp"
), mc = Qt("rtg"), _c = Qt("rtc");
function yc(e, t = ht) {
  Ms("ec", e, t);
}
const vc = Symbol.for("v-ndc");
function Ct(e, t, n, s) {
  let r;
  const i = n, o = ne(e);
  if (o || Ye(e)) {
    const l = o && Rn(e);
    let a = !1, c = !1;
    l && (a = !Et(e), c = an(e), e = Bs(e)), r = new Array(e.length);
    for (let u = 0, b = e.length; u < b; u++)
      r[u] = t(
        a ? c ? xs(tt(e[u])) : tt(e[u]) : e[u],
        u,
        void 0,
        i
      );
  } else if (typeof e == "number") {
    r = new Array(e);
    for (let l = 0; l < e; l++)
      r[l] = t(l + 1, l, void 0, i);
  } else if (De(e))
    if (e[Symbol.iterator])
      r = Array.from(
        e,
        (l, a) => t(l, a, void 0, i)
      );
    else {
      const l = Object.keys(e);
      r = new Array(l.length);
      for (let a = 0, c = l.length; a < c; a++) {
        const u = l[a];
        r[a] = t(e[u], u, a, i);
      }
    }
  else
    r = [];
  return r;
}
const vr = (e) => e ? Sl(e) ? Us(e) : vr(e.parent) : null, Zn = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ ot(/* @__PURE__ */ Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => e.props,
    $attrs: (e) => e.attrs,
    $slots: (e) => e.slots,
    $refs: (e) => e.refs,
    $parent: (e) => vr(e.parent),
    $root: (e) => vr(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => il(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      jr(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = Go.bind(e.proxy)),
    $watch: (e) => Uc.bind(e)
  })
), nr = (e, t) => e !== Le && !e.__isScriptSetup && Se(e, t), bc = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: n, setupState: s, data: r, props: i, accessCache: o, type: l, appContext: a } = e;
    let c;
    if (t[0] !== "$") {
      const P = o[t];
      if (P !== void 0)
        switch (P) {
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
        if (nr(s, t))
          return o[t] = 1, s[t];
        if (r !== Le && Se(r, t))
          return o[t] = 2, r[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (c = e.propsOptions[0]) && Se(c, t)
        )
          return o[t] = 3, i[t];
        if (n !== Le && Se(n, t))
          return o[t] = 4, n[t];
        br && (o[t] = 0);
      }
    }
    const u = Zn[t];
    let b, y;
    if (u)
      return t === "$attrs" && rt(e.attrs, "get", ""), u(e);
    if (
      // css module (injected by vue-loader)
      (b = l.__cssModules) && (b = b[t])
    )
      return b;
    if (n !== Le && Se(n, t))
      return o[t] = 4, n[t];
    if (
      // global properties
      y = a.config.globalProperties, Se(y, t)
    )
      return y[t];
  },
  set({ _: e }, t, n) {
    const { data: s, setupState: r, ctx: i } = e;
    return nr(r, t) ? (r[t] = n, !0) : s !== Le && Se(s, t) ? (s[t] = n, !0) : Se(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (i[t] = n, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: n, ctx: s, appContext: r, propsOptions: i }
  }, o) {
    let l;
    return !!n[o] || e !== Le && Se(e, o) || nr(t, o) || (l = i[0]) && Se(l, o) || Se(s, o) || Se(Zn, o) || Se(r.config.globalProperties, o);
  },
  defineProperty(e, t, n) {
    return n.get != null ? e._.accessCache[t] = 0 : Se(n, "value") && this.set(e, t, n.value, null), Reflect.defineProperty(e, t, n);
  }
};
function Mi(e) {
  return ne(e) ? e.reduce(
    (t, n) => (t[n] = null, t),
    {}
  ) : e;
}
let br = !0;
function wc(e) {
  const t = il(e), n = e.proxy, s = e.ctx;
  br = !1, t.beforeCreate && Di(t.beforeCreate, e, "bc");
  const {
    // state
    data: r,
    computed: i,
    methods: o,
    watch: l,
    provide: a,
    inject: c,
    // lifecycle
    created: u,
    beforeMount: b,
    mounted: y,
    beforeUpdate: P,
    updated: B,
    activated: U,
    deactivated: Ee,
    beforeDestroy: oe,
    beforeUnmount: _e,
    destroyed: ye,
    unmounted: H,
    render: N,
    renderTracked: Y,
    renderTriggered: K,
    errorCaptured: we,
    serverPrefetch: qe,
    // public API
    expose: Oe,
    inheritAttrs: je,
    // assets
    components: fe,
    directives: Ue,
    filters: Ve
  } = t;
  if (c && kc(c, s, null), o)
    for (const X in o) {
      const J = o[X];
      ie(J) && (s[X] = J.bind(n));
    }
  if (r) {
    const X = r.call(n, n);
    De(X) && (e.data = Hr(X));
  }
  if (br = !0, i)
    for (const X in i) {
      const J = i[X], ze = ie(J) ? J.bind(n, n) : ie(J.get) ? J.get.bind(n, n) : Mt, M = !ie(J) && ie(J.set) ? J.set.bind(n) : Mt, he = We({
        get: ze,
        set: M
      });
      Object.defineProperty(s, X, {
        enumerable: !0,
        configurable: !0,
        get: () => he.value,
        set: (D) => he.value = D
      });
    }
  if (l)
    for (const X in l)
      rl(l[X], s, n, X);
  if (a) {
    const X = ie(a) ? a.call(n) : a;
    Reflect.ownKeys(X).forEach((J) => {
      Ec(J, X[J]);
    });
  }
  u && Di(u, e, "c");
  function ee(X, J) {
    ne(J) ? J.forEach((ze) => X(ze.bind(n))) : J && X(J.bind(n));
  }
  if (ee(fc, b), ee(sl, y), ee(hc, P), ee(dc, B), ee(ac, U), ee(cc, Ee), ee(yc, we), ee(_c, Y), ee(mc, K), ee(pc, _e), ee(Zr, H), ee(gc, qe), ne(Oe))
    if (Oe.length) {
      const X = e.exposed || (e.exposed = {});
      Oe.forEach((J) => {
        Object.defineProperty(X, J, {
          get: () => n[J],
          set: (ze) => n[J] = ze,
          enumerable: !0
        });
      });
    } else e.exposed || (e.exposed = {});
  N && e.render === Mt && (e.render = N), je != null && (e.inheritAttrs = je), fe && (e.components = fe), Ue && (e.directives = Ue), qe && el(e);
}
function kc(e, t, n = Mt) {
  ne(e) && (e = wr(e));
  for (const s in e) {
    const r = e[s];
    let i;
    De(r) ? "default" in r ? i = ps(
      r.from || s,
      r.default,
      !0
    ) : i = ps(r.from || s) : i = ps(r), it(i) ? Object.defineProperty(t, s, {
      enumerable: !0,
      configurable: !0,
      get: () => i.value,
      set: (o) => i.value = o
    }) : t[s] = i;
  }
}
function Di(e, t, n) {
  Ut(
    ne(e) ? e.map((s) => s.bind(t.proxy)) : e.bind(t.proxy),
    t,
    n
  );
}
function rl(e, t, n, s) {
  let r = s.includes(".") ? yl(n, s) : () => n[s];
  if (Ye(e)) {
    const i = t[e];
    ie(i) && sn(r, i);
  } else if (ie(e))
    sn(r, e.bind(n));
  else if (De(e))
    if (ne(e))
      e.forEach((i) => rl(i, t, n, s));
    else {
      const i = ie(e.handler) ? e.handler.bind(n) : t[e.handler];
      ie(i) && sn(r, i, e);
    }
}
function il(e) {
  const t = e.type, { mixins: n, extends: s } = t, {
    mixins: r,
    optionsCache: i,
    config: { optionMergeStrategies: o }
  } = e.appContext, l = i.get(t);
  let a;
  return l ? a = l : !r.length && !n && !s ? a = t : (a = {}, r.length && r.forEach(
    (c) => As(a, c, o, !0)
  ), As(a, t, o)), De(t) && i.set(t, a), a;
}
function As(e, t, n, s = !1) {
  const { mixins: r, extends: i } = t;
  i && As(e, i, n, !0), r && r.forEach(
    (o) => As(e, o, n, !0)
  );
  for (const o in t)
    if (!(s && o === "expose")) {
      const l = xc[o] || n && n[o];
      e[o] = l ? l(e[o], t[o]) : t[o];
    }
  return e;
}
const xc = {
  data: qi,
  props: Ui,
  emits: Ui,
  // objects
  methods: Un,
  computed: Un,
  // lifecycle
  beforeCreate: ut,
  created: ut,
  beforeMount: ut,
  mounted: ut,
  beforeUpdate: ut,
  updated: ut,
  beforeDestroy: ut,
  beforeUnmount: ut,
  destroyed: ut,
  unmounted: ut,
  activated: ut,
  deactivated: ut,
  errorCaptured: ut,
  serverPrefetch: ut,
  // assets
  components: Un,
  directives: Un,
  // watch
  watch: Cc,
  // provide / inject
  provide: qi,
  inject: Sc
};
function qi(e, t) {
  return t ? e ? function() {
    return ot(
      ie(e) ? e.call(this, this) : e,
      ie(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function Sc(e, t) {
  return Un(wr(e), wr(t));
}
function wr(e) {
  if (ne(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++)
      t[e[n]] = e[n];
    return t;
  }
  return e;
}
function ut(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function Un(e, t) {
  return e ? ot(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function Ui(e, t) {
  return e ? ne(e) && ne(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : ot(
    /* @__PURE__ */ Object.create(null),
    Mi(e),
    Mi(t ?? {})
  ) : t;
}
function Cc(e, t) {
  if (!e) return t;
  if (!t) return e;
  const n = ot(/* @__PURE__ */ Object.create(null), e);
  for (const s in t)
    n[s] = ut(e[s], t[s]);
  return n;
}
function ol() {
  return {
    app: null,
    config: {
      isNativeTag: ga,
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
let Tc = 0;
function Ac(e, t) {
  return function(s, r = null) {
    ie(s) || (s = ot({}, s)), r != null && !De(r) && (r = null);
    const i = ol(), o = /* @__PURE__ */ new WeakSet(), l = [];
    let a = !1;
    const c = i.app = {
      _uid: Tc++,
      _component: s,
      _props: r,
      _container: null,
      _context: i,
      _instance: null,
      version: uu,
      get config() {
        return i.config;
      },
      set config(u) {
      },
      use(u, ...b) {
        return o.has(u) || (u && ie(u.install) ? (o.add(u), u.install(c, ...b)) : ie(u) && (o.add(u), u(c, ...b))), c;
      },
      mixin(u) {
        return i.mixins.includes(u) || i.mixins.push(u), c;
      },
      component(u, b) {
        return b ? (i.components[u] = b, c) : i.components[u];
      },
      directive(u, b) {
        return b ? (i.directives[u] = b, c) : i.directives[u];
      },
      mount(u, b, y) {
        if (!a) {
          const P = c._ceVNode || Dt(s, r);
          return P.appContext = i, y === !0 ? y = "svg" : y === !1 && (y = void 0), e(P, u, y), a = !0, c._container = u, u.__vue_app__ = c, Us(P.component);
        }
      },
      onUnmount(u) {
        l.push(u);
      },
      unmount() {
        a && (Ut(
          l,
          c._instance,
          16
        ), e(null, c._container), delete c._container.__vue_app__);
      },
      provide(u, b) {
        return i.provides[u] = b, c;
      },
      runWithContext(u) {
        const b = Ln;
        Ln = c;
        try {
          return u();
        } finally {
          Ln = b;
        }
      }
    };
    return c;
  };
}
let Ln = null;
function Ec(e, t) {
  if (ht) {
    let n = ht.provides;
    const s = ht.parent && ht.parent.provides;
    s === n && (n = ht.provides = Object.create(s)), n[e] = t;
  }
}
function ps(e, t, n = !1) {
  const s = ru();
  if (s || Ln) {
    let r = Ln ? Ln._context.provides : s ? s.parent == null || s.ce ? s.vnode.appContext && s.vnode.appContext.provides : s.parent.provides : void 0;
    if (r && e in r)
      return r[e];
    if (arguments.length > 1)
      return n && ie(t) ? t.call(s && s.proxy) : t;
  }
}
const ll = {}, al = () => Object.create(ll), cl = (e) => Object.getPrototypeOf(e) === ll;
function Rc(e, t, n, s = !1) {
  const r = {}, i = al();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), ul(e, t, r, i);
  for (const o in e.propsOptions[0])
    o in r || (r[o] = void 0);
  n ? e.props = s ? r : ja(r) : e.type.props ? e.props = r : e.props = i, e.attrs = i;
}
function Ic(e, t, n, s) {
  const {
    props: r,
    attrs: i,
    vnode: { patchFlag: o }
  } = e, l = xe(r), [a] = e.propsOptions;
  let c = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (s || o > 0) && !(o & 16)
  ) {
    if (o & 8) {
      const u = e.vnode.dynamicProps;
      for (let b = 0; b < u.length; b++) {
        let y = u[b];
        if (Ds(e.emitsOptions, y))
          continue;
        const P = t[y];
        if (a)
          if (Se(i, y))
            P !== i[y] && (i[y] = P, c = !0);
          else {
            const B = ln(y);
            r[B] = kr(
              a,
              l,
              B,
              P,
              e,
              !1
            );
          }
        else
          P !== i[y] && (i[y] = P, c = !0);
      }
    }
  } else {
    ul(e, t, r, i) && (c = !0);
    let u;
    for (const b in l)
      (!t || // for camelCase
      !Se(t, b) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((u = fn(b)) === b || !Se(t, u))) && (a ? n && // for camelCase
      (n[b] !== void 0 || // for kebab-case
      n[u] !== void 0) && (r[b] = kr(
        a,
        l,
        b,
        void 0,
        e,
        !0
      )) : delete r[b]);
    if (i !== l)
      for (const b in i)
        (!t || !Se(t, b)) && (delete i[b], c = !0);
  }
  c && Kt(e.attrs, "set", "");
}
function ul(e, t, n, s) {
  const [r, i] = e.propsOptions;
  let o = !1, l;
  if (t)
    for (let a in t) {
      if (Hn(a))
        continue;
      const c = t[a];
      let u;
      r && Se(r, u = ln(a)) ? !i || !i.includes(u) ? n[u] = c : (l || (l = {}))[u] = c : Ds(e.emitsOptions, a) || (!(a in s) || c !== s[a]) && (s[a] = c, o = !0);
    }
  if (i) {
    const a = xe(n), c = l || Le;
    for (let u = 0; u < i.length; u++) {
      const b = i[u];
      n[b] = kr(
        r,
        a,
        b,
        c[b],
        e,
        !Se(c, b)
      );
    }
  }
  return o;
}
function kr(e, t, n, s, r, i) {
  const o = e[n];
  if (o != null) {
    const l = Se(o, "default");
    if (l && s === void 0) {
      const a = o.default;
      if (o.type !== Function && !o.skipFactory && ie(a)) {
        const { propsDefaults: c } = r;
        if (n in c)
          s = c[n];
        else {
          const u = ss(r);
          s = c[n] = a.call(
            null,
            t
          ), u();
        }
      } else
        s = a;
      r.ce && r.ce._setProp(n, s);
    }
    o[
      0
      /* shouldCast */
    ] && (i && !l ? s = !1 : o[
      1
      /* shouldCastTrue */
    ] && (s === "" || s === fn(n)) && (s = !0));
  }
  return s;
}
const Lc = /* @__PURE__ */ new WeakMap();
function fl(e, t, n = !1) {
  const s = n ? Lc : t.propsCache, r = s.get(e);
  if (r)
    return r;
  const i = e.props, o = {}, l = [];
  let a = !1;
  if (!ie(e)) {
    const u = (b) => {
      a = !0;
      const [y, P] = fl(b, t, !0);
      ot(o, y), P && l.push(...P);
    };
    !n && t.mixins.length && t.mixins.forEach(u), e.extends && u(e.extends), e.mixins && e.mixins.forEach(u);
  }
  if (!i && !a)
    return De(e) && s.set(e, An), An;
  if (ne(i))
    for (let u = 0; u < i.length; u++) {
      const b = ln(i[u]);
      zi(b) && (o[b] = Le);
    }
  else if (i)
    for (const u in i) {
      const b = ln(u);
      if (zi(b)) {
        const y = i[u], P = o[b] = ne(y) || ie(y) ? { type: y } : ot({}, y), B = P.type;
        let U = !1, Ee = !0;
        if (ne(B))
          for (let oe = 0; oe < B.length; ++oe) {
            const _e = B[oe], ye = ie(_e) && _e.name;
            if (ye === "Boolean") {
              U = !0;
              break;
            } else ye === "String" && (Ee = !1);
          }
        else
          U = ie(B) && B.name === "Boolean";
        P[
          0
          /* shouldCast */
        ] = U, P[
          1
          /* shouldCastTrue */
        ] = Ee, (U || Se(P, "default")) && l.push(b);
      }
    }
  const c = [o, l];
  return De(e) && s.set(e, c), c;
}
function zi(e) {
  return e[0] !== "$" && !Hn(e);
}
const Gr = (e) => e === "_" || e === "__" || e === "_ctx" || e === "$stable", Xr = (e) => ne(e) ? e.map(Nt) : [Nt(e)], Oc = (e, t, n) => {
  if (t._n)
    return t;
  const s = rc((...r) => Xr(t(...r)), n);
  return s._c = !1, s;
}, hl = (e, t, n) => {
  const s = e._ctx;
  for (const r in e) {
    if (Gr(r)) continue;
    const i = e[r];
    if (ie(i))
      t[r] = Oc(r, i, s);
    else if (i != null) {
      const o = Xr(i);
      t[r] = () => o;
    }
  }
}, dl = (e, t) => {
  const n = Xr(t);
  e.slots.default = () => n;
}, pl = (e, t, n) => {
  for (const s in t)
    (n || !Gr(s)) && (e[s] = t[s]);
}, Pc = (e, t, n) => {
  const s = e.slots = al();
  if (e.vnode.shapeFlag & 32) {
    const r = t.__;
    r && dr(s, "__", r, !0);
    const i = t._;
    i ? (pl(s, t, n), n && dr(s, "_", i, !0)) : hl(t, s);
  } else t && dl(e, t);
}, $c = (e, t, n) => {
  const { vnode: s, slots: r } = e;
  let i = !0, o = Le;
  if (s.shapeFlag & 32) {
    const l = t._;
    l ? n && l === 1 ? i = !1 : pl(r, t, n) : (i = !t.$stable, hl(t, r)), o = t;
  } else t && (dl(e, t), o = { default: 1 });
  if (i)
    for (const l in r)
      !Gr(l) && o[l] == null && delete r[l];
}, kt = Zc;
function Fc(e) {
  return Bc(e);
}
function Bc(e, t) {
  const n = Fs();
  n.__VUE__ = !0;
  const {
    insert: s,
    remove: r,
    patchProp: i,
    createElement: o,
    createText: l,
    createComment: a,
    setText: c,
    setElementText: u,
    parentNode: b,
    nextSibling: y,
    setScopeId: P = Mt,
    insertStaticContent: B
  } = e, U = (d, p, k, R = null, T = null, A = null, q = void 0, $ = null, F = !!p.dynamicChildren) => {
    if (d === p)
      return;
    d && !Bn(d, p) && (R = at(d), D(d, T, A, !0), d = null), p.patchFlag === -2 && (F = !1, p.dynamicChildren = null);
    const { type: L, ref: V, shapeFlag: z } = p;
    switch (L) {
      case qs:
        Ee(d, p, k, R);
        break;
      case cn:
        oe(d, p, k, R);
        break;
      case gs:
        d == null && _e(p, k, R, q);
        break;
      case Me:
        fe(
          d,
          p,
          k,
          R,
          T,
          A,
          q,
          $,
          F
        );
        break;
      default:
        z & 1 ? N(
          d,
          p,
          k,
          R,
          T,
          A,
          q,
          $,
          F
        ) : z & 6 ? Ue(
          d,
          p,
          k,
          R,
          T,
          A,
          q,
          $,
          F
        ) : (z & 64 || z & 128) && L.process(
          d,
          p,
          k,
          R,
          T,
          A,
          q,
          $,
          F,
          Ke
        );
    }
    V != null && T ? jn(V, d && d.ref, A, p || d, !p) : V == null && d && d.ref != null && jn(d.ref, null, A, d, !0);
  }, Ee = (d, p, k, R) => {
    if (d == null)
      s(
        p.el = l(p.children),
        k,
        R
      );
    else {
      const T = p.el = d.el;
      p.children !== d.children && c(T, p.children);
    }
  }, oe = (d, p, k, R) => {
    d == null ? s(
      p.el = a(p.children || ""),
      k,
      R
    ) : p.el = d.el;
  }, _e = (d, p, k, R) => {
    [d.el, d.anchor] = B(
      d.children,
      p,
      k,
      R,
      d.el,
      d.anchor
    );
  }, ye = ({ el: d, anchor: p }, k, R) => {
    let T;
    for (; d && d !== p; )
      T = y(d), s(d, k, R), d = T;
    s(p, k, R);
  }, H = ({ el: d, anchor: p }) => {
    let k;
    for (; d && d !== p; )
      k = y(d), r(d), d = k;
    r(p);
  }, N = (d, p, k, R, T, A, q, $, F) => {
    p.type === "svg" ? q = "svg" : p.type === "math" && (q = "mathml"), d == null ? Y(
      p,
      k,
      R,
      T,
      A,
      q,
      $,
      F
    ) : qe(
      d,
      p,
      T,
      A,
      q,
      $,
      F
    );
  }, Y = (d, p, k, R, T, A, q, $) => {
    let F, L;
    const { props: V, shapeFlag: z, transition: W, dirs: Q } = d;
    if (F = d.el = o(
      d.type,
      A,
      V && V.is,
      V
    ), z & 8 ? u(F, d.children) : z & 16 && we(
      d.children,
      F,
      null,
      R,
      T,
      sr(d, A),
      q,
      $
    ), Q && dn(d, null, R, "created"), K(F, d, d.scopeId, q, R), V) {
      for (const ve in V)
        ve !== "value" && !Hn(ve) && i(F, ve, null, V[ve], A, R);
      "value" in V && i(F, "value", null, V.value, A), (L = V.onVnodeBeforeMount) && $t(L, R, d);
    }
    Q && dn(d, null, R, "beforeMount");
    const ce = Nc(T, W);
    ce && W.beforeEnter(F), s(F, p, k), ((L = V && V.onVnodeMounted) || ce || Q) && kt(() => {
      L && $t(L, R, d), ce && W.enter(F), Q && dn(d, null, R, "mounted");
    }, T);
  }, K = (d, p, k, R, T) => {
    if (k && P(d, k), R)
      for (let A = 0; A < R.length; A++)
        P(d, R[A]);
    if (T) {
      let A = T.subTree;
      if (p === A || bl(A.type) && (A.ssContent === p || A.ssFallback === p)) {
        const q = T.vnode;
        K(
          d,
          q,
          q.scopeId,
          q.slotScopeIds,
          T.parent
        );
      }
    }
  }, we = (d, p, k, R, T, A, q, $, F = 0) => {
    for (let L = F; L < d.length; L++) {
      const V = d[L] = $ ? nn(d[L]) : Nt(d[L]);
      U(
        null,
        V,
        p,
        k,
        R,
        T,
        A,
        q,
        $
      );
    }
  }, qe = (d, p, k, R, T, A, q) => {
    const $ = p.el = d.el;
    let { patchFlag: F, dynamicChildren: L, dirs: V } = p;
    F |= d.patchFlag & 16;
    const z = d.props || Le, W = p.props || Le;
    let Q;
    if (k && pn(k, !1), (Q = W.onVnodeBeforeUpdate) && $t(Q, k, p, d), V && dn(p, d, k, "beforeUpdate"), k && pn(k, !0), (z.innerHTML && W.innerHTML == null || z.textContent && W.textContent == null) && u($, ""), L ? Oe(
      d.dynamicChildren,
      L,
      $,
      k,
      R,
      sr(p, T),
      A
    ) : q || J(
      d,
      p,
      $,
      null,
      k,
      R,
      sr(p, T),
      A,
      !1
    ), F > 0) {
      if (F & 16)
        je($, z, W, k, T);
      else if (F & 2 && z.class !== W.class && i($, "class", null, W.class, T), F & 4 && i($, "style", z.style, W.style, T), F & 8) {
        const ce = p.dynamicProps;
        for (let ve = 0; ve < ce.length; ve++) {
          const de = ce[ve], Ze = z[de], $e = W[de];
          ($e !== Ze || de === "value") && i($, de, Ze, $e, T, k);
        }
      }
      F & 1 && d.children !== p.children && u($, p.children);
    } else !q && L == null && je($, z, W, k, T);
    ((Q = W.onVnodeUpdated) || V) && kt(() => {
      Q && $t(Q, k, p, d), V && dn(p, d, k, "updated");
    }, R);
  }, Oe = (d, p, k, R, T, A, q) => {
    for (let $ = 0; $ < p.length; $++) {
      const F = d[$], L = p[$], V = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        F.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (F.type === Me || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !Bn(F, L) || // - In the case of a component, it could contain anything.
        F.shapeFlag & 198) ? b(F.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          k
        )
      );
      U(
        F,
        L,
        V,
        null,
        R,
        T,
        A,
        q,
        !0
      );
    }
  }, je = (d, p, k, R, T) => {
    if (p !== k) {
      if (p !== Le)
        for (const A in p)
          !Hn(A) && !(A in k) && i(
            d,
            A,
            p[A],
            null,
            T,
            R
          );
      for (const A in k) {
        if (Hn(A)) continue;
        const q = k[A], $ = p[A];
        q !== $ && A !== "value" && i(d, A, $, q, T, R);
      }
      "value" in k && i(d, "value", p.value, k.value, T);
    }
  }, fe = (d, p, k, R, T, A, q, $, F) => {
    const L = p.el = d ? d.el : l(""), V = p.anchor = d ? d.anchor : l("");
    let { patchFlag: z, dynamicChildren: W, slotScopeIds: Q } = p;
    Q && ($ = $ ? $.concat(Q) : Q), d == null ? (s(L, k, R), s(V, k, R), we(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      p.children || [],
      k,
      V,
      T,
      A,
      q,
      $,
      F
    )) : z > 0 && z & 64 && W && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    d.dynamicChildren ? (Oe(
      d.dynamicChildren,
      W,
      k,
      T,
      A,
      q,
      $
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (p.key != null || T && p === T.subTree) && gl(
      d,
      p,
      !0
      /* shallow */
    )) : J(
      d,
      p,
      k,
      V,
      T,
      A,
      q,
      $,
      F
    );
  }, Ue = (d, p, k, R, T, A, q, $, F) => {
    p.slotScopeIds = $, d == null ? p.shapeFlag & 512 ? T.ctx.activate(
      p,
      k,
      R,
      q,
      F
    ) : Ve(
      p,
      k,
      R,
      T,
      A,
      q,
      F
    ) : Te(d, p, F);
  }, Ve = (d, p, k, R, T, A, q) => {
    const $ = d.component = su(
      d,
      R,
      T
    );
    if (tl(d) && ($.ctx.renderer = Ke), iu($, !1, q), $.asyncDep) {
      if (T && T.registerDep($, ee, q), !d.el) {
        const F = $.subTree = Dt(cn);
        oe(null, F, p, k), d.placeholder = F.el;
      }
    } else
      ee(
        $,
        d,
        p,
        k,
        T,
        A,
        q
      );
  }, Te = (d, p, k) => {
    const R = p.component = d.component;
    if (jc(d, p, k))
      if (R.asyncDep && !R.asyncResolved) {
        X(R, p, k);
        return;
      } else
        R.next = p, R.update();
    else
      p.el = d.el, R.vnode = p;
  }, ee = (d, p, k, R, T, A, q) => {
    const $ = () => {
      if (d.isMounted) {
        let { next: z, bu: W, u: Q, parent: ce, vnode: ve } = d;
        {
          const f = ml(d);
          if (f) {
            z && (z.el = ve.el, X(d, z, q)), f.asyncDep.then(() => {
              d.isUnmounted || $();
            });
            return;
          }
        }
        let de = z, Ze;
        pn(d, !1), z ? (z.el = ve.el, X(d, z, q)) : z = ve, W && ds(W), (Ze = z.props && z.props.onVnodeBeforeUpdate) && $t(Ze, ce, z, ve), pn(d, !0);
        const $e = Vi(d), st = d.subTree;
        d.subTree = $e, U(
          st,
          $e,
          // parent may have changed if it's in a teleport
          b(st.el),
          // anchor may have changed if it's in a fragment
          at(st),
          d,
          T,
          A
        ), z.el = $e.el, de === null && Kc(d, $e.el), Q && kt(Q, T), (Ze = z.props && z.props.onVnodeUpdated) && kt(
          () => $t(Ze, ce, z, ve),
          T
        );
      } else {
        let z;
        const { el: W, props: Q } = p, { bm: ce, m: ve, parent: de, root: Ze, type: $e } = d, st = Kn(p);
        pn(d, !1), ce && ds(ce), !st && (z = Q && Q.onVnodeBeforeMount) && $t(z, de, p), pn(d, !0);
        {
          Ze.ce && // @ts-expect-error _def is private
          Ze.ce._def.shadowRoot !== !1 && Ze.ce._injectChildStyle($e);
          const f = d.subTree = Vi(d);
          U(
            null,
            f,
            k,
            R,
            d,
            T,
            A
          ), p.el = f.el;
        }
        if (ve && kt(ve, T), !st && (z = Q && Q.onVnodeMounted)) {
          const f = p;
          kt(
            () => $t(z, de, f),
            T
          );
        }
        (p.shapeFlag & 256 || de && Kn(de.vnode) && de.vnode.shapeFlag & 256) && d.a && kt(d.a, T), d.isMounted = !0, p = k = R = null;
      }
    };
    d.scope.on();
    const F = d.effect = new Oo($);
    d.scope.off();
    const L = d.update = F.run.bind(F), V = d.job = F.runIfDirty.bind(F);
    V.i = d, V.id = d.uid, F.scheduler = () => jr(V), pn(d, !0), L();
  }, X = (d, p, k) => {
    p.component = d;
    const R = d.vnode.props;
    d.vnode = p, d.next = null, Ic(d, p.props, R, k), $c(d, p.children, k), Yt(), Ni(d), Jt();
  }, J = (d, p, k, R, T, A, q, $, F = !1) => {
    const L = d && d.children, V = d ? d.shapeFlag : 0, z = p.children, { patchFlag: W, shapeFlag: Q } = p;
    if (W > 0) {
      if (W & 128) {
        M(
          L,
          z,
          k,
          R,
          T,
          A,
          q,
          $,
          F
        );
        return;
      } else if (W & 256) {
        ze(
          L,
          z,
          k,
          R,
          T,
          A,
          q,
          $,
          F
        );
        return;
      }
    }
    Q & 8 ? (V & 16 && _t(L, T, A), z !== L && u(k, z)) : V & 16 ? Q & 16 ? M(
      L,
      z,
      k,
      R,
      T,
      A,
      q,
      $,
      F
    ) : _t(L, T, A, !0) : (V & 8 && u(k, ""), Q & 16 && we(
      z,
      k,
      R,
      T,
      A,
      q,
      $,
      F
    ));
  }, ze = (d, p, k, R, T, A, q, $, F) => {
    d = d || An, p = p || An;
    const L = d.length, V = p.length, z = Math.min(L, V);
    let W;
    for (W = 0; W < z; W++) {
      const Q = p[W] = F ? nn(p[W]) : Nt(p[W]);
      U(
        d[W],
        Q,
        k,
        null,
        T,
        A,
        q,
        $,
        F
      );
    }
    L > V ? _t(
      d,
      T,
      A,
      !0,
      !1,
      z
    ) : we(
      p,
      k,
      R,
      T,
      A,
      q,
      $,
      F,
      z
    );
  }, M = (d, p, k, R, T, A, q, $, F) => {
    let L = 0;
    const V = p.length;
    let z = d.length - 1, W = V - 1;
    for (; L <= z && L <= W; ) {
      const Q = d[L], ce = p[L] = F ? nn(p[L]) : Nt(p[L]);
      if (Bn(Q, ce))
        U(
          Q,
          ce,
          k,
          null,
          T,
          A,
          q,
          $,
          F
        );
      else
        break;
      L++;
    }
    for (; L <= z && L <= W; ) {
      const Q = d[z], ce = p[W] = F ? nn(p[W]) : Nt(p[W]);
      if (Bn(Q, ce))
        U(
          Q,
          ce,
          k,
          null,
          T,
          A,
          q,
          $,
          F
        );
      else
        break;
      z--, W--;
    }
    if (L > z) {
      if (L <= W) {
        const Q = W + 1, ce = Q < V ? p[Q].el : R;
        for (; L <= W; )
          U(
            null,
            p[L] = F ? nn(p[L]) : Nt(p[L]),
            k,
            ce,
            T,
            A,
            q,
            $,
            F
          ), L++;
      }
    } else if (L > W)
      for (; L <= z; )
        D(d[L], T, A, !0), L++;
    else {
      const Q = L, ce = L, ve = /* @__PURE__ */ new Map();
      for (L = ce; L <= W; L++) {
        const w = p[L] = F ? nn(p[L]) : Nt(p[L]);
        w.key != null && ve.set(w.key, L);
      }
      let de, Ze = 0;
      const $e = W - ce + 1;
      let st = !1, f = 0;
      const m = new Array($e);
      for (L = 0; L < $e; L++) m[L] = 0;
      for (L = Q; L <= z; L++) {
        const w = d[L];
        if (Ze >= $e) {
          D(w, T, A, !0);
          continue;
        }
        let O;
        if (w.key != null)
          O = ve.get(w.key);
        else
          for (de = ce; de <= W; de++)
            if (m[de - ce] === 0 && Bn(w, p[de])) {
              O = de;
              break;
            }
        O === void 0 ? D(w, T, A, !0) : (m[O - ce] = L + 1, O >= f ? f = O : st = !0, U(
          w,
          p[O],
          k,
          null,
          T,
          A,
          q,
          $,
          F
        ), Ze++);
      }
      const S = st ? Mc(m) : An;
      for (de = S.length - 1, L = $e - 1; L >= 0; L--) {
        const w = ce + L, O = p[w], j = p[w + 1], G = w + 1 < V ? (
          // #13559, fallback to el placeholder for unresolved async component
          j.el || j.placeholder
        ) : R;
        m[L] === 0 ? U(
          null,
          O,
          k,
          G,
          T,
          A,
          q,
          $,
          F
        ) : st && (de < 0 || L !== S[de] ? he(O, k, G, 2) : de--);
      }
    }
  }, he = (d, p, k, R, T = null) => {
    const { el: A, type: q, transition: $, children: F, shapeFlag: L } = d;
    if (L & 6) {
      he(d.component.subTree, p, k, R);
      return;
    }
    if (L & 128) {
      d.suspense.move(p, k, R);
      return;
    }
    if (L & 64) {
      q.move(d, p, k, Ke);
      return;
    }
    if (q === Me) {
      s(A, p, k);
      for (let z = 0; z < F.length; z++)
        he(F[z], p, k, R);
      s(d.anchor, p, k);
      return;
    }
    if (q === gs) {
      ye(d, p, k);
      return;
    }
    if (R !== 2 && L & 1 && $)
      if (R === 0)
        $.beforeEnter(A), s(A, p, k), kt(() => $.enter(A), T);
      else {
        const { leave: z, delayLeave: W, afterLeave: Q } = $, ce = () => {
          d.ctx.isUnmounted ? r(A) : s(A, p, k);
        }, ve = () => {
          z(A, () => {
            ce(), Q && Q();
          });
        };
        W ? W(A, ce, ve) : ve();
      }
    else
      s(A, p, k);
  }, D = (d, p, k, R = !1, T = !1) => {
    const {
      type: A,
      props: q,
      ref: $,
      children: F,
      dynamicChildren: L,
      shapeFlag: V,
      patchFlag: z,
      dirs: W,
      cacheIndex: Q
    } = d;
    if (z === -2 && (T = !1), $ != null && (Yt(), jn($, null, k, d, !0), Jt()), Q != null && (p.renderCache[Q] = void 0), V & 256) {
      p.ctx.deactivate(d);
      return;
    }
    const ce = V & 1 && W, ve = !Kn(d);
    let de;
    if (ve && (de = q && q.onVnodeBeforeUnmount) && $t(de, p, d), V & 6)
      lt(d.component, k, R);
    else {
      if (V & 128) {
        d.suspense.unmount(k, R);
        return;
      }
      ce && dn(d, null, p, "beforeUnmount"), V & 64 ? d.type.remove(
        d,
        p,
        k,
        Ke,
        R
      ) : L && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !L.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (A !== Me || z > 0 && z & 64) ? _t(
        L,
        p,
        k,
        !1,
        !0
      ) : (A === Me && z & 384 || !T && V & 16) && _t(F, p, k), R && Pe(d);
    }
    (ve && (de = q && q.onVnodeUnmounted) || ce) && kt(() => {
      de && $t(de, p, d), ce && dn(d, null, p, "unmounted");
    }, k);
  }, Pe = (d) => {
    const { type: p, el: k, anchor: R, transition: T } = d;
    if (p === Me) {
      He(k, R);
      return;
    }
    if (p === gs) {
      H(d);
      return;
    }
    const A = () => {
      r(k), T && !T.persisted && T.afterLeave && T.afterLeave();
    };
    if (d.shapeFlag & 1 && T && !T.persisted) {
      const { leave: q, delayLeave: $ } = T, F = () => q(k, A);
      $ ? $(d.el, A, F) : F();
    } else
      A();
  }, He = (d, p) => {
    let k;
    for (; d !== p; )
      k = y(d), r(d), d = k;
    r(p);
  }, lt = (d, p, k) => {
    const {
      bum: R,
      scope: T,
      job: A,
      subTree: q,
      um: $,
      m: F,
      a: L,
      parent: V,
      slots: { __: z }
    } = d;
    Hi(F), Hi(L), R && ds(R), V && ne(z) && z.forEach((W) => {
      V.renderCache[W] = void 0;
    }), T.stop(), A && (A.flags |= 8, D(q, d, p, k)), $ && kt($, p), kt(() => {
      d.isUnmounted = !0;
    }, p), p && p.pendingBranch && !p.isUnmounted && d.asyncDep && !d.asyncResolved && d.suspenseId === p.pendingId && (p.deps--, p.deps === 0 && p.resolve());
  }, _t = (d, p, k, R = !1, T = !1, A = 0) => {
    for (let q = A; q < d.length; q++)
      D(d[q], p, k, R, T);
  }, at = (d) => {
    if (d.shapeFlag & 6)
      return at(d.component.subTree);
    if (d.shapeFlag & 128)
      return d.suspense.next();
    const p = y(d.anchor || d.el), k = p && p[ic];
    return k ? y(k) : p;
  };
  let pt = !1;
  const nt = (d, p, k) => {
    d == null ? p._vnode && D(p._vnode, null, null, !0) : U(
      p._vnode || null,
      d,
      p,
      null,
      null,
      null,
      k
    ), p._vnode = d, pt || (pt = !0, Ni(), Yo(), pt = !1);
  }, Ke = {
    p: U,
    um: D,
    m: he,
    r: Pe,
    mt: Ve,
    mc: we,
    pc: J,
    pbc: Oe,
    n: at,
    o: e
  };
  return {
    render: nt,
    hydrate: void 0,
    createApp: Ac(nt)
  };
}
function sr({ type: e, props: t }, n) {
  return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function pn({ effect: e, job: t }, n) {
  n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function Nc(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function gl(e, t, n = !1) {
  const s = e.children, r = t.children;
  if (ne(s) && ne(r))
    for (let i = 0; i < s.length; i++) {
      const o = s[i];
      let l = r[i];
      l.shapeFlag & 1 && !l.dynamicChildren && ((l.patchFlag <= 0 || l.patchFlag === 32) && (l = r[i] = nn(r[i]), l.el = o.el), !n && l.patchFlag !== -2 && gl(o, l)), l.type === qs && (l.el = o.el), l.type === cn && !l.el && (l.el = o.el);
    }
}
function Mc(e) {
  const t = e.slice(), n = [0];
  let s, r, i, o, l;
  const a = e.length;
  for (s = 0; s < a; s++) {
    const c = e[s];
    if (c !== 0) {
      if (r = n[n.length - 1], e[r] < c) {
        t[s] = r, n.push(s);
        continue;
      }
      for (i = 0, o = n.length - 1; i < o; )
        l = i + o >> 1, e[n[l]] < c ? i = l + 1 : o = l;
      c < e[n[i]] && (i > 0 && (t[s] = n[i - 1]), n[i] = s);
    }
  }
  for (i = n.length, o = n[i - 1]; i-- > 0; )
    n[i] = o, o = t[o];
  return n;
}
function ml(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : ml(t);
}
function Hi(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
const Dc = Symbol.for("v-scx"), qc = () => ps(Dc);
function sn(e, t, n) {
  return _l(e, t, n);
}
function _l(e, t, n = Le) {
  const { immediate: s, deep: r, flush: i, once: o } = n, l = ot({}, n), a = t && s || !t && i !== "post";
  let c;
  if (ts) {
    if (i === "sync") {
      const P = qc();
      c = P.__watcherHandles || (P.__watcherHandles = []);
    } else if (!a) {
      const P = () => {
      };
      return P.stop = Mt, P.resume = Mt, P.pause = Mt, P;
    }
  }
  const u = ht;
  l.call = (P, B, U) => Ut(P, u, B, U);
  let b = !1;
  i === "post" ? l.scheduler = (P) => {
    kt(P, u && u.suspense);
  } : i !== "sync" && (b = !0, l.scheduler = (P, B) => {
    B ? P() : jr(P);
  }), l.augmentJob = (P) => {
    t && (P.flags |= 4), b && (P.flags |= 2, u && (P.id = u.uid, P.i = u));
  };
  const y = ec(e, t, l);
  return ts && (c ? c.push(y) : a && y()), y;
}
function Uc(e, t, n) {
  const s = this.proxy, r = Ye(e) ? e.includes(".") ? yl(s, e) : () => s[e] : e.bind(s, s);
  let i;
  ie(t) ? i = t : (i = t.handler, n = t);
  const o = ss(this), l = _l(r, i.bind(s), n);
  return o(), l;
}
function yl(e, t) {
  const n = t.split(".");
  return () => {
    let s = e;
    for (let r = 0; r < n.length && s; r++)
      s = s[n[r]];
    return s;
  };
}
const zc = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${ln(t)}Modifiers`] || e[`${fn(t)}Modifiers`];
function Hc(e, t, ...n) {
  if (e.isUnmounted) return;
  const s = e.vnode.props || Le;
  let r = n;
  const i = t.startsWith("update:"), o = i && zc(s, t.slice(7));
  o && (o.trim && (r = n.map((u) => Ye(u) ? u.trim() : u)), o.number && (r = n.map(pr)));
  let l, a = s[l = Ys(t)] || // also try camelCase event handler (#2249)
  s[l = Ys(ln(t))];
  !a && i && (a = s[l = Ys(fn(t))]), a && Ut(
    a,
    e,
    6,
    r
  );
  const c = s[l + "Once"];
  if (c) {
    if (!e.emitted)
      e.emitted = {};
    else if (e.emitted[l])
      return;
    e.emitted[l] = !0, Ut(
      c,
      e,
      6,
      r
    );
  }
}
function vl(e, t, n = !1) {
  const s = t.emitsCache, r = s.get(e);
  if (r !== void 0)
    return r;
  const i = e.emits;
  let o = {}, l = !1;
  if (!ie(e)) {
    const a = (c) => {
      const u = vl(c, t, !0);
      u && (l = !0, ot(o, u));
    };
    !n && t.mixins.length && t.mixins.forEach(a), e.extends && a(e.extends), e.mixins && e.mixins.forEach(a);
  }
  return !i && !l ? (De(e) && s.set(e, null), null) : (ne(i) ? i.forEach((a) => o[a] = null) : ot(o, i), De(e) && s.set(e, o), o);
}
function Ds(e, t) {
  return !e || !Os(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), Se(e, t[0].toLowerCase() + t.slice(1)) || Se(e, fn(t)) || Se(e, t));
}
function Vi(e) {
  const {
    type: t,
    vnode: n,
    proxy: s,
    withProxy: r,
    propsOptions: [i],
    slots: o,
    attrs: l,
    emit: a,
    render: c,
    renderCache: u,
    props: b,
    data: y,
    setupState: P,
    ctx: B,
    inheritAttrs: U
  } = e, Ee = Ts(e);
  let oe, _e;
  try {
    if (n.shapeFlag & 4) {
      const H = r || s, N = H;
      oe = Nt(
        c.call(
          N,
          H,
          u,
          b,
          P,
          y,
          B
        )
      ), _e = l;
    } else {
      const H = t;
      oe = Nt(
        H.length > 1 ? H(
          b,
          { attrs: l, slots: o, emit: a }
        ) : H(
          b,
          null
        )
      ), _e = t.props ? l : Vc(l);
    }
  } catch (H) {
    Gn.length = 0, Ns(H, e, 1), oe = Dt(cn);
  }
  let ye = oe;
  if (_e && U !== !1) {
    const H = Object.keys(_e), { shapeFlag: N } = ye;
    H.length && N & 7 && (i && H.some(Fr) && (_e = Wc(
      _e,
      i
    )), ye = On(ye, _e, !1, !0));
  }
  return n.dirs && (ye = On(ye, null, !1, !0), ye.dirs = ye.dirs ? ye.dirs.concat(n.dirs) : n.dirs), n.transition && Kr(ye, n.transition), oe = ye, Ts(Ee), oe;
}
const Vc = (e) => {
  let t;
  for (const n in e)
    (n === "class" || n === "style" || Os(n)) && ((t || (t = {}))[n] = e[n]);
  return t;
}, Wc = (e, t) => {
  const n = {};
  for (const s in e)
    (!Fr(s) || !(s.slice(9) in t)) && (n[s] = e[s]);
  return n;
};
function jc(e, t, n) {
  const { props: s, children: r, component: i } = e, { props: o, children: l, patchFlag: a } = t, c = i.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (n && a >= 0) {
    if (a & 1024)
      return !0;
    if (a & 16)
      return s ? Wi(s, o, c) : !!o;
    if (a & 8) {
      const u = t.dynamicProps;
      for (let b = 0; b < u.length; b++) {
        const y = u[b];
        if (o[y] !== s[y] && !Ds(c, y))
          return !0;
      }
    }
  } else
    return (r || l) && (!l || !l.$stable) ? !0 : s === o ? !1 : s ? o ? Wi(s, o, c) : !0 : !!o;
  return !1;
}
function Wi(e, t, n) {
  const s = Object.keys(t);
  if (s.length !== Object.keys(e).length)
    return !0;
  for (let r = 0; r < s.length; r++) {
    const i = s[r];
    if (t[i] !== e[i] && !Ds(n, i))
      return !0;
  }
  return !1;
}
function Kc({ vnode: e, parent: t }, n) {
  for (; t; ) {
    const s = t.subTree;
    if (s.suspense && s.suspense.activeBranch === e && (s.el = e.el), s === e)
      (e = t.vnode).el = n, t = t.parent;
    else
      break;
  }
}
const bl = (e) => e.__isSuspense;
function Zc(e, t) {
  t && t.pendingBranch ? ne(e) ? t.effects.push(...e) : t.effects.push(e) : sc(e);
}
const Me = Symbol.for("v-fgt"), qs = Symbol.for("v-txt"), cn = Symbol.for("v-cmt"), gs = Symbol.for("v-stc"), Gn = [];
let xt = null;
function E(e = !1) {
  Gn.push(xt = e ? null : []);
}
function Gc() {
  Gn.pop(), xt = Gn[Gn.length - 1] || null;
}
let es = 1;
function ji(e, t = !1) {
  es += e, e < 0 && xt && t && (xt.hasOnce = !0);
}
function wl(e) {
  return e.dynamicChildren = es > 0 ? xt || An : null, Gc(), es > 0 && xt && xt.push(e), e;
}
function I(e, t, n, s, r, i) {
  return wl(
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
function Xc(e, t, n, s, r) {
  return wl(
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
function kl(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function Bn(e, t) {
  return e.type === t.type && e.key === t.key;
}
const xl = ({ key: e }) => e ?? null, ms = ({
  ref: e,
  ref_key: t,
  ref_for: n
}) => (typeof e == "number" && (e = "" + e), e != null ? Ye(e) || it(e) || ie(e) ? { i: At, r: e, k: t, f: !!n } : e : null);
function v(e, t = null, n = null, s = 0, r = null, i = e === Me ? 0 : 1, o = !1, l = !1) {
  const a = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && xl(t),
    ref: t && ms(t),
    scopeId: Qo,
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
    ctx: At
  };
  return l ? (Yr(a, n), i & 128 && e.normalize(a)) : n && (a.shapeFlag |= Ye(n) ? 8 : 16), es > 0 && // avoid a block node from tracking itself
  !o && // has current parent block
  xt && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (a.patchFlag > 0 || i & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  a.patchFlag !== 32 && xt.push(a), a;
}
const Dt = Yc;
function Yc(e, t = null, n = null, s = 0, r = null, i = !1) {
  if ((!e || e === vc) && (e = cn), kl(e)) {
    const l = On(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return n && Yr(l, n), es > 0 && !i && xt && (l.shapeFlag & 6 ? xt[xt.indexOf(e)] = l : xt.push(l)), l.patchFlag = -2, l;
  }
  if (cu(e) && (e = e.__vccOpts), t) {
    t = Jc(t);
    let { class: l, style: a } = t;
    l && !Ye(l) && (t.class = Ne(l)), De(a) && (Wr(a) && !ne(a) && (a = ot({}, a)), t.style = Ae(a));
  }
  const o = Ye(e) ? 1 : bl(e) ? 128 : oc(e) ? 64 : De(e) ? 4 : ie(e) ? 2 : 0;
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
function Jc(e) {
  return e ? Wr(e) || cl(e) ? ot({}, e) : e : null;
}
function On(e, t, n = !1, s = !1) {
  const { props: r, ref: i, patchFlag: o, children: l, transition: a } = e, c = t ? eu(r || {}, t) : r, u = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: c,
    key: c && xl(c),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && i ? ne(i) ? i.concat(ms(t)) : [i, ms(t)] : ms(t)
    ) : i,
    scopeId: e.scopeId,
    slotScopeIds: e.slotScopeIds,
    children: l,
    target: e.target,
    targetStart: e.targetStart,
    targetAnchor: e.targetAnchor,
    staticCount: e.staticCount,
    shapeFlag: e.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: t && e.type !== Me ? o === -1 ? 16 : o | 16 : o,
    dynamicProps: e.dynamicProps,
    dynamicChildren: e.dynamicChildren,
    appContext: e.appContext,
    dirs: e.dirs,
    transition: a,
    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: e.component,
    suspense: e.suspense,
    ssContent: e.ssContent && On(e.ssContent),
    ssFallback: e.ssFallback && On(e.ssFallback),
    placeholder: e.placeholder,
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce
  };
  return a && s && Kr(
    u,
    a.clone(u)
  ), u;
}
function wt(e = " ", t = 0) {
  return Dt(qs, null, e, t);
}
function Qc(e, t) {
  const n = Dt(gs, null, e);
  return n.staticCount = t, n;
}
function re(e = "", t = !1) {
  return t ? (E(), Xc(cn, null, e)) : Dt(cn, null, e);
}
function Nt(e) {
  return e == null || typeof e == "boolean" ? Dt(cn) : ne(e) ? Dt(
    Me,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : kl(e) ? nn(e) : Dt(qs, null, String(e));
}
function nn(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : On(e);
}
function Yr(e, t) {
  let n = 0;
  const { shapeFlag: s } = e;
  if (t == null)
    t = null;
  else if (ne(t))
    n = 16;
  else if (typeof t == "object")
    if (s & 65) {
      const r = t.default;
      r && (r._c && (r._d = !1), Yr(e, r()), r._c && (r._d = !0));
      return;
    } else {
      n = 32;
      const r = t._;
      !r && !cl(t) ? t._ctx = At : r === 3 && At && (At.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else ie(t) ? (t = { default: t, _ctx: At }, n = 32) : (t = String(t), s & 64 ? (n = 16, t = [wt(t)]) : n = 8);
  e.children = t, e.shapeFlag |= n;
}
function eu(...e) {
  const t = {};
  for (let n = 0; n < e.length; n++) {
    const s = e[n];
    for (const r in s)
      if (r === "class")
        t.class !== s.class && (t.class = Ne([t.class, s.class]));
      else if (r === "style")
        t.style = Ae([t.style, s.style]);
      else if (Os(r)) {
        const i = t[r], o = s[r];
        o && i !== o && !(ne(i) && i.includes(o)) && (t[r] = i ? [].concat(i, o) : o);
      } else r !== "" && (t[r] = s[r]);
  }
  return t;
}
function $t(e, t, n, s = null) {
  Ut(e, t, 7, [
    n,
    s
  ]);
}
const tu = ol();
let nu = 0;
function su(e, t, n) {
  const s = e.type, r = (t ? t.appContext : e.appContext) || tu, i = {
    uid: nu++,
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
    scope: new Ta(
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
    propsOptions: fl(s, r),
    emitsOptions: vl(s, r),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: Le,
    // inheritAttrs
    inheritAttrs: s.inheritAttrs,
    // state
    ctx: Le,
    data: Le,
    props: Le,
    attrs: Le,
    slots: Le,
    refs: Le,
    setupState: Le,
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
  return i.ctx = { _: i }, i.root = t ? t.root : i, i.emit = Hc.bind(null, i), e.ce && e.ce(i), i;
}
let ht = null;
const ru = () => ht || At;
let Es, xr;
{
  const e = Fs(), t = (n, s) => {
    let r;
    return (r = e[n]) || (r = e[n] = []), r.push(s), (i) => {
      r.length > 1 ? r.forEach((o) => o(i)) : r[0](i);
    };
  };
  Es = t(
    "__VUE_INSTANCE_SETTERS__",
    (n) => ht = n
  ), xr = t(
    "__VUE_SSR_SETTERS__",
    (n) => ts = n
  );
}
const ss = (e) => {
  const t = ht;
  return Es(e), e.scope.on(), () => {
    e.scope.off(), Es(t);
  };
}, Ki = () => {
  ht && ht.scope.off(), Es(null);
};
function Sl(e) {
  return e.vnode.shapeFlag & 4;
}
let ts = !1;
function iu(e, t = !1, n = !1) {
  t && xr(t);
  const { props: s, children: r } = e.vnode, i = Sl(e);
  Rc(e, s, i, t), Pc(e, r, n || t);
  const o = i ? ou(e, t) : void 0;
  return t && xr(!1), o;
}
function ou(e, t) {
  const n = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, bc);
  const { setup: s } = n;
  if (s) {
    Yt();
    const r = e.setupContext = s.length > 1 ? au(e) : null, i = ss(e), o = ns(
      s,
      e,
      0,
      [
        e.props,
        r
      ]
    ), l = Co(o);
    if (Jt(), i(), (l || e.sp) && !Kn(e) && el(e), l) {
      if (o.then(Ki, Ki), t)
        return o.then((a) => {
          Zi(e, a);
        }).catch((a) => {
          Ns(a, e, 0);
        });
      e.asyncDep = o;
    } else
      Zi(e, o);
  } else
    Cl(e);
}
function Zi(e, t, n) {
  ie(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : De(t) && (e.setupState = Ko(t)), Cl(e);
}
function Cl(e, t, n) {
  const s = e.type;
  e.render || (e.render = s.render || Mt);
  {
    const r = ss(e);
    Yt();
    try {
      wc(e);
    } finally {
      Jt(), r();
    }
  }
}
const lu = {
  get(e, t) {
    return rt(e, "get", ""), e[t];
  }
};
function au(e) {
  const t = (n) => {
    e.exposed = n || {};
  };
  return {
    attrs: new Proxy(e.attrs, lu),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function Us(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(Ko(Ka(e.exposed)), {
    get(t, n) {
      if (n in t)
        return t[n];
      if (n in Zn)
        return Zn[n](e);
    },
    has(t, n) {
      return n in t || n in Zn;
    }
  })) : e.proxy;
}
function cu(e) {
  return ie(e) && "__vccOpts" in e;
}
const We = (e, t) => Ja(e, t, ts), uu = "3.5.18";
/**
* @vue/runtime-dom v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let Sr;
const Gi = typeof window < "u" && window.trustedTypes;
if (Gi)
  try {
    Sr = /* @__PURE__ */ Gi.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const Tl = Sr ? (e) => Sr.createHTML(e) : (e) => e, fu = "http://www.w3.org/2000/svg", hu = "http://www.w3.org/1998/Math/MathML", jt = typeof document < "u" ? document : null, Xi = jt && /* @__PURE__ */ jt.createElement("template"), du = {
  insert: (e, t, n) => {
    t.insertBefore(e, n || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, n, s) => {
    const r = t === "svg" ? jt.createElementNS(fu, e) : t === "mathml" ? jt.createElementNS(hu, e) : n ? jt.createElement(e, { is: n }) : jt.createElement(e);
    return e === "select" && s && s.multiple != null && r.setAttribute("multiple", s.multiple), r;
  },
  createText: (e) => jt.createTextNode(e),
  createComment: (e) => jt.createComment(e),
  setText: (e, t) => {
    e.nodeValue = t;
  },
  setElementText: (e, t) => {
    e.textContent = t;
  },
  parentNode: (e) => e.parentNode,
  nextSibling: (e) => e.nextSibling,
  querySelector: (e) => jt.querySelector(e),
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
      Xi.innerHTML = Tl(
        s === "svg" ? `<svg>${e}</svg>` : s === "mathml" ? `<math>${e}</math>` : e
      );
      const l = Xi.content;
      if (s === "svg" || s === "mathml") {
        const a = l.firstChild;
        for (; a.firstChild; )
          l.appendChild(a.firstChild);
        l.removeChild(a);
      }
      t.insertBefore(l, n);
    }
    return [
      // first
      o ? o.nextSibling : t.firstChild,
      // last
      n ? n.previousSibling : t.lastChild
    ];
  }
}, pu = Symbol("_vtc");
function gu(e, t, n) {
  const s = e[pu];
  s && (t = (t ? [t, ...s] : [...s]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
const Yi = Symbol("_vod"), mu = Symbol("_vsh"), _u = Symbol(""), yu = /(^|;)\s*display\s*:/;
function vu(e, t, n) {
  const s = e.style, r = Ye(n);
  let i = !1;
  if (n && !r) {
    if (t)
      if (Ye(t))
        for (const o of t.split(";")) {
          const l = o.slice(0, o.indexOf(":")).trim();
          n[l] == null && _s(s, l, "");
        }
      else
        for (const o in t)
          n[o] == null && _s(s, o, "");
    for (const o in n)
      o === "display" && (i = !0), _s(s, o, n[o]);
  } else if (r) {
    if (t !== n) {
      const o = s[_u];
      o && (n += ";" + o), s.cssText = n, i = yu.test(n);
    }
  } else t && e.removeAttribute("style");
  Yi in e && (e[Yi] = i ? s.display : "", e[mu] && (s.display = "none"));
}
const Ji = /\s*!important$/;
function _s(e, t, n) {
  if (ne(n))
    n.forEach((s) => _s(e, t, s));
  else if (n == null && (n = ""), t.startsWith("--"))
    e.setProperty(t, n);
  else {
    const s = bu(e, t);
    Ji.test(n) ? e.setProperty(
      fn(s),
      n.replace(Ji, ""),
      "important"
    ) : e[s] = n;
  }
}
const Qi = ["Webkit", "Moz", "ms"], rr = {};
function bu(e, t) {
  const n = rr[t];
  if (n)
    return n;
  let s = ln(t);
  if (s !== "filter" && s in e)
    return rr[t] = s;
  s = Eo(s);
  for (let r = 0; r < Qi.length; r++) {
    const i = Qi[r] + s;
    if (i in e)
      return rr[t] = i;
  }
  return t;
}
const eo = "http://www.w3.org/1999/xlink";
function to(e, t, n, s, r, i = Ca(t)) {
  s && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(eo, t.slice(6, t.length)) : e.setAttributeNS(eo, t, n) : n == null || i && !Ro(n) ? e.removeAttribute(t) : e.setAttribute(
    t,
    i ? "" : un(n) ? String(n) : n
  );
}
function no(e, t, n, s, r) {
  if (t === "innerHTML" || t === "textContent") {
    n != null && (e[t] = t === "innerHTML" ? Tl(n) : n);
    return;
  }
  const i = e.tagName;
  if (t === "value" && i !== "PROGRESS" && // custom elements may use _value internally
  !i.includes("-")) {
    const l = i === "OPTION" ? e.getAttribute("value") || "" : e.value, a = n == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      e.type === "checkbox" ? "on" : ""
    ) : String(n);
    (l !== a || !("_value" in e)) && (e.value = a), n == null && e.removeAttribute(t), e._value = n;
    return;
  }
  let o = !1;
  if (n === "" || n == null) {
    const l = typeof e[t];
    l === "boolean" ? n = Ro(n) : n == null && l === "string" ? (n = "", o = !0) : l === "number" && (n = 0, o = !0);
  }
  try {
    e[t] = n;
  } catch {
  }
  o && e.removeAttribute(r || t);
}
function Tn(e, t, n, s) {
  e.addEventListener(t, n, s);
}
function wu(e, t, n, s) {
  e.removeEventListener(t, n, s);
}
const so = Symbol("_vei");
function ku(e, t, n, s, r = null) {
  const i = e[so] || (e[so] = {}), o = i[t];
  if (s && o)
    o.value = s;
  else {
    const [l, a] = xu(t);
    if (s) {
      const c = i[t] = Tu(
        s,
        r
      );
      Tn(e, l, c, a);
    } else o && (wu(e, l, o, a), i[t] = void 0);
  }
}
const ro = /(?:Once|Passive|Capture)$/;
function xu(e) {
  let t;
  if (ro.test(e)) {
    t = {};
    let s;
    for (; s = e.match(ro); )
      e = e.slice(0, e.length - s[0].length), t[s[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : fn(e.slice(2)), t];
}
let ir = 0;
const Su = /* @__PURE__ */ Promise.resolve(), Cu = () => ir || (Su.then(() => ir = 0), ir = Date.now());
function Tu(e, t) {
  const n = (s) => {
    if (!s._vts)
      s._vts = Date.now();
    else if (s._vts <= n.attached)
      return;
    Ut(
      Au(s, n.value),
      t,
      5,
      [s]
    );
  };
  return n.value = e, n.attached = Cu(), n;
}
function Au(e, t) {
  if (ne(t)) {
    const n = e.stopImmediatePropagation;
    return e.stopImmediatePropagation = () => {
      n.call(e), e._stopped = !0;
    }, t.map(
      (s) => (r) => !r._stopped && s && s(r)
    );
  } else
    return t;
}
const io = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, Eu = (e, t, n, s, r, i) => {
  const o = r === "svg";
  t === "class" ? gu(e, s, o) : t === "style" ? vu(e, n, s) : Os(t) ? Fr(t) || ku(e, t, n, s, i) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : Ru(e, t, s, o)) ? (no(e, t, s), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && to(e, t, s, o, i, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !Ye(s)) ? no(e, ln(t), s, i, t) : (t === "true-value" ? e._trueValue = s : t === "false-value" && (e._falseValue = s), to(e, t, s, o));
};
function Ru(e, t, n, s) {
  if (s)
    return !!(t === "innerHTML" || t === "textContent" || t in e && io(t) && ie(n));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const r = e.tagName;
    if (r === "IMG" || r === "VIDEO" || r === "CANVAS" || r === "SOURCE")
      return !1;
  }
  return io(t) && Ye(n) ? !1 : t in e;
}
const oo = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return ne(t) ? (n) => ds(t, n) : t;
};
function Iu(e) {
  e.target.composing = !0;
}
function lo(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const or = Symbol("_assign"), gn = {
  created(e, { modifiers: { lazy: t, trim: n, number: s } }, r) {
    e[or] = oo(r);
    const i = s || r.props && r.props.type === "number";
    Tn(e, t ? "change" : "input", (o) => {
      if (o.target.composing) return;
      let l = e.value;
      n && (l = l.trim()), i && (l = pr(l)), e[or](l);
    }), n && Tn(e, "change", () => {
      e.value = e.value.trim();
    }), t || (Tn(e, "compositionstart", Iu), Tn(e, "compositionend", lo), Tn(e, "change", lo));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t }) {
    e.value = t ?? "";
  },
  beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: s, trim: r, number: i } }, o) {
    if (e[or] = oo(o), e.composing) return;
    const l = (i || e.type === "number") && !/^0\d/.test(e.value) ? pr(e.value) : e.value, a = t ?? "";
    l !== a && (document.activeElement === e && e.type !== "range" && (s && t === n || r && e.value.trim() === a) || (e.value = a));
  }
}, Lu = ["ctrl", "shift", "alt", "meta"], Ou = {
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
  exact: (e, t) => Lu.some((n) => e[`${n}Key`] && !t.includes(n))
}, Sn = (e, t) => {
  const n = e._withMods || (e._withMods = {}), s = t.join(".");
  return n[s] || (n[s] = (r, ...i) => {
    for (let o = 0; o < t.length; o++) {
      const l = Ou[t[o]];
      if (l && l(r, t)) return;
    }
    return e(r, ...i);
  });
}, Pu = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, ao = (e, t) => {
  const n = e._withKeys || (e._withKeys = {}), s = t.join(".");
  return n[s] || (n[s] = (r) => {
    if (!("key" in r))
      return;
    const i = fn(r.key);
    if (t.some(
      (o) => o === i || Pu[o] === i
    ))
      return e(r);
  });
}, $u = /* @__PURE__ */ ot({ patchProp: Eu }, du);
let co;
function Fu() {
  return co || (co = Fc($u));
}
const Bu = (...e) => {
  const t = Fu().createApp(...e), { mount: n } = t;
  return t.mount = (s) => {
    const r = Mu(s);
    if (!r) return;
    const i = t._component;
    !ie(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
    const o = n(r, !1, Nu(r));
    return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), o;
  }, t;
};
function Nu(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function Mu(e) {
  return Ye(e) ? document.querySelector(e) : e;
}
const en = (e) => {
  const t = e.replace("#", ""), n = parseInt(t.substr(0, 2), 16), s = parseInt(t.substr(2, 2), 16), r = parseInt(t.substr(4, 2), 16);
  return (n * 299 + s * 587 + r * 114) / 1e3 < 128;
}, Du = (e, t) => {
  const n = e.replace("#", ""), s = parseInt(n.substr(0, 2), 16), r = parseInt(n.substr(2, 2), 16), i = parseInt(n.substr(4, 2), 16), o = en(e), l = o ? Math.min(255, s + t) : Math.max(0, s - t), a = o ? Math.min(255, r + t) : Math.max(0, r - t), c = o ? Math.min(255, i + t) : Math.max(0, i - t);
  return `#${l.toString(16).padStart(2, "0")}${a.toString(16).padStart(2, "0")}${c.toString(16).padStart(2, "0")}`;
}, Nn = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e), qu = (e) => {
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
function Jr() {
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
var bn = Jr();
function Al(e) {
  bn = e;
}
var Xn = { exec: () => null };
function Ce(e, t = "") {
  let n = typeof e == "string" ? e : e.source;
  const s = {
    replace: (r, i) => {
      let o = typeof i == "string" ? i : i.source;
      return o = o.replace(dt.caret, "$1"), n = n.replace(r, o), s;
    },
    getRegex: () => new RegExp(n, t)
  };
  return s;
}
var dt = {
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
}, Uu = /^(?:[ \t]*(?:\n|$))+/, zu = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/, Hu = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, rs = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, Vu = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, Qr = /(?:[*+-]|\d{1,9}[.)])/, El = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/, Rl = Ce(El).replace(/bull/g, Qr).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(), Wu = Ce(El).replace(/bull/g, Qr).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(), ei = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/, ju = /^[^\n]+/, ti = /(?!\s*\])(?:\\.|[^\[\]\\])+/, Ku = Ce(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", ti).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), Zu = Ce(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, Qr).getRegex(), zs = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", ni = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, Gu = Ce(
  "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))",
  "i"
).replace("comment", ni).replace("tag", zs).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), Il = Ce(ei).replace("hr", rs).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", zs).getRegex(), Xu = Ce(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", Il).getRegex(), si = {
  blockquote: Xu,
  code: zu,
  def: Ku,
  fences: Hu,
  heading: Vu,
  hr: rs,
  html: Gu,
  lheading: Rl,
  list: Zu,
  newline: Uu,
  paragraph: Il,
  table: Xn,
  text: ju
}, uo = Ce(
  "^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"
).replace("hr", rs).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", zs).getRegex(), Yu = {
  ...si,
  lheading: Wu,
  table: uo,
  paragraph: Ce(ei).replace("hr", rs).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", uo).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", zs).getRegex()
}, Ju = {
  ...si,
  html: Ce(
    `^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`
  ).replace("comment", ni).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
  heading: /^(#{1,6})(.*)(?:\n+|$)/,
  fences: Xn,
  // fences not supported
  lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  paragraph: Ce(ei).replace("hr", rs).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", Rl).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
}, Qu = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, ef = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, Ll = /^( {2,}|\\)\n(?!\s*$)/, tf = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, Hs = /[\p{P}\p{S}]/u, ri = /[\s\p{P}\p{S}]/u, Ol = /[^\s\p{P}\p{S}]/u, nf = Ce(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, ri).getRegex(), Pl = /(?!~)[\p{P}\p{S}]/u, sf = /(?!~)[\s\p{P}\p{S}]/u, rf = /(?:[^\s\p{P}\p{S}]|~)/u, of = /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g, $l = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/, lf = Ce($l, "u").replace(/punct/g, Hs).getRegex(), af = Ce($l, "u").replace(/punct/g, Pl).getRegex(), Fl = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", cf = Ce(Fl, "gu").replace(/notPunctSpace/g, Ol).replace(/punctSpace/g, ri).replace(/punct/g, Hs).getRegex(), uf = Ce(Fl, "gu").replace(/notPunctSpace/g, rf).replace(/punctSpace/g, sf).replace(/punct/g, Pl).getRegex(), ff = Ce(
  "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)",
  "gu"
).replace(/notPunctSpace/g, Ol).replace(/punctSpace/g, ri).replace(/punct/g, Hs).getRegex(), hf = Ce(/\\(punct)/, "gu").replace(/punct/g, Hs).getRegex(), df = Ce(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), pf = Ce(ni).replace("(?:-->|$)", "-->").getRegex(), gf = Ce(
  "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>"
).replace("comment", pf).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), Rs = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/, mf = Ce(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", Rs).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), Bl = Ce(/^!?\[(label)\]\[(ref)\]/).replace("label", Rs).replace("ref", ti).getRegex(), Nl = Ce(/^!?\[(ref)\](?:\[\])?/).replace("ref", ti).getRegex(), _f = Ce("reflink|nolink(?!\\()", "g").replace("reflink", Bl).replace("nolink", Nl).getRegex(), ii = {
  _backpedal: Xn,
  // only used for GFM url
  anyPunctuation: hf,
  autolink: df,
  blockSkip: of,
  br: Ll,
  code: ef,
  del: Xn,
  emStrongLDelim: lf,
  emStrongRDelimAst: cf,
  emStrongRDelimUnd: ff,
  escape: Qu,
  link: mf,
  nolink: Nl,
  punctuation: nf,
  reflink: Bl,
  reflinkSearch: _f,
  tag: gf,
  text: tf,
  url: Xn
}, yf = {
  ...ii,
  link: Ce(/^!?\[(label)\]\((.*?)\)/).replace("label", Rs).getRegex(),
  reflink: Ce(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", Rs).getRegex()
}, Cr = {
  ...ii,
  emStrongRDelimAst: uf,
  emStrongLDelim: af,
  url: Ce(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, "i").replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
  _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
}, vf = {
  ...Cr,
  br: Ce(Ll).replace("{2,}", "*").getRegex(),
  text: Ce(Cr.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
}, us = {
  normal: si,
  gfm: Yu,
  pedantic: Ju
}, Mn = {
  normal: ii,
  gfm: Cr,
  breaks: vf,
  pedantic: yf
}, bf = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}, fo = (e) => bf[e];
function Ft(e, t) {
  if (t) {
    if (dt.escapeTest.test(e))
      return e.replace(dt.escapeReplace, fo);
  } else if (dt.escapeTestNoEncode.test(e))
    return e.replace(dt.escapeReplaceNoEncode, fo);
  return e;
}
function ho(e) {
  try {
    e = encodeURI(e).replace(dt.percentDecode, "%");
  } catch {
    return null;
  }
  return e;
}
function po(e, t) {
  var i;
  const n = e.replace(dt.findPipe, (o, l, a) => {
    let c = !1, u = l;
    for (; --u >= 0 && a[u] === "\\"; ) c = !c;
    return c ? "|" : " |";
  }), s = n.split(dt.splitPipe);
  let r = 0;
  if (s[0].trim() || s.shift(), s.length > 0 && !((i = s.at(-1)) != null && i.trim()) && s.pop(), t)
    if (s.length > t)
      s.splice(t);
    else
      for (; s.length < t; ) s.push("");
  for (; r < s.length; r++)
    s[r] = s[r].trim().replace(dt.slashPipe, "|");
  return s;
}
function Dn(e, t, n) {
  const s = e.length;
  if (s === 0)
    return "";
  let r = 0;
  for (; r < s && e.charAt(s - r - 1) === t; )
    r++;
  return e.slice(0, s - r);
}
function wf(e, t) {
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
function go(e, t, n, s, r) {
  const i = t.href, o = t.title || null, l = e[1].replace(r.other.outputLinkReplace, "$1");
  s.state.inLink = !0;
  const a = {
    type: e[0].charAt(0) === "!" ? "image" : "link",
    raw: n,
    href: i,
    title: o,
    text: l,
    tokens: s.inlineTokens(l)
  };
  return s.state.inLink = !1, a;
}
function kf(e, t, n) {
  const s = e.match(n.other.indentCodeCompensation);
  if (s === null)
    return t;
  const r = s[1];
  return t.split(`
`).map((i) => {
    const o = i.match(n.other.beginningSpace);
    if (o === null)
      return i;
    const [l] = o;
    return l.length >= r.length ? i.slice(r.length) : i;
  }).join(`
`);
}
var Is = class {
  // set by the lexer
  constructor(e) {
    Ie(this, "options");
    Ie(this, "rules");
    // set by the lexer
    Ie(this, "lexer");
    this.options = e || bn;
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
        text: this.options.pedantic ? n : Dn(n, `
`)
      };
    }
  }
  fences(e) {
    const t = this.rules.block.fences.exec(e);
    if (t) {
      const n = t[0], s = kf(n, t[3] || "", this.rules);
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
        const s = Dn(n, "#");
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
        raw: Dn(t[0], `
`)
      };
  }
  blockquote(e) {
    const t = this.rules.block.blockquote.exec(e);
    if (t) {
      let n = Dn(t[0], `
`).split(`
`), s = "", r = "";
      const i = [];
      for (; n.length > 0; ) {
        let o = !1;
        const l = [];
        let a;
        for (a = 0; a < n.length; a++)
          if (this.rules.other.blockquoteStart.test(n[a]))
            l.push(n[a]), o = !0;
          else if (!o)
            l.push(n[a]);
          else
            break;
        n = n.slice(a);
        const c = l.join(`
`), u = c.replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
        s = s ? `${s}
${c}` : c, r = r ? `${r}
${u}` : u;
        const b = this.lexer.state.top;
        if (this.lexer.state.top = !0, this.lexer.blockTokens(u, i, !0), this.lexer.state.top = b, n.length === 0)
          break;
        const y = i.at(-1);
        if ((y == null ? void 0 : y.type) === "code")
          break;
        if ((y == null ? void 0 : y.type) === "blockquote") {
          const P = y, B = P.raw + `
` + n.join(`
`), U = this.blockquote(B);
          i[i.length - 1] = U, s = s.substring(0, s.length - P.raw.length) + U.raw, r = r.substring(0, r.length - P.text.length) + U.text;
          break;
        } else if ((y == null ? void 0 : y.type) === "list") {
          const P = y, B = P.raw + `
` + n.join(`
`), U = this.list(B);
          i[i.length - 1] = U, s = s.substring(0, s.length - y.raw.length) + U.raw, r = r.substring(0, r.length - P.raw.length) + U.raw, n = B.substring(i.at(-1).raw.length).split(`
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
        let a = !1, c = "", u = "";
        if (!(t = i.exec(e)) || this.rules.block.hr.test(e))
          break;
        c = t[0], e = e.substring(c.length);
        let b = t[2].split(`
`, 1)[0].replace(this.rules.other.listReplaceTabs, (oe) => " ".repeat(3 * oe.length)), y = e.split(`
`, 1)[0], P = !b.trim(), B = 0;
        if (this.options.pedantic ? (B = 2, u = b.trimStart()) : P ? B = t[1].length + 1 : (B = t[2].search(this.rules.other.nonSpaceChar), B = B > 4 ? 1 : B, u = b.slice(B), B += t[1].length), P && this.rules.other.blankLine.test(y) && (c += y + `
`, e = e.substring(y.length + 1), a = !0), !a) {
          const oe = this.rules.other.nextBulletRegex(B), _e = this.rules.other.hrRegex(B), ye = this.rules.other.fencesBeginRegex(B), H = this.rules.other.headingBeginRegex(B), N = this.rules.other.htmlBeginRegex(B);
          for (; e; ) {
            const Y = e.split(`
`, 1)[0];
            let K;
            if (y = Y, this.options.pedantic ? (y = y.replace(this.rules.other.listReplaceNesting, "  "), K = y) : K = y.replace(this.rules.other.tabCharGlobal, "    "), ye.test(y) || H.test(y) || N.test(y) || oe.test(y) || _e.test(y))
              break;
            if (K.search(this.rules.other.nonSpaceChar) >= B || !y.trim())
              u += `
` + K.slice(B);
            else {
              if (P || b.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || ye.test(b) || H.test(b) || _e.test(b))
                break;
              u += `
` + y;
            }
            !P && !y.trim() && (P = !0), c += Y + `
`, e = e.substring(Y.length + 1), b = K.slice(B);
          }
        }
        r.loose || (o ? r.loose = !0 : this.rules.other.doubleBlankLine.test(c) && (o = !0));
        let U = null, Ee;
        this.options.gfm && (U = this.rules.other.listIsTask.exec(u), U && (Ee = U[0] !== "[ ] ", u = u.replace(this.rules.other.listReplaceTask, ""))), r.items.push({
          type: "list_item",
          raw: c,
          task: !!U,
          checked: Ee,
          loose: !1,
          text: u,
          tokens: []
        }), r.raw += c;
      }
      const l = r.items.at(-1);
      if (l)
        l.raw = l.raw.trimEnd(), l.text = l.text.trimEnd();
      else
        return;
      r.raw = r.raw.trimEnd();
      for (let a = 0; a < r.items.length; a++)
        if (this.lexer.state.top = !1, r.items[a].tokens = this.lexer.blockTokens(r.items[a].text, []), !r.loose) {
          const c = r.items[a].tokens.filter((b) => b.type === "space"), u = c.length > 0 && c.some((b) => this.rules.other.anyLine.test(b.raw));
          r.loose = u;
        }
      if (r.loose)
        for (let a = 0; a < r.items.length; a++)
          r.items[a].loose = !0;
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
    const n = po(t[1]), s = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), r = (o = t[3]) != null && o.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
`) : [], i = {
      type: "table",
      raw: t[0],
      header: [],
      align: [],
      rows: []
    };
    if (n.length === s.length) {
      for (const l of s)
        this.rules.other.tableAlignRight.test(l) ? i.align.push("right") : this.rules.other.tableAlignCenter.test(l) ? i.align.push("center") : this.rules.other.tableAlignLeft.test(l) ? i.align.push("left") : i.align.push(null);
      for (let l = 0; l < n.length; l++)
        i.header.push({
          text: n[l],
          tokens: this.lexer.inline(n[l]),
          header: !0,
          align: i.align[l]
        });
      for (const l of r)
        i.rows.push(po(l, i.header.length).map((a, c) => ({
          text: a,
          tokens: this.lexer.inline(a),
          header: !1,
          align: i.align[c]
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
        const i = Dn(n.slice(0, -1), "\\");
        if ((n.length - i.length) % 2 === 0)
          return;
      } else {
        const i = wf(t[2], "()");
        if (i === -2)
          return;
        if (i > -1) {
          const l = (t[0].indexOf("!") === 0 ? 5 : 4) + t[1].length + i;
          t[2] = t[2].substring(0, i), t[0] = t[0].substring(0, l).trim(), t[3] = "";
        }
      }
      let s = t[2], r = "";
      if (this.options.pedantic) {
        const i = this.rules.other.pedanticHrefTitle.exec(s);
        i && (s = i[1], r = i[3]);
      } else
        r = t[3] ? t[3].slice(1, -1) : "";
      return s = s.trim(), this.rules.other.startAngleBracket.test(s) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n) ? s = s.slice(1) : s = s.slice(1, -1)), go(t, {
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
      return go(n, r, n[0], this.lexer, this.rules);
    }
  }
  emStrong(e, t, n = "") {
    let s = this.rules.inline.emStrongLDelim.exec(e);
    if (!s || s[3] && n.match(this.rules.other.unicodeAlphaNumeric)) return;
    if (!(s[1] || s[2] || "") || !n || this.rules.inline.punctuation.exec(n)) {
      const i = [...s[0]].length - 1;
      let o, l, a = i, c = 0;
      const u = s[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      for (u.lastIndex = 0, t = t.slice(-1 * e.length + i); (s = u.exec(t)) != null; ) {
        if (o = s[1] || s[2] || s[3] || s[4] || s[5] || s[6], !o) continue;
        if (l = [...o].length, s[3] || s[4]) {
          a += l;
          continue;
        } else if ((s[5] || s[6]) && i % 3 && !((i + l) % 3)) {
          c += l;
          continue;
        }
        if (a -= l, a > 0) continue;
        l = Math.min(l, l + a + c);
        const b = [...s[0]][0].length, y = e.slice(0, i + s.index + b + l);
        if (Math.min(i, l) % 2) {
          const B = y.slice(1, -1);
          return {
            type: "em",
            raw: y,
            text: B,
            tokens: this.lexer.inlineTokens(B)
          };
        }
        const P = y.slice(2, -2);
        return {
          type: "strong",
          raw: y,
          text: P,
          tokens: this.lexer.inlineTokens(P)
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
}, Gt = class Tr {
  constructor(t) {
    Ie(this, "tokens");
    Ie(this, "options");
    Ie(this, "state");
    Ie(this, "tokenizer");
    Ie(this, "inlineQueue");
    this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = t || bn, this.options.tokenizer = this.options.tokenizer || new Is(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = {
      inLink: !1,
      inRawBlock: !1,
      top: !0
    };
    const n = {
      other: dt,
      block: us.normal,
      inline: Mn.normal
    };
    this.options.pedantic ? (n.block = us.pedantic, n.inline = Mn.pedantic) : this.options.gfm && (n.block = us.gfm, this.options.breaks ? n.inline = Mn.breaks : n.inline = Mn.gfm), this.tokenizer.rules = n;
  }
  /**
   * Expose Rules
   */
  static get rules() {
    return {
      block: us,
      inline: Mn
    };
  }
  /**
   * Static Lex Method
   */
  static lex(t, n) {
    return new Tr(n).lex(t);
  }
  /**
   * Static Lex Inline Method
   */
  static lexInline(t, n) {
    return new Tr(n).inlineTokens(t);
  }
  /**
   * Preprocessing
   */
  lex(t) {
    t = t.replace(dt.carriageReturn, `
`), this.blockTokens(t, this.tokens);
    for (let n = 0; n < this.inlineQueue.length; n++) {
      const s = this.inlineQueue[n];
      this.inlineTokens(s.src, s.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(t, n = [], s = !1) {
    var r, i, o;
    for (this.options.pedantic && (t = t.replace(dt.tabCharGlobal, "    ").replace(dt.spaceLine, "")); t; ) {
      let l;
      if ((i = (r = this.options.extensions) == null ? void 0 : r.block) != null && i.some((c) => (l = c.call({ lexer: this }, t, n)) ? (t = t.substring(l.raw.length), n.push(l), !0) : !1))
        continue;
      if (l = this.tokenizer.space(t)) {
        t = t.substring(l.raw.length);
        const c = n.at(-1);
        l.raw.length === 1 && c !== void 0 ? c.raw += `
` : n.push(l);
        continue;
      }
      if (l = this.tokenizer.code(t)) {
        t = t.substring(l.raw.length);
        const c = n.at(-1);
        (c == null ? void 0 : c.type) === "paragraph" || (c == null ? void 0 : c.type) === "text" ? (c.raw += `
` + l.raw, c.text += `
` + l.text, this.inlineQueue.at(-1).src = c.text) : n.push(l);
        continue;
      }
      if (l = this.tokenizer.fences(t)) {
        t = t.substring(l.raw.length), n.push(l);
        continue;
      }
      if (l = this.tokenizer.heading(t)) {
        t = t.substring(l.raw.length), n.push(l);
        continue;
      }
      if (l = this.tokenizer.hr(t)) {
        t = t.substring(l.raw.length), n.push(l);
        continue;
      }
      if (l = this.tokenizer.blockquote(t)) {
        t = t.substring(l.raw.length), n.push(l);
        continue;
      }
      if (l = this.tokenizer.list(t)) {
        t = t.substring(l.raw.length), n.push(l);
        continue;
      }
      if (l = this.tokenizer.html(t)) {
        t = t.substring(l.raw.length), n.push(l);
        continue;
      }
      if (l = this.tokenizer.def(t)) {
        t = t.substring(l.raw.length);
        const c = n.at(-1);
        (c == null ? void 0 : c.type) === "paragraph" || (c == null ? void 0 : c.type) === "text" ? (c.raw += `
` + l.raw, c.text += `
` + l.raw, this.inlineQueue.at(-1).src = c.text) : this.tokens.links[l.tag] || (this.tokens.links[l.tag] = {
          href: l.href,
          title: l.title
        });
        continue;
      }
      if (l = this.tokenizer.table(t)) {
        t = t.substring(l.raw.length), n.push(l);
        continue;
      }
      if (l = this.tokenizer.lheading(t)) {
        t = t.substring(l.raw.length), n.push(l);
        continue;
      }
      let a = t;
      if ((o = this.options.extensions) != null && o.startBlock) {
        let c = 1 / 0;
        const u = t.slice(1);
        let b;
        this.options.extensions.startBlock.forEach((y) => {
          b = y.call({ lexer: this }, u), typeof b == "number" && b >= 0 && (c = Math.min(c, b));
        }), c < 1 / 0 && c >= 0 && (a = t.substring(0, c + 1));
      }
      if (this.state.top && (l = this.tokenizer.paragraph(a))) {
        const c = n.at(-1);
        s && (c == null ? void 0 : c.type) === "paragraph" ? (c.raw += `
` + l.raw, c.text += `
` + l.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = c.text) : n.push(l), s = a.length !== t.length, t = t.substring(l.raw.length);
        continue;
      }
      if (l = this.tokenizer.text(t)) {
        t = t.substring(l.raw.length);
        const c = n.at(-1);
        (c == null ? void 0 : c.type) === "text" ? (c.raw += `
` + l.raw, c.text += `
` + l.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = c.text) : n.push(l);
        continue;
      }
      if (t) {
        const c = "Infinite loop on byte: " + t.charCodeAt(0);
        if (this.options.silent) {
          console.error(c);
          break;
        } else
          throw new Error(c);
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
    var l, a, c;
    let s = t, r = null;
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
    for (; t; ) {
      i || (o = ""), i = !1;
      let u;
      if ((a = (l = this.options.extensions) == null ? void 0 : l.inline) != null && a.some((y) => (u = y.call({ lexer: this }, t, n)) ? (t = t.substring(u.raw.length), n.push(u), !0) : !1))
        continue;
      if (u = this.tokenizer.escape(t)) {
        t = t.substring(u.raw.length), n.push(u);
        continue;
      }
      if (u = this.tokenizer.tag(t)) {
        t = t.substring(u.raw.length), n.push(u);
        continue;
      }
      if (u = this.tokenizer.link(t)) {
        t = t.substring(u.raw.length), n.push(u);
        continue;
      }
      if (u = this.tokenizer.reflink(t, this.tokens.links)) {
        t = t.substring(u.raw.length);
        const y = n.at(-1);
        u.type === "text" && (y == null ? void 0 : y.type) === "text" ? (y.raw += u.raw, y.text += u.text) : n.push(u);
        continue;
      }
      if (u = this.tokenizer.emStrong(t, s, o)) {
        t = t.substring(u.raw.length), n.push(u);
        continue;
      }
      if (u = this.tokenizer.codespan(t)) {
        t = t.substring(u.raw.length), n.push(u);
        continue;
      }
      if (u = this.tokenizer.br(t)) {
        t = t.substring(u.raw.length), n.push(u);
        continue;
      }
      if (u = this.tokenizer.del(t)) {
        t = t.substring(u.raw.length), n.push(u);
        continue;
      }
      if (u = this.tokenizer.autolink(t)) {
        t = t.substring(u.raw.length), n.push(u);
        continue;
      }
      if (!this.state.inLink && (u = this.tokenizer.url(t))) {
        t = t.substring(u.raw.length), n.push(u);
        continue;
      }
      let b = t;
      if ((c = this.options.extensions) != null && c.startInline) {
        let y = 1 / 0;
        const P = t.slice(1);
        let B;
        this.options.extensions.startInline.forEach((U) => {
          B = U.call({ lexer: this }, P), typeof B == "number" && B >= 0 && (y = Math.min(y, B));
        }), y < 1 / 0 && y >= 0 && (b = t.substring(0, y + 1));
      }
      if (u = this.tokenizer.inlineText(b)) {
        t = t.substring(u.raw.length), u.raw.slice(-1) !== "_" && (o = u.raw.slice(-1)), i = !0;
        const y = n.at(-1);
        (y == null ? void 0 : y.type) === "text" ? (y.raw += u.raw, y.text += u.text) : n.push(u);
        continue;
      }
      if (t) {
        const y = "Infinite loop on byte: " + t.charCodeAt(0);
        if (this.options.silent) {
          console.error(y);
          break;
        } else
          throw new Error(y);
      }
    }
    return n;
  }
}, Ls = class {
  // set by the parser
  constructor(e) {
    Ie(this, "options");
    Ie(this, "parser");
    this.options = e || bn;
  }
  space(e) {
    return "";
  }
  code({ text: e, lang: t, escaped: n }) {
    var i;
    const s = (i = (t || "").match(dt.notSpaceStart)) == null ? void 0 : i[0], r = e.replace(dt.endingNewline, "") + `
`;
    return s ? '<pre><code class="language-' + Ft(s) + '">' + (n ? r : Ft(r, !0)) + `</code></pre>
` : "<pre><code>" + (n ? r : Ft(r, !0)) + `</code></pre>
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
      const l = e.items[o];
      s += this.listitem(l);
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
      e.loose ? ((n = e.tokens[0]) == null ? void 0 : n.type) === "paragraph" ? (e.tokens[0].text = s + " " + e.tokens[0].text, e.tokens[0].tokens && e.tokens[0].tokens.length > 0 && e.tokens[0].tokens[0].type === "text" && (e.tokens[0].tokens[0].text = s + " " + Ft(e.tokens[0].tokens[0].text), e.tokens[0].tokens[0].escaped = !0)) : e.tokens.unshift({
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
    return `<code>${Ft(e, !0)}</code>`;
  }
  br(e) {
    return "<br>";
  }
  del({ tokens: e }) {
    return `<del>${this.parser.parseInline(e)}</del>`;
  }
  link({ href: e, title: t, tokens: n }) {
    const s = this.parser.parseInline(n), r = ho(e);
    if (r === null)
      return s;
    e = r;
    let i = '<a href="' + e + '"';
    return t && (i += ' title="' + Ft(t) + '"'), i += ">" + s + "</a>", i;
  }
  image({ href: e, title: t, text: n, tokens: s }) {
    s && (n = this.parser.parseInline(s, this.parser.textRenderer));
    const r = ho(e);
    if (r === null)
      return Ft(n);
    e = r;
    let i = `<img src="${e}" alt="${n}"`;
    return t && (i += ` title="${Ft(t)}"`), i += ">", i;
  }
  text(e) {
    return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : Ft(e.text);
  }
}, oi = class {
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
}, Xt = class Ar {
  constructor(t) {
    Ie(this, "options");
    Ie(this, "renderer");
    Ie(this, "textRenderer");
    this.options = t || bn, this.options.renderer = this.options.renderer || new Ls(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new oi();
  }
  /**
   * Static Parse Method
   */
  static parse(t, n) {
    return new Ar(n).parse(t);
  }
  /**
   * Static Parse Inline Method
   */
  static parseInline(t, n) {
    return new Ar(n).parseInline(t);
  }
  /**
   * Parse Loop
   */
  parse(t, n = !0) {
    var r, i;
    let s = "";
    for (let o = 0; o < t.length; o++) {
      const l = t[o];
      if ((i = (r = this.options.extensions) == null ? void 0 : r.renderers) != null && i[l.type]) {
        const c = l, u = this.options.extensions.renderers[c.type].call({ parser: this }, c);
        if (u !== !1 || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "paragraph", "text"].includes(c.type)) {
          s += u || "";
          continue;
        }
      }
      const a = l;
      switch (a.type) {
        case "space": {
          s += this.renderer.space(a);
          continue;
        }
        case "hr": {
          s += this.renderer.hr(a);
          continue;
        }
        case "heading": {
          s += this.renderer.heading(a);
          continue;
        }
        case "code": {
          s += this.renderer.code(a);
          continue;
        }
        case "table": {
          s += this.renderer.table(a);
          continue;
        }
        case "blockquote": {
          s += this.renderer.blockquote(a);
          continue;
        }
        case "list": {
          s += this.renderer.list(a);
          continue;
        }
        case "html": {
          s += this.renderer.html(a);
          continue;
        }
        case "paragraph": {
          s += this.renderer.paragraph(a);
          continue;
        }
        case "text": {
          let c = a, u = this.renderer.text(c);
          for (; o + 1 < t.length && t[o + 1].type === "text"; )
            c = t[++o], u += `
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
          const c = 'Token with "' + a.type + '" type was not found.';
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
  parseInline(t, n = this.renderer) {
    var r, i;
    let s = "";
    for (let o = 0; o < t.length; o++) {
      const l = t[o];
      if ((i = (r = this.options.extensions) == null ? void 0 : r.renderers) != null && i[l.type]) {
        const c = this.options.extensions.renderers[l.type].call({ parser: this }, l);
        if (c !== !1 || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(l.type)) {
          s += c || "";
          continue;
        }
      }
      const a = l;
      switch (a.type) {
        case "escape": {
          s += n.text(a);
          break;
        }
        case "html": {
          s += n.html(a);
          break;
        }
        case "link": {
          s += n.link(a);
          break;
        }
        case "image": {
          s += n.image(a);
          break;
        }
        case "strong": {
          s += n.strong(a);
          break;
        }
        case "em": {
          s += n.em(a);
          break;
        }
        case "codespan": {
          s += n.codespan(a);
          break;
        }
        case "br": {
          s += n.br(a);
          break;
        }
        case "del": {
          s += n.del(a);
          break;
        }
        case "text": {
          s += n.text(a);
          break;
        }
        default: {
          const c = 'Token with "' + a.type + '" type was not found.';
          if (this.options.silent)
            return console.error(c), "";
          throw new Error(c);
        }
      }
    }
    return s;
  }
}, hr, ys = (hr = class {
  constructor(e) {
    Ie(this, "options");
    Ie(this, "block");
    this.options = e || bn;
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
    return this.block ? Gt.lex : Gt.lexInline;
  }
  /**
   * Provide function to parse tokens
   */
  provideParser() {
    return this.block ? Xt.parse : Xt.parseInline;
  }
}, Ie(hr, "passThroughHooks", /* @__PURE__ */ new Set([
  "preprocess",
  "postprocess",
  "processAllTokens"
])), hr), xf = class {
  constructor(...e) {
    Ie(this, "defaults", Jr());
    Ie(this, "options", this.setOptions);
    Ie(this, "parse", this.parseMarkdown(!0));
    Ie(this, "parseInline", this.parseMarkdown(!1));
    Ie(this, "Parser", Xt);
    Ie(this, "Renderer", Ls);
    Ie(this, "TextRenderer", oi);
    Ie(this, "Lexer", Gt);
    Ie(this, "Tokenizer", Is);
    Ie(this, "Hooks", ys);
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
          for (const l of o.header)
            n = n.concat(this.walkTokens(l.tokens, t));
          for (const l of o.rows)
            for (const a of l)
              n = n.concat(this.walkTokens(a.tokens, t));
          break;
        }
        case "list": {
          const o = i;
          n = n.concat(this.walkTokens(o.items, t));
          break;
        }
        default: {
          const o = i;
          (r = (s = this.defaults.extensions) == null ? void 0 : s.childTokens) != null && r[o.type] ? this.defaults.extensions.childTokens[o.type].forEach((l) => {
            const a = o[l].flat(1 / 0);
            n = n.concat(this.walkTokens(a, t));
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
            let l = r.renderer.apply(this, o);
            return l === !1 && (l = i.apply(this, o)), l;
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
        const r = this.defaults.renderer || new Ls(this.defaults);
        for (const i in n.renderer) {
          if (!(i in r))
            throw new Error(`renderer '${i}' does not exist`);
          if (["options", "parser"].includes(i))
            continue;
          const o = i, l = n.renderer[o], a = r[o];
          r[o] = (...c) => {
            let u = l.apply(r, c);
            return u === !1 && (u = a.apply(r, c)), u || "";
          };
        }
        s.renderer = r;
      }
      if (n.tokenizer) {
        const r = this.defaults.tokenizer || new Is(this.defaults);
        for (const i in n.tokenizer) {
          if (!(i in r))
            throw new Error(`tokenizer '${i}' does not exist`);
          if (["options", "rules", "lexer"].includes(i))
            continue;
          const o = i, l = n.tokenizer[o], a = r[o];
          r[o] = (...c) => {
            let u = l.apply(r, c);
            return u === !1 && (u = a.apply(r, c)), u;
          };
        }
        s.tokenizer = r;
      }
      if (n.hooks) {
        const r = this.defaults.hooks || new ys();
        for (const i in n.hooks) {
          if (!(i in r))
            throw new Error(`hook '${i}' does not exist`);
          if (["options", "block"].includes(i))
            continue;
          const o = i, l = n.hooks[o], a = r[o];
          ys.passThroughHooks.has(i) ? r[o] = (c) => {
            if (this.defaults.async)
              return Promise.resolve(l.call(r, c)).then((b) => a.call(r, b));
            const u = l.call(r, c);
            return a.call(r, u);
          } : r[o] = (...c) => {
            let u = l.apply(r, c);
            return u === !1 && (u = a.apply(r, c)), u;
          };
        }
        s.hooks = r;
      }
      if (n.walkTokens) {
        const r = this.defaults.walkTokens, i = n.walkTokens;
        s.walkTokens = function(o) {
          let l = [];
          return l.push(i.call(this, o)), r && (l = l.concat(r.call(this, o))), l;
        };
      }
      this.defaults = { ...this.defaults, ...s };
    }), this;
  }
  setOptions(e) {
    return this.defaults = { ...this.defaults, ...e }, this;
  }
  lexer(e, t) {
    return Gt.lex(e, t ?? this.defaults);
  }
  parser(e, t) {
    return Xt.parse(e, t ?? this.defaults);
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
      const l = i.hooks ? i.hooks.provideLexer() : e ? Gt.lex : Gt.lexInline, a = i.hooks ? i.hooks.provideParser() : e ? Xt.parse : Xt.parseInline;
      if (i.async)
        return Promise.resolve(i.hooks ? i.hooks.preprocess(n) : n).then((c) => l(c, i)).then((c) => i.hooks ? i.hooks.processAllTokens(c) : c).then((c) => i.walkTokens ? Promise.all(this.walkTokens(c, i.walkTokens)).then(() => c) : c).then((c) => a(c, i)).then((c) => i.hooks ? i.hooks.postprocess(c) : c).catch(o);
      try {
        i.hooks && (n = i.hooks.preprocess(n));
        let c = l(n, i);
        i.hooks && (c = i.hooks.processAllTokens(c)), i.walkTokens && this.walkTokens(c, i.walkTokens);
        let u = a(c, i);
        return i.hooks && (u = i.hooks.postprocess(u)), u;
      } catch (c) {
        return o(c);
      }
    };
  }
  onError(e, t) {
    return (n) => {
      if (n.message += `
Please report this to https://github.com/markedjs/marked.`, e) {
        const s = "<p>An error occurred:</p><pre>" + Ft(n.message + "", !0) + "</pre>";
        return t ? Promise.resolve(s) : s;
      }
      if (t)
        return Promise.reject(n);
      throw n;
    };
  }
}, vn = new xf();
function me(e, t) {
  return vn.parse(e, t);
}
me.options = me.setOptions = function(e) {
  return vn.setOptions(e), me.defaults = vn.defaults, Al(me.defaults), me;
};
me.getDefaults = Jr;
me.defaults = bn;
me.use = function(...e) {
  return vn.use(...e), me.defaults = vn.defaults, Al(me.defaults), me;
};
me.walkTokens = function(e, t) {
  return vn.walkTokens(e, t);
};
me.parseInline = vn.parseInline;
me.Parser = Xt;
me.parser = Xt.parse;
me.Renderer = Ls;
me.TextRenderer = oi;
me.Lexer = Gt;
me.lexer = Gt.lex;
me.Tokenizer = Is;
me.Hooks = ys;
me.parse = me;
me.options;
me.setOptions;
me.use;
me.walkTokens;
me.parseInline;
Xt.parse;
Gt.lex;
function mo() {
  return typeof window < "u" && window.APP_CONFIG ? window.APP_CONFIG : {};
}
const yn = {
  get API_URL() {
    return mo().API_URL || "https://api.chattermate.chat/api/v1";
  },
  get WS_URL() {
    return mo().WS_URL || "wss://api.chattermate.chat";
  }
};
function Sf(e) {
  const t = We(() => ({
    backgroundColor: e.value.chat_background_color || "#ffffff",
    color: en(e.value.chat_background_color || "#ffffff") ? "#ffffff" : "#000000"
  })), n = We(() => ({
    backgroundColor: e.value.chat_bubble_color || "#f34611",
    color: en(e.value.chat_bubble_color || "#f34611") ? "#FFFFFF" : "#000000"
  })), s = We(() => {
    const c = e.value.chat_background_color || "#F8F9FA", u = Du(c, 20);
    return {
      backgroundColor: u,
      color: en(u) ? "#FFFFFF" : "#000000"
    };
  }), r = We(() => ({
    backgroundColor: e.value.accent_color || "#f34611",
    color: en(e.value.accent_color || "#f34611") ? "#FFFFFF" : "#000000"
  })), i = We(() => ({
    color: en(e.value.chat_background_color || "#F8F9FA") ? "#FFFFFF" : "#000000"
  })), o = We(() => ({
    borderBottom: `1px solid ${en(e.value.chat_background_color || "#F8F9FA") ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`
  })), l = We(() => e.value.photo_url ? e.value.photo_url.includes("amazonaws.com") ? e.value.photo_url : `${yn.API_URL}${e.value.photo_url}` : ""), a = We(() => {
    const c = e.value.chat_background_color || "#ffffff";
    return {
      boxShadow: `0 8px 5px ${en(c) ? "rgba(0, 0, 0, 0.24)" : "rgba(0, 0, 0, 0.12)"}`
    };
  });
  return {
    chatStyles: t,
    chatIconStyles: n,
    agentBubbleStyles: s,
    userBubbleStyles: r,
    messageNameStyles: i,
    headerBorderStyles: o,
    photoUrl: l,
    shadowStyle: a
  };
}
function Cf(e, t) {
  const n = ae([]), s = ae(!1), r = ae(null), i = (N) => {
    if (N === 0) return "0 Bytes";
    const Y = 1024, K = ["Bytes", "KB", "MB", "GB"], we = Math.floor(Math.log(N) / Math.log(Y));
    return parseFloat((N / Math.pow(Y, we)).toFixed(2)) + " " + K[we];
  }, o = (N) => N.startsWith("image/"), l = (N) => N ? N.startsWith("blob:") || N.startsWith("http://") || N.startsWith("https://") ? N : `${yn.API_URL}${N}` : "", a = (N) => {
    const Y = N.file_url || N.url;
    return Y ? Y.startsWith("blob:") || Y.startsWith("http://") || Y.startsWith("https://") ? Y : `${yn.API_URL}${Y}` : "";
  }, c = async (N) => {
    const Y = N.target;
    Y.files && Y.files.length > 0 && (await U(Array.from(Y.files)), Y.value = "");
  }, u = async (N) => {
    var K;
    N.preventDefault();
    const Y = (K = N.dataTransfer) == null ? void 0 : K.files;
    Y && Y.length > 0 && await U(Array.from(Y));
  }, b = (N) => {
    N.preventDefault();
  }, y = (N) => {
    N.preventDefault();
  }, P = async (N) => {
    var we;
    const Y = (we = N.clipboardData) == null ? void 0 : we.items;
    if (!Y) return;
    const K = [];
    for (const qe of Array.from(Y))
      if (qe.kind === "file") {
        const Oe = qe.getAsFile();
        Oe && K.push(Oe);
      }
    K.length > 0 && await U(K);
  }, B = async (N, Y = 500) => new Promise((K, we) => {
    const qe = new FileReader();
    qe.onload = (Oe) => {
      var fe;
      const je = new Image();
      je.onload = () => {
        const Ue = document.createElement("canvas");
        let Ve = je.width, Te = je.height;
        const ee = 1920;
        (Ve > ee || Te > ee) && (Ve > Te ? (Te = Te / Ve * ee, Ve = ee) : (Ve = Ve / Te * ee, Te = ee)), Ue.width = Ve, Ue.height = Te;
        const X = Ue.getContext("2d");
        if (!X) {
          we(new Error("Failed to get canvas context"));
          return;
        }
        X.drawImage(je, 0, 0, Ve, Te);
        let J = 0.9;
        const ze = () => {
          Ue.toBlob((M) => {
            if (!M) {
              we(new Error("Failed to compress image"));
              return;
            }
            if (M.size / 1024 > Y && J > 0.3)
              J -= 0.1, ze();
            else {
              const D = new FileReader();
              D.onload = () => {
                const Pe = D.result.split(",")[1];
                K({ blob: M, base64: Pe });
              }, D.readAsDataURL(M);
            }
          }, N.type === "image/png" ? "image/png" : "image/jpeg", J);
        };
        ze();
      }, je.onerror = () => we(new Error("Failed to load image")), je.src = (fe = Oe.target) == null ? void 0 : fe.result;
    }, qe.onerror = () => we(new Error("Failed to read file")), qe.readAsDataURL(N);
  }), U = async (N) => {
    if (n.value.length >= 3) {
      alert("Maximum 3 files allowed per message");
      return;
    }
    const Oe = 3 - n.value.length, je = N.slice(0, Oe);
    N.length > Oe && alert(`Only ${Oe} more file(s) can be uploaded. Maximum 3 files per message.`);
    for (const fe of je)
      try {
        if (n.value.some((ee) => ee.filename === fe.name)) {
          console.warn(`File ${fe.name} is already selected`), alert(`File "${fe.name}" is already selected`);
          continue;
        }
        const Ve = fe.type.startsWith("image/"), Te = Ve ? 5242880 : 10485760;
        if (fe.size > Te) {
          const ee = Te / 1048576;
          console.error(`File ${fe.name} is too large. Maximum size is ${ee}MB`), alert(`File "${fe.name}" is too large. Maximum size for ${Ve ? "images" : "documents"} is ${ee}MB`);
          continue;
        }
        if (Ve)
          try {
            const { blob: ee, base64: X } = await B(fe, 500), J = ee.size;
            console.log(`Compressed ${fe.name}: ${(fe.size / 1024).toFixed(2)}KB → ${(J / 1024).toFixed(2)}KB`), n.value.push({
              content: X,
              filename: fe.name,
              type: fe.type,
              size: J,
              url: URL.createObjectURL(ee),
              file_url: URL.createObjectURL(ee)
            });
          } catch (ee) {
            console.error("Image compression failed, uploading original:", ee);
            const X = new FileReader();
            X.onload = (J) => {
              var he;
              const M = ((he = J.target) == null ? void 0 : he.result).split(",")[1];
              n.value.push({
                content: M,
                filename: fe.name,
                type: fe.type,
                size: fe.size,
                url: URL.createObjectURL(fe),
                file_url: URL.createObjectURL(fe)
              });
            }, X.readAsDataURL(fe);
          }
        else {
          const ee = new FileReader();
          ee.onload = (X) => {
            var M;
            const ze = ((M = X.target) == null ? void 0 : M.result).split(",")[1];
            n.value.push({
              content: ze,
              filename: fe.name,
              type: fe.type || "application/octet-stream",
              size: fe.size,
              url: "",
              file_url: ""
            });
          }, ee.readAsDataURL(fe);
        }
      } catch (Ue) {
        console.error("File upload error:", Ue);
      }
  };
  return {
    uploadedAttachments: n,
    previewModal: s,
    previewFile: r,
    formatFileSize: i,
    isImageAttachment: o,
    getDownloadUrl: l,
    getPreviewUrl: a,
    handleFileSelect: c,
    handleDrop: u,
    handleDragOver: b,
    handleDragLeave: y,
    handlePaste: P,
    uploadFiles: U,
    removeAttachment: async (N) => {
      const Y = n.value[N];
      if (Y) {
        try {
          let K = Y.url;
          K.startsWith("/uploads/") ? K = K.substring(9) : K.startsWith("/") && (K = K.substring(1)), K.includes("amazonaws.com/") && (K = K.split("amazonaws.com/")[1]);
          const we = {};
          e.value && (we.Authorization = `Bearer ${e.value}`);
          const qe = await fetch(`${yn.API_URL}/api/v1/files/upload/${K}`, {
            method: "DELETE",
            headers: we
          });
          if (qe.ok)
            console.log("File deleted successfully from backend.");
          else {
            const Oe = await qe.json();
            console.error("Failed to delete file:", Oe.detail);
          }
        } catch (K) {
          console.error("Error calling delete API:", K);
        }
        Y.url && Y.url.startsWith("blob:") && URL.revokeObjectURL(Y.url), Y.file_url && Y.file_url.startsWith("blob:") && URL.revokeObjectURL(Y.file_url), n.value.splice(N, 1);
      }
    },
    openPreview: (N) => {
      r.value = N, s.value = !0;
    },
    closePreview: () => {
      s.value = !1, setTimeout(() => {
        r.value = null;
      }, 300);
    },
    openFilePicker: () => {
      var N;
      (N = t.value) == null || N.click();
    },
    isImage: (N) => N.startsWith("image/")
  };
}
const zt = /* @__PURE__ */ Object.create(null);
zt.open = "0";
zt.close = "1";
zt.ping = "2";
zt.pong = "3";
zt.message = "4";
zt.upgrade = "5";
zt.noop = "6";
const vs = /* @__PURE__ */ Object.create(null);
Object.keys(zt).forEach((e) => {
  vs[zt[e]] = e;
});
const Er = { type: "error", data: "parser error" }, Ml = typeof Blob == "function" || typeof Blob < "u" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]", Dl = typeof ArrayBuffer == "function", ql = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e && e.buffer instanceof ArrayBuffer, li = ({ type: e, data: t }, n, s) => Ml && t instanceof Blob ? n ? s(t) : _o(t, s) : Dl && (t instanceof ArrayBuffer || ql(t)) ? n ? s(t) : _o(new Blob([t]), s) : s(zt[e] + (t || "")), _o = (e, t) => {
  const n = new FileReader();
  return n.onload = function() {
    const s = n.result.split(",")[1];
    t("b" + (s || ""));
  }, n.readAsDataURL(e);
};
function yo(e) {
  return e instanceof Uint8Array ? e : e instanceof ArrayBuffer ? new Uint8Array(e) : new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
}
let lr;
function Tf(e, t) {
  if (Ml && e.data instanceof Blob)
    return e.data.arrayBuffer().then(yo).then(t);
  if (Dl && (e.data instanceof ArrayBuffer || ql(e.data)))
    return t(yo(e.data));
  li(e, !1, (n) => {
    lr || (lr = new TextEncoder()), t(lr.encode(n));
  });
}
const vo = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", zn = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (let e = 0; e < vo.length; e++)
  zn[vo.charCodeAt(e)] = e;
const Af = (e) => {
  let t = e.length * 0.75, n = e.length, s, r = 0, i, o, l, a;
  e[e.length - 1] === "=" && (t--, e[e.length - 2] === "=" && t--);
  const c = new ArrayBuffer(t), u = new Uint8Array(c);
  for (s = 0; s < n; s += 4)
    i = zn[e.charCodeAt(s)], o = zn[e.charCodeAt(s + 1)], l = zn[e.charCodeAt(s + 2)], a = zn[e.charCodeAt(s + 3)], u[r++] = i << 2 | o >> 4, u[r++] = (o & 15) << 4 | l >> 2, u[r++] = (l & 3) << 6 | a & 63;
  return c;
}, Ef = typeof ArrayBuffer == "function", ai = (e, t) => {
  if (typeof e != "string")
    return {
      type: "message",
      data: Ul(e, t)
    };
  const n = e.charAt(0);
  return n === "b" ? {
    type: "message",
    data: Rf(e.substring(1), t)
  } : vs[n] ? e.length > 1 ? {
    type: vs[n],
    data: e.substring(1)
  } : {
    type: vs[n]
  } : Er;
}, Rf = (e, t) => {
  if (Ef) {
    const n = Af(e);
    return Ul(n, t);
  } else
    return { base64: !0, data: e };
}, Ul = (e, t) => {
  switch (t) {
    case "blob":
      return e instanceof Blob ? e : new Blob([e]);
    case "arraybuffer":
    default:
      return e instanceof ArrayBuffer ? e : e.buffer;
  }
}, zl = "", If = (e, t) => {
  const n = e.length, s = new Array(n);
  let r = 0;
  e.forEach((i, o) => {
    li(i, !1, (l) => {
      s[o] = l, ++r === n && t(s.join(zl));
    });
  });
}, Lf = (e, t) => {
  const n = e.split(zl), s = [];
  for (let r = 0; r < n.length; r++) {
    const i = ai(n[r], t);
    if (s.push(i), i.type === "error")
      break;
  }
  return s;
};
function Of() {
  return new TransformStream({
    transform(e, t) {
      Tf(e, (n) => {
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
let ar;
function fs(e) {
  return e.reduce((t, n) => t + n.length, 0);
}
function hs(e, t) {
  if (e[0].length === t)
    return e.shift();
  const n = new Uint8Array(t);
  let s = 0;
  for (let r = 0; r < t; r++)
    n[r] = e[0][s++], s === e[0].length && (e.shift(), s = 0);
  return e.length && s < e[0].length && (e[0] = e[0].slice(s)), n;
}
function Pf(e, t) {
  ar || (ar = new TextDecoder());
  const n = [];
  let s = 0, r = -1, i = !1;
  return new TransformStream({
    transform(o, l) {
      for (n.push(o); ; ) {
        if (s === 0) {
          if (fs(n) < 1)
            break;
          const a = hs(n, 1);
          i = (a[0] & 128) === 128, r = a[0] & 127, r < 126 ? s = 3 : r === 126 ? s = 1 : s = 2;
        } else if (s === 1) {
          if (fs(n) < 2)
            break;
          const a = hs(n, 2);
          r = new DataView(a.buffer, a.byteOffset, a.length).getUint16(0), s = 3;
        } else if (s === 2) {
          if (fs(n) < 8)
            break;
          const a = hs(n, 8), c = new DataView(a.buffer, a.byteOffset, a.length), u = c.getUint32(0);
          if (u > Math.pow(2, 21) - 1) {
            l.enqueue(Er);
            break;
          }
          r = u * Math.pow(2, 32) + c.getUint32(4), s = 3;
        } else {
          if (fs(n) < r)
            break;
          const a = hs(n, r);
          l.enqueue(ai(i ? a : ar.decode(a), t)), s = 0;
        }
        if (r === 0 || r > e) {
          l.enqueue(Er);
          break;
        }
      }
    }
  });
}
const Hl = 4;
function Xe(e) {
  if (e) return $f(e);
}
function $f(e) {
  for (var t in Xe.prototype)
    e[t] = Xe.prototype[t];
  return e;
}
Xe.prototype.on = Xe.prototype.addEventListener = function(e, t) {
  return this._callbacks = this._callbacks || {}, (this._callbacks["$" + e] = this._callbacks["$" + e] || []).push(t), this;
};
Xe.prototype.once = function(e, t) {
  function n() {
    this.off(e, n), t.apply(this, arguments);
  }
  return n.fn = t, this.on(e, n), this;
};
Xe.prototype.off = Xe.prototype.removeListener = Xe.prototype.removeAllListeners = Xe.prototype.removeEventListener = function(e, t) {
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
Xe.prototype.emit = function(e) {
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
Xe.prototype.emitReserved = Xe.prototype.emit;
Xe.prototype.listeners = function(e) {
  return this._callbacks = this._callbacks || {}, this._callbacks["$" + e] || [];
};
Xe.prototype.hasListeners = function(e) {
  return !!this.listeners(e).length;
};
const Vs = typeof Promise == "function" && typeof Promise.resolve == "function" ? (t) => Promise.resolve().then(t) : (t, n) => n(t, 0), Tt = typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")(), Ff = "arraybuffer";
function Vl(e, ...t) {
  return t.reduce((n, s) => (e.hasOwnProperty(s) && (n[s] = e[s]), n), {});
}
const Bf = Tt.setTimeout, Nf = Tt.clearTimeout;
function Ws(e, t) {
  t.useNativeTimers ? (e.setTimeoutFn = Bf.bind(Tt), e.clearTimeoutFn = Nf.bind(Tt)) : (e.setTimeoutFn = Tt.setTimeout.bind(Tt), e.clearTimeoutFn = Tt.clearTimeout.bind(Tt));
}
const Mf = 1.33;
function Df(e) {
  return typeof e == "string" ? qf(e) : Math.ceil((e.byteLength || e.size) * Mf);
}
function qf(e) {
  let t = 0, n = 0;
  for (let s = 0, r = e.length; s < r; s++)
    t = e.charCodeAt(s), t < 128 ? n += 1 : t < 2048 ? n += 2 : t < 55296 || t >= 57344 ? n += 3 : (s++, n += 4);
  return n;
}
function Wl() {
  return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
}
function Uf(e) {
  let t = "";
  for (let n in e)
    e.hasOwnProperty(n) && (t.length && (t += "&"), t += encodeURIComponent(n) + "=" + encodeURIComponent(e[n]));
  return t;
}
function zf(e) {
  let t = {}, n = e.split("&");
  for (let s = 0, r = n.length; s < r; s++) {
    let i = n[s].split("=");
    t[decodeURIComponent(i[0])] = decodeURIComponent(i[1]);
  }
  return t;
}
class Hf extends Error {
  constructor(t, n, s) {
    super(t), this.description = n, this.context = s, this.type = "TransportError";
  }
}
class ci extends Xe {
  /**
   * Transport abstract constructor.
   *
   * @param {Object} opts - options
   * @protected
   */
  constructor(t) {
    super(), this.writable = !1, Ws(this, t), this.opts = t, this.query = t.query, this.socket = t.socket, this.supportsBinary = !t.forceBase64;
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
    return super.emitReserved("error", new Hf(t, n, s)), this;
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
    const n = ai(t, this.socket.binaryType);
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
    const n = Uf(t);
    return n.length ? "?" + n : "";
  }
}
class Vf extends ci {
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
    Lf(t, this.socket.binaryType).forEach(n), this.readyState !== "closed" && (this._polling = !1, this.emitReserved("pollComplete"), this.readyState === "open" && this._poll());
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
    this.writable = !1, If(t, (n) => {
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
    return this.opts.timestampRequests !== !1 && (n[this.opts.timestampParam] = Wl()), !this.supportsBinary && !n.sid && (n.b64 = 1), this.createUri(t, n);
  }
}
let jl = !1;
try {
  jl = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest();
} catch {
}
const Wf = jl;
function jf() {
}
class Kf extends Vf {
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
class qt extends Xe {
  /**
   * Request constructor
   *
   * @param {Object} options
   * @package
   */
  constructor(t, n, s) {
    super(), this.createRequest = t, Ws(this, s), this._opts = s, this._method = s.method || "GET", this._uri = n, this._data = s.data !== void 0 ? s.data : null, this._create();
  }
  /**
   * Creates the XHR object and sends the request.
   *
   * @private
   */
  _create() {
    var t;
    const n = Vl(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
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
    typeof document < "u" && (this._index = qt.requestsCount++, qt.requests[this._index] = this);
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
      if (this._xhr.onreadystatechange = jf, t)
        try {
          this._xhr.abort();
        } catch {
        }
      typeof document < "u" && delete qt.requests[this._index], this._xhr = null;
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
qt.requestsCount = 0;
qt.requests = {};
if (typeof document < "u") {
  if (typeof attachEvent == "function")
    attachEvent("onunload", bo);
  else if (typeof addEventListener == "function") {
    const e = "onpagehide" in Tt ? "pagehide" : "unload";
    addEventListener(e, bo, !1);
  }
}
function bo() {
  for (let e in qt.requests)
    qt.requests.hasOwnProperty(e) && qt.requests[e].abort();
}
const Zf = function() {
  const e = Kl({
    xdomain: !1
  });
  return e && e.responseType !== null;
}();
class Gf extends Kf {
  constructor(t) {
    super(t);
    const n = t && t.forceBase64;
    this.supportsBinary = Zf && !n;
  }
  request(t = {}) {
    return Object.assign(t, { xd: this.xd }, this.opts), new qt(Kl, this.uri(), t);
  }
}
function Kl(e) {
  const t = e.xdomain;
  try {
    if (typeof XMLHttpRequest < "u" && (!t || Wf))
      return new XMLHttpRequest();
  } catch {
  }
  if (!t)
    try {
      return new Tt[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
    } catch {
    }
}
const Zl = typeof navigator < "u" && typeof navigator.product == "string" && navigator.product.toLowerCase() === "reactnative";
class Xf extends ci {
  get name() {
    return "websocket";
  }
  doOpen() {
    const t = this.uri(), n = this.opts.protocols, s = Zl ? {} : Vl(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
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
      li(s, this.supportsBinary, (i) => {
        try {
          this.doWrite(s, i);
        } catch {
        }
        r && Vs(() => {
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
    return this.opts.timestampRequests && (n[this.opts.timestampParam] = Wl()), this.supportsBinary || (n.b64 = 1), this.createUri(t, n);
  }
}
const cr = Tt.WebSocket || Tt.MozWebSocket;
class Yf extends Xf {
  createSocket(t, n, s) {
    return Zl ? new cr(t, n, s) : n ? new cr(t, n) : new cr(t);
  }
  doWrite(t, n) {
    this.ws.send(n);
  }
}
class Jf extends ci {
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
        const n = Pf(Number.MAX_SAFE_INTEGER, this.socket.binaryType), s = t.readable.pipeThrough(n).getReader(), r = Of();
        r.readable.pipeTo(t.writable), this._writer = r.writable.getWriter();
        const i = () => {
          s.read().then(({ done: l, value: a }) => {
            l || (this.onPacket(a), i());
          }).catch((l) => {
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
        r && Vs(() => {
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
const Qf = {
  websocket: Yf,
  webtransport: Jf,
  polling: Gf
}, eh = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/, th = [
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
function Rr(e) {
  if (e.length > 8e3)
    throw "URI too long";
  const t = e, n = e.indexOf("["), s = e.indexOf("]");
  n != -1 && s != -1 && (e = e.substring(0, n) + e.substring(n, s).replace(/:/g, ";") + e.substring(s, e.length));
  let r = eh.exec(e || ""), i = {}, o = 14;
  for (; o--; )
    i[th[o]] = r[o] || "";
  return n != -1 && s != -1 && (i.source = t, i.host = i.host.substring(1, i.host.length - 1).replace(/;/g, ":"), i.authority = i.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), i.ipv6uri = !0), i.pathNames = nh(i, i.path), i.queryKey = sh(i, i.query), i;
}
function nh(e, t) {
  const n = /\/{2,9}/g, s = t.replace(n, "/").split("/");
  return (t.slice(0, 1) == "/" || t.length === 0) && s.splice(0, 1), t.slice(-1) == "/" && s.splice(s.length - 1, 1), s;
}
function sh(e, t) {
  const n = {};
  return t.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function(s, r, i) {
    r && (n[r] = i);
  }), n;
}
const Ir = typeof addEventListener == "function" && typeof removeEventListener == "function", bs = [];
Ir && addEventListener("offline", () => {
  bs.forEach((e) => e());
}, !1);
class on extends Xe {
  /**
   * Socket constructor.
   *
   * @param {String|Object} uri - uri or options
   * @param {Object} opts - options
   */
  constructor(t, n) {
    if (super(), this.binaryType = Ff, this.writeBuffer = [], this._prevBufferLen = 0, this._pingInterval = -1, this._pingTimeout = -1, this._maxPayload = -1, this._pingTimeoutTime = 1 / 0, t && typeof t == "object" && (n = t, t = null), t) {
      const s = Rr(t);
      n.hostname = s.host, n.secure = s.protocol === "https" || s.protocol === "wss", n.port = s.port, s.query && (n.query = s.query);
    } else n.host && (n.hostname = Rr(n.host).host);
    Ws(this, n), this.secure = n.secure != null ? n.secure : typeof location < "u" && location.protocol === "https:", n.hostname && !n.port && (n.port = this.secure ? "443" : "80"), this.hostname = n.hostname || (typeof location < "u" ? location.hostname : "localhost"), this.port = n.port || (typeof location < "u" && location.port ? location.port : this.secure ? "443" : "80"), this.transports = [], this._transportsByName = {}, n.transports.forEach((s) => {
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
    }, n), this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : ""), typeof this.opts.query == "string" && (this.opts.query = zf(this.opts.query)), Ir && (this.opts.closeOnBeforeunload && (this._beforeunloadEventListener = () => {
      this.transport && (this.transport.removeAllListeners(), this.transport.close());
    }, addEventListener("beforeunload", this._beforeunloadEventListener, !1)), this.hostname !== "localhost" && (this._offlineEventListener = () => {
      this._onClose("transport close", {
        description: "network connection lost"
      });
    }, bs.push(this._offlineEventListener))), this.opts.withCredentials && (this._cookieJar = void 0), this._open();
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
    n.EIO = Hl, n.transport = t, this.id && (n.sid = this.id);
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
    const t = this.opts.rememberUpgrade && on.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1 ? "websocket" : this.transports[0];
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
    this.readyState = "open", on.priorWebsocketSuccess = this.transport.name === "websocket", this.emitReserved("open"), this.flush();
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
      if (r && (n += Df(r)), s > 0 && n > this._maxPayload)
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
    return t && (this._pingTimeoutTime = 0, Vs(() => {
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
    if (on.priorWebsocketSuccess = !1, this.opts.tryAllTransports && this.transports.length > 1 && this.readyState === "opening")
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
      if (this.clearTimeoutFn(this._pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), Ir && (this._beforeunloadEventListener && removeEventListener("beforeunload", this._beforeunloadEventListener, !1), this._offlineEventListener)) {
        const s = bs.indexOf(this._offlineEventListener);
        s !== -1 && bs.splice(s, 1);
      }
      this.readyState = "closed", this.id = null, this.emitReserved("close", t, n), this.writeBuffer = [], this._prevBufferLen = 0;
    }
  }
}
on.protocol = Hl;
class rh extends on {
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
    on.priorWebsocketSuccess = !1;
    const r = () => {
      s || (n.send([{ type: "ping", data: "probe" }]), n.once("packet", (b) => {
        if (!s)
          if (b.type === "pong" && b.data === "probe") {
            if (this.upgrading = !0, this.emitReserved("upgrading", n), !n)
              return;
            on.priorWebsocketSuccess = n.name === "websocket", this.transport.pause(() => {
              s || this.readyState !== "closed" && (u(), this.setTransport(n), n.send([{ type: "upgrade" }]), this.emitReserved("upgrade", n), n = null, this.upgrading = !1, this.flush());
            });
          } else {
            const y = new Error("probe error");
            y.transport = n.name, this.emitReserved("upgradeError", y);
          }
      }));
    };
    function i() {
      s || (s = !0, u(), n.close(), n = null);
    }
    const o = (b) => {
      const y = new Error("probe error: " + b);
      y.transport = n.name, i(), this.emitReserved("upgradeError", y);
    };
    function l() {
      o("transport closed");
    }
    function a() {
      o("socket closed");
    }
    function c(b) {
      n && b.name !== n.name && i();
    }
    const u = () => {
      n.removeListener("open", r), n.removeListener("error", o), n.removeListener("close", l), this.off("close", a), this.off("upgrading", c);
    };
    n.once("open", r), n.once("error", o), n.once("close", l), this.once("close", a), this.once("upgrading", c), this._upgrades.indexOf("webtransport") !== -1 && t !== "webtransport" ? this.setTimeoutFn(() => {
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
let ih = class extends rh {
  constructor(t, n = {}) {
    const s = typeof t == "object" ? t : n;
    (!s.transports || s.transports && typeof s.transports[0] == "string") && (s.transports = (s.transports || ["polling", "websocket", "webtransport"]).map((r) => Qf[r]).filter((r) => !!r)), super(t, s);
  }
};
function oh(e, t = "", n) {
  let s = e;
  n = n || typeof location < "u" && location, e == null && (e = n.protocol + "//" + n.host), typeof e == "string" && (e.charAt(0) === "/" && (e.charAt(1) === "/" ? e = n.protocol + e : e = n.host + e), /^(https?|wss?):\/\//.test(e) || (typeof n < "u" ? e = n.protocol + "//" + e : e = "https://" + e), s = Rr(e)), s.port || (/^(http|ws)$/.test(s.protocol) ? s.port = "80" : /^(http|ws)s$/.test(s.protocol) && (s.port = "443")), s.path = s.path || "/";
  const i = s.host.indexOf(":") !== -1 ? "[" + s.host + "]" : s.host;
  return s.id = s.protocol + "://" + i + ":" + s.port + t, s.href = s.protocol + "://" + i + (n && n.port === s.port ? "" : ":" + s.port), s;
}
const lh = typeof ArrayBuffer == "function", ah = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e.buffer instanceof ArrayBuffer, Gl = Object.prototype.toString, ch = typeof Blob == "function" || typeof Blob < "u" && Gl.call(Blob) === "[object BlobConstructor]", uh = typeof File == "function" || typeof File < "u" && Gl.call(File) === "[object FileConstructor]";
function ui(e) {
  return lh && (e instanceof ArrayBuffer || ah(e)) || ch && e instanceof Blob || uh && e instanceof File;
}
function ws(e, t) {
  if (!e || typeof e != "object")
    return !1;
  if (Array.isArray(e)) {
    for (let n = 0, s = e.length; n < s; n++)
      if (ws(e[n]))
        return !0;
    return !1;
  }
  if (ui(e))
    return !0;
  if (e.toJSON && typeof e.toJSON == "function" && arguments.length === 1)
    return ws(e.toJSON(), !0);
  for (const n in e)
    if (Object.prototype.hasOwnProperty.call(e, n) && ws(e[n]))
      return !0;
  return !1;
}
function fh(e) {
  const t = [], n = e.data, s = e;
  return s.data = Lr(n, t), s.attachments = t.length, { packet: s, buffers: t };
}
function Lr(e, t) {
  if (!e)
    return e;
  if (ui(e)) {
    const n = { _placeholder: !0, num: t.length };
    return t.push(e), n;
  } else if (Array.isArray(e)) {
    const n = new Array(e.length);
    for (let s = 0; s < e.length; s++)
      n[s] = Lr(e[s], t);
    return n;
  } else if (typeof e == "object" && !(e instanceof Date)) {
    const n = {};
    for (const s in e)
      Object.prototype.hasOwnProperty.call(e, s) && (n[s] = Lr(e[s], t));
    return n;
  }
  return e;
}
function hh(e, t) {
  return e.data = Or(e.data, t), delete e.attachments, e;
}
function Or(e, t) {
  if (!e)
    return e;
  if (e && e._placeholder === !0) {
    if (typeof e.num == "number" && e.num >= 0 && e.num < t.length)
      return t[e.num];
    throw new Error("illegal attachments");
  } else if (Array.isArray(e))
    for (let n = 0; n < e.length; n++)
      e[n] = Or(e[n], t);
  else if (typeof e == "object")
    for (const n in e)
      Object.prototype.hasOwnProperty.call(e, n) && (e[n] = Or(e[n], t));
  return e;
}
const dh = [
  "connect",
  "connect_error",
  "disconnect",
  "disconnecting",
  "newListener",
  "removeListener"
  // used by the Node.js EventEmitter
], ph = 5;
var ge;
(function(e) {
  e[e.CONNECT = 0] = "CONNECT", e[e.DISCONNECT = 1] = "DISCONNECT", e[e.EVENT = 2] = "EVENT", e[e.ACK = 3] = "ACK", e[e.CONNECT_ERROR = 4] = "CONNECT_ERROR", e[e.BINARY_EVENT = 5] = "BINARY_EVENT", e[e.BINARY_ACK = 6] = "BINARY_ACK";
})(ge || (ge = {}));
class gh {
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
    return (t.type === ge.EVENT || t.type === ge.ACK) && ws(t) ? this.encodeAsBinary({
      type: t.type === ge.EVENT ? ge.BINARY_EVENT : ge.BINARY_ACK,
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
    return (t.type === ge.BINARY_EVENT || t.type === ge.BINARY_ACK) && (n += t.attachments + "-"), t.nsp && t.nsp !== "/" && (n += t.nsp + ","), t.id != null && (n += t.id), t.data != null && (n += JSON.stringify(t.data, this.replacer)), n;
  }
  /**
   * Encode packet as 'buffer sequence' by removing blobs, and
   * deconstructing packet into object with placeholders and
   * a list of buffers.
   */
  encodeAsBinary(t) {
    const n = fh(t), s = this.encodeAsString(n.packet), r = n.buffers;
    return r.unshift(s), r;
  }
}
function wo(e) {
  return Object.prototype.toString.call(e) === "[object Object]";
}
class fi extends Xe {
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
      const s = n.type === ge.BINARY_EVENT;
      s || n.type === ge.BINARY_ACK ? (n.type = s ? ge.EVENT : ge.ACK, this.reconstructor = new mh(n), n.attachments === 0 && super.emitReserved("decoded", n)) : super.emitReserved("decoded", n);
    } else if (ui(t) || t.base64)
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
    if (ge[s.type] === void 0)
      throw new Error("unknown packet type " + s.type);
    if (s.type === ge.BINARY_EVENT || s.type === ge.BINARY_ACK) {
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
      if (fi.isPayloadValid(s.type, i))
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
      case ge.CONNECT:
        return wo(n);
      case ge.DISCONNECT:
        return n === void 0;
      case ge.CONNECT_ERROR:
        return typeof n == "string" || wo(n);
      case ge.EVENT:
      case ge.BINARY_EVENT:
        return Array.isArray(n) && (typeof n[0] == "number" || typeof n[0] == "string" && dh.indexOf(n[0]) === -1);
      case ge.ACK:
      case ge.BINARY_ACK:
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
class mh {
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
      const n = hh(this.reconPack, this.buffers);
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
const _h = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Decoder: fi,
  Encoder: gh,
  get PacketType() {
    return ge;
  },
  protocol: ph
}, Symbol.toStringTag, { value: "Module" }));
function Rt(e, t, n) {
  return e.on(t, n), function() {
    e.off(t, n);
  };
}
const yh = Object.freeze({
  connect: 1,
  connect_error: 1,
  disconnect: 1,
  disconnecting: 1,
  // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
  newListener: 1,
  removeListener: 1
});
class Xl extends Xe {
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
      Rt(t, "open", this.onopen.bind(this)),
      Rt(t, "packet", this.onpacket.bind(this)),
      Rt(t, "error", this.onerror.bind(this)),
      Rt(t, "close", this.onclose.bind(this))
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
    if (yh.hasOwnProperty(t))
      throw new Error('"' + t.toString() + '" is a reserved event name');
    if (n.unshift(t), this._opts.retries && !this.flags.fromQueue && !this.flags.volatile)
      return this._addToQueue(n), this;
    const o = {
      type: ge.EVENT,
      data: n
    };
    if (o.options = {}, o.options.compress = this.flags.compress !== !1, typeof n[n.length - 1] == "function") {
      const u = this.ids++, b = n.pop();
      this._registerAckCallback(u, b), o.id = u;
    }
    const l = (r = (s = this.io.engine) === null || s === void 0 ? void 0 : s.transport) === null || r === void 0 ? void 0 : r.writable, a = this.connected && !(!((i = this.io.engine) === null || i === void 0) && i._hasPingExpired());
    return this.flags.volatile && !l || (a ? (this.notifyOutgoingListeners(o), this.packet(o)) : this.sendBuffer.push(o)), this.flags = {}, this;
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
      for (let l = 0; l < this.sendBuffer.length; l++)
        this.sendBuffer[l].id === t && this.sendBuffer.splice(l, 1);
      n.call(this, new Error("operation has timed out"));
    }, r), o = (...l) => {
      this.io.clearTimeoutFn(i), n.apply(this, l);
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
      const i = (o, l) => o ? r(o) : s(l);
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
      type: ge.CONNECT,
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
        case ge.CONNECT:
          t.data && t.data.sid ? this.onconnect(t.data.sid, t.data.pid) : this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
          break;
        case ge.EVENT:
        case ge.BINARY_EVENT:
          this.onevent(t);
          break;
        case ge.ACK:
        case ge.BINARY_ACK:
          this.onack(t);
          break;
        case ge.DISCONNECT:
          this.ondisconnect();
          break;
        case ge.CONNECT_ERROR:
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
        type: ge.ACK,
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
    return this.connected && this.packet({ type: ge.DISCONNECT }), this.destroy(), this.connected && this.onclose("io client disconnect"), this;
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
function Pn(e) {
  e = e || {}, this.ms = e.min || 100, this.max = e.max || 1e4, this.factor = e.factor || 2, this.jitter = e.jitter > 0 && e.jitter <= 1 ? e.jitter : 0, this.attempts = 0;
}
Pn.prototype.duration = function() {
  var e = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var t = Math.random(), n = Math.floor(t * this.jitter * e);
    e = (Math.floor(t * 10) & 1) == 0 ? e - n : e + n;
  }
  return Math.min(e, this.max) | 0;
};
Pn.prototype.reset = function() {
  this.attempts = 0;
};
Pn.prototype.setMin = function(e) {
  this.ms = e;
};
Pn.prototype.setMax = function(e) {
  this.max = e;
};
Pn.prototype.setJitter = function(e) {
  this.jitter = e;
};
class Pr extends Xe {
  constructor(t, n) {
    var s;
    super(), this.nsps = {}, this.subs = [], t && typeof t == "object" && (n = t, t = void 0), n = n || {}, n.path = n.path || "/socket.io", this.opts = n, Ws(this, n), this.reconnection(n.reconnection !== !1), this.reconnectionAttempts(n.reconnectionAttempts || 1 / 0), this.reconnectionDelay(n.reconnectionDelay || 1e3), this.reconnectionDelayMax(n.reconnectionDelayMax || 5e3), this.randomizationFactor((s = n.randomizationFactor) !== null && s !== void 0 ? s : 0.5), this.backoff = new Pn({
      min: this.reconnectionDelay(),
      max: this.reconnectionDelayMax(),
      jitter: this.randomizationFactor()
    }), this.timeout(n.timeout == null ? 2e4 : n.timeout), this._readyState = "closed", this.uri = t;
    const r = n.parser || _h;
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
    this.engine = new ih(this.uri, this.opts);
    const n = this.engine, s = this;
    this._readyState = "opening", this.skipReconnect = !1;
    const r = Rt(n, "open", function() {
      s.onopen(), t && t();
    }), i = (l) => {
      this.cleanup(), this._readyState = "closed", this.emitReserved("error", l), t ? t(l) : this.maybeReconnectOnOpen();
    }, o = Rt(n, "error", i);
    if (this._timeout !== !1) {
      const l = this._timeout, a = this.setTimeoutFn(() => {
        r(), i(new Error("timeout")), n.close();
      }, l);
      this.opts.autoUnref && a.unref(), this.subs.push(() => {
        this.clearTimeoutFn(a);
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
      Rt(t, "ping", this.onping.bind(this)),
      Rt(t, "data", this.ondata.bind(this)),
      Rt(t, "error", this.onerror.bind(this)),
      Rt(t, "close", this.onclose.bind(this)),
      // @ts-ignore
      Rt(this.decoder, "decoded", this.ondecoded.bind(this))
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
    Vs(() => {
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
    return s ? this._autoConnect && !s.active && s.connect() : (s = new Xl(this, t, n), this.nsps[t] = s), s;
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
const qn = {};
function ks(e, t) {
  typeof e == "object" && (t = e, e = void 0), t = t || {};
  const n = oh(e, t.path || "/socket.io"), s = n.source, r = n.id, i = n.path, o = qn[r] && i in qn[r].nsps, l = t.forceNew || t["force new connection"] || t.multiplex === !1 || o;
  let a;
  return l ? a = new Pr(s, t) : (qn[r] || (qn[r] = new Pr(s, t)), a = qn[r]), n.query && !t.query && (t.query = n.queryKey), a.socket(n.path, t);
}
Object.assign(ks, {
  Manager: Pr,
  Socket: Xl,
  io: ks,
  connect: ks
});
function vh() {
  const e = ae([]), t = ae(!1), n = ae(""), s = ae(!1), r = ae(!1), i = ae(!1), o = ae("connecting"), l = ae(0), a = 5, c = ae({}), u = ae(null), b = ae("");
  let y = null, P = null, B = null, U = null;
  const Ee = (M) => {
    const he = localStorage.getItem("ctid");
    return y = ks(`${yn.WS_URL}/widget`, {
      transports: ["websocket"],
      reconnection: !0,
      reconnectionAttempts: a,
      reconnectionDelay: 1e3,
      auth: he ? {
        conversation_token: he
      } : void 0
    }), y.on("connect", () => {
      o.value = "connected", l.value = 0;
    }), y.on("disconnect", () => {
      o.value === "connected" && (console.log("Socket disconnected, setting connection status to connecting"), o.value = "connecting");
    }), y.on("connect_error", () => {
      l.value++, console.error("Socket connection failed, attempt:", l.value, "connection status:", o.value), l.value >= a && (o.value = "failed");
    }), y.on("chat_response", (D) => {
      if (t.value = !1, D.session_id ? (console.log("Captured session_id from chat_response:", D.session_id), b.value = D.session_id) : console.warn("No session_id in chat_response data:", D), D.type === "agent_message") {
        const Pe = {
          message: D.message,
          message_type: "agent",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          session_id: "",
          agent_name: D.agent_name,
          attributes: {
            end_chat: D.end_chat,
            end_chat_reason: D.end_chat_reason,
            end_chat_description: D.end_chat_description,
            request_rating: D.request_rating
          }
        };
        D.attachments && Array.isArray(D.attachments) && (Pe.id = D.message_id, Pe.attachments = D.attachments.map((He, lt) => ({
          id: D.message_id * 1e3 + lt,
          filename: He.filename,
          file_url: He.file_url,
          content_type: He.content_type,
          file_size: He.file_size
        }))), e.value.push(Pe);
      } else D.shopify_output && typeof D.shopify_output == "object" && D.shopify_output.products ? e.value.push({
        message: D.message,
        // Keep the accompanying text message
        message_type: "product",
        // Use 'product' type for rendering
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: "",
        agent_name: D.agent_name,
        // Assign the whole structured object
        shopify_output: D.shopify_output,
        // Remove the old flattened fields (product_id, product_title, etc.)
        attributes: {
          // Keep other attributes if needed
          end_chat: D.end_chat,
          request_rating: D.request_rating
        }
      }) : e.value.push({
        message: D.message,
        message_type: "bot",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: "",
        agent_name: D.agent_name,
        attributes: {
          end_chat: D.end_chat,
          end_chat_reason: D.end_chat_reason,
          end_chat_description: D.end_chat_description,
          request_rating: D.request_rating
        }
      });
    }), y.on("handle_taken_over", (D) => {
      e.value.push({
        message: `${D.user_name} joined the conversation`,
        message_type: "system",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: D.session_id
      }), c.value = {
        ...c.value,
        human_agent_name: D.user_name,
        human_agent_profile_pic: D.profile_picture
      }, P && P(D);
    }), y.on("error", Y), y.on("chat_history", K), y.on("rating_submitted", we), y.on("display_form", qe), y.on("form_submitted", Oe), y.on("workflow_state", je), y.on("workflow_proceeded", fe), y;
  }, oe = async () => {
    try {
      return o.value = "connecting", l.value = 0, y && (y.removeAllListeners(), y.disconnect(), y = null), y = Ee(""), new Promise((M) => {
        y == null || y.on("connect", () => {
          M(!0);
        }), y == null || y.on("connect_error", () => {
          l.value >= a && M(!1);
        });
      });
    } catch (M) {
      return console.error("Socket initialization failed:", M), o.value = "failed", !1;
    }
  }, _e = () => (y && y.disconnect(), oe()), ye = (M) => {
    P = M;
  }, H = (M) => {
    B = M;
  }, N = (M) => {
    U = M;
  }, Y = (M) => {
    t.value = !1, n.value = qu(M), s.value = !0, setTimeout(() => {
      s.value = !1, n.value = "";
    }, 5e3);
  }, K = (M) => {
    if (M.type === "chat_history" && Array.isArray(M.messages)) {
      const he = M.messages.map((D) => {
        var He;
        const Pe = {
          message: D.message,
          message_type: D.message_type,
          created_at: D.created_at,
          session_id: "",
          agent_name: D.agent_name || "",
          user_name: D.user_name || "",
          attributes: D.attributes || {},
          attachments: D.attachments || []
          // Include attachments
        };
        return (He = D.attributes) != null && He.shopify_output && typeof D.attributes.shopify_output == "object" ? {
          ...Pe,
          message_type: "product",
          shopify_output: D.attributes.shopify_output
        } : Pe;
      });
      e.value = [
        ...he.filter(
          (D) => !e.value.some(
            (Pe) => Pe.message === D.message && Pe.created_at === D.created_at
          )
        ),
        ...e.value
      ];
    }
  }, we = (M) => {
    M.success && e.value.push({
      message: "Thank you for your feedback!",
      message_type: "system",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: ""
    });
  }, qe = (M) => {
    var he;
    console.log("Form display handler in composable:", M), t.value = !1, u.value = M.form_data, console.log("Set currentForm in handleDisplayForm:", u.value), ((he = M.form_data) == null ? void 0 : he.form_full_screen) === !0 ? (console.log("Full screen form detected, triggering workflow state callback"), B && B({
      type: "form",
      form_data: M.form_data,
      session_id: M.session_id
    })) : e.value.push({
      message: "",
      message_type: "form",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: M.session_id,
      attributes: {
        form_data: M.form_data
      }
    });
  }, Oe = (M) => {
    console.log("Form submitted confirmation received, clearing currentForm"), u.value = null, M.success && console.log("Form submitted successfully");
  }, je = (M) => {
    console.log("Workflow state received in composable:", M), (M.type === "form" || M.type === "display_form") && (console.log("Setting currentForm from workflow state:", M.form_data), u.value = M.form_data), B && B(M);
  }, fe = (M) => {
    console.log("Workflow proceeded in composable:", M), U && U(M);
  };
  return {
    messages: e,
    loading: t,
    errorMessage: n,
    showError: s,
    loadingHistory: r,
    hasStartedChat: i,
    connectionStatus: o,
    sendMessage: async (M, he, D = []) => {
      if (!y || !M.trim() && D.length === 0) return;
      c.value.human_agent_name || (t.value = !0);
      const Pe = {
        message: M,
        message_type: "user",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: ""
      };
      D.length > 0 && (Pe.attachments = D.map((He, lt) => {
        let _t = "";
        if (He.content_type.startsWith("image/")) {
          const at = atob(He.content), pt = new Array(at.length);
          for (let yt = 0; yt < at.length; yt++)
            pt[yt] = at.charCodeAt(yt);
          const nt = new Uint8Array(pt), Ke = new Blob([nt], { type: He.content_type });
          _t = URL.createObjectURL(Ke);
        }
        return {
          id: Date.now() * 1e3 + lt,
          // Temporary ID
          filename: He.filename,
          file_url: _t,
          // Temporary blob URL, will be replaced
          content_type: He.content_type,
          file_size: He.size,
          _isTemporary: !0
          // Flag to identify temporary attachments
        };
      })), e.value.push(Pe), y.emit("chat", {
        message: M,
        email: he,
        files: D
        // Send files with base64 content
      }), i.value = !0;
    },
    loadChatHistory: async () => {
      if (y)
        try {
          r.value = !0, y.emit("get_chat_history");
        } catch (M) {
          console.error("Failed to load chat history:", M);
        } finally {
          r.value = !1;
        }
    },
    connect: oe,
    reconnect: _e,
    cleanup: () => {
      y && (y.removeAllListeners(), y.disconnect(), y = null), P = null, B = null, U = null;
    },
    humanAgent: c,
    onTakeover: ye,
    submitRating: async (M, he) => {
      !y || !M || y.emit("submit_rating", {
        rating: M,
        feedback: he
      });
    },
    currentForm: u,
    submitForm: async (M) => {
      if (console.log("Submitting form in socket:", M), console.log("Current form in socket:", u.value), console.log("Socket in socket:", y), !y) {
        console.error("No socket available for form submission");
        return;
      }
      if (!M || Object.keys(M).length === 0) {
        console.error("No form data to submit");
        return;
      }
      console.log("Emitting submit_form event with data:", M), y.emit("submit_form", {
        form_data: M
      }), u.value = null;
    },
    getWorkflowState: async () => {
      y && (console.log("Getting workflow state 12"), y.emit("get_workflow_state"));
    },
    proceedWorkflow: async () => {
      y && y.emit("proceed_workflow", {});
    },
    onWorkflowState: H,
    onWorkflowProceeded: N,
    currentSessionId: b
  };
}
function bh(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var ur = { exports: {} }, ko;
function wh() {
  return ko || (ko = 1, function(e) {
    (function() {
      function t(f, m, S) {
        return f.call.apply(f.bind, arguments);
      }
      function n(f, m, S) {
        if (!f) throw Error();
        if (2 < arguments.length) {
          var w = Array.prototype.slice.call(arguments, 2);
          return function() {
            var O = Array.prototype.slice.call(arguments);
            return Array.prototype.unshift.apply(O, w), f.apply(m, O);
          };
        }
        return function() {
          return f.apply(m, arguments);
        };
      }
      function s(f, m, S) {
        return s = Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1 ? t : n, s.apply(null, arguments);
      }
      var r = Date.now || function() {
        return +/* @__PURE__ */ new Date();
      };
      function i(f, m) {
        this.a = f, this.o = m || f, this.c = this.o.document;
      }
      var o = !!window.FontFace;
      function l(f, m, S, w) {
        if (m = f.c.createElement(m), S) for (var O in S) S.hasOwnProperty(O) && (O == "style" ? m.style.cssText = S[O] : m.setAttribute(O, S[O]));
        return w && m.appendChild(f.c.createTextNode(w)), m;
      }
      function a(f, m, S) {
        f = f.c.getElementsByTagName(m)[0], f || (f = document.documentElement), f.insertBefore(S, f.lastChild);
      }
      function c(f) {
        f.parentNode && f.parentNode.removeChild(f);
      }
      function u(f, m, S) {
        m = m || [], S = S || [];
        for (var w = f.className.split(/\s+/), O = 0; O < m.length; O += 1) {
          for (var j = !1, G = 0; G < w.length; G += 1) if (m[O] === w[G]) {
            j = !0;
            break;
          }
          j || w.push(m[O]);
        }
        for (m = [], O = 0; O < w.length; O += 1) {
          for (j = !1, G = 0; G < S.length; G += 1) if (w[O] === S[G]) {
            j = !0;
            break;
          }
          j || m.push(w[O]);
        }
        f.className = m.join(" ").replace(/\s+/g, " ").replace(/^\s+|\s+$/, "");
      }
      function b(f, m) {
        for (var S = f.className.split(/\s+/), w = 0, O = S.length; w < O; w++) if (S[w] == m) return !0;
        return !1;
      }
      function y(f) {
        return f.o.location.hostname || f.a.location.hostname;
      }
      function P(f, m, S) {
        function w() {
          ue && O && j && (ue(G), ue = null);
        }
        m = l(f, "link", { rel: "stylesheet", href: m, media: "all" });
        var O = !1, j = !0, G = null, ue = S || null;
        o ? (m.onload = function() {
          O = !0, w();
        }, m.onerror = function() {
          O = !0, G = Error("Stylesheet failed to load"), w();
        }) : setTimeout(function() {
          O = !0, w();
        }, 0), a(f, "head", m);
      }
      function B(f, m, S, w) {
        var O = f.c.getElementsByTagName("head")[0];
        if (O) {
          var j = l(f, "script", { src: m }), G = !1;
          return j.onload = j.onreadystatechange = function() {
            G || this.readyState && this.readyState != "loaded" && this.readyState != "complete" || (G = !0, S && S(null), j.onload = j.onreadystatechange = null, j.parentNode.tagName == "HEAD" && O.removeChild(j));
          }, O.appendChild(j), setTimeout(function() {
            G || (G = !0, S && S(Error("Script load timeout")));
          }, w || 5e3), j;
        }
        return null;
      }
      function U() {
        this.a = 0, this.c = null;
      }
      function Ee(f) {
        return f.a++, function() {
          f.a--, _e(f);
        };
      }
      function oe(f, m) {
        f.c = m, _e(f);
      }
      function _e(f) {
        f.a == 0 && f.c && (f.c(), f.c = null);
      }
      function ye(f) {
        this.a = f || "-";
      }
      ye.prototype.c = function(f) {
        for (var m = [], S = 0; S < arguments.length; S++) m.push(arguments[S].replace(/[\W_]+/g, "").toLowerCase());
        return m.join(this.a);
      };
      function H(f, m) {
        this.c = f, this.f = 4, this.a = "n";
        var S = (m || "n4").match(/^([nio])([1-9])$/i);
        S && (this.a = S[1], this.f = parseInt(S[2], 10));
      }
      function N(f) {
        return we(f) + " " + (f.f + "00") + " 300px " + Y(f.c);
      }
      function Y(f) {
        var m = [];
        f = f.split(/,\s*/);
        for (var S = 0; S < f.length; S++) {
          var w = f[S].replace(/['"]/g, "");
          w.indexOf(" ") != -1 || /^\d/.test(w) ? m.push("'" + w + "'") : m.push(w);
        }
        return m.join(",");
      }
      function K(f) {
        return f.a + f.f;
      }
      function we(f) {
        var m = "normal";
        return f.a === "o" ? m = "oblique" : f.a === "i" && (m = "italic"), m;
      }
      function qe(f) {
        var m = 4, S = "n", w = null;
        return f && ((w = f.match(/(normal|oblique|italic)/i)) && w[1] && (S = w[1].substr(0, 1).toLowerCase()), (w = f.match(/([1-9]00|normal|bold)/i)) && w[1] && (/bold/i.test(w[1]) ? m = 7 : /[1-9]00/.test(w[1]) && (m = parseInt(w[1].substr(0, 1), 10)))), S + m;
      }
      function Oe(f, m) {
        this.c = f, this.f = f.o.document.documentElement, this.h = m, this.a = new ye("-"), this.j = m.events !== !1, this.g = m.classes !== !1;
      }
      function je(f) {
        f.g && u(f.f, [f.a.c("wf", "loading")]), Ue(f, "loading");
      }
      function fe(f) {
        if (f.g) {
          var m = b(f.f, f.a.c("wf", "active")), S = [], w = [f.a.c("wf", "loading")];
          m || S.push(f.a.c("wf", "inactive")), u(f.f, S, w);
        }
        Ue(f, "inactive");
      }
      function Ue(f, m, S) {
        f.j && f.h[m] && (S ? f.h[m](S.c, K(S)) : f.h[m]());
      }
      function Ve() {
        this.c = {};
      }
      function Te(f, m, S) {
        var w = [], O;
        for (O in m) if (m.hasOwnProperty(O)) {
          var j = f.c[O];
          j && w.push(j(m[O], S));
        }
        return w;
      }
      function ee(f, m) {
        this.c = f, this.f = m, this.a = l(this.c, "span", { "aria-hidden": "true" }, this.f);
      }
      function X(f) {
        a(f.c, "body", f.a);
      }
      function J(f) {
        return "display:block;position:absolute;top:-9999px;left:-9999px;font-size:300px;width:auto;height:auto;line-height:normal;margin:0;padding:0;font-variant:normal;white-space:nowrap;font-family:" + Y(f.c) + ";" + ("font-style:" + we(f) + ";font-weight:" + (f.f + "00") + ";");
      }
      function ze(f, m, S, w, O, j) {
        this.g = f, this.j = m, this.a = w, this.c = S, this.f = O || 3e3, this.h = j || void 0;
      }
      ze.prototype.start = function() {
        var f = this.c.o.document, m = this, S = r(), w = new Promise(function(G, ue) {
          function be() {
            r() - S >= m.f ? ue() : f.fonts.load(N(m.a), m.h).then(function(Re) {
              1 <= Re.length ? G() : setTimeout(be, 25);
            }, function() {
              ue();
            });
          }
          be();
        }), O = null, j = new Promise(function(G, ue) {
          O = setTimeout(ue, m.f);
        });
        Promise.race([j, w]).then(function() {
          O && (clearTimeout(O), O = null), m.g(m.a);
        }, function() {
          m.j(m.a);
        });
      };
      function M(f, m, S, w, O, j, G) {
        this.v = f, this.B = m, this.c = S, this.a = w, this.s = G || "BESbswy", this.f = {}, this.w = O || 3e3, this.u = j || null, this.m = this.j = this.h = this.g = null, this.g = new ee(this.c, this.s), this.h = new ee(this.c, this.s), this.j = new ee(this.c, this.s), this.m = new ee(this.c, this.s), f = new H(this.a.c + ",serif", K(this.a)), f = J(f), this.g.a.style.cssText = f, f = new H(this.a.c + ",sans-serif", K(this.a)), f = J(f), this.h.a.style.cssText = f, f = new H("serif", K(this.a)), f = J(f), this.j.a.style.cssText = f, f = new H("sans-serif", K(this.a)), f = J(f), this.m.a.style.cssText = f, X(this.g), X(this.h), X(this.j), X(this.m);
      }
      var he = { D: "serif", C: "sans-serif" }, D = null;
      function Pe() {
        if (D === null) {
          var f = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent);
          D = !!f && (536 > parseInt(f[1], 10) || parseInt(f[1], 10) === 536 && 11 >= parseInt(f[2], 10));
        }
        return D;
      }
      M.prototype.start = function() {
        this.f.serif = this.j.a.offsetWidth, this.f["sans-serif"] = this.m.a.offsetWidth, this.A = r(), lt(this);
      };
      function He(f, m, S) {
        for (var w in he) if (he.hasOwnProperty(w) && m === f.f[he[w]] && S === f.f[he[w]]) return !0;
        return !1;
      }
      function lt(f) {
        var m = f.g.a.offsetWidth, S = f.h.a.offsetWidth, w;
        (w = m === f.f.serif && S === f.f["sans-serif"]) || (w = Pe() && He(f, m, S)), w ? r() - f.A >= f.w ? Pe() && He(f, m, S) && (f.u === null || f.u.hasOwnProperty(f.a.c)) ? at(f, f.v) : at(f, f.B) : _t(f) : at(f, f.v);
      }
      function _t(f) {
        setTimeout(s(function() {
          lt(this);
        }, f), 50);
      }
      function at(f, m) {
        setTimeout(s(function() {
          c(this.g.a), c(this.h.a), c(this.j.a), c(this.m.a), m(this.a);
        }, f), 0);
      }
      function pt(f, m, S) {
        this.c = f, this.a = m, this.f = 0, this.m = this.j = !1, this.s = S;
      }
      var nt = null;
      pt.prototype.g = function(f) {
        var m = this.a;
        m.g && u(m.f, [m.a.c("wf", f.c, K(f).toString(), "active")], [m.a.c("wf", f.c, K(f).toString(), "loading"), m.a.c("wf", f.c, K(f).toString(), "inactive")]), Ue(m, "fontactive", f), this.m = !0, Ke(this);
      }, pt.prototype.h = function(f) {
        var m = this.a;
        if (m.g) {
          var S = b(m.f, m.a.c("wf", f.c, K(f).toString(), "active")), w = [], O = [m.a.c("wf", f.c, K(f).toString(), "loading")];
          S || w.push(m.a.c("wf", f.c, K(f).toString(), "inactive")), u(m.f, w, O);
        }
        Ue(m, "fontinactive", f), Ke(this);
      };
      function Ke(f) {
        --f.f == 0 && f.j && (f.m ? (f = f.a, f.g && u(f.f, [f.a.c("wf", "active")], [f.a.c("wf", "loading"), f.a.c("wf", "inactive")]), Ue(f, "active")) : fe(f.a));
      }
      function yt(f) {
        this.j = f, this.a = new Ve(), this.h = 0, this.f = this.g = !0;
      }
      yt.prototype.load = function(f) {
        this.c = new i(this.j, f.context || this.j), this.g = f.events !== !1, this.f = f.classes !== !1, p(this, new Oe(this.c, f), f);
      };
      function d(f, m, S, w, O) {
        var j = --f.h == 0;
        (f.f || f.g) && setTimeout(function() {
          var G = O || null, ue = w || null || {};
          if (S.length === 0 && j) fe(m.a);
          else {
            m.f += S.length, j && (m.j = j);
            var be, Re = [];
            for (be = 0; be < S.length; be++) {
              var Be = S[be], Ge = ue[Be.c], vt = m.a, Lt = Be;
              if (vt.g && u(vt.f, [vt.a.c("wf", Lt.c, K(Lt).toString(), "loading")]), Ue(vt, "fontloading", Lt), vt = null, nt === null) if (window.FontFace) {
                var Lt = /Gecko.*Firefox\/(\d+)/.exec(window.navigator.userAgent), js = /OS X.*Version\/10\..*Safari/.exec(window.navigator.userAgent) && /Apple/.exec(window.navigator.vendor);
                nt = Lt ? 42 < parseInt(Lt[1], 10) : !js;
              } else nt = !1;
              nt ? vt = new ze(s(m.g, m), s(m.h, m), m.c, Be, m.s, Ge) : vt = new M(s(m.g, m), s(m.h, m), m.c, Be, m.s, G, Ge), Re.push(vt);
            }
            for (be = 0; be < Re.length; be++) Re[be].start();
          }
        }, 0);
      }
      function p(f, m, S) {
        var O = [], w = S.timeout;
        je(m);
        var O = Te(f.a, S, f.c), j = new pt(f.c, m, w);
        for (f.h = O.length, m = 0, S = O.length; m < S; m++) O[m].load(function(G, ue, be) {
          d(f, j, G, ue, be);
        });
      }
      function k(f, m) {
        this.c = f, this.a = m;
      }
      k.prototype.load = function(f) {
        function m() {
          if (j["__mti_fntLst" + w]) {
            var G = j["__mti_fntLst" + w](), ue = [], be;
            if (G) for (var Re = 0; Re < G.length; Re++) {
              var Be = G[Re].fontfamily;
              G[Re].fontStyle != null && G[Re].fontWeight != null ? (be = G[Re].fontStyle + G[Re].fontWeight, ue.push(new H(Be, be))) : ue.push(new H(Be));
            }
            f(ue);
          } else setTimeout(function() {
            m();
          }, 50);
        }
        var S = this, w = S.a.projectId, O = S.a.version;
        if (w) {
          var j = S.c.o;
          B(this.c, (S.a.api || "https://fast.fonts.net/jsapi") + "/" + w + ".js" + (O ? "?v=" + O : ""), function(G) {
            G ? f([]) : (j["__MonotypeConfiguration__" + w] = function() {
              return S.a;
            }, m());
          }).id = "__MonotypeAPIScript__" + w;
        } else f([]);
      };
      function R(f, m) {
        this.c = f, this.a = m;
      }
      R.prototype.load = function(f) {
        var m, S, w = this.a.urls || [], O = this.a.families || [], j = this.a.testStrings || {}, G = new U();
        for (m = 0, S = w.length; m < S; m++) P(this.c, w[m], Ee(G));
        var ue = [];
        for (m = 0, S = O.length; m < S; m++) if (w = O[m].split(":"), w[1]) for (var be = w[1].split(","), Re = 0; Re < be.length; Re += 1) ue.push(new H(w[0], be[Re]));
        else ue.push(new H(w[0]));
        oe(G, function() {
          f(ue, j);
        });
      };
      function T(f, m) {
        f ? this.c = f : this.c = A, this.a = [], this.f = [], this.g = m || "";
      }
      var A = "https://fonts.googleapis.com/css";
      function q(f, m) {
        for (var S = m.length, w = 0; w < S; w++) {
          var O = m[w].split(":");
          O.length == 3 && f.f.push(O.pop());
          var j = "";
          O.length == 2 && O[1] != "" && (j = ":"), f.a.push(O.join(j));
        }
      }
      function $(f) {
        if (f.a.length == 0) throw Error("No fonts to load!");
        if (f.c.indexOf("kit=") != -1) return f.c;
        for (var m = f.a.length, S = [], w = 0; w < m; w++) S.push(f.a[w].replace(/ /g, "+"));
        return m = f.c + "?family=" + S.join("%7C"), 0 < f.f.length && (m += "&subset=" + f.f.join(",")), 0 < f.g.length && (m += "&text=" + encodeURIComponent(f.g)), m;
      }
      function F(f) {
        this.f = f, this.a = [], this.c = {};
      }
      var L = { latin: "BESbswy", "latin-ext": "çöüğş", cyrillic: "йяЖ", greek: "αβΣ", khmer: "កខគ", Hanuman: "កខគ" }, V = { thin: "1", extralight: "2", "extra-light": "2", ultralight: "2", "ultra-light": "2", light: "3", regular: "4", book: "4", medium: "5", "semi-bold": "6", semibold: "6", "demi-bold": "6", demibold: "6", bold: "7", "extra-bold": "8", extrabold: "8", "ultra-bold": "8", ultrabold: "8", black: "9", heavy: "9", l: "3", r: "4", b: "7" }, z = { i: "i", italic: "i", n: "n", normal: "n" }, W = /^(thin|(?:(?:extra|ultra)-?)?light|regular|book|medium|(?:(?:semi|demi|extra|ultra)-?)?bold|black|heavy|l|r|b|[1-9]00)?(n|i|normal|italic)?$/;
      function Q(f) {
        for (var m = f.f.length, S = 0; S < m; S++) {
          var w = f.f[S].split(":"), O = w[0].replace(/\+/g, " "), j = ["n4"];
          if (2 <= w.length) {
            var G, ue = w[1];
            if (G = [], ue) for (var ue = ue.split(","), be = ue.length, Re = 0; Re < be; Re++) {
              var Be;
              if (Be = ue[Re], Be.match(/^[\w-]+$/)) {
                var Ge = W.exec(Be.toLowerCase());
                if (Ge == null) Be = "";
                else {
                  if (Be = Ge[2], Be = Be == null || Be == "" ? "n" : z[Be], Ge = Ge[1], Ge == null || Ge == "") Ge = "4";
                  else var vt = V[Ge], Ge = vt || (isNaN(Ge) ? "4" : Ge.substr(0, 1));
                  Be = [Be, Ge].join("");
                }
              } else Be = "";
              Be && G.push(Be);
            }
            0 < G.length && (j = G), w.length == 3 && (w = w[2], G = [], w = w ? w.split(",") : G, 0 < w.length && (w = L[w[0]]) && (f.c[O] = w));
          }
          for (f.c[O] || (w = L[O]) && (f.c[O] = w), w = 0; w < j.length; w += 1) f.a.push(new H(O, j[w]));
        }
      }
      function ce(f, m) {
        this.c = f, this.a = m;
      }
      var ve = { Arimo: !0, Cousine: !0, Tinos: !0 };
      ce.prototype.load = function(f) {
        var m = new U(), S = this.c, w = new T(this.a.api, this.a.text), O = this.a.families;
        q(w, O);
        var j = new F(O);
        Q(j), P(S, $(w), Ee(m)), oe(m, function() {
          f(j.a, j.c, ve);
        });
      };
      function de(f, m) {
        this.c = f, this.a = m;
      }
      de.prototype.load = function(f) {
        var m = this.a.id, S = this.c.o;
        m ? B(this.c, (this.a.api || "https://use.typekit.net") + "/" + m + ".js", function(w) {
          if (w) f([]);
          else if (S.Typekit && S.Typekit.config && S.Typekit.config.fn) {
            w = S.Typekit.config.fn;
            for (var O = [], j = 0; j < w.length; j += 2) for (var G = w[j], ue = w[j + 1], be = 0; be < ue.length; be++) O.push(new H(G, ue[be]));
            try {
              S.Typekit.load({ events: !1, classes: !1, async: !0 });
            } catch {
            }
            f(O);
          }
        }, 2e3) : f([]);
      };
      function Ze(f, m) {
        this.c = f, this.f = m, this.a = [];
      }
      Ze.prototype.load = function(f) {
        var m = this.f.id, S = this.c.o, w = this;
        m ? (S.__webfontfontdeckmodule__ || (S.__webfontfontdeckmodule__ = {}), S.__webfontfontdeckmodule__[m] = function(O, j) {
          for (var G = 0, ue = j.fonts.length; G < ue; ++G) {
            var be = j.fonts[G];
            w.a.push(new H(be.name, qe("font-weight:" + be.weight + ";font-style:" + be.style)));
          }
          f(w.a);
        }, B(this.c, (this.f.api || "https://f.fontdeck.com/s/css/js/") + y(this.c) + "/" + m + ".js", function(O) {
          O && f([]);
        })) : f([]);
      };
      var $e = new yt(window);
      $e.a.c.custom = function(f, m) {
        return new R(m, f);
      }, $e.a.c.fontdeck = function(f, m) {
        return new Ze(m, f);
      }, $e.a.c.monotype = function(f, m) {
        return new k(m, f);
      }, $e.a.c.typekit = function(f, m) {
        return new de(m, f);
      }, $e.a.c.google = function(f, m) {
        return new ce(m, f);
      };
      var st = { load: s($e.load, $e) };
      e.exports ? e.exports = st : (window.WebFont = st, window.WebFontConfig && $e.load(window.WebFontConfig));
    })();
  }(ur)), ur.exports;
}
var kh = wh();
const xh = /* @__PURE__ */ bh(kh);
function Sh() {
  const e = ae({}), t = ae(""), n = (r) => {
    e.value = r, r.photo_url && (e.value.photo_url = r.photo_url), r.font_family && xh.load({
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
        chat_bubble_color: r.chat_bubble_color || "#f34611",
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
const Ch = {
  key: 0,
  class: "initializing-overlay"
}, Th = {
  key: 0,
  class: "connecting-message"
}, Ah = {
  key: 1,
  class: "failed-message"
}, Eh = { class: "welcome-content" }, Rh = { class: "welcome-header" }, Ih = ["src", "alt"], Lh = { class: "welcome-title" }, Oh = { class: "welcome-subtitle" }, Ph = { class: "welcome-input-container" }, $h = {
  key: 0,
  class: "email-input"
}, Fh = ["disabled"], Bh = { class: "welcome-message-input" }, Nh = ["placeholder", "disabled"], Mh = ["disabled"], Dh = { class: "landing-page-content" }, qh = { class: "landing-page-header" }, Uh = { class: "landing-page-heading" }, zh = { class: "landing-page-text" }, Hh = { class: "landing-page-actions" }, Vh = { class: "form-fullscreen-content" }, Wh = {
  key: 0,
  class: "form-header"
}, jh = {
  key: 0,
  class: "form-title"
}, Kh = {
  key: 1,
  class: "form-description"
}, Zh = { class: "form-fields" }, Gh = ["for"], Xh = {
  key: 0,
  class: "required-indicator"
}, Yh = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "autocomplete", "inputmode"], Jh = ["id", "placeholder", "required", "min", "max", "value", "onInput"], Qh = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput"], ed = ["id", "required", "value", "onChange"], td = { value: "" }, nd = ["value"], sd = {
  key: 4,
  class: "checkbox-field"
}, rd = ["id", "required", "checked", "onChange"], id = { class: "checkbox-label" }, od = {
  key: 5,
  class: "radio-group"
}, ld = ["name", "value", "required", "checked", "onChange"], ad = { class: "radio-label" }, cd = {
  key: 6,
  class: "field-error"
}, ud = { class: "form-actions" }, fd = ["disabled"], hd = {
  key: 0,
  class: "loading-spinner-inline"
}, dd = { key: 1 }, pd = { class: "header-content" }, gd = ["src", "alt"], md = { class: "header-info" }, _d = { class: "status" }, yd = { class: "ask-anything-header" }, vd = ["src", "alt"], bd = { class: "header-info" }, wd = {
  key: 2,
  class: "loading-history"
}, kd = {
  key: 0,
  class: "rating-content"
}, xd = { class: "rating-prompt" }, Sd = ["onMouseover", "onMouseleave", "onClick", "disabled"], Cd = {
  key: 0,
  class: "feedback-wrapper"
}, Td = { class: "feedback-section" }, Ad = ["onUpdate:modelValue", "disabled"], Ed = { class: "feedback-counter" }, Rd = ["onClick", "disabled"], Id = {
  key: 1,
  class: "submitted-feedback-wrapper"
}, Ld = { class: "submitted-feedback" }, Od = { class: "submitted-feedback-text" }, Pd = {
  key: 2,
  class: "submitted-message"
}, $d = {
  key: 1,
  class: "form-content"
}, Fd = {
  key: 0,
  class: "form-header"
}, Bd = {
  key: 0,
  class: "form-title"
}, Nd = {
  key: 1,
  class: "form-description"
}, Md = { class: "form-fields" }, Dd = ["for"], qd = {
  key: 0,
  class: "required-indicator"
}, Ud = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "disabled", "autocomplete", "inputmode"], zd = ["id", "placeholder", "required", "min", "max", "value", "onInput", "disabled"], Hd = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "disabled"], Vd = ["id", "required", "value", "onChange", "disabled"], Wd = { value: "" }, jd = ["value"], Kd = {
  key: 4,
  class: "checkbox-field"
}, Zd = ["id", "checked", "onChange", "disabled"], Gd = ["for"], Xd = {
  key: 5,
  class: "radio-field"
}, Yd = ["id", "name", "value", "checked", "onChange", "disabled"], Jd = ["for"], Qd = {
  key: 6,
  class: "field-error"
}, ep = { class: "form-actions" }, tp = ["onClick", "disabled"], np = {
  key: 2,
  class: "user-input-content"
}, sp = {
  key: 0,
  class: "user-input-prompt"
}, rp = {
  key: 1,
  class: "user-input-form"
}, ip = ["onUpdate:modelValue", "onKeydown"], op = ["onClick", "disabled"], lp = {
  key: 2,
  class: "user-input-submitted"
}, ap = {
  key: 0,
  class: "user-input-confirmation"
}, cp = {
  key: 3,
  class: "product-message-container"
}, up = ["innerHTML"], fp = {
  key: 1,
  class: "products-carousel"
}, hp = { class: "carousel-items" }, dp = {
  key: 0,
  class: "product-image-compact"
}, pp = ["src", "alt"], gp = { class: "product-info-compact" }, mp = { class: "product-text-area" }, _p = { class: "product-title-compact" }, yp = {
  key: 0,
  class: "product-variant-compact"
}, vp = { class: "product-price-compact" }, bp = { class: "product-actions-compact" }, wp = ["onClick"], kp = {
  key: 2,
  class: "no-products-message"
}, xp = {
  key: 3,
  class: "no-products-message"
}, Sp = ["innerHTML"], Cp = {
  key: 0,
  class: "message-attachments"
}, Tp = {
  key: 0,
  class: "attachment-image-container"
}, Ap = ["src", "alt", "onClick"], Ep = { class: "attachment-image-info" }, Rp = ["href"], Ip = { class: "attachment-size" }, Lp = ["href"], Op = { class: "attachment-size" }, Pp = { class: "message-info" }, $p = {
  key: 0,
  class: "agent-name"
}, Fp = {
  key: 0,
  class: "typing-indicator"
}, Bp = {
  key: 0,
  class: "email-input"
}, Np = ["disabled"], Mp = {
  key: 1,
  class: "file-previews-widget"
}, Dp = {
  class: "file-preview-content-widget",
  style: { cursor: "pointer" }
}, qp = ["src", "alt", "onClick"], Up = ["onClick"], zp = { class: "file-preview-info-widget" }, Hp = { class: "file-preview-name-widget" }, Vp = { class: "file-preview-size-widget" }, Wp = ["onClick"], jp = {
  key: 2,
  class: "upload-progress-widget"
}, Kp = { class: "message-input" }, Zp = ["placeholder", "disabled"], Gp = ["disabled", "title"], Xp = ["disabled"], Yp = { class: "conversation-ended-message" }, Jp = {
  key: 7,
  class: "rating-dialog"
}, Qp = { class: "rating-content" }, eg = { class: "star-rating" }, tg = ["onClick"], ng = { class: "rating-actions" }, sg = ["disabled"], rg = {
  key: 0,
  class: "preview-modal-image-container"
}, ig = ["src", "alt"], og = { class: "preview-modal-filename" }, lg = {
  key: 1,
  class: "widget-loading"
}, fr = "ctid", xo = 3, ag = "image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls", cg = /* @__PURE__ */ lc({
  __name: "WidgetBuilder",
  props: {
    widgetId: {}
  },
  setup(e) {
    var vi;
    me.setOptions({
      renderer: new me.Renderer(),
      gfm: !0,
      breaks: !0
    });
    const t = new me.Renderer(), n = t.link;
    t.link = (g, _, h) => n.call(t, g, _, h).replace(/^<a /, '<a target="_blank" rel="nofollow" '), me.use({ renderer: t });
    const s = e, r = We(() => {
      var g;
      return s.widgetId || ((g = window.__INITIAL_DATA__) == null ? void 0 : g.widgetId);
    }), {
      customization: i,
      agentName: o,
      applyCustomization: l,
      initializeFromData: a
    } = Sh(), {
      messages: c,
      loading: u,
      errorMessage: b,
      showError: y,
      loadingHistory: P,
      hasStartedChat: B,
      connectionStatus: U,
      sendMessage: Ee,
      loadChatHistory: oe,
      connect: _e,
      reconnect: ye,
      cleanup: H,
      humanAgent: N,
      onTakeover: Y,
      submitRating: K,
      submitForm: we,
      currentForm: qe,
      getWorkflowState: Oe,
      proceedWorkflow: je,
      onWorkflowState: fe,
      onWorkflowProceeded: Ue,
      currentSessionId: Ve
    } = vh(), Te = ae(""), ee = ae(!0), X = ae(""), J = ae(!1), ze = (g) => {
      const _ = g.target;
      Te.value = _.value;
    };
    let M = null;
    const he = () => {
      M && M.disconnect(), M = new MutationObserver((_) => {
        let h = !1, Z = !1;
        _.forEach((le) => {
          if (le.type === "childList") {
            const se = Array.from(le.addedNodes).some(
              (pe) => {
                var Ht;
                return pe.nodeType === Node.ELEMENT_NODE && (pe.matches("input, textarea") || ((Ht = pe.querySelector) == null ? void 0 : Ht.call(pe, "input, textarea")));
              }
            ), bt = Array.from(le.removedNodes).some(
              (pe) => {
                var Ht;
                return pe.nodeType === Node.ELEMENT_NODE && (pe.matches("input, textarea") || ((Ht = pe.querySelector) == null ? void 0 : Ht.call(pe, "input, textarea")));
              }
            );
            se && (Z = !0, h = !0), bt && (h = !0);
          }
        }), h && (clearTimeout(he.timeoutId), he.timeoutId = setTimeout(() => {
          Pe();
        }, Z ? 50 : 100));
      });
      const g = document.querySelector(".widget-container") || document.body;
      M.observe(g, {
        childList: !0,
        subtree: !0
      });
    };
    he.timeoutId = null;
    let D = [];
    const Pe = () => {
      He();
      const g = [
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
      let _ = [];
      for (const h of g) {
        const Z = document.querySelectorAll(h);
        if (Z.length > 0) {
          _ = Array.from(Z);
          break;
        }
      }
      _.length !== 0 && (D = _, _.forEach((h) => {
        h.addEventListener("input", lt, !0), h.addEventListener("keyup", lt, !0), h.addEventListener("change", lt, !0), h.addEventListener("keypress", _t, !0), h.addEventListener("keydown", at, !0);
      }));
    }, He = () => {
      D.forEach((g) => {
        g.removeEventListener("input", lt), g.removeEventListener("keyup", lt), g.removeEventListener("change", lt), g.removeEventListener("keypress", _t), g.removeEventListener("keydown", at);
      }), D = [];
    }, lt = (g) => {
      const _ = g.target;
      Te.value = _.value;
    }, _t = (g) => {
      g.key === "Enter" && !g.shiftKey && (g.preventDefault(), g.stopPropagation(), Re());
    }, at = (g) => {
      g.key === "Enter" && !g.shiftKey && (g.preventDefault(), g.stopPropagation(), Re());
    }, pt = ae(!0), nt = ae(((vi = window.__INITIAL_DATA__) == null ? void 0 : vi.initialToken) || localStorage.getItem(fr));
    We(() => !!nt.value), a();
    const Ke = window.__INITIAL_DATA__;
    Ke != null && Ke.initialToken && (nt.value = Ke.initialToken, window.parent.postMessage({
      type: "TOKEN_UPDATE",
      token: Ke.initialToken
    }, "*"), J.value = !0);
    const yt = ae(!1);
    (Ke == null ? void 0 : Ke.allowAttachments) !== void 0 && (yt.value = Ke.allowAttachments);
    const d = ae(null), {
      chatStyles: p,
      chatIconStyles: k,
      agentBubbleStyles: R,
      userBubbleStyles: T,
      messageNameStyles: A,
      headerBorderStyles: q,
      photoUrl: $,
      shadowStyle: F
    } = Sf(i), L = ae(null), {
      uploadedAttachments: V,
      previewModal: z,
      previewFile: W,
      formatFileSize: Q,
      isImageAttachment: ce,
      getDownloadUrl: ve,
      getPreviewUrl: de,
      handleFileSelect: Ze,
      handleDrop: $e,
      handleDragOver: st,
      handleDragLeave: f,
      handlePaste: m,
      removeAttachment: S,
      openPreview: w,
      closePreview: O,
      openFilePicker: j,
      isImage: G
    } = Cf(nt, L);
    We(() => c.value.some(
      (g) => g.message_type === "form" && (!g.isSubmitted || g.isSubmitted === !1)
    ));
    const ue = We(() => {
      var g;
      return B.value && J.value || St.value ? U.value === "connected" && !u.value : Nn(X.value.trim()) && U.value === "connected" && !u.value || ((g = window.__INITIAL_DATA__) == null ? void 0 : g.workflow);
    }), be = We(() => U.value === "connected" ? St.value ? "Ask me anything..." : "Type a message..." : "Connecting..."), Re = async () => {
      if (!Te.value.trim() && V.value.length === 0) return;
      !B.value && X.value && await Ge();
      const g = V.value.map((h) => ({
        content: h.content,
        // base64 content
        filename: h.filename,
        content_type: h.type,
        size: h.size
      }));
      await Ee(Te.value, X.value, g), V.value.forEach((h) => {
        h.url && h.url.startsWith("blob:") && URL.revokeObjectURL(h.url), h.file_url && h.file_url.startsWith("blob:") && URL.revokeObjectURL(h.file_url);
      }), Te.value = "", V.value = [];
      const _ = document.querySelector('input[placeholder*="Type a message"]');
      _ && (_.value = ""), setTimeout(() => {
        Pe();
      }, 500);
    }, Be = (g) => {
      g.key === "Enter" && !g.shiftKey && (g.preventDefault(), g.stopPropagation(), Re());
    }, Ge = async () => {
      var g, _, h, Z;
      try {
        if (!r.value)
          return console.error("Widget ID is not available"), !1;
        const le = new URL(`${yn.API_URL}/widgets/${r.value}`);
        X.value.trim() && Nn(X.value.trim()) && le.searchParams.append("email", X.value.trim());
        const se = {
          Accept: "application/json",
          "Content-Type": "application/json"
        };
        nt.value && (se.Authorization = `Bearer ${nt.value}`);
        const bt = await fetch(le, {
          headers: se
        });
        if (bt.status === 401)
          return J.value = !1, !1;
        const pe = await bt.json();
        return pe.token && (nt.value = pe.token, localStorage.setItem(fr, pe.token), window.parent.postMessage({ type: "TOKEN_UPDATE", token: pe.token }, "*")), J.value = !0, await _e() ? (await vt(), (g = pe.agent) != null && g.customization && l(pe.agent.customization), pe.agent && !(pe != null && pe.human_agent) && (o.value = pe.agent.name), pe != null && pe.human_agent && (N.value = pe.human_agent), ((_ = pe.agent) == null ? void 0 : _.allow_attachments) !== void 0 && (yt.value = pe.agent.allow_attachments), ((h = pe.agent) == null ? void 0 : h.workflow) !== void 0 && (window.__INITIAL_DATA__ = window.__INITIAL_DATA__ || {}, window.__INITIAL_DATA__.workflow = pe.agent.workflow), (Z = pe.agent) != null && Z.workflow && await Oe(), !0) : (console.error("Failed to connect to chat service"), !1);
      } catch (le) {
        return console.error("Error checking authorization:", le), J.value = !1, !1;
      } finally {
        pt.value = !1;
      }
    }, vt = async () => {
      !B.value && J.value && (B.value = !0, await oe());
    }, Lt = () => {
      d.value && (d.value.scrollTop = d.value.scrollHeight);
    };
    sn(() => c.value, (g) => {
      Go(() => {
        Lt();
      });
    }, { deep: !0 }), sn(U, (g, _) => {
      g === "connected" && _ !== "connected" && setTimeout(Pe, 100);
    }), sn(() => c.value.length, (g, _) => {
      g > 0 && _ === 0 && setTimeout(Pe, 100);
    }), sn(() => c.value, (g) => {
      if (g.length > 0) {
        const _ = g[g.length - 1];
        Yl(_);
      }
    }, { deep: !0 });
    const js = async () => {
      await ye() && await Ge();
    }, hi = ae(!1), is = ae(0), Ks = ae(""), Ot = ae(0), Pt = ae(!1), Je = ae({}), et = ae(!1), Qe = ae({}), wn = ae(!1), $n = ae(null), di = ae("Start Chat"), kn = ae(!1), ct = ae(null);
    We(() => {
      var _;
      const g = c.value[c.value.length - 1];
      return ((_ = g == null ? void 0 : g.attributes) == null ? void 0 : _.request_rating) || !1;
    });
    const pi = We(() => {
      var _;
      if (!((_ = window.__INITIAL_DATA__) != null && _.workflow))
        return !1;
      const g = c.value.find((h) => h.message_type === "rating");
      return (g == null ? void 0 : g.isSubmitted) === !0;
    }), os = We(() => N.value.human_agent_profile_pic ? N.value.human_agent_profile_pic.includes("amazonaws.com") ? N.value.human_agent_profile_pic : `${yn.API_URL}${N.value.human_agent_profile_pic}` : ""), Yl = (g) => {
      var _, h, Z;
      if ((_ = g.attributes) != null && _.end_chat && ((h = g.attributes) != null && h.request_rating)) {
        const le = g.agent_name || ((Z = N.value) == null ? void 0 : Z.human_agent_name) || o.value || "our agent";
        c.value.push({
          message: `Rate the chat session that you had with ${le}`,
          message_type: "rating",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          session_id: g.session_id,
          agent_name: le,
          showFeedback: !1
        }), Ve.value = g.session_id;
      }
    }, Jl = (g) => {
      Pt.value || (Ot.value = g);
    }, Ql = () => {
      if (!Pt.value) {
        const g = c.value[c.value.length - 1];
        Ot.value = (g == null ? void 0 : g.selectedRating) || 0;
      }
    }, ea = async (g) => {
      if (!Pt.value) {
        Ot.value = g;
        const _ = c.value[c.value.length - 1];
        _ && _.message_type === "rating" && (_.showFeedback = !0, _.selectedRating = g);
      }
    }, ta = async (g, _, h = null) => {
      try {
        Pt.value = !0, await K(_, h);
        const Z = c.value.find((le) => le.message_type === "rating");
        Z && (Z.isSubmitted = !0, Z.finalRating = _, Z.finalFeedback = h);
      } catch (Z) {
        console.error("Failed to submit rating:", Z);
      } finally {
        Pt.value = !1;
      }
    }, na = (g) => {
      const _ = {};
      for (const h of g.fields) {
        const Z = Je.value[h.name], le = Zs(h, Z);
        le && (_[h.name] = le);
      }
      return Qe.value = _, Object.keys(_).length === 0;
    }, sa = async (g) => {
      if (!(et.value || !na(g)))
        try {
          et.value = !0, await we(Je.value);
          const h = c.value.findIndex(
            (Z) => Z.message_type === "form" && (!Z.isSubmitted || Z.isSubmitted === !1)
          );
          h !== -1 && c.value.splice(h, 1), Je.value = {}, Qe.value = {};
        } catch (h) {
          console.error("Failed to submit form:", h);
        } finally {
          et.value = !1;
        }
    }, gt = (g, _) => {
      var h, Z;
      if (Je.value[g] = _, _ && _.toString().trim() !== "") {
        let le = null;
        if ((h = ct.value) != null && h.fields && (le = ct.value.fields.find((se) => se.name === g)), !le && ((Z = qe.value) != null && Z.fields) && (le = qe.value.fields.find((se) => se.name === g)), le) {
          const se = Zs(le, _);
          se ? (Qe.value[g] = se, console.log(`Validation error for ${g}:`, se)) : delete Qe.value[g];
        }
      } else
        delete Qe.value[g], console.log(`Cleared error for ${g}`);
    }, ra = (g) => {
      const _ = g.replace(/\D/g, "");
      return _.length >= 7 && _.length <= 15;
    }, Zs = (g, _) => {
      if (g.required && (!_ || _.toString().trim() === ""))
        return `${g.label} is required`;
      if (!_ || _.toString().trim() === "")
        return null;
      if (g.type === "email" && !Nn(_))
        return "Please enter a valid email address";
      if (g.type === "tel" && !ra(_))
        return "Please enter a valid phone number";
      if ((g.type === "text" || g.type === "textarea") && g.minLength && _.length < g.minLength)
        return `${g.label} must be at least ${g.minLength} characters`;
      if ((g.type === "text" || g.type === "textarea") && g.maxLength && _.length > g.maxLength)
        return `${g.label} must not exceed ${g.maxLength} characters`;
      if (g.type === "number") {
        const h = parseFloat(_);
        if (isNaN(h))
          return `${g.label} must be a valid number`;
        if (g.minLength && h < g.minLength)
          return `${g.label} must be at least ${g.minLength}`;
        if (g.maxLength && h > g.maxLength)
          return `${g.label} must not exceed ${g.maxLength}`;
      }
      return null;
    }, ia = async () => {
      if (!(et.value || !ct.value))
        try {
          et.value = !0, Qe.value = {};
          let g = !1;
          for (const _ of ct.value.fields || []) {
            const h = Je.value[_.name], Z = Zs(_, h);
            Z && (Qe.value[_.name] = Z, g = !0, console.log(`Validation error for field ${_.name}:`, Z));
          }
          if (g) {
            et.value = !1, console.log("Validation failed, not submitting");
            return;
          }
          await we(Je.value), kn.value = !1, ct.value = null, Je.value = {};
        } catch (g) {
          console.error("Failed to submit full screen form:", g);
        } finally {
          et.value = !1, console.log("Full screen form submission completed");
        }
    }, oa = (g, _) => {
      if (console.log("handleViewDetails called with:", { product: g, shopDomain: _ }), !g) {
        console.error("No product provided to handleViewDetails");
        return;
      }
      let h = null;
      if (g.handle && _)
        h = `https://${_}/products/${g.handle}`;
      else if (g.id && _)
        h = `https://${_}/products/${g.id}`;
      else if (_) {
        if (!g.handle && !g.id) {
          console.error("Product handle and ID are both missing! Product:", g), alert("Unable to open product: Product information incomplete.");
          return;
        }
      } else {
        console.error("Shop domain is missing! Product:", g), alert("Unable to open product: Shop domain not available. Please contact support.");
        return;
      }
      h && (console.log("Opening product URL:", h), window.open(h, "_blank"));
    }, la = (g) => {
      if (!g) return "";
      console.log("removeUrls - Input text:", g);
      let _ = g.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "");
      const h = [];
      return _ = _.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (Z, le, se) => {
        const bt = `__MARKDOWN_LINK_${h.length}__`;
        return console.log("Found markdown link:", Z, "-> placeholder:", bt), h.push(Z), bt;
      }), console.log("After replacing markdown links with placeholders:", _), console.log("Markdown links array:", h), _ = _.replace(/https?:\/\/[^\s\)]+/g, "[link removed]"), console.log("After removing standalone URLs:", _), h.forEach((Z, le) => {
        _ = _.replace(`__MARKDOWN_LINK_${le}__`, Z), console.log(`Restored markdown link ${le}:`, Z);
      }), _ = _.replace(/\n\s*\n\s*\n/g, `

`).trim(), console.log("removeUrls - Final output:", _), _;
    }, gi = ae(!1);
    ae(!1);
    const mi = We(() => {
      var h;
      const g = !!((h = N.value) != null && h.human_agent_name), _ = c.value.some((Z) => Z.message_type === "agent");
      return yt.value && g && _ && V.value.length < xo;
    });
    sn(yt, (g) => {
      var _;
      console.log("🔍 allowAttachments changed to:", g), console.log("   isHandedOverToHuman:", !!((_ = N.value) != null && _.human_agent_name)), console.log("   canUploadMore:", mi.value);
    });
    const aa = async () => {
      try {
        wn.value = !1, $n.value = null, await je();
      } catch (g) {
        console.error("Failed to proceed workflow:", g);
      }
    }, Gs = async (g) => {
      try {
        if (!g.userInputValue || !g.userInputValue.trim())
          return;
        const _ = g.userInputValue.trim();
        g.isSubmitted = !0, g.submittedValue = _, await Ee(_, X.value);
      } catch (_) {
        console.error("Failed to submit user input:", _), g.isSubmitted = !1, g.submittedValue = null;
      }
    }, _i = async () => {
      var g, _, h;
      try {
        let Z = 0;
        const le = 50;
        for (; !((g = window.__INITIAL_DATA__) != null && g.widgetId) && Z < le; )
          await new Promise((bt) => setTimeout(bt, 100)), Z++;
        return (_ = window.__INITIAL_DATA__) != null && _.widgetId ? await Ge() ? ((h = window.__INITIAL_DATA__) != null && h.workflow && J.value && await Oe(), !0) : (U.value = "connected", !1) : (console.error("Widget data not available after waiting"), !1);
      } catch (Z) {
        return console.error("Failed to initialize widget:", Z), !1;
      }
    }, ca = () => {
      Y(async () => {
        await Ge();
      }), window.addEventListener("message", (g) => {
        g.data.type === "SCROLL_TO_BOTTOM" && Lt(), g.data.type === "TOKEN_RECEIVED" && localStorage.setItem(fr, g.data.token);
      }), fe((g) => {
        var _;
        if (di.value = g.button_text || "Start Chat", g.type === "landing_page")
          $n.value = g.landing_page_data, wn.value = !0, kn.value = !1;
        else if (g.type === "form" || g.type === "display_form")
          if (((_ = g.form_data) == null ? void 0 : _.form_full_screen) === !0)
            ct.value = g.form_data, kn.value = !0, wn.value = !1;
          else {
            const h = {
              message: "",
              message_type: "form",
              attributes: {
                form_data: g.form_data
              },
              created_at: (/* @__PURE__ */ new Date()).toISOString(),
              isSubmitted: !1
            };
            c.value.findIndex(
              (le) => le.message_type === "form" && !le.isSubmitted
            ) === -1 && c.value.push(h), wn.value = !1, kn.value = !1;
          }
        else
          wn.value = !1, kn.value = !1;
      }), Ue((g) => {
        console.log("Workflow proceeded:", g);
      });
    }, ua = async () => {
      try {
        await _i(), await Oe();
      } catch (g) {
        throw console.error("Failed to start new conversation:", g), g;
      }
    }, fa = async () => {
      pi.value = !1, c.value = [], await ua();
    };
    sl(async () => {
      await _i(), ca(), he(), (() => {
        const _ = c.value.length > 0, h = U.value === "connected", Z = document.querySelector('input[type="text"], textarea') !== null;
        return _ || h || Z;
      })() && setTimeout(Pe, 100);
    }), Zr(() => {
      window.removeEventListener("message", (g) => {
        g.data.type === "SCROLL_TO_BOTTOM" && Lt();
      }), M && (M.disconnect(), M = null), he.timeoutId && (clearTimeout(he.timeoutId), he.timeoutId = null), He(), H();
    });
    const St = We(() => i.value.chat_style === "ASK_ANYTHING"), ha = We(() => {
      const g = {
        width: "100%",
        height: "580px",
        borderRadius: "var(--radius-lg)"
      };
      return window.innerWidth <= 768 && (g.width = "100vw", g.height = "100vh", g.borderRadius = "0", g.position = "fixed", g.top = "0", g.left = "0", g.bottom = "0", g.right = "0", g.maxWidth = "100vw", g.maxHeight = "100vh"), St.value ? window.innerWidth <= 768 ? {
        ...g,
        width: "100vw",
        height: "100vh",
        maxWidth: "100vw",
        maxHeight: "100vh",
        minWidth: "unset",
        borderRadius: "0"
      } : window.innerWidth <= 1024 ? {
        ...g,
        width: "95%",
        maxWidth: "700px",
        minWidth: "500px",
        height: "650px"
      } : {
        ...g,
        width: "100%",
        maxWidth: "400px",
        minWidth: "400px",
        height: "580px"
      } : g;
    }), yi = We(() => St.value && c.value.length === 0);
    return (g, _) => r.value ? (E(), I("div", {
      key: 0,
      class: Ne(["chat-container", { collapsed: !ee.value, "ask-anything-style": St.value }]),
      style: Ae({ ...x(F), ...ha.value })
    }, [
      pt.value ? (E(), I("div", Ch, _[17] || (_[17] = [
        Qc('<div class="loading-spinner" data-v-eb03165f><div class="dot" data-v-eb03165f></div><div class="dot" data-v-eb03165f></div><div class="dot" data-v-eb03165f></div></div><div class="loading-text" data-v-eb03165f>Initializing chat...</div>', 2)
      ]))) : re("", !0),
      !pt.value && x(U) !== "connected" ? (E(), I("div", {
        key: 1,
        class: Ne(["connection-status", x(U)])
      }, [
        x(U) === "connecting" ? (E(), I("div", Th, _[18] || (_[18] = [
          wt(" Connecting to chat service... ", -1),
          v("div", { class: "loading-dots" }, [
            v("div", { class: "dot" }),
            v("div", { class: "dot" }),
            v("div", { class: "dot" })
          ], -1)
        ]))) : x(U) === "failed" ? (E(), I("div", Ah, [
          _[19] || (_[19] = wt(" Connection failed. ", -1)),
          v("button", {
            onClick: js,
            class: "reconnect-button"
          }, " Click here to reconnect ")
        ])) : re("", !0)
      ], 2)) : re("", !0),
      x(y) ? (E(), I("div", {
        key: 2,
        class: "error-alert",
        style: Ae(x(k))
      }, te(x(b)), 5)) : re("", !0),
      yi.value ? (E(), I("div", {
        key: 3,
        class: "welcome-message-section",
        style: Ae(x(p))
      }, [
        v("div", Eh, [
          v("div", Rh, [
            x($) ? (E(), I("img", {
              key: 0,
              src: x($),
              alt: x(o),
              class: "welcome-avatar"
            }, null, 8, Ih)) : re("", !0),
            v("h1", Lh, te(x(i).welcome_title || `Welcome to ${x(o)}`), 1),
            v("p", Oh, te(x(i).welcome_subtitle || "I'm here to help you with anything you need. What can I assist you with today?"), 1)
          ])
        ]),
        v("div", Ph, [
          !x(B) && !J.value && !St.value ? (E(), I("div", $h, [
            hn(v("input", {
              "onUpdate:modelValue": _[0] || (_[0] = (h) => X.value = h),
              type: "email",
              placeholder: "Enter your email address",
              disabled: x(u) || x(U) !== "connected",
              class: Ne([{
                invalid: X.value.trim() && !x(Nn)(X.value.trim()),
                disabled: x(U) !== "connected"
              }, "welcome-email-input"])
            }, null, 10, Fh), [
              [gn, X.value]
            ])
          ])) : re("", !0),
          v("div", Bh, [
            hn(v("input", {
              "onUpdate:modelValue": _[1] || (_[1] = (h) => Te.value = h),
              type: "text",
              placeholder: be.value,
              onKeypress: Be,
              onInput: ze,
              onChange: ze,
              disabled: !ue.value,
              class: Ne([{ disabled: !ue.value }, "welcome-message-field"])
            }, null, 42, Nh), [
              [gn, Te.value]
            ]),
            v("button", {
              class: "welcome-send-button",
              style: Ae(x(T)),
              onClick: Re,
              disabled: !Te.value.trim() || !ue.value
            }, _[20] || (_[20] = [
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
            ]), 12, Mh)
          ])
        ]),
        v("div", {
          class: "powered-by-welcome",
          style: Ae(x(A))
        }, _[21] || (_[21] = [
          v("svg", {
            class: "chattermate-logo",
            width: "16",
            height: "16",
            viewBox: "0 0 60 60",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg"
          }, [
            v("path", {
              d: "M45 15H15C13.3431 15 12 16.3431 12 18V42C12 43.6569 13.3431 45 15 45H25L30 52L35 45H45C46.6569 45 48 43.6569 48 42V18C48 16.3431 46.6569 15 45 15Z",
              fill: "currentColor",
              opacity: "0.8"
            }),
            v("path", {
              d: "M36 27C36 27 32.5 26 30 26C27.5 26 24 27 24 31C24 35 27.5 36 30 36C32.5 36 36 35 36 35V33C36 33 33 34 31.5 34C30 34 27 33 27 31C27 29 30 28 31.5 28C33 28 36 29 36 29V27Z",
              fill: "currentColor"
            })
          ], -1),
          wt(" Powered by ChatterMate ", -1)
        ]), 4)
      ], 4)) : re("", !0),
      wn.value && $n.value ? (E(), I("div", {
        key: 4,
        class: "landing-page-fullscreen",
        style: Ae(x(p))
      }, [
        v("div", Dh, [
          v("div", qh, [
            v("h2", Uh, te($n.value.heading), 1),
            v("div", zh, te($n.value.content), 1)
          ]),
          v("div", Hh, [
            v("button", {
              class: "landing-page-button",
              onClick: aa
            }, te(di.value), 1)
          ])
        ]),
        v("div", {
          class: "powered-by-landing",
          style: Ae(x(A))
        }, _[22] || (_[22] = [
          v("svg", {
            class: "chattermate-logo",
            width: "16",
            height: "16",
            viewBox: "0 0 60 60",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg"
          }, [
            v("path", {
              d: "M45 15H15C13.3431 15 12 16.3431 12 18V42C12 43.6569 13.3431 45 15 45H25L30 52L35 45H45C46.6569 45 48 43.6569 48 42V18C48 16.3431 46.6569 15 45 15Z",
              fill: "currentColor",
              opacity: "0.8"
            }),
            v("path", {
              d: "M36 27C36 27 32.5 26 30 26C27.5 26 24 27 24 31C24 35 27.5 36 30 36C32.5 36 36 35 36 35V33C36 33 33 34 31.5 34C30 34 27 33 27 31C27 29 30 28 31.5 28C33 28 36 29 36 29V27Z",
              fill: "currentColor"
            })
          ], -1),
          wt(" Powered by ChatterMate ", -1)
        ]), 4)
      ], 4)) : kn.value && ct.value ? (E(), I("div", {
        key: 5,
        class: "form-fullscreen",
        style: Ae(x(p))
      }, [
        v("div", Vh, [
          ct.value.title || ct.value.description ? (E(), I("div", Wh, [
            ct.value.title ? (E(), I("h2", jh, te(ct.value.title), 1)) : re("", !0),
            ct.value.description ? (E(), I("p", Kh, te(ct.value.description), 1)) : re("", !0)
          ])) : re("", !0),
          v("div", Zh, [
            (E(!0), I(Me, null, Ct(ct.value.fields, (h) => {
              var Z, le;
              return E(), I("div", {
                key: h.name,
                class: "form-field"
              }, [
                v("label", {
                  for: `fullscreen-form-${h.name}`,
                  class: "field-label"
                }, [
                  wt(te(h.label) + " ", 1),
                  h.required ? (E(), I("span", Xh, "*")) : re("", !0)
                ], 8, Gh),
                h.type === "text" || h.type === "email" || h.type === "tel" ? (E(), I("input", {
                  key: 0,
                  id: `fullscreen-form-${h.name}`,
                  type: h.type,
                  placeholder: h.placeholder || "",
                  required: h.required,
                  minlength: h.minLength,
                  maxlength: h.maxLength,
                  value: Je.value[h.name] || "",
                  onInput: (se) => gt(h.name, se.target.value),
                  onBlur: (se) => gt(h.name, se.target.value),
                  class: Ne(["form-input", { error: Qe.value[h.name] }]),
                  autocomplete: h.type === "email" ? "email" : h.type === "tel" ? "tel" : "off",
                  inputmode: h.type === "tel" ? "tel" : h.type === "email" ? "email" : "text"
                }, null, 42, Yh)) : h.type === "number" ? (E(), I("input", {
                  key: 1,
                  id: `fullscreen-form-${h.name}`,
                  type: "number",
                  placeholder: h.placeholder || "",
                  required: h.required,
                  min: h.minLength,
                  max: h.maxLength,
                  value: Je.value[h.name] || "",
                  onInput: (se) => gt(h.name, se.target.value),
                  class: Ne(["form-input", { error: Qe.value[h.name] }])
                }, null, 42, Jh)) : h.type === "textarea" ? (E(), I("textarea", {
                  key: 2,
                  id: `fullscreen-form-${h.name}`,
                  placeholder: h.placeholder || "",
                  required: h.required,
                  minlength: h.minLength,
                  maxlength: h.maxLength,
                  value: Je.value[h.name] || "",
                  onInput: (se) => gt(h.name, se.target.value),
                  class: Ne(["form-textarea", { error: Qe.value[h.name] }]),
                  rows: "4"
                }, null, 42, Qh)) : h.type === "select" ? (E(), I("select", {
                  key: 3,
                  id: `fullscreen-form-${h.name}`,
                  required: h.required,
                  value: Je.value[h.name] || "",
                  onChange: (se) => gt(h.name, se.target.value),
                  class: Ne(["form-select", { error: Qe.value[h.name] }])
                }, [
                  v("option", td, te(h.placeholder || "Please select..."), 1),
                  (E(!0), I(Me, null, Ct((Array.isArray(h.options) ? h.options : ((Z = h.options) == null ? void 0 : Z.split(`
`)) || []).filter((se) => se.trim()), (se) => (E(), I("option", {
                    key: se,
                    value: se.trim()
                  }, te(se.trim()), 9, nd))), 128))
                ], 42, ed)) : h.type === "checkbox" ? (E(), I("label", sd, [
                  v("input", {
                    id: `fullscreen-form-${h.name}`,
                    type: "checkbox",
                    required: h.required,
                    checked: Je.value[h.name] || !1,
                    onChange: (se) => gt(h.name, se.target.checked),
                    class: "form-checkbox"
                  }, null, 40, rd),
                  v("span", id, te(h.label), 1)
                ])) : h.type === "radio" ? (E(), I("div", od, [
                  (E(!0), I(Me, null, Ct((Array.isArray(h.options) ? h.options : ((le = h.options) == null ? void 0 : le.split(`
`)) || []).filter((se) => se.trim()), (se) => (E(), I("label", {
                    key: se,
                    class: "radio-field"
                  }, [
                    v("input", {
                      type: "radio",
                      name: `fullscreen-form-${h.name}`,
                      value: se.trim(),
                      required: h.required,
                      checked: Je.value[h.name] === se.trim(),
                      onChange: (bt) => gt(h.name, se.trim()),
                      class: "form-radio"
                    }, null, 40, ld),
                    v("span", ad, te(se.trim()), 1)
                  ]))), 128))
                ])) : re("", !0),
                Qe.value[h.name] ? (E(), I("div", cd, te(Qe.value[h.name]), 1)) : re("", !0)
              ]);
            }), 128))
          ]),
          v("div", ud, [
            v("button", {
              onClick: _[2] || (_[2] = () => {
                console.log("Submit button clicked!"), ia();
              }),
              disabled: et.value,
              class: "submit-form-button",
              style: Ae(x(T))
            }, [
              et.value ? (E(), I("span", hd, _[23] || (_[23] = [
                v("div", { class: "dot" }, null, -1),
                v("div", { class: "dot" }, null, -1),
                v("div", { class: "dot" }, null, -1)
              ]))) : (E(), I("span", dd, te(ct.value.submit_button_text || "Submit"), 1))
            ], 12, fd)
          ])
        ]),
        v("div", {
          class: "powered-by-landing",
          style: Ae(x(A))
        }, _[24] || (_[24] = [
          v("svg", {
            class: "chattermate-logo",
            width: "16",
            height: "16",
            viewBox: "0 0 60 60",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg"
          }, [
            v("path", {
              d: "M45 15H15C13.3431 15 12 16.3431 12 18V42C12 43.6569 13.3431 45 15 45H25L30 52L35 45H45C46.6569 45 48 43.6569 48 42V18C48 16.3431 46.6569 15 45 15Z",
              fill: "currentColor",
              opacity: "0.8"
            }),
            v("path", {
              d: "M36 27C36 27 32.5 26 30 26C27.5 26 24 27 24 31C24 35 27.5 36 30 36C32.5 36 36 35 36 35V33C36 33 33 34 31.5 34C30 34 27 33 27 31C27 29 30 28 31.5 28C33 28 36 29 36 29V27Z",
              fill: "currentColor"
            })
          ], -1),
          wt(" Powered by ChatterMate ", -1)
        ]), 4)
      ], 4)) : yi.value ? re("", !0) : (E(), I(Me, { key: 6 }, [
        ee.value ? (E(), I("div", {
          key: 0,
          class: Ne(["chat-panel", { "ask-anything-chat": St.value }]),
          style: Ae(x(p))
        }, [
          St.value ? (E(), I("div", {
            key: 1,
            class: "ask-anything-top",
            style: Ae(x(q))
          }, [
            v("div", yd, [
              os.value || x($) ? (E(), I("img", {
                key: 0,
                src: os.value || x($),
                alt: x(N).human_agent_name || x(o),
                class: "header-avatar"
              }, null, 8, vd)) : re("", !0),
              v("div", bd, [
                v("h3", {
                  style: Ae(x(A))
                }, te(x(o)), 5),
                v("p", {
                  class: "ask-anything-subtitle",
                  style: Ae(x(A))
                }, te(x(i).welcome_subtitle || "Ask me anything. I'm here to help."), 5)
              ])
            ])
          ], 4)) : (E(), I("div", {
            key: 0,
            class: "chat-header",
            style: Ae(x(q))
          }, [
            v("div", pd, [
              os.value || x($) ? (E(), I("img", {
                key: 0,
                src: os.value || x($),
                alt: x(N).human_agent_name || x(o),
                class: "header-avatar"
              }, null, 8, gd)) : re("", !0),
              v("div", md, [
                v("h3", {
                  style: Ae(x(A))
                }, te(x(N).human_agent_name || x(o)), 5),
                v("div", _d, [
                  _[25] || (_[25] = v("span", { class: "status-indicator online" }, null, -1)),
                  v("span", {
                    class: "status-text",
                    style: Ae(x(A))
                  }, "Online", 4)
                ])
              ])
            ])
          ], 4)),
          x(P) ? (E(), I("div", wd, _[26] || (_[26] = [
            v("div", { class: "loading-spinner" }, [
              v("div", { class: "dot" }),
              v("div", { class: "dot" }),
              v("div", { class: "dot" })
            ], -1)
          ]))) : re("", !0),
          v("div", {
            class: "chat-messages",
            ref_key: "messagesContainer",
            ref: d
          }, [
            (E(!0), I(Me, null, Ct(x(c), (h, Z) => {
              var le, se, bt, pe, Ht, bi, wi, ki, xi, Si, Ci, Ti, Ai, Ei, Ri, Ii, Li, Oi, Pi;
              return E(), I("div", {
                key: Z,
                class: Ne([
                  "message",
                  h.message_type === "bot" || h.message_type === "agent" ? "agent-message" : h.message_type === "system" ? "system-message" : h.message_type === "rating" ? "rating-message" : h.message_type === "form" ? "form-message" : h.message_type === "product" || h.shopify_output ? "product-message" : "user-message"
                ])
              }, [
                v("div", {
                  class: "message-bubble",
                  style: Ae(h.message_type === "system" || h.message_type === "rating" || h.message_type === "product" || h.shopify_output ? {} : h.message_type === "user" ? x(T) : x(R))
                }, [
                  h.message_type === "rating" ? (E(), I("div", kd, [
                    v("p", xd, "Rate the chat session that you had with " + te(h.agent_name || x(N).human_agent_name || x(o) || "our agent"), 1),
                    v("div", {
                      class: Ne(["star-rating", { submitted: Pt.value || h.isSubmitted }])
                    }, [
                      (E(), I(Me, null, Ct(5, (C) => v("button", {
                        key: C,
                        class: Ne(["star-button", {
                          warning: C <= (h.isSubmitted ? h.finalRating : Ot.value || h.selectedRating) && (h.isSubmitted ? h.finalRating : Ot.value || h.selectedRating) <= 3,
                          success: C <= (h.isSubmitted ? h.finalRating : Ot.value || h.selectedRating) && (h.isSubmitted ? h.finalRating : Ot.value || h.selectedRating) > 3,
                          selected: C <= (h.isSubmitted ? h.finalRating : Ot.value || h.selectedRating)
                        }]),
                        onMouseover: (Vt) => !h.isSubmitted && Jl(C),
                        onMouseleave: (Vt) => !h.isSubmitted && Ql,
                        onClick: (Vt) => !h.isSubmitted && ea(C),
                        disabled: Pt.value || h.isSubmitted
                      }, " ★ ", 42, Sd)), 64))
                    ], 2),
                    h.showFeedback && !h.isSubmitted ? (E(), I("div", Cd, [
                      v("div", Td, [
                        hn(v("input", {
                          "onUpdate:modelValue": (C) => h.feedback = C,
                          placeholder: "Please share your feedback (optional)",
                          disabled: Pt.value,
                          maxlength: "500",
                          class: "feedback-input"
                        }, null, 8, Ad), [
                          [gn, h.feedback]
                        ]),
                        v("div", Ed, te(((le = h.feedback) == null ? void 0 : le.length) || 0) + "/500", 1)
                      ]),
                      v("button", {
                        onClick: (C) => ta(h.session_id, Ot.value, h.feedback),
                        disabled: Pt.value || !Ot.value,
                        class: "submit-rating-button",
                        style: Ae({ backgroundColor: x(i).accent_color || "var(--primary-color)" })
                      }, te(Pt.value ? "Submitting..." : "Submit Rating"), 13, Rd)
                    ])) : re("", !0),
                    h.isSubmitted && h.finalFeedback ? (E(), I("div", Id, [
                      v("div", Ld, [
                        v("p", Od, te(h.finalFeedback), 1)
                      ])
                    ])) : h.isSubmitted ? (E(), I("div", Pd, " Thank you for your rating! ")) : re("", !0)
                  ])) : h.message_type === "form" ? (E(), I("div", $d, [
                    (bt = (se = h.attributes) == null ? void 0 : se.form_data) != null && bt.title || (Ht = (pe = h.attributes) == null ? void 0 : pe.form_data) != null && Ht.description ? (E(), I("div", Fd, [
                      (wi = (bi = h.attributes) == null ? void 0 : bi.form_data) != null && wi.title ? (E(), I("h3", Bd, te(h.attributes.form_data.title), 1)) : re("", !0),
                      (xi = (ki = h.attributes) == null ? void 0 : ki.form_data) != null && xi.description ? (E(), I("p", Nd, te(h.attributes.form_data.description), 1)) : re("", !0)
                    ])) : re("", !0),
                    v("div", Md, [
                      (E(!0), I(Me, null, Ct((Ci = (Si = h.attributes) == null ? void 0 : Si.form_data) == null ? void 0 : Ci.fields, (C) => {
                        var Vt, Xs;
                        return E(), I("div", {
                          key: C.name,
                          class: "form-field"
                        }, [
                          v("label", {
                            for: `form-${C.name}`,
                            class: "field-label"
                          }, [
                            wt(te(C.label) + " ", 1),
                            C.required ? (E(), I("span", qd, "*")) : re("", !0)
                          ], 8, Dd),
                          C.type === "text" || C.type === "email" || C.type === "tel" ? (E(), I("input", {
                            key: 0,
                            id: `form-${C.name}`,
                            type: C.type,
                            placeholder: C.placeholder || "",
                            required: C.required,
                            minlength: C.minLength,
                            maxlength: C.maxLength,
                            value: Je.value[C.name] || "",
                            onInput: (ke) => gt(C.name, ke.target.value),
                            onBlur: (ke) => gt(C.name, ke.target.value),
                            class: Ne(["form-input", { error: Qe.value[C.name] }]),
                            disabled: et.value,
                            autocomplete: C.type === "email" ? "email" : C.type === "tel" ? "tel" : "off",
                            inputmode: C.type === "tel" ? "tel" : C.type === "email" ? "email" : "text"
                          }, null, 42, Ud)) : C.type === "number" ? (E(), I("input", {
                            key: 1,
                            id: `form-${C.name}`,
                            type: "number",
                            placeholder: C.placeholder || "",
                            required: C.required,
                            min: C.min,
                            max: C.max,
                            value: Je.value[C.name] || "",
                            onInput: (ke) => gt(C.name, ke.target.value),
                            class: Ne(["form-input", { error: Qe.value[C.name] }]),
                            disabled: et.value
                          }, null, 42, zd)) : C.type === "textarea" ? (E(), I("textarea", {
                            key: 2,
                            id: `form-${C.name}`,
                            placeholder: C.placeholder || "",
                            required: C.required,
                            minlength: C.minLength,
                            maxlength: C.maxLength,
                            value: Je.value[C.name] || "",
                            onInput: (ke) => gt(C.name, ke.target.value),
                            class: Ne(["form-textarea", { error: Qe.value[C.name] }]),
                            disabled: et.value,
                            rows: "3"
                          }, null, 42, Hd)) : C.type === "select" ? (E(), I("select", {
                            key: 3,
                            id: `form-${C.name}`,
                            required: C.required,
                            value: Je.value[C.name] || "",
                            onChange: (ke) => gt(C.name, ke.target.value),
                            class: Ne(["form-select", { error: Qe.value[C.name] }]),
                            disabled: et.value
                          }, [
                            v("option", Wd, te(C.placeholder || "Select an option"), 1),
                            (E(!0), I(Me, null, Ct((Array.isArray(C.options) ? C.options : ((Vt = C.options) == null ? void 0 : Vt.split(`
`)) || []).filter((ke) => ke.trim()), (ke) => (E(), I("option", {
                              key: ke.trim(),
                              value: ke.trim()
                            }, te(ke.trim()), 9, jd))), 128))
                          ], 42, Vd)) : C.type === "checkbox" ? (E(), I("div", Kd, [
                            v("input", {
                              id: `form-${C.name}`,
                              type: "checkbox",
                              checked: Je.value[C.name] || !1,
                              onChange: (ke) => gt(C.name, ke.target.checked),
                              class: "form-checkbox",
                              disabled: et.value
                            }, null, 40, Zd),
                            v("label", {
                              for: `form-${C.name}`,
                              class: "checkbox-label"
                            }, te(C.placeholder || C.label), 9, Gd)
                          ])) : C.type === "radio" ? (E(), I("div", Xd, [
                            (E(!0), I(Me, null, Ct((Array.isArray(C.options) ? C.options : ((Xs = C.options) == null ? void 0 : Xs.split(`
`)) || []).filter((ke) => ke.trim()), (ke) => (E(), I("div", {
                              key: ke.trim(),
                              class: "radio-option"
                            }, [
                              v("input", {
                                id: `form-${C.name}-${ke.trim()}`,
                                name: `form-${C.name}`,
                                type: "radio",
                                value: ke.trim(),
                                checked: Je.value[C.name] === ke.trim(),
                                onChange: (gg) => gt(C.name, ke.trim()),
                                class: "form-radio",
                                disabled: et.value
                              }, null, 40, Yd),
                              v("label", {
                                for: `form-${C.name}-${ke.trim()}`,
                                class: "radio-label"
                              }, te(ke.trim()), 9, Jd)
                            ]))), 128))
                          ])) : re("", !0),
                          Qe.value[C.name] ? (E(), I("div", Qd, te(Qe.value[C.name]), 1)) : re("", !0)
                        ]);
                      }), 128))
                    ]),
                    v("div", ep, [
                      v("button", {
                        onClick: () => {
                          var C;
                          console.log("Regular form submit button clicked!"), sa((C = h.attributes) == null ? void 0 : C.form_data);
                        },
                        disabled: et.value,
                        class: "form-submit-button",
                        style: Ae(x(T))
                      }, te(et.value ? "Submitting..." : ((Ai = (Ti = h.attributes) == null ? void 0 : Ti.form_data) == null ? void 0 : Ai.submit_button_text) || "Submit"), 13, tp)
                    ])
                  ])) : h.message_type === "user_input" ? (E(), I("div", np, [
                    (Ei = h.attributes) != null && Ei.prompt_message && h.attributes.prompt_message.trim() ? (E(), I("div", sp, te(h.attributes.prompt_message), 1)) : re("", !0),
                    h.isSubmitted ? (E(), I("div", lp, [
                      _[27] || (_[27] = v("strong", null, "Your input:", -1)),
                      wt(" " + te(h.submittedValue) + " ", 1),
                      (Ri = h.attributes) != null && Ri.confirmation_message && h.attributes.confirmation_message.trim() ? (E(), I("div", ap, te(h.attributes.confirmation_message), 1)) : re("", !0)
                    ])) : (E(), I("div", rp, [
                      hn(v("textarea", {
                        "onUpdate:modelValue": (C) => h.userInputValue = C,
                        class: "user-input-textarea",
                        placeholder: "Type your message here...",
                        rows: "3",
                        onKeydown: [
                          ao(Sn((C) => Gs(h), ["ctrl"]), ["enter"]),
                          ao(Sn((C) => Gs(h), ["meta"]), ["enter"])
                        ]
                      }, null, 40, ip), [
                        [gn, h.userInputValue]
                      ]),
                      v("button", {
                        class: "user-input-submit-button",
                        onClick: (C) => Gs(h),
                        disabled: !h.userInputValue || !h.userInputValue.trim()
                      }, " Submit ", 8, op)
                    ]))
                  ])) : h.shopify_output || h.message_type === "product" ? (E(), I("div", cp, [
                    h.message ? (E(), I("div", {
                      key: 0,
                      innerHTML: x(me)(((Li = (Ii = h.shopify_output) == null ? void 0 : Ii.products) == null ? void 0 : Li.length) > 0 ? la(h.message) : h.message, { renderer: x(t) }),
                      class: "product-message-text"
                    }, null, 8, up)) : re("", !0),
                    (Oi = h.shopify_output) != null && Oi.products && h.shopify_output.products.length > 0 ? (E(), I("div", fp, [
                      _[29] || (_[29] = v("h3", { class: "carousel-title" }, "Products", -1)),
                      v("div", hp, [
                        (E(!0), I(Me, null, Ct(h.shopify_output.products, (C) => {
                          var Vt;
                          return E(), I("div", {
                            key: C.id,
                            class: "product-card-compact carousel-item"
                          }, [
                            (Vt = C.image) != null && Vt.src ? (E(), I("div", dp, [
                              v("img", {
                                src: C.image.src,
                                alt: C.title,
                                class: "product-thumbnail"
                              }, null, 8, pp)
                            ])) : re("", !0),
                            v("div", gp, [
                              v("div", mp, [
                                v("div", _p, te(C.title), 1),
                                C.variant_title && C.variant_title !== "Default Title" ? (E(), I("div", yp, te(C.variant_title), 1)) : re("", !0),
                                v("div", vp, te(C.price_formatted || `₹${C.price}`), 1)
                              ]),
                              v("div", bp, [
                                v("button", {
                                  class: "view-details-button-compact",
                                  onClick: (Xs) => {
                                    var ke;
                                    return oa(C, (ke = h.shopify_output) == null ? void 0 : ke.shop_domain);
                                  }
                                }, _[28] || (_[28] = [
                                  wt(" View product ", -1),
                                  v("span", { class: "external-link-icon" }, "↗", -1)
                                ]), 8, wp)
                              ])
                            ])
                          ]);
                        }), 128))
                      ])
                    ])) : !h.message && ((Pi = h.shopify_output) != null && Pi.products) && h.shopify_output.products.length === 0 ? (E(), I("div", kp, _[30] || (_[30] = [
                      v("p", null, "No products found.", -1)
                    ]))) : !h.message && h.shopify_output && !h.shopify_output.products ? (E(), I("div", xp, _[31] || (_[31] = [
                      v("p", null, "No products to display.", -1)
                    ]))) : re("", !0)
                  ])) : (E(), I(Me, { key: 4 }, [
                    v("div", {
                      innerHTML: x(me)(h.message, { renderer: x(t) })
                    }, null, 8, Sp),
                    h.attachments && h.attachments.length > 0 ? (E(), I("div", Cp, [
                      (E(!0), I(Me, null, Ct(h.attachments, (C) => (E(), I("div", {
                        key: C.id,
                        class: "attachment-item"
                      }, [
                        x(ce)(C.content_type) ? (E(), I("div", Tp, [
                          v("img", {
                            src: x(ve)(C.file_url),
                            alt: C.filename,
                            class: "attachment-image",
                            onClick: Sn((Vt) => x(w)({ url: C.file_url, filename: C.filename, type: C.content_type, file_url: x(ve)(C.file_url), size: void 0 }), ["stop"]),
                            style: { cursor: "pointer" }
                          }, null, 8, Ap),
                          v("div", Ep, [
                            v("a", {
                              href: x(ve)(C.file_url),
                              target: "_blank",
                              class: "attachment-link"
                            }, [
                              _[32] || (_[32] = v("svg", {
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
                              wt(" " + te(C.filename) + " ", 1),
                              v("span", Ip, "(" + te(x(Q)(C.file_size)) + ")", 1)
                            ], 8, Rp)
                          ])
                        ])) : (E(), I("a", {
                          key: 1,
                          href: x(ve)(C.file_url),
                          target: "_blank",
                          class: "attachment-link"
                        }, [
                          _[33] || (_[33] = v("svg", {
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
                          wt(" " + te(C.filename) + " ", 1),
                          v("span", Op, "(" + te(x(Q)(C.file_size)) + ")", 1)
                        ], 8, Lp))
                      ]))), 128))
                    ])) : re("", !0)
                  ], 64))
                ], 4),
                v("div", Pp, [
                  h.message_type === "user" ? (E(), I("span", $p, " You ")) : re("", !0)
                ])
              ], 2);
            }), 128)),
            x(u) ? (E(), I("div", Fp, _[34] || (_[34] = [
              v("div", { class: "dot" }, null, -1),
              v("div", { class: "dot" }, null, -1),
              v("div", { class: "dot" }, null, -1)
            ]))) : re("", !0)
          ], 512),
          pi.value ? (E(), I("div", {
            key: 4,
            class: "new-conversation-section",
            style: Ae(x(R))
          }, [
            v("div", Yp, [
              _[39] || (_[39] = v("p", { class: "ended-text" }, "This chat has ended.", -1)),
              v("button", {
                class: "start-new-conversation-button",
                style: Ae(x(T)),
                onClick: fa
              }, " Click here to start a new conversation ", 4)
            ])
          ], 4)) : (E(), I("div", {
            key: 3,
            class: Ne(["chat-input", { "ask-anything-input": St.value }]),
            style: Ae(x(R))
          }, [
            !x(B) && !J.value && !St.value ? (E(), I("div", Bp, [
              hn(v("input", {
                "onUpdate:modelValue": _[3] || (_[3] = (h) => X.value = h),
                type: "email",
                placeholder: "Enter your email address to begin",
                disabled: x(u) || x(U) !== "connected",
                class: Ne({
                  invalid: X.value.trim() && !x(Nn)(X.value.trim()),
                  disabled: x(U) !== "connected"
                })
              }, null, 10, Np), [
                [gn, X.value]
              ])
            ])) : re("", !0),
            v("input", {
              ref_key: "fileInputRef",
              ref: L,
              type: "file",
              accept: ag,
              multiple: "",
              style: { display: "none" },
              onChange: _[4] || (_[4] = //@ts-ignore
              (...h) => x(Ze) && x(Ze)(...h))
            }, null, 544),
            x(V).length > 0 ? (E(), I("div", Mp, [
              (E(!0), I(Me, null, Ct(x(V), (h, Z) => (E(), I("div", {
                key: Z,
                class: "file-preview-widget"
              }, [
                v("div", Dp, [
                  x(G)(h.type) ? (E(), I("img", {
                    key: 0,
                    src: x(de)(h),
                    alt: h.filename,
                    class: "file-preview-image-widget",
                    onClick: Sn((le) => x(w)(h), ["stop"]),
                    style: { cursor: "pointer" }
                  }, null, 8, qp)) : (E(), I("div", {
                    key: 1,
                    class: "file-preview-icon-widget",
                    onClick: Sn((le) => x(w)(h), ["stop"]),
                    style: { cursor: "pointer" }
                  }, _[35] || (_[35] = [
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
                  ]), 8, Up))
                ]),
                v("div", zp, [
                  v("div", Hp, te(h.filename), 1),
                  v("div", Vp, te(x(Q)(h.size)), 1)
                ]),
                v("button", {
                  type: "button",
                  class: "file-preview-remove-widget",
                  onClick: (le) => x(S)(Z),
                  title: "Remove file"
                }, " × ", 8, Wp)
              ]))), 128))
            ])) : re("", !0),
            gi.value ? (E(), I("div", jp, _[36] || (_[36] = [
              v("div", { class: "upload-spinner-widget" }, null, -1),
              v("span", { class: "upload-text-widget" }, "Uploading files...", -1)
            ]))) : re("", !0),
            v("div", Kp, [
              hn(v("input", {
                "onUpdate:modelValue": _[5] || (_[5] = (h) => Te.value = h),
                type: "text",
                placeholder: be.value,
                onKeypress: Be,
                onInput: ze,
                onChange: ze,
                onPaste: _[6] || (_[6] = //@ts-ignore
                (...h) => x(m) && x(m)(...h)),
                onDrop: _[7] || (_[7] = //@ts-ignore
                (...h) => x($e) && x($e)(...h)),
                onDragover: _[8] || (_[8] = //@ts-ignore
                (...h) => x(st) && x(st)(...h)),
                onDragleave: _[9] || (_[9] = //@ts-ignore
                (...h) => x(f) && x(f)(...h)),
                disabled: !ue.value,
                class: Ne({ disabled: !ue.value, "ask-anything-field": St.value })
              }, null, 42, Zp), [
                [gn, Te.value]
              ]),
              mi.value ? (E(), I("button", {
                key: 0,
                type: "button",
                class: "attach-button",
                disabled: gi.value,
                onClick: _[10] || (_[10] = //@ts-ignore
                (...h) => x(j) && x(j)(...h)),
                title: `Attach files (${x(V).length}/${xo} used) or paste screenshots`
              }, _[37] || (_[37] = [
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
              ]), 8, Gp)) : re("", !0),
              v("button", {
                class: Ne(["send-button", { "ask-anything-send": St.value }]),
                style: Ae(x(T)),
                onClick: Re,
                disabled: !Te.value.trim() && x(V).length === 0 || !ue.value
              }, _[38] || (_[38] = [
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
              ]), 14, Xp)
            ])
          ], 6)),
          v("div", {
            class: "powered-by",
            style: Ae(x(A))
          }, _[40] || (_[40] = [
            v("svg", {
              class: "chattermate-logo",
              width: "16",
              height: "16",
              viewBox: "0 0 60 60",
              fill: "none",
              xmlns: "http://www.w3.org/2000/svg"
            }, [
              v("path", {
                d: "M45 15H15C13.3431 15 12 16.3431 12 18V42C12 43.6569 13.3431 45 15 45H25L30 52L35 45H45C46.6569 45 48 43.6569 48 42V18C48 16.3431 46.6569 15 45 15Z",
                fill: "currentColor",
                opacity: "0.8"
              }),
              v("path", {
                d: "M36 27C36 27 32.5 26 30 26C27.5 26 24 27 24 31C24 35 27.5 36 30 36C32.5 36 36 35 36 35V33C36 33 33 34 31.5 34C30 34 27 33 27 31C27 29 30 28 31.5 28C33 28 36 29 36 29V27Z",
                fill: "currentColor"
              })
            ], -1),
            wt(" Powered by ChatterMate ", -1)
          ]), 4)
        ], 6)) : re("", !0)
      ], 64)),
      hi.value ? (E(), I("div", Jp, [
        v("div", Qp, [
          _[41] || (_[41] = v("h3", null, "Rate your conversation", -1)),
          v("div", eg, [
            (E(), I(Me, null, Ct(5, (h) => v("button", {
              key: h,
              onClick: (Z) => is.value = h,
              class: Ne([{ active: h <= is.value }, "star-button"])
            }, " ★ ", 10, tg)), 64))
          ]),
          hn(v("textarea", {
            "onUpdate:modelValue": _[11] || (_[11] = (h) => Ks.value = h),
            placeholder: "Additional feedback (optional)",
            class: "rating-feedback"
          }, null, 512), [
            [gn, Ks.value]
          ]),
          v("div", ng, [
            v("button", {
              onClick: _[12] || (_[12] = (h) => g.submitRating(is.value, Ks.value)),
              disabled: !is.value,
              class: "submit-button",
              style: Ae(x(T))
            }, " Submit ", 12, sg),
            v("button", {
              onClick: _[13] || (_[13] = (h) => hi.value = !1),
              class: "skip-rating"
            }, " Skip ")
          ])
        ])
      ])) : re("", !0),
      x(z) ? (E(), I("div", {
        key: 8,
        class: "preview-modal-overlay",
        onClick: _[16] || (_[16] = //@ts-ignore
        (...h) => x(O) && x(O)(...h))
      }, [
        v("div", {
          class: "preview-modal-content",
          onClick: _[15] || (_[15] = Sn(() => {
          }, ["stop"]))
        }, [
          v("button", {
            class: "preview-modal-close",
            onClick: _[14] || (_[14] = //@ts-ignore
            (...h) => x(O) && x(O)(...h))
          }, "×"),
          x(W) && x(G)(x(W).type) ? (E(), I("div", rg, [
            v("img", {
              src: x(de)(x(W)),
              alt: x(W).filename,
              class: "preview-modal-image"
            }, null, 8, ig),
            v("div", og, te(x(W).filename), 1)
          ])) : re("", !0)
        ])
      ])) : re("", !0)
    ], 6)) : (E(), I("div", lg));
  }
}), ug = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [s, r] of t)
    n[s] = r;
  return n;
}, fg = /* @__PURE__ */ ug(cg, [["__scopeId", "data-v-eb03165f"]]);
window.process || (window.process = { env: { NODE_ENV: "production" } });
const hg = new URL(window.location.href), dg = hg.searchParams.get("widget_id") || void 0, pg = Bu(fg, {
  widgetId: dg
});
pg.mount("#app");
