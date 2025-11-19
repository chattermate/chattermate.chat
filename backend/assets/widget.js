var pa = Object.defineProperty;
var ga = (e, t, n) => t in e ? pa(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var Ie = (e, t, n) => ga(e, typeof t != "symbol" ? t + "" : t, n);
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
const Le = {}, An = [], Nt = () => {
}, ma = () => !1, Ps = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), Fr = (e) => e.startsWith("onUpdate:"), at = Object.assign, Br = (e, t) => {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}, _a = Object.prototype.hasOwnProperty, Ce = (e, t) => _a.call(e, t), te = Array.isArray, En = (e) => $s(e) === "[object Map]", So = (e) => $s(e) === "[object Set]", ie = (e) => typeof e == "function", Ze = (e) => typeof e == "string", un = (e) => typeof e == "symbol", qe = (e) => e !== null && typeof e == "object", Co = (e) => (qe(e) || ie(e)) && ie(e.then) && ie(e.catch), To = Object.prototype.toString, $s = (e) => To.call(e), ya = (e) => $s(e).slice(8, -1), Ao = (e) => $s(e) === "[object Object]", Nr = (e) => Ze(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, Vn = /* @__PURE__ */ $r(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), Fs = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (n) => t[n] || (t[n] = e(n));
}, va = /-(\w)/g, ln = Fs(
  (e) => e.replace(va, (t, n) => n ? n.toUpperCase() : "")
), ba = /\B([A-Z])/g, fn = Fs(
  (e) => e.replace(ba, "-$1").toLowerCase()
), Eo = Fs((e) => e.charAt(0).toUpperCase() + e.slice(1)), Xs = Fs(
  (e) => e ? `on${Eo(e)}` : ""
), rn = (e, t) => !Object.is(e, t), ps = (e, ...t) => {
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
const Bs = () => $i || ($i = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function Ae(e) {
  if (te(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
      const s = e[n], r = Ze(s) ? Sa(s) : Ae(s);
      if (r)
        for (const i in r)
          t[i] = r[i];
    }
    return t;
  } else if (Ze(e) || qe(e))
    return e;
}
const wa = /;(?![^(]*\))/g, ka = /:([^]+)/, xa = /\/\*[^]*?\*\//g;
function Sa(e) {
  const t = {};
  return e.replace(xa, "").split(wa).forEach((n) => {
    if (n) {
      const s = n.split(ka);
      s.length > 1 && (t[s[0].trim()] = s[1].trim());
    }
  }), t;
}
function Me(e) {
  let t = "";
  if (Ze(e))
    t = e;
  else if (te(e))
    for (let n = 0; n < e.length; n++) {
      const s = Me(e[n]);
      s && (t += s + " ");
    }
  else if (qe(e))
    for (const n in e)
      e[n] && (t += n + " ");
  return t.trim();
}
const Ca = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", Ta = /* @__PURE__ */ $r(Ca);
function Ro(e) {
  return !!e || e === "";
}
const Io = (e) => !!(e && e.__v_isRef === !0), ee = (e) => Ze(e) ? e : e == null ? "" : te(e) || qe(e) && (e.toString === To || !ie(e.toString)) ? Io(e) ? ee(e.value) : JSON.stringify(e, Lo, 2) : String(e), Lo = (e, t) => Io(t) ? Lo(e, t.value) : En(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (n, [s, r], i) => (n[Js(s, i) + " =>"] = r, n),
    {}
  )
} : So(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((n) => Js(n))
} : un(t) ? Js(t) : qe(t) && !te(t) && !Ao(t) ? String(t) : t, Js = (e, t = "") => {
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
class Aa {
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
function Ea() {
  return mt;
}
let Pe;
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
    const t = Pe, n = It;
    Pe = this, It = !0;
    try {
      return this.fn();
    } finally {
      Bo(this), Pe = t, It = n, this.flags &= -3;
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
let Po = 0, Wn, jn;
function $o(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = jn, jn = e;
    return;
  }
  e.next = Wn, Wn = e;
}
function Mr() {
  Po++;
}
function Dr() {
  if (--Po > 0)
    return;
  if (jn) {
    let t = jn;
    for (jn = void 0; t; ) {
      const n = t.next;
      t.next = void 0, t.flags &= -9, t = n;
    }
  }
  let e;
  for (; Wn; ) {
    let t = Wn;
    for (Wn = void 0; t; ) {
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
    s.version === -1 ? (s === n && (n = r), qr(s), Ra(s)) : t = s, s.dep.activeLink = s.prevActiveLink, s.prevActiveLink = void 0, s = r;
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
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === Jn) || (e.globalVersion = Jn, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !gr(e))))
    return;
  e.flags |= 2;
  const t = e.dep, n = Pe, s = It;
  Pe = e, It = !0;
  try {
    Fo(e);
    const r = e.fn(e._value);
    (t.version === 0 || rn(r, e._value)) && (e.flags |= 128, e._value = r, t.version++);
  } catch (r) {
    throw t.version++, r;
  } finally {
    Pe = n, It = s, Bo(e), e.flags &= -3;
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
function Ra(e) {
  const { prevDep: t, nextDep: n } = e;
  t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
let It = !0;
const Mo = [];
function Yt() {
  Mo.push(It), It = !1;
}
function Xt() {
  const e = Mo.pop();
  It = e === void 0 ? !0 : e;
}
function Fi(e) {
  const { cleanup: t } = e;
  if (e.cleanup = void 0, t) {
    const n = Pe;
    Pe = void 0;
    try {
      t();
    } finally {
      Pe = n;
    }
  }
}
let Jn = 0;
class Ia {
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
    if (!Pe || !It || Pe === this.computed)
      return;
    let n = this.activeLink;
    if (n === void 0 || n.sub !== Pe)
      n = this.activeLink = new Ia(Pe, this), Pe.deps ? (n.prevDep = Pe.depsTail, Pe.depsTail.nextDep = n, Pe.depsTail = n) : Pe.deps = Pe.depsTail = n, Do(n);
    else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
      const s = n.nextDep;
      s.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = s), n.prevDep = Pe.depsTail, n.nextDep = void 0, Pe.depsTail.nextDep = n, Pe.depsTail = n, Pe.deps === n && (Pe.deps = s);
    }
    return n;
  }
  trigger(t) {
    this.version++, Jn++, this.notify(t);
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
), Qn = Symbol(
  ""
);
function ot(e, t, n) {
  if (It && Pe) {
    let s = mr.get(e);
    s || mr.set(e, s = /* @__PURE__ */ new Map());
    let r = s.get(n);
    r || (s.set(n, r = new Ur()), r.map = s, r.key = n), r.track();
  }
}
function jt(e, t, n, s, r, i) {
  const o = mr.get(e);
  if (!o) {
    Jn++;
    return;
  }
  const l = (a) => {
    a && a.trigger();
  };
  if (Mr(), t === "clear")
    o.forEach(l);
  else {
    const a = te(e), h = a && Nr(n);
    if (a && n === "length") {
      const c = Number(s);
      o.forEach((v, y) => {
        (y === "length" || y === Qn || !un(y) && y >= c) && l(v);
      });
    } else
      switch ((n !== void 0 || o.has(void 0)) && l(o.get(n)), h && l(o.get(Qn)), t) {
        case "add":
          a ? h && l(o.get("length")) : (l(o.get(_n)), En(e) && l(o.get(_r)));
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
  const t = Se(e);
  return t === e ? t : (ot(t, "iterate", Qn), At(e) ? t : t.map(st));
}
function Ns(e) {
  return ot(e = Se(e), "iterate", Qn), e;
}
const La = {
  __proto__: null,
  [Symbol.iterator]() {
    return er(this, Symbol.iterator, st);
  },
  concat(...e) {
    return xn(this).concat(
      ...e.map((t) => te(t) ? xn(t) : t)
    );
  },
  entries() {
    return er(this, "entries", (e) => (e[1] = st(e[1]), e));
  },
  every(e, t) {
    return Vt(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return Vt(this, "filter", e, t, (n) => n.map(st), arguments);
  },
  find(e, t) {
    return Vt(this, "find", e, t, st, arguments);
  },
  findIndex(e, t) {
    return Vt(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return Vt(this, "findLast", e, t, st, arguments);
  },
  findLastIndex(e, t) {
    return Vt(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return Vt(this, "forEach", e, t, void 0, arguments);
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
    return Vt(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return Bn(this, "pop");
  },
  push(...e) {
    return Bn(this, "push", e);
  },
  reduce(e, ...t) {
    return Bi(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return Bi(this, "reduceRight", e, t);
  },
  shift() {
    return Bn(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return Vt(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return Bn(this, "splice", e);
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
    return Bn(this, "unshift", e);
  },
  values() {
    return er(this, "values", st);
  }
};
function er(e, t, n) {
  const s = Ns(e), r = s[t]();
  return s !== e && !At(e) && (r._next = r.next, r.next = () => {
    const i = r._next();
    return i.value && (i.value = n(i.value)), i;
  }), r;
}
const Oa = Array.prototype;
function Vt(e, t, n, s, r, i) {
  const o = Ns(e), l = o !== e && !At(e), a = o[t];
  if (a !== Oa[t]) {
    const v = a.apply(e, i);
    return l ? st(v) : v;
  }
  let h = n;
  o !== e && (l ? h = function(v, y) {
    return n.call(this, st(v), y, e);
  } : n.length > 2 && (h = function(v, y) {
    return n.call(this, v, y, e);
  }));
  const c = a.call(o, h, s);
  return l && r ? r(c) : c;
}
function Bi(e, t, n, s) {
  const r = Ns(e);
  let i = n;
  return r !== e && (At(e) ? n.length > 3 && (i = function(o, l, a) {
    return n.call(this, o, l, a, e);
  }) : i = function(o, l, a) {
    return n.call(this, o, st(l), a, e);
  }), r[t](i, ...s);
}
function tr(e, t, n) {
  const s = Se(e);
  ot(s, "iterate", Qn);
  const r = s[t](...n);
  return (r === -1 || r === !1) && Wr(n[0]) ? (n[0] = Se(n[0]), s[t](...n)) : r;
}
function Bn(e, t, n = []) {
  Yt(), Mr();
  const s = Se(e)[t].apply(e, n);
  return Dr(), Xt(), s;
}
const Pa = /* @__PURE__ */ $r("__proto__,__v_isRef,__isVue"), qo = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(un)
);
function $a(e) {
  un(e) || (e = String(e));
  const t = Se(this);
  return ot(t, "has", e), t.hasOwnProperty(e);
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
      return s === (r ? i ? Va : Wo : i ? Vo : zo).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(s) ? t : void 0;
    const o = te(t);
    if (!r) {
      let a;
      if (o && (a = La[n]))
        return a;
      if (n === "hasOwnProperty")
        return $a;
    }
    const l = Reflect.get(
      t,
      n,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      lt(t) ? t : s
    );
    return (un(n) ? qo.has(n) : Pa(n)) || (r || ot(t, "get", n), i) ? l : lt(l) ? o && Nr(n) ? l : l.value : qe(l) ? r ? jo(l) : zr(l) : l;
  }
}
class Ho extends Uo {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, n, s, r) {
    let i = t[n];
    if (!this._isShallow) {
      const a = an(i);
      if (!At(s) && !an(s) && (i = Se(i), s = Se(s)), !te(t) && lt(i) && !lt(s))
        return a ? !1 : (i.value = s, !0);
    }
    const o = te(t) && Nr(n) ? Number(n) < t.length : Ce(t, n), l = Reflect.set(
      t,
      n,
      s,
      lt(t) ? t : r
    );
    return t === Se(r) && (o ? rn(s, i) && jt(t, "set", n, s) : jt(t, "add", n, s)), l;
  }
  deleteProperty(t, n) {
    const s = Ce(t, n);
    t[n];
    const r = Reflect.deleteProperty(t, n);
    return r && s && jt(t, "delete", n, void 0), r;
  }
  has(t, n) {
    const s = Reflect.has(t, n);
    return (!un(n) || !qo.has(n)) && ot(t, "has", n), s;
  }
  ownKeys(t) {
    return ot(
      t,
      "iterate",
      te(t) ? "length" : _n
    ), Reflect.ownKeys(t);
  }
}
class Fa extends Uo {
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
const Ba = /* @__PURE__ */ new Ho(), Na = /* @__PURE__ */ new Fa(), Ma = /* @__PURE__ */ new Ho(!0);
const yr = (e) => e, as = (e) => Reflect.getPrototypeOf(e);
function Da(e, t, n) {
  return function(...s) {
    const r = this.__v_raw, i = Se(r), o = En(i), l = e === "entries" || e === Symbol.iterator && o, a = e === "keys" && o, h = r[e](...s), c = n ? yr : t ? Ss : st;
    return !t && ot(
      i,
      "iterate",
      a ? _r : _n
    ), {
      // iterator protocol
      next() {
        const { value: v, done: y } = h.next();
        return y ? { value: v, done: y } : {
          value: l ? [c(v[0]), c(v[1])] : c(v),
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
function cs(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function qa(e, t) {
  const n = {
    get(r) {
      const i = this.__v_raw, o = Se(i), l = Se(r);
      e || (rn(r, l) && ot(o, "get", r), ot(o, "get", l));
      const { has: a } = as(o), h = t ? yr : e ? Ss : st;
      if (a.call(o, r))
        return h(i.get(r));
      if (a.call(o, l))
        return h(i.get(l));
      i !== o && i.get(r);
    },
    get size() {
      const r = this.__v_raw;
      return !e && ot(Se(r), "iterate", _n), Reflect.get(r, "size", r);
    },
    has(r) {
      const i = this.__v_raw, o = Se(i), l = Se(r);
      return e || (rn(r, l) && ot(o, "has", r), ot(o, "has", l)), r === l ? i.has(r) : i.has(r) || i.has(l);
    },
    forEach(r, i) {
      const o = this, l = o.__v_raw, a = Se(l), h = t ? yr : e ? Ss : st;
      return !e && ot(a, "iterate", _n), l.forEach((c, v) => r.call(i, h(c), h(v), o));
    }
  };
  return at(
    n,
    e ? {
      add: cs("add"),
      set: cs("set"),
      delete: cs("delete"),
      clear: cs("clear")
    } : {
      add(r) {
        !t && !At(r) && !an(r) && (r = Se(r));
        const i = Se(this);
        return as(i).has.call(i, r) || (i.add(r), jt(i, "add", r, r)), this;
      },
      set(r, i) {
        !t && !At(i) && !an(i) && (i = Se(i));
        const o = Se(this), { has: l, get: a } = as(o);
        let h = l.call(o, r);
        h || (r = Se(r), h = l.call(o, r));
        const c = a.call(o, r);
        return o.set(r, i), h ? rn(i, c) && jt(o, "set", r, i) : jt(o, "add", r, i), this;
      },
      delete(r) {
        const i = Se(this), { has: o, get: l } = as(i);
        let a = o.call(i, r);
        a || (r = Se(r), a = o.call(i, r)), l && l.call(i, r);
        const h = i.delete(r);
        return a && jt(i, "delete", r, void 0), h;
      },
      clear() {
        const r = Se(this), i = r.size !== 0, o = r.clear();
        return i && jt(
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
    n[r] = Da(r, e, t);
  }), n;
}
function Hr(e, t) {
  const n = qa(e, t);
  return (s, r, i) => r === "__v_isReactive" ? !e : r === "__v_isReadonly" ? e : r === "__v_raw" ? s : Reflect.get(
    Ce(n, r) && r in s ? n : s,
    r,
    i
  );
}
const Ua = {
  get: /* @__PURE__ */ Hr(!1, !1)
}, Ha = {
  get: /* @__PURE__ */ Hr(!1, !0)
}, za = {
  get: /* @__PURE__ */ Hr(!0, !1)
};
const zo = /* @__PURE__ */ new WeakMap(), Vo = /* @__PURE__ */ new WeakMap(), Wo = /* @__PURE__ */ new WeakMap(), Va = /* @__PURE__ */ new WeakMap();
function Wa(e) {
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
function ja(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : Wa(ya(e));
}
function zr(e) {
  return an(e) ? e : Vr(
    e,
    !1,
    Ba,
    Ua,
    zo
  );
}
function Ka(e) {
  return Vr(
    e,
    !1,
    Ma,
    Ha,
    Vo
  );
}
function jo(e) {
  return Vr(
    e,
    !0,
    Na,
    za,
    Wo
  );
}
function Vr(e, t, n, s, r) {
  if (!qe(e) || e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const i = ja(e);
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
function At(e) {
  return !!(e && e.__v_isShallow);
}
function Wr(e) {
  return e ? !!e.__v_raw : !1;
}
function Se(e) {
  const t = e && e.__v_raw;
  return t ? Se(t) : e;
}
function Za(e) {
  return !Ce(e, "__v_skip") && Object.isExtensible(e) && dr(e, "__v_skip", !0), e;
}
const st = (e) => qe(e) ? zr(e) : e, Ss = (e) => qe(e) ? jo(e) : e;
function lt(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function ue(e) {
  return Ga(e, !1);
}
function Ga(e, t) {
  return lt(e) ? e : new Ya(e, t);
}
class Ya {
  constructor(t, n) {
    this.dep = new Ur(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? t : Se(t), this._value = n ? t : st(t), this.__v_isShallow = n;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const n = this._rawValue, s = this.__v_isShallow || At(t) || an(t);
    t = s ? t : Se(t), rn(t, n) && (this._rawValue = t, this._value = s ? t : st(t), this.dep.trigger());
  }
}
function x(e) {
  return lt(e) ? e.value : e;
}
const Xa = {
  get: (e, t, n) => t === "__v_raw" ? e : x(Reflect.get(e, t, n)),
  set: (e, t, n, s) => {
    const r = e[t];
    return lt(r) && !lt(n) ? (r.value = n, !0) : Reflect.set(e, t, n, s);
  }
};
function Ko(e) {
  return Rn(e) ? e : new Proxy(e, Xa);
}
class Ja {
  constructor(t, n, s) {
    this.fn = t, this.setter = n, this._value = void 0, this.dep = new Ur(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Jn - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = s;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    Pe !== this)
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
function Qa(e, t, n = !1) {
  let s, r;
  return ie(e) ? s = e : (s = e.get, r = e.set), new Ja(s, r, n);
}
const us = {}, Cs = /* @__PURE__ */ new WeakMap();
let mn;
function ec(e, t = !1, n = mn) {
  if (n) {
    let s = Cs.get(n);
    s || Cs.set(n, s = []), s.push(e);
  }
}
function tc(e, t, n = Le) {
  const { immediate: s, deep: r, once: i, scheduler: o, augmentJob: l, call: a } = n, h = (z) => r ? z : At(z) || r === !1 || r === 0 ? Kt(z, 1) : Kt(z);
  let c, v, y, $, D = !1, H = !1;
  if (lt(e) ? (v = () => e.value, D = At(e)) : Rn(e) ? (v = () => h(e), D = !0) : te(e) ? (H = !0, D = e.some((z) => Rn(z) || At(z)), v = () => e.map((z) => {
    if (lt(z))
      return z.value;
    if (Rn(z))
      return h(z);
    if (ie(z))
      return a ? a(z, 2) : z();
  })) : ie(e) ? t ? v = a ? () => a(e, 2) : e : v = () => {
    if (y) {
      Yt();
      try {
        y();
      } finally {
        Xt();
      }
    }
    const z = mn;
    mn = c;
    try {
      return a ? a(e, 3, [$]) : e($);
    } finally {
      mn = z;
    }
  } : v = Nt, t && r) {
    const z = v, U = r === !0 ? 1 / 0 : r;
    v = () => Kt(z(), U);
  }
  const oe = Ea(), le = () => {
    c.stop(), oe && oe.active && Br(oe.effects, c);
  };
  if (i && t) {
    const z = t;
    t = (...U) => {
      z(...U), le();
    };
  }
  let ve = H ? new Array(e.length).fill(us) : us;
  const be = (z) => {
    if (!(!(c.flags & 1) || !c.dirty && !z))
      if (t) {
        const U = c.run();
        if (r || D || (H ? U.some((V, j) => rn(V, ve[j])) : rn(U, ve))) {
          y && y();
          const V = mn;
          mn = c;
          try {
            const j = [
              U,
              // pass undefined as the old value when it's changed for the first time
              ve === us ? void 0 : H && ve[0] === us ? [] : ve,
              $
            ];
            ve = U, a ? a(t, 3, j) : (
              // @ts-expect-error
              t(...j)
            );
          } finally {
            mn = V;
          }
        }
      } else
        c.run();
  };
  return l && l(be), c = new Oo(v), c.scheduler = o ? () => o(be, !1) : be, $ = (z) => ec(z, !1, c), y = c.onStop = () => {
    const z = Cs.get(c);
    if (z) {
      if (a)
        a(z, 4);
      else
        for (const U of z) U();
      Cs.delete(c);
    }
  }, t ? s ? be(!0) : ve = c.run() : o ? o(be.bind(null, !0), !0) : c.run(), le.pause = c.pause.bind(c), le.resume = c.resume.bind(c), le.stop = le, le;
}
function Kt(e, t = 1 / 0, n) {
  if (t <= 0 || !qe(e) || e.__v_skip || (n = n || /* @__PURE__ */ new Set(), n.has(e)))
    return e;
  if (n.add(e), t--, lt(e))
    Kt(e.value, t, n);
  else if (te(e))
    for (let s = 0; s < e.length; s++)
      Kt(e[s], t, n);
  else if (So(e) || En(e))
    e.forEach((s) => {
      Kt(s, t, n);
    });
  else if (Ao(e)) {
    for (const s in e)
      Kt(e[s], t, n);
    for (const s of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, s) && Kt(e[s], t, n);
  }
  return e;
}
/**
* @vue/runtime-core v3.5.18
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function ss(e, t, n, s) {
  try {
    return s ? e(...s) : e();
  } catch (r) {
    Ms(r, t, n);
  }
}
function qt(e, t, n, s) {
  if (ie(e)) {
    const r = ss(e, t, n, s);
    return r && Co(r) && r.catch((i) => {
      Ms(i, t, n);
    }), r;
  }
  if (te(e)) {
    const r = [];
    for (let i = 0; i < e.length; i++)
      r.push(qt(e[i], t, n, s));
    return r;
  }
}
function Ms(e, t, n, s = !0) {
  const r = t ? t.vnode : null, { errorHandler: i, throwUnhandledErrorInProduction: o } = t && t.appContext.config || Le;
  if (t) {
    let l = t.parent;
    const a = t.proxy, h = `https://vuejs.org/error-reference/#runtime-${n}`;
    for (; l; ) {
      const c = l.ec;
      if (c) {
        for (let v = 0; v < c.length; v++)
          if (c[v](e, a, h) === !1)
            return;
      }
      l = l.parent;
    }
    if (i) {
      Yt(), ss(i, null, 10, [
        e,
        a,
        h
      ]), Xt();
      return;
    }
  }
  nc(e, n, r, s, o);
}
function nc(e, t, n, s = !0, r = !1) {
  if (r)
    throw e;
  console.error(e);
}
const ht = [];
let Ft = -1;
const In = [];
let tn = null, Cn = 0;
const Zo = /* @__PURE__ */ Promise.resolve();
let Ts = null;
function Go(e) {
  const t = Ts || Zo;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function sc(e) {
  let t = Ft + 1, n = ht.length;
  for (; t < n; ) {
    const s = t + n >>> 1, r = ht[s], i = es(r);
    i < e || i === e && r.flags & 2 ? t = s + 1 : n = s;
  }
  return t;
}
function jr(e) {
  if (!(e.flags & 1)) {
    const t = es(e), n = ht[ht.length - 1];
    !n || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= es(n) ? ht.push(e) : ht.splice(sc(t), 0, e), e.flags |= 1, Yo();
  }
}
function Yo() {
  Ts || (Ts = Zo.then(Jo));
}
function rc(e) {
  te(e) ? In.push(...e) : tn && e.id === -1 ? tn.splice(Cn + 1, 0, e) : e.flags & 1 || (In.push(e), e.flags |= 1), Yo();
}
function Ni(e, t, n = Ft + 1) {
  for (; n < ht.length; n++) {
    const s = ht[n];
    if (s && s.flags & 2) {
      if (e && s.id !== e.uid)
        continue;
      ht.splice(n, 1), n--, s.flags & 4 && (s.flags &= -2), s(), s.flags & 4 || (s.flags &= -2);
    }
  }
}
function Xo(e) {
  if (In.length) {
    const t = [...new Set(In)].sort(
      (n, s) => es(n) - es(s)
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
const es = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function Jo(e) {
  try {
    for (Ft = 0; Ft < ht.length; Ft++) {
      const t = ht[Ft];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), ss(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; Ft < ht.length; Ft++) {
      const t = ht[Ft];
      t && (t.flags &= -2);
    }
    Ft = -1, ht.length = 0, Xo(), Ts = null, (ht.length || In.length) && Jo();
  }
}
let Tt = null, Qo = null;
function As(e) {
  const t = Tt;
  return Tt = e, Qo = e && e.type.__scopeId || null, t;
}
function ic(e, t = Tt, n) {
  if (!t || e._n)
    return e;
  const s = (...r) => {
    s._d && ji(-1);
    const i = As(t);
    let o;
    try {
      o = e(...r);
    } finally {
      As(i), s._d && ji(1);
    }
    return o;
  };
  return s._n = !0, s._c = !0, s._d = !0, s;
}
function hn(e, t) {
  if (Tt === null)
    return e;
  const n = Hs(Tt), s = e.dirs || (e.dirs = []);
  for (let r = 0; r < t.length; r++) {
    let [i, o, l, a = Le] = t[r];
    i && (ie(i) && (i = {
      mounted: i,
      updated: i
    }), i.deep && Kt(o), s.push({
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
    a && (Yt(), qt(a, n, 8, [
      e.el,
      l,
      e,
      t
    ]), Xt());
  }
}
const oc = Symbol("_vte"), lc = (e) => e.__isTeleport;
function Kr(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, Kr(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function ac(e, t) {
  return ie(e) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    at({ name: e.name }, t, { setup: e })
  ) : e;
}
function el(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
function Kn(e, t, n, s, r = !1) {
  if (te(e)) {
    e.forEach(
      (D, H) => Kn(
        D,
        t && (te(t) ? t[H] : t),
        n,
        s,
        r
      )
    );
    return;
  }
  if (Zn(s) && !r) {
    s.shapeFlag & 512 && s.type.__asyncResolved && s.component.subTree.component && Kn(e, t, n, s.component.subTree);
    return;
  }
  const i = s.shapeFlag & 4 ? Hs(s.component) : s.el, o = r ? null : i, { i: l, r: a } = e, h = t && t.r, c = l.refs === Le ? l.refs = {} : l.refs, v = l.setupState, y = Se(v), $ = v === Le ? () => !1 : (D) => Ce(y, D);
  if (h != null && h !== a && (Ze(h) ? (c[h] = null, $(h) && (v[h] = null)) : lt(h) && (h.value = null)), ie(a))
    ss(a, l, 12, [o, c]);
  else {
    const D = Ze(a), H = lt(a);
    if (D || H) {
      const oe = () => {
        if (e.f) {
          const le = D ? $(a) ? v[a] : c[a] : a.value;
          r ? te(le) && Br(le, i) : te(le) ? le.includes(i) || le.push(i) : D ? (c[a] = [i], $(a) && (v[a] = c[a])) : (a.value = [i], e.k && (c[e.k] = a.value));
        } else D ? (c[a] = o, $(a) && (v[a] = o)) : H && (a.value = o, e.k && (c[e.k] = o));
      };
      o ? (oe.id = -1, wt(oe, n)) : oe();
    }
  }
}
Bs().requestIdleCallback;
Bs().cancelIdleCallback;
const Zn = (e) => !!e.type.__asyncLoader, tl = (e) => e.type.__isKeepAlive;
function cc(e, t) {
  nl(e, "a", t);
}
function uc(e, t) {
  nl(e, "da", t);
}
function nl(e, t, n = dt) {
  const s = e.__wdc || (e.__wdc = () => {
    let r = n;
    for (; r; ) {
      if (r.isDeactivated)
        return;
      r = r.parent;
    }
    return e();
  });
  if (Ds(t, s, n), n) {
    let r = n.parent;
    for (; r && r.parent; )
      tl(r.parent.vnode) && fc(s, t, n, r), r = r.parent;
  }
}
function fc(e, t, n, s) {
  const r = Ds(
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
function Ds(e, t, n = dt, s = !1) {
  if (n) {
    const r = n[e] || (n[e] = []), i = t.__weh || (t.__weh = (...o) => {
      Yt();
      const l = rs(n), a = qt(t, n, e, o);
      return l(), Xt(), a;
    });
    return s ? r.unshift(i) : r.push(i), i;
  }
}
const Jt = (e) => (t, n = dt) => {
  (!ns || e === "sp") && Ds(e, (...s) => t(...s), n);
}, hc = Jt("bm"), sl = Jt("m"), dc = Jt(
  "bu"
), pc = Jt("u"), gc = Jt(
  "bum"
), Zr = Jt("um"), mc = Jt(
  "sp"
), _c = Jt("rtg"), yc = Jt("rtc");
function vc(e, t = dt) {
  Ds("ec", e, t);
}
const bc = Symbol.for("v-ndc");
function St(e, t, n, s) {
  let r;
  const i = n, o = te(e);
  if (o || Ze(e)) {
    const l = o && Rn(e);
    let a = !1, h = !1;
    l && (a = !At(e), h = an(e), e = Ns(e)), r = new Array(e.length);
    for (let c = 0, v = e.length; c < v; c++)
      r[c] = t(
        a ? h ? Ss(st(e[c])) : st(e[c]) : e[c],
        c,
        void 0,
        i
      );
  } else if (typeof e == "number") {
    r = new Array(e);
    for (let l = 0; l < e; l++)
      r[l] = t(l + 1, l, void 0, i);
  } else if (qe(e))
    if (e[Symbol.iterator])
      r = Array.from(
        e,
        (l, a) => t(l, a, void 0, i)
      );
    else {
      const l = Object.keys(e);
      r = new Array(l.length);
      for (let a = 0, h = l.length; a < h; a++) {
        const c = l[a];
        r[a] = t(e[c], c, a, i);
      }
    }
  else
    r = [];
  return r;
}
const vr = (e) => e ? Sl(e) ? Hs(e) : vr(e.parent) : null, Gn = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ at(/* @__PURE__ */ Object.create(null), {
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
    $watch: (e) => Hc.bind(e)
  })
), nr = (e, t) => e !== Le && !e.__isScriptSetup && Ce(e, t), wc = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: n, setupState: s, data: r, props: i, accessCache: o, type: l, appContext: a } = e;
    let h;
    if (t[0] !== "$") {
      const $ = o[t];
      if ($ !== void 0)
        switch ($) {
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
        if (r !== Le && Ce(r, t))
          return o[t] = 2, r[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (h = e.propsOptions[0]) && Ce(h, t)
        )
          return o[t] = 3, i[t];
        if (n !== Le && Ce(n, t))
          return o[t] = 4, n[t];
        br && (o[t] = 0);
      }
    }
    const c = Gn[t];
    let v, y;
    if (c)
      return t === "$attrs" && ot(e.attrs, "get", ""), c(e);
    if (
      // css module (injected by vue-loader)
      (v = l.__cssModules) && (v = v[t])
    )
      return v;
    if (n !== Le && Ce(n, t))
      return o[t] = 4, n[t];
    if (
      // global properties
      y = a.config.globalProperties, Ce(y, t)
    )
      return y[t];
  },
  set({ _: e }, t, n) {
    const { data: s, setupState: r, ctx: i } = e;
    return nr(r, t) ? (r[t] = n, !0) : s !== Le && Ce(s, t) ? (s[t] = n, !0) : Ce(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (i[t] = n, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: n, ctx: s, appContext: r, propsOptions: i }
  }, o) {
    let l;
    return !!n[o] || e !== Le && Ce(e, o) || nr(t, o) || (l = i[0]) && Ce(l, o) || Ce(s, o) || Ce(Gn, o) || Ce(r.config.globalProperties, o);
  },
  defineProperty(e, t, n) {
    return n.get != null ? e._.accessCache[t] = 0 : Ce(n, "value") && this.set(e, t, n.value, null), Reflect.defineProperty(e, t, n);
  }
};
function Mi(e) {
  return te(e) ? e.reduce(
    (t, n) => (t[n] = null, t),
    {}
  ) : e;
}
let br = !0;
function kc(e) {
  const t = il(e), n = e.proxy, s = e.ctx;
  br = !1, t.beforeCreate && Di(t.beforeCreate, e, "bc");
  const {
    // state
    data: r,
    computed: i,
    methods: o,
    watch: l,
    provide: a,
    inject: h,
    // lifecycle
    created: c,
    beforeMount: v,
    mounted: y,
    beforeUpdate: $,
    updated: D,
    activated: H,
    deactivated: oe,
    beforeDestroy: le,
    beforeUnmount: ve,
    destroyed: be,
    unmounted: z,
    render: U,
    renderTracked: V,
    renderTriggered: j,
    errorCaptured: we,
    serverPrefetch: Ue,
    // public API
    expose: $e,
    inheritAttrs: He,
    // assets
    components: fe,
    directives: ze,
    filters: Ve
  } = t;
  if (h && xc(h, s, null), o)
    for (const se in o) {
      const K = o[se];
      ie(K) && (s[se] = K.bind(n));
    }
  if (r) {
    const se = r.call(n, n);
    qe(se) && (e.data = zr(se));
  }
  if (br = !0, i)
    for (const se in i) {
      const K = i[se], Re = ie(K) ? K.bind(n, n) : ie(K.get) ? K.get.bind(n, n) : Nt, q = !ie(K) && ie(K.set) ? K.set.bind(n) : Nt, de = We({
        get: Re,
        set: q
      });
      Object.defineProperty(s, se, {
        enumerable: !0,
        configurable: !0,
        get: () => de.value,
        set: (M) => de.value = M
      });
    }
  if (l)
    for (const se in l)
      rl(l[se], s, n, se);
  if (a) {
    const se = ie(a) ? a.call(n) : a;
    Reflect.ownKeys(se).forEach((K) => {
      Rc(K, se[K]);
    });
  }
  c && Di(c, e, "c");
  function J(se, K) {
    te(K) ? K.forEach((Re) => se(Re.bind(n))) : K && se(K.bind(n));
  }
  if (J(hc, v), J(sl, y), J(dc, $), J(pc, D), J(cc, H), J(uc, oe), J(vc, we), J(yc, V), J(_c, j), J(gc, ve), J(Zr, z), J(mc, Ue), te($e))
    if ($e.length) {
      const se = e.exposed || (e.exposed = {});
      $e.forEach((K) => {
        Object.defineProperty(se, K, {
          get: () => n[K],
          set: (Re) => n[K] = Re,
          enumerable: !0
        });
      });
    } else e.exposed || (e.exposed = {});
  U && e.render === Nt && (e.render = U), He != null && (e.inheritAttrs = He), fe && (e.components = fe), ze && (e.directives = ze), Ue && el(e);
}
function xc(e, t, n = Nt) {
  te(e) && (e = wr(e));
  for (const s in e) {
    const r = e[s];
    let i;
    qe(r) ? "default" in r ? i = gs(
      r.from || s,
      r.default,
      !0
    ) : i = gs(r.from || s) : i = gs(r), lt(i) ? Object.defineProperty(t, s, {
      enumerable: !0,
      configurable: !0,
      get: () => i.value,
      set: (o) => i.value = o
    }) : t[s] = i;
  }
}
function Di(e, t, n) {
  qt(
    te(e) ? e.map((s) => s.bind(t.proxy)) : e.bind(t.proxy),
    t,
    n
  );
}
function rl(e, t, n, s) {
  let r = s.includes(".") ? yl(n, s) : () => n[s];
  if (Ze(e)) {
    const i = t[e];
    ie(i) && sn(r, i);
  } else if (ie(e))
    sn(r, e.bind(n));
  else if (qe(e))
    if (te(e))
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
    (h) => Es(a, h, o, !0)
  ), Es(a, t, o)), qe(t) && i.set(t, a), a;
}
function Es(e, t, n, s = !1) {
  const { mixins: r, extends: i } = t;
  i && Es(e, i, n, !0), r && r.forEach(
    (o) => Es(e, o, n, !0)
  );
  for (const o in t)
    if (!(s && o === "expose")) {
      const l = Sc[o] || n && n[o];
      e[o] = l ? l(e[o], t[o]) : t[o];
    }
  return e;
}
const Sc = {
  data: qi,
  props: Ui,
  emits: Ui,
  // objects
  methods: Hn,
  computed: Hn,
  // lifecycle
  beforeCreate: ft,
  created: ft,
  beforeMount: ft,
  mounted: ft,
  beforeUpdate: ft,
  updated: ft,
  beforeDestroy: ft,
  beforeUnmount: ft,
  destroyed: ft,
  unmounted: ft,
  activated: ft,
  deactivated: ft,
  errorCaptured: ft,
  serverPrefetch: ft,
  // assets
  components: Hn,
  directives: Hn,
  // watch
  watch: Tc,
  // provide / inject
  provide: qi,
  inject: Cc
};
function qi(e, t) {
  return t ? e ? function() {
    return at(
      ie(e) ? e.call(this, this) : e,
      ie(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function Cc(e, t) {
  return Hn(wr(e), wr(t));
}
function wr(e) {
  if (te(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++)
      t[e[n]] = e[n];
    return t;
  }
  return e;
}
function ft(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function Hn(e, t) {
  return e ? at(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function Ui(e, t) {
  return e ? te(e) && te(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : at(
    /* @__PURE__ */ Object.create(null),
    Mi(e),
    Mi(t ?? {})
  ) : t;
}
function Tc(e, t) {
  if (!e) return t;
  if (!t) return e;
  const n = at(/* @__PURE__ */ Object.create(null), e);
  for (const s in t)
    n[s] = ft(e[s], t[s]);
  return n;
}
function ol() {
  return {
    app: null,
    config: {
      isNativeTag: ma,
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
let Ac = 0;
function Ec(e, t) {
  return function(s, r = null) {
    ie(s) || (s = at({}, s)), r != null && !qe(r) && (r = null);
    const i = ol(), o = /* @__PURE__ */ new WeakSet(), l = [];
    let a = !1;
    const h = i.app = {
      _uid: Ac++,
      _component: s,
      _props: r,
      _container: null,
      _context: i,
      _instance: null,
      version: fu,
      get config() {
        return i.config;
      },
      set config(c) {
      },
      use(c, ...v) {
        return o.has(c) || (c && ie(c.install) ? (o.add(c), c.install(h, ...v)) : ie(c) && (o.add(c), c(h, ...v))), h;
      },
      mixin(c) {
        return i.mixins.includes(c) || i.mixins.push(c), h;
      },
      component(c, v) {
        return v ? (i.components[c] = v, h) : i.components[c];
      },
      directive(c, v) {
        return v ? (i.directives[c] = v, h) : i.directives[c];
      },
      mount(c, v, y) {
        if (!a) {
          const $ = h._ceVNode || Mt(s, r);
          return $.appContext = i, y === !0 ? y = "svg" : y === !1 && (y = void 0), e($, c, y), a = !0, h._container = c, c.__vue_app__ = h, Hs($.component);
        }
      },
      onUnmount(c) {
        l.push(c);
      },
      unmount() {
        a && (qt(
          l,
          h._instance,
          16
        ), e(null, h._container), delete h._container.__vue_app__);
      },
      provide(c, v) {
        return i.provides[c] = v, h;
      },
      runWithContext(c) {
        const v = Ln;
        Ln = h;
        try {
          return c();
        } finally {
          Ln = v;
        }
      }
    };
    return h;
  };
}
let Ln = null;
function Rc(e, t) {
  if (dt) {
    let n = dt.provides;
    const s = dt.parent && dt.parent.provides;
    s === n && (n = dt.provides = Object.create(s)), n[e] = t;
  }
}
function gs(e, t, n = !1) {
  const s = iu();
  if (s || Ln) {
    let r = Ln ? Ln._context.provides : s ? s.parent == null || s.ce ? s.vnode.appContext && s.vnode.appContext.provides : s.parent.provides : void 0;
    if (r && e in r)
      return r[e];
    if (arguments.length > 1)
      return n && ie(t) ? t.call(s && s.proxy) : t;
  }
}
const ll = {}, al = () => Object.create(ll), cl = (e) => Object.getPrototypeOf(e) === ll;
function Ic(e, t, n, s = !1) {
  const r = {}, i = al();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), ul(e, t, r, i);
  for (const o in e.propsOptions[0])
    o in r || (r[o] = void 0);
  n ? e.props = s ? r : Ka(r) : e.type.props ? e.props = r : e.props = i, e.attrs = i;
}
function Lc(e, t, n, s) {
  const {
    props: r,
    attrs: i,
    vnode: { patchFlag: o }
  } = e, l = Se(r), [a] = e.propsOptions;
  let h = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (s || o > 0) && !(o & 16)
  ) {
    if (o & 8) {
      const c = e.vnode.dynamicProps;
      for (let v = 0; v < c.length; v++) {
        let y = c[v];
        if (qs(e.emitsOptions, y))
          continue;
        const $ = t[y];
        if (a)
          if (Ce(i, y))
            $ !== i[y] && (i[y] = $, h = !0);
          else {
            const D = ln(y);
            r[D] = kr(
              a,
              l,
              D,
              $,
              e,
              !1
            );
          }
        else
          $ !== i[y] && (i[y] = $, h = !0);
      }
    }
  } else {
    ul(e, t, r, i) && (h = !0);
    let c;
    for (const v in l)
      (!t || // for camelCase
      !Ce(t, v) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((c = fn(v)) === v || !Ce(t, c))) && (a ? n && // for camelCase
      (n[v] !== void 0 || // for kebab-case
      n[c] !== void 0) && (r[v] = kr(
        a,
        l,
        v,
        void 0,
        e,
        !0
      )) : delete r[v]);
    if (i !== l)
      for (const v in i)
        (!t || !Ce(t, v)) && (delete i[v], h = !0);
  }
  h && jt(e.attrs, "set", "");
}
function ul(e, t, n, s) {
  const [r, i] = e.propsOptions;
  let o = !1, l;
  if (t)
    for (let a in t) {
      if (Vn(a))
        continue;
      const h = t[a];
      let c;
      r && Ce(r, c = ln(a)) ? !i || !i.includes(c) ? n[c] = h : (l || (l = {}))[c] = h : qs(e.emitsOptions, a) || (!(a in s) || h !== s[a]) && (s[a] = h, o = !0);
    }
  if (i) {
    const a = Se(n), h = l || Le;
    for (let c = 0; c < i.length; c++) {
      const v = i[c];
      n[v] = kr(
        r,
        a,
        v,
        h[v],
        e,
        !Ce(h, v)
      );
    }
  }
  return o;
}
function kr(e, t, n, s, r, i) {
  const o = e[n];
  if (o != null) {
    const l = Ce(o, "default");
    if (l && s === void 0) {
      const a = o.default;
      if (o.type !== Function && !o.skipFactory && ie(a)) {
        const { propsDefaults: h } = r;
        if (n in h)
          s = h[n];
        else {
          const c = rs(r);
          s = h[n] = a.call(
            null,
            t
          ), c();
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
const Oc = /* @__PURE__ */ new WeakMap();
function fl(e, t, n = !1) {
  const s = n ? Oc : t.propsCache, r = s.get(e);
  if (r)
    return r;
  const i = e.props, o = {}, l = [];
  let a = !1;
  if (!ie(e)) {
    const c = (v) => {
      a = !0;
      const [y, $] = fl(v, t, !0);
      at(o, y), $ && l.push(...$);
    };
    !n && t.mixins.length && t.mixins.forEach(c), e.extends && c(e.extends), e.mixins && e.mixins.forEach(c);
  }
  if (!i && !a)
    return qe(e) && s.set(e, An), An;
  if (te(i))
    for (let c = 0; c < i.length; c++) {
      const v = ln(i[c]);
      Hi(v) && (o[v] = Le);
    }
  else if (i)
    for (const c in i) {
      const v = ln(c);
      if (Hi(v)) {
        const y = i[c], $ = o[v] = te(y) || ie(y) ? { type: y } : at({}, y), D = $.type;
        let H = !1, oe = !0;
        if (te(D))
          for (let le = 0; le < D.length; ++le) {
            const ve = D[le], be = ie(ve) && ve.name;
            if (be === "Boolean") {
              H = !0;
              break;
            } else be === "String" && (oe = !1);
          }
        else
          H = ie(D) && D.name === "Boolean";
        $[
          0
          /* shouldCast */
        ] = H, $[
          1
          /* shouldCastTrue */
        ] = oe, (H || Ce($, "default")) && l.push(v);
      }
    }
  const h = [o, l];
  return qe(e) && s.set(e, h), h;
}
function Hi(e) {
  return e[0] !== "$" && !Vn(e);
}
const Gr = (e) => e === "_" || e === "__" || e === "_ctx" || e === "$stable", Yr = (e) => te(e) ? e.map(Bt) : [Bt(e)], Pc = (e, t, n) => {
  if (t._n)
    return t;
  const s = ic((...r) => Yr(t(...r)), n);
  return s._c = !1, s;
}, hl = (e, t, n) => {
  const s = e._ctx;
  for (const r in e) {
    if (Gr(r)) continue;
    const i = e[r];
    if (ie(i))
      t[r] = Pc(r, i, s);
    else if (i != null) {
      const o = Yr(i);
      t[r] = () => o;
    }
  }
}, dl = (e, t) => {
  const n = Yr(t);
  e.slots.default = () => n;
}, pl = (e, t, n) => {
  for (const s in t)
    (n || !Gr(s)) && (e[s] = t[s]);
}, $c = (e, t, n) => {
  const s = e.slots = al();
  if (e.vnode.shapeFlag & 32) {
    const r = t.__;
    r && dr(s, "__", r, !0);
    const i = t._;
    i ? (pl(s, t, n), n && dr(s, "_", i, !0)) : hl(t, s);
  } else t && dl(e, t);
}, Fc = (e, t, n) => {
  const { vnode: s, slots: r } = e;
  let i = !0, o = Le;
  if (s.shapeFlag & 32) {
    const l = t._;
    l ? n && l === 1 ? i = !1 : pl(r, t, n) : (i = !t.$stable, hl(t, r)), o = t;
  } else t && (dl(e, t), o = { default: 1 });
  if (i)
    for (const l in r)
      !Gr(l) && o[l] == null && delete r[l];
}, wt = Gc;
function Bc(e) {
  return Nc(e);
}
function Nc(e, t) {
  const n = Bs();
  n.__VUE__ = !0;
  const {
    insert: s,
    remove: r,
    patchProp: i,
    createElement: o,
    createText: l,
    createComment: a,
    setText: h,
    setElementText: c,
    parentNode: v,
    nextSibling: y,
    setScopeId: $ = Nt,
    insertStaticContent: D
  } = e, H = (d, p, w, I = null, A = null, T = null, F = void 0, N = null, P = !!p.dynamicChildren) => {
    if (d === p)
      return;
    d && !Nn(d, p) && (I = ct(d), M(d, A, T, !0), d = null), p.patchFlag === -2 && (P = !1, p.dynamicChildren = null);
    const { type: L, ref: Z, shapeFlag: B } = p;
    switch (L) {
      case Us:
        oe(d, p, w, I);
        break;
      case cn:
        le(d, p, w, I);
        break;
      case ms:
        d == null && ve(p, w, I, F);
        break;
      case De:
        fe(
          d,
          p,
          w,
          I,
          A,
          T,
          F,
          N,
          P
        );
        break;
      default:
        B & 1 ? U(
          d,
          p,
          w,
          I,
          A,
          T,
          F,
          N,
          P
        ) : B & 6 ? ze(
          d,
          p,
          w,
          I,
          A,
          T,
          F,
          N,
          P
        ) : (B & 64 || B & 128) && L.process(
          d,
          p,
          w,
          I,
          A,
          T,
          F,
          N,
          P,
          tt
        );
    }
    Z != null && A ? Kn(Z, d && d.ref, T, p || d, !p) : Z == null && d && d.ref != null && Kn(d.ref, null, T, d, !0);
  }, oe = (d, p, w, I) => {
    if (d == null)
      s(
        p.el = l(p.children),
        w,
        I
      );
    else {
      const A = p.el = d.el;
      p.children !== d.children && h(A, p.children);
    }
  }, le = (d, p, w, I) => {
    d == null ? s(
      p.el = a(p.children || ""),
      w,
      I
    ) : p.el = d.el;
  }, ve = (d, p, w, I) => {
    [d.el, d.anchor] = D(
      d.children,
      p,
      w,
      I,
      d.el,
      d.anchor
    );
  }, be = ({ el: d, anchor: p }, w, I) => {
    let A;
    for (; d && d !== p; )
      A = y(d), s(d, w, I), d = A;
    s(p, w, I);
  }, z = ({ el: d, anchor: p }) => {
    let w;
    for (; d && d !== p; )
      w = y(d), r(d), d = w;
    r(p);
  }, U = (d, p, w, I, A, T, F, N, P) => {
    p.type === "svg" ? F = "svg" : p.type === "math" && (F = "mathml"), d == null ? V(
      p,
      w,
      I,
      A,
      T,
      F,
      N,
      P
    ) : Ue(
      d,
      p,
      A,
      T,
      F,
      N,
      P
    );
  }, V = (d, p, w, I, A, T, F, N) => {
    let P, L;
    const { props: Z, shapeFlag: B, transition: G, dirs: Q } = d;
    if (P = d.el = o(
      d.type,
      T,
      Z && Z.is,
      Z
    ), B & 8 ? c(P, d.children) : B & 16 && we(
      d.children,
      P,
      null,
      I,
      A,
      sr(d, T),
      F,
      N
    ), Q && dn(d, null, I, "created"), j(P, d, d.scopeId, F, I), Z) {
      for (const ke in Z)
        ke !== "value" && !Vn(ke) && i(P, ke, null, Z[ke], T, I);
      "value" in Z && i(P, "value", null, Z.value, T), (L = Z.onVnodeBeforeMount) && Pt(L, I, d);
    }
    Q && dn(d, null, I, "beforeMount");
    const ae = Mc(A, G);
    ae && G.beforeEnter(P), s(P, p, w), ((L = Z && Z.onVnodeMounted) || ae || Q) && wt(() => {
      L && Pt(L, I, d), ae && G.enter(P), Q && dn(d, null, I, "mounted");
    }, A);
  }, j = (d, p, w, I, A) => {
    if (w && $(d, w), I)
      for (let T = 0; T < I.length; T++)
        $(d, I[T]);
    if (A) {
      let T = A.subTree;
      if (p === T || bl(T.type) && (T.ssContent === p || T.ssFallback === p)) {
        const F = A.vnode;
        j(
          d,
          F,
          F.scopeId,
          F.slotScopeIds,
          A.parent
        );
      }
    }
  }, we = (d, p, w, I, A, T, F, N, P = 0) => {
    for (let L = P; L < d.length; L++) {
      const Z = d[L] = N ? nn(d[L]) : Bt(d[L]);
      H(
        null,
        Z,
        p,
        w,
        I,
        A,
        T,
        F,
        N
      );
    }
  }, Ue = (d, p, w, I, A, T, F) => {
    const N = p.el = d.el;
    let { patchFlag: P, dynamicChildren: L, dirs: Z } = p;
    P |= d.patchFlag & 16;
    const B = d.props || Le, G = p.props || Le;
    let Q;
    if (w && pn(w, !1), (Q = G.onVnodeBeforeUpdate) && Pt(Q, w, p, d), Z && dn(p, d, w, "beforeUpdate"), w && pn(w, !0), (B.innerHTML && G.innerHTML == null || B.textContent && G.textContent == null) && c(N, ""), L ? $e(
      d.dynamicChildren,
      L,
      N,
      w,
      I,
      sr(p, A),
      T
    ) : F || K(
      d,
      p,
      N,
      null,
      w,
      I,
      sr(p, A),
      T,
      !1
    ), P > 0) {
      if (P & 16)
        He(N, B, G, w, A);
      else if (P & 2 && B.class !== G.class && i(N, "class", null, G.class, A), P & 4 && i(N, "style", B.style, G.style, A), P & 8) {
        const ae = p.dynamicProps;
        for (let ke = 0; ke < ae.length; ke++) {
          const he = ae[ke], je = B[he], Oe = G[he];
          (Oe !== je || he === "value") && i(N, he, je, Oe, A, w);
        }
      }
      P & 1 && d.children !== p.children && c(N, p.children);
    } else !F && L == null && He(N, B, G, w, A);
    ((Q = G.onVnodeUpdated) || Z) && wt(() => {
      Q && Pt(Q, w, p, d), Z && dn(p, d, w, "updated");
    }, I);
  }, $e = (d, p, w, I, A, T, F) => {
    for (let N = 0; N < p.length; N++) {
      const P = d[N], L = p[N], Z = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        P.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (P.type === De || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !Nn(P, L) || // - In the case of a component, it could contain anything.
        P.shapeFlag & 198) ? v(P.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          w
        )
      );
      H(
        P,
        L,
        Z,
        null,
        I,
        A,
        T,
        F,
        !0
      );
    }
  }, He = (d, p, w, I, A) => {
    if (p !== w) {
      if (p !== Le)
        for (const T in p)
          !Vn(T) && !(T in w) && i(
            d,
            T,
            p[T],
            null,
            A,
            I
          );
      for (const T in w) {
        if (Vn(T)) continue;
        const F = w[T], N = p[T];
        F !== N && T !== "value" && i(d, T, N, F, A, I);
      }
      "value" in w && i(d, "value", p.value, w.value, A);
    }
  }, fe = (d, p, w, I, A, T, F, N, P) => {
    const L = p.el = d ? d.el : l(""), Z = p.anchor = d ? d.anchor : l("");
    let { patchFlag: B, dynamicChildren: G, slotScopeIds: Q } = p;
    Q && (N = N ? N.concat(Q) : Q), d == null ? (s(L, w, I), s(Z, w, I), we(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      p.children || [],
      w,
      Z,
      A,
      T,
      F,
      N,
      P
    )) : B > 0 && B & 64 && G && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    d.dynamicChildren ? ($e(
      d.dynamicChildren,
      G,
      w,
      A,
      T,
      F,
      N
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (p.key != null || A && p === A.subTree) && gl(
      d,
      p,
      !0
      /* shallow */
    )) : K(
      d,
      p,
      w,
      Z,
      A,
      T,
      F,
      N,
      P
    );
  }, ze = (d, p, w, I, A, T, F, N, P) => {
    p.slotScopeIds = N, d == null ? p.shapeFlag & 512 ? A.ctx.activate(
      p,
      w,
      I,
      F,
      P
    ) : Ve(
      p,
      w,
      I,
      A,
      T,
      F,
      P
    ) : Ge(d, p, P);
  }, Ve = (d, p, w, I, A, T, F) => {
    const N = d.component = ru(
      d,
      I,
      A
    );
    if (tl(d) && (N.ctx.renderer = tt), ou(N, !1, F), N.asyncDep) {
      if (A && A.registerDep(N, J, F), !d.el) {
        const P = N.subTree = Mt(cn);
        le(null, P, p, w), d.placeholder = P.el;
      }
    } else
      J(
        N,
        d,
        p,
        w,
        A,
        T,
        F
      );
  }, Ge = (d, p, w) => {
    const I = p.component = d.component;
    if (Kc(d, p, w))
      if (I.asyncDep && !I.asyncResolved) {
        se(I, p, w);
        return;
      } else
        I.next = p, I.update();
    else
      p.el = d.el, I.vnode = p;
  }, J = (d, p, w, I, A, T, F) => {
    const N = () => {
      if (d.isMounted) {
        let { next: B, bu: G, u: Q, parent: ae, vnode: ke } = d;
        {
          const u = ml(d);
          if (u) {
            B && (B.el = ke.el, se(d, B, F)), u.asyncDep.then(() => {
              d.isUnmounted || N();
            });
            return;
          }
        }
        let he = B, je;
        pn(d, !1), B ? (B.el = ke.el, se(d, B, F)) : B = ke, G && ps(G), (je = B.props && B.props.onVnodeBeforeUpdate) && Pt(je, ae, B, ke), pn(d, !0);
        const Oe = Vi(d), rt = d.subTree;
        d.subTree = Oe, H(
          rt,
          Oe,
          // parent may have changed if it's in a teleport
          v(rt.el),
          // anchor may have changed if it's in a fragment
          ct(rt),
          d,
          A,
          T
        ), B.el = Oe.el, he === null && Zc(d, Oe.el), Q && wt(Q, A), (je = B.props && B.props.onVnodeUpdated) && wt(
          () => Pt(je, ae, B, ke),
          A
        );
      } else {
        let B;
        const { el: G, props: Q } = p, { bm: ae, m: ke, parent: he, root: je, type: Oe } = d, rt = Zn(p);
        pn(d, !1), ae && ps(ae), !rt && (B = Q && Q.onVnodeBeforeMount) && Pt(B, he, p), pn(d, !0);
        {
          je.ce && // @ts-expect-error _def is private
          je.ce._def.shadowRoot !== !1 && je.ce._injectChildStyle(Oe);
          const u = d.subTree = Vi(d);
          H(
            null,
            u,
            w,
            I,
            d,
            A,
            T
          ), p.el = u.el;
        }
        if (ke && wt(ke, A), !rt && (B = Q && Q.onVnodeMounted)) {
          const u = p;
          wt(
            () => Pt(B, he, u),
            A
          );
        }
        (p.shapeFlag & 256 || he && Zn(he.vnode) && he.vnode.shapeFlag & 256) && d.a && wt(d.a, A), d.isMounted = !0, p = w = I = null;
      }
    };
    d.scope.on();
    const P = d.effect = new Oo(N);
    d.scope.off();
    const L = d.update = P.run.bind(P), Z = d.job = P.runIfDirty.bind(P);
    Z.i = d, Z.id = d.uid, P.scheduler = () => jr(Z), pn(d, !0), L();
  }, se = (d, p, w) => {
    p.component = d;
    const I = d.vnode.props;
    d.vnode = p, d.next = null, Lc(d, p.props, I, w), Fc(d, p.children, w), Yt(), Ni(d), Xt();
  }, K = (d, p, w, I, A, T, F, N, P = !1) => {
    const L = d && d.children, Z = d ? d.shapeFlag : 0, B = p.children, { patchFlag: G, shapeFlag: Q } = p;
    if (G > 0) {
      if (G & 128) {
        q(
          L,
          B,
          w,
          I,
          A,
          T,
          F,
          N,
          P
        );
        return;
      } else if (G & 256) {
        Re(
          L,
          B,
          w,
          I,
          A,
          T,
          F,
          N,
          P
        );
        return;
      }
    }
    Q & 8 ? (Z & 16 && et(L, A, T), B !== L && c(w, B)) : Z & 16 ? Q & 16 ? q(
      L,
      B,
      w,
      I,
      A,
      T,
      F,
      N,
      P
    ) : et(L, A, T, !0) : (Z & 8 && c(w, ""), Q & 16 && we(
      B,
      w,
      I,
      A,
      T,
      F,
      N,
      P
    ));
  }, Re = (d, p, w, I, A, T, F, N, P) => {
    d = d || An, p = p || An;
    const L = d.length, Z = p.length, B = Math.min(L, Z);
    let G;
    for (G = 0; G < B; G++) {
      const Q = p[G] = P ? nn(p[G]) : Bt(p[G]);
      H(
        d[G],
        Q,
        w,
        null,
        A,
        T,
        F,
        N,
        P
      );
    }
    L > Z ? et(
      d,
      A,
      T,
      !0,
      !1,
      B
    ) : we(
      p,
      w,
      I,
      A,
      T,
      F,
      N,
      P,
      B
    );
  }, q = (d, p, w, I, A, T, F, N, P) => {
    let L = 0;
    const Z = p.length;
    let B = d.length - 1, G = Z - 1;
    for (; L <= B && L <= G; ) {
      const Q = d[L], ae = p[L] = P ? nn(p[L]) : Bt(p[L]);
      if (Nn(Q, ae))
        H(
          Q,
          ae,
          w,
          null,
          A,
          T,
          F,
          N,
          P
        );
      else
        break;
      L++;
    }
    for (; L <= B && L <= G; ) {
      const Q = d[B], ae = p[G] = P ? nn(p[G]) : Bt(p[G]);
      if (Nn(Q, ae))
        H(
          Q,
          ae,
          w,
          null,
          A,
          T,
          F,
          N,
          P
        );
      else
        break;
      B--, G--;
    }
    if (L > B) {
      if (L <= G) {
        const Q = G + 1, ae = Q < Z ? p[Q].el : I;
        for (; L <= G; )
          H(
            null,
            p[L] = P ? nn(p[L]) : Bt(p[L]),
            w,
            ae,
            A,
            T,
            F,
            N,
            P
          ), L++;
      }
    } else if (L > G)
      for (; L <= B; )
        M(d[L], A, T, !0), L++;
    else {
      const Q = L, ae = L, ke = /* @__PURE__ */ new Map();
      for (L = ae; L <= G; L++) {
        const k = p[L] = P ? nn(p[L]) : Bt(p[L]);
        k.key != null && ke.set(k.key, L);
      }
      let he, je = 0;
      const Oe = G - ae + 1;
      let rt = !1, u = 0;
      const g = new Array(Oe);
      for (L = 0; L < Oe; L++) g[L] = 0;
      for (L = Q; L <= B; L++) {
        const k = d[L];
        if (je >= Oe) {
          M(k, A, T, !0);
          continue;
        }
        let O;
        if (k.key != null)
          O = ke.get(k.key);
        else
          for (he = ae; he <= G; he++)
            if (g[he - ae] === 0 && Nn(k, p[he])) {
              O = he;
              break;
            }
        O === void 0 ? M(k, A, T, !0) : (g[O - ae] = L + 1, O >= u ? u = O : rt = !0, H(
          k,
          p[O],
          w,
          null,
          A,
          T,
          F,
          N,
          P
        ), je++);
      }
      const S = rt ? Dc(g) : An;
      for (he = S.length - 1, L = Oe - 1; L >= 0; L--) {
        const k = ae + L, O = p[k], W = p[k + 1], X = k + 1 < Z ? (
          // #13559, fallback to el placeholder for unresolved async component
          W.el || W.placeholder
        ) : I;
        g[L] === 0 ? H(
          null,
          O,
          w,
          X,
          A,
          T,
          F,
          N,
          P
        ) : rt && (he < 0 || L !== S[he] ? de(O, w, X, 2) : he--);
      }
    }
  }, de = (d, p, w, I, A = null) => {
    const { el: T, type: F, transition: N, children: P, shapeFlag: L } = d;
    if (L & 6) {
      de(d.component.subTree, p, w, I);
      return;
    }
    if (L & 128) {
      d.suspense.move(p, w, I);
      return;
    }
    if (L & 64) {
      F.move(d, p, w, tt);
      return;
    }
    if (F === De) {
      s(T, p, w);
      for (let B = 0; B < P.length; B++)
        de(P[B], p, w, I);
      s(d.anchor, p, w);
      return;
    }
    if (F === ms) {
      be(d, p, w);
      return;
    }
    if (I !== 2 && L & 1 && N)
      if (I === 0)
        N.beforeEnter(T), s(T, p, w), wt(() => N.enter(T), A);
      else {
        const { leave: B, delayLeave: G, afterLeave: Q } = N, ae = () => {
          d.ctx.isUnmounted ? r(T) : s(T, p, w);
        }, ke = () => {
          B(T, () => {
            ae(), Q && Q();
          });
        };
        G ? G(T, ae, ke) : ke();
      }
    else
      s(T, p, w);
  }, M = (d, p, w, I = !1, A = !1) => {
    const {
      type: T,
      props: F,
      ref: N,
      children: P,
      dynamicChildren: L,
      shapeFlag: Z,
      patchFlag: B,
      dirs: G,
      cacheIndex: Q
    } = d;
    if (B === -2 && (A = !1), N != null && (Yt(), Kn(N, null, w, d, !0), Xt()), Q != null && (p.renderCache[Q] = void 0), Z & 256) {
      p.ctx.deactivate(d);
      return;
    }
    const ae = Z & 1 && G, ke = !Zn(d);
    let he;
    if (ke && (he = F && F.onVnodeBeforeUnmount) && Pt(he, p, d), Z & 6)
      Et(d.component, w, I);
    else {
      if (Z & 128) {
        d.suspense.unmount(w, I);
        return;
      }
      ae && dn(d, null, p, "beforeUnmount"), Z & 64 ? d.type.remove(
        d,
        p,
        w,
        tt,
        I
      ) : L && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !L.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (T !== De || B > 0 && B & 64) ? et(
        L,
        p,
        w,
        !1,
        !0
      ) : (T === De && B & 384 || !A && Z & 16) && et(P, p, w), I && Ne(d);
    }
    (ke && (he = F && F.onVnodeUnmounted) || ae) && wt(() => {
      he && Pt(he, p, d), ae && dn(d, null, p, "unmounted");
    }, w);
  }, Ne = (d) => {
    const { type: p, el: w, anchor: I, transition: A } = d;
    if (p === De) {
      Fe(w, I);
      return;
    }
    if (p === ms) {
      z(d);
      return;
    }
    const T = () => {
      r(w), A && !A.persisted && A.afterLeave && A.afterLeave();
    };
    if (d.shapeFlag & 1 && A && !A.persisted) {
      const { leave: F, delayLeave: N } = A, P = () => F(w, T);
      N ? N(d.el, T, P) : P();
    } else
      T();
  }, Fe = (d, p) => {
    let w;
    for (; d !== p; )
      w = y(d), r(d), d = w;
    r(p);
  }, Et = (d, p, w) => {
    const {
      bum: I,
      scope: A,
      job: T,
      subTree: F,
      um: N,
      m: P,
      a: L,
      parent: Z,
      slots: { __: B }
    } = d;
    zi(P), zi(L), I && ps(I), Z && te(B) && B.forEach((G) => {
      Z.renderCache[G] = void 0;
    }), A.stop(), T && (T.flags |= 8, M(F, d, p, w)), N && wt(N, p), wt(() => {
      d.isUnmounted = !0;
    }, p), p && p.pendingBranch && !p.isUnmounted && d.asyncDep && !d.asyncResolved && d.suspenseId === p.pendingId && (p.deps--, p.deps === 0 && p.resolve());
  }, et = (d, p, w, I = !1, A = !1, T = 0) => {
    for (let F = T; F < d.length; F++)
      M(d[F], p, w, I, A);
  }, ct = (d) => {
    if (d.shapeFlag & 6)
      return ct(d.component.subTree);
    if (d.shapeFlag & 128)
      return d.suspense.next();
    const p = y(d.anchor || d.el), w = p && p[oc];
    return w ? y(w) : p;
  };
  let _t = !1;
  const yt = (d, p, w) => {
    d == null ? p._vnode && M(p._vnode, null, null, !0) : H(
      p._vnode || null,
      d,
      p,
      null,
      null,
      null,
      w
    ), p._vnode = d, _t || (_t = !0, Ni(), Xo(), _t = !1);
  }, tt = {
    p: H,
    um: M,
    m: de,
    r: Ne,
    mt: Ve,
    mc: we,
    pc: K,
    pbc: $e,
    n: ct,
    o: e
  };
  return {
    render: yt,
    hydrate: void 0,
    createApp: Ec(yt)
  };
}
function sr({ type: e, props: t }, n) {
  return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function pn({ effect: e, job: t }, n) {
  n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function Mc(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function gl(e, t, n = !1) {
  const s = e.children, r = t.children;
  if (te(s) && te(r))
    for (let i = 0; i < s.length; i++) {
      const o = s[i];
      let l = r[i];
      l.shapeFlag & 1 && !l.dynamicChildren && ((l.patchFlag <= 0 || l.patchFlag === 32) && (l = r[i] = nn(r[i]), l.el = o.el), !n && l.patchFlag !== -2 && gl(o, l)), l.type === Us && (l.el = o.el), l.type === cn && !l.el && (l.el = o.el);
    }
}
function Dc(e) {
  const t = e.slice(), n = [0];
  let s, r, i, o, l;
  const a = e.length;
  for (s = 0; s < a; s++) {
    const h = e[s];
    if (h !== 0) {
      if (r = n[n.length - 1], e[r] < h) {
        t[s] = r, n.push(s);
        continue;
      }
      for (i = 0, o = n.length - 1; i < o; )
        l = i + o >> 1, e[n[l]] < h ? i = l + 1 : o = l;
      h < e[n[i]] && (i > 0 && (t[s] = n[i - 1]), n[i] = s);
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
function zi(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
const qc = Symbol.for("v-scx"), Uc = () => gs(qc);
function sn(e, t, n) {
  return _l(e, t, n);
}
function _l(e, t, n = Le) {
  const { immediate: s, deep: r, flush: i, once: o } = n, l = at({}, n), a = t && s || !t && i !== "post";
  let h;
  if (ns) {
    if (i === "sync") {
      const $ = Uc();
      h = $.__watcherHandles || ($.__watcherHandles = []);
    } else if (!a) {
      const $ = () => {
      };
      return $.stop = Nt, $.resume = Nt, $.pause = Nt, $;
    }
  }
  const c = dt;
  l.call = ($, D, H) => qt($, c, D, H);
  let v = !1;
  i === "post" ? l.scheduler = ($) => {
    wt($, c && c.suspense);
  } : i !== "sync" && (v = !0, l.scheduler = ($, D) => {
    D ? $() : jr($);
  }), l.augmentJob = ($) => {
    t && ($.flags |= 4), v && ($.flags |= 2, c && ($.id = c.uid, $.i = c));
  };
  const y = tc(e, t, l);
  return ns && (h ? h.push(y) : a && y()), y;
}
function Hc(e, t, n) {
  const s = this.proxy, r = Ze(e) ? e.includes(".") ? yl(s, e) : () => s[e] : e.bind(s, s);
  let i;
  ie(t) ? i = t : (i = t.handler, n = t);
  const o = rs(this), l = _l(r, i.bind(s), n);
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
function Vc(e, t, ...n) {
  if (e.isUnmounted) return;
  const s = e.vnode.props || Le;
  let r = n;
  const i = t.startsWith("update:"), o = i && zc(s, t.slice(7));
  o && (o.trim && (r = n.map((c) => Ze(c) ? c.trim() : c)), o.number && (r = n.map(pr)));
  let l, a = s[l = Xs(t)] || // also try camelCase event handler (#2249)
  s[l = Xs(ln(t))];
  !a && i && (a = s[l = Xs(fn(t))]), a && qt(
    a,
    e,
    6,
    r
  );
  const h = s[l + "Once"];
  if (h) {
    if (!e.emitted)
      e.emitted = {};
    else if (e.emitted[l])
      return;
    e.emitted[l] = !0, qt(
      h,
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
    const a = (h) => {
      const c = vl(h, t, !0);
      c && (l = !0, at(o, c));
    };
    !n && t.mixins.length && t.mixins.forEach(a), e.extends && a(e.extends), e.mixins && e.mixins.forEach(a);
  }
  return !i && !l ? (qe(e) && s.set(e, null), null) : (te(i) ? i.forEach((a) => o[a] = null) : at(o, i), qe(e) && s.set(e, o), o);
}
function qs(e, t) {
  return !e || !Ps(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), Ce(e, t[0].toLowerCase() + t.slice(1)) || Ce(e, fn(t)) || Ce(e, t));
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
    render: h,
    renderCache: c,
    props: v,
    data: y,
    setupState: $,
    ctx: D,
    inheritAttrs: H
  } = e, oe = As(e);
  let le, ve;
  try {
    if (n.shapeFlag & 4) {
      const z = r || s, U = z;
      le = Bt(
        h.call(
          U,
          z,
          c,
          v,
          $,
          y,
          D
        )
      ), ve = l;
    } else {
      const z = t;
      le = Bt(
        z.length > 1 ? z(
          v,
          { attrs: l, slots: o, emit: a }
        ) : z(
          v,
          null
        )
      ), ve = t.props ? l : Wc(l);
    }
  } catch (z) {
    Yn.length = 0, Ms(z, e, 1), le = Mt(cn);
  }
  let be = le;
  if (ve && H !== !1) {
    const z = Object.keys(ve), { shapeFlag: U } = be;
    z.length && U & 7 && (i && z.some(Fr) && (ve = jc(
      ve,
      i
    )), be = On(be, ve, !1, !0));
  }
  return n.dirs && (be = On(be, null, !1, !0), be.dirs = be.dirs ? be.dirs.concat(n.dirs) : n.dirs), n.transition && Kr(be, n.transition), le = be, As(oe), le;
}
const Wc = (e) => {
  let t;
  for (const n in e)
    (n === "class" || n === "style" || Ps(n)) && ((t || (t = {}))[n] = e[n]);
  return t;
}, jc = (e, t) => {
  const n = {};
  for (const s in e)
    (!Fr(s) || !(s.slice(9) in t)) && (n[s] = e[s]);
  return n;
};
function Kc(e, t, n) {
  const { props: s, children: r, component: i } = e, { props: o, children: l, patchFlag: a } = t, h = i.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (n && a >= 0) {
    if (a & 1024)
      return !0;
    if (a & 16)
      return s ? Wi(s, o, h) : !!o;
    if (a & 8) {
      const c = t.dynamicProps;
      for (let v = 0; v < c.length; v++) {
        const y = c[v];
        if (o[y] !== s[y] && !qs(h, y))
          return !0;
      }
    }
  } else
    return (r || l) && (!l || !l.$stable) ? !0 : s === o ? !1 : s ? o ? Wi(s, o, h) : !0 : !!o;
  return !1;
}
function Wi(e, t, n) {
  const s = Object.keys(t);
  if (s.length !== Object.keys(e).length)
    return !0;
  for (let r = 0; r < s.length; r++) {
    const i = s[r];
    if (t[i] !== e[i] && !qs(n, i))
      return !0;
  }
  return !1;
}
function Zc({ vnode: e, parent: t }, n) {
  for (; t; ) {
    const s = t.subTree;
    if (s.suspense && s.suspense.activeBranch === e && (s.el = e.el), s === e)
      (e = t.vnode).el = n, t = t.parent;
    else
      break;
  }
}
const bl = (e) => e.__isSuspense;
function Gc(e, t) {
  t && t.pendingBranch ? te(e) ? t.effects.push(...e) : t.effects.push(e) : rc(e);
}
const De = Symbol.for("v-fgt"), Us = Symbol.for("v-txt"), cn = Symbol.for("v-cmt"), ms = Symbol.for("v-stc"), Yn = [];
let kt = null;
function E(e = !1) {
  Yn.push(kt = e ? null : []);
}
function Yc() {
  Yn.pop(), kt = Yn[Yn.length - 1] || null;
}
let ts = 1;
function ji(e, t = !1) {
  ts += e, e < 0 && kt && t && (kt.hasOnce = !0);
}
function wl(e) {
  return e.dynamicChildren = ts > 0 ? kt || An : null, Yc(), ts > 0 && kt && kt.push(e), e;
}
function R(e, t, n, s, r, i) {
  return wl(
    b(
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
    Mt(
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
function Nn(e, t) {
  return e.type === t.type && e.key === t.key;
}
const xl = ({ key: e }) => e ?? null, _s = ({
  ref: e,
  ref_key: t,
  ref_for: n
}) => (typeof e == "number" && (e = "" + e), e != null ? Ze(e) || lt(e) || ie(e) ? { i: Tt, r: e, k: t, f: !!n } : e : null);
function b(e, t = null, n = null, s = 0, r = null, i = e === De ? 0 : 1, o = !1, l = !1) {
  const a = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && xl(t),
    ref: t && _s(t),
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
    ctx: Tt
  };
  return l ? (Xr(a, n), i & 128 && e.normalize(a)) : n && (a.shapeFlag |= Ze(n) ? 8 : 16), ts > 0 && // avoid a block node from tracking itself
  !o && // has current parent block
  kt && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (a.patchFlag > 0 || i & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  a.patchFlag !== 32 && kt.push(a), a;
}
const Mt = Jc;
function Jc(e, t = null, n = null, s = 0, r = null, i = !1) {
  if ((!e || e === bc) && (e = cn), kl(e)) {
    const l = On(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return n && Xr(l, n), ts > 0 && !i && kt && (l.shapeFlag & 6 ? kt[kt.indexOf(e)] = l : kt.push(l)), l.patchFlag = -2, l;
  }
  if (uu(e) && (e = e.__vccOpts), t) {
    t = Qc(t);
    let { class: l, style: a } = t;
    l && !Ze(l) && (t.class = Me(l)), qe(a) && (Wr(a) && !te(a) && (a = at({}, a)), t.style = Ae(a));
  }
  const o = Ze(e) ? 1 : bl(e) ? 128 : lc(e) ? 64 : qe(e) ? 4 : ie(e) ? 2 : 0;
  return b(
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
function Qc(e) {
  return e ? Wr(e) || cl(e) ? at({}, e) : e : null;
}
function On(e, t, n = !1, s = !1) {
  const { props: r, ref: i, patchFlag: o, children: l, transition: a } = e, h = t ? tu(r || {}, t) : r, c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: h,
    key: h && xl(h),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && i ? te(i) ? i.concat(_s(t)) : [i, _s(t)] : _s(t)
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
    patchFlag: t && e.type !== De ? o === -1 ? 16 : o | 16 : o,
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
    c,
    a.clone(c)
  ), c;
}
function bt(e = " ", t = 0) {
  return Mt(Us, null, e, t);
}
function eu(e, t) {
  const n = Mt(ms, null, e);
  return n.staticCount = t, n;
}
function re(e = "", t = !1) {
  return t ? (E(), Xc(cn, null, e)) : Mt(cn, null, e);
}
function Bt(e) {
  return e == null || typeof e == "boolean" ? Mt(cn) : te(e) ? Mt(
    De,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : kl(e) ? nn(e) : Mt(Us, null, String(e));
}
function nn(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : On(e);
}
function Xr(e, t) {
  let n = 0;
  const { shapeFlag: s } = e;
  if (t == null)
    t = null;
  else if (te(t))
    n = 16;
  else if (typeof t == "object")
    if (s & 65) {
      const r = t.default;
      r && (r._c && (r._d = !1), Xr(e, r()), r._c && (r._d = !0));
      return;
    } else {
      n = 32;
      const r = t._;
      !r && !cl(t) ? t._ctx = Tt : r === 3 && Tt && (Tt.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else ie(t) ? (t = { default: t, _ctx: Tt }, n = 32) : (t = String(t), s & 64 ? (n = 16, t = [bt(t)]) : n = 8);
  e.children = t, e.shapeFlag |= n;
}
function tu(...e) {
  const t = {};
  for (let n = 0; n < e.length; n++) {
    const s = e[n];
    for (const r in s)
      if (r === "class")
        t.class !== s.class && (t.class = Me([t.class, s.class]));
      else if (r === "style")
        t.style = Ae([t.style, s.style]);
      else if (Ps(r)) {
        const i = t[r], o = s[r];
        o && i !== o && !(te(i) && i.includes(o)) && (t[r] = i ? [].concat(i, o) : o);
      } else r !== "" && (t[r] = s[r]);
  }
  return t;
}
function Pt(e, t, n, s = null) {
  qt(e, t, 7, [
    n,
    s
  ]);
}
const nu = ol();
let su = 0;
function ru(e, t, n) {
  const s = e.type, r = (t ? t.appContext : e.appContext) || nu, i = {
    uid: su++,
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
    scope: new Aa(
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
  return i.ctx = { _: i }, i.root = t ? t.root : i, i.emit = Vc.bind(null, i), e.ce && e.ce(i), i;
}
let dt = null;
const iu = () => dt || Tt;
let Rs, xr;
{
  const e = Bs(), t = (n, s) => {
    let r;
    return (r = e[n]) || (r = e[n] = []), r.push(s), (i) => {
      r.length > 1 ? r.forEach((o) => o(i)) : r[0](i);
    };
  };
  Rs = t(
    "__VUE_INSTANCE_SETTERS__",
    (n) => dt = n
  ), xr = t(
    "__VUE_SSR_SETTERS__",
    (n) => ns = n
  );
}
const rs = (e) => {
  const t = dt;
  return Rs(e), e.scope.on(), () => {
    e.scope.off(), Rs(t);
  };
}, Ki = () => {
  dt && dt.scope.off(), Rs(null);
};
function Sl(e) {
  return e.vnode.shapeFlag & 4;
}
let ns = !1;
function ou(e, t = !1, n = !1) {
  t && xr(t);
  const { props: s, children: r } = e.vnode, i = Sl(e);
  Ic(e, s, i, t), $c(e, r, n || t);
  const o = i ? lu(e, t) : void 0;
  return t && xr(!1), o;
}
function lu(e, t) {
  const n = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, wc);
  const { setup: s } = n;
  if (s) {
    Yt();
    const r = e.setupContext = s.length > 1 ? cu(e) : null, i = rs(e), o = ss(
      s,
      e,
      0,
      [
        e.props,
        r
      ]
    ), l = Co(o);
    if (Xt(), i(), (l || e.sp) && !Zn(e) && el(e), l) {
      if (o.then(Ki, Ki), t)
        return o.then((a) => {
          Zi(e, a);
        }).catch((a) => {
          Ms(a, e, 0);
        });
      e.asyncDep = o;
    } else
      Zi(e, o);
  } else
    Cl(e);
}
function Zi(e, t, n) {
  ie(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : qe(t) && (e.setupState = Ko(t)), Cl(e);
}
function Cl(e, t, n) {
  const s = e.type;
  e.render || (e.render = s.render || Nt);
  {
    const r = rs(e);
    Yt();
    try {
      kc(e);
    } finally {
      Xt(), r();
    }
  }
}
const au = {
  get(e, t) {
    return ot(e, "get", ""), e[t];
  }
};
function cu(e) {
  const t = (n) => {
    e.exposed = n || {};
  };
  return {
    attrs: new Proxy(e.attrs, au),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function Hs(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(Ko(Za(e.exposed)), {
    get(t, n) {
      if (n in t)
        return t[n];
      if (n in Gn)
        return Gn[n](e);
    },
    has(t, n) {
      return n in t || n in Gn;
    }
  })) : e.proxy;
}
function uu(e) {
  return ie(e) && "__vccOpts" in e;
}
const We = (e, t) => Qa(e, t, ns), fu = "3.5.18";
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
const Tl = Sr ? (e) => Sr.createHTML(e) : (e) => e, hu = "http://www.w3.org/2000/svg", du = "http://www.w3.org/1998/Math/MathML", Wt = typeof document < "u" ? document : null, Yi = Wt && /* @__PURE__ */ Wt.createElement("template"), pu = {
  insert: (e, t, n) => {
    t.insertBefore(e, n || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, n, s) => {
    const r = t === "svg" ? Wt.createElementNS(hu, e) : t === "mathml" ? Wt.createElementNS(du, e) : n ? Wt.createElement(e, { is: n }) : Wt.createElement(e);
    return e === "select" && s && s.multiple != null && r.setAttribute("multiple", s.multiple), r;
  },
  createText: (e) => Wt.createTextNode(e),
  createComment: (e) => Wt.createComment(e),
  setText: (e, t) => {
    e.nodeValue = t;
  },
  setElementText: (e, t) => {
    e.textContent = t;
  },
  parentNode: (e) => e.parentNode,
  nextSibling: (e) => e.nextSibling,
  querySelector: (e) => Wt.querySelector(e),
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
      Yi.innerHTML = Tl(
        s === "svg" ? `<svg>${e}</svg>` : s === "mathml" ? `<math>${e}</math>` : e
      );
      const l = Yi.content;
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
}, gu = Symbol("_vtc");
function mu(e, t, n) {
  const s = e[gu];
  s && (t = (t ? [t, ...s] : [...s]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
const Xi = Symbol("_vod"), _u = Symbol("_vsh"), yu = Symbol(""), vu = /(^|;)\s*display\s*:/;
function bu(e, t, n) {
  const s = e.style, r = Ze(n);
  let i = !1;
  if (n && !r) {
    if (t)
      if (Ze(t))
        for (const o of t.split(";")) {
          const l = o.slice(0, o.indexOf(":")).trim();
          n[l] == null && ys(s, l, "");
        }
      else
        for (const o in t)
          n[o] == null && ys(s, o, "");
    for (const o in n)
      o === "display" && (i = !0), ys(s, o, n[o]);
  } else if (r) {
    if (t !== n) {
      const o = s[yu];
      o && (n += ";" + o), s.cssText = n, i = vu.test(n);
    }
  } else t && e.removeAttribute("style");
  Xi in e && (e[Xi] = i ? s.display : "", e[_u] && (s.display = "none"));
}
const Ji = /\s*!important$/;
function ys(e, t, n) {
  if (te(n))
    n.forEach((s) => ys(e, t, s));
  else if (n == null && (n = ""), t.startsWith("--"))
    e.setProperty(t, n);
  else {
    const s = wu(e, t);
    Ji.test(n) ? e.setProperty(
      fn(s),
      n.replace(Ji, ""),
      "important"
    ) : e[s] = n;
  }
}
const Qi = ["Webkit", "Moz", "ms"], rr = {};
function wu(e, t) {
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
function to(e, t, n, s, r, i = Ta(t)) {
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
function ku(e, t, n, s) {
  e.removeEventListener(t, n, s);
}
const so = Symbol("_vei");
function xu(e, t, n, s, r = null) {
  const i = e[so] || (e[so] = {}), o = i[t];
  if (s && o)
    o.value = s;
  else {
    const [l, a] = Su(t);
    if (s) {
      const h = i[t] = Au(
        s,
        r
      );
      Tn(e, l, h, a);
    } else o && (ku(e, l, o, a), i[t] = void 0);
  }
}
const ro = /(?:Once|Passive|Capture)$/;
function Su(e) {
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
const Cu = /* @__PURE__ */ Promise.resolve(), Tu = () => ir || (Cu.then(() => ir = 0), ir = Date.now());
function Au(e, t) {
  const n = (s) => {
    if (!s._vts)
      s._vts = Date.now();
    else if (s._vts <= n.attached)
      return;
    qt(
      Eu(s, n.value),
      t,
      5,
      [s]
    );
  };
  return n.value = e, n.attached = Tu(), n;
}
function Eu(e, t) {
  if (te(t)) {
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
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, Ru = (e, t, n, s, r, i) => {
  const o = r === "svg";
  t === "class" ? mu(e, s, o) : t === "style" ? bu(e, n, s) : Ps(t) ? Fr(t) || xu(e, t, n, s, i) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : Iu(e, t, s, o)) ? (no(e, t, s), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && to(e, t, s, o, i, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !Ze(s)) ? no(e, ln(t), s, i, t) : (t === "true-value" ? e._trueValue = s : t === "false-value" && (e._falseValue = s), to(e, t, s, o));
};
function Iu(e, t, n, s) {
  if (s)
    return !!(t === "innerHTML" || t === "textContent" || t in e && io(t) && ie(n));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const r = e.tagName;
    if (r === "IMG" || r === "VIDEO" || r === "CANVAS" || r === "SOURCE")
      return !1;
  }
  return io(t) && Ze(n) ? !1 : t in e;
}
const oo = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return te(t) ? (n) => ps(t, n) : t;
};
function Lu(e) {
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
    }), t || (Tn(e, "compositionstart", Lu), Tn(e, "compositionend", lo), Tn(e, "change", lo));
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
}, Ou = ["ctrl", "shift", "alt", "meta"], Pu = {
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
  exact: (e, t) => Ou.some((n) => e[`${n}Key`] && !t.includes(n))
}, Sn = (e, t) => {
  const n = e._withMods || (e._withMods = {}), s = t.join(".");
  return n[s] || (n[s] = (r, ...i) => {
    for (let o = 0; o < t.length; o++) {
      const l = Pu[t[o]];
      if (l && l(r, t)) return;
    }
    return e(r, ...i);
  });
}, $u = {
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
      (o) => o === i || $u[o] === i
    ))
      return e(r);
  });
}, Fu = /* @__PURE__ */ at({ patchProp: Ru }, pu);
let co;
function Bu() {
  return co || (co = Bc(Fu));
}
const Nu = (...e) => {
  const t = Bu().createApp(...e), { mount: n } = t;
  return t.mount = (s) => {
    const r = Du(s);
    if (!r) return;
    const i = t._component;
    !ie(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
    const o = n(r, !1, Mu(r));
    return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), o;
  }, t;
};
function Mu(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function Du(e) {
  return Ze(e) ? document.querySelector(e) : e;
}
const en = (e) => {
  const t = e.replace("#", ""), n = parseInt(t.substr(0, 2), 16), s = parseInt(t.substr(2, 2), 16), r = parseInt(t.substr(4, 2), 16);
  return (n * 299 + s * 587 + r * 114) / 1e3 < 128;
}, qu = (e, t) => {
  const n = e.replace("#", ""), s = parseInt(n.substr(0, 2), 16), r = parseInt(n.substr(2, 2), 16), i = parseInt(n.substr(4, 2), 16), o = en(e), l = o ? Math.min(255, s + t) : Math.max(0, s - t), a = o ? Math.min(255, r + t) : Math.max(0, r - t), h = o ? Math.min(255, i + t) : Math.max(0, i - t);
  return `#${l.toString(16).padStart(2, "0")}${a.toString(16).padStart(2, "0")}${h.toString(16).padStart(2, "0")}`;
}, Mn = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e), Uu = (e) => {
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
function Te(e, t = "") {
  let n = typeof e == "string" ? e : e.source;
  const s = {
    replace: (r, i) => {
      let o = typeof i == "string" ? i : i.source;
      return o = o.replace(pt.caret, "$1"), n = n.replace(r, o), s;
    },
    getRegex: () => new RegExp(n, t)
  };
  return s;
}
var pt = {
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
}, Hu = /^(?:[ \t]*(?:\n|$))+/, zu = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/, Vu = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, is = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, Wu = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, Qr = /(?:[*+-]|\d{1,9}[.)])/, El = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/, Rl = Te(El).replace(/bull/g, Qr).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(), ju = Te(El).replace(/bull/g, Qr).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(), ei = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/, Ku = /^[^\n]+/, ti = /(?!\s*\])(?:\\.|[^\[\]\\])+/, Zu = Te(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", ti).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), Gu = Te(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, Qr).getRegex(), zs = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", ni = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, Yu = Te(
  "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))",
  "i"
).replace("comment", ni).replace("tag", zs).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), Il = Te(ei).replace("hr", is).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", zs).getRegex(), Xu = Te(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", Il).getRegex(), si = {
  blockquote: Xu,
  code: zu,
  def: Zu,
  fences: Vu,
  heading: Wu,
  hr: is,
  html: Yu,
  lheading: Rl,
  list: Gu,
  newline: Hu,
  paragraph: Il,
  table: Xn,
  text: Ku
}, uo = Te(
  "^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"
).replace("hr", is).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", zs).getRegex(), Ju = {
  ...si,
  lheading: ju,
  table: uo,
  paragraph: Te(ei).replace("hr", is).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", uo).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", zs).getRegex()
}, Qu = {
  ...si,
  html: Te(
    `^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`
  ).replace("comment", ni).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
  heading: /^(#{1,6})(.*)(?:\n+|$)/,
  fences: Xn,
  // fences not supported
  lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  paragraph: Te(ei).replace("hr", is).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", Rl).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
}, ef = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, tf = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, Ll = /^( {2,}|\\)\n(?!\s*$)/, nf = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, Vs = /[\p{P}\p{S}]/u, ri = /[\s\p{P}\p{S}]/u, Ol = /[^\s\p{P}\p{S}]/u, sf = Te(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, ri).getRegex(), Pl = /(?!~)[\p{P}\p{S}]/u, rf = /(?!~)[\s\p{P}\p{S}]/u, of = /(?:[^\s\p{P}\p{S}]|~)/u, lf = /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g, $l = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/, af = Te($l, "u").replace(/punct/g, Vs).getRegex(), cf = Te($l, "u").replace(/punct/g, Pl).getRegex(), Fl = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", uf = Te(Fl, "gu").replace(/notPunctSpace/g, Ol).replace(/punctSpace/g, ri).replace(/punct/g, Vs).getRegex(), ff = Te(Fl, "gu").replace(/notPunctSpace/g, of).replace(/punctSpace/g, rf).replace(/punct/g, Pl).getRegex(), hf = Te(
  "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)",
  "gu"
).replace(/notPunctSpace/g, Ol).replace(/punctSpace/g, ri).replace(/punct/g, Vs).getRegex(), df = Te(/\\(punct)/, "gu").replace(/punct/g, Vs).getRegex(), pf = Te(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), gf = Te(ni).replace("(?:-->|$)", "-->").getRegex(), mf = Te(
  "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>"
).replace("comment", gf).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), Is = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/, _f = Te(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", Is).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), Bl = Te(/^!?\[(label)\]\[(ref)\]/).replace("label", Is).replace("ref", ti).getRegex(), Nl = Te(/^!?\[(ref)\](?:\[\])?/).replace("ref", ti).getRegex(), yf = Te("reflink|nolink(?!\\()", "g").replace("reflink", Bl).replace("nolink", Nl).getRegex(), ii = {
  _backpedal: Xn,
  // only used for GFM url
  anyPunctuation: df,
  autolink: pf,
  blockSkip: lf,
  br: Ll,
  code: tf,
  del: Xn,
  emStrongLDelim: af,
  emStrongRDelimAst: uf,
  emStrongRDelimUnd: hf,
  escape: ef,
  link: _f,
  nolink: Nl,
  punctuation: sf,
  reflink: Bl,
  reflinkSearch: yf,
  tag: mf,
  text: nf,
  url: Xn
}, vf = {
  ...ii,
  link: Te(/^!?\[(label)\]\((.*?)\)/).replace("label", Is).getRegex(),
  reflink: Te(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", Is).getRegex()
}, Cr = {
  ...ii,
  emStrongRDelimAst: ff,
  emStrongLDelim: cf,
  url: Te(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, "i").replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
  _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
}, bf = {
  ...Cr,
  br: Te(Ll).replace("{2,}", "*").getRegex(),
  text: Te(Cr.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
}, fs = {
  normal: si,
  gfm: Ju,
  pedantic: Qu
}, Dn = {
  normal: ii,
  gfm: Cr,
  breaks: bf,
  pedantic: vf
}, wf = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}, fo = (e) => wf[e];
function $t(e, t) {
  if (t) {
    if (pt.escapeTest.test(e))
      return e.replace(pt.escapeReplace, fo);
  } else if (pt.escapeTestNoEncode.test(e))
    return e.replace(pt.escapeReplaceNoEncode, fo);
  return e;
}
function ho(e) {
  try {
    e = encodeURI(e).replace(pt.percentDecode, "%");
  } catch {
    return null;
  }
  return e;
}
function po(e, t) {
  var i;
  const n = e.replace(pt.findPipe, (o, l, a) => {
    let h = !1, c = l;
    for (; --c >= 0 && a[c] === "\\"; ) h = !h;
    return h ? "|" : " |";
  }), s = n.split(pt.splitPipe);
  let r = 0;
  if (s[0].trim() || s.shift(), s.length > 0 && !((i = s.at(-1)) != null && i.trim()) && s.pop(), t)
    if (s.length > t)
      s.splice(t);
    else
      for (; s.length < t; ) s.push("");
  for (; r < s.length; r++)
    s[r] = s[r].trim().replace(pt.slashPipe, "|");
  return s;
}
function qn(e, t, n) {
  const s = e.length;
  if (s === 0)
    return "";
  let r = 0;
  for (; r < s && e.charAt(s - r - 1) === t; )
    r++;
  return e.slice(0, s - r);
}
function kf(e, t) {
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
function xf(e, t, n) {
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
var Ls = class {
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
        text: this.options.pedantic ? n : qn(n, `
`)
      };
    }
  }
  fences(e) {
    const t = this.rules.block.fences.exec(e);
    if (t) {
      const n = t[0], s = xf(n, t[3] || "", this.rules);
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
        const s = qn(n, "#");
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
        raw: qn(t[0], `
`)
      };
  }
  blockquote(e) {
    const t = this.rules.block.blockquote.exec(e);
    if (t) {
      let n = qn(t[0], `
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
        const h = l.join(`
`), c = h.replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
        s = s ? `${s}
${h}` : h, r = r ? `${r}
${c}` : c;
        const v = this.lexer.state.top;
        if (this.lexer.state.top = !0, this.lexer.blockTokens(c, i, !0), this.lexer.state.top = v, n.length === 0)
          break;
        const y = i.at(-1);
        if ((y == null ? void 0 : y.type) === "code")
          break;
        if ((y == null ? void 0 : y.type) === "blockquote") {
          const $ = y, D = $.raw + `
` + n.join(`
`), H = this.blockquote(D);
          i[i.length - 1] = H, s = s.substring(0, s.length - $.raw.length) + H.raw, r = r.substring(0, r.length - $.text.length) + H.text;
          break;
        } else if ((y == null ? void 0 : y.type) === "list") {
          const $ = y, D = $.raw + `
` + n.join(`
`), H = this.list(D);
          i[i.length - 1] = H, s = s.substring(0, s.length - y.raw.length) + H.raw, r = r.substring(0, r.length - $.raw.length) + H.raw, n = D.substring(i.at(-1).raw.length).split(`
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
        let a = !1, h = "", c = "";
        if (!(t = i.exec(e)) || this.rules.block.hr.test(e))
          break;
        h = t[0], e = e.substring(h.length);
        let v = t[2].split(`
`, 1)[0].replace(this.rules.other.listReplaceTabs, (le) => " ".repeat(3 * le.length)), y = e.split(`
`, 1)[0], $ = !v.trim(), D = 0;
        if (this.options.pedantic ? (D = 2, c = v.trimStart()) : $ ? D = t[1].length + 1 : (D = t[2].search(this.rules.other.nonSpaceChar), D = D > 4 ? 1 : D, c = v.slice(D), D += t[1].length), $ && this.rules.other.blankLine.test(y) && (h += y + `
`, e = e.substring(y.length + 1), a = !0), !a) {
          const le = this.rules.other.nextBulletRegex(D), ve = this.rules.other.hrRegex(D), be = this.rules.other.fencesBeginRegex(D), z = this.rules.other.headingBeginRegex(D), U = this.rules.other.htmlBeginRegex(D);
          for (; e; ) {
            const V = e.split(`
`, 1)[0];
            let j;
            if (y = V, this.options.pedantic ? (y = y.replace(this.rules.other.listReplaceNesting, "  "), j = y) : j = y.replace(this.rules.other.tabCharGlobal, "    "), be.test(y) || z.test(y) || U.test(y) || le.test(y) || ve.test(y))
              break;
            if (j.search(this.rules.other.nonSpaceChar) >= D || !y.trim())
              c += `
` + j.slice(D);
            else {
              if ($ || v.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || be.test(v) || z.test(v) || ve.test(v))
                break;
              c += `
` + y;
            }
            !$ && !y.trim() && ($ = !0), h += V + `
`, e = e.substring(V.length + 1), v = j.slice(D);
          }
        }
        r.loose || (o ? r.loose = !0 : this.rules.other.doubleBlankLine.test(h) && (o = !0));
        let H = null, oe;
        this.options.gfm && (H = this.rules.other.listIsTask.exec(c), H && (oe = H[0] !== "[ ] ", c = c.replace(this.rules.other.listReplaceTask, ""))), r.items.push({
          type: "list_item",
          raw: h,
          task: !!H,
          checked: oe,
          loose: !1,
          text: c,
          tokens: []
        }), r.raw += h;
      }
      const l = r.items.at(-1);
      if (l)
        l.raw = l.raw.trimEnd(), l.text = l.text.trimEnd();
      else
        return;
      r.raw = r.raw.trimEnd();
      for (let a = 0; a < r.items.length; a++)
        if (this.lexer.state.top = !1, r.items[a].tokens = this.lexer.blockTokens(r.items[a].text, []), !r.loose) {
          const h = r.items[a].tokens.filter((v) => v.type === "space"), c = h.length > 0 && h.some((v) => this.rules.other.anyLine.test(v.raw));
          r.loose = c;
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
        i.rows.push(po(l, i.header.length).map((a, h) => ({
          text: a,
          tokens: this.lexer.inline(a),
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
        const i = qn(n.slice(0, -1), "\\");
        if ((n.length - i.length) % 2 === 0)
          return;
      } else {
        const i = kf(t[2], "()");
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
      let o, l, a = i, h = 0;
      const c = s[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      for (c.lastIndex = 0, t = t.slice(-1 * e.length + i); (s = c.exec(t)) != null; ) {
        if (o = s[1] || s[2] || s[3] || s[4] || s[5] || s[6], !o) continue;
        if (l = [...o].length, s[3] || s[4]) {
          a += l;
          continue;
        } else if ((s[5] || s[6]) && i % 3 && !((i + l) % 3)) {
          h += l;
          continue;
        }
        if (a -= l, a > 0) continue;
        l = Math.min(l, l + a + h);
        const v = [...s[0]][0].length, y = e.slice(0, i + s.index + v + l);
        if (Math.min(i, l) % 2) {
          const D = y.slice(1, -1);
          return {
            type: "em",
            raw: y,
            text: D,
            tokens: this.lexer.inlineTokens(D)
          };
        }
        const $ = y.slice(2, -2);
        return {
          type: "strong",
          raw: y,
          text: $,
          tokens: this.lexer.inlineTokens($)
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
}, Zt = class Tr {
  constructor(t) {
    Ie(this, "tokens");
    Ie(this, "options");
    Ie(this, "state");
    Ie(this, "tokenizer");
    Ie(this, "inlineQueue");
    this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = t || bn, this.options.tokenizer = this.options.tokenizer || new Ls(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = {
      inLink: !1,
      inRawBlock: !1,
      top: !0
    };
    const n = {
      other: pt,
      block: fs.normal,
      inline: Dn.normal
    };
    this.options.pedantic ? (n.block = fs.pedantic, n.inline = Dn.pedantic) : this.options.gfm && (n.block = fs.gfm, this.options.breaks ? n.inline = Dn.breaks : n.inline = Dn.gfm), this.tokenizer.rules = n;
  }
  /**
   * Expose Rules
   */
  static get rules() {
    return {
      block: fs,
      inline: Dn
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
    t = t.replace(pt.carriageReturn, `
`), this.blockTokens(t, this.tokens);
    for (let n = 0; n < this.inlineQueue.length; n++) {
      const s = this.inlineQueue[n];
      this.inlineTokens(s.src, s.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(t, n = [], s = !1) {
    var r, i, o;
    for (this.options.pedantic && (t = t.replace(pt.tabCharGlobal, "    ").replace(pt.spaceLine, "")); t; ) {
      let l;
      if ((i = (r = this.options.extensions) == null ? void 0 : r.block) != null && i.some((h) => (l = h.call({ lexer: this }, t, n)) ? (t = t.substring(l.raw.length), n.push(l), !0) : !1))
        continue;
      if (l = this.tokenizer.space(t)) {
        t = t.substring(l.raw.length);
        const h = n.at(-1);
        l.raw.length === 1 && h !== void 0 ? h.raw += `
` : n.push(l);
        continue;
      }
      if (l = this.tokenizer.code(t)) {
        t = t.substring(l.raw.length);
        const h = n.at(-1);
        (h == null ? void 0 : h.type) === "paragraph" || (h == null ? void 0 : h.type) === "text" ? (h.raw += `
` + l.raw, h.text += `
` + l.text, this.inlineQueue.at(-1).src = h.text) : n.push(l);
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
        const h = n.at(-1);
        (h == null ? void 0 : h.type) === "paragraph" || (h == null ? void 0 : h.type) === "text" ? (h.raw += `
` + l.raw, h.text += `
` + l.raw, this.inlineQueue.at(-1).src = h.text) : this.tokens.links[l.tag] || (this.tokens.links[l.tag] = {
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
        let h = 1 / 0;
        const c = t.slice(1);
        let v;
        this.options.extensions.startBlock.forEach((y) => {
          v = y.call({ lexer: this }, c), typeof v == "number" && v >= 0 && (h = Math.min(h, v));
        }), h < 1 / 0 && h >= 0 && (a = t.substring(0, h + 1));
      }
      if (this.state.top && (l = this.tokenizer.paragraph(a))) {
        const h = n.at(-1);
        s && (h == null ? void 0 : h.type) === "paragraph" ? (h.raw += `
` + l.raw, h.text += `
` + l.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = h.text) : n.push(l), s = a.length !== t.length, t = t.substring(l.raw.length);
        continue;
      }
      if (l = this.tokenizer.text(t)) {
        t = t.substring(l.raw.length);
        const h = n.at(-1);
        (h == null ? void 0 : h.type) === "text" ? (h.raw += `
` + l.raw, h.text += `
` + l.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = h.text) : n.push(l);
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
    var l, a, h;
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
      if ((a = (l = this.options.extensions) == null ? void 0 : l.inline) != null && a.some((y) => (c = y.call({ lexer: this }, t, n)) ? (t = t.substring(c.raw.length), n.push(c), !0) : !1))
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
        const y = n.at(-1);
        c.type === "text" && (y == null ? void 0 : y.type) === "text" ? (y.raw += c.raw, y.text += c.text) : n.push(c);
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
      let v = t;
      if ((h = this.options.extensions) != null && h.startInline) {
        let y = 1 / 0;
        const $ = t.slice(1);
        let D;
        this.options.extensions.startInline.forEach((H) => {
          D = H.call({ lexer: this }, $), typeof D == "number" && D >= 0 && (y = Math.min(y, D));
        }), y < 1 / 0 && y >= 0 && (v = t.substring(0, y + 1));
      }
      if (c = this.tokenizer.inlineText(v)) {
        t = t.substring(c.raw.length), c.raw.slice(-1) !== "_" && (o = c.raw.slice(-1)), i = !0;
        const y = n.at(-1);
        (y == null ? void 0 : y.type) === "text" ? (y.raw += c.raw, y.text += c.text) : n.push(c);
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
}, Os = class {
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
    const s = (i = (t || "").match(pt.notSpaceStart)) == null ? void 0 : i[0], r = e.replace(pt.endingNewline, "") + `
`;
    return s ? '<pre><code class="language-' + $t(s) + '">' + (n ? r : $t(r, !0)) + `</code></pre>
` : "<pre><code>" + (n ? r : $t(r, !0)) + `</code></pre>
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
      e.loose ? ((n = e.tokens[0]) == null ? void 0 : n.type) === "paragraph" ? (e.tokens[0].text = s + " " + e.tokens[0].text, e.tokens[0].tokens && e.tokens[0].tokens.length > 0 && e.tokens[0].tokens[0].type === "text" && (e.tokens[0].tokens[0].text = s + " " + $t(e.tokens[0].tokens[0].text), e.tokens[0].tokens[0].escaped = !0)) : e.tokens.unshift({
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
    return `<code>${$t(e, !0)}</code>`;
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
    return t && (i += ' title="' + $t(t) + '"'), i += ">" + s + "</a>", i;
  }
  image({ href: e, title: t, text: n, tokens: s }) {
    s && (n = this.parser.parseInline(s, this.parser.textRenderer));
    const r = ho(e);
    if (r === null)
      return $t(n);
    e = r;
    let i = `<img src="${e}" alt="${n}"`;
    return t && (i += ` title="${$t(t)}"`), i += ">", i;
  }
  text(e) {
    return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : $t(e.text);
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
}, Gt = class Ar {
  constructor(t) {
    Ie(this, "options");
    Ie(this, "renderer");
    Ie(this, "textRenderer");
    this.options = t || bn, this.options.renderer = this.options.renderer || new Os(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new oi();
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
        const h = l, c = this.options.extensions.renderers[h.type].call({ parser: this }, h);
        if (c !== !1 || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "paragraph", "text"].includes(h.type)) {
          s += c || "";
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
          let h = a, c = this.renderer.text(h);
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
          const h = 'Token with "' + a.type + '" type was not found.';
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
      const l = t[o];
      if ((i = (r = this.options.extensions) == null ? void 0 : r.renderers) != null && i[l.type]) {
        const h = this.options.extensions.renderers[l.type].call({ parser: this }, l);
        if (h !== !1 || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(l.type)) {
          s += h || "";
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
          const h = 'Token with "' + a.type + '" type was not found.';
          if (this.options.silent)
            return console.error(h), "";
          throw new Error(h);
        }
      }
    }
    return s;
  }
}, hr, vs = (hr = class {
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
    return this.block ? Zt.lex : Zt.lexInline;
  }
  /**
   * Provide function to parse tokens
   */
  provideParser() {
    return this.block ? Gt.parse : Gt.parseInline;
  }
}, Ie(hr, "passThroughHooks", /* @__PURE__ */ new Set([
  "preprocess",
  "postprocess",
  "processAllTokens"
])), hr), Sf = class {
  constructor(...e) {
    Ie(this, "defaults", Jr());
    Ie(this, "options", this.setOptions);
    Ie(this, "parse", this.parseMarkdown(!0));
    Ie(this, "parseInline", this.parseMarkdown(!1));
    Ie(this, "Parser", Gt);
    Ie(this, "Renderer", Os);
    Ie(this, "TextRenderer", oi);
    Ie(this, "Lexer", Zt);
    Ie(this, "Tokenizer", Ls);
    Ie(this, "Hooks", vs);
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
        const r = this.defaults.renderer || new Os(this.defaults);
        for (const i in n.renderer) {
          if (!(i in r))
            throw new Error(`renderer '${i}' does not exist`);
          if (["options", "parser"].includes(i))
            continue;
          const o = i, l = n.renderer[o], a = r[o];
          r[o] = (...h) => {
            let c = l.apply(r, h);
            return c === !1 && (c = a.apply(r, h)), c || "";
          };
        }
        s.renderer = r;
      }
      if (n.tokenizer) {
        const r = this.defaults.tokenizer || new Ls(this.defaults);
        for (const i in n.tokenizer) {
          if (!(i in r))
            throw new Error(`tokenizer '${i}' does not exist`);
          if (["options", "rules", "lexer"].includes(i))
            continue;
          const o = i, l = n.tokenizer[o], a = r[o];
          r[o] = (...h) => {
            let c = l.apply(r, h);
            return c === !1 && (c = a.apply(r, h)), c;
          };
        }
        s.tokenizer = r;
      }
      if (n.hooks) {
        const r = this.defaults.hooks || new vs();
        for (const i in n.hooks) {
          if (!(i in r))
            throw new Error(`hook '${i}' does not exist`);
          if (["options", "block"].includes(i))
            continue;
          const o = i, l = n.hooks[o], a = r[o];
          vs.passThroughHooks.has(i) ? r[o] = (h) => {
            if (this.defaults.async)
              return Promise.resolve(l.call(r, h)).then((v) => a.call(r, v));
            const c = l.call(r, h);
            return a.call(r, c);
          } : r[o] = (...h) => {
            let c = l.apply(r, h);
            return c === !1 && (c = a.apply(r, h)), c;
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
    return Zt.lex(e, t ?? this.defaults);
  }
  parser(e, t) {
    return Gt.parse(e, t ?? this.defaults);
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
      const l = i.hooks ? i.hooks.provideLexer() : e ? Zt.lex : Zt.lexInline, a = i.hooks ? i.hooks.provideParser() : e ? Gt.parse : Gt.parseInline;
      if (i.async)
        return Promise.resolve(i.hooks ? i.hooks.preprocess(n) : n).then((h) => l(h, i)).then((h) => i.hooks ? i.hooks.processAllTokens(h) : h).then((h) => i.walkTokens ? Promise.all(this.walkTokens(h, i.walkTokens)).then(() => h) : h).then((h) => a(h, i)).then((h) => i.hooks ? i.hooks.postprocess(h) : h).catch(o);
      try {
        i.hooks && (n = i.hooks.preprocess(n));
        let h = l(n, i);
        i.hooks && (h = i.hooks.processAllTokens(h)), i.walkTokens && this.walkTokens(h, i.walkTokens);
        let c = a(h, i);
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
        const s = "<p>An error occurred:</p><pre>" + $t(n.message + "", !0) + "</pre>";
        return t ? Promise.resolve(s) : s;
      }
      if (t)
        return Promise.reject(n);
      throw n;
    };
  }
}, vn = new Sf();
function ye(e, t) {
  return vn.parse(e, t);
}
ye.options = ye.setOptions = function(e) {
  return vn.setOptions(e), ye.defaults = vn.defaults, Al(ye.defaults), ye;
};
ye.getDefaults = Jr;
ye.defaults = bn;
ye.use = function(...e) {
  return vn.use(...e), ye.defaults = vn.defaults, Al(ye.defaults), ye;
};
ye.walkTokens = function(e, t) {
  return vn.walkTokens(e, t);
};
ye.parseInline = vn.parseInline;
ye.Parser = Gt;
ye.parser = Gt.parse;
ye.Renderer = Os;
ye.TextRenderer = oi;
ye.Lexer = Zt;
ye.lexer = Zt.lex;
ye.Tokenizer = Ls;
ye.Hooks = vs;
ye.parse = ye;
ye.options;
ye.setOptions;
ye.use;
ye.walkTokens;
ye.parseInline;
Gt.parse;
Zt.lex;
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
function Cf(e) {
  const t = We(() => ({
    backgroundColor: e.value.chat_background_color || "#ffffff",
    color: en(e.value.chat_background_color || "#ffffff") ? "#ffffff" : "#000000"
  })), n = We(() => ({
    backgroundColor: e.value.chat_bubble_color || "#f34611",
    color: en(e.value.chat_bubble_color || "#f34611") ? "#FFFFFF" : "#000000"
  })), s = We(() => {
    const h = e.value.chat_background_color || "#F8F9FA", c = qu(h, 20);
    return {
      backgroundColor: c,
      color: en(c) ? "#FFFFFF" : "#000000"
    };
  }), r = We(() => ({
    backgroundColor: e.value.accent_color || "#f34611",
    color: en(e.value.accent_color || "#f34611") ? "#FFFFFF" : "#000000"
  })), i = We(() => ({
    color: en(e.value.chat_background_color || "#F8F9FA") ? "#FFFFFF" : "#000000"
  })), o = We(() => ({
    borderBottom: `1px solid ${en(e.value.chat_background_color || "#F8F9FA") ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`
  })), l = We(() => e.value.photo_url ? e.value.photo_url.includes("amazonaws.com") ? e.value.photo_url : `${yn.API_URL}${e.value.photo_url}` : ""), a = We(() => {
    const h = e.value.chat_background_color || "#ffffff";
    return {
      boxShadow: `0 8px 5px ${en(h) ? "rgba(0, 0, 0, 0.24)" : "rgba(0, 0, 0, 0.12)"}`
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
function Tf(e, t) {
  const n = ue([]), s = ue(!1), r = ue(null), i = (U) => {
    if (U === 0) return "0 Bytes";
    const V = 1024, j = ["Bytes", "KB", "MB", "GB"], we = Math.floor(Math.log(U) / Math.log(V));
    return parseFloat((U / Math.pow(V, we)).toFixed(2)) + " " + j[we];
  }, o = (U) => U.startsWith("image/"), l = (U) => U ? U.startsWith("blob:") || U.startsWith("http://") || U.startsWith("https://") ? U : `${yn.API_URL}${U}` : "", a = (U) => {
    const V = U.file_url || U.url;
    return V ? V.startsWith("blob:") || V.startsWith("http://") || V.startsWith("https://") ? V : `${yn.API_URL}${V}` : "";
  }, h = async (U) => {
    const V = U.target;
    V.files && V.files.length > 0 && (await H(Array.from(V.files)), V.value = "");
  }, c = async (U) => {
    var j;
    U.preventDefault();
    const V = (j = U.dataTransfer) == null ? void 0 : j.files;
    V && V.length > 0 && await H(Array.from(V));
  }, v = (U) => {
    U.preventDefault();
  }, y = (U) => {
    U.preventDefault();
  }, $ = async (U) => {
    var we;
    const V = (we = U.clipboardData) == null ? void 0 : we.items;
    if (!V) return;
    const j = [];
    for (const Ue of Array.from(V))
      if (Ue.kind === "file") {
        const $e = Ue.getAsFile();
        $e && j.push($e);
      }
    j.length > 0 && await H(j);
  }, D = async (U, V = 500) => new Promise((j, we) => {
    const Ue = new FileReader();
    Ue.onload = ($e) => {
      var fe;
      const He = new Image();
      He.onload = () => {
        const ze = document.createElement("canvas");
        let Ve = He.width, Ge = He.height;
        const J = 1920;
        (Ve > J || Ge > J) && (Ve > Ge ? (Ge = Ge / Ve * J, Ve = J) : (Ve = Ve / Ge * J, Ge = J)), ze.width = Ve, ze.height = Ge;
        const se = ze.getContext("2d");
        if (!se) {
          we(new Error("Failed to get canvas context"));
          return;
        }
        se.drawImage(He, 0, 0, Ve, Ge);
        let K = 0.9;
        const Re = () => {
          ze.toBlob((q) => {
            if (!q) {
              we(new Error("Failed to compress image"));
              return;
            }
            if (q.size / 1024 > V && K > 0.3)
              K -= 0.1, Re();
            else {
              const M = new FileReader();
              M.onload = () => {
                const Ne = M.result.split(",")[1];
                j({ blob: q, base64: Ne });
              }, M.readAsDataURL(q);
            }
          }, U.type === "image/png" ? "image/png" : "image/jpeg", K);
        };
        Re();
      }, He.onerror = () => we(new Error("Failed to load image")), He.src = (fe = $e.target) == null ? void 0 : fe.result;
    }, Ue.onerror = () => we(new Error("Failed to read file")), Ue.readAsDataURL(U);
  }), H = async (U) => {
    if (n.value.length >= 3) {
      alert("Maximum 3 files allowed per message");
      return;
    }
    const $e = 3 - n.value.length, He = U.slice(0, $e);
    U.length > $e && alert(`Only ${$e} more file(s) can be uploaded. Maximum 3 files per message.`);
    for (const fe of He)
      try {
        if (n.value.some((J) => J.filename === fe.name)) {
          console.warn(`File ${fe.name} is already selected`), alert(`File "${fe.name}" is already selected`);
          continue;
        }
        const Ve = fe.type.startsWith("image/"), Ge = Ve ? 5242880 : 10485760;
        if (fe.size > Ge) {
          const J = Ge / 1048576;
          console.error(`File ${fe.name} is too large. Maximum size is ${J}MB`), alert(`File "${fe.name}" is too large. Maximum size for ${Ve ? "images" : "documents"} is ${J}MB`);
          continue;
        }
        if (Ve)
          try {
            const { blob: J, base64: se } = await D(fe, 500), K = J.size;
            console.log(`Compressed ${fe.name}: ${(fe.size / 1024).toFixed(2)}KB → ${(K / 1024).toFixed(2)}KB`), n.value.push({
              content: se,
              filename: fe.name,
              type: fe.type,
              size: K,
              url: URL.createObjectURL(J),
              file_url: URL.createObjectURL(J)
            });
          } catch (J) {
            console.error("Image compression failed, uploading original:", J);
            const se = new FileReader();
            se.onload = (K) => {
              var de;
              const q = ((de = K.target) == null ? void 0 : de.result).split(",")[1];
              n.value.push({
                content: q,
                filename: fe.name,
                type: fe.type,
                size: fe.size,
                url: URL.createObjectURL(fe),
                file_url: URL.createObjectURL(fe)
              });
            }, se.readAsDataURL(fe);
          }
        else {
          const J = new FileReader();
          J.onload = (se) => {
            var q;
            const Re = ((q = se.target) == null ? void 0 : q.result).split(",")[1];
            n.value.push({
              content: Re,
              filename: fe.name,
              type: fe.type || "application/octet-stream",
              size: fe.size,
              url: "",
              file_url: ""
            });
          }, J.readAsDataURL(fe);
        }
      } catch (ze) {
        console.error("File upload error:", ze);
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
    handleFileSelect: h,
    handleDrop: c,
    handleDragOver: v,
    handleDragLeave: y,
    handlePaste: $,
    uploadFiles: H,
    removeAttachment: async (U) => {
      const V = n.value[U];
      if (V) {
        try {
          let j = V.url;
          j.startsWith("/uploads/") ? j = j.substring(9) : j.startsWith("/") && (j = j.substring(1)), j.includes("amazonaws.com/") && (j = j.split("amazonaws.com/")[1]);
          const we = {};
          e.value && (we.Authorization = `Bearer ${e.value}`);
          const Ue = await fetch(`${yn.API_URL}/api/v1/files/upload/${j}`, {
            method: "DELETE",
            headers: we
          });
          if (Ue.ok)
            console.log("File deleted successfully from backend.");
          else {
            const $e = await Ue.json();
            console.error("Failed to delete file:", $e.detail);
          }
        } catch (j) {
          console.error("Error calling delete API:", j);
        }
        V.url && V.url.startsWith("blob:") && URL.revokeObjectURL(V.url), V.file_url && V.file_url.startsWith("blob:") && URL.revokeObjectURL(V.file_url), n.value.splice(U, 1);
      }
    },
    openPreview: (U) => {
      r.value = U, s.value = !0;
    },
    closePreview: () => {
      s.value = !1, setTimeout(() => {
        r.value = null;
      }, 300);
    },
    openFilePicker: () => {
      var U;
      (U = t.value) == null || U.click();
    },
    isImage: (U) => U.startsWith("image/")
  };
}
const Ut = /* @__PURE__ */ Object.create(null);
Ut.open = "0";
Ut.close = "1";
Ut.ping = "2";
Ut.pong = "3";
Ut.message = "4";
Ut.upgrade = "5";
Ut.noop = "6";
const bs = /* @__PURE__ */ Object.create(null);
Object.keys(Ut).forEach((e) => {
  bs[Ut[e]] = e;
});
const Er = { type: "error", data: "parser error" }, Ml = typeof Blob == "function" || typeof Blob < "u" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]", Dl = typeof ArrayBuffer == "function", ql = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e && e.buffer instanceof ArrayBuffer, li = ({ type: e, data: t }, n, s) => Ml && t instanceof Blob ? n ? s(t) : _o(t, s) : Dl && (t instanceof ArrayBuffer || ql(t)) ? n ? s(t) : _o(new Blob([t]), s) : s(Ut[e] + (t || "")), _o = (e, t) => {
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
function Af(e, t) {
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
const Ef = (e) => {
  let t = e.length * 0.75, n = e.length, s, r = 0, i, o, l, a;
  e[e.length - 1] === "=" && (t--, e[e.length - 2] === "=" && t--);
  const h = new ArrayBuffer(t), c = new Uint8Array(h);
  for (s = 0; s < n; s += 4)
    i = zn[e.charCodeAt(s)], o = zn[e.charCodeAt(s + 1)], l = zn[e.charCodeAt(s + 2)], a = zn[e.charCodeAt(s + 3)], c[r++] = i << 2 | o >> 4, c[r++] = (o & 15) << 4 | l >> 2, c[r++] = (l & 3) << 6 | a & 63;
  return h;
}, Rf = typeof ArrayBuffer == "function", ai = (e, t) => {
  if (typeof e != "string")
    return {
      type: "message",
      data: Ul(e, t)
    };
  const n = e.charAt(0);
  return n === "b" ? {
    type: "message",
    data: If(e.substring(1), t)
  } : bs[n] ? e.length > 1 ? {
    type: bs[n],
    data: e.substring(1)
  } : {
    type: bs[n]
  } : Er;
}, If = (e, t) => {
  if (Rf) {
    const n = Ef(e);
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
}, Hl = "", Lf = (e, t) => {
  const n = e.length, s = new Array(n);
  let r = 0;
  e.forEach((i, o) => {
    li(i, !1, (l) => {
      s[o] = l, ++r === n && t(s.join(Hl));
    });
  });
}, Of = (e, t) => {
  const n = e.split(Hl), s = [];
  for (let r = 0; r < n.length; r++) {
    const i = ai(n[r], t);
    if (s.push(i), i.type === "error")
      break;
  }
  return s;
};
function Pf() {
  return new TransformStream({
    transform(e, t) {
      Af(e, (n) => {
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
function hs(e) {
  return e.reduce((t, n) => t + n.length, 0);
}
function ds(e, t) {
  if (e[0].length === t)
    return e.shift();
  const n = new Uint8Array(t);
  let s = 0;
  for (let r = 0; r < t; r++)
    n[r] = e[0][s++], s === e[0].length && (e.shift(), s = 0);
  return e.length && s < e[0].length && (e[0] = e[0].slice(s)), n;
}
function $f(e, t) {
  ar || (ar = new TextDecoder());
  const n = [];
  let s = 0, r = -1, i = !1;
  return new TransformStream({
    transform(o, l) {
      for (n.push(o); ; ) {
        if (s === 0) {
          if (hs(n) < 1)
            break;
          const a = ds(n, 1);
          i = (a[0] & 128) === 128, r = a[0] & 127, r < 126 ? s = 3 : r === 126 ? s = 1 : s = 2;
        } else if (s === 1) {
          if (hs(n) < 2)
            break;
          const a = ds(n, 2);
          r = new DataView(a.buffer, a.byteOffset, a.length).getUint16(0), s = 3;
        } else if (s === 2) {
          if (hs(n) < 8)
            break;
          const a = ds(n, 8), h = new DataView(a.buffer, a.byteOffset, a.length), c = h.getUint32(0);
          if (c > Math.pow(2, 21) - 1) {
            l.enqueue(Er);
            break;
          }
          r = c * Math.pow(2, 32) + h.getUint32(4), s = 3;
        } else {
          if (hs(n) < r)
            break;
          const a = ds(n, r);
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
const zl = 4;
function Ke(e) {
  if (e) return Ff(e);
}
function Ff(e) {
  for (var t in Ke.prototype)
    e[t] = Ke.prototype[t];
  return e;
}
Ke.prototype.on = Ke.prototype.addEventListener = function(e, t) {
  return this._callbacks = this._callbacks || {}, (this._callbacks["$" + e] = this._callbacks["$" + e] || []).push(t), this;
};
Ke.prototype.once = function(e, t) {
  function n() {
    this.off(e, n), t.apply(this, arguments);
  }
  return n.fn = t, this.on(e, n), this;
};
Ke.prototype.off = Ke.prototype.removeListener = Ke.prototype.removeAllListeners = Ke.prototype.removeEventListener = function(e, t) {
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
Ke.prototype.emit = function(e) {
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
Ke.prototype.emitReserved = Ke.prototype.emit;
Ke.prototype.listeners = function(e) {
  return this._callbacks = this._callbacks || {}, this._callbacks["$" + e] || [];
};
Ke.prototype.hasListeners = function(e) {
  return !!this.listeners(e).length;
};
const Ws = typeof Promise == "function" && typeof Promise.resolve == "function" ? (t) => Promise.resolve().then(t) : (t, n) => n(t, 0), Ct = typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")(), Bf = "arraybuffer";
function Vl(e, ...t) {
  return t.reduce((n, s) => (e.hasOwnProperty(s) && (n[s] = e[s]), n), {});
}
const Nf = Ct.setTimeout, Mf = Ct.clearTimeout;
function js(e, t) {
  t.useNativeTimers ? (e.setTimeoutFn = Nf.bind(Ct), e.clearTimeoutFn = Mf.bind(Ct)) : (e.setTimeoutFn = Ct.setTimeout.bind(Ct), e.clearTimeoutFn = Ct.clearTimeout.bind(Ct));
}
const Df = 1.33;
function qf(e) {
  return typeof e == "string" ? Uf(e) : Math.ceil((e.byteLength || e.size) * Df);
}
function Uf(e) {
  let t = 0, n = 0;
  for (let s = 0, r = e.length; s < r; s++)
    t = e.charCodeAt(s), t < 128 ? n += 1 : t < 2048 ? n += 2 : t < 55296 || t >= 57344 ? n += 3 : (s++, n += 4);
  return n;
}
function Wl() {
  return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
}
function Hf(e) {
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
class Vf extends Error {
  constructor(t, n, s) {
    super(t), this.description = n, this.context = s, this.type = "TransportError";
  }
}
class ci extends Ke {
  /**
   * Transport abstract constructor.
   *
   * @param {Object} opts - options
   * @protected
   */
  constructor(t) {
    super(), this.writable = !1, js(this, t), this.opts = t, this.query = t.query, this.socket = t.socket, this.supportsBinary = !t.forceBase64;
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
    return super.emitReserved("error", new Vf(t, n, s)), this;
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
    const n = Hf(t);
    return n.length ? "?" + n : "";
  }
}
class Wf extends ci {
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
    Of(t, this.socket.binaryType).forEach(n), this.readyState !== "closed" && (this._polling = !1, this.emitReserved("pollComplete"), this.readyState === "open" && this._poll());
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
    this.writable = !1, Lf(t, (n) => {
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
const jf = jl;
function Kf() {
}
class Zf extends Wf {
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
class Dt extends Ke {
  /**
   * Request constructor
   *
   * @param {Object} options
   * @package
   */
  constructor(t, n, s) {
    super(), this.createRequest = t, js(this, s), this._opts = s, this._method = s.method || "GET", this._uri = n, this._data = s.data !== void 0 ? s.data : null, this._create();
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
    typeof document < "u" && (this._index = Dt.requestsCount++, Dt.requests[this._index] = this);
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
      if (this._xhr.onreadystatechange = Kf, t)
        try {
          this._xhr.abort();
        } catch {
        }
      typeof document < "u" && delete Dt.requests[this._index], this._xhr = null;
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
Dt.requestsCount = 0;
Dt.requests = {};
if (typeof document < "u") {
  if (typeof attachEvent == "function")
    attachEvent("onunload", bo);
  else if (typeof addEventListener == "function") {
    const e = "onpagehide" in Ct ? "pagehide" : "unload";
    addEventListener(e, bo, !1);
  }
}
function bo() {
  for (let e in Dt.requests)
    Dt.requests.hasOwnProperty(e) && Dt.requests[e].abort();
}
const Gf = function() {
  const e = Kl({
    xdomain: !1
  });
  return e && e.responseType !== null;
}();
class Yf extends Zf {
  constructor(t) {
    super(t);
    const n = t && t.forceBase64;
    this.supportsBinary = Gf && !n;
  }
  request(t = {}) {
    return Object.assign(t, { xd: this.xd }, this.opts), new Dt(Kl, this.uri(), t);
  }
}
function Kl(e) {
  const t = e.xdomain;
  try {
    if (typeof XMLHttpRequest < "u" && (!t || jf))
      return new XMLHttpRequest();
  } catch {
  }
  if (!t)
    try {
      return new Ct[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
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
        r && Ws(() => {
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
const cr = Ct.WebSocket || Ct.MozWebSocket;
class Jf extends Xf {
  createSocket(t, n, s) {
    return Zl ? new cr(t, n, s) : n ? new cr(t, n) : new cr(t);
  }
  doWrite(t, n) {
    this.ws.send(n);
  }
}
class Qf extends ci {
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
        const n = $f(Number.MAX_SAFE_INTEGER, this.socket.binaryType), s = t.readable.pipeThrough(n).getReader(), r = Pf();
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
        r && Ws(() => {
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
const eh = {
  websocket: Jf,
  webtransport: Qf,
  polling: Yf
}, th = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/, nh = [
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
  let r = th.exec(e || ""), i = {}, o = 14;
  for (; o--; )
    i[nh[o]] = r[o] || "";
  return n != -1 && s != -1 && (i.source = t, i.host = i.host.substring(1, i.host.length - 1).replace(/;/g, ":"), i.authority = i.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), i.ipv6uri = !0), i.pathNames = sh(i, i.path), i.queryKey = rh(i, i.query), i;
}
function sh(e, t) {
  const n = /\/{2,9}/g, s = t.replace(n, "/").split("/");
  return (t.slice(0, 1) == "/" || t.length === 0) && s.splice(0, 1), t.slice(-1) == "/" && s.splice(s.length - 1, 1), s;
}
function rh(e, t) {
  const n = {};
  return t.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function(s, r, i) {
    r && (n[r] = i);
  }), n;
}
const Ir = typeof addEventListener == "function" && typeof removeEventListener == "function", ws = [];
Ir && addEventListener("offline", () => {
  ws.forEach((e) => e());
}, !1);
class on extends Ke {
  /**
   * Socket constructor.
   *
   * @param {String|Object} uri - uri or options
   * @param {Object} opts - options
   */
  constructor(t, n) {
    if (super(), this.binaryType = Bf, this.writeBuffer = [], this._prevBufferLen = 0, this._pingInterval = -1, this._pingTimeout = -1, this._maxPayload = -1, this._pingTimeoutTime = 1 / 0, t && typeof t == "object" && (n = t, t = null), t) {
      const s = Rr(t);
      n.hostname = s.host, n.secure = s.protocol === "https" || s.protocol === "wss", n.port = s.port, s.query && (n.query = s.query);
    } else n.host && (n.hostname = Rr(n.host).host);
    js(this, n), this.secure = n.secure != null ? n.secure : typeof location < "u" && location.protocol === "https:", n.hostname && !n.port && (n.port = this.secure ? "443" : "80"), this.hostname = n.hostname || (typeof location < "u" ? location.hostname : "localhost"), this.port = n.port || (typeof location < "u" && location.port ? location.port : this.secure ? "443" : "80"), this.transports = [], this._transportsByName = {}, n.transports.forEach((s) => {
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
    }, ws.push(this._offlineEventListener))), this.opts.withCredentials && (this._cookieJar = void 0), this._open();
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
    n.EIO = zl, n.transport = t, this.id && (n.sid = this.id);
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
      if (r && (n += qf(r)), s > 0 && n > this._maxPayload)
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
    return t && (this._pingTimeoutTime = 0, Ws(() => {
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
        const s = ws.indexOf(this._offlineEventListener);
        s !== -1 && ws.splice(s, 1);
      }
      this.readyState = "closed", this.id = null, this.emitReserved("close", t, n), this.writeBuffer = [], this._prevBufferLen = 0;
    }
  }
}
on.protocol = zl;
class ih extends on {
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
      s || (n.send([{ type: "ping", data: "probe" }]), n.once("packet", (v) => {
        if (!s)
          if (v.type === "pong" && v.data === "probe") {
            if (this.upgrading = !0, this.emitReserved("upgrading", n), !n)
              return;
            on.priorWebsocketSuccess = n.name === "websocket", this.transport.pause(() => {
              s || this.readyState !== "closed" && (c(), this.setTransport(n), n.send([{ type: "upgrade" }]), this.emitReserved("upgrade", n), n = null, this.upgrading = !1, this.flush());
            });
          } else {
            const y = new Error("probe error");
            y.transport = n.name, this.emitReserved("upgradeError", y);
          }
      }));
    };
    function i() {
      s || (s = !0, c(), n.close(), n = null);
    }
    const o = (v) => {
      const y = new Error("probe error: " + v);
      y.transport = n.name, i(), this.emitReserved("upgradeError", y);
    };
    function l() {
      o("transport closed");
    }
    function a() {
      o("socket closed");
    }
    function h(v) {
      n && v.name !== n.name && i();
    }
    const c = () => {
      n.removeListener("open", r), n.removeListener("error", o), n.removeListener("close", l), this.off("close", a), this.off("upgrading", h);
    };
    n.once("open", r), n.once("error", o), n.once("close", l), this.once("close", a), this.once("upgrading", h), this._upgrades.indexOf("webtransport") !== -1 && t !== "webtransport" ? this.setTimeoutFn(() => {
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
let oh = class extends ih {
  constructor(t, n = {}) {
    const s = typeof t == "object" ? t : n;
    (!s.transports || s.transports && typeof s.transports[0] == "string") && (s.transports = (s.transports || ["polling", "websocket", "webtransport"]).map((r) => eh[r]).filter((r) => !!r)), super(t, s);
  }
};
function lh(e, t = "", n) {
  let s = e;
  n = n || typeof location < "u" && location, e == null && (e = n.protocol + "//" + n.host), typeof e == "string" && (e.charAt(0) === "/" && (e.charAt(1) === "/" ? e = n.protocol + e : e = n.host + e), /^(https?|wss?):\/\//.test(e) || (typeof n < "u" ? e = n.protocol + "//" + e : e = "https://" + e), s = Rr(e)), s.port || (/^(http|ws)$/.test(s.protocol) ? s.port = "80" : /^(http|ws)s$/.test(s.protocol) && (s.port = "443")), s.path = s.path || "/";
  const i = s.host.indexOf(":") !== -1 ? "[" + s.host + "]" : s.host;
  return s.id = s.protocol + "://" + i + ":" + s.port + t, s.href = s.protocol + "://" + i + (n && n.port === s.port ? "" : ":" + s.port), s;
}
const ah = typeof ArrayBuffer == "function", ch = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e.buffer instanceof ArrayBuffer, Gl = Object.prototype.toString, uh = typeof Blob == "function" || typeof Blob < "u" && Gl.call(Blob) === "[object BlobConstructor]", fh = typeof File == "function" || typeof File < "u" && Gl.call(File) === "[object FileConstructor]";
function ui(e) {
  return ah && (e instanceof ArrayBuffer || ch(e)) || uh && e instanceof Blob || fh && e instanceof File;
}
function ks(e, t) {
  if (!e || typeof e != "object")
    return !1;
  if (Array.isArray(e)) {
    for (let n = 0, s = e.length; n < s; n++)
      if (ks(e[n]))
        return !0;
    return !1;
  }
  if (ui(e))
    return !0;
  if (e.toJSON && typeof e.toJSON == "function" && arguments.length === 1)
    return ks(e.toJSON(), !0);
  for (const n in e)
    if (Object.prototype.hasOwnProperty.call(e, n) && ks(e[n]))
      return !0;
  return !1;
}
function hh(e) {
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
function dh(e, t) {
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
const ph = [
  "connect",
  "connect_error",
  "disconnect",
  "disconnecting",
  "newListener",
  "removeListener"
  // used by the Node.js EventEmitter
], gh = 5;
var me;
(function(e) {
  e[e.CONNECT = 0] = "CONNECT", e[e.DISCONNECT = 1] = "DISCONNECT", e[e.EVENT = 2] = "EVENT", e[e.ACK = 3] = "ACK", e[e.CONNECT_ERROR = 4] = "CONNECT_ERROR", e[e.BINARY_EVENT = 5] = "BINARY_EVENT", e[e.BINARY_ACK = 6] = "BINARY_ACK";
})(me || (me = {}));
class mh {
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
    return (t.type === me.EVENT || t.type === me.ACK) && ks(t) ? this.encodeAsBinary({
      type: t.type === me.EVENT ? me.BINARY_EVENT : me.BINARY_ACK,
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
    return (t.type === me.BINARY_EVENT || t.type === me.BINARY_ACK) && (n += t.attachments + "-"), t.nsp && t.nsp !== "/" && (n += t.nsp + ","), t.id != null && (n += t.id), t.data != null && (n += JSON.stringify(t.data, this.replacer)), n;
  }
  /**
   * Encode packet as 'buffer sequence' by removing blobs, and
   * deconstructing packet into object with placeholders and
   * a list of buffers.
   */
  encodeAsBinary(t) {
    const n = hh(t), s = this.encodeAsString(n.packet), r = n.buffers;
    return r.unshift(s), r;
  }
}
function wo(e) {
  return Object.prototype.toString.call(e) === "[object Object]";
}
class fi extends Ke {
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
      const s = n.type === me.BINARY_EVENT;
      s || n.type === me.BINARY_ACK ? (n.type = s ? me.EVENT : me.ACK, this.reconstructor = new _h(n), n.attachments === 0 && super.emitReserved("decoded", n)) : super.emitReserved("decoded", n);
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
    if (me[s.type] === void 0)
      throw new Error("unknown packet type " + s.type);
    if (s.type === me.BINARY_EVENT || s.type === me.BINARY_ACK) {
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
      case me.CONNECT:
        return wo(n);
      case me.DISCONNECT:
        return n === void 0;
      case me.CONNECT_ERROR:
        return typeof n == "string" || wo(n);
      case me.EVENT:
      case me.BINARY_EVENT:
        return Array.isArray(n) && (typeof n[0] == "number" || typeof n[0] == "string" && ph.indexOf(n[0]) === -1);
      case me.ACK:
      case me.BINARY_ACK:
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
class _h {
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
      const n = dh(this.reconPack, this.buffers);
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
const yh = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Decoder: fi,
  Encoder: mh,
  get PacketType() {
    return me;
  },
  protocol: gh
}, Symbol.toStringTag, { value: "Module" }));
function Rt(e, t, n) {
  return e.on(t, n), function() {
    e.off(t, n);
  };
}
const vh = Object.freeze({
  connect: 1,
  connect_error: 1,
  disconnect: 1,
  disconnecting: 1,
  // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
  newListener: 1,
  removeListener: 1
});
class Yl extends Ke {
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
    if (vh.hasOwnProperty(t))
      throw new Error('"' + t.toString() + '" is a reserved event name');
    if (n.unshift(t), this._opts.retries && !this.flags.fromQueue && !this.flags.volatile)
      return this._addToQueue(n), this;
    const o = {
      type: me.EVENT,
      data: n
    };
    if (o.options = {}, o.options.compress = this.flags.compress !== !1, typeof n[n.length - 1] == "function") {
      const c = this.ids++, v = n.pop();
      this._registerAckCallback(c, v), o.id = c;
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
      type: me.CONNECT,
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
        case me.CONNECT:
          t.data && t.data.sid ? this.onconnect(t.data.sid, t.data.pid) : this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
          break;
        case me.EVENT:
        case me.BINARY_EVENT:
          this.onevent(t);
          break;
        case me.ACK:
        case me.BINARY_ACK:
          this.onack(t);
          break;
        case me.DISCONNECT:
          this.ondisconnect();
          break;
        case me.CONNECT_ERROR:
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
        type: me.ACK,
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
    return this.connected && this.packet({ type: me.DISCONNECT }), this.destroy(), this.connected && this.onclose("io client disconnect"), this;
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
class Pr extends Ke {
  constructor(t, n) {
    var s;
    super(), this.nsps = {}, this.subs = [], t && typeof t == "object" && (n = t, t = void 0), n = n || {}, n.path = n.path || "/socket.io", this.opts = n, js(this, n), this.reconnection(n.reconnection !== !1), this.reconnectionAttempts(n.reconnectionAttempts || 1 / 0), this.reconnectionDelay(n.reconnectionDelay || 1e3), this.reconnectionDelayMax(n.reconnectionDelayMax || 5e3), this.randomizationFactor((s = n.randomizationFactor) !== null && s !== void 0 ? s : 0.5), this.backoff = new Pn({
      min: this.reconnectionDelay(),
      max: this.reconnectionDelayMax(),
      jitter: this.randomizationFactor()
    }), this.timeout(n.timeout == null ? 2e4 : n.timeout), this._readyState = "closed", this.uri = t;
    const r = n.parser || yh;
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
    this.engine = new oh(this.uri, this.opts);
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
    Ws(() => {
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
    return s ? this._autoConnect && !s.active && s.connect() : (s = new Yl(this, t, n), this.nsps[t] = s), s;
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
const Un = {};
function xs(e, t) {
  typeof e == "object" && (t = e, e = void 0), t = t || {};
  const n = lh(e, t.path || "/socket.io"), s = n.source, r = n.id, i = n.path, o = Un[r] && i in Un[r].nsps, l = t.forceNew || t["force new connection"] || t.multiplex === !1 || o;
  let a;
  return l ? a = new Pr(s, t) : (Un[r] || (Un[r] = new Pr(s, t)), a = Un[r]), n.query && !t.query && (t.query = n.queryKey), a.socket(n.path, t);
}
Object.assign(xs, {
  Manager: Pr,
  Socket: Yl,
  io: xs,
  connect: xs
});
function bh() {
  const e = ue([]), t = ue(!1), n = ue(""), s = ue(!1), r = ue(!1), i = ue(!1), o = ue("connecting"), l = ue(0), a = 5, h = ue({}), c = ue(null), v = ue("");
  let y = null, $ = null, D = null, H = null;
  const oe = (q) => {
    const de = localStorage.getItem("ctid");
    return y = xs(`${yn.WS_URL}/widget`, {
      transports: ["websocket"],
      reconnection: !0,
      reconnectionAttempts: a,
      reconnectionDelay: 1e3,
      auth: de ? {
        conversation_token: de
      } : void 0
    }), y.on("connect", () => {
      o.value = "connected", l.value = 0;
    }), y.on("disconnect", () => {
      o.value === "connected" && (console.log("Socket disconnected, setting connection status to connecting"), o.value = "connecting");
    }), y.on("connect_error", () => {
      l.value++, console.error("Socket connection failed, attempt:", l.value, "connection status:", o.value), l.value >= a && (o.value = "failed");
    }), y.on("chat_response", (M) => {
      if (t.value = !1, M.session_id ? (console.log("Captured session_id from chat_response:", M.session_id), v.value = M.session_id) : console.warn("No session_id in chat_response data:", M), M.type === "agent_message") {
        const Ne = {
          message: M.message,
          message_type: "agent",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          session_id: "",
          agent_name: M.agent_name,
          attributes: {
            end_chat: M.end_chat,
            end_chat_reason: M.end_chat_reason,
            end_chat_description: M.end_chat_description,
            request_rating: M.request_rating
          }
        };
        M.attachments && Array.isArray(M.attachments) && (Ne.id = M.message_id, Ne.attachments = M.attachments.map((Fe, Et) => ({
          id: M.message_id * 1e3 + Et,
          filename: Fe.filename,
          file_url: Fe.file_url,
          content_type: Fe.content_type,
          file_size: Fe.file_size
        }))), e.value.push(Ne);
      } else M.shopify_output && typeof M.shopify_output == "object" && M.shopify_output.products ? e.value.push({
        message: M.message,
        // Keep the accompanying text message
        message_type: "product",
        // Use 'product' type for rendering
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: "",
        agent_name: M.agent_name,
        // Assign the whole structured object
        shopify_output: M.shopify_output,
        // Remove the old flattened fields (product_id, product_title, etc.)
        attributes: {
          // Keep other attributes if needed
          end_chat: M.end_chat,
          request_rating: M.request_rating
        }
      }) : e.value.push({
        message: M.message,
        message_type: "bot",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: "",
        agent_name: M.agent_name,
        attributes: {
          end_chat: M.end_chat,
          end_chat_reason: M.end_chat_reason,
          end_chat_description: M.end_chat_description,
          request_rating: M.request_rating
        }
      });
    }), y.on("handle_taken_over", (M) => {
      e.value.push({
        message: `${M.user_name} joined the conversation`,
        message_type: "system",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: M.session_id
      }), h.value = {
        ...h.value,
        human_agent_name: M.user_name,
        human_agent_profile_pic: M.profile_picture
      }, $ && $(M);
    }), y.on("error", V), y.on("chat_history", j), y.on("rating_submitted", we), y.on("display_form", Ue), y.on("form_submitted", $e), y.on("workflow_state", He), y.on("workflow_proceeded", fe), y;
  }, le = async () => {
    try {
      return o.value = "connecting", l.value = 0, y && (y.removeAllListeners(), y.disconnect(), y = null), y = oe(""), new Promise((q) => {
        y == null || y.on("connect", () => {
          q(!0);
        }), y == null || y.on("connect_error", () => {
          l.value >= a && q(!1);
        });
      });
    } catch (q) {
      return console.error("Socket initialization failed:", q), o.value = "failed", !1;
    }
  }, ve = () => (y && y.disconnect(), le()), be = (q) => {
    $ = q;
  }, z = (q) => {
    D = q;
  }, U = (q) => {
    H = q;
  }, V = (q) => {
    t.value = !1, n.value = Uu(q), s.value = !0, setTimeout(() => {
      s.value = !1, n.value = "";
    }, 5e3);
  }, j = (q) => {
    if (q.type === "chat_history" && Array.isArray(q.messages)) {
      const de = q.messages.map((M) => {
        var Fe;
        const Ne = {
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
        return (Fe = M.attributes) != null && Fe.shopify_output && typeof M.attributes.shopify_output == "object" ? {
          ...Ne,
          message_type: "product",
          shopify_output: M.attributes.shopify_output
        } : Ne;
      });
      e.value = [
        ...de.filter(
          (M) => !e.value.some(
            (Ne) => Ne.message === M.message && Ne.created_at === M.created_at
          )
        ),
        ...e.value
      ];
    }
  }, we = (q) => {
    q.success && e.value.push({
      message: "Thank you for your feedback!",
      message_type: "system",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: ""
    });
  }, Ue = (q) => {
    var de;
    console.log("Form display handler in composable:", q), t.value = !1, c.value = q.form_data, console.log("Set currentForm in handleDisplayForm:", c.value), ((de = q.form_data) == null ? void 0 : de.form_full_screen) === !0 ? (console.log("Full screen form detected, triggering workflow state callback"), D && D({
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
  }, $e = (q) => {
    console.log("Form submitted confirmation received, clearing currentForm"), c.value = null, q.success && console.log("Form submitted successfully");
  }, He = (q) => {
    console.log("Workflow state received in composable:", q), (q.type === "form" || q.type === "display_form") && (console.log("Setting currentForm from workflow state:", q.form_data), c.value = q.form_data), D && D(q);
  }, fe = (q) => {
    console.log("Workflow proceeded in composable:", q), H && H(q);
  };
  return {
    messages: e,
    loading: t,
    errorMessage: n,
    showError: s,
    loadingHistory: r,
    hasStartedChat: i,
    connectionStatus: o,
    sendMessage: async (q, de, M = []) => {
      if (!y || !q.trim() && M.length === 0) return;
      h.value.human_agent_name || (t.value = !0);
      const Ne = {
        message: q,
        message_type: "user",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: ""
      };
      M.length > 0 && (Ne.attachments = M.map((Fe, Et) => {
        let et = "";
        if (Fe.content_type.startsWith("image/")) {
          const ct = atob(Fe.content), _t = new Array(ct.length);
          for (let Je = 0; Je < ct.length; Je++)
            _t[Je] = ct.charCodeAt(Je);
          const yt = new Uint8Array(_t), tt = new Blob([yt], { type: Fe.content_type });
          et = URL.createObjectURL(tt);
        }
        return {
          id: Date.now() * 1e3 + Et,
          // Temporary ID
          filename: Fe.filename,
          file_url: et,
          // Temporary blob URL, will be replaced
          content_type: Fe.content_type,
          file_size: Fe.size,
          _isTemporary: !0
          // Flag to identify temporary attachments
        };
      })), e.value.push(Ne), y.emit("chat", {
        message: q,
        email: de,
        files: M
        // Send files with base64 content
      }), i.value = !0;
    },
    loadChatHistory: async () => {
      if (y)
        try {
          r.value = !0, y.emit("get_chat_history");
        } catch (q) {
          console.error("Failed to load chat history:", q);
        } finally {
          r.value = !1;
        }
    },
    connect: le,
    reconnect: ve,
    cleanup: () => {
      y && (y.removeAllListeners(), y.disconnect(), y = null), $ = null, D = null, H = null;
    },
    humanAgent: h,
    onTakeover: be,
    submitRating: async (q, de) => {
      !y || !q || y.emit("submit_rating", {
        rating: q,
        feedback: de
      });
    },
    currentForm: c,
    submitForm: async (q) => {
      if (console.log("Submitting form in socket:", q), console.log("Current form in socket:", c.value), console.log("Socket in socket:", y), !y) {
        console.error("No socket available for form submission");
        return;
      }
      if (!q || Object.keys(q).length === 0) {
        console.error("No form data to submit");
        return;
      }
      console.log("Emitting submit_form event with data:", q), y.emit("submit_form", {
        form_data: q
      }), c.value = null;
    },
    getWorkflowState: async () => {
      y && (console.log("Getting workflow state 12"), y.emit("get_workflow_state"));
    },
    proceedWorkflow: async () => {
      y && y.emit("proceed_workflow", {});
    },
    onWorkflowState: z,
    onWorkflowProceeded: U,
    currentSessionId: v
  };
}
function wh(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var ur = { exports: {} }, ko;
function kh() {
  return ko || (ko = 1, function(e) {
    (function() {
      function t(u, g, S) {
        return u.call.apply(u.bind, arguments);
      }
      function n(u, g, S) {
        if (!u) throw Error();
        if (2 < arguments.length) {
          var k = Array.prototype.slice.call(arguments, 2);
          return function() {
            var O = Array.prototype.slice.call(arguments);
            return Array.prototype.unshift.apply(O, k), u.apply(g, O);
          };
        }
        return function() {
          return u.apply(g, arguments);
        };
      }
      function s(u, g, S) {
        return s = Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1 ? t : n, s.apply(null, arguments);
      }
      var r = Date.now || function() {
        return +/* @__PURE__ */ new Date();
      };
      function i(u, g) {
        this.a = u, this.o = g || u, this.c = this.o.document;
      }
      var o = !!window.FontFace;
      function l(u, g, S, k) {
        if (g = u.c.createElement(g), S) for (var O in S) S.hasOwnProperty(O) && (O == "style" ? g.style.cssText = S[O] : g.setAttribute(O, S[O]));
        return k && g.appendChild(u.c.createTextNode(k)), g;
      }
      function a(u, g, S) {
        u = u.c.getElementsByTagName(g)[0], u || (u = document.documentElement), u.insertBefore(S, u.lastChild);
      }
      function h(u) {
        u.parentNode && u.parentNode.removeChild(u);
      }
      function c(u, g, S) {
        g = g || [], S = S || [];
        for (var k = u.className.split(/\s+/), O = 0; O < g.length; O += 1) {
          for (var W = !1, X = 0; X < k.length; X += 1) if (g[O] === k[X]) {
            W = !0;
            break;
          }
          W || k.push(g[O]);
        }
        for (g = [], O = 0; O < k.length; O += 1) {
          for (W = !1, X = 0; X < S.length; X += 1) if (k[O] === S[X]) {
            W = !0;
            break;
          }
          W || g.push(k[O]);
        }
        u.className = g.join(" ").replace(/\s+/g, " ").replace(/^\s+|\s+$/, "");
      }
      function v(u, g) {
        for (var S = u.className.split(/\s+/), k = 0, O = S.length; k < O; k++) if (S[k] == g) return !0;
        return !1;
      }
      function y(u) {
        return u.o.location.hostname || u.a.location.hostname;
      }
      function $(u, g, S) {
        function k() {
          _e && O && W && (_e(X), _e = null);
        }
        g = l(u, "link", { rel: "stylesheet", href: g, media: "all" });
        var O = !1, W = !0, X = null, _e = S || null;
        o ? (g.onload = function() {
          O = !0, k();
        }, g.onerror = function() {
          O = !0, X = Error("Stylesheet failed to load"), k();
        }) : setTimeout(function() {
          O = !0, k();
        }, 0), a(u, "head", g);
      }
      function D(u, g, S, k) {
        var O = u.c.getElementsByTagName("head")[0];
        if (O) {
          var W = l(u, "script", { src: g }), X = !1;
          return W.onload = W.onreadystatechange = function() {
            X || this.readyState && this.readyState != "loaded" && this.readyState != "complete" || (X = !0, S && S(null), W.onload = W.onreadystatechange = null, W.parentNode.tagName == "HEAD" && O.removeChild(W));
          }, O.appendChild(W), setTimeout(function() {
            X || (X = !0, S && S(Error("Script load timeout")));
          }, k || 5e3), W;
        }
        return null;
      }
      function H() {
        this.a = 0, this.c = null;
      }
      function oe(u) {
        return u.a++, function() {
          u.a--, ve(u);
        };
      }
      function le(u, g) {
        u.c = g, ve(u);
      }
      function ve(u) {
        u.a == 0 && u.c && (u.c(), u.c = null);
      }
      function be(u) {
        this.a = u || "-";
      }
      be.prototype.c = function(u) {
        for (var g = [], S = 0; S < arguments.length; S++) g.push(arguments[S].replace(/[\W_]+/g, "").toLowerCase());
        return g.join(this.a);
      };
      function z(u, g) {
        this.c = u, this.f = 4, this.a = "n";
        var S = (g || "n4").match(/^([nio])([1-9])$/i);
        S && (this.a = S[1], this.f = parseInt(S[2], 10));
      }
      function U(u) {
        return we(u) + " " + (u.f + "00") + " 300px " + V(u.c);
      }
      function V(u) {
        var g = [];
        u = u.split(/,\s*/);
        for (var S = 0; S < u.length; S++) {
          var k = u[S].replace(/['"]/g, "");
          k.indexOf(" ") != -1 || /^\d/.test(k) ? g.push("'" + k + "'") : g.push(k);
        }
        return g.join(",");
      }
      function j(u) {
        return u.a + u.f;
      }
      function we(u) {
        var g = "normal";
        return u.a === "o" ? g = "oblique" : u.a === "i" && (g = "italic"), g;
      }
      function Ue(u) {
        var g = 4, S = "n", k = null;
        return u && ((k = u.match(/(normal|oblique|italic)/i)) && k[1] && (S = k[1].substr(0, 1).toLowerCase()), (k = u.match(/([1-9]00|normal|bold)/i)) && k[1] && (/bold/i.test(k[1]) ? g = 7 : /[1-9]00/.test(k[1]) && (g = parseInt(k[1].substr(0, 1), 10)))), S + g;
      }
      function $e(u, g) {
        this.c = u, this.f = u.o.document.documentElement, this.h = g, this.a = new be("-"), this.j = g.events !== !1, this.g = g.classes !== !1;
      }
      function He(u) {
        u.g && c(u.f, [u.a.c("wf", "loading")]), ze(u, "loading");
      }
      function fe(u) {
        if (u.g) {
          var g = v(u.f, u.a.c("wf", "active")), S = [], k = [u.a.c("wf", "loading")];
          g || S.push(u.a.c("wf", "inactive")), c(u.f, S, k);
        }
        ze(u, "inactive");
      }
      function ze(u, g, S) {
        u.j && u.h[g] && (S ? u.h[g](S.c, j(S)) : u.h[g]());
      }
      function Ve() {
        this.c = {};
      }
      function Ge(u, g, S) {
        var k = [], O;
        for (O in g) if (g.hasOwnProperty(O)) {
          var W = u.c[O];
          W && k.push(W(g[O], S));
        }
        return k;
      }
      function J(u, g) {
        this.c = u, this.f = g, this.a = l(this.c, "span", { "aria-hidden": "true" }, this.f);
      }
      function se(u) {
        a(u.c, "body", u.a);
      }
      function K(u) {
        return "display:block;position:absolute;top:-9999px;left:-9999px;font-size:300px;width:auto;height:auto;line-height:normal;margin:0;padding:0;font-variant:normal;white-space:nowrap;font-family:" + V(u.c) + ";" + ("font-style:" + we(u) + ";font-weight:" + (u.f + "00") + ";");
      }
      function Re(u, g, S, k, O, W) {
        this.g = u, this.j = g, this.a = k, this.c = S, this.f = O || 3e3, this.h = W || void 0;
      }
      Re.prototype.start = function() {
        var u = this.c.o.document, g = this, S = r(), k = new Promise(function(X, _e) {
          function pe() {
            r() - S >= g.f ? _e() : u.fonts.load(U(g.a), g.h).then(function(Be) {
              1 <= Be.length ? X() : setTimeout(pe, 25);
            }, function() {
              _e();
            });
          }
          pe();
        }), O = null, W = new Promise(function(X, _e) {
          O = setTimeout(_e, g.f);
        });
        Promise.race([W, k]).then(function() {
          O && (clearTimeout(O), O = null), g.g(g.a);
        }, function() {
          g.j(g.a);
        });
      };
      function q(u, g, S, k, O, W, X) {
        this.v = u, this.B = g, this.c = S, this.a = k, this.s = X || "BESbswy", this.f = {}, this.w = O || 3e3, this.u = W || null, this.m = this.j = this.h = this.g = null, this.g = new J(this.c, this.s), this.h = new J(this.c, this.s), this.j = new J(this.c, this.s), this.m = new J(this.c, this.s), u = new z(this.a.c + ",serif", j(this.a)), u = K(u), this.g.a.style.cssText = u, u = new z(this.a.c + ",sans-serif", j(this.a)), u = K(u), this.h.a.style.cssText = u, u = new z("serif", j(this.a)), u = K(u), this.j.a.style.cssText = u, u = new z("sans-serif", j(this.a)), u = K(u), this.m.a.style.cssText = u, se(this.g), se(this.h), se(this.j), se(this.m);
      }
      var de = { D: "serif", C: "sans-serif" }, M = null;
      function Ne() {
        if (M === null) {
          var u = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent);
          M = !!u && (536 > parseInt(u[1], 10) || parseInt(u[1], 10) === 536 && 11 >= parseInt(u[2], 10));
        }
        return M;
      }
      q.prototype.start = function() {
        this.f.serif = this.j.a.offsetWidth, this.f["sans-serif"] = this.m.a.offsetWidth, this.A = r(), Et(this);
      };
      function Fe(u, g, S) {
        for (var k in de) if (de.hasOwnProperty(k) && g === u.f[de[k]] && S === u.f[de[k]]) return !0;
        return !1;
      }
      function Et(u) {
        var g = u.g.a.offsetWidth, S = u.h.a.offsetWidth, k;
        (k = g === u.f.serif && S === u.f["sans-serif"]) || (k = Ne() && Fe(u, g, S)), k ? r() - u.A >= u.w ? Ne() && Fe(u, g, S) && (u.u === null || u.u.hasOwnProperty(u.a.c)) ? ct(u, u.v) : ct(u, u.B) : et(u) : ct(u, u.v);
      }
      function et(u) {
        setTimeout(s(function() {
          Et(this);
        }, u), 50);
      }
      function ct(u, g) {
        setTimeout(s(function() {
          h(this.g.a), h(this.h.a), h(this.j.a), h(this.m.a), g(this.a);
        }, u), 0);
      }
      function _t(u, g, S) {
        this.c = u, this.a = g, this.f = 0, this.m = this.j = !1, this.s = S;
      }
      var yt = null;
      _t.prototype.g = function(u) {
        var g = this.a;
        g.g && c(g.f, [g.a.c("wf", u.c, j(u).toString(), "active")], [g.a.c("wf", u.c, j(u).toString(), "loading"), g.a.c("wf", u.c, j(u).toString(), "inactive")]), ze(g, "fontactive", u), this.m = !0, tt(this);
      }, _t.prototype.h = function(u) {
        var g = this.a;
        if (g.g) {
          var S = v(g.f, g.a.c("wf", u.c, j(u).toString(), "active")), k = [], O = [g.a.c("wf", u.c, j(u).toString(), "loading")];
          S || k.push(g.a.c("wf", u.c, j(u).toString(), "inactive")), c(g.f, k, O);
        }
        ze(g, "fontinactive", u), tt(this);
      };
      function tt(u) {
        --u.f == 0 && u.j && (u.m ? (u = u.a, u.g && c(u.f, [u.a.c("wf", "active")], [u.a.c("wf", "loading"), u.a.c("wf", "inactive")]), ze(u, "active")) : fe(u.a));
      }
      function Je(u) {
        this.j = u, this.a = new Ve(), this.h = 0, this.f = this.g = !0;
      }
      Je.prototype.load = function(u) {
        this.c = new i(this.j, u.context || this.j), this.g = u.events !== !1, this.f = u.classes !== !1, p(this, new $e(this.c, u), u);
      };
      function d(u, g, S, k, O) {
        var W = --u.h == 0;
        (u.f || u.g) && setTimeout(function() {
          var X = O || null, _e = k || null || {};
          if (S.length === 0 && W) fe(g.a);
          else {
            g.f += S.length, W && (g.j = W);
            var pe, Be = [];
            for (pe = 0; pe < S.length; pe++) {
              var Ee = S[pe], Qe = _e[Ee.c], it = g.a, Qt = Ee;
              if (it.g && c(it.f, [it.a.c("wf", Qt.c, j(Qt).toString(), "loading")]), ze(it, "fontloading", Qt), it = null, yt === null) if (window.FontFace) {
                var Qt = /Gecko.*Firefox\/(\d+)/.exec(window.navigator.userAgent), $n = /OS X.*Version\/10\..*Safari/.exec(window.navigator.userAgent) && /Apple/.exec(window.navigator.vendor);
                yt = Qt ? 42 < parseInt(Qt[1], 10) : !$n;
              } else yt = !1;
              yt ? it = new Re(s(g.g, g), s(g.h, g), g.c, Ee, g.s, Qe) : it = new q(s(g.g, g), s(g.h, g), g.c, Ee, g.s, X, Qe), Be.push(it);
            }
            for (pe = 0; pe < Be.length; pe++) Be[pe].start();
          }
        }, 0);
      }
      function p(u, g, S) {
        var O = [], k = S.timeout;
        He(g);
        var O = Ge(u.a, S, u.c), W = new _t(u.c, g, k);
        for (u.h = O.length, g = 0, S = O.length; g < S; g++) O[g].load(function(X, _e, pe) {
          d(u, W, X, _e, pe);
        });
      }
      function w(u, g) {
        this.c = u, this.a = g;
      }
      w.prototype.load = function(u) {
        function g() {
          if (W["__mti_fntLst" + k]) {
            var X = W["__mti_fntLst" + k](), _e = [], pe;
            if (X) for (var Be = 0; Be < X.length; Be++) {
              var Ee = X[Be].fontfamily;
              X[Be].fontStyle != null && X[Be].fontWeight != null ? (pe = X[Be].fontStyle + X[Be].fontWeight, _e.push(new z(Ee, pe))) : _e.push(new z(Ee));
            }
            u(_e);
          } else setTimeout(function() {
            g();
          }, 50);
        }
        var S = this, k = S.a.projectId, O = S.a.version;
        if (k) {
          var W = S.c.o;
          D(this.c, (S.a.api || "https://fast.fonts.net/jsapi") + "/" + k + ".js" + (O ? "?v=" + O : ""), function(X) {
            X ? u([]) : (W["__MonotypeConfiguration__" + k] = function() {
              return S.a;
            }, g());
          }).id = "__MonotypeAPIScript__" + k;
        } else u([]);
      };
      function I(u, g) {
        this.c = u, this.a = g;
      }
      I.prototype.load = function(u) {
        var g, S, k = this.a.urls || [], O = this.a.families || [], W = this.a.testStrings || {}, X = new H();
        for (g = 0, S = k.length; g < S; g++) $(this.c, k[g], oe(X));
        var _e = [];
        for (g = 0, S = O.length; g < S; g++) if (k = O[g].split(":"), k[1]) for (var pe = k[1].split(","), Be = 0; Be < pe.length; Be += 1) _e.push(new z(k[0], pe[Be]));
        else _e.push(new z(k[0]));
        le(X, function() {
          u(_e, W);
        });
      };
      function A(u, g) {
        u ? this.c = u : this.c = T, this.a = [], this.f = [], this.g = g || "";
      }
      var T = "https://fonts.googleapis.com/css";
      function F(u, g) {
        for (var S = g.length, k = 0; k < S; k++) {
          var O = g[k].split(":");
          O.length == 3 && u.f.push(O.pop());
          var W = "";
          O.length == 2 && O[1] != "" && (W = ":"), u.a.push(O.join(W));
        }
      }
      function N(u) {
        if (u.a.length == 0) throw Error("No fonts to load!");
        if (u.c.indexOf("kit=") != -1) return u.c;
        for (var g = u.a.length, S = [], k = 0; k < g; k++) S.push(u.a[k].replace(/ /g, "+"));
        return g = u.c + "?family=" + S.join("%7C"), 0 < u.f.length && (g += "&subset=" + u.f.join(",")), 0 < u.g.length && (g += "&text=" + encodeURIComponent(u.g)), g;
      }
      function P(u) {
        this.f = u, this.a = [], this.c = {};
      }
      var L = { latin: "BESbswy", "latin-ext": "çöüğş", cyrillic: "йяЖ", greek: "αβΣ", khmer: "កខគ", Hanuman: "កខគ" }, Z = { thin: "1", extralight: "2", "extra-light": "2", ultralight: "2", "ultra-light": "2", light: "3", regular: "4", book: "4", medium: "5", "semi-bold": "6", semibold: "6", "demi-bold": "6", demibold: "6", bold: "7", "extra-bold": "8", extrabold: "8", "ultra-bold": "8", ultrabold: "8", black: "9", heavy: "9", l: "3", r: "4", b: "7" }, B = { i: "i", italic: "i", n: "n", normal: "n" }, G = /^(thin|(?:(?:extra|ultra)-?)?light|regular|book|medium|(?:(?:semi|demi|extra|ultra)-?)?bold|black|heavy|l|r|b|[1-9]00)?(n|i|normal|italic)?$/;
      function Q(u) {
        for (var g = u.f.length, S = 0; S < g; S++) {
          var k = u.f[S].split(":"), O = k[0].replace(/\+/g, " "), W = ["n4"];
          if (2 <= k.length) {
            var X, _e = k[1];
            if (X = [], _e) for (var _e = _e.split(","), pe = _e.length, Be = 0; Be < pe; Be++) {
              var Ee;
              if (Ee = _e[Be], Ee.match(/^[\w-]+$/)) {
                var Qe = G.exec(Ee.toLowerCase());
                if (Qe == null) Ee = "";
                else {
                  if (Ee = Qe[2], Ee = Ee == null || Ee == "" ? "n" : B[Ee], Qe = Qe[1], Qe == null || Qe == "") Qe = "4";
                  else var it = Z[Qe], Qe = it || (isNaN(Qe) ? "4" : Qe.substr(0, 1));
                  Ee = [Ee, Qe].join("");
                }
              } else Ee = "";
              Ee && X.push(Ee);
            }
            0 < X.length && (W = X), k.length == 3 && (k = k[2], X = [], k = k ? k.split(",") : X, 0 < k.length && (k = L[k[0]]) && (u.c[O] = k));
          }
          for (u.c[O] || (k = L[O]) && (u.c[O] = k), k = 0; k < W.length; k += 1) u.a.push(new z(O, W[k]));
        }
      }
      function ae(u, g) {
        this.c = u, this.a = g;
      }
      var ke = { Arimo: !0, Cousine: !0, Tinos: !0 };
      ae.prototype.load = function(u) {
        var g = new H(), S = this.c, k = new A(this.a.api, this.a.text), O = this.a.families;
        F(k, O);
        var W = new P(O);
        Q(W), $(S, N(k), oe(g)), le(g, function() {
          u(W.a, W.c, ke);
        });
      };
      function he(u, g) {
        this.c = u, this.a = g;
      }
      he.prototype.load = function(u) {
        var g = this.a.id, S = this.c.o;
        g ? D(this.c, (this.a.api || "https://use.typekit.net") + "/" + g + ".js", function(k) {
          if (k) u([]);
          else if (S.Typekit && S.Typekit.config && S.Typekit.config.fn) {
            k = S.Typekit.config.fn;
            for (var O = [], W = 0; W < k.length; W += 2) for (var X = k[W], _e = k[W + 1], pe = 0; pe < _e.length; pe++) O.push(new z(X, _e[pe]));
            try {
              S.Typekit.load({ events: !1, classes: !1, async: !0 });
            } catch {
            }
            u(O);
          }
        }, 2e3) : u([]);
      };
      function je(u, g) {
        this.c = u, this.f = g, this.a = [];
      }
      je.prototype.load = function(u) {
        var g = this.f.id, S = this.c.o, k = this;
        g ? (S.__webfontfontdeckmodule__ || (S.__webfontfontdeckmodule__ = {}), S.__webfontfontdeckmodule__[g] = function(O, W) {
          for (var X = 0, _e = W.fonts.length; X < _e; ++X) {
            var pe = W.fonts[X];
            k.a.push(new z(pe.name, Ue("font-weight:" + pe.weight + ";font-style:" + pe.style)));
          }
          u(k.a);
        }, D(this.c, (this.f.api || "https://f.fontdeck.com/s/css/js/") + y(this.c) + "/" + g + ".js", function(O) {
          O && u([]);
        })) : u([]);
      };
      var Oe = new Je(window);
      Oe.a.c.custom = function(u, g) {
        return new I(g, u);
      }, Oe.a.c.fontdeck = function(u, g) {
        return new je(g, u);
      }, Oe.a.c.monotype = function(u, g) {
        return new w(g, u);
      }, Oe.a.c.typekit = function(u, g) {
        return new he(g, u);
      }, Oe.a.c.google = function(u, g) {
        return new ae(g, u);
      };
      var rt = { load: s(Oe.load, Oe) };
      e.exports ? e.exports = rt : (window.WebFont = rt, window.WebFontConfig && Oe.load(window.WebFontConfig));
    })();
  }(ur)), ur.exports;
}
var xh = kh();
const Sh = /* @__PURE__ */ wh(xh);
function Ch() {
  const e = ue({}), t = ue(""), n = (r) => {
    e.value = r, r.photo_url && (e.value.photo_url = r.photo_url), r.font_family && Sh.load({
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
function Th() {
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
const Ah = {
  key: 0,
  class: "initializing-overlay"
}, Eh = {
  key: 0,
  class: "connecting-message"
}, Rh = {
  key: 1,
  class: "failed-message"
}, Ih = { class: "welcome-content" }, Lh = { class: "welcome-header" }, Oh = ["src", "alt"], Ph = { class: "welcome-title" }, $h = { class: "welcome-subtitle" }, Fh = { class: "welcome-input-container" }, Bh = {
  key: 0,
  class: "email-input"
}, Nh = ["disabled"], Mh = { class: "welcome-message-input" }, Dh = ["placeholder", "disabled"], qh = ["disabled"], Uh = { class: "landing-page-content" }, Hh = { class: "landing-page-header" }, zh = { class: "landing-page-heading" }, Vh = { class: "landing-page-text" }, Wh = { class: "landing-page-actions" }, jh = { class: "form-fullscreen-content" }, Kh = {
  key: 0,
  class: "form-header"
}, Zh = {
  key: 0,
  class: "form-title"
}, Gh = {
  key: 1,
  class: "form-description"
}, Yh = { class: "form-fields" }, Xh = ["for"], Jh = {
  key: 0,
  class: "required-indicator"
}, Qh = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "autocomplete", "inputmode"], ed = ["id", "placeholder", "required", "min", "max", "value", "onInput"], td = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput"], nd = ["id", "required", "value", "onChange"], sd = { value: "" }, rd = ["value"], id = {
  key: 4,
  class: "checkbox-field"
}, od = ["id", "required", "checked", "onChange"], ld = { class: "checkbox-label" }, ad = {
  key: 5,
  class: "radio-group"
}, cd = ["name", "value", "required", "checked", "onChange"], ud = { class: "radio-label" }, fd = {
  key: 6,
  class: "field-error"
}, hd = { class: "form-actions" }, dd = ["disabled"], pd = {
  key: 0,
  class: "loading-spinner-inline"
}, gd = { key: 1 }, md = { class: "header-content" }, _d = ["src", "alt"], yd = { class: "header-info" }, vd = { class: "status" }, bd = { class: "ask-anything-header" }, wd = ["src", "alt"], kd = { class: "header-info" }, xd = {
  key: 2,
  class: "loading-history"
}, Sd = {
  key: 0,
  class: "rating-content"
}, Cd = { class: "rating-prompt" }, Td = ["onMouseover", "onMouseleave", "onClick", "disabled"], Ad = {
  key: 0,
  class: "feedback-wrapper"
}, Ed = { class: "feedback-section" }, Rd = ["onUpdate:modelValue", "disabled"], Id = { class: "feedback-counter" }, Ld = ["onClick", "disabled"], Od = {
  key: 1,
  class: "submitted-feedback-wrapper"
}, Pd = { class: "submitted-feedback" }, $d = { class: "submitted-feedback-text" }, Fd = {
  key: 2,
  class: "submitted-message"
}, Bd = {
  key: 1,
  class: "form-content"
}, Nd = {
  key: 0,
  class: "form-header"
}, Md = {
  key: 0,
  class: "form-title"
}, Dd = {
  key: 1,
  class: "form-description"
}, qd = { class: "form-fields" }, Ud = ["for"], Hd = {
  key: 0,
  class: "required-indicator"
}, zd = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "disabled", "autocomplete", "inputmode"], Vd = ["id", "placeholder", "required", "min", "max", "value", "onInput", "disabled"], Wd = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "disabled"], jd = ["id", "required", "value", "onChange", "disabled"], Kd = { value: "" }, Zd = ["value"], Gd = {
  key: 4,
  class: "checkbox-field"
}, Yd = ["id", "checked", "onChange", "disabled"], Xd = ["for"], Jd = {
  key: 5,
  class: "radio-field"
}, Qd = ["id", "name", "value", "checked", "onChange", "disabled"], ep = ["for"], tp = {
  key: 6,
  class: "field-error"
}, np = { class: "form-actions" }, sp = ["onClick", "disabled"], rp = {
  key: 2,
  class: "user-input-content"
}, ip = {
  key: 0,
  class: "user-input-prompt"
}, op = {
  key: 1,
  class: "user-input-form"
}, lp = ["onUpdate:modelValue", "onKeydown"], ap = ["onClick", "disabled"], cp = {
  key: 2,
  class: "user-input-submitted"
}, up = {
  key: 0,
  class: "user-input-confirmation"
}, fp = {
  key: 3,
  class: "product-message-container"
}, hp = ["innerHTML"], dp = {
  key: 1,
  class: "products-carousel"
}, pp = { class: "carousel-items" }, gp = {
  key: 0,
  class: "product-image-compact"
}, mp = ["src", "alt"], _p = { class: "product-info-compact" }, yp = { class: "product-text-area" }, vp = { class: "product-title-compact" }, bp = {
  key: 0,
  class: "product-variant-compact"
}, wp = { class: "product-price-compact" }, kp = { class: "product-actions-compact" }, xp = ["onClick"], Sp = {
  key: 2,
  class: "no-products-message"
}, Cp = {
  key: 3,
  class: "no-products-message"
}, Tp = ["innerHTML"], Ap = {
  key: 0,
  class: "message-attachments"
}, Ep = {
  key: 0,
  class: "attachment-image-container"
}, Rp = ["src", "alt", "onClick"], Ip = { class: "attachment-image-info" }, Lp = ["href"], Op = { class: "attachment-size" }, Pp = ["href"], $p = { class: "attachment-size" }, Fp = { class: "message-info" }, Bp = {
  key: 0,
  class: "agent-name"
}, Np = {
  key: 0,
  class: "typing-indicator"
}, Mp = {
  key: 0,
  class: "email-input"
}, Dp = ["disabled"], qp = {
  key: 1,
  class: "file-previews-widget"
}, Up = {
  class: "file-preview-content-widget",
  style: { cursor: "pointer" }
}, Hp = ["src", "alt", "onClick"], zp = ["onClick"], Vp = { class: "file-preview-info-widget" }, Wp = { class: "file-preview-name-widget" }, jp = { class: "file-preview-size-widget" }, Kp = ["onClick"], Zp = {
  key: 2,
  class: "upload-progress-widget"
}, Gp = { class: "message-input" }, Yp = ["placeholder", "disabled"], Xp = ["disabled", "title"], Jp = ["disabled"], Qp = { class: "conversation-ended-message" }, eg = {
  key: 7,
  class: "rating-dialog"
}, tg = { class: "rating-content" }, ng = { class: "star-rating" }, sg = ["onClick"], rg = { class: "rating-actions" }, ig = ["disabled"], og = {
  key: 0,
  class: "preview-modal-image-container"
}, lg = ["src", "alt"], ag = { class: "preview-modal-filename" }, cg = {
  key: 1,
  class: "widget-loading"
}, fr = "ctid", xo = 3, ug = "image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls", fg = /* @__PURE__ */ ac({
  __name: "WidgetBuilder",
  props: {
    widgetId: {}
  },
  setup(e) {
    var vi;
    ye.setOptions({
      renderer: new ye.Renderer(),
      gfm: !0,
      breaks: !0
    });
    const t = new ye.Renderer(), n = t.link;
    t.link = (m, _, f) => n.call(t, m, _, f).replace(/^<a /, '<a target="_blank" rel="nofollow" '), ye.use({ renderer: t });
    const s = e, r = We(() => {
      var m;
      return s.widgetId || ((m = window.__INITIAL_DATA__) == null ? void 0 : m.widgetId);
    }), {
      customization: i,
      agentName: o,
      applyCustomization: l,
      initializeFromData: a
    } = Ch(), { formatCurrency: h } = Th(), {
      messages: c,
      loading: v,
      errorMessage: y,
      showError: $,
      loadingHistory: D,
      hasStartedChat: H,
      connectionStatus: oe,
      sendMessage: le,
      loadChatHistory: ve,
      connect: be,
      reconnect: z,
      cleanup: U,
      humanAgent: V,
      onTakeover: j,
      submitRating: we,
      submitForm: Ue,
      currentForm: $e,
      getWorkflowState: He,
      proceedWorkflow: fe,
      onWorkflowState: ze,
      onWorkflowProceeded: Ve,
      currentSessionId: Ge
    } = bh(), J = ue(""), se = ue(!0), K = ue(""), Re = ue(!1), q = (m) => {
      const _ = m.target;
      J.value = _.value;
    };
    let de = null;
    const M = () => {
      de && de.disconnect(), de = new MutationObserver((_) => {
        let f = !1, Y = !1;
        _.forEach((ce) => {
          if (ce.type === "childList") {
            const ne = Array.from(ce.addedNodes).some(
              (ge) => {
                var Ht;
                return ge.nodeType === Node.ELEMENT_NODE && (ge.matches("input, textarea") || ((Ht = ge.querySelector) == null ? void 0 : Ht.call(ge, "input, textarea")));
              }
            ), vt = Array.from(ce.removedNodes).some(
              (ge) => {
                var Ht;
                return ge.nodeType === Node.ELEMENT_NODE && (ge.matches("input, textarea") || ((Ht = ge.querySelector) == null ? void 0 : Ht.call(ge, "input, textarea")));
              }
            );
            ne && (Y = !0, f = !0), vt && (f = !0);
          }
        }), f && (clearTimeout(M.timeoutId), M.timeoutId = setTimeout(() => {
          Fe();
        }, Y ? 50 : 100));
      });
      const m = document.querySelector(".widget-container") || document.body;
      de.observe(m, {
        childList: !0,
        subtree: !0
      });
    };
    M.timeoutId = null;
    let Ne = [];
    const Fe = () => {
      Et();
      const m = [
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
      for (const f of m) {
        const Y = document.querySelectorAll(f);
        if (Y.length > 0) {
          _ = Array.from(Y);
          break;
        }
      }
      _.length !== 0 && (Ne = _, _.forEach((f) => {
        f.addEventListener("input", et, !0), f.addEventListener("keyup", et, !0), f.addEventListener("change", et, !0), f.addEventListener("keypress", ct, !0), f.addEventListener("keydown", _t, !0);
      }));
    }, Et = () => {
      Ne.forEach((m) => {
        m.removeEventListener("input", et), m.removeEventListener("keyup", et), m.removeEventListener("change", et), m.removeEventListener("keypress", ct), m.removeEventListener("keydown", _t);
      }), Ne = [];
    }, et = (m) => {
      const _ = m.target;
      J.value = _.value;
    }, ct = (m) => {
      m.key === "Enter" && !m.shiftKey && (m.preventDefault(), m.stopPropagation(), Ee());
    }, _t = (m) => {
      m.key === "Enter" && !m.shiftKey && (m.preventDefault(), m.stopPropagation(), Ee());
    }, yt = ue(!0), tt = ue(((vi = window.__INITIAL_DATA__) == null ? void 0 : vi.initialToken) || localStorage.getItem(fr));
    We(() => !!tt.value), a();
    const Je = window.__INITIAL_DATA__;
    Je != null && Je.initialToken && (tt.value = Je.initialToken, window.parent.postMessage({
      type: "TOKEN_UPDATE",
      token: Je.initialToken
    }, "*"), Re.value = !0);
    const d = ue(!1);
    (Je == null ? void 0 : Je.allowAttachments) !== void 0 && (d.value = Je.allowAttachments);
    const p = ue(null), {
      chatStyles: w,
      chatIconStyles: I,
      agentBubbleStyles: A,
      userBubbleStyles: T,
      messageNameStyles: F,
      headerBorderStyles: N,
      photoUrl: P,
      shadowStyle: L
    } = Cf(i), Z = ue(null), {
      uploadedAttachments: B,
      previewModal: G,
      previewFile: Q,
      formatFileSize: ae,
      isImageAttachment: ke,
      getDownloadUrl: he,
      getPreviewUrl: je,
      handleFileSelect: Oe,
      handleDrop: rt,
      handleDragOver: u,
      handleDragLeave: g,
      handlePaste: S,
      removeAttachment: k,
      openPreview: O,
      closePreview: W,
      openFilePicker: X,
      isImage: _e
    } = Tf(tt, Z);
    We(() => c.value.some(
      (m) => m.message_type === "form" && (!m.isSubmitted || m.isSubmitted === !1)
    ));
    const pe = We(() => {
      var m;
      return H.value && Re.value || xt.value ? oe.value === "connected" && !v.value : Mn(K.value.trim()) && oe.value === "connected" && !v.value || ((m = window.__INITIAL_DATA__) == null ? void 0 : m.workflow);
    }), Be = We(() => oe.value === "connected" ? xt.value ? "Ask me anything..." : "Type a message..." : "Connecting..."), Ee = async () => {
      if (!J.value.trim() && B.value.length === 0) return;
      !H.value && K.value && await it();
      const m = B.value.map((f) => ({
        content: f.content,
        // base64 content
        filename: f.filename,
        content_type: f.type,
        size: f.size
      }));
      await le(J.value, K.value, m), B.value.forEach((f) => {
        f.url && f.url.startsWith("blob:") && URL.revokeObjectURL(f.url), f.file_url && f.file_url.startsWith("blob:") && URL.revokeObjectURL(f.file_url);
      }), J.value = "", B.value = [];
      const _ = document.querySelector('input[placeholder*="Type a message"]');
      _ && (_.value = ""), setTimeout(() => {
        Fe();
      }, 500);
    }, Qe = (m) => {
      m.key === "Enter" && !m.shiftKey && (m.preventDefault(), m.stopPropagation(), Ee());
    }, it = async () => {
      var m, _, f, Y;
      try {
        if (!r.value)
          return console.error("Widget ID is not available"), !1;
        const ce = new URL(`${yn.API_URL}/widgets/${r.value}`);
        K.value.trim() && Mn(K.value.trim()) && ce.searchParams.append("email", K.value.trim());
        const ne = {
          Accept: "application/json",
          "Content-Type": "application/json"
        };
        tt.value && (ne.Authorization = `Bearer ${tt.value}`);
        const vt = await fetch(ce, {
          headers: ne
        });
        if (vt.status === 401)
          return Re.value = !1, !1;
        const ge = await vt.json();
        return ge.token && (tt.value = ge.token, localStorage.setItem(fr, ge.token), window.parent.postMessage({ type: "TOKEN_UPDATE", token: ge.token }, "*")), Re.value = !0, await be() ? (await Qt(), (m = ge.agent) != null && m.customization && l(ge.agent.customization), ge.agent && !(ge != null && ge.human_agent) && (o.value = ge.agent.name), ge != null && ge.human_agent && (V.value = ge.human_agent), ((_ = ge.agent) == null ? void 0 : _.allow_attachments) !== void 0 && (d.value = ge.agent.allow_attachments), ((f = ge.agent) == null ? void 0 : f.workflow) !== void 0 && (window.__INITIAL_DATA__ = window.__INITIAL_DATA__ || {}, window.__INITIAL_DATA__.workflow = ge.agent.workflow), (Y = ge.agent) != null && Y.workflow && await He(), !0) : (console.error("Failed to connect to chat service"), !1);
      } catch (ce) {
        return console.error("Error checking authorization:", ce), Re.value = !1, !1;
      } finally {
        yt.value = !1;
      }
    }, Qt = async () => {
      !H.value && Re.value && (H.value = !0, await ve());
    }, $n = () => {
      p.value && (p.value.scrollTop = p.value.scrollHeight);
    };
    sn(() => c.value, (m) => {
      Go(() => {
        $n();
      });
    }, { deep: !0 }), sn(oe, (m, _) => {
      m === "connected" && _ !== "connected" && setTimeout(Fe, 100);
    }), sn(() => c.value.length, (m, _) => {
      m > 0 && _ === 0 && setTimeout(Fe, 100);
    }), sn(() => c.value, (m) => {
      if (m.length > 0) {
        const _ = m[m.length - 1];
        Jl(_);
      }
    }, { deep: !0 });
    const Xl = async () => {
      await z() && await it();
    }, hi = ue(!1), os = ue(0), Ks = ue(""), Lt = ue(0), Ot = ue(!1), Ye = ue({}), nt = ue(!1), Xe = ue({}), wn = ue(!1), Fn = ue(null), di = ue("Start Chat"), kn = ue(!1), ut = ue(null);
    We(() => {
      var _;
      const m = c.value[c.value.length - 1];
      return ((_ = m == null ? void 0 : m.attributes) == null ? void 0 : _.request_rating) || !1;
    });
    const pi = We(() => {
      var _;
      if (!((_ = window.__INITIAL_DATA__) != null && _.workflow))
        return !1;
      const m = c.value.find((f) => f.message_type === "rating");
      return (m == null ? void 0 : m.isSubmitted) === !0;
    }), ls = We(() => V.value.human_agent_profile_pic ? V.value.human_agent_profile_pic.includes("amazonaws.com") ? V.value.human_agent_profile_pic : `${yn.API_URL}${V.value.human_agent_profile_pic}` : ""), Jl = (m) => {
      var _, f, Y;
      if ((_ = m.attributes) != null && _.end_chat && ((f = m.attributes) != null && f.request_rating)) {
        const ce = m.agent_name || ((Y = V.value) == null ? void 0 : Y.human_agent_name) || o.value || "our agent";
        c.value.push({
          message: `Rate the chat session that you had with ${ce}`,
          message_type: "rating",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          session_id: m.session_id,
          agent_name: ce,
          showFeedback: !1
        }), Ge.value = m.session_id;
      }
    }, Ql = (m) => {
      Ot.value || (Lt.value = m);
    }, ea = () => {
      if (!Ot.value) {
        const m = c.value[c.value.length - 1];
        Lt.value = (m == null ? void 0 : m.selectedRating) || 0;
      }
    }, ta = async (m) => {
      if (!Ot.value) {
        Lt.value = m;
        const _ = c.value[c.value.length - 1];
        _ && _.message_type === "rating" && (_.showFeedback = !0, _.selectedRating = m);
      }
    }, na = async (m, _, f = null) => {
      try {
        Ot.value = !0, await we(_, f);
        const Y = c.value.find((ce) => ce.message_type === "rating");
        Y && (Y.isSubmitted = !0, Y.finalRating = _, Y.finalFeedback = f);
      } catch (Y) {
        console.error("Failed to submit rating:", Y);
      } finally {
        Ot.value = !1;
      }
    }, sa = (m) => {
      const _ = {};
      for (const f of m.fields) {
        const Y = Ye.value[f.name], ce = Zs(f, Y);
        ce && (_[f.name] = ce);
      }
      return Xe.value = _, Object.keys(_).length === 0;
    }, ra = async (m) => {
      if (!(nt.value || !sa(m)))
        try {
          nt.value = !0, await Ue(Ye.value);
          const f = c.value.findIndex(
            (Y) => Y.message_type === "form" && (!Y.isSubmitted || Y.isSubmitted === !1)
          );
          f !== -1 && c.value.splice(f, 1), Ye.value = {}, Xe.value = {};
        } catch (f) {
          console.error("Failed to submit form:", f);
        } finally {
          nt.value = !1;
        }
    }, gt = (m, _) => {
      var f, Y;
      if (Ye.value[m] = _, _ && _.toString().trim() !== "") {
        let ce = null;
        if ((f = ut.value) != null && f.fields && (ce = ut.value.fields.find((ne) => ne.name === m)), !ce && ((Y = $e.value) != null && Y.fields) && (ce = $e.value.fields.find((ne) => ne.name === m)), ce) {
          const ne = Zs(ce, _);
          ne ? (Xe.value[m] = ne, console.log(`Validation error for ${m}:`, ne)) : delete Xe.value[m];
        }
      } else
        delete Xe.value[m], console.log(`Cleared error for ${m}`);
    }, ia = (m) => {
      const _ = m.replace(/\D/g, "");
      return _.length >= 7 && _.length <= 15;
    }, Zs = (m, _) => {
      if (m.required && (!_ || _.toString().trim() === ""))
        return `${m.label} is required`;
      if (!_ || _.toString().trim() === "")
        return null;
      if (m.type === "email" && !Mn(_))
        return "Please enter a valid email address";
      if (m.type === "tel" && !ia(_))
        return "Please enter a valid phone number";
      if ((m.type === "text" || m.type === "textarea") && m.minLength && _.length < m.minLength)
        return `${m.label} must be at least ${m.minLength} characters`;
      if ((m.type === "text" || m.type === "textarea") && m.maxLength && _.length > m.maxLength)
        return `${m.label} must not exceed ${m.maxLength} characters`;
      if (m.type === "number") {
        const f = parseFloat(_);
        if (isNaN(f))
          return `${m.label} must be a valid number`;
        if (m.minLength && f < m.minLength)
          return `${m.label} must be at least ${m.minLength}`;
        if (m.maxLength && f > m.maxLength)
          return `${m.label} must not exceed ${m.maxLength}`;
      }
      return null;
    }, oa = async () => {
      if (!(nt.value || !ut.value))
        try {
          nt.value = !0, Xe.value = {};
          let m = !1;
          for (const _ of ut.value.fields || []) {
            const f = Ye.value[_.name], Y = Zs(_, f);
            Y && (Xe.value[_.name] = Y, m = !0, console.log(`Validation error for field ${_.name}:`, Y));
          }
          if (m) {
            nt.value = !1, console.log("Validation failed, not submitting");
            return;
          }
          await Ue(Ye.value), kn.value = !1, ut.value = null, Ye.value = {};
        } catch (m) {
          console.error("Failed to submit full screen form:", m);
        } finally {
          nt.value = !1, console.log("Full screen form submission completed");
        }
    }, la = (m, _) => {
      if (console.log("handleViewDetails called with:", { product: m, shopDomain: _ }), !m) {
        console.error("No product provided to handleViewDetails");
        return;
      }
      let f = null;
      if (m.handle && _)
        f = `https://${_}/products/${m.handle}`;
      else if (m.id && _)
        f = `https://${_}/products/${m.id}`;
      else if (_) {
        if (!m.handle && !m.id) {
          console.error("Product handle and ID are both missing! Product:", m), alert("Unable to open product: Product information incomplete.");
          return;
        }
      } else {
        console.error("Shop domain is missing! Product:", m), alert("Unable to open product: Shop domain not available. Please contact support.");
        return;
      }
      f && (console.log("Opening product URL:", f), window.open(f, "_blank"));
    }, aa = (m) => {
      if (!m) return "";
      let _ = m.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "");
      const f = [];
      return _ = _.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (Y, ce, ne) => {
        const vt = `__MARKDOWN_LINK_${f.length}__`;
        return console.log("Found markdown link:", Y, "-> placeholder:", vt), f.push(Y), vt;
      }), console.log("After replacing markdown links with placeholders:", _), console.log("Markdown links array:", f), _ = _.replace(/https?:\/\/[^\s\)]+/g, "[link removed]"), console.log("After removing standalone URLs:", _), f.forEach((Y, ce) => {
        _ = _.replace(`__MARKDOWN_LINK_${ce}__`, Y), console.log(`Restored markdown link ${ce}:`, Y);
      }), _ = _.replace(/\n\s*\n\s*\n/g, `

`).trim(), _;
    }, gi = ue(!1);
    ue(!1);
    const mi = We(() => {
      var f;
      const m = !!((f = V.value) != null && f.human_agent_name), _ = c.value.some((Y) => Y.message_type === "agent");
      return d.value && m && _ && B.value.length < xo;
    });
    sn(d, (m) => {
      var _;
      console.log("🔍 allowAttachments changed to:", m), console.log("   isHandedOverToHuman:", !!((_ = V.value) != null && _.human_agent_name)), console.log("   canUploadMore:", mi.value);
    });
    const ca = async () => {
      try {
        wn.value = !1, Fn.value = null, await fe();
      } catch (m) {
        console.error("Failed to proceed workflow:", m);
      }
    }, Gs = async (m) => {
      try {
        if (!m.userInputValue || !m.userInputValue.trim())
          return;
        const _ = m.userInputValue.trim();
        m.isSubmitted = !0, m.submittedValue = _, await le(_, K.value);
      } catch (_) {
        console.error("Failed to submit user input:", _), m.isSubmitted = !1, m.submittedValue = null;
      }
    }, _i = async () => {
      var m, _, f;
      try {
        let Y = 0;
        const ce = 50;
        for (; !((m = window.__INITIAL_DATA__) != null && m.widgetId) && Y < ce; )
          await new Promise((vt) => setTimeout(vt, 100)), Y++;
        return (_ = window.__INITIAL_DATA__) != null && _.widgetId ? await it() ? ((f = window.__INITIAL_DATA__) != null && f.workflow && Re.value && await He(), !0) : (oe.value = "connected", !1) : (console.error("Widget data not available after waiting"), !1);
      } catch (Y) {
        return console.error("Failed to initialize widget:", Y), !1;
      }
    }, ua = () => {
      j(async () => {
        await it();
      }), window.addEventListener("message", (m) => {
        m.data.type === "SCROLL_TO_BOTTOM" && $n(), m.data.type === "TOKEN_RECEIVED" && localStorage.setItem(fr, m.data.token);
      }), ze((m) => {
        var _;
        if (di.value = m.button_text || "Start Chat", m.type === "landing_page")
          Fn.value = m.landing_page_data, wn.value = !0, kn.value = !1;
        else if (m.type === "form" || m.type === "display_form")
          if (((_ = m.form_data) == null ? void 0 : _.form_full_screen) === !0)
            ut.value = m.form_data, kn.value = !0, wn.value = !1;
          else {
            const f = {
              message: "",
              message_type: "form",
              attributes: {
                form_data: m.form_data
              },
              created_at: (/* @__PURE__ */ new Date()).toISOString(),
              isSubmitted: !1
            };
            c.value.findIndex(
              (ce) => ce.message_type === "form" && !ce.isSubmitted
            ) === -1 && c.value.push(f), wn.value = !1, kn.value = !1;
          }
        else
          wn.value = !1, kn.value = !1;
      }), Ve((m) => {
        console.log("Workflow proceeded:", m);
      });
    }, fa = async () => {
      try {
        await _i(), await He();
      } catch (m) {
        throw console.error("Failed to start new conversation:", m), m;
      }
    }, ha = async () => {
      pi.value = !1, c.value = [], await fa();
    };
    sl(async () => {
      await _i(), ua(), M(), (() => {
        const _ = c.value.length > 0, f = oe.value === "connected", Y = document.querySelector('input[type="text"], textarea') !== null;
        return _ || f || Y;
      })() && setTimeout(Fe, 100);
    }), Zr(() => {
      window.removeEventListener("message", (m) => {
        m.data.type === "SCROLL_TO_BOTTOM" && $n();
      }), de && (de.disconnect(), de = null), M.timeoutId && (clearTimeout(M.timeoutId), M.timeoutId = null), Et(), U();
    });
    const xt = We(() => i.value.chat_style === "ASK_ANYTHING"), da = We(() => {
      const m = {
        width: "100%",
        height: "580px",
        borderRadius: "var(--radius-lg)"
      };
      return window.innerWidth <= 768 && (m.width = "100vw", m.height = "100vh", m.borderRadius = "0", m.position = "fixed", m.top = "0", m.left = "0", m.bottom = "0", m.right = "0", m.maxWidth = "100vw", m.maxHeight = "100vh"), xt.value ? window.innerWidth <= 768 ? {
        ...m,
        width: "100vw",
        height: "100vh",
        maxWidth: "100vw",
        maxHeight: "100vh",
        minWidth: "unset",
        borderRadius: "0"
      } : window.innerWidth <= 1024 ? {
        ...m,
        width: "95%",
        maxWidth: "700px",
        minWidth: "500px",
        height: "650px"
      } : {
        ...m,
        width: "100%",
        maxWidth: "400px",
        minWidth: "400px",
        height: "580px"
      } : m;
    }), yi = We(() => xt.value && c.value.length === 0);
    return (m, _) => r.value ? (E(), R("div", {
      key: 0,
      class: Me(["chat-container", { collapsed: !se.value, "ask-anything-style": xt.value }]),
      style: Ae({ ...x(L), ...da.value })
    }, [
      yt.value ? (E(), R("div", Ah, _[17] || (_[17] = [
        eu('<div class="loading-spinner" data-v-6cf16edf><div class="dot" data-v-6cf16edf></div><div class="dot" data-v-6cf16edf></div><div class="dot" data-v-6cf16edf></div></div><div class="loading-text" data-v-6cf16edf>Initializing chat...</div>', 2)
      ]))) : re("", !0),
      !yt.value && x(oe) !== "connected" ? (E(), R("div", {
        key: 1,
        class: Me(["connection-status", x(oe)])
      }, [
        x(oe) === "connecting" ? (E(), R("div", Eh, _[18] || (_[18] = [
          bt(" Connecting to chat service... ", -1),
          b("div", { class: "loading-dots" }, [
            b("div", { class: "dot" }),
            b("div", { class: "dot" }),
            b("div", { class: "dot" })
          ], -1)
        ]))) : x(oe) === "failed" ? (E(), R("div", Rh, [
          _[19] || (_[19] = bt(" Connection failed. ", -1)),
          b("button", {
            onClick: Xl,
            class: "reconnect-button"
          }, " Click here to reconnect ")
        ])) : re("", !0)
      ], 2)) : re("", !0),
      x($) ? (E(), R("div", {
        key: 2,
        class: "error-alert",
        style: Ae(x(I))
      }, ee(x(y)), 5)) : re("", !0),
      yi.value ? (E(), R("div", {
        key: 3,
        class: "welcome-message-section",
        style: Ae(x(w))
      }, [
        b("div", Ih, [
          b("div", Lh, [
            x(P) ? (E(), R("img", {
              key: 0,
              src: x(P),
              alt: x(o),
              class: "welcome-avatar"
            }, null, 8, Oh)) : re("", !0),
            b("h1", Ph, ee(x(i).welcome_title || `Welcome to ${x(o)}`), 1),
            b("p", $h, ee(x(i).welcome_subtitle || "I'm here to help you with anything you need. What can I assist you with today?"), 1)
          ])
        ]),
        b("div", Fh, [
          !x(H) && !Re.value && !xt.value ? (E(), R("div", Bh, [
            hn(b("input", {
              "onUpdate:modelValue": _[0] || (_[0] = (f) => K.value = f),
              type: "email",
              placeholder: "Enter your email address",
              disabled: x(v) || x(oe) !== "connected",
              class: Me([{
                invalid: K.value.trim() && !x(Mn)(K.value.trim()),
                disabled: x(oe) !== "connected"
              }, "welcome-email-input"])
            }, null, 10, Nh), [
              [gn, K.value]
            ])
          ])) : re("", !0),
          b("div", Mh, [
            hn(b("input", {
              "onUpdate:modelValue": _[1] || (_[1] = (f) => J.value = f),
              type: "text",
              placeholder: Be.value,
              onKeypress: Qe,
              onInput: q,
              onChange: q,
              disabled: !pe.value,
              class: Me([{ disabled: !pe.value }, "welcome-message-field"])
            }, null, 42, Dh), [
              [gn, J.value]
            ]),
            b("button", {
              class: "welcome-send-button",
              style: Ae(x(T)),
              onClick: Ee,
              disabled: !J.value.trim() || !pe.value
            }, _[20] || (_[20] = [
              b("svg", {
                width: "20",
                height: "20",
                viewBox: "0 0 24 24",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg"
              }, [
                b("path", {
                  d: "M5 12L3 21L21 12L3 3L5 12ZM5 12L13 12",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                })
              ], -1)
            ]), 12, qh)
          ])
        ]),
        b("div", {
          class: "powered-by-welcome",
          style: Ae(x(F))
        }, _[21] || (_[21] = [
          b("svg", {
            class: "chattermate-logo",
            width: "16",
            height: "16",
            viewBox: "0 0 60 60",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg"
          }, [
            b("path", {
              d: "M45 15H15C13.3431 15 12 16.3431 12 18V42C12 43.6569 13.3431 45 15 45H25L30 52L35 45H45C46.6569 45 48 43.6569 48 42V18C48 16.3431 46.6569 15 45 15Z",
              fill: "currentColor",
              opacity: "0.8"
            }),
            b("path", {
              d: "M36 27C36 27 32.5 26 30 26C27.5 26 24 27 24 31C24 35 27.5 36 30 36C32.5 36 36 35 36 35V33C36 33 33 34 31.5 34C30 34 27 33 27 31C27 29 30 28 31.5 28C33 28 36 29 36 29V27Z",
              fill: "currentColor"
            })
          ], -1),
          bt(" Powered by ChatterMate ", -1)
        ]), 4)
      ], 4)) : re("", !0),
      wn.value && Fn.value ? (E(), R("div", {
        key: 4,
        class: "landing-page-fullscreen",
        style: Ae(x(w))
      }, [
        b("div", Uh, [
          b("div", Hh, [
            b("h2", zh, ee(Fn.value.heading), 1),
            b("div", Vh, ee(Fn.value.content), 1)
          ]),
          b("div", Wh, [
            b("button", {
              class: "landing-page-button",
              onClick: ca
            }, ee(di.value), 1)
          ])
        ]),
        b("div", {
          class: "powered-by-landing",
          style: Ae(x(F))
        }, _[22] || (_[22] = [
          b("svg", {
            class: "chattermate-logo",
            width: "16",
            height: "16",
            viewBox: "0 0 60 60",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg"
          }, [
            b("path", {
              d: "M45 15H15C13.3431 15 12 16.3431 12 18V42C12 43.6569 13.3431 45 15 45H25L30 52L35 45H45C46.6569 45 48 43.6569 48 42V18C48 16.3431 46.6569 15 45 15Z",
              fill: "currentColor",
              opacity: "0.8"
            }),
            b("path", {
              d: "M36 27C36 27 32.5 26 30 26C27.5 26 24 27 24 31C24 35 27.5 36 30 36C32.5 36 36 35 36 35V33C36 33 33 34 31.5 34C30 34 27 33 27 31C27 29 30 28 31.5 28C33 28 36 29 36 29V27Z",
              fill: "currentColor"
            })
          ], -1),
          bt(" Powered by ChatterMate ", -1)
        ]), 4)
      ], 4)) : kn.value && ut.value ? (E(), R("div", {
        key: 5,
        class: "form-fullscreen",
        style: Ae(x(w))
      }, [
        b("div", jh, [
          ut.value.title || ut.value.description ? (E(), R("div", Kh, [
            ut.value.title ? (E(), R("h2", Zh, ee(ut.value.title), 1)) : re("", !0),
            ut.value.description ? (E(), R("p", Gh, ee(ut.value.description), 1)) : re("", !0)
          ])) : re("", !0),
          b("div", Yh, [
            (E(!0), R(De, null, St(ut.value.fields, (f) => {
              var Y, ce;
              return E(), R("div", {
                key: f.name,
                class: "form-field"
              }, [
                b("label", {
                  for: `fullscreen-form-${f.name}`,
                  class: "field-label"
                }, [
                  bt(ee(f.label) + " ", 1),
                  f.required ? (E(), R("span", Jh, "*")) : re("", !0)
                ], 8, Xh),
                f.type === "text" || f.type === "email" || f.type === "tel" ? (E(), R("input", {
                  key: 0,
                  id: `fullscreen-form-${f.name}`,
                  type: f.type,
                  placeholder: f.placeholder || "",
                  required: f.required,
                  minlength: f.minLength,
                  maxlength: f.maxLength,
                  value: Ye.value[f.name] || "",
                  onInput: (ne) => gt(f.name, ne.target.value),
                  onBlur: (ne) => gt(f.name, ne.target.value),
                  class: Me(["form-input", { error: Xe.value[f.name] }]),
                  autocomplete: f.type === "email" ? "email" : f.type === "tel" ? "tel" : "off",
                  inputmode: f.type === "tel" ? "tel" : f.type === "email" ? "email" : "text"
                }, null, 42, Qh)) : f.type === "number" ? (E(), R("input", {
                  key: 1,
                  id: `fullscreen-form-${f.name}`,
                  type: "number",
                  placeholder: f.placeholder || "",
                  required: f.required,
                  min: f.minLength,
                  max: f.maxLength,
                  value: Ye.value[f.name] || "",
                  onInput: (ne) => gt(f.name, ne.target.value),
                  class: Me(["form-input", { error: Xe.value[f.name] }])
                }, null, 42, ed)) : f.type === "textarea" ? (E(), R("textarea", {
                  key: 2,
                  id: `fullscreen-form-${f.name}`,
                  placeholder: f.placeholder || "",
                  required: f.required,
                  minlength: f.minLength,
                  maxlength: f.maxLength,
                  value: Ye.value[f.name] || "",
                  onInput: (ne) => gt(f.name, ne.target.value),
                  class: Me(["form-textarea", { error: Xe.value[f.name] }]),
                  rows: "4"
                }, null, 42, td)) : f.type === "select" ? (E(), R("select", {
                  key: 3,
                  id: `fullscreen-form-${f.name}`,
                  required: f.required,
                  value: Ye.value[f.name] || "",
                  onChange: (ne) => gt(f.name, ne.target.value),
                  class: Me(["form-select", { error: Xe.value[f.name] }])
                }, [
                  b("option", sd, ee(f.placeholder || "Please select..."), 1),
                  (E(!0), R(De, null, St((Array.isArray(f.options) ? f.options : ((Y = f.options) == null ? void 0 : Y.split(`
`)) || []).filter((ne) => ne.trim()), (ne) => (E(), R("option", {
                    key: ne,
                    value: ne.trim()
                  }, ee(ne.trim()), 9, rd))), 128))
                ], 42, nd)) : f.type === "checkbox" ? (E(), R("label", id, [
                  b("input", {
                    id: `fullscreen-form-${f.name}`,
                    type: "checkbox",
                    required: f.required,
                    checked: Ye.value[f.name] || !1,
                    onChange: (ne) => gt(f.name, ne.target.checked),
                    class: "form-checkbox"
                  }, null, 40, od),
                  b("span", ld, ee(f.label), 1)
                ])) : f.type === "radio" ? (E(), R("div", ad, [
                  (E(!0), R(De, null, St((Array.isArray(f.options) ? f.options : ((ce = f.options) == null ? void 0 : ce.split(`
`)) || []).filter((ne) => ne.trim()), (ne) => (E(), R("label", {
                    key: ne,
                    class: "radio-field"
                  }, [
                    b("input", {
                      type: "radio",
                      name: `fullscreen-form-${f.name}`,
                      value: ne.trim(),
                      required: f.required,
                      checked: Ye.value[f.name] === ne.trim(),
                      onChange: (vt) => gt(f.name, ne.trim()),
                      class: "form-radio"
                    }, null, 40, cd),
                    b("span", ud, ee(ne.trim()), 1)
                  ]))), 128))
                ])) : re("", !0),
                Xe.value[f.name] ? (E(), R("div", fd, ee(Xe.value[f.name]), 1)) : re("", !0)
              ]);
            }), 128))
          ]),
          b("div", hd, [
            b("button", {
              onClick: _[2] || (_[2] = () => {
                console.log("Submit button clicked!"), oa();
              }),
              disabled: nt.value,
              class: "submit-form-button",
              style: Ae(x(T))
            }, [
              nt.value ? (E(), R("span", pd, _[23] || (_[23] = [
                b("div", { class: "dot" }, null, -1),
                b("div", { class: "dot" }, null, -1),
                b("div", { class: "dot" }, null, -1)
              ]))) : (E(), R("span", gd, ee(ut.value.submit_button_text || "Submit"), 1))
            ], 12, dd)
          ])
        ]),
        b("div", {
          class: "powered-by-landing",
          style: Ae(x(F))
        }, _[24] || (_[24] = [
          b("svg", {
            class: "chattermate-logo",
            width: "16",
            height: "16",
            viewBox: "0 0 60 60",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg"
          }, [
            b("path", {
              d: "M45 15H15C13.3431 15 12 16.3431 12 18V42C12 43.6569 13.3431 45 15 45H25L30 52L35 45H45C46.6569 45 48 43.6569 48 42V18C48 16.3431 46.6569 15 45 15Z",
              fill: "currentColor",
              opacity: "0.8"
            }),
            b("path", {
              d: "M36 27C36 27 32.5 26 30 26C27.5 26 24 27 24 31C24 35 27.5 36 30 36C32.5 36 36 35 36 35V33C36 33 33 34 31.5 34C30 34 27 33 27 31C27 29 30 28 31.5 28C33 28 36 29 36 29V27Z",
              fill: "currentColor"
            })
          ], -1),
          bt(" Powered by ChatterMate ", -1)
        ]), 4)
      ], 4)) : yi.value ? re("", !0) : (E(), R(De, { key: 6 }, [
        se.value ? (E(), R("div", {
          key: 0,
          class: Me(["chat-panel", { "ask-anything-chat": xt.value }]),
          style: Ae(x(w))
        }, [
          xt.value ? (E(), R("div", {
            key: 1,
            class: "ask-anything-top",
            style: Ae(x(N))
          }, [
            b("div", bd, [
              ls.value || x(P) ? (E(), R("img", {
                key: 0,
                src: ls.value || x(P),
                alt: x(V).human_agent_name || x(o),
                class: "header-avatar"
              }, null, 8, wd)) : re("", !0),
              b("div", kd, [
                b("h3", {
                  style: Ae(x(F))
                }, ee(x(o)), 5),
                b("p", {
                  class: "ask-anything-subtitle",
                  style: Ae(x(F))
                }, ee(x(i).welcome_subtitle || "Ask me anything. I'm here to help."), 5)
              ])
            ])
          ], 4)) : (E(), R("div", {
            key: 0,
            class: "chat-header",
            style: Ae(x(N))
          }, [
            b("div", md, [
              ls.value || x(P) ? (E(), R("img", {
                key: 0,
                src: ls.value || x(P),
                alt: x(V).human_agent_name || x(o),
                class: "header-avatar"
              }, null, 8, _d)) : re("", !0),
              b("div", yd, [
                b("h3", {
                  style: Ae(x(F))
                }, ee(x(V).human_agent_name || x(o)), 5),
                b("div", vd, [
                  _[25] || (_[25] = b("span", { class: "status-indicator online" }, null, -1)),
                  b("span", {
                    class: "status-text",
                    style: Ae(x(F))
                  }, "Online", 4)
                ])
              ])
            ])
          ], 4)),
          x(D) ? (E(), R("div", xd, _[26] || (_[26] = [
            b("div", { class: "loading-spinner" }, [
              b("div", { class: "dot" }),
              b("div", { class: "dot" }),
              b("div", { class: "dot" })
            ], -1)
          ]))) : re("", !0),
          b("div", {
            class: "chat-messages",
            ref_key: "messagesContainer",
            ref: p
          }, [
            (E(!0), R(De, null, St(x(c), (f, Y) => {
              var ce, ne, vt, ge, Ht, bi, wi, ki, xi, Si, Ci, Ti, Ai, Ei, Ri, Ii, Li, Oi, Pi;
              return E(), R("div", {
                key: Y,
                class: Me([
                  "message",
                  f.message_type === "bot" || f.message_type === "agent" ? "agent-message" : f.message_type === "system" ? "system-message" : f.message_type === "rating" ? "rating-message" : f.message_type === "form" ? "form-message" : f.message_type === "product" || f.shopify_output ? "product-message" : "user-message"
                ])
              }, [
                b("div", {
                  class: "message-bubble",
                  style: Ae(f.message_type === "system" || f.message_type === "rating" || f.message_type === "product" || f.shopify_output ? {} : f.message_type === "user" ? x(T) : x(A))
                }, [
                  f.message_type === "rating" ? (E(), R("div", Sd, [
                    b("p", Cd, "Rate the chat session that you had with " + ee(f.agent_name || x(V).human_agent_name || x(o) || "our agent"), 1),
                    b("div", {
                      class: Me(["star-rating", { submitted: Ot.value || f.isSubmitted }])
                    }, [
                      (E(), R(De, null, St(5, (C) => b("button", {
                        key: C,
                        class: Me(["star-button", {
                          warning: C <= (f.isSubmitted ? f.finalRating : Lt.value || f.selectedRating) && (f.isSubmitted ? f.finalRating : Lt.value || f.selectedRating) <= 3,
                          success: C <= (f.isSubmitted ? f.finalRating : Lt.value || f.selectedRating) && (f.isSubmitted ? f.finalRating : Lt.value || f.selectedRating) > 3,
                          selected: C <= (f.isSubmitted ? f.finalRating : Lt.value || f.selectedRating)
                        }]),
                        onMouseover: (zt) => !f.isSubmitted && Ql(C),
                        onMouseleave: (zt) => !f.isSubmitted && ea,
                        onClick: (zt) => !f.isSubmitted && ta(C),
                        disabled: Ot.value || f.isSubmitted
                      }, " ★ ", 42, Td)), 64))
                    ], 2),
                    f.showFeedback && !f.isSubmitted ? (E(), R("div", Ad, [
                      b("div", Ed, [
                        hn(b("input", {
                          "onUpdate:modelValue": (C) => f.feedback = C,
                          placeholder: "Please share your feedback (optional)",
                          disabled: Ot.value,
                          maxlength: "500",
                          class: "feedback-input"
                        }, null, 8, Rd), [
                          [gn, f.feedback]
                        ]),
                        b("div", Id, ee(((ce = f.feedback) == null ? void 0 : ce.length) || 0) + "/500", 1)
                      ]),
                      b("button", {
                        onClick: (C) => na(f.session_id, Lt.value, f.feedback),
                        disabled: Ot.value || !Lt.value,
                        class: "submit-rating-button",
                        style: Ae({ backgroundColor: x(i).accent_color || "var(--primary-color)" })
                      }, ee(Ot.value ? "Submitting..." : "Submit Rating"), 13, Ld)
                    ])) : re("", !0),
                    f.isSubmitted && f.finalFeedback ? (E(), R("div", Od, [
                      b("div", Pd, [
                        b("p", $d, ee(f.finalFeedback), 1)
                      ])
                    ])) : f.isSubmitted ? (E(), R("div", Fd, " Thank you for your rating! ")) : re("", !0)
                  ])) : f.message_type === "form" ? (E(), R("div", Bd, [
                    (vt = (ne = f.attributes) == null ? void 0 : ne.form_data) != null && vt.title || (Ht = (ge = f.attributes) == null ? void 0 : ge.form_data) != null && Ht.description ? (E(), R("div", Nd, [
                      (wi = (bi = f.attributes) == null ? void 0 : bi.form_data) != null && wi.title ? (E(), R("h3", Md, ee(f.attributes.form_data.title), 1)) : re("", !0),
                      (xi = (ki = f.attributes) == null ? void 0 : ki.form_data) != null && xi.description ? (E(), R("p", Dd, ee(f.attributes.form_data.description), 1)) : re("", !0)
                    ])) : re("", !0),
                    b("div", qd, [
                      (E(!0), R(De, null, St((Ci = (Si = f.attributes) == null ? void 0 : Si.form_data) == null ? void 0 : Ci.fields, (C) => {
                        var zt, Ys;
                        return E(), R("div", {
                          key: C.name,
                          class: "form-field"
                        }, [
                          b("label", {
                            for: `form-${C.name}`,
                            class: "field-label"
                          }, [
                            bt(ee(C.label) + " ", 1),
                            C.required ? (E(), R("span", Hd, "*")) : re("", !0)
                          ], 8, Ud),
                          C.type === "text" || C.type === "email" || C.type === "tel" ? (E(), R("input", {
                            key: 0,
                            id: `form-${C.name}`,
                            type: C.type,
                            placeholder: C.placeholder || "",
                            required: C.required,
                            minlength: C.minLength,
                            maxlength: C.maxLength,
                            value: Ye.value[C.name] || "",
                            onInput: (xe) => gt(C.name, xe.target.value),
                            onBlur: (xe) => gt(C.name, xe.target.value),
                            class: Me(["form-input", { error: Xe.value[C.name] }]),
                            disabled: nt.value,
                            autocomplete: C.type === "email" ? "email" : C.type === "tel" ? "tel" : "off",
                            inputmode: C.type === "tel" ? "tel" : C.type === "email" ? "email" : "text"
                          }, null, 42, zd)) : C.type === "number" ? (E(), R("input", {
                            key: 1,
                            id: `form-${C.name}`,
                            type: "number",
                            placeholder: C.placeholder || "",
                            required: C.required,
                            min: C.min,
                            max: C.max,
                            value: Ye.value[C.name] || "",
                            onInput: (xe) => gt(C.name, xe.target.value),
                            class: Me(["form-input", { error: Xe.value[C.name] }]),
                            disabled: nt.value
                          }, null, 42, Vd)) : C.type === "textarea" ? (E(), R("textarea", {
                            key: 2,
                            id: `form-${C.name}`,
                            placeholder: C.placeholder || "",
                            required: C.required,
                            minlength: C.minLength,
                            maxlength: C.maxLength,
                            value: Ye.value[C.name] || "",
                            onInput: (xe) => gt(C.name, xe.target.value),
                            class: Me(["form-textarea", { error: Xe.value[C.name] }]),
                            disabled: nt.value,
                            rows: "3"
                          }, null, 42, Wd)) : C.type === "select" ? (E(), R("select", {
                            key: 3,
                            id: `form-${C.name}`,
                            required: C.required,
                            value: Ye.value[C.name] || "",
                            onChange: (xe) => gt(C.name, xe.target.value),
                            class: Me(["form-select", { error: Xe.value[C.name] }]),
                            disabled: nt.value
                          }, [
                            b("option", Kd, ee(C.placeholder || "Select an option"), 1),
                            (E(!0), R(De, null, St((Array.isArray(C.options) ? C.options : ((zt = C.options) == null ? void 0 : zt.split(`
`)) || []).filter((xe) => xe.trim()), (xe) => (E(), R("option", {
                              key: xe.trim(),
                              value: xe.trim()
                            }, ee(xe.trim()), 9, Zd))), 128))
                          ], 42, jd)) : C.type === "checkbox" ? (E(), R("div", Gd, [
                            b("input", {
                              id: `form-${C.name}`,
                              type: "checkbox",
                              checked: Ye.value[C.name] || !1,
                              onChange: (xe) => gt(C.name, xe.target.checked),
                              class: "form-checkbox",
                              disabled: nt.value
                            }, null, 40, Yd),
                            b("label", {
                              for: `form-${C.name}`,
                              class: "checkbox-label"
                            }, ee(C.placeholder || C.label), 9, Xd)
                          ])) : C.type === "radio" ? (E(), R("div", Jd, [
                            (E(!0), R(De, null, St((Array.isArray(C.options) ? C.options : ((Ys = C.options) == null ? void 0 : Ys.split(`
`)) || []).filter((xe) => xe.trim()), (xe) => (E(), R("div", {
                              key: xe.trim(),
                              class: "radio-option"
                            }, [
                              b("input", {
                                id: `form-${C.name}-${xe.trim()}`,
                                name: `form-${C.name}`,
                                type: "radio",
                                value: xe.trim(),
                                checked: Ye.value[C.name] === xe.trim(),
                                onChange: (_g) => gt(C.name, xe.trim()),
                                class: "form-radio",
                                disabled: nt.value
                              }, null, 40, Qd),
                              b("label", {
                                for: `form-${C.name}-${xe.trim()}`,
                                class: "radio-label"
                              }, ee(xe.trim()), 9, ep)
                            ]))), 128))
                          ])) : re("", !0),
                          Xe.value[C.name] ? (E(), R("div", tp, ee(Xe.value[C.name]), 1)) : re("", !0)
                        ]);
                      }), 128))
                    ]),
                    b("div", np, [
                      b("button", {
                        onClick: () => {
                          var C;
                          console.log("Regular form submit button clicked!"), ra((C = f.attributes) == null ? void 0 : C.form_data);
                        },
                        disabled: nt.value,
                        class: "form-submit-button",
                        style: Ae(x(T))
                      }, ee(nt.value ? "Submitting..." : ((Ai = (Ti = f.attributes) == null ? void 0 : Ti.form_data) == null ? void 0 : Ai.submit_button_text) || "Submit"), 13, sp)
                    ])
                  ])) : f.message_type === "user_input" ? (E(), R("div", rp, [
                    (Ei = f.attributes) != null && Ei.prompt_message && f.attributes.prompt_message.trim() ? (E(), R("div", ip, ee(f.attributes.prompt_message), 1)) : re("", !0),
                    f.isSubmitted ? (E(), R("div", cp, [
                      _[27] || (_[27] = b("strong", null, "Your input:", -1)),
                      bt(" " + ee(f.submittedValue) + " ", 1),
                      (Ri = f.attributes) != null && Ri.confirmation_message && f.attributes.confirmation_message.trim() ? (E(), R("div", up, ee(f.attributes.confirmation_message), 1)) : re("", !0)
                    ])) : (E(), R("div", op, [
                      hn(b("textarea", {
                        "onUpdate:modelValue": (C) => f.userInputValue = C,
                        class: "user-input-textarea",
                        placeholder: "Type your message here...",
                        rows: "3",
                        onKeydown: [
                          ao(Sn((C) => Gs(f), ["ctrl"]), ["enter"]),
                          ao(Sn((C) => Gs(f), ["meta"]), ["enter"])
                        ]
                      }, null, 40, lp), [
                        [gn, f.userInputValue]
                      ]),
                      b("button", {
                        class: "user-input-submit-button",
                        onClick: (C) => Gs(f),
                        disabled: !f.userInputValue || !f.userInputValue.trim()
                      }, " Submit ", 8, ap)
                    ]))
                  ])) : f.shopify_output || f.message_type === "product" ? (E(), R("div", fp, [
                    f.message ? (E(), R("div", {
                      key: 0,
                      innerHTML: x(ye)(((Li = (Ii = f.shopify_output) == null ? void 0 : Ii.products) == null ? void 0 : Li.length) > 0 ? aa(f.message) : f.message, { renderer: x(t) }),
                      class: "product-message-text"
                    }, null, 8, hp)) : re("", !0),
                    (Oi = f.shopify_output) != null && Oi.products && f.shopify_output.products.length > 0 ? (E(), R("div", dp, [
                      _[29] || (_[29] = b("h3", { class: "carousel-title" }, "Products", -1)),
                      b("div", pp, [
                        (E(!0), R(De, null, St(f.shopify_output.products, (C) => {
                          var zt;
                          return E(), R("div", {
                            key: C.id,
                            class: "product-card-compact carousel-item"
                          }, [
                            (zt = C.image) != null && zt.src ? (E(), R("div", gp, [
                              b("img", {
                                src: C.image.src,
                                alt: C.title,
                                class: "product-thumbnail"
                              }, null, 8, mp)
                            ])) : re("", !0),
                            b("div", _p, [
                              b("div", yp, [
                                b("div", vp, ee(C.title), 1),
                                C.variant_title && C.variant_title !== "Default Title" ? (E(), R("div", bp, ee(C.variant_title), 1)) : re("", !0),
                                b("div", wp, ee(C.price_formatted || x(h)(C.price, C.currency)), 1)
                              ]),
                              b("div", kp, [
                                b("button", {
                                  class: "view-details-button-compact",
                                  onClick: (Ys) => {
                                    var xe;
                                    return la(C, (xe = f.shopify_output) == null ? void 0 : xe.shop_domain);
                                  }
                                }, _[28] || (_[28] = [
                                  bt(" View product ", -1),
                                  b("span", { class: "external-link-icon" }, "↗", -1)
                                ]), 8, xp)
                              ])
                            ])
                          ]);
                        }), 128))
                      ])
                    ])) : !f.message && ((Pi = f.shopify_output) != null && Pi.products) && f.shopify_output.products.length === 0 ? (E(), R("div", Sp, _[30] || (_[30] = [
                      b("p", null, "No products found.", -1)
                    ]))) : !f.message && f.shopify_output && !f.shopify_output.products ? (E(), R("div", Cp, _[31] || (_[31] = [
                      b("p", null, "No products to display.", -1)
                    ]))) : re("", !0)
                  ])) : (E(), R(De, { key: 4 }, [
                    b("div", {
                      innerHTML: x(ye)(f.message, { renderer: x(t) })
                    }, null, 8, Tp),
                    f.attachments && f.attachments.length > 0 ? (E(), R("div", Ap, [
                      (E(!0), R(De, null, St(f.attachments, (C) => (E(), R("div", {
                        key: C.id,
                        class: "attachment-item"
                      }, [
                        x(ke)(C.content_type) ? (E(), R("div", Ep, [
                          b("img", {
                            src: x(he)(C.file_url),
                            alt: C.filename,
                            class: "attachment-image",
                            onClick: Sn((zt) => x(O)({ url: C.file_url, filename: C.filename, type: C.content_type, file_url: x(he)(C.file_url), size: void 0 }), ["stop"]),
                            style: { cursor: "pointer" }
                          }, null, 8, Rp),
                          b("div", Ip, [
                            b("a", {
                              href: x(he)(C.file_url),
                              target: "_blank",
                              class: "attachment-link"
                            }, [
                              _[32] || (_[32] = b("svg", {
                                width: "14",
                                height: "14",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                stroke: "currentColor",
                                "stroke-width": "2",
                                "stroke-linecap": "round",
                                "stroke-linejoin": "round"
                              }, [
                                b("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
                                b("polyline", { points: "7 10 12 15 17 10" }),
                                b("line", {
                                  x1: "12",
                                  y1: "15",
                                  x2: "12",
                                  y2: "3"
                                })
                              ], -1)),
                              bt(" " + ee(C.filename) + " ", 1),
                              b("span", Op, "(" + ee(x(ae)(C.file_size)) + ")", 1)
                            ], 8, Lp)
                          ])
                        ])) : (E(), R("a", {
                          key: 1,
                          href: x(he)(C.file_url),
                          target: "_blank",
                          class: "attachment-link"
                        }, [
                          _[33] || (_[33] = b("svg", {
                            width: "14",
                            height: "14",
                            viewBox: "0 0 24 24",
                            fill: "none",
                            stroke: "currentColor",
                            "stroke-width": "2",
                            "stroke-linecap": "round",
                            "stroke-linejoin": "round"
                          }, [
                            b("path", { d: "M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" })
                          ], -1)),
                          bt(" " + ee(C.filename) + " ", 1),
                          b("span", $p, "(" + ee(x(ae)(C.file_size)) + ")", 1)
                        ], 8, Pp))
                      ]))), 128))
                    ])) : re("", !0)
                  ], 64))
                ], 4),
                b("div", Fp, [
                  f.message_type === "user" ? (E(), R("span", Bp, " You ")) : re("", !0)
                ])
              ], 2);
            }), 128)),
            x(v) ? (E(), R("div", Np, _[34] || (_[34] = [
              b("div", { class: "dot" }, null, -1),
              b("div", { class: "dot" }, null, -1),
              b("div", { class: "dot" }, null, -1)
            ]))) : re("", !0)
          ], 512),
          pi.value ? (E(), R("div", {
            key: 4,
            class: "new-conversation-section",
            style: Ae(x(A))
          }, [
            b("div", Qp, [
              _[39] || (_[39] = b("p", { class: "ended-text" }, "This chat has ended.", -1)),
              b("button", {
                class: "start-new-conversation-button",
                style: Ae(x(T)),
                onClick: ha
              }, " Click here to start a new conversation ", 4)
            ])
          ], 4)) : (E(), R("div", {
            key: 3,
            class: Me(["chat-input", { "ask-anything-input": xt.value }]),
            style: Ae(x(A))
          }, [
            !x(H) && !Re.value && !xt.value ? (E(), R("div", Mp, [
              hn(b("input", {
                "onUpdate:modelValue": _[3] || (_[3] = (f) => K.value = f),
                type: "email",
                placeholder: "Enter your email address to begin",
                disabled: x(v) || x(oe) !== "connected",
                class: Me({
                  invalid: K.value.trim() && !x(Mn)(K.value.trim()),
                  disabled: x(oe) !== "connected"
                })
              }, null, 10, Dp), [
                [gn, K.value]
              ])
            ])) : re("", !0),
            b("input", {
              ref_key: "fileInputRef",
              ref: Z,
              type: "file",
              accept: ug,
              multiple: "",
              style: { display: "none" },
              onChange: _[4] || (_[4] = //@ts-ignore
              (...f) => x(Oe) && x(Oe)(...f))
            }, null, 544),
            x(B).length > 0 ? (E(), R("div", qp, [
              (E(!0), R(De, null, St(x(B), (f, Y) => (E(), R("div", {
                key: Y,
                class: "file-preview-widget"
              }, [
                b("div", Up, [
                  x(_e)(f.type) ? (E(), R("img", {
                    key: 0,
                    src: x(je)(f),
                    alt: f.filename,
                    class: "file-preview-image-widget",
                    onClick: Sn((ce) => x(O)(f), ["stop"]),
                    style: { cursor: "pointer" }
                  }, null, 8, Hp)) : (E(), R("div", {
                    key: 1,
                    class: "file-preview-icon-widget",
                    onClick: Sn((ce) => x(O)(f), ["stop"]),
                    style: { cursor: "pointer" }
                  }, _[35] || (_[35] = [
                    b("svg", {
                      width: "20",
                      height: "20",
                      viewBox: "0 0 24 24",
                      fill: "none",
                      stroke: "currentColor",
                      "stroke-width": "2"
                    }, [
                      b("path", { d: "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" }),
                      b("polyline", { points: "13 2 13 9 20 9" })
                    ], -1)
                  ]), 8, zp))
                ]),
                b("div", Vp, [
                  b("div", Wp, ee(f.filename), 1),
                  b("div", jp, ee(x(ae)(f.size)), 1)
                ]),
                b("button", {
                  type: "button",
                  class: "file-preview-remove-widget",
                  onClick: (ce) => x(k)(Y),
                  title: "Remove file"
                }, " × ", 8, Kp)
              ]))), 128))
            ])) : re("", !0),
            gi.value ? (E(), R("div", Zp, _[36] || (_[36] = [
              b("div", { class: "upload-spinner-widget" }, null, -1),
              b("span", { class: "upload-text-widget" }, "Uploading files...", -1)
            ]))) : re("", !0),
            b("div", Gp, [
              hn(b("input", {
                "onUpdate:modelValue": _[5] || (_[5] = (f) => J.value = f),
                type: "text",
                placeholder: Be.value,
                onKeypress: Qe,
                onInput: q,
                onChange: q,
                onPaste: _[6] || (_[6] = //@ts-ignore
                (...f) => x(S) && x(S)(...f)),
                onDrop: _[7] || (_[7] = //@ts-ignore
                (...f) => x(rt) && x(rt)(...f)),
                onDragover: _[8] || (_[8] = //@ts-ignore
                (...f) => x(u) && x(u)(...f)),
                onDragleave: _[9] || (_[9] = //@ts-ignore
                (...f) => x(g) && x(g)(...f)),
                disabled: !pe.value,
                class: Me({ disabled: !pe.value, "ask-anything-field": xt.value })
              }, null, 42, Yp), [
                [gn, J.value]
              ]),
              mi.value ? (E(), R("button", {
                key: 0,
                type: "button",
                class: "attach-button",
                disabled: gi.value,
                onClick: _[10] || (_[10] = //@ts-ignore
                (...f) => x(X) && x(X)(...f)),
                title: `Attach files (${x(B).length}/${xo} used) or paste screenshots`
              }, _[37] || (_[37] = [
                b("svg", {
                  width: "22",
                  height: "22",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  xmlns: "http://www.w3.org/2000/svg"
                }, [
                  b("path", {
                    d: "M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48",
                    stroke: "currentColor",
                    "stroke-width": "2.2",
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round"
                  })
                ], -1),
                b("span", { class: "attach-button-glow" }, null, -1)
              ]), 8, Xp)) : re("", !0),
              b("button", {
                class: Me(["send-button", { "ask-anything-send": xt.value }]),
                style: Ae(x(T)),
                onClick: Ee,
                disabled: !J.value.trim() && x(B).length === 0 || !pe.value
              }, _[38] || (_[38] = [
                b("svg", {
                  width: "20",
                  height: "20",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  xmlns: "http://www.w3.org/2000/svg"
                }, [
                  b("path", {
                    d: "M5 12L3 21L21 12L3 3L5 12ZM5 12L13 12",
                    stroke: "currentColor",
                    "stroke-width": "2",
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round"
                  })
                ], -1)
              ]), 14, Jp)
            ])
          ], 6)),
          b("div", {
            class: "powered-by",
            style: Ae(x(F))
          }, _[40] || (_[40] = [
            b("svg", {
              class: "chattermate-logo",
              width: "16",
              height: "16",
              viewBox: "0 0 60 60",
              fill: "none",
              xmlns: "http://www.w3.org/2000/svg"
            }, [
              b("path", {
                d: "M45 15H15C13.3431 15 12 16.3431 12 18V42C12 43.6569 13.3431 45 15 45H25L30 52L35 45H45C46.6569 45 48 43.6569 48 42V18C48 16.3431 46.6569 15 45 15Z",
                fill: "currentColor",
                opacity: "0.8"
              }),
              b("path", {
                d: "M36 27C36 27 32.5 26 30 26C27.5 26 24 27 24 31C24 35 27.5 36 30 36C32.5 36 36 35 36 35V33C36 33 33 34 31.5 34C30 34 27 33 27 31C27 29 30 28 31.5 28C33 28 36 29 36 29V27Z",
                fill: "currentColor"
              })
            ], -1),
            bt(" Powered by ChatterMate ", -1)
          ]), 4)
        ], 6)) : re("", !0)
      ], 64)),
      hi.value ? (E(), R("div", eg, [
        b("div", tg, [
          _[41] || (_[41] = b("h3", null, "Rate your conversation", -1)),
          b("div", ng, [
            (E(), R(De, null, St(5, (f) => b("button", {
              key: f,
              onClick: (Y) => os.value = f,
              class: Me([{ active: f <= os.value }, "star-button"])
            }, " ★ ", 10, sg)), 64))
          ]),
          hn(b("textarea", {
            "onUpdate:modelValue": _[11] || (_[11] = (f) => Ks.value = f),
            placeholder: "Additional feedback (optional)",
            class: "rating-feedback"
          }, null, 512), [
            [gn, Ks.value]
          ]),
          b("div", rg, [
            b("button", {
              onClick: _[12] || (_[12] = (f) => m.submitRating(os.value, Ks.value)),
              disabled: !os.value,
              class: "submit-button",
              style: Ae(x(T))
            }, " Submit ", 12, ig),
            b("button", {
              onClick: _[13] || (_[13] = (f) => hi.value = !1),
              class: "skip-rating"
            }, " Skip ")
          ])
        ])
      ])) : re("", !0),
      x(G) ? (E(), R("div", {
        key: 8,
        class: "preview-modal-overlay",
        onClick: _[16] || (_[16] = //@ts-ignore
        (...f) => x(W) && x(W)(...f))
      }, [
        b("div", {
          class: "preview-modal-content",
          onClick: _[15] || (_[15] = Sn(() => {
          }, ["stop"]))
        }, [
          b("button", {
            class: "preview-modal-close",
            onClick: _[14] || (_[14] = //@ts-ignore
            (...f) => x(W) && x(W)(...f))
          }, "×"),
          x(Q) && x(_e)(x(Q).type) ? (E(), R("div", og, [
            b("img", {
              src: x(je)(x(Q)),
              alt: x(Q).filename,
              class: "preview-modal-image"
            }, null, 8, lg),
            b("div", ag, ee(x(Q).filename), 1)
          ])) : re("", !0)
        ])
      ])) : re("", !0)
    ], 6)) : (E(), R("div", cg));
  }
}), hg = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [s, r] of t)
    n[s] = r;
  return n;
}, dg = /* @__PURE__ */ hg(fg, [["__scopeId", "data-v-6cf16edf"]]);
window.process || (window.process = { env: { NODE_ENV: "production" } });
const pg = new URL(window.location.href), gg = pg.searchParams.get("widget_id") || void 0, mg = Nu(dg, {
  widgetId: gg
});
mg.mount("#app");
